"""Lecture minimale d'un PPTX (stdlib uniquement : zipfile, re, xml.etree).

Partage entre check_pptx.py (contrôle anti-fuite / validité, utilisé aussi par la CI)
et test_obsolescence.py (assertions de contenu par issue).

Règle clé : le texte d'un paragraphe est la CONCATENATION des runs (<a:r>/<a:t>) —
PowerPoint fragmente arbitrairement un mot ou une commande en plusieurs runs, une
recherche run par run raterait « Ansible Tower » coupé en « Ansible » + « Tower ».
"""

import posixpath
import re
import zipfile
import xml.etree.ElementTree as ET

NS_A = "http://schemas.openxmlformats.org/drawingml/2006/main"
NS_P = "http://schemas.openxmlformats.org/presentationml/2006/main"
NS_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_REL = "http://schemas.openxmlformats.org/package/2006/relationships"

TAG_P = "{%s}p" % NS_A
TAG_R = "{%s}r" % NS_A
TAG_T = "{%s}t" % NS_A
TAG_BR = "{%s}br" % NS_A


def paragraphs_of(xml_bytes):
    """Liste des paragraphes (str) d'une partie XML : concaténation des runs, <a:br/> -> \\n.

    Les champs (<a:fld>, ex. numéro de slide) ne sont pas des runs : ignorés.
    """
    root = ET.fromstring(xml_bytes)
    out = []
    for p in root.iter(TAG_P):
        buf = []
        for child in p:
            if child.tag == TAG_R:
                t = child.find(TAG_T)
                if t is not None and t.text:
                    buf.append(t.text)
            elif child.tag == TAG_BR:
                buf.append("\n")
        out.append("".join(buf))
    return out


def text_of(xml_bytes):
    return "\n".join(paragraphs_of(xml_bytes))


def attribute_values(xml_bytes):
    """Toutes les valeurs d'attributs d'une partie XML (texte alternatif descr=/title=/name=, etc.)."""
    root = ET.fromstring(xml_bytes)
    vals = []
    for el in root.iter():
        vals.extend(v for v in el.attrib.values() if v)
    return vals


def external_targets(rels_bytes):
    """Cibles des relations externes (hyperliens) d'un fichier .rels."""
    root = ET.fromstring(rels_bytes)
    return [
        r.get("Target", "")
        for r in root.iter("{%s}Relationship" % NS_REL)
        if r.get("TargetMode") == "External"
    ]


def _resolve(base_part, target):
    """Résout une cible de relation relative à la partie `base_part`."""
    if target.startswith("/"):
        return target.lstrip("/")
    return posixpath.normpath(posixpath.join(posixpath.dirname(base_part), target))


def _rels_part(part):
    d, f = posixpath.split(part)
    return posixpath.join(d, "_rels", f + ".rels")


class Slide:
    def __init__(self, deck, number, part):
        self.deck = deck
        self.number = number  # position 1-based dans l'ordre de présentation.xml
        self.part = part  # ex. ppt/slides/slide41.xml
        raw = deck.zip.read(part)
        self.xml = raw
        head = raw[:2000].decode("utf-8", "replace")
        m = re.search(r"<p:sld\b[^>]*>", head)
        self.hidden = bool(m and re.search(r'\bshow="(0|false)"', m.group(0)))
        self.paragraphs = paragraphs_of(raw)
        self.text = "\n".join(self.paragraphs)

        rels_name = _rels_part(part)
        self.rels_part = rels_name if rels_name in deck.names else None
        self.notes_part = None
        self.notes_paragraphs = []
        if self.rels_part:
            root = ET.fromstring(deck.zip.read(self.rels_part))
            for r in root.iter("{%s}Relationship" % NS_REL):
                if r.get("Type", "").endswith("/notesSlide"):
                    cand = _resolve(part, r.get("Target", ""))
                    if cand in deck.names:
                        self.notes_part = cand
        if self.notes_part:
            self.notes_paragraphs = paragraphs_of(deck.zip.read(self.notes_part))
        self.notes = "\n".join(self.notes_paragraphs)

    def __repr__(self):
        return "<Slide %d %s>" % (self.number, self.part)


class Deck:
    def __init__(self, path):
        self.path = path
        self.zip = zipfile.ZipFile(path)
        self.names = set(self.zip.namelist())
        self.slides = self._load_slides()

    def close(self):
        self.zip.close()

    def _load_slides(self):
        pres = "ppt/presentation.xml"
        rels = "ppt/_rels/presentation.xml.rels"
        root = ET.fromstring(self.zip.read(pres))
        rid_target = {}
        for r in ET.fromstring(self.zip.read(rels)).iter("{%s}Relationship" % NS_REL):
            rid_target[r.get("Id")] = r.get("Target", "")
        slides = []
        lst = root.find("{%s}sldIdLst" % NS_P)
        ids = [] if lst is None else [e.get("{%s}id" % NS_R) for e in lst]
        for i, rid in enumerate(ids, start=1):
            part = _resolve(pres, rid_target[rid])
            slides.append(Slide(self, i, part))
        return slides

    def slide(self, n):
        return self.slides[n - 1]

    def slide_texts(self):
        """[(numéro, texte)] pour toutes les slides."""
        return [(s.number, s.text) for s in self.slides]

    def note_texts(self):
        return [(s.number, s.notes) for s in self.slides]

    def hidden_numbers(self):
        return [s.number for s in self.slides if s.hidden]

    def part_text(self, name):
        """Texte concaténé d'une partie XML (layout, master...)."""
        return text_of(self.zip.read(name))
