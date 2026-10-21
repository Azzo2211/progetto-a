/*
 * Taratura dei bot degli scacchi.
 *
 * Il metro e' Stockfish 17.1 con forza limitata (UCI_LimitStrength + UCI_Elo): e' la scala Elo
 * ufficiale di Stockfish (da 1320 a 3190, tarata dagli sviluppatori sulla lista CCRL Blitz).
 * Stockfish sceglie la mossa alla profondita' 1 + livello interno, quindi basta cercare fino a li':
 * il risultato non dipende dalla velocita' del computer.
 *
 *   node tools/calibrate.js sf:8,12 40           # livelli 8 e 12 contro Stockfish all'Elo del livello
 *   node tools/calibrate.js sf:12@1800 40        # livello 12 contro Stockfish a 1800
 *   node tools/calibrate.js sf:s1500@1600 40     # forza interna 1500 (configForStrength) contro 1600
 *   node tools/calibrate.js match:3-5 60         # livello 3 contro livello 5 (sotto 1320)
 *   node tools/calibrate.js match:s300-s600 60   # due forze interne
 *
 * Opzioni: [partite=20] [seme=1]. Variabile SF_FULL: percorso di un build a file unico di
 * Stockfish 17.1 completo (consigliato come metro: "npm pack stockfish@17.1.0", poi unire le parti
 * src/stockfish-17.1-single-*-part-N.wasm in un solo .wasm accanto al suo .js). Senza SF_FULL il
 * metro usa la versione lite del sito, un po' piu' debole a parita' di Elo.
 * Ogni apertura dell'elenco si gioca due volte a colori invertiti.
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

const OPENINGS = [
  "e4 e5 Nf3 Nc6 Bb5 a6", "e4 e5 Nf3 Nc6 Bc4 Bc5", "e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6", "e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6",
  "e4 e6 d4 d5 Nc3 Nf6", "e4 c6 d4 d5 e5 Bf5", "d4 d5 c4 e6 Nc3 Nf6", "d4 d5 c4 c6 Nf3 Nf6", "d4 Nf6 c4 g6 Nc3 Bg7 e4 d6",
  "d4 Nf6 c4 e6 Nc3 Bb4", "c4 e5 Nc3 Nf6 g3 d5", "Nf3 d5 g3 Nf6 Bg2 e6", "e4 d5 exd5 Qxd5 Nc3 Qa5", "e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4",
  "d4 d5 Bf4 Nf6 e3 c5", "e4 g6 d4 Bg7 Nc3 d6", "e4 e5 Nc3 Nf6 f4 d5", "d4 f5 g3 Nf6 Bg2 g6", "e4 c5 c3 Nf6 e5 Nd5", "d4 Nf6 Nf3 e6 c4 b6"
];

function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Livello interno di Stockfish per un UCI_Elo (stessa formula del sorgente 17.1).
function sfSkill(elo) {
  const e = (elo - 1320) / (3190 - 1320);
  return Math.min(19, Math.max(0, ((37.2473 * e - 40.8525) * e + 22.2943) * e - 0.311438));
}

async function makeEngine(js) {
  const raw = await createRawEngine(js);
  const engine = new UciEngine(raw, "Stockfish");
  const init = await engine.init({ hashMb: 16 });
  if (!init.ok) throw new Error(init.error);
  engine.raw = raw;
  return engine;
}

// "12" -> livello 12; "s1500" -> forza interna 1500
function player(token) {
  if (token[0] === "s") {
    const s = Number(token.slice(1));
    return { name: token, config: Bot.configForStrength(s), elo: null };
  }
  const config = Bot.getLevel(Number(token));
  return { name: `livello ${config.level}`, config, elo: config.elo };
}

function opening(index) {
  const chess = new Chess();
  OPENINGS[index % OPENINGS.length].split(" ").forEach((san) => chess.move(san));
  return chess;
}

// side: funzione (chess, ply) -> uci per ciascun colore. Restituisce 1 / 0.5 / 0 per il Bianco.
async function playOut(chess, white, black) {
  let ply = chess.history().length;
  while (!chess.isGameOver() && ply < 400) {
    const uci = await (chess.turn() === "w" ? white : black)(chess, ply);
    if (!uci || !A.applyUci(chess, uci)) throw new Error(`mossa non valida ${uci}`);
    ply += 1;
  }
  if (chess.isCheckmate()) return chess.turn() === "w" ? 0 : 1;
  return 0.5;
}

function botMover(engine, config, rng) {
  return async (chess, ply) => {
    const choice = await Bot.chooseMove(engine, chess.fen(), config, { rng, ply });
    if (!choice.ok) throw new Error(choice.error);
    return choice.uci;
  };
}

function performance(score, games, ref) {
  const s = Math.min(1 - 0.5 / games, Math.max(0.5 / games, score / games));
  return Math.round(ref - 400 * Math.log10(1 / s - 1));
}

(async () => {
  const mode = process.argv[2] || "sf:8";
  const games = Number(process.argv[3] || 20);
  const seed = Number(process.argv[4] || 1);
  const rng = mulberry32(seed);
  const botEngine = await makeEngine();
  if (mode.startsWith("sf:")) {
    const ref = await makeEngine(process.env.SF_FULL || undefined);
    for (const item of mode.slice(3).split(",")) {
      const [token, refTok] = item.split("@");
      const p = player(token);
      const refElo = Math.min(3190, Math.max(1320, Number(refTok) || p.elo || 1320));
      const depth = Math.floor(sfSkill(refElo)) + 2;
      let score = 0;
      for (let g = 0; g < games; g += 1) {
        const botWhite = g % 2 === 0;
        await botEngine.newGame();
        ref.raw.post("setoption name UCI_LimitStrength value true");
        ref.raw.post(`setoption name UCI_Elo value ${refElo}`);
        await ref.newGame();
        const sf = async (chess) => (await ref.analyse(chess.fen(), { depth, multipv: 1 })).bestmove;
        const bot = botMover(botEngine, p.config, rng);
        const white = await playOut(opening(Math.floor(g / 2) + seed * 7), botWhite ? bot : sf, botWhite ? sf : bot);
        score += botWhite ? white : 1 - white;
      }
      console.log(JSON.stringify({ bot: p.name, stockfishElo: refElo, games, score, performance: performance(score, games, refElo) }));
    }
  } else if (mode.startsWith("match:")) {
    const [ta, tb] = mode.slice(6).split("-");
    const pa = player(ta);
    const pb = player(tb);
    const other = await makeEngine();
    let score = 0;
    for (let g = 0; g < games; g += 1) {
      const aWhite = g % 2 === 0;
      await botEngine.newGame();
      await other.newGame();
      const a = botMover(botEngine, pa.config, rng);
      const b = botMover(other, pb.config, rng);
      const white = await playOut(opening(Math.floor(g / 2) + seed * 7), aWhite ? a : b, aWhite ? b : a);
      score += aWhite ? white : 1 - white;
    }
    console.log(JSON.stringify({ match: `${pa.name} contro ${pb.name}`, games, scoreA: score, eloDiff: performance(score, games, 0) }));
  }
  process.exit(0);
})().catch((error) => { console.error(error); process.exit(1); });
