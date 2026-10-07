"""Tests d'intégration de tests/site/check_site.py (anti-fuite du HTML commité, CA-T.1) — lot outils.

Chaque test fabrique un mini dépôt git temporaire (site piégé) et lance le script en sous-processus
avec `--repo` : code de sortie, motifs signalés et surtout MASQUAGE — la sortie ne contient jamais le
terme trouvé (logs Actions publics). Le terme interdit est un mot fictif.

Exécution : python3 -m unittest discover -s tests/site -p "test_check_site.py" -v
"""

import os
import struct
import subprocess
import sys
import tempfile
import unittest
import zlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

SCRIPT = S.ROOT / "tests" / "site" / "check_site.py"
FAKE = "zorbglub"  # terme interdit fictif
PATTERN_ENV = {"LEAK_PATTERNS": FAKE}
NO_SECRET = {"LEAK_PATTERNS": ""}


def png(text_chunk=None, chunk_type=b"tEXt"):
    def chunk(t, body):
        return struct.pack(">I", len(body)) + t + body + struct.pack(">I", zlib.crc32(t + body) & 0xFFFFFFFF)

    out = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    if text_chunk:
        out += chunk(chunk_type, b"Comment\x00" + text_chunk.encode("latin-1"))
    return out + chunk(b"IDAT", zlib.compress(b"\x00\x00\x00\x00")) + chunk(b"IEND", b"")


CLEAN = {
    "index.html": '<!doctype html><title>Cours</title><script src="modules/m02-inventory.js"></script>',
    "assets/engine.js": "var a = 1; // moteur",
    "modules/m02-inventory.js": "COURSE.add({id:'m02', slides:[{title:'Inventory', blocks:[{t:'text', html:'Hôte 192.0.2.10'}]}]});",
    "CONVENTIONS.md": "# Conventions\nTexte neutre.",
}


