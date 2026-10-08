"""Garde-fou #5 : l'agenda de la slide 3 du PPTX est cohérent avec les `day` de assets/plan.js.

La slide 3 liste, par colonne « Day N : », des libellés de modules et des pauses. Une table de correspondance
libellé d'agenda → id de module permet de comparer, jour par jour et dans l'ordre, les modules de l'agenda aux
modules de même `day` (J1..J4) du plan.
  - tolérés : les libellés non-modules (« Lunch Break », lignes vides) ; plusieurs libellés pour un même module
    (ex. « Introduction », « What is Ansible » → m01) ; un module « réservé » (RESERVED, vide depuis le lot 2) présent à l'agenda mais pas encore dans plan.js ;
  - refusés : un module de plan.js absent de l'agenda ; un libellé inconnu de la table (à ajouter ici) ; un module
    dans le mauvais jour ou dans le mauvais ordre ; un nombre de jours différent de 4.
Les messages citent jours et ids de modules, jamais le texte des slides.

Exécution : python3 -m unittest discover -s tests/site/outils -p "test_agenda.py" -v
"""

import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

AGENDA_SLIDE = 3
DAYS = 4
RESERVED = set()  # m14 (Event-Driven Ansible) est dans plan.js depuis le lot 2 : plus aucun module réservé
NON_MODULE = {"lunch break"}

# libellé de l'agenda (minuscules, espaces normalisés) -> id de module
LABELS = {
    "introduction": "m01", "what is ansible": "m01", "how does it work": "m01", "commande line": "m01",
    "command line": "m01", "inventory": "m02", "playbooks": "m03", "modules": "m04",
    "variables": "m05", "errors": "m06", "delegation": "m06",
    "filters": "m07", "conditions": "m07", "loops": "m08", "tags": "m08",
    "templates jinja2": "m09", "asynch": "m09", "async": "m09", "vault": "m10",
    "roles and galaxy": "m11", "strategies": "m12", "extend ansible": "m12", "write a module": "m12",
    "execution environments": "m13", "event-driven ansible": "m14",
    "real use case": "m15", "best practices": "m16", "automation integration": "m17",
}


def agenda_columns():
    """{n: [libellés bruts non vides]} lu sur la slide 3, colonnes « Day N : »."""
    cols, current = {}, None
    for line in S.deck().slide(AGENDA_SLIDE).paragraphs:
        text = S.norm(line)
        m = re.match(r"(?i)^day\s*(\d+)\s*:?$", text)
        if m:
            current = int(m.group(1))
            cols[current] = []
        elif text and current is not None:
            cols[current].append(text)
    return cols


def modules_of(labels):
    """Ids de modules d'une colonne, dans l'ordre, doublons consécutifs fusionnés ; libellés inconnus listés."""
    ids, unknown = [], []
    for lab in labels:
        key = S.norm(lab).lower()
        if key in NON_MODULE:
            continue
        mid = LABELS.get(key)
        if mid is None:
            unknown.append(lab)
        elif not ids or ids[-1] != mid:
            ids.append(mid)
    return ids, unknown


class TestAgenda(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cols = agenda_columns()

    def test_quatre_jours_dans_l_ordre(self):
        self.assertEqual(sorted(self.cols), list(range(1, DAYS + 1)),
                         "la slide 3 doit contenir « Day 1 : » à « Day %d : » (jours trouvés : %s)" % (DAYS, sorted(self.cols)))

    def test_libelles_connus(self):
        for n, labels in self.cols.items():
            with self.subTest(jour=n):
                unknown = modules_of(labels)[1]
                self.assertEqual(unknown, [], "jour %d : %d libellé(s) inconnu(s) de la table de correspondance du test" % (n, len(unknown)))

    def test_chaque_jour_a_une_pause_dejeuner(self):
        for n, labels in self.cols.items():
            with self.subTest(jour=n):
                self.assertTrue(any(S.norm(l).lower() == "lunch break" for l in labels), "jour %d sans « Lunch Break »" % n)

    def test_modules_de_chaque_jour_conformes_a_plan_js(self):
        plan = S.plan_reader.plan()
        for n in range(1, DAYS + 1):
            with self.subTest(jour=n):
                self.assertIn(n, self.cols, "jour %d absent de la slide 3" % n)
                agenda, unknown = modules_of(self.cols[n])
                self.assertEqual(unknown, [], "jour %d : libellé(s) inconnu(s) de la table du test" % n)
                planned = [p["id"] for p in plan if p["day"] == "J%d" % n]
                present_in_plan = {p["id"] for p in plan}
                # m14 (EDA) toléré à l'agenda tant qu'il n'est pas dans plan.js
                agenda_cmp = [m for m in agenda if m in present_in_plan or m not in RESERVED]
                self.assertEqual(agenda_cmp, planned,
                                 "jour %d : agenda %s ≠ plan.js %s" % (n, agenda_cmp, planned))

    def test_aucun_module_du_plan_absent_de_l_agenda(self):
        in_agenda = {m for labels in self.cols.values() for m in modules_of(labels)[0]}
        missing = [p["id"] for p in S.plan_reader.plan() if p["id"] not in in_agenda]
        self.assertEqual(missing, [], "module(s) de plan.js absent(s) de l'agenda")

    def test_aucun_module_de_l_agenda_hors_plan_sauf_reserve(self):
        in_plan = {p["id"] for p in S.plan_reader.plan()}
        extra = sorted({m for labels in self.cols.values() for m in modules_of(labels)[0]} - in_plan - RESERVED)
        self.assertEqual(extra, [], "module(s) de l'agenda absent(s) de plan.js")


if __name__ == "__main__":
    unittest.main()
