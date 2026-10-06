#!/usr/bin/env python3
"""Contrôle de validité et anti-fuite d'un support PPTX.

Usage : python3 tests/slides/check_pptx.py <fichier.pptx>

Interface partagée (tests QA + CI de release, issue #49) :
  - exit 0 = OK ; exit 1 = fuite, fichier invalide ou erreur d'usage ;
  - la sortie ne contient QUE : nom de la partie du fichier (XML, média...) + identifiant
    de motif (G<n> générique, L<n> pour la n-ième ligne de LEAK_PATTERNS) — JAMAIS le
    texte trouvé : les logs d'un dépôt public sont publics, afficher le terme = le fuiter ;
  - motifs génériques : versionnés ci-dessous (aucun terme propre à une organisation) ;
  - motifs propres à l'organisation d'origine : variable d'environnement LEAK_PATTERNS
    (une regex par ligne, insensible à la casse), JAMAIS dans le dépôt. Absente ou vide :
    échec si CI=true (on ne publie jamais sans scan complet), simple avertissement sinon.

Identifiants des motifs génériques :
  G1  marqueur de label de sensibilité (MSIP_...) dans n'importe quelle partie
  G2  paragraphe réduit à un marqueur de classification (confidential, usage interne...)
  G3  vignette docProps/thumbnail.*
  G4  docProps/custom.xml (propriétés personnalisées / labels)
  G5  adresse IPv4 hors plages autorisées (voir ALLOWED_IP_NETS)
  G6  nom de domaine hors liste blanche (voir ALLOWED_DOMAINS)

Contrôles de validité (code ERREUR V<n>) :
  V1 fichier illisible / non zip     V2 archive corrompue (testzip)
  V3 [Content_Types].xml pas en premier   V4 nombre de slides inattendu
  V5 slides masquées inattendues     V6 XML mal formé

Stdlib uniquement.
"""

import ipaddress
import os
import re
import struct
import sys
import zipfile
import zlib
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pptx_reader import Deck, paragraphs_of, attribute_values, external_targets  # noqa: E402

EXPECTED_SLIDES = int(os.environ.get("EXPECTED_SLIDES", "223"))
EXPECTED_HIDDEN = [
    int(x) for x in os.environ.get("EXPECTED_HIDDEN", "193,210,217").split(",") if x.strip()
]

# Plages IP autorisées (décision utilisateur) : exemples éducatifs en 192.168.0.0/16 (slide 141
# comprise), documentation RFC 5737, loopback et DNS public d'exemple. Toute autre IP est une
# fuite potentielle. 0.0.0.0 (adresse d'écoute générique, présente dans le deck) est tolérée
# en plus de la liste confirmée.
ALLOWED_IP_NETS = [
    ipaddress.ip_network(n)
    for n in (
        "192.0.2.0/24",
        "198.51.100.0/24",
        "203.0.113.0/24",
        "127.0.0.1/32",
        "0.0.0.0/32",
        "8.8.8.8/32",
        "192.168.0.0/16",
    )
]

# Domaines autorisés (le domaine lui-même et ses sous-domaines).
ALLOWED_DOMAINS = (
    "example.com", "example.org", "example.net",
    "ansible.com", "redhat.com", "readthedocs.io", "palletsprojects.com",
    "github.com", "githubusercontent.com", "gitlab.com",
    "python.org", "pypi.org", "fedoraproject.org", "docker.io", "quay.io",
    "google.com",
    # espaces de noms OOXML / métadonnées standard (jamais du contenu de cours)
    "microsoft.com", "openxmlformats.org", "w3.org", "purl.org", "adobe.com",  # adobe : XMP des PNG
)

