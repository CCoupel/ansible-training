# Ansible Training — Support de Formation Générique

Support de cours de formation Ansible (PPTX), version générique sans références à l'organisation d'origine. Destiné à la distribution publique et utilisable en formation présentielle.

## Contenu

Le support couvre l'automatisation avec Ansible en 223 diapositives :

- **Fondamentaux** : concepts, architecture, inventaire, variables, playbooks
- **Modules et tâches** : modules intégrés, FQCN, gestion de packages, services
- **Interactivité et flux** : conditionnels, boucles, gestion d'erreurs, tags
- **Réutilisabilité** : rôles, Galaxy, collections, modules personnalisés
- **Outils avancés** : Molecule, callbacks, vault, inventaire dynamique
- **Intégrations** : AWX/automation controller, exemples d'orchestration

Chaque diaporama inclut des notes pédagogiques et des exemples de code réutilisables.

## Versions de Référence

Le support est aligné sur :

- **ansible-core** : 2.20 or later
- **Python** (nœud de contrôle) : 3.12 or later

Ces versions sont affichées sur la page de titre (diapositif 2) et peuvent être consultées dans le fichier `.claude/project-config.json` (clé `reference_version`).

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

- **Validité** : archive ZIP valide, `[Content_Types].xml` en première position, 223 diapositives
- **Obsolescence** : absence de termes dépassés, versions correctes, syntaxe Ansible valide
- **Anti-fuite** : scan des métadonnées XML et des images pour empêcher la fuite de termes interdits

## Publication et CI

Chaque version est publiée automatiquement via GitHub Actions lors d'un tag `vX.Y.Z` :

```bash
git tag v0.1.1
git push origin v0.1.1
```

### Workflow de Release (`.github/workflows/release.yml`)

Le workflow exécute les étapes suivantes :

1. **Validation du tag** : format `vX.Y.Z` requis
2. **Contrôles** :
   - Validité du PPTX (archive, format)
   - Anti-fuite : scan des termes sensibles via le secret `LEAK_PATTERNS`
   - Vérification que la diapositif 2 affiche la version correcte
3. **Publication** : création/mise à jour de la release GitHub avec l'asset versionné `Ansible-Training-vX.Y.Z.pptx`

### Prérequis — Secret `LEAK_PATTERNS`

**Avant de créer un tag pour la publication**, le secret GitHub `LEAK_PATTERNS` doit être configuré sur le dépôt :

```bash
# Créer un fichier local avec une regex par ligne (nombres, noms sensibles, domaines, etc.)
# Exemple :
# ^...$ (une regex insensible à la casse par ligne)

gh secret set LEAK_PATTERNS < leak_patterns.txt
```

**Vérification** : `gh secret list` affiche `LEAK_PATTERNS` comme présent (le contenu n'est jamais affiché).

**Sans ce secret**, le workflow échoue volontairement au scan et refuse de publier la release. Cela protège contre une publication accidentelle avec des termes sensibles.

### Extensibilité (v0.2.0)

Le workflow est conçu pour supporter des artefacts supplémentaires (HTML, PDF) :

- Variable `ARTIFACTS` dans le workflow : une ligne par artefact (`<source>|<asset>`)
- Ajouter un contrôle dans l'étape « Contrôles » pour chaque nouveau type

## Structure

```
.
├── README.md                          # Ce fichier
├── CHANGELOG.md                       # Historique des versions
├── CLAUDE.md                          # Configuration projet
├── Ansible Training.pptx              # Support de formation
├── Ansible Training.orig.pptx         # Sauvegarde originale (non tracée)
├── tests/
│   ├── slides/
│   │   ├── check_pptx.py              # Scan de validité et anti-fuite
│   │   ├── pptx_reader.py             # Lecteur PPTX (stdlib)
│   │   └── obsolescence/
│   │       └── test_*.py              # Tests d'obsolescence
│   └── INDEX.md
├── .github/
│   └── workflows/
│       └── release.yml                # Publication automatique
├── .claude/
│   ├── project-config.json            # Versions de référence
│   ├── agents/                        # Équipe (dev-slides, test-writer, etc.)
│   ├── memory/
│   │   └── MEMORY.md                  # Mémoire du projet
│   └── ...
└── docs/
    ├── mockup/
    │   └── DECISIONS.md               # Décisions de conception

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
