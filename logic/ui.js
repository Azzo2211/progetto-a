/*
 * Progetto A - Logica: la pagina (Oggi, Allenamento, Trappole, Metodo, Progressi).
 * Motore: window.LogicEngine. Generatori: window.LogicGen. Stato: state.logicLab.
 * Usa le globali di app.js: state, saveState, renderDashboard, buildRadarMarkup, rankFromScore, getModuleSkills.
 */
(function () {
  "use strict";

  const E = window.LogicEngine;
  const G = window.LogicGen;
  if (!E || !G) return;

  const ui = {
    tab: "today",      // today | train | traps | method | progress
    run: null,         // turno in corso { type: "round", round } | { type: "trap", id, answered }
    lesson: null,
    progKey: "matrix",
    gridAns: null,     // risposte della griglia in corso
    knAns: null,       // risposte dei cavalieri
    pickLevel: {}      // livello scelto a mano per disciplina (0 = automatico)
  };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const dateShort = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const fmtNum = (v) => String(Math.round(v * 100) / 100).replace(".", ",");

  function lab() {
    state.logicLab = E.ensure(state.logicLab);
    return state.logicLab;
  }
  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
    renderChip();
  }
  function announce(text) {
    const live = $("logLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }
  function backBar(label = "← Esci", act = "exit") {
    return `<div class="log-back"><button type="button" class="ghost-action small" data-l="${act}">${esc(label)}</button></div>`;
  }

  /* ------------------------------------------------------------ esagono */
  function hexProfile(l) {
    const skills = typeof getModuleSkills === "function" ? getModuleSkills("logic") : E.profile(l);
    const vals = skills.map((k) => ({ label: k.label, value: k.value }));
    const total = Math.round(vals.reduce((s, k) => s + k.value, 0) / Math.max(1, vals.length));
    const rank = typeof rankFromScore === "function" ? rankFromScore(total) : "";
    const svg = typeof buildRadarMarkup === "function" ? buildRadarMarkup(vals, 380, 190, 98, true) : "";
    return `<div class="log-hex"><svg class="log-hex-svg" viewBox="0 0 380 380" role="img" aria-label="Profilo della logica: ${vals.map((k) => `${esc(k.label)} ${k.value}`).join(", ")}">${svg}</svg><div class="log-hex-total"><strong>${total}</strong><span>punteggio della logica${rank ? ` · rango ${rank}` : ""}</span></div></div>`;
  }

  /* ------------------------------------------------------------ chip */
  function renderChip() {
    const box = $("logChip");
    if (!box) return;
    const l = lab();
    const steps = E.plan(l);
    const left = steps.filter((s) => !s.done).length;
    const st = E.streak(l);
    box.innerHTML = `<span class="log-chip-num">${left}</span><span class="log-chip-copy"><strong>${left ? `${plural(left, "passo", "passi")} oggi` : "Programma di oggi fatto"}</strong><span>${st ? `${plural(st, "giorno", "giorni")} di fila` : "Inizia oggi la serie"}</span></span>`;
  }

  /* ------------------------------------------------------------ OGGI */
  function todayView() {
    const l = lab();
    const steps = E.plan(l);
    const done = steps.filter((s) => s.done).length;
    return `
      <div class="log-today">
        <section class="log-card log-plan">
          <div class="log-plan-head"><h2 data-focus tabindex="-1">Programma di oggi</h2><span>${done}/${steps.length} fatti · circa ${steps.reduce((s, x) => s + x.minutes, 0)} minuti</span></div>
          <ol class="log-steps">
            ${steps.map((s) => `
              <li class="${s.done ? "done" : ""}">
                <span class="log-step-mark" aria-hidden="true">${s.done ? "✓" : ""}</span>
                <div><strong>${esc(s.title)}</strong><span>${esc(s.detail)}</span></div>
                <span class="log-step-min">${s.minutes} min</span>
                <button type="button" class="${s.done ? "ghost-action" : "primary-action"} small" data-l="go" data-go='${esc(JSON.stringify(s.go))}'>${s.done ? "Rifai" : "Inizia"}<span class="log-sr">: ${esc(s.title)}</span></button>
              </li>`).join("")}
          </ol>
        </section>
        <aside class="log-side">
          <h3>Profilo</h3>
          ${hexProfile(l)}
          <h3 class="log-side-how">Come funziona</h3>
          <p>Ogni esercizio è generato al momento e controllato dal programma: ha una sola soluzione. Per ogni disciplina hai un punteggio come negli scacchi: 1000 vuol dire risolvere quello che risolve il partecipante tipico degli studi una volta su due.</p>
          <p>Il livello si adatta da solo perché tu ne risolva circa 6 su 10: è la zona in cui si impara. Allenarsi sugli indovinelli migliora gli indovinelli; quello che si porta nella vita vera sono i metodi (sezione Metodo).</p>
        </aside>
      </div>`;
  }

  /* ------------------------------------------------------------ ALLENAMENTO */
  function trainView() {
    const l = lab();
    return `
      <div class="log-train">
        <div class="log-intro"><h2 data-focus tabindex="-1">Allenamento</h2><p>Sette discipline, ognuna con il suo punteggio. Scegli il livello automatico (consigliato) o fissalo tu.</p></div>
        <div class="log-tiles">
          ${E.KEYS.map((k) => {
            const d = E.DISCIPLINES[k];
            const st = l.ratings[k];
            const auto = E.autoLevel(l, k);
            const chosen = ui.pickLevel[k] || 0;
            return `<article class="log-tile">
              <div class="log-tile-head"><h3>${esc(d.label)}</h3><span class="log-elo" title="Punteggio">${st.r}</span></div>
              <p>${esc(d.desc)}</p>
              <div class="log-tile-stat">${st.n ? `${st.n} esercizi · ${Math.round((st.ok / st.n) * 100)}% giusti` : "Mai provata"}</div>
              <div class="log-tile-actions">
                <label class="log-lv"><span class="log-sr">Livello</span><select data-lvsel="${k}">${[0, ...Array.from({ length: E.maxLevel(k) }, (_, i) => i + 1)].map((v) => `<option value="${v}" ${v === chosen ? "selected" : ""}>${v ? `Livello ${v}` : `Automatico (${auto})`}</option>`).join("")}</select></label>
                <button type="button" class="primary-action small" data-l="train" data-key="${k}">Allenati<span class="log-sr">: ${esc(d.label)}</span></button>
              </div>
            </article>`;
          }).join("")}
        </div>
      </div>`;
  }

  function startRound(key) {
    const l = lab();
    const lv = ui.pickLevel[key] || 0;
    const round = E.makeRound(l, key, lv ? { level: lv } : {});
    ui.run = { type: "round", round };
    ui.tab = "train";
    resetAnswers();
    render(true);
  }
  function resetAnswers() {
    const r = ui.run && ui.run.round;
    ui.gridAns = null;
    ui.knAns = null;
    if (!r || !r.item) return;
    if (r.item.kind === "grid") ui.gridAns = Object.fromEntries(r.item.cats.map((c) => [c, Array(r.item.n).fill("")]));
    if (r.item.kind === "knights") ui.knAns = Array(r.item.n).fill(null);
  }

  /* ---- disegno delle matrici */
  const POS = {
    1: [[50, 50]],
    2: [[30, 50], [70, 50]],
    3: [[50, 30], [29, 68], [71, 68]],
    4: [[31, 31], [69, 31], [31, 69], [69, 69]],
    5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]]
  };
  const BASE_R = { 1: 30, 2: 18, 3: 16, 4: 15, 5: 12 };
  const FILLS = ["#ffffff", "#9aa3ab", "#1d2329"];
  function poly(n, r, cx, cy, rot = -90) {
    return Array.from({ length: n }, (_, i) => {
      const a = ((rot + (360 / n) * i) * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  }
  function shapeSvg(shape, cx, cy, r, fill) {
    const st = `fill="${fill}" stroke="#1d2329" stroke-width="2.4" stroke-linejoin="round"`;
    if (shape === "circle") return `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" ${st}/>`;
    if (shape === "square") return `<rect x="${(cx - r * 0.86).toFixed(1)}" y="${(cy - r * 0.86).toFixed(1)}" width="${(r * 1.72).toFixed(1)}" height="${(r * 1.72).toFixed(1)}" ${st}/>`;
    if (shape === "triangle") return `<polygon points="${poly(3, r * 1.08, cx, cy + r * 0.18)}" ${st}/>`;
    if (shape === "diamond") return `<polygon points="${poly(4, r * 1.05, cx, cy)}" ${st}/>`;
    if (shape === "pentagon") return `<polygon points="${poly(5, r, cx, cy + r * 0.06)}" ${st}/>`;
    return `<polygon points="${poly(6, r, cx, cy, 0)}" ${st}/>`;
  }
  const LINE_XY = { h: [8, 50, 92, 50], v: [50, 8, 50, 92], d1: [10, 10, 90, 90], d2: [10, 90, 90, 10] };
  function cellSvg(cell) {
    if (!cell) return `<text x="50" y="62" text-anchor="middle" class="log-q">?</text>`;
    const lines = (cell.lines || []).map((l) => { const [x1, y1, x2, y2] = LINE_XY[l]; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#7d8790" stroke-width="5" stroke-linecap="round"/>`; }).join("");
    const n = cell.count + 1;
    const r = BASE_R[n] * [0.55, 0.78, 1][cell.size];
    const shapes = POS[n].map(([x, y]) => shapeSvg(G.SHAPES[cell.shape], x, y, r, FILLS[cell.fill])).join("");
    return lines + shapes;
  }
  function describeCell(cell) {
    if (!cell) return "casella mancante";
    const n = cell.count + 1;
    return `${n} ${G.SHAPE_IT[G.SHAPES[cell.shape]]}${n > 1 ? " (" + n + ")" : ""} ${G.SIZE_IT[cell.size]}, ${G.FILL_IT[cell.fill]}${cell.lines && cell.lines.length ? `, linee: ${cell.lines.map((l) => G.LINE_IT[l]).join(", ")}` : ""}`;
  }

  /* ---- vista del turno */
  function roundView() {
    const r = ui.run.round;
    const d = E.DISCIPLINES[r.key];
    const st = lab().ratings[r.key];
    const head = `${backBar("← Esci dal turno")}<div class="log-run-head"><span class="log-kicker">${esc(d.label)} · livello ${r.item ? r.item.level : r.level}</span><span>${r.done ? "" : `${r.idx + 1} di ${r.n}`} · punteggio ${st.r}</span></div>`;
    if (r.done) return head + roundEnd(r);
    const it = r.item;
    const a = r.answered;
    let body = "";
    if (it.kind === "matrix") body = matrixView(it, a);
    else if (it.kind === "series") body = seriesView(it, a);
    else if (it.kind === "grid") body = gridView(it, a);
    else if (it.kind === "knights") body = knightsView(it, a);
    else if (it.kind === "syllo") body = sylloView(it, a);
    else body = numberView(it, a);
    const fb = a ? `<div class="log-feedback ${a.ok ? "ok" : "ko"}" role="status">
        <strong>${a.ok ? "Giusto" : a.lure ? "È la risposta d'istinto, ma è sbagliata" : "Sbagliato"} <em>${a.delta >= 0 ? "+" : ""}${a.delta}</em></strong>
        ${a.ok ? "" : `<p class="log-correct">${correctText(it)}</p>`}
        <p>${esc(it.explain)}</p>
        ${it.src ? `<p class="log-small">${esc(it.src)}.</p>` : ""}
        <div class="log-actions"><button type="button" class="primary-action" data-l="next" data-autofocus>${r.idx + 1 < r.n ? "Avanti" : "Vedi il risultato"}</button></div>
      </div>` : "";
    return `${head}<article class="log-card log-run">${body}${fb}</article>`;
  }
  function correctText(it) {
    if (it.kind === "matrix") return `La risposta giusta era la ${it.answer + 1}.`;
    if (it.kind === "series") return `La risposta giusta era ${G.fmt(it.answer)}.`;
    if (it.kind === "syllo") return it.mode === "produce" ? `Risposta giusta: ${it.correct.map((i) => `«${it.options[i]}»`).join(" oppure ")}.` : `La risposta giusta era: ${it.answer ? "segue per forza" : "non segue per forza"}.`;
    if (it.kind === "knights") return `Soluzione: ${it.names.map((n, i) => `${n} ${it.solution[i] ? "cavaliere" : "furfante"}`).join(", ")}.`;
    if (it.kind === "grid") return `Soluzione: ${[...Array(it.n).keys()].map((h) => `casa ${h + 1}: ${it.cats.map((c) => it.solution[c][h]).join(", ")}`).join("; ")}.`;
    if (it.kind === "prob") return `La risposta giusta era ${it.unit === "€" ? `${fmtNum(it.answer)} €` : G.pct(it.answer, 1)}.`;
    return `La risposta giusta era ${fmtNum(it.answer)}${it.unit ? ` ${it.unit}` : ""}.`;
  }
  function matrixView(it, a) {
    const cells = it.grid.flat();
    return `<p class="log-ask" data-focus tabindex="-1">Quale figura completa la matrice?</p>
      <div class="log-matrix" role="img" aria-label="Matrice 3 per 3: ${cells.map((c, i) => `casella ${i + 1}: ${describeCell(c)}`).join("; ")}">
        ${cells.map((c) => `<svg viewBox="0 0 100 100" class="${c ? "" : "missing"}">${cellSvg(c)}</svg>`).join("")}
      </div>
      <div class="log-mopts" role="group" aria-label="Risposte">
        ${it.options.map((c, i) => {
          let cls = "";
          if (a) cls = i === it.answer ? "ok" : a.ans === i ? "ko" : "dim";
          return `<button type="button" class="log-mopt ${cls}" data-l="pick" data-v="${i}" ${a ? "disabled" : ""} aria-label="Risposta ${i + 1}: ${esc(describeCell(c))}"><span class="log-key">${i + 1}</span><svg viewBox="0 0 100 100">${cellSvg(c)}</svg></button>`;
        }).join("")}
      </div>`;
  }
  function seriesView(it, a) {
    return `<p class="log-ask" data-focus tabindex="-1">Che numero viene dopo?</p>
      <div class="log-series">${it.terms.map((x) => `<span>${G.fmt(x)}</span>`).join("")}<span class="q">${a ? G.fmt(it.answer) : "?"}</span></div>
      ${a ? "" : `<form class="log-answer" data-l-form="num"><label><span class="log-sr">Risposta</span><input id="logNum" type="text" inputmode="numeric" autocomplete="off" placeholder="il numero dopo" data-autofocus></label><button type="submit" class="primary-action">Conferma</button></form>`}`;
  }
  function numberView(it, a) {
    const unit = it.kind === "prob" ? (it.unit === "€" ? "€" : "%") : it.unit || "";
    return `<p class="log-problem" data-focus tabindex="-1">${esc(it.text)}</p>
      ${a ? `<p class="log-yours">La tua risposta: ${esc(a.ans)}${unit ? ` ${esc(unit)}` : ""}</p>` : `<form class="log-answer" data-l-form="num"><label><span class="log-sr">Risposta</span><input id="logNum" type="text" inputmode="decimal" autocomplete="off" placeholder="${it.kind === "prob" && unit === "%" ? "es. 12,5" : "es. 3"}" data-autofocus></label><span class="log-unit">${esc(unit)}</span><button type="submit" class="primary-action">Conferma</button></form>
      ${it.kind === "prob" && unit === "%" ? `<p class="log-small">In percentuale; si accetta un piccolo arrotondamento.</p>` : it.unit === "€" ? `<p class="log-small">In euro, con la virgola: per esempio 0,05.</p>` : ""}`}`;
  }
  function sylloView(it, a) {
    if (it.mode === "produce") {
      return `<p class="log-ask" data-focus tabindex="-1">Se le due premesse sono vere, quale conclusione segue per forza?</p>
      <div class="log-syllo"><p>${esc(it.premises[0])}</p><p>${esc(it.premises[1])}</p></div>
      <div class="log-options long">${it.options.map((o, i) => {
        let cls = "";
        if (a) cls = it.correct.includes(i) ? "ok" : Number(a.ans) === i ? "ko" : "dim";
        return `<button type="button" class="log-opt ${cls}" data-l="pick" data-v="${i}" ${a ? "disabled" : ""}><span class="log-key">${i + 1}</span>${esc(o)}</button>`;
      }).join("")}</div>
      <p class="log-small">Parole inventate: conta solo la forma. Si suppone che di ogni tipo esista almeno un esemplare. Se più conclusioni seguono, ne basta una.</p>`;
    }
    return `<p class="log-ask" data-focus tabindex="-1">Se le due premesse sono vere, la conclusione è per forza vera?</p>
      <div class="log-syllo"><p>${esc(it.premises[0])}</p><p>${esc(it.premises[1])}</p><p class="concl">Quindi: ${esc(it.conclusion)}</p></div>
      <div class="log-two">
        ${[true, false].map((v) => {
          let cls = "";
          if (a) cls = v === it.answer ? "ok" : a.ans === v ? "ko" : "dim";
          return `<button type="button" class="log-opt ${cls}" data-l="pick-bool" data-v="${v}" ${a ? "disabled" : ""}><span class="log-key">${v ? 1 : 2}</span>${v ? "Segue per forza" : "Non segue per forza"}</button>`;
        }).join("")}
      </div>
      <p class="log-small">Le parole sono inventate apposta: conta solo la forma del ragionamento, non quello che sai del mondo.</p>`;
  }
  function knightsView(it, a) {
    const ans = ui.knAns || [];
    return `<p class="log-ask" data-focus tabindex="-1">Su un'isola i cavalieri dicono sempre il vero e i furfanti mentono sempre. Chi è chi?</p>
      <ul class="log-says">${it.statements.map((s) => `<li><b>${esc(s.who)}</b><span>«${esc(s.text)}»</span></li>`).join("")}</ul>
      <div class="log-kn">${it.names.map((n, i) => {
        const cur = ans[i];
        const sol = it.solution[i];
        return `<div class="log-kn-row ${a ? (cur === sol ? "ok" : "ko") : ""}"><span>${esc(n)}</span><div class="log-seg" role="group" aria-label="${esc(n)}">
          <button type="button" data-l="kn" data-i="${i}" data-v="1" aria-pressed="${cur === true}" ${a ? "disabled" : ""}>Cavaliere</button>
          <button type="button" data-l="kn" data-i="${i}" data-v="0" aria-pressed="${cur === false}" ${a ? "disabled" : ""}>Furfante</button></div></div>`;
      }).join("")}</div>
      ${a ? "" : `<div class="log-actions"><button type="button" class="primary-action" data-l="kn-ok" ${ans.every((x) => x !== null) ? "" : "disabled"}>Conferma</button></div>`}`;
  }
  function gridView(it, a) {
    const ans = ui.gridAns || {};
    const wrong = a && a.wrong ? new Set(a.wrong.map((w) => `${w.c}|${w.h}`)) : new Set();
    return `<p class="log-ask" data-focus tabindex="-1">${it.n} case in fila, numerate da sinistra. In ogni casa abita una persona. Ricostruisci tutto con gli indizi.</p>
      <ol class="log-clues">${it.clues.map((c) => `<li>${esc(c)}</li>`).join("")}</ol>
      <div class="log-gridans" style="--cols:${it.cats.length}">
        <div class="log-gh"><span>Casa</span>${it.catLabels.map((c) => `<span>${esc(c)}</span>`).join("")}</div>
        ${[...Array(it.n).keys()].map((h) => `<div class="log-gr"><b>${h + 1}</b>${it.cats.map((c) => {
          const v = (ans[c] || [])[h] || "";
          const cls = a ? (wrong.has(`${c}|${h}`) ? "ko" : "ok") : "";
          return `<label class="${cls}"><span class="log-sr">Casa ${h + 1}, ${esc(c)}</span><select data-grid="${c}" data-h="${h}" ${a ? "disabled" : ""}><option value="">—</option>${it.values[c].map((x) => `<option value="${esc(x)}" ${x === v ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></label>`;
        }).join("")}</div>`).join("")}
      </div>
      ${a ? "" : `<p class="log-small">Consiglio: usa carta e penna per una tabella di eliminazione. Ogni valore va in una casa sola.</p><div class="log-actions"><button type="button" class="primary-action" data-l="grid-ok">Controlla</button></div>`}`;
  }
  function roundEnd(r) {
    const s = E.summary(r);
    const st = lab().ratings[r.key];
    return `<article class="log-card log-result"><div class="log-big"><strong>${s.ok}</strong><span>su ${s.total}</span></div><div>
      <h2 data-focus tabindex="-1">${s.ok === s.total ? "Turno perfetto" : s.ok / s.total >= 0.6 ? "Buon turno" : "Turno difficile"}</h2>
      <p>Punteggio ${esc(E.DISCIPLINES[r.key].label.toLowerCase())}: ${r.startR} → <b>${st.r}</b> (${s.delta >= 0 ? "+" : ""}${s.delta}).${s.lures ? ` Risposte d'istinto sbagliate: ${s.lures}.` : ""}</p>
      <p class="log-small">Il punteggio pesa ogni risposta per quanto era difficile: sbagliare un esercizio facile costa più che sbagliarne uno difficile.</p>
      <div class="log-actions"><button type="button" class="primary-action" data-l="train" data-key="${r.key}" data-autofocus>Un altro turno</button><button type="button" class="ghost-action" data-l="exit">Torna</button></div></div></article>`;
  }

  /* ------------------------------------------------------------ TRAPPOLE */
  function trapsView() {
    const l = lab();
    if (!E.TRAPS.length) return `<div class="log-intro"><h2 data-focus tabindex="-1">Trappole della mente</h2><p>Non ancora caricate.</p></div>`;
    const done = E.TRAPS.filter((t) => l.traps[t.id]);
    return `<div class="log-traps">
      <div class="log-intro"><h2 data-focus tabindex="-1">Trappole della mente</h2><p>Gli esperimenti classici della psicologia del ragionamento. Rispondi come faresti davvero, poi scopri la soluzione e cosa hanno risposto le persone negli studi originali. Conta la prima risposta.</p>${done.length ? `<p class="log-small">Fatte ${done.length} su ${E.TRAPS.length} · al primo colpo ${done.filter((t) => l.traps[t.id].ok).length}.</p>` : ""}</div>
      <ol class="log-traplist">${E.TRAPS.map((t) => {
        const rec = l.traps[t.id];
        return `<li><button type="button" data-l="trap" data-id="${t.id}"><strong>${esc(t.title)}</strong><span>${esc(t.tag || "")}</span><em class="${rec ? (rec.ok ? "ok" : "ko") : ""}">${rec ? (rec.ok ? "giusta" : rec.lure ? "trappola" : "sbagliata") : "da fare"}</em></button></li>`;
      }).join("")}</ol>
    </div>`;
  }
  function trapView() {
    const run = ui.run;
    const t = E.trapById(run.id);
    const a = run.answered;
    const head = `${backBar("← Tutte le trappole")}<div class="log-run-head"><span class="log-kicker">Trappola della mente</span><span>${esc(t.tag || "")}</span></div>`;
    let input = "";
    if (t.type === "choice") {
      input = `<div class="log-options ${t.options.some((o) => o.length > 40) ? "long" : ""}">${t.options.map((o, i) => {
        let cls = "";
        if (a) cls = i === t.answer ? "ok" : Number(a.ans) === i ? "ko" : "dim";
        return `<button type="button" class="log-opt ${cls}" data-l="trap-pick" data-v="${i}" ${a ? "disabled" : ""}><span class="log-key">${i + 1}</span>${esc(o)}</button>`;
      }).join("")}</div>`;
    } else if (!a) {
      input = `<form class="log-answer" data-l-form="trap"><label><span class="log-sr">Risposta</span><input id="logNum" type="text" inputmode="decimal" autocomplete="off" data-autofocus></label><span class="log-unit">${esc(t.unit || "")}</span><button type="submit" class="primary-action">Conferma</button></form>`;
    } else input = `<p class="log-yours">La tua risposta: ${esc(a.ans)} ${esc(t.unit || "")}</p>`;
    return `${head}<article class="log-card log-run">
      <h2 data-focus tabindex="-1">${esc(t.title)}</h2>
      ${(t.text || []).map((p) => `<p class="log-problem">${esc(p)}</p>`).join("")}
      ${input}
      ${a ? `<div class="log-feedback ${a.ok ? "ok" : "ko"}" role="status">
        <strong>${a.ok ? "Giusto" : a.lure ? "Ci sei cascato: è la risposta d'istinto" : "Sbagliato"}</strong>
        <p class="log-correct">${esc(t.solution)}</p>
        ${t.study ? `<div class="log-study"><span>Nello studio originale</span><p>${esc(t.study.text)}</p>${t.study.cite ? `<p class="log-cite">${esc(t.study.cite)}${t.study.url ? ` · <a href="${esc(t.study.url)}" target="_blank" rel="noopener noreferrer">fonte</a>` : ""}</p>` : ""}</div>` : ""}
        ${t.lesson ? `<p><b>La lezione.</b> ${esc(t.lesson)}</p>` : ""}
        ${a.first ? "" : `<p class="log-small">Conta la prima risposta che avevi dato.</p>`}
        <div class="log-actions">${nextTrapButton(t)}<button type="button" class="ghost-action" data-l="traps">Tutte le trappole</button></div>
      </div>` : ""}
    </article>`;
  }
  function nextTrapButton(t) {
    const l = lab();
    const i = E.TRAPS.indexOf(t);
    const nxt = E.TRAPS.slice(i + 1).concat(E.TRAPS.slice(0, i)).find((x) => !l.traps[x.id]);
    return nxt ? `<button type="button" class="primary-action" data-l="trap" data-id="${nxt.id}" data-autofocus>Prossima: ${esc(nxt.title)}</button>` : "";
  }

  /* ------------------------------------------------------------ METODO */
  function methodView() {
    if (ui.lesson) return lessonView(E.LESSONS.find((x) => x.id === ui.lesson));
    const l = lab();
    if (!E.LESSONS.length) return `<div class="log-intro"><h2 data-focus tabindex="-1">Metodo</h2><p>Le lezioni non sono state caricate.</p></div>`;
    return `<div class="log-method">
      <div class="log-intro"><h2 data-focus tabindex="-1">Metodo</h2><p>Le regole del ragionamento che servono anche fuori dagli esercizi: condizionali, quantificatori, probabilità, come si risolve un problema. Brevi, con esempi.</p></div>
      <ol class="log-lessons">${E.LESSONS.map((x, i) => `<li><button type="button" data-l="lesson" data-id="${x.id}"><span class="log-ln">${i + 1}</span><span class="log-lcopy"><strong>${esc(x.title)}</strong><span>${esc(x.lead)}</span></span><em>${l.read[x.id] ? "letta" : `${x.minutes || 6} min`}</em></button></li>`).join("")}</ol>
    </div>`;
  }
  function lessonView(x) {
    if (!x) { ui.lesson = null; return methodView(); }
    const l = lab();
    const i = E.LESSONS.indexOf(x);
    const nxt = E.LESSONS[i + 1];
    return `<div class="log-lesson">
      ${backBar("← Tutte le lezioni", "lessons")}
      <article class="log-card log-reader">
        <span class="log-kicker">Lezione ${i + 1} di ${E.LESSONS.length}</span>
        <h2 data-focus tabindex="-1">${esc(x.title)}</h2>
        <p class="log-lead">${esc(x.lead)}</p>
        ${(x.sections || []).map((s) => `<section class="log-sec"><h3>${esc(s.title)}</h3>${(s.body || []).map((p) => `<p>${esc(p)}</p>`).join("")}${s.example ? `<details class="log-ex"><summary>${esc(s.example.q)}</summary><p>${esc(s.example.a)}</p></details>` : ""}</section>`).join("")}
        ${x.sources && x.sources.length ? `<details class="log-sources"><summary>Fonti</summary><ul>${x.sources.map(([label, url]) => `<li>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label)}</li>`).join("")}</ul></details>` : ""}
        <div class="log-actions">
          ${l.read[x.id] ? `<span class="log-done-tag">Letta il ${dateShort(l.read[x.id])}</span>` : `<button type="button" class="primary-action" data-l="read" data-id="${x.id}">Segna come letta</button>`}
          ${x.train ? `<button type="button" class="ghost-action" data-l="train" data-key="${x.train}">Allenati: ${esc(E.DISCIPLINES[x.train].label)}</button>` : ""}
          ${nxt ? `<button type="button" class="ghost-action" data-l="lesson" data-id="${nxt.id}">Lezione dopo: ${esc(nxt.title)}</button>` : ""}
        </div>
      </article>
    </div>`;
  }

  /* ------------------------------------------------------------ PROGRESSI */
  function progressView() {
    const l = lab();
    const key = ui.progKey;
    const st = l.ratings[key];
    const lr = E.lureRate(l);
    const days = calendar(l);
    return `<div class="log-prog">
      <div class="log-intro"><h2 data-focus tabindex="-1">Progressi</h2><p>Il punteggio di ogni disciplina sale e scende con le risposte, pesate per difficoltà. 1000 è il partecipante tipico degli studi; nell'esagono 1000 vale 50.</p></div>
      <section class="log-card log-prof-card"><h3>Profilo</h3>${hexProfile(l)}</section>
      <section class="log-card"><h3>Discipline</h3>
        <table class="log-table"><thead><tr><th scope="col">Disciplina</th><th scope="col">Punteggio</th><th scope="col">Record</th><th scope="col">Esercizi</th><th scope="col">Giusti</th></tr></thead><tbody>
        ${E.KEYS.map((k) => { const s = l.ratings[k]; return `<tr><th scope="row">${esc(E.DISCIPLINES[k].label)}</th><td>${s.r}</td><td>${s.best || "—"}</td><td>${s.n}</td><td>${s.n ? `${Math.round((s.ok / s.n) * 100)}%` : "—"}</td></tr>`; }).join("")}
        </tbody></table>
        ${lr ? `<p class="log-small">Riflessione e probabilità: su ${lr.wrong} risposte sbagliate, ${lr.lures} erano proprio la risposta d'istinto.</p>` : ""}
      </section>
      <section class="log-card"><h3>Andamento del punteggio</h3>
        <div class="log-segbar" role="group" aria-label="Disciplina">${E.KEYS.map((k) => `<button type="button" data-l="prog" data-key="${k}" aria-pressed="${k === key}">${esc(E.DISCIPLINES[k].label)}</button>`).join("")}</div>
        ${st.hist.length ? ratingChart(st.hist) : `<p class="log-empty">Ancora nessun turno completo in questa disciplina.</p>`}
      </section>
      <section class="log-card"><h3>Ultime 8 settimane</h3><div class="log-cal" role="img" aria-label="${days.filter((x) => x.on).length} giorni di allenamento nelle ultime 8 settimane">${days.map((x) => `<i class="${x.on ? "on" : ""} ${x.today ? "today" : ""}" title="${x.label}"></i>`).join("")}</div><p class="log-small">${plural(days.filter((x) => x.on).length, "giorno", "giorni")} su 56 · serie attuale: ${plural(E.streak(l), "giorno", "giorni")}</p></section>
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
    return `<svg class="log-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Punteggio nel tempo: ${vals.join(", ")}">
      <line x1="${P}" x2="${W - P}" y1="${y(1000)}" y2="${y(1000)}" class="ref"/><text x="${W - P}" y="${y(1000) - 4}" text-anchor="end" class="lbl">1000: partecipante tipico</text>
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
    const panel = $("logPanel");
    if (!panel) return;
    if (!soft) renderedAt = Date.now();
    renderChip();
    document.querySelectorAll("#logic [data-log-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.logTab === ui.tab && !ui.run)));
    let html;
    if (ui.run && ui.run.type === "round") html = roundView();
    else if (ui.run && ui.run.type === "trap") html = trapView();
    else if (ui.tab === "train") html = trainView();
    else if (ui.tab === "traps") html = trapsView();
    else if (ui.tab === "method") html = methodView();
    else if (ui.tab === "progress") html = progressView();
    else html = todayView();
    panel.innerHTML = html;
    const page = $("logic");
    if (page) page.classList.toggle("log-running", Boolean(ui.run));
    if (focus) {
      const el = panel.querySelector("[data-autofocus]") || panel.querySelector("[data-focus]");
      if (el) el.focus({ preventScroll: true });
      const top = panel.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: Math.max(0, window.scrollY + top - 12), behavior: "auto" });
    }
  }
  function setTab(tab) {
    ui.run = null;
    ui.tab = tab;
    ui.lesson = null;
    render(true);
  }
  function go(target) {
    ui.run = null;
    if (target.kind === "train") { startRound(target.key); return; }
    if (target.kind === "trap") { ui.tab = "traps"; ui.run = { type: "trap", id: target.id, answered: null }; render(true); return; }
    if (target.kind === "lesson") { ui.tab = "method"; ui.lesson = target.id; render(true); return; }
    setTab("today");
  }
  function submitAnswer(ans) {
    const r = ui.run && ui.run.round;
    if (!r || r.answered || r.done) return;
    const res = E.answer(lab(), r, ans);
    save();
    render(true);
    announce(res.ok ? "Giusto" : "Sbagliato");
  }
  function parseNum(v) {
    const s = String(v || "").trim().replace(/\s/g, "").replace(/[€%]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
    if (s === "" || s === "-") return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  const SOFT = new Set(["kn", "prog"]);
  function onClick(event) {
    const el = event.target.closest("[data-l]");
    if (!el || !$("logic").contains(el) || el.disabled) return;
    const a = el.dataset.l;
    if (!a) return;
    if (!SOFT.has(a) && (event.detail > 1 || Date.now() - renderedAt < 300)) return;
    const l = lab();
    switch (a) {
      case "exit": ui.run = null; render(true); break;
      case "go": try { go(JSON.parse(el.dataset.go)); } catch (e) { setTab("today"); } break;
      case "train": startRound(el.dataset.key); break;
      case "pick": submitAnswer(Number(el.dataset.v)); break;
      case "pick-bool": submitAnswer(el.dataset.v === "true"); break;
      case "kn": {
        const i = Number(el.dataset.i);
        if (!ui.knAns) break;
        ui.knAns[i] = el.dataset.v === "1";
        render(false, true);
        break;
      }
      case "kn-ok": if (ui.knAns && ui.knAns.every((x) => x !== null)) submitAnswer(ui.knAns.slice()); break;
      case "grid-ok": submitAnswer(JSON.parse(JSON.stringify(ui.gridAns || {}))); break;
      case "next": {
        const r = ui.run.round;
        E.next(l, r);
        save();
        resetAnswers();
        render(true);
        break;
      }
      case "trap": ui.tab = "traps"; ui.run = { type: "trap", id: el.dataset.id, answered: null }; render(true); break;
      case "traps": ui.run = null; ui.tab = "traps"; render(true); break;
      case "trap-pick": {
        const res = E.trapAnswer(l, ui.run.id, Number(el.dataset.v));
        ui.run.answered = { ans: Number(el.dataset.v), ...res };
        save();
        render(true);
        break;
      }
      case "lesson": ui.run = null; ui.tab = "method"; ui.lesson = el.dataset.id; render(true); break;
      case "lessons": ui.lesson = null; render(true); break;
      case "read": E.markRead(l, el.dataset.id); save(); render(false); break;
      case "prog": ui.progKey = el.dataset.key; render(false, true); break;
      default: break;
    }
  }
  function onSubmit(event) {
    const form = event.target.closest("[data-l-form]");
    if (!form) return;
    event.preventDefault();
    const inp = $("logNum");
    const v = parseNum(inp ? inp.value : "");
    if (v === null) { announce("Scrivi un numero"); if (inp) inp.focus(); return; }
    if (form.dataset.lForm === "trap") {
      const res = E.trapAnswer(lab(), ui.run.id, v);
      ui.run.answered = { ans: inp.value, ...res };
      save();
      render(true);
      return;
    }
    submitAnswer(v);
    const r = ui.run && ui.run.round;
    if (r && r.answered) r.answered.ans = inp.value;
    render(true);
  }
  function onChange(event) {
    const t = event.target;
    if (t.dataset.grid && ui.gridAns) { ui.gridAns[t.dataset.grid][Number(t.dataset.h)] = t.value; return; }
    if (t.dataset.lvsel) { ui.pickLevel[t.dataset.lvsel] = Number(t.value) || 0; }
  }
  function onKey(event) {
    const page = $("logic");
    if (!page || !page.classList.contains("active-page")) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const r = ui.run && ui.run.round;
    if (!r || r.done) return;
    if (r.answered) { if (event.key === "Enter") { const b = document.querySelector('#logPanel [data-l="next"]'); if (b) { b.click(); event.preventDefault(); } } return; }
    if (r.item.kind === "matrix" && /^[1-8]$/.test(event.key)) { submitAnswer(Number(event.key) - 1); event.preventDefault(); }
    else if (r.item.kind === "syllo" && r.item.mode === "produce" && /^[1-9]$/.test(event.key)) { submitAnswer(Number(event.key) - 1); event.preventDefault(); }
    else if (r.item.kind === "syllo" && r.item.mode !== "produce" && /^[12]$/.test(event.key)) { submitAnswer(event.key === "1"); event.preventDefault(); }
  }

  window.LogicUI = { render, setTab, debug: ui };
  window.logicProfileSkills = () => E.profile(lab());
  window.logicTrend = () => E.trend(lab());

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("logic");
    if (!page) return;
    page.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-log-tab]");
      if (tab) { setTab(tab.dataset.logTab); return; }
      if (event.target.closest("#logChip")) { setTab("today"); return; }
      onClick(event);
    });
    page.addEventListener("submit", onSubmit);
    page.addEventListener("change", onChange);
    document.addEventListener("keydown", onKey);
    render(false);
  });
})();
