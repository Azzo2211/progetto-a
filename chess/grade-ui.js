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
    const reqs = next ? R.requirementsFor(next.key, profile, { lessonsDone: window.chessLessonsDone, profileScore: window.chessProfileScore ? window.chessProfileScore() : null }) : [];
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
        ${["bullet", "blitz"].map((k) => {
          const t = profile.timed && profile.timed[k];
          if (!t || !t.count) return "";
          return `<div class="measure">
          <span>Rating ${k === "bullet" ? "Lampo" : "Blitz"}</span>
          <strong>${t.rating}</strong>
          <small>${t.count} ${t.count === 1 ? "partita" : "partite"} da ${k === "bullet" ? "1 minuto" : "3 minuti"} · non conta per il grado</small>
        </div>`;
        }).join("")}
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

  /* -------------------------------------------------- profilo di gioco */

  // Le 6 categorie: valore, variazione dell'ultima partita ed eventi che l'hanno causata.
  function renderChessProfile() {
    const S = window.ChessSkills;
    const radar = document.getElementById("chessModuleRadar");
    const metrics = document.getElementById("chessModuleMetrics");
    const eventsBox = document.getElementById("chessPatternBox");
    const howBox = document.getElementById("chessTrainingBox");
    if (!S || !metrics) return;
    const skills = S.ensureSkills(state.chess.skills);
    const last = skills.lastGame;
    const values = S.CATEGORIES.map((c) => ({ key: c.key, label: c.label, value: Math.round(skills[c.key]) }));
    const totalValue = S.total(skills);
    if (radar && typeof buildRadarMarkup === "function") radar.innerHTML = buildRadarMarkup(values, 280, 140, 122, false);
    const fmt = (n) => `${n > 0 ? "+" : ""}${Number.isInteger(n) ? n : n.toFixed(1)}`;
    metrics.classList.add("module-skill-panel");
    metrics.innerHTML = `
      <div class="module-score-card">
        <span>Totale <small>media delle 6 categorie</small></span>
        <strong>${totalValue}</strong>
        <em>Rango ${typeof rankFromScore === "function" ? rankFromScore(totalValue) : ""}</em>
      </div>
      <div class="skill-rows">
        ${S.CATEGORIES.map((c) => {
          const value = Math.round(skills[c.key]);
          const change = last && last.changes ? last.changes[c.key] || 0 : 0;
          return `<div class="skill-row" title="${esc(c.text)}">
            <span class="skill-name">${esc(c.label)}</span>
            <span class="skill-change ${change > 0 ? "up" : change < 0 ? "down" : ""}">${last ? fmt(change) : ""}</span>
            <strong>${value}</strong>
            <div class="mini-track"><div class="mini-fill" style="width:${value}%"></div></div>
          </div>`;
        }).join("")}
      </div>`;
    if (eventsBox) {
      if (!last || !last.log || !last.log.length) {
        eventsBox.innerHTML = `<strong>Ultima partita</strong><p>Finisci e analizza una partita: qui vedrai ogni errore e ogni mossa buona con la sua categoria.</p>`;
      } else {
        const important = last.log.filter((e) => Math.abs(e.scaled) >= 0.5).sort((a, b) => Math.abs(b.scaled) - Math.abs(a.scaled)).slice(0, 10);
        eventsBox.innerHTML = `<strong>Cosa ha cambiato l'ultima partita${last.botElo ? ` (bot ${last.botElo})` : ""}</strong>
          <ul class="skill-events">${important.map((e) => `<li class="${e.scaled >= 0 ? "up" : "down"}">
            <span>${e.moveNumber ? `Mossa ${e.moveNumber}${e.san ? ` (${esc(e.san)})` : ""}: ` : ""}${esc(e.label)}</span>
            <b>${esc(S.BY_KEY[e.category].label)} ${fmt(e.scaled)}</b>
          </li>`).join("")}</ul>`;
      }
    }
    if (howBox) {
      const sorted = S.CATEGORIES.slice().sort((a, b) => skills[a.key] - skills[b.key]);
      const spread = skills[sorted[sorted.length - 1].key] - skills[sorted[0].key];
      const weakest = spread >= 2 ? sorted[0] : null;
      howBox.innerHTML = `<strong>Come si calcola</strong>
        <p>Ogni mossa analizzata da Stockfish puo' togliere o dare punti a una categoria: per esempio un pezzo lasciato in presa toglie punti a Concentrazione, una mossa "grande" li aggiunge a Calcolo. Vittorie e sconfitte contano per tutte. I punti valgono di piu' contro bot forti e di meno contro bot deboli; le partite di allenamento contano meno di quelle valutate.</p>
        ${weakest ? `<p>Punto debole adesso: <b>${esc(weakest.label)}</b>. Lo alleni nel reparto errori della scheda Lezioni.</p>` : `<p>Tutte le categorie partono da ${S.START_VALUE}: si muovono dalla prima partita analizzata.</p>`}`;
    }
  }
  window.renderChessProfile = renderChessProfile;

  window.ChessGrade = { render };
})();
