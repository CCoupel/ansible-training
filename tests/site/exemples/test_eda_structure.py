"""Structure des rulebooks et playbooks EDA de `examples/eda/` et `labs/eda/` (#9, v1.0.0) — Python stdlib.

Aucun PyYAML (règle « tests en stdlib », décision utilisateur) : un analyseur de lignes vérifie la STRUCTURE,
pas la sémantique. Il ne remplace pas la procédure manuelle « lab testé » (tests/procedures/labs/eda/), seule à
exécuter `ansible-rulebook`.

Rulebook (fichier .yml/.yaml dont une ligne `  rules:` est au niveau d'un ruleset) :
  - liste de rulesets `- name:` ; chaque ruleset a `hosts:`, `sources:` (au moins une source `- …`) et `rules:` ;
  - chaque règle `- name:` a `condition:` non vide et `action:` ou `actions:`.
Playbook (liste de plays `- name:` avec `hosts:` et `tasks:`/`roles:`) ; l'inventaire (`all:`) est ignoré.
Tous les fichiers : indentation sans tabulation, aucune IP hors 127.0.0.1 et 192.0.2.x, README.md présent par répertoire.

Les tests sur dépôt sautent proprement tant que `examples/eda/` et `labs/eda/` n'existent pas ; les tests de
l'analyseur (fixtures synthétiques, bonnes et mauvaises) s'exécutent toujours.
Messages : chemins, numéros de ligne et noms de clés — jamais d'extrait de contenu.

Exécution : python3 -m unittest discover -s tests/site/exemples -p "test_eda_structure.py" -v
"""

import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import site_support as S  # noqa: E402

DIRS = [S.ROOT / "examples" / "eda", S.ROOT / "labs" / "eda"]
RE_IP = re.compile(r"(?<![\d.])((?:\d{1,3}\.){3}\d{1,3})(?![\d]|\.\d)")
RE_KEY = re.compile(r"^(\s*)(?:-\s+)?([A-Za-z_][\w.]*)\s*:(.*)$")


def ip_ok(ip):
    return ip == "127.0.0.1" or re.match(r"^192\.0\.2\.\d{1,3}$", ip) is not None


def _content(text):
    """[(n° de ligne, texte)] sans lignes vides ni commentaires."""
    return [(i, l.rstrip()) for i, l in enumerate(text.splitlines(), 1) if l.strip() and not l.strip().startswith("#")]


def _indent(line):
    return len(line) - len(line.lstrip())