# TLD « organisationnels » recherchés (volontairement restreint : le deck contient des FQCN
# de collections et des noms de fichiers qui ressemblent à des noms de domaine).
_TLDS = "com|net|org|io|fr|eu|local|lan|corp|internal|intra|edu|gov|de|uk"
RE_DOMAIN = re.compile(r"(?<![\w.-])((?:[a-z0-9-]+\.)+(?:%s))(?![\w-])" % _TLDS, re.I)
RE_IPV4 = re.compile(r"(?<![\d.])((?:\d{1,3}\.){3}\d{1,3})(?!\d)(?!\.\d)")
RE_MSIP = re.compile(r"MSIP_", re.I)
RE_CLASSIF = re.compile(
    r"^\s*(?:classification\s*:.*|confidential|confidentiel|internal use only|usage interne|"
    r"diffusion restreinte|strictly confidential|strictement confidentiel)\s*$",
    re.I,
)

G_THUMB, G_CUSTOM = "G3", "G4"


class Report:
    def __init__(self):
        self.findings = []  # (label, motif)
        self.errors = []
        self._seen = set()

    def finding(self, label, motif):
        if (label, motif) not in self._seen:
            self._seen.add((label, motif))
            self.findings.append((label, motif))

    def error(self, code, msg):
        self.errors.append("ERREUR %s: %s" % (code, msg))


def load_leak_patterns(report):
    """Retourne la liste des regex compilées de LEAK_PATTERNS ([] si absente).

    Ne jamais afficher le contenu d'une ligne, même invalide.
    """
    raw = os.environ.get("LEAK_PATTERNS", "")
    pats = []
    for idx, line in enumerate(raw.replace("\r", "").split("\n"), start=1):
        if not line.strip():
            continue
        try:
            pats.append((idx, re.compile(line.strip(), re.I)))
        except re.error:
            report.error("L", "LEAK_PATTERNS ligne %d : regex invalide (contenu non affiché)" % idx)
    return pats


def ip_allowed(text):
    try:
        ip = ipaddress.ip_address(text)
    except ValueError:
        return True  # octet > 255 : pas une IP (numéro de version...)
    return any(ip in net for net in ALLOWED_IP_NETS)


def domain_allowed(host):
    host = host.lower()
    return any(host == d or host.endswith("." + d) for d in ALLOWED_DOMAINS)


def generic_scan_units(units, label, report):
    """G2/G5/G6 sur une liste d'unités de texte (paragraphes, attributs, cibles de liens)."""
    for u in units:
        if not u:
            continue
        if RE_CLASSIF.match(u):
            report.finding(label, "G2")
        for m in RE_IPV4.finditer(u):
            if not ip_allowed(m.group(1)):
                report.finding(label, "G5")
        for m in RE_DOMAIN.finditer(u):
            if not domain_allowed(m.group(1)):
                report.finding(label, "G6")


def leak_scan(texts, leak_pats, label, report):
    for idx, rx in leak_pats:
        for t in texts:
            if t and rx.search(t):
                report.finding(label, "L%d" % idx)
                break


def png_text_chunks(data):
    """Textes des chunks tEXt / zTXt / iTXt (dont XMP) d'un PNG, décodés best-effort."""
    out = []
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return out
    pos = 8
    while pos + 8 <= len(data):
        length, ctype = struct.unpack(">I4s", data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + length]
        pos += 12 + length
        if ctype == b"tEXt":
            out.append(body.decode("latin-1", "replace"))
        elif ctype == b"zTXt":
            try:
                out.append(zlib.decompress(body.split(b"\x00", 1)[1][1:]).decode("utf-8", "replace"))
            except Exception:
                out.append(body.decode("latin-1", "replace"))
        elif ctype == b"iTXt":
            try:
                parts = body.split(b"\x00", 5)  # kw, flag+method, lang, trkw, text
                flag = parts[1][0:1]
                text = parts[-1] if len(parts) == 6 else b""
                if flag == b"\x01":
                    text = zlib.decompress(text)
                out.append(parts[0].decode("latin-1", "replace") + "\n" + text.decode("utf-8", "replace"))
            except Exception:
                out.append(body.decode("latin-1", "replace"))
        elif ctype == b"eXIf":
            out.append(body.decode("latin-1", "replace"))
        if ctype == b"IEND":
            break
    return out


