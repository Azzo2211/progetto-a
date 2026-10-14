/*
 * Test di rating/gradi, lezioni, coach e scacchiera (parti senza browser).
 *
 *   node tests/chess-trainer.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const root = path.join(__dirname, "..");
require(path.join(root, "vendor", "chess.js"));
require(path.join(root, "chess", "analysis-core.js"));
const R = require(path.join(root, "chess", "rating.js"));
const L = require(path.join(root, "chess", "lessons.js"));
const Coach = require(path.join(root, "chess", "coach.js"));
const Board = require(path.join(root, "chess", "board-view.js"));
const Skills = require(path.join(root, "chess", "skills.js"));
const puzzleData = require(path.join(root, "chess", "puzzles.json"));

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

function play(chess, uci) {
  try {
    return chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || "q" });
  } catch (error) {
    return null;
  }
}

/* ------------------------------------------------------------- rating */

test("Glicko: vincere contro un bot piu' forte fa salire di piu'", () => {
  const p = R.createProfile();
  const weak = R.glickoUpdate(p.game, 400, 60, 1, 60).change;
  const strong = R.glickoUpdate(p.game, 1400, 60, 1, 60).change;
  assert.ok(strong > weak && weak >= 0, `${weak} ${strong}`);
  const loss = R.glickoUpdate(p.game, 400, 60, 0, 60).change;
  assert.ok(loss < 0);
});

test("Rating partite converge verso la forza reale", () => {
  let p = R.createProfile();
  // un giocatore che vince sempre contro 1000 e perde sempre contro 1450
  for (let i = 0; i < 12; i += 1) {
    p = R.recordGame(p, { botElo: 1000, result: "win", gameId: `w${i}` }).profile;
    p = R.recordGame(p, { botElo: 1450, result: "loss", gameId: `l${i}` }).profile;
  }
  assert.ok(p.game.rating > 1050 && p.game.rating < 1400, `rating ${p.game.rating}`);
  assert.ok(p.game.rd < 120, `rd ${p.game.rd}`);
  assert.strictEqual(R.bestWinElo(p), 1000);
});

test("Esercizi: conta solo il primo tentativo", () => {
  let p = R.createProfile();
  const first = R.recordPuzzle(p, { id: "abc", rating: 900, solved: true });
  p = first.profile;
  assert.ok(first.counted);
  const again = R.recordPuzzle(p, { id: "abc", rating: 900, solved: false });
  assert.ok(!again.counted);
  assert.strictEqual(again.profile.puzzle.count, 1);
});

test("Grado: senza dati sei E, con tutti i requisiti D diventi D", () => {
  let p = R.createProfile();
  const none = () => ({ done: 0, total: 4 });
  const all = () => ({ done: 4, total: 4 });
  assert.strictEqual(R.certifiedGrade(p, { lessonsDone: all }).key, "E");
  for (let i = 0; i < 6; i += 1) {
    p = R.recordGame(p, { botElo: 850, result: "win", gameId: `g${i}` }).profile;
    p = R.attachAccuracy(p, `g${i}`, 72);
  }
  for (let i = 0; i < 20; i += 1) p = R.recordPuzzle(p, { id: `p${i}`, rating: 1000, solved: true }).profile;
  assert.strictEqual(R.certifiedGrade(p, { lessonsDone: none }).key, "E", "le lezioni sono obbligatorie");
  assert.strictEqual(R.certifiedGrade(p, { lessonsDone: all }).key, "D");
  const reqs = R.requirementsFor("C", p, { lessonsDone: all });
  assert.ok(reqs.some((item) => !item.met), "per C mancano requisiti");
});

test("Punteggio del quadro coerente con la lettera", () => {
  const rankFromScore = (score) => (score >= 90 ? "S" : score >= 80 ? "A" : score >= 70 ? "B" : score >= 60 ? "C" : score >= 45 ? "D" : "E");
  R.GRADES.forEach((grade) => {
    [grade.min, grade.min + 150, 5000, 0].forEach((elo) => {
      assert.strictEqual(rankFromScore(R.moduleScore(grade, elo)), grade.key, `${grade.key} ${elo}`);
    });
  });
});

