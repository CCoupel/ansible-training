# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - à dater à la livraison

Support de formation Ansible générique : audit et correction de 38 constats d'obsolescence (versions Ansible/Python, noms de produits, FQCN des modules, liens documentation) et mise en place du workflow de publication CI.

**Versions de référence** : ansible-core 2.20, Python 3.12+ (nœud de contrôle)

### Added

- Tests automatiques d'obsolescence (`tests/slides/obsolescence/`) : assertions sur les versions, modules, syntaxe YAML, termes dépassés (#10, #11, #12, #13, #14, #15, #16, #17, #18, #20, #21, #22, #23, #24, #25, #26, #27, #28, #29, #30, #31, #32, #33, #34, #35, #36, #37, #38, #40, #41, #42, #43, #44, #45, #46, #47, #48)
- Scan de validité et anti-fuite (`tests/slides/check_pptx.py`) : archive ZIP, métadonnées, images, prévention de fuite de termes sensibles
- Workflow de publication GitHub Actions (`.github/workflows/release.yml`) : déclenchement sur tag `vX.Y.Z` ou `workflow_dispatch`, contrôles de validité et anti-fuite, création/mise à jour de release avec asset versionné `Ansible-Training-vX.Y.Z.pptx` (#49)
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
- **Inventaire dynamique et intégrations** : mise à jour des sources d'inventaire actuelles (AWS EC2, Azure, GCP, OpenStack, Kubernetes, Proxmox), intégration ManageIQ conservée et marquée comme « legacy » (#21, #35, #37)
- **Sorties d'exemple** : renouvellement des sorties avec ansible-core 2.20 (suppression de préfixes `u'`), exemple de `profile_tasks` callback réellement exécuté, anonymisation des chemins et hôtes, bannière SSH générique (#25, #40, #46, #187)
- **Comportements Ansible** : clarification de `never`/`always`/`tagged` (valeurs spéciales de `--tags`, non tags de tâche), avertissement sur `host_key_checking = False` (protection MITM), démonstration de `become: true` (#41, #43, #117, #212)
- **Notes d'intervenant** : suppression de notes génériques obsolètes, conservation du contenu pédagogique (#47, #48)
- **Version et clôture** : slide 2 mise à jour avec version v0.1.1, date de livraison, mention des versions de référence (#38)

### Security

- Scan anti-fuite bloquant en CI (`check_pptx.py` avec secret `LEAK_PATTERNS`) : prévention de publication accidentelle avec termes sensibles ; sortie masquée pour dépôt public (#49)

## [0.1.0] - version initiale

Support Ansible générique : 223 diapositives, anonymisation complète (hosts `*.example.com`, IP `192.0.2.x/RFC 5737`, domaines `example.com`), suppression de métadonnées organisationnelles, audit d'obsolescence lancé.

---

**Notes de versioning** :
- Format `X.Y.Z` en production ; `X.Y.Z.a` en développement (voir CLAUDE.md)
- Versions de référence (ansible-core, Python) lues dans `.claude/project-config.json` (`reference_version`)
- Chaque release publie un PPTX versionné via GitHub Actions
