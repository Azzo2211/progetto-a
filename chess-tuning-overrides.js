(function () {
  const strengthOverrides = {
    1: { skillLevel: 0, depth: 1, moveTimeMs: 25, mistakeRatePercent: 78, blunderRatePercent: 58, randomMovePercent: 48, topN: 10, noiseCp: 360 },
    2: { skillLevel: 0, depth: 1, moveTimeMs: 35, mistakeRatePercent: 70, blunderRatePercent: 48, randomMovePercent: 40, topN: 10, noiseCp: 320 },
    3: { skillLevel: 0, depth: 1, moveTimeMs: 45, mistakeRatePercent: 62, blunderRatePercent: 38, randomMovePercent: 32, topN: 9, noiseCp: 280 },
    4: { skillLevel: 0, depth: 1, moveTimeMs: 60, mistakeRatePercent: 54, blunderRatePercent: 30, randomMovePercent: 26, topN: 9, noiseCp: 240 },
    5: { skillLevel: 0, depth: 1, moveTimeMs: 80, mistakeRatePercent: 48, blunderRatePercent: 25, randomMovePercent: 22, topN: 8, noiseCp: 220 },
    6: { skillLevel: 1, depth: 2, moveTimeMs: 120, mistakeRatePercent: 40, blunderRatePercent: 18, randomMovePercent: 16, topN: 8, noiseCp: 180 },
    7: { skillLevel: 2, depth: 2, moveTimeMs: 170, mistakeRatePercent: 34, blunderRatePercent: 13, randomMovePercent: 12, topN: 7, noiseCp: 150 },
    8: { skillLevel: 3, depth: 3, moveTimeMs: 230, mistakeRatePercent: 28, blunderRatePercent: 9, randomMovePercent: 9, topN: 7, noiseCp: 120 }
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
      1: [0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.10, 0.05, 0.05],
      2: [0.12, 0.12, 0.11, 0.11, 0.10, 0.10, 0.09, 0.09, 0.08, 0.08],
      3: [0.16, 0.14, 0.13, 0.12, 0.11, 0.10, 0.09, 0.08, 0.07],
      4: [0.20, 0.17, 0.14, 0.12, 0.11, 0.09, 0.08, 0.06, 0.03],
      5: [0.24, 0.18, 0.15, 0.12, 0.10, 0.08, 0.07, 0.06],
      6: [0.32, 0.21, 0.15, 0.11, 0.09, 0.07, 0.05],
      7: [0.42, 0.22, 0.14, 0.09, 0.06, 0.04, 0.03],
      8: [0.52, 0.22, 0.12, 0.07, 0.04, 0.02, 0.01]
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
      1: [20, 34], 2: [24, 38], 3: [28, 42], 4: [32, 46], 5: [36, 50],
      6: [42, 56], 7: [48, 62], 8: [56, 68], 9: [66, 76], 10: [72, 80]
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

(function loadCoteTheme() {
  if (document.getElementById("coteThemeScript")) return;
  const script = document.createElement("script");
  script.id = "coteThemeScript";
  script.src = "cote-theme.js?v=20260713-1";
  document.head.appendChild(script);
})();
