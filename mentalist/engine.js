/*
 * Progetto A - Mentalista: motore (senza DOM).
 *
 *  - Casi (mentalist/cases.js): scena, persone, mosse contate, taccuino dei fatti, ricostruzione
 *    (colpevole, prove, movente, trappola) con un punteggio su 100. Conta il primo tentativo.
 *  - Allenamento, quattro discipline con un punteggio tipo Elo ciascuna (1000 = esercizio risolto
 *    una volta su due):
 *      kim      osservazione (gioco di Kim, mentalist/gen.js)
 *      liar     chi mente? (deduzione, mentalist/gen.js)
 *      read     lettura: tecniche dei finti sensitivi e inferenze dai dettagli (mentalist/reading.js)
 *      interro  interrogatorio con la tecnica delle prove al momento giusto (mentalist/interro.js)
 *  - Metodo (mentalist/data.js): lezioni con due domande di verifica (conta la prima risposta).
 *  - Programma del giorno, profilo a esagono per il quadro, storico.
 * Stato: state.mentalistLab.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MentalistEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";
  const req = (name, file) => {
    if (root[name]) return root[name];
    if (typeof require === "function") { try { return require(file); } catch (e) { return {}; } }
    return {};
  };
  const G = req("MentalistGen", "./gen.js");
  const I = req("MentalistInterro", "./interro.js");
  const R = req("MentalistReading", "./reading.js");
  const C = req("MentalistCases", "./cases.js");
  const D = req("MentalistData", "./data.js");
  const CASES = (C && C.CASES) || [];
  const LESSONS = (D && D.LESSONS) || [];

  const VERSION = 1;
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  function startOfDay(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function addDays(t, n) { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); }
  function dayKey(t) { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

  const READ_DIFF = [0, 640, 840, 1040];
  const DRILLS = {
    kim: { key: "kim", label: "Osservazione", desc: "Guarda il tavolo per qualche secondo, poi trova che cosa è cambiato. È il gioco di Kim, l'allenamento all'attenzione degli esploratori.", round: 5, diff: (G && G.KIM_DIFF) || [0, 600] },
    liar: { key: "liar", label: "Chi mente?", desc: "Un furto, i sospettati, una frase a testa e una regola su chi mente: ricava il colpevole.", round: 4, diff: (G && G.LIAR_DIFF) || [0, 600] },
    read: { key: "read", label: "Lettura", desc: "Riconosci i trucchi dei finti sensitivi e capisci quanto dice davvero un dettaglio su una persona.", round: 6, diff: READ_DIFF },
    interro: { key: "interro", label: "Interrogatorio", desc: "Hai tre prove e un sospettato: fai le domande giuste prima di mostrarle e decidi se è colpevole.", round: 1, diff: (I && I.DIFF) || [0, 640] }
  };
  const KEYS = Object.keys(DRILLS);
  const START_RATING = 900;
  const TARGET_GAP = 80;

  function maxLevel(key) { return DRILLS[key].diff.length - 1; }
  function expected(r, d) { return 1 / (1 + 10 ** ((d - r) / 400)); }
  function autoLevel(lab, key) {
    const r = lab.ratings[key].r;
    const d = DRILLS[key].diff;
    let best = 1;
    for (let lv = 1; lv < d.length; lv += 1) if (Math.abs(d[lv] - (r - TARGET_GAP)) < Math.abs(d[best] - (r - TARGET_GAP))) best = lv;
    return best;
  }

  /* ---- esercizi */
  function makeItem(key, level, seed, used) {
    if (key === "kim") return G.makeKim(level, seed);
    if (key === "liar") return G.makeLiar(level, seed);
    if (key === "interro") return I.start(level, seed);
    if (key === "read") return R.pickItem(level, seed, used || []);
    return null;
  }
  function makeRound(lab, key, opts = {}) {
    const d = DRILLS[key];
    if (!d) return null;
    const level = opts.level ? clamp(opts.level | 0, 1, maxLevel(key)) : autoLevel(lab, key);
    const seed = num(opts.seed) ? opts.seed >>> 0 : (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const round = { key, level, auto: !opts.level, seed, n: opts.n || d.round, idx: 0, used: [], results: [], startR: lab.ratings[key].r, startedAt: Date.now(), itemAt: Date.now(), done: false };
    round.item = makeItem(key, level, seed, round.used);
    if (key === "read" && round.item) round.used.push(round.item.id);
    return round;
  }
  function check(item, ans) {
    if (!item) return { ok: false };
    if (item.kind === "kim") return G.kimCheck(item, ans);
    if (item.kind === "liar") return { ok: Number(ans) === item.culprit };
    if (item.kind === "read") return { ok: Number(ans) === item.answer };
    if (item.kind === "interro") {
      const v = I.verdict(item, ans === true || ans === "guilty");
      return v ? { ok: v.ok, technique: v.technique, notes: v.notes, contradictions: v.contradictions } : { ok: false };
    }
    return { ok: false };
  }
  function kFactor(n) { return n < 10 ? 40 : n < 30 ? 28 : 20; }
  function answer(lab, round, ans, now = Date.now()) {
    if (!round || round.done || round.answered) return null;
    const item = round.item;
    const res = check(item, ans);
    const st = lab.ratings[round.key];
    const d = num(item.diff) ? item.diff : DRILLS[round.key].diff[item.level];
    const e = expected(st.r, d);
    const k = kFactor(st.n);
    const delta = Math.round(k * ((res.ok ? 1 : 0) - e));
    st.r = clamp(st.r + delta, 100, 2600);
    st.n += 1;
    if (res.ok) st.ok += 1;
    st.best = Math.max(st.best || 0, st.r);
    const ms = Math.max(0, now - round.itemAt);
    const rec = { t: now, k: round.key, lv: item.level, ok: res.ok, ms, d: delta };
    if (num(res.technique)) { rec.tech = res.technique; lab.tech.push(res.technique); if (lab.tech.length > 100) lab.tech = lab.tech.slice(-100); }
    lab.history.push(rec);
    if (lab.history.length > 1500) lab.history = lab.history.slice(-1500);
    round.results.push({ ok: res.ok, delta, ms, level: item.level });
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
    round.item = makeItem(round.key, level, (round.seed + round.idx * 2654435761) >>> 0, round.used);
    if (round.key === "read" && round.item) round.used.push(round.item.id);
    round.itemAt = now;
    return round.item;
  }
  function summary(round) {
    const ok = round.results.filter((r) => r.ok).length;
    return { ok, total: round.results.length, delta: round.results.reduce((s, r) => s + r.delta, 0) };
  }

  /* ---- casi */
  function caseById(id) { return CASES.find((c) => c.id === id) || null; }
  function totalActions(c) { return c.scene.length + c.people.length + c.people.reduce((s, p) => s + p.ask.length, 0); }
  // l'ordine di moventi e trappole si mescola a ogni partita (la risposta giusta non e' sempre la prima)
  function mix(n, rand) {
    const a = [...Array(n).keys()];
    for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function startCase(id, rand = Math.random) {
    const c = caseById(id);
    if (!c) return null;
    return { id, used: 0, seen: {}, facts: [], log: [], phase: "brief", startedAt: Date.now(), order: { motives: mix(c.motives.length, rand), traps: mix(c.traps.length, rand) } };
  }
  // kind: scene | look | ask
  function caseAct(run, kind, a, b) {
    const c = run && caseById(run.id);
    if (!c || run.phase === "result") return null;
    const key = kind === "ask" ? `ask:${a}:${b}` : `${kind}:${a}`;
    if (run.seen[key]) return null;
    if (run.used >= c.budget) return { blocked: true };
    let text = "";
    let fact = null;
    let title = "";
    if (kind === "scene") {
      const s = c.scene.find((x) => x.id === a);
      if (!s) return null;
      title = s.name; text = s.text; fact = s.fact || null;
    } else if (kind === "look") {
      const p = c.people.find((x) => x.id === a);
      if (!p) return null;
      title = `Osservi ${p.name}`; text = p.look; fact = p.lookFact || null;
    } else if (kind === "ask") {
      const p = c.people.find((x) => x.id === a);
      const q = p && p.ask.find((x) => x.id === b);
      if (!q) return null;
      title = `${p.name}: «${q.q}»`; text = q.a; fact = q.fact || null;
    } else return null;
    run.seen[key] = true;
    run.used += 1;
    if (run.phase === "brief") run.phase = "inv";
    const isNew = fact && !run.facts.includes(fact);
    if (isNew) run.facts.push(fact);
    const entry = { key, kind, title, text, fact, isNew: Boolean(isNew) };
    run.log.push(entry);
    return entry;
  }
  function caseScore(c, ans) {
    const culpritOk = ans.culprit === c.culprit;
    const chosen = Array.isArray(ans.keys) ? [...new Set(ans.keys)].slice(0, c.need) : [];
    const goodKeys = chosen.filter((k) => c.keys.includes(k));
    const trap = c.traps[ans.trap];
    const trapOk = Boolean(trap && trap.ok);
    const motiveOk = Number(ans.motive) === c.motive;
    const parts = {
      culprit: culpritOk ? 40 : 0,
      keys: culpritOk ? Math.round((30 * goodKeys.length) / c.need) : 0,
      motive: culpritOk && motiveOk ? 10 : 0,
      trap: trapOk ? 20 : 0
    };
    const total = parts.culprit + parts.keys + parts.motive + parts.trap;
    return { total, parts, culpritOk, goodKeys, chosen, trapOk, motiveOk };
  }
  function solveCase(lab, run, ans, now = Date.now()) {
    const c = run && caseById(run.id);
    if (!c || run.phase === "result") return null;
    const res = caseScore(c, ans || {});
    run.phase = "result";
    run.result = res;
    run.answer = ans;
    const rec = lab.cases[c.id];
    if (!rec) lab.cases[c.id] = { first: res.total, best: res.total, tries: 1, t: now, solved: res.culpritOk, used: run.used };
    else { rec.best = Math.max(rec.best, res.total); rec.tries += 1; rec.t = now; rec.solved = rec.solved || res.culpritOk; }
    res.first = !rec;
    logActivity(lab, "case", now);
    return res;
  }

  /* ---- metodo */
  function lessonById(id) { return LESSONS.find((l) => l.id === id) || null; }
  function markRead(lab, id, now = Date.now()) {
    if (!lessonById(id)) return false;
    lab.read[id] = now;
    logActivity(lab, "read", now);
    return true;
  }
  function checkLesson(lab, id, qi, ans, now = Date.now()) {
    const l = lessonById(id);
    const q = l && l.checks && l.checks[qi];
    if (!q) return null;
    const ok = Number(ans) === q.answer;
    const key = `${id}:${qi}`;
    const first = !(key in lab.checks);
    if (first) lab.checks[key] = ok;
    logActivity(lab, "check", now);
    return { ok, first };
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
  const ROTATION = ["read", "kim", "liar", "interro", "kim", "liar", "read"]; // 0 = domenica
  function nextCase(lab) { return CASES.find((c) => !lab.cases[c.id]) || null; }
  function plan(lab, now = Date.now()) {
    const steps = [];
    const today = ROTATION[new Date(now).getDay()];
    const d1 = DRILLS[today];
    const need1 = today === "interro" ? 2 : d1.round;
    steps.push({ id: "main", key: today, title: d1.label, detail: today === "interro" ? "Due interrogatori: racconto libero, domande, prove alla fine, verdetto." : `Un turno di ${d1.round} esercizi al livello ${autoLevel(lab, today)}. ${d1.desc}`, minutes: today === "interro" ? 10 : 6, done: doneToday(lab, today, now) >= need1, go: { kind: "train", key: today } });
    const c = nextCase(lab);
    if (c) steps.push({ id: "case", title: `Caso: ${c.title}`, detail: `${c.place}. Esamina, osserva, interroga con ${c.budget} mosse, poi ricostruisci chi è stato e come chiuderlo.`, minutes: 12, done: doneToday(lab, "case", now) > 0, go: { kind: "case", id: c.id } });
    else {
      const others = KEYS.filter((k) => k !== today);
      const weak = others.slice().sort((a, b) => lab.ratings[a].r - lab.ratings[b].r)[0];
      steps.push({ id: "second", key: weak, title: DRILLS[weak].label, detail: "Hai chiuso tutti i casi: un turno nella disciplina dove sei più indietro.", minutes: 6, done: doneToday(lab, weak, now) >= (weak === "interro" ? 1 : DRILLS[weak].round), go: { kind: "train", key: weak } });
    }
    const lesson = LESSONS.find((l) => !lab.read[l.id]);
    if (lesson) steps.push({ id: "lesson", title: `Metodo: ${lesson.title}`, detail: "Una lezione breve con le ricerche vere, e due domande per verificare.", minutes: lesson.minutes || 6, done: doneToday(lab, "read", now) > 0, go: { kind: "lesson", id: lesson.id } });
    return steps;
  }
  function blend(value, n, need) {
    if (!n) return 35;
    const w = Math.min(1, n / need);
    return Math.round(35 + (value - 35) * w);
  }
  function scoreOf(r) { return clamp(Math.round(50 + (r - 1000) / 8), 5, 99); }
  function ratingValue(lab, key) { const st = lab.ratings[key]; return blend(scoreOf(st.r), st.n, 12); }
  function profile(lab) {
    const caseRecs = Object.values(lab.cases);
    const casesVal = caseRecs.length ? blend(caseRecs.reduce((s, x) => s + x.first, 0) / caseRecs.length, caseRecs.length, 4) : 35;
    const checks = Object.values(lab.checks);
    const methodVal = checks.length ? blend((checks.filter(Boolean).length / checks.length) * 100, checks.length, 10) : 35;
    let interro = ratingValue(lab, "interro");
    if (lab.tech.length) {
      const avg = lab.tech.reduce((s, x) => s + x, 0) / lab.tech.length;
      interro = Math.round(interro * 0.7 + blend(avg, lab.tech.length, 6) * 0.3);
    }
    return [
      { key: "observation", label: "Osservazione", value: ratingValue(lab, "kim") },
      { key: "deduction", label: "Deduzione", value: ratingValue(lab, "liar") },
      { key: "reading", label: "Lettura", value: ratingValue(lab, "read") },
      { key: "interview", label: "Interrogatorio", value: clamp(interro, 0, 100) },
      { key: "cases", label: "Casi", value: clamp(casesVal, 0, 100) },
      { key: "method", label: "Metodo", value: clamp(methodVal, 0, 100) }
    ];
  }
  function trend(lab) {
    const solved = Object.values(lab.cases).filter((x) => x.solved).length;
    const n = lab.history.length;
    if (!n && !Object.keys(lab.cases).length) return "Base iniziale · apri il primo caso";
    return `${solved}/${CASES.length} casi risolti · ${n} esercizi`;
  }
  function techAverage(lab) { return lab.tech.length ? Math.round(lab.tech.reduce((s, x) => s + x, 0) / lab.tech.length) : null; }

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
    const cases = {};
    if (isObj(o.cases)) Object.keys(o.cases).forEach((id) => {
      const r = o.cases[id];
      if (caseById(id) && isObj(r) && num(r.first)) cases[id] = { first: clamp(r.first, 0, 100), best: num(r.best) ? clamp(r.best, 0, 100) : r.first, tries: Number.isInteger(r.tries) && r.tries > 0 ? r.tries : 1, t: num(r.t) ? r.t : 0, solved: Boolean(r.solved), used: num(r.used) ? r.used : 0 };
    });
    const read = {};
    if (isObj(o.read)) Object.keys(o.read).forEach((k) => { if (num(o.read[k])) read[k] = o.read[k]; });
    const checks = {};
    if (isObj(o.checks)) Object.keys(o.checks).forEach((k) => { if (typeof o.checks[k] === "boolean" && /^[\w-]+:\d+$/.test(k)) checks[k] = o.checks[k]; });
    return {
      version: VERSION,
      ratings,
      history: Array.isArray(o.history) ? o.history.filter((h) => isObj(h) && num(h.t) && KEYS.includes(h.k) && typeof h.ok === "boolean").slice(-1500) : [],
      tech: Array.isArray(o.tech) ? o.tech.filter(num).map((v) => clamp(v, 0, 100)).slice(-100) : [],
      cases,
      read,
      checks,
      days: Array.isArray(o.days) ? o.days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-400) : [],
      log: Array.isArray(o.log) ? o.log.filter((l) => isObj(l) && num(l.t) && typeof l.kind === "string").slice(-500) : []
    };
  }

  return {
    VERSION, DRILLS, KEYS, START_RATING, TARGET_GAP, ROTATION, CASES, LESSONS,
    maxLevel, expected, autoLevel, makeRound, check, answer, next, summary,
    caseById, totalActions, startCase, caseAct, caseScore, solveCase, nextCase,
    lessonById, markRead, checkLesson, logActivity, doneToday, streak, plan, profile, trend, scoreOf, techAverage, ensure,
    dayKey, addDays, startOfDay
  };
});
