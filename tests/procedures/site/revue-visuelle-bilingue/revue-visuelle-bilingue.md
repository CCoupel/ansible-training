# Procédure de Test — Revue visuelle du site bilingue fr/en (#51)

**Version** : 1.0.0
**Date** : [date]
**Testeur** : utilisateur ou QA (navigateur réel ; les tests automatiques ne voient ni le rendu, ni le focus, ni le lecteur d'écran)

Conforme à la maquette validée `docs/mockup/v1.0.0/ui/course-site__i18n.html` et au glossaire `docs/i18n/glossary.md`.
Règle d'or à vérifier partout : **les slides (texte du PPTX, notes) sont identiques dans les deux langues** ; seuls l'interface
et le Bonus (tagline, objectifs, À retenir, quiz, légendes) changent.

## Prérequis

- [ ] Version candidate : zip `Ansible-Training-HTML-vX.Y.Z.zip` extrait dans un dossier vide ; ouverture par double-clic de `index.html` (aucun serveur)
- [ ] Un navigateur dont la langue est réglable (Chrome ou Firefox), avec une fenêtre de navigation privée pour les premières visites
- [ ] Lecteur d'écran (NVDA, VoiceOver ou Orca) pour le scénario 9 ; outils de développement ouverts pour inspecter `<html lang>`
- [ ] Tests automatiques verts : `tests/site/i18n/`, `validate.js --strict-i18n`, `PARITY_STRICT=1 I18N_STRICT=1`

## Scénarios

### Scenario 1 — Sélecteur de langue (souris, clavier, raccourci)

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Repérer le sélecteur « FR \| EN » dans la barre du haut, à côté du thème | Emplacement et aspect conformes à la maquette ; la langue active est visuellement distincte | | |
| 2 | Cliquer sur l'autre langue | Interface, accueil et Bonus changent immédiatement, sans rechargement de page | | |
| 3 | Naviguer au clavier (Tab) jusqu'au sélecteur, valider avec Entrée ou Espace | Focus visible ; la langue change | | |
| 4 | Appuyer sur la touche `l` (hors champ de saisie) | La langue bascule ; l'aide `nav.hint` mentionne `l` | | |
| 5 | Taper `l` dans le champ de recherche | Aucun changement de langue (la saisie n'est pas interceptée) | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 2 — Langue initiale et persistance

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Navigateur réglé en français, première visite (stockage vide) | Site en français | | |
| 2 | Navigateur réglé en anglais, première visite (stockage vide) | Site en anglais | | |
| 3 | Navigateur réglé dans une autre langue (par exemple allemand) | Repli sur la langue décidée (voir maquette) ; jamais d'interface vide | | |
| 4 | Choisir manuellement l'autre langue, recharger la page | Le choix manuel est conservé et prioritaire sur la langue du navigateur | | |
| 5 | Fermer et rouvrir l'onglet | Choix toujours conservé | | |
| 6 | Bloquer le stockage local (navigation privée stricte) | Le site fonctionne, la langue ne persiste simplement pas | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 3 — Paramètre `?lang=`

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir `index.html?lang=en` | Anglais, quelle que soit la langue du navigateur | | |
| 2 | Ouvrir `index.html?lang=fr` | Français | | |
| 3 | Ouvrir `index.html?lang=de` (valeur inconnue) | Repli sans erreur (langue mémorisée ou langue du navigateur) ; aucune erreur dans la console | | |
| 4 | Ouvrir `index.html?lang=en#m02-3` | La slide visée s'affiche, en anglais | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 4 — Repli sur le français

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | En anglais, ouvrir un module dont le Bonus n'est pas traduit (cas d'un développement en cours ; en release tous le sont) | Le Bonus s'affiche en français, sans trou ni « undefined » ; l'interface reste en anglais | | |
| 2 | Console du navigateur | Aucune erreur ni avertissement dû à un texte manquant | | |

**Verdict** : [ ] PASS  [ ] FAIL (sans objet si tous les modules sont traduits)

---

### Scenario 5 — Contenu verbatim identique, Bonus traduit

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir une slide de contenu (titre, puces, code, tableau, notes du formateur) dans les deux langues | Texte **strictement identique** (anglais du PPTX) | | |
| 2 | Couverture « Objectifs » / « Objectives » | Titres d'interface traduits ; 3 à 5 objectifs traduits ; badge « Bonus HTML » conservé | | |
| 3 | « À retenir » / « Key takeaways » | 4 à 6 points traduits, `<code>` identiques en fr et en | | |
| 4 | Un quiz | Question, options et explication traduites ; la bonne réponse est la même ; l'explication cite « slide N » avec le même numéro | | |
| 5 | Une image avec légende, un schéma SVG | Texte alternatif et légende traduits ; le schéma reste lisible | | |
| 6 | Lire l'anglais du Bonus avec le glossaire | Termes du glossaire respectés ; pas de calque du français ; ton direct | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 6 — Ancres et progression conservées

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir une slide profonde (par exemple `#m08-5`), changer de langue | La même slide reste affichée ; l'URL (ancre) ne change pas | | |
| 2 | Marquer plusieurs slides comme vues, changer de langue | La progression est conservée (barre et sommaire) | | |
| 3 | Copier l'URL d'une slide, l'ouvrir dans un nouvel onglet dans l'autre langue (`?lang=`) | Même slide | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 7 — Recherche par langue

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | En français, touche `/`, chercher un mot du Bonus français (par exemple un terme d'un objectif) | Résultats du Bonus français | | |
| 2 | Passer en anglais, chercher le même mot français | Aucun résultat du Bonus (le Bonus français n'est plus indexé) ; message « No results. » traduit | | |
| 3 | Chercher un mot du texte des slides (anglais) dans les deux langues | Mêmes résultats dans les deux langues (champs verbatim) | | |
| 4 | Chercher un mot du Bonus anglais | Résultats en anglais seulement | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 8 — Mobile, thèmes clair et sombre

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Fenêtre de 375 px de large | Le sélecteur reste accessible (barre ou menu), cible tactile d'au moins 44 px, aucun débordement horizontal | | |
| 2 | Libellés anglais longs (« Key takeaways », boutons de navigation) en 375 px | Aucun libellé coupé ni chevauchement | | |
| 3 | Thème clair puis sombre, dans les deux langues | Sélecteur lisible, contraste suffisant, langue active distincte | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 9 — Accessibilité et lecteur d'écran

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Inspecter `<html lang>` dans les deux langues | `fr` en français, `en` en anglais | | |
| 2 | En interface française, inspecter le conteneur des blocs verbatim | Il porte `lang="en"` (le texte des slides est en anglais) | | |
| 3 | Lire le bouton de langue avec le lecteur d'écran | Annonce claire (« Langue : English » / « Language: français ») et état actif (`aria-pressed` ou libellé explicite) | | |
| 4 | Changer de langue au lecteur d'écran | Le changement est annoncé ou perceptible ; le focus reste sur le sélecteur | | |
| 5 | Lire un quiz et une image traduits | Prononciation dans la bonne langue ; texte alternatif traduit | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

## Criteres de Validation

- [ ] Les 9 scénarios passent (le 4 est sans objet quand tous les modules sont traduits)
- [ ] Les slides sont identiques dans les deux langues ; seule l'interface et le Bonus changent
- [ ] Aucune référence à l'organisation d'origine dans le texte anglais (images et alternatives comprises)
- [ ] Les écarts avec la maquette sont consignés ci-dessous

## Notes QA

Navigateurs et versions : [ ] · lecteur d'écran : [ ] · observations : [espace libre]
