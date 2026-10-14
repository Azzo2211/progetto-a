/*
 * Progetto A - Scacchi: esercizi sulla scacchiera principale.
 *
 * Un esercizio: { id, fen, setup, solution, accept, prompt, explanation,
 * rating, themes, source }.
 *  - setup: mossa dell'avversario da animare prima (formato puzzle Lichess)
 *  - solution: mosse in UCI, alternate: tua, risposta, tua...
 *  - accept: mosse alternative accettate per la prima mossa
 * Ogni ultima mossa che da' scacco matto e' accettata anche se diversa.
 */
(function (root) {
  "use strict";

  const COLOR_NAME = { w: "Bianco", b: "Nero" };

  class Trainer {
    constructor(boardView, hooks = {}) {
      this.view = boardView;
      this.hooks = hooks; // onUpdate(state), onDone(result), canRender()
      this.active = null;
      this.example = null;
      this.orientation = "white";
      this.pendingRevert = null;
      this.setupTimer = null;
    }

    // La scacchiera e' condivisa con la partita: disegniamo solo quando e' nostra.
    canRender() {
      return typeof this.hooks.canRender === "function" ? this.hooks.canRender() : true;
    }

    draw(vm) {
      if (!this.canRender()) return;
      const current = this.view.options ? this.view.options.orientation : null;
      if (current !== this.orientation) this.view.setOptions({ orientation: this.orientation });
      this.view.render(vm);
    }

    isActive() {
      return Boolean(this.active || this.example);
    }

    stop() {
      this.clearTimers();
      this.pendingRevert = null;
      this.setupTimer = null;
      this.active = null;
      this.example = null;
    }

    clearTimers() {
      (this.timers || []).forEach((t) => clearTimeout(t));
      this.timers = [];
    }

    later(fn, ms) {
      if (!this.timers) this.timers = [];
      const t = setTimeout(fn, ms);
      this.timers.push(t);
      return t;
    }

    /* --------------------------------------------------- esempio guidato */

    showExample(example) {
      this.stop();
      const chess = new root.Chess(example.fen);
      this.example = { data: example, step: 0, chess, positions: [example.fen], lastMoves: [null] };
      // Prepara tutte le posizioni per andare avanti e indietro.
      example.steps.forEach((step) => {
        if (!step.move) {
          this.example.positions.push(chess.fen());
          this.example.lastMoves.push(this.example.lastMoves[this.example.lastMoves.length - 1]);
          return;
        }
        const move = root.ChessAnalysis.applyUci(chess, step.move);
        this.example.positions.push(chess.fen());
        this.example.lastMoves.push(move ? { from: move.from, to: move.to, san: move.san, captured: Boolean(move.captured) } : null);
      });
      this.orientation = example.orientation || "white";
      this.renderExample(false);
    }

    exampleStep(delta) {
      const ex = this.example;
      if (!ex) return;
      const next = Math.max(0, Math.min(ex.data.steps.length, ex.step + delta));
      if (next === ex.step) return;
      ex.step = next;
      const last = ex.lastMoves[ex.step];
      if (delta > 0 && last && ex.data.steps[ex.step - 1] && ex.data.steps[ex.step - 1].move) {
        root.ChessBoardKit.Sound.play(last.captured ? "capture" : "move");
      }
      this.renderExample(true);
    }

    renderExample(animate) {
      const ex = this.example;
      const index = ex.step;
      const step = index > 0 ? ex.data.steps[index - 1] : null;
      const intro = index === 0 && ex.data.steps[0] && !ex.data.steps[0].move ? ex.data.steps[0] : null;
      const shown = step || intro;
      const chess = new root.Chess(ex.positions[index]);
      const checkSquare = chess.isCheck() ? findKing(chess, chess.turn()) : null;
      this.draw({
        position: ex.positions[index],
        lastMove: ex.lastMoves[index],
        check: checkSquare,
        mated: chess.isCheckmate() ? checkSquare : null,
        arrows: (shown && shown.arrows) || [],
        marks: (shown && shown.marks) || {},
        interactive: false,
        animate
      });
      this.emit({
        kind: "example",
        step: index,
        total: ex.data.steps.length,
        text: shown ? shown.text : "",
        atEnd: index >= ex.data.steps.length
      });
    }

    /* --------------------------------------------------------- esercizi */

    start(exercise) {
      this.stop();
      const chess = new root.Chess(exercise.fen);
      const state = {
        exercise,
        chess,
        step: 0,
        failed: false,
        hintLevel: 0,
        solutionShown: false,
        finished: false,
        wrongMoves: 0,
        playerColor: null,
        lastMove: null,
        selected: null,
        arrows: [],
        marks: {},
        badge: null,
        message: exercise.prompt || ""
      };
      this.active = state;
      if (exercise.setup) {
        const color = chess.turn() === "w" ? "b" : "w";
        state.playerColor = color;
      } else {
        state.playerColor = chess.turn();
      }
      this.orientation = state.playerColor === "w" ? "white" : "black";
      this.render(false);
      if (exercise.setup) this.setupTimer = this.later(() => this.playSetup(state), 650);
      this.emit({ kind: "start" });
    }

    // Mossa iniziale dell'avversario (puzzle Lichess).
    playSetup(state) {
      if (this.active !== state || state.setupDone || !state.exercise.setup) return;
      clearTimeout(this.setupTimer);
      this.setupTimer = null;
      state.setupDone = true;
      const move = root.ChessAnalysis.applyUci(state.chess, state.exercise.setup);
      if (move) {
        state.lastMove = { from: move.from, to: move.to };
        root.ChessBoardKit.Sound.play(move.captured ? "capture" : state.chess.isCheck() ? "check" : "move");
      }
      this.render(true);
    }

    // Se una mossa sbagliata sta per essere annullata, la annulliamo subito.
    flushRevert() {
      const pending = this.pendingRevert;
      if (!pending) return;
      this.pendingRevert = null;
      clearTimeout(pending.timer);
      pending.apply();
    }

    expectedMove() {
      const s = this.active;
      return s ? s.exercise.solution[s.step] : null;
    }

    isPlayerTurn() {
      const s = this.active;
      return Boolean(s && !s.finished && !this.pendingRevert && s.chess.turn() === s.playerColor && (!s.exercise.setup || s.setupDone));
    }

    legalTargets(square) {
      const s = this.active;
      if (!s) return [];
      return s.chess.moves({ square, verbose: true }).map((m) => ({ square: m.to, capture: Boolean(m.captured), promotion: m.promotion }));
    }

    handleGrab(square) {
      const s = this.active;
      if (!this.isPlayerTurn()) return false;
      const piece = s.chess.get(square);
      if (!piece || piece.color !== s.playerColor) return false;
      s.selected = square;
      this.render(false);
      return true;
    }

    handleTap(square, { wasSelected } = {}) {
      const s = this.active;
      if (!this.isPlayerTurn()) return;
      if (s.selected && s.selected !== square) {
        const target = this.legalTargets(s.selected).find((t) => t.square === square);
        if (target) {
          this.tryMove(s.selected, square);
          return;
        }
      }
      const piece = s.chess.get(square);
      if (piece && piece.color === s.playerColor) {
        s.selected = wasSelected ? null : square;
      } else {
        s.selected = null;
      }
      this.render(false);
    }

    handleDrop(from, to) {
      if (!this.isPlayerTurn()) return;
      this.tryMove(from, to);
    }

    async tryMove(from, to) {
      const s = this.active;
      this.flushRevert();
      const legal = s.chess.moves({ square: from, verbose: true }).filter((m) => m.to === to);
      if (!legal.length) {
        s.selected = null;
        this.render(false);
        return;
      }
      let promotion = null;
      if (legal[0].promotion) {
        const expected = this.expectedMove();
        promotion = await this.view.choosePromotion(to, s.playerColor);
        if (!promotion) {
          this.render(false);
          return;
        }
        if (this.active !== s) return;
        if (!expected) promotion = promotion || "q";
      }
      const uci = `${from}${to}${promotion || ""}`;
      const expected = this.expectedMove();
      const probe = new root.Chess(s.chess.fen());
      const probeMove = root.ChessAnalysis.applyUci(probe, uci);
      const isLast = s.step >= s.exercise.solution.length - 1;
      const matches = expected && (uci === expected || uci.slice(0, 4) === expected && (!expected[4] || expected[4] === (promotion || "q")));
      const accepted = s.step === 0 && Array.isArray(s.exercise.accept) && s.exercise.accept.includes(uci.slice(0, 4));
      const mateFinish = isLast && probe.isCheckmate();
      s.selected = null;
      if (matches || accepted || mateFinish) {
        const move = root.ChessAnalysis.applyUci(s.chess, probeMove ? probeMove.lan : uci);
        s.lastMove = { from: move.from, to: move.to };
        s.badge = { square: move.to, cls: "correct", icon: "✓" };
        s.marks = {};
        s.arrows = [];
        root.ChessBoardKit.Sound.play(move.captured ? "capture" : s.chess.isCheck() ? "check" : "move");
        s.step += 1;
        // Mossa alternativa accettata: l'esercizio finisce qui.
        if (accepted && !matches) s.step = s.exercise.solution.length;
        this.render(true);
        if (s.step >= s.exercise.solution.length) {
          this.finish(true);
          return;
        }
        this.emit({ kind: "progress", text: "Giusto. Continua." });
        this.later(() => this.playReply(s), 520);
        return;
      }
      // Mossa sbagliata: la mostriamo un attimo, poi torniamo indietro.
      s.failed = true;
      s.wrongMoves += 1;
      root.ChessBoardKit.Sound.play("error");
      const before = s.chess.fen();
      const lastBefore = s.lastMove;
      const revert = () => {
        if (this.active !== s) return;
        s.chess.load(before);
        s.lastMove = lastBefore;
        s.badge = null;
        this.render(true);
      };
      if (probeMove) {
        this.draw({ ...this.vm(), position: probe.fen(), lastMove: { from: probeMove.from, to: probeMove.to }, badge: { square: probeMove.to, cls: "wrong", icon: "✕" }, interactive: false, animate: true });
      }
      this.pendingRevert = { apply: revert, timer: null };
      this.pendingRevert.timer = this.later(() => {
        if (!this.pendingRevert || this.pendingRevert.apply !== revert) return;
        this.pendingRevert = null;
        revert();
      }, 750);
      this.emit({ kind: "wrong", text: "Non e' la mossa giusta. Riprova: cerca scacchi, catture e minacce." });
    }

    playReply(s) {
      if (this.active !== s || s.finished) return;
      const reply = s.exercise.solution[s.step];
      if (!reply) return;
      const move = root.ChessAnalysis.applyUci(s.chess, reply);
      if (move) {
        s.lastMove = { from: move.from, to: move.to };
        root.ChessBoardKit.Sound.play(move.captured ? "capture" : s.chess.isCheck() ? "check" : "move");
      }
      s.badge = null;
      s.step += 1;
      this.render(true);
      if (s.step >= s.exercise.solution.length) this.finish(!s.failed);
    }

    hint() {
      const s = this.active;
      this.flushRevert();
      if (s && !s.setupDone && s.exercise.setup) this.playSetup(s);
      if (!s || s.finished || !this.isPlayerTurn()) return;
      const expected = this.expectedMove();
      if (!expected) return;
      s.hintLevel += 1;
      s.failed = true;
      if (s.hintLevel === 1) {
        s.marks = { [expected.slice(0, 2)]: "hint" };
        this.emit({ kind: "hint", text: "Il pezzo da muovere e' evidenziato." });
      } else {
        s.marks = { [expected.slice(0, 2)]: "hint" };
        s.arrows = [{ from: expected.slice(0, 2), to: expected.slice(2, 4), color: "blue" }];
        this.emit({ kind: "hint", text: "Ecco la mossa: giocala sulla scacchiera." });
      }
      this.render(false);
    }

    showSolution() {
      const s = this.active;
      if (!s || s.finished) return;
      this.flushRevert();
      if (!s.setupDone && s.exercise.setup) this.playSetup(s);
      s.failed = true;
      s.solutionShown = true;
      this.emit({ kind: "solution" });
      const run = () => {
        if (this.active !== s || s.step >= s.exercise.solution.length) {
          if (this.active === s) this.finish(false);
          return;
        }
        const uci = s.exercise.solution[s.step];
        const move = root.ChessAnalysis.applyUci(s.chess, uci);
        if (move) {
          s.lastMove = { from: move.from, to: move.to };
          s.arrows = [];
          root.ChessBoardKit.Sound.play(move.captured ? "capture" : "move");
        }
        s.step += 1;
        this.render(true);
        this.later(run, 700);
      };
      if (!this.isPlayerTurn()) {
        this.later(run, 300);
        return;
      }
      run();
    }

    retry() {
      const s = this.active;
      if (!s) return;
      this.flushRevert();
      const exercise = s.exercise;
      this.start({ ...exercise, retry: true });
      this.active.failed = true;
    }

    finish(solved) {
      const s = this.active;
      if (!s || s.finished) return;
      s.finished = true;
      const clean = solved && !s.failed;
      root.ChessBoardKit.Sound.play(clean ? "success" : solved ? "move" : "error");
      this.render(false);
      const result = { solved: clean, completedLine: solved, exercise: s.exercise, wrongMoves: s.wrongMoves, hints: s.hintLevel, solutionShown: s.solutionShown };
      if (typeof this.hooks.onDone === "function") this.hooks.onDone(result);
      this.emit({ kind: "done", result });
    }

    vm() {
      const s = this.active;
      const chess = s.chess;
      const checkSquare = chess.isCheck() ? findKing(chess, chess.turn()) : null;
      return {
        position: chess.fen(),
        lastMove: s.lastMove,
        check: checkSquare,
        mated: chess.isCheckmate() ? checkSquare : null,
        selected: s.selected,
        targets: s.selected ? this.legalTargets(s.selected) : [],
        arrows: s.arrows,
        marks: s.marks,
        badge: s.badge,
        interactive: this.isPlayerTurn(),
        movable: s.playerColor
      };
    }

    render(animate) {
      if (this.example) {
        this.renderExample(animate);
        return;
      }
      if (!this.active) return;
      this.draw({ ...this.vm(), animate });
      this.emit({ kind: "render" });
    }

    emit(event) {
      if (typeof this.hooks.onUpdate === "function") this.hooks.onUpdate(event, this.active, this.example);
    }

    describe() {
      const s = this.active;
      if (!s) return null;
      return {
        playerColor: s.playerColor,
        colorName: COLOR_NAME[s.playerColor],
        step: s.step,
        total: s.exercise.solution.length,
        finished: s.finished,
        failed: s.failed
      };
    }
  }

  function findKing(chess, color) {
    const board = chess.board();
    for (const row of board) {
      for (const cell of row) {
        if (cell && cell.type === "k" && cell.color === color) return cell.square;
      }
    }
    return null;
  }

  root.ChessTrainerKit = { Trainer };
})(typeof window !== "undefined" ? window : globalThis);