test("Elo stimato combina partite ed esercizi", () => {
  let p = R.createProfile();
  assert.strictEqual(R.estimateElo(p).elo, null);
  for (let i = 0; i < 8; i += 1) p = R.recordGame(p, { botElo: 1150, result: i % 2 ? "win" : "loss", gameId: `x${i}` }).profile;
  const est = R.estimateElo(p);
  assert.ok(est.elo > 900 && est.elo < 1400, `elo ${est.elo}`);
});

/* ------------------------------------------------------------- lezioni */

test("Ogni lezione ha teoria, punti chiave e mosse legali", () => {
  const ids = new Set();
  L.LESSONS.forEach((lesson) => {
    assert.ok(!ids.has(lesson.id), `id doppio ${lesson.id}`);
    ids.add(lesson.id);
    assert.ok(lesson.theory.length >= 2, lesson.id);
    assert.ok(lesson.keyPoints.length >= 2, lesson.id);
    assert.ok(L.GRADE_UNITS[lesson.grade], lesson.id);
    if (lesson.example) {
      const chess = new Chess(lesson.example.fen);
      lesson.example.steps.forEach((step) => {
        if (step.move) assert.ok(play(chess, step.move), `${lesson.id}: ${step.move}`);
      });
    }
    (lesson.exercises || []).forEach((ex) => {
      const chess = new Chess(ex.fen);
      ex.solution.forEach((uci) => assert.ok(play(chess, uci), `${lesson.id}: ${uci}`));
      (ex.accept || []).forEach((uci) => assert.ok(play(new Chess(ex.fen), uci), `${lesson.id}: accettata ${uci}`));
    });
  });
});

test("Posizioni delle lezioni legali (chi non muove non e' sotto scacco)", () => {
  const legal = (fen) => {
    const parts = fen.split(" ");
    parts[1] = parts[1] === "w" ? "b" : "w";
    parts[3] = "-";
    let flipped;
    try {
      flipped = new Chess(parts.join(" "));
    } catch (error) {
      return true;
    }
    return !flipped.isCheck();
  };
  L.LESSONS.forEach((lesson) => {
    if (lesson.example) assert.ok(legal(lesson.example.fen), `${lesson.id}: esempio`);
    (lesson.exercises || []).forEach((ex, i) => assert.ok(legal(ex.fen), `${lesson.id}: esercizio ${i + 1}`));
  });
});

test("Ogni lezione ha abbastanza esercizi nel database", () => {
  const puzzles = puzzleData.puzzles.map(L.parsePuzzleLine);
  L.LESSONS.filter((lesson) => lesson.practice).forEach((lesson) => {
    const pool = L.filterPuzzles(puzzles, lesson.practice);
    assert.ok(pool.length >= lesson.practice.count * 2, `${lesson.id}: solo ${pool.length}`);
  });
  Object.values(L.PATTERN_LESSONS).forEach((id) => assert.ok(L.byId(id), id));
});

test("Puzzle Lichess: mosse legali e matti veri", () => {
  puzzleData.puzzles.slice(0, 400).forEach((line) => {
    const pz = L.parsePuzzleLine(line);
    const chess = new Chess(pz.fen);
    pz.moves.forEach((uci) => assert.ok(play(chess, uci), `${pz.id} ${uci}`));
    if (pz.themes.includes("mate")) assert.ok(chess.isCheckmate(), pz.id);
  });
});

/* --------------------------------------------------------------- coach */

test("Coach: avvisa se lasci un pezzo in presa", () => {
  const fen = "rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2";
  const verdict = Coach.reviewPlayerMove(fen, "f1a6", "w");
  assert.ok(verdict && verdict.severity === "blunder", JSON.stringify(verdict));
  assert.strictEqual(verdict.square, "a6");
  assert.strictEqual(Coach.reviewPlayerMove(fen, "g1f3", "w"), null);
});

