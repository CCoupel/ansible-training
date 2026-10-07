# Procédure de Test — Hébergement GitHub Pages

**Version** : 0.2.0
**Date** : [date]
**Testeur** : QA (après activation de Pages par `deployer`, sur confirmation explicite de l'utilisateur)

Cette procédure ne s'applique qu'**après** la release et l'activation de Pages (source « GitHub Actions »,
variable `PAGES_ENABLED=true`). Si l'utilisateur refuse l'activation : release livrée sans hébergement,
cette procédure est **sans objet** (noter « N/A — Pages non activé »).

## Prérequis

- [ ] Environnement : PROD (URL publique du dépôt)
- [ ] Données : tag `vX.Y.Z` publié avec les 2 assets (`Ansible-Training-vX.Y.Z.pptx`, `Ansible-Training-HTML-vX.Y.Z.zip`)
- [ ] `gh run list --workflow pages.yml` : dernier run terminé en succès
- [ ] Zip de release téléchargé et dézippé dans un dossier vide (`dezip/`) pour la comparaison

## Scénarios

### Scenario 1 — Site en ligne

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | `curl -sI <URL publique>/` | HTTP 200 | | |
| 2 | Ouvrir l'URL dans un navigateur | L'accueil s'affiche ; version affichée = `vX.Y.Z` du tag | | |
| 3 | Console du navigateur | Aucune erreur 404 sur `assets/` ni `modules/` | | |
| 4 | Ouvrir un module, une ancre `#mNN-k`, la recherche | Fonctionnent comme en local | | |
| 5 | Lien de téléchargement du PPTX | Le fichier est servi (HTTP 200, taille identique à l'asset de release) | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 2 — Contenu identique au zip de release

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | Pour chaque fichier de `dezip/` : `curl -s <URL>/<chemin> \| sha256sum` | sha256 identique à `sha256sum dezip/<chemin>` | | |
| 2 | `curl -sI <URL>/build/` , `/tests/`, `/tools/`, `/.claude/`, `/docs/` | 404 (seuls `index.html`, `assets/`, `modules/` et le PPTX sont servis) | | |
| 3 | Aucune branche `gh-pages` : `git ls-remote --heads origin gh-pages` | Aucune sortie | | |

**Verdict** : [ ] PASS  [ ] FAIL

---

### Scenario 3 — Absence de fuite en ligne

| Etape | Action | Resultat Attendu | Resultat Obtenu | OK ? |
|-------|--------|-----------------|----------------|------|
| 1 | `LEAK_PATTERNS="$(cat leak_patterns.txt)" python3 tests/site/check_site.py --require-secret --dir dezip` | `OK` | | |
| 2 | Parcourir l'accueil et 3 modules en ligne | Aucune référence d'organisation (liste fournie par le teamleader, non recopiée ici) | | |

**Verdict** : [ ] PASS  [ ] FAIL

## Criteres de Validation

- [ ] URL publique 200, version = tag, aucun 404 sur les ressources
- [ ] Contenu en ligne identique au zip de release ; rien d'autre n'est servi
- [ ] Aucune fuite

## Notes QA

[URL testée, date, run Actions]
