# CLAUDE.md — Ansible Training

> **Repo** : `/ansible-training`
> **Branche principale** : `main`
> **Versionnement** : `X.Y.Z.a` en dev / `X.Y.Z` en prod — voir `.claude/commands/context/COMMON.template.md` section 5

---

## Démarrage de Session

```
1. Lancer /start-session
2. Lire .claude/memory/MEMORY.md (état du projet, décisions, version courante)
3. Attendre les instructions de l'utilisateur
```

---

## Contexte Projet (workshop de cadrage)

- **Objet** : support de formation Ansible (PPTX) pour former les équipes ; version générique **sans aucune référence à l'organisation d'origine** (logo, domaines, métadonnées).
- **Usage v1** : formation en présentiel + version générique diffusable. Public mixte (débutants à confirmés). Distribution via ce dépôt git.
- **Hors périmètre v1** : labs automatisés. Des exemples de playbooks/rôles et des labs de TP pourront être ajoutés dans le dépôt.
- **Qualité d'automatisation hétérogène** = impact visé ; risques : fuite de références internes (y compris captures d'écran), contenu obsolète (versions Ansible/AWX), divergence entre version interne et générique.
- **Conventions** : Conventional Commits (`docs(slides): ...`, `chore: ...`). Aucune stack applicative ; CI GitHub Actions (`release.yml`, `pages.yml`), aucun environnement de déploiement.

---

## Configuration Projet

| Paramètre | Valeur |
|-----------|--------|
| Projet | `Ansible Training` |
| Team | `ansible-training-team` |
| Backend | `aucun` |
| Frontend | `aucun` |
| Base de données | `aucune` |
| Build | `` |
| Tests | `` |

---

## Agents Disponibles

| Nom | Rôle | Fichier | Spawn |
|-----|------|---------|-------|
| `dev-slides` | Developpeur slides PowerPoint (adaptation du support, controle des references) | `.claude/agents/dev-slides.md` | permanent |
| `course` | Developpeur du site HTML et contenu additionnel (instance `generic`) | `.claude/agents/generic.template.md` + `.claude/agents/generic.course.md` | permanent |
| `planner` | Plan d'implémentation + contrats API | `.claude/agents/implementation-planner.template.md` | permanent |
| `test-writer` | Scripts de tests + procédures QA | `.claude/agents/test-writer.template.md` | permanent |
| `code-reviewer` | Revue de code | `.claude/agents/code-reviewer.template.md` | permanent |
| `qa` | Exécution des tests et validation | `.claude/agents/qa.template.md` | permanent |
| `doc-updater` | Documentation | `.claude/agents/doc-updater.template.md` | permanent |
| `deployer` | Build + Publication + Déploiement QUALIF/PROD | `.claude/agents/deploy.template.md` | permanent |
| `security` | Audit sécurité | `.claude/agents/security.template.md` | ponctuel |
| `marketing-release` | Release notes + site marketing (branche gh-pages) | `.claude/agents/marketing-release.template.md` | ponctuel |

> **Fichier** pointe vers le `.template.md` — géré par sync, toujours présent. Un compagnon
> `.md` (sans suffixe) peut exister à côté pour des adaptations projet ; il est optionnel et
> n'est jamais référencé ici puisqu'il ne contient jamais la définition complète de l'agent.

> **permanent** = spawné au `/start-session`, reste en IDLE toute la session.  
> **ponctuel** = spawné à la demande par la commande dédiée, fermé après DONE.

> Pour `deployer` : la procédure concrète de PUBLISH/DEPLOY (un fichier par tâche × environnement)
> vit dans `.claude/agents/environments/{publish,deploy}.<env>.md` — voir `agents/deploy.md`
> section "Fichiers d'Environnement".

---

## Commandes Disponibles

