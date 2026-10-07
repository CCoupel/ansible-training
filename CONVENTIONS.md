# Conventions du site HTML Ansible Training

Source de vérité du **site** (version HTML du support) : choix techniques, schéma des modules et des blocs, règles de conversion du PPTX, règles du contenu additionnel, statut des fichiers, anti-fuite. Le PPTX (`Ansible Training.pptx`) reste le support de référence ; le site en est la version web, vérifiée par un contrôle de parité.

## Choix techniques

- **HTML/CSS/JS vanilla, aucune dépendance** (ni npm, ni CDN, ni police distante). Le site **s'ouvre en double-clic** (`file://`) depuis un clone du dépôt.
- **Pas d'étape de build** : les fichiers commités SONT le site. Seul `assets/meta.js` est généré (et commité), pour que la version s'affiche en double-clic.
- Node (stdlib) pour les outils, Python (stdlib) pour les tests et le contrôle des liens.
- Interface **en français** ; les libellés sont **tous** dans `assets/i18n/fr.js` (jamais en dur dans `engine.js` / `index.html`) afin de préparer la traduction de l'interface (#51). Le **contenu des slides** reprend le texte du PPTX tel quel (langue d'origine, majoritairement l'anglais) ; le contenu additionnel est en français.
- Accent bleu Ansible, thème clair/sombre (touche `t`, préférence mémorisée, `prefers-color-scheme` par défaut), responsive.
- Persistance : `localStorage`, clé `ansible-training-v1` (progression, scores de quiz, thème, panneau de notes, dernière slide). Tolérant à l'indisponibilité du stockage.

## Statut des fichiers

