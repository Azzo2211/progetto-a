(function applyChessTuningOverrides() {
  const tuned = {
    8: { depth: 5, moveTimeMs: 650, mistakeRatePercent: 18, blunderRatePercent: 3, randomMovePercent: 4, topN: 5, noiseCp: 75 },
    9: { depth: 7, moveTimeMs: 900, mistakeRatePercent: 13, blunderRatePercent: 1, randomMovePercent: 2, topN: 4, noiseCp: 45 },
    10: { skillLevel: 10, depth: 8, moveTimeMs: 1100, mistakeRatePercent: 10, blunderRatePercent: 1, randomMovePercent: 1, topN: 4, noiseCp: 32 },
    11: { skillLevel: 12, depth: 10, moveTimeMs: 1500, mistakeRatePercent: 6, blunderRatePercent: 0, randomMovePercent: 1, topN: 3, noiseCp: 20 },
    12: { skillLevel: 15, depth: 12, moveTimeMs: 1900, mistakeRatePercent: 3, blunderRatePercent: 0, randomMovePercent: 0, topN: 3, noiseCp: 12 }
  };
  let pendingBotLevel = null;

  function tunedLevel(level) {
    const active = getActiveBotLevel(level);
    const base = botLevels.find((item) => item.level === active) || botLevels[0];
    return { ...base, ...(tuned[active] || {}) };
  }

  function getLevelOptionsHtml() {
    return botLevels
      .map((item) => item.level)
      .sort((a, b) => a - b)
      .map((level) => {
        const profile = getBotProfile(level);
        return `<option value="${level}">Livello ${level} - ${profile.label} - ${profile.displayElo || profile.elo} Elo</option>`;
      })
      .join("");
  }

  function ensureHeaderBotLevelSelect() {
    const badge = document.getElementById("activeBotLevelBadge");
    if (!badge || document.getElementById("headerBotLevelSelect")) return;
    const select = document.createElement("select");
    select.id = "headerBotLevelSelect";
    select.className = "bot-level-header-select";
    select.setAttribute("aria-label", "Scegli livello bot");
    select.addEventListener("change", handleBotLevelChange);
    badge.replaceWith(select);
  }

  function syncBotLevelSelects(activeLevel) {
    const levelsKey = botLevels.map((item) => item.level).sort((a, b) => a - b).join("|");
    [document.getElementById("botLevelSelect"), document.getElementById("headerBotLevelSelect")].forEach((select) => {
      if (!select) return;
      if (select.dataset.optionsKey !== levelsKey) {
        select.innerHTML = getLevelOptionsHtml();
        select.dataset.optionsKey = levelsKey;
      }
      select.value = String(pendingBotLevel || activeLevel);
    });
  }

  window.getBotLevelConfig = function getBotLevelConfig(level) {
    return tunedLevel(level);
  };

  window.getBotProfile = function getBotProfile(level) {
    const config = tunedLevel(level);
    return {
      elo: config.estimatedElo,
      displayElo: config.displayElo || String(config.estimatedElo),
      label: config.name,
      description: config.description
    };
  };

  window.getBotLevelSpec = function getBotLevelSpec(level) {
    const config = tunedLevel(level);
    return {
      elo: config.estimatedElo,
      mode: "Stockfish",
      depth: config.depth,
      timeMs: config.moveTimeMs,
      moveTimeMs: config.moveTimeMs,
      topN: config.topN,
      noiseCp: config.noiseCp,
      skillLevel: config.skillLevel,
      mistakeRatePercent: config.mistakeRatePercent,
      blunderRatePercent: config.blunderRatePercent,
      randomMovePercent: config.randomMovePercent
    };
  };

  window.getEngineDepthForLevel = (level) => getBotLevelSpec(level).depth;
  window.getEngineTimeForLevel = (level) => getBotLevelSpec(level).timeMs;
  window.getEngineTopCountForLevel = (level) => getBotLevelSpec(level).topN;
  window.getStockfishSkillForLevel = (level) => getBotLevelConfig(level).skillLevel;
  window.analyzeCurrentGameWithEngine = (depth = 16, timeMs = 2600) => analyzeGame(null, { depth, timeMs });

  window.getHumanCandidateLossLimit = function getHumanCandidateLossLimit(level, reason = "") {
    const base = { 7: 250, 8: 190, 9: 135, 10: 105, 11: 80, 12: 60 }[level] || 50;
    if (reason.includes("controlled-blunder")) return level >= 9 ? base : base + 70;
    if (reason.includes("controlled-mistake")) return base + (level >= 9 ? 25 : 40);
    if (reason.includes("inferior")) return base + (level >= 9 ? 10 : 20);
    return base;
  };

  window.getEngineChoiceWeights = function getEngineChoiceWeights(level, count) {
    const table = {
      1: [0.18, 0.16, 0.14, 0.12, 0.1, 0.09, 0.08, 0.06, 0.04, 0.03],
      2: [0.24, 0.2, 0.16, 0.12, 0.1, 0.08, 0.06, 0.04],
      3: [0.32, 0.22, 0.16, 0.11, 0.08, 0.06, 0.05],
      4: [0.42, 0.22, 0.14, 0.1, 0.07, 0.05],
      5: [0.55, 0.22, 0.12, 0.07, 0.04],
      6: [0.68, 0.2, 0.08, 0.04],
      7: [0.38, 0.24, 0.16, 0.1, 0.07, 0.05],
      8: [0.56, 0.24, 0.12, 0.06, 0.02],
      9: [0.68, 0.22, 0.08, 0.02],
      10: [0.76, 0.18, 0.05, 0.01],
      11: [0.88, 0.1, 0.02],
      12: [0.94, 0.05, 0.01]
    };
    return (table[level] || [1]).slice(0, count);
  };

  window.classifyEngineMove = function classifyEngineMove(context) {
    if (context.isBook) return { quality: "book", label: "Mossa da libro", reason: "book-db" };
    if (context.isBrilliant) return { quality: "brilliant", label: "Brillante", reason: "sacrificio corretto con vantaggio concreto" };
    if (context.isGreat) return { quality: "great", label: "Grande", reason: "risorsa critica o unica mossa forte" };
    if (context.isMissed) return { quality: "missed", label: "Mossa mancata", reason: "tattica o risorsa decisiva non sfruttata" };
    const epLoss = typeof context.epLoss === "number" ? context.epLoss : null;
    const loss = typeof context.evalLoss === "number" ? context.evalLoss : Math.max(0, (context.lossCp || 0) / 100);
    const shift = typeof context.evalBefore === "number" && typeof context.evalAfter === "number" ? Math.abs(context.evalBefore - context.evalAfter) : null;
    if (epLoss !== null) {
      if (sameUciMove(context.playedMove, context.bestMove) || (epLoss <= 0.001 && (context.lossCp || 0) <= 8)) return { quality: "best", label: "Migliore", reason: "best move o perdita expected points praticamente zero" };
      if (epLoss <= 0.02) return { quality: "excellent", label: "Ottima", reason: "epLoss <= 0.02" };
      if (context.isNormalOpening && epLoss <= 0.10) return { quality: "good", label: "Buona", reason: "apertura naturale: epLoss basso, non punita" };
      if (context.positionAlreadyDecided && epLoss <= 0.14) return { quality: "good", label: "Buona", reason: "posizione gia' decisa" };
      if (context.tablebaseFallback && epLoss <= 0.20) return { quality: "inaccuracy", label: "Imprecisione", reason: "finale tecnico senza tablebase" };
      if (epLoss <= 0.045) return { quality: "good", label: "Buona", reason: "epLoss <= 0.045" };
      if (epLoss <= 0.095) return { quality: "inaccuracy", label: "Imprecisione", reason: "epLoss <= 0.095" };
      if (epLoss <= 0.18) return { quality: "mistake", label: "Errore", reason: "epLoss <= 0.18" };
      return { quality: "blunder", label: "Errore grave", reason: "epLoss > 0.18" };
    }
    if (loss <= 0.15) return { quality: "best", label: "Migliore", reason: "fallback centipawn: perdita <= 0.15" };
    if (loss <= 0.35) return { quality: "excellent", label: "Ottima", reason: "fallback centipawn: perdita <= 0.35" };
    if (context.isNormalOpening && loss <= 1.00) return { quality: "good", label: "Buona", reason: "fallback apertura naturale" };
    if (shift !== null && shift <= 0.25 && loss <= 1.50) return { quality: "good", label: "Buona", reason: "fallback cambio valutazione minimo" };
    if (loss <= 0.75) return { quality: "good", label: "Buona", reason: "fallback perdita <= 0.75" };
    if (loss <= 1.50) return { quality: "inaccuracy", label: "Imprecisione", reason: "fallback perdita <= 1.50" };
    if (loss <= 3.00) return { quality: "mistake", label: "Errore", reason: "fallback perdita <= 3.00" };
    return { quality: "blunder", label: "Errore grave", reason: "fallback perdita > 3.00" };
  };

  window.isEngineGreatMove = function isEngineGreatMove(move, beforeCp, bestCp, playedCp, lossCp, epBefore = null, epBest = null, epPlayed = null, secondBestCp = null, topMoves = []) {
    if (!move || lossCp > 18 || currentGame.moves.indexOf(move) < 8 || move.moveNumber <= 8) return false;
    if (typeof epBest === "number" && typeof epPlayed === "number" && epBest - epPlayed > 0.015) return false;
    if (move.classification === "Scacco matto" || isNormalOpeningMove(move, move.moveNumber, move.san || move.moveSan || move.move)) return false;
    const improves = beforeCp <= -120 && playedCp >= -30;
    const saves = typeof epBefore === "number" && typeof epPlayed === "number" && epBefore <= 0.42 && epPlayed >= 0.50;
    const keeps = typeof epBefore === "number" && typeof epBest === "number" && typeof epPlayed === "number" && epBest >= 0.70 && epPlayed >= 0.68 && epBefore <= 0.62;
    const unique = typeof secondBestCp === "number" && playedCp - secondBestCp >= 220;
    const color = move.colorMoved || move.color;
    const pressure = Array.isArray(topMoves) && topMoves.length >= 3 ? topMoves.slice(2, 5).filter((candidate) => {
      const cp = candidate.evaluation ? engineEvalToPlayerCentipawns(candidate.evaluation, color, color) : playedCp;
      return playedCp - cp >= 180;
    }).length >= 2 : unique;
    return Boolean(pressure && (improves || saves || keeps || unique));
  };

  window.isEngineBrilliantMove = function isEngineBrilliantMove(move, beforeCp, playedCp, lossCp, epBefore = null, epPlayed = null) {
    if (!move || lossCp > 10 || currentGame.moves.indexOf(move) < 8 || move.moveNumber <= 8) return false;
    if (typeof epBefore === "number" && typeof epPlayed === "number" && epPlayed - epBefore < 0.08) return false;
    if (currentGame.moves.filter((item) => item && item.quality === "brilliant").length >= 1) return false;
    if (move.classification === "Scacco matto" || isNormalOpeningMove(move, move.moveNumber, move.san || move.moveSan || move.move)) return false;
    if (beforeCp >= 500 || (typeof epBefore === "number" && epBefore >= 0.82)) return false;
    if (playedCp < 180 || (typeof epPlayed === "number" && epPlayed < 0.65)) return false;
    const improves = playedCp - beforeCp >= 160 || (typeof epBefore === "number" && typeof epPlayed === "number" && epPlayed - epBefore >= 0.08);
    if (!improves) return false;
    const movedValue = move.piece ? pieceValues[move.piece.toLowerCase()] || 0 : 0;
    if (movedValue < 300 || !move.boardAfter) return false;
    const targetPiece = move.boardBefore ? move.boardBefore[move.toRow][move.toCol] : null;
    const capturedValue = targetPiece ? pieceValues[targetPiece.toLowerCase()] || 0 : 0;
    const sacrifice = capturedValue < movedValue && isSquareAttacked(move.boardAfter, move.toRow, move.toCol, oppositeColor(move.colorMoved || move.color));
    return sacrifice && playedCp >= beforeCp + 40 && playedCp >= 180;
  };

  window.renderBotLevel = function renderBotLevel() {
    ensureHeaderBotLevelSelect();
    const level = getActiveBotLevel(state.chess.botLevel || 1);
    if (state.chess.botLevel !== level && !isStockfishEngineInitializing()) {
      state.chess.botLevel = level;
      saveState();
    }
    const profile = getBotProfile(level);
    const spec = getBotLevelSpec(level);
    const config = getBotLevelConfig(level);
    const [targetMin, targetMax] = getBotAccuracyRange(level);
    const stats = getLevelStats(level);
    const accuracyGames = stats.accuracyGames || 0;
    const averageAccuracy = accuracyGames ? Math.round(stats.accuracySum / accuracyGames) : 0;
    const engineStatus = getEngineStatusText();
    const engineNotice = isStockfishEngineEnabled() ? "" : `<br><strong>${STOCKFISH_REQUIRED_NOTICE}</strong>`;
    document.getElementById("botLevelText").innerHTML = `Livello ${level} - ${profile.displayElo || profile.elo} Elo stimato, ${profile.label}.<br>${profile.description || config.description || "Livello Stockfish calibrato."}<br>Modalita': ${spec.mode}; skill ${config.skillLevel}; depth ${spec.depth}; budget ${spec.moveTimeMs || spec.timeMs} ms; Top-${spec.topN}.<br>Errori target: mistake ${config.mistakeRatePercent}%, blunder ${config.blunderRatePercent}%, candidate inferiore ${config.randomMovePercent}%.<br>Motore: ${engineStatus}.<br>Record contro questo livello: ${stats.wins} vittorie, ${stats.losses} sconfitte, ${stats.draws} patte.<br>Range target futuro: ${targetMin}-${targetMax}%. Media reale engine-based: ${accuracyGames ? `${averageAccuracy}%` : "non disponibile"}.${engineNotice}`;
    renderBotLevelOptions(level);
  };

  window.renderBotLevelOptions = function renderBotLevelOptions(activeLevel) {
    syncBotLevelSelects(activeLevel);
  };

  window.handleBotLevelChange = function handleBotLevelChange(event) {
    pendingBotLevel = getActiveBotLevel(Number(event.target.value));
    syncBotLevelSelects(state.chess.botLevel || 1);
    renderBotLevelPreview(pendingBotLevel);
  };

  window.applySelectedBotLevel = function applySelectedBotLevel() {
    const select = document.getElementById("headerBotLevelSelect") || document.getElementById("botLevelSelect");
    const level = getActiveBotLevel(Number(select && select.value ? select.value : pendingBotLevel || state.chess.botLevel || 1));
    pendingBotLevel = null;
    state.chess.botLevel = level;
    saveState();
    resetChess();
  };

  window.renderBotLevelPreview = function renderBotLevelPreview(level) {
    const activeLevel = getActiveBotLevel(state.chess.botLevel || 1);
    const previewLevel = getActiveBotLevel(level);
    const profile = getBotProfile(previewLevel);
    const spec = getBotLevelSpec(previewLevel);
    const config = getBotLevelConfig(previewLevel);
    const [targetMin, targetMax] = getBotAccuracyRange(previewLevel);
    const engineStatus = getEngineStatusText();
    const activeText = previewLevel === activeLevel ? "gia' attivo" : "da applicare alla prossima nuova partita";
    document.getElementById("botLevelText").innerHTML = `Selezionato livello ${previewLevel} - ${profile.displayElo || profile.elo} Elo stimato, ${profile.label} (${activeText}).<br>${profile.description || config.description || "Livello Stockfish calibrato."}<br>Modalita': ${spec.mode}; skill ${config.skillLevel}; depth ${spec.depth}; budget ${spec.moveTimeMs || spec.timeMs} ms; Top-${spec.topN}.<br>Errori target: mistake ${config.mistakeRatePercent}%, blunder ${config.blunderRatePercent}%, candidate inferiore ${config.randomMovePercent}%.<br>Motore: ${engineStatus}. Range target: ${targetMin}-${targetMax}%.`;
  };

  document.addEventListener("DOMContentLoaded", () => {
    const applyButton = document.getElementById("applyBotLevelBtn");
    const bodySelect = document.getElementById("botLevelSelect");
    if (applyButton) applyButton.addEventListener("click", applySelectedBotLevel);
    if (bodySelect) bodySelect.addEventListener("change", handleBotLevelChange);
    ensureHeaderBotLevelSelect();
    renderBotLevel();
  });
})();
