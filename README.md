# Ansible Training — Support de Formation Générique

Support de cours de formation Ansible (PPTX), version générique sans références à l'organisation d'origine. Destiné à la distribution publique et utilisable en formation présentielle.

## Contenu

Le support couvre l'automatisation avec Ansible en 223 slides :

- **Fondamentaux** : concepts, architecture, inventaire, variables, playbooks
- **Modules et tâches** : modules intégrés, FQCN, gestion de packages, services
- **Interactivité et flux** : conditionnels, boucles, gestion d'erreurs, tags
- **Réutilisabilité** : rôles, Galaxy, collections, modules personnalisés
- **Outils avancés** : Molecule, callbacks, vault, inventaire dynamique
- **Intégrations** : AWX/automation controller, exemples d'orchestration

Chaque slide inclut des notes pédagogiques et des exemples de code réutilisables.

## Versions de Référence

Le support est aligné sur :

- **ansible-core** : 2.20 or later
- **Python** (nœud de contrôle) : 3.12 or later

Ces versions sont affichées sur la slide 2 et peuvent être consultées dans le fichier `.claude/project-config.json` (clé `reference_version`).

## Tests

Les contrôles automatiques sont exécutés sur l'archive PPTX :

```bash
# Tests d'obsolescence (détectent les incohérences de contenu)
python3 -m unittest discover -s tests/slides/obsolescence -p 'test_*.py'
LOTS_STRICT=1 python3 -m unittest discover -s tests/slides/obsolescence

# Scan de validité et anti-fuite (local)
python3 tests/slides/check_pptx.py "Ansible Training.pptx"

# Avec secret LEAK_PATTERNS (pour blocage complet)
export LEAK_PATTERNS="$(cat leak_patterns.txt)"  # une regex par ligne
python3 tests/slides/check_pptx.py "Ansible Training.pptx"
```

Les tests incluent :

- **Validité** : archive ZIP valide, `[Content_Types].xml` en première position, 223 slides
- **Obsolescence** : absence de termes dépassés, versions correctes, syntaxe Ansible valide
- **Anti-fuite** : scan des métadonnées XML et des images pour empêcher la fuite de termes interdits

## Publication et CI

Chaque version est publiée automatiquement via GitHub Actions lors d'un tag `vX.Y.Z` posé sur la branche `main` :

```bash
# 1. Merger la branche milestone sur main
git checkout main
git merge milestone/v0.1.1

# 2. Poser le tag sur main
git tag v0.1.1

# 3. Pousser main et le tag
git push origin main
git push origin v0.1.1
```

**Règle critique** : le tag doit être posé sur `main` (ou un ancêtre de main). La CI vérifie que le commit du tag est dans l'historique de `origin/main` avant de publier. Sans cela, la release échoue avec le message : « Le tag vX.Y.Z n'est pas sur main : merge d'abord la branche milestone sur main puis retag ».

### Workflow de Release (`.github/workflows/release.yml`)

À partir de v0.2.0, le workflow publie trois artefacts : le PPTX, le zip HTML et sa somme de contrôle. Étapes :

1. **Validation du tag** : format `vX.Y.Z` requis ; doit être posé sur `main` (garde-fou CI)
2. **Environnement** : Node 22, Python 3.12, secret `LEAK_PATTERNS` présent
3. **Tests bloquants** (échec = arrêt) :
   - Parité HTML-PPTX (`PARITY_STRICT=1`, 131 tests)
   - Obsolescence PPTX (`LOTS_STRICT=1`, 42 tests)
   - Structure (`validate.js`), version dans `meta.js` (`sync-meta --check --version`)
4. **Contrôles par artefact** :
   - **PPTX** : validité, anti-fuite (`LEAK_PATTERNS`), slide 2 affiche version et date du tag
   - **Zip HTML** : archive valide, contenu complet (index.html, assets/, modules/, PPTX), PPTX embarqué identique au PPTX du tag, `meta.js` affiche version et date du tag, **date de meta.js doit être identique à date de la slide 2**, anti-fuite du contenu
5. **Publication** : création/mise à jour de la release GitHub avec trois assets :
   - `Ansible-Training-vX.Y.Z.pptx`
   - `Ansible-Training-HTML-vX.Y.Z.zip`
   - `Ansible-Training-HTML-vX.Y.Z.zip.sha256` (somme de contrôle, téléchargeable)

### Prérequis avant Release v0.2.0+

**À valider avant de poser le tag** (le CI les vérifiera) :

1. **Secret `LEAK_PATTERNS`** : configuré sur le dépôt
   ```bash
   # Créer un fichier local avec une regex par ligne (nombres, noms sensibles, domaines, etc.)
   # Exemple : ^...$ (insensible à la casse, une par ligne)
   gh secret set LEAK_PATTERNS < leak_patterns.txt
   
   # Vérifier
   gh secret list  # affiche LEAK_PATTERNS (jamais le contenu)
   ```
   **Sans ce secret**, le workflow échoue volontairement (protection contre publication accidentelle avec termes sensibles).

