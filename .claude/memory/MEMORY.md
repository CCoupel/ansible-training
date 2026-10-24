# MEMORY.md — Ansible Training Project

**Dernière mise à jour** : 2026-10-08 (fin de session v1.0.0)  
**Projet** : Ansible Training  
**Team** : ansible-training-team (8 permanents, 2 ponctuels)

---

## Version Courante

| Paramètre | Valeur |
|-----------|--------|
| Version (PROD) | `1.0.0` (livrée 2026-10-08) |
| Release | https://github.com/CCoupel/ansible-training/releases/tag/v1.0.0 |
| Assets | 3 : PPTX `Ansible-Training-v1.0.0.pptx`, zip HTML 72 entrées, `.sha256` |
| Tag | `v1.0.0` (annoté) sur `1261a9b` ; run `release.yml` 37785123599 vert |
| Branche `main` | `3fb524a` = `origin/main` (ajoute le workflow Pages) |
| Branche milestone | `milestone/v1.0.0` (`1261a9b`) conservée et poussée |
| Site | https://ccoupel.github.io/ansible-training/ |
| Template | v3.26.2 (sync 2026-10-24) |

---

## Cycle v1.0.0 — Clôture (✅ LIVRÉE 2026-10-08)

### Livrables
- ✅ **Contenu** : 264 slides (masquées 234, 251, 258), 17 modules (m13 Execution Environments et m14 Event-Driven Ansible ajoutés ; anciens m13-m15 renommés m15-m17), agenda sur 4 jours (Day 3 = m11-m13, Day 4 = m14-m17).
- ✅ **EDA** : `examples/eda/` (14 fichiers) et `labs/eda/` (4 fichiers) embarqués dans le zip.
- ✅ **Site fr/en** : Bonus des 17 modules traduit (427 champs `_en`), 74 clés d'interface, sélecteur FR | EN, `?lang=`, repli sur le français.
- ✅ **Tests** : 284 tests site en strict complet (`PARITY_STRICT`, `LOTS_STRICT`, `I18N_STRICT`), 46 tests d'obsolescence PPTX.
- ✅ **Release** : `release.yml` vert, `sha256sum -c` OK, `cmp` du PPTX publié avec celui du tag, notes de release = section `[1.0.0]` du CHANGELOG.
- ✅ **Milestone** `v1.0.0` fermé ; issues #5, #6, #7, #8, #9, #19, #51 fermées ; `gh issue list --state open` vide.
- ✅ **GitHub Pages** en mode Actions (voir ci-dessous).

### Site GitHub Pages
- Mode **`workflow`** (`build_type` = workflow), déployé par `pages.yml`. Premier déploiement lancé à la main sur `main` (run 37790533271, succès) ; ensuite appelé par `release.yml` à chaque tag `v*`.
- Environnement `github-pages` : déploiements autorisés depuis `main` (branche) et `v*` (tag).
- **Ne jamais rétablir le mode « branche »** : Jekyll/Liquid casse le site (le `.md`/`.yml` de la racine est interprété).
- Branche `gh-pages` **réservée à l'agent `marketing-release`** : à éviter pour le site.
- Question ouverte : où placer le site marketing (sous-dossier du site Actions recommandé).
- Le job `pages` de `release.yml` n'a pas encore tourné en réel : premier run à la prochaine release.

### Décisions de l'utilisateur (une ligne chacune)
- **Slides en anglais** (m13, m14) : cohérent avec le corps du support, qui est en anglais.
- **Insertion après m12**, renumérotation par `tools/renumber.py` (+10 puis +31) : ordre pédagogique, sans renuméroter à la main.
- **Ids = ordre d'affichage** (m15-m17 renommés une fois) : évite des ids décalés des numéros affichés.
- **Clé `localStorage` `ansible-training-v2`** : progression remise à zéro, car les anciennes entrées `m13-*` ne correspondent plus aux mêmes slides. BREAKING, annoncé au CHANGELOG avec les ancres `#m13-…` à `#m15-…`.
- **Agenda à 4 jours (coupe C)** : Day 4 = m14 à m17, pour ne pas surcharger le Day 3.
- **Webhook local pour le lab EDA**, exemples et lab dans le zip, contrôle en stdlib plus procédure manuelle « lab testé ».
- **Site fr/en seulement** : langue du navigateur par défaut ; slides et notes restent en anglais ; relecture de l'anglais par les agents seulement (risque de tournures non idiomatiques).
- **Pages par GitHub Actions**, comme `openshift-course`.
- **Issue #5 fermée** (désancrage des compteurs codés en dur).

### Commits à connaître
- `1261a9b` : tag `v1.0.0` (contenu de la release) ; `main` = `1261a9b` au moment du tag.
- `97af89a`, `3fb524a` : workflow Pages (`pages.yml`, job `pages` dans `release.yml`), poussés sur `main`.
- `197f6e8` : correction du quiz m08 (`tagged` remplacé par `web`) ; le QA a été relancé après ce commit.
- `1970145`, `babc90a` : `meta.js` et slide 2 en 1.0.0 (08/10/2026).

---

## Restes (détail : `docs/plans/v1.0.0/release-checklist.md`)

