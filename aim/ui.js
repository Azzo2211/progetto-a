/*
 * Progetto A - Mira: la pagina (allenamento, cecchino, routine, ricerca della sens, progressi, impostazioni).
 * Motore: AimEngine (aim/engine.js). Gioco: AimGame (aim/game.js). Stato: state.aimLab.
 */
(function () {
  "use strict";

  const A = window.AimEngine;
  const G = window.AimGame;
  if (!A || !G) return;

  const ui = {
    tab: "train",        // train | sniper | finder | progress | settings
    play: null,          // { ctl, id, mode: free|routine|finder|warm, which, sens, lv }
    routine: null,       // { index, results: [], list: id degli esercizi, name }
    result: null,        // { run, best, mode }
    detail: null,        // partita aperta dai progressi
    calib: null,         // misura del 360: { phase: intro|measure|result, res }
    measureCtl: null,
    finderMode: "precisa",
    finderJust: null,    // la sens appena provata (si chiede com'era)
    reveal: null,        // turno appena scelto: { round, a, b, la, winner }
    prog: { sc: "gridshot", lv: null, metric: "score", more: 20 },
    charts: new Map()
  };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const fmt = (n, d = 0) => (!num(n) ? "—" : n.toLocaleString("it-IT", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const fmtSens = (s) => (num(s) ? String(A.roundSens(s)).replace(".", ",") : "—");
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const finePointer = () => !window.matchMedia || window.matchMedia("(any-pointer: fine)").matches;
  const LV = (n) => (A.LEVELS.find((l) => l.id === n) || A.LEVELS[0]).name;
  const dateShort = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const dateLong = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
  const timeOf = (t) => new Date(t).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const fmtMetric = (key, v) => { const m = A.METRICS[key]; return m && num(v) ? `${fmt(v, m.d)}${m.unit}` : "—"; };
  const signed = (v, d = 0) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${fmt(Math.abs(v), d)}`;
  const durOf = (d) => (d.duration ? `${d.duration} s` : `${d.reps} volte`);

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
    ui.charts.clear();
    let html = "";
    if (ui.result) html = runView(ui.result.run, { best: ui.result.best, mode: ui.result.mode });
    else if (ui.detail) html = runView(ui.detail, { detail: true });
    else if (ui.tab === "train") html = trainView(l);
    else if (ui.tab === "sniper") html = sniperView(l);
    else if (ui.tab === "finder") html = finderView(l);
    else if (ui.tab === "progress") html = progressView(l);
    else html = settingsView(l);
    box.innerHTML = html;
    if (ui.tab === "settings" && !ui.result && !ui.detail) paintPreview();
    if (ui.calib && ui.calib.phase === "measure") startMeasure();
    paintCharts();
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
    const g = st.per.gridshot;
    const row = (label, value, pct) => `<div class="dashboard-value-row"><span>${label}</span><strong>${value}</strong><div class="mini-track"><div class="mini-fill" style="width:${clamp(pct, 0, 100)}%"></div></div></div>`;
    box.innerHTML = `<div class="dashboard-value-list">
      ${row("Sens", fmtSens(l.settings.sens), Math.min(100, A.edpi(l.settings.dpi, l.settings.sens) / 8))}
      ${row(`Record Gridshot (${LV(g.lv)})`, g.best == null ? "—" : fmt(g.best), g.best ? Math.min(100, g.best / 120) : 0)}
      ${row("Giorni di fila", st.streak, Math.min(100, st.streak * 10))}
    </div>`;
  }

  /* -------------------------------------------------------------- allenamento */
  function levelPicker(d, lv) {
    return `<div class="aim-levels" role="group" aria-label="Livello di ${esc(d.name)}">${A.LEVELS.map((L) => `<button type="button" data-aim="level" data-id="${d.id}" data-lv="${L.id}" aria-pressed="${L.id === lv}">${L.name}</button>`).join("")}</div>`;
  }

  function scenarioCard(l, st, d) {
    const p = st.per[d.id];
    const adv = A.levelAdvice(l, d.id);
    const W = d.weapon ? A.WEAPONS[d.weapon] : null;
    return `
        <article class="aim-card${W ? " sniper" : ""}">
          <header><h3>${esc(d.name)}</h3><span>${durOf(d)}</span></header>
          ${W ? `<span class="aim-weapon">${esc(W.name)}</span>` : ""}
          <p class="aim-trains">${esc(d.trains)}</p>
          <p>${esc(d.text)}</p>
          ${d.keys ? `<p class="aim-keys-note">Serve la tastiera: <kbd>A</kbd> e <kbd>D</kbd> per muoverti.</p>` : ""}
          ${levelPicker(d, p.lv)}
          <p class="aim-level-text">${esc(d.levels[p.lv - 1])}</p>
          <dl class="aim-mini"><div><dt>Record</dt><dd>${p.best == null ? "—" : fmt(p.best)}</dd></div><div><dt>Media ultime 5</dt><dd>${p.avg5 == null ? "—" : fmt(p.avg5)}</dd></div><div><dt>Partite</dt><dd>${p.count}</dd></div></dl>
          ${adv && adv.ready ? `<div class="aim-up"><p>Pronto per il livello ${LV(adv.next)}. Media delle ultime 3 partite: ${esc(adv.label.toLowerCase())} ${fmtMetric(adv.key, adv.value)} (serve almeno ${fmtMetric(adv.key, adv.min)}).</p><button type="button" class="aim-link" data-aim="level" data-id="${d.id}" data-lv="${adv.next}">Passa a ${LV(adv.next)}</button></div>` : ""}
          <button type="button" class="aim-btn" data-aim="play" data-id="${d.id}">Gioca</button>
        </article>`;
  }

  /* -------------------------------------------------------------- cecchino */
  const SNIPER_SOURCES = [
    ["Operator (Liquipedia)", "https://liquipedia.net/valorant/Operator"],
    ["Prezzi della patch 3.0: Marshal 950, Operator 4700 (Dexerto)", "https://www.dexerto.com/valorant/valorant-update-3-0-patch-notes-1597515/"],
    ["Patch 2.03: zoom del Marshal 3,5x e movimento nello scope (Sportskeeda)", "https://www.sportskeeda.com/valorant/valorant-tweaks-weapons-compensate-run-n-gun-ability-massively-buffs-marshall"],
    ["Outlaw (TheSpike)", "https://www.thespike.gg/valorant/weapons/snipers/valorant-outlaw-gun"],
    ["Marshal: danni e cadenza (Dodge.gg, 2026)", "https://www.dodge.gg/en-US/valorant/news/marshal-weapon-guide-2026"],
    ["Patch 13.00-13.08: Operator e Marshal senza modifiche, Outlaw ritoccato nella 13.01 (Metammo)", "https://metammo.com/valorant-guide/updates"],
    ["Zoom e sens nello scope: campo visivo 103 / ingrandimento, moltiplicatore 1 ai bordi dello schermo (game-sens.jor.dev)", "https://game-sens.jor.dev/"]
  ];
  const SNIPER_TIPS = [
    ["Mirino già sull'angolo", "Con il fucile di precisione non si insegue: si mette il mirino dove il nemico deve passare, all'altezza della testa o del petto, e si clicca quando entra. L'esercizio \"Tieni l'angolo\" allena proprio questo."],
    ["Movimento grande senza scope", "Il flick lungo si fa senza scope, dove la sens è piena e il campo visivo largo. Lo scope serve solo per l'ultimo aggiustamento, piccolo."],
    ["Operator: basta il busto", "Il colpo al busto fa 150 danni e toglie tutti i 150 punti di vita e scudo pesante. Alle gambe fa 120 e non basta: mira dal petto in su."],
    ["Marshal: serve la testa", "Al busto fa 101 danni, alla testa 202. Contro chi ha lo scudo pesante, un colpo al busto non basta: tieni il mirino all'altezza della testa. In compenso spara 1,5 colpi al secondo, più del doppio dell'Operator (0,6)."],
    ["Dopo il colpo, spostati", "Lo sparo del fucile si sente e la scia del colpo mostra da dove arriva: dopo un'uccisione o un colpo mancato esci dallo scope e cambia posizione invece di ripetere lo stesso angolo."],
    ["Fermo quando spari", "I fucili sono precisi solo da fermo e nello scope; mentre ti muovi nello scope vai anche più piano (Operator al 72% della velocità, Marshal al 90%)."],
    ["Quando comprarli", "Il Marshal costa 950 crediti: va bene nei turni con pochi soldi, se la mappa ha linee lunghe. L'Operator costa 4700 e dà il massimo nei turni pieni, tenendo un angolo lungo."],
    ["La sens nello scope", "Valorant ha un moltiplicatore per lo scope (Scoped Sensitivity Multiplier, predefinito 1). Usa qui lo stesso valore del gioco, così l'allenamento passa alla partita."]
  ];

  function sniperView(l) {
    const st = A.stats(l);
    const s = l.settings;
    const today = l.runs.filter((r) => A.dayKey(r.t) === A.dayKey(Date.now()));
    const rows = A.SNIPER_ROUTINE.map((id) => {
      const d = A.scenario(id);
      const done = today.some((r) => r.sc === id);
      return `<li class="${done ? "done" : ""}"><span class="aim-check" aria-hidden="true">${done ? "✓" : ""}</span><strong>${esc(d.name)}</strong><em>${esc(A.WEAPONS[d.weapon].name)} · ${LV(A.levelOf(l, id))}</em><span class="aim-sr">${done ? "fatto oggi" : "da fare"}</span></li>`;
    }).join("");
    const cards = A.SNIPER.map((id) => scenarioCard(l, st, A.scenario(id))).join("");
    const W = A.WEAPONS;
    const weapons = [W.operator, W.marshal, W.outlaw];
    const oneShot = { operator: "testa e busto", marshal: "solo testa", outlaw: "solo testa (due colpi al busto bastano)" };
    const row = (label, f) => `<tr><th scope="row">${label}</th>${weapons.map((w) => `<td>${f(w)}</td>`).join("")}</tr>`;
    const cm = A.cm360(s.dpi, s.sens);
    const zooms = [2.5, 3.5, 5];
    const scopeRows = zooms.map((z) => `<tr><th scope="row">${fmt(z, 1)}x<em>${z === 2.5 ? "Operator" : z === 3.5 ? "Marshal, Outlaw" : "Operator, secondo zoom"}</em></th><td>${fmt(A.scopeFov(z), 1)}°</td><td data-scope-cm="${z}">${fmt(cm / A.scopeFactor(z, s.scopeMult), 0)} cm</td><td>${fmt(A.zeroMatch(z), 2)}</td></tr>`).join("");
    return `
      <div class="aim-body">
        ${finePointer() ? "" : `<p class="aim-note warn">Per allenarti serve il computer con il mouse: qui puoi leggere i dati e i consigli.</p>`}
        <article class="aim-routine sniper">
          <div>
            <span class="aim-kicker">Cecchino · Operator e Marshal</span>
            <h2 data-focus-title>Routine del cecchino</h2>
            <p>Quattro esercizi di fila, circa 5 minuti: flick con lo scope e tenuta dell'angolo con l'Operator, colpo alla testa e quickscope con il Marshal. Tasto destro per lo scope, sinistro per sparare; dopo ogni colpo esci dallo scope e il fucile si ricarica, come in partita.</p>
            <button type="button" class="aim-btn primary" data-aim="routine" data-list="sniper">${st.sniperToday ? "Rifai la routine del cecchino" : "Inizia la routine del cecchino"}</button>
          </div>
          <ol class="aim-routine-list">${rows}</ol>
        </article>
        <h2 class="aim-h2">Esercizi da cecchino</h2>
        <p class="aim-hint">Stessi tre livelli degli altri esercizi. I nemici hanno 150 punti tra vita e scudo pesante: con l'Operator basta il busto, con il Marshal serve la testa (o due colpi al busto).</p>
        <div class="aim-cards">${cards}</div>
        <div class="aim-sniper-grid">
          <article class="aim-panel">
            <h3 class="aim-h3">La sens nello scope</h3>
            <div class="aim-form">
              <label><span>Moltiplicatore dello scope (come in Valorant, da 0,1 a 3)</span><input type="number" inputmode="decimal" min="0.1" max="3" step="0.01" value="${s.scopeMult}" data-aim-input="scopeMult" aria-describedby="aimScopeHelp"></label>
            </div>
            <div class="aim-toggles"><button type="button" class="aim-toggle" data-aim="toggle" data-key="scopeHold" aria-pressed="${s.scopeHold}">Scope tenendo premuto il tasto</button></div>
            <p class="aim-hint" id="aimScopeHelp">Spento: un clic entra nello scope (con l'Operator il secondo passa al 5x, il terzo esce). Acceso: resti nello scope finché tieni premuto.</p>
            <div class="aim-table-wrap"><table class="aim-table"><thead><tr><th scope="col">Zoom</th><th scope="col">Campo visivo</th><th scope="col">Un giro nello scope</th><th scope="col">Uguale vicino al mirino</th></tr></thead><tbody>${scopeRows}</tbody></table></div>
            <p class="aim-hint">In Valorant lo zoom divide il campo visivo (103° / 2,5 = 41,2°). Con il moltiplicatore a 1, il valore predefinito, anche la sens nello scope si divide per lo zoom: un movimento sposta il mirino della stessa distanza sullo schermo, misurata ai bordi. Per sentire uguali i piccoli movimenti vicino al mirino servirebbe il valore dell'ultima colonna (circa 0,75 per il 2,5x, calcolato da noi). Non c'è un valore giusto per tutti: tieni quello che usi in partita.</p>
          </article>
          <article class="aim-panel">
            <h3 class="aim-h3">I tre fucili a confronto</h3>
            <div class="aim-table-wrap"><table class="aim-table aim-weapons"><thead><tr><th scope="col"></th>${weapons.map((w) => `<th scope="col">${esc(w.name)}</th>`).join("")}</tr></thead><tbody>
              ${row("Prezzo", (w) => `${fmt(w.price)} crediti`)}
              ${row("Danni: testa / busto / gambe", (w) => `${w.dmg.head} / ${w.dmg.body} / ${w.dmg.legs}`)}
              ${row("Uccide con un colpo (150 punti)", (w) => oneShot[w.id])}
              ${row("Colpi al secondo", (w) => fmt(w.rps, 2))}
              ${row("Zoom", (w) => w.zooms.map((z) => `${fmt(z, 1)}x`).join(" e "))}
              ${row("Colpi nel caricatore", (w) => fmt(w.mag))}
              ${row("Velocità nello scope", (w) => `${fmt(w.scopedMove * 100)}%`)}
              ${row("Penetrazione dei muri", (w) => w.pen)}
            </tbody></table></div>
            <p class="aim-hint">Dati controllati il 21 ottobre 2026: nelle patch 13.x Operator e Marshal non sono cambiati, l'Outlaw ha avuto un ritocco al rinculo nella 13.01. Se una patch li cambia, i numeri qui vanno aggiornati.</p>
            <ul class="aim-sources">${SNIPER_SOURCES.map(([t, u]) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${esc(t)}<span class="aim-sr"> (si apre in una nuova scheda)</span></a></li>`).join("")}</ul>
          </article>
        </div>
        <article class="aim-panel">
          <h3 class="aim-h3">Come si gioca da cecchino</h3>
          <ul class="aim-tips">${SNIPER_TIPS.map(([h, t]) => `<li><strong>${esc(h)}</strong><span>${esc(t)}</span></li>`).join("")}</ul>
        </article>
      </div>`;
  }

  function trainView(l) {
    const st = A.stats(l);
    const s = l.settings;
    const today = l.runs.filter((r) => A.dayKey(r.t) === A.dayKey(Date.now()));
    const routineRows = A.ROUTINE.map((id) => {
      const d = A.scenario(id);
      const done = today.some((r) => r.sc === id);
      return `<li class="${done ? "done" : ""}"><span class="aim-check" aria-hidden="true">${done ? "✓" : ""}</span><strong>${esc(d.name)}</strong><em>${LV(A.levelOf(l, id))} · ${durOf(d)}</em><span class="aim-sr">${done ? "fatto oggi" : "da fare"}</span></li>`;
    }).join("");
    const cards = A.SCENARIOS.filter((d) => !d.hidden && !d.weapon).map((d) => scenarioCard(l, st, d)).join("");
    return `
      <div class="aim-body">
        ${finePointer() ? "" : `<p class="aim-note warn">Sul telefono puoi guardare i progressi. Per allenarti apri l'app sul computer, con il mouse: serve per la mira e per la sensibilità.</p>`}
        <div class="aim-sensbar"><span>Sens ${esc(sensLine(s))}</span>${calibBadge(s)}<button type="button" class="aim-link" data-aim="tab" data-tab="settings">Cambia</button></div>
        <article class="aim-routine">
          <div>
            <span class="aim-kicker">Routine del giorno · circa 9 minuti</span>
            <h2 data-focus-title>Riscaldamento per Valorant</h2>
            <p>Sette esercizi di fila, dal più facile al più vicino alla partita: velocità, precisione sulla testa, linea del mirino, counter-strafe, peek, duelli, tracking. Falla prima di giocare. Ogni esercizio usa il livello che hai scelto qui sotto.</p>
            <button type="button" class="aim-btn primary" data-aim="routine">${st.routineToday ? "Rifai la routine" : "Inizia la routine"}</button>
          </div>
          <ol class="aim-routine-list">${routineRows}</ol>
        </article>
        <h2 class="aim-h2">Esercizi</h2>
        <p class="aim-hint">Tre livelli per esercizio: quando le ultime 3 partite superano la soglia, l'app ti propone di salire. Record e medie sono separati per livello.</p>
        <div class="aim-cards">${cards}</div>
      </div>`;
  }

  /* -------------------------------------------------------------- gioco */
  function startPlay(id, mode, extra = {}) {
    const l = lab();
    const d = A.scenario(id);
    if (!finePointer()) announce("Serve un computer con il mouse");
    const box = $("aimPanel");
    ui.result = null;
    ui.detail = null;
    const sens = extra.sens || l.settings.sens;
    const lv = d.lv ? (extra.lv || A.levelOf(l, id)) : 1;
    box.innerHTML = `<div class="aim-body aim-playing"><div class="aim-mount" id="aimMount"></div><p class="aim-tip"><strong>Consiglio</strong> ${esc(d.tip)}</p></div>`;
    const ctl = G.create($("aimMount"), {
      scenarioId: id,
      sens,
      lv,
      blind: !!extra.blind,
      calib: l.settings.calib,
      crosshair: l.settings.crosshair,
      targetColor: l.settings.targetColor,
      scopeMult: l.settings.scopeMult,
      scopeHold: l.settings.scopeHold,
      sound: l.settings.sound,
      kicker: extra.kicker,
      seed: extra.seed,
      title: extra.title,
      subtitle: extra.subtitle,
      onEnd: (stats) => endPlay(stats),
      onQuit: () => { ui.play = null; if (mode === "routine") ui.routine = null; render(true); }
    });
    ui.play = { ctl, id, mode, which: extra.which, sens, lv };
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
    if (p.mode === "finder" || p.mode === "warm") {
      const f = l.finder;
      A.recordRun(l, stats, { sens: p.sens });
      if (f && !f.done) {
        if (stats.raw === false) f.noRaw = true;
        if (p.mode === "warm") f.warm = true;
        else if (A.finderRecord(f, p.which, stats)) ui.finderJust = p.which;
      }
      save();
      ui.tab = "finder";
      render(true);
      announce(p.mode === "warm" ? "Riscaldamento fatto" : `Prova finita: ${stats.score} punti. Com'era questa sens?`);
      return;
    }
    const run = A.recordRun(l, stats, { sens: p.sens, routine: p.mode === "routine" });
    if (!run) { render(true); return; }
    const best = A.isBest(l, run);
    save();
    if (p.mode === "routine" && ui.routine) ui.routine.results[ui.routine.index] = { run, best };
    ui.result = { run, best, mode: p.mode };
    render(true);
    announce(`${A.scenario(run.sc).name}: ${run.score} punti${best ? ", nuovo record" : ""}`);
  }

  /* -------------------------------------------------------------- una partita: tutti i dati */
  function itemsOf(run) {
    const d = A.scenario(run.sc);
    const headOnly = ["peek", "duel", "strafe"].includes(run.sc);
    const items = [];
    const add = (k, v, note) => items.push([k, v, note]);
    if (num(run.acc)) add("Precisione", `${fmt(run.acc, 1)}%`, num(run.shots) ? (headOnly ? `${fmt(run.heads || 0)} teste su ${fmt(run.shots)} colpi` : `${fmt(run.hits || 0)} a segno su ${fmt(run.shots)}`) : "");
    if (num(run.win)) add("Riusciti", `${fmt(run.win)}%`, num(run.reps) ? `${fmt(run.kills || 0)} su ${fmt(run.reps)}` : "");
    if (d.duration && run.sc !== "tracking" && run.sc !== "senstest") { add("Bersagli", fmt(run.kills)); add("Bersagli al secondo", fmt(run.kps, 2)); }
    if (run.shots && run.sc !== "tracking") add("Colpi mancati", fmt(run.misses));
    if (num(run.ttk) && !num(run.rt)) add("Tempo per bersaglio", `${fmt(run.ttk)} ms`, num(run.ttkMed) ? `mediana ${fmt(run.ttkMed)} · migliore ${fmt(run.ttkBest)} ms` : "");
    if (num(run.rt)) add(["duel", "strafe", "opflick", "marshalhead", "quickscope"].includes(run.sc) ? "Tempo per colpirlo" : "Reazione media", `${fmt(run.rt)} ms`, num(run.rtMed) ? `mediana ${fmt(run.rtMed)} · migliore ${fmt(run.rtBest)} ms` : "");
    if (num(run.rtSd)) add("Irregolarità dei tempi", `±${fmt(run.rtSd)} ms`, "più è bassa, più sei costante");
    if (run.escaped) add("Scappati", fmt(run.escaped), "spariti prima del colpo");
    if (run.sc === "duel") { add("Duelli persi", fmt(run.lost || 0), "ha sparato prima lui"); }
    if (run.sc === "strafe") {
      add("Colpi in movimento", fmt(run.moving || 0), `${fmt(run.movingPct || 0)}% dei colpi: vanno a caso`);
      if (num(run.stop)) add("Da fermo allo sparo", `${fmt(run.stop)} ms`);
    }
    if (run.sc === "peek") add("Colpi sul muro", fmt(run.wall || 0), "sparati prima che uscisse");
    if (headOnly && num(run.body)) add("Colpi al corpo", fmt(run.body), "non bastano: conta la testa");
    if (run.sc === "reflex") add("Partenze anticipate", fmt(run.early || 0));
    if (d.weapon) {
      add("Colpi alla testa", fmt(run.heads || 0), `busto ${fmt(run.body || 0)} · gambe ${fmt(run.legs || 0)}`);
      add("Senza scope", fmt(run.unscoped || 0), "colpi che vanno quasi a caso");
      add("A scope non entrato", fmt(run.earlyScope || 0), "colpi storti");
      if (num(run.lost)) add("Ti ha colpito prima lui", fmt(run.lost));
      if (num(run.wall)) add("Colpi sul muro", fmt(run.wall), "il muro ha fermato il colpo");
      if (num(run.scopeT)) add("Dallo scope al colpo", `${fmt(run.scopeT)} ms`, "media sui nemici colpiti");
    }
    if (num(run.vert)) add("Errore in altezza", `${fmt(run.vert, 2)}°`, num(run.vertBias) && Math.abs(run.vertBias) >= 0.05 ? `di solito ${run.vertBias > 0 ? "sopra" : "sotto"} la linea delle teste` : "centrato sulla linea");
    if (run.sc === "tracking") {
      add("Tempo addosso", `${fmt(run.track, 1)}%`);
      if (num(run.hold)) add("Tasto premuto", `${fmt(run.hold)}%`, "del tempo");
      if (num(run.err)) add("Distanza media dalla sagoma", `${fmt(run.err, 2)}°`);
      if (num(run.lag)) add("Quando la perdi", `dietro ${fmt(run.lag)}%`, `davanti ${fmt(run.lead)}%${num(run.high) ? ` · in altezza ${fmt(run.high)}%` : ""}`);
      if (num(run.reacq)) add("Riaggancio dopo un cambio", `${fmt(run.reacq)} ms`);
    }
    if (run.sc === "senstest" && run.sub) {
      add("Flick", fmt(run.sub.flick), `${fmt(run.sub.fKps, 2)} al secondo · ${fmt(run.sub.fAcc, 1)}%`);
      add("Precisione", fmt(run.sub.prec), `${fmt(run.sub.pKps, 2)} al secondo · ${fmt(run.sub.pAcc, 1)}%`);
      add("Tracking", fmt(run.sub.track), `${fmt(run.sub.trk, 1)}% addosso`);
    }
    const clean = A.metricValue(run, "clean");
    if (clean != null) add("Flick puliti", `${fmt(clean)}%`, "arrivati senza correzioni");
    return items;
  }

  function insightsBox(run) {
    const list = A.insights(run);
    if (!list.length) return "";
    const label = { good: "Bene", warn: "Da sistemare", tip: "Consiglio" };
    const icon = { good: "✓", warn: "!", tip: "i" };
    return `<div class="aim-insights"><h3 class="aim-h3">Cosa dicono i numeri</h3><ul>${list.map((x) => `<li class="${x.tone}"><span class="aim-ins-ic" aria-hidden="true">${icon[x.tone]}</span><span><span class="aim-sr">${label[x.tone]}: </span>${esc(x.text)}</span></li>`).join("")}</ul></div>`;
  }

  function stackBar(parts, label) {
    parts = parts.map((p) => ({ ...p, n: Math.max(0, Number(p.n) || 0) }));
    const total = parts.reduce((n, p) => n + p.n, 0);
    if (!total) return "";
    const pct = (n) => Math.round((n / total) * 100);
    return `<div class="aim-stack" role="img" aria-label="${esc(`${label}: ${parts.map((p) => `${p.name} ${pct(p.n)}%`).join(", ")}`)}">${parts.filter((p) => p.n).map((p) => `<i class="${p.cls}" style="flex-grow:${p.n}"></i>`).join("")}</div>
      <ul class="aim-legend">${parts.map((p) => `<li><span class="aim-key ${p.cls}" aria-hidden="true"></span>${p.name} <strong>${pct(p.n)}%</strong> <em>(${fmt(p.n)})</em></li>`).join("")}</ul>`;
  }

  function flickBox(flick, miss, title) {
    const f = flick || {};
    const m = miss || {};
    const nf = (f.c || 0) + (f.o || 0) + (f.u || 0);
    const nm = (m.o || 0) + (m.u || 0) + (m.s || 0);
    if (nf < 3 && nm < 3) return "";
    return `<section class="aim-sec"><h3 class="aim-h3">${esc(title || "Come arrivi sul bersaglio")}</h3>
      ${nf >= 3 ? `<p class="aim-sec-sub">Bersagli colpiti</p>${stackBar([{ name: "Puliti", n: f.c || 0, cls: "k1" }, { name: "Oltre e corretti", n: f.o || 0, cls: "k2" }, { name: "Corti e corretti", n: f.u || 0, cls: "k3" }], "Bersagli colpiti")}` : ""}
      ${nm >= 3 ? `<p class="aim-sec-sub">Colpi mancati</p>${stackBar([{ name: "Oltre", n: m.o || 0, cls: "k2" }, { name: "Corti", n: m.u || 0, cls: "k3" }, { name: "Di lato", n: m.s || 0, cls: "k0" }], "Colpi mancati")}` : ""}
      <p class="aim-hint">Pulito: arrivi e spari senza correzioni. Oltre e corretto: vai oltre il bersaglio e torni indietro (flick troppo forte o sens alta). Corto e corretto: ti fermi prima e aggiusti (flick timido o sens bassa). Contano i flick da 3 gradi in su (di più con i bersagli grandi).</p>
    </section>`;
  }

  function binsBox(bins, title) {
    if (!bins) return "";
    const rows = [["s", "Corti", "sotto 10°"], ["m", "Medi", "10–30°"], ["l", "Lunghi", "oltre 30°"]].filter(([k]) => Array.isArray(bins[k]) && bins[k][0] + bins[k][1] > 0);
    if (!rows.length) return "";
    return `<section class="aim-sec"><h3 class="aim-h3">${esc(title || "Flick per distanza")}</h3>
      <div class="aim-table-wrap"><table class="aim-table"><thead><tr><th scope="col">Flick</th><th scope="col">Colpiti</th><th scope="col">Precisione</th><th scope="col">Tempo</th></tr></thead><tbody>
      ${rows.map(([k, name, range]) => { const b = bins[k]; return `<tr><th scope="row">${name}<em>${range}</em></th><td>${fmt(b[0])}<em>${fmt(b[1])} mancati</em></td><td>${fmt((b[0] / (b[0] + b[1])) * 100)}%</td><td>${num(b[2]) ? `${fmt(b[2])} ms` : "—"}</td></tr>`; }).join("")}
      </tbody></table></div>
      <p class="aim-hint">La distanza è quanto devi muovere il mirino per arrivare sul bersaglio; il tempo è la media per colpirlo. Se i lunghi vanno molto peggio dei corti, usa più il braccio.</p>
    </section>`;
  }

  function segBox(run) {
    if (!Array.isArray(run.seg) || !run.seg.length) return "";
    const d = A.scenario(run.sc);
    let title;
    let labels;
    let max;
    let unit = "";
    if (run.sc === "tracking") { title = "Tempo addosso, ogni 7,5 secondi"; labels = run.seg.map((_, i) => `${fmt(i * 7.5, 1)}–${fmt((i + 1) * 7.5, 1)} s`); max = 100; unit = "%"; } else if (d.duration) { title = "Bersagli ogni 10 secondi"; labels = run.seg.map((_, i) => `${i * 10}–${(i + 1) * 10} s`); max = Math.max(1, ...run.seg.filter(num)); } else { const k = d.reps / run.seg.length; title = `Riusciti ogni ${k} ripetizioni`; labels = run.seg.map((_, i) => `${i * k + 1}–${(i + 1) * k}`); max = k; }
    return `<section class="aim-sec"><h3 class="aim-h3">Andamento nella partita</h3><p class="aim-sec-sub">${title}</p>
      <div class="aim-bars" role="img" aria-label="${esc(`${title}: ${run.seg.map((v, i) => `${labels[i]} ${v == null ? "nessun dato" : fmt(v) + unit}`).join(", ")}`)}">
      ${run.seg.map((v, i) => `<div class="aim-bar"><span class="aim-bar-v">${v == null ? "—" : fmt(v) + unit}</span><span class="aim-bar-track"><i style="height:${v == null ? 0 : Math.max(2, (v / max) * 100)}%"></i></span><span class="aim-bar-x">${labels[i]}</span>${run.segAcc && num(run.segAcc[i]) ? `<em>${fmt(run.segAcc[i])}%</em>` : ""}</div>`).join("")}
      </div>
      ${run.segAcc ? `<p class="aim-hint">Sotto ogni colonna: la precisione in quel tratto.</p>` : ""}
    </section>`;
  }

  function biasBox(b, title) {
    if (!b || !b.n || !b.r) return "";
    const k = 34 / b.r;
    const cx = 60 + clamp(b.x * k, -52, 52);
    const cy = 60 - clamp(b.y * k, -52, 52);
    const h = Math.abs(b.x) < 0.01 ? "centrato in orizzontale" : `${fmt(Math.abs(b.x), 2)}° a ${b.x > 0 ? "destra" : "sinistra"}`;
    const v = Math.abs(b.y) < 0.01 ? "centrato in verticale" : `${fmt(Math.abs(b.y), 2)}° ${b.y > 0 ? "sopra" : "sotto"}`;
    return `<section class="aim-sec"><h3 class="aim-h3">${esc(title || "Dove finiscono i colpi")}</h3>
      <div class="aim-bias">
        <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="${esc(`Punto medio dei colpi: ${h}, ${v}`)}">
          <circle cx="60" cy="60" r="34" class="ring"/><line x1="60" y1="6" x2="60" y2="114" class="axis"/><line x1="6" y1="60" x2="114" y2="60" class="axis"/>
          <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="6" class="dot"/>
        </svg>
        <p>Punto medio di ${plural(b.n, "colpo", "colpi")} rispetto al centro del bersaglio: <strong>${h}</strong>, <strong>${v}</strong>. Il cerchio è la grandezza media dei bersagli.</p>
      </div>
    </section>`;
  }

  function rtBox(run) {
    const list = Array.isArray(run.rts) ? run.rts.filter(num) : [];
    if (list.length < 3) return "";
    const max = Math.max(...list);
    const title = ["duel", "strafe", "opflick", "marshalhead", "quickscope"].includes(run.sc) ? "Tempo per colpirlo, uno per nemico colpito" : "Tempi di reazione, uno per bersaglio colpito";
    return `<section class="aim-sec"><h3 class="aim-h3">${title}</h3>
      <div class="aim-rts" role="img" aria-label="${esc(`${title}: ${list.map((v) => `${v} ms`).join(", ")}`)}">${list.map((v, i) => `<span title="${i + 1}°: ${v} ms"><i style="height:${Math.max(4, (v / max) * 100)}%"></i></span>`).join("")}</div>
      <p class="aim-hint">Migliore ${fmt(run.rtBest)} ms · mediana ${fmt(run.rtMed)} ms · più lento ${fmt(max)} ms. In ordine, da sinistra.</p>
    </section>`;
  }

  function trackBox(run) {
    if (run.sc === "tracking" && num(run.lag)) {
      const off = 100 - (Number(run.track) || 0);
      return `<section class="aim-sec"><h3 class="aim-h3">Quando perdi la sagoma</h3>${stackBar([{ name: "Dietro", n: run.lag, cls: "k3" }, { name: "Davanti", n: run.lead, cls: "k2" }, { name: "In altezza", n: run.high, cls: "k0" }], "Quando perdi la sagoma")}<p class="aim-hint">Fuori dalla sagoma per circa il ${fmt(off)}% del tempo. Dietro: arrivi tardi sui cambi di direzione. Davanti: vai oltre, movimenti troppo bruschi. In altezza: il mirino scappa sopra o sotto.</p></section>`;
    }
    if (run.sc === "duel" && (run.behind || run.ahead)) {
      return `<section class="aim-sec"><h3 class="aim-h3">Colpi mancati sul nemico in movimento</h3>${stackBar([{ name: "Dietro alla testa", n: run.behind || 0, cls: "k3" }, { name: "Davanti alla testa", n: run.ahead || 0, cls: "k2" }], "Colpi mancati")}<p class="aim-hint">Dietro: spari dove era, non dove sta andando. Davanti: anticipi troppo.</p></section>`;
    }
    return "";
  }

  function runView(run, { best = false, mode = "free", detail = false } = {}) {
    const l = lab();
    const d = A.scenario(run.sc);
    const lv = run.lv || 1;
    const prev = A.runsOf(l, run.sc, lv).filter((r) => r !== run && r.t !== run.t).map((r) => r.score);
    const prevBest = prev.length ? Math.max(...prev) : null;
    const routine = !detail && mode === "routine" && ui.routine;
    const nextId = routine ? ui.routine.list[ui.routine.index + 1] : null;
    const routineDone = routine && !nextId;
    const summary = routineDone ? `<h3 class="aim-h3">${esc(ui.routine.name)} completata</h3><ul class="aim-sum">${ui.routine.results.filter(Boolean).map((x) => `<li><span>${esc(A.scenario(x.run.sc).name)}</span><strong>${fmt(x.run.score)}</strong>${x.best ? `<em>record</em>` : "<em></em>"}</li>`).join("")}</ul>` : "";
    const items = itemsOf(run);
    const sections = [flickBox(run.flick, run.miss), binsBox(run.bins), segBox(run), biasBox(run.bias), rtBox(run), trackBox(run)].filter(Boolean);
    const kicker = detail ? "Partita salvata" : routine ? `${ui.routine.name} · ${ui.routine.index + 1} di ${ui.routine.list.length}` : "Risultato";
    const buttons = detail
      ? `<button type="button" class="aim-btn primary" data-aim="detail-close">Torna ai progressi</button><button type="button" class="aim-btn" data-aim="play" data-id="${d.id}" data-lv="${lv}">Gioca ${esc(d.name)} (${LV(lv)})</button>`
      : `${nextId ? `<button type="button" class="aim-btn primary" data-aim="next">Prossimo: ${esc(A.scenario(nextId).name)}</button>` : ""}
         <button type="button" class="aim-btn ${nextId ? "" : "primary"}" data-aim="again" data-id="${d.id}" data-lv="${lv}">Rigioca</button>
         <button type="button" class="aim-btn" data-aim="prog-open" data-id="${d.id}" data-lv="${lv}">Vedi i progressi</button>
         <button type="button" class="aim-btn ghost" data-aim="back">${routine && nextId ? "Interrompi la routine" : "Torna agli esercizi"}</button>`;
    return `
      <div class="aim-body">
        <article class="aim-result">
          <div class="aim-result-score"><strong>${fmt(run.score)}</strong><span>punti</span>${best ? `<em class="aim-record">Nuovo record (${LV(lv)})</em>` : prevBest != null ? `<em>record ${fmt(prevBest)}</em>` : ""}</div>
          <div>
            <span class="aim-kicker">${kicker}</span>
            <h2 data-focus-title>${esc(d.name)}</h2>
            <p class="aim-meta">${d.lv ? `Livello ${LV(lv)} · ` : ""}sens ${fmtSens(run.sens)} · ${dateLong(run.t)}, ${timeOf(run.t)}${run.routine ? " · nella routine" : ""}</p>
            <dl class="aim-stats">${items.map(([k, v, note]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd>${note ? `<span>${esc(note)}</span>` : ""}</div>`).join("")}</dl>
            ${run.raw === false ? `<p class="aim-note warn">Il browser non ha disattivato l'accelerazione del mouse: per una sensibilità identica a Valorant usa Chrome o Edge e, in Windows, togli "Precisione puntatore avanzata".</p>` : ""}
            ${insightsBox(run)}
            ${detail ? "" : `<p class="aim-tip"><strong>Per la prossima</strong> ${esc(d.tip)}</p>`}
            ${summary}
            <div class="aim-row">${buttons}</div>
          </div>
        </article>
        ${sections.length ? `<div class="aim-analysis">${sections.join("")}</div>` : ""}
      </div>`;
  }

  /* -------------------------------------------------------------- trova la sens */
  const FEEL_LABEL = { slow: "Troppo lenta", ok: "Giusta", fast: "Troppo veloce" };

  function finderView(l) {
    const f = l.finder;
    if (ui.calib) return calibView(l);
    if (!f) return finderIntro(l);
    if (f.done) return finderDone(l);
    if (f.round === 0 && !f.trials.length && !f.warm) return finderWarm(l);
    return finderRound(l);
  }

  function finderIntro(l) {
    const s = l.settings;
    const mode = (id, title, time, text) => `<button type="button" class="aim-mode" data-aim="finder-mode" data-mode="${id}" aria-pressed="${ui.finderMode === id}"><strong>${title}</strong><em>${time}</em><span>${text}</span></button>`;
    return `
      <div class="aim-body">
        <article class="aim-panel">
          <span class="aim-kicker">Trova la sens</span>
          <h2 data-focus-title>Una sensibilità scelta da te, non copiata</h2>
          <p>Provi due sensibilità alla volta senza sapere quale è la più alta, con esercizi uguali. Scegli la migliore: l'intervallo si dimezza e si riparte, per ${A.FINDER_ROUNDS} turni. Alla fine hai il valore da mettere in Valorant.</p>
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
            <h3>2. Come funziona la ricerca</h3>
            <ul class="aim-how">
              <li><strong>Alla cieca.</strong> Le due sens si chiamano Sens 1 e Sens 2: scopri quale era la più alta solo dopo aver scelto, così non ti fai condizionare.</li>
              <li><strong>Tre fasi in ogni prova (40 secondi).</strong> Flick lunghi e corti, bersagli piccoli e vicini, tracking tenendo premuto. Una sens troppo bassa fatica sui flick lunghi, una troppo alta sulla precisione e sul tracking.</li>
              <li><strong>Stessi bersagli.</strong> Nello stesso turno le due prove hanno la stessa sequenza di bersagli (stesse distanze e direzioni, stessa sagoma nel tracking): cambia solo la sens.</li>
              <li><strong>Com'era?</strong> Dopo ogni prova dici se la sens ti è sembrata lenta, giusta o veloce.</li>
              <li><strong>Come arrivi sul bersaglio.</strong> Se con una sens correggi quasi sempre nello stesso verso (vai oltre e torni indietro, oppure ti fermi prima e aggiusti), non è quella giusta. Il consiglio guarda punteggio, sensazione e correzioni senza svelarti quale sens è la più alta; decidi tu.</li>
            </ul>
          </div>
          <div class="aim-step">
            <h3>3. Scegli la versione</h3>
            <div class="aim-modes" role="group" aria-label="Versione della ricerca">
              ${mode("precisa", "Precisa", "circa 15 minuti", "Ogni sens si prova due volte per turno, in ordine 1-2-2-1: il riscaldarsi durante il turno pesa uguale su tutte e due. Consigliata.")}
              ${mode("rapida", "Rapida", "circa 8 minuti", "Una prova per sens a ogni turno. Va bene per un controllo veloce.")}
            </div>
            <p class="aim-hint">Parte dalla tua sens attuale e cerca tra la sens divisa per ${fmt(A.FINDER_SPAN, 1)} e la sens per ${fmt(A.FINDER_SPAN, 1)} (circa dal ${fmt(100 - 100 / A.FINDER_SPAN)}% più bassa al ${fmt(A.FINDER_SPAN * 100 - 100)}% più alta). Prima c'è un riscaldamento di una prova che non conta.</p>
            <button type="button" class="aim-btn primary" data-aim="finder-start">Inizia la ricerca</button>
          </div>
        </article>
        ${resultsBox(l)}
        ${historyBox(l)}
      </div>`;
  }

  function finderWarm(l) {
    const f = l.finder;
    return `
      <div class="aim-body">
        <article class="aim-panel">
          <span class="aim-kicker">Prima di iniziare</span>
          <h2 data-focus-title>Riscaldamento</h2>
          <p>Una prova con la tua sens attuale (${fmtSens(f.base)}), uguale a quelle della ricerca: ti scaldi le mani e impari le tre fasi. Non conta nella scelta.</p>
          <ol class="aim-steps"><li>Flick: bersagli lontani e vicini, uno alla volta.</li><li>Precisione: bersagli piccoli, vicini al mirino.</li><li>Tracking: tieni premuto il tasto sinistro e resta sulla sagoma.</li></ol>
          <div class="aim-row">
            <button type="button" class="aim-btn primary" data-aim="finder-warm">Fai il riscaldamento</button>
            <button type="button" class="aim-btn ghost" data-aim="finder-skip">Salta</button>
          </div>
          <div class="aim-row aim-row-end"><button type="button" class="aim-link" data-aim="finder-cancel">Interrompi la ricerca</button></div>
        </article>
      </div>`;
  }

  function revealLine(f) {
    const r = ui.reveal;
    if (!r || r.round !== f.round) return "";
    const lb = r.la === 1 ? 2 : 1;
    const which = r.winner === "a" ? r.la : r.winner === "b" ? lb : null;
    const choice = which ? `hai scelto la Sens ${which} (${which === r.la ? "la più bassa" : "la più alta"})` : "le hai giudicate uguali";
    const v1 = r.la === 1 ? r.a : r.b;
    const v2 = r.la === 1 ? r.b : r.a;
    return `<p class="aim-note">Turno ${r.round}: ${choice}. La Sens 1 era ${fmtSens(v1)}, la Sens 2 era ${fmtSens(v2)}.</p>`;
  }

  function finderRound(l) {
    const s = l.settings;
    const f = l.finder;
    const next = A.finderNext(f);
    const tally = A.finderTally(f);
    const width = Math.log(f.hi / f.lo) / Math.log(A.FINDER_SPAN * A.FINDER_SPAN);
    const order = f.seq[0] === "a" ? ["a", "b"] : ["b", "a"]; // Sens 1 poi Sens 2
    const tile = (which) => {
      const lab1 = A.finderLabel(f, which);
      const t = tally[which];
      const feel = f.feel[which];
      const ask = ui.finderJust === which && !feel;
      const trials = f.trials.map((x, i) => ({ ...x, i })).filter((x) => x.which === which);
      return `<div class="aim-pair-item ${t ? "done" : ""} ${ask ? "ask" : ""} ${next && next.which === which ? "next" : ""}">
        <span>Sens ${lab1}</span>
        <strong aria-hidden="true">?</strong><span class="aim-sr">valore nascosto fino alla scelta</span>
        <em>${trials.length ? trials.map((x) => `prova ${x.i + 1}: ${fmt(x.score)} punti`).join(" · ") : "non ancora provata"}</em>
        ${t ? `<div class="aim-feel" role="group" aria-label="Com'era la Sens ${lab1}?"><p>${ask ? `<strong>Com'era la Sens ${lab1}?</strong>` : `Com'era?`}</p>${Object.keys(FEEL_LABEL).map((k) => `<button type="button" data-aim="finder-feel" data-which="${which}" data-feel="${k}" aria-pressed="${feel === k}">${FEEL_LABEL[k]}</button>`).join("")}</div>` : ""}
      </div>`;
    };
    let action = "";
    if (next) {
      action = `<div class="aim-next">
        <p>Prova ${next.index + 1} di ${next.total}: <strong>Sens ${next.label}</strong>. Tre fasi, 40 secondi: flick, precisione, tracking tenendo premuto.</p>
        <button type="button" class="aim-btn primary" data-aim="finder-play">Gioca la prova ${next.index + 1} (Sens ${next.label})</button>
      </div>`;
    } else {
      action = compareBox(f, tally);
    }
    return `
      <div class="aim-body">
        <article class="aim-panel">
          <span class="aim-kicker">Turno ${f.round + 1} di ${f.rounds} · ${f.mode === "precisa" ? "versione precisa" : "versione rapida"}</span>
          <h2 data-focus-title>${next ? "Prova alla cieca" : "Quale va meglio?"}</h2>
          ${revealLine(f)}
          <div class="aim-progress" aria-label="Intervallo rimasto"><i style="width:${Math.max(4, Math.round(width * 100))}%"></i></div>
          <p class="aim-hint">Intervallo rimasto: da ${fmtSens(f.lo)} a ${fmtSens(f.hi)} (${fmt(A.cm360(s.dpi, f.hi), 1)}–${fmt(A.cm360(s.dpi, f.lo), 1)} cm/360). Non sai quale delle due è la più alta: gioca come in partita e di' com'era dopo ogni prova.</p>
          ${f.noRaw ? `<p class="aim-note warn">Il browser non ha disattivato l'accelerazione del mouse: i confronti valgono lo stesso, ma la sens finale combacia con Valorant solo se in Windows hai tolto "Precisione puntatore avanzata". Meglio Chrome o Edge.</p>` : ""}
          <div class="aim-pair">${order.map(tile).join("")}</div>
          ${action}
          <div class="aim-row aim-row-end">
            ${f.trials.length ? `<button type="button" class="aim-link" data-aim="finder-redo">Rifai il turno</button>` : ""}
            <button type="button" class="aim-link" data-aim="finder-cancel">Interrompi la ricerca</button>
          </div>
        </article>
      </div>`;
  }

  function compareBox(f, tally) {
    const sug = A.finderSuggest(f);
    const L = (w) => A.finderLabel(f, w);
    const order = f.seq[0] === "a" ? ["a", "b"] : ["b", "a"];
    const row = (label, get, better) => {
      const vals = order.map((w) => get(tally[w]));
      const best = better && vals.every(num) && vals[0] !== vals[1] ? (better === "up" ? Math.max(...vals) : Math.min(...vals)) : null;
      return `<tr><th scope="row">${label}</th>${vals.map((v) => `<td class="${best != null && v === best ? "win" : ""}">${num(v) ? fmt(v) : v == null ? "—" : esc(v)}</td>`).join("")}</tr>`;
    };
    const text = (sug ? sug.reasons : []).map((r) => {
      if (r.k === "score") return `La Sens ${L(r.w)} ha fatto il ${r.pct}% di punti in più.`;
      if (r.k === "close") return `Punteggi quasi uguali (${r.pct}% di differenza): contano la sensazione e come arrivi sul bersaglio.`;
      if (r.k === "feel") return `La Sens ${L(r.w)} ti è sembrata giusta, l'altra no.`;
      if (r.k === "between") return "Una ti è sembrata lenta e l'altra veloce: la giusta sta in mezzo.";
      if (r.k === "same") return `Tutte e due ti sono sembrate ${r.feel === "slow" ? "lente" : "veloci"}: qui decide il punteggio.`;
      if (r.k === "balance") return `Con la Sens ${L(r.w)} le correzioni sono più equilibrate: in un verso solo il ${r.pct}% contro il ${r.other}% dell'altra.`;
      return "";
    }).filter(Boolean);
    const pick = sug ? sug.pick : "tie";
    const pickText = pick === "tie" ? "Consiglio: uguali (l'intervallo si stringe verso il centro)." : `Consiglio: Sens ${L(pick)}.`;
    return `
      <div class="aim-compare">
        <div class="aim-table-wrap"><table class="aim-table"><thead><tr><th scope="col">Media del turno</th>${order.map((w) => `<th scope="col">Sens ${L(w)}</th>`).join("")}</tr></thead><tbody>
          ${row("Punteggio", (t) => t && t.score, "up")}
          ${row("Flick", (t) => t && t.flick, "up")}
          ${row("Precisione", (t) => t && t.prec, "up")}
          ${row("Tracking", (t) => t && t.track, "up")}
          ${row("Oltre il bersaglio", (t) => t && t.over, "")}
          ${row("Prima del bersaglio", (t) => t && t.under, "")}
          ${row("Sensazione", (t) => (t && FEEL_LABEL[t.feel] ? FEEL_LABEL[t.feel] : "—"), "")}
        </tbody></table></div>
        <div class="aim-reco"><p><strong>${pickText}</strong></p>${text.map((t) => `<p>${esc(t)}</p>`).join("")}<p>Decidi tu: se ti sei trovato meglio con l'altra, scegli quella.</p></div>
        <div class="aim-row">
          ${order.map((w) => `<button type="button" class="aim-btn ${pick === w ? "primary" : ""}" data-aim="finder-choose" data-w="${w}">Meglio la Sens ${L(w)}</button>`).join("")}
          <button type="button" class="aim-btn ${pick === "tie" ? "primary" : ""}" data-aim="finder-choose" data-w="tie">Uguali</button>
        </div>
      </div>`;
  }

  function finderDone(l) {
    const s = l.settings;
    const f = l.finder;
    const res = f.result;
    const adv = A.finderAdvice(l);
    const same = A.roundSens(res) === A.roundSens(s.sens);
    const e = A.edpi(s.dpi, res);
    return `
      <div class="aim-body">
        <article class="aim-panel aim-found">
          <span class="aim-kicker">Ricerca finita</span>
          <h2 data-focus-title>La tua sens: ${fmtSens(res)}</h2>
          ${revealLine(f)}
          <dl class="aim-stats big"><div><dt>In Valorant</dt><dd>${fmtSens(res)}</dd></div><div><dt>eDPI</dt><dd>${fmt(e)}</dd></div><div><dt>Giro completo</dt><dd>${fmt(A.cm360(s.dpi, res), 1)} cm</dd></div><div><dt>Partivi da</dt><dd>${fmtSens(f.base)}</dd></div></dl>
          ${f.edge ? `<p class="aim-note warn">Hai scelto sempre la sens ${f.edge === "low" ? "più bassa" : "più alta"}: la tua ideale potrebbe essere ancora ${f.edge === "low" ? "più bassa" : "più alta"}. Rifai la ricerca partendo da ${fmtSens(res)}.</p>` : ""}
          ${f.noRaw ? `<p class="aim-note warn">Durante la ricerca l'accelerazione del mouse era attiva: in Valorant la stessa sens combacia solo se in Windows hai tolto "Precisione puntatore avanzata".</p>` : ""}
          <p>Molti giocatori professionisti stanno tra circa 200 e 400 di eDPI: la tua è ${e < 200 ? "sotto (sens bassa, movimenti ampi)" : e > 400 ? "sopra (sens alta)" : "in quella fascia"}. Usala almeno una settimana prima di cambiarla: all'inizio ogni sens nuova sembra strana. Per essere più sicuro, rifai la ricerca un altro giorno: la media di più ricerche è più affidabile di una sola.</p>
          <div class="aim-row">
            ${same ? `<span class="aim-badge ok">È già la tua sens</span>` : `<button type="button" class="aim-btn primary" data-aim="finder-use" data-sens="${res}">Usa ${fmtSens(res)} come mia sens</button>`}
            <button type="button" class="aim-btn" data-aim="finder-again" data-from="${res}">Rifai partendo da ${fmtSens(res)}</button>
            <button type="button" class="aim-btn ghost" data-aim="finder-close" data-pending="${same ? "" : "1"}">Chiudi</button>
          </div>
          <h3 class="aim-h3">I turni, svelati</h3>
          <div class="aim-table-wrap"><table class="aim-table"><thead><tr><th scope="col">Turno</th><th scope="col">Sens 1</th><th scope="col">Sens 2</th><th scope="col">Consiglio</th><th scope="col">Hai scelto</th></tr></thead><tbody>
            ${f.history.map((h) => {
              const one = h.first;
              const two = one === "a" ? "b" : "a";
              const side = (w) => { const v = w === "a" ? h.a : h.b; const t = w === "a" ? h.A : h.B; return `${fmtSens(v)}<em>${t ? `${fmt(t.score)} punti${FEEL_LABEL[t.feel] ? ` · ${FEEL_LABEL[t.feel].toLowerCase()}` : ""}` : "—"}</em>`; };
              const name = (w) => (w === "tie" ? "uguali" : w ? `Sens ${w === one ? 1 : 2} (${w === "a" ? "bassa" : "alta"})` : "—");
              return `<tr><th scope="row">${fmt(h.round)}</th><td>${side(one)}</td><td>${side(two)}</td><td>${name(h.sugg)}</td><td>${name(h.winner)}</td></tr>`;
            }).join("")}
          </tbody></table></div>
        </article>
        ${adv.n >= 2 ? resultsBox(l) : ""}
      </div>`;
  }

  function resultsBox(l) {
    const list = l.finderResults.slice(-6).reverse();
    if (!list.length) return "";
    const adv = A.finderAdvice(l);
    const s = l.settings;
    return `<article class="aim-panel"><h3 class="aim-h3">Le tue ricerche</h3>
      ${adv.n >= 2 ? `<p class="aim-reco">Media delle ultime ${adv.n} ricerche (senza quelle finite al bordo), a ${fmt(s.dpi)} DPI: <strong>${fmtSens(adv.avg)}</strong>, scarto tra loro ${fmt(adv.spread)}%. ${adv.spread <= 10 ? "Sono vicine: è un valore affidabile." : "Sono ancora lontane: fai un'altra ricerca in un giorno diverso."}</p>
        ${A.roundSens(adv.avg) !== A.roundSens(s.sens) ? `<div class="aim-row"><button type="button" class="aim-btn" data-aim="finder-use" data-sens="${adv.avg}">Usa la media (${fmtSens(adv.avg)})</button></div>` : ""}` : ""}
      <ul class="aim-hist">${list.map((r) => `<li><em>${dateLong(r.t)}</em><span>${r.base ? `${fmtSens(r.base)} → ` : ""}<strong>${fmtSens(r.result)}</strong>${num(r.dpi) && r.dpi !== s.dpi ? ` a ${fmt(r.dpi)} DPI` : ""}${r.edge ? " · al bordo" : ""}</span><span>${r.mode === "precisa" ? "precisa" : "rapida"}</span></li>`).join("")}</ul>
    </article>`;
  }

  function historyBox(l) {
    if (!l.sensHistory.length) return "";
    return `<article class="aim-panel"><h3 class="aim-h3">Le tue sensibilità</h3><ul class="aim-hist">${l.sensHistory.slice(-8).reverse().map((h) => `<li><em>${dateLong(h.t)}</em><span>${fmtSens(h.from)} → <strong>${fmtSens(h.to)}</strong></span><span>${h.method === "ricerca" ? "dalla ricerca" : "a mano"}</span></li>`).join("")}</ul></article>`;
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
    if (!values || values.length < 2) return `<span class="aim-spark-empty" aria-hidden="true"></span>`;
    const w = 96;
    const h = 28;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pts = values.map((v, i) => `${((i / (values.length - 1)) * (w - 4) + 2).toFixed(1)},${(h - 3 - ((v - min) / (max - min || 1)) * (h - 6)).toFixed(1)}`).join(" ");
    return `<svg class="aim-spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><polyline points="${pts}"/></svg>`;
  }

  function heatmap(days) {
    const total = days.reduce((n, d) => n + d.minutes, 0);
    const active = days.filter((d) => d.runs).length;
    const lvl = (m) => (m <= 0 ? 0 : m < 5 ? 1 : m < 10 ? 2 : m < 20 ? 3 : 4);
    const cells = [...new Array(days[0].dow).fill(`<i class="pad"></i>`), ...days.map((d) => `<i class="h${lvl(d.minutes)}" title="${esc(`${dateLong(d.t)}: ${d.runs ? `${fmt(d.minutes, d.minutes < 10 ? 1 : 0)} minuti, ${plural(d.runs, "esercizio", "esercizi")}` : "nessun allenamento"}`)}"></i>`)];
    return `<article class="aim-panel">
      <div class="aim-sec-head"><h3 class="aim-h3">Ultime 12 settimane</h3><span>${plural(active, "giorno", "giorni")} · ${fmt(total)} minuti</span></div>
      <div class="aim-heat-grid">
        <div class="aim-heat-days" aria-hidden="true"><span>lun</span><span></span><span>mer</span><span></span><span>ven</span><span></span><span>dom</span></div>
        <div class="aim-heat" role="img" aria-label="${esc(`Calendario degli allenamenti: ${active} giorni su ${days.length}, ${fmt(total)} minuti`)}">${cells.join("")}</div>
      </div>
      <div class="aim-heat-legend" aria-hidden="true"><span>meno</span><i class="h0"></i><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i><span>più minuti</span></div>
    </article>`;
  }

  function skillsBox(list) {
    return `<article class="aim-panel">
      <div class="aim-sec-head"><h3 class="aim-h3">Le tue abilità</h3><span>media delle ultime 5 partite</span></div>
      <ul class="aim-skills">${list.map((s) => {
        const d = A.scenario(s.sc);
        const delta = s.change == null
          ? `<span class="aim-delta none">${s.n ? "servono almeno 2 partite" : "mai giocato"}</span>`
          : `<span class="aim-delta ${s.better === true ? "up" : s.better === false ? "down" : "flat"}">${s.better === true ? "migliorato" : s.better === false ? "peggiorato" : "stabile"} <strong>${signed(s.change, Math.abs(s.change) < 10 ? 1 : 0)}%</strong></span>`;
        return `<li><button type="button" data-aim="prog-sc" data-id="${s.sc}" data-lv="${s.lv}">
          <span class="aim-skill-name"><strong>${esc(s.name)}</strong><em>${esc(d.name)} · ${LV(s.lv)} · ${esc(s.label.toLowerCase())}</em></span>
          <span class="aim-skill-val">${s.value == null ? "—" : fmtMetric(s.key, s.value)}</span>
          ${delta}
          ${spark(s.trend)}
        </button></li>`;
      }).join("")}</ul>
      <p class="aim-hint">La variazione confronta le prime partite con le ultime, allo stesso livello. Tocca un'abilità per vedere tutti i dati dell'esercizio.</p>
    </article>`;
  }

  function lineChart(points, key) {
    if (!points.length) return "";
    const id = `c${ui.charts.size + 1}`;
    const vals = points.map((p) => p.v);
    const avgs = vals.map((_, i) => { const s = vals.slice(Math.max(0, i - 4), i + 1); return s.reduce((x, y) => x + y, 0) / s.length; });
    ui.charts.set(id, { key, v: vals, a: avgs, t: points.map((p) => p.t), sel: null });
    const m = A.METRICS[key];
    const n = vals.length;
    return `<figure class="aim-chart-fig">
      <div class="aim-chart-legend" aria-hidden="true"><span><i class="lk raw"></i>Ogni partita</span><span><i class="lk avg"></i>Media delle ultime 5</span></div>
      <div class="aim-chart" data-chart="${id}" tabindex="0" role="img" aria-label="${esc(`${m.label}, ${plural(n, "partita", "partite")}: ultima ${fmtMetric(key, vals[n - 1])}, media delle ultime 5 ${fmtMetric(key, avgs[n - 1])}. Usa le frecce per scorrere le partite.`)}"><div class="aim-chart-pop" hidden></div></div>
      <figcaption class="aim-hint">${esc(m.label)}${m.up ? ": più alto è meglio" : ": più basso è meglio"}. Passa sopra il grafico (o usa le frecce) per i valori di ogni partita.</figcaption>
    </figure>`;
  }

  function niceTicks(min, max, count = 4) {
    if (min === max) { const pad = Math.abs(min) * 0.1 || 1; min -= pad; max += pad; }
    const raw = (max - min) / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step;
    const hi = Math.ceil(max / step) * step;
    const ticks = [];
    for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v / step) * step);
    return { lo, hi, ticks, step };
  }

  // Disegna i grafici alla larghezza reale (testo nitido anche sul telefono).
  function paintCharts() {
    document.querySelectorAll("#aim .aim-chart").forEach((el) => paintChart(el));
  }

  function chartGeom(el, c) {
    const W = Math.max(280, Math.round(el.clientWidth || 600));
    const H = W < 480 ? 210 : 250;
    const L = 52;
    const R = 18;
    const T = 16;
    const B = 30;
    const n = c.v.length;
    const all = c.v.concat(c.a);
    const nt = niceTicks(Math.min(...all), Math.max(...all));
    const X = (i) => (n === 1 ? L + (W - L - R) / 2 : L + (i / (n - 1)) * (W - L - R));
    const Y = (v) => T + (1 - (v - nt.lo) / (nt.hi - nt.lo || 1)) * (H - T - B);
    return { W, H, L, R, T, B, n, nt, X, Y };
  }

  function paintChart(el) {
    const c = ui.charts.get(el.dataset.chart);
    if (!c) return;
    const g = chartGeom(el, c);
    const m = A.METRICS[c.key];
    const dTick = g.nt.step < 1 ? (g.nt.step < 0.1 ? 2 : 1) : 0;
    const grid = g.nt.ticks.map((t) => `<line x1="${g.L}" x2="${g.W - g.R}" y1="${g.Y(t).toFixed(1)}" y2="${g.Y(t).toFixed(1)}" class="g"/><text x="${g.L - 8}" y="${g.Y(t).toFixed(1)}" class="ty">${fmt(t, dTick)}</text>`).join("");
    const line = (arr) => arr.map((v, i) => `${g.X(i).toFixed(1)},${g.Y(v).toFixed(1)}`).join(" ");
    const dots = g.n <= 40 ? c.v.map((v, i) => `<circle class="pt" cx="${g.X(i).toFixed(1)}" cy="${g.Y(v).toFixed(1)}" r="4"/>`).join("") : "";
    const xl = [0];
    if (g.n > 2) xl.push(Math.floor((g.n - 1) / 2));
    if (g.n > 1) xl.push(g.n - 1);
    const xlabels = xl.map((i) => `<text x="${g.X(i).toFixed(1)}" y="${g.H - 8}" class="tx" text-anchor="${i === 0 && g.n > 1 ? "start" : i === g.n - 1 && g.n > 1 ? "end" : "middle"}">${esc(dateShort(c.t[i]))}</text>`).join("");
    const last = g.n - 1;
    const endLabel = `<text x="${Math.min(g.X(last), g.W - g.R).toFixed(1)}" y="${(g.Y(c.a[last]) - 10).toFixed(1)}" class="te" text-anchor="end">${esc(fmtMetric(c.key, c.a[last]))}</text>`;
    el.querySelectorAll("svg").forEach((s) => s.remove());
    el.insertAdjacentHTML("afterbegin", `<svg width="${g.W}" height="${g.H}" viewBox="0 0 ${g.W} ${g.H}" aria-hidden="true">
      ${grid}
      ${g.n > 1 ? `<polyline class="raw" points="${line(c.v)}"/>` : ""}
      ${dots}
      ${g.n > 1 ? `<polyline class="avg" points="${line(c.a)}"/>` : ""}
      <circle class="end" cx="${g.X(last).toFixed(1)}" cy="${g.Y(c.a[last]).toFixed(1)}" r="5"/>
      ${endLabel}
      ${xlabels}
      <line class="ch" x1="0" x2="0" y1="${g.T}" y2="${g.H - g.B}" visibility="hidden"/>
      <circle class="sel" r="6" cx="0" cy="0" visibility="hidden"/>
    </svg>`);
    el.dataset.unit = m.unit;
    if (c.sel != null) showPoint(el, c.sel);
  }

  function showPoint(el, i) {
    const c = ui.charts.get(el.dataset.chart);
    if (!c) return;
    const g = chartGeom(el, c);
    i = clamp(i, 0, g.n - 1);
    c.sel = i;
    const svg = el.querySelector("svg");
    const pop = el.querySelector(".aim-chart-pop");
    if (!svg || !pop) return;
    const x = g.X(i);
    const ch = svg.querySelector(".ch");
    const sel = svg.querySelector(".sel");
    ch.setAttribute("x1", x); ch.setAttribute("x2", x); ch.setAttribute("visibility", "visible");
    sel.setAttribute("cx", x); sel.setAttribute("cy", g.Y(c.v[i])); sel.setAttribute("visibility", "visible");
    pop.textContent = "";
    const head = document.createElement("span");
    head.textContent = `${dateLong(c.t[i])}, ${timeOf(c.t[i])} · partita ${i + 1} di ${g.n}`;
    const v1 = document.createElement("strong");
    v1.textContent = fmtMetric(c.key, c.v[i]);
    const v2 = document.createElement("em");
    v2.textContent = `media delle ultime 5: ${fmtMetric(c.key, c.a[i])}`;
    pop.append(head, v1, v2);
    pop.hidden = false;
    const left = x > g.W * 0.6 ? x - pop.offsetWidth - 12 : x + 12;
    pop.style.left = `${clamp(left, 4, Math.max(4, g.W - pop.offsetWidth - 4))}px`;
    pop.style.top = `${clamp(g.Y(c.v[i]) - pop.offsetHeight - 10, 4, g.H - pop.offsetHeight - 4)}px`;
  }

  function hidePoint(el) {
    const c = ui.charts.get(el.dataset.chart);
    if (c) c.sel = null;
    const svg = el.querySelector("svg");
    if (svg) svg.querySelectorAll(".ch, .sel").forEach((x) => x.setAttribute("visibility", "hidden"));
    const pop = el.querySelector(".aim-chart-pop");
    if (pop) pop.hidden = true;
  }

  function chartPointer(e) {
    const el = e.target.closest && e.target.closest(".aim-chart");
    if (!el) return;
    const c = ui.charts.get(el.dataset.chart);
    if (!c) return;
    const r = el.getBoundingClientRect();
    const g = chartGeom(el, c);
    const x = e.clientX - r.left;
    const i = g.n === 1 ? 0 : Math.round(((x - g.L) / (g.W - g.L - g.R)) * (g.n - 1));
    showPoint(el, i);
  }

  function exerciseSection(l) {
    const P = ui.prog;
    if (!A.VISIBLE.includes(P.sc)) P.sc = "gridshot";
    const id = P.sc;
    const d = A.scenario(id);
    const lvSel = P.lv == null ? A.levelOf(l, id) : P.lv;
    const sum = A.summary(l, id, lvSel === 0 ? null : lvSel);
    const keys = A.SC_METRICS[id];
    const withData = sum.metrics.filter((m) => m.n);
    if (!withData.some((m) => m.key === P.metric)) P.metric = withData.length ? withData[0].key : keys[0];
    const all = A.runsOf(l, id);
    const scChips = A.VISIBLE.map((sid) => `<button type="button" data-aim="prog-sc" data-id="${sid}" aria-pressed="${sid === id}">${esc(A.scenario(sid).name)}<em>${A.runsOf(l, sid).length}</em></button>`).join("");
    const lvChips = [0, 1, 2, 3].map((n) => `<button type="button" data-aim="prog-lv" data-lv="${n}" aria-pressed="${n === lvSel}">${n ? LV(n) : "Tutti i livelli"}<em>${n ? A.runsOf(l, id, n).length : all.length}</em></button>`).join("");
    let body = "";
    if (!sum.runs.length) {
      body = `<p class="aim-empty">Nessuna partita di ${esc(d.name)}${lvSel ? ` al livello ${LV(lvSel)}` : ""}.</p><div class="aim-row"><button type="button" class="aim-btn primary" data-aim="play" data-id="${id}" ${lvSel ? `data-lv="${lvSel}"` : ""}>Gioca ${esc(d.name)}</button></div>`;
    } else {
      const metricChips = withData.map((m) => `<button type="button" data-aim="prog-metric" data-key="${m.key}" aria-pressed="${m.key === P.metric}">${esc(m.label)}</button>`).join("");
      const points = sum.runs.map((r) => ({ v: A.metricValue(r, P.metric), t: r.t })).filter((p) => num(p.v));
      const rows = withData.map((m) => {
        const delta = m.change == null ? "—" : `<span class="aim-delta ${m.better === true ? "up" : m.better === false ? "down" : "flat"}">${m.better === true ? "meglio" : m.better === false ? "peggio" : "uguale"} <strong>${signed(m.change, Math.abs(m.change) < 10 ? 1 : 0)}%</strong></span>`;
        return `<tr><th scope="row">${esc(m.label)}<em>${m.up ? "più alto è meglio" : "più basso è meglio"}</em></th><td>${fmtMetric(m.key, m.best)}</td><td>${fmtMetric(m.key, m.last)}</td><td>${fmtMetric(m.key, m.avg5)}</td><td>${m.k ? `${fmtMetric(m.key, m.first)} → ${fmtMetric(m.key, m.recent)}` : "—"}</td><td>${delta}</td></tr>`;
      }).join("");
      const last10 = sum.runs.slice(-10);
      const ag = A.aggregate(last10);
      const tag = `ultime ${plural(last10.length, "partita", "partite")}`;
      const analysis = [
        flickBox(ag.flick, ag.miss, `Come arrivi sul bersaglio (${tag})`),
        binsBox(ag.bins, `Flick per distanza (${tag})`),
        biasBox(ag.bias, `Dove finiscono i colpi (${tag})`),
        trendTrack(last10, id, tag)
      ].filter(Boolean).join("");
      const sens = A.bySens(sum.runs, P.metric);
      const sensBox = sens.length > 1 ? `<section class="aim-sec aim-sec-wide"><h3 class="aim-h3">Per sensibilità</h3><div class="aim-table-wrap"><table class="aim-table"><thead><tr><th scope="col">Sens</th><th scope="col">Partite</th><th scope="col">${esc(A.METRICS[P.metric].label)} (media)</th><th scope="col">Precisione media</th><th scope="col">Ultima volta</th></tr></thead><tbody>${sens.map((x) => `<tr><th scope="row">${fmtSens(x.sens)}</th><td>${x.n}</td><td>${fmtMetric(P.metric, x.value)}</td><td>${num(x.acc) ? `${fmt(x.acc, 1)}%` : "—"}</td><td>${dateShort(x.last)}</td></tr>`).join("")}</tbody></table></div><p class="aim-hint">Con poche partite per sens il confronto è indicativo: conta di più la ricerca della sens.</p></section>` : "";
      const recent = sum.runs.slice().reverse();
      const shown = recent.slice(0, P.more);
      const runsTable = `<section class="aim-sec aim-sec-wide"><h3 class="aim-h3">Tutte le partite (${sum.runs.length})</h3><p class="aim-sec-sub">Tocca la data per aprire tutti i dati di quella partita.</p>
        <div class="aim-table-wrap"><table class="aim-table aim-runs"><thead><tr><th scope="col">Partita</th>${lvSel === 0 ? `<th scope="col">Livello</th>` : ""}<th scope="col">Sens</th>${keys.map((k) => `<th scope="col">${esc(A.METRICS[k].label)}</th>`).join("")}</tr></thead><tbody>
        ${shown.map((r) => `<tr><th scope="row"><button type="button" class="aim-link" data-aim="detail" data-t="${r.t}" data-id="${r.sc}" aria-label="${esc(`Dettagli della partita del ${dateLong(r.t)} alle ${timeOf(r.t)}`)}">${dateShort(r.t)}</button><em>${timeOf(r.t)}</em></th>${lvSel === 0 ? `<td>${LV(r.lv || 1)}</td>` : ""}<td>${fmtSens(r.sens)}</td>${keys.map((k) => `<td>${fmtMetric(k, A.metricValue(r, k))}</td>`).join("")}</tr>`).join("")}
        </tbody></table></div>
        ${recent.length > shown.length ? `<div class="aim-row"><button type="button" class="aim-btn ghost" data-aim="prog-more">Mostra altre ${Math.min(20, recent.length - shown.length)}</button></div>` : ""}
      </section>`;
      body = `
        <div class="aim-chips" role="group" aria-label="Dato da vedere nel grafico">${metricChips}</div>
        ${lineChart(points, P.metric)}
        <section class="aim-sec aim-sec-wide"><h3 class="aim-h3">Tutti i dati</h3>
          <div class="aim-table-wrap"><table class="aim-table"><thead><tr><th scope="col">Dato</th><th scope="col">Record</th><th scope="col">Ultima</th><th scope="col">Media ultime 5</th><th scope="col">Inizio → adesso</th><th scope="col">Variazione</th></tr></thead><tbody>${rows}</tbody></table></div>
          <p class="aim-hint">Inizio → adesso: media delle prime e delle ultime partite (5 ciascuna, meno se ne hai giocate meno di 10).</p>
        </section>
        <div class="aim-analysis">${analysis}</div>
        ${sensBox}
        ${runsTable}`;
    }
    return `<article class="aim-panel aim-exercise">
      <h2 class="aim-h2">Esercizio per esercizio</h2>
      <div class="aim-chips" role="group" aria-label="Esercizio">${scChips}</div>
      <div class="aim-chips small" role="group" aria-label="Livello">${lvChips}</div>
      ${body}
    </article>`;
  }

  // tracking e duelli: medie delle ultime partite (dietro/davanti)
  function trendTrack(runs, id, tag) {
    if (id === "tracking") {
      const list = runs.filter((r) => num(r.lag));
      if (!list.length) return "";
      const mean = (k) => Math.round(list.reduce((n, r) => n + (num(r[k]) ? r[k] : 0), 0) / list.length);
      return `<section class="aim-sec"><h3 class="aim-h3">Quando perdi la sagoma (${tag})</h3>${stackBar([{ name: "Dietro", n: mean("lag"), cls: "k3" }, { name: "Davanti", n: mean("lead"), cls: "k2" }, { name: "In altezza", n: mean("high"), cls: "k0" }], "Quando perdi la sagoma")}</section>`;
    }
    if (id === "duel") {
      const b = runs.reduce((n, r) => n + (num(r.behind) ? r.behind : 0), 0);
      const a = runs.reduce((n, r) => n + (num(r.ahead) ? r.ahead : 0), 0);
      if (b + a < 3) return "";
      return `<section class="aim-sec"><h3 class="aim-h3">Colpi mancati sul nemico in movimento (${tag})</h3>${stackBar([{ name: "Dietro alla testa", n: b, cls: "k3" }, { name: "Davanti alla testa", n: a, cls: "k2" }], "Colpi mancati")}</section>`;
    }
    return "";
  }

  function progressView(l) {
    const st = A.stats(l);
    if (!st.runs) {
      return `<div class="aim-body"><h2 class="aim-h2" data-focus-title>Progressi</h2>
        <article class="aim-panel"><p class="aim-empty">Ancora nessuna partita. Gioca un esercizio o la routine: qui vedrai precisione, tempi, come arrivi sul bersaglio, l'andamento nel tempo e il confronto tra le sensibilità.</p><div class="aim-row"><button type="button" class="aim-btn primary" data-aim="tab" data-tab="train">Vai all'allenamento</button></div></article>
        ${resultsBox(l)}${historyBox(l)}</div>`;
    }
    const tile = (value, label) => `<div><strong>${value}</strong><span>${label}</span></div>`;
    return `
      <div class="aim-body">
        <h2 class="aim-h2" data-focus-title>Progressi</h2>
        <div class="aim-tiles">
          ${tile(fmt(st.runs), st.runs === 1 ? "esercizio fatto" : "esercizi fatti")}
          ${tile(fmt(st.minutes), "minuti di mira")}
          ${tile(fmt(st.streak), st.streak === 1 ? "giorno di fila" : "giorni di fila")}
          ${tile(fmt(st.days), st.days === 1 ? "giorno di allenamento" : "giorni di allenamento")}
          ${tile(fmt(st.shots), "colpi sparati")}
          ${tile(st.acc30 == null ? "—" : `${fmt(st.acc30, 1)}%`, "precisione negli ultimi 30 giorni")}
          ${tile(fmt(st.routineDays), st.routineDays === 1 ? "routine completa" : "routine complete")}
          ${tile(st.routineToday ? "Fatta" : "Da fare", "routine di oggi")}
        </div>
        ${heatmap(A.activity(l))}
        ${skillsBox(A.skillProfile(l))}
        ${exerciseSection(l)}
        ${resultsBox(l)}
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

  function finderPlay(l) {
    const f = l.finder;
    const next = A.finderNext(f);
    if (!next) return;
    ui.finderJust = null;
    startPlay("senstest", "finder", {
      which: next.which,
      sens: f[next.which],
      seed: f.seed,
      blind: true,
      kicker: `Trova la sens · turno ${f.round + 1} di ${f.rounds} · prova ${next.index + 1} di ${next.total}`,
      title: `Sens ${next.label}`,
      subtitle: "Tre fasi in 40 secondi: flick lunghi e corti (16 s), bersagli piccoli e vicini (12 s), tracking tenendo premuto il tasto sinistro (12 s). Gioca come in partita."
    });
  }

  function onClick(event) {
    const el = event.target.closest("[data-aim], [data-aim-tab]");
    if (!el) return;
    if (el.dataset.aimTab) {
      if (ui.play) return;
      ui.tab = el.dataset.aimTab;
      ui.result = null;
      ui.detail = null;
      ui.calib = null;
      if (ui.measureCtl) { ui.measureCtl.destroy(); ui.measureCtl = null; }
      render(true);
      return;
    }
    const l = lab();
    switch (el.dataset.aim) {
      case "tab": ui.tab = el.dataset.tab; ui.result = null; ui.detail = null; render(true); break;
      case "level": {
        const id = el.dataset.id;
        const lv = Number(el.dataset.lv);
        if (!A.VISIBLE.includes(id) || ![1, 2, 3].includes(lv)) break;
        l.settings.levels[id] = lv;
        save();
        render(false);
        const btn = document.querySelector(`#aim [data-aim="level"][data-id="${id}"][data-lv="${lv}"][aria-pressed]`);
        if (btn) btn.focus({ preventScroll: true });
        announce(`${A.scenario(id).name}: livello ${LV(lv)}`);
        break;
      }
      case "play": {
        const lv = Number(el.dataset.lv);
        startPlay(el.dataset.id, "free", [1, 2, 3].includes(lv) ? { lv } : {});
        break;
      }
      case "again": {
        const inRoutine = ui.result && ui.result.mode === "routine" && ui.routine;
        const lv = Number(el.dataset.lv);
        startPlay(el.dataset.id, inRoutine ? "routine" : "free", { ...(inRoutine ? { kicker: `${ui.routine.name} · ${ui.routine.index + 1} di ${ui.routine.list.length}` } : {}), ...([1, 2, 3].includes(lv) ? { lv } : {}) });
        break;
      }
      case "routine": {
        const sniper = el.dataset.list === "sniper";
        ui.routine = { index: 0, results: [], list: sniper ? A.SNIPER_ROUTINE : A.ROUTINE, name: sniper ? "Routine del cecchino" : "Routine" };
        startPlay(ui.routine.list[0], "routine", { kicker: `${ui.routine.name} · 1 di ${ui.routine.list.length}` });
        break;
      }
      case "next":
        if (!ui.routine) break;
        ui.routine.index += 1;
        startPlay(ui.routine.list[ui.routine.index], "routine", { kicker: `${ui.routine.name} · ${ui.routine.index + 1} di ${ui.routine.list.length}` });
        break;
      case "back": ui.result = null; ui.routine = null; render(true); break;
      case "prog-open": {
        ui.result = null;
        ui.routine = null;
        ui.tab = "progress";
        ui.prog.sc = el.dataset.id;
        ui.prog.lv = Number(el.dataset.lv) || null;
        ui.prog.more = 20;
        render(true);
        break;
      }
      case "prog-sc": {
        ui.prog.sc = el.dataset.id;
        ui.prog.lv = Number(el.dataset.lv) || null;
        ui.prog.more = 20;
        render(false);
        const sec = document.querySelector("#aim .aim-exercise");
        if (sec && el.closest(".aim-skills")) sec.scrollIntoView({ block: "start", behavior: "smooth" });
        const btn = document.querySelector(`#aim .aim-exercise [data-aim="prog-sc"][data-id="${ui.prog.sc}"]`);
        if (btn) btn.focus({ preventScroll: true });
        break;
      }
      case "prog-lv": {
        ui.prog.lv = Number(el.dataset.lv);
        ui.prog.more = 20;
        render(false);
        const btn = document.querySelector(`#aim [data-aim="prog-lv"][data-lv="${ui.prog.lv}"]`);
        if (btn) btn.focus({ preventScroll: true });
        break;
      }
      case "prog-metric": {
        ui.prog.metric = el.dataset.key;
        render(false);
        const btn = document.querySelector(`#aim [data-aim="prog-metric"][data-key="${ui.prog.metric}"]`);
        if (btn) btn.focus({ preventScroll: true });
        break;
      }
      case "prog-more": ui.prog.more += 20; render(false); break;
      case "detail": {
        const t = Number(el.dataset.t);
        const run = l.runs.find((r) => r.t === t && r.sc === el.dataset.id);
        if (!run) break;
        ui.detail = run;
        ui.detailScroll = window.scrollY;
        render(true);
        const top = $("aimPanel").getBoundingClientRect().top;
        if (top < 0) window.scrollTo({ top: Math.max(0, window.scrollY + top - 12) });
        break;
      }
      case "detail-close": {
        ui.detail = null;
        render(false);
        if (ui.detailScroll != null) window.scrollTo({ top: ui.detailScroll });
        const sec = document.querySelector("#aim .aim-runs");
        if (sec) { const h = sec.closest("section").querySelector("h3"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } }
        break;
      }
      case "finder-mode":
        ui.finderMode = el.dataset.mode === "rapida" ? "rapida" : "precisa";
        document.querySelectorAll("#aim [data-aim='finder-mode']").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === ui.finderMode)));
        break;
      case "finder-start": {
        l.finder = A.finderStart(l.settings.sens, { mode: ui.finderMode });
        ui.reveal = null;
        ui.finderJust = null;
        save();
        render(true);
        announce("Ricerca iniziata: prima il riscaldamento");
        break;
      }
      case "finder-warm": {
        const f = l.finder;
        if (!f || f.done) break;
        startPlay("senstest", "warm", { sens: f.base, kicker: "Trova la sens · riscaldamento", title: `Riscaldamento (sens ${fmtSens(f.base)})`, subtitle: "Non conta: serve a scaldarti e a conoscere le tre fasi. Flick, precisione, poi tracking tenendo premuto." });
        break;
      }
      case "finder-skip": if (l.finder) { l.finder.warm = true; save(); render(true); } break;
      case "finder-play": finderPlay(l); break;
      case "finder-feel": {
        const f = l.finder;
        if (!f || f.done) break;
        A.finderFeel(f, el.dataset.which, el.dataset.feel);
        if (ui.finderJust === el.dataset.which) ui.finderJust = null;
        save();
        render(false);
        const btn = document.querySelector(`#aim [data-aim="finder-feel"][data-which="${el.dataset.which}"][data-feel="${el.dataset.feel}"]`);
        if (btn) btn.focus({ preventScroll: true });
        announce(`Sens ${A.finderLabel(f, el.dataset.which)}: ${(FEEL_LABEL[el.dataset.feel] || "").toLowerCase()}`);
        break;
      }
      case "finder-redo":
        if (!confirmTwice(el, "Conferma: rifai il turno")) break;
        if (l.finder) { A.finderRedo(l.finder); ui.finderJust = null; save(); render(true); }
        break;
      case "finder-choose": {
        const f = l.finder;
        if (!f || f.done || A.finderNext(f)) break;
        const reveal = { round: f.round + 1, a: f.a, b: f.b, la: A.finderLabel(f, "a"), winner: el.dataset.w };
        A.finderChoose(f, el.dataset.w);
        ui.reveal = reveal;
        ui.finderJust = null;
        if (f.done) A.saveFinderResult(l);
        save();
        render(true);
        announce(f.done ? `Ricerca finita: la tua sens è ${fmtSens(f.result)}` : `Turno ${f.round + 1} di ${f.rounds}`);
        break;
      }
      case "finder-use": {
        const v = Number(el.dataset.sens);
        if (!(v > 0)) break;
        A.setSens(l, v, { method: "ricerca" });
        save();
        render(true);
        announce(`Sens impostata: ${fmtSens(v)}. Mettila anche in Valorant.`);
        break;
      }
      case "finder-cancel":
        if (!confirmTwice(el, "Conferma: interrompi")) break;
        l.finder = null;
        ui.reveal = null;
        save();
        render(true);
        break;
      case "finder-close":
        if (el.dataset.pending && !confirmTwice(el, "Chiudi senza usarla?")) break;
        l.finder = null;
        ui.reveal = null;
        save();
        render(true);
        break;
      case "finder-again": {
        const from = Number(el.dataset.from);
        l.finder = A.finderStart(Number.isFinite(from) && from > 0 ? from : l.settings.sens, { mode: l.finder ? l.finder.mode : ui.finderMode });
        ui.reveal = null;
        save();
        render(true);
        announce(`Nuova ricerca da ${fmtSens(l.finder.base)}`);
        break;
      }
      case "calib": ui.tab = "finder"; ui.result = null; ui.detail = null; ui.calib = { phase: "intro" }; render(true); break;
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
        if (key === "sound" || key === "scopeHold") l.settings[key] = !l.settings[key];
        else l.settings.crosshair[key] = !l.settings.crosshair[key];
        el.setAttribute("aria-pressed", String(key === "sound" || key === "scopeHold" ? l.settings[key] : l.settings.crosshair[key]));
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
    } else if (key === "scopeMult") {
      if (Number.isFinite(v) && v >= 0.1 && v <= 3) {
        l.settings.scopeMult = Math.round(v * 1000) / 1000;
        el.removeAttribute("aria-invalid");
        save();
        // si aggiornano solo i centimetri per giro, senza ridisegnare la pagina
        const cm = A.cm360(l.settings.dpi, l.settings.sens);
        document.querySelectorAll("#aim [data-scope-cm]").forEach((td) => { td.textContent = `${fmt(cm / A.scopeFactor(Number(td.dataset.scopeCm), l.settings.scopeMult), 0)} cm`; });
      } else if (final) {
        el.value = String(l.settings.scopeMult);
        el.removeAttribute("aria-invalid");
        announce("Il moltiplicatore va da 0,1 a 3: resta quello di prima");
      } else el.setAttribute("aria-invalid", "true");
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
    page.addEventListener("focusin", (e) => {
      const el = e.target.closest('[data-aim-input="sens"]');
      if (el) el.dataset.before = String(lab().settings.sens);
      const ch = e.target.closest && e.target.closest(".aim-chart");
      if (ch && e.target === ch) { const c = ui.charts.get(ch.dataset.chart); if (c) showPoint(ch, c.sel == null ? c.v.length - 1 : c.sel); }
    });
    page.addEventListener("focusout", (e) => { const ch = e.target.closest && e.target.closest(".aim-chart"); if (ch && e.target === ch) hidePoint(ch); });
    page.addEventListener("pointermove", chartPointer);
    page.addEventListener("pointerdown", chartPointer);
    page.addEventListener("pointerout", (e) => {
      const ch = e.target.closest && e.target.closest(".aim-chart");
      if (ch && !ch.contains(e.relatedTarget) && document.activeElement !== ch) hidePoint(ch);
    });
    page.addEventListener("keydown", (e) => {
      const ch = e.target.closest && e.target.closest(".aim-chart");
      if (!ch || e.target !== ch) return;
      const c = ui.charts.get(ch.dataset.chart);
      if (!c) return;
      const i = c.sel == null ? c.v.length - 1 : c.sel;
      if (e.key === "ArrowLeft") { e.preventDefault(); showPoint(ch, i - 1); } else if (e.key === "ArrowRight") { e.preventDefault(); showPoint(ch, i + 1); } else if (e.key === "Home") { e.preventDefault(); showPoint(ch, 0); } else if (e.key === "End") { e.preventDefault(); showPoint(ch, c.v.length - 1); }
    });
    page.addEventListener("input", (e) => onInput(e, false));
    page.addEventListener("change", (e) => onInput(e, true));
    let rt = 0;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (location.hash === "#aim" && !ui.play) paintCharts(); }, 150); });
    window.addEventListener("hashchange", () => {
      if (location.hash === "#aim") { if (!ui.play) render(false); } else { stopAll(); }
    });
    render(false);
    renderCard();
  });
})();
