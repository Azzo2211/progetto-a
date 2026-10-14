/*
 * Progetto A - Difesa: motore del modulo (senza DOM, testabile con Node).
 *
 * Tre allenamenti, un profilo calcolato da dati veri (non da clic):
 * - Programma: 12 sessioni guidate in 4 fasi. Si sbloccano in ordine.
 *   L'autovalutazione a fine sessione (Si' / A volte / No) pesa sulla Tecnica.
 * - Riflessi: tre prove a protocollo fisso, cosi' i risultati sono confrontabili:
 *   Semaforo (vai/fermo), Direzione (scelta tra 4 risposte), Periferica (campo visivo).
 *   Risposte sotto i 120 ms sono anticipi, non riflessi.
 * - Situazioni: decisioni a tempo con ripasso distanziato delle risposte sbagliate.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.DefenseEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 1;
  const DAY = 24 * 60 * 60 * 1000;
  const MIN_RT = 120;          // sotto: anticipo
  const GO_WINDOW = 1000;      // ms per rispondere al "vai"
  const SITU_INTERVALS = [0, 1, 3, 8, 21, 45];

  const PHASES = [
    { n: 1, title: "Fondamenta", sub: "Postura, distanza, movimento" },
    { n: 2, title: "Proteggersi", sub: "Parate e coperture" },
    { n: 3, title: "Liberarsi", sub: "Prese al polso, al petto, da dietro" },
    { n: 4, title: "Uscire", sub: "Cadute, terra, sequenza di uscita" }
  ];

  const CATEGORIES = {
    prevenzione: { label: "Prevenzione", text: "Accorgersi prima ed evitare", group: "prevenzione" },
    confini: { label: "Confini e calma", text: "Fermare un'escalation con parole e postura", group: "decisione" },
    fuga: { label: "Uscire", text: "Uscite, folla, dove andare", group: "prevenzione" },
    rapina: { label: "Oggetti e rapine", text: "Le cose si ricomprano", group: "decisione" },
    legge: { label: "La legge", text: "Legittima difesa, proporzione, strumenti", group: "decisione" },
    dopo: { label: "Dopo", text: "112, referto, testimoni, denuncia", group: "decisione" }
  };

  const DIMENSIONS = [
    { key: "prevenzione", label: "Prevenzione", text: "Accorgersi prima: situazioni di prevenzione e uscita, più la prova Periferica." },
    { key: "decisione", label: "Decisione", text: "Scegliere bene sotto tempo: calmare, cedere gli oggetti, la legge, il dopo." },
    { key: "riflessi", label: "Riflessi", text: "Tempo di reazione mediano nelle prove Semaforo e Direzione." },
    { key: "controllo", label: "Controllo", text: "Non partire a vuoto: niente risposte al rosso, anticipi o direzioni sbagliate." },
    { key: "tecnica", label: "Tecnica", text: "Sessioni del programma completate e qualità dell'autovalutazione. Cala se smetti." },
    { key: "costanza", label: "Costanza", text: "Giorni di allenamento nelle ultime due settimane e sessioni nell'ultimo mese." }
  ];

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const round = (v) => Math.round(v);

  function dayKey(time) {
    const d = new Date(time);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function addDays(time, n) {
    const d = new Date(time);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d.getTime();
  }

  function endOfDay(time) {
    const d = new Date(time);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }

  function median(list) {
    if (!list.length) return null;
    const s = [...list].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  // Generatore pseudo-casuale con seme (per i test e per piani ripetibili).
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >>> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  function shuffle(list, rand) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Stato ----------
  function ensureLab(raw) {
    const lab = raw && typeof raw === "object" && raw.version === VERSION ? raw : { version: VERSION };
    if (!lab.sessions || typeof lab.sessions !== "object") lab.sessions = {};
    if (!lab.reflex || typeof lab.reflex !== "object") lab.reflex = {};
    ["semaforo", "direzione", "periferica"].forEach((k) => { if (!Array.isArray(lab.reflex[k])) lab.reflex[k] = []; });
    if (!lab.situations || typeof lab.situations !== "object") lab.situations = {};
    if (!Array.isArray(lab.days)) lab.days = [];
    if (!Array.isArray(lab.log)) lab.log = [];
    return lab;
  }

  function markDay(lab, now) {
    const key = dayKey(now);
    if (!lab.days.includes(key)) lab.days.push(key);
    if (lab.days.length > 200) lab.days = lab.days.slice(-200);
  }

  function addLog(lab, entry) {
    lab.log.push(entry);
    if (lab.log.length > 300) lab.log = lab.log.slice(-300);
  }

  // ---------- Programma ----------
  function sessionState(lab, id) {
    return lab.sessions[id] || { done: 0, last: 0, quality: null, best: null };
  }

  function isUnlocked(lab, sessions, index) {
    if (index <= 0) return true;
    const prev = sessions[index - 1];
    return !!prev && sessionState(lab, prev.id).done > 0;
  }

  function nextSessionIndex(lab, sessions) {
    const i = sessions.findIndex((s) => sessionState(lab, s.id).done === 0);
    return i === -1 ? null : i;
  }

  function phaseProgress(lab, sessions, phase) {
    const list = sessions.filter((s) => s.phase === phase);
    const done = list.filter((s) => sessionState(lab, s.id).done > 0).length;
    return { done, total: list.length, complete: list.length > 0 && done === list.length };
  }

  function currentPhase(lab, sessions) {
    const i = nextSessionIndex(lab, sessions);
    return i == null ? PHASES.length : sessions[i].phase;
  }

  /*
   * answers: per ogni domanda di autovalutazione 2 (Si'), 1 (A volte), 0 (No).
   * La qualita' della sessione e' la media 0-1. Si salva la media mobile delle
   * ultime ripetizioni, non il massimo: ripetere non "lava" un risultato scarso.
   */
  function recordSession(lab, session, answers, now = Date.now()) {
    const valid = (answers || []).filter((a) => a === 0 || a === 1 || a === 2);
    const quality = valid.length ? valid.reduce((s, a) => s + a, 0) / (valid.length * 2) : 0;
    const st = Object.assign({ done: 0, last: 0, quality: null, best: null, history: [] }, lab.sessions[session.id] || {});
    const first = st.done === 0;
    st.done += 1;
    st.last = now;
    st.history = [...(st.history || []), round(quality * 100) / 100].slice(-5);
    st.quality = st.history.reduce((s, q) => s + q, 0) / st.history.length;
    st.best = Math.max(st.best || 0, quality);
    lab.sessions[session.id] = st;
    markDay(lab, now);
    addLog(lab, { t: now, kind: "session", id: session.id, q: round(quality * 100) });
    return { first, quality };
  }

  // ---------- Riflessi: piani delle prove ----------
  // Semaforo: 24 prove, 18 "vai" e 6 "fermo", mai piu' di 2 "fermo" di fila.
  function planSemaforo(rand) {
    let order;
    do {
      order = shuffle([...Array(18).fill("go"), ...Array(6).fill("stop")], rand);
    } while (order.join(",").includes("stop,stop,stop") || order[0] === "stop");
    return order.map((kind) => ({ kind, wait: round(900 + rand() * 1400) }));
  }

  // Direzione: 20 prove, 5 per direzione, mai la stessa 3 volte di fila.
  const DIRECTIONS = ["left", "right", "up", "down"];
  function planDirezione(rand) {
    let order;
    do {
      order = shuffle(DIRECTIONS.flatMap((d) => Array(5).fill(d)), rand);
    } while (order.some((d, i) => i > 1 && d === order[i - 1] && d === order[i - 2]));
    return order.map((dir) => ({ dir, wait: round(800 + rand() * 1200) }));
  }

  // Periferica: 14 prove. Al centro una forma (cerchio o quadrato), in una delle 8
  // posizioni un punto; la durata scende quando rispondi giusto a entrambe.
  function planPeriferica(rand) {
    return Array.from({ length: 14 }, () => ({ pos: Math.floor(rand() * 8), shape: rand() < 0.5 ? "circle" : "square" }));
  }

  // Durata del lampo per la prova successiva (scala 1-su/1-giu', 50-400 ms).
  function nextFlash(current, bothRight) {
    return clamp(bothRight ? current - 30 : current + 40, 50, 400);
  }

  // ---------- Riflessi: punteggi ----------
  /*
   * trials: [{ kind: "go"|"stop", rt: ms|null, early: bool }]
   * rt null = nessuna risposta. early = risposta prima dello stimolo o sotto 120 ms.
   */
  function scoreSemaforo(trials) {
    const go = trials.filter((t) => t.kind === "go");
    const stop = trials.filter((t) => t.kind === "stop");
    const valid = go.filter((t) => !t.early && t.rt != null && t.rt >= MIN_RT && t.rt <= GO_WINDOW).map((t) => t.rt);
    const omissions = go.filter((t) => !t.early && (t.rt == null || t.rt > GO_WINDOW)).length;
    const commissions = stop.filter((t) => t.rt != null && !t.early).length;
    const early = trials.filter((t) => t.early).length;
    const med = median(valid);
    const speed = med == null ? 0 : clamp(round(100 - (med - 250) * (90 / 300)), 5, 100);
    const control = clamp(100 - commissions * 14 - early * 8 - omissions * 5, 0, 100);
    return { median: med == null ? null : round(med), valid: valid.length, omissions, commissions, early, speed, control, n: trials.length };
  }

  // trials: [{ dir, answer: dir|null, rt, early }]
  function scoreDirezione(trials) {
    const right = trials.filter((t) => !t.early && t.answer === t.dir && t.rt != null && t.rt >= MIN_RT);
    const wrong = trials.filter((t) => !t.early && t.answer != null && t.answer !== t.dir).length;
    const missed = trials.filter((t) => !t.early && t.answer == null).length;
    const early = trials.filter((t) => t.early).length;
    const med = median(right.map((t) => t.rt));
    const accuracy = trials.length ? right.length / trials.length : 0;
    const speed = med == null ? 0 : clamp(round(100 - (med - 400) * (90 / 500)), 5, 100);
    const control = clamp(round(accuracy * 100 - early * 6), 0, 100);
    return { median: med == null ? null : round(med), accuracy: round(accuracy * 100), wrong, missed, early, speed, control, n: trials.length };
  }

  // trials: [{ flash, shapeOk, posOk }]
  function scorePeriferica(trials) {
    if (!trials.length) return { threshold: null, accuracy: 0, score: 0, n: 0 };
    const both = trials.filter((t) => t.shapeOk && t.posOk).length;
    const pos = trials.filter((t) => t.posOk).length;
    // soglia: media delle durate delle ultime 6 prove (la scala si e' assestata)
    const tail = trials.slice(-6).map((t) => t.flash);
    const threshold = round(tail.reduce((s, v) => s + v, 0) / tail.length);
    const accuracy = round((pos / trials.length) * 100);
    const thrScore = clamp(100 - (threshold - 60) * (90 / 300), 5, 100);
    const score = round(thrScore * 0.6 + (both / trials.length) * 100 * 0.4);
    return { threshold, accuracy, both: round((both / trials.length) * 100), score, n: trials.length };
  }

  function recordReflex(lab, kind, result, now = Date.now()) {
    if (!lab.reflex[kind]) lab.reflex[kind] = [];
    const entry = Object.assign({ t: now }, result);
    lab.reflex[kind].push(entry);
    if (lab.reflex[kind].length > 30) lab.reflex[kind] = lab.reflex[kind].slice(-30);
    markDay(lab, now);
    addLog(lab, { t: now, kind: "reflex", test: kind });
    return entry;
  }

  function reflexBest(lab, kind) {
    const list = lab.reflex[kind] || [];
    if (kind === "periferica") {
      const ok = list.filter((r) => r.threshold != null);
      return ok.length ? Math.min(...ok.map((r) => r.threshold)) : null;
    }
    const ok = list.filter((r) => r.median != null);
    return ok.length ? Math.min(...ok.map((r) => r.median)) : null;
  }

  // ---------- Situazioni ----------
  function situState(lab, id) {
    return lab.situations[id] || { box: 0, due: 0, seen: 0, points: 0, last: 0, lastScore: null };
  }

  function dueSituations(lab, situations, now = Date.now()) {
    const end = endOfDay(now);
    return situations.filter((s) => {
      const st = lab.situations[s.id];
      return st && st.seen > 0 && st.due <= end;
    });
  }

  /*
   * Un turno: prima le situazioni da rivedere (sbagliate), poi le nuove dei
   * livelli piu' bassi non ancora visti, variando le categorie.
   */
  function pickTurn(lab, situations, n = 6, now = Date.now(), rand = Math.random) {
    const due = shuffle(dueSituations(lab, situations, now), rand).sort((a, b) => situState(lab, a.id).box - situState(lab, b.id).box);
    const fresh = situations.filter((s) => !lab.situations[s.id] || !lab.situations[s.id].seen);
    const picked = due.slice(0, Math.min(n, Math.ceil(n / 2) + (fresh.length ? 0 : n)));
    const minLevel = fresh.length ? Math.min(...fresh.map((s) => s.level)) : 1;
    const pool = shuffle(fresh.filter((s) => s.level <= minLevel + 1), rand).sort((a, b) => a.level - b.level);
    const used = new Set(picked.map((s) => s.category));
    // una per categoria finche' possibile
    for (const s of pool) {
      if (picked.length >= n) break;
      if (!used.has(s.category)) { picked.push(s); used.add(s.category); }
    }
    for (const s of pool) {
      if (picked.length >= n) break;
      if (!picked.includes(s)) picked.push(s);
    }
    // se mancano ancora: le meno solide tra quelle gia' viste
    if (picked.length < n) {
      const rest = shuffle(situations.filter((s) => !picked.includes(s)), rand).sort((a, b) => situState(lab, a.id).box - situState(lab, b.id).box);
      for (const s of rest) { if (picked.length >= n) break; picked.push(s); }
    }
    return shuffle(picked.slice(0, n), rand).map((s) => s.id);
  }

  // score: 2 migliore, 1 accettabile, 0 sbagliata o tempo scaduto.
  function recordSituation(lab, situation, score, { timedOut = false, now = Date.now() } = {}) {
    const st = Object.assign({ box: 0, due: 0, seen: 0, points: 0, last: 0, lastScore: null, timeouts: 0 }, lab.situations[situation.id] || {});
    const firstTime = st.seen === 0;
    st.seen += 1;
    st.points += score;
    st.last = now;
    st.lastScore = score;
    if (timedOut) st.timeouts = (st.timeouts || 0) + 1;
    if (score === 2) st.box = clamp(st.box + 1, 1, SITU_INTERVALS.length - 1);
    else if (score === 1) st.box = clamp(st.box, 1, 2);
    else st.box = 1;
    st.due = score === 2 ? addDays(now, SITU_INTERVALS[st.box]) : addDays(now, score === 1 ? 2 : 1);
    lab.situations[situation.id] = st;
    markDay(lab, now);
    addLog(lab, { t: now, kind: "situ", id: situation.id, cat: situation.category, s: score, first: firstTime, to: timedOut });
    return st;
  }

  // Precisione per categoria dalle risposte registrate (tutte, anche i ripassi).
  function categoryStats(lab) {
    const stats = {};
    Object.keys(CATEGORIES).forEach((k) => { stats[k] = { points: 0, max: 0, n: 0 }; });
    lab.log.filter((e) => e.kind === "situ" && stats[e.cat]).forEach((e) => {
      stats[e.cat].points += e.s;
      stats[e.cat].max += 2;
      stats[e.cat].n += 1;
    });
    return stats;
  }

  // ---------- Profilo ----------
  function smooth(prior, k, values) {
    if (!values.length) return prior;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    return (prior * k + mean * values.length) / (k + values.length);
  }

  function lastN(list, n) { return list.slice(-n); }

  function profile(lab, sessions = [], now = Date.now()) {
    lab = ensureLab(lab);
    // Riflessi: velocita' nelle ultime 5 prove di Semaforo e Direzione
    const sem = lastN(lab.reflex.semaforo.filter((r) => r.median != null), 5);
    const dir = lastN(lab.reflex.direzione.filter((r) => r.median != null), 5);
    const speedVals = [...sem.map((r) => r.speed), ...dir.map((r) => r.speed * 0.9 + 10)];
    const riflessi = smooth(25, 2, speedVals);
    const controlVals = [...lastN(lab.reflex.semaforo, 5).map((r) => r.control), ...lastN(lab.reflex.direzione, 5).map((r) => r.control)];
    const controllo = smooth(30, 2, controlVals);

    // Situazioni per gruppo (risposte come frazione 0-100)
    const situ = lab.log.filter((e) => e.kind === "situ");
    const groupVals = (group) => situ.filter((e) => CATEGORIES[e.cat] && CATEGORIES[e.cat].group === group).slice(-40).map((e) => e.s * 50);
    const peri = lastN(lab.reflex.periferica.filter((r) => r.n), 5).map((r) => r.score);
    const prevSitu = smooth(30, 4, groupVals("prevenzione"));
    const prevenzione = peri.length ? prevSitu * 0.75 + smooth(30, 2, peri) * 0.25 : prevSitu;
    const decisione = smooth(30, 4, groupVals("decisione"));

    // Tecnica: avanzamento nel programma + qualita' dichiarata, con calo se ti fermi
    const states = sessions.map((s) => sessionState(lab, s.id)).filter((s) => s.done > 0);
    const total = Math.max(1, sessions.length);
    const progress = states.length / total;
    const reps = states.reduce((sum, s) => sum + s.done, 0);
    const quality = states.length ? states.reduce((sum, s) => sum + (s.quality || 0), 0) / states.length : 0;
    const lastSession = states.length ? Math.max(...states.map((s) => s.last)) : 0;
    const idle = lastSession ? Math.max(0, (now - lastSession) / DAY - 10) : 0;
    let tecnica = states.length ? 12 + progress * 50 + quality * 38 * Math.min(1, reps / 6) - Math.min(25, idle) : 10;

    // Costanza: giorni di allenamento negli ultimi 14 giorni e sessioni negli ultimi 28
    const days14 = new Set();
    for (let i = 0; i < 14; i += 1) days14.add(dayKey(addDays(now, -i)));
    const activeDays = lab.days.filter((d) => days14.has(d)).length;
    const sessions28 = lab.log.filter((e) => e.kind === "session" && e.t >= addDays(now, -27)).length;
    const costanza = activeDays || sessions28 ? Math.min(80, activeDays * 8) + 20 * Math.min(1, sessions28 / 8) : 0;

    tecnica = clamp(tecnica, 0, 100);
    return {
      prevenzione: round(clamp(prevenzione, 0, 100)),
      decisione: round(clamp(decisione, 0, 100)),
      riflessi: round(clamp(riflessi, 0, 100)),
      controllo: round(clamp(controllo, 0, 100)),
      tecnica: round(tecnica),
      costanza: round(clamp(costanza, 0, 100))
    };
  }

  function totalScore(p) {
    const keys = DIMENSIONS.map((d) => d.key);
    return round(keys.reduce((s, k) => s + (p[k] || 0), 0) / keys.length);
  }

  function weakest(p) {
    return DIMENSIONS.map((d) => ({ key: d.key, label: d.label, value: p[d.key] })).sort((a, b) => a.value - b.value)[0];
  }

  /*
   * Prossimo passo consigliato: la sessione successiva se non l'hai fatta oggi,
   * altrimenti le situazioni da rivedere, altrimenti la prova di riflessi piu' vecchia.
   */
  function nextAction(lab, data, now = Date.now()) {
    lab = ensureLab(lab);
    const sessions = data.sessions || [];
    const situations = data.situations || [];
    const today = dayKey(now);
    const doneToday = lab.log.some((e) => e.kind === "session" && dayKey(e.t) === today);
    const idx = nextSessionIndex(lab, sessions);
    if (idx != null && !doneToday) return { kind: "session", index: idx, id: sessions[idx].id };
    const due = dueSituations(lab, situations, now);
    if (due.length >= 3) return { kind: "situations", count: due.length };
    const tests = ["semaforo", "direzione", "periferica"].map((k) => {
      const list = lab.reflex[k];
      return { k, last: list.length ? list[list.length - 1].t : 0 };
    }).sort((a, b) => a.last - b.last);
    if (!tests[0].last || now - tests[0].last > 2 * DAY) return { kind: "reflex", test: tests[0].k };
    const fresh = situations.filter((s) => !lab.situations[s.id]);
    if (fresh.length) return { kind: "situations", count: Math.min(6, fresh.length), fresh: true };
    if (idx != null) return { kind: "session", index: idx, id: sessions[idx].id, tomorrow: true };
    return { kind: "review" };
  }

  return {
    VERSION, DAY, MIN_RT, GO_WINDOW, PHASES, CATEGORIES, DIMENSIONS, DIRECTIONS, SITU_INTERVALS,
    dayKey, addDays, endOfDay, median, rng, shuffle,
    ensureLab, markDay,
    sessionState, isUnlocked, nextSessionIndex, phaseProgress, currentPhase, recordSession,
    planSemaforo, planDirezione, planPeriferica, nextFlash,
    scoreSemaforo, scoreDirezione, scorePeriferica, recordReflex, reflexBest,
    situState, dueSituations, pickTurn, recordSituation, categoryStats,
    profile, totalScore, weakest, nextAction
  };
});
