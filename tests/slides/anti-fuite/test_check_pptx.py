"""Tests d'intégration de tests/slides/check_pptx.py (contrat partagé tests QA + CI, issue #49).

Chaque test fabrique un PPTX synthétique minimal (« PPTX piégé ») dans un dossier temporaire
et lance le script en sous-processus : code de sortie, motifs signalés, et surtout
MASQUAGE — la sortie ne doit jamais contenir le terme trouvé (logs Actions publics).
Le terme interdit utilisé ici est un mot fictif sans rapport avec une organisation réelle.

Exécution : python3 -m unittest discover -s tests/slides/anti-fuite -p "test_check_pptx.py" -v
Le dernier groupe (TestRealDeck) vérifie le vrai « Ansible Training.pptx » (variable
PPTX_PATH pour viser un autre fichier ; LEAK_PATTERNS de l'environnement est repris tel quel).
"""

import os
import struct
import subprocess
import sys
import tempfile
import unittest
import zipfile
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "tests" / "slides" / "check_pptx.py"
REAL_PPTX = Path(os.environ.get("PPTX_PATH", ROOT / "Ansible Training.pptx"))

FAKE_TERM = "zorbglub"  # terme interdit fictif

NS = (
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"'
)
REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
REL_T = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def para(*runs):
    return "<a:p>" + "".join("<a:r><a:t>%s</a:t></a:r>" % r for r in runs) + "</a:p>"


def slide_xml(paragraphs, hidden=False, extra=""):
    show = ' show="0"' if hidden else ""
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        "<p:sld %s%s><p:cSld><p:spTree><p:sp><p:txBody>%s</p:txBody></p:sp>%s</p:spTree></p:cSld></p:sld>"
        % (NS, show, "".join(paragraphs), extra)
    )


def png_bytes(text_chunk=None):
    def chunk(t, body):
        return struct.pack(">I", len(body)) + t + body + struct.pack(">I", zlib.crc32(t + body) & 0xFFFFFFFF)

    out = b"\x89PNG\r\n\x1a\n"
    out += chunk(b"IHDR", struct.pack(">IIBBBBB", 1, 1, 8, 2, 0, 0, 0))
    if text_chunk:
        out += chunk(b"tEXt", b"Comment\x00" + text_chunk.encode("latin-1"))
    out += chunk(b"IDAT", zlib.compress(b"\x00\x00\x00\x00"))
    out += chunk(b"IEND", b"")
    return out


def make_pptx(path, slides=None, extra_parts=None, content_types_first=True, slide_rels=None):
    """slides : liste de dicts {paras:[...], hidden:bool, notes:[...], rels:[(Target, External)]}."""
    slides = slides if slides is not None else [{"paras": [para("Hello")]}]
    parts = {}
    ids, rels = [], []
    for i, s in enumerate(slides, start=1):
        parts["ppt/slides/slide%d.xml" % i] = slide_xml(s["paras"], s.get("hidden", False), s.get("extra", ""))
        ids.append('<p:sldId id="%d" r:id="rId%d"/>' % (255 + i, i))
        rels.append('<Relationship Id="rId%d" Type="%s/slide" Target="slides/slide%d.xml"/>' % (i, REL_T, i))
        srels = []
        if s.get("notes"):
            parts["ppt/notesSlides/notesSlide%d.xml" % i] = slide_xml(s["notes"])
            srels.append('<Relationship Id="rId1" Type="%s/notesSlide" Target="../notesSlides/notesSlide%d.xml"/>' % (REL_T, i))
        for j, (target, external) in enumerate(s.get("rels", []), start=10):
            mode = ' TargetMode="External"' if external else ""
            srels.append('<Relationship Id="rId%d" Type="%s/hyperlink" Target="%s"%s/>' % (j, REL_T, target, mode))
        if srels:
            parts["ppt/slides/_rels/slide%d.xml.rels" % i] = (
                '<?xml version="1.0"?><Relationships xmlns="%s">%s</Relationships>' % (REL_NS, "".join(srels))
            )
    parts["ppt/presentation.xml"] = (
        '<?xml version="1.0"?><p:presentation %s><p:sldIdLst>%s</p:sldIdLst></p:presentation>' % (NS, "".join(ids))
    )
    parts["ppt/_rels/presentation.xml.rels"] = (
        '<?xml version="1.0"?><Relationships xmlns="%s">%s</Relationships>' % (REL_NS, "".join(rels))
    )
    parts["docProps/core.xml"] = (
        '<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
        'xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Ansible Training</dc:title></cp:coreProperties>'
    )
    ct = '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>'
    for name, data in (extra_parts or {}).items():
        parts[name] = data
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        if content_types_first:
            z.writestr("[Content_Types].xml", ct)
        for name, data in parts.items():
            z.writestr(name, data)
        if not content_types_first:
            z.writestr("[Content_Types].xml", ct)


