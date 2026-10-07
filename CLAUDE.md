# CLAUDE.md — Ansible Training

> **Repo** : `/ansible-training`
> **Branche principale** : `main`
> **Versionnement** : `X.Y.Z.a` en dev / `X.Y.Z` en prod — voir `.claude/commands/context/COMMON.md` section 5

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
- **Conventions** : Conventional Commits (`docs(slides): ...`, `chore: ...`). Aucune stack applicative, pas de CI/CD ni d'environnements configurés.

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
| `Edit`, `Write`, `MultiEdit` (sauf `Write` d'un ordre dans `_work/tasks/*.md`) | `dev-*`, `doc-updater` |
| `Bash` (build / test / git) | `qa`, `deployer`, `dev-*` |
| `Read` (code applicatif) | `code-reviewer`, `planner` |
| `Glob`, `Grep` (recherche code) | `planner`, `dev-*` |

**`Read` autorisé uniquement pour** : `CLAUDE.md`, `MEMORY.md`, `project-config.json`, `_work/tasks/*.md`, `_work/handoff/*.md`, `_work/reports/*.md`, `contracts/CHANGELOG.md`

**`Write` autorisé uniquement pour** : `_work/tasks/*.md` (ordres aux teammates, création seule — jamais `Edit`/`MultiEdit`, jamais un autre chemin)

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
planner, dev-slides,
test-writer, code-reviewer, qa, doc-updater, deployer, security
```

### Questions à l'utilisateur

**Règle absolue** : toute information, décision ou validation attendue de l'utilisateur est posée
**via l'outil `AskUserQuestion`** — jamais en texte dans le chat (pas de liste numérotée, pas de « OUI/NON »,
pas de `[O/n]`, pas de « dis-moi »). Ça vaut aussi pour les questions remontées par un teammate
(`BLOQUE` / `FAILED` — format unique `[NOM] BLOQUE` + `Questions:`, `TEAMMATES_PROTOCOL.md`).

Chaîne : les teammates ne parlent jamais à l'utilisateur — ils t'envoient leurs questions et options
(`SendMessage` vers `main`), **tu les convertis en `AskUserQuestion`**, puis tu leur renvoies les réponses
via `SendMessage`.

- Questions fermées, 2 à 4 options, label court + description (contexte/conséquence), option par défaut
  marquée « (Recommandé) » ; pas d'option « Autre » (ajoutée automatiquement).
- Tout regrouper dans **un seul appel** `AskUserQuestion` (jusqu'à 4 questions).
- Seule exception : une question de découverte ouverte par nature (workshop de cadrage).

Détail et checklist avant chaque message à l'utilisateur : `.claude/agents/teamleader.md`, section « Questions à l'utilisateur ».

### Relayer l'avancement

Chaque jalon `[NOM] EN COURS — …` d'un teammate (ex. `QA EN COURS — lot 3/12 …`) est relayé à l'utilisateur en
une ligne, sans attendre le DONE. Un jalon n'est pas un DONE : ne pas enchaîner avant le DONE.

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
  du cycle (un seul milestone en développement à la fois)
- **Commits** : `type(scope): message` — types : `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- **Tags** : `vX.Y.Z` — la CI patche et publie la release automatiquement
- **Jamais de travail direct sur `main`** — la branche milestone n'y est mergée qu'au déploiement PROD

---

## Release et CI

### Workflow de Publication

Chaque version est publiée automatiquement via GitHub Actions (`.github/workflows/release.yml`) lors d'un tag `vX.Y.Z` posé sur `main` ou d'un lancement manuel (`workflow_dispatch`).

**Déclenchement** :

```bash
# 1. Merger milestone/vX.Y.Z sur main
git checkout main
git merge milestone/v0.1.1

# 2. Poser le tag sur main et pousser
git tag v0.1.1
git push origin main
git push origin v0.1.1

# Ou via dispatch (rattrapage, ex. v0.1.0)
gh workflow run release.yml -f tag=v0.1.0
```

**Règle critique** : le tag doit être posé sur `main` (ou en ancêtre de `main`). La CI vérifie avec `git merge-base --is-ancestor` que le commit du tag est dans l'historique de `origin/main` avant de publier. Sans cela, la release échoue avec un message explicite.

### Étapes du Workflow

1. **Validation du tag** : format `vX.Y.Z` requis
2. **Contrôles** :
   - Validité du PPTX : archive ZIP bien formée, `[Content_Types].xml` en première position
   - Anti-fuite : scan des métadonnées XML et images via `check_pptx.py`, utilise le secret `LEAK_PATTERNS` (regex des termes sensibles)
   - Version slide 2 : vérification que la slide 2 affiche la version correspondant au tag
3. **Publication** : création/mise à jour de la release GitHub avec l'asset `Ansible-Training-vX.Y.Z.pptx`
4. **Release notes** : extraction du CHANGELOG.md si présent, sinon génération automatique

### Secret `LEAK_PATTERNS` — Prérequis Utilisateur

**Avant chaque tag de release**, le secret GitHub `LEAK_PATTERNS` doit être configuré sur le dépôt :

```bash
# Créer un fichier local avec une regex par ligne
# (exemples : nom de l'organisation, acronymes, domaines sensibles)
cat > leak_patterns.txt <<EOF
motif1
motif2
...
EOF

# Ajouter au dépôt comme secret
gh secret set LEAK_PATTERNS < leak_patterns.txt
```

**Sans ce secret**, le workflow échoue volontairement au scan et refuse de publier — c'est une protection contre la publication accidentelle.

**Vérification** : `gh secret list` affiche `LEAK_PATTERNS` comme présent (jamais le contenu).

### Asset Versionné

Chaque release publie un PPTX nommé `Ansible-Training-vX.Y.Z.pptx`, où `X.Y.Z` correspond au tag.

### Contrôle de Version Slide 2

La slide 2 affiche obligatoirement :
- **Version** : vX.Y.Z (exemple : « v0.1.1 »)
- **Date de livraison** : JJ/MM/AAAA
- **Versions de référence** : « Référence : ansible-core 2.20 » (lues dans `reference_version` de `.claude/project-config.json`)

Le workflow valide que la version affichée sur la slide 2 correspond au tag avant publication.

### Extensibilité (v0.2.0)

À partir de v0.2.0, le workflow publie deux artefacts en parallèle (commit 43c826e) :

- **PPTX** : `Ansible Training.pptx` → `Ansible-Training-${TAG}.pptx` (inchangé depuis v0.1.1)
- **HTML** : `build/Ansible-Training-HTML.zip` (généré par `node tools/package.js`) → `Ansible-Training-HTML-${TAG}.zip`

**Configuration du workflow** (`.github/workflows/release.yml`, adapté pour v0.2.0) :

```bash
ARTIFACTS: |
  Ansible Training.pptx|Ansible-Training-${TAG}.pptx
  build/Ansible-Training-HTML.zip|Ansible-Training-HTML-${TAG}.zip
```

**Contrôles réels (CI)** : bloquants, exécutés avant publication :

1. **Préalables** (après checkout du tag) :
   - Tag sur `main` (garde-fou `merge-base --is-ancestor`)
   - Secret `LEAK_PATTERNS` configuré (publication refusée sans lui)

2. **Environnement & dépendances** :
   - Node 22 (SHA épinglé `49933ea…`)
   - Python 3.12 (SHA épinglé `a26af69…`)

3. **Tests bloquants** (échec = arrêt) :
   - `PARITY_STRICT=1 python3 -m unittest discover -s tests/site` (131 tests, `RELEASE_TAG=$TAG` active version check slide 2)
   - `LOTS_STRICT=1 python3 -m unittest discover -s tests/slides/obsolescence` (42 tests, validité du PPTX et versions)
   - `node tools/validate.js` (structure HTML/SVG/quiz)
   - `node tools/sync-meta.js --check --version "${TAG#v}"` (meta.js contient la bonne version, pas de réécriture)

4. **Artefacts** :
   - PPTX (`tests/slides/check_pptx.py`, anti-fuite avec `LEAK_PATTERNS`) + slide 2 affiche version du tag
   - **Zip HTML** (51 fichiers) :
     - Validité : `unzip -t` (archive OK)
     - Contenu : présence de `index.html`, `assets/meta.js`, `Ansible Training.pptx` à la racine
     - PPTX embarqué identique au PPTX du tag (`cmp`)
     - `assets/meta.js` contient `"version": "X.Y.Z"` du tag (grep)
     - Anti-fuite site : `tests/site/check_site.py --dir <extraction> --require-secret`
     - Anti-fuite PPTX embarqué : `tests/slides/check_pptx.py` sur le PPTX du zip

**Non exécuté en CI** :
- `check_links.py --offline` ou connecté (hors périmètre, manuel)
- Vérification de la date de livraison dans `meta.js` (date à confirmer par l'utilisateur, non contrôlée en CI)

**Génération et tests du zip (local)** :

```bash
# Générer le zip (déterministe, PPTX inclus, refuse un arbre modifié)
node tools/package.js

# Vérifier la validité (si unzip disponible)
unzip -t build/Ansible-Training-HTML.zip > /dev/null  # valide sans décompression
# ou (affiche le décompte en fin)
unzip -l build/Ansible-Training-HTML.zip | tail -1

# Afficher le SHA256
sha256sum build/Ansible-Training-HTML.zip

# Tests du site (avant packaging en CI)
PARITY_STRICT=1 python3 -m unittest discover -s tests/site

# Validation de structure HTML
node tools/validate.js

# Vérifier que meta.js est prêt pour le tag v0.2.0
node tools/sync-meta.js --check --version 0.2.0

# Audit des liens (manuel, hors CI)
python3 tools/check_links.py --offline  # mode local (liens sans requête HTTP)
# ou
python3 tools/check_links.py  # mode connecté (requête HTTP, peut être lent/instable)
```

**Avant tag** : le CI refusera la release si les tests locaux échouent. Vérifier localement avant de pousser le tag.

### Tests et Validation (v0.2.0)

Avant de tagguer une release v0.2.0 ou supérieure :

```bash
# Tests du PPTX (223 slides totales, y compris slides masquées ; obsolescence)
LOTS_STRICT=1 python3 -m unittest discover -s tests/slides/obsolescence

# Tests du site HTML (parité, accessibilité, structure)
PARITY_STRICT=1 python3 -m unittest discover -s tests/site

# Validation de structure HTML + SVG + quiz
node tools/validate.js

# Scan de validité et anti-fuite (PPTX)
python3 tests/slides/check_pptx.py "Ansible Training.pptx"

# Scan du site généré (avant packaging)
python3 tools/check_links.py --offline

# Packaging et vérification du zip
node tools/package.js
unzip -t build/Ansible-Training-HTML.zip > /dev/null

# Avec secret local (vérification complète avant push/tag)
export LEAK_PATTERNS="$(cat leak_patterns.txt)"
python3 tests/slides/check_pptx.py "Ansible Training.pptx"
python3 tools/check_links.py  # mode connecté (requête HTTP aux URLs externes)
```

**Prérequis avant tag v0.2.0 et supérieur** (le CI les vérifie) :

1. **Secret `LEAK_PATTERNS`** : configuré sur le dépôt (`gh secret list` doit l'afficher)
   - Sans lui, le workflow échoue volontairement
   - Jamais écrit dans les logs (sortie masquée)

2. **Date de livraison** (`assets/meta.js`) :
   - Actuellement vide (« date »: "") ou 07/10/2026 (provisoire)
   - À fixer avant tag via : `node tools/sync-meta.js --date JJ/MM/AAAA`, puis commiter
   - Exemples : `07/10/2026` (date du jour), `15/10/2026` (date cible de release)
   - Le workflow **ne contrôle pas** la date, seule la version est vérifiée

3. **Slide 2 du PPTX** :
   - Doit afficher version v0.2.0 (ou vX.Y.Z du tag) — commit `0d8552a` OK
   - Doit afficher la date de livraison — à aligner sur meta.js

4. **`milestone/v0.2.0` mergée sur `main`** avant le tag :
   - Le CI vérifie que le commit du tag est ancêtre de `origin/main`
   - Sans cela, workflow échoue avec message explicite

5. **Tests locaux réussis** :
   - Tous les tests ci-dessus doivent passer (QA responsable)
   - Node 22 ou Linux (wrapper `node.exe` Windows donne faux échecs)
   - Python 3.12+
