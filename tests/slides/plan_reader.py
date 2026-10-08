"""Lecture de assets/plan.js (manifeste des modules) en Python — stdlib uniquement.

Source unique des plages de slides par module pour les tests : aucune valeur de numéro de slide
n'est codée en dur dans les tests (désancrage #5). Une entrée du plan ressemble à :
    { num: 13, id: 'm13', emoji: '🐳', title: 'Execution Environments', day: 'J3', range: [183, 192] }
`PLAN_JS` (variable d'environnement) permet de viser un autre fichier (tests sur arbre synthétique).
"""

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
_ENTRY = re.compile(r"\{[^{}]*\bid\s*:\s*'(m\d+)'[^{}]*\}")
_RANGE = re.compile(r"\brange\s*:\s*\[\s*(\d+)\s*,\s*(\d+)\s*\]")
_FIELD = {"num": re.compile(r"\bnum\s*:\s*(\d+)"),
          "title": re.compile(r"\btitle\s*:\s*'((?:[^'\\]|\\.)*)'"),
          "day": re.compile(r"\bday\s*:\s*'([^']*)'")}


def plan_path():
    return Path(os.environ.get("PLAN_JS", ROOT / "assets" / "plan.js"))


def plan():
    """Liste ordonnée [{id, num, title, day, range: (a, b)}] des modules du plan."""
    src = plan_path().read_text(encoding="utf-8")
    out = []
    for m in _ENTRY.finditer(src):
        body = m.group(0)
        rng = _RANGE.search(body)
        if not rng:
            raise AssertionError("plan.js : module %s sans range" % m.group(1))
        item = {"id": m.group(1), "range": (int(rng.group(1)), int(rng.group(2)))}
        for key, rx in _FIELD.items():
            f = rx.search(body)
            item[key] = (int(f.group(1)) if key == "num" else f.group(1)) if f else None
        out.append(item)
    return out


def ranges():
    """{id: (première, dernière)} — slides masquées incluses."""
    return {p["id"]: p["range"] for p in plan()}


def entry(module_id):
    for p in plan():
        if p["id"] == module_id:
            return p
    return None
