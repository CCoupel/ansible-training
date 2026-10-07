"""Tests hors ligne des liens (#50, CA-50.3, CA-50.4) — lot outils. Aucun accès réseau.

  - plus aucune URL `docs.ansible.com/ansible/latest/` dans le PPTX (texte, notes, relations .rels) ni dans course.json ;
  - toute URL du HTML (hors espaces de noms XML du SVG) figure dans le PPTX (le HTML n'invente pas de lien) ;
  - les liens `href` du HTML sont en https ;
  - `tools/check_links.py --offline` (vérification de forme) réussit.
La vérification en ligne (`--online`, débit limité) n'est JAMAIS lancée par ces tests ni en CI.

Exécution : python3 -m unittest discover -s tests/site -p "test_links_offline.py" -v
"""

import re
import sys
import unittest
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

OLD = re.compile(r"docs\.ansible\.com/ansible/latest/", re.I)
URL = re.compile(r"https?://[^\s\"'<>\\]+")
HREF = re.compile(r"""href\s*=\s*(["'])(.*?)\1""", re.I | re.S)
NS_OK = ("http://www.w3.org/",)


def clean(u):
    return S._html.unescape(u).rstrip(".,;:)]}'\"/")


def pptx_all_urls():
    """URL du PPTX : texte des slides, notes et cibles externes des .rels."""
    urls = set()
    with zipfile.ZipFile(S.PPTX) as z:
        for name in z.namelist():
            if name.endswith((".xml", ".rels")):
                for u in URL.findall(z.read(name).decode("utf-8", "replace")):
                    urls.add(clean(u))
    return urls


class TestLiensHorsLigne(unittest.TestCase):
    def test_pptx_sans_ancienne_forme_docs_ansible(self):
        bad = []
        with zipfile.ZipFile(S.PPTX) as z:
            for name in z.namelist():
                if name.endswith((".xml", ".rels")) and OLD.search(z.read(name).decode("utf-8", "replace")):
                    bad.append(name)
        self.assertEqual(bad, [], "ancienne URL dans : %s" % ", ".join(bad))

    def test_html_sans_ancienne_forme_docs_ansible(self):
        bad = [i for i, s in enumerate(S.all_strings(S.course()), 1) if OLD.search(s)]
        self.assertEqual(bad, [], "ancienne URL dans %d chaîne(s) de course.json" % len(bad))

    def test_fichiers_du_site_sans_ancienne_forme(self):
        bad = []
        for rel in S.git_files("index.html", "assets", "modules", "CONVENTIONS.md"):
            p = S.ROOT / rel
            if p.suffix in (".html", ".js", ".md", ".json", ".css") and OLD.search(p.read_text(encoding="utf-8", errors="replace")):
                bad.append(rel)
        self.assertEqual(bad, [], "ancienne URL dans : %s" % ", ".join(bad))

    def test_urls_html_incluses_dans_le_pptx(self):
        known = pptx_all_urls()
        unknown = []
        for s in S.all_strings(S.course()):
            for u in URL.findall(s):
                if u.startswith(NS_OK):
                    continue
                if clean(u) not in known:
                    unknown.append(clean(u))
        self.assertEqual(sorted(set(unknown)), [], "%d URL du HTML absente(s) du PPTX" % len(set(unknown)))

    def test_liens_href_en_https(self):
        bad = []
        for s in S.all_strings(S.course()):
            for _q, target in HREF.findall(s):
                if re.match(r"(?i)https?:", target) and not target.lower().startswith("https://"):
                    bad.append(target)
        self.assertEqual(bad, [], "%d lien(s) href non https" % len(bad))

    def test_liens_href_cible_blank_noopener(self):
        bad = 0
        for s in S.all_strings(S.course()):
            for a in re.findall(r"<a\b[^>]*>", s, re.I):
                if re.search(r"href\s*=\s*[\"']https?:", a, re.I) and not ("noopener" in a and "_blank" in a):
                    bad += 1
        self.assertEqual(bad, 0, "%d lien(s) externe(s) sans target=_blank rel=noopener" % bad)

    def test_check_links_offline(self):
        r = S.run([sys.executable, "-I", "tools/check_links.py", "--offline"])
        self.assertEqual(r.returncode, 0, (r.stdout + r.stderr)[-800:])


if __name__ == "__main__":
    unittest.main()
