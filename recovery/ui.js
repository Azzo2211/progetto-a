/*
 * Progetto A - Difesa › Recupero: la scheda del recupero del ginocchio dentro la pagina Difesa.
 * Viste: Oggi (controllo del ginocchio, allenamento del giorno, programma), Fasi, Test, Esercizi,
 * Perché, Progressi. L'allenamento ha la stessa forma di quelli delle arti marziali: elenco a
 * sinistra, scheda dell'esercizio con il timer, l'omino che mostra ogni passo, errori tipici.
 * Motore: window.RecoveryEngine (dati in RecoveryData, dimostrazioni in RecoveryDemos).
 * Stato: state.recoveryLab. Globali di app.js: state, saveState, renderDashboard, buildRadarMarkup.
 * Il timer conta sull'ora vera e tiene lo schermo acceso con DefenseAwake (defense/keepawake.js).
 */
(function () {
  "use strict";

  const E = window.RecoveryEngine;
  const D = window.RecoveryData;
  const DM = window.RecoveryDemos || {};
  if (!E || !D) return;

  const C = "#7fd18b"; // il colore del recupero
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ui = {
    view: "today",     // today | phases | test | library | why | progress
    pick: null,        // allenamento scelto oggi (altrimenti quello consigliato)
    ex: 0,
    exFor: null,
    finishing: false,
    summary: null,
    check: null,
    checkEdit: false,
    setupEdit: false,
    setupErr: "",
    filter: "all",
    goal: null,        // filtro della libreria per qualità marziale
    open: null,        // esercizio aperto nella libreria
    testMsg: null,
    timer: null,
    player: null,
    playerId: null,
    playerState: null
  };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const dateShort = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const dateLong = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const dayLabel = (t) => new Date(t).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  const dec = (v) => String(v).replace(".", ",");
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const pad = (n) => String(n).padStart(2, "0");
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
  const KINDS = ["ext", "kick", "legs", "upperA", "upperB", "martial"];
  const STRETCH = ["ext", "kick"];
  const GOAL = Object.fromEntries(D.MA_GOALS.map((g) => [g.id, g]));

  // Le arti marziali per cui il recupero lavora: scelte qui, altrimenti quelle allenate nella Difesa nelle ultime 6 settimane.
  function myStyles(l) {
    if (l.prefs.styles.length) return { ids: l.prefs.styles, auto: false };
    const ml = typeof state !== "undefined" && state ? state.martialLab : null;
    const count = {};
    if (ml && Array.isArray(ml.sessions)) ml.sessions.forEach((x) => { if (x && D.STYLE_NEEDS[x.disc] && Date.now() - x.t < 42 * 86400000) count[x.disc] = (count[x.disc] || 0) + 1; });
    const ids = Object.keys(count).sort((a, b) => count[b] - count[a]).slice(0, 3);
    return { ids, auto: true };
  }
  // le qualità che contano per almeno uno degli stili (ognuno con le sue prime tre)
  const topUnion = (ids) => [...new Set(ids.flatMap((id) => E.topGoals([id], 3).map((g) => g.id)))];
  const lower = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const styleNames = (ids) => ids.map((id) => D.STYLE_NEEDS[id].name);
  const listIt = (xs) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);
  // chip delle qualità marziali di un esercizio: in evidenza quelle che contano per i tuoi stili
  function goalChips(e, top) {
    const list = Object.entries(e.builds || {}).sort((a, b) => b[1] - a[1]);
    return `<ul class="rc-goals" aria-label="Cosa allena per le arti marziali">${list.map(([g, w]) => `<li class="${top.includes(g) ? "mine" : ""}" title="${esc(GOAL[g].text)}">${esc(GOAL[g].label)}<span class="rc-dots" aria-label="${w} su 3">${"●".repeat(w)}${"○".repeat(3 - w)}</span></li>`).join("")}</ul>`;
  }
  function maBlock(l, e) {
    const st = myStyles(l);
    const lines = st.ids.map((id) => ({ id, goals: E.forStyles(e.id, [id]) })).filter((x) => x.goals.length);
    return `<div class="rc-ma">
      <span class="rc-ma-title">Per le arti marziali</span>
      ${goalChips(e, topUnion(st.ids))}
      ${lines.length ? `<p class="rc-ma-mine">${lines.map((x) => `Per ${esc(D.STYLE_NEEDS[x.id].mine)}: ${esc(listIt(x.goals.map((g) => lower(g.label))))}.`).join(" ")}</p>` : ""}
    </div>`;
  }

  function lab() {
    state.recoveryLab = E.ensure(state.recoveryLab);
    return state.recoveryLab;
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
  const sideLabel = (l) => (l.setup ? (l.setup.side === "sinistra" ? "sinistra" : "destra") : "");
  function monthsText(l) {
    const m = E.monthsSince(l);
    const whole = Math.floor(m);
    const weeks = Math.floor(((m - whole) * 30.44) / 7);
    return `${whole === 1 ? "1 mese" : `${whole} mesi`}${weeks ? ` e ${plural(weeks, "settimana", "settimane")}` : ""} dall'intervento`;
  }
  function doseText(d) {
    if (!d) return "";
    const side = d.perSide ? " per lato" : "";
    const time = (s) => (s >= 60 && s % 60 === 0 ? `${s / 60} min` : s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)} min` : `${s} s`);
    const main = d.work != null ? (d.sets > 1 ? `${d.sets} × ${time(d.work)}${side}` : `${time(d.work)}${side}`) : d.sets > 1 ? `${d.sets} × ${d.reps}${side}` : `${d.reps}${side}`;
    return d.rest && d.sets > 1 ? `${main} · recupero ${time(d.rest)}` : main;
  }
  const kindTag = (e) => `<span class="ma-kind k-r-${e.area}">${esc(AREA[e.area])}</span>`;

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

  /* ------------------------------------------------------------ l'omino */
  const demoCache = new Map();
  // vista di partenza dell'omino: i movimenti di lato si capiscono meglio da davanti
  const DEMO_VIEW = { "slancio-laterale": "front" };
  function demoOf(e) {
    if (demoCache.has(e.id)) return demoCache.get(e.id);
    let out = null;
    const F = window.MartialFigure;
    const MM = window.MartialMoves;
    const spec = DM[e.id];
    if (F && MM && Array.isArray(spec) && spec.length === e.steps.length) {
      try {
        const demo = MM.demoFor(spec);
        demo.steps.forEach((st) => { st.label = String(st.label).replace(/([A-Za-zÀ-ÿ])'([A-Za-zÀ-ÿ0-9])/g, "$1’$2"); });
        if (demo.steps.length === e.steps.length) {
          const seq = demo.steps.map((st) => {
            const still = st.frames.every((f) => !f.act || !f.act.length) && MM.keyFrames(st.frames, 2).length <= 1;
            const keys = still ? [] : MM.keyFrames(st.frames, 6);
            const view = DEMO_VIEW[e.id] || "tq";
            const box = F.demoBox({ steps: [st], props: demo.props }, view);
            const items = keys.map((k) => {
              const f = st.frames[k];
              const one = f.mv ? MM.get(f.mv) : null;
              return { k, label: one ? one.label : st.label, html: F.svg(f.pose, { view, box, prev: k ? st.frames[k - 1].pose : null, act: f.act, props: demo.props, partner: f.partner }) };
            });
            const sig = MM.sig || ((f) => JSON.stringify([f.pose, f.partner || 0]));
            const keySig = items.map((it) => sig(st.frames[it.k]));
            const toKey = st.frames.map((f, j) => {
              const same = keySig.indexOf(sig(f));
              if (same >= 0) return same;
              let before = 0;
              items.forEach((it, n) => { if (it.k <= j) before = n; });
              return before;
            });
            return { items, toKey };
          });
          out = { demo, seq };
        }
      } catch (err) { out = null; }
    }
    demoCache.set(e.id, out);
    while (demoCache.size > 10) demoCache.delete(demoCache.keys().next().value);
    return out;
  }
  function seqMarkup(dm, i) {
    const s = dm.seq[i];
    if (!s || !s.items.length) return "";
    return `<div class="ma-seq" role="group" aria-label="Immagini del passo ${i + 1}">
      <button type="button" class="ma-seq-play" data-r="demo-step" data-step="${i}" aria-label="Guarda solo il passo ${i + 1} nel video" title="Guarda solo questo passo"><span class="ma-tri" aria-hidden="true"></span></button>
      ${s.items.map((it, n) => `<button type="button" class="ma-seq-img" data-r="demo-frame" data-step="${i}" data-frame="${it.k}" data-key="${n}" aria-label="Passo ${i + 1}, immagine ${n + 1} di ${s.items.length}: ${esc(it.label)}" title="${esc(it.label)}">${it.html}</button>`).join("")}
    </div>`;
  }
  function howMarkup(e) {
    const dm = demoOf(e);
    if (!dm) return `<ol class="def-steps">${e.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>`;
    return `<div class="ma-howgrid">
      <div class="ma-demo" data-demo="${esc(e.id)}"></div>
      <ol class="def-steps has-seq">${e.steps.map((x, i) => `<li data-step="${i}"><div class="ma-step"><span class="ma-step-text">${esc(x)}</span>${seqMarkup(dm, i)}</div></li>`).join("")}</ol>
    </div>`;
  }
  function mountDemo(box) {
    const host = box.querySelector(".ma-demo[data-demo]");
    if (!host || !window.MartialFigure) return;
    const id = host.dataset.demo;
    const dm = demoCache.get(id);
    if (!dm) return;
    const keep = ui.playerState && ui.playerState.id === id ? ui.playerState.state : null;
    const list = host.parentElement.querySelector(".def-steps.has-seq");
    let curStep = -1;
    ui.playerId = id;
    ui.player = window.MartialFigure.player(host, dm.demo, {
      view: DEMO_VIEW[id] || "tq",
      reduced,
      state: keep,
      onStep(si) {
        curStep = si;
        if (list) list.querySelectorAll("li[data-step]").forEach((li) => li.classList.toggle("is-playing", Number(li.dataset.step) === si));
      },
      onFrame(si, k) {
        if (!list) return;
        const key = dm.seq[si] ? dm.seq[si].toKey[k] : -1;
        list.querySelectorAll(".ma-seq-img[aria-current]").forEach((b) => b.removeAttribute("aria-current"));
        const b = list.querySelector(`.ma-seq-img[data-step="${si}"][data-key="${key}"]`);
        if (b && si === curStep) b.setAttribute("aria-current", "true");
      }
    });
  }
  function dropDemo() {
    if (!ui.player) return;
    ui.playerState = { id: ui.playerId, state: ui.player.state() };
    ui.player.destroy();
    ui.player = null;
  }
  function showDemo() {
    const stage = $("defPanel-recovery").querySelector(".ma-demo .mf-stage");
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    if (r.bottom < 40 || r.top > window.innerHeight - 40) stage.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
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
      <article class="ma-today rc-setup" style="--ma-c:${C}">
        <div class="ma-today-main">
          <span class="def-kicker">${first ? "Prima di partire · due minuti" : "I dati dell'intervento"}</span>
          <h2 data-focus-title>${first ? "Recupero del ginocchio" : "Modifica i dati"}</h2>
          <p class="ma-tagline">${first ? "Servono per calcolare le date, scegliere da dove partire e darti i consigli giusti per il tuo innesto. Poi il piano si aggiusta da solo con i test di ogni settimana." : "Se cambi «quanto riesci a piegare» puoi far ripartire da lì i livelli di sedia, seduta al muro e affondo."}</p>
          <form id="rcSetup" class="rc-form" novalidate>
            <label class="rc-field"><span>Data dell'intervento</span><input type="date" name="surgery" value="${esc(s.surgery || def)}" max="${today}" required /><small>${s.surgery ? "" : "Ho messo 4 mesi fa: correggi con la data esatta."}</small></label>
            <fieldset class="rc-field"><legend>Gamba operata</legend><div class="rc-seg">${["destra", "sinistra"].map((v) => `<label><input type="radio" name="side" value="${v}" ${(s.side || "destra") === v ? "checked" : ""} /><span>${v[0].toUpperCase() + v.slice(1)}</span></label>`).join("")}</div></fieldset>
            <label class="rc-field"><span>Da dove è stato preso il nuovo legamento</span><select name="graft">${D.GRAFTS.map((g) => `<option value="${g.id}" ${(s.graft || "nonso") === g.id ? "selected" : ""}>${esc(g.label)}</option>`).join("")}</select></label>
            <fieldset class="rc-field"><legend>Oggi, con il peso sopra, quanto riesci a piegare il ginocchio?</legend><div class="rc-options">${D.FLEX.map((f) => `<label><input type="radio" name="flex" value="${f.id}" ${(s.flex ?? 0) === f.id ? "checked" : ""} /><span>${esc(f.label)}</span></label>`).join("")}</div></fieldset>
            ${first ? "" : `<label class="rc-check-line"><input type="checkbox" name="resetLevels" /><span>Fai ripartire sedia, seduta al muro e affondo da questa risposta</span></label>`}
            ${ui.setupErr ? `<p class="rc-error" role="alert">${esc(ui.setupErr)}</p>` : ""}
            <div class="def-row"><button type="submit" class="def-primary">${first ? "Inizia il piano" : "Salva"}</button>${first ? "" : `<button type="button" class="def-ghost" data-r="setup-cancel">Annulla</button>`}</div>
          </form>
        </div>
        <div class="ma-today-side rc-setup-side">
          <p class="def-note">Il piano non sostituisce il fisioterapista: è il lavoro di tutti i giorni tra un controllo e l'altro, sulle linee guida MOON e sugli studi più citati (le fonti sono in «Perché»).</p>
        </div>
      </article>`;
  }

  function checkBox(chk) {
    const d = ui.check || (chk ? { swelling: chk.swelling, pain: chk.pain, trend: chk.trend, gaveWay: chk.gaveWay } : { swelling: null, pain: 0, trend: null, gaveWay: false });
    ui.check = d;
    const seg = (field, opts) => `<div class="rc-seg" role="group">${opts.map(([v, label]) => `<button type="button" data-r="ck" data-f="${field}" data-v="${v}" aria-pressed="${d[field] === v}">${label}</button>`).join("")}</div>`;
    const ready = d.swelling !== null && d.trend !== null;
    return `
      <div class="rc-check" role="group" aria-labelledby="rcCheckT">
        <p id="rcCheckT"><strong>Com'è il ginocchio stamattina?</strong> Trenta secondi: decide se oggi l'allenamento è normale, leggero o senza gambe.</p>
        <div class="rc-q"><span>Gonfiore</span>${seg("swelling", [[0, "Nessuno"], [1, "Poco"], [2, "Evidente"]])}</div>
        <div class="rc-q"><span>Rispetto a ieri</span>${seg("trend", [[-1, "Meglio"], [0, "Uguale"], [1, "Peggio"]])}</div>
        <div class="rc-q"><label for="rcPain">Dolore a riposo <output id="rcPainOut">${d.pain} su 10</output></label><input id="rcPain" type="range" min="0" max="10" step="1" value="${d.pain}" data-r="pain" /></div>
        <div class="rc-q"><span>Da ieri il ginocchio ha ceduto?</span>${seg("gaveWay", [[false, "No"], [true, "Sì"]])}</div>
        <div class="def-row"><button type="button" class="def-primary" data-r="ck-save" ${ready ? "" : "disabled"}>Salva il controllo</button>${chk ? `<button type="button" class="def-ghost" data-r="ck-cancel">Annulla</button>` : ""}${ready ? "" : `<span class="def-note">Rispondi a gonfiore e «rispetto a ieri».</span>`}</div>
      </div>`;
  }

  function readyLine(r) {
    const title = { verde: "Ginocchio verde: allenamento normale", giallo: "Ginocchio giallo: versione leggera", rosso: "Ginocchio rosso: oggi niente gambe" }[r.level];
    return `<div class="rc-ready ${r.level}"><span class="rc-light" aria-hidden="true"></span><div><strong>${title}</strong><p>${esc(r.advice)}${r.reasons.length ? ` <em>(${esc(r.reasons.join(", "))})</em>` : ""}</p></div><button type="button" class="def-ghost rc-small-btn" data-r="ck-edit">Modifica</button></div>`;
  }

  function ring(pct, size = 96) {
    const r = size / 2 - 5;
    const c = 2 * Math.PI * r;
    return `<svg class="ma-ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ma-ring-bg"></circle>
      ${pct > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ma-ring-fg" style="stroke:${C};stroke-dasharray:${((pct / 100) * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"></circle>` : ""}
      <text x="50%" y="54%" text-anchor="middle" class="ma-ring-text">${pct}%</text>
    </svg>`;
  }

  function preview(items) {
    return `<ol class="ma-preview">${items.map((x) => `<li>${kindTag(x.e)}<strong>${esc(x.e.name)}</strong><em>${esc(doseText(x.dose))}</em></li>`).join("")}</ol>`;
  }
  const withEx = (s) => s.items.map((x) => ({ ...x, e: E.EX.get(x.id) }));

  function todayView(l) {
    if (!E.configured(l) || ui.setupEdit) return `${alertsHtml(l)}${setupCard(l, !E.configured(l))}`;
    const now = Date.now();
    const chk = E.todayCheck(l);
    const r = E.readiness(l);
    const red = r && r.level === "rosso";
    const pi = E.phaseInfo(l);
    const ph = D.PHASES[pi.phase - 1];
    const sug = E.suggest(l);
    const sugKind = sug.kind === "rest" ? "ext" : sug.kind;
    let kind = ui.pick && KINDS.includes(ui.pick) ? ui.pick : sugKind;
    if (red && kind === "legs") kind = "upperA";
    const sess = E.buildSession(l, kind);
    const items = withEx(sess);
    const info = D.SESSION_INFO[kind];
    const steps = E.plan(l);
    const doneToday = l.sessions.filter((s) => E.dayKey(s.t) === E.dayKey(now));
    const doneKind = doneToday.filter((s) => s.kind === kind);
    const next = pi.next;
    const met = next ? next.criteria.filter((c) => c.met === true).length : 1;
    const pct = next ? Math.round((met / next.criteria.length) * 100) : 100;
    const minutes = Math.max(5, Math.round(items.reduce((s, x) => {
      const d = x.dose;
      const per = d.work != null ? d.work : 40;
      return s + (d.sets || 1) * (per * (d.perSide ? 2 : 1) + (d.rest || 0));
    }, 0) / 60));
    const picker = `<div class="ma-sesspick rc-pick" role="group" aria-label="Allenamento di oggi">${KINDS.map((k) => {
      const off = red && k === "legs";
      const tag = k === sugKind ? (sug.done ? "fatto oggi" : "consigliato") : off ? "non oggi" : `${D.SESSION_INFO[k].minutes} min`;
      return `<button type="button" data-r="pick" data-kind="${k}" aria-pressed="${k === kind}" ${off ? "disabled" : ""}><strong>${esc(D.SESSION_INFO[k].short)}</strong><span>${tag}</span></button>`;
    }).join("")}</div>`;
    const why = kind === sugKind ? sug.reason : kind === "ext" ? "La routine di estensione: prono appeso, tallone su rialzo e arco corto." : kind === "kick" ? "Allungamenti a ginocchio dritto e slanci lenti: recuperi gli ultimi gradi di estensione e intanto alzi i calci. Meglio a muscoli caldi, dopo l'allenamento." : kind === "martial" ? "Solo il blocco di tecnica marziale della tua fase." : "Scelto da te: va bene, ma tieni le gambe ad almeno un giorno di distanza.";
    const st = myStyles(l);
    const top = topUnion(st.ids);
    const sg = E.sessionGoals(items).slice(0, 4);
    const maToday = sg.length ? `<div class="rc-ma rc-ma-today">
        <span class="rc-ma-title">Per le arti marziali, oggi alleni</span>
        <ul class="rc-goals">${sg.map((g) => `<li class="${top.includes(g.id) ? "mine" : ""}" title="${esc(g.text)}">${esc(g.label)}<span class="rc-dots" aria-label="${g.dots} su 3">${"●".repeat(g.dots)}${"○".repeat(3 - g.dots)}</span></li>`).join("")}</ul>
        <p class="rc-ma-mine">${st.ids.length ? st.ids.map((id) => `${esc(D.STYLE_NEEDS[id].name.split(" (")[0])}: contano di più ${esc(listIt(E.topGoals([id], 3).map((g) => lower(g.label))))}.`).join(" ") + (st.auto ? " (Stili presi dalla Difesa: li cambi in «Progressi».)" : "") : "Scegli le tue arti marziali in «Progressi»: le qualità che servono a loro vengono evidenziate."}</p>
      </div>` : "";
    return `
      ${alertsHtml(l)}
      <article class="ma-today rc-today" style="--ma-c:${C}">
        <div class="ma-today-main">
          <span class="def-kicker">Oggi · ${esc(dayLabel(now))}${doneToday.length ? " · fatto" : ""}</span>
          <h2 data-focus-title>${esc(info.label)} <span class="ma-lv">Fase ${pi.phase}: ${esc(ph.name)}</span></h2>
          <p class="ma-tagline">${esc(ph.goal)}</p>
          ${!chk || ui.checkEdit ? checkBox(chk) : readyLine(r)}
          ${picker}
          <h3 class="ma-lv-title">${esc(info.label)}${sess.light ? " · versione leggera" : ""}</h3>
          <p>${esc(why)}</p>
          ${items.length ? preview(items) : `<p class="def-note">Con il ginocchio rosso oggi niente gambe: scegli la parte alta, la tecnica o la routine di estensione.</p>`}
          ${maToday}
          <p class="ma-motto">«Ginocchio dritto, gambe forti, tecnica viva.»</p>
        </div>
        <div class="ma-today-side">
          ${ring(pct)}
          <span class="ma-copy-label">${next ? `criteri per la fase ${next.n}` : "ultima fase"}</span>
          <span class="ma-mins">circa ${minutes} minuti · ${plural(items.length, "esercizio", "esercizi")}</span>
          <span class="ma-mins">${esc(monthsText(l))}</span>
          ${doneKind.length ? `<p class="ma-done-note">Fatto oggi: ${doneKind[doneKind.length - 1].done}/${doneKind[doneKind.length - 1].total} esercizi.</p>` : ""}
          <button type="button" class="def-${doneKind.length ? "ghost" : "primary"}" data-r="start" data-kind="${kind}" ${items.length ? "" : "disabled"}>${doneKind.length ? "Allenati di nuovo" : STRETCH.includes(kind) ? "Inizia la routine" : "Inizia l'allenamento"}</button>
        </div>
      </article>
      ${planCard(l, steps)}
      ${missCard(pi)}
      ${gatesStrip(l)}
      <p class="def-disclaimer">Questo piano non sostituisce il fisioterapista né il chirurgo. Dolore acuto, ginocchio che cede, gonfiore che cresce o estensione che non migliora: fermati e fatti vedere.</p>`;
  }

  function planCard(l, steps) {
    const row = (s) => {
      let action = "";
      if (STRETCH.includes(s.kind) && !s.done) action = `<button type="button" class="def-ghost" data-r="start" data-kind="${s.kind}">Inizia</button>`;
      else if (s.id === "session" && !s.done && s.kind !== "rest") action = `<button type="button" class="def-ghost" data-r="start" data-kind="${s.kind}">Inizia</button>`;
      else if (s.id === "test") action = `<button type="button" class="def-ghost" data-r="view" data-view="test">Apri i test</button>`;
      return `<li class="${s.done ? "done" : ""}"><span class="ma-dot" aria-hidden="true">${s.done ? "✓" : ""}</span><span class="rc-step-copy"><strong>${esc(s.title)}</strong><em>${s.done ? "fatto" : `${s.minutes} min`}</em></span>${action}</li>`;
    };
    const done = steps.filter((s) => s.done).length;
    return `<div class="rc-plan"><h3 class="def-section-title">Il programma di oggi <span>${done} di ${steps.length}</span></h3><ol class="rc-steps">${steps.map(row).join("")}</ol></div>`;
  }

  function missCard(pi) {
    if (!pi.next) return "";
    const miss = pi.missing.slice(0, 4);
    return `<div class="rc-miss-wrap"><h3 class="def-section-title">Per la fase ${pi.next.n}: ${esc(pi.next.name)}</h3>
      ${pi.capped ? `<p class="rc-alert rosso">Un cedimento recente ti tiene alla fase 2 finché non ti vede il chirurgo.</p>` : ""}
      <ul class="rc-miss">${miss.map((c) => `<li class="${c.met === false ? "no" : "todo"}"><span class="rc-mark" aria-hidden="true">${c.met === false ? "✗" : "?"}</span><span>${esc(c.text)}</span><em>${esc(c.value)}</em></li>`).join("")}</ul>
      ${pi.missing.length > miss.length ? `<p class="def-note">E altri ${pi.missing.length - miss.length}: li trovi tutti in «Fasi».</p>` : ""}
    </div>`;
  }

  function gatesStrip(l) {
    const g = E.gates(l);
    return `<div class="rc-gates-wrap"><h3 class="def-section-title">Date minime</h3><p class="def-note rc-tight">Prima contano i criteri dei test; queste date sono un limite in più.</p>
      <ol class="ma-strip rc-gates">${g.map((x) => `<li class="ma-strip-day ${x.open ? "s-done" : ""}" style="--ma-c:${x.open ? C : "transparent"}"><span>dal ${x.months}° mese</span><strong>${esc(x.label)}</strong><em>${x.open ? "aperto" : esc(dateShort(x.date))}</em></li>`).join("")}</ol></div>`;
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
  const mmss = (s) => { const t = Math.max(0, Math.ceil(s)); return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; };
  function timerMarkup() {
    return `<div class="ma-timer" id="rcTimer"><div class="ma-timer-top"><span id="rcTPhase"></span><span class="ma-sets" id="rcTSets"></span></div><div class="ma-timer-clock" id="rcTClock" aria-hidden="true"></div><p class="ma-task" id="rcTTask" hidden></p><div class="def-clockbar"><i id="rcTBar"></i></div><div class="def-row" id="rcTCtrl"></div><p class="ma-awake" id="rcTAwake" hidden></p></div>`;
  }
  function paintTimer() {
    const t = ui.timer;
    const phase = $("rcTPhase");
    const clock = $("rcTClock");
    const ctrl = $("rcTCtrl");
    if (!t || !phase || !clock || !ctrl) return;
    const p = t.phases[Math.min(t.i, t.phases.length - 1)];
    const box = $("rcTimer");
    if (box) box.className = `ma-timer ${t.finished ? "finished" : p.type}`;
    const sets = $("rcTSets");
    if (sets) sets.innerHTML = Array.from({ length: t.sets }, (_, i) => `<i class="${i + 1 < p.set || t.finished ? "done" : i + 1 === p.set ? "now" : ""}"></i>`).join("");
    const key = `${t.i}|${t.running}|${t.finished}`;
    if (t.ctrlKey !== key || !ctrl.firstChild) {
      const had = ctrl.contains(document.activeElement) ? document.activeElement.dataset.r : null;
      t.ctrlKey = key;
      ctrl.innerHTML = t.finished
        ? `<button type="button" class="def-ghost" data-r="t-reset">Ricomincia</button><span class="def-note">Ora segna com'è andata.</span>`
        : p.type === "reps"
          ? `<button type="button" class="def-primary" data-r="t-done">Serie fatta</button><button type="button" class="def-ghost" data-r="t-reset">Ricomincia</button>`
          : `${t.running ? `<button type="button" class="def-primary" data-r="t-pause">Pausa</button>` : `<button type="button" class="def-primary" data-r="t-start">${t.i === 0 && t.left === p.secs ? "Avvia" : "Riprendi"}</button>`}<button type="button" class="def-ghost" data-r="t-skip">${p.type === "work" ? "Fine serie" : "Salta"}</button><button type="button" class="def-ghost" data-r="t-reset">Ricomincia</button>`;
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
    if (p.type === "reps") { phase.textContent = `Serie ${p.set} di ${t.sets}${side}`; clock.textContent = `${p.reps}`; if (bar) bar.style.width = "100%"; return; }
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
  // dopo una sospensione (schermo spento): salta le fasi a tempo gia' finite
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

  /* ------------------------------------------------------------ ALLENAMENTO */
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
    if (ui.finishing) return finishView(l, items, marked);
    const list = items.map((x, i) => {
      const r = c.results[x.id];
      const cls = r === "pain" ? "no" : r && r !== "skip" ? "ok" : "";
      return `<li class="${i === ui.ex ? "now" : ""} ${cls}"><button type="button" data-r="goto" data-i="${i}"><span class="ma-dot" aria-hidden="true">${r ? (r === "skip" ? "–" : r === "pain" ? "!" : "✓") : i + 1}</span><span>${esc(x.e.name)}<small class="rc-listtag">${esc(AREA[x.e.area])}</small></span><span class="def-sr">${r ? RATE_LABEL[r] : "da fare"}</span></button></li>`;
    }).join("");
    const x = items[ui.ex];
    const e = x.e;
    const lvMax = E.maxLevel(l, e, c.phase);
    const nextLocked = x.lv < e.levels.length - 1 && x.lv >= lvMax ? e.levels[x.lv + 1] : null;
    const lockWhy = nextLocked ? (nextLocked.phase ? `dalla fase ${nextLocked.phase}` : nextLocked.minMonths ? `dal ${nextLocked.minMonths}° mese` : "") : "";
    const L = e.levels[x.lv];
    const result = c.results[x.id];
    const last = [...l.sessions].reverse().find((s) => s.results[x.id] && s.results[x.id] !== "skip");
    const graft = l.setup && l.setup.graft;
    const graftNote = graft === "rotuleo" && /ginocchio dietro|in ginocchio/i.test(e.steps.join(" ")) ? "Innesto dal tendine rotuleo: se appoggiare il ginocchio dà fastidio, metti un cuscino." : "";
    const easier = x.lv > 0 ? e.levels[x.lv - 1] : null;
    const harder = x.lv < lvMax ? e.levels[x.lv + 1] : null;
    return `
      <div class="ma-body ma-session" style="--ma-c:${C}">
        <div class="ma-session-head">
          <div><span class="def-kicker">${esc(info.label)} · fase ${c.phase}${c.light ? " · versione leggera" : ""}${c.red ? " · ginocchio a riposo" : ""}</span><h2>Esercizio ${ui.ex + 1} di ${items.length}</h2></div>
          <div class="ma-session-tools">
            <span class="ma-count">${marked}/${items.length} segnati</span>
            <button type="button" class="def-ghost def-toggle" data-r="sound" aria-pressed="${l.prefs.sound}">Suoni</button>
            <button type="button" class="def-ghost" data-r="cancel">Annulla</button>
          </div>
        </div>
        <div class="ma-session-grid">
          <ol class="ma-exlist">${list}</ol>
          <article class="ma-ex">
            <div class="ma-ex-top">${kindTag(e)}<span class="ma-dose">${esc(doseText(x.dose))}</span></div>
            <h3 data-focus-title>${esc(e.name)}</h3>
            <div class="rc-level">
              <span class="rc-level-n">Livello ${x.lv + 1} di ${e.levels.length}</span>
              <strong>${esc(L.name)}</strong>
              <span class="rc-level-text">${esc(L.text)}${lockWhy ? ` Il livello dopo si apre ${esc(lockWhy)}.` : ""}</span>
            </div>
            ${last ? `<p class="ma-last ${last.results[x.id] === "pain" ? "no" : "ok"}">L'ultima volta (${esc(dateShort(last.t))}): ${esc(RATE_LABEL[last.results[x.id]].toLowerCase())}</p>` : ""}
            <p class="ma-goal">${esc(e.goal)}</p>
            ${maBlock(l, e)}
            ${e.safety ? `<p class="ma-safety"><strong>Sicurezza</strong>${esc(e.safety)}</p>` : ""}
            ${graftNote ? `<p class="ma-safety"><strong>Il tuo innesto</strong>${esc(graftNote)}</p>` : ""}
            ${timerMarkup()}
            <p class="ma-how">${esc(e.how)}</p>
            <h4 class="ma-sub">Come si fa</h4>
            ${howMarkup(e)}
            <h4 class="ma-sub">Punti chiave</h4>
            <ul class="def-keys">${e.cues.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
            <div class="ma-errors"><h4 class="ma-sub">Errori tipici</h4><ul>${e.errors.map((y) => `<li><strong>${esc(y.e)}</strong><span>${esc(y.fix)}</span></li>`).join("")}</ul></div>
            <div class="ma-success rc-martial"><strong>Cosa ti dà sul tatami</strong><p>${esc(e.martial)}</p></div>
            <div class="ma-vars">
              ${easier ? `<div class="ma-var rc-var"><p><strong>Troppo difficile?</strong> ${esc(easier.name)}: ${esc(easier.text)}</p><button type="button" class="def-ghost" data-r="lv" data-d="-1">Passa al livello ${x.lv}</button></div>` : ""}
              ${harder ? `<div class="ma-var hard rc-var"><p><strong>Troppo facile?</strong> ${esc(harder.name)}: ${esc(harder.text)}</p><button type="button" class="def-ghost" data-r="lv" data-d="1">Passa al livello ${x.lv + 2}</button></div>` : ""}
            </div>
            <div class="rc-rate" role="group" aria-label="Com'è andata">
              ${RATE.map((r) => `<button type="button" class="ma-res rc-res r-${r.v}" data-r="rate" data-v="${r.v}" aria-pressed="${result === r.v}"><strong>${r.label}</strong><span>${x.dose.work != null && TIME_HINT[r.v] ? TIME_HINT[r.v] : r.hint}</span></button>`).join("")}
            </div>
            ${result === "pain" ? `<p class="rc-alert giallo">Alla fine dell'allenamento questo esercizio scende di un livello. Se il dolore resta anche da fermo, chiudi qui le gambe per oggi.</p>` : ""}
            <div class="def-row ma-ex-nav">
              ${ui.ex > 0 ? `<button type="button" class="def-ghost" data-r="goto" data-i="${ui.ex - 1}">‹ Precedente</button>` : ""}
              ${ui.ex < items.length - 1 ? `<button type="button" class="def-ghost" data-r="goto" data-i="${ui.ex + 1}">Successivo ›</button>` : ""}
              <button type="button" class="def-primary" data-r="finish" ${marked ? "" : "disabled"}>Concludi l'allenamento</button>
              ${marked < items.length ? `<span class="def-note">${marked ? "Gli esercizi non segnati contano come saltati." : "Segna almeno un esercizio per concludere."}</span>` : ""}
            </div>
          </article>
        </div>
      </div>`;
  }

  function finishView(l, items, marked) {
    const c = l.current;
    return `
      <div class="ma-body">
        <article class="ma-summary rc-finish" style="--ma-c:${C}">
          <div class="ma-summary-score"><strong>${marked}/${items.length}</strong><span>esercizi segnati</span></div>
          <div>
            <span class="def-kicker">${esc(D.SESSION_INFO[c.kind].label)}</span>
            <h2 data-focus-title>Durante l'allenamento, il ginocchio?</h2>
            <p class="def-note">Serve per decidere i livelli: con dolore non si sale.</p>
            <div class="rc-rate three" role="group" aria-label="Il ginocchio durante l'allenamento">
              <button type="button" class="ma-res rc-res r-easy" data-r="done" data-knee="0"><strong>Niente</strong><span>Nessun fastidio</span></button>
              <button type="button" class="ma-res rc-res r-hard" data-r="done" data-knee="1"><strong>Fastidio leggero</strong><span>Fino a 3 su 10, passa presto</span></button>
              <button type="button" class="ma-res rc-res r-pain" data-r="done" data-knee="2"><strong>Dolore</strong><span>Oltre 3 su 10</span></button>
            </div>
            <div class="def-row"><button type="button" class="def-ghost" data-r="finish-back">‹ Torna agli esercizi</button></div>
          </div>
        </article>
      </div>`;
  }

  function summaryView(l) {
    const s = ui.summary;
    const en = s.res.entry;
    const steps = E.plan(l).filter((x) => !x.done);
    return `
      <div class="ma-body">
        <article class="ma-summary" style="--ma-c:${C}">
          <div class="ma-summary-score"><strong>${en.done}/${en.total}</strong><span>esercizi fatti</span></div>
          <div>
            <span class="def-kicker">${esc(D.SESSION_INFO[en.kind].label)} · ${en.minutes} min</span>
            <h2 data-focus-title>Allenamento salvato</h2>
            <ul class="ma-sum-list">${Object.entries(en.results).map(([id, v]) => `<li class="${v === "pain" || v === "skip" ? "no" : "ok"}"><span>${v === "pain" ? "!" : v === "skip" ? "–" : "✓"}</span>${esc(E.EX.get(id).name)} · ${esc(RATE_LABEL[v].toLowerCase())}</li>`).join("")}</ul>
            ${s.res.ups.length ? `<p class="ma-reco up"><strong>Livello in più:</strong> ${s.res.ups.map((u) => `${esc(u.name)} (${esc(u.to)})`).join(", ")}.</p>` : ""}
            ${s.res.downs.length ? `<p class="ma-reco"><strong>Un passo indietro:</strong> ${s.res.downs.map((u) => `${esc(u.name)} (${esc(u.to)})`).join(", ")}.</p>` : ""}
            ${en.knee === 2 ? `<p class="ma-reco">Hai segnato dolore al ginocchio: domani fai con calma il controllo del mattino.</p>` : ""}
            ${!s.res.ups.length && !s.res.downs.length && en.kind !== "ext" ? `<p class="def-note">Un livello sale dopo due «facile» di fila sullo stesso esercizio.</p>` : ""}
            <p class="def-note">${steps.length ? `Ancora oggi: ${esc(steps.map((x) => x.title.toLowerCase()).join(", "))}.` : "Programma di oggi completato."}</p>
            <div class="def-row"><button type="button" class="def-primary" data-r="summary-close">Torna a Oggi</button></div>
          </div>
        </article>
      </div>`;
  }

  /* ------------------------------------------------------------ FASI */
  function phasesView(l) {
    if (!E.configured(l)) return needSetup();
    const pi = E.phaseInfo(l);
    const mark = (m) => (m === true ? "ok" : m === false ? "no" : "todo");
    return `
      <div class="rc-intro"><h2 class="ma-h2">Si avanza per criteri</h2><p class="def-note">Ogni fase si apre quando i test della settimana superano tutti i suoi criteri, e mai prima delle date minime. Le soglie vengono dalle linee guida MOON e dallo studio di Grindem; i test di casa sono un'approssimazione di quelli del fisioterapista.</p></div>
      <div class="rc-phases">${pi.phases.map((p) => `
        <article class="rc-card rc-phase ${p.n === pi.phase ? "now" : p.n < pi.phase ? "past" : ""}">
          <div class="rc-phase-head"><span class="rc-phase-n">${p.n}</span><div><h3>${esc(p.name)}</h3><span class="def-note rc-tight">${p.n === pi.phase ? "La tua fase" : p.n < pi.phase ? "Superata" : "Più avanti"}</span></div></div>
          <p>${esc(p.goal)}</p>
          <p class="def-note">${esc(p.focus)}</p>
          ${p.criteria.length ? `<h4 class="ma-sub">Per entrare</h4><ul class="rc-crit">${p.criteria.map((c) => `<li class="${mark(c.met)}"><span class="rc-mark" aria-hidden="true">${c.met === true ? "✓" : c.met === false ? "✗" : "?"}</span><span>${esc(c.text)}</span><em>${esc(c.value)}</em></li>`).join("")}</ul>` : `<p class="def-note">Si parte da qui.</p>`}
          <div class="rc-difesa"><div><h4 class="ma-sub">Nelle arti marziali sì</h4><ul>${p.difesaYes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div><div><h4 class="ma-sub">Non ancora</h4><ul>${p.difesaNo.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
        </article>`).join("")}</div>
      ${gatesStrip(l)}`;
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
    const msg = ui.testMsg;
    return `
      <div class="rc-intro"><h2 class="ma-h2">Test della settimana</h2><p class="def-note">Una volta a settimana, a ginocchio riposato (non dopo l'allenamento delle gambe). Compila quello che riesci: i campi vuoti tengono il valore dell'ultima volta. La fase si aggiorna da sola.${E.testDue(l) ? "" : " Questa settimana li hai già fatti: puoi rifarli se vuoi."}</p></div>
      ${msg ? `<div class="ma-reco ${msg.up ? "up" : ""}" role="status"><strong>${esc(msg.title)}</strong><br>${esc(msg.text)}</div>` : ""}
      <form id="rcTestForm" class="rc-tests" novalidate>
        ${list.map((t) => `
          <div class="rc-card rc-test" role="group" aria-labelledby="rcT-${t.id}">
            <div class="rc-test-head"><strong id="rcT-${t.id}">${esc(t.name)}</strong>${lastOf(t)}</div>
            <details><summary>Come si fa</summary><p>${esc(t.how)}</p></details>
            ${input(t)}
          </div>`).join("")}
        <div class="def-row rc-test-save"><button type="submit" class="def-primary">Salva i test</button><span class="def-note">${later.length ? `Più avanti: ${esc(later.map((t) => t.name.toLowerCase()).join(", "))} (dalla fase 3).` : ""}</span></div>
      </form>
      ${historyTable(l)}`;
  }

  function historyTable(l) {
    const rows = l.tests.slice(-8).reverse();
    if (!rows.length) return "";
    const pct = (v) => (E.lsi(v) == null ? "—" : `${E.lsi(v)}%`);
    return `
      <h3 class="def-section-title">Gli ultimi test</h3>
      <div class="rc-table-wrap"><table class="rc-table">
        <thead><tr><th scope="col">Data</th><th scope="col">Talloni</th><th scope="col">Gamba tesa</th><th scope="col">Sedia</th><th scope="col">Polpacci</th><th scope="col">Ponte</th><th scope="col">Equilibrio</th><th scope="col">Allungo</th><th scope="col">Divaricata</th><th scope="col">Slancio</th></tr></thead>
        <tbody>${rows.map((t) => `<tr><th scope="row">${esc(dateShort(t.t))}</th><td>${t.heel == null ? "—" : `${dec(t.heel)} cm`}</td><td>${t.slr == null ? "—" : t.slr}</td><td>${pct(t.sit)}</td><td>${pct(t.calf)}</td><td>${pct(t.bridge)}</td><td>${pct(t.balance)}</td><td>${t.reach == null ? "—" : `${t.reach > 0 ? "+" : ""}${t.reach} cm`}</td><td>${t.straddle == null ? "—" : `${t.straddle} cm`}</td><td>${t.kickH == null ? "—" : `${t.kickH[0]} cm`}</td></tr>`).join("")}</tbody>
      </table></div>
      <p class="def-note">Le percentuali sono la gamba operata rispetto alla sana.</p>`;
  }

  /* ------------------------------------------------------------ ESERCIZI */
  function usedIn(id) {
    const where = [];
    if (D.SESSIONS.ext.includes(id)) where.push("estensione");
    const kick = [1, 2, 3, 4].filter((n) => D.SESSIONS.kick[n].includes(id));
    if (kick.length) where.push(kick.length === 4 ? "estensione e calci" : `estensione e calci, fase ${kick[0]}${kick.length > 1 ? `-${kick[kick.length - 1]}` : ""}`);
    const legs = [1, 2, 3, 4].filter((n) => D.SESSIONS.legs[n].includes(id));
    if (legs.length) where.push(`gambe, fase ${legs.join("-")}`);
    if (D.SESSIONS.upperA.includes(id)) where.push("parte alta A");
    if (D.SESSIONS.upperB.includes(id)) where.push("parte alta B");
    const mart = [1, 2, 3, 4].filter((n) => D.SESSIONS.martial[n].includes(id));
    if (mart.length) where.push(`tecnica, fase ${mart.join("-")}`);
    return where;
  }
  function libraryView(l) {
    const ph = E.configured(l) ? E.phase(l) : 1;
    const chips = [["all", "Tutti"]].concat(D.AREAS.map((a) => [a.id, a.label]));
    const list = D.EXERCISES.filter((e) => (ui.filter === "all" || e.area === ui.filter) && (!ui.goal || (e.builds[ui.goal] || 0) >= 2));
    const top = topUnion(myStyles(l).ids);
    const opened = ui.open && D.EXERCISES.find((e) => e.id === ui.open);
    return `
      <div class="rc-intro"><h2 class="ma-h2">Gli esercizi</h2><p class="def-note">Tutti gli esercizi del piano con l'omino che mostra ogni passo e i livelli. Nell'allenamento il livello si sceglie da solo (due «facile» di fila lo alzano, il dolore lo abbassa), ma puoi cambiarlo tu.</p></div>
      ${opened ? libDetail(l, opened, ph) : ""}
      <div class="ma-nav rc-filter" role="group" aria-label="Filtra per zona">${chips.map(([id, label]) => `<button type="button" data-r="filter" data-v="${id}" aria-pressed="${ui.filter === id}">${esc(label)}</button>`).join("")}</div>
      <div class="rc-goalfilter" role="group" aria-label="Filtra per cosa allena nelle arti marziali"><span>Per le arti marziali:</span>${D.MA_GOALS.map((g) => `<button type="button" class="${top.includes(g.id) ? "mine" : ""}" data-r="goal" data-v="${g.id}" aria-pressed="${ui.goal === g.id}">${esc(g.label)}</button>`).join("")}</div>
      ${list.length ? `<ol class="ma-preview rc-lib">${list.map((e) => `<li class="${opened && opened.id === e.id ? "now" : ""}">${kindTag(e)}<button type="button" class="rc-lib-btn" data-r="lib-open" data-id="${e.id}">${esc(e.name)}</button><em>${esc(usedIn(e.id).join(" · ") || "fuori dalle sessioni")}${Object.keys(e.builds).length ? ` · ${esc(Object.entries(e.builds).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([g]) => GOAL[g].label.toLowerCase()).join(", "))}` : ""}</em></li>`).join("")}</ol>` : `<p class="def-note">Nessun esercizio in questa zona allena molto questa qualità: togli uno dei due filtri.</p>`}`;
  }
  function libDetail(l, e, ph) {
    const lv = E.levelOf(l, e.id, ph);
    return `
      <article class="ma-ex rc-lib-detail" style="--ma-c:${C}">
        <div class="ma-ex-top">${kindTag(e)}<button type="button" class="def-ghost" data-r="lib-close">Chiudi</button></div>
        <h3 data-focus-title>${esc(e.name)}</h3>
        <p class="ma-goal">${esc(e.goal)}</p>
        ${maBlock(l, e)}
        ${e.safety ? `<p class="ma-safety"><strong>Sicurezza</strong>${esc(e.safety)}</p>` : ""}
        <p class="ma-how">${esc(e.how)}</p>
        <h4 class="ma-sub">Come si fa</h4>
        ${howMarkup(e)}
        <h4 class="ma-sub">Punti chiave</h4>
        <ul class="def-keys">${e.cues.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        <div class="ma-errors"><h4 class="ma-sub">Errori tipici</h4><ul>${e.errors.map((y) => `<li><strong>${esc(y.e)}</strong><span>${esc(y.fix)}</span></li>`).join("")}</ul></div>
        <h4 class="ma-sub">Livelli</h4>
        <ol class="rc-levels">${e.levels.map((L, i) => `<li class="${i === lv && E.configured(l) ? "now" : ""}"><strong>${esc(L.name)}</strong> ${esc(L.text)} <span>${esc(doseText({ ...e.dose, ...(L.dose || {}) }))}${L.phase ? ` · dalla fase ${L.phase}` : ""}${L.minMonths ? ` · dal ${L.minMonths}° mese` : ""}${i === lv && E.configured(l) ? " · il tuo livello" : ""}</span></li>`).join("")}</ol>
        <div class="ma-success rc-martial"><strong>Cosa ti dà sul tatami</strong><p>${esc(e.martial)}</p></div>
      </article>`;
  }

  /* ------------------------------------------------------------ PERCHÉ */
  function whyView(l) {
    const g = l.setup ? D.GRAFTS.find((x) => x.id === l.setup.graft) : null;
    return `
      <div class="rc-intro"><h2 class="ma-h2">Perché il piano è fatto così</h2><p class="def-note">Ogni scelta viene da uno studio o da una linea guida. Le fonti sono in fondo a ogni scheda.</p></div>
      ${l.setup ? `<article class="rc-card rc-mine">
        <div class="rc-card-head"><h3>Il tuo intervento</h3><button type="button" class="def-ghost" data-r="setup-edit">Modifica</button></div>
        <p>Gamba ${esc(sideLabel(l))}, intervento del ${esc(dateLong(E.surgeryTime(l)))} (${esc(monthsText(l))}). Innesto: ${esc(g ? g.label.toLowerCase() : "non indicato")}.</p>
        ${g ? `<p class="def-note">${esc(g.tip)}</p>` : ""}
      </article>` : ""}
      <div class="rc-lessons">${D.LESSONS.map((x) => `
        <article class="rc-card rc-lesson">
          <h3>${esc(x.title)}</h3>
          <p class="rc-lead">${esc(x.lead)}</p>
          ${x.body.map((p) => `<p>${esc(p)}</p>`).join("")}
          <ul class="rc-sources">${x.sources.map((s) => `<li><a href="${esc(D.SOURCES[s].url)}" target="_blank" rel="noopener noreferrer">${esc(D.SOURCES[s].label)}<span class="def-sr"> (si apre in una nuova scheda)</span></a></li>`).join("")}</ul>
        </article>`).join("")}</div>
      <p class="def-disclaimer">Questo piano non sostituisce il fisioterapista né il chirurgo: è il lavoro di tutti i giorni tra un controllo e l'altro.</p>`;
  }

  /* ------------------------------------------------------------ PROGRESSI */
  function hexProfile(l) {
    const vals = E.profile(l);
    let i = -1;
    const svg = (typeof buildRadarMarkup === "function" ? buildRadarMarkup(vals.map((v) => ({ label: v.label, value: v.value })), 380, 190, 98, true) : "")
      .replace(/(<text class="radar-value"[^>]*>)[^<]*(<\/text>)/g, (m, a, b) => { i += 1; const v = vals[i]; return v ? `${a}${v.measured ? v.value : "da misurare"}${b}` : m; });
    const measured = vals.filter((v) => v.measured);
    const total = measured.length ? Math.round(measured.reduce((s, v) => s + v.value, 0) / measured.length) : null;
    return `<svg class="def-radar rc-radar" viewBox="0 0 380 380" role="img" aria-label="Profilo del recupero: ${vals.map((v) => `${esc(v.label)} ${v.measured ? v.value : "da misurare"}`).join(", ")}">${svg}</svg>
      <p class="rc-hex-total"><strong>${total == null ? "—" : total}</strong> <span>${total == null ? "fai il primo test per vedere il profilo" : `media delle voci misurate · ${plural(measured.length, "voce", "voci")} su 6`}</span></p>
      <ul class="rc-metrics">${vals.map((v) => `<li class="${v.measured ? "" : "todo"}"><span>${esc(v.label)}</span><strong>${v.measured ? v.value : "da misurare"}</strong>${v.measured ? `<i style="--w:${v.value}%"></i>` : ""}</li>`).join("")}</ul>
      <p class="def-note">Il recupero non entra nel rango generale: qui non conviene mai forzare per prendere punti.</p>`;
  }
  function maHex(l) {
    const vals = E.maProfile(l);
    const st = myStyles(l);
    const top = topUnion(st.ids);
    let i = -1;
    const svg = (typeof buildRadarMarkup === "function" ? buildRadarMarkup(vals.map((v) => ({ label: v.label, value: v.value })), 380, 190, 98, true) : "")
      .replace(/(<text class="radar-value"[^>]*>)[^<]*(<\/text>)/g, (m, a, b) => { i += 1; const v = vals[i]; return v ? `${a}${v.measured ? v.value : "da misurare"}${b}` : m; });
    const measured = vals.filter((v) => v.measured);
    // per i tuoi stili: media pesata con quanto conta ogni qualità
    const f = E.styleFocus(st.ids);
    const wsum = measured.reduce((a, v) => a + f[v.key], 0);
    const score = measured.length && wsum ? Math.round(measured.reduce((a, v) => a + v.value * f[v.key], 0) / wsum) : null;
    const chips = Object.entries(D.STYLE_NEEDS).map(([id, x]) => `<button type="button" data-r="style" data-v="${id}" aria-pressed="${st.ids.includes(id)}">${esc(x.name)}</button>`).join("");
    return `<svg class="def-radar rc-radar" viewBox="0 0 380 380" role="img" aria-label="Per le arti marziali: ${vals.map((v) => `${esc(v.label)} ${v.measured ? v.value : "da misurare"}`).join(", ")}">${svg}</svg>
      <p class="rc-hex-total"><strong>${score == null ? "—" : score}</strong> <span>${score == null ? "si misura con i test della settimana (allungo, divaricata, slancio)" : st.ids.length ? `pronto per ${esc(listIt(st.ids.map((id) => D.STYLE_NEEDS[id].mine)))}, sulle voci misurate` : "media delle voci misurate"}</span></p>
      <ul class="rc-metrics">${vals.map((v) => `<li class="${v.measured ? "" : "todo"} ${top.includes(v.key) ? "mine" : ""}"><span title="${esc(v.text)}">${esc(v.label)}</span><strong>${v.measured ? v.value : "da misurare"}</strong>${v.measured ? `<i style="--w:${v.value}%"></i>` : ""}</li>`).join("")}</ul>
      <h4 class="ma-sub">Le tue arti marziali</h4>
      <div class="rc-styles" role="group" aria-label="Le tue arti marziali">${chips}</div>
      <p class="def-note">${st.ids.length ? `${st.auto ? "Prese dalla Difesa (cosa hai allenato di recente). " : ""}${esc(st.ids.map((id) => D.STYLE_NEEDS[id].text).join(" "))}` : "Tocca gli stili che fai: nelle schede degli esercizi vengono evidenziate le qualità che servono a loro."}${!st.auto && st.ids.length ? ` <button type="button" class="def-ghost rc-small-btn" data-r="style-auto">Usa quelli della Difesa</button>` : ""}</p>`;
  }
  function extChart(l) {
    const pts = l.tests.filter((t) => t.heel !== undefined).slice(-12);
    if (pts.length < 2) return `<p class="def-note">Il grafico dell'estensione compare dal secondo test.</p>`;
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
    if (!rows.length) return `<p class="def-note">Le barre compaiono dopo il primo test con le due gambe.</p>`;
    return `<ul class="rc-lsi">${rows.map((r) => `<li><span>${esc(r.t.name)}</span><div class="rc-lsi-bar"><i style="--w:${Math.min(110, r.v) / 1.1}%"></i><b class="m80" title="80%"></b><b class="m90" title="90%"></b></div><strong>${r.v}%</strong></li>`).join("")}</ul>
      <p class="def-note">Le tacche segnano l'80% (corsa e salti) e il 90% (ritorno al contatto).</p>`;
  }
  function progressView(l) {
    if (!E.configured(l)) return needSetup();
    const now = Date.now();
    const weeks = [3, 2, 1, 0].map((w) => {
      const to = now - w * 7 * 86400000, from = to - 7 * 86400000;
      const s = l.sessions.filter((x) => x.t > from && x.t <= to && !STRETCH.includes(x.kind) && x.kind !== "martial").length;
      const ex = new Set(l.ext.filter((t) => t > from && t <= to).map(E.dayKey)).size;
      return { label: w === 0 ? "Questa settimana" : w === 1 ? "Settimana scorsa" : `${w} settimane fa`, s, ex };
    });
    const recent = [...l.sessions].reverse().slice(0, 8);
    return `
      <div class="rc-grid">
        <div>
          <article class="rc-card"><h3>Profilo del recupero</h3>${hexProfile(l)}</article>
          <article class="rc-card rc-ma-card"><h3>Per le arti marziali</h3>${maHex(l)}</article>
        </div>
        <div>
          <article class="rc-card"><h3>Estensione</h3><p class="def-note rc-tight">Differenza dei talloni a pancia in giù: più bassa è meglio.</p>${extChart(l)}</article>
          <article class="rc-card"><h3>Simmetria delle gambe</h3>${lsiBars(l)}</article>
          <article class="rc-card"><h3>Costanza</h3>
            <ul class="rc-weeks">${weeks.map((w) => `<li><span>${esc(w.label)}</span><strong>${plural(w.s, "allenamento", "allenamenti")}</strong><em>estensione in ${plural(w.ex, "giorno", "giorni")}</em></li>`).join("")}</ul>
            <p class="def-note">${E.streak(l) ? `${plural(E.streak(l), "giorno", "giorni")} di fila con almeno una routine o un allenamento.` : "Inizia oggi la serie."}</p>
          </article>
        </div>
      </div>
      ${recent.length ? `<h3 class="def-section-title">Ultimi allenamenti</h3><ol class="ma-preview">${recent.map((s) => `<li><span class="ma-kind k-r-${STRETCH.includes(s.kind) || s.kind === "legs" || s.kind === "martial" ? s.kind : "upper"}">${esc(dateShort(s.t))}</span><strong>${esc(D.SESSION_INFO[s.kind].label)}</strong><em>${s.done}/${s.total} · fase ${s.phase}${s.light ? " · leggera" : ""}${s.knee === 2 ? " · dolore" : s.knee === 1 ? " · fastidio" : ""}</em></li>`).join("")}</ol>` : ""}`;
  }

  function needSetup() {
    return `<div class="ma-reco"><strong>Prima imposta il piano.</strong> Servono la data dell'intervento e due risposte veloci. <button type="button" class="def-ghost rc-small-btn" data-r="view" data-view="today">Imposta</button></div>`;
  }

  /* ------------------------------------------------------------ disegno */
  function render(focus) {
    const box = $("defPanel-recovery");
    if (!box) return;
    dropDemo();
    const l = lab();
    const running = !!l.current;
    const views = [["today", "Oggi"], ["phases", "Fasi"], ["test", "Test"], ["library", "Esercizi"], ["why", "Perché"], ["progress", "Progressi"]];
    const nav = `<div class="ma-nav" role="group" aria-label="Recupero">${views.map(([k, label]) => `<button type="button" data-r="view" data-view="${k}" aria-pressed="${ui.view === k}">${label}${k === "today" && running ? ` <span class="ma-live" title="Allenamento in corso">●</span><span class="def-sr"> (allenamento in corso)</span>` : ""}</button>`).join("")}</div>`;
    let body;
    if (ui.view === "today") body = running ? sessionView(l) : ui.summary ? summaryView(l) : todayView(l);
    else if (ui.view === "phases") body = phasesView(l);
    else if (ui.view === "test") body = testView(l);
    else if (ui.view === "library") body = libraryView(l);
    else if (ui.view === "why") body = whyView(l);
    else body = progressView(l);
    const head = E.configured(l) ? `Fase ${E.phase(l)} · ${esc(D.PHASES[E.phase(l) - 1].name)} · ${esc(monthsText(l))}` : "Dopo il crociato: estensione, forza delle gambe e tecnica che il ginocchio può già fare.";
    box.innerHTML = `
      <div class="ma-band rc-band">
        <div><span class="ma-band-title">Recupero del ginocchio</span><span class="ma-band-sub">${head}</span></div>
        ${nav}
      </div>
      <div class="rc-body">${body}</div>`;
    if (running && ui.view === "today" && !ui.finishing) {
      const x = sessionItems(l)[ui.ex];
      ensureTimer(x.id, x.lv, x.dose);
      paintTimer();
    }
    mountDemo(box);
    if (focus) {
      const target = box.querySelector("[data-focus-title]") || box.querySelector("h2, h3");
      if (target) { if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); }
      const r = box.getBoundingClientRect();
      if (r.top < 0 || focus === "top") window.scrollTo({ top: Math.max(0, window.scrollY + r.top - 10), behavior: "auto" });
    }
  }
  function setView(view) {
    ui.view = view;
    ui.testMsg = null;
    ui.setupEdit = false;
    render(true);
  }

  /* ------------------------------------------------------------ azioni */
  function onClick(event) {
    const el = event.target.closest("[data-r]");
    if (!el || el.disabled) return;
    const l = lab();
    switch (el.dataset.r) {
      case "view": if (ui.view === "today" && el.dataset.view !== "today" && ui.timer && ui.timer.running) timerPause(); setView(el.dataset.view); break;
      case "ck": {
        const f = el.dataset.f;
        const v = el.dataset.v === "true" ? true : el.dataset.v === "false" ? false : Number(el.dataset.v);
        ui.check = { ...(ui.check || {}), [f]: v };
        render(false);
        const again = document.querySelector(`#defPanel-recovery [data-r="ck"][data-f="${f}"][data-v="${el.dataset.v}"]`);
        if (again) again.focus({ preventScroll: true });
        break;
      }
      case "ck-save": {
        E.checkIn(l, ui.check || {});
        ui.check = null;
        ui.checkEdit = false;
        ui.pick = null;
        save();
        render(false);
        const r = E.readiness(l);
        announce(r ? `Controllo salvato: ginocchio ${r.level}` : "Controllo salvato");
        break;
      }
      case "ck-edit": ui.checkEdit = true; ui.check = null; render(false); break;
      case "ck-cancel": ui.checkEdit = false; ui.check = null; render(false); break;
      case "pick": {
        ui.pick = el.dataset.kind;
        render(false);
        const b = document.querySelector(`#defPanel-recovery [data-r="pick"][data-kind="${el.dataset.kind}"]`);
        if (b) b.focus({ preventScroll: true });
        break;
      }
      case "setup-edit": ui.setupEdit = true; ui.view = "today"; ui.setupErr = ""; render(true); break;
      case "setup-cancel": ui.setupEdit = false; ui.setupErr = ""; render(true); break;
      case "start": {
        const s = E.startSession(l, el.dataset.kind);
        if (!s) { announce("Oggi questo allenamento non è disponibile"); break; }
        ui.view = "today";
        ui.exFor = null;
        ui.finishing = false;
        ui.summary = null;
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
          stopTimer();
          if (any >= 0) ui.ex = any; else ui.finishing = true;
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
        ui.pick = null;
        save();
        render("top");
        announce("Allenamento salvato");
        break;
      }
      case "summary-close": ui.summary = null; ui.view = "today"; render("top"); break;
      case "cancel": E.cancelSession(l); ui.finishing = false; stopTimer(); save(); render("top"); break;
      case "sound": l.prefs.sound = !l.prefs.sound; save(); render(false); break;
      case "t-start": timerStart(); break;
      case "t-pause": timerPause(); break;
      case "t-skip": if (ui.timer) { ui.timer.left = 0; nextPhase(false); } break;
      case "t-done": nextPhase(true); break;
      case "t-reset": { if (ui.timer) { clearInterval(ui.timer.tick); if (window.DefenseAwake) DefenseAwake.release(); ui.timer = null; } const x = sessionItems(l)[ui.ex]; ensureTimer(x.id, x.lv, x.dose); paintTimer(); break; }
      case "demo-step": if (ui.player) { ui.player.loopStep(Number(el.dataset.step)); ui.player.play(); showDemo(); } break;
      case "demo-frame": if (ui.player) ui.player.showFrame(Number(el.dataset.step), Number(el.dataset.frame)); break;
      case "filter": ui.filter = el.dataset.v; render(false); break;
      case "goal": ui.goal = ui.goal === el.dataset.v ? null : el.dataset.v; render(false); break;
      case "style": {
        const id = el.dataset.v;
        const cur = myStyles(l);
        // dalla Difesa (scelta automatica) il primo tocco sceglie solo quello stile; poi si aggiungono e tolgono
        let next = cur.auto ? [] : cur.ids.slice();
        next = next.includes(id) ? next.filter((x) => x !== id) : next.concat(id);
        l.prefs.styles = next.filter((x) => D.STYLE_NEEDS[x]);
        if (!l.prefs.styles.length) l.prefs.styles = [];
        save();
        render(false);
        break;
      }
      case "style-auto": l.prefs.styles = []; save(); render(false); break;
      case "lib-open": ui.open = el.dataset.id; render(true); break;
      case "lib-close": ui.open = null; render(false); break;
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
      const lower = (s) => s.charAt(0).toLowerCase() + s.slice(1);
      ui.testMsg = res.after > res.before
        ? { up: true, title: `Fase ${res.after}: ${D.PHASES[res.after - 1].name}`, text: `Hai superato tutti i criteri. ${D.PHASES[res.after - 1].focus}` }
        : res.after < res.before
          ? { title: `Di nuovo fase ${res.after}`, text: "Un criterio non è più rispettato: si torna un passo indietro finché il test non torna buono." }
          : { title: `Test salvati · fase ${res.after}`, text: pi.next ? `Per la fase ${pi.next.n} manca: ${pi.missing.map((c) => lower(c.text)).join("; ")}.` : "Sei all'ultima fase." };
      save();
      render("top");
      announce(ui.testMsg.title);
    }
  }

  window.DefenseRecoveryUI = {
    render,
    setView,
    stop() {
      if (ui.timer && ui.timer.running) timerPause();
      dropDemo();
    },
    debug: ui
  };
  window.recoveryTrend = () => E.trend(lab());

  document.addEventListener("DOMContentLoaded", () => {
    const box = $("defPanel-recovery");
    if (!box) return;
    box.addEventListener("click", onClick);
    box.addEventListener("input", onInput);
    box.addEventListener("submit", onSubmit);
    document.addEventListener("visibilitychange", () => { if (!document.hidden && ui.timer && ui.timer.running) timerTick(); });
  });
})();
