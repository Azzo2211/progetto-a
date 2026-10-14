/*
 * Progetto A - Scacchi: profilo di gioco a 6 categorie.
 *
 * Ogni mossa analizzata da Stockfish puo' generare uno o piu' "eventi":
 * un errore (punti negativi) o una cosa fatta bene (punti positivi), sempre
 * con una categoria. A fine partita i punti di ogni categoria vengono sommati
 * e il valore della categoria sale o scende.
 *
 * I punti sono pesati sulla forza dell'avversario: fare tutto giusto contro
 * un bot molto piu' debole vale poco, sbagliare contro di lui costa di piu'.
 * Cosi' i numeri restano coerenti con le fasce Elo dei gradi (E -> S).
 *
 * Il totale del profilo e' la media delle 6 categorie.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessSkills = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 2;
  const START_VALUE = 40;
  const MAX_GAME_CHANGE = 12;

  const CATEGORIES = [
    {
      key: "concentration",
      label: "Concentrazione",
      general: "clarity",
      text: "Non lasciare pezzi in presa e non commettere errori gravi per distrazione.",
      patterns: ["hangingPiece"],
      themes: ["hangingPiece", "fork", "mateIn1"],
      lessons: ["d-pezzi-in-presa", "d-scambi", "d-routine", "c-forchette-avanzate", "b-sacrifici"]
    },
    {
      key: "calculation",
      label: "Calcolo",
      general: "strategicMind",
      text: "Vedere le varianti forzate: scacchi, catture, sacrifici e matti.",
      patterns: ["calculation"],
      themes: ["mateIn2", "mateIn3", "sacrifice"],
      lessons: ["d-matto-in-uno", "c-matto-in-due", "b-matto-in-tre", "a-matti-lunghi", "s-matti-cinque"]
    },
    {
      key: "strategy",
      label: "Strategia",
      general: "strategicMind",
      text: "Sviluppo, piani, posizione dei pezzi e finali.",
      patterns: ["development", "noPlan", "weakEndgame"],
      themes: ["endgame", "trappedPiece"],
      lessons: ["c-aperture", "c-italiana", "b-pezzi-attivi", "b-colonne", "b-pedone-passato", "a-finali-complessi"]
    },
    {
      key: "threatVision",
      label: "Visione minacce",
      general: "clarity",
      text: "Accorgersi delle minacce dell'avversario e delle occasioni che ti lascia.",
      patterns: ["missedThreat"],
      themes: ["defensiveMove", "discoveredAttack", "skewer", "pin"],
      lessons: ["d-scacco", "c-inchiodatura", "c-scoperta", "b-difesa", "b-scoperte-avanzate", "a-risorse-difensive"]
    },
    {
      key: "kingSafety",
      label: "Sicurezza re",
      general: "emotionalControl",
      text: "Arroccare in tempo e non lasciare il re esposto agli attacchi.",
      patterns: ["kingSafety"],
      themes: ["mateIn2", "doubleCheck", "mate"],
      lessons: ["c-trappole", "c-aperture", "b-matti-tipici", "a-attacco-re"]
    },
    {
      key: "impulseControl",
      label: "Controllo impulso",
      general: "emotionalControl",
      text: "Pensare prima di muovere nelle posizioni critiche, senza fretta.",
      patterns: ["concentration"],
      themes: ["fork", "pin", "mateIn2", "hangingPiece"],
      lessons: ["d-routine", "d-scacco", "c-deviazione", "b-sacrifici"]
    }
  ];

  const BY_KEY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));
  const PATTERN_CATEGORY = {};
  CATEGORIES.forEach((c) => c.patterns.forEach((p) => { PATTERN_CATEGORY[p] = c.key; }));

  // Fasce: punteggio 0-100 <-> Elo (stesse soglie dei gradi E-S).
  const BANDS = [
    [0, 20], [600, 45], [1000, 60], [1400, 70], [1800, 80], [2200, 90], [3000, 99]
  ];

  function scoreForElo(elo) {
    if (elo <= BANDS[0][0]) return BANDS[0][1];
    for (let i = 1; i < BANDS.length; i += 1) {
      if (elo <= BANDS[i][0]) {
        const [e0, s0] = BANDS[i - 1];
        const [e1, s1] = BANDS[i];
        return s0 + (s1 - s0) * ((elo - e0) / (e1 - e0));
      }
    }
    return BANDS[BANDS.length - 1][1];
  }

  function eloForScore(score) {
    if (score <= BANDS[0][1]) return BANDS[0][0];
    for (let i = 1; i < BANDS.length; i += 1) {
      if (score <= BANDS[i][1]) {
        const [e0, s0] = BANDS[i - 1];
        const [e1, s1] = BANDS[i];
        return e0 + (e1 - e0) * ((score - s0) / (s1 - s0));
      }
    }
    return BANDS[BANDS.length - 1][0];
  }

  function createSkills() {
    const skills = { version: VERSION, games: 0, history: [], lastGame: null };
    CATEGORIES.forEach((c) => { skills[c.key] = START_VALUE; });
    return skills;
  }

  function ensureSkills(skills) {
    if (!skills || skills.version !== VERSION) return createSkills();
    const result = { ...createSkills(), ...skills };
    CATEGORIES.forEach((c) => {
      if (typeof result[c.key] !== "number") result[c.key] = START_VALUE;
    });
    return result;
  }

  function total(skills) {
    const s = ensureSkills(skills);
    // media dei valori arrotondati: uguale al totale mostrato nel quadro
    return Math.round(CATEGORIES.reduce((sum, c) => sum + Math.round(s[c.key]), 0) / CATEGORIES.length);
  }

  const QUIET_GAP = 8;

  function isSharp(move) {
    return typeof move.winBest === "number" && typeof move.winSecond === "number" && move.winBest - move.winSecond >= QUIET_GAP;
  }

  function isOpen(move) {
    return typeof move.winBefore !== "number" || (move.winBefore >= 8 && move.winBefore <= 92);
  }

  /*
   * Eventi di una partita. moves: tutte le mosse (Bianco e Nero) con i campi
   * della revisione. ctx: { color: "w", result: "win"|"loss"|"draw", reason }.
   * Ritorna [{ category, points, label, moveNumber, san }].
   */
  function gameEvents(moves, ctx = {}) {
    const side = ctx.color === "b" ? "Nero" : "Bianco";
    const events = [];
    const add = (category, points, label, move) => {
      events.push({ category, points, label, moveNumber: move ? move.moveNumber : null, san: move ? move.san : null });
    };
    let cleanStreak = 0;
    let fastErrors = 0;
    let castledEarly = false;
    let playerMoves = 0;
    moves.forEach((move, index) => {
      if (!move || move.side !== side || !move.engineAnalysis || !move.engineAnalysis.ok) return;
      playerMoves += 1;
      const q = move.quality;
      const patterns = Array.isArray(move.categories) ? move.categories : move.pattern ? [move.pattern] : [];
      const isError = q === "mistake" || q === "blunder";
      const previous = index > 0 ? moves[index - 1] : null;

      // Errori: ogni pattern ha la sua categoria. Una mossa mancata conta solo
      // come occasione mancata (il pattern di riserva non si somma).
      const errorPatterns = q === "missed" ? [] : patterns;
      if (q === "blunder" && !errorPatterns.some((p) => PATTERN_CATEGORY[p])) add("concentration", -6, "Blunder", move);
      errorPatterns.forEach((pattern) => {
        const category = PATTERN_CATEGORY[pattern];
        if (!category) return;
        const weight = q === "blunder" ? 1.2 : q === "mistake" ? 1 : 0.5;
        const base = { hangingPiece: -5, missedThreat: -5, calculation: -4, kingSafety: -5, development: -3, noPlan: -3, weakEndgame: -4, concentration: -5 }[pattern] || -3;
        add(category, base * weight, patternLabel(pattern), move);
      });
      if (q === "mistake" && !errorPatterns.length) add(isSharp(move) ? "calculation" : "strategy", -3, "Errore", move);
      if ((q === "inexact" || q === "inaccuracy") && !errorPatterns.length) add(isSharp(move) ? "calculation" : "strategy", -1, "Imprecisione", move);
      if (q === "missed") add("threatVision", -4, "Occasione mancata", move);
      if (isError && typeof move.timeSeconds === "number" && move.timeSeconds < 5 && !errorPatterns.includes("concentration")) {
        add("impulseControl", -3, "Errore giocato in fretta", move);
      }
      if (isError && typeof move.timeSeconds === "number" && move.timeSeconds < 5) fastErrors += 1;

      // Cose fatte bene.
      if (q === "brilliant") add("calculation", 6, "Mossa brillante", move);
      else if (q === "great") add("calculation", 4, "Mossa grande (l'unica buona)", move);
      else if ((q === "best" || q === "excellent") && isSharp(move) && isOpen(move)) add("calculation", 2, "Migliore in posizione critica", move);
      else if ((q === "best" || q === "excellent") && isOpen(move)) add("strategy", 0.6, "Mossa precisa", move);
      if (previous && previous.side !== side && ["mistake", "blunder"].includes(previous.quality) && ["best", "excellent", "great", "brilliant"].includes(q)) {
        add("threatVision", 3, "Hai punito l'errore del bot", move);
      }
      if (isSharp(move) && typeof move.timeSeconds === "number" && move.timeSeconds >= 8 && ["best", "excellent", "great", "brilliant"].includes(q)) {
        add("impulseControl", 2, "Ti sei fermato a pensare nel momento giusto", move);
      }
      if (String(move.san || "").startsWith("O-O") && move.moveNumber <= 10) castledEarly = true;

      // Serie di mosse senza errori.
      if (isError) cleanStreak = 0;
      else {
        cleanStreak += 1;
        if (cleanStreak > 0 && cleanStreak % 10 === 0) add("concentration", 3, "10 mosse di fila senza errori", move);
      }
    });

    if (playerMoves >= 12) {
      if (castledEarly) add("kingSafety", 3, "Arrocco entro la decima mossa", null);
      if (fastErrors === 0 && playerMoves >= 15) add("impulseControl", 2, "Nessun errore giocato in fretta", null);
    }
    if (ctx.result === "win") CATEGORIES.forEach((c) => add(c.key, 1.5, "Vittoria", null));
    else if (ctx.result === "draw") CATEGORIES.forEach((c) => add(c.key, 0.5, "Patta", null));
    else if (ctx.result === "loss") {
      CATEGORIES.forEach((c) => add(c.key, -1, "Sconfitta", null));
      if (ctx.reason === "checkmate") add("kingSafety", -4, "Hai subito scacco matto", null);
    }
    return events;
  }

  function patternLabel(pattern) {
    return {
      hangingPiece: "Pezzo lasciato in presa",
      missedThreat: "Minaccia non vista",
      calculation: "Variante calcolata male",
      kingSafety: "Re esposto",
      development: "Sviluppo lento",
      noPlan: "Mossa senza piano",
      weakEndgame: "Errore nel finale",
      concentration: "Mossa impulsiva"
    }[pattern] || pattern;
  }

  /*
   * Applica gli eventi di una partita. ctx: { botElo, weight (1 valutata,
   * meno se con aiuti), date }. Ritorna { skills, changes: {key: delta}, log }.
   */
  function applyGame(skillsIn, events, ctx = {}) {
    const skills = ensureSkills(skillsIn);
    const weight = typeof ctx.weight === "number" ? ctx.weight : 1;
    const changes = {};
    const log = [];
    CATEGORIES.forEach((c) => {
      const current = skills[c.key];
      const levelElo = eloForScore(current);
      const diff = typeof ctx.botElo === "number" ? ctx.botElo - levelElo : 0;
      let kPos = Math.max(0.2, Math.min(1.8, 1 + diff / 600));
      // Una sconfitta non da' bonus per la forza del bot.
      if (ctx.result === "loss") kPos = Math.min(kPos, 1);
      const kNeg = Math.max(0.5, Math.min(1.5, 1 - diff / 1200));
      let delta = 0;
      events.filter((e) => e.category === c.key).forEach((e) => {
        const scaled = (e.points >= 0 ? e.points * kPos : e.points * kNeg) * weight;
        delta += scaled;
        log.push({ ...e, scaled: Math.round(scaled * 10) / 10 });
      });
      delta = Math.max(-MAX_GAME_CHANGE, Math.min(ctx.result === "loss" ? 2 : MAX_GAME_CHANGE, delta));
      const next = Math.max(10, Math.min(99, current + delta));
      changes[c.key] = Math.round((next - current) * 10) / 10;
      skills[c.key] = Math.round(next * 10) / 10;
    });
    skills.games += 1;
    const importantLog = log.slice().sort((a, b) => Math.abs(b.scaled) - Math.abs(a.scaled)).slice(0, 80);
    skills.lastGame = { date: ctx.date || new Date().toISOString(), botElo: ctx.botElo, changes, log: importantLog };
    skills.history = (skills.history || []).concat([{
      date: ctx.date || new Date().toISOString(),
      values: Object.fromEntries(CATEGORIES.map((c) => [c.key, skills[c.key]]))
    }]).slice(-40);
    return { skills, changes, log };
  }

  // Conteggio errori per categoria nelle ultime partite (dal registro eventi salvato).
  function errorCounts(games) {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c.key, 0]));
    (games || []).forEach((game) => {
      (game.events || []).forEach((e) => {
        if (e.points < 0 && e.moveNumber !== null && counts[e.category] !== undefined) counts[e.category] += 1;
      });
    });
    return counts;
  }

  return {
    VERSION,
    START_VALUE,
    CATEGORIES,
    BY_KEY,
    PATTERN_CATEGORY,
    scoreForElo,
    eloForScore,
    createSkills,
    ensureSkills,
    total,
    gameEvents,
    applyGame,
    errorCounts,
    patternLabel
  };
});
