# Procédure de Test — Revue visuelle du site HTML

**Version** : 0.2.0
**Date** : [date]
**Testeur** : QA / utilisateur (revue visuelle humaine n° 2 = pilote m02 au GATE pilote, n° 3 = site complet avant release)

Les tests automatiques (`tests/site/`) lisent `build/course.json` ; ils ne voient ni le rendu, ni le thème,
ni le clavier, ni les pixels des images. Cette procédure couvre ce qu'ils ne peuvent pas voir.
Elle se joue **après** que `python3 -m unittest discover -s tests/site` est vert (ou que ses échecs restants sont expliqués).

## Prérequis

- [ ] Environnement : LOCAL, clone de la branche `milestone/v0.2.0` (jamais d'autre dossier)
- [ ] Données : `index.html` ouvert **en double-clic** (URL `file://`), sans serveur local
- [ ] Navigateurs : un navigateur Chromium et un Firefox ; fenêtre desktop et largeur mobile 375 px (outils de développement)
- [ ] Liste des termes interdits de l'organisation d'origine, fournie par le teamleader (scénario 9 ; ne jamais la
      recopier dans ce fichier ni dans le rapport)
- [ ] Revue n° 2 (pilote) : seuls l'accueil et le module m02 sont à passer ; revue n° 3 : tout le site
- [ ] `build/img-contact.html` (planche de contact des images) généré par `dev-slides`

## Scénarios

### Scenario 1 — Accueil, version et téléchargement

**Objectif** : vérifier l'accueil (`#home`) et les informations de version.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Double-cliquer `index.html` | La page s'affiche sans erreur ; aucune requête réseau (console, onglet Réseau) | | |
| 2 | Lire la couverture | Titre de la formation, version `vX.Y.Z` = valeur de `.claude/project-config.json` (3 premiers nombres), date de livraison, « Référence : ansible-core 2.20 » | | |
| 3 | Lire l'agenda | Jours J1 / J2 / « pour aller plus loin » cohérents avec la slide 3 du PPTX | | |
| 4 | Cliquer le lien de téléchargement du PPTX | Le fichier `Ansible Training.pptx` est proposé (lien relatif, espace encodé) | | |
| 5 | Lire le sommaire | 15 modules listés ; les modules livrés sont ouvrables, les autres grisés « à venir » (revue n° 2) ou absents du grisé (revue n° 3) | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 2 — Navigation clavier et ancres

**Objectif** : CA-3.2.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir un module, utiliser ← → | Slide précédente / suivante ; compteur et barre de progression mis à jour | | |
| 2 | Touches Home / End | Première / dernière slide du module | | |
| 3 | Touche `m` | Le sommaire s'ouvre / se ferme | | |
| 4 | Touche `t` | Bascule thème clair / sombre | | |
| 5 | Touche `/` puis saisir un mot présent dans le cours | Résultats de recherche plein texte ; clic = ouverture de la slide | | |
| 6 | Copier l'URL d'une slide (`#mNN-k`), l'ouvrir dans un nouvel onglet | La même slide s'affiche | | |
| 7 | Naviguer puis recharger la page | La progression est mémorisée | | |
| 8 | Bloquer le stockage local (navigation privée stricte) et recharger | Le site fonctionne, sans mémorisation, sans erreur bloquante | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 3 — Thème clair / sombre

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Parcourir 5 slides par module en thème clair | Texte lisible, contraste suffisant, accent bleu conforme à la maquette | | |
| 2 | Idem en thème sombre | Idem ; blocs de code, tableaux, call-outs et SVG lisibles (aucun texte noir sur fond sombre) | | |
| 3 | Imprimer / aperçu avant impression (facultatif) | Pas de contenu coupé de façon illisible | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 4 — Contenu converti (par module)

**Objectif** : fidélité visuelle au PPTX, module par module. Dupliquer le tableau pour chaque module contrôlé
(m02 au GATE pilote ; m01 à m15 en revue finale) et ouvrir le PPTX en regard dans PowerPoint.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Parcourir toutes les slides du module (badge « PPTX · slide N ») | Aucune slide manquante, ordre identique au PPTX | | |
| 2 | Comparer 5 slides prises au hasard avec le PPTX | Même contenu, coquilles d'origine conservées, aucun texte reformulé | | |
| 3 | Blocs de code (INI / YAML / JSON / Python / console) | Indentation conservée, aucun débordement, copie correcte, `{{ }}` et `{% %}` intacts | | |
| 4 | Tableaux | Colonnes alignées, aucun débordement horizontal à 375 px (défilement local accepté) | | |
| 5 | Schémas (`flow`, `layers`, `diagram`) | Lisibles dans les deux thèmes, flèches et libellés complets | | |
| 6 | Liens externes | Ouverture dans un nouvel onglet ; texte visible identique au PPTX | | |
| 7 | Notes du formateur (touche `n`, slides concernées) | Le panneau affiche les notes ; les slides sans note n'en affichent pas | | |

Notes attendues sur : 12, 29, 35, 36, 37, 38, 43, 63, 66, 67, 108, 111.

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 5 — Images

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir `build/img-contact.html` | Planche de toutes les images extraites | | |
| 2 | Regarder chaque image à l'œil nu | Aucun logo, marquage, filigrane, capture d'écran ou texte d'organisation dans les pixels | | |
| 3 | Pictos (slides 5, 6, 8, 9, anciens WMF) | Nets, non déformés, fond adapté aux deux thèmes | | |
| 4 | Captures de documentation (slides 49-52, 87, 90, 219, 4) | Lisibles ; texte alternatif descriptif et neutre | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 6 — Exercices (`lab` + `reveal`)

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir une slide d'exercice | Étapes cochables ; coche mémorisée après rechargement | | |
| 2 | Cliquer « Voir la solution » | La solution (code) apparaît ; recliquer la masque | | |
| 3 | Comparer avec les slides d'exercice et de solution du PPTX | Mêmes étapes et même solution | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 7 — Couvertures « Objectifs », quiz, « À retenir » (Bonus HTML)

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir la 1re slide d'un module | Couverture « Objectifs » (3 à 5), badge « Bonus HTML » visible | | |
| 2 | Répondre faux puis juste à un quiz | Correction immédiate, explication citant la slide source ; une seule bonne réponse | | |
| 3 | Aller à « À retenir » | 4 à 6 points, badge « Bonus HTML », score des quiz du module affiché | | |
| 4 | Recharger | Le score est conservé ; sans stockage local, la page reste utilisable | | |
| 5 | Comparer le nombre de slides avec le PPTX | Les slides « Bonus HTML » sont clairement distinctes des slides du support | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 8 — Mobile (375 px)

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Réduire la fenêtre à 375 px | Sommaire repliable, aucun défilement horizontal de la page | | |
| 2 | Parcourir une slide de code, de tableau, de schéma | Contenu lisible ou défilable localement ; boutons Précédent / Suivant accessibles | | |
| 3 | Utiliser le sommaire et la recherche | Utilisables au doigt | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 9 — Absence de référence à l'organisation d'origine

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Lancer `LEAK_PATTERNS="$(cat leak_patterns.txt)" python3 tests/site/check_site.py` (motifs complets, local) | `OK` | | |
| 2 | Rechercher (recherche du site) les termes de la liste fournie | Aucun résultat | | |
| 3 | Onglet / titre / pied de page / source de la page (clic droit → afficher la source) | Aucun nom, domaine, logo ou métadonnée d'organisation | | |
| 4 | Vérifier les adresses IP affichées | 192.0.2.x uniquement | | |
| 5 | Vérifier l'absence de marque OpenShift (couleurs rouges, libellés « OCP », callouts `k8s`) | Aucune | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 10 — Slides PPTX modifiées (revue n° 3 uniquement)

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir le PPTX dans PowerPoint (pas LibreOffice) | Aucun message de réparation ; 233 slides ; masquées 203, 220, 227 | | |
| 2 | Slides 47, 120, 168, 169, 174 | Liens `/projects/ansible/latest/...` cliquables et valides | | |
| 3 | Slide 2 | Version `vX.Y.Z` et date identiques à l'accueil HTML | | |

**Verdict** : [ ] PASS  [ ] FAIL

## Criteres de Validation

- [ ] Tous les scénarios 1 à 9 PASS (10 en revue n° 3)
- [ ] Aucune référence d'organisation, aucune erreur console, aucune ressource externe
- [ ] Tests automatiques `tests/site/` et `tests/slides/` verts (ou échecs expliqués)

## Notes QA

[Observations, captures, numéros de slide en défaut]
