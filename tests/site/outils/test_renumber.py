"""Tests de `tools/renumber.py` (process #5 : insertion de slides → renumérotation outillée) — lot outils.

Chaque test fabrique un dépôt git synthétique dans un dossier temporaire (PPTX minimal avec `<p:sldId id>`,
`slide_index.json`, `expected.json`, `plan.js`, modules, `images.json`, image, test d'obsolescence), commite
l'état « avant », remplace le PPTX par un état « après » NON commité, puis lance l'outil avec `--root`.

Contrat vérifié : codes retour 0 (rien à faire) / 2 (changements en attente ou appliqués) / 1 (erreur) ;
insertion au début, au milieu et à la fin ; refus d'une suppression, d'un réordonnancement ou d'un texte modifié
(rien n'est écrit) ; idempotence (second `--apply` = 0) ; arbre sale refusé ; motifs de code stricts
(commentaires, chaînes, docstrings intouchés) ; décalage des slides masquées ; renommage des images.
Un test final vérifie le vrai dépôt : `--check` = « rien à faire » sur le deck actuel (point de contrôle C0).

Exécution : python3 -m unittest discover -s tests/site/outils -p "test_renumber.py" -v
"""

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TOOL = Path(os.environ.get("RENUMBER_TOOL", ROOT / "tools" / "renumber.py"))  # RENUMBER_TOOL : viser une autre version de l'outil
PPTX_NAME = "Ansible Training.pptx"

NS = ('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"')
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
REL_SLIDE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide"

# Deck « avant » : 8 slides, ids 256..263, la slide 6 est masquée.
OLD = [{"id": 256 + i, "text": "Texte de la slide %d" % (i + 1), "hidden": i == 5} for i in range(8)]


def new_slide(i):
    return {"id": 900 + i, "text": "Gabarit %d" % i, "hidden": False}


def make_pptx(path, slides):
    """PPTX minimal : [Content_Types].xml en premier, presentation.xml avec sldIdLst, une partie par slide."""
    ids = "".join('<p:sldId id="%d" r:id="rId%d"/>' % (s["id"], k) for k, s in enumerate(slides, 1))
    rels = "".join('<Relationship Id="rId%d" Type="%s" Target="slides/slide%d.xml"/>' % (k, REL_SLIDE, s["id"])
                   for k, s in enumerate(slides, 1))
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>')
        z.writestr("ppt/presentation.xml", '<?xml version="1.0"?><p:presentation %s><p:sldIdLst>%s</p:sldIdLst></p:presentation>' % (NS, ids))
        z.writestr("ppt/_rels/presentation.xml.rels", '<?xml version="1.0"?><Relationships xmlns="%s">%s</Relationships>' % (REL_NS, rels))
        for s in slides:
            show = ' show="0"' if s.get("hidden") else ""
            z.writestr("ppt/slides/slide%d.xml" % s["id"],
                       '<?xml version="1.0"?><p:sld %s%s><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>%s</a:t></a:r></a:p>'
                       '</p:txBody></p:sp></p:spTree></p:cSld></p:sld>' % (NS, show, s["text"]))


def index_of(slides):
    return {"slides": [{"id": s["id"], "part": "ppt/slides/slide%d.xml" % s["id"], "hidden": bool(s.get("hidden"))}
                       for s in slides]}


def hidden_of(slides):
    return [i for i, s in enumerate(slides, 1) if s.get("hidden")]


