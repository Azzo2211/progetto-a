/*
 * Progetto A - Scacchi: interfaccia della pagina (scacchiera, schede, avversario,
 * barre dei giocatori, coach). Usa le variabili globali della partita definite
 * in app.js (board, currentGame, state...) e la scacchiera di board-view.js.
 */
(function () {
  "use strict";

  const Kit = window.ChessBoardKit;
  const PIECE_SET_VERSION = 3;
  const UI_DEFAULTS = { theme: "accademia", pieceSet: "cote", effects: true, sound: true, coords: true, evalBarInGame: false, orientation: "white" };

  // Mentori: uno per grado. Il coach e' legato al TUO grado, non al bot.
  const MENTORS = {
    E: { name: "Kikyo Kushida", role: "Coach dei principianti", cls: "Classe D", image: "assets/cote/kushida.webp", letter: "K" },
    D: { name: "Suzune Horikita", role: "Disciplina e fondamentali", cls: "Classe D", image: "assets/cote/horikita.webp", letter: "H" },
    C: { name: "Kakeru Ryuen", role: "Tattica e pressione", cls: "Classe C", image: "assets/cote/ryuen.webp", letter: "R" },
    B: { name: "Kakeru Ryuen", role: "Calcolo e aggressivita'", cls: "Classe C", image: "assets/cote/ryuen.webp", letter: "R" },
    A: { name: "Arisu Sakayanagi", role: "Strategia e calcolo", cls: "Classe A", image: "assets/cote/sakayanagi.webp", letter: "S" },
    S: { name: "Kiyotaka Ayanokoji", role: "Analisi d'elite", cls: "White Room", image: "assets/cote/ayanokoji.webp", letter: "A" }
  };

  let view = null;
  let currentTab = "play";
  let showBestArrow = false;
  let hintState = null; // { fen, uci, level }
  let coachWarning = null; // avviso del coach che ferma il bot
  let premove = null; // premossa: { from, to, gameId, ply } giocata appena tocca a te
  let preSel = null; // pezzo scelto per la premossa mentre il bot pensa

  /* ------------------------------------------------------------ impostazioni */

  function ui() {
    if (!state.chess.ui || typeof state.chess.ui !== "object") state.chess.ui = { ...UI_DEFAULTS };
    state.chess.ui = { ...UI_DEFAULTS, ...state.chess.ui };
    // Una sola volta per ogni nuovo set predefinito: passa al nuovo set (poi
    // resta la scelta dell'utente). Il numero NON deve stare nei default di
    // app.js, altrimenti mergeDefaults lo aggiunge ai salvataggi vecchi.
    if ((Number(state.chess.ui.setVersion) || 0) < PIECE_SET_VERSION) {
      state.chess.ui.pieceSet = Kit.DEFAULT_SET;
      state.chess.ui.setVersion = PIECE_SET_VERSION;
      delete state.chess.ui.eliteSet;
      if (typeof saveState === "function") setTimeout(saveState, 0);
    }
    if (!Kit.PIECE_SETS[state.chess.ui.pieceSet]) state.chess.ui.pieceSet = Kit.DEFAULT_SET;
    return state.chess.ui;
  }

  function pieceImg(code, set = ui().pieceSet) {
    return Kit.pieceSrc(set, code);
  }

  function chessMode() {
    return state.chess.mode === "training" ? "training" : "rated";
  }

  function isRatedGame() {
    return Boolean(currentGame && currentGame.rated);
  }

  /* --------------------------------------------------------------- scacchiera */

  window.getBoardView = function getBoardView() {
    if (view) return view;
    const container = document.getElementById("chessBoard");
    const settings = ui();
    view = new Kit.BoardView(container, {
      pieceSet: settings.pieceSet,
      theme: settings.theme,
      coordinates: settings.coords,
      effects: settings.effects !== false,
      orientation: "white",
      onPieceGrab: (square) => (trainerOwnsBoard() ? window.ChessLearn.trainer.handleGrab(square) : gameGrab(square)),
      onSquareTap: (square, info) => (trainerOwnsBoard() ? window.ChessLearn.trainer.handleTap(square, info) : gameTap(square, info)),
      onDrop: (from, to) => (trainerOwnsBoard() ? window.ChessLearn.trainer.handleDrop(from, to) : gameDrop(from, to))
    });
    Kit.Sound.enabled = settings.sound !== false;
    return view;
  };

  function trainerOwnsBoard() {
    return Boolean(window.ChessLearn && window.ChessLearn.ownsBoard());
  }
  window.chessTrainerOwnsBoard = trainerOwnsBoard;

  function squareToRC(square) {
    return { row: 8 - Number(square[1]), col: square.charCodeAt(0) - 97 };
  }

  function gameInteractive() {
    return !reviewBoard && !chessGameOver && !isBotTurn() && !coachWarning;
  }

  /* ------------------------------------------------------------ premosse */
  // Mentre il bot pensa puoi preparare la tua mossa: si gioca da sola appena tocca a te,
  // se e' ancora legale (altrimenti si annulla). Una premossa alla volta, come su lichess.
  function premoveMode() {
    return !reviewBoard && !chessGameOver && isBotTurn() && !coachWarning && !trainerOwnsBoard();
  }

  // Valida finche' e' la stessa partita: durante il turno del bot, o subito dopo la sua mossa
  // (in attesa di essere giocata). Una ripresa o una partita nuova la annullano.
  function premoveValid() {
    if (!premove || premove.gameId !== currentGame.id) return false;
    const len = currentGame.moves.length;
    return premove.ply === len || (premove.ply === len - 1 && !isBotTurn());
  }

  // Case raggiungibili "a scacchiera vuota": il bot deve ancora muovere, quindi non si sa
  // cosa sara' libero o catturabile. Alla fine conta solo se la mossa e' legale in quel momento.
  function premoveTargets(square) {
    const { row, col } = squareToRC(square);
    const piece = board[row][col];
    if (!piece || !isWhite(piece)) return [];
    const out = [];
    const add = (r, c) => { if (r >= 0 && r < 8 && c >= 0 && c < 8 && !(r === row && c === col)) out.push(coord(r, c)); };
    const kind = piece.toLowerCase();
    if (kind === "p") {
      add(row - 1, col);
      if (row === 6) add(row - 2, col);
      add(row - 1, col - 1);
      add(row - 1, col + 1);
    } else if (kind === "n") {
      [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(([dr, dc]) => add(row + dr, col + dc));
    } else if (kind === "k") {
      for (let dr = -1; dr <= 1; dr += 1) for (let dc = -1; dc <= 1; dc += 1) if (dr || dc) add(row + dr, col + dc);
      if (row === 7 && col === 4) {
        if (board[7][7] === "R") add(7, 6);
        if (board[7][0] === "R") add(7, 2);
      }
    } else {
      const dirs = kind === "r" ? [[1, 0], [-1, 0], [0, 1], [0, -1]] : kind === "b" ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
      dirs.forEach(([dr, dc]) => { for (let k = 1; k < 8; k += 1) add(row + dr * k, col + dc * k); });
    }
    return [...new Set(out)];
  }

  function setPremove(from, to) {
    premove = { from, to, gameId: currentGame.id, ply: currentGame.moves.length };
    preSel = null;
    Kit.Sound.play("premove");
    renderBoard({ animate: false });
  }

  function clearPremove(render = true) {
    const had = premove || preSel;
    premove = null;
    preSel = null;
    if (had && render) renderBoard({ animate: false });
  }
  window.chessClearPremove = () => clearPremove(true);

  function premoveGrab(square) {
    const { row, col } = squareToRC(square);
    const piece = board[row][col];
    if (!piece || !isWhite(piece)) return false;
    preSel = square;
    renderBoard({ animate: false });
    return true;
  }

  function premoveTap(square, { wasSelected } = {}) {
    if (preSel && preSel !== square && premoveTargets(preSel).includes(square)) {
      setPremove(preSel, square);
      return;
    }
    const { row, col } = squareToRC(square);
    const piece = board[row][col];
    if (piece && isWhite(piece) && !wasSelected) {
      preSel = square;
      renderBoard({ animate: false });
      return;
    }
    // tocco altrove: annulla la scelta e la premossa
    clearPremove(true);
    renderBoard({ animate: false });
  }

  function premoveDrop(from, to) {
    if (premoveTargets(from).includes(to)) setPremove(from, to);
    else { preSel = from; renderBoard({ animate: false }); }
  }

  // Cosa mostrare sulla scacchiera durante il turno del bot (chiamata da renderBoard).
  window.chessPremoveView = function chessPremoveView() {
    if (premove && !premoveValid()) premove = null;
    if (!premoveMode()) { preSel = null; return premove ? { marks: { [premove.from]: "premove", [premove.to]: "premove" }, selected: null, targets: [], active: false } : null; }
    const marks = premove ? { [premove.from]: "premove", [premove.to]: "premove" } : {};
    const targets = preSel ? premoveTargets(preSel).map((sq) => ({ square: sq, capture: false })) : [];
    return { marks, selected: preSel, targets, active: true, pending: Boolean(premove) };
  };

  // Dopo la mossa del bot: gioca la premossa se e' legale, altrimenti la annulla.
  window.chessTryPremove = function chessTryPremove() {
    if (!premove) return;
    const p = premove;
    premove = null;
    preSel = null;
    if (p.gameId !== currentGame.id || p.ply !== currentGame.moves.length - 1 || !gameInteractive()) { renderBoard({ animate: false }); return; }
    const a = squareToRC(p.from);
    const b = squareToRC(p.to);
    const move = getLegalMoves(board, a.row, a.col).find((m) => m.toRow === b.row && m.toCol === b.col);
    if (!move || !board[a.row][a.col] || !isWhite(board[a.row][a.col])) {
      Kit.Sound.play("error");
      renderBoard({ animate: false });
      const turn = document.getElementById("turnStatus");
      if (turn) turn.textContent = "Premossa annullata: non era più legale";
      return;
    }
    const piece = board[move.fromRow][move.fromCol];
    // premossa di promozione: donna automatica (niente finestra di scelta)
    const final = piece === "P" && move.toRow === 0 ? { ...move, promotion: "q" } : move;
    window.setTimeout(() => {
      if (!gameInteractive() || currentGame.moves.length !== p.ply + 1) return;
      hintState = null;
      makePlayerMove(final);
    }, 120);
  };

  function gameGrab(square) {
    if (premoveMode()) return premoveGrab(square);
    if (!gameInteractive()) return false;
    const { row, col } = squareToRC(square);
    const piece = board[row][col];
    if (!piece || !isWhite(piece)) return false;
    selectedSquare = { row, col };
    renderBoard({ animate: false });
    return true;
  }

  function gameTap(square, { wasSelected } = {}) {
    if (premoveMode()) { premoveTap(square, { wasSelected }); return; }
    if (!gameInteractive()) return;
    const { row, col } = squareToRC(square);
    if (selectedSquare && (selectedSquare.row !== row || selectedSquare.col !== col)) {
      const move = getLegalMoves(board, selectedSquare.row, selectedSquare.col).find((m) => m.toRow === row && m.toCol === col);
      if (move) {
        attemptPlayerMove(move);
        return;
      }
    }
    const piece = board[row][col];
    selectedSquare = piece && isWhite(piece) && !wasSelected ? { row, col } : null;
    renderBoard({ animate: false });
  }

  function gameDrop(from, to) {
    if (premoveMode()) { premoveDrop(from, to); return; }
    if (!gameInteractive()) return;
    const a = squareToRC(from);
    const b = squareToRC(to);
    const move = getLegalMoves(board, a.row, a.col).find((m) => m.toRow === b.row && m.toCol === b.col);
    if (move) attemptPlayerMove(move);
    else {
      selectedSquare = { row: a.row, col: a.col };
      renderBoard({ animate: false });
    }
  }

  async function attemptPlayerMove(move) {
    const piece = board[move.fromRow][move.fromCol];
    if (piece === "P" && move.toRow === 0) {
      const gameId = currentGame.id;
      const ply = currentGame.moves.length;
      const promotion = await getBoardView().choosePromotion(coord(move.toRow, move.toCol), "w");
      // La partita puo' essere cambiata mentre la scelta era aperta.
      const unchanged = currentGame.id === gameId && currentGame.moves.length === ply && board[move.fromRow][move.fromCol] === "P" && gameInteractive();
      if (!promotion || !unchanged) {
        renderBoard({ animate: false });
        return;
      }
      move = { ...move, promotion };
    }
    hintState = null;
    makePlayerMove(move);
  }

  // Suoni della mossa in base alla notazione.
  window.playMoveSound = function playMoveSound(record) {
    if (!record) return;
    const san = record.san || "";
    if (san.includes("#")) Kit.Sound.play("check");
    else if (san.includes("+")) Kit.Sound.play("check");
    else if (san.startsWith("O-O")) Kit.Sound.play("castle");
    else if (san.includes("x")) Kit.Sound.play("capture");
    else Kit.Sound.play("move");
  };

  // Frecce e marcature sulla scacchiera della partita.
  window.chessBoardDecorations = function chessBoardDecorations(reviewMove) {
    const arrows = [];
    const marks = {};
    if (reviewMove && reviewMove.engineAnalysis && reviewMove.engineAnalysis.ok && reviewMove.bestMoveUci) {
      const isError = isErrorQuality(reviewMove.quality);
      const played = reviewMove.uci ? reviewMove.uci.slice(0, 4) : null;
      if ((showBestArrow || isError) && reviewMove.bestMoveUci.slice(0, 4) !== played) {
        arrows.push({ from: reviewMove.bestMoveUci.slice(0, 2), to: reviewMove.bestMoveUci.slice(2, 4), color: "green" });
      }
    }
    if (!reviewBoard && !isRatedGame() && hintState && hintState.fen === boardToFen(board, "w", gameState)) {
      marks[hintState.uci.slice(0, 2)] = "hint";
      if (hintState.level >= 2) arrows.push({ from: hintState.uci.slice(0, 2), to: hintState.uci.slice(2, 4), color: "blue" });
    }
    if (!reviewBoard && coachWarning && coachWarning.square) marks[coachWarning.square] = "bad";
    if (!reviewBoard && coachWarning && coachWarning.arrow) arrows.push({ ...coachWarning.arrow, color: "red" });
    return { arrows, marks };
  };

  window.chessGameInteractive = () => gameInteractive() || premoveMode();

  /* -------------------------------------------------------- barre giocatori */

  const START_COUNT = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9 };

  function capturedPieces(displayBoard) {
    const count = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };
    displayBoard.flat().forEach((piece) => {
      if (!piece || piece.toLowerCase() === "k") return;
      count[isWhite(piece) ? "w" : "b"][piece.toLowerCase()] += 1;
    });
    // Promozioni: un pezzo in piu' del normale non e' una cattura negativa.
    const missing = (color) => Object.keys(START_COUNT).flatMap((type) => Array(Math.max(0, START_COUNT[type] - count[color][type])).fill(type));
    const material = (color) => Object.keys(VALUE).reduce((sum, type) => sum + VALUE[type] * count[color][type], 0);
    return { byWhite: missing("b"), byBlack: missing("w"), diff: material("w") - material("b") };
  }

  function capturedHtml(types, color, advantage) {
    const order = ["q", "r", "b", "n", "p"];
    const sorted = types.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
    const set = ui().pieceSet;
    const icons = sorted.map((type) => `<img src="${pieceImg(`${color}${type.toUpperCase()}`, set)}" alt="" class="cap-${type}">`).join("");
    return `${icons}${advantage > 0 ? `<span class="material-adv">+${advantage}</span>` : ""}`;
  }

  window.renderChessChrome = function renderChessChrome(displayBoard) {
    if (!document.getElementById("topPlayerBar")) return;
    const owns = trainerOwnsBoard();
    const arena = document.querySelector(".chess-arena");
    if (arena) arena.classList.toggle("trainer-mode", owns);
    const profile = getBotProfile(currentGame.botLevel || state.chess.botLevel);
    const config = getBotLevelConfig(currentGame.botLevel || state.chess.botLevel);
    if (owns) {
      window.ChessLearn.renderChrome();
    } else {
      document.getElementById("topPlayerName").textContent = config.name;
      document.getElementById("topPlayerSub").textContent = `Bot · ${profile.elo} Elo`;
      const rating = ratingProfile();
      const est = estimatedElo();
      document.getElementById("bottomPlayerName").textContent = "Tu";
      document.getElementById("bottomPlayerSub").textContent = `${isRatedGame() ? "Partita valutata" : "Allenamento"} · ${rating.game.count ? `rating ${rating.game.rating}` : est.elo ? `Elo stimato ${est.elo}` : "rating da stabilire"}`;
      const cap = capturedPieces(displayBoard || board);
      document.getElementById("bottomCaptured").innerHTML = capturedHtml(cap.byWhite, "b", cap.diff);
      document.getElementById("topCaptured").innerHTML = capturedHtml(cap.byBlack, "w", -cap.diff);
      const thinking = !chessGameOver && !reviewBoard && isBotTurn();
      const top = document.getElementById("topPlayerStatus");
      top.textContent = thinking ? "sta pensando" : "";
      top.classList.toggle("is-thinking", thinking);
      const bottom = document.getElementById("bottomPlayerStatus");
      bottom.textContent = !chessGameOver && !reviewBoard && !isBotTurn() ? "tocca a te" : "";
      document.getElementById("topPlayerBar").classList.toggle("is-turn", thinking);
      document.getElementById("bottomPlayerBar").classList.toggle("is-turn", !chessGameOver && !reviewBoard && !isBotTurn());
    }
    renderEvalBar();
    renderGameMoveList();
    renderPlayControls();
  };

  /* ------------------------------------------------------- barra valutazione */

  function renderEvalBar() {
    const bar = document.getElementById("evalBarV");
    if (!bar) return;
    let score = null;
    let visible = false;
    if (trainerOwnsBoard()) {
      visible = false;
    } else if (reviewBoard) {
      const move = currentGame.reviewIndex >= 0 ? currentGame.moves[currentGame.reviewIndex] : null;
      visible = Boolean(currentGame.moves.some((m) => m && m.engineAnalysis && m.engineAnalysis.ok));
      if (move && move.engineAnalysis && move.engineAnalysis.ok) score = move.evalAfter;
      else if (currentGame.reviewIndex === -1) score = 20;
    } else if (!isRatedGame() && ui().evalBarInGame) {
      visible = true;
      const fen = boardToFen(board, isBotTurn() ? "b" : "w", gameState);
      const cached = chessAnalysisCache.get(fen.split(/\s+/).slice(0, 4).join(" "));
      if (cached && cached.ok && cached.score) {
        const cp = cached.terminal ? (cached.type === "checkmate" ? -ChessAnalysis.MATE_CP : 0) : ChessAnalysis.scoreToCp(cached.score);
        score = fen.split(" ")[1] === "w" ? cp : -cp;
      } else if (chessGameOver) {
        score = currentGame.result === "win" ? ChessAnalysis.MATE_CP : currentGame.result === "loss" ? -ChessAnalysis.MATE_CP : 0;
      }
    }
    bar.classList.toggle("is-hidden", !visible);
    if (!visible) return;
    if (score === null) return;
    const win = ChessAnalysis.winPercent(score);
    const flipped = getBoardView().options.orientation === "black";
    const fill = document.getElementById("evalBarFill");
    fill.style.height = `${Math.max(2, Math.min(98, win))}%`;
    bar.classList.toggle("is-flipped", flipped);
    const text = document.getElementById("evalBarText");
    const abs = Math.abs(score);
    text.textContent = abs >= 9000 ? `M${Math.max(1, Math.round((ChessAnalysis.MATE_CP - abs) / 10))}` : (abs / 100).toFixed(1);
    bar.classList.toggle("black-better", score < 0);
  }

  /* --------------------------------------------------------- lista mosse */

  // Notazione con l'icona del pezzo: "Nf3" -> [cavallo]f3.
  function sanHtml(san, color) {
    const text = String(san || "");
    const set = ui().pieceSet;
    const icon = (letter) => `<img class="san-piece" src="${pieceImg(`${color}${letter}`, set)}" alt="${letter}">`;
    return text
      .replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))
      .replace(/^([KQRBN])/, (m, p) => icon(p))
      .replace(/=([QRBN])/, (m, p) => `=${icon(p)}`);
  }
  window.chessSanHtml = sanHtml;

  function renderGameMoveList() {
    const list = document.getElementById("gameMoveList");
    if (!list) return;
    const moves = getSafeChessMoves();
    if (!moves.length) {
      list.innerHTML = `<li class="move-empty">Muovi un pezzo per iniziare. Giochi con il Bianco.</li>`;
      return;
    }
    const activeIndex = reviewBoard ? currentGame.reviewIndex : moves.length - 1;
    const rows = [];
    for (let i = 0; i < moves.length; i += 2) {
      const white = moves[i];
      const black = moves[i + 1];
      const cell = (move, index) => {
        if (!move) return `<span class="move-cell empty"></span>`;
        const q = move.engineAnalysis && move.engineAnalysis.ok ? reviewQualityClass(move.quality) : "";
        const icon = q && ["brilliant", "great", "inexact", "mistake", "blunder", "missed", "best"].includes(q) ? `<i class="q-dot ${q}">${getMoveQualityMeta(move.quality).icon}</i>` : "";
        return `<button type="button" class="move-cell${index === activeIndex ? " active" : ""}" data-move-index="${index}">${icon}${sanHtml(move.san || move.move, move.side === "Bianco" ? "w" : "b")}</button>`;
      };
      rows.push(`<li><span class="move-no">${Math.floor(i / 2) + 1}.</span>${cell(white, i)}${cell(black, i + 1)}</li>`);
    }
    list.innerHTML = rows.join("");
    // Porta in vista la mossa attiva scorrendo SOLO la lista: scrollIntoView farebbe saltare
    // tutta la pagina (sul telefono finiva giu', vicino ai bot, a ogni mossa).
    const active = list.querySelector(".move-cell.active");
    if (active) {
      const lr = list.getBoundingClientRect();
      const ar = active.getBoundingClientRect();
      if (list.scrollHeight > list.clientHeight) {
        if (ar.top < lr.top) list.scrollTop += ar.top - lr.top - 4;
        else if (ar.bottom > lr.bottom) list.scrollTop += ar.bottom - lr.bottom + 4;
      }
      if (list.scrollWidth > list.clientWidth) {
        if (ar.left < lr.left) list.scrollLeft += ar.left - lr.left - 4;
        else if (ar.right > lr.right) list.scrollLeft += ar.right - lr.right + 4;
      }
    }
  }

  function onMoveListClick(event) {
    const cell = event.target.closest("[data-move-index]");
    if (!cell) return;
    const index = Number(cell.dataset.moveIndex);
    if (!chessGameOver && index === getSafeChessMoves().length - 1) {
      exitReviewMode();
      return;
    }
    selectReviewMove(index);
  }

  /* ------------------------------------------------------------ navigazione */

  function navPrev() {
    if (trainerOwnsBoard()) return window.ChessLearn.nav(-1);
    const moves = getSafeChessMoves();
    if (!moves.length) return;
    if (!reviewBoard) selectReviewMove(moves.length - 2);
    else stepReviewMove(-1);
  }

  function navNext() {
    if (trainerOwnsBoard()) return window.ChessLearn.nav(1);
    if (!reviewBoard) return;
    const moves = getSafeChessMoves();
    if (currentGame.reviewIndex >= moves.length - 1 && !chessGameOver) exitReviewMode();
    else stepReviewMove(1);
  }

  function navStart() {
    if (trainerOwnsBoard()) return window.ChessLearn.nav(-99);
    if (getSafeChessMoves().length) selectReviewMove(-1);
  }

  function navEnd() {
    if (trainerOwnsBoard()) return window.ChessLearn.nav(99);
    if (chessGameOver && getSafeChessMoves().length) selectReviewEnd();
    else exitReviewMode();
  }

  function onKey(event) {
    if (!document.getElementById("chess").classList.contains("active-page")) return;
    const tag = (event.target && event.target.tagName) || "";
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    if (event.key === "ArrowLeft") { navPrev(); event.preventDefault(); }
    else if (event.key === "ArrowRight") { navNext(); event.preventDefault(); }
    else if (event.key === "ArrowUp") { navStart(); event.preventDefault(); }
    else if (event.key === "ArrowDown") { navEnd(); event.preventDefault(); }
  }

  /* ------------------------------------------------------------------ schede */

  function setTab(tab) {
    if (view) view.cancelPromotion();
    currentTab = tab;
    document.querySelectorAll("[data-chess-tab]").forEach((button) => {
      const active = button.dataset.chessTab === tab;
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll("[data-chess-panel]").forEach((panel) => {
      panel.hidden = panel.dataset.chessPanel !== tab;
    });
    if (tab !== "learn" && view) view.setOptions({ orientation: ui().orientation || "white" });
    if (tab === "review") {
      if (getSafeChessMoves().length && !reviewBoard && (chessGameOver || !isRatedGame())) {
        const analysis = buildGameAnalysis(currentGame.result || "partial", currentGame.endReason || null);
        if (analysis.engineBased) renderMoveReview(false, analysis);
      }
    }
    if (tab === "learn" && window.ChessLearn) window.ChessLearn.onShow();
    if (tab === "grade" && window.ChessGrade) window.ChessGrade.render();
    if (tab === "play" && reviewBoard && !chessGameOver) exitReviewMode();
    if (tab === "play") requestAnimationFrame(() => placeBotCursor(false));
    renderBoard({ animate: false });
  }
  window.chessCurrentTab = () => currentTab;
  window.setChessTab = setTab;

  function onTabKey(event) {
    const tabs = [...document.querySelectorAll("[data-chess-tab]")];
    const index = tabs.indexOf(event.target);
    if (index < 0) return;
    let next = null;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (next) {
      next.focus();
      setTab(next.dataset.chessTab);
      event.preventDefault();
    }
  }

  /* ----------------------------------------------------- modalita' partita */

  function renderPlayMode() {
    const mode = chessMode();
    document.querySelectorAll("[data-play-mode]").forEach((button) => {
      button.setAttribute("aria-checked", String(button.dataset.playMode === mode));
    });
  }

  function setPlayMode(mode) {
    if (mode === chessMode()) return;
    state.chess.mode = mode;
    saveState();
    renderPlayMode();
    const moves = getSafeChessMoves().length;
    if (mode === "training" && isRatedGame() && !chessGameOver && moves) {
      // Una partita valutata in corso resta valutata: altrimenti si potrebbe
      // "salvare" una partita persa passando ad allenamento.
      coachSay("La partita in corso resta valutata fino alla fine. La prossima sara' di allenamento.");
    } else if (mode === "training" && !moves) {
      currentGame.rated = false;
      coachSay("Modalita' allenamento: ti avviso quando rischi qualcosa e puoi chiedere un suggerimento.");
    } else if (mode === "rated" && !chessGameOver && moves) {
      coachSay("La partita in corso resta di allenamento. La prossima sara' valutata.");
    } else if (mode === "rated" && !moves) {
      currentGame.rated = true;
      coachSay("Partita valutata: niente aiuti, il risultato conta per il tuo rating e il tuo grado.");
    }
    renderBoard({ animate: false });
  }

  function renderPlayControls() {
    const rated = isRatedGame();
    const moves = getSafeChessMoves().length;
    const hint = document.getElementById("hintBtn");
    const undo = document.getElementById("undoMoveBtn");
    const resign = document.getElementById("resignBtn");
    const review = document.getElementById("reviewGameBtn");
    if (!hint) return;
    hint.hidden = rated || chessGameOver;
    undo.hidden = rated || chessGameOver;
    resign.hidden = chessGameOver || !moves;
    review.textContent = chessGameOver ? "Analizza la partita" : "Rivedi partita";
    review.hidden = rated && !chessGameOver;
    hint.disabled = !gameInteractive();
    undo.disabled = !moves || isBotTurn();
    const result = document.getElementById("chessReportResult");
    if (result) result.textContent = chessGameOver ? currentGame.status : rated ? "Valutata" : "Allenamento";
    const apply = document.getElementById("applyBotLevelBtn");
    if (apply && apply.dataset.confirm !== "1") {
      const selected = getActiveBotLevel(state.chess.botLevel);
      const sameBot = selected === getActiveBotLevel(currentGame.botLevel);
      apply.textContent = !moves && sameBot ? "Pronto: muovi un pezzo" : chessGameOver || !moves ? "Nuova partita" : "Abbandona e nuova partita";
      apply.disabled = !moves && sameBot;
    }
  }

  /* ------------------------------------------------------------ suggerimento */

  async function requestHint() {
    if (isRatedGame() || !gameInteractive()) return;
    const fen = boardToFen(board, "w", gameState);
    if (hintState && hintState.fen === fen) {
      hintState.level = Math.min(2, hintState.level + 1);
      coachSay(`Prova ${hintState.san}.`);
      renderBoard({ animate: false });
      return;
    }
    const engines = chessEngines();
    if (!engines) {
      coachSay(STOCKFISH_REQUIRED_NOTICE);
      return;
    }
    coachSay("Ci penso un attimo...");
    currentGame.assisted = true;
    const result = await ChessReview.analysePosition(engines.review, fen, { depth: 14, multipv: 1, cache: chessAnalysisCache });
    if (!result || !result.ok || !result.lines || !result.lines.length) {
      coachSay("Non riesco a calcolare un suggerimento adesso.");
      return;
    }
    if (fen !== boardToFen(board, "w", gameState)) return;
    const uci = result.lines[0].pv[0];
    const san = ChessAnalysis.uciToSan(fen, uci);
    const piece = board[8 - Number(uci[1])][uci.charCodeAt(0) - 97];
    hintState = { fen, uci, san: ChessAnalysis.figurine(san), level: 1 };
    const names = { P: "il pedone", N: "il cavallo", B: "l'alfiere", R: "la torre", Q: "la donna", K: "il re" };
    coachSay(`Guarda ${names[piece] || "il pezzo"} evidenziato: ha una mossa forte. Premi di nuovo Suggerimento per vederla.`);
    renderBoard({ animate: false });
  }

  /* -------------------------------------------------------------- coach */

  // Mentre il coach aspetta una scelta (avviso che ferma il bot) gli altri
  // messaggi non devono cancellare i suoi pulsanti.
  function coachSay(text, actions = [], options = {}) {
    if (coachWarning && !options.force) return;
    const speech = document.getElementById("coachMessage");
    if (speech) speech.textContent = text;
    const box = document.getElementById("coachActions");
    if (!box) return;
    box.innerHTML = "";
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action.primary ? "primary-action" : "ghost-action";
      button.textContent = action.label;
      button.addEventListener("click", action.onClick);
      box.appendChild(button);
    });
  }
  window.coachSay = coachSay;

  // Allenamento: dopo la mossa del giocatore. Ritorna true se il bot deve aspettare.
  window.coachAfterPlayerMove = function coachAfterPlayerMove(record) {
    if (isRatedGame() || !window.ChessCoach || !record) return false;
    const verdict = ChessCoach.reviewPlayerMove(record.fenBefore, record.uci, "w");
    if (!verdict) {
      const advice = ChessCoach.openingAdvice(record.fenAfter, getSafeChessMoves().length);
      if (advice) coachSay(advice);
      return false;
    }
    if (verdict.severity === "blunder") {
      coachWarning = { square: verdict.square, arrow: verdict.arrow || null, gameId: currentGame.id };
      coachSay(verdict.text, [
        { label: "Riprova la mossa", primary: true, onClick: () => { if (!clearCoachWarning()) return; undoLastPlayerMove(); } },
        { label: "Continua cosi'", onClick: () => { if (!clearCoachWarning()) return; coachSay("Va bene, vediamo come risponde il bot."); renderBoard({ animate: false }); scheduleBotMove(); } }
      ], { force: true });
      return true;
    }
    coachSay(verdict.text);
    return false;
  };

  window.coachAfterBotMove = function coachAfterBotMove(record) {
    if (isRatedGame() || !window.ChessCoach || !record || chessGameOver) return;
    const threat = ChessCoach.describeThreats(record.fenAfter, "w");
    if (threat) coachSay(threat.text);
    else coachSay(`Il bot ha giocato ${ChessAnalysis.figurine(record.san)}. Cosa vuole fare con questa mossa?`);
  };

  window.chessCoachBlocking = () => Boolean(coachWarning);

  // Toglie l'avviso; ritorna false se l'avviso apparteneva a una partita gia' chiusa.
  function clearCoachWarning() {
    const warning = coachWarning;
    coachWarning = null;
    const box = document.getElementById("coachActions");
    if (box) box.innerHTML = "";
    return Boolean(warning && warning.gameId === currentGame.id && !chessGameOver);
  }
  window.clearCoachWarning = clearCoachWarning;

  // Nuova partita: niente avvisi, suggerimenti o promozioni rimasti dalla precedente.
  window.resetChessHelpers = function resetChessHelpers() {
    clearCoachWarning();
    hintState = null;
    showBestArrow = false;
    const best = document.getElementById("reviewShowBestBtn");
    if (best) best.setAttribute("aria-pressed", "false");
    if (view) view.cancelPromotion();
  };

  function scheduleBotMove() {
    clearBotTimer();
    botMoveTimer = window.setTimeout(makeBotMove, 200);
  }

  function undoLastPlayerMove() {
    // annulla solo la mossa del giocatore (il bot non ha ancora risposto)
    if (!history.length) return;
    const last = history[history.length - 1];
    if (last.turn !== "white") return;
    board = cloneBoard(last.board);
    gameState = cloneGameState(last.gameState);
    history = history.slice(0, -1);
    currentGame.moves.pop();
    currentGame.moveList = currentGame.moves;
    const moves = getSafeChessMoves();
    const previous = moves[moves.length - 1];
    lastMoveSquares = previous ? moveSquaresFromRecord(previous) : null;
    selectedSquare = null;
    thinkStartedAt = Date.now();
    coachSay("Mossa annullata. Prima di rigiocare: cosa resta senza difesa dopo la tua mossa?");
    renderBoard();
  }

  function resignGame() {
    if (chessGameOver || !getSafeChessMoves().length) return;
    const button = document.getElementById("resignBtn");
    if (button && button.dataset.confirm !== "1") {
      button.dataset.confirm = "1";
      button.textContent = "Conferma abbandono";
      setTimeout(() => {
        if (!button.isConnected) return;
        button.dataset.confirm = "";
        button.textContent = "Abbandona";
      }, 3500);
      return;
    }
    button.dataset.confirm = "";
    button.textContent = "Abbandona";
    clearBotTimer();
    finishGame("loss", "resign");
  }

  /* ---------------------------------------------------------- avversario */

  // Pezzo che rappresenta un bot: cresce con il grado (pedone E ... re S).
  const GRADE_PIECE = { E: "P", D: "N", C: "B", B: "R", A: "Q", S: "K" };
  const BOARD_COLS = 8;

  function botGrade(bot) {
    return window.ChessRating.gradeForElo(bot.estimatedElo);
  }

  function botPieceUrl(bot, color = "b") {
    return pieceImg(`${color}${GRADE_PIECE[botGrade(bot).key]}`);
  }

  /*
   * La scelta del bot e' una piccola scacchiera 8x3: si sale dal basso
   * (bot piu' deboli) verso l'alto (piu' forti), come i pedoni verso la
   * promozione. Ogni casa ha il pezzo del grado del bot e l'Elo come coordinata.
   */
  function renderBotPicker() {
    const boardEl = document.getElementById("botLadder");
    if (!boardEl) return;
    const level = getActiveBotLevel(state.chess.botLevel);
    const config = getBotLevelConfig(level);
    const bot = botLevels.find((item) => item.level === level) || botLevels[0];
    const theme = Kit.BOARD_THEMES[ui().theme] || Kit.BOARD_THEMES.accademia;
    const est = estimatedElo().elo;
    const suggested = est ? botLevels.reduce((best, item) => (Math.abs(item.estimatedElo - est) < Math.abs(best.estimatedElo - est) ? item : best), botLevels[0]).level : null;
    const rows = Math.ceil(botLevels.length / BOARD_COLS);
    const squares = [];
    for (let row = rows - 1; row >= 0; row -= 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        const index = row * BOARD_COLS + col;
        const item = botLevels[index];
        const visualRow = rows - 1 - row;
        // come su una vera scacchiera, la casa in basso a sinistra e' scura
        const light = (visualRow + col) % 2 !== (rows - 1) % 2;
        if (!item) {
          squares.push(`<span class="bot-sq ${light ? "light" : "dark"} empty" aria-hidden="true"></span>`);
          continue;
        }
        const grade = botGrade(item);
        const previous = botLevels[index - 1];
        const firstOfGrade = !previous || botGrade(previous).key !== grade.key;
        const stats = getLevelStats(item.level);
        const classes = ["bot-sq", light ? "light" : "dark"];
        if (item.level === level) classes.push("selected");
        if (item.level === suggested) classes.push("suggested");
        squares.push(`<button type="button" class="${classes.join(" ")}" data-bot-level="${item.level}" aria-pressed="${item.level === level}" aria-label="${item.name}, ${item.estimatedElo} Elo, grado ${grade.key}${stats.wins ? ", gia' battuto" : ""}" title="${item.name} · ${item.estimatedElo} Elo">
          ${firstOfGrade ? `<span class="bot-sq-grade grade-${grade.key}">${grade.key}</span>` : ""}
          <img src="${botPieceUrl(item)}" alt="" draggable="false">
          <span class="bot-sq-elo">${item.estimatedElo}</span>
          ${stats.wins ? `<span class="bot-sq-won" title="Battuto">\u2713</span>` : ""}
        </button>`);
      }
    }
    boardEl.style.setProperty("--bot-light", theme.light);
    boardEl.style.setProperty("--bot-dark", theme.dark);
    boardEl.style.setProperty("--bot-coord-light", theme.coordLight);
    boardEl.style.setProperty("--bot-coord-dark", theme.coordDark);
    boardEl.innerHTML = `${squares.join("")}<span class="bot-cursor" aria-hidden="true"></span>`;
    placeBotCursor(false);

    const legend = document.getElementById("botLegend");
    if (legend) {
      legend.innerHTML = Object.entries(GRADE_PIECE).map(([key, piece]) => `<span><img src="${pieceImg(`b${piece}`)}" alt="">${key}</span>`).join("") + `<span class="legend-note">dal basso verso l'alto: piu' forte</span>`;
    }

    const portrait = document.getElementById("botPortrait");
    portrait.style.setProperty("--bot-light", theme.light);
    portrait.style.setProperty("--bot-dark", theme.dark);
    const img = document.getElementById("botPortraitImg");
    const url = botPieceUrl(bot);
    if (img.getAttribute("src") !== url) img.setAttribute("src", url);
    const grade = botGrade(bot);
    const gradeTag = document.getElementById("botPickGrade");
    gradeTag.textContent = grade.key;
    gradeTag.className = `bot-portrait-grade grade-${grade.key}`;
    document.getElementById("botPickName").textContent = config.name;
    document.getElementById("botPickElo").textContent = config.elo;
    document.getElementById("botPickDesc").textContent = config.description;
    const stats = getLevelStats(level);
    const avg = stats.accuracyGames ? Math.round(stats.accuracySum / stats.accuracyGames) : null;
    const record = stats.games ? `Contro questo bot: ${stats.wins} vinte, ${stats.draws} patte, ${stats.losses} perse${avg !== null ? `, precisione media ${avg}%` : ""}.` : "Non hai ancora giocato contro questo bot.";
    const engine = isStockfishEngineEnabled() ? "" : ` Motore: ${getEngineStatusText()}.`;
    const hint = suggested === level ? " Avversario adatto al tuo livello." : suggested ? ` Consigliato per te: ${getBotLevelConfig(suggested).elo} (casa con il bordo blu).` : "";
    document.getElementById("botLevelText").textContent = `${record}${hint}${engine}`;
    renderRecalNote();
    document.getElementById("botPrevBtn").disabled = level <= 1;
    document.getElementById("botNextBtn").disabled = level >= getMaxBotLevel();
    renderPlayControls();
  }
  window.renderBotPicker = renderBotPicker;

  // Avviso una tantum dopo la ritaratura dei bot (ottobre 2026).
  function renderRecalNote() {
    const box = document.getElementById("botRecal");
    if (!box) return;
    const info = state.chess.recalibration;
    box.hidden = !info || info.seen;
    if (box.hidden) return;
    const change = typeof info.before === "number" && typeof info.after === "number"
      ? ` Il tuo rating partite è stato ricalcolato con la forza vera dei bot contro cui avevi giocato: da ${info.before} a ${info.after}.`
      : "";
    document.getElementById("botRecalText").textContent = `I bot sono stati ritarati: ora giocano davvero all'Elo scritto, misurato contro Stockfish, e non regalano più pezzi a caso. Quelli di prima erano più deboli di quanto dicevano.${change} Le statistiche per livello ripartono da zero.`;
  }
  document.addEventListener("click", (event) => {
    if (!event.target.closest || !event.target.closest("#botRecalOk")) return;
    if (state.chess.recalibration) state.chess.recalibration.seen = true;
    saveState();
    renderRecalNote();
  });

  // Il segnaposto dorato scivola sulla casa scelta, come un pezzo che muove.
  function placeBotCursor(animate) {
    const boardEl = document.getElementById("botLadder");
    const cursor = boardEl && boardEl.querySelector(".bot-cursor");
    const selected = boardEl && boardEl.querySelector(".bot-sq.selected");
    if (!cursor || !selected) return;
    if (!animate) cursor.classList.add("no-anim");
    cursor.style.width = `${selected.offsetWidth}px`;
    cursor.style.height = `${selected.offsetHeight}px`;
    cursor.style.transform = `translate(${selected.offsetLeft}px, ${selected.offsetTop}px)`;
    if (!animate) {
      void cursor.offsetWidth;
      cursor.classList.remove("no-anim");
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function pickBot(level) {
    const next = getActiveBotLevel(level);
    const previousLevel = getActiveBotLevel(state.chess.botLevel);
    if (next === previousLevel) {
      // stesso bot scelto, ma la partita (senza mosse) e' ancora contro un altro
      if (!getSafeChessMoves().length && getActiveBotLevel(currentGame.botLevel) !== next) {
        syncCurrentGameBotLevel();
        renderBoard({ animate: false });
        renderBotPicker();
      }
      return;
    }
    const boardEl = document.getElementById("botLadder");
    const fromTile = boardEl && boardEl.querySelector(`[data-bot-level="${next}"] img`);
    const fromRect = fromTile ? fromTile.getBoundingClientRect() : null;
    const cursor = boardEl && boardEl.querySelector(".bot-cursor");
    const cursorStart = cursor ? cursor.style.transform : null;
    state.chess.botLevel = next;
    saveState();
    // Senza mosse giocate cambiamo subito avversario.
    if (!getSafeChessMoves().length) {
      syncCurrentGameBotLevel();
      renderBoard({ animate: false });
    }
    renderBotPicker();
    Kit.Sound.play("move");
    if (prefersReducedMotion()) return;
    // Il cursore parte dalla casa vecchia e scivola sulla nuova.
    const newCursor = boardEl && boardEl.querySelector(".bot-cursor");
    if (newCursor && cursorStart) {
      const target = newCursor.style.transform;
      newCursor.classList.add("no-anim");
      newCursor.style.transform = cursorStart;
      void newCursor.offsetWidth;
      newCursor.classList.remove("no-anim");
      newCursor.style.transform = target;
    }
    // Il pezzo "vola" dalla casa scelta alla scheda dell'avversario.
    const img = document.getElementById("botPortraitImg");
    if (img && fromRect && img.animate) {
      const toRect = img.getBoundingClientRect();
      if (toRect.width) {
        const dx = fromRect.left + fromRect.width / 2 - (toRect.left + toRect.width / 2);
        const dy = fromRect.top + fromRect.height / 2 - (toRect.top + toRect.height / 2);
        const scale = fromRect.width / toRect.width;
        img.animate([
          { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, filter: "drop-shadow(0 10px 12px rgba(0,0,0,.45))" },
          { transform: "translate(0, 0) scale(1)", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.35))" }
        ], { duration: 340, easing: "cubic-bezier(0.22, 0.72, 0.28, 1)" });
      }
    }
  }

  function startNewGame() {
    if (!chessGameOver && getSafeChessMoves().length && isRatedGame()) {
      const button = document.getElementById("applyBotLevelBtn");
      if (button.dataset.confirm !== "1") {
        button.dataset.confirm = "1";
        button.textContent = "Conferma: conta come sconfitta";
        setTimeout(() => {
          if (!button.isConnected) return;
          button.dataset.confirm = "";
          renderPlayControls();
        }, 3500);
        return;
      }
      button.dataset.confirm = "";
      finishGame("loss", "resign");
    }
    applyBotLevel(state.chess.botLevel);
  }

  /* ------------------------------------------------------------- mentore */

  function renderMentor() {
    const grade = certifiedGrade();
    const mentor = MENTORS[grade.key] || MENTORS.E;
    const img = document.getElementById("mentorImage");
    if (!img) return;
    if (img.dataset.src !== mentor.image) {
      img.dataset.src = mentor.image;
      img.src = mentor.image;
      img.alt = mentor.name;
      img.onerror = () => {
        img.hidden = true;
        img.parentElement.dataset.letter = mentor.letter;
      };
      img.onload = () => {
        img.hidden = false;
      };
    }
    document.getElementById("mentorName").textContent = mentor.name;
    document.getElementById("mentorRole").textContent = mentor.role;
    document.getElementById("mentorClass").textContent = mentor.cls;
  }
  window.renderChessMentor = renderMentor;
  window.chessMentor = () => MENTORS[certifiedGrade().key] || MENTORS.E;

  /* ------------------------------------------------------------- grado */

  function ratingProfile() {
    state.chess.rating = window.ChessRating.ensureProfile(state.chess.rating);
    return state.chess.rating;
  }
  window.chessRatingProfile = ratingProfile;

  function accuracyEstimate() {
    const games = (state.chess.recentGames || []).filter((game) => game.rated === true && typeof game.gameRating === "number").slice(-10);
    if (!games.length) return { elo: null, count: 0 };
    return { elo: Math.round(games.reduce((sum, game) => sum + game.gameRating, 0) / games.length), count: games.length };
  }

  function estimatedElo() {
    const acc = accuracyEstimate();
    return window.ChessRating.estimateElo(ratingProfile(), { accuracyElo: acc.elo, accuracyGames: acc.count });
  }
  window.chessEstimatedElo = estimatedElo;

  function lessonsDone(gradeKey) {
    const lessons = window.ChessLessons.forGrade(gradeKey);
    const progress = state.chess.lessons || {};
    return { done: lessons.filter((lesson) => progress[lesson.id] && progress[lesson.id].completed).length, total: lessons.length };
  }
  window.chessLessonsDone = lessonsDone;

  function profileScore() {
    return window.ChessSkills ? window.ChessSkills.total(state.chess.skills) : null;
  }
  window.chessProfileScore = profileScore;

  // Un grado raggiunto resta tuo: se un requisito cambia dopo (nuove regole,
  // un periodo storto) il grado non scende.
  function certifiedGrade() {
    const R = window.ChessRating;
    const profile = ratingProfile();
    if (profile.certifiedKey === undefined) {
      // Prima volta con il requisito del profilo: chi aveva gia' un grado lo tiene.
      profile.certifiedKey = R.certifiedGrade(profile, { lessonsDone, profileScore: null }).key;
      saveState();
    }
    const computed = R.certifiedGrade(profile, { lessonsDone, profileScore: profileScore() });
    if (R.gradeIndex(computed.key) > R.gradeIndex(profile.certifiedKey)) {
      profile.certifiedKey = computed.key;
      saveState();
      return computed;
    }
    return R.GRADES[R.gradeIndex(profile.certifiedKey)];
  }
  window.chessCertifiedGrade = certifiedGrade;

  function renderGradeChip() {
    const grade = certifiedGrade();
    const est = estimatedElo();
    const letter = document.getElementById("gradeChipLetter");
    if (!letter) return;
    letter.textContent = grade.key;
    letter.dataset.grade = grade.key;
    document.getElementById("gradeChipName").textContent = `Grado ${grade.key} · ${grade.name}`;
    document.getElementById("gradeChipElo").textContent = est.elo ? `Elo stimato ${est.elo} ± ${est.rd}` : "Gioca partite valutate per misurarti";
    const you = document.getElementById("youAvatar");
    if (you) {
      you.textContent = grade.key;
      you.dataset.grade = grade.key;
    }
  }
  window.renderChessGradeChip = renderGradeChip;

  // Registra una partita valutata finita e aggiorna rating e grado.
  window.recordRatedGame = function recordRatedGame(result) {
    if (!currentGame.rated || currentGame.ratingRecorded) return null;
    // Una partita valutata conta sempre, anche se abbandonata presto.
    if (!getSafeChessMoves().some((move) => move.side === "Bianco")) {
      currentGame.ratingRecorded = true;
      return null;
    }
    const before = certifiedGrade();
    const res = window.ChessRating.recordGame(ratingProfile(), { botElo: currentGame.botElo, result, gameId: currentGame.id, date: new Date().toISOString() });
    state.chess.rating = res.profile;
    currentGame.ratingRecorded = true;
    currentGame.ratingChange = res.change;
    saveState();
    const after = certifiedGrade();
    renderGradeChip();
    renderMentor();
    return { change: res.change, rating: res.profile.game.rating, promoted: window.ChessRating.gradeIndex(after.key) > window.ChessRating.gradeIndex(before.key) ? after : null };
  };

  /* ---------------------------------------------------- fine partita */

  // Citazioni a fine partita, come quelle che aprono gli episodi di Classroom of the Elite.
  const END_QUOTES = {
    win: [
      ["I guerrieri vittoriosi prima vincono, e poi vanno in guerra.", "Sun Tzu, L'arte della guerra"],
      ["È molto più sicuro essere temuto che amato.", "Niccolò Machiavelli, Il Principe"],
      ["Il cielo non crea un uomo sopra un altro uomo, né un uomo sotto un altro uomo.", "Fukuzawa Yukichi"]
    ],
    loss: [
      ["Ciò che non mi uccide mi rende più forte.", "Friedrich Nietzsche"],
      ["Conosci il nemico e conosci te stesso: in cento battaglie non sarai in pericolo.", "Sun Tzu, L'arte della guerra"],
      ["Non è perché le cose sono difficili che non osiamo: è perché non osiamo che sono difficili.", "Seneca"]
    ],
    draw: [
      ["Chi conosce gli altri è sapiente; chi conosce se stesso è illuminato.", "Lao Tzu"],
      ["L'uomo è nato libero, e ovunque è in catene.", "Jean-Jacques Rousseau"]
    ]
  };

  function endQuote(result) {
    const list = END_QUOTES[result] || END_QUOTES.draw;
    const [text, author] = list[Math.floor(Math.random() * list.length)];
    return `<blockquote class="game-result-quote"><p>${text}</p><cite>${author}</cite></blockquote>`;
  }

  window.showGameResult = function showGameResult(result, reason, ratingInfo) {
    const box = document.getElementById("gameResult");
    if (!box) return;
    const titles = { win: "Hai vinto!", loss: "Hai perso", draw: "Patta" };
    const reasonText = chessFinalStateLabel(result, reason);
    const rated = Boolean(currentGame.rated);
    let ratingLine = rated ? "" : "Partita di allenamento: il rating non cambia.";
    if (rated && ratingInfo) ratingLine = `Rating partite ${ratingInfo.rating} (${ratingInfo.change >= 0 ? "+" : ""}${ratingInfo.change})`;
    else if (rated && !ratingInfo) ratingLine = "Nessuna mossa giocata: non conta per il rating.";
    box.className = `game-result result-${result}`;
    box.innerHTML = `
      <button class="game-result-close" type="button" aria-label="Chiudi">&times;</button>
      <strong class="game-result-title">${titles[result] || "Partita finita"}</strong>
      <span class="game-result-reason">${reasonText}</span>
      <span class="game-result-rating">${ratingLine}</span>
      ${ratingInfo && ratingInfo.promoted ? `<span class="game-result-grade">Nuovo grado ${ratingInfo.promoted.key}: ${ratingInfo.promoted.name}</span>` : ""}
      ${endQuote(result)}
      <div class="game-result-actions">
        <button class="primary-action" type="button" data-result-act="review">Analizza la partita</button>
        <button class="ghost-action" type="button" data-result-act="new">Nuova partita</button>
      </div>`;
    box.hidden = false;
    Kit.Sound.play("end");
    box.querySelector(".game-result-close").addEventListener("click", hideGameResult);
    box.querySelector('[data-result-act="review"]').addEventListener("click", () => {
      hideGameResult();
      setTab("review");
      renderMoveReview(false);
    });
    box.querySelector('[data-result-act="new"]').addEventListener("click", () => {
      hideGameResult();
      applyBotLevel(state.chess.botLevel);
    });
    if (rated && ratingInfo && window.ChessGrade && currentTab === "grade") window.ChessGrade.render();
  };

  function hideGameResult() {
    const box = document.getElementById("gameResult");
    if (box) box.hidden = true;
  }
  window.hideGameResult = hideGameResult;

  /* ---------------------------------------------------- impostazioni UI */

  function renderSettings() {
    const settings = ui();
    const swatches = document.getElementById("themeSwatches");
    if (!swatches) return;
    swatches.innerHTML = Object.entries(Kit.BOARD_THEMES).map(([key, theme]) => `
      <button type="button" class="theme-swatch${settings.theme === key ? " active" : ""}" data-board-theme="${key}" aria-pressed="${settings.theme === key}" title="${theme.label}">
        <span style="background: linear-gradient(135deg, ${theme.light} 0 50%, ${theme.dark} 50% 100%)"></span>${theme.label}
      </button>`).join("");
    document.getElementById("pieceSetOptions").innerHTML = Object.entries(Kit.PIECE_SETS).map(([key, set]) => `
      <button type="button" class="piece-set${settings.pieceSet === key ? " active" : ""}" data-piece-set="${key}" aria-pressed="${settings.pieceSet === key}">
        <img src="${pieceImg("wN", key)}" alt=""><img src="${pieceImg("bQ", key)}" alt="">${set.label}
      </button>`).join("");
    document.getElementById("effectsToggle").checked = settings.effects !== false;
    document.getElementById("soundToggle").checked = settings.sound !== false;
    document.getElementById("coordsToggle").checked = settings.coords !== false;
    document.getElementById("evalBarToggle").checked = Boolean(settings.evalBarInGame);
    const set = Kit.PIECE_SETS[settings.pieceSet];
    document.getElementById("pieceCredits").textContent = settings.pieceSet === "cote"
      ? `Pezzi "Classroom": set originale di Progetto A disegnato in stile anime Classroom of the Elite (collare cremisi della divisa).`
      : settings.pieceSet === "elite"
        ? `Pezzi "Elite 3D": set originale di Progetto A, resa realistica (porcellana e lacca, collare cremisi).`
        : `Pezzi "${set.label}" di ${set.author} (${set.license}), dal progetto lichess.org.`;
  }

  function updateSettings(patch) {
    Object.assign(ui(), patch);
    saveState();
    const settings = ui();
    getBoardView().setOptions({ theme: settings.theme, pieceSet: settings.pieceSet, coordinates: settings.coords, effects: settings.effects !== false });
    Kit.Sound.enabled = settings.sound !== false;
    renderSettings();
    renderBotPicker();
    renderBoard({ animate: false });
  }

  /* ------------------------------------------------------------ binding */

  function bind() {
    document.querySelectorAll("[data-chess-tab]").forEach((button) => {
      button.addEventListener("click", () => setTab(button.dataset.chessTab));
      button.addEventListener("keydown", onTabKey);
    });
    document.querySelectorAll("[data-open-tab]").forEach((button) => button.addEventListener("click", () => setTab(button.dataset.openTab)));
    document.querySelectorAll("[data-play-mode]").forEach((button) => button.addEventListener("click", () => setPlayMode(button.dataset.playMode)));
    document.getElementById("botLadder").addEventListener("click", (event) => {
      const chip = event.target.closest("[data-bot-level]");
      if (chip) pickBot(Number(chip.dataset.botLevel));
    });
    document.getElementById("botPrevBtn").addEventListener("click", () => pickBot(getActiveBotLevel(state.chess.botLevel) - 1));
    document.getElementById("botNextBtn").addEventListener("click", () => pickBot(getActiveBotLevel(state.chess.botLevel) + 1));
    document.getElementById("applyBotLevelBtn").addEventListener("click", startNewGame);
    document.getElementById("hintBtn").addEventListener("click", requestHint);
    document.getElementById("resignBtn").addEventListener("click", resignGame);
    document.getElementById("gameMoveList").addEventListener("click", onMoveListClick);
    document.getElementById("navPrevBtn").addEventListener("click", navPrev);
    document.getElementById("navNextBtn").addEventListener("click", navNext);
    document.getElementById("navStartBtn").addEventListener("click", navStart);
    document.getElementById("navEndBtn").addEventListener("click", navEnd);
    document.getElementById("flipBoardBtn").addEventListener("click", () => {
      const next = getBoardView().options.orientation === "white" ? "black" : "white";
      if (!trainerOwnsBoard()) ui().orientation = next;
      getBoardView().setOptions({ orientation: next });
      saveState();
      renderEvalBar();
    });
    const settingsBtn = document.getElementById("boardSettingsBtn");
    settingsBtn.addEventListener("click", () => {
      const panel = document.getElementById("boardSettings");
      panel.hidden = !panel.hidden;
      settingsBtn.setAttribute("aria-expanded", String(!panel.hidden));
      if (!panel.hidden) renderSettings();
    });
    document.getElementById("themeSwatches").addEventListener("click", (event) => {
      const button = event.target.closest("[data-board-theme]");
      if (button) updateSettings({ theme: button.dataset.boardTheme });
    });
    document.getElementById("pieceSetOptions").addEventListener("click", (event) => {
      const button = event.target.closest("[data-piece-set]");
      if (button) updateSettings({ pieceSet: button.dataset.pieceSet });
    });
    document.getElementById("effectsToggle").addEventListener("change", (event) => updateSettings({ effects: event.target.checked }));
    document.getElementById("soundToggle").addEventListener("change", (event) => updateSettings({ sound: event.target.checked }));
    document.getElementById("coordsToggle").addEventListener("change", (event) => updateSettings({ coords: event.target.checked }));
    document.getElementById("evalBarToggle").addEventListener("change", (event) => updateSettings({ evalBarInGame: event.target.checked }));
    document.getElementById("reviewShowBestBtn").addEventListener("click", () => {
      showBestArrow = !showBestArrow;
      document.getElementById("reviewShowBestBtn").setAttribute("aria-pressed", String(showBestArrow));
      renderBoard({ animate: false });
    });
    document.getElementById("reviewRetryBtn").addEventListener("click", () => {
      const move = currentGame.moves[currentGame.reviewIndex];
      if (!move || !move.bestMoveUci || !move.fenBefore) return;
      setTab("learn");
      window.ChessLearn.startGameExercise({
        id: `game-${currentGame.id}-${currentGame.reviewIndex}`,
        fen: move.fenBefore,
        solution: [move.bestMoveUci],
        prompt: `Mossa ${move.moveNumber} della tua partita: qui hai giocato ${ChessAnalysis.figurine(move.san)}. Trova la mossa migliore.`,
        explanation: move.comment || "",
        source: "game"
      });
    });
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", () => placeBotCursor(false));
    if (window.ResizeObserver) new ResizeObserver(() => placeBotCursor(false)).observe(document.getElementById("botLadder"));
    // Preload dei pezzi del set scelto (evita lo sfarfallio alla prima mossa).
    ["K", "Q", "R", "B", "N", "P"].forEach((p) => ["w", "b"].forEach((c) => {
      const img = new Image();
      img.src = pieceImg(`${c}${p}`);
    }));
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("chessBoard")) return;
    if (currentGame && typeof currentGame.rated !== "boolean") currentGame.rated = chessMode() === "rated";
    bind();
    renderPlayMode();
    renderBotPicker();
    renderMentor();
    renderGradeChip();
    renderSettings();
    getBoardView().setOptions({ orientation: ui().orientation || "white" });
    if (!getSafeChessMoves().length) coachSay(chessMode() === "rated"
      ? "Partita valutata: giochi con il Bianco, niente aiuti. Il risultato aggiorna il tuo rating."
      : "Allenamento: ti avviso quando lasci qualcosa in presa e puoi chiedermi un suggerimento.");
    renderBoard({ animate: false });
  });

  window.ChessUI = { setTab, coachSay, renderBotPicker, renderMentor, renderGradeChip, estimatedElo, certifiedGrade, ratingProfile, isRatedGame, chessMode };
})();
