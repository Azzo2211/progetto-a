/*
 * Progetto A - Logica: generatori di esercizi (senza DOM).
 *
 * Ogni generatore crea un esercizio a partire da un seme e da un livello (1 = facile) e lo
 * controlla con un risolutore: se l'esercizio ha piu' di una soluzione, viene scartato e rifatto.
 *   matrix  matrici in stile Raven: regole su forma, numero, grandezza, colore; ai livelli alti
 *           sovrapposizioni di linee (XOR). 8 risposte costruite in modo che nessun valore sia
 *           "il piu' frequente" (cosi' non si indovina per esclusione).
 *   series  serie di numeri: si scrive il numero dopo. Scartate le serie che altre regole semplici
 *           continuerebbero in modo diverso.
 *   grid    griglie di deduzione (case in fila, persone, lavori, animali): soluzione unica.
 *   knights cavalieri e furfanti: chi dice sempre il vero e chi mente sempre.
 *   syllo   sillogismi: la conclusione segue per forza? (insiemi non vuoti)
 *   prob    probabilita': dadi, monete, carte, test diagnostici (Bayes), valore atteso.
 *   crt     riflessione: problemi con una risposta d'istinto sbagliata (come il test di Frederick).
 */
(function (root) {
  "use strict";

  /* ------------------------------------------------------------ utilita' */
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const ri = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  const pick = (rand, list) => list[Math.floor(rand() * list.length)];
  function shuffle(list, rand) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function permutations(list) {
    if (list.length <= 1) return [list.slice()];
    const out = [];
    list.forEach((x, i) => permutations(list.slice(0, i).concat(list.slice(i + 1))).forEach((p) => out.push([x].concat(p))));
    return out;
  }
  const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  // difficolta' Elo di un esercizio risolto dalla frazione p dei partecipanti tipici (1000 = meta')
  const diffOf = (p) => Math.round(1000 + 400 * Math.log10((1 - Math.min(0.97, Math.max(0.03, p))) / Math.min(0.97, Math.max(0.03, p))));
  const pct = (x, d = 0) => `${(Math.round(x * 100 * 10 ** d) / 10 ** d).toString().replace(".", ",")}%`;

  /* ============================================================ MATRICI */
  const SHAPES = ["circle", "triangle", "square", "pentagon", "hexagon", "diamond"];
  const SHAPE_IT = { circle: "cerchio", triangle: "triangolo", square: "quadrato", pentagon: "pentagono", hexagon: "esagono", diamond: "rombo" };
  const SIZE_IT = ["piccolo", "medio", "grande"];
  const FILL_IT = ["bianco", "grigio", "nero"];
  const ATTRS = {
    shape: { values: SHAPES.length, ordered: false, label: "la forma" },
    count: { values: 5, ordered: true, label: "il numero di figure" },
    size: { values: 3, ordered: true, label: "la grandezza" },
    fill: { values: 3, ordered: true, label: "il colore" }
  };
  // linee per le sovrapposizioni: orizzontale, verticale, due diagonali, croce interna
  const LINES = ["h", "v", "d1", "d2"];
  const LINE_IT = { h: "orizzontale", v: "verticale", d1: "diagonale ↘", d2: "diagonale ↗" };
  // livelli: quante regole e di che tipo
  const MATRIX_LEVELS = [
    null,
    { rules: [["count", "prog"]], alt: [] },
    { rules: [["any", "prog"], ["any", "const"]], alt: [[["shape", "dist"]], [["fill", "prog"]]] },
    { rules: [["any", "dist"], ["any", "prog"]] },
    { rules: [["any", "dist"], ["any", "prog"], ["any", "dist"]] },
    { rules: [["any", "dist"], ["any", "prog"], ["any", "dist"], ["any", "prog"]] },
    { rules: [["any", "dist"]], logic: "xor" },
    { rules: [["any", "dist"], ["any", "prog"]], logic: "xor" }
  ];
  const MATRIX_MAX = MATRIX_LEVELS.length - 1;
  // frazione di risposte giuste attesa per livello: dai dati di Matzen e colleghi (2010) per 1-3 regole
  // e per le sovrapposizioni XOR; i livelli 2 e 5 sono stime intermedie
  const MATRIX_P = [0, 0.938, 0.88, 0.85, 0.74, 0.62, 0.34, 0.28];
  const MATRIX_SRC = [null, "Matzen e colleghi (2010): problemi a una regola, 94% di risposte giuste", null, "Matzen e colleghi (2010): problemi a due regole, circa 75-85%", "Matzen e colleghi (2010): problemi a tre regole, 55-74%", null, "Matzen e colleghi (2010): problemi con XOR, 34%", "Matzen e colleghi (2010): problemi con XOR, 34%"];

  function makeMatrix(level, seed) {
    const rand = rng(seed);
    level = Math.max(1, Math.min(MATRIX_MAX, level));
    const lv = MATRIX_LEVELS[level];
    let ruleSpec = lv.rules;
    if (lv.alt && lv.alt.length && rand() < 0.4) ruleSpec = pick(rand, lv.alt);
    // assegna gli attributi alle regole
    const free = shuffle(Object.keys(ATTRS), rand);
    const rules = {};
    ruleSpec.forEach(([attr, type]) => {
      let a = attr;
      if (a === "any") a = free.find((x) => !rules[x] && (type !== "prog" || ATTRS[x].ordered));
      else if (rules[a]) a = free.find((x) => !rules[x] && (type !== "prog" || ATTRS[x].ordered));
      if (!a) return;
      rules[a] = type;
    });
    // valori di base per gli attributi senza regola (costanti in tutta la matrice)
    const base = { shape: ri(rand, 0, SHAPES.length - 1), count: ri(rand, 0, 2), size: ri(rand, 1, 2), fill: ri(rand, 0, 2) };
    const grid = [[], [], []].map(() => [{}, {}, {}]);
    const desc = [];
    Object.keys(ATTRS).forEach((attr) => {
      const type = rules[attr];
      const n = ATTRS[attr].values;
      if (!type) {
        for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) grid[r][c][attr] = base[attr];
        return;
      }
      if (type === "const") {
        // ogni riga ha un valore suo, uguale nelle tre caselle
        const vals = shuffle([...Array(n).keys()], rand).slice(0, 3);
        for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) grid[r][c][attr] = vals[r];
        desc.push(`${ATTRS[attr].label} resta uguale lungo ogni riga`);
      } else if (type === "prog") {
        const step = attr === "count" && rand() < 0.3 ? 2 : 1;
        const span = 2 * step;
        const dir = rand() < 0.5 ? 1 : -1;
        const starts = [0, 1, 2].map(() => ri(rand, 0, n - 1 - span));
        for (let r = 0; r < 3; r += 1) {
          for (let c = 0; c < 3; c += 1) {
            const v = dir > 0 ? starts[r] + c * step : starts[r] + span - c * step;
            grid[r][c][attr] = v;
          }
        }
        desc.push(`${ATTRS[attr].label} ${dir > 0 ? "cresce" : "cala"} di ${step} a ogni casella, da sinistra a destra`);
      } else {
        // distribuzione di tre: tre valori, uno per riga e uno per colonna (quadrato latino)
        const vals = shuffle([...Array(n).keys()], rand).slice(0, 3);
        const shift = rand() < 0.5 ? 1 : 2;
        for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) grid[r][c][attr] = vals[(c + r * shift) % 3];
        desc.push(`${ATTRS[attr].label}: in ogni riga ci sono tre valori diversi, ognuno una volta sola (${attr === "shape" ? vals.map((v) => SHAPE_IT[SHAPES[v]]).join(", ") : attr === "fill" ? vals.map((v) => FILL_IT[v]).join(", ") : attr === "size" ? vals.map((v) => SIZE_IT[v]).join(", ") : vals.map((v) => v + 1).join(", ")})`);
      }
    });
    // sovrapposizione di linee: terza colonna = prima XOR seconda
    let logic = null;
    if (lv.logic) {
      logic = lv.logic;
      for (let r = 0; r < 3; r += 1) {
        let a, b;
        do {
          a = LINES.filter(() => rand() < 0.5);
          b = LINES.filter(() => rand() < 0.5);
        } while (!a.length || !b.length || a.join() === b.join() || LINES.filter((l) => a.includes(l) !== b.includes(l)).length === 0);
        grid[r][0].lines = a;
        grid[r][1].lines = b;
        grid[r][2].lines = LINES.filter((l) => a.includes(l) !== b.includes(l));
      }
      desc.push("le linee: nella terza casella restano solo le linee che compaiono in una sola delle prime due (quelle presenti in tutte e due si cancellano)");
    }
    const answer = { ...grid[2][2], lines: grid[2][2].lines ? grid[2][2].lines.slice() : undefined };
    // 8 risposte: tutte le combinazioni di 3 cambiamenti (valore giusto o alternativo)
    const variants = [];
    const changeable = Object.keys(ATTRS).filter((a) => ATTRS[a].values > 1);
    const order = shuffle(changeable.filter((a) => rules[a]), rand).concat(shuffle(changeable.filter((a) => !rules[a]), rand));
    if (logic) order.unshift("lines:0", "lines:1");
    const chosen = order.slice(0, 3);
    chosen.forEach((key) => {
      if (key.startsWith("lines:")) {
        // cambia una linea: aggiunge o toglie una linea
        const l = pick(rand, LINES);
        variants.push({ key, apply: (cell) => { const set = new Set(cell.lines); if (set.has(l)) set.delete(l); else set.add(l); cell.lines = LINES.filter((x) => set.has(x)); } });
        return;
      }
      const n = ATTRS[key].values;
      const cur = answer[key];
      // alternativa plausibile: un valore vicino o un altro valore gia' presente nella matrice
      const seen = new Set();
      for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) seen.add(grid[r][c][key]);
      let alts = [...seen].filter((v) => v !== cur);
      if (!alts.length) alts = [cur + 1 < n ? cur + 1 : cur - 1];
      const alt = pick(rand, alts);
      variants.push({ key, apply: (cell) => { cell[key] = alt; } });
    });
    const options = [];
    for (let mask = 0; mask < 8; mask += 1) {
      const cell = { ...answer, lines: answer.lines ? answer.lines.slice() : undefined };
      variants.forEach((v, i) => { if (mask & (1 << i)) v.apply(cell); });
      options.push(cell);
    }
    const key = (c) => `${c.shape}|${c.count}|${c.size}|${c.fill}|${(c.lines || []).join(",")}`;
    const uniq = new Set(options.map(key));
    if (uniq.size < 8) return makeMatrix(level, (seed * 31 + 7) >>> 0); // due risposte uguali: si rifà
    const shuffled = shuffle(options.map((c, i) => ({ c, ok: i === 0 })), rand);
    return {
      kind: "matrix", level, seed,
      grid: grid.map((row, r) => row.map((cell, c) => (r === 2 && c === 2 ? null : cell))),
      options: shuffled.map((x) => x.c),
      answer: shuffled.findIndex((x) => x.ok),
      rules: Object.keys(rules).length + (logic ? 1 : 0),
      p: MATRIX_P[level], diff: diffOf(MATRIX_P[level]), src: MATRIX_SRC[level] || "",
      explain: `Le regole (lungo le righe): ${desc.join("; ")}.`
    };
  }

  /* ============================================================ SERIE */
  // ogni regola: genera i termini; level = difficolta' tipica
  const SERIES_RULES = [
    { id: "arith", level: 1, make(r) { const a = ri(r, 1, 30), d = pick(r, [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, -3, -4, -5, -6, -7]); return { f: (i) => a + d * i, text: `si aggiunge ${d > 0 ? d : `−${-d}`} ogni volta` }; } },
    { id: "geom", level: 2, make(r) { const a = ri(r, 1, 5), k = pick(r, [2, 2, 3]); return { f: (i) => a * k ** i, text: `si moltiplica per ${k} ogni volta` }; } },
    { id: "diff2", level: 2, make(r) { const a = ri(r, 1, 20), d = ri(r, 1, 5), k = ri(r, 1, 3); return { f: (i) => a + d * i + (k * i * (i - 1)) / 2, text: `la differenza cresce di ${k} ogni volta (+${d}, +${d + k}, +${d + 2 * k}…)` }; } },
    { id: "alt", level: 3, make(r) { const a = ri(r, 1, 9), p = ri(r, 2, 6), m = pick(r, [2, 3]); return { f: (i) => { let x = a; for (let j = 0; j < i; j += 1) x = j % 2 === 0 ? x + p : x * m; return x; }, text: `si alternano +${p} e ×${m}` }; } },
    { id: "inter", level: 3, make(r) { const a = ri(r, 1, 20), d1 = ri(r, 2, 6), b = ri(r, 20, 60), d2 = -ri(r, 2, 6); return { f: (i) => (i % 2 === 0 ? a + d1 * (i / 2) : b + d2 * ((i - 1) / 2)), text: `sono due serie intrecciate: nei posti dispari +${d1}, nei posti pari −${-d2}` }; } },
    { id: "square", level: 3, make(r) { const s = ri(r, 1, 6), c = ri(r, -3, 3); return { f: (i) => (i + s) ** 2 + c, text: `sono i quadrati ${s * s}, ${(s + 1) ** 2}, ${(s + 2) ** 2}…${c ? ` ${c > 0 ? "più" : "meno"} ${Math.abs(c)}` : ""}` }; } },
    { id: "fib", level: 3, make(r) { const a = ri(r, 1, 6), b = ri(r, 1, 9); return { f: (i) => { let x = a, y = b; for (let j = 0; j < i; j += 1) [x, y] = [y, x + y]; return x; }, text: "ogni numero è la somma dei due prima" }; } },
    { id: "lin", level: 4, make(r) { const a = ri(r, 1, 6), k = pick(r, [2, 3]), c = pick(r, [-2, -1, 1, 2, 3]); return { f: (i) => { let x = a; for (let j = 0; j < i; j += 1) x = x * k + c; return x; }, text: `ogni numero è il precedente ×${k} ${c > 0 ? "+" : "−"} ${Math.abs(c)}` }; } },
    { id: "diffgeo", level: 4, make(r) { const a = ri(r, 1, 20), k = 2, d = ri(r, 1, 3); return { f: (i) => a + d * (k ** i - 1), text: `le differenze raddoppiano (+${d}, +${2 * d}, +${4 * d}…)` }; } },
    { id: "fact", level: 4, make(r) { const a = ri(r, 1, 3); return { f: (i) => { let x = a; for (let j = 1; j <= i; j += 1) x *= j + 1; return x; }, text: "si moltiplica per 2, poi per 3, poi per 4…" }; } },
    { id: "tri", level: 4, make(r) { const s = ri(r, 1, 4); return { f: (i) => ((i + s) * (i + s + 1)) / 2, text: "sono i numeri triangolari: le differenze crescono di 1 (+2, +3, +4…)" }; } },
    { id: "cube", level: 5, make(r) { const s = ri(r, 1, 3), c = ri(r, -2, 2); return { f: (i) => (i + s) ** 3 + c, text: `sono i cubi ${s ** 3}, ${(s + 1) ** 3}, ${(s + 2) ** 3}…${c ? ` ${c > 0 ? "più" : "meno"} ${Math.abs(c)}` : ""}` }; } },
    { id: "prime", level: 5, make(r) { const P = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53]; const s = ri(r, 0, 4); return { f: (i) => P[i + s], text: "sono i numeri primi in fila" }; } },
    { id: "diffib", level: 5, make(r) { const a = ri(r, 1, 10); return { f: (i) => { const d = [1, 1, 2, 3, 5, 8, 13, 21, 34]; let x = a; for (let j = 0; j < i; j += 1) x += d[j]; return x; }, text: "le differenze sono la successione di Fibonacci (1, 1, 2, 3, 5, 8…)" }; } },
    { id: "interg", level: 5, make(r) { const a = ri(r, 1, 4), b = ri(r, 30, 90); return { f: (i) => (i % 2 === 0 ? a * 2 ** (i / 2) : b - 7 * ((i - 1) / 2)), text: "due serie intrecciate: nei posti dispari si raddoppia, nei posti pari −7" }; } }
  ];
  const SERIES_MAX = 5;
  // stime della frazione di risposte giuste per tipo di regola (non ci sono norme pubblicate per queste serie)
  const SERIES_P = { arith: 0.95, geom: 0.88, diff2: 0.8, alt: 0.6, inter: 0.62, square: 0.55, fib: 0.6, lin: 0.45, diffgeo: 0.5, fact: 0.5, tri: 0.55, cube: 0.4, prime: 0.45, diffib: 0.3, interg: 0.35 };

  // continuazioni alternative: altre regole semplici che spiegano gli stessi numeri
  function altNexts(xs) {
    const out = [];
    const n = xs.length;
    const diffs = (a) => a.slice(1).map((x, i) => x - a[i]);
    const allSame = (a) => a.length && a.every((x) => x === a[0]);
    // differenze costanti di ordine 1, 2, 3
    let level = xs.slice();
    const stack = [];
    for (let k = 0; k < 3; k += 1) {
      level = diffs(level);
      stack.push(level);
      if (level.length >= 2 && allSame(level)) {
        let add = level[0];
        for (let j = stack.length - 2; j >= 0; j -= 1) add = stack[j][stack[j].length - 1] + add;
        out.push(xs[n - 1] + add);
        break;
      }
    }
    // rapporto costante
    if (xs.every((x) => x !== 0)) {
      const r = xs[1] / xs[0];
      if (Number.isInteger(r) && xs.every((x, i) => i === 0 || x === xs[i - 1] * r)) out.push(xs[n - 1] * r);
    }
    // x(n) = a*x(n-1) + b con a, b interi
    for (let a = -3; a <= 4; a += 1) {
      const b = xs[1] - a * xs[0];
      if (xs.every((x, i) => i === 0 || x === a * xs[i - 1] + b)) out.push(a * xs[n - 1] + b);
    }
    // ricorrenza a due termini x(n) = p*x(n-1) + q*x(n-2)
    for (let p = -2; p <= 3; p += 1) {
      for (let q = -2; q <= 3; q += 1) {
        if (xs.every((x, i) => i < 2 || x === p * xs[i - 1] + q * xs[i - 2])) out.push(p * xs[n - 1] + q * xs[n - 2]);
      }
    }
    // due serie intrecciate aritmetiche
    const ev = xs.filter((_, i) => i % 2 === 0);
    const od = xs.filter((_, i) => i % 2 === 1);
    const dE = diffs(ev);
    const dO = diffs(od);
    if (ev.length >= 3 && od.length >= 2 && allSame(dE) && allSame(dO)) out.push(n % 2 === 0 ? ev[ev.length - 1] + dE[0] : od[od.length - 1] + dO[0]);
    return out;
  }
  function makeSeries(level, seed) {
    const lv = Math.max(1, Math.min(SERIES_MAX, level));
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const rand = rng((seed + attempt * 7919) >>> 0);
      const pool = SERIES_RULES.filter((r) => r.level === lv || (lv >= 3 && r.level === lv - 1 && rand() < 0.25));
      const rule = pick(rand, pool);
      const g = rule.make(rand);
      const shown = rule.id === "inter" || rule.id === "interg" ? 7 : 6;
      const xs = Array.from({ length: shown }, (_, i) => g.f(i));
      const next = g.f(shown);
      if (!xs.concat(next).every((x) => Number.isInteger(x) && Math.abs(x) < 100000)) continue;
      if (new Set(xs).size < 4) continue;
      const alts = altNexts(xs).filter((v) => v !== next);
      if (alts.length) continue; // un'altra regola semplice darebbe un numero diverso
      return { kind: "series", level: lv, seed, rule: rule.id, terms: xs, answer: next, p: SERIES_P[rule.id], diff: diffOf(SERIES_P[rule.id]), explain: `Regola: ${g.text}. Il numero dopo è ${fmt(next)}.` };
    }
    return makeSeries(1, seed + 1);
  }

  /* ============================================================ GRIGLIE */
  // articolo determinativo maschile: l', lo, il
  const art = (v) => (/^[aeiou]/i.test(v) ? "l'" : /^(s[^aeiou]|z|gn|ps)/i.test(v) ? "lo " : "il ");
  // pred = cosa si dice di una casa; subj = come la si nomina
  const GRID_CATS = {
    nome: { label: "Nome", values: ["Anna", "Bruno", "Carla", "Dario", "Elena"], pred: (v) => `si chiama ${v}`, subj: (v) => v },
    lavoro: { label: "Lavoro", values: ["medico", "avvocato", "cuoco", "pilota", "pittore"], pred: (v) => `fa ${art(v)}${v}`, subj: (v) => `chi fa ${art(v)}${v}` },
    animale: { label: "Animale", values: ["cane", "gatto", "pesce", "pappagallo", "coniglio"], pred: (v) => `ha il ${v}`, subj: (v) => `chi ha il ${v}` },
    auto: { label: "Auto", values: ["rossa", "blu", "verde", "bianca", "nera"], pred: (v) => `ha l'auto ${v}`, subj: (v) => `chi ha l'auto ${v}` }
  };
  const GRID_LEVELS = [null, { n: 3, cats: 2 }, { n: 3, cats: 3 }, { n: 4, cats: 2 }, { n: 4, cats: 3 }, { n: 4, cats: 3, hard: true }];
  const GRID_MAX = GRID_LEVELS.length - 1;
  const GRID_P = [0, 0.95, 0.85, 0.75, 0.55, 0.4]; // stime
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // valuta un indizio su una soluzione completa o parziale (undefined = non ancora deciso)
  function gridClueOk(clue, pos) {
    // pos[cat][value] = casa (0..n-1)
    const p = (ref) => (pos[ref.cat] ? pos[ref.cat][ref.v] : undefined);
    const a = p(clue.a);
    const b = clue.b ? p(clue.b) : undefined;
    if (a === undefined || (clue.b && b === undefined)) return true;
    switch (clue.t) {
      case "same": return a === b;
      case "not": return a !== b;
      case "at": return a === clue.h;
      case "notat": return a !== clue.h;
      case "left": return a === b - 1;
      case "next": return Math.abs(a - b) === 1;
      case "before": return a < b;
      case "end": return a === 0 || a === clue.n - 1;
      default: return true;
    }
  }
  function gridSolve(n, cats, clues, limit = 2) {
    const perms = permutations([...Array(n).keys()]);
    const sols = [];
    const pos = {};
    const relevant = cats.map((_, k) => clues.filter((cl) => {
      const used = [cl.a.cat].concat(cl.b ? [cl.b.cat] : []);
      return used.includes(cats[k]) && used.every((c) => cats.indexOf(c) <= k);
    }));
    function rec(k) {
      if (sols.length >= limit) return;
      if (k === cats.length) { sols.push(JSON.parse(JSON.stringify(pos))); return; }
      const cat = cats[k];
      for (const pm of perms) {
        pos[cat] = {};
        GRID_CATS[cat].values.slice(0, n).forEach((v, i) => { pos[cat][v] = pm[i]; });
        if (relevant[k].every((cl) => gridClueOk(cl, pos))) rec(k + 1);
        if (sols.length >= limit) break;
      }
      delete pos[cat];
    }
    rec(0);
    return sols;
  }
  function gridClueText(cl, n) {
    const S = (ref) => GRID_CATS[ref.cat].subj(ref.v);
    const P = (ref) => GRID_CATS[ref.cat].pred(ref.v);
    const house = (h) => (h === 0 ? "nella prima casa" : h === n - 1 ? "nell'ultima casa" : `nella casa ${h + 1}`);
    switch (cl.t) {
      case "same": return `${cap(S(cl.a))} ${P(cl.b)}.`;
      case "not": return `${cap(S(cl.a))} non ${P(cl.b)}.`;
      case "at": return `${cap(S(cl.a))} abita ${house(cl.h)}.`;
      case "notat": return `${cap(S(cl.a))} non abita ${house(cl.h)}.`;
      case "left": return `${cap(S(cl.a))} abita subito a sinistra di ${S(cl.b)}.`;
      case "next": return `${cap(S(cl.a))} abita accanto a ${S(cl.b)}.`;
      case "before": return `${cap(S(cl.a))} abita più a sinistra di ${S(cl.b)} (non per forza accanto).`;
      case "end": return `${cap(S(cl.a))} abita in una delle due case alle estremità.`;
      default: return "";
    }
  }
  function makeGrid(level, seed) {
    const lv = GRID_LEVELS[Math.max(1, Math.min(GRID_MAX, level))];
    const rand = rng(seed);
    const n = lv.n;
    const cats = ["nome"].concat(shuffle(["lavoro", "animale", "auto"], rand).slice(0, lv.cats - 1));
    // soluzione
    const sol = {};
    cats.forEach((cat) => {
      const pm = shuffle([...Array(n).keys()], rand);
      sol[cat] = {};
      GRID_CATS[cat].values.slice(0, n).forEach((v, i) => { sol[cat][v] = pm[i]; });
    });
    const ref = (cat, v) => ({ cat, v });
    const valuesAt = (cat, h) => GRID_CATS[cat].values.slice(0, n).find((v) => sol[cat][v] === h);
    // indizi veri candidati
    const cands = [];
    for (let i = 0; i < 300; i += 1) {
      const c1 = pick(rand, cats);
      const v1 = pick(rand, GRID_CATS[c1].values.slice(0, n));
      const h1 = sol[c1][v1];
      const others = cats.filter((c) => c !== c1);
      const c2 = pick(rand, cats);
      const v2 = pick(rand, GRID_CATS[c2].values.slice(0, n));
      const h2 = sol[c2][v2];
      const t = pick(rand, lv.hard ? ["same", "not", "left", "next", "before", "end", "notat", "same"] : ["same", "same", "not", "at", "left", "next", "before", "notat"]);
      let cl = null;
      if (t === "same" && others.length) { const c = pick(rand, others); cl = { t, a: ref(c1, v1), b: ref(c, valuesAt(c, h1)) }; }
      else if (t === "not" && c2 !== c1 && h1 !== h2) cl = { t, a: ref(c1, v1), b: ref(c2, v2) };
      else if (t === "at") cl = { t, a: ref(c1, v1), h: h1 };
      else if (t === "notat") { const h = ri(rand, 0, n - 1); if (h !== h1) cl = { t, a: ref(c1, v1), h }; }
      else if (t === "left" && h1 < n - 1) { const c = pick(rand, cats.filter((x) => x !== c1)); cl = { t, a: ref(c1, v1), b: ref(c, valuesAt(c, h1 + 1)) }; }
      else if (t === "next" && c2 !== c1 && Math.abs(h1 - h2) === 1) cl = { t, a: ref(c1, v1), b: ref(c2, v2) };
      else if (t === "before" && c2 !== c1 && h1 < h2) cl = { t, a: ref(c1, v1), b: ref(c2, v2) };
      else if (t === "end" && (h1 === 0 || h1 === n - 1)) cl = { t, a: ref(c1, v1), n };
      if (cl && gridClueOk(cl, sol) && !cands.some((x) => JSON.stringify(x) === JSON.stringify(cl))) cands.push(cl);
    }
    // aggiungo indizi finche' la soluzione e' unica
    const clues = [];
    for (const cl of cands) {
      clues.push(cl);
      if (gridSolve(n, cats, clues, 2).length === 1) break;
    }
    if (gridSolve(n, cats, clues, 2).length !== 1) return makeGrid(level, (seed * 17 + 3) >>> 0);
    // tolgo quelli che non servono
    for (let i = clues.length - 1; i >= 0; i -= 1) {
      const without = clues.slice(0, i).concat(clues.slice(i + 1));
      if (gridSolve(n, cats, without, 2).length === 1) clues.splice(i, 1);
    }
    const order = shuffle(clues, rand);
    return {
      kind: "grid", level, seed, n, cats,
      catLabels: cats.map((c) => GRID_CATS[c].label),
      values: Object.fromEntries(cats.map((c) => [c, GRID_CATS[c].values.slice(0, n)])),
      clues: order.map((cl) => gridClueText(cl, n)),
      raw: order,
      solution: Object.fromEntries(cats.map((c) => [c, [...Array(n).keys()].map((h) => valuesAt(c, h))])),
      p: GRID_P[Math.max(1, Math.min(GRID_MAX, level))], diff: diffOf(GRID_P[Math.max(1, Math.min(GRID_MAX, level))]),
      explain: "Metodo: parti dagli indizi certi (una casa precisa, «subito a sinistra»), poi elimina con i «non» e prova i casi rimasti: se un caso porta a una contraddizione, è sbagliato."
    };
  }

  /* ============================================================ CAVALIERI E FURFANTI */
  const KN_NAMES = ["Aldo", "Bea", "Ciro", "Dora"];
  // ogni affermazione: f(k) con k = array di booleani (true = cavaliere)
  function knightStatements(s, n, rand, level) {
    const others = [...Array(n).keys()].filter((i) => i !== s);
    const o = pick(rand, others);
    const rest = others.filter((i) => i !== o);
    const o2 = rest.length ? pick(rand, rest) : -1;
    const N = (i) => KN_NAMES[i];
    const all = [
      { text: `${N(o)} è un furfante.`, f: (k) => !k[o], lv: 1 },
      { text: `${N(o)} è un cavaliere.`, f: (k) => k[o], lv: 1 },
      { text: `${N(o)} e io siamo dello stesso tipo.`, f: (k) => k[o] === k[s], lv: 2 },
      { text: `${N(o)} e io siamo di tipo diverso.`, f: (k) => k[o] !== k[s], lv: 2 },
      { text: "Almeno uno di noi è un furfante.", f: (k) => k.some((x) => !x), lv: 1 },
      { text: "Siamo tutti furfanti.", f: (k) => k.every((x) => !x), lv: 1 },
      { text: "Esattamente uno di noi è un cavaliere.", f: (k) => k.filter(Boolean).length === 1, lv: 3 },
      { text: `Se ${N(o)} è un cavaliere, allora io sono un furfante.`, f: (k) => !k[o] || !k[s], lv: 3 },
      { text: `Se io sono un cavaliere, allora lo è anche ${N(o)}.`, f: (k) => !k[s] || k[o], lv: 4 },
      { text: "Il numero di cavalieri tra noi è pari.", f: (k) => k.filter(Boolean).length % 2 === 0, lv: 4 }
    ];
    if (o2 >= 0) {
      all.push(
        { text: `${N(o)} è un furfante oppure ${N(o2)} è un cavaliere.`, f: (k) => !k[o] || k[o2], lv: 3 },
        { text: `${N(o)} e ${N(o2)} sono entrambi cavalieri.`, f: (k) => k[o] && k[o2], lv: 3 },
        { text: `${N(o)} e ${N(o2)} sono dello stesso tipo.`, f: (k) => k[o] === k[o2], lv: 2 }
      );
    }
    return all.filter((x) => x.lv <= level);
  }
  const KN_LEVELS = [null, { n: 2, lv: 1 }, { n: 2, lv: 3 }, { n: 3, lv: 2 }, { n: 3, lv: 3 }, { n: 3, lv: 4 }, { n: 4, lv: 4 }];
  const KN_MAX = KN_LEVELS.length - 1;
  const KN_P = [0, 0.9, 0.75, 0.6, 0.45, 0.35, 0.25]; // stime
  function knSolve(n, stmts) {
    const sols = [];
    for (let m = 0; m < 1 << n; m += 1) {
      const k = [...Array(n).keys()].map((i) => Boolean(m & (1 << i)));
      if (stmts.every((st) => st.f(k) === k[st.s])) sols.push(k);
    }
    return sols;
  }
  function makeKnights(level, seed) {
    const lv = KN_LEVELS[Math.max(1, Math.min(KN_MAX, level))];
    for (let attempt = 0; attempt < 400; attempt += 1) {
      const rand = rng((seed + attempt * 104729) >>> 0);
      const n = lv.n;
      const speakers = shuffle([...Array(n).keys()], rand).slice(0, n === 2 ? ri(rand, 1, 2) : ri(rand, n - 1, n));
      const stmts = speakers.map((s) => ({ s, ...pick(rand, knightStatements(s, n, rand, lv.lv)) }));
      const sols = knSolve(n, stmts);
      if (sols.length !== 1) continue;
      // per i livelli alti voglio almeno un'affermazione «difficile»
      if (lv.lv >= 3 && !stmts.some((x) => x.lv >= 3)) continue;
      const sol = sols[0];
      return {
        kind: "knights", level, seed, n, names: KN_NAMES.slice(0, n),
        statements: stmts.sort((a, b) => a.s - b.s).map((x) => ({ who: KN_NAMES[x.s], text: x.text })),
        solution: sol, p: KN_P[Math.max(1, Math.min(KN_MAX, level))], diff: diffOf(KN_P[Math.max(1, Math.min(KN_MAX, level))]),
        explain: `Si provano i casi. ${stmts.map((x) => `${KN_NAMES[x.s]} dice «${x.text}»: è ${x.f(sol) ? "vero" : "falso"}, quindi ${KN_NAMES[x.s]} è ${sol[x.s] ? "un cavaliere" : "un furfante"}.`).join(" ")} È l'unica combinazione in cui tutti i cavalieri dicono il vero e tutti i furfanti mentono.`
      };
    }
    // ripiego (non dovrebbe servire): il classico «siamo tutti furfanti»
    return { kind: "knights", level, seed, n: 2, names: KN_NAMES.slice(0, 2), statements: [{ who: KN_NAMES[0], text: "Siamo tutti furfanti." }], solution: [false, true], explain: "Se Aldo fosse un cavaliere direbbe il vero, ma allora sarebbe un furfante: impossibile. Quindi Aldo è un furfante e la frase è falsa: non sono tutti furfanti, quindi Bea è un cavaliere." };
  }

  /* ============================================================ SILLOGISMI */
  // parole inventate (cosi' non conta quello che si sa gia'): [singolare, plurale]
  const TERMS = [
    [["tovo", "tovi"], ["dalvo", "dalvi"], ["ferzo", "ferzi"]],
    [["lumo", "lumi"], ["brento", "brenti"], ["quolo", "quoli"]],
    [["piroto", "piroti"], ["cadono", "cadoni"], ["varzo", "varzi"]],
    [["grutto", "grutti"], ["flano", "flani"], ["bonfo", "bonfi"]],
    [["telbo", "telbi"], ["runco", "runchi"], ["mibo", "mibi"]]
  ];
  function inSet(region, setIdx) { return Boolean(region & (1 << setIdx)); }
  function holds(q, x, y, model) {
    const regs = model; // array di regioni non vuote
    const xs = regs.filter((r) => inSet(r, x));
    if (q === "A") return xs.every((r) => inSet(r, y));
    if (q === "I") return xs.some((r) => inSet(r, y));
    if (q === "E") return xs.every((r) => !inSet(r, y));
    return xs.some((r) => !inSet(r, y));
  }
  const MODELS = (() => {
    const out = [];
    for (let m = 1; m < 256; m += 1) {
      const regs = [...Array(8).keys()].filter((r) => m & (1 << r));
      // insiemi non vuoti
      if ([0, 1, 2].every((s) => regs.some((r) => inSet(r, s)))) out.push(regs);
    }
    return out;
  })();
  function sylloValid(p1, p2, concl) {
    // p = [q, x, y]; insiemi: 0 = S, 1 = M, 2 = P
    return MODELS.every((m) => !(holds(p1[0], p1[1], p1[2], m) && holds(p2[0], p2[1], p2[2], m)) || holds(concl[0], concl[1], concl[2], m));
  }
  function sylloPossible(p1, p2, concl) {
    return MODELS.some((m) => holds(p1[0], p1[1], p1[2], m) && holds(p2[0], p2[1], p2[2], m) && holds(concl[0], concl[1], concl[2], m));
  }
  function qText(q, x, y, names) {
    const X = names[x];
    const Y = names[y];
    if (q === "A") return `Tutti i ${X[1]} sono ${Y[1]}.`;
    if (q === "I") return `Alcuni ${X[1]} sono ${Y[1]}.`;
    if (q === "E") return `Nessun ${X[0]} è un ${Y[0]}.`;
    return `Alcuni ${X[1]} non sono ${Y[1]}.`;
  }
  const SYLLO_MAX = 4;
  // tutte le forme: premesse (quantificatore, figura) e conclusione, gia' classificate
  const SYLLO_FORMS = (() => {
    const out = [];
    const Qs = ["A", "I", "E", "O"];
    Qs.forEach((q1) => Qs.forEach((q2) => [1, 2, 3, 4].forEach((fig) => Qs.forEach((cq) => [0, 1].forEach((rev) => {
      const p1 = fig === 1 || fig === 3 ? [q1, 1, 2] : [q1, 2, 1];
      const p2 = fig === 1 || fig === 2 ? [q2, 0, 1] : [q2, 1, 0];
      const concl = rev ? [cq, 2, 0] : [cq, 0, 2];
      const valid = sylloValid(p1, p2, concl);
      const possible = sylloPossible(p1, p2, concl);
      out.push({ q1, q2, fig, cq, rev, p1, p2, concl, valid, possible });
    })))));
    return out;
  })();
  function sylloPool(lv) {
    return SYLLO_FORMS.filter((f) => (lv === 1 ? f.fig <= 2 && !f.rev && f.q1 !== "O" && f.q2 !== "O" : !(f.q1 === "A" && f.q2 === "A" && f.fig === 1)));
  }
  // frazione di risposte giuste per ognuno dei 64 sillogismi (scegliere la conclusione tra 8, o
  // «nessuna»): 139 persone, dati aperti di Ragni e colleghi (2016), insiemi non vuoti
  const SYLLO_ACC = {"AA1":0.806,"AA2":0.683,"AA3":0.439,"AA4":0.281,"AE1":0.885,"AE2":0.094,"AE3":0.835,"AE4":0.18,"AI1":0.101,"AI2":0.806,"AI3":0.288,"AI4":0.806,"AO1":0.108,"AO2":0.165,"AO3":0.353,"AO4":0.59,"EA1":0.043,"EA2":0.863,"EA3":0.863,"EA4":0.108,"EE1":0.424,"EE2":0.424,"EE3":0.662,"EE4":0.64,"EI1":0.216,"EI2":0.396,"EI3":0.302,"EI4":0.266,"EO1":0.453,"EO2":0.338,"EO3":0.417,"EO4":0.396,"IA1":0.863,"IA2":0.079,"IA3":0.23,"IA4":0.791,"IE1":0.345,"IE2":0.129,"IE3":0.302,"IE4":0.266,"II1":0.317,"II2":0.295,"II3":0.496,"II4":0.475,"IO1":0.331,"IO2":0.36,"IO3":0.475,"IO4":0.396,"OA1":0.151,"OA2":0.137,"OA3":0.331,"OA4":0.525,"OE1":0.302,"OE2":0.417,"OE3":0.331,"OE4":0.396,"OI1":0.345,"OI2":0.273,"OI3":0.446,"OI4":0.468,"OO1":0.381,"OO2":0.41,"OO3":0.597,"OO4":0.597};
  // figure come nei dati: 1 = A-B / B-C, 2 = B-A / C-B, 3 = A-B / C-B, 4 = B-A / B-C (A=0, B=1, C=2)
  function produceForm(key) {
    const q1 = key[0], q2 = key[1], fig = Number(key[2]);
    const p1 = fig === 1 || fig === 3 ? [q1, 0, 1] : [q1, 1, 0];
    const p2 = fig === 1 || fig === 4 ? [q2, 1, 2] : [q2, 2, 1];
    return { p1, p2 };
  }
  function makeSylloProduce(lv, seed) {
    const rand = rng(seed);
    const names = pick(rand, TERMS);
    const keys = Object.keys(SYLLO_ACC).filter((k) => (lv === 3 ? SYLLO_ACC[k] >= 0.4 : true));
    const key = pick(rand, keys);
    const { p1, p2 } = produceForm(key);
    const options = [];
    "AIEO".split("").forEach((q) => [[0, 2], [2, 0]].forEach(([x, y]) => options.push({ key: `${q}${x}${y}`, text: qText(q, x, y, names), valid: sylloValid(p1, p2, [q, x, y]) })));
    const shuffled = shuffle(options, rand);
    const valids = shuffled.filter((o) => o.valid);
    shuffled.push({ key: "NVC", text: "Nessuna di queste conclusioni segue per forza.", valid: valids.length === 0 });
    const p = SYLLO_ACC[key];
    return {
      kind: "syllo", mode: "produce", level: lv, seed, names, form: key,
      premises: [qText(p1[0], p1[1], p1[2], names), qText(p2[0], p2[1], p2[2], names)],
      options: shuffled.map((o) => o.text), correct: shuffled.map((o, i) => (o.valid ? i : -1)).filter((i) => i >= 0),
      p, diff: diffOf(p), src: `Ragni e colleghi (2016), 139 persone: questo sillogismo lo risolveva il ${Math.round(p * 100)}%`,
      explain: valids.length ? `Seguono per forza: ${valids.map((o) => `«${o.text}»`).join(" e ")}. Le altre si possono smentire con un controesempio.` : "Nessuna conclusione segue per forza: per ognuna si può costruire una situazione in cui le premesse sono vere e la conclusione falsa."
    };
  }
  function makeSyllo(level, seed) {
    const lv = Math.max(1, Math.min(SYLLO_MAX, level));
    if (lv >= 3) return makeSylloProduce(lv, seed);
    const rand = rng(seed);
    const names = pick(rand, TERMS);
    const pool = sylloPool(lv);
    const wantValid = rand() < 0.5;
    let cands = pool.filter((f) => f.valid === wantValid);
    if (!wantValid) {
      // invalide: per lo piu' conclusioni possibili ma non obbligate (le piu' ingannevoli)
      const tricky = cands.filter((f) => f.possible);
      if (tricky.length && rand() < 0.75) cands = tricky;
    }
    const f = pick(rand, cands);
    return {
      kind: "syllo", level: lv, seed, names,
      premises: [qText(f.p1[0], f.p1[1], f.p1[2], names), qText(f.p2[0], f.p2[1], f.p2[2], names)],
      conclusion: qText(f.concl[0], f.concl[1], f.concl[2], names),
      answer: f.valid, p: lv === 1 ? 0.8 : 0.68, diff: diffOf(lv === 1 ? 0.8 : 0.68),
      explain: f.valid
        ? "La conclusione segue per forza: non si può costruire nessuna situazione in cui le premesse sono vere e la conclusione falsa."
        : `Non segue per forza: si può costruire una situazione in cui le due premesse sono vere ma la conclusione è falsa. ${counterExample(f.p1, f.p2, f.concl, names)}`
    };
  }
  function counterExample(p1, p2, concl, names) {
    const m = MODELS.find((mm) => holds(p1[0], p1[1], p1[2], mm) && holds(p2[0], p2[1], p2[2], mm) && !holds(concl[0], concl[1], concl[2], mm));
    if (!m) return "";
    const sing = (i) => names[i][0];
    const desc = m.map((r) => {
      const ins = [0, 1, 2].filter((i) => inSet(r, i));
      const outs = [0, 1, 2].filter((i) => !inSet(r, i));
      if (!ins.length) return "";
      return `un ${sing(ins[0])}${ins.slice(1).map((i) => ` che è anche un ${sing(i)}`).join("")}${outs.length ? ` ma non un ${outs.map(sing).join(" né un ")}` : ""}`;
    }).filter(Boolean);
    return `Controesempio: immagina che esistano solo ${desc.join("; ")}. Le premesse sono vere, la conclusione no.`;
  }

  /* ============================================================ PROBABILITA' */
  const PROB_MAX = 5;
  const PROB_P = { coin: 0.8, die: 0.85, atleast: 0.55, sum: 0.7, cards: 0.6, ev: 0.6, bayes: 0.3, bayes2: 0.2, birthday: 0.25 }; // stime
  function makeProb(level, seed) {
    const lv = Math.max(1, Math.min(PROB_MAX, level));
    const rand = rng(seed);
    const types = { 1: ["coin", "die"], 2: ["atleast", "sum"], 3: ["cards", "atleast"], 4: ["bayes", "ev"], 5: ["bayes2", "bayes", "birthday"] }[lv];
    const t = pick(rand, types);
    if (t === "coin") {
      const n = ri(rand, 2, 4);
      const k = ri(rand, 0, n);
      const comb = (a, b) => { let r = 1; for (let i = 0; i < b; i += 1) r = (r * (a - i)) / (i + 1); return r; };
      const p = comb(n, k) / 2 ** n;
      return { kind: "prob", type: t, level: lv, seed, text: `Lanci una moneta equa ${n} volte. Qual è la probabilità di ottenere esattamente ${k} ${k === 1 ? "testa" : "teste"}?`, answer: p, tol: 0.01, explain: `I risultati possibili sono 2^${n} = ${2 ** n}, tutti ugualmente probabili. Quelli con esattamente ${k} teste sono ${comb(n, k)} (combinazioni di ${n} lanci presi ${k} alla volta). Probabilità: ${comb(n, k)}/${2 ** n} = ${pct(p, 1)}.` };
    }
    if (t === "die") {
      const kind = pick(rand, ["even", "gt", "mult3"]);
      if (kind === "gt") { const g = ri(rand, 2, 4); return { kind: "prob", type: t, level: lv, seed, text: `Lanci un dado a sei facce. Qual è la probabilità di ottenere più di ${g}?`, answer: (6 - g) / 6, tol: 0.01, explain: `Le facce maggiori di ${g} sono ${6 - g} su 6: ${6 - g}/6 = ${pct((6 - g) / 6, 1)}.` }; }
      if (kind === "mult3") return { kind: "prob", type: t, level: lv, seed, text: "Lanci un dado a sei facce. Qual è la probabilità che esca un multiplo di 3?", answer: 1 / 3, tol: 0.01, explain: "I multipli di 3 sono 3 e 6: 2 facce su 6, cioè 1/3 = 33,3%." };
      return { kind: "prob", type: t, level: lv, seed, text: "Lanci due volte un dado a sei facce. Qual è la probabilità che esca un numero pari tutte e due le volte?", answer: 0.25, tol: 0.01, explain: "Ogni lancio è pari con probabilità 1/2; i due lanci sono indipendenti, quindi si moltiplica: 1/2 × 1/2 = 1/4 = 25%." };
    }
    if (t === "atleast") {
      const n = ri(rand, 3, 6);
      const p = 1 - (5 / 6) ** n;
      return { kind: "prob", type: t, level: lv, seed, text: `Lanci un dado ${n} volte. Qual è la probabilità di ottenere almeno un 6?`, answer: p, tol: 0.012, lure: n / 6, explain: `Conviene calcolare il contrario: nessun 6 in ${n} lanci ha probabilità (5/6)^${n} = ${pct((5 / 6) ** n, 1)}. Quindi almeno un 6 = 1 − ${pct((5 / 6) ** n, 1)} = ${pct(p, 1)}. La risposta d'istinto «${n} × 1/6 = ${pct(n / 6, 1)}» è sbagliata: conterebbe due volte i casi con più di un 6.` };
    }
    if (t === "sum") {
      const s = ri(rand, 3, 11);
      const ways = [...Array(6).keys()].reduce((acc, a) => acc + [...Array(6).keys()].filter((b) => a + b + 2 === s).length, 0);
      return { kind: "prob", type: t, level: lv, seed, text: `Lanci due dadi. Qual è la probabilità che la somma sia ${s}?`, answer: ways / 36, tol: 0.01, explain: `Le coppie possibili sono 6 × 6 = 36. Quelle con somma ${s} sono ${ways}. Probabilità: ${ways}/36 = ${pct(ways / 36, 1)}.` };
    }
    if (t === "cards") {
      const k = pick(rand, [2, 3]);
      const what = pick(rand, [["assi", 4], ["carte di cuori", 13], ["figure (fanti, donne, re)", 12]]);
      let p = 1;
      for (let i = 0; i < k; i += 1) p *= (what[1] - i) / (52 - i);
      return { kind: "prob", type: t, level: lv, seed, text: `Peschi ${k} carte da un mazzo di 52, senza rimetterle nel mazzo. Qual è la probabilità che siano tutte ${what[0]}?`, answer: p, tol: Math.max(0.002, p * 0.05), explain: `Si moltiplica pescata dopo pescata, tenendo conto che il mazzo si riduce: ${[...Array(k).keys()].map((i) => `${what[1] - i}/${52 - i}`).join(" × ")} = ${pct(p, 2)}.` };
    }
    if (t === "ev") {
      const price = pick(rand, [2, 5, 10]);
      const n = pick(rand, [200, 500, 1000]);
      const prize = price * Math.round(n * pick(rand, [0.3, 0.4, 0.6, 0.7]));
      const ev = prize / n - price;
      return { kind: "prob", type: t, level: lv, seed, unit: "€", text: `Un biglietto costa ${price} €. Su ${fmt(n)} biglietti venduti, uno solo vince ${fmt(prize)} €. Quanto vinci (o perdi) in media per ogni biglietto comprato? (scrivi un numero, negativo se perdi)`, answer: ev, tol: 0.05, explain: `Valore atteso: ${fmt(prize)} € × 1/${fmt(n)} − ${price} € = ${(prize / n).toFixed(2).replace(".", ",")} − ${price} = ${ev.toFixed(2).replace(".", ",")} € a biglietto.` };
    }
    if (t === "birthday") {
      const n = pick(rand, [10, 15, 23, 30]);
      let q = 1;
      for (let i = 0; i < n; i += 1) q *= (365 - i) / 365;
      return { kind: "prob", type: t, level: lv, seed, text: `In una stanza ci sono ${n} persone. Qual è la probabilità che almeno due compiano gli anni lo stesso giorno? (ignora gli anni bisestili)`, answer: 1 - q, tol: 0.02, explain: `Si calcola il contrario: tutti in giorni diversi = 365/365 × 364/365 × … × ${366 - n}/365 = ${pct(q, 1)}. Quindi almeno due nello stesso giorno: ${pct(1 - q, 1)}. Con 23 persone si supera già il 50%: le coppie possibili sono tantissime (${(n * (n - 1)) / 2}).` };
    }
    // test diagnostico (Bayes) con frequenze naturali
    const base = pick(rand, [1000, 1000, 10000]);
    const prev = pick(rand, base === 1000 ? [10, 20, 50] : [10, 50, 100]);
    const sens = pick(rand, [0.8, 0.9, 0.95]);
    const fpr = pick(rand, [0.05, 0.08, 0.1]);
    const tp = prev * sens;
    const fp = (base - prev) * fpr;
    const ppv = tp / (tp + fp);
    if (t === "bayes2") {
      // due test positivi indipendenti
      const tp2 = tp * sens;
      const fp2 = fp * fpr;
      const ppv2 = tp2 / (tp2 + fp2);
      return { kind: "prob", type: t, level: lv, seed, text: `Una malattia colpisce ${fmt(prev)} persone su ${fmt(base)}. Un test la riconosce nel ${Math.round(sens * 100)}% dei malati, ma dà un falso positivo nel ${Math.round(fpr * 100)}% dei sani. Una persona fa il test due volte (risultati indipendenti) ed è positiva tutte e due le volte. Qual è la probabilità che sia malata?`, answer: ppv2, tol: 0.02, explain: `Con le frequenze: su ${fmt(base)} persone, ${fmt(prev)} malate e ${fmt(base - prev)} sane. Positivi due volte: malati ${fmt(prev)} × ${sens} × ${sens} ≈ ${tp2.toFixed(1).replace(".", ",")}; sani ${fmt(base - prev)} × ${fpr} × ${fpr} ≈ ${fp2.toFixed(1).replace(".", ",")}. Probabilità: ${tp2.toFixed(1).replace(".", ",")} / (${tp2.toFixed(1).replace(".", ",")} + ${fp2.toFixed(1).replace(".", ",")}) = ${pct(ppv2, 1)}.` };
    }
    return { kind: "prob", type: t, level: lv, seed, text: `Una malattia colpisce ${fmt(prev)} persone su ${fmt(base)}. Un test la riconosce nel ${Math.round(sens * 100)}% dei malati, ma dà un falso positivo nel ${Math.round(fpr * 100)}% dei sani. Una persona è positiva al test. Qual è la probabilità che sia davvero malata?`, answer: ppv, tol: 0.02, lure: sens, explain: `Con le frequenze naturali: su ${fmt(base)} persone, ${fmt(prev)} sono malate e il test ne trova ${fmt(Math.round(tp * 10) / 10)}; delle ${fmt(base - prev)} sane, ${fmt(Math.round(fp * 10) / 10)} risultano positive per errore. Tra tutti i positivi (${fmt(Math.round((tp + fp) * 10) / 10)}), i malati sono ${fmt(Math.round(tp * 10) / 10)}: ${pct(ppv, 1)}. La risposta d'istinto è il ${Math.round(sens * 100)}%, ma ignora quanto è rara la malattia.` };
  }

  /* ============================================================ RIFLESSIONE (CRT) */
  // problemi con una risposta d'istinto sbagliata (lure); numeri sempre diversi
  const CRT_MAX = 4;
  function makeCrt(level, seed) {
    const lv = Math.max(1, Math.min(CRT_MAX, level));
    const rand = rng(seed);
    const types = { 1: ["race", "rank"], 2: ["lake", "stock"], 3: ["ball", "work"], 4: ["machines", "ball", "work"] }[lv];
    const t = pick(rand, types);
    if (t === "ball") {
      const items = pick(rand, [["un quaderno", "una penna"], ["una racchetta", "una pallina"], ["un panino", "un succo"], ["una cover", "un caricatore"]]);
      const diff = pick(rand, [1, 2, 5, 10]);
      const small = pick(rand, [0.05, 0.1, 0.2, 0.25, 0.5]);
      const total = diff + 2 * small;
      return { kind: "crt", type: t, level: lv, seed, unit: "€", text: `${cap(items[0])} e ${items[1]} costano in tutto ${total.toFixed(2).replace(".", ",")} €. ${cap(items[0])} costa ${diff} € più di ${items[1]}. Quanto costa ${items[1]}?`, answer: small, tol: 0.001, lure: total - diff, explain: `Se ${items[1]} costa x, ${items[0]} costa x + ${diff}. Insieme: 2x + ${diff} = ${total.toFixed(2).replace(".", ",")}, quindi x = ${small.toFixed(2).replace(".", ",")} €. La risposta d'istinto (${(total - diff).toFixed(2).replace(".", ",")} €) darebbe un totale di ${(total - diff + total - diff + diff).toFixed(2).replace(".", ",")} €.` };
    }
    if (t === "lake") {
      const days = pick(rand, [24, 30, 40, 48, 60]);
      const what = pick(rand, [["una macchia di ninfee", "un lago", "tutto il lago", "metà del lago"], ["una muffa", "una fetta di pane", "tutta la fetta", "metà della fetta"], ["un'alga", "una vasca", "tutta la vasca", "metà della vasca"]]);
      return { kind: "crt", type: t, level: lv, seed, unit: "giorni", text: `In ${what[1]} c'è ${what[0]} che ogni giorno raddoppia di grandezza. Se servono ${days} giorni per coprire ${what[2]}, quanti giorni servono per coprire ${what[3]}?`, answer: days - 1, tol: 0, lure: days / 2, explain: `Raddoppia ogni giorno: il giorno prima di essere pieno era a metà. Quindi ${days - 1} giorni, non ${days / 2}.` };
    }
    if (t === "machines") {
      const n = pick(rand, [3, 5, 6, 8]);
      const m = pick(rand, [50, 60, 100, 120].filter((x) => x !== n));
      return { kind: "crt", type: t, level: lv, seed, unit: "minuti", text: `Se ${n} macchine fanno ${n} pezzi in ${n} minuti, quanto tempo serve a ${m} macchine per fare ${m} pezzi?`, answer: n, tol: 0, lure: m, explain: `Ogni macchina fa 1 pezzo in ${n} minuti. ${m} macchine, lavorando insieme, fanno ${m} pezzi negli stessi ${n} minuti.` };
    }
    if (t === "race") {
      const pos = pick(rand, [2, 3, 5]);
      return { kind: "crt", type: t, level: lv, seed, unit: "posto", text: `Stai correndo una gara e superi chi è al ${pos}° posto. In che posizione sei adesso?`, answer: pos, tol: 0, lure: pos - 1, explain: `Prendi il suo posto: sei ${pos}°. Chi è davanti a lui è ancora davanti a te.` };
    }
    if (t === "stock") {
      const a = pick(rand, [100, 200, 500]);
      const up = pick(rand, [50, 100]);
      const down = 50;
      const v = a * (1 + up / 100) * (1 - down / 100);
      return { kind: "crt", type: t, level: lv, seed, unit: "€", text: `Un'azione vale ${a} €. Sale del ${up}% e poi scende del ${down}%. Quanto vale adesso?`, answer: v, tol: 0.01, lure: a * (1 + (up - down) / 100), explain: `Le percentuali si applicano una dopo l'altra: ${a} × ${1 + up / 100} = ${a * (1 + up / 100)}, poi × 0,5 = ${fmt(v)} €. Non si possono sommare: −50% di una cifra più alta toglie di più.` };
    }
    if (t === "rank") {
      const k = pick(rand, [15, 25, 33]);
      const j = pick(rand, [15, 20, 30]);
      return { kind: "crt", type: t, level: lv, seed, unit: "studenti", text: `Marco è il ${k}° più alto e anche il ${j}° più basso della sua scuola. Quanti studenti ci sono?`, answer: k + j - 1, tol: 0, lure: k + j, explain: `Sopra di lui ce ne sono ${k - 1}, sotto ${j - 1}, più lui: ${k - 1} + ${j - 1} + 1 = ${k + j - 1}. Sommando ${k} + ${j} si conta Marco due volte.` };
    }
    // lavoro in comune
    const a = pick(rand, [2, 3, 4, 6]);
    const b = pick(rand, [3, 4, 6, 12].filter((x) => x !== a));
    const tt = (a * b) / (a + b);
    return { kind: "crt", type: t, level: lv, seed, unit: "ore", text: `Un operaio posa un pavimento da solo in ${a} ore, un altro in ${b} ore. Lavorando insieme, quanto ci mettono? (in ore, anche con i decimali)`, answer: tt, tol: 0.05, lure: (a + b) / 2, explain: `In un'ora il primo fa 1/${a} del lavoro, il secondo 1/${b}: insieme ${a + b}/${a * b}. Servono ${a * b}/${a + b} = ${(Math.round(tt * 100) / 100).toString().replace(".", ",")} ore. La media (${((a + b) / 2).toString().replace(".", ",")}) è sbagliata: insieme si va più veloci del più veloce dei due da solo.` };
  }

  // aggiunge p e diff agli esercizi di probabilita' e riflessione (per tipo)
  function withP(item, table) {
    const p = table[item.type];
    return num(p) ? { ...item, p, diff: diffOf(p) } : item;
  }
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  // riflessione: dai dati del test di Frederick (racchetta circa 30-48%, macchine 30-44%, ninfee
  // 42-54% in diversi campioni) e del test 2 di Thomson e Oppenheimer (gara 63%); il resto stime
  const CRT_P = { ball: 0.4, lake: 0.48, machines: 0.36, race: 0.63, stock: 0.45, rank: 0.5, work: 0.4 };
  const MAKERS = { matrix: makeMatrix, series: makeSeries, grid: makeGrid, knights: makeKnights, syllo: makeSyllo, prob: (lv, seed) => withP(makeProb(lv, seed), PROB_P), crt: (lv, seed) => withP(makeCrt(lv, seed), CRT_P) };
  const MAX_LEVEL = { matrix: MATRIX_MAX, series: SERIES_MAX, grid: GRID_MAX, knights: KN_MAX, syllo: SYLLO_MAX, prob: PROB_MAX, crt: CRT_MAX };
  function make(kind, level, seed) {
    const f = MAKERS[kind];
    if (!f) return null;
    return f(Math.max(1, Math.min(MAX_LEVEL[kind], level | 0 || 1)), seed >>> 0);
  }

  const api = {
    make, MAKERS, MAX_LEVEL, rng, shuffle, fmt, pct,
    SHAPES, SHAPE_IT, SIZE_IT, FILL_IT, LINES, LINE_IT,
    gridSolve, gridClueOk, knSolve, sylloValid, altNexts, MODELS
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LogicGen = api;
})(typeof window !== "undefined" ? window : globalThis);
