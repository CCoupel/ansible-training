# Release et CI — Ansible Training

> Procédure de publication d'une version `vX.Y.Z` (référencée par `CLAUDE.md`, section « Release et CI »).
> Les chiffres (slides, tests, fichiers du zip) ne sont pas recopiés ici : leurs sources de vérité sont
> `tests/slides/expected.json` (slides, masquées), `assets/plan.js` (plages et jours) et `assets/meta.js` (version, date).

---

## Workflow de publication

Chaque version est publiée par GitHub Actions (`.github/workflows/release.yml`) lors d'un tag `vX.Y.Z` posé sur `main`
ou d'un lancement manuel (`workflow_dispatch`). Le site est ensuite déployé sur GitHub Pages par `pages.yml`,
appelé par le job `pages` de `release.yml`.

```bash
# 1. Merger milestone/vX.Y.Z sur main
git checkout main
git merge milestone/vX.Y.Z

# 2. Poser le tag sur main et pousser (main d'abord)
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z

# Ou via dispatch (relance d'un tag existant, ex. échec partiel du workflow)
gh workflow run release.yml -f tag=vX.Y.Z
```

**Règles critiques** :
- Le tag doit être sur `main` (ou en ancêtre de `main`) : la CI le vérifie avec `git merge-base --is-ancestor`
  sur `origin/main` et échoue sinon, avec un message explicite.
- La slide 2 du PPTX et `assets/meta.js` doivent afficher la **même version** (vX.Y.Z = tag) et la **même date de
  livraison** (JJ/MM/AAAA). La CI contrôle la cohérence et échoue si l'une manque ou diffère.
- GitHub Pages reste en mode **`workflow`** (GitHub Actions) : ne jamais rétablir le mode « branche »
  (Jekyll/Liquid interprète le `.md`/`.yml` de la racine et casse le site). La branche `gh-pages` est réservée
  à l'agent `marketing-release`.

## Contenu de la slide 2

- **Version** : vX.Y.Z (ex. « v1.0.0 »)
- **Date de livraison** : JJ/MM/AAAA, identique à `"date"` de `assets/meta.js`
- **Versions de référence** : « Référence : ansible-core <version> » (lue dans `reference_version` de `.claude/project-config.json`)

## Secret `LEAK_PATTERNS` — prérequis utilisateur

Le secret GitHub `LEAK_PATTERNS` (une regex par ligne : nom de l'organisation, acronymes, domaines sensibles)
doit être configuré sur le dépôt **avant chaque tag** :

```bash
cat > leak_patterns.txt <<EOF
motif1
motif2
EOF
gh secret set LEAK_PATTERNS < leak_patterns.txt
gh secret list   # affiche LEAK_PATTERNS comme présent (jamais le contenu)
```

**Sans ce secret**, le workflow échoue volontairement au scan et refuse de publier (protection contre une
publication accidentelle). Il n'est jamais écrit dans les logs.

## Contrôles bloquants de la CI

1. **Préalables** (après checkout du tag) : format `vX.Y.Z`, tag ancêtre de `origin/main`, secret `LEAK_PATTERNS` présent.
2. **Environnement** : Node 22 et Python 3.12 (actions épinglées par SHA).
3. **Tests** (échec = arrêt) :
   - `PARITY_STRICT=1 python3 -m unittest discover -s tests/site` (`RELEASE_TAG=$TAG` active le contrôle de version de la slide 2)
   - `I18N_STRICT=1` : traduction fr/en complète obligatoire, un module partiellement traduit bloque le tag
   - `LOTS_STRICT=1 python3 -m unittest discover -s tests/slides/obsolescence` (validité du PPTX et versions)
   - `node tools/validate.js --strict-i18n` (structure HTML/SVG/quiz, parité des clés fr/en)
   - `node tools/sync-meta.js --check --version "${TAG#v}"` (`meta.js` à la bonne version, sans réécriture)
4. **Artefacts** :
   - **PPTX** `Ansible Training.pptx` → `Ansible-Training-vX.Y.Z.pptx` : validité de l'archive ZIP
     (`[Content_Types].xml` en première position), anti-fuite des métadonnées XML et images
     (`tests/slides/check_pptx.py` avec `LEAK_PATTERNS`), version et date de la slide 2.
   - **Zip HTML** `build/Ansible-Training-HTML.zip` (généré par `node tools/package.js`) →
     `Ansible-Training-HTML-vX.Y.Z.zip` : `unzip -t`, présence de `index.html`, `assets/meta.js` et
     `Ansible Training.pptx` à la racine ; PPTX embarqué identique à celui du tag (`cmp`) ; `meta.js` à la
     version du tag et à la date de la slide 2 ; anti-fuite du site
     (`tests/site/check_site.py --dir <extraction> --require-secret`) et du PPTX embarqué.
   - **`.sha256`** du zip, pour vérification locale (`sha256sum -c`).
5. **Release notes** : section `## [X.Y.Z] - JJ/MM/AAAA` du `CHANGELOG.md` si présente (laisser une section
   `[Unreleased]` vide au-dessus), sinon notes générées automatiquement.

**Non exécuté en CI** : `tools/check_links.py` (hors ligne ou connecté, manuel).

## Vérifications locales avant tag

Le CI refusera la release si ces commandes échouent : les lancer avant de pousser le tag (QA responsable).
Prérequis : Node 22+ **Linux** (le wrapper `node.exe` Windows donne de faux échecs) et Python 3.12+.

```bash
# Tests du site (parité, accessibilité, structure) et du PPTX (obsolescence)
PARITY_STRICT=1 RELEASE_TAG=vX.Y.Z python3 -m unittest discover -s tests/site
LOTS_STRICT=1 python3 -m unittest discover -s tests/slides/obsolescence

# Structure HTML + SVG + quiz, et version de meta.js
node tools/validate.js --strict-i18n
node tools/sync-meta.js --check --version X.Y.Z

# Packaging (déterministe, PPTX inclus, refuse un arbre modifié : committer avant) et vérification du zip
node tools/package.js
unzip -t build/Ansible-Training-HTML.zip > /dev/null
sha256sum build/Ansible-Training-HTML.zip

# Anti-fuite PPTX et audit des liens (manuel) — avec le secret en local
export LEAK_PATTERNS="$(cat leak_patterns.txt)"
python3 tests/slides/check_pptx.py "Ansible Training.pptx"
python3 tools/check_links.py --offline   # ou sans --offline : requêtes HTTP, peut être lent/instable
```

**Prérequis avant tag** (vérifiés par la CI) :

1. Secret `LEAK_PATTERNS` configuré (`gh secret list`).
2. **Date** : `assets/meta.js` (`"date"`) et slide 2 identiques. Si elles diffèrent :
   `node tools/sync-meta.js --date JJ/MM/AAAA` + commit, et slide 2 alignée par `dev-slides`.
3. **Version** : slide 2 et `assets/meta.js` (`"version"`) égales au tag.
4. `milestone/vX.Y.Z` mergée sur `main` et `main` poussée avant le tag.
5. Toutes les vérifications locales ci-dessus au vert.

## Revues manuelles (hors CI)

- **Revue bilingue du site** : `tests/procedures/site/revue-visuelle-bilingue/` (bascule FR | EN, `?lang=`, repli, libellés).
- **Lab EDA « testé »** : `tests/procedures/labs/eda/lab-teste.md`, sur un poste avec Java 17+ et `ansible-rulebook`.
  La CI ne vérifie que la structure YAML de `labs/eda/` et `examples/eda/`.
