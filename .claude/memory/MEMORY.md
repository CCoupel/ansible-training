# MEMORY.md — Ansible Training Project

**Dernière mise à jour** : 2026-10-06 17:35  
**Projet** : Ansible Training  
**Team** : ansible-training-team

---

## Version Courante

| Paramètre | Valeur |
|-----------|--------|
| Version | `0.1.0` |
| Environnement | PROD |
| Branche | `main` (merge après release) |
| Deployments | PROD = publication du dépôt public (main + tag v0.1.0) |
| CI/CD | Aucune CI configurée |

---

## Travail en Cours

### PPTX — Ansible Training (version générique)

**Statut** : En développement  
**Responsable** : dev-slides  

**Tâches** :
- ✅ Création de 'Ansible Training.pptx' (version générique) initiée
- ✅ **Références à l'organisation d'origine supprimées** :
  - Fonds de slide
  - Pieds de page
  - Domaines (références internes)
  - Namespaces
  - Métadonnées (properties, auteur, etc.)
  - Miniature supprimée
  - custom.xml (classification) retiré
  - Zone de classification du master supprimée
  - Vestiges d'images retirés
- ✅ **Contrôles manuels PPTX** : VALIDÉS par l'utilisateur (16:39)
  - Ouverture PowerPoint (vérification fonctionnelle) ✅
  - 19 WMF (slides 5, 6, 8, 9) ✅
  - Rendu layouts 3/7/8 ✅
  - Fond de carte ✅

**Contrainte critique** : Aucune référence à l'organisation d'origine dans la version générique diffusable.

---

## Roadmap / Milestones

### v0.1.0 (✅ TERMINÉ — LIVRÉ EN PROD)
**Support générique Ansible — PPTX anonymisé**
- Support de formation en PowerPoint
- Version générique diffusable (aucune référence à l'organisation d'origine)
- **Anonymisation effectuée** : hôtes, IP, identifiants de démo, chemins, proxy, liens remplacés
  - Slides anonymisées : 40, 54, 75-76, 97-98, 110, 174, 187
  - Auteur conservé (décision utilisateur)
  - 19 WMF validés par l'utilisateur
- **Dépôt GitHub public** : `CCoupel/ansible-training`
  - Branche `main` + tag `v0.1.0` (déploiement PROD)
  - Historique reécrit (--force-with-lease) — décision utilisateur
- **Sauvegarde** : `Ansible Training.orig.pptx` (non versionné — ignoré par git)

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
| #3 | v0.1.0 | ✅ FERMÉ | #1, #2 | Support PPTX générique (LIVRÉ) |
| #4 | v0.1.1 | À VENIR | #10-#48 (38 issues) | Correctifs de contenu |
| #1 | v0.2.0 | À VENIR | #3-#5 | Format multi-canal (PPTX + HTML) |
| #2 | v0.3.0 | À VENIR | #6-#9, #19 | Module Event-Driven Ansible |

### Issues Traquées

**v0.1.0 (FERMÉÉ)** :
- #1 — ✅ Contrôle manuel final du PPTX (FERMÉE)
- #2 — ✅ Audit d'obsolescence Ansible/AWX (FERMÉE — 39 constats reportés)

**v0.1.1 (CORRECTIFS CONTENU)** :
- #10-#48 — 38 issues de contenu obsolète / à améliorer (voir audit d'obsolescence)

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

### ✅ v0.1.0 — Fait au 06-10-2026 (15:43 - 17:35)
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
- [x] Branche `milestone/v0.1.0` poussée
- [x] Milestones GitHub créés (v0.1.0, v0.1.1, v0.2.0, v0.3.0)
- [x] Issues créées et assignées (#1-#9, #10-#48 d'audit)
- [x] Historique git reécrit (f2ea50c, a27b4e1 supprimés)
- [x] Audit d'obsolescence terminé (39 constats → issues #10-#48)
- [x] v0.1.0 LIVRÉE EN PROD (main + tag v0.1.0)
- [x] Milestones v0.1.0 & v0.1.1 fermés
- [x] Issues #1 & #2 fermées

### 🔄 À Faire (Next Sessions)
- [ ] Tester le routage des compagnons (`/feature`, `/bugfix`)
- [ ] Traiter v0.1.1 : 38 issues de contenu (correctifs)
- [ ] Lancer v0.2.0 : architecture HTML + version multi-canal
- [ ] Lancer v0.3.0 : module Event-Driven Ansible

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

## Notes Session (v0.1.0)

- **15:37** : Projet init (template v3.10.0) ; équipe reconfigurée (infra retiré, marketing-release ajouté)
- **15:43** : Agents compagnons créés ; dev-slides enregistré
- **15:43** : MEMORY.md créé par doc-updater (initial)
- **15:45** : MEMORY.md mis à jour (roadmap, milestones)
- **16:39** : Contrôles manuels PPTX validés (ouverture, WMF, layouts, fond de carte)
- **16:45** : Sauvegarde .orig archivée ; milestones/issues GitHub créés ; première poussée
- **17:15** : Anonymisation PPTX complétée (hôtes, IP, identifiants, chemins, proxy, liens)
- **17:25** : Audit d'obsolescence terminé (39 constats → issues #10-#48 v0.1.1)
- **17:30** : Historique git reécrit (--force-with-lease, f2ea50c/a27b4e1 supprimés)
- **17:35** : v0.1.0 LIVRÉE EN PROD (main + tag v0.1.0) ; MEMORY.md finalisée
- **Adresse de retour** : team-lead (protocole project-spécifique)

---

**Statut global** : ✅ v0.1.0 LIVRÉE EN PROD — Dépôt public, 38 correctifs de contenu identifiés (v0.1.1), v0.2.0 (HTML) et v0.3.0 (EDA) à venir
