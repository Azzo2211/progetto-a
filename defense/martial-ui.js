/*
 * Progetto A - Difesa: interfaccia delle arti marziali ("metodo Johan Seong").
 *
 * Viste: Oggi (allenamento del giorno: sessione impara/ripeti/prova, timer con i compiti dei round,
 * esiti), Settimana (calendario modificabile), Stili (le discipline, livelli e sessioni),
 * Lookism (il metodo di Johan, i personaggi e il tuo rango), Progressi (storico).
 * Dati: MartialDisciplines (defense/martial-data.js), MartialLookism (defense/martial-lookism.js).
 * Motore: MartialEngine (defense/martial.js). Disegna dentro #defPanel-martial.
 */
(function () {
  "use strict";

  const M = window.MartialEngine;
  const DISC = window.MartialDisciplines || [];
  const LOOK = window.MartialLookism || null;
  const BY = new Map(DISC.map((d) => [d.id, d]));
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const KIND = {
    riscaldamento: "Riscaldamento",
    tecnica: "Tecnica",
    drill: "Drill",
    combinazione: "Combinazione",
    shadow: "Shadow",
    sacco: "Sacco",
    preparatorio: "Preparatorio",
    flessibilita: "Flessibilità",
    condizionamento: "Condizionamento",
    prova: "Prova",
    defaticamento: "Defaticamento"
  };
  const TYPE = { impara: "Impara", ripeti: "Ripeti", prova: "Prova" };

  const ui = {
    view: "today",
    week: null,       // settimana mostrata nel calendario
    open: null,       // stile aperto nella vista Stili
    ex: 0,            // esercizio mostrato durante l'allenamento
    summary: null,    // riepilogo dopo l'ultimo allenamento
    timer: null,      // timer dell'esercizio corrente
    renderedAt: 0,
    exFor: null,      // allenamento per cui ui.ex e' gia' stato posizionato
    pick: {},         // sessione scelta a mano oggi, per stile
    guard: {}         // ultimo clic per gruppo di azioni (contro i doppi clic)
  };

  const $ = (id) => document.getElementById(id);
  const esc = (text) => String(text == null ? "" : text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const prose = (text) => esc(String(text == null ? "" : text).replace(/"([^"]*)"/g, "“$1”").replace(/([A-Za-zÀ-ÿ])'([A-Za-zÀ-ÿ0-9])/g, "$1’$2"));
  const pad = (n) => String(n).padStart(2, "0");
  const mmss = (sec) => { const t = Math.max(0, Math.ceil(sec)); return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`; };
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const capital = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  function lab() {
    state.martialLab = M.ensure(state.martialLab, DISC);
    return state.martialLab;
  }

  function prefs() {
    if (!state.defenseUi || typeof state.defenseUi !== "object") state.defenseUi = { voice: true, sound: true };
    return state.defenseUi;
  }

  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
    if (window.renderDefenseProfile) window.renderDefenseProfile();
  }

  function announce(text) {
    const live = $("defLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }

  function focusHeading(box) {
    const h = box && (box.querySelector("[data-focus-title]") || box.querySelector("h2, h3"));
    if (!h) return;
    if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1");
    h.focus({ preventScroll: true });
  }

  function scrollTop() {
    const box = $("defPanel-martial");
    if (!box) return;
    const y = window.scrollY + box.getBoundingClientRect().top - 10;
    if (box.getBoundingClientRect().top < 0) window.scrollTo({ top: Math.max(0, y), behavior: reduced ? "instant" : "auto" });
  }

  /* ---------------------------------------------------------- suoni e voce */
  let audio = null;
  function beep(freq = 880, ms = 140, gain = 0.08) {
    if (!prefs().sound) return;
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

  function speak(text) {
    if (!prefs().voice || !("speechSynthesis" in window)) return;
    try {
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "it-IT";
      const v = synth.getVoices().find((x) => /^it/i.test(x.lang));
      if (v) u.voice = v;
      synth.speak(u);
    } catch (e) { /* niente voce */ }
  }

  /* -------------------------------------------------------------- dati */
  function levelData(disc, level) {
    const d = BY.get(disc);
    return d ? d.levels[clamp(level, 1, d.levels.length) - 1] : null;
  }

  // Esercizi di una sessione: riscaldamento del livello, la sessione, defaticamento.
  function listOf(lv, idx) {
    if (!lv || !lv.sessions || !lv.sessions.length) return [];
    const s = lv.sessions[clamp(idx, 0, lv.sessions.length - 1)];
    return [lv.warmup, ...s.exercises, lv.cooldown].filter(Boolean);
  }

  function sessionOf(lv, idx) {
    return lv && lv.sessions && lv.sessions.length ? lv.sessions[clamp(idx, 0, lv.sessions.length - 1)] : null;
  }

  function curLevel(l) { return levelData(l.current.disc, l.current.level); }
  function curList(l) { return listOf(curLevel(l), l.current.session); }

  // Com'e' andato questo esercizio l'ultima volta che l'hai fatto.
  function lastResult(l, exId) {
    for (let i = l.sessions.length - 1; i >= 0; i -= 1) {
      const r = l.sessions[i].results;
      if (r && r[exId] !== undefined) return { ok: r[exId] === 1, t: l.sessions[i].t };
    }
    return null;
  }

  function lookFor(disc) {
    return LOOK && LOOK.styles ? LOOK.styles[disc] || null : null;
  }

  function rankOf(l) {
    if (!LOOK || !LOOK.ranks || !DISC.length) return null;
    const pct = Math.round(DISC.reduce((n, d) => n + M.copyPercent(l, d.id), 0) / DISC.length);
    let i = 0;
    LOOK.ranks.forEach((r, k) => { if (pct >= r.min) i = k; });
    return { pct, rank: LOOK.ranks[i], next: LOOK.ranks[i + 1] || null };
  }

  function doseText(dose, kind) {
    if (!dose) return "";
    const side = dose.perSide ? " per lato" : "";
    const time = (s) => (s >= 60 && s % 60 === 0 ? `${s / 60} min` : s >= 60 ? `${Math.floor(s / 60)}:${pad(s % 60)} min` : `${s} s`);
    let main;
    if (dose.work != null) main = ["shadow", "sacco"].includes(kind) ? `${plural(dose.sets, "round", "round")} da ${time(dose.work)}${side}` : `${dose.sets} × ${time(dose.work)}${side}`;
    else main = `${dose.sets} × ${dose.reps}${side}`;
    return dose.rest && dose.sets > 1 ? `${main} · recupero ${time(dose.rest)}` : main;
  }

  function dayLabel(time) {
    return new Date(time).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  }

  function mottoFor(disc, time = Date.now()) {
    const d = BY.get(disc);
    if (!d || !d.mottos || !d.mottos.length) return "";
    const n = Math.floor(new Date(time).setHours(0, 0, 0, 0) / M.DAY);
    return d.mottos[n % d.mottos.length];
  }

  function copyRing(pct, color, size = 64) {
    const r = size / 2 - 5;
    const c = 2 * Math.PI * r;
    return `<svg class="ma-ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ma-ring-bg"></circle>
      ${pct > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ma-ring-fg" style="stroke:${color};stroke-dasharray:${((pct / 100) * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"></circle>` : ""}
      <text x="50%" y="54%" text-anchor="middle" class="ma-ring-text">${pct}%</text>
    </svg>`;
  }

  // Piano di una settimana: le passate restano com'erano, la corrente si crea, le future sono anteprime.
  function planFor(l, week) {
    const current = M.weekKey(Date.now());
    if (week < current) return l.weeks[week] || { days: {} };
    if (week === current) return M.planWeek(l, DISC, week);
    return M.previewWeek(l, DISC, week);
  }

  function discOptions(selected, withRest) {
    const l = lab();
    const list = DISC.filter((d) => l.pool.includes(d.id) || d.id === selected);
    const others = DISC.filter((d) => !list.includes(d));
    return `${withRest ? `<option value="" ${!selected ? "selected" : ""}>Riposo</option>` : ""}
      ${list.map((d) => `<option value="${d.id}" ${d.id === selected ? "selected" : ""}>${esc(d.name)} · Lv ${M.levelOf(l, d.id)}</option>`).join("")}
      ${others.length ? `<optgroup label="Fuori rotazione">${others.map((d) => `<option value="${d.id}">${esc(d.name)} · Lv ${M.levelOf(l, d.id)}</option>`).join("")}</optgroup>` : ""}`;
  }

  // Pulsanti degli stili: un clic e la scelta e' fatta (niente menu + "conferma").
  function styleChips(l, act, { current = null, rest = false, daykey = "" } = {}) {
    const inPool = DISC.filter((d) => l.pool.includes(d.id));
    const others = DISC.filter((d) => !l.pool.includes(d.id));
    const chip = (d) => `<button type="button" class="ma-chip" style="--ma-c:${d.color}" data-mact="${act}" data-disc="${d.id}" ${daykey ? `data-daykey="${daykey}"` : ""} aria-pressed="${d.id === current}"><strong>${esc(d.short || d.name)}</strong><span>Lv ${M.levelOf(l, d.id)}</span></button>`;
    return `<div class="ma-chips">${inPool.map(chip).join("")}${others.map(chip).join("")}${rest ? `<button type="button" class="ma-chip rest" data-mact="${act}" data-disc="" aria-pressed="${!current}"><strong>Riposo</strong><span>niente oggi</span></button>` : ""}</div>`;
  }

  /* -------------------------------------------------------------- render */
  function render(focus) {
    const box = $("defPanel-martial");
    if (!box || !M) return;
    if (!DISC.length) { box.innerHTML = `<p class="def-note">Discipline non caricate.</p>`; return; }
    const l = lab();
    const views = [["today", "Oggi"], ["week", "Settimana"], ["styles", "Stili"], ["lookism", "Lookism"], ["progress", "Progressi"]];
    const nav = `<div class="ma-nav" role="group" aria-label="Arti marziali">${views.map(([k, label]) => `<button type="button" data-mact="view" data-view="${k}" aria-pressed="${ui.view === k}">${label}${k === "today" && l.current ? ` <span class="ma-live" title="Allenamento in corso">●</span><span class="def-sr"> (allenamento in corso)</span>` : ""}</button>`).join("")}</div>`;
    let body = "";
    // dopo una ricarica: ritrova il riepilogo dell'ultima prova se manca la scelta del livello
    if (!ui.summary && !l.current) { const pend = M.pendingChoice(l); if (pend) ui.summary = pend; }
    if (ui.summary && !BY.get(ui.summary.disc)) ui.summary = null;
    if (l.current && !curLevel(l)) l.current = null;
    if (ui.view === "today") body = l.current ? (M.isStale(l) ? staleView(l) : sessionView(l)) : ui.summary ? summaryView(l) : todayView(l);
    else if (ui.view === "week") body = weekView(l);
    else if (ui.view === "styles") body = stylesView(l);
    else if (ui.view === "lookism") body = lookismView(l);
    else body = progressView(l);
    box.innerHTML = `
      <div class="ma-band">
        <div><span class="ma-band-title">Metodo Johan Seong</span><span class="ma-band-sub">Osserva, copia, ripeti, fallo tuo. Uno stile al giorno, un livello alla volta.</span></div>
        ${nav}
      </div>
      ${body}`;
    if (l.current && ui.view === "today" && !M.isStale(l)) paintTimer();
    ui.renderedAt = Date.now();
    if (focus) focusHeading(box.querySelector(".ma-body") || box);
  }

  /* -------------------------------------------- allenamento lasciato a meta' */
  function staleView(l) {
    const c = l.current;
    const d = BY.get(c.disc);
    const marked = Object.keys(c.results).length;
    return `
      <div class="ma-body">
        <article class="ma-today rest" style="--ma-c:${d.color}">
          <span class="def-kicker">Allenamento lasciato a metà</span>
          <h2 data-focus-title>${esc(d.name)} · Livello ${c.level}</h2>
          <p>L'hai iniziato ${esc(dayLabel(c.startedAt))} e hai segnato ${plural(marked, "esercizio", "esercizi")}. Puoi riprenderlo oggi (conterà per oggi) oppure lasciarlo perdere e fare l'allenamento previsto.</p>
          <div class="def-row">
            <button type="button" class="def-primary" data-mact="resume">Riprendi oggi</button>
            <button type="button" class="def-ghost" data-mact="discard">Lascia perdere</button>
          </div>
        </article>
      </div>`;
  }

  /* ---------------------------------------------------------------- Oggi */
  function exercisePreview(list) {
    return `<ol class="ma-preview">${list.map((e) => `
      <li><span class="ma-kind k-${e.kind}">${KIND[e.kind] || e.kind}</span><strong>${esc(e.name)}</strong><em>${esc(doseText(e.dose, e.kind))}</em></li>`).join("")}</ol>`;
  }

  function lookLine(disc) {
    const lk = lookFor(disc);
    return lk && lk.who ? `<p class="ma-look-line"><span>Lookism</span>${esc(lk.who)}</p>` : "";
  }

  function todayView(l) {
    const t = M.today(l, DISC);
    const now = Date.now();
    const doneToday = t.sessions.length > 0;
    const strip = weekStrip(l, t.week);
    if (!t.disc) {
      return `
        <div class="ma-body">
          <article class="ma-today rest">
            <span class="def-kicker">Oggi · ${esc(dayLabel(now))}</span>
            <h2 data-focus-title>Giorno di riposo</h2>
            <p>Il corpo impara anche quando recupera. Se vuoi muoverti, fai 10 minuti leggeri di mobilità oppure scegli uno stile qui sotto: l'allenamento parte subito.</p>
            <h3 class="ma-mini">Allenati comunque con</h3>
            ${styleChips(l, "start", { daykey: t.key })}
          </article>
          ${strip}
        </div>`;
    }
    const d = BY.get(t.disc);
    if (!d) return `<div class="ma-body"><p class="def-note">Lo stile previsto oggi non esiste più: sceglilo dal calendario.</p>${strip}</div>`;
    const level = M.levelOf(l, t.disc);
    const lv = levelData(t.disc, level);
    const n = lv.sessions.length;
    const next = M.stepOf(l, t.disc, n);
    const idx = ui.pick[t.disc] != null ? clamp(ui.pick[t.disc], 0, n - 1) : next;
    const s = sessionOf(lv, idx);
    const list = listOf(lv, idx);
    const last = t.sessions[t.sessions.length - 1];
    const picker = `<div class="ma-sesspick" role="group" aria-label="Sessione del livello ${level}">${lv.sessions.map((x, i) => `
      <button type="button" data-mact="pick-session" data-disc="${d.id}" data-index="${i}" aria-pressed="${i === idx}"><strong>${i + 1}. ${TYPE[x.type] || x.type}</strong><span>${i === next ? "la prossima" : x.type === "prova" ? "esame del livello" : "&nbsp;"}</span></button>`).join("")}</div>`;
    return `
      <div class="ma-body">
        <article class="ma-today" style="--ma-c:${d.color}">
          <div class="ma-today-main">
            <span class="def-kicker">Oggi · ${esc(dayLabel(now))}${doneToday ? " · fatto" : ""}</span>
            <h2 data-focus-title>${esc(d.name)} <span class="ma-lv">Livello ${level}: ${esc(lv.title)}</span></h2>
            <p class="ma-tagline">${esc(d.tagline)}</p>
            ${lookLine(d.id)}
            ${picker}
            <h3 class="ma-lv-title">${esc(s.title)}</h3>
            <p>${prose(s.focus)}</p>
            ${exercisePreview(list)}
            <p class="ma-motto">«${esc(mottoFor(t.disc))}»</p>
          </div>
          <div class="ma-today-side">
            ${copyRing(M.copyPercent(l, t.disc), d.color, 96)}
            <span class="ma-copy-label">stile copiato</span>
            <span class="ma-mins">circa ${M.sessionMinutes(list)} minuti · ${plural(list.length, "esercizio", "esercizi")}</span>
            ${doneToday ? `<p class="ma-done-note">Fatto oggi: ${last.done}/${last.total} riusciti.</p>` : ""}
            <button type="button" class="def-${doneToday ? "ghost" : "primary"}" data-mact="start" data-disc="${d.id}" data-session="${idx}" data-daykey="${t.key}">${doneToday ? "Allenati di nuovo" : s.type === "prova" ? "Inizia la prova" : "Inizia l'allenamento"}</button>
          </div>
        </article>
        ${doneToday ? "" : `
        <details class="ma-swapbox">
          <summary>Oggi preferisci un altro stile?</summary>
          <p class="def-note">Tocca uno stile: oggi diventa quello (il calendario si aggiorna da solo).</p>
          ${styleChips(l, "today-swap", { current: t.disc, rest: true })}
        </details>`}
        ${strip}
      </div>`;
  }

  function weekStrip(l, week) {
    const now = Date.now();
    const plan = planFor(l, week);
    const cells = M.WEEKDAYS.map((name, i) => {
      const id = plan.days[i];
      const st = M.dayStatus(l, week, i, now, plan);
      const d = id ? BY.get(id) : null;
      return `<li class="ma-strip-day s-${st}" ${d ? `style="--ma-c:${d.color}"` : ""}><span>${name}</span><strong>${d ? esc(d.short || d.name) : "—"}</strong><em>${{ done: "fatto", today: "oggi", missed: "saltato", planned: "", rest: "riposo" }[st]}</em></li>`;
    }).join("");
    return `<div class="ma-strip-wrap"><h3 class="def-section-title">Questa settimana</h3><ol class="ma-strip">${cells}</ol><button type="button" class="def-ghost" data-mact="view" data-view="week">Apri il calendario</button></div>`;
  }

  /* ---------------------------------------------------------- allenamento */
  function sessionView(l) {
    const c = l.current;
    const d = BY.get(c.disc);
    const lv = curLevel(l);
    const s = sessionOf(lv, c.session);
    const ex = curList(l);
    // dopo una ricarica si riparte dal primo esercizio ancora da segnare
    const sessionKey = `${c.disc}-${c.level}-${c.session}-${c.startedAt}`;
    if (ui.exFor !== sessionKey) {
      ui.exFor = sessionKey;
      const open = ex.findIndex((x) => c.results[x.id] === undefined);
      ui.ex = open >= 0 ? open : ex.length - 1;
    }
    ui.ex = clamp(ui.ex, 0, ex.length - 1);
    const e = ex[ui.ex];
    const marked = ex.filter((x) => c.results[x.id] !== undefined).length;
    const okCount = ex.filter((x) => c.results[x.id] === true).length;
    const target = e.prepFor ? ex.find((x) => x.id === e.prepFor) : null;
    const preps = ex.filter((x) => x.prepFor === e.id);
    const list = ex.map((x, i) => {
      const r = c.results[x.id];
      return `<li class="${i === ui.ex ? "now" : ""} ${r === true ? "ok" : r === false ? "no" : ""}"><button type="button" data-mact="goto" data-index="${i}"><span class="ma-dot" aria-hidden="true">${r === true ? "✓" : r === false ? "✗" : i + 1}</span><span>${esc(x.name)}</span><span class="def-sr">${r === true ? "riuscito" : r === false ? "non ancora" : "da fare"}</span></button></li>`;
    }).join("");
    const result = c.results[e.id];
    const last = lastResult(l, e.id);
    const video = `<a class="ma-video" href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.video)}" target="_blank" rel="noopener noreferrer">Guarda il video di riferimento<span class="def-sr"> (si apre in una nuova scheda)</span></a>`;
    const variants = [
      e.easier ? `<details class="ma-var easy"><summary>Troppo difficile? Versione più facile</summary><p>${prose(e.easier)}</p></details>` : "",
      e.harder ? `<details class="ma-var hard"><summary>Troppo facile? Versione più difficile</summary><p>${prose(e.harder)}</p></details>` : "",
      e.noBag ? `<details class="ma-var nobag"><summary>Non hai il sacco?</summary><p>${prose(e.noBag)}</p></details>` : ""
    ].join("");
    return `
      <div class="ma-body ma-session" style="--ma-c:${d.color}">
        <div class="ma-session-head">
          <div><span class="def-kicker">${esc(d.name)} · Livello ${c.level} · Sessione ${c.session + 1}: ${esc(TYPE[s.type] || s.type)}</span><h2>Esercizio ${ui.ex + 1} di ${ex.length}</h2></div>
          <div class="ma-session-tools">
            <span class="ma-count">${okCount} riusciti · ${marked}/${ex.length} segnati</span>
            <button type="button" class="def-ghost def-toggle" data-mact="toggle-voice" aria-pressed="${prefs().voice}">Voce</button>
            <button type="button" class="def-ghost def-toggle" data-mact="toggle-sound" aria-pressed="${prefs().sound}">Suoni</button>
            <button type="button" class="def-ghost" data-mact="cancel">Annulla</button>
          </div>
        </div>
        <div class="ma-session-grid">
          <ol class="ma-exlist">${list}</ol>
          <article class="ma-ex">
            <div class="ma-ex-top"><span class="ma-kind k-${e.kind}">${KIND[e.kind] || e.kind}</span><span class="ma-dose">${esc(doseText(e.dose, e.kind))}</span></div>
            <h3 data-focus-title>${esc(e.name)}</h3>
            ${last ? `<p class="ma-last ${last.ok ? "ok" : "no"}">L'ultima volta (${esc(new Date(last.t).toLocaleDateString("it-IT", { day: "numeric", month: "short" }))}): ${last.ok ? "riuscito" : "non ancora: oggi concentrati su questo"}</p>` : ""}
            ${e.goal ? `<p class="ma-goal">${prose(e.goal)}</p>` : ""}
            ${target ? `<p class="ma-prep">Prepara: <strong>${esc(target.name)}</strong></p>` : ""}
            ${preps.length ? `<p class="ma-prep">Prima fai: ${preps.map((p) => `<strong>${esc(p.name)}</strong>`).join(", ")}</p>` : ""}
            ${e.safety ? `<p class="ma-safety"><strong>Sicurezza</strong>${prose(e.safety)}</p>` : ""}
            ${timerMarkup(e)}
            ${e.watch ? `<div class="ma-watch"><strong>Osserva</strong><p>${prose(e.watch)}</p>${video}</div>` : ""}
            <p class="ma-how">${prose(e.how)}</p>
            <h4 class="ma-sub">Come si fa</h4>
            <ol class="def-steps">${e.steps.map((x) => `<li>${prose(x)}</li>`).join("")}</ol>
            <h4 class="ma-sub">Punti chiave</h4>
            <ul class="def-keys">${e.cues.map((x) => `<li>${prose(x)}</li>`).join("")}</ul>
            ${e.errors && e.errors.length ? `<div class="ma-errors"><h4 class="ma-sub">Errori tipici</h4><ul>${e.errors.map((x) => `<li><strong>${prose(x.e)}</strong><span>${prose(x.fix)}</span></li>`).join("")}</ul></div>` : ""}
            <div class="ma-success"><strong>Quando è riuscito</strong><p>${prose(capital(String(e.success).replace(/^Riuscito se:\s*/, "")))}</p></div>
            ${e.lookism ? `<p class="ma-look"><span>Lookism</span>${prose(e.lookism)}</p>` : ""}
            ${variants ? `<div class="ma-vars">${variants}</div>` : ""}
            ${e.watch ? "" : video}
            <div class="ma-result" role="group" aria-label="Com'è andata">
              <button type="button" class="ma-res ok" data-mact="result" data-v="1" aria-pressed="${result === true}">Riuscito</button>
              <button type="button" class="ma-res no" data-mact="result" data-v="0" aria-pressed="${result === false}">Non ancora</button>
            </div>
            <div class="def-row ma-ex-nav">
              ${ui.ex > 0 ? `<button type="button" class="def-ghost" data-mact="goto" data-index="${ui.ex - 1}">‹ Precedente</button>` : ""}
              ${ui.ex < ex.length - 1 ? `<button type="button" class="def-ghost" data-mact="goto" data-index="${ui.ex + 1}">Successivo ›</button>` : ""}
              <button type="button" class="def-primary" data-mact="finish" ${marked === ex.length ? "" : "disabled"}>Concludi l'allenamento</button>
              ${marked === ex.length ? "" : `<span class="def-note">Segna tutti gli esercizi per concludere.</span>`}
            </div>
          </article>
        </div>
      </div>`;
  }

  /* --------------------------------------------------------------- timer */
  function phasesFor(e) {
    const d = e.dose || {};
    const out = [];
    const sets = d.sets || 1;
    for (let s = 1; s <= sets; s += 1) {
      const sides = d.perSide ? ["lato sinistro", "lato destro"] : [""];
      const task = Array.isArray(d.tasks) ? d.tasks[s - 1] || "" : "";
      sides.forEach((side, si) => {
        if (d.work != null) out.push({ type: "work", secs: d.work, set: s, side, task });
        else out.push({ type: "reps", reps: d.reps, set: s, side, task });
        if (si === 0 && sides.length > 1) out.push({ type: "switch", secs: 5, set: s, side: "cambia lato" });
      });
      if (s < sets && d.rest) out.push({ type: "rest", secs: d.rest, set: s, task: Array.isArray(d.tasks) ? d.tasks[s] || "" : "" });
    }
    return out;
  }

  function ensureTimer(e) {
    if (ui.timer && ui.timer.exId === e.id) return ui.timer;
    stopTimer();
    const signalable = ["shadow", "combinazione", "sacco"].includes(e.kind) && (e.dose || {}).work != null;
    ui.timer = { exId: e.id, phases: phasesFor(e), i: 0, left: 0, running: false, endsAt: 0, tick: null, sets: (e.dose || {}).sets || 1, finished: false, signalable, nextSignal: 0, rounds: ["shadow", "sacco"].includes(e.kind) };
    const p = ui.timer.phases[0];
    ui.timer.left = p.secs || 0;
    return ui.timer;
  }

  function timerMarkup(e) {
    ensureTimer(e);
    return `
      <div class="ma-timer" id="maTimer">
        <div class="ma-timer-top"><span id="maTimerPhase"></span><span class="ma-sets" id="maTimerSets"></span></div>
        <div class="ma-timer-clock" id="maTimerClock" aria-hidden="true"></div>
        <p class="ma-task" id="maTimerTask" hidden></p>
        <div class="def-clockbar"><i id="maTimerBar"></i></div>
        <div class="def-row" id="maTimerCtrl"></div>
      </div>`;
  }

  function paintTimer() {
    const t = ui.timer;
    if (!t) return;
    const p = t.phases[Math.min(t.i, t.phases.length - 1)];
    const phase = $("maTimerPhase");
    const clock = $("maTimerClock");
    const bar = $("maTimerBar");
    const ctrl = $("maTimerCtrl");
    const sets = $("maTimerSets");
    const task = $("maTimerTask");
    if (!phase || !clock || !ctrl) return;
    const box = $("maTimer");
    if (box) box.className = `ma-timer ${t.finished ? "finished" : p.type}${box.classList.contains("signal") ? " signal" : ""}`;
    if (sets) sets.innerHTML = Array.from({ length: t.sets }, (_, i) => `<i class="${i + 1 < p.set || t.finished ? "done" : i + 1 === p.set ? "now" : ""}"></i>`).join("");
    // i pulsanti si ricreano solo quando cambia lo stato (fase, avviato/in pausa): clic e focus non si perdono
    const key = `${t.i}|${t.running}|${t.finished}|${p.type}|${prefs().signals}`;
    const rebuild = t.ctrlKey !== key || !ctrl.firstChild;
    if (rebuild) {
      const hadFocus = ctrl.contains(document.activeElement) ? document.activeElement.dataset.mact : null;
      t.ctrlKey = key;
      ctrl.innerHTML = controlsFor(t, p);
      if (hadFocus) {
        const map = { "timer-start": "timer-pause", "timer-pause": "timer-start" };
        const again = ctrl.querySelector(`[data-mact="${hadFocus}"]`) || ctrl.querySelector(`[data-mact="${map[hadFocus] || ""}"]`) || ctrl.querySelector("button");
        if (again) again.focus({ preventScroll: true });
      }
    }
    if (task) {
      const text = t.finished ? "" : p.type === "rest" && p.task ? `Prossimo round: ${p.task}` : p.task || "";
      if (task.textContent !== text) task.textContent = text;
      task.hidden = !text;
    }
    const unit = t.rounds ? "Round" : "Serie";
    if (t.finished) {
      phase.textContent = "Esercizio finito";
      clock.textContent = "Fatto";
      if (bar) bar.style.width = "100%";
      return;
    }
    const sideTxt = p.side ? ` · ${p.side}` : "";
    if (p.type === "reps") {
      phase.textContent = `${unit} ${p.set} di ${t.sets}${sideTxt}`;
      clock.textContent = `${p.reps} rip.`;
      if (bar) bar.style.width = "100%";
      return;
    }
    phase.textContent = p.type === "rest" ? `Recupero · poi ${unit.toLowerCase()} ${p.set + 1}` : p.type === "switch" ? "Cambia lato" : `${unit} ${p.set} di ${t.sets}${sideTxt}`;
    clock.textContent = mmss(t.left);
    if (bar) bar.style.width = `${clamp((t.left / p.secs) * 100, 0, 100)}%`;
  }

  function controlsFor(t, p) {
    if (t.finished) return `<button type="button" class="def-ghost" data-mact="timer-reset">Ricomincia</button><span class="def-note">Ora segna com'è andata.</span>`;
    if (p.type === "reps") return `<button type="button" class="def-primary" data-mact="timer-done">${t.rounds ? "Round fatto" : "Serie fatta"}</button><button type="button" class="def-ghost" data-mact="timer-reset">Ricomincia</button>`;
    return `${t.running ? `<button type="button" class="def-primary" data-mact="timer-pause">Pausa</button>` : `<button type="button" class="def-primary" data-mact="timer-start">${t.i === 0 && t.left === p.secs ? "Avvia" : "Riprendi"}</button>`}
      <button type="button" class="def-ghost" data-mact="timer-skip">${p.type === "work" ? (t.rounds ? "Fine round" : "Fine serie") : "Salta"}</button>
      <button type="button" class="def-ghost" data-mact="timer-reset">Ricomincia</button>
      ${t.signalable ? `<button type="button" class="def-ghost def-toggle" data-mact="timer-signals" aria-pressed="${!!prefs().signals}" title="Durante il round un segnale a caso: scatta con la tecnica">Segnali casuali</button>` : ""}`;
  }

  function timerStart() {
    const t = ui.timer;
    if (!t || t.finished) return;
    const p = t.phases[t.i];
    if (!p.secs) return;
    const fresh = t.left === p.secs;
    t.running = true;
    t.endsAt = performance.now() + t.left * 1000;
    t.nextSignal = performance.now() + 2500 + Math.random() * 3000;
    if (p.type === "work" && fresh) {
      beep(880, 120);
      if (p.task) speak(`${t.rounds ? "Round" : "Serie"} ${p.set}. ${p.task}`);
      else speak(p.side ? `Via, ${p.side}` : "Via");
    }
    clearInterval(t.tick);
    t.tick = setInterval(timerTick, 200);
    paintTimer();
  }

  function timerPause() {
    const t = ui.timer;
    if (!t) return;
    t.running = false;
    clearInterval(t.tick);
    paintTimer();
  }

  function timerTick() {
    const t = ui.timer;
    if (!t || !t.running) return;
    const prev = Math.ceil(t.left);
    t.left = (t.endsAt - performance.now()) / 1000;
    const whole = Math.ceil(t.left);
    if (whole !== prev && whole <= 3 && whole > 0) beep(740, 60, 0.05);
    // segnali casuali nello shadow: allenano a partire al momento giusto
    const p = t.phases[t.i];
    if (t.signalable && prefs().signals && p && p.type === "work" && performance.now() >= t.nextSignal && t.left > 1.5) {
      beep(1250, 90, 0.1);
      const box = $("maTimer");
      if (box) {
        box.classList.remove("signal");
        void box.offsetWidth;
        box.classList.add("signal");
        clearTimeout(t.signalOff);
        t.signalOff = setTimeout(() => { const b = $("maTimer"); if (b) b.classList.remove("signal"); }, 450);
      }
      t.nextSignal = performance.now() + 2500 + Math.random() * 3500;
    }
    if (t.left <= 0) nextPhase(true);
    else paintTimer();
  }

  // Passa alla fase successiva; le fasi a tempo partono da sole, le serie a ripetizioni aspettano "Serie fatta".
  function nextPhase(auto) {
    const t = ui.timer;
    if (!t) return;
    clearInterval(t.tick);
    t.running = false;
    t.i += 1;
    if (t.i >= t.phases.length) {
      t.finished = true;
      beep(523, 380, 0.09);
      speak("Esercizio finito");
      announce("Esercizio finito: segna com'è andata");
      paintTimer();
      return;
    }
    const p = t.phases[t.i];
    t.left = p.secs || 0;
    const unit = t.rounds ? "Round" : "Serie";
    if (p.type === "rest") { beep(523, 260, 0.07); speak(p.task ? `Recupero. Poi: ${p.task}` : "Recupero"); announce(`Recupero ${p.secs} secondi${p.task ? `. Prossimo round: ${p.task}` : ""}`); }
    if (p.type === "switch") { beep(660, 160, 0.06); speak("Cambia lato"); announce("Cambia lato"); }
    if (p.type === "work" || p.type === "reps") announce(`${unit} ${p.set} di ${t.sets}${p.side ? `, ${p.side}` : ""}${p.task ? `: ${p.task}` : ""}`);
    if (p.secs && (auto || p.type !== "work")) timerStart();
    else paintTimer();
    if (p.type === "reps") speak(p.task ? `${unit} ${p.set}. ${p.task}` : `${unit} ${p.set}`);
  }

  function stopTimer() {
    if (ui.timer && ui.timer.tick) clearInterval(ui.timer.tick);
    if (ui.timer) clearTimeout(ui.timer.signalOff);
    ui.timer = null;
  }

  /* ------------------------------------------------------------ riepilogo */
  function summaryView(l) {
    const s = ui.summary;
    const d = BY.get(s.disc);
    const lv = levelData(s.disc, s.level);
    const sess = s.session != null ? sessionOf(lv, s.session) : null;
    const list = s.session != null ? listOf(lv, s.session) : [];
    const choice = s.levelUp;
    const nextLv = Math.min(M.MAX_LEVEL, s.level + 1);
    const alreadyMastered = s.atMax && l.mastered[s.disc];
    const nextIdx = M.stepOf(l, s.disc, lv.sessions.length);
    const nextSess = sessionOf(lv, nextIdx);
    let decide;
    if ((choice === null || choice === undefined) && alreadyMastered) {
      decide = `
        <p class="ma-reco up">Questo stile l'hai già copiato al 100%: ripeterlo lo mantiene pulito.</p>
        <div class="def-row"><button type="button" class="def-primary" data-mact="level" data-up="0">Fatto</button></div>`;
    } else if ((choice === null || choice === undefined) && s.isTest) {
      decide = `
        <p class="ma-reco ${s.recommend ? "up" : "stay"}">${s.recommend ? `Prova superata: ${s.done} su ${s.total}. ${s.atMax ? "Puoi dichiarare lo stile copiato al 100%." : `Ti consiglio di salire al livello ${nextLv}.`}` : `Prova: ${s.done} su ${s.total}. Per superarla ne servono almeno ${Math.ceil(s.total * M.RECOMMEND)}. Ti consiglio di restare al livello ${s.level}, ripassare con le sessioni Impara e Ripeti e rifarla: decidi tu.`}</p>
        <div class="def-row">
          <button type="button" class="def-${s.recommend ? "primary" : "ghost"}" data-mact="level" data-up="1">${s.atMax ? "Stile copiato al 100%" : `Sali al livello ${nextLv}`}</button>
          <button type="button" class="def-${s.recommend ? "ghost" : "primary"}" data-mact="level" data-up="0">${s.atMax ? "Continua a ripeterlo" : `Resta al livello ${s.level}`}</button>
        </div>`;
    } else if (choice === null || choice === undefined) {
      decide = `
        <p class="ma-reco stay">La prossima volta di ${esc(d.name)}: sessione ${nextIdx + 1}, ${esc(TYPE[nextSess.type] || "")} · ${esc(nextSess.title)}.${nextSess.type === "prova" ? " È l'esame del livello: dopo, decidi tu se salire." : ""}</p>
        <div class="def-row">
          <button type="button" class="def-primary" data-mact="level" data-up="0">Va bene</button>
          <button type="button" class="def-ghost" data-mact="level" data-up="1">${s.atMax ? "Dichiara lo stile copiato al 100%" : `Sali subito al livello ${nextLv}`}</button>
        </div>`;
    } else {
      decide = `
        <p class="ma-reco up">${choice ? (s.atMax ? `${esc(d.name)}: stile copiato al 100%.` : `Livello ${nextLv} sbloccato: la prossima volta di ${esc(d.name)} parti dalla sessione Impara del livello ${nextLv}.`) : s.isTest ? `Resti al livello ${s.level}: la prossima volta di ${esc(d.name)} ripassi dalla sessione Impara.` : `La prossima volta di ${esc(d.name)}: sessione ${nextIdx + 1}, ${esc(TYPE[nextSess.type] || "")}.`}</p>
        <div class="def-row"><button type="button" class="def-primary" data-mact="close-summary">Torna a oggi</button><button type="button" class="def-ghost" data-mact="view" data-view="progress">Vedi i progressi</button></div>`;
    }
    const kind = s.isTest ? "Prova del livello" : sess ? `Sessione ${s.session + 1}: ${TYPE[sess.type] || ""}` : "Allenamento";
    return `
      <div class="ma-body">
        <article class="ma-summary" style="--ma-c:${d.color}">
          <div class="ma-summary-score"><strong>${s.done}/${s.total}</strong><span>riusciti</span></div>
          <div>
            <span class="def-kicker">${esc(d.name)} · Livello ${s.level} · ${esc(kind)}</span>
            <h2 data-focus-title>${s.isTest ? "Prova finita." : "Allenamento finito."}</h2>
            ${list.length ? `<ul class="ma-sum-list">${list.map((e) => `<li class="${s.results[e.id] ? "ok" : "no"}"><span>${s.results[e.id] ? "✓" : "✗"}</span>${esc(e.name)}</li>`).join("")}</ul>` : ""}
            ${decide}
          </div>
        </article>
      </div>`;
  }

  /* ------------------------------------------------------------ settimana */
  function weekView(l) {
    const now = Date.now();
    const week = ui.week || M.weekKey(now);
    const isCurrent = week === M.weekKey(now);
    const isPast = week < M.weekKey(now);
    const plan = planFor(l, week);
    const isPreview = !!plan.preview;
    const start = new Date(M.weekStart(week));
    const days = M.WEEKDAYS.map((name, i) => {
      const t = M.dayTime(week, i);
      const id = plan.days[i] || null;
      const d = id ? BY.get(id) : null;
      const st = M.dayStatus(l, week, i, now, plan);
      const sess = M.sessionsOn(l, week, i);
      const last = sess[sess.length - 1];
      const dayPast = t < new Date(now).setHours(0, 0, 0, 0);
      const locked = sess.length > 0 || isPast || dayPast;
      return `
        <li class="ma-day s-${st}" ${d ? `style="--ma-c:${d.color}"` : ""}>
          <div class="ma-day-head"><strong>${name}</strong><span>${new Date(t).getDate()}</span></div>
          <div class="ma-day-body">
            ${d ? `<span class="ma-day-disc">${esc(d.name)}</span><span class="ma-day-lv">Lv ${last ? last.level : M.levelOf(l, d.id)}</span>` : `<span class="ma-day-disc rest">Riposo</span>`}
            <span class="ma-day-st">${st === "done" ? `fatto ${last.done}/${last.total}${last.levelUp ? " · salito" : ""}` : st === "today" ? "oggi" : st === "missed" ? "saltato" : st === "planned" ? "da fare" : ""}</span>
          </div>
          ${locked ? "" : `<select data-mact-change="day" data-day="${i}" aria-label="${M.WEEKDAYS_LONG[i]} ${new Date(t).getDate()}: stile">${discOptions(id, true)}</select>`}
        </li>`;
    }).join("");
    const wp = M.weekProgress(l, week);
    const planned = isPreview ? Object.keys(plan.days).length : wp.planned;
    return `
      <div class="ma-body">
        <div class="ma-week-head">
          <button type="button" class="def-ghost" data-mact="week" data-delta="-1" aria-label="Settimana precedente">‹</button>
          <div><h2 data-focus-title>Settimana del ${start.getDate()} ${start.toLocaleDateString("it-IT", { month: "long" })}</h2><span class="def-note">${isPreview ? `anteprima: ${plural(planned, "allenamento previsto", "allenamenti previsti")}, si fissa quando la settimana arriva o quando cambi un giorno` : `${wp.done}/${planned} allenamenti fatti${isCurrent ? " · settimana in corso" : ""}`}</span></div>
          <button type="button" class="def-ghost" data-mact="week" data-delta="1" aria-label="Settimana successiva">›</button>
          ${isCurrent ? "" : `<button type="button" class="def-ghost" data-mact="week" data-delta="0">Questa settimana</button>`}
        </div>
        <ol class="ma-week">${days}</ol>
        <div class="ma-week-settings">
          <div>
            <h3>Giorni di allenamento</h3>
            <p class="def-note">Di base 5 giorni. Gli stili cambiano ogni settimana: prima quelli che non fai da più tempo. Ogni giorno lo puoi cambiare dal suo menu (vale subito). Cambiare i giorni vale da oggi in poi.</p>
            <div class="ma-daypick" role="group" aria-label="Giorni di allenamento">${M.WEEKDAYS.map((n, i) => `<button type="button" data-mact="trainday" data-day="${i}" aria-pressed="${l.trainDays.includes(i)}">${n}</button>`).join("")}</div>
          </div>
        </div>
      </div>`;
  }

  /* ---------------------------------------------------------------- stili */
  function stylesView(l) {
    const st = M.stats(l, DISC);
    if (ui.open && BY.get(ui.open)) return styleDetail(l, BY.get(ui.open), st.per[ui.open]);
    const cards = DISC.map((d) => {
      const p = st.per[d.id];
      const lk = lookFor(d.id);
      return `
        <article class="ma-style" style="--ma-c:${d.color}">
          <header>${copyRing(p.copy, d.color, 58)}<div><h3>${esc(d.name)}</h3><span>Livello ${p.level} di ${M.MAX_LEVEL}</span></div></header>
          <p>${esc(d.tagline)}</p>
          ${lk && lk.who ? `<p class="ma-style-look"><span>Lookism</span>${esc(lk.who)}</p>` : ""}
          <div class="ma-style-meta"><span>${plural(p.sessions, "allenamento", "allenamenti")}${p.rate != null ? ` · ${p.rate}% riusciti` : ""}${p.tests ? ` · ${plural(p.tests, "prova superata", "prove superate")}` : ""}</span></div>
          <div class="def-row">
            <button type="button" class="def-ghost" data-mact="open-style" data-disc="${d.id}">Livelli ed esercizi</button>
            <label class="ma-check"><input type="checkbox" data-mact-change="pool" data-disc="${d.id}" ${p.inPool ? "checked" : ""}> Nella rotazione</label>
          </div>
        </article>`;
    }).join("");
    return `
      <div class="ma-body">
        <h2 class="ma-h2" data-focus-title>Gli stili da copiare</h2>
        <p class="def-section-sub">${plural(DISC.length, "disciplina", "discipline")}, sei livelli ciascuna, tre sessioni per livello: impara, ripeti, prova. Togli dalla rotazione quelle che non vuoi nel calendario: restano comunque disponibili.</p>
        <div class="ma-styles">${cards}</div>
      </div>`;
  }

  function lookCard(disc) {
    const lk = lookFor(disc);
    if (!lk) return "";
    return `<aside class="ma-lookcard"><span class="ma-lookcard-k">In Lookism</span><h3>${esc(lk.who)}</h3><p>${prose(lk.text)}</p>${lk.copy ? `<p class="ma-lookcard-copy"><strong>Cosa copiare</strong>${prose(lk.copy)}</p>` : ""}</aside>`;
  }

  function styleDetail(l, d, p) {
    const levels = d.levels.map((lv) => {
      const cls = lv.level === p.level ? "now" : lv.level < p.level || (lv.level === p.level && l.mastered[d.id]) ? "past" : "";
      const sess = lv.sessions.map((s, i) => {
        const list = listOf(lv, i);
        return `<details class="ma-lvl-sess"${lv.level === p.level && i === p.step ? " open" : ""}>
          <summary><span class="ma-sess-n">${i + 1}</span><strong>${esc(TYPE[s.type] || s.type)}: ${esc(s.title)}</strong><em>${plural(list.length, "esercizio", "esercizi")} · circa ${M.sessionMinutes(list)} min${lv.level === p.level && i === p.step ? " · la prossima" : ""}</em></summary>
          <p>${prose(s.focus)}</p>
          <ol>${list.map((e) => `<li><span class="ma-kind k-${e.kind}">${KIND[e.kind] || e.kind}</span>${esc(e.name)}<em>${esc(doseText(e.dose, e.kind))}</em></li>`).join("")}</ol>
        </details>`;
      }).join("");
      return `
      <li class="${cls}">
        <div class="ma-lvl-head"><span class="ma-lvl-n">${lv.level}</span><div><strong>${esc(lv.title)}</strong><p>${prose(lv.goal)}</p></div></div>
        ${lv.techniques && lv.techniques.length ? `<ul class="ma-tech">${lv.techniques.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        <div class="ma-lvl-sessions">${sess}</div>
      </li>`;
    }).join("");
    return `
      <div class="ma-body" style="--ma-c:${d.color}">
        <div class="def-back-row"><button type="button" class="def-ghost" data-mact="close-style">← Stili</button></div>
        <article class="ma-style-detail">
          <header>${copyRing(p.copy, d.color, 88)}<div><span class="def-kicker">Livello ${p.level} di ${M.MAX_LEVEL}${p.tests ? ` · ${plural(p.tests, "prova superata", "prove superate")}` : ""}</span><h2 data-focus-title>${esc(d.name)}</h2><p>${esc(d.tagline)}</p></div></header>
          <p class="ma-intro">${prose(d.intro)}</p>
          <div class="ma-facts">
            ${d.origin ? `<div><h3>Da dove viene</h3><p>${prose(d.origin)}</p></div>` : ""}
            ${d.method ? `<div><h3>Come si allena</h3><p>${prose(d.method)}</p></div>` : ""}
          </div>
          ${lookCard(d.id)}
          <p class="def-note">Attrezzatura: ${esc(d.equipment)}</p>
          <ul class="ma-mottos">${d.mottos.map((m) => `<li>«${esc(m)}»</li>`).join("")}</ul>
          <div class="ma-detail-actions">
            <button type="button" class="def-primary" data-mact="start" data-disc="${d.id}" data-confirm="${l.current ? "1" : ""}">${l.current ? "Allenati ora (chiude quello in corso)" : "Allenati ora con questo stile"}</button>
            <div class="ma-lvpick-wrap"><span id="maLvPickLabel">Livello attuale (tocca per cambiarlo)</span><div class="ma-lvpick" role="group" aria-labelledby="maLvPickLabel">${Array.from({ length: M.MAX_LEVEL }, (_, i) => `<button type="button" data-mact="set-level" data-disc="${d.id}" data-level="${i + 1}" aria-pressed="${i + 1 === p.level}" aria-label="Livello ${i + 1}">${i + 1}</button>`).join("")}</div></div>
          </div>
        </article>
        <ol class="ma-levels">${levels}</ol>
      </div>`;
  }

  /* -------------------------------------------------------------- Lookism */
  function lookismView(l) {
    if (!LOOK) return `<div class="ma-body"><p class="def-note">Riferimenti Lookism non caricati.</p></div>`;
    const r = rankOf(l);
    const steps = (LOOK.method || []).map((s) => `<li><strong>${esc(s.title)}</strong><p>${prose(s.text)}</p></li>`).join("");
    const roster = (LOOK.roster || []).map((c) => {
      const styles = (c.styles || []).filter((id) => BY.get(id));
      return `<article class="ma-char">
        <h3>${esc(c.name)}</h3>
        <span class="ma-char-style">${esc(c.style)}</span>
        <p>${prose(c.note)}</p>
        ${c.copy ? `<p class="ma-char-copy"><strong>Cosa copiare</strong>${prose(c.copy)}</p>` : ""}
        ${styles.length ? `<div class="def-row">${styles.map((id) => `<button type="button" class="def-ghost" data-mact="open-style" data-disc="${id}" style="--ma-c:${BY.get(id).color}">Apri ${esc(BY.get(id).name)}</button>`).join("")}</div>` : ""}
      </article>`;
    }).join("");
    const facts = (LOOK.johan || []).map((f) => `<li>${prose(f)}</li>`).join("");
    return `
      <div class="ma-body">
        <h2 class="ma-h2" data-focus-title>Il metodo di Johan Seong</h2>
        <p class="ma-intro">${prose(LOOK.intro)}</p>
        ${r ? `<div class="ma-rank">
          <div><span class="def-kicker">Il tuo rango</span><strong>${esc(r.rank.name)}</strong><p>${prose(r.rank.text)}</p></div>
          <div class="ma-rank-bar"><div class="ma-bar"><i style="width:${r.pct}%;--ma-c:var(--d-amber)"></i></div><span>${r.pct}% di tutti gli stili copiato${r.next ? ` · prossimo rango a ${r.next.min}%: ${esc(r.next.name)}` : ""}</span></div>
        </div>` : ""}
        <h3 class="def-section-title">Come copia Johan, come copi tu</h3>
        <ol class="ma-method">${steps}</ol>
        <h3 class="def-section-title">Chi usa cosa in Lookism</h3>
        <p class="def-section-sub">Solo fatti dal webtoon, niente immagini dei personaggi. Per ognuno: cosa copiare davvero, in palestra.</p>
        <div class="ma-roster">${roster}</div>
        ${facts ? `<article class="def-pcard ma-facts-card"><h3>Johan Seong in breve</h3><ul class="def-keys">${facts}</ul></article>` : ""}
      </div>`;
  }

  /* ------------------------------------------------------------ progressi */
  function progressView(l) {
    const st = M.stats(l, DISC);
    const thisWeek = st.weeks[0];
    const bars = DISC.map((d) => {
      const p = st.per[d.id];
      return `<li style="--ma-c:${d.color}"><span>${esc(d.short || d.name)}</span><div class="ma-bar"><i style="width:${p.copy}%"></i></div><em>Lv ${p.level} · ${p.copy}%${p.tests ? ` · ${plural(p.tests, "prova", "prove")}` : ""}</em></li>`;
    }).join("");
    const heat = st.weeks.map((w) => {
      const start = new Date(M.weekStart(w.week));
      return `<tr><th scope="row">${start.getDate()}/${start.getMonth() + 1}</th>${w.days.map((x) => {
        const d = x.disc ? BY.get(x.disc) : null;
        const label = `${M.WEEKDAYS_LONG[x.day]}: ${d ? d.name : "riposo"}, ${{ done: "fatto", today: "oggi", missed: "saltato", planned: "da fare", rest: "riposo" }[x.status]}`;
        return `<td><span class="ma-cell c-${x.status}" ${d ? `style="--ma-c:${d.color}"` : ""} title="${esc(label)}"><span class="def-sr">${esc(label)}</span></span></td>`;
      }).join("")}</tr>`;
    }).join("");
    const hist = l.history.slice(-10).reverse().map((h) => {
      const d = BY.get(h.disc);
      return `<li><em>${new Date(h.t).toLocaleDateString("it-IT", { day: "numeric", month: "short" })}</em><span>${esc(d ? d.name : h.disc)}: ${h.mastered ? "copiato al 100%" : `livello ${h.from} → ${h.to}`}${h.manual ? " (a mano)" : ""}</span></li>`;
    }).join("");
    const recent = l.sessions.slice(-12).reverse().map((s) => {
      const d = BY.get(s.disc);
      const kind = s.test === true ? "prova" : s.session != null ? `sessione ${s.session + 1}` : "";
      return `<li style="--ma-c:${d ? d.color : "#888"}"><em>${new Date(s.t).toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })}</em><span>${esc(d ? d.name : s.disc)} · Lv ${s.level}${kind ? ` · ${kind}` : ""}</span><strong>${s.done}/${s.total}</strong><span class="ma-up">${s.levelUp ? "salito" : ""}</span></li>`;
    }).join("");
    return `
      <div class="ma-body">
        <h2 class="ma-h2" data-focus-title>Progressi</h2>
        <div class="ma-tiles">
          <div><strong>${thisWeek.done}/${thisWeek.planned}</strong><span>questa settimana</span></div>
          <div><strong>${st.streak}</strong><span>${st.streak === 1 ? "settimana completa di fila" : "settimane complete di fila"}</span></div>
          <div><strong>${st.sessions}</strong><span>${st.sessions === 1 ? "allenamento in tutto" : "allenamenti in tutto"}</span></div>
          <div><strong>${st.minutes < 120 ? st.minutes : (Math.round(st.minutes / 6) / 10).toLocaleString("it-IT")}</strong><span>${st.minutes < 120 ? "minuti di allenamento" : "ore di allenamento"}</span></div>
        </div>
        <div class="ma-prog-grid">
          <article class="def-pcard"><h3>Quanto hai copiato di ogni stile</h3><ul class="ma-bars">${bars}</ul></article>
          <article class="def-pcard"><h3>Ultime 8 settimane</h3>
            <table class="ma-heat"><thead><tr><td></td>${M.WEEKDAYS.map((n) => `<th scope="col">${n[0]}</th>`).join("")}</tr></thead><tbody>${heat}</tbody></table>
            <p class="def-note ma-legend"><span class="ma-cell c-done" style="--ma-c:#f0a93a"></span> fatto <span class="ma-cell c-missed"></span> saltato <span class="ma-cell c-planned"></span> da fare</p>
          </article>
          <article class="def-pcard"><h3>Livelli</h3>${hist ? `<ul class="def-recent">${hist}</ul>` : `<p class="def-note">Ancora nessun cambio di livello.</p>`}</article>
          <article class="def-pcard"><h3>Ultimi allenamenti</h3>${recent ? `<ul class="ma-recent">${recent}</ul>` : `<p class="def-note">Ancora nessun allenamento.</p>`}</article>
        </div>
      </div>`;
  }

  /* --------------------------------------------------------------- azioni */
  function startDisc(disc, session) {
    if (!BY.get(disc)) return;
    stopTimer();
    const l = lab();
    const lv = levelData(disc, M.levelOf(l, disc));
    const n = lv.sessions.length;
    const idx = Number.isInteger(session) ? clamp(session, 0, n - 1) : M.stepOf(l, disc, n);
    M.startSession(l, disc, { session: idx });
    delete ui.pick[disc];
    ui.exFor = null;
    ui.summary = null;
    ui.view = "today";
    save();
    render(true);
    scrollTop();
    beep(660, 90);
    speak(`${BY.get(disc).name}. ${sessionOf(lv, idx).type === "prova" ? "Prova del livello" : `Sessione ${idx + 1}`}`);
  }

  // Pulsanti con conferma in due tempi (la seconda pressione vale solo dopo 400 ms).
  function confirmTwice(el, label, original) {
    const armedAt = Number(el.dataset.armed || 0);
    if (armedAt && Date.now() - armedAt >= 400) return true;
    if (!armedAt) {
      el.dataset.armed = String(Date.now());
      el.textContent = label;
      setTimeout(() => { if (el.isConnected) { delete el.dataset.armed; el.textContent = original; } }, 3000);
    }
    return false;
  }

  // Se la pagina e' rimasta aperta oltre la mezzanotte, prima si aggiorna "Oggi".
  function staleDay(el) {
    if (el.dataset.daykey && el.dataset.daykey !== M.dayKeyOf(Date.now())) {
      render(true);
      announce("È un nuovo giorno: ho aggiornato l'allenamento di oggi");
      return true;
    }
    return false;
  }

  function focusAct(selector) {
    const b = $("defPanel-martial").querySelector(selector);
    if (b) b.focus({ preventScroll: true });
    return !!b;
  }

  // Contro i doppi clic: un'azione dello stesso gruppo vale solo se sono passati almeno 350 ms
  // dall'ultima (un doppio clic arriva in 100-250 ms; un tocco voluto sul nuovo esercizio dopo).
  const GROUPS = {
    flow: ["result", "finish", "level", "start", "cancel", "resume", "discard", "today-swap", "set-level", "pick-session"],
    timer: ["timer-start", "timer-pause", "timer-skip", "timer-done"]
  };
  function tooSoon(act) {
    const group = Object.keys(GROUPS).find((g) => GROUPS[g].includes(act));
    if (!group) return false;
    const now = Date.now();
    if (now - (ui.guard[group] || 0) < 350) return true;
    ui.guard[group] = now;
    return false;
  }

  function onClick(event) {
    const el = event.target.closest("[data-mact]");
    if (!el || !$("defPanel-martial").contains(el) || el.tagName === "SELECT" || el.tagName === "INPUT") return;
    const act = el.dataset.mact;
    if (tooSoon(act)) return;
    const l = lab();
    switch (act) {
      case "view":
        if (ui.view === "today" && el.dataset.view !== "today" && ui.timer && ui.timer.running) timerPause();
        ui.view = el.dataset.view;
        if (ui.view !== "styles") ui.open = null;
        render(true);
        break;
      case "start":
        if (staleDay(el)) break;
        if (el.dataset.confirm && !confirmTwice(el, "Conferma: chiudi quello in corso", el.textContent)) { ui.guard.flow = 0; break; }
        startDisc(el.dataset.disc, el.dataset.session != null ? Number(el.dataset.session) : undefined);
        break;
      case "pick-session":
        ui.pick[el.dataset.disc] = Number(el.dataset.index);
        render(false);
        focusAct(`[data-mact="pick-session"][data-index="${el.dataset.index}"]`);
        announce(`Sessione ${Number(el.dataset.index) + 1} scelta`);
        break;
      case "today-swap": {
        const t = M.today(l, DISC);
        const disc = el.dataset.disc || null;
        M.setDay(l, t.week, t.day, disc, DISC);
        save();
        render(false);
        announce(disc ? `Oggi: ${BY.get(disc).name}` : "Oggi riposo");
        focusHeading($("defPanel-martial").querySelector(".ma-body"));
        break;
      }
      case "resume":
        M.resumeToday(l);
        ui.exFor = null;
        save();
        render(true);
        break;
      case "discard":
        stopTimer();
        l.current = null;
        save();
        render(true);
        break;
      case "goto":
        ui.ex = Number(el.dataset.index);
        render(true);
        break;
      case "result": {
        if (!l.current) break;
        const list = curList(l);
        const e = list[ui.ex];
        if (!e) break;
        const v = el.dataset.v === "1";
        M.setResult(l, e.id, l.current.results[e.id] === v ? null : v);
        save();
        const now = l.current.results[e.id];
        announce(now === undefined ? "Da segnare" : v ? "Riuscito" : "Non ancora");
        if (now === undefined) { render(false); focusAct(`.ma-result [data-v="${el.dataset.v}"]`); break; }
        // al prossimo esercizio da segnare (anche tornando indietro nella lista)
        const n = list.length;
        let next = -1;
        for (let k = 1; k < n; k += 1) { const i = (ui.ex + k) % n; if (l.current.results[list[i].id] === undefined) { next = i; break; } }
        if (next >= 0) { ui.ex = next; stopTimer(); render(true); scrollTop(); } else { render(false); focusAct('[data-mact="finish"]'); }
        break;
      }
      case "finish": {
        if (!l.current) break;
        const lv = curLevel(l);
        const s = sessionOf(lv, l.current.session);
        const list = curList(l);
        stopTimer();
        ui.summary = M.finishSession(l, list, Date.now(), { count: lv.sessions.length, test: s.type === "prova" });
        save();
        render(true);
        scrollTop();
        announce(`Allenamento finito: ${ui.summary.done} su ${ui.summary.total}`);
        break;
      }
      case "level": {
        const up = el.dataset.up === "1";
        if (!ui.summary || (!ui.summary.isTest && !up)) {
          // sessione normale e "Va bene": nessun cambio, si annota solo la scelta
          M.chooseLevel(l, false);
          if (ui.summary) ui.summary.levelUp = false;
        } else {
          M.chooseLevel(l, up);
          ui.summary.levelUp = up;
        }
        save();
        if (ui.summary && ui.summary.atMax && l.mastered[ui.summary.disc] && !up) ui.summary = null;
        render(true);
        break;
      }
      case "close-summary":
        ui.summary = null;
        render(true);
        break;
      case "cancel":
        if (!confirmTwice(el, "Conferma: annulla", "Annulla")) { ui.guard.flow = 0; break; }
        stopTimer();
        l.current = null;
        save();
        render(true);
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
      case "timer-start": timerStart(); break;
      case "timer-signals":
        prefs().signals = !prefs().signals;
        el.setAttribute("aria-pressed", prefs().signals ? "true" : "false");
        if (ui.timer) ui.timer.ctrlKey = null;
        save();
        paintTimer();
        break;
      case "timer-pause": timerPause(); break;
      case "timer-skip": nextPhase(false); break;
      case "timer-done": nextPhase(false); break;
      case "timer-reset": {
        if (!l.current) break;
        const e = curList(l)[ui.ex];
        stopTimer();
        ensureTimer(e);
        paintTimer();
        focusAct("#maTimerCtrl button");
        break;
      }
      case "week": {
        const d = Number(el.dataset.delta);
        ui.week = d === 0 ? M.weekKey(Date.now()) : M.addWeeks(ui.week || M.weekKey(Date.now()), d);
        render(true);
        break;
      }
      case "trainday": {
        const day = Number(el.dataset.day);
        const set = new Set(l.trainDays);
        if (set.has(day)) set.delete(day); else set.add(day);
        if (!M.setTrainDays(l, [...set])) { announce("Serve almeno un giorno di allenamento"); break; }
        // da oggi in poi: settimana corrente e settimane future gia' fissate
        const current = M.weekKey(Date.now());
        Object.keys(l.weeks).filter((w) => w >= current).forEach((w) => M.replanWeek(l, DISC, w));
        if (!l.weeks[current]) M.planWeek(l, DISC, current);
        save();
        render(false);
        focusAct(`[data-mact="trainday"][data-day="${day}"]`);
        announce(set.has(day) ? `${M.WEEKDAYS_LONG[day]} aggiunto` : `${M.WEEKDAYS_LONG[day]} tolto`);
        break;
      }
      case "set-level": {
        const level = Number(el.dataset.level);
        const changed = M.setLevel(l, el.dataset.disc, level);
        if (changed) delete ui.pick[el.dataset.disc];
        save();
        render(false);
        focusAct(`[data-mact="set-level"][data-level="${level}"]`);
        announce(changed ? `Livello ${level} impostato: si riparte dalla sessione Impara` : `Sei già al livello ${level}`);
        break;
      }
      case "open-style":
        ui.view = "styles";
        ui.open = el.dataset.disc;
        render(true);
        scrollTop();
        break;
      case "close-style": {
        const from = ui.open;
        ui.open = null;
        render(false);
        focusAct(`[data-mact="open-style"][data-disc="${from}"]`);
        break;
      }
      default: break;
    }
  }

  function onChange(event) {
    const el = event.target.closest("[data-mact-change]");
    if (!el || !$("defPanel-martial").contains(el)) return;
    const l = lab();
    const kind = el.dataset.mactChange;
    if (kind === "day") {
      const week = ui.week || M.weekKey(Date.now());
      const disc = el.value || null;
      M.setDay(l, week, Number(el.dataset.day), disc, DISC);
      save();
      render(false);
      focusAct(`[data-mact-change="day"][data-day="${el.dataset.day}"]`);
      announce(`${M.WEEKDAYS_LONG[Number(el.dataset.day)]}: ${disc ? BY.get(disc).name : "riposo"}`);
    } else if (kind === "pool") {
      const set = new Set(l.pool);
      if (el.checked) set.add(el.dataset.disc); else set.delete(el.dataset.disc);
      if (!M.setPool(l, DISC.map((d) => d.id).filter((id) => set.has(id)))) { el.checked = true; announce("Serve almeno uno stile in rotazione"); return; }
      save();
      announce(el.checked ? "Aggiunto alla rotazione" : "Tolto dalla rotazione: vale dalle prossime settimane");
    }
  }

  window.DefenseMartialUI = {
    render,
    stop() {
      if (ui.timer && ui.timer.running) timerPause();
      if ("speechSynthesis" in window) try { window.speechSynthesis.cancel(); } catch (e) { /* niente */ }
    },
    // per il riquadro in alto della pagina Difesa
    chip() {
      if (!M || !DISC.length) return null;
      const l = lab();
      const t = M.today(l, DISC);
      const st = M.stats(l, DISC).weeks[0];
      const d = t.disc ? BY.get(t.disc) : null;
      return { label: d ? d.short || d.name : "Riposo", title: d ? `${d.name} · Lv ${M.levelOf(l, d.id)}` : "Giorno di riposo", sub: st.planned ? `${st.done}/${st.planned} allenamenti questa settimana` : "nessun allenamento previsto questa settimana", color: d ? d.color : null };
    },
    trend() {
      if (!M || !DISC.length) return "";
      const l = lab();
      const t = M.today(l, DISC);
      const st = M.stats(l, DISC).weeks[0];
      const d = t.disc ? BY.get(t.disc) : null;
      return `${d ? `Oggi ${d.name} Lv ${M.levelOf(l, d.id)}` : "Oggi riposo"}${st.planned ? ` · ${st.done}/${st.planned} questa settimana` : ""}`;
    },
    extras() {
      if (!M || !DISC.length) return null;
      return M.profileExtras(lab(), DISC);
    },
    // riquadro per la scheda Profilo della Difesa
    profileCard() {
      if (!M || !DISC.length) return "";
      const l = lab();
      const st = M.stats(l, DISC);
      const r = rankOf(l);
      return `<article class="def-pcard"><h3>Arti marziali</h3>${r ? `<p class="def-note ma-rank-mini">Rango: <strong>${esc(r.rank.name)}</strong> · ${r.pct}% di tutti gli stili</p>` : ""}<ul class="ma-bars">${DISC.map((d) => `<li style="--ma-c:${d.color}"><span>${esc(d.short || d.name)}</span><div class="ma-bar"><i style="width:${st.per[d.id].copy}%"></i></div><em>Lv ${st.per[d.id].level} · ${st.per[d.id].copy}%</em></li>`).join("")}</ul><p class="def-note">${plural(st.sessions, "allenamento", "allenamenti")} · ${st.streak} ${st.streak === 1 ? "settimana completa" : "settimane complete"} di fila</p></article>`;
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    const box = $("defPanel-martial");
    if (!box || !M) return;
    box.addEventListener("click", onClick);
    box.addEventListener("change", onChange);
    document.addEventListener("visibilitychange", () => { if (document.hidden && ui.timer && ui.timer.running) timerPause(); });
  });
})();
