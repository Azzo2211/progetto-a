(function () {
  function currentLevel(value) {
    return getActiveBotLevel(Number(value || state.chess.botLevel || 1));
  }

  function labelFor(level) {
    const cfg = botLevels.find((item) => item.level === level) || botLevels[0];
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
