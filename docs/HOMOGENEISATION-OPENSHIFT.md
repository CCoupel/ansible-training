# Document d'Homogénéisation — Support de Formation Web (Ansible/OpenShift)

**Date** : 2026-10-06  
**Projet source** : `openshift-course`  
**Destination** : Tout projet de formation web de type identique (ex. formation Ansible)  
**Niveau** : Autonome — directement exploitable sans dépendre du projet source

---

# PARTIE A : Comportement du Teamleader (CDP)

## A1. Identité et Rôle

**Source** : `CLAUDE.md`, section "Rôle Teamleader — Règles Critiques" (`.claude/agents/context/TEAMMATES_PROTOCOL.template.md`)

Le **teamleader est le Chef De Projet (CDP)** — un seul rôle, jamais délégué à un agent séparé.

- **Coordonne** la production du cours : spawn la team au démarrage, dispatch les tâches en parallèle, relais la progression
- **Décide** : approuve le plan, valide les décisions bloquantes, pose les questions à l'utilisateur
- **N'exécute JAMAIS** de tâches techniques lui-même
- **Mémoire projet** : lit et met à jour `MEMORY.md` (session en cours, décisions, état des modules)

## A2. Délégation Stricte

**Source** : `CLAUDE.md`, section "Délégation Stricte — Outils Interdits"

Le teamleader NE DOIT JAMAIS utiliser les outils suivants. Les déléguer à l'agent approprié.

| Outil | Qui peut l'utiliser | Pourquoi |
|-------|-------------------|---------|
| `Edit`, `Write`, `MultiEdit` | `dev-course`, `doc-updater` | Écriture de contenu |
| `Bash` (build/test/git) | `qa`, `deployer`, agents `dev-*` | Exécution technique |
| `Read` (code applicatif) | `code-reviewer`, `planner` | Analyse de code |
| `Glob`, `Grep` | `planner`, `dev-course` | Recherche de code |

**Autorisé au teamleader** : `Read` sur `CLAUDE.md`, `MEMORY.md`, `.claude/project-config.json`, `_work/reports/`, `_work/handoff/`, `CHANGELOG.md`.

## A3. Équipe Permanente et Dispatch

**Source** : `CLAUDE.md`, section "Agents Disponibles" et "Dispatcher une tâche"

### Agents spawned au `/start-session`

Tous en mode **IDLE**, attendant les ordres du teamleader via `SendMessage`.

```
planner — Planifie la rédaction, produit un contrat d'API / cahier des charges
dev-course — Rédige les modules (HTML/JS, source unique)
dev-export — Construit l'export .pptx à partir des modules
test-writer — Écrit les scripts de tests + procédures manuelles
code-reviewer — Revue de code (correctness, performance, simplification)
qa — Exécute les tests et valide (regression + fonctionnel)
doc-updater — Maintient CHANGELOG.md, documentation technique, README
deployer — Build, publication QUALIF, déploiement PROD
```

### Agents ponctuels (spawned à la demande)

```
security — Audit de sécurité (SAST, secrets, dépendances)
infra — Infrastructure, CI/CD, Dockerfiles, Helm (non applicable pour un support web)
marketing-release — Release notes publiques, posts réseaux
```

### Dispatch par SendMessage

**Règle absolue** : pendant la session, **uniquement `SendMessage`** — jamais de spawn nouveau.

```
SendMessage({
  to: "<nom-canonique>",
  message: "Description complète de la tâche"
})
```

**Attendre** : confirmation ACTIF → puis DONE (références fichiers, jamais contenu inline).

**En parallèle** : plusieurs `SendMessage` dans le même tour pour agents indépendants.

```
SendMessage({ to: "dev-course", content: "Rédige module 03, branche feature/module-03" })
SendMessage({ to: "dev-export", content: "Mets à jour l'export PPTX pour modules 01-02" })
```

## A4. Nommage des Agents — Règle Absolue

**Source** : `CLAUDE.md`, section "Nommage des Agents — Règle Absolue"

Le paramètre `name` dans `Task` est **toujours le nom canonique simple**.

- ✅ `qa`, `dev-course`, `planner`
- ❌ `qa-1`, `qa-2`, `dev-course-a` (jamais de suffixe)

**Un rôle = un nom = une adresse SendMessage permanente.**

## A5. Adresse de Réponse : `team-lead` (pas `main`)

**Source** : `.claude/agents/doc-updater.template.md` et retour d'erreur d'adresse

Les agents envoient leurs messages au teamleader via :

```
SendMessage({
  to: "team-lead",    // JAMAIS "main" — cause une erreur
  content: "ACTIF / DONE / BLOQUE"
})
```

## A6. Format des Rapports DONE

**Source** : `CLAUDE.md`, section "Validation des rapports DONE"

Un `DONE` valide ne contient **jamais** de contenu inline (code, diff, extraits).  
Format attendu : **références fichiers uniquement**.

```
SendMessage({
  to: "team-lead",
  content: "DONE\nFichiers : modules/m03-installation.js, docs/PLAN.md (mise à jour)\nSHA : a1b2c3d"
})
```

