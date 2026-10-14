/*
 * Progetto A - Cultura: motore della biblioteca (senza DOM, testabile con Node).
 *
 * - Ogni scheda ha una "scatola" (Leitner, 0-5): piu' la ricordi, piu' il
 *   ripasso successivo e' lontano (1, 3, 7, 16, 35 giorni).
 * - Studio: lettura + verifica di 5 domande + spiegazione con parole proprie.
 * - Ripasso: 2 domande della scheda (prima quelle sbagliate), al momento giusto.
 * - Profilo a 6 categorie calcolato dalle risposte vere (non da clic):
 *   Comprensione, Memoria, Collegamenti, Applicazione, Ampiezza, Costanza.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CultureEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 1;
  const DAY = 24 * 60 * 60 * 1000;
  const INTERVALS = [0, 1, 3, 7, 16, 35];
  const ON_TIME_GRACE = 2 * DAY;

  const AREAS = {
    storia: { label: "Storia", color: "#b5523b" },
    geopolitica: { label: "Geografia e geopolitica", color: "#2f7f9a" },
    diritto: { label: "Diritto e istituzioni", color: "#5c5aa8" },
    economia: { label: "Economia e finanza", color: "#2c7a3f" },
    tecnologia: { label: "Tecnologia", color: "#3b6fb5" },
    scienza: { label: "Scienza", color: "#1f7a6d" },
    mente: { label: "Filosofia e psicologia", color: "#8a4f9c" },
    arte: { label: "Arte e letteratura", color: "#a8741a" }
  };

  const BOX_LABELS = ["Da leggere", "Appena studiata", "In ripasso", "Consolidata", "Solida", "Padroneggiata"];
  const LEVEL_LABELS = { 1: "Base", 2: "Intermedio", 3: "Avanzato" };
  const TYPE_LABELS = { fatto: "Dato", comprensione: "Comprensione", applicazione: "Applicazione", collegamento: "Collegamento" };

  const DIMENSIONS = [
    { key: "comprensione", label: "Comprensione", text: "Capire perché e come funziona: le domande di comprensione, allo studio e nei ripassi." },
    { key: "memoria", label: "Memoria", text: "Ricordare nel tempo: le risposte giuste nei ripassi distanziati. Scende se lasci scadere i ripassi." },
    { key: "collegamenti", label: "Collegamenti", text: "Unire concetti di schede diverse: le domande di collegamento." },
    { key: "applicazione", label: "Applicazione", text: "Usare un concetto in un caso nuovo, anche di lavoro: le domande di applicazione." },
    { key: "ampiezza", label: "Ampiezza", text: "Quante schede hai consolidato e in quante aree diverse." },
    { key: "costanza", label: "Costanza", text: "Ripassi fatti in tempo e giorni di studio nelle ultime due settimane." }
  ];

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function dayKey(time) {
    const d = new Date(time);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function endOfDay(time) {
    const d = new Date(time);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }

  function emptyStats() {
    return { fatto: { c: 0, a: 0 }, comprensione: { c: 0, a: 0 }, applicazione: { c: 0, a: 0 }, collegamento: { c: 0, a: 0 }, review: { c: 0, a: 0 } };
  }

  /*
   * Stato della biblioteca. legacy: id gia' "segnati come studiati" nella
   * vecchia versione: entrano in ripasso subito (scatola 1, scadenza oggi).
   */
  function ensureLab(raw, { legacy = [], now = Date.now(), cards = [] } = {}) {
    const lab = raw && typeof raw === "object" && raw.version === VERSION ? raw : { version: VERSION };
    if (!lab.cards || typeof lab.cards !== "object") lab.cards = {};
    if (!lab.stats || typeof lab.stats !== "object") lab.stats = emptyStats();
    Object.entries(emptyStats()).forEach(([k, v]) => {
      if (!lab.stats[k]) lab.stats[k] = v;
    });
    if (typeof lab.reviewsDone !== "number") lab.reviewsDone = 0;
    if (typeof lab.reviewsOnTime !== "number") lab.reviewsOnTime = 0;
    if (!Array.isArray(lab.days)) lab.days = [];
    if (!Array.isArray(lab.history)) lab.history = [];
    if (!lab.migrated) {
      const known = new Set(cards.map((c) => c.id));
      legacy.forEach((id) => {
        if ((!known.size || known.has(id)) && !lab.cards[id]) lab.cards[id] = { box: 1, due: now, studiedAt: now, reviews: 0, lapses: 0, wrong: [], asked: [], legacy: true };
      });
      lab.migrated = true;
    }
    return lab;
  }

  function cardState(lab, id) {
    return lab.cards[id] || { box: 0 };
  }

  function markDay(lab, now) {
    const key = dayKey(now);
    if (!lab.days.includes(key)) lab.days.push(key);
    lab.days = lab.days.slice(-90);
  }

  function addStat(lab, type, correct) {
    const s = lab.stats[type] || (lab.stats[type] = { c: 0, a: 0 });
    s.a += 1;
    if (correct) s.c += 1;
  }

  /*
   * Studio di una scheda. answers: [{ q: indice domanda, correct }].
   * self: "ok" | "quasi" | "no" | null (autovalutazione della spiegazione).
   * Le statistiche contano solo al primo studio (poi conosci gia' le domande).
   */
  function recordStudy(lab, card, answers, self = null, now = Date.now()) {
    const prev = lab.cards[card.id];
    const first = !prev || !prev.studiedAt || prev.legacy;
    const correct = answers.filter((a) => a.correct).length;
    const ratio = answers.length ? correct / answers.length : 0;
    let box = ratio >= 0.8 ? 2 : 1;
    if (self === "no") box = 1;
    if (!first && prev) box = Math.min(box, Math.max(1, prev.box + 1));
    if (first) {
      answers.forEach((a) => {
        const q = card.quiz[a.q];
        if (q) addStat(lab, q.type, a.correct);
      });
    }
    lab.cards[card.id] = {
      box,
      due: now + INTERVALS[box] * DAY,
      studiedAt: first ? now : prev.studiedAt,
      lastScore: Math.round(ratio * 100),
      self,
      reviews: prev ? prev.reviews || 0 : 0,
      lapses: prev ? prev.lapses || 0 : 0,
      wrong: answers.filter((a) => !a.correct).map((a) => a.q),
      asked: answers.map((a) => a.q)
    };
    markDay(lab, now);
    lab.history.unshift({ kind: "study", id: card.id, title: card.title, area: card.area, score: Math.round(ratio * 100), first, box, date: now });
    lab.history = lab.history.slice(0, 80);
    return lab.cards[card.id];
  }

  // Domande per il ripasso: prima quelle sbagliate, poi quelle chieste meno di recente.
  function pickReviewQuestions(card, state, n = 2, random = Math.random) {
    const all = card.quiz.map((_, i) => i);
    const wrong = (state.wrong || []).filter((i) => all.includes(i));
    const asked = state.asked || [];
    const rest = all.filter((i) => !wrong.includes(i)).sort((a, b) => {
      const ra = asked.lastIndexOf(a);
      const rb = asked.lastIndexOf(b);
      return ra - rb || random() - 0.5;
    });
    return wrong.concat(rest).slice(0, n);
  }

  /*
   * Ripasso: results [{ q, correct }]. Tutte giuste: scatola +1.
   * Almeno meta': resta. Tutte sbagliate: torna alla scatola 1.
   */
  function recordReview(lab, card, results, now = Date.now()) {
    const st = lab.cards[card.id];
    if (!st) return null;
    const correct = results.filter((r) => r.correct).length;
    results.forEach((r) => {
      addStat(lab, "review", r.correct);
      const q = card.quiz[r.q];
      if (q) addStat(lab, q.type, r.correct);
    });
    const onTime = now <= (st.due || now) + ON_TIME_GRACE;
    lab.reviewsDone += 1;
    if (onTime) lab.reviewsOnTime += 1;
    let box = st.box;
    if (correct === results.length) box = Math.min(5, st.box + 1);
    else if (correct * 2 >= results.length) box = Math.max(1, st.box);
    else box = 1;
    if (correct < results.length) st.lapses = (st.lapses || 0) + 1;
    st.box = box;
    st.due = now + INTERVALS[box] * DAY;
    st.reviews = (st.reviews || 0) + 1;
    st.legacy = false;
    st.wrong = results.filter((r) => !r.correct).map((r) => r.q).concat((st.wrong || []).filter((q) => !results.some((r) => r.q === q)));
    st.asked = (st.asked || []).concat(results.map((r) => r.q)).slice(-10);
    markDay(lab, now);
    lab.history.unshift({ kind: "review", id: card.id, title: card.title, area: card.area, score: Math.round((correct / results.length) * 100), box, onTime, date: now });
    lab.history = lab.history.slice(0, 80);
    return st;
  }

  function dueCards(lab, cards, now = Date.now()) {
    const limit = endOfDay(now);
    return cards
      .filter((c) => {
        const st = lab.cards[c.id];
        return st && st.box >= 1 && st.due <= limit;
      })
      .sort((a, b) => lab.cards[a.id].due - lab.cards[b.id].due);
  }

  // Ripassi in arrivo nei prossimi giorni: [{ day, count }].
  function upcoming(lab, cards, days = 7, now = Date.now()) {
    const out = [];
    for (let i = 0; i < days; i += 1) {
      const start = i === 0 ? 0 : endOfDay(now + (i - 1) * DAY) + 1;
      const end = endOfDay(now + i * DAY);
      const count = cards.filter((c) => {
        const st = lab.cards[c.id];
        return st && st.box >= 1 && st.due >= start && st.due <= end;
      }).length;
      out.push({ day: dayKey(now + i * DAY), count });
    }
    return out;
  }

  function smoothed(stat, prior = 0.35, weight = 6) {
    const s = stat || { c: 0, a: 0 };
    return (s.c + prior * weight) / (s.a + weight);
  }

  /*
   * Profilo: 6 valori 10-99 calcolati dalle risposte e dallo stato delle schede.
   */
  function profile(lab, cards, now = Date.now()) {
    const st = lab.stats;
    const overdue = cards.filter((c) => {
      const s = lab.cards[c.id];
      return s && s.box >= 1 && s.due < now - 7 * DAY;
    }).length;
    const weights = { 1: 1, 2: 1.4, 3: 1.8 };
    let have = 0;
    let max = 0;
    const areas = new Set();
    cards.forEach((c) => {
      const w = weights[c.level] || 1;
      max += w;
      const box = cardState(lab, c.id).box || 0;
      have += w * (box >= 3 ? 1 : box === 2 ? 0.5 : box === 1 ? 0.2 : 0);
      if (box >= 2) areas.add(c.area);
    });
    const frac = max ? have / max : 0;
    const areaCount = Object.keys(AREAS).length;
    const recent = lab.days.filter((d) => d >= dayKey(now - 13 * DAY)).length;
    const onTime = (lab.reviewsOnTime + 0.35 * 4) / (lab.reviewsDone + 4);
    const values = {
      comprensione: 100 * smoothed(st.comprensione),
      memoria: 100 * smoothed(st.review) - Math.min(20, overdue * 2),
      collegamenti: 100 * smoothed(st.collegamento),
      applicazione: 100 * smoothed(st.applicazione),
      ampiezza: 20 + 55 * Math.pow(frac, 0.7) + 24 * (areas.size / areaCount),
      costanza: 15 + 45 * onTime + 3 * recent
    };
    Object.keys(values).forEach((k) => {
      values[k] = Math.round(clamp(values[k], 10, 99));
    });
    return values;
  }

  function total(values) {
    const keys = DIMENSIONS.map((d) => d.key);
    return Math.round(keys.reduce((s, k) => s + values[k], 0) / keys.length);
  }

  function areaProgress(lab, cards) {
    return Object.keys(AREAS).map((key) => {
      const list = cards.filter((c) => c.area === key);
      const studied = list.filter((c) => cardState(lab, c.id).box >= 1).length;
      const solid = list.filter((c) => cardState(lab, c.id).box >= 3).length;
      return { key, label: AREAS[key].label, color: AREAS[key].color, total: list.length, studied, solid };
    });
  }

  // Prossima scheda da leggere: l'area meno coperta, livello piu' basso prima.
  function nextCard(lab, cards) {
    const fresh = cards.filter((c) => !(cardState(lab, c.id).box >= 1));
    if (!fresh.length) return null;
    const progress = Object.fromEntries(areaProgress(lab, cards).map((a) => [a.key, a.studied / (a.total || 1)]));
    return fresh.slice().sort((a, b) => progress[a.area] - progress[b.area] || a.level - b.level)[0];
  }

  // Punto debole tra le categorie legate alle domande.
  function weakest(values) {
    return ["comprensione", "memoria", "collegamenti", "applicazione"].sort((a, b) => values[a] - values[b])[0];
  }

  return {
    VERSION,
    DAY,
    INTERVALS,
    AREAS,
    BOX_LABELS,
    LEVEL_LABELS,
    TYPE_LABELS,
    DIMENSIONS,
    dayKey,
    ensureLab,
    cardState,
    recordStudy,
    pickReviewQuestions,
    recordReview,
    dueCards,
    upcoming,
    profile,
    total,
    areaProgress,
    nextCard,
    weakest
  };
});
