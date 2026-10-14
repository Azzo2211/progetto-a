/*
 * Progetto A - Scacchi: revisione della partita con Stockfish.
 *
 * Per ogni posizione della partita Stockfish calcola le 2 mosse migliori.
 * Da queste valutazioni si ricavano, mossa per mossa:
 *  - probabilita' di vittoria prima e dopo la mossa
 *  - classificazione (stile chess.com) e precisione (metodo Lichess)
 *  - pattern di errore, mossa migliore e linea consigliata in notazione
 *  - commento del coach in italiano
 *
 * Le posizioni gia' analizzate durante la partita (analisi in background)
 * vengono riutilizzate, quindi a fine partita la revisione e' quasi immediata.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessReview = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const DEFAULT_DEPTH = 16;
  const DEFAULT_MULTIPV = 2;

  function analysis() {
    if (root.ChessAnalysis) return root.ChessAnalysis;
    if (typeof require === "function") return require("./analysis-core.js");
    throw new Error("ChessAnalysis non caricato");
  }

  function cacheKey(fen) {
    return String(fen || "").trim().split(/\s+/).slice(0, 4).join(" ");
  }

  function createCache() {
    return new Map();
  }

  /*
   * Analizza una posizione (o la prende dalla cache).
   * Restituisce { ok, terminal, type, score, lines, depth }.
   * score / lines sono dal punto di vista di chi deve muovere.
   */
  async function analysePosition(engine, fen, { depth = DEFAULT_DEPTH, multipv = DEFAULT_MULTIPV, cache = null } = {}) {
    const A = analysis();
    const key = cacheKey(fen);
    const cached = cache ? cache.get(key) : null;
    if (cached && (cached.terminal || (cached.depth >= depth && cached.lines.length >= Math.min(multipv, cached.legalMoves || multipv)))) {
      return cached;
    }
    const terminal = A.terminalInfo(fen);
    if (terminal) {
      const entry = { ok: true, terminal: true, type: terminal.type, score: terminal.score, lines: [], depth: 99 };
      if (cache) cache.set(key, entry);
      return entry;
    }
    const chess = A.safeChess(fen);
    const legalMoves = chess ? chess.moves().length : multipv;
    const result = await engine.analyse(fen, { depth, multipv: Math.min(multipv, Math.max(1, legalMoves)) });
    if (!result || !result.ok || !result.lines.length) {
      return { ok: false, cancelled: Boolean(result && result.cancelled), error: (result && result.error) || "Analisi non disponibile", lines: [] };
    }
    const entry = {
      ok: true,
      terminal: false,
      score: result.lines[0].score,
      lines: result.lines.map((line) => ({ score: line.score, pv: line.pv })),
      depth: result.depth,
      legalMoves
    };
    if (cache) cache.set(key, entry);
    return entry;
  }

  // Probabilita' di vittoria (0-100) di chi deve muovere nella posizione analizzata.
  function sideWin(entry) {
    return analysis().scoreWinPercent(entry.score);
  }

  function whiteCp(entry, fen) {
    const A = analysis();
    const cp = A.scoreToCp(entry.score);
    return A.fenSide(fen) === "w" ? cp : -cp;
  }

  /*
   * moves: record della partita con { fenBefore, fenAfter, uci, timeSeconds }.
   * options: { engine, depth, multipv, cache, onProgress(done, total), isCancelled() }
   */
  async function reviewGame(moves, options = {}) {
    const { engine, depth = DEFAULT_DEPTH, multipv = DEFAULT_MULTIPV, cache = createCache(), onProgress = null, isCancelled = null } = options;
    if (!moves.length) return { ok: false, error: "Nessuna mossa da analizzare" };
    const fens = [moves[0].fenBefore].concat(moves.map((move) => move.fenAfter));
    const entries = [];
    for (let i = 0; i < fens.length; i += 1) {
      if (isCancelled && isCancelled()) return { ok: false, cancelled: true };
      const entry = await analysePosition(engine, fens[i], { depth, multipv, cache });
      if (!entry.ok) return { ok: false, error: entry.error, cancelled: entry.cancelled };
      entries.push(entry);
      if (onProgress) onProgress(i + 1, fens.length);
    }
    // Partita finita per ripetizione / 50 mosse: la posizione finale vale patta.
    if (options.finalDraw) {
      entries[entries.length - 1] = { ok: true, terminal: true, type: "draw", score: { cp: 0 }, lines: [], depth: 99 };
    }
    return { ok: true, ...buildReview(moves, entries, { depth }) };
  }

  /*
   * Parte "pura": dalle analisi delle posizioni costruisce classificazioni,
   * precisione, pattern e commenti. entries[i] = analisi della posizione prima
   * della mossa i; entries[n] = posizione finale.
   */
  function buildReview(moves, entries, { depth = DEFAULT_DEPTH } = {}) {
    const A = analysis();
    const results = [];
    const historyByColor = { w: [], b: [] };
    let openingName = null;
    let stillInBook = true;

    moves.forEach((move, i) => {
      const before = entries[i];
      const after = entries[i + 1];
      const fenBefore = move.fenBefore;
      const fenAfter = move.fenAfter;
      const mover = A.fenSide(fenBefore);
      const winBest = sideWin(before);
      const winSecond = before.lines && before.lines[1] ? A.scoreWinPercent(before.lines[1].score) : null;
      const winAfter = 100 - sideWin(after);
      const bestLine = before.lines && before.lines[0] ? before.lines[0] : null;
      const bestUci = bestLine ? bestLine.pv[0] : null;
      const uci = String(move.uci || "").toLowerCase();
      const playedIsBest = Boolean(bestLine) && (uci === bestUci || before.lines.some((line) => line.pv[0] === uci && A.sameScore(line.score, bestLine.score)));

      const chessBefore = A.safeChess(fenBefore);
      const legalMoves = chessBefore ? chessBefore.moves().length : 2;
      const probe = A.safeChess(fenBefore);
      const played = probe ? A.applyUci(probe, uci) : null;
      const san = played ? played.san : (move.san || uci);

      const book = A.bookInfo(fenAfter);
      if (stillInBook && book.inBook) {
        if (book.name) openingName = book.name;
      } else {
        stillInBook = false;
      }

      const previous = results[i - 1] || null;
      const prevMove = moves[i - 1] || null;
      const isRecapture = Boolean(played && played.captured && previous && previous.captured && prevMove && String(prevMove.uci || "").slice(2, 4) === played.to);
      const givesMate = Boolean(after.terminal && after.type === "checkmate");
      const keepsMate = Boolean(before.score && before.score.mate > 0 && after.score && after.score.mate < 0);
      const rawLoss = playedIsBest ? 0 : Math.max(0, winBest - winAfter);
      const sacrifice = rawLoss <= A.THRESHOLDS.excellent && !book.inBook && !givesMate ? A.sacrificeInfo(fenBefore, uci) : null;

      const classification = A.classifyMove({
        winBest,
        winSecond,
        winAfter,
        playedIsBest,
        givesMate,
        keepsMate,
        inBook: stillInBook && book.inBook,
        legalMoves,
        sacrifice,
        isRecapture,
        isCapture: Boolean(played && played.captured),
        opponentLoss: previous ? previous.loss : null,
        winBeforeOpponent: previous ? 100 - previous.winBest : null
      });

      const refutationUci = !after.terminal && after.lines[0] ? after.lines[0].pv[0] : null;
      const patternInfo = A.detectPatterns({
        fenBefore,
        fenAfter,
        uci,
        quality: classification.quality,
        loss: classification.loss,
        timeSeconds: typeof move.timeSeconds === "number" ? move.timeSeconds : null,
        ply: i,
        refutationUci,
        afterScore: after.score,
        history: historyByColor[mover].slice()
      });
      historyByColor[mover].push(uci);

      const bestSan = bestUci ? A.uciToSan(fenBefore, bestUci) : null;
      const bestLineSan = bestLine ? A.formatLine(fenBefore, A.pvToSan(fenBefore, bestLine.pv, 8)) : "";
      const refutationSan = refutationUci ? A.uciToSan(fenAfter, refutationUci) : null;
      const refutationLineSan = !after.terminal && after.lines[0] ? A.formatLine(fenAfter, A.pvToSan(fenAfter, after.lines[0].pv, 6)) : "";
      const comment = A.buildComment({
        quality: classification.quality,
        reason: classification.reason,
        san,
        bestSan,
        bestLine: bestLineSan,
        loss: classification.loss,
        patterns: patternInfo.patterns,
        evidence: patternInfo.evidence,
        refutationSan,
        opening: book.name || openingName,
        winBest,
        winSecond,
        sacrifice
      });

      results.push({
        ply: i + 1,
        color: mover,
        san,
        uci,
        captured: played ? played.captured || null : null,
        quality: classification.quality,
        label: classification.label,
        reason: classification.reason,
        loss: classification.loss,
        winBefore: winBest,
        winBest,
        winSecond,
        winAfter,
        bestUci,
        bestSan,
        bestLine: bestLineSan,
        refutationSan,
        refutationLine: refutationLineSan,
        evalBeforeWhite: whiteCp(before, fenBefore),
        evalAfterWhite: whiteCp(after, fenAfter),
        patterns: patternInfo.patterns,
        evidence: patternInfo.evidence,
        comment,
        phase: A.phaseOf(fenBefore, i),
        opening: book.name,
        sacrifice,
        depth: Math.min(before.depth || depth, after.depth || depth)
      });
    });

    const whiteWins = entries.map((entry, k) => {
      const fen = k === 0 ? moves[0].fenBefore : moves[k - 1].fenAfter;
      const win = sideWin(entry);
      return A.fenSide(fen) === "w" ? win : 100 - win;
    });
    const accuracy = A.gameAccuracy(whiteWins, A.fenSide(moves[0].fenBefore));
    results.forEach((result, i) => {
      result.accuracy = accuracy.perMove[i] ? Math.round(accuracy.perMove[i].accuracy) : null;
    });

    const counts = { w: {}, b: {} };
    results.forEach((result) => {
      counts[result.color][result.quality] = (counts[result.color][result.quality] || 0) + 1;
    });

    return {
      moves: results,
      summary: {
        accuracy: {
          w: accuracy.w === null ? null : Math.round(accuracy.w * 10) / 10,
          b: accuracy.b === null ? null : Math.round(accuracy.b * 10) / 10
        },
        counts,
        whiteWins,
        opening: openingName,
        depth
      }
    };
  }

  return { reviewGame, buildReview, analysePosition, createCache, cacheKey, DEFAULT_DEPTH, DEFAULT_MULTIPV };
});
