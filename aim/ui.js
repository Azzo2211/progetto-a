/*
 * Progetto A - Mira: la pagina (allenamento, routine, ricerca della sens, progressi, impostazioni).
 * Motore: AimEngine (aim/engine.js). Gioco: AimGame (aim/game.js). Stato: state.aimLab.
 */
(function () {
  "use strict";

  const A = window.AimEngine;
  const G = window.AimGame;
  if (!A || !G) return;

  const ui = {
    tab: "train",       // train | finder | progress | settings
    play: null,         // { ctl, id, mode: free|routine|finder, which }
    routine: null,      // { index, results: [] }
    result: null,       // { stats, run, best, mode }
    calib: null,        // misura del 360: { phase: intro|measure|result, res }
    measureCtl: null
  };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmt = (n, d = 0) => (n == null || !Number.isFinite(n) ? "—" : n.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const fmtSens = (s) => String(A.roundSens(s)).replace(".", ",");
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const finePointer = () => !window.matchMedia || window.matchMedia("(any-pointer: fine)").matches;

  function lab() {
    state.aimLab = A.ensure(state.aimLab);
    return state.aimLab;
  }

  function save() {
    if (typeof saveState === "function") saveState();
    renderCard();
  }

  function announce(text) {
    const live = $("aimLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }

  function focusTitle() {
    const box = $("aimPanel");
    const h = box && (box.querySelector("[data-focus-title]") || box.querySelector("h2, h3"));
    if (!h) return;
    if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
    h.focus({ preventScroll: true });
  }

  function sensLine(s) {
    return `${fmtSens(s.sens)} · ${fmt(s.dpi)} DPI · eDPI ${fmt(A.edpi(s.dpi, s.sens))} · ${fmt(A.cm360(s.dpi, s.sens), 1)} cm/360`;
  }

  function calibBadge(s) {
    if (!s.calib) return `<span class="aim-badge warn" title="Fai la verifica del 360 nella sezione Trova la sens">mouse non verificato</span>`;
    return s.calib.factor === 1 ? `<span class="aim-badge ok">mouse 1:1 con Valorant</span>` : `<span class="aim-badge ok">mouse corretto (×${fmt(s.calib.factor, 2)})</span>`;
  }

  /* -------------------------------------------------------------- render */
  function render(focus) {
    const box = $("aimPanel");
    if (!box) return;
    const l = lab();
    renderChip(l);
    document.querySelectorAll("[data-aim-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.aimTab === ui.tab)));
    if (ui.play) return; // il gioco occupa il riquadro
    let html = "";
    if (ui.result) html = resultView(l);
    else if (ui.tab === "train") html = trainView(l);
    else if (ui.tab === "finder") html = finderView(l);
    else if (ui.tab === "progress") html = progressView(l);
    else html = settingsView(l);
    box.innerHTML = html;
    if (ui.tab === "settings" && !ui.result) paintPreview();
    if (ui.calib && ui.calib.phase === "measure") startMeasure();
    if (focus) focusTitle();
  }

  function renderChip(l) {
    const chip = $("aimSensChip");
    if (!chip) return;
    chip.innerHTML = `<span>Sens Valorant</span><strong>${fmtSens(l.settings.sens)}</strong><em>${fmt(l.settings.dpi)} DPI · ${fmt(A.cm360(l.settings.dpi, l.settings.sens), 1)} cm/360</em>`;
  }

  function renderCard() {
    const box = $("aimCardIndicators");
    if (!box) return;
    const l = lab();
    const st = A.stats(l);
    const row = (label, value, pct) => `<div class="dashboard-value-row"><span>${label}</span><strong>${value}</strong><div class="mini-track"><div class="mini-fill" style="width:${Math.max(0, Math.min(100, pct))}%"></div></div></div>`;
    box.innerHTML = `<div class="dashboard-value-list">
      ${row("Sens", fmtSens(l.settings.sens), Math.min(100, A.edpi(l.settings.dpi, l.settings.sens) / 8))}
      ${row("Record Gridshot", st.per.gridshot.best == null ? "—" : fmt(st.per.gridshot.best), st.per.gridshot.best ? Math.min(100, st.per.gridshot.best / 120) : 0)}
      ${row("Giorni di fila", st.streak, Math.min(100, st.streak * 10))}
    </div>`;
  }

  /* -------------------------------------------------------------- allenamento */
  function trainView(l) {
    const st = A.stats(l);
    const s = l.settings;
    const today = l.runs.filter((r) => A.dayKey(r.t) === A.dayKey(Date.now()));
    const routineRows = A.ROUTINE.map((id) => {
      const d = A.scenario(id);
      const done = today.some((r) => r.sc === id);
      return `<li class="${done ? "done" : ""}"><span class="aim-check" aria-hidden="true">${done ? "✓" : ""}</span><strong>${esc(d.name)}</strong><em>${d.duration ? `${d.duration} s` : `${d.reps} volte`}</em><span class="aim-sr">${done ? "fatto oggi" : "da fare"}</span></li>`;
    }).join("");
    const cards = A.SCENARIOS.filter((d) => !d.hidden).map((d) => {
      const p = st.per[d.id];
      return `
        <article class="aim-card">
          <header><h3>${esc(d.name)}</h3><span>${d.duration ? `${d.duration} s` : `${d.reps} volte`}</span></header>
          <p class="aim-trains">${esc(d.trains)}</p>
          <p>${esc(d.text)}</p>
          <dl class="aim-mini"><div><dt>Record</dt><dd>${p.best == null ? "—" : fmt(p.best)}</dd></div><div><dt>Media ultime 5</dt><dd>${p.avg5 == null ? "—" : fmt(p.avg5)}</dd></div><div><dt>Partite</dt><dd>${p.count}</dd></div></dl>
          <button type="button" class="aim-btn" data-aim="play" data-id="${d.id}">Gioca</button>
        </article>`;
    }).join("");
    return `
      <div class="aim-body">
        ${finePointer() ? "" : `<p class="aim-note warn">Sul telefono puoi guardare i progressi. Per allenarti apri l'app sul computer, con il mouse: serve per la mira e per la sensibilità.</p>`}
        <div class="aim-sensbar"><span>Sens ${esc(sensLine(s))}</span>${calibBadge(s)}<button type="button" class="aim-link" data-aim="tab" data-tab="settings">Cambia</button></div>
        <article class="aim-routine">
          <div>
            <span class="aim-kicker">Routine del giorno · circa 7 minuti</span>
            <h2 data-focus-title>Riscaldamento per Valorant</h2>
            <p>Sei esercizi di fila, dal più facile al più vicino alla partita: velocità, precisione sulla testa, linea del mirino, peek, tracking, riflessi. Falla prima di giocare.</p>
            <button type="button" class="aim-btn primary" data-aim="routine">${st.routineToday ? "Rifai la routine" : "Inizia la routine"}</button>
          </div>
          <ol class="aim-routine-list">${routineRows}</ol>
        </article>
        <h2 class="aim-h2">Esercizi</h2>
        <div class="aim-cards">${cards}</div>
      </div>`;
  }

  /* -------------------------------------------------------------- gioco */
  function startPlay(id, mode, extra = {}) {
    const l = lab();
    if (!finePointer()) { announce("Serve un computer con il mouse"); }
    const box = $("aimPanel");
    ui.result = null;
    const sens = extra.sens || l.settings.sens;
    box.innerHTML = `<div class="aim-body aim-playing"><div class="aim-mount" id="aimMount"></div><p class="aim-tip"><strong>Consiglio</strong> ${esc(A.scenario(id).tip)}</p></div>`;
    const ctl = G.create($("aimMount"), {
      scenarioId: id,
      sens,
      calib: l.settings.calib,
      crosshair: l.settings.crosshair,
      targetColor: l.settings.targetColor,
      sound: l.settings.sound,
      kicker: extra.kicker,
      seed: extra.seed,
      title: extra.title,
      subtitle: extra.subtitle,
      onEnd: (stats) => endPlay(stats),
      onQuit: () => { ui.play = null; if (mode === "routine") ui.routine = null; render(true); }
    });
    ui.play = { ctl, id, mode, which: extra.which, sens, kicker: extra.kicker };
    const stage = box.querySelector(".aim-stage");
    if (stage) stage.focus({ preventScroll: true });
    const top = box.getBoundingClientRect().top;
    if (top < 0 || top > window.innerHeight * 0.4) window.scrollTo({ top: Math.max(0, window.scrollY + top - 12), behavior: "auto" });
  }

  function endPlay(stats) {
    const l = lab();
    const p = ui.play;
    if (!p) return;
    p.ctl.destroy();
    ui.play = null;
    if (p.mode === "finder") {
      const f = l.finder;
      if (f && !f.done) { A.finderScore(f, p.which, stats.score); if (stats.raw === false) f.noRaw = true; }
      l.runs.push({ t: Date.now(), sc: "senstest", score: stats.score, shots: stats.shots, hits: stats.hits, acc: stats.acc, ttk: stats.ttk, kps: stats.kps, sens: p.sens, dur: stats.dur });
      save();
      ui.tab = "finder";
      render(true);
      announce(`Prova finita: ${stats.score} punti`);
      return;
    }
    const run = A.recordRun(l, stats, { sens: p.sens, routine: p.mode === "routine" });
    const best = A.isBest(l, run);
    save();
    if (p.mode === "routine" && ui.routine) ui.routine.results[ui.routine.index] = { run, best };
    ui.result = { stats, run, best, mode: p.mode };
    render(true);
    announce(`${A.scenario(stats.sc).name}: ${stats.score} punti${best ? ", nuovo record" : ""}`);
  }

  function resultView(l) {
    const r = ui.result;
    const d = A.scenario(r.stats.sc);
    const st = r.stats;
    const per = A.stats(l).per[d.id];
    const items = [];
    if (st.acc != null) items.push(["Precisione", `${fmt(st.acc, 1)}%`]);
    if (d.id === "tracking") items.push(["Tempo addosso", `${fmt(st.track, 1)}%`]);
    if (d.id !== "tracking") items.push([d.id === "peek" ? "Teste" : "Bersagli", d.id === "peek" ? `${st.heads}/${d.reps}` : fmt(st.kills)]);
    if (st.ttk != null && !["peek", "reflex"].includes(d.id)) items.push(["Tempo medio per bersaglio", `${fmt(st.ttk)} ms`]);
    if (st.rt != null) items.push(["Reazione media", `${fmt(st.rt)} ms`]);
    if (st.vert != null) items.push(["Altezza media del mirino", `${fmt(st.vert, 2)}° dalla linea`]);
    if (st.escaped) items.push(["Scappati", fmt(st.escaped)]);
    if (d.duration && d.id !== "tracking") items.push(["Bersagli al secondo", fmt(st.kps, 2)]);
    const routine = r.mode === "routine" && ui.routine;
    const nextId = routine ? A.ROUTINE[ui.routine.index + 1] : null;
    const routineDone = routine && !nextId;
    const summary = routineDone ? `<h3 class="aim-h3">Routine completata</h3><ul class="aim-sum">${ui.routine.results.filter(Boolean).map((x) => `<li><span>${esc(A.scenario(x.run.sc).name)}</span><strong>${fmt(x.run.score)}</strong>${x.best ? `<em>record</em>` : ""}</li>`).join("")}</ul>` : "";
    return `
      <div class="aim-body">
        <article class="aim-result">
          <div class="aim-result-score"><strong>${fmt(st.score)}</strong><span>punti</span>${r.best ? `<em class="aim-record">Nuovo record</em>` : per.best != null ? `<em>record ${fmt(per.best)}</em>` : ""}</div>
          <div>
            <span class="aim-kicker">${routine ? `Routine · ${ui.routine.index + 1} di ${A.ROUTINE.length}` : "Risultato"}</span>
            <h2 data-focus-title>${esc(d.name)}</h2>
            <dl class="aim-stats">${items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
            ${st.raw === false ? `<p class="aim-note warn">Il browser non ha disattivato l'accelerazione del mouse: per una sensibilità identica a Valorant usa Chrome o Edge e, in Windows, togli "Precisione puntatore avanzata".</p>` : ""}
            <p class="aim-tip"><strong>Per la prossima</strong> ${esc(d.tip)}</p>
            ${summary}
            <div class="aim-row">
              ${nextId ? `<button type="button" class="aim-btn primary" data-aim="next">Prossimo: ${esc(A.scenario(nextId).name)}</button>` : ""}
              <button type="button" class="aim-btn ${nextId ? "" : "primary"}" data-aim="again" data-id="${d.id}">Rigioca</button>
              <button type="button" class="aim-btn ghost" data-aim="back">${routine && nextId ? "Interrompi la routine" : "Torna agli esercizi"}</button>
            </div>
          </div>
        </article>
      </div>`;
  }

  /* -------------------------------------------------------------- trova la sens */
  function finderView(l) {
    const s = l.settings;
    const f = l.finder;
    if (ui.calib) return calibView(l);
    if (!f) {
      return `
        <div class="aim-body">
          <article class="aim-panel">
            <span class="aim-kicker">Trova la sens</span>
            <h2 data-focus-title>Una sensibilità scelta da te, non copiata</h2>
            <p>Provi due sensibilità per 30 secondi ciascuna con lo stesso esercizio (flick lunghi e piccoli aggiustamenti). Scegli la migliore: l'intervallo si dimezza e si riparte, per ${A.FINDER_ROUNDS} turni. Alla fine hai il valore da mettere in Valorant. Ci vogliono circa 6 minuti.</p>
            <div class="aim-form">
              <label><span>DPI del mouse</span><input type="number" inputmode="numeric" min="100" max="32000" step="50" value="${s.dpi}" data-aim-input="dpi"></label>
              <label><span>Sens attuale in Valorant</span><input type="number" inputmode="decimal" min="0.02" max="10" step="0.001" value="${s.sens}" data-aim-input="sens"></label>
              <p class="aim-live-calc" id="aimCalc">eDPI ${fmt(A.edpi(s.dpi, s.sens))} · ${fmt(A.cm360(s.dpi, s.sens), 1)} cm per un giro completo</p>
            </div>
            <div class="aim-step">
              <h3>1. Verifica il mouse (consigliato, 2 minuti)</h3>
              <p>Controlla che qui un giro di 360 gradi richieda lo stesso movimento che in Valorant. ${calibBadge(s)}</p>
              <button type="button" class="aim-btn" data-aim="calib">${s.calib ? "Rifai la verifica" : "Verifica il 360"}</button>
            </div>
            <div class="aim-step">
              <h3>2. La ricerca</h3>
              <p>Parte dalla tua sens attuale e prova valori fino a ${fmt(A.FINDER_SPAN * 100 - 100)}% più alti e più bassi. Gioca come in partita, senza strafare: conta come ti trovi, non solo il punteggio.</p>
              <button type="button" class="aim-btn primary" data-aim="finder-start">Inizia la ricerca</button>
            </div>
          </article>
          ${historyBox(l)}
        </div>`;
    }
    if (f.done) {
      const res = f.result;
      return `
        <div class="aim-body">
          <article class="aim-panel aim-found">
            <span class="aim-kicker">Ricerca finita</span>
            <h2 data-focus-title>La tua sens: ${fmtSens(res)}</h2>
            <dl class="aim-stats big"><div><dt>In Valorant</dt><dd>${fmtSens(res)}</dd></div><div><dt>eDPI</dt><dd>${fmt(A.edpi(s.dpi, res))}</dd></div><div><dt>Giro completo</dt><dd>${fmt(A.cm360(s.dpi, res), 1)} cm</dd></div><div><dt>Partivi da</dt><dd>${fmtSens(f.base)}</dd></div></dl>
            ${f.edge ? `<p class="aim-note warn">Hai scelto sempre la sens ${f.edge === "low" ? "più bassa" : "più alta"}: la tua ideale potrebbe essere ancora ${f.edge === "low" ? "più bassa" : "più alta"}. Rifai la ricerca partendo da ${fmtSens(res)}.</p>` : ""}
            ${f.noRaw ? `<p class="aim-note warn">Durante la ricerca l'accelerazione del mouse era attiva: in Valorant la stessa sens combacia solo se in Windows hai tolto "Precisione puntatore avanzata".</p>` : ""}
            <p>Molti giocatori professionisti stanno tra circa 200 e 400 di eDPI: la tua è ${A.edpi(s.dpi, res) < 200 ? "più alta come movimento (sens bassa)" : A.edpi(s.dpi, res) > 400 ? "più veloce della media (sens alta)" : "nella fascia più usata"}. Usala almeno una settimana prima di cambiarla di nuovo: all'inizio ogni sens nuova sembra strana.</p>
            <div class="aim-row">
              ${A.roundSens(res) === A.roundSens(s.sens) ? `<span class="aim-badge ok">È già la tua sens</span>` : `<button type="button" class="aim-btn primary" data-aim="finder-use">Usa ${fmtSens(res)} come mia sens</button>`}
              <button type="button" class="aim-btn" data-aim="finder-again" data-from="${res}">Rifai partendo da ${fmtSens(res)}</button>
              <button type="button" class="aim-btn ghost" data-aim="finder-close" data-pending="${A.roundSens(res) === A.roundSens(s.sens) ? "" : "1"}">Chiudi</button>
            </div>
            <h3 class="aim-h3">I turni</h3>
            <ol class="aim-rounds">${f.history.map((h) => `<li><span>Turno ${h.round}</span><span class="${h.winner === "a" ? "win" : ""}">${fmtSens(h.a)} · ${h.scoreA == null ? "—" : fmt(h.scoreA)}</span><span class="${h.winner === "b" ? "win" : ""}">${fmtSens(h.b)} · ${h.scoreB == null ? "—" : fmt(h.scoreB)}</span><em>${h.winner === "tie" ? "pari" : h.winner === "a" ? "meglio la bassa" : "meglio l'alta"}</em></li>`).join("")}</ol>
          </article>
        </div>`;
    }
    const sug = A.finderSuggest(f);
    const both = f.scores.a != null && f.scores.b != null;
    const tile = (which) => {
      const sens = f[which];
      const sc = f.scores[which];
      const label = which === "a" ? "più bassa" : "più alta";
      return `<div class="aim-pair-item ${sc != null ? "done" : ""} ${both && sug === which ? "best" : ""}">
        <span>Sens ${which.toUpperCase()} · ${label}</span>
        <strong>${fmtSens(sens)}</strong>
        <em>${fmt(A.cm360(s.dpi, sens), 1)} cm/360</em>
        ${sc != null ? `<p class="aim-pair-score">${fmt(sc)} punti</p><button type="button" class="aim-link" data-aim="finder-play" data-which="${which}">Riprova</button>` : `<button type="button" class="aim-btn ${f.order.find((w) => f.scores[w] == null) === which ? "primary" : ""}" data-aim="finder-play" data-which="${which}">Prova la ${which.toUpperCase()}</button>`}
      </div>`;
    };
    const width = Math.log(f.hi / f.lo) / Math.log(A.FINDER_SPAN * A.FINDER_SPAN);
    return `
      <div class="aim-body">
        <article class="aim-panel">
          <span class="aim-kicker">Turno ${f.round + 1} di ${f.rounds}</span>
          <h2 data-focus-title>Quale sens va meglio?</h2>
          <div class="aim-progress" aria-label="Intervallo rimasto"><i style="width:${Math.max(4, Math.round(width * 100))}%"></i></div>
          <p class="aim-hint">Intervallo rimasto: da ${fmtSens(f.lo)} a ${fmtSens(f.hi)}. Prova tutte e due nell'ordine indicato, poi scegli. A e B hanno gli stessi bersagli: cambia solo la sens.</p>
          ${f.noRaw ? `<p class="aim-note warn">Il browser non ha disattivato l'accelerazione del mouse: i confronti valgono lo stesso, ma la sens finale combacia con Valorant solo se in Windows hai tolto "Precisione puntatore avanzata". Meglio Chrome o Edge.</p>` : ""}
          <div class="aim-pair">${f.order.map(tile).join("")}</div>
          ${both ? `
            <p class="aim-reco">${sug === "tie" ? "Punteggi quasi uguali: scegli a sensazione, quella con cui ti sei sentito più sicuro." : `Il punteggio dice ${sug === "a" ? "la bassa" : "l'alta"} (${fmtSens(f[sug])}). Se ti sei trovato meglio con l'altra, scegli quella: decidi tu.`}</p>
            <div class="aim-row">
              <button type="button" class="aim-btn ${sug === "a" ? "primary" : ""}" data-aim="finder-choose" data-w="a">Meglio la A (${fmtSens(f.a)})</button>
              <button type="button" class="aim-btn ${sug === "b" ? "primary" : ""}" data-aim="finder-choose" data-w="b">Meglio la B (${fmtSens(f.b)})</button>
              <button type="button" class="aim-btn ${sug === "tie" ? "primary" : ""}" data-aim="finder-choose" data-w="tie">Uguali</button>
            </div>` : ""}
          <div class="aim-row aim-row-end"><button type="button" class="aim-link" data-aim="finder-cancel">Interrompi la ricerca</button></div>
        </article>
      </div>`;
  }

  function historyBox(l) {
    if (!l.sensHistory.length) return "";
    return `<article class="aim-panel"><h3 class="aim-h3">Le tue sensibilità</h3><ul class="aim-hist">${l.sensHistory.slice(-8).reverse().map((h) => `<li><em>${new Date(h.t).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" })}</em><span>${fmtSens(h.from)} → <strong>${fmtSens(h.to)}</strong></span><span>${h.method === "ricerca" ? "dalla ricerca" : "a mano"}</span></li>`).join("")}</ul></article>`;
  }

  function calibView(l) {
    const s = l.settings;
    const c = ui.calib;
    if (c.phase === "measure") {
      return `<div class="aim-body aim-playing"><div class="aim-mount" id="aimMeasure"></div><p class="aim-tip"><strong>Ricorda</strong> Muovi solo in orizzontale, dal primo al secondo segno, a velocità tranquilla e costante: conta la distanza.</p></div>`;
    }
    if (c.phase === "result") {
      const r = c.res;
      const off = Math.round((r.measured / r.expected - 1) * 1000) / 10;
      return `
        <div class="aim-body">
          <article class="aim-panel">
            <span class="aim-kicker">Verifica del 360</span>
            <h2 data-focus-title>${r.ok ? "Il browser legge il mouse come Valorant" : "Il browser legge il mouse in modo diverso"}</h2>
            <p>Valorant usa ${fmt(r.expected)} unità per un giro alla sens ${fmtSens(r.sens)}; qui ne hai fatte ${fmt(r.measured)} (${off > 0 ? "+" : ""}${fmt(off, 1)}%). ${r.ok ? "Scarto sotto il 5%: va bene." : "Correggo io la sensibilità qui, così un giro richiede lo stesso movimento."}</p>
            ${Math.abs(off) > 40 ? `<p class="aim-note warn">Lo scarto è molto grande: controlla di aver usato la stessa sens e gli stessi DPI in Valorant, e di aver fatto un giro solo. Se puoi, rifai la misura.</p>` : ""}
            ${r.raw === false ? `<p class="aim-note warn">Il browser non ha disattivato l'accelerazione del mouse: con l'accelerazione il giro cambia con la velocità e nessuna correzione basta. Salvala solo se in Windows hai tolto "Precisione puntatore avanzata"; meglio rifare la misura con Chrome o Edge.</p>` : ""}
            ${r.raw === true && r.factor === 1 && r.measuredFactor !== 1 ? `<p class="aim-hint">Con l'input grezzo uno scarto così piccolo è normale nella misura a mano: tengo 1:1.</p>` : ""}
            <div class="aim-row">
              ${r.valid ? `<button type="button" class="aim-btn primary" data-aim="calib-save">Salva la correzione</button>` : `<p class="aim-note warn">Misura non valida: rifalla.</p>`}
              <button type="button" class="aim-btn" data-aim="calib-measure">Rifai la misura</button>
              <button type="button" class="aim-btn ghost" data-aim="calib-close">Annulla</button>
            </div>
          </article>
        </div>`;
    }
    return `
      <div class="aim-body">
        <article class="aim-panel">
          <span class="aim-kicker">Verifica del 360</span>
          <h2 data-focus-title>Stesso movimento qui e in Valorant</h2>
          ${c.msg ? `<p class="aim-note warn">${esc(c.msg)}</p>` : ""}
          <ol class="aim-steps">
            <li>In Valorant controlla di avere la sens <strong>${fmtSens(s.sens)}</strong> e il mouse a <strong>${fmt(s.dpi)} DPI</strong> (se no, cambiali nella pagina Impostazioni di qui).</li>
            <li>Vai nel Poligono, punta il mirino su uno spigolo verticale e fai un segno sul tappetino accanto al bordo sinistro del mouse.</li>
            <li>Muovi il mouse verso destra, piano, finché il mirino torna esattamente sullo stesso spigolo (un giro completo). Fai il secondo segno.</li>
            <li>Torna qui, metti il mouse sul primo segno e premi "Misura qui".</li>
          </ol>
          <div class="aim-row">
            <button type="button" class="aim-btn primary" data-aim="calib-measure">Misura qui</button>
            <button type="button" class="aim-btn ghost" data-aim="calib-close">Annulla</button>
          </div>
        </article>
      </div>`;
  }

  function startMeasure() {
    if (ui.measureCtl) return;
    const l = lab();
    const mount = $("aimMeasure");
    if (!mount) return;
    ui.measureCtl = G.measure(mount, {
      sens: l.settings.sens,
      calib: null,
      sound: l.settings.sound,
      onDone: (units, raw) => {
        ui.measureCtl = null;
        const res = A.calibrate(l.settings.sens, units, raw);
        ui.calib = res ? { phase: "result", res } : { phase: "intro", msg: "Non ho letto nessun movimento: rifai la misura muovendo il mouse dal primo al secondo segno." };
        render(true);
      },
      onCancel: () => { ui.measureCtl = null; ui.calib = { phase: "intro" }; render(true); }
    });
  }

  /* -------------------------------------------------------------- progressi */
  function spark(values) {
    if (values.length < 2) return `<span class="aim-spark-empty">—</span>`;
    const w = 120;
    const h = 30;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`).join(" ");
    return `<svg class="aim-spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}"/></svg>`;
  }

  function progressView(l) {
    const st = A.stats(l);
    const rows = A.SCENARIOS.filter((d) => !d.hidden).map((d) => {
      const p = st.per[d.id];
      const last = p.last;
      return `<tr><th scope="row">${esc(d.name)}</th><td>${p.best == null ? "—" : fmt(p.best)}</td><td>${p.avg5 == null ? "—" : fmt(p.avg5)}</td><td>${last ? `${fmt(last.score)}<em>${new Date(last.t).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</em>` : "—"}</td><td>${spark(p.trend)}</td></tr>`;
    }).join("");
    return `
      <div class="aim-body">
        <h2 class="aim-h2" data-focus-title>Progressi</h2>
        <div class="aim-tiles">
          <div><strong>${fmt(st.runs)}</strong><span>${st.runs === 1 ? "esercizio fatto" : "esercizi fatti"}</span></div>
          <div><strong>${fmt(st.minutes)}</strong><span>minuti di mira</span></div>
          <div><strong>${fmt(st.streak)}</strong><span>${st.streak === 1 ? "giorno di fila" : "giorni di fila"}</span></div>
          <div><strong>${st.routineToday ? "Fatta" : "Da fare"}</strong><span>routine di oggi</span></div>
        </div>
        <div class="aim-table-wrap"><table class="aim-table"><thead><tr><th scope="col">Esercizio</th><th scope="col">Record</th><th scope="col">Media ultime 5</th><th scope="col">Ultima</th><th scope="col">Andamento</th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="aim-hint">Il record conta, ma conta di più la media delle ultime 5: se sale, stai migliorando davvero.</p>
        ${historyBox(l)}
      </div>`;
  }

  /* -------------------------------------------------------------- impostazioni */
  function settingsView(l) {
    const s = l.settings;
    const ch = s.crosshair;
    const sw = (key, colors, current) => colors.map((c) => `<button type="button" class="aim-swatch" style="--sw:${c}" data-aim="color" data-key="${key}" data-color="${c}" aria-pressed="${c === current}" aria-label="Colore ${c}"></button>`).join("");
    const range = (key, label, min, max, value) => `<label class="aim-range"><span>${label} <output id="aimOut-${key}">${value}</output></span><input type="range" min="${min}" max="${max}" step="1" value="${value}" data-aim-input="ch-${key}"></label>`;
    return `
      <div class="aim-body">
        <h2 class="aim-h2" data-focus-title>Impostazioni</h2>
        <div class="aim-settings">
          <article class="aim-panel">
            <h3 class="aim-h3">Sensibilità</h3>
            <div class="aim-form">
              <label><span>DPI del mouse</span><input type="number" inputmode="numeric" min="100" max="32000" step="50" value="${s.dpi}" data-aim-input="dpi"></label>
              <label><span>Sens in Valorant</span><input type="number" inputmode="decimal" min="0.02" max="10" step="0.001" value="${s.sens}" data-aim-input="sens"></label>
              <p class="aim-live-calc" id="aimCalc">eDPI ${fmt(A.edpi(s.dpi, s.sens))} · ${fmt(A.cm360(s.dpi, s.sens), 1)} cm per un giro completo</p>
            </div>
            <p class="aim-hint">Qui ogni movimento del mouse gira la visuale di sens × 0,07 gradi, come in Valorant, con campo visivo di 103 gradi. Combacia davvero con Chrome o Edge (input grezzo) e zoom della pagina al 100%; la verifica del 360 lo conferma. ${calibBadge(s)}</p>
            ${s.calib ? `<button type="button" class="aim-link" data-aim="calib-remove">Togli la correzione del mouse</button>` : `<button type="button" class="aim-link" data-aim="calib">Verifica il mouse con il 360</button>`}
          </article>
          <article class="aim-panel">
            <h3 class="aim-h3">Mirino</h3>
            <canvas class="aim-preview" id="aimPreview" width="240" height="140" aria-label="Anteprima del mirino"></canvas>
            <div class="aim-swatches" role="group" aria-label="Colore del mirino">${sw("crosshair", A.COLORS, ch.color)}</div>
            ${range("len", "Lunghezza", 0, 20, ch.len)}
            ${range("thick", "Spessore", 1, 6, ch.thick)}
            ${range("gap", "Distanza dal centro", 0, 20, ch.gap)}
            <div class="aim-toggles">
              <button type="button" class="aim-toggle" data-aim="toggle" data-key="dot" aria-pressed="${ch.dot}">Punto centrale</button>
              <button type="button" class="aim-toggle" data-aim="toggle" data-key="outline" aria-pressed="${ch.outline}">Bordo nero</button>
            </div>
          </article>
          <article class="aim-panel">
            <h3 class="aim-h3">Bersagli e suoni</h3>
            <div class="aim-swatches" role="group" aria-label="Colore dei bersagli">${sw("target", ["#33e0ff", "#ffe14d", "#ff4dff", "#2ef27a", "#ff9d4d"], s.targetColor)}</div>
            <div class="aim-toggles"><button type="button" class="aim-toggle" data-aim="toggle" data-key="sound" aria-pressed="${s.sound}">Suoni</button></div>
          </article>
        </div>
      </div>`;
  }

  function paintPreview() {
    const cv = $("aimPreview");
    if (!cv) return;
    const l = lab();
    const ch = l.settings.crosshair;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = 240 * dpr;
    cv.height = 140 * dpr;
    const c = cv.getContext("2d");
    c.fillStyle = "#27303d";
    c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = "#3a4656";
    c.fillRect(0, cv.height * 0.62, cv.width, cv.height);
    const s = dpr * 1.5;
    const cx = Math.round(cv.width / 2);
    const cy = Math.round(cv.height / 2);
    const t = ch.thick * s;
    const gap = ch.gap * s;
    const len = ch.len * s;
    const rects = [];
    if (len > 0) rects.push([cx + gap, cy - t / 2, len, t], [cx - gap - len, cy - t / 2, len, t], [cx - t / 2, cy + gap, t, len], [cx - t / 2, cy - gap - len, t, len]);
    if (ch.dot) rects.push([cx - t / 2, cy - t / 2, t, t]);
    if (ch.outline) { c.fillStyle = "rgba(0,0,0,0.85)"; rects.forEach(([x, y, w, h]) => c.fillRect(x - s, y - s, w + 2 * s, h + 2 * s)); }
    c.fillStyle = ch.color;
    rects.forEach(([x, y, w, h]) => c.fillRect(x, y, w, h));
  }

  function updateCalc() {
    const l = lab();
    const el = $("aimCalc");
    if (el) el.textContent = `eDPI ${fmt(A.edpi(l.settings.dpi, l.settings.sens))} · ${fmt(A.cm360(l.settings.dpi, l.settings.sens), 1)} cm per un giro completo`;
    renderChip(l);
  }

  /* -------------------------------------------------------------- azioni */
  function confirmTwice(el, label) {
    if (el.dataset.armed && Date.now() - Number(el.dataset.armed) > 350) return true;
    if (!el.dataset.armed) {
      const original = el.textContent;
      el.dataset.armed = String(Date.now());
      el.textContent = label;
      setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = original; } }, 3000);
    }
    return false;
  }

  function onClick(event) {
    const el = event.target.closest("[data-aim], [data-aim-tab]");
    if (!el) return;
    if (el.dataset.aimTab) {
      if (ui.play) return;
      ui.tab = el.dataset.aimTab;
      ui.result = null;
      ui.calib = null;
      if (ui.measureCtl) { ui.measureCtl.destroy(); ui.measureCtl = null; }
      render(true);
      return;
    }
    const l = lab();
    switch (el.dataset.aim) {
      case "tab": ui.tab = el.dataset.tab; ui.result = null; render(true); break;
      case "play": startPlay(el.dataset.id, "free"); break;
      case "again": {
        const inRoutine = ui.result && ui.result.mode === "routine" && ui.routine;
        startPlay(el.dataset.id, inRoutine ? "routine" : "free", inRoutine ? { kicker: `Routine · ${ui.routine.index + 1} di ${A.ROUTINE.length}` } : {});
        break;
      }
      case "routine": ui.routine = { index: 0, results: [] }; startPlay(A.ROUTINE[0], "routine", { kicker: `Routine · 1 di ${A.ROUTINE.length}` }); break;
      case "next":
        if (!ui.routine) break;
        ui.routine.index += 1;
        startPlay(A.ROUTINE[ui.routine.index], "routine", { kicker: `Routine · ${ui.routine.index + 1} di ${A.ROUTINE.length}` });
        break;
      case "back": ui.result = null; ui.routine = null; render(true); break;
      case "finder-start": {
        l.finder = A.finderStart(l.settings.sens);
        save();
        render(true);
        announce(`Ricerca iniziata: turno 1, sens ${fmtSens(l.finder.a)} e ${fmtSens(l.finder.b)}`);
        break;
      }
      case "finder-play": {
        const f = l.finder;
        if (!f || f.done) break;
        const which = el.dataset.which;
        startPlay("senstest", "finder", { which, sens: f[which], seed: f.seed, kicker: `Trova la sens · turno ${f.round + 1} di ${f.rounds}`, title: `Prova ${which.toUpperCase()}: sens ${fmtSens(f[which])}`, subtitle: "Flick lunghi e piccoli aggiustamenti alternati, 30 secondi. Gioca come in partita." });
        break;
      }
      case "finder-choose": {
        const f = l.finder;
        if (!f || f.done) break;
        A.finderChoose(f, el.dataset.w);
        save();
        render(true);
        announce(f.done ? `Ricerca finita: la tua sens è ${fmtSens(f.result)}` : `Turno ${f.round + 1}: sens ${fmtSens(f.a)} e ${fmtSens(f.b)}`);
        break;
      }
      case "finder-use": {
        const f = l.finder;
        if (!f || !f.done) break;
        A.setSens(l, f.result, { method: "ricerca" });
        save();
        render(true);
        announce(`Sens impostata: ${fmtSens(f.result)}. Mettila anche in Valorant.`);
        break;
      }
      case "finder-restart":
        if (!confirmTwice(el, "Conferma: rifai da capo")) break;
        l.finder = A.finderStart(l.settings.sens);
        save();
        render(true);
        break;
      case "finder-cancel":
        if (!confirmTwice(el, "Conferma: interrompi")) break;
        l.finder = null;
        save();
        render(true);
        break;
      case "finder-close":
        if (el.dataset.pending && !confirmTwice(el, "Chiudi senza usarla?")) break;
        l.finder = null;
        save();
        render(true);
        break;
      case "finder-again": {
        const from = Number(el.dataset.from);
        l.finder = A.finderStart(Number.isFinite(from) && from > 0 ? from : l.settings.sens);
        save();
        render(true);
        announce(`Nuova ricerca da ${fmtSens(l.finder.base)}`);
        break;
      }
      case "calib": ui.tab = "finder"; ui.result = null; ui.calib = { phase: "intro" }; render(true); break;
      case "calib-measure": ui.calib = { phase: "measure" }; render(true); break;
      case "calib-close": ui.calib = null; render(true); break;
      case "calib-save":
        if (ui.calib && ui.calib.res && ui.calib.res.valid) { l.settings.calib = Object.assign({ t: Date.now() }, ui.calib.res); save(); }
        ui.calib = null;
        render(true);
        announce("Correzione del mouse salvata");
        break;
      case "calib-remove": l.settings.calib = null; save(); render(false); announce("Correzione tolta"); break;
      case "color": {
        if (el.dataset.key === "crosshair") l.settings.crosshair.color = el.dataset.color;
        else l.settings.targetColor = el.dataset.color;
        save();
        el.parentElement.querySelectorAll("[data-aim='color']").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
        paintPreview();
        break;
      }
      case "toggle": {
        const key = el.dataset.key;
        if (key === "sound") l.settings.sound = !l.settings.sound;
        else l.settings.crosshair[key] = !l.settings.crosshair[key];
        el.setAttribute("aria-pressed", String(key === "sound" ? l.settings.sound : l.settings.crosshair[key]));
        save();
        paintPreview();
        break;
      }
      default: break;
    }
  }

  // Campi numerici: si aggiorna mentre scrivi; lo storico della sens si annota quando confermi.
  function onInput(event, final) {
    const el = event.target.closest("[data-aim-input]");
    if (!el) return;
    const l = lab();
    const key = el.dataset.aimInput;
    const v = Number(String(el.value).replace(",", "."));
    if (key === "dpi") {
      if (Number.isFinite(v) && v >= 100 && v <= 32000) { l.settings.dpi = Math.round(v); el.removeAttribute("aria-invalid"); save(); updateCalc(); } else if (final) el.setAttribute("aria-invalid", "true");
    } else if (key === "sens") {
      if (Number.isFinite(v) && v > 0.01 && v <= 10) {
        if (final) {
          const before = Number(el.dataset.before);
          l.settings.sens = Number.isFinite(before) ? before : l.settings.sens;
          // la correzione del mouse resta valida: dipende dal mouse e dal browser, non dalla sens
          A.setSens(l, v, { method: "manuale" });
          el.dataset.before = String(l.settings.sens);
        } else {
          l.settings.sens = A.roundSens(v);
        }
        el.removeAttribute("aria-invalid");
        save();
        updateCalc();
      } else if (final) {
        // valore non valido: si torna alla sens di prima (nel campo e nei dati)
        const before = Number(el.dataset.before);
        if (Number.isFinite(before) && before > 0.01) l.settings.sens = before;
        el.value = String(l.settings.sens);
        el.removeAttribute("aria-invalid");
        save();
        updateCalc();
      }
    } else if (key.startsWith("ch-")) {
      const k = key.slice(3);
      l.settings.crosshair[k] = Math.round(v);
      const out = $(`aimOut-${k}`);
      if (out) out.textContent = String(Math.round(v));
      save();
      paintPreview();
    }
  }

  function stopAll() {
    if (ui.play) { ui.play.ctl.destroy(); ui.play = null; ui.routine = null; }
    if (ui.measureCtl) { ui.measureCtl.destroy(); ui.measureCtl = null; if (ui.calib) ui.calib = { phase: "intro" }; }
  }

  window.AimUI = { render, stop: stopAll, renderCard };
  if (window.__AIM_TEST__) window.AimUI.debug = ui;

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("aim");
    if (!page) return;
    page.addEventListener("click", onClick);
    page.addEventListener("focusin", (e) => { const el = e.target.closest('[data-aim-input="sens"]'); if (el) el.dataset.before = String(lab().settings.sens); });
    page.addEventListener("input", (e) => onInput(e, false));
    page.addEventListener("change", (e) => onInput(e, true));
    window.addEventListener("hashchange", () => {
      if (location.hash === "#aim") { if (!ui.play) render(false); } else { stopAll(); }
    });
    render(false);
    renderCard();
  });
})();
