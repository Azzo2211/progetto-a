/*
 * Progetto A - Logica: motore (senza DOM).
 *
 *  - 7 discipline con esercizi generati (logic/gen.js): matrici, serie, griglie, cavalieri e
 *    furfanti, sillogismi, probabilita', riflessione.
 *  - Un punteggio tipo Elo per disciplina: ogni livello ha una difficolta' (1000 = un esercizio che
 *    il partecipante tipico degli studi risolve una volta su due); dopo ogni risposta il punteggio
 *    sale o scende in base a quanto era probabile risolverlo. Il livello si sceglie da solo
 *    (circa 6 volte su 10 giuste: la zona in cui si impara) oppure a mano.
 *  - Trappole della mente (logic/traps.js): gli esperimenti classici, con i dati originali.
 *  - Programma del giorno, profilo per il quadro (esagono), storico.
 * Stato: state.logicLab.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LogicEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";
  const req = (name, file) => {
    if (root[name]) return root[name];
    if (typeof require === "function") { try { return require(file); } catch (e) { return {}; } }
    return {};
  };
  const G = req("LogicGen", "./gen.js");
  const TR = req("LogicTraps", "./traps.js");
  const DATA = req("LogicData", "./data.js");
  const TRAPS = (TR && TR.TRAPS) || [];
  const LESSONS = (DATA && DATA.LESSONS) || [];

  const VERSION = 1;
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function startOfDay(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function addDays(t, n) { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); }
  function dayKey(t) { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

  /*
   * Discipline. diff = difficolta' Elo di ogni livello (indice 1..max). round = esercizi per turno.
   * Le difficolta' sono tarate sulle percentuali di risposte giuste degli studi quando esistono
   * (vedi README, "Modulo logica"); per il resto sono stime coerenti tra loro.
   */
  const DISCIPLINES = {
    // diff = difficolta' media dei livelli (serve a scegliere il livello); il punteggio usa quella di ogni esercizio
    matrix: { key: "matrix", label: "Matrici", desc: "Trova la regola e completa la figura che manca, come nelle matrici di Raven.", round: 8, diff: [0, 528, 654, 699, 818, 915, 1115, 1164] },
    series: { key: "series", label: "Serie di numeri", desc: "Scopri la regola e scrivi il numero che viene dopo.", round: 8, diff: [0, 488, 709, 913, 988, 1079] },
    grid: { key: "grid", label: "Griglie di deduzione", desc: "Con pochi indizi ricostruisci chi abita dove e che cosa fa: una sola soluzione possibile.", round: 3, diff: [0, 488, 699, 809, 965, 1070] },
    knights: { key: "knights", label: "Cavalieri e furfanti", desc: "I cavalieri dicono sempre il vero, i furfanti mentono sempre: chi è chi?", round: 5, diff: [0, 618, 809, 930, 1035, 1108, 1191] },
    syllo: { key: "syllo", label: "Sillogismi", desc: "Due premesse: che cosa segue per forza? Con parole inventate, così conta solo la logica.", round: 8, diff: [0, 759, 869, 923, 1028] },
    prob: { key: "prob", label: "Probabilità", desc: "Dadi, carte, test medici e scommesse: il calcolo giusto contro l'intuizione.", round: 6, diff: [0, 730, 906, 949, 1044, 1196] },
    crt: { key: "crt", label: "Riflessione", desc: "Problemi con una risposta d'istinto sbagliata: fermarsi e controllare.", round: 6, diff: [0, 955, 1026, 1070, 1080] }
  };
  const KEYS = Object.keys(DISCIPLINES);
  const START_RATING = 900;
  const TARGET_GAP = 80; // il livello scelto da solo e' un po' sotto il tuo punteggio: ~61% di giuste

  function maxLevel(key) { return DISCIPLINES[key].diff.length - 1; }
  function expected(r, d) { return 1 / (1 + 10 ** ((d - r) / 400)); }
  // livello automatico: quello con difficolta' piu' vicina a punteggio - TARGET_GAP
  function autoLevel(lab, key) {
    const r = lab.ratings[key].r;
    const d = DISCIPLINES[key].diff;
    let best = 1;
    for (let lv = 1; lv < d.length; lv += 1) if (Math.abs(d[lv] - (r - TARGET_GAP)) < Math.abs(d[best] - (r - TARGET_GAP))) best = lv;
    return best;
  }

  /* ---- turni */
  function makeRound(lab, key, opts = {}) {
    const d = DISCIPLINES[key];
    if (!d) return null;
    const level = opts.level ? clamp(opts.level | 0, 1, maxLevel(key)) : autoLevel(lab, key);
    const seed = num(opts.seed) ? opts.seed >>> 0 : (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    return { key, level, auto: !opts.level, seed, n: opts.n || d.round, idx: 0, item: G.make(key, level, seed), results: [], startR: lab.ratings[key].r, startedAt: Date.now(), itemAt: Date.now(), done: false };
  }
  // controlla una risposta (senza registrarla)
  function check(item, ans) {
    if (!item) return { ok: false };
    const near = (a, b, tol) => num(a) && num(b) && Math.abs(a - b) <= tol + 1e-9;
    switch (item.kind) {
      case "matrix": return { ok: Number(ans) === item.answer };
      case "series": return { ok: Number(ans) === item.answer };
      case "syllo": return item.mode === "produce" ? { ok: item.correct.includes(Number(ans)) } : { ok: Boolean(ans) === item.answer };
      case "knights": return { ok: Array.isArray(ans) && ans.length === item.n && ans.every((x, i) => Boolean(x) === item.solution[i]) };
      case "grid": {
        const wrong = [];
        item.cats.forEach((c) => item.solution[c].forEach((v, h) => { if (!ans || !ans[c] || ans[c][h] !== v) wrong.push({ c, h }); }));
        return { ok: wrong.length === 0, wrong };
      }
      case "prob": {
        const v = Number(ans);
        const val = item.unit === "€" ? v : v / 100;
        const ok = near(val, item.answer, item.tol);
        return { ok, lure: !ok && num(item.lure) && near(val, item.lure, Math.max(item.tol, 0.005)) };
      }
      case "crt": {
        const v = Number(ans);
        const ok = near(v, item.answer, item.tol);
        return { ok, lure: !ok && num(item.lure) && near(v, item.lure, Math.max(item.tol, 0.001)) };
      }
      default: return { ok: false };
    }
  }
  function kFactor(n) { return n < 10 ? 40 : n < 30 ? 28 : 20; }
  // registra la risposta all'esercizio corrente del turno
  function answer(lab, round, ans, now = Date.now()) {
    if (!round || round.done || round.answered) return null;
    const item = round.item;
    const res = check(item, ans);
    const st = lab.ratings[round.key];
    const d = num(item.diff) ? item.diff : DISCIPLINES[round.key].diff[item.level];
    const e = expected(st.r, d);
    const k = kFactor(st.n);
    const delta = Math.round(k * ((res.ok ? 1 : 0) - e));
    st.r = clamp(st.r + delta, 100, 2600);
    st.n += 1;
    if (res.ok) st.ok += 1;
    st.best = Math.max(st.best || 0, st.r);
    const ms = Math.max(0, now - round.itemAt);
    const rec = { t: now, k: round.key, lv: item.level, ok: res.ok, ms, d: delta };
    if (res.lure) rec.lure = true;
    lab.history.push(rec);
    if (lab.history.length > 1500) lab.history = lab.history.slice(-1500);
    round.results.push({ ok: res.ok, lure: Boolean(res.lure), delta, ms, level: item.level });
    round.answered = { ans, ...res, delta };
    logActivity(lab, round.key, now);
    return round.answered;
  }
  function next(lab, round, now = Date.now()) {
    if (!round || round.done) return null;
    round.idx += 1;
    round.answered = null;
    if (round.idx >= round.n) {
      round.done = true;
      const st = lab.ratings[round.key];
      st.hist.push({ t: now, r: st.r });
      if (st.hist.length > 200) st.hist = st.hist.slice(-200);
      return null;
    }
    const level = round.auto ? autoLevel(lab, round.key) : round.level;
    round.level = level;
    round.item = G.make(round.key, level, (round.seed + round.idx * 2654435761) >>> 0);
    round.itemAt = now;
    return round.item;
  }
  function summary(round) {
    const ok = round.results.filter((r) => r.ok).length;
    return { ok, total: round.results.length, lures: round.results.filter((r) => r.lure).length, delta: round.results.reduce((s, r) => s + r.delta, 0) };
  }

  /* ---- trappole */
  function trapById(id) { return TRAPS.find((t) => t.id === id) || null; }
  function trapAnswer(lab, id, ans, now = Date.now()) {
    const t = trapById(id);
    if (!t) return null;
    let ok;
    let lure = false;
    if (t.type === "choice") { ok = Number(ans) === t.answer; lure = num(t.lure) && Number(ans) === t.lure; }
    else {
      const v = Number(ans);
      ok = num(v) && Math.abs(v - t.answer) <= (t.tol || 0) + 1e-9;
      lure = !ok && num(t.lure) && Math.abs(v - t.lure) <= (t.tol || 0) + 1e-9;
    }
    const first = !lab.traps[id];
    if (first) lab.traps[id] = { t: now, ok, lure, ans };
    logActivity(lab, "trap", now);
    return { ok, lure, first };
  }

  /* ---- metodo */
  function markRead(lab, id, now = Date.now()) {
    if (!LESSONS.some((l) => l.id === id)) return false;
    lab.read[id] = now;
    logActivity(lab, "read", now);
    return true;
  }

  /* ---- giorno, profilo */
  function logActivity(lab, kind, now = Date.now()) {
    const k = dayKey(now);
    if (!lab.days.includes(k)) lab.days.push(k);
    if (lab.days.length > 400) lab.days = lab.days.slice(-400);
    lab.log.push({ t: now, kind });
    if (lab.log.length > 500) lab.log = lab.log.slice(-500);
  }
  function doneToday(lab, kind, now = Date.now()) {
    const k = dayKey(now);
    return lab.log.filter((x) => dayKey(x.t) === k && (!kind || x.kind === kind)).length;
  }
  function streak(lab, now = Date.now()) {
    const set = new Set(lab.days);
    let n = 0;
    let t = startOfDay(now);
    if (!set.has(dayKey(t))) t = addDays(t, -1);
    while (set.has(dayKey(t))) { n += 1; t = addDays(t, -1); }
    return n;
  }
  const ROTATION = ["crt", "matrix", "series", "grid", "knights", "syllo", "prob"]; // 0 = domenica
  function plan(lab, now = Date.now()) {
    const steps = [];
    const today = ROTATION[new Date(now).getDay()];
    const d1 = DISCIPLINES[today];
    steps.push({ id: "main", key: today, title: d1.label, detail: `Un turno di ${d1.round} ${d1.round === 1 ? "esercizio" : "esercizi"} al livello ${autoLevel(lab, today)}. ${d1.desc}`, minutes: today === "grid" ? 10 : 7, done: doneToday(lab, today, now) >= d1.round, go: { kind: "train", key: today } });
    // la disciplina piu' debole tra quelle gia' provate (o una nuova)
    const others = KEYS.filter((k) => k !== today);
    const untried = others.filter((k) => !lab.ratings[k].n);
    const weak = untried.length ? untried[0] : others.slice().sort((a, b) => lab.ratings[a].r - lab.ratings[b].r)[0];
    const d2 = DISCIPLINES[weak];
    steps.push({ id: "second", key: weak, title: d2.label, detail: untried.length ? `Non l'hai ancora provata: un turno per trovare il tuo livello.` : `È la disciplina dove sei più indietro: un turno.`, minutes: weak === "grid" ? 10 : 6, done: doneToday(lab, weak, now) >= d2.round, go: { kind: "train", key: weak } });
    const trap = TRAPS.find((t) => !lab.traps[t.id]);
    const lesson = LESSONS.find((l) => !lab.read[l.id]);
    if (trap) steps.push({ id: "trap", title: `Trappola: ${trap.title}`, detail: "Un esperimento classico sul ragionamento: rispondi d'istinto, poi scopri cosa hanno risposto le persone nello studio originale.", minutes: 3, done: doneToday(lab, "trap", now) > 0, go: { kind: "trap", id: trap.id } });
    else if (lesson) steps.push({ id: "lesson", title: `Metodo: ${lesson.title}`, detail: "Una lezione breve su come si ragiona bene, con esempi.", minutes: lesson.minutes || 6, done: doneToday(lab, "read", now) > 0, go: { kind: "lesson", id: lesson.id } });
    return steps;
  }
  function blend(value, n, need) {
    if (!n) return 35;
    const w = Math.min(1, n / need);
    return Math.round(35 + (value - 35) * w);
  }
  // da punteggio Elo a 0-100: 1000 (il partecipante tipico degli studi) = 50
  function scoreOf(r) { return clamp(Math.round(50 + (r - 1000) / 8), 5, 99); }
  function ratingValue(lab, key) { const st = lab.ratings[key]; return blend(scoreOf(st.r), st.n, 12); }
  function profile(lab, now = Date.now()) {
    const formal = (() => {
      const a = lab.ratings.syllo;
      const b = lab.ratings.knights;
      const n = a.n + b.n;
      if (!n) return 35;
      const r = (a.r * a.n + b.r * b.n) / n;
      return blend(scoreOf(r), n, 12);
    })();
    // riflessione: punteggio della disciplina, corretto con le trappole fatte (prima risposta)
    const tr = Object.values(lab.traps);
    let reflection = ratingValue(lab, "crt");
    if (tr.length) {
      const trapScore = (tr.filter((x) => x.ok).length / tr.length) * 100;
      reflection = lab.ratings.crt.n ? Math.round(reflection * 0.7 + trapScore * 0.3) : blend(trapScore, tr.length, 6);
    }
    return [
      { key: "abstract", label: "Ragionamento astratto", value: ratingValue(lab, "matrix") },
      { key: "pattern", label: "Serie e pattern", value: ratingValue(lab, "series") },
      { key: "deduction", label: "Deduzione", value: ratingValue(lab, "grid") },
      { key: "formal", label: "Logica formale", value: formal },
      { key: "probability", label: "Probabilità", value: ratingValue(lab, "prob") },
      { key: "reflection", label: "Riflessione", value: clamp(reflection, 0, 100) }
    ];
  }
  function trend(lab) {
    const tried = KEYS.filter((k) => lab.ratings[k].n);
    if (!tried.length) return "Base iniziale · fai il primo turno";
    const n = lab.history.length;
    const best = tried.slice().sort((a, b) => lab.ratings[b].r - lab.ratings[a].r)[0];
    return `${n} esercizi · punto forte ${DISCIPLINES[best].label.toLowerCase()} (${lab.ratings[best].r})`;
  }
  function lureRate(lab) {
    const list = lab.history.filter((h) => (h.k === "crt" || h.k === "prob") && !h.ok);
    const all = lab.history.filter((h) => h.k === "crt" || h.k === "prob");
    return all.length ? { lures: list.filter((h) => h.lure).length, wrong: list.length, total: all.length } : null;
  }

  /* ---- stato */
  function ensure(x) {
    const o = isObj(x) && x.version === VERSION ? x : {};
    const ratings = {};
    KEYS.forEach((k) => {
      const s = isObj(o.ratings) && isObj(o.ratings[k]) ? o.ratings[k] : {};
      ratings[k] = {
        r: num(s.r) ? clamp(s.r, 100, 2600) : START_RATING,
        n: Number.isInteger(s.n) && s.n >= 0 ? s.n : 0,
        ok: Number.isInteger(s.ok) && s.ok >= 0 ? s.ok : 0,
        best: num(s.best) ? s.best : 0,
        hist: Array.isArray(s.hist) ? s.hist.filter((h) => isObj(h) && num(h.t) && num(h.r)).slice(-200) : []
      };
    });
    const traps = {};
    if (isObj(o.traps)) Object.keys(o.traps).forEach((id) => { const t = o.traps[id]; if (isObj(t) && num(t.t) && typeof t.ok === "boolean") traps[id] = { t: t.t, ok: t.ok, lure: Boolean(t.lure), ans: t.ans }; });
    const read = {};
    if (isObj(o.read)) Object.keys(o.read).forEach((k) => { if (num(o.read[k])) read[k] = o.read[k]; });
    return {
      version: VERSION,
      ratings,
      history: Array.isArray(o.history) ? o.history.filter((h) => isObj(h) && num(h.t) && KEYS.includes(h.k) && typeof h.ok === "boolean").slice(-1500) : [],
      traps,
      read,
      days: Array.isArray(o.days) ? o.days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-400) : [],
      log: Array.isArray(o.log) ? o.log.filter((l) => isObj(l) && num(l.t) && typeof l.kind === "string").slice(-500) : []
    };
  }

  return {
    VERSION, DISCIPLINES, KEYS, START_RATING, TARGET_GAP, ROTATION, TRAPS, LESSONS,
    maxLevel, expected, autoLevel, makeRound, check, answer, next, summary,
    trapById, trapAnswer, markRead, logActivity, doneToday, streak, plan, profile, trend, scoreOf, lureRate, ensure,
    dayKey, addDays, startOfDay
  };
});
