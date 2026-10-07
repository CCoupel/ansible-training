# Plan d'Implementation : v0.2.0 — Version HTML du support (+ exigence permanente PPTX+HTML, liens docs)

> Planner — 2026-10-07 — ordre `_work/tasks/planner-20261007-122630.md`, **révision 1** : ordre `_work/tasks/planner-20261007-134800.md`
> Révision 1 : abandon de `gh-pages` / `MARKETING/` / `pages.yml` poussant sur une branche. Le site est **écrit à la main et commité** dans la branche de code (`milestone/v0.2.0` → `main`), à l'identique du cours OpenShift (`index.html` racine, `assets/`, `modules/`, `tools/`). Ancienne Q1 retirée, remplacée par la question d'hébergement.
> **Révision 2** : ordre `_work/tasks/planner-20261007-140500.md` — décisions GATE 2 intégrées : Q1 = Pages via Actions à chaque release ; **Q2 = quiz + objectifs + « À retenir »** ; Q3 = slides masquées exclues ; Q4 = interface en français. Voir « Décisions prises ».
> Issues : #3 (architecture HTML), #4 (conversion), #5 (PPTX+HTML à chaque version), #50 (liens docs.ansible.com)
> Version cible : **générique / diffusable** (dépôt PUBLIC) → contrôle des références obligatoire sur PPTX **et** HTML.
> Décisions utilisateur déjà prises (ordre, §Décisions 1-7) : appliquées telles quelles, non reposées.
> Plus aucune décision utilisateur en attente pour planifier (section « Décisions prises »). Reste une confirmation explicite avant l'activation de GitHub Pages (tâche 3.5).

---

## Plan de contenu (remplace les contrats API — cf. `implementation-planner.md`)

### Inventaire du PPTX de référence (`Ansible Training.pptx`, v0.1.1 fond blanc)

| Élément | Valeur | Traitement HTML |
|---|---|---|
| Slides | 223, 26 sections PowerPoint | 15 modules (table ci-dessous) + page d'accueil |
| Slides masquées | 193, 210, 217 | **Exclues** du HTML et de la parité (Q3, décidé) |
| Notes non vides | 12 slides : 12, 29, 35, 36, 37, 38, 43, 63, 66, 67, 108, 111 | champ `notes` de la slide, panneau « Notes du formateur » (touche `n`) |
| Images | 28 : 19 **WMF** (pictos, slides 5, 6, 8, 9) + 9 PNG (slides 4, 49-52, 87, 90, 209) | bloc `img` ; WMF convertis en PNG (hypothèse H3) |
| Tableaux | slides 23, 46, 54 | bloc `table` |
| Graphes/diagrammes | slides 8, 9, 10, 185 (shapes + chart), 186 (SmartArt « Decision TREE ») | blocs `flow` / `layers` / `diagram` (SVG) ; texte du SmartArt lu dans `ppt/diagrams/data*.xml` |
| Liens externes | 74 hyperliens | conservés à l'identique (après correctifs #50) |
| Volume texte | ≈ 12 500 mots, langue d'origine (anglais majoritaire, fragments français) | **non réécrit** (décision 1) ; interface en français (Q4, décidé) |
| Slides 1-3 | couverture, version/date/référence, agenda 2 jours | page d'accueil `#home` (version et références lues dans `assets/meta.js`, généré par `tools/sync-meta.js` depuis `project-config.json` et commité) |

### Découpage en modules (ordre du PPTX conservé, sections fusionnées quand < 7 slides)

| Module | Titre | Sections PPTX | Slides PPTX | Nb | Jour | Spécificités de conversion |
|---|---|---|---|---|---|---|
| m01 | Introduction | Introduction, What is Ansible, How does it Work, Command Line | 4-12 | 9 | J1 | images 4-6, 8-9 (WMF) ; schémas 8-10 → `layers`/`flow` ; notes 12 |
| m02 | Inventory | Inventory | 13-29 | 17 | J1 | **module pilote** ; table 23 ; INI/JSON/YAML → `code` ; notes 29 |
| m03 | Playbooks | Playbooks | 30-43 | 14 | J1 | 34-39 = même playbook surligné pas à pas → 1 slide `code` + `frag` ou 6 slides (règle CONVENTIONS) ; notes 35-38, 43 |
| m04 | Modules | Modules | 44-55 | 12 | J1 | **#50** slide 47 ; captures doc 49-52 (PNG) ; table 54 (IP 192.0.2.x) ; exercice 55 |
| m05 | Variables & facts | Variables | 56-67 | 12 | J1 | exercices 61, 63, 66-67 ; notes 63, 66, 67 |
| m06 | Errors & delegation | Errors, Delegation | 68-81 | 14 | J1 | exercices 75-76, 80-81 (exercice+solution → `lab`+`reveal`) |
| m07 | Filters & conditions | Filters, Conditions | 82-98 | 17 | J2 | images 87, 90 ; exercices 88-89, 97-98 |
| m08 | Loops & tags | Loops, Tags | 99-119 | 21 | J2 | exercices 108-112, 118-119 ; notes 108, 111 |
| m09 | Templates & async | Templates JINJA2, Asynchrone | 120-134 | 15 | J2 | **#50** slide 120 ; Jinja `{{ }}`/`{% %}` dans `code` (échappement) ; exercices 127-128, 133-134 |
| m10 | Vault | Vault | 135-141 | 7 | J2 | exercice 140-141 |
| m11 | Roles, collections & Galaxy | Roles and Galaxy | 142-161 | 20 | J2 | arborescences (146, 148) → `code` ; exercices 151-152, 157-158 |
| m12 | Extend Ansible | Strategies, Extend Ansible, Callback, Modules (2e) | 162-182 | 21 | J2 | **#50** slides 168, 169, 174 ; Python (172, 175-182) → `code lang=python` |
| m13 | Real use case | Real Use Case | 183-192 | 10 | + | schéma 185, SmartArt 186 → `diagram` SVG |
| m14 | Best practices | Best Practices | 193-216 (sans 193, 210) | 22 | + | image 209 ; schémas stratégies 213-214 |
| m15 | Automation integration | Automation Integration | 217-223 (sans 217) | 6 | + | — |
| **Total** | | | 4-223 | **217** non masquées + accueil (1-3) | | |

« J1 / J2 » reprend l'agenda de la slide 3 ; « + » = « Pour aller plus loin » (le PPTX ne place pas 13-15 dans l'agenda). Champ `day` dans `plan.js`.

### Règles de conversion PPTX → blocs (à écrire dans `CONVENTIONS.md`, tâche L1.4)

