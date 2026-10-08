"""Hygiène du dépôt public et cohérence de version (CA-T.2, CA-5.3) — lot livraison.

  - aucun artefact généré non prévu n'est SUIVI par git (build/, zip, course.json, planches de revue) ;
  - `assets/meta.js` est le seul fichier généré suivi ;
  - chaque `modules/*.js` est chargé par `index.html` et chaque `<script src>` existe et est suivi (miroir du validateur) ;
  - `build/` est ignoré ;
  - version : avec RELEASE_TAG=vX.Y.Z (CI release), slide 2 du PPTX et `assets/meta.js` affichent X.Y.Z.

Exécution : python3 -m unittest discover -s tests/site -p "test_repo_hygiene.py" -v
"""

import os
import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

FORBIDDEN = re.compile(r"(^|/)(build|dist)/|\.zip$|(^|/)course\.json$|extras-review\.md$|img-contact\.html$|__pycache__|\.orig\.pptx$")


class TestHygiene(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tracked = S.git_files()

    def test_aucun_artefact_genere_suivi(self):
        bad = [p for p in self.tracked if FORBIDDEN.search(p)]
        self.assertEqual(bad, [], "artefact(s) suivi(s) par git : %s" % ", ".join(bad))

    def test_meta_js_seul_fichier_genere_du_site(self):
        self.assertIn("assets/meta.js", self.tracked)
        gen = [p for p in self.tracked if p.startswith(("assets/", "modules/", "tools/")) and re.search(r"(generated|\.min\.|\.map$)", p)]
        self.assertEqual(gen, [], "fichier(s) généré(s) inattendu(s) : %s" % ", ".join(gen))

    def test_build_est_ignore(self):
        r = S.run(["git", "check-ignore", "-q", "build/course.json"])
        self.assertEqual(r.returncode, 0, "build/ doit être dans .gitignore")

    def test_chaque_module_est_charge_par_index_html(self):
        html = (S.ROOT / "index.html").read_text(encoding="utf-8")
        mods = [p for p in self.tracked if re.fullmatch(r"modules/m\d\d-[a-z0-9-]+\.js", p)]
        self.assertTrue(mods, "aucun module suivi")
        for p in mods:
            with self.subTest(module=p):
                self.assertIn(p, html, "module non chargé par index.html")

    def test_noms_de_modules_conformes(self):
        for p in self.tracked:
            if p.startswith("modules/"):
                self.assertRegex(p, r"modules/m(0[1-9]|[1-9]\d)-[a-z0-9-]+\.js$", "nom de module non conforme : %s" % p)
                self.assertIn(p.split("/")[1][:3], {m["id"] for m in S.plan_reader.plan()},
                              "module absent de assets/plan.js : %s" % p)

    def test_scripts_de_index_html_existent_et_sont_suivis(self):
        html = (S.ROOT / "index.html").read_text(encoding="utf-8")
        for src in re.findall(r"<script[^>]+src=[\"']([^\"']+)", html):
            with self.subTest(script=src):
                self.assertFalse(re.match(r"(?i)(https?:)?//", src), "script externe")
                self.assertIn(src, self.tracked, "script absent ou non suivi (404 au double-clic)")

    def test_fichiers_attendus_du_site_suivis(self):
        for p in ("index.html", "assets/engine.js", "assets/style.css", "assets/plan.js", "assets/meta.js",
                  "assets/img/images.json", "CONVENTIONS.md", "tools/validate.js", "tools/sync-meta.js",
                  "tools/dump-course.js", "tools/package.js", "tools/check_links.py", "tests/site/check_site.py"):
            with self.subTest(fichier=p):
                self.assertIn(p, self.tracked)

    def test_pptx_reste_a_la_racine(self):
        self.assertIn("Ansible Training.pptx", self.tracked)

    def test_outils_de_controle_du_pptx_toujours_suivis(self):
        for p in ("tests/slides/check_pptx.py", "tests/slides/pptx_reader.py", "tests/slides/expected.json"):
            self.assertIn(p, self.tracked)


@unittest.skipUnless(os.environ.get("RELEASE_TAG"), "RELEASE_TAG non défini (contrôle exécuté en CI release)")
class TestVersionRelease(unittest.TestCase):
    def setUp(self):
        self.version = os.environ["RELEASE_TAG"].lstrip("v")

    def test_slide_2_affiche_la_version_du_tag(self):
        self.assertIn("v" + self.version, S.deck().slide(2).text)

    def test_meta_js_affiche_la_version_du_tag(self):
        self.assertIn(self.version, (S.ROOT / "assets" / "meta.js").read_text(encoding="utf-8"))

    def test_sync_meta_check_avec_la_version_du_tag(self):
        r = S.node("tools/sync-meta.js", "--check", "--version", self.version)
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-600:])


if __name__ == "__main__":
    unittest.main()
