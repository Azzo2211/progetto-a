/*
 * Progetto A - Memoria: il gioco, senza DOM. «La Torre della Memoria».
 *
 * I 42 giorni del percorso sono 42 piani; ogni 7 c'e' un guardiano, una prova vera (parole nel
 * palazzo, cifre, carte, nomi e volti). Ogni piano ha tre stelle: completato, preciso (almeno il
 * 90% in ogni esercizio con punteggio del giorno) e sfida (una versione piu' difficile
 * dell'esercizio del giorno). In piu': punti (XP) e livelli, missioni del giorno, serie con gli
 * scudi, la memoria attuale (quanto ricorderesti adesso di tutto quello che hai imparato, stimato
 * con FSRS) e il tempo di allenamento con l'allenamento extra per chi ha piu' di mezz'ora.
 *
 * Regola: punti e stelle arrivano solo ricordando (risposte giuste, turni riusciti), mai dal tempo
 * passato o dai clic. Si aggancia al motore con E.hooks (registro attivita', ripassi, stato).
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MemoryGame = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const E = root.MemoryEngine || (typeof require === "function" ? require("./engine.js") : null);
  const S = root.MemorySRS || (typeof require === "function" ? require("./srs.js") : null);
  const CO = root.MemoryCourse || (typeof require === "function" ? require("./course.js") : null);
  if (!E || !S || !CO || !E.hooks) return {};

  const DAY = 86400000;
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const isDayKey = (k) => typeof k === "string" && /^\d{4}-\d{2}-\d{2}$/.test(k);

  const MINUTES = [30, 45, 60, 90, 120];   // tempo al giorno a scelta
  const MAX_SHIELDS = 3;
  const XP = { day: 100, precise: 50, challenge: 100, boss: 250, mission: 50, allMissions: 100 };

  /* ------------------------------------------------------------ guardiani e sfide */
  const BOSSES = {
    7: { name: "Il Guardiano delle Parole", kind: "palace", n: 20, per: 1, target: 18, title: "Apprendista", line: "Venti parole nel palazzo, una per luogo, in ordine: ne servono 18." },
    14: { name: "Il Custode dei Palazzi", kind: "palace", n: 40, per: 2, target: 36, title: "Custode dei palazzi", line: "Quaranta parole, due per luogo: ne servono 36." },
    21: { name: "Il Guardiano dei Numeri", kind: "dis", key: "numbers", n: 40, mem: 180, target: 36, title: "Maestro dei numeri", line: "Quaranta cifre in 3 minuti con la regola delle gare (una riga con un errore vale la metà): servono 36 punti." },
    28: { name: "Il Mazziere", kind: "dis", key: "cards", n: 26, mem: 180, target: 24, title: "Mazziere", line: "Mezzo mazzo in 3 minuti: 24 carte al posto giusto." },
    35: { name: "Il Mentalista", kind: "dis", key: "faces", n: 20, mem: 150, target: 18, title: "Mentalista", line: "Venti nomi e volti in due minuti e mezzo: ne servono 18." },
    42: { name: "Il Signore della Torre", kind: "palace", n: 60, per: 2, target: 54, title: "Signore della Torre", line: "Sessanta parole nel palazzo, due per luogo, come la prova lunga dello studio di Dresler: ne servono 54." }
  };
  const CHESS_CH = {
    colors: { kind: "chess", drill: "colors", target: 20, maxMs: 30000, label: "Colori delle case: 20 su 20 in meno di 30 secondi" },
    knight: { kind: "chess", drill: "knight", target: 10, maxMs: 90000, label: "Salti del cavallo: 10 su 10 in meno di 90 secondi" },
    flash: { kind: "chess", drill: "flash", target: 5, secs: 10, label: "Posizione lampo: 5 risposte giuste su 5 guardando 10 secondi" }
  };
  // per i piani senza esercizi con punteggio (test, mazzi): una sfida sulla tecnica della settimana
  const WEEK_CH = {
    1: { kind: "dis", key: "words", n: 15, mem: 120 },
    2: { kind: "palace", n: 30, per: 2 },
    3: { kind: "dis", key: "numbers", n: 40, mem: 150 },
    4: { kind: "dis", key: "cards", n: 20, mem: 180 },
    5: { kind: "dis", key: "faces", n: 15, mem: 120 },
    6: { kind: "dis", key: "words", n: 30, mem: 90 }
  };
  function fmtMem(s) {
    if (s < 60) return `${s} secondi`;
    if (s % 60 === 0) return s === 60 ? "1 minuto" : `${s / 60} minuti`;
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} minuti`;
  }
  function roundLabel(c) {
    if (c.kind === "palace") return `${c.n} parole nel palazzo${c.per === 2 ? ", due per luogo" : ""}`;
    if (c.life) return `${E.LIFE_DRILLS[c.life].label}: ${c.n} ${c.life === "phone" ? "cifre" : "cose da comprare"} in ${fmtMem(c.mem)}`;
    return `${c.n} ${E.DISCIPLINES[c.key].unit} in ${fmtMem(c.mem)}`;
  }
  // La sfida del piano: la versione piu' difficile dell'esercizio principale del giorno.
  function challengeFor(day) {
    const def = CO.DAYS[day - 1];
    if (!def) return null;
    const b = BOSSES[day];
    if (b) return { day, boss: true, ...b, label: b.line };
    const tasks = def.tasks.filter((t) => !t.opt);
    const pal = tasks.find((t) => t.k === "palace");
    const dis = tasks.filter((t) => t.k === "dis").sort((a, b2) => b2.n - a.n)[0];
    const life = tasks.find((t) => t.k === "life");
    const chess = tasks.find((t) => t.k === "chess");
    const text = def.tasks.find((t) => t.k === "text");
    let c;
    if (pal) c = { kind: "palace", n: pal.n + ((pal.per || 1) === 2 ? 10 : 5), per: pal.per || 1 };
    else if (dis) c = { kind: "dis", key: dis.key, n: dis.key === "images" ? dis.n + 5 : Math.min(dis.key === "cards" ? 52 : 120, Math.ceil(dis.n * 1.25)), mem: dis.mem };
    else if (life) { const d = E.LIFE_DRILLS[life.drill]; c = { kind: "dis", key: d.key, n: Math.ceil(d.n * 1.25), mem: d.mem, list: d.list || null, life: life.drill }; }
    else if (chess) c = { ...CHESS_CH[chess.drill] };
    else if (text) c = { kind: "text", text: text.text || "infinito", target: 95, label: "Il testo intero a memoria, con almeno il 95% delle parole" };
    else if (tasks.some((t) => t.k === "cardsys")) c = { kind: "dis", key: "cards", n: 12, mem: 120 };
    else if (tasks.some((t) => t.k === "pao")) c = { kind: "dis", key: "numbers", n: 24, mem: 90 };
    else c = { ...WEEK_CH[def.w] };
    const out = { day, boss: false, ...c };
    if (out.kind === "palace" || out.kind === "dis") {
      out.target = Math.ceil(out.n * 0.9);
      out.label = `${roundLabel(out)}, ne servono ${out.target}`;
    }
    return out;
  }
  function challengeWon(e) {
    const m = isObj(e && e.m) ? e.m : {};
    if (!num(m.ch) || !num(m.tg)) return false;
    const score = e.kind === "text" ? m.pct : m.score;
    return num(score) && score >= m.tg && (!num(m.maxMs) || (num(m.ms) && m.ms <= m.maxMs));
  }
  function titleOf(lab) {
    const days = Object.keys(lab.game.seals).map(Number).filter((d) => BOSSES[d]).sort((a, b) => b - a);
    return days.length ? BOSSES[days[0]].title : "Novizio";
  }

  /* ------------------------------------------------------------ punti e livelli */
  // livello L (da 1): servono 50 * (L-1) * L punti in tutto. 100 per il 2, 300 per il 3, 600 per il 4...
  function levelOf(xp) {
    const x = Math.max(0, num(xp) ? xp : 0);
    const L = Math.floor((Math.sqrt(1 + (8 * x) / 100) - 1) / 2 + 1e-9);
    const from = 50 * L * (L + 1);
    const to = 50 * (L + 1) * (L + 2);
    return { level: L + 1, xp: x, from, to, into: x - from, need: to - from, pct: (x - from) / (to - from) };
  }
  function push(lab, ev, now = Date.now()) {
    const g = lab.game;
    g.events.push({ t: now, ...ev });
    g.events = g.events.slice(-12);
  }
  function trimKeys(obj, max) {
    const ks = Object.keys(obj).sort();
    ks.slice(0, Math.max(0, ks.length - max)).forEach((k) => { delete obj[k]; });
  }
  function gain(lab, amount, now = Date.now()) {
    const g = lab.game;
    const xp = Math.round(amount);
    if (!g || !(xp > 0)) return 0;
    const before = levelOf(g.xp).level;
    g.xp += xp;
    const k = E.dayKey(now);
    g.daily[k] = (g.daily[k] || 0) + xp;
    trimKeys(g.daily, 90);
    const after = levelOf(g.xp).level;
    if (after > before) push(lab, { type: "level", text: `Livello ${after}`, sub: "Più ricordi, più sali." }, now);
    return xp;
  }
  // punti di una voce del registro: solo per quello che hai ricordato
  function xpOf(e) {
    const m = isObj(e.m) ? e.m : {};
    const k = e.kind;
    const acc = num(m.score) && num(m.max) && m.max > 0 ? m.score / m.max : null;
    if (k.startsWith("dis:") || k === "palace") return Math.max(0, m.score || 0) * (acc === 1 && m.max >= 5 ? 1.5 : 1) + (m.rec ? 15 : 0);
    if (k.startsWith("chess:")) return Math.max(0, m.score || 0) * 2 + (acc === 1 ? 10 : 0);
    if (k === "text") return m.mode === "read" ? 5 : m.mode === "full" ? (m.pct || 0) / 4 : (m.pct || 0) / 10;
    if (k === "major") return m.ok ? 2 : 0;
    if (k === "test:words-trials") return 40;
    if (k === "test:words") return 20;
    if (k.startsWith("test:")) return 30;
    if (k === "sys:cards" || k === "sys:pao" || k === "review") return acc != null && acc >= 0.9 && m.max >= 5 ? 10 : 0;
    if (k === "course:start") return 20;
    return 0; // life:* conta gia' come dis:*, course:dayN da' la stella
  }

  /* ------------------------------------------------------------ stelle */
  function setStar(lab, day, which, t = Date.now()) {
    const g = lab.game;
    if (!Number.isInteger(day) || day < 1 || day > CO.LENGTH) return false;
    const s = g.stars[day] || (g.stars[day] = {});
    if (num(s[which])) return false;
    s[which] = t;
    if (which === "s" && BOSSES[day]) {
      g.seals[day] = t;
      gain(lab, XP.boss, t);
      g.shields = Math.min(MAX_SHIELDS, g.shields + 1);
      push(lab, { type: "boss", day, text: `${BOSSES[day].name}: sconfitto`, sub: `Sigillo ${Object.keys(g.seals).length} di 6 · titolo: ${titleOf(lab)} · +1 scudo` }, t);
      return true;
    }
    gain(lab, which === "c" ? XP.day : which === "p" ? XP.precise : XP.challenge, t);
    push(lab, { type: "star", day, which, text: which === "c" ? `Piano ${day} completato` : which === "p" ? `Piano ${day}: preciso` : `Piano ${day}: sfida superata` }, t);
    return true;
  }
  function onChallenge(lab, e) {
    const m = e.m;
    const day = m.ch;
    if (!Number.isInteger(day) || !CO.DAYS[day - 1]) return;
    const g = lab.game;
    if (BOSSES[day]) {
      const score = e.kind === "text" ? m.pct : m.score;
      if (num(score)) g.bossBest[day] = Math.max(g.bossBest[day] || 0, score);
      g.bossTries[day] = (g.bossTries[day] || 0) + 1;
    }
    if (challengeWon(e)) setStar(lab, day, "s", e.t);
  }
  // finestra di un piano: da quando si e' aperto a quando si e' aperto il successivo
  function windowOf(lab, day) {
    const c = lab.course;
    const from = num(c.opened[day]) ? c.opened[day] : c.start;
    const to = num(c.opened[day + 1]) ? c.opened[day + 1] : Infinity;
    return [from, to];
  }
  function accOf(e) {
    const m = e.m || {};
    if (e.kind === "text") return num(m.pct) ? m.pct / 100 : 0;
    return num(m.score) && num(m.max) && m.max > 0 ? m.score / m.max : 0;
  }
  // Precisione del piano: per ogni esercizio con punteggio il miglior tentativo; conta il peggiore.
  function dayQuality(lab, day) {
    const c = lab.course;
    const def = CO.DAYS[day - 1];
    if (!c || !num(c.start) || !def) return null;
    const [from, to] = windowOf(lab, day);
    const logs = lab.log.filter((e) => e.t >= from && e.t < to && isObj(e.m));
    const parts = [];
    def.tasks.filter((t) => !t.opt).forEach((t) => {
      let pick = null;
      if (t.k === "dis") pick = (e) => e.kind === `dis:${t.key}` && num(e.m.n) && e.m.n >= t.n;
      else if (t.k === "palace") pick = (e) => e.kind === "palace" && num(e.m.n) && e.m.n >= t.n;
      else if (t.k === "life") pick = (e) => e.kind === `life:${t.drill}`;
      else if (t.k === "chess") pick = (e) => e.kind === `chess:${t.drill}`;
      else if (t.k === "cardsys") pick = (e) => e.kind === "sys:cards";
      else if (t.k === "pao") pick = (e) => e.kind === "sys:pao";
      else if (t.k === "text") pick = (e) => e.kind === "text" && e.m.mode === "full";
      if (!pick) return;
      const list = logs.filter(pick);
      parts.push({ id: t.id, k: t.k, best: list.length ? Math.max(...list.map(accOf)) : null });
    });
    const min = parts.length ? Math.min(...parts.map((p) => (p.best == null ? 0 : p.best))) : 1;
    return { parts, min, scored: parts.length };
  }
  function starCount(s) {
    return s ? ["c", "p", "s"].filter((f) => num(s[f])).length : 0;
  }
  function floorOf(lab, day) {
    const def = CO.DAYS[day - 1];
    if (!def) return null;
    const c = lab.course;
    const started = Boolean(c && num(c.start));
    const cur = started ? (num(c.done) ? CO.LENGTH + 1 : c.day) : 0;
    const st = lab.game.stars[day] || {};
    return {
      day, def, week: def.w, boss: BOSSES[day] || null,
      state: !started ? "locked" : day < cur ? "past" : day === cur ? "now" : "locked",
      stars: { c: num(st.c), p: num(st.p), s: num(st.s) }, count: starCount(st),
      quality: started && day <= cur ? dayQuality(lab, day) : null,
      challenge: challengeFor(day),
      best: num(lab.game.bossBest[day]) ? lab.game.bossBest[day] : null,
      tries: lab.game.bossTries[day] || 0
    };
  }
  function challengeOpen(lab, day) {
    const c = lab.course;
    return Boolean(c && num(c.start) && CO.DAYS[day - 1] && (num(c.done) || day <= c.day));
  }

  /* ------------------------------------------------------------ memoria attuale e tempo */
  // Quanto ricorderesti adesso di quello che hai imparato: media della probabilita' di ricordo.
  function memoryNow(lab, now = Date.now()) {
    const rs = [];
    const add = (st) => { const r = st ? S.retrievability(st, now) : null; if (num(r)) rs.push(r); };
    lab.decks.forEach((d) => d.cards.forEach((card) => E.sidesOf(d).forEach((side) => add(card.st[side]))));
    Object.values(lab.systems.cards).forEach(add);
    Object.values(lab.systems.pao).forEach((x) => add(x.st));
    lab.texts.forEach((t) => add(t.st));
    // sistema fonetico (scatole di Leitner): la stabilita' e' circa l'intervallo della scatola
    Object.values(lab.major.items).forEach((it) => {
      if (!num(it.last)) return;
      rs.push(S.retrievabilityAt((now - it.last) / DAY, Math.max(0.5, E.MAJOR_INTERVALS[it.box] || 0.5)));
    });
    if (!rs.length) return { pct: null, n: 0, low: 0 };
    const avg = rs.reduce((a, b) => a + b, 0) / rs.length;
    return { pct: Math.round(avg * 1000) / 10, n: rs.length, low: rs.filter((r) => r < 0.9).length };
  }
  function addActiveTime(lab, seconds, now = Date.now()) {
    const g = lab.game;
    if (!g || !(seconds > 0)) return;
    const k = E.dayKey(now);
    g.time[k] = Math.min(24 * 3600, (g.time[k] || 0) + Math.round(seconds));
    trimKeys(g.time, 60);
  }
  function minutesToday(lab, now = Date.now()) {
    const g = lab.game;
    return g ? Math.floor((g.time[E.dayKey(now)] || 0) / 60) : 0;
  }
  function setMinutes(lab, minutes) {
    if (MINUTES.includes(minutes)) lab.game.minutes = minutes;
  }

  /* ------------------------------------------------------------ missioni del giorno */
  const todayLogs = (lab, now) => { const k = E.dayKey(now); return lab.log.filter((e) => E.dayKey(e.t) === k); };
  const dueNow = (lab, now) => E.reviewSummary(lab, now).total + E.majorQueue(lab, now).due.length;
  const reviewsToday = (lab, now) => { const k = E.dayKey(now); return lab.revlog.filter((e) => E.dayKey(e.t) === k).length + todayLogs(lab, now).filter((e) => e.kind === "major").length; };
  const courseWeek = (lab) => (lab.course && num(lab.course.start) ? (num(lab.course.done) ? 6 : Math.ceil(lab.course.day / 7)) : 0);
  const MISSIONS = {
    review: {
      label: () => "Ripassa tutto quello che scade oggi",
      eligible: (lab, now) => dueNow(lab, now) > 0,
      check: (lab, now) => dueNow(lab, now) === 0 && reviewsToday(lab, now) > 0,
      note: (lab, now) => { const n = dueNow(lab, now); return n ? `ne restano ${n}` : ""; }
    },
    minutes: {
      label: (lab, x) => `Allenati ${x.target} minuti`,
      eligible: () => true,
      check: (lab, now, x) => minutesToday(lab, now) >= x.target,
      note: (lab, now, x) => `${Math.min(x.target, minutesToday(lab, now))} di ${x.target}`
    },
    perfect: {
      label: () => "Un turno perfetto con almeno 10 elementi",
      eligible: () => true,
      check: (lab, now) => todayLogs(lab, now).some((e) => (e.kind.startsWith("dis:") || e.kind === "palace") && isObj(e.m) && e.m.max >= 10 && e.m.score === e.m.max)
    },
    record: {
      label: () => "Batti un tuo record in una disciplina a livelli",
      eligible: (lab) => Object.values(lab.disciplines).some((d) => d.history.some((h) => !h.custom)),
      check: (lab, now) => todayLogs(lab, now).some((e) => e.kind.startsWith("dis:") && isObj(e.m) && e.m.rec)
    },
    challenge: {
      label: () => "Supera una sfida della Torre (anche di un piano passato)",
      eligible: (lab) => Boolean(lab.course && num(lab.course.start)),
      check: (lab, now) => todayLogs(lab, now).some((e) => !e.kind.startsWith("life:") && challengeWon(e))
    },
    major: {
      label: () => "Sistema fonetico: tutte le immagini di oggi",
      eligible: (lab, now) => { const q = E.majorQueue(lab, now); return q.due.length + q.fresh.length > 0; },
      check: (lab, now) => { const q = E.majorQueue(lab, now); return q.due.length + q.fresh.length === 0; }
    },
    cards: {
      label: () => "Sistema delle carte: tutte le carte di oggi",
      eligible: (lab, now) => { if (!Object.keys(lab.systems.cards).length) return false; const q = E.cardsQueue(lab, now); return q.due.length + q.fresh.length > 0; },
      check: (lab, now) => { const q = E.cardsQueue(lab, now); return q.due.length + q.fresh.length === 0; }
    },
    pao: {
      label: () => "Scrivi 5 persone e azioni nuove",
      eligible: (lab) => E.paoFilled(lab) < 100 && (E.paoFilled(lab) > 0 || courseWeek(lab) >= 5),
      base: (lab) => E.paoFilled(lab),
      check: (lab, now, x) => E.paoFilled(lab) - (x.base || 0) >= 5,
      note: (lab, now, x) => `${clamp(E.paoFilled(lab) - (x.base || 0), 0, 5)} di 5`
    },
    text: {
      label: () => "Recita un testo a memoria con almeno il 90%",
      eligible: (lab) => lab.texts.length > 0,
      check: (lab, now) => todayLogs(lab, now).some((e) => e.kind === "text" && isObj(e.m) && e.m.mode === "full" && e.m.pct >= 90)
    },
    flash: {
      label: () => "Posizione lampo: tutte le risposte giuste",
      eligible: (lab) => courseWeek(lab) >= 5 || Boolean(lab.chessDrills.flash),
      check: (lab, now) => todayLogs(lab, now).some((e) => e.kind === "chess:flash" && isObj(e.m) && e.m.max > 0 && e.m.score === e.m.max)
    },
    palace: {
      label: () => "Un giro nel palazzo con almeno 20 parole e il 90%",
      eligible: (lab) => lab.palaces.some((p) => p.loci.length >= 10),
      check: (lab, now) => todayLogs(lab, now).some((e) => e.kind === "palace" && isObj(e.m) && e.m.n >= 20 && e.m.score >= 0.9 * e.m.max)
    },
    speed: {
      label: () => "Una disciplina nel formato da un minuto con almeno l'80%",
      eligible: (lab) => courseWeek(lab) >= 6,
      check: (lab, now) => todayLogs(lab, now).some((e) => e.kind.startsWith("dis:") && isObj(e.m) && num(e.m.mem) && e.m.mem <= 60 && e.m.score >= 0.8 * e.m.max)
    }
  };
  const RANDOM_MISSIONS = ["perfect", "record", "challenge", "major", "cards", "pao", "text", "flash", "palace", "speed"];
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // tre missioni al giorno: il ripasso se c'e' qualcosa in scadenza, il tuo tempo, il resto a sorte
  function pickMissions(lab, now) {
    const list = [];
    if (MISSIONS.review.eligible(lab, now)) list.push({ id: "review" });
    list.push({ id: "minutes", target: lab.game.minutes });
    const pool = E.shuffle(RANDOM_MISSIONS.filter((id) => MISSIONS[id].eligible(lab, now)), E.rng(hashStr(E.dayKey(now))));
    while (list.length < 3 && pool.length) list.push({ id: pool.shift() });
    list.forEach((x) => { if (MISSIONS[x.id].base) x.base = MISSIONS[x.id].base(lab, now); });
    return { list, done: {}, all: null };
  }
  function syncMissions(lab, now) {
    const g = lab.game;
    const k = E.dayKey(now);
    let changed = false;
    if (!g.missions[k]) { g.missions[k] = pickMissions(lab, now); trimKeys(g.missions, 7); changed = true; }
    const day = g.missions[k];
    day.list.forEach((x) => {
      if (num(day.done[x.id])) return;
      if (x.id === "minutes" && x.target !== g.minutes) { x.target = g.minutes; changed = true; }
      const def = MISSIONS[x.id];
      if (def && def.check(lab, now, x)) {
        day.done[x.id] = now;
        gain(lab, XP.mission, now);
        push(lab, { type: "mission", text: "Missione compiuta", sub: def.label(lab, x) }, now);
        changed = true;
      }
    });
    if (!num(day.all) && day.list.length && day.list.every((x) => num(day.done[x.id]))) {
      day.all = now;
      gain(lab, XP.allMissions, now);
      g.shieldProgress += 1;
      let sub = `Verso il prossimo scudo: ${g.shieldProgress} di 3 giorni`;
      if (g.shieldProgress >= 3) {
        g.shieldProgress = 0;
        if (g.shields < MAX_SHIELDS) { g.shields += 1; sub = "Nuovo scudo per la serie"; } else sub = "Scudi già al massimo";
      }
      push(lab, { type: "missions", text: "Tutte le missioni di oggi", sub }, now);
      changed = true;
    }
    return changed;
  }

  /* ------------------------------------------------------------ serie e scudi */
  // Se hai saltato uno o due giorni e oggi ti alleni, gli scudi coprono i giorni saltati.
  function guardStreak(lab, now) {
    const g = lab.game;
    if (g.shields <= 0 || !lab.days.includes(E.dayKey(now))) return false;
    const have = new Set(lab.days.concat(g.covered));
    const t0 = E.startOfDay(now);
    let gap = 0;
    let found = false;
    for (let i = 1; i <= MAX_SHIELDS + 1; i += 1) {
      if (have.has(E.dayKey(E.addDays(t0, -i)))) { found = true; break; }
      gap += 1;
    }
    if (!found || gap === 0 || gap > g.shields) return false;
    for (let i = 1; i <= gap; i += 1) g.covered.push(E.dayKey(E.addDays(t0, -i)));
    g.covered = g.covered.slice(-60);
    g.shields -= gap;
    push(lab, { type: "shield", text: gap === 1 ? "Scudo usato: la serie continua" : `${gap} scudi usati: la serie continua`, sub: `Ti restano ${g.shields} ${g.shields === 1 ? "scudo" : "scudi"}.` }, now);
    return true;
  }
  function streakInfo(lab, now) {
    const g = lab.game;
    const n = E.streak(lab, now);
    const today = lab.days.includes(E.dayKey(now));
    const have = new Set(lab.days.concat(g.covered));
    const t0 = E.startOfDay(now);
    const yesterday = have.has(E.dayKey(E.addDays(t0, -1)));
    // ieri saltato ma prima c'era una serie: uno scudo la salva se oggi ti alleni
    let saved = 0;
    if (!today && !yesterday) {
      let gap = 1;
      for (let i = 2; i <= MAX_SHIELDS + 1; i += 1) { if (have.has(E.dayKey(E.addDays(t0, -i)))) { saved = gap <= g.shields ? gap : 0; break; } gap += 1; }
    }
    return { n, today, atRisk: !today && (yesterday || saved > 0), shieldsNeeded: saved, shields: g.shields, progress: g.shieldProgress };
  }

  /* ------------------------------------------------------------ allenamento extra */
  const FOCUS = {
    0: [{ key: "words", n: 10, mem: 90 }],
    1: [{ key: "words", n: 15, mem: 120 }, { key: "faces", n: 6, mem: 60 }],
    2: [{ palace: true, n: 30, per: 2 }, { key: "faces", n: 10, mem: 90 }],
    3: [{ key: "numbers", n: 40, mem: 180 }, { key: "dates", n: 10, mem: 150 }],
    4: [{ key: "cards", n: 20, mem: 180 }, { key: "images", n: 15, mem: 90 }],
    5: [{ key: "numbers", n: 36, mem: 180 }, { key: "faces", n: 15, mem: 120 }],
    6: [{ key: "words", n: 30, mem: 90 }, { key: "numbers", n: 40, mem: 90 }, { key: "cards", n: 26, mem: 120 }]
  };
  const ARENA = { 0: "words", 1: "words", 2: "faces", 3: "numbers", 4: "cards", 5: "images", 6: "numbers" };
  // la disciplina con la precisione media piu' bassa negli ultimi 14 giorni (almeno 2 turni)
  function weakPoint(lab, now) {
    const from = now - 14 * DAY;
    const by = {};
    lab.log.forEach((e) => {
      if (e.t < from || !e.kind.startsWith("dis:") || !isObj(e.m) || !num(e.m.max) || !e.m.max) return;
      const key = e.kind.slice(4);
      if (!E.DISCIPLINES[key]) return;
      (by[key] || (by[key] = [])).push(e);
    });
    let worst = null;
    Object.keys(by).forEach((key) => {
      const list = by[key].slice(-5);
      if (list.length < 2) return;
      const acc = list.reduce((s, e) => s + e.m.score / e.m.max, 0) / list.length;
      const last = list[list.length - 1].m;
      if (acc < 0.9 && (!worst || acc < worst.acc)) worst = { key, acc, n: clamp(last.n || 10, 4, 120), mem: clamp(last.mem || 60, 30, 900) };
    });
    return worst;
  }
  function extraPlan(lab, now = Date.now()) {
    const out = [];
    const cs = E.courseStatus(lab, now, false);
    const g = lab.game;
    const todays = todayLogs(lab, now);
    const doneRound = (key, n) => todays.some((e) => e.kind === `dis:${key}` && isObj(e.m) && e.m.n >= n);
    const due = dueNow(lab, now);
    if (due) out.push({ id: "review", title: "Ripassi in scadenza", detail: `${due} da ripassare: la memoria attuale sale subito.`, minutes: clamp(Math.round(due * 0.3), 3, 20), go: { tab: "review" } });
    const week = cs.started ? (cs.done ? 6 : Math.ceil(cs.day / 7)) : 0;
    if (cs.started) {
      const day = cs.done ? CO.LENGTH : cs.day;
      const ch = challengeFor(day);
      if (ch && !num((g.stars[day] || {}).s)) out.push({ id: `ch${day}`, title: ch.boss ? `Guardiano: ${ch.name}` : `Sfida del piano ${day}`, detail: ch.label, minutes: ch.boss ? 12 : 8, go: { game: "challenge", day }, boss: Boolean(ch.boss) });
      const bossDays = Object.keys(BOSSES).map(Number).filter((d) => d < day && !num((g.stars[d] || {}).s));
      if (bossDays.length) { const d = bossDays[bossDays.length - 1]; out.push({ id: `ch${d}`, title: `Guardiano: ${BOSSES[d].name}`, detail: BOSSES[d].line, minutes: 12, go: { game: "challenge", day: d }, boss: true }); }
    }
    const weak = weakPoint(lab, now);
    if (weak) {
      const d = E.DISCIPLINES[weak.key];
      out.push({ id: "weak", title: `Punto debole: ${d.label.toLowerCase()}`, detail: `${Math.round(weak.acc * 100)}% di media negli ultimi turni. Di nuovo ${weak.n} ${d.unit} in ${fmtMem(weak.mem)}, con calma: prima precisi, poi veloci.`, minutes: 7, go: { custom: { key: weak.key, n: weak.n, mem: weak.mem } }, done: doneRound(weak.key, weak.n) && todays.some((e) => e.kind === `dis:${weak.key}` && isObj(e.m) && e.m.score >= 0.9 * e.m.max) });
    }
    (FOCUS[week] || FOCUS[1]).forEach((f, i) => {
      if (weak && f.key === weak.key) return;
      if (f.palace) {
        const done = todays.some((e) => e.kind === "palace" && isObj(e.m) && e.m.n >= f.n);
        out.push({ id: `focus${i}`, title: "Allenamento della settimana: palazzo", detail: `${f.n} parole, due per luogo.`, minutes: 9, go: { palace: { n: f.n, per: f.per } }, done });
        return;
      }
      const d = E.DISCIPLINES[f.key];
      out.push({ id: `focus${i}`, title: `Allenamento della settimana: ${d.label.toLowerCase()}`, detail: `${f.n} ${d.unit} in ${fmtMem(f.mem)}.`, minutes: Math.max(4, Math.round(f.mem / 60) + 4), go: { custom: { key: f.key, n: f.n, mem: f.mem } }, done: doneRound(f.key, f.n) });
    });
    if (cs.started) {
      const top = cs.done ? CO.LENGTH + 1 : cs.day;
      for (let d = 1; d < top; d += 1) {
        if (BOSSES[d] || num((g.stars[d] || {}).s)) continue;
        const ch = challengeFor(d);
        out.push({ id: `ch${d}`, title: `Stella mancante: sfida del piano ${d}`, detail: ch.label, minutes: 8, go: { game: "challenge", day: d } });
        break;
      }
    }
    const key = ARENA[week] || "words";
    out.push({ id: "arena", title: `Livelli da gara: ${E.DISCIPLINES[key].label.toLowerCase()}`, detail: `Sei al livello ${lab.disciplines[key].level} di 10: l'ultimo è il formato di Memory League.`, minutes: 6, go: { tab: "disciplines", discipline: key } });
    // niente doppioni (per esempio la sfida di oggi e quella del guardiano)
    const seen = new Set();
    return out.filter((x) => (seen.has(x.id) ? false : seen.add(x.id)));
  }

  /* ------------------------------------------------------------ stato */
  function status(lab, now = Date.now(), sync = true) {
    const g = lab.game;
    if (!g) return null;
    let changed = false;
    const c = lab.course;
    if (sync) {
      if (c && num(c.start)) {
        // prima stella anche per le giornate chiuse prima del gioco
        Object.keys(c.finished).forEach((d) => { if (setStar(lab, Number(d), "c", c.finished[d])) changed = true; });
        const top = num(c.done) ? CO.LENGTH : c.day;
        for (let d = 1; d <= top; d += 1) {
          const s = g.stars[d];
          if (!s || !num(s.c) || num(s.p)) continue;
          const q = dayQuality(lab, d);
          if (q && q.min >= 0.9) { setStar(lab, d, "p", now); changed = true; }
        }
      }
      if (syncMissions(lab, now)) changed = true;
      if (guardStreak(lab, now)) changed = true;
      const mem = memoryNow(lab, now);
      const k = E.dayKey(now);
      if (mem.pct != null && g.memo[k] !== mem.pct) { g.memo[k] = mem.pct; trimKeys(g.memo, 120); changed = true; }
    }
    const k = E.dayKey(now);
    const md = g.missions[k] || { list: [], done: {}, all: null };
    const missions = md.list.map((x) => {
      const def = MISSIONS[x.id];
      return { id: x.id, label: def.label(lab, x), done: num(md.done[x.id]), note: def.note ? def.note(lab, now, x) : "" };
    });
    const stars = Object.values(g.stars).reduce((a, s) => a + starCount(s), 0);
    return {
      changed, xp: g.xp, level: levelOf(g.xp), title: titleOf(lab), seals: Object.keys(g.seals).length,
      stars, starsMax: CO.LENGTH * 3, missions, allMissions: num(md.all),
      mem: memoryNow(lab, now), target: lab.prefs.retention, minutes: minutesToday(lab, now), budget: g.minutes,
      streak: streakInfo(lab, now), todayXp: g.daily[k] || 0
    };
  }
  function popEvents(lab) {
    const ev = lab.game ? lab.game.events.slice() : [];
    if (lab.game) lab.game.events = [];
    return ev;
  }

  /* ------------------------------------------------------------ stato salvato */
  function pick(m, test) {
    const out = {};
    if (isObj(m)) Object.keys(m).forEach((k) => { if (test(k, m[k])) out[k] = m[k]; });
    return out;
  }
  function ensureGame(lab, o) {
    const x = isObj(o) && isObj(o.game) ? o.game : {};
    const stars = {};
    if (isObj(x.stars)) Object.keys(x.stars).forEach((d) => {
      const v = x.stars[d];
      const n = Number(d);
      if (!Number.isInteger(n) || n < 1 || n > CO.LENGTH || !isObj(v)) return;
      const s = {};
      ["c", "p", "s"].forEach((f) => { if (num(v[f])) s[f] = v[f]; });
      if (Object.keys(s).length) stars[n] = s;
    });
    const missions = {};
    if (isObj(x.missions)) Object.keys(x.missions).filter(isDayKey).sort().slice(-7).forEach((k) => {
      const m = x.missions[k];
      if (!isObj(m) || !Array.isArray(m.list)) return;
      missions[k] = {
        list: m.list.filter((it) => isObj(it) && MISSIONS[it.id]).slice(0, 3).map((it) => ({ id: it.id, ...(num(it.target) ? { target: it.target } : {}), ...(num(it.base) ? { base: it.base } : {}) })),
        done: pick(m.done, (id, v) => Boolean(MISSIONS[id]) && num(v)),
        all: num(m.all) ? m.all : null
      };
    });
    lab.game = {
      xp: num(x.xp) && x.xp >= 0 ? Math.round(x.xp) : 0,
      minutes: MINUTES.includes(x.minutes) ? x.minutes : 30,
      stars,
      seals: pick(x.seals, (k, v) => Boolean(BOSSES[Number(k)]) && num(v)),
      bossBest: pick(x.bossBest, (k, v) => Boolean(BOSSES[Number(k)]) && num(v)),
      bossTries: pick(x.bossTries, (k, v) => Boolean(BOSSES[Number(k)]) && Number.isInteger(v) && v >= 0),
      missions,
      daily: pick(x.daily, (k, v) => isDayKey(k) && num(v) && v >= 0),
      time: pick(x.time, (k, v) => isDayKey(k) && num(v) && v >= 0),
      memo: pick(x.memo, (k, v) => isDayKey(k) && num(v)),
      shields: Number.isInteger(x.shields) ? clamp(x.shields, 0, MAX_SHIELDS) : 1,
      shieldProgress: Number.isInteger(x.shieldProgress) ? clamp(x.shieldProgress, 0, 2) : 0,
      covered: Array.isArray(x.covered) ? x.covered.filter(isDayKey).slice(-60) : [],
      events: Array.isArray(x.events) ? x.events.filter((e) => isObj(e) && typeof e.text === "string").slice(-12) : []
    };
    trimKeys(lab.game.daily, 90);
    trimKeys(lab.game.time, 60);
    trimKeys(lab.game.memo, 120);
  }

  /* ------------------------------------------------------------ agganci */
  E.hooks.ensure.push(ensureGame);
  E.hooks.log.push((lab, e) => {
    if (!lab.game) return;
    const xp = xpOf(e);
    if (xp) gain(lab, xp, e.t);
    const md = /^course:day(\d+)$/.exec(e.kind);
    if (md) setStar(lab, Number(md[1]), "c", e.t);
    if (isObj(e.m) && num(e.m.ch) && !e.kind.startsWith("life:")) onChallenge(lab, e);
  });
  // ripasso giusto: 2 punti; 3 se era un ripasso vero (una scheda gia' vista in un altro giorno)
  E.hooks.review.push((lab, e) => {
    if (lab.game && e.g >= 2) gain(lab, e.c && num(e.r) ? 3 : 2, e.t);
  });

  return {
    MINUTES, MAX_SHIELDS, XP, BOSSES, MISSIONS, FOCUS,
    levelOf, xpOf, gain, challengeFor, challengeWon, challengeOpen, titleOf, dayQuality, floorOf, starCount, setStar,
    memoryNow, addActiveTime, minutesToday, setMinutes, weakPoint, extraPlan, status, popEvents, ensureGame, fmtMem
  };
});
