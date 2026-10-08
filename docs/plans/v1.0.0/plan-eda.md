# Plan du module Event-Driven Ansible (m14)

> Issue : #6 (plan EDA). Implémentation : #7 (PPTX), #8 (HTML), #9 (exemples et lab).
> Milestone : v1.0.0, branche `milestone/v1.0.0`.
> Source : plan d'implémentation rev. 2 (`_work/reports/planner-20261008-101154.md`, section 4.2) et plan de contenu détaillé (`_work/reports/planner-20261008-100018.md`, section 2.2).
> Rédigé le 2026-10-08. Version générique : aucune référence à l'organisation d'origine.
>
> **Statut : réalisé (lot 2).** Contenu E1-E31 livré en PPTX (slides 193-223) et en HTML (m14), validé au C3 du lot 2 (QA addendum 2, HEAD `9135394`). Valeurs réelles : m14 193-223, m15 224-233, m16 234-257, m17 258-264 ; slides masquées 234, 251, 258 ; 264 slides ; image `s250-1.png` ; zip HTML de 71 fichiers. Le lab testé sur un poste avec Java reste une procédure manuelle à faire par l'utilisateur (`tests/procedures/labs/eda/lab-teste.md`).

---

## 1. Décisions retenues (GATE 2)

| Question | Décision | Conséquence |
|---|---|---|
| Position du module | **Après m13 Execution Environments** (insertion au milieu du support, après m12) | Renumérotation outillée (`tools/renumber.py`) au lot 2 |
| Langue des slides PPTX | **Anglais** | Cohérent avec le corps du support ; le site fr/en (#51) affiche les slides verbatim |
| Agenda | **Day 4** (coupe C : m14 ouvre le Day 4) | Formation sur 4 jours. Day 3 = m11, m12, m13 ; Day 4 = m14, m15, m16, m17. Slide 3 et `day: 'J4'` dans `assets/plan.js` (voir section 12) |
| Rédaction des slides | **Deux passages** : E1-E17 puis E18-E31 | Contrôle intermédiaire entre les deux passages ; même numérotation finale |
| Exemples et lab | **Livrés dans le zip HTML** (`labs/eda/`, `examples/eda/`) | `package.js` embarque ces dossiers ; le zip passe à 71 entrées (voir section 7) |
| Lab | **Webhook local** (`127.0.0.1`) | Pas de service externe nécessaire |
| Contrôle de structure | **stdlib Python** en CI ; lab testé = **procédure manuelle** | Pas de dépendance Java ni `ansible-rulebook` en CI |
| HTML du module (#8) | **Lot 2**, avec les slides (#7) | Parité stricte verte à chaque fin de lot |

## 2. Identité et position

- **Identifiant** : `m14`, titre « Event-Driven Ansible », emoji à choisir (distinct de celui des autres modules).
- **Section PPTX** : « Event-Driven Ansible », insérée entre « Execution Environments » (m13) et « Real Use Case » (m15).
- **Position** : slides **193 à 192+N** (N = 31 prévu, soit environ 193-223), juste après la dernière slide de m13 (slide 192 après le lot 1).
- **Modules décalés au lot 2** : Real Use Case (m15), Best Practices (m16), Automation Integration (m17). Les numéros de slides et les masquées sont recalculés par l'outil, jamais à la main.
- **Lot 1** : l'identifiant `m14` reste réservé et absent de `plan.js`. Le sommaire affiche donc 1 à 13 puis 15 à 17.

## 3. Niveau, durée, public

- Niveau : **intermédiaire**.
- Durée : **environ 2 h**.
- Public : mixte, avec prérequis m11 (collections) et m12 (extensions). m13 (Execution Environments) est utile pour le decision environment.
- Volume : **31 slides PPTX** (cible 25 à 35) et **3 quiz HTML** (Bonus).

## 4. Objectifs pédagogiques

À la fin du module, le participant sait :

1. Expliquer le modèle événementiel : source, règle (condition), action, et ses cas d'usage (remédiation, enrichissement de tickets, réaction à la supervision).
2. Écrire un rulebook (rulesets, `hosts`, `sources`, `rules`) et choisir une source d'événements de la collection `ansible.eda`.
3. Écrire des conditions : opérateurs, `is defined`, correspondance de chaînes, `all` / `any`, `throttle`.
4. Déclencher des actions (`run_playbook`, `run_module`, `run_job_template`, `debug`, `set_fact`, `post_event`) et exploiter `ansible_eda.event` dans un playbook.
5. Exécuter et déboguer un rulebook avec `ansible-rulebook`, et le packager dans un decision environment.

## 5. Plan des slides (E1 à E31)

| Partie | Slides | Contenu |
|---|---|---|
| Introduction | E1-E5 | E1 titre de section. E2 pourquoi l'événementiel (planifié vs réactif, cas d'usage). E3 architecture source → rulebook → action (schéma). E4 composants : `ansible-rulebook`, collection `ansible.eda`, decision environment, EDA controller (callout générique AWX / AAP). E5 installation : Java requis, `pip install ansible-rulebook`, `ansible-galaxy collection install ansible.eda` |
| Rulebooks | E6-E7 | E6 anatomie d'un ruleset (`name`, `hosts`, `sources`, `rules`). E7 premier rulebook (webhook → `debug`) |
| Sources | E8-E11 | E8 panorama (`ansible.eda.webhook`, `range`, `generic`, `kafka`, `alertmanager`, `url_check`, `file_watch`, `journald`). E9 webhook (host, port, token ou HMAC). E10 `range` et `generic` pour tester, filtres d'événements (`ansible.eda.json_filter`, `insert_hosts_to_meta`). E11 structure d'un événement (`event.payload`, `event.meta`) |
| Conditions | E12-E17 | E12 bases (`condition: event.payload.status == "down"`). E13 opérateurs (`==`, `!=`, `<`, `>`, `and`, `or`, `in`, `contains`, `is defined`). E14 chaînes (`is match`, `is search`, `is regex`) et `selectattr`. E15 `all` / `any` / `not_all` et corrélation (`events.m_0`). E16 faits et variables (`fact.`, `vars.`, `--vars`, `--env-vars`). E17 `throttle` (`once_within`, `once_after`, `group_by_attributes`) |
| Actions | E18-E22 | E18 panorama (`run_playbook`, `run_module`, `run_job_template`, `run_workflow_template`, `debug`, `print_event`, `set_fact`, `retract_fact`, `post_event`, `shutdown`, `none`). E19 `run_playbook` avec `extra_vars` et `ansible_eda.event` dans le playbook. E20 `run_module`. E21 actions multiples (`actions:`) et chaînage par `post_event`. E22 `run_job_template` avec le controller (callout AWX) |
| ansible-rulebook | E23-E27 | E23 CLI (`ansible-rulebook -r rulebook.yml -i inventory.yml --verbose`, `--vars`, `--env-vars`, `--print-events`). E24 débogage (`-v` / `-vv`, `print_event`). E25 decision environment (EE dédié, construit avec `ansible-builder`, renvoi vers m13). E26 EDA controller : projet, decision environment, activation de rulebook (générique). E27 bonnes pratiques (playbooks idempotents, `throttle`, webhook sécurisé, logique dans les playbooks) |
| Lab | E28-E30 | E28 énoncé : webhook → remédiation (redémarrage d'un service simulé). E29 test avec `curl` vers `127.0.0.1:5000`. E30 solution (rulebook + playbook) |
| Synthèse | E31 | Liens vers la documentation officielle |

Le module est une suite de slides, sans renvoi à une autre slide par numéro. Les slides qui citent un numéro de slide (`ref`, obsolescence) seront traitées par `tools/renumber.py` au lot 2 (section 8).

## 6. Quiz HTML (Bonus, 3 questions)

1. Sources et structure d'un rulebook.
2. Conditions : `all`, `any` et `throttle`.
3. Actions : `run_playbook` contre `run_job_template`.

Règles de rédaction des quiz (CONVENTIONS) : options de longueur voisine, pas de `<code>` dans les options, réponses réparties. Chaque quiz doit correspondre à une notion présente dans les slides (contrôle `test_extras`).

## 7. Lab et exemples

- **`labs/eda/`** : énoncé et solution du lab E28-E30 (webhook → remédiation).
- **`examples/eda/`** : rulebooks et playbooks d'exemple, avec des noms neutres (`my_namespace`, `example.com`, `127.0.0.1`).
- **Livraison** : `labs/eda/` et `examples/eda/` sont embarqués dans le zip HTML par `package.js`. Le zip passe de 52 à **71 entrées** : 1 fichier pour le module (`modules/m14-event-driven-ansible.js`, quiz compris, aucune image nouvelle), 14 fichiers dans `examples/eda/` (10 rulebooks, `remediate.yml`, `inventory.yml`, `vars.yml`, README) et 4 fichiers dans `labs/eda/` (README, inventaire, `solution/rulebook.yml`, `solution/remediate.yml`).
- Contrôle CI : test de structure (YAML et stdlib Python uniquement). Le lab n'est pas exécuté en CI (Java 17+ et `ansible-rulebook` absents). Le critère « lab testé » (#9) relève d'une **procédure manuelle** avec un webhook local sur `127.0.0.1`.

## 8. Procédure d'insertion (lot 2)

Toute insertion de slides suit la procédure du lot 1 (process #5, section « Livraison PPTX + HTML » de CONVENTIONS.md). La rédaction se fait en **deux passages** : E1-E17 d'abord, puis E18-E31 après contrôle intermédiaire, sans renuméroter entre les deux passages.

| Étape | Qui | Contenu | Point de contrôle |
|---|---|---|---|
| P2 | dev-slides | N gabarits de slides (titre seul, layouts définitifs, en anglais), section « Event-Driven Ansible », `app.xml` | `check_pptx.py` vert ; ouverture PowerPoint par l'utilisateur |
| P3 | course | `tools/renumber.py --check`, relecture de `build/renumber-plan.md`, puis `--apply`, commit « chore: renumérotation après insertion m14 » | C2 : obsolescence `LOTS_STRICT=1` verte, parité, `test_extras`, `slide_index` synchro, `validate.js` 0 erreur |
| P4 | dev-slides | Rédaction du contenu E1-E31, slide 3 (agenda) | C3a : obsolescence verte, anti-fuite |
| P5 | course | `modules/m14-event-driven-ansible.js`, entrée `plan.js` m14, `index.html`, quiz | C3 : parité stricte sur 17 modules, revue visuelle |

Garde-fous de `tools/renumber.py` : insertions seules, idempotence (`slide_index.json`), écriture atomique, arbre propre, motifs de code stricts, contrôle après coup du texte des slides décalées.

Valeurs réelles après le lot 2 (calculées par l'outil, jamais saisies à la main ; identiques aux valeurs attendues) :

| Élément | Valeur |
|---|---|
| m14 Event-Driven Ansible | slides 193-223 (N = 31, insertion après la slide 192) |
| m15 Real use case | slides 224-233 |
| m16 Best practices | slides 234-257 |
| m17 Automation integration | slides 258-264 |
| Slides masquées | 234, 251, 258 |
| Total | 264 slides |
| Image décalée | `s219-1.png` → `s250-1.png` (slide 219 devient 250) |
| Zip HTML | 71 fichiers (module m14, `examples/eda/`, `labs/eda/`) |

Les deux passages n'ajoutent pas de slide : le total de 264 correspond à N = 31 quel que soit le découpage.

**Progression** : le lot 2 ne change pas la clé `localStorage` (`ansible-training-v2`, décidée au lot 1).

## 9. Vérification technique à la date de rédaction

Chaque point technique du module doit être vérifié **à la date de rédaction du contenu** dans la documentation officielle de `ansible-rulebook` et de la collection `ansible.eda`, puis consigné dans le handoff (URL et date) :

- noms et options des sources et des actions (`ansible.eda.*`) ;
- syntaxe des conditions et des opérateurs ;
- options de `throttle` ;
- options de la CLI `ansible-rulebook` ;
- prérequis Java et version minimale ;
- noms d'images et de decision environments communautaires.

Les formes dépréciées ne doivent pas apparaître (test d'obsolescence, à définir au lot 2).

## 10. Critères d'acceptation (#6)

- [x] Objectifs pédagogiques (5) et plan E1-E31 validés au GATE 2.
- [x] Niveau intermédiaire, durée environ 2 h, 3 quiz.
- [x] Position fixée : après m13, avant m15 ; id `m14` ; langue anglaise pour les slides.
- [x] Procédure d'insertion (section 8) et rappel de vérification technique (section 9).
- [x] Aucune référence à l'organisation d'origine.

## 11. Risques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Renumérotation incomplète au lot 2 | Moyen | Élevé | `tools/renumber.py` (motifs stricts, contrôle de texte), C2 avant rédaction |
| Contenu EDA obsolète (options, noms de sources) | Moyen | Moyen | vérification datée (section 9), tests d'absence de formes dépréciées |
| Day 4 chargé (m14 à m17 sur une seule journée) | Certain | Moyen (pédagogique) | signalé à l'utilisateur ; décision de formateur (survol, lecture en autonomie) |
| Lab non testable en CI | Élevé | Moyen | test de structure YAML en CI ; procédure manuelle pour « lab testé » |
| Fuite de références internes dans les exemples | Faible | Élevé | noms neutres, `check_pptx.py`, `check_site.py` |

## 12. Impact sur l'agenda (slide 3)

Agenda à 4 jours (coupe C) :

- **Day 3** : Roles and Galaxy, Strategies, Extend Ansible, Write a Module, Execution Environments (m11, m12, m13 ; `day: 'J3'`).
- **Day 4** : Event-Driven Ansible (m14, `day: 'J4'`), Real Use Case (m15), Best Practices (m16), Automation Integration (m17).

Le Day 4 ouvre avec m14 ; le Day 3 n'est plus surchargé par le module EDA. La slide 3 doit afficher ces deux colonnes : revue visuelle obligatoire pour le débordement éventuel de la colonne Day 4. Le sommaire du site affiche les modules m14 à m17 au Jour 4.
