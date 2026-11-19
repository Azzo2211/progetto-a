/*
 * Progetto A - Memoria: ripasso distanziato con FSRS (senza DOM).
 *
 * FSRS (Free Spaced Repetition Scheduler) e' l'algoritmo di ripasso adottato da Anki. Qui la
 * versione a 19 parametri con i valori di partenza, come descritta da F. Borretti, «Implementing
 * FSRS in 100 Lines» (borretti.me). Ogni scheda ha:
 *   s = stabilita' (giorni dopo cui la probabilita' di ricordare scende al 90%)
 *   d = difficolta' (1-10)
 * Probabilita' di ricordare dopo t giorni: R(t, S) = (1 + F t / S)^C, con F = 19/81 e C = -0,5.
 * Intervallo per ricordare con probabilita' r: I = S / F (r^(1/C) - 1)  (con r = 0,9: I = S).
 * Voti: 1 = di nuovo (non ricordata), 2 = difficile, 3 = bene, 4 = facile.
 * Un secondo ripasso nello stesso giorno non cambia stabilita' e difficolta': la scheda sbagliata
 * si ripete dopo pochi minuti finche' non torna, poi si rivede dal giorno dopo.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MemorySRS = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const W = [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621];
  const FACTOR = 19 / 81;
  const DECAY = -0.5;
  const DAY = 86400000;
  const RELEARN_MS = 10 * 60000;   // scheda sbagliata: di nuovo tra 10 minuti
  const MAX_DAYS = 3650;           // al massimo 10 anni
  // obiettivi di ricordo (probabilita' al momento del ripasso) e quanto costano in ripassi
  const TARGETS = [
    { r: 0.9, label: "Normale · 90%", note: "Lo standard di FSRS e di Anki: il miglior rapporto tra ripassi e ricordo." },
    { r: 0.95, label: "Alta · 95%", note: "Per quello che non puoi sbagliare (esami, discorsi, aperture): circa il doppio dei ripassi." },
    { r: 0.97, label: "Massima · 97%", note: "Quasi perfetta: intervalli quasi quattro volte più corti. Solo per poche schede importanti." }
  ];

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const num = (v) => typeof v === "number" && Number.isFinite(v);

  function startOfDay(t) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  function sameDay(a, b) {
    return num(a) && num(b) && startOfDay(a) === startOfDay(b);
  }

  function retrievabilityAt(elapsedDays, s) {
    if (!num(s) || s <= 0) return 0;
    return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / s, DECAY);
  }
  // giorni dopo cui la probabilita' scende a r
  function interval(s, r = 0.9) {
    const rr = clamp(r, 0.7, 0.99);
    return (s / FACTOR) * (Math.pow(rr, 1 / DECAY) - 1);
  }
  function initStability(g) { return W[g - 1]; }
  function initDifficulty(g) { return clamp(W[4] - Math.exp(W[5] * (g - 1)) + 1, 1, 10); }
  function nextDifficulty(d, g) {
    const delta = -W[6] * (g - 3);
    const damped = d + delta * ((10 - d) / 9);
    return clamp(W[7] * initDifficulty(4) + (1 - W[7]) * damped, 1, 10);
  }
  function stabilityAfterSuccess(d, s, r, g) {
    const hard = g === 2 ? W[15] : 1;
    const easy = g === 4 ? W[16] : 1;
    return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * hard * easy);
  }
  function stabilityAfterFailure(d, s, r) {
    const sf = W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r));
    return Math.min(sf, s);
  }

  // Stato di una scheda: null = nuova. { s, d, reps, lapses, first, last, due, g }
  function clean(x) {
    if (!x || typeof x !== "object" || !num(x.s) || !num(x.d) || !num(x.due)) return null;
    return {
      s: clamp(x.s, 0.01, MAX_DAYS * 4),
      d: clamp(x.d, 1, 10),
      reps: Number.isInteger(x.reps) && x.reps >= 0 ? x.reps : 1,
      lapses: Number.isInteger(x.lapses) && x.lapses >= 0 ? x.lapses : 0,
      first: num(x.first) ? x.first : null,
      last: num(x.last) ? x.last : null,
      due: x.due,
      g: Number.isInteger(x.g) ? clamp(x.g, 1, 4) : 3
    };
  }

  function retrievability(st, now = Date.now()) {
    if (!st || !num(st.last)) return null;
    return retrievabilityAt((now - st.last) / DAY, st.s);
  }
  function isDue(st, now = Date.now()) {
    return !st || st.due <= now;
  }
  function dueAfter(now, s, r) {
    const days = clamp(Math.round(interval(s, r)), 1, MAX_DAYS);
    // dalla mezzanotte: una scheda «tra 1 giorno» torna domani mattina, non domani a quest'ora
    return startOfDay(now) + days * DAY + 4 * 3600000;
  }

  /*
   * Ripasso con voto g (1-4) all'istante now. retention: obiettivo (0,9 / 0,95 / 0,97).
   * Restituisce il nuovo stato e { counted }: false se era gia' stata vista oggi (niente FSRS).
   */
  function review(prev, g, now = Date.now(), retention = 0.9) {
    const grade = clamp(Math.round(g), 1, 4);
    const st = clean(prev);
    if (!st) {
      const s = initStability(grade);
      const d = initDifficulty(grade);
      const next = { s, d, reps: 1, lapses: grade === 1 ? 1 : 0, first: now, last: now, g: grade, due: grade === 1 ? now + RELEARN_MS : dueAfter(now, s, retention) };
      return { state: next, counted: true, r: null };
    }
    // stessa giornata: la scheda e' in riapprendimento, non si ricalcola
    if (sameDay(st.last, now)) {
      return { state: { ...st, g: grade, due: grade === 1 ? now + RELEARN_MS : dueAfter(now, st.s, retention) }, counted: false, r: null };
    }
    const r = retrievabilityAt((now - st.last) / DAY, st.s);
    const s = grade === 1 ? stabilityAfterFailure(st.d, st.s, r) : stabilityAfterSuccess(st.d, st.s, r, grade);
    const d = nextDifficulty(st.d, grade);
    const next = {
      s: clamp(s, 0.01, MAX_DAYS * 4), d, reps: st.reps + 1, lapses: st.lapses + (grade === 1 ? 1 : 0),
      first: st.first, last: now, g: grade,
      due: grade === 1 ? now + RELEARN_MS : dueAfter(now, s, retention)
    };
    return { state: next, counted: true, r };
  }

  // Anteprima: tra quanto torna con ciascun voto (in giorni; 0 = tra pochi minuti).
  function preview(prev, now = Date.now(), retention = 0.9) {
    const out = {};
    [1, 2, 3, 4].forEach((g) => {
      const { state } = review(prev, g, now, retention);
      out[g] = state.due - now < 3600000 ? 0 : Math.max(1, Math.round((startOfDay(state.due) - startOfDay(now)) / DAY));
    });
    return out;
  }
  function label(days) {
    if (!days) return "tra 10 min";
    if (days === 1) return "domani";
    if (days < 30) return `tra ${days} giorni`;
    if (days < 365) return `tra ${Math.round(days / 30)} ${Math.round(days / 30) === 1 ? "mese" : "mesi"}`;
    const y = Math.round((days / 365) * 10) / 10;
    return `tra ${String(y).replace(".", ",")} ${y === 1 ? "anno" : "anni"}`;
  }
  // Scheda «imparata»: stabilita' di almeno 21 giorni (come le schede «mature» di Anki).
  function mature(st) { return Boolean(st && st.s >= 21); }

  return { W, FACTOR, DECAY, DAY, TARGETS, RELEARN_MS, MAX_DAYS, retrievabilityAt, retrievability, interval, initStability, initDifficulty, nextDifficulty, stabilityAfterSuccess, stabilityAfterFailure, review, preview, label, isDue, clean, mature, startOfDay };
});
