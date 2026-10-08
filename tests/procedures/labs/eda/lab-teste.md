# Procédure de Test — Lab EDA « webhook → remédiation » (« lab testé », critère #9)

**Version** : 1.0.0
**Date** : [date]
**Testeur** : utilisateur (poste équipé — Java et `ansible-rulebook` absents de la CI, donc jamais exécuté en CI)

Cette procédure est la seule à **exécuter** le lab. La CI ne vérifie que la structure des YAML
(`tests/site/exemples/test_eda_structure.py`) : elle ne prouve pas que le lab fonctionne.
Elle clôt le critère « lab testé » de #9. À jouer sur la solution livrée dans `labs/eda/solution/`, dans l'état
exact du zip HTML (extraire le zip dans un dossier vide pour ne pas tester un fichier non livré).

## Prérequis

- [ ] Environnement : LOCAL (poste de formation ou VM), Linux ou macOS
- [ ] Java 17 ou supérieur : `java -version` affiche 17+ (prérequis d'`ansible-rulebook` ; version à reconfirmer dans la documentation officielle à la date du test)
- [ ] `ansible-rulebook` installé (`pip install ansible-rulebook`) : `ansible-rulebook --version` répond
- [ ] Collection `ansible.eda` installée : `ansible-galaxy collection list ansible.eda` la liste
- [ ] `ansible-core` installé (version de référence de `.claude/project-config.json`)
- [ ] `curl` disponible ; port TCP 5000 libre sur 127.0.0.1 (`ss -ltn | grep :5000` ne renvoie rien)
- [ ] Données : le zip `Ansible-Training-HTML-vX.Y.Z.zip` de la version candidate, extrait dans un dossier vide ; ne pas utiliser le dépôt git
- [ ] Accès : aucun droit particulier ; le lab n'écoute que sur 127.0.0.1

## Scénarios

### Scenario 1 — Lecture de l'énoncé

**Objectif** : l'énoncé est complet et les prérequis annoncés sont ceux de ce fichier.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir `labs/eda/README.md` | Énoncé, prérequis (Java 17+, `ansible-rulebook`, collection `ansible.eda`, `curl`), étapes numérotées et résultat attendu présents | | |
| 2 | Comparer avec les slides E28-E30 du module Event-Driven Ansible | Énoncé et solution des slides identiques à `labs/eda/` (une seule source de vérité) | | |
| 3 | Chercher une adresse ou un nom d'hôte | Uniquement `127.0.0.1`, `192.0.2.x`, `example.com` | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 2 — Exécution nominale (webhook → remédiation)

**Objectif** : l'événement reçu sur le webhook local déclenche la remédiation du service simulé.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Dans `labs/eda/solution/`, lancer la commande indiquée dans le README (type `ansible-rulebook -r rulebook.yml -i ../inventory.yml --verbose`) | Le rulebook démarre sans erreur ; le webhook écoute sur 127.0.0.1:5000 | | |
| 2 | Dans un second terminal, envoyer l'événement du README avec `curl` vers `http://127.0.0.1:5000` | Code HTTP 200 | | |
| 3 | Observer le terminal du rulebook | La règle attendue se déclenche (nom de la règle affiché), `remediate.yml` s'exécute, la tâche de remédiation du service simulé est visible | | |
| 4 | Vérifier le résultat final décrit dans le README | Identique au « résultat attendu » du README (message, fichier ou fait produit) | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 3 — Événement qui ne doit rien déclencher

**Objectif** : la condition est discriminante.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Rulebook relancé, envoyer avec `curl` un événement dont la valeur ne satisfait pas la condition | Code HTTP 200 (événement reçu) | | |
| 2 | Observer le terminal du rulebook | Aucune règle ne se déclenche, aucune remédiation | | |
| 3 | Envoyer deux fois de suite l'événement qui satisfait la condition (si le lab utilise `throttle`) | Une seule remédiation dans la fenêtre `once_within` | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 4 — Arrêt et propreté

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Arrêter le rulebook (Ctrl+C) | Arrêt propre ; le port 5000 est libéré | | |
| 2 | Lister les fichiers créés par le lab hors du dossier extrait | Aucun (sauf ce que le README annonce) | | |
| 3 | Relire les exemples de `examples/eda/` : lancer au moins un rulebook avec un `curl` adapté (le README de `examples/eda/` indique lequel) | Chaque exemple annoncé fonctionne comme décrit | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

## Criteres de Validation

- [ ] Les scénarios 1 à 4 passent sur un poste équipé avec le contenu **du zip** de la version candidate
- [ ] Les versions utilisées sont consignées ci-dessous (Java, `ansible-rulebook`, `ansible.eda`, `ansible-core`) pour dater la validation
- [ ] Toute divergence entre le lab et les slides E28-E30 est corrigée dans `labs/eda/` d'abord, puis recopiée dans les slides
- [ ] Le critère « lab testé » de #9 est coché par l'utilisateur après PASS

## Notes QA

Versions testées : Java [ ] · ansible-rulebook [ ] · ansible.eda [ ] · ansible-core [ ] · système [ ]
Observations : [espace libre]