def xml_units(data):
    """Unités de texte d'une partie XML : paragraphes, valeurs d'attributs, textes d'éléments."""
    units = []
    try:
        units.extend(paragraphs_of(data))
        units.extend(attribute_values(data))
        root = ET.fromstring(data)
        units.extend(e.text.strip() for e in root.iter() if e.text and e.text.strip())
    except ET.ParseError:
        raise
    return units


def scan_archive(path, report):
    leak_pats = load_leak_patterns(report)
    try:
        zf = zipfile.ZipFile(path)
    except (zipfile.BadZipFile, OSError):
        report.error("V1", "fichier illisible ou non-zip")
        return
    with zf:
        names = zf.namelist()
        if zf.testzip() is not None:
            report.error("V2", "archive corrompue (testzip)")
        if not names or names[0] != "[Content_Types].xml":
            report.error("V3", "[Content_Types].xml n'est pas la première entrée")

        def label(part):
            # Si le nom de la partie lui-même contient un terme interdit, ne pas l'afficher.
            for _, rx in leak_pats:
                if rx.search(part):
                    return "partie#%d" % (names.index(part) + 1)
            return part

        for part in names:
            lab = label(part)
            low = part.lower()
            if re.match(r"docprops/thumbnail\.", low):
                report.finding(lab, G_THUMB)
            if low == "docprops/custom.xml":
                report.finding(lab, G_CUSTOM)
            leak_scan([part], leak_pats, lab, report)
            if part.endswith("/"):
                continue
            data = zf.read(part)
            if low.endswith((".xml", ".rels")):
                try:
                    units = xml_units(data)
                except ET.ParseError:
                    report.error("V6", "XML mal formé : %s" % lab)
                    continue
                raw = data.decode("utf-8", "replace")
                if RE_MSIP.search(raw):
                    report.finding(lab, "G1")
                if low.endswith(".rels"):
                    units = units + external_targets(data)
                generic_scan_units(units, lab, report)
                leak_scan([raw, "\n".join(units)], leak_pats, lab, report)
            else:
                texts = [data.decode("latin-1", "replace"), data.decode("utf-16-le", "replace")]
                if low.endswith(".png"):
                    chunks = png_text_chunks(data)
                    generic_scan_units(chunks, lab, report)
                    texts.extend(chunks)
                if any(RE_MSIP.search(t) for t in texts):
                    report.finding(lab, "G1")
                leak_scan(texts, leak_pats, lab, report)

    # Structure du deck (slides / masquées) — seulement si l'archive est lisible.
    if report.errors and any(e.startswith(("ERREUR V1", "ERREUR V2")) for e in report.errors):
        return
    try:
        deck = Deck(path)
    except Exception:
        report.error("V6", "présentation illisible (ppt/presentation.xml)")
        return
    with deck.zip:
        n = len(deck.slides)
        if n != EXPECTED_SLIDES:
            report.error("V4", "%d slides, %d attendues" % (n, EXPECTED_SLIDES))
        hidden = deck.hidden_numbers()
        if hidden != EXPECTED_HIDDEN:
            report.error("V5", "slides masquées %s, attendues %s" % (hidden, EXPECTED_HIDDEN))


def main(argv):
    if len(argv) != 2:
        print("Usage : check_pptx.py <fichier.pptx>", file=sys.stderr)
        return 1
    path = argv[1]
    report = Report()

    in_ci = os.environ.get("CI", "").strip().lower() == "true"
    if not any(l.strip() for l in os.environ.get("LEAK_PATTERNS", "").splitlines()):
        if in_ci:
            report.error("L", "LEAK_PATTERNS absent ou vide en CI : scan incomplet interdit")
        else:
            print("AVERTISSEMENT: LEAK_PATTERNS absent — motifs de l'organisation non vérifiés",
                  file=sys.stderr)

    if not os.path.isfile(path):
        report.error("V1", "fichier introuvable")
    else:
        scan_archive(path, report)

    for label, motif in report.findings:
        print("%s: motif %s" % (label, motif))
    for e in report.errors:
        print(e)
    if report.findings or report.errors:
        print("ECHEC: %d fuite(s), %d erreur(s)" % (len(report.findings), len(report.errors)))
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