class CheckCase(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self._tmp.cleanup)
        self.pptx = Path(self._tmp.name) / "deck.pptx"

    def run_check(self, leak=None, ci=None, path=None, expected_slides="1", expected_hidden="", args=None):
        env = {k: v for k, v in os.environ.items() if k not in ("LEAK_PATTERNS", "CI")}
        env["EXPECTED_SLIDES"] = expected_slides
        env["EXPECTED_HIDDEN"] = expected_hidden
        if leak is not None:
            env["LEAK_PATTERNS"] = leak
        if ci is not None:
            env["CI"] = ci
        argv = [sys.executable, str(SCRIPT)] + (args if args is not None else [str(path or self.pptx)])
        p = subprocess.run(argv, env=env, capture_output=True, text=True, timeout=120)
        return p.returncode, p.stdout, p.stderr

    def assert_masked(self, out, err, term=FAKE_TERM):
        self.assertNotIn(term, (out + err).lower(), "le terme interdit apparaît dans la sortie (fuite par les logs)")


class TestExitCodesAndValidity(CheckCase):
    def test_clean_deck_exit_0(self):
        make_pptx(self.pptx)
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 0, out)
        self.assertIn("OK", out)

    def test_usage_without_argument_exit_1(self):
        rc, _, _ = self.run_check(args=[])
        self.assertEqual(rc, 1)

    def test_missing_file_exit_1(self):
        rc, out, _ = self.run_check(leak=FAKE_TERM, path=Path(self._tmp.name) / "absent.pptx")
        self.assertEqual(rc, 1)
        self.assertIn("V1", out)

    def test_not_a_zip_exit_1(self):
        self.pptx.write_bytes(b"ceci n'est pas un zip")
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("V1", out)

    def test_content_types_must_be_first_entry(self):
        make_pptx(self.pptx, content_types_first=False)
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("V3", out)

    def test_slide_count_mismatch(self):
        make_pptx(self.pptx, slides=[{"paras": [para("a")]}, {"paras": [para("b")]}])
        rc, out, _ = self.run_check(leak=FAKE_TERM, expected_slides="1")
        self.assertEqual(rc, 1)
        self.assertIn("V4", out)

    def test_hidden_slides_must_match_expected(self):
        make_pptx(self.pptx, slides=[{"paras": [para("a")]}, {"paras": [para("b")], "hidden": True}])
        rc, out, _ = self.run_check(leak=FAKE_TERM, expected_slides="2", expected_hidden="2")
        self.assertEqual(rc, 0, out)
        rc, out, _ = self.run_check(leak=FAKE_TERM, expected_slides="2", expected_hidden="1")
        self.assertEqual(rc, 1)
        self.assertIn("V5", out)


class TestGenericPatterns(CheckCase):
    def test_msip_label_in_metadata_G1(self):
        make_pptx(self.pptx, extra_parts={"docProps/app.xml": "<Properties><x>MSIP_Label_1234</x></Properties>"})
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("docProps/app.xml: motif G1", out)

    def test_thumbnail_G3_and_custom_xml_G4(self):
        make_pptx(self.pptx, extra_parts={"docProps/thumbnail.jpeg": b"\xff\xd8\xff", "docProps/custom.xml": "<Properties/>"})
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("docProps/thumbnail.jpeg: motif G3", out)
        self.assertIn("docProps/custom.xml: motif G4", out)

    def test_classification_marker_G2(self):
        make_pptx(self.pptx, slides=[{"paras": [para("Confidential")]}])
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("motif G2", out)

    def test_word_confidential_inside_prose_is_not_a_marker(self):
        make_pptx(self.pptx, slides=[{"paras": [para("Vault protects confidential data in your playbooks")]}])
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 0, out)

    def test_foreign_ip_G5_and_allowed_ips(self):
        make_pptx(self.pptx, slides=[{"paras": [para("host 192.0.2.10, 198.51.100.7, 203.0.113.9, 192.168.1.5, 192.168.200.20, 127.0.0.1 and 8.8.8.8")]}])
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 0, out)
        make_pptx(self.pptx, slides=[{"paras": [para("ansible_host: 10.", "20.30.40")]}])  # IP coupée en 2 runs
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("ppt/slides/slide1.xml: motif G5", out)
        self.assertNotIn("10.20.30.40", out)

    def test_foreign_domain_G6_and_whitelist(self):
        make_pptx(self.pptx, slides=[{"paras": [para("see https://docs.ansible.com/ and node1.example.com")]}])
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 0, out)
        make_pptx(self.pptx, slides=[{"paras": [para("git@git.some-company.com:team/repo.git")]}])
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("motif G6", out)
        self.assertNotIn("some-company", out)

    def test_foreign_domain_in_hyperlink_target_G6(self):
        make_pptx(self.pptx, slides=[{"paras": [para("lien")], "rels": [("https://intranet.some-company.com/x", True)]}])
        rc, out, _ = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("slide1.xml.rels: motif G6", out)


