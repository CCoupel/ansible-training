"""Tests de spécification du milestone v0.1.1 : correctifs d'obsolescence du support.

Une assertion (méthode) par issue #10 à #48, plus deux garde-fous transverses. L'issue #19
(module « Execution Environments », v1.0.0) est testée sur les slides du module m13 lues dans
assets/plan.js (jamais de numéros en dur) ; son lot n'est pas dans lots_faits.json tant que le contenu
n'existe pas (échec = « attendu, lot non fait » ; LOTS_STRICT=1 = rouge). Lecture du PPTX par texte CONCATENE des runs (pptx_reader).

Exécution (stdlib uniquement) :
    python3 -m unittest discover -s tests/slides/obsolescence -p "test_obsolescence.py" -v
Variable optionnelle : PPTX_PATH (défaut : « Ansible Training.pptx » à la racine du dépôt).

Suivi des lots : tests/slides/obsolescence/lots_faits.json liste les issues dont le lot est livré.
Un test listé qui échoue = FAIL (régression) ; un test non listé qui échoue = « skipped : attendu,
lot non fait » (la suite reste lisible pendant le cycle). LOTS_STRICT=1 ignore le fichier : tout doit
être vert (QA finale avant PUBLISH).

Les versions de référence ne sont JAMAIS codées en dur : lues dans la clé
`reference_version` de `.claude/project-config.json`.

Numéros de slides = position dans ppt/presentation.xml (cf. plan planner-v0.1.1.md).
Les images (slides 4 et 250, « TOWER » visible dans les PNG par décision Q2) sont hors
périmètre de ces tests : seuls les textes XML (slides + notes + hyperliens) sont analysés.
"""

import json
import os
import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))  # tests/slides (pptx_reader)
from pptx_reader import Deck, external_targets  # noqa: E402
import plan_reader  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
PPTX = Path(os.environ.get("PPTX_PATH", ROOT / "Ansible Training.pptx"))
CONFIG = ROOT / ".claude" / "project-config.json"

DECK = None


def setUpModule():
    global DECK
    DECK = Deck(str(PPTX))


def tearDownModule():
    if DECK is not None:
        DECK.close()


# ---------------------------------------------------------------------------------------
# Aides
# ---------------------------------------------------------------------------------------

def reference_version():
    """(ansible_core, python_min) lus dans reference_version — jamais en dur."""
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    rv = cfg.get("reference_version")
    assert isinstance(rv, dict), "clé reference_version absente de .claude/project-config.json"
    return str(rv["ansible_core"]), str(rv["python_controller_min"])


def module_slides(module_id, title_contains):
    """Numéros des slides d'un module, lus dans assets/plan.js (plage `range`), après contrôle du titre.

    Un titre différent (ex. m13 encore « Real use case ») fait échouer le test : le module n'existe pas
    encore au plan, le lot correspondant n'est pas livré."""
    entry = plan_reader.entry(module_id)
    assert entry is not None, "module %s absent de assets/plan.js" % module_id
    assert title_contains.lower() in (entry["title"] or "").lower(), \
        "module %s intitulé « %s » dans plan.js, « %s » attendu" % (module_id, entry["title"], title_contains)
    a, b = entry["range"]
    return list(range(a, b + 1))


def project_version_xyz():
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    m = re.match(r"(\d+\.\d+\.\d+)", str(cfg["version"]))
    assert m, "champ version illisible dans project-config.json"
    return m.group(1)


FLAGS = re.I | re.M


def _texts(scope, slides=None):
    """[(numéro, texte)] selon le périmètre : slides | notes | both | urls."""
    out = []
    for s in DECK.slides:
        if slides is not None and s.number not in slides:
            continue
        if scope in ("slides", "both"):
            out.append((s.number, s.text))
        if scope in ("notes", "both"):
            out.append((s.number, s.notes))
        if scope == "urls":
            urls = [s.text]
            if s.rels_part:
                urls.extend(external_targets(DECK.zip.read(s.rels_part)))
            out.append((s.number, "\n".join(urls)))
    return out


_QUOTED_VALUE = re.compile(r"^\s*(?:-\s+)?(?:[A-Za-z_][\w.]*\s*:\s+)?(['\"])(.*)$")


