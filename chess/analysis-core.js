/*
 * Progetto A - Scacchi: nucleo di analisi (funzioni pure, testabili anche in Node).
 *
 * Contiene:
 *  - conversione valutazione -> probabilita' di vittoria (formula Lichess)
 *  - precisione per mossa e precisione di partita (metodo Lichess)
 *  - classificazione mosse stile chess.com (libro, migliore, ottima, buona,
 *    imprecisione, errore, blunder, grande, brillante, mancata)
 *  - riconoscimento dei pattern di errore e commenti del coach in italiano
 *
 * Dipende da chess.js (window.Chess nel browser, require("chess.js") in Node)
 * e dal libro aperture (window.CHESS_OPENING_BOOK, opzionale).
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessAnalysis = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  function getChess() {
    if (root.Chess) return root.Chess;
    if (typeof require === "function") return require("chess.js").Chess;
    throw new Error("chess.js non caricato");
  }

  // ---------------------------------------------------------------------------
  // Valori e costanti
  // ---------------------------------------------------------------------------

  const PIECE_VALUE = { p: 100, n: 300, b: 300, r: 500, q: 900, k: 0 };
  const PIECE_NAME = { p: "pedone", n: "cavallo", b: "alfiere", r: "torre", q: "donna", k: "re" };
  const PIECE_ARTICLE = { p: "il pedone", n: "il cavallo", b: "l'alfiere", r: "la torre", q: "la donna", k: "il re" };
  const MATE_CP = 10000;

  // Soglie di classificazione: perdita in punti di probabilita' di vittoria
  // (0-100) rispetto alla mossa migliore. Sono le stesse soglie "expected points"
  // pubblicate da chess.com (0.02 / 0.05 / 0.10 / 0.20).
  const THRESHOLDS = { excellent: 2, good: 5, inaccuracy: 10, mistake: 20 };

  const QUALITY_LABEL = {
    book: "Mossa da libro",
    best: "Migliore",
    great: "Grande",
    brilliant: "Brillante",
    excellent: "Ottima",
    good: "Buona",
    inaccuracy: "Imprecisione",
    mistake: "Errore",
    blunder: "Blunder",
    missed: "Mossa mancata",
    forced: "Forzata"
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  // ---------------------------------------------------------------------------
  // Valutazione -> probabilita' di vittoria
  // ---------------------------------------------------------------------------

  // Formula Lichess: probabilita' di vittoria (0-100) dal punto di vista di chi muove.
  function winPercent(cp) {
    const c = clamp(cp, -1000, 1000);
    return 50 + 50 * (2 / (1 + Math.exp(-0.00368208 * c)) - 1);
  }

  // score = { cp } oppure { mate } dal punto di vista di chi muove.
  // Come Lichess, un matto vale quanto +/-10 pedoni (circa 97,5% / 2,5%).
  function scoreWinPercent(score) {
    if (!score) return 50;
    if (typeof score.mate === "number") {
      return score.mate > 0 ? winPercent(1000) : winPercent(-1000); // mate <= 0: chi muove subisce matto
    }
    return winPercent(score.cp || 0);
  }

  // Centipawn "di comodo" (per grafici e testi): il matto diventa +/-10000.
  function scoreToCp(score) {
    if (!score) return 0;
    if (typeof score.mate === "number") {
      if (score.mate === 0) return -MATE_CP;
      return Math.sign(score.mate) * (MATE_CP - Math.min(Math.abs(score.mate), 99) * 10);
    }
    return score.cp || 0;
  }

  function flipScore(score) {
    if (!score) return score;
    if (typeof score.mate === "number") return { mate: -score.mate };
    return { cp: -(score.cp || 0) };
  }

  function sameScore(a, b) {
    if (!a || !b) return false;
    if (typeof a.mate === "number" || typeof b.mate === "number") return a.mate === b.mate;
    return Math.abs((a.cp || 0) - (b.cp || 0)) <= 5;
  }

  // ---------------------------------------------------------------------------
  // Precisione (metodo Lichess)
  // ---------------------------------------------------------------------------

  // Precisione di una singola mossa a partire dalla probabilita' di vittoria
  // prima e dopo la mossa, dal punto di vista di chi muove.
  function moveAccuracy(winBefore, winAfter) {
    if (winAfter >= winBefore) return 100;
    const winDiff = winBefore - winAfter;
    const raw = 103.1668100711649 * Math.exp(-0.04354415386753951 * winDiff) - 3.166924740191411;
    return clamp(raw + 1, 0, 100);
  }

  function standardDeviation(values) {
    if (!values.length) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / values.length;
    return Math.sqrt(variance);
  }

  // whiteWins: probabilita' di vittoria del Bianco per ogni posizione P0..Pn
  // (n = numero di mosse). firstColor: chi ha giocato la prima mossa ("w"/"b").
  // Restituisce la precisione di partita di Bianco e Nero e la precisione per mossa.
  function gameAccuracy(whiteWins, firstColor = "w") {
    const moveCount = whiteWins.length - 1;
    if (moveCount < 1) return { w: null, b: null, perMove: [] };
    const windowSize = clamp(Math.floor(moveCount / 10), 2, 8);
    const windows = [];
    const firstWindow = whiteWins.slice(0, windowSize);
    for (let i = 0; i < Math.min(windowSize, whiteWins.length) - 2; i += 1) windows.push(firstWindow);
    for (let i = 0; i + windowSize <= whiteWins.length; i += 1) windows.push(whiteWins.slice(i, i + windowSize));
    const weights = windows.map((w) => clamp(standardDeviation(w), 0.5, 12));
    const perMove = [];
    const byColor = { w: [], b: [] };
    for (let i = 0; i < moveCount; i += 1) {
      const color = (i % 2 === 0) === (firstColor === "w") ? "w" : "b";
      const prev = whiteWins[i];
      const next = whiteWins[i + 1];
      const accuracy = color === "w" ? moveAccuracy(prev, next) : moveAccuracy(100 - prev, 100 - next);
      const weight = weights[i] !== undefined ? weights[i] : 1;
      perMove.push({ color, accuracy, weight });
      byColor[color].push({ accuracy, weight });
    }
    const summarize = (items) => {
      if (!items.length) return null;
      const weightSum = items.reduce((sum, item) => sum + item.weight, 0);
      const weighted = items.reduce((sum, item) => sum + item.accuracy * item.weight, 0) / (weightSum || 1);
      const harmonic = items.length / items.reduce((sum, item) => sum + 1 / Math.max(item.accuracy, 1), 0);
      return (weighted + harmonic) / 2;
    };
    return { w: summarize(byColor.w), b: summarize(byColor.b), perMove };
  }

  // ---------------------------------------------------------------------------
  // Utility su posizioni (chess.js)
  // ---------------------------------------------------------------------------

  function fenSide(fen) {
    return String(fen || "").split(" ")[1] === "b" ? "b" : "w";
  }

  function otherColor(color) {
    return color === "w" ? "b" : "w";
  }

  function positionKey(fen) {
    const parts = String(fen || "").trim().split(/\s+/);
    return `${parts[0]} ${parts[1] || "w"} ${parts[2] || "-"}`;
  }

  // Posizione con il tratto passato all'avversario (per capire cosa minacciava).
  function nullMoveFen(fen) {
    const parts = String(fen || "").trim().split(/\s+/);
    if (parts.length < 4) return null;
    parts[1] = parts[1] === "w" ? "b" : "w";
    parts[3] = "-";
    return parts.join(" ");
  }

  function safeChess(fen) {
    const Chess = getChess();
    try {
      return new Chess(fen);
    } catch (error) {
      return null;
    }
  }

  function terminalInfo(fen) {
    const chess = safeChess(fen);
    if (!chess) return null;
    if (chess.isCheckmate()) return { type: "checkmate", score: { mate: 0 } };
    if (chess.isStalemate()) return { type: "stalemate", score: { cp: 0 } };
    if (chess.isInsufficientMaterial()) return { type: "insufficient", score: { cp: 0 } };
    return null;
  }

  function uciToMoveObject(uci) {
    if (!uci || uci.length < 4) return null;
    const move = { from: uci.slice(0, 2), to: uci.slice(2, 4) };
    if (uci.length > 4) move.promotion = uci[4].toLowerCase();
    return move;
  }

  function applyUci(chess, uci) {
    const move = uciToMoveObject(uci);
    if (!move) return null;
    try {
      return chess.move(move);
    } catch (error) {
      if (!move.promotion) {
        try {
          return chess.move({ ...move, promotion: "q" });
        } catch (innerError) {
          return null;
        }
      }
      return null;
    }
  }

  function uciToSan(fen, uci) {
    const chess = safeChess(fen);
    if (!chess) return uci;
    const move = applyUci(chess, uci);
    return move ? move.san : uci;
  }

  function pvToSan(fen, pv, maxPlies = 8) {
    const chess = safeChess(fen);
    if (!chess || !Array.isArray(pv)) return [];
    const result = [];
    for (const uci of pv.slice(0, maxPlies)) {
      const move = applyUci(chess, uci);
      if (!move) break;
      result.push(move.san);
    }
    return result;
  }

  // Notazione con figurine (come su chess.com): Nf3 -> ♘f3.
  const FIGURINE = { K: "\u2654", Q: "\u2655", R: "\u2656", B: "\u2657", N: "\u2658" };
  function figurine(san) {
    return String(san || "").replace(/^([KQRBN])/, (m) => FIGURINE[m]).replace(/=([QRBN])/, (m, p) => `=${FIGURINE[p]}`);
  }

  // Formatta una linea in stile "12. ♘f3 ♘c6 13. ♗d3" a partire dalla FEN.
  function formatLine(fen, sanMoves) {
    if (!sanMoves.length) return "";
    const parts = String(fen || "").split(" ");
    let moveNumber = Number(parts[5]) || 1;
    let side = parts[1] === "b" ? "b" : "w";
    const out = [];
    sanMoves.forEach((rawSan, index) => {
      const san = figurine(rawSan);
      if (side === "w") out.push(`${moveNumber}. ${san}`);
      else out.push(index === 0 ? `${moveNumber}... ${san}` : san);
      if (side === "b") moveNumber += 1;
      side = otherColor(side);
    });
    return out.join(" ");
  }

  function countMajorsMinors(fen) {
    const placement = String(fen || "").split(" ")[0];
    let count = 0;
    for (const ch of placement) if ("nbrqNBRQ".includes(ch)) count += 1;
    return count;
  }

  function phaseOf(fen, ply) {
    const pieces = countMajorsMinors(fen);
    if (pieces <= 6) return "Finale";
    if (ply < 20 && pieces > 10) return "Apertura";
    return "Mediogioco";
  }

  // Static Exchange Evaluation: guadagno materiale (in centipawn) per `color`
  // catturando sulla casa `square` con la sequenza di catture migliore.
  function seeGain(chess, square, depth = 0) {
    if (depth > 12) return 0;
    const captures = chess.moves({ verbose: true }).filter((m) => m.to === square && m.captured);
    if (!captures.length) return 0;
    captures.sort((a, b) => PIECE_VALUE[a.piece] - PIECE_VALUE[b.piece] || (b.promotion ? PIECE_VALUE[b.promotion] : 0) - (a.promotion ? PIECE_VALUE[a.promotion] : 0));
    const capture = captures[0];
    const value = capture.captured === "k" ? 0 : PIECE_VALUE[capture.captured];
    const promotionBonus = capture.promotion ? PIECE_VALUE[capture.promotion] - PIECE_VALUE.p : 0;
    chess.move(capture);
    const reply = seeGain(chess, square, depth + 1);
    chess.undo();
    return Math.max(0, value + promotionBonus - reply);
  }

  // Per ogni pezzo (non pedone, non re) di `victimColor`, quanto materiale puo'
  // vincere l'avversario catturandolo subito. La posizione deve avere il tratto
  // all'avversario. Restituisce il pezzo piu' "in presa".
  function worstHangingPiece(fen, victimColor) {
    const chess = safeChess(fen);
    if (!chess || chess.turn() === victimColor) return null;
    let worst = null;
    const board = chess.board();
    board.forEach((row) => row.forEach((cell) => {
      if (!cell || cell.color !== victimColor || cell.type === "p" || cell.type === "k") return;
      const gain = seeGain(chess, cell.square);
      if (gain > 0 && (!worst || gain > worst.gain)) worst = { square: cell.square, type: cell.type, gain };
    }));
    return worst;
  }

  // Una mossa e' un sacrificio se, dopo averla giocata, l'avversario puo'
  // vincere staticamente almeno 2 pedoni di materiale in piu' di quanto
  // abbiamo appena catturato.
  function sacrificeInfo(fenBefore, uci) {
    const chess = safeChess(fenBefore);
    if (!chess) return null;
    const mover = chess.turn();
    const move = applyUci(chess, uci);
    if (!move) return null;
    if (chess.isCheckmate()) return null;
    const captured = move.captured ? PIECE_VALUE[move.captured] : 0;
    const hanging = worstHangingPiece(chess.fen(), mover);
    if (!hanging) return null;
    const net = captured - hanging.gain;
    if (net > -200) return null;
    // Se prima della mossa erano attaccati sia il pezzo mosso sia quello che
    // resta in presa, la perdita era inevitabile: non e' un vero sacrificio.
    const nullFen = nullMoveFen(fenBefore);
    const before = nullFen ? safeChess(nullFen) : null;
    if (before && hanging.square !== move.to) {
      const hangingBefore = seeGain(before, hanging.square) >= 200;
      const movedWasAttacked = seeGain(before, move.from) >= 200;
      if (hangingBefore && movedWasAttacked) return null;
    }
    return { square: hanging.square, type: hanging.type, materialGiven: -net };
  }

  // ---------------------------------------------------------------------------
  // Libro aperture
  // ---------------------------------------------------------------------------

  let bookCache = null;

  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  function loadBook() {
    if (bookCache) return bookCache;
    const data = root.CHESS_OPENING_BOOK;
    if (!data) return null;
    const set = new Set(data.plain ? data.plain.split(" ") : []);
    const named = new Map();
    (data.named ? data.named.split(" ") : []).forEach((entry) => {
      const [hash, index] = entry.split(":");
      set.add(hash);
      named.set(hash, data.names[Number(index)]);
    });
    bookCache = { set, named };
    return bookCache;
  }

  function bookInfo(fen) {
    const book = loadBook();
    if (!book) return { inBook: false, name: null };
    const hash = fnv1a(positionKey(fen)).toString(36);
    return { inBook: book.set.has(hash), name: book.named.get(hash) || null };
  }

  // ---------------------------------------------------------------------------
  // Classificazione mosse
  // ---------------------------------------------------------------------------

  /*
   * ctx (tutte le probabilita' sono 0-100 dal punto di vista di chi muove):
   *  winBest        valore della mossa migliore (= valore della posizione prima)
   *  winSecond      valore della seconda mossa migliore (o null)
   *  winAfter       valore della posizione dopo la mossa giocata
   *  playedIsBest   la mossa giocata coincide con la migliore del motore
   *  givesMate      la mossa da' scacco matto
   *  keepsMate      prima c'era un matto forzato e dopo la mossa c'e' ancora
   *  inBook         la posizione dopo la mossa e' nel libro aperture
   *  legalMoves     numero di mosse legali disponibili
   *  sacrifice      risultato di sacrificeInfo() (o null)
   *  isRecapture    la mossa ricattura sulla casa dell'ultima cattura avversaria
   *  isCapture      la mossa cattura un pezzo
   *  opponentLoss   perdita (punti %) della mossa precedente dell'avversario
   *  winBeforeOpponent  valore per chi muove prima della mossa avversaria precedente
   */
  function classifyMove(ctx) {
    const loss = ctx.playedIsBest ? 0 : Math.max(0, ctx.winBest - ctx.winAfter);
    const result = (quality, reason) => ({ quality, label: QUALITY_LABEL[quality], reason, loss });

    if (ctx.givesMate) return result("best", "scacco matto");
    if (ctx.legalMoves === 1) return result("forced", "unica mossa legale");
    if (ctx.inBook && loss < THRESHOLDS.inaccuracy) return result("book", "posizione presente nel libro aperture");

    // Brillante: sacrificio corretto (mossa migliore o quasi), in una posizione
    // non gia' vinta, che non porta in una posizione persa.
    if (ctx.sacrifice && loss <= THRESHOLDS.excellent && ctx.winBest < 95 && ctx.winAfter >= 50 && !ctx.isRecapture) {
      return result("brilliant", `sacrificio di ${PIECE_ARTICLE[ctx.sacrifice.type] || "materiale"} corretto`);
    }

    // Grande: unica mossa buona. La seconda scelta era nettamente peggiore.
    // Non conta se ti limiti a catturare un pezzo appena regalato dall'avversario.
    const punishesBlunder = ctx.isCapture && typeof ctx.opponentLoss === "number" && ctx.opponentLoss >= THRESHOLDS.inaccuracy;
    if (ctx.playedIsBest && typeof ctx.winSecond === "number" && !ctx.isRecapture && !punishesBlunder && ctx.legalMoves >= 3) {
      const gap = ctx.winBest - ctx.winSecond;
      const requiredGap = ctx.winBest >= 90 ? 20 : 15;
      if (gap >= requiredGap && ctx.winAfter >= 30 && ctx.winSecond < 85) {
        return result("great", `unica mossa forte: la seconda scelta perdeva ${Math.round(gap)} punti`);
      }
    }

    // Mancata: l'avversario aveva sbagliato, c'era l'occasione per cambiare la
    // partita e non e' stata sfruttata. Non vale se eri gia' nettamente avanti.
    if (
      typeof ctx.opponentLoss === "number" && ctx.opponentLoss >= THRESHOLDS.inaccuracy &&
      typeof ctx.winBeforeOpponent === "number" && ctx.winBeforeOpponent <= 85 &&
      ctx.winBest - ctx.winBeforeOpponent >= 10 &&
      loss >= THRESHOLDS.inaccuracy &&
      ctx.winAfter <= ctx.winBeforeOpponent + 10
    ) {
      return result("missed", "non hai sfruttato l'errore dell'avversario");
    }

    if (ctx.playedIsBest) return result("best", "coincide con la mossa migliore del motore");
    if (ctx.keepsMate) return result("excellent", "mantiene un matto forzato");
    if (loss <= THRESHOLDS.excellent) return result("excellent", `perdita ${loss.toFixed(1)} punti`);
    if (loss <= THRESHOLDS.good) return result("good", `perdita ${loss.toFixed(1)} punti`);
    if (loss <= THRESHOLDS.inaccuracy) return result("inaccuracy", `perdita ${loss.toFixed(1)} punti`);
    if (loss <= THRESHOLDS.mistake) return result("mistake", `perdita ${loss.toFixed(1)} punti`);
    return result("blunder", `perdita ${loss.toFixed(1)} punti`);
  }

  function isErrorQuality(quality) {
    return quality === "inaccuracy" || quality === "mistake" || quality === "blunder" || quality === "missed";
  }

  // ---------------------------------------------------------------------------
  // Pattern di errore
  // ---------------------------------------------------------------------------

  /*
   * ctx:
   *  fenBefore, fenAfter, uci, quality, loss, timeSeconds, ply
   *  refutationUci  miglior risposta avversaria dopo la mossa
   *  afterScore     valutazione dopo la mossa (punto di vista avversario)
   *  history        mosse UCI giocate prima da chi muove (per lo sviluppo)
   */
  function detectPatterns(ctx) {
    const patterns = [];
    const evidence = {};
    if (!isErrorQuality(ctx.quality)) return { patterns, evidence };
    const chessBefore = safeChess(ctx.fenBefore);
    const chessAfter = safeChess(ctx.fenAfter);
    if (!chessBefore || !chessAfter) return { patterns, evidence };
    const mover = chessBefore.turn();
    const played = applyUci(safeChess(ctx.fenBefore), ctx.uci);
    const phase = phaseOf(ctx.fenBefore, ctx.ply || 0);
    const loss = ctx.loss || 0;

    // Risposta che punisce la mossa.
    let refutation = null;
    if (ctx.refutationUci) {
      const probe = safeChess(ctx.fenAfter);
      refutation = probe ? applyUci(probe, ctx.refutationUci) : null;
    }

    const mateAgainst = ctx.afterScore && typeof ctx.afterScore.mate === "number" && ctx.afterScore.mate > 0;
    const quietMove = played && !played.captured && !played.san.includes("+");
    const wasInCheck = chessBefore.inCheck();

    // 1) Pezzo lasciato in presa / minaccia ignorata (se c'e' un matto, conta solo quello)
    const hangingAfter = mateAgainst ? null : worstHangingPiece(ctx.fenAfter, mover);
    if (hangingAfter && hangingAfter.gain >= 200) {
      const nullFen = nullMoveFen(ctx.fenBefore);
      let existedBefore = false;
      if (nullFen && played && played.from !== hangingAfter.square) {
        const before = safeChess(nullFen);
        if (before) {
          const cell = before.get(hangingAfter.square);
          if (cell && cell.color === mover && seeGain(before, hangingAfter.square) >= 200) existedBefore = true;
        }
      }
      evidence.hanging = { square: hangingAfter.square, type: hangingAfter.type, gain: hangingAfter.gain };
      if (existedBefore) {
        patterns.push("missedThreat");
        evidence.threat = { kind: "hanging", square: hangingAfter.square, type: hangingAfter.type };
      } else {
        patterns.push("hangingPiece");
      }
    }

    // 2) Minaccia gia' presente prima della mossa (scacco, cattura, matto)
    if (refutation && !patterns.includes("missedThreat")) {
      const nullFen = nullMoveFen(ctx.fenBefore);
      const probe = nullFen ? safeChess(nullFen) : null;
      if (probe) {
        const threat = applyUci(probe, ctx.refutationUci);
        if (threat && (threat.captured || threat.san.includes("+") || threat.san.includes("#"))) {
          const valuable = threat.captured && PIECE_VALUE[threat.captured] >= 300;
          if (valuable || threat.san.includes("#") || (ctx.afterScore && typeof ctx.afterScore.mate === "number" && ctx.afterScore.mate > 0)) {
            patterns.push("missedThreat");
            evidence.threat = { kind: threat.san.includes("#") ? "mate" : "capture", san: threat.san, type: threat.captured || null };
          }
        }
      }
    }

    // 3) Sicurezza del re
    const refutationChecks = refutation && refutation.san.includes("+");
    let kingWeakened = false;
    if (played) {
      if (played.piece === "k" && !played.san.startsWith("O-O") && phase !== "Finale") kingWeakened = true;
      if (played.piece === "p" && phase !== "Finale") {
        const king = findKing(chessBefore, mover);
        if (king) {
          const kingFile = king.charCodeAt(0);
          const pawnFile = played.from.charCodeAt(0);
          const homeRank = mover === "w" ? "1" : "8";
          if (king[1] === homeRank && Math.abs(kingFile - pawnFile) <= 1 && (kingFile <= 99 || kingFile >= 102)) kingWeakened = true;
        }
      }
    }
    if (mateAgainst || (refutationChecks && loss >= THRESHOLDS.mistake) || (kingWeakened && loss >= THRESHOLDS.good)) {
      patterns.push("kingSafety");
      evidence.king = { mate: mateAgainst ? ctx.afterScore.mate : null, weakened: kingWeakened };
    }

    // 4) Calcolo incompleto: mossa forzante (cattura/scacco) che non funziona
    if (played && !quietMove && !wasInCheck && loss >= THRESHOLDS.inaccuracy) {
      patterns.push("calculation");
      evidence.calculation = { forcing: played.san };
    }

    // 5) Sviluppo lento in apertura
    if (phase === "Apertura" && quietMove && !wasInCheck && !mateAgainst && loss >= THRESHOLDS.good) {
      const history = Array.isArray(ctx.history) ? ctx.history : [];
      const samePieceAgain = history.some((uci) => uci && uci.slice(2, 4) === played.from);
      const earlyQueen = played.piece === "q" && (ctx.ply || 0) < 16;
      const homeMinors = countHomeMinors(chessBefore, mover);
      const pawnWhileUndeveloped = played.piece === "p" && homeMinors >= 3 && !["d", "e", "c"].includes(played.from[0]);
      if (samePieceAgain || earlyQueen || pawnWhileUndeveloped) {
        patterns.push("development");
        evidence.development = { samePieceAgain, earlyQueen, pawnWhileUndeveloped };
      }
    }

    // 6) Finale
    if (phase === "Finale" && loss >= THRESHOLDS.good) patterns.push("weakEndgame");

    // 7) Mancanza di piano: mossa tranquilla senza tattica, peggiora la posizione
    if (!patterns.length && quietMove && !wasInCheck && phase === "Mediogioco") {
      patterns.push("noPlan");
    }

    // 8) Impulsivita': errore serio giocato molto in fretta
    const seconds = typeof ctx.timeSeconds === "number" ? ctx.timeSeconds : null;
    if (seconds !== null && seconds <= 5 && loss >= THRESHOLDS.inaccuracy) {
      patterns.push("concentration");
      evidence.time = seconds;
    }

    if (!patterns.length) patterns.push(loss >= THRESHOLDS.mistake ? "calculation" : "noPlan");
    const unique = [...new Set(patterns)];
    // Al massimo 3 pattern: il primo e' la causa principale; l'impulsivita' resta sempre visibile.
    const main = unique.filter((p) => p !== "concentration").slice(0, 2);
    if (unique.includes("concentration")) main.push("concentration");
    return { patterns: main.length ? main : unique.slice(0, 3), evidence };
  }

  function findKing(chess, color) {
    let square = null;
    chess.board().forEach((row) => row.forEach((cell) => {
      if (cell && cell.type === "k" && cell.color === color) square = cell.square;
    }));
    return square;
  }

  function countHomeMinors(chess, color) {
    const rank = color === "w" ? "1" : "8";
    const squares = ["b", "c", "f", "g"].map((file) => `${file}${rank}`);
    return squares.filter((sq) => {
      const cell = chess.get(sq);
      return cell && cell.color === color && (cell.type === "n" || cell.type === "b");
    }).length;
  }

  // ---------------------------------------------------------------------------
  // Commenti del coach
  // ---------------------------------------------------------------------------

  function pieceArticle(type) {
    return PIECE_ARTICLE[type] || "il pezzo";
  }

  function lossText(loss) {
    return `${Math.round(loss)} punti di probabilita' di vittoria`;
  }

  function buildComment(info) {
    const { quality, bestLine, loss, patterns, evidence, opening, reason, winBest, winSecond, sacrifice } = info;
    const san = figurine(info.san);
    const bestSan = figurine(info.bestSan);
    const refutationSan = info.refutationSan ? figurine(info.refutationSan) : null;
    const parts = [];
    switch (quality) {
      case "book":
        parts.push(`${san} e' una mossa da libro${opening ? ` (${opening})` : ""}: segui una linea di apertura conosciuta.`);
        break;
      case "forced":
        parts.push(`${san} era l'unica mossa legale.`);
        break;
      case "best":
        parts.push(reason === "scacco matto" ? `${san}: scacco matto, partita chiusa.` : `${san} e' la mossa migliore secondo Stockfish.`);
        break;
      case "great":
        parts.push(`${san} e' una grande mossa: era l'unica che teneva la posizione. La seconda scelta perdeva circa ${Math.round(winBest - winSecond)} punti.`);
        break;
      case "brilliant":
        parts.push(`${san} e' brillante: sacrifichi ${pieceArticle(sacrifice && sacrifice.type)} ma la posizione regge perche' l'avversario non puo' approfittarne senza conseguenze.`);
        break;
      case "excellent":
        parts.push(`${san} e' ottima: quasi equivalente alla migliore (${bestSan}).`);
        break;
      case "good":
        parts.push(`${san} e' buona: perdi poco (${lossText(loss)}). Piu' preciso era ${bestSan}.`);
        break;
      case "inaccuracy":
      case "mistake":
      case "blunder":
      case "missed": {
        const label = QUALITY_LABEL[quality];
        if (quality === "missed") parts.push(`${san}: mossa mancata. L'avversario aveva sbagliato e ${bestSan} ti dava un vantaggio concreto.`);
        else parts.push(`${san} e' ${label === "Errore" ? "un errore" : label === "Imprecisione" ? "un'imprecisione" : "un blunder"}: perdi ${lossText(loss)}.`);
        parts.push(...explainPatterns(patterns, evidence, refutationSan));
        if (quality !== "missed") parts.push(`Era meglio ${bestSan}.`);
        break;
      }
      default:
        break;
    }
    if (bestLine && isErrorQuality(quality)) parts.push(`Linea migliore: ${bestLine}.`);
    return parts.join(" ");
  }

  function explainPatterns(patterns, evidence, refutationSan) {
    const out = [];
    (patterns || []).forEach((pattern) => {
      if (pattern === "hangingPiece" && evidence.hanging) {
        out.push(`Lasci ${pieceArticle(evidence.hanging.type)} in ${evidence.hanging.square} senza difesa sufficiente${refutationSan ? `: l'avversario puo' giocare ${refutationSan}` : ""}.`);
      } else if (pattern === "missedThreat") {
        if (evidence.threat && evidence.threat.kind === "hanging") out.push(`${capitalize(pieceArticle(evidence.threat.type))} in ${evidence.threat.square} era gia' attaccato e non l'hai messo al sicuro.`);
        else if (evidence.threat && evidence.threat.kind === "mate") out.push(`L'avversario minacciava gia' ${figurine(evidence.threat.san)}: andava fermato prima di tutto.`);
        else out.push(`L'avversario minacciava gia' ${refutationSan || "una tattica"} e la mossa non la ferma.`);
      } else if (pattern === "kingSafety") {
        if (evidence.king && evidence.king.mate) out.push(`Il tuo re diventa vulnerabile: l'avversario ha matto in ${evidence.king.mate}.`);
        else if (evidence.king && evidence.king.weakened) out.push("La mossa indebolisce la protezione del tuo re.");
        else out.push(`Il tuo re resta esposto agli scacchi${refutationSan ? ` (${refutationSan})` : ""}.`);
      } else if (pattern === "calculation") {
        out.push(evidence.calculation ? `La sequenza iniziata con ${figurine(evidence.calculation.forcing)} non funziona: la variante andava calcolata fino in fondo.` : "La variante non era calcolata fino in fondo.");
      } else if (pattern === "development") {
        const d = evidence.development || {};
        if (d.earlyQueen) out.push("Muovi la donna troppo presto invece di sviluppare i pezzi leggeri.");
        else if (d.samePieceAgain) out.push("Muovi di nuovo lo stesso pezzo in apertura e perdi tempi di sviluppo.");
        else out.push("Spingi un pedone mentre cavalli e alfieri sono ancora a casa.");
      } else if (pattern === "weakEndgame") {
        out.push("Nel finale ogni tempo conta: re attivo, pedoni passati e calcolo preciso.");
      } else if (pattern === "noPlan") {
        out.push("Mossa senza un obiettivo chiaro: non migliora i pezzi e non crea pressione.");
      } else if (pattern === "concentration" && typeof evidence.time === "number") {
        out.push(`L'hai giocata in ${evidence.time <= 1 ? "un secondo" : `${evidence.time} secondi`}: troppo in fretta per una posizione che richiedeva controllo.`);
      }
    });
    return out;
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  // ---------------------------------------------------------------------------
  // Elo stimato dalla precisione
  // ---------------------------------------------------------------------------

  // Precisione tipica (metodo Lichess) per fascia Elo. Usata sia per calibrare
  // i bot sia per stimare il "game rating" di una partita.
  const ACCURACY_BY_ELO = [
    [250, 45], [400, 52], [550, 58], [700, 63], [850, 67], [1000, 70], [1150, 73],
    [1300, 75], [1450, 77], [1600, 79], [1800, 81], [2000, 83], [2200, 85],
    [2400, 87], [2600, 88.5], [2800, 90], [3000, 92], [3200, 94], [3600, 96]
  ];

  function expectedAccuracyForElo(elo) {
    const table = ACCURACY_BY_ELO;
    if (elo <= table[0][0]) return table[0][1];
    for (let i = 1; i < table.length; i += 1) {
      if (elo <= table[i][0]) {
        const [e0, a0] = table[i - 1];
        const [e1, a1] = table[i];
        return a0 + (a1 - a0) * ((elo - e0) / (e1 - e0));
      }
    }
    return table[table.length - 1][1];
  }

  function eloFromAccuracy(accuracy) {
    const table = ACCURACY_BY_ELO;
    if (accuracy <= table[0][1]) return table[0][0];
    for (let i = 1; i < table.length; i += 1) {
      if (accuracy <= table[i][1]) {
        const [e0, a0] = table[i - 1];
        const [e1, a1] = table[i];
        return Math.round(e0 + (e1 - e0) * ((accuracy - a0) / (a1 - a0)));
      }
    }
    return table[table.length - 1][0];
  }

  return {
    PIECE_VALUE,
    PIECE_NAME,
    QUALITY_LABEL,
    THRESHOLDS,
    MATE_CP,
    ACCURACY_BY_ELO,
    clamp,
    winPercent,
    scoreWinPercent,
    scoreToCp,
    flipScore,
    sameScore,
    moveAccuracy,
    gameAccuracy,
    fenSide,
    otherColor,
    positionKey,
    nullMoveFen,
    terminalInfo,
    uciToMoveObject,
    applyUci,
    uciToSan,
    pvToSan,
    formatLine,
    figurine,
    phaseOf,
    seeGain,
    worstHangingPiece,
    sacrificeInfo,
    bookInfo,
    classifyMove,
    isErrorQuality,
    detectPatterns,
    buildComment,
    expectedAccuracyForElo,
    eloFromAccuracy,
    safeChess
  };
});
