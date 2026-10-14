/*
 * Progetto A - Scacchi: misura reale del livello e gradi E -> S.
 *
 * Tre misure indipendenti:
 *  1. Rating partite: Glicko-1 contro i bot (i bot sono calibrati per Elo,
 *     vedi chess/bot.js). Contano solo le partite "valutate": niente
 *     suggerimenti, niente mosse annullate.
 *  2. Rating tattico: Glicko-1 sugli esercizi (puzzle Lichess con rating
 *     noto). Conta solo il primo tentativo di ogni esercizio.
 *  3. Precisione: media delle ultime partite valutate e revisionate.
 *
 * Il grado e' "certificato" solo quando tutti i requisiti del grado sono
 * soddisfatti: rating, numero di partite, esercizi, una vittoria contro un
 * bot di quel livello, precisione e lezioni del grado completate.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessRating = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const Q = Math.log(10) / 400;
  const START_RATING = 800;
  const START_RD = 300;
  // Un singolo risultato non puo' spostare il rating di piu' di cosi'.
  const MAX_CHANGE = 200;
  const MIN_RD_GAMES = 60;
  const MIN_RD_PUZZLES = 60;
  const BOT_RD = 60;
  const PUZZLE_RD = 80;
  // I rating dei puzzle Lichess sono piu' alti dei rating di gioco: ~200 punti.
  const PUZZLE_OFFSET = 200;

  /*
   * Gradi. min = Elo di gioco minimo. I requisiti per certificare il grado:
   *  games: partite valutate, puzzle: rating tattico minimo, puzzles: esercizi
   *  minimi, beatElo: vittoria in partita valutata contro un bot di almeno
   *  questo Elo, accuracy: precisione media delle ultime 5 partite valutate.
   */
  const GRADES = [
    { key: "E", name: "Principiante", min: 0, max: 599, scoreMin: 20, scoreMax: 44,
      meaning: "Conosci le regole e stai imparando a non lasciare pezzi in presa." },
    { key: "D", name: "Base", min: 600, max: 999, scoreMin: 45, scoreMax: 59,
      games: 5, puzzle: 800, puzzles: 15, beatElo: 550, accuracy: 60,
      meaning: "Vedi catture e matti semplici, eviti la maggior parte dei pezzi regalati." },
    { key: "C", name: "Intermedio", min: 1000, max: 1399, scoreMin: 60, scoreMax: 69,
      games: 10, puzzle: 1200, puzzles: 30, beatElo: 1000, accuracy: 70,
      meaning: "Usi forchette, inchiodature e principi d'apertura; sbagli ancora nei momenti tattici." },
    { key: "B", name: "Giocatore da club", min: 1400, max: 1799, scoreMin: 70, scoreMax: 79,
      games: 15, puzzle: 1600, puzzles: 50, beatElo: 1450, accuracy: 76,
      meaning: "Hai piani coerenti, conosci i finali base e calcoli varianti di 2-3 mosse." },
    { key: "A", name: "Avanzato", min: 1800, max: 2199, scoreMin: 80, scoreMax: 89,
      games: 20, puzzle: 2000, puzzles: 75, beatElo: 1800, accuracy: 81,
      meaning: "Giochi con precisione, sfrutti i vantaggi piccoli e difendi le posizioni difficili." },
    { key: "S", name: "Maestro", min: 2200, max: 3600, scoreMin: 90, scoreMax: 99,
      games: 25, puzzle: 2400, puzzles: 100, beatElo: 2200, accuracy: 85,
      meaning: "Livello da candidato maestro: calcolo profondo e quasi nessun errore non forzato." }
  ];

  function gradeIndex(key) {
    return Math.max(0, GRADES.findIndex((grade) => grade.key === key));
  }

  function gradeForElo(elo) {
    let found = GRADES[0];
    GRADES.forEach((grade) => {
      if (elo >= grade.min) found = grade;
    });
    return found;
  }

  function g(rd) {
    return 1 / Math.sqrt(1 + (3 * Q * Q * rd * rd) / (Math.PI * Math.PI));
  }

  function expectedScore(rating, opponent, opponentRd) {
    return 1 / (1 + Math.pow(10, (-g(opponentRd) * (rating - opponent)) / 400));
  }

  // Un aggiornamento Glicko-1 con un solo avversario. score: 1, 0.5, 0.
  function glickoUpdate(player, opponentRating, opponentRd, score, minRd) {
    const r = typeof player.rating === "number" ? player.rating : START_RATING;
    const rd = typeof player.rd === "number" ? player.rd : START_RD;
    const gj = g(opponentRd);
    const e = expectedScore(r, opponentRating, opponentRd);
    const d2 = 1 / (Q * Q * gj * gj * e * (1 - e));
    const denom = 1 / (rd * rd) + 1 / d2;
    const raw = (Q / denom) * gj * (score - e);
    const rating = r + Math.max(-MAX_CHANGE, Math.min(MAX_CHANGE, raw));
    const nextRd = Math.max(minRd, Math.sqrt(1 / denom));
    return { rating: Math.round(rating), rd: Math.round(nextRd), expected: e, change: Math.round(rating - r) };
  }

  function createProfile() {
    return {
      game: { rating: START_RATING, rd: START_RD, count: 0, history: [] },
      puzzle: { rating: START_RATING + PUZZLE_OFFSET, rd: START_RD, count: 0, solved: 0, history: [], seen: {} },
      ratedGames: [],
      lessons: {},
      wins: []
    };
  }

  function ensureProfile(profile) {
    const base = createProfile();
    const p = profile && typeof profile === "object" ? profile : {};
    return {
      game: { ...base.game, ...(p.game || {}) },
      puzzle: { ...base.puzzle, ...(p.puzzle || {}), seen: { ...((p.puzzle && p.puzzle.seen) || {}) } },
      ratedGames: Array.isArray(p.ratedGames) ? p.ratedGames : [],
      lessons: p.lessons && typeof p.lessons === "object" ? p.lessons : {},
      wins: Array.isArray(p.wins) ? p.wins : []
    };
  }

  // Registra una partita valutata contro un bot. result: "win" | "loss" | "draw".
  function recordGame(profile, { botElo, result, accuracy = null, date = new Date().toISOString(), gameId = null }) {
    const p = ensureProfile(profile);
    const score = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
    const update = glickoUpdate(p.game, botElo, BOT_RD, score, MIN_RD_GAMES);
    p.game.rating = update.rating;
    p.game.rd = update.rd;
    p.game.count += 1;
    p.game.history = p.game.history.concat([{ date, rating: update.rating, change: update.change, botElo, result }]).slice(-60);
    p.ratedGames = p.ratedGames.concat([{ gameId, date, botElo, result, accuracy }]).slice(-40);
    if (result === "win") p.wins = p.wins.concat([{ date, botElo }]).slice(-60);
    return { profile: p, change: update.change, expected: update.expected };
  }

  // Aggiunge la precisione a una partita valutata gia' registrata (arriva dopo la revisione).
  function attachAccuracy(profile, gameId, accuracy) {
    const p = ensureProfile(profile);
    const game = p.ratedGames.find((item) => item.gameId && item.gameId === gameId);
    if (game && typeof accuracy === "number") game.accuracy = accuracy;
    return p;
  }

  // Primo tentativo di un esercizio con rating noto.
  function recordPuzzle(profile, { id, rating, solved, date = new Date().toISOString() }) {
    const p = ensureProfile(profile);
    if (id && p.puzzle.seen[id]) return { profile: p, change: 0, counted: false };
    const update = glickoUpdate(p.puzzle, rating, PUZZLE_RD, solved ? 1 : 0, MIN_RD_PUZZLES);
    p.puzzle.rating = update.rating;
    p.puzzle.rd = update.rd;
    p.puzzle.count += 1;
    if (solved) p.puzzle.solved += 1;
    if (id) p.puzzle.seen[id] = solved ? 1 : 0;
    p.puzzle.history = p.puzzle.history.concat([{ date, rating: update.rating, change: update.change }]).slice(-120);
    return { profile: p, change: update.change, counted: true };
  }

  function averageAccuracy(profile, last = 5) {
    const p = ensureProfile(profile);
    const values = p.ratedGames.map((game) => game.accuracy).filter((value) => typeof value === "number").slice(-last);
    if (!values.length) return null;
    return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
  }

  function bestWinElo(profile) {
    const p = ensureProfile(profile);
    return p.wins.reduce((best, win) => Math.max(best, win.botElo || 0), 0);
  }

  // Elo stimato combinando le tre misure, pesate per affidabilita'.
  function estimateElo(profile, { accuracyElo = null, accuracyGames = 0 } = {}) {
    const p = ensureProfile(profile);
    const parts = [];
    if (p.game.count) parts.push({ value: p.game.rating, rd: p.game.rd });
    if (p.puzzle.count) parts.push({ value: p.puzzle.rating - PUZZLE_OFFSET, rd: p.puzzle.rd * 1.25 });
    if (typeof accuracyElo === "number" && accuracyGames > 0) parts.push({ value: accuracyElo, rd: Math.max(120, 320 / Math.sqrt(accuracyGames)) });
    if (!parts.length) return { elo: null, rd: START_RD, confidence: 0 };
    const weights = parts.map((part) => 1 / (part.rd * part.rd));
    const total = weights.reduce((sum, w) => sum + w, 0);
    const elo = parts.reduce((sum, part, i) => sum + part.value * weights[i], 0) / total;
    const rd = Math.sqrt(1 / total);
    return { elo: Math.round(elo), rd: Math.round(rd), confidence: Math.round(Math.max(0, Math.min(1, (START_RD - rd) / (START_RD - 50))) * 100) };
  }

  /*
   * Requisiti di un grado con stato e avanzamento (0-1).
   * lessonsDone(gradeKey) -> { done, total }.
   */
  function requirementsFor(gradeKey, profile, { lessonsDone = () => ({ done: 0, total: 0 }) } = {}) {
    const grade = GRADES[gradeIndex(gradeKey)];
    const p = ensureProfile(profile);
    if (!grade.games) return [];
    const acc = averageAccuracy(p, 5);
    const accGames = p.ratedGames.filter((game) => typeof game.accuracy === "number").length;
    const lessons = lessonsDone(grade.key);
    const best = bestWinElo(p);
    const items = [
      {
        key: "games",
        label: `${grade.games} partite valutate`,
        value: `${Math.min(p.game.count, grade.games)}/${grade.games}`,
        progress: p.game.count / grade.games,
        met: p.game.count >= grade.games
      },
      {
        key: "rating",
        label: `Rating partite almeno ${grade.min}`,
        value: p.game.count ? String(p.game.rating) : "--",
        progress: p.game.count ? p.game.rating / grade.min : 0,
        met: p.game.count > 0 && p.game.rating >= grade.min
      },
      {
        key: "beat",
        label: `Vinci contro un bot da ${grade.beatElo}+ Elo`,
        value: best ? `migliore: ${best}` : "nessuna vittoria",
        progress: best / grade.beatElo,
        met: best >= grade.beatElo
      },
      {
        key: "puzzle",
        label: `Rating esercizi almeno ${grade.puzzle} (${grade.puzzles} esercizi)`,
        value: p.puzzle.count ? `${p.puzzle.rating} · ${p.puzzle.count} fatti` : "--",
        progress: Math.min(p.puzzle.count / grade.puzzles, p.puzzle.count ? p.puzzle.rating / grade.puzzle : 0),
        met: p.puzzle.count >= grade.puzzles && p.puzzle.rating >= grade.puzzle
      },
      {
        key: "accuracy",
        label: `Precisione media ${grade.accuracy}% (ultime 5 partite valutate)`,
        value: acc !== null ? `${acc}% su ${Math.min(accGames, 5)}` : "--",
        progress: acc !== null ? (acc / grade.accuracy) * Math.min(1, accGames / 5) : 0,
        met: acc !== null && accGames >= Math.min(5, grade.games) && acc >= grade.accuracy
      },
      {
        key: "lessons",
        label: `Lezioni del grado ${grade.key} completate`,
        value: `${lessons.done}/${lessons.total}`,
        progress: lessons.total ? lessons.done / lessons.total : 1,
        met: lessons.total === 0 || lessons.done >= lessons.total
      }
    ];
    return items.map((item) => ({ ...item, progress: Math.max(0, Math.min(1, item.progress || 0)) }));
  }

  // Grado certificato: il piu' alto con tutti i requisiti (e quelli dei gradi sotto).
  function certifiedGrade(profile, options = {}) {
    let certified = GRADES[0];
    for (let i = 1; i < GRADES.length; i += 1) {
      const reqs = requirementsFor(GRADES[i].key, profile, options);
      if (reqs.length && reqs.every((item) => item.met)) certified = GRADES[i];
      else break;
    }
    return certified;
  }

  // Punteggio 0-100 del modulo scacchi per il quadro: la lettera coincide con
  // il grado certificato, la posizione nella fascia segue l'Elo stimato.
  function moduleScore(certified, estimatedElo) {
    const grade = GRADES[gradeIndex(certified.key || certified)];
    if (typeof estimatedElo !== "number") return grade.scoreMin;
    const span = grade.max - grade.min;
    const t = Math.max(0, Math.min(1, (estimatedElo - grade.min) / span));
    return Math.round(grade.scoreMin + t * (grade.scoreMax - grade.scoreMin));
  }

  return {
    GRADES,
    START_RATING,
    START_RD,
    PUZZLE_OFFSET,
    gradeIndex,
    gradeForElo,
    expectedScore,
    glickoUpdate,
    createProfile,
    ensureProfile,
    recordGame,
    attachAccuracy,
    recordPuzzle,
    averageAccuracy,
    bestWinElo,
    estimateElo,
    requirementsFor,
    certifiedGrade,
    moduleScore
  };
});
