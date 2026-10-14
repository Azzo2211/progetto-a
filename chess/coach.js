/*
 * Progetto A - Scacchi: coach in partita (modalita' allenamento).
 *
 * Controlli veloci, senza motore, fatti con chess.js:
 *  - dopo la tua mossa: hai lasciato un pezzo in presa? Hai concesso un matto?
 *    Avevi un matto in una e non l'hai visto?
 *  - dopo la mossa del bot: cosa minaccia? C'e' qualcosa da prendere?
 *  - consigli d'apertura semplici (sviluppo, arrocco)
 * Il testo e' scritto per insegnare: dice cosa guardare, non solo la mossa.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessCoach = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const PIECE = { p: "pedone", n: "cavallo", b: "alfiere", r: "torre", q: "donna", k: "re" };
  const ARTICLE = { p: "il", n: "il", b: "l'", r: "la", q: "la", k: "il" };
  const VALUE = { p: 100, n: 300, b: 300, r: 500, q: 900, k: 0 };

  function A() {
    if (root.ChessAnalysis) return root.ChessAnalysis;
    if (typeof require === "function") return require("./analysis-core.js");
    throw new Error("ChessAnalysis non caricato");
  }

  function named(type, square) {
    const art = ARTICLE[type];
    return `${art}${art.endsWith("'") ? "" : " "}${PIECE[type]} in ${square}`;
  }

  function mateInOne(fen) {
    const chess = A().safeChess(fen);
    if (!chess) return null;
    for (const move of chess.moves({ verbose: true })) {
      chess.move(move);
      const mate = chess.isCheckmate();
      chess.undo();
      if (mate) return move;
    }
    return null;
  }

  // Analisi della mossa appena giocata dal giocatore (colore `color`).
  function reviewPlayerMove(fenBefore, uci, color = "w") {
    const core = A();
    const chess = core.safeChess(fenBefore);
    if (!chess) return null;
    const missedMate = mateInOne(fenBefore);
    const move = core.applyUci(chess, uci);
    if (!move) return null;
    const fenAfter = chess.fen();
    if (chess.isCheckmate()) return { severity: "great", text: "Scacco matto! Hai chiuso la partita." };
    if (missedMate && missedMate.lan !== move.lan && missedMate.from + missedMate.to !== uci.slice(0, 4)) {
      return {
        severity: "missed",
        text: `Avevi uno scacco matto in una mossa: ${missedMate.san}. Prima di muovere controlla sempre tutti i tuoi scacchi.`,
        square: missedMate.from,
        arrow: { from: missedMate.from, to: missedMate.to }
      };
    }
    const enemyMate = mateInOne(fenAfter);
    if (enemyMate) {
      return {
        severity: "blunder",
        text: `Attento: dopo ${move.san} il Nero ha matto in una (${enemyMate.san}). Guarda le case attorno al tuo re.`,
        square: enemyMate.to,
        arrow: { from: enemyMate.from, to: enemyMate.to }
      };
    }
    const captured = move.captured ? VALUE[move.captured] : 0;
    const hanging = core.worstHangingPiece(fenAfter, color);
    if (hanging && hanging.gain - captured >= 200) {
      const loss = Math.round((hanging.gain - captured) / 100);
      return {
        severity: "blunder",
        text: `Attento: ${named(hanging.type, hanging.square)} resta in presa. Il Nero puo' vincere circa ${loss} punti di materiale. Chi lo difende?`,
        square: hanging.square
      };
    }
    return null;
  }

  // Dopo la mossa del bot: minacce contro di te e occasioni per te.
  function describeThreats(fen, color = "w") {
    const core = A();
    const chess = core.safeChess(fen);
    if (!chess || chess.turn() !== color) return null;
    if (chess.isCheck()) return { text: "Sei sotto scacco: prima di tutto metti al sicuro il re (sposta, para o cattura).", level: "check" };
    const opponentTurn = core.nullMoveFen(fen);
    const threatMate = opponentTurn ? mateInOne(opponentTurn) : null;
    if (threatMate) {
      return {
        text: `Il bot minaccia matto con ${threatMate.san}. Trova una difesa prima di fare altro.`,
        level: "danger",
        square: threatMate.to
      };
    }
    const threatened = opponentTurn ? core.worstHangingPiece(opponentTurn, color) : null;
    if (threatened && threatened.gain >= 200) {
      return {
        text: `Il bot attacca ${named(threatened.type, threatened.square)} e non e' abbastanza difeso. Spostalo, difendilo o contrattacca qualcosa di piu' grande.`,
        level: "danger",
        square: threatened.square
      };
    }
    const myMate = mateInOne(fen);
    if (myMate) return { text: "C'e' un'occasione enorme: controlla tutti i tuoi scacchi.", level: "chance" };
    const freeMaterial = core.worstHangingPiece(fen, color === "w" ? "b" : "w");
    if (freeMaterial && freeMaterial.gain >= 200) {
      return { text: "Il bot ha lasciato qualcosa senza difesa. Controlla le catture prima di muovere.", level: "chance" };
    }
    return null;
  }

  // Consigli d'apertura basati sulla posizione (solo per il Bianco, prime mosse).
  function openingAdvice(fen, ply) {
    if (ply > 24) return null;
    const chess = A().safeChess(fen);
    if (!chess) return null;
    const at = (sq) => chess.get(sq);
    const homeMinors = ["b1", "g1", "c1", "f1"].filter((sq) => {
      const p = at(sq);
      return p && p.color === "w" && (p.type === "n" || p.type === "b");
    }).length;
    const king = at("e1");
    const castled = (at("g1") && at("g1").type === "k") || (at("c1") && at("c1").type === "k") || (at("b1") && at("b1").type === "k");
    const queenOut = !(at("d1") && at("d1").type === "q");
    if (ply <= 6 && queenOut && homeMinors >= 3) return "La donna e' uscita presto: rischi di perdere tempo quando viene attaccata. Sviluppa prima cavalli e alfieri.";
    if (ply >= 10 && homeMinors >= 2) return `Hai ancora ${homeMinors} pezzi leggeri nella casa iniziale. Svilupparli viene prima degli attacchi.`;
    if (ply >= 14 && king && king.type === "k" && !castled) return "Il re e' ancora al centro. Con l'arrocco lo metti al sicuro e attivi la torre.";
    return null;
  }

  return { reviewPlayerMove, describeThreats, openingAdvice, mateInOne, PIECE };
});