Si un agent envoie du contenu inline → le corriger :

```
SendMessage({
  to: "<agent>",
  content: "Rapport invalide — écris le contenu dans _work/reports/<agent>-<timestamp>.md et renvoie le DONE avec la référence."
})
```

## A7. Relayer Chaque Jalon « EN COURS »

**Source** : `CLAUDE.md`, section "Relayer l'avancement"

Les jalons `[NOM] EN COURS — …` d'un teammate (ex. `QA EN COURS — lot 3/12`) sont relayés à l'utilisateur **en une ligne**, sans attendre le DONE.

Un jalon n'est pas un DONE : **ne pas enchaîner avant le DONE**.

```
[Exemple]
Dev: QA EN COURS — 3/12 tests passés
→ Teamleader affiche : "QA en cours — 3/12 tests passés"
→ Attendre le DONE avant d'envoyer la tâche suivante
```

## A8. Questions à l'Utilisateur — Obligatoirement via AskUserQuestion

**Source** : `CLAUDE.md`, section "Questions à l'utilisateur"

**Règle absolue** : toute information, décision ou validation attendue de l'utilisateur est posée **via `AskUserQuestion`** — jamais en texte dans le chat.

### Critères

- Questions fermées, 2 à 4 options
- Label court (ex. « Architecture ») + description (contexte/conséquence)
- Première option = recommandée, marquée « (Recommandé) »
- Pas d'option « Autre » (ajoutée automatiquement)
- **Tout regrouper dans un seul appel** (jusqu'à 4 questions)

### Chaîne de communication

```
Teammate envoie message "BLOQUE" au teamleader
  ↓
Teamleader convertit en AskUserQuestion
  ↓
Utilisateur répond
  ↓
Teamleader envoie réponse au teammate via SendMessage
```

## A9. Cycle d'une Session Type

**Source** : `CLAUDE.md` et `.claude/memory/MEMORY.md`

### Démarrage

```
1. /start-session
   → spawn 8 agents : planner, dev-course, dev-export, test-writer, code-reviewer, qa, doc-updater, deployer
   → tous en IDLE
2. Lire .claude/memory/MEMORY.md (état, version courante, décisions antérieures)
3. Attendre les instructions de l'utilisateur
```

### Phase 1 : Planification

```
Utilisateur demande une feature / bugfix / hotfix → /feature, /bugfix, /hotfix
  ↓
Teamleader → SendMessage { to: "planner", content: "Planifie la rédaction du module 03..." }
  ↓
Planner → ACTIF
  ↓
Planner produit un contrat : _work/reports/planner-<scope>.md
  ↓
Planner → DONE
  ↓
Teamleader lit le rapport, pose questions si cadrage nécessaire
  ↓
Utilisateur valide le plan
```

### Phase 2 : Lots de Rédaction

Exemple : rédaction du module 03 (installation) en parallèle de la QA du module 02.

```
// Lot L0 : test-writer + dev-course en parallèle
SendMessage({ to: "test-writer", content: "Écris la procédure de test du module 02 (déjà rédigé)..." })
SendMessage({ to: "dev-course", content: "Rédige le module 03 sur branche feature/module-03..." })

// Lot L1 : code-reviewer + dev-export en parallèle (L0 code review ongoing)
SendMessage({ to: "code-reviewer", content: "Revue du module 03, branche feature/module-03..." })
SendMessage({ to: "dev-export", content: "Mets à jour l'export PPTX pour modules 01-03..." })

// Lot L2 : qa + doc-updater en parallèle (L1 review ongoing)
SendMessage({ to: "qa", content: "Valide les tests du module 02 + regression..." })
SendMessage({ to: "doc-updater", content: "Mets à jour CHANGELOG pour module 03 (DRAFT)..." })
```

**Principe** : chaque lot attend le DONE du lot précédent avant de commencer, sauf pour les tâches indépendantes (test-writer et dev-course en parallèle).

### Phase 3 : Réception des DONE

```
Planner → DONE
  ↓ (approbation plan)
Test-writer → DONE + Dev-course → DONE (en parallèle)
  ↓ (tests et code prêts)
Code-reviewer → DONE
  ↓ (approbation)
QA → DONE
  ↓ (validation)
Dev-export → DONE + Doc-updater → DONE (en parallèle)
  ↓ (export et doc prêts)
Deployer → DONE
  ↓ (publié et déployé)
Marketing-release → DONE (optionnel)
```

## A10. Mémoire Projet

**Source** : `CLAUDE.md`, section "Mémoire Projet"

`.claude/memory/MEMORY.md` est la **source de vérité** du projet.

**Contenu** :
- Version courante (X.Y.Z.a en dev, X.Y.Z en prod)
- Travail en cours (branche, phase, issues)
- Décisions techniques majeures
- État des modules (rédigés, en cours, à faire)
- Risques et notes d'audit

**Mise à jour** : via `/end-session` en fin de session.

---

# PARTIE B : Définition du Support de Formation Web

## B1. Principe Fondateur

**Source** : `CLAUDE.md`, section "Cadrage — Format"

Support de formation **HTML/JS/CSS vanilla**, sans dépendance externe.

```
Propriété clé : ouvrable en double-clic (file://)
```

- **Source unique** : modules au format `.js` structuré (`COURSE.add({...})`)
- **Rendu** : moteur `assets/engine.js` qui lit et affiche les modules
- **Export secondaire** : PPTX généré à partir des modules (jamais maintenu manuellement)
- **Pas de serveur** : HTML statique, localStorage pour la progression utilisateur

## B2. Structure de Fichiers

**Source** : `CONVENTIONS.md`, section "Fichiers" et `index.html`

```
cours-formation/
├── index.html              # Charge le moteur, le plan, les modules chargés
├── assets/
│   ├── engine.js          # Moteur de navigation et de rendu (⚠️ ne pas modifier sans le signaler)
│   ├── plan.js            # Manifeste COURSE.plan : liste de tous les modules
│   ├── style.css          # Thème et style (couleurs, layout, mode sombre)
│   └── style-dark.css     # (optionnel) Thème sombre alternatif
├── modules/
│   ├── mNN-sujet.js       # Module NN (00 à NN), ex. m01-k8s-vs-ocp.js
│   ├── mNN-sujet.js       # …
│   └── ...
├── tools/
│   ├── validate.js        # Validateur de schéma des modules (obligatoire)
│   └── export-pptx.js     # Export PowerPoint (optionnel si PPTX nécessaire)
├── docs/
│   ├── PLAN.md            # Référence de conception (frontières, durées, labs)
│   ├── CONVENTIONS.md     # Schéma des modules et des blocs
│   └── ...
├── .github/workflows/
│   ├── ci.yml             # Validation (lint, validate.js)
│   └── release.yml        # Release : archive + CHANGELOG + GitHub Release
├── CHANGELOG.md           # Historique (format Keep a Changelog)
├── VERSION                # Fichier contenant X.Y.Z (consulté par CI/CD)
├── .claude/
│   ├── agents/            # Définitions des agents (templates + adaptations projet)
│   ├── memory/            # MEMORY.md (état du projet)
│   └── project-config.json # Configuration globale du projet
└── _work/
    ├── reports/           # Rapports des agents (lectures seules pour teamleader)
    └── handoff/           # Remises de tâches (agent → agent)
```

## B3. Schéma d'un Module

**Source** : `CONVENTIONS.md`, section "Schéma d'un module"

```javascript
COURSE.add({
  id: 'mNN',                      // Identifiant (m00 à m15, ex. m03)
  num: NN,                        // Numéro (0 à 15)
  emoji: '📊',                    // Emoji du module (visuel dans le sommaire)
  
  title: 'Titre du module',       // Texte brut (PAS de HTML, PAS de backticks)
  tagline: 'Phrase d\'accroche',  // HTML autorisé : <b> <i> <code> <br>
  duration: '≈ 60 min + lab 20 min',  // Format obligatoire : ' ≈ X min + lab Y min'
  
  objectives: [                   // 3 à 5 objectifs (format HTML)
    'Objectif 1',
    'Objectif 2',
    'Objectif 3'
  ],
  
  slides: [                       // 14 à 26 slides (voir B4)
    {
      title: 'Titre de la slide',     // Texte brut obligatoire
      tag: 'quiz',                    // Badge optionnel (ex. 'lab', 'quiz', 'piège n°1')
      layout: 'two',                  // Optionnel : 'two' pour 2 colonnes
      blocks: [ /* voir B4 */ ]       // Au moins 1 bloc par slide
    },
    // ...
  ],
  
  takeaways: [                    // 4 à 6 points « À retenir »
    'Point clé 1',
    'Point clé 2',
    'Point clé 3',
    'Point clé 4'
  ]
});
```

### Validation

Le moteur génère automatiquement :
- Slide de couverture (titre, emoji, objectifs)
- Slide « À retenir » (avec score des quiz)

**Cible de slides** : 16 à 22 slides par module (module 00 : 14 à 16 minimum).

## B4. Catalogue Complet des Types de Blocs

**Source** : `CONVENTIONS.md`, section "Blocs disponibles" et `tools/validate.js`

Tous les blocs acceptent `frag: true` (apparition progressive) et `wide: true` (pleine largeur).

### 1. `text` — Paragraphe d'introduction

```javascript
{
  t: 'text',
  html: '<p>Contenu HTML avec <b>gras</b>, <i>italique</i>, <code>code</code>, <br>.</p>',
  frag: true,   // Optionnel : apparaît au clic
  wide: true    // Optionnel : pleine largeur
}
```

### 2. `bullets` — Liste à puces

```javascript
{
  t: 'bullets',
  items: [                    // 1 à 6 items courts
    '<b>Item 1</b> : description',
    'Item 2 : description',
    'Item 3'
  ],
  frag: true   // Chaque puce apparaît au clic
}
```

### 3. `code` — Bloc terminal ou YAML

```javascript
{
  t: 'code',
  code: `$ oc get pods
# Commentaire grisé
$ oc describe pod xyz`,      // Texte brut (pas de HTML)
  lang: 'bash',              // Type de langage (bash, yaml, json…)
  file: 'terminal',          // Libellé du fichier (affichage) ou langue
  caption: 'Copier la commande',  // Sous-titre optionnel
  frag: true
}
```

**Syntaxe** :
- Lignes `$ …` : le prompt est masqué à la copie
- Lignes `# …` : grisées
- Texte brut uniquement (pas de HTML)

### 4. `cmds` — Tableau de commandes

```javascript
{
  t: 'cmds',
  items: [
    ['$ kubectl apply -f file.yaml', 'Appliquer une ressource'],
    ['$ oc adm …', 'Commande admin OpenShift'],
    ['# Commentaire', 'Explication']
  ]
}
```

Tableau 2 colonnes : commande (gauche) | description HTML (droite).

### 5. `table` — Comparatif ou mapping

```javascript
{
  t: 'table',
  head: ['Colonne 1', 'Colonne 2', 'Colonne 3'],  // Entêtes HTML
  rows: [
    ['Ligne 1 Col 1', 'Ligne 1 Col 2', 'Ligne 1 Col 3'],
    ['Ligne 2 Col 1', 'Ligne 2 Col 2', 'Ligne 2 Col 3'],
    // Max ~10 lignes
  ]
}
```

## 6. `compare` — Deux colonnes (gauche/droite)

```javascript
{
  t: 'compare',
  left: {
    title: 'Colonne gauche (bleu)',
    items: ['Point 1', 'Point 2', 'Point 3']
  },
  right: {
    title: 'Colonne droite (rouge)',
    items: ['Différence 1', 'Différence 2']
  },
  verdict: 'Conclusion optionnelle'  // HTML, optionnel
}
```

## 7. `callout` — Encart d'information

```javascript
{
  t: 'callout',
  kind: 'tip',    // 'tip' 💡 | 'warn' ⚠️ | 'trap' 🪤 | 'cloud' ☁️ | 'onprem' 🏢 | 'k8s' ☸️ | 'ocp' 🔴
  html: 'Contenu du callout',
  title: 'Titre optionnel du callout'
}
```

**Significatif** :
- `tip` : astuce, conseil utile
- `warn` : attention, risque
- `trap` : piège (erreur classique)
- `cloud` : différence en environnement cloud managé (adapter en équivalent pour votre sujet)
- `onprem` : ce qui est à votre charge en on-premise (adapter pour votre contexte)
- `k8s`, `ocp` : distinction K8s vs OCP (adapter pour votre plateforme)

## 8. `flow` — Chaîne horizontale de boîtes

```javascript
{
  t: 'flow',
  nodes: [
    'Étape 1',
    { label: 'Étape 2', sub: 'sous-titre', hl: true },  // hl: true = mise en avant
    'Étape 3 → …'
  ],
  caption: 'Processus : étapes du déploiement'
}
```

Affiche une flèche `→` entre les éléments.

## 9. `layers` — Pile de couches (architecture)

```javascript
{
  t: 'layers',
  items: [
    { name: 'Couche 1', desc: 'Description', hl: true },  // hl: true = souligner
    { name: 'Couche 2', desc: 'Description' },
    { name: 'Couche 3 (base)', desc: 'Fondation', base: true }  // base: true = autre style
  ]
}
```

Affiche une pile de haut en bas.

## 10. `cards` — Cartes retournables (jeu de vocabulaire)

```javascript
{
  t: 'cards',
  items: [
    { front: '🔐 Secret', back: 'Donnée confidentielle' },
    { front: '⚙️ ConfigMap', back: 'Configuration non-confidentielle' },
    { front: '🏗️ Operator', back: 'Contrôleur customisé pour un service' }
  ]
}
```

Clic pour retourner la carte (front → back).

## 11. `quiz` — QCM à réponse unique

```javascript
{
  t: 'quiz',
  q: 'Quelle est la bonne réponse ?',                    // Question HTML
  options: [                                               // 3 à 4 options HTML
    'Option 1 (mauvaise)',
    'Option 2 (correcte)',
    'Option 3 (mauvaise)'
  ],
  answer: 1,                                              // Index de la réponse correcte (0-based)
  explain: 'Explication de la réponse : pourquoi cette option est bonne et les autres non.'
}
```

Le module doit avoir au moins **1 quiz** (sauf module final).

## 12. `reveal` — « Réfléchis puis clique »

```javascript
{
  t: 'reveal',
  label: 'Clique pour révéler',  // Libellé du bouton (optionnel)
  html: 'Contenu caché initialement'
}
```

`<details>` HTML : clic pour afficher la réponse.

## 13. `lab` — TP à cocher (5 à 9 étapes)

```javascript
{
  t: 'lab',
  title: 'Titre du TP',
  goal: 'Objectif final (optionnel)',
  steps: [
    'Étape 1 : faire ceci',
    'Étape 2 : faire cela',
    'Étape 3 (bonus) : amélioration facultative',
    'Étape 4 (bonus) : approfondir'
  ]
}
```

Chaque étape a une checkbox. Les étapes marquées « (bonus) » sont optionnelles.

**Obligation** : le module doit avoir au moins **1 lab** (sauf module final). Premier `step` = prérequis d'environnement (E0, E1, E2, E3 — voir B8).

## 14. `diagram` — Schéma custom (SVG ou HTML)

```javascript
{
  t: 'diagram',
  html: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="80" height="60" fill="currentColor" stroke="var(--border)"/>
    <text x="50" y="40" fill="var(--text)" text-anchor="middle">Boîte</text>
  </svg>`,
  caption: 'Schéma : architecture en trois tiers'
}
```

**Recommandations** :
- SVG responsive : `viewBox` obligatoire, **pas de largeur fixe**
- Couleurs : `currentColor` ou variables CSS (`var(--accent)`, `var(--border)`, `var(--surface)`, `var(--text)`, `var(--muted)`)
- Contenu brut : pas d'HTML inline (sauf balises SVG)

## B5. Conventions de Contenu

**Source** : `CONVENTIONS.md`, section "Exigences de contenu"

### Exact et à Jour

- **Version de référence** : à fixer au démarrage du projet (ex. Kubernetes 1.33, Ansible 2.15)
- Dater tout comportement introduit ou retiré
- Si un point dépend de la version ou n'est pas certain : dire « à vérifier » plutôt qu'affirmer
- Ne jamais inventer de commande ou de champ YAML

### Commandes et Code

- **Réalistes et copiables** : les codes dans les blocs `code` et `cmds` doivent pouvoir être copié/collé
- Pas de HTML dans `code` ni `cmds[0]` : le moteur échappe automatiquement
- Préférer apostrophes échappées (`\'`) ou guillemets doubles dans les chaînes JS

