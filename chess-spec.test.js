const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const source = fs.readFileSync(path.join(__dirname, "app.js"), "utf8");

const sandbox = {
  console,
  Date,
  Math,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Worker: undefined,
  URL: {
    createObjectURL: () => "blob:test",
    revokeObjectURL: () => {},
  },
  Blob: function Blob() {},
  window: {
    location: { protocol: "http:", href: "http://127.0.0.1:8765/index.html#chess", hash: "#chess" },
    scrollTo: () => {},
    addEventListener: () => {},
    setTimeout,
    clearTimeout,
  },
  document: {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => [],
    createElement: () => ({
      classList: { add: () => {}, toggle: () => {} },
      dataset: {},
      style: {},
      append: () => {},
      appendChild: () => {},
      setAttribute: () => {},
      addEventListener: () => {},
    }),
  },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
  },
};

const assertions = `
  assert.deepStrictEqual(
    getBotLevelSpec(10),
    { elo: 1600, mode: "Stockfish", depth: 6, timeMs: 750, moveTimeMs: 750, topN: 4, noiseCp: 55, skillLevel: 9, mistakeRatePercent: 14, blunderRatePercent: 2, randomMovePercent: 2 },
    "level 10 should be a humanized 1600 profile, not an overpowered engine profile"
  );

  assert.strictEqual(getMaxBotLevel(), 15, "bot levels 1-15 should be exposed");
  assert.strictEqual(botLevels.length, 15, "botLevels should expose exactly 15 configured levels");
  assert.strictEqual(getActiveBotLevel("abc"), 1, "invalid bot level input should fall back to level 1");
  assert.strictEqual(getActiveBotLevel(2.8), 3, "bot level selection should normalize to the nearest integer level");
  assert.strictEqual(getActiveBotLevel("9"), 9, "numeric select values should be accepted as bot levels");
  assert.strictEqual(getActiveBotLevel(99), 15, "bot level selection should clamp to the strongest configured level");
  assert.deepStrictEqual(
    Object.keys(botLevels[0]).sort(),
    ["blunderRatePercent","depth","description","estimatedElo","level","mistakeRatePercent","moveTimeMs","name","noiseCp","randomMovePercent","skillLevel","topN"].sort(),
    "bot level objects should contain the required tuning fields"
  );
  assert.strictEqual(getEngineTimeForLevel(10), 750, "level 10 should use a moderate Stockfish budget");
  assert.strictEqual(getEngineTopCountForLevel(10), 4, "level 10 should choose among humanized Stockfish lines");
  assert.strictEqual(getBotLevelSpec(9).depth, 5, "level 9 / 1450 should see enough to avoid obvious piece drops");
  assert.strictEqual(getBotLevelSpec(9).topN, 5, "level 9 / 1450 should still consider non-best human candidates");
  assert.ok(getEngineChoiceWeights(9, 5)[0] < 0.65, "level 9 should not choose the engine best move overwhelmingly often");
  assert.strictEqual(getHumanCandidateLossLimit(9, "controlled-blunder-candidate"), 180, "level 9 should not allow controlled blunders that drop large material");
  const fakePool = [
    { uci: "a", evaluation: { type: "cp", value: 100 } },
    { uci: "b", evaluation: { type: "cp", value: -60 } },
    { uci: "c", evaluation: { type: "cp", value: -250 } }
  ];
  assert.deepStrictEqual(
    keepHumanCandidatePoolWithinLoss(fakePool, fakePool, 9).map((candidate) => candidate.uci),
    ["a", "b"],
    "level 9 should filter out candidate moves far below the best line"
  );
  assert.strictEqual(getBotLevelSpec(15).depth, 24, "level 15 should use depth 24");
  assert.strictEqual(getBotLevelSpec(15).timeMs, 6000, "level 15 should use 6000ms move time");
  assert.deepStrictEqual(getBotAccuracyRange(10), [75, 82], "level 10 target accuracy should match the requested 1600 range");

  const openingMove = { uci: "e2e4" };
  currentGame = { moves: [openingMove] };
  assert.strictEqual(isBookMoveRecord(openingMove, 0), false, "book classification must not be guessed without a curated opening DB");
  assert.strictEqual(
    isBookMoveRecord({ uci: "e2e4", moveNumber: 1, san: "e4" }, 10, 0.01),
    true,
    "normal curated opening moves with tiny EP loss should become book moves"
  );
  assert.strictEqual(Math.round(expectedPoints(0, 1300) * 1000), 500, "0 cp should be 0.5 expected points");
  assert.strictEqual(playerCpFromWhiteCp(120, "b"), -120, "black POV must invert white Stockfish eval");
  assert.strictEqual(engineEvalToWhiteCentipawns({ type: "cp", value: 32 }), 32, "white POV parser should preserve Stockfish centipawns");
  assert.strictEqual(engineEvalToWhiteCentipawns({ type: "cp", value: 32 }, "b"), -32, "Stockfish scores from black to move must invert into white POV");
  assert.strictEqual(engineEvalToPlayerCentipawns({ type: "cp", value: -100 }, "b", "w"), 100, "after a white move, negative black-to-move score is good for white");
  assert.strictEqual(engineEvalToPlayerCentipawns({ type: "cp", value: 150 }, "b", "w"), -150, "after a white move, positive black-to-move score is bad for white");
  assert.strictEqual(getFenActiveColor("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1"), "b", "FEN active color should be parsed for engine score normalization");
  assert.strictEqual(findCandidateForMove([{ uci: "e2e4", evaluation: { type: "cp", value: 20 } }], "e2e4").uci, "e2e4", "review should reuse matching root MultiPV candidate when available");
  assert.strictEqual(getMoveQualityMeta("good").icon, String.fromCharCode(0x2713), "review icons should render clean symbols without mojibake");
  assert.strictEqual(getMoveQualityMeta("blunder").label, "Blunder", "review should keep Chess.com-style Blunder wording");

  assert.strictEqual(
    classifyEngineMove({ isBook: false, isBrilliant: false, isGreat: false, playedMove: "a2a3", bestMove: "b1c3", isMissed: false, evalLoss: 0.21, epLoss: 0.021, epBefore: 0.55, epPlayed: 0.53 }).quality,
    "good",
    "expected-points thresholds should classify 0.02-0.05 EP loss as good"
  );
  assert.strictEqual(
    classifyEngineMove({ isBook: false, isBrilliant: false, isGreat: false, playedMove: "a2a3", bestMove: "b1c3", isMissed: false, evalLoss: 0.60, epLoss: 0.019, epBefore: 0.55, epPlayed: 0.531 }).quality,
    "excellent",
    "expected-points thresholds should classify <=0.02 EP loss as excellent"
  );
  assert.strictEqual(
    classifyEngineMove({ isBook: false, isBrilliant: false, isGreat: false, playedMove: "a2a3", bestMove: "b1c3", isMissed: false, evalLoss: 0.04, lossCp: 4, epLoss: 0.004, epBefore: 0.55, epPlayed: 0.546 }).quality,
    "excellent",
    "tiny but non-zero EP loss should be excellent, not always best"
  );
  assert.strictEqual(
    classifyEngineMove({ isBook: false, isBrilliant: false, isGreat: false, playedMove: "b1c3", bestMove: "b1c3", isMissed: false, evalLoss: 0.00, lossCp: 0, epLoss: 0.00, epBefore: 0.55, epPlayed: 0.55 }).quality,
    "best",
    "only actual best move should be classified as best"
  );
  assert.strictEqual(
    classifyEngineMove({ isBook: false, isBrilliant: false, isGreat: false, playedMove: "a2a3", bestMove: "b1c3", isMissed: false, evalLoss: 1.20, epLoss: 0.06, epBefore: 0.55, epPlayed: 0.49 }).quality,
    "inaccuracy",
    "expected-points thresholds should classify 0.05-0.10 EP loss as inaccuracy"
  );
  assert.strictEqual(
    classifyEngineMove({ isBook: false, isBrilliant: false, isGreat: false, playedMove: "a2a3", bestMove: "b1c3", isMissed: false, evalLoss: 3.20, epLoss: 0.21, epBefore: 0.55, epPlayed: 0.34 }).quality,
    "blunder",
    "expected-points thresholds should classify >0.20 EP loss as blunder"
  );
  assert.strictEqual(
    classifyEngineMove({ isBook: false, isBrilliant: false, isGreat: false, playedMove: "a2a3", bestMove: "b1c3", isMissed: false, evalLoss: 0.81 }).quality,
    "inaccuracy",
    "eval-loss thresholds should keep <=1.00 pawns as inaccuracy"
  );
  assert.strictEqual(
    classifyEngineMove({ isBook: false, isBrilliant: false, isGreat: false, playedMove: "e2e4", bestMove: "g1f3", isMissed: false, evalLoss: 0.72, moveNumber: 1, san: "e4", isNormalOpening: true }).quality,
    "good",
    "normal opening moves like 1.e4 should never be below good"
  );
  assert.strictEqual(isNormalOpeningMove({ uci: "e2e4" }, 1, "e4"), true, "e4 should count as a normal opening move");
  assert.strictEqual(isNormalOpeningMove({ uci: "h2h4" }, 1, "h4"), false, "non-listed flank pawn moves should not be auto-protected");
  assert.deepStrictEqual(parsePgnMoveTokens("1. e4 e5 2. Nf3 Nc6 1-0"), ["e4", "e5", "Nf3", "Nc6"], "PGN parser should extract SAN move tokens");
  assert.strictEqual(typeof reviewFromPGN, "function", "reviewFromPGN should be available for Chess.com comparison imports");

  const diff = formatBestMoveDiff({ epLoss: 0.273, evalLoss: 0.27, loss: 27 });
  assert.strictEqual(diff, "-0.273 EP / 0.27 pedoni");

  const sparkline = buildEvalSparkline([0, 120, -40], 2);
  assert.match(sparkline, /data-review-index="1"/, "graph should expose clickable move points");
  assert.match(sparkline, /eval-sparkline-hit/, "graph should render hit targets for point clicks");

  assert.strictEqual(STOCKFISH_WORKER_SOURCES[0].url, "stockfish-wasm-worker.js", "WASM worker should be the first engine source");

  assert.strictEqual(typeof analyzePosition, "function", "analyzePosition should be globally available for Stockfish review");
  assert.strictEqual(typeof analyzeGame, "function", "analyzeGame should be globally available for full-game review");
  assert.deepStrictEqual(parseBestMove("bestmove e7e8q"), { bestMove: "e7e8q", terminal: false }, "bestmove should be parsed only from the final bestmove line");
  assert.deepStrictEqual(parseBestMove("bestmove (none)"), { bestMove: null, terminal: true }, "bestmove none should be treated as terminal");
  assert.deepStrictEqual(uciToChessMove("e2e4"), { from: "e2", to: "e4" }, "normal UCI moves should convert to chess.js shape");
  assert.deepStrictEqual(uciToChessMove("e7e8q"), { from: "e7", to: "e8", promotion: "q" }, "promotion UCI moves should include promotion");
  assert.strictEqual(miniDrillMoveFromSquares({ row: 6, col: 4 }, { row: 4, col: 4 }), "e2e4", "mini drill board should produce UCI moves");
  assert.strictEqual(miniDrillMoveFromSquares({ row: 1, col: 4 }, { row: 0, col: 4 }, "e7e8q"), "e7e8q", "mini drill board should preserve promotion suffixes");
  const miniHtml = buildMiniBoardHtml(fenToBoard("8/8/8/8/8/8/4P3/8 w - - 0 1"), {
    selected: { row: 6, col: 4 },
    attempt: { to: { row: 4, col: 4 } },
    correctMove: "e2e4"
  });
  assert.match(miniHtml, /<button type="button"/, "mini drill board should render clickable squares");
  assert.match(miniHtml, /data-mini-row="6" data-mini-col="4"/, "mini drill board should expose source square data");
  assert.match(miniHtml, /selected/, "mini drill board should highlight selected squares");
  assert.match(miniHtml, /correct/, "mini drill board should highlight correct move squares");
  const stableReview = createStableReviewResult({ status: "error", error: "x" });
  assert.deepStrictEqual(stableReview.engineAnalysis, [], "stable review results should always expose engineAnalysis");
  assert.deepStrictEqual(stableReview.moveClassifications, {}, "stable review results should always expose moveClassifications");
  assert.deepStrictEqual(stableReview.drills, [], "stable review results should always expose drills");
  const failedMove = { side: "Bianco", move: "e4" };
  applyEngineAnalysisToMove(failedMove, { ok: false, error: "Stockfish failed on this move" });
  assert.strictEqual(failedMove.quality, "unknown", "failed engine moves should become unknown, not crash the review");
  assert.strictEqual(failedMove.engineAnalysis.classification, "unknown", "failed engine moves should carry an unknown classification");
  currentGame = {
    id: "test-game",
    moves: [undefined, { side: "Bianco", quality: "good", engineAnalysis: { ok: true }, timeSeconds: 8, evalAfter: 10 }],
    mistakes: [],
    reviewStatus: "completed",
    reviewResult: createStableReviewResult({ status: "completed" }),
    botLevel: 1,
    result: "partial",
    endReason: null
  };
  const safeAnalysis = buildGameAnalysis("partial");
  assert.strictEqual(safeAnalysis.engineBased, true, "buildGameAnalysis should ignore undefined move slots and use completed engine data");
  assert.strictEqual(typeof safeAnalysis.accuracy, "number", "completed review should compute a numeric accuracy from real classifications");
  const simpleGoodAccuracy = computeAccuracyDetails(Array.from({ length: 10 }, () => ({ quality: "good", accuracyScore: 91, moveComplexity: 0.30 })), "w", "partial", []).final;
  assert.ok(simpleGoodAccuracy < 88, "simple games made only of good non-best moves should not inflate into 90%+ accuracy");
  const simpleExcellentAccuracy = computeAccuracyDetails(Array.from({ length: 10 }, () => ({ quality: "excellent", accuracyScore: 97, moveComplexity: 0.32 })), "w", "partial", []).final;
  assert.ok(simpleExcellentAccuracy <= 89, "excellent but non-best simple games should be capped below elite accuracy");
  assert.strictEqual(calibrateBotAccuracy(90, {}, 10), 90, "bot accuracy should report the real review score, not clamp to calibration targets");
  assert.ok(
    estimateGameRating(96, 1600, "win", { counts: { best: 12, great: 2, brilliant: 0, excellent: 8, good: 6 }, playerMoveCount: 28 }) <= 1950,
    "clean 96% wins against 1600 should not inflate into master-level game ratings"
  );
  assert.ok(
    estimateGameRating(92, 400, "win", { counts: { best: 8, excellent: 8, good: 12 }, playerMoveCount: 28 }) <= 1150,
    "wins against very low Elo bots should stay calibrated below intermediate ratings"
  );
  assert.ok(
    estimateGameRating(99, 1600, "win", { counts: { blunder: 1 }, playerMoveCount: 28 }) <= 1800,
    "one blunder should cap game rating at 1800"
  );
  assert.ok(
    estimateGameRating(96, 1600, "win", { counts: { mistake: 2 }, playerMoveCount: 28 }) <= 1700,
    "two mistakes should cap game rating at 1700"
  );
  const italianBreakdown = buildAccuracyBreakdown(
    { book: 1, best: 2, great: 1, brilliant: 1, excellent: 2, good: 3, inaccuracy: 1, inexact: 1, mistake: 1, blunder: 1, missed: 0, unknown: 0 },
    14,
    { base: 86, rawWeighted: 88, averageComplexity: 0.42, exactTopRatio: 0.28, simplePositionPenalty: 0, nonBestPenalty: 1.2, goodOnlyPenalty: 0.8 }
  );
  assert.match(italianBreakdown, /Migliore/, "accuracy breakdown should use Italian review classification labels");
  assert.match(italianBreakdown, /Grande/, "accuracy breakdown should keep the Grande classification");
  assert.match(italianBreakdown, /Brillante/, "accuracy breakdown should keep the Brillante classification");
  assert.match(italianBreakdown, /Imprecisione/, "accuracy breakdown should keep the Imprecisione classification");
  assert.match(italianBreakdown, /Blunder/, "accuracy breakdown should keep the Blunder classification");
  assert.doesNotMatch(italianBreakdown, /\\bbest\\b|\\bgreat\\b|\\binaccuracy\\b|\\bmistake\\b/i, "accuracy breakdown should not leak English classification names");
  assert.strictEqual(typeof getReportClassificationRows, "function", "post-game report should expose reusable Chess.com-style classification rows");
  assert.deepStrictEqual(
    getReportClassificationRows({ best: 2, great: 1, brilliant: 1, excellent: 2, good: 3, inaccuracy: 1, inexact: 1, mistake: 1, blunder: 1 }).map((row) => row.label),
    ["Migliore", "Grande", "Brillante", "Ottima", "Buona", "Imprecisione", "Errore", "Blunder"],
    "post-game report rows should preserve the requested classifications"
  );
  const parsedInfo = parseEngineInfo("info depth 12 seldepth 18 multipv 2 score cp -34 nodes 123 pv e2e4 e7e5");
  assert.strictEqual(parsedInfo.depth, 12);
  assert.strictEqual(parsedInfo.multiPv, 2);
  assert.deepStrictEqual(parsedInfo.evaluation, { type: "cp", value: -34 });
  assert.strictEqual(evaluationToCp({ type: "mate", value: -3 }), -10000);
`;

vm.runInNewContext(`${source}\n${assertions}`, { ...sandbox, assert }, { filename: "app.js" });
console.log("chess spec tests passed");
