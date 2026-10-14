/*
 * Progetto A - Scenari: interfaccia della pagina "Esami speciali".
 *
 * Schede: Esami (fascicolo, 3 round, frase, debrief col mentore),
 * Risposta libera (tre parti guidate), Profilo (classe, radar, storico).
 * Dati: window.ScenarioExams (scenarios/exams.js), window.ScenarioFree
 * (scenarios/free.js). Motore: window.ScenarioEngine (scenarios/engine.js).
 * Usa le globali di app.js: state, saveState, renderDashboard, buildRadarMarkup.
 */
(function () {
  "use strict";

  const E = window.ScenarioEngine;
  const EXAMS = window.ScenarioExams || [];
  const FREE = window.ScenarioFree || [];

  const MENTORS = {
    horikita: {
      name: "Suzune Horikita",
      image: "assets/cote/horikita.webp",
      lines: {
        high: "Ordinato e preciso. Hai tenuto il punto senza perdere il controllo: è così che si guadagna rispetto.",
        mid: "Ci sei quasi. Hai capito la situazione, ma in un passaggio hai lasciato che fossero gli altri a decidere il ritmo.",
        low: "Hai reagito invece di ragionare. Rileggi i passaggi: la risposta giusta era già nei fatti che avevi davanti."
      }
    },
    sakayanagi: {
      name: "Arisu Sakayanagi",
      image: "assets/cote/sakayanagi.webp",
      lines: {
        high: "Elegante. Hai mosso i pezzi giusti nell'ordine giusto, e l'altro non se n'è nemmeno accorto.",
        mid: "Una partita discreta. Hai visto la mossa, non sempre quella dopo: in una trattativa conta la seconda.",
        low: "Hai giocato la mano che ti hanno servito. Chi controlla le condizioni controlla l'esito, e qui le hai lasciate a loro."
      }
    },
    ryuen: {
      name: "Kakeru Ryuen",
      image: "assets/cote/ryuen.webp",
      lines: {
        high: "Non ti sei fatto mettere sotto. Hai preso spazio senza bisogno di alzare la voce. Così si fa.",
        mid: "Hai tenuto botta, a metà. Il gruppo sente chi esita: un'esitazione in meno e la scena era tua.",
        low: "Ti hanno spinto e hai ballato al loro ritmo. Il gruppo segue chi resta fermo, non chi reagisce."
      }
    },
    kushida: {
      name: "Kikyo Kushida",
      image: "assets/cote/kushida.webp",
      lines: {
        high: "Perfetto: tutti ne escono bene, e tu meglio di tutti. La reputazione si costruisce proprio così.",
        mid: "Non male, ma qualcuno se lo ricorderà. Le persone dimenticano le parole, non come le hai fatte sentire.",
        low: "Hai vinto il momento e perso la stanza. La reputazione è ciò che dicono di te quando non ci sei."
      }
    },
    ayanokoji: {
      name: "Kiyotaka Ayanokoji",
      image: "assets/cote/ayanokoji.webp",
      lines: {
        high: "Hai letto cosa c'era sotto prima di muoverti. Il resto è una conseguenza.",
        mid: "Corretto in superficie. Ma le persone raramente dicono ciò che vogliono davvero: cercalo.",
        low: "Hai risposto a quello che vedevi. Quello che contava era quello che non vedevi."
      }
    }
  };

  const ui = {
    tab: "exams",
    filterCat: "all",
    filterDiff: "all",
    session: null, // esame in corso
    free: null // { scenario, result }
  };

  /* ---------------------------------------------------------- utilita' */

  const $ = (id) => document.getElementById(id);

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  // Testo da leggere: virgolette e apostrofi tipografici (solo per il racconto).
  function prose(text) {
    const t = String(text == null ? "" : text)
      .replace(/"([^"]*)"/g, "\u201c$1\u201d")
      .replace(/([A-Za-zÀ-ÿ])'([A-Za-zÀ-ÿ])/g, "$1\u2019$2");
    return esc(t);
  }

  function profile() {
    state.scenarioLab = E.ensureProfile(state.scenarioLab);
    return state.scenarioLab;
  }

  function dimLabel(key) {
    const d = E.DIMENSIONS.find((x) => x.key === key);
    return d ? d.label : key;
  }

  function catLabel(key) {
    return (E.CATEGORIES[key] || { label: key }).label;
  }

  function mentorFor(scenario) {
    const key = scenario.mentor || (E.CATEGORIES[scenario.category] || {}).mentor || "horikita";
    return MENTORS[key] || MENTORS.horikita;
  }

  function pips(difficulty) {
    return `<span class="scen-pips" aria-label="Difficoltà ${difficulty} su 5">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= difficulty ? "on" : ""}"></i>`).join("")}</span>`;
  }

  function changeChips(changes) {
    const entries = Object.entries(changes || {}).filter(([, v]) => v);
    if (!entries.length) return `<span class="scen-chip">Nessun cambiamento</span>`;
    return entries
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .map(([k, v]) => `<span class="scen-chip ${v > 0 ? "up" : "down"}">${esc(dimLabel(k))} ${v > 0 ? "+" : ""}${v}</span>`)
      .join("");
  }

  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
  }

  /* ---------------------------------------------------------- struttura */

  function renderClassChip() {
    const box = $("scenClassChip");
    if (!box) return;
    const info = E.classFor(profile(), EXAMS);
    box.innerHTML = `
      <span class="scen-class-letter">${info.current.key}</span>
      <span class="scen-class-copy">
        <strong>${esc(info.current.name)} · ${profile().pp} punti privati</strong>
        <span>${info.next ? `Verso la ${esc(info.next.name)}: ${esc(info.needs.join(", "))}` : "Il livello più alto"}</span>
      </span>`;
  }

  function setTab(tab) {
    ui.tab = tab;
    document.querySelectorAll("#scenarios [data-scen-tab]").forEach((b) => {
      const on = b.dataset.scenTab === tab;
      b.setAttribute("aria-selected", String(on));
      b.classList.toggle("active", on);
    });
    ["exams", "free", "profile"].forEach((t) => {
      const panel = $(`scenPanel-${t}`);
      if (panel) panel.hidden = t !== tab;
    });
    render();
  }

  function render() {
    renderClassChip();
    if (ui.tab === "exams") (ui.session ? renderExam() : renderHome());
    else if (ui.tab === "free") renderFree();
    else renderProfile();
  }

  /* ------------------------------------------------------------- home */

  function renderHome() {
    const box = $("scenPanel-exams");
    if (!box) return;
    const p = profile();
    const rec = E.recommend(p, EXAMS);
    const cats = ["all", ...Object.keys(E.CATEGORIES)];
    const list = EXAMS.filter((s) => (ui.filterCat === "all" || s.category === ui.filterCat) && (ui.filterDiff === "all" || (ui.filterDiff === "base" ? s.difficulty <= 2 : ui.filterDiff === "mid" ? s.difficulty === 3 : s.difficulty >= 4)));
    const done = EXAMS.filter((s) => p.completed[s.id]).length;
    box.innerHTML = `
      ${rec.scenario ? `
      <article class="scen-hero">
        <div class="scen-hero-copy">
          <span class="scen-kicker">Prossimo esame consigliato</span>
          <h2>${esc(rec.scenario.title)}</h2>
          <p class="scen-hero-meta">${esc(catLabel(rec.scenario.category))} · ${esc(E.DIFFICULTY_LABELS[rec.scenario.difficulty])} ${pips(rec.scenario.difficulty)}</p>
          <p class="scen-hero-why">${rec.weakness.source === "errors"
            ? `Allena <strong>${esc(dimLabel(rec.weakness.key))}</strong>: è dove hai lasciato più punti negli ultimi esami.`
            : `Allena <strong>${esc(dimLabel(rec.weakness.key))}</strong>, la categoria più bassa del tuo profilo.`}</p>
        </div>
        <button class="primary-action" type="button" data-act="start" data-id="${esc(rec.scenario.id)}">Inizia l'esame</button>
      </article>` : ""}
      <div class="scen-filters">
        <div class="scen-filter-row" role="group" aria-label="Categoria">
          ${cats.map((c) => `<button type="button" class="scen-filter${ui.filterCat === c ? " active" : ""}" data-act="cat" data-cat="${c}" aria-pressed="${ui.filterCat === c}">${c === "all" ? "Tutte" : esc(catLabel(c))}</button>`).join("")}
        </div>
        <div class="scen-filter-row" role="group" aria-label="Difficoltà">
          ${[["all", "Ogni livello"], ["base", "Base"], ["mid", "Intermedio"], ["hard", "Avanzato ed esperto"]].map(([k, l]) => `<button type="button" class="scen-filter small${ui.filterDiff === k ? " active" : ""}" data-act="diff" data-diff="${k}" aria-pressed="${ui.filterDiff === k}">${l}</button>`).join("")}
          <span class="scen-count">${done}/${EXAMS.length} completati</span>
        </div>
      </div>
      <div class="scen-grid">
        ${list.map((s) => {
          const c = p.completed[s.id];
          return `
          <button type="button" class="scen-card${c ? " done" : ""}" data-act="start" data-id="${esc(s.id)}">
            <span class="scen-card-top"><span class="scen-card-cat">${esc(catLabel(s.category))}</span>${pips(s.difficulty)}</span>
            <strong class="scen-card-title">${esc(s.title)}</strong>
            <span class="scen-card-obj">${esc(s.objective)}</span>
            <span class="scen-card-status">${c ? `<span class="scen-grade g-${c.grade}">${c.grade}</span> Migliore ${c.best}/100 · ${c.attempts} ${c.attempts === 1 ? "tentativo" : "tentativi"}` : `<span class="scen-new">Nuovo</span> ${esc(E.DIFFICULTY_LABELS[s.difficulty])}`}</span>
          </button>`;
        }).join("") || `<p class="scen-empty">Nessun esame con questi filtri.</p>`}
      </div>`;
  }

  /* -------------------------------------------------------- esame */

  function startExam(id) {
    const scenario = EXAMS.find((s) => s.id === id);
    if (!scenario) return;
    const p = profile();
    ui.confirmLeave = false;
    ui.session = {
      scenario,
      step: "brief",
      round: 0,
      order: scenario.rounds.map((r) => E.shuffle(r.options.map((_, i) => i))),
      choices: [],
      picked: null,
      phrase: null,
      phraseText: "",
      phraseError: false,
      record: null,
      // gia' completato, oppure iniziato e abbandonato: conta come ripetizione
      replay: Boolean(p.completed[scenario.id] || p.started[scenario.id])
    };
    ui.stepAt = Date.now();
    setTab("exams");
    scrollTop();
  }

  function inProgress() {
    const s = ui.session;
    return Boolean(s && (s.step === "round" || s.step === "phrase") && s.choices.length > 0);
  }

  function scrollTop() {
    const box = $("scenPanel-exams");
    if (box && box.getBoundingClientRect().top < 0) box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function progressHtml(s) {
    const steps = ["Fascicolo", "Round 1", "Round 2", "Round 3", "Debrief"];
    const current = s.step === "brief" ? 0 : s.step === "debrief" ? 4 : s.round + 1;
    return `<ol class="scen-progress">${steps.map((label, i) => `<li class="${i < current ? "past" : i === current ? "now" : ""}"><span>${label}</span></li>`).join("")}</ol>`;
  }

  function castHtml(scenario) {
    return `<ul class="scen-cast">${scenario.cast.map((c) => `<li><strong>${esc(c.name)}</strong><span>${esc(c.role)}</span><em>${esc(c.note)}</em></li>`).join("")}</ul>`;
  }

  function renderExam() {
    const box = $("scenPanel-exams");
    const s = ui.session;
    if (!box || !s) return;
    const sc = s.scenario;
    let body = "";
    if (s.step === "brief") body = briefHtml(sc);
    else if (s.step === "round") body = roundHtml(s);
    else if (s.step === "phrase") body = phraseHtml(s);
    else body = debriefHtml(s);
    box.innerHTML = `
      <div class="scen-exam">
        <div class="scen-exam-bar">
          ${ui.confirmLeave
            ? `<span class="scen-leave-confirm">Uscire? L'esame resta incompleto e rifarlo conterà come ripetizione. <button type="button" class="ghost-action small" data-act="leave-yes">Esci</button> <button type="button" class="primary-action small" data-act="leave-no">Continua l'esame</button></span>`
            : `<button type="button" class="ghost-action small" data-act="leave">Tutti gli esami</button>`}
          <span class="scen-exam-meta">${esc(catLabel(sc.category))} · ${esc(E.DIFFICULTY_LABELS[sc.difficulty])} ${pips(sc.difficulty)}${s.replay ? ` · <span class="scen-replay">ripetizione</span>` : ""}</span>
        </div>
        ${progressHtml(s)}
        <div class="scen-exam-layout${s.step === "brief" || s.step === "debrief" ? " single" : ""}">
          ${s.step === "brief" || s.step === "debrief" ? "" : `
          <aside class="scen-dossier">
            <h3>${esc(sc.title)}</h3>
            <p class="scen-dossier-obj"><span>Obiettivo</span>${esc(sc.objective)}</p>
            ${castHtml(sc)}
          </aside>`}
          <div class="scen-stage">${body}</div>
        </div>
      </div>`;
    const focus = box.querySelector("[data-autofocus]");
    if (focus) focus.focus({ preventScroll: true });
  }

  function briefHtml(sc) {
    return `
      <article class="scen-brief">
        <span class="scen-kicker">Esame speciale</span>
        <h2>${esc(sc.title)}</h2>
        <p class="scen-story">${prose(sc.setting)}</p>
        <div class="scen-brief-grid">
          <div><h4>Le persone</h4>${castHtml(sc)}</div>
          <div>
            <h4>Il tuo obiettivo</h4>
            <p class="scen-objective">${esc(sc.objective)}</p>
            <h4>Come funziona</h4>
            <p class="scen-howto">Tre momenti, quattro mosse ciascuno. Ogni scelta cambia come reagiscono gli altri. A un certo punto scriverai la frase esatta. Alla fine scopri cosa stava succedendo davvero.</p>
          </div>
        </div>
        <div class="scen-actions"><button class="primary-action" type="button" data-act="begin" data-autofocus>Inizia</button></div>
      </article>`;
  }

  function roundHtml(s) {
    const sc = s.scenario;
    const round = sc.rounds[s.round];
    const prev = s.choices[s.round - 1];
    const prevOption = prev ? sc.rounds[s.round - 1].options[prev.index] : null;
    // l'opzione scelta prima puo' avere un suo testo di peggioramento ("" = nessuno)
    const escalated = s.round > 0 && prevOption
      ? (typeof prevOption.escalation === "string" ? prevOption.escalation : (prev.quality === "weak" || prev.quality === "bad") ? round.escalation : "")
      : "";
    const picked = s.picked;
    const letters = ["A", "B", "C", "D"];
    const options = s.order[s.round].map((index, pos) => {
      const o = round.options[index];
      const chosen = picked && picked.index === index;
      const cls = picked ? (chosen ? ` chosen q-${o.quality}` : " dim") : "";
      return `<button type="button" class="scen-option${cls}" data-act="pick" data-index="${index}" ${picked ? "disabled" : ""}>
        <span class="scen-option-key">${letters[pos]}</span>
        <span class="scen-option-text">${prose(o.text)}</span>
      </button>`;
    }).join("");
    let reveal = "";
    if (picked) {
      const o = round.options[picked.index];
      const q = E.QUALITY[o.quality];
      const last = s.round === sc.rounds.length - 1;
      const phraseNext = sc.phrase && sc.phrase.round === s.round;
      reveal = `
        <div class="scen-reveal q-${o.quality}" role="status" aria-live="polite">
          <span class="scen-quality q-${o.quality}">${esc(q.label)}</span>
          <p class="scen-outcome">${prose(o.outcome)}</p>
          <p class="scen-why">${prose(o.why)}</p>
          <div class="scen-actions"><button class="primary-action" type="button" data-act="next" data-autofocus>${phraseNext ? "Scrivi la tua frase" : last ? "Vai al debrief" : "Continua"}</button></div>
        </div>`;
    }
    return `
      <article class="scen-round">
        <span class="scen-kicker">Round ${s.round + 1} di ${sc.rounds.length}</span>
        ${escalated ? `<p class="scen-escalation">${prose(escalated)}</p>` : ""}
        <p class="scen-story">${prose(round.text)}</p>
        <h3 class="scen-prompt">${esc(round.prompt)}</h3>
        <div class="scen-options" role="group" aria-label="Scegli una mossa">${options}</div>
        ${reveal}
        ${picked ? "" : `<p class="scen-hint">Tasti 1–4 o A–D per scegliere.</p>`}
      </article>`;
  }

  function phraseHtml(s) {
    const ph = s.scenario.phrase;
    const r = s.phrase;
    return `
      <article class="scen-phrase">
        <span class="scen-kicker">La tua frase</span>
        <h3 class="scen-prompt" id="scenPhrasePrompt">${esc(ph.prompt)}</h3>
        <textarea id="scenPhraseInput" rows="5" aria-labelledby="scenPhrasePrompt" placeholder="Scrivi esattamente le parole che useresti." ${r ? "readonly" : "data-autofocus"}>${esc(s.phraseText)}</textarea>
        ${s.phraseError && !r ? `<p class="scen-error" role="alert">Scrivi la frase prima di valutarla, oppure usa "Salta".</p>` : ""}
        ${r ? `
          <div class="scen-phrase-result">
            <div class="scen-score-ring" style="--v:${r.score}"><strong>${r.score}</strong><span>/100</span></div>
            <ul class="scen-notes">${r.notes.map((n) => `<li class="n-${n.tone}">${esc(n.text)}</li>`).join("")}</ul>
          </div>
          <div class="scen-model"><span>Una frase forte</span><p>${prose(ph.model)}</p></div>
          <div class="scen-actions"><button class="primary-action" type="button" data-act="next" data-autofocus>${s.round === s.scenario.rounds.length - 1 ? "Vai al debrief" : "Continua"}</button></div>`
        : `
          <div class="scen-actions">
            <button class="primary-action" type="button" data-act="phrase">Valuta la frase</button>
            <button class="ghost-action" type="button" data-act="skip-phrase">Salta (vale il 20% del voto)</button>
          </div>`}
      </article>`;
  }

  function finishExam() {
    const s = ui.session;
    if (!s || s.record) return;
    const record = E.recordExam(profile(), s.scenario, s.choices, s.phrase, { replay: s.replay });
    s.record = record;
    s.step = "debrief";
    save();
  }

  function debriefHtml(s) {
    const sc = s.scenario;
    const { result, changes, pp, replay } = s.record;
    const mentor = mentorFor(sc);
    const tier = result.score >= 80 ? "high" : result.score >= 55 ? "mid" : "low";
    const missedTop = Object.entries(result.missed).sort((a, b) => b[1] - a[1])[0];
    const rounds = s.choices.map((c, i) => {
      const round = sc.rounds[i];
      const best = round.options.find((o) => o.quality === "best");
      const chosen = round.options[c.index];
      return `
        <li class="q-${chosen.quality}">
          <div class="scen-recap-head"><span class="scen-quality q-${chosen.quality}">${esc(E.QUALITY[chosen.quality].label)}</span><span class="scen-recap-round">Round ${i + 1}</span></div>
          <p class="scen-recap-move">${prose(chosen.text)}</p>
          ${chosen.quality === "best" ? "" : `<p class="scen-recap-best"><span>La mossa migliore</span>${prose(best.text)}</p><p class="scen-why">${prose(best.why)}</p>`}
        </li>`;
    }).join("");
    return `
      <article class="scen-debrief">
        <div class="scen-verdict">
          <div class="scen-grade-big g-${result.grade}">${result.grade}</div>
          <div class="scen-verdict-copy">
            <span class="scen-kicker">Esito dell'esame</span>
            <h2>${esc(sc.title)}</h2>
            <p>${result.score}/100 · mosse ${result.roundsAvg}/100 · frase ${s.phrase && !s.phrase.empty ? `${result.phraseScore}/100` : "saltata"}</p>
            <p class="scen-pp">${replay ? "Ripetizione: il profilo cambia poco e non guadagni punti privati." : `+${pp} punti privati`}</p>
          </div>
        </div>

        <section class="scen-truth">
          <h3>Cosa c'era sotto</h3>
          <p>${prose(sc.debrief.truth)}</p>
        </section>

        <section class="scen-mentor">
          <img src="${esc(mentor.image)}" alt="" width="72" height="72">
          <div>
            <strong>${esc(mentor.name)}</strong>
            <p>${esc(mentor.lines[tier])}${missedTop ? ` Da allenare: <em>${esc(dimLabel(missedTop[0]))}</em>.` : ""}</p>
          </div>
        </section>

        <section class="scen-lesson">
          <p class="scen-principle">${prose(sc.debrief.principle)}</p>
          <p class="scen-tip"><span>Da riusare</span>${prose(sc.debrief.tip)}</p>
        </section>

        <section>
          <h3>Le tue mosse</h3>
          <ol class="scen-recap">${rounds}</ol>
        </section>

        ${s.phrase && !s.phrase.empty ? `
        <section>
          <h3>La tua frase · ${s.phrase.score}/100</h3>
          <p class="scen-quote">${prose(s.phraseText)}</p>
          <div class="scen-model"><span>Una frase forte</span><p>${prose(sc.phrase.model)}</p></div>
        </section>` : ""}

        <section>
          <h3>Profilo</h3>
          <div class="scen-chips">${changeChips(changes)}</div>
        </section>

        <div class="scen-actions">
          <button class="primary-action" type="button" data-act="next-rec">Prossimo esame consigliato</button>
          <button class="ghost-action" type="button" data-act="start" data-id="${esc(sc.id)}">Riprova</button>
          <button class="ghost-action" type="button" data-act="leave">Tutti gli esami</button>
        </div>
      </article>`;
  }

  function pick(index) {
    const s = ui.session;
    if (!s || s.step !== "round" || s.picked) return;
    const option = s.scenario.rounds[s.round].options[index];
    if (!option) return;
    s.picked = { index };
    s.choices[s.round] = { round: s.round, index, quality: option.quality, effects: option.effects, text: option.text };
    if (s.round === 0 && !s.replay) {
      E.markStarted(profile(), s.scenario.id);
      if (typeof saveState === "function") saveState();
    }
    ui.stepAt = Date.now();
    renderExam();
  }

  function next() {
    const s = ui.session;
    if (!s) return;
    if (s.step === "brief") {
      s.step = "round";
      s.round = 0;
      s.picked = null;
    } else if (s.step === "round") {
      if (!s.picked) return;
      if (s.scenario.phrase && s.scenario.phrase.round === s.round && !s.phraseDone) {
        s.step = "phrase";
      } else if (s.round < s.scenario.rounds.length - 1) {
        s.round += 1;
        s.picked = null;
      } else {
        finishExam();
      }
    } else if (s.step === "phrase") {
      s.phraseDone = true;
      if (s.round < s.scenario.rounds.length - 1) {
        s.step = "round";
        s.round += 1;
        s.picked = null;
      } else {
        finishExam();
      }
    }
    ui.stepAt = Date.now();
    renderExam();
    scrollTop();
  }

  function evaluatePhrase(skip) {
    const s = ui.session;
    if (!s) return;
    const input = $("scenPhraseInput");
    const text = input ? input.value : "";
    if (skip) {
      s.phrase = null;
      s.phraseText = "";
      next();
      return;
    }
    if (!text.trim()) {
      s.phraseError = true;
      renderExam();
      return;
    }
    s.phraseError = false;
    s.phraseText = text;
    s.phrase = E.evalPhrase(text, s.scenario.phrase.keys);
    renderExam();
  }

  /* ---------------------------------------------------- risposta libera */

  function pickFree(id) {
    const pool = FREE;
    if (!pool.length) {
      ui.free = null;
      return;
    }
    let scenario = pool.find((s) => s.id === id);
    if (!scenario) {
      const others = pool.filter((s) => !ui.free || s.id !== ui.free.scenario.id);
      scenario = others[Math.floor(Math.random() * others.length)] || pool[0];
    }
    ui.free = scenario ? { scenario, result: null, answers: { observe: "", say: "", planB: "" }, showModel: false, recorded: null } : null;
    renderFree();
  }

  function renderFree() {
    const box = $("scenPanel-free");
    if (!box) return;
    if (!ui.free && FREE.length) {
      pickFree();
      return;
    }
    const f = ui.free;
    if (!f) {
      box.innerHTML = `<p class="scen-empty">Nessuno scenario disponibile.</p>`;
      return;
    }
    const sc = f.scenario;
    const r = f.result;
    const part = (key, label, hint) => {
      const notes = r ? r.notes.filter((n) => n.part === key) : [];
      const score = r ? (key === "observe" ? r.parts.observe : key === "say" ? r.parts.say : r.parts.planB) : null;
      return `
        <label class="scen-free-part">
          <span class="scen-free-label">${label}${score !== null ? ` <b class="scen-part-score">${score}</b>` : ""}</span>
          <textarea id="scenFree-${key}" rows="3" placeholder="${esc(hint)}">${esc(f.answers[key])}</textarea>
          ${notes.length ? `<ul class="scen-notes">${notes.map((n) => `<li class="n-${n.tone}">${esc(n.text)}</li>`).join("")}</ul>` : ""}
        </label>`;
    };
    box.innerHTML = `
      <div class="scen-free">
        <div class="scen-free-bar">
          <select id="scenFreeSelect" aria-label="Scegli lo scenario">
            ${FREE.map((s) => `<option value="${esc(s.id)}"${s.id === sc.id ? " selected" : ""}>${esc(s.title)}</option>`).join("")}
          </select>
          <button type="button" class="ghost-action" data-act="free-random">Scenario a caso</button>
        </div>
        <article class="scen-free-card">
          <span class="scen-kicker">${esc(sc.type)} · ${esc(E.DIFFICULTY_LABELS[sc.difficulty])} ${pips(sc.difficulty)}</span>
          <h2>${esc(sc.title)}</h2>
          <p class="scen-story">${prose(sc.text)}</p>
          ${part("observe", "1. Cosa osservi", "I fatti che vedi, cosa non sai ancora, le ipotesi possibili.")}
          ${part("say", "2. Cosa dici o fai", "La frase esatta che diresti, tra virgolette se vuoi.")}
          ${part("planB", "3. Se non funziona", "Se succede X, allora faccio Y.")}
          <div class="scen-actions">
            <button class="primary-action" type="button" data-act="free-eval">Valuta la risposta</button>
            <button class="ghost-action" type="button" data-act="free-model">${f.showModel ? "Nascondi il modello" : "Confronta con il modello"}</button>
          </div>
          ${f.showModel ? `<div class="scen-model"><span>Risposta modello</span><p>${prose(sc.model)}</p></div>` : ""}
          ${r ? `
          <div class="scen-free-result">
            <div class="scen-score-ring" style="--v:${r.score}"><strong>${r.score}</strong><span>/100</span></div>
            <div>
              <p><strong>Voto ${r.grade}</strong> · lettura ${r.parts.observe} · frase ${r.parts.say} · piano B ${r.parts.planB} · etica ${r.parts.ethics}</p>
              ${r.notes.filter((n) => n.part === "ethics").map((n) => `<p class="scen-notes-inline n-bad">${esc(n.text)}</p>`).join("")}
              <div class="scen-chips">${changeChips(r.changes)}</div>
              <p class="scen-small">${r.again ? "Profilo già aggiornato con la prima valutazione: puoi migliorare il testo e rivalutarlo, ma conta solo la prima." : "La risposta libera pesa meno sul profilo degli esami: la valutazione del testo è automatica e meno precisa delle scelte."}</p>
            </div>
          </div>` : ""}
        </article>
      </div>`;
  }

  function readFree() {
    const f = ui.free;
    if (!f) return;
    ["observe", "say", "planB"].forEach((k) => {
      const el = $(`scenFree-${k}`);
      if (el) f.answers[k] = el.value;
    });
  }

  function evaluateFree() {
    const f = ui.free;
    if (!f) return;
    readFree();
    const words = E.wordCount(`${f.answers.observe} ${f.answers.say} ${f.answers.planB}`);
    if (words < 12) {
      f.result = null;
      renderFree();
      const say = $("scenFree-say");
      if (say) {
        say.setCustomValidity("Scrivi almeno le tre parti in breve.");
        say.reportValidity();
        setTimeout(() => say.setCustomValidity(""), 1500);
      }
      return;
    }
    const result = E.evalFree(f.answers, f.scenario);
    // il profilo si aggiorna una volta sola per scenario caricato: le valutazioni
    // successive mostrano il nuovo voto ma non spostano piu' le categorie
    if (!f.recorded) {
      f.recorded = E.recordFree(profile(), f.scenario, result).changes;
      save();
      renderClassChip();
    }
    f.result = { ...result, changes: f.recorded, again: f.result !== null || f.evaluated };
    f.evaluated = true;
    renderFree();
  }

  /* -------------------------------------------------------------- profilo */

  function profileSkills() {
    const p = profile();
    return E.DIMENSIONS.map((d) => ({ key: d.key, label: d.label, value: Math.round(p[d.key]) }));
  }

  function renderProfile() {
    const box = $("scenPanel-profile");
    if (!box) return;
    const p = profile();
    const info = E.classFor(p, EXAMS);
    const skills = profileSkills();
    const totalScore = E.total(p);
    const weak = E.weakness(p);
    const rec = E.recommend(p, EXAMS);
    const last = p.last ? p.last.changes : {};
    const history = p.history.slice(0, 10);
    const radar = typeof buildRadarMarkup === "function" ? buildRadarMarkup(skills, 280, 140, 118, false) : "";
    box.innerHTML = `
      <div class="scen-profile">
        <article class="scen-class-card">
          <span class="scen-class-big">${info.current.key}</span>
          <div>
            <span class="scen-kicker">La tua classe</span>
            <h2>${esc(info.current.name)}</h2>
            <p>${p.pp} punti privati · ${info.done} esami · ${p.freeCount} risposte libere</p>
            <p class="scen-small">${info.next ? `Per la ${esc(info.next.name)}: ${esc(info.next.text)} Ti manca: ${esc(info.needs.join(", "))}.` : "Sei in Classe A: mantienila, il profilo può anche scendere."}</p>
          </div>
        </article>

        <article class="scen-profile-card scen-p-radar">
          <div class="scen-radar-wrap">
            <svg class="module-radar scen-radar" viewBox="0 0 280 280" aria-label="Profilo scenari">${radar}</svg>
            <div class="scen-total"><strong>${totalScore}</strong><span>media delle 6 categorie</span></div>
          </div>
          <ul class="scen-dims">
            ${skills.map((s) => {
              const ch = last[s.key];
              return `<li>
                <div class="scen-dim-head"><span>${esc(s.label)}</span><strong>${s.value}</strong>${ch ? `<em class="${ch > 0 ? "up" : "down"}">${ch > 0 ? "+" : ""}${ch}</em>` : ""}</div>
                <div class="mini-track"><div class="mini-fill" style="width:${s.value}%"></div></div>
                <p>${esc(E.DIMENSIONS.find((d) => d.key === s.key).text)}</p>
              </li>`;
            }).join("")}
          </ul>
        </article>

        <article class="scen-profile-card">
          <h3>Dove perdi più punti</h3>
          <p>${weak.source === "errors"
            ? `<strong>${esc(dimLabel(weak.key))}</strong>: negli ultimi esami è la categoria in cui la mossa migliore ti avrebbe dato di più.`
            : `Ancora pochi dati: per ora la categoria più bassa è <strong>${esc(dimLabel(weak.key))}</strong>.`}</p>
          ${rec.scenario ? `<button class="primary-action scen-train-btn" type="button" data-act="start" data-id="${esc(rec.scenario.id)}">Allenala: ${esc(rec.scenario.title)}</button>` : ""}
          <h3>Come si calcola</h3>
          <p class="scen-small">Ogni mossa sposta alcune categorie (in su o in giù). A fine esame le somme vengono pesate per difficoltà: gli esami avanzati fanno guadagnare di più e perdere meno. Massimo ${E.MAX_EXAM_CHANGE} punti per categoria a esame; le ripetizioni contano un quarto e non danno punti privati. Il totale è la media delle sei categorie.</p>
        </article>

        <article class="scen-profile-card">
          <h3>Ultimi esercizi</h3>
          ${history.length ? `<ul class="scen-history">${history.map((h) => `
            <li>
              <span class="scen-grade g-${h.grade}">${h.grade}</span>
              <div>
                <strong>${esc(h.title)}</strong>
                <span>${h.kind === "free" ? "Risposta libera" : esc(catLabel(h.category))} · ${h.score}/100${h.replay ? " · ripetizione" : ""}${h.pp ? ` · +${h.pp} punti` : ""}</span>
                <div class="scen-chips small">${changeChips(h.changes)}</div>
              </div>
            </li>`).join("")}</ul>` : `<p class="scen-small">Ancora niente: inizia dal primo esame consigliato.</p>`}
        </article>
      </div>`;
  }

  window.renderScenarioProfile = function renderScenarioProfile() {
    if (!E || !$("scenarios")) return;
    renderClassChip();
    if (ui.tab === "profile") renderProfile();
  };

  window.scenarioProfileSkills = function () {
    return E ? profileSkills() : [];
  };

  /* ---------------------------------------------------------- eventi */

  function onClick(event) {
    const el = event.target.closest("[data-act], [data-scen-tab]");
    if (!el || !$("scenarios").contains(el)) return;
    if (el.dataset.scenTab) {
      setTab(el.dataset.scenTab);
      return;
    }
    const act = el.dataset.act;
    // dopo un cambio di schermata ignora per un attimo i clic (doppio clic/tap)
    if (["start", "next-rec", "next", "begin", "leave", "leave-yes"].includes(act) && Date.now() - (ui.stepAt || 0) < 300) return;
    if (act === "start") startExam(el.dataset.id);
    else if (act === "cat") {
      ui.filterCat = el.dataset.cat;
      renderHome();
    } else if (act === "diff") {
      ui.filterDiff = el.dataset.diff;
      renderHome();
    } else if (act === "begin" || act === "next") next();
    else if (act === "pick") {
      // un doppio clic su "Continua" non deve scegliere nel round successivo
      if (event.detail > 1 || Date.now() - (ui.stepAt || 0) < 350) return;
      pick(Number(el.dataset.index));
    }
    else if (act === "phrase") evaluatePhrase(false);
    else if (act === "skip-phrase") evaluatePhrase(true);
    else if (act === "leave") {
      if (inProgress()) {
        ui.confirmLeave = true;
        renderExam();
        return;
      }
      ui.session = null;
      setTab("exams");
    } else if (act === "leave-yes") {
      ui.confirmLeave = false;
      ui.session = null;
      setTab("exams");
    } else if (act === "leave-no") {
      ui.confirmLeave = false;
      renderExam();
    } else if (act === "next-rec") {
      const rec = E.recommend(profile(), EXAMS);
      if (rec.scenario) startExam(rec.scenario.id);
    } else if (act === "free-random") {
      readFree();
      pickFree();
    } else if (act === "free-eval") evaluateFree();
    else if (act === "free-model") {
      readFree();
      ui.free.showModel = !ui.free.showModel;
      renderFree();
    }
  }

  function onKey(event) {
    const s = ui.session;
    if (!s || s.step !== "round" || s.picked || ui.tab !== "exams") return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.repeat) return;
    if (Date.now() - (ui.stepAt || 0) < 250) return;
    if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
    const page = $("scenarios");
    if (!page || !page.classList.contains("active-page")) return;
    const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
    const pos = map[event.key.toLowerCase()];
    if (pos === undefined) return;
    event.preventDefault();
    pick(s.order[s.round][pos]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("scenarios");
    if (!page || !E) return;
    page.addEventListener("click", onClick);
    page.addEventListener("change", (event) => {
      if (event.target.id === "scenFreeSelect") pickFree(event.target.value);
    });
    // il testo scritto resta anche cambiando scheda
    page.addEventListener("input", (event) => {
      const id = event.target.id || "";
      if (id.startsWith("scenFree-") && ui.free) ui.free.answers[id.slice(9)] = event.target.value;
      else if (id === "scenPhraseInput" && ui.session && !ui.session.phrase) ui.session.phraseText = event.target.value;
    });
    document.addEventListener("keydown", onKey);
    setTab("exams");
  });
})();
