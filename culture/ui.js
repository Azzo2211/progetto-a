/*
 * Progetto A - Cultura: interfaccia della biblioteca.
 *
 * Schede: Biblioteca (schede per area, lettura, verifica, "spiegalo tu"),
 * Ripasso (le schede in scadenza, 2 domande ciascuna), Università (culture/uni-ui.js), Profilo.
 * Dati: window.CultureCards (culture/cards.js). Motore: window.CultureEngine.
 * Usa le globali di app.js: state, saveState, renderDashboard, buildRadarMarkup.
 */
(function () {
  "use strict";

  const E = window.CultureEngine;
  const CARDS = window.CultureCards || [];
  const byId = new Map(CARDS.map((c) => [c.id, c]));

  const ui = {
    tab: "library",
    area: "all",
    status: "all",
    read: null, // { card, step: read|quiz|explain|done, order, qi, answers, picked, explainText, compared, self, result }
    review: null, // { queue: [ids], index, questions, qi, results, picked, done: [] }
    stepAt: 0
  };

  const $ = (id) => document.getElementById(id);

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function prose(text) {
    const t = String(text == null ? "" : text)
      .replace(/"([^"]*)"/g, "“$1”")
      .replace(/([A-Za-zÀ-ÿ])'([A-Za-zÀ-ÿ0-9])/g, "$1’$2");
    return esc(t);
  }

  function lab() {
    state.cultureLab = E.ensureLab(state.cultureLab, { legacy: Array.isArray(state.studied) ? state.studied : [], cards: CARDS });
    return state.cultureLab;
  }

  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
  }

  function studiedInDeck(minBox) {
    const l = lab();
    return CARDS.filter((c) => (E.cardState(l, c.id).box || 0) >= minBox).length;
  }

  // Annuncio per i lettori di schermo (una sola regione, fuori dalle parti ridisegnate).
  function announce(text) {
    const live = $("cultLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => {
      live.textContent = text;
    }, 30);
  }

  // Dopo un ridisegno rimette il focus su un elemento sensato.
  function focusAfter(box, selector) {
    const el = (selector && box.querySelector(selector)) || box.querySelector("[data-autofocus]");
    if (el) el.focus({ preventScroll: true });
  }

  function areaOf(card) {
    return E.AREAS[card.area] || { label: card.area, color: "#5b6b78" };
  }

  function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function dueLabel(st) {
    if (!st || !st.box) return "";
    const days = Math.round((new Date(st.due).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / E.DAY);
    if (days <= 0) return "ripasso oggi";
    if (days === 1) return "ripasso domani";
    return `ripasso tra ${days} giorni`;
  }

  function meter(box, color) {
    return `<span class="cult-meter" aria-label="${esc(E.BOX_LABELS[box] || "")}">${[1, 2, 3, 4, 5].map((i) => `<i style="${i <= box ? `background:${color}` : ""}"></i>`).join("")}</span>`;
  }

  /* ---------------------------------------------------------- struttura */

  function setTab(tab) {
    if (ui.review && ui.review.index >= ui.review.queue.length && tab !== "review") ui.review = null;
    ui.tab = tab;
    document.querySelectorAll("#culture [data-cult-tab]").forEach((b) => {
      const on = b.dataset.cultTab === tab;
      b.setAttribute("aria-selected", String(on));
      b.classList.toggle("active", on);
    });
    ["library", "review", "uni", "profile"].forEach((t) => {
      const panel = $(`cultPanel-${t}`);
      if (panel) panel.hidden = t !== tab;
    });
    render();
  }

  function renderHeaderChip() {
    const box = $("cultDueChip");
    if (!box) return;
    const due = E.dueCards(lab(), CARDS).length;
    const values = E.profile(lab(), CARDS);
    box.innerHTML = `
      <span class="cult-chip-num">${due}</span>
      <span class="cult-chip-copy"><strong>${due === 0 ? "Nessun ripasso oggi" : due === 1 ? "Ripasso pronto" : "Ripassi pronti"}</strong><span>Profilo cultura ${E.total(values)} · ${studiedInDeck(3)} schede consolidate</span></span>`;
    box.disabled = due === 0;
    const tab = document.querySelector('#culture [data-cult-tab="review"]');
    if (tab) tab.innerHTML = `Ripasso${due ? ` <b class="cult-badge">${due}</b>` : ""}`;
    if (window.UniUI && window.UniUI.syncTab) window.UniUI.syncTab();
  }

  function render() {
    renderHeaderChip();
    if (ui.tab === "library") (ui.read ? renderRead() : renderLibrary());
    else if (ui.tab === "review") renderReview();
    else if (ui.tab === "uni") { if (window.UniUI) window.UniUI.render(); }
    else renderProfile();
  }

  /* --------------------------------------------------------- biblioteca */

  function renderLibrary() {
    const box = $("cultPanel-library");
    if (!box) return;
    const l = lab();
    const due = E.dueCards(l, CARDS);
    const next = E.nextCard(l, CARDS);
    const list = CARDS.filter((c) => {
      if (ui.area !== "all" && c.area !== ui.area) return false;
      const b = E.cardState(l, c.id).box || 0;
      if (ui.status === "new") return b === 0;
      if (ui.status === "learning") return b >= 1 && b <= 2;
      if (ui.status === "solid") return b >= 3;
      return true;
    });
    let hero = "";
    if (due.length) {
      hero = `
        <article class="cult-hero due">
          <div>
            <span class="cult-kicker">Ripasso di oggi</span>
            <h2>${due.length} ${due.length === 1 ? "scheda da ripassare" : "schede da ripassare"}</h2>
            <p>Due domande per scheda, pochi minuti. Il ripasso al momento giusto è ciò che fa restare quello che hai letto.</p>
          </div>
          <button class="primary-action" type="button" data-act="start-review">Inizia il ripasso</button>
        </article>`;
    } else if (next) {
      const a = areaOf(next);
      hero = `
        <article class="cult-hero" style="--area:${a.color}">
          <div>
            <span class="cult-kicker">Prossima scheda consigliata</span>
            <h2>${esc(next.title)}</h2>
            <p>${prose(next.hook)}</p>
            <p class="cult-meta"><span class="cult-dot"></span>${esc(a.label)} · ${esc(E.LEVEL_LABELS[next.level])} · ${next.minutes} min</p>
          </div>
          <button class="primary-action" type="button" data-act="open" data-id="${esc(next.id)}">Leggi la scheda</button>
        </article>`;
    }
    box.innerHTML = `
      ${hero}
      <div class="cult-filters">
        <div class="cult-filter-row" role="group" aria-label="Area">
          <button type="button" class="cult-filter${ui.area === "all" ? " active" : ""}" data-act="area" data-area="all" aria-pressed="${ui.area === "all"}">Tutte le aree</button>
          ${Object.entries(E.AREAS).map(([k, a]) => `<button type="button" class="cult-filter${ui.area === k ? " active" : ""}" data-act="area" data-area="${k}" aria-pressed="${ui.area === k}" style="--area:${a.color}"><span class="cult-dot"></span>${esc(a.label)}</button>`).join("")}
        </div>
        <div class="cult-filter-row" role="group" aria-label="Stato">
          ${[["all", "Tutte"], ["new", "Da leggere"], ["learning", "In ripasso"], ["solid", "Consolidate"]].map(([k, label]) => `<button type="button" class="cult-filter small${ui.status === k ? " active" : ""}" data-act="status" data-status="${k}" aria-pressed="${ui.status === k}">${label}</button>`).join("")}
          <span class="cult-count">${studiedInDeck(1)}/${CARDS.length} studiate</span>
        </div>
      </div>
      <div class="cult-grid">
        ${list.map((c) => {
          const a = areaOf(c);
          const st = E.cardState(l, c.id);
          const b = st.box || 0;
          return `
          <button type="button" class="cult-card${b ? " seen" : ""}" data-act="open" data-id="${esc(c.id)}" style="--area:${a.color}">
            <span class="cult-card-area"><span class="cult-dot"></span>${esc(a.label)}</span>
            <strong class="cult-card-title">${esc(c.title)}</strong>
            <span class="cult-card-hook">${prose(c.hook)}</span>
            <span class="cult-card-foot">
              ${meter(b, a.color)}
              <span>${esc(E.BOX_LABELS[b])}${b ? ` · ${dueLabel(st)}` : ` · ${c.minutes} min`}</span>
            </span>
          </button>`;
        }).join("") || `<p class="cult-empty">Nessuna scheda con questi filtri.</p>`}
      </div>`;
  }

  /* ------------------------------------------------------------ lettura */

  function openCard(id, { fromReview = false } = {}) {
    const card = byId.get(id);
    if (!card) return;
    ui.read = { card, step: "read", fromReview, order: card.quiz.map((q) => shuffle(q.options.map((_, i) => i))), qi: 0, answers: [], picked: null, explainText: "", compared: false, self: null, result: null };
    ui.stepAt = Date.now();
    if (ui.tab !== "library") setTab("library");
    else render();
    const heading = document.querySelector("#cultPanel-library .cult-article h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    }
    const panel = $("cultPanel-library");
    if (panel && panel.getBoundingClientRect().top < 0) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderRead() {
    const box = $("cultPanel-library");
    const r = ui.read;
    if (!box || !r) return;
    const c = r.card;
    const a = areaOf(c);
    const st = E.cardState(lab(), c.id);
    let main = "";
    if (r.step === "read") main = readHtml(c, st);
    else if (r.step === "quiz") main = quizHtml(r);
    else if (r.step === "explain") main = explainHtml(r);
    else main = doneHtml(r);
    box.innerHTML = `
      <div class="cult-read" style="--area:${a.color}">
        <div class="cult-read-bar">
          ${r.fromReview ? `<button type="button" class="ghost-action small" data-act="back-review">Torna al ripasso</button>` : `<button type="button" class="ghost-action small" data-act="close">Biblioteca</button>`}
          <span class="cult-meta"><span class="cult-dot"></span>${esc(a.label)} · ${esc(E.LEVEL_LABELS[c.level])} · ${c.minutes} min${st.box ? ` · ${esc(E.BOX_LABELS[st.box])}` : ""}</span>
        </div>
        ${main}
      </div>`;
    const focus = box.querySelector("[data-autofocus]");
    if (focus) focus.focus({ preventScroll: true });
  }

  function readHtml(c, st) {
    const links = (c.links || []).map((id) => byId.get(id)).filter(Boolean);
    const fromReview = ui.read && ui.read.fromReview;
    return `
      <div class="cult-read-layout">
        <article class="cult-article">
          <h2>${esc(c.title)}</h2>
          <p class="cult-lead">${prose(c.hook)}</p>
          ${c.sections.map((s) => `<section><h3>${esc(s.h)}</h3>${String(s.text).split(/\n\s*\n/).map((p) => `<p>${prose(p)}</p>`).join("")}</section>`).join("")}
          <div class="cult-actions">
            ${fromReview
              ? `<button class="primary-action" type="button" data-act="back-review">Torna al ripasso</button>`
              : `<button class="primary-action" type="button" data-act="quiz">${E.isStudied(st) ? "Rifai la verifica" : "Verifica: 5 domande"}</button>`}
          </div>
        </article>
        <aside class="cult-aside">
          <div class="cult-facts">
            <h3>Da ricordare</h3>
            <ul>${c.facts.map((f) => `<li>${prose(f)}</li>`).join("")}</ul>
          </div>
          ${links.length ? `
          <div class="cult-links">
            <h3>Collegamenti</h3>
            ${links.map((l) => `<button type="button" class="cult-link" data-act="open" data-id="${esc(l.id)}" style="--area:${areaOf(l).color}" ${fromReview ? "disabled" : ""}><span class="cult-dot"></span>${esc(l.title)}</button>`).join("")}
          </div>` : ""}
        </aside>
      </div>`;
  }

  function quizHtml(r) {
    const c = r.card;
    const q = c.quiz[r.qi];
    const letters = ["A", "B", "C", "D"];
    const picked = r.picked;
    const options = r.order[r.qi].map((index, pos) => {
      let cls = "";
      if (picked !== null) {
        if (index === q.answer) cls = " right";
        else if (index === picked) cls = " wrong";
        else cls = " dim";
      }
      const mark = picked === null ? "" : index === q.answer ? `<span class="cult-mark" aria-label="risposta corretta">✓</span>` : index === picked ? `<span class="cult-mark" aria-label="la tua risposta, sbagliata">✗</span>` : "";
      return `<button type="button" class="cult-option${cls}" data-act="answer" data-index="${index}" ${picked !== null ? "disabled" : ""}><span class="cult-option-key">${letters[pos]}</span><span>${prose(q.options[index])}</span>${mark}</button>`;
    }).join("");
    const last = r.qi === c.quiz.length - 1;
    return `
      <article class="cult-quiz">
        <div class="cult-quiz-head">
          <span class="cult-kicker">Domanda ${r.qi + 1} di ${c.quiz.length}</span>
          <span class="cult-type">${esc(E.TYPE_LABELS[q.type] || q.type)}</span>
        </div>
        <div class="cult-steps">${c.quiz.map((_, i) => `<i class="${i < r.answers.length ? (r.answers[i].correct ? "ok" : "ko") : i === r.qi ? "now" : ""}"></i>`).join("")}</div>
        <h3 class="cult-question" tabindex="-1" ${picked === null ? "data-autofocus" : ""}>${prose(q.q)}</h3>
        <div class="cult-options" role="group" aria-label="Risposte">${options}</div>
        ${picked !== null ? `
        <div class="cult-feedback ${picked === q.answer ? "ok" : "ko"}">
          <strong>${picked === q.answer ? "Esatto." : "Non è questa."}</strong>
          <p>${prose(q.why)}</p>
          <div class="cult-actions"><button class="primary-action" type="button" data-act="next-q" data-autofocus>${last ? "Spiegalo con parole tue" : "Domanda successiva"}</button></div>
        </div>` : `<p class="cult-hint">Tasti 1–4 o A–D per rispondere.</p>`}
      </article>`;
  }

  function explainHtml(r) {
    const e = r.card.explain;
    return `
      <article class="cult-explain">
        <span class="cult-kicker">Spiegalo con parole tue</span>
        <h3 class="cult-question" id="cultExplainPrompt">${prose(e.prompt)}</h3>
        <p class="cult-small">Scrivere la spiegazione è il modo più efficace per fissare un concetto. Nessun voto automatico: confronta tu con il modello.</p>
        <textarea id="cultExplainInput" rows="6" aria-labelledby="cultExplainPrompt" placeholder="Tre o quattro frasi bastano." ${r.compared ? "readonly" : "data-autofocus"}>${esc(r.explainText)}</textarea>
        ${r.compared ? `
          <div class="cult-model">
            <span>Una buona spiegazione</span>
            <p>${prose(e.model)}</p>
            <h4>Doveva contenere</h4>
            <ul>${e.points.map((p) => `<li>${prose(p)}</li>`).join("")}</ul>
          </div>
          <p class="cult-self-q">Com'era la tua spiegazione?</p>
          <div class="cult-actions">
            <button class="primary-action" type="button" data-act="self" data-self="ok">C'era tutto</button>
            <button class="ghost-action" type="button" data-act="self" data-self="quasi">Quasi</button>
            <button class="ghost-action" type="button" data-act="self" data-self="no">Da rivedere</button>
          </div>`
        : `
          <div class="cult-actions">
            <button class="primary-action" type="button" data-act="compare">Confronta con il modello</button>
            <button class="ghost-action" type="button" data-act="self" data-self="">Salta</button>
          </div>`}
      </article>`;
  }

  function doneHtml(r) {
    const c = r.card;
    const st = E.cardState(lab(), c.id);
    const correct = r.answers.filter((a) => a.correct).length;
    const next = E.nextCard(lab(), CARDS);
    const due = new Date(st.due).toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
    return `
      <article class="cult-done">
        <div class="cult-done-score"><strong>${correct}/${c.quiz.length}</strong><span>risposte giuste</span></div>
        <div>
          <span class="cult-kicker">Scheda studiata</span>
          <h2>${esc(c.title)}</h2>
          <p>${r.result && !r.result.first
            ? (st.box >= 2 && correct >= 4 ? "La conoscevi già: il ripasso resta dov'era." : "Qualcosa non era chiaro: la scheda torna in ripasso domani.")
            : st.box >= 2 ? "Ottimo: la scheda entra in ripasso tra qualche giorno." : correct >= 3 ? "Buona base: un ripasso già domani la fisserà." : "Rileggila con calma: domani un ripasso ti aiuterà a fissarla."} Prossimo ripasso: <strong>${esc(due)}</strong>.</p>
          ${r.result && !r.result.first ? `<p class="cult-small">Era già stata studiata: le statistiche del profilo contano solo la prima verifica e i ripassi.</p>` : ""}
          <div class="cult-actions">
            ${next ? `<button class="primary-action" type="button" data-act="open" data-id="${esc(next.id)}">Prossima scheda: ${esc(next.title)}</button>` : ""}
            <button class="ghost-action" type="button" data-act="reread">Rileggi</button>
            <button class="ghost-action" type="button" data-act="close">Biblioteca</button>
          </div>
        </div>
      </article>`;
  }

  function answer(index) {
    const r = ui.read;
    if (!r || r.step !== "quiz" || r.picked !== null) return;
    const q = r.card.quiz[r.qi];
    r.picked = index;
    r.answers[r.qi] = { q: r.qi, correct: index === q.answer };
    if (E.recordAnswer(lab(), r.card, r.qi, index === q.answer) && typeof saveState === "function") saveState();
    ui.stepAt = Date.now();
    renderRead();
    announce(`${index === q.answer ? "Esatto." : `Non è questa. Risposta corretta: ${q.options[q.answer]}.`} ${q.why}`);
  }

  function finishStudy(self) {
    const r = ui.read;
    if (!r || r.step === "done") return;
    const first = !E.isStudied(E.cardState(lab(), r.card.id));
    E.recordStudy(lab(), r.card, r.answers, self || null);
    r.result = { first };
    r.step = "done";
    ui.stepAt = Date.now();
    save();
    render();
  }

  /* ------------------------------------------------------------ ripasso */

  function startReview() {
    const due = E.dueCards(lab(), CARDS);
    if (!due.length) return;
    ui.review = { queue: due.map((c) => c.id), index: 0, done: [], day: E.dayKey(Date.now()) };
    prepareReviewCard();
    ui.stepAt = Date.now();
    setTab("review");
  }

  function prepareReviewCard() {
    const rv = ui.review;
    const card = byId.get(rv.queue[rv.index]);
    rv.questions = E.pickReviewQuestions(card, E.cardState(lab(), card.id), 2);
    rv.orders = rv.questions.map((qi) => shuffle(card.quiz[qi].options.map((_, i) => i)));
    rv.qi = 0;
    rv.results = [];
    rv.picked = null;
  }

  function renderReview() {
    const box = $("cultPanel-review");
    if (!box) return;
    const l = lab();
    if (ui.review && ui.review.day !== E.dayKey(Date.now())) ui.review = null;
    const rv = ui.review;
    if (!rv) {
      const due = E.dueCards(l, CARDS);
      const up = E.upcoming(l, CARDS, 7);
      const days = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
      box.innerHTML = `
        <article class="cult-review-empty">
          ${due.length ? `
            <h2>${due.length} ${due.length === 1 ? "scheda pronta" : "schede pronte"} per il ripasso</h2>
            <p>Due domande per scheda. Se rispondi bene, il prossimo ripasso si allontana; se sbagli, torna vicino.</p>
            <button class="primary-action" type="button" data-act="start-review">Inizia il ripasso</button>`
          : `
            <h2>Nessun ripasso per oggi</h2>
            <p>Le schede studiate tornano qui quando è il momento giusto per ripassarle: 1, 3, 7, 16 e 35 giorni dopo, se rispondi bene.</p>`}
          <div class="cult-week" aria-label="Ripassi dei prossimi 7 giorni">
            ${up.map((d) => {
              const date = new Date(`${d.day}T12:00:00`);
              return `<div class="cult-day${d.count ? " has" : ""}"><span>${days[date.getDay()]}</span><strong>${d.count}</strong></div>`;
            }).join("")}
          </div>
        </article>`;
      return;
    }
    if (rv.index >= rv.queue.length) {
      const ok = rv.done.filter((d) => d.correct === d.total).length;
      box.innerHTML = `
        <article class="cult-review-empty">
          <span class="cult-kicker">Ripasso completato</span>
          <h2>${rv.done.length} ${rv.done.length === 1 ? "scheda ripassata" : "schede ripassate"}</h2>
          <p>${ok} senza errori. Le schede con errori torneranno presto, le altre si allontanano.</p>
          <ul class="cult-review-list">${rv.done.map((d) => {
            const c = byId.get(d.id);
            return `<li style="--area:${areaOf(c).color}"><span class="cult-dot"></span><span>${esc(c.title)}</span><b class="${d.correct === d.total ? "ok" : "ko"}">${d.correct}/${d.total}</b><em>${esc(E.BOX_LABELS[d.box])}</em></li>`;
          }).join("")}</ul>
          <div class="cult-actions">
            <button class="primary-action" type="button" data-act="end-review">Torna alla biblioteca</button>
          </div>
        </article>`;
      return;
    }
    const card = byId.get(rv.queue[rv.index]);
    const qIndex = rv.questions[rv.qi];
    const q = card.quiz[qIndex];
    const letters = ["A", "B", "C", "D"];
    const picked = rv.picked;
    const options = rv.orders[rv.qi].map((index, pos) => {
      let cls = "";
      if (picked !== null) cls = index === q.answer ? " right" : index === picked ? " wrong" : " dim";
      const mark = picked === null ? "" : index === q.answer ? `<span class="cult-mark" aria-label="risposta corretta">✓</span>` : index === picked ? `<span class="cult-mark" aria-label="la tua risposta, sbagliata">✗</span>` : "";
      return `<button type="button" class="cult-option${cls}" data-act="review-answer" data-index="${index}" ${picked !== null ? "disabled" : ""}><span class="cult-option-key">${letters[pos]}</span><span>${prose(q.options[index])}</span>${mark}</button>`;
    }).join("");
    const lastQ = rv.qi === rv.questions.length - 1;
    box.innerHTML = `
      <article class="cult-quiz review" style="--area:${areaOf(card).color}">
        <div class="cult-quiz-head">
          <span class="cult-kicker">Scheda ${rv.index + 1} di ${rv.queue.length} · domanda ${rv.qi + 1} di ${rv.questions.length}</span>
          <span class="cult-type">${esc(E.TYPE_LABELS[q.type] || q.type)}</span>
        </div>
        <p class="cult-meta"><span class="cult-dot"></span>${esc(card.title)}</p>
        <h3 class="cult-question" tabindex="-1" ${picked === null ? "data-autofocus" : ""}>${prose(q.q)}</h3>
        <div class="cult-options" role="group" aria-label="Risposte">${options}</div>
        ${picked !== null ? `
        <div class="cult-feedback ${picked === q.answer ? "ok" : "ko"}">
          <strong>${picked === q.answer ? "Esatto." : "Non è questa."}</strong>
          <p>${prose(q.why)}</p>
          <div class="cult-actions">
            <button class="primary-action" type="button" data-act="review-next" data-autofocus>${lastQ ? (rv.index === rv.queue.length - 1 ? "Fine del ripasso" : "Scheda successiva") : "Domanda successiva"}</button>
            ${picked !== q.answer ? `<button class="ghost-action" type="button" data-act="reread-review" data-id="${esc(card.id)}">Rileggi la scheda</button>` : ""}
          </div>
        </div>` : `<p class="cult-hint">Tasti 1–4 o A–D per rispondere.</p>`}
      </article>`;
    const focus = box.querySelector("[data-autofocus]");
    if (focus) focus.focus({ preventScroll: true });
  }

  function reviewAnswer(index) {
    const rv = ui.review;
    if (!rv || rv.picked !== null || rv.index >= rv.queue.length) return;
    const card = byId.get(rv.queue[rv.index]);
    const qIndex = rv.questions[rv.qi];
    rv.picked = index;
    const rq = card.quiz[qIndex];
    rv.results[rv.qi] = { q: qIndex, correct: index === rq.answer };
    ui.stepAt = Date.now();
    renderReview();
    announce(`${index === rq.answer ? "Esatto." : `Non è questa. Risposta corretta: ${rq.options[rq.answer]}.`} ${rq.why}`);
  }

  function reviewNext() {
    const rv = ui.review;
    if (!rv || rv.picked === null) return;
    if (rv.qi < rv.questions.length - 1) {
      rv.qi += 1;
      rv.picked = null;
    } else {
      const card = byId.get(rv.queue[rv.index]);
      const st = E.recordReview(lab(), card, rv.results);
      rv.done.push({ id: card.id, correct: rv.results.filter((x) => x.correct).length, total: rv.results.length, box: st ? st.box : 1 });
      save();
      rv.index += 1;
      if (rv.index < rv.queue.length) prepareReviewCard();
      renderHeaderChip();
    }
    ui.stepAt = Date.now();
    renderReview();
  }

  /* ------------------------------------------------------------ profilo */

  function profileSkills() {
    const values = E.profile(lab(), CARDS);
    return E.DIMENSIONS.map((d) => ({ key: d.key, label: d.label, value: values[d.key] }));
  }

  function renderProfile() {
    const box = $("cultPanel-profile");
    if (!box) return;
    const l = lab();
    const values = E.profile(l, CARDS);
    const skills = E.DIMENSIONS.map((d) => ({ key: d.key, label: d.label, value: values[d.key], text: d.text }));
    const radar = typeof buildRadarMarkup === "function" ? buildRadarMarkup(skills, 280, 140, 118, false) : "";
    const areas = E.areaProgress(l, CARDS);
    const weak = E.weakest(values);
    const s = l.stats;
    const pct = (x) => (x.a ? `${Math.round((x.c / x.a) * 100)}% su ${x.a}` : "ancora nessuna");
    const history = l.history.slice(0, 10);
    box.innerHTML = `
      <div class="cult-profile">
        <article class="cult-pcard cult-p-radar">
          <svg class="module-radar cult-radar" viewBox="0 0 280 280" aria-label="Profilo cultura">${radar}</svg>
          <div class="cult-total"><strong>${E.total(values)}</strong><span>media delle 6 categorie</span></div>
          <ul class="cult-dims">${skills.map((k) => `
            <li>
              <div class="cult-dim-head"><span>${esc(k.label)}</span><strong>${k.value}</strong></div>
              <div class="mini-track"><div class="mini-fill" style="width:${k.value}%"></div></div>
              <p>${esc(k.text)}</p>
            </li>`).join("")}</ul>
        </article>
        <article class="cult-pcard">
          <h3>Gli scaffali</h3>
          <ul class="cult-shelf">${areas.map((a) => `
            <li style="--area:${a.color}">
              <span class="cult-shelf-label"><span class="cult-dot"></span>${esc(a.label)}</span>
              <span class="cult-shelf-bar"><i class="solid" style="width:${(a.solid / (a.total || 1)) * 100}%"></i><i class="studied" style="width:${((a.studied - a.solid) / (a.total || 1)) * 100}%"></i></span>
              <span class="cult-shelf-num">${a.studied}/${a.total}</span>
            </li>`).join("")}</ul>
          <p class="cult-small">Colore pieno: schede consolidate (scatola 3 o più). Colore chiaro: studiate e in ripasso.</p>
          <h3>Le tue risposte</h3>
          <ul class="cult-stats">
            <li><span>Comprensione</span><b>${pct(s.comprensione)}</b></li>
            <li><span>Applicazione</span><b>${pct(s.applicazione)}</b></li>
            <li><span>Collegamenti</span><b>${pct(s.collegamento)}</b></li>
            <li><span>Dati</span><b>${pct(s.fatto)}</b></li>
            <li><span>Nei ripassi</span><b>${pct(s.review)}</b></li>
            <li><span>Ripassi in tempo</span><b>${l.reviewsDone ? `${l.reviewsOnTime}/${l.reviewsDone}` : "ancora nessuno"}</b></li>
          </ul>
          <p class="cult-small">Da allenare: <strong>${esc(E.DIMENSIONS.find((d) => d.key === weak).label)}</strong>. Le statistiche contano il primo studio di ogni scheda e i ripassi, non le verifiche rifatte.</p>
        </article>
        <article class="cult-pcard">
          <h3>Ultime attività</h3>
          ${history.length ? `<ul class="cult-history">${history.map((h) => {
            const c = byId.get(h.id);
            return `<li style="--area:${c ? areaOf(c).color : "#5b6b78"}"><span class="cult-dot"></span><div><strong>${esc(h.title)}</strong><span>${h.kind === "study" ? "Studio" : "Ripasso"} · ${h.score}% · ${esc(E.BOX_LABELS[h.box] || "")} · ${new Date(h.date).toLocaleDateString("it-IT")}</span></div></li>`;
          }).join("")}</ul>` : `<p class="cult-small">Ancora niente: inizia dalla scheda consigliata.</p>`}
        </article>
      </div>`;
  }

  window.renderCultureProfile = function renderCultureProfile() {
    if (!E || !$("culture")) return;
    renderHeaderChip();
    if (ui.tab === "profile") renderProfile();
  };

  window.cultureProfileSkills = function () {
    return E ? profileSkills() : [];
  };

  /* ---------------------------------------------------------- eventi */

  function onClick(event) {
    const el = event.target.closest("[data-act], [data-cult-tab]");
    if (!el || !$("culture").contains(el)) return;
    if (el.dataset.cultTab) {
      setTab(el.dataset.cultTab);
      return;
    }
    const act = el.dataset.act;
    const quick = Date.now() - (ui.stepAt || 0) < 300;
    if (["answer", "review-answer"].includes(act) && (event.detail > 1 || Date.now() - (ui.stepAt || 0) < 350)) return;
    if (["open", "quiz", "next-q", "review-next", "start-review", "close", "end-review", "reread-review", "back-review"].includes(act) && quick) return;
    if (act === "open") openCard(el.dataset.id);
    else if (act === "area") {
      ui.area = el.dataset.area;
      renderLibrary();
    } else if (act === "status") {
      ui.status = el.dataset.status;
      renderLibrary();
    } else if (act === "quiz" && ui.read) {
      ui.read.step = "quiz";
      ui.read.qi = 0;
      ui.read.answers = [];
      ui.read.picked = null;
      ui.read.explainText = "";
      ui.read.compared = false;
      ui.read.self = null;
      ui.read.result = null;
      ui.read.order = ui.read.card.quiz.map((q) => shuffle(q.options.map((_, i) => i)));
      ui.stepAt = Date.now();
      renderRead();
    } else if (act === "answer") answer(Number(el.dataset.index));
    else if (act === "next-q" && ui.read) {
      if (ui.read.qi < ui.read.card.quiz.length - 1) {
        ui.read.qi += 1;
        ui.read.picked = null;
      } else {
        ui.read.step = "explain";
      }
      ui.stepAt = Date.now();
      renderRead();
    } else if (act === "compare" && ui.read) {
      const input = $("cultExplainInput");
      ui.read.explainText = input ? input.value : ui.read.explainText;
      ui.read.compared = true;
      renderRead();
    } else if (act === "self") finishStudy(el.dataset.self);
    else if (act === "reread" && ui.read) {
      ui.read.step = "read";
      renderRead();
    } else if (act === "close") {
      ui.read = null;
      if (ui.tab !== "library") setTab("library");
      else render();
    } else if (act === "start-review") startReview();
    else if (act === "reread-review") openCard(el.dataset.id, { fromReview: true });
    else if (act === "back-review") {
      ui.read = null;
      setTab("review");
    }
    else if (act === "review-answer") reviewAnswer(Number(el.dataset.index));
    else if (act === "review-next") reviewNext();
    else if (act === "end-review") {
      ui.review = null;
      setTab("library");
    }
  }

  function onKey(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.isComposing || event.repeat) return;
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
    const page = $("culture");
    if (!page || !page.classList.contains("active-page")) return;
    if (Date.now() - (ui.stepAt || 0) < 250) return;
    const pos = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 }[String(event.key).toLowerCase()];
    if (pos === undefined) return;
    if (ui.tab === "library" && ui.read && ui.read.step === "quiz" && ui.read.picked === null) {
      event.preventDefault();
      answer(ui.read.order[ui.read.qi][pos]);
    } else if (ui.tab === "review" && ui.review && ui.review.picked === null && ui.review.index < ui.review.queue.length) {
      event.preventDefault();
      reviewAnswer(ui.review.orders[ui.review.qi][pos]);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("culture");
    if (!page || !E) return;
    page.addEventListener("click", onClick);
    page.addEventListener("input", (event) => {
      if (event.target.id === "cultExplainInput" && ui.read) ui.read.explainText = event.target.value;
    });
    document.addEventListener("keydown", onKey);
    const chip = $("cultDueChip");
    if (chip) chip.addEventListener("click", () => startReview());
    setTab("library");
  });
})();
