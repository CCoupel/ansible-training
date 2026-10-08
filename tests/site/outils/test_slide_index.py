"""Garde-fou #5 : `tests/slides/slide_index.json` = ordre réel du PPTX (identité = `<p:sldId id>`).

Si quelqu'un ajoute, retire ou déplace une slide sans lancer `tools/renumber.py --apply`, ces tests
cassent : c'est le contrôle contre la dérive PPTX / HTML / tests. Messages : numéros et ids seulement.

Exécution : python3 -m unittest discover -s tests/site/outils -p "test_slide_index.py" -v
"""

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

INDEX = S.ROOT / "tests" / "slides" / "slide_index.json"


def load_index():
    with open(INDEX, encoding="utf-8") as fh:
        return json.load(fh)["slides"]


class TestSlideIndexSync(unittest.TestCase):
    def test_slide_index_sync(self):
        idx = load_index()
        slides = S.deck().slides
        self.assertEqual(len(idx), len(slides), "slide_index.json : %d slides, PPTX : %d — lancer tools/renumber.py"
                         % (len(idx), len(slides)))
        for pos, (e, s) in enumerate(zip(idx, slides), 1):
            self.assertEqual(e["id"], s.sld_id, "position %d : id %s dans l'index, %s dans le PPTX" % (pos, e["id"], s.sld_id))
            self.assertEqual(e["part"], s.part, "position %d : part différente" % pos)
            self.assertEqual(bool(e["hidden"]), s.hidden, "position %d : indicateur masqué différent" % pos)

    def test_ids_uniques_et_entiers(self):
        ids = [e["id"] for e in load_index()]
        self.assertTrue(all(isinstance(i, int) for i in ids))
        self.assertEqual(len(ids), len(set(ids)), "ids de slides en doublon")

    def test_format_du_contrat(self):
        for e in load_index():
            self.assertEqual(set(e), {"id", "part", "hidden"})
            self.assertTrue(e["part"].startswith("ppt/slides/slide"))
            self.assertIsInstance(e["hidden"], bool)

    def test_index_coherent_avec_expected_json(self):
        total, hidden = S.expected()
        idx = load_index()
        self.assertEqual(len(idx), total)
        self.assertEqual([i for i, e in enumerate(idx, 1) if e["hidden"]], hidden)


if __name__ == "__main__":
    unittest.main()