class TestLeakPatterns(CheckCase):
    def test_fragmented_runs_are_concatenated(self):
        make_pptx(self.pptx, slides=[{"paras": [para("Zorb", "glu", "b rocks")]}])
        rc, out, err = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("ppt/slides/slide1.xml: motif L1", out)
        self.assert_masked(out, err)

    def test_case_insensitive_and_one_regex_per_line(self):
        make_pptx(self.pptx, slides=[{"paras": [para("ZORBGLUB")]}])
        rc, out, err = self.run_check(leak="autre\n%s\n" % FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("motif L2", out)  # numéro de ligne, pas le texte
        self.assert_masked(out, err)

    def test_notes_alt_text_rels_and_metadata_are_scanned(self):
        extra = '<p:pic><p:nvPicPr><p:cNvPr id="4" name="Image" descr="logo %s"/></p:nvPicPr></p:pic>' % FAKE_TERM
        make_pptx(
            self.pptx,
            slides=[{
                "paras": [para("ok")], "notes": [para("note %s" % FAKE_TERM)], "extra": extra,
                "rels": [("https://example.com/%s" % FAKE_TERM, True)],
            }],
            extra_parts={"docProps/core.xml": '<?xml version="1.0"?><c xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>%s</dc:creator></c>' % FAKE_TERM},
        )
        rc, out, err = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        for part in ("ppt/slides/slide1.xml", "ppt/notesSlides/notesSlide1.xml",
                     "ppt/slides/_rels/slide1.xml.rels", "docProps/core.xml"):
            self.assertIn("%s: motif L1" % part, out)
        self.assert_masked(out, err)

    def test_png_metadata_chunk_is_scanned(self):
        make_pptx(self.pptx, extra_parts={"ppt/media/image1.png": png_bytes("author %s" % FAKE_TERM)})
        rc, out, err = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("ppt/media/image1.png: motif L1", out)
        self.assert_masked(out, err)

    def test_binary_media_utf16_and_latin1_text_is_scanned(self):
        make_pptx(self.pptx, extra_parts={
            "ppt/media/image2.wmf": b"\x01\x00" + FAKE_TERM.encode("utf-16-le") + b"\x00",
            "ppt/media/image3.bin": b"junk " + FAKE_TERM.encode("ascii"),
        })
        rc, out, err = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assertIn("ppt/media/image2.wmf: motif L1", out)
        self.assertIn("ppt/media/image3.bin: motif L1", out)
        self.assert_masked(out, err)

    def test_part_name_containing_the_term_is_not_printed(self):
        make_pptx(self.pptx, extra_parts={"ppt/media/%s_logo.png" % FAKE_TERM: png_bytes()})
        rc, out, err = self.run_check(leak=FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assert_masked(out, err)

    def test_invalid_regex_fails_without_echoing_it(self):
        make_pptx(self.pptx)
        rc, out, err = self.run_check(leak="(%s" % FAKE_TERM)
        self.assertEqual(rc, 1)
        self.assert_masked(out, err)


class TestCiRequiresLeakPatterns(CheckCase):
    def test_ci_without_leak_patterns_fails(self):
        make_pptx(self.pptx)
        rc, out, _ = self.run_check(ci="true")
        self.assertEqual(rc, 1)
        self.assertIn("LEAK_PATTERNS", out)

    def test_ci_with_blank_leak_patterns_fails(self):
        make_pptx(self.pptx)
        rc, _, _ = self.run_check(ci="true", leak="\n  \n")
        self.assertEqual(rc, 1)

    def test_ci_with_leak_patterns_on_clean_deck_passes(self):
        make_pptx(self.pptx)
        rc, out, _ = self.run_check(ci="true", leak=FAKE_TERM)
        self.assertEqual(rc, 0, out)

    def test_local_without_leak_patterns_only_warns(self):
        make_pptx(self.pptx)
        rc, out, err = self.run_check()
        self.assertEqual(rc, 0, out)
        self.assertIn("AVERTISSEMENT", err)


@unittest.skipUnless(REAL_PPTX.is_file(), "PPTX réel introuvable")
class TestRealDeck(unittest.TestCase):
    """Intégration sur le vrai support : validité, 223 slides, 193/210/217 masquées, anti-fuite."""

    def test_real_deck_passes_check(self):
        env = dict(os.environ)
        env.pop("EXPECTED_SLIDES", None)
        env.pop("EXPECTED_HIDDEN", None)
        env.setdefault("LEAK_PATTERNS", FAKE_TERM)  # en local : motifs génériques seuls si non fournis
        p = subprocess.run([sys.executable, str(SCRIPT), str(REAL_PPTX)],
                           env=env, capture_output=True, text=True, timeout=300)
        self.assertEqual(p.returncode, 0, p.stdout)


if __name__ == "__main__":
    unittest.main()
