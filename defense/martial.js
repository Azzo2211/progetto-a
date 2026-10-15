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
    if (!num(lab.createdAt) || lab.createdAt > now) lab.createdAt = now;
    if (!isObj(lab.levels)) lab.levels = {};
    Object.keys(lab.levels).forEach((k) => {
      if (!num(lab.levels[k])) delete lab.levels[k];
      else lab.levels[k] = clamp(Math.round(lab.levels[k]), 1, MAX_LEVEL);
    });
    if (!isObj(lab.mastered)) lab.mastered = {};
    if (!Array.isArray(lab.pool)) lab.pool = ids.slice();
    lab.pool = lab.pool.filter((id) => typeof id === "string" && (!ids.length || ids.includes(id)));
    if (!lab.pool.length && ids.length) lab.pool = ids.slice();
    // stili nuovi (aggiunti all'app dopo) entrano in rotazione; quelli tolti a mano restano fuori
    if (!Array.isArray(lab.known)) lab.known = lab.pool.slice();
    ids.forEach((id) => { if (!lab.known.includes(id)) { lab.known.push(id); if (!lab.pool.includes(id)) lab.pool.push(id); } });
    if (!Array.isArray(lab.trainDays)) lab.trainDays = [0, 1, 2, 3, 4];
    lab.trainDays = [...new Set(lab.trainDays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b);
    if (!lab.trainDays.length) lab.trainDays = [0, 1, 2, 3, 4];
    if (!isObj(lab.weeks)) lab.weeks = {};
    Object.keys(lab.weeks).forEach((w) => {
      const wk = lab.weeks[w];
      if (!isObj(wk) || !isObj(wk.days) || !/^\d{4}-\d{2}-\d{2}$/.test(w)) { delete lab.weeks[w]; return; }
      Object.keys(wk.days).forEach((d) => {
        const v = wk.days[d];
        if (!/^[0-6]$/.test(d) || typeof v !== "string" || (ids.length && !ids.includes(v))) delete wk.days[d];
      });
      if (!isObj(wk.manual)) wk.manual = {};
      if (!Array.isArray(wk.counted)) wk.counted = [...new Set(Object.values(wk.days))];
    });
    if (!isObj(lab.lastPlanned)) lab.lastPlanned = {};
    if (!isObj(lab.planCount)) lab.planCount = {};
    lab.sessions = Array.isArray(lab.sessions) ? lab.sessions.filter((s) => isObj(s) && num(s.t) && typeof s.disc === "string" && num(s.level) && num(s.done) && num(s.total)) : [];
    lab.history = Array.isArray(lab.history) ? lab.history.filter((h) => isObj(h) && num(h.t) && typeof h.disc === "string" && num(h.from) && num(h.to)) : [];
    const c = lab.current;
    const okCurrent = isObj(c) && typeof c.disc === "string" && (!ids.length || ids.includes(c.disc))
      && Number.isInteger(c.level) && c.level >= 1 && c.level <= MAX_LEVEL && isObj(c.results)
      && typeof c.week === "string" && /^\d{4}-\d{2}-\d{2}$/.test(c.week) && Number.isInteger(c.day) && c.day >= 0 && c.day <= 6 && num(c.startedAt);
    if (!okCurrent) lab.current = null;
    return lab;
  }

  function levelOf(lab, disc) { return lab.levels[disc] || 1; }

  // "Stile copiato al X%": livelli superati su 6 (l'ultimo conta quando lo dichiari padroneggiato).
  function copyPercent(lab, disc) {
    const passed = levelOf(lab, disc) - 1 + (lab.mastered[disc] ? 1 : 0);
    return Math.round((passed / MAX_LEVEL) * 100);
  }

  // ---------- Settimana ----------
  function rotationOrder(lab, pool) {
    // prima chi manca da piu' tempo, poi chi e' uscito meno volte, poi l'ordine della lista
    return [...pool].sort((a, b) => {
      const la = lab.lastPlanned[a] || "";
      const lb = lab.lastPlanned[b] || "";
      if (la !== lb) return la < lb ? -1 : 1;
      const ca = lab.planCount[a] || 0;
      const cb = lab.planCount[b] || 0;
      if (ca !== cb) return ca - cb;
      return pool.indexOf(a) - pool.indexOf(b);
    });
  }

  // Primo giorno pianificabile della settimana: niente giorni prima dell'inizio del metodo.
  function firstDay(lab, week) {
    const startWeek = weekKey(lab.createdAt || 0);
    if (week < startWeek) return 7;
    return week === startWeek ? dayIndex(lab.createdAt) : 0;
  }

  function countPlan(lab, plan, week, id) {
    if (plan.counted.includes(id)) return;
    plan.counted.push(id);
    if (!lab.lastPlanned[id] || lab.lastPlanned[id] < week) lab.lastPlanned[id] = week;
    lab.planCount[id] = (lab.planCount[id] || 0) + 1;
  }

  // Riempie i giorni di allenamento liberi da "fromDay" in poi, evitando gli stili gia' presenti.
  function fillWeek(lab, disciplines, week, plan, fromDay) {
    const pool = lab.pool.filter((id) => disciplines.some((d) => d.id === id));
    if (!pool.length) return;
    const order = rotationOrder(lab, pool);
    const free = lab.trainDays.filter((d) => d >= fromDay && !plan.days[d]);
    free.forEach((d) => {
      const used = new Set(Object.values(plan.days));
      const id = order.find((x) => !used.has(x)) || order[Object.keys(plan.days).length % order.length];
      plan.days[d] = id;
      countPlan(lab, plan, week, id);
    });
  }

  /*
   * Crea il piano di una settimana se manca. Sceglie le discipline fatte meno di recente
   * (a parita', l'ordine della lista), una diversa per ogni giorno finche' bastano.
   */
  function planWeek(lab, disciplines, week) {
    if (lab.weeks[week]) return lab.weeks[week];
    const from = firstDay(lab, week);
    if (from > 6) return { days: {}, manual: {}, counted: [] };
    const plan = { days: {}, manual: {}, counted: [] };
    fillWeek(lab, disciplines, week, plan, from);
    lab.weeks[week] = plan;
    return plan;
  }

  /*
   * Anteprima di una settimana futura senza salvarla: le scelte (stili in rotazione,
   * giorni di allenamento) restano libere fino a quando la settimana arriva.
   */
  function previewWeek(lab, disciplines, week, now = Date.now()) {
    const current = weekKey(now);
    if (week <= current || lab.weeks[week]) return lab.weeks[week] || (week === current ? planWeek(lab, disciplines, week) : { days: {}, manual: {}, counted: [] });
    const sim = {
      createdAt: lab.createdAt, pool: lab.pool.slice(), trainDays: lab.trainDays.slice(),
      weeks: JSON.parse(JSON.stringify(lab.weeks)), lastPlanned: Object.assign({}, lab.lastPlanned), planCount: Object.assign({}, lab.planCount), sessions: lab.sessions
    };
    planWeek(sim, disciplines, current);
    let w = current;
    while (w < week) { w = addWeeks(w, 1); planWeek(sim, disciplines, w); }
    return Object.assign({ preview: true }, sim.weeks[week]);
  }

  function sessionsOn(lab, week, day) {
    return lab.sessions.filter((s) => s.week === week && s.day === day);
  }

  function dayStatus(lab, week, day, now = Date.now(), plan = lab.weeks[week]) {
    const disc = plan ? plan.days[day] : undefined;
    const done = sessionsOn(lab, week, day);
    if (done.length) return "done";
    if (!disc) return "rest";
    const t = dayTime(week, day);
    const today = dayKeyOf(now) === dayKeyOf(t);
    if (today) return "today";
    return t < now ? "missed" : "planned";
  }

  // Allenamenti fatti e previsti in una settimana (un solo calcolo per tutte le viste).
  function weekProgress(lab, week) {
    const plan = lab.weeks[week];
    const done = new Set(lab.sessions.filter((s) => s.week === week).map((s) => s.day)).size;
    return { done, planned: plan ? Object.keys(plan.days).length : 0 };
  }

  // Cambia la disciplina di un giorno (null = riposo). I giorni gia' fatti non si toccano.
  function setDay(lab, week, day, disc, disciplines = []) {
    if (sessionsOn(lab, week, day).length) return false;
    const plan = lab.weeks[week] || (disciplines.length ? planWeek(lab, disciplines, week) : (lab.weeks[week] = { days: {}, manual: {}, counted: [] }));
    if (!lab.weeks[week]) lab.weeks[week] = plan;
    if (disc) { plan.days[day] = disc; countPlan(lab, plan, week, disc); } else delete plan.days[day];
    plan.manual[day] = true;
    uncountMissing(lab, plan);
    return true;
  }

  // Uno stile uscito del tutto dalla settimana non conta piu' come "pianificato".
  function uncountMissing(lab, plan) {
    plan.counted = plan.counted.filter((id) => {
      if (Object.values(plan.days).includes(id)) return true;
      lab.planCount[id] = Math.max(0, (lab.planCount[id] || 1) - 1);
      return false;
    });
  }

  /*
   * Allinea il piano ai giorni di allenamento, da oggi in poi (le settimane passate non si toccano):
   * toglie i giorni non piu' di allenamento (se non fatti), riempie quelli aggiunti con la rotazione,
   * lascia com'e' tutto il resto. Chiamarla piu' volte non cambia niente.
   */
  function replanWeek(lab, disciplines, week, now = Date.now()) {
    const current = weekKey(now);
    if (week < current) return lab.weeks[week] || { days: {}, manual: {}, counted: [] };
    if (!lab.weeks[week]) return planWeek(lab, disciplines, week);
    const plan = lab.weeks[week];
    const from = Math.max(firstDay(lab, week), week === current ? dayIndex(now) : 0);
    Object.keys(plan.days).map(Number).forEach((d) => {
      if (d < from || lab.trainDays.includes(d) || sessionsOn(lab, week, d).length) return;
      delete plan.days[d];
      delete plan.manual[d];
    });
    uncountMissing(lab, plan);
    if (from <= 6) fillWeek(lab, disciplines, week, plan, from);
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
    return { week, day, disc: plan.days[day] || null, status: dayStatus(lab, week, day, now), sessions: sessionsOn(lab, week, day), key: dayKeyOf(now) };
  }

  // Allenamento iniziato in un giorno precedente e mai chiuso.
  function isStale(lab, now = Date.now()) {
    return !!lab.current && dayKeyOf(lab.current.startedAt) !== dayKeyOf(now);
  }

  // Riprende oggi un allenamento lasciato a meta': conta per oggi, il tempo riparte ora.
  function resumeToday(lab, now = Date.now()) {
    if (!lab.current) return;
    lab.current.week = weekKey(now);
    lab.current.day = dayIndex(now);
    lab.current.startedAt = now;
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
    const entry = { t: now, week: c.week, day: c.day, disc: c.disc, level: c.level, done, total, results, levelUp: null, minutes: clamp(Math.round((now - c.startedAt) / 60000), 1, 150) };
    lab.sessions.push(entry);
    if (lab.sessions.length > 500) lab.sessions = lab.sessions.slice(-500);
    lab.current = null;
    // anche un allenamento fuori programma (giorno di riposo o disciplina diversa) segna il giorno con quella disciplina
    const plan = lab.weeks[c.week] || (lab.weeks[c.week] = { days: {}, manual: {}, counted: [] });
    plan.days[c.day] = c.disc;
    plan.manual[c.day] = true;
    countPlan(lab, plan, c.week, c.disc);
    return Object.assign({ recommend: total > 0 && done / total >= RECOMMEND, atMax: c.level >= MAX_LEVEL }, entry);
  }

  // La scelta dell'utente dopo l'allenamento: salire (true) o restare (false).
  // Si sale dal livello dell'allenamento fatto; se nel frattempo il livello e' cambiato a mano, non si tocca.
  function chooseLevel(lab, up, now = Date.now()) {
    const s = lab.sessions[lab.sessions.length - 1];
    if (!s || s.levelUp !== null) return false;
    s.levelUp = !!up;
    if (!up) return true;
    if (levelOf(lab, s.disc) !== s.level) return true;
    if (s.level >= MAX_LEVEL) {
      if (lab.mastered[s.disc]) return true;
      lab.mastered[s.disc] = true;
      lab.history.push({ t: now, disc: s.disc, from: MAX_LEVEL, to: MAX_LEVEL, mastered: true });
      return true;
    }
    lab.levels[s.disc] = s.level + 1;
    lab.history.push({ t: now, disc: s.disc, from: s.level, to: s.level + 1 });
    return true;
  }

  // L'ultimo allenamento, se manca ancora la scelta del livello (per ritrovare il riepilogo dopo una ricarica).
  function pendingChoice(lab, now = Date.now()) {
    const s = lab.sessions[lab.sessions.length - 1];
    if (!s || s.levelUp !== null || now - s.t > 12 * 60 * 60 * 1000) return null;
    return Object.assign({ recommend: s.total > 0 && s.done / s.total >= RECOMMEND, atMax: s.level >= MAX_LEVEL }, s);
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
      const wp = weekProgress(lab, w);
      const days = Array.from({ length: 7 }, (_, d) => ({ day: d, disc: plan ? plan.days[d] || null : null, status: plan ? dayStatus(lab, w, d, now) : "rest" }));
      weeks.push({ week: w, planned: wp.planned, done: wp.done, days });
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
    planWeek, previewWeek, replanWeek, setDay, setTrainDays, setPool, dayStatus, sessionsOn, weekProgress, today, isStale, resumeToday,
    startSession, setResult, finishSession, chooseLevel, pendingChoice, setLevel,
    stats, profileExtras, exerciseSeconds, levelMinutes
  };
});
