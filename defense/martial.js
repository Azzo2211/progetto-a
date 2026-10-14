/*
 * Progetto A - Difesa: motore delle arti marziali ("metodo Johan Seong").
 * Senza DOM, testabile con Node (tests/martial.test.js).
 *
 * - Settimana: N giorni di allenamento (di base lunedi'-venerdi'), ogni giorno una disciplina.
 *   Le discipline ruotano di settimana in settimana (prima quelle fatte meno di recente);
 *   ogni giorno si puo' cambiare a mano.
 * - Ogni disciplina ha 6 livelli. Un allenamento = gli esercizi del livello attuale;
 *   per ognuno l'utente segna "riuscito" o "non ancora". Alla fine e' l'utente a decidere
 *   se salire di livello (l'app consiglia soltanto).
 * - Storico: allenamenti, cambi di livello, settimane fatte.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MartialEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 1;
  const DAY = 24 * 60 * 60 * 1000;
  const MAX_LEVEL = 6;
  const WEEKDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
  const WEEKDAYS_LONG = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];
  const RECOMMEND = 0.8; // quota di esercizi riusciti per consigliare di salire

  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function pad(n) { return String(n).padStart(2, "0"); }
  function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

  // Lunedi' (ora locale) della settimana di "time".
  function weekKey(time) {
    const d = new Date(time);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return dateKey(d);
  }

  function dayIndex(time) { return (new Date(time).getDay() + 6) % 7; }

  function weekStart(week) {
    const [y, m, d] = week.split("-").map(Number);
    return new Date(y, m - 1, d).getTime();
  }

  function addWeeks(week, n) {
    const d = new Date(weekStart(week));
    d.setDate(d.getDate() + n * 7);
    return dateKey(d);
  }

  function dayTime(week, day) {
    const d = new Date(weekStart(week));
    d.setDate(d.getDate() + day);
    return d.getTime();
  }

  function dayKeyOf(time) { return dateKey(new Date(time)); }

  // ---------- Stato ----------
  function ensure(raw, disciplines = [], now = Date.now()) {
    const ids = disciplines.map((d) => d.id);
    const lab = isObj(raw) ? raw : {};
    lab.version = VERSION;
    // da quando usi il metodo: i giorni prima non risultano "saltati"
    if (!num(lab.createdAt)) lab.createdAt = now;
    if (!isObj(lab.levels)) lab.levels = {};
    Object.keys(lab.levels).forEach((k) => {
      if (!num(lab.levels[k])) delete lab.levels[k];
      else lab.levels[k] = clamp(Math.round(lab.levels[k]), 1, MAX_LEVEL);
    });
    if (!isObj(lab.mastered)) lab.mastered = {};
    if (!Array.isArray(lab.pool)) lab.pool = ids.slice();
    lab.pool = lab.pool.filter((id) => typeof id === "string" && (!ids.length || ids.includes(id)));
    if (!lab.pool.length && ids.length) lab.pool = ids.slice();
    if (!Array.isArray(lab.trainDays)) lab.trainDays = [0, 1, 2, 3, 4];
    lab.trainDays = [...new Set(lab.trainDays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b);
    if (!lab.trainDays.length) lab.trainDays = [0, 1, 2, 3, 4];
    if (!isObj(lab.weeks)) lab.weeks = {};
    Object.keys(lab.weeks).forEach((w) => {
      const wk = lab.weeks[w];
      if (!isObj(wk) || !isObj(wk.days) || !/^\d{4}-\d{2}-\d{2}$/.test(w)) { delete lab.weeks[w]; return; }
      Object.keys(wk.days).forEach((d) => {
        const v = wk.days[d];
        if (!/^[0-6]$/.test(d) || (v !== null && typeof v !== "string")) delete wk.days[d];
      });
    });
    if (!isObj(lab.lastPlanned)) lab.lastPlanned = {};
    if (!isObj(lab.planCount)) lab.planCount = {};
    lab.sessions = Array.isArray(lab.sessions) ? lab.sessions.filter((s) => isObj(s) && num(s.t) && typeof s.disc === "string" && num(s.level) && num(s.done) && num(s.total)) : [];
    lab.history = Array.isArray(lab.history) ? lab.history.filter((h) => isObj(h) && num(h.t) && typeof h.disc === "string" && num(h.from) && num(h.to)) : [];
    if (lab.current && !(isObj(lab.current) && typeof lab.current.disc === "string" && isObj(lab.current.results))) lab.current = null;
    if (lab.current === undefined) lab.current = null;
    return lab;
  }

  function levelOf(lab, disc) { return lab.levels[disc] || 1; }

  // "Stile copiato al X%": livelli superati su 6 (l'ultimo conta quando lo dichiari padroneggiato).
  function copyPercent(lab, disc) {
    const passed = levelOf(lab, disc) - 1 + (lab.mastered[disc] ? 1 : 0);
    return Math.round((passed / MAX_LEVEL) * 100);
  }

  // ---------- Settimana ----------
  /*
   * Crea il piano di una settimana se manca. Sceglie le discipline fatte meno di recente
   * (a parita', l'ordine della lista), una diversa per ogni giorno finche' bastano.
   */
  function planWeek(lab, disciplines, week) {
    if (lab.weeks[week]) return lab.weeks[week];
    const pool = lab.pool.filter((id) => disciplines.some((d) => d.id === id));
    const days = {};
    const startWeek = weekKey(lab.createdAt || 0);
    if (week < startWeek) return { days: {} };
    // nella prima settimana si pianificano solo i giorni da oggi in poi
    const fromDay = week === startWeek ? dayIndex(lab.createdAt) : 0;
    const slots = lab.trainDays.filter((d) => d >= fromDay);
    if (pool.length) {
      // prima chi manca da piu' tempo, poi chi e' uscito meno volte, poi l'ordine della lista
      const order = [...pool].sort((a, b) => {
        const la = lab.lastPlanned[a] || "";
        const lb = lab.lastPlanned[b] || "";
        if (la !== lb) return la < lb ? -1 : 1;
        const ca = lab.planCount[a] || 0;
        const cb = lab.planCount[b] || 0;
        if (ca !== cb) return ca - cb;
        return pool.indexOf(a) - pool.indexOf(b);
      });
      slots.forEach((d, i) => { days[d] = order[i % order.length]; });
      Object.values(days).forEach((id) => {
        if (!lab.lastPlanned[id] || lab.lastPlanned[id] < week) lab.lastPlanned[id] = week;
        lab.planCount[id] = (lab.planCount[id] || 0) + 1;
      });
    }
    lab.weeks[week] = { days };
    return lab.weeks[week];
  }

  function sessionsOn(lab, week, day) {
    return lab.sessions.filter((s) => s.week === week && s.day === day);
  }

  function dayStatus(lab, week, day, now = Date.now()) {
    const plan = lab.weeks[week];
    const disc = plan ? plan.days[day] : undefined;
    const done = sessionsOn(lab, week, day);
    if (done.length) return "done";
    if (!disc) return "rest";
    const t = dayTime(week, day);
    const today = dayKeyOf(now) === dayKeyOf(t);
    if (today) return "today";
    return t < now ? "missed" : "planned";
  }

  // Cambia la disciplina di un giorno (null = riposo). I giorni gia' fatti non si toccano.
  function setDay(lab, week, day, disc) {
    const plan = lab.weeks[week] || (lab.weeks[week] = { days: {} });
    if (sessionsOn(lab, week, day).length) return false;
    if (disc) plan.days[day] = disc; else delete plan.days[day];
    return true;
  }

  /*
   * Rifa' il piano della settimana per i giorni non ancora fatti (per esempio dopo aver
   * cambiato i giorni di allenamento o la lista degli stili).
   */
  function replanWeek(lab, disciplines, week) {
    const old = lab.weeks[week];
    const keep = {};
    if (old) Object.entries(old.days).forEach(([d, id]) => { if (sessionsOn(lab, week, Number(d)).length) keep[d] = id; });
    delete lab.weeks[week];
    const plan = planWeek(lab, disciplines, week);
    Object.keys(keep).forEach((d) => { plan.days[d] = keep[d]; });
    return plan;
  }

  function setTrainDays(lab, days) {
    const list = [...new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b);
    if (!list.length) return false;
    lab.trainDays = list;
    return true;
  }

  function setPool(lab, ids) {
    if (!ids.length) return false;
    lab.pool = [...new Set(ids)];
    return true;
  }

  function today(lab, disciplines, now = Date.now()) {
    const week = weekKey(now);
    const day = dayIndex(now);
    const plan = planWeek(lab, disciplines, week);
    return { week, day, disc: plan.days[day] || null, status: dayStatus(lab, week, day, now), sessions: sessionsOn(lab, week, day) };
  }

  // ---------- Allenamento ----------
  function startSession(lab, disc, { now = Date.now(), week = weekKey(now), day = dayIndex(now) } = {}) {
    lab.current = { disc, level: levelOf(lab, disc), week, day, startedAt: now, results: {} };
    return lab.current;
  }

  // value: true (riuscito), false (non ancora), null (da segnare)
  function setResult(lab, exId, value) {
    if (!lab.current) return;
    if (value === null) delete lab.current.results[exId]; else lab.current.results[exId] = !!value;
  }

  /*
   * Chiude l'allenamento in corso. exercises: gli esercizi del livello fatto.
   * Restituisce la voce di storico con la raccomandazione (salire o restare).
   */
  function finishSession(lab, exercises, now = Date.now()) {
    const c = lab.current;
    if (!c) return null;
    const results = {};
    exercises.forEach((e) => { results[e.id] = c.results[e.id] === true ? 1 : 0; });
    const done = Object.values(results).filter((v) => v === 1).length;
    const total = exercises.length;
    const entry = { t: now, week: c.week, day: c.day, disc: c.disc, level: c.level, done, total, results, levelUp: null, minutes: Math.max(1, Math.round((now - c.startedAt) / 60000)) };
    lab.sessions.push(entry);
    if (lab.sessions.length > 500) lab.sessions = lab.sessions.slice(-500);
    lab.current = null;
    // anche un allenamento fuori programma (giorno di riposo o disciplina diversa) segna il giorno con quella disciplina
    const plan = lab.weeks[c.week] || (lab.weeks[c.week] = { days: {} });
    if (plan.days[c.day] !== c.disc) plan.days[c.day] = c.disc;
    if (!lab.lastPlanned[c.disc] || lab.lastPlanned[c.disc] < c.week) lab.lastPlanned[c.disc] = c.week;
    return Object.assign({ recommend: total > 0 && done / total >= RECOMMEND, atMax: c.level >= MAX_LEVEL }, entry);
  }

  // La scelta dell'utente dopo l'allenamento: salire (true) o restare (false).
  function chooseLevel(lab, up, now = Date.now()) {
    const s = lab.sessions[lab.sessions.length - 1];
    if (!s || s.levelUp !== null) return false;
    s.levelUp = !!up;
    if (!up) return true;
    const from = levelOf(lab, s.disc);
    if (s.level >= MAX_LEVEL) {
      lab.mastered[s.disc] = true;
    } else {
      lab.levels[s.disc] = clamp(from + 1, 1, MAX_LEVEL);
    }
    lab.history.push({ t: now, disc: s.disc, from, to: s.level >= MAX_LEVEL ? MAX_LEVEL : from + 1, mastered: s.level >= MAX_LEVEL });
    return true;
  }

  // Cambio di livello a mano (dalla scheda dello stile): anche per tornare indietro.
  function setLevel(lab, disc, level, now = Date.now()) {
    const from = levelOf(lab, disc);
    const to = clamp(Math.round(level), 1, MAX_LEVEL);
    if (to === from) return false;
    lab.levels[disc] = to;
    if (to < MAX_LEVEL) delete lab.mastered[disc];
    lab.history.push({ t: now, disc, from, to, manual: true });
    return true;
  }

  // ---------- Statistiche ----------
  function stats(lab, disciplines, now = Date.now()) {
    const per = {};
    disciplines.forEach((d) => {
      const list = lab.sessions.filter((s) => s.disc === d.id);
      const done = list.reduce((n, s) => n + s.done, 0);
      const total = list.reduce((n, s) => n + s.total, 0);
      per[d.id] = {
        level: levelOf(lab, d.id),
        copy: copyPercent(lab, d.id),
        sessions: list.length,
        rate: total ? Math.round((done / total) * 100) : null,
        last: list.length ? list[list.length - 1].t : null,
        inPool: lab.pool.includes(d.id)
      };
    });
    // settimane: dall'ultima alle precedenti
    const thisWeek = weekKey(now);
    const weeks = [];
    for (let i = 0; i < 8; i += 1) {
      const w = addWeeks(thisWeek, -i);
      const plan = lab.weeks[w];
      const planned = plan ? Object.keys(plan.days).length : 0;
      const doneDays = new Set(lab.sessions.filter((s) => s.week === w).map((s) => s.day)).size;
      const days = Array.from({ length: 7 }, (_, d) => ({ day: d, disc: plan ? plan.days[d] || null : null, status: plan ? dayStatus(lab, w, d, now) : "rest" }));
      weeks.push({ week: w, planned, done: doneDays, days });
    }
    // serie: settimane complete consecutive (la corrente conta solo se gia' completa)
    let streak = 0;
    for (let i = 0; i < 52; i += 1) {
      const w = addWeeks(thisWeek, -i);
      const plan = lab.weeks[w];
      if (!plan) { if (i === 0) continue; break; }
      const target = Object.keys(plan.days).length || lab.trainDays.length;
      const doneDays = new Set(lab.sessions.filter((s) => s.week === w).map((s) => s.day)).size;
      if (doneDays >= target && target > 0) streak += 1;
      else if (i === 0) continue;
      else break;
    }
    const totalMinutes = lab.sessions.reduce((n, s) => n + (s.minutes || 0), 0);
    return { per, weeks, streak, sessions: lab.sessions.length, minutes: totalMinutes };
  }

  /*
   * Contributo al profilo della Difesa: giorni di allenamento (Costanza) e Tecnica
   * (livelli superati negli stili praticati + riuscita negli ultimi allenamenti, cala se ti fermi).
   */
  function profileExtras(lab, disciplines, now = Date.now()) {
    if (!lab || !lab.sessions || !lab.sessions.length) return { days: [], tecnica: null, sessionDays28: 0 };
    const days = [...new Set(lab.sessions.map((s) => dayKeyOf(s.t)))];
    const practiced = disciplines.filter((d) => lab.sessions.some((s) => s.disc === d.id));
    const progress = practiced.length ? practiced.reduce((n, d) => n + copyPercent(lab, d.id), 0) / practiced.length / 100 : 0;
    const recent = lab.sessions.slice(-10);
    const rate = recent.reduce((n, s) => n + (s.total ? s.done / s.total : 0), 0) / recent.length;
    const last = lab.sessions[lab.sessions.length - 1].t;
    const idle = Math.max(0, (now - last) / DAY - 10);
    const tecnica = clamp(12 + progress * 55 + rate * 33 * Math.min(1, lab.sessions.length / 6) - Math.min(25, idle), 0, 100);
    const from = now - 27 * DAY;
    const sessionDays28 = new Set(lab.sessions.filter((s) => s.t >= from).map((s) => dayKeyOf(s.t))).size;
    return { days, tecnica: Math.round(tecnica), sessionDays28 };
  }

  // Durata stimata di un esercizio in secondi (per l'anteprima del livello).
  function exerciseSeconds(e) {
    const d = e.dose || {};
    const per = d.perSide ? 2 : 1;
    const work = d.work != null ? d.work : (d.reps || 0) * 3;
    return (d.sets || 1) * work * per + Math.max(0, (d.sets || 1) - 1) * (d.rest || 0);
  }

  function levelMinutes(level) {
    return Math.round(level.exercises.reduce((n, e) => n + exerciseSeconds(e) + 40, 0) / 60);
  }

  return {
    VERSION, DAY, MAX_LEVEL, WEEKDAYS, WEEKDAYS_LONG, RECOMMEND,
    weekKey, dayIndex, weekStart, addWeeks, dayTime, dayKeyOf,
    ensure, levelOf, copyPercent,
    planWeek, replanWeek, setDay, setTrainDays, setPool, dayStatus, sessionsOn, today,
    startSession, setResult, finishSession, chooseLevel, setLevel,
    stats, profileExtras, exerciseSeconds, levelMinutes
  };
});