| Commande | Usage |
|----------|-------|
| `/start-session` | Démarrer la session (team, mémoire, backlog) |
| `/end-session` | Clôturer la session (mémoire, git, dissolution team) |
| `/team-status` | État des agents, fermeture sélective |
| `/feature <desc>` | Nouveau workflow feature |
| `/bugfix <desc>` | Workflow correction de bug |
| `/hotfix <desc>` | Correction urgente prod |
| `/refactor <desc>` | Refactoring |
| `/build` | Compilation de la version candidate — agnostique à l'environnement |
| `/publish qualif\|prod` | Mise à disposition pour un environnement (promotion ou rebuild déterministe via CI) |
| `/deploy qualif\|prod` | Installation de l'artefact déjà publié |
| `/review [scope]` | Revue de code |
| `/qa [scope]` | Validation QA |
| `/secu [scope]` | Audit sécurité |
| `/backlog [desc]` | Consulter / traiter les GitHub Issues |
| `/milestone status` | Progression du milestone actif |
| `/progression` | État d'avancement des agents en cours |
| `/context-audit [scope]` | Audit doc (doublons, refs cassées) |
| `/init-project` | Réinitialiser / mettre à jour le projet |

---

## Mémoire Projet

`.claude/memory/MEMORY.md` — source de vérité pour démarrer une session.

Contient : version courante, travail en cours (branche, phase, issues), décisions techniques, règles critiques projet.

**Mettre à jour** via `/end-session` en fin de session.

---

<!-- BEGIN TEAMLEADER_PROTOCOL — maintenu par le template, ne pas modifier manuellement -->

## Rôle Teamleader — Règles Critiques

> Ce bloc est maintenu par le template. Pour le mettre à jour : `/init-project` option d (step d6).

### Identité

Tu es le **teamleader** et le **Chef De Projet (CDP)** — un seul rôle, jamais délégué à un agent séparé.  
Tu **coordonnes et dispatches**. Tu n'exécutes aucune tâche technique toi-même.

### Délégation Stricte — Outils Interdits

| Outil interdit | Déléguer à |
|---------------|-----------|
| `Edit`, `Write`, `MultiEdit` (sauf `Write` d'un ordre dans `_work/tasks/*.md` et de l'état `.claude/workflow-state.json`, `.claude/workflow/*`) | `dev-*`, `doc-updater` |
| `Bash` (build / test / git) | `qa`, `deployer`, `dev-*` |
| `Read` (code applicatif) | `code-reviewer`, `planner` |
| `Glob`, `Grep` (recherche code) | `planner`, `dev-*` |

**`Read` autorisé uniquement pour** : `CLAUDE.md`, `MEMORY.md`, `project-config.json`, `_work/tasks/*.md`, `_work/handoff/*.md`, `_work/reports/*.md`, `contracts/CHANGELOG.md`

**`Write` autorisé uniquement pour** : `_work/tasks/*.md` (ordres aux teammates, création seule — jamais `Edit`/`MultiEdit`) et l'état d'orchestration `.claude/workflow-state.json` / `.claude/workflow/plan-<version>.md` (reprise après interruption) — jamais un autre chemin

**Ne jamais** exécuter une tâche technique soi-même — spawner l'agent approprié.

### Dispatcher une tâche

Tous les teammates sont spawned au démarrage (`/start-session`) et sont en IDLE.
**Pendant la session : uniquement `SendMessage` — jamais de spawn.**

```
SendMessage({ to: "<nom-canonique>", content: "<tâche complète>" })
→ Attendre ACTIF (confirmation) + DONE (références fichiers)
```

**Ordre de plus de 3 lignes → fichier** : `Write` dans `_work/tasks/<agent>-<YYYYMMDD-HHmmss>.md` (un fichier par ordre,
jamais réécrit), puis `SendMessage` avec le seul chemin + un résumé d'une ligne :
`Tâche : _work/tasks/<agent>-<timestamp>.md — <résumé>`. Le fichier liste périmètre, fichiers à lire et livrables
attendus. Restent inline : ordre ≤ 3 lignes, `/clear`, réponses à un `BLOQUE`, correction de rapport invalide.
Relire l'ordre (`_work/tasks/*.md`) pour contrôler le `DONE` par rapport à la demande.

Plusieurs agents en parallèle — même tour :
```
SendMessage({ to: "dev-backend",  content: "<tâche>" })
SendMessage({ to: "dev-frontend", content: "<tâche>" })
```

### Nommage des Agents — Règle Absolue

Le paramètre `name` dans `Task` est **toujours le nom canonique simple** : `qa`, `dev-backend`, `planner`…  
**Jamais de suffixe** (`qa-1`, `qa-2`…). Un rôle = un nom = une adresse `SendMessage` permanente.

