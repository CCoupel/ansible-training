"""Règles du site fr/en (#51) appliquées à un module de `course.json` — stdlib uniquement.

Contrat (liste fermée des champs traduisibles ; chaque champ `X` a un frère `X_en`, `options` → `options_en`) :
  module        tagline                      → tagline_en
  objectifs / À retenir   html               → html_en
  quiz          q, options, explain          → q_en, options_en, explain_en
  slide `extra` title                        → title_en
  img           alt, caption                 → alt_en, caption_en
  diagram       (SVG)                        → svg_en: { title, desc }
Tout autre champ est verbatim (texte du PPTX) et ne peut pas porter de `_en`. `ref` est partagé (pas de `ref_en`).
Complétude « tout ou rien » par module : sans aucun `_en` = module non traduit (toléré hors mode strict) ; avec au
moins un `_en` = tous les champs traduisibles présents.

Les fonctions renvoient des listes de messages (chemin logique + règle) — jamais d'extrait de texte.
"""

import re

ALLOWED_EN = {"tagline_en", "html_en", "q_en", "options_en", "explain_en", "title_en", "alt_en", "caption_en", "svg_en"}
WORDS_GIVEAWAY = ("only", "just", "simply", "always", "never")
# Noms de tags (tagged, always, never…) : identifiants, pas des qualificatifs — exemptés de la règle des mots révélateurs.
# Formes admises : « The <nom> tag » et « The tag named <nom> » (glossaire §4, règle 3).
RE_TAG_NAME = re.compile(r"\b(?:the\s+(?:%s)\s+tag|the\s+tag\s+named\s+(?:%s))\b" % (
    "|".join(WORDS_GIVEAWAY), "|".join(WORDS_GIVEAWAY)), re.I)
RE_CODE = re.compile(r"<code>(.*?)</code>", re.S | re.I)
RE_IP = re.compile(r"(?<![\d.])(\d{1,3}(?:\.\d{1,3}){3})(?![\d])")
RE_SLIDE = re.compile(r"(?i)\bslides?\s+(\d+)")


def _walk(obj, path, out):
    """Collecte (chemin, dict) de tous les dictionnaires du module."""
    if isinstance(obj, dict):
        out.append((path, obj))
        for k, v in obj.items():
            _walk(v, "%s.%s" % (path, k), out)
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            _walk(v, "%s[%d]" % (path, i), out)


def all_dicts(mod):
    out = []
    _walk(mod, mod.get("id", "?"), out)
    return out


def has_any_en(mod):
    return any(k.endswith("_en") for _p, d in all_dicts(mod) for k in d)


def strip(s):
    return re.sub(r"<[^>]+>", "", s)


def codes(s):
    return sorted(c.strip() for c in RE_CODE.findall(s or ""))


def verbatim_errors(mod):
    """`_en` seulement sur un champ traduisible, et au bon endroit."""
    errs = []
    for path, d in all_dicts(mod):
        t = d.get("t")
        for k in d:
            if not k.endswith("_en"):
                continue
            where = "%s.%s" % (path, k)
            if k not in ALLOWED_EN:
                errs.append("%s : `%s` n'est pas un champ traduisible (verbatim)" % (where, k))
            elif k == "tagline_en" and path != mod.get("id", "?"):
                errs.append("%s : tagline_en hors du module" % where)
            elif k == "html_en" and not (".objectives[" in path or ".takeaways[" in path):
                errs.append("%s : html_en hors objectifs / À retenir (texte de slide = verbatim)" % where)
            elif k in ("q_en", "options_en", "explain_en") and t != "quiz":
                errs.append("%s : %s hors d'un quiz" % (where, k))
            elif k == "title_en" and not d.get("extra"):
                errs.append("%s : title_en sur une slide non `extra` (titre de slide = verbatim)" % where)
            elif k in ("alt_en", "caption_en") and t != "img":
                errs.append("%s : %s hors d'un bloc img" % (where, k))
            elif k == "svg_en" and t != "diagram":
                errs.append("%s : svg_en hors d'un bloc diagram" % where)
    for path, d in all_dicts(mod):
        if "ref_en" in d:
            errs.append("%s.ref_en : `ref` est partagé entre les langues" % path)
    return errs


def translatable_fields(mod):
    """[(chemin, nom du champ _en attendu, dict porteur)] pour tout champ du Bonus à traduire."""
    out = []
    if mod.get("tagline"):
        out.append((mod["id"], "tagline_en", mod))
    for kind in ("objectives", "takeaways"):
        for i, it in enumerate(mod.get(kind, [])):
            out.append(("%s.%s[%d]" % (mod["id"], kind, i), "html_en", it))
    for si, s in enumerate(mod.get("slides", [])):
        sp = "%s.slides[%d]" % (mod["id"], si)
        if s.get("extra") and s.get("title"):
            out.append((sp, "title_en", s))
        for bi, b in enumerate(s.get("blocks", [])):
            bp = "%s.blocks[%d]" % (sp, bi)
            _blocks(b, bp, out)
    return out


