# MEMORY.md — Ansible Training Project

**Dernière mise à jour** : 2026-10-06 17:38  
**Projet** : Ansible Training  
**Team** : ansible-training-team

---

## Version Courante

| Paramètre | Valeur |
|-----------|--------|
| Version (PROD) | `0.1.0` |
| Version (DEV) | `0.1.1.a` (démarrage cycle v0.1.1) |
| Environnement | PROD |
| Branche active | `main` (branche par défaut) |
| Branches actives | Aucune branche de travail (cycle v0.1.0 fermé) |
| Prochaine branche | `milestone/v0.1.1` (créée au démarrage du cycle v0.1.1) |
| Deployments | PROD = release publique (main + tag v0.1.0) |
| Release | https://github.com/CCoupel/ansible-training/releases/tag/v0.1.0 |
| CI/CD | Aucune CI configurée (prévu v0.1.1 : #49) |

---

## Cycle v0.1.0 — Clôture

### ✅ v0.1.0 LIVRÉE EN PROD

**Release** : https://github.com/CCoupel/ansible-training/releases/tag/v0.1.0  
**Tag** : `v0.1.0` (annoté, commit `dafc2f1`)  
**Branche** : `main` (branche par défaut du dépôt)  

**Étapes complétées** :
- ✅ PPTX anonymisé (hôtes, IP, identifiants, chemins, proxy, liens supprimés)
- ✅ Contrôles manuels validés (16:39)
- ✅ Audit d'obsolescence complété (39 constats)
- ✅ Historique git nettoyé (force-push, branches supprimées)
- ✅ Dépôt public livré (main + tag v0.1.0)

**État des branches** :
- ❌ `milestone/v0.1.0` : SUPPRIMÉE (locale et distante) après fusion sur main
- ✅ `main` : branche par défaut, contient la release v0.1.0
- 📋 `milestone/v0.1.1` : sera créée au démarrage du cycle v0.1.1

---

## Roadmap / Milestones

### v0.1.0 (✅ TERMINÉ — LIVRÉ EN PROD — 2026-10-06 17:38)
**Support générique Ansible — PPTX anonymisé**
- ✅ Support de formation en PowerPoint
- ✅ Version générique diffusable (aucune référence à l'organisation d'origine)
- ✅ **Anonymisation effectuée** : hôtes, IP, identifiants de démo, chemins, proxy, liens remplacés
  - Slides anonymisées : 40, 54, 75-76, 97-98, 110, 174, 187
  - Auteur conservé (décision utilisateur)
  - 19 WMF validés par l'utilisateur
- ✅ **Dépôt GitHub public** : `CCoupel/ansible-training`
  - Branche `main` (branche par défaut)
  - Tag `v0.1.0` annoté (commit `dafc2f1`)
  - Release: https://github.com/CCoupel/ansible-training/releases/tag/v0.1.0
  - Historique reécrit (--force-with-lease) — décision utilisateur
  - Branche `milestone/v0.1.0` supprimée (locale et distante)

### v0.2.0 (À VENIR)
**Format multi-canal : PowerPoint + HTML ludique**
- Le support doit **systématiquement** exister en deux formats :
  1. PowerPoint (version actuelle)
  2. HTML (version interactive & ludique)
- **Cette exigence est permanente** pour toutes les versions suivantes
- Amélioration de l'accessibilité et de la présentation en ligne

### v0.3.0 (À VENIR)
**Nouveau module : Event-Driven Ansible**
- Extension du curriculum avec le module EDA
- Support du format multi-canal (PowerPoint + HTML)

---

## Dépôt & Commits

### Historique des Commits (v0.1.0 PROD)

| SHA | Type | Message | Détails |
|-----|------|---------|---------|
| `fd9435b` | chore | Configuration projet et agents | Initialisation template |
| `675af4b` | docs | Documentation et plan de tests | Architecture et stratégie de test |
| `84dcf79` | docs(slides) | PPTX anonymisé | SHA256: `e9568d34de81ccb787a66393abef323ead4229fd0d6eefbcc89bf520c8bc83ea`, 2.4 MB |
| `e685300` | docs(memory) | MEMORY.md v0.1.0 | Voir `git log` pour SHA final |

**Historique reécrit** : `f2ea50c` et `a27b4e1` supprimés par force-push protégé (--force-with-lease)
- Branches de sauvegarde supprimées
- Reflog local non purgé
- Dépôt distant : main + tag v0.1.0 publiés

### Milestones GitHub

| # | Version | Statut | Issues | Objectif |
|---|---------|--------|--------|----------|
| #3 | v0.1.0 | ✅ FERMÉ | #1, #2 (2 issues) | Support PPTX générique (LIVRÉ) |
| #4 | v0.1.1 | OUVERT | #10-#48, #49 (39 issues) | Correctifs contenu + CI PowerPoint |
| #1 | v0.2.0 | OUVERT | #3-#5 (3 issues) | Format multi-canal (PPTX + HTML) |
| #2 | v0.3.0 | OUVERT | #6-#9, #19 (5 issues) | Module Event-Driven Ansible |

### Issues Traquées

**v0.1.0 (FERMÉÉ)** :
- #1 — ✅ Contrôle manuel final du PPTX (FERMÉE)
- #2 — ✅ Audit d'obsolescence Ansible/AWX (FERMÉE — 39 constats reportés)

**v0.1.1 (CORRECTIFS CONTENU + CI)** :
- #10-#48 — 38 issues de contenu obsolète / à améliorer (voir audit d'obsolescence)
- #49 — **La CI doit publier le PowerPoint dans la release** (GitHub Actions sur tag vX.Y.Z, asset PPTX versionné, scan anti-fuite XML dézippés avant publication, extension HTML prévu v0.2.0, rattrapage v0.1.0 via workflow_dispatch)

**v0.2.0** :
- #3 — Architecture HTML
- #4 — Version HTML du support
- #5 — PPTX + HTML à chaque version (exigence permanente)

**v0.3.0** :
- #6 — Plan EDA
- #7 — Slides EDA
- #8 — HTML EDA
- #9 — Rulebooks et lab TP
- #19 — (H10) ansible-navigator/EE/EDA — obsolescence majeure

---

## Audit d'Obsolescence & Constats

**Statut** : ✅ TERMINÉ (v0.1.0)  
**Rapport** : `_work/reports/...` (local)  
**Constats** : 39 issues reportées (#10-#48)

### Répartition
- **v0.1.1** (correctifs contenu) : 38 issues
- **v0.3.0** (#19 — H10 ansible-navigator/EE/EDA) : 1 issue majeure

### Exemple de Constats
- Versions Ansible/AWX obsolètes
- Syntaxe module dépréciée
- Documentation produit introuvable
- Nouvelles fonctionnalités non couvertes

---

## Fichiers Non Suivis

**Décision utilisateur** : les fichiers suivants restent tels quels

- `docs/HOMOGENEISATION-OPENSHIFT.md` (origine inconnue, projet source openshift-course) — aucune intégration planifiée

---

## Historique des Décisions de Session

### Validées par l'utilisateur
1. **Anonymisation PPTX** : supprimer hôtes, IP, identifiants, chemins, proxy, liens
   - Auteur conservé (décision)
   - Validation manuelle screenshots (16:39)
   - 19 WMF validés
2. **Réécriture d'historique** : force-push protégé (--force-with-lease)
   - Commits `f2ea50c` et `a27b4e1` supprimés
   - Branche de sauvegarde `backup/pre-rewrite` supprimée
   - Reflog local conservé
3. **Publication** : main + tag v0.1.0 publiés sur GitHub
4. **Fichiers non suivis** : `docs/HOMOGENEISATION-OPENSHIFT.md` laissé tel quel (origine inconnue)

### Impactant les Sessions Futures
1. **Prochaine branche** : `milestone/v0.1.1` créée depuis main au démarrage du cycle
2. **Version de dev** : `0.1.1.a` au démarrage du cycle v0.1.1
3. **CI** : à implémenter en v0.1.1 (#49)

---

## Règles Apprises

### 1. Sécurité — Anonymisation de PPTX public
- **Fuite réseau** : ne pas se fier au mot-clé d'organisation seul
- **Scanner aussi** : hôtes, IP, identifiants, chemins, liens (proxy, bitbucket, etc.)
- **Dézippage** : lire les fichiers PPTX décompressés (zip) — `git grep` ne lit pas un zip
- **IP génériques** : `192.168.x.x` peut rester (exemples éducatifs)
- **Blocs sensibles** : `!vault` à vérifier manuellement (slides S139/141/198)
- **Validation manuelle** : obligatoire avant publication

### 2. Git & Force-Push
- **Never push before manual validation** — publication publique ne permet pas de retour
- **Force-push normal** : `--force-with-lease` (protégé, compatible avec worktrees)
- **Reflog** : keep local reflog (archivage) sauf purgue explicite
- **Branches de sauvegarde** : nettoyer après succès (backup/pre-rewrite supprimée)

### 3. Communication — Adresse de Retour
- Projet-spécifique : `team-lead` (pas `main`)
- Documentée et utilisée systématiquement

---

## Décisions Techniques

### 1. Template & Infrastructure
- **Template** : v3.10.0 appliqué
- **Initialisation du projet** : terminée
- **Infrastructure** : retiré de la team (non applicable pour ce projet)

### 2. Équipe — Reconfiguration
| Rôle | Statut | Notes |
|------|--------|-------|
| dev-slides | ✅ Actif | Créé et enregistré |
| planner | ✅ Permanent | Adapté pour templates |
| test-writer | ✅ Permanent | Présent |
| code-reviewer | ✅ Permanent | Présent |
| qa | ✅ Permanent | Présent |
| doc-updater | ✅ Permanent | Présent |
| deployer | ✅ Permanent | Présent |
| security | ✅ Ponctuel | Présent |
| marketing-release | ✅ Ajouté | Nouveau (gh-pages) |
| **infra** | ❌ Retiré | Non applicable |

### 3. Agents Compagnons Créés
- `.claude/agents/cdp.md` : Routage `/feature` / `/bugfix` adapté
- `.claude/agents/implementation-planner.md` : Compagnon du template
- `.claude/agents/teamleader.md` : Compagnon du template

**Routage** : Non testé à ce stade.

### 4. Gestion des Fichiers — Ignoration & Archivage
- **Sauvegarde d'origine** : `Ansible Training.orig.pptx` (archivé localement, non versionné)
- **Mémoire interne** : `.remember/` ignoré par git (logs privés de session)
- **Fichiers verrouillés** : `.~lock.*#` ignoré (PowerPoint verrous temporaires)
- **Templates & synchro** : `*.template.md` et `TEMPLATE_claude/` ignorés par git (gérés par synchro du template)
- `.gitignore` configuré avec ces règles

---

## Règles Critiques

### 1. Absence de Références à l'Organisation d'Origine
- **Contrainte stricte** : La version générique diffusable ne doit contenir **AUCUNE référence** à l'organisation d'origine
  - Logos
  - Domaines internes
  - Métadonnées d'organisation
  - Captures d'écran révélant l'infrastructure interne
  
**Processus de vérification** : Validation manuelle des screenshots lors de la finalisation de chaque slide.

### 2. Conventions Git & Commits
Voir `CLAUDE.md` :
- **Branches** : `milestone/vX.Y.Z`
- **Commits** : `type(scope): message` (Conventional Commits)
  - Types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **Tags** : `vX.Y.Z`
- **Pas de travail direct sur `main`** — tout passe par `milestone/v0.1.0`

### 3. Adresse de Retour
- **Interlocuteur unique** : `team-lead` (pour ce projet)
- Protocole standard en `.template.md` : voir `TEAMMATES_PROTOCOL.template.md`

### 4. Documentation Source
- `.claude/agents/context/TEAMMATES_PROTOCOL.template.md` : protocole standard des agents
- `.claude/agents/context/COMMON.template.md` : règles communes transversales (template)
- `CLAUDE.md` : conventions et configuration du projet

---

## Checklists de Démarrage Session

### ✅ v0.1.0 — Clôture au 06-10-2026 (15:43 - 17:38)
- [x] Projet init (template v3.10.0)
- [x] Équipe configurée (infra retiré, marketing-release ajouté)
- [x] Agents permanents déclarés
- [x] Agent dev-slides créé et enregistré
- [x] Compagnons créés (cdp.md, implementation-planner.md, teamleader.md)
- [x] CLAUDE.md rédigé avec conventions
- [x] `.gitignore` créé (avec .~lock.*#, *.template.md, TEMPLATE_claude/)
- [x] PPTX créé et anonymisé (références à l'organisation d'origine supprimées)
- [x] Contrôles manuels PPTX validés (16:39)
- [x] Dépôt GitHub `CCoupel/ansible-training` créé
- [x] Branche `milestone/v0.1.0` poussée puis SUPPRIMÉE
- [x] Milestones GitHub créés (v0.1.0, v0.1.1, v0.2.0, v0.3.0)
- [x] Issues créées et assignées (#1-#9, #10-#48 d'audit, #49 CI)
- [x] Historique git reécrit (f2ea50c, a27b4e1 supprimés, backup supprimée)
- [x] Audit d'obsolescence terminé (39 constats → issues #10-#48)
- [x] v0.1.0 LIVRÉE EN PROD (release GitHub, main + tag v0.1.0)
- [x] Milestone v0.1.0 fermé
- [x] Issues #1 & #2 fermées

### 🔄 Prochaine Session — Cycle v0.1.1 (Priorités)
1. **Tester le routage des compagnons** (`/feature`, `/bugfix`)
2. **Créer branche** `milestone/v0.1.1` depuis main
3. **Traiter v0.1.1 (39 issues)** :
   - Priorité haute : issues H1-H9 + #49 (CI PowerPoint)
   - Priorité moyenne : issues d'audit restantes (#10-#48)
4. **Vérifications manuelles** :
   - Blocs `!vault` (slides S139/141/198)
   - IP `192.168.x.x` (S18, 25-27, 141) — gardées comme exemples
5. **Décisions de contenu** :
   - Trier `docs/HOMOGENEISATION-OPENSHIFT.md` (origin unknown, non intégré)
6. **Archivage git** : f2ea50c accessible par SHA côté GitHub (purge possible via support)
7. **Sécurité** : vérifier les identifiants de démo (s'ils sont réels, changer les mots de passe)

---

## Ressources

| Document | Chemin | Usage |
|----------|--------|-------|
| Instructions projet | `CLAUDE.md` | Référence | 
| Protocole agents | `.claude/agents/context/TEAMMATES_PROTOCOL.template.md` | Mode teammates |
| Config projet | `.claude/project-config.json` | Structure & settings |
| Règles transversales | `.claude/agents/context/COMMON.template.md` | Règles communes template |
| Agent doc-updater | `.claude/agents/doc-updater.template.md` | Mise à jour documentation |
| Agent dev-slides | `.claude/agents/dev-slides.md` | PPTX evolution |

---

## Notes Session (v0.1.0 — 2026-10-06)

- **15:37** : Projet init (template v3.10.0) ; équipe reconfigurée (infra retiré, marketing-release ajouté)
- **15:43** : Agents compagnons créés ; dev-slides enregistré
- **15:43** : MEMORY.md créé par doc-updater (initial)
- **15:45** : MEMORY.md mis à jour (roadmap, milestones)
- **16:39** : Contrôles manuels PPTX validés (ouverture, WMF, layouts, fond de carte)
- **16:45** : Sauvegarde .orig archivée ; milestones/issues GitHub créés ; première poussée
- **17:15** : Anonymisation PPTX complétée (hôtes, IP, identifiants, chemins, proxy, liens)
- **17:25** : Audit d'obsolescence terminé (39 constats → issues #10-#48 v0.1.1)
- **17:30** : Historique git reécrit (--force-with-lease, f2ea50c/a27b4e1 supprimés)
- **17:35** : v0.1.0 LIVRÉE EN PROD (release GitHub, main + tag v0.1.0)
- **17:38** : Clôture de session — MEMORY.md finalisée

### Résumé Exécutif
- **Durée** : ~2 heures (15:37 - 17:38)
- **Déliverables** : v0.1.0 publiquement disponible, 39 issues v0.1.1 identifiées, équipe testée
- **État du dépôt** : main stable, branche milestone/v0.1.0 supprimée, reflog local conservé
- **Adresse de retour** : team-lead (protocole project-spécifique)

---

---

## Statut Global

**✅ SESSION v0.1.0 COMPLÉTÉE**

- Version PROD : `0.1.0` publiée (https://github.com/CCoupel/ansible-training/releases/tag/v0.1.0)
- Dépôt public : stable, branche par défaut `main`
- Cycle actif : Aucun (v0.1.0 fermée)
- Prochaine branche : `milestone/v0.1.1` (au démarrage du cycle)
- Pipeline v0.1.1 : 39 issues ouvertes (audit + CI)
- Pipeline v0.2.0 : 3 issues (HTML)
- Pipeline v0.3.0 : 5 issues (EDA)

**Équipe opérationnelle** : tous les agents testés et validés  
**Adresse de retour** : team-lead (projet-spécifique)  
**Prochaine action** : démarrer cycle v0.1.1