### Labs et Quiz

- **Un lab et un quiz obligatoires par module** (sauf module final)
- **Labs** : noyau en séance + étapes bonus marquées « (bonus) »
- Premier `step` du lab : prérequis d'environnement avec renvoi au module de setup
- **Quiz** : pièges réalistes (erreurs fréquentes des apprenants), 3 à 4 options, explication utile

### Renvois entre Modules

- Format : « module NN » sur **deux chiffres** (« module 09 », jamais « module 9 »)
- **Un sujet = un module propriétaire** : les autres en gardent qu'une slide et renvoient
- Un renvoi en avant (vers un module plus loin) n'exige pas de comprendre la suite

### Distinctions par Callout

- `onprem` : ce qui est à votre charge sur votre infrastructure
- `cloud` : ce qui change en environnement cloud managé (adapter l'équivalent pour Ansible ou autre sujet)
- `trap` : erreurs classiques
- `tip` : astuces

### Présentation

- Éviter les murs de texte : une idée par slide, 2 à 4 blocs
- Mélange de formats : pas que des listes, intégrer code, tables, comparatifs, cartes, quiz…
- Chaque module termine par quiz → lab → takeaways

## B6. Moteur (Assets)

**Source** : `assets/engine.js`, `index.html`

### Fichiers du moteur (ne pas modifier sans le signaler)

| Fichier | Rôle | Modifiable ? |
|---------|------|-------------|
| `assets/engine.js` | Navagation, rendu des blocs, localStorage | Non (changements = signaler) |
| `assets/plan.js` | Manifeste `COURSE.plan` | Oui, ajouter/retirer entrées |
| `assets/style.css` | Thème, couleurs, layout | Oui, adapter couleurs/typo |
| `index.html` | Charge moteur + modules rédigés | Oui, ajouter lignes `<script>` |

### index.html — Ajouter un Module

```html
<script src="modules/m03-installation.js"></script>
<!-- Ajouter ici, pas ailleurs. Ne modifier rien d'autre -->
```

**Règle** : `dev-course` peut **uniquement** ajouter ou retirer la balise `<script>` du module.

### assets/plan.js — Manifeste

```javascript
COURSE.plan = [
  { id: 'm00', num: 0, emoji: '🛠️', title: 'Environnement de lab' },
  { id: 'm01', num: 1, emoji: '⚖️', title: 'K8s vs OCP' },
  // … tous les modules, même ceux « à venir »
  { id: 'm15', num: 15, emoji: '📚', title: 'Aide-mémoire & quiz final' }
];
```

- Entrée par module, avec `id`, `num`, `emoji`, `title`
- Modules du manifeste sans `<script>` chargé dans `index.html` apparaissent grisés « À venir » et ne sont pas ouvrable
- À la création d'un module : l'entrée du manifeste existe déjà, ajouter juste la ligne `<script>` dans `index.html`

### assets/style.css — Thème

Couleurs et variables CSS (adapter au sujet) :

```css
:root {
  --accent: #DC3545;        /* Couleur primaire (ex. rouge pour OpenShift) */
  --border: #CCCCCC;        /* Bordures */
  --surface: #F5F5F5;       /* Fond des blocs */
  --text: #333333;          /* Texte */
  --muted: #999999;         /* Texte secondaire */
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --accent: #FF5566;
    --surface: #222222;
    --text: #EEEEEE;
    /* … */
  }
}
```

## B7. Validateur (tools/validate.js)

**Source** : `tools/validate.js`

### Exécution

```bash
node tools/validate.js            # Valide tous les modules
node tools/validate.js modules/m03*.js  # Valide un ou plusieurs modules
```

### Ce qu'il Valide

| Aspect | Seuil | Signalé si... |
|--------|-------|--------------|
| Slides par module | 14–26 (sauf module final : 14–16) | < 14 ou > 26 |
| Objectifs | Minimum 3 | < 3 |
| Takeaways | Minimum 4 | < 4 |
| Quiz obligatoires | Au moins 1 (sauf final) | 0 pour modules 0–14 |
| Lab obligatoire | Au least 1 (sauf final) | 0 pour modules 0–14 |
| Titre de slide | Texte brut | HTML ou backticks détectés |
| ID/num du module | Correspond au nom fichier | m03 dans m03-* |
| Manifeste (`assets/plan.js`) | Cohérence | Entrée manquante, format invalide |
| index.html | Cohérence | Script 404, module non chargé |

### Erreurs vs Avertissements

- **Erreur** : bloque le validation (sortie 1)
- **Avertissement** : accepté mais signalé (sortie 0)

---

## B8. Environnements de Lab

**Source** : `docs/PLAN.md`, section "Environnements de lab"

Les labs utilisent des niveaux d'environnement prédéfinis. Adapter les noms selon votre sujet (ex. virtualisation locale, sandbox, cluster réel pour Ansible).

| Niveau | Dénomination générique | Usage |
|--------|----------------------|-------|
| **E0** | Léger, local ou cloud d'essai | Utilisation minimale, pas d'infra complexe |
| **E1** | Single-node ou équivalent | Quorum, mises à jour, labos complètes |
| **E2** | Cluster multi-nœuds | Haute disponibilité, réplication, tests réels |
| **E3** | Complet avec briques avancées | Virtualisation imbriquée, dépannage avancé |

**Annonce dans labs** : premier `step` = « Prérequis : E1 (Single-node) » ou équivalent, avec renvoi au module 00 (setup).

## B9. Export PPTX

**Source** : `tools/export-pptx.js` (à créer si nécessaire), `.github/workflows/release.yml`

### Principe

- Généré à partir des modules (source unique = `.js`)
- Jamais maintenu manuellement
- Produit par CI, joint à chaque Release GitHub

### Ce qu'il Exporte

Chaque bloc a une représentation PPTX. Les blocs interactifs (quiz, reveal, cards, lab) sont **rendus statiquement** ou avec annotations (ex. « À compléter : répondre au quiz »).

### Générer Localement

```bash
node tools/export-pptx.js > export.pptx
```

(À adapter selon votre implémentation)

## B10. Build, Tests et CI

**Source** : `.claude/project-config.json` (commandes), `.github/workflows/ci.yml`

### Commandes de Validation

| Commande | Rôle |
|----------|------|
| `node tools/validate.js` | Valide le schéma des modules |
| `node --check assets/engine.js` | Vérifie la syntaxe JavaScript |
| `node tools/export-pptx.js` (optionnel) | Génère le PPTX |

### Workflow CI (`.github/workflows/ci.yml`)

À chaque push sur `feature/*` ou `main` :

```yaml
jobs:
  validate:
    - Syntaxe JS (engine.js)
    - Schema modules (tools/validate.js)
    - (Export PPTX optionnel)
```

Sortie : ✅ pass ou ❌ fail.

## B11. Release et GitHub Pages

**Source** : `.github/workflows/release.yml`

### Trigger

Un tag `v*` (ex. `v1.0.0`) déclenche :

```bash
# Vérifications
VERSION="${GITHUB_REF_NAME#v}"  # Extrait X.Y.Z de vX.Y.Z
grep -E '^[0-9]+\.[0-9]+\.[0-9]+$' VERSION  # Valide SemVer
cat VERSION | grep $VERSION  # Cohérence fichier VERSION ↔ tag

# Build
node --check assets/engine.js
node tools/validate.js

# Artefacts
zip -r openshift-course-${VERSION}.zip index.html assets modules VERSION
sha256sum ...zip > ...zip.sha256

# GitHub Release (avec notes du CHANGELOG)
gh release create vX.Y.Z ...zip ...zip.sha256
```

### Fichier VERSION

Fichier simple contenant le numéro SemVer (ex. `1.2.0`).

```
1.2.0
```

Consulté par la CI pour vérifier la cohérence `tag ↔ VERSION`.

### CHANGELOG.md

Format [Keep a Changelog](https://keepachangelog.com/).

```markdown
# Changelog

## [Unreleased]

### Added
- Nouveau bloc de type XYZ (#123)

### Fixed
- Correction du bug Z (#456)

## [1.2.0] - 2024-01-15

### Added
- Module 05 : Supervision & monitoring
```

---

# PARTIE C : Checklist de Mise en Conformité pour Votre Projet

## C1. Ce qu'il faut Copier Tel Quel

Copier sans adaptation ces fichiers/dossiers depuis le projet source (`openshift-course`) :

| Ressource | Chemin source | Destination | Raison |
|-----------|--------------|-------------|--------|
| Moteur | `assets/engine.js` | `assets/engine.js` | Moteur générique, validé |
| Validateur | `tools/validate.js` | `tools/validate.js` | Schéma de validation standard |
| Exemple module | `modules/m01-k8s-vs-ocp.js` | `modules/m01-*.js` (renommer) | Référence de style et qualité |
| Template index.html | `index.html` | `index.html` | Structure HTML de base |
| Workflows CI | `.github/workflows/ci.yml` | `.github/workflows/ci.yml` | Validation en CI standard |
| Workflows Release | `.github/workflows/release.yml` | `.github/workflows/release.yml` | Release GitHub + archive standard |
| Agent templates | `.claude/agents/*.template.md` | Idem dans votre projet | Définitions d'agents standardisées |
| Contextes agents | `.claude/agents/context/*.template.md` | Idem | Protocoles et règles communes |

## C2. Ce qu'il faut Adapter

Adapter pour votre sujet (ex. Ansible, Kubernetes Distribution X, etc.) :

| Ressource | À adapter | Exemple d'adaptation |
|-----------|-----------|---------------------|
| Liste des modules | `docs/PLAN.md` | Sujet OpenShift → sujet Ansible ; durées et labs propres à Ansible |
| Conventions de contenu | `CONVENTIONS.md` | Callouts `cloud` → `cloud-ansible` ou `local` ; version de ref Ansible X.Y |
| Callouts spécifiques | `assets/style.css` | Ajouter classe CSS pour nouveaux encarts |
| Couleurs du thème | `assets/style.css` | Adapter `--accent` au sujet (ex. bleu pour Ansible au lieu de rouge) |
| Titre et branding | `index.html` (titre) + `CLAUDE.md` | Titre du cours, logo, lien du dépôt |
| Public et contexte | `CLAUDE.md` + `.claude/project-config.json` | Admins Ansible vs admins OCP ; on-prem → infrastructure cible ; version de référence |
| Environnements de lab | `docs/PLAN.md` §3 + modules | E0 → sandbox Ansible ; E1 → cluster de lab ; E2 → multi-nœuds ; E3 → dépannage avancé |
| Budget horaire | `docs/PLAN.md` §2 | Répartition sur journées selon votre contexte |

## C3. Écarts Connus à Ne PAS Reproduire

Problèmes identifiés dans le projet source qui ne doivent pas être répétés :

### C3.1. Adresses dans les Templates d'Agents

**Problème** : adresse `main` utilisée dans certains templates d'agents.

**Source** : `.claude/agents/doc-updater.template.md` (ligne mentionnant SendMessage vers `main`)

**Solution** : remplacer **toutes** les occurrences de `to: "main"` par `to: "team-lead"` dans les templates d'agents. Aucun agent ne doit envoyer à `main` — toujours à `team-lead`.

### C3.2. Fichier TEAMMATES_PROTOCOL.md Manquant

**Problème** : le protocole teammates est dans les templates mais pas en fichier `.template.md` autonome.

**Source** : `.claude/agents/context/TEAMMATES_PROTOCOL.template.md` (voir PARTIE A pour le contenu complet)

**Solution** : s'assurer que le fichier template existe et est inclus lors de l'initialisation du projet. Sinon, créer un fichier par copie du bloc correspondant de `CLAUDE.md`.

### C3.3. Pages GitHub (gh-pages) Pas Activé par Défaut

**Problème** : la vitrine sur GitHub Pages peut ne pas être activée automatiquement en workflows.

**Source** : `.github/workflows/release.yml` (pas de step de push vers `gh-pages` automatique)

**Solution** : ajouter une étape de déploiement sur `gh-pages` à la release, ou documenter l'activation manuelle des Pages dans les réglages du dépôt GitHub (Settings → Pages → Deploy from a branch `gh-pages`).

### C3.4. Version de Référence Floue

**Problème** : la version de référence OpenShift 4.20 EUS est documentée dans `docs/PLAN.md` §1.1 mais répétée dans plusieurs endroits.

**Source** : `docs/PLAN.md` (source de vérité), `CONVENTIONS.md` (à synchroniser), modules (à vérifier)

**Solution** : centraliser la version dans `.claude/project-config.json` (nouvelle clé `reference_version`) et la relire dans `CONVENTIONS.md`. Ajouter une validation dans `tools/validate.js` pour vérifier la cohérence.

### C3.5. Absence de Procédure de Validation du Plan Avant Rédaction

**Problème** : pas de gate explicite entre planification et rédaction.

**Source** : CLAUDE.md (workflow absent)

**Solution** : ajouter une étape « approbation du plan » dans le cycle de session (voir PARTIE A.9). Le teamleader pose des questions si cadrage nécessaire avant de dispatcher la rédaction.

## C4. Vérifications Techniques Pré-lancement

Avant de commencer la rédaction, vérifier :

### Projet GitHub

- [ ] Dépôt créé (`<org>/<projet>`)
- [ ] Branche `main` définie par défaut
- [ ] GitHub Pages activées (Settings → Pages → Source : Deploy from a branch → `gh-pages`)
- [ ] Workflows CI/CD visibles dans `.github/workflows/`

### Structure Locale

- [ ] Répertoires créés : `assets/`, `modules/`, `docs/`, `.claude/agents/`, `tools/`, `_work/reports/`
- [ ] Fichiers core présents : `index.html`, `assets/engine.js`, `assets/plan.js`, `assets/style.css`, `tools/validate.js`, `VERSION`
- [ ] Fichiers de documentation : `CLAUDE.md`, `CONVENTIONS.md`, `docs/PLAN.md`, `CHANGELOG.md`

### Configuration Claude Code

- [ ] `.claude/project-config.json` initialisé avec noms et versions
- [ ] `.claude/agents/` avec templates (`.template.md`)
- [ ] `.claude/agents/context/` avec templates de protocole
- [ ] `.claude/memory/MEMORY.md` créé (initialisé par `/start-session`)

### Validation Initiale

```bash
# Syntaxe JS
node --check assets/engine.js

# Validateur (sur modules existants ou empty)
node tools/validate.js
```

Sortie attendue : ✅ avec 0 modules chargés ou les modules pilotes.

## C5. Points de Contrôle par Étape

### Avant Planification (`/start-session`)

- [ ] Team spawned : planner, dev-course, dev-export, test-writer, code-reviewer, qa, doc-updater, deployer
- [ ] Tous en IDLE
- [ ] MEMORY.md lisible et à jour

### Avant Première Rédaction (après approbation du plan)

- [ ] `docs/PLAN.md` finalisé (durées, labs, renvois)
- [ ] Entrées dans `assets/plan.js` créées (même si modules absent)
- [ ] Public et version de référence documentés dans `CLAUDE.md`
- [ ] Premier module pilote (m01) rédigé et validé (`node tools/validate.js`)

### Avant Release

- [ ] Tous les modules listés dans `assets/plan.js` sont soit rédigés (`.js` dans `modules/`) soit grisés « À venir »
- [ ] `node tools/validate.js` passe sans erreurs
- [ ] `CHANGELOG.md` à jour
- [ ] `VERSION` contient X.Y.Z (pas de `.a` de dev)
- [ ] Tag `vX.Y.Z` créé localement, prêt à push
- [ ] CI valide le tag → Release GitHub créée avec archive ZIP + checksum

---

## C6. Adaptation Minimale pour Ansible (Exemple Concret)

Si vous adaptez ce modèle pour une formation Ansible, voici ce qu'il faut changer :

| Élément | OpenShift | Ansible |
|---------|-----------|---------|
| **Sujet de callout `cloud`** | Comportement différent en ROSA/ARO (cloud managé) | Comportement différent Ansible Tower / AWX (centralisé) |
| **Environnements de lab** | E0 (OpenShift Local) → E1 (SNO) → E2 (Compact 3-node) → E3 (Virtualisation) | E0 (Poste local) → E1 (Ansible de base) → E2 (Ansible + Vault/Tower) → E3 (Déploiement multi-environnements) |
| **Sujet exclusif module** | SCC (Security Context Constraints) → Module 09 propriétaire | Jinja2 templating → Module propriétaire |
| **Couleur de thème** | `--accent: #DC3545` (rouge OpenShift) | `--accent: #0078D4` (bleu Ansible) |
| **Version de référence** | OpenShift 4.20, Kubernetes 1.33 | Ansible 2.15 (ou autre) |

---

# Références Complètes

## Sources Citées par Chemin

| Référence | Chemin complet |
|-----------|----------------|
| CLAUDE.md principal | `./CLAUDE.md` |
| CONVENTIONS.md | `./CONVENTIONS.md` |
| Plan de modules | `./docs/PLAN.md` |
| Configuration projet | `./.claude/project-config.json` |
| Agent dev-course | `./.claude/agents/dev-course.md` |
| Agent dev-export | `./.claude/agents/dev-export.md` |
| Moteur | `./assets/engine.js` |
| Validateur | `./tools/validate.js` |
| Manifeste | `./assets/plan.js` |
| Index HTML | `./index.html` |
| CSS | `./assets/style.css` |
| Release workflow | `./.github/workflows/release.yml` |
| CI workflow | `./.github/workflows/ci.yml` |
| Protocole teammates template | `./.claude/agents/context/TEAMMATES_PROTOCOL.template.md` |
| Règles communes template | `./.claude/agents/context/COMMON.template.md` |
| Mémoire projet | `./.claude/memory/MEMORY.md` |
| CHANGELOG | `./CHANGELOG.md` |

## Hiérarchie de Lecture (pour Démarrage)

1. `CLAUDE.md` — Contexte global, configuration
2. `.claude/memory/MEMORY.md` — État actuel
3. `docs/PLAN.md` — Périmètre et chronologie
4. `CONVENTIONS.md` — Schéma des modules
5. `modules/m01-k8s-vs-ocp.js` — Référence de qualité
6. `.claude/agents/dev-course.md` → agent de rédaction
7. `.claude/agents/context/TEAMMATES_PROTOCOL.template.md` → protocole teamleader
8. `.claude/agents/context/COMMON.template.md` → règles communes

---

**Fin du document d'homogénéisation.**  
Document autonome, complet, directement applicable à tout projet de support de formation web.
