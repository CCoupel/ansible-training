"""Tests d'intégration du zip de release `tools/package.js` (CA-5.2, CA-5.4, CA-T.1) — lot livraison.

  - contenu exact : index.html + assets/** + modules/** (= fichiers suivis par git de ces chemins), rien d'autre
    (le PPTX reste un asset de release séparé) ;
  - déterminisme : deux exécutions → même sha256 ; entrées triées, dates fixes 1980-01-01, permissions fixes ;
  - site autonome : aucune ressource externe chargée par index.html / CSS (pas de CDN, police distante) ;
  - aucune trace du cours OpenShift dont le moteur est porté.
Interface supposée : `node tools/package.js` écrit `build/Ansible-Training-HTML.zip` (build/ ignoré par git).

Exécution : python3 -m unittest discover -s tests/site -p "test_package.py" -v
"""

import hashlib
import re
import shutil
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

ZIP = S.ROOT / "build" / "Ansible-Training-HTML.zip"


def package():
    r = S.node("tools/package.js")
    assert r.returncode == 0, "node tools/package.js a échoué : " + (r.stdout + r.stderr)[-600:]
    return ZIP.read_bytes()


class TestPackage(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.first = package()
        cls.second = package()
        cls.tmp = tempfile.mkdtemp()
        zp = Path(cls.tmp) / "site.zip"
        zp.write_bytes(cls.first)
        cls.zf = zipfile.ZipFile(zp)
        cls.names = cls.zf.namelist()

    @classmethod
    def tearDownClass(cls):
        cls.zf.close()
        shutil.rmtree(cls.tmp, ignore_errors=True)

    def test_zip_valide(self):
        self.assertIsNone(self.zf.testzip())

    def test_deux_executions_meme_sha256(self):
        self.assertEqual(hashlib.sha256(self.first).hexdigest(), hashlib.sha256(self.second).hexdigest())

    def test_contenu_exact_index_assets_modules(self):
        files = {n for n in self.names if not n.endswith("/")}
        for n in files:
            self.assertTrue(n == "index.html" or n.startswith(("assets/", "modules/")), "entrée inattendue : %s" % n)
        tracked = set(S.git_files("index.html", "assets", "modules"))
        self.assertEqual(files, tracked, "le zip doit contenir exactement les fichiers suivis (index.html, assets/, modules/)")

    def test_ni_pptx_ni_build_ni_outils(self):
        for n in self.names:
            self.assertFalse(n.lower().endswith((".pptx", ".zip")), n)
            self.assertFalse(n.startswith(("build/", "tools/", "tests/", ".git", ".claude/")), n)

    def test_entrees_triees(self):
        self.assertEqual(self.names, sorted(self.names))

    def test_dates_fixes(self):
        for i in self.zf.infolist():
            self.assertEqual(i.date_time[:3], (1980, 1, 1), "date non fixe : %s" % i.filename)

    def test_permissions_uniformes_pour_les_fichiers(self):
        modes = {i.external_attr >> 16 & 0o777 for i in self.zf.infolist() if not i.filename.endswith("/")}
        self.assertEqual(len(modes), 1, "permissions non uniformes : %s" % sorted(oct(m) for m in modes))

    def test_index_html_sans_ressource_externe(self):
        html = self.zf.read("index.html").decode("utf-8")
        for tag in re.findall(r"<(?:script|link|img|iframe)\b[^>]*>", html, re.I):
            for attr in re.findall(r"""(?:src|href)\s*=\s*["']([^"']+)""", tag, re.I):
                self.assertFalse(re.match(r"(?i)(https?:)?//", attr), "ressource externe : %s" % attr)

    def test_css_sans_ressource_externe(self):
        for n in self.names:
            if n.endswith(".css"):
                css = self.zf.read(n).decode("utf-8", "replace")
                self.assertNotRegex(css, r"(?i)@import\s+(url\()?['\"]?(https?:)?//", n)
                self.assertNotRegex(css, r"(?i)url\(\s*['\"]?(https?:)?//", n)

    def test_aucune_trace_openshift(self):
        pptx_txt = " ".join(S.pptx_full_text(n).lower() for n in range(1, len(S.deck().slides) + 1))
        terms = ["ocp-course"]
        if "openshift" not in pptx_txt:
            terms.append("openshift")
        for n in self.names:
            if not n.endswith((".js", ".css", ".html", ".json", ".md")):
                continue
            text = self.zf.read(n).decode("utf-8", "replace").lower()
            for t in terms:
                self.assertNotIn(t, text, "trace du cours d'origine dans %s" % n)
            self.assertNotRegex(text, r"""kind\s*:\s*['"](k8s|ocp|cloud|onprem)['"]""", "callout OpenShift dans %s" % n)

    def test_cle_localstorage_du_cours(self):
        engine = self.zf.read("assets/engine.js").decode("utf-8")
        self.assertIn("ansible-training-v1", engine)

    def test_site_autonome_double_clic(self):
        """index.html référence des chemins relatifs existants dans le zip (pas de chemin absolu ni file://)."""
        html = self.zf.read("index.html").decode("utf-8")
        for attr in re.findall(r"""(?:src|href)\s*=\s*["']([^"'#]+)""", html, re.I):
            if re.match(r"(?i)(https?:|mailto:|data:)", attr):
                continue
            self.assertFalse(attr.startswith(("/", "file:")), "chemin non relatif : %s" % attr)
            target = attr.split("?")[0].replace("%20", " ")
            if target.lower().endswith(".pptx"):
                continue  # lien de téléchargement : asset de release / servi par Pages
            self.assertIn(target, self.names, "ressource absente du zip : %s" % attr)


if __name__ == "__main__":
    unittest.main()