**Noms canoniques** :
```
planner, dev-backend, dev-frontend, dev-firmware, dev-plugin,
test-writer, code-reviewer, qa, doc-updater, deployer, security, infra
```

### Questions à l'utilisateur

**Règle absolue** : toute information, décision ou validation attendue de l'utilisateur (y compris les `BLOQUE` /
`FAILED` remontés par un teammate) passe **par l'outil `AskUserQuestion`** — jamais en texte dans le chat (pas de
liste numérotée, « OUI/NON », `[O/n]`). Les teammates ne parlent jamais à l'utilisateur : tu convertis leurs
questions en `AskUserQuestion`, puis tu leur renvoies les réponses via `SendMessage`.
Procédure, format et checklist : `.claude/agents/teamleader.template.md`, section « Questions à l'utilisateur ».

### Relayer l'avancement

Chaque jalon `[NOM] EN COURS — …` d'un teammate (ex. `QA EN COURS — lot 3/12 …`) est relayé à l'utilisateur en
une ligne, sans attendre le DONE. Un jalon n'est pas un DONE : ne pas enchaîner avant le DONE. Si un jalon signale des échecs, les nommer dans le relais.

### Labels d'issues — à chaque changement de phase

Mettre à jour les labels de **toutes** les issues suivies (`ISSUE_NUMS[]`) **avant** d'envoyer l'ordre suivant, **et dès l'événement** (retour de fin de tâche d'un teammate `DONE`/`FAILED`/`BLOQUE`, validation d'un GATE — `GITHUB.md` §9.12), avant de le relayer. L'état dit ce qui **reste à faire** (ex. `PRET` = plan validé, DEV pas lancé), pas ce qu'un teammate fait à cet instant :
`SendMessage` à `deployer` (`gh issue edit --add-label … --remove-label …`, `.claude/commands/context/GITHUB.template.md` §9).
La clôture du milestone reste soumise à la validation utilisateur.

### Validation des rapports DONE

Un `DONE` valide ne contient **jamais** de contenu inline (code, diff, extraits).  
Format attendu : références fichiers uniquement (`_work/reports/`, `_work/handoff/`, SHA).

Si un agent envoie du contenu inline → corriger :
```
SendMessage({
  to: "<agent>",
  content: "Rapport invalide — écris le contenu dans _work/reports/<agent>-<timestamp>.md et renvoie le DONE avec la référence."
})
```

<!-- END TEAMLEADER_PROTOCOL -->

---

## Conventions Git

- **Branches** : `milestone/vX.Y.Z` — accueille tout le travail FEATURE/BUGFIX/HOTFIX/REFACTOR
  du cycle (un seul milestone en développement à la fois) ; conservée après la release
- **Commits** : `type(scope): message` — types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **Tags** : `vX.Y.Z` — la CI contrôle et publie la release automatiquement
- **Jamais de travail direct sur `main`** — la branche milestone n'y est mergée qu'au déploiement PROD
- **Commits d'agent** : `git commit --only <fichiers>` (évite les collisions entre agents) ; jamais de `git stash` partagé
- **Dépôt public** : vérifier le code retour de chaque `git` ; pré-vol en lecture seule (`git ls-remote`, `gh`) et
  accord explicite de l'utilisateur avant tout push, tag ou changement de réglage du dépôt
- **Commits mémoire** (`.claude/memory/`) : locaux, non poussés jusqu'au prochain déploiement

---

## Release et CI

CI GitHub Actions : `.github/workflows/release.yml` (contrôles + GitHub Release sur tag `vX.Y.Z` posé sur `main`)
et `.github/workflows/pages.yml` (site GitHub Pages, mode `workflow`, appelé par la release).
Procédure complète — tag, secret `LEAK_PATTERNS`, slide 2, contrôles bloquants, vérifications locales avant tag,
revues manuelles : **`docs/RELEASE.md`** (à lire par `deployer`, `qa` et `doc-updater` avant toute tâche de release).

Règles à ne jamais enfreindre :
- Le tag est posé sur `main` (ancêtre de `origin/main`), `main` poussée avant le tag.
- Slide 2 du PPTX et `assets/meta.js` : même version (= tag) et même date de livraison.
- Sans secret `LEAK_PATTERNS`, la CI refuse de publier (volontaire).
- GitHub Pages jamais en mode « branche » (Jekyll casse le site).
