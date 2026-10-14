/*
 * Progetto A - Scacchi: scacchiera interattiva riutilizzabile.
 *
 * Una sola scacchiera per partita, revisione, lezioni ed esercizi:
 *  - pezzi SVG (set di lichess, vedi assets/pieces/LICENSE.md)
 *  - mosse animate: i pezzi scivolano dalla casa di partenza a quella di arrivo
 *    (anche andando avanti e indietro nella revisione)
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

  const PIECE_SETS = {
    staunty: { label: "Staunty", author: "sadsnake1", license: "CC BY-NC-SA 4.0" },
    maestro: { label: "Maestro", author: "sadsnake1", license: "CC BY-NC-SA 4.0" },
    california: { label: "California", author: "Jerry S.", license: "CC BY-NC-SA 4.0" },
    cburnett: { label: "Classico", author: "Colin M.L. Burnett", license: "GPLv2+" }
  };

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
    return `${isWhitePiece(piece) ? "w" : "b"}${piece.toUpperCase()}`;
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
        pieceSet: "staunty",
        theme: "accademia",
        orientation: "white",
        coordinates: true,
        animationMs: 190,
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
      const pieces = document.createElement("div");
      pieces.className = "bv-pieces";
      const overlay = document.createElement("div");
      overlay.className = "bv-overlay";
      root.append(squares, arrows, pieces, overlay);
      this.container.innerHTML = "";
      this.container.appendChild(root);
      this.root = root;
      this.squaresEl = squares;
      this.arrowsEl = arrows;
      this.piecesEl = pieces;
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
          entry.el.style.backgroundImage = this.pieceUrl(entry.piece);
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
      this.root.dataset.theme = this.options.theme;
    }

    reducedMotion() {
      return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    pieceUrl(piece) {
      return `url("${this.options.piecePath}/${this.options.pieceSet}/${pieceCode(piece)}.svg")`;
    }

    squareOffset(square) {
      const { file, rank } = squareToXY(square);
      const x = this.options.orientation === "white" ? file : 7 - file;
      const y = this.options.orientation === "white" ? 7 - rank : rank;
      return { x, y };
    }

    placeEl(el, square, animate) {
      const { x, y } = this.squareOffset(square);
      el.dataset.square = square;
      if (!animate) {
        el.classList.add("bv-no-anim");
        el.style.transform = `translate(${x * 100}%, ${y * 100}%)`;
        // forza il reflow prima di riattivare la transizione
        void el.offsetWidth;
        el.classList.remove("bv-no-anim");
      } else {
        el.style.transform = `translate(${x * 100}%, ${y * 100}%)`;
      }
    }

    createPieceEl(piece, square, fadeIn) {
      const el = document.createElement("div");
      el.className = `bv-piece ${isWhitePiece(piece) ? "white" : "black"}`;
      el.style.backgroundImage = this.pieceUrl(piece);
      el.dataset.piece = piece;
      this.placeEl(el, square, false);
      if (fadeIn) {
        el.classList.add("bv-fade");
        requestAnimationFrame(() => el.classList.remove("bv-fade"));
      }
      this.piecesEl.appendChild(el);
      return el;
    }

    /*
     * Aggiorna i pezzi confrontando la posizione vecchia con la nuova:
     * i pezzi spariti da una casa e comparsi in un'altra (stesso tipo) scivolano,
     * quelli catturati svaniscono, quelli nuovi (promozione) compaiono.
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
          this.placeEl(item.entry.el, square, doAnimate);
          if (doAnimate) {
            item.entry.el.classList.add("bv-moving");
            setTimeout(() => item.entry.el.classList.remove("bv-moving"), this.options.animationMs + 40);
          }
          this.pieceEls.set(square, item.entry);
        } else {
          this.pieceEls.set(square, { piece, el: this.createPieceEl(piece, square, doAnimate) });
        }
      });
      removed.forEach((item) => {
        if (item.used) return;
        const el = item.entry.el;
        if (doAnimate) {
          el.classList.add("bv-captured");
          setTimeout(() => el.remove(), this.options.animationMs + 60);
        } else {
          el.remove();
        }
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
      if (vm.position !== undefined) this.setPosition(vm.position, { animate: vm.animate !== false });
      this.renderMarks();
      this.renderArrows();
      this.renderBadge();
    }

    renderMarks() {
      const vm = this.vm || {};
      const targets = new Map((vm.targets || []).map((t) => [t.square, t]));
      const marks = vm.marks || {};
      this.squareEls.forEach((el, square) => {
        el.classList.toggle("last-move", Boolean(vm.lastMove && (vm.lastMove.from === square || vm.lastMove.to === square)));
        el.classList.toggle("selected", vm.selected === square);
        el.classList.toggle("target", targets.has(square) && !targets.get(square).capture);
        el.classList.toggle("target-capture", targets.has(square) && Boolean(targets.get(square).capture));
        el.classList.toggle("in-check", vm.check === square);
        ["mark-good", "mark-bad", "mark-hint"].forEach((cls) => el.classList.toggle(cls, marks[square] === cls.slice(5)));
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
      drag.active = true;
      const rect = this.root.getBoundingClientRect();
      const size = rect.width / 8;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      drag.el.classList.add("bv-dragging", "bv-no-anim");
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
      if (drag.el) {
        drag.el.classList.remove("bv-dragging");
        drag.el.classList.remove("bv-no-anim");
      }
      if (drag.active) {
        if (target && target !== drag.square && typeof this.options.onDrop === "function") {
          // il pezzo parte gia' dalla posizione del puntatore: niente doppia animazione
          this.options.onDrop(drag.square, target);
        }
        // riporta il pezzo trascinato sulla sua casa (quella vecchia o quella nuova)
        if (drag.el && drag.el.isConnected) this.placeEl(drag.el, drag.el.dataset.square, true);
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
    BOARD_THEMES,
    ARROW_COLORS,
    FILES,
    normalizePosition,
    fenToPosition,
    squareToXY,
    xyToSquare
  };
});
