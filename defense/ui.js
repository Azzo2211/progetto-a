/*
 * Progetto A - Difesa: interfaccia del modulo.
 *
 * Schede: Programma (sessioni guidate + libreria delle tecniche con figura animata),
 * Riflessi (Semaforo, Direzione, Periferica), Situazioni (decisioni a tempo), Profilo.
 * Dati: DefenseProgram, DefenseSituations, DefenseScenes. Motore: DefenseEngine.
 * Usa le globali di app.js: state, saveState, renderDashboard, buildRadarMarkup, rankFromScore.
 */
(function () {
  "use strict";

  const E = window.DefenseEngine;
  const P = window.DefenseProgram || { techniques: [], warmup: [], sessions: [] };
  const SITS = window.DefenseSituations || [];
  const F = window.DefenseFigure;
  const SC = window.DefenseScenes || {};
  const TECH = new Map(P.techniques.map((t) => [t.id, t]));
  const WARM = new Map(P.warmup.map((w) => [w.id, w]));
  const SIT = new Map(SITS.map((s) => [s.id, s]));
  const DATA = { sessions: P.sessions, situations: SITS };
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ui = {
    tab: "program",
    view: null,        // { type: "technique", id } | { type: "session" }
    run: null,         // sessione in corso
    test: null,        // prova di riflessi in corso
    situ: null,        // turno di situazioni in corso
    figs: [],          // figure montate (da distruggere al ridisegno)
    tick: null,
    stepAt: 0,
    practice: "solo"
  };

  const $ = (id) => document.getElementById(id);
  const esc = (text) => String(text == null ? "" : text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const prose = (text) => esc(String(text == null ? "" : text).replace(/"([^"]*)"/g, "“$1”").replace(/([A-Za-zÀ-ÿ])'([A-Za-zÀ-ÿ0-9])/g, "$1’$2"));
  const pad = (n) => String(n).padStart(2, "0");
  const mmss = (sec) => `${pad(Math.floor(Math.max(0, sec) / 60))}:${pad(Math.max(0, Math.ceil(sec)) % 60)}`;

  function lab() {
    state.defenseLab = E.ensureLab(state.defenseLab);
    return state.defenseLab;
  }

  function prefs() {
    if (!state.defenseUi || typeof state.defenseUi !== "object") state.defenseUi = { voice: true, sound: true };
    return state.defenseUi;
  }

  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
  }

  function announce(text) {
    const live = $("defLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }

  function shuffle(list) { return E.shuffle(list, Math.random); }

  /* ------------------------------------------------------ voce e suoni */

  let audio = null;
  function beep(freq = 880, ms = 140, gain = 0.08) {
    if (!prefs().sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000);
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + ms / 1000 + 0.02);
    } catch (e) { /* audio non disponibile */ }
  }

  let itVoice = null;
  function speak(text) {
    if (!prefs().voice || !("speechSynthesis" in window)) return;
    try {
      const synth = window.speechSynthesis;
      if (!itVoice) itVoice = synth.getVoices().find((v) => /^it/i.test(v.lang)) || null;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "it-IT";
      if (itVoice) u.voice = itVoice;
      u.rate = 1.05;
      synth.speak(u);
    } catch (e) { /* sintesi vocale non disponibile */ }
  }

  /* ------------------------------------------------------------ figure */

  function destroyFigs() {
    ui.figs.forEach((f) => f.destroy());
    ui.figs = [];
  }

  function mountFigure(box, id, opts = {}) {
    const scene = SC[id];
    if (!box || !scene || !F) return null;
    const fig = F.mount(box, scene, Object.assign({ reduced, autoplay: !reduced }, opts));
    ui.figs.push(fig);
    return fig;
  }

  // Miniature statiche della libreria: l'ultimo fotogramma, che mostra l'esito della tecnica.
  function mountThumbs(root) {
    root.querySelectorAll("[data-thumb]").forEach((box) => {
      const scene = SC[box.dataset.thumb];
      if (!scene) return;
      const frame = scene.frames[box.dataset.frame === "first" ? 0 : scene.frames.length - 1];
      ui.figs.push(F.mount(box, { frames: [Object.assign({}, frame, { arrows: [], marks: [] })] }, { autoplay: false, viewBox: "22 34 276 214", label: (TECH.get(box.dataset.thumb) || {}).name || "" }));
    });
  }

  /* ------------------------------------------------------------- header */

  function renderChip() {
    const chip = $("defChip");
    if (!chip) return;
    const l = lab();
    const done = P.sessions.filter((s) => E.sessionState(l, s.id).done > 0).length;
    const phase = E.PHASES[Math.min(E.PHASES.length, E.currentPhase(l, P.sessions)) - 1];
    const value = profileTotal();
    chip.innerHTML = `
      <span class="def-chip-phase">Fase ${phase.n}</span>
      <span class="def-chip-text"><strong>${esc(phase.title)}</strong><em>${done}/${P.sessions.length} sessioni · profilo ${value}</em></span>`;
  }

  function setTab(tab) {
    if (ui.run && ui.tab === "program" && tab !== "program" && !confirmLeave()) return;
    stopEverything();
    ui.tab = tab;
    ui.view = null;
    document.querySelectorAll("[data-def-tab]").forEach((b) => {
      const on = b.dataset.defTab === tab;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll(".def-panel").forEach((p) => { p.hidden = p.id !== `defPanel-${tab}`; });
    render();
  }

  function confirmLeave() {
    // la sessione resta in pausa: chi torna su Programma la ritrova
    if (ui.run) ui.run.paused = true;
    return true;
  }

  function stopEverything() {
    if (ui.tick) { clearInterval(ui.tick); ui.tick = null; }
    if (ui.test) abortTest();
    if (ui.situ && ui.situ.timer) { clearTimeout(ui.situ.timer); ui.situ.timer = null; }
    if ("speechSynthesis" in window) try { window.speechSynthesis.cancel(); } catch (e) { /* niente */ }
  }

  function render() {
    renderChip();
    destroyFigs();
    if (ui.tab === "program") renderProgram();
    else if (ui.tab === "reflex") renderReflex();
    else if (ui.tab === "situ") renderSitu();
    else renderProfile();
  }

  /* ----------------------------------------------------------- programma */

  function techChip(id) {
    const t = TECH.get(id);
    return t ? `<button class="def-tchip" type="button" data-act="tech" data-id="${esc(id)}">${esc(t.name)}</button>` : "";
  }

  function sessionMinutes(s) {
    const warm = s.warmup.reduce((sum, id) => sum + ((WARM.get(id) || {}).seconds || 30), 0);
    const rounds = s.rounds.count * s.rounds.work + (s.rounds.count - 1) * s.rounds.rest;
    return Math.round((warm + rounds) / 60 + s.techniques.length * 4);
  }

  function renderProgram() {
    const box = $("defPanel-program");
    if (!box) return;
    if (ui.run) { renderRun(); return; }
    if (ui.view && ui.view.type === "technique") { renderTechnique(ui.view.id); return; }
    const l = lab();
    const action = E.nextAction(l, DATA);
    const idx = E.nextSessionIndex(l, P.sessions);
    const next = idx == null ? null : P.sessions[idx];
    let hero;
    if (next) {
      const st = E.sessionState(l, next.id);
      hero = `
        <article class="def-hero">
          <div class="def-hero-main">
            <span class="def-kicker">${action.kind === "session" && action.tomorrow ? "Domani" : "Prossima sessione"} · Fase ${next.phase} · ${esc(E.PHASES[next.phase - 1].title)}</span>
            <h2><span class="def-snum">${esc(next.id.replace("s", ""))}</span>${esc(next.title)}</h2>
            <p>${prose(next.goal)}</p>
            <div class="def-hero-meta">
              <span>circa ${sessionMinutes(next)} minuti</span>
              <span>${next.rounds.count} round da ${next.rounds.work} s</span>
              ${st.done ? `<span>fatta ${st.done} ${st.done === 1 ? "volta" : "volte"}</span>` : ""}
            </div>
            <div class="def-tchips">${next.techniques.map(techChip).join("")}</div>
          </div>
          <div class="def-hero-side">
            <div class="def-hero-fig" data-thumb="${esc(next.techniques[0])}"></div>
            <button class="def-primary" type="button" data-act="start-session" data-id="${esc(next.id)}">Inizia la sessione</button>
            ${action.kind === "session" && action.tomorrow ? `<p class="def-note">Oggi hai già fatto una sessione: la prossima rende di più domani. Intanto prova i riflessi o le situazioni.</p>` : ""}
          </div>
        </article>`;
    } else {
      hero = `
        <article class="def-hero done">
          <div class="def-hero-main">
            <span class="def-kicker">Programma completato</span>
            <h2>Hai chiuso tutte e 4 le fasi.</h2>
            <p>Ora la tecnica si mantiene ripetendo. Rifai una sessione a settimana, ruotando le fasi, e tieni vivi riflessi e situazioni.</p>
          </div>
          <div class="def-hero-side">
            <button class="def-primary" type="button" data-act="start-session" data-id="${esc(P.sessions[(l.log.filter((e) => e.kind === "session").length) % P.sessions.length].id)}">Ripeti una sessione</button>
          </div>
        </article>`;
    }
    const phases = E.PHASES.map((ph) => {
      const prog = E.phaseProgress(l, P.sessions, ph.n);
      const items = P.sessions.map((s, i) => ({ s, i })).filter(({ s }) => s.phase === ph.n).map(({ s, i }) => {
        const st = E.sessionState(l, s.id);
        const open = E.isUnlocked(l, P.sessions, i);
        const status = st.done ? "done" : open ? "open" : "locked";
        const label = st.done ? `fatta${st.quality != null ? ` · ${Math.round(st.quality * 100)}%` : ""}` : open ? "da fare" : "bloccata";
        return `
          <li class="def-node ${status}">
            <button type="button" data-act="${open ? "start-session" : "locked"}" data-id="${esc(s.id)}" ${open ? "" : 'aria-disabled="true"'}>
              <span class="def-node-num">${esc(s.id.replace("s", ""))}</span>
              <span class="def-node-text"><strong>${esc(s.title)}</strong><em>${label}</em></span>
            </button>
          </li>`;
      }).join("");
      return `
        <section class="def-phase ${prog.complete ? "complete" : ""}">
          <header><span>Fase ${ph.n}</span><h3>${esc(ph.title)}</h3><p>${esc(ph.sub)}</p><div class="def-phase-bar"><i style="width:${(prog.done / Math.max(1, prog.total)) * 100}%"></i></div></header>
          <ol>${items}</ol>
        </section>`;
    }).join("");
    const lib = P.techniques.map((t) => `
      <button class="def-tcard" type="button" data-act="tech" data-id="${esc(t.id)}">
        <span class="def-tcard-fig" data-thumb="${esc(t.id)}"></span>
        <span class="def-tcard-text"><em>Fase ${t.phase}</em><strong>${esc(t.name)}</strong></span>
      </button>`).join("");
    box.innerHTML = `
      ${hero}
      <h3 class="def-section-title">Il programma</h3>
      <p class="def-section-sub">Dodici sessioni in quattro fasi. Ognuna si sblocca dopo la precedente; puoi ripetere quelle già fatte quando vuoi.</p>
      <div class="def-phases">${phases}</div>
      <h3 class="def-section-title">Le tecniche</h3>
      <p class="def-section-sub">Tutte consultabili subito, con la figura animata, i passi e gli errori da evitare.</p>
      <div class="def-tlib">${lib}</div>
      <p class="def-disclaimer">Allenati lento e in uno spazio libero. Queste tecniche servono a proteggerti e ad andartene, non a vincere uno scontro. Un corso dal vivo con un istruttore resta il modo migliore per impararle.</p>`;
    mountThumbs(box);
  }

  function techniqueBody(t, opts = {}) {
    const usedIn = P.sessions.filter((s) => s.techniques.includes(t.id)).map((s) => s.id.replace("s", "")).join(", ");
    return `
      <div class="def-tech">
        <div class="def-tech-stage">
          <div class="def-fig" id="defFig"></div>
          <div class="def-frames" role="group" aria-label="Fotogrammi">
            ${t.frames.map((f, i) => `<button type="button" class="def-frame" data-act="frame" data-index="${i}" aria-pressed="${i === 0}"><span>${i + 1}</span>${esc(f)}</button>`).join("")}
          </div>
          <div class="def-fig-ctrl">
            <button type="button" class="def-ghost" data-act="fig-toggle" id="defFigToggle">${reduced ? "Anima" : "Pausa"}</button>
            <span class="def-dose">${esc(t.dose)}</span>
          </div>
        </div>
        <div class="def-tech-text">
          ${opts.inSession ? "" : `<span class="def-kicker">Fase ${t.phase} · ${esc(E.PHASES[t.phase - 1].title)}</span><h2>${esc(t.name)}</h2>`}
          <p class="def-purpose">${prose(t.purpose)}</p>
          <p class="def-when"><strong>Quando serve.</strong> ${prose(t.when)}</p>
          <h4>Passi</h4>
          <ol class="def-steps">${t.steps.map((s) => `<li>${prose(s)}</li>`).join("")}</ol>
          <h4>Punti chiave</h4>
          <ul class="def-keys">${t.keys.map((k) => `<li>${prose(k)}</li>`).join("")}</ul>
          <h4>Errori comuni</h4>
          <dl class="def-errors">${t.errors.map((e) => `<div><dt>${prose(e.error)}</dt><dd>${prose(e.fix)}</dd></div>`).join("")}</dl>
          <div class="def-practice">
            <div class="def-seg" role="group" aria-label="Come allenarla">
              <button type="button" data-act="practice" data-mode="solo" aria-pressed="${ui.practice === "solo"}">Da solo</button>
              ${t.partner ? `<button type="button" data-act="practice" data-mode="partner" aria-pressed="${ui.practice === "partner"}">Con un partner</button>` : ""}
            </div>
            <p>${prose(ui.practice === "partner" && t.partner ? t.partner : t.solo)}</p>
          </div>
          ${opts.inSession ? "" : `<p class="def-used">Comandi nei round: ${t.calls.map((c) => `«${esc(c)}»`).join(", ")}. Sessioni: ${esc(usedIn)}.</p>`}
        </div>
      </div>`;
  }

  function wireFigure(box, id) {
    const frames = box.querySelectorAll(".def-frame");
    const fig = mountFigure(box.querySelector("#defFig"), id, {
      label: `Figura animata: ${(TECH.get(id) || {}).name || ""}`,
      onFrame: (i) => frames.forEach((b, j) => b.setAttribute("aria-pressed", i === j ? "true" : "false"))
    });
    return fig;
  }

  function renderTechnique(id) {
    const box = $("defPanel-program");
    const t = TECH.get(id);
    if (!box || !t) return;
    box.innerHTML = `
      <div class="def-back-row"><button type="button" class="def-ghost" data-act="back" data-autofocus>← Programma</button></div>
      ${techniqueBody(t)}`;
    wireFigure(box, id);
    const back = box.querySelector("[data-autofocus]");
    if (back) back.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------ sessione guidata */

  function startSession(id) {
    const i = P.sessions.findIndex((s) => s.id === id);
    if (i < 0 || !E.isUnlocked(lab(), P.sessions, i)) return;
    stopEverything();
    const s = P.sessions[i];
    ui.run = { session: s, step: "warmup", wi: 0, left: (WARM.get(s.warmup[0]) || { seconds: 30 }).seconds, endsAt: 0, paused: false, ti: 0, round: null, answers: s.check.map(() => null), before: Object.fromEntries(profileSkills().map((k) => [k.key, k.value])) };
    ui.view = null;
    beep(660, 90);
    renderRun(true);
    startClock();
    window.scrollTo({ top: $("defense").offsetTop - 10, behavior: reduced ? "auto" : "smooth" });
  }

  function startClock() {
    const r = ui.run;
    if (!r) return;
    if (r.step === "warmup" || r.step === "rounds") {
      if (!r.paused) r.endsAt = performance.now() + r.left * 1000;
      if (r.step === "warmup") speak((WARM.get(r.session.warmup[r.wi]) || {}).name || "");
    }
    if (ui.tick) clearInterval(ui.tick);
    ui.tick = setInterval(onTick, 200);
  }

  function onTick() {
    const r = ui.run;
    if (!r || r.paused) return;
    if (r.step !== "warmup" && r.step !== "rounds") return;
    const now = performance.now();
    const left = (r.endsAt - now) / 1000;
    const prevWhole = Math.ceil(r.left);
    r.left = left;
    const whole = Math.ceil(left);
    if (r.step === "rounds" && r.round && whole !== prevWhole) {
      if (r.round.phase === "work" && whole === 10) beep(990, 70, 0.05);
      if (whole <= 3 && whole > 0) beep(740, 60, 0.05);
    }
    if (r.step === "rounds" && r.round && r.round.phase === "work" && now >= r.round.nextCallAt) nextCall();
    if (left <= 0) advanceClock();
    else paintClock();
  }

  function paintClock() {
    const r = ui.run;
    const el = $("defClock");
    if (el) el.textContent = mmss(r.left);
    const ring = $("defClockBar");
    if (ring) {
      const total = r.step === "warmup" ? (WARM.get(r.session.warmup[r.wi]) || { seconds: 30 }).seconds : r.round.total;
      ring.style.width = `${Math.max(0, Math.min(100, (r.left / total) * 100))}%`;
    }
  }

  function advanceClock() {
    const r = ui.run;
    if (r.step === "warmup") {
      if (r.wi < r.session.warmup.length - 1) {
        r.wi += 1;
        r.left = (WARM.get(r.session.warmup[r.wi]) || { seconds: 30 }).seconds;
        r.endsAt = performance.now() + r.left * 1000;
        beep(880, 120);
        speak((WARM.get(r.session.warmup[r.wi]) || {}).name || "");
        renderRun();
      } else {
        beep(660, 220);
        goStep("tech");
      }
    } else if (r.step === "rounds") {
      const rd = r.round;
      if (rd.phase === "ready" || rd.phase === "rest") {
        startWork();
      } else if (rd.phase === "work") {
        if (rd.i >= r.session.rounds.count) {
          beep(523, 420, 0.09);
          speak("Fine. Bel lavoro.");
          goStep("check");
        } else {
          beep(523, 300, 0.08);
          speak("Riposo");
          rd.phase = "rest";
          rd.total = r.session.rounds.rest;
          r.left = rd.total;
          r.endsAt = performance.now() + r.left * 1000;
          rd.call = null;
          renderRun();
        }
      }
    }
  }

  function goStep(step) {
    const r = ui.run;
    r.step = step;
    if (step === "rounds") {
      r.round = { i: 0, phase: "ready", total: 5, call: null, nextCallAt: 0, perTech: {} };
      r.left = 5;
      r.paused = false;
      r.endsAt = performance.now() + 5000;
      speak("Pronti");
    }
    renderRun(true);
    if (step === "rounds") startClock();
  }

  function startWork() {
    const r = ui.run;
    const rd = r.round;
    rd.i += 1;
    rd.phase = "work";
    rd.total = r.session.rounds.work;
    rd.perTech = {};
    r.left = rd.total;
    r.endsAt = performance.now() + r.left * 1000;
    rd.nextCallAt = performance.now() + 1800;
    beep(880, 120);
    setTimeout(() => beep(880, 120), 180);
    speak(`Round ${rd.i}`);
    renderRun();
  }

  // Comandi del round: soprattutto le tecniche della sessione, a volte quelle delle fasi precedenti.
  function callPool() {
    const r = ui.run;
    const own = r.session.techniques.map((id) => TECH.get(id)).filter(Boolean);
    const old = P.techniques.filter((t) => t.phase < r.session.phase && !r.session.techniques.includes(t.id));
    return { own, old };
  }

  function nextCall() {
    const r = ui.run;
    const rd = r.round;
    const { own, old } = callPool();
    const usable = (t) => t.shadow !== false && (!t.shadowMax || (rd.perTech[t.id] || 0) < t.shadowMax);
    const ownOk = own.filter(usable);
    const oldOk = old.filter(usable);
    const fromOld = oldOk.length && (Math.random() < 0.3 || !ownOk.length);
    const list = fromOld ? oldOk : ownOk;
    const gap = { 1: [6000, 8500], 2: [5000, 7500], 3: [5500, 8000], 4: [4500, 7000] }[r.session.phase] || [6000, 8000];
    rd.nextCallAt = performance.now() + gap[0] + Math.random() * (gap[1] - gap[0]);
    if (!list.length) return;
    let t = list[Math.floor(Math.random() * list.length)];
    let call = t.calls[Math.floor(Math.random() * t.calls.length)];
    if (rd.call && rd.call.text === call && list.length + t.calls.length > 2) {
      t = list[Math.floor(Math.random() * list.length)];
      call = t.calls[(t.calls.indexOf(call) + 1) % t.calls.length];
    }
    rd.perTech[t.id] = (rd.perTech[t.id] || 0) + 1;
    rd.call = { text: call, tech: t.name, n: (rd.call ? rd.call.n : 0) + 1 };
    speak(call);
    const el = $("defCall");
    if (el) {
      el.innerHTML = `<strong>${esc(call)}</strong><em>${esc(t.name)}</em>`;
      el.classList.remove("pop");
      void el.offsetWidth;
      el.classList.add("pop");
    }
  }

  function stepper(r) {
    const steps = [["warmup", "Riscaldamento"], ["tech", "Tecniche"], ["rounds", "Round"], ["check", "Autovalutazione"]];
    const at = steps.findIndex(([k]) => k === r.step);
    return `<ol class="def-stepper">${steps.map(([k, label], i) => `<li class="${i < at || r.step === "done" ? "past" : i === at ? "now" : ""}"><span>${i + 1}</span>${label}</li>`).join("")}</ol>`;
  }

  function renderRun(focus) {
    const box = $("defPanel-program");
    const r = ui.run;
    if (!box || !r) return;
    destroyFigs();
    const s = r.session;
    const head = `
      <div class="def-run-head">
        <div><span class="def-kicker">Sessione ${esc(s.id.replace("s", ""))} · Fase ${s.phase}</span><h2>${esc(s.title)}</h2></div>
        <div class="def-run-tools">
          <button type="button" class="def-ghost def-toggle" data-act="toggle-voice" aria-pressed="${prefs().voice}">Voce</button>
          <button type="button" class="def-ghost def-toggle" data-act="toggle-sound" aria-pressed="${prefs().sound}">Suoni</button>
          <button type="button" class="def-ghost" data-act="quit-session">Esci</button>
        </div>
      </div>
      ${stepper(r)}`;
    let body = "";
    if (r.step === "warmup") {
      const w = WARM.get(s.warmup[r.wi]) || { name: "", how: "", seconds: 30 };
      body = `
        <div class="def-warm">
          <div class="def-timer-card">
            <span class="def-kicker">Esercizio ${r.wi + 1} di ${s.warmup.length}</span>
            <h3>${esc(w.name)}</h3>
            <p>${prose(w.how)}</p>
            <div class="def-clock" id="defClock" aria-hidden="true">${mmss(r.left)}</div>
            <div class="def-clockbar"><i id="defClockBar"></i></div>
            <div class="def-row">
              <button type="button" class="def-primary" data-act="pause" data-autofocus>${r.paused ? "Riprendi" : "Pausa"}</button>
              <button type="button" class="def-ghost" data-act="warm-next">Avanti</button>
              <button type="button" class="def-ghost" data-act="warm-skip">Salta il riscaldamento</button>
            </div>
          </div>
          <ol class="def-warm-list">${s.warmup.map((id, i) => {
            const x = WARM.get(id) || { name: id, seconds: 30 };
            return `<li class="${i < r.wi ? "past" : i === r.wi ? "now" : ""}"><span>${esc(x.name)}</span><em>${x.seconds} s</em></li>`;
          }).join("")}</ol>
        </div>`;
    } else if (r.step === "tech") {
      const t = TECH.get(s.techniques[r.ti]);
      body = `
        <div class="def-run-sub"><span>Tecnica ${r.ti + 1} di ${s.techniques.length}</span><h3>${esc(t.name)}</h3></div>
        ${techniqueBody(t, { inSession: true })}
        <div class="def-row def-run-next">
          ${r.ti > 0 ? `<button type="button" class="def-ghost" data-act="tech-prev">Tecnica precedente</button>` : ""}
          <button type="button" class="def-primary" data-act="tech-next" data-autofocus>${r.ti < s.techniques.length - 1 ? "Fatto: tecnica successiva" : "Fatto: passa ai round"}</button>
        </div>`;
    } else if (r.step === "rounds") {
      const rd = r.round;
      const label = rd.phase === "ready" ? "Pronti" : rd.phase === "rest" ? `Riposo · poi round ${rd.i + 1}` : `Round ${rd.i} di ${s.rounds.count}`;
      body = `
        <div class="def-rounds ${rd.phase}">
          <div class="def-round-top"><span class="def-round-label">${label}</span><span class="def-round-dots">${Array.from({ length: s.rounds.count }, (_, i) => `<i class="${i < rd.i - (rd.phase === "work" ? 1 : 0) ? "done" : i === rd.i - 1 && rd.phase === "work" ? "now" : ""}"></i>`).join("")}</span></div>
          <div class="def-clock big" id="defClock" aria-hidden="true">${mmss(r.left)}</div>
          <div class="def-clockbar"><i id="defClockBar"></i></div>
          <div class="def-call" id="defCall" aria-live="assertive">${rd.phase === "work" ? (rd.call ? `<strong>${esc(rd.call.text)}</strong><em>${esc(rd.call.tech)}</em>` : "<strong>In guardia</strong><em>muoviti leggero, aspetta il comando</em>") : rd.phase === "rest" ? "<strong>Respira</strong><em>cammina, scuoti le braccia, bevi un sorso</em>" : "<strong>In posizione</strong><em>spazio libero intorno a te</em>"}</div>
          <p class="def-round-tip">Esegui ogni comando lento e pulito, poi torna in guardia e muoviti finché arriva il prossimo. ${s.phase >= 4 ? "Le cadute non vengono chiamate: allenale solo nella parte tecnica, su un tappeto." : ""}</p>
          <div class="def-row">
            <button type="button" class="def-primary" data-act="pause" data-autofocus>${r.paused ? "Riprendi" : "Pausa"}</button>
            <button type="button" class="def-ghost" data-act="round-skip">${rd.phase === "work" ? "Chiudi il round" : "Salta il riposo"}</button>
          </div>
        </div>`;
    } else if (r.step === "check") {
      const all = r.answers.every((a) => a !== null);
      body = `
        <div class="def-check">
          <h3>Com'è andata davvero?</h3>
          <p>Rispondi pensando a tutta la sessione, non al momento migliore. Questa autovalutazione pesa sulla Tecnica del profilo.</p>
          <ol>${s.check.map((q, i) => `
            <li>
              <span>${prose(q)}</span>
              <div class="def-seg" role="group" aria-label="${esc(q)}">
                ${[[2, "Sì"], [1, "A volte"], [0, "No"]].map(([v, l]) => `<button type="button" data-act="check" data-q="${i}" data-v="${v}" aria-pressed="${r.answers[i] === v}">${l}</button>`).join("")}
              </div>
            </li>`).join("")}</ol>
          <div class="def-row"><button type="button" class="def-primary" data-act="save-session" ${all ? "" : "disabled"}>Salva la sessione</button>${all ? "" : `<span class="def-note">Rispondi a tutte le domande.</span>`}</div>
        </div>`;
    } else if (r.step === "done") {
      const res = r.result;
      const after = Object.fromEntries(profileSkills().map((k) => [k.key, k.value]));
      const deltas = E.DIMENSIONS.map((d) => ({ label: d.label, d: after[d.key] - r.before[d.key], v: after[d.key] })).filter((x) => x.d !== 0);
      const idx = E.nextSessionIndex(lab(), P.sessions);
      const nxt = idx == null ? null : P.sessions[idx];
      body = `
        <div class="def-done">
          <div class="def-done-score"><strong>${Math.round(res.quality * 100)}%</strong><span>autovalutazione</span></div>
          <div>
            <h3>${res.first ? "Sessione completata." : "Sessione ripetuta."}</h3>
            <p>${res.quality >= 0.8 ? "Tecnica pulita: alla prossima ripetizione aumenta un poco la velocità, non la forza." : res.quality >= 0.5 ? "Buona base. Rifai le tecniche allo specchio puntando sul punto in cui hai risposto «A volte» o «No»." : "Meglio rifarla con calma: rallenta, tieni la guardia e conta i passi. Ripetere lento è il modo più veloce per imparare."}</p>
            ${deltas.length ? `<ul class="def-deltas">${deltas.map((x) => `<li><span>${esc(x.label)}</span><strong class="${x.d > 0 ? "up" : "down"}">${x.d > 0 ? "+" : ""}${x.d}</strong><em>${x.v}</em></li>`).join("")}</ul>` : ""}
            ${nxt && res.first ? `<p class="def-note">Sbloccata: sessione ${esc(nxt.id.replace("s", ""))}, ${esc(nxt.title)}. Fai la prossima domani: il corpo impara anche tra una sessione e l'altra.</p>` : ""}
            <div class="def-row"><button type="button" class="def-primary" data-act="end-session" data-autofocus>Torna al programma</button></div>
          </div>
        </div>`;
    }
    box.innerHTML = `<div class="def-run">${head}${body}</div>`;
    if (r.step === "tech") wireFigure(box, s.techniques[r.ti]);
    if (r.step === "warmup" || r.step === "rounds") paintClock();
    if (focus) {
      const f = box.querySelector("[data-autofocus]");
      if (f) f.focus({ preventScroll: true });
    }
  }

  function togglePause() {
    const r = ui.run;
    if (!r) return;
    if (r.paused) {
      r.paused = false;
      r.endsAt = performance.now() + r.left * 1000;
      if (r.round && r.round.phase === "work") r.round.nextCallAt = performance.now() + 1500;
    } else {
      r.paused = true;
      if ("speechSynthesis" in window) try { window.speechSynthesis.cancel(); } catch (e) { /* niente */ }
    }
    const btn = document.querySelector('#defPanel-program [data-act="pause"]');
    if (btn) btn.textContent = r.paused ? "Riprendi" : "Pausa";
    announce(r.paused ? "In pausa" : "Ripreso");
  }

  function saveSession() {
    const r = ui.run;
    if (!r || r.answers.some((a) => a === null)) return;
    r.result = E.recordSession(lab(), r.session, r.answers);
    r.step = "done";
    if (ui.tick) { clearInterval(ui.tick); ui.tick = null; }
    save();
    renderChip();
    renderRun(true);
    announce("Sessione salvata");
  }

  /* ------------------------------------------------------------- riflessi */

  const TESTS = {
    semaforo: {
      title: "Semaforo",
      what: "Verde: rispondi subito. Rosso: resta fermo. Allena a partire solo quando serve.",
      how: "Premi la barra spaziatrice (o tocca il riquadro) quando compare il verde. Al rosso non fare niente. 24 prove, circa un minuto.",
      unit: "ms"
    },
    direzione: {
      title: "Direzione",
      what: "Una freccia indica da che parte uscire: scegli la risposta giusta in fretta.",
      how: "Rispondi con le frecce della tastiera o toccando il tasto con la stessa freccia. 20 prove, circa un minuto.",
      unit: "ms"
    },
    periferica: {
      title: "Periferica",
      what: "Guarda il centro e accorgiti di cosa succede ai lati: è il campo visivo che ti fa notare chi si avvicina.",
      how: "Fissa la croce. Per un istante compaiono una forma al centro e un punto ai bordi. Poi indica la forma e dove era il punto. 14 prove: il lampo si accorcia quando rispondi giusto.",
      unit: "ms di lampo"
    }
  };

  function reflexSummary(kind) {
    const list = lab().reflex[kind] || [];
    const last = list[list.length - 1];
    const best = E.reflexBest(lab(), kind);
    return { list, last, best };
  }

  function sparkline(list, key, invert) {
    const vals = list.slice(-10).map((r) => r[key]).filter((v) => v != null);
    if (vals.length < 2) return "";
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const span = Math.max(1, max - min);
    return `<span class="def-spark" aria-hidden="true">${vals.map((v) => `<i style="height:${20 + ((invert ? max - v : v - min) / span) * 80}%"></i>`).join("")}</span>`;
  }

  function renderReflex() {
    const box = $("defPanel-reflex");
    if (!box) return;
    if (ui.test) { renderTest(); return; }
    const cards = Object.entries(TESTS).map(([k, t]) => {
      const { list, last, best } = reflexSummary(k);
      const main = k === "periferica" ? (last ? `${last.threshold} ms` : "—") : (last && last.median != null ? `${last.median} ms` : "—");
      const sub = !last ? "mai fatta" : k === "semaforo" ? `controllo ${last.control}/100 · errori al rosso ${last.commissions}` : k === "direzione" ? `precisione ${last.accuracy}%` : `posizioni giuste ${last.accuracy}%`;
      return `
        <article class="def-test-card">
          <header><h3>${t.title}</h3>${best != null ? `<span class="def-best">record ${best} ms</span>` : ""}</header>
          <p>${esc(t.what)}</p>
          <div class="def-test-last"><strong>${main}</strong><span>${esc(sub)}</span>${sparkline(list, k === "periferica" ? "threshold" : "median", true)}</div>
          <button type="button" class="def-primary" data-act="test-intro" data-kind="${k}">${list.length ? "Rifai la prova" : "Fai la prova"}</button>
        </article>`;
    }).join("");
    box.innerHTML = `
      <div class="def-test-grid">${cards}</div>
      <p class="def-section-sub">Le prove hanno sempre le stesse regole, così i numeri sono confrontabili nel tempo. Contano le ultime cinque: fanne una al giorno, riposato, sempre sullo stesso dispositivo. Risposte sotto i 120 ms sono anticipi, non riflessi.</p>`;
  }

  function testIntro(kind) {
    stopEverything();
    ui.test = { kind, phase: "intro" };
    renderTest(true);
  }

  function renderTest(focus) {
    const box = $("defPanel-reflex");
    const t = ui.test;
    if (!box || !t) return;
    const info = TESTS[t.kind];
    if (t.phase === "intro") {
      box.innerHTML = `
        <div class="def-back-row"><button type="button" class="def-ghost" data-act="test-back">← Riflessi</button></div>
        <div class="def-test-intro">
          <h2>${info.title}</h2>
          <p>${esc(info.what)}</p>
          <p class="def-how">${esc(info.how)}</p>
          ${t.kind === "semaforo" ? `<div class="def-demo"><span class="def-light go">VAI</span><span>rispondi</span><span class="def-light stop">FERMO</span><span>non fare niente</span></div>` : ""}
          ${t.kind === "direzione" ? `<div class="def-demo">${["left", "up", "down", "right"].map((d) => `<span class="def-arrowkey">${arrowSvg(d)}</span>`).join("")}</div>` : ""}
          <button type="button" class="def-primary" data-act="test-start" data-autofocus>Inizia</button>
        </div>`;
    } else if (t.phase === "run") {
      const total = t.plan.length;
      const pads = t.kind === "direzione" ? `<div class="def-pads">${["up", "left", "right", "down"].map((d) => `<button type="button" class="def-pad pad-${d}" data-act="dir" data-dir="${d}" aria-label="${{ up: "Su", left: "Sinistra", right: "Destra", down: "Giù" }[d]}">${arrowSvg(d)}</button>`).join("")}</div>` : "";
      box.innerHTML = `
        <div class="def-test-run">
          <div class="def-test-top"><span>${info.title}</span><span id="defTestCount">${Math.min(t.i + 1, total)} / ${total}</span><button type="button" class="def-ghost" data-act="test-abort">Interrompi</button></div>
          <div class="def-test-progress"><i id="defTestBar" style="width:${(t.i / total) * 100}%"></i></div>
          <div class="def-arena ${t.kind}" id="defArena" tabindex="0" aria-label="Area della prova">
            <div class="def-stim" id="defStim"></div>
            <div class="def-arena-msg" id="defArenaMsg">Pronto…</div>
          </div>
          ${pads}
          <div id="defPeriAnswer" class="def-peri-answer"></div>
        </div>`;
      const arena = $("defArena");
      if (arena) arena.focus({ preventScroll: true });
      const run = box.querySelector(".def-test-run");
      if (run && run.getBoundingClientRect().top < 0 || (run && run.getBoundingClientRect().bottom > window.innerHeight)) {
        window.scrollTo({ top: window.scrollY + run.getBoundingClientRect().top - 8, behavior: "auto" });
      }
    } else if (t.phase === "result") {
      box.innerHTML = resultMarkup(t);
    }
    if (focus) {
      const f = box.querySelector("[data-autofocus]");
      if (f) f.focus({ preventScroll: true });
    }
  }

  function arrowSvg(dir) {
    const rot = { up: 0, right: 90, down: 180, left: 270 }[dir];
    return `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 6 L33 21 H24 V34 H16 V21 H7 Z" transform="rotate(${rot} 20 20)"/></svg>`;
  }

  function startTest() {
    const t = ui.test;
    const rand = Math.random;
    t.plan = t.kind === "semaforo" ? E.planSemaforo(rand) : t.kind === "direzione" ? E.planDirezione(rand) : E.planPeriferica(rand);
    t.i = 0;
    t.trials = [];
    t.flash = 250;
    t.phase = "run";
    t.state = "idle";
    renderTest();
    t.timer = setTimeout(nextTrial, 900);
  }

  function setMsg(text, cls) {
    const m = $("defArenaMsg");
    if (m) { m.textContent = text || ""; m.className = `def-arena-msg ${cls || ""}`; }
  }

  function setStim(html, cls) {
    const s = $("defStim");
    if (s) { s.innerHTML = html || ""; s.className = `def-stim ${cls || ""}`; }
  }

  function updateCount() {
    const t = ui.test;
    const c = $("defTestCount");
    if (c) c.textContent = `${Math.min(t.i + 1, t.plan.length)} / ${t.plan.length}`;
    const b = $("defTestBar");
    if (b) b.style.width = `${(t.i / t.plan.length) * 100}%`;
  }

  function nextTrial() {
    const t = ui.test;
    if (!t || t.phase !== "run") return;
    if (t.i >= t.plan.length) { finishTest(); return; }
    updateCount();
    setStim("");
    if (t.kind === "periferica") { periTrial(); return; }
    const trial = t.plan[t.i];
    setMsg("");
    t.state = "wait";
    t.timer = setTimeout(() => showStim(trial), trial.wait);
  }

  function showStim(trial) {
    const t = ui.test;
    if (!t || t.state !== "wait") return;
    if (t.kind === "semaforo") setStim(trial.kind === "go" ? "<span>VAI</span>" : "<span>FERMO</span>", trial.kind === "go" ? "go" : "stop");
    else setStim(arrowSvg(trial.dir), "arrow");
    t.state = "stim";
    t.stimAt = 0;
    requestAnimationFrame((ts) => { if (ui.test === t) t.stimAt = ts; });
    const windowMs = t.kind === "semaforo" ? E.GO_WINDOW : 1500;
    t.timer = setTimeout(() => endTrial(null, null), windowMs);
  }

  // Risposta dell'utente (tasto o tocco). dir solo per Direzione.
  function respond(timeStamp, dir) {
    const t = ui.test;
    if (!t || t.phase !== "run" || t.kind === "periferica") return;
    if (t.state === "wait") {
      clearTimeout(t.timer);
      const trial = t.plan[t.i];
      t.trials.push(t.kind === "semaforo" ? { kind: trial.kind, rt: null, early: true } : { dir: trial.dir, answer: dir || null, rt: null, early: true });
      t.state = "feedback";
      setStim("");
      setMsg("Troppo presto: aspetta lo stimolo", "bad");
      t.i += 1;
      t.timer = setTimeout(nextTrial, 1100);
      return;
    }
    if (t.state !== "stim") return;
    const start = t.stimAt || timeStamp;
    endTrial(Math.round(timeStamp - start), dir);
  }

  function endTrial(rt, dir) {
    const t = ui.test;
    if (!t || t.state !== "stim") return;
    clearTimeout(t.timer);
    const trial = t.plan[t.i];
    let msg = "";
    let cls = "";
    if (t.kind === "semaforo") {
      const early = rt != null && rt < E.MIN_RT;
      t.trials.push({ kind: trial.kind, rt, early });
      if (trial.kind === "go") {
        if (rt == null) { msg = "Troppo lento"; cls = "bad"; } else if (early) { msg = "Anticipo"; cls = "bad"; } else { msg = `${rt} ms`; cls = "ok"; }
      } else if (rt == null) { msg = "Fermo: giusto"; cls = "ok"; } else { msg = "Era rosso"; cls = "bad"; }
    } else {
      const early = rt != null && rt < E.MIN_RT;
      t.trials.push({ dir: trial.dir, answer: dir || null, rt, early });
      if (rt == null) { msg = "Troppo lento"; cls = "bad"; } else if (early) { msg = "Anticipo"; cls = "bad"; } else if (dir !== trial.dir) { msg = "Direzione sbagliata"; cls = "bad"; } else { msg = `${rt} ms`; cls = "ok"; }
    }
    t.state = "feedback";
    setStim("");
    setMsg(msg, cls);
    t.i += 1;
    t.timer = setTimeout(nextTrial, 650);
  }

  /* Periferica: croce, lampo (forma + punto), maschera, poi due risposte. */
  function periPos(i) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * 40, y: 50 + Math.sin(a) * 40 };
  }

  function periTrial() {
    const t = ui.test;
    const trial = t.plan[t.i];
    t.state = "fix";
    $("defPeriAnswer").innerHTML = "";
    setMsg("");
    setStim(`<span class="def-fix">+</span>`, "peri");
    t.timer = setTimeout(() => {
      const p = periPos(trial.pos);
      setStim(`<span class="def-shape ${trial.shape}"></span><span class="def-dot" style="left:${p.x}%;top:${p.y}%"></span>`, "peri");
      t.timer = setTimeout(() => {
        setStim(`<span class="def-mask"></span>${Array.from({ length: 8 }, (_, i) => { const q = periPos(i); return `<span class="def-mask-dot" style="left:${q.x}%;top:${q.y}%"></span>`; }).join("")}`, "peri");
        t.timer = setTimeout(() => {
          t.state = "shape";
          setStim(`<span class="def-fix dim">?</span>`, "peri");
          $("defPeriAnswer").innerHTML = `<p>Al centro c'era…</p><div class="def-row"><button type="button" class="def-primary" data-act="peri-shape" data-shape="circle">Un cerchio</button><button type="button" class="def-primary" data-act="peri-shape" data-shape="square">Un quadrato</button></div>`;
          const first = $("defPeriAnswer").querySelector("button");
          if (first) first.focus({ preventScroll: true });
        }, 180);
      }, t.flash);
    }, 650 + Math.random() * 500);
  }

  function periShape(shape) {
    const t = ui.test;
    if (!t || t.state !== "shape") return;
    t.shapePick = shape;
    t.state = "pos";
    setStim(Array.from({ length: 8 }, (_, i) => { const q = periPos(i); return `<button type="button" class="def-peri-target" data-act="peri-pos" data-pos="${i}" style="left:${q.x}%;top:${q.y}%" aria-label="Posizione ${i + 1}"></button>`; }).join(""), "peri");
    $("defPeriAnswer").innerHTML = `<p>Dov'era il punto? Tocca il cerchio giusto.</p>`;
    const first = $("defStim").querySelector("button");
    if (first) first.focus({ preventScroll: true });
  }

  function periPos2(pos) {
    const t = ui.test;
    if (!t || t.state !== "pos") return;
    const trial = t.plan[t.i];
    const shapeOk = t.shapePick === trial.shape;
    const posOk = pos === trial.pos;
    t.trials.push({ flash: t.flash, shapeOk, posOk });
    t.flash = E.nextFlash(t.flash, shapeOk && posOk);
    t.state = "feedback";
    const p = periPos(trial.pos);
    setStim(`<span class="def-dot reveal" style="left:${p.x}%;top:${p.y}%"></span>`, "peri");
    $("defPeriAnswer").innerHTML = `<p class="${shapeOk && posOk ? "ok" : "bad"}">${shapeOk && posOk ? "Giusto: il lampo si accorcia." : `${shapeOk ? "Forma giusta" : "Forma sbagliata"}, ${posOk ? "posizione giusta" : "posizione sbagliata"}: il lampo si allunga.`}</p>`;
    t.i += 1;
    t.timer = setTimeout(nextTrial, 900);
  }

  function finishTest() {
    const t = ui.test;
    clearTimeout(t.timer);
    const prev = reflexSummary(t.kind);
    const prevBest = prev.best;
    const res = t.kind === "semaforo" ? E.scoreSemaforo(t.trials) : t.kind === "direzione" ? E.scoreDirezione(t.trials) : E.scorePeriferica(t.trials);
    // una prova senza nessuna risposta valida non si registra
    const usable = t.kind === "periferica" ? res.n > 0 : res.median != null;
    if (usable) {
      E.recordReflex(lab(), t.kind, res);
      save();
    }
    t.result = res;
    t.prevBest = prevBest;
    t.recorded = usable;
    t.phase = "result";
    renderChip();
    renderTest(true);
    announce("Prova finita");
  }

  function resultMarkup(t) {
    const r = t.result;
    const info = TESTS[t.kind];
    let main;
    let rows;
    let read;
    if (t.kind === "semaforo") {
      main = r.median != null ? `${r.median} ms` : "—";
      rows = [["Tempo mediano al verde", main], ["Risposte al rosso", `${r.commissions} su 6`], ["Anticipi", r.early], ["Verdi mancati", r.omissions], ["Velocità", `${r.speed}/100`], ["Controllo", `${r.control}/100`]];
      read = r.commissions >= 2 ? "Parti anche quando non devi: rallenta di poco e aspetta di vedere il colore. Nella realtà, reagire a una finta costa caro." : r.early >= 2 ? "Troppi anticipi: stai indovinando il momento invece di guardare. Lascia che sia lo stimolo a farti partire." : r.median != null && r.median < 320 ? "Veloce e controllato. Mantieni il ritmo con una prova al giorno." : "Controllo buono. Per la velocità: postura comoda, dito già sul tasto, sguardo al centro.";
    } else if (t.kind === "direzione") {
      main = r.median != null ? `${r.median} ms` : "—";
      rows = [["Tempo mediano (giuste)", main], ["Precisione", `${r.accuracy}%`], ["Direzioni sbagliate", r.wrong], ["Mancate", r.missed], ["Anticipi", r.early], ["Velocità", `${r.speed}/100`]];
      read = r.accuracy < 85 ? "Più precisione prima della velocità: un'uscita dalla parte sbagliata è peggio di una lenta." : "Scelta rapida e precisa. Il prossimo obiettivo è abbassare il tempo senza perdere precisione.";
    } else {
      main = r.threshold != null ? `${r.threshold} ms` : "—";
      rows = [["Durata del lampo a fine prova", main], ["Posizioni giuste", `${r.accuracy}%`], ["Forma e posizione giuste", `${r.both}%`], ["Punteggio", `${r.score}/100`]];
      read = r.threshold != null && r.threshold <= 120 ? "Campo visivo ampio: noti i bordi anche guardando al centro." : "Allenalo anche fuori: per strada, guarda avanti e conta quello che vedi ai lati senza girare la testa.";
    }
    const better = t.prevBest != null && t.kind !== "periferica" && r.median != null && r.median < t.prevBest;
    const betterP = t.prevBest != null && t.kind === "periferica" && r.threshold != null && r.threshold < t.prevBest;
    return `
      <div class="def-back-row"><button type="button" class="def-ghost" data-act="test-back">← Riflessi</button></div>
      <div class="def-result">
        <div class="def-result-main"><span class="def-kicker">${info.title}</span><strong>${main}</strong>${better || betterP ? `<em class="def-record">nuovo record</em>` : t.prevBest != null ? `<em>record ${t.prevBest} ms</em>` : ""}</div>
        <dl class="def-result-rows">${rows.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
        <p class="def-result-read">${esc(read)}</p>
        ${t.recorded ? "" : `<p class="def-note">Nessuna risposta valida: la prova non è stata registrata.</p>`}
        <div class="def-row"><button type="button" class="def-primary" data-act="test-start" data-autofocus>Rifai</button><button type="button" class="def-ghost" data-act="test-back">Altre prove</button></div>
      </div>`;
  }

  function abortTest() {
    const t = ui.test;
    if (t && t.timer) clearTimeout(t.timer);
    ui.test = null;
  }

  /* ----------------------------------------------------------- situazioni */

  function renderSitu() {
    const box = $("defPanel-situ");
    if (!box) return;
    if (ui.situ) { renderSituPlay(); return; }
    const l = lab();
    const due = E.dueSituations(l, SITS);
    const seen = SITS.filter((s) => E.situState(l, s.id).seen > 0).length;
    const stats = E.categoryStats(l);
    const cats = Object.entries(E.CATEGORIES).map(([k, c]) => {
      const all = SITS.filter((s) => s.category === k);
      const st = stats[k];
      const pct = st.max ? Math.round((st.points / st.max) * 100) : null;
      const seenCat = all.filter((s) => E.situState(l, s.id).seen > 0).length;
      return `
        <li>
          <div><strong>${esc(c.label)}</strong><span>${esc(c.text)}</span></div>
          <div class="def-cat-meter"><i style="width:${pct == null ? 0 : pct}%"></i></div>
          <em>${pct == null ? "mai provate" : `${pct}% · ${seenCat}/${all.length} viste`}</em>
        </li>`;
    }).join("");
    box.innerHTML = `
      <article class="def-hero situ">
        <div class="def-hero-main">
          <span class="def-kicker">Decisioni a tempo</span>
          <h2>${due.length ? `${due.length} ${due.length === 1 ? "situazione da rivedere" : "situazioni da rivedere"}` : seen < SITS.length ? "Sei situazioni, pochi secondi ciascuna" : "Tutte viste: tieni allenata la testa"}</h2>
          <p>Leggi, decidi prima che finisca il tempo, poi scopri il voto di ogni scelta. Le risposte sbagliate tornano il giorno dopo, quelle giuste sempre più di rado.</p>
          <div class="def-hero-meta"><span>${seen}/${SITS.length} viste</span><span>tasti 1-4 per rispondere</span></div>
        </div>
        <div class="def-hero-side"><button type="button" class="def-primary" data-act="situ-start">Inizia un turno</button></div>
      </article>
      <h3 class="def-section-title">Le sei aree</h3>
      <ul class="def-cats">${cats}</ul>
      <p class="def-disclaimer">Le note legali spiegano i principi del diritto italiano e citano le fonti: non sono un parere legale sul tuo caso.</p>`;
  }

  function startSitu() {
    stopEverything();
    const queue = E.pickTurn(lab(), SITS, Math.min(6, SITS.length));
    ui.situ = { queue, i: 0, results: [], picked: null, phase: "play" };
    prepSitu();
    renderSituPlay(true);
  }

  function prepSitu() {
    const q = ui.situ;
    const s = SIT.get(q.queue[q.i]);
    q.order = shuffle(s.options.map((_, i) => i));
    q.picked = null;
    q.timedOut = false;
    q.startedAt = Date.now();
    ui.stepAt = Date.now();
  }

  function renderSituPlay(focus) {
    const box = $("defPanel-situ");
    const q = ui.situ;
    if (!box || !q) return;
    if (q.phase === "summary") { box.innerHTML = situSummary(); focusFirst(box); return; }
    const s = SIT.get(q.queue[q.i]);
    const cat = E.CATEGORIES[s.category];
    const answered = q.picked !== null;
    const opts = q.order.map((oi, pos) => {
      const o = s.options[oi];
      const verdict = o.score === 2 ? "best" : o.score === 1 ? "ok" : "bad";
      const tag = o.score === 2 ? "La migliore" : o.score === 1 ? "Accettabile" : "Da evitare";
      return `
        <li class="def-opt ${answered ? `reveal ${verdict}` : ""} ${q.picked === oi ? "picked" : ""}">
          <button type="button" data-act="situ-pick" data-index="${oi}" ${answered ? "disabled" : ""}>
            <span class="def-opt-key">${pos + 1}</span><span class="def-opt-text">${prose(o.text)}</span>
            ${answered ? `<span class="def-opt-tag">${tag}${q.picked === oi ? " · tua" : ""}</span>` : ""}
          </button>
          ${answered ? `<p class="def-opt-note">${prose(o.note)}</p>` : ""}
        </li>`;
    }).join("");
    const pickedOpt = answered && q.picked >= 0 ? s.options[q.picked] : null;
    box.innerHTML = `
      <div class="def-situ">
        <div class="def-situ-top">
          <span>${esc(cat.label)} · livello ${s.level}</span>
          <span>${q.i + 1} / ${q.queue.length}</span>
          <button type="button" class="def-ghost" data-act="situ-quit">Interrompi</button>
        </div>
        <div class="def-timebar ${answered ? "stopped" : ""}"><i id="defTimeFill" ${answered ? `style="width:${Math.round((q.leftFrac || 0) * 100)}%"` : ""}></i></div>
        <h2>${esc(s.title)}</h2>
        <p class="def-situ-text">${prose(s.text)}</p>
        <p class="def-situ-q">${prose(s.question)}</p>
        <ol class="def-opts">${opts}</ol>
        ${answered ? `
          <div class="def-verdict ${q.timedOut ? "bad" : pickedOpt && pickedOpt.score === 2 ? "best" : pickedOpt && pickedOpt.score === 1 ? "ok" : "bad"}">
            <strong>${q.timedOut ? "Tempo scaduto." : pickedOpt.score === 2 ? "Scelta migliore." : pickedOpt.score === 1 ? "Accettabile, ma c'era di meglio." : "Scelta rischiosa."}</strong>
            <p>${prose(s.principle)}</p>
            ${s.sources && s.sources.length ? `<p class="def-sources">Fonti: ${s.sources.map((src) => `<a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.label)}</a>`).join(" · ")}</p>` : ""}
          </div>
          <div class="def-row"><button type="button" class="def-primary" data-act="situ-next" data-autofocus>${q.i < q.queue.length - 1 ? "Situazione successiva" : "Vedi il riepilogo"}</button></div>` : ""}
      </div>`;
    if (!answered) {
      const fill = $("defTimeFill");
      const total = s.seconds * 1000;
      const left = Math.max(0, total - (Date.now() - q.startedAt));
      if (fill) {
        fill.style.transition = "none";
        fill.style.width = `${(left / total) * 100}%`;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          fill.style.transition = `width ${left}ms linear`;
          fill.style.width = "0%";
        }));
      }
      if (q.timer) clearTimeout(q.timer);
      q.timer = setTimeout(() => situAnswer(-1), left);
    }
    if (focus) focusFirst(box);
  }

  function focusFirst(box) {
    const f = box.querySelector("[data-autofocus]") || box.querySelector(".def-opt button:not([disabled])");
    if (f) f.focus({ preventScroll: true });
  }

  function situAnswer(index) {
    const q = ui.situ;
    if (!q || q.picked !== null) return;
    if (q.timer) { clearTimeout(q.timer); q.timer = null; }
    const s = SIT.get(q.queue[q.i]);
    const timedOut = index < 0;
    const score = timedOut ? 0 : s.options[index].score;
    q.picked = index;
    q.timedOut = timedOut;
    q.leftFrac = timedOut ? 0 : Math.max(0, 1 - (Date.now() - q.startedAt) / (s.seconds * 1000));
    q.results.push({ id: s.id, score, timedOut });
    E.recordSituation(lab(), s, score, { timedOut });
    save();
    ui.stepAt = Date.now();
    renderSituPlay(true);
    announce(timedOut ? "Tempo scaduto" : score === 2 ? "Scelta migliore" : score === 1 ? "Accettabile" : "Scelta rischiosa");
  }

  function situNext() {
    const q = ui.situ;
    if (!q) return;
    if (q.i < q.queue.length - 1) {
      q.i += 1;
      prepSitu();
    } else {
      q.phase = "summary";
    }
    renderChip();
    renderSituPlay(true);
  }

  function situSummary() {
    const q = ui.situ;
    const pts = q.results.reduce((s, r) => s + r.score, 0);
    const max = q.results.length * 2;
    return `
      <div class="def-situ-sum">
        <div class="def-done-score"><strong>${pts}/${max}</strong><span>punti del turno</span></div>
        <div>
          <h3>${pts >= max * 0.8 ? "Decisioni lucide." : pts >= max * 0.5 ? "Buona base, qualche scelta da rivedere." : "Turno difficile: è proprio così che si impara."}</h3>
          <ul class="def-sum-list">${q.results.map((r) => {
            const s = SIT.get(r.id);
            return `<li class="${r.score === 2 ? "best" : r.score === 1 ? "ok" : "bad"}"><span>${esc(s.title)}</span><em>${r.timedOut ? "tempo scaduto · torna domani" : r.score === 2 ? "migliore" : r.score === 1 ? "accettabile · torna tra 2 giorni" : "da evitare · torna domani"}</em></li>`;
          }).join("")}</ul>
          <div class="def-row"><button type="button" class="def-primary" data-act="situ-start" data-autofocus>Un altro turno</button><button type="button" class="def-ghost" data-act="situ-quit">Fine</button></div>
        </div>
      </div>`;
  }

  /* -------------------------------------------------------------- profilo */

  // Stessa scala del quadro (10-99), cosi' pagina e quadro mostrano gli stessi numeri.
  function profileSkills() {
    const values = E.profile(lab(), P.sessions);
    return E.DIMENSIONS.map((d) => ({ key: d.key, label: d.label, value: Math.round(Math.max(10, Math.min(99, values[d.key]))), text: d.text }));
  }

  function profileTotal() {
    return E.totalScore(Object.fromEntries(profileSkills().map((k) => [k.key, k.value])));
  }

  const ADVICE = {
    prevenzione: "Fai un turno di situazioni al giorno e la prova Periferica: accorgersi prima è metà della difesa.",
    decisione: "Rivedi le situazioni sbagliate quando tornano e leggi bene le note: il principio conta più della singola risposta.",
    riflessi: "Una prova di Semaforo e una di Direzione al giorno, riposato. I tempi migliorano in poche settimane.",
    controllo: "Nel Semaforo aspetta di vedere il colore: meglio 30 ms più lento che partire al rosso.",
    tecnica: "Fai la prossima sessione del programma e rispondi onestamente all'autovalutazione.",
    costanza: "Bastano dieci minuti quasi ogni giorno: una prova di riflessi o un turno di situazioni contano."
  };

  function renderProfile() {
    const box = $("defPanel-profile");
    if (!box) return;
    const l = lab();
    const skills = profileSkills();
    const values = Object.fromEntries(skills.map((k) => [k.key, k.value]));
    const total = E.totalScore(values);
    const radar = typeof buildRadarMarkup === "function" ? buildRadarMarkup(skills, 280, 140, 118, false) : "";
    const weak = E.weakest(values);
    const rank = typeof rankFromScore === "function" ? rankFromScore(total) : "";
    const tests = ["semaforo", "direzione", "periferica"].map((k) => {
      const { list, last, best } = reflexSummary(k);
      return `<li><strong>${TESTS[k].title}</strong><span>${last ? (k === "periferica" ? `ultimo ${last.threshold} ms` : `ultimo ${last.median} ms`) : "mai fatta"}${best != null ? ` · record ${best} ms` : ""}</span>${sparkline(list, k === "periferica" ? "threshold" : "median", true)}</li>`;
    }).join("");
    const phases = E.PHASES.map((ph) => {
      const p = E.phaseProgress(l, P.sessions, ph.n);
      return `<li><strong>Fase ${ph.n} · ${esc(ph.title)}</strong><span>${p.done}/${p.total}</span><div class="def-cat-meter"><i style="width:${(p.done / Math.max(1, p.total)) * 100}%"></i></div></li>`;
    }).join("");
    const stats = E.categoryStats(l);
    const cats = Object.entries(E.CATEGORIES).map(([k, c]) => {
      const st = stats[k];
      return `<li><strong>${esc(c.label)}</strong><span>${st.max ? `${Math.round((st.points / st.max) * 100)}% su ${st.n}` : "—"}</span></li>`;
    }).join("");
    const recent = l.log.slice(-8).reverse().map((e) => {
      const when = new Date(e.t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
      const what = e.kind === "session" ? `Sessione ${esc(e.id.replace("s", ""))} · ${e.q}%` : e.kind === "reflex" ? `Prova ${esc(TESTS[e.test] ? TESTS[e.test].title : e.test)}` : `${esc((SIT.get(e.id) || {}).title || e.id)} · ${e.s === 2 ? "migliore" : e.s === 1 ? "accettabile" : "da evitare"}`;
      return `<li><em>${esc(when)}</em><span>${what}</span></li>`;
    }).join("");
    box.innerHTML = `
      <div class="def-profile">
        <article class="def-pcard def-p-radar">
          <svg class="module-radar def-radar" viewBox="0 0 280 280" aria-label="Profilo difesa">${radar}</svg>
          <div class="def-total"><strong>${total}</strong><span>media delle 6 categorie${rank ? ` · rango ${rank}` : ""}</span></div>
          <ul class="def-dims">${skills.map((k) => `
            <li>
              <div class="def-dim-head"><span>${esc(k.label)}</span><strong>${k.value}</strong></div>
              <div class="def-cat-meter"><i style="width:${k.value}%"></i></div>
              <p>${esc(k.text)}</p>
            </li>`).join("")}</ul>
        </article>
        <div class="def-pside">
          <article class="def-pcard def-weak"><span class="def-kicker">Da allenare</span><h3>${esc(weak.label)} · ${weak.value}</h3><p>${esc(ADVICE[weak.key])}</p></article>
          <article class="def-pcard"><h3>Programma</h3><ul class="def-plist">${phases}</ul></article>
          <article class="def-pcard"><h3>Riflessi</h3><ul class="def-plist">${tests}</ul></article>
          <article class="def-pcard"><h3>Situazioni</h3><ul class="def-plist two">${cats}</ul></article>
          ${recent ? `<article class="def-pcard"><h3>Ultime attività</h3><ul class="def-recent">${recent}</ul></article>` : ""}
        </div>
      </div>`;
  }

  window.renderDefenseProfile = function renderDefenseProfile() {
    if (!E || !$("defense")) return;
    renderChip();
    if (ui.tab === "profile") renderProfile();
  };

  window.defenseProfileSkills = function () {
    return E ? profileSkills() : [];
  };

  window.defenseTrend = function () {
    if (!E) return "";
    const l = lab();
    const done = P.sessions.filter((s) => E.sessionState(l, s.id).done > 0).length;
    const phase = Math.min(E.PHASES.length, E.currentPhase(l, P.sessions));
    const sem = l.reflex.semaforo[l.reflex.semaforo.length - 1];
    if (!done && !sem && !l.log.length) return "Fase 1 · inizia la prima sessione";
    return `Fase ${phase} · ${done}/${P.sessions.length} sessioni${sem && sem.median != null ? ` · semaforo ${sem.median} ms` : ""}`;
  };

  /* --------------------------------------------------------------- eventi */

  function onClick(event) {
    const el = event.target.closest("[data-act], [data-def-tab]");
    if (!el || !$("defense").contains(el)) return;
    if (el.dataset.defTab) { setTab(el.dataset.defTab); return; }
    const act = el.dataset.act;
    if (["situ-pick", "situ-next", "tech-next", "save-session"].includes(act) && (event.detail > 1 || Date.now() - (ui.stepAt || 0) < 300)) return;
    if (act !== "situ-pick" && act !== "check" && act !== "frame" && act !== "practice") ui.stepAt = Date.now();
    switch (act) {
      case "tech":
        if (ui.run) return;
        stopEverything();
        ui.view = { type: "technique", id: el.dataset.id };
        if (ui.tab !== "program") setTab("program");
        destroyFigs();
        renderTechnique(el.dataset.id);
        window.scrollTo({ top: $("defense").offsetTop - 10, behavior: "auto" });
        break;
      case "back":
        ui.view = null;
        render();
        break;
      case "frame": {
        const fig = ui.figs[ui.figs.length - 1];
        if (fig) {
          fig.goTo(Number(el.dataset.index));
          const tg = $("defFigToggle");
          if (tg) tg.textContent = "Anima";
          document.querySelectorAll(".def-frame").forEach((b, j) => b.setAttribute("aria-pressed", j === Number(el.dataset.index) ? "true" : "false"));
        }
        break;
      }
      case "fig-toggle": {
        const fig = ui.figs[ui.figs.length - 1];
        if (!fig) break;
        if (fig.isPlaying()) { fig.pause(); el.textContent = "Anima"; } else { fig.play(); el.textContent = "Pausa"; }
        break;
      }
      case "practice":
        ui.practice = el.dataset.mode;
        el.parentElement.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === el ? "true" : "false"));
        {
          const id = ui.run ? ui.run.session.techniques[ui.run.ti] : ui.view && ui.view.id;
          const t = TECH.get(id);
          const p = el.closest(".def-practice").querySelector("p");
          if (t && p) p.innerHTML = prose(ui.practice === "partner" && t.partner ? t.partner : t.solo);
        }
        break;
      case "start-session": startSession(el.dataset.id); break;
      case "locked": announce("Sessione bloccata: completa prima quella precedente."); break;
      case "pause": togglePause(); break;
      case "warm-next":
        if (ui.run) { ui.run.endsAt = performance.now(); ui.run.paused = false; onTick(); }
        break;
      case "warm-skip": if (ui.run) goStep("tech"); break;
      case "tech-prev": if (ui.run) { ui.run.ti -= 1; renderRun(true); } break;
      case "tech-next":
        if (!ui.run) break;
        if (ui.run.ti < ui.run.session.techniques.length - 1) { ui.run.ti += 1; renderRun(true); window.scrollTo({ top: $("defense").offsetTop - 10, behavior: "auto" }); } else goStep("rounds");
        break;
      case "round-skip":
        if (ui.run && ui.run.round) { ui.run.endsAt = performance.now(); ui.run.paused = false; onTick(); }
        break;
      case "check":
        if (!ui.run) break;
        ui.run.answers[Number(el.dataset.q)] = Number(el.dataset.v);
        renderRun();
        break;
      case "save-session": saveSession(); break;
      case "end-session":
      case "quit-session":
        if (ui.tick) { clearInterval(ui.tick); ui.tick = null; }
        if ("speechSynthesis" in window) try { window.speechSynthesis.cancel(); } catch (e) { /* niente */ }
        ui.run = null;
        render();
        break;
      case "toggle-voice":
        prefs().voice = !prefs().voice;
        el.setAttribute("aria-pressed", prefs().voice ? "true" : "false");
        if (!prefs().voice && "speechSynthesis" in window) try { window.speechSynthesis.cancel(); } catch (e) { /* niente */ }
        save();
        break;
      case "toggle-sound":
        prefs().sound = !prefs().sound;
        el.setAttribute("aria-pressed", prefs().sound ? "true" : "false");
        save();
        break;
      case "test-intro": testIntro(el.dataset.kind); break;
      case "test-start": startTest(); break;
      case "test-abort":
      case "test-back":
        abortTest();
        renderReflex();
        break;
      case "dir": respond(event.timeStamp || performance.now(), el.dataset.dir); break;
      case "peri-shape": periShape(el.dataset.shape); break;
      case "peri-pos": periPos2(Number(el.dataset.pos)); break;
      case "situ-start": startSitu(); break;
      case "situ-pick": situAnswer(Number(el.dataset.index)); break;
      case "situ-next": situNext(); break;
      case "situ-quit":
        if (ui.situ && ui.situ.timer) clearTimeout(ui.situ.timer);
        ui.situ = null;
        renderSitu();
        break;
      default: break;
    }
  }

  // Tocco nell'arena del Semaforo: pointerdown e' piu' rapido del click.
  function onPointer(event) {
    const t = ui.test;
    if (!t || t.phase !== "run" || t.kind !== "semaforo") return;
    if (!event.target.closest("#defArena")) return;
    event.preventDefault();
    respond(event.timeStamp || performance.now());
  }

  function onKey(event) {
    const page = $("defense");
    if (!page || !page.classList.contains("active-page")) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
    const t = ui.test;
    if (t && t.phase === "run") {
      if (event.repeat) { event.preventDefault(); return; }
      if (t.kind === "semaforo" && (event.key === " " || event.key === "Enter")) { event.preventDefault(); respond(event.timeStamp || performance.now()); return; }
      const dir = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" }[event.key];
      if (t.kind === "direzione" && dir) { event.preventDefault(); respond(event.timeStamp || performance.now(), dir); return; }
      if (t.kind === "periferica" && t.state === "shape" && (event.key === "c" || event.key === "q")) { event.preventDefault(); periShape(event.key === "c" ? "circle" : "square"); }
      return;
    }
    if (event.repeat || event.shiftKey) return;
    if (ui.tab === "situ" && ui.situ && ui.situ.phase === "play" && ui.situ.picked === null) {
      const pos = { 1: 0, 2: 1, 3: 2, 4: 3 }[event.key];
      if (pos !== undefined && Date.now() - (ui.stepAt || 0) > 250) {
        event.preventDefault();
        situAnswer(ui.situ.order[pos]);
      }
    }
    if (ui.run && event.key === " " && (ui.run.step === "warmup" || ui.run.step === "rounds") && !(event.target && event.target.closest && event.target.closest("button"))) {
      event.preventDefault();
      togglePause();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("defense");
    if (!page || !E) return;
    page.addEventListener("click", onClick);
    page.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    const chip = $("defChip");
    if (chip) chip.addEventListener("click", () => setTab("profile"));
    // Tab con le frecce (pattern ARIA delle schede)
    const tabs = page.querySelector(".def-tabs");
    if (tabs) tabs.addEventListener("keydown", (event) => {
      const list = [...tabs.querySelectorAll("[data-def-tab]")];
      const i = list.indexOf(document.activeElement);
      if (i < 0) return;
      const j = event.key === "ArrowRight" ? (i + 1) % list.length : event.key === "ArrowLeft" ? (i - 1 + list.length) % list.length : -1;
      if (j < 0) return;
      event.preventDefault();
      list[j].focus();
      setTab(list[j].dataset.defTab);
    });
    // Se si lascia la pagina: prove interrotte, sessione in pausa, voce zitta.
    const pauseAll = () => {
      if (ui.test && ui.test.phase === "run") { abortTest(); if (ui.tab === "reflex") renderReflex(); }
      if (ui.run && !ui.run.paused && (ui.run.step === "warmup" || ui.run.step === "rounds")) togglePause();
      if (ui.situ && ui.situ.phase === "play" && ui.situ.picked === null && ui.situ.timer) {
        // il tempo continua a scorrere: niente pausa per non dare vantaggi
      }
      if ("speechSynthesis" in window) try { window.speechSynthesis.cancel(); } catch (e) { /* niente */ }
    };
    document.addEventListener("visibilitychange", () => { if (document.hidden) pauseAll(); });
    window.addEventListener("hashchange", () => { if (!page.classList.contains("active-page") || location.hash !== "#defense") pauseAll(); });
    if ("speechSynthesis" in window) {
      try { window.speechSynthesis.onvoiceschanged = () => { itVoice = null; }; } catch (e) { /* niente */ }
    }
    setTab("program");
  });
})();
