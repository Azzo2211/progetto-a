/*
 * Progetto A - Memoria: motore (senza DOM).
 *
 *  - Misura: span di cifre e di blocchi (Corsi) in avanti e all'indietro, lista di 15 parole con
 *    5 prove, lista di disturbo e richiamo differito. Il risultato e' confrontato con valori di
 *    riferimento pubblicati per adulti (NORMS), con la fonte.
 *  - Discipline come nelle gare di memoria: numeri, parole, carte, nomi e volti, a livelli.
 *  - Tecniche: palazzo della memoria (i tuoi luoghi), sistema fonetico 00-99 con ripasso distanziato.
 *  - Discipline nuove: immagini astratte (Memory League) e date (gare IAM).
 *  - Sistemi: carte (52 carte = 52 immagini del fonetico), persona-azione-oggetto (sistema Dominic).
 *  - Mazzi tuoi con ripasso FSRS (memory/srs.js): domande, vocaboli, persone, brani; testi a memoria.
 *  - Esercizi di memoria per gli scacchi; vita quotidiana (telefono, spesa).
 *  - Percorso guidato di 42 giorni (memory/course.js), programma del giorno, profilo, storico.
 * Stato: state.memoryLab. Dati: window.MemoryData (memory/data.js), MemoryContent (memory/content.js).
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MemoryEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const DATA = root.MemoryData || (typeof require === "function" ? require("./data.js") : { words: [], major: [], names: { male: [], female: [], surnames: [] } });
  const SRS = root.MemorySRS || (typeof require === "function" ? require("./srs.js") : null);
  const CONTENT = root.MemoryContent || (typeof require === "function" ? require("./content.js") : { LESSONS: [], TEXTS: [], EVENT_SUBJECTS: [], EVENT_PREDICATES: [], GROCERIES: [], OPENINGS: [], DOMINIC: {} });
  const COURSE = root.MemoryCourse || (typeof require === "function" ? require("./course.js") : { WEEKS: [], DAYS: [], LENGTH: 0, FOLLOW_UP_DAYS: 120 });
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
  // mean/sd di adulti sani dagli studi citati; by = fasce d'eta' (anni da-a) se lo studio le da'.
  const NORMS = {
    digitF: {
      mean: 5.3, sd: 1.16,
      source: "Span di cifre in avanti: norme italiane su 225 adulti sani di 20-92 anni, 2 sequenze per lunghezza, span = la lunghezza più lunga con almeno una sequenza giusta («Digit span and Bisyllabic non-word span: Italian norms», 2025).",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12424102",
      note: "Nello studio le cifre sono dette a voce; qui le vedi sullo schermo. L'età media del campione è 52 anni e lo span cala con l'età: per un adulto giovane il confronto è un po' generoso."
    },
    digitB: {
      mean: 4.54, sd: 1.23,
      source: "Span di cifre all'indietro: stesso studio italiano (225 adulti di 20-92 anni).",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12424102",
      note: "Stesse avvertenze: cifre dette a voce nello studio, età media 52 anni."
    },
    corsiF: {
      mean: 6.11, sd: 0.8,
      by: [{ from: 16, to: 54, mean: 6.11, sd: 0.8 }, { from: 55, to: 99, mean: 4.76, sd: 1.19 }],
      source: "Blocchi di Corsi in avanti su tablet: 73 adulti giovani 6,11 ± 0,80; 34 adulti anziani 4,76 ± 1,19 (Brunetti, Del Gatto e Delogu, «eCorsi», Frontiers in Psychology, 2014).",
      url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00939/full",
      note: "È la stessa procedura di questa versione: un blocco al secondo acceso per mezzo secondo, si parte da 2. La disposizione dei blocchi riproduce in modo approssimato la tavola originale."
    },
    corsiB: {
      mean: 5.29, sd: 1.2,
      by: [{ from: 16, to: 54, mean: 5.29, sd: 1.2 }, { from: 55, to: 99, mean: 4.35, sd: 1.3 }],
      source: "Blocchi di Corsi all'indietro: stesso studio (adulti giovani 5,29 ± 1,20; anziani 4,35 ± 1,30).",
      url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00939/full"
    },
    wordsTotal: {
      mean: 53.9, sd: 8.7,
      by: [{ from: 16, to: 34, mean: 53.9, sd: 8.7 }, { from: 35, to: 49, mean: 51.7, sd: 9.1 }, { from: 50, to: 65, mean: 52.1, sd: 8.2 }],
      source: "Lista di 15 parole di Rey, somma delle 5 prove: 17-34 anni 53,9 ± 8,7 e 35-49 anni 51,7 ± 9,1 (Magalhães e Hamdan, Psychology & Neuroscience, 2010); 41-65 anni 52,1 ± 8,2 (Alviarez-Schulze e colleghi, Frontiers in Aging Neuroscience, 2022).",
      url: "https://www.redalyc.org/pdf/2070/207014856011.pdf",
      note: "Nella prova originale le parole sono lette a voce, una al secondo, e la lista è fissa; qui le leggi sullo schermo e la lista cambia ogni volta. Il confronto è indicativo."
    },
    wordsDelayed: {
      mean: 11.6, sd: 2.7,
      by: [{ from: 16, to: 34, mean: 11.6, sd: 2.7 }, { from: 35, to: 49, mean: 10.8, sd: 2.6 }, { from: 50, to: 65, mean: 11.4, sd: 2.6 }],
      source: "Lista di Rey, richiamo dopo 20 minuti: 17-34 anni 11,6 ± 2,7; 35-49 anni 10,8 ± 2,6 (stessi studi; 41-65 anni 11,4 ± 2,6).",
      url: "https://www.frontiersin.org/journals/aging-neuroscience/articles/10.3389/fnagi.2022.809019/full"
    }
  };
  // valori di riferimento per una persona (fascia d'eta' se nota)
  function normRef(key, profile = {}) {
    const n = NORMS[key];
    if (!n) return null;
    if (Array.isArray(n.by) && num(profile && profile.age)) {
      const band = n.by.find((b) => profile.age >= b.from && profile.age <= b.to);
      if (band) return { ...n, mean: band.mean, sd: band.sd, band };
    }
    return n;
  }

  function zLabel(z) {
    if (z < -2) return "molto sotto la media";
    if (z < -1) return "sotto la media";
    if (z <= 1) return "nella media";
    if (z <= 2) return "sopra la media";
    return "molto sopra la media";
  }
  // Confronto con i valori di riferimento. profile: { age } (facoltativo).
  function compare(key, value, profile = {}) {
    const ref = normRef(key, profile);
    if (!ref || !num(value)) return null;
    const z = (value - ref.mean) / ref.sd;
    return { z: Math.round(z * 100) / 100, pct: clamp(Math.round(normCdf(z) * 100), 1, 99), label: zLabel(z), mean: ref.mean, sd: ref.sd, source: ref.source, note: ref.note || "", url: ref.url || "", band: ref.band || null };
  }

  /* ------------------------------------------------------------ test di span */
  // Blocchi del Corsi: 9 posizioni (x, y in percentuale della tavola). Approssimano la tavola
  // originale; sono le stesse del plugin corsi-blocks di jsPsych.
  let CORSI = [
    [45, 80], [80, 94], [20, 70], [70, 60], [35, 50], [6, 40], [94, 45], [60, 25], [47, 6]
  ];
  // Regole (procedura standard degli span): si parte da startLen, trials sequenze per lunghezza;
  // la lunghezza e' superata con almeno pass risposte giuste; ci si ferma quando non si puo' piu'.
  const SPAN_TESTS = {
    // cifre: come le norme italiane (da 2 cifre, 2 sequenze per lunghezza, basta una giusta);
    // oltre 9 si continua per chi usa le tecniche
    digitF: { key: "digitF", kind: "digit", dir: "f", label: "Cifre in avanti", short: "Cifre avanti", startLen: 2, trials: 2, pass: 1, maxLen: 14, rateMs: 1000, onMs: 750 },
    digitB: { key: "digitB", kind: "digit", dir: "b", label: "Cifre all'indietro", short: "Cifre indietro", startLen: 2, trials: 2, pass: 1, maxLen: 12, rateMs: 1000, onMs: 750 },
    // Corsi: come eCorsi (un blocco al secondo, acceso 500 ms, da 2 blocchi)
    corsiF: { key: "corsiF", kind: "corsi", dir: "f", label: "Blocchi in avanti (Corsi)", short: "Blocchi avanti", startLen: 2, trials: 2, pass: 1, maxLen: 9, rateMs: 1000, onMs: 500 },
    corsiB: { key: "corsiB", kind: "corsi", dir: "b", label: "Blocchi all'indietro (Corsi)", short: "Blocchi indietro", startLen: 2, trials: 2, pass: 1, maxLen: 9, rateMs: 1000, onMs: 500 }
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
  // L'ultimo livello di ogni disciplina e' il formato di Memory League: 1 minuto per memorizzare.
  const DISCIPLINES = {
    numbers: {
      key: "numbers", label: "Numeri", unit: "cifre", rowSize: 10,
      levels: [
        { n: 10, mem: 60 }, { n: 16, mem: 60 }, { n: 20, mem: 60 }, { n: 30, mem: 60 }, { n: 40, mem: 60 },
        { n: 50, mem: 60 }, { n: 60, mem: 60 }, { n: 70, mem: 60 }, { n: 76, mem: 60 }, { n: 80, mem: 60 }
      ],
      recall: 240
    },
    words: {
      key: "words", label: "Parole", unit: "parole", rowSize: 10,
      levels: [
        { n: 8, mem: 60 }, { n: 10, mem: 60 }, { n: 12, mem: 60 }, { n: 15, mem: 60 }, { n: 20, mem: 60 },
        { n: 25, mem: 60 }, { n: 30, mem: 60 }, { n: 35, mem: 60 }, { n: 40, mem: 60 }, { n: 50, mem: 60 }
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
        { n: 15, mem: 120 }, { n: 20, mem: 150 }, { n: 25, mem: 150 }, { n: 30, mem: 120 }, { n: 30, mem: 60 }
      ],
      recall: 240
    },
    // Memory League: l'ordine di 30 immagini in 1 minuto, un punto per immagine al posto giusto
    images: {
      key: "images", label: "Immagini", unit: "immagini", rowSize: 5,
      levels: [
        { n: 5, mem: 60 }, { n: 10, mem: 90 }, { n: 10, mem: 60 }, { n: 15, mem: 90 }, { n: 15, mem: 60 },
        { n: 20, mem: 90 }, { n: 20, mem: 60 }, { n: 25, mem: 60 }, { n: 30, mem: 90 }, { n: 30, mem: 60 }
      ],
      recall: 240
    },
    // gare IAM: anni (1000-2099) di eventi inventati, poi gli eventi mescolati e si scrive l'anno
    dates: {
      key: "dates", label: "Date", unit: "date", rowSize: 5,
      levels: [
        { n: 5, mem: 60 }, { n: 8, mem: 90 }, { n: 10, mem: 120 }, { n: 12, mem: 120 }, { n: 15, mem: 150 },
        { n: 20, mem: 180 }, { n: 25, mem: 240 }, { n: 30, mem: 300 }, { n: 40, mem: 300 }, { n: 50, mem: 300 }
      ],
      recall: 300
    }
  };
  const PASS_SHARE = 0.9;

  // eventi inventati (soggetto + azione), tutti diversi
  function pickEvents(n, rand) {
    const subj = shuffle(CONTENT.EVENT_SUBJECTS, rand);
    const pred = shuffle(CONTENT.EVENT_PREDICATES, rand);
    const out = [];
    for (let i = 0; out.length < n && i < subj.length * pred.length; i += 1) {
      const e = `${subj[i % subj.length]} ${pred[(i * 7 + Math.floor(i / subj.length)) % pred.length]}`;
      if (!out.includes(e)) out.push(e);
    }
    return out;
  }
  /*
   * Un turno. custom = { n, mem, recall?, list?, life? } per i compiti del percorso e della vita
   * quotidiana (niente livelli: non sbloccano e non fanno record di livello).
   */
  function makeRound(key, level, seed = Date.now(), lab = null, custom = null) {
    const d = DISCIPLINES[key];
    if (!d) return null;
    const isCustom = Boolean(custom && num(custom.n));
    const lv = isCustom ? { n: clamp(Math.round(custom.n), 1, key === "cards" ? 52 : 120), mem: clamp(Math.round(custom.mem || 60), 10, 900) } : d.levels[clamp(level, 1, d.levels.length) - 1];
    const rand = rng(seed);
    let items;
    if (key === "numbers") items = Array.from({ length: lv.n }, () => Math.floor(rand() * 10));
    else if (key === "words") items = isCustom && custom.list === "groceries" ? shuffle(CONTENT.GROCERIES, rand).slice(0, lv.n) : pickWords(lv.n, rand, (lab && lab.recentWords) || []);
    else if (key === "cards") items = shuffle(DECK, rand).slice(0, lv.n);
    else if (key === "images") {
      const seen = new Set();
      items = [];
      while (items.length < lv.n) { const sd = 1 + Math.floor(rand() * 2147483000); if (!seen.has(sd)) { seen.add(sd); items.push(sd); } }
    } else if (key === "dates") {
      const years = new Set();
      const events = pickEvents(lv.n, rand);
      items = events.map((event) => {
        let y;
        do { y = 1000 + Math.floor(rand() * 1100); } while (years.has(y));
        years.add(y);
        return { event, year: y };
      });
    } else {
      const males = shuffle(DATA.names.male, rand);
      const females = shuffle(DATA.names.female, rand);
      const surn = shuffle(DATA.names.surnames, rand);
      items = Array.from({ length: lv.n }, (_, i) => {
        const female = rand() < 0.5;
        return { seed: Math.floor(rand() * 1e9), female, first: (female ? females : males)[i % 40], last: surn[i % surn.length] };
      });
    }
    const recall = isCustom && num(custom.recall) ? custom.recall : d.recall;
    return { key, level: isCustom ? 0 : clamp(level, 1, d.levels.length), custom: isCustom, life: isCustom && custom.life ? String(custom.life) : null, n: lv.n, mem: lv.mem, recall, seed, items };
  }

  /*
   * Punteggio.
   * Numeri e parole: la regola delle gare IAM (righe da 40 cifre, colonne da 20 parole) applicata
   * a righe da 10. Riga perfetta = tutti i punti; un errore = meta' (arrotondata per eccesso); due o
   * piu' = zero. In una riga completa i buchi contano come errori; l'ultima riga scritta, se lasciata
   * a meta', vale fino all'ultima risposta.
   * Carte, nomi, immagini e date: un punto per ogni risposta giusta (come in Memory League).
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
      if (round.key === "images") return Number(g) === item;
      if (round.key === "dates") return String(g).trim() === String(item.year);
      return sameWord(g, item.first);
    });
    const correct = marks.filter((m) => m === true).length;
    let score = correct;
    const rows = [];
    if (round.key === "numbers" || round.key === "words") {
      score = 0;
      let last = -1;
      marks.forEach((m, i) => { if (m !== null) last = i; });
      for (let start = 0; start < items.length; start += d.rowSize) {
        const row = marks.slice(start, start + d.rowSize);
        const end = start + row.length - 1;
        const attempted = last < start ? 0 : last >= end ? row.length : last - start + 1;
        const errors = row.slice(0, attempted).filter((m) => m !== true).length;
        const pts = attempted === 0 ? 0 : errors === 0 ? attempted : errors === 1 ? Math.ceil(attempted / 2) : 0;
        rows.push({ start, size: row.length, attempted, errors, pts });
        score += pts;
      }
    }
    const max = items.length;
    return { marks, correct, score, max, pct: max ? Math.round((score / max) * 100) : 0, pass: score >= Math.ceil(max * PASS_SHARE), rows };
  }

  // Per confronto: record in gara (fonte: statistiche IAM, iam-stats.org).
  const BENCH = {
    numbers: "Per farti un'idea: in Memory League (80 cifre, 1 minuto per memorizzare) il record in una gara dal vivo è 80 cifre in 16,85 secondi (Simon Reinhard, 2018); il record mondiale IAM dei numeri in 5 minuti è 630 cifre (Andrea Muzii, 2021).",
    words: "Per farti un'idea: in Memory League il record in una gara dal vivo è 50 parole in 51,31 secondi (Katie Kermode, 2016); il record mondiale IAM delle parole in 15 minuti è 318.",
    cards: "Per farti un'idea: in Memory League il record in una gara dal vivo è un mazzo da 52 in 16,86 secondi (Alex Mullen, 2016); il record mondiale IAM di carte veloci è 12,74 secondi (Shijir-Erdene Bat-Enkh, 2018).",
    faces: "Per farti un'idea: in Memory League il record in una gara dal vivo è 30 nomi in 45,09 secondi (Jan-Hendrik Büscher, 2018); il record mondiale IAM dei nomi in 15 minuti è 224 (Katie Kermode, 2018).",
    images: "Per farti un'idea: il record online di Memory League è di 30 immagini in 7,58 secondi (Enrico Marraffa, 2026).",
    dates: "Per farti un'idea: il record mondiale delle date storiche in 5 minuti è di 148 date (Prateek Yadav)."
  };
  const BENCH_URL = "https://iam-stats.org/records_ml.php";
  // le date non sono in Memory League: storia del record delle date in 5 minuti (IAM)
  const BENCH_URLS = { dates: "https://iam-stats.org/discipline-record-history.php?id=DATES5" };

  function ensureDiscipline(x, key) {
    const d = DISCIPLINES[key];
    const o = isObj(x) ? x : {};
    const history = Array.isArray(o.history) ? o.history.filter((h) => isObj(h) && num(h.t) && num(h.level) && num(h.score) && num(h.max)).map((h) => ({ t: h.t, level: h.level, score: h.score, max: h.max, correct: num(h.correct) ? h.correct : h.score, pass: Boolean(h.pass), ...(num(h.mem) ? { mem: h.mem } : {}), ...(h.custom ? { custom: true, n: num(h.n) ? h.n : h.max, memMax: num(h.memMax) ? h.memMax : null } : {}) })).slice(-200) : [];
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
    const meta = { n: round.n, mem: round.mem, score: result.score, max: result.max };
    // sfida della Torre: il piano e il punteggio che serve
    if (isObj(round.challenge) && num(round.challenge.day) && num(round.challenge.target)) { meta.ch = round.challenge.day; meta.tg = round.challenge.target; }
    if (round.custom) {
      entry.custom = true;
      entry.n = round.n;
      entry.memMax = round.mem;
      dis.history.push(entry);
      dis.history = dis.history.slice(-200);
      if (round.key === "words") remember(lab, round.items);
      if (round.life) logActivity(lab, `life:${round.life}`, now, meta);
      logActivity(lab, `dis:${round.key}`, now, { ...meta, custom: 1 });
      return { entry, unlocked: false, nextLevel: null, record: false };
    }
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
    const record = !num(prevBest) || result.score > prevBest;
    logActivity(lab, `dis:${round.key}`, now, record && result.score > 0 ? { ...meta, rec: 1 } : meta);
    return { entry, unlocked, nextLevel: unlocked ? round.level + 1 : null, record };
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
  // per = parole per luogo (1 o 2): con 2, 30 parole stanno in 15 luoghi
  function makePalaceRound(lab, palaceId, n, seed = Date.now(), per = 1) {
    const p = lab.palaces.find((x) => x.id === palaceId);
    if (!p || !p.loci.length) return null;
    const k = per === 2 ? 2 : 1;
    const size = clamp(n || p.loci.length * k, 1, p.loci.length * k);
    const words = pickWords(size, rng(seed), lab.recentWords || []);
    return { key: "palace", palaceId: p.id, per: k, loci: p.loci.slice(0, Math.ceil(size / k)), items: words, seed };
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
    const meta = { n: round.items.length, per: round.per || 1, score: result.correct, max: result.max };
    if (isObj(round.challenge) && num(round.challenge.day) && num(round.challenge.target)) { meta.ch = round.challenge.day; meta.tg = round.challenge.target; }
    logActivity(lab, "palace", now, meta);
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
      if (c === "s" && next === "c" && "ei".includes(next2)) { out += "0"; j += 1; } // «scia»: un suono solo
      else if (c === "c") out += "ei".includes(next) ? "6" : "7";
      else if (c === "g") {
        if (next === "n") { out += "2"; j += 1; }
        else if (next === "l" && next2 === "i") { out += "5"; j += 1; }
        else out += "ei".includes(next) ? "6" : "7";
      } else if (c === "j") out += "6";
      else if (map[c]) out += map[c];
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
    logActivity(lab, "major", now, { ok: ok ? 1 : 0 });
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

  /* ------------------------------------------------------------ sistema delle carte */
  // Seme = prima cifra con i suoni del fonetico (Picche 9 P, Fiori 8 F, Cuori 7 C dura, Quadri 1 D di
  // Denari); valore = seconda (asso 1, 10 = 0). Figure: Re 4 (R), Donna 2 (N di doNNa), Fante 6 (G
  // dolce di giovane), seguite dal seme. 52 carte = 52 codici diversi del sistema fonetico.
  const CARD_SUIT_DIGIT = { S: "9", C: "8", H: "7", D: "1" };
  const CARD_FACE_DIGIT = { K: "4", Q: "2", J: "6" };
  function cardCode(card) {
    const c = String(card || "");
    const r = c.slice(0, -1);
    const s = c.slice(-1);
    if (!CARD_SUIT_DIGIT[s]) return null;
    if (CARD_FACE_DIGIT[r]) return CARD_FACE_DIGIT[r] + CARD_SUIT_DIGIT[s];
    const v = r === "A" ? "1" : r === "10" ? "0" : r;
    return /^[1-9]$|^0$/.test(v) ? CARD_SUIT_DIGIT[s] + v : null;
  }
  function cardImage(card) {
    const code = cardCode(card);
    const m = code ? MAJOR.find((x) => x.code === code) : null;
    return m ? { code, word: m.word, hint: m.hint } : null;
  }
  const CARDS_NEW_PER_DAY = 13;
  function retentionOf(lab, deck = null) {
    const r = deck && num(deck.retention) ? deck.retention : lab.prefs.retention;
    return clamp(num(r) ? r : 0.9, 0.85, 0.97);
  }
  function newToday(states, now) {
    const k = dayKey(now);
    return Object.values(states).filter((st) => st && num(st.first) && dayKey(st.first) === k).length;
  }
  function cardsQueue(lab, now = Date.now()) {
    const st = lab.systems.cards;
    const due = DECK.filter((c) => st[c] && st[c].due <= now).sort((a, b) => st[a].due - st[b].due);
    const fresh = DECK.filter((c) => !st[c]);
    const room = Math.max(0, CARDS_NEW_PER_DAY - newToday(st, now));
    return { due, fresh: fresh.slice(0, room), freshLeft: fresh.length };
  }
  // domanda: carta -> immagine (scelta tra 4) oppure carta -> numero (da scrivere)
  function cardQuestion(card, seed = Date.now()) {
    const rand = rng(seed);
    const img = cardImage(card);
    if (!img) return null;
    if (rand() < 0.5) {
      const others = shuffle(MAJOR.filter((m) => m.code !== img.code), rand).slice(0, 3).map((m) => m.word);
      return { card, kind: "pick", options: shuffle([img.word, ...others], rand), answer: img.word, code: img.code };
    }
    return { card, kind: "type", answer: img.code, code: img.code };
  }
  function cardAnswer(lab, card, ok, now = Date.now()) {
    const res = SRS.review(lab.systems.cards[card] || null, ok ? 3 : 1, now, retentionOf(lab));
    lab.systems.cards[card] = res.state;
    logReview(lab, res, ok ? 3 : 1, now, "cards");
    return res.state;
  }
  function cardsSure(lab) {
    return DECK.filter((c) => lab.systems.cards[c] && lab.systems.cards[c].s >= 7).length;
  }

  /* ------------------------------------------------------------ persona-azione-oggetto */
  function dominic(code) {
    return String(code).split("").map((d) => CONTENT.DOMINIC[d] || "?").join("");
  }
  function paoSet(lab, code, person, action) {
    if (!/^\d\d$/.test(code)) return null;
    const p = String(person || "").trim().slice(0, 60);
    const a = String(action || "").trim().slice(0, 60);
    const prev = lab.systems.pao[code];
    if (!p && !a) { delete lab.systems.pao[code]; return null; }
    lab.systems.pao[code] = { p, a, st: prev ? prev.st : null };
    return lab.systems.pao[code];
  }
  function paoFilled(lab) {
    return Object.values(lab.systems.pao).filter((x) => x.p && x.a).length;
  }
  function paoQueue(lab, now = Date.now()) {
    const items = Object.entries(lab.systems.pao).filter(([, x]) => x.p && x.a);
    const due = items.filter(([, x]) => x.st && x.st.due <= now).sort((a, b) => a[1].st.due - b[1].st.due).map(([c]) => c);
    const fresh = items.filter(([, x]) => !x.st).map(([c]) => c).sort();
    const states = Object.fromEntries(items.map(([c, x]) => [c, x.st]));
    const room = Math.max(0, 10 - newToday(states, now));
    return { due, fresh: fresh.slice(0, room) };
  }
  function paoAnswer(lab, code, grade, now = Date.now()) {
    const x = lab.systems.pao[code];
    if (!x) return null;
    const res = SRS.review(x.st, grade, now, retentionOf(lab));
    x.st = res.state;
    logReview(lab, res, grade, now, "pao");
    return res.state;
  }
  // 6 cifre -> persona (prima coppia) + azione (seconda) + oggetto (terza, dal fonetico)
  function paoStory(lab, digits) {
    const s = String(digits).replace(/\D/g, "");
    const out = [];
    for (let i = 0; i < s.length; i += 6) {
      const g = s.slice(i, i + 6);
      const pairs = g.match(/\d{1,2}/g) || [];
      const pp = pairs[0] && pairs[0].length === 2 ? lab.systems.pao[pairs[0]] : null;
      const aa = pairs[1] && pairs[1].length === 2 ? lab.systems.pao[pairs[1]] : null;
      const oo = pairs[2] && pairs[2].length === 2 ? MAJOR.find((m) => m.code === pairs[2]) : null;
      out.push({ digits: g, person: pp ? pp.p : null, action: aa ? aa.a : null, object: oo ? oo.word : null });
    }
    return out;
  }

  /* ------------------------------------------------------------ mazzi tuoi (FSRS) */
  const DECK_KINDS = {
    qa: { label: "Studio", one: "domanda", front: "Domanda", back: "Risposta", extra: "Spiegazione o esempio (facoltativo)" },
    vocab: { label: "Vocaboli", one: "parola", front: "Parola straniera", back: "Significato in italiano", extra: "Parola chiave e scena (facoltativo)" },
    people: { label: "Persone", one: "persona", front: "Nome", back: "Dove e come l'hai conosciuta", extra: "Un dettaglio del viso e l'immagine del nome" },
    piece: { label: "Brani", one: "sezione", front: "Sezione (es. A, battute 1-16)", back: "Punti di ripartenza e cosa ricordare", extra: "Brano" }
  };
  const MAX_CARDS = 3000;
  function uid(prefix, now = Date.now()) {
    return `${prefix}${now.toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
  }
  function addDeck(lab, { name, kind = "qa", lang = "", now = Date.now() } = {}) {
    if (!DECK_KINDS[kind]) return null;
    const deck = { id: uid("d", now), name: String(name || DECK_KINDS[kind].label).trim().slice(0, 60) || DECK_KINDS[kind].label, kind, lang: String(lang || "").trim().slice(0, 30), created: now, retention: null, cards: [] };
    lab.decks.push(deck);
    return deck;
  }
  function removeDeck(lab, id) {
    lab.decks = lab.decks.filter((d) => d.id !== id);
  }
  function deckById(lab, id) {
    return lab.decks.find((d) => d.id === id) || null;
  }
  function totalCards(lab) {
    return lab.decks.reduce((s, d) => s + d.cards.length, 0);
  }
  function addCard(lab, deckId, { f, b, x = "", now = Date.now() } = {}) {
    const deck = deckById(lab, deckId);
    const front = String(f || "").trim().slice(0, 400);
    const back = String(b || "").trim().slice(0, 800);
    if (!deck || !front || !back || totalCards(lab) >= MAX_CARDS) return null;
    const card = { id: uid("c", now), f: front, b: back, x: String(x || "").trim().slice(0, 400), created: now, st: { a: null, b: null } };
    deck.cards.push(card);
    return card;
  }
  function editCard(lab, deckId, cardId, { f, b, x }) {
    const deck = deckById(lab, deckId);
    const card = deck && deck.cards.find((c) => c.id === cardId);
    if (!card) return null;
    if (typeof f === "string" && f.trim()) card.f = f.trim().slice(0, 400);
    if (typeof b === "string" && b.trim()) card.b = b.trim().slice(0, 800);
    if (typeof x === "string") card.x = x.trim().slice(0, 400);
    return card;
  }
  function removeCard(lab, deckId, cardId) {
    const deck = deckById(lab, deckId);
    if (deck) deck.cards = deck.cards.filter((c) => c.id !== cardId);
  }
  // Righe «domanda | risposta» (anche con ; o tabulazione). Restituisce quante schede ha aggiunto.
  function importCards(lab, deckId, text, now = Date.now()) {
    let added = 0;
    String(text || "").split(/\r?\n/).forEach((line, i) => {
      const parts = line.split(/\s*\|\s*|\t|\s*;\s*/);
      if (parts.length < 2) return;
      const [f, b, ...rest] = parts;
      if (addCard(lab, deckId, { f, b, x: rest.join(" ").trim(), now: now + i })) added += 1;
    });
    return added;
  }
  function addStarter(lab, which, now = Date.now()) {
    if (which === "openings") {
      const deck = addDeck(lab, { name: "Aperture: le prime mosse", kind: "qa", now });
      CONTENT.OPENINGS.forEach(([f, b, x], i) => addCard(lab, deck.id, { f, b, x, now: now + i }));
      return deck;
    }
    return null;
  }
  // lati di una scheda: i vocaboli si ripassano nei due sensi
  function sidesOf(deck) {
    return deck.kind === "vocab" ? ["a", "b"] : ["a"];
  }
  function newPerDay(lab) {
    return clamp(Number.isInteger(lab.prefs.newPerDay) ? lab.prefs.newPerDay : 15, 0, 100);
  }
  /*
   * Coda del giorno: prima le schede in scadenza (le piu' vecchie prima), poi le nuove fino al
   * limite del giorno. I due lati di un vocabolo non escono lo stesso giorno.
   */
  function deckQueue(lab, now = Date.now(), onlyDeck = null) {
    const due = [];
    const fresh = [];
    const today = dayKey(now);
    let introduced = 0;
    lab.decks.forEach((deck) => deck.cards.forEach((card) => sidesOf(deck).forEach((side) => {
      const st = card.st[side];
      if (st && num(st.first) && dayKey(st.first) === today) introduced += 1;
    })));
    lab.decks.forEach((deck) => {
      if (onlyDeck && deck.id !== onlyDeck) return;
      deck.cards.forEach((card) => {
        const sides = sidesOf(deck);
        const seenToday = sides.some((sd) => card.st[sd] && num(card.st[sd].last) && dayKey(card.st[sd].last) === today);
        sides.forEach((side) => {
          const st = card.st[side];
          if (st) {
            if (st.due <= now) due.push({ deckId: deck.id, cardId: card.id, side, due: st.due, isNew: false });
          } else if (!seenToday && !(side === "b" && !card.st.a)) {
            fresh.push({ deckId: deck.id, cardId: card.id, side, due: card.created, isNew: true });
          }
        });
      });
    });
    due.sort((a, b) => a.due - b.due);
    fresh.sort((a, b) => a.due - b.due);
    const room = Math.max(0, newPerDay(lab) - introduced);
    return { due, fresh: fresh.slice(0, room), freshLeft: fresh.length };
  }
  function cardRef(lab, ref) {
    const deck = deckById(lab, ref.deckId);
    const card = deck && deck.cards.find((c) => c.id === ref.cardId);
    return card ? { deck, card } : null;
  }
  function answerCard(lab, ref, grade, now = Date.now()) {
    const x = cardRef(lab, ref);
    if (!x) return null;
    const res = SRS.review(x.card.st[ref.side] || null, grade, now, retentionOf(lab, x.deck));
    x.card.st[ref.side] = res.state;
    logReview(lab, res, grade, now, x.deck.kind);
    return res.state;
  }
  function deckStats(deck, now = Date.now()) {
    let due = 0;
    let fresh = 0;
    let mature = 0;
    deck.cards.forEach((card) => sidesOf(deck).forEach((side) => {
      const st = card.st[side];
      if (!st) fresh += 1;
      else { if (st.due <= now) due += 1; if (SRS.mature(st)) mature += 1; }
    }));
    return { cards: deck.cards.length, due, fresh, mature, sides: deck.cards.length * sidesOf(deck).length };
  }

  /* ------------------------------------------------------------ testi a memoria */
  function addText(lab, { title, body, sample = null, now = Date.now() } = {}) {
    const b = String(body || "").replace(/\r/g, "").trim().slice(0, 4000);
    if (!b) return null;
    const t = { id: uid("x", now), title: String(title || "Testo").trim().slice(0, 80) || "Testo", body: b, sample: sample || null, created: now, runs: [], st: null };
    lab.texts.push(t);
    return t;
  }
  function addSampleText(lab, id, now = Date.now()) {
    const s = CONTENT.TEXTS.find((x) => x.id === id);
    if (!s) return null;
    const have = lab.texts.find((t) => t.sample === id);
    return have || addText(lab, { title: s.title, body: s.body, sample: id, now });
  }
  function removeText(lab, id) {
    lab.texts = lab.texts.filter((t) => t.id !== id);
  }
  // parole del testo con la punteggiatura attaccata, riga per riga
  function textLines(body) {
    return String(body || "").split("\n").map((line) => line.split(/\s+/).filter(Boolean));
  }
  function textWordsFlat(body) {
    return textLines(body).flat();
  }
  // iniziali: «quest'ermo,» -> «q'e,»
  function initials(word) {
    return String(word).replace(/([A-Za-zÀ-ÖØ-öø-ÿ0-9])[A-Za-zÀ-ÖØ-öø-ÿ0-9]*/g, "$1");
  }
  // ordine fisso (dal seme) in cui le parole spariscono: la parte nascosta cresce senza cambiare
  function maskOrder(n, seed = 1) {
    return shuffle(Array.from({ length: n }, (_, i) => i), rng(seed));
  }
  function maskedSet(n, share, seed = 1) {
    return new Set(maskOrder(n, seed).slice(0, Math.round(clamp(share, 0, 1) * n)));
  }
  // confronto parola per parola (sottosequenza comune piu' lunga)
  function scoreText(body, typed) {
    const target = textWordsFlat(body);
    const given = String(typed || "").split(/\s+/).filter(Boolean);
    const T = target.map(clean);
    const G = given.map(clean);
    const n = T.length;
    const m = G.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    const eq = (i, j) => T[i] === G[j] || (T[i].length >= 6 && lev(T[i], G[j]) <= 1);
    for (let i = n - 1; i >= 0; i -= 1) for (let j = m - 1; j >= 0; j -= 1) dp[i][j] = eq(i, j) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const ok = new Array(n).fill(false);
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (eq(i, j)) { ok[i] = true; i += 1; j += 1; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) i += 1;
      else j += 1;
    }
    const correct = ok.filter(Boolean).length;
    const extra = Math.max(0, m - correct);
    return { correct, total: n, extra, pct: n ? Math.round((correct / n) * 100) : 0, words: target.map((w, k) => ({ w, ok: ok[k] })) };
  }
  // mode: read | initials | mask25 | mask50 | mask75 | full. Il richiamo completo entra nel ripasso.
  function recordTextRun(lab, id, mode, pct, now = Date.now(), extra = null) {
    const t = lab.texts.find((x) => x.id === id);
    if (!t) return null;
    t.runs.push({ t: now, mode, pct: clamp(Math.round(pct), 0, 100) });
    t.runs = t.runs.slice(-60);
    let grade = null;
    if (mode === "full") {
      grade = pct >= 100 ? 4 : pct >= 90 ? 3 : pct >= 75 ? 2 : 1;
      const res = SRS.review(t.st, grade, now, retentionOf(lab));
      t.st = res.state;
      logReview(lab, res, grade, now, "text");
    }
    logActivity(lab, "text", now, { mode, pct: Math.round(pct), ...(isObj(extra) ? extra : {}) });
    return { grade, st: t.st };
  }
  function textBest(t) {
    const full = t.runs.filter((r) => r.mode === "full");
    return full.length ? Math.max(...full.map((r) => r.pct)) : null;
  }

  /* ------------------------------------------------------------ scacchi */
  const FILES = "abcdefgh";
  function squareXY(sq) {
    const f = FILES.indexOf(String(sq)[0]);
    const r = Number(String(sq)[1]) - 1;
    return f >= 0 && r >= 0 && r < 8 ? [f, r] : null;
  }
  function squareName(f, r) { return `${FILES[f]}${r + 1}`; }
  // a1 e' scura, h1 chiara
  function isLight(sq) {
    const xy = squareXY(sq);
    return xy ? (xy[0] + xy[1]) % 2 === 1 : false;
  }
  function knightDistance(a, b) {
    const s = squareXY(a);
    const t = squareXY(b);
    if (!s || !t) return null;
    const seen = new Set([s.join()]);
    let frontier = [s];
    for (let d = 0; d <= 6; d += 1) {
      if (frontier.some((p) => p[0] === t[0] && p[1] === t[1])) return d;
      const next = [];
      frontier.forEach(([x, y]) => [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx > 7 || ny > 7 || seen.has(`${nx},${ny}`)) return;
        seen.add(`${nx},${ny}`);
        next.push([nx, ny]);
      }));
      frontier = next;
    }
    return null;
  }
  function randomSquare(rand) { return squareName(Math.floor(rand() * 8), Math.floor(rand() * 8)); }
  function colorsRound(seed = Date.now(), n = 20) {
    const rand = rng(seed);
    const out = [];
    while (out.length < n) { const sq = randomSquare(rand); if (out[out.length - 1] !== sq) out.push(sq); }
    return out.map((sq) => ({ sq, light: isLight(sq) }));
  }
  function knightRound(seed = Date.now(), n = 10) {
    const rand = rng(seed);
    const out = [];
    let guard = 0;
    while (out.length < n && guard < 1000) {
      guard += 1;
      const a = randomSquare(rand);
      const b = randomSquare(rand);
      const d = knightDistance(a, b);
      if (d >= 1 && d <= 4) out.push({ a, b, d });
    }
    return out;
  }
  // FEN -> { "e4": "P", ... } (maiuscole = Bianco)
  function parseFen(fen) {
    const rows = String(fen || "").split(" ")[0].split("/");
    if (rows.length !== 8) return null;
    const board = {};
    rows.forEach((row, ri) => {
      let f = 0;
      row.split("").forEach((ch) => {
        if (/\d/.test(ch)) f += Number(ch);
        else { if (f < 8) board[squareName(f, 7 - ri)] = ch; f += 1; }
      });
    });
    return board;
  }
  const PIECE_NAMES = { K: ["re", "m"], Q: ["donna", "f"], R: ["torre", "f"], B: ["alfiere", "m"], N: ["cavallo", "m"], P: ["pedone", "m"] };
  function pieceLabel(ch) {
    if (!ch) return "casa vuota";
    const [name, g] = PIECE_NAMES[ch.toUpperCase()];
    const white = ch === ch.toUpperCase();
    return `${name} ${white ? (g === "f" ? "bianca" : "bianco") : (g === "f" ? "nera" : "nero")}`;
  }
  const ALL_PIECE_LABELS = "KQRBNPkqrbnp".split("").map(pieceLabel);
  // Posizione lampo: domande su una posizione vista per pochi secondi.
  function flashQuestions(fen, seed = Date.now()) {
    const board = parseFen(fen);
    if (!board) return [];
    const rand = rng(seed);
    const occupied = Object.keys(board);
    const pieces = shuffle(occupied.filter((sq) => board[sq].toUpperCase() !== "P"), rand);
    const qs = [];
    const options = (right) => shuffle([right, ...shuffle(ALL_PIECE_LABELS.concat("casa vuota").filter((x) => x !== right), rand).slice(0, 3)], rand);
    // 1-2: che cosa c'e' in questa casa?
    pieces.slice(0, 2).forEach((sq) => {
      const right = pieceLabel(board[sq]);
      qs.push({ kind: "what", sq, prompt: `Che cosa c'era in ${sq}?`, options: options(right), answer: right });
    });
    // 3: una casa vuota vicino ai pezzi
    const empties = [];
    for (let f = 0; f < 8; f += 1) for (let r = 0; r < 8; r += 1) { const sq = squareName(f, r); if (!board[sq]) empties.push(sq); }
    const near = shuffle(empties.filter((sq) => { const [x, y] = squareXY(sq); return occupied.some((o) => { const [a, b] = squareXY(o); return Math.abs(a - x) <= 1 && Math.abs(b - y) <= 1; }); }), rand);
    if (near.length) qs.push({ kind: "what", sq: near[0], prompt: `Che cosa c'era in ${near[0]}?`, options: options("casa vuota"), answer: "casa vuota" });
    // 4: dov'era il re nero?
    const king = occupied.find((sq) => board[sq] === "k");
    if (king) qs.push({ kind: "where", prompt: "In che casa era il re nero?", answer: king });
    // 5: quanti pedoni aveva il Bianco?
    qs.push({ kind: "count", prompt: "Quanti pedoni aveva il Bianco?", answer: String(occupied.filter((sq) => board[sq] === "P").length) });
    return qs;
  }
  // extra: dati in piu' per il registro (per esempio la sfida della Torre: { ch, tg, maxMs })
  function recordChess(lab, drill, correct, total, ms, now = Date.now(), extra = null) {
    const c = lab.chessDrills[drill] || (lab.chessDrills[drill] = { runs: [], best: null });
    c.runs.push({ t: now, correct, total, ms: Math.round(ms || 0) });
    c.runs = c.runs.slice(-60);
    const pct = total ? correct / total : 0;
    if (!c.best || pct > c.best.pct || (pct === c.best.pct && ms < c.best.ms)) c.best = { pct, ms: Math.round(ms || 0), t: now };
    logActivity(lab, `chess:${drill}`, now, { score: correct, max: total, ms: Math.round(ms || 0), ...(isObj(extra) ? extra : {}) });
    return c;
  }

  /* ------------------------------------------------------------ ripassi: registro e ritenzione */
  function logReview(lab, res, grade, now, kind) {
    const e = { t: now, g: grade, c: res.counted ? 1 : 0, r: num(res.r) ? Math.round(res.r * 1000) / 1000 : null, k: kind };
    lab.revlog.push(e);
    lab.revlog = lab.revlog.slice(-3000);
    runHooks(HOOKS.review, lab, e);
  }
  // Ritenzione vera degli ultimi 30 giorni: ripassi di schede gia' imparate (non nuove, non lo stesso giorno).
  function trueRetention(lab, now = Date.now(), days = 30) {
    const from = now - days * DAY;
    const list = lab.revlog.filter((e) => e.t >= from && e.c && num(e.r));
    if (!list.length) return { n: 0, share: null, predicted: null };
    const ok = list.filter((e) => e.g > 1).length;
    return { n: list.length, share: ok / list.length, predicted: list.reduce((s, e) => s + e.r, 0) / list.length };
  }
  // tutto quello che e' da ripassare oggi (mazzi, testi, carte, persone-azioni)
  function reviewSummary(lab, now = Date.now()) {
    const dq = deckQueue(lab, now);
    const cq = cardsQueue(lab, now);
    const pq = paoQueue(lab, now);
    const texts = lab.texts.filter((t) => t.st && t.st.due <= now).length;
    const started = Object.keys(lab.systems.cards).length > 0;
    return {
      decksDue: dq.due.length, decksNew: dq.fresh.length,
      cardsDue: started ? cq.due.length : 0, paoDue: pq.due.length, texts,
      total: dq.due.length + (started ? cq.due.length : 0) + pq.due.length + texts,
      totalNew: dq.fresh.length
    };
  }

  /* ------------------------------------------------------------ percorso guidato */
  const TASK_MIN = { test: 3, words: 8, major: 4, build: 5, palace: 6, dis: 5, cardsys: 5, pao: 8, deck: 8, review: 5, text: 8, chess: 4, life: 4, real: 2 };
  const CHESS_DRILLS = { colors: "Colori delle case", knight: "Salti del cavallo", flash: "Posizione lampo" };
  const LIFE_DRILLS = { phone: { label: "Numero di telefono", key: "numbers", n: 10, mem: 60 }, shop: { label: "Lista della spesa", key: "words", n: 12, mem: 90, list: "groceries" } };
  function courseStart(lab, now = Date.now()) {
    lab.course = { start: now, day: 1, opened: { 1: now }, finished: {}, manual: {}, done: null };
    logActivity(lab, "course:start", now);
    return lab.course;
  }
  function courseActive(lab) {
    return Boolean(lab.course && num(lab.course.start) && !num(lab.course.done));
  }
  function lessonById(id) {
    return CONTENT.LESSONS.find((l) => l.id === id) || null;
  }
  function taskInfo(task, lab, now = Date.now()) {
    const fm = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} minuti` : `${s} secondi`);
    switch (task.k) {
      case "test": return { label: SPAN_TESTS[task.test].label, detail: "Test di span: rispondi con calma, una prova alla volta." };
      case "words": return { label: "Lista di 15 parole", detail: "5 prove, la lista di disturbo, poi il richiamo dopo 20 minuti." };
      case "major": {
        const q = majorQueue(lab, now);
        return { label: "Sistema fonetico", detail: `${q.due.length} da ripassare e ${q.fresh.length} immagini nuove (${majorLearned(lab)}/100 imparate).` };
      }
      case "build": return { label: task.count === 1 ? `Un palazzo con almeno ${task.min} luoghi` : `${task.count} palazzi da almeno ${task.min} luoghi`, detail: `Ne hai ${lab.palaces.filter((p) => p.loci.length >= task.min).length} così.` };
      case "palace": return { label: `Parole nel palazzo: ${task.n}`, detail: task.per === 2 ? `${Math.ceil(task.n / 2)} luoghi, due parole per luogo.` : `${task.n} luoghi, una parola per luogo.` };
      case "dis": { const d = DISCIPLINES[task.key]; return { label: `${d.label}: ${task.n} ${d.unit}`, detail: `${fm(task.mem)} per memorizzare.` }; }
      case "cardsys": { const q = cardsQueue(lab, now); return { label: "Sistema delle carte", detail: `Carta → numero → immagine: ${q.due.length} da ripassare, ${q.fresh.length} nuove (${cardsSure(lab)}/52 sicure).` }; }
      case "pao": return { label: `Persone e azioni: almeno ${task.n}`, detail: `Ne hai scritte ${paoFilled(lab)}; poi un giro di ripasso.` };
      case "deck": return { label: `Mazzo ${DECK_KINDS[task.kind].label}: almeno ${task.min} ${task.min === 1 ? "scheda" : "schede"}`, detail: DECK_KINDS[task.kind].front + " → " + DECK_KINDS[task.kind].back.toLowerCase() + "." };
      case "review": { const r = reviewSummary(lab, now); return { label: "Ripassi del giorno", detail: r.total ? `${r.total} da ripassare${r.totalNew ? ` e ${r.totalNew} nuove` : ""}.` : r.totalNew ? `Nessun ripasso in scadenza; ${r.totalNew} schede nuove se vuoi.` : "Niente in scadenza oggi." }; }
      case "text": { const s = CONTENT.TEXTS.find((x) => x.id === task.text); return { label: s ? `Testo a memoria: ${s.title.split(" (")[0]}` : "Testo a memoria", detail: "Iniziali, cancellazione progressiva, richiamo completo." }; }
      case "chess": return { label: CHESS_DRILLS[task.drill], detail: task.drill === "colors" ? "Chiara o scura? Venti case, più veloce che puoi." : task.drill === "knight" ? "In quante mosse il cavallo arriva da una casa all'altra." : "Guarda la posizione per pochi secondi, poi rispondi." };
      case "life": return { label: LIFE_DRILLS[task.drill].label, detail: task.drill === "phone" ? "Dieci cifre in un minuto: coppie, immagini, una scena." : "Dodici cose da comprare in un palazzo corto." };
      case "real": return { label: task.text, detail: "Fuori dall'app: segnalo quando l'hai fatto." };
      default: return { label: task.k, detail: "" };
    }
  }
  function taskDone(lab, task, dayN, now = Date.now()) {
    const c = lab.course;
    const since = num(c.opened[dayN]) ? c.opened[dayN] : c.start;
    const logs = lab.log.filter((e) => e.t >= since);
    const has = (kind, cond = () => true) => logs.some((e) => e.kind === kind && cond(e.m || {}));
    switch (task.k) {
      case "test": return has(`test:${task.test}`);
      case "words": return has("test:words") || has("test:words-trials");
      case "major": { const q = majorQueue(lab, now); return q.due.length + q.fresh.length === 0; }
      case "build": return lab.palaces.filter((p) => p.loci.length >= task.min).length >= task.count;
      case "palace": return has("palace", (m) => num(m.n) && m.n >= task.n);
      case "dis": return has(`dis:${task.key}`, (m) => num(m.n) && m.n >= task.n && (!num(m.mem) || m.mem <= task.mem));
      case "cardsys": return has("sys:cards");
      case "pao": return paoFilled(lab) >= task.n && has("sys:pao");
      case "deck": return lab.decks.some((d) => d.kind === task.kind && d.cards.length >= task.min);
      case "review": return reviewSummary(lab, now).total === 0;
      case "text": return has("text");
      case "chess": return has(`chess:${task.drill}`);
      case "life": return has(`life:${task.drill}`);
      case "real": return Boolean(c.manual[dayN] && c.manual[dayN][task.id]);
      default: return false;
    }
  }
  /*
   * Stato del percorso. Con sync = true chiude la giornata finita e apre la successiva quando e'
   * cambiato il giorno di calendario (una giornata al giorno: il sonno in mezzo fa parte del metodo).
   * Restituisce anche changed: true se ha modificato lo stato.
   */
  function courseStatus(lab, now = Date.now(), sync = true) {
    const c = lab.course;
    if (!c || !num(c.start)) return { started: false, active: false };
    let changed = false;
    const build = () => {
      const def = COURSE.DAYS[c.day - 1];
      const tasks = def.tasks.map((t) => ({ ...t, ...taskInfo(t, lab, now), minutes: TASK_MIN[t.k] || 4, done: taskDone(lab, t, c.day, now) }));
      const required = tasks.filter((t) => !t.opt);
      return { def, tasks, complete: required.every((t) => t.done) };
    };
    let cur = build();
    if (sync && !num(c.done)) {
      for (let guard = 0; guard < 3; guard += 1) {
        if (cur.complete && !num(c.finished[c.day])) { c.finished[c.day] = now; changed = true; logActivity(lab, `course:day${c.day}`, now); }
        if (num(c.finished[c.day]) && c.day >= COURSE.LENGTH) { c.done = c.finished[c.day]; changed = true; break; }
        if (num(c.finished[c.day]) && dayKey(now) !== dayKey(c.finished[c.day])) {
          c.day += 1;
          // conta tutto quello che hai fatto oggi (la giornata prima e' finita un altro giorno)
          c.opened[c.day] = startOfDay(now);
          changed = true;
          cur = build();
          continue;
        }
        break;
      }
    }
    const waiting = !num(c.done) && num(c.finished[c.day]);
    const follow = c.start + COURSE.FOLLOW_UP_DAYS * DAY;
    return {
      started: true, active: !num(c.done), done: num(c.done), day: c.day, week: COURSE.WEEKS[Math.ceil(c.day / 7) - 1],
      def: cur.def, tasks: cur.tasks, complete: cur.complete, waiting, changed,
      lesson: cur.def.lesson ? lessonById(cur.def.lesson) : null,
      followUpAt: follow, followUpDue: num(c.done) && now >= follow
    };
  }
  function courseManual(lab, taskId, done = true, now = Date.now()) {
    const c = lab.course;
    if (!c) return;
    const d = String(c.day);
    if (!c.manual[d]) c.manual[d] = {};
    if (done) c.manual[d][taskId] = now; else delete c.manual[d][taskId];
  }
  function courseReset(lab) {
    lab.course = null;
  }
  // confronto tra il primo risultato dopo l'inizio del percorso e l'ultimo
  function courseReport(lab) {
    const c = lab.course;
    if (!c) return [];
    const first = (list) => list.filter((x) => x.t >= c.start - DAY)[0] || null;
    const rows = [];
    ["digitF", "digitB", "corsiF", "corsiB"].forEach((k) => {
      const list = lab.tests[k] || [];
      const a = first(list);
      const b = list[list.length - 1];
      if (a) rows.push({ key: k, label: SPAN_TESTS[k].short, from: a.value, to: b.value, unit: "span" });
    });
    const w = lab.tests.words || [];
    const wa = first(w);
    if (wa) rows.push({ key: "words", label: "15 parole (5 prove)", from: wa.value, to: w[w.length - 1].value, unit: "su 75" });
    const palaceRuns = lab.log.filter((e) => e.kind === "palace" && e.t >= c.start && e.m && num(e.m.score));
    if (palaceRuns.length) rows.push({ key: "palace", label: "Parole nel palazzo (record)", from: palaceRuns[0].m.score, to: Math.max(...palaceRuns.map((e) => e.m.score)), unit: "parole" });
    ["numbers", "cards", "faces", "images", "dates"].forEach((k) => {
      const runs = lab.log.filter((e) => e.kind === `dis:${k}` && e.t >= c.start && e.m && num(e.m.score));
      if (runs.length) rows.push({ key: k, label: `${DISCIPLINES[k].label} (record)`, from: runs[0].m.score, to: Math.max(...runs.map((e) => e.m.score)), unit: DISCIPLINES[k].unit });
    });
    return rows;
  }

  /* ------------------------------------------------------------ registro, programma, profilo */
  function remember(lab, words) {
    lab.recentWords = words.concat(lab.recentWords || []).filter((w, i, a) => a.indexOf(w) === i).slice(0, 120);
  }
  // agganci per memory/game.js (punti, stelle, missioni): chiamati dopo ogni registrazione.
  // Un errore del gioco non deve mai fermare la memoria.
  const HOOKS = { ensure: [], log: [], review: [] };
  function runHooks(list, ...args) {
    list.forEach((fn) => {
      try { fn(...args); } catch (error) { if (typeof console !== "undefined") console.warn("Memoria, gioco:", error); }
    });
  }
  function logActivity(lab, kind, now = Date.now(), meta = null) {
    const key = dayKey(now);
    if (!lab.days.includes(key)) lab.days.push(key);
    lab.days = lab.days.slice(-400);
    const e = { t: now, kind };
    if (isObj(meta)) e.m = meta;
    lab.log.push(e);
    lab.log = lab.log.slice(-600);
    runHooks(HOOKS.log, lab, e);
  }
  function doneToday(lab, kindPrefix, now = Date.now()) {
    const key = dayKey(now);
    return lab.log.some((e) => dayKey(e.t) === key && e.kind.startsWith(kindPrefix));
  }
  function streak(lab, now = Date.now()) {
    // i giorni salvati da uno scudo (memory/game.js) contano come fatti
    const set = new Set(lab.days.concat(lab.game && Array.isArray(lab.game.covered) ? lab.game.covered : []));
    let n = 0;
    let t = startOfDay(now);
    if (!set.has(dayKey(t))) t = addDays(t, -1); // oggi non ancora fatto: conta da ieri
    while (set.has(dayKey(t))) { n += 1; t = addDays(t, -1); }
    return n;
  }

  // Disciplina del giorno (fuori dal percorso): dom carte, lun numeri, mar parole, mer immagini,
  // gio nomi e volti, ven numeri, sab date.
  const ROTATION = ["cards", "numbers", "words", "images", "faces", "numbers", "dates"];
  function lastTest(lab, key) {
    const list = lab.tests[key] || [];
    return list.length ? list[list.length - 1] : null;
  }
  function reviewStep(lab, now) {
    const r = reviewSummary(lab, now);
    if (!r.total && !r.totalNew) return null;
    return { id: "review", title: "Ripassi del giorno", detail: r.total ? `${r.total} da ripassare${r.totalNew ? ` e ${r.totalNew} nuove` : ""}: mazzi, testi e sistemi.` : `${r.totalNew} schede nuove nei tuoi mazzi.`, minutes: Math.max(3, Math.min(25, Math.round((r.total + r.totalNew) * 0.4))), done: r.total === 0, go: { tab: "review" } };
  }
  function plan(lab, now = Date.now()) {
    const steps = [];
    const cs = courseStatus(lab, now, true);
    // percorso in corso: la giornata del percorso (i compiti facoltativi restano nel percorso)
    if (cs.started && cs.active) {
      if (cs.waiting) {
        steps.push({ id: "course-wait", title: `Percorso: giorno ${cs.day} completato`, detail: cs.day < COURSE.LENGTH ? `Il giorno ${cs.day + 1} si apre domani: tra una giornata e l'altra serve il sonno.` : "Percorso finito.", minutes: 0, done: true, go: { tab: "course" } });
        const rv = reviewStep(lab, now);
        if (rv) steps.push(rv);
        return steps;
      }
      cs.tasks.filter((t) => !t.opt).forEach((t) => steps.push({ id: `course-${t.id}`, title: t.label, detail: t.detail, minutes: t.minutes, done: t.done, go: { tab: "course", task: t.id }, course: true }));
      if (!cs.tasks.some((t) => t.k === "review")) { const rv = reviewStep(lab, now); if (rv) steps.push(rv); }
      return steps;
    }
    const tested = ["digitF", "digitB", "corsiF", "corsiB"].filter((k) => lastTest(lab, k));
    if (!cs.started) {
      steps.push({ id: "course", title: "Inizia il percorso di 6 settimane", detail: "Mezz'ora al giorno, una tecnica alla volta, con i test all'inizio e alla fine.", minutes: 30, done: false, go: { tab: "course" } });
      if (tested.length < 4) steps.push({ id: "baseline", title: "Misura la tua memoria", detail: "Quattro prove di span (cifre e blocchi, avanti e indietro): circa 10 minuti. Servono come punto di partenza.", minutes: 10, done: false, go: { tab: "measure" } });
    }
    if (cs.done && cs.followUpDue && !["digitF", "words"].some((k) => { const t = lastTest(lab, k); return t && t.t >= cs.followUpAt; })) {
      steps.push({ id: "followup", title: "Controllo a quattro mesi", detail: "Rifai i test di span e la lista di parole: è il controllo che fanno anche gli studi.", minutes: 20, done: false, go: { tab: "measure" } });
    }
    const rv = reviewStep(lab, now);
    if (rv) steps.push(rv);
    const q = majorQueue(lab, now);
    const learned = majorLearned(lab);
    if (learned < 100 || q.due.length) {
      steps.push({
        id: "major",
        title: learned < 100 ? "Sistema fonetico" : "Sistema fonetico: ripasso",
        detail: learned < 100 ? `${q.due.length} da ripassare e ${q.fresh.length} immagini nuove (${learned}/100 imparate).` : `${q.due.length} da ripassare: tutte le 100 immagini sono imparate.`,
        minutes: 4,
        done: q.due.length === 0 && q.fresh.length === 0,
        go: { tab: "techniques", technique: "major", drill: true }
      });
    }
    const dis = ROTATION[new Date(now).getDay()];
    const d = DISCIPLINES[dis];
    const dl = lab.disciplines[dis];
    steps.push({ id: "discipline", title: `Disciplina del giorno: ${d.label.toLowerCase()}`, detail: `Livello ${dl.level}: ${d.levels[dl.level - 1].n} ${d.unit} in ${d.levels[dl.level - 1].mem} secondi. Due turni.`, minutes: 6, done: lab.log.filter((e) => dayKey(e.t) === dayKey(now) && e.kind === `dis:${dis}`).length >= 2, go: { tab: "disciplines", discipline: dis } });
    if (!cs.started) {
      const palace = lab.palaces.find((p) => p.loci.length >= 5);
      steps.push(palace
        ? { id: "palace", title: `Palazzo: ${palace.name}`, detail: `Sistema ${Math.min(palace.loci.length, 20)} parole nei tuoi luoghi e ripercorrili.`, minutes: 4, done: doneToday(lab, "palace", now), go: { tab: "techniques", technique: "loci", palaceId: palace.id } }
        : { id: "palace", title: "Costruisci il tuo palazzo della memoria", detail: "Scegli un percorso che conosci bene e scrivi almeno 10 luoghi in ordine.", minutes: 5, done: false, go: { tab: "techniques", technique: "loci" } });
    }
    const last = ["digitF", "digitB", "corsiF", "corsiB", "words"].map((k) => lastTest(lab, k)).filter(Boolean).map((x) => x.t);
    if (!cs.started && tested.length === 4 && last.length && now - Math.max(...last) > 28 * DAY) {
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
    const passed = dis.history.filter((h) => h.pass && !h.custom).map((h) => h.level);
    const top = passed.length ? Math.max(...passed) : 0;
    // i turni del percorso contano per quello che chiedono (quanti elementi rispetto al livello massimo)
    const custom = dis.history.filter((h) => h.custom && h.pass && num(h.n)).map((h) => h.n / d.levels[d.levels.length - 1].n);
    const fromCustom = custom.length ? Math.max(...custom) * 0.8 : 0;
    return Math.round(Math.max(top / d.levels.length, fromCustom) * 100);
  }
  function lerp(x, pts) {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i += 1) if (x <= pts[i][0]) { const [a, b] = pts[i - 1]; const [c, e] = pts[i]; return b + ((x - a) / (c - a)) * (e - b); }
    return pts[pts.length - 1][1];
  }
  function profile(lab, now = Date.now()) {
    const words = lastTest(lab, "words");
    const wordsPct = words ? avg([compare("wordsTotal", words.value, lab.profile), compare("wordsDelayed", words.delayed, lab.profile)].filter(Boolean).map((c) => c.pct), null) : null;
    const days14 = lab.days.filter((d) => d >= dayKey(addDays(now, -13))).length;
    const learned = majorLearned(lab);
    const palaceUse = lab.palaces.reduce((s, p) => s + p.uses, 0);
    const loci = lab.palaces.reduce((s, p) => s + p.loci.length, 0);
    const technique = 35 + learned * 0.25 + cardsSure(lab) * 0.15 + paoFilled(lab) * 0.08 + Math.min(loci, 90) * 0.12 + Math.min(palaceUse, 25) * 0.4;
    const keys = Object.keys(DISCIPLINES);
    const speed = 35 + (keys.reduce((s, k) => s + disciplineProgress(lab, k), 0) / keys.length) * 0.65;
    // ritenzione: quanto tieni nel tempo (ripassi gia' imparati, richiamo differito) e costanza
    const tr = trueRetention(lab, now);
    const consistency = (days14 / 14) * 100;
    let retention;
    if (tr.n >= 20) retention = lerp(tr.share, [[0.5, 25], [0.7, 45], [0.8, 60], [0.9, 82], [0.95, 92], [1, 97]]) * 0.7 + consistency * 0.3;
    else {
      const delayed = words && num(words.delayed) && !words.late ? compare("wordsDelayed", words.delayed, lab.profile) : null;
      retention = delayed ? delayed.pct * 0.5 + consistency * 0.5 : 20 + consistency * 0.6;
    }
    // memoria visiva: i blocchi; le immagini astratte aiutano se le alleni
    const visual = avg([pctOf(lab, "corsiF"), pctOf(lab, "corsiB")], null);
    const imagesP = disciplineProgress(lab, "images");
    const spatial = visual == null ? 35 + imagesP * 0.3 : visual * 0.85 + imagesP * 0.15;
    return [
      { key: "working", label: "Memoria di lavoro", value: Math.round(avg([pctOf(lab, "digitF"), pctOf(lab, "digitB")], 35)) },
      { key: "spatial", label: "Memoria visiva", value: Math.round(clamp(spatial, 0, 100)) },
      { key: "verbal", label: "Richiamo verbale", value: Math.round(wordsPct == null ? 35 : wordsPct) },
      { key: "technique", label: "Tecnica", value: Math.round(clamp(technique, 0, 100)) },
      { key: "speed", label: "Discipline", value: Math.round(clamp(speed, 0, 100)) },
      { key: "retention", label: "Ritenzione", value: Math.round(clamp(retention, 0, 100)) }
    ];
  }
  function trend(lab, now = Date.now()) {
    const cs = courseStatus(lab, now, false);
    const tested = ["digitF", "digitB", "corsiF", "corsiB"].map((k) => lastTest(lab, k)).filter(Boolean);
    const s = streak(lab, now);
    if (!tested.length && !lab.log.length) return "Base iniziale · fai la prima misura";
    const f = lastTest(lab, "digitF");
    const head = cs.started && cs.active ? `Percorso giorno ${cs.day}/${COURSE.LENGTH}` : f ? `Span cifre ${f.value}` : "Span da misurare";
    return `${head} · ${majorLearned(lab)}/100 immagini · ${s ? `${s} ${s === 1 ? "giorno" : "giorni"} di fila` : "riprendi oggi"}`;
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
    logActivity(lab, "test:words-trials", now);
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
  function cleanSt(x) { return SRS && x ? SRS.clean(x) : null; }
  function ensureCourse(o) {
    if (!isObj(o) || !num(o.start)) return null;
    const day = clamp(Number.isInteger(o.day) ? o.day : 1, 1, Math.max(1, COURSE.LENGTH));
    const nums = (m) => { const out = {}; if (isObj(m)) Object.keys(m).forEach((k) => { if (/^\d+$/.test(k) && num(m[k])) out[k] = m[k]; }); return out; };
    const manual = {};
    if (isObj(o.manual)) Object.keys(o.manual).forEach((k) => { if (/^\d+$/.test(k) && isObj(o.manual[k])) { manual[k] = {}; Object.keys(o.manual[k]).forEach((t) => { if (/^t\d+$/.test(t) && num(o.manual[k][t])) manual[k][t] = o.manual[k][t]; }); } });
    const opened = nums(o.opened);
    if (!num(opened[day])) opened[day] = o.start;
    return { start: o.start, day, opened, finished: nums(o.finished), manual, done: num(o.done) ? o.done : null };
  }
  function ensureDeck(d) {
    if (!isObj(d) || typeof d.id !== "string" || !DECK_KINDS[d.kind]) return null;
    const cards = Array.isArray(d.cards) ? d.cards.filter((c) => isObj(c) && typeof c.id === "string" && typeof c.f === "string" && typeof c.b === "string").map((c) => ({
      id: c.id, f: c.f.slice(0, 400), b: c.b.slice(0, 800), x: typeof c.x === "string" ? c.x.slice(0, 400) : "", created: num(c.created) ? c.created : 0,
      st: { a: cleanSt(isObj(c.st) ? c.st.a : null), b: cleanSt(isObj(c.st) ? c.st.b : null) }
    })) : [];
    return { id: d.id, name: typeof d.name === "string" && d.name.trim() ? d.name.slice(0, 60) : DECK_KINDS[d.kind].label, kind: d.kind, lang: typeof d.lang === "string" ? d.lang.slice(0, 30) : "", created: num(d.created) ? d.created : 0, retention: num(d.retention) ? clamp(d.retention, 0.85, 0.97) : null, cards };
  }
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
      log: Array.isArray(o.log) ? o.log.filter((e) => isObj(e) && num(e.t) && typeof e.kind === "string").map((e) => (isObj(e.m) ? { t: e.t, kind: e.kind, m: e.m } : { t: e.t, kind: e.kind })).slice(-600) : [],
      prefs: {
        retention: isObj(o.prefs) && num(o.prefs.retention) ? clamp(o.prefs.retention, 0.85, 0.97) : 0.9,
        newPerDay: isObj(o.prefs) && Number.isInteger(o.prefs.newPerDay) ? clamp(o.prefs.newPerDay, 0, 100) : 15
      },
      course: ensureCourse(o.course),
      decks: Array.isArray(o.decks) ? o.decks.map(ensureDeck).filter(Boolean).slice(0, 40) : [],
      texts: Array.isArray(o.texts) ? o.texts.filter((t) => isObj(t) && typeof t.id === "string" && typeof t.body === "string" && t.body.trim()).map((t) => ({
        id: t.id, title: typeof t.title === "string" ? t.title.slice(0, 80) : "Testo", body: t.body.slice(0, 4000), sample: typeof t.sample === "string" ? t.sample : null,
        created: num(t.created) ? t.created : 0, runs: Array.isArray(t.runs) ? t.runs.filter((r) => isObj(r) && num(r.t) && num(r.pct) && typeof r.mode === "string").slice(-60) : [], st: cleanSt(t.st)
      })).slice(0, 30) : [],
      systems: { cards: {}, pao: {} },
      chessDrills: {},
      revlog: Array.isArray(o.revlog) ? o.revlog.filter((e) => isObj(e) && num(e.t) && Number.isInteger(e.g)).slice(-3000) : []
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
    if (isObj(o.systems)) {
      if (isObj(o.systems.cards)) Object.keys(o.systems.cards).forEach((c) => { const st = cleanSt(o.systems.cards[c]); if (DECK.includes(c) && st) lab.systems.cards[c] = st; });
      if (isObj(o.systems.pao)) Object.keys(o.systems.pao).forEach((code) => {
        const v = o.systems.pao[code];
        if (/^\d\d$/.test(code) && isObj(v) && (typeof v.p === "string" || typeof v.a === "string")) lab.systems.pao[code] = { p: String(v.p || "").slice(0, 60), a: String(v.a || "").slice(0, 60), st: cleanSt(v.st) };
      });
    }
    if (isObj(o.chessDrills)) ["colors", "knight", "flash"].forEach((k) => {
      const c = o.chessDrills[k];
      if (isObj(c)) lab.chessDrills[k] = { runs: Array.isArray(c.runs) ? c.runs.filter((r) => isObj(r) && num(r.t) && num(r.correct) && num(r.total)).slice(-60) : [], best: isObj(c.best) && num(c.best.pct) ? { pct: c.best.pct, ms: num(c.best.ms) ? c.best.ms : 0, t: num(c.best.t) ? c.best.t : 0 } : null };
    });
    runHooks(HOOKS.ensure, lab, o);
    return lab;
  }

  function setCorsi(layout) {
    if (Array.isArray(layout) && layout.length === 9) CORSI = layout;
  }

  return {
    VERSION, DAY, NORMS, SPAN_TESTS, WORD_TEST, DISCIPLINES, PASS_SHARE, DECK, SUITS, RANKS, MAJOR, MAJOR_INTERVALS, MAJOR_NEW_PER_DAY, ROTATION,
    get CORSI() { return CORSI; }, setCorsi,
    rng, shuffle, clean, sameWord, normCdf, dayKey, addDays, startOfDay,
    compare, zLabel, normRef, BENCH, BENCH_URL, BENCH_URLS,
    makeSpanTest, spanNext, spanAnswer, spanSequence,
    makeWordTest, wordStage, wordAnswer, scoreFree, startDelayed, delayedStatus, finishDelayed, skipDelayed,
    cardInfo, makeRound, scoreRound, recordRound, setLevel, pickEvents,
    savePalace, removePalace, makePalaceRound, scorePalace, recordPalace,
    phonetic, majorState, majorQueue, majorAnswer, majorLearned, majorQuestion, majorStory,
    cardCode, cardImage, cardsQueue, cardQuestion, cardAnswer, cardsSure, CARDS_NEW_PER_DAY,
    dominic, paoSet, paoFilled, paoQueue, paoAnswer, paoStory,
    DECK_KINDS, addDeck, removeDeck, deckById, addCard, editCard, removeCard, importCards, addStarter, sidesOf, deckQueue, cardRef, answerCard, deckStats, totalCards, newPerDay, retentionOf,
    addText, addSampleText, removeText, textLines, textWordsFlat, initials, maskOrder, maskedSet, scoreText, recordTextRun, textBest,
    isLight, knightDistance, colorsRound, knightRound, parseFen, pieceLabel, flashQuestions, recordChess, squareName,
    trueRetention, reviewSummary, logReview,
    COURSE, CONTENT, courseStart, courseActive, courseStatus, courseManual, courseReset, courseReport, taskInfo, taskDone, lessonById, CHESS_DRILLS, LIFE_DRILLS,
    hooks: HOOKS, logActivity, doneToday, streak, plan, profile, trend, recordTest, lastTest,
    ensure
  };
});
