"""Libellés d'interface fr/en (#51) : `assets/i18n/fr.js` et `assets/i18n/en.js`, ordre des scripts.

  - mêmes clés dans fr.js et en.js, mêmes paramètres `{nom}` par clé, valeurs non vides ;
  - nouvelles clés du sélecteur de langue dans les deux fichiers (nav.lang, nav.langAria, lang.labelFr, lang.labelEn) ;
  - aucune IP hors 127.0.0.1 / 192.0.2.x dans les libellés ;
  - index.html : meta.js, engine.js, i18n/fr.js, i18n/en.js, plan.js, puis les modules, dans cet ordre.
Parseur de lignes `'clé': 'valeur',` (stdlib, sans exécuter le JS). Messages : clés seulement, jamais les valeurs.
Rouge tant que course n'a pas commité `assets/i18n/en.js` (attendu).

Exécution : python3 -m unittest discover -s tests/site/i18n -p "test_interface.py" -v
"""

import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

I18N = S.ROOT / "assets" / "i18n"
RE_LINE = re.compile(r"^\s*'([^']+)'\s*:\s*'((?:[^'\\]|\\.)*)'\s*,?\s*(?://.*)?$")
RE_PARAM = re.compile(r"\{(\w+)\}")
NEW_KEYS = ("nav.lang", "nav.langAria", "lang.labelFr", "lang.labelEn")  # lang.fr / lang.en renommées : « .fr » / « .en » seraient vus comme des domaines par l'anti-fuite (G6)


def load(lang):
    """({clé: valeur}, [lignes non reconnues]) d'un fichier de libellés."""
    path = I18N / ("%s.js" % lang)
    assert path.is_file(), "assets/i18n/%s.js absent" % lang
    labels, unknown = {}, []
    inside = False
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if re.match(r"^\s*COURSE\.i18n\['%s'\]\s*=\s*\{" % lang, line):
            inside = True
            continue
        if not inside:
            continue
        if re.match(r"^\s*\};?\s*$", line):
            break
        if not line.strip() or line.strip().startswith(("//", "/*")):
            continue
        m = RE_LINE.match(line)
        if m:
            if m.group(1) in labels:
                unknown.append("clé en double ligne %d" % n)
            labels[m.group(1)] = m.group(2)
        else:
            unknown.append("ligne %d non reconnue" % n)
    return labels, unknown


class TestLibelles(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.fr, cls.fr_unknown = load("fr")
        cls.en, cls.en_unknown = load("en")

    def test_fichiers_lisibles(self):
        self.assertEqual(self.fr_unknown, [], "fr.js")
        self.assertEqual(self.en_unknown, [], "en.js")
        self.assertTrue(self.fr and self.en)

    def test_memes_cles(self):
        self.assertEqual(sorted(set(self.fr) - set(self.en)), [], "clés de fr.js absentes de en.js")
        self.assertEqual(sorted(set(self.en) - set(self.fr)), [], "clés de en.js absentes de fr.js")

    def test_memes_parametres_par_cle(self):
        for key in sorted(set(self.fr) & set(self.en)):
            with self.subTest(cle=key):
                self.assertEqual(sorted(RE_PARAM.findall(self.fr[key])), sorted(RE_PARAM.findall(self.en[key])))

    def test_valeurs_non_vides(self):
        for name, d in (("fr", self.fr), ("en", self.en)):
            empty = [k for k, v in d.items() if not v.strip()]
            self.assertEqual(empty, [], "valeur(s) vide(s) dans %s.js" % name)

    def test_cles_du_selecteur_de_langue(self):
        for name, d in (("fr", self.fr), ("en", self.en)):
            self.assertEqual([k for k in NEW_KEYS if k not in d], [], "clé(s) du sélecteur absente(s) de %s.js" % name)

    def test_libelles_de_langue_dans_leur_propre_langue(self):
        self.assertEqual(self.fr.get("lang.labelFr"), self.en.get("lang.labelFr"), "« Français » ne se traduit pas")
        self.assertEqual(self.fr.get("lang.labelEn"), self.en.get("lang.labelEn"), "« English » ne se traduit pas")

    def test_aucune_ip_hors_documentation(self):
        for name, d in (("fr", self.fr), ("en", self.en)):
            for k, v in d.items():
                for ip in re.findall(r"(?<![\d.])(\d{1,3}(?:\.\d{1,3}){3})(?!\d)", v):
                    self.assertTrue(ip == "127.0.0.1" or ip.startswith("192.0.2."), "%s.js : IP hors documentation (%s)" % (name, k))


class TestOrdreDesScripts(unittest.TestCase):
    def test_ordre(self):
        html = (S.ROOT / "index.html").read_text(encoding="utf-8")
        srcs = re.findall(r"<script[^>]+src=[\"']([^\"']+)", html)
        fixed = ["assets/meta.js", "assets/engine.js", "assets/i18n/fr.js", "assets/i18n/en.js", "assets/plan.js"]
        pos = {s: srcs.index(s) if s in srcs else -1 for s in fixed}
        self.assertEqual([s for s in fixed if pos[s] < 0], [], "script(s) absent(s) d'index.html")
        self.assertEqual([pos[s] for s in fixed], sorted(pos[s] for s in fixed),
                         "ordre attendu : meta.js, engine.js, i18n/fr.js, i18n/en.js, plan.js")
        modules = [i for i, s in enumerate(srcs) if s.startswith("modules/")]
        self.assertTrue(modules and min(modules) > pos["assets/plan.js"], "les modules viennent après plan.js")


if __name__ == "__main__":
    unittest.main()
