// Avvia Stockfish 17.1 dentro Node, per i test di calibrazione.
// Senza argomenti usa lo stesso file del sito (versione lite); con un percorso usa un altro
// build a file unico di stockfish.js (per esempio la versione completa, vedi tools/calibrate.js).
const path = require("path");
const ENGINE_JS = path.join(__dirname, "..", "engine", "stockfish-17.1-lite-single-03e3232.js");

function createRawEngine(engineJs = ENGINE_JS) {
  const js = path.resolve(engineJs);
  const wasm = js.replace(/\.js$/, ".wasm");
  return new Promise((resolve, reject) => {
    delete require.cache[require.resolve(js)];
    const INIT = require(js);
    const engine = { locateFile: (file) => (file.includes(".wasm") ? wasm : js) };
    INIT()(engine).then(function ready() {
      if (engine._isReady && !engine._isReady()) return setTimeout(ready, 10);
      delete engine._isReady;
      let listeners = [];
      engine.listener = (line) => { if (typeof line === "string") listeners.slice().forEach((fn) => fn(line)); };
      resolve({
        post: (cmd) => setImmediate(() => engine.ccall("command", null, ["string"], [cmd], { async: /^go\b/.test(cmd) })),
        onLine: (fn) => { listeners.push(fn); },
        terminate: () => { try { engine.terminate && engine.terminate(); } catch (e) { /* ignore */ } }
      });
    }).catch(reject);
  });
}

module.exports = { createRawEngine };
