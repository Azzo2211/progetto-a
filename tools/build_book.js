// Genera chess/opening-book.js dal database aperture di Lichess (licenza CC0).
//   git clone https://github.com/lichess-org/chess-openings
//   node tools/build_book.js ../chess-openings chess/opening-book.js
const fs = require('fs');
const path = require('path');
globalThis.window = globalThis;
require(path.join(__dirname, '..', 'vendor', 'chess.js'));
const dir = process.argv[2];
const out = process.argv[3] || path.join(__dirname, '..', 'chess', 'opening-book.js');

function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h >>> 0;
}
function keyOf(fen) { const p = fen.split(' '); return `${p[0]} ${p[1]} ${p[2]}`; }

const positions = new Map(); // hash -> nameIndex or -1
const names = [];
const nameIndex = new Map();
let lines = 0;
for (const f of ['a.tsv', 'b.tsv', 'c.tsv', 'd.tsv', 'e.tsv']) {
  const rows = fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n').slice(1);
  for (const row of rows) {
    const [eco, name, pgn] = row.split('\t');
    const sans = pgn.replace(/\d+\.(\.\.)?/g, ' ').trim().split(/\s+/);
    const game = new Chess();
    let ok = true;
    for (let i = 0; i < sans.length; i++) {
      try { game.move(sans[i]); } catch (e) { ok = false; break; }
      const h = fnv1a(keyOf(game.fen())).toString(36);
      if (!positions.has(h)) positions.set(h, -1);
    }
    if (!ok) { console.error('bad line', name, pgn); continue; }
    const label = `${eco} ${name}`;
    if (!nameIndex.has(label)) { nameIndex.set(label, names.length); names.push(label); }
    positions.set(fnv1a(keyOf(game.fen())).toString(36), nameIndex.get(label));
    lines++;
  }
}
const keys = [...positions.keys()].sort();
const plain = keys.filter((k) => positions.get(k) < 0);
const named = keys.filter((k) => positions.get(k) >= 0).map((k) => `${k}:${positions.get(k)}`);
const js = `// Libro aperture generato da lichess-org/chess-openings (licenza CC0).\n// Ogni posizione e' salvata come hash FNV-1a (base36) di "pezzi lato arrocco".\n// Rigenerabile con tools/build_book.js.\n(function (root) {\n  var NAMES = ${JSON.stringify(names)};\n  var PLAIN = ${JSON.stringify(plain.join(' '))};\n  var NAMED = ${JSON.stringify(named.join(' '))};\n  root.CHESS_OPENING_BOOK = { names: NAMES, plain: PLAIN, named: NAMED };\n})(typeof window !== "undefined" ? window : globalThis);\n`;
fs.writeFileSync(out, js);
console.log({ lines, positions: positions.size, named: named.length, bytes: js.length });