1. Chaque slide HTML porte `src: [N, …]` (numéros PPTX en ordre de présentation). Une slide PPTX = une slide HTML, **sauf** : exercice + solution consécutifs → 1 slide (`lab` + `reveal`) ; série de slides « surlignage progressif » du même code → 1 slide avec `frag` (le texte est identique, la parité reste vraie).
2. Texte copié **verbatim** (aucune reformulation, aucune traduction, coquilles conservées sauf si corrigées dans le PPTX). Seul le découpage en blocs est libre.
3. Code / YAML / INI / JSON / Python / sortie console → `code` (texte brut, `lang`, `file`). Listes → `bullets`. Paires commande/explication → `cmds`. Tableaux → `table`. Schémas → `flow`/`layers`/`diagram` (SVG `viewBox`, couleurs en variables CSS).
4. Exercices du PPTX → `lab` (étapes = puces de l'exercice) ; solution → `reveal` contenant un `code`.
5. Liens : URL complète conservée en `<a href>` (cible `_blank`, `rel="noopener"`), texte visible = celui du PPTX.
6. Images : `img` avec `alt` descriptif neutre (jamais de nom d'organisation), fichier commité dans `assets/img/`, déclaré dans `assets/img/images.json` (`fichier → slide PPTX, media d'origine, sha256`).
7. Contenu **additionnel** (Q2 décidé : objectifs + quiz + « À retenir ») — règles de rédaction :
   - **Où** : champs de module `objectives` (3 à 5) et `takeaways` (4 à 6) → slides générées par le moteur (« Objectifs » en couverture, « À retenir » en fin de module) ; quiz = slides en fin de module marquées `extra: true` (1 à 3 blocs `quiz` par module, 3-4 options, `answer`, `explain` obligatoire). Tout ce contenu porte le badge « Bonus HTML » et est **exclu de la parité**.
   - **Source** : dérivé **uniquement** du contenu existant du module. Chaque objectif, point « À retenir » et quiz porte `ref: [N, …]` (slides PPTX du **même** module dont il découle). Aucune commande, option, module Ansible ou comportement absent du PPTX ; tout `<code>` d'un texte additionnel doit apparaître dans le texte PPTX des slides `ref` (vérifié par test).
   - **Langue** : français (comme l'interface, Q4), termes techniques et identifiants dans leur forme d'origine (`ansible-playbook`, `become`, `loop`…).
   - **Interdits** : nom d'organisation, nom d'hôte/domaine réel, IP hors 192.0.2.x, avis/opinion non présent dans le PPTX, référence à une version différente de `reference_version`.
   - **Quiz** : distracteurs plausibles tirés des erreurs classiques **illustrées dans le module** (exercices, « errors », best practices) ; `explain` cite la slide source (« cf. slide 35 »).
   - Jamais de modification du texte d'origine des slides pour « faire » un quiz.
8. Adresses IP : 192.0.2.x uniquement (déjà le cas dans le PPTX) ; aucun nom d'hôte/domaine réel nouveau.

---

---

## Arborescence du dépôt et statut des fichiers (révision 1)

Calquée sur le cours OpenShift (`index.html`, `assets/{engine,plan,style}.js|css`, `modules/mNN-sujet.js`, `tools/validate.js`, `CONVENTIONS.md` à la racine, `docs/PLAN.md`). **Le site n'a pas d'étape de build** : les fichiers commités SONT le site (ouvrable en double-clic depuis un clone).

| Chemin | Statut | Commité | Auteur |
|---|---|---|---|
| `index.html` | écrit à la main (coquille + 1 `<script>` par module) | oui | `course` |
| `assets/engine.js`, `assets/style.css` | écrit à la main (porté d'OpenShift) | oui | `course` |
| `assets/plan.js` | écrit à la main (manifeste 15 modules) | oui | `course` |
| `assets/meta.js` | **généré** par `node tools/sync-meta.js` depuis `.claude/project-config.json` (`version`, `reference_version`, date) | **oui** (nécessaire au double-clic) ; test « à jour » bloquant | `course` (outil) ; régénéré par `dev-slides` en même temps que la slide 2 à la release |
| `assets/img/*.png`, `assets/img/images.json` | extraits/convertis une fois du PPTX | oui | `dev-slides` |
| `modules/m01-introduction.js` … `modules/m15-automation-integration.js` | écrits à la main (conversion verbatim) | oui | `course` |
| `tools/validate.js`, `tools/sync-meta.js`, `tools/dump-course.js`, `tools/package.js`, `tools/check_links.py` | écrits à la main | oui | `course` |
| `CONVENTIONS.md` (racine), `docs/PLAN.md` | écrits à la main | oui | `course` (CONVENTIONS), `doc-updater` (PLAN) |
| `build/course.json` | généré (`dump-course.js`, entrée de la parité) | **non** (`build/` ignoré) | outil |
| `build/Ansible-Training-HTML.zip` | généré (`package.js`, déterministe) — asset de release | **non** | CI release |
| `Ansible Training.pptx` | écrit à la main (PowerPoint) | oui (inchangé) | `dev-slides` |
| `tests/site/**`, `tests/procedures/site/**` | écrits à la main | oui | `test-writer` |

Noms de fichiers modules (convention OpenShift `mNN-sujet.js`, kebab-case ASCII) : `m01-introduction`, `m02-inventory`, `m03-playbooks`, `m04-modules`, `m05-variables-facts`, `m06-errors-delegation`, `m07-filters-conditions`, `m08-loops-tags`, `m09-templates-async`, `m10-vault`, `m11-roles-galaxy`, `m12-extend-ansible`, `m13-real-use-case`, `m14-best-practices`, `m15-automation-integration`.

### Conflits / cohabitation à la racine (vérifiés)

| Existant | Constat | Traitement |
|---|---|---|
| `README.md`, `CHANGELOG.md` | coexistent avec le site (même situation qu'OpenShift) | aucun conflit ; README gagne une section « Ouvrir le cours HTML » (doc-updater) |
| `docs/` (`HOMOGENEISATION-OPENSHIFT.md` non suivi, `mockup/`) | aucun fichier du site dans `docs/` | `docs/PLAN.md` ajouté ; `docs/PROCESS-PPTX-HTML.md` ajouté |
| `tests/` (`slides/`, `procedures/`, `INDEX.md`, `METRICS.md`) | aucun conflit | nouveaux `tests/site/`, `tests/procedures/site/` |
| `Ansible Training.pptx` (+ `.orig.pptx` ignoré) | nom avec espace, inchangé | lien de téléchargement depuis l'accueil : `Ansible%20Training.pptx` (relatif) |
| `index.html`, `assets/`, `modules/`, `tools/`, `CONVENTIONS.md` | n'existent pas | créés |
| `.gitignore` | `build/` déjà ignoré ; `MARKETING/` devient inutile (bloc géré par le template : ne pas l'éditer) | aucun changement requis |
| `CLAUDE.md` § Extensibilité (v0.2.0) | mentionne `dist/html/index.html` | à remplacer par `build/Ansible-Training-HTML.zip` (doc-updater, 3.4) |
| `CLAUDE.md` agent `marketing-release` | « site marketing (branche gh-pages) » | sans objet en v0.2.0 (pas de site marketing) ; si hébergement « depuis une branche `main` », ne jamais créer `gh-pages` (signalé) |
| Licence | OpenShift : `LICENSE` MIT (même auteur) ; ce dépôt n'a **aucun** `LICENSE` | conserver l'en-tête MIT dans `engine.js`/`validate.js` portés ; ajout éventuel d'un `LICENSE` au dépôt = décision utilisateur hors périmètre (signalé, non bloquant) |
| GitHub Pages / Jekyll (si hébergement option B) | Jekyll interpréterait `{{ }}`/`{% %}` (Jinja) des `.md` et ignorerait `_*` | `.nojekyll` à la racine requis dans l'option B uniquement |

---

## Maquette

- Type : `ui` + `architecture`
- Brouillons :
  - `_work/mockup/0.2.0/ui/course-site__html-version.html` (accueil, slide de contenu + notes, exercice/solution, quiz, couverture « Objectifs » et « À retenir ») — **mise à jour révision 2** (écran 4 confirmé, écran 5 ajouté)
  - `_work/mockup/0.2.0/architecture/build-publish__html-version.md` — **mise à jour révision 1** (site commité, plus de gh-pages, options d'hébergement)
- Complète / remplace : aucune (`docs/mockup/INDEX.md` vide) ; la version révisée remplace le brouillon précédent (non conservé)
- Contraintes `DECISIONS.md` appliquées : aucune existante ; décisions de l'ordre appliquées (accent bleu Ansible, version depuis `reference_version`, zéro référence organisation, IP 192.0.2.x, site commité dans la branche de code, interface en français, contenu additionnel badgé « Bonus HTML »)

## Résumé

Écrire à la main, dans la branche de code, un site HTML/CSS/JS vanilla calqué sur le cours OpenShift (moteur porté, MIT, même auteur) : `index.html` à la racine, contenu du PPTX v0.1.1 converti **verbatim** en 15 modules `modules/mNN-*.js`, avec traçabilité slide par slide (`src`). Chaque module est enrichi de contenu pédagogique **additionnel** (objectifs, quiz, « À retenir »), dérivé uniquement du contenu existant, badgé « Bonus HTML » et exclu de la parité. Pas de build du site : seuls `assets/meta.js` (version, régénéré et commité) et des artefacts non commités (`build/course.json`, zip de release) sont générés. La parité PPTX ⊂ HTML et le scan anti-fuite **du HTML commité** deviennent bloquants en CI et en release ; la release publie à chaque version le PPTX **et** un zip du site, puis déploie le site sur GitHub Pages via Actions (activation après confirmation de l'utilisateur). Les liens #50 sont corrigés dans le PPTX avant conversion des modules concernés.

## Critères d'Acceptation

**#3 — Architecture**
- [ ] CA-3.1 `CONVENTIONS.md` (racine) documente les choix techniques (vanilla, `file://` double-clic, site commité sans build), le schéma des modules/blocs, les règles de conversion et le statut généré/manuel de chaque fichier.
- [ ] CA-3.2 Navigation : sommaire par jour/module, clavier (← → Home End, `m`, `n`, `t`, `/`), recherche plein texte, ancres `#mNN-k` partageables, progression mémorisée (localStorage, tolérant à l'indisponibilité).
- [ ] CA-3.3 Éléments ludiques définis et rendus : exercices (`lab` à cocher + `reveal` solution), quiz (1-3 par module, score mémorisé et affiché sur « À retenir »), couverture « Objectifs » et slide « À retenir » par module.
- [ ] CA-3.5 Contenu additionnel conforme : 15 modules × (3-5 objectifs, 4-6 « À retenir », 1-3 quiz), chacun avec `ref` vers des slides du module, badge « Bonus HTML », `<code>` ⊂ texte PPTX des `ref` ; revue de contenu (code-reviewer) et relecture humaine signées.
- [ ] CA-3.4 Hébergement (Q1 décidé) : GitHub Pages via Actions (`pages.yml` appelé par `release.yml`), artefact limité au site ; après la release v0.2.0, l'URL publique répond 200 et affiche v0.2.0 ; aucune branche `gh-pages`.

**#4 — Conversion**
- [ ] CA-4.1 Toutes les slides PPTX non masquées 4-223 ont ≥ 1 slide HTML qui les référence (`src`) ; slides 1-3 couvertes par l'accueil.
- [ ] CA-4.2 Les 12 notes non vides sont présentes (`notes`) et affichables.
- [ ] CA-4.3 `test_parity.py` passe en mode strict : texte, notes, liens et images ; exceptions limitées à `tests/site/parity_exceptions.json`, chacune justifiée (cible : < 20 entrées, décoratifs uniquement).
- [ ] CA-4.4 `node tools/validate.js` : 0 erreur ; `node --check` OK sur `assets/*.js`.
- [ ] CA-4.5 Revue visuelle humaine du site signée (procédure `tests/procedures/site/`).

**#5 — Exigence permanente**
- [ ] CA-5.1 Processus documenté (`docs/PROCESS-PPTX-HTML.md` + `CLAUDE.md` § Release et CI) : toute modification de contenu touche PPTX **et** module dans le même commit ; parité bloquante.
- [ ] CA-5.2 `release.yml` : `ARTIFACTS` contient `build/Ansible-Training-HTML.zip|Ansible-Training-HTML-${TAG}.zip` ; le zip est produit depuis l'arbre du tag (`tools/package.js`) ; étape « Contrôles » : cas `*.zip` (anti-fuite sur le HTML commité + parité stricte + version `meta.js` = tag) ; la release publie les deux assets.
- [ ] CA-5.3 Version affichée sur l'accueil HTML (`assets/meta.js`) = version slide 2 PPTX = tag (contrôlé en CI release) ; `meta.js` à jour vis-à-vis de `project-config.json` (contrôlé en CI à chaque push).
- [ ] CA-5.4 Zip déterministe : deux exécutions de `package.js` sur le même commit → sha256 identique.

**#50 — Liens** (inchangé)
- [ ] CA-50.1 Slides 120, 168, 169, 174 : préfixe `docs.ansible.com/ansible/latest/` remplacé par `/projects/ansible/latest/` (texte **et** hyperliens `.rels`), cible vérifiée HTTP 200.
- [ ] CA-50.2 Slide 47 : liens cisco/dnac, cisco/ise, cloud/common vérifiés ; si cible inexistante → remplacés par la page d'index de collection valide la plus proche ou retirés, décision tracée dans le rapport.
- [ ] CA-50.3 Test hors ligne : plus aucune URL `docs.ansible.com/ansible/latest/` dans PPTX ni modules HTML.
- [ ] CA-50.4 Outil de vérification en ligne `tools/check_links.py` à débit limité (non exécuté en CI) et rapport de passe complet.

**Transverse**
- [ ] CA-T.1 Anti-fuite : `check_site.py` (motifs `LEAK_PATTERNS`) passe sur les fichiers **commités** du site (`index.html`, `assets/**`, `modules/**`, `CONVENTIONS.md`) : texte, attributs, métadonnées PNG ; exécuté en CI (motifs génériques sans secret), **bloquant avec secret en release**, et en local avec les motifs complets **avant chaque push**.
- [ ] CA-T.2 Aucun artefact généré non prévu n'est commité (`build/`, zip, `course.json`) ; `assets/meta.js` est le seul fichier généré commité (test).
- [ ] CA-T.3 Tests existants inchangés et verts : `tests/slides/obsolescence` (LOTS_STRICT=1), `tests/slides/anti-fuite`.

## Composants Impactés

- **Contenu PPTX** (`dev-slides`) : liens #50 (slides 47, 120, 168, 169, 174) ; slide 2 + `assets/meta.js` (via `sync-meta.js`) à la release ; extraction/conversion des images.
- **Site HTML** (`course` = instance `generic`) : `index.html`, `assets/`, `modules/`, `tools/`, `CONVENTIONS.md`, `.github/workflows/ci.yml` et `pages.yml` (nouveaux), extension de `release.yml` ; rédaction du contenu additionnel (objectifs, quiz, À retenir).
- **Tests** (`test-writer`) : `tests/site/` (nouveau), `tests/procedures/site/`.
- **Publication** (`deployer`) : release (merge → `main`, tag) ; activation GitHub Pages (source « GitHub Actions ») **après confirmation explicite de l'utilisateur**.
- **Doc** (`doc-updater`) : `generic.course.md` + déclaration agent, `docs/PROCESS-PPTX-HTML.md`, `docs/PLAN.md`, `README.md`, `CHANGELOG.md`, `CLAUDE.md`.
- **Database / API** : sans objet.

---

## Tâches

### Phase 0 : Préparation de l'équipe *(cette session ; aucun spawn)*

0.1 [ ] **Spécification de l'agent `course`** — `doc-updater`
   - Fichiers : `.claude/agents/generic.course.md` (nouveau), `.claude/project-config.json` (`agents.generic[]` += `{ "name": "course", "role": "dev-course" }`), `CLAUDE.md` (table « Agents Disponibles » : ligne `course` | rôle dev-course | `generic.template.md` + `generic.course.md` | permanent ; liste des noms canoniques).
   - Contenu de la spécification (sections imposées par `generic.template.md`) :
     - **Rôle et périmètre** : écrit/maintient le site HTML commité : `index.html`, `assets/**` (hors `assets/img/` livré par `dev-slides`), `modules/**`, `tools/**`, `CONVENTIONS.md`, `.github/workflows/ci.yml`, la partie HTML de `release.yml`, `pages.yml`, et la **rédaction du contenu additionnel** (objectifs, quiz, À retenir) selon la règle de conversion n° 7. **Dérogation explicite** au « tu ne touches pas au code applicatif » du template pour ce périmètre. Ne touche pas au PPTX (`dev-slides`), ni à `tests/` (`test-writer`), ni à README/CHANGELOG/docs (`doc-updater`), ni à la version, et **ne pousse jamais** (push = `deployer`).
     - **Entrées** : plan `_work/handoff/plan-v0.2.0.md`, `CONVENTIONS.md`, maquettes validées `docs/mockup/`, PPTX via `tests/slides/pptx_reader.py` (lecture seule), cours OpenShift `/mnt/c/Users/cyril/Documents/PROJETS/TRAINING/OPENSHIFT` (lecture seule, référence de structure).
     - **Livrables** : commits `feat(site): …` / `docs(course): …` / `ci(site): …` sur `milestone/v0.2.0`, handoff `_work/handoff/course-<ts>.md`, SHA dans le DONE.
     - **Outils et conventions** : Node (stdlib uniquement, aucune dépendance npm), Python stdlib ; pas de LibreOffice ; règles de conversion verbatim ; anti-fuite (aucun nom d'organisation, IP 192.0.2.x) ; `check_site.py` avant chaque commit ; jalons `COURSE EN COURS — module i/15`.
     - **Critères de validation** : `node tools/validate.js` 0 erreur, `node tools/sync-meta.js --check` OK, `python3 -m unittest discover -s tests/site` vert sur le périmètre livré.
     - **Mot-clé de fin** : `COURSE DONE` / `COURSE BLOQUE` / `COURSE EN COURS` (à reporter à l'identique dans `cdp.md` si la table de routage l'exige — TEAMMATES_PROTOCOL §3) ; adresse de retour `team-lead` (piège C3.1).
   - Commit : `chore(agents): spécification de l'agent course (generic)`.
0.2 [ ] **Obtention de l'agent** — teamleader
   - Après DONE de 0.1 : `/end-session` puis `/start-session` → `course` est spawné avec les permanents (instance générique prévue par `/start-session`). Aucun spawn en cours de session.
   - `dev-slides` et `test-writer` (batch 1) peuvent démarrer **avant** le redémarrage ; seules les tâches `course` attendent.

### Phase 1 : Socle *(déblocage : Phase 0 pour `course` ; immédiat pour les autres)*

1.1 [ ] **Liens #50 dans le PPTX** — `dev-slides` (inchangé)
   - Fichier : `Ansible Training.pptx` (slides 47, 120, 168, 169, 174 : texte + `slideN.xml.rels`).
   - Vérification HTTP **par lots espacés** : ≤ 10 requêtes par lot, 1 requête / 6 s, pause 90 s entre lots, sur HTTP 429 respecter `Retry-After` (sinon 120 s) puis reprise, User-Agent explicite, `HEAD` puis `GET` si 405. Total attendu < 15 URL → une passe de ~2 min.
   - Rapport `_work/reports/dev-slides-links-<ts>.md` : URL avant/après, code HTTP, décision pour chaque lien de la slide 47.
   - Contrôles existants verts (`check_pptx.py`, obsolescence LOTS_STRICT). Commit `docs(slides): unifier les liens docs.ansible.com (#50)`.
1.2 [ ] **Extraction des images** — `dev-slides`
   - 9 PNG copiés (métadonnées retirées : chunks tEXt/iTXt/eXIf) ; 19 WMF convertis en PNG ×2 via PowerShell Windows (`System.Drawing.Imaging.Metafile`, poste de dev, hors CI). Échec d'un picto → emoji/SVG équivalent, signalé dans le rapport.
   - Sortie **commitée** : `assets/img/sNN-<k>.png` + `assets/img/images.json` (`fichier`, `slide`, `media_origine`, `sha256`). Commit `feat(site): images extraites du PPTX`.
   - **Revue visuelle humaine #1 avant commit** (le commit devient public au prochain push) : planche de contact `build/img-contact.html` (non commitée) — aucun logo/marquage/texte d'organisation dans les pixels.
1.3 [ ] **Moteur, thème, manifeste, accueil** — `course`
   - Fichiers : `index.html`, `assets/engine.js`, `assets/style.css`, `assets/plan.js`, `assets/meta.js` (généré).
   - Portage du moteur OpenShift avec adaptations : clé localStorage `ansible-training-v1` ; callouts `tip`, `warn`, `trap`, `note`, `awx` (au lieu de cloud/onprem/k8s/ocp) ; nouveaux champs `notes` (panneau, touche `n`), `src` (badge « PPTX · slide N »), `extra` (badge « Bonus HTML ») ; nouveau bloc `img` (`file`, `alt`, `caption`) ; accueil `#home` (couverture + `meta.js` + agenda par `day` + lien relatif vers `Ansible%20Training.pptx`) ; thème bleu clair/sombre conforme à la maquette ; aucune ressource externe (pas de CDN, pas de police distante). Slides générées par module (Q2) : couverture « Objectifs » (titre, emoji, `objectives`) et « À retenir » (`takeaways` + score des quiz du module, mémorisé en localStorage), toutes deux badgées « Bonus HTML » ; quiz : sélection, correction, explication, score (comportement OpenShift).
   - `index.html` : structure OpenShift (sidebar, topbar, slide, footer) ; une ligne `<script src="modules/mNN-….js">` par module livré, ajoutée au fil de la conversion ; `<script src="assets/meta.js">` avant `engine.js`.
   - Manifeste : 15 entrées (`id`, `num`, `emoji`, `title`, `day`) — modules non chargés affichés « à venir ».
1.4 [ ] **Outils et conventions** — `course`
   - `tools/validate.js` : porté + adapté (blocs `img`, champs `notes`/`src`/`extra` ; slides par module 6-24 en avertissement ; `objectives` 3-5 et `takeaways` 4-6 obligatoires (erreur) ; ≥ 1 quiz par module (erreur), ≤ 3 (avertissement), 3-4 options, `explain` obligatoire ; `ref` obligatoire sur objectifs/takeaways/quiz (forme `{ html, ref }` ou objet quiz avec `ref`), slides `ref` ∈ slides `src` du module ; slides de quiz `extra: true` sans `src` ; lab non obligatoire ; `src` obligatoire sur toute slide non `extra`, entiers 4-223, sans doublon inter-modules ; fichiers `img` existants et déclarés dans `images.json` ; liens `href` en https ; cohérence `plan.js` ↔ modules ↔ `index.html` comme OpenShift).
   - `tools/sync-meta.js` : écrit `assets/meta.js` (`version`, `reference_version`, date de livraison) depuis `.claude/project-config.json` ; option `--version X.Y.Z` (release) ; option `--check` (sortie 1 si `meta.js` diffère → utilisé en CI).
   - `tools/dump-course.js` : charge `plan.js` + modules dans un `vm` (comme `validate.js`) et écrit `build/course.json` (entrée de la parité, non commité) ; option `--extras` → `build/extras-review.md` : tout le contenu additionnel par module, avec pour chaque texte ses slides `ref` et leur texte PPTX en regard (support de relecture humaine, non commité).
   - `tools/package.js` : `build/Ansible-Training-HTML.zip` déterministe (entrées triées, dates fixes `1980-01-01`, permissions fixes) contenant **uniquement** `index.html`, `assets/`, `modules/` (le PPTX reste un asset de release séparé) ; Node stdlib (`zlib`).
   - `CONVENTIONS.md` (racine) : schéma, blocs, règles de conversion, statut des fichiers (table « Arborescence »), règles anti-fuite.
1.5 [ ] **Module pilote `modules/m02-inventory.js`** (slides 13-29) — `course`
   - Conversion : listes, code INI/JSON/YAML, table (23), notes (29), liens. Commit `feat(site): module m02 Inventory (#4)`.
   - Contenu additionnel du pilote (commit séparé `feat(site): m02 objectifs, quiz, à retenir`) : il sert d'**étalon** de ton, de longueur et de difficulté pour les 14 autres modules. Jalon `COURSE EN COURS — pilote m02 livré (conversion + bonus)`.
1.6 [ ] **Tests (TDD, depuis ce plan)** — `test-writer` — détail section « Tests Requis ».

**GATE pilote** *(déblocage de la Phase 2)* : `code-reviewer` revoit le socle (1.3-1.5) **et le contenu additionnel de m02** (checklist « Revue de contenu additionnel » ci-dessous) ; `qa` exécute `tests/site` sur m02 ; **revue visuelle humaine #2** du pilote (double-clic sur `index.html` du clone, clair/sombre, largeur mobile) **+ relecture humaine #R1 des objectifs / quiz / À retenir de m02** (`build/extras-review.md`) → corrections du socle et des règles de rédaction (consignées dans `CONVENTIONS.md`) **avant** la conversion de masse. **Aucun push de `milestone/v0.2.0` avant ce GATE** (le dépôt est public : tout push expose le site).

### Phase 2 : Conversion, contenu additionnel et CI *(déblocage : GATE pilote ; m04/m09/m12 : 1.1 terminé ; m01/m07/m14 : 1.2 terminé)*

2.1 [ ] **Conversion + contenu additionnel des modules** — `course` — par module, **deux commits** : (1) conversion verbatim `feat(site): module mNN <titre> (#4)` avec la ligne `<script>` d'`index.html` ; (2) bonus `feat(site): mNN objectifs, quiz, à retenir`. `validate.js` + parité du module + `check_site.py` + tests du contenu additionnel verts avant chaque commit. Un jalon par module (`COURSE EN COURS — module i/15 (mNN) — conversion + bonus`). Charge de rédaction : 14 modules × (3-5 objectifs + 4-6 À retenir + 1-3 quiz) ≈ 130 à 200 textes courts. À la fin de chaque lot : `course` régénère `build/extras-review.md` et le signale dans son jalon. Ordre :
   - Lot A : m03, m05, m06, m08, m10, m11 (aucune dépendance)
   - Lot B : m01, m07, m14 (images 1.2), m13 (SVG 185/186)
   - Lot C : m04, m09, m12 (liens #50 — 1.1), m15
2.2 [ ] **Workflows** — `course` (après le lot A)
   - `.github/workflows/ci.yml` (nouveau) : push `milestone/**` + PR vers `main` : `node --check assets/*.js`, `node tools/validate.js`, `node tools/sync-meta.js --check`, `node tools/dump-course.js`, `python3 -m unittest discover -s tests/site`, tests `tests/slides`, `check_site.py` sur les fichiers commités (motifs génériques sans secret : non bloquant sur l'absence de secret, comme `check_pptx.py` en local). Permissions `contents: read`, actions épinglées par SHA.
   - `.github/workflows/release.yml` (#5, additif) : `ARTIFACTS` += `build/Ansible-Training-HTML.zip|Ansible-Training-HTML-${TAG}.zip` ; étape « Construire le zip HTML » avant « Contrôles » (`node tools/package.js`) ; nouveau cas `*.zip)` : `check_site.py` **avec** `LEAK_PATTERNS` sur l'arbre commité du tag **et** sur le contenu dézippé, `test_parity.py` strict (`PARITY_STRICT=1`), `meta.js` version = tag. Garde-fou tag-sur-main et contrôle slide 2 inchangés.
   - `.github/workflows/pages.yml` (Q1 décidé) — calqué sur OpenShift (`workflow_dispatch` + `workflow_call` depuis `release.yml`) : validate, parité, `check_site.py` avec secret (absent → échec), artefact limité à `index.html`, `assets/`, `modules/` (+ `Ansible Training.pptx` pour le lien de téléchargement), `actions/configure-pages` / `upload-pages-artifact` / `deploy-pages` épinglés par SHA. Aucune branche `gh-pages`. Ne s'exécute pas tant que Pages n'est pas activé (3.5) : `release.yml` appelle `pages.yml` seulement si la variable de dépôt `PAGES_ENABLED` vaut `true` (posée par `deployer` à l'activation) — la release v0.2.0 ne dépend donc pas de l'activation.
   - `tools/check_links.py` : extraction de toutes les URL (PPTX + `build/course.json`), mode `--offline` (forme, utilisé par les tests) et `--online` débit limité (mêmes paramètres que 1.1, reprise via fichier d'état dans `build/`). Jamais en CI.
2.3 [ ] **Revue de contenu additionnel par lot** — `code-reviewer`, à la fin de chaque lot A, B, C (en parallèle du lot suivant de `course`) : checklist « Revue de contenu additionnel » ; retours → corrections par `course` dans le lot suivant.

### Phase 3 : Validation, documentation, release *(déblocage : Phase 2 terminée)*

3.1 [ ] Revue de code complète — `code-reviewer` (moteur, outils, workflows — sécurité : injection HTML des champs bruts, permissions des workflows, logs anti-fuite).
3.2 [ ] QA — `qa` : `tests/site` strict, `tests/slides` (LOTS_STRICT=1), zip déterministe (2 exécutions, sha256 identiques), `check_site.py` avec motifs complets locaux, `check_links.py --online` en lots espacés (~74 URL → ≈ 12 lots, ≈ 25 min) ; procédures manuelles `tests/procedures/site/`.
3.3 [ ] **Revue visuelle humaine #3 (finale)** — utilisateur : 15 modules clair/sombre, mobile, images, notes, exercices, quiz, couvertures et « À retenir », accueil/version ; slides PPTX modifiées (47, 120, 168, 169, 174) dans PowerPoint (pas de LibreOffice).
3.3b [ ] **Relecture humaine #R2 du contenu additionnel** — utilisateur, sur `build/extras-review.md` (14 modules hors pilote, ≈ 130-200 textes ; ≈ 1 h 30 à 2 h) : exactitude, absence d'invention, ton ; corrections par `course`, puis nouveau passage de `tests/site`. Peut être fractionnée par lot (A/B/C) si l'utilisateur le souhaite, en parallèle de la conversion.
3.4 [ ] Documentation — `doc-updater` : `docs/PROCESS-PPTX-HTML.md` (#5 : un changement de contenu = PPTX + module dans le même commit, `sync-meta` à la release, parité, exceptions, liens à débit limité, check anti-fuite local avant push), `docs/PLAN.md` (modules, jours, durées), `README.md` (ouvrir le cours : URL GitHub Pages / clone + double-clic / zip de release), `CHANGELOG.md` (0.2.0), `CLAUDE.md` § Release et CI (zip HTML, plus de `dist/html`, `pages.yml`, variable `PAGES_ENABLED`), `project-config.json` (`commands.*`, `testing.components`).
3.5 [ ] Release v0.2.0 — `dev-slides` : slide 2 (v0.2.0, date) **et** `node tools/sync-meta.js --version 0.2.0` dans le même commit ; `deployer` : push, merge `milestone/v0.2.0` → `main`, tag `v0.2.0`, vérification release (2 assets) ; **activation de GitHub Pages après confirmation explicite de l'utilisateur** (dépôt public) : `gh api -X POST repos/{owner}/{repo}/pages -f build_type=workflow`, variable `PAGES_ENABLED=true`, puis `gh workflow run pages.yml` (ou relance via la release) ; vérification : URL 200, version affichée = v0.2.0, pas de 404 (`tests/procedures/site/hebergement.md`). Refus de l'utilisateur → release livrée sans hébergement, aucun autre impact.

---

## Arbre d'Exécution DEV

> Source de vérité pour le teamleader. Chaque batch = un groupe de SendMessage envoyés dans le même tour.
> Agents DEV du projet : `dev-slides` et `course` (instance `generic`, rôle dev-course, décision utilisateur 2). Jamais dev-backend/frontend/infra.

### Batch 0 — séquentiel (dépendances : aucune)
| Agent | Tâche | Fichiers clés |
|-------|-------|--------------|
| doc-updater | 0.1 Spécification + déclaration de l'agent `course` | `.claude/agents/generic.course.md`, `.claude/project-config.json`, `CLAUDE.md` |
| teamleader | 0.2 `/end-session` puis `/start-session` (spawn de `course`) | — |

### Batch 1 — parallèle (dépendances : Batch 0 pour `course` uniquement)
| Agent | Tâche | Fichiers clés |
|-------|-------|--------------|
| dev-slides | 1.1 Liens #50 (lots espacés) puis 1.2 extraction images (revue visuelle #1 avant commit) | `Ansible Training.pptx`, `assets/img/` |
| course | 1.3 moteur/thème/manifeste/accueil → 1.4 outils/CONVENTIONS → 1.5 pilote m02 | `index.html`, `assets/`, `tools/`, `modules/m02-inventory.js`, `CONVENTIONS.md` |
| test-writer | 1.6 Tests `tests/site/` + procédures | `tests/site/`, `tests/procedures/site/` |

### GATE pilote — séquentiel (déblocage : 1.3-1.6 terminés)
| Agent | Tâche | Fichiers clés |
|-------|-------|--------------|
| code-reviewer + qa (parallèle) | Revue du socle + revue du contenu additionnel m02 (checklist) + `tests/site` sur m02 | `assets/`, `tools/`, `modules/m02-inventory.js`, `build/extras-review.md` |
| utilisateur (via teamleader) | Revue visuelle #2 (pilote) + relecture #R1 (objectifs/quiz/À retenir de m02 = étalon) | `index.html` (double-clic), `build/extras-review.md` |

### Batch 2 — parallèle (déblocage : GATE pilote ; lot C : 1.1 ; lot B : 1.2)
| Agent | Tâche | Fichiers clés |
|-------|-------|--------------|
| course | 2.1 lots A → B → C (conversion + bonus, jalon par module) ; 2.2 workflows après le lot A | `modules/*.js`, `index.html`, `.github/workflows/{ci,release,pages}.yml`, `tools/check_links.py` |
| code-reviewer | 2.3 Revue de contenu additionnel à la fin de chaque lot (pipeline : lot N revu pendant que `course` traite le lot N+1) | `modules/*.js`, `build/extras-review.md` |
| utilisateur (via teamleader) | 3.3b Relecture #R2 fractionnée par lot (optionnel, sinon en Phase 3) | `build/extras-review.md` |
| test-writer | Compléments de tests révélés par le pilote ; `parity_exceptions.json` **uniquement sur demande justifiée de `course`** | `tests/site/` |

### Batch 3 — parallèle (déblocage : Batch 2 terminé)
| Agent | Tâche | Fichiers clés |
|-------|-------|--------------|
| code-reviewer | 3.1 Revue complète | tout le périmètre |
| doc-updater | 3.4 Documentation | `docs/`, `README.md`, `CHANGELOG.md`, `CLAUDE.md`, `project-config.json` |
| qa | 3.2 QA complète — **après** le verdict de review (qa_parallelizable: false) | `tests/` |

### Batch 4 — séquentiel (déblocage : Batch 3 + revue visuelle #3 + relecture #R2 + GATE de release)
| Agent | Tâche | Fichiers clés |
|-------|-------|--------------|
| dev-slides | Slide 2 → v0.2.0 + date ; `sync-meta.js --version 0.2.0` (même commit) | `Ansible Training.pptx`, `assets/meta.js` |
| deployer | Push, merge → `main`, tag `v0.2.0`, vérification release (2 assets) ; activation Pages après confirmation utilisateur + vérification du site en ligne | — |

> Plus de tâche `deployer` en batch 1 (l'ancienne 1.7 gh-pages est supprimée). Pas de `security` en batch 1 ; un `/secu` ponctuel sur les workflows avant release reste recommandé (secret `LEAK_PATTERNS`, `contents: write`, `pages: write`, `id-token: write`).

---

## Tests Requis

> Écrits par `test-writer` (nature `feature`), Python stdlib (`unittest`) comme `tests/slides/`. Lisent `build/course.json` (produit par `node tools/dump-course.js`) : jamais de parsing JS en Python.

- [ ] **Unitaires**
  - `tests/site/test_validate.py` : `node tools/validate.js` sur des modules fixtures (`tests/site/fixtures/`) : bloc inconnu, `src` manquant/hors 4-223/doublon, `img` non déclarée, balise HTML non autorisée, `extra` mal formé, `objectives` < 3, `takeaways` < 4, aucun quiz, quiz sans `explain`/`ref`, `ref` hors du module → erreurs ; module valide → 0.
  - `tests/site/test_extras.py` (Q2) : pour chaque module : 3-5 objectifs, 4-6 À retenir, 1-3 quiz, `answer` valide ; chaque `ref` ⊂ `src` du module ; chaque `<code>…</code>` d'un texte additionnel apparaît dans le texte PPTX (slides + notes) des slides `ref` (normalisé) ; aucune IP hors 192.0.2.x ; aucun terme d'une liste de marqueurs d'invention (`ansible-core 2.1[0-9]`, versions ≠ `reference_version`) ; badge `extra` présent sur toute slide de quiz.
  - `tests/site/test_check_site.py` : `check_site.py` détecte un motif dans un `.js` de module, dans `index.html`, dans un `alt`, dans un chunk tEXt PNG ; périmètre par défaut = fichiers **suivis par git** du site (`git ls-files index.html assets modules CONVENTIONS.md`) + option `--dir` (zip dézippé) ; sortie = fichier + n° de motif, **jamais le texte** ; `CI=true` sans secret en mode `--require-secret` → échec.
  - `tests/site/test_meta.py` : `sync-meta.js --check` OK sur l'arbre ; `meta.js` contient `version` et `reference_version` de `project-config.json` ; `--version 9.9.9` dans un répertoire temporaire → `9.9.9`.
  - `tests/site/test_links_offline.py` (#50) : aucune URL `docs.ansible.com/ansible/latest/` dans PPTX (texte + rels) ni `course.json` ; URL HTML ⊂ URL PPTX ; schéma `https`.
- [ ] **Intégration**
  - `tests/site/test_parity.py` : définition section 3 de la maquette d'architecture (texte normalisé, notes, liens, images, slides masquées 193/210/217 exclues (Q3), objectifs / À retenir / slides `extra` exclus, slides HTML sans `src` interdites). `PARITY_STRICT=1` (tous les modules, CI release) / défaut (modules présents seulement, conversion progressive). Messages : n° slide + n° ligne, jamais d'extrait.
  - `tests/site/test_package.py` : `package.js` → zip contenant exactement `index.html`, `assets/**`, `modules/**` ; deux exécutions → même sha256 ; aucune URL externe de `<script>`/`<link>` dans `index.html` ; aucune trace OpenShift (`ocp-course`, `OpenShift`, callouts `k8s`/`ocp`) dans le site.
  - `tests/site/test_repo_hygiene.py` : `git ls-files` ne contient ni `build/`, ni zip, ni `course.json` ; `assets/meta.js` est le seul fichier généré suivi ; chaque `modules/*.js` est chargé par `index.html` (miroir du validateur).
- [ ] **E2E / manuel** (pas de navigateur headless — aucune dépendance npm) :
  - `tests/procedures/site/revue-visuelle.md` : checklist par module, clair/sombre, mobile 375 px, clavier, recherche, double-clic `file://`, accueil/version, lien PPTX, absence de toute référence d'organisation.
  - `tests/procedures/site/hebergement.md` (Q1) : après activation — URL 200, version affichée, pas de 404 sur assets/modules, contenu identique au zip de release.
  - `tests/procedures/site/relecture-bonus.md` (Q2) : grille de relecture humaine #R1/#R2 (exactitude vs slides `ref`, aucune invention, ton, niveau débutant→confirmé, un seul bon choix par quiz, explication utile).
- Composants touchés (clés `testing.components`) : `site`, `slides`, `ci`.
- Tests `smoke` / `critical` : smoke = validate + `sync-meta --check` + parité du pilote ; critical = anti-fuite du HTML commité + parité stricte + version accueil = tag.
- `test_scopes` optionnels : **security** (fuite de références + secret `LEAK_PATTERNS` dans workflows ; `security.concerns` vide → proposer `leak`, `ci-secrets`) ; perf : aucun.

---

## Risques et Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Fuite publique dès le push** : le site étant commité, tout push de `milestone/v0.2.0` expose le HTML (texte, `alt`, images) avant tout contrôle de release | Moyenne | Élevé | `check_site.py` avec motifs complets **en local avant chaque commit/push** (`course`, `qa`) ; pushes réservés à `deployer` ; aucun push avant le GATE pilote ; images validées visuellement (#1) **avant** commit ; CI le détecte au push (motifs génériques) ; release bloquante avec secret |
| Fuite déjà poussée = dans l'historique public | Faible | Élevé | réécriture d'historique + force-push = procédure exceptionnelle déjà vécue en v0.1.0 (f2ea50c) : à éviter par le contrôle local ; à documenter dans `PROCESS-PPTX-HTML.md` |
| Pages (Actions) : publication d'un site non conforme, ou échec de la release si Pages non activé | Faible | Moyen | `pages.yml` refait parité + anti-fuite avec secret ; artefact limité à `index.html`, `assets/`, `modules/`, PPTX ; appel conditionné par `PAGES_ENABLED` ; activation après confirmation utilisateur |
| `assets/meta.js` (généré, commité) désynchronisé de `project-config.json` / slide 2 | Moyenne | Moyen | `sync-meta.js --check` en CI à chaque push ; régénération dans le même commit que la slide 2 ; contrôle version = tag en release |
| Parité trop stricte (artefacts de mise en page) → faux positifs, ou trop lâche → contenu perdu | Élevée | Moyen | Normalisation définie ; exceptions dans un fichier unique justifié, plafond < 20, revues par code-reviewer |
| **Contenu additionnel inexact ou inventé** (quiz, objectifs, À retenir rédigés par un agent) diffusé publiquement comme support de formation | Moyenne | Élevé | Règle n° 7 (dérivé uniquement du PPTX, `ref` obligatoire) ; `test_extras.py` (`<code>` ⊂ PPTX, versions, IP) ; revue code-reviewer par lot (checklist) ; relectures humaines #R1/#R2 avant release |
| **Écart pédagogique PPTX ↔ HTML** : le site propose objectifs/quiz/À retenir absents du support projeté ; un formateur sur PPTX ne les voit pas | Certaine | Moyen | Badge « Bonus HTML » visible ; documenté dans `PROCESS-PPTX-HTML.md` (le bonus suit le contenu : toute modif d'une slide `ref` impose de revoir les textes qui la citent — test : `ref` valides) ; report éventuel dans le PPTX = hors périmètre v0.2.0 |
| **Charge de relecture humaine** (≈ 130-200 textes) retardant la release | Élevée | Moyen | Étalon m02 validé tôt ; `extras-review.md` avec slides sources en regard ; relecture #R2 fractionnable par lot pendant la Phase 2 |
| Bonus obsolète après une évolution du PPTX (#5) | Moyenne | Moyen | `ref` vérifiés par le validateur ; règle « un commit PPTX + module revoit aussi les textes qui citent les slides modifiées » |
| WMF non convertibles hors Windows | Faible | Faible | Conversion one-shot (PowerShell), PNG commités ; repli emoji/SVG |
| SmartArt (186) et schémas en shapes (8-10, 185, 213-214) | Moyenne | Moyen | Lecture `ppt/diagrams/data*.xml` ; `diagram` SVG ; parité texte ; revue visuelle |
| Divergence PPTX/HTML après v0.2.0 (#5) | Élevée sans outillage | Élevé | Parité bloquante en CI et release ; un commit touche les deux ; processus documenté |
| docs.ansible.com 429 | Élevée | Faible | Lots espacés, `Retry-After`, reprise sur état, jamais en CI |
| Traces de branding OpenShift dans le moteur porté | Élevée | Faible | Adaptations listées (1.3) ; test dédié (`test_package.py`) |
| Injection HTML (champs bruts du moteur) | Moyenne | Moyen | Liste blanche de balises du validateur ; `code`/`cmds[0]` échappés ; Jinja seulement dans `code` |
| Licence : moteur MIT porté dans un dépôt sans `LICENSE` | Certaine | Faible | En-tête MIT conservé dans les fichiers portés ; ajout d'un `LICENSE` = décision utilisateur (signalée, hors périmètre) |
| Agent `course` indisponible sans redémarrage | Certaine | Faible | Phase 0 + redémarrage ; batch 1 des autres agents non bloqué |
| Volume (217 slides) → effet tunnel | Élevée | Moyen | Jalon + commit par module, parité incrémentale |
| `release.yml` modifié : régression garde-fou tag-sur-main / slide 2 | Faible | Élevé | Modification additive ; revue ciblée ; pas de tag de test (dépôt public) ; `actionlint` local si disponible |

## Parallélisation Review/QA

- qa_parallelizable: false
- Justification : changement d'architecture (nouveau site commité, outils, workflows avec secret et `contents: write`), scope large (217 slides + contenu additionnel soumis à revue de contenu) — un rejet en review du moteur/de la parité invaliderait la QA ; le GATE pilote fait déjà une passe review+QA parallèle sur un périmètre réduit.

## Estimation

- Complexité : **Élevée** (volume de conversion + rédaction et relecture du contenu additionnel ; socle et CI : moyenne)
- Volume : 217 slides converties + ≈ 145-210 textes additionnels (15 modules × 3-5 objectifs, 4-6 À retenir, 1-3 quiz), dont ≈ 10-14 pour l'étalon m02
- Nombre de fichiers : ~50 (15 modules, ~6 assets + ~28 images, 5 outils, 2-3 workflows, ~10 tests/fixtures, ~7 docs/procédures)

---

## Décisions prises (GATE 2, 2026-10-07)

| # | Question | Décision | Effet dans le plan |
|---|---|---|---|
| Q1 | Hébergement GitHub Pages | **Pages via GitHub Actions à chaque release** (`pages.yml` appelé par `release.yml`, artefact limité au site) | 2.2 `pages.yml`, garde `PAGES_ENABLED` ; 3.5 activation par `deployer` **après confirmation explicite de l'utilisateur** (dépôt public) ; CA-3.4 |
| Q2 | Contenu additionnel | **Quiz + objectifs + « À retenir »** (≠ recommandation initiale « quiz seuls ») | règle de conversion n° 7 ; moteur (couverture/À retenir/score) ; validateur ; 1.5 pilote étalon ; 2.1 (2 commits/module) ; 2.3 revue par lot ; relectures #R1 (GATE pilote) et #R2 ; `test_extras.py` ; CA-3.3/3.5 ; risques ; estimation |
| Q3 | Slides masquées 193, 210, 217 | **Exclues** du HTML ; parité sur les 217 slides de contenu visibles (4-223 hors masquées) | m14 (22 slides), m15 (6 slides), `test_parity.py` lit `expected.json` |
| Q4 | Langue de l'interface | **Français** (contenu des slides inchangé dans sa langue d'origine ; contenu additionnel en français) | libellés `engine.js`/`index.html`, maquette, règle n° 7 |

## Revue de contenu additionnel (checklist code-reviewer — GATE pilote et 2.3)

1. Chaque objectif / À retenir / quiz a un `ref` vers des slides du module, et l'affirmation **se lit** dans ces slides (sinon : invention → rejet).
2. Aucune commande, option, module, paramètre ou version absent du PPTX ; aucun nom d'organisation, d'hôte ou de domaine réel ; IP 192.0.2.x uniquement.
3. Quiz : une seule bonne réponse défendable ; distracteurs plausibles mais faux **selon le module** ; `explain` justifie et cite la slide.
4. Objectifs à l'infinitif, mesurables (« Écrire un inventaire YAML… ») ; « À retenir » = faits, pas de conseils nouveaux.
5. Pas de contradiction avec les notes du formateur ni avec les best practices du module 14.
6. Ton et longueur alignés sur l'étalon m02 validé au GATE pilote.

### Hypothèses (validées avec le plan au GATE 2)
- H1 Modules : 15 modules par fusion de sections ; slides 1-3 → page d'accueil.
- H2 Exercice + solution → une slide HTML (lab + reveal) ; surlignages progressifs du même code → une slide avec fragments.
- H3 WMF → PNG via PowerShell sur le poste Windows, une fois, PNG commités.
- H4 Node et Python **sans dépendance** ; pas d'export PPTX généré (le PPTX reste maintenu à la main, le HTML est contrôlé par parité — sens inverse du cours OpenShift, conformément à la décision 1).
- H5 Workflows écrits par `course` (périmètre étendu dans `generic.course.md`) faute d'agent infra autorisé.
- H6 (révision 1) `assets/meta.js` est généré **et commité** (seul fichier généré suivi) pour que le double-clic affiche la version ; contrôlé par `sync-meta.js --check`.
- Impact Q2 sur H1-H6 : aucun changement ; seule précision sur H4 — le contenu additionnel n'existe **que** dans le HTML (jamais reporté dans le PPTX), d'où son exclusion de la parité.

## Revues et relectures humaines (non automatisables, pas de LibreOffice)

| # | Quand | Quoi | Support |
|---|---|---|---|
| 1 | Fin de 1.2, **avant commit** des images | Aucun logo/marquage/texte d'organisation dans les pixels | `build/img-contact.html` |
| 2 | GATE pilote, **avant tout push** | Socle + m02 : rendu, thème, navigation, notes, mobile | `index.html` (double-clic) |
| 3 | Phase 3, avant GATE de release | Site complet (dont quiz, couvertures, À retenir) + slides PPTX modifiées (#50, slide 2) | `tests/procedures/site/revue-visuelle.md` + PowerPoint |
| R1 | GATE pilote | Relecture du contenu additionnel de m02 (étalon) | `build/extras-review.md` + `tests/procedures/site/relecture-bonus.md` |
| R2 | Phase 3 (ou par lot pendant la Phase 2) | Relecture du contenu additionnel des 14 autres modules (≈ 130-200 textes) | idem |

## Notes

- Révision 1 : supprimés — branche `gh-pages`, worktree `MARKETING/`, `pages.yml` poussant sur une branche, ancienne tâche 1.7 (deployer), `tools/build.js` (remplacé par `sync-meta.js`, `dump-course.js`, `package.js`), ancienne Q1.
- Révision 2 : décisions GATE 2 intégrées (section « Décisions prises ») ; ajout du contenu additionnel (Q2), de la revue de contenu (2.3), des relectures #R1/#R2, de `test_extras.py`, de `relecture-bonus.md` et de la garde `PAGES_ENABLED`.
- Pièges C3 du guide : C3.1 (adresse `team-lead`) rappelé dans `generic.course.md` ; C3.3 (Pages non activé) = Q1 décidé, activation 3.5 ; C3.4 (version de référence unique) = `meta.js` généré depuis `project-config.json` ; C3.5 (gate d'approbation) = GATE 2 + GATE pilote.
- `expected.json` (223 slides, masquées 193/210/217) reste la référence PPTX ; `test_parity.py` le lit (pas de duplication).
- `project-config.json` (3.4, doc-updater) : `commands.lint` = `node tools/validate.js`, `commands.test` = `python3 -m unittest discover -s tests/site && LOTS_STRICT=1 python3 -m unittest discover -s tests/slides/obsolescence`, `commands.build` = `node tools/package.js` ; le champ `version` n'est jamais modifié par les agents DEV.
