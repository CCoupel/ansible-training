# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Lots 1 et 2 de la v1.0.0 (en développement, non publiés) : modules Execution Environments (m13) et Event-Driven Ansible (m14), exemples et lab EDA, agenda sur 4 jours, outillage de renumérotation.

### Added

- **Module m13 « Execution Environments »** (#19) : 10 slides PPTX (183-192, en anglais) et module HTML associé (objectifs, « À retenir », 3 quiz, lab et solution). Couvre `execution-environment.yml` (`version: 3`), `ansible-builder`, `ansible-navigator` et `ansible-dev-tools` / `ansible-creator`.
- **Agenda sur 4 jours** (slide 3 et accueil du site) : Day 3 accueille m13 ; Day 4 accueille m15 à m17.
- **Outillage de renumérotation** : `tools/renumber.py` (`--check` / `--apply`, insertions seules, idempotent), `tests/slides/slide_index.json` (ordre des slides) et test `test_slide_index_sync` (garde-fou contre la dérive PPTX/HTML).
- **Source unique du décompte** : `tests/slides/expected.json` (nombre de slides, masquées) lu par `validate.js`, `check_pptx.py` et les tests du site, au lieu de valeurs codées en dur.
- **Process « Livraison PPTX + HTML »** dans `CONVENTIONS.md` (#5) : toute insertion de slides passe par gabarits, `renumber.py`, contrôle de non-régression, contenu, puis HTML dans le même lot.
- **Plan du module Event-Driven Ansible** (`docs/plans/v1.0.0/plan-eda.md`, #6).
- **Module m14 « Event-Driven Ansible »** (#7, #8) : 31 slides PPTX (193-223, en anglais) et module HTML associé (5 objectifs, 6 « À retenir », 3 quiz). Couvre les rulebooks, les sources `ansible.eda`, les conditions, les actions, `ansible-rulebook` et le decision environment.
- **Exemples et lab EDA** (#9) : `examples/eda/` (10 rulebooks numérotés, `remediate.yml`, inventaire, variables) et `labs/eda/` (lab de remédiation sur webhook local `127.0.0.1`, énoncé et solution). Embarqués dans le zip HTML. La procédure manuelle « lab testé » est dans `tests/procedures/labs/eda/lab-teste.md`.
- **Comptage des slides de contenu** dans `tools/validate.js` (hors Bonus) : avertissement hors de la plage 6 à 35.

### Changed

- **BREAKING (site)** : numéros des modules, qui suivent l'ordre d'affichage. Real use case passe de m13 à m15, Best practices de m14 à m16, Automation integration de m15 à m17. Les ancres `#m13-…` à `#m15-…` pointent désormais vers d'autres modules.
- **BREAKING (site)** : progression des apprenants remise à zéro une seule fois. La clé de stockage navigateur passe de `ansible-training-v1` à `ansible-training-v2`, car les anciens identifiants `m13-*` à `m15-*` ne correspondent plus aux mêmes slides.
- **Renumérotation des slides à partir de la 183** (+10) : Execution Environments 183-192 (nouveau), Real use case 193-202, Best practices 203-226, Automation integration 227-233. Le PPTX compte 233 slides, masquées 203, 220 et 227 (anciennes 193, 210 et 217).
- Image `s209-1.png` renommée `s219-1.png` (suit la slide décalée).
- **Renumérotation des slides à partir de la 193** (+31, lot 2) : Event-Driven Ansible 193-223 (nouveau), Real use case 224-233, Best practices 234-257, Automation integration 258-264. Le PPTX compte 264 slides, masquées 234, 251 et 258. Image `s219-1.png` renommée `s250-1.png`.
- Zip HTML : 71 fichiers (module m14, `examples/eda/` et `labs/eda/` inclus).
- Tests : 206 tests de site en strict (`PARITY_STRICT=1`), 46 tests d'obsolescence PPTX (`LOTS_STRICT=1`), dont des tests de concordance entre slides, exemples et lab EDA.

## [0.2.0] - 2026-10-07

Version HTML interactive du support de formation : 15 modules répartis en 217 slides PPTX (hors slides masquées), 45 quiz (3 par module), objectifs et « À retenir » pour chaque module, accueil interactif, thème clair/sombre, accessibilité (clavier, SVG nommés), interface en français, outils d'inspection et de validation du site, tests de parité, zip HTML versionné pour distribution (#3, #4, #5).

**Versions de référence** : ansible-core 2.20, Python 3.12+ (nœud de contrôle)

### Added

- **Version HTML du support** : 15 modules (m01 Introduction, m02 Inventory, m03 Playbooks, m04 Modules, m05 Variables & facts, m06 Errors & delegation, m07 Filters & conditions, m08 Loops & tags, m09 Templates & async, m10 Vault, m11 Roles & Galaxy, m12 Extend Ansible, m13 Real use case, m14 Best practices, m15 Automation integration), 217 slides PPTX (non masquées 4–223), site statique (`index.html` racine, `assets/` moteur/style/manifeste, `modules/` modules JS), ouvrable en double-clic depuis un clone (`file://`) (#3, #4)
- **Contenu interactif** : 45 quiz (3 par module, une seule réponse défendable d'après le PPTX), objectifs et « À retenir » (4-6 items) générés par le moteur de présentation, 7 notes du formateur (touches n), 9 schémas SVG avec descriptions accessibles, images converties (19 WMF → PNG)
- **Accessibilité** : clavier complet (navigation flèches, Enter, Espace, Tab), SVG avec `aria-label`/`aria-labelledby`/`aria-describedby`, alt descriptif des images, validation automatique (`validate.js`), lecteur d'écran (#3)
- **Interface en français** : libellés, menus, notes du formateur en français ; termes techniques (ansible-playbook, become, loop…) en anglais d'origine (#4, #5)
- **Thème adaptable** : clair/sombre (préférence utilisateur), variables CSS pour les couleurs des blocs de code
- **Outils** :
  - `tools/validate.js` : vérification des structures (module, slide, alt, SVG, quiz, code, links)
  - `tools/sync-meta.js` : génération/mise à jour de `assets/meta.js` depuis `.claude/project-config.json`
  - `tools/dump-course.js` : export JSON du contenu pour scripts et tests
  - `tools/package.js` : génération déterministe du zip `Ansible-Training-HTML-vX.Y.Z.zip` (51 fichiers, poids ~2.6 Mo)
  - `tools/check_links.py` : audit des 100 URL externes du site et du PPTX
- **Conventions de conversion PPTX → HTML** (`CONVENTIONS.md`) : verbatim du texte, blocs (code, bullets, table, lab/reveal, SVG, gallery, quiz), notes étiquetées du formateur, exceptions de parité (2 liens masqués)
- **Tests du site** (`tests/site/`, 131 tests) : parité PPTX-HTML (slides couvertes, texte verbatim, `<code>` ⊆ PPTX, links), cohérence (quiz, SVG, metadata), accessibilité (alt, aria), structure (modules, fichiers, meta)
- **Workflow adapté pour trois artefacts** (commits 43c826e, fab6435 `.github/workflows/release.yml`) : variable `ARTIFACTS` pour PPTX, HTML zip et .sha256, contrôles par type (validité, anti-fuite, version, date), tests bloquants (`PARITY_STRICT`, `LOTS_STRICT`, `RELEASE_TAG`), Node 22 et Python 3.12, SHAs affichés dans le log CI, vérification de la cohérence version/date entre slide 2 et meta.js

### Changed

- **Slide 2** : mise à jour avec version v0.2.0 et date de livraison (07/10/2026, date provisoire) (#38)
- **Liens documentation** : migration vers `/projects/ansible/latest/` (slides 120, 168, 169, 174, 47, 49-52) ; arborescence mise à jour (`playbook_guide`, `inventory_guide`, etc.) (#50)

### Fixed

- **Quiz** : rééquilibrage des longueurs (13 quiz reformulés pour éviter biais longueur/position), suppression de « uniquement » et `<code>` dans les options, répartition des bonnes réponses 15/15/15 (positions 0/1/2), distracteurs sans symétrie logique (M1, m10 Q1/Q3)
- **Contenu additionnel** : defaults/main.yml (m15 Q3, explain), with_items (m14), spécificités citées avec slide source (traçabilité verbatim)
- **SVG schémas** : noms accessibles (9 SVG), aria-labelledby/aria-describedby avec title+desc, ids uniques par schéma, m14 parallelism sans numéro parasite « 214 », timelines (Strategy, Asynchroneous) sans anomalie (M2)
- **Pictogrammes m01** : marqués décoratifs (`decorative: true`, `alt: ''`) avec texte explicatif dans le contexte (slides 5, 6, 8, 9 ; m1)
- **Solutions reveal** : rendues comme blocs de code (fond thémé, `overflow-x:auto`, bouton Copier), texte du PPTX préservé, aucune reformulation (m5)
- **Liens masqués** : 2 exceptions documentées (m10 slide 138 mailto, m11 slide 161 galaxy%20), légendes retirées du HTML, parité testée (m6)
- **m03 slides 34-39** : guidage étape par étape dans notes étiquetées (« Noms des tâches (slide 35) : … »), parité verte, aucun texte perdu (m3, N3)

### Notes de Développement

- Slides masquées 193, 210, 217 exclues du HTML (Q3 décidé)
- Contenu PPTX inchangé entre v0.1.1 et v0.2.0 ; slide 2 mise à jour (commit `0d8552a`) avec version v0.2.0 et date 07/10/2026 (fixée)
- Date de livraison fixée dans `assets/meta.js` (commit `6596dbf`) : 07/10/2026 (identique à la slide 2)
- Artefacts : PPTX, HTML zip (51 fichiers : index.html, assets/, modules/, Ansible Training.pptx) et .sha256, générés par `node tools/package.js` (déterministe)
- Workflow **adapté** pour v0.2.0 et supérieur (commits 43c826e, fab6435, `.github/workflows/release.yml`) :
  - Contrôle de la version (slide 2 + meta.js du zip)
  - Contrôle de la date de livraison (slide 2 + meta.js du zip, doivent être identiques)
  - Génération du fichier .sha256 pour vérification locale (`sha256sum -c`)
  - Aucune exécution réelle (pas de tag, pas de `workflow_dispatch`)

### Avant la première release v0.2.0

À valider (CI les vérifie) :
1. **Secret `LEAK_PATTERNS`** : configuré (`gh secret list`)
2. **Date de livraison** : fixée 07/10/2026 dans `assets/meta.js` (commit `6596dbf`) et slide 2 du PPTX (commit `0d8552a`)
   - Si date différente : `node tools/sync-meta.js --date JJ/MM/AAAA`, commiter, et slide 2 alignée
   - Le workflow **contrôle que les deux dates sont identiques**
3. **Branche `milestone/v0.2.0` mergée sur `main`** avant de poser le tag
4. **Tests locaux** (QA) : tous les tests du workflow doivent passer
   - `PARITY_STRICT=1 RELEASE_TAG=v0.2.0 python3 -m unittest discover -s tests/site` (131 tests)
   - `LOTS_STRICT=1 python3 -m unittest discover -s tests/slides/obsolescence` (42 tests)
   - Node 22+ Linux, Python 3.12+
5. **Premier lancement** : essai sur `v0.2.0` ; en cas d'échec partiel du workflow, prévoir de pouvoir supprimer la release GitHub et le tag avant relance

## [0.1.1] - 2026-10-07

Support de formation Ansible générique : audit et correction de 38 constats d'obsolescence (versions Ansible/Python, noms de produits, FQCN des modules, liens documentation) et mise en place du workflow de publication CI.

**Versions de référence** : ansible-core 2.20, Python 3.12+ (nœud de contrôle)

### Added

- Tests automatiques d'obsolescence (`tests/slides/obsolescence/`) : assertions sur les versions, modules, syntaxe YAML, termes dépassés (#10, #11, #12, #13, #14, #15, #16, #17, #18, #20, #21, #22, #23, #24, #25, #26, #27, #28, #29, #30, #31, #32, #33, #34, #35, #36, #37, #38, #40, #41, #42, #43, #44, #45, #46, #47, #48)
- Scan de validité et anti-fuite (`tests/slides/check_pptx.py`) : archive ZIP, métadonnées, images, prévention de fuite de termes sensibles
- Workflow de publication GitHub Actions (`.github/workflows/release.yml`) : déclenchement sur tag `vX.Y.Z` (posé sur `main`) ou `workflow_dispatch`, contrôles de validité et anti-fuite, vérification que le tag est ancêtre de `origin/main` (bloquant), création/mise à jour de release avec asset versionné `Ansible-Training-vX.Y.Z.pptx` (#49)
- Configuration des versions de référence (`reference_version` dans `.claude/project-config.json`) : ansible-core 2.20, Python 3.12+, source et date d'audit

### Fixed

- **Syntaxe YAML et validité** : correction de syntaxe cassée, guillemets typographiques dans le code, indentation YAML, clés de configuration en minuscules, tirets ASCII dans les commandes (#13, #14, #15, #34, #40, #45)
- **Modules et FQCN** : normalisation vers `ansible.builtin.*`, migration de `yum` vers `dnf`/`package`, correction de noms de modules (`include_var` → `include_vars`), ajout de FQCN manquants (#22, #23, #24, #34, #42)
- **Versions Ansible** : mise à jour de `min_ansible_version` (2.9 → 2.20) et plateformes supportées (EL 9, Ubuntu jammy/noble, Debian bookworm) (#10, #11)
- **Gestion de packages** : remplacement de paquets obsolètes (`ntp` → `chrony`, retrait de `deltarpm`/`gpm`), modules de gestion de packages (#22, #24)
- **Produits et terminologie** : remplacement de « Ansible Tower » par « automation controller/AWX », « Ansible Engine » → « ansible-core », « Extras Modules » → « Collections (Galaxy, Automation Hub) », ajout de PSRP aux transports (#16, #18, #20, #33, #39, #44)
- **Galaxy et Molecule** : mise à jour des versions de collections, option `lint:` supprimée (ansible-lint indépendant), `verifier: name: ansible`, callbacks actualisés avec méthodes `v2_*`, driver podman + UBI9, `molecule init scenario` (#12, #17, #26, #27, #28, #32)
- **Callbacks et plugins** : correction des signatures de callbacks `v2_*`, ajout de `callbacks_enabled`, retrait de callback `yaml` (non fourni par ansible-core 2.20) (#12, #32)
- **Liens documentation** : migration vers nouvelles URL `docs.ansible.com/projects/ansible/latest/`, vérification et correction de 32+ hyperliens de modules/collections, arborescence mise à jour (`playbook_guide`, `inventory_guide`) (#29, #30, #31)
- **Inventaire dynamique et intégrations** : mise à jour des sources d'inventaire actuelles (AWS EC2, Azure, GCP, OpenStack, oVirt, Proxmox, Netbox), intégration ManageIQ conservée et marquée comme « legacy » (#21, #35, #37)
- **Sorties d'exemple** : renouvellement des sorties avec ansible-core 2.20 (suppression de préfixes `u'`), exemple de `profile_tasks` callback réellement exécuté, anonymisation des chemins et hôtes, bannière SSH générique (slide 187) (#25, #40, #46)
- **Comportements Ansible** : clarification de `never`/`always`/`tagged` (valeurs spéciales de `--tags`, non tags de tâche) (slide 117), avertissement sur `host_key_checking = False` (protection MITM) (slide 212), démonstration de `become: true` (#41, #43)
- **Notes d'intervenant** : suppression de notes génériques obsolètes, conservation du contenu pédagogique (#47, #48)
- **Version et clôture** : slide 2 mise à jour avec version v0.1.1, date de livraison, mention des versions de référence (#38)

### Security

- Scan anti-fuite bloquant en CI (`check_pptx.py` avec secret `LEAK_PATTERNS`) : prévention de publication accidentelle avec termes sensibles ; sortie masquée pour dépôt public (#49)

### Reprises de la Revue de Code

- **Slides 201, 202** : correction des clés YAML et indentation invalidées par la revue (éléments de la tâche #23)
- **Slide 145** : correction de clés YAML capitalisées et espaces insécables, harmonisation de la mise en forme
- **Slide 26** : correction du JSON d'inventaire et de sa mise en forme
- **Notes 63, 66, 67, 108** : conservation de contenu valide signalé par la revue, notamment pour les exemples de tâches
- **Slide 219** : harmonisation de la mention « legacy integration example » (ManageIQ)
- **Slide 145** : paquet `nfs-utils` validé et préservé
- **Slide 145** : noms de rôles example validés (« configure SSH »)

### Known Issues

- **Slide 47 (hyperliens)** : 3 liens de collections non vérifiés (HTTP 429 des serveurs) : `cisco/dnac`, `cisco/ise`, `cloud/common` — statut à confirmer manuellement ou via la CI
- **Slides 120, 168, 169, 174** : préfixe `/ansible/latest/` conservé (redirections fonctionnelles, migration vers `/projects/ansible/latest/` à prévoir dans une future issue)
- **Slide 11** : la mention de `dnf install ansible-core` pour RHEL n'a pas été ajoutée faute de source officielle dans le guide d'installation ; à vérifier

## [0.1.0] - version initiale

Support Ansible générique : 223 slides, anonymisation complète (hosts `*.example.com`, IP `192.0.2.x/RFC 5737`, domaines `example.com`), suppression de métadonnées organisationnelles, audit d'obsolescence lancé.

---

**Notes de versioning** :
- Format `X.Y.Z` en production ; `X.Y.Z.a` en développement (voir CLAUDE.md)
- Versions de référence (ansible-core, Python) lues dans `.claude/project-config.json` (`reference_version`)
- Chaque release publie un PPTX versionné via GitHub Actions
