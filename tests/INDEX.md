# Index des tests

| Chemin | Niveau | Composant | Feature | Statut | Tags |
|--------|--------|-----------|---------|--------|------|
| tests/slides/obsolescence/ | unit | slides | v0.1.1 correctifs d'obsolescence (une assertion par issue #10-#48 ; v1.0.0 : `test_issue_19_*` sur le module m13 « Execution Environments » (slides lues via `plan.js`), lot #19 absent de `lots_faits.json` tant que le contenu n'existe pas ; suivi des lots livrés dans `lots_faits.json` : lot non livré = skip « attendu, lot non fait », `LOTS_STRICT=1` = tout doit être vert) | feature | - |
| tests/slides/anti-fuite/ | integration | ci | v0.1.1 contrôle anti-fuite et validité du PPTX (`check_pptx.py`, #49 ; valeurs attendues dans `tests/slides/expected.json`) | feature | smoke, critical |
| tests/procedures/slides/revue-visuelle/ | manual | slides | v0.1.1 revue visuelle du support (débordements, call-outs, images) | feature | - |
| tests/site/validate/ | unit | site | v0.2.0 validateur `tools/validate.js` (fixtures générées : blocs, `src`, `img`, balises, objectifs/À retenir/quiz, `ref`) + site commité (0 erreur, `node --check`) + jours du plan (J1-J4 acceptés, J5 refusé) — rouge tant que le site n'existe pas | feature | smoke |
| tests/site/extras/ | unit | site | v0.2.0 contenu additionnel « Bonus HTML » (3-5 objectifs, 4-6 À retenir, 1-3 quiz, `ref` ⊂ module, `<code>` ⊂ PPTX, IP 192.0.2.x, version de référence) | feature | - |
| tests/site/outils/ | integration | site | v0.2.0 outils : `check_site.py` (anti-fuite du HTML commité, masquage), `sync-meta.js`/`meta.js` (version), liens hors ligne (#50), v1.0.0 : `renumber.py` (insertion début/milieu/fin, refus suppression/réordonnancement, idempotence, arbre sale, motifs de code) `slide_index.json` synchrone avec le PPTX (#5) et `test_agenda` (slide 3 à 4 jours = `day` de `plan.js`) | feature | smoke, critical |
| tests/site/parite/ | integration | site | v0.2.0 parité PPTX ⊂ HTML (couverture, texte, notes, liens, images ; `PARITY_STRICT=1` = 15 modules ; exceptions dans `parity_exceptions.json`) | feature | critical |
| tests/site/livraison/ | integration | site | v0.2.0 zip de release déterministe (PPTX embarqué octet pour octet, lien accueil valide, `.gitattributes`), site autonome sans trace OpenShift, hygiène git (aucun artefact généré suivi hors `meta.js`), version = tag (`RELEASE_TAG`), v1.0.0 : aucun module « à venir » en release (`PARITY_STRICT=1`) | feature | critical |
| tests/procedures/site/revue-visuelle/ | manual | site | v0.2.0 revue visuelle du site (accueil, navigation, thèmes, images, exercices, quiz, mobile, absence de fuite) | feature | - |
| tests/procedures/site/hebergement/ | manual | site | v0.2.0 hébergement GitHub Pages (URL 200, version = tag, contenu = zip, rien d'autre servi) | feature | - |
| tests/procedures/site/relecture-bonus/ | manual | site | v0.2.0 relecture humaine R1/R2 du contenu additionnel (exactitude, aucune invention, quiz, ton) | feature | - |
