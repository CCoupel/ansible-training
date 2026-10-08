# Checklist de release v1.0.0 — reste à faire

> État : milestone `v1.0.0` en développement (`1.0.0.a`). Lots 1, 2 et 3 validés en QA (C3 final du lot 3 sur HEAD `2a5a2a1`).
> Chiffres de référence : 264 slides PPTX, slides masquées 234, 251, 258 ; 17 modules (m01–m17) ; 51 quiz ; zip HTML de 72 fichiers ; 284 tests site en strict complet ; 46 tests d'obsolescence PPTX.
> Ne pas tagger avant que toutes les cases « bloquant » soient cochées.

## 1. Secrets et anti-fuite (bloquant)

- [ ] Définir le secret GitHub `LEAK_PATTERNS` : `gh secret set LEAK_PATTERNS < leak_patterns.txt` (une regex par ligne). Vérifier avec `gh secret list` (le contenu n'est jamais affiché).
- [ ] Préparer `leak_patterns.txt` en local et relancer le scan avec les vrais motifs : `LEAK_PATTERNS="$(cat leak_patterns.txt)" python3 tests/slides/check_pptx.py "Ansible Training.pptx"` et `python3 tests/site/check_site.py --dir <extraction du zip> --require-secret`. Le lot 3 n'a pas pu faire ce scan (secret absent).

## 2. Revues humaines (bloquant)

- [ ] **Revue visuelle PowerPoint** (pas de LibreOffice sur le poste) : slides 183 à 223 (Execution Environments et Event-Driven Ansible) et slide 3 (agenda sur 4 jours, colonnes Day 3 et Day 4 sans débordement). Procédure : `tests/procedures/slides/revue-visuelle/`.
- [ ] **Revue navigateur du site bilingue** : bascule FR | EN, `?lang=fr|en`, mémorisation, repli sur le français, libellés `lab` et `reveal`. Procédure : `tests/procedures/site/revue-visuelle-bilingue/`.
- [ ] **Lab EDA testé** sur un poste avec Java 17+ et `ansible-rulebook` : `tests/procedures/labs/eda/lab-teste.md`.
- [ ] **Exemple d'EE (slide 192, Podman)** : construire et lancer l'image d'exemple sur un poste avec Podman. Vérifier que les commandes de la slide fonctionnent telles quelles.
- [ ] **Relecture humaine de l'anglais** (optionnelle, décision de l'utilisateur) : tournures du Bonus fr/en, en particulier m13 à m17.

## 3. Correctifs de contenu connus

- [ ] **Quiz m08 : distracteur `tagged`** (français et anglais) à remplacer par un vrai tag ; actuellement une valeur spéciale de `--tags`, pas un tag posé sur une tâche. Relancer `node tools/validate.js --strict-i18n` et les tests i18n après correction.

## 4. Version, slide 2 et `meta.js` (bloquant)

- [ ] Passer `meta.js` en 1.0.0 avec la date de livraison : `node tools/sync-meta.js --version 1.0.0 --date JJ/MM/AAAA`.
- [ ] Faire aligner la slide 2 du PPTX par `dev-slides` : version v1.0.0, même date (JJ/MM/AAAA), référence `ansible-core 2.20`.
- [ ] Mettre `.claude/project-config.json` à 1.0.0 (version et date), si la clôture le demande.
- [ ] Vérifier la cohérence : slide 2 et `meta.js` ont la même date et la même version.

## 5. Tests de version de tag

- [ ] Rejouer les trois contrôles de version avec le tag : `RELEASE_TAG=v1.0.0 PARITY_STRICT=1 LOTS_STRICT=1 I18N_STRICT=1 python3 -m unittest discover -s tests/site` (`test_meta_js_affiche_la_version_du_tag`, `test_slide_2_affiche_la_version_du_tag`, `test_sync_meta_check_avec_la_version_du_tag`). Ils échouent aujourd'hui, attendu tant que la slide 2 et `meta.js` sont en 0.2.0.
- [ ] `node tools/validate.js --strict-i18n` : 0 erreur.
- [ ] `node tools/package.js` puis `unzip -t build/Ansible-Training-HTML.zip` : 72 fichiers, `assets/i18n/en.js` présent.

## 6. Git, tag et publication

- [ ] Merger `milestone/v1.0.0` sur `main` (fast-forward si possible), puis pousser `main`.
- [ ] Poser le tag annoté `v1.0.0` sur `main` et pousser le tag. La CI refuse le tag si le commit n'est pas dans `origin/main`, si `LEAK_PATTERNS` manque, ou si la traduction est incomplète (`I18N_STRICT`).
- [ ] Vérifier les trois assets de la release : `Ansible-Training-v1.0.0.pptx`, `Ansible-Training-HTML-v1.0.0.zip` et son `.sha256` (`sha256sum -c`).
- [ ] **GitHub Pages** : activation à décider par l'utilisateur (dépôt public). Sans activation, le site n'est accessible que par le zip.

## 7. Infrastructure du dépôt

- [ ] **Actions Node dépréciées** : mettre à jour les actions avant le 2026-10-19 (échéance annoncée par GitHub). Vérifier les SHA épinglés dans `.github/workflows/`.
- [ ] **Rulesets** : protéger les tags `v*` et la branche `main` (pas de suppression ni de réécriture de tag).
- [ ] **Environnement de test** : Node 22 et Python 3.12 sous Linux (WSL accepté). Le wrapper `node.exe` Windows donne de faux échecs.

## 8. Clôture

- [ ] CHANGELOG : passer `[Unreleased]` en `[1.0.0] - JJ/MM/AAAA` et ajouter les notes de release (BREAKING côté site : numéros de modules, ancres `#m13-…` à `#m15-…`, progression remise à zéro).
- [ ] README et CLAUDE.md : vérifier les chiffres après les corrections des points 3 et 4.
- [ ] `/end-session` : mettre à jour la mémoire du projet et fermer le milestone `v1.0.0`.