def check_yaml_text(text):
    """Renvoie (genre, [erreurs]) ; genre ∈ rulebook | playbook | inventory | autre. Erreurs = messages sans extrait."""
    errors = []
    if "\t" in "".join(l[: len(l) - len(l.lstrip())] for l in text.splitlines()):
        errors.append("tabulation dans l'indentation")
    lines = _content(text)
    lines = [(n, l) for n, l in lines if l.strip() != "---"]
    if not lines:
        return "autre", ["fichier vide"]
    first = lines[0][1]
    if re.match(r"^[A-Za-z_][\w]*\s*:", first):  # mapping racine : inventaire ou variables
        return "inventory", errors
    if not first.startswith("- "):
        return "autre", errors + ["la racine n'est ni une liste ni un mapping (ligne %d)" % lines[0][0]]
    is_rulebook = any(re.match(r"^\s+rules\s*:\s*$", l) for _, l in lines)
    if not is_rulebook:
        keys = {m.group(2) for _, l in lines if (m := RE_KEY.match(l)) and len(m.group(1)) <= 2}
        for key in ("name", "hosts"):
            if key not in keys:
                errors.append("playbook : clé `%s` absente" % key)
        if not keys & {"tasks", "roles", "pre_tasks", "post_tasks"}:
            errors.append("playbook : ni `tasks` ni `roles`")
        return "playbook", errors

    # rulebook : un ou plusieurs rulesets, début de ruleset = « - name: » à l'indentation de la racine
    starts = [k for k, (_, l) in enumerate(lines) if re.match(r"^- name\s*:", l)]
    if not starts:
        return "rulebook", errors + ["aucun ruleset `- name:`"]
    for si, k in enumerate(starts):
        end = starts[si + 1] if si + 1 < len(starts) else len(lines)
        block = lines[k:end]
        where = "ruleset ligne %d" % block[0][0]
        top = {m.group(2): idx for idx, (_, l) in enumerate(block)
               if (m := RE_KEY.match(l)) and (len(m.group(1)) == 2 or (len(m.group(1)) == 0 and l.startswith("- ")))}
        for key in ("name", "hosts", "sources", "rules"):
            if key not in top:
                errors.append("%s : clé `%s` absente" % (where, key))
        if "sources" in top:
            i = top["sources"]
            nxt = min([j for key, j in top.items() if j > i] or [len(block)])
            items = [l for _, l in block[i + 1:nxt] if l.lstrip().startswith("- ")]
            if not items:
                errors.append("%s : `sources` sans aucune source" % where)
        if "rules" in top:
            i = top["rules"]
            nxt = min([j for key, j in top.items() if j > i] or [len(block)])
            body = block[i + 1:nxt]
            if not body:
                errors.append("%s : `rules` vide" % where)
                continue
            dashes = [_indent(l) for _, l in body if l.lstrip().startswith("- ")]
            rule_indent = min(dashes) if dashes else None
            if rule_indent is None:
                errors.append("%s : `rules` sans aucune règle" % where)
                continue
            rstarts = [j for j, (_, l) in enumerate(body) if _indent(l) == rule_indent and l.lstrip().startswith("- ")]
            for ri, j in enumerate(rstarts):
                rend = rstarts[ri + 1] if ri + 1 < len(rstarts) else len(body)
                rblock = body[j:rend]
                rwhere = "règle ligne %d" % rblock[0][0]
                rkeys = {}
                for _, l in rblock:
                    m = RE_KEY.match(l)
                    if m and (_indent(l) == rule_indent or _indent(l) == rule_indent + 2):
                        rkeys[m.group(2)] = m.group(3).strip()
                if "name" not in rkeys:
                    errors.append("%s : clé `name` absente" % rwhere)
                if "condition" not in rkeys:
                    errors.append("%s : clé `condition` absente" % rwhere)
                elif rkeys["condition"] == "":
                    # `condition:` suivi d'un bloc (all/any) : la ligne suivante doit être plus indentée
                    idx = [n for n, (_, l) in enumerate(rblock) if re.match(r"^\s*(?:-\s+)?condition\s*:\s*$", l)][0]
                    if idx + 1 >= len(rblock) or _indent(rblock[idx + 1][1]) <= _indent(rblock[idx][1]):
                        errors.append("%s : `condition` vide" % rwhere)
                if "action" not in rkeys and "actions" not in rkeys:
                    errors.append("%s : ni `action` ni `actions`" % rwhere)
    return "rulebook", errors


def ip_errors(text):
    return ["IP hors 127.0.0.1 / 192.0.2.x (ligne %d)" % n
            for n, l in enumerate(text.splitlines(), 1) for m in RE_IP.finditer(l) if not ip_ok(m.group(1))]


GOOD_RULEBOOK = """---
- name: Webhook demo
  hosts: all
  sources:
    - ansible.eda.webhook:
        host: 127.0.0.1
        port: 5000
  rules:
    - name: Service down
      condition: event.payload.status == "down"
      action:
        run_playbook:
          name: remediate.yml
    - name: Many errors
      condition:
        all:
          - event.payload.kind == "error"
          - event.payload.count >= 3
      throttle:
        once_within: 5 minutes
        group_by_attributes:
          - event.payload.host
      actions:
        - debug:
            msg: seen
"""
GOOD_PLAYBOOK = """---
- name: Remediate
  hosts: localhost
  gather_facts: false
  tasks:
    - name: Say it
      ansible.builtin.debug:
        msg: ok
"""


