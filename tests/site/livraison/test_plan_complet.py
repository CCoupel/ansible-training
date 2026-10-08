"""Release : aucun module « à venir » (v1.0.0, plan lot 1 §4.3).

`assets/plan.js` peut lister un module non chargé pendant le développement (affiché « à venir », grisé).
En release (`PARITY_STRICT=1`, ou `RELEASE_TAG` défini — la CI les pose) c'est interdit : chaque module du plan doit avoir
son fichier `modules/<id>-*.js`, sa balise `<script>` dans `index.html` et des slides dans `course.json`, et les
plages du plan doivent couvrir le deck sans trou ni chevauchement. Hors release : ces tests sont sautés.
Messages : identifiants de modules et numéros de slides seulement.

Exécution : PARITY_STRICT=1 python3 -m unittest discover -s tests/site/livraison -p "test_plan_complet.py" -v
"""

import os
import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

RELEASE = S.STRICT or bool(os.environ.get("RELEASE_TAG"))


@unittest.skipUnless(RELEASE, "contrôle de release : PARITY_STRICT=1 ou RELEASE_TAG")
class TestAucunModuleAVenir(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.plan = S.plan_reader.plan()
        cls.index = (S.ROOT / "index.html").read_text(encoding="utf-8")

    def test_plan_non_vide_et_ids_uniques(self):
        ids = [p["id"] for p in self.plan]
        self.assertTrue(ids, "plan.js sans module")
        self.assertEqual(len(ids), len(set(ids)), "ids de modules en doublon dans plan.js")

    def test_chaque_module_du_plan_a_son_fichier(self):
        for p in self.plan:
            with self.subTest(module=p["id"]):
                files = sorted((S.ROOT / "modules").glob("%s-*.js" % p["id"]))
                self.assertEqual(len(files), 1, "module %s : %d fichier(s) modules/%s-*.js" % (p["id"], len(files), p["id"]))

    def test_chaque_module_du_plan_est_charge_par_index_html(self):
        for p in self.plan:
            with self.subTest(module=p["id"]):
                tags = re.findall(r'<script\s+src="modules/%s-[^"]+\.js"\s*>' % re.escape(p["id"]), self.index)
                self.assertEqual(len(tags), 1, "module %s : %d balise(s) <script> dans index.html" % (p["id"], len(tags)))

    def test_aucun_module_charge_hors_plan(self):
        planned = {p["id"] for p in self.plan}
        loaded = set(re.findall(r'<script\s+src="modules/(m\d+)-[^"]+\.js"', self.index))
        self.assertEqual(sorted(loaded - planned), [], "module(s) chargé(s) mais absent(s) de plan.js")

    def test_chaque_module_du_plan_a_des_slides_dans_course_json(self):
        mods = S.modules()
        for p in self.plan:
            with self.subTest(module=p["id"]):
                self.assertTrue(mods.get(p["id"], {}).get("slides"), "module %s sans slides dans course.json (à venir ?)" % p["id"])

    def test_plages_contigues_et_couvrent_le_deck(self):
        total, _ = S.expected()
        rngs = sorted(p["range"] for p in self.plan)
        self.assertEqual(rngs[0][0], 4, "le premier module doit commencer à la slide 4")
        for (a1, b1), (a2, b2) in zip(rngs, rngs[1:]):
            self.assertEqual(a2, b1 + 1, "trou ou chevauchement entre les plages se terminant en %d et débutant en %d" % (b1, a2))
        self.assertEqual(rngs[-1][1], total, "la dernière plage doit finir à la dernière slide du deck")


if __name__ == "__main__":
    unittest.main()
