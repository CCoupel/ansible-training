#!/usr/bin/env node
/* MIT License — Copyright (c) 2026 CCoupel
   Valide le schéma des modules du site (voir CONVENTIONS.md).
   Usage : node tools/validate.js [--root <dir>] [--strict-i18n] [fichier.js ...]
     --strict-i18n (ou I18N_STRICT=1) : un module sans aucune traduction `_en` est une erreur (sinon un avertissement).
     sans fichier : contrôle global (modules/, plan.js, i18n, index.html, images) ;
     avec fichiers : schéma de ces modules seuls + doublons de `src` entre eux (pas de contrôle global).
   Sortie : « ERREUR  fichier : message » (exit 1) ; « warn » = avertissement (n'échoue pas).

   Champs HTML bruts : le moteur (assets/engine.js) n'échappe que les lignes de `code`, `cmds[i][0]`, `file`/`lang`,
   les titres de slide, `tag` et les attributs de `img`. TOUS les autres champs sont injectés tels quels en HTML
   (text, bullets, cellules de table, callout, quiz, reveal, lab, caption, objectifs, À retenir, notes, tagline…).
   Une balise hors liste blanche (HTML_TAGS), par exemple un placeholder `<version>`, serait interprétée par le
   navigateur et disparaîtrait : écrire `&lt;version&gt;`. Exception : le champ `html` d'un bloc `diagram`
   (SVG voulu) — contrôlé seulement contre les scripts, gestionnaires d'événements et `javascript:`. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// À garder synchronisé avec assets/engine.js (objet R) et le CSS.
const BLOCKS = ['text', 'bullets', 'code', 'cmds', 'table', 'compare', 'callout', 'flow', 'layers', 'quiz', 'reveal', 'lab', 'diagram', 'img', 'gallery'];
const CALLOUTS = ['tip', 'warn', 'trap', 'note', 'awx'];
const DAYS = ['J1', 'J2', 'J3', 'J4'];
const HTML_TAGS = new Set(['b', 'i', 'em', 'strong', 'code', 'br', 'a', 'span', 'ul', 'ol', 'li', 'p', 'kbd', 'sub', 'sup', 'mark', 'small', 'pre']);
const TAG_RE = /<\/?([A-Za-z][A-Za-z0-9-]*)/g;
const SLIDE_MIN = 4;

const argv = process.argv.slice(2);
const ri = argv.indexOf('--root');
const ROOT = ri >= 0 ? path.resolve(argv[ri + 1]) : path.join(__dirname, '..');
const fileArgs = argv.filter((a, i) => !a.startsWith('--') && !(ri >= 0 && i === ri + 1));
const STRICT_I18N = argv.includes('--strict-i18n') || process.env.I18N_STRICT === '1';
const globalChecks = fileArgs.length === 0;

let errors = 0, warns = 0;
const err = (f, m) => { errors++; console.error(`ERREUR  ${path.basename(f)} : ${m}`); };
const warn = (f, m) => { warns++; console.warn(`warn    ${path.basename(f)} : ${m}`); };
const strs = x => (Array.isArray(x) ? x : [x]).filter(v => typeof v === 'string');
const isInt = n => Number.isInteger(n);

// Compteurs attendus du deck : tests/slides/expected.json { slides, hidden } (mis à jour par tools/renumber.py).
function expectedDeck() {
  const f = path.join(ROOT, 'tests', 'slides', 'expected.json');
  let e;
  try { e = JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (x) { console.error(`ERREUR  expected.json : illisible ou absent (${x.message}) — source de vérité du nombre de slides`); process.exit(1); }
  if (!Number.isInteger(e.slides) || !Array.isArray(e.hidden)) {
    console.error('ERREUR  expected.json : champs "slides" (entier) et "hidden" (liste) requis'); process.exit(1);
  }
  return { slides: e.slides, hidden: e.hidden.map(Number) };
}
const EXPECTED = expectedDeck();
const SLIDE_MAX = EXPECTED.slides;
const HIDDEN = new Set(EXPECTED.hidden);

/* ---------- Données de référence : plan, images ---------- */
function runIn(file, sandbox) {
  try { vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file }); return true; }
  catch (e) { err(file, 'ne s\'exécute pas : ' + e.message); return false; }
}
function loadPlan() {
  const f = path.join(ROOT, 'assets', 'plan.js');
  if (!fs.existsSync(f)) return null;
  const COURSE = {};
  return runIn(f, { COURSE }) ? (COURSE.plan || null) : null;
}
function loadImages() {
  const f = path.join(ROOT, 'assets', 'img', 'images.json');
  if (!fs.existsSync(f)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(f, 'utf8'));
    const items = Array.isArray(d) ? d : (Array.isArray(d.images) ? d.images : Object.keys(d).map(k => Object.assign({ fichier: k }, d[k])));
    return new Set(items.map(i => i.fichier));
  } catch (e) { err(f, 'JSON illisible : ' + e.message); return null; }
}
const PLAN = loadPlan();
const IMAGES = loadImages();
const planOf = id => (PLAN || []).find(p => p.id === id);

