# Glossaire fr / en : Bonus HTML

> **Usage** : référence des agents et des relecteurs pour écrire et relire la version anglaise du Bonus HTML
> (objectifs, « À retenir », quiz, tagline, notes ajoutées). Le glossaire est volontairement léger : il fixe les
> termes qui reviennent, pas la traduction mot à mot.
> **Portée** : le texte des slides (verbatim du PPTX, déjà en anglais) n'est **jamais** traduit ni reformulé.
> **Sources du vocabulaire** : documentation officielle (https://docs.ansible.com/), slides du support, Bonus français
> actuel (`modules/*.js`), libellés de l'interface (`assets/i18n/fr.js`) et `CONVENTIONS.md`.

## 1. Règles de terminologie

1. **Règle `<code>`** : tout identifiant écrit dans `<code>…</code>` (mot-clé, module, option, variable, commande,
   fichier, clé YAML, nom de collection) est **identique en français et en anglais**. On ne traduit jamais le contenu
   d'un `<code>` ; on traduit seulement la phrase autour.
2. **Termes Ansible laissés en anglais dans le français** : le Bonus français garde la forme anglaise des concepts
   propres à Ansible (`playbook`, `handler`, `facts`, `tags`, `template`, `lookup`, `callback`, `Vault`, `rulebook`…).
   La version anglaise utilise donc simplement le même mot : aucune traduction à choisir.
3. **Termes courants francisés** dans le Bonus (inventaire, rôle, tâche, hôte, groupe, variable, boucle, filtre,
   stratégie) : forme anglaise = terme de docs.ansible.com (colonne « English »).
4. **Un terme, une forme** : dans un même module, ne pas alterner deux traductions (« tâche » = toujours `task`).
5. **Majuscules** : noms de produits et de projets avec leur casse officielle (Ansible, Ansible Galaxy, AWX,
   Podman, Docker, EDA controller) ; concepts en minuscules (playbook, role, inventory).
6. **Verbatim** : un champ qui reprend le PPTX (`title`, `bullets`, `code`, `table`, `notes`…) n'est jamais traduit :
   il est déjà en anglais. Seuls les champs Bonus (`tagline`, `objectives`, `takeaways`, quiz `q` / `options` /
   `explain`) et les libellés d'interface ont une version par langue.
7. **Références aux slides** : `ref` et les « cf. slide N » restent identiques ; seul le texte autour change.
8. **Aucune référence à l'organisation d'origine** (nom, domaine, outil interne) dans le glossaire ni dans les exemples.

## 2. Termes

« Règle » : **garder** = même mot dans les deux langues ; **traduire** = traduction du tableau ; **`<code>`** = identifiant
à ne jamais traduire.

### Concepts de base

| Français (Bonus) | English | Règle | Exemple court |
|---|---|---|---|
| playbook | playbook | garder | Un playbook décrit ce qu'Ansible fait → A playbook describes what Ansible does |
| play | play | garder | Un play associe des hôtes à des tâches → A play maps hosts to tasks |
| tâche | task | traduire | Chaque tâche appelle un module → Each task calls a module |
| handler | handler | garder | Un handler ne s'exécute que s'il est notifié → A handler runs only when notified |
| inventaire | inventory | traduire | Un inventaire liste les hôtes gérés → An inventory lists the managed hosts |
| hôte, nœud géré | host, managed node | traduire | Les hôtes sont organisés en groupes → Hosts are organized into groups |
| groupe | group | traduire | Un hôte peut appartenir à plusieurs groupes → A host can belong to several groups |
| nœud de contrôle | control node | traduire | Ansible s'exécute depuis le nœud de contrôle → Ansible runs from the control node |
| module | module | garder | `<code>ansible.builtin.copy</code>` est un module → `ansible.builtin.copy` is a module |
| plugin | plugin | garder | Les plugins étendent Ansible → Plugins extend Ansible |
| rôle | role | traduire | Un rôle regroupe tâches, variables et fichiers → A role bundles tasks, variables and files |
| collection | collection | garder | Une collection distribue rôles, modules et plugins → A collection ships roles, modules and plugins |
| idempotence, idempotent | idempotence, idempotent | traduire | Un module idempotent ne change rien au second passage → An idempotent module changes nothing on the second run |

### Variables, données et logique

| Français (Bonus) | English | Règle | Exemple court |
|---|---|---|---|
| variable | variable | traduire | Une variable peut être définie à plusieurs niveaux → A variable can be defined at several levels |
| facts | facts | garder | Les facts décrivent l'hôte distant → Facts describe the remote host |
| template | template | garder | Un template Jinja2 produit un fichier → A Jinja2 template renders a file |
| filtre | filter | traduire | Un filtre transforme une valeur → A filter transforms a value |
| lookup | lookup | garder | Un lookup lit une donnée sur le nœud de contrôle → A lookup reads data on the control node |
| condition | conditional | traduire | `<code>when</code>` pose une condition → `when` adds a conditional |
| boucle | loop | traduire | `<code>loop</code>` répète une tâche → `loop` repeats a task |
| tags | tags | garder | Les tags permettent de n'exécuter qu'une partie → Tags let you run only part of a play |
| Vault | Vault | garder | Vault chiffre les secrets → Vault encrypts secrets |
| délégation | delegation | traduire | `<code>delegate_to</code>` exécute la tâche sur un autre hôte → `delegate_to` runs the task on another host |
| élévation de privilèges | privilege escalation | traduire | `<code>become</code>` élève les privilèges → `become` escalates privileges |

### Exécution

| Français (Bonus) | English | Règle | Exemple court |
|---|---|---|---|
| stratégie (d'exécution) | strategy | traduire | La stratégie `<code>free</code>` ne synchronise pas les hôtes → The `free` strategy does not keep hosts in step |
| forks | forks | garder | Les forks fixent le parallélisme → Forks set the parallelism |
| mode vérification | check mode | traduire | Le mode vérification simule sans modifier → Check mode simulates without changing anything |
| exécution asynchrone | asynchronous execution | traduire | `<code>async</code>` lance une tâche longue en arrière-plan → `async` runs a long task in the background |
| callback | callback | garder | Un callback réagit aux événements d'exécution → A callback reacts to run events |
| ansible-core | ansible-core | `<code>` | Version de référence : voir `.claude/project-config.json` → Reference version: see the project config |

### Conteneurs, Galaxy et plateforme

| Français (Bonus) | English | Règle | Exemple court |
|---|---|---|---|
| execution environment (EE) | execution environment (EE) | garder | Un EE est une image conteneur qui sert de nœud de contrôle → An EE is a container image that acts as the control node |
| decision environment | decision environment | garder | Un decision environment exécute les rulebooks → A decision environment runs rulebooks |
| image conteneur | container image | traduire | L'image est construite avec ansible-builder → The image is built with ansible-builder |
| Ansible Galaxy | Ansible Galaxy | garder | Galaxy distribue rôles et collections → Galaxy distributes roles and collections |
| AWX, Automation controller | AWX, automation controller | garder | Le contrôleur exécute les job templates → The controller runs job templates |
| job template | job template | garder | Un job template lance un playbook sur un contrôleur → A job template runs a playbook on a controller |
| ansible-navigator, ansible-builder | ansible-navigator, ansible-builder | `<code>` | Outils en ligne de commande, jamais traduits → Command-line tools, never translated |

### Event-Driven Ansible

| Français (Bonus) | English | Règle | Exemple court |
|---|---|---|---|
| rulebook | rulebook | garder | Un rulebook est une liste de rulesets → A rulebook is a list of rulesets |
| ruleset | ruleset | garder | Un ruleset réunit `<code>sources</code>` et `<code>rules</code>` → A ruleset groups `sources` and `rules` |
| règle | rule | traduire | Une règle associe une condition et une action → A rule links a condition to an action |
| événement | event | traduire | La source produit des événements → The source produces events |
| source (d'événements) | event source | traduire | `<code>webhook</code>` est une source → `webhook` is an event source |
| action | action | traduire | `<code>run_playbook</code>` est une action → `run_playbook` is an action |
| EDA controller | EDA controller | garder | L'EDA controller gère les activations de rulebooks → The EDA controller manages rulebook activations |
| activation de rulebook | rulebook activation | traduire | Une activation relie projet, rulebook et decision environment → An activation links a project, a rulebook and a decision environment |

## 3. Style de l'anglais

- **Ton direct**, sans formule d'introduction ni de politesse. Une idée par phrase, phrases courtes (idéalement moins
  de 25 mots).
- **Consignes à l'impératif** (« Write… », « Run… », « List… »), objectifs à l'infinitif de la même manière que le
  français (« Define… », « Compare… », « Use… »).
- **« You »** pour s'adresser à l'apprenant ; éviter « we » et la voix passive quand une forme active existe.
- **Pas de calque du français** : « the playbook permits to » → « the playbook lets you » ; « allows to » n'existe pas
  en anglais standard ; « actually » ne veut pas dire « actuellement » (utiliser « currently »).
- **Termes** : suivre la section 2 ; ne pas inventer de synonymes (« job » ≠ « task » ≠ « play »).
- **Verbes d'objectif mesurables** : define, describe, write, run, list, compare, choose, use. Éviter « understand »,
  « know ».
- **Orthographe** : anglais américain (« organized », « behavior »), cohérent dans tout le site.
- **Ponctuation** : pas d'espace avant `:` `;` `?` `!` (contrairement au français) ; guillemets droits dans les
  chaînes JS, « curly quotes » seulement pour citer une slide.
- **Citations de slides** : conserver le texte exact entre guillemets ; seule la phrase d'explication est écrite par
  nous.

## 4. Règles des quiz en anglais

1. **3 ou 4 options**, une seule bonne réponse défendable, `explain` obligatoire qui cite la slide source
   (« See slide 14 »).
2. **Longueur voisine** : la bonne réponse n'est jamais nettement plus longue que les distracteurs (écart de ±30 % au
   plus, calculé en caractères sur la version anglaise).
3. **Pas de « only » / « just » / « simply » réservés aux mauvaises réponses** (ni de « always » / « never »
   qui trahissent un distracteur).
4. **Aucun `<code>` dans les options** (y compris la bonne réponse) : la forme ne doit pas révéler la réponse ;
   `<code>` reste permis dans l'énoncé `q` et dans `explain`.
5. **L'énoncé ne contient pas le mot de la bonne réponse** (reformuler : « Which key holds the conditions and
   actions? » plutôt que « Which key is `rules`? »).
6. **Bonnes réponses réparties** sur toutes les positions d'un module (pas deux fois la même position).
7. **Mêmes `ref`** que la version française : le quiz anglais est une traduction, pas une nouvelle question.
8. Distracteurs plausibles mais faux **selon le module** ; aucune notion absente des slides citées.

## 5. Checklist de relecture de l'anglais

- [ ] Chaque terme du tableau est employé sous la forme de la section 2.
- [ ] Aucun `<code>` traduit ; aucun champ verbatim modifié.
- [ ] Phrases courtes, impératif pour les consignes, « you ».
- [ ] Quiz conformes à la section 4 (longueurs, mots devinables, positions).
- [ ] `ref` et numéros de slides identiques à la version française.
- [ ] Aucune référence à l'organisation d'origine.
