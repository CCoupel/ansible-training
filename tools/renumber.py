#!/usr/bin/env python3
"""MIT License — Copyright (c) 2026 CCoupel

Renumérotation des références de slides après insertion dans le PPTX (process #5, voir CONVENTIONS.md).

Principe : l'identité d'une slide est l'attribut `id` de <p:sldId> (stable), son numéro est sa position.
`tests/slides/slide_index.json` fige l'ordre connu du deck :
    {"slides": [{"id": 256, "part": "ppt/slides/slide1.xml", "hidden": false}, ...]}
Position dans la liste = numéro de slide utilisé partout dans le dépôt.

Usage : python3 tools/renumber.py [--check | --apply [--no-text-check]] [--root DIR] [--pptx FICHIER]
  --check (défaut)  calcule la correspondance ancien -> nouveau numéro, écrit build/renumber-plan.md
  --apply           applique les réécritures, renomme les images sNNN-k.png, met à jour expected.json puis
                    réécrit slide_index.json EN DERNIER
Codes retour : 0 rien à faire ; 2 changements à appliquer (--check) ou appliqués (--apply) ; 1 erreur.

Garde-fous : insertions seules (suppression/réordonnancement refusés), idempotent (index à jour = identité),
écriture après calcul complet en mémoire, arbre propre exigé pour --apply, motifs de code stricts
(src/ref/range, champs JSON `slide`/`slides`, listes d'entiers des appels present/absent/present_any,
`slides=[...]`, `modules = [...]`), contrôle du texte avant/après via tests/slides/pptx_reader.py.
Python stdlib uniquement.
"""

import argparse
import io
import json
import os
import re
import subprocess
import sys
import tempfile
import tokenize
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(REPO, "tests", "slides"))
import pptx_reader  # noqa: E402

PPTX_NAME = "Ansible Training.pptx"
INDEX_REL = "tests/slides/slide_index.json"
EXPECTED_REL = "tests/slides/expected.json"
PLAN_REL = "assets/plan.js"
IMAGES_REL = "assets/img/images.json"
PARITY_REL = "tests/site/parity_exceptions.json"
OBSOL_DIR = "tests/slides/obsolescence"
PLAN_OUT_REL = "build/renumber-plan.md"
IMG_NAME = re.compile(r"^s(\d{3})-(\d+)\.png$")
NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main"
NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PROSE_FILES = ["CONVENTIONS.md", "README.md", "CLAUDE.md", "CHANGELOG.md"]
PROSE_DIRS = ["tests/procedures", "docs"]


class Fail(Exception):
    pass


# ---------------------------------------------------------------- deck / index

def read_deck(pptx):
    """[{'id', 'part', 'hidden'}] dans l'ordre de présentation + texte par position."""
    deck = pptx_reader.Deck(pptx)
    try:
        root = ET.fromstring(deck.zip.read("ppt/presentation.xml"))
        lst = root.find("{%s}sldIdLst" % NS_P)
        ids = [] if lst is None else [int(e.get("id")) for e in lst]
        if len(ids) != len(deck.slides):
            raise Fail("sldIdLst incohérent avec les slides lues")
        slides = [{"id": i, "part": s.part, "hidden": bool(s.hidden)} for i, s in zip(ids, deck.slides)]
        texts = [s.text + "\n§notes§\n" + s.notes for s in deck.slides]
    finally:
        deck.close()
    return slides, texts


def load_index(path):
    if not os.path.exists(path):
        return None
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        return [{"id": int(s["id"]), "part": s.get("part", ""), "hidden": bool(s.get("hidden", False))}
                for s in data["slides"]]
    except (ValueError, KeyError, TypeError) as e:
        raise Fail("slide_index.json illisible : %s" % e)


def index_json(slides):
    return json.dumps({"slides": slides}, indent=1, ensure_ascii=False) + "\n"


