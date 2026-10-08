/* Test du moteur de langue (#51) : engine.js chargé dans `vm` avec un DOM factice, sans navigateur.
   Lancé depuis Python par tests/site/i18n/test_moteur_langue.py : `node engine_langue.js <racine du dépôt>`.
   Repris du script de contrôle de course (30 vérifications) : résolution ?lang > mémorisé > navigateur, repli fr,
   t() / L(), quiz traduits, repli quand _en absent, bascule par clic et par `l`, ancre conservée, lang="en" sur le
   verbatim, aria-label et segment actif du bouton. Sortie : « ok   <contrôle> » ou « FAIL <contrôle> » ; code 1 si échec. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const ROOT = process.argv[2];
function run({ search = '', navLang = 'en-US', stored = null, hash = '#m99-1' }) {
  const els = {}, listeners = {}, docListeners = {};
  const mk = sel => els[sel] || (els[sel] = {
    sel, innerHTML: '', textContent: '', value: '', dataset: {}, attrs: {}, style: {}, title: '', hidden: false,
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener(ev, fn) { (listeners[sel + ':' + ev] = listeners[sel + ':' + ev] || []).push(fn); },
    setAttribute(k, v) { this.attrs[k] = v; }, removeAttribute() {}, closest() { return null; }, matches() { return false; },
    scrollIntoView() {}, focus() {}, blur() {}, scrollTop: 0, querySelector() { return mk('x'); }, querySelectorAll() { return []; }
  });
  const store = stored ? { 'ansible-training-v2': JSON.stringify(stored) } : {};
  const sb = {
    console, location: { search, hash }, navigator: { language: navLang },
    localStorage: { getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; } },
    document: { documentElement: { lang: '', setAttribute() {}, removeAttribute() {} }, body: { classList: { add() {}, remove() {}, toggle() {} } }, title: '',
      querySelector: mk, querySelectorAll: () => [], addEventListener(ev, fn) { docListeners[ev] = fn; }, activeElement: null, createElement: () => mk('c') },
    matchMedia: () => ({ matches: false }), setTimeout, addEventListener() {}
  };
  sb.window = sb; vm.createContext(sb);
  const load = f => vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), sb, { filename: f });
  load('assets/engine.js'); load('assets/i18n/fr.js'); load('assets/i18n/en.js');
  vm.runInContext(`COURSE.plan = [{ num: 99, id: 'm99', emoji: 'x', title: 'Mod', day: 'J1', range: [4, 5] }];
   COURSE.add({ id: 'm99', num: 99, emoji: 'x', title: 'Mod', tagline: 'Accroche', tagline_en: 'Tagline',
     objectives: [{ html: 'Objectif', html_en: 'Objective', ref: [4] }],
     slides: [ { title: 'Verbatim title', src: [4], blocks: [ { t: 'text', html: 'Hello' }, { t: 'lab', steps: ['a'] }, { t: 'reveal', slide: 7, html: '<pre>x</pre>' }, { t: 'callout', kind: 'tip', html: 'c' }, { t: 'img', file: 'assets/img/a.png', alt: 'Légende', alt_en: 'Caption' } ] },
               { title: 'Quiz 1', title_en: 'Quiz one', extra: true, blocks: [ { t: 'quiz', q: 'Question ?', q_en: 'Question?', options: ['a', 'b', 'c'], options_en: ['A', 'B', 'C'], answer: 1, explain: 'Parce que', explain_en: 'Because', ref: [4] } ] },
               { title: 'Quiz 2', extra: true, blocks: [ { t: 'quiz', q: 'Seulement FR ?', options: ['x', 'y', 'z'], answer: 0, explain: 'FR', ref: [4] } ] } ],
     takeaways: [{ html: 'Retenir', html_en: 'Remember', ref: [4] }] });`, sb);
  sb.location.hash = hash; sb.COURSE.start();
  return { sb, els, store, listeners, docListeners, html: () => els['#slide'].innerHTML, lang: () => sb.document.documentElement.lang, stored: () => JSON.parse(store['ansible-training-v2'] || '{}') };
}
const eq = (a, b, m) => { if (a !== b) { console.log('FAIL', m, '| got', JSON.stringify(a), '| expected', JSON.stringify(b)); process.exitCode = 1; } else console.log('ok  ', m); };
let r = run({ navLang: 'fr-FR' }); eq(r.lang(), 'fr', 'navigateur fr -> fr');
r = run({ navLang: 'en-GB' }); eq(r.lang(), 'en', 'navigateur en -> en');
r = run({ navLang: '' }); eq(r.lang(), 'fr', 'sans navigator.language -> fr');
r = run({ navLang: 'fr-FR', search: '?lang=en' }); eq(r.lang(), 'en', '?lang=en > navigateur fr'); eq(r.stored().lang, 'en', '?lang mémorisé');
r = run({ navLang: 'en-US', stored: { lang: 'fr' } }); eq(r.lang(), 'fr', 'mémorisé fr > navigateur en');
r = run({ navLang: 'en-US', stored: { lang: 'fr' }, search: '?lang=en' }); eq(r.lang(), 'en', '?lang > mémorisé');
r = run({ navLang: 'de', search: '?lang=xx' }); eq(r.lang(), 'en', '?lang invalide ignoré');
// slide verbatim
r = run({ navLang: 'fr-FR', hash: '#m99-1' });
eq(/class="stitle" lang="en"/.test(r.html()), true, 'fr : titre verbatim lang=en');
eq(/class="blocks" lang="en"/.test(r.html()), true, 'fr : blocs verbatim lang=en');
eq(/alt="Légende"/.test(r.html()), true, 'fr : alt français');
r.listeners['#lang:click'][0]();
eq(r.lang(), 'en', 'clic bouton -> en'); eq(r.stored().lang, 'en', 'choix mémorisé');
eq(/lang="en"/.test(r.html()), false, 'en : pas de lang=en sur les blocs');
eq(/alt="Caption"/.test(r.html()), true, 'en : alt anglais');
eq(/Hello/.test(r.html()), true, 'verbatim inchangé');
eq(r.els['#lang'].attrs['aria-label'], 'FR | EN — language: français', 'aria-label bouton (en)');
eq(/<span class="on" title="English">EN<\/span>/.test(r.els['#lang'].innerHTML), true, 'EN surligné');
// quiz
r = run({ navLang: 'en-US', hash: '#m99-2' });
eq(/Question\?/.test(r.html()) && />B<\/button>/.test(r.html()), true, 'quiz anglais (q, options)');
eq(/Because/.test(r.html()), true, 'explain anglais');
r.listeners['#lang:click'][0]();
eq(/Question \?/.test(r.html()) && />b<\/button>/.test(r.html()), true, 'quiz repasse en français');
eq(r.sb.location.hash, '#m99-2', 'ancre conservée');
// repli
r = run({ navLang: 'en-US', hash: '#m99-3' }); eq(/Seulement FR \?/.test(r.html()) && />y<\/button>/.test(r.html()), true, 'repli français quand _en absent');
// t() repli sur la clé
r = run({ navLang: 'en-US', hash: '#m99-0' }); eq(/Objective/.test(r.html()) && /Tagline/.test(r.html()), true, 'couverture en anglais');
// raccourci l
r = run({ navLang: 'fr-FR', hash: '#m99-1' }); r.docListeners.keydown({ key: 'l', target: { matches: () => false, closest: () => null }, preventDefault() {} }); eq(r.lang(), 'en', 'raccourci l');

// libellés d'interface ajoutés par le site : clés d'interface, lang de l'interface à l'intérieur du conteneur verbatim
r = run({ navLang: 'fr-FR', hash: '#m99-1' });
eq(/<span lang="fr">À réaliser<\/span>/.test(r.html()), true, 'fr : titre du lab par défaut (block.lab) en lang=fr');
eq(/<summary><span lang="fr">Voir la solution \(slide 7\)<\/span><\/summary>/.test(r.html()), true, 'fr : label du reveal (block.revealSlide)');
eq(/class="ch">.*<span lang="fr">Astuce<\/span>/.test(r.html()), true, 'fr : titre de callout par défaut en lang=fr');
r.listeners['#lang:click'][0]();
eq(/<span>To do<\/span>/.test(r.html()), true, 'en : titre du lab par défaut sans lang');
eq(/<summary><span>Show solution \(slide 7\)<\/span><\/summary>/.test(r.html()), true, 'en : label du reveal');
