#!/usr/bin/env node
/* MIT License — Copyright (c) 2026 CCoupel
   Exporte le contenu du site en JSON (entrée des tests de parité en Python : jamais de parsing JS côté Python).
   Usage : node tools/dump-course.js [--extras] [--out <fichier>]
     (sans option)  écrit build/course.json  { modules: [ { id, num, title, day, emoji, tagline, ..., slides } ] }
     --extras       écrit en plus build/extras-review.md : le contenu additionnel (objectifs, À retenir, quiz) de chaque
                    module avec, en regard, le texte PPTX des slides `ref` — support de relecture humaine (#R1/#R2).
   Les fichiers de build/ ne sont pas commités. Node stdlib uniquement (lecture du PPTX via zlib). */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const oi = argv.indexOf('--out');
const OUT = oi >= 0 ? path.resolve(argv[oi + 1]) : path.join(ROOT, 'build', 'course.json');
const fail = m => { console.error('ERREUR  dump-course : ' + m); process.exit(1); };

function runFile(file, sandbox) {
  try { vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file }); }
  catch (e) { fail(`${path.relative(ROOT, file)} ne s'exécute pas : ${e.message}`); }
}

// Plan (jour, plage) puis modules.
const planSandbox = { COURSE: {} };
runFile(path.join(ROOT, 'assets', 'plan.js'), planSandbox);
const plan = planSandbox.COURSE.plan || [];
const modDir = path.join(ROOT, 'modules');
const modules = [];
for (const name of (fs.existsSync(modDir) ? fs.readdirSync(modDir).sort() : []).filter(f => /^m\d{2}-.*\.js$/.test(f))) {
  let mod = null;
  runFile(path.join(modDir, name), { COURSE: { add(m) { mod = m; } } });
  if (!mod) fail(`${name} : aucun appel COURSE.add`);
  const p = plan.find(x => x.id === mod.id) || {};
  modules.push(Object.assign({ day: p.day || null }, mod));
}
modules.sort((a, b) => a.num - b.num);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ modules }, null, 1) + '\n', 'utf8');
console.log(`écrit   ${path.relative(ROOT, OUT)} (${modules.length} module(s), ${modules.reduce((n, m) => n + m.slides.length, 0)} slides)`);

/* ---------- --extras : relecture humaine du contenu additionnel ---------- */
if (argv.includes('--extras')) {
  const slidesText = readPptxSlides(path.join(ROOT, 'Ansible Training.pptx'));
  const strip = h => String(h).replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  const refText = ref => (ref || []).map(n => `    - slide ${n} : ${(slidesText[n] || '(introuvable)').replace(/\s+/g, ' ').slice(0, 400)}`).join('\n');
  const out = ['# Relecture du contenu additionnel (Bonus HTML)', '',
    'Généré par `node tools/dump-course.js --extras` — non commité. Pour chaque texte : vérifier qu\'il se lit dans les slides `ref` (aucune invention), ton, niveau, une seule bonne réponse par quiz.', ''];
  for (const m of modules) {
    out.push(`## Module ${String(m.num).padStart(2, '0')} — ${m.title}`, '');
    out.push('### Objectifs', '');
    m.objectives.forEach((o, i) => out.push(`${i + 1}. ${strip(o.html)}  _(ref ${o.ref.join(', ')})_`, refText(o.ref), ''));
    out.push('### À retenir', '');
    m.takeaways.forEach((o, i) => out.push(`${i + 1}. ${strip(o.html)}  _(ref ${o.ref.join(', ')})_`, refText(o.ref), ''));
    out.push('### Quiz', '');
    let k = 0;
    m.slides.forEach(s => (s.blocks || []).forEach(b => {
      if (b.t !== 'quiz') return;
      out.push(`**Quiz ${++k}** — ${strip(b.q)}  _(ref ${b.ref.join(', ')})_`, '');
      b.options.forEach((o, i) => out.push(`- ${i === b.answer ? '✅' : '▫️'} ${strip(o)}`));
      out.push('', `Explication : ${strip(b.explain)}`, refText(b.ref), '');
    }));
  }
  const dest = path.join(path.dirname(OUT), 'extras-review.md');
  fs.writeFileSync(dest, out.join('\n') + '\n', 'utf8');
  console.log(`écrit   ${path.relative(ROOT, dest)}`);
}

/* ---------- Lecture minimale d'un PPTX (zip + XML), dans l'ordre de présentation ---------- */
function readZip(file) {
  const buf = fs.readFileSync(file);
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0; i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) fail('PPTX : fin de répertoire zip introuvable');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = {};
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), elen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const off = buf.readUInt32LE(p + 42), name = buf.toString('utf8', p + 46, p + 46 + nlen);
    entries[name] = { method, csize, off };
    p += 46 + nlen + elen + clen;
  }
  return name => {
    const e = entries[name]; if (!e) return null;
    const start = e.off + 30 + buf.readUInt16LE(e.off + 26) + buf.readUInt16LE(e.off + 28);
    const data = buf.subarray(start, start + e.csize);
    return (e.method === 0 ? data : zlib.inflateRawSync(data)).toString('utf8');
  };
}
function xmlText(xml) {
  const dec = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  return [...xml.matchAll(/<a:p\b[\s\S]*?<\/a:p>/g)].map(p => dec([...p[0].matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(t => t[1]).join(''))).filter(s => s.trim()).join(' / ');
}
function readPptxSlides(file) {
  if (!fs.existsSync(file)) return {};
  const get = readZip(file);
  const pres = get('ppt/presentation.xml'), rels = get('ppt/_rels/presentation.xml.rels');
  if (!pres || !rels) return {};
  const target = {};
  for (const r of rels.matchAll(/<Relationship\b[^>]*>/g)) {
    const id = /Id="([^"]+)"/.exec(r[0]), tg = /Target="([^"]+)"/.exec(r[0]);
    if (id && tg) target[id[1]] = tg[1];
  }
  const out = {};
  [...pres.matchAll(/<p:sldId\b[^>]*r:id="([^"]+)"/g)].forEach((m, i) => {
    const t = target[m[1]];
    const xml = t && get('ppt/' + t.replace(/^\/?(ppt\/)?/, ''));
    if (xml) out[i + 1] = xmlText(xml);
  });
  return out;
}
