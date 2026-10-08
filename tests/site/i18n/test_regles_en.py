"""Règles du Bonus fr/en (#51) : garde-fou verbatim, complétude, règles des quiz anglais, `<code>` identiques.

Deux niveaux :
  - TestRegles : les règles (`i18n_rules.py`) sur des modules SYNTHÉTIQUES, bons et mauvais, toujours exécutés ;
  - TestSite   : les mêmes règles sur les modules de build/course.json ; un module sans aucun `_en` est « non traduit »
    et toléré, sauf `I18N_STRICT=1` (tous les modules doivent être traduits : test_tous_les_modules_traduits).
La parité PPTX ⊂ HTML (tests/site/parite/) ne dépend pas de la langue : elle est inchangée et ne lit jamais `_en`.

Exécution : python3 -m unittest discover -s tests/site/i18n -p "test_regles_en.py" -v
"""

import copy
import os
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
import site_support as S  # noqa: E402
import i18n_rules as R  # noqa: E402

I18N_STRICT = os.environ.get("I18N_STRICT", "") == "1"


def module_fr():
    return {
        "id": "m98", "num": 98, "tagline": "Accroche en français avec <code>when</code>.",
        "objectives": [{"html": "Écrire une <code>condition</code>.", "ref": [13]}],
        "takeaways": [{"html": "Un point sur <code>when</code>.", "ref": [13]}],
        "slides": [
            {"title": "Contenu", "src": [13], "blocks": [
                {"t": "text", "html": "Texte verbatim."},
                {"t": "img", "file": "assets/img/x.png", "alt": "Schéma du flux", "caption": "Légende"},
                {"t": "diagram", "html": "<svg><title>Titre</title><desc>Description</desc></svg>"}]},
            {"title": "Quiz", "extra": True, "blocks": [
                {"t": "quiz", "q": "Quelle clé porte la condition ?", "options": ["Un mot-clé du play", "Un module", "Un fichier"],
                 "answer": 0, "explain": "Voir la slide 13.", "ref": [13]}]},
        ],
    }


def module_en():
    m = module_fr()
    m["tagline_en"] = "English tagline with <code>when</code>."
    m["objectives"][0]["html_en"] = "Write a <code>condition</code>."
    m["takeaways"][0]["html_en"] = "A point about <code>when</code>."
    img = m["slides"][0]["blocks"][1]
    img["alt_en"], img["caption_en"] = "Flow diagram", "Caption"
    m["slides"][0]["blocks"][2]["svg_en"] = {"title": "Title", "desc": "Description"}
    m["slides"][1]["title_en"] = "Quiz"
    q = m["slides"][1]["blocks"][0]
    q["q_en"] = "Which key holds the condition?"
    q["options_en"] = ["A keyword of the play", "A module of the play", "A file of the play"]
    q["explain_en"] = "See slide 13."
    return m


def all_errors(m):
    return (R.verbatim_errors(m) + R.completeness_errors(m) + R.quiz_errors(m)
            + R.code_identity_errors(m) + R.ip_errors(m))


