"""Parité PPTX ⊂ HTML (CA-4.1, CA-4.2, CA-4.3, CA-4.5-parité ; définition : maquette d'architecture §3) — lot parite.

Pour chaque slide PPTX N de contenu (4-223, hors masquées 193/210/217 — Q3) d'un module présent :
  - COUVERTURE : ≥ 1 slide HTML (non extra) avec N ∈ `src` ;
  - TEXTE : chaque ligne PPTX normalisée (espaces, NBSP, guillemets/tirets typographiques) ⊂ texte HTML
    des slides `src ∋ N` (balises retirées, entités décodées ; `code` et `cmds[0]` pris tels quels) ;
  - NOTES : chaque ligne de notes PPTX ⊂ notes HTML ; les 12 notes non vides sont présentes ;
  - LIENS : cibles externes de la slide ⊂ liens (href ou texte) des slides HTML ;
  - IMAGES : chaque image de la slide a une entrée `assets/img/images.json` (slide + média d'origine),
    un fichier présent, et un bloc `img` sur une slide HTML `src ∋ N`.
Exceptions : tests/site/parity_exceptions.json uniquement (< 20 entrées, justifiées).
Slides HTML sans `src` (hors `extra`) interdites ; objectifs / À retenir / quiz exclus de la parité.
Messages : n° de slide et de ligne, jamais d'extrait.

PARITY_STRICT=1 : les 15 modules obligatoires (CI release). Sinon : modules présents + pilote m02.

Exécution : python3 -m unittest discover -s tests/site -p "test_parity.py" -v
"""

import hashlib
import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402


def slides_of_module(mid):
    a, b = S.MODULE_RANGES[mid]
    hidden = S.hidden_slides()
    return [n for n in range(a, b + 1) if n not in hidden]