function loadModule(file) {
  let mod = null;
  const sandbox = { COURSE: { add(m) { mod = m; } } };
  if (!runIn(file, sandbox)) return null;
  if (!mod) { err(file, 'aucun appel COURSE.add'); return null; }
  return mod;
}

/* ---------- Champs HTML bruts d'un bloc (miroir de R dans engine.js) ---------- */
function rawHtmlFields(b) {
  const f = [];
  const add = (name, v) => strs(v).forEach(t => f.push([name, t]));
  switch (b.t) {
    case 'text': add('html', b.html); break;
    case 'reveal': add('html', b.html); add('label', b.label); break;
    case 'bullets': add('items', b.items || []); break;
    case 'code': add('caption', b.caption); break;
    case 'cmds': (b.items || []).forEach((c, k) => { if (Array.isArray(c)) add(`items[${k}][1]`, c[1]); }); break;
    case 'table': add('head', b.head || []); (b.rows || []).forEach((r, k) => (r || []).forEach((c, m) => add(`rows[${k}][${m}]`, c))); break;
    case 'compare': for (const side of ['left', 'right']) { const o = b[side] || {}; add(`${side}.title`, o.title); add(`${side}.items`, o.items || []); } add('verdict', b.verdict); break;
    case 'callout': add('html', b.html); add('title', b.title); break;
    case 'flow': (b.nodes || []).forEach((n, k) => { if (typeof n === 'string') add(`nodes[${k}]`, n); else if (n) { add(`nodes[${k}].label`, n.label); add(`nodes[${k}].sub`, n.sub); } }); add('caption', b.caption); break;
    case 'layers': (b.items || []).forEach((l, k) => { add(`items[${k}].name`, l.name); add(`items[${k}].desc`, l.desc); }); break;
    case 'quiz': add('q', b.q); add('options', b.options || []); add('explain', b.explain); break;
    case 'lab': add('title', b.title); add('goal', b.goal); add('steps', b.steps || []); break;
    case 'diagram': add('caption', b.caption); break; // `html` : SVG voulu, exempté de la liste blanche
    case 'img': add('caption', b.caption); break;
    case 'gallery': (b.items || []).forEach((i, k) => add(`items[${k}].caption`, i && i.caption)); break;
  }
  return f;
}