def compute_mapping(old_ids, new_ids):
    """old position (1-based) -> new position ; refuse suppression et réordonnancement."""
    if len(set(new_ids)) != len(new_ids):
        raise Fail("ids de slides en doublon dans le PPTX")
    pos = {i: p for p, i in enumerate(new_ids, 1)}
    missing = [i for i in old_ids if i not in pos]
    if missing:
        raise Fail("slide(s) supprimée(s) (id %s) : suppression non gérée, procédure manuelle" % missing)
    mapping = {}
    last = 0
    for o, i in enumerate(old_ids, 1):
        n = pos[i]
        if n <= last:
            raise Fail("réordonnancement détecté (id %d) : non géré, procédure manuelle" % i)
        last = n
        mapping[o] = n
    return mapping


def git(root, *args, check=True):
    r = subprocess.run(["git", "-C", root] + list(args), capture_output=True)
    if check and r.returncode != 0:
        raise Fail("git %s a échoué : %s" % (" ".join(args), r.stderr.decode("utf-8", "replace").strip()))
    return r


def find_old_deck(root, old_ids):
    """Ancien PPTX (celui dont les ids = slide_index) dans l'historique git ; (texts, source) ou (None, raison)."""
    rel = PPTX_NAME
    log = git(root, "log", "--format=%H", "-n", "30", "--", rel, check=False)
    for sha in log.stdout.decode().split():
        show = git(root, "show", "%s:%s" % (sha, rel), check=False)
        if show.returncode != 0:
            continue
        with tempfile.NamedTemporaryFile(suffix=".pptx", delete=False) as t:
            t.write(show.stdout)
            tmp = t.name
        try:
            slides, texts = read_deck(tmp)
        except Exception:
            continue
        finally:
            os.unlink(tmp)
        if [s["id"] for s in slides] == old_ids:
            return texts, sha[:7]
    return None, "aucun PPTX de l'historique git ne correspond à slide_index.json"


# ---------------------------------------------------------------- réécritures

