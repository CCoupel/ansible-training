"""Tests de `tools/sync-meta.js` et de `assets/meta.js` (CA-5.3, version affichée sur l'accueil) — lot outils.

`assets/meta.js` est généré ET commité : il doit refléter `.claude/project-config.json`.
Interface supposée : `node tools/sync-meta.js [--check] [--version X.Y.Z]` ; écrit/contrôle
`assets/meta.js` relatif à l'outil (`<racine>/tools/..`), lit `<racine>/.claude/project-config.json`.

Exécution : python3 -m unittest discover -s tests/site -p "test_meta.py" -v
"""

import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

META = S.ROOT / "assets" / "meta.js"


class TestMetaDepot(unittest.TestCase):
    def test_check_ok_sur_l_arbre(self):
        r = S.node("tools/sync-meta.js", "--check")
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-600:])

    def test_meta_contient_version_et_reference(self):
        cfg = S.config()
        text = META.read_text(encoding="utf-8")
        base = ".".join(cfg["version"].split(".")[:3])  # 0.2.0.0 (dev) -> 0.2.0
        self.assertIn(base, text, "version absente de meta.js")
        self.assertIn(str(cfg["reference_version"]["ansible_core"]), text, "reference_version absente de meta.js")

    def test_meta_est_suivi_par_git(self):
        self.assertIn("assets/meta.js", S.git_files("assets/meta.js"))

    def test_meta_charge_avant_le_moteur(self):
        html = (S.ROOT / "index.html").read_text(encoding="utf-8")
        self.assertIn("assets/meta.js", html)
        self.assertLess(html.index("assets/meta.js"), html.index("assets/engine.js"))


class TestMetaIsole(unittest.TestCase):
    """Exécution dans une copie temporaire : le dépôt n'est jamais modifié."""

    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.root = Path(self._tmp.name)
        (self.root / "tools").mkdir()
        (self.root / "assets").mkdir()
        (self.root / ".claude").mkdir()
        shutil.copy(S.ROOT / "tools" / "sync-meta.js", self.root / "tools" / "sync-meta.js")
        shutil.copy(S.CONFIG, self.root / ".claude" / "project-config.json")
        self.before = META.read_bytes()

    def tearDown(self):
        self.assertEqual(META.read_bytes(), self.before, "le meta.js du dépôt a été modifié")

    def sync(self, *args):
        return S.node(self.root / "tools" / "sync-meta.js", *args, cwd=self.root)

    def test_version_explicite_ecrite(self):
        r = self.sync("--version", "9.9.9")
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-600:])
        text = (self.root / "assets" / "meta.js").read_text(encoding="utf-8")
        self.assertIn("9.9.9", text)
        self.assertIn(str(S.config()["reference_version"]["ansible_core"]), text)

    def test_check_apres_ecriture_ok(self):
        self.assertEqual(self.sync("--version", "9.9.9").returncode, 0)
        self.assertEqual(self.sync("--check", "--version", "9.9.9").returncode, 0)

    def test_check_detecte_un_meta_modifie(self):
        self.assertEqual(self.sync("--version", "9.9.9").returncode, 0)
        p = self.root / "assets" / "meta.js"
        p.write_text(p.read_text(encoding="utf-8") + "\n// dérive\n", encoding="utf-8")
        self.assertEqual(self.sync("--check", "--version", "9.9.9").returncode, 1)

    def test_check_detecte_une_version_differente(self):
        self.assertEqual(self.sync("--version", "9.9.9").returncode, 0)
        self.assertEqual(self.sync("--check", "--version", "8.8.8").returncode, 1)

    def test_check_sans_meta_echoue(self):
        self.assertEqual(self.sync("--check").returncode, 1)

    def test_deux_ecritures_identiques(self):
        self.sync("--version", "9.9.9")
        a = (self.root / "assets" / "meta.js").read_bytes()
        self.sync("--version", "9.9.9")
        self.assertEqual((self.root / "assets" / "meta.js").read_bytes(), a)


if __name__ == "__main__":
    unittest.main()
