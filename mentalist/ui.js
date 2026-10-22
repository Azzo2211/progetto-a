/*
 * Progetto A - Mentalista: la pagina (Oggi, Casi, Allenamento, Metodo, Progressi).
 * Motore: window.MentalistEngine. Generatori: window.MentalistGen, window.MentalistInterro.
 * Stato: state.mentalistLab. Usa le globali di app.js: state, saveState, renderDashboard,
 * buildRadarMarkup, rankFromScore, getModuleSkills.
 */
(function () {
  "use strict";

  const E = window.MentalistEngine;
  const G = window.MentalistGen;
  const I = window.MentalistInterro;
  if (!E || !G || !I) return;

  const ui = {
    tab: "today",     // today | cases | train | method | progress
    run: null,        // { type: "round", round } | { type: "case", run }
    lesson: null,
    progKey: "kim",
    pickLevel: {},
    kim: null,        // { phase, marks, timer }
    solve: null,      // risposte della ricostruzione { culprit, keys, motive, trap }
    lastKey: null     // ultima azione del caso (per evidenziarla)
  };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const dateShort = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const LEVEL_NAME = ["", "facile", "medio", "difficile"];

  function lab() {
    state.mentalistLab = E.ensure(state.mentalistLab);
    return state.mentalistLab;
  }
  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
    renderChip();
  }
  function announce(text) {
    const live = $("mntLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }
  function backBar(label = "← Esci", act = "exit") {
    return `<div class="mnt-back"><button type="button" class="ghost-action small" data-m="${act}">${esc(label)}</button></div>`;
  }
  function clearKimTimer() {
    if (ui.kim && ui.kim.timer) { clearTimeout(ui.kim.timer); ui.kim.timer = null; }
  }

  /* ------------------------------------------------------------ esagono */
  function hexProfile(l) {
    const skills = typeof getModuleSkills === "function" ? getModuleSkills("mentalist") : E.profile(l);
    const vals = skills.map((k) => ({ label: k.label, value: k.value }));
    const total = Math.round(vals.reduce((s, k) => s + k.value, 0) / Math.max(1, vals.length));
    const rank = typeof rankFromScore === "function" ? rankFromScore(total) : "";
    const svg = typeof buildRadarMarkup === "function" ? buildRadarMarkup(vals, 380, 190, 98, true) : "";
    return `<div class="mnt-hex"><svg class="mnt-hex-svg" viewBox="0 0 380 380" role="img" aria-label="Profilo da mentalista: ${vals.map((k) => `${esc(k.label)} ${k.value}`).join(", ")}">${svg}</svg><div class="mnt-hex-total"><strong>${total}</strong><span>punteggio da mentalista${rank ? ` · rango ${rank}` : ""}</span></div></div>`;
  }

  /* ------------------------------------------------------------ chip */
  function renderChip() {
    const box = $("mntChip");
    if (!box) return;
    const l = lab();
    const steps = E.plan(l);
    const left = steps.filter((s) => !s.done).length;
    const st = E.streak(l);
    box.innerHTML = `<span class="mnt-chip-num">${left}</span><span class="mnt-chip-copy"><strong>${left ? `${plural(left, "passo", "passi")} oggi` : "Programma di oggi fatto"}</strong><span>${st ? `${plural(st, "giorno", "giorni")} di fila` : "Inizia oggi la serie"}</span></span>`;
  }

  /* ------------------------------------------------------------ OGGI */
  function todayView() {
    const l = lab();
    const steps = E.plan(l);
    const done = steps.filter((s) => s.done).length;
    return `
      <div class="mnt-today">
        <section class="mnt-card mnt-plan">
          <div class="mnt-plan-head"><h2 data-focus tabindex="-1">Programma di oggi</h2><span>${done}/${steps.length} fatti · circa ${steps.reduce((s, x) => s + x.minutes, 0)} minuti</span></div>
          <ol class="mnt-steps">
            ${steps.map((s) => `
              <li class="${s.done ? "done" : ""}">
                <span class="mnt-step-mark" aria-hidden="true">${s.done ? "✓" : ""}</span>
                <div><strong>${esc(s.title)}</strong><span>${esc(s.detail)}</span></div>
                <span class="mnt-step-min">${s.minutes} min</span>
                <button type="button" class="${s.done ? "ghost-action" : "primary-action"} small" data-m="go" data-go='${esc(JSON.stringify(s.go))}'>${s.done ? "Rifai" : "Inizia"}<span class="mnt-sr">: ${esc(s.title)}</span></button>
              </li>`).join("")}
          </ol>
        </section>
        <aside class="mnt-side">
          <h3>Profilo</h3>
          ${hexProfile(l)}
          <h3 class="mnt-side-how">Come funziona</h3>
          <p>Il reparto è ispirato a Patrick Jane, il protagonista di «The Mentalist»: un ex finto sensitivo che risolve i casi guardando quello che gli altri non notano. Qui non ci sono poteri: ci sono osservazione, ragionamento e psicologia, con quello che gli studi dicono davvero.</p>
          <p>I casi si risolvono con mosse contate: scegli che cosa esaminare e chi interrogare, poi ricostruisci chi è stato e come incastrarlo. Nell'allenamento ogni disciplina ha un punteggio come negli scacchi: 1000 vuol dire risolvere un esercizio una volta su due.</p>
        </aside>
      </div>`;
  }

  /* ------------------------------------------------------------ CASI */
  function casesView() {
    const l = lab();
    const solved = Object.values(l.cases).filter((x) => x.solved).length;
    return `<div class="mnt-cases">
      <div class="mnt-intro"><h2 data-focus tabindex="-1">I casi</h2><p>Ogni fascicolo è un caso da chiudere. Hai un numero di mosse: esaminare un oggetto, osservare una persona o farle una domanda costa una mossa. Quando pensi di avere abbastanza, ricostruisci: chi è stato, i fatti che lo provano, il movente, la trappola per chiudere. Conta il primo tentativo.</p>${Object.keys(l.cases).length ? `<p class="mnt-small">Risolti ${solved} su ${E.CASES.length}.</p>` : ""}</div>
      <ol class="mnt-files">${E.CASES.map((c, i) => {
        const rec = l.cases[c.id];
        return `<li><button type="button" class="mnt-file" data-m="case" data-id="${c.id}">
          <span class="mnt-file-tab">Fascicolo ${i + 1}</span>
          <strong>${esc(c.title)}</strong>
          <span class="mnt-file-place">${esc(c.place)}</span>
          <span class="mnt-file-meta"><span class="mnt-lv mnt-lv-${c.level}">${LEVEL_NAME[c.level]}</span><span>${c.budget} mosse</span>${rec ? `<span class="mnt-file-score ${rec.solved ? "ok" : "ko"}">${rec.first}/100${rec.best > rec.first ? ` · record ${rec.best}` : ""}</span>` : `<span class="mnt-file-new">da aprire</span>`}</span>
        </button></li>`;
      }).join("")}</ol>
    </div>`;
  }

  function startCase(id) {
    const run = E.startCase(id);
    if (!run) return;
    ui.run = { type: "case", run };
    ui.tab = "cases";
    ui.solve = null;
    ui.lastKey = null;
    render(true);
  }
  function caseView() {
    const run = ui.run.run;
    const c = E.caseById(run.id);
    if (run.phase === "brief") return caseBrief(c, run);
    if (run.phase === "solve") return caseSolveView(c, run);
    if (run.phase === "result") return caseResult(c, run);
    return caseInvestigate(c, run);
  }
  function caseBrief(c, run) {
    const l = lab();
    const rec = l.cases[c.id];
    const idx = E.CASES.indexOf(c) + 1;
    return `${backBar("← Tutti i casi", "cases")}
      <article class="mnt-dossier">
        <div class="mnt-dossier-tab">Fascicolo ${idx} · ${LEVEL_NAME[c.level]}</div>
        <h2 data-focus tabindex="-1">${esc(c.title)}</h2>
        <p class="mnt-place">${esc(c.place)}</p>
        ${c.brief.map((p) => `<p>${esc(p)}</p>`).join("")}
        <div class="mnt-dossier-rules">
          <p><b>${c.budget} mosse.</b> Esaminare un elemento della scena, osservare una persona, fare una domanda: una mossa ciascuno. Non c'è tempo per tutto (le azioni possibili sono ${E.totalActions(c)}): scegli come farebbe Jane.</p>
          <p>Quello che scopri finisce nel taccuino. Alla fine dovrai scegliere ${c.need} fatti che provano la colpa: solo tra quelli che hai trovato.</p>
          ${rec ? `<p class="mnt-small">Hai già chiuso questo caso (primo tentativo ${rec.first}/100). Rigiocarlo non cambia il punteggio del profilo.</p>` : ""}
        </div>
        <div class="mnt-actions"><button type="button" class="primary-action" data-m="case-open" data-autofocus>Entra sulla scena</button></div>
      </article>`;
  }
  function caseInvestigate(c, run) {
    const left = c.budget - run.used;
    const seen = (k) => run.seen[k];
    const entry = (k) => run.log.find((x) => x.key === k);
    const out = left <= 0;
    const block = (key, label, act, attrs) => {
      const e = entry(key);
      if (e) return `<div class="mnt-found ${ui.lastKey === key ? "last" : ""}" ${ui.lastKey === key ? "data-autofocus tabindex=\"-1\"" : ""}><span class="mnt-found-label">${esc(label)}</span><p>${esc(e.text)}</p>${e.fact ? `<span class="mnt-found-fact ${e.isNew ? "" : "dup"}">${e.isNew ? "Nel taccuino" : "Già nel taccuino"}</span>` : ""}</div>`;
      return `<button type="button" class="mnt-probe" data-m="${act}" ${attrs} ${out ? "disabled" : ""}>${esc(label)}</button>`;
    };
    const scene = c.scene.map((s) => `<li>${block(`scene:${s.id}`, s.name, "probe", `data-kind="scene" data-a="${s.id}"`)}</li>`).join("");
    const people = c.people.map((p) => `
      <li class="mnt-person">
        <div class="mnt-person-head"><strong>${esc(p.name)}</strong><span>${esc(p.role)}</span></div>
        ${block(`look:${p.id}`, "Osserva", "probe", `data-kind="look" data-a="${p.id}"`)}
        ${p.ask.map((q) => block(`ask:${p.id}:${q.id}`, `«${q.q}»`, "probe", `data-kind="ask" data-a="${p.id}" data-b="${q.id}"`)).join("")}
      </li>`).join("");
    return `${backBar("← Esci dal caso", "cases")}
      <div class="mnt-run-head"><span class="mnt-kicker">${esc(c.title)} · ${esc(c.place)}</span><span class="mnt-moves ${left <= 2 ? "low" : ""}" aria-live="polite">${left > 0 ? `${plural(left, "mossa rimasta", "mosse rimaste")} su ${c.budget}` : "Mosse finite"}</span></div>
      <details class="mnt-recall"><summary>Rileggi il caso</summary>${c.brief.map((p) => `<p>${esc(p)}</p>`).join("")}</details>
      <div class="mnt-board">
        <div class="mnt-board-main">
          <section class="mnt-card"><h2 data-focus tabindex="-1">La scena</h2><ul class="mnt-probes">${scene}</ul></section>
          <section class="mnt-card"><h2>Le persone</h2><ul class="mnt-people">${people}</ul></section>
        </div>
        <div class="mnt-mbar" aria-hidden="true"><span><b>${run.facts.length}</b> ${run.facts.length === 1 ? "fatto" : "fatti"} · <b>${Math.max(0, left)}</b> ${left === 1 ? "mossa" : "mosse"}</span><button type="button" class="mnt-mbar-link" data-m="to-notebook" tabindex="-1">Taccuino</button><button type="button" class="primary-action small" data-m="case-solve" tabindex="-1" ${run.facts.length ? "" : "disabled"}>Ricostruisci</button></div>
        <aside class="mnt-notebook" id="mntNotebook" aria-label="Taccuino">
          <h3>Taccuino</h3>
          ${run.facts.length ? `<ol>${run.facts.map((f) => `<li class="${run.log.length && run.log[run.log.length - 1].fact === f && run.log[run.log.length - 1].isNew ? "new" : ""}">${esc(c.facts[f])}</li>`).join("")}</ol>` : `<p class="mnt-small">Ancora vuoto. Ogni fatto che scopri finisce qui.</p>`}
          <div class="mnt-actions"><button type="button" class="primary-action" data-m="case-solve" ${run.facts.length ? "" : "disabled"}>${out ? "Ricostruisci il caso" : "Ho visto abbastanza: ricostruisci"}</button></div>
          <p class="mnt-small">Fatti e impressioni non sono la stessa cosa: «è nervoso» è un fatto, «nasconde qualcosa» no.</p>
        </aside>
      </div>`;
  }
  function caseSolveView(c, run) {
    const s = ui.solve || (ui.solve = { culprit: null, keys: [], motive: null, trap: null });
    const ready = s.culprit && s.keys.length === c.need && s.motive !== null && s.trap !== null;
    return `${backBar("← Torna alla scena", "case-back")}
      <article class="mnt-card mnt-solve">
        <span class="mnt-kicker">${esc(c.title)}</span>
        <h2 data-focus tabindex="-1">Ricostruzione</h2>
        <fieldset class="mnt-q"><legend>1. Chi è stato?</legend>
          <div class="mnt-pick">${c.people.map((p) => `<button type="button" class="mnt-choice" data-m="pick-culprit" data-v="${p.id}" aria-pressed="${s.culprit === p.id}"><strong>${esc(p.name)}</strong><span>${esc(p.role)}</span></button>`).join("")}</div>
        </fieldset>
        <fieldset class="mnt-q"><legend>2. Scegli i ${c.need} fatti che lo provano <span class="mnt-count">${s.keys.length}/${c.need}</span></legend>
          <p class="mnt-small">Solo tra quelli che hai nel taccuino. Scegli le prove, non le impressioni.</p>
          <div class="mnt-pick mnt-pick-facts">${run.facts.map((f) => `<button type="button" class="mnt-choice fact" data-m="pick-key" data-v="${f}" aria-pressed="${s.keys.includes(f)}" ${!s.keys.includes(f) && s.keys.length >= c.need ? "disabled" : ""}>${esc(c.facts[f])}</button>`).join("")}</div>
        </fieldset>
        <fieldset class="mnt-q"><legend>3. Il movente</legend>
          <div class="mnt-pick">${(run.order ? run.order.motives : c.motives.map((_, i) => i)).map((i) => `<button type="button" class="mnt-choice" data-m="pick-motive" data-v="${i}" aria-pressed="${s.motive === i}">${esc(c.motives[i])}</button>`).join("")}</div>
        </fieldset>
        <fieldset class="mnt-q"><legend>4. Come lo chiudi? La mossa alla Jane</legend>
          <div class="mnt-pick mnt-pick-long">${(run.order ? run.order.traps : c.traps.map((_, i) => i)).map((i) => `<button type="button" class="mnt-choice" data-m="pick-trap" data-v="${i}" aria-pressed="${s.trap === i}">${esc(c.traps[i].text)}</button>`).join("")}</div>
        </fieldset>
        <div class="mnt-actions"><button type="button" class="primary-action" data-m="case-close" ${ready ? "" : "disabled"}>Chiudi il caso</button>${ready ? "" : `<span class="mnt-small">Rispondi a tutte e quattro le domande.</span>`}</div>
      </article>`;
  }
  function caseResult(c, run) {
    const r = run.result;
    const culprit = c.people.find((p) => p.id === c.culprit);
    const chosenP = c.people.find((p) => p.id === run.answer.culprit);
    const trap = c.traps[run.answer.trap];
    const goodTrap = c.traps.find((t) => t.ok);
    const l = lab();
    const rec = l.cases[c.id];
    const verdict = r.total >= 90 ? "Caso chiuso alla perfezione" : r.culpritOk ? (r.total >= 70 ? "Caso chiuso" : "Colpevole giusto, ricostruzione incompleta") : "Il colpevole era un altro";
    return `${backBar("← Tutti i casi", "cases")}
      <article class="mnt-card mnt-result">
        <div class="mnt-big ${r.culpritOk ? "" : "ko"}"><strong>${r.total}</strong><span>su 100</span></div>
        <div>
          <span class="mnt-kicker">${esc(c.title)}</span>
          <h2 data-focus tabindex="-1">${verdict}</h2>
          <ul class="mnt-score">
            <li class="${r.culpritOk ? "ok" : "ko"}"><b>Colpevole</b> ${r.parts.culprit}/40 · hai indicato ${esc(chosenP ? chosenP.name : "—")}${r.culpritOk ? "" : `; era ${esc(culprit.name)}`}.</li>
            <li class="${r.parts.keys === 30 ? "ok" : r.parts.keys ? "mid" : "ko"}"><b>Prove</b> ${r.parts.keys}/30${r.culpritOk ? "" : " (contano solo con il colpevole giusto)"}.</li>
            <li class="${r.parts.motive ? "ok" : "ko"}"><b>Movente</b> ${r.parts.motive}/10 · ${esc(c.motives[c.motive])}.</li>
            <li class="${r.trapOk ? "ok" : "ko"}"><b>Trappola</b> ${r.parts.trap}/20.</li>
          </ul>
          ${rec && rec.tries > 1 ? `<p class="mnt-small">Tentativo numero ${rec.tries}: per il profilo conta il primo (${rec.first}/100).</p>` : ""}
        </div>
      </article>
      <section class="mnt-card">
        <h3>Le prove che hai scelto</h3>
        <ul class="mnt-keys">${r.chosen.map((f) => `<li class="${c.keys.includes(f) && r.culpritOk ? "ok" : "ko"}">${esc(c.facts[f])}<em>${c.keys.includes(f) ? "prova" : "non prova la colpa"}</em></li>`).join("")}</ul>
        <details class="mnt-why"><summary>Tutti i fatti che reggevano la prova</summary><ul>${c.keys.map((f) => `<li>${esc(c.facts[f])}</li>`).join("")}</ul></details>
      </section>
      <section class="mnt-card">
        <h3>La trappola</h3>
        <p class="${r.trapOk ? "mnt-okline" : "mnt-koline"}">${r.trapOk ? "Giusta." : `La tua scelta: ${esc(trap.text)}`}</p>
        ${r.trapOk ? "" : `<p>${esc(trap.why)}</p><p><b>Quella che funziona:</b> ${esc(goodTrap.text)}</p>`}
        <p>${esc(goodTrap.why)}</p>
      </section>
      <section class="mnt-card mnt-closing">
        <h3>Come si chiude il caso</h3>
        ${c.close.map((p) => `<p>${esc(p)}</p>`).join("")}
        <p class="mnt-moral"><b>La lezione.</b> ${esc(c.lesson)}</p>
        <div class="mnt-actions"><button type="button" class="primary-action" data-m="cases" data-autofocus>Tutti i casi</button><button type="button" class="ghost-action" data-m="case" data-id="${c.id}">Rigioca</button></div>
      </section>`;
  }

  /* ------------------------------------------------------------ ALLENAMENTO */
  function trainView() {
    const l = lab();
    return `
      <div class="mnt-train">
        <div class="mnt-intro"><h2 data-focus tabindex="-1">Allenamento</h2><p>Quattro discipline, ognuna con il suo punteggio. Il livello automatico ti tiene intorno a 6 risposte giuste su 10, la zona in cui si impara.</p></div>
        <div class="mnt-tiles">
          ${E.KEYS.map((k) => {
            const d = E.DRILLS[k];
            const st = l.ratings[k];
            const auto = E.autoLevel(l, k);
            const chosen = ui.pickLevel[k] || 0;
            return `<article class="mnt-tile">
              <div class="mnt-tile-head"><h3>${esc(d.label)}</h3><span class="mnt-elo" title="Punteggio">${st.r}</span></div>
              <p>${esc(d.desc)}</p>
              <div class="mnt-tile-stat">${st.n ? `${st.n} ${k === "interro" ? "interrogatori" : "esercizi"} · ${Math.round((st.ok / st.n) * 100)}% giusti` : "Mai provata"}${k === "interro" && E.techAverage(l) !== null ? ` · tecnica ${E.techAverage(l)}/100` : ""}</div>
              <div class="mnt-tile-actions">
                <label class="mnt-lv-sel"><span class="mnt-sr">Livello</span><select data-lvsel="${k}">${[0, ...Array.from({ length: E.maxLevel(k) }, (_, i) => i + 1)].map((v) => `<option value="${v}" ${v === chosen ? "selected" : ""}>${v ? `Livello ${v}` : `Automatico (${auto})`}</option>`).join("")}</select></label>
                <button type="button" class="primary-action small" data-m="train" data-key="${k}">Allenati<span class="mnt-sr">: ${esc(d.label)}</span></button>
              </div>
            </article>`;
          }).join("")}
        </div>
      </div>`;
  }
  function startRound(key) {
    clearKimTimer();
    const l = lab();
    const lv = ui.pickLevel[key] || 0;
    const round = E.makeRound(l, key, lv ? { level: lv } : {});
    ui.run = { type: "round", round };
    ui.tab = "train";
    prepareItem();
    render(true);
  }
  function prepareItem() {
    clearKimTimer();
    const r = ui.run && ui.run.round;
    ui.kim = null;
    if (r && r.item && r.item.kind === "kim" && !r.done) {
      ui.kim = { phase: "study", marks: [], timer: null, startedAt: Date.now() };
      ui.kim.timer = setTimeout(() => endStudy(), r.item.secs * 1000);
    }
  }
  function endStudy() {
    if (!ui.kim || ui.kim.phase !== "study") return;
    clearKimTimer();
    ui.kim.phase = "mask";
    render(false);
    ui.kim.timer = setTimeout(() => {
      if (!ui.kim) return;
      ui.kim.phase = "test";
      ui.kim.timer = null;
      render(true);
    }, 900);
  }

  /* ---- disegno degli oggetti */
  const STROKE = "#2a2420";
  function iconSvg(id, c) {
    const C = (G.COLORS[c] || G.COLORS[0]).hex;
    const s = `stroke="${STROKE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
    const ring = (d, w = 5) => `<path d="${d}" fill="none" stroke="${STROKE}" stroke-width="${w + 3}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${C}" stroke-width="${w}" stroke-linecap="round"/>`;
    const light = c === 5;
    switch (id) {
      case "key": return `<circle cx="-18" cy="0" r="14" fill="${C}" ${s}/><circle cx="-18" cy="0" r="5" fill="#d9c3a0" ${s}/><path d="M-5 -4 H30 V4 H25 V12 H19 V4 H13 V10 H7 V4 H-5 Z" fill="${C}" ${s}/>`;
      case "cup": return `${ring("M16 -10 h5 a8 8 0 0 1 0 16 h-5", 4)}<path d="M-22 -18 H16 V12 a10 10 0 0 1 -10 10 H-12 a10 10 0 0 1 -10 -10 Z" fill="${C}" ${s}/><ellipse cx="-3" cy="-18" rx="19" ry="3.5" fill="#5b3a22" ${s}/>`;
      case "pen": return `<g transform="rotate(-35)"><rect x="-30" y="-5" width="50" height="10" rx="3" fill="${C}" ${s}/><path d="M20 -5 L33 0 L20 5 Z" fill="#e8dcc8" ${s}/><rect x="-24" y="-8" width="14" height="3" fill="${STROKE}"/></g>`;
      case "phone": return `<rect x="-16" y="-28" width="32" height="56" rx="6" fill="${C}" ${s}/><rect x="-11.5" y="-22" width="23" height="40" rx="2" fill="#203540"/><circle cx="0" cy="23" r="2" fill="${light ? STROKE : "#d9d9d9"}"/>`;
      case "glasses": return `${ring("M-26 -1 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0", 4)}${ring("M4 -1 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0", 4)}${ring("M-4 -3 Q0 -7 4 -3", 4)}${ring("M-26 -3 L-34 -8", 3)}${ring("M26 -3 L34 -8", 3)}`;
      case "coin": return `<circle r="16" fill="${C}" ${s}/><circle r="11" fill="none" stroke="${STROKE}" stroke-width="1.4" opacity="0.6"/><text x="0" y="5" text-anchor="middle" font-size="13" font-weight="700" fill="${STROKE}" opacity="0.65">1</text>`;
      case "watch": return `<rect x="-8" y="-32" width="16" height="64" rx="4" fill="#6b5340" ${s}/><circle r="15" fill="${C}" ${s}/><circle r="10" fill="#fbfaf6" ${s}/><path d="M0 0 V-7 M0 0 L5 2" stroke="${STROKE}" stroke-width="2" stroke-linecap="round"/>`;
      case "ring": return `${ring("M-13 4 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0", 6)}<path d="M-6 -10 L0 -19 L6 -10 Z" fill="#bfe6f2" ${s}/>`;
      case "notebook": return `<rect x="-19" y="-26" width="40" height="52" rx="3" fill="${C}" ${s}/>${[-18, -8, 2, 12, 22].map((y) => `<circle cx="-19" cy="${y}" r="3" fill="#fbfaf6" ${s}/>`).join("")}<path d="M-8 -12 H13 M-8 -3 H13 M-8 6 H9" stroke="${light ? STROKE : "#fbfaf6"}" stroke-width="2" opacity="0.7"/>`;
      case "lighter": return `<rect x="-10" y="-15" width="20" height="36" rx="4" fill="${C}" ${s}/><rect x="-10" y="-25" width="20" height="10" rx="2" fill="#c3c7ca" ${s}/><circle cx="4" cy="-20" r="3" fill="#8b8f92" ${s}/>`;
      case "card": return `<rect x="-18" y="-25" width="36" height="50" rx="4" fill="#fbfaf6" ${s}/><path d="M0 -12 L10 0 L0 12 L-10 0 Z" fill="${C}"/><text x="-12" y="-14" font-size="10" font-weight="700" fill="${C}">7</text>`;
      case "die": { const pip = light ? STROKE : "#fbfaf6"; return `<rect x="-18" y="-18" width="36" height="36" rx="7" fill="${C}" ${s}/><circle cx="-8" cy="-8" r="3.6" fill="${pip}"/><circle cx="0" cy="0" r="3.6" fill="${pip}"/><circle cx="8" cy="8" r="3.6" fill="${pip}"/>`; }
      case "scissors": return `${ring("M-6 10 L12 -26", 4).replaceAll(C, "#b9bec2")}${ring("M6 10 L-12 -26", 4).replaceAll(C, "#b9bec2")}${ring("M-20 16 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0", 5)}${ring("M6 16 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0", 5)}`;
      case "book": return `<rect x="-20" y="-26" width="40" height="52" rx="2" fill="${C}" ${s}/><rect x="-20" y="-26" width="8" height="52" fill="${STROKE}" opacity="0.3"/><path d="M-6 -14 H13" stroke="${light ? STROKE : "#fbfaf6"}" stroke-width="2.4" opacity="0.8"/>`;
      case "envelope": return `<rect x="-26" y="-17" width="52" height="34" rx="2" fill="${C}" ${s}/><path d="M-26 -17 L0 4 L26 -17" fill="none" ${s}/>`;
      case "matches": return `${[-9, -2, 5].map((x, i) => `<path d="M${x} -6 L${x + i - 1} -24" stroke="#e9d7a8" stroke-width="3" stroke-linecap="round"/><circle cx="${x + i - 1}" cy="-25" r="3.4" fill="#b8352a"/>`).join("")}<rect x="-18" y="-8" width="36" height="24" rx="2" fill="${C}" ${s}/><rect x="-12" y="-2" width="24" height="12" fill="#fbfaf6" opacity="0.75"/>`;
      case "clip": return ring("M-6 22 V-14 a8 8 0 0 1 16 0 V16 a5 5 0 0 1 -10 0 V-8", 3.4);
      case "usb": return `<rect x="-6" y="-27" width="12" height="13" fill="#c9ced2" ${s}/><rect x="-10" y="-15" width="20" height="34" rx="4" fill="${C}" ${s}/>`;
      case "candle": return `<path d="M0 -30 C 6 -22 5 -17 0 -15 C -5 -17 -6 -22 0 -30 Z" fill="#f2a93b" ${s}/><rect x="-9" y="-14" width="18" height="40" rx="2" fill="${C}" ${s}/>`;
      case "glass": return `<path d="M-15 -22 L15 -22 L11 24 L-11 24 Z" fill="${C}" fill-opacity="0.45" ${s}/><path d="M-13 -6 L13 -6" stroke="${STROKE}" stroke-width="1.4" opacity="0.5"/>`;
      case "apple": return `<path d="M0 -14 C 14 -26 32 -8 20 14 C 13 26 5 23 0 19 C -5 23 -13 26 -20 14 C -32 -8 -14 -26 0 -14 Z" fill="${C}" ${s}/><path d="M0 -14 Q 2 -22 5 -26" fill="none" ${s}/><path d="M5 -22 Q 14 -28 18 -20 Q 10 -16 5 -22 Z" fill="#3d8a4a" ${s}/>`;
      case "button": return `<circle r="15" fill="${C}" ${s}/>${[[-4, -4], [4, -4], [-4, 4], [4, 4]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${light ? STROKE : "#fbfaf6"}"/>`).join("")}`;
      case "photo": return `<rect x="-20" y="-24" width="40" height="48" rx="2" fill="#fbfaf6" ${s}/><rect x="-16" y="-20" width="32" height="32" fill="${C}" ${s}/><path d="M-16 6 L-6 -4 L2 4 L8 -2 L16 6" fill="none" stroke="${light ? STROKE : "#fbfaf6"}" stroke-width="2"/>`;
      case "badge": return `<rect x="-16" y="-22" width="32" height="46" rx="4" fill="${C}" ${s}/><rect x="-6" y="-29" width="12" height="9" rx="2" fill="#c9ced2" ${s}/><rect x="-10" y="-14" width="13" height="15" fill="#fbfaf6" ${s}/><path d="M-10 8 H10 M-10 15 H6" stroke="#fbfaf6" stroke-width="2.4"/>`;
      default: return `<circle r="14" fill="${C}" ${s}/>`;
    }
  }
  function cellLabel(x) {
    if (!x) return "casella vuota";
    return G.objLabel(G.OBJ[x.id], x.c);
  }
  function tableView(item, objs, mode, marks, reveal) {
    const total = item.cols * item.rows;
    const bySlot = Object.fromEntries(objs.map((x) => [x.s, x]));
    const hot = reveal ? new Set(item.changes.flatMap((ch) => ch.slots)) : null;
    const cells = [];
    for (let s = 0; s < total; s += 1) {
      const x = bySlot[s];
      const svg = x ? `<svg viewBox="-45 -45 90 90" aria-hidden="true"><g transform="rotate(${x.rot})">${iconSvg(x.id, x.c)}</g></svg>` : "";
      const r = Math.floor(s / item.cols) + 1;
      const c = (s % item.cols) + 1;
      if (mode === "pick") {
        const on = marks.includes(s);
        cells.push(`<button type="button" class="mnt-cell ${on ? "marked" : ""}" data-m="kim-mark" data-s="${s}" aria-pressed="${on}" aria-label="Riga ${r}, colonna ${c}: ${esc(cellLabel(x))}">${svg}</button>`);
      } else {
        const cls = reveal ? (hot.has(s) ? (marks.includes(s) ? "hit" : "miss") : marks.includes(s) ? "wrong" : "") : "";
        cells.push(`<div class="mnt-cell ${cls}" role="img" aria-label="Riga ${r}, colonna ${c}: ${esc(cellLabel(x))}">${svg}</div>`);
      }
    }
    return `<div class="mnt-table" style="--cols:${item.cols}">${cells.join("")}</div>`;
  }

  /* ---- vista del turno */
  function roundView() {
    const r = ui.run.round;
    const d = E.DRILLS[r.key];
    const st = lab().ratings[r.key];
    const head = `${backBar("← Esci dal turno")}<div class="mnt-run-head"><span class="mnt-kicker">${esc(d.label)} · livello ${r.item ? r.item.level : r.level}</span><span>${r.done ? "" : r.n > 1 ? `${r.idx + 1} di ${r.n} · ` : ""}punteggio ${st.r}</span></div>`;
    if (r.done) return head + roundEnd(r);
    const it = r.item;
    const a = r.answered;
    let body = "";
    if (it.kind === "kim") body = kimView(it, a);
    else if (it.kind === "liar") body = liarView(it, a);
    else if (it.kind === "read") body = readView(it, a);
    else if (it.kind === "interro") body = interroView(it, a);
    const fb = a ? feedback(it, a, r) : "";
    return `${head}<article class="mnt-card mnt-run">${body}${fb}</article>`;
  }
  function feedback(it, a, r) {
    let detail = "";
    if (it.kind === "kim") detail = `<p class="mnt-correct">${esc(it.explain)}</p>${it.mode === "spot" && !a.ok ? `<p class="mnt-small">Hai trovato ${a.hits} ${a.hits === 1 ? "cambiamento" : "cambiamenti"} su ${a.total}${a.extra ? `, e ${plural(a.extra, "casella", "caselle")} senza cambiamenti` : ""}.</p>` : ""}`;
    else if (it.kind === "liar") detail = `<p class="mnt-correct">Il colpevole è ${esc(it.names[it.culprit])}.</p>
        <details class="mnt-why" open><summary>Perché torna</summary><ul>${it.check.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>
        <details class="mnt-why"><summary>Perché non gli altri</summary><ul>${it.elim.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>
        <p class="mnt-small"><b>Il metodo.</b> ${esc(it.tip)}</p>`;
    else if (it.kind === "read") detail = `${a.ok ? "" : `<p class="mnt-correct">Risposta giusta: ${esc(it.options[it.answer])}.</p>`}<p>${esc(it.why)}</p>${it.hint ? `<p class="mnt-small"><b>${esc(it.options[it.answer])}.</b> ${esc(it.hint)}</p>` : ""}`;
    else if (it.kind === "interro") {
      const sc = I.scenario(it);
      detail = `<p class="mnt-correct">${esc(I.debrief(it))}</p>
        <div class="mnt-tech"><div class="mnt-tech-num"><strong>${a.technique}</strong><span>tecnica</span></div><ul>${(a.notes || []).map((n) => `<li class="${n.ok === true ? "ok" : n.ok === false ? "ko" : ""}">${esc(n.text)}</li>`).join("")}</ul></div>
        <p class="mnt-small">${esc(sc.who)}: ${it.guilty ? "colpevole" : "innocente"}. Il verdetto muove il punteggio; la tecnica entra nel profilo.</p>`;
    }
    const title = a.ok ? "Giusto" : it.kind === "interro" ? "Verdetto sbagliato" : "Sbagliato";
    return `<div class="mnt-feedback ${a.ok ? "ok" : "ko"}" role="status">
      <strong>${title} <em>${a.delta >= 0 ? "+" : ""}${a.delta}</em></strong>
      ${detail}
      <div class="mnt-actions"><button type="button" class="primary-action" data-m="next" data-autofocus>${r.idx + 1 < r.n ? "Avanti" : "Vedi il risultato"}</button></div>
    </div>`;
  }
  function kimView(it, a) {
    const k = ui.kim || { phase: "test", marks: [] };
    if (!a && k.phase === "study") {
      return `<p class="mnt-ask" data-focus tabindex="-1">Guarda il tavolo. Hai ${it.secs} secondi.</p>
        <div class="mnt-timer" style="--secs:${it.secs}s" aria-hidden="true"><i></i></div>
        ${tableView(it, it.before, "show", [], false)}
        <div class="mnt-actions"><button type="button" class="ghost-action" data-m="kim-ready">Ho finito di guardare</button></div>`;
    }
    if (!a && k.phase === "mask") return `<p class="mnt-ask">...</p><div class="mnt-table mnt-mask" style="--cols:${it.cols}">${Array.from({ length: it.cols * it.rows }, () => `<div class="mnt-cell"></div>`).join("")}</div>`;
    if (it.mode === "ask") {
      const q = it.question;
      return `<p class="mnt-ask" data-focus tabindex="-1">${esc(q.text)}</p>
        ${a ? tableView(it, it.before, "show", [], false) : `<div class="mnt-table mnt-mask" style="--cols:${it.cols}">${Array.from({ length: it.cols * it.rows }, () => `<div class="mnt-cell"></div>`).join("")}</div>`}
        <div class="mnt-options">${q.options.map((o, i) => {
          let cls = "";
          if (a) cls = i === q.answer ? "ok" : Number(a.ans) === i ? "ko" : "dim";
          return `<button type="button" class="mnt-opt ${cls}" data-m="pick" data-v="${i}" ${a ? "disabled" : ""}><span class="mnt-key">${i + 1}</span>${esc(o)}</button>`;
        }).join("")}</div>`;
    }
    const n = it.changes.length;
    if (a) {
      return `<p class="mnt-ask" data-focus tabindex="-1">Prima e dopo</p>
        <div class="mnt-pair"><figure><figcaption>Prima</figcaption>${tableView(it, it.before, "show", a.ans || [], true)}</figure><figure><figcaption>Dopo</figcaption>${tableView(it, it.after, "show", a.ans || [], true)}</figure></div>
        <p class="mnt-small mnt-legend"><span class="hit">trovato</span><span class="miss">non trovato</span><span class="wrong">segnato per sbaglio</span></p>`;
    }
    return `<p class="mnt-ask" data-focus tabindex="-1">${n === 1 ? "È cambiata una cosa." : `Sono cambiate ${n} cose.`} Tocca ${n === 1 ? "la casella" : "le caselle"} dove è successo (anche quelle rimaste vuote).</p>
      ${tableView(it, it.after, "pick", k.marks, false)}
      <div class="mnt-actions"><button type="button" class="primary-action" data-m="kim-ok" ${k.marks.length === n ? "" : "disabled"}>Conferma (${k.marks.length}/${n})</button></div>`;
  }
  function liarView(it, a) {
    return `<p class="mnt-crime" data-focus tabindex="-1">${esc(it.crime)}</p>
      <div class="mnt-rule"><span>La regola</span><p>${esc(it.ruleText)}</p></div>
      <ul class="mnt-says">${it.statements.map((s) => `<li><b>${esc(s.who)}</b><span>«${esc(s.text.replace(/\.$/, ""))}»</span></li>`).join("")}</ul>
      <p class="mnt-ask">Chi è il colpevole?</p>
      <div class="mnt-options names">${it.names.map((n, i) => {
        let cls = "";
        if (a) cls = i === it.culprit ? "ok" : Number(a.ans) === i ? "ko" : "dim";
        return `<button type="button" class="mnt-opt ${cls}" data-m="pick" data-v="${i}" ${a ? "disabled" : ""}><span class="mnt-key">${i + 1}</span>${esc(n)}</button>`;
      }).join("")}</div>
      ${a ? "" : `<p class="mnt-small">Prova un'ipotesi alla volta: se il colpevole fosse lui, chi mentirebbe? Torna con la regola?</p>`}`;
  }
  function readView(it, a) {
    return `<p class="mnt-ask" data-focus tabindex="-1">${it.type === "tech" ? "Quale trucco sta usando il sensitivo?" : "Che cosa puoi dire, con onestà, da questo dettaglio?"}</p>
      ${it.context ? `<p class="mnt-context">${esc(it.context)}</p>` : ""}
      <blockquote class="mnt-quote ${it.type}">${esc(it.text)}</blockquote>
      <div class="mnt-options ${it.type === "infer" ? "long" : ""}">${it.options.map((o, i) => {
        let cls = "";
        if (a) cls = i === it.answer ? "ok" : Number(a.ans) === i ? "ko" : "dim";
        return `<button type="button" class="mnt-opt ${cls}" data-m="pick" data-v="${i}" ${a ? "disabled" : ""}><span class="mnt-key">${i + 1}</span>${esc(o)}</button>`;
      }).join("")}</div>`;
  }
  function interroView(it, a) {
    const sc = I.scenario(it);
    const used = it.log.length > 0;
    const evid = sc.evidence.map((e, i) => `<li class="mnt-ev">
        <div><strong>${esc(e.label)}</strong><p>${esc(e.ev)}</p></div>
        <div class="mnt-ev-act">
          <button type="button" class="ghost-action small" data-m="int" data-k="ask" data-i="${i}" ${it.asked[i] || a ? "disabled" : ""}>${it.asked[i] ? "Chiesto" : "Chiedi senza mostrare"}</button>
          <button type="button" class="ghost-action small" data-m="int" data-k="show" data-i="${i}" ${it.shown[i] || a ? "disabled" : ""}>${it.shown[i] ? "Mostrata" : "Mostra la prova"}</button>
        </div>
      </li>`).join("");
    const chat = it.log.map((m) => m.who === "note" ? `<li class="note">${esc(m.text)}</li>` : `<li class="${m.who}">${m.tag === "show" ? `<span class="mnt-tagshow">Prova</span>` : ""}${esc(m.text)}</li>`).join("");
    return `<p class="mnt-crime" data-focus tabindex="-1">${esc(sc.crime)}</p>
      <p class="mnt-small">Davanti a te: <b>${esc(sc.who)}</b>, ${esc(sc.role)}.</p>
      <div class="mnt-int">
        <section><h3>Le tue prove</h3><p class="mnt-small">${sc.g === "f" ? "Lei" : "Lui"} non sa che cosa sai.</p><ul class="mnt-evs">${evid}</ul>
          <div class="mnt-int-more">
            <button type="button" class="ghost-action small" data-m="int" data-k="free" ${it.free || a ? "disabled" : ""}>Chiedi il racconto libero</button>
            <button type="button" class="ghost-action small" data-m="int" data-k="observe" ${a ? "disabled" : ""}>Osserva il comportamento</button>
            <button type="button" class="ghost-action small" data-m="int" data-k="press" ${it.pressed || a ? "disabled" : ""}>Metti pressione</button>
          </div>
        </section>
        <section><h3>Interrogatorio</h3>${chat ? `<ol class="mnt-chat">${chat}</ol>` : `<p class="mnt-empty">Comincia quando vuoi. Ogni mossa resta qui, in ordine.</p>`}</section>
      </div>
      ${a ? "" : `<div class="mnt-verdict"><span>Verdetto:</span><button type="button" class="primary-action" data-m="verdict" data-v="1" ${used ? "" : "disabled"}>È colpevole</button><button type="button" class="primary-action alt" data-m="verdict" data-v="0" ${used ? "" : "disabled"}>È innocente</button></div>`}`;
  }
  function roundEnd(r) {
    const s = E.summary(r);
    const st = lab().ratings[r.key];
    return `<article class="mnt-card mnt-result"><div class="mnt-big"><strong>${s.ok}</strong><span>su ${s.total}</span></div><div>
      <h2 data-focus tabindex="-1">${s.ok === s.total ? "Turno perfetto" : s.ok / s.total >= 0.6 ? "Buon turno" : "Turno difficile"}</h2>
      <p>Punteggio ${esc(E.DRILLS[r.key].label.toLowerCase())}: ${r.startR} → <b>${st.r}</b> (${s.delta >= 0 ? "+" : ""}${s.delta}).</p>
      <p class="mnt-small">Ogni risposta è pesata per la difficoltà: sbagliare un esercizio facile costa più che sbagliarne uno difficile.</p>
      <div class="mnt-actions"><button type="button" class="primary-action" data-m="train" data-key="${r.key}" data-autofocus>${r.key === "interro" ? "Un altro interrogatorio" : "Un altro turno"}</button><button type="button" class="ghost-action" data-m="exit">Torna</button></div></div></article>`;
  }

  /* ------------------------------------------------------------ METODO */
  function methodView() {
    if (ui.lesson) return lessonView(E.lessonById(ui.lesson));
    const l = lab();
    return `<div class="mnt-method">
      <div class="mnt-intro"><h2 data-focus tabindex="-1">Metodo</h2><p>Come si osserva, come si ragiona, come lavorano i finti sensitivi, che cosa funziona davvero per capire chi mente e come si interroga. Brevi, con le ricerche vere e due domande per verificare.</p></div>
      <ol class="mnt-lessons">${E.LESSONS.map((x, i) => {
        const checks = (x.checks || []).map((_, qi) => l.checks[`${x.id}:${qi}`]);
        const answered = checks.filter((v) => v !== undefined).length;
        return `<li><button type="button" data-m="lesson" data-id="${x.id}"><span class="mnt-ln">${i + 1}</span><span class="mnt-lcopy"><strong>${esc(x.title)}</strong><span>${esc(x.lead)}</span></span><em>${l.read[x.id] ? `letta${answered ? ` · ${checks.filter(Boolean).length}/${checks.length}` : ""}` : `${x.minutes || 6} min`}</em></button></li>`;
      }).join("")}</ol>
    </div>`;
  }
  function lessonView(x) {
    if (!x) { ui.lesson = null; return methodView(); }
    const l = lab();
    const i = E.LESSONS.indexOf(x);
    const nxt = E.LESSONS[i + 1];
    return `<div class="mnt-lesson">
      ${backBar("← Tutte le lezioni", "lessons")}
      <article class="mnt-card mnt-reader">
        <span class="mnt-kicker">Lezione ${i + 1} di ${E.LESSONS.length}</span>
        <h2 data-focus tabindex="-1">${esc(x.title)}</h2>
        <p class="mnt-lead">${esc(x.lead)}</p>
        ${(x.sections || []).map((s) => `<section class="mnt-sec"><h3>${esc(s.title)}</h3>${(s.body || []).map((p) => `<p>${esc(p)}</p>`).join("")}${s.example ? `<details class="mnt-ex"><summary>${esc(s.example.q)}</summary><p>${esc(s.example.a)}</p></details>` : ""}</section>`).join("")}
        ${x.checks && x.checks.length ? `<section class="mnt-sec mnt-checks"><h3>Verifica</h3>${x.checks.map((q, qi) => {
          const key = `${x.id}:${qi}`;
          const done = key in l.checks;
          const pickd = ui.checkPick && ui.checkPick[key];
          return `<div class="mnt-check"><p class="mnt-ask">${esc(q.q)}</p><div class="mnt-options long">${q.options.map((o, oi) => {
            let cls = "";
            if (pickd !== undefined) cls = oi === q.answer ? "ok" : pickd === oi ? "ko" : "dim";
            else if (done) cls = oi === q.answer ? "ok" : "dim";
            return `<button type="button" class="mnt-opt ${cls}" data-m="check" data-id="${x.id}" data-q="${qi}" data-v="${oi}" ${done || pickd !== undefined ? "disabled" : ""}><span class="mnt-key">${oi + 1}</span>${esc(o)}</button>`;
          }).join("")}</div>${done ? `<p class="mnt-small">${l.checks[key] ? "Giusta al primo colpo." : "Al primo colpo era sbagliata."} ${esc(q.why)}</p>` : ""}</div>`;
        }).join("")}</section>` : ""}
        ${x.sources && x.sources.length ? `<details class="mnt-sources"><summary>Fonti</summary><ul>${x.sources.map(([label, url]) => `<li>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label)}</li>`).join("")}</ul></details>` : ""}
        <div class="mnt-actions">
          ${l.read[x.id] ? `<span class="mnt-done-tag">Letta il ${dateShort(l.read[x.id])}</span>` : `<button type="button" class="primary-action" data-m="read" data-id="${x.id}">Segna come letta</button>`}
          ${x.train ? `<button type="button" class="ghost-action" data-m="train" data-key="${x.train}">Allenati: ${esc(E.DRILLS[x.train].label)}</button>` : ""}
          ${nxt ? `<button type="button" class="ghost-action" data-m="lesson" data-id="${nxt.id}">Lezione dopo: ${esc(nxt.title)}</button>` : ""}
        </div>
      </article>
    </div>`;
  }

  /* ------------------------------------------------------------ PROGRESSI */
  function progressView() {
    const l = lab();
    const key = ui.progKey;
    const st = l.ratings[key];
    const days = calendar(l);
    return `<div class="mnt-prog">
      <div class="mnt-intro"><h2 data-focus tabindex="-1">Progressi</h2><p>Ogni disciplina ha un punteggio che sale e scende con le risposte, pesate per difficoltà (1000 = risolto una volta su due; nell'esagono vale 50). I casi contano con il primo tentativo.</p></div>
      <section class="mnt-card mnt-prof-card"><h3>Profilo</h3>${hexProfile(l)}</section>
      <section class="mnt-card"><h3>Casi</h3>
        <table class="mnt-table-data"><thead><tr><th scope="col">Caso</th><th scope="col">Livello</th><th scope="col">Primo tentativo</th><th scope="col">Record</th></tr></thead><tbody>
        ${E.CASES.map((c) => { const r = l.cases[c.id]; return `<tr><th scope="row">${esc(c.title)}</th><td>${LEVEL_NAME[c.level]}</td><td>${r ? `${r.first}/100${r.solved ? "" : " · colpevole sbagliato"}` : "—"}</td><td>${r ? r.best : "—"}</td></tr>`; }).join("")}
        </tbody></table>
      </section>
      <section class="mnt-card"><h3>Discipline</h3>
        <table class="mnt-table-data"><thead><tr><th scope="col">Disciplina</th><th scope="col">Punteggio</th><th scope="col">Record</th><th scope="col">Fatti</th><th scope="col">Giusti</th></tr></thead><tbody>
        ${E.KEYS.map((k) => { const s = l.ratings[k]; return `<tr><th scope="row">${esc(E.DRILLS[k].label)}</th><td>${s.r}</td><td>${s.best || "—"}</td><td>${s.n}</td><td>${s.n ? `${Math.round((s.ok / s.n) * 100)}%` : "—"}</td></tr>`; }).join("")}
        </tbody></table>
        ${E.techAverage(l) !== null ? `<p class="mnt-small">Tecnica media negli interrogatori: ${E.techAverage(l)}/100.</p>` : ""}
      </section>
      <section class="mnt-card"><h3>Andamento del punteggio</h3>
        <div class="mnt-segbar" role="group" aria-label="Disciplina">${E.KEYS.map((k) => `<button type="button" data-m="prog" data-key="${k}" aria-pressed="${k === key}">${esc(E.DRILLS[k].label)}</button>`).join("")}</div>
        ${st.hist.length ? ratingChart(st.hist) : `<p class="mnt-empty">Ancora nessun turno completo in questa disciplina.</p>`}
      </section>
      <section class="mnt-card"><h3>Ultime 8 settimane</h3><div class="mnt-cal" role="img" aria-label="${days.filter((x) => x.on).length} giorni di allenamento nelle ultime 8 settimane">${days.map((x) => `<i class="${x.on ? "on" : ""} ${x.today ? "today" : ""}" title="${x.label}"></i>`).join("")}</div><p class="mnt-small">${plural(days.filter((x) => x.on).length, "giorno", "giorni")} su 56 · serie attuale: ${plural(E.streak(l), "giorno", "giorni")}</p></section>
    </div>`;
  }
  function ratingChart(hist) {
    const W = 560;
    const H = 180;
    const P = 32;
    const pts = [{ t: hist[0].t, r: E.START_RATING }].concat(hist);
    const vals = pts.map((p) => p.r);
    const lo = Math.min(800, ...vals) - 40;
    const hi = Math.max(1200, ...vals) + 40;
    const x = (i) => P + (i / Math.max(1, pts.length - 1)) * (W - 2 * P);
    const y = (v) => H - P - ((v - lo) / (hi - lo)) * (H - 2 * P);
    const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.r).toFixed(1)}`).join(" ");
    return `<svg class="mnt-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Punteggio nel tempo: ${vals.join(", ")}">
      <line x1="${P}" x2="${W - P}" y1="${y(1000)}" y2="${y(1000)}" class="ref"/><text x="${W - P}" y="${y(1000) - 4}" text-anchor="end" class="lbl">1000: una volta su due</text>
      <path d="${path}" class="line"/>${pts.slice(1).map((p, i) => `<circle cx="${x(i + 1)}" cy="${y(p.r)}" r="4" class="dot"><title>${dateShort(p.t)}: ${p.r}</title></circle>`).join("")}
    </svg>`;
  }
  function calendar(l) {
    const set = new Set(l.days);
    const out = [];
    const today = E.startOfDay(Date.now());
    for (let i = 55; i >= 0; i -= 1) {
      const t = E.addDays(today, -i);
      out.push({ on: set.has(E.dayKey(t)), today: i === 0, label: new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" }) });
    }
    return out;
  }

  /* ------------------------------------------------------------ disegno */
  let renderedAt = 0;
  function render(focus = false, soft = false) {
    const panel = $("mntPanel");
    if (!panel) return;
    if (!soft) renderedAt = Date.now();
    renderChip();
    document.querySelectorAll("#mentalist [data-mnt-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mntTab === ui.tab && !ui.run)));
    let html;
    if (ui.run && ui.run.type === "round") html = roundView();
    else if (ui.run && ui.run.type === "case") html = caseView();
    else if (ui.tab === "cases") html = casesView();
    else if (ui.tab === "train") html = trainView();
    else if (ui.tab === "method") html = methodView();
    else if (ui.tab === "progress") html = progressView();
    else html = todayView();
    const scrollY = window.scrollY;
    panel.innerHTML = html;
    const chat = panel.querySelector(".mnt-chat");
    if (chat) chat.scrollTop = chat.scrollHeight;
    const page = $("mentalist");
    if (page) page.classList.toggle("mnt-running", Boolean(ui.run));
    if (focus) {
      const el = panel.querySelector("[data-autofocus]") || panel.querySelector("[data-focus]");
      if (el) el.focus({ preventScroll: true });
      const top = panel.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: Math.max(0, window.scrollY + top - 12), behavior: "auto" });
    } else if (soft) window.scrollTo({ top: scrollY, behavior: "auto" });
  }
  function setTab(tab) {
    clearKimTimer();
    ui.run = null;
    ui.tab = tab;
    ui.lesson = null;
    render(true);
  }
  function go(target) {
    clearKimTimer();
    ui.run = null;
    if (target.kind === "train") { startRound(target.key); return; }
    if (target.kind === "case") { startCase(target.id); return; }
    if (target.kind === "lesson") { ui.tab = "method"; ui.lesson = target.id; render(true); return; }
    setTab("today");
  }
  function submitAnswer(ans) {
    const r = ui.run && ui.run.round;
    if (!r || r.answered || r.done) return;
    const res = E.answer(lab(), r, ans);
    save();
    render(true);
    announce(res && res.ok ? "Giusto" : "Sbagliato");
  }

  const SOFT = new Set(["kim-mark", "prog", "pick-culprit", "pick-key", "pick-motive", "pick-trap", "probe", "int"]);
  function onClick(event) {
    const el = event.target.closest("[data-m]");
    if (!el || !$("mentalist").contains(el) || el.disabled) return;
    const a = el.dataset.m;
    if (!a) return;
    if (!SOFT.has(a) && (event.detail > 1 || Date.now() - renderedAt < 300)) return;
    const l = lab();
    switch (a) {
      case "exit": clearKimTimer(); ui.run = null; render(true); break;
      case "go": try { go(JSON.parse(el.dataset.go)); } catch (e) { setTab("today"); } break;
      case "train": startRound(el.dataset.key); break;
      case "pick": submitAnswer(Number(el.dataset.v)); break;
      case "kim-ready": endStudy(); break;
      case "kim-mark": {
        if (!ui.kim) break;
        const s = Number(el.dataset.s);
        const n = ui.run.round.item.changes.length;
        const i = ui.kim.marks.indexOf(s);
        if (i >= 0) ui.kim.marks.splice(i, 1);
        else if (ui.kim.marks.length < n) ui.kim.marks.push(s);
        else if (n === 1) ui.kim.marks = [s];
        render(false, true);
        break;
      }
      case "kim-ok": if (ui.kim) submitAnswer(ui.kim.marks.slice()); break;
      case "int": {
        const it = ui.run.round.item;
        I.act(it, el.dataset.k, Number(el.dataset.i));
        render(false, true);
        break;
      }
      case "verdict": submitAnswer(el.dataset.v === "1"); break;
      case "next": {
        const r = ui.run.round;
        E.next(l, r);
        save();
        prepareItem();
        render(true);
        break;
      }
      case "case": startCase(el.dataset.id); break;
      case "cases": ui.run = null; ui.tab = "cases"; render(true); break;
      case "case-open": ui.run.run.phase = "inv"; render(true); break;
      case "probe": {
        const run = ui.run.run;
        const res = E.caseAct(run, el.dataset.kind, el.dataset.a, el.dataset.b);
        if (res && !res.blocked) { ui.lastKey = res.key; announce(res.isNew ? "Nuovo fatto nel taccuino" : "Fatto"); }
        render(false, true);
        const last = document.querySelector("#mntPanel .mnt-found.last");
        if (last) last.focus({ preventScroll: true });
        break;
      }
      case "case-solve": ui.run.run.phase = "solve"; render(true); break;
      case "to-notebook": { const nb = $("mntNotebook"); if (nb) nb.scrollIntoView({ block: "start" }); break; }
      case "case-back": ui.run.run.phase = "inv"; render(true); break;
      case "pick-culprit": ui.solve.culprit = el.dataset.v; render(false, true); break;
      case "pick-key": {
        const c = E.caseById(ui.run.run.id);
        const k = el.dataset.v;
        const i = ui.solve.keys.indexOf(k);
        if (i >= 0) ui.solve.keys.splice(i, 1);
        else if (ui.solve.keys.length < c.need) ui.solve.keys.push(k);
        render(false, true);
        break;
      }
      case "pick-motive": ui.solve.motive = Number(el.dataset.v); render(false, true); break;
      case "pick-trap": ui.solve.trap = Number(el.dataset.v); render(false, true); break;
      case "case-close": {
        const res = E.solveCase(l, ui.run.run, ui.solve);
        save();
        render(true);
        announce(res ? `Caso chiuso: ${res.total} su 100` : "");
        break;
      }
      case "lesson": clearKimTimer(); ui.run = null; ui.tab = "method"; ui.lesson = el.dataset.id; render(true); break;
      case "lessons": ui.lesson = null; render(true); break;
      case "read": E.markRead(l, el.dataset.id); save(); render(false, true); break;
      case "check": {
        const key = `${el.dataset.id}:${el.dataset.q}`;
        ui.checkPick = ui.checkPick || {};
        ui.checkPick[key] = Number(el.dataset.v);
        E.checkLesson(l, el.dataset.id, Number(el.dataset.q), Number(el.dataset.v));
        save();
        render(false, true);
        break;
      }
      case "prog": ui.progKey = el.dataset.key; render(false, true); break;
      default: break;
    }
  }
  function onChange(event) {
    const t = event.target;
    if (t.dataset.lvsel) ui.pickLevel[t.dataset.lvsel] = Number(t.value) || 0;
  }
  function onKey(event) {
    const page = $("mentalist");
    if (!page || !page.classList.contains("active-page")) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const r = ui.run && ui.run.round;
    if (!r || r.done) return;
    if (r.answered) { if (event.key === "Enter") { const b = document.querySelector('#mntPanel [data-m="next"]'); if (b) { b.click(); event.preventDefault(); } } return; }
    const it = r.item;
    const optCount = it.kind === "read" ? it.options.length : it.kind === "liar" ? it.n : it.kind === "kim" && it.mode === "ask" && ui.kim && ui.kim.phase === "test" ? it.question.options.length : 0;
    if (optCount && /^[1-9]$/.test(event.key) && Number(event.key) <= optCount) { submitAnswer(Number(event.key) - 1); event.preventDefault(); }
  }

  window.MentalistUI = { render, setTab, debug: ui };
  window.mentalistProfileSkills = () => E.profile(lab());
  window.mentalistTrend = () => E.trend(lab());

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("mentalist");
    if (!page) return;
    page.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-mnt-tab]");
      if (tab) { setTab(tab.dataset.mntTab); return; }
      if (event.target.closest("#mntChip")) { setTab("today"); return; }
      onClick(event);
    });
    page.addEventListener("change", onChange);
    document.addEventListener("keydown", onKey);
    render(false);
  });
})();