- **README** : encore « 1.0.0 en préparation » ; passer en « publiée » avec le lien du site. Passer par une branche de travail, pas directement sur `main`.
- **Revues humaines** : PowerPoint (slides 2, 3, 183-223), navigateur du site bilingue, relecture de l'anglais (facultative).
- **Lab EDA** : procédure « lab testé » (`tests/procedures/labs/eda/lab-teste.md`, Java 17+ requis).
- **Exemple d'EE** de la slide 192 : jamais construit (Podman à prévoir).
- **Actions Node** : à mettre à jour avant le **2026-10-19** (`ubuntu-latest` → Ubuntu 26, à confirmer).
- **Rulesets** : aucun ruleset (`gh api …/rulesets` = 0). À créer pour `main` et les tags `v*`. Décision utilisateur (admin du dépôt).
- **Commentaire `tagged`** : `tests/site/i18n/i18n_rules.py` cite encore `tagged` ; le distracteur de m08 est déjà remplacé par `web`.
- **`docs/HOMOGENEISATION-OPENSHIFT.md`** : toujours non suivi. À décider, ne pas le committer par erreur.
- **Commit mémoire** : celui-ci reste local jusqu'au prochain déploiement, sans push.

---

## Roadmap

**✅ v0.1.0 (2026-10-06)** → **✅ v0.1.1 (2026-10-07)** → **✅ v0.2.0 (2026-10-08)** → **✅ v1.0.0 (2026-10-08)**

Prochain milestone à définir. Idées (non priorisées) : mise à jour des actions Node, site marketing (`marketing-release`), correctifs issus des revues humaines, évolutions EDA/AAP, traductions supplémentaires.

---

## Règles Apprises

### 1. Git & Commit Protocol
- **Git (code retour, commit --only, pré-vol avant push/tag, commits mémoire locaux)** : voir `CLAUDE.md` « Conventions Git ».
- **Commits d'agent** : `git commit --only <fichiers>` pour éviter les collisions (`.git/index.lock` : réessayer). Jamais de `git stash` partagé.
- **Dépôt public** : pré-vol en lecture seule (`git ls-remote`, `gh`) et accord explicite avant tout push, tag ou changement de réglage du dépôt.
- **Commits mémoire** : locaux, non poussés, jusqu'au prochain déploiement.
- **Branches** : `milestone/vX.Y.Z` conservée après release.
- **Adresse de retour des agents** : `team-lead` (jamais `main`, l'outil refuse).

### 2. Agents & DONE
- **DONE** : chemin de rapport **exact** (nom de fichier réel, jamais de placeholder `<timestamp>`) et SHA **exacts**. Plusieurs DONE invalides ont dû être renvoyés pendant ce cycle.
- **Rapports** : `_work/reports/<agent>-<timestamp>.md`, jamais inline.
- **Ordres > 3 lignes** : `_work/tasks/`, jamais inline.
- **Labels de phase** des issues : à appliquer à chaque transition. Non fait pendant le cycle, rattrapé à la fin (`DONE` posé par deployer).
- **QA** : dans un `git worktree` détaché quand le HEAD avance. Tout changement de module, PPTX ou `meta.js` après un contrôle invalide le rapport QA.

### 3. Release & Workflow
- **Tag sur `main`** : la CI vérifie que le commit est ancêtre de `origin/main`. Pousser `main` avant le tag.
- **`release.yml`** : tests bloquants (`PARITY_STRICT`, `LOTS_STRICT`, `I18N_STRICT`), version et date de la slide 2 = `meta.js`. Un tag échoue tant qu'un module n'est pas traduit.
- **Notes de release** : extraites de la section `## [X.Y.Z] - JJ/MM/AAAA` du CHANGELOG. Laisser une section `[Unreleased]` vide au-dessus.
- **Pages** : jamais en mode branche (Jekyll/Liquid). Mode `workflow` seulement.
- **Assets** : 3 (PPTX + zip + `.sha256`), vérifier avec `sha256sum -c` après téléchargement dans un répertoire neuf.

### 4. Outils, PPTX et Tests
- **Node 22 Linux requis** pour les tests : `export PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH`. nvm est installé hors dépôt ; ne pas modifier `~/.bashrc`. Le `node.exe` Windows donne de faux échecs.
- **`renumber.py`** réécrit les références structurées (`src`, `ref`, `range`, listes de tests), pas la prose : les numéros de slides cités dans les quiz sont suivis par `test_slide_citations`.
- **`package.js`** refuse un arbre modifié : committer avant de générer le zip.
- **`check_pptx.py` / `check_site.py`** : refusent certains domaines (ex. `ghcr.io`) et les clés `lang.fr` (lues comme domaine `.fr`).
- **Quiz** : ne jamais donner une valeur spéciale de `--tags` (`tagged`) comme tag à retenir ; vérifier chaque distracteur contre le PPTX.

### 5. Documentation et Maquettes
- **Source de vérité des chiffres** : `tests/slides/expected.json` (slides, masquées), `assets/plan.js` (plages et jours). Aucun compteur codé en dur dans `tools/` ni `tests/`.
- **Maquettes** : `docs/mockup/INDEX.md` et `docs/mockup/DECISIONS.md` ; une maquette remplacée passe en « Obsolètes ».

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
| CHANGELOG.md | Historique (v1.0.0 livrée, notes de release) |
| README.md | Guide HTML, langues, tests, prérequis release |
| CONVENTIONS.md | Règles PPTX → HTML, process « Livraison PPTX + HTML » |
| docs/plans/v1.0.0/ | Plan EDA, checklist de release |
| docs/i18n/glossary.md | Glossaire fr/en du Bonus |
| .claude/memory/ | Sessions précédentes (`.remember/`) |