class TestRegles(unittest.TestCase):
    def assert_flagged(self, mutate, fragment, fn=all_errors):
        m = module_en()
        mutate(m)
        errs = fn(m)
        self.assertTrue(any(fragment in e for e in errs), "« %s » attendu, obtenu %s" % (fragment, errs))

    def test_module_traduit_valide(self):
        self.assertEqual(all_errors(module_en()), [])

    def test_module_non_traduit_tolere(self):
        m = module_fr()
        self.assertFalse(R.has_any_en(m))
        self.assertEqual(all_errors(m), [])

    # --- garde-fou verbatim
    def test_en_sur_titre_de_slide_verbatim(self):
        self.assert_flagged(lambda m: m["slides"][0].update(title_en="Content"), "title_en sur une slide non `extra`")

    def test_en_sur_texte_de_slide(self):
        self.assert_flagged(lambda m: m["slides"][0]["blocks"][0].update(html_en="Verbatim"), "html_en hors objectifs")

    def test_en_sur_code_de_slide(self):
        self.assert_flagged(lambda m: m["slides"][0]["blocks"].append({"t": "code", "code": "x", "code_en": "y"}), "verbatim")

    def test_en_sur_notes(self):
        self.assert_flagged(lambda m: m["slides"][0].update(notes_en="Notes"), "verbatim")

    def test_ref_en_interdit(self):
        self.assert_flagged(lambda m: m["objectives"][0].update(ref_en=[13]), "`ref` est partagé")

    # --- complétude tout ou rien
    def test_explain_manquant(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0].pop("explain_en"), "explain_en` manquant")

    def test_objectif_non_traduit(self):
        self.assert_flagged(lambda m: m["objectives"][0].pop("html_en"), "html_en` manquant")

    def test_tagline_manquante(self):
        self.assert_flagged(lambda m: m.pop("tagline_en"), "tagline_en` manquant")

    def test_alt_manquant(self):
        self.assert_flagged(lambda m: m["slides"][0]["blocks"][1].pop("alt_en"), "alt_en` manquant")

    def test_image_decorative_sans_alt_non_exigee(self):
        m = module_en()
        m["slides"][0]["blocks"].append({"t": "img", "file": "a.png", "alt": "", "decorative": True})
        self.assertEqual(R.completeness_errors(m), [])

    def test_svg_en_vide(self):
        self.assert_flagged(lambda m: m["slides"][0]["blocks"][2].update(svg_en={"title": "T"}), "title` et `desc`")

    # --- règles des quiz
    def test_options_en_longueur_differente(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0]["options_en"].pop(), "options_en (2) ≠ options (3)")

    def test_bonne_reponse_trop_longue(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0]["options_en"].__setitem__(
            0, "A keyword of the play that is described with many more words than the others"), "plus de 30 %")

    def test_bonne_reponse_trop_courte(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0]["options_en"].__setitem__(0, "Key"), "plus de 30 %")

    def test_only_reserve_aux_mauvaises_reponses(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0]["options_en"].__setitem__(1, "Only a module of the play"), "« only » réservé")

    def test_just_dans_toutes_les_options_toleree(self):
        m = module_en()
        m["slides"][1]["blocks"][0]["options_en"] = ["Just a keyword of the play", "Just a module of the play", "Just a file of the play"]
        self.assertEqual(R.quiz_errors(m), [])

    def test_nom_de_tag_exempte_de_la_regle_des_mots_reveles(self):
        """« The never tag » / « The tag named always » : identifiants (tags Ansible), pas des qualificatifs."""
        m = module_en()
        m["slides"][1]["blocks"][0]["options_en"] = ["The tagged tag of the play", "The never tag of the play", "The tag named always"]
        self.assertEqual(R.quiz_errors(m), [])

    def test_never_comme_qualificatif_reste_refuse(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0]["options_en"].__setitem__(
            1, "A module that can never be skipped"), "« never » réservé")

    def test_always_qualificatif_reste_refuse_meme_avec_un_tag_voisin(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0]["options_en"].__setitem__(
            1, "The never tag always runs"), "« always » réservé")

    def test_code_dans_les_options(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0]["options_en"].__setitem__(0, "The <code>when</code> key"),
                            "<code> dans les options")

    def test_explain_sans_slide_de_ref(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0].update(explain_en="Because it is so."), "ne cite aucune slide")

    def test_explain_cite_une_autre_slide(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0].update(explain_en="See slide 99."), "ne cite aucune slide")

    # --- <code> et IP
    def test_code_traduit(self):
        self.assert_flagged(lambda m: m["objectives"][0].update(html_en="Write a <code>conditional</code>."), "<code> différents")

    def test_code_ajoute_dans_la_traduction(self):
        self.assert_flagged(lambda m: m.update(tagline_en="English <code>when</code> and <code>loop</code>."), "<code> différents")

    def test_code_multiplicite(self):
        def alter(m):
            m["objectives"][0]["html"] = "Utiliser <code>when</code> et <code>when</code>."
            m["objectives"][0]["html_en"] = "Use <code>when</code>."
        self.assert_flagged(alter, "<code> différents")

    def test_ip_hors_documentation(self):
        self.assert_flagged(lambda m: m["slides"][1]["blocks"][0].update(explain_en="See slide 13: host 10.1.2.3."), "IP hors")

    def test_ip_192_0_2_et_loopback_ok(self):
        m = module_en()
        m["slides"][1]["blocks"][0]["explain_en"] = "See slide 13: hosts 192.0.2.10 and 127.0.0.1, version 2.20.1."
        self.assertEqual(R.ip_errors(m), [])


@unittest.skipUnless(S.PPTX.is_file(), "PPTX de référence introuvable")
class TestSite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mods = S.modules()

    def each_module(self):
        self.assertTrue(self.mods, "course.json sans module")
        for mid, m in self.mods.items():
            yield mid, m

    def test_aucun_en_sur_un_champ_verbatim(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                self.assertEqual(R.verbatim_errors(m), [])

    def test_modules_traduits_complets(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                self.assertEqual(R.completeness_errors(m), [])

    @unittest.skipUnless(I18N_STRICT, "I18N_STRICT=1 : tous les modules doivent être traduits (release)")
    def test_tous_les_modules_traduits(self):
        untranslated = [mid for mid, m in self.each_module() if not R.has_any_en(m)]
        self.assertEqual(untranslated, [], "module(s) sans version anglaise")

    def test_regles_des_quiz_en_anglais(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                self.assertEqual(R.quiz_errors(m), [])

    def test_code_identique_fr_en_et_present_dans_le_pptx(self):
        total = len(S.deck().slides)
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                self.assertEqual(R.code_identity_errors(m), [])
                if not R.has_any_en(m):
                    continue
                for label, items in (("objectif", m.get("objectives", [])), ("à retenir", m.get("takeaways", []))):
                    for i, it in enumerate(items, 1):
                        source = S.norm(" ".join(S.pptx_full_text(n) for n in it.get("ref", []) if 1 <= n <= total))
                        for code in R.codes(it.get("html_en", "")):
                            c = S.norm(S._html.unescape(code))
                            self.assertIn(c, source, "%s %d : un <code> de la version anglaise est absent du PPTX" % (label, i))

    def test_aucune_ip_hors_documentation_en_anglais(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                self.assertEqual(R.ip_errors(m), [])


if __name__ == "__main__":
    unittest.main()