class Base(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.repo = Path(self._tmp.name)
        self.addCleanup(self._tmp.cleanup)
        subprocess.run(["git", "init", "-q", str(self.repo)], check=True)

    def populate(self, files, track=True):
        for rel, data in files.items():
            p = self.repo / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_bytes(data if isinstance(data, bytes) else data.encode("utf-8"))
        if track:
            subprocess.run(["git", "-C", str(self.repo), "add", "-A"], check=True)

    def run_check(self, *args, env=None, repo=True):
        e = {"LEAK_PATTERNS": "", "CI": ""}
        e.update(env or {})
        cmd = [sys.executable, "-I", str(SCRIPT)]
        if repo:
            cmd += ["--repo", str(self.repo)]
        return S.run(cmd + list(args), env=e)

    def out(self, r):
        return r.stdout + r.stderr


class TestPerimetreEtMotifs(Base):
    def test_site_propre_ok(self):
        self.populate(CLEAN)
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 0, self.out(r))

    def test_motif_dans_un_module_js(self):
        self.populate(dict(CLEAN, **{"modules/m02-inventory.js": "COURSE.add({t:'%s'});" % FAKE}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertIn("modules/m02-inventory.js", r.stdout)
        self.assertIn("L1", r.stdout)

    def test_motif_dans_index_html(self):
        self.populate(dict(CLEAN, **{"index.html": "<title>%s</title>" % FAKE}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertIn("index.html", r.stdout)

    def test_motif_dans_un_attribut_alt(self):
        self.populate(dict(CLEAN, **{"modules/m02-inventory.js": "x = '<img alt=\"logo %s\">';" % FAKE}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertIn("L1", r.stdout)

    def test_motif_dans_un_chunk_texte_png(self):
        self.populate(dict(CLEAN, **{"assets/img/s05-1.png": png("Author=%s" % FAKE)}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertIn("assets/img/s05-1.png", r.stdout)

    def test_metadonnees_png_signalees_meme_sans_motif(self):
        self.populate(dict(CLEAN, **{"assets/img/s05-1.png": png("Software=Quelque chose")}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertIn("G7", r.stdout)

    def test_png_sans_metadonnees_ok(self):
        self.populate(dict(CLEAN, **{"assets/img/s05-1.png": png()}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 0, self.out(r))

    def test_ip_hors_plages_autorisees(self):
        self.populate(dict(CLEAN, **{"assets/engine.js": "var ip = '10.12.13.14';"}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertIn("G5", r.stdout)
        self.assertNotIn("10.12.13.14", self.out(r))

    def test_domaine_hors_liste_blanche(self):
        self.populate(dict(CLEAN, **{"CONVENTIONS.md": "Voir https://intranet.exemple-corp.com/x"}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertIn("G6", r.stdout)

    def test_marqueur_de_classification(self):
        self.populate(dict(CLEAN, **{"CONVENTIONS.md": "# Titre\nConfidentiel\n"}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertIn("G2", r.stdout)

    def test_sortie_ne_contient_jamais_le_terme(self):
        self.populate(dict(CLEAN, **{"assets/engine.js": "// %s" % FAKE, "index.html": "<p>%s</p>" % FAKE}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertNotIn(FAKE, self.out(r))

    def test_nom_de_fichier_contenant_le_terme_est_masque(self):
        self.populate(dict(CLEAN, **{"assets/img/%s.png" % FAKE: png()}))
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)
        self.assertNotIn(FAKE, self.out(r))

    def test_perimetre_par_defaut_ignore_les_fichiers_non_suivis(self):
        self.populate(CLEAN)
        self.populate({"build/course.json": '{"x":"%s"}' % FAKE, "assets/brouillon.js": "// %s" % FAKE}, track=False)
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 0, self.out(r))

    def test_perimetre_vide_est_une_erreur(self):
        self.populate({"autre.txt": "rien"})
        r = self.run_check(env=PATTERN_ENV)
        self.assertEqual(r.returncode, 1)

    def test_option_dir_scanne_tout_le_dossier(self):
        d = self.repo / "dezip"
        self.populate({"dezip/index.html": "<p>%s</p>" % FAKE, "dezip/assets/a.js": "ok"}, track=False)
        r = self.run_check("--dir", str(d), env=PATTERN_ENV, repo=False)
        self.assertEqual(r.returncode, 1)
        self.assertIn("index.html", r.stdout)
        self.assertNotIn(FAKE, self.out(r))

    def test_option_dir_propre_ok(self):
        d = self.repo / "dezip"
        self.populate({"dezip/index.html": "<p>ok</p>", "dezip/assets/a.js": "var a;"}, track=False)
        r = self.run_check("--dir", str(d), env=PATTERN_ENV, repo=False)
        self.assertEqual(r.returncode, 0, self.out(r))


class TestSecret(Base):
    def test_sans_secret_avertissement_non_bloquant(self):
        self.populate(CLEAN)
        r = self.run_check(env=NO_SECRET)
        self.assertEqual(r.returncode, 0, self.out(r))
        self.assertIn("AVERTISSEMENT", r.stderr)

    def test_require_secret_sans_secret_echoue(self):
        self.populate(CLEAN)
        r = self.run_check("--require-secret", env=NO_SECRET)
        self.assertEqual(r.returncode, 1)

    def test_require_secret_en_ci_sans_secret_echoue(self):
        self.populate(CLEAN)
        r = self.run_check("--require-secret", env={"LEAK_PATTERNS": "", "CI": "true"})
        self.assertEqual(r.returncode, 1)

    def test_require_secret_avec_secret_ok(self):
        self.populate(CLEAN)
        r = self.run_check("--require-secret", env=PATTERN_ENV)
        self.assertEqual(r.returncode, 0, self.out(r))

    def test_regex_invalide_signalee_sans_afficher_le_contenu(self):
        self.populate(CLEAN)
        r = self.run_check(env={"LEAK_PATTERNS": "(zorbglub"})
        self.assertEqual(r.returncode, 1)
        self.assertNotIn(FAKE, self.out(r))


class TestSiteReel(unittest.TestCase):
    def test_site_commite_passe_les_motifs_generiques(self):
        """CA-T.1 : index.html, assets/**, modules/**, CONVENTIONS.md suivis par git (motifs génériques)."""
        r = S.run([sys.executable, "-I", str(SCRIPT)], env={"CI": "", "LEAK_PATTERNS": os.environ.get("LEAK_PATTERNS", "")})
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-1500:])


if __name__ == "__main__":
    unittest.main()
