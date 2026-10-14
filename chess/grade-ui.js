/*
 * Progetto A - Scacchi: scheda Grado. Mostra come viene misurato il livello,
 * cosa manca al grado successivo e la storia del rating.
 */
(function () {
  "use strict";

  const R = window.ChessRating;

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function sparkline(values, { width = 320, height = 70 } = {}) {
    if (values.length < 2) return `<p class="grade-empty">Servono almeno due risultati per il grafico.</p>`;
    const min = Math.min(...values) - 20;
    const max = Math.max(...values) + 20;
    const x = (i) => (i / (values.length - 1)) * (width - 8) + 4;
    const y = (v) => height - 6 - ((v - min) / (max - min)) * (height - 12);
    const points = values.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    return `<svg class="grade-spark" viewBox="0 0 ${width} ${height}" role="img" aria-label="Andamento del rating"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(values.length - 1).toFixed(1)}" cy="${y(values[values.length - 1]).toFixed(1)}" r="4" fill="currentColor"/><text x="4" y="12" class="spark-label">${Math.round(max - 20)}</text><text x="4" y="${height - 2}" class="spark-label">${Math.round(min + 20)}</text></svg>`;
  }

  function render() {
    const root = document.getElementById("gradeRoot");
    if (!root) return;
    const profile = window.chessRatingProfile();
    const grade = window.chessCertifiedGrade();
    const est = window.chessEstimatedElo();
    const estGrade = est.elo ? R.gradeForElo(est.elo) : null;
    const index = R.gradeIndex(grade.key);
    const next = R.GRADES[index + 1] || null;
    const reqs = next ? R.requirementsFor(next.key, profile, { lessonsDone: window.chessLessonsDone }) : [];
    const acc = R.averageAccuracy(profile, 5);
    const gameHistory = profile.game.history.map((h) => h.rating);
    const puzzleHistory = profile.puzzle.history.map((h) => h.rating);
    const metCount = reqs.filter((r) => r.met).length;
    root.innerHTML = `
      <section class="grade-hero grade-${grade.key}">
        <div class="grade-letter" data-grade="${grade.key}">${grade.key}</div>
        <div class="grade-hero-copy">
          <span class="section-kicker">Grado certificato</span>
          <strong>${esc(grade.name)}</strong>
          <p>${esc(grade.meaning)}</p>
          <p class="grade-estimate">${est.elo ? `Elo stimato <b>${est.elo}</b> &plusmn; ${est.rd} · affidabilita' ${est.confidence}%${estGrade && est.confidence >= 40 && R.gradeIndex(estGrade.key) > index ? ` · giochi gia' da grado ${estGrade.key}: completa i requisiti per certificarlo` : ""}` : "Elo stimato: gioca qualche partita valutata e qualche esercizio per misurarti."}</p>
        </div>
      </section>

      <section class="grade-measures">
        <div class="measure">
          <span>Rating partite</span>
          <strong>${profile.game.count ? profile.game.rating : "--"}</strong>
          <small>${profile.game.count} partite valutate${profile.game.count ? ` · &plusmn;${profile.game.rd}` : ""}</small>
        </div>
        <div class="measure">
          <span>Rating esercizi</span>
          <strong>${profile.puzzle.count ? profile.puzzle.rating : "--"}</strong>
          <small>${profile.puzzle.count} esercizi${profile.puzzle.count ? ` · ${Math.round((profile.puzzle.solved / profile.puzzle.count) * 100)}% risolti` : ""}</small>
        </div>
        <div class="measure">
          <span>Precisione media</span>
          <strong>${acc !== null ? `${acc}%` : "--"}</strong>
          <small>ultime 5 partite valutate</small>
        </div>
      </section>

      ${next ? `
      <section class="grade-next">
        <div class="grade-next-head">
          <strong>Per il grado ${next.key} · ${esc(next.name)}</strong>
          <span>${metCount}/${reqs.length} requisiti</span>
        </div>
        <ul class="req-list">
          ${reqs.map((r) => `<li class="${r.met ? "met" : ""}">
            <span class="req-check">${r.met ? `<svg viewBox="0 0 24 24"><use href="#i-check"/></svg>` : ""}</span>
            <div class="req-body">
              <div class="req-row"><span>${esc(r.label)}</span><b>${esc(r.value)}</b></div>
              <div class="req-track"><div style="width:${Math.round(r.progress * 100)}%"></div></div>
            </div>
          </li>`).join("")}
        </ul>
      </section>` : `<section class="grade-next"><strong>Hai raggiunto il grado massimo.</strong></section>`}

      <section class="grade-how">
        <strong>Come si misura</strong>
        <p>Il <b>rating partite</b> usa il sistema Glicko (come Lichess) contro i bot: ogni bot ha un Elo calibrato, quindi battere un bot forte vale di piu'. Contano solo le partite valutate, senza aiuti. Il <b>rating esercizi</b> viene dai puzzle Lichess, che hanno un rating noto: conta solo il primo tentativo. La <b>precisione</b> viene dall'analisi Stockfish.</p>
        <p>Un grado e' certificato solo quando sono soddisfatti tutti i requisiti: non basta una partita fortunata.</p>
      </section>

      <section class="grade-ladder">
        ${R.GRADES.map((g, i) => `<div class="ladder-row${i <= index ? " reached" : ""}${i === index ? " current" : ""}">
          <span class="grade-pill grade-${g.key}">${g.key}</span>
          <div><strong>${esc(g.name)}</strong><span>${g.key === "S" ? "2200+" : g.key === "E" ? "sotto 600" : `${g.min}-${g.max}`} Elo</span></div>
          <p>${esc(g.meaning)}</p>
        </div>`).join("")}
      </section>

      <section class="grade-history">
        <div><strong>Rating partite</strong>${sparkline(gameHistory)}</div>
        <div><strong>Rating esercizi</strong>${sparkline(puzzleHistory)}</div>
      </section>`;
  }

  window.ChessGrade = { render };
})();
