/*
 * Progetto A - Influenza: la pagina (Oggi, Manuale, Allenamento, Trattativa, Progressi).
 * Motore: window.InfluenceEngine (influence/engine.js). Stato: state.influenceLab.
 * Usa le globali di app.js: state, saveState, renderDashboard.
 */
(function () {
  "use strict";

  const E = window.InfluenceEngine;
  if (!E) return;

  const ui = {
    tab: "today",      // today | manual | train | nego | progress
    chapter: null,     // id del capitolo aperto
    run: null,         // esercizio in corso (spot, cases, cards)
    move: "offer",     // pannello della trattativa
    draft: { price: "", opt: 0, criterion: "", claim: "" },
    finished: null,    // { game, result } ultima trattativa finita
    setupDeal: "random",
    setupLevel: null
  };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const dateShort = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const euro = E.euro;
  const tac = (id) => E.TACTICS[id] || { label: id, def: "", counter: "", family: "leva" };

  function lab() {
    state.influenceLab = E.ensure(state.influenceLab);
    return state.influenceLab;
  }
  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
    renderChip();
  }
  function announce(text) {
    const live = $("infLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }
  function backBar(label = "← Indietro", act = "exit") {
    return `<div class="inf-back"><button type="button" class="ghost-action small" data-i="${act}">${esc(label)}</button></div>`;
  }
  function bar(value, cls = "") {
    return `<i class="inf-bar ${cls}"><b style="width:${Math.max(0, Math.min(100, value))}%"></b></i>`;
  }

  /* ------------------------------------------------------------ chip */
  function renderChip() {
    const box = $("infChip");
    if (!box) return;
    const l = lab();
    const steps = E.plan(l);
    const left = steps.filter((s) => !s.done).length;
    const st = E.streak(l);
    box.innerHTML = `<span class="inf-chip-num">${left}</span><span class="inf-chip-copy"><strong>${left ? `${plural(left, "passo", "passi")} oggi` : "Programma di oggi fatto"}</strong><span>${l.nego.current ? "Hai una trattativa in sospeso" : st ? `${plural(st, "giorno", "giorni")} di fila` : "Inizia oggi la serie"}</span></span>`;
  }

  /* ------------------------------------------------------------ OGGI */
  function todayView() {
    const l = lab();
    const steps = E.plan(l);
    const done = steps.filter((s) => s.done).length;
    return `
      <div class="inf-today">
        <section class="inf-card inf-plan">
          <div class="inf-plan-head"><h2 data-focus tabindex="-1">Programma di oggi</h2><span>${done}/${steps.length} fatti · circa ${steps.reduce((s, x) => s + x.minutes, 0)} minuti</span></div>
          ${l.nego.current ? `<div class="inf-alert"><strong>Trattativa in sospeso</strong><span>${esc(E.dealById(l.nego.current.dealId).title)}, contro ${esc(E.cpById(l.nego.current.cpId).label.toLowerCase())}. Riprendila da dove l'hai lasciata.</span><button type="button" class="primary-action small" data-i="tab" data-tab="nego">Riprendi</button></div>` : ""}
          <ol class="inf-steps">
            ${steps.map((s) => `
              <li class="${s.done ? "done" : ""}">
                <span class="inf-step-mark" aria-hidden="true">${s.done ? "✓" : ""}</span>
                <div><strong>${esc(s.title)}</strong><span>${esc(s.detail)}</span></div>
                <span class="inf-step-min">${s.minutes} min</span>
                <button type="button" class="${s.done ? "ghost-action" : "primary-action"} small" data-i="go" data-go='${esc(JSON.stringify(s.go))}'>${s.done ? "Rifai" : "Inizia"}<span class="inf-sr">: ${esc(s.title)}</span></button>
              </li>`).join("")}
          </ol>
        </section>
        <aside class="inf-side">
          <h3>Profilo</h3>
          ${profileMini(l)}
          <h3 class="inf-side-how">Come funziona</h3>
          <p>Il manuale spiega le leve con gli esperimenti originali. Le schede e i messaggi da smascherare allenano a riconoscerle in un attimo. La trattativa e i casi allenano a usarle: lì il risultato si misura in numeri.</p>
          <p>Persuasione, negoziazione e strategia si allenano per usarle. Le tattiche manipolative si studiano per riconoscerle quando le usano su di te e per neutralizzarle.</p>
        </aside>
      </div>`;
  }
  // esagono del profilo, con gli stessi valori della scheda nel quadro
  function profileMini(l) {
    const skills = typeof getModuleSkills === "function" ? getModuleSkills("influence") : E.profile(l);
    const vals = skills.map((k) => ({ label: k.label, value: k.value }));
    const total = Math.round(vals.reduce((sum, k) => sum + k.value, 0) / Math.max(1, vals.length));
    const rank = typeof rankFromScore === "function" ? rankFromScore(total) : "";
    const svg = typeof buildRadarMarkup === "function" ? buildRadarMarkup(vals, 380, 190, 100, true) : "";
    return `<div class="inf-hex"><svg class="inf-hex-svg" viewBox="0 0 380 380" role="img" aria-label="Profilo dell'influenza: ${vals.map((k) => `${esc(k.label)} ${k.value}`).join(", ")}">${svg}</svg><div class="inf-hex-total"><strong>${total}</strong><span>punteggio dell'influenza${rank ? ` · rango ${rank}` : ""}</span></div></div>`;
  }

  /* ------------------------------------------------------------ MANUALE */
  function manualView() {
    if (ui.chapter) return chapterView(E.CHAPTERS.find((c) => c.id === ui.chapter));
    const l = lab();
    if (!E.CHAPTERS.length) return `<div class="inf-intro"><h2 data-focus tabindex="-1">Manuale</h2><p>I capitoli non sono stati caricati.</p></div>`;
    return `
      <div class="inf-manual">
        <div class="inf-intro"><h2 data-focus tabindex="-1">Manuale</h2><p>${E.CHAPTERS.length} capitoli, da leggere in ordine. Ogni leva ha l'esperimento che l'ha dimostrata, come usarla e come difendersi quando la usano su di te. In fondo a ogni capitolo trovi le fonti.</p></div>
        <ol class="inf-chapters">
          ${E.CHAPTERS.map((c, i) => `<li><button type="button" data-i="chapter" data-id="${c.id}"><span class="inf-ch-n">${i + 1}</span><span class="inf-ch-copy"><strong>${esc(c.title)}</strong><span>${esc(c.lead)}</span></span><em>${l.read[c.id] ? "letto" : `${c.minutes} min`}</em></button></li>`).join("")}
        </ol>
      </div>`;
  }
  function chapterView(c) {
    if (!c) { ui.chapter = null; return manualView(); }
    const l = lab();
    const idx = E.CHAPTERS.indexOf(c);
    const next = E.CHAPTERS[idx + 1];
    return `
      <div class="inf-chapter">
        ${backBar("← Tutti i capitoli", "chapters")}
        <article class="inf-card inf-reader">
          <span class="inf-kicker">Capitolo ${idx + 1} di ${E.CHAPTERS.length}</span>
          <h2 data-focus tabindex="-1">${esc(c.title)}</h2>
          <p class="inf-lead">${esc(c.lead)}</p>
          ${(c.sections || []).map((s) => `
            <section class="inf-sec">
              <h3>${esc(s.title)}</h3>
              ${(s.body || []).map((p) => `<p>${esc(p)}</p>`).join("")}
              ${s.study ? `<div class="inf-study"><span>${esc(s.study.title || "L'esperimento")}</span><p>${esc(s.study.text)}</p>${s.study.cite ? `<p class="inf-cite">${esc(s.study.cite)}${s.study.url ? ` · <a href="${esc(s.study.url)}" target="_blank" rel="noopener noreferrer">fonte</a>` : ""}</p>` : ""}</div>` : ""}
              ${s.use ? `<p class="inf-use"><b>Come si usa.</b> ${esc(s.use)}</p>` : ""}
              ${s.counter ? `<p class="inf-counter"><b>Contromossa.</b> ${esc(s.counter)}</p>` : ""}
            </section>`).join("")}
          ${c.sources && c.sources.length ? `<details class="inf-sources"><summary>Fonti del capitolo</summary><ul>${c.sources.map(([label, url]) => `<li>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label)}</li>`).join("")}</ul></details>` : ""}
          <div class="inf-actions">
            ${l.read[c.id] ? `<span class="inf-done-tag">Letto il ${dateShort(l.read[c.id])}</span>` : `<button type="button" class="primary-action" data-i="read" data-id="${c.id}">Segna come letto</button>`}
            ${c.families && c.families.length ? `<button type="button" class="ghost-action" data-i="spot" data-fam="${c.families.join(",")}">Mettiti alla prova</button>` : ""}
            ${next ? `<button type="button" class="ghost-action" data-i="chapter" data-id="${next.id}">Capitolo dopo: ${esc(next.title)}</button>` : ""}
          </div>
        </article>
      </div>`;
  }

  /* ------------------------------------------------------------ ALLENAMENTO */
  function famAcc(l, fams, n = 60) {
    const list = l.spot.history.filter((x) => fams.includes(x.fam)).slice(-n);
    return list.length ? { pct: Math.round((list.filter((x) => x.ok).length / list.length) * 100), n: list.length } : null;
  }
  function trainView() {
    const l = lab();
    const q = E.cardQueue(l);
    const a1 = famAcc(l, ["leva", "cornice", "nego"]);
    const a2 = famAcc(l, ["manip"], 40);
    const cs = l.cases.history;
    const csAvg = cs.length ? Math.round(cs.slice(-10).reduce((s, x) => s + x.pts, 0) / Math.min(10, cs.length)) : null;
    return `
      <div class="inf-train">
        <div class="inf-intro"><h2 data-focus tabindex="-1">Allenamento</h2><p>Riconoscere una leva mentre la stanno usando è metà del lavoro: l'altra metà è scegliere la mossa giusta. Quello che sbagli torna presto, finché non lo riconosci al volo.</p></div>
        <div class="inf-tiles">
          <article class="inf-tile">
            <h3>Riconosci la leva</h3>
            <p>10 messaggi veri, da venditori, clienti, colleghi, annunci. Quale tattica stanno usando?</p>
            <div class="inf-tile-stat">${a1 ? `<b>${a1.pct}%</b> giuste nelle ultime ${a1.n}` : "Ancora nessun turno"}</div>
            <button type="button" class="primary-action" data-i="spot" data-fam="leva,cornice,nego">Inizia</button>
          </article>
          <article class="inf-tile">
            <h3>Difesa dalla manipolazione</h3>
            <p>Messaggi da partner, «amici», capi, venditori aggressivi. Riconosci la manipolazione e la contromossa.</p>
            <div class="inf-tile-stat">${a2 ? `<b>${a2.pct}%</b> giuste nelle ultime ${a2.n}` : "Ancora nessun turno"}</div>
            <button type="button" class="primary-action" data-i="spot" data-fam="manip">Inizia</button>
          </article>
          <article class="inf-tile">
            <h3>Casi</h3>
            <p>Lavoro, vita di tutti i giorni ed esami speciali in stile Classroom of the Elite. Quattro mosse: una sola è quella giusta.</p>
            <div class="inf-tile-stat">${csAvg != null ? `<b>${csAvg}</b> punti di media su ${plural(cs.length, "caso", "casi")}` : `${E.CASES.length} casi`}</div>
            <button type="button" class="primary-action" data-i="cases">Due casi</button>
          </article>
          <article class="inf-tile">
            <h3>Schede</h3>
            <p>Definizioni e contromosse delle ${Object.keys(E.TACTICS).length} tattiche, con il ripasso distanziato.</p>
            <div class="inf-tile-stat"><b>${E.cardsLearned(l)}</b>/${E.CARD_IDS.length} imparate · ${q.due.length + q.fresh.length ? `${q.due.length + q.fresh.length} per oggi` : "niente per oggi"}</div>
            <button type="button" class="${q.due.length + q.fresh.length ? "primary-action" : "ghost-action"}" data-i="cards">${q.due.length + q.fresh.length ? "Ripassa" : "Ripassa lo stesso"}</button>
          </article>
        </div>
      </div>`;
  }

  /* ---- riconosci la leva */
  function startSpot(fams) {
    const l = lab();
    const round = E.makeSpotRound(l, { families: fams });
    if (!round.items.length) { announce("Nessun esercizio disponibile"); return; }
    ui.tab = ui.tab === "manual" ? "manual" : "train";
    ui.run = { type: "spot", round, feedback: null, t0: Date.now() };
    render(true);
  }
  function spotView() {
    const r = ui.run;
    const round = r.round;
    const manip = round.families.length === 1 && round.families[0] === "manip";
    const head = `${backBar("← Esci")}<div class="inf-run-head"><span class="inf-kicker">${manip ? "Difesa dalla manipolazione" : "Riconosci la leva"}</span><span>${Math.min(round.idx + (r.feedback ? 0 : 1), round.items.length)} di ${round.items.length}</span></div>`;
    if (round.done && !r.feedback) {
      const sum = E.spotSummary(round);
      const wrong = round.answers.filter((a) => !a.ok);
      return `${head}<article class="inf-card inf-result"><div class="inf-big"><strong>${sum.right}</strong><span>su ${sum.total}</span></div><div>
        <h2 data-focus tabindex="-1">${sum.pct >= 90 ? "Occhio da professionista" : sum.pct >= 70 ? "Buon turno" : sum.pct >= 50 ? "A metà strada" : "Da rifare"}</h2>
        ${wrong.length ? `<p>Da rivedere (torneranno presto):</p><ul class="inf-wrong">${wrong.map((a) => { const it = E.spotItem(a.id); return `<li><span>${esc(it.text)}</span><b>${esc(tac(it.answer).label)}</b>${a.choice ? `<em>hai scelto ${esc(tac(a.choice).label)}</em>` : ""}</li>`; }).join("")}</ul>` : "<p>Tutte giuste.</p>"}
        <div class="inf-actions"><button type="button" class="primary-action" data-i="spot" data-fam="${round.families.join(",")}" data-autofocus>Altri 10</button><button type="button" class="ghost-action" data-i="exit">Torna</button></div></div></article>`;
    }
    const cur = round.items[r.feedback ? round.idx - 1 : round.idx];
    const item = E.spotItem(cur.id);
    const fb = r.feedback;
    return `${head}<article class="inf-card inf-quiz">
      <p class="inf-ctx">${esc(item.ctx)}</p>
      <blockquote class="inf-quote">${esc(item.text)}</blockquote>
      <p class="inf-ask" data-focus tabindex="-1">${manip ? "Che manipolazione è?" : "Quale tattica stanno usando?"}</p>
      <div class="inf-options">${cur.options.map((o, i) => {
        let cls = "";
        if (fb) cls = o === item.answer ? "ok" : o === fb.choice ? "ko" : "dim";
        return `<button type="button" class="inf-opt ${cls}" data-i="spot-pick" data-v="${o}" ${fb ? "disabled" : ""}><span class="inf-key">${i + 1}</span>${esc(tac(o).label)}</button>`;
      }).join("")}</div>
      ${fb ? `<div class="inf-feedback ${fb.ok ? "ok" : "ko"}" role="status">
        <strong>${fb.ok ? "Giusto" : `No: è ${esc(tac(item.answer).label.toLowerCase())}`}</strong>
        <p>${esc(item.why)}</p>
        <p class="inf-counter"><b>Contromossa.</b> ${esc(item.counter)}</p>
        <p class="inf-small">${esc(tac(item.answer).label)}: ${esc(tac(item.answer).def)}</p>
        <div class="inf-actions"><button type="button" class="primary-action" data-i="spot-next" data-autofocus>${r.round.done ? "Vedi il risultato" : "Avanti"}</button></div>
      </div>` : ""}
    </article>`;
  }
  function spotPick(v) {
    const r = ui.run;
    if (!r || r.type !== "spot" || r.feedback || r.round.done) return;
    const res = E.spotAnswer(lab(), r.round, v, Date.now() - r.t0);
    r.feedback = { ok: res.ok, choice: v };
    save();
    render(true);
    announce(res.ok ? "Giusto" : `Sbagliato: era ${tac(res.item.answer).label}`);
  }
  function spotNext() {
    const r = ui.run;
    if (!r) return;
    r.feedback = null;
    r.t0 = Date.now();
    render(true);
  }

  /* ---- casi */
  function startCases(areas) {
    const list = E.pickCases(lab(), { n: 2, areas });
    if (!list.length) return;
    ui.tab = "train";
    ui.run = { type: "cases", list, idx: 0, picked: null, results: [], areas };
    render(true);
  }
  const AREA = { lavoro: "Lavoro", quotidiano: "Vita di tutti i giorni", esame: "Esame speciale", difesa: "Difesa" };
  function casesView() {
    const r = ui.run;
    const head = `${backBar("← Esci")}<div class="inf-run-head"><span class="inf-kicker">Casi</span><span>${Math.min(r.idx + 1, r.list.length)} di ${r.list.length}</span></div>`;
    if (r.idx >= r.list.length) {
      const avg = Math.round(r.results.reduce((s, x) => s + x.pts, 0) / r.results.length);
      return `${head}<article class="inf-card inf-result"><div class="inf-big"><strong>${avg}</strong><span>punti</span></div><div>
        <h2 data-focus tabindex="-1">${r.results.every((x) => x.pts === 100) ? "Sempre la mossa migliore" : avg >= 80 ? "Buone scelte" : "Da rivedere"}</h2>
        <p>100 = la mossa migliore. I punti tengono conto di efficacia (metà), relazione e rischio.</p>
        <div class="inf-actions"><button type="button" class="primary-action" data-i="cases" data-autofocus>Altri due</button><button type="button" class="ghost-action" data-i="exit">Torna</button></div></div></article>`;
    }
    const cur = r.list[r.idx];
    const c = E.caseById(cur.id);
    const picked = r.picked;
    const sc = picked != null ? E.scoreCase(c, picked) : null;
    return `${head}<article class="inf-card inf-case">
      <span class="inf-tag">${esc(AREA[c.area] || c.area)}</span>
      <h2 data-focus tabindex="-1">${esc(c.title)}</h2>
      <p>${esc(c.situation)}</p>
      <p class="inf-goal"><b>Obiettivo:</b> ${esc(c.goal)}</p>
      <div class="inf-case-opts">${cur.order.map((oi, k) => {
        const o = c.options[oi];
        if (!sc) return `<button type="button" class="inf-opt inf-opt-long" data-i="case-pick" data-v="${oi}"><span class="inf-key">${k + 1}</span><span>${esc(o.text)}</span></button>`;
        const best = oi === sc.bestIdx;
        const mine = oi === picked;
        return `<div class="inf-case-rev ${best ? "best" : ""} ${mine ? "mine" : ""}">
          <p class="inf-case-text">${esc(o.text)}</p>
          <div class="inf-case-tags">${best ? "<b>La mossa migliore</b>" : ""}${mine ? "<em>La tua scelta</em>" : ""}<span>${sc.scores[oi]} punti</span></div>
          <dl class="inf-axes"><div><dt>Efficacia</dt><dd>${bar(o.eff)}</dd></div><div><dt>Relazione</dt><dd>${bar(o.rel)}</dd></div><div><dt>Rischio</dt><dd>${bar(o.risk, "risk")}</dd></div></dl>
          <p class="inf-small">${esc(o.why)}${o.tactics && o.tactics.length ? ` <span class="inf-tactics">${o.tactics.map((t) => esc(tac(t).label)).join(" · ")}</span>` : ""}</p>
        </div>`;
      }).join("")}</div>
      ${sc ? `<div class="inf-actions"><button type="button" class="primary-action" data-i="case-next" data-autofocus>${r.idx + 1 < r.list.length ? "Caso dopo" : "Vedi il risultato"}</button></div>` : ""}
    </article>`;
  }
  function casePick(v) {
    const r = ui.run;
    if (!r || r.type !== "cases" || r.picked != null) return;
    const cur = r.list[r.idx];
    const res = E.recordCase(lab(), cur.id, Number(v));
    r.picked = Number(v);
    r.results.push(res);
    save();
    render(true);
    announce(res.pts === 100 ? "La mossa migliore" : `${res.pts} punti`);
  }

  /* ---- schede */
  function startCards() {
    const l = lab();
    const q = E.cardQueue(l);
    let queue = q.due.concat(q.fresh);
    if (!queue.length) {
      // ripasso libero: le schede gia' viste, prima quelle sbagliate di piu'
      queue = Object.keys(l.cards).sort((a, b) => (l.cards[b].wrong - l.cards[a].wrong) || (l.cards[a].due - l.cards[b].due)).slice(0, 10);
      if (!queue.length) queue = E.CARD_IDS.slice(0, 6);
    }
    ui.tab = "train";
    ui.run = { type: "cards", queue, idx: 0, q: E.cardQuestion(queue[0], Date.now()), answered: null, right: 0, total: 0, fresh: new Set(q.fresh) };
    render(true);
  }
  function cardsView() {
    const r = ui.run;
    const head = `${backBar("← Esci")}<div class="inf-run-head"><span class="inf-kicker">Schede</span><span>${Math.min(r.idx + 1, r.queue.length)} di ${r.queue.length}</span></div>`;
    if (r.idx >= r.queue.length) {
      return `${head}<article class="inf-card inf-result"><div class="inf-big"><strong>${r.right}</strong><span>su ${r.total}</span></div><div>
        <h2 data-focus tabindex="-1">Ripasso fatto</h2><p>Imparate in tutto: ${E.cardsLearned(lab())} su ${E.CARD_IDS.length}. Una scheda è imparata dopo tre risposte giuste in giorni diversi.</p>
        <div class="inf-actions"><button type="button" class="primary-action" data-i="exit" data-autofocus>Torna</button></div></div></article>`;
    }
    const q = r.q;
    const a = r.answered;
    const t = tac(q.tid);
    return `${head}<article class="inf-card inf-quiz">
      ${r.fresh.has(q.id) && !a ? `<p class="inf-ctx">Scheda nuova</p>` : ""}
      <blockquote class="inf-quote ${q.kind === "def" ? "" : "short"}">${esc(q.prompt)}</blockquote>
      <p class="inf-ask" data-focus tabindex="-1">${esc(q.ask)}</p>
      <div class="inf-options ${q.kind === "counter" ? "long" : ""}">${q.options.map((o, i) => {
        let cls = "";
        if (a) cls = o.value === q.answer ? "ok" : o.value === a.v ? "ko" : "dim";
        return `<button type="button" class="inf-opt ${q.kind === "counter" ? "inf-opt-long" : ""} ${cls}" data-i="card-pick" data-v="${o.value}" ${a ? "disabled" : ""}><span class="inf-key">${i + 1}</span><span>${esc(o.text)}</span></button>`;
      }).join("")}</div>
      ${a ? `<div class="inf-feedback ${a.ok ? "ok" : "ko"}" role="status"><strong>${a.ok ? "Giusto" : "No"}</strong><p><b>${esc(t.label)}.</b> ${esc(t.def)}</p><p class="inf-counter"><b>Contromossa.</b> ${esc(t.counter)}</p>
        <div class="inf-actions"><button type="button" class="primary-action" data-i="card-next" data-autofocus>Avanti</button></div></div>` : ""}
    </article>`;
  }
  function cardPick(v) {
    const r = ui.run;
    if (!r || r.type !== "cards" || r.answered) return;
    const ok = v === r.q.answer;
    E.cardAnswer(lab(), r.q.id, ok);
    r.answered = { v, ok };
    r.total += 1;
    if (ok) r.right += 1;
    save();
    render(true);
  }
  function cardNext() {
    const r = ui.run;
    r.idx += 1;
    r.answered = null;
    if (r.idx < r.queue.length) r.q = E.cardQuestion(r.queue[r.idx], Date.now() + r.idx);
    render(true);
  }

  /* ------------------------------------------------------------ TRATTATIVA */
  function game() { return lab().nego.current; }
  function negoView() {
    const l = lab();
    if (ui.finished) return debriefView(ui.finished.game, ui.finished.result);
    const g = l.nego.current;
    if (!g) return negoSetup(l);
    return gameView(g);
  }
  function negoSetup(l) {
    const level = ui.setupLevel || l.nego.level;
    const games = l.nego.history;
    return `
      <div class="inf-nego-setup">
        <div class="inf-intro"><h2 data-focus tabindex="-1">Trattativa</h2>
          <p>Tratti un prezzo con una controparte che ha un limite nascosto, una personalità e un interesse che non ti dice. Conosci la tua alternativa (se non chiudi, prendi quella) e i prezzi di mercato. Puoi fare offerte, motivarle con un criterio, fare domande, dare un nome alle sue preoccupazioni, citare la tua alternativa, chiudere o alzarti.</p>
          <p>Il risultato è il <b>valore catturato</b>: quanto dello spazio tra la tua alternativa e il massimo che l'altro avrebbe accettato hai portato a casa. Ogni tanto lo spazio non c'è: allora la mossa giusta è non chiudere.</p>
        </div>
        <section class="inf-card">
          <h3>Controparte</h3>
          <div class="inf-levels" role="group" aria-label="Livello della controparte">
            ${E.COUNTERPARTS.map((c) => `<button type="button" class="inf-level" data-i="lvl" data-v="${c.level}" aria-pressed="${c.level === level}" ${c.level > l.nego.unlocked ? "disabled" : ""}><b>${c.level}. ${esc(c.label)}</b><span>${c.level > l.nego.unlocked ? "Si sblocca con il 60% al livello prima" : esc(c.desc)}</span></button>`).join("")}
          </div>
          <h3>Situazione</h3>
          <label class="inf-field"><span>Scenario</span><select id="infDealSel"><option value="random" ${ui.setupDeal === "random" ? "selected" : ""}>A caso</option>${E.DEALS.map((d) => `<option value="${d.id}" ${ui.setupDeal === d.id ? "selected" : ""}>${esc(d.title)} (${d.role === "seller" ? "vendi" : "compri"})</option>`).join("")}</select></label>
          <div class="inf-actions"><button type="button" class="primary-action" data-i="nego-new" data-autofocus>Inizia la trattativa</button></div>
          ${games.length ? `<p class="inf-small">Ultime: ${games.slice(-5).reverse().map((h) => `${h.pct}% (${esc(E.dealById(h.deal) ? E.dealById(h.deal).title.toLowerCase() : h.deal)})`).join(" · ")}</p>` : ""}
        </section>
      </div>`;
  }
  function climate(g) {
    if (g.trust >= 0.62) return { label: "buono", cls: "good" };
    if (g.trust >= 0.42) return { label: "neutro", cls: "" };
    return { label: "teso", cls: "bad" };
  }
  function dossier(g, open) {
    const d = E.dealById(g.dealId);
    const opts = d.issue.options;
    return `<details class="inf-dossier" ${open ? "open" : ""}><summary>Il dossier</summary>
      <p>${esc(d.brief)}</p>
      <dl class="inf-facts">
        <div><dt>Tu</dt><dd>${d.role === "seller" ? "vendi: vuoi un prezzo alto" : "compri: vuoi un prezzo basso"}</dd></div>
        <div><dt>La tua alternativa</dt><dd>${esc(d.you.text)}</dd></div>
        <div><dt>Mercato</dt><dd>${esc(d.market.text)}</dd></div>
        <div><dt>Criteri che puoi citare</dt><dd>${d.criteria.map((c) => `${esc(c.text)}: <b>${euro(c.value)}</b>`).join("; ")}</dd></div>
        <div><dt>${esc(d.issue.label)}</dt><dd>${opts.map((o, i) => `${esc(o.label)}${i ? (o.you < 0 ? ` (a te costa ${euro(-o.you)})` : ` (per te vale ${euro(o.you)})`) : ""}`).join("; ")}${g.revealed ? `<br><span class="inf-reveal">Hai scoperto: ${esc(d.interestFromLabel || d.issue.interest)}</span>` : ""}</dd></div>
      </dl>
    </details>`;
  }
  function priceLine(g, reveal = null) {
    const d = E.dealById(g.dealId);
    const pts = [d.market.low, d.market.high, d.you.batna].concat(g.yours.map((x) => x.price), g.theirs.map((x) => x.price));
    if (reveal) pts.push(g.R, reveal.limitWithBest);
    let lo = Math.min(...pts);
    let hi = Math.max(...pts);
    const pad = (hi - lo) * 0.06 || 1000;
    lo -= pad; hi += pad;
    const x = (v) => (((v - lo) / (hi - lo)) * 100).toFixed(2);
    const lastY = g.yours[g.yours.length - 1];
    const lastT = g.theirs[g.theirs.length - 1];
    const zopa = reveal ? (() => {
      const a = d.you.batna;
      const b = reveal.limitWithBest;
      const ok = g.s > 0 ? b > a : b < a;
      const l = Math.min(a, b);
      const r = Math.max(a, b);
      return `<span class="inf-zopa ${ok ? "" : "none"}" style="left:${x(l)}%;width:${(x(r) - x(l)).toFixed(2)}%"></span>`;
    })() : "";
    return `<div class="inf-line" role="img" aria-label="Linea del prezzo: mercato da ${euro(d.market.low)} a ${euro(d.market.high)}, la tua alternativa ${euro(d.you.batna)}${lastY ? `, la tua ultima offerta ${euro(lastY.price)}` : ""}${lastT ? `, la loro ultima offerta ${euro(lastT.price)}` : ""}${reveal ? `, il loro limite ${euro(g.R)}` : ""}">
      <div class="inf-line-labels top">${lastY ? `<span class="you" style="left:${clampPct(x(lastY.price))}%">Tu ${euro(lastY.price)}</span>` : ""}</div>
      <div class="inf-track">
        <span class="inf-market" style="left:${x(d.market.low)}%;width:${(x(d.market.high) - x(d.market.low)).toFixed(2)}%"></span>
        ${zopa}
        ${g.theirs.map((o, i) => `<span class="inf-dot them ${i === g.theirs.length - 1 ? "last" : ""}" style="left:${x(o.price)}%"></span>`).join("")}
        ${g.yours.map((o, i) => `<span class="inf-dot you ${i === g.yours.length - 1 ? "last" : ""}" style="left:${x(o.price)}%"></span>`).join("")}
        <span class="inf-flag batna" style="left:${x(d.you.batna)}%"><i></i></span>
        ${reveal ? `<span class="inf-flag limit" style="left:${x(g.R)}%"><i></i></span>` : ""}
      </div>
      <div class="inf-line-labels bottom">${lastT ? `<span class="them" style="left:${clampPct(x(lastT.price))}%">Loro ${euro(lastT.price)}</span>` : ""}</div>
      <div class="inf-line-legend"><span><i class="k-market"></i>mercato</span><span><i class="k-batna"></i>la tua alternativa ${euro(d.you.batna)}</span>${reveal ? `<span><i class="k-limit"></i>il loro limite ${euro(g.R)}</span><span><i class="k-zopa"></i>spazio d'accordo</span>` : ""}</div>
    </div>`;
  }
  const clampPct = (v) => Math.max(9, Math.min(91, Number(v))).toFixed(2);
  function chat(g, all = false) {
    const list = all ? g.log : g.log.slice(-8);
    return `<ol class="inf-chat" aria-live="polite">${list.map((m) => `<li class="${m.who === "you" ? "you" : "them"} ${m.tone || ""}"><span>${esc(m.text)}</span></li>`).join("")}</ol>`;
  }
  function labelOrder(g) {
    const d = E.dealById(g.dealId);
    return E.shuffle(d.labels.map((_, i) => i), E.rng(g.seed + 17));
  }
  function gameView(g) {
    const d = E.dealById(g.dealId);
    const cp = E.cpById(g.cpId);
    const cl = climate(g);
    const head = `<div class="inf-run-head"><span class="inf-kicker">${esc(d.title)}</span><span>${esc(d.who)} · ${esc(cp.label.toLowerCase())}</span></div>`;
    if (g.phase === "start") {
      return `${head}<article class="inf-card">
        <h2 data-focus tabindex="-1">${esc(d.title)}</h2>
        ${dossier(g, true)}
        <p>Chi apre? Fare la prima offerta ti dà l'ancora, ma se sbagli cifra lasci valore sul tavolo. Lasciare aprire loro ti dà un'informazione, ma ti espone alla loro ancora.</p>
        <div class="inf-actions"><button type="button" class="primary-action" data-i="open" data-v="you" data-autofocus>Faccio io la prima offerta</button><button type="button" class="ghost-action" data-i="open" data-v="them">Lascio aprire loro</button><button type="button" class="ghost-action" data-i="nego-quit">Lascia stare</button></div>
      </article>`;
    }
    const opts = d.issue.options;
    const step = d.step;
    const dr = ui.draft;
    const needOffer = g.theirPrice == null;
    const tabs = [["offer", "Offerta"], ["question", "Domanda"], ["label", "Etichetta"], ["batna", "Alternativa"], ["close", "Chiudi"]];
    let panel = "";
    if (ui.move === "offer" || needOffer) {
      panel = `
        <div class="inf-offer">
          <label class="inf-field inf-price"><span>Prezzo</span>
            <span class="inf-stepper"><button type="button" class="ghost-action small" data-i="step" data-v="-1" aria-label="Meno ${euro(step)}">−</button><input id="infPrice" type="text" inputmode="numeric" autocomplete="off" value="${esc(dr.price)}" placeholder="es. ${euro(d.role === "seller" ? d.market.high : d.market.low).replace(" €", "")}"><button type="button" class="ghost-action small" data-i="step" data-v="1" aria-label="Più ${euro(step)}">+</button></span>
          </label>
          <label class="inf-field"><span>${esc(d.issue.label)}</span><select id="infOpt">${opts.map((o, i) => `<option value="${i}" ${Number(dr.opt) === i ? "selected" : ""}>${esc(o.label)}</option>`).join("")}</select></label>
          <label class="inf-field"><span>Motiva con</span><select id="infCrit"><option value="">nessun criterio</option>${d.criteria.map((c) => `<option value="${c.id}" ${dr.criterion === c.id ? "selected" : ""}>${esc(c.text)} (${euro(c.value)})</option>`).join("")}</select></label>
          <div class="inf-actions"><button type="button" class="primary-action" data-i="offer">Proponi</button>${needOffer ? "" : `<button type="button" class="ghost-action" data-i="ultimatum">Ultima offerta</button>`}</div>
        </div>`;
    } else if (ui.move === "question") {
      panel = `<div class="inf-moves">
        <button type="button" class="inf-move" data-i="q" data-v="calibrated"><b>«${g.qCal % 2 === 0 ? "Cosa ti serve per chiudere oggi?" : "Come faccio ad accettare questa cifra con quello che ho a disposizione?"}»</b><span>domanda aperta</span></button>
        <button type="button" class="inf-move" data-i="q" data-v="closed"><b>«È davvero il massimo che puoi fare?»</b><span>domanda chiusa</span></button>
        <button type="button" class="inf-move" data-i="q" data-v="why"><b>«Perché così?»</b><span>chiedi di giustificarsi</span></button>
      </div>`;
    } else if (ui.move === "label") {
      panel = `<div class="inf-moves">${labelOrder(g).map((i) => `<button type="button" class="inf-move" data-i="lab" data-v="${i}"><b>«${esc(d.labels[i].text)}»</b></button>`).join("")}</div>`;
    } else if (ui.move === "batna") {
      panel = `<div class="inf-moves">
        <button type="button" class="inf-move" data-i="batna-true"><b>«Ho un'alternativa: ${euro(d.you.batna)}.»</b><span>la verità</span></button>
        <div class="inf-claim"><label class="inf-field"><span>Oppure dichiara un'altra cifra</span><input id="infClaim" type="text" inputmode="numeric" autocomplete="off" value="${esc(dr.claim)}" placeholder="cifra"></label><button type="button" class="ghost-action" data-i="batna-claim">Dichiara</button></div>
        <p class="inf-small">Una cifra diversa dalla tua alternativa vera è un bluff: può funzionare, può farti scoprire.</p>
      </div>`;
    } else {
      const last = g.yours[g.yours.length - 1];
      const mid = last && g.theirPrice != null ? Math.round((last.price + g.theirPrice) / 2 / step) * step : null;
      panel = `<div class="inf-moves">
        <button type="button" class="inf-move" data-i="accept"><b>Accetta la loro offerta</b><span>${euro(g.theirPrice)}${g.tableOpt ? `, ${esc(opts[g.tableOpt].label)}` : ""}</span></button>
        ${mid != null ? `<button type="button" class="inf-move" data-i="split"><b>«Facciamo a metà»</b><span>${euro(mid)}</span></button>` : ""}
        <button type="button" class="inf-move danger" data-i="walk"><b>Alzati dal tavolo</b><span>prendi la tua alternativa: ${euro(d.you.batna)}</span></button>
        <button type="button" class="ghost-action small inf-quit" data-i="nego-quit">Abbandona senza registrare la partita</button>
      </div>`;
    }
    return `${head}<div class="inf-game">
      <div class="inf-game-main">
        <div class="inf-table">
          <div class="inf-table-top"><span>Turno ${g.round + 1}</span><span class="inf-climate ${cl.cls}">Clima: ${cl.label}</span></div>
          ${priceLine(g)}
        </div>
        ${chat(g)}
        <section class="inf-card inf-actions-panel">
          ${needOffer ? `<p class="inf-ask" data-focus tabindex="-1">Fai la tua prima offerta: è la tua ancora.</p>` : `<div class="inf-seg" role="group" aria-label="Tipo di mossa">${tabs.map(([k, label]) => `<button type="button" data-i="move" data-v="${k}" aria-pressed="${ui.move === k}">${label}</button>`).join("")}</div>`}
          ${panel}
        </section>
      </div>
      <aside class="inf-game-side">${dossier(g, window.innerWidth > 900)}<button type="button" class="ghost-action small" data-i="nego-quit">Abbandona la partita</button></aside>
    </div>`;
  }
  function parsePrice(v) {
    const n = Number(String(v || "").replace(/[^\d]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  function doAct(action) {
    const l = lab();
    const g = l.nego.current;
    if (!g) return;
    E.act(g, action);
    if (g.done) finishGame(g);
    else { save(); render(false); scrollChat(); }
  }
  function scrollChat() {
    const box = document.querySelector("#infPanel .inf-chat");
    if (box) box.scrollTop = box.scrollHeight;
  }
  function finishGame(g) {
    const l = lab();
    const res = E.recordGame(l, g);
    l.nego.current = null;
    ui.finished = { game: g, result: res };
    save();
    render(true);
    announce(`${res.grade}: ${res.pct}%`);
  }
  function debriefView(g, r) {
    const d = E.dealById(g.dealId);
    const cp = E.cpById(g.cpId);
    const icon = { good: "✓", bad: "✕", info: "i" };
    return `<div class="inf-debrief">
      <div class="inf-run-head"><span class="inf-kicker">${esc(d.title)}</span><span>${esc(cp.label)} · livello ${g.level}</span></div>
      <article class="inf-card inf-result">
        <div class="inf-big ${r.zopa && !r.deal ? "bad" : ""}"><strong>${r.pct}%</strong><span>valore catturato</span></div>
        <div>
          <h2 data-focus tabindex="-1">${esc(r.grade)}</h2>
          <p>${r.deal ? `Accordo a <b>${euro(r.price)}</b>${r.opt ? `, ${esc(d.issue.options[r.opt].label)}` : ""}.` : "Nessun accordo: prendi la tua alternativa."} La tua alternativa: ${euro(d.you.batna)}. Il loro limite: <b>${euro(r.R)}</b>${r.bestOpt ? ` (${euro(r.limitWithBest)} con ${esc(d.issue.options[r.bestOpt].label)})` : ""}.</p>
          ${r.unlocked ? `<p class="inf-unlock">Hai sbloccato il livello ${r.nextLevel}: ${esc(E.cpByLevel(r.nextLevel).label.toLowerCase())}.</p>` : ""}
          <div class="inf-actions">
            ${r.unlocked ? `<button type="button" class="primary-action" data-i="nego-level" data-v="${r.nextLevel}" data-autofocus>Gioca al livello ${r.nextLevel}</button>` : ""}
            <button type="button" class="${r.unlocked ? "ghost-action" : "primary-action"}" data-i="nego-again" ${r.unlocked ? "" : "data-autofocus"}>Un'altra trattativa</button>
            <button type="button" class="ghost-action" data-i="nego-done">Torna</button>
          </div>
        </div>
      </article>
      <section class="inf-card"><h3>La linea del prezzo, scoperta</h3>${priceLine(g, r)}</section>
      <section class="inf-card"><h3>Cosa ha funzionato e cosa no</h3><ul class="inf-lessons">${r.lessons.map((x) => `<li class="${x.kind}"><span aria-hidden="true">${icon[x.kind]}</span><p>${esc(x.text)}</p></li>`).join("")}</ul></section>
      <details class="inf-card inf-replay"><summary>Rileggi la conversazione</summary>${chat(g, true)}</details>
    </div>`;
  }
  function newNego() {
    const l = lab();
    const level = ui.setupLevel || l.nego.level;
    E.setNegoLevel(l, level);
    const sel = $("infDealSel");
    if (sel) ui.setupDeal = sel.value;
    const g = E.newGame({ dealId: ui.setupDeal === "random" ? null : ui.setupDeal, level: l.nego.level, seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0, noZopa: l.nego.history.length < 2 ? false : undefined });
    l.nego.current = g;
    ui.finished = null;
    ui.move = "offer";
    ui.draft = { price: "", opt: 0, criterion: "", claim: "" };
    save();
    render(true);
  }

  /* ------------------------------------------------------------ PROGRESSI */
  function progressView() {
    const l = lab();
    const games = l.nego.history.slice(-20);
    const fams = ["leva", "cornice", "nego", "manip"].map((f) => ({ f, a: famAcc(l, [f], 200) }));
    const worst = Object.entries(l.spot.items).filter(([, s]) => s.wrong > 0).map(([id, s]) => ({ item: E.spotItem(id), s })).filter((x) => x.item);
    const byTac = {};
    worst.forEach(({ item, s }) => { byTac[item.answer] = (byTac[item.answer] || 0) + s.wrong; });
    const top = Object.entries(byTac).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const days = calendar(l);
    return `
      <div class="inf-prog">
        <div class="inf-intro"><h2 data-focus tabindex="-1">Progressi</h2><p>Le sei categorie vengono dai dati: trattative, risposte, casi e schede. All'inizio partono da 35 e si muovono man mano che ti alleni.</p></div>
        <section class="inf-card inf-prof-card"><h3>Profilo</h3>${profileMini(l)}</section>
        <section class="inf-card"><h3>Trattative</h3>${games.length ? negoChart(games) + `<table class="inf-table-list"><thead><tr><th scope="col">Data</th><th scope="col">Scenario</th><th scope="col">Controparte</th><th scope="col">Valore</th></tr></thead><tbody>${games.slice(-8).reverse().map((h) => `<tr><td>${dateShort(h.t)}</td><td>${esc(E.dealById(h.deal) ? E.dealById(h.deal).title : h.deal)}</td><td>${esc(E.cpById(h.cp) ? E.cpById(h.cp).label : h.cp)}</td><td>${h.pct}%${h.zopa ? (h.ok ? "" : " · mancato") : h.ok ? " · da evitare" : " · giusto non chiudere"}</td></tr>`).join("")}</tbody></table>` : `<p class="inf-empty">Ancora nessuna trattativa.</p>`}</section>
        <section class="inf-card"><h3>Riconoscimento per famiglia</h3><ul class="inf-profile">${fams.map(({ f, a }) => `<li><span>${esc(E.FAMILIES[f] ? E.FAMILIES[f].label : f)}</span>${bar(a ? a.pct : 0)}<strong>${a ? `${a.pct}%` : "—"}</strong></li>`).join("")}</ul>
          ${top.length ? `<h3>Le tattiche che confondi di più</h3><ol class="inf-top">${top.map(([id, n]) => `<li><b>${esc(tac(id).label)}</b> <span>${plural(n, "errore", "errori")}</span><p class="inf-small">${esc(tac(id).def)}</p></li>`).join("")}</ol>` : ""}
        </section>
        <section class="inf-card"><h3>Ultime 8 settimane</h3><div class="inf-cal" role="img" aria-label="${days.filter((x) => x.on).length} giorni di allenamento nelle ultime 8 settimane">${days.map((x) => `<i class="${x.on ? "on" : ""} ${x.today ? "today" : ""}" title="${x.label}"></i>`).join("")}</div><p class="inf-small">${plural(days.filter((x) => x.on).length, "giorno", "giorni")} su 56 · serie attuale: ${plural(E.streak(l), "giorno", "giorni")}</p></section>
      </div>`;
  }
  function negoChart(games) {
    const W = 560;
    const H = 170;
    const P = 30;
    const x = (i) => P + (games.length === 1 ? (W - 2 * P) / 2 : (i / (games.length - 1)) * (W - 2 * P));
    const y = (v) => H - P - (v / 100) * (H - 2 * P);
    const path = games.map((g, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(g.pct).toFixed(1)}`).join(" ");
    return `<svg class="inf-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Valore catturato nelle ultime trattative: ${games.map((g) => g.pct).join(", ")}">
      <line x1="${P}" x2="${W - P}" y1="${y(60)}" y2="${y(60)}" class="goal"/><text x="${W - P}" y="${y(60) - 4}" text-anchor="end" class="lbl">60%: livello superato</text>
      <path d="${path}" class="line"/>
      ${games.map((g, i) => `<circle cx="${x(i)}" cy="${y(g.pct)}" r="4.5" class="dot l${g.level}"><title>${dateShort(g.t)}: ${g.pct}% (livello ${g.level})</title></circle>`).join("")}
      <text x="${P}" y="${H - 8}" class="lbl">${dateShort(games[0].t)}</text>${games.length > 1 ? `<text x="${W - P}" y="${H - 8}" text-anchor="end" class="lbl">${dateShort(games[games.length - 1].t)}</text>` : ""}
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
    const panel = $("infPanel");
    if (!panel) return;
    if (!soft) renderedAt = Date.now();
    renderChip();
    document.querySelectorAll("#influence [data-inf-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.infTab === ui.tab && !ui.run)));
    let html;
    if (ui.run) {
      if (ui.run.type === "spot") html = spotView();
      else if (ui.run.type === "cases") html = casesView();
      else html = cardsView();
    } else if (ui.tab === "manual") html = manualView();
    else if (ui.tab === "train") html = trainView();
    else if (ui.tab === "nego") html = negoView();
    else if (ui.tab === "progress") html = progressView();
    else html = todayView();
    panel.innerHTML = html;
    const page = $("influence");
    const playing = Boolean(ui.run) || (ui.tab === "nego" && lab().nego.current && lab().nego.current.phase !== "start");
    if (page) page.classList.toggle("inf-running", playing);
    if (focus) {
      const el = panel.querySelector("[data-autofocus]") || panel.querySelector("[data-focus]");
      if (el) el.focus({ preventScroll: true });
      const top = panel.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: Math.max(0, window.scrollY + top - 12), behavior: "auto" });
    }
    scrollChat();
  }
  function setTab(tab) {
    ui.run = null;
    ui.tab = tab;
    ui.chapter = null;
    if (tab !== "nego") ui.finished = null;
    render(true);
  }
  function go(target) {
    ui.run = null;
    ui.finished = null;
    if (target.kind === "read") { ui.tab = "manual"; ui.chapter = target.id || null; render(true); return; }
    if (target.kind === "cards") { startCards(); return; }
    if (target.kind === "spot") { startSpot(["leva", "cornice", "nego"]); return; }
    if (target.kind === "defense") { startSpot(["manip"]); return; }
    if (target.kind === "cases") { startCases(null); return; }
    if (target.kind === "nego") { ui.tab = "nego"; render(true); return; }
    setTab("today");
  }

  // un doppio clic non deve premere anche il pulsante che compare al suo posto
  const SOFT = new Set(["step", "move", "lvl"]);
  function onClick(event) {
    const el = event.target.closest("[data-i]");
    if (!el || !$("influence").contains(el) || el.disabled) return;
    const a = el.dataset.i;
    if (!a) return;
    if (!SOFT.has(a) && (event.detail > 1 || Date.now() - renderedAt < 300)) return;
    const l = lab();
    const g = l.nego.current;
    const d = g ? E.dealById(g.dealId) : null;
    switch (a) {
      case "exit": ui.run = null; render(true); break;
      case "tab": setTab(el.dataset.tab); break;
      case "go": try { go(JSON.parse(el.dataset.go)); } catch (e) { setTab("today"); } break;
      case "chapters": ui.chapter = null; render(true); break;
      case "chapter": ui.tab = "manual"; ui.run = null; ui.chapter = el.dataset.id; render(true); break;
      case "read": E.markRead(l, el.dataset.id); save(); render(false); break;
      case "spot": startSpot(String(el.dataset.fam || "leva,cornice,nego").split(",")); break;
      case "spot-pick": spotPick(el.dataset.v); break;
      case "spot-next": spotNext(); break;
      case "cases": startCases(null); break;
      case "case-pick": casePick(el.dataset.v); break;
      case "case-next": ui.run.idx += 1; ui.run.picked = null; render(true); break;
      case "cards": startCards(); break;
      case "card-pick": cardPick(el.dataset.v); break;
      case "card-next": cardNext(); break;
      case "lvl": ui.setupLevel = Number(el.dataset.v); render(false, true); break;
      case "nego-new": newNego(); break;
      case "nego-again": ui.finished = null; newNego(); break;
      case "nego-level": ui.setupLevel = Number(el.dataset.v); ui.finished = null; newNego(); break;
      case "nego-done": ui.finished = null; render(true); break;
      case "nego-quit": if (g) { l.nego.current = null; save(); } ui.finished = null; render(true); break;
      case "open": if (g) { E.start(g, el.dataset.v); save(); render(true); } break;
      case "move": ui.move = el.dataset.v; render(false, true); break;
      case "step": {
        if (!d) break;
        const inp = $("infPrice");
        const cur = parsePrice(inp ? inp.value : ui.draft.price) || (g.yours.length ? g.yours[g.yours.length - 1].price : (d.market.low + d.market.high) / 2);
        const v = Math.round((cur + Number(el.dataset.v) * d.step) / d.step) * d.step;
        ui.draft.price = String(v);
        if (inp) inp.value = ui.draft.price;
        break;
      }
      case "offer": case "ultimatum": {
        if (!d) break;
        const price = parsePrice($("infPrice") ? $("infPrice").value : ui.draft.price);
        if (!price) { announce("Scrivi un prezzo"); const inp = $("infPrice"); if (inp) inp.focus(); break; }
        ui.draft.price = String(price);
        ui.draft.opt = Number($("infOpt") ? $("infOpt").value : ui.draft.opt) || 0;
        ui.draft.criterion = $("infCrit") ? $("infCrit").value : "";
        doAct({ type: a, price, opt: ui.draft.opt, criterion: ui.draft.criterion || null });
        ui.draft.criterion = "";
        break;
      }
      case "q": doAct({ type: "question", kind: el.dataset.v }); break;
      case "lab": doAct({ type: "label", index: Number(el.dataset.v) }); break;
      case "batna-true": doAct({ type: "batna" }); break;
      case "batna-claim": {
        const v = parsePrice($("infClaim") ? $("infClaim").value : "");
        if (!v) { announce("Scrivi una cifra"); break; }
        doAct({ type: "batna", claim: v });
        break;
      }
      case "accept": doAct({ type: "accept" }); break;
      case "split": doAct({ type: "split" }); break;
      case "walk": doAct({ type: "walk" }); break;
      default: break;
    }
  }
  function onInput(event) {
    const t = event.target;
    if (t.id === "infPrice") ui.draft.price = t.value;
    if (t.id === "infClaim") ui.draft.claim = t.value;
  }
  function onChange(event) {
    const t = event.target;
    if (t.id === "infOpt") ui.draft.opt = Number(t.value) || 0;
    if (t.id === "infCrit") ui.draft.criterion = t.value;
    if (t.id === "infDealSel") ui.setupDeal = t.value;
  }
  function onKey(event) {
    const page = $("influence");
    if (!page || !page.classList.contains("active-page")) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const typing = event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
    if (typing && event.key === "Enter" && event.target.id === "infPrice") {
      event.preventDefault();
      const btn = document.querySelector('#infPanel [data-i="offer"]');
      if (btn) btn.click();
      return;
    }
    if (typing) return;
    const r = ui.run;
    if (!r) return;
    const n = /^[1-4]$/.test(event.key) ? Number(event.key) - 1 : null;
    if (r.type === "spot" && !r.feedback && n != null && !r.round.done) { spotPick(r.round.items[r.round.idx].options[n]); event.preventDefault(); }
    else if (r.type === "cards" && !r.answered && n != null && r.q) { cardPick(r.q.options[n].value); event.preventDefault(); }
    else if (r.type === "cases" && r.picked == null && n != null && r.list[r.idx]) { casePick(r.list[r.idx].order[n]); event.preventDefault(); }
  }

  window.InfluenceUI = { render, setTab, debug: ui };
  window.influenceProfileSkills = () => E.profile(lab());
  window.influenceTrend = () => E.trend(lab());

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("influence");
    if (!page) return;
    page.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-inf-tab]");
      if (tab) { setTab(tab.dataset.infTab); return; }
      if (event.target.closest("#infChip")) { setTab("today"); return; }
      onClick(event);
    });
    page.addEventListener("input", onInput);
    page.addEventListener("change", onChange);
    document.addEventListener("keydown", onKey);
    render(false);
  });
})();