2. **Date de livraison** — **cohérence requise** (workflow la contrôle) :
   - `assets/meta.js` : `"date": "07/10/2026"` (commit `6596dbf`, fixée pour v0.2.0)
   - Slide 2 du PPTX : doit afficher `07/10/2026` (commit `0d8552a`, OK)
   - **Le workflow échoue si les deux dates diffèrent**
   - Si date différente : `node tools/sync-meta.js --date JJ/MM/AAAA` + commiter + slide 2 alignée

3. **Slide 2 du PPTX** — **cohérence requise** (workflow la contrôle) :
   - Doit afficher version v0.2.0 (ou vX.Y.Z du tag) : ✓ (commit `0d8552a` pour v0.2.0)
   - Doit afficher date de livraison (JJ/MM/AAAA) : ✓ (commit `0d8552a`)
   - **Date doit être identique à celle de `assets/meta.js`**

4. **Branche mergée** : `milestone/vX.Y.Z` doit être mergée sur `main` avant le tag
   ```bash
   git checkout main
   git merge milestone/vX.Y.Z
   git push origin main
   # Puis poser le tag sur main
   git tag vX.Y.Z && git push origin vX.Y.Z
   ```

5. **Tests locaux** : tous les tests du workflow doivent passer
   ```bash
   PARITY_STRICT=1 RELEASE_TAG=v0.2.0 python3 -m unittest discover -s tests/site
   LOTS_STRICT=1 python3 -m unittest discover -s tests/slides/obsolescence
   node tools/validate.js
   node tools/sync-meta.js --check --version 0.2.0
   node tools/package.js && unzip -t build/Ansible-Training-HTML.zip > /dev/null
   ```
   Utiliser Node 22 et Python 3.12 ; `node` Linux (wrapper Windows donne faux échecs).

### Vérification de l'intégrité (après release)

Une fois la release publiée, vérifier l'intégrité du zip :

```bash
# Télécharger Ansible-Training-HTML-vX.Y.Z.zip et .sha256 de la release GitHub
# Dans le même dossier :
sha256sum -c Ansible-Training-HTML-vX.Y.Z.zip.sha256
# Affiche : "Ansible-Training-HTML-vX.Y.Z.zip: OK" en cas de succès
```

Le fichier `.sha256` est généré automatiquement par le workflow et permet la vérification locale sans accès au git.

### Extensibilité (v0.2.0)

Le workflow est conçu pour supporter des artefacts supplémentaires (HTML, PDF) :

- Variable `ARTIFACTS` dans le workflow : une ligne par artefact (`<source>|<asset>`)
- Ajouter un contrôle dans l'étape « Contrôles » pour chaque nouveau type

## Version HTML

À partir de v0.2.0, le support est disponible en version HTML interactive : 15 modules, 217 slides (hors slides masquées), 45 quiz, objectifs et résumés par module, accessibilité complète (clavier, SVG nommés, alt descriptifs), interface en français.

### Ouverture du cours HTML

**Sur tout système** (Windows, macOS, Linux) :

```bash
# 1. Clone ou téléchargement du dépôt
git clone https://github.com/CCoupel/ansible-training.git
cd ansible-training

# 2. Double-clic sur `index.html`
# Ou via le navigateur :
# - Firefox : Ouvrir File > index.html
# - Chrome : --allow-file-access-from-files (ou serveur local)

# 3. Optional : serveur local (pour des tests complets)
python3 -m http.server 8000
# Puis : http://localhost:8000/
```

**Prérequis** : aucun. Le site est un ensemble de fichiers HTML/CSS/JS statiques ouvrable en `file://` (double-clic).

**Note Windows** : si les images ou modules ne chargent pas, vérifier que les chemins ne contiennent pas de caractères spéciaux (répertoire racine sans espaces recommandé).

### Contenu du zip HTML (release)