PLAN_JS = """COURSE.plan = [
  { num: 1, id: 'm01', title: 'Un', day: 'J1', range: [1, 4] },
  { num: 2, id: 'm02', title: 'Deux', day: 'J1', range: [5, 8] }
];
"""
MODULE_1 = """COURSE.add({ id: 'm01', num: 1,
  objectives: [ { html: 'Un objectif.', ref: [2] } ],
  slides: [
    { title: 'A', src: [1, 2] },
    // src: [3] (commentaire : ne doit pas changer)
    { title: 'B', src: [3, 4] }
  ] });
"""
MODULE_2 = """COURSE.add({ id: 'm02', num: 2,
  objectives: [ { html: 'Voir src: [8] dans le texte.', ref: [5, 7] } ],
  slides: [
    { title: 'C', src: [5],
      blocks: [ { t: 'img', file: 'assets/img/s005-1.png', alt: 'Schéma' } ] },
    { title: 'D', src: [7, 8] }
  ] });
"""
IMAGES = [{"fichier": "s005-1.png", "slide": 5, "slides": [5], "media_origine": "image9.png", "sha256": "0" * 64}]
PARITY = {"exceptions": [{"slide": 7, "kind": "link", "target": "mailto:x@y", "reason": "justification suffisante ici"}]}
OBSOLESCENCE = '''"""Docstring : voir slide 7 et slides 5 et 6 (prose : jamais touchée)."""
import re

class T:
    def test_a(self):
        # slide 7 en commentaire : intact
        self.present(r"motif 6", [6, 7])
        self.absent(r"motif 5", slides=[5], why="slide 8")
        modules = [5, 6, 8]
        self.assertEqual(bad, [6])
        self.present_any(r"x", [1, 2, 3])
'''


def sha(b):
    return hashlib.sha256(b).hexdigest()


class RenumberCase(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp(prefix="renum-test-"))
        self.addCleanup(shutil.rmtree, self.tmp, True)
        self.repo = self.tmp / "repo"
        self.repo.mkdir()
        self.write("tests/slides/expected.json", json.dumps({"slides": 8, "hidden": [6]}, indent=2) + "\n")
        self.write("tests/slides/slide_index.json", json.dumps(index_of(OLD), indent=1) + "\n")
        self.write("assets/plan.js", PLAN_JS)
        self.write("modules/m01-un.js", MODULE_1)
        self.write("modules/m02-deux.js", MODULE_2)
        self.write("assets/img/images.json", json.dumps(IMAGES, indent=2) + "\n")
        (self.repo / "assets" / "img" / "s005-1.png").write_bytes(b"\x89PNG-fixture")
        self.write("tests/site/parity_exceptions.json", json.dumps(PARITY, indent=2) + "\n")
        self.write("tests/slides/obsolescence/test_obsolescence.py", OBSOLESCENCE)
        make_pptx(self.repo / PPTX_NAME, OLD)
        self.git("init", "-q")
        self.git("add", "-A")
        self.git("-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false",
                 "commit", "-q", "-m", "etat avant")

    # ----- aides
    def write(self, rel, text):
        p = self.repo / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8", newline="")

    def read(self, rel):
        return (self.repo / rel).read_text(encoding="utf-8")

    def json(self, rel):
        return json.loads(self.read(rel))

    def git(self, *args):
        r = subprocess.run(["git", "-C", str(self.repo), *args], capture_output=True, text=True)
        self.assertEqual(r.returncode, 0, r.stderr)
        return r.stdout

    def deck_after(self, slides):
        make_pptx(self.repo / PPTX_NAME, slides)

    def run_tool(self, *args):
        r = subprocess.run([sys.executable, str(TOOL), "--root", str(self.repo), *args],
                           capture_output=True, text=True, timeout=120)
        return r.returncode, r.stdout, r.stderr

    def snapshot(self):
        out = {}
        for p in sorted(self.repo.rglob("*")):
            rel = p.relative_to(self.repo).as_posix()
            if p.is_file() and not rel.startswith((".git/", "build/")):
                out[rel] = sha(p.read_bytes())
        return out

    def inserted(self, after, count):
        """Deck « après » : `count` gabarits insérés après la position `after` (0 = au début)."""
        news = [new_slide(after * 10 + k) for k in range(count)]
        return OLD[:after] + news + OLD[after:]

    @staticmethod
    def shift(n, after, count):
        return n + count if n > after else n


