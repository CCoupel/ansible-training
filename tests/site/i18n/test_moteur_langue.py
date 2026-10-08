"""Moteur de langue du site (#51) : exécute `engine_langue.js` (Node, DOM factice, sans navigateur).

Vérifie, via le moteur réel `assets/engine.js` et les libellés `fr.js` / `en.js` : résolution de la langue
(`?lang=` valide et invalide, langue mémorisée, langue du navigateur, repli sur le français), `t()` / `L()`,
`lang="en"` sur les blocs verbatim en interface française, quiz traduits et repli quand `_en` est absent, bascule
par clic et par la touche `l`, ancre conservée, `aria-label` et segment actif du bouton FR | EN.
Le script ne dépend pas du contenu du cours (module fictif m99). Node 22 Linux requis (pas node.exe).

Exécution : python3 -m unittest discover -s tests/site/i18n -p "test_moteur_langue.py" -v
"""

import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

SCRIPT = Path(__file__).with_name("engine_langue.js")
EXPECTED_CHECKS = 25  # nombre minimal de vérifications du script ; un moteur qui n'en exécute pas assez échoue


class TestMoteurLangue(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.r = S.node(SCRIPT, S.ROOT)
        cls.out = cls.r.stdout + cls.r.stderr
        cls.ok = re.findall(r"^ok\s+(.*)$", cls.r.stdout, re.M)
        cls.fail = re.findall(r"^FAIL\s+(.*)$", cls.r.stdout, re.M)

    def test_script_termine_sans_erreur(self):
        self.assertEqual(self.r.returncode, 0, self.out[-800:])

    def test_aucun_controle_en_echec(self):
        self.assertEqual(self.fail, [], "contrôle(s) en échec : %s" % self.fail)

    def test_nombre_de_controles_executes(self):
        self.assertGreaterEqual(len(self.ok), EXPECTED_CHECKS, "seulement %d contrôles exécutés" % len(self.ok))

    def test_controles_cles(self):
        text = "\n".join(self.ok)
        for key in ("navigateur fr -> fr", "navigateur en -> en", "?lang invalide ignoré", "?lang > mémorisé",
                    "raccourci l", "ancre conservée", "repli français quand _en absent"):
            self.assertIn(key, text, "contrôle « %s » non exécuté" % key)


if __name__ == "__main__":
    unittest.main()