class Rewriter:
    def __init__(self, mapping, total_old):
        self.m = mapping
        self.total = total_old
        self.log = []  # (fichier, ligne, avant, après)
        self.errors = []

    def num(self, n):
        if n not in self.m:
            self.errors.append("numéro de slide %d hors du deck connu (1-%d)" % (n, self.total))
            return n
        return self.m[n]

    def ints(self, inner, rel, text, offset):
        def sub(mo):
            n = int(mo.group(0))
            new = self.num(n)
            if new != n:
                line = text.count("\n", 0, offset + mo.start()) + 1
                self.log.append((rel, line, n, new))
            return str(new)
        return re.sub(r"\d+", sub, inner)

    def js_module(self, rel, text):
        def sub(mo):
            if "//" in text[text.rfind("\n", 0, mo.start()) + 1:mo.start()]:
                return mo.group(0)  # ligne commentée
            inner = self.ints(mo.group(2), rel, text, mo.start(2))
            return mo.group(1) + inner + mo.group(3)
        return re.sub(r"(\b(?:src|ref)\s*:\s*\[)([\d,\s]*)(\])", sub, text)

    def plan_js(self, rel, text):
        def sub(mo):
            inner = self.ints(mo.group(2), rel, text, mo.start(2))
            return mo.group(1) + inner + mo.group(3)
        return re.sub(r"(\brange\s*:\s*\[)([\d,\s]*)(\])", sub, text)

    def json_fields(self, rel, text, rename_images=False):
        def sub_one(mo):
            n = int(mo.group(2))
            new = self.num(n)
            if new != n:
                self.log.append((rel, text.count("\n", 0, mo.start()) + 1, n, new))
            return mo.group(1) + str(new)
        text = re.sub(r'("slide"\s*:\s*)(\d+)', sub_one, text)

        def sub_list(mo):
            return mo.group(1) + self.ints(mo.group(2), rel, text, mo.start(2)) + mo.group(3)
        return re.sub(r'("slides"\s*:\s*\[)([\d,\s]*)(\])', sub_list, text)

    def obsolescence(self, rel, text):
        """Listes d'entiers dans present/absent/present_any(...), slides=[...], modules = [...] (tokenize)."""
        out = text
        try:
            toks = list(tokenize.generate_tokens(io.StringIO(text).readline))
        except (tokenize.TokenError, IndentationError):
            self.errors.append("%s : tokenisation impossible" % rel)
            return text
        lines = text.splitlines(keepends=True)
        starts = [0]
        for l in lines:
            starts.append(starts[-1] + len(l))
        spans = []  # (start, end) de numéros à remplacer

        def list_at(i):
            """Si toks[i] est '[' d'une liste d'entiers seuls, renvoie (indices NUMBER, index de ']')."""
            j, nums = i + 1, []
            while j < len(toks):
                t = toks[j]
                if t.type == tokenize.NUMBER and t.string.isdigit():
                    nums.append(j)
                elif t.type == tokenize.OP and t.string == ",":
                    pass
                elif t.type in (tokenize.NL, tokenize.NEWLINE, tokenize.COMMENT):
                    pass
                elif t.type == tokenize.OP and t.string == "]":
                    return nums, j
                else:
                    return None
                j += 1
            return None

        call_depth = []  # pile de profondeurs de parenthèses des appels suivis
        depth = 0
        for i, t in enumerate(toks):
            if t.type == tokenize.OP and t.string in "([{":
                depth += 1
                if t.string == "(" and i > 0 and toks[i - 1].type == tokenize.NAME and \
                        toks[i - 1].string in ("present", "present_any", "absent"):
                    call_depth.append(depth)
            elif t.type == tokenize.OP and t.string in ")]}":
                if call_depth and depth == call_depth[-1] and t.string == ")":
                    call_depth.pop()
                depth -= 1
            if t.type == tokenize.OP and t.string == "[":
                prev = toks[i - 1] if i else None
                in_call_top = bool(call_depth) and depth - 1 == call_depth[-1]
                is_kw = prev is not None and prev.string == "=" and i >= 2 and toks[i - 2].string in ("slides", "modules")
                if in_call_top or is_kw:
                    r = list_at(i)
                    if r:
                        for j in r[0]:
                            spans.append((toks[j], int(toks[j].string)))
        for t, n in sorted(spans, key=lambda s: s[0].start, reverse=True):
            new = self.num(n)
            if new != n:
                a = starts[t.start[0] - 1] + t.start[1]
                b = starts[t.end[0] - 1] + t.end[1]
                out = out[:a] + str(new) + out[b:]
                self.log.append((rel, t.start[0], n, new))
        return out


def prose_hits(root, mapping, total_old, skip):
    """Mentions en prose à reprendre à la main : lignes contenant 'slide' avec un numéro qui change."""
    changed = {o for o, n in mapping.items() if o != n}
    hits = []
    files = []
    for rel in PROSE_FILES:
        if os.path.isfile(os.path.join(root, rel)):
            files.append(rel)
    for d in PROSE_DIRS:
        for dp, _dn, fn in os.walk(os.path.join(root, d)):
            if os.sep + "plans" in dp or "_work" in dp:
                continue  # historique : non modifié
            for f in fn:
                if f.endswith(".md"):
                    files.append(os.path.relpath(os.path.join(dp, f), root).replace(os.sep, "/"))
    obs = os.path.join(root, OBSOL_DIR)
    for f in sorted(os.listdir(obs)) if os.path.isdir(obs) else []:
        if f.endswith(".py"):
            files.append("%s/%s" % (OBSOL_DIR, f))
    for rel in files:
        if rel in skip:
            continue
        try:
            with open(os.path.join(root, rel), encoding="utf-8") as fh:
                lines = fh.read().splitlines()
        except (OSError, UnicodeDecodeError):
            continue
        for k, line in enumerate(lines, 1):
            if not re.search(r"slides?|diapo", line, re.I):
                continue
            nums = sorted({int(x) for x in re.findall(r"\b\d{1,3}\b", line)} & changed)
            if nums:
                hits.append((rel, k, ", ".join("%d→%d" % (n, mapping[n]) for n in nums), line.strip()[:110]))
    return hits