test("Coach: matto in una mancato e matto concesso", () => {
  const missed = Coach.reviewPlayerMove("6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", "d1d2", "w");
  assert.strictEqual(missed.severity, "missed");
  const allowed = Coach.reviewPlayerMove("3r2k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1", "a1a7", "w");
  assert.strictEqual(allowed.severity, "blunder");
  assert.ok(/matto/.test(allowed.text));
});

test("Coach: descrive la minaccia del bot", () => {
  // il cavallo nero in e5 attacca la donna bianca in d3 (non difesa abbastanza)
  const threat = Coach.describeThreats("4k3/8/8/4n3/8/3Q4/8/4K3 w - - 0 1", "w");
  assert.ok(threat && threat.level === "danger", JSON.stringify(threat));
});

/* ---------------------------------------------------------- scacchiera */

test("Scacchiera: conversione posizioni", () => {
  const pos = Board.fenToPosition("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1");
  assert.strictEqual(pos.e4, "P");
  assert.strictEqual(pos.e8, "k");
  assert.strictEqual(Object.keys(pos).length, 32);
  const fromArray = Board.normalizePosition([["r", null, null, null, "k", null, null, null], [], [], [], [], [], [], [null, null, null, null, "K", null, null, "R"]]);
  assert.deepStrictEqual(fromArray, { a8: "r", e8: "k", e1: "K", h1: "R" });
  assert.deepStrictEqual(Board.squareToXY("c5"), { file: 2, rank: 4 });
  assert.strictEqual(Board.xyToSquare(7, 0), "h1");
});

/* --------------------------------------------------- profilo categorie */

function fakeMove(i, side, quality, extra = {}) {
  return { side, moveNumber: Math.floor(i / 2) + 1, san: "e4", quality, engineAnalysis: { ok: true }, winBefore: 50, winBest: 55, winSecond: 52, categories: [], timeSeconds: 10, ...extra };
}

test("Profilo: ogni errore ha la sua categoria", () => {
  const moves = [
    fakeMove(0, "Bianco", "blunder", { categories: ["hangingPiece"] }),
    fakeMove(1, "Nero", "best"),
    fakeMove(2, "Bianco", "mistake", { categories: ["missedThreat"] }),
    fakeMove(3, "Nero", "blunder"),
    fakeMove(4, "Bianco", "great", { winBest: 70, winSecond: 40 }),
    fakeMove(5, "Nero", "good"),
    fakeMove(6, "Bianco", "mistake", { categories: ["concentration"], timeSeconds: 2 })
  ];
  const events = Skills.gameEvents(moves, { color: "w", result: "loss", reason: "checkmate" });
  const sum = (key) => events.filter((e) => e.category === key).reduce((t, e) => t + e.points, 0);
  const moveOne = events.filter((e) => e.moveNumber === 1 && e.category === "concentration");
  assert.strictEqual(moveOne.length, 1, "un blunder con pezzo in presa conta una volta sola");
  assert.ok(moveOne[0].points <= -5, "pezzo in presa pesa molto");
  assert.ok(sum("concentration") < -5);
  assert.ok(events.some((e) => e.category === "threatVision" && e.points < 0), "minaccia non vista");
  assert.ok(events.some((e) => e.category === "threatVision" && e.points > 0), "errore del bot punito");
  assert.ok(events.some((e) => e.category === "calculation" && e.points > 0), "mossa grande");
  assert.ok(events.some((e) => e.category === "impulseControl" && e.points < 0), "mossa impulsiva");
  assert.ok(events.some((e) => e.category === "kingSafety" && e.label.includes("matto")), "matto subito");
});

