"""Numéros de slides cités dans le Bonus (français ET anglais) : exacts après toute renumérotation.

Pour chaque module de build/course.json, dans la prose du Bonus (tagline, objectifs, À retenir, `q` et `explain` des quiz,
versions `_en` comprises) :
  - tout numéro cité après « slide(s) » ou « diapo(s) » appartient à la plage du module dans assets/plan.js ;
  - pour un quiz, il appartient aussi à son `ref` ;
  - un texte cité entre guillemets dans la même phrase qu'une citation de slide figure dans le texte (slides + notes) de
    l'une des slides citées (comparaison normalisée : espaces, guillemets/tirets typographiques, casse ; « … » / « ... »
    coupent la citation en fragments).
Une renumérotation (tools/renumber.py) ne réécrit pas la prose : ce test attrape les numéros périmés (+10, +31, +41…).
Messages : module, rang du texte et numéros — jamais d'extrait.

Exécution : python3 -m unittest discover -s tests/site/extras -p "test_slide_citations.py" -v
"""

import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

NUM = r"\d+"
RE_CITE = re.compile(r"(?i)\b(?:slides?|diapos?)\s+(" + NUM + r"(?:\s*(?:,|;|et|and|&|-|–|à|to)\s*" + NUM + r")*)")
RE_QUOTE = re.compile(r"«\s*([^»]+?)\s*»|“([^”]+)”|\"([^\"]+)\"")
RE_SENTENCE = re.compile(r"(?<=[.?!;])\s+")


def numbers(group):
    return [int(n) for n in re.findall(NUM, group)]


def bonus_texts(m):
    """[(libellé, texte, ref de quiz ou None)] — prose du Bonus fr + en d'un module."""
    out = []

    def add(label, text, ref=None):
        if isinstance(text, str) and text.strip():
            out.append((label, text, ref))

    for suffix, lang in (("", "fr"), ("_en", "en")):
        add("tagline %s" % lang, m.get("tagline" + suffix))
        for kind, key in (("objectif", "objectives"), ("à retenir", "takeaways")):
            for i, it in enumerate(m.get(key, []), 1):
                if isinstance(it, dict):
                    add("%s %d %s" % (kind, i, lang), it.get("html" + suffix))
    k = 0
    for s in m.get("slides", []):
        for b in s.get("blocks", []):
            if isinstance(b, dict) and b.get("t") == "quiz":
                k += 1
                for suffix, lang in (("", "fr"), ("_en", "en")):
                    add("quiz %d q %s" % (k, lang), b.get("q" + suffix), b.get("ref") or [])
                    add("quiz %d explain %s" % (k, lang), b.get("explain" + suffix), b.get("ref") or [])
    return out


def plain(text):
    return S.strip_html(text)


def loose(text):
    """Normalisation tolérante : casse, espaces, apostrophes/guillemets typographiques, balisage ` et ponctuation de
    séparation (« Comments Support : No » ≈ deux cellules de tableau « Comments Support » / « No »)."""
    t = S.norm(text).lower().replace("`", "")
    return S.norm(re.sub(r"[:;,]", " ", t))


def quote_fragments(sentence, lang="en"):
    """Fragments cités (≥ 4 caractères). Dans le français, un fragment accentué est une traduction du texte de la
    slide (anglais), pas une citation : il n'est pas contrôlé."""
    out = []
    for m in RE_QUOTE.finditer(sentence):
        q = next(g for g in m.groups() if g)
        for frag in re.split(r"…|\.\.\.", q):
            f = loose(frag).strip(" .")
            if len(f) < 4:
                continue
            if lang == "fr" and re.search(r"[^\x00-\x7f]", f):
                continue
            out.append(f)
    return out


def found_in(frag, source):
    """Sous-chaîne, ou — pour une citation recomposée à partir de cellules de tableau (« Comments Support : No ») —
    tous les mots du fragment présents dans le texte des slides citées."""
    if frag in source:
        return True
    words = frag.split()
    return len(words) >= 2 and set(words) <= set(source.split())