| Chemin | Statut | Commité | Auteur |
|---|---|---|---|
| `index.html` | écrit à la main ; une ligne `<script>` par module livré | oui | `course` |
| `assets/engine.js`, `assets/style.css`, `assets/plan.js` | écrits à la main | oui | `course` |
| `assets/i18n/fr.js` | écrit à la main (libellés de l'interface) | oui | `course` |
| `assets/meta.js` | **généré** par `node tools/sync-meta.js` depuis `.claude/project-config.json` | **oui** (seul fichier généré suivi) | outil |
| `assets/img/*.png`, `assets/img/images.json` | extraits une fois du PPTX | oui | `dev-slides` |
| `modules/mNN-sujet.js` | écrits à la main (conversion du PPTX + contenu additionnel) | oui | `course` |
| `tools/validate.js`, `sync-meta.js`, `dump-course.js`, `package.js`, `check_links.py` | outils | oui | `course` |
| `build/course.json`, `build/extras-review.md`, `build/Ansible-Training-HTML.zip` | générés | **non** (`build/` ignoré) | outils |
| `tests/site/**` | tests | oui | `test-writer` |

## Fichiers du site

- `index.html` : coquille (sidebar, topbar, slide, footer) + un `<script>` par module **existant**. Ordre imposé : `assets/meta.js`, `assets/engine.js`, `assets/i18n/fr.js`, `assets/plan.js`, `modules/*.js`, puis `COURSE.start()`. Ne jamais référencer un module absent (404).
- `assets/plan.js` : manifeste des 15 modules (`COURSE.plan`) : `id`, `num`, `emoji`, `title`, `day` (`J1`/`J2`/`J3`, agenda de la slide 3 du PPTX), `range` (première et dernière slide PPTX du module, slides masquées incluses). Un module du manifeste sans `<script>` apparaît « à venir » (grisé).
- `assets/engine.js` : moteur (navigation, rendu des blocs, notes, quiz, recherche, thème).
- `modules/mNN-sujet.js` : un module = un appel `COURSE.add({...})`. Noms : `mNN-` + kebab-case ASCII.

Navigation : `← → PageUp PageDown Espace` (slides et fragments), `Home` / `End`, `m` sommaire, `n` notes du formateur, `t` thème, `/` recherche plein texte. Ancres partageables : `#home`, `#m02-0` (objectifs), `#m02-5` (5ᵉ slide du module), `#m02-N` (« À retenir » : N = nombre de slides + 1).

## Schéma d'un module

```js
COURSE.add({
  id: 'm02', num: 2, emoji: '📇',
  title: 'Inventory',                      // texte brut = titre de la section du PPTX
  tagline: 'Une phrase d\'accroche.',      // HTML autorisé, français
  objectives: [ { html: '…', ref: [14] } ],// 3 à 5, contenu additionnel
  slides: [ { title, src?, extra?, notes?, tag?, layout?, blocks: [...] }, … ],
  takeaways: [ { html: '…', ref: [14] } ]  // 4 à 6, contenu additionnel
});
```

Le moteur génère seul la slide « Objectifs » (couverture du module) et la slide « À retenir » (avec le score des quiz du module). `day` vient du manifeste.

Champs d'une slide :

| Champ | Rôle |
|---|---|
| `title` | texte brut (échappé par le moteur) |
| `src` | **obligatoire** hors `extra` : numéros des slides PPTX d'origine, entiers 4-223, triés, jamais une slide masquée (193, 210, 217), dans la plage du module, sans doublon entre modules. Affiche le badge « PPTX · slide N » |
| `extra: true` | slide de **contenu additionnel** (quiz) : pas de `src`, badge « Bonus HTML », exclue de la parité |
| `notes` | notes du formateur du PPTX (chaîne ou liste de chaînes, HTML limité) ; panneau ouvert par `n` ; **uniquement** celles du PPTX |
| `tag` | petit badge optionnel (« exercice »…) |
| `layout: 'two'` | blocs sur 2 colonnes ; `wide: true` sur un bloc = pleine largeur |

`frag: true` sur un bloc (ou une liste) le fait apparaître progressivement au clic/`→`.

## Blocs (`t:`)

Tous acceptent `frag` et `wide`. Champs « HTML » : balises autorisées `b i em strong code br a span ul ol li p kbd sub sup mark small pre` (liste blanche contrôlée par `tools/validate.js`). Un chevron littéral s'écrit `&lt;version&gt;`. Pas de HTML dans `code` ni `cmds[i][0]` (échappés par le moteur).

| `t` | Champs | Usage |
|---|---|---|
| `text` | `html` | Paragraphe |
| `bullets` | `items:[html]` | Liste à puces |
| `code` | `code`, `lang`, `file?`, `caption?` | Code/YAML/INI/JSON/console (texte brut). Lignes `# …` grisées (sauf `lang: 'console'` où `$ ` et `# ` sont des invites non copiées) |
| `cmds` | `items:[[cmd, html]]` | Paires commande / explication |
| `table` | `head:[html]`, `rows:[[html]]` | Tableaux |
| `compare` | `left:{title,items}`, `right:{title,items}`, `verdict?` | Deux colonnes |
| `callout` | `kind`, `html`, `title?` | `tip` 💡, `warn` ⚠️, `trap` 🪤, `note` 📝, `awx` 🔄 (AWX / automation controller) |
| `flow` | `nodes:[string \| {label, sub?, hl?}]`, `caption?` | Chaîne horizontale |
| `layers` | `items:[{name, desc, hl?, base?}]` | Pile de couches |
| `diagram` | `html` (SVG), `caption?` | Schéma SVG responsive (`viewBox`, couleurs en variables CSS) ; ni script, ni `on…=` ; **nom accessible obligatoire** (voir modèle ci-dessous) |
| `img` | `file` (`assets/img/<fichier>`), `alt`, `caption?` | Image déclarée dans `assets/img/images.json` ; `alt` descriptif neutre |
| `gallery` | `items:[{t:'img', file, alt, caption?, decorative?}]` | Rangée de petites images (pictogrammes d'une slide) ; chaque item est un `img` déclaré dans `images.json`. Un pictogramme purement décoratif porte `decorative: true` et `alt: ''` ; sinon `alt` décrit l'image (nom du logo…) |
| `lab` | `title`, `goal?`, `steps:[html]` | Exercice à cocher |
| `reveal` | `label?`, `html` | Contenu masqué (solution d'un exercice) |
| `quiz` | `q`, `options` (3-4), `answer`, `explain`, `ref` | QCM, **uniquement** sur une slide `extra: true` |

### Modèle d'un schéma SVG accessible

```html
<svg viewBox="0 0 720 420" role="img" aria-labelledby="mNN-svgK-t" aria-describedby="mNN-svgK-d" xmlns="http://www.w3.org/2000/svg">
  <title id="mNN-svgK-t">Nom court du schéma</title>
  <desc id="mNN-svgK-d">Description textuelle : éléments, flux ou étapes, dans l'ordre de lecture.</desc>
  <defs><marker id="ar-mNN-svgK" …/></defs>   <!-- identifiants uniques (préfixe module + rang) -->
  …
</svg>
```

`tools/validate.js` refuse un `<svg role="img">` sans `aria-labelledby` pointant vers un `<title id>` non vide, ou avec des `id` en double. Les couleurs restent des variables CSS ; pas de `<script>`, de gestionnaire d'événement ni de `href`.

## Règles de conversion PPTX → HTML

1. Une slide PPTX = une slide HTML (`src: [N]`), **sauf** : exercice + solution consécutifs → 1 slide (`lab` + `reveal`, `src: [N, N+1]`) ; série « surlignage progressif » du même code → 1 slide avec `frag`.
2. Texte **verbatim** : aucune reformulation, aucune traduction, coquilles conservées. Seul le découpage en blocs est libre. Les titres peuvent être complétés pour distinguer deux slides au titre identique (« Format INI: » / « Format INI: Example ») : le texte PPTX d'origine reste contenu.
3. Code / YAML / INI / JSON / console → `code` ; listes → `bullets` ; tableaux → `table` ; schémas → `table`, `flow`, `layers` ou `diagram`.
4. Exercices → `lab` ; solution → `reveal` contenant un `code`.
5. Liens : URL complète en `<a href="https://…" target="_blank" rel="noopener">`, texte visible = celui du PPTX. Aucune URL absente du PPTX.
6. Images : `img` + fichier commité dans `assets/img/` et déclaré dans `images.json`.
7. Notes : celles du PPTX, dans `notes` de la slide concernée.
8. Adresses : celles du PPTX ; le contenu additionnel n'introduit aucune IP hors `192.0.2.x`.

## Contenu additionnel (« Bonus HTML »)

Objectifs, « À retenir » et quiz n'existent que dans le HTML (jamais reportés dans le PPTX), sont badgés « Bonus HTML » et **exclus de la parité**.

- **Quantités par module** : 3-5 objectifs, 4-6 « À retenir », 1-3 quiz (3-4 options, une seule bonne réponse défendable).
- **Source** : dérivé **uniquement** du contenu du module. Chaque objectif, point « À retenir » et quiz porte `ref: [N, …]` (slides PPTX du **même** module). Aucune commande, option, module Ansible, comportement ou version absent du PPTX.
- **`<code>`** d'un texte additionnel : doit apparaître dans le texte PPTX (slides + notes) des slides `ref` (vérifié par test).
- **Options de quiz : mise en forme identique pour toutes** (aucune en `<code>`, y compris la bonne réponse) afin que la forme ne révèle jamais la réponse ; le `<code>` reste permis dans l'énoncé `q` et dans `explain`.
- **Langue** : français ; termes techniques et identifiants dans leur forme d'origine.
- **Objectifs** : à l'infinitif, mesurables (« Écrire… », « Comparer… »). **À retenir** : des faits issus des slides, pas de conseil nouveau.
- **Quiz** : distracteurs plausibles mais faux selon le module ; `explain` obligatoire et cite la slide source (« cf. slide 14 ») ; une slide `extra: true` par quiz, en fin de module.
- **Interdits** : nom d'organisation, nom d'hôte/domaine réel, IP hors `192.0.2.x`, avis absent du PPTX, version différente de `reference_version` (`.claude/project-config.json`).
- Étalon de ton et de longueur : le module pilote `m02-inventory.js`.

## Anti-fuite (dépôt public)

- Aucune référence à l'organisation d'origine (nom, acronymes, domaines, logos), y compris dans les `alt`, les images (pixels et métadonnées PNG) et les commentaires.
- Contrôle : `python3 tests/site/check_site.py` sur les fichiers **suivis** du site (`index.html`, `assets/`, `modules/`, `CONVENTIONS.md`). Avec les motifs complets : `LEAK_PATTERNS="$(cat leak_patterns.txt)" python3 tests/site/check_site.py --require-secret` **avant chaque push** (jamais le texte trouvé dans les logs).
- Aucun push avant le GATE pilote.

## Outils

| Commande | Rôle |
|---|---|
| `node tools/validate.js [fichier.js…]` | schéma des modules, `plan.js`, `i18n`, `index.html`, images ; sans argument : contrôle global |
| `node tools/sync-meta.js [--check] [--version X.Y.Z] [--date JJ/MM/AAAA]` | génère / contrôle `assets/meta.js` depuis `project-config.json` |
| `node tools/dump-course.js [--extras]` | `build/course.json` (entrée de la parité) ; `--extras` : `build/extras-review.md` (relecture humaine) |
| `node tools/package.js` | `build/Ansible-Training-HTML.zip` déterministe : fichiers suivis de `index.html`, `assets/`, `modules/` **et** `Ansible Training.pptx` à la racine (le lien de téléchargement de l'accueil reste valable) ; refuse si ces chemins ont des modifications non commitées |
| `python3 tools/check_links.py --offline` / `--online` | forme des URL (tests) / vérification HTTP à débit limité (jamais en CI) |
| `python3 -m unittest discover -s tests/site` | tests du site (parité, contenu additionnel, livraison, outils) |

## Version et date

La version et les versions de référence affichées sur l'accueil viennent de `assets/meta.js` (jamais saisies à la main). À la release, `node tools/sync-meta.js --version X.Y.Z --date JJ/MM/AAAA` est lancé dans le même commit que la slide 2 du PPTX.
