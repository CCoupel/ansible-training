"""Tests du contenu additionnel « Bonus HTML » (Q2 : objectifs, quiz, À retenir) — CA-3.3, CA-3.5.

Règle n° 7 du plan : tout contenu additionnel est dérivé UNIQUEMENT du PPTX. Vérifié ici pour chaque
module présent dans build/course.json (les 15 avec PARITY_STRICT=1) :
  - 3-5 objectifs, 4-6 « À retenir », 1-3 quiz (3-4 options, `answer` valide, `explain` non vide) ;
  - `ref` : entiers, non vides, ⊂ slides PPTX (`src`) du MÊME module ;
  - chaque <code>…</code> d'un texte additionnel figure dans le texte PPTX (slides + notes) des slides `ref` ;
  - aucune IP hors 192.0.2.x ; aucune version d'Ansible différente de `reference_version` ;
  - toute slide contenant un quiz porte `extra: true` et n'a pas de `src`.
Les messages citent module / rang / n° de slide, jamais le texte.

Exécution : python3 -m unittest discover -s tests/site -p "test_extras.py" -v
"""

import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

RE_CODE = re.compile(r"<code>(.*?)</code>", re.S | re.I)
RE_IP = re.compile(r"(?<![\d.])(\d{1,3}(?:\.\d{1,3}){3})(?![\d])")
RE_ANSIBLE_VER = re.compile(r"(?i)\b(ansible(?:-core)?)[\s-]*v?(\d+\.\d+)(?:\.\d+)?")


def _text(item):
    if isinstance(item, dict):
        return " ".join(S.all_strings({k: v for k, v in item.items() if k != "ref"}))
    return str(item)


def additional_items(m):
    """[(libellé, texte, ref)] : objectifs, À retenir, quiz (q + options + explain) d'un module."""
    out = []
    for i, o in enumerate(m.get("objectives", []), 1):
        out.append(("objectif %d" % i, _text(o), o.get("ref") if isinstance(o, dict) else None))
    for i, o in enumerate(m.get("takeaways", []), 1):
        out.append(("à retenir %d" % i, _text(o), o.get("ref") if isinstance(o, dict) else None))
    for q in quizzes(m):
        out.append(("quiz %d" % q["_rank"], _text(q), q.get("ref")))
    return out


def quizzes(m):
    out, k = [], 0
    for s in m.get("slides", []):
        for b in s.get("blocks", []):
            if isinstance(b, dict) and b.get("t") == "quiz":
                k += 1
                out.append(dict(b, _rank=k, _slide=s))
    return out


class TestExtras(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mods = S.modules()
        cls.scope = S.modules_in_scope()

    def each_module(self):
        self.assertTrue(self.mods, "course.json sans module : le site n'existe pas encore")
        for mid in self.scope:
            if mid not in self.mods:
                self.fail("module %s absent de course.json (PARITY_STRICT=1)" % mid)
            yield mid, self.mods[mid]

    def test_pilote_m02_present(self):
        self.assertIn("m02", self.mods, "le module pilote m02 doit être présent")

    def test_nombre_objectifs(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                self.assertTrue(3 <= len(m.get("objectives", [])) <= 5, "%d objectifs" % len(m.get("objectives", [])))

    def test_nombre_a_retenir(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                self.assertTrue(4 <= len(m.get("takeaways", [])) <= 6, "%d points" % len(m.get("takeaways", [])))

    def test_nombre_et_forme_des_quiz(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                qs = quizzes(m)
                self.assertTrue(1 <= len(qs) <= 3, "%d quiz" % len(qs))
                for q in qs:
                    opts = q.get("options", [])
                    self.assertTrue(3 <= len(opts) <= 4, "quiz %d : %d options" % (q["_rank"], len(opts)))
                    self.assertIsInstance(q.get("answer"), int, "quiz %d : answer non entier" % q["_rank"])
                    self.assertTrue(0 <= q["answer"] < len(opts), "quiz %d : answer hors limites" % q["_rank"])
                    self.assertTrue(str(q.get("explain", "")).strip(), "quiz %d : explain vide" % q["_rank"])
                    self.assertEqual(len(set(map(str, opts))), len(opts), "quiz %d : options en double" % q["_rank"])

    def test_ref_valides_et_dans_le_module(self):
        for mid, m in self.each_module():
            src = S.module_src(m)
            with self.subTest(module=mid):
                for label, _txt, ref in additional_items(m):
                    self.assertIsInstance(ref, list, "%s : ref absent" % label)
                    self.assertTrue(ref, "%s : ref vide" % label)
                    for n in ref:
                        self.assertIsInstance(n, int, "%s : ref non entier" % label)
                        self.assertIn(n, src, "%s : slide %s hors du module %s" % (label, n, mid))
                        self.assertNotIn(n, S.hidden_slides(), "%s : slide %s masquée" % (label, n))

    def test_code_du_bonus_present_dans_le_pptx_des_slides_ref(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                for label, txt, ref in additional_items(m):
                    if not isinstance(ref, list):
                        continue  # signalé par test_ref_valides
                    source = S.norm(" ".join(S.pptx_full_text(n) for n in ref if 1 <= n <= 223))
                    for code in RE_CODE.findall(txt):
                        c = S.norm(S._html.unescape(re.sub(r"<[^>]+>", "", code)))
                        if c:
                            self.assertIn(c, source, "%s : un <code> est absent du PPTX des slides ref %s" % (label, ref))

    def test_aucune_ip_hors_documentation(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                for label, txt, _ref in additional_items(m):
                    for ip in RE_IP.findall(S.strip_html(txt)):
                        octets = [int(x) for x in ip.split(".")]
                        if any(o > 255 for o in octets):
                            continue  # numéro de version
                        self.assertEqual(ip.rsplit(".", 1)[0], "192.0.2", "%s : IP hors 192.0.2.x" % label)

    def test_aucune_version_ansible_differente_de_la_reference(self):
        ref = S.config()["reference_version"]["ansible_core"]
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                for label, txt, _ref in additional_items(m):
                    for name, ver in RE_ANSIBLE_VER.findall(S.strip_html(txt)):
                        self.assertEqual(ver, ref, "%s : version %s ≠ référence %s" % (label, ver, ref))

    def test_slides_de_quiz_marquees_extra_sans_src(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                for s in m.get("slides", []):
                    if any(isinstance(b, dict) and b.get("t") == "quiz" for b in s.get("blocks", [])):
                        self.assertIs(s.get("extra"), True, "slide de quiz sans extra: true")
                        self.assertFalse(s.get("src"), "slide de quiz avec src")

    def test_slides_extra_sans_src_et_non_extra_avec_src(self):
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                for i, s in enumerate(m.get("slides", []), 1):
                    if s.get("extra"):
                        self.assertFalse(s.get("src"), "slide %d extra avec src" % i)
                    else:
                        self.assertTrue(s.get("src"), "slide %d sans src ni extra" % i)

    def test_bonus_sans_reference_a_une_organisation_generique(self):
        """Aucun nom d'hôte/domaine hors liste blanche dans le bonus (le secret complet est vérifié par check_site)."""
        sys.path.insert(0, str(S.ROOT / "tests" / "slides"))
        import check_pptx as cp
        for mid, m in self.each_module():
            with self.subTest(module=mid):
                for label, txt, _ref in additional_items(m):
                    for d in cp.RE_DOMAIN.findall(S.strip_html(txt)):
                        self.assertTrue(cp.domain_allowed(d), "%s : domaine hors liste blanche" % label)


if __name__ == "__main__":
    unittest.main()
