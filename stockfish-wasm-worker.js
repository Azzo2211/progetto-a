self.onerror = function stockfishWasmWorkerError(message, source, line, column, error) {
  const detail = error && error.message ? error.message : message;
  self.postMessage(`error Stockfish WASM worker: ${detail || "errore sconosciuto"}`);
};

try {
  importScripts("stockfish.js");
  if (typeof STOCKFISH !== "function") throw new Error("STOCKFISH factory non trovata");

  const engine = STOCKFISH("stockfish.wasm");
  engine.onmessage = function stockfishWasmMessage(event) {
    self.postMessage(event && event.data ? event.data : event);
  };

  self.onmessage = function stockfishWasmCommand(event) {
    engine.postMessage(event.data);
  };
} catch (error) {
  self.postMessage(`error Stockfish WASM worker: ${error && error.message ? error.message : String(error)}`);
}
