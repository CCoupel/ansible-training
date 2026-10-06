# MEMORY.md — Ansible Training Project

**Dernière mise à jour** : 2026-10-06 15:45  
**Projet** : Ansible Training  
**Team** : ansible-training-team

---

## Version Courante

| Paramètre | Valeur |
|-----------|--------|
| Version | `0.1.0.a` |
| Environnement | dev |
| Branche | `milestone/v0.1.0` |
| Deployments | Aucun (dev uniquement) |

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
- 🔄 **Vérification manuelle des captures d'écran & contrôles restants** : EN ATTENTE
  - Ouverture PowerPoint (vérification fonctionnelle)
  - 19 WMF à contrôler (slides 5, 6, 8, 9)
  - Rendu layouts 3/7/8 à valider
  - Fond de carte à vérifier

**Contrainte critique** : Aucune référence à l'organisation d'origine dans la version générique diffusable.

---

## Roadmap / Milestones

### v0.1.0 (EN COURS)
**Support générique Ansible — PPTX sans références internes**
- Support de formation en PowerPoint
- Version générique diffusable (aucune référence à l'organisation d'origine)
- Dépôt GitHub public créé : `CCoupel/ansible-training` (actuellement vide, aucun push)
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
- `.gitignore` configuré pour exclure ces fichiers

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

### ✅ Fait au 06-10-2026 15:43
- [x] Projet init (template v3.10.0)
- [x] Équipe configurée
- [x] Agents permanents déclarés
- [x] Agent dev-slides créé et enregistré
- [x] Compagnons créés (cdp.md, implementation-planner.md, teamleader.md)
- [x] CLAUDE.md rédigé avec conventions
- [x] `.gitignore` créé

### 🔄 À Faire (Next Session)
- [ ] Tester le routage des compagnons (`/feature`, `/bugfix`)
- [ ] Finaliser & vérifier PPTX (suppression des références + screenshots)
- [ ] Première phase de contenu (slides structure)
- [ ] Première release v0.1.0

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

## Notes Session

- **15:37** : Projet init avec template v3.10.0 ; équipe reconfigurée
- **15:43** : Agents compagnons créés ; dev-slides enregistré ; routage en attente de test
- **15:43** : MEMORY.md créé par doc-updater (initial)

---

**Statut global** : ✅ PRÊT — Équipe et structure opérationnelles, travail contenu en cours (PPTX)
