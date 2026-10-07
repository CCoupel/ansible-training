<!--
  composant : build-publish (sources commitées → contrôles → release / hébergement optionnel)
  feature   : version HTML du support + exigence permanente PPTX+HTML (#3, #5)
  version   : 0.2.0
  type      : architecture
  issue     : #3, #5
  complete  : aucune
  remplace  : aucune (révision 2 du brouillon : hébergement Q1 décidé = Pages via Actions à chaque release)
-->

# Architecture — site commité, contrôles, release, hébergement optionnel

## 1. Arborescence (branche de code `milestone/v0.2.0` → `main`) — calquée sur le cours OpenShift

```
/                                    racine du dépôt (PUBLIC)
├── index.html                       [main]   coquille du site, 1 <script> par module
├── assets/
│   ├── engine.js                    [main]   moteur porté d'OpenShift (MIT) + notes, img, src, extra
│   ├── plan.js                      [main]   manifeste COURSE.plan (15 modules, champ day)
│   ├── style.css                    [main]   thème bleu, clair/sombre
│   ├── meta.js                      [gén.+commité]  version, reference_version, date ← tools/sync-meta.js
│   └── img/  *.png, images.json     [extrait+commité] depuis le PPTX (dev-slides)
├── modules/
│   ├── m01-introduction.js          [main]   COURSE.add({…, slides:[{src:[4], …}]})
│   ├── m02-inventory.js             [main]   (pilote)
│   └── … m15-automation-integration.js
├── tools/
│   ├── validate.js                  [main]   schéma + cohérence plan/index/modules
│   ├── sync-meta.js                 [main]   écrit / vérifie (--check) assets/meta.js
│   ├── dump-course.js               [main]   → build/course.json (non commité)
│   ├── package.js                   [main]   → build/Ansible-Training-HTML.zip (non commité, déterministe)
│   └── check_links.py               [main]   liens : --offline (tests) / --online débit limité (manuel)
├── CONVENTIONS.md                   [main]   schéma, blocs, règles de conversion, statut des fichiers
├── Ansible Training.pptx            [main]   support PPTX (inchangé de rôle ; référence de parité)
├── README.md, CHANGELOG.md          [main]   existants, coexistent (comme OpenShift)
├── docs/  PLAN.md, PROCESS-PPTX-HTML.md, mockup/
├── tests/
│   ├── slides/                      existant (PPTX : anti-fuite, obsolescence)
│   ├── site/                        NOUVEAU : parité, check_site.py, meta, liens, package, hygiène
│   └── procedures/site/             NOUVEAU : revue visuelle, hébergement
├── build/                           [ignoré]  course.json, zip, img-contact.html
└── .github/workflows/
    ├── ci.yml                       NOUVEAU  push milestone/** + PR
    ├── release.yml                  ÉTENDU   ARTIFACTS += zip HTML, cas *.zip
    └── pages.yml                    NOUVEAU (Q1 décidé) : Actions Pages, artefact limité, appelé par release.yml si PAGES_ENABLED
```

`[main]` = écrit à la main · `[gén.+commité]` = seul fichier généré suivi par git · `[ignoré]` = jamais commité.

## 2. Flux

```mermaid
flowchart LR
  subgraph SRC["Branche de code (commité, public dès le push)"]
    PPTX["Ansible Training.pptx"]
    SITE["index.html + assets/ + modules/"]
    CFG[".claude/project-config.json<br/>version + reference_version"]
    META["assets/meta.js (généré, commité)"]
  end

  CFG -->|tools/sync-meta.js| META
  META --> SITE

  subgraph LOCAL["Avant commit / push (poste)"]
    LK["check_site.py<br/>motifs complets locaux"]
  end
  SITE --> LK

  subgraph CI["ci.yml (push milestone/**, PR)"]
    V["validate.js + sync-meta --check"]
    D["dump-course.js → build/course.json"]
    P["test_parity.py"]
    G["check_site.py (motifs génériques)"]
  end
  SITE --> V --> D --> P
  PPTX --> P
  SITE --> G

  subgraph REL["release.yml (tag vX.Y.Z sur main)"]
    PK["package.js → build/Ansible-Training-HTML.zip"]
    C1["check_pptx.py + version slide 2 (existant)"]
    C2["cas *.zip : check_site.py AVEC LEAK_PATTERNS<br/>(arbre commité + zip) · parité stricte · meta.js = tag"]
    GR["GitHub Release : .pptx + HTML .zip"]
  end
  SITE --> PK --> C2 --> GR
  PPTX --> C1 --> GR

  GR -->|workflow_call si PAGES_ENABLED| PG["pages.yml : parité + anti-fuite (secret)<br/>artefact = index.html, assets/, modules/, PPTX<br/>→ GitHub Pages (Actions)"]
```

Activation de Pages (source « GitHub Actions ») par `deployer` après confirmation explicite de l'utilisateur ; tant que `PAGES_ENABLED` ≠ `true`, la release se termine sans déploiement.

## 3. Parité PPTX ↔ HTML (définition testable, inchangée)

```mermaid
flowchart TD
  A["Pour chaque slide PPTX N<br/>(hors masquées 193/210/217 — Q3, hors 1-3 = accueil)"] --> B{"≥ 1 slide HTML<br/>avec N ∈ src ?"}
  B -- non --> E1["ÉCHEC : slide N non convertie"]
  B -- oui --> C["Lignes de texte PPTX normalisées<br/>(espaces, NBSP, puces)"]
  C --> D{"chaque ligne ⊂ texte HTML<br/>des slides src∋N (balises retirées,<br/>entités décodées) ?"}
  D -- non --> X{"ligne dans<br/>parity_exceptions.json<br/>(justifiée) ?"}
  X -- non --> E2["ÉCHEC : texte manquant (slide N, ligne k)"]
  X -- oui --> F
  D -- oui --> F["Notes PPTX N ⊂ notes HTML"]
  F --> G["Liens externes PPTX N ⊂ liens HTML"]
  G --> H["Images PPTX N ↔ assets/img/images.json"]
  H --> OK["OK"]
  R["Slide HTML sans src<br/>et sans extra:true"] --> E3["ÉCHEC : contenu non sourcé"]
  BX["Objectifs, À retenir, quiz (extra)<br/>= Bonus HTML (Q2)"] --> EX["exclus de la parité<br/>contrôlés par test_extras.py :<br/>ref ⊂ src du module, code ⊂ PPTX"]
```

Entrée HTML de la parité : `build/course.json` produit par `tools/dump-course.js` depuis les fichiers commités (aucun site généré).

## 4. Hébergement (Q1 décidé : GitHub Pages via Actions à chaque release)

| Élément | Valeur |
|---|---|
| Mécanisme | `pages.yml` (configure-pages / upload-pages-artifact / deploy-pages, épinglés par SHA), `workflow_call` depuis `release.yml` + `workflow_dispatch` — identique à OpenShift |
| Servi | `index.html`, `assets/`, `modules/`, `Ansible Training.pptx` (rien d'autre du dépôt) |
| Contrôles avant mise en ligne | parité stricte + `check_site.py` avec `LEAK_PATTERNS` (absent → échec) |
| Activation | `deployer`, après confirmation explicite de l'utilisateur (dépôt public) : source « GitHub Actions » + variable `PAGES_ENABLED=true` |

Aucune branche `gh-pages`, aucun worktree `MARKETING/`.
