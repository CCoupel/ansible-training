"""Support commun des tests du site HTML (v0.2.0) — stdlib uniquement.

Contrat d'entrée : `build/course.json`, produit par `node tools/dump-course.js` depuis les fichiers
COMMITES du site (jamais de parsing JS en Python). Schéma attendu :

    { "modules": [ { "id": "m02", "num": 2, "title": "...", "day": "J1",
                     "objectives": [ { "html": "...", "ref": [13, 14] }, ... ],
                     "takeaways":  [ { "html": "...", "ref": [...] }, ... ],
                     "slides": [ { "title": "...", "src": [13] | absent,
                                   "extra": true | absent, "notes": "..." | absent,
                                   "blocks": [ { "t": "text", "html": "..." }, ... ] }, ... ] } ] }

Les blocs gardent les noms de champs de CONVENTIONS.md (`t`, `html`, `items`, `code`, `file`,
`quiz` = { q, options, answer, explain, ref }, `img` = { file, alt, caption }...).

Variables d'environnement :
  COURSE_JSON    chemin d'un course.json déjà produit (sinon : `node tools/dump-course.js`)
  PARITY_STRICT  =1 : les 15 modules doivent être présents (CI release) ; sinon seuls les modules
                 présents sont contrôlés (conversion progressive), plus le pilote m02 obligatoire.
  PPTX_PATH      PPTX de référence (défaut : « Ansible Training.pptx » à la racine).
Les messages d'échec citent des numéros (slide, ligne, module) — jamais d'extrait de texte.
"""

import html as _html
import json
import os
import re
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tests" / "slides"))
from pptx_reader import Deck, paragraphs_of, external_targets, _resolve  # noqa: E402

PPTX = Path(os.environ.get("PPTX_PATH", ROOT / "Ansible Training.pptx"))
CONFIG = ROOT / ".claude" / "project-config.json"
EXPECTED = ROOT / "tests" / "slides" / "expected.json"
STRICT = os.environ.get("PARITY_STRICT", "") == "1"

# module -> (première, dernière) slide PPTX, hors slides masquées (plan v0.2.0, découpage en 15 modules)
MODULE_RANGES = {
    "m01": (4, 12), "m02": (13, 29), "m03": (30, 43), "m04": (44, 55), "m05": (56, 67),
    "m06": (68, 81), "m07": (82, 98), "m08": (99, 119), "m09": (120, 134), "m10": (135, 141),
    "m11": (142, 161), "m12": (162, 182), "m13": (183, 192), "m14": (193, 216), "m15": (217, 223),
}
NOTES_SLIDES = [12, 29, 35, 36, 37, 38, 43, 63, 66, 67, 108, 111]  # notes non vides (plan, CA-4.2)


def module_of(n):
    for mid, (a, b) in MODULE_RANGES.items():
        if a <= n <= b:
            return mid
    return None


def expected():
    with open(EXPECTED, encoding="utf-8") as fh:
        d = json.load(fh)
    return int(d["slides"]), [int(x) for x in d["hidden"]]


def hidden_slides():
    return expected()[1]


def config():
    with open(CONFIG, encoding="utf-8") as fh:
        return json.load(fh)


def run(cmd, cwd=None, env=None, timeout=180):
    e = dict(os.environ)
    if env:
        e.update(env)
    return subprocess.run(cmd, cwd=str(cwd or ROOT), env=e, capture_output=True, text=True, timeout=timeout)


def node(*args, cwd=None, env=None):
    return run(["node", *map(str, args)], cwd=cwd, env=env)


def git_files(*paths):
    r = run(["git", "ls-files", "-z", "--", *paths])
    if r.returncode != 0:
        raise AssertionError("git ls-files a échoué")
    return [p for p in r.stdout.split("\0") if p]


# ----------------------------------------------------------------------------- PPTX

_DECK = None


def deck():
    global _DECK
    if _DECK is None:
        _DECK = Deck(str(PPTX))
    return _DECK