class TestInsertions(RenumberCase):
    def check_insertion(self, after, count):
        deck = self.inserted(after, count)
        self.deck_after(deck)
        sh = lambda n: self.shift(n, after, count)  # noqa: E731
        before = self.snapshot()

        # --check : changements en attente, aucune écriture hors build/
        rc, out, err = self.run_tool("--check")
        self.assertEqual(rc, 2, out + err)
        self.assertEqual(self.snapshot(), before, "--check ne doit rien modifier")
        self.assertTrue((self.repo / "build" / "renumber-plan.md").is_file(), "rapport build/renumber-plan.md attendu")

        # --apply
        rc, out, err = self.run_tool("--apply")
        self.assertEqual(rc, 2, out + err)
        m1, m2 = self.read("modules/m01-un.js"), self.read("modules/m02-deux.js")
        self.assertIn("ref: [%d]" % sh(2), m1)
        self.assertIn("src: [%d, %d]" % (sh(1), sh(2)), m1)
        self.assertIn("src: [%d, %d]" % (sh(3), sh(4)), m1)
        self.assertIn("// src: [3] (commentaire", m1, "un commentaire n'est jamais réécrit")
        self.assertIn("ref: [%d, %d]" % (sh(5), sh(7)), m2)
        self.assertIn("src: [%d, %d]" % (sh(7), sh(8)), m2)
        plan = self.read("assets/plan.js")
        self.assertIn("range: [%d, %d]" % (sh(1), sh(4)), plan)
        self.assertIn("range: [%d, %d]" % (sh(5), sh(8)), plan)
        exp = self.json("tests/slides/expected.json")
        self.assertEqual(exp, {"slides": 8 + count, "hidden": hidden_of(deck)})
        self.assertEqual(self.json("tests/slides/slide_index.json"), index_of(deck))
        self.assertEqual(self.json("tests/site/parity_exceptions.json")["exceptions"][0]["slide"], sh(7))

        # images : fichier renommé, déclaration et référence suivent
        new_img = "s%03d-1.png" % sh(5)
        if sh(5) != 5:
            self.assertFalse((self.repo / "assets/img/s005-1.png").exists())
            self.assertEqual((self.repo / "assets/img" / new_img).read_bytes(), b"\x89PNG-fixture")
            self.assertIn(new_img, m2)
            decl = self.json("assets/img/images.json")[0]
            self.assertEqual((decl["fichier"], decl["slide"], decl["slides"]), (new_img, sh(5), [sh(5)]))
        else:
            self.assertTrue((self.repo / "assets/img/s005-1.png").exists())

        # obsolescence : seules les listes d'entiers des appels et `modules = [...]` bougent
        obs = self.read("tests/slides/obsolescence/test_obsolescence.py")
        self.assertIn("[%d, %d])" % (sh(6), sh(7)), obs)
        self.assertIn("slides=[%d]" % sh(5), obs)
        self.assertIn("modules = [%d, %d, %d]" % (sh(5), sh(6), sh(8)), obs)
        self.assertIn('"""Docstring : voir slide 7 et slides 5 et 6', obs)
        self.assertIn("# slide 7 en commentaire : intact", obs)
        self.assertIn('r"motif 6"', obs)
        self.assertIn("self.assertEqual(bad, [6])", obs)
        self.assertIn('why="slide 8"', obs)
        self.assertIn("present_any(r\"x\", [%d, %d, %d])" % (sh(1), sh(2), sh(3)), obs)

        # idempotence : l'index est à jour, un second passage ne fait rien
        committed = self.snapshot()
        for mode in ("--apply", "--check"):
            self.git("add", "-A")
            self.git("-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false",
                     "commit", "-q", "-m", "renumerotation", "--allow-empty")
            rc, out, err = self.run_tool(mode)
            self.assertEqual(rc, 0, "second %s : %s" % (mode, out + err))
            self.assertEqual(self.snapshot(), committed, "second %s ne doit rien modifier" % mode)

    def test_insertion_au_debut(self):
        self.check_insertion(after=0, count=2)

    def test_insertion_au_milieu(self):
        self.check_insertion(after=4, count=2)

    def test_insertion_a_la_fin_ne_decale_rien(self):
        deck = self.inserted(8, 3)
        self.deck_after(deck)
        rc, out, err = self.run_tool("--apply")
        self.assertEqual(rc, 2, out + err)
        self.assertEqual(self.read("modules/m01-un.js"), MODULE_1)
        self.assertEqual(self.read("modules/m02-deux.js"), MODULE_2)
        self.assertEqual(self.read("assets/plan.js"), PLAN_JS)
        self.assertTrue((self.repo / "assets/img/s005-1.png").exists())
        self.assertEqual(self.json("tests/slides/expected.json"), {"slides": 11, "hidden": [6]})
        self.assertEqual(self.json("tests/slides/slide_index.json"), index_of(deck))

    def test_slide_masquee_suit_son_id(self):
        deck = self.inserted(2, 3)
        self.deck_after(deck)
        rc, out, err = self.run_tool("--apply")
        self.assertEqual(rc, 2, out + err)
        self.assertEqual(self.json("tests/slides/expected.json")["hidden"], [9])
        self.assertEqual([i for i, s in enumerate(self.json("tests/slides/slide_index.json")["slides"], 1) if s["hidden"]], [9])

    def test_plusieurs_insertions_simultanees(self):
        deck = OLD[:2] + [new_slide(1)] + OLD[2:5] + [new_slide(2), new_slide(3)] + OLD[5:]
        self.deck_after(deck)
        rc, out, err = self.run_tool("--apply")
        self.assertEqual(rc, 2, out + err)
        self.assertEqual(self.json("tests/slides/slide_index.json"), index_of(deck))
        # mapping : 1,2 → 1,2 ; 3,4,5 → 4,5,6 ; 6,7,8 → 9,10,11
        m1, m2 = self.read("modules/m01-un.js"), self.read("modules/m02-deux.js")
        self.assertIn("src: [1, 2]", m1)
        self.assertIn("src: [4, 5]", m1)
        self.assertIn("{ title: 'C', src: [6]", m2)
        self.assertIn("{ title: 'D', src: [10, 11]", m2)
        self.assertIn("range: [1, 5]", self.read("assets/plan.js"))
        self.assertIn("range: [6, 11]", self.read("assets/plan.js"))
        self.assertTrue((self.repo / "assets/img/s006-1.png").is_file())


