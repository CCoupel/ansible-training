# Adaptations projet — Planner

> Compagnon de `implementation-planner.template.md` (lu **apres** lui). Delta propre au projet uniquement.

## Agent DEV a utiliser

Projet **sans stack applicative** : dans l'« Arbre d'Execution DEV », l'unique agent DEV est **`dev-slides`**
(adaptation des supports `.pptx`). Ne jamais planifier `dev-backend`, `dev-frontend`, `dev-firmware`, `dev-plugin` ni `infra`.

- Le tableau des taches DEV du plan reference `dev-slides` avec les slides/fichiers cibles (ex. `Ansible Training.pptx`, slides N a M).
- Pas de contrats API : remplacer la section par un **plan de contenu** (slides concernees, texte avant/apres, elements a verifier — images, metadonnees).
- Preciser la **version cible** du support (interne ou generique sans references a l'organisation) : elle determine si le controle des references de `dev-slides` est obligatoire.
- Batch : `dev-slides` + `test-writer` dans le meme batch (pas de dependance backend/frontend).
