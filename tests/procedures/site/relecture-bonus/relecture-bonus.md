# Procédure de Test — Relecture du contenu additionnel « Bonus HTML »

**Version** : 0.2.0
**Date** : [date]
**Testeur** : utilisateur (relecture humaine n° R1 = pilote m02 au GATE pilote ; n° R2 = 14 autres modules, par lot A/B/C ou en Phase 3)

Le contenu additionnel (objectifs, quiz, « À retenir ») est rédigé par un agent et n'existe que dans le HTML.
Les tests automatiques (`tests/site/extras/`) vérifient la forme, les `ref` et que chaque `<code>` figure dans le PPTX ;
ils ne jugent ni l'exactitude, ni le ton, ni la qualité des distracteurs. Cette relecture est le seul garde-fou humain.

## Prérequis

- [ ] `node tools/dump-course.js --extras` exécuté : `build/extras-review.md` (chaque texte avec ses slides `ref` et leur texte PPTX en regard)
- [ ] Tests `tests/site/extras/` verts sur les modules relus
- [ ] Pour R2 : étalon m02 validé en R1 (ton, longueur, difficulté)
- [ ] Durée indicative : R1 ≈ 15 min ; R2 ≈ 1 h 30 à 2 h pour 14 modules (≈ 130 à 200 textes)

## Scénarios

### Scenario 1 — Objectifs (par module)

**Objectif** : chaque objectif est vrai, mesurable et couvert par les slides citées.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Lire chaque objectif et ses slides `ref` en regard | L'objectif se lit dans ces slides ; rien d'ajouté | | |
| 2 | Vérifier la formulation | Verbe à l'infinitif, action mesurable (« Écrire un inventaire YAML… ») | | |
| 3 | Compter | 3 à 5 objectifs ; aucun doublon | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 2 — « À retenir » (par module)

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Pour chaque point, lire les slides `ref` | Le point est un fait présent dans les slides ; pas de conseil nouveau, pas d'avis | | |
| 2 | Chercher commandes, options, modules, versions | Tout élément cité figure dans les slides `ref` ; version = ansible-core 2.20 | | |
| 3 | Chercher contradictions | Aucune avec les notes du formateur ni avec le module 14 (best practices) | | |
| 4 | Compter | 4 à 6 points | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 3 — Quiz (par module)

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Lire la question et les options | Question claire, sans ambiguïté | | |
| 2 | Chercher la bonne réponse | Une seule réponse défendable, conforme aux slides `ref` | | |
| 3 | Examiner les distracteurs | Plausibles mais faux **selon le module** (erreurs classiques illustrées dans le module) ; aucune option « piège » absurde | | |
| 4 | Lire l'explication | Justifie la bonne réponse et cite la slide source (« cf. slide N ») | | |
| 5 | Compter | 1 à 3 quiz par module ; 3 à 4 options | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 4 — Ton, niveau, confidentialité

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Lire un échantillon par module | Français, ton direct, aligné sur l'étalon m02 ; termes techniques en forme d'origine | | |
| 2 | Niveau | Utile à un débutant comme à un confirmé ; ni trivial ni hors programme | | |
| 3 | Chercher noms d'hôtes, domaines, IP, noms d'organisation | Aucun ; IP en 192.0.2.x uniquement | | |
| 4 | Badge | Tout le contenu est badgé « Bonus HTML » dans le site | | |

**Verdict** : [ ] PASS  [ ] FAIL

### Scenario 5 — Module 14 Event-Driven Ansible (R1/R2 du Bonus m14, v1.0.0)

**Objectif** : relire le Bonus du module m14 (sujet technique qui évolue vite : `ansible-rulebook`, collection `ansible.eda`).

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Dans `build/extras-review.md`, lire chaque objectif, À retenir et quiz du module 14 avec ses slides `ref` (193 à 223) | Chaque texte se lit dans les slides citées ; rien d'inventé | | |
| 2 | Vérifier les éléments techniques cités (sources, opérateurs, options de `throttle`, actions, options de ligne de commande, prérequis Java) | Ils figurent dans les slides `ref` ; aucune forme obsolète (`ansible-events`, ancien espace de noms de la collection, `--websocket-address`) | | |
| 3 | Quiz sur `all` / `any` | Une seule bonne réponse ; l'explication rappelle que `all` n'est pas un `and` et que `any` n'est pas un `or` | | |
| 4 | Quiz sur `throttle` ou sur les actions | Les distracteurs sont des erreurs classiques du module (par exemple oublier `group_by_attributes`), pas des pièges absurdes | | |
| 5 | Quiz sur le lab ou l'architecture | Réponse conforme aux slides 220-222 (webhook local `127.0.0.1:5000`, simulation de redémarrage) | | |
| 6 | Cohérence avec le module 13 | Le decision environment est présenté comme un environnement d'exécution pour rulebooks, avec renvoi vers `ansible-builder` (module 13) | | |
| 7 | Confidentialité | Aucune IP hors 127.0.0.1 / 192.0.2.x, aucun nom d'hôte ou de société réel | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

## Criteres de Validation

- [ ] Aucun texte inventé ou inexact (un seul texte inexact = retour à `course` pour correction)
- [ ] Un seul bon choix par quiz, explications utiles
- [ ] Corrections appliquées par `course`, puis `tests/site/extras/` relancé et vert

## Notes de relecture

| Module | Texte (objectif / à retenir / quiz n°) | Problème | Correction demandée |
|--------|----------------------------------------|----------|---------------------|
| | | | |
