"""Tests d'intégration du zip de release `tools/package.js` (CA-5.2, CA-5.4, CA-T.1) — lot livraison.

  - contenu exact : index.html + assets/** + modules/** (= fichiers suivis par git de ces chemins) + le PPTX
    « Ansible Training.pptx » à la racine (octet pour octet identique au fichier commité), rien d'autre
    (aucun autre .pptx ni .zip) ;
  - le lien de téléchargement de l'accueil (engine.js) pointe vers un fichier présent dans le zip ;
  - .gitattributes : *.pptx / *.png binary, eol=lf sur les sources texte (le PPTX ne doit pas être altéré) ;
  - déterminisme : deux exécutions → même sha256 ; entrées triées, dates fixes 1980-01-01, permissions fixes ;
  - site autonome : aucune ressource externe chargée par index.html / CSS (pas de CDN, police distante) ;
  - aucune trace du cours OpenShift dont le moteur est porté.
Interface supposée : `node tools/package.js` écrit `build/Ansible-Training-HTML.zip` (build/ ignoré par git).

Exécution : python3 -m unittest discover -s tests/site -p "test_package.py" -v
"""

import hashlib
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from urllib.parse import unquote

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

ZIP = S.ROOT / "build" / "Ansible-Training-HTML.zip"
PPTX_NAME = "Ansible Training.pptx"


def committed_pptx():
    """Octets du PPTX tel que commité (HEAD), sans conversion de fin de ligne."""
    r = subprocess.run(["git", "show", "HEAD:" + PPTX_NAME], cwd=str(S.ROOT), capture_output=True)
    assert r.returncode == 0, "git show HEAD:%s a échoué" % PPTX_NAME
    return r.stdout


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

    def test_contenu_exact_index_assets_modules_et_pptx(self):
        files = {n for n in self.names if not n.endswith("/")}
        for n in files:
            self.assertTrue(n in ("index.html", PPTX_NAME) or n.startswith(("assets/", "modules/")),
                            "entrée inattendue : %s" % n)
        tracked = set(S.git_files("index.html", "assets", "modules")) | {PPTX_NAME}
        self.assertEqual(files, tracked,
                         "le zip doit contenir exactement les fichiers suivis (index.html, assets/, modules/) + le PPTX")

    def test_pptx_a_la_racine_a_cote_de_index_html(self):
        self.assertIn(PPTX_NAME, self.names)
        self.assertIn("index.html", self.names)
        self.assertEqual(self.names.count(PPTX_NAME), 1, "PPTX en double dans l'archive")

    def test_pptx_identique_octet_pour_octet(self):
        data = self.zf.read(PPTX_NAME)
        ref = committed_pptx()
        self.assertEqual(len(data), len(ref), "taille différente du PPTX commité (conversion de fin de ligne ?)")
        self.assertEqual(hashlib.sha256(data).hexdigest(), hashlib.sha256(ref).hexdigest())

    def test_pptx_embarque_est_un_zip_ooxml_valide(self):
        data = self.zf.read(PPTX_NAME)
        self.assertEqual(data[:4], b"PK\x03\x04")
        tmp = Path(self.tmp) / "embedded.pptx"
        tmp.write_bytes(data)
        with zipfile.ZipFile(tmp) as z:
            self.assertIsNone(z.testzip())
            self.assertIn("[Content_Types].xml", z.namelist())

    def test_aucun_autre_pptx_ni_zip(self):
        for n in self.names:
            if n == PPTX_NAME:
                continue
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
            target = unquote(attr.split("?")[0])
            self.assertIn(target, self.names, "ressource absente du zip : %s" % attr)

    def test_lien_pptx_de_l_accueil_present_dans_le_zip(self):
        """Le lien « Télécharger le PPTX » (home.download, engine.js) vise un fichier embarqué (plus de 404 dans le zip)."""
        engine = self.zf.read("assets/engine.js").decode("utf-8")
        hrefs = re.findall(r"""href\s*=\s*["']([^"'$]+\.pptx)["']""", engine, re.I)
        self.assertTrue(hrefs, "aucun lien .pptx dans engine.js")
        for h in hrefs:
            self.assertFalse(re.match(r"(?i)(https?:)?//|/|file:", h), "lien non relatif : %s" % h)
            self.assertIn(unquote(h), self.names, "lien PPTX mort dans le zip : %s" % h)
        fr = self.zf.read("assets/i18n/fr.js").decode("utf-8")
        self.assertIn("home.download", fr)


class TestGitattributes(unittest.TestCase):
    """.gitattributes : le PPTX et les PNG ne doivent jamais subir de conversion de fin de ligne."""

    @classmethod
    def setUpClass(cls):
        p = S.ROOT / ".gitattributes"
        assert p.is_file(), ".gitattributes absent à la racine"
        cls.rules = {}
        for ln in p.read_text(encoding="utf-8").splitlines():
            ln = ln.strip()
            if ln and not ln.startswith("#"):
                pat, *attrs = ln.split()
                cls.rules.setdefault(pat, set()).update(attrs)

    def test_pptx_et_png_binary(self):
        for pat in ("*.pptx", "*.png"):
            self.assertIn("binary", self.rules.get(pat, set()), "%s doit être « binary »" % pat)

    def test_sources_texte_eol_lf(self):
        for pat in ("*.js", "*.css", "*.html", "*.py"):
            self.assertIn("eol=lf", self.rules.get(pat, set()), "%s doit avoir eol=lf" % pat)

    def test_pptx_non_converti_par_git(self):
        r = S.run(["git", "check-attr", "-a", "--", PPTX_NAME])
        self.assertEqual(r.returncode, 0)
        self.assertIn("binary: set", r.stdout)


if __name__ == "__main__":
    unittest.main()
