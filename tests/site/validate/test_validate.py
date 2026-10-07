"""Tests unitaires de `node tools/validate.js` (issue #3/#4, CA-3.1, CA-4.4) — lot validate.

Chaque test fabrique un module fixture dans un dossier temporaire à partir d'un module valide, lui
applique UNE altération et vérifie le code de sortie (0 = valide, 1 = erreur) : le module valide
sert de témoin (un validateur qui rejette tout passerait sinon les tests d'erreur).
Interface supposée : `node tools/validate.js <fichier.js>...` (comme le cours de référence), sortie
d'erreurs préfixée `ERREUR` sur stderr/stdout et citant le nom du fichier.

Exécution : python3 -m unittest discover -s tests/site -p "test_validate.py" -v
"""

import copy
import json
import os
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402


def valid_module(num=98, src=(13, 14)):
    s = list(src)
    return {
        "id": "m%02d" % num, "num": num, "emoji": "🧪", "title": "Module fixture",
        "tagline": "Accroche.", "duration": "≈ 30 min",
        "objectives": [{"html": "Écrire un inventaire.", "ref": [s[0]]},
                       {"html": "Lire une variable.", "ref": [s[0]]},
                       {"html": "Lancer une commande.", "ref": [s[1]]}],
        "takeaways": [{"html": "Point %d." % i, "ref": [s[0]]} for i in range(4)],
        "slides": [
            {"title": "Contenu", "src": [s[0]], "blocks": [{"t": "text", "html": "Un <b>texte</b>."}]},
            {"title": "Code", "src": [s[1]], "notes": "Note du formateur.",
             "blocks": [{"t": "code", "code": "ansible all -m ping", "lang": "bash"}]},
            {"title": "Quiz", "extra": True, "blocks": [
                {"t": "quiz", "q": "Question ?", "options": ["A", "B", "C"], "answer": 1,
                 "explain": "Parce que (cf. slide %d)." % s[0], "ref": [s[0]]}]},
        ],
    }


def write_module(dirpath, mod, name=None):
    name = name or "m%02d-fixture.js" % mod["num"]
    p = Path(dirpath) / name
    p.write_text("COURSE.add(%s);\n" % json.dumps(mod, ensure_ascii=False, indent=1), encoding="utf-8")
    return p


class TestValidateFixtures(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = self._tmp.name
        self.addCleanup(self._tmp.cleanup)

    def check(self, mod, *more):
        files = [write_module(self.dir, mod)] + [write_module(self.dir, m) for m in more]
        return S.node("tools/validate.js", *files)

    def assert_invalid(self, mod, *more):
        r = self.check(mod, *more)
        self.assertEqual(r.returncode, 1, "attendu : erreur de validation\n" + (r.stdout + r.stderr)[-600:])
        self.assertIn("ERREUR", r.stdout + r.stderr)

    def mutated(self, fn):
        m = copy.deepcopy(valid_module())
        fn(m)
        return m

    def test_module_valide_temoin(self):
        r = self.check(valid_module())
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-600:])

    def test_bloc_inconnu(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0]["blocks"].append({"t": "carousel", "html": "x"})))

    def test_src_manquant_sur_slide_non_extra(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0].pop("src")))

    def test_src_hors_plage_bas(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0].update(src=[3])))

    def test_src_hors_plage_haut(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0].update(src=[224])))

    def test_src_non_entier(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0].update(src=["13"])))

    def test_src_en_doublon_entre_modules(self):
        self.assert_invalid(valid_module(98, (13, 14)), valid_module(99, (14, 15)))

    def test_img_non_declaree(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0]["blocks"].append(
            {"t": "img", "file": "assets/img/inexistante-zzz.png", "alt": "Schéma neutre"})))

    def test_img_sans_alt(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0]["blocks"].append(
            {"t": "img", "file": "assets/img/inexistante-zzz.png"})))

    def test_balise_html_non_autorisee(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0]["blocks"].append(
            {"t": "text", "html": "<script>alert(1)</script>"})))

    def test_placeholder_chevrons_non_echappe(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0]["blocks"].append(
            {"t": "text", "html": "Utiliser <version> ici"})))

    def test_extra_mal_forme(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2].update(extra="oui")))

    def test_slide_extra_avec_src(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2].update(src=[13])))

    def test_objectifs_moins_de_trois(self):
        self.assert_invalid(self.mutated(lambda m: m.update(objectives=m["objectives"][:2])))

    def test_objectifs_plus_de_cinq(self):
        self.assert_invalid(self.mutated(lambda m: m.update(objectives=m["objectives"] * 2)))

    def test_a_retenir_moins_de_quatre(self):
        self.assert_invalid(self.mutated(lambda m: m.update(takeaways=m["takeaways"][:3])))

    def test_a_retenir_plus_de_six(self):
        self.assert_invalid(self.mutated(lambda m: m.update(takeaways=m["takeaways"] + m["takeaways"])))

    def test_aucun_quiz(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"].pop(2)))

    def test_quiz_sans_explain(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2]["blocks"][0].pop("explain")))

    def test_quiz_sans_ref(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2]["blocks"][0].pop("ref")))

    def test_quiz_answer_hors_limites(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2]["blocks"][0].update(answer=3)))

    def test_quiz_deux_options(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2]["blocks"][0].update(options=["A", "B"])))

    def test_quiz_cinq_options(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2]["blocks"][0].update(options=list("ABCDE"))))

    def test_ref_hors_du_module_quiz(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2]["blocks"][0].update(ref=[200])))

    def test_ref_hors_du_module_objectif(self):
        self.assert_invalid(self.mutated(lambda m: m["objectives"][0].update(ref=[200])))

    def test_objectif_sans_ref(self):
        self.assert_invalid(self.mutated(lambda m: m["objectives"][0].pop("ref")))

    def test_a_retenir_sans_ref(self):
        self.assert_invalid(self.mutated(lambda m: m["takeaways"][0].pop("ref")))

    def test_lien_href_non_https(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0]["blocks"].append(
            {"t": "text", "html": '<a href="http://example.com/x">lien</a>'})))


class TestValidateRepo(unittest.TestCase):
    """CA-4.4 : le site commité passe son propre validateur et la syntaxe JS."""

    def test_validate_js_sur_le_depot_zero_erreur(self):
        r = S.node("tools/validate.js")
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-1200:])

    def test_node_check_assets(self):
        files = sorted((S.ROOT / "assets").glob("*.js"))
        self.assertTrue(files, "aucun assets/*.js")
        for f in files:
            with self.subTest(fichier=f.name):
                r = S.node("--check", f)
                self.assertEqual(r.returncode, 0, r.stderr[-600:])

    def test_node_check_modules_et_outils(self):
        files = sorted((S.ROOT / "modules").glob("*.js")) + sorted((S.ROOT / "tools").glob("*.js"))
        self.assertTrue(files, "aucun module / outil")
        for f in files:
            with self.subTest(fichier=f.name):
                r = S.node("--check", f)
                self.assertEqual(r.returncode, 0, r.stderr[-600:])

    def test_modules_ids_coherents_avec_les_fichiers(self):
        mods = S.modules()
        self.assertTrue(mods, "course.json sans module")
        for mid, m in mods.items():
            with self.subTest(module=mid):
                self.assertIn(mid, S.MODULE_RANGES)
                self.assertEqual(m.get("num"), int(mid[1:]))


if __name__ == "__main__":
    unittest.main()
