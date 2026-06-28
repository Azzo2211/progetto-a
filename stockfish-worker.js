self.onerror = function stockfishWorkerError(message, source, line, column, error) {
  const detail = error && error.message ? error.message : message;
  self.postMessage(`error Stockfish worker: ${detail || "errore sconosciuto"}`);
};

try {
  importScripts("stockfish-asm.js");
} catch (error) {
  self.postMessage(`error Stockfish worker: ${error && error.message ? error.message : String(error)}`);
}
