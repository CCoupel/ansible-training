# Checklist de release v1.0.0 — reste à faire

> État : **1.0.0 en préparation (release à venir)**. Tag `v1.0.0` non posé, rien poussé.
> HEAD de référence : `babc90a` (contient `1970145`). Contrôle final de la release : `_work/reports/qa-20261008-151717.md`, verdict **VALIDATED**.
> Chiffres de référence : 264 slides PPTX, slides masquées 234, 251, 258 ; 17 modules (m01–m17) ; 51 quiz ; zip HTML de 72 fichiers ; 284 tests site en strict complet ; 46 tests d'obsolescence PPTX.
> Ne pas tagger avant que toutes les cases « bloquant » soient cochées.

## 1. Secrets et anti-fuite (bloquant)

- [ ] Créer `leak_patterns.txt` en local (une regex par ligne), puis définir le secret GitHub : `gh secret set LEAK_PATTERNS < leak_patterns.txt`. Vérifier avec `gh secret list` (le contenu n'est jamais affiché).
- [ ] Rejouer le scan avec les vrais motifs : `LEAK_PATTERNS="$(cat leak_patterns.txt)" python3 tests/slides/check_pptx.py "Ansible Training.pptx"` puis `python3 tests/site/check_site.py --dir <extraction du zip> --require-secret`. Le contrôle QA a été fait sans secret (échec attendu sur `--require-secret`).

## 2. Revues humaines (bloquant)

- [ ] **Revue visuelle PowerPoint** (pas de LibreOffice sur le poste) : slide 3 (agenda sur 4 jours, colonnes Day 3 et Day 4 sans débordement), slides 183 à 223 (Execution Environments et Event-Driven Ansible). Procédure : `tests/procedures/slides/revue-visuelle/`.
- [ ] **Revue navigateur du site bilingue** : bascule FR | EN, `?lang=fr|en`, mémorisation, repli sur le français, libellés `lab` et `reveal`. Procédure : `tests/procedures/site/revue-visuelle-bilingue/`.
- [ ] **Lab EDA testé** sur un poste avec Java 17+ et `ansible-rulebook` : `tests/procedures/labs/eda/lab-teste.md`.
- [ ] **Exemple d'EE (slide 192, Podman)** : construire et lancer l'image d'exemple sur un poste avec Podman. Vérifier que les commandes de la slide fonctionnent telles quelles.
- [ ] **Relecture humaine de l'anglais** (optionnelle, décision de l'utilisateur) : tournures du Bonus fr/en, en particulier m13 à m17.

## 3. Correctifs de contenu

- [x] **Quiz m08 : distracteur `tagged`** (français et anglais) remplacé par le tag `web` (commit `197f6e8`). `tagged` est une valeur spéciale de `--tags`, pas un tag posé sur une tâche. Relancer `node tools/validate.js --strict-i18n` et les tests i18n avant le tag ; tout changement de module invalide le rapport QA `qa-20261008-151717`.

## 4. Version, slide 2 et `meta.js` (fait)

- [x] `meta.js` en 1.0.0, date 08/10/2026 (commit `1970145`).
- [x] Slide 2 du PPTX en v1.0.0, date 08/10/2026 (commit `babc90a`).
- [x] `.claude/project-config.json` en 1.0.0 (commit `babc90a`).
- [x] Cohérence slide 2 / `meta.js` : même version et même date (contrôlé par la QA).

## 5. Tests de version de tag (fait en QA)

- [x] Les trois contrôles de version passent avec `RELEASE_TAG=v1.0.0` (`test_meta_js_affiche_la_version_du_tag`, `test_slide_2_affiche_la_version_du_tag`, `test_sync_meta_check_avec_la_version_du_tag`), QA `qa-20261008-151717`.
- [x] `node tools/validate.js --strict-i18n` : 0 erreur (QA).
- [x] `node tools/package.js` : zip de 72 fichiers, dont `assets/i18n/en.js` (QA).

## 6. Git, tag et publication

Ordre des étapes restantes, tel que relevé dans le rapport QA :

1. [ ] Créer `leak_patterns.txt`, puis `gh secret set LEAK_PATTERNS` et `gh secret list` (section 1).
2. [ ] Rejouer le scan avec les vrais motifs (section 1).
3. [ ] Revues humaines : PowerPoint, navigateur bilingue, lab EDA, exemple d'EE, relecture optionnelle (section 2).
4. [x] Correctif du quiz m08 appliqué (`197f6e8`) ; relancer `validate.js --strict-i18n` et les tests i18n avant le tag (section 3).
5. [ ] Clôture documentaire : CHANGELOG (`[1.0.0] - 08/10/2026`) et README (statut « en préparation ») faits ; CLAUDE.md vérifié (aucune erreur de chiffre).
6. [ ] Refaire un contrôle si un nouveau commit change le PPTX, `meta.js` ou un module.
7. [ ] **Pousser `main` local** : `main` (`0ffb1a8`) est un ancêtre de `babc90a`. Il est en avance d'un commit (mémoire de fin de session v0.2.0, `0ffb1a8`) sur `origin/main` (`b4b67b2`). Le push enverra donc 91 commits au total, dont 90 de `milestone/v1.0.0`. Faire d'abord le fast-forward de `main` sur `milestone/v1.0.0`, puis pousser `main`, et vérifier que `origin/main` contient le commit à tagger.
8. [ ] Poser le tag annoté `v1.0.0` sur `main` et le pousser. La CI refuse le tag si le commit n'est pas dans `origin/main`, si `LEAK_PATTERNS` manque, ou si la traduction est incomplète (`I18N_STRICT`). Suivre le run de la release, puis vérifier les trois assets : `Ansible-Training-v1.0.0.pptx`, `Ansible-Training-HTML-v1.0.0.zip` et son `.sha256` (`sha256sum -c`).
9. [ ] **GitHub Pages** : activation à décider par l'utilisateur (dépôt public). Sans activation, le site n'est accessible que par le zip.

## 7. Infrastructure du dépôt

- [ ] **Actions Node dépréciées** : mettre à jour les actions avant le 2026-10-19 (échéance annoncée par GitHub). Vérifier les SHA épinglés dans `.github/workflows/`.
- [ ] **Rulesets** : protéger les tags `v*` et la branche `main` (pas de suppression ni de réécriture de tag).
- [ ] **Environnement de test** : Node 22 et Python 3.12 sous Linux (WSL accepté). Le wrapper `node.exe` Windows donne de faux échecs.

## 8. Clôture

- [x] CHANGELOG : section `[1.0.0] - 08/10/2026` et `[Unreleased]` vide au-dessus, avec les notes de release (BREAKING côté site : numéros de modules, ancres `#m13-…` à `#m15-…`, progression remise à zéro ; correction du distracteur m08).
- [x] README : statut « 1.0.0 en préparation (release à venir) ».
- [ ] README et CLAUDE.md : revérifier les chiffres après le correctif éventuel du point 3.
- [ ] `/end-session` : mettre à jour la mémoire du projet et fermer le milestone `v1.0.0`.
