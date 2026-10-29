/*
 * Progetto A - Scacchi: orologi della partita (Lampo 1 minuto, Blitz 3 minuti). Senza DOM.
 *
 * Il tempo si misura con l'ora reale (Date.now): se lo schermo si spegne o cambi app, alla
 * ripresa l'orologio ha gia' scalato il tempo passato, come in una partita vera.
 * Regole come sui siti di scacchi:
 *  - l'orologio parte con la prima mossa del Bianco (la prima mossa non consuma tempo);
 *  - una premossa costa 0,1 secondi;
 *  - chi finisce il tempo perde, ma se l'avversario non ha materiale per dare matto e' patta;
 *  - Lampo e Blitz hanno un rating separato (vedi chess/rating.js).
 * Il bot gestisce il suo tempo come una persona: pensa di piu' nel mediogioco, meno in apertura
 * e quando ha poco tempo. La sua forza (Elo) resta la stessa.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessClock = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const TIME_CONTROLS = {
    none: { id: "none", label: "Senza tempo", short: "", base: 0, inc: 0 },
    bullet: { id: "bullet", label: "Lampo", short: "1 min", base: 60 * 1000, inc: 0 },
    blitz: { id: "blitz", label: "Blitz", short: "3 min", base: 3 * 60 * 1000, inc: 0 }
  };
  const PREMOVE_COST = 100;

  function control(id) { return TIME_CONTROLS[id] || TIME_CONTROLS.none; }
  function timed(id) { return control(id).base > 0; }
  const other = (side) => (side === "w" ? "b" : "w");

  function create(id) {
    const tc = control(id);
    if (!tc.base) return null;
    return { tc: tc.id, base: tc.base, inc: tc.inc, w: tc.base, b: tc.base, turn: "w", since: null, started: false, stopped: false, flag: null };
  }

  // Tempo rimasto (ms) a un giocatore in questo momento.
  function remaining(clock, side, now = Date.now()) {
    if (!clock) return Infinity;
    const base = clock[side];
    if (!clock.stopped && clock.since !== null && clock.turn === side) return base - (now - clock.since);
    return base;
  }

  /*
   * Mossa fatta da "side": scala il tempo che ha usato, aggiunge l'incremento e fa partire
   * l'orologio dell'altro. La prima mossa del Bianco non consuma tempo. premove: costa 0,1 s.
   * Restituisce il lato che ha finito il tempo (se e' arrivato a zero prima di muovere) o null.
   */
  function moveMade(clock, side, now = Date.now(), { premove = false } = {}) {
    if (!clock || clock.stopped || clock.flag) return clock ? clock.flag : null;
    if (!clock.started) {
      clock.started = true;
      clock.turn = other(side);
      clock.since = now;
      return null;
    }
    if (clock.turn !== side) { clock.turn = side; clock.since = now; }
    const used = premove ? PREMOVE_COST : Math.max(0, now - clock.since);
    clock[side] -= used;
    if (clock[side] <= 0) {
      clock[side] = 0;
      clock.flag = side;
      clock.stopped = true;
      return side;
    }
    clock[side] += clock.inc;
    clock.turn = other(side);
    clock.since = now;
    return null;
  }

  // Controllo continuo: chi e' arrivato a zero mentre toccava a lui.
  function check(clock, now = Date.now()) {
    if (!clock || clock.stopped || !clock.started) return clock ? clock.flag : null;
    if (remaining(clock, clock.turn, now) <= 0) {
      clock[clock.turn] = 0;
      clock.flag = clock.turn;
      clock.stopped = true;
    }
    return clock.flag;
  }

  function stop(clock, now = Date.now()) {
    if (!clock || clock.stopped) return;
    if (clock.started && clock.since !== null) clock[clock.turn] = Math.max(0, remaining(clock, clock.turn, now));
    clock.stopped = true;
  }

  /*
   * Quanto tempo puo' pensare il bot per questa mossa (ms): il tempo rimasto diviso per le mosse
   * che probabilmente restano (almeno 20), meno in apertura, mai piu' di un decimo del rimasto.
   * rng: variazione naturale (ogni mossa un po' diversa).
   */
  function botThink(clock, side, ply, now = Date.now(), rng = Math.random) {
    if (!clock) return null;
    const left = Math.max(0, remaining(clock, side, now));
    const fullMove = Math.floor(ply / 2) + 1;
    const movesLeft = Math.max(20, 40 - fullMove * 0.5);
    let think = left / movesLeft + clock.inc * 0.8;
    if (fullMove <= 6) think *= 0.35;
    else if (fullMove <= 12) think *= 0.7;
    think *= 0.6 + rng() * 0.8;
    think = Math.min(think, left * 0.1);
    if (left < 10000) think = Math.min(think, 400 + rng() * 300);
    return Math.max(120, Math.round(think));
  }

  // 2:59 · 0:42 · sotto i 10 secondi con i decimi (0:09.4), come sui siti di scacchi.
  function format(ms) {
    if (!Number.isFinite(ms)) return "";
    const t = Math.max(0, ms);
    if (t < 10000) {
      const tenths = Math.floor(t / 100);
      return `0:0${Math.floor(tenths / 10)}.${tenths % 10}`;
    }
    const s = Math.ceil(t / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  return { TIME_CONTROLS, PREMOVE_COST, control, timed, create, remaining, moveMade, check, stop, botThink, format };
});