def _rel_targets(slide, type_suffix):
    """Cibles internes (parties) des relations de la slide dont le type finit par `type_suffix`."""
    import xml.etree.ElementTree as ET
    out = []
    if not slide.rels_part:
        return out
    ns = "{http://schemas.openxmlformats.org/package/2006/relationships}Relationship"
    for r in ET.fromstring(slide.deck.zip.read(slide.rels_part)).iter(ns):
        if r.get("Type", "").endswith(type_suffix) and r.get("TargetMode") != "External":
            out.append(_resolve(slide.part, r.get("Target", "")))
    return out


def slide_lines(slide):
    """Lignes de texte de la slide PPTX (paragraphes + texte des SmartArt), normalisées, non vides."""
    paras = list(slide.paragraphs)
    for part in _rel_targets(slide, "/diagramData"):
        if part in slide.deck.names:
            paras.extend(paragraphs_of(slide.deck.zip.read(part)))
    return _lines(paras)


def notes_lines(slide):
    return _lines(slide.notes_paragraphs)


def _lines(paras):
    out = []
    for p in paras:
        for ln in p.split("\n"):
            ln = norm(ln)
            if ln:
                out.append(ln)
    return out


def slide_links(slide):
    if not slide.rels_part:
        return []
    return sorted({t.rstrip("/") for t in external_targets(slide.deck.zip.read(slide.rels_part)) if t})


def slide_media(slide):
    """Noms (basename) des images référencées par la slide (relations de type image)."""
    return sorted({p.rsplit("/", 1)[-1] for p in _rel_targets(slide, "/image")})


def pptx_full_text(n):
    s = deck().slide(n)
    return norm(" ".join(slide_lines(s) + notes_lines(s)))


# ----------------------------------------------------------------------------- normalisation

_QUOTES = {"‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-", " ": " ",
           "​": "", "…": "..."}


def norm(s):
    for k, v in _QUOTES.items():
        s = s.replace(k, v)
    return re.sub(r"\s+", " ", s).strip()


_BLOCK_TAG = re.compile(r"(?i)<\s*/?\s*(br|p|li|tr|td|th|div|ul|ol|pre)\b[^>]*>")
_ANY_TAG = re.compile(r"<[^>]+>")


def strip_html(s):
    s = _BLOCK_TAG.sub(" ", s)
    s = _ANY_TAG.sub("", s)
    return _html.unescape(s)


# ----------------------------------------------------------------------------- course.json

_COURSE = None


def course():
    global _COURSE
    if _COURSE is None:
        path = os.environ.get("COURSE_JSON")
        if not path:
            r = node("tools/dump-course.js")
            if r.returncode != 0:
                raise AssertionError("node tools/dump-course.js a échoué (code %d) — le site n'existe pas encore ?"
                                     % r.returncode)
            path = ROOT / "build" / "course.json"
        with open(path, encoding="utf-8") as fh:
            _COURSE = json.load(fh)
    return _COURSE


def modules():
    return {m["id"]: m for m in course().get("modules", [])}


def modules_in_scope():
    """Identifiants de modules à contrôler : tous en mode strict, sinon ceux présents dans course.json."""
    present = [mid for mid, m in modules().items() if m.get("slides")]
    return list(MODULE_RANGES) if STRICT else [m for m in MODULE_RANGES if m in present]


def module_src(m):
    """Union des `src` des slides (non extra) d'un module."""
    out = set()
    for s in m.get("slides", []):
        if not s.get("extra"):
            out.update(s.get("src") or [])
    return out


def slides_for(n, only_present=True):
    """Slides HTML (non extra) dont `src` contient la slide PPTX n."""
    out = []
    for m in modules().values():
        for s in m.get("slides", []):
            if not s.get("extra") and n in (s.get("src") or []):
                out.append(s)
    return out


_SKIP = {"t", "lang", "kind", "answer", "wide", "frag", "layout", "hl", "base", "src", "ref", "extra", "id", "num",
         "emoji", "day", "notes"}