Le fichier `Ansible-Training-HTML-vX.Y.Z.zip` publié sur GitHub (généré par `node tools/package.js`) contient :
- `index.html` — page d'accueil du cours
- `assets/` — moteur (engine.js), styles (style.css), images (img/), internationalisations (i18n/fr.js)
- `modules/` — 15 modules (m01–m15)
- `Ansible Training.pptx` — support original à la racine (lien téléchargement disponible depuis l'accueil)

**Total : 51 fichiers**, ouvrable en `file://` (double-clic) sans serveur.

**Aucun embarquement de** : `tools/`, `tests/`, `CONVENTIONS.md`, `build/`, `.github/`, `.claude/`, ou autres répertoires du dépôt.

### Structure du Dépôt (source du site)

La section ci-dessous décrit l'arborescence du **dépôt git**, y compris les fichiers n'étant pas dans le zip publié :

```
.
├── index.html                         # Page d'accueil, manifeste des 15 modules
├── assets/
│   ├── engine.js                      # Moteur de présentation (navigation, thème, notes)
│   ├── style.css                      # Styles (clair/sombre, accessibilité)
│   ├── plan.js                        # Manifeste : 15 modules, metadata
│   ├── meta.js                        # Version, date, versions de référence (généré)
│   ├── i18n/
│   │   └── fr.js                      # Libellés en français
│   └── img/
│       ├── *.png                      # Images converties (19 WMF, 9 PNG)
│       └── images.json                # Index des images (slide source, hash)
├── modules/
│   ├── m01-introduction.js            # Module 01 : Introduction
│   ├── m02-inventory.js               # Module 02 : Inventory
│   ├── ... (m03 à m15)
│   └── m15-automation-integration.js  # Module 15 : Automation Integration
├── tools/                             # 🚫 Non embarqué dans le zip
│   ├── validate.js                    # Vérification de structure du site
│   ├── sync-meta.js                   # Génération de assets/meta.js
│   ├── dump-course.js                 # Export JSON du contenu
│   ├── package.js                     # Création du zip HTML
│   └── check_links.py                 # Audit des liens (HTTP)
├── tests/                             # 🚫 Non embarqué dans le zip
│   └── site/
│       ├── test_*.py                  # Tests de parité, accessibilité, structure
│       └── parity_exceptions.json     # Exceptions documentées (2 liens masqués)
├── CONVENTIONS.md                     # 🚫 Non embarqué dans le zip
```

### Conventions et contenu

- **Verbatim du PPTX** : texte copié exactement (coquilles conservées sauf si corrigées dans le PPTX)
- **Quiz** : 45 quiz (3 par module), une seule réponse défendable, distracteurs tirés d'erreurs classiques du module
- **Objectifs et « À retenir »** : dérivés du contenu du module, en français, avec références aux slides sources
- **Accessibilité** : clavier complet (flèches, Enter, Espace), SVG nommés, alt descriptif, notes du formateur (touche `n`)
- **Thème** : clair/sombre (préférence utilisateur)

Voir `CONVENTIONS.md` pour les détails (blocs, code, tables, labs, SVG, etc.).

### Tests du site

```bash
# Tests de parité PPTX-HTML (tous les OS)
PARITY_STRICT=1 python3 -m unittest discover -s tests/site -p 'test_*.py'

# Validation de structure
node tools/validate.js

# Vérification des liens (hors-ligne : liens locaux uniquement)
python3 tools/check_links.py --offline

# Export JSON du contenu (pour scripts tiers)
node tools/dump-course.js > build/course.json

# Création du zip (asset de release)
node tools/package.js
```

**Note Windows** : utiliser Node.js Linux (WSL) pour les tests complets ; le wrapper `node.exe` Windows a des chemins en `C:\mnt\…` qui peuvent causer des faux échecs (environnement, non contenu).

## Structure du Dépôt

```
.
├── README.md                          # Ce fichier
├── CHANGELOG.md                       # Historique des versions
├── CLAUDE.md                          # Configuration projet
├── Ansible Training.pptx              # Support de formation (PPTX)
├── Ansible Training.orig.pptx         # Sauvegarde originale (non tracée)
├── index.html                         # Page d'accueil site HTML
├── assets/                            # Moteur, styles, images, metadata du site
├── modules/                           # 15 modules du site HTML (m01–m15)
├── tools/                             # Outils (validate, sync-meta, etc.)
├── CONVENTIONS.md                     # Règles PPTX → HTML
├── tests/
│   ├── slides/
│   │   ├── check_pptx.py              # Scan de validité et anti-fuite (PPTX)
│   │   ├── pptx_reader.py             # Lecteur PPTX (stdlib)
│   │   └── obsolescence/
│   │       └── test_*.py              # Tests d'obsolescence (PPTX)
│   ├── site/
│   │   ├── test_*.py                  # Tests parité/accessibilité (HTML)
│   │   └── parity_exceptions.json     # Exceptions documentées
│   └── INDEX.md
├── .github/
│   └── workflows/
│       └── release.yml                # Publication PPTX + HTML (GitHub Actions)
├── .claude/
│   ├── project-config.json            # Versions de référence
│   ├── agents/                        # Équipe (dev-slides, test-writer, etc.)
│   ├── memory/
│   │   └── MEMORY.md                  # Mémoire du projet
│   └── ...
└── docs/
    ├── plans/
    │   ├── v0.2.0/
    │   │   ├── plan-v0.2.0.md         # Plan d'implémentation HTML
    │   │   └── ...                    # Rapports, maquettes (archives)
    ├── mockup/
    │   └── DECISIONS.md               # Décisions de conception
    └── ...

```

## Contribution et Maintenance

- **Contenu** : modifications via la branche `milestone/vX.Y.Z`
- **Versions de référence** : toujours mises à jour dans `reference_version` (`.claude/project-config.json`)
- **Tests** : avant chaque version, tous les contrôles doivent passer
- **Release** : automatique via CI après push du tag

## Licence

Consultez la licence applicable du dépôt (ce document ne la précise pas).

---

**Dernière mise à jour** : 06/10/2026  
**Version du support** : 0.1.1  
**Versions de référence** : ansible-core 2.20, Python 3.12+
