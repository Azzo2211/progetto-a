/*
 * Progetto A - Cultura: la mini università (scheda "Università" della pagina Cultura).
 *
 * Corsi veri di MIT, Yale, Harvard... spiegati in italiano: lezione originale (link), spiegazione,
 * punti chiave, glossario, verifica, "spiegalo tu", ripasso distanziato, esame finale in trentesimi
 * e libretto. Dati: window.CultureUniversity (culture/university.js, caricato solo quando si apre la
 * scheda: sono molti testi e non servono alle altre pagine). Motore: window.UniEngine.
 * Usa le globali di app.js: state, saveState, renderDashboard.
 */
(function () {
  "use strict";

  const U = window.UniEngine;
  if (!U) return;
  const ORDER = Object.keys(U.FACULTIES);
  const VER = ((document.currentScript && /[?&]v=([^&]+)/.exec(document.currentScript.src)) || [])[1] || "";
  let COURSES = [];
  let byId = new Map();
  const lessonIndex = new Map();
  let loading = null; // "loading" | "error" | null
  function initData() {
    const data = window.CultureUniversity || { courses: [] };
    COURSES = (data.courses || []).slice().sort((a, b) => ORDER.indexOf(a.faculty) - ORDER.indexOf(b.faculty));
    byId = new Map(COURSES.map((c) => [c.id, c]));
    lessonIndex.clear();
    COURSES.forEach((c) => c.lessons.forEach((l, i) => lessonIndex.set(l.id, { course: c, lesson: l, index: i })));
  }
  // i corsi si caricano la prima volta che si apre la scheda
  function loadData(done) {
    if (window.CultureUniversity) { initData(); done(); return; }
    if (loading === "loading") return;
    loading = "loading";
    const sc = document.createElement("script");
    sc.src = `culture/university.js${VER ? `?v=${VER}` : ""}`;
    sc.onload = () => { loading = null; initData(); done(); };
    sc.onerror = () => { loading = "error"; sc.remove(); done(); };
    document.head.appendChild(sc);
  }

  const ui = { view: "home", courseId: null, lessonId: null, step: "read", quiz: null, exam: null, review: null, at: 0 };
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const prose = (t) => esc(String(t == null ? "" : t).replace(/"([^"]*)"/g, "“$1”").replace(/([A-Za-zÀ-ÿ])'([A-Za-zÀ-ÿ0-9])/g, "$1’$2"));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const LETTERS = ["A", "B", "C", "D"];
  const fac = (c) => U.FACULTIES[c.faculty] || { label: c.faculty, color: "#1f7a6d" };
  const dateIt = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const shortDate = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const ext = (url, label, cls = "") => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}<span class="cult-sr"> (si apre in una nuova scheda)</span></a>`;

  function uni() {
    state.cultureUni = U.ensure(state.cultureUni);
    return state.cultureUni;
  }
  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
  }
  function announce(text) {
    const live = $("cultLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }
  function dueText(t) {
    const days = Math.round((U.addDays(t, 0) - U.addDays(Date.now(), 0)) / 86400000);
    return days <= 0 ? "oggi" : days === 1 ? "domani" : `tra ${days} giorni`;
  }

  /* ------------------------------------------------------------ home */
  function homeView() {
    const u = uni();
    const st = U.stats(u, COURSES);
    const due = U.dueLessons(u, COURSES);
    const sug = U.suggest(u, COURSES);
    const lib = U.libretto(u, COURSES);
    const cards = COURSES.map((c) => {
      const p = U.courseProgress(u, c);
      const f = fac(c);
      return `
        <button type="button" class="uni-course" style="--area:${f.color}" data-uni="course" data-id="${esc(c.id)}">
          <span class="cult-card-area"><span class="cult-dot"></span>${esc(f.label)} · ${esc(U.LEVELS[c.level] || "")}</span>
          <strong class="cult-card-title">${esc(c.title)}</strong>
          <span class="uni-src">${esc(c.source.inst)} ${esc(c.source.code)} · ${esc(c.source.prof)}</span>
          <span class="uni-bar" aria-hidden="true"><i style="width:${p.pct}%"></i></span>
          <span class="cult-card-foot">${p.done}/${p.total} lezioni${p.exam && p.exam.passed ? ` · esame ${esc(U.voteLabel(p.exam))}` : p.examOpen ? " · esame da dare" : ""}</span>
        </button>`;
    }).join("");
    const hero = due.length
      ? `<div class="cult-hero due"><div><span class="cult-kicker">Ripasso dell'università</span><h2>${plural(due.length, "lezione da ripassare", "lezioni da ripassare")}</h2><p>Due domande per lezione: se rispondi giusto il prossimo ripasso si allontana, se sbagli torna presto.</p></div><button class="primary-action" type="button" data-uni="review" data-autofocus>Ripassa adesso</button></div>`
      : sug ? `<div class="cult-hero" style="--area:${fac(sug.c).color}"><div><span class="cult-kicker">${sug.p.started ? "Continua da qui" : "Per cominciare"}</span><h2>${esc(sug.c.title)}${sug.p.next ? `: ${esc(sug.p.next.title)}` : ""}</h2><p>${esc(sug.c.source.inst)} · ${esc(sug.c.source.prof)}. ${sug.p.started ? `Lezione ${sug.p.done + 1} di ${sug.p.total}.` : prose(sug.c.summary)}</p></div><button class="primary-action" type="button" data-uni="${sug.p.next ? "lesson" : "course"}" data-id="${esc(sug.p.next ? sug.p.next.id : sug.c.id)}">${sug.p.started ? "Riprendi" : "Inizia il corso"}</button></div>` : "";
    return `
      <div class="uni">
        <div class="uni-intro">
          <h2 data-focus>La tua università</h2>
          <p>${COURSES.length} corsi veri di università come MIT, Yale e Harvard, scelti tra quelli gratuiti con video e appunti. Per ogni lezione: il link alla lezione originale (in inglese), la spiegazione in italiano, i punti chiave, la verifica e lo "spiegalo con parole tue". Finite le lezioni dai l'esame: voto in trentesimi, sul libretto.</p>
        </div>
        ${hero}
        <ul class="uni-stats">
          <li><strong>${st.done}</strong><span>lezioni fatte su ${st.lessons}</span></li>
          <li><strong>${st.exams}</strong><span>${st.exams === 1 ? "esame superato" : "esami superati"}</span></li>
          <li><strong>${st.avg == null ? "—" : String(st.avg).replace(".", ",")}</strong><span>media dei voti</span></li>
          <li><strong>${st.cfu}</strong><span>crediti (CFU)</span></li>
          <li><strong>${st.streak}</strong><span>${st.streak === 1 ? "giorno di studio di fila" : "giorni di studio di fila"}</span></li>
        </ul>
        <h3 class="uni-h3">I corsi</h3>
        <div class="cult-grid uni-grid">${cards}</div>
        ${libView(lib)}
      </div>`;
  }

  function libView(lib) {
    if (!lib.rows.length) return `<section class="uni-lib"><h3 class="uni-h3">Libretto</h3><p class="cult-small">Ancora nessun esame. Finisci le lezioni di un corso e dai l'esame: qui compaiono voto, data e crediti.</p></section>`;
    return `<section class="uni-lib"><h3 class="uni-h3">Libretto</h3>
      <div class="uni-table-wrap"><table class="uni-table"><thead><tr><th scope="col">Esame</th><th scope="col">Data</th><th scope="col">Voto</th><th scope="col">CFU</th></tr></thead><tbody>
      ${lib.rows.map((r) => `<tr><th scope="row">${esc(r.course.title)}<em>${esc(r.course.source.inst)} ${esc(r.course.source.code)}</em></th><td>${dateIt(r.exam.t)}</td><td><strong>${esc(U.voteLabel(r.exam))}</strong></td><td>${U.CFU}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="cult-small">Media ${String(lib.avg).replace(".", ",")}/30 su ${plural(lib.rows.length, "esame", "esami")} · ${lib.cfu} crediti. In centodecimi: ${lib.base110}/110 (solo per curiosità: è un'università tua).</p>
    </section>`;
  }

  /* ------------------------------------------------------------ corso */
  function courseView(c) {
    const u = uni();
    const p = U.courseProgress(u, c);
    const f = fac(c);
    const s = c.source;
    const rows = c.lessons.map((l, i) => {
      const st = U.lessonState(u, l.id);
      const status = st.done ? `fatta · ${st.best}%${st.due ? ` · ripasso ${dueText(st.due)}` : ""}` : st.tries ? `da rifare · ${st.best}%` : "da fare";
      return `<li class="${st.done ? "done" : ""}"><span class="uni-num">${st.done ? "✓" : i + 1}</span><div><strong>${esc(l.title)}</strong><span>${status} · ${l.minutes} min di lettura</span></div><button type="button" class="ghost-action small" data-uni="lesson" data-id="${esc(l.id)}">${st.done ? "Rivedi" : "Studia"}<span class="cult-sr">: ${esc(l.title)}</span></button></li>`;
    }).join("");
    const ex = p.exam;
    return `
      <div class="uni" style="--area:${f.color}">
        <div class="cult-read-bar"><button class="ghost-action small" type="button" data-uni="home">← Tutti i corsi</button><span class="cult-meta"><span class="cult-dot"></span>${esc(f.label)} · ${esc(U.LEVELS[c.level] || "")}</span></div>
        <div class="uni-course-layout">
          <article class="cult-article uni-course-head">
            <span class="cult-kicker">${esc(s.inst)} · ${esc(s.code)}</span>
            <h2 data-focus tabindex="-1">${esc(c.title)}</h2>
            <p class="cult-lead">${prose(c.summary)}</p>
            <div class="uni-progress"><span class="uni-bar"><i style="width:${p.pct}%"></i></span><span>${p.done} di ${p.total} lezioni</span></div>
            <div class="cult-actions">${p.next ? `<button class="primary-action" type="button" data-uni="lesson" data-id="${esc(p.next.id)}">${p.done ? `Continua: lezione ${p.done + 1}` : "Inizia dalla lezione 1"}</button>` : ""}</div>
            <h3>Le lezioni</h3>
            <ol class="uni-lessons">${rows}</ol>
          </article>
          <aside class="cult-aside">
            <div class="cult-facts uni-source">
              <h3>Il corso originale</h3>
              <p><strong>${esc(s.title)}</strong></p>
              <p>${esc(s.prof)} · ${esc(s.year)}</p>
              <p>${esc(s.inst)} ${esc(s.code)} · ${esc(s.lang)}</p>
              <p class="cult-small">Licenza: ${esc(s.license)}. Le spiegazioni in italiano sono riassunti nostri, non traduzioni.</p>
              ${ext(s.url, "Apri la pagina del corso", "uni-link")}
            </div>
            ${c.extra && c.extra.length ? `<div class="cult-facts"><h3>Per approfondire</h3><ul class="uni-extra">${c.extra.map((x) => `<li>${ext(x.url, esc(x.title))}<span>${esc(x.what)}</span></li>`).join("")}</ul></div>` : ""}
            <div class="cult-facts uni-exam-box">
              <h3>Esame finale</h3>
              ${ex ? `<p class="uni-vote ${ex.passed ? "ok" : "ko"}">${esc(U.voteLabel(ex))}</p><p class="cult-small">Miglior risultato: ${ex.pct}% il ${dateIt(ex.t)} · ${plural(ex.attempts, "tentativo", "tentativi")}.</p>` : ""}
              <p class="cult-small">${U.EXAM_SIZE} domande da tutte le lezioni, senza aiuti. Si passa con il 60% (18/30); tutto giusto è 30 e lode. Puoi ripeterlo: resta il voto migliore.</p>
              <button class="${p.examOpen ? "primary-action" : "ghost-action"}" type="button" data-uni="exam" data-id="${esc(c.id)}" ${p.examOpen ? "" : "disabled"}>${ex ? "Ridai l'esame" : "Dai l'esame"}</button>
              ${p.examOpen ? "" : `<p class="cult-small">Si sblocca quando hai superato tutte le lezioni (${p.done}/${p.total}).</p>`}
            </div>
          </aside>
        </div>
      </div>`;
  }

  /* ------------------------------------------------------------ lezione */
  function lessonView() {
    const it = lessonIndex.get(ui.lessonId);
    if (!it) { ui.view = "home"; return homeView(); }
    const { course: c, lesson: l, index } = it;
    const f = fac(c);
    const bar = `<div class="cult-read-bar"><button class="ghost-action small" type="button" data-uni="course" data-id="${esc(c.id)}">← ${esc(c.title)}</button><span class="cult-meta"><span class="cult-dot"></span>Lezione ${index + 1} di ${c.lessons.length} · ${l.minutes} min</span></div>`;
    let body = "";
    if (ui.step === "read") body = readHtml(c, l, index);
    else if (ui.step === "quiz") body = quizHtml(l);
    else if (ui.step === "explain") body = explainHtml(l);
    else body = doneHtml(c, l, index);
    return `<div class="uni cult-read" style="--area:${f.color}">${bar}${body}</div>`;
  }

  function readHtml(c, l) {
    const st = U.lessonState(uni(), l.id);
    return `
      <div class="cult-read-layout">
        <article class="cult-article">
          <h2 data-focus tabindex="-1">${esc(l.title)}</h2>
          <div class="uni-watch">
            <span class="cult-kicker">La lezione originale</span>
            ${ext(l.watch.url, `<span class="uni-play" aria-hidden="true"></span>${esc(l.watch.label)}`, "uni-watch-link")}
            ${l.read && l.read.length ? `<ul>${l.read.map((r) => `<li>${ext(r.url, esc(r.label))}</li>`).join("")}</ul>` : ""}
            <p class="cult-small">${esc(c.source.inst)} · ${esc(c.source.prof)} · ${esc(c.source.lang)}. Puoi guardarla prima o dopo la spiegazione.</p>
          </div>
          ${l.sections.map((s) => `<section><h3>${esc(s.h)}</h3>${String(s.text).split(/\n\s*\n/).map((p) => `<p>${prose(p)}</p>`).join("")}</section>`).join("")}
          <div class="cult-actions"><button class="primary-action" type="button" data-uni="quiz">${st.done ? "Rifai la verifica" : `Verifica: ${l.quiz.length} domande`}</button></div>
        </article>
        <aside class="cult-aside">
          <div class="cult-facts"><h3>Punti chiave</h3><ul>${l.keyPoints.map((k) => `<li>${prose(k)}</li>`).join("")}</ul></div>
          <div class="cult-facts uni-terms"><h3>Glossario</h3><dl>${l.terms.map((t) => `<div><dt>${esc(t.t)}</dt><dd>${prose(t.d)}</dd></div>`).join("")}</dl></div>
        </aside>
      </div>`;
  }

  function optionsHtml(q, order, picked, act, reveal = true) {
    return order.map((index, pos) => {
      let cls = "";
      if (picked !== null && reveal) cls = index === q.answer ? " right" : index === picked ? " wrong" : " dim";
      else if (picked !== null) cls = index === picked ? " right" : " dim";
      const mark = picked === null || !reveal ? "" : index === q.answer ? `<span class="cult-mark" aria-label="risposta corretta">✓</span>` : index === picked ? `<span class="cult-mark" aria-label="la tua risposta, sbagliata">✗</span>` : "";
      return `<button type="button" class="cult-option${cls}" data-uni="${act}" data-index="${index}" ${picked !== null ? "disabled" : ""}><span class="cult-option-key">${LETTERS[pos]}</span><span>${prose(q.options[index])}</span>${mark}</button>`;
    }).join("");
  }

  function quizHtml(l) {
    const r = ui.quiz;
    const q = l.quiz[r.qi];
    const last = r.qi === l.quiz.length - 1;
    return `
      <article class="cult-quiz">
        <div class="cult-quiz-head"><span class="cult-kicker">Domanda ${r.qi + 1} di ${l.quiz.length}</span><span class="cult-type">${esc(l.title)}</span></div>
        <div class="cult-steps">${l.quiz.map((_, i) => `<i class="${i < r.answers.length ? (r.answers[i] ? "ok" : "ko") : i === r.qi ? "now" : ""}"></i>`).join("")}</div>
        <h3 class="cult-question" tabindex="-1" ${r.picked === null ? "data-autofocus" : ""}>${prose(q.q)}</h3>
        <div class="cult-options" role="group" aria-label="Risposte">${optionsHtml(q, r.order[r.qi], r.picked, "answer")}</div>
        ${r.picked !== null ? `
        <div class="cult-feedback ${r.picked === q.answer ? "ok" : "ko"}">
          <strong>${r.picked === q.answer ? "Esatto." : "Non è questa."}</strong>
          <p>${prose(q.why)}</p>
          <div class="cult-actions"><button class="primary-action" type="button" data-uni="next-q" data-autofocus>${last ? "Spiegalo con parole tue" : "Domanda successiva"}</button></div>
        </div>` : `<p class="cult-hint">Tasti 1–4 o A–D per rispondere.</p>`}
      </article>`;
  }

  function explainHtml(l) {
    const r = ui.quiz;
    return `
      <article class="cult-explain">
        <span class="cult-kicker">Spiegalo con parole tue</span>
        <h3 class="cult-question" id="uniExplainPrompt">${prose(l.explain)}</h3>
        <p class="cult-small">Scrivere la spiegazione è il modo più efficace per fissare un concetto. Resta salvata con la lezione.</p>
        <textarea id="uniExplainInput" rows="6" aria-labelledby="uniExplainPrompt" placeholder="Tre o quattro frasi bastano." ${r.compared ? "readonly" : "data-autofocus"}>${esc(r.note)}</textarea>
        ${r.compared ? `
          <div class="cult-model"><h4>Una buona spiegazione tocca questi punti</h4><ul>${l.keyPoints.map((k) => `<li>${prose(k)}</li>`).join("")}</ul></div>
          ${l.apply ? `<div class="cult-model"><span>Da provare nella vita reale</span><p>${prose(l.apply)}</p></div>` : ""}
          <div class="cult-actions"><button class="primary-action" type="button" data-uni="finish" data-autofocus>Finisci la lezione</button></div>`
        : `<div class="cult-actions"><button class="primary-action" type="button" data-uni="compare">Confronta con i punti chiave</button><button class="ghost-action" type="button" data-uni="finish">Salta</button></div>`}
      </article>`;
  }

  function doneHtml(c, l, index) {
    const r = ui.quiz.result;
    const correct = ui.quiz.answers.filter(Boolean).length;
    const next = c.lessons[index + 1];
    const p = U.courseProgress(uni(), c);
    return `
      <article class="cult-done">
        <div class="cult-done-score"><strong>${correct}/${l.quiz.length}</strong><span>${r.passed ? "superata" : "da rifare"}</span></div>
        <div>
          <h2 data-focus tabindex="-1">${r.passed ? (r.first ? "Lezione superata" : "Verifica rifatta") : "Quasi: ripassa e riprova"}</h2>
          <p>${r.passed ? (r.first ? `Entra nel ripasso: la rivedrai ${dueText(r.due)}, con due domande.` : `Il tuo miglior risultato su questa lezione è ${U.lessonState(uni(), l.id).best}%.`) : `Serve almeno il ${Math.round(U.PASS * 100)}% delle risposte giuste. Rileggi le sezioni su cui hai sbagliato e rifai la verifica.`}</p>
          ${p.examOpen && r.first ? `<p><strong>Hai finito tutte le lezioni del corso: puoi dare l'esame.</strong></p>` : ""}
          <div class="cult-actions">
            ${!r.passed ? `<button class="primary-action" type="button" data-uni="lesson" data-id="${esc(l.id)}" data-autofocus>Rileggi la lezione</button>` : next ? `<button class="primary-action" type="button" data-uni="lesson" data-id="${esc(next.id)}" data-autofocus>Lezione ${index + 2}: ${esc(next.title)}</button>` : p.examOpen ? `<button class="primary-action" type="button" data-uni="exam" data-id="${esc(c.id)}" data-autofocus>Vai all'esame</button>` : ""}
            <button class="ghost-action" type="button" data-uni="course" data-id="${esc(c.id)}">Torna al corso</button>
          </div>
        </div>
      </article>`;
  }

  /* ------------------------------------------------------------ esame */
  function examView() {
    const c = byId.get(ui.courseId);
    const e = ui.exam;
    const f = fac(c);
    const bar = `<div class="cult-read-bar"><button class="ghost-action small" type="button" data-uni="course" data-id="${esc(c.id)}">← ${esc(c.title)}</button><span class="cult-meta"><span class="cult-dot"></span>Esame finale</span></div>`;
    if (e.done) {
      const g = e.grade;
      const wrong = e.questions.map((q, i) => ({ q, a: e.answers[i] })).filter((x) => x.a !== x.q.answer);
      return `<div class="uni cult-read" style="--area:${f.color}">${bar}
        <article class="cult-done">
          <div class="cult-done-score"><strong>${g.passed ? (g.lode ? "30L" : g.vote) : "—"}</strong><span>${g.passed ? "su 30" : "non superato"}</span></div>
          <div>
            <h2 data-focus tabindex="-1">${g.passed ? `Esame superato: ${esc(U.voteLabel(g))}` : "Esame non superato"}</h2>
            <p>${e.correct} risposte giuste su ${e.questions.length} (${g.pct}%). ${g.passed ? "Il voto è sul libretto." : `Serve il ${Math.round(U.PASS * 100)}%: ripassa le lezioni delle domande sbagliate e riprova.`}${e.result.best && e.result.best.passed && (!g.passed || e.result.best.vote > g.vote) ? ` Sul libretto resta il voto migliore: ${esc(U.voteLabel(e.result.best))}.` : ""}</p>
            <div class="cult-actions"><button class="primary-action" type="button" data-uni="course" data-id="${esc(c.id)}" data-autofocus>Torna al corso</button><button class="ghost-action" type="button" data-uni="home">Libretto</button></div>
          </div>
        </article>
        ${wrong.length ? `<section class="cult-quiz uni-fix"><h3>Le risposte da correggere</h3><ol>${wrong.map((x) => `<li><strong>${prose(x.q.q)}</strong><span>Hai risposto: ${prose(x.q.options[x.a])}</span><span class="ok">Giusta: ${prose(x.q.options[x.q.answer])}</span><p>${prose(x.q.why)}</p><em>Dalla lezione: ${esc(x.q.lessonTitle)}</em></li>`).join("")}</ol></section>` : ""}
      </div>`;
    }
    if (!e.started) {
      return `<div class="uni cult-read" style="--area:${f.color}">${bar}
        <article class="cult-review-empty">
          <span class="cult-kicker">${esc(c.source.inst)} · ${esc(c.source.code)}</span>
          <h2 data-focus tabindex="-1">Esame: ${esc(c.title)}</h2>
          <p>${e.questions.length} domande prese da tutte le lezioni, in ordine casuale. Nessuna spiegazione durante l'esame: le correzioni arrivano alla fine. Si passa con il 60% (18/30); tutto giusto vale 30 e lode.</p>
          <div class="cult-actions"><button class="primary-action" type="button" data-uni="exam-start" data-autofocus>Comincia</button><button class="ghost-action" type="button" data-uni="course" data-id="${esc(c.id)}">Non adesso</button></div>
        </article></div>`;
    }
    const q = e.questions[e.qi];
    return `<div class="uni cult-read" style="--area:${f.color}">${bar}
      <article class="cult-quiz">
        <div class="cult-quiz-head"><span class="cult-kicker">Domanda ${e.qi + 1} di ${e.questions.length}</span><span class="cult-type">Esame</span></div>
        <div class="cult-steps">${e.questions.map((_, i) => `<i class="${i < e.answers.length ? "ok" : i === e.qi ? "now" : ""}"></i>`).join("")}</div>
        <h3 class="cult-question" tabindex="-1" data-autofocus>${prose(q.q)}</h3>
        <div class="cult-options" role="group" aria-label="Risposte">${optionsHtml(q, q.order, null, "exam-answer")}</div>
        <p class="cult-hint">Tasti 1–4 o A–D per rispondere. La risposta non si può cambiare.</p>
      </article></div>`;
  }

  /* ------------------------------------------------------------ ripasso */
  function reviewView() {
    const r = ui.review;
    if (!r.queue.length || r.idx >= r.queue.length) {
      return `<div class="uni"><article class="cult-review-empty"><span class="cult-kicker">Ripasso dell'università</span><h2 data-focus tabindex="-1">${r.queue.length ? "Ripasso finito" : "Niente da ripassare oggi"}</h2>
        ${r.results.length ? `<ul class="cult-review-list">${r.results.map((x) => `<li><span class="cult-dot" style="--area:${fac(x.course).color}"></span><span>${esc(x.lesson.title)}</span><b class="${x.ok ? "ok" : "ko"}">${x.ok ? "giusto" : "da rivedere"}</b><em>prossimo ${dueText(x.due)}</em></li>`).join("")}</ul>` : `<p>Le lezioni superate tornano qui al momento giusto: dopo 1, 3, 7, 16 e 35 giorni se rispondi bene.</p>`}
        <div class="cult-actions"><button class="primary-action" type="button" data-uni="home" data-autofocus>Torna ai corsi</button></div></article></div>`;
    }
    const item = r.queue[r.idx];
    const q = r.qs[r.qi];
    const last = r.qi === r.qs.length - 1;
    return `<div class="uni cult-read" style="--area:${fac(item.course).color}">
      <div class="cult-read-bar"><button class="ghost-action small" type="button" data-uni="home">← Tutti i corsi</button><span class="cult-meta"><span class="cult-dot"></span>Ripasso ${r.idx + 1} di ${r.queue.length}</span></div>
      <article class="cult-quiz">
        <div class="cult-quiz-head"><span class="cult-kicker">${esc(item.course.title)}</span><span class="cult-type">${esc(item.lesson.title)}</span></div>
        <div class="cult-steps">${r.qs.map((_, i) => `<i class="${i < r.answers.length ? (r.answers[i] ? "ok" : "ko") : i === r.qi ? "now" : ""}"></i>`).join("")}</div>
        <h3 class="cult-question" tabindex="-1" ${r.picked === null ? "data-autofocus" : ""}>${prose(q.q)}</h3>
        <div class="cult-options" role="group" aria-label="Risposte">${optionsHtml(q, r.order[r.qi], r.picked, "review-answer")}</div>
        ${r.picked !== null ? `<div class="cult-feedback ${r.picked === q.answer ? "ok" : "ko"}"><strong>${r.picked === q.answer ? "Esatto." : "Non è questa."}</strong><p>${prose(q.why)}</p>
          <div class="cult-actions"><button class="primary-action" type="button" data-uni="review-next" data-autofocus>${last ? (r.idx === r.queue.length - 1 ? "Fine del ripasso" : "Lezione successiva") : "Domanda successiva"}</button><button class="ghost-action" type="button" data-uni="lesson" data-id="${esc(item.lesson.id)}">Rileggi la lezione</button></div></div>` : `<p class="cult-hint">Tasti 1–4 o A–D per rispondere.</p>`}
      </article></div>`;
  }

  /* ------------------------------------------------------------ disegno */
  function render(focus = false) {
    const box = $("cultPanel-uni");
    if (!box) return;
    if (!COURSES.length) {
      if (!window.CultureUniversity && loading !== "error") {
        box.innerHTML = `<p class="cult-empty" role="status">Carico i corsi…</p>`;
        loadData(() => render(focus));
        return;
      }
      box.innerHTML = loading === "error"
        ? `<div class="cult-review-empty"><h2>Corsi non caricati</h2><p>Serve la connessione la prima volta che apri l'università; poi i corsi restano salvati anche senza rete.</p><div class="cult-actions"><button class="primary-action" type="button" data-uni="retry">Riprova</button></div></div>`
        : `<p class="cult-empty">Corsi non caricati.</p>`;
      return;
    }
    let html;
    if (ui.view === "course" && byId.get(ui.courseId)) html = courseView(byId.get(ui.courseId));
    else if (ui.view === "lesson") html = lessonView();
    else if (ui.view === "exam" && ui.exam && byId.get(ui.courseId)) html = examView();
    else if (ui.view === "review" && ui.review) html = reviewView();
    else { ui.view = "home"; html = homeView(); }
    box.innerHTML = html;
    ui.at = Date.now();
    if (focus) {
      const el = box.querySelector("[data-autofocus]") || box.querySelector("[data-focus]");
      if (el) { if (!el.hasAttribute("tabindex") && !/^(BUTTON|A|TEXTAREA)$/.test(el.tagName)) el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
      const top = box.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: Math.max(0, window.scrollY + top - 12), behavior: "auto" });
    }
  }

  function openLesson(id) {
    const it = lessonIndex.get(id);
    if (!it) return;
    ui.view = "lesson";
    ui.lessonId = id;
    ui.courseId = it.course.id;
    ui.step = "read";
    ui.quiz = null;
  }

  function startQuiz() {
    const it = lessonIndex.get(ui.lessonId);
    const rand = U.rng(Date.now() & 0xffffffff);
    ui.quiz = { qi: 0, answers: [], picked: null, order: it.lesson.quiz.map((q) => U.shuffle(q.options.map((_, i) => i), rand)), note: U.lessonState(uni(), it.lesson.id).note || "", compared: false, result: null };
    ui.step = "quiz";
  }

  function finishLesson() {
    const it = lessonIndex.get(ui.lessonId);
    const box = $("uniExplainInput");
    if (box && !ui.quiz.compared) ui.quiz.note = box.value;
    const r = U.finishLesson(uni(), it.lesson, { correct: ui.quiz.answers.filter(Boolean).length, total: it.lesson.quiz.length, note: ui.quiz.note });
    ui.quiz.result = r;
    ui.step = "done";
    save();
    announce(r.passed ? "Lezione superata" : "Lezione da rifare");
  }

  function startExam(courseId) {
    const c = byId.get(courseId);
    if (!c || !U.courseProgress(uni(), c).examOpen) return;
    ui.view = "exam";
    ui.courseId = courseId;
    ui.exam = { questions: U.makeExam(c, Date.now() & 0xffffffff), qi: 0, answers: [], started: false, done: false };
  }

  function startReview() {
    const due = U.dueLessons(uni(), COURSES);
    ui.view = "review";
    ui.review = { queue: due, idx: 0, results: [] };
    prepReview();
  }
  function prepReview() {
    const r = ui.review;
    if (r.idx >= r.queue.length) return;
    const item = r.queue[r.idx];
    const rand = U.rng((Date.now() + r.idx) & 0xffffffff);
    r.qs = U.reviewQuestions(item.lesson, 2, Date.now() + r.idx);
    r.order = r.qs.map((q) => U.shuffle(q.options.map((_, i) => i), rand));
    r.qi = 0;
    r.answers = [];
    r.picked = null;
  }

  function pick(index) {
    if (ui.view === "lesson" && ui.step === "quiz" && ui.quiz.picked === null) {
      const it = lessonIndex.get(ui.lessonId);
      ui.quiz.picked = index;
      ui.quiz.answers.push(index === it.lesson.quiz[ui.quiz.qi].answer);
      render(true);
      return true;
    }
    if (ui.view === "exam" && ui.exam && ui.exam.started && !ui.exam.done) {
      const e = ui.exam;
      e.answers.push(index);
      if (e.answers.length >= e.questions.length) {
        e.correct = e.questions.filter((q, i) => e.answers[i] === q.answer).length;
        e.result = U.recordExam(uni(), byId.get(ui.courseId), { correct: e.correct, total: e.questions.length });
        e.grade = e.result;
        e.done = true;
        save();
        announce(e.grade.passed ? `Esame superato: ${U.voteLabel(e.grade)}` : "Esame non superato");
      } else e.qi += 1;
      render(true);
      return true;
    }
    if (ui.view === "review" && ui.review && ui.review.picked === null && ui.review.qs) {
      const r = ui.review;
      r.picked = index;
      r.answers.push(index === r.qs[r.qi].answer);
      render(true);
      return true;
    }
    return false;
  }

  function onClick(event) {
    const el = event.target.closest("[data-uni]");
    if (!el || !$("cultPanel-uni").contains(el)) return;
    const act = el.dataset.uni;
    // contro i doppi clic sulle risposte subito dopo un nuovo disegno
    if (/answer$/.test(act) && (event.detail > 1 || Date.now() - ui.at < 300)) return;
    switch (act) {
      case "home": ui.view = "home"; ui.exam = null; render(true); break;
      case "retry": loading = null; render(true); break;
      case "course": ui.view = "course"; ui.courseId = el.dataset.id; ui.exam = null; render(true); break;
      case "lesson": openLesson(el.dataset.id); render(true); break;
      case "quiz": startQuiz(); render(true); break;
      case "answer": case "exam-answer": case "review-answer": pick(Number(el.dataset.index)); break;
      case "next-q": {
        const it = lessonIndex.get(ui.lessonId);
        if (ui.quiz.qi >= it.lesson.quiz.length - 1) ui.step = "explain"; else { ui.quiz.qi += 1; ui.quiz.picked = null; }
        render(true);
        break;
      }
      case "compare": { const box = $("uniExplainInput"); if (box) ui.quiz.note = box.value; ui.quiz.compared = true; render(true); break; }
      case "finish": finishLesson(); render(true); break;
      case "exam": startExam(el.dataset.id); render(true); break;
      case "exam-start": if (ui.exam) { ui.exam.started = true; render(true); } break;
      case "review": startReview(); render(true); break;
      case "review-next": {
        const r = ui.review;
        if (r.qi < r.qs.length - 1) { r.qi += 1; r.picked = null; } else {
          const item = r.queue[r.idx];
          const res = U.reviewLesson(uni(), item.lesson, { correct: r.answers.filter(Boolean).length, total: r.qs.length });
          r.results.push({ ...item, ok: res.ok, due: res.due });
          save();
          r.idx += 1;
          prepReview();
        }
        render(true);
        break;
      }
      default: break;
    }
  }

  function onKey(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.isComposing || event.repeat) return;
    if (event.target && /^(TEXTAREA|INPUT|SELECT)$/.test(event.target.tagName)) return;
    const page = $("culture");
    const panel = $("cultPanel-uni");
    if (!page || !page.classList.contains("active-page") || !panel || panel.hidden) return;
    const k = event.key.toUpperCase();
    const pos = ["1", "2", "3", "4"].indexOf(k) >= 0 ? Number(k) - 1 : LETTERS.indexOf(k);
    if (pos < 0) return;
    const btns = panel.querySelectorAll(".cult-option:not(:disabled)");
    if (!btns[pos] || Date.now() - ui.at < 300) return;
    event.preventDefault();
    pick(Number(btns[pos].dataset.index));
  }

  window.UniUI = {
    render,
    dueCount: () => (COURSES.length ? U.dueLessons(uni(), COURSES).length : 0),
    stats: () => U.stats(uni(), COURSES)
  };

  document.addEventListener("DOMContentLoaded", () => {
    const panel = $("cultPanel-uni");
    if (!panel) return;
    panel.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
  });
})();
