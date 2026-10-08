# Contraintes de conception

> Contraintes durables issues des refus/corrections de l'utilisateur, par composant.

## course-site (v0.2.0)

### Hébergement & distribution (Q1 — GATE 2)
- GitHub Pages via Actions à chaque release (activation après confirmation utilisateur)
- **Pas de branche gh-pages** — le site est commité dans `main` (`index.html` racine + `assets/`, `modules/`, comme OpenShift)
- Artefact de release : `Ansible-Training-HTML-vX.Y.Z.zip` (déterministe)

### Contenu additionnel (Q2 — GATE 2)
- **Quiz + objectifs + « À retenir »** (pas quiz seuls)
- ≈145-210 textes additionnels (15 modules × 3-5 objectifs + 4-6 À retenir + 1-3 quiz)
- Dérivés **uniquement** du contenu PPTX (avec `ref` vers les slides sources)
- Badgés « Bonus HTML » (exclus de la parité PPTX-HTML)

### Conversion & couverture (Q3 — GATE 2)
- Slides masquées **193, 210, 217 exclues** du HTML et de la parité (v0.2.0 ; renumérotées en v1.0.0, voir section dédiée)
- Slides 1-3 (couverture) → page d'accueil
- Couvertures générées « Objectifs » et « À retenir » par module (badgées « Bonus HTML »)

### Interface & langue (Q4 — GATE 2)
- **Interface en français** (libellés de navigation, boutons, panneaux)
- Contenu des slides PPTX inchangé (langue d'origine : anglais majoritaire + fragments français)
- Contenu additionnel en français (termes techniques en forme d'origine : `ansible-playbook`, `become`, etc.)
- Préparer i18n pour v1.0.0 : isoler les libellés en `assets/i18n/fr.js` (sans sélecteur ni anglais en v0.2.0)

## build-publish (v0.2.0)

### Architecture & commitage
- Site commité dans `main` — **jamais de gh-pages** branch
- Arborescence : `index.html` (racine) + `assets/`, `modules/`, `tools/`, `CONVENTIONS.md`, workflows
- `assets/meta.js` : seul fichier généré suivi (version, reference_version, date)

### Contrôles & parité
- Parité PPTX ⊂ HTML bloquante en CI et release
- Anti-fuite : `check_site.py` avec `LEAK_PATTERNS` en release (motifs génériques en CI)
- Version affichée slide 2 PPTX = slide 2 HTML = tag de release

### Hébergement GitHub Pages (Q1 — conditionnel)
- `pages.yml` appelé par `release.yml` seulement si `PAGES_ENABLED=true`
- Activation manuelle par `deployer` après confirmation utilisateur (dépôt public)
- Artefact limité à `index.html`, `assets/`, `modules/`, PPTX (lien de téléchargement)

## course-site (v1.0.0, lot 1)

### Agenda & ordre des modules
- Formation sur **4 jours** (coupe C) : Day 3 = m11 à m13, Day 4 = m15 à m17 (`day` de `assets/plan.js`).
- Ordre des modules existants conservé : m13 Execution Environments est inséré après m12 ; aucun module existant n'est réordonné.
- **Ids = ordre d'affichage** : m13 Execution Environments ; **m14 réservé** à Event-Driven Ansible (lot 2, #7/#8/#9) ; anciens m13/m14/m15 renommés m15/m16/m17 (une seule fois, au lot 1).

### Numérotation des slides & source de vérité
- Aucun numéro de slide saisi à la main : l'ordre de référence est `tests/slides/slide_index.json`, la renumérotation passe par `tools/renumber.py` (`--check` puis `--apply`).
- Décompte (slides, masquées) lu dans `tests/slides/expected.json` ; plages de modules dans `assets/plan.js`. Aucun compteur codé en dur dans `tools/` ni `tests/`.
- Toute insertion de slides : PPTX et HTML dans le même lot, avec contrôle de non-régression avant rédaction (process « Livraison PPTX + HTML », `CONVENTIONS.md`).
- Slides masquées v1.0.0 (lot 1) : **203, 220, 227** (sur 233 slides).

### Progression & ancres
- Clé de progression navigateur : `ansible-training-v2` (remise à zéro annoncée dans le CHANGELOG, version majeure).
- Ancres `#mNN-…` liées à l'id du module ; pas de redirection depuis les anciens identifiants.

## course-site (v1.0.0, lot 3 — site fr/en)

### Périmètre de la traduction
- Site fr/en (#51). **Traduit** : l'interface (`assets/i18n/fr.js` et `en.js`) et le contenu « Bonus HTML » (tagline, objectifs, « À retenir », quiz).
- **Non traduit** : texte des slides (verbatim PPTX, en anglais), notes du formateur, titres de modules (titres des sections du PPTX), code, identifiants, date de livraison.
- Relecture de l'anglais par les agents.

### Sélecteur de langue
- Bouton « FR | EN » dans la barre du haut, à côté du thème, présent sur tous les écrans (accueil compris). Raccourci clavier `l`. La langue active est surlignée.
- Langue initiale, par priorité : paramètre d'URL `?lang=fr|en` (accepté, puis mémorisé) ; choix mémorisé (clé `ansible-training-v2`, champ `lang`) ; langue du navigateur (français si la langue commence par « fr », sinon anglais).
- Repli sur le français : une chaîne absente en anglais s'affiche en français, jamais de trou. `validate.js` rend ce cas impossible en release.

### Livraison
- Zip HTML à **72 fichiers** : les 71 du lot 2 plus `assets/i18n/en.js`.

### Maquette de référence
- Maquette validée : `docs/mockup/v1.0.0/ui/course-site__i18n.html` (la bascule FR | EN et le thème fonctionnent dans la maquette ; le bandeau « Contrôles de maquette » simule la langue du navigateur et `?lang=`, il ne fait pas partie du produit).

### Livraison & contrôles (v1.0.0, lot 2)
- Les exemples (`examples/eda/`) et le lab (`labs/eda/`) sont **livrés dans le zip HTML** (`tools/package.js`, chemins `examples` et `labs`) : 71 fichiers. Le lab « testé » reste une procédure manuelle (Java et `ansible-rulebook` absents de la CI).
- `tools/validate.js` avertit si un module compte moins de 6 ou plus de 35 slides de contenu hors Bonus (les quiz ne comptent pas) ; 35 = borne du module le plus long (m14).