class TestCitationsDeSlides(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mods = S.modules()

    def each_module(self):
        self.assertTrue(self.mods, "course.json sans module")
        for mid, m in self.mods.items():
            if S.plan_reader.entry(mid) is None:
                continue
            yield mid, m, S.plan_reader.entry(mid)["range"]

    def test_numeros_cites_dans_la_plage_du_module(self):
        for mid, m, (a, b) in self.each_module():
            with self.subTest(module=mid):
                bad = []
                for label, text, _ref in bonus_texts(m):
                    for g in RE_CITE.findall(plain(text)):
                        bad += ["%s : slide %d" % (label, n) for n in numbers(g) if not a <= n <= b]
                self.assertEqual(bad, [], "numéro(s) hors de la plage %d-%d du module %s (renumérotation oubliée ?)" % (a, b, mid))

    def test_numeros_des_quiz_dans_leur_ref(self):
        for mid, m, _rng in self.each_module():
            with self.subTest(module=mid):
                bad = []
                for label, text, ref in bonus_texts(m):
                    if ref is None:
                        continue
                    for g in RE_CITE.findall(plain(text)):
                        bad += ["%s : slide %d (ref %s)" % (label, n, ref) for n in numbers(g) if n not in ref]
                self.assertEqual(bad, [], "numéro(s) cité(s) hors du `ref` du quiz")

    def test_texte_cite_present_dans_la_slide_citee(self):
        total = len(S.deck().slides)
        for mid, m, _rng in self.each_module():
            with self.subTest(module=mid):
                bad = []
                for label, text, _ref in bonus_texts(m):
                    for sentence in RE_SENTENCE.split(plain(text)):
                        cited = [n for g in RE_CITE.findall(sentence) for n in numbers(g) if 1 <= n <= total]
                        if not cited:
                            continue
                        source = loose(" ".join(S.pptx_full_text(n) for n in cited))
                        for frag in quote_fragments(sentence, "fr" if label.endswith(" fr") else "en"):
                            if not found_in(frag, source):
                                bad.append("%s : citation absente de la/des slide(s) %s" % (label, cited))
                self.assertEqual(bad, [], "texte cité introuvable dans la slide citée")


class TestAnalyseur(unittest.TestCase):
    """Le détecteur lui-même, sur des phrases synthétiques."""

    def cited(self, text):
        return [n for g in RE_CITE.findall(text) for n in numbers(g)]

    def test_formes_de_citation(self):
        self.assertEqual(self.cited("Voir la slide 14."), [14])
        self.assertEqual(self.cited("See slides 12, 13 and 14."), [12, 13, 14])
        self.assertEqual(self.cited("cf. slides 12-14"), [12, 14])
        self.assertEqual(self.cited("Voir la diapo 7 et la slide 9"), [7, 9])

    def test_fragments_de_citation(self):
        self.assertEqual(quote_fragments("La slide 5 dit « Use when … or loop » et rien d'autre."), ["use when", "or loop"])
        self.assertEqual(quote_fragments('See slide 5: "a b".'), [])
        self.assertEqual(quote_fragments("La slide 9 : « outils de la boîte à outils » et « Python, or any language »", "fr"),
                         ["python or any language"])
        self.assertTrue(found_in("comments support no", "comparison comments support yes yes no"))
        self.assertFalse(found_in("totally absent words", "comparison comments support yes yes no"))
        self.assertEqual(loose("Comments Support : No"), loose("comments support no"))
        self.assertEqual(loose("in the `~/.ansible/roles` directory"), "in the ~/.ansible/roles directory")

    def test_prose_du_bonus_en_deux_langues(self):
        m = {"id": "m98", "tagline": "T", "tagline_en": "T en", "objectives": [{"html": "O", "html_en": "O en", "ref": [1]}],
             "takeaways": [], "slides": [{"extra": True, "blocks": [{"t": "quiz", "q": "Q", "q_en": "Q en", "explain": "E (slide 3).",
                                                                     "explain_en": "E (slide 3).", "ref": [3]}]}]}
        labels = [l for l, _t, _r in bonus_texts(m)]
        self.assertIn("quiz 1 explain fr", labels)
        self.assertIn("quiz 1 explain en", labels)
        self.assertIn("objectif 1 en", labels)


if __name__ == "__main__":
    unittest.main()
