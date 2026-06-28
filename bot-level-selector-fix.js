(function () {
  function levelValue(value) {
    return getActiveBotLevel(Number(value || state.chess.botLevel || 1));
  }

  function levelLabel(level) {
    const config = botLevels.find((item) => item.level === level) || botLevels[0];
    const elo = config.displayElo || config.estimatedElo || "";
    return "Livello " + level + " - " + (config.name || "Bot") + " - " + elo + " Elo";
  }

  function optionMarkup() {
    return botLevels
      .map((item) => item.level)
      .sort((a, b) => a - b)
      .map((level) => '<option value="' + level + '">' + levelLabel(level) + '</option>')
      .join("");
  }

  function updateBadge(level) {
    let badge = document.getElementById("activeBotLevelBadge");
    const topSelect = document.getElementById("headerBotLevelSelect");
    if (topSelect) {
      badge = document.createElement("span");
      badge.id = "activeBotLevelBadge";
      badge.className = "bot-active-badge";
      topSelect.replaceWith(badge);
    }
    if (badge) badge.textContent = "Bot L" + level;
  }

  function ensureReportSelect() {
    const reportValue = document.getElementById("reportBotLevel");
    if (!reportValue) return null;
    reportValue.style.display = "none";

    let select = document.getElementById("reportBotLevelSelect");
    if (!select) {
      select = document.createElement("select");
      select.id = "reportBotLevelSelect";
      select.className = "bot-level-report-select";
      select.setAttribute("aria-label", "Scegli livello bot");
      select.addEventListener("change", function () {
        applyLevel(select.value);
      });
      reportValue.insertAdjacentElement("afterend", select);
    }
    select.innerHTML = optionMarkup();
    select.value = String(levelValue());
    return select;
  }

  function sync(level) {
    const safeLevel = levelValue(level);
    updateBadge(safeLevel);
    const reportSelect = ensureReportSelect();
    if (reportSelect) reportSelect.value = String(safeLevel);
    const lowerSelect = document.getElementById("botLevelSelect");
    if (lowerSelect) lowerSelect.value = String(safeLevel);
  }

  function applyLevel(value) {
    const safeLevel = levelValue(value);
    state.chess.botLevel = safeLevel;
    saveState();
    sync(safeLevel);
    if (typeof resetChess === "function") resetChess();
  }

  const previousRender = window.renderBotLevel;
  window.renderBotLevel = function () {
    const result = typeof previousRender === "function" ? previousRender.apply(this, arguments) : undefined;
    setTimeout(function () { sync(state.chess.botLevel || 1); }, 0);
    return result;
  };

  window.handleBotLevelChange = function (event) {
    applyLevel(event.target.value);
  };

  window.applySelectedBotLevel = function () {
    const reportSelect = document.getElementById("reportBotLevelSelect");
    const lowerSelect = document.getElementById("botLevelSelect");
    const select = reportSelect || lowerSelect;
    applyLevel(select ? select.value : state.chess.botLevel || 1);
  };

  document.addEventListener("DOMContentLoaded", function () {
    sync(state.chess.botLevel || 1);
    const lowerSelect = document.getElementById("botLevelSelect");
    if (lowerSelect) lowerSelect.addEventListener("change", function () { applyLevel(lowerSelect.value); });
    const applyButton = document.getElementById("applyBotLevelBtn");
    if (applyButton) applyButton.addEventListener("click", window.applySelectedBotLevel);
  });
})();
