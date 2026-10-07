#!/usr/bin/env node
/* MIT License — Copyright (c) 2026 CCoupel
   Construit build/Ansible-Training-HTML.zip : le site (index.html, assets/, modules/) tel que commité.
   Déterministe : mêmes fichiers → même sha256 (entrées triées, dates fixes 1980-01-01, permissions fixes 0644,
   compression zlib niveau 9, aucun champ horodaté). Le PPTX n'y figure pas (asset de release séparé).
   Usage : node tools/package.js [--out <fichier.zip>]    Node stdlib uniquement (zlib). */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const oi = argv.indexOf('--out');
const OUT = oi >= 0 ? path.resolve(argv[oi + 1]) : path.join(ROOT, 'build', 'Ansible-Training-HTML.zip');
const fail = m => { console.error('ERREUR  package : ' + m); process.exit(1); };

// Contenu = fichiers SUIVIS par git de ces chemins (jamais de fichier non commité ni de résidu local).
let names;
try {
  names = execFileSync('git', ['-C', ROOT, 'ls-files', '-z', '--', 'index.html', 'assets', 'modules'], { encoding: 'utf8' })
    .split('\0').filter(Boolean);
} catch (e) { fail('git ls-files a échoué : ' + e.message); }
if (!names.length) fail('aucun fichier à empaqueter');
names.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buf => { let c = 0xFFFFFFFF; for (const b of buf) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const DOS_TIME = 0, DOS_DATE = (0 << 9) | (1 << 5) | 1; // 1980-01-01 00:00:00
const MODE = (0o100644 << 16) >>> 0;

const locals = [], centrals = [];
let offset = 0;
for (const name of names) {
  const data = fs.readFileSync(path.join(ROOT, name));
  const comp = zlib.deflateRawSync(data, { level: 9 });
  const crc = crc32(data), nameBuf = Buffer.from(name, 'utf8');
  const flags = 0x0800; // noms en UTF-8
  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(flags, 6); lh.writeUInt16LE(8, 8);
  lh.writeUInt16LE(DOS_TIME, 10); lh.writeUInt16LE(DOS_DATE, 12); lh.writeUInt32LE(crc, 14);
  lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(nameBuf.length, 26); lh.writeUInt16LE(0, 28);
  locals.push(lh, nameBuf, comp);
  const ch = Buffer.alloc(46);
  ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE((3 << 8) | 20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(flags, 8); ch.writeUInt16LE(8, 10);
  ch.writeUInt16LE(DOS_TIME, 12); ch.writeUInt16LE(DOS_DATE, 14); ch.writeUInt32LE(crc, 16);
  ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(nameBuf.length, 28);
  ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32); ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36);
  ch.writeUInt32LE(MODE, 38); ch.writeUInt32LE(offset, 42);
  centrals.push(ch, nameBuf);
  offset += lh.length + nameBuf.length + comp.length;
}
const cdSize = centrals.reduce((n, b) => n + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(names.length, 8); end.writeUInt16LE(names.length, 10);
end.writeUInt32LE(cdSize, 12); end.writeUInt32LE(offset, 16);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.concat([...locals, ...centrals, end]));
console.log(`écrit   ${path.relative(ROOT, OUT)} (${names.length} fichier(s))`);
