#!/usr/bin/env python3
"""Vérification des liens du support (PPTX + site HTML) — stdlib uniquement. MIT License — Copyright (c) 2026 CCoupel.

Usage :
  python3 tools/check_links.py --offline            forme des URL (https, hôte valide, pas d'ancienne forme
                                                    docs.ansible.com/ansible/latest/, pas de ponctuation finale) ;
                                                    aucun accès réseau — utilisé par les tests et la CI
  python3 tools/check_links.py --online [--reset]   requêtes HTTP à débit limité, JAMAIS en CI :
                                                    ≤ 10 requêtes par lot, 1 requête / 6 s, pause de 90 s entre lots,
                                                    HTTP 429 → attente de Retry-After (sinon 120 s) puis reprise,
                                                    HEAD puis GET si 405. État repris via build/links-state.json,
                                                    rapport build/links-report.md.

Sources des URL : le PPTX (texte, notes, relations .rels) et le contenu du site (build/course.json, produit par
`node tools/dump-course.js` ; régénéré s'il est absent). Les espaces de noms XML (w3.org, openxmlformats, purl.org,
schemas.microsoft.com) ne sont pas des liens.
"""

import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
PPTX = os.path.join(ROOT, "Ansible Training.pptx")
COURSE = os.path.join(ROOT, "build", "course.json")
STATE = os.path.join(ROOT, "build", "links-state.json")
REPORT = os.path.join(ROOT, "build", "links-report.md")

URL = re.compile(r"https?://[^\s\"'<>\\]+")
OLD = re.compile(r"docs\.ansible\.com/ansible/latest/", re.I)
NAMESPACES = ("http://www.w3.org/", "http://schemas.openxmlformats.org/", "http://schemas.microsoft.com/",
              "http://purl.org/", "http://schemas.openxmlformats.org")
BATCH, PER_REQUEST_S, BATCH_PAUSE_S, RETRY_DEFAULT_S = 10, 6, 90, 120
UA = "ansible-training-link-check/1.0 (+https://github.com/CCoupel/ansible-training)"


def clean(u):
    import html
    return html.unescape(u).rstrip(".,;:)]}'\"")


def pptx_urls():
    urls = {}
    with zipfile.ZipFile(PPTX) as z:
        for name in z.namelist():
            if name.endswith((".xml", ".rels")):
                for u in URL.findall(z.read(name).decode("utf-8", "replace")):
                    u = clean(u)
                    if not u.startswith(NAMESPACES):
                        urls.setdefault(u, set()).add("pptx")
    return urls


def strings(o, out):
    if isinstance(o, str):
        out.append(o)
    elif isinstance(o, list):
        for x in o:
            strings(x, out)
    elif isinstance(o, dict):
        for v in o.values():
            strings(v, out)
    return out


def site_urls():
    if not os.path.isfile(COURSE):
        subprocess.run(["node", os.path.join(ROOT, "tools", "dump-course.js")], cwd=ROOT, check=True,
                       stdout=subprocess.DEVNULL)
    with open(COURSE, encoding="utf-8") as fh:
        data = json.load(fh)
    urls = {}
    for s in strings(data, []):
        for u in URL.findall(s):
            u = clean(u)
            if not u.startswith(NAMESPACES):
                urls.setdefault(u, set()).add("site")
    return urls


def all_urls():
    merged = {}
    for src in (pptx_urls(), site_urls()):
        for u, where in src.items():
            merged.setdefault(u, set()).update(where)
    return merged


def offline():
    bad = []
    urls = all_urls()
    for u in sorted(urls):
        p = urllib.parse.urlparse(u)
        if p.scheme != "https":
            # http:// existe dans des exemples du support (proxy, localhost…) : signalé, pas bloquant ;
            # les href du site sont contrôlés en https par tools/validate.js.
            print("warn    %s : schéma non https" % u)
        if not p.netloc or "." not in p.netloc or " " in u:
            bad.append((u, "hôte invalide"))
        elif OLD.search(u):
            bad.append((u, "ancienne forme docs.ansible.com/ansible/latest/"))
    for u, why in bad:
        print("ERREUR  %s : %s" % (u, why))
    print("%d URL(s) examinée(s), %d anomalie(s)." % (len(urls), len(bad)))
    return 1 if bad else 0


def request(url, method):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, None
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Retry-After")
    except Exception as e:  # réseau, TLS, délai
        return 0, str(type(e).__name__)


def check_one(url):
    code, extra = request(url, "HEAD")
    if code in (405, 403, 501):
        time.sleep(PER_REQUEST_S)
        code, extra = request(url, "GET")
    while code == 429:
        wait = int(extra) if extra and str(extra).isdigit() else RETRY_DEFAULT_S
        print("  429 reçu — attente %d s" % wait, flush=True)
        time.sleep(wait)
        code, extra = request(url, "GET")
    return code


def online(reset=False):
    os.makedirs(os.path.dirname(STATE), exist_ok=True)
    state = {}
    if not reset and os.path.isfile(STATE):
        with open(STATE, encoding="utf-8") as fh:
            state = json.load(fh)
    urls = all_urls()
    todo = [u for u in sorted(urls) if u not in state]
    print("%d URL(s) au total, %d déjà vérifiée(s), %d à vérifier." % (len(urls), len(state), len(todo)))
    for i, u in enumerate(todo, 1):
        state[u] = check_one(u)
        with open(STATE, "w", encoding="utf-8") as fh:
            json.dump(state, fh, indent=1)
        print("  [%d/%d] %s -> %s" % (i, len(todo), u, state[u]), flush=True)
        if i < len(todo):
            time.sleep(BATCH_PAUSE_S if i % BATCH == 0 else PER_REQUEST_S)
    ko = {u: c for u, c in state.items() if u in urls and not (200 <= c < 400)}
    with open(REPORT, "w", encoding="utf-8") as fh:
        fh.write("# Rapport des liens\n\n%d URL(s), %d en anomalie.\n\n| Code | URL | Source |\n|---|---|---|\n" % (len(urls), len(ko)))
        for u in sorted(urls):
            c = state.get(u)
            fh.write("| %s | %s | %s |\n" % (c, u, ", ".join(sorted(urls[u]))))
    print("Rapport : build/links-report.md — %d anomalie(s)." % len(ko))
    return 1 if ko else 0


def main(argv):
    if "--offline" in argv:
        return offline()
    if "--online" in argv:
        return online("--reset" in argv)
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
