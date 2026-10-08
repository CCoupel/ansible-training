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
import re
import shutil
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


def validate_fixture(*args, env=None):
    """`validate.js` sur des modules fixtures, avec `I18N_STRICT` purgé de l'environnement hérité (release.yml le pose
    pour tout le job) : seuls les tests qui le testent explicitement le passent via `env`."""
    e = {"I18N_STRICT": ""}
    e.update(env or {})
    return S.node("tools/validate.js", *args, env=e)


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
        return validate_fixture(*files)

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
        self.assert_invalid(self.mutated(lambda m: m["slides"][0].update(src=[S.expected()[0] + 1])))

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


class TestValidateJoursDuPlan(unittest.TestCase):
    """`day` de assets/plan.js : J1 à J4 acceptés (agenda à 4 jours), tout autre jour (J5) refusé.

    Contrôle global sur une copie du dépôt (`validate.js --root`), un seul `day` altéré à la fois."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.root = Path(self._tmp.name)
        for name in ("assets", "modules", "index.html"):
            src = S.ROOT / name
            if src.is_dir():
                shutil.copytree(src, self.root / name)
            else:
                shutil.copy(src, self.root / name)
        (self.root / "tests" / "slides").mkdir(parents=True)
        shutil.copy(S.ROOT / "tests" / "slides" / "expected.json", self.root / "tests" / "slides" / "expected.json")

    def set_day(self, module_id, day):
        p = self.root / "assets" / "plan.js"
        text = p.read_text(encoding="utf-8")
        new, n = re.subn(r"(id: '%s'[^}]*?day: ')J\d(')" % module_id, r"\g<1>%s\g<2>" % day, text)
        self.assertEqual(n, 1, "module %s introuvable dans plan.js" % module_id)
        p.write_text(new, encoding="utf-8")

    def validate(self):
        return S.node("tools/validate.js", "--root", self.root)

    def test_plan_actuel_valide_temoin(self):
        r = self.validate()
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-600:])

    def test_day_j4_accepte(self):
        self.set_day("m17", "J4")
        r = self.validate()
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-600:])

    def test_day_j5_inconnu_refuse(self):
        self.set_day("m17", "J5")
        r = self.validate()
        self.assertEqual(r.returncode, 1, (r.stdout + r.stderr)[-600:])
        out = r.stdout + r.stderr
        self.assertIn("ERREUR", out)
        self.assertIn("J5", out)

    def test_day_j0_refuse(self):
        self.set_day("m01", "J0")
        self.assertEqual(self.validate().returncode, 1)


def translated_module():
    """valid_module() + version anglaise complète (contrat #51 : champs traduisibles `X` → `X_en`)."""
    m = valid_module()
    m["tagline_en"] = "Hook."
    for o in m["objectives"]:
        o["html_en"] = "English objective."
    for t in m["takeaways"]:
        t["html_en"] = "English point."
    q = m["slides"][2]
    q["title_en"] = "Quiz"
    b = q["blocks"][0]
    b.update(q_en="Question?", options_en=["A", "B", "C"], explain_en="Because (see slide 13).")
    return m


class TestValidateLangues(unittest.TestCase):
    """Site fr/en : champs `_en`, complétude « tout ou rien », mode strict (`--strict-i18n` ou `I18N_STRICT=1`).

    Un module sans aucun `_en` est un avertissement en mode normal, une erreur en mode strict ; un module
    partiellement traduit est toujours une erreur ; `_en` sur un champ verbatim (texte du PPTX) est une erreur."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = self._tmp.name
        self.addCleanup(self._tmp.cleanup)

    def run_validate(self, mod, *extra, env=None):
        return validate_fixture(*extra, write_module(self.dir, mod), env=env)

    def out(self, r):
        return (r.stdout + r.stderr)[-600:]

    def warnings(self, r):
        m = re.search(r"(\d+) avertissement\(s\)", r.stdout + r.stderr)
        self.assertIsNotNone(m, self.out(r))
        return int(m.group(1))

    def assert_invalid(self, mod, *extra, env=None):
        r = self.run_validate(mod, *extra, env=env)
        self.assertEqual(r.returncode, 1, "attendu : erreur\n" + self.out(r))
        self.assertIn("ERREUR", r.stdout + r.stderr)

    def mutated(self, fn):
        m = copy.deepcopy(translated_module())
        fn(m)
        return m

    def test_module_traduit_valide(self):
        r = self.run_validate(translated_module())
        self.assertEqual(r.returncode, 0, self.out(r))
        # le module fixture est court (avertissement de taille) : on compare au même module non traduit
        untranslated = self.run_validate(valid_module())
        self.assertLess(self.warnings(r), self.warnings(untranslated),
                        "l'avertissement « module non traduit » ne doit pas apparaître pour un module traduit\n" + self.out(r))

    def test_module_traduit_valide_en_mode_strict(self):
        for extra, env in ((("--strict-i18n",), None), ((), {"I18N_STRICT": "1"})):
            r = self.run_validate(translated_module(), *extra, env=env)
            self.assertEqual(r.returncode, 0, self.out(r))

    def test_en_sur_un_champ_verbatim_titre_de_slide(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0].update(title_en="Content")))

    def test_en_sur_un_champ_verbatim_texte(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][0]["blocks"][0].update(html_en="Text")))

    def test_en_sur_un_champ_verbatim_code(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][1]["blocks"][0].update(code_en="ansible all -m ping")))

    def test_en_sur_les_notes_verbatim(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][1].update(notes_en="Trainer note.")))

    def test_module_partiellement_traduit_objectif(self):
        self.assert_invalid(self.mutated(lambda m: m["objectives"][0].pop("html_en")))

    def test_module_partiellement_traduit_quiz(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2]["blocks"][0].pop("explain_en")))

    def test_module_partiellement_traduit_tagline(self):
        self.assert_invalid(self.mutated(lambda m: m.pop("tagline_en")))

    def test_options_en_de_longueur_differente(self):
        self.assert_invalid(self.mutated(lambda m: m["slides"][2]["blocks"][0].update(options_en=["A", "B"])))

    def test_code_different_entre_fr_et_en(self):
        def alter(m):
            m["objectives"][0]["html"] = "Écrire une <code>condition</code>."
            m["objectives"][0]["html_en"] = "Write a <code>conditional</code>."
        self.assert_invalid(self.mutated(alter))

    def test_html_non_autorise_dans_une_traduction(self):
        self.assert_invalid(self.mutated(lambda m: m["objectives"][0].update(html_en="<script>alert(1)</script>")))

    # --- libellés ajoutés par le site (lab / reveal) : clés d'interface, jamais en dur ; <code> avec multiplicité
    def with_blocks(self, *blocks):
        def add(m):
            m["slides"][0]["blocks"].extend(blocks)
        return self.mutated(add)

    def test_lab_et_reveal_sans_libelle_en_dur_valides(self):
        r = self.run_validate(self.with_blocks(
            {"t": "lab", "steps": ["Étape"]}, {"t": "reveal", "slide": 13, "html": "<pre>x</pre>"}))
        self.assertEqual(r.returncode, 0, self.out(r))

    def test_lab_avec_titre_a_realiser_en_dur(self):
        self.assert_invalid(self.with_blocks({"t": "lab", "title": "À réaliser", "steps": ["Étape"]}))

    def test_reveal_avec_label_voir_la_solution_en_dur(self):
        self.assert_invalid(self.with_blocks({"t": "reveal", "label": "Voir la solution (slide 13)", "html": "<pre>x</pre>"}))

    def test_reveal_slide_hors_du_module(self):
        self.assert_invalid(self.with_blocks({"t": "reveal", "slide": 999, "html": "<pre>x</pre>"}))

    def test_code_en_multiplicite_un_code_en_trop(self):
        def alter(m):
            m["objectives"][0]["html"] = "Utiliser <code>when</code> et <code>when</code>."
            m["objectives"][0]["html_en"] = "Use <code>when</code>."
        self.assert_invalid(self.mutated(alter))

    def test_code_en_multiplicite_un_code_manquant_dans_l_original(self):
        def alter(m):
            m["objectives"][0]["html"] = "Utiliser <code>when</code>."
            m["objectives"][0]["html_en"] = "Use <code>when</code> and <code>when</code>."
        self.assert_invalid(self.mutated(alter))

    def test_code_identiques_avec_multiplicite_egale(self):
        def alter(m):
            m["objectives"][0]["html"] = "Utiliser <code>when</code> et <code>loop</code> puis <code>when</code>."
            m["objectives"][0]["html_en"] = "Use <code>loop</code>, <code>when</code> and <code>when</code>."
        r = self.run_validate(self.mutated(alter))
        self.assertEqual(r.returncode, 0, self.out(r))

    def test_code_en_multiplicite_dans_les_options_du_quiz(self):
        def alter(m):
            b = m["slides"][2]["blocks"][0]
            b["options"] = ["A <code>x</code> <code>x</code>", "B", "C"]
            b["options_en"] = ["A <code>x</code>", "B", "C"]
        self.assert_invalid(self.mutated(alter))

    def test_module_sans_en_simple_avertissement(self):
        r = self.run_validate(valid_module())
        self.assertEqual(r.returncode, 0, self.out(r))
        self.assertGreaterEqual(self.warnings(r), 1, "avertissement « module non traduit » attendu\n" + self.out(r))

    def test_module_sans_en_erreur_avec_option_strict(self):
        self.assert_invalid(valid_module(), "--strict-i18n")

    def test_module_sans_en_erreur_avec_variable_strict(self):
        self.assert_invalid(valid_module(), env={"I18N_STRICT": "1"})


class TestValidateTailleModule(unittest.TestCase):
    """Avertissement de taille de `validate.js` : seules les slides de contenu (hors `extra: true`, donc hors quiz
    du Bonus) comptent ; le maximum est de 35 slides de contenu. Un module de 30 slides + 3 quiz n'avertit pas,
    un module de 36 slides de contenu avertit (sans échouer : un avertissement n'est pas une erreur)."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.dir = self._tmp.name
        self.addCleanup(self._tmp.cleanup)

    def check(self, mod):
        return validate_fixture(write_module(self.dir, mod))

    def sized_module(self, content):
        mod = valid_module(98, (13, 14))
        first = mod["slides"][0]
        quiz = mod["slides"][2]
        mod["slides"] = [dict(first, title="Contenu %d" % i, src=[13 + i]) for i in range(content)]
        for k in range(3):  # 3 quiz = 3 slides `extra`
            q = copy.deepcopy(quiz)
            q["blocks"][0]["q"] = "Question %d ?" % k
            mod["slides"].append(q)
        mod["objectives"] = [dict(o, ref=[13]) for o in mod["objectives"]]
        mod["takeaways"] = [dict(t, ref=[13]) for t in mod["takeaways"]]
        for s in mod["slides"]:
            for b in s["blocks"]:
                if b.get("t") == "quiz":
                    b["ref"] = [13]
        return mod

    def size_warnings(self, r):
        """Avertissements de TAILLE seulement (le module fixture n'est pas traduit : l'avertissement i18n est hors sujet)."""
        return len(re.findall(r"warn\s.*slides de contenu hors Bonus", r.stdout + r.stderr))

    def test_30_slides_de_contenu_et_3_quiz_sans_avertissement(self):
        r = self.check(self.sized_module(30))
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-600:])
        self.assertEqual(self.size_warnings(r), 0, (r.stdout + r.stderr)[-600:])

    def test_36_slides_de_contenu_avertissent_sans_echouer(self):
        r = self.check(self.sized_module(36))
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-600:])
        self.assertEqual(self.size_warnings(r), 1, (r.stdout + r.stderr)[-600:])


if __name__ == "__main__":
    unittest.main()
