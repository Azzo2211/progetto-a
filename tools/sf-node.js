// Avvia Stockfish 17.1 (stesso file del sito) dentro Node, per i test di calibrazione.
const path = require("path");
const ENGINE_JS = path.join(__dirname, "..", "engine", "stockfish-17.1-lite-single-03e3232.js");
const ENGINE_WASM = ENGINE_JS.replace(/\.js$/, ".wasm");

function createRawEngine() {
  return new Promise((resolve, reject) => {
    delete require.cache[require.resolve(ENGINE_JS)];
    const INIT = require(ENGINE_JS);
    const engine = { locateFile: (file) => (file.includes(".wasm") ? ENGINE_WASM : ENGINE_JS) };
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