def pieces(obj, raw_ctx=False, out=None):
    """[(texte, brut?)] : textes d'une slide/bloc. `code` et `cmds[i][0]` sont du texte brut (non HTML)."""
    out = [] if out is None else out
    if isinstance(obj, str):
        out.append((obj, raw_ctx))
    elif isinstance(obj, list):
        for x in obj:
            pieces(x, raw_ctx, out)
    elif isinstance(obj, dict):
        t = obj.get("t")
        for k, v in obj.items():
            if k in _SKIP:
                continue
            if t == "code" and k in ("code", "file"):
                pieces(v, True, out)
            elif t == "cmds" and k == "items":
                for it in v:
                    if isinstance(it, list) and it:
                        pieces(it[0], True, out)
                        pieces(it[1:], False, out)
                    else:
                        pieces(it, False, out)
            else:
                pieces(v, raw_ctx, out)
    return out


def html_text(parts):
    """Texte normalisé d'un ensemble de pièces : HTML nettoyé (balises, entités), code tel quel."""
    buf = []
    for text, raw in parts:
        buf.append(norm(text) if raw else norm(strip_html(text)))
    return norm(" ".join(buf))


def slide_html_text(slides):
    parts = []
    for s in slides:
        parts.extend(pieces({"title": s.get("title", ""), "blocks": s.get("blocks", [])}))
    return html_text(parts)


def slide_raw_text(slides):
    """Texte brut concaténé (balises et href conservés) — recherche de liens."""
    parts = []
    for s in slides:
        parts.extend(pieces({"title": s.get("title", ""), "blocks": s.get("blocks", [])}))
    return "\n".join(t for t, _ in parts)


def notes_text(slides):
    buf = []
    for s in slides:
        n = s.get("notes")
        if isinstance(n, list):
            n = "\n".join(str(x) for x in n)
        if n:
            buf.append(strip_html(n) if "<" in n else n)
    return norm(" ".join(buf))


def img_blocks(slides):
    out = []

    def walk(o):
        if isinstance(o, dict):
            if o.get("t") == "img" and o.get("file"):
                out.append(str(o["file"]).rsplit("/", 1)[-1])
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)

    for s in slides:
        walk(s.get("blocks", []))
    return out


def all_strings(obj, out=None):
    out = [] if out is None else out
    if isinstance(obj, str):
        out.append(obj)
    elif isinstance(obj, list):
        for x in obj:
            all_strings(x, out)
    elif isinstance(obj, dict):
        for v in obj.values():
            all_strings(v, out)
    return out


def exceptions():
    p = ROOT / "tests" / "site" / "parity_exceptions.json"
    with open(p, encoding="utf-8") as fh:
        return json.load(fh).get("exceptions", [])


def is_excepted(kind, slide, line=None, media=None, target=None):
    for e in exceptions():
        if e.get("kind") == kind and e.get("slide") == slide:
            if line is not None and e.get("line") not in (None, line):
                continue
            if media is not None and e.get("media") not in (None, media):
                continue
            if kind == "link" and e.get("target") != target:  # exception de lien : cible exacte obligatoire
                continue
            return True
    return False


def images_index():
    """{fichier: {slide:[...], media_origine, sha256}} depuis assets/img/images.json (liste ou dict)."""
    p = ROOT / "assets" / "img" / "images.json"
    with open(p, encoding="utf-8") as fh:
        data = json.load(fh)
    items = data if isinstance(data, list) else [dict(v, fichier=k) for k, v in data.items()]
    out = {}
    for it in items:
        sl = it.get("slide")
        sl = sl if isinstance(sl, list) else [sl]
        out[it["fichier"]] = {"slide": sl, "media_origine": str(it.get("media_origine", "")).rsplit("/", 1)[-1],
                              "sha256": it.get("sha256")}
    return out


class SiteCase(unittest.TestCase):
    """Base : échoue (au lieu de sauter) si le site ou le PPTX est absent."""

    @classmethod
    def setUpClass(cls):
        if not PPTX.is_file():
            raise AssertionError("PPTX de référence introuvable")
