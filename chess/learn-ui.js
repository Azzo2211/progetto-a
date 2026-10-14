/*
 * Progetto A - Scacchi: scheda Lezioni (coach che insegna).
 *  - percorso di lezioni per grado con teoria, esempio guidato ed esercizi
 *  - allenamento tattico con rating (puzzle Lichess, primo tentativo)
 *  - esercizi presi dagli errori delle tue partite
 */
(function () {
  "use strict";

  const L = window.ChessLessons;
  const R = window.ChessRating;
  let puzzles = null;
  let puzzlesPromise = null;
  let trainer = null;
  let screen = { name: "home" };
  let session = null; // sessione esercizi corrente

  function el(id) {
    return document.getElementById(id);
  }

  function esc(text) {
    return String(text == null ? "" : text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function progressStore() {
    if (!state.chess.lessons || typeof state.chess.lessons !== "object") state.chess.lessons = {};
    return state.chess.lessons;
  }

  function lessonProgress(id) {
    const store = progressStore();
    if (!store[id]) store[id] = { completed: false, attempts: 0, best: 0 };
    return store[id];
  }

  function loadPuzzles() {
    if (puzzles) return Promise.resolve(puzzles);
    if (!puzzlesPromise) {
      puzzlesPromise = fetch("chess/puzzles.json", { cache: "force-cache" })
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          return response.json();
        })
        .then((data) => {
          puzzles = data.puzzles.map(L.parsePuzzleLine);
          return puzzles;
        })
        .catch((error) => {
          puzzlesPromise = null;
          throw error;
        });
    }
    return puzzlesPromise;
  }

  function seededShuffle(list, seedText) {
    let seed = 0;
    for (const ch of seedText) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function puzzleExercise(puzzle) {
    return {
      id: `lichess-${puzzle.id}`,
      fen: puzzle.fen,
      setup: puzzle.moves[0],
      solution: puzzle.moves.slice(1),
      rating: puzzle.rating,
      themes: puzzle.themes,
      source: "puzzle",
      prompt: "",
      lichessId: puzzle.id
    };
  }

  /* --------------------------------------------------------- scacchiera */

  function ensureTrainer() {
    if (trainer) return trainer;
    trainer = new window.ChessTrainerKit.Trainer(getBoardView(), {
      onUpdate: onTrainerUpdate,
      onDone: onTrainerDone,
      canRender: () => window.chessCurrentTab && window.chessCurrentTab() === "learn"
    });
    return trainer;
  }

  function ownsBoard() {
    return Boolean(trainer && trainer.isActive() && window.chessCurrentTab && window.chessCurrentTab() === "learn");
  }

  function renderChrome() {
    const t = trainer;
    const top = el("topPlayerName");
    if (!top) return;
    const desc = t && t.active ? t.describe() : null;
    if (t && t.example) {
      top.textContent = "Esempio guidato";
      el("topPlayerSub").textContent = screen.lesson ? screen.lesson.title : "";
      el("bottomPlayerName").textContent = window.chessMentor().name;
      el("bottomPlayerSub").textContent = "Il coach ti mostra l'idea";
    } else if (desc) {
      const ex = t.active.exercise;
      top.textContent = ex.source === "puzzle" ? `Esercizio ${ex.rating}` : ex.source === "game" ? "Dalla tua partita" : "Esercizio della lezione";
      el("topPlayerSub").textContent = ex.source === "puzzle" && desc.finished ? (ex.themes || []).map((th) => L.THEME_LABELS[th]).filter(Boolean).join(" · ") : "Tema nascosto fino alla soluzione";
      el("bottomPlayerName").textContent = `Giochi con il ${desc.colorName}`;
      el("bottomPlayerSub").textContent = desc.finished ? (t.active.failed ? "Risolto con aiuto" : "Risolto al primo tentativo") : "Trova la mossa migliore";
    }
    ["topCaptured", "bottomCaptured", "topPlayerStatus", "bottomPlayerStatus"].forEach((id) => {
      if (el(id)) el(id).textContent = "";
    });
    el("topPlayerBar").classList.remove("is-turn");
    el("bottomPlayerBar").classList.toggle("is-turn", Boolean(desc && !desc.finished));
    const turn = el("turnStatus");
    if (turn) turn.textContent = t && t.example ? "Esempio" : desc ? (desc.finished ? "Esercizio finito" : `Tocca al ${desc.colorName}`) : "";
    const evalText = el("evalStatus");
    if (evalText) evalText.textContent = "";
  }

  function nav(delta) {
    if (trainer && trainer.example) trainer.exampleStep(delta > 50 ? 99 : delta < -50 ? -99 : delta);
  }

  /* --------------------------------------------------------------- eventi */

  function onTrainerUpdate(event) {
    if (event.kind === "example") {
      const box = el("exampleText");
      if (box) box.textContent = event.text || "Usa le frecce per scorrere l'esempio.";
      const counter = el("exampleCounter");
      if (counter) counter.textContent = `${event.step}/${event.total}`;
      const prev = el("examplePrev");
      const next = el("exampleNext");
      if (prev) prev.disabled = event.step === 0;
      if (next) next.disabled = event.atEnd;
      const done = el("exampleDone");
      if (done) done.hidden = !event.atEnd;
      renderChrome();
      return;
    }
    if (["wrong", "hint", "solution"].includes(event.kind)) recordPuzzleFailure();
    if (["wrong", "hint", "progress"].includes(event.kind)) setFeedback(event.text, event.kind === "wrong" ? "bad" : "info");
    if (event.kind === "start") {
      const ex = trainer.active.exercise;
      const desc = trainer.describe();
      setFeedback(ex.prompt || `Tocca al ${desc.colorName}: trova la mossa migliore.`, "info");
      renderExerciseButtons();
    }
    renderChrome();
  }

  function setFeedback(text, tone = "info") {
    const box = el("trainerFeedback");
    if (!box) return;
    box.textContent = text;
    box.dataset.tone = tone;
  }

  // Puzzle: il primo errore (o aiuto) conta subito come tentativo fallito,
  // cosi' uscire a meta' non cancella l'errore.
  function recordPuzzleFailure() {
    const s = trainer && trainer.active;
    if (!s || s.exercise.source !== "puzzle" || s.exercise.retry || s.ratingRecorded) return;
    const res = R.recordPuzzle(window.chessRatingProfile(), { id: s.exercise.lichessId, rating: s.exercise.rating, solved: false });
    state.chess.rating = res.profile;
    s.ratingRecorded = true;
    s.ratingNote = res.counted ? ` Rating esercizi ${res.profile.puzzle.rating} (${res.change >= 0 ? "+" : ""}${res.change}).` : "";
    saveState();
  }

  function onTrainerDone(result) {
    const ex = result.exercise;
    const s = trainer.active;
    let ratingNote = s && s.ratingNote ? s.ratingNote : "";
    if (ex.source === "puzzle" && !ex.retry && !(s && s.ratingRecorded)) {
      const res = R.recordPuzzle(window.chessRatingProfile(), { id: ex.lichessId, rating: ex.rating, solved: result.solved });
      state.chess.rating = res.profile;
      if (s) s.ratingRecorded = true;
      if (res.counted) ratingNote = ` Rating esercizi ${res.profile.puzzle.rating} (${res.change >= 0 ? "+" : ""}${res.change}).`;
    }
    if (session) {
      // Un risultato per esercizio: il primo tentativo decide "risolto",
      // un nuovo tentativo puo' solo completare la linea.
      const previous = session.results[session.index];
      if (previous) previous.completedLine = previous.completedLine || result.completedLine;
      else session.results[session.index] = { id: ex.id, solved: result.solved, completedLine: result.completedLine, source: ex.source };
    }
    saveState();
    const themes = (ex.themes || []).map((th) => L.THEME_LABELS[th]).filter(Boolean).join(", ");
    const base = result.solved ? "Esatto, risolto al primo tentativo!" : result.solutionShown ? "Ecco la soluzione." : "Risolto, ma con qualche errore o aiuto.";
    const explanation = ex.explanation ? ` ${ex.explanation}` : themes ? ` Tema: ${themes}.` : "";
    setFeedback(`${base}${explanation}${ratingNote}`, result.solved ? "good" : "info");
    renderExerciseButtons(true);
    window.renderChessGradeChip && window.renderChessGradeChip();
    renderChrome();
  }

  /* ---------------------------------------------------------- schermate */

  function onShow() {
    ensureTrainer();
    render();
    // Torna a disegnare l'esercizio (o l'esempio) lasciato a meta'.
    if (trainer.isActive()) trainer.render(false);
  }

  function go(next) {
    screen = next;
    if (trainer) trainer.stop();
    session = null;
    render();
    if (window.renderBoard) renderBoard({ animate: false });
  }

  // Su telefono la scacchiera sta sopra il pannello: la riportiamo in vista.
  function showBoardOnMobile() {
    if (window.innerWidth >= 1150) return;
    const wrap = el("boardWrap");
    if (wrap && wrap.scrollIntoView) wrap.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function render() {
    const root = el("learnRoot");
    if (!root) return;
    if (screen.name === "lesson") return renderLesson(root);
    if (screen.name === "puzzle") return renderPuzzleScreen(root);
    if (screen.name === "game") return renderGameScreen(root);
    if (screen.name === "weakness") return renderWeakness(root);
    return renderHome(root);
  }

  function recommendedLesson() {
    const grade = window.chessCertifiedGrade();
    const nextIndex = Math.min(R.GRADES.length - 1, R.gradeIndex(grade.key) + 1);
    const nextGrade = R.GRADES[nextIndex].key;
    const counts = state.mistakeCounts || {};
    const topPattern = Object.entries(counts).sort((a, b) => b[1] - a[1]).find(([, count]) => count >= 2);
    if (topPattern && L.PATTERN_LESSONS[topPattern[0]]) {
      const lesson = L.byId(L.PATTERN_LESSONS[topPattern[0]]);
      if (lesson && !lessonProgress(lesson.id).completed) {
        return { lesson, reason: `Nelle tue partite il problema piu' frequente e': ${(typeof mistakeLabels !== "undefined" && mistakeLabels[topPattern[0]]) || topPattern[0]} (${topPattern[1]} volte).` };
      }
    }
    const pending = L.forGrade(nextGrade).find((lesson) => !lessonProgress(lesson.id).completed);
    if (pending) return { lesson: pending, reason: `E' la prossima lezione per arrivare al grado ${nextGrade}.` };
    const any = L.LESSONS.find((lesson) => !lessonProgress(lesson.id).completed);
    return any ? { lesson: any, reason: "Continua il percorso." } : null;
  }

  function renderHome(root) {
    const rec = recommendedLesson();
    const profile = window.chessRatingProfile();
    const mentor = window.chessMentor();
    const bank = (state.chess.mistakeBank || []).slice(-6).reverse();
    const grade = window.chessCertifiedGrade();
    root.innerHTML = `
      ${rec ? `
      <section class="learn-hero">
        <img class="learn-hero-avatar" src="${esc(mentor.image)}" alt="" width="56" height="56">
        <div>
          <span class="section-kicker">Consigliato da ${esc(mentor.name.split(" ")[0])}</span>
          <strong>${esc(rec.lesson.title)}</strong>
          <p>${esc(rec.reason)}</p>
        </div>
        <button class="primary-action" type="button" data-lesson="${rec.lesson.id}">Inizia</button>
      </section>` : ""}
      <section class="learn-quick">
        <button class="quick-card" type="button" data-action="puzzles">
          <span class="quick-icon"><svg viewBox="0 0 24 24"><use href="#i-target"/></svg></span>
          <strong>Allenamento tattico</strong>
          <span>${profile.puzzle.count ? `Rating esercizi ${profile.puzzle.rating} · ${profile.puzzle.count} fatti` : "Esercizi veri con rating: misura la tua tattica"}</span>
        </button>
        <button class="quick-card" type="button" data-action="mistakes" ${bank.length ? "" : "disabled"}>
          <span class="quick-icon"><svg viewBox="0 0 24 24"><use href="#i-bulb"/></svg></span>
          <strong>Dalle tue partite</strong>
          <span>${bank.length ? `${(state.chess.mistakeBank || []).length} posizioni dove hai sbagliato` : "Analizza una partita: gli errori diventano esercizi"}</span>
        </button>
      </section>
      ${weaknessSection()}
      ${bank.length ? `<section class="learn-mistakes" id="learnMistakes" hidden>
        ${bank.map((item, i) => `<button type="button" class="mistake-item" data-mistake="${(state.chess.mistakeBank || []).length - 1 - i}"><strong>${esc(item.title)}</strong><span>${esc(item.subtitle)}</span></button>`).join("")}
      </section>` : ""}
      <section class="course-map">
        ${R.GRADES.filter((g) => g.key !== "E").map((g) => {
          const lessons = L.forGrade(g.key);
          const done = lessons.filter((lesson) => lessonProgress(lesson.id).completed).length;
          const unit = L.GRADE_UNITS[g.key];
          const isTarget = R.gradeIndex(g.key) === R.gradeIndex(grade.key) + 1;
          return `<div class="course-unit${isTarget ? " is-target" : ""}">
            <div class="course-unit-head">
              <span class="grade-pill grade-${g.key}">${g.key}</span>
              <div><strong>${esc(unit.title)}</strong><span>${esc(unit.text)}</span></div>
              <span class="course-count">${done}/${lessons.length}</span>
            </div>
            <div class="course-lessons">
              ${lessons.map((lesson) => {
                const p = lessonProgress(lesson.id);
                return `<button type="button" class="lesson-card${p.completed ? " done" : ""}" data-lesson="${lesson.id}">
                  <span class="lesson-status">${p.completed ? `<svg viewBox="0 0 24 24"><use href="#i-check"/></svg>` : p.attempts ? `${p.best}` : ""}</span>
                  <strong>${esc(lesson.title)}</strong>
                  <span>${esc(lesson.summary)}</span>
                </button>`;
              }).join("")}
            </div>
          </div>`;
        }).join("")}
      </section>`;
    root.querySelectorAll("[data-lesson]").forEach((b) => b.addEventListener("click", () => openLesson(b.dataset.lesson)));
    const puzzlesBtn = root.querySelector('[data-action="puzzles"]');
    if (puzzlesBtn) puzzlesBtn.addEventListener("click", startPuzzleTraining);
    const mistakesBtn = root.querySelector('[data-action="mistakes"]');
    if (mistakesBtn) mistakesBtn.addEventListener("click", () => {
      const list = el("learnMistakes");
      if (list) list.hidden = !list.hidden;
    });
    root.querySelectorAll("[data-mistake]").forEach((b) => b.addEventListener("click", () => {
      const item = (state.chess.mistakeBank || [])[Number(b.dataset.mistake)];
      if (item) startGameExercise(item.exercise);
    }));
    root.querySelectorAll("[data-weak]").forEach((b) => b.addEventListener("click", () => go({ name: "weakness", category: b.dataset.weak })));
    renderChrome();
  }

  /* -------------------------------------------------------- reparto errori */

  // Categoria di una posizione sbagliata salvata (anche per quelle vecchie senza campo).
  function bankCategory(item) {
    if (item.category) return item.category;
    const S = window.ChessSkills;
    if (item.pattern && S && S.PATTERN_CATEGORY[item.pattern]) return S.PATTERN_CATEGORY[item.pattern];
    const title = String(item.title || "").toLowerCase();
    if (title.includes("mancata")) return "threatVision";
    if (title.includes("blunder")) return "concentration";
    return "calculation";
  }

  // Errori per categoria: partite analizzate di recente (registro eventi),
  // oppure i pattern delle partite precedenti se non ci sono ancora eventi.
  function weaknessStats() {
    const S = window.ChessSkills;
    const games = state.chess.skillGames || [];
    const stats = Object.fromEntries(S.CATEGORIES.map((c) => [c.key, { errors: 0, labels: {}, recent: [], historic: 0 }]));
    games.forEach((game) => {
      const counted = new Set();
      (game.events || []).forEach((event) => {
        if (event.points >= 0 || !stats[event.category]) return;
        const entry = stats[event.category];
        // piu' eventi sulla stessa mossa contano come un errore solo
        const key = `${event.category}-${event.moveNumber}`;
        if (!counted.has(key)) {
          counted.add(key);
          entry.errors += 1;
        }
        entry.labels[event.label] = (entry.labels[event.label] || 0) + 1;
        entry.recent.push({ label: event.label, moveNumber: event.moveNumber, date: game.date, botElo: game.botElo });
      });
    });
    Object.entries(state.mistakeCounts || {}).forEach(([pattern, count]) => {
      const key = S.PATTERN_CATEGORY[pattern];
      if (key && stats[key]) stats[key].historic += count;
    });
    return { stats, games: games.length };
  }

  function weaknessSection() {
    const S = window.ChessSkills;
    if (!S) return "";
    const skills = S.ensureSkills(state.chess.skills);
    const { stats, games } = weaknessStats();
    const changes = skills.lastGame ? skills.lastGame.changes || {} : {};
    const order = S.CATEGORIES.slice().sort((a, b) => (stats[b.key].errors + stats[b.key].historic * 0.3) - (stats[a.key].errors + stats[a.key].historic * 0.3) || skills[a.key] - skills[b.key]);
    const worst = (stats[order[0].key].errors || stats[order[0].key].historic) ? order[0].key : null;
    return `<section class="weak-dept">
      <div class="weak-head">
        <strong>Reparto errori</strong>
        <span>${games ? `${games === 1 ? "Dalla tua ultima partita analizzata" : `Dalle tue ultime ${games} partite analizzate`}. Apri una categoria per allenarla.` : "Le 6 categorie del tuo profilo. Analizza le partite: qui vedrai cosa sbagli di piu'."}</span>
      </div>
      <div class="weak-grid">
        ${order.map((c) => {
          const st = stats[c.key];
          const value = Math.round(skills[c.key]);
          const change = changes[c.key] || 0;
          const errorsText = st.errors ? `${st.errors} ${st.errors === 1 ? "errore recente" : "errori recenti"}` : st.historic ? `${st.historic} errori in passato` : "nessun errore registrato";
          return `<button type="button" class="weak-card${c.key === worst ? " is-worst" : ""}" data-weak="${c.key}">
            <span class="weak-name">${esc(c.label)}${c.key === worst ? `<em>da allenare</em>` : ""}</span>
            <span class="weak-value"><b>${value}</b>${change ? `<i class="skill-change ${change > 0 ? "up" : "down"}">${change > 0 ? "+" : ""}${Math.round(change)}</i>` : ""}</span>
            <span class="weak-errors">${errorsText}</span>
            <span class="mini-track"><span class="mini-fill" style="width:${value}%"></span></span>
          </button>`;
        }).join("")}
      </div>
    </section>`;
  }

  function renderWeakness(root) {
    const S = window.ChessSkills;
    const category = S.BY_KEY[screen.category];
    if (!category) return go({ name: "home" });
    const skills = S.ensureSkills(state.chess.skills);
    const { stats } = weaknessStats();
    const st = stats[category.key];
    const change = skills.lastGame && skills.lastGame.changes ? skills.lastGame.changes[category.key] || 0 : 0;
    const labels = Object.entries(st.labels).sort((a, b) => b[1] - a[1]);
    const bank = (state.chess.mistakeBank || []).map((item, index) => ({ item, index })).filter(({ item }) => bankCategory(item) === category.key).reverse();
    const lessons = (category.lessons || []).map((id) => L.byId(id)).filter(Boolean);
    const nextLesson = lessons.find((lesson) => !lessonProgress(lesson.id).completed);
    const themes = category.themes.map((th) => L.THEME_LABELS[th]).filter(Boolean).join(", ");
    root.innerHTML = `
      <div class="lesson-top">
        <button class="text-button" type="button" data-back>&larr; Lezioni</button>
        <span class="grade-pill">Reparto errori</span>
      </div>
      <h2 class="lesson-title">${esc(category.label)}</h2>
      <p class="learn-note">${esc(category.text)}</p>
      <div class="puzzle-stats">
        <div><span>Valore</span><strong>${Math.round(skills[category.key])}</strong><small>${change ? `${change > 0 ? "+" : ""}${Math.round(change)} nell'ultima partita` : "su 100"}</small></div>
        <div><span>Errori recenti</span><strong>${st.errors}</strong><small>ultime partite analizzate</small></div>
        <div><span>Posizioni tue</span><strong>${bank.length}</strong><small>da rigiocare</small></div>
      </div>
      <section class="weak-section">
        <strong>Cosa sbagli</strong>
        ${labels.length ? `<ul class="weak-list">${labels.map(([label, count]) => `<li><span>${esc(label)}</span><b>&times;${count}</b></li>`).join("")}</ul>
          <p class="learn-note">Ultimi casi: ${[...new Map(st.recent.slice().reverse().map((r) => [`${r.date}-${r.moveNumber}`, r])).values()].slice(0, 4).map((r) => `mossa ${r.moveNumber} (bot ${r.botElo})`).join(", ")}.</p>`
          : `<p class="learn-note">${st.historic ? `Nelle partite precedenti questo tipo di errore e' comparso ${st.historic} volte. Gioca e analizza una partita per vedere il dettaglio.` : "Nessun errore registrato in questa categoria. Continua cosi'."}</p>`}
      </section>
      ${bank.length ? `<section class="weak-section">
        <strong>Le tue posizioni da rigiocare</strong>
        <div class="learn-mistakes">${bank.slice(0, 8).map(({ item, index }) => `<button type="button" class="mistake-item" data-mistake="${index}"><strong>${esc(item.title)}</strong><span>${esc(item.subtitle)}</span></button>`).join("")}</div>
      </section>` : ""}
      <section class="weak-section">
        <strong>Allenamento mirato</strong>
        <p class="learn-note">6 esercizi sui temi di questa categoria (${esc(themes)}), scelti vicino al tuo rating esercizi.</p>
        <section class="exercise-box">
          <div class="exercise-dots" id="exerciseDots"></div>
          <p class="trainer-feedback" id="trainerFeedback" data-tone="info"></p>
          <div class="exercise-actions" id="exerciseActions"></div>
        </section>
      </section>
      ${lessons.length ? `<section class="weak-section">
        <strong>Lezioni per questa categoria</strong>
        <div class="course-lessons">${lessons.map((lesson) => {
          const p = lessonProgress(lesson.id);
          return `<button type="button" class="lesson-card${p.completed ? " done" : ""}${nextLesson && lesson.id === nextLesson.id ? " is-next" : ""}" data-lesson="${lesson.id}">
            <span class="lesson-status">${p.completed ? `<svg viewBox="0 0 24 24"><use href="#i-check"/></svg>` : ""}</span>
            <strong>${esc(lesson.title)}</strong>
            <span>Grado ${lesson.grade} · ${esc(lesson.summary)}</span>
          </button>`;
        }).join("")}</div>
      </section>` : ""}`;
    root.querySelector("[data-back]").addEventListener("click", () => go({ name: "home" }));
    root.querySelectorAll("[data-lesson]").forEach((b) => b.addEventListener("click", () => openLesson(b.dataset.lesson)));
    root.querySelectorAll("[data-mistake]").forEach((b) => b.addEventListener("click", () => {
      const item = (state.chess.mistakeBank || [])[Number(b.dataset.mistake)];
      if (item) startGameExercise(item.exercise, { name: "weakness", category: category.key });
    }));
    renderExerciseDots();
    renderExerciseButtons(trainer && trainer.active && trainer.active.finished);
    if (session && session.done) setFeedback(session.summary || "", "info");
    renderChrome();
  }

  async function startWeaknessTraining() {
    const S = window.ChessSkills;
    const category = S.BY_KEY[screen.category];
    if (!category) return;
    ensureTrainer();
    const startedOn = screen;
    setFeedback("Preparo gli esercizi...", "info");
    let all;
    try {
      all = await loadPuzzles();
    } catch (error) {
      setFeedback("Esercizi non disponibili: apri il sito da http://localhost:8765 (serve il server locale).", "bad");
      return;
    }
    if (screen !== startedOn) return; // l'utente ha cambiato schermata nel frattempo
    const profile = window.chessRatingProfile();
    const target = profile.puzzle.rating;
    const seen = profile.puzzle.seen || {};
    let width = 200;
    let pool = [];
    while (pool.length < 6 && width < 2400) {
      pool = all.filter((pz) => Math.abs(pz.rating - target) <= width && !(pz.id in seen) && category.themes.some((th) => pz.themes.includes(th)));
      width *= 1.5;
    }
    if (!pool.length) pool = all.filter((pz) => category.themes.some((th) => pz.themes.includes(th)));
    const queue = seededShuffle(pool, `${category.key}-${Date.now()}`).slice(0, 6).map(puzzleExercise);
    session = { kind: "weakness", category: category.key, queue, index: 0, results: [], done: false };
    render();
    trainer.start(queue[0]);
    renderExerciseDots();
    showBoardOnMobile();
  }

  function finishWeaknessSession() {
    const solved = session.results.filter((r) => r && r.solved).length;
    session.done = true;
    const label = window.ChessSkills.BY_KEY[session.category].label;
    session.summary = `Allenamento ${label}: ${solved} esercizi su ${session.queue.length} risolti al primo tentativo. ${solved >= 4 ? "Ottimo lavoro." : "Rifai un giro: la ripetizione e' il modo piu' veloce per correggere un errore."}`;
    setFeedback(session.summary, solved >= 4 ? "good" : "info");
    renderExerciseDots();
    renderExerciseButtons(true);
  }

  /* -------------------------------------------------------------- lezione */

  function openLesson(id) {
    const lesson = L.byId(id);
    if (!lesson) return;
    ensureTrainer();
    trainer.stop();
    session = null;
    screen = { name: "lesson", lesson, stage: "theory" };
    if (lesson.example) trainer.showExample(lesson.example);
    render();
    renderBoard({ animate: false });
  }

  function renderLesson(root) {
    const lesson = screen.lesson;
    const mentor = window.chessMentor();
    const p = lessonProgress(lesson.id);
    const authored = lesson.exercises || [];
    const practice = lesson.practice;
    const total = authored.length + (practice ? practice.count : 0);
    root.innerHTML = `
      <div class="lesson-top">
        <button class="text-button" type="button" data-back>&larr; Tutte le lezioni</button>
        <span class="grade-pill grade-${lesson.grade}">Grado ${lesson.grade}</span>
      </div>
      <h2 class="lesson-title">${esc(lesson.title)}</h2>
      ${p.completed ? `<p class="lesson-done-note"><svg viewBox="0 0 24 24"><use href="#i-check"/></svg> Lezione completata</p>` : ""}
      <details class="lesson-details"${screen.stage === "exercise" ? "" : " open"}>
        <summary>Spiegazione del coach</summary>
        <div class="lesson-teacher">
          <img src="${esc(mentor.image)}" alt="" width="40" height="40">
          <div class="lesson-theory">${lesson.theory.map((para) => `<p>${esc(para)}</p>`).join("")}</div>
        </div>
      </details>
      <div class="key-points">
        <strong>Da ricordare</strong>
        <ul>${lesson.keyPoints.map((point) => `<li>${esc(point)}</li>`).join("")}</ul>
      </div>
      ${lesson.example ? `
      <section class="example-box${screen.stage === "exercise" ? " is-collapsed" : ""}">
        <div class="example-head"><strong>Esempio guidato</strong><span id="exampleCounter"></span></div>
        <p id="exampleText" class="example-text"></p>
        <div class="example-nav">
          <button class="ghost-action" id="examplePrev" type="button">Indietro</button>
          <button class="primary-action" id="exampleNext" type="button">Avanti</button>
          <button class="text-button" id="exampleReplay" type="button">Rivedi l'esempio</button>
        </div>
      </section>` : ""}
      <section class="exercise-box" id="exerciseBox">
        <div class="example-head"><strong>Esercizi</strong><span>${total} esercizi${practice ? ` · ne servono ${practice.pass} al primo tentativo` : ""}</span></div>
        <div class="exercise-dots" id="exerciseDots"></div>
        <p class="trainer-feedback" id="trainerFeedback" data-tone="info">${screen.stage === "exercise" ? "" : "Quando hai capito l'idea, prova tu."}</p>
        <div class="exercise-actions" id="exerciseActions"></div>
      </section>`;
    root.querySelector("[data-back]").addEventListener("click", () => go({ name: "home" }));
    if (lesson.example) {
      el("examplePrev").addEventListener("click", () => {
        if (!trainer.example) trainer.showExample(lesson.example);
        trainer.exampleStep(-1);
      });
      el("exampleNext").addEventListener("click", () => {
        if (!trainer.example) {
          screen.stage = "theory";
          trainer.showExample(lesson.example);
          render();
        }
        trainer.exampleStep(1);
      });
      el("exampleReplay").addEventListener("click", () => {
        screen.stage = "theory";
        session = null;
        trainer.showExample(lesson.example);
        render();
        renderBoard({ animate: false });
      });
      if (trainer.example) trainer.renderExample(false);
    }
    renderExerciseDots();
    renderExerciseButtons(trainer.active && trainer.active.finished);
    renderChrome();
  }

  function renderExerciseDots() {
    const box = el("exerciseDots");
    if (!box) return;
    if (!session) {
      box.innerHTML = "";
      return;
    }
    box.innerHTML = session.queue.map((ex, i) => {
      const r = session.results[i];
      const cls = r ? (r.solved ? "good" : "bad") : i === session.index ? "current" : "";
      return `<span class="ex-dot ${cls}" title="Esercizio ${i + 1}"></span>`;
    }).join("");
  }

  function renderExerciseButtons(finished = false) {
    const box = el("exerciseActions");
    if (!box) return;
    const inExercise = trainer && trainer.active;
    let html = "";
    if (screen.name === "weakness" && !session) {
      html = `<button class="primary-action" type="button" data-act="weak-start">Inizia 6 esercizi</button>`;
    } else if (screen.name === "weakness" && session && session.done) {
      html = `<button class="primary-action" type="button" data-act="weak-start">Altri 6 esercizi</button><button class="ghost-action" type="button" data-act="home">Torna alle lezioni</button>`;
    } else if (screen.name === "lesson" && !session) {
      html = `<button class="primary-action" type="button" data-act="start">Inizia gli esercizi</button>`;
    } else if (screen.name === "lesson" && session && session.done) {
      html = `<button class="primary-action" type="button" data-act="restart">Nuovi esercizi</button><button class="ghost-action" type="button" data-act="home">Torna alle lezioni</button>`;
    } else if (inExercise && !finished) {
      html = `<button class="ghost-action" type="button" data-act="hint">Suggerimento</button><button class="ghost-action" type="button" data-act="solution">Soluzione</button>`;
    } else if (inExercise && finished) {
      html = `<button class="primary-action" type="button" data-act="next">${screen.name === "game" ? "Prossimo errore" : "Prossimo"}</button><button class="ghost-action" type="button" data-act="retry">Riprova</button>`;
    }
    box.innerHTML = html;
    box.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => exerciseAction(b.dataset.act)));
  }

  function exerciseAction(act) {
    if (act === "hint") trainer.hint();
    else if (act === "solution") trainer.showSolution();
    else if (act === "retry") {
      trainer.retry();
      renderExerciseButtons(false);
    } else if (act === "next") nextExercise();
    else if (act === "start" || act === "restart") startLessonExercises();
    else if (act === "weak-start") startWeaknessTraining();
    else if (act === "home") go({ name: "home" });
  }

  async function startLessonExercises() {
    const lesson = screen.lesson;
    const startedOn = screen;
    const p = lessonProgress(lesson.id);
    p.attempts += 1;
    saveState();
    const queue = (lesson.exercises || []).map((ex, i) => ({ ...ex, id: `${lesson.id}-${i}`, source: "lesson" }));
    if (lesson.practice) {
      setFeedback("Preparo gli esercizi...", "info");
      try {
        const all = await loadPuzzles();
        const pool = L.filterPuzzles(all, lesson.practice);
        const seen = window.chessRatingProfile().puzzle.seen || {};
        const fresh = pool.filter((pz) => !(pz.id in seen));
        const source = fresh.length >= lesson.practice.count ? fresh : pool;
        seededShuffle(source, `${lesson.id}-${p.attempts}`).slice(0, lesson.practice.count).forEach((pz) => queue.push(puzzleExercise(pz)));
      } catch (error) {
        setFeedback("Esercizi non disponibili: apri il sito da http://localhost:8765 (serve il server locale).", "bad");
      }
    }
    if (!queue.length || screen !== startedOn) return;
    session = { kind: "lesson", lesson, queue, index: 0, results: [], done: false };
    screen.stage = "exercise";
    render();
    trainer.start(queue[0]);
    renderExerciseDots();
    showBoardOnMobile();
  }

  function nextExercise() {
    if (screen.name === "puzzle") return nextPuzzle();
    if (screen.name === "game") return nextGameExercise();
    if (!session) return;
    session.index += 1;
    if (session.index >= session.queue.length) return session.kind === "weakness" ? finishWeaknessSession() : finishLessonSession();
    trainer.start(session.queue[session.index]);
    renderExerciseDots();
    renderExerciseButtons(false);
  }

  function finishLessonSession() {
    const lesson = session.lesson;
    const p = lessonProgress(lesson.id);
    const results = session.results.filter(Boolean);
    const practiceResults = results.filter((r) => r.source === "puzzle");
    const authoredResults = results.filter((r) => r.source === "lesson");
    const firstTry = practiceResults.filter((r) => r.solved).length;
    const completed = lesson.practice
      ? firstTry >= lesson.practice.pass
      : authoredResults.length > 0 && authoredResults.every((r) => r.completedLine);
    p.best = Math.max(p.best || 0, lesson.practice ? firstTry : authoredResults.filter((r) => r.completedLine).length);
    const wasCompleted = p.completed;
    if (completed) {
      p.completed = true;
      p.completedAt = p.completedAt || new Date().toISOString();
    }
    session.done = true;
    saveState();
    const msg = completed
      ? `Lezione completata${wasCompleted ? " di nuovo" : ""}! ${lesson.practice ? `Hai risolto ${firstTry} esercizi su ${practiceResults.length} al primo tentativo.` : ""}`
      : `Hai risolto ${firstTry} esercizi su ${practiceResults.length} al primo tentativo: ne servono ${lesson.practice.pass}. Rileggi i punti chiave e riprova con esercizi nuovi.`;
    setFeedback(msg, completed ? "good" : "bad");
    renderExerciseDots();
    renderExerciseButtons(true);
    window.renderChessGradeChip && window.renderChessGradeChip();
    window.renderChessMentor && window.renderChessMentor();
    if (typeof renderDashboard === "function") renderDashboard();
  }

  /* ------------------------------------------------ allenamento tattico */

  async function startPuzzleTraining() {
    ensureTrainer();
    screen = { name: "puzzle", streak: 0, done: 0 };
    session = null;
    render();
    setFeedback("Carico gli esercizi...", "info");
    try {
      await loadPuzzles();
    } catch (error) {
      setFeedback("Esercizi non disponibili: apri il sito da http://localhost:8765 (serve il server locale).", "bad");
      return;
    }
    nextPuzzle();
  }

  function pickPuzzle() {
    const profile = window.chessRatingProfile();
    const target = profile.puzzle.rating;
    const seen = profile.puzzle.seen || {};
    let width = 120;
    let pool = [];
    while (!pool.length && width < 2000) {
      pool = puzzles.filter((pz) => Math.abs(pz.rating - target) <= width && !(pz.id in seen));
      width *= 1.6;
    }
    if (!pool.length) pool = puzzles;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function nextPuzzle() {
    if (!puzzles) return;
    const puzzle = pickPuzzle();
    screen.current = puzzle;
    trainer.start(puzzleExercise(puzzle));
    render();
    showBoardOnMobile();
  }

  function renderPuzzleScreen(root) {
    const profile = window.chessRatingProfile();
    const recent = profile.puzzle.history.slice(-12);
    const solvedPct = profile.puzzle.count ? Math.round((profile.puzzle.solved / profile.puzzle.count) * 100) : 0;
    root.innerHTML = `
      <div class="lesson-top">
        <button class="text-button" type="button" data-back>&larr; Lezioni</button>
        <span class="grade-pill">Tattica</span>
      </div>
      <h2 class="lesson-title">Allenamento tattico</h2>
      <div class="puzzle-stats">
        <div><span>Rating esercizi</span><strong>${profile.puzzle.rating}</strong><small>&plusmn;${profile.puzzle.rd}</small></div>
        <div><span>Fatti</span><strong>${profile.puzzle.count}</strong><small>${solvedPct}% al primo tentativo</small></div>
        <div><span>Ultimi</span><strong class="puzzle-trend">${recent.map((h) => `<i class="${h.change >= 0 ? "up" : "down"}"></i>`).join("") || "--"}</strong><small>verde = risolto</small></div>
      </div>
      <p class="learn-note">Esercizi dal database pubblico di Lichess. Conta solo il primo tentativo: suggerimenti e soluzione valgono come errore.</p>
      <section class="exercise-box">
        <p class="trainer-feedback" id="trainerFeedback" data-tone="info"></p>
        <div class="exercise-actions" id="exerciseActions"></div>
      </section>`;
    root.querySelector("[data-back]").addEventListener("click", () => go({ name: "home" }));
    if (trainer.active) {
      const desc = trainer.describe();
      setFeedback(desc.finished ? (el("trainerFeedback").textContent || "") : `Tocca al ${desc.colorName}: trova la mossa migliore.`, "info");
      renderExerciseButtons(desc.finished);
    }
    renderChrome();
  }

  /* ------------------------------------------------ errori delle partite */

  function startGameExercise(exercise, returnTo = null) {
    ensureTrainer();
    if (trainer) trainer.stop();
    screen = { name: "game", exercise, returnTo };
    session = null;
    render();
    trainer.start({ ...exercise, source: "game" });
    renderBoard({ animate: false });
    showBoardOnMobile();
  }

  function nextGameExercise() {
    const returnTo = screen.returnTo;
    const all = state.chess.mistakeBank || [];
    // Dal reparto errori si resta nella stessa categoria.
    const bank = returnTo && returnTo.name === "weakness" ? all.filter((item) => bankCategory(item) === returnTo.category) : all;
    if (!bank.length) return go(returnTo || { name: "home" });
    const currentId = screen.exercise && screen.exercise.id;
    const index = bank.findIndex((item) => item.exercise.id === currentId);
    const next = bank[(index + 1 + bank.length) % bank.length] || bank[0];
    startGameExercise(next.exercise, returnTo);
  }

  function renderGameScreen(root) {
    const ex = screen.exercise;
    root.innerHTML = `
      <div class="lesson-top">
        <button class="text-button" type="button" data-back>&larr; ${screen.returnTo ? "Reparto errori" : "Lezioni"}</button>
        <span class="grade-pill">Dalle tue partite</span>
      </div>
      <h2 class="lesson-title">Rigioca il momento critico</h2>
      <p class="learn-note">${esc(ex.prompt || "Trova la mossa migliore.")}</p>
      <section class="exercise-box">
        <p class="trainer-feedback" id="trainerFeedback" data-tone="info"></p>
        <div class="exercise-actions" id="exerciseActions"></div>
      </section>`;
    root.querySelector("[data-back]").addEventListener("click", () => go(screen.returnTo || { name: "home" }));
    renderExerciseButtons(trainer.active && trainer.active.finished);
    renderChrome();
  }

  // Salva gli errori della partita revisionata come esercizi.
  window.addMistakesToBank = function addMistakesToBank(moves, gameId) {
    if (!Array.isArray(moves)) return;
    const bank = Array.isArray(state.chess.mistakeBank) ? state.chess.mistakeBank : [];
    moves.forEach((move, index) => {
      if (!move || move.side !== "Bianco" || !["mistake", "blunder", "missed"].includes(move.quality) || !move.bestMoveUci || !move.fenBefore) return;
      const id = `game-${gameId}-${index}`;
      if (bank.some((item) => item.exercise.id === id)) return;
      const S = window.ChessSkills;
      const category = move.pattern && S && S.PATTERN_CATEGORY[move.pattern]
        ? S.PATTERN_CATEGORY[move.pattern]
        : move.quality === "missed" ? "threatVision" : move.quality === "blunder" ? "concentration" : "calculation";
      bank.push({
        category,
        pattern: move.pattern || null,
        title: `Mossa ${move.moveNumber}: ${move.classification || "errore"}`,
        subtitle: `Hai giocato ${ChessAnalysis.figurine(move.san)}${move.pattern && typeof mistakeLabels !== "undefined" ? ` · ${mistakeLabels[move.pattern]}` : ""}`,
        date: new Date().toISOString(),
        exercise: {
          id,
          fen: move.fenBefore,
          solution: [move.bestMoveUci],
          prompt: `Mossa ${move.moveNumber} di una tua partita: qui hai giocato ${ChessAnalysis.figurine(move.san)} (${(move.classification || "errore").toLowerCase()}). Trova la mossa migliore.`,
          explanation: move.comment || "",
          source: "game"
        }
      });
    });
    state.chess.mistakeBank = bank.slice(-40);
  };

  window.ChessLearn = {
    onShow,
    ownsBoard,
    renderChrome,
    nav,
    startGameExercise,
    openLesson,
    get trainer() {
      return ensureTrainer();
    }
  };
})();