# ---------------------------------------------------------------- principal

def write_atomic(path, text):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=os.path.dirname(path) or ".", prefix=".renum-")
    with os.fdopen(fd, "w", encoding="utf-8", newline="") as f:
        f.write(text)
    os.replace(tmp, path)


def run(root, pptx, apply, no_text_check=False):
    root = os.path.abspath(root)
    pptx = pptx or os.path.join(root, PPTX_NAME)
    if not os.path.isfile(pptx):
        raise Fail("PPTX introuvable : %s" % pptx)
    new_slides, new_texts = read_deck(pptx)
    index_path = os.path.join(root, INDEX_REL)
    old_slides = load_index(index_path)
    initial = old_slides is None
    if initial:
        old_slides = new_slides
    old_ids = [s["id"] for s in old_slides]
    new_ids = [s["id"] for s in new_slides]
    mapping = compute_mapping(old_ids, new_ids)
    total_old = len(old_ids)
    shifted = any(o != n for o, n in mapping.items())

    # contrôle du texte avant/après
    notes = []
    if shifted:
        old_texts, src = find_old_deck(root, old_ids)
        if old_texts is None:
            if apply and not no_text_check:
                raise Fail("contrôle du texte avant/après impossible (%s) ; --apply refusé. "
                           "Si le risque est assumé : relancer avec --no-text-check" % src)
            notes.append("contrôle du texte avant/après SAUTÉ : %s" % src)
        else:
            bad = [o for o, n in mapping.items() if old_texts[o - 1] != new_texts[n - 1]]
            if bad:
                raise Fail("le texte de la slide %s a changé pendant l'insertion (comparaison avec %s) : "
                           "insérer des gabarits d'abord, modifier le contenu ensuite" % (bad[:5], src))
            notes.append("texte vérifié identique pour les %d slides déplacées/conservées (ancien PPTX : %s)" % (total_old, src))

    rw = Rewriter(mapping, total_old)
    new_files = {}  # rel -> nouveau texte
    old_files = {}

    def read(rel):
        p = os.path.join(root, rel)
        if not os.path.isfile(p):
            return None
        with open(p, encoding="utf-8", newline="") as f:
            return f.read()

    if shifted:
        mdir = os.path.join(root, "modules")
        for f in sorted(os.listdir(mdir)) if os.path.isdir(mdir) else []:
            if re.match(r"^m\d{2}-.*\.js$", f):
                rel = "modules/" + f
                old_files[rel] = read(rel)
                new_files[rel] = rw.js_module(rel, old_files[rel])
        for rel, fn in ((PLAN_REL, rw.plan_js), (IMAGES_REL, rw.json_fields), (PARITY_REL, rw.json_fields)):
            t = read(rel)
            if t is not None:
                old_files[rel] = t
                new_files[rel] = fn(rel, t)
        odir = os.path.join(root, OBSOL_DIR)
        for f in sorted(os.listdir(odir)) if os.path.isdir(odir) else []:
            if f.endswith(".py"):
                rel = "%s/%s" % (OBSOL_DIR, f)
                old_files[rel] = read(rel)
                new_files[rel] = rw.obsolescence(rel, old_files[rel])

    # renommage des images sNNN-k.png
    renames = []
    img_dir = os.path.join(root, "assets", "img")
    if shifted and os.path.isdir(img_dir):
        for f in sorted(os.listdir(img_dir)):
            mo = IMG_NAME.match(f)
            if mo and int(mo.group(1)) in mapping and mapping[int(mo.group(1))] != int(mo.group(1)):
                renames.append((f, "s%03d-%s.png" % (mapping[int(mo.group(1))], mo.group(2))))
        moving = {a for a, _ in renames}
        for a, b in renames:
            if os.path.exists(os.path.join(img_dir, b)) and b not in moving:
                rw.errors.append("renommage d'image %s -> %s : la cible existe déjà" % (a, b))
        if renames:
            for rel in list(new_files):
                if rel.startswith("modules/") or rel == IMAGES_REL:
                    t = new_files[rel]
                    # une seule passe (dictionnaire ancien -> nouveau) : jamais de double décalage
                    ren = dict(renames)
                    pat = r"(?<![\w-])(?:%s)(?![\w-])" % "|".join(
                        re.escape(a) for a in sorted(ren, key=len, reverse=True))
                    new_files[rel] = re.sub(pat, lambda mo: ren[mo.group(0)], t)

    rw.log.sort(key=lambda e: (e[0], e[1]))
    if rw.errors:
        raise Fail("; ".join(sorted(set(rw.errors))[:5]))

    # plages de plan.js : contiguïté
    gaps = []
    if PLAN_REL in new_files:
        ranges = [(int(a), int(b)) for a, b in re.findall(r"range\s*:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]", new_files[PLAN_REL])]
        for (a1, b1), (a2, b2) in zip(ranges, ranges[1:]):
            if a2 != b1 + 1:
                gaps.append((b1 + 1, a2 - 1))
        for a, b in ranges:
            if a > b:
                raise Fail("plage de plan.js incohérente après renumérotation : [%d, %d]" % (a, b))
        if gaps:
            notes.append("trous dans les plages de plan.js (slides insérées, module à ajouter à plan.js) : %s"
                         % ", ".join("%d-%d" % g for g in gaps))
    # cardinalité des src par module
    for rel, t in new_files.items():
        if rel.startswith("modules/"):
            a = re.findall(r"\bsrc\s*:\s*\[([\d,\s]*)\]", old_files[rel])
            b = re.findall(r"\bsrc\s*:\s*\[([\d,\s]*)\]", t)
            if sorted(len(x.split(",")) for x in a) != sorted(len(x.split(",")) for x in b):
                raise Fail("%s : cardinalité des src modifiée" % rel)

    # expected.json
    exp_text = read(EXPECTED_REL)
    exp_new = None
    exp_data = {}
    if exp_text is not None:
        try:
            exp_data = json.loads(exp_text)
        except ValueError:
            raise Fail("expected.json illisible")
    new_hidden = [i for i, s in enumerate(new_slides, 1) if s["hidden"]]
    if exp_data.get("slides") != len(new_slides) or exp_data.get("hidden") != new_hidden:
        exp_data["slides"] = len(new_slides)
        exp_data["hidden"] = new_hidden
        exp_new = json.dumps(exp_data, indent=2, ensure_ascii=False)
        exp_new = re.sub(r'("hidden": )\[([^\]]*)\]',
                         lambda m: m.group(1) + "[" + ", ".join(x.strip() for x in m.group(2).split(",") if x.strip()) + "]",
                         exp_new) + "\n"
    index_new = index_json(new_slides)
    index_changed = initial or read(INDEX_REL) != index_new

    pending = shifted or exp_new is not None or index_changed
    prose = prose_hits(root, mapping, total_old, set(new_files)) if shifted else []

    # rapport
    plan_md = os.path.join(root, PLAN_OUT_REL)
    out = ["# Plan de renumérotation", "",
           "Généré par `tools/renumber.py` — non commité.", "",
           "- Slides : %d → %d ; masquées : %s" % (total_old, len(new_slides), new_hidden),
           "- État : %s" % ("INDEX ABSENT (initialisation)" if initial else ("changements en attente" if pending else "rien à faire"))]
    out += ["- " + n for n in notes]
    shifts = {}
    for o, n in mapping.items():
        shifts.setdefault(n - o, []).append(o)
    out += ["", "## Correspondance", ""]
    for d, olds in sorted(shifts.items()):
        out.append("- ancien %d–%d → décalage %+d" % (min(olds), max(olds), d) if len(olds) > 1
                   else "- ancien %d → décalage %+d" % (olds[0], d))
    out += ["", "## Remplacements de code (outil, %d)" % len(rw.log), ""]
    out += ["- `%s:%d` : %d → %d" % e for e in rw.log] or ["- aucun"]
    out += ["", "## Images renommées (%d)" % len(renames), ""]
    out += ["- `%s` → `%s`" % r for r in renames] or ["- aucune"]
    out += ["", "## Mentions en prose à reprendre à la main (%d)" % len(prose), ""]
    out += ["- `%s:%d` [%s] %s" % h for h in prose] or ["- aucune"]
    os.makedirs(os.path.dirname(plan_md), exist_ok=True)
    write_atomic(plan_md, "\n".join(out) + "\n")

    print("slides %d -> %d, masquées %s" % (total_old, len(new_slides), new_hidden))
    print("remplacements de code : %d, images : %d, prose à reprendre : %d" % (len(rw.log), len(renames), len(prose)))
    for n in notes:
        print("note : " + n)
    print("rapport : " + PLAN_OUT_REL)

    if not pending:
        print("rien à faire")
        return 0
    if not apply:
        print("renumérotation en attente : relancer avec --apply")
        return 2

    # --apply : arbre propre
    r = git(root, "rev-parse", "--is-inside-work-tree", check=False)
    if r.returncode != 0:
        raise Fail("--apply exige un dépôt git (contrôle de l'arbre propre)")
    targets = [rel for rel in new_files] + [EXPECTED_REL, INDEX_REL] + \
        ["assets/img/" + a for a, _ in renames]
    dirty = git(root, "status", "--porcelain", "--untracked-files=no", "--", *targets).stdout.decode().strip()
    if dirty:
        raise Fail("modifications non commitées sur les fichiers cibles (commit requis) :\n" + dirty)

    # écriture : contenus, images, expected, index en dernier
    for rel, t in new_files.items():
        if t != old_files[rel]:
            write_atomic(os.path.join(root, rel), t)
    if renames:
        tmp_names = []
        tracked = git(root, "ls-files", "--", "assets/img").stdout.decode().split("\n")
        for k, (a, b) in enumerate(renames):
            t = "assets/img/.renum-%d.tmp" % k
            _mv(root, "assets/img/" + a, t, tracked)
            tmp_names.append((t, b))
        for t, b in tmp_names:
            _mv(root, t, "assets/img/" + b, ["assets/img/" + a for a, _ in renames] + tracked)
    if exp_new is not None:
        write_atomic(os.path.join(root, EXPECTED_REL), exp_new)
    write_atomic(index_path, index_new)
    print("appliqué")
    return 2


def _mv(root, src, dst, tracked):
    if src in tracked or git(root, "ls-files", "--error-unmatch", "--", src, check=False).returncode == 0:
        git(root, "mv", "--", src, dst)
    else:
        os.rename(os.path.join(root, src), os.path.join(root, dst))


def main():
    ap = argparse.ArgumentParser(description="Renumérotation des références de slides après insertion.")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--check", action="store_true", help="calcule et écrit build/renumber-plan.md (défaut)")
    g.add_argument("--apply", action="store_true", help="applique les réécritures")
    ap.add_argument("--root", default=REPO, help="racine du dépôt (défaut : celui de l'outil)")
    ap.add_argument("--no-text-check", action="store_true",
                    help="--apply : accepter l'absence d'ancien PPTX pour le contrôle du texte avant/après")
    ap.add_argument("--pptx", help="PPTX à lire (défaut : <root>/%s)" % PPTX_NAME)
    a = ap.parse_args()
    try:
        return run(a.root, a.pptx, a.apply, a.no_text_check)
    except Fail as e:
        print("ERREUR  renumber : %s" % e, file=sys.stderr)
        return 1
    except Exception as e:  # noqa: BLE001
        print("ERREUR  renumber : %s: %s" % (type(e).__name__, e), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
