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
- Slides masquées **193, 210, 217 exclues** du HTML et de la parité
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