test("Profilo: il totale e' la media e i punti dipendono dall'avversario", () => {
  const base = Skills.createSkills();
  assert.strictEqual(Skills.total(base), Skills.START_VALUE);
  const good = [{ category: "calculation", points: 6, label: "x", moveNumber: 1 }];
  const weakBot = Skills.applyGame(base, good, { botElo: 250 }).changes.calculation;
  const strongBot = Skills.applyGame(base, good, { botElo: 1400 }).changes.calculation;
  assert.ok(strongBot > weakBot && weakBot > 0, `${weakBot} ${strongBot}`);
  const bad = [{ category: "concentration", points: -6, label: "x", moveNumber: 1 }];
  const loseWeak = Skills.applyGame(base, bad, { botElo: 250 }).changes.concentration;
  const loseStrong = Skills.applyGame(base, bad, { botElo: 1400 }).changes.concentration;
  assert.ok(loseWeak < loseStrong && loseStrong < 0, `${loseWeak} ${loseStrong}`);
  const many = Array(20).fill({ category: "strategy", points: 5, label: "x", moveNumber: 1 });
  assert.ok(Skills.applyGame(base, many, { botElo: 3000 }).changes.strategy <= 12, "massimo 12 punti a partita");
  const after = Skills.applyGame(base, good, { botElo: 1400 }).skills;
  const avg = Math.round(Skills.CATEGORIES.reduce((t, c) => t + after[c.key], 0) / 6);
  assert.strictEqual(Skills.total(after), avg);
});

test("Profilo: una sconfitta non alza il profilo contro bot forti", () => {
  const base = Skills.createSkills();
  const events = [
    { category: "kingSafety", points: 3, label: "Arrocco", moveNumber: null },
    { category: "kingSafety", points: -1, label: "Sconfitta", moveNumber: null },
    { category: "calculation", points: 6, label: "Brillante", moveNumber: 5 },
    { category: "calculation", points: 4, label: "Grande", moveNumber: 9 }
  ];
  const lost = Skills.applyGame(base, events, { botElo: 2000, result: "loss" }).changes;
  assert.ok(lost.kingSafety <= 2 && lost.calculation <= 2, JSON.stringify(lost));
  const missed = Skills.gameEvents([fakeMove(0, "Bianco", "missed", { categories: ["noPlan"] })], { color: "w" });
  assert.deepStrictEqual(missed.map((e) => e.category), ["threatVision"], "mossa mancata: solo Visione minacce");
});

test("Profilo: i vecchi valori casuali vengono azzerati", () => {
  const old = { games: 3, concentration: 91, calculation: 86 };
  const fresh = Skills.ensureSkills(old);
  assert.strictEqual(fresh.concentration, Skills.START_VALUE);
  assert.strictEqual(fresh.version, Skills.VERSION);
});

test("Profilo: fasce coerenti con i gradi", () => {
  [[600, 45], [1000, 60], [1400, 70], [1800, 80], [2200, 90]].forEach(([elo, score]) => {
    assert.strictEqual(Math.round(Skills.scoreForElo(elo)), score);
    assert.strictEqual(Math.round(Skills.eloForScore(score)), elo);
  });
});

test("Pezzi: set Elite predefinito e immagini presenti per ogni set", () => {
  const fs = require("fs");
  assert.strictEqual(Board.DEFAULT_SET, "elite");
  assert.strictEqual(Board.pieceSrc("elite", "K"), "assets/pieces/elite/wK.webp");
  assert.strictEqual(Board.pieceSrc("elite", "n"), "assets/pieces/elite/bN.webp");
  assert.strictEqual(Board.pieceSrc("elite", "bQ"), "assets/pieces/elite/bQ.webp");
  assert.strictEqual(Board.pieceSrc("inesistente", "p"), "assets/pieces/elite/bP.webp");
  assert.strictEqual(Board.pieceSrc("staunty", "R"), "assets/pieces/staunty/wR.svg");
  Object.keys(Board.PIECE_SETS).forEach((set) => {
    ["w", "b"].forEach((c) => "KQRBNP".split("").forEach((p) => {
      const file = path.join(root, Board.pieceSrc(set, `${c}${p}`));
      assert.ok(fs.existsSync(file), `manca ${file}`);
    }));
  });
});

console.log(`Tutti i test superati (${passed}).`);
