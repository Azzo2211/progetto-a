/*
 * Progetto A - Recupero: motore (senza DOM). Stato: state.recoveryLab.
 *
 *  - Impostazione: data dell'intervento, gamba, innesto, quanto riesci a piegare (decide da quale
 *    altezza della sedia si parte).
 *  - Controllo del ginocchio ogni giorno (gonfiore, dolore a riposo, rispetto a ieri, cedimenti):
 *    verde = sessione normale, giallo = versione leggera, rosso = niente gambe oggi.
 *  - Programma del giorno: controllo, routine di estensione (finche' manca estensione), una
 *    sessione (gambe o parte alta, mai gambe due giorni di fila) con il blocco di tecnica marziale
 *    della fase, la routine «Estensione e calci» (allungamenti a ginocchio dritto e slanci lenti:
 *    estensione e flessibilita' per i calci insieme), test della settimana.
 *  - Livelli degli esercizi: due «facile» di fila = livello su; «dolore» = livello giu'.
 *  - Fase dai test (criteri MOON e Grindem) con date minime dall'intervento.
 *  - Profilo a esagono (Estensione, Forza gambe, Parte alta, Controllo, Costanza, Tecnica
 *    marziale) e profilo «Per le arti marziali» (calci alti, calci laterali, camera e frustata,
 *    gamba d'appoggio, spinta, pugni e prese) dai test, con il peso degli stili che fai.
 *    Il recupero non entra nel rango generale: qui non conviene mai forzare per i punti.
 */
