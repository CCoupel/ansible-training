# Adaptations projet — CDP

> Compagnon de `cdp.template.md` (lu **apres** lui, voir `context/COMMON.md` « Adaptations Projet »).
> Ne contient que le delta propre au projet Ansible Training ; ne rien recopier du template.

## Agent DEV du projet : `dev-slides`

Ce projet n'a **aucune stack applicative** : `dev-backend`, `dev-frontend`, `dev-firmware` et `dev-plugin` n'existent pas et ne sont jamais dispatches. Partout ou `cdp.template.md` ecrit `dev-backend`, `dev-frontend` ou `[dev-backend|dev-frontend selon scope]`, lire **`dev-slides`**.

| Nom SendMessage | Subagent type | Role |
|----------------|--------------|------|
| `dev-slides` | `dev-slides` | Adaptation du support PowerPoint (slides, layouts, master, metadonnees, images) + controle des references a l'organisation |

- **Section « Agents Disponibles »** : ajouter la ligne ci-dessus ; `infra`, `dev-backend`, `dev-frontend`, `dev-firmware` ne s'appliquent pas.
- **Dispatch DEV** : le planner place `dev-slides` dans l'Arbre d'Execution DEV ; le CDP l'execute tel quel (batch unique, pas d'ordre backend/frontend). Le message type agent DEV du template s'applique, avec ces differences : pas de « Contrats API » (remplacer par la reference au handoff planner / plan de contenu), et la ligne « Tests » devient « controles du dev-slides (validite de l'archive + references a l'organisation) ».
- **Retour DEV** : `DEV-SLIDES DONE` / `DEV-SLIDES BLOQUE` / jalons `DEV-SLIDES EN COURS` (format `context/TEAMMATES_PROTOCOL.md` section 3 et 4b). Equivalent du `DONE/FAILED` attendu par le template pour tout agent DEV : meme traitement (Phase REVIEW apres DONE, retour DEV apres REFUSE).
- **Corrections apres REVIEW/QA** : `SendMessage({ to: "dev-slides", content: "Corriger : [points du rapport]" })`.
- **CLEAR** : `dev-slides` est dans la categorie **contexte preserve** (jamais de CLEAR mid-feature), comme les autres `dev-*`.
- **Fichier de version** : jamais modifie par `dev-slides` (regle `context/DEV_COMMON.md`).

## Agent DEV du projet : `course`

| Nom SendMessage | Subagent type | Role |
|----------------|--------------|------|
| `course` | `generic` | Developpement du site HTML v0.2.0 (conversion PPTX→modules, contenu additionnel, outils, workflows) — instance de `generic.template.md` specialisee par `.claude/agents/generic.course.md` |

- **Retour DEV** : `COURSE DONE` / `COURSE BLOQUE` / jalons `COURSE EN COURS` (format `context/TEAMMATES_PROTOCOL.md` section 3 et 4b). Equivalent du `DONE/FAILED` attendu par le template pour tout agent DEV : meme traitement (Phase REVIEW apres DONE, retour DEV apres REFUSE).
- **Corrections apres REVIEW/QA** : `SendMessage({ to: "course", content: "Corriger : [points du rapport]" })`.
- **CLEAR** : `course` est dans la categorie **contexte preserve** (jamais de CLEAR mid-feature), comme les autres `dev-*`.
- **Fichier de version** : jamais modifie par `course` (regle `.claude/agents/generic.course.md`).

## Agents non utilises ici

- `infra` : pas d'environnements ni de CI/CD configures — ne pas dispatcher (ignorer le Mode Validation avant PUBLISH tant que `infrastructure.environments` est vide).
- `dev-*` de stack : voir ci-dessus.
