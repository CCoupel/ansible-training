# Procédure de Test — Revue visuelle du support (milestone v0.1.1)

**Version** : 0.1.1
**Date** : 2026-10-06
**Testeur** : QA

Les contrôles automatiques (`tests/slides/`) lisent le texte du PPTX ; ils ne voient ni les
débordements, ni l'alignement des call-outs, ni le contenu des images. Cette procédure couvre ce
qu'ils ne peuvent pas voir. Elle se joue **après** que `obsolescence/` et `anti-fuite/` sont verts
(ou que leurs échecs restants sont expliqués).

## Prérequis

- [ ] Environnement : LOCAL
- [ ] Données : `Ansible Training.pptx` à la version candidate de la branche `milestone/v0.1.1`
      (jamais `Ansible Training.orig.pptx`, qui contient les références d'origine)
- [ ] Accès : PowerPoint ET/OU LibreOffice Impress ; accès réseau pour le scénario 7
- [ ] Facultatif : rendu PNG de toutes les slides
      (`soffice --headless --convert-to pdf "Ansible Training.pptx"` puis `pdftoppm -r 60 -png`) pour parcourir
      plus vite ; mentionner dans les notes QA si le rendu LibreOffice diffère de PowerPoint
- [ ] Liste des termes interdits de l'organisation d'origine, fournie par le teamleader (à garder en
      tête pour le scénario 4 ; ne jamais la recopier dans ce fichier ni dans le rapport)

## Scénarios

### Scenario 1 — Ouverture sans réparation

**Objectif** : Vérifier que le fichier s'ouvre proprement et garde sa structure.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir le PPTX dans PowerPoint | Aucun message « réparer le fichier » ni de contenu supprimé | | |
| 2 | Ouvrir le PPTX dans LibreOffice Impress | Ouverture sans erreur | | |
| 3 | Lire le compteur de slides | 223 slides | | |
| 4 | Repérer les slides masquées (icône barrée dans le trieur) | Exactement 193, 210 et 217 | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 2 — Slide de titre

**Objectif** : Vérifier la version et la date affichées (issue #38).

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Afficher la slide 2 | « v0.1.1 », une date de livraison JJ/MM/AAAA, « Référence : ansible-core 2.20 » (valeur de `reference_version` dans `.claude/project-config.json`) | | |
| 2 | Vérifier la mise en page | Les trois lignes sont lisibles, sans chevauchement ni débordement | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 3 — Images conservées (slides 4 et 209)

**Objectif** : Vérifier la légende « capture historique » (décision Q2) et l'intégrité des images.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Afficher la slide 4 | L'image (tableau de bord daté) est toujours là, légende « capture historique » visible juste sous l'image, non masquée par l'image | | |
| 2 | Lire le texte de la slide 4 | Parle d'« automation controller » et d'AWX, plus de « Tower » dans le texte ; espace restauré dans « runs Ansible » | | |
| 3 | Afficher la slide 209 | Schéma conservé, légende « capture historique » visible ; texte « Galaxy NG / automation hub » conservé | | |
| 4 | Vérifier la police et l'alignement des légendes | Cohérents avec le reste du deck, lisibles à la taille de projection | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 4 — Anti-fuite visuelle (ce que le script ne lit pas)

**Objectif** : Vérifier à l'œil l'absence de référence à l'organisation d'origine dans les images.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Agrandir les images des slides 4 et 209 à 100 % | Aucun logo, nom d'hôte, utilisateur, URL, date interne ni élément de marque de l'organisation d'origine (la marque de l'éditeur tiers sur la slide 209 est acceptée) | | |
| 2 | Parcourir les slides qui contiennent des schémas ou images (écarts d'icônes, pieds de page, fonds) | Aucun logo ni mention de l'organisation d'origine | | |
| 3 | Les 19 dessins vectoriels `.wmf` (schémas des slides 6 à 10 et voisines) : zoomer sur chacun | Aucun texte ou logo de l'organisation d'origine (point resté ouvert à la v0.1.0) | | |
| 4 | Afficher la vue Masque des diapositives et chaque disposition (dont celle contenant « Confidential ») | Aucune marque de classification, logo ou pied de page d'origine | | |
| 5 | Propriétés du fichier (Fichier > Informations) | Pas d'auteur, de société ni de classification de l'organisation d'origine | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 5 — Call-outs des slides 34 à 39 et 93 (lot 5, #23)

**Objectif** : Vérifier que le passage au FQCN n'a pas décalé les flèches et encadrés.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Afficher les slides 34 à 39 l'une après l'autre | Chaque call-out désigne bien la ligne ou le mot qu'il commente | | |
| 2 | Comparer au contenu de la slide 93 | Même playbook, mêmes lignes, mêmes noms de modules (`ansible.builtin.dnf`, `ansible.builtin.template`, `ansible.builtin.service`) | | |
| 3 | Vérifier que le code reste lisible | Pas de texte coupé en bord de forme | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 6 — Débordements de texte sur les slides modifiées

**Objectif** : Repérer le texte qui sort de sa forme ou de la slide (code plus long, URL plus longues).

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Lot 1 : slides 29, 41, 42, 65, 88, 89, 94, 102, 109, 128, 139, 140, 141, 198 | Aucun débordement, indentation YAML visible et cohérente | | |
| 2 | Lots 2-4 : slides 4, 5, 8, 9, 10, 45, 149, 154, 156, 160, 161, 172, 179, 204, 207, 220, 221 | Idem ; le code Python de la slide 179 tient entièrement (police réduite plutôt que coupé) | | |
| 3 | Lots 5-7 : slides 11, 28, 34-39, 93, 95, 101, 132, 134, 159, 160, 197, 200, 202, 216, 217, 219 | Idem ; slide 134 et 202 : indentation correcte, pas de `Tags:` ni de `block.:` | | |
| 4 | Lots 8-10 : slides 2, 40, 110, 117, 143, 187, 212 | Idem ; slide 212 : avertissement `host_key_checking` lisible | | |
| 5 | Passer chaque slide modifiée en mode diaporama | Rien n'est tronqué à la projection | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 7 — Liens et sources de documentation (lot 6)

**Objectif** : Vérifier à la main ce que les tests ne peuvent pas faire hors ligne.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir 5 liens au hasard parmi les slides 13, 30, 44, 56, 77, 82, 87, 90, 91, 99, 113, 129, 135, 162 (en diaporama : clic ; sinon copier l'URL) | Code HTTP 200 après redirections, page correspondant au sujet de la slide | | |
| 2 | Pour chacun, comparer URL affichée et cible du lien (clic droit > Modifier le lien) | Identiques | | |
| 3 | Slides 47 et 48 : cliquer 5 liens de collections | Pages existantes | | |
| 4 | Slides 47 à 52 | Mention « Source : docs.ansible.com, consulté le AAAA-MM-JJ » visible et lien vivant | | |
| 5 | Comparer avec le tableau URL avant/après du rapport dev-slides | Aucun écart | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 8 — ManageIQ « en fin de vie », slides masquées (Q3)

**Objectif** : Vérifier la présentation de l'exemple ManageIQ et le statut des slides masquées.

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Slides 28, 160, 217, 219 | Mention « end of life » ou « legacy » visible et sobre (pas d'affirmation non sourcée) | | |
| 2 | Slide 217 (masquée) | Toujours masquée ; en-tête « Integration example (ManageIQ / CloudForms, end of life) » | | |
| 3 | Slide 210 (masquée) | Toujours masquée ; sortie `profile_tasks` sans date de 2021 ; hôtes et chemins anonymisés (`example.com`, `192.0.2.x`) | | |
| 4 | Slide 193 (masquée) | Toujours masquée, contenu inchangé | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 9 — Notes d'intervenant

**Objectif** : Vérifier les notes (lot 9, #47 et #48).

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Ouvrir le mode Orateur sur 5 slides au hasard parmi celles qui avaient la note « The real work… » (ex. 34, 40, 74, 95, 130) | Phrase passe-partout disparue, autre contenu de note conservé | | |
| 2 | Notes des slides 17 à 25, 44 et 95 | Plus de TODO (« changer de groupe », « A revoir », « chqnged ») | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

## Criteres de Validation

- [ ] Tous les scénarios passent
- [ ] Aucun débordement de texte ni call-out décalé sur les slides modifiées
- [ ] Aucune référence à l'organisation d'origine visible (scénario 4 obligatoire avant toute publication)
- [ ] Aucune régression visuelle sur les slides non modifiées (échantillon de 10 slides prises au hasard)

## Notes QA

[Espace pour observations : slides concernées, captures, différences PowerPoint / LibreOffice]
