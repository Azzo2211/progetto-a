(function () {
  const strengthOverrides = {
    4: { skillLevel: 1, depth: 2, moveTimeMs: 100, mistakeRatePercent: 44, blunderRatePercent: 24, randomMovePercent: 20, topN: 7, noiseCp: 210 },
    5: { skillLevel: 1, depth: 2, moveTimeMs: 120, mistakeRatePercent: 42, blunderRatePercent: 20, randomMovePercent: 18, topN: 7, noiseCp: 190 },
    6: { skillLevel: 3, depth: 3, moveTimeMs: 220, mistakeRatePercent: 32, blunderRatePercent: 13, randomMovePercent: 11, topN: 6, noiseCp: 145 },
    7: { skillLevel: 4, depth: 4, moveTimeMs: 320, mistakeRatePercent: 25, blunderRatePercent: 8, randomMovePercent: 7, topN: 6, noiseCp: 115 }
  };

  function currentLevel(value) {
    return getActiveBotLevel(Number(value || state.chess.botLevel || 1));
  }

  function tunedConfig(level) {
    const safeLevel = currentLevel(level);
    const base = botLevels.find((item) => item.level === safeLevel) || botLevels[0];
    return { ...base, ...(strengthOverrides[safeLevel] || {}) };
  }

  window.getBotLevelConfig = function (level) {
    return tunedConfig(level);
  };

  window.getBotProfile = function (level) {
    const config = tunedConfig(level);
    return {
      elo: config.estimatedElo,
      displayElo: config.displayElo || String(config.estimatedElo),
      label: config.name,
      description: config.description
    };
  };

  window.getBotLevelSpec = function (level) {
    const config = tunedConfig(level);
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

  window.getEngineDepthForLevel = function (level) {
    return getBotLevelSpec(level).depth;
  };

  window.getEngineTimeForLevel = function (level) {
    return getBotLevelSpec(level).timeMs;
  };

  window.getEngineTopCountForLevel = function (level) {
    return getBotLevelSpec(level).topN;
  };

  window.getStockfishSkillForLevel = function (level) {
    return getBotLevelConfig(level).skillLevel;
  };

  window.getEngineChoiceWeights = function (level, count) {
    const table = {
      1: [0.14, 0.13, 0.12, 0.11, 0.1, 0.09, 0.08, 0.07, 0.06, 0.05, 0.05],
      2: [0.18, 0.16, 0.14, 0.12, 0.1, 0.09, 0.08, 0.07, 0.06],
      3: [0.24, 0.19, 0.15, 0.12, 0.1, 0.08, 0.07, 0.05],
      4: [0.28, 0.21, 0.16, 0.12, 0.09, 0.07, 0.04, 0.03],
      5: [0.34, 0.22, 0.15, 0.1, 0.08, 0.06, 0.05],
      6: [0.48, 0.24, 0.13, 0.08, 0.05, 0.02],
      7: [0.58, 0.22, 0.1, 0.06, 0.03, 0.01]
    };
    return (table[currentLevel(level)] || [1]).slice(0, count);
  };

  window.calibratePlayerAccuracy = function (raw, counts, result) {
    if (!raw) return 0;
    let adjusted = raw;
    if (raw < 45) adjusted += 12;
    else if (raw < 60) adjusted += 8;
    else if (raw < 75) adjusted += 4;
    else adjusted += 1;
    if (result === "win" && raw < 40) adjusted = Math.max(adjusted, 45);
    return Math.round(clamp(adjusted, 0, 100));
  };

  window.calibrateBotAccuracy = function (raw, counts, level) {
    if (!raw) return 0;
    const target = {
      1: [28, 40], 2: [34, 44], 3: [40, 50], 4: [44, 55], 5: [48, 58],
      6: [54, 64], 7: [60, 69], 8: [66, 74], 9: [70, 78], 10: [74, 82]
    }[currentLevel(level)];
    if (!target) return Math.round(clamp(raw, 0, 100));
    const [min, max] = target;
    return Math.round(clamp(raw, Math.max(0, min - 8), max + 6));
  };

  function labelFor(level) {
    const cfg = tunedConfig(level);
    const elo = cfg.displayElo || cfg.estimatedElo || "";
    return `Livello ${level} - ${cfg.name || "Bot"} - ${elo} Elo`;
  }

  function buildOptions() {
    return botLevels
      .map((item) => item.level)
      .sort((a, b) => a - b)
      .map((level) => `<option value="${level}">${labelFor(level)}</option>`)
      .join("");
  }

  function putSelectInBotBox() {
    const oldHeaderSelect = document.getElementById("headerBotLevelSelect");
    if (oldHeaderSelect) {
      const badge = document.createElement("span");
      badge.id = "activeBotLevelBadge";
      badge.className = "bot-active-badge";
      oldHeaderSelect.replaceWith(badge);
    }

    const reportValue = document.getElementById("reportBotLevel");
    if (!reportValue) return null;
    reportValue.style.display = "none";

    let select = document.getElementById("reportBotLevelSelect");
    if (!select) {
      select = document.createElement("select");
      select.id = "reportBotLevelSelect";
      select.className = "bot-level-report-select";
      select.addEventListener("change", () => changeLevel(select.value));
      reportValue.insertAdjacentElement("afterend", select);
    }
    select.innerHTML = buildOptions();
    select.value = String(currentLevel());
    return select;
  }

  function updateHeader(level) {
    const badge = document.getElementById("activeBotLevelBadge");
    if (badge) badge.textContent = `Bot L${level}`;
  }

  function changeLevel(value) {
    const level = currentLevel(value);
    state.chess.botLevel = level;
    saveState();
    updateHeader(level);
    const panelSelect = document.getElementById("botLevelSelect");
    if (panelSelect) panelSelect.value = String(level);
    const reportSelect = document.getElementById("reportBotLevelSelect");
    if (reportSelect) reportSelect.value = String(level);
    if (typeof resetChess === "function") resetChess();
  }

  const oldRender = window.renderBotLevel;
  window.renderBotLevel = function () {
    if (typeof oldRender === "function") oldRender();
    putSelectInBotBox();
    updateHeader(currentLevel());
  };

  window.handleBotLevelChange = function (event) {
    changeLevel(event.target.value);
  };

  window.applySelectedBotLevel = function () {
    const select = document.getElementById("reportBotLevelSelect") || document.getElementById("botLevelSelect");
    changeLevel(select ? select.value : state.chess.botLevel);
  };

  document.addEventListener("DOMContentLoaded", () => {
    putSelectInBotBox();
    updateHeader(currentLevel());
    const bodySelect = document.getElementById("botLevelSelect");
    if (bodySelect) bodySelect.addEventListener("change", () => changeLevel(bodySelect.value));
  });
})();