/* ---------- Contrôle d'un texte HTML brut ---------- */
function checkHtml(file, where, field, text) {
  for (const m of text.matchAll(TAG_RE)) {
    if (HTML_TAGS.has(m[1].toLowerCase())) continue;
    const i = m.index, ex = text.slice(Math.max(0, i - 15), i + 30).replace(/\s+/g, ' ');
    err(file, `${where}, champ ${field} : balise <${m[1]}> non autorisée dans un champ HTML brut (« …${ex}… ») ; écris &lt;${m[1]}&gt;`);
  }
  checkAttrs(file, where, field, text);
}
// Attributs dangereux et liens : valables aussi pour le SVG des diagrammes.
function checkAttrs(file, where, field, text) {
  if (/<[^>]*[\s/]on[a-z]+\s*=/i.test(text)) err(file, `${where}, champ ${field} : gestionnaire d'événement (on…=) interdit`);
  if (/javascript:/i.test(text)) err(file, `${where}, champ ${field} : « javascript: » interdit`);
  if (/<\s*script/i.test(text)) err(file, `${where}, champ ${field} : balise script interdite`);
  for (const a of text.matchAll(/<a\b[^>]*>/gi)) {
    const href = /href\s*=\s*["']([^"']*)["']/i.exec(a[0]);
    if (!href) continue;
    if (/^http:/i.test(href[1])) err(file, `${where}, champ ${field} : lien en http (https obligatoire)`);
    else if (/^https:/i.test(href[1]) && !(/target\s*=\s*["']_blank["']/i.test(a[0]) && /rel\s*=\s*["'][^"']*noopener/i.test(a[0]))) {
      err(file, `${where}, champ ${field} : lien externe sans target="_blank" rel="noopener"`);
    } else if (!/^(https:|#)/i.test(href[1])) err(file, `${where}, champ ${field} : href non autorisé (https ou ancre seulement)`);
  }
}

/* ---------- Contenu bilingue : champs frères `X_en` (voir CONVENTIONS.md, « Langues ») ---------- */
// Liste fermée des champs traduisibles ; tout autre champ est verbatim (texte du PPTX) et ne peut pas porter de `_en`.
const EN_FIELDS = { module: ['tagline'], item: ['html'], slide: ['title'], quiz: ['q', 'options', 'explain'], img: ['alt', 'caption'], galleryItem: ['alt', 'caption'], diagram: [] };
// Multiplicité conservée : le français et l'anglais ont exactement les mêmes <code>, autant de fois.
const codesOf = t => [...String(t).matchAll(/<code>([\s\S]*?)<\/code>/g)].map(m => m[1]).sort();
function checkI18nModule(file, mod) {
  let slots = 0, done = 0;
  const missing = [];
  // Un champ traduisible `field` de `obj` : vérifie `field_en` (forme, HTML, <code>) et compte la complétude.
  const pair = (obj, field, where, kind) => {
    const base = obj[field], en = obj[field + '_en'];
    const isArr = Array.isArray(base);
    const baseOk = isArr ? base.length > 0 : (typeof base === 'string' && base.trim() !== '');
    if (en !== undefined) {
      if (!baseOk) { err(file, `${where} : ${field}_en sans ${field}`); return; }
      if (isArr) {
        if (!Array.isArray(en) || en.length !== base.length) { err(file, `${where} : ${field}_en doit avoir ${base.length} éléments comme ${field}`); return; }
        en.forEach((x, i) => {
          if (typeof x !== 'string' || !x.trim()) { err(file, `${where} : ${field}_en[${i + 1}] vide ou invalide`); return; }
          checkHtml(file, where, `${field}_en[${i + 1}]`, x);
          if (JSON.stringify(codesOf(x)) !== JSON.stringify(codesOf(base[i]))) err(file, `${where} : ${field}_en[${i + 1}] : les <code> doivent être identiques au français`);
        });
      } else {
        if (typeof en !== 'string' || !en.trim()) { err(file, `${where} : ${field}_en vide ou invalide`); return; }
        checkHtml(file, where, `${field}_en`, en);
        if (JSON.stringify(codesOf(en)) !== JSON.stringify(codesOf(base))) err(file, `${where} : ${field}_en : les <code> doivent être identiques au français`);
      }
    }
    if (baseOk) { slots++; if (en !== undefined && !(isArr ? en.length === 0 : !String(en).trim())) done++; else missing.push(`${where} ${field}`); }
  };
  // `_en` interdit hors de la liste fermée.
  const forbid = (obj, allowed, where, extra = []) => {
    if (!obj || typeof obj !== 'object') return;
    Object.keys(obj).filter(k => k.endsWith('_en')).forEach(k => {
      const f = k.slice(0, -3);
      if (!allowed.includes(f) && !extra.includes(k)) err(file, `${where} : ${k} interdit (champ verbatim ou non traduisible)`);
    });
  };
  forbid(mod, EN_FIELDS.module, 'module');
  pair(mod, 'tagline', 'module', 'module');
  for (const k of ['objectives', 'takeaways']) (Array.isArray(mod[k]) ? mod[k] : []).forEach((o, i) => {
    const w = `${k} ${i + 1}`;
    forbid(o, EN_FIELDS.item, w);
    if (o && typeof o === 'object') pair(o, 'html', w, 'item');
  });
  (Array.isArray(mod.slides) ? mod.slides : []).forEach((s, i) => {
    if (!s || typeof s !== 'object') return;
    const at = `slide ${i + 1}`;
    forbid(s, s.extra === true ? EN_FIELDS.slide : [], at);
    if (s.extra === true) pair(s, 'title', at, 'slide');
    (Array.isArray(s.blocks) ? s.blocks : []).forEach((b, j) => {
      if (!b || typeof b !== 'object') return;
      const bt = `${at} bloc ${j + 1} (${b.t})`;
      if (b.t === 'quiz') { forbid(b, EN_FIELDS.quiz, bt); EN_FIELDS.quiz.forEach(f => pair(b, f, bt, 'quiz')); }
      else if (b.t === 'img') {
        forbid(b, EN_FIELDS.img, bt);
        pair(b, 'alt', bt, 'img');
        if (b.caption !== undefined) pair(b, 'caption', bt, 'img'); else if (b.caption_en !== undefined) err(file, `${bt} : caption_en sans caption`);
      } else if (b.t === 'gallery') {
        forbid(b, [], bt);
        (Array.isArray(b.items) ? b.items : []).forEach((im, k) => {
          const w = `${bt} image ${k + 1}`;
          forbid(im, EN_FIELDS.galleryItem, w);
          if (im && typeof im === 'object') {
            if (im.alt !== undefined && String(im.alt) !== '') pair(im, 'alt', w, 'galleryItem'); else if (im.alt_en !== undefined) err(file, `${w} : alt_en sans alt`);
            if (im.caption !== undefined) pair(im, 'caption', w, 'galleryItem'); else if (im.caption_en !== undefined) err(file, `${w} : caption_en sans caption`);
          }
        });
      } else if (b.t === 'diagram') {
        forbid(b, [], bt, ['svg_en']);
        const h = String(b.html || '');
        const tit = /<title\b[^>]*>([^<]+)<\/title>/i.exec(h), des = /<desc\b[^>]*>([^<]+)<\/desc>/i.exec(h);
        const e = b.svg_en;
        if (e !== undefined && (!e || typeof e !== 'object' || Array.isArray(e))) err(file, `${bt} : svg_en doit être { title, desc }`);
        else {
          if (e) Object.keys(e).forEach(k => { if (!['title', 'desc'].includes(k)) err(file, `${bt} : svg_en.${k} inconnu (title, desc)`); });
          for (const [name, m] of [['title', tit], ['desc', des]]) {
            if (e && e[name] !== undefined) {
              if (!m) err(file, `${bt} : svg_en.${name} sans <${name}> dans le SVG`);
              else if (typeof e[name] !== 'string' || !e[name].trim()) err(file, `${bt} : svg_en.${name} vide`);
              else checkHtml(file, bt, `svg_en.${name}`, e[name]);
            }
            if (m) { slots++; if (e && typeof e[name] === 'string' && e[name].trim()) done++; else missing.push(`${bt} svg_en.${name}`); }
          }
        }
      } else forbid(b, [], bt);
    });
  });
  if (done === 0) {
    const msg = `module non traduit en anglais (aucun champ _en ; ${slots} champ(s) à traduire)`;
    if (STRICT_I18N) err(file, msg); else warn(file, msg);
  } else if (done < slots) err(file, `traduction anglaise incomplète : ${done}/${slots} champs (tout ou rien) ; manquants : ${missing.slice(0, 6).join(' ; ')}${missing.length > 6 ? ' …' : ''}`);
}

/* ---------- Références vers des slides PPTX ---------- */
function checkRef(file, where, ref, srcSet) {
  if (!Array.isArray(ref) || !ref.length) return err(file, `${where} : ref obligatoire (liste non vide de numéros de slides)`);
  for (const n of ref) {
    if (!isInt(n)) err(file, `${where} : ref ${JSON.stringify(n)} n'est pas un entier`);
    else if (!srcSet.has(n)) err(file, `${where} : ref ${n} n'est pas une slide (src) du module`);
  }
}

/* ---------- Schéma d'un module ---------- */
const srcOwner = {}; // n° de slide PPTX → module (doublons inter-modules)

function checkSchema(file, mod) {
  const errorsBefore = errors;
  const base = path.basename(file);
  const expected = /^m(\d+)/.exec(base);
  if (!/^m\d{2}$/.test(String(mod.id))) err(file, `id "${mod.id}" invalide (attendu mNN)`);
  if (expected && mod.id !== 'm' + expected[1]) err(file, `id "${mod.id}" ≠ nom de fichier`);
  if (expected && mod.num !== +expected[1]) err(file, `num ${mod.num} ≠ nom de fichier`);
  if (!isInt(mod.num)) err(file, 'num doit être un entier');
  for (const k of ['emoji', 'title', 'tagline']) if (!mod[k]) err(file, `champ manquant : ${k}`);
  if (/[<`]/.test(mod.title || '')) err(file, 'title ne doit pas contenir de HTML/backticks');
  for (const k of ['tagline', 'duration']) strs(mod[k]).forEach(tx => checkHtml(file, 'module', k, tx));
  if (!Array.isArray(mod.slides)) { err(file, 'slides manquant'); return null; }
  if (Array.from(mod.slides).some(x => !x || typeof x !== 'object')) err(file, 'slides contient un élément vide ou invalide (virgule en trop ?)');

  // Slides sources du module (non extra), pour contrôler les `ref`.
  const srcSet = new Set();
  mod.slides.forEach(s => { if (s && !s.extra) (Array.isArray(s.src) ? s.src : []).forEach(n => { if (isInt(n)) srcSet.add(n); }); });
  const plan = planOf(mod.id);

  const items = (k, min, max) => {
    const list = mod[k];
    if (!Array.isArray(list) || list.length < min || list.length > max) return err(file, `${k} : ${min} à ${max} éléments attendus (${Array.isArray(list) ? list.length : 'absent'})`);
    list.forEach((o, i) => {
      const at = `${k} ${i + 1}`;
      if (!o || typeof o !== 'object' || typeof o.html !== 'string' || !o.html.trim()) return err(file, `${at} : forme { html, ref } attendue`);
      checkHtml(file, at, 'html', o.html);
      checkRef(file, at, o.ref, srcSet);
    });
  };
  items('objectives', 3, 5);
  items('takeaways', 4, 6);

  let quizzes = 0, labs = 0;
  mod.slides.forEach((s, i) => {
    const at = `slide ${i + 1} "${s && s.title}"`;
    if (!s || typeof s !== 'object') return err(file, `slide ${i + 1} invalide`);
    if (!s.title) err(file, `slide ${i + 1} sans title`);
    if (s.layout !== undefined && s.layout !== 'two') err(file, `${at} : layout inconnu`);
    if (s.extra !== undefined && s.extra !== true) err(file, `${at} : extra doit valoir true (booléen) ou être absent`);
    if (s.notes !== undefined) {
      if (typeof s.notes !== 'string' && !(Array.isArray(s.notes) && s.notes.every(x => typeof x === 'string'))) err(file, `${at} : notes doit être une chaîne ou une liste de chaînes`);
      else strs(s.notes).forEach(tx => checkHtml(file, at, 'notes', tx));
    }
    if (s.extra === true) {
      if (s.src !== undefined) err(file, `${at} : une slide extra (Bonus HTML) n'a pas de src`);
    } else if (!Array.isArray(s.src) || !s.src.length) err(file, `${at} : src obligatoire (numéros des slides PPTX d'origine)`);
    else {
      let prev = 0;
      s.src.forEach(n => {
        if (!isInt(n)) return err(file, `${at} : src ${JSON.stringify(n)} n'est pas un entier`);
        if (n < SLIDE_MIN || n > SLIDE_MAX) err(file, `${at} : src ${n} hors de ${SLIDE_MIN}-${SLIDE_MAX}`);
        else if (HIDDEN.has(n)) err(file, `${at} : src ${n} est une slide masquée (exclue)`);
        if (n <= prev) err(file, `${at} : src non trié ou en doublon (${n})`);
        prev = n;
        if (plan && plan.range && (n < plan.range[0] || n > plan.range[1])) err(file, `${at} : src ${n} hors du module (${plan.range[0]}-${plan.range[1]})`);
        const owner = srcOwner[n];
        if (owner && owner.mod !== mod.id) err(file, `${at} : slide PPTX ${n} déjà convertie dans ${owner.mod}`);
        else if (owner) warn(file, `${at} : slide PPTX ${n} déjà référencée par la slide ${owner.slide} du module`);
        else srcOwner[n] = { mod: mod.id, slide: i + 1 };
      });
    }
    if (!Array.isArray(s.blocks) || !s.blocks.length) { err(file, `${at} : pas de blocs`); return; }
    s.blocks.forEach((b, j) => {
      const bt = `${at} bloc ${j + 1} (${b && b.t})`;
      if (!b || !BLOCKS.includes(b.t)) return err(file, `${bt} : type inconnu`);
      rawHtmlFields(b).forEach(([field, tx]) => checkHtml(file, bt, field, tx));
      const need = { text: ['html'], bullets: ['items'], code: ['code'], cmds: ['items'], table: ['head', 'rows'], compare: ['left', 'right'],
        callout: ['kind', 'html'], flow: ['nodes'], layers: ['items'], quiz: ['q', 'options', 'answer'], reveal: ['html'], lab: ['steps'], diagram: ['html'], img: ['file', 'alt'], gallery: ['items'] }[b.t];
      need.forEach(k => { if (b[k] === undefined || b[k] === '') err(file, `${bt} : champ "${k}" manquant`); });
      // Libellés ajoutés par le site (absents du PPTX) : clés d'interface, jamais en dur (sinon du français resterait dans l'interface anglaise).
      if (b.t === 'lab' && b.title !== undefined && /^\s*À réaliser\s*$/i.test(String(b.title))) err(file, `${bt} : titre « À réaliser » en dur ; supprimer title (clé d'interface block.lab)`);
      if (b.t === 'reveal') {
        if (b.label !== undefined && /^\s*Voir la solution\b/i.test(String(b.label))) err(file, `${bt} : label « Voir la solution… » en dur ; utiliser slide: N (clé d'interface block.revealSlide)`);
        if (b.slide !== undefined && !(isInt(b.slide) && srcSet.has(b.slide))) err(file, `${bt} : slide ${JSON.stringify(b.slide)} doit être l'une des slides src du module`);
      }
      if (b.t === 'callout' && !CALLOUTS.includes(b.kind)) err(file, `${bt} : kind "${b.kind}" inconnu (${CALLOUTS.join(', ')})`);
      if (b.t === 'table' && Array.isArray(b.rows) && Array.isArray(b.head)) b.rows.forEach((r, k) => { if (r.length !== b.head.length) err(file, `${bt} : ligne ${k + 1} a ${r.length} colonnes pour ${b.head.length} en-têtes`); });
      if (b.t === 'cmds' && Array.isArray(b.items)) b.items.forEach((c, k) => { if (!Array.isArray(c) || c.length !== 2) err(file, `${bt} : item ${k + 1} doit être [cmd, desc]`); });
      if (b.t === 'diagram') {
        const h = String(b.html || '');
        checkAttrs(file, bt, 'html', h);
        // Un SVG role="img" doit avoir un nom accessible : <title id="X"> référencé par aria-labelledby="X".
        for (const m of h.matchAll(/<svg\b[^>]*>/gi)) {
          if (!/role\s*=\s*["']img["']/i.test(m[0])) continue;
          const lab = /aria-labelledby\s*=\s*["']([^"']+)["']/i.exec(m[0]);
          if (!lab) { err(file, `${bt} : SVG role="img" sans aria-labelledby (nom accessible obligatoire)`); continue; }
          for (const id of lab[1].split(/\s+/)) if (!new RegExp(`<title\\b[^>]*\\bid\\s*=\\s*["']${id}["'][^>]*>[^<]+</title>`, 'i').test(h)) err(file, `${bt} : aria-labelledby="${id}" ne désigne aucun <title id> non vide`);
        }
        const ids = [...h.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map(m => m[1]);
        if (new Set(ids).size !== ids.length) err(file, `${bt} : identifiants en double dans le SVG`);
      }
      if (b.t === 'img' || b.t === 'gallery') {
        (b.t === 'img' ? [b] : (Array.isArray(b.items) ? b.items : [])).forEach((im, k) => {
          const w = b.t === 'img' ? bt : `${bt} image ${k + 1}`;
          const m = /^assets\/img\/([^/]+)$/.exec(String((im && im.file) || ''));
          if (!m) err(file, `${w} : file doit être de la forme assets/img/<fichier>`);
          else {
            if (!fs.existsSync(path.join(ROOT, 'assets', 'img', m[1]))) err(file, `${w} : fichier assets/img/${m[1]} absent`);
            if (!IMAGES || !IMAGES.has(m[1])) err(file, `${w} : image ${m[1]} non déclarée dans assets/img/images.json`);
          }
          if (b.t === 'gallery' && im && im.decorative === true) {
            if (im.alt !== '') err(file, `${w} : image décorative (decorative: true) : alt doit être vide`);
          } else if (!im || typeof im.alt !== 'string' || !im.alt.trim()) err(file, `${w} : alt obligatoire et non vide (ou decorative: true dans une gallery)`);
        });
      }
      if (b.t === 'quiz') {
        quizzes++;
        const qs = (b.options || []);
        if (!Array.isArray(b.options) || qs.length < 3 || qs.length > 4) err(file, `${bt} : 3 à 4 options attendues`);
        if (!isInt(b.answer) || b.answer < 0 || b.answer >= qs.length) err(file, `${bt} : answer hors limites`);
        if (typeof b.explain !== 'string' || !b.explain.trim()) err(file, `${bt} : explain obligatoire`);
        checkRef(file, bt, b.ref, srcSet);
        if (s.extra !== true) err(file, `${bt} : un quiz doit être sur une slide extra: true (Bonus HTML)`);
      }
      if (b.t === 'lab') labs++;
    });
  });
  checkI18nModule(file, mod);
  if (!quizzes) err(file, 'aucun quiz (1 à 3 attendus)');
  else if (quizzes > 3) warn(file, `${quizzes} quiz (3 maximum recommandés)`);
  // Slides de contenu = hors Bonus (les quiz sont des slides `extra: true`) ; 35 = borne du plan EDA (module le plus long).
  const content = mod.slides.filter(s => s.extra !== true).length;
  if (content < 6 || content > 35) warn(file, `${content} slides de contenu hors Bonus (6 à 35 attendues)`);
  console.log(`${errors > errorsBefore ? '…' : 'ok '}      ${base} : ${mod.slides.length} slides, ${quizzes} quiz, ${labs} lab`);
  return mod;
}

/* ---------- Mode fichiers ---------- */
if (!globalChecks) {
  for (const f of fileArgs) {
    const mod = loadModule(f);
    if (mod) checkSchema(f, mod);
  }
  console.log(`\n${fileArgs.length} module(s), ${errors} erreur(s), ${warns} avertissement(s).`);
  process.exit(errors ? 1 : 0);
}

/* ---------- Contrôle global ---------- */
const modDir = path.join(ROOT, 'modules');
const loaded = {}; // nom de fichier → module
const files = fs.existsSync(modDir) ? fs.readdirSync(modDir).filter(f => /\.js$/.test(f)).sort() : [];
for (const name of files) {
  if (!/^m\d{2}-[a-z0-9-]+\.js$/.test(name)) { err(path.join(modDir, name), 'nom de module invalide (mNN-sujet.js, kebab-case ASCII)'); continue; }
  const file = path.join(modDir, name);
  const mod = loadModule(file);
  loaded[name] = mod ? (checkSchema(file, mod) || null) : null;
}

// plan.js
const planFile = path.join(ROOT, 'assets', 'plan.js');
if (!PLAN) err(planFile, 'COURSE.plan absent');
else {
  if (new Set(PLAN.map(p => p.id)).size !== PLAN.length) err(planFile, 'id en doublon');
  if (new Set(PLAN.map(p => p.num)).size !== PLAN.length) err(planFile, 'num en doublon');
  let prevEnd = 3;
  PLAN.forEach(p => {
    if (!p.id || p.num === undefined || !p.emoji || !p.title) return err(planFile, `entrée incomplète : ${JSON.stringify(p)}`);
    if (p.id !== 'm' + String(p.num).padStart(2, '0')) err(planFile, `id "${p.id}" incohérent avec num ${p.num}`);
    if (typeof p.title !== 'string') err(planFile, `${p.id} : title doit être une chaîne`);
    if (!DAYS.includes(p.day)) err(planFile, `${p.id} : day "${p.day}" inconnu (${DAYS.join(', ')})`);
    if (!Array.isArray(p.range) || p.range.length !== 2 || !p.range.every(isInt) || p.range[0] > p.range[1]) err(planFile, `${p.id} : range [début, fin] attendu`);
    else {
      if (p.range[0] !== prevEnd + 1) err(planFile, `${p.id} : range ${p.range[0]}-${p.range[1]} ne suit pas le module précédent (attendu début ${prevEnd + 1})`);
      prevEnd = p.range[1];
    }
    const name = Object.keys(loaded).find(n => n.startsWith(p.id + '-')), m = name && loaded[name];
    if (m) {
      if (m.title !== p.title) err(planFile, `${p.id} : title « ${p.title} » ≠ module « ${m.title} »`);
      if (m.emoji !== p.emoji) err(planFile, `${p.id} : emoji ≠ module`);
    }
  });
  if (prevEnd !== SLIDE_MAX) err(planFile, `les plages de slides s'arrêtent à ${prevEnd} (attendu ${SLIDE_MAX})`);
  const ids = new Set(PLAN.map(p => p.id));
  for (const name of Object.keys(loaded)) { const m = /^(m\d+)/.exec(name); if (m && !ids.has(m[1])) err(path.join(modDir, name), 'module absent du manifeste assets/plan.js'); }
}

// libellés
const i18nFile = path.join(ROOT, 'assets', 'i18n', 'fr.js');
let FR = null;
if (!fs.existsSync(i18nFile)) err(i18nFile, 'assets/i18n/fr.js absent');
else {
  const COURSE = {};
  if (runIn(i18nFile, { COURSE })) FR = COURSE.i18n && COURSE.i18n.fr;
  if (!FR || typeof FR !== 'object') err(i18nFile, 'COURSE.i18n.fr absent');
  else for (const [k, v] of Object.entries(FR)) if (typeof v !== 'string') err(i18nFile, `clé "${k}" : chaîne attendue`);
}
if (FR) {
  const need = new Set();
  const engineFile = path.join(ROOT, 'assets', 'engine.js');
  if (fs.existsSync(engineFile)) {
    const js = fs.readFileSync(engineFile, 'utf8');
    for (const m of js.matchAll(/\bt\(\s*'([\w.]+)'/g)) if (!m[1].endsWith('.')) need.add(m[1]);
    CALLOUTS.forEach(k => need.add('callout.' + k));
    DAYS.forEach(k => need.add('day.' + k));
  }
  const idx = path.join(ROOT, 'index.html');
  if (fs.existsSync(idx)) {
    const html = fs.readFileSync(idx, 'utf8');
    for (const m of html.matchAll(/data-i18n="([\w.]+)"/g)) need.add(m[1]);
    for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(',').forEach(p => need.add(p.split(':')[1].trim()));
  }
  for (const k of [...need].sort()) if (!(k in FR)) err(i18nFile, `clé "${k}" utilisée mais absente`);
  for (const k of Object.keys(FR).sort()) if (!need.has(k)) err(i18nFile, `clé "${k}" orpheline (jamais utilisée par engine.js ni index.html) : l'utiliser ou la supprimer`);
}

// libellés anglais : mêmes clés, mêmes paramètres {…}, valeurs non vides
{
  const enFile = path.join(ROOT, 'assets', 'i18n', 'en.js');
  let EN = null;
  if (!fs.existsSync(enFile)) err(enFile, 'assets/i18n/en.js absent');
  else {
    const COURSE = {};
    if (runIn(enFile, { COURSE })) EN = COURSE.i18n && COURSE.i18n.en;
    if (!EN || typeof EN !== 'object') err(enFile, 'COURSE.i18n.en absent');
  }
  if (FR && EN) {
    const params = v => [...String(v).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
    for (const k of Object.keys(FR).sort()) {
      if (!(k in EN)) { err(enFile, `clé "${k}" absente (présente en français)`); continue; }
      if (typeof EN[k] !== 'string') err(enFile, `clé "${k}" : chaîne attendue`);
      else {
        if (!EN[k].trim()) err(enFile, `clé "${k}" : valeur vide`);
        if (params(EN[k]) !== params(FR[k])) err(enFile, `clé "${k}" : paramètres {…} différents du français (fr : ${params(FR[k]) || 'aucun'} ; en : ${params(EN[k]) || 'aucun'})`);
      }
      if (typeof FR[k] === 'string' && !FR[k].trim()) err(i18nFile, `clé "${k}" : valeur vide`);
    }
    for (const k of Object.keys(EN).sort()) if (!(k in FR)) err(enFile, `clé "${k}" absente du français (orpheline)`);
  }
}

// meta.js et index.html
if (!fs.existsSync(path.join(ROOT, 'assets', 'meta.js'))) err('meta.js', 'assets/meta.js absent (node tools/sync-meta.js)');
const indexFile = path.join(ROOT, 'index.html');
if (!fs.existsSync(indexFile)) err(indexFile, 'index.html absent');
else {
  const html = fs.readFileSync(indexFile, 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
  for (const s of scripts) {
    if (/^(https?:)?\/\//i.test(s)) err('index.html', `script externe interdit : ${s}`);
    else if (!fs.existsSync(path.join(ROOT, s))) err('index.html', `script inexistant (404) : ${s}`);
  }
  const pos = n => scripts.indexOf(n);
  if (pos('assets/meta.js') < 0 || pos('assets/meta.js') > pos('assets/engine.js')) err('index.html', 'assets/meta.js doit être chargé avant assets/engine.js');
  if (pos('assets/engine.js') < 0 || pos('assets/i18n/fr.js') < pos('assets/engine.js') || pos('assets/i18n/en.js') < pos('assets/i18n/fr.js') || pos('assets/plan.js') < pos('assets/i18n/en.js')) err('index.html', 'ordre attendu : meta.js, engine.js, i18n/fr.js, i18n/en.js, plan.js, modules');
  for (const name of Object.keys(loaded)) if (!scripts.includes(`modules/${name}`)) err(path.join(modDir, name), 'module non chargé par index.html');
}

console.log(`\n${files.length} module(s), ${errors} erreur(s), ${warns} avertissement(s).`);
process.exit(errors ? 1 : 0);