def quote_unbalanced(line):
    """Vrai si la valeur (ou l'élément de liste) commence par un type de guillemet droit, n'est
    JAMAIS refermée par ce même type et se termine par l'AUTRE type (ex. `'{{ item }}"`).
    Ne comptent pas : les guillemets de l'autre type à l'intérieur d'une chaîne correctement fermée
    (`'<FilesMatch ".php">'`, slide 241), ni les clés JSON entre guillemets (`"type": 'str',`)."""
    m = _QUOTED_VALUE.match(line)
    if not m:
        return False
    opening, rest = m.group(1), m.group(2)
    if opening == "'":
        closed = re.search(r"'(?!')", rest.replace("''", "\0\0")) is not None
    else:
        closed = re.search(r'(?<!\\)"', rest) is not None
    if closed:
        return False
    other = '"' if opening == "'" else "'"
    return rest.rstrip().rstrip(",}]) ").rstrip().endswith(other)


LOTS_FILE = Path(__file__).with_name("lots_faits.json")


def _lots_done():
    try:
        data = json.loads(LOTS_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return set(), set()
    return set(data.get("issues", [])), set(data.get("transverse", []))


class SlidesCase(unittest.TestCase):
    def _callTestMethod(self, method):
        """Échec d'un test dont le lot n'est pas livré -> skip « attendu, lot non fait »."""
        try:
            method()
        except self.failureException as exc:
            if os.environ.get("LOTS_STRICT") == "1":
                raise
            issues, transverse = _lots_done()
            m = re.match(r"test_issue_(\d+)_", self._testMethodName)
            done = int(m.group(1)) in issues if m else self._testMethodName[5:] in transverse
            if done:
                raise
            first = (str(exc).splitlines() or [""])[0][:140]
            raise unittest.SkipTest("attendu, lot non fait : %s" % first)

    def absent(self, pattern, scope="slides", slides=None, flags=FLAGS, why=""):
        rx = re.compile(pattern, flags)
        bad = sorted({n for n, t in _texts(scope, slides) if rx.search(t)})
        self.assertEqual(bad, [], "motif interdit encore présent (%s) slides %s %s" % (scope, bad, why))

    def present(self, pattern, slides, scope="slides", flags=FLAGS, why=""):
        """Le motif doit apparaître sur CHACUNE des slides indiquées."""
        rx = re.compile(pattern, flags)
        texts = dict(_texts(scope, list(slides)))
        missing = [n for n in slides if not rx.search(texts.get(n, ""))]
        self.assertEqual(missing, [], "motif attendu absent (%s) sur slides %s %s" % (scope, missing, why))

    def present_any(self, pattern, slides, scope="slides", flags=FLAGS):
        rx = re.compile(pattern, flags)
        found = [n for n, t in _texts(scope, list(slides)) if rx.search(t)]
        self.assertTrue(found, "motif attendu sur au moins une des slides %s" % list(slides))


# ---------------------------------------------------------------------------------------
# Garde-fous transverses
# ---------------------------------------------------------------------------------------

class TestTransverse(SlidesCase):
    def test_reference_version_declared(self):
        """Tâche 0 : reference_version existe, valeurs non vides, datée."""
        cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
        rv = cfg.get("reference_version")
        self.assertIsInstance(rv, dict)
        for key in ("ansible_core", "python_controller_min", "fixed_on"):
            self.assertTrue(str(rv.get(key, "")).strip(), "reference_version.%s manquant" % key)

    def test_extension_no_typographic_quotes_in_code(self):
        """Extension planner (→ #34) : plus de guillemets typographiques dans le CODE
        (lignes de code seulement ; les apostrophes de la prose, ex. « It’s », sont tolérées)."""
        quote = re.compile(r"(?<![A-Za-z])[“”‘’]|[“”‘]|[’”](?![a-z])")
        code = re.compile(
            r"^\s*(?:-\s+)?[A-Za-z_][\w.]*\s*:\s|^\s*[$#]\s|\{\{|\}\}|\w\s*=\s*[“”‘’]|[“”‘’]\s*[\]),]"
        )
        # Ligne d'AIDE d'une option (« -t <TYPE>, --type <TYPE> : Choose … “module” », slide 150,
        # sortie d'ansible-doc) : prose d'aide, pas du code à copier. Critère étroit (option +
        # placeholder <X> + « : » de description) pour ne pas exclure les vraies lignes de commande.
        option_help = re.compile(r"^\s*-{1,2}[A-Za-z][^\n]*<[A-Za-z_]+>[^\n]*\s:\s")
        bad = set()
        for s in DECK.slides:
            for line in s.text.split("\n"):
                if option_help.search(line):
                    continue
                if code.search(line) and quote.search(line):
                    bad.add(s.number)
        self.assertEqual(sorted(bad), [], "guillemets typographiques dans du code, slides %s" % sorted(bad))


# ---------------------------------------------------------------------------------------
# Priorité HAUTE
# ---------------------------------------------------------------------------------------

    def test_extension_balanced_quotes_in_code(self):
        """Une valeur ouverte avec un type de guillemet droit doit être fermée par le même
        (ex. `name: '{{ item }}"` = YAML invalide, slide 257). Les guillemets de l'autre type
        À L'INTÉRIEUR de la chaîne sont valides (`'<FilesMatch ".php">'`, slide 241)."""
        bad = set()
        for s in DECK.slides:
            for line in s.text.split("\n"):
                if quote_unbalanced(line):
                    bad.add(s.number)
        self.assertEqual(sorted(bad), [], "guillemets droits mal appariés dans du code, slides %s" % sorted(bad))

    def test_balanced_quotes_detector_cases(self):
        """Test piégé du détecteur : il attrape le cas réel de la slide 257 et laisse passer le YAML valide."""
        for line in ("name: '{{ item }}\"", "  - name: \"{{ item }}'", "- '{{ item }}\"", "msg: 'abc\" ]"):
            self.assertTrue(quote_unbalanced(line), line)
        for line in (
            "search_string: '<FilesMatch \".php[45]?$\">'",   # slide 241 : \" dans '...'
            "msg: \"it's fine\"",                            # ' dans \"...\"
            "name: \"{{ item }}\"", "name: '{{ item }}'",
            "when: ansible_facts['distribution'] == 'CentOS'", "msg: say hello",
            "items: ['a', 'b']",
        ):
            self.assertFalse(quote_unbalanced(line), line)


class TestHaute(SlidesCase):
    def test_issue_10_versions_minimales(self):
        core, py = reference_version()
        self.absent(r"Ansible\s+2\.9\b|Python\s+3\.6\b|min_ansible_version\s*:\s*[\"“”']?2\.9\b")
        self.present(r"ansible-core\s+%s\b" % re.escape(core), [261])
        self.present(r"Python\s+%s\b" % re.escape(py), [261])
        self.present(r"min_ansible_version\s*:\s*\"%s\"" % re.escape(core), [160, 262],
                     why="(valeur entre guillemets droits : 2.20 non quoté vaut 2.2 en YAML)")
        # clés Galaxy en minuscules (constat planner)
        self.absent(r"Galaxy_info|^\s*(?:Author|Description|License|Version)\s*:", slides=[160],
                    flags=re.M, why="(clés Galaxy capitalisées, sensible à la casse)")

    def test_issue_11_plateformes_obsoletes(self):
        self.absent(r"\bxenial\b|\bbionic\b|CentOS\s*[78]\b", scope="both")
        self.present_any(r"\bjammy\b|\bnoble\b", [262])

    def test_issue_12_python3(self):
        # print Python 2 en minuscule, sensible à la casse : « Print “...” » (étape de logigramme,
        # slide 133) est de la prose.
        self.absent(r"\bprint\s+[\"“”']", scope="both", flags=re.M)
        self.present(r"import\s+socket", [179])
        self.present(r"BUFFER_SIZE\s*=", [179])

    def test_issue_13_sudo_et_yum(self):
        self.absent(r"^\s*(?:-\s+)?sudo\s*:")
        self.absent(r"^\s*(?:-\s+)?(?:ansible\.builtin\.)?yum\s*:", slides=[94])
        self.present(r"\bbecome\s*:\s*true", [94])

    def test_issue_14_mandatory_en_condition(self):
        self.absent(r"\bwhen\s*:[^\n]*\|\s*mandatory")

    def test_issue_15_syntaxe_conditions(self):
        self.absent(r"last_restult", scope="both")
        self.absent(r"^\s*(?:Debug|When)\s*:|\b[Dd]ebug\s+:|\b[Ww]hen\s+:", slides=[41, 42], flags=re.M)
        self.present(r"\bwhen\s*:\s*not\s+last_result", [41, 42])
        self.present(r"ansible\.builtin\.debug\s*:", [41])

    def test_issue_16_ansible_extras(self):
        self.absent(r"Ansible\s+Extras|Extras\s+(?:repository|modules)", scope="both")
        self.present(r"ansible\.builtin", [45])

    def test_issue_17_molecule_obsolete(self):
        self.absent(r"^\s*lint\s*:", slides=[245])
        self.absent(r"callback_whitelist", scope="both")
        self.absent(r"\bubi8\b|ubi/ubi8", slides=[245])
        self.present(r"callbacks_enabled", [245])
        self.present(r"verifier\s*:\s*\n\s*name\s*:\s*ansible", [245])

    def test_issue_18_tower(self):
        # Texte XML uniquement : « TOWER » reste visible dans image9.png / image36.png (décision Q2).
        self.absent(r"\bTower\b", scope="both")
        self.present(r"automation\s+controller", [4])
        self.present(r"\bAWX\b", [4])


# ---------------------------------------------------------------------------------------
# Priorité MOYENNE
# ---------------------------------------------------------------------------------------

class TestMoyenne(SlidesCase):
    # --- #19 (v1.0.0) : module m13 « Execution Environments » ----------------------------------

    def _ee_slides(self):
        return module_slides("m13", "Execution Environments")

    def test_issue_19_ee_outils_et_formats_presents(self):
        slides = self._ee_slides()
        for motif, label in ((r"ansible-navigator", "ansible-navigator"),
                             (r"execution-environment\.yml", "execution-environment.yml"),
                             (r"^\s*version\s*:\s*3\b", "version: 3"),
                             (r"ansible-builder", "ansible-builder"),
                             (r"ansible-dev-tools", "ansible-dev-tools"),
                             (r"ansible-creator", "ansible-creator")):
            with self.subTest(attendu=label):
                self.present_any(motif, slides)

    def test_issue_19_ee_formes_obsoletes_absentes(self):
        slides = self._ee_slides()
        self.absent(r"creator-ee", slides=slides, why="(ancien nom de l'image)")
        self.absent(r"^\s*version\s*:\s*1\b", slides=slides, why="(schéma 1 de execution-environment.yml)")
        self.absent(r"(?:base_image|name|image|FROM)\b[^\n]*\bansible-runner\b", slides=slides,
                    why="(ansible-runner n'est pas une image de base)")

    # --- #7 (v1.0.0) : module m14 « Event-Driven Ansible » --------------------------------------
    # Motifs à confirmer par la vérification datée de dev-slides (handoff : URL et date de chaque point).
    # Sautés tant que `7` est absent de lots_faits.json ; m14 absent de plan.js = échec « attendu, lot non fait ».

    def _eda_slides(self):
        return module_slides("m14", "Event-Driven Ansible")

    def test_issue_7_eda_notions_et_syntaxe_presentes(self):
        slides = self._eda_slides()
        missing = []  # pas de subTest : le mécanisme « lot non fait » ne voit que l'échec du test lui-même
        for motif, label in ((r"ansible-rulebook", "ansible-rulebook"),
                             (r"ansible\.eda\.webhook", "ansible.eda.webhook"),
                             (r"^\s*(?:-\s+)?rules\s*:", "rules:"),
                             (r"^\s*(?:-\s+)?condition\s*:", "condition:"),
                             (r"run_playbook", "run_playbook"),
                             (r"run_job_template", "run_job_template"),
                             (r"throttle", "throttle"),
                             (r"once_within", "once_within"),
                             (r"decision[\s-]+environment", "decision environment"),
                             (r"ansible_eda\.event|event\.payload|ansible_eda", "ansible_eda.event")):
            rx = re.compile(motif, FLAGS)
            if not any(rx.search(t) for _, t in _texts("slides", slides)):
                missing.append(label)
        self.assertEqual(missing, [], "motif(s) attendu(s) absent(s) de toutes les slides du module : %s" % missing)

    def test_issue_7_eda_formes_obsoletes_absentes(self):
        slides = self._eda_slides()
        self.absent(r"ansible-events", slides=slides, why="(ancien nom du projet)")
        self.absent(r"benthomasson\.eda", slides=slides, why="(ancien espace de noms de la collection)")
        self.absent(r"--websocket-address", slides=slides, why="(option remplacée par --websocket-url)")

    def test_issue_20_ansible_engine(self):
        self.absent(r"Ansible(?:['’]s)?\s+(?:Automation\s+)?Engine", scope="both")
        self.present(r"ansible-core", [8, 9, 10])

    def test_issue_21_sources_inventaire_obsoletes(self):
        self.absent(r"Rackspace|Hanlon|Cobbler|Spacewalk", slides=[8, 28], scope="both")
        rx = re.compile(
            r"amazon\.aws\.aws_ec2|azure\.azcollection\.azure_rm|google\.cloud\.gcp_compute|"
            r"openstack\.cloud\.openstack|kubernetes\.core\.k8s|community\.general\.proxmox"
        )
        self.assertGreaterEqual(len(set(rx.findall(DECK.slide(28).text))), 3,
                                "slide 28 : au moins 3 plugins d'inventaire actuels en FQCN attendus")

    def test_issue_22_installation_ansible(self):
        self.absent(r"#\s*(?:yum|apt)\s+install\s+ansible", slides=[11])
        self.present(r"(?:pipx?\s+install|pip3?\s+install|dnf\s+install)\s+ansible", [11])

    def test_issue_23_fqcn_et_key_value(self):
        modules = [34, 35, 36, 37, 38, 39, 93, 95, 101, 132, 134, 243, 257]
        self.absent(r"^\s*(?:-\s+)?(?:yum|dnf|template|service|package|reboot|debug|async_status)\s*:",
                    slides=modules, why="(module sans FQCN)")
        self.absent(r"\b(?:pkg|name|state|src|dest)=[^\s]", slides=modules, why="(syntaxe key=value)")
        self.absent(r"\byum\b|docker-io", slides=[34, 35, 36, 37, 38, 39, 93, 95, 132, 134, 243, 257])
        self.present(r"ansible\.builtin\.(?:dnf|template|service)", [34, 93])

    def test_issue_24_paquets_el5_6_7(self):
        self.absent(r"<=\s*['\"]?[567]\b|\bEL\s*[567]\b|Vault-", slides=[238])
        self.present(r"ansible\.builtin\.package", [238, 101])
        # `ntp` reste légitime comme NOM DE TAG ou de play (« tags: ntp », « - name: NTP », slide 243) :
        # seuls le paquet/service (ntp en liste ou name: ntp en minuscule, ntpd), deltarpm et gpm sont interdits.
        self.absent(r"\bntpd\b|\bdeltarpm\b|\bgpm\b|(?-i:name\s*:\s*ntp\s*$|^\s*-\s*ntp\s*$)", slides=[101, 243])
        self.present(r"\bchrony", [101, 243])
        self.absent(r"^\s*Tags\s*:|\bblock\.\s*:", slides=[243], flags=re.M,
                    why="(clé « Tags: » capitalisée, sensible à la casse ; « tags: » est correct)")

    def test_issue_25_sorties_python2(self):
        self.absent(r"(?<![A-Za-z0-9_])u'", scope="both")
        self.absent(r"OpenSSH_5\.3", scope="both")

    def test_issue_26_aide_galaxy(self):
        self.absent(r"\blogin\b", slides=[154])
        self.present(r"ansible-galaxy", [154])
        self.present(r"\bcollection\b", [154])
        self.present(r"\brole\b", [154])

    def test_issue_27_galaxy_build_init(self):
        self.present(r"ansible-galaxy\s+collection\s+build", [161])
        self.absent(r"ansible-galaxy\s+build\b|ansible-galaxy\s+init\b", scope="both")
        self.present(r"ansible-galaxy\s+role\s+init", [248])
        self.absent(r"collection\s+publish[^\n]*(?:--username|--password)", slides=[149])
        self.absent(r"(?:--username|--password)", slides=[149])

    def test_issue_28_versions_galaxy_et_depot_tiers(self):
        self.absent(r"geerlingguy\.nginx[^\n]*2\.7\.0|ansible\.posix[^\n]*1\.3\.0", slides=[156])
        self.absent(r"guardianproject|company\.com", scope="both")
        self.absent(r"^\s*version\s*:\s*master\b", slides=[156])
        self.present(r"git\.example\.com", [156])

    def test_issue_29_liens_docs_anciennes_versions(self):
        self.absent(r"docs\.ansible\.com/ansible/(?:2\.\d+|devel)/", scope="urls")

    def test_issue_30_liens_docs_latest(self):
        # Ancienne arborescence user_guide/* : les pages ont migré (playbook_guide, inventory_guide,
        # vault_guide...). Validation HTTP réelle = rapport dev-slides + procédure QA (hors ligne ici).
        docs_slides = [13, 44, 56, 58, 77, 82, 91, 99, 113, 129, 135, 162]
        self.absent(
            r"docs\.ansible\.com/ansible/latest/user_guide/(?:playbooks_|intro_inventory|become|vault)",
            scope="urls", slides=docs_slides)

    def test_issue_31_captures_doc_datees(self):
        self.present(r"Source\s*:\s*docs\.ansible\.com[^\n]*\d{4}-\d{2}-\d{2}", [47, 48, 49, 50, 51, 52])

    def test_issue_32_callbacks_v2(self):
        self.absent(r"(?<!v2_)runner_on_|(?<!v2_)playbook_on_", scope="slides", slides=[172])
        self.present(r"v2_runner_on_ok", [172])
        self.present(r"v2_playbook_on_stats", [172])

    def test_issue_33_schema_hub_image_historique(self):
        self.present(r"capture\s+historique", [4, 250])
        self.present(r"Galaxy\s*NG|automation\s+hub", [250])
        self.absent(r"\bTower\b", slides=[250], scope="both")

    def test_issue_34_tirets_et_options(self):
        self.absent(r"(?:^|\s)[–—−‑]{1,2}[A-Za-z]", why="(tiret typographique devant une option)")
        self.absent(r"--ask-vault-file")
        self.absent(r"\bAnsible-(?:playbook|inventory|vault|galaxy)\b", flags=re.M,
                    why="(commande avec majuscule initiale)")
        self.absent(r"\bansible-playbook\s+-I\b", flags=re.M)

    def test_issue_35_dict_kv(self):
        t = DECK.slide(110).text
        self.assertNotRegex(t, r"google\.comm\b|[“”‘’]", "slide 110 : sortie d'exemple aux guillemets cassés")
        if re.search(r"dict_kv", t):
            self.assertRegex(t, r"(?i)requires?|nécessite|needs", "dict_kv conservé : dépendance à community.general non signalée")
            self.assertIn("community.general", t)

    def test_issue_36_include_vars(self):
        self.absent(r"(?<![\w.])(?:ansible\.builtin\.)?include_var(?!s)", scope="both")
        self.absent(r"my_vategory", scope="both")
        self.present(r"ansible\.builtin\.include_vars", [65])

    def test_issue_37_cloudforms_manageiq_fin_de_vie(self):
        # Décision actée : « legacy integration example » (pas de date de fin de vie officielle sourcée).
        self.present(r"end\s+of\s+life|legacy|fin\s+de\s+vie", [28, 159, 160, 258, 260])
        self.absent(r"\bCCO\b", slides=[159, 160], scope="both")


# ---------------------------------------------------------------------------------------
# Priorité BASSE
# ---------------------------------------------------------------------------------------

class TestBasse(SlidesCase):
    def test_issue_38_version_et_date_du_support(self):
        core, _ = reference_version()
        t = DECK.slide(2).text
        self.assertRegex(t, r"\bv%s\b" % re.escape(project_version_xyz()), "slide 2 : version du milestone attendue")
        self.assertNotRegex(t, r"\bV6\b|12/05/2025")
        self.assertRegex(t, r"\b\d{2}/\d{2}/\d{4}\b", "slide 2 : date de livraison JJ/MM/AAAA attendue")
        self.assertRegex(t, r"(?i)R[ée]f[ée]rence\s*:\s*ansible-core\s+%s\b" % re.escape(core))

    def test_issue_39_collections_a_new_way(self):
        self.absent(r"A\s+new\s+way\s+to\s+distribute", scope="both")
        self.present(r"standard\s+way", [143])

    def test_issue_40_openstack_tripleo(self):
        self.absent(r"undercloud|overcloud|tripleo|/home/stack", scope="both")

    def test_issue_41_tag_never(self):
        self.absent(r"never[^\n]{0,80}always|always[^\n]{0,80}never", slides=[117])
        self.present(r"--tags", [117])

    def test_issue_42_mode_fichier_quote(self):
        self.absent(r"\bmode\s*:\s*0\d{3}\b")
        self.present(r"\bmode\s*:\s*[\"']0640[\"']", [241])

    def test_issue_43_host_key_checking(self):
        self.present(r"MITM|man-in-the-middle|spoof|usurpation", [253])
        self.present(r"known_hosts", [253])

    def test_issue_44_psrp(self):
        self.present(r"\bPSRP\b", [6])

    def test_issue_45_loop_sans_guillemets(self):
        self.absent(r"\bloop\s*:\s*\{\{")
        self.present(r"loop\s*:\s*\"\{\{\s*groups\['all'\]\s*\}\}\"", [109, 128])

    def test_issue_46_slide_masquee_datee(self):
        self.absent(r"2021|\+0800|december", slides=[251])

    def test_issue_47_note_passe_partout(self):
        self.absent(r"The\s+real\s+work\.\s*General\s+format|<<\s*module\s*>>", scope="notes")

    def test_issue_48_todo_notes(self):
        self.absent(r"changer\s+de\s+groupe|\bA\s+revoir\b|chqnged", scope="notes")


if __name__ == "__main__":
    unittest.main()
