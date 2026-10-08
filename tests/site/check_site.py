#!/usr/bin/env python3
"""Contrôle anti-fuite du site HTML commité (issue #3/#5, CA-T.1).

Usage :
  python3 tests/site/check_site.py                  fichiers SUIVIS PAR GIT : index.html, assets/, modules/, CONVENTIONS.md, examples/, labs/
  python3 tests/site/check_site.py --dir <dossier>  tous les fichiers d'un dossier (ex. zip de release dézippé)
  options : --repo <dossier>  racine du dépôt git à scanner (défaut : dépôt contenant ce script)
            --require-secret  LEAK_PATTERNS absent ou vide = échec (release, pages.yml)

Interface partagée (QA, CI, release) — mêmes règles que tests/slides/check_pptx.py :
  - exit 0 = OK ; exit 1 = fuite ou erreur ;
  - la sortie ne contient QUE : chemin du fichier (ou `fichier#<n>` si le chemin lui-même contient un
    terme interdit) + identifiant de motif — JAMAIS le texte trouvé (logs d'un dépôt public) ;
  - motifs génériques : G1 MSIP_, G2 ligne de classification, G5 IPv4 hors plages autorisées,
    G6 domaine hors liste blanche, G7 métadonnées PNG (tEXt/iTXt/zTXt/eXIf) ;
  - motifs de l'organisation : variable LEAK_PATTERNS (une regex par ligne, insensible à la casse),
    jamais dans le dépôt. Absente : avertissement (stderr), échec avec --require-secret ;
  - aucun fichier à scanner = erreur S (garde-fou : un périmètre vide ne doit pas passer pour « propre »).
Stdlib uniquement.
"""

import argparse
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "slides"))
import check_pptx as cp  # noqa: E402  (motifs, plages IP, lecture des chunks PNG)

TRACKED = ["index.html", "assets", "modules", "CONVENTIONS.md", "examples", "labs"]  # examples/ et labs/ : diffusés avec le zip (v1.0.0)
# le site est publié sous github.io ; le reste de la liste blanche est celui du PPTX
EXTRA_DOMAINS = ("github.io",)
TEXT_EXT = (".html", ".js", ".css", ".md", ".json", ".svg", ".txt", ".xml", ".map", ".webmanifest",
            ".yml", ".yaml", ".j2", ".ini", ".cfg", ".sh")  # YAML/INI des exemples et labs : IP et domaines contrôlés


def domain_ok(host):
    host = host.lower()
    return cp.domain_allowed(host) or any(host == d or host.endswith("." + d) for d in EXTRA_DOMAINS)


def tracked_files(repo):
    r = subprocess.run(["git", "-C", repo, "ls-files", "-z", "--", *TRACKED], capture_output=True)
    if r.returncode != 0:
        raise RuntimeError("git ls-files")
    return [p.decode("utf-8", "replace") for p in r.stdout.split(b"\0") if p]


def dir_files(root):
    out = []
    for base, _dirs, files in os.walk(root):
        for f in files:
            out.append(os.path.relpath(os.path.join(base, f), root))
    return sorted(out)


def scan_file(rel, data, pats, report, label):
    low = rel.lower()
    for idx, rx in pats:
        if rx.search(rel):
            report.finding(label, "L%d" % idx)
            break
    is_png = low.endswith(".png") or data[:8] == b"\x89PNG\r\n\x1a\n"
    texts = []
    if is_png:
        chunks = cp.png_text_chunks(data)
        if chunks:
            report.finding(label, "G7")
        cp.generic_scan_units(chunks, label, report)
        texts.extend(chunks)
    if low.endswith(TEXT_EXT):
        text = data.decode("utf-8", "replace")
        if cp.RE_MSIP.search(text):
            report.finding(label, "G1")
        for line in text.splitlines():
            if cp.RE_CLASSIF.match(line):
                report.finding(label, "G2")
        for m in cp.RE_IPV4.finditer(text):
            if not cp.ip_allowed(m.group(1)):
                report.finding(label, "G5")
        for m in cp.RE_DOMAIN.finditer(text):
            if not domain_ok(m.group(1)):
                report.finding(label, "G6")
        texts.append(text)
    else:
        texts.extend([data.decode("latin-1", "replace"), data.decode("utf-16-le", "replace")])
        if any(cp.RE_MSIP.search(t) for t in texts):
            report.finding(label, "G1")
    cp.leak_scan(texts, pats, label, report)


def main(argv):
    ap = argparse.ArgumentParser(add_help=True)
    ap.add_argument("--dir")
    ap.add_argument("--repo", default=os.path.abspath(os.path.join(HERE, "..", "..")))
    ap.add_argument("--require-secret", action="store_true")
    args = ap.parse_args(argv[1:])

    report = cp.Report()
    pats = cp.load_leak_patterns(report)
    if not pats and not any(l.strip() for l in os.environ.get("LEAK_PATTERNS", "").splitlines()):
        if args.require_secret:
            report.error("L", "LEAK_PATTERNS absent ou vide : scan incomplet interdit")
        else:
            print("AVERTISSEMENT: LEAK_PATTERNS absent — motifs de l'organisation non vérifiés", file=sys.stderr)

    root = os.path.abspath(args.dir) if args.dir else args.repo
    files = dir_files(root) if args.dir else tracked_files(root)
    if args.dir and not os.path.isdir(root):
        report.error("S", "dossier introuvable")
        files = []
    if not files and not report.errors:
        report.error("S", "aucun fichier à scanner")

    for k, rel in enumerate(files, start=1):
        path = os.path.join(root, rel)
        label = rel
        if any(rx.search(rel) for _, rx in pats):
            label = "fichier#%d" % k
        try:
            with open(path, "rb") as fh:
                data = fh.read()
        except OSError:
            report.error("S", "fichier illisible : %s" % label)
            continue
        scan_file(rel, data, pats, report, label)

    for label, motif in report.findings:
        print("%s: motif %s" % (label, motif))
    for e in report.errors:
        print(e)
    if report.findings or report.errors:
        print("ECHEC: %d fuite(s), %d erreur(s)" % (len(report.findings), len(report.errors)))
        return 1
    print("OK (%d fichier(s))" % len(files))
    return 0


def safe_main(argv):
    try:
        return main(argv)
    except Exception:
        if os.environ.get("CI", "").strip().lower() != "true":
            raise
        print("ERREUR V0: erreur interne (détails masqués)")
        return 1


if __name__ == "__main__":
    sys.exit(safe_main(sys.argv))
