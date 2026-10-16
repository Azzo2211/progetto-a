/*
 * Progetto A - Scacchi: scacchiera interattiva riutilizzabile.
 *
 * Una sola scacchiera per partita, revisione, lezioni ed esercizi:
 *  - set "Classroom" (pezzi originali disegnati in stile anime Classroom of the
 *    Elite) ed "Elite 3D" (stessi pezzi, resa realistica), generati con
 *    tools/pieces3d; set SVG di lichess (vedi assets/pieces/LICENSE.md)
 *  - mosse animate: il pezzo si alza, scivola e si appoggia con la sua ombra;
 *    il cavallo salta, il pezzo catturato cade di lato, il re trema allo
 *    scacco e cade allo scacco matto (anche nella revisione, avanti e indietro)
 *  - clic-clic oppure trascinamento, con case legali evidenziate
 *  - frecce (mossa migliore, errore, suggerimento) e icona di classificazione
 *  - temi di colore e suoni generati con Web Audio (nessun file audio)
 *
 * Coordinate: case in notazione algebrica ("e4"). La vista non conosce le
 * regole: chi la usa passa la posizione, le case evidenziate e riceve gli
 * eventi (presa del pezzo, tocco, rilascio).
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessBoardKit = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const FILES = "abcdefgh";

  // ext: formato delle immagini; ratio: altezza/larghezza dell'immagine (i pezzi
  // 3D sono piu' alti della casa e sporgono verso l'alto); depth: ha volume.
  const PIECE_SETS = {
    cote: { label: "Classroom", author: "Progetto A", license: "originale", ext: "webp", ratio: 1.25, depth: true },
    elite: { label: "Elite 3D", author: "Progetto A", license: "originale", ext: "webp", ratio: 1.25, depth: true },
    staunty: { label: "Staunty", author: "sadsnake1", license: "CC BY-NC-SA 4.0", ext: "svg", ratio: 1 },
    maestro: { label: "Maestro", author: "sadsnake1", license: "CC BY-NC-SA 4.0", ext: "svg", ratio: 1 },
    california: { label: "California", author: "Jerry S.", license: "CC BY-NC-SA 4.0", ext: "svg", ratio: 1 },
    cburnett: { label: "Classico", author: "Colin M.L. Burnett", license: "GPLv2+", ext: "svg", ratio: 1 }
  };
  const DEFAULT_SET = "cote";

  // Colori case chiare/scure. "accademia" e' pensato per il tema scuro della pagina.
  const BOARD_THEMES = {
    accademia: { label: "Accademia", light: "#ecdfc8", dark: "#a4626e", last: "rgba(240, 200, 90, 0.48)", coordLight: "#a4626e", coordDark: "#ecdfc8" },
    verde: { label: "Torneo", light: "#ebecd0", dark: "#739552", last: "rgba(245, 246, 130, 0.62)", coordLight: "#739552", coordDark: "#ebecd0" },
    legno: { label: "Legno", light: "#f0d9b5", dark: "#b58863", last: "rgba(205, 210, 106, 0.66)", coordLight: "#b58863", coordDark: "#f0d9b5" },
    ardesia: { label: "Ardesia", light: "#e4e9e7", dark: "#5e8b83", last: "rgba(232, 214, 120, 0.6)", coordLight: "#5e8b83", coordDark: "#e4e9e7" },
    notte: { label: "Notte", light: "#d2d8e2", dark: "#4b5a78", last: "rgba(231, 196, 96, 0.55)", coordLight: "#4b5a78", coordDark: "#d2d8e2" }
  };

  const ARROW_COLORS = {
    green: "#2f9e44",
    red: "#d9480f",
    blue: "#1c7ed6",
    yellow: "#f2b01e",
    gold: "#e6c777"
  };

  function squareToXY(square) {
    return { file: FILES.indexOf(square[0]), rank: Number(square[1]) - 1 };
  }

  function xyToSquare(file, rank) {
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return null;
    return `${FILES[file]}${rank + 1}`;
  }

  function isWhitePiece(piece) {
    return piece === piece.toUpperCase();
  }

  // Accetta una posizione come FEN, come matrice 8x8 (riga 0 = traversa 8)
  // o come oggetto { e4: "P" }. Restituisce sempre l'oggetto.
  function normalizePosition(position) {
    if (!position) return {};
    if (typeof position === "string") return fenToPosition(position);
    if (Array.isArray(position)) {
      const result = {};
      for (let row = 0; row < 8; row += 1) {
        for (let col = 0; col < 8; col += 1) {
          const piece = position[row] && position[row][col];
          if (piece) result[`${FILES[col]}${8 - row}`] = piece;
        }
      }
      return result;
    }
    return { ...position };
  }

  function fenToPosition(fen) {
    const result = {};
    const rows = String(fen).trim().split(/\s+/)[0].split("/");
    rows.forEach((row, rowIndex) => {
      let col = 0;
      for (const char of row) {
        if (/\d/.test(char)) col += Number(char);
        else {
          if (col < 8) result[`${FILES[col]}${8 - rowIndex}`] = char;
          col += 1;
        }
      }
    });
    return result;
  }

  function pieceCode(piece) {
    if (piece.length === 2) return piece;
    return `${isWhitePiece(piece) ? "w" : "b"}${piece.toUpperCase()}`;
  }

  function pieceSetKey(key) {
    return PIECE_SETS[key] ? key : DEFAULT_SET;
  }

  // Percorso dell'immagine di un pezzo ("K", "p" oppure "wK", "bp").
  function pieceSrc(setKey, piece, base = "assets/pieces") {
    const key = pieceSetKey(setKey);
    return `${base}/${key}/${pieceCode(piece)}.${PIECE_SETS[key].ext}`;
  }

  /* ---------------------------------------------------------------- suoni */

  const Sound = {
    enabled: true,
    ctx: null,
    unlock() {
      if (this.ctx || typeof window === "undefined") return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      try {
        this.ctx = new Ctx();
      } catch (error) {
        this.ctx = null;
      }
    },
    noiseBuffer() {
      if (this._noise) return this._noise;
      const ctx = this.ctx;
      const length = Math.floor(ctx.sampleRate * 0.2);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      this._noise = buffer;
      return buffer;
    },
    knock(time, { freq = 1900, q = 1.4, gain = 0.55, decay = 0.07, body = 190 } = {}) {
      const ctx = this.ctx;
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = q;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(gain, time);
      amp.gain.exponentialRampToValueAtTime(0.001, time + decay);
      noise.connect(filter).connect(amp).connect(ctx.destination);
      noise.start(time);
      noise.stop(time + decay + 0.02);
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(body, time);
      osc.frequency.exponentialRampToValueAtTime(body * 0.6, time + decay);
      const bodyGain = ctx.createGain();
      bodyGain.gain.setValueAtTime(gain * 0.5, time);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, time + decay);
      osc.connect(bodyGain).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + decay + 0.02);
    },
    tone(time, freq, duration, gain = 0.12, type = "sine") {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const amp = ctx.createGain();
      amp.gain.setValueAtTime(0.0001, time);
      amp.gain.exponentialRampToValueAtTime(gain, time + 0.012);
      amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);
      osc.connect(amp).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + duration + 0.02);
    },
    play(kind) {
      if (!this.enabled || !this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
      const t = this.ctx.currentTime + 0.005;
      try {
        if (kind === "move") this.knock(t);
        else if (kind === "capture") {
          this.knock(t, { freq: 1300, gain: 0.7, decay: 0.09, body: 150 });
          this.knock(t + 0.035, { freq: 2300, gain: 0.35, decay: 0.05, body: 240 });
        } else if (kind === "check") {
          this.knock(t);
          this.tone(t + 0.02, 880, 0.16, 0.07, "triangle");
        } else if (kind === "castle") {
          this.knock(t);
          this.knock(t + 0.09, { freq: 1700, gain: 0.45 });
        } else if (kind === "end") {
          [523.25, 659.25, 783.99].forEach((f, i) => this.tone(t + i * 0.09, f, 0.45, 0.08, "triangle"));
        } else if (kind === "success") {
          this.tone(t, 659.25, 0.16, 0.09, "triangle");
          this.tone(t + 0.1, 987.77, 0.24, 0.09, "triangle");
        } else if (kind === "error") {
          this.tone(t, 196, 0.18, 0.08, "square");
        } else if (kind === "premove") {
          this.tone(t, 523.25, 0.09, 0.05, "sine");
        }
      } catch (error) {
        /* l'audio non deve mai bloccare la scacchiera */
      }
    }
  };

  /* ---------------------------------------------------------- scacchiera */

  class BoardView {
    constructor(container, options = {}) {
      this.container = container;
      this.options = {
        pieceSet: DEFAULT_SET,
        theme: "accademia",
        orientation: "white",
        coordinates: true,
        animationMs: 190,
        effects: true, // effetti speciali in stile Classroom (scie, griglia, lampo freddo)
        piecePath: "assets/pieces",
        onPieceGrab: null, // (square) => boolean: il pezzo puo' essere trascinato?
        onSquareTap: null, // (square, { wasSelected }) => void
        onDrop: null, // (from, to) => void
        ...options
      };
      this.position = {};
      this.pieceEls = new Map();
      this.vm = {};
      this.drag = null;
      this.build();
      this.applyTheme();
    }

    build() {
      const root = document.createElement("div");
      root.className = "bv";
      root.setAttribute("role", "application");
      root.setAttribute("aria-label", "Scacchiera");
      const squares = document.createElement("div");
      squares.className = "bv-squares";
      this.squareEls = new Map();
      for (let i = 0; i < 64; i += 1) {
        const el = document.createElement("div");
        el.className = "bv-sq";
        squares.appendChild(el);
      }
      const arrows = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      arrows.setAttribute("class", "bv-arrows");
      arrows.setAttribute("viewBox", "0 0 800 800");
      arrows.setAttribute("aria-hidden", "true");
      const fx = document.createElement("div");
      fx.className = "bv-fx";
      const pieces = document.createElement("div");
      pieces.className = "bv-pieces";
      const fxTop = document.createElement("div");
      fxTop.className = "bv-fx-top";
      const overlay = document.createElement("div");
      overlay.className = "bv-overlay";
      root.append(squares, fx, arrows, pieces, fxTop, overlay);
      this.container.innerHTML = "";
      this.container.appendChild(root);
      this.root = root;
      this.squaresEl = squares;
      this.arrowsEl = arrows;
      this.piecesEl = pieces;
      this.fxEl = fx;
      this.fxTopEl = fxTop;
      this.overlayEl = overlay;
      this.layoutSquares();
      root.addEventListener("pointerdown", (event) => this.handlePointerDown(event));
      root.addEventListener("contextmenu", (event) => event.preventDefault());
    }

    // Ridisegna etichette e attributi delle case secondo l'orientamento.
    layoutSquares() {
      const children = [...this.squaresEl.children];
      this.squareEls.clear();
      children.forEach((el, index) => {
        const row = Math.floor(index / 8);
        const col = index % 8;
        const file = this.options.orientation === "white" ? col : 7 - col;
        const rank = this.options.orientation === "white" ? 7 - row : row;
        const square = xyToSquare(file, rank);
        const light = (file + rank) % 2 === 1;
        el.className = `bv-sq ${light ? "light" : "dark"}`;
        el.dataset.square = square;
        el.innerHTML = "";
        if (this.options.coordinates) {
          if (col === 0) el.insertAdjacentHTML("beforeend", `<span class="bv-coord bv-rank">${rank + 1}</span>`);
          if (row === 7) el.insertAdjacentHTML("beforeend", `<span class="bv-coord bv-file">${FILES[file]}</span>`);
        }
        this.squareEls.set(square, el);
      });
    }

    setOptions(next = {}) {
      const before = { ...this.options };
      Object.assign(this.options, next);
      if (before.orientation !== this.options.orientation || before.coordinates !== this.options.coordinates) {
        this.layoutSquares();
        this.pieceEls.forEach((entry, square) => this.placeEl(entry.el, square, false));
        this.renderMarks();
        this.renderArrows();
        this.renderBadge();
      }
      if (before.pieceSet !== this.options.pieceSet) {
        this.pieceEls.forEach((entry) => {
          entry.img.style.backgroundImage = this.pieceUrl(entry.piece);
        });
      }
      this.applyTheme();
    }

    applyTheme() {
      const theme = BOARD_THEMES[this.options.theme] || BOARD_THEMES.accademia;
      const style = this.root.style;
      style.setProperty("--bv-light", theme.light);
      style.setProperty("--bv-dark", theme.dark);
      style.setProperty("--bv-last", theme.last);
      style.setProperty("--bv-coord-light", theme.coordLight);
      style.setProperty("--bv-coord-dark", theme.coordDark);
      style.setProperty("--bv-anim", `${this.reducedMotion() ? 0 : this.options.animationMs}ms`);
      const set = PIECE_SETS[pieceSetKey(this.options.pieceSet)];
      style.setProperty("--bv-ratio", String(set.ratio || 1));
      this.root.dataset.theme = this.options.theme;
      this.root.dataset.depth = set.depth ? "3d" : "flat";
    }

    reducedMotion() {
      return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    pieceUrl(piece) {
      return `url("${pieceSrc(this.options.pieceSet, piece, this.options.piecePath)}")`;
    }

    squareOffset(square) {
      const { file, rank } = squareToXY(square);
      const x = this.options.orientation === "white" ? file : 7 - file;
      const y = this.options.orientation === "white" ? 7 - rank : rank;
      return { x, y };
    }

    canAnimate(el) {
      return Boolean(el && el.animate) && !this.reducedMotion();
    }

    fxOn() {
      return this.options.effects !== false && !this.reducedMotion() && Boolean(this.root.animate);
    }

    squareTransform(square) {
      const { x, y } = this.squareOffset(square);
      return `translate(${x * 100}%, ${y * 100}%)`;
    }

    // Scia di "immagini residue" color ghiaccio dietro al pezzo che si muove.
    ghostTrail(entry, from, to, { duration, delay = 0, hop = false } = {}) {
      const fromT = this.squareTransform(from);
      const toT = this.squareTransform(to);
      const easing = "cubic-bezier(0.32, 0.72, 0.2, 1)";
      for (let i = 1; i <= 3; i += 1) {
        const ghost = document.createElement("div");
        ghost.className = "bv-ghost";
        const img = document.createElement("div");
        img.className = "bv-img";
        // sagoma piena color ghiaccio: l'immagine del pezzo fa da maschera
        img.style.webkitMaskImage = entry.img.style.backgroundImage;
        img.style.maskImage = entry.img.style.backgroundImage;
        ghost.appendChild(img);
        ghost.style.transform = fromT;
        this.piecesEl.appendChild(ghost);
        const lag = delay + i * 42;
        ghost.animate([{ transform: fromT }, { transform: toT }], { duration, delay: lag, easing, fill: "both" });
        ghost.animate(
          [{ opacity: 0 }, { opacity: 0.78 - i * 0.16, offset: 0.08 }, { opacity: 0.55 - i * 0.12, offset: 0.62 }, { opacity: 0 }],
          { duration: duration + 40, delay: lag, fill: "both" }
        );
        if (hop) {
          img.animate(
            [{ transform: "none" }, { transform: "translateY(-30%) scale(1.08)", offset: 0.42 }, { transform: "none", offset: 0.84 }, { transform: "none" }],
            { duration: duration + 50, delay: lag }
          );
        }
        setTimeout(() => ghost.remove(), lag + duration + 80);
      }
    }

    // Arrivo: la luce corre lungo traversa e colonna e un mirino si chiude sulla casa.
    landFx(square, { delay = 0, tone = "ice" } = {}) {
      const { x, y } = this.squareOffset(square);
      const row = document.createElement("span");
      row.className = `bv-scan bv-scan-row ${tone}`;
      row.style.top = `${y * 12.5}%`;
      row.style.setProperty("--o", `${(x + 0.5) * 12.5}%`);
      const col = document.createElement("span");
      col.className = `bv-scan bv-scan-col ${tone}`;
      col.style.left = `${x * 12.5}%`;
      col.style.setProperty("--o", `${(y + 0.5) * 12.5}%`);
      [row, col].forEach((el) => {
        el.style.animationDelay = `${delay}ms`;
        this.fxEl.appendChild(el);
        setTimeout(() => el.remove(), delay + 700);
      });
      this.effect("lock", square, { delay, cls: tone, life: 700 });
    }

    // Cattura: linee di velocita' da manga e un piccolo scossone della scacchiera.
    impactFx(square, delay) {
      const { x, y } = this.squareOffset(square);
      const burst = document.createElement("span");
      burst.className = "bv-burst";
      burst.style.left = `${(x - 1) * 12.5}%`;
      burst.style.top = `${(y - 1) * 12.5}%`;
      burst.style.setProperty("--spin", `${Math.round(Math.random() * 40)}deg`);
      burst.style.animationDelay = `${delay}ms`;
      this.fxTopEl.appendChild(burst);
      setTimeout(() => burst.remove(), delay + 600);
      this.root.animate(
        [
          { transform: "none" },
          { transform: "translate(-3px, 2px)" },
          { transform: "translate(3px, -2px)" },
          { transform: "translate(-2px, -1px)" },
          { transform: "translate(1px, 1px)" },
          { transform: "none" }
        ],
        { duration: 240, delay }
      );
    }

    // Posiziona un pezzo sulla sua casa. Con animate scivola dalla posizione
    // attuale (anche se era a meta' di un'altra animazione o trascinato).
    placeEl(el, square, animate, opts = {}) {
      const { x, y } = this.squareOffset(square);
      const to = `translate(${x * 100}%, ${y * 100}%)`;
      el.dataset.square = square;
      el.style.zIndex = String(10 + y);
      let from = el.style.transform || to;
      const running = el.getAnimations ? el.getAnimations() : [];
      if (running.length) {
        const current = getComputedStyle(el).transform;
        if (current && current !== "none") from = current;
        running.forEach((anim) => anim.cancel());
      }
      el.style.transform = to;
      el.classList.remove("bv-moving");
      if (!animate || from === to || !this.canAnimate(el)) return null;
      const anim = el.animate([{ transform: from }, { transform: to }], {
        duration: opts.duration || this.options.animationMs,
        delay: opts.delay || 0,
        easing: opts.easing || "cubic-bezier(0.32, 0.72, 0.2, 1)",
        fill: "backwards"
      });
      el.classList.add("bv-moving");
      el._moveAnim = anim;
      const done = () => {
        if (el._moveAnim === anim) el.classList.remove("bv-moving");
      };
      anim.onfinish = done;
      anim.oncancel = done;
      return anim;
    }

    createPieceEl(piece, square, appear) {
      const el = document.createElement("div");
      el.className = `bv-piece ${isWhitePiece(piece) ? "white" : "black"}`;
      el.dataset.piece = piece;
      const shadow = document.createElement("div");
      shadow.className = "bv-shadow";
      const img = document.createElement("div");
      img.className = "bv-img";
      img.style.backgroundImage = this.pieceUrl(piece);
      el.append(shadow, img);
      this.placeEl(el, square, false);
      this.piecesEl.appendChild(el);
      if (appear && this.canAnimate(img)) {
        img.animate(
          [
            { opacity: 0, transform: "translateY(-16%) scale(1.12)" },
            { opacity: 1, transform: "translateY(0) scale(0.97)", offset: 0.75 },
            { opacity: 1, transform: "none" }
          ],
          { duration: 300, easing: "cubic-bezier(0.25, 0.8, 0.3, 1)" }
        );
        shadow.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
      }
      return { piece, el, img, shadow };
    }

    // Il pezzo si alza, scivola e si appoggia (il cavallo salta piu' in alto).
    animateMove(entry, to, { duration, delay = 0, hop = false, dropped = false, from = null, trail = false } = {}) {
      const anim = this.placeEl(entry.el, to, true, { duration, delay });
      if (!anim) return null;
      if (trail && from && !dropped) this.ghostTrail(entry, from, to, { duration, delay, hop });
      const timing = { duration: duration + 50, delay, easing: "linear" };
      if (dropped) {
        entry.img.animate(
          [
            { transform: "translateY(-9%) scale(1.1)" },
            { transform: "translateY(0) scale(1.03, 0.95)", offset: 0.7 },
            { transform: "none" }
          ],
          { ...timing, easing: "ease-out" }
        );
        return anim;
      }
      const lift = hop ? 30 : 11;
      entry.img.animate(
        [
          { transform: "none", easing: "cubic-bezier(0.25, 0.6, 0.4, 1)" },
          { transform: `translateY(-${lift}%) scale(${hop ? 1.08 : 1.05})`, offset: 0.42, easing: "cubic-bezier(0.55, 0, 0.75, 0.4)" },
          { transform: "translateY(0) scale(1)", offset: 0.84 },
          { transform: "translateY(0) scale(1.035, 0.95)", offset: 0.92 },
          { transform: "none" }
        ],
        timing
      );
      entry.shadow.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0.35, transform: `scale(${hop ? 0.6 : 0.75})`, offset: 0.42 },
          { opacity: 1, transform: "scale(1)", offset: 0.84 },
          { opacity: 1, transform: "scale(1)" }
        ],
        timing
      );
      return anim;
    }

    // Il pezzo catturato viene colpito e cade di lato, lontano da chi lo prende.
    topple(entry, { delay = 0, dir = 1 } = {}) {
      const el = entry.el;
      el.classList.add("bv-victim");
      entry.img.animate(
        [
          { transform: "none", opacity: 1 },
          { transform: `translateX(${dir * 3}%) rotate(${dir * 14}deg)`, opacity: 1, offset: 0.22 },
          { transform: `translateX(${dir * 22}%) translateY(6%) rotate(${dir * 86}deg)`, opacity: 0 }
        ],
        { duration: 560, delay, easing: "cubic-bezier(0.5, 0, 0.8, 0.45)", fill: "forwards" }
      );
      entry.shadow.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, delay: delay + 140, fill: "forwards" });
      setTimeout(() => el.remove(), delay + 600);
    }

    // Effetti sulla casa: "ring" sotto il pezzo, "slash" sopra.
    effect(kind, square, { cls = "", delay = 0, life = 700 } = {}) {
      if (this.reducedMotion()) return;
      const { x, y } = this.squareOffset(square);
      const el = document.createElement("span");
      el.className = `bv-${kind}${cls ? ` ${cls}` : ""}`;
      el.style.left = `${x * 12.5}%`;
      el.style.top = `${y * 12.5}%`;
      el.style.animationDelay = `${delay}ms`;
      (kind === "slash" || kind === "lock" ? this.fxTopEl : this.fxEl).appendChild(el);
      setTimeout(() => el.remove(), delay + life);
    }

    /*
     * Aggiorna i pezzi confrontando la posizione vecchia con la nuova:
     * i pezzi spariti da una casa e comparsi in un'altra (stesso tipo) si
     * spostano, il pedone che promuove arriva e si trasforma, i pezzi catturati
     * cadono, quelli che ricompaiono (indietro nella revisione) si posano.
     */
    setPosition(position, { animate = true } = {}) {
      const next = normalizePosition(position);
      const doAnimate = animate && !this.reducedMotion() && this.pieceEls.size > 0;
      const removed = [];
      const added = [];
      this.pieceEls.forEach((entry, square) => {
        if (next[square] !== entry.piece) removed.push({ square, entry });
      });
      Object.entries(next).forEach(([square, piece]) => {
        const current = this.pieceEls.get(square);
        if (!current || current.piece !== piece) added.push({ square, piece });
      });
      removed.forEach(({ square }) => this.pieceEls.delete(square));
      const distance = (a, b) => {
        const p = squareToXY(a);
        const q = squareToXY(b);
        return Math.hypot(p.file - q.file, p.rank - q.rank);
      };
      const moves = [];
      const unmatched = [];
      added.forEach(({ square, piece }) => {
        let bestIndex = -1;
        let bestDistance = Infinity;
        removed.forEach((item, index) => {
          if (item.used || item.entry.piece !== piece) return;
          const d = distance(item.square, square);
          if (d < bestDistance) {
            bestDistance = d;
            bestIndex = index;
          }
        });
        if (bestIndex >= 0) {
          const item = removed[bestIndex];
          item.used = true;
          moves.push({ entry: item.entry, from: item.square, to: square });
          this.pieceEls.set(square, item.entry);
        } else {
          unmatched.push({ square, piece });
        }
      });
      // promozione: il pedone arriva sull'ultima traversa e diventa il nuovo pezzo
      unmatched.forEach(({ square, piece }) => {
        const pawn = isWhitePiece(piece) ? "P" : "p";
        const lastRank = square[1] === "8" || square[1] === "1";
        const promo = doAnimate && lastRank && piece.toUpperCase() !== "P"
          ? removed.find((item) => !item.used && item.entry.piece === pawn && Math.abs(squareToXY(item.square).rank - squareToXY(square).rank) === 1 && Math.abs(squareToXY(item.square).file - squareToXY(square).file) <= 1)
          : null;
        if (promo) {
          promo.used = true;
          moves.push({ entry: promo.entry, from: promo.square, to: square, promoteTo: piece });
          promo.entry.piece = piece;
          promo.entry.el.dataset.piece = piece;
          this.pieceEls.set(square, promo.entry);
        } else {
          this.pieceEls.set(square, this.createPieceEl(piece, square, doAnimate));
        }
      });
      const victims = removed.filter((item) => !item.used);
      // pochi pezzi in movimento = una mossa vera: effetti completi.
      // Tanti pezzi (salto nella revisione) = solo spostamenti, niente effetti.
      const single = moves.length <= 2 && victims.length <= 1;
      const castle = moves.some((m) => m.entry.piece.toUpperCase() === "K" && Math.abs(squareToXY(m.from).file - squareToXY(m.to).file) === 2);
      const dropped = this.justDropped;
      const timings = new Map();
      const fx = single && doAnimate && this.fxOn();
      const capture = victims.length > 0;
      moves.forEach((m) => {
        const type = m.entry.piece.toUpperCase();
        const wasPawn = Boolean(m.promoteTo);
        const hop = type === "N" && !wasPawn;
        const isDropped = m.entry.el === dropped;
        const delay = castle && type === "R" ? 120 : 0;
        const d = distance(m.from, m.to);
        const base = this.options.animationMs + (fx ? 60 : 20);
        const duration = isDropped ? 130 : hop ? (fx ? 380 : 330) : Math.min(fx ? 440 : 380, base + d * (fx ? 30 : 26));
        timings.set(m.to, { from: m.from, duration, delay });
        if (!doAnimate) {
          this.placeEl(m.entry.el, m.to, false);
        } else {
          this.animateMove(m.entry, m.to, { duration, delay, hop: hop && single, dropped: isDropped, from: m.from, trail: fx });
          const land = delay + duration * 0.82;
          if (single && m.promoteTo) this.effect("ring", m.to, { delay: land, cls: "promo" });
          else if (single && !fx && !isDropped) this.effect("ring", m.to, { delay: land });
          if (fx && !(castle && type === "R")) {
            const tone = m.promoteTo ? "gold" : capture ? "blood" : "ice";
            this.landFx(m.to, { delay: isDropped ? 40 : land, tone });
            const glow = { ice: "120, 210, 255", blood: "255, 80, 110", gold: "250, 215, 120" }[tone];
            m.entry.img.animate(
              [
                { filter: "none" },
                { filter: `brightness(1.55) drop-shadow(0 0 7px rgba(${glow}, 0.95))`, offset: 0.2 },
                { filter: "none" }
              ],
              { duration: 460, delay: isDropped ? 20 : land }
            );
          }
        }
        if (m.promoteTo) {
          const swap = () => {
            m.entry.img.style.backgroundImage = this.pieceUrl(m.promoteTo);
            m.entry.el.classList.toggle("white", isWhitePiece(m.promoteTo));
            m.entry.el.classList.toggle("black", !isWhitePiece(m.promoteTo));
            if (this.canAnimate(m.entry.img)) {
              m.entry.img.animate(
                [
                  { transform: "scale(0.7)", filter: "brightness(2.2)" },
                  { transform: "scale(1.14)", filter: "brightness(1.3)", offset: 0.55 },
                  { transform: "none", filter: "none" }
                ],
                { duration: 380, easing: "cubic-bezier(0.25, 0.8, 0.3, 1)" }
              );
            }
          };
          if (doAnimate) setTimeout(swap, delay + duration);
          else swap();
        }
      });
      victims.forEach((item) => {
        const el = item.entry.el;
        if (!doAnimate) {
          el.remove();
          return;
        }
        // chi cattura: la mossa che arriva sulla casa del pezzo (o accanto, en passant)
        let hit = timings.get(item.square);
        if (!hit) {
          const v = squareToXY(item.square);
          const near = [...timings.entries()].find(([to]) => {
            const t = squareToXY(to);
            return t.file === v.file && Math.abs(t.rank - v.rank) === 1;
          });
          hit = near ? near[1] : null;
        }
        if (!hit || !single) {
          item.entry.img.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, fill: "forwards" });
          setTimeout(() => el.remove(), 240);
          return;
        }
        const v = squareToXY(item.square);
        const { x: ax } = this.squareOffset(hit.from);
        const { x: vx } = this.squareOffset(item.square);
        let dir = vx > ax ? 1 : vx < ax ? -1 : 0;
        if (!dir) dir = v.file >= 4 ? -1 : 1;
        const impact = hit.delay + hit.duration * 0.62;
        this.topple(item.entry, { delay: impact, dir });
        this.effect("slash", item.square, { delay: impact - 40, life: 520 });
        if (this.fxOn()) this.impactFx(item.square, impact - 30);
      });
      this.position = next;
    }

    /*
     * vm: {
     *   position, lastMove: {from,to}, check, selected, targets: [{square, capture}],
     *   arrows: [{from,to,color}], badge: {square, cls, icon}, marks: {square: cls},
     *   interactive, movable: "w" | "b" | null, animate
     * }
     */
    render(vm = {}) {
      this.vm = vm;
      this.root.classList.toggle("is-interactive", Boolean(vm.interactive));
      this.root.classList.toggle("is-premove", Boolean(vm.premove));
      const animate = vm.animate !== false;
      if (vm.position !== undefined) this.setPosition(vm.position, { animate });
      this.renderMarks();
      this.renderArrows();
      this.renderBadge();
      this.renderKingState(animate);
    }

    // Scacco: per un attimo la scacchiera diventa fredda, in bianco e nero, e solo
    // il re resta acceso di rosso (lo "sguardo" alla Classroom).
    coldFlash(square) {
      clearTimeout(this.coldTimer);
      this.root.classList.remove("bv-cold");
      void this.root.offsetWidth;
      this.root.classList.add("bv-cold");
      this.effect("aura", square, { delay: 180, life: 1300 });
      this.coldTimer = setTimeout(() => this.root.classList.remove("bv-cold"), 1050);
    }

    // Alone rosso fisso sotto il re scaccomattato (resta acceso anche in bianco e nero).
    renderAura(square) {
      let el = this.fxEl.querySelector(".bv-aura-fixed");
      if (!square || this.options.effects === false) {
        if (el) el.remove();
        return;
      }
      if (!el) {
        el = document.createElement("span");
        el.className = "bv-aura-fixed";
        this.fxEl.appendChild(el);
      }
      const { x, y } = this.squareOffset(square);
      el.style.left = `${x * 12.5}%`;
      el.style.top = `${y * 12.5}%`;
    }

    // Re sotto scacco: trema una volta. Re scaccomattato: cade e resta a terra.
    renderKingState(animate) {
      const vm = this.vm || {};
      const mated = vm.mated || null;
      this.pieceEls.forEach((entry, square) => {
        const fallen = square === mated;
        if (fallen && !entry.el.classList.contains("bv-fallen")) {
          const { x } = this.squareOffset(square);
          entry.el.style.setProperty("--bv-fall-dir", x >= 4 ? "-1" : "1");
          entry.el.classList.toggle("bv-fall-now", Boolean(animate) && !this.reducedMotion());
        }
        entry.el.classList.toggle("bv-fallen", fallen);
      });
      this.root.classList.toggle("bv-endcold", Boolean(mated) && this.options.effects !== false);
      this.renderAura(mated);
      const check = vm.check && !mated ? vm.check : null;
      if (check && check !== this.lastCheck && animate && this.fxOn()) this.coldFlash(check);
      if (check && check !== this.lastCheck && animate) {
        const entry = this.pieceEls.get(check);
        if (entry && this.canAnimate(entry.img)) {
          entry.img.animate(
            [
              { transform: "none" },
              { transform: "rotate(-6deg)" },
              { transform: "rotate(5deg)" },
              { transform: "rotate(-3.5deg)" },
              { transform: "rotate(2deg)" },
              { transform: "none" }
            ],
            { duration: 460, delay: 260, easing: "ease-in-out" }
          );
        }
      }
      this.lastCheck = check;
    }

    renderMarks() {
      const vm = this.vm || {};
      const targets = new Map((vm.targets || []).map((t) => [t.square, t]));
      const marks = vm.marks || {};
      this.pieceEls.forEach((entry, square) => entry.el.classList.toggle("bv-lifted", vm.selected === square));
      this.squareEls.forEach((el, square) => {
        el.classList.toggle("last-move", Boolean(vm.lastMove && (vm.lastMove.from === square || vm.lastMove.to === square)));
        el.classList.toggle("selected", vm.selected === square);
        el.classList.toggle("target", targets.has(square) && !targets.get(square).capture);
        el.classList.toggle("target-capture", targets.has(square) && Boolean(targets.get(square).capture));
        el.classList.toggle("in-check", vm.check === square);
        el.classList.toggle("mated", vm.mated === square);
        ["mark-good", "mark-bad", "mark-hint", "mark-premove"].forEach((cls) => el.classList.toggle(cls, marks[square] === cls.slice(5)));
      });
    }

    renderArrows() {
      const arrows = (this.vm && this.vm.arrows) || [];
      const center = (square) => {
        const { x, y } = this.squareOffset(square);
        return { x: x * 100 + 50, y: y * 100 + 50 };
      };
      const shapes = arrows.filter((a) => a && a.from && a.to && a.from !== a.to).map((arrow) => {
        const color = ARROW_COLORS[arrow.color] || arrow.color || ARROW_COLORS.green;
        const opacity = arrow.opacity || 0.82;
        const a = center(arrow.from);
        const b = center(arrow.to);
        const df = Math.abs(squareToXY(arrow.from).file - squareToXY(arrow.to).file);
        const dr = Math.abs(squareToXY(arrow.from).rank - squareToXY(arrow.to).rank);
        const isKnight = (df === 1 && dr === 2) || (df === 2 && dr === 1);
        // la freccia del cavallo fa la "L": prima il tratto lungo
        const points = isKnight
          ? (Math.abs(b.y - a.y) > Math.abs(b.x - a.x) ? [a, { x: a.x, y: b.y }, b] : [a, { x: b.x, y: a.y }, b])
          : [a, b];
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
        const head = 34;
        const tip = { x: last.x - Math.cos(angle) * 12, y: last.y - Math.sin(angle) * 12 };
        const base = { x: tip.x - Math.cos(angle) * head, y: tip.y - Math.sin(angle) * head };
        const shaftPoints = points.slice(0, -1).concat([base]);
        const start = shaftPoints[0];
        const startOffset = 18;
        const firstDir = Math.atan2(shaftPoints[1].y - start.y, shaftPoints[1].x - start.x);
        shaftPoints[0] = { x: start.x + Math.cos(firstDir) * startOffset, y: start.y + Math.sin(firstDir) * startOffset };
        const d = shaftPoints.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
        const left = { x: base.x + Math.cos(angle + Math.PI / 2) * 24, y: base.y + Math.sin(angle + Math.PI / 2) * 24 };
        const right = { x: base.x + Math.cos(angle - Math.PI / 2) * 24, y: base.y + Math.sin(angle - Math.PI / 2) * 24 };
        return `<g opacity="${opacity}"><path d="${d}" stroke="${color}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round" fill="none"/><polygon points="${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${left.x.toFixed(1)},${left.y.toFixed(1)} ${right.x.toFixed(1)},${right.y.toFixed(1)}" fill="${color}"/></g>`;
      });
      this.arrowsEl.innerHTML = shapes.join("");
    }

    renderBadge() {
      const badge = this.vm && this.vm.badge;
      let el = this.overlayEl.querySelector(".bv-badge");
      if (!badge || !badge.square) {
        if (el) el.remove();
        return;
      }
      if (!el) {
        el = document.createElement("span");
        this.overlayEl.appendChild(el);
      }
      const { x, y } = this.squareOffset(badge.square);
      el.className = `bv-badge ${badge.cls || ""}`;
      el.textContent = badge.icon || "";
      el.style.left = `${(x + 1) * 12.5}%`;
      el.style.top = `${y * 12.5}%`;
      el.title = badge.label || "";
    }

    flash(square, cls = "flash-bad", duration = 650) {
      const el = this.squareEls.get(square);
      if (!el) return;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), duration);
    }

    /* ------------------------------------------------------ interazione */

    squareFromPoint(clientX, clientY) {
      const rect = this.root.getBoundingClientRect();
      const col = Math.floor(((clientX - rect.left) / rect.width) * 8);
      const row = Math.floor(((clientY - rect.top) / rect.height) * 8);
      if (col < 0 || col > 7 || row < 0 || row > 7) return null;
      const file = this.options.orientation === "white" ? col : 7 - col;
      const rank = this.options.orientation === "white" ? 7 - row : row;
      return xyToSquare(file, rank);
    }

    handlePointerDown(event) {
      if (event.button !== undefined && event.button !== 0) return;
      Sound.unlock();
      if (!this.vm.interactive || this.promotionOpen) return;
      const square = this.squareFromPoint(event.clientX, event.clientY);
      if (!square) return;
      const wasSelected = this.vm.selected === square;
      const piece = this.position[square];
      const movable = this.vm.movable;
      const canGrab = piece && movable && (movable === "both" || (movable === "w") === isWhitePiece(piece));
      let grabbed = false;
      if (canGrab && typeof this.options.onPieceGrab === "function") grabbed = this.options.onPieceGrab(square) !== false;
      const entry = this.pieceEls.get(square);
      this.drag = {
        square,
        wasSelected,
        startX: event.clientX,
        startY: event.clientY,
        el: grabbed && entry ? entry.el : null,
        active: false,
        pointerId: event.pointerId
      };
      try {
        this.root.setPointerCapture(event.pointerId);
      } catch (error) {
        /* alcuni browser non supportano la cattura su touch */
      }
      const move = (e) => this.handlePointerMove(e);
      const up = (e) => {
        this.root.removeEventListener("pointermove", move);
        this.root.removeEventListener("pointerup", up);
        this.root.removeEventListener("pointercancel", up);
        this.handlePointerUp(e);
      };
      this.root.addEventListener("pointermove", move);
      this.root.addEventListener("pointerup", up);
      this.root.addEventListener("pointercancel", up);
      if (grabbed) event.preventDefault();
    }

    handlePointerMove(event) {
      const drag = this.drag;
      if (!drag || !drag.el) return;
      const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
      if (!drag.active && distance < 5) return;
      if (!drag.active) {
        (drag.el.getAnimations ? drag.el.getAnimations() : []).forEach((anim) => anim.cancel());
        drag.el.classList.add("bv-dragging");
      }
      drag.active = true;
      const rect = this.root.getBoundingClientRect();
      const size = rect.width / 8;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size * 0.62;
      drag.el.style.transform = `translate(${x}px, ${y}px)`;
      const over = this.squareFromPoint(event.clientX, event.clientY);
      this.squareEls.forEach((el, sq) => el.classList.toggle("drag-over", sq === over));
    }

    handlePointerUp(event) {
      const drag = this.drag;
      this.drag = null;
      if (!drag) return;
      this.squareEls.forEach((el) => el.classList.remove("drag-over"));
      const target = this.squareFromPoint(event.clientX, event.clientY);
      if (drag.el) drag.el.classList.remove("bv-dragging");
      if (drag.active) {
        if (target && target !== drag.square && typeof this.options.onDrop === "function") {
          // il pezzo parte gia' dalla posizione del puntatore: si posa sulla casa
          this.justDropped = drag.el;
          try {
            this.options.onDrop(drag.square, target);
          } finally {
            this.justDropped = null;
          }
        }
        // mossa non fatta (illegale o in attesa della promozione): torna a casa
        const el = drag.el;
        if (el && el.isConnected && !el.classList.contains("bv-moving")) this.placeEl(el, el.dataset.square, true, { duration: 170 });
        return;
      }
      if (target && typeof this.options.onSquareTap === "function") {
        this.options.onSquareTap(target, { wasSelected: drag.wasSelected && target === drag.square });
      }
    }

    // Chiude una scelta di promozione aperta (come se l'utente annullasse).
    cancelPromotion() {
      if (this.promotionCancel) this.promotionCancel();
    }

    // Scelta del pezzo di promozione: restituisce "q" | "r" | "b" | "n" | null.
    choosePromotion(square, color) {
      this.cancelPromotion();
      return new Promise((resolve) => {
        this.promotionOpen = true;
        const { x, y } = this.squareOffset(square);
        const down = y === 0;
        const panel = document.createElement("div");
        panel.className = "bv-promo";
        const shade = document.createElement("div");
        shade.className = "bv-promo-shade";
        const finish = (value) => {
          if (this.promotionCancel !== cancel) return;
          this.promotionOpen = false;
          this.promotionCancel = null;
          panel.remove();
          shade.remove();
          resolve(value);
        };
        const cancel = () => finish(null);
        this.promotionCancel = cancel;
        ["q", "n", "r", "b"].forEach((type, index) => {
          const button = document.createElement("button");
          button.type = "button";
          const piece = color === "w" ? type.toUpperCase() : type;
          button.className = "bv-promo-piece";
          button.style.left = `${x * 12.5}%`;
          button.style.top = `${(down ? y + index : y - index) * 12.5}%`;
          button.style.backgroundImage = this.pieceUrl(piece);
          button.setAttribute("aria-label", { q: "Donna", n: "Cavallo", r: "Torre", b: "Alfiere" }[type]);
          button.addEventListener("click", (event) => {
            event.stopPropagation();
            finish(type);
          });
          panel.appendChild(button);
        });
        shade.addEventListener("click", () => finish(null));
        this.overlayEl.append(shade, panel);
      });
    }
  }

  return {
    BoardView,
    Sound,
    PIECE_SETS,
    DEFAULT_SET,
    pieceSrc,
    BOARD_THEMES,
    ARROW_COLORS,
    FILES,
    normalizePosition,
    fenToPosition,
    squareToXY,
    xyToSquare
  };
});
