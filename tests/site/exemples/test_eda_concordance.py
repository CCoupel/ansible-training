"""Concordance slides ↔ exemples ↔ lab EDA (#9, « une seule source de vérité », v1.0.0).

Le code des rulebooks de `examples/eda/` et de `labs/eda/solution/` doit être celui des slides correspondantes du
module m14 (lu avec `pptx_reader`). Comparaison normalisée : espaces, guillemets typographiques, lignes vides,
commentaires (`#…`, donc l'en-tête des exemples) et séparateur `---` ignorés ; les lignes du fichier doivent former
une suite CONTIGUË des lignes de la slide (la slide peut ajouter d'autres blocs : inventaire, commandes `curl`).
Pour le lab : l'énoncé (slide 220) et les commandes (slide 221) doivent figurer dans `labs/eda/README.md`.

Un écart est un échec avec le numéro de slide et le fichier — jamais corrigé automatiquement : à trancher
(corriger l'exemple d'abord, puis recopier dans la slide).
Les tables ci-dessous sont à compléter à chaque nouvel exemple (test_tous_les_fichiers_sont_references).

Exécution : python3 -m unittest discover -s tests/site/exemples -p "test_eda_concordance.py" -v
"""

import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

# slide du module m14 -> fichier(s) de code qui doivent y figurer
CODE_SLIDES = {
    199: ["examples/eda/01-first-rulebook.yml"],
    201: ["examples/eda/02-webhook-token.yml"],
    202: ["examples/eda/03-generic-source.yml"],
    204: ["examples/eda/04-conditions-basics.yml"],
    205: ["examples/eda/05-operators.yml"],
    206: ["examples/eda/06-strings-lists.yml"],
    207: ["examples/eda/07-several-events.yml"],
    208: ["examples/eda/08-facts-variables.yml"],
    209: ["examples/eda/09-throttle.yml"],
    222: ["labs/eda/solution/rulebook.yml", "labs/eda/solution/remediate.yml",
          "examples/eda/10-run-playbook.yml", "examples/eda/remediate.yml"],
}
# fichiers volontairement sans slide de code (données, README)
NOT_ON_SLIDES = {"examples/eda/README.md", "examples/eda/inventory.yml", "examples/eda/vars.yml", "labs/eda/README.md",
                 "labs/eda/inventory.yml"}
LAB_STATEMENT_SLIDE, LAB_COMMANDS_SLIDE = 220, 221


def norm_lines(lines):
    out = []
    for line in lines:
        t = S.norm(line)
        if t and not t.startswith("#") and t != "---":
            out.append(t)
    return out


def contiguous(needle, haystack):
    k = len(needle)
    return k > 0 and any(haystack[i:i + k] == needle for i in range(len(haystack) - k + 1))


def first_difference(needle, haystack):
    """Première ligne du fichier absente de la slide (numéro de ligne normalisée) ; sinon problème d'ordre."""
    for i, line in enumerate(needle, 1):
        if line not in haystack:
            return "ligne %d du fichier (normalisé) absente de la slide" % i
    return "toutes les lignes existent mais pas en suite contiguë (ordre ou lignes intercalées)"


def have_files():
    return all((S.ROOT / p).is_file() for files in CODE_SLIDES.values() for p in files)


@unittest.skipUnless(have_files(), "examples/eda et labs/eda incomplets (lot 2)")
class TestConcordance(unittest.TestCase):
    def test_code_des_slides_identique_aux_fichiers(self):
        for n, files in CODE_SLIDES.items():
            slide = norm_lines(S.deck().slide(n).paragraphs)
            for rel in files:
                with self.subTest(slide=n, fichier=rel):
                    f = norm_lines((S.ROOT / rel).read_text(encoding="utf-8").splitlines())
                    self.assertTrue(f, "fichier vide : %s" % rel)
                    self.assertTrue(contiguous(f, slide), "slide %d ≠ %s : %s" % (n, rel, first_difference(f, slide)))

    def test_slides_de_code_dans_le_module_m14(self):
        a, b = S.plan_reader.entry("m14")["range"]
        for n in CODE_SLIDES:
            self.assertTrue(a <= n <= b, "slide %d hors du module m14 (%d-%d)" % (n, a, b))
        for n in (LAB_STATEMENT_SLIDE, LAB_COMMANDS_SLIDE):
            self.assertTrue(a <= n <= b)

    def test_tous_les_fichiers_sont_references(self):
        known = {p for files in CODE_SLIDES.values() for p in files} | NOT_ON_SLIDES
        actual = {p.relative_to(S.ROOT).as_posix() for d in ("examples/eda", "labs/eda")
                  for p in (S.ROOT / d).rglob("*") if p.is_file()}
        self.assertEqual(sorted(actual - known), [], "fichier(s) sans slide ni exception : ajouter à CODE_SLIDES ou NOT_ON_SLIDES")
        self.assertEqual(sorted(known - actual), [], "entrée(s) de la table sans fichier")

    def test_exemples_du_lab_identiques_a_la_solution(self):
        for a, b in (("examples/eda/10-run-playbook.yml", "labs/eda/solution/rulebook.yml"),
                     ("examples/eda/remediate.yml", "labs/eda/solution/remediate.yml")):
            with self.subTest(exemple=a):
                self.assertEqual(norm_lines((S.ROOT / a).read_text(encoding="utf-8").splitlines()),
                                 norm_lines((S.ROOT / b).read_text(encoding="utf-8").splitlines()),
                                 "%s ≠ %s" % (a, b))

    def test_enonce_et_commandes_du_lab_dans_le_readme(self):
        readme = S.norm(re.sub(r"[`*]", "", (S.ROOT / "labs/eda/README.md").read_text(encoding="utf-8")))
        for n in (LAB_STATEMENT_SLIDE, LAB_COMMANDS_SLIDE):
            paras = S.deck().slide(n).paragraphs
            for k, line in enumerate(paras):
                t = S.norm(re.sub(r"^\s*\d+\.\s+", "", line))
                if not t or k == 0 or t.startswith("#"):  # titre de slide et commentaires de commandes
                    continue
                parts = t.split(", then: ") if ", then: " in t else [t]
                for part in parts:
                    with self.subTest(slide=n, ligne=k):
                        self.assertIn(S.norm(part.rstrip(":")), readme, "slide %d, paragraphe %d absent de labs/eda/README.md" % (n, k))


if __name__ == "__main__":
    unittest.main()
