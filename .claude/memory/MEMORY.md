# MEMORY.md — Ansible Training Project

**Dernière mise à jour** : 2026-10-07 (fin de session v0.1.1)  
**Projet** : Ansible Training  
**Team** : ansible-training-team

---

## Version Courante

| Paramètre | Valeur |
|-----------|--------|
| Version (PROD) | `0.1.1` (livrée 2026-10-07) |
| Version (DEV) | `0.2.0.0` (cycle v0.2.0 en cours) |
| Environnement | PROD (v0.1.1 released) |
| Branche active | `milestone/v0.2.0` (développement) |
| Branche par défaut | `main` |
| Release PROD | https://github.com/CCoupel/ansible-training/releases/tag/v0.1.1 |
| Tag PROD | `v0.1.1` (commit a120dab) |
| Template | v3.12.0 |

---

## Cycle v0.1.1 — Clôture (✅ LIVRÉE EN PROD — 2026-10-07)

### Livrables Complétés
**Release** : https://github.com/CCoupel/ansible-training/releases/tag/v0.1.1  
**Tag** : `v0.1.1` (commit `a120dab`)  
**Asset** : `Ansible-Training-v0.1.1.pptx`  
**Issues fermées** : 39 (#10-#49, hors #19 reportée v0.3.0)

**Étapes complétées** :
- ✅ Audit d'obsolescence (38 correctifs dans les 223 slides)
  - Syntaxe YAML, versions Ansible, noms de produits (Tower → automation controller)
  - Modules FQCN, gestion de packages, Galaxy/Molecule
  - Liens documentation mis à jour (docs.ansible.com/projects/ansible/latest/)
  - Sorties d'exemple renouvelées (ansible-core 2.20)
  - Notes d'intervenant nettoyées
- ✅ Tests automatiques (obsolescence + validité + anti-fuite)
  - `tests/slides/check_pptx.py` : validité ZIP, scan métadonnées
  - `tests/slides/obsolescence/` : assertions par issue (41 tests, OK)
- ✅ Workflow de publication (`.github/workflows/release.yml`)
  - Déclenchement sur tag `vX.Y.Z` posé sur `main` (vérification merge-base)
  - Scan anti-fuite bloquant avec secret `LEAK_PATTERNS`
  - Création release et asset versionné
- ✅ Documentation (README, CHANGELOG, CLAUDE.md)
  - README.md : créé (structure, contenu, tests, versions, release/CI)
  - CHANGELOG.md : format Keep a Changelog, section [0.1.1] complète
  - CLAUDE.md : section « Release et CI », règle « tag sur main »
- ✅ CI validée (tous les contrôles passent)

### Décisions Utilisateur (v0.1.1, GATE 1.5-Q1 à Q4)

| # | Décision | Impact |
|---|----------|--------|
| Q1 | Versions de référence figées : **ansible-core 2.20**, **Python ≥ 3.12** | Slide 2, `.claude/project-config.json`, tests |
| Q2 | Images slides 4 (TOWER) & 209 conservées + légende « capture historique » | Lot 3, anti-fuite garde-fou |
| Q3 | ManageIQ conservé comme exemple « legacy integration example » | Slides 210, 217, 219 |
| Q4 | Secret GitHub `LEAK_PATTERNS` créé (regex des termes sensibles) | Workflow bloquant, CI refusée sans |
| +1 | Fond blanc appliqué à tout le support | Batch final |
| +2 | Date slide 2 = 06/10/2026 (non mise à jour à chaque release) | À confirmer pour v0.2.0+ |

---

## Cycle v0.2.0 — Initialisation (🔄 EN COURS)

### Vue d'ensemble
**Branche** : `milestone/v0.2.0` (créée, commit 73e4819)  
**Version DEV** : `0.2.0.0`  
**Objectif** : Format multi-canal (PowerPoint + HTML interactif)  
**Issues** : #3, #4, #5, #50

### Architecture HTML Décidée
- **Base** : conversion des 223 slides en HTML interactif
- **Source de contenu** : PPTX anonymisé (référence stable)
- **Décisions techniques prises** :
  - Compagnon agent `generic.course.md` pour convertion HTML
  - Accent bleu (palette de design)
  - Référence centralisée `reference_version` (.claude/project-config.json)
  - Chemin local : `/mnt/c/Users/cyril/Documents/PROJETS/TRAINING/OPENSHIFT` (à consulter hors session)
  - Fichier d'étude : `docs/HOMOGENEISATION-OPENSHIFT.md` (local, non suivi git)

---

## Roadmap / Milestones

### ✅ v0.1.0 (TERMINÉ — LIVRÉ EN PROD — 2026-10-06)
Support générique Ansible — PPTX anonymisé  
**Release** : https://github.com/CCoupel/ansible-training/releases/tag/v0.1.0

### ✅ v0.1.1 (TERMINÉ — LIVRÉ EN PROD — 2026-10-07)
Correctifs contenu + CI PowerPoint  
**Release** : https://github.com/CCoupel/ansible-training/releases/tag/v0.1.1  
**Issues fermées** : #10-#49 (hors #19)

### 🔄 v0.2.0 (EN COURS)
Format multi-canal : PowerPoint + HTML ludique  
**Issues** : #3 (architecture), #4 (HTML), #5 (exigence permanente PPTX+HTML), #50 (docs.ansible.com 429)

### ⏳ v0.3.0 (À VENIR)
Nouveau module : Event-Driven Ansible  
**Issues** : #6-#9 (plan, slides, HTML, labs), #19 (obsolescence ansible-navigator/EE)

---

## Règles Apprises (v0.1.1)

### 1. Git & Code Retour
- **Vérifier toujours** le code retour de chaque commande git avant d'enchaîner
  - Incident v0.1.1 : tag posé à mauvais endroit (hors main), puis supprimé et reposé
  - Leçon : validation systématique, ne pas supposer le succès
- **Dépôt public** : jamais de push avant validation manuelle complète
  - Publication non réversible
  - Nécessité d'accord utilisateur avant tout push

### 2. Validation Visuelle & Rendering
- **Aucun LibreOffice** dans cet environnement → **revue visuelle humaine obligatoire**
  - Débordements de texte, call-outs, alignement
  - À valider avant chaque release (non automatisé)

### 3. Endpoints Externes
- **docs.ansible.com** : répond HTTP 429 en rafale (trop de requêtes)
  - Impact : vérification manuelle des URLs en lot, délai à respecter
  - Issue #50 créée pour suivi

### 4. Communication & Protocole
- **Adresse de retour** : `team-lead` (projet-spécifique, pas `main`)
- **Consignes** : toujours transmises par référence de fichier, jamais en ligne
  - Évite duplication, facilite versionning
- **Format rapport** : livrables dans `_work/reports/`, `_work/handoff/` (jamais inline)

---

## Décisions Techniques Consolidées

### Template & Infrastructure
| Item | Statut | Détails |
|------|--------|---------|
| Template | v3.12.0 (sync depuis template global) | À jour |
| Initialisation | ✅ Complète | Agents reconfigurés, équipe testée |
| Infra | ❌ Non applicable | Projet documents-only (PPTX + docs) |

### Équipe
| Rôle | Statut | Notes |
|------|--------|-------|
| dev-slides | ✅ Actif | Spécialisé PPTX PowerPoint |
| planner | ✅ Permanent | Plan v0.1.1 complété |
| test-writer | ✅ Permanent | Tests obsolescence + CI |
| code-reviewer | ✅ Permanent | Revue workflow + code |
| qa | ✅ Permanent | Validation tests + CI |
| doc-updater | ✅ Permanent | README, CHANGELOG, CLAUDE.md |
| deployer | ✅ Permanent | Workflow release + tagging |
| security | ✅ Ponctuel | Non utilisé v0.1.1 |
| marketing-release | ✅ Ponctuel | Release notes (v0.2.0+) |

### Fichiers Gérés
- **PPTX public** : `Ansible Training.pptx` (suivi git, anonymisé)
- **Sauvegarde** : `Ansible Training.orig.pptx` (.gitignored)
- **Mémoire session** : `.remember/` (.gitignored)
- **Fichier local d'étude** : `docs/HOMOGENEISATION-OPENSHIFT.md` (non suivi, local)

---

## Règles Critiques

### 1. Anonymisation & Sécurité
- **Zéro référence** à l'organisation d'origine (dépôt public)
  - Logos, domaines, identifiants, chemins, proxy
  - Dépôt scannné via `check_pptx.py` + secret `LEAK_PATTERNS`
- **IP génériques** : `192.0.2.x` (RFC 5737) obligatoire
- **Secret LEAK_PATTERNS** : créé (contenu non écrit en mémoire = fichier public)

### 2. Versions de Référence (Figées v0.1.1)
- **ansible-core** : 2.20 (ou later)
- **Python** : 3.12+ (nœud de contrôle)
- **Source** : clé `reference_version` dans `.claude/project-config.json`
- **Affichage** : slide 2 du support

### 3. Conventions Git
- **Branches** : `milestone/vX.Y.Z`
- **Commits** : Conventional Commits (`docs(slides):`, `feat:`, `fix:`, etc.)
- **Tags** : `vX.Y.Z` posés sur `main` (vérification merge-base en CI)
- **Jamais de travail direct sur `main`** → tout passe par milestone

### 4. Interlocution
- **Adresse unique** : `team-lead` (non `main`)
- **Format rapport** : fichier + référence, jamais inline
- **Questions utilisateur** : via AskUserQuestion (structured, jamais texte libre)

---

## Historique des Commits (v0.1.1 PROD)

| SHA | Type | Message |
|-----|------|---------|
| a120dab | chore | Release v0.1.1 |
| f553bb3 | chore | Version 0.1.1 |
| c20eaad | docs(slides) | Fond blanc sur tout le support |
| e2a2d0a | docs | Règle « tag sur main » + corrections CHANGELOG |
| 0681f6d | ci(release) | Vérification tag posé sur main |
| f42de50 | docs | Finalise CHANGELOG + coquilles |
| 166d686 | docs(slides) | Reprises revue batch 2 |
| f5442fb | docs | Corrections CHANGELOG section release |
| 8dda9a9 | docs | README, CHANGELOG, section release/CI |
| ... (suite lots 1-10) | ... | ... |

---

## Checklist Fin de Session v0.1.1 (07-10-2026)

- [x] Audit d'obsolescence : 38 correctifs appliqués
- [x] Tests : obsolescence (41 tests OK), validité (check_pptx), anti-fuite
- [x] Documentation : README.md créé, CHANGELOG.md complété, CLAUDE.md mis à jour
- [x] Workflow CI : releasefile.yml, vérification tag sur main
- [x] Secret GitHub : LEAK_PATTERNS créé (contenu non documenté)
- [x] Release v0.1.1 : publiée, tag a120dab, asset `Ansible-Training-v0.1.1.pptx`
- [x] Milestone v0.1.1 : fermé, issues #10-#49 fermées (hors #19)
- [x] Branche milestone/v0.2.0 : créée (commit 73e4819)
- [x] Version DEV : `0.2.0.0` configurée

---

## Décisions à Valider v0.2.0 & Suite

1. **Date slide 2** : rester 06/10/2026 ou mettre à jour avec chaque release ?
2. **HOMOGENEISATION-OPENSHIFT.md** : conversion HTML basée sur ce fichier local (décision confirmée)
3. **Compagnon agent** : `generic.course.md` spécialisé pour conversion HTML
4. **Palette design** : accent bleu validé pour HTML v0.2.0

---

## Prochaine Session — Cycle v0.2.0 (Priorités)

1. **Conversion HTML** : démarrer #4 (agent generic.course.md)
2. **Architure & design** : #3 (blueprint HTML)
3. **Tests HTML** : #5 (exigence PPTX + HTML)
4. **Résoudre #50** : docs.ansible.com 429 (vérifications manuelles + délai)

---

## Ressources & Références

| Document | Chemin | Usage |
|----------|--------|-------|
| Instructions projet | `CLAUDE.md` | Conventions git, release/CI, agents |
| Protocole agents | `.claude/agents/context/TEAMMATES_PROTOCOL.template.md` | Mode teammates |
| Config projet | `.claude/project-config.json` | Versions référence, structure |
| Changelog | `CHANGELOG.md` | Historique des versions |
| README | `README.md` | Guide utilisateur, tests, CI |
| Agent doc-updater | `.claude/agents/doc-updater.template.md` | Documentation |
| Agent dev-slides | `.claude/agents/dev-slides.md` | PPTX evolution |
| Étude HTML | `docs/HOMOGENEISATION-OPENSHIFT.md` | Conversion HTML (local) |

---

## Notes Session (v0.1.1 — 06-10-2026 & 07-10-2026)

- **06-10 15:26-17:30** : Cycle v0.1.1 démarré (plan, audit, dev-slides lots 1-10, tests, review, QA)
- **06-10 18:36+** : Template synced v3.10.0 → v3.12.0
- **07-10** : DOC DRAFT (README, CHANGELOG, section release/CI), corrections, DOC FINALIZE
- **07-10** : v0.1.1 released (release GitHub, tag a120dab)
- **07-10** : Milestone/v0.2.0 créée (commit 73e4819)

### Résumé Exécutif v0.1.1
- **Durée** : ~24 heures (multi-session)
- **Déliverables** : v0.1.1 publiée, 39 issues fermées, 223 slides corrigées, workflow CI implémenté
- **État du dépôt** : main stable (v0.1.1), milestone/v0.2.0 en développement
- **Adresse de retour** : team-lead

---

## Statut Global

**✅ SESSION v0.1.1 COMPLÉTÉE**

- Version PROD : `0.1.1` (https://github.com/CCoupel/ansible-training/releases/tag/v0.1.1)
- Version DEV : `0.2.0.0` (milestone/v0.2.0 créée)
- Dépôt public : stable, branche par défaut `main`
- Cycle actif : `milestone/v0.2.0` (développement)
- Issues fermées : v0.1.1 complète (39 issues #10-#49 hors #19)
- Pipeline v0.2.0 : 4 issues (#3, #4, #5, #50)
- Pipeline v0.3.0 : 5 issues (#6-#9, #19)

**Équipe opérationnelle** : tous agents testés et validés  
**Adresse de retour** : team-lead (projet-spécifique)  
**Prochaine action** : démarrer développement v0.2.0 (HTML conversion)
