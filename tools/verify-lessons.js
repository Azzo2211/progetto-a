// Verifica le lezioni del coach con chess.js e Stockfish 17.1 (stesso motore del sito).
//
//   node tools/verify-lessons.js
//
// Controlla che ogni mossa di esempi ed esercizi sia legale e che le soluzioni
// (e le mosse accettate) siano davvero tra le migliori secondo Stockfish.
const path = require("path");

globalThis.window = globalThis;
const root = path.join(__dirname, "..");
require(path.join(root, "vendor", "chess.js"));
const A = require(path.join(root, "chess", "analysis-core.js"));
const { UciEngine } = require(path.join(root, "chess", "engine.js"));
const { createRawEngine } = require(path.join(__dirname, "sf-node.js"));
const Lessons = require(path.join(root, "chess", "lessons.js"));

const DEPTH = Number(process.env.DEPTH || 22);
const TOLERANCE = 6; // punti di probabilita' di vittoria persi rispetto alla migliore

function play(chess, uci) {
  try {
    return chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] || "q" });
  } catch (error) {
    return null;
  }
}

function win(score) {
  return A.scoreWinPercent(score);
}

async function main() {
  const engine = new UciEngine(await createRawEngine());
  await engine.init();
  let problems = 0;
  const report = (msg) => {
    problems += 1;
    console.log("  PROBLEMA:", msg);
  };

  for (const lesson of Lessons.LESSONS) {
    console.log(`\n[${lesson.grade}] ${lesson.title}`);
    if (lesson.example) {
      const chess = new Chess(lesson.example.fen);
      for (const [i, step] of lesson.example.steps.entries()) {
        if (!step.move) continue;
        if (!play(chess, step.move)) report(`esempio: mossa ${i} ${step.move} illegale`);
      }
      const res = await engine.analyse(chess.fen(), { depth: 18, multipv: 1 });
      const terminal = A.terminalInfo(chess.fen());
      const evalText = terminal ? terminal.type : res.lines[0] ? JSON.stringify(res.lines[0].score) + " (per chi muove)" : "?";
      console.log(`  esempio ok, posizione finale: ${evalText}`);
    }
    for (const [n, ex] of (lesson.exercises || []).entries()) {
      const chess = new Chess(ex.fen);
      for (const [i, uci] of ex.solution.entries()) {
        const fen = chess.fen();
        if (i % 2 === 0) {
          const legal = chess.moves().length;
          const res = await engine.analyse(fen, { depth: DEPTH, multipv: Math.min(8, legal) });
          const best = res.lines[0];
          const scoreOf = (move) => {
            const line = res.lines.find((l) => l.pv[0] === move);
            return line ? line.score : null;
          };
          const check = (move, label) => {
            const s = scoreOf(move);
            if (!s) return report(`esercizio ${n + 1}: ${label} ${move} non tra le prime ${res.lines.length} di Stockfish (migliore ${best.pv[0]} ${JSON.stringify(best.score)})`);
            const loss = win(best.score) - win(s);
            if (loss > TOLERANCE) report(`esercizio ${n + 1}: ${label} ${move} perde ${loss.toFixed(1)} punti (migliore ${best.pv[0]})`);
          };
          check(uci, "soluzione");
          if (i === 0 && ex.accept) ex.accept.forEach((move) => check(move, "accettata"));
          if (i === 0 && !ex.accept && res.lines[1]) {
            const gap = win(best.score) - win(res.lines[1].score);
            if (gap < 10) console.log(`  nota: esercizio ${n + 1} ha un'alternativa vicina (${res.lines[1].pv[0]}, distacco ${gap.toFixed(1)})`);
          }
          console.log(`  esercizio ${n + 1} mossa ${i + 1}: ${uci}  migliore=${best.pv[0]} ${JSON.stringify(best.score)}`);
        }
        if (!play(chess, uci)) {
          report(`esercizio ${n + 1}: mossa ${uci} illegale`);
          break;
        }
      }
    }
  }
  console.log(problems ? `\n${problems} problemi trovati` : "\nTutte le lezioni sono corrette.");
  process.exit(problems ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
