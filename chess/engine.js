/*
 * Progetto A - Scacchi: collegamento con Stockfish 17.1 (protocollo UCI).
 *
 * Nel browser crea un Web Worker per motore. Ci sono due motori separati:
 *  - ChessEngines.play   -> usato dal bot per scegliere le mosse
 *  - ChessEngines.review -> usato per l'analisi/revisione (anche in background)
 * Cosi' l'analisi non rallenta mai le risposte del bot.
 *
 * La classe UciEngine funziona con qualsiasi "transport" ({ post, onLine }),
 * quindi e' riutilizzabile anche in Node per i test di calibrazione.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessEngineKit = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const ENGINE_URL = "engine/stockfish-17.1-lite-single-03e3232.js";
  const ENGINE_NAME = "Stockfish 17.1 Lite";

  function parseInfo(line) {
    if (!line.startsWith("info ") || line.includes(" currmove ") || !line.includes(" pv ")) return null;
    if (line.includes(" lowerbound") || line.includes(" upperbound")) return null;
    const depth = Number((line.match(/\bdepth (\d+)/) || [])[1] || 0);
    const multipv = Number((line.match(/\bmultipv (\d+)/) || [])[1] || 1);
    const cp = line.match(/\bscore cp (-?\d+)/);
    const mate = line.match(/\bscore mate (-?\d+)/);
    const pv = (line.match(/ pv (.+)$/) || [])[1];
    if (!pv || (!cp && !mate)) return null;
    return {
      depth,
      multipv,
      score: mate ? { mate: Number(mate[1]) } : { cp: Number(cp[1]) },
      pv: pv.trim().split(/\s+/)
    };
  }

  class UciEngine {
    constructor(transport, name = ENGINE_NAME) {
      this.transport = transport;
      this.name = name;
      this.listeners = new Set();
      this.queue = Promise.resolve();
      this.ready = false;
      this.initPromise = null;
      this.error = null;
      this.generation = 0;
      this.currentMultiPv = 1;
      this.staleBestmoves = 0;
      transport.onLine((line) => this.listeners.forEach((fn) => fn(line)));
    }

    waitFor(predicate, timeoutMs) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this.listeners.delete(listener);
          reject(new Error("Stockfish non risponde"));
        }, timeoutMs);
        const listener = (line) => {
          if (line.startsWith("__error__")) {
            clearTimeout(timer);
            this.listeners.delete(listener);
            reject(new Error(line.replace("__error__", "").trim() || "Errore Stockfish"));
            return;
          }
          if (!predicate(line)) return;
          clearTimeout(timer);
          this.listeners.delete(listener);
          resolve(line);
        };
        this.listeners.add(listener);
      });
    }

    init({ hashMb = 32 } = {}) {
      if (this.initPromise) return this.initPromise;
      this.initPromise = (async () => {
        try {
          const uciOk = this.waitFor((line) => line === "uciok", 20000);
          this.transport.post("uci");
          await uciOk;
          this.transport.post(`setoption name Hash value ${hashMb}`);
          this.transport.post("setoption name Threads value 1");
          const readyOk = this.waitFor((line) => line === "readyok", 15000);
          this.transport.post("isready");
          await readyOk;
          this.ready = true;
          this.error = null;
          return { ok: true, name: this.name };
        } catch (error) {
          this.ready = false;
          this.error = error.message || String(error);
          this.initPromise = null;
          return { ok: false, error: this.error };
        }
      })();
      return this.initPromise;
    }

    // Annulla le analisi ancora in coda (per esempio quando inizia una nuova partita).
    cancelPending() {
      this.generation += 1;
    }

    newGame() {
      this.cancelPending();
      return this.enqueue(async () => {
        this.transport.post("ucinewgame");
        const readyOk = this.waitFor((line) => line === "readyok", 10000);
        this.transport.post("isready");
        await readyOk;
        return true;
      }, { ignoreGeneration: true });
    }

    enqueue(task, { ignoreGeneration = false } = {}) {
      const generation = this.generation;
      const run = this.queue.then(() => {
        if (!ignoreGeneration && generation !== this.generation) return { ok: false, cancelled: true };
        return task();
      });
      this.queue = run.catch(() => {});
      return run;
    }

    /*
     * Analizza una posizione. opts: { depth, multipv, movetime, nodes }.
     * Restituisce { ok, bestmove, depth, lines: [{ multipv, depth, score, pv }] }
     * con i punteggi dal punto di vista di chi muove.
     */
    analyse(fen, opts = {}) {
      return this.enqueue(async () => {
        const init = await this.init();
        if (!init.ok) return { ok: false, error: init.error, lines: [] };
        return this.search(fen, opts);
      });
    }

    search(fen, { depth = 12, multipv = 1, movetime = null, nodes = null, timeoutMs = 60000 } = {}) {
      return new Promise((resolve) => {
        const lines = new Map();
        let maxDepth = 0;
        let hardTimer = null;
        // Se la ricerca dura troppo la fermiamo, ma aspettiamo comunque la
        // "bestmove" finale: cosi' non finisce nella risposta della ricerca dopo.
        const timer = setTimeout(() => {
          this.transport.post("stop");
          hardTimer = setTimeout(() => {
            this.listeners.delete(listener);
            // La "bestmove" di questa ricerca potrebbe arrivare dopo: la ignoreremo.
            this.staleBestmoves += 1;
            resolve({ ok: false, error: "Timeout analisi Stockfish", lines: [] });
          }, 5000);
        }, timeoutMs);
        const listener = (line) => {
          if (line.startsWith("info ")) {
            const info = parseInfo(line);
            if (info) {
              lines.set(info.multipv, info);
              maxDepth = Math.max(maxDepth, info.depth);
            }
            return;
          }
          if (line.startsWith("__error__")) {
            clearTimeout(timer);
            clearTimeout(hardTimer);
            this.listeners.delete(listener);
            resolve({ ok: false, error: line.replace("__error__", "").trim(), lines: [] });
            return;
          }
          if (!line.startsWith("bestmove")) return;
          if (this.staleBestmoves > 0) {
            this.staleBestmoves -= 1;
            lines.clear();
            maxDepth = 0;
            return;
          }
          clearTimeout(timer);
          clearTimeout(hardTimer);
          this.listeners.delete(listener);
          const token = line.split(/\s+/)[1];
          const sorted = [...lines.values()].sort((a, b) => a.multipv - b.multipv);
          const bestmove = token && token !== "(none)" && token !== "0000" ? token : null;
          resolve({ ok: Boolean(bestmove), bestmove, depth: maxDepth, lines: sorted, error: bestmove ? null : "Nessuna mossa disponibile" });
        };
        this.listeners.add(listener);
        if (multipv !== this.currentMultiPv) {
          this.transport.post(`setoption name MultiPV value ${multipv}`);
          this.currentMultiPv = multipv;
        }
        this.transport.post(`position fen ${fen}`);
        if (movetime) this.transport.post(`go movetime ${movetime}${depth ? ` depth ${depth}` : ""}`);
        else if (nodes) this.transport.post(`go nodes ${nodes}`);
        else this.transport.post(`go depth ${depth}`);
      });
    }
  }

  function createWorkerTransport(url) {
    const listeners = [];
    let worker = null;
    let failed = null;
    const emit = (line) => listeners.forEach((fn) => fn(line));
    try {
      worker = new Worker(url);
      worker.onmessage = (event) => {
        const data = event && event.data !== undefined ? event.data : event;
        String(data).split("\n").forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) emit(trimmed);
        });
      };
      worker.onerror = (event) => {
        failed = (event && event.message) || "Errore nel caricamento di Stockfish";
        emit(`__error__ ${failed}`);
      };
    } catch (error) {
      failed = error.message || String(error);
    }
    return {
      post(command) {
        if (!worker) {
          setTimeout(() => emit(`__error__ ${failed || "Stockfish non disponibile"}`), 0);
          return;
        }
        worker.postMessage(command);
      },
      onLine(fn) {
        listeners.push(fn);
      },
      terminate() {
        if (worker) worker.terminate();
      }
    };
  }

  function createBrowserEngines() {
    if (typeof Worker === "undefined") return null;
    const url = new URL(ENGINE_URL, root.location ? root.location.href : undefined).href;
    return {
      play: new UciEngine(createWorkerTransport(url), ENGINE_NAME),
      review: new UciEngine(createWorkerTransport(url), ENGINE_NAME)
    };
  }

  const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  if (isBrowser && window.location && window.location.protocol !== "file:") {
    root.ChessEngines = createBrowserEngines();
  }

  return { UciEngine, parseInfo, createWorkerTransport, ENGINE_URL, ENGINE_NAME };
});