class TestParite(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.mods = S.modules()
        cls.scope = S.modules_in_scope()

    def setUp(self):
        self.assertTrue(self.mods, "course.json sans module : le site n'existe pas encore")

    def each_slide(self):
        for mid in self.scope:
            if mid not in self.mods:
                self.fail("module %s absent de course.json (PARITY_STRICT=1)" % mid)
            for n in slides_of_module(mid):
                yield mid, n

    # --- périmètre -------------------------------------------------------------------
    def test_pilote_m02_present(self):
        self.assertIn("m02", self.scope, "le module pilote m02 doit être présent dans course.json")

    def test_ranges_couvrent_toutes_les_slides_de_contenu(self):
        covered = {n for mid in S.MODULE_RANGES for n in slides_of_module(mid)}
        total, hidden = S.expected()
        self.assertEqual(covered, set(range(4, total + 1)) - set(hidden))
        self.assertEqual(len(covered), 217)

    def test_expected_json_coherent_avec_le_pptx(self):
        total, hidden = S.expected()
        self.assertEqual(len(S.deck().slides), total)
        self.assertEqual(S.deck().hidden_numbers(), hidden)

    # --- structure des slides HTML ------------------------------------------------------
    def test_aucune_slide_html_sans_src_hors_extra(self):
        for mid in self.scope:
            m = self.mods.get(mid, {})
            for i, s in enumerate(m.get("slides", []), 1):
                if not s.get("extra"):
                    self.assertTrue(s.get("src"), "%s slide %d : contenu non sourcé (ni src ni extra)" % (mid, i))

    def test_src_dans_la_plage_du_module_et_jamais_masque(self):
        hidden = set(S.hidden_slides())
        for mid in self.scope:
            a, b = S.MODULE_RANGES[mid]
            for i, s in enumerate(self.mods.get(mid, {}).get("slides", []), 1):
                for n in s.get("src") or []:
                    self.assertTrue(a <= n <= b, "%s slide %d : src %s hors du module (%d-%d)" % (mid, i, n, a, b))
                    self.assertNotIn(n, hidden, "%s slide %d : src %s est une slide masquée (Q3)" % (mid, i, n))

    def test_src_en_ordre_de_presentation(self):
        for mid in self.scope:
            for i, s in enumerate(self.mods.get(mid, {}).get("slides", []), 1):
                src = s.get("src") or []
                self.assertEqual(src, sorted(src), "%s slide %d : src non trié" % (mid, i))

    def test_aucune_slide_pptx_dans_deux_modules(self):
        seen = {}
        for mid, m in self.mods.items():
            for n in S.module_src(m):
                self.assertNotIn(n, seen, "slide %d dans %s et %s" % (n, seen.get(n), mid))
                seen[n] = mid

    # --- parité ------------------------------------------------------------------------
    def test_couverture_chaque_slide_pptx_est_referencee(self):
        for mid, n in self.each_slide():
            with self.subTest(module=mid, slide=n):
                self.assertTrue(S.slides_for(n), "slide %d non convertie" % n)

    def test_texte_chaque_ligne_pptx_presente_dans_le_html(self):
        for mid, n in self.each_slide():
            hs = S.slides_for(n)
            if not hs:
                continue  # signalé par test_couverture
            html = S.slide_html_text(hs)
            with self.subTest(module=mid, slide=n):
                for k, line in enumerate(S.slide_lines(S.deck().slide(n)), 1):
                    if S.is_excepted("text", n, line=k):
                        continue
                    self.assertIn(line, html, "texte manquant : slide %d, ligne %d" % (n, k))

    def test_notes_pptx_presentes_dans_le_html(self):
        for mid, n in self.each_slide():
            hs = S.slides_for(n)
            if not hs:
                continue
            notes = S.notes_text(hs)
            with self.subTest(module=mid, slide=n):
                for k, line in enumerate(S.notes_lines(S.deck().slide(n)), 1):
                    if S.is_excepted("notes", n, line=k):
                        continue
                    self.assertIn(line, notes, "notes manquantes : slide %d, ligne %d" % (n, k))

    def test_les_douze_notes_non_vides_sont_presentes(self):
        for n in S.NOTES_SLIDES:
            mid = S.module_of(n)
            if mid not in self.scope:
                continue
            with self.subTest(slide=n):
                self.assertTrue(S.notes_lines(S.deck().slide(n)), "note PPTX attendue vide : slide %d" % n)
                self.assertTrue(S.notes_text(S.slides_for(n)), "notes HTML absentes : slide %d" % n)

    def test_aucune_note_html_sur_une_slide_sans_note_pptx(self):
        """Les notes du formateur viennent du PPTX : pas de note inventée sur une slide convertie."""
        for mid in self.scope:
            for i, s in enumerate(self.mods.get(mid, {}).get("slides", []), 1):
                if s.get("extra") or not s.get("notes"):
                    continue
                if not any(S.notes_lines(S.deck().slide(n)) for n in s.get("src", [])):
                    self.fail("%s slide %d : notes HTML sans notes PPTX" % (mid, i))

    def test_liens_externes_presents_dans_le_html(self):
        for mid, n in self.each_slide():
            hs = S.slides_for(n)
            links = S.slide_links(S.deck().slide(n))
            if not hs or not links:
                continue
            raw = S._html.unescape(S.slide_raw_text(hs))
            with self.subTest(module=mid, slide=n):
                for k, target in enumerate(links, 1):
                    if S.is_excepted("link", n, target=target):
                        continue
                    self.assertIn(target, raw, "lien manquant : slide %d, lien %d" % (n, k))

    def test_images_declarees_presentes_et_utilisees(self):
        idx = S.images_index()
        for mid, n in self.each_slide():
            media = S.slide_media(S.deck().slide(n))
            if not media:
                continue
            hs = S.slides_for(n)
            used = set(S.img_blocks(hs))
            with self.subTest(module=mid, slide=n):
                for m in media:
                    if S.is_excepted("image", n, media=m):
                        continue
                    entries = [f for f, e in idx.items() if n in e["slide"] and e["media_origine"] == m]
                    self.assertTrue(entries, "image sans entrée images.json : slide %d, média %s" % (n, m))
                    for f in entries:
                        self.assertTrue((S.ROOT / "assets" / "img" / f).is_file(), "fichier image absent : %s" % f)
                        self.assertIn(f, used, "image %s non affichée sur la slide HTML (slide %d)" % (f, n))

    def test_images_json_sha256_et_blocs_img_declares(self):
        idx = S.images_index()
        for f, e in idx.items():
            with self.subTest(fichier=f):
                p = S.ROOT / "assets" / "img" / f
                self.assertTrue(p.is_file(), "fichier absent")
                self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(), e["sha256"], "sha256 différent")
        for mid in self.scope:
            for f in S.img_blocks(self.mods.get(mid, {}).get("slides", [])):
                self.assertIn(f, idx, "bloc img non déclaré dans images.json : %s" % f)

    # --- exceptions ---------------------------------------------------------------------
    def test_exceptions_limitees_et_justifiees(self):
        ex = S.exceptions()
        self.assertLess(len(ex), 20, "trop d'exceptions de parité (%d)" % len(ex))
        hidden = set(S.hidden_slides())
        for i, e in enumerate(ex, 1):
            with self.subTest(exception=i):
                self.assertIn(e.get("kind"), ("text", "notes", "link", "image"))
                self.assertIsInstance(e.get("slide"), int)
                self.assertNotIn(e["slide"], hidden)
                self.assertTrue(4 <= e["slide"] <= 223)
                self.assertTrue(len(str(e.get("reason", "")).strip()) >= 15, "justification trop courte")
                if e["kind"] == "link":
                    self.assertTrue(str(e.get("target", "")).strip(), "cible exacte obligatoire pour link")
                if e["kind"] in ("text", "notes"):
                    self.assertIsInstance(e.get("line"), int, "ligne obligatoire pour text/notes")
                if e["kind"] == "image":
                    self.assertTrue(e.get("media"))

    def test_exceptions_de_lien_visent_un_lien_reel_du_pptx(self):
        """Une exception de lien est étroite : sa cible exacte existe sur la slide PPTX (sinon exception périmée)."""
        for i, e in enumerate(S.exceptions(), 1):
            if e.get("kind") == "link":
                self.assertIn(e["target"], S.slide_links(S.deck().slide(e["slide"])),
                              "exception %d : cible absente de la slide %d" % (i, e["slide"]))

    def test_exceptions_ne_masquent_pas_de_contenu_textuel_long(self):
        """Une exception de texte porte sur une ligne décorative (< 60 caractères), jamais sur un paragraphe."""
        for i, e in enumerate(S.exceptions(), 1):
            if e.get("kind") != "text":
                continue
            lines = S.slide_lines(S.deck().slide(e["slide"]))
            self.assertTrue(1 <= e["line"] <= len(lines), "exception %d : ligne inexistante" % i)
            self.assertLess(len(lines[e["line"] - 1]), 60, "exception %d : ligne trop longue pour être décorative" % i)


if __name__ == "__main__":
    unittest.main()