def _blocks(b, bp, out):
    if not isinstance(b, dict):
        return
    t = b.get("t")
    if t == "quiz":
        for f in ("q_en", "options_en", "explain_en"):
            out.append((bp, f, b))
    elif t == "img":
        if b.get("alt") and not b.get("decorative"):
            out.append((bp, "alt_en", b))
        if b.get("caption"):
            out.append((bp, "caption_en", b))
    elif t == "diagram" and "<title" in str(b.get("html", "")):
        out.append((bp, "svg_en", b))
    for it in b.get("items", []) if isinstance(b.get("items"), list) else []:
        _blocks(it, bp + ".items[]", out)


def completeness_errors(mod):
    """Tout ou rien : un module qui porte au moins un `_en` doit les porter tous."""
    if not has_any_en(mod):
        return []
    errs = []
    for path, name, d in translatable_fields(mod):
        v = d.get(name)
        if v in (None, "", [], {}):
            errs.append("%s : `%s` manquant (module partiellement traduit)" % (path, name))
    for path, d in all_dicts(mod):
        if "svg_en" in d and not (isinstance(d["svg_en"], dict) and d["svg_en"].get("title") and d["svg_en"].get("desc")):
            errs.append("%s.svg_en : `title` et `desc` non vides attendus" % path)
    return errs


def quizzes(mod):
    out = []
    for s in mod.get("slides", []):
        for b in s.get("blocks", []):
            if isinstance(b, dict) and b.get("t") == "quiz":
                out.append(b)
    return out


def quiz_errors(mod):
    """Règles du Bonus appliquées à l'anglais (glossaire §4) — uniquement pour les quiz traduits."""
    errs = []
    for k, q in enumerate(quizzes(mod), 1):
        if "options_en" not in q:
            continue
        w = "%s quiz %d" % (mod["id"], k)
        fr, en = q.get("options", []), q["options_en"]
        if len(en) != len(fr):
            errs.append("%s : options_en (%d) ≠ options (%d)" % (w, len(en), len(fr)))
            continue
        if not 3 <= len(en) <= 4:
            errs.append("%s : %d options (3 ou 4 attendues)" % (w, len(en)))
        ans = q.get("answer")
        if not isinstance(ans, int) or not 0 <= ans < len(en):
            errs.append("%s : answer invalide" % w)
            continue
        plain = [strip(o) for o in en]
        others = [len(o) for i, o in enumerate(plain) if i != ans]
        mean = sum(others) / len(others) if others else 0
        if mean and not (0.7 * mean <= len(plain[ans]) <= 1.3 * mean):
            errs.append("%s : la bonne réponse (%d car.) s'écarte de plus de 30 %% de la moyenne des distracteurs (%.0f)"
                        % (w, len(plain[ans]), mean))
        checked = [RE_TAG_NAME.sub(" ", o) for o in plain]  # noms de tags exemptés
        for word in WORDS_GIVEAWAY:
            rx = re.compile(r"\b%s\b" % word, re.I)
            in_wrong = any(rx.search(o) for i, o in enumerate(checked) if i != ans)
            if in_wrong and not rx.search(checked[ans]):
                errs.append("%s : « %s » réservé aux mauvaises réponses" % (w, word))
        if any(RE_CODE.search(o) for o in en):
            errs.append("%s : <code> dans les options (la forme révèle la réponse)" % w)
        refs = q.get("ref") or []
        cited = {int(n) for n in RE_SLIDE.findall(strip(q.get("explain_en", "")))}
        if refs and not cited & set(refs):
            errs.append("%s : explain_en ne cite aucune slide de `ref` (« See slide N »)" % w)
    return errs


def en_texts(mod):
    """[(chemin, texte)] de tous les champs `_en` textuels (hors svg_en, traité à part)."""
    out = []
    for path, d in all_dicts(mod):
        for k, v in d.items():
            if k.endswith("_en") and k != "svg_en":
                for i, s in enumerate(v if isinstance(v, list) else [v]):
                    if isinstance(s, str):
                        out.append(("%s.%s[%d]" % (path, k, i), s))
            elif k == "svg_en" and isinstance(v, dict):
                for kk, s in v.items():
                    out.append(("%s.svg_en.%s" % (path, kk), str(s)))
    return out


def code_identity_errors(mod):
    """Mêmes `<code>` en fr et en, champ par champ (règle du glossaire)."""
    errs = []
    for path, d in all_dicts(mod):
        for k in list(d):
            if k.endswith("_en") and k not in ("svg_en", "options_en"):
                base = k[:-3]
                if isinstance(d.get(base), str) and isinstance(d[k], str) and codes(d[base]) != codes(d[k]):
                    errs.append("%s.%s : <code> différents de la version française" % (path, k))
        if "options_en" in d and isinstance(d.get("options"), list):
            for i, (a, b) in enumerate(zip(d["options"], d["options_en"])):
                if codes(a) != codes(b):
                    errs.append("%s.options_en[%d] : <code> différents de la version française" % (path, i))
    return errs


def ip_errors(mod):
    errs = []
    for path, s in en_texts(mod):
        for ip in RE_IP.findall(strip(s)):
            octets = [int(x) for x in ip.split(".")]
            if any(o > 255 for o in octets):
                continue  # numéro de version
            if ip != "127.0.0.1" and ip.rsplit(".", 1)[0] != "192.0.2":
                errs.append("%s : IP hors 192.0.2.x / 127.0.0.1" % path)
    return errs
