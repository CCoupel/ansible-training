/* Moteur de slides du support Ansible Training — voir CONVENTIONS.md pour le schéma des modules et des blocs.
   MIT License — Copyright (c) 2026 CCoupel. Vanilla JS, aucune dépendance, ouvrable en double-clic (file://). */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const strip = h => String(h).replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
  const pad = n => String(n).padStart(2, '0');

  /* ---------- Préférences et progression (localStorage, tolérant à son indisponibilité) ---------- */
  const KEY = 'ansible-training-v1';
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* stockage indisponible : le site reste utilisable */ } }
  };
  const state = Object.assign({ visited: {}, quiz: {}, theme: null, last: null, notes: false }, store.get());
  ['visited', 'quiz'].forEach(k => { if (!state[k] || typeof state[k] !== 'object') state[k] = {}; });
  const save = () => store.set(state);

  /* ---------- Libellés (assets/i18n/fr.js) ---------- */
  // t('clé', { param }) : repli sur la clé elle-même si le libellé est absent.
  function t(key, vars) {
    const all = (window.COURSE && COURSE.i18n && COURSE.i18n['fr']) || {};
    let v = all[key] !== undefined ? all[key] : key;
    if (vars) v = v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
    return v;
  }
  const META = () => window.COURSE_META || {};

  const CALLOUTS = { tip: '💡', warn: '⚠️', trap: '🪤', note: '📝', awx: '🔄' };

  /* "35" · "88-89" · "13-15, 17" : liste de numéros de slides PPTX compactée. */
  function fmtNums(list) {
    const a = [...new Set((list || []).map(Number).filter(Number.isFinite))].sort((x, y) => x - y);
    const out = [];
    for (let i = 0; i < a.length;) {
      let j = i;
      while (j + 1 < a.length && a[j + 1] === a[j] + 1) j++;
      out.push(j > i ? a[i] + '-' + a[j] : String(a[i]));
      i = j + 1;
    }
    return out.join(', ');
  }
  const refLabel = list => (list && list.length > 1 ? t('badge.refMany', { list: fmtNums(list) }) : t('badge.ref', { list: fmtNums(list) }));
  const srcLabel = list => (list.length > 1 ? t('badge.pptxMany', { list: fmtNums(list) }) : t('badge.pptx', { n: fmtNums(list) }));
  const itemHtml = x => (typeof x === 'string' ? x : x.html);
  const itemRef = x => (typeof x === 'object' && x && Array.isArray(x.ref) ? x.ref : []);

  /* ---------- Rendu des blocs ---------- */
  const fc = b => (b.frag ? ' frag' : '');
  const wide = b => (b.wide ? ' wide' : '');

  // Les lignes `# …` d'un code sont grisées (commentaires) sauf en lang « console » où `$ ` et `# ` sont des invites.
  function codeHtml(code, lang) {
    const consoleLang = lang === 'console';
    return String(code).replace(/\n$/, '').split('\n').map(l => {
      const e = esc(l);
      if (consoleLang && /^[$#] /.test(l)) return `<span class="c-ps">${e.slice(0, 2)}</span>${e.slice(2)}`;
      if (!consoleLang && /^\s*#/.test(l)) return `<span class="c-cm">${e}</span>`;
      if (!consoleLang && /^\$ /.test(l)) return `<span class="c-ps">$ </span>${e.slice(2)}`;
      return e;
    }).join('\n');
  }

  const R = {
    text: b => `<div class="blk text${fc(b)}${wide(b)}">${b.html}</div>`,
    bullets: b => `<ul class="blk bullets${wide(b)}">${b.items.map(i => `<li class="${b.frag ? 'frag' : ''}">${i}</li>`).join('')}</ul>`,
    code: b => `<div class="${wide(b).trim()}${fc(b)}"><div class="codebox">
      <div class="codebar"><span class="dots"><i></i><i></i><i></i></span><span class="fn">${esc(b.file || b.lang || '')}</span><button class="copy" type="button">${esc(t('block.copy'))}</button></div>
      <pre>${codeHtml(b.code, b.lang)}</pre></div>${b.caption ? `<div class="codecap">${b.caption}</div>` : ''}</div>`,
    cmds: b => `<div class="cmds${fc(b)}${wide(b)}">${b.items.map(([c, d]) => `<div class="cm">${esc(c)}</div><div>${d}</div>`).join('')}</div>`,
    table: b => `<div class="tablewrap${fc(b)}${wide(b)}"><table><thead><tr>${b.head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${
      b.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
    compare: b => `<div class="${wide(b).trim()}${fc(b)}"><div class="compare">
      <div class="cside l"><h3>${b.left.title}</h3><ul>${b.left.items.map(i => `<li>${i}</li>`).join('')}</ul></div>
      <div class="cside r"><h3>${b.right.title}</h3><ul>${b.right.items.map(i => `<li>${i}</li>`).join('')}</ul></div></div>
      ${b.verdict ? `<div class="verdict">${b.verdict}</div>` : ''}</div>`,
    callout: b => {
      const kind = CALLOUTS[b.kind] ? b.kind : 'note';
      return `<div class="callout ${kind}${fc(b)}${wide(b)}"><div class="ch">${CALLOUTS[kind]} ${b.title || esc(t('callout.' + kind))}</div><p>${b.html}</p></div>`;
    },
    flow: b => `<div class="${wide(b).trim()}${fc(b)}"><div class="flow">${b.nodes.map((n, i) => {
      const o = typeof n === 'string' ? { label: n } : n;
      return (i ? '<span class="farrow">→</span>' : '') + `<div class="fnode${o.hl ? ' hl' : ''}"><b>${o.label}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</div>`;
    }).join('')}</div>${b.caption ? `<div class="flowcap">${b.caption}</div>` : ''}</div>`,
    layers: b => `<div class="layers${fc(b)}${wide(b)}">${b.items.map(l =>
      `<div class="layer${l.hl ? ' hl' : ''}${l.base ? ' base' : ''}"><b>${l.name}</b><span>${l.desc || ''}</span></div>`).join('')}</div>`,
    quiz: (b, ctx) => `<div class="quiz${fc(b)}${wide(b)}" data-k="${ctx.uid}#${ctx.bi}" data-a="${b.answer}">
      <div class="q">${esc(t('icon.quiz'))} ${b.q}</div>
      <div class="opts">${b.options.map((o, i) => `<button type="button" class="opt" data-i="${i}">${o}</button>`).join('')}</div>
      <div class="explain">${b.explain || ''}</div>
      <button type="button" class="redo">${esc(t('block.redo'))}</button></div>`,
    reveal: b => `<details class="reveal${fc(b)}${wide(b)}"><summary>${b.label || esc(t('block.reveal'))}</summary><div>${b.html}</div></details>`,
    lab: b => `<div class="lab${fc(b)}${wide(b)}"><h3>${esc(t('icon.lab'))} ${b.title}</h3>${b.goal ? `<p class="goal">${b.goal}</p>` : ''}<ol>${
      b.steps.map(s => `<li><label><input type="checkbox"><span>${s}</span></label></li>`).join('')}</ol></div>`,
    diagram: b => `<div class="${wide(b).trim()}${fc(b)}"><div class="diagram">${b.html}</div>${b.caption ? `<div class="dcap">${b.caption}</div>` : ''}</div>`,
    img: b => `<figure class="blk imgblk${fc(b)}${wide(b)}"><img src="${esc(b.file)}" alt="${esc(b.alt || '')}" loading="lazy">${b.caption ? `<figcaption>${b.caption}</figcaption>` : ''}</figure>`
  };

  function renderBlocks(slide, uid) {
    const html = (slide.blocks || []).map((b, bi) => {
      const fn = R[b.t];
      if (!fn) return `<div class="callout warn"><p>${esc(t('block.unknown', { type: b.t }))}</p></div>`;
      return fn(b, { uid, bi });
    }).join('');
    return `<div class="blocks${slide.layout === 'two' ? ' two' : ''}">${html}</div>`;
  }

  /* ---------- Liste plate des slides ---------- */
  let modules = [];   // modules chargés, triés
  let upcoming = [];  // modules du plan sans fichier chargé (« à venir »)
  let flat = [];

  const planOf = id => (COURSE.plan || []).find(p => p.id === id) || {};

  function build() {
    const byId = {};
    COURSE.modules.forEach(m => { byId[m.id] = m; });
    modules = Object.keys(byId).map(k => byId[k]).sort((a, b) => a.num - b.num);
    upcoming = (COURSE.plan || []).filter(p => !byId[p.id]).sort((a, b) => a.num - b.num);
    flat = [{ kind: 'home', title: t('nav.home'), uid: 'home' }];
    modules.forEach(m => {
      flat.push({ kind: 'cover', mod: m, title: t('cover.objectives'), uid: m.id + '-0' });
      m.slides.forEach((s, i) => flat.push({ kind: 'slide', mod: m, slide: s, title: s.title, uid: m.id + '-' + (i + 1) }));
      if (m.takeaways && m.takeaways.length) flat.push({ kind: 'recap', mod: m, title: t('recap.title'), uid: m.id + '-' + (m.slides.length + 1) });
    });
  }

  // Plan complet trié par num : modules chargés + modules « à venir » (soon: true).
  const planList = () => modules.concat(upcoming.map(p => Object.assign({ soon: true }, p))).sort((a, b) => a.num - b.num);
  const dayOf = m => m.day || planOf(m.id).day || '';

  const quizTotal = m => m.slides.reduce((n, s) => n + (s.blocks || []).filter(b => b.t === 'quiz').length, 0);
  const quizScore = m => Object.keys(state.quiz).filter(k => k.startsWith(m.id + '-') && state.quiz[k] === 1).length;
  const modPct = m => {
    const ids = flat.filter(f => f.mod === m);
    return ids.length ? Math.round(ids.filter(f => state.visited[f.uid]).length / ids.length * 100) : 0;
  };

  const badgeExtra = () => `<span class="stag bonus" title="${esc(t('badge.extraNote'))}">${esc(t('badge.extra'))}</span>`;
  const tagHtml = s => `${s.tag ? `<span class="stag">${esc(s.tag)}</span>` : ''}${s.extra ? badgeExtra() : ''}`;
  const srcHtml = s => (s.src && s.src.length ? `<span class="src" title="${esc(t('badge.pptxTitle'))}">${esc(srcLabel(s.src))}</span>`
    : (s.extra ? `<span class="src">${esc(t('badge.extraNote'))}</span>` : ''));
  const notesOf = s => (Array.isArray(s.notes) ? s.notes.join('<br>') : (s.notes || ''));

  function refItems(list) {
    return list.map(x => {
      const r = itemRef(x);
      return `<li>${itemHtml(x)}${r.length ? ` <small class="ref">(${esc(refLabel(r))})</small>` : ''}</li>`;
    }).join('');
  }

  function renderHome() {
    const mt = META();
    const ref = mt.reference_version || {};
    const total = flat.length - 1, seen = flat.filter(x => x.mod && state.visited[x.uid]).length;
    const cont = state.last && flat.find(x => x.uid === state.last && x.mod);
    const days = [];
    planList().forEach(m => {
      const d = dayOf(m);
      let g = days.find(x => x.day === d);
      if (!g) { g = { day: d, items: [] }; days.push(g); }
      g.items.push(m);
    });
    const pills = [
      mt.version ? `<span class="pill">${esc(t('home.version'))} <b>v${esc(mt.version)}</b></span>` : '',
      mt.date ? `<span class="pill">${esc(t('home.delivery'))} <b>${esc(mt.date)}</b></span>` : '',
      ref.ansible_core ? `<span class="pill"><b>${esc(t('home.reference', { core: ref.ansible_core }))}</b>${ref.python_controller_min ? ' · ' + esc(t('home.python', { python: ref.python_controller_min })) : ''}</span>` : ''
    ].join('');
    const start = cont ? `<a class="btn primary" href="#${cont.uid}">${esc(t('home.resume', { title: cont.mod.title }))}</a>`
      : `<a class="btn primary" href="#${modules[0] ? modules[0].id + '-0' : 'home'}">${esc(t('home.start'))}</a>`;
    return `<div class="home"><div class="sub">${esc(t('home.kicker'))}</div><h1>${esc(t('course.subtitle'))}</h1>
      <div class="meta">${pills}</div>
      <p class="homesub">${esc(t('home.modulesLoaded', { done: modules.length, total: modules.length + upcoming.length, seen }))}</p>
      <div class="actions">${start}<button class="btn" id="reset" type="button">${esc(t('home.reset'))}</button></div>
      ${days.map(g => `<h2 class="dayh">${esc(t('day.' + g.day))}</h2><div class="mgrid">${g.items.map(m => m.soon
        ? `<div class="mcard soon" aria-disabled="true"><div class="e">${m.emoji}</div><div class="n">${esc(t('home.module'))} ${pad(m.num)}</div>
          <h3>${esc(m.title)}</h3><p>${esc(t('home.soon'))}</p></div>`
        : `<a class="mcard" href="#${m.id}-0"><div class="e">${m.emoji}</div><div class="n">${esc(t('home.module'))} ${pad(m.num)}</div>
          <h3>${esc(m.title)}</h3><p>${m.tagline || ''}</p><div class="bar"><i style="width:${modPct(m)}%"></i></div></a>`).join('')}</div>`).join('')}
      <div class="dl">${esc(t('icon.download'))} <a href="Ansible%20Training.pptx" download>${esc(t('home.download'))}</a><small>${esc(t('home.downloadHint'))}</small></div></div>`;
  }

  function renderBody(f) {
    if (f.kind === 'home') return renderHome();
    const m = f.mod;
    if (f.kind === 'cover') {
      return `<div class="cover"><div class="big">${m.emoji}</div><div class="num">${esc(t('cover.module'))} ${pad(m.num)}</div><h1>${esc(m.title)}</h1>
        <p class="tagline">${m.tagline || ''}</p>
        ${m.objectives ? `<div class="obj"><h3>${esc(t('icon.objectives'))} ${esc(t('cover.objectives'))} ${badgeExtra()}</h3><ul>${refItems(m.objectives)}</ul></div>` : ''}
        <div class="meta">${esc(t('cover.slides', { n: m.slides.length }))}${m.duration ? ' · ' + m.duration : ''}${quizTotal(m) ? ' · ' + esc(t('cover.quiz', { n: quizTotal(m) })) : ''}</div></div>`;
    }
    if (f.kind === 'recap') {
      const qt = quizTotal(m);
      return `<div class="recap"><h2>${esc(t('icon.recap'))} ${esc(t('recap.title'))} ${badgeExtra()}</h2><ul>${refItems(m.takeaways)}</ul>
        ${qt ? `<div class="score">${esc(t('icon.score'))} ${esc(t('recap.score', { score: quizScore(m), total: qt }))}</div>` : ''}</div>`;
    }
    const s = f.slide;
    const notes = notesOf(s);
    return `<h2 class="stitle">${esc(s.title)}${tagHtml(s)}</h2>${srcHtml(s)}${renderBlocks(s, f.uid)}${
      notes ? `<aside class="notes${state.notes ? ' on' : ''}" id="notes"><b>${esc(t('notes.title'))}</b> — ${notes}</aside>` : ''}`;
  }

  /* ---------- Affichage ---------- */
  let cur = null, curIdx = -1, frags = [], fragIdx = 0;
  const slideEl = () => $('#slide');

  // Liens externes : toujours dans un nouvel onglet, sans accès à la page d'origine.
  function hardenLinks(root) {
    $$('a[href]', root).forEach(a => {
      const h = a.getAttribute('href') || '';
      if (/^\s*javascript:/i.test(h)) { a.removeAttribute('href'); return; }
      if (/^https?:/i.test(h)) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
    });
  }

  function show(i, keepFrags) {
    if (i < 0 || i >= flat.length) i = 0;
    const back = keepFrags === undefined && i < curIdx;
    const prevIdx = curIdx;
    curIdx = i; cur = flat[i];
    state.visited[cur.uid] = 1;
    if (cur.mod) state.last = cur.uid;
    save();
    const el = slideEl();
    el.innerHTML = `<div class="slide-inner">${renderBody(cur)}</div>`;
    hardenLinks(el);
    el.scrollTop = 0;
    if (curIdx !== prevIdx && el.focus) el.focus({ preventScroll: true }); // annonce/lecture depuis le début de la slide
    frags = $$('.frag', el); fragIdx = 0;
    if (back) { frags.forEach(x => x.classList.add('show')); fragIdx = frags.length; }
    else if (keepFrags) { fragIdx = Math.min(keepFrags, frags.length); frags.slice(0, fragIdx).forEach(x => x.classList.add('show')); }
    updateChrome();
  }

  function nextLabel() {
    if (cur.kind === 'home' || cur.kind === 'cover') return t('nav.start');
    if (cur.kind === 'recap') {
      const nxt = modules.find(m => m.num > cur.mod.num);
      if (nxt) return t('nav.nextModule', { num: pad(nxt.num) });
    }
    return t('nav.next');
  }

  function updateChrome() {
    const m = cur.mod;
    $('#crumb').innerHTML = m ? `${m.emoji} <b>${pad(m.num)} ${esc(m.title)}</b> › ${esc(cur.title)}` : `${esc(t('icon.home'))} <b>${esc(t('nav.home'))}</b>`;
    const inMod = m ? flat.filter(f => f.mod === m) : [];
    $('#counter').textContent = m ? `${inMod.indexOf(cur) + 1} / ${inMod.length}` : '';
    $('#progress i').style.width = (flat.length > 1 ? curIdx / (flat.length - 1) * 100 : 0) + '%';
    $('#prev').disabled = curIdx === 0;
    $('#next').disabled = curIdx === flat.length - 1 && fragIdx >= frags.length;
    $('#next').classList.toggle('has-frag', fragIdx < frags.length);
    $('#next').textContent = nextLabel();
    const nb = $('#notes-btn'), hasNotes = !!$('#notes');
    nb.hidden = !hasNotes;
    nb.setAttribute('aria-pressed', String(!!state.notes));
    nb.classList.toggle('on', !!state.notes);
    document.title = (m ? `${pad(m.num)} ${m.title} · ` : '') + t('course.title');
    renderNav();
  }

  function renderNav() {
    const q = $('#search').value.trim();
    if (q) return renderSearch(q);
    let lastDay = null;
    $('#navlist').innerHTML = `<a class="nav-home ${cur.kind === 'home' ? 'on' : ''}" href="#home">${esc(t('icon.home'))} ${esc(t('nav.home'))}</a>` + planList().map(m => {
      const d = dayOf(m);
      const head = d !== lastDay ? `<div class="day">${esc(t('day.' + d))}</div>` : '';
      lastDay = d;
      if (m.soon) return head + `<div class="nav-mod soon" aria-disabled="true"><span class="nav-mod-h"><span class="e">${m.emoji}</span>
        <span class="t"><b>${pad(m.num)}</b> ${esc(m.title)}</span><span class="pct">${esc(t('nav.soon'))}</span></span></div>`;
      const open = cur.mod === m;
      return head + `<div class="nav-mod ${open ? 'open' : ''}"><a class="nav-mod-h" href="#${m.id}-0"><span class="e">${m.emoji}</span>
        <span class="t"><b>${pad(m.num)}</b> ${esc(m.title)}</span><span class="pct">${modPct(m)}%</span></a>${
        open ? '<ol>' + flat.filter(f => f.mod === m).map(f =>
          `<li><a class="${f === cur ? 'on' : ''} ${state.visited[f.uid] ? 'seen' : ''}" href="#${f.uid}">${esc(f.title)}</a></li>`).join('') + '</ol>' : ''}</div>`;
    }).join('');
    const on = $('#navlist a.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest' });
  }

  /* Recherche : insensible à la casse et aux accents ; l'index ne contient que le texte affiché
     (titres, champs de contenu, notes, objectifs, À retenir), jamais les noms de champs du schéma. */
  const fold = x => String(x).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const NO_TEXT = new Set(['t', 'lang', 'kind', 'answer', 'ref', 'src', 'extra', 'layout', 'frag', 'wide', 'hl', 'base', 'file', 'id', 'num', 'emoji', 'day', 'tag']);
  function textOf(o, out) {
    if (typeof o === 'string') out.push(strip(o));
    else if (Array.isArray(o)) o.forEach(x => textOf(x, out));
    else if (o && typeof o === 'object') Object.keys(o).forEach(k => { if (!NO_TEXT.has(k)) textOf(o[k], out); });
    return out;
  }
  function searchText(f) {
    if (f.kind === 'cover') return textOf([f.mod.tagline, f.mod.objectives], []).join(' ');
    if (f.kind === 'recap') return textOf(f.mod.takeaways, []).join(' ');
    return textOf([f.slide.blocks, f.slide.notes], []).join(' ');
  }

  let index = null;
  function renderSearch(q) {
    if (!index) index = flat.filter(f => f.mod).map(f => ({ f, title: fold(f.title), text: fold(searchText(f)) }));
    const terms = fold(q).split(/\s+/).filter(Boolean);
    const res = index.filter(x => terms.every(w => x.title.includes(w) || x.text.includes(w))).slice(0, 40);
    $('#navlist').innerHTML = res.length
      ? `<div class="search-res">${res.map(x => `<a href="#${x.f.uid}">${esc(x.f.title)}<small>${x.f.mod.emoji} ${pad(x.f.mod.num)} ${esc(x.f.mod.title)}</small></a>`).join('')}</div>`
      : `<div class="search-empty">${esc(t('search.empty'))}</div>`;
  }

  /* ---------- Navigation ---------- */
  const goUid = uid => { if (location.hash === '#' + uid) show(flat.findIndex(f => f.uid === uid)); else location.hash = '#' + uid; };

  function next() {
    if (fragIdx < frags.length) { frags[fragIdx++].classList.add('show'); updateChrome(); return; }
    if (curIdx < flat.length - 1) goUid(flat[curIdx + 1].uid);
  }
  function prev() { if (curIdx > 0) goUid(flat[curIdx - 1].uid); }

  function fromHash() {
    let uid = '';
    try { uid = decodeURIComponent(location.hash.slice(1)); } catch (e) { /* ancre malformée */ }
    let i = flat.findIndex(f => f.uid === uid);
    if (i < 0) i = 0;
    show(i);
  }

  /* ---------- Interactions ---------- */
  function copyText(text, btn) {
    const done = () => { const o = btn.textContent; btn.textContent = t('block.copied'); setTimeout(() => { btn.textContent = o; }, 1200); };
    const fallback = () => {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ } ta.remove();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }

  function onSlideClick(e) {
    const opt = e.target.closest('.opt');
    if (opt) {
      const quiz = opt.closest('.quiz');
      if (quiz.classList.contains('done')) return;
      const a = +quiz.dataset.a, i = +opt.dataset.i;
      quiz.classList.add('done');
      $$('.opt', quiz)[a].classList.add('ok');
      if (i !== a) opt.classList.add('ko');
      if (state.quiz[quiz.dataset.k] === undefined) { state.quiz[quiz.dataset.k] = i === a ? 1 : 0; save(); }
      return;
    }
    if (e.target.closest('.redo')) {
      const quiz = e.target.closest('.quiz');
      quiz.classList.remove('done'); $$('.opt', quiz).forEach(o => o.classList.remove('ok', 'ko'));
      return;
    }
    const cp = e.target.closest('.copy');
    if (cp) {
      const pre = $('pre', cp.closest('.codebox')).cloneNode(true);
      $$('.c-ps', pre).forEach(x => x.remove());
      copyText(pre.textContent, cp); return;
    }
    if (e.target.id === 'reset' && confirm(t('home.resetConfirm'))) {
      state.visited = {}; state.quiz = {}; state.last = null; save(); show(curIdx);
    }
  }

  function applyStatic() {
    document.documentElement.lang = 'fr';
    $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(',').forEach(p => {
      const [a, k] = p.split(':'); el.setAttribute(a.trim(), t(k.trim()));
    }));
  }

  function toggleMenu() {
    if (window.matchMedia('(max-width: 900px)').matches) document.body.classList.toggle('menu-open');
    else document.body.classList.toggle('menu-closed');
  }
  function applyTheme() {
    if (state.theme) document.documentElement.setAttribute('data-theme', state.theme);
    else document.documentElement.removeAttribute('data-theme');
  }
  function toggleTheme() {
    const dark = state.theme ? state.theme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = dark ? 'light' : 'dark'; save(); applyTheme();
  }
  function toggleNotes() {
    const el = $('#notes'); if (!el) return;
    state.notes = !state.notes; save();
    el.classList.toggle('on', state.notes);
    updateChrome();
  }

  function start() {
    build();
    applyStatic();
    applyTheme();
    $('#slide').addEventListener('click', onSlideClick);
    $('#next').addEventListener('click', next);
    $('#prev').addEventListener('click', prev);
    $('#menu').addEventListener('click', toggleMenu);
    $('#theme').addEventListener('click', toggleTheme);
    $('#notes-btn').addEventListener('click', toggleNotes);
    $('#search').addEventListener('input', () => renderNav());
    $('#navlist').addEventListener('click', () => document.body.classList.remove('menu-open'));
    window.addEventListener('hashchange', fromHash);
    document.addEventListener('keydown', e => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.matches('input, textarea')) { if (e.key === 'Escape') e.target.blur(); return; }
      // Espace sur un bouton / résumé / lien : action native (répondre à un quiz, déplier une solution…), pas de navigation.
      if (e.key === ' ' && e.target.closest && e.target.closest('button, summary, a, select, [contenteditable]')) return;
      if (e.key === 'Escape') { document.body.classList.remove('menu-open'); return; }
      switch (e.key) {
        case 'ArrowRight': case 'PageDown': case ' ': e.preventDefault(); next(); break;
        case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
        case 'Home': goUid(flat[0].uid); break;
        case 'End': goUid(flat[flat.length - 1].uid); break;
        case 'm': toggleMenu(); break;
        case 'n': toggleNotes(); break;
        case 't': toggleTheme(); break;
        case '/': e.preventDefault(); document.body.classList.remove('menu-closed'); $('#search').focus(); break;
      }
    });
    let x0 = null, y0 = 0;
    $('#slide').addEventListener('touchstart', e => {
      // pas de changement de slide en faisant défiler un code, un tableau ou un schéma
      x0 = e.target.closest && e.target.closest('pre, .tablewrap, .diagram') ? null : e.touches[0].clientX;
      y0 = e.touches[0].clientY;
    }, { passive: true });
    $('#slide').addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0; x0 = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > 2 * Math.abs(dy)) (dx < 0 ? next : prev)();
    }, { passive: true });
    $('#scrim').addEventListener('click', () => document.body.classList.remove('menu-open'));
    if (window.matchMedia('(max-width: 900px)').matches) document.body.classList.remove('menu-closed');
    fromHash();
  }

  window.COURSE = {
    modules: [], plan: [], i18n: {},
    add(m) { this.modules.push(m); },
    start
  };
})();
