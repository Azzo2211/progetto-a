/*
 * Calibrazione dei bot: fa giocare i bot tra loro e misura la precisione con la
 * stessa formula della revisione (metodo Lichess) su un'analisi di riferimento.
 *
 *   node tools/calibrate.js self:1,4,8,12 10      # precisione media per livello (10 partite)
 *   node tools/calibrate.js match:10-12 10         # scontro diretto tra due livelli
 *
 * Opzioni: [partite] [profondita' di riferimento=12] [seme casuale=1]
 */
const path = require("path");
globalThis.window = globalThis;
const root = path.join(__dirname, "..");
require(path.join(root, "vendor", "chess.js"));
require(path.join(root, "chess", "opening-book.js"));
const A = require(path.join(root, "chess", "analysis-core.js"));
const Bot = require(path.join(root, "chess", "bot.js"));
const { UciEngine } = require(path.join(root, "chess", "engine.js"));
const { createRawEngine } = require("./sf-node.js");

async function makeEngine() {
  const engine = new UciEngine(await createRawEngine(), "Stockfish");
  const init = await engine.init({ hashMb: 16 });
  if (!init.ok) throw new Error(init.error);
  return engine;
}

function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function playGame(selector, reference, levelWhite, levelBlack, rng, refDepth) {
  const chess = new Chess();
  const whiteWins = [];
  const losses = { w: [], b: [] };
  const cpCache = new Map();
  let ply = 0;
  let decisive = 0;
  let result = "1/2-1/2";
  async function whiteWin(fen) {
    const terminal = A.terminalInfo(fen);
    const sign = A.fenSide(fen) === "w" ? 1 : -1;
    if (terminal) {
      cpCache.set(fen, sign * A.scoreToCp(terminal.score));
      const w = A.scoreWinPercent(terminal.score);
      return sign === 1 ? w : 100 - w;
    }
    const analysed = await reference.analyse(fen, { depth: refDepth, multipv: 1 });
    const score = analysed.lines[0].score;
    cpCache.set(fen, sign * A.scoreToCp(score));
    const w = A.scoreWinPercent(score);
    return sign === 1 ? w : 100 - w;
  }
  whiteWins.push(await whiteWin(chess.fen()));
  while (!chess.isGameOver() && ply < 240) {
    const side = chess.turn();
    const choice = await Bot.chooseMove(selector, chess.fen(), side === "w" ? levelWhite : levelBlack, { rng, ply });
    if (!choice.ok || !A.applyUci(chess, choice.uci)) throw new Error(`mossa non valida ${choice.uci}`);
    ply += 1;
    const w = await whiteWin(chess.fen());
    const before = whiteWins[whiteWins.length - 1];
    losses[side].push(side === "w" ? Math.max(0, before - w) : Math.max(0, w - before));
    whiteWins.push(w);
    const cp = cpCache.get(chess.fen());
    decisive = Math.abs(cp) >= 1500 ? decisive + 1 : 0;
    if (decisive >= 10) { result = cp > 0 ? "1-0" : "0-1"; break; }
  }
  if (chess.isCheckmate()) result = chess.turn() === "w" ? "0-1" : "1-0";
  const accuracy = A.gameAccuracy(whiteWins, "w");
  return { result, plies: ply, accW: accuracy.w, accB: accuracy.b, losses };
}

(async () => {
  const mode = process.argv[2] || "self:8";
  const games = Number(process.argv[3] || 6);
  const refDepth = Number(process.argv[4] || 12);
  const rng = mulberry32(Number(process.argv[5] || 1));
  const selector = await makeEngine();
  const reference = await makeEngine();
  if (mode.startsWith("self:")) {
    for (const level of mode.slice(5).split(",").map(Number)) {
      const accs = [];
      let blunders = 0;
      let moves = 0;
      let plies = 0;
      for (let g = 0; g < games; g += 1) {
        const game = await playGame(selector, reference, level, level, rng, refDepth);
        accs.push(game.accW, game.accB);
        ["w", "b"].forEach((side) => game.losses[side].forEach((loss) => { moves += 1; if (loss >= 20) blunders += 1; }));
        plies += game.plies;
      }
      const mean = accs.reduce((a, b) => a + b, 0) / accs.length;
      const cfg = Bot.getLevel(level);
      console.log(JSON.stringify({ level, elo: cfg.elo, target: cfg.targetAccuracy, accuracy: +mean.toFixed(1), blundersPer100: +(100 * blunders / moves).toFixed(1), avgPlies: Math.round(plies / games) }));
    }
  } else if (mode.startsWith("match:")) {
    const [a, b] = mode.slice(6).split("-").map(Number);
    let score = 0;
    const results = [];
    for (let g = 0; g < games; g += 1) {
      const aWhite = g % 2 === 0;
      const game = await playGame(selector, reference, aWhite ? a : b, aWhite ? b : a, rng, refDepth);
      const points = game.result === "1-0" ? (aWhite ? 1 : 0) : game.result === "0-1" ? (aWhite ? 0 : 1) : 0.5;
      score += points;
      results.push(game.result);
    }
    console.log(JSON.stringify({ match: `livello ${a} vs livello ${b}`, punteggioPrimo: score, partite: games, risultati: results.join(" ") }));
  }
  process.exit(0);
})().catch((error) => { console.error(error); process.exit(1); });
