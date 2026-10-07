#!/usr/bin/env node
/* MIT License — Copyright (c) 2026 CCoupel
   Génère assets/meta.js (version, versions de référence, date de livraison) depuis .claude/project-config.json.
   Seul fichier généré qui soit commité (le site s'ouvre en double-clic, sans étape de build).

   Usage : node tools/sync-meta.js [--check] [--version X.Y.Z] [--date JJ/MM/AAAA]
     (sans option)    écrit assets/meta.js
     --version X.Y.Z  force la version (release) au lieu de celle de project-config.json
                      (X.Y.Z.a de développement → X.Y.Z)
     --date J/M/A     date de livraison affichée sur l'accueil (release) ; sinon la date déjà présente
                      dans assets/meta.js est conservée (aucune date du jour : sortie déterministe)
     --check          n'écrit rien ; sortie 1 si assets/meta.js est absent ou diffère de l'attendu

   Autonome (stdlib Node uniquement) : les tests le copient seul dans un répertoire temporaire. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONFIG = path.join(ROOT, '.claude', 'project-config.json');
const META = path.join(ROOT, 'assets', 'meta.js');

const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const opt = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const fail = m => { console.error('ERREUR  sync-meta : ' + m); process.exit(1); };

for (const a of argv) if (a.startsWith('--') && !['--check', '--version', '--date'].includes(a)) fail('option inconnue ' + a);

let cfg;
try { cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8')); } catch (e) { fail('project-config.json illisible : ' + e.message); }

let version = opt('--version') || String(cfg.version || '');
if (!/^\d+\.\d+\.\d+(\.\d+)?$/.test(version)) fail('version invalide : ' + version);
version = version.split('.').slice(0, 3).join('.');

const ref = cfg.reference_version || {};
if (!ref.ansible_core) fail('reference_version.ansible_core absent de project-config.json');
const reference = { ansible_core: String(ref.ansible_core) };
if (ref.python_controller_min) reference.python_controller_min = String(ref.python_controller_min);

// Date : option explicite, sinon celle déjà écrite dans meta.js (jamais la date du jour).
let existing = null;
try { existing = fs.readFileSync(META, 'utf8'); } catch (e) { /* absent */ }
let date = opt('--date');
if (date === undefined && existing) {
  const m = /"date"\s*:\s*"([^"]*)"/.exec(existing);
  if (m) date = m[1];
}
date = date || '';
if (date && !/^\d{2}\/\d{2}\/\d{4}$/.test(date)) fail('date invalide (attendu JJ/MM/AAAA) : ' + date);

const meta = { version, date, reference_version: reference };
const body = '/* Généré par tools/sync-meta.js depuis .claude/project-config.json — NE PAS MODIFIER À LA MAIN.\n' +
  '   Régénérer : node tools/sync-meta.js [--version X.Y.Z] [--date JJ/MM/AAAA] ; contrôle : node tools/sync-meta.js --check */\n' +
  'window.COURSE_META = ' + JSON.stringify(meta, null, 2) + ';\n';

if (flag('--check')) {
  if (existing === null) fail('assets/meta.js absent — lancer node tools/sync-meta.js');
  if (existing !== body) fail('assets/meta.js n\'est pas à jour (project-config.json ou --version) — lancer node tools/sync-meta.js');
  console.log('ok      assets/meta.js à jour (v' + version + ', ansible-core ' + reference.ansible_core + ')');
  process.exit(0);
}
fs.mkdirSync(path.dirname(META), { recursive: true });
fs.writeFileSync(META, body, 'utf8');
console.log('écrit   assets/meta.js (v' + version + ', ansible-core ' + reference.ansible_core + (date ? ', ' + date : '') + ')');