(function (root, factory) {
  const D = root.RecoveryData || (typeof require === "function" ? require("./data.js") : null);
  const api = factory(D);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RecoveryEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function (D) {
  "use strict";

  const VERSION = 1;
  const DAY = 86400000;
  const MONTH = 30.44 * DAY;
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pad = (n) => String(n).padStart(2, "0");
  const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const addDays = (t, n) => { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); };

  const EX = new Map(D.EXERCISES.map((e) => [e.id, e]));
  const TEST = new Map(D.TESTS.map((t) => [t.id, t]));
  const KINDS = Object.keys(D.SESSION_INFO);
  const RATINGS = ["easy", "ok", "hard", "pain", "skip"];
  const MAX_EXT = 200;
  const MAX_SESSIONS = 300;
  const MAX_TESTS = 80;

  /* ------------------------------------------------------------ stato */
  function parseDate(s) {
    if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const [y, m, d] = s.split("-").map(Number);
    const t = new Date(y, m - 1, d, 12).getTime();
    return Number.isFinite(t) ? t : null;
  }

  function cleanTest(t) {
    if (!isObj(t) || !num(t.t)) return null;
    const out = { t: t.t };
    D.TESTS.forEach((def) => {
      const v = t[def.id];
      if (def.perLeg) {
        if (Array.isArray(v) && v.length === 2 && v.every((x) => num(x) && x >= 0)) out[def.id] = [Math.min(v[0], def.max), Math.min(v[1], def.max)];
      } else if (def.options) {
        if (Number.isInteger(v) && v >= 0 && v < def.options.length) out[def.id] = v;
      } else if (num(v) && v >= (def.min < 0 ? def.min : 0)) out[def.id] = Math.min(v, def.max);
    });
    return out;
  }

  function ensure(raw, now = Date.now()) {
    const lab = isObj(raw) ? raw : {};
    lab.version = VERSION;
    const s = lab.setup;
    if (!(isObj(s) && parseDate(s.surgery) && ["destra", "sinistra"].includes(s.side))) lab.setup = null;
    else {
      if (!D.GRAFTS.some((g) => g.id === s.graft)) s.graft = "nonso";
      if (![0, 1, 2].includes(s.flex)) s.flex = 0;
      if (!num(s.createdAt) || s.createdAt > now) s.createdAt = now;
    }
    if (!isObj(lab.prefs)) lab.prefs = {};
    lab.prefs.sound = lab.prefs.sound !== false;
    lab.prefs.styles = Array.isArray(lab.prefs.styles) ? [...new Set(lab.prefs.styles.filter((id) => D.STYLE_NEEDS[id]))].slice(0, 9) : [];
    if (!isObj(lab.checks)) lab.checks = {};
    Object.keys(lab.checks).forEach((k) => {
      const c = lab.checks[k];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !isObj(c)) { delete lab.checks[k]; return; }
      c.swelling = [0, 1, 2].includes(c.swelling) ? c.swelling : 0;
      c.pain = num(c.pain) ? clamp(Math.round(c.pain), 0, 10) : 0;
      c.trend = [-1, 0, 1].includes(c.trend) ? c.trend : 0;
      c.gaveWay = c.gaveWay === true;
    });
    const keys = Object.keys(lab.checks).sort();
    if (keys.length > 120) keys.slice(0, keys.length - 120).forEach((k) => delete lab.checks[k]);
    lab.ext = Array.isArray(lab.ext) ? lab.ext.filter((t) => num(t) && t <= now + DAY).slice(-MAX_EXT) : [];
    lab.sessions = Array.isArray(lab.sessions) ? lab.sessions.filter((x) => isObj(x) && num(x.t) && KINDS.includes(x.kind) && isObj(x.results)).slice(-MAX_SESSIONS) : [];
    lab.sessions.forEach((x) => {
      Object.keys(x.results).forEach((id) => { if (!EX.has(id) || !RATINGS.includes(x.results[id])) delete x.results[id]; });
      x.phase = [1, 2, 3, 4].includes(x.phase) ? x.phase : 1;
      x.knee = [0, 1, 2].includes(x.knee) ? x.knee : 0;
    });
    if (!isObj(lab.levels)) lab.levels = {};
    Object.keys(lab.levels).forEach((id) => {
      const e = EX.get(id);
      if (!e || !Number.isInteger(lab.levels[id])) delete lab.levels[id];
      else lab.levels[id] = clamp(lab.levels[id], 0, e.levels.length - 1);
    });
    if (!isObj(lab.easy)) lab.easy = {};
    Object.keys(lab.easy).forEach((id) => { if (!EX.has(id) || !Number.isInteger(lab.easy[id]) || lab.easy[id] < 0) delete lab.easy[id]; });
    lab.tests = Array.isArray(lab.tests) ? lab.tests.map(cleanTest).filter(Boolean).sort((a, b) => a.t - b.t).slice(-MAX_TESTS) : [];
    const c = lab.current;
    if (!(isObj(c) && KINDS.includes(c.kind) && num(c.startedAt) && Array.isArray(c.items) && c.items.length && isObj(c.results))) lab.current = null;
    else {
      c.items = c.items.filter((id) => EX.has(id));
      if (!c.items.length) lab.current = null;
      else Object.keys(c.results).forEach((id) => { if (!c.items.includes(id) || !RATINGS.includes(c.results[id])) delete c.results[id]; });
    }
    return lab;
  }

  function configured(lab) { return !!(lab && lab.setup); }

  function setSetup(lab, data, now = Date.now()) {
    const surgery = parseDate(data && data.surgery);
    if (!surgery || surgery > now) return { ok: false, error: "Scrivi una data dell'intervento valida, non nel futuro." };
    const side = data.side === "sinistra" ? "sinistra" : "destra";
    const graft = D.GRAFTS.some((g) => g.id === data.graft) ? data.graft : "nonso";
    const flex = [0, 1, 2].includes(Number(data.flex)) ? Number(data.flex) : 0;
    const first = !lab.setup;
    lab.setup = { surgery: data.surgery, side, graft, flex, createdAt: lab.setup && num(lab.setup.createdAt) ? lab.setup.createdAt : now };
    if (first || data.resetLevels) {
      const f = D.FLEX[flex];
      lab.levels.sedia = f.start;
      lab.levels.muro = flex === 0 ? 0 : flex === 1 ? 2 : 3;
      lab.levels["split-squat"] = flex === 2 ? 1 : 0;
    }
    return { ok: true };
  }

  function surgeryTime(lab) { return lab.setup ? parseDate(lab.setup.surgery) : null; }
  function monthsSince(lab, now = Date.now()) {
    const t = surgeryTime(lab);
    return t ? Math.max(0, (now - t) / MONTH) : 0;
  }
  function dateAfterMonths(lab, months) {
    const t = surgeryTime(lab);
    if (!t) return null;
    const d = new Date(t);
    const whole = Math.floor(months);
    d.setMonth(d.getMonth() + whole);
    return d.getTime() + (months - whole) * MONTH;
  }
  function gates(lab, now = Date.now()) {
    const m = monthsSince(lab, now);
    return D.GATES.map((g) => ({ ...g, date: dateAfterMonths(lab, g.months), open: m >= g.months }));
  }

  /* ------------------------------------------------------------ controllo del giorno */
  function checkIn(lab, data, now = Date.now()) {
    const c = {
      swelling: [0, 1, 2].includes(Number(data.swelling)) ? Number(data.swelling) : 0,
      pain: clamp(Math.round(Number(data.pain) || 0), 0, 10),
      trend: [-1, 0, 1].includes(Number(data.trend)) ? Number(data.trend) : 0,
      gaveWay: data.gaveWay === true,
      t: now
    };
    lab.checks[dayKey(now)] = c;
    return c;
  }
  function todayCheck(lab, now = Date.now()) { return lab.checks[dayKey(now)] || null; }

  function readinessOf(c) {
    if (!c) return null;
    const reasons = [];
    if (c.gaveWay) reasons.push("il ginocchio ha ceduto");
    if (c.swelling === 2) reasons.push("gonfiore evidente");
    if (c.pain >= 5) reasons.push(`dolore a riposo ${c.pain} su 10`);
    if (reasons.length) return { level: "rosso", reasons };
    if (c.pain >= 3) reasons.push(`dolore a riposo ${c.pain} su 10`);
    if (c.trend === 1) reasons.push("peggio di ieri");
    if (c.swelling === 1 && c.trend === 1) reasons.push("un po' gonfio");
    if (reasons.length) return { level: "giallo", reasons };
    return { level: "verde", reasons: [] };
  }
  const ADVICE = {
    verde: "Ginocchio tranquillo: sessione normale.",
    giallo: "Oggi versione leggera: una serie in meno negli esercizi per le gambe, niente salti né corsa, nessun livello in più. Se domani va come oggi o meglio, si riprende normale.",
    rosso: "Oggi niente sessione per le gambe: solo la routine di estensione senza pesi, la parte alta e la tecnica da fermo. Gamba sollevata quando sei seduto. Se gonfiore o dolore restano così 2–3 giorni, senti il chirurgo o il fisioterapista."
  };
  function readiness(lab, now = Date.now()) {
    const r = readinessOf(todayCheck(lab, now));
    if (!r) return null;
    const c = todayCheck(lab, now);
    const advice = c.gaveWay
      ? "Il ginocchio che cede va fatto vedere al chirurgo. Fino ad allora niente salti, corsa, pivot e calci: routine di estensione, parte alta e tecnica da fermo."
      : r.level === "verde" && c.swelling === 1 ? `${ADVICE.verde} Un po' di gonfiore: controlla che dopo la sessione non aumenti.` : ADVICE[r.level];
    return { ...r, advice };
  }

  /* ------------------------------------------------------------ test e fasi */
  function lsi(pair) {
    if (!Array.isArray(pair) || !num(pair[0]) || !num(pair[1]) || pair[1] <= 0) return null;
    return Math.round((pair[0] / pair[1]) * 100);
  }
  // Ultimo valore misurato di un test (anche da un test precedente, se l'ultimo l'ha lasciato vuoto).
  function latest(lab, id) {
    for (let i = lab.tests.length - 1; i >= 0; i -= 1) {
      if (lab.tests[i][id] !== undefined) return { value: lab.tests[i][id], t: lab.tests[i].t };
    }
    return null;
  }
  function latestValue(lab, id) { const x = latest(lab, id); return x ? x.value : null; }
  function latestLsi(lab, id) { return lsi(latestValue(lab, id)); }

  function recordTest(lab, data, now = Date.now()) {
    const before = phaseInfo(lab, now).phase;
    const entry = cleanTest({ ...data, t: now });
    const measured = Object.keys(entry).filter((k) => k !== "t").length;
    if (!measured) return { ok: false, error: "Compila almeno un test." };
    lab.tests.push(entry);
    if (lab.tests.length > MAX_TESTS) lab.tests.splice(0, lab.tests.length - MAX_TESTS);
    const after = phaseInfo(lab, now).phase;
    return { ok: true, entry, before, after };
  }
  function lastTestTime(lab) { return lab.tests.length ? lab.tests[lab.tests.length - 1].t : null; }
  function testDue(lab, now = Date.now()) {
    const last = lastTestTime(lab);
    return !last || now - startOfDay(last) >= 7 * DAY;
  }

  function gaveWayRecent(lab, now = Date.now(), days = 90) {
    return Object.keys(lab.checks).filter((k) => lab.checks[k].gaveWay && now - (lab.checks[k].t || parseDate(k) || 0) <= days * DAY).sort().pop() || null;
  }

  // Criteri per entrare in ogni fase. met: true/false, o null se il test manca.
  function criteriaFor(lab, n, now = Date.now()) {
    const heel = latestValue(lab, "heel");
    const slr = latestValue(lab, "slr");
    const swell = latestValue(lab, "swell");
    const gait = latestValue(lab, "gait");
    const step = latestValue(lab, "stepdown");
    const L = (id) => latestLsi(lab, id);
    const ge = (v, x) => (v == null ? null : v >= x);
    const pct = (v) => (v == null ? "da misurare" : `${v}%`);
    const m = monthsSince(lab, now);
    if (n === 2) return [
      { id: "heel1", text: "Estensione quasi completa: talloni a non più di 1 cm", met: heel == null ? null : heel <= 1, value: heel == null ? "da misurare" : `${heel} cm` },
      { id: "slr20", text: "20 sollevamenti a gamba tesa senza ritardo (MOON)", met: ge(slr, 20), value: slr == null ? "da misurare" : `${slr}` },
      { id: "swell0", text: "Niente gonfiore dopo le sessioni", met: swell == null ? null : swell === 0, value: swell == null ? "da misurare" : D.TESTS.find((t) => t.id === "swell").options[swell] },
      { id: "gait1", text: "Cammini senza zoppicare", met: ge(gait, 1), value: gait == null ? "da misurare" : D.TESTS.find((t) => t.id === "gait").options[gait] }
    ];
    if (n === 3) return [
      { id: "m4", text: "Almeno 4 mesi dall'intervento", met: m >= 4, value: `${Math.floor(m)} mesi`, gate: true },
      { id: "heel0", text: "Estensione completa: talloni alla stessa altezza (MOON)", met: heel == null ? null : heel === 0, value: heel == null ? "da misurare" : `${heel} cm` },
      { id: "sit80", text: "Seduto-in piedi su una gamba: operata almeno all'80% della sana", met: ge(L("sit"), 80), value: pct(L("sit")) },
      { id: "bridge80", text: "Ponte su una gamba almeno all'80%", met: ge(L("bridge"), 80), value: pct(L("bridge")) },
      { id: "balance80", text: "Equilibrio a occhi chiusi almeno all'80%", met: ge(L("balance"), 80), value: pct(L("balance")) },
      { id: "step2", text: "Discesa dal gradino sempre in linea", met: step == null ? null : step === 2, value: step == null ? "da misurare" : D.TESTS.find((t) => t.id === "stepdown").options[step] },
      { id: "gait2", text: "Scale a passo alternato senza fastidio", met: ge(gait, 2), value: gait == null ? "da misurare" : D.TESTS.find((t) => t.id === "gait").options[gait] }
    ];
    if (n === 4) {
      const gw = gaveWayRecent(lab, now);
      const clear = latestValue(lab, "clear");
      return [
        { id: "m9", text: "Almeno 9 mesi dall'intervento (Grindem 2016)", met: m >= 9, value: `${Math.floor(m)} mesi`, gate: true },
        { id: "sit90", text: "Seduto-in piedi su una gamba almeno al 90%", met: ge(L("sit"), 90), value: pct(L("sit")) },
        { id: "calf90", text: "Polpacci su una gamba almeno al 90%", met: ge(L("calf"), 90), value: pct(L("calf")) },
        { id: "bridge90", text: "Ponte su una gamba almeno al 90%", met: ge(L("bridge"), 90), value: pct(L("bridge")) },
        { id: "hop90", text: "Salto in lungo su una gamba almeno al 90% (MOON chiede l'85%, Grindem il 90%)", met: ge(L("hop"), 90), value: pct(L("hop")) },
        { id: "nogive", text: "Nessun cedimento negli ultimi 3 mesi", met: !gw, value: gw ? `cedimento il ${gw.split("-").reverse().join("/")}` : "nessuno" },
        { id: "clear", text: "Ok del chirurgo o del fisioterapista per il contatto", met: clear == null ? null : clear === 1, value: clear === 1 ? "sì" : "non ancora" }
      ];
    }
    return [];
  }

  function phaseInfo(lab, now = Date.now()) {
    const phases = D.PHASES.map((p) => ({ ...p, criteria: criteriaFor(lab, p.n, now) }));
    let phase = 1;
    for (let n = 2; n <= 4; n += 1) {
      const crit = phases[n - 1].criteria;
      if (crit.length && crit.every((c) => c.met === true)) phase = n; else break;
    }
    let capped = false;
    if (gaveWayRecent(lab, now, 30) && phase > 2) { phase = 2; capped = true; }
    const next = phase < 4 ? phases[phase] : null;
    return { phase, capped, phases, next, missing: next ? next.criteria.filter((c) => c.met !== true) : [] };
  }
  function phase(lab, now = Date.now()) { return phaseInfo(lab, now).phase; }

  /* ------------------------------------------------------------ livelli */
  function maxLevel(lab, e, ph, now = Date.now()) {
    const m = monthsSince(lab, now);
    let max = 0;
    e.levels.forEach((L, i) => { if ((L.phase || 1) <= ph && (L.minMonths || 0) <= m) max = i; });
    return max;
  }
  function levelOf(lab, id, ph = 1, now = Date.now()) {
    const e = EX.get(id);
    if (!e) return 0;
    return clamp(lab.levels[id] || 0, 0, maxLevel(lab, e, ph, now));
  }
  function setLevel(lab, id, lv, ph = 1, now = Date.now()) {
    const e = EX.get(id);
    if (!e) return 0;
    lab.levels[id] = clamp(Math.round(lv), 0, maxLevel(lab, e, ph, now));
    lab.easy[id] = 0;
    return lab.levels[id];
  }
  function doseOf(e, lv, light) {
    const L = e.levels[lv] || {};
    const d = { ...e.dose, ...(L.dose || {}) };
    if (light && e.area === "legs" && d.sets > 1) d.sets -= 1;
    if (Array.isArray(d.tasks)) d.tasks = d.tasks.slice(0, d.sets);
    return d;
  }
  function doseText(d) {
    if (!d) return "";
    const side = d.perSide ? " per lato" : "";
    const fmt = (s) => (s >= 60 ? `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ""}` : `${s} s`);
    const what = d.work != null ? fmt(d.work) : `${d.reps} rip.`;
    const rest = d.rest ? `, recupero ${fmt(d.rest)}` : "";
    return d.sets > 1 ? `${d.sets} × ${what}${side}${rest}` : `${what}${side}`;
  }

  /* ------------------------------------------------------------ sessioni */
  function sessionsOn(lab, key) { return lab.sessions.filter((s) => dayKey(s.t) === key); }
  function extToday(lab, now = Date.now()) { const k = dayKey(now); return lab.ext.filter((t) => dayKey(t) === k).length; }
  // Routine di estensione al giorno: la classica finche' manca estensione, piu' «Estensione e calci» (sempre).
  function extNeed(lab) {
    const heel = latestValue(lab, "heel");
    return heel === 0 ? 0 : 1;
  }
  const STRETCH = ["ext", "kick"];
  const TRAINING = ["legs", "upperA", "upperB"];

  // La sessione consigliata oggi: gambe se ieri non le hai fatte e il ginocchio lo permette, altrimenti parte alta (A e B alternate).
  function suggest(lab, now = Date.now()) {
    const today = dayKey(now);
    const done = sessionsOn(lab, today).filter((s) => TRAINING.includes(s.kind));
    const r = readiness(lab, now);
    const yesterday = dayKey(addDays(now, -1));
    const legsYesterday = sessionsOn(lab, yesterday).some((s) => s.kind === "legs");
    const lastUpper = [...lab.sessions].reverse().find((s) => s.kind === "upperA" || s.kind === "upperB");
    const upper = lastUpper && lastUpper.kind === "upperA" ? "upperB" : "upperA";
    const week = lab.sessions.filter((s) => TRAINING.includes(s.kind) && now - s.t < 6 * DAY).length;
    if (done.length) return { kind: done[0].kind, done: true, reason: "Sessione di oggi fatta." };
    if (week >= 6) return { kind: "rest", done: false, reason: "Sei giorni di fila: oggi riposo attivo, 20–30 minuti di camminata e la routine di estensione." };
    if (r && r.level === "rosso") return { kind: upper, done: false, reason: "Ginocchio da far riposare: oggi parte alta e tecnica da fermo." };
    if (legsYesterday) return { kind: upper, done: false, reason: "Ieri gambe: oggi parte alta, così le gambe recuperano." };
    return { kind: "legs", done: false, reason: "Oggi tocca alle gambe." };
  }

  function buildSession(lab, kind, now = Date.now()) {
    const ph = phase(lab, now);
    const r = readiness(lab, now);
    const red = r && r.level === "rosso";
    const light = r && r.level === "giallo";
    let ids;
    if (kind === "ext") ids = D.SESSIONS.ext.slice();
    else if (kind === "kick") ids = D.SESSIONS.kick[ph].slice();
    else if (kind === "legs") ids = D.SESSIONS.legs[ph].slice();
    else if (kind === "upperA" || kind === "upperB") ids = D.SESSIONS[kind].slice();
    else ids = [];
    if (!STRETCH.includes(kind)) ids = ids.concat(D.SESSIONS.martial[ph]);
    if (kind === "martial") ids = D.SESSIONS.martial[ph].slice();
    // ginocchio giallo o rosso: niente impatto; rosso: tecnica solo da fermo e da seduto, niente slanci
    if (light || red) ids = ids.filter((id) => !EX.get(id).impact);
    if (red) ids = ids.filter((id) => EX.get(id).area !== "martial" || (D.SESSIONS.martial[1].includes(id) && !STANDING_KICKS.includes(id)));
    if (red && kind === "martial") ids = D.SESSIONS.martial[1].filter((id) => !STANDING_KICKS.includes(id));
    if (red && kind === "kick") ids = ids.filter((id) => !STANDING_KICKS.includes(id));
    if (red && kind === "legs") ids = [];
    const items = ids.map((id) => {
      const e = EX.get(id);
      let lv = levelOf(lab, id, ph, now);
      if (red && e.area === "ext") lv = Math.min(lv, id === "arco-corto" ? 0 : 1); // senza pesi
      return { id, lv, dose: doseOf(e, lv, light) };
    });
    return { kind, phase: ph, light: !!light, red: !!red, items };
  }

  // esercizi in piedi su una gamba che il giorno «rosso» si saltano
  const STANDING_KICKS = ["calci-rallentatore", "slancio-frontale", "slancio-laterale", "flessori-anca"];

  function startSession(lab, kind, now = Date.now()) {
    const s = buildSession(lab, kind, now);
    if (!s.items.length) return null;
    lab.current = { kind, startedAt: now, phase: s.phase, light: s.light, red: s.red, items: s.items.map((x) => x.id), results: {} };
    return lab.current;
  }
  function rate(lab, id, value) {
    const c = lab.current;
    if (!c || !c.items.includes(id)) return;
    if (value === null) delete c.results[id];
    else if (RATINGS.includes(value)) c.results[id] = value;
  }
  function cancelSession(lab) { lab.current = null; }

  // Chiude la sessione: livelli su dopo due «facile» di fila, giu' con il dolore. knee: 0 niente, 1 fastidio, 2 dolore.
  function finishSession(lab, opts = {}, now = Date.now()) {
    const c = lab.current;
    if (!c) return null;
    const knee = [0, 1, 2].includes(Number(opts.knee)) ? Number(opts.knee) : 0;
    const ups = [];
    const downs = [];
    const allowUp = !c.light && !c.red && knee < 2;
    Object.entries(c.results).forEach(([id, v]) => {
      const e = EX.get(id);
      const lv = levelOf(lab, id, c.phase, now);
      if (v === "pain") {
        lab.easy[id] = 0;
        if (lv > 0) { lab.levels[id] = lv - 1; downs.push({ id, name: e.name, to: e.levels[lv - 1].name }); }
        else lab.levels[id] = 0;
      } else if (v === "easy") {
        lab.easy[id] = (lab.easy[id] || 0) + 1;
        const max = maxLevel(lab, e, c.phase, now);
        if (allowUp && lab.easy[id] >= 2 && lv < max) {
          lab.levels[id] = lv + 1;
          lab.easy[id] = 0;
          ups.push({ id, name: e.name, to: e.levels[lv + 1].name });
        }
      } else if (v === "ok" || v === "hard") lab.easy[id] = 0;
    });
    const done = Object.values(c.results).filter((v) => v !== "skip").length;
    const entry = { t: now, kind: c.kind, phase: c.phase, results: { ...c.results }, knee, light: !!c.light, minutes: clamp(Math.round((now - c.startedAt) / 60000), 1, 180), done, total: c.items.length };
    lab.sessions.push(entry);
    if (lab.sessions.length > MAX_SESSIONS) lab.sessions.splice(0, lab.sessions.length - MAX_SESSIONS);
    if (STRETCH.includes(c.kind) && done > 0) { lab.ext.push(now); if (lab.ext.length > MAX_EXT) lab.ext.splice(0, lab.ext.length - MAX_EXT); }
    lab.current = null;
    return { entry, ups, downs };
  }

  /* ------------------------------------------------------------ programma del giorno */
  function plan(lab, now = Date.now()) {
    if (!configured(lab)) return [{ id: "setup", title: "Imposta il recupero (2 minuti)", minutes: 2, done: false }];
    const steps = [];
    steps.push({ id: "check", title: "Controllo del ginocchio", minutes: 1, done: !!todayCheck(lab, now) });
    // il primo test viene subito: decide la fase e quindi gli esercizi
    if (!lab.tests.length) steps.push({ id: "test", title: "Primo test: decide la tua fase", minutes: 12, done: false });
    const today = sessionsOn(lab, dayKey(now));
    const heel = latestValue(lab, "heel");
    if (extNeed(lab)) steps.push({ id: "ext1", title: "Routine di estensione", minutes: D.SESSION_INFO.ext.minutes, done: today.some((x) => x.kind === "ext"), kind: "ext" });
    const s = suggest(lab, now);
    if (s.kind === "rest") steps.push({ id: "session", title: "Riposo attivo: camminata di 20–30 minuti", minutes: 25, done: true, kind: "rest" });
    else steps.push({ id: "session", title: s.done ? `${D.SESSION_INFO[s.kind].label}: fatta` : D.SESSION_INFO[s.kind].label, minutes: D.SESSION_INFO[s.kind].minutes, done: s.done, kind: s.kind });
    steps.push({ id: "kick", title: heel === 0 ? "Flessibilità per i calci (a muscoli caldi)" : "Estensione e calci (a muscoli caldi)", minutes: D.SESSION_INFO.kick.minutes, done: today.some((x) => x.kind === "kick"), kind: "kick" });
    if (lab.tests.length && testDue(lab, now)) steps.push({ id: "test", title: "Test della settimana", minutes: 12, done: false });
    return steps;
  }

  function streak(lab, now = Date.now()) {
    // giorni di fila con almeno una routine di estensione o una sessione
    const days = new Set(lab.ext.map(dayKey).concat(lab.sessions.map((s) => dayKey(s.t))));
    let n = 0;
    let t = now;
    if (!days.has(dayKey(t))) t = addDays(t, -1);
    while (days.has(dayKey(t)) && n < 400) { n += 1; t = addDays(t, -1); }
    return n;
  }

  /* ------------------------------------------------------------ avvisi */
  function alerts(lab, now = Date.now()) {
    const out = [];
    if (!configured(lab)) return out;
    const gw = gaveWayRecent(lab, now);
    if (gw) out.push({ level: "rosso", id: "gave", text: `Hai segnato un cedimento il ${gw.split("-").reverse().join("/")}: fallo vedere al chirurgo prima di tornare a salti, corsa, pivot e calci.` });
    const recent = Object.keys(lab.checks).sort().slice(-5).map((k) => lab.checks[k]);
    if (recent.filter((c) => c.swelling === 2).length >= 3) out.push({ level: "rosso", id: "swell", text: "Il ginocchio si è gonfiato in modo evidente in 3 degli ultimi 5 controlli: senti il fisioterapista o il chirurgo e, intanto, resta al livello più basso." });
    const heels = lab.tests.filter((t) => t.heel !== undefined);
    const last = heels[heels.length - 1];
    if (last && last.heel > 0) {
      const old = [...heels].reverse().find((t) => last.t - t.t >= 21 * DAY);
      if (old && last.heel >= old.heel) out.push({ level: "giallo", id: "ext", text: `L'estensione non migliora da almeno 3 settimane (${old.heel} cm allora, ${last.heel} cm ora). Con il lavoro di ogni giorno dovrebbe calare: fai controllare il ginocchio al chirurgo. A volte un piccolo nodulo di cicatrice davanti all'innesto (lesione «a ciclope») blocca gli ultimi gradi e lo stretching non basta.` });
      else if (monthsSince(lab, now) >= 3) out.push({ level: "info", id: "ext-info", text: `Manca ancora estensione (${last.heel} cm). Ogni giorno la routine di estensione e quella «Estensione e calci»: se fra 3–4 settimane la differenza non cala, fai controllare il ginocchio.` });
    }
    return out;
  }

  /* ------------------------------------------------------------ profilo */
  const lerp = (x, pts) => {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i += 1) {
      if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1]; const [x1, y1] = pts[i]; return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0); }
    }
    return pts[pts.length - 1][1];
  };
  const LSI_MAP = [[40, 25], [60, 45], [70, 58], [80, 70], [90, 84], [100, 95]];
  function avg(xs) { const v = xs.filter(num); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; }
  function levelProgress(lab, area, now) {
    const ids = D.EXERCISES.filter((e) => e.area === area && !e.impact).map((e) => e.id);
    return avg(ids.map((id) => { const e = EX.get(id); return (lab.levels[id] || 0) / Math.max(1, e.levels.length - 1); }));
  }

  function profile(lab, now = Date.now()) {
    const heel = latestValue(lab, "heel");
    const ext = heel == null ? null : lerp(heel, [[0, 95], [0.5, 88], [1, 80], [2, 64], [3, 50], [5, 32], [8, 20]]);
    const legsLsi = avg(["sit", "calf", "bridge", "hop"].map((id) => latestLsi(lab, id)));
    const legsProg = levelProgress(lab, "legs", now);
    const legs = legsLsi == null ? (lab.sessions.some((s) => s.kind === "legs") ? 25 + legsProg * 40 : null) : lerp(legsLsi, LSI_MAP) * 0.75 + (25 + legsProg * 70) * 0.25;
    const push = latestValue(lab, "push");
    const upProg = avg([levelProgress(lab, "upper", now), levelProgress(lab, "core", now)]);
    const upLevels = 28 + upProg * 62;
    const upper = push == null ? (lab.sessions.some((s) => s.kind === "upperA" || s.kind === "upperB") ? upLevels : null) : lerp(push, [[0, 20], [5, 35], [10, 45], [20, 60], [30, 72], [40, 82], [55, 92]]) * 0.6 + upLevels * 0.4;
    const bal = latestLsi(lab, "balance");
    const step = latestValue(lab, "stepdown");
    const slr = latestValue(lab, "slr");
    const control = avg([bal == null ? null : lerp(bal, LSI_MAP), step == null ? null : [35, 62, 88][step], slr == null ? null : lerp(slr, [[0, 25], [10, 55], [20, 85]])]);
    let consistency = null;
    if (configured(lab)) {
      const since = Math.max(1, Math.min(14, Math.ceil((now - startOfDay(lab.setup.createdAt)) / DAY)));
      const from = now - since * DAY;
      const extDays = new Set(lab.ext.filter((t) => t >= from).map(dayKey)).size;
      const sess = lab.sessions.filter((s) => s.t >= from && TRAINING.includes(s.kind)).length;
      const target = Math.max(1, Math.round(since * (4 / 7)));
      consistency = lab.ext.length || lab.sessions.length ? 20 + 75 * (0.5 * Math.min(1, extDays / since) + 0.5 * Math.min(1, sess / target)) : null;
    }
    const drills = lab.sessions.reduce((n, s) => n + Object.entries(s.results).filter(([id, v]) => v !== "skip" && EX.get(id).area === "martial").length, 0);
    const martial = drills ? Math.min(95, 25 + Math.min(50, drills * 1.2) + (phase(lab, now) - 1) * 6) : null;
    const rows = [
      { key: "extension", label: "Estensione", value: ext },
      { key: "legs", label: "Forza gambe", value: legs },
      { key: "upper", label: "Parte alta", value: upper },
      { key: "control", label: "Controllo", value: control },
      { key: "consistency", label: "Costanza", value: consistency },
      { key: "martial", label: "Tecnica marziale", value: martial }
    ];
    return rows.map((r) => ({ ...r, measured: r.value != null, value: r.value == null ? 10 : Math.round(clamp(r.value, 10, 99)) }));
  }

  /* ------------------------------------------------------------ arti marziali */
  // Peso di ogni qualità per gli stili scelti (media dei bisogni, 0..3). Nessuno stile: tutto 1.
  function styleFocus(styles) {
    const list = (Array.isArray(styles) ? styles : []).filter((id) => D.STYLE_NEEDS[id]);
    const out = {};
    D.MA_GOALS.forEach((g) => {
      out[g.id] = list.length ? list.reduce((a, id) => a + (D.STYLE_NEEDS[id].needs[g.id] || 0), 0) / list.length : 1;
    });
    return out;
  }
  // Le qualità che contano di più per gli stili (in ordine), al massimo n.
  function topGoals(styles, n = 3) {
    const f = styleFocus(styles);
    return D.MA_GOALS.filter((g) => f[g.id] >= 2).sort((a, b) => f[b.id] - f[a.id]).slice(0, n);
  }
  // Quanto una sessione allena ogni qualità: somma di builds × serie, 0..3 rispetto alla qualità più allenata.
  function sessionGoals(items) {
    const sum = {};
    D.MA_GOALS.forEach((g) => { sum[g.id] = 0; });
    (items || []).forEach((x) => {
      const e = EX.get(x.id);
      if (!e) return;
      const sets = (x.dose && x.dose.sets) || 1;
      Object.entries(e.builds || {}).forEach(([k, w]) => { if (k in sum) sum[k] += w * sets; });
    });
    const max = Math.max(...Object.values(sum));
    return D.MA_GOALS.map((g) => ({ ...g, raw: sum[g.id], dots: max > 0 ? Math.round((sum[g.id] / max) * 3) : 0 })).filter((g) => g.dots > 0).sort((a, b) => b.raw - a.raw);
  }
  // Un esercizio serve alle qualità più importanti degli stili scelti?
  function forStyles(id, styles) {
    const e = EX.get(id);
    if (!e) return [];
    const top = topGoals(styles, 3).map((g) => g.id);
    return D.MA_GOALS.filter((g) => top.includes(g.id) && (e.builds[g.id] || 0) >= 2);
  }

  // Profilo «Per le arti marziali» dai test della settimana (null = da misurare).
  function maProfile(lab, now = Date.now()) {
    const L = (id) => latestLsi(lab, id);
    const V = (id) => latestValue(lab, id);
    const lsiScore = (id) => (L(id) == null ? null : lerp(L(id), LSI_MAP));
    const reach = V("reach");
    const kick = V("kickH");
    const kickAbs = kick ? lerp(kick[0], [[50, 15], [70, 30], [90, 45], [110, 60], [130, 74], [150, 86], [175, 96]]) : null;
    const straddle = V("straddle");
    const heel = V("heel");
    const slr = V("slr");
    const step = V("stepdown");
    const push = V("push");
    const upProg = avg([levelProgress(lab, "upper", now), levelProgress(lab, "core", now)]);
    const rows = [
      { key: "alti", value: avg([reach == null ? null : lerp(reach, [[-25, 15], [-15, 30], [-5, 48], [0, 58], [8, 72], [15, 84], [25, 95]]), kickAbs]) },
      { key: "aperti", value: straddle == null ? null : lerp(straddle, [[60, 15], [80, 28], [100, 42], [120, 56], [140, 70], [160, 82], [180, 92], [200, 98]]) },
      { key: "frusta", value: avg([heel == null ? null : lerp(heel, [[0, 92], [0.5, 84], [1, 76], [2, 60], [3, 48], [5, 30], [8, 18]]), slr == null ? null : lerp(slr, [[0, 20], [10, 50], [20, 75], [30, 90]]), lsiScore("kickH")]) },
      { key: "appoggio", value: avg([lsiScore("balance"), step == null ? null : [35, 62, 88][step], lsiScore("calf")]) },
      { key: "potenza", value: avg([lsiScore("sit"), lsiScore("bridge"), lsiScore("hop")]) },
      { key: "guardia", value: push == null ? null : lerp(push, [[0, 20], [5, 35], [10, 45], [20, 60], [30, 72], [40, 82], [55, 92]]) * 0.7 + (28 + (upProg || 0) * 62) * 0.3 }
    ];
    return rows.map((r) => {
      const g = D.MA_GOALS.find((x) => x.id === r.key);
      return { key: r.key, label: g.label, text: g.text, measured: r.value != null, value: r.value == null ? 10 : Math.round(clamp(r.value, 10, 99)) };
    });
  }

  function trend(lab, now = Date.now()) {
    if (!configured(lab)) return "Da impostare · 2 minuti";
    const p = phaseInfo(lab, now);
    const heel = latestValue(lab, "heel");
    const m = Math.floor(monthsSince(lab, now));
    return `Fase ${p.phase} · ${D.PHASES[p.phase - 1].name} · ${m === 1 ? "1 mese" : `${m} mesi`}${heel == null ? "" : heel === 0 ? " · estensione completa" : ` · estensione −${String(heel).replace(".", ",")} cm`}`;
  }

  /* ------------------------------------------------------------ difesa: avvisi per il ginocchio */
  // until: fase da cui l'esercizio torna permesso; soft: fase in cui e' permesso solo con cautela.
  const RISKS = [
    { id: "contact", re: /sparring|\blotta|proiez|takedown|atterram|single.?leg|double.?leg|spazzat|sgambett|sprawl|ashi.?barai|o.?soto/i, label: "contatto e lotta", until: 4, alt: "Al posto di questo: plank e dead bug per lo stesso tempo, o lo shadow della tua fase. Lotta, sprawl e proiezioni tornano in fase 4, dopo il nono mese e con l'ok del chirurgo." },
    { id: "spin", re: /girat[oa]|spinning|volant|saltat[oa]|in salto|\b360|\b540|giravolt|armada|meia.?lua de compasso|queixada|tornado|twimyo/i, label: "calci girati o saltati", until: 4, alt: "I calci girati e saltati tornano solo in fase 4. Fai la stessa combinazione con i pugni, o il calcio base lento se sei almeno in fase 3." },
    { id: "kick", re: /\bcalci|kick|\bteep|(mae|mawashi|yoko|ushiro|hiza|fumikomi|kakato|ura)[- ]?geri|chagi|benção|martelo|ponteira|\bchapa/i, label: "calci", until: 4, soft: 3, alt: "Per ora niente calci veri: fai lo stesso round con pugni, parate e schivate a piedi fermi, poi i Calci al rallentatore del Recupero (con la gamba operata, in appoggio sulla sana e la mano al muro). I calci lenti in movimento tornano in fase 3.", softAlt: "In fase 3 i calci si fanno lenti, bassi e al 50%, ruotando sull'avampiede della gamba d'appoggio. Velocità e altezza piene in fase 4." },
    { id: "jump", re: /\bsalt|\bbalz|pliometr|burpee|\bcorda|\bskip|jumping/i, label: "salti", until: 3, alt: "Al posto dei salti: camminata veloce sul posto o shadow da fermo per lo stesso tempo. I saltelli tornano in fase 3." },
    { id: "deep", re: /squat|accosciat|affond|lunge|\bginga|cavalier|\bkiba|horse|posizione bassa|ma bu|pistol|cosacco/i, label: "piegamenti profondi delle gambe", until: 3, alt: "Fai la versione del Recupero adatta alla tua fase (seduto-in piedi dalla sedia o affondo statico breve), senza scendere oltre dove non hai dolore." },
    { id: "pivot", re: /pivot|\bperno|cambi di direzione|cambio di direzione|zig.?zag/i, label: "pivot e cambi di direzione", until: 4, soft: 3, alt: "Per ora niente pivot: fai le combinazioni a piedi fermi, con il tallone che si alza e gira sull'avampiede, o la versione da seduto. I pivot lenti tornano in fase 3.", softAlt: "In fase 3 i pivot si fanno solo sull'avampiede, al 50–75% della velocità. Cambi di direzione veloci in fase 4." },
    { id: "run", re: /\bscatt|sprint|\bcorsa|navetta/i, label: "corsa e scatti", until: 4, soft: 3, alt: "Per ora camminata veloce in linea retta. La corsa leggera torna in fase 3, gli scatti in fase 4.", softAlt: "In fase 3 corsa leggera solo in linea retta; scatti e navette in fase 4." },
    { id: "kneel", re: /in ginocchio|ginocchia a terra|seiza|inginocch|a quattro zampe/i, label: "appoggio in ginocchio", until: 3, alt: "Metti un cuscino sotto il ginocchio, oppure fai l'esercizio in piedi o da sdraiato." }
  ];
  // text: stringa, oppure { title, body }. Calci, girati e pivot nel corpo del testo contano solo se
  // citati almeno due volte (una parola di passaggio in un defaticamento non basta).
  const TWICE = ["kick", "spin", "pivot"];
  function kneeRisk(lab, text, now = Date.now()) {
    if (!configured(lab) || !text) return null;
    const title = typeof text === "string" ? text : String(text.title || "");
    const body = typeof text === "string" ? "" : String(text.body || "");
    const ph = phase(lab, now);
    const hits = [];
    RISKS.forEach((r) => {
      if (ph >= r.until) return;
      const g = new RegExp(r.re.source, "gi");
      const inBody = (body.match(g) || []).length;
      const hit = r.re.test(title) || (TWICE.includes(r.id) ? inBody >= 2 : inBody >= 1);
      if (!hit) return;
      const soft = r.soft && ph >= r.soft;
      hits.push({ id: r.id, label: r.label, alt: soft ? r.softAlt : r.alt, soft: !!soft });
    });
    if (!hits.length) return null;
    return { phase: ph, soft: hits.every((h) => h.soft), risks: hits };
  }

  return {
    VERSION, DATA: D, EX, TEST, RATINGS,
    ensure, configured, setSetup, monthsSince, dateAfterMonths, gates, surgeryTime,
    checkIn, todayCheck, readiness, readinessOf,
    lsi, latest, latestValue, latestLsi, recordTest, testDue, lastTestTime, criteriaFor, phaseInfo, phase,
    maxLevel, levelOf, setLevel, doseOf, doseText,
    suggest, buildSession, startSession, rate, cancelSession, finishSession, extToday, extNeed,
    plan, streak, alerts, profile, trend, kneeRisk, dayKey,
    styleFocus, topGoals, sessionGoals, forStyles, maProfile
  };
});
