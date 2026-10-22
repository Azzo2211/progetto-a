/*
 * Progetto A - Memoria: motore (senza DOM).
 *
 *  - Misura: span di cifre e di blocchi (Corsi) in avanti e all'indietro, lista di 15 parole con
 *    5 prove, lista di disturbo e richiamo differito. Il risultato e' confrontato con valori di
 *    riferimento pubblicati per adulti (NORMS), con la fonte.
 *  - Discipline come nelle gare di memoria: numeri, parole, carte, nomi e volti, a livelli.
 *  - Tecniche: palazzo della memoria (i tuoi luoghi), sistema fonetico 00-99 con ripasso distanziato.
 *  - Programma del giorno, profilo per il quadro, storico.
 * Stato: state.memoryLab. Dati: window.MemoryData (memory/data.js).
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MemoryEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const DATA = root.MemoryData || (typeof require === "function" ? require("./data.js") : { words: [], major: [], names: { male: [], female: [], surnames: [] } });
  const VERSION = 1;
  const DAY = 86400000;

  /* ------------------------------------------------------------ utilita' */
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

  function rng(seed) {
    let a = (Number(seed) || 1) >>> 0;
    return function next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rand = Math.random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function dayKey(t) {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function startOfDay(t) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  function addDays(t, n) {
    const d = new Date(startOfDay(t));
    d.setDate(d.getDate() + n);
    return d.getTime();
  }
  // parola "pulita" per confrontare le risposte: minuscole, senza accenti e apostrofi
  function clean(w) {
    return String(w == null ? "" : w).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’'`]/g, "").replace(/[^a-z0-9 ]/g, "").trim();
  }
  function lev(a, b) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > 1) return 2;
    const m = a.length;
    const n = b.length;
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i += 1) {
      const cur = [i];
      for (let j = 1; j <= n; j += 1) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  // stessa parola? accenti e maiuscole non contano; una lettera sbagliata e' ammessa dalle 6 lettere
  function sameWord(answer, target) {
    const a = clean(answer);
    const b = clean(target);
    if (!a || !b) return false;
    if (a === b) return true;
    return b.length >= 6 && lev(a, b) <= 1;
  }
  // funzione di ripartizione della normale (Abramowitz-Stegun 7.1.26)
  function normCdf(z) {
    const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
    return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
  }

  /* ------------------------------------------------------------ valori di riferimento */
  // Riempiti con le fonti in NORMS (vedi sotto). mean/sd per adulti; by: fasce d'eta' facoltative.
  const NORMS = {};

  function zLabel(z) {
    if (z < -2) return "molto sotto la media";
    if (z < -1) return "sotto la media";
    if (z <= 1) return "nella media";
    if (z <= 2) return "sopra la media";
    return "molto sopra la media";
  }
  // Confronto con i valori di riferimento. profile: { age } (facoltativo).
  function compare(key, value, profile = {}) {
    const n = NORMS[key];
    if (!n || !num(value)) return null;
    let ref = n;
    if (Array.isArray(n.by) && num(profile.age)) {
      const band = n.by.find((b) => profile.age >= b.from && profile.age <= b.to);
      if (band) ref = { ...n, ...band };
    }
    const z = (value - ref.mean) / ref.sd;
    return { z: Math.round(z * 100) / 100, pct: clamp(Math.round(normCdf(z) * 100), 1, 99), label: zLabel(z), mean: ref.mean, sd: ref.sd, source: n.source };
  }

  /* ------------------------------------------------------------ test di span */
  // Blocchi del Corsi: 9 posizioni (x, y in percentuale della tavola).
  let CORSI = [
    [12, 72], [28, 20], [44, 56], [70, 12], [86, 38], [64, 66], [20, 46], [50, 84], [82, 80]
  ];
  // Regole (procedura standard degli span): si parte da startLen, trials sequenze per lunghezza;
  // la lunghezza e' superata con almeno pass risposte giuste; ci si ferma quando non si puo' piu'.
  const SPAN_TESTS = {
    digitF: { key: "digitF", kind: "digit", dir: "f", label: "Cifre in avanti", short: "Cifre avanti", startLen: 3, trials: 2, pass: 1, maxLen: 12, rateMs: 1000 },
    digitB: { key: "digitB", kind: "digit", dir: "b", label: "Cifre all'indietro", short: "Cifre indietro", startLen: 2, trials: 2, pass: 1, maxLen: 11, rateMs: 1000 },
    corsiF: { key: "corsiF", kind: "corsi", dir: "f", label: "Blocchi in avanti (Corsi)", short: "Blocchi avanti", startLen: 2, trials: 2, pass: 1, maxLen: 9, rateMs: 1000 },
    corsiB: { key: "corsiB", kind: "corsi", dir: "b", label: "Blocchi all'indietro (Corsi)", short: "Blocchi indietro", startLen: 2, trials: 2, pass: 1, maxLen: 9, rateMs: 1000 }
  };

  function spanSequence(def, len, rand) {
    if (def.kind === "corsi") return shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8], rand).slice(0, len);
    // cifre 1-9, niente ripetizioni vicine e niente scalette di tre (1-2-3)
    const seq = [];
    let guard = 0;
    while (seq.length < len && guard < 1000) {
      guard += 1;
      const d = 1 + Math.floor(rand() * 9);
      const n = seq.length;
      if (n && seq[n - 1] === d) continue;
      if (n >= 2 && seq[n - 1] - seq[n - 2] === d - seq[n - 1] && Math.abs(d - seq[n - 1]) === 1) continue;
      if (seq.slice(-3).includes(d) && rand() < 0.7) continue;
      seq.push(d);
    }
    return seq;
  }

  function makeSpanTest(key, seed = Date.now()) {
    const def = SPAN_TESTS[key];
    if (!def) return null;
    return { key, def, seed, len: def.startLen, trial: 0, okAtLen: 0, history: [], done: false, span: 0, current: null };
  }

  // La prossima sequenza da presentare (la ricorda in test.current).
  function spanNext(test) {
    if (test.done) return null;
    const rand = rng((test.seed + test.history.length * 7919) >>> 0);
    test.current = spanSequence(test.def, test.len, rand);
    return test.current;
  }

  // Risposta a test.current. answer: array di cifre o di indici dei blocchi.
  function spanAnswer(test, answer) {
    if (test.done || !test.current) return null;
    const target = test.def.dir === "b" ? test.current.slice().reverse() : test.current;
    const given = (answer || []).map(Number);
    const ok = given.length === target.length && target.every((v, i) => given[i] === v);
    test.history.push({ len: test.len, seq: test.current.slice(), answer: given, ok });
    test.current = null;
    if (ok) test.okAtLen += 1;
    test.trial += 1;
    const left = test.def.trials - test.trial;
    if (test.okAtLen >= test.def.pass && (left === 0 || test.okAtLen >= test.def.pass)) {
      // lunghezza superata: si sale
      test.span = test.len;
      if (test.len >= test.def.maxLen) test.done = true;
      else { test.len += 1; test.trial = 0; test.okAtLen = 0; }
    } else if (test.okAtLen + left < test.def.pass) {
      test.done = true;
    }
    return { ok, done: test.done, span: test.span };
  }

  /* ------------------------------------------------------------ lista di parole */
  const WORD_TEST = { size: 15, trials: 5, rateMs: 1000, delayMin: 20, delayMax: 45 };

  function pickWords(n, rand, avoid = []) {
    const skip = new Set(avoid.map(clean));
    const pool = DATA.words.filter((w) => !skip.has(clean(w)));
    return shuffle(pool.length >= n ? pool : DATA.words, rand).slice(0, n);
  }

  function makeWordTest(lab, seed = Date.now()) {
    const rand = rng(seed);
    const recent = (lab && lab.recentWords) || [];
    const listA = pickWords(WORD_TEST.size, rand, recent);
    const listB = pickWords(WORD_TEST.size, rand, recent.concat(listA));
    return { seed, listA, listB, stage: 0, trials: [], b: null, a6: null, done: false };
  }
  // fasi: 0-4 = prove 1-5 con la lista A; 5 = lista B (disturbo); 6 = A senza ripresentarla
  function wordStage(test) {
    if (test.stage < WORD_TEST.trials) return { kind: "learn", list: test.listA, n: test.stage + 1, show: true };
    if (test.stage === WORD_TEST.trials) return { kind: "distractor", list: test.listB, show: true };
    if (test.stage === WORD_TEST.trials + 1) return { kind: "recallA", list: test.listA, show: false };
    return null;
  }
  // Parole ricordate (l'ordine non conta), intrusioni e ripetizioni.
  function scoreFree(list, text) {
    const given = String(text || "").split(/[\n,;.]+|\s+/).map((w) => w.trim()).filter(Boolean);
    const found = [];
    const intrusions = [];
    let repeats = 0;
    given.forEach((g) => {
      const hit = list.find((w) => sameWord(g, w));
      if (!hit) { if (!intrusions.includes(g)) intrusions.push(g); return; }
      if (found.includes(hit)) { repeats += 1; return; }
      found.push(hit);
    });
    return { correct: found.length, found, missed: list.filter((w) => !found.includes(w)), intrusions, repeats };
  }
  function wordAnswer(test, text) {
    const st = wordStage(test);
    if (!st) return null;
    const r = scoreFree(st.list, text);
    if (st.kind === "learn") test.trials.push(r.correct);
    else if (st.kind === "distractor") test.b = r.correct;
    else test.a6 = r.correct;
    test.stage += 1;
    if (!wordStage(test)) test.done = true;
    return r;
  }

  /* ------------------------------------------------------------ discipline */
  const SUITS = [
    { id: "S", name: "picche", sym: "♠", red: false },
    { id: "H", name: "cuori", sym: "♥", red: true },
    { id: "D", name: "quadri", sym: "♦", red: true },
    { id: "C", name: "fiori", sym: "♣", red: false }
  ];
  const RANKS = [
    { id: "A", name: "asso" }, { id: "2", name: "2" }, { id: "3", name: "3" }, { id: "4", name: "4" }, { id: "5", name: "5" },
    { id: "6", name: "6" }, { id: "7", name: "7" }, { id: "8", name: "8" }, { id: "9", name: "9" }, { id: "10", name: "10" },
    { id: "J", name: "fante" }, { id: "Q", name: "donna" }, { id: "K", name: "re" }
  ];
  const DECK = SUITS.flatMap((s) => RANKS.map((r) => `${r.id}${s.id}`));
  function cardInfo(code) {
    const s = SUITS.find((x) => x.id === code.slice(-1));
    const r = RANKS.find((x) => x.id === code.slice(0, -1));
    return s && r ? { code, rank: r.id, suit: s.id, sym: s.sym, red: s.red, name: `${r.name} di ${s.name}`, label: `${r.id === "J" ? "J" : r.id === "Q" ? "Q" : r.id === "K" ? "K" : r.id}${s.sym}` } : null;
  }

  // Livelli: n elementi, mem = secondi per memorizzare, recall = secondi per rispondere.
  const DISCIPLINES = {
    numbers: {
      key: "numbers", label: "Numeri", unit: "cifre", rowSize: 10,
      levels: [
        { n: 10, mem: 60 }, { n: 16, mem: 60 }, { n: 20, mem: 60 }, { n: 30, mem: 60 }, { n: 40, mem: 60 },
        { n: 50, mem: 60 }, { n: 60, mem: 60 }, { n: 80, mem: 60 }, { n: 80, mem: 40 }, { n: 80, mem: 25 }
      ],
      recall: 240
    },
    words: {
      key: "words", label: "Parole", unit: "parole", rowSize: 10,
      levels: [
        { n: 8, mem: 60 }, { n: 10, mem: 60 }, { n: 15, mem: 60 }, { n: 20, mem: 60 }, { n: 25, mem: 60 },
        { n: 30, mem: 60 }, { n: 40, mem: 60 }, { n: 50, mem: 60 }, { n: 50, mem: 45 }, { n: 50, mem: 30 }
      ],
      recall: 240
    },
    cards: {
      key: "cards", label: "Carte", unit: "carte", rowSize: 13,
      levels: [
        { n: 6, mem: 60 }, { n: 10, mem: 90 }, { n: 16, mem: 120 }, { n: 20, mem: 120 }, { n: 26, mem: 150 },
        { n: 34, mem: 180 }, { n: 52, mem: 300 }, { n: 52, mem: 180 }, { n: 52, mem: 90 }, { n: 52, mem: 60 }
      ],
      recall: 300
    },
    faces: {
      key: "faces", label: "Nomi e volti", unit: "nomi", rowSize: 5,
      levels: [
        { n: 4, mem: 60 }, { n: 6, mem: 60 }, { n: 8, mem: 75 }, { n: 10, mem: 90 }, { n: 12, mem: 90 },
        { n: 15, mem: 120 }, { n: 20, mem: 150 }, { n: 25, mem: 180 }, { n: 30, mem: 180 }, { n: 30, mem: 120 }
      ],
      recall: 240
    }
  };
  const PASS_SHARE = 0.9;

  function makeRound(key, level, seed = Date.now(), lab = null) {
    const d = DISCIPLINES[key];
    if (!d) return null;
    const lv = d.levels[clamp(level, 1, d.levels.length) - 1];
    const rand = rng(seed);
    let items;
    if (key === "numbers") items = Array.from({ length: lv.n }, () => Math.floor(rand() * 10));
    else if (key === "words") items = pickWords(lv.n, rand, (lab && lab.recentWords) || []);
    else if (key === "cards") items = shuffle(DECK, rand).slice(0, lv.n);
    else {
      const males = shuffle(DATA.names.male, rand);
      const females = shuffle(DATA.names.female, rand);
      const surn = shuffle(DATA.names.surnames, rand);
      items = Array.from({ length: lv.n }, (_, i) => {
        const female = rand() < 0.5;
        return { seed: Math.floor(rand() * 1e9), female, first: (female ? females : males)[i % 40], last: surn[i % surn.length] };
      });
    }
    return { key, level: clamp(level, 1, d.levels.length), n: lv.n, mem: lv.mem, recall: d.recall, seed, items };
  }

  /*
   * Punteggio come nelle gare: a righe (numeri, parole, carte). Riga perfetta = tutti i punti,
   * un solo errore = meta', piu' errori = zero; una riga lasciata vuota in fondo non conta come errore.
   * Nomi e volti: un punto per nome giusto.
   */
  function scoreRound(round, answers) {
    const d = DISCIPLINES[round.key];
    const items = round.items;
    const given = Array.isArray(answers) ? answers : [];
    const marks = items.map((item, i) => {
      const g = given[i];
      if (g == null || String(g).trim() === "") return null; // vuoto
      if (round.key === "numbers") return String(g).trim() === String(item);
      if (round.key === "words") return sameWord(g, item);
      if (round.key === "cards") return String(g) === item;
      return sameWord(g, item.first);
    });
    const correct = marks.filter((m) => m === true).length;
    let score = correct;
    const rows = [];
    if (round.key !== "faces") {
      score = 0;
      for (let start = 0; start < items.length; start += d.rowSize) {
        const row = marks.slice(start, start + d.rowSize);
        const filled = row.filter((m) => m !== null);
        const errors = row.filter((m) => m === false).length + (filled.length && filled.length < row.length ? row.slice(0, row.lastIndexOf(true) + 1).filter((m) => m === null).length : 0);
        let pts;
        if (!filled.length) pts = 0;
        else if (errors === 0) pts = filled.length === row.length ? row.length : row.filter((m) => m === true).length;
        else if (errors === 1) pts = Math.floor(row.length / 2);
        else pts = 0;
        // riga incompleta senza errori: valgono solo le giuste (come l'ultima riga parziale in gara)
        rows.push({ start, size: row.length, errors, pts });
        score += pts;
      }
    }
    const max = items.length;
    return { marks, correct, score, max, pct: max ? Math.round((score / max) * 100) : 0, pass: score >= Math.ceil(max * PASS_SHARE), rows };
  }

  function ensureDiscipline(x, key) {
    const d = DISCIPLINES[key];
    const o = isObj(x) ? x : {};
    const history = Array.isArray(o.history) ? o.history.filter((h) => isObj(h) && num(h.t) && num(h.level) && num(h.score) && num(h.max)).slice(-200) : [];
    const best = {};
    if (isObj(o.best)) Object.keys(o.best).forEach((k) => { if (num(o.best[k])) best[k] = o.best[k]; });
    const unlocked = clamp(Number.isInteger(o.unlocked) ? o.unlocked : 1, 1, d.levels.length);
    return { level: clamp(Number.isInteger(o.level) ? o.level : 1, 1, unlocked), unlocked, history, best };
  }

  // Registra un turno. memUsed = secondi usati per memorizzare.
  function recordRound(lab, round, result, { memUsed = null, now = Date.now() } = {}) {
    const dis = lab.disciplines[round.key];
    const entry = { t: now, level: round.level, score: result.score, max: result.max, correct: result.correct, pass: result.pass };
    if (num(memUsed)) entry.mem = Math.round(memUsed);
    dis.history.push(entry);
    dis.history = dis.history.slice(-200);
    const k = String(round.level);
    const prevBest = dis.best[k];
    if (!num(prevBest) || result.score > prevBest) dis.best[k] = result.score;
    const d = DISCIPLINES[round.key];
    let unlocked = false;
    if (result.pass && round.level >= dis.unlocked && round.level < d.levels.length) {
      dis.unlocked = round.level + 1;
      unlocked = true;
    }
    if (round.key === "words") remember(lab, round.items);
    logActivity(lab, `dis:${round.key}`, now);
    return { entry, unlocked, nextLevel: unlocked ? round.level + 1 : null, record: !num(prevBest) || result.score > prevBest };
  }
  function setLevel(lab, key, level) {
    const dis = lab.disciplines[key];
    if (!dis) return;
    dis.level = clamp(level, 1, dis.unlocked);
  }

  /* ------------------------------------------------------------ palazzo della memoria */
  function cleanPalace(p) {
    if (!isObj(p) || typeof p.name !== "string") return null;
    const loci = Array.isArray(p.loci) ? p.loci.filter((l) => typeof l === "string" && l.trim()).map((l) => l.trim().slice(0, 60)).slice(0, 60) : [];
    return { id: typeof p.id === "string" ? p.id : `p${Math.random().toString(36).slice(2, 8)}`, name: p.name.trim().slice(0, 60) || "Palazzo", loci, created: num(p.created) ? p.created : Date.now(), uses: Number.isInteger(p.uses) && p.uses > 0 ? p.uses : 0, best: num(p.best) ? p.best : null };
  }
  function savePalace(lab, { id = null, name, loci, now = Date.now() }) {
    const list = Array.isArray(loci) ? loci : String(loci || "").split(/\n+/);
    const cleanLoci = list.map((l) => String(l).trim()).filter(Boolean).slice(0, 60);
    let p = id ? lab.palaces.find((x) => x.id === id) : null;
    if (p) { p.name = String(name || p.name).trim().slice(0, 60) || p.name; p.loci = cleanLoci.map((l) => l.slice(0, 60)); }
    else {
      p = cleanPalace({ id: `p${now.toString(36)}`, name: String(name || "Il mio palazzo"), loci: cleanLoci, created: now });
      lab.palaces.push(p);
    }
    return p;
  }
  function removePalace(lab, id) {
    lab.palaces = lab.palaces.filter((p) => p.id !== id);
  }
  // Parole da sistemare nei luoghi del palazzo, una per luogo.
  function makePalaceRound(lab, palaceId, n, seed = Date.now()) {
    const p = lab.palaces.find((x) => x.id === palaceId);
    if (!p || !p.loci.length) return null;
    const size = clamp(n || p.loci.length, 1, p.loci.length);
    const words = pickWords(size, rng(seed), lab.recentWords || []);
    return { key: "palace", palaceId: p.id, loci: p.loci.slice(0, size), items: words, seed };
  }
  function scorePalace(round, answers) {
    const marks = round.items.map((w, i) => sameWord((answers || [])[i], w));
    const correct = marks.filter(Boolean).length;
    return { marks, correct, max: round.items.length, pct: Math.round((correct / round.items.length) * 100) };
  }
  function recordPalace(lab, round, result, now = Date.now()) {
    const p = lab.palaces.find((x) => x.id === round.palaceId);
    if (p) {
      p.uses += 1;
      if (!num(p.best) || result.correct > p.best) p.best = result.correct;
    }
    remember(lab, round.items);
    logActivity(lab, "palace", now);
  }

  /* ------------------------------------------------------------ sistema fonetico */
  // Conversione fonetica italiana: parola -> cifre (0 s/z, 1 t/d, 2 n/gn, 3 m, 4 r, 5 l, 6 c/g dolci,
  // 7 c/g dure e q, 8 f/v, 9 p/b; vocali e h non contano, le doppie valgono una).
  function phonetic(word) {
    const w = String(word || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
    const map = { s: "0", z: "0", t: "1", d: "1", n: "2", m: "3", r: "4", l: "5", f: "8", v: "8", p: "9", b: "9", q: "7", k: "7" };
    let out = "";
    for (let i = 0; i < w.length; i += 1) {
      const c = w[i];
      if ("aeiouh".includes(c)) continue;
      let j = i;
      while (w[j + 1] === c) j += 1;
      const next = w[j + 1] || "";
      const next2 = w[j + 2] || "";
      if (c === "c") out += "ei".includes(next) ? "6" : "7";
      else if (c === "g") {
        if (next === "n") { out += "2"; j += 1; }
        else if (next === "l" && next2 === "i") { out += "5"; j += 1; }
        else out += "ei".includes(next) ? "6" : "7";
      } else if (map[c]) out += map[c];
      i = j;
    }
    return out;
  }
  const MAJOR = DATA.major.map(([code, word, hint]) => ({ code, word, hint }));
  const MAJOR_INTERVALS = [0, 1, 2, 4, 8, 16, 32]; // giorni per scatola
  const MAJOR_NEW_PER_DAY = 10;

  function majorState(lab, code) {
    return lab.major.items[code] || null;
  }
  function majorQueue(lab, now = Date.now()) {
    const due = [];
    const fresh = [];
    MAJOR.forEach((m) => {
      const st = lab.major.items[m.code];
      if (!st) fresh.push(m.code);
      else if (st.due <= now) due.push(m.code);
    });
    const introducedToday = Object.values(lab.major.items).filter((s) => s.first && dayKey(s.first) === dayKey(now)).length;
    const newToday = Math.max(0, MAJOR_NEW_PER_DAY - introducedToday);
    return { due, fresh: fresh.slice(0, newToday), freshLeft: fresh.length };
  }
  function majorAnswer(lab, code, ok, now = Date.now()) {
    const st = lab.major.items[code] || { box: 0, ok: 0, ko: 0, first: now };
    st.box = ok ? Math.min(st.box + 1, MAJOR_INTERVALS.length - 1) : 1;
    st.due = ok ? addDays(now, MAJOR_INTERVALS[st.box]) : now + 10 * 60000;
    st.last = now;
    if (ok) st.ok += 1; else st.ko += 1;
    lab.major.items[code] = st;
    logActivity(lab, "major", now);
    return st;
  }
  function majorLearned(lab) {
    return Object.values(lab.major.items).filter((s) => s.box >= 3).length;
  }
  // Domanda: numero -> parola (scelta tra 4) oppure parola -> numero (da scrivere).
  function majorQuestion(code, seed = Date.now()) {
    const rand = rng(seed);
    const m = MAJOR.find((x) => x.code === code);
    if (!m) return null;
    if (rand() < 0.5) {
      const others = shuffle(MAJOR.filter((x) => x.code !== code), rand).slice(0, 3).map((x) => x.word);
      return { code, kind: "pick", prompt: code, options: shuffle([m.word, ...others], rand), answer: m.word, hint: m.hint };
    }
    return { code, kind: "type", prompt: m.word, answer: code, hint: m.hint };
  }
  // Numero lungo -> immagini a coppie (per gli esercizi con il sistema).
  function majorStory(digits) {
    const s = String(digits).replace(/\D/g, "");
    const out = [];
    for (let i = 0; i < s.length; i += 2) {
      const pair = s.slice(i, i + 2);
      const m = pair.length === 2 ? MAJOR.find((x) => x.code === pair) : null;
      out.push(m ? { code: pair, word: m.word } : { code: pair, word: null });
    }
    return out;
  }

  /* ------------------------------------------------------------ registro, programma, profilo */
  function remember(lab, words) {
    lab.recentWords = words.concat(lab.recentWords || []).filter((w, i, a) => a.indexOf(w) === i).slice(0, 120);
  }
  function logActivity(lab, kind, now = Date.now()) {
    const key = dayKey(now);
    if (!lab.days.includes(key)) lab.days.push(key);
    lab.days = lab.days.slice(-400);
    lab.log.push({ t: now, kind });
    lab.log = lab.log.slice(-500);
  }
  function doneToday(lab, kindPrefix, now = Date.now()) {
    const key = dayKey(now);
    return lab.log.some((e) => dayKey(e.t) === key && e.kind.startsWith(kindPrefix));
  }
  function streak(lab, now = Date.now()) {
    const set = new Set(lab.days);
    let n = 0;
    let t = startOfDay(now);
    if (!set.has(dayKey(t))) t = addDays(t, -1); // oggi non ancora fatto: conta da ieri
    while (set.has(dayKey(t))) { n += 1; t = addDays(t, -1); }
    return n;
  }

  // Disciplina del giorno: lun numeri, mar parole, mer carte, gio nomi e volti, ven numeri,
  // sab parole, dom carte.
  const ROTATION = ["cards", "numbers", "words", "cards", "faces", "numbers", "words"];
  function lastTest(lab, key) {
    const list = lab.tests[key] || [];
    return list.length ? list[list.length - 1] : null;
  }
  function plan(lab, now = Date.now()) {
    const steps = [];
    const tested = ["digitF", "digitB", "corsiF", "corsiB"].filter((k) => lastTest(lab, k));
    if (tested.length < 4) {
      steps.push({ id: "baseline", title: "Misura la tua memoria", detail: "Quattro prove di span (cifre e blocchi, avanti e indietro): circa 10 minuti. Servono come punto di partenza.", minutes: 10, done: tested.length === 4, go: { tab: "measure" } });
    }
    const q = majorQueue(lab, now);
    const learned = majorLearned(lab);
    steps.push({
      id: "major",
      title: learned < 100 ? "Sistema fonetico" : "Sistema fonetico: ripasso",
      detail: learned < 100 ? `${q.due.length} da ripassare e ${q.fresh.length} immagini nuove (${learned}/100 imparate).` : `${q.due.length} da ripassare: tutte le 100 immagini sono imparate.`,
      minutes: 4,
      done: q.due.length === 0 && q.fresh.length === 0,
      go: { tab: "techniques", technique: "major", drill: true }
    });
    const dis = ROTATION[new Date(now).getDay()];
    const d = DISCIPLINES[dis];
    const dl = lab.disciplines[dis];
    steps.push({ id: "discipline", title: `Disciplina del giorno: ${d.label.toLowerCase()}`, detail: `Livello ${dl.level}: ${d.levels[dl.level - 1].n} ${d.unit} in ${d.levels[dl.level - 1].mem} secondi. Due turni.`, minutes: 6, done: lab.log.filter((e) => dayKey(e.t) === dayKey(now) && e.kind === `dis:${dis}`).length >= 2, go: { tab: "disciplines", discipline: dis } });
    const palace = lab.palaces.find((p) => p.loci.length >= 5);
    steps.push(palace
      ? { id: "palace", title: `Palazzo: ${palace.name}`, detail: `Sistema ${Math.min(palace.loci.length, 20)} parole nei tuoi luoghi e ripercorrili.`, minutes: 4, done: doneToday(lab, "palace", now), go: { tab: "techniques", technique: "loci", palaceId: palace.id } }
      : { id: "palace", title: "Costruisci il tuo palazzo della memoria", detail: "Scegli un percorso che conosci bene e scrivi almeno 10 luoghi in ordine.", minutes: 5, done: false, go: { tab: "techniques", technique: "loci" } });
    const last = ["digitF", "digitB", "corsiF", "corsiB", "words"].map((k) => lastTest(lab, k)).filter(Boolean).map((x) => x.t);
    if (tested.length === 4 && last.length && now - Math.max(...last) > 28 * DAY) {
      steps.push({ id: "retest", title: "Nuova misura", detail: "È passato un mese dall'ultima: rifai i test per vedere i progressi.", minutes: 12, done: false, go: { tab: "measure" } });
    }
    return steps;
  }

  // Profilo a 6 categorie (0-100) per il quadro generale.
  function pctOf(lab, key) {
    const t = lastTest(lab, key);
    if (!t) return null;
    const c = compare(key, t.value, lab.profile);
    return c ? c.pct : null;
  }
  function avg(list, fallback) {
    const v = list.filter(num);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : fallback;
  }
  function disciplineProgress(lab, key) {
    const d = DISCIPLINES[key];
    const dis = lab.disciplines[key];
    const passed = dis.history.filter((h) => h.pass).map((h) => h.level);
    const top = passed.length ? Math.max(...passed) : 0;
    return Math.round((top / d.levels.length) * 100);
  }
  function profile(lab, now = Date.now()) {
    const words = lastTest(lab, "words");
    const wordsPct = words ? avg([compare("wordsTotal", words.value, lab.profile), compare("wordsDelayed", words.delayed, lab.profile)].filter(Boolean).map((c) => c.pct), null) : null;
    const days14 = lab.days.filter((d) => d >= dayKey(addDays(now, -13))).length;
    const learned = majorLearned(lab);
    const palaceUse = lab.palaces.reduce((s, p) => s + p.uses, 0);
    return [
      { key: "working", label: "Memoria di lavoro", value: Math.round(avg([pctOf(lab, "digitF"), pctOf(lab, "digitB")], 35)) },
      { key: "spatial", label: "Memoria visiva", value: Math.round(avg([pctOf(lab, "corsiF"), pctOf(lab, "corsiB")], 35)) },
      { key: "verbal", label: "Richiamo verbale", value: Math.round(wordsPct == null ? 35 : wordsPct) },
      { key: "technique", label: "Tecnica", value: Math.round(clamp(35 + learned * 0.4 + Math.min(palaceUse, 25), 0, 100)) },
      { key: "speed", label: "Discipline", value: Math.round(clamp(35 + (Object.keys(DISCIPLINES).reduce((s, k) => s + disciplineProgress(lab, k), 0) / 4) * 0.65, 0, 100)) },
      { key: "consistency", label: "Costanza", value: Math.round(clamp((days14 / 14) * 100, 0, 100)) }
    ];
  }
  function trend(lab, now = Date.now()) {
    const tested = ["digitF", "digitB", "corsiF", "corsiB"].map((k) => lastTest(lab, k)).filter(Boolean);
    const s = streak(lab, now);
    if (!tested.length && !lab.log.length) return "Base iniziale · fai la prima misura";
    const f = lastTest(lab, "digitF");
    return `${f ? `Span cifre ${f.value}` : "Span da misurare"} · ${majorLearned(lab)}/100 immagini · ${s ? `${s} ${s === 1 ? "giorno" : "giorni"} di fila` : "riprendi oggi"}`;
  }

  // Salva il risultato di un test di span o di parole.
  function recordTest(lab, key, value, extra = {}, now = Date.now()) {
    if (!lab.tests[key]) lab.tests[key] = [];
    const entry = { t: now, value, ...extra };
    lab.tests[key].push(entry);
    lab.tests[key] = lab.tests[key].slice(-60);
    logActivity(lab, `test:${key}`, now);
    return { entry, compare: compare(key === "words" ? "wordsTotal" : key, value, lab.profile) };
  }
  // Lista di parole: il richiamo differito si fa tra delayMin e delayMax minuti dopo la prova 6.
  function startDelayed(lab, test, now = Date.now()) {
    lab.pending.words = { at: now, listA: test.listA.slice(), trials: test.trials.slice(), b: test.b, a6: test.a6 };
    remember(lab, test.listA.concat(test.listB));
  }
  function delayedStatus(lab, now = Date.now()) {
    const p = lab.pending.words;
    if (!p) return null;
    const min = (now - p.at) / 60000;
    return { minutes: Math.floor(min), ready: min >= WORD_TEST.delayMin, late: min > WORD_TEST.delayMax, readyAt: p.at + WORD_TEST.delayMin * 60000 };
  }
  function finishDelayed(lab, text, now = Date.now()) {
    const p = lab.pending.words;
    if (!p) return null;
    const status = delayedStatus(lab, now);
    const r = scoreFree(p.listA, text);
    const total = p.trials.reduce((a, b) => a + b, 0);
    const res = recordTest(lab, "words", total, { trials: p.trials, b: p.b, a6: p.a6, delayed: r.correct, delayMin: status.minutes, late: status.late }, now);
    lab.pending.words = null;
    return { ...r, total, compareTotal: compare("wordsTotal", total, lab.profile), compareDelayed: status.late ? null : compare("wordsDelayed", r.correct, lab.profile), late: status.late, minutes: status.minutes, entry: res.entry };
  }
  // Senza richiamo differito (se non si torna in tempo): salva solo le 5 prove.
  function skipDelayed(lab, now = Date.now()) {
    const p = lab.pending.words;
    if (!p) return null;
    const total = p.trials.reduce((a, b) => a + b, 0);
    lab.pending.words = null;
    return recordTest(lab, "words", total, { trials: p.trials, b: p.b, a6: p.a6, delayed: null }, now);
  }

  /* ------------------------------------------------------------ stato */
  function ensure(x) {
    const o = isObj(x) && x.version === VERSION ? x : {};
    const lab = {
      version: VERSION,
      profile: { age: isObj(o.profile) && num(o.profile.age) ? clamp(Math.round(o.profile.age), 16, 99) : null },
      tests: {},
      pending: { words: isObj(o.pending) && isObj(o.pending.words) && num(o.pending.words.at) && Array.isArray(o.pending.words.listA) ? o.pending.words : null },
      disciplines: {},
      palaces: Array.isArray(o.palaces) ? o.palaces.map(cleanPalace).filter(Boolean).slice(0, 12) : [],
      major: { items: {} },
      recentWords: Array.isArray(o.recentWords) ? o.recentWords.filter((w) => typeof w === "string").slice(0, 120) : [],
      days: Array.isArray(o.days) ? o.days.filter((d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-400) : [],
      log: Array.isArray(o.log) ? o.log.filter((e) => isObj(e) && num(e.t) && typeof e.kind === "string").slice(-500) : []
    };
    ["digitF", "digitB", "corsiF", "corsiB", "words"].forEach((k) => {
      const list = isObj(o.tests) && Array.isArray(o.tests[k]) ? o.tests[k] : [];
      lab.tests[k] = list.filter((e) => isObj(e) && num(e.t) && num(e.value)).slice(-60);
    });
    Object.keys(DISCIPLINES).forEach((k) => { lab.disciplines[k] = ensureDiscipline(isObj(o.disciplines) ? o.disciplines[k] : null, k); });
    if (isObj(o.major) && isObj(o.major.items)) {
      Object.keys(o.major.items).forEach((code) => {
        const s = o.major.items[code];
        if (/^\d\d$/.test(code) && isObj(s) && Number.isInteger(s.box) && num(s.due)) {
          lab.major.items[code] = { box: clamp(s.box, 0, MAJOR_INTERVALS.length - 1), due: s.due, last: num(s.last) ? s.last : null, first: num(s.first) ? s.first : null, ok: Number.isInteger(s.ok) ? s.ok : 0, ko: Number.isInteger(s.ko) ? s.ko : 0 };
        }
      });
    }
    return lab;
  }

  function setCorsi(layout) {
    if (Array.isArray(layout) && layout.length === 9) CORSI = layout;
  }

  return {
    VERSION, DAY, NORMS, SPAN_TESTS, WORD_TEST, DISCIPLINES, PASS_SHARE, DECK, SUITS, RANKS, MAJOR, MAJOR_INTERVALS, MAJOR_NEW_PER_DAY, ROTATION,
    get CORSI() { return CORSI; }, setCorsi,
    rng, shuffle, clean, sameWord, normCdf, dayKey, addDays, startOfDay,
    compare, zLabel,
    makeSpanTest, spanNext, spanAnswer, spanSequence,
    makeWordTest, wordStage, wordAnswer, scoreFree, startDelayed, delayedStatus, finishDelayed, skipDelayed,
    cardInfo, makeRound, scoreRound, recordRound, setLevel,
    savePalace, removePalace, makePalaceRound, scorePalace, recordPalace,
    phonetic, majorState, majorQueue, majorAnswer, majorLearned, majorQuestion, majorStory,
    logActivity, doneToday, streak, plan, profile, trend, recordTest, lastTest,
    ensure
  };
});
