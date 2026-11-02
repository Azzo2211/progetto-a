/*
 * Progetto A - Recupero: la pagina (Oggi, Fasi, Test, Esercizi, Perché, Progressi), la sessione
 * guidata con il timer e la scheda nel quadro.
 * Motore: window.RecoveryEngine (dati in window.RecoveryData). Stato: state.recoveryLab.
 * Usa le globali di app.js: state, saveState, renderDashboard, buildRadarMarkup.
 * Il timer conta sull'ora vera e tiene lo schermo acceso con DefenseAwake (defense/keepawake.js).
 */
(function () {
  "use strict";

  const E = window.RecoveryEngine;
  const D = window.RecoveryData;
  if (!E || !D) return;

  const ui = {
    tab: "today",      // today | phases | test | library | why | progress
    ex: 0,             // esercizio aperto nella sessione
    exFor: null,
    finishing: false,  // domanda sul ginocchio prima di chiudere
    summary: null,     // riepilogo dopo la sessione
    check: null,       // bozza del controllo del giorno
    checkEdit: false,
    setupEdit: false,
    filter: "all",
    testMsg: null,
    timer: null,
    setupErr: ""
  };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const dateShort = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const dateLong = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const dec = (v) => String(v).replace(".", ",");
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const AREA = Object.fromEntries(D.AREAS.map((a) => [a.id, a.label]));
  const RATE = [
    { v: "easy", label: "Facile", hint: "Ne avevi ancora parecchie" },
    { v: "ok", label: "Giusto", hint: "Ultime ripetizioni impegnative" },
    { v: "hard", label: "Duro", hint: "Al limite, forma ancora pulita" },
    { v: "pain", label: "Dolore", hint: "Al ginocchio, oltre 3 su 10" },
    { v: "skip", label: "Saltato", hint: "Non l'ho fatto" }
  ];
  const TIME_HINT = { easy: "Comodo, potevo andare oltre", ok: "Impegnativo ma gestibile", hard: "Al limite, ho tenuto a fatica" };
  const RATE_LABEL = Object.fromEntries(RATE.map((r) => [r.v, r.label]));

  function lab() {
    state.recoveryLab = E.ensure(state.recoveryLab);
    return state.recoveryLab;
  }
  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
    renderChip();
    renderCard();
  }
  function announce(text) {
    const live = $("rcLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }
  const sideLabel = (l) => (l.setup ? (l.setup.side === "sinistra" ? "sinistra" : "destra") : "");
  function monthsText(l) {
    const m = E.monthsSince(l);
    const whole = Math.floor(m);
    const weeks = Math.floor(((m - whole) * 30.44) / 7);
    return `${whole === 1 ? "1 mese" : `${whole} mesi`}${weeks ? ` e ${plural(weeks, "settimana", "settimane")}` : ""} dall'intervento`;
  }

  /* ------------------------------------------------------------ suoni */
  let audio = null;
  function beep(freq = 880, ms = 140, gain = 0.08) {
    if (!lab().prefs.sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.frequency.value = freq;
      g.gain.setValueAtTime(gain, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + ms / 1000);
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + ms / 1000 + 0.02);
    } catch (e) { /* audio non disponibile */ }
  }

  /* ------------------------------------------------------------ chip e scheda nel quadro */
  function renderChip() {
    const box = $("rcChip");
    if (!box) return;
    const l = lab();
    if (!E.configured(l)) {
      box.innerHTML = `<span class="rc-chip-num">?</span><span class="rc-chip-copy"><strong>Da impostare</strong><span>Due minuti per partire</span></span>`;
      return;
    }
    const p = E.phase(l);
    const heel = E.latestValue(l, "heel");
    box.innerHTML = `<span class="rc-chip-num">${p}</span><span class="rc-chip-copy"><strong>Fase ${p} · ${esc(D.PHASES[p - 1].name)}</strong><span>${esc(monthsText(l))}${heel == null ? "" : heel === 0 ? " · estensione completa" : ` · talloni −${dec(heel)} cm`}</span></span>`;
  }

  function renderCard() {
    const box = $("recoveryCardIndicators");
    if (!box) return;
    const l = lab();
    const vals = E.profile(l);
    const p = E.configured(l) ? E.phase(l) : null;
    box.classList.add("dashboard-card-profile");
    const svg = typeof buildRadarMarkup === "function" ? buildRadarMarkup(vals.map((v) => ({ label: v.label, value: v.value })), 180, 90, 80, false) : "";
    box.innerHTML = `
      <div class="dashboard-card-top">
        <svg class="dashboard-card-radar" viewBox="0 0 180 180" role="img" aria-label="Profilo del recupero: ${vals.map((v) => `${esc(v.label)} ${v.measured ? v.value : "da misurare"}`).join(", ")}">${svg}</svg>
        <div class="dashboard-card-average">
          <strong>${p ? `F${p}` : "—"}</strong>
          <span class="card-rank rc-card-tag">${p ? `Fase ${p} di 4` : "Da impostare"}</span>
        </div>
      </div>
      <dl class="card-values">${vals.map((v) => `<div><dt>${esc(v.label)}</dt><dd>${v.measured ? v.value : "—"}</dd></div>`).join("")}</dl>
      <div class="dashboard-card-trend">${esc(E.trend(l))} · fuori dal rango</div>`;
  }

  /* ------------------------------------------------------------ esagono */
  function hexProfile(l) {
    const vals = E.profile(l);
    let i = -1;
    const svg = (typeof buildRadarMarkup === "function" ? buildRadarMarkup(vals.map((v) => ({ label: v.label, value: v.value })), 380, 190, 98, true) : "")
      .replace(/(<text class="radar-value"[^>]*>)[^<]*(<\/text>)/g, (m, a, b) => { i += 1; const v = vals[i]; return v ? `${a}${v.measured ? v.value : "da misurare"}${b}` : m; });
    const measured = vals.filter((v) => v.measured);
    const total = measured.length ? Math.round(measured.reduce((s, v) => s + v.value, 0) / measured.length) : null;
    return `<div class="rc-hex">
      <svg class="rc-hex-svg" viewBox="0 0 380 380" role="img" aria-label="Profilo del recupero: ${vals.map((v) => `${esc(v.label)} ${v.measured ? v.value : "da misurare"}`).join(", ")}">${svg}</svg>
      <div class="rc-hex-total"><strong>${total == null ? "—" : total}</strong><span>${total == null ? "fai il primo test per vedere il profilo" : `media delle voci misurate · ${plural(measured.length, "voce", "voci")} su 6`}</span></div>
    </div>
    <ul class="rc-metrics">${vals.map((v) => `<li class="${v.measured ? "" : "todo"}"><span>${esc(v.label)}</span><strong>${v.measured ? v.value : "da misurare"}</strong>${v.measured ? `<i style="--w:${v.value}%"></i>` : ""}</li>`).join("")}</ul>
    <p class="rc-small">Il recupero non entra nel rango generale: qui non conviene mai forzare per prendere punti.</p>`;
  }

  /* ------------------------------------------------------------ OGGI */
  function alertsHtml(l) {
    const a = E.alerts(l);
    if (!a.length) return "";
    return `<div class="rc-alerts">${a.map((x) => `<p class="rc-alert ${x.level}" role="${x.level === "rosso" ? "alert" : "note"}">${esc(x.text)}</p>`).join("")}</div>`;
  }

  function setupCard(l, first) {
    const s = l.setup || {};
    const def = (() => { const d = new Date(); d.setMonth(d.getMonth() - 4); return d.toISOString().slice(0, 10); })();
    const today = new Date().toISOString().slice(0, 10);
    return `
      <article class="rc-card rc-setup">
        <h2>${first ? "Prima di partire: due minuti" : "I dati dell'intervento"}</h2>
        <p>${first ? "Servono per calcolare le date, scegliere da dove partire e darti i consigli giusti per il tuo innesto. Il piano poi si aggiusta da solo con i test di ogni settimana." : "Se cambi «quanto riesci a piegare» puoi far ripartire i livelli di sedia e affondo da lì."}</p>
        <form id="rcSetup" class="rc-form" novalidate>
          <label class="rc-field"><span>Data dell'intervento</span><input type="date" name="surgery" value="${esc(s.surgery || def)}" max="${today}" required /><small>${s.surgery ? "" : "Ho messo 4 mesi fa: correggi con la data esatta."}</small></label>
          <fieldset class="rc-field"><legend>Gamba operata</legend><div class="rc-seg">${["destra", "sinistra"].map((v) => `<label><input type="radio" name="side" value="${v}" ${(s.side || "destra") === v ? "checked" : ""} /><span>${v[0].toUpperCase() + v.slice(1)}</span></label>`).join("")}</div></fieldset>
          <label class="rc-field"><span>Da dove è stato preso il nuovo legamento</span><select name="graft">${D.GRAFTS.map((g) => `<option value="${g.id}" ${(s.graft || "nonso") === g.id ? "selected" : ""}>${esc(g.label)}</option>`).join("")}</select></label>
          <fieldset class="rc-field"><legend>Oggi, con il peso sopra, quanto riesci a piegare il ginocchio?</legend><div class="rc-options">${D.FLEX.map((f) => `<label><input type="radio" name="flex" value="${f.id}" ${(s.flex ?? 0) === f.id ? "checked" : ""} /><span>${esc(f.label)}</span></label>`).join("")}</div></fieldset>
          ${first ? "" : `<label class="rc-check"><input type="checkbox" name="resetLevels" /><span>Fai ripartire sedia, seduta al muro e affondo da questa risposta</span></label>`}
          ${ui.setupErr ? `<p class="rc-error" role="alert">${esc(ui.setupErr)}</p>` : ""}
          <div class="rc-actions"><button type="submit" class="primary-action">${first ? "Inizia il piano" : "Salva"}</button>${first ? "" : `<button type="button" class="ghost-action" data-r="setup-cancel">Annulla</button>`}</div>
        </form>
      </article>`;
  }

  function checkCard(chk) {
    const d = ui.check || (chk ? { swelling: chk.swelling, pain: chk.pain, trend: chk.trend, gaveWay: chk.gaveWay } : { swelling: null, pain: 0, trend: null, gaveWay: false });
    ui.check = d;
    const seg = (field, opts) => `<div class="rc-seg" role="group">${opts.map(([v, label]) => `<button type="button" data-r="ck" data-f="${field}" data-v="${v}" aria-pressed="${d[field] === v}">${label}</button>`).join("")}</div>`;
    const ready = d.swelling !== null && d.trend !== null;
    return `
      <article class="rc-card rc-check-card">
        <h2>Com'è il ginocchio stamattina?</h2>
        <p class="rc-small">Trenta secondi: decide se oggi la sessione è normale, leggera o senza gambe.</p>
        <div class="rc-q"><span>Gonfiore</span>${seg("swelling", [[0, "Nessuno"], [1, "Poco"], [2, "Evidente"]])}</div>
        <div class="rc-q"><span>Rispetto a ieri</span>${seg("trend", [[-1, "Meglio"], [0, "Uguale"], [1, "Peggio"]])}</div>
        <div class="rc-q"><label for="rcPain">Dolore a riposo <output id="rcPainOut">${d.pain} su 10</output></label><input id="rcPain" type="range" min="0" max="10" step="1" value="${d.pain}" data-r="pain" /></div>
        <div class="rc-q"><span>Da ieri il ginocchio ha ceduto (si è «spostato»)?</span>${seg("gaveWay", [[false, "No"], [true, "Sì"]])}</div>
        <div class="rc-actions"><button type="button" class="primary-action" data-r="ck-save" ${ready ? "" : "disabled"}>Salva il controllo</button>${chk ? `<button type="button" class="ghost-action" data-r="ck-cancel">Annulla</button>` : ""}${ready ? "" : `<span class="rc-small">Rispondi a gonfiore e «rispetto a ieri».</span>`}</div>
      </article>`;
  }

  function readyCard(r) {
    const title = { verde: "Verde: sessione normale", giallo: "Giallo: versione leggera", rosso: "Rosso: oggi niente gambe" }[r.level];
    return `
      <article class="rc-card rc-ready ${r.level}">
        <div class="rc-ready-top"><span class="rc-light" aria-hidden="true"></span><h2>${title}</h2><button type="button" class="ghost-action small" data-r="ck-edit">Modifica</button></div>
        ${r.reasons.length ? `<p class="rc-small">Perché: ${esc(r.reasons.join(", "))}.</p>` : ""}
        <p>${esc(r.advice)}</p>
      </article>`;
  }

  function stepsCard(l, r) {
    const steps = E.plan(l);
    const sug = E.suggest(l);
    const done = steps.filter((s) => s.done).length;
    const row = (s) => {
      let action = "";
      if (s.id === "check") action = s.done ? "" : `<span class="rc-small">qui sopra</span>`;
      else if (s.kind === "ext" && !s.done) action = `<button type="button" class="primary-action small" data-r="start" data-kind="ext">Inizia</button>`;
      else if (s.id === "session" && !s.done && s.kind !== "rest") action = `<button type="button" class="primary-action small" data-r="start" data-kind="${s.kind}">Inizia</button>`;
      else if (s.id === "test") action = `<button type="button" class="primary-action small alt" data-r="tab" data-tab="test">Apri i test</button>`;
      const sub = s.id === "session" && !s.done && sug.reason ? `<small>${esc(sug.reason)}${r && r.level === "giallo" && s.kind !== "rest" ? " Versione leggera." : ""}</small>` : s.kind === "ext" && !s.done ? `<small>Prono appeso, tallone su rialzo, arco corto.</small>` : "";
      return `<li class="${s.done ? "done" : ""}"><span class="rc-dot" aria-hidden="true">${s.done ? "✓" : ""}</span><span class="rc-step-copy"><strong>${esc(s.title)}</strong>${sub}</span><span class="rc-step-min">${s.done ? "fatto" : `${s.minutes} min`}</span>${action ? `<span class="rc-step-act">${action}</span>` : ""}</li>`;
    };
    return `
      <article class="rc-card">
        <div class="rc-card-head"><h2>Il programma di oggi</h2><span class="rc-count">${done} di ${steps.length}</span></div>
        <ol class="rc-steps">${steps.map(row).join("")}</ol>
      </article>`;
  }

  function phaseTrack(l, pi) {
    const miss = pi.missing.slice(0, 4);
    return `
      <article class="rc-card rc-track-card">
        <h2>Le fasi</h2>
        <ol class="rc-track">${D.PHASES.map((p) => `<li class="${p.n < pi.phase ? "past" : p.n === pi.phase ? "now" : ""}"><span>${p.n}</span><em>${esc(p.name)}</em></li>`).join("")}</ol>
        ${pi.capped ? `<p class="rc-alert rosso">Un cedimento recente ti tiene alla fase 2 finché non ti vede il chirurgo.</p>` : ""}
        ${pi.next ? `<p class="rc-small"><strong>Per la fase ${pi.next.n}</strong> ${miss.length ? "manca:" : ""}</p>
        <ul class="rc-miss">${miss.map((c) => `<li class="${c.met === false ? "no" : "todo"}"><span>${esc(c.text)}</span><em>${esc(c.value)}</em></li>`).join("")}${pi.missing.length > miss.length ? `<li class="more">e altri ${pi.missing.length - miss.length}</li>` : ""}</ul>` : `<p>Sei all'ultima fase: forza due volte a settimana e sparring per gradi.</p>`}
        <button type="button" class="ghost-action small" data-r="tab" data-tab="phases">Tutte le fasi e i criteri</button>
      </article>`;
  }

  function extraCard(l, r) {
    const red = r && r.level === "rosso";
    const kinds = ["ext", "legs", "upperA", "upperB", "martial"];
    return `
      <article class="rc-card">
        <h2>Allenamento in più</h2>
        <div class="rc-extra">${kinds.map((k) => {
          const info = D.SESSION_INFO[k];
          const off = red && k === "legs";
          return `<button type="button" class="rc-extra-btn" data-r="start" data-kind="${k}" ${off ? `disabled title="Oggi il ginocchio è rosso: niente gambe"` : ""}><strong>${esc(info.short)}</strong><span>${off ? "non oggi" : `${info.minutes} min`}</span></button>`;
        }).join("")}</div>
      </article>`;
  }

  function gatesCard(l) {
    const g = E.gates(l);
    return `
      <article class="rc-card">
        <h2>Date minime</h2>
        <p class="rc-small">Prima contano i criteri dei test; queste date sono un limite in più.</p>
        <ul class="rc-gates">${g.map((x) => `<li class="${x.open ? "open" : ""}"><span>${esc(x.label)}</span><em>${x.open ? "da " : "dal "}${x.months}° mese · ${esc(dateShort(x.date))}</em></li>`).join("")}</ul>
      </article>`;
  }

  const DISCLAIMER = `<p class="rc-disclaimer">Questo piano non sostituisce il fisioterapista né il chirurgo: è il lavoro di tutti i giorni tra un controllo e l'altro. Dolore acuto, ginocchio che cede, gonfiore che cresce o estensione che non migliora: fermati e fatti vedere.</p>`;

  function todayView(l) {
    if (!E.configured(l) || ui.setupEdit) return `${alertsHtml(l)}${setupCard(l, !E.configured(l))}${DISCLAIMER}`;
    const chk = E.todayCheck(l);
    const r = E.readiness(l);
    const pi = E.phaseInfo(l);
    return `
      ${alertsHtml(l)}
      <div class="rc-grid">
        <div class="rc-col">
          ${!chk || ui.checkEdit ? checkCard(chk) : readyCard(r)}
          ${stepsCard(l, r)}
        </div>
        <div class="rc-col">
          ${phaseTrack(l, pi)}
          ${extraCard(l, r)}
          ${gatesCard(l)}
        </div>
      </div>
      ${DISCLAIMER}`;
  }

  /* ------------------------------------------------------------ timer */
  function phasesFor(d) {
    const out = [];
    const sets = d.sets || 1;
    for (let s = 1; s <= sets; s += 1) {
      const sides = d.perSide ? ["gamba o lato operato", "l'altro lato"] : [""];
      const task = Array.isArray(d.tasks) ? d.tasks[s - 1] || "" : "";
      sides.forEach((side, si) => {
        if (d.work != null) out.push({ type: "work", secs: d.work, set: s, side, task });
        else out.push({ type: "reps", reps: d.reps, set: s, side, task });
        if (si === 0 && sides.length > 1) out.push({ type: "switch", secs: 5, set: s, task });
      });
      if (s < sets && d.rest) out.push({ type: "rest", secs: d.rest, set: s, task: Array.isArray(d.tasks) ? d.tasks[s] || "" : "" });
    }
    return out;
  }
  function ensureTimer(id, lv, dose) {
    const key = `${id}|${lv}|${JSON.stringify(dose)}`;
    if (ui.timer && ui.timer.key === key) return ui.timer;
    stopTimer();
    const phases = phasesFor(dose);
    ui.timer = { key, phases, i: 0, left: phases[0].secs || 0, running: false, endsAt: 0, tick: null, finished: false, sets: dose.sets || 1 };
    return ui.timer;
  }
  function stopTimer() {
    if (ui.timer && ui.timer.tick) clearInterval(ui.timer.tick);
    if (ui.timer && window.DefenseAwake) DefenseAwake.release();
    ui.timer = null;
  }
  const mmss = (s) => { const t = Math.max(0, Math.ceil(s)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`; };
  function timerMarkup() {
    return `<div class="rc-timer" id="rcTimer"><div class="rc-timer-top"><span id="rcTPhase"></span><span class="rc-sets" id="rcTSets"></span></div><div class="rc-timer-clock" id="rcTClock" aria-hidden="true"></div><p class="rc-task" id="rcTTask" hidden></p><div class="rc-bar"><i id="rcTBar"></i></div><div class="rc-actions" id="rcTCtrl"></div><p class="rc-small" id="rcTAwake" hidden></p></div>`;
  }
  function paintTimer() {
    const t = ui.timer;
    const phase = $("rcTPhase");
    const clock = $("rcTClock");
    const ctrl = $("rcTCtrl");
    if (!t || !phase || !clock || !ctrl) return;
    const p = t.phases[Math.min(t.i, t.phases.length - 1)];
    const box = $("rcTimer");
    if (box) box.className = `rc-timer ${t.finished ? "finished" : p.type}`;
    const sets = $("rcTSets");
    if (sets) sets.innerHTML = Array.from({ length: t.sets }, (_, i) => `<i class="${i + 1 < p.set || t.finished ? "done" : i + 1 === p.set ? "now" : ""}"></i>`).join("");
    const key = `${t.i}|${t.running}|${t.finished}`;
    if (t.ctrlKey !== key || !ctrl.firstChild) {
      const had = ctrl.contains(document.activeElement) ? document.activeElement.dataset.r : null;
      t.ctrlKey = key;
      ctrl.innerHTML = t.finished
        ? `<button type="button" class="ghost-action small" data-r="t-reset">Ricomincia</button><span class="rc-small">Ora segna com'è andata.</span>`
        : p.type === "reps"
          ? `<button type="button" class="primary-action small" data-r="t-done">Serie fatta</button><button type="button" class="ghost-action small" data-r="t-reset">Ricomincia</button>`
          : `${t.running ? `<button type="button" class="primary-action small" data-r="t-pause">Pausa</button>` : `<button type="button" class="primary-action small" data-r="t-start">${t.i === 0 && t.left === p.secs ? "Avvia" : "Riprendi"}</button>`}<button type="button" class="ghost-action small" data-r="t-skip">${p.type === "work" ? "Fine serie" : "Salta"}</button><button type="button" class="ghost-action small" data-r="t-reset">Ricomincia</button>`;
      if (had) { const again = ctrl.querySelector(`[data-r="${had}"]`) || ctrl.querySelector("button"); if (again) again.focus({ preventScroll: true }); }
    }
    const awake = $("rcTAwake");
    if (awake) {
      const msg = t.running ? "Se lo schermo si spegne o cambi app, il tempo continua: quando torni è già al punto giusto." : "";
      if (awake.textContent !== msg) awake.textContent = msg;
      awake.hidden = !msg;
    }
    const task = $("rcTTask");
    if (task) {
      const text = t.finished ? "" : p.type === "rest" && p.task ? `Prossima serie: ${p.task}` : p.task || "";
      if (task.textContent !== text) task.textContent = text;
      task.hidden = !text;
    }
    const bar = $("rcTBar");
    if (t.finished) { phase.textContent = "Esercizio finito"; clock.textContent = "Fatto"; if (bar) bar.style.width = "100%"; return; }
    const side = p.side ? ` · ${p.side}` : "";
    if (p.type === "reps") { phase.textContent = `Serie ${p.set} di ${t.sets}${side}`; clock.textContent = `${p.reps} rip.`; if (bar) bar.style.width = "100%"; return; }
    phase.textContent = p.type === "rest" ? `Recupero · poi serie ${p.set + 1}` : p.type === "switch" ? "Cambia lato" : `Serie ${p.set} di ${t.sets}${side}`;
    clock.textContent = mmss(t.left);
    if (bar) bar.style.width = `${clamp((t.left / p.secs) * 100, 0, 100)}%`;
  }
  function timerStart() {
    const t = ui.timer;
    if (!t || t.finished) return;
    const p = t.phases[t.i];
    if (!p.secs) return;
    if (p.type === "work" && t.left === p.secs) beep(880, 120);
    t.running = true;
    t.endsAt = Date.now() + t.left * 1000;
    if (window.DefenseAwake) { DefenseAwake.acquire(); DefenseAwake.askNotify(); }
    clearInterval(t.tick);
    t.tick = setInterval(timerTick, 200);
    paintTimer();
  }
  function timerPause() {
    const t = ui.timer;
    if (!t) return;
    t.running = false;
    clearInterval(t.tick);
    if (window.DefenseAwake) DefenseAwake.release();
    paintTimer();
  }
  function timerTick() {
    const t = ui.timer;
    if (!t || !t.running) return;
    const prev = Math.ceil(t.left);
    t.left = (t.endsAt - Date.now()) / 1000;
    if (t.left <= -1.5) { catchUp(); return; }
    const whole = Math.ceil(t.left);
    if (whole !== prev && whole <= 3 && whole > 0 && !document.hidden) beep(740, 60, 0.05);
    if (t.left <= 0) nextPhase(true); else paintTimer();
  }
  // Dopo una sospensione (schermo spento): salta le fasi a tempo gia' finite.
  function catchUp() {
    const t = ui.timer;
    if (!t || !t.running) return;
    let over = Math.max(0, -t.left);
    let guard = 0;
    nextPhase(true, true);
    while (ui.timer === t && t.running && !t.finished && guard < 300) {
      guard += 1;
      const p = t.phases[t.i];
      if (!p || !p.secs) break;
      if (over >= p.secs) { over -= p.secs; t.left = 0; nextPhase(true, true); continue; }
      t.left = p.secs - over;
      t.endsAt = Date.now() + t.left * 1000;
      break;
    }
    paintTimer();
  }
  function nextPhase(auto, quiet) {
    const t = ui.timer;
    if (!t) return;
    clearInterval(t.tick);
    t.running = false;
    t.i += 1;
    const aw = window.DefenseAwake;
    if (t.i >= t.phases.length) {
      t.finished = true;
      beep(523, 380, 0.09);
      announce("Esercizio finito: segna com'è andata");
      if (aw) { aw.notify("Esercizio finito", "Segna com'è andata."); aw.release(); }
      paintTimer();
      return;
    }
    const p = t.phases[t.i];
    t.left = p.secs || 0;
    if (!quiet) {
      if (p.type === "rest") { beep(523, 260, 0.07); announce(`Recupero ${p.secs} secondi`); if (aw) aw.notify("Recupero", `${p.secs} secondi`); }
      if (p.type === "switch") { beep(660, 160, 0.06); announce("Cambia lato"); if (aw) aw.notify("Cambia lato", ""); }
      if (p.type === "work" || p.type === "reps") { announce(`Serie ${p.set} di ${t.sets}${p.side ? `, ${p.side}` : ""}`); if (aw) aw.notify(`Serie ${p.set} di ${t.sets}`, p.type === "reps" ? "Quando hai finito, segna la serie." : "Via!"); }
    }
    if (p.secs && (auto || p.type !== "work")) timerStart();
    else { if (aw && p.type === "reps") aw.release(); paintTimer(); }
  }

  /* ------------------------------------------------------------ SESSIONE */
  function sessionItems(l) {
    const c = l.current;
    return c.items.map((id) => {
      const e = E.EX.get(id);
      const lv = E.levelOf(l, id, c.phase);
      return { id, e, lv, dose: E.doseOf(e, lv, c.light) };
    });
  }

  function sessionView(l) {
    const c = l.current;
    const items = sessionItems(l);
    const key = `${c.kind}-${c.startedAt}`;
    if (ui.exFor !== key) {
      ui.exFor = key;
      const open = items.findIndex((x) => c.results[x.id] === undefined);
      ui.ex = open >= 0 ? open : items.length - 1;
    }
    ui.ex = clamp(ui.ex, 0, items.length - 1);
    const marked = items.filter((x) => c.results[x.id] !== undefined).length;
    const info = D.SESSION_INFO[c.kind];
    const list = items.map((x, i) => {
      const r = c.results[x.id];
      return `<li class="${i === ui.ex ? "now" : ""} ${r ? `r-${r}` : ""}"><button type="button" data-r="goto" data-i="${i}"><span class="rc-dot" aria-hidden="true">${r ? (r === "skip" ? "–" : r === "pain" ? "!" : "✓") : i + 1}</span><span>${esc(x.e.name)}<small>${esc(AREA[x.e.area])}</small></span><span class="rc-sr">${r ? RATE_LABEL[r] : "da fare"}</span></button></li>`;
    }).join("");
    if (ui.finishing) return finishView(l, items, marked);
    const x = items[ui.ex];
    const e = x.e;
    const lvMax = E.maxLevel(l, e, c.phase);
    const nextLocked = x.lv < e.levels.length - 1 && x.lv >= lvMax ? e.levels[x.lv + 1] : null;
    const lockWhy = nextLocked ? (nextLocked.phase ? `dalla fase ${nextLocked.phase}` : nextLocked.minMonths ? `dal ${nextLocked.minMonths}° mese` : "") : "";
    const L = e.levels[x.lv];
    const result = c.results[x.id];
    const last = [...l.sessions].reverse().find((s) => s.results[x.id] && s.results[x.id] !== "skip");
    const graft = l.setup && l.setup.graft;
    const graftNote = (graft === "rotuleo" && /ginocchio dietro|in ginocchio/i.test(e.steps.join(" "))) ? "Innesto dal tendine rotuleo: se appoggiare il ginocchio dà fastidio, metti un cuscino." : "";
    return `
      <div class="rc-session">
        <div class="rc-session-head">
          <div><span class="rc-kicker">${esc(info.label)} · fase ${c.phase}${c.light ? " · versione leggera" : ""}${c.red ? " · ginocchio a riposo" : ""}</span><h2>Esercizio ${ui.ex + 1} di ${items.length}</h2></div>
          <div class="rc-session-tools">
            <span class="rc-count">${marked}/${items.length} segnati</span>
            <button type="button" class="ghost-action small" data-r="sound" aria-pressed="${l.prefs.sound}">Suoni</button>
            <button type="button" class="ghost-action small" data-r="cancel">Annulla</button>
          </div>
        </div>
        <div class="rc-session-grid">
          <ol class="rc-exlist">${list}</ol>
          <article class="rc-ex">
            <div class="rc-ex-top"><span class="rc-area a-${e.area}">${esc(AREA[e.area])}</span><span class="rc-dose">${esc(E.doseText(x.dose))}</span></div>
            <h3 data-focus-title tabindex="-1">${esc(e.name)}</h3>
            <div class="rc-level">
              <button type="button" class="ghost-action small" data-r="lv" data-d="-1" ${x.lv <= 0 ? "disabled" : ""} aria-label="Livello più facile">‹ Più facile</button>
              <div class="rc-level-mid"><span>Livello ${x.lv + 1} di ${e.levels.length}</span><strong>${esc(L.name)}</strong></div>
              <button type="button" class="ghost-action small" data-r="lv" data-d="1" ${x.lv >= lvMax ? "disabled" : ""} aria-label="Livello più difficile">Più difficile ›</button>
            </div>
            <p class="rc-level-text">${esc(L.text)}${lockWhy ? ` <span class="rc-small">Il livello dopo si apre ${esc(lockWhy)}.</span>` : ""}</p>
            ${last ? `<p class="rc-last">L'ultima volta (${esc(dateShort(last.t))}): ${esc(RATE_LABEL[last.results[x.id]].toLowerCase())}.</p>` : ""}
            <p class="rc-goal">${esc(e.goal)}</p>
            ${e.safety ? `<p class="rc-safety"><strong>Sicurezza</strong>${esc(e.safety)}</p>` : ""}
            ${graftNote ? `<p class="rc-safety"><strong>Il tuo innesto</strong>${esc(graftNote)}</p>` : ""}
            ${timerMarkup()}
            <p class="rc-how">${esc(e.how)}</p>
            <h4>Come si fa</h4>
            <ol class="rc-list">${e.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
            <h4>Punti chiave</h4>
            <ul class="rc-list">${e.cues.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
            <details class="rc-errors"><summary>Errori tipici</summary><ul>${e.errors.map((x2) => `<li><strong>${esc(x2.e)}</strong><span>${esc(x2.fix)}</span></li>`).join("")}</ul></details>
            <p class="rc-martial"><strong>Per le arti marziali</strong>${esc(e.martial)}</p>
            <div class="rc-rate" role="group" aria-label="Com'è andata">
              ${RATE.map((r) => `<button type="button" class="rc-rate-btn r-${r.v}" data-r="rate" data-v="${r.v}" aria-pressed="${result === r.v}"><strong>${r.label}</strong><span>${x.dose.work != null && TIME_HINT[r.v] ? TIME_HINT[r.v] : r.hint}</span></button>`).join("")}
            </div>
            ${result === "pain" ? `<p class="rc-alert giallo">Alla fine della sessione questo esercizio scende di un livello. Se il dolore resta anche da fermo, chiudi qui la sessione per le gambe.</p>` : ""}
            <div class="rc-actions rc-ex-nav">
              ${ui.ex > 0 ? `<button type="button" class="ghost-action small" data-r="goto" data-i="${ui.ex - 1}">‹ Precedente</button>` : ""}
              ${ui.ex < items.length - 1 ? `<button type="button" class="ghost-action small" data-r="goto" data-i="${ui.ex + 1}">Successivo ›</button>` : ""}
              <button type="button" class="primary-action" data-r="finish" ${marked ? "" : "disabled"}>Concludi la sessione</button>
              ${marked < items.length ? `<span class="rc-small">${marked ? `Gli esercizi non segnati contano come saltati.` : "Segna almeno un esercizio per concludere."}</span>` : ""}
            </div>
          </article>
        </div>
      </div>`;
  }

  function finishView(l, items, marked) {
    const c = l.current;
    const ext = c.kind === "ext";
    return `
      <div class="rc-session">
        <article class="rc-card rc-finish">
          <span class="rc-kicker">${esc(D.SESSION_INFO[c.kind].label)} · ${marked} di ${items.length} esercizi segnati</span>
          <h2 data-focus-title tabindex="-1">Durante la sessione, il ginocchio?</h2>
          <p class="rc-small">Serve per decidere i livelli: con dolore non si sale.</p>
          <div class="rc-rate three" role="group" aria-label="Il ginocchio durante la sessione">
            <button type="button" class="rc-rate-btn r-easy" data-r="done" data-knee="0"><strong>Niente</strong><span>Nessun fastidio</span></button>
            <button type="button" class="rc-rate-btn r-hard" data-r="done" data-knee="1"><strong>Fastidio leggero</strong><span>Fino a 3 su 10, passa presto</span></button>
            <button type="button" class="rc-rate-btn r-pain" data-r="done" data-knee="2"><strong>Dolore</strong><span>Oltre 3 su 10</span></button>
          </div>
          ${ext ? `<p class="rc-small">La routine conta per oggi appena la chiudi.</p>` : ""}
          <div class="rc-actions"><button type="button" class="ghost-action small" data-r="finish-back">‹ Torna agli esercizi</button></div>
        </article>
      </div>`;
  }

  function summaryView(l) {
    const s = ui.summary;
    const en = s.res.entry;
    const steps = E.plan(l).filter((x) => !x.done);
    return `
      <article class="rc-card rc-summary">
        <span class="rc-kicker">${esc(D.SESSION_INFO[en.kind].label)} · ${en.minutes} min</span>
        <h2 data-focus-title tabindex="-1">Sessione salvata</h2>
        <p>${en.done} esercizi fatti su ${en.total}.${en.knee === 2 ? " Hai segnato dolore al ginocchio: domani fai con calma il controllo del mattino." : ""}</p>
        ${s.res.ups.length ? `<h3>Livello in più</h3><ul class="rc-list">${s.res.ups.map((u) => `<li><strong>${esc(u.name)}</strong>: ${esc(u.to)}</li>`).join("")}</ul>` : ""}
        ${s.res.downs.length ? `<h3>Un passo indietro</h3><ul class="rc-list">${s.res.downs.map((u) => `<li><strong>${esc(u.name)}</strong>: ${esc(u.to)}</li>`).join("")}</ul>` : ""}
        ${!s.res.ups.length && !s.res.downs.length && en.kind !== "ext" ? `<p class="rc-small">Un livello sale dopo due «facile» di fila sullo stesso esercizio.</p>` : ""}
        ${steps.length ? `<p class="rc-small">Ancora oggi: ${esc(steps.map((x) => x.title.toLowerCase()).join(", "))}.</p>` : `<p class="rc-small">Programma di oggi completato.</p>`}
        <div class="rc-actions"><button type="button" class="primary-action" data-r="summary-close">Torna a Oggi</button></div>
      </article>`;
  }

  /* ------------------------------------------------------------ FASI */
  function phasesView(l) {
    if (!E.configured(l)) return needSetup();
    const pi = E.phaseInfo(l);
    const mark = (m) => (m === true ? "ok" : m === false ? "no" : "todo");
    return `
      <div class="rc-intro"><h2>Si avanza per criteri</h2><p>Ogni fase si apre quando i test della settimana superano tutti i suoi criteri, e mai prima delle date minime. Le soglie vengono dalle linee guida MOON e dallo studio di Grindem; i test di casa sono un'approssimazione di quelli del fisioterapista.</p></div>
      <div class="rc-phases">${pi.phases.map((p) => `
        <article class="rc-card rc-phase ${p.n === pi.phase ? "now" : p.n < pi.phase ? "past" : ""}">
          <div class="rc-phase-head"><span class="rc-phase-n">${p.n}</span><div><h3>${esc(p.name)}</h3><span class="rc-small">${p.n === pi.phase ? "La tua fase" : p.n < pi.phase ? "Superata" : "Più avanti"}</span></div></div>
          <p>${esc(p.goal)}</p>
          <p class="rc-small">${esc(p.focus)}</p>
          ${p.criteria.length ? `<h4>Per entrare</h4><ul class="rc-crit">${p.criteria.map((c) => `<li class="${mark(c.met)}"><span class="rc-mark" aria-hidden="true">${c.met === true ? "✓" : c.met === false ? "✗" : "?"}</span><span>${esc(c.text)}</span><em>${esc(c.value)}</em></li>`).join("")}</ul>` : `<p class="rc-small">Si parte da qui.</p>`}
          <div class="rc-difesa"><div><h4>In Difesa sì</h4><ul>${p.difesaYes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div><div><h4>In Difesa non ancora</h4><ul>${p.difesaNo.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
        </article>`).join("")}</div>
      ${gatesCard(l)}`;
  }

  /* ------------------------------------------------------------ TEST */
  function testView(l) {
    if (!E.configured(l)) return needSetup();
    const ph = E.phase(l);
    const side = sideLabel(l);
    const lastOf = (t) => {
      const x = E.latest(l, t.id);
      if (!x) return "";
      const v = x.value;
      const txt = t.perLeg ? `${v[0]} / ${v[1]} ${t.unit}${E.lsi(v) != null ? ` (${E.lsi(v)}%)` : ""}` : t.options ? t.options[v] : `${dec(v)} ${t.unit}`;
      return `<span class="rc-last">Ultima: ${esc(txt)} · ${esc(dateShort(x.t))}</span>`;
    };
    const input = (t) => {
      if (t.options) return `<div class="rc-options">${t.options.map((o, i) => `<label><input type="radio" name="t-${t.id}" value="${i}" /><span>${esc(o)}</span></label>`).join("")}</div>`;
      const field = (name, label) => `<label class="rc-num"><span>${label}</span><input type="number" inputmode="decimal" name="${name}" min="${t.min}" max="${t.max}" step="${t.step}" /><em>${esc(t.unit)}</em></label>`;
      return t.perLeg ? `<div class="rc-nums">${field(`t-${t.id}-0`, `Operata (${side})`)}${field(`t-${t.id}-1`, "Sana")}</div>` : `<div class="rc-nums">${field(`t-${t.id}`, "Risultato")}</div>`;
    };
    const list = D.TESTS.filter((t) => ph >= t.from);
    const later = D.TESTS.filter((t) => ph < t.from);
    const due = E.testDue(l);
    const msg = ui.testMsg;
    return `
      <div class="rc-intro"><h2>Test della settimana</h2><p>Una volta a settimana, a ginocchio riposato (non dopo la sessione per le gambe). Compila quello che riesci: i campi vuoti tengono il valore dell'ultima volta. La fase si aggiorna da sola.${due ? "" : " Questa settimana li hai già fatti: puoi rifarli se vuoi."}</p></div>
      ${msg ? `<div class="rc-card rc-test-msg ${msg.up ? "up" : ""}" role="status"><h3>${esc(msg.title)}</h3><p>${esc(msg.text)}</p></div>` : ""}
      <form id="rcTestForm" class="rc-tests" novalidate>
        ${list.map((t) => `
          <div class="rc-card rc-test" role="group" aria-labelledby="rcT-${t.id}">
            <div class="rc-test-head"><strong id="rcT-${t.id}">${esc(t.name)}</strong>${lastOf(t)}</div>
            <details><summary>Come si fa</summary><p>${esc(t.how)}</p></details>
            ${input(t)}
          </div>`).join("")}
        <div class="rc-actions rc-test-save"><button type="submit" class="primary-action">Salva i test</button><span class="rc-small">${later.length ? `Più avanti: ${esc(later.map((t) => t.name.toLowerCase()).join(", "))} (dalla fase 3).` : ""}</span></div>
      </form>
      ${historyTable(l)}`;
  }

  function historyTable(l) {
    const rows = l.tests.slice(-8).reverse();
    if (!rows.length) return "";
    const cell = (v) => (v == null ? "—" : v);
    return `
      <article class="rc-card">
        <h2>Gli ultimi test</h2>
        <div class="rc-table-wrap"><table class="rc-table">
          <thead><tr><th scope="col">Data</th><th scope="col">Talloni</th><th scope="col">Gamba tesa</th><th scope="col">Sedia</th><th scope="col">Polpacci</th><th scope="col">Ponte</th><th scope="col">Equilibrio</th></tr></thead>
          <tbody>${rows.map((t) => `<tr><th scope="row">${esc(dateShort(t.t))}</th><td>${t.heel == null ? "—" : `${dec(t.heel)} cm`}</td><td>${cell(t.slr)}</td><td>${E.lsi(t.sit) == null ? "—" : `${E.lsi(t.sit)}%`}</td><td>${E.lsi(t.calf) == null ? "—" : `${E.lsi(t.calf)}%`}</td><td>${E.lsi(t.bridge) == null ? "—" : `${E.lsi(t.bridge)}%`}</td><td>${E.lsi(t.balance) == null ? "—" : `${E.lsi(t.balance)}%`}</td></tr>`).join("")}</tbody>
        </table></div>
        <p class="rc-small">Le percentuali sono la gamba operata rispetto alla sana.</p>
      </article>`;
  }

  /* ------------------------------------------------------------ ESERCIZI */
  function usedIn(id) {
    const where = [];
    if (D.SESSIONS.ext.includes(id)) where.push("routine di estensione");
    [1, 2, 3, 4].forEach((n) => { if (D.SESSIONS.legs[n].includes(id)) where.push(`gambe, fase ${n}`); });
    if (D.SESSIONS.upperA.includes(id)) where.push("parte alta A");
    if (D.SESSIONS.upperB.includes(id)) where.push("parte alta B");
    [1, 2, 3, 4].forEach((n) => { if (D.SESSIONS.martial[n].includes(id)) where.push(`tecnica, fase ${n}`); });
    return where;
  }
  function libraryView(l) {
    const ph = E.configured(l) ? E.phase(l) : 1;
    const chips = [["all", "Tutti"]].concat(D.AREAS.map((a) => [a.id, a.label]));
    const list = D.EXERCISES.filter((e) => ui.filter === "all" || e.area === ui.filter);
    return `
      <div class="rc-intro"><h2>Gli esercizi</h2><p>Tutti gli esercizi del piano con i loro livelli. Nella sessione il livello si sceglie da solo (due «facile» di fila lo alzano, il dolore lo abbassa), ma puoi cambiarlo tu.</p></div>
      <div class="rc-filter" role="group" aria-label="Filtra per zona">${chips.map(([id, label]) => `<button type="button" data-r="filter" data-v="${id}" aria-pressed="${ui.filter === id}">${esc(label)}</button>`).join("")}</div>
      <div class="rc-lib">${list.map((e) => {
        const lv = E.levelOf(l, e.id, ph);
        return `
        <details class="rc-card rc-lib-item">
          <summary><span class="rc-area a-${e.area}">${esc(AREA[e.area])}</span><strong>${esc(e.name)}</strong><span class="rc-small">${esc(usedIn(e.id).join(" · ") || "fuori dalle sessioni")}</span></summary>
          <p class="rc-goal">${esc(e.goal)}</p>
          <p>${esc(e.how)}</p>
          <h4>Come si fa</h4><ol class="rc-list">${e.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          <h4>Punti chiave</h4><ul class="rc-list">${e.cues.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
          <h4>Errori tipici</h4><ul class="rc-list">${e.errors.map((x) => `<li><strong>${esc(x.e)}</strong>: ${esc(x.fix)}</li>`).join("")}</ul>
          ${e.safety ? `<p class="rc-safety"><strong>Sicurezza</strong>${esc(e.safety)}</p>` : ""}
          <h4>Livelli</h4>
          <ol class="rc-levels">${e.levels.map((L, i) => `<li class="${i === lv && E.configured(l) ? "now" : ""}"><strong>${esc(L.name)}</strong> ${esc(L.text)} <span class="rc-small">${esc(E.doseText({ ...e.dose, ...(L.dose || {}) }))}${L.phase ? ` · dalla fase ${L.phase}` : ""}${L.minMonths ? ` · dal ${L.minMonths}° mese` : ""}</span></li>`).join("")}</ol>
          <p class="rc-martial"><strong>Per le arti marziali</strong>${esc(e.martial)}</p>
        </details>`;
      }).join("")}</div>`;
  }

  /* ------------------------------------------------------------ PERCHÉ */
  function whyView(l) {
    const g = l.setup ? D.GRAFTS.find((x) => x.id === l.setup.graft) : null;
    return `
      <div class="rc-intro"><h2>Perché il piano è fatto così</h2><p>Ogni scelta viene da uno studio o da una linea guida. Le fonti sono in fondo a ogni scheda.</p></div>
      ${l.setup ? `<article class="rc-card rc-mine">
        <div class="rc-card-head"><h2>Il tuo intervento</h2><button type="button" class="ghost-action small" data-r="setup-edit">Modifica</button></div>
        <p>Gamba ${esc(sideLabel(l))}, intervento del ${esc(dateLong(E.surgeryTime(l)))} (${esc(monthsText(l))}). Innesto: ${esc(g ? g.label.toLowerCase() : "non indicato")}.</p>
        ${g ? `<p class="rc-small">${esc(g.tip)}</p>` : ""}
      </article>` : ""}
      <div class="rc-lessons">${D.LESSONS.map((x) => `
        <article class="rc-card rc-lesson">
          <h3>${esc(x.title)}</h3>
          <p class="rc-lead">${esc(x.lead)}</p>
          ${x.body.map((p) => `<p>${esc(p)}</p>`).join("")}
          <ul class="rc-sources">${x.sources.map((s) => `<li><a href="${esc(D.SOURCES[s].url)}" target="_blank" rel="noopener noreferrer">${esc(D.SOURCES[s].label)}<span class="rc-sr"> (si apre in una nuova scheda)</span></a></li>`).join("")}</ul>
        </article>`).join("")}</div>
      ${DISCLAIMER}`;
  }

  /* ------------------------------------------------------------ PROGRESSI */
  function extChart(l) {
    const pts = l.tests.filter((t) => t.heel !== undefined).slice(-12);
    if (pts.length < 2) return `<p class="rc-small">Il grafico dell'estensione compare dal secondo test.</p>`;
    const W = 520, H = 180, P = 34;
    const maxV = Math.max(2, ...pts.map((p) => p.heel));
    const t0 = pts[0].t, t1 = pts[pts.length - 1].t;
    const x = (t) => P + ((t - t0) / Math.max(1, t1 - t0)) * (W - P * 2);
    const y = (v) => H - P + 8 - (v / maxV) * (H - P * 1.6);
    const line = pts.map((p) => `${x(p.t).toFixed(1)},${y(p.heel).toFixed(1)}`).join(" ");
    const ticks = [0, Math.round(maxV / 2), Math.ceil(maxV)];
    return `<svg class="rc-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Differenza dei talloni nel tempo: ${pts.map((p) => `${dateShort(p.t)} ${dec(p.heel)} centimetri`).join(", ")}">
      ${ticks.map((v) => `<line class="rc-grid-line" x1="${P}" x2="${W - P}" y1="${y(v)}" y2="${y(v)}"/><text class="rc-axis" x="${P - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`).join("")}
      <text class="rc-axis goal" x="${W - P}" y="${y(0) - 6}" text-anchor="end">obiettivo 0 cm</text>
      <polyline class="rc-line" points="${line}"/>
      ${pts.map((p) => `<circle class="rc-pt" cx="${x(p.t)}" cy="${y(p.heel)}" r="4"/>`).join("")}
      <text class="rc-axis" x="${P}" y="${H - 6}">${esc(dateShort(t0))}</text><text class="rc-axis" x="${W - P}" y="${H - 6}" text-anchor="end">${esc(dateShort(t1))}</text>
    </svg>`;
  }
  function lsiBars(l) {
    const rows = D.TESTS.filter((t) => t.perLeg).map((t) => ({ t, v: E.latestLsi(l, t.id) })).filter((r) => r.v != null);
    if (!rows.length) return `<p class="rc-small">Le barre compaiono dopo il primo test con le due gambe.</p>`;
    return `<ul class="rc-lsi">${rows.map((r) => `<li><span>${esc(r.t.name)}</span><div class="rc-lsi-bar"><i style="--w:${Math.min(110, r.v) / 1.1}%"></i><b class="m80" title="80%"></b><b class="m90" title="90%"></b></div><strong>${r.v}%</strong></li>`).join("")}</ul>
      <p class="rc-small">Le tacche segnano l'80% (corsa e salti) e il 90% (ritorno al contatto).</p>`;
  }
  function progressView(l) {
    if (!E.configured(l)) return needSetup();
    const now = Date.now();
    const weeks = [3, 2, 1, 0].map((w) => {
      const to = now - w * 7 * 86400000, from = to - 7 * 86400000;
      const s = l.sessions.filter((x) => x.t > from && x.t <= to && x.kind !== "ext" && x.kind !== "martial").length;
      const ex = new Set(l.ext.filter((t) => t > from && t <= to).map(E.dayKey)).size;
      return { label: w === 0 ? "Questa settimana" : w === 1 ? "Settimana scorsa" : `${w} settimane fa`, s, ex };
    });
    const recent = [...l.sessions].reverse().slice(0, 8);
    return `
      <div class="rc-grid">
        <div class="rc-col"><article class="rc-card"><h2>Profilo del recupero</h2>${hexProfile(l)}</article></div>
        <div class="rc-col">
          <article class="rc-card"><h2>Estensione</h2><p class="rc-small">Differenza dei talloni a pancia in giù: più bassa è meglio.</p>${extChart(l)}</article>
          <article class="rc-card"><h2>Simmetria delle gambe</h2>${lsiBars(l)}</article>
          <article class="rc-card"><h2>Costanza</h2>
            <ul class="rc-weeks">${weeks.map((w) => `<li><span>${esc(w.label)}</span><strong>${plural(w.s, "sessione", "sessioni")}</strong><em>estensione in ${plural(w.ex, "giorno", "giorni")}</em></li>`).join("")}</ul>
            <p class="rc-small">${E.streak(l) ? `${plural(E.streak(l), "giorno", "giorni")} di fila con almeno una routine o una sessione.` : "Inizia oggi la serie."}</p>
          </article>
        </div>
      </div>
      ${recent.length ? `<article class="rc-card"><h2>Ultime sessioni</h2><ul class="rc-history">${recent.map((s) => `<li><span>${esc(dateShort(s.t))}</span><strong>${esc(D.SESSION_INFO[s.kind].label)}</strong><em>${s.done}/${s.total} · fase ${s.phase}${s.light ? " · leggera" : ""}${s.knee === 2 ? " · dolore" : s.knee === 1 ? " · fastidio" : ""}</em></li>`).join("")}</ul></article>` : ""}`;
  }

  function needSetup() {
    return `<article class="rc-card"><h2>Prima imposta il piano</h2><p>Servono la data dell'intervento e due risposte veloci.</p><div class="rc-actions"><button type="button" class="primary-action" data-r="tab" data-tab="today">Imposta</button></div></article>`;
  }

  /* ------------------------------------------------------------ render */
  function render(focus) {
    const panel = $("rcPanel");
    const page = $("recovery");
    if (!panel || !page) return;
    const l = lab();
    const running = !!l.current;
    page.classList.toggle("rc-running", running || !!ui.summary);
    document.querySelectorAll("#recovery [data-rc-tab]").forEach((b) => b.setAttribute("aria-pressed", String(!running && !ui.summary && b.dataset.rcTab === ui.tab)));
    if (!running) stopTimer();
    let html;
    if (ui.summary) html = summaryView(l);
    else if (running) html = sessionView(l);
    else if (ui.tab === "phases") html = phasesView(l);
    else if (ui.tab === "test") html = testView(l);
    else if (ui.tab === "library") html = libraryView(l);
    else if (ui.tab === "why") html = whyView(l);
    else if (ui.tab === "progress") html = progressView(l);
    else html = todayView(l);
    panel.innerHTML = html;
    if (running && !ui.finishing) {
      const x = sessionItems(l)[ui.ex];
      ensureTimer(x.id, x.lv, x.dose);
      paintTimer();
    }
    renderChip();
    if (focus) {
      const target = panel.querySelector("[data-focus-title]") || panel.querySelector("h2");
      if (target) { if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
      const top = page.getBoundingClientRect().top + window.scrollY - 8;
      if (page.getBoundingClientRect().top < 0 || focus === "top") window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    }
  }
  function setTab(tab) {
    ui.tab = tab;
    ui.testMsg = null;
    ui.setupEdit = false;
    render(true);
  }

  /* ------------------------------------------------------------ azioni */
  function onClick(event) {
    const el = event.target.closest("[data-r]");
    if (!el || el.disabled) return;
    const l = lab();
    const act = el.dataset.r;
    switch (act) {
      case "tab": setTab(el.dataset.tab); break;
      case "ck": {
        const f = el.dataset.f;
        const v = el.dataset.v === "true" ? true : el.dataset.v === "false" ? false : Number(el.dataset.v);
        ui.check = { ...(ui.check || {}), [f]: v };
        render(false);
        const again = document.querySelector(`#rcPanel [data-r="ck"][data-f="${f}"][data-v="${el.dataset.v}"]`);
        if (again) again.focus({ preventScroll: true });
        break;
      }
      case "ck-save": {
        E.checkIn(l, ui.check || {});
        ui.check = null;
        ui.checkEdit = false;
        save();
        render(false);
        const r = E.readiness(l);
        announce(r ? `Controllo salvato: ${r.level}` : "Controllo salvato");
        break;
      }
      case "ck-edit": ui.checkEdit = true; ui.check = null; render(false); break;
      case "ck-cancel": ui.checkEdit = false; ui.check = null; render(false); break;
      case "setup-edit": ui.setupEdit = true; ui.tab = "today"; ui.setupErr = ""; render(true); break;
      case "setup-cancel": ui.setupEdit = false; ui.setupErr = ""; render(true); break;
      case "start": {
        const s = E.startSession(l, el.dataset.kind);
        if (!s) { announce("Oggi questa sessione non è disponibile"); break; }
        ui.exFor = null;
        ui.finishing = false;
        save();
        render("top");
        break;
      }
      case "goto": stopTimer(); ui.ex = Number(el.dataset.i) || 0; render(true); break;
      case "lv": {
        const c = l.current;
        const x = sessionItems(l)[ui.ex];
        E.setLevel(l, x.id, x.lv + Number(el.dataset.d), c.phase);
        stopTimer();
        save();
        render(false);
        break;
      }
      case "rate": {
        const c = l.current;
        const items = sessionItems(l);
        const x = items[ui.ex];
        E.rate(l, x.id, c.results[x.id] === el.dataset.v ? null : el.dataset.v);
        save();
        if (c.results[x.id] && c.results[x.id] !== "pain") {
          const next = items.findIndex((y, i) => i > ui.ex && c.results[y.id] === undefined);
          const any = next >= 0 ? next : items.findIndex((y) => c.results[y.id] === undefined);
          if (any >= 0) { stopTimer(); ui.ex = any; render(true); break; }
          ui.finishing = true;
          stopTimer();
          render(true);
          break;
        }
        render(false);
        break;
      }
      case "finish": stopTimer(); ui.finishing = true; render(true); break;
      case "finish-back": ui.finishing = false; render(true); break;
      case "done": {
        const res = E.finishSession(l, { knee: Number(el.dataset.knee) });
        ui.finishing = false;
        ui.summary = res ? { res } : null;
        save();
        render("top");
        announce("Sessione salvata");
        break;
      }
      case "summary-close": ui.summary = null; ui.tab = "today"; render("top"); break;
      case "cancel": E.cancelSession(l); ui.finishing = false; stopTimer(); save(); render("top"); break;
      case "sound": l.prefs.sound = !l.prefs.sound; save(); render(false); break;
      case "t-start": timerStart(); break;
      case "t-pause": timerPause(); break;
      case "t-skip": if (ui.timer) { ui.timer.left = 0; nextPhase(false); } break;
      case "t-done": nextPhase(true); break;
      case "t-reset": { const t = ui.timer; if (t) { clearInterval(t.tick); if (window.DefenseAwake) DefenseAwake.release(); ui.timer = null; } const x = sessionItems(l)[ui.ex]; ensureTimer(x.id, x.lv, x.dose); paintTimer(); break; }
      case "filter": ui.filter = el.dataset.v; render(false); break;
      default: break;
    }
  }

  function onInput(event) {
    const t = event.target;
    if (t.dataset.r === "pain") {
      ui.check = { ...(ui.check || {}), pain: Number(t.value) };
      const out = $("rcPainOut");
      if (out) out.textContent = `${t.value} su 10`;
    }
  }

  function onSubmit(event) {
    const form = event.target;
    const l = lab();
    if (form.id === "rcSetup") {
      event.preventDefault();
      const fd = new FormData(form);
      const res = E.setSetup(l, { surgery: fd.get("surgery"), side: fd.get("side"), graft: fd.get("graft"), flex: Number(fd.get("flex")), resetLevels: fd.get("resetLevels") === "on" });
      if (!res.ok) { ui.setupErr = res.error; render(false); return; }
      ui.setupErr = "";
      ui.setupEdit = false;
      save();
      render(true);
      announce("Piano impostato");
    }
    if (form.id === "rcTestForm") {
      event.preventDefault();
      const fd = new FormData(form);
      const data = {};
      const numOf = (name) => { const v = String(fd.get(name) ?? "").replace(",", ".").trim(); return v === "" ? null : Number(v); };
      D.TESTS.forEach((t) => {
        if (t.options) { const v = fd.get(`t-${t.id}`); if (v !== null) data[t.id] = Number(v); return; }
        if (t.perLeg) { const a = numOf(`t-${t.id}-0`); const b = numOf(`t-${t.id}-1`); if (a != null && b != null && Number.isFinite(a) && Number.isFinite(b)) data[t.id] = [a, b]; return; }
        const v = numOf(`t-${t.id}`);
        if (v != null && Number.isFinite(v)) data[t.id] = v;
      });
      const res = E.recordTest(l, data);
      if (!res.ok) { ui.testMsg = { title: "Niente da salvare", text: res.error }; render(false); return; }
      const pi = E.phaseInfo(l);
      ui.testMsg = res.after > res.before
        ? { up: true, title: `Fase ${res.after}: ${D.PHASES[res.after - 1].name}`, text: `Hai superato tutti i criteri. ${D.PHASES[res.after - 1].focus}` }
        : res.after < res.before
          ? { title: `Di nuovo fase ${res.after}`, text: "Un criterio non è più rispettato: si torna un passo indietro finché il test non torna buono." }
          : { title: `Test salvati · fase ${res.after}`, text: pi.next ? `Per la fase ${pi.next.n} manca: ${pi.missing.map((c) => c.text.charAt(0).toLowerCase() + c.text.slice(1)).join("; ")}.` : "Sei all'ultima fase." };
      save();
      render("top");
      announce(ui.testMsg.title);
    }
  }

  window.RecoveryUI = { render, setTab, debug: ui };
  window.recoveryTrend = () => E.trend(lab());

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("recovery");
    if (page) {
      page.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-rc-tab]");
        if (tab) { if (lab().current || ui.summary) return; setTab(tab.dataset.rcTab); return; }
        if (event.target.closest("#rcChip")) { if (!lab().current) setTab("today"); return; }
        onClick(event);
      });
      page.addEventListener("input", onInput);
      page.addEventListener("submit", onSubmit);
      render(false);
    }
    renderCard();
  });
})();