class TestRefus(RenumberCase):
    def assert_refuse(self, deck, fragment):
        self.deck_after(deck)
        before = self.snapshot()
        for mode in ("--check", "--apply"):
            rc, out, err = self.run_tool(mode)
            self.assertEqual(rc, 1, "%s : %s" % (mode, out + err))
            self.assertIn(fragment, (out + err).lower())
            self.assertEqual(self.snapshot(), before, "%s : aucun fichier ne doit être modifié" % mode)

    def test_suppression_refusee(self):
        self.assert_refuse(OLD[:3] + OLD[4:], "supprim")

    def test_reordonnancement_refuse(self):
        deck = list(OLD)
        deck[2], deck[3] = deck[3], deck[2]
        self.assert_refuse(deck, "ordonnancement")

    def test_suppression_combinee_a_une_insertion_refusee(self):
        self.assert_refuse(OLD[:3] + [new_slide(1)] + OLD[4:], "supprim")

    def test_texte_modifie_pendant_l_insertion_refuse(self):
        deck = self.inserted(4, 2)
        deck[0] = dict(deck[0], text="Texte différent")
        self.assert_refuse(deck, "texte")

    def test_arbre_sale_refuse_pour_apply(self):
        self.deck_after(self.inserted(4, 2))
        self.write("modules/m01-un.js", MODULE_1 + "// modification non commitée\n")
        before = self.snapshot()
        rc, out, err = self.run_tool("--apply")
        self.assertEqual(rc, 1, out + err)
        self.assertIn("commit", (out + err).lower())
        self.assertEqual(self.snapshot(), before, "aucune écriture sur un arbre sale")

    def test_pptx_introuvable(self):
        rc, out, err = self.run_tool("--check", "--pptx", str(self.tmp / "absent.pptx"))
        self.assertEqual(rc, 1, out + err)

    def test_options_exclusives(self):
        rc, _, _ = self.run_tool("--check", "--apply")
        self.assertNotEqual(rc, 0)