class TestAnalyseur(unittest.TestCase):
    """L'analyseur lui-même, sur fixtures synthétiques (toujours exécuté)."""

    def kinds(self, text):
        return check_yaml_text(text)

    def test_rulebook_valide(self):
        self.assertEqual(self.kinds(GOOD_RULEBOOK), ("rulebook", []))

    def test_playbook_valide(self):
        self.assertEqual(self.kinds(GOOD_PLAYBOOK), ("playbook", []))

    def test_inventaire_ignore(self):
        self.assertEqual(self.kinds("all:\n  hosts:\n    localhost:\n      ansible_connection: local\n"), ("inventory", []))

    def assert_error(self, text, fragment):
        kind, errs = self.kinds(text)
        self.assertTrue(any(fragment in e for e in errs), "erreur « %s » attendue, obtenu %s" % (fragment, errs))

    def test_rulebook_sans_hosts(self):
        self.assert_error(GOOD_RULEBOOK.replace("  hosts: all\n", ""), "`hosts` absente")

    def test_rulebook_sans_sources(self):
        txt = GOOD_RULEBOOK.replace("  sources:\n    - ansible.eda.webhook:\n        host: 127.0.0.1\n        port: 5000\n", "")
        self.assert_error(txt, "`sources` absente")

    def test_rulebook_source_vide(self):
        txt = GOOD_RULEBOOK.replace("    - ansible.eda.webhook:\n        host: 127.0.0.1\n        port: 5000\n", "")
        self.assert_error(txt, "sans aucune source")

    def test_regle_sans_condition(self):
        txt = GOOD_RULEBOOK.replace('      condition: event.payload.status == "down"\n', "")
        self.assert_error(txt, "`condition` absente")

    def test_regle_sans_action(self):
        txt = GOOD_RULEBOOK.replace("      action:\n        run_playbook:\n          name: remediate.yml\n", "")
        self.assert_error(txt, "ni `action` ni `actions`")

    def test_condition_vide(self):
        txt = GOOD_RULEBOOK.replace('      condition: event.payload.status == "down"\n      action:', "      condition:\n      action:")
        self.assert_error(txt, "`condition` vide")

    def test_rulebook_sans_regle(self):
        txt = GOOD_RULEBOOK.split("  rules:")[0] + "  rules:\n"
        self.assert_error(txt, "`rules`")

    def test_playbook_sans_hosts(self):
        self.assert_error(GOOD_PLAYBOOK.replace("  hosts: localhost\n", ""), "`hosts` absente")

    def test_tabulation_refusee(self):
        self.assert_error(GOOD_PLAYBOOK.replace("    - name: Say", "\t- name: Say"), "tabulation")

    def test_ip_autorisees(self):
        self.assertEqual(ip_errors("a: 127.0.0.1\nb: 192.0.2.10\nc: version 2.20.1\n"), [])

    def test_ip_interdites(self):
        self.assertEqual(len(ip_errors("a: 0.0.0.0\nb: 192.168.1.5\nc: 10.0.0.1\nd: 192.0.20.1\n")), 4)


def eda_files():
    out = []
    for d in DIRS:
        if d.is_dir():
            out.extend(p for p in sorted(d.rglob("*")) if p.is_file())
    return out


@unittest.skipUnless(any(d.is_dir() for d in DIRS), "examples/eda et labs/eda n'existent pas encore (lot 2, Batch 3)")
class TestExemplesEtLabsEda(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.files = eda_files()
        cls.yaml = [p for p in cls.files if p.suffix in (".yml", ".yaml")]

    def rel(self, p):
        return p.relative_to(S.ROOT).as_posix()

    def test_chaque_repertoire_a_un_readme(self):
        for d in DIRS:
            with self.subTest(dossier=d.relative_to(S.ROOT).as_posix()):
                self.assertTrue((d / "README.md").is_file(), "README.md manquant")

    def test_au_moins_trois_rulebooks_dans_les_exemples(self):
        kinds = [check_yaml_text(p.read_text(encoding="utf-8"))[0] for p in self.yaml if p.is_relative_to(DIRS[0])]
        self.assertGreaterEqual(kinds.count("rulebook"), 3, "au moins 3 rulebooks attendus dans examples/eda (#9)")
        self.assertGreaterEqual(kinds.count("playbook"), 1, "au moins un playbook associé attendu dans examples/eda")

    def test_le_lab_a_une_solution_rulebook_et_playbook(self):
        sol = [p for p in self.yaml if p.is_relative_to(DIRS[1] / "solution")]
        kinds = [check_yaml_text(p.read_text(encoding="utf-8"))[0] for p in sol]
        self.assertIn("rulebook", kinds, "labs/eda/solution : rulebook attendu")
        self.assertIn("playbook", kinds, "labs/eda/solution : playbook attendu")

    def test_structure_de_chaque_yaml(self):
        self.assertTrue(self.yaml, "aucun fichier YAML dans examples/eda ni labs/eda")
        for p in self.yaml:
            with self.subTest(fichier=self.rel(p)):
                kind, errs = check_yaml_text(p.read_text(encoding="utf-8"))
                self.assertEqual(errs, [], "%s (%s)" % (self.rel(p), kind))

    def test_aucune_ip_hors_127_0_0_1_et_192_0_2_x(self):
        for p in self.files:
            if p.suffix in (".yml", ".yaml", ".md", ".txt", ".sh", ".json", ".j2"):
                with self.subTest(fichier=self.rel(p)):
                    self.assertEqual(ip_errors(p.read_text(encoding="utf-8", errors="replace")), [])

    def test_fichiers_suivis_par_git(self):
        tracked = set(S.git_files("examples", "labs"))
        for p in self.files:
            self.assertIn(self.rel(p), tracked, "fichier non suivi par git : %s" % self.rel(p))


if __name__ == "__main__":
    unittest.main()
