/*
 * Test del nucleo scacchi (precisione, classificazione, pattern, bot, parsing UCI).
 * Non servono dipendenze: usa vendor/chess.js del progetto.
 *
 *   node tests/chess-core.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const root = path.join(__dirname, "..");
require(path.join(root, "vendor", "chess.js"));
require(path.join(root, "chess", "opening-book.js"));
const A = require(path.join(root, "chess", "analysis-core.js"));
const Bot = require(path.join(root, "chess", "bot.js"));
const Review = require(path.join(root, "chess", "review.js"));
const { parseInfo } = require(path.join(root, "chess", "engine.js"));

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error(`FALLITO: ${name}`);
    throw error;
  }
}

const near = (actual, expected, tolerance, message) => assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} invece di ~${expected}`);

// --- Probabilita' di vittoria e precisione (metodo Lichess) -----------------
test("win% simmetrica e centrata", () => {
  assert.strictEqual(A.winPercent(0), 50);
  near(A.winPercent(300) + A.winPercent(-300), 100, 1e-9, "simmetria");
  near(A.winPercent(100), 59.1, 0.2, "+1 pedone");
  near(A.winPercent(5000), A.winPercent(1000), 1e-9, "limite a +-1000 cp");
});

test("matto = come +/-10 pedoni (regola Lichess)", () => {
  assert.strictEqual(A.scoreWinPercent({ mate: 3 }), A.winPercent(1000));
  assert.strictEqual(A.scoreWinPercent({ mate: -2 }), A.winPercent(-1000));
  assert.strictEqual(A.scoreWinPercent({ mate: 0 }), A.winPercent(-1000));
});

test("precisione per mossa", () => {
  assert.strictEqual(A.moveAccuracy(50, 50), 100);
  assert.strictEqual(A.moveAccuracy(50, 60), 100);
  near(A.moveAccuracy(50, 40), 64.6, 0.5, "perdita 10 punti");
  near(A.moveAccuracy(80, 20), 5.4, 0.5, "perdita 60 punti");
});

test("partita perfetta = 100% per entrambi", () => {
  const acc = A.gameAccuracy([52, 52, 52, 52, 52, 52], "w");
  assert.strictEqual(Math.round(acc.w), 100);
  assert.strictEqual(Math.round(acc.b), 100);
});

test("un blunder abbassa la precisione solo di chi lo commette", () => {
  const acc = A.gameAccuracy([50, 50, 50, 20, 20, 20, 20], "w");
  assert.ok(acc.w < 70, `bianco ${acc.w}`);
  assert.strictEqual(Math.round(acc.b), 100);
});

// --- Classificazione ---------------------------------------------------------
const base = { winBest: 55, winSecond: 50, winAfter: 55, playedIsBest: false, legalMoves: 30 };
test("soglie di classificazione (stile chess.com)", () => {
  assert.strictEqual(A.classifyMove({ ...base, playedIsBest: true }).quality, "best");
  assert.strictEqual(A.classifyMove({ ...base, winAfter: 54 }).quality, "excellent");
  assert.strictEqual(A.classifyMove({ ...base, winAfter: 52 }).quality, "good");
  assert.strictEqual(A.classifyMove({ ...base, winAfter: 48 }).quality, "inaccuracy");
  assert.strictEqual(A.classifyMove({ ...base, winAfter: 40 }).quality, "mistake");
  assert.strictEqual(A.classifyMove({ ...base, winAfter: 20 }).quality, "blunder");
});

test("matto, mossa forzata e libro", () => {
  assert.strictEqual(A.classifyMove({ ...base, givesMate: true }).quality, "best");
  assert.strictEqual(A.classifyMove({ ...base, legalMoves: 1, winAfter: 10 }).quality, "forced");
  assert.strictEqual(A.classifyMove({ ...base, inBook: true, winAfter: 53 }).quality, "book");
  assert.strictEqual(A.classifyMove({ ...base, inBook: true, winAfter: 30 }).quality, "blunder", "una mossa da libro che perde molto resta un errore");
});

test("grande: unica mossa buona, ma non per catturare un pezzo regalato", () => {
  const critical = { ...base, playedIsBest: true, winBest: 60, winSecond: 30, winAfter: 60 };
  assert.strictEqual(A.classifyMove(critical).quality, "great");
  assert.strictEqual(A.classifyMove({ ...critical, isCapture: true, opponentLoss: 30 }).quality, "best");
  assert.strictEqual(A.classifyMove({ ...critical, isRecapture: true }).quality, "best");
});

test("brillante: sacrificio corretto, non in posizione gia' vinta", () => {
  const sac = { ...base, playedIsBest: true, winBest: 60, winAfter: 61, sacrifice: { type: "n" } };
  assert.strictEqual(A.classifyMove(sac).quality, "brilliant");
  assert.strictEqual(A.classifyMove({ ...sac, winBest: 98, winSecond: 97, winAfter: 98 }).quality, "best");
  assert.strictEqual(A.classifyMove({ ...sac, givesMate: true }).quality, "best");
});

test("mancata: solo se l'avversario aveva sbagliato e non eri gia' vincente", () => {
  const miss = { ...base, winBest: 70, winAfter: 45, opponentLoss: 25, winBeforeOpponent: 40 };
  assert.strictEqual(A.classifyMove(miss).quality, "missed");
  assert.strictEqual(A.classifyMove({ ...miss, winBeforeOpponent: 90, winBest: 99, winAfter: 80 }).quality, "mistake", "da +10 non e' una mossa mancata");
});

// --- Posizioni reali (chess.js) ---------------------------------------------
const afterNf3Nc6 = "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3";
test("SEE e sacrifici", () => {
  const sac = A.sacrificeInfo(afterNf3Nc6, "f3e5");
  assert.ok(sac && sac.type === "n", "Nxe5 lascia il cavallo in presa");
  assert.strictEqual(A.sacrificeInfo(afterNf3Nc6, "f1c4"), null, "Bc4 non sacrifica niente");
});

test("SEE sceglie la promozione a donna", () => {
  const chess = new Chess("r3k3/1P6/8/8/8/8/8/4K3 w - - 0 1");
  assert.strictEqual(A.seeGain(chess, "a8"), 500 + 800);
});

test("pattern: pezzo lasciato in presa", () => {
  const chess = new Chess(afterNf3Nc6);
  chess.move("Nxe5");
  const info = A.detectPatterns({
    fenBefore: afterNf3Nc6,
    fenAfter: chess.fen(),
    uci: "f3e5",
    quality: "mistake",
    loss: 15,
    timeSeconds: 2,
    ply: 4,
    refutationUci: "c6e5",
    afterScore: { cp: 250 }
  });
  assert.strictEqual(info.patterns[0], "hangingPiece");
  assert.ok(info.patterns.includes("concentration"), "errore giocato in 2 secondi = impulsivita'");
});

test("libro aperture", () => {
  const chess = new Chess();
  chess.move("e4");
  const info = A.bookInfo(chess.fen());
  assert.ok(info.inBook);
  assert.ok(/King's Pawn/.test(info.name || ""), info.name);
  const odd = new Chess();
  ["a3", "h5", "Ra2", "Rh6"].forEach((san) => odd.move(san));
  assert.strictEqual(A.bookInfo(odd.fen()).inBook, false);
});

test("notazione e linee", () => {
  assert.strictEqual(A.figurine("Nf3"), "♘f3");
  assert.strictEqual(A.figurine("e8=Q+"), "e8=♕+");
  const line = A.formatLine(afterNf3Nc6, A.pvToSan(afterNf3Nc6, ["f1b5", "a7a6"]));
  assert.strictEqual(line, "3. ♗b5 a6");
});

// --- Bot -----------------------------------------------------------------------
test("livelli bot ordinati e coerenti", () => {
  for (let i = 1; i < Bot.LEVELS.length; i += 1) {
    const prev = Bot.LEVELS[i - 1];
    const level = Bot.LEVELS[i];
    assert.ok(level.elo > prev.elo, "Elo crescente");
    assert.ok(level.errors.blunder <= prev.errors.blunder, `blunder non crescenti (livello ${level.level})`);
  }
  assert.strictEqual(Bot.getLevel(99).level, Bot.MAX_LEVEL);
  assert.strictEqual(Bot.getLevel("abc").level, 1);
  assert.strictEqual(Bot.levelForElo(1310), 8);
});

test("i livelli alti giocano sempre la mossa migliore", () => {
  const candidates = [{ uci: "e2e4", score: { cp: 30 } }, { uci: "a2a3", score: { cp: -40 } }];
  const top = Bot.getLevel(Bot.MAX_LEVEL);
  for (let i = 0; i < 20; i += 1) assert.strictEqual(Bot.selectMove(candidates, top, Math.random).uci, "e2e4");
});

test("l'errore del bot ha la gravita' scelta", () => {
  const candidates = [
    { uci: "a", score: { cp: 0 } },
    { uci: "b", score: { cp: -20 } },
    { uci: "c", score: { cp: -300 } },
    { uci: "d", score: { cp: -900 } }
  ];
  const config = { ...Bot.getLevel(8), errors: { blunder: 1, mistake: 0, inaccuracy: 0 } };
  const pick = Bot.selectMove(candidates, config, () => 0);
  assert.ok(["c", "d"].includes(pick.uci), pick.uci);
  assert.ok(pick.loss >= 20);
});

test("in posizione vinta il bot preferisce chiudere", () => {
  assert.ok(Bot.selectionUtility({ mate: 2 }) > Bot.selectionUtility({ mate: 6 }));
  assert.ok(Bot.selectionUtility({ mate: 6 }) > Bot.selectionUtility({ cp: 4000 }));
  assert.ok(Bot.selectionUtility({ cp: 3000 }) > Bot.selectionUtility({ cp: 1500 }));
});

// --- Parsing UCI e revisione --------------------------------------------------
test("parsing delle righe info di Stockfish", () => {
  const info = parseInfo("info depth 14 seldepth 18 multipv 2 score cp -46 nodes 1 nps 1 time 1 pv g8f6 e1g1");
  assert.deepStrictEqual(info, { depth: 14, multipv: 2, score: { cp: -46 }, pv: ["g8f6", "e1g1"] });
  assert.strictEqual(parseInfo("info depth 5 score cp 10 upperbound pv e2e4"), null);
  assert.deepStrictEqual(parseInfo("info depth 9 multipv 1 score mate -3 pv a1a2").score, { mate: -3 });
});

test("revisione completa su analisi simulate", () => {
  const chess = new Chess();
  const moves = [];
  ["e4", "e5", "Qh5", "Ke7"].forEach((san) => {
    const fenBefore = chess.fen();
    const move = chess.move(san);
    moves.push({ fenBefore, fenAfter: chess.fen(), uci: move.from + move.to, timeSeconds: 10 });
  });
  const entries = [
    { ok: true, score: { cp: 30 }, lines: [{ score: { cp: 30 }, pv: ["e2e4"] }, { score: { cp: 25 }, pv: ["d2d4"] }], depth: 16 },
    { ok: true, score: { cp: -30 }, lines: [{ score: { cp: -30 }, pv: ["e7e5"] }, { score: { cp: -35 }, pv: ["c7c5"] }], depth: 16 },
    { ok: true, score: { cp: 25 }, lines: [{ score: { cp: 25 }, pv: ["g1f3"] }, { score: { cp: 20 }, pv: ["b1c3"] }], depth: 16 },
    { ok: true, score: { cp: 0 }, lines: [{ score: { cp: 0 }, pv: ["b8c6"] }, { score: { cp: -10 }, pv: ["g8f6"] }], depth: 16 },
    { ok: true, score: { cp: 600 }, lines: [{ score: { cp: 600 }, pv: ["h5e5"] }], depth: 16 }
  ];
  const review = Review.buildReview(moves, entries);
  assert.strictEqual(review.moves.length, 4);
  assert.strictEqual(review.moves[0].quality, "book");
  assert.strictEqual(review.moves[3].quality, "blunder", "Ke7?? perde molto");
  assert.ok(review.summary.accuracy.b < review.summary.accuracy.w);
  assert.ok(review.moves[3].comment.includes("blunder"));
});

console.log(`Tutti i test superati (${passed}).`);