BIG = [{"id": 400 + i, "text": "Grand deck, slide %d" % (i + 1), "hidden": False} for i in range(14)]
BIG_IMAGES = ["s010-1.png", "s010-2.png", "s011-1.png", "s012-1.png", "s012-2.png"]
BIG_MODULE = """COURSE.add({ id: 'm01', num: 1,
  slides: [
    { title: 'Dix', src: [10],
      blocks: [ { t: 'img', file: 'assets/img/s010-1.png', alt: 'a' }, { t: 'img', file: 'assets/img/s010-2.png', alt: 'b' } ] },
    { title: 'Onze', src: [11], blocks: [ { t: 'img', file: 'assets/img/s011-1.png', alt: 'c' } ] },
    { title: 'Douze', src: [12],
      blocks: [ { t: 'img', file: 'assets/img/s012-1.png', alt: 'd' }, { t: 'img', file: 'assets/img/s012-2.png', alt: 'e' } ] }
  ] });
"""


class TestImagesDoubleDecalage(RenumberCase):
    """Régression (revue renumber.py) : images de slides consécutives, plusieurs par slide, décalées de +1 puis +2."""

    def setUp(self):
        super().setUp()
        self.write("tests/slides/expected.json", json.dumps({"slides": 14, "hidden": []}, indent=2) + "\n")
        self.write("tests/slides/slide_index.json", json.dumps(index_of(BIG), indent=1) + "\n")
        self.write("assets/plan.js", "COURSE.plan = [\n  { num: 1, id: 'm01', title: 'Un', day: 'J1', range: [1, 14] }\n];\n")
        self.write("modules/m01-un.js", BIG_MODULE)
        self.write("modules/m02-deux.js", "COURSE.add({ id: 'm02', num: 2, slides: [] });\n")
        (self.repo / "assets/img/s005-1.png").unlink()
        decl = []
        for f in BIG_IMAGES:
            (self.repo / "assets/img" / f).write_bytes(b"PNG:" + f.encode())
            n = int(f[1:4])
            decl.append({"fichier": f, "slide": n, "slides": [n], "media_origine": "x.png", "sha256": "0" * 64})
        self.write("assets/img/images.json", json.dumps(decl, indent=2) + "\n")
        make_pptx(self.repo / PPTX_NAME, BIG)
        self.git("add", "-A")
        self.git("-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false",
                 "commit", "-q", "--amend", "-m", "etat avant (grand deck)")

    def check_images(self, deck, shifts):
        """shifts : {ancien numéro: nouveau numéro} pour 10, 11, 12."""
        self.deck_after(deck)
        rc, out, err = self.run_tool("--apply")
        self.assertEqual(rc, 2, out + err)
        names = sorted(p.name for p in (self.repo / "assets/img").glob("s*.png"))
        expected = sorted("s%03d-%s" % (shifts[int(f[1:4])], f[5:]) for f in BIG_IMAGES)
        self.assertEqual(names, expected, "fichiers PNG renommés exactement, sans collision ni doublon")
        for f in BIG_IMAGES:  # le contenu suit le nom (aucune image écrasée ni échangée)
            new = "s%03d-%s" % (shifts[int(f[1:4])], f[5:])
            self.assertEqual((self.repo / "assets/img" / new).read_bytes(), b"PNG:" + f.encode(), new)
        module = self.read("modules/m01-un.js")
        refs = sorted(__import__("re").findall(r"assets/img/(s\d{3}-\d\.png)", module))
        self.assertEqual(refs, expected)
        decl = {d["fichier"]: d for d in self.json("assets/img/images.json")}
        self.assertEqual(sorted(decl), expected)
        for f in BIG_IMAGES:
            new = "s%03d-%s" % (shifts[int(f[1:4])], f[5:])
            self.assertEqual((decl[new]["slide"], decl[new]["slides"]), (shifts[int(f[1:4])], [shifts[int(f[1:4])]]))
        self.assertIn("src: [%d]" % shifts[10], module)
        self.assertIn("src: [%d]" % shifts[12], module)
        # idempotence : après commit, un second --apply ne change rien
        self.git("add", "-A")
        self.git("-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false",
                 "commit", "-q", "-m", "renumerotation")
        snap = self.snapshot()
        rc, out, err = self.run_tool("--apply")
        self.assertEqual(rc, 0, out + err)
        self.assertEqual(self.snapshot(), snap)

    def test_decalage_uniforme_de_2(self):
        deck = BIG[:9] + [new_slide(1), new_slide(2)] + BIG[9:]
        self.check_images(deck, {10: 12, 11: 13, 12: 14})

    def test_decalage_de_1_puis_de_2(self):
        # une slide avant la 10, une autre entre la 11 et la 12 : 10 et 11 → +1, 12 → +2
        deck = BIG[:9] + [new_slide(1)] + BIG[9:11] + [new_slide(2)] + BIG[11:]
        self.check_images(deck, {10: 11, 11: 12, 12: 14})

    def test_decalage_de_1_seul(self):
        deck = BIG[:9] + [new_slide(1)] + BIG[9:]
        self.check_images(deck, {10: 11, 11: 12, 12: 13})


