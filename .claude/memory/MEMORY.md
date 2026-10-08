# MEMORY.md — Ansible Training Project

**Dernière mise à jour** : 2026-10-08 (fin de session v0.2.0)  
**Projet** : Ansible Training  
**Team** : ansible-training-team (8 permanents, 2 ponctuels)

---

## Version Courante

| Paramètre | Valeur |
|-----------|--------|
| Version (PROD) | `0.2.0` (livrée 2026-10-08) |
| Release | https://github.com/CCoupel/ansible-training/releases/tag/v0.2.0 |
| Assets | 3 : PPTX, zip HTML 51 entrées, .sha256 |
| Commit | b4b67b2 (docs(readme): aligner workflow release...) |
| Branch main | v0.2.0 merged, stable |
| Template | v3.13.1 |

---

## Cycle v0.2.0 — Clôture (✅ LIVRÉE EN PROD — 2026-10-08)

### Livrables
- ✅ **Site HTML** : 15 modules, 217 slides (hors 193/210/217 masquées), 45 quiz (15/15/15), objectifs, « À retenir »
- ✅ **Outils** : validate.js, sync-meta.js, dump-course.js, package.js, check_links.py
- ✅ **Tests** : 131 tests site (parité, anti-fuite, structure)
- ✅ **Workflow durci** : 3 assets, contrôle version + date, retrait exception v0.1.0
- ✅ **PPTX slide 2** : v0.2.0, date 07/10/2026 (fixée, = meta.js)
- ✅ **Documentation** : CHANGELOG [0.2.0], README V HTML, CLAUDE.md (Release, Extensibilité, Prérequis)

### Décisions v0.2.0 Consolidées
| Décision | Statut |
|----------|--------|
| Contenu = quiz + objectifs + « À retenir » | ✅ Implémenté |
| Slides masquées 193/210/217 exclues | ✅ Implémenté |
| Interface en français (i18n) | ✅ Implémenté |
| Agent course = instance generic | ✅ Implémenté |
| Workflow + version + date contrôlées | ✅ Implémenté (fab6435) |
| Nom d'auteur slide 147 m11 accepté | ✅ Accepté |
| Pas de push avant GATE pilote | ✅ Respectée |

### Cycle v0.1.1 — Recap (✅ LIVRÉE 2026-10-07, commit a120dab)
**Contenu** : audit d'obsolescence (38 correctifs), tests CI, documentation release/workflow  
**Durée** : ~24h, 39 issues fermées (#10-#49 hors #19)

---

## Roadmap Versions

**✅ v0.1.0 (2026-10-06)** → **✅ v0.1.1 (2026-10-07)** → **✅ v0.2.0 (2026-10-08)**  
PPTX générique (audit) → PPTX + tests CI → PPTX + site HTML 15 modules

**⏳ v1.0.0 (À VENIR)**  
Module EDA (#6-#9, #19) + multilingue fr/en (#51)  
**Prérequis** : GitHub Pages confirmation (3.5), Actions Node update (2026-10-19)

---

## Règles Apprises (v0.1.1 → v0.2.0)

### 1. Git & Commit Protocol
- **Code retour** : vérifier systématiquement chaque `git` (tag, push, merge)
- **Dépôt public** : pré-vol en lecture seule + accord avant push
- **Adresse de retour** : `team-lead` (jamais `main` — outil refuse)
- **DONE d'agent** : doit citer le chemin exact du rapport
- **Branches** : milestone conservée après release (archivée)

### 2. Release & Workflow
- **Push v0.1.1 avant CI** : tout l'historique public avant que tag-based workflow le scanne
- **Release.yml durable** : tests bloquants (PARITY_STRICT, LOTS_STRICT), version slide 2 = meta.js, retrait rattrapage v0.1.0
- **Assets** : 3 (PPTX + zip + .sha256), vérification locale `sha256sum -c`

### 3. Node & Tests
- **node.exe wrapper** : chemins POSIX → ~23 faux échecs tests/site
  - **Solution** : node Linux 22+ (hors dépôt)
  - **Impact** : dev local ≠ CI (vigilance)
- **package.js** : refuse arbre modifié (commiter avant)

### 4. Protocol & Team
- **Rapport obligatoire** : `_work/reports/<agent>-<timestamp>.md`, jamais inline
- **Consignes > 3 lignes** : `_work/tasks/`, jamais inline
- **unzip** : absent du poste (géré par CI)

---

## Sujets Ouverts / v1.0.0

| Topic | Priorité | Notes |
|-------|----------|-------|
| GitHub Pages confirmation (3.5) | Oui | Impact release |
| Actions Node deprecation (2026-10-19) | Oui | Surveiller ubuntu-latest |
| I1 Secret exposé aux tests | Oui | Sécurité |
| I2 Rulesets tags/main protection | Oui | Admin |
| N3 Guidage m03 34-39 (notes seulement) | Non | À juger visuel |
| Lab sans persistance | Non | Noté v0.2.0 |
| Coquilles PPTX (verbatim) | Non | Documenté CONVENTIONS.md |
| N1 timeout/pipefail workflow | Non | Refusé |
| N4 Dependabot | Moyen | Update actions/node |

---

## Configuration Agents

**Permanents** : planner, dev-slides, course (generic), test-writer, code-reviewer, qa, doc-updater, deployer  
**Ponctuels** : security, marketing-release  
**Adresse de retour** : `team-lead` (jamais `main`)

---

## Ressources Clés

| Document | Usage |
|----------|-------|
| CLAUDE.md | Conventions, workflow, agents, release/CI |
| CHANGELOG.md | Historique v0.2.0 livrée |
| README.md | Guide HTML, tests, prérequis release |
| .claude/memory/ | Sessions précédentes (`.remember/`) |

---

## Checklist v1.0.0 Prep

- [ ] GitHub Pages confirmation utilisateur (GATE 3.5)
- [ ] Actions Node 20 upgrade (deadline 2026-10-19)
- [ ] Sécurité : I1 (secret aux tests), I2 (Rulesets)
- [ ] Sujets ouverts : revue N3, N4 (Dependabot)
- [ ] Scope : Module EDA (#6-#9, #19) + multilingue (#51)
