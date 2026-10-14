// Tema "accademia" della pagina scacchi: carica il foglio di stile e attiva la classe.
// Il coach (mentore) e' gestito da chess/chess-ui.js in base al tuo grado.
(function () {
  function addThemeStylesheet() {
    if (document.getElementById("coteThemeStylesheet")) return;
    const link = document.createElement("link");
    link.id = "coteThemeStylesheet";
    link.rel = "stylesheet";
    link.href = "cote-theme.css?v=20261014-7";
    document.head.appendChild(link);
  }

  function enableChessTheme() {
    const chess = document.getElementById("chess");
    if (chess) chess.classList.add("cote-theme");
  }

  addThemeStylesheet();
  document.addEventListener("DOMContentLoaded", enableChessTheme);
})();