class TestControleTexteSaute(RenumberCase):
    """Régression : aucun ancien PPTX de l'historique ne correspond à slide_index.json → le contrôle texte est sauté."""

    def setUp(self):
        super().setUp()
        deck = self.inserted(4, 2)
        make_pptx(self.repo / PPTX_NAME, deck)  # le PPTX « après » devient le seul de l'historique
        self.git("add", "-A")
        self.git("-c", "user.name=t", "-c", "user.email=t@example.invalid", "-c", "commit.gpgsign=false",
                 "commit", "-q", "--amend", "-m", "historique sans l'ancien PPTX")
        self.deck = deck

    def test_check_simple_note_sans_changer_le_code_retour(self):
        before = self.snapshot()
        rc, out, err = self.run_tool("--check")
        self.assertEqual(rc, 2, out + err)
        self.assertIn("saut", (out + err).lower(), "la note « contrôle du texte sauté » est attendue")
        self.assertEqual(self.snapshot(), before)

    def test_apply_refuse_sans_option(self):
        before = self.snapshot()
        rc, out, err = self.run_tool("--apply")
        self.assertEqual(rc, 1, out + err)
        self.assertEqual(self.snapshot(), before, "rien n'est écrit quand le contrôle texte est impossible")

    def test_apply_avec_no_text_check_applique(self):
        rc, out, err = self.run_tool("--apply", "--no-text-check")
        self.assertEqual(rc, 2, out + err)
        self.assertEqual(self.json("tests/slides/slide_index.json"), index_of(self.deck))
        self.assertIn("range: [7, 10]", self.read("assets/plan.js"))


class TestPasDeChangement(RenumberCase):
    def test_deck_identique_rien_a_faire(self):
        before = self.snapshot()
        for mode in ("--check", "--apply"):
            rc, out, err = self.run_tool(mode)
            self.assertEqual(rc, 0, out + err)
            self.assertEqual(self.snapshot(), before)


class TestDepotReel(unittest.TestCase):
    """Point de contrôle C0 : sur le deck actuel, rien à renuméroter (index à jour)."""

    @unittest.skipUnless((ROOT / PPTX_NAME).is_file(), "PPTX réel introuvable")
    def test_check_sur_le_deck_actuel_est_sans_changement(self):
        r = subprocess.run([sys.executable, str(TOOL), "--check"], cwd=str(ROOT), capture_output=True, text=True, timeout=300)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)


if __name__ == "__main__":
    unittest.main()
