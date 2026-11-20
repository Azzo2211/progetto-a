/*
 * Progetto A - Memoria: le parti nuove della pagina, agganciate a memory/ui.js con window.MemoryUIKit.
 *  - Percorso: 42 giornate con lezione e compiti (memory/course.js), test all'inizio, a metà, alla fine.
 *  - Ripasso: i tuoi mazzi con FSRS (domande, vocaboli, persone, brani), obiettivo di ricordo.
 *  - Usala: studio, scacchi, lingue, pianoforte, vita quotidiana; testi a memoria; esercizi di scacchi.
 *  - Tecniche: sistema delle carte, persona-azione-oggetto, biblioteca delle lezioni.
 */
(function () {
  "use strict";

  const K = window.MemoryUIKit;
  const S = window.MemorySRS;
  const C = window.MemoryContent;
  const CO = window.MemoryCourse;
  if (!K || !S || !C || !CO) return;
  const { E, esc, plural, num, dateShort, fmtSec, lab, save, announce, render, backBar, ui } = K;

  // «a mezzanotte, tra 2 h 41 min»: il numero scorre da solo (vedi il timer in fondo)
  function opensLine(cs) {
    if (!cs.opensAt) return "domani";
    return `a mezzanotte, tra <span data-mem-opens="${cs.opensAt}">${E.opensIn(cs.opensAt - Date.now())}</span>`;
  }
  K.opensLine = opensLine;
  setInterval(() => {
    const els = document.querySelectorAll("#memory [data-mem-opens]");
    if (!els.length) return;
    let open = false;
    els.forEach((el) => {
      const left = Number(el.dataset.memOpens) - Date.now();
      if (left <= 0) open = true;
      else el.textContent = E.opensIn(left);
    });
    // mezzanotte passata: ridisegna, così il piano nuovo si apre da solo
    if (open) {
      if (E.courseStatus(lab(), Date.now(), true).changed) save();
      render(false, true);
    }
  }, 1000);

  const KIND_ORDER = ["qa", "vocab", "people", "piece"];
  // quando torna una scheda (o un testo): «tra 10 min», «domani», «tra 3 giorni»...
  function dueLabel(due) {
    const now = Date.now();
    if (due <= now) return "da ripassare";
    if (due - now < 3600000) return S.label(0);
    return S.label(Math.max(1, Math.round((S.startOfDay(due) - S.startOfDay(now)) / S.DAY)));
  }
  const GRADE_LABEL = { 1: "Di nuovo", 2: "Difficile", 3: "Bene", 4: "Facile" };

  /* ------------------------------------------------------------ lezioni */
  function sourcesLine(keys) {
    const list = (keys || []).map((k) => C.SOURCES[k]).filter(Boolean);
    return list.length ? `<p class="mem-small mem-refs">Fonti: ${list.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`).join(" · ")}</p>` : "";
  }
  function lessonBody(ls) {
    return `<p class="mem-lead">${esc(ls.lead)}</p>${ls.body.map((p) => `<p>${esc(p)}</p>`).join("")}
      ${ls.steps && ls.steps.length ? `<h3>Come si fa</h3><ol class="mem-howto">${ls.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
      ${sourcesLine(ls.sources)}`;
  }
  K.lessonView = (id) => {
    const ls = E.lessonById(id);
    if (!ls) { ui.technique = null; return ""; }
    return `<div class="mem-tech-detail"><div class="mem-back"><button type="button" class="ghost-action small" data-m="tech-back">← Tutte le tecniche</button></div>
      <article class="mem-card mem-lesson"><span class="mem-kicker">Lezione</span><h2 data-focus tabindex="-1">${esc(ls.title)}</h2>${lessonBody(ls)}</article></div>`;
  };
  K.lessonLibrary = () => `<section class="mem-lessons"><h3>Le lezioni del percorso</h3><p class="mem-small">Tutte le lezioni, anche fuori dal percorso: come funziona la memoria, le tecniche dei campioni e come usarle nello studio, negli scacchi, nelle lingue e al pianoforte.</p>
    <ul class="mem-lesson-list">${C.LESSONS.map((ls) => `<li><button type="button" data-m="lesson-open" data-id="${ls.id}"><strong>${esc(ls.title)}</strong><span>${esc(ls.lead)}</span></button></li>`).join("")}</ul></section>`;

  /* ------------------------------------------------------------ percorso */
  function courseIntro() {
    return `<div class="mem-course">
      <article class="mem-card mem-course-hero">
        <span class="mem-kicker">Percorso guidato</span>
        <h2 data-focus tabindex="-1">Sei settimane per una memoria allenata</h2>
        <p class="mem-lead">Nello studio di Dresler e colleghi (Neuron, 2017) persone comuni, con 30 minuti al giorno per 40 giorni di metodo dei loci, sono passate da circa 26-30 a 62 parole ricordate su 72. Questo percorso segue la stessa strada: 42 giornate, ognuna con una lezione breve e pochi compiti.</p>
        <ol class="mem-weeks">${CO.WEEKS.map((w) => `<li><strong>${esc(w.title)}</strong><span>${esc(w.line)}</span></li>`).join("")}</ol>
        <h3>Come funziona</h3>
        <ul class="mem-plain">
          <li>Una giornata al giorno, circa mezz'ora. Quando la finisci, la successiva si apre il giorno dopo: il sonno in mezzo fa parte del metodo.</li>
          <li>Se salti un giorno non perdi niente: riprendi da dove eri.</li>
          <li>I compiti si spuntano da soli quando li fai qui; quelli fuori dall'app li segni tu.</li>
          <li>Test il primo giorno, il 21° e alla fine, e un controllo dopo quattro mesi.</li>
          <li>È anche un gioco: ogni giorno è un piano della Torre della Memoria, con tre stelle da prendere, e ogni sette piani un guardiano da battere con una prova vera. Punti e stelle arrivano solo ricordando.</li>
          <li>Mezz'ora è il minimo. Se hai più tempo, in Oggi scegli 45, 60, 90 o 120 minuti: dopo i compiti del piano arrivano sfide, guardiani, il tuo punto debole e i ripassi.</li>
        </ul>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="course-start" data-autofocus>Inizia il percorso</button></div>
        ${sourcesLine(["dresler", "wagner"])}
      </article>
    </div>`;
  }
  function taskButton(t) {
    if (t.k === "real") return `<button type="button" class="${t.done ? "ghost-action" : "primary-action"} small" data-m="course-real" data-task="${t.id}">${t.done ? "Annulla" : "Fatto"}<span class="mem-sr">: ${esc(t.label)}</span></button>`;
    return `<button type="button" class="${t.done ? "ghost-action" : "primary-action"} small" data-m="course-task" data-task="${t.id}">${t.done ? "Rifai" : "Inizia"}<span class="mem-sr">: ${esc(t.label)}</span></button>`;
  }
  function reportTable(l) {
    const rows = E.courseReport(l);
    if (!rows.length) return "";
    return `<section class="mem-card"><h3>I tuoi numeri dal primo giorno</h3>
      <table class="mem-table"><thead><tr><th scope="col">Prova</th><th scope="col">Primo</th><th scope="col">Ora</th><th scope="col">Differenza</th></tr></thead><tbody>
      ${rows.map((r) => { const d = r.to - r.from; return `<tr><th scope="row">${esc(r.label)}</th><td>${r.from}</td><td>${r.to}</td><td class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "+" : ""}${d} ${esc(r.unit)}</td></tr>`; }).join("")}
      </tbody></table><p class="mem-small">Il primo valore è il primo risultato dopo l'inizio del percorso; per le discipline e il palazzo «ora» è il tuo record.</p></section>`;
  }
  function courseView() {
    const l = lab();
    const cs = E.courseStatus(l, Date.now(), true);
    if (cs.changed) save();
    if (!cs.started) return courseIntro();
    if (cs.done) {
      const ls = E.lessonById("mantenimento");
      return `<div class="mem-course">
        <article class="mem-card mem-course-hero"><span class="mem-kicker">Percorso completato</span><h2 data-focus tabindex="-1">Hai finito le sei settimane</h2>
          <p class="mem-lead">Controllo a quattro mesi: dal ${dateShort(cs.followUpAt)}. ${cs.followUpDue ? "È il momento: rifai i test in Misura." : "Fino ad allora: ripassi ogni giorno e tre allenamenti a settimana."}</p>
          ${cs.followUpDue ? `<div class="mem-actions"><button type="button" class="primary-action" data-m="go-tab" data-tab="measure">Vai ai test</button></div>` : ""}
          ${K.towerMap ? K.towerMap(l, cs) : ""}</article>
        ${K.floorDetail ? K.floorDetail(l, cs) : ""}
        ${K.extraList ? K.extraList(l, "course") : ""}
        ${reportTable(l)}
        ${ls ? `<article class="mem-card mem-lesson"><span class="mem-kicker">Lezione</span><h3>${esc(ls.title)}</h3>${lessonBody(ls)}</article>` : ""}
        ${restartBox()}
      </div>`;
    }
    const def = cs.def;
    const doneDays = Object.keys(l.course.finished).length;
    const left = cs.tasks.filter((t) => !t.done && !t.opt);
    const minutes = cs.tasks.filter((t) => !t.opt).reduce((a, t) => a + t.minutes, 0);
    return `<div class="mem-course">
      <section class="mem-card mem-course-head">
        <div class="mem-big mem-day" aria-hidden="true"><strong>${cs.day}</strong><span>giorno su ${CO.LENGTH}</span></div>
        <div class="mem-course-title">
          <span class="mem-kicker">Settimana ${cs.week.n} di ${CO.WEEKS.length}: ${esc(cs.week.title)}</span>
          <h2 data-focus tabindex="-1"><span class="mem-sr">Giorno ${cs.day}: </span>${esc(def.title)}</h2>
          <div class="mem-course-progress"><div class="mem-bar" role="img" aria-label="${doneDays} giornate fatte su ${CO.LENGTH}"><i style="width:${Math.round((doneDays / CO.LENGTH) * 100)}%"></i></div><span>${doneDays}/${CO.LENGTH} giornate fatte. ${cs.waiting ? "Oggi: fatto." : left.length ? `Oggi: ${plural(left.length, "compito", "compiti")}, circa ${minutes} minuti.` : "Oggi: tutto fatto."}</span></div>
        </div>
        ${K.towerMap ? K.towerMap(l, cs) : `<ol class="mem-week-strip" aria-label="Le sei settimane">${CO.WEEKS.map((w) => `<li class="${w.n < cs.week.n ? "past" : w.n === cs.week.n ? "now" : ""}" ${w.n === cs.week.n ? 'aria-current="step"' : ""}><span>${w.n}</span><em>${esc(w.title)}</em></li>`).join("")}</ol>`}
      </section>
      ${K.floorDetail ? K.floorDetail(l, cs) : ""}
      ${cs.waiting ? `<div class="mem-alert ready"><strong>Piano completato</strong><span>${cs.day < CO.LENGTH ? `Il piano ${cs.day + 1} si apre ${opensLine(cs)}. Stasera dormi: è lì che i ricordi di oggi si fissano. Se hai ancora tempo, l'allenamento extra qui sotto ti fa salire di più.` : ""}</span></div>${K.extraList ? K.extraList(l, "course") : ""}` : ""}
      <section class="mem-card">
        <h3>I compiti di oggi</h3>
        ${def.tip ? `<p class="mem-tip">${esc(def.tip)}</p>` : ""}
        <ol class="mem-steps mem-course-tasks">${cs.tasks.map((t) => `
          <li class="${t.done ? "done" : ""}">
            <span class="mem-step-mark" aria-hidden="true">${t.done ? "✓" : ""}</span>
            <div><strong>${esc(t.label)}${t.opt ? ` <em class="mem-opt">facoltativo</em>` : ""}</strong><span>${esc(t.detail)}</span></div>
            <span class="mem-step-min">${t.minutes} min</span>
            ${taskButton(t)}
          </li>`).join("")}</ol>
      </section>
      ${K.floorCard ? K.floorCard(l, cs) : ""}
      ${cs.lesson ? `<details class="mem-card mem-lesson" ${cs.tasks.some((t) => t.done) ? "" : "open"}><summary><span class="mem-kicker">Lezione del giorno</span><strong>${esc(cs.lesson.title)}</strong></summary>${lessonBody(cs.lesson)}</details>` : ""}
      ${cs.day >= 21 ? reportTable(l) : ""}
      ${restartBox()}
    </div>`;
  }
  function restartBox() {
    return `<details class="mem-restart"><summary>Ricominciare il percorso</summary><p class="mem-small">Il percorso riparte dal giorno 1. Test, mazzi, palazzi e risultati restano.</p><button type="button" class="ghost-action small" data-m="course-reset" data-confirm="">Ricomincia da capo</button></details>`;
  }
  K.tabs.course = courseView;
  K.todayExtra = (l) => {
    const cs = E.courseStatus(l, Date.now(), false);
    if (!cs.started || !cs.active) return "";
    return `<button type="button" class="mem-course-banner" data-m="go-tab" data-tab="course"><span class="mem-kicker">Percorso · settimana ${cs.week.n}</span><strong>Giorno ${cs.day} di ${CO.LENGTH}: ${esc(cs.def.title)}</strong><span>${cs.waiting ? `Fatto: il prossimo si apre ${opensLine(cs)}` : cs.lesson ? `Lezione: ${esc(cs.lesson.title)}` : "Apri la giornata"}</span></button>`;
  };

  function courseTask(id) {
    const l = lab();
    const cs = E.courseStatus(l, Date.now(), true);
    if (cs.changed) save();
    const t = cs.tasks && cs.tasks.find((x) => x.id === id);
    if (!t) { render(true); return; }
    ui.tab = "course";
    const now = Date.now();
    switch (t.k) {
      case "test": K.startSpan(t.test); break;
      case "words": {
        const p = E.delayedStatus(l);
        if (p && p.ready) K.startDelayedRecall();
        else if (p) { announce(`Richiamo differito tra ${Math.max(1, Math.ceil((p.readyAt - now) / 60000))} minuti`); render(true); }
        else K.startWords();
        break;
      }
      case "major": {
        const q = E.majorQueue(l);
        if (q.due.length + q.fresh.length) K.startMajor(); else { announce("Sistema fonetico: niente da fare oggi"); render(true); }
        break;
      }
      case "build": {
        const short = l.palaces.filter((p) => p.loci.length < t.min).sort((a, b) => b.loci.length - a.loci.length)[0];
        const enough = l.palaces.filter((p) => p.loci.length >= t.min).length;
        ui.tab = "techniques";
        ui.technique = "loci";
        ui.returnTab = "course";
        ui.palaceEdit = { id: enough < t.count && short && t.count === 1 ? short.id : null };
        render(true);
        break;
      }
      case "palace": {
        const per = t.per || 1;
        const need = Math.ceil(t.n / per);
        const cand = l.palaces.filter((p) => p.loci.length >= need).sort((a, b) => a.uses - b.uses);
        if (!cand.length) {
          ui.tab = "techniques";
          ui.technique = "loci";
          ui.returnTab = "course";
          const longest = l.palaces.slice().sort((a, b) => b.loci.length - a.loci.length)[0];
          ui.palaceEdit = { id: longest ? longest.id : null };
          announce(`Serve un palazzo con almeno ${need} luoghi`);
          render(true);
          break;
        }
        K.startRound(E.makePalaceRound(l, cand[0].id, t.n, now, per), "course");
        break;
      }
      case "dis": K.startRound(E.makeRound(t.key, 0, now, l, { n: t.n, mem: t.mem }), "course"); break;
      case "life": { const d = E.LIFE_DRILLS[t.drill]; K.startRound(E.makeRound(d.key, 0, now, l, { n: d.n, mem: d.mem, list: d.list || null, life: t.drill }), "course"); break; }
      case "cardsys": startCards("course"); break;
      case "pao": ui.tab = "techniques"; ui.technique = "pao"; ui.returnTab = "course"; render(true); break;
      case "deck": { const deck = deckOfKind(l, t.kind, true); save(); ui.tab = "review"; ui.deckOpen = deck.id; ui.returnTab = "course"; render(true); break; }
      case "review": startReview(null, "course"); break;
      case "text": { const tx = t.text ? E.addSampleText(l, t.text) : (l.texts[0] || E.addSampleText(l, "infinito")); save(); ui.tab = "apps"; ui.textOpen = tx.id; ui.returnTab = "course"; render(true); break; }
      case "chess": startChess(t.drill, "course"); break;
      default: render(true);
    }
  }
  K.actions["course-task"] = (el) => courseTask(el.dataset.task);
  K.actions["course-start"] = () => { const l = lab(); E.courseStart(l); save(); ui.tab = "course"; render(true); announce("Percorso iniziato: giorno 1"); };
  K.actions["course-real"] = (el) => {
    const l = lab();
    const cs = E.courseStatus(l, Date.now(), false);
    const t = cs.tasks && cs.tasks.find((x) => x.id === el.dataset.task);
    if (!t) return;
    E.courseManual(l, t.id, !t.done);
    E.courseStatus(l, Date.now(), true);
    save();
    render(false);
  };
  K.actions["course-reset"] = (el) => {
    if (el.dataset.confirm !== "1") { el.dataset.confirm = "1"; el.textContent = "Conferma: ricomincia dal giorno 1"; return; }
    const l = lab();
    E.courseReset(l);
    save();
    render(true);
  };
  K.actions["go-tab"] = (el) => K.setTab(el.dataset.tab);
  K.actions["lesson-open"] = (el) => { ui.technique = `lesson:${el.dataset.id}`; render(true); };

  /* ------------------------------------------------------------ ripasso: mazzi */
  function deckOfKind(l, kind, create = false) {
    const have = l.decks.find((d) => d.kind === kind);
    if (have || !create) return have || null;
    return E.addDeck(l, { name: E.DECK_KINDS[kind].label, kind });
  }
  function retentionLabel(r) {
    const t = S.TARGETS.find((x) => Math.abs(x.r - r) < 0.001);
    return t ? t.label : `${Math.round(r * 100)}%`;
  }
  function reviewHome() {
    const l = lab();
    const sum = E.reviewSummary(l);
    const mq = E.majorQueue(l);
    const tr = E.trueRetention(l);
    const cq = E.cardsQueue(l);
    const pq = E.paoQueue(l);
    const dueTexts = l.texts.filter((t) => t.st && t.st.due <= Date.now());
    const cardsStarted = Object.keys(l.systems.cards).length > 0;
    const rows = [
      { show: true, label: "I tuoi mazzi", n: sum.decksDue, extra: sum.decksNew ? `+ ${sum.decksNew} nuove` : "", act: sum.decksDue + sum.decksNew ? `<button type="button" class="primary-action small" data-m="rev-start">Ripassa</button>` : "" },
      { show: l.texts.length > 0, label: "Testi da recitare", n: dueTexts.length, extra: "", act: dueTexts.length ? `<button type="button" class="ghost-action small" data-m="text-open" data-id="${dueTexts[0].id}">Recita</button>` : "" },
      { show: true, label: "Sistema fonetico", n: mq.due.length, extra: mq.fresh.length ? `+ ${mq.fresh.length} nuove` : "", act: mq.due.length + mq.fresh.length ? `<button type="button" class="ghost-action small" data-m="major-go">Allenati</button>` : "" },
      { show: cardsStarted, label: "Sistema delle carte", n: cq.due.length, extra: cq.fresh.length ? `+ ${cq.fresh.length} nuove` : "", act: cq.due.length + cq.fresh.length ? `<button type="button" class="ghost-action small" data-m="cs-go">Allenati</button>` : "" },
      { show: E.paoFilled(l) > 0, label: "Persone e azioni", n: pq.due.length, extra: pq.fresh.length ? `+ ${pq.fresh.length} nuove` : "", act: pq.due.length + pq.fresh.length ? `<button type="button" class="ghost-action small" data-m="pao-go">Allenati</button>` : "" }
    ].filter((r) => r.show);
    return `<div class="mem-review">
      ${ui.returnTab === "course" ? `<div class="mem-back"><button type="button" class="ghost-action small" data-m="deck-back">← Torna al percorso</button></div>` : ""}
      <div class="mem-intro"><h2 data-focus tabindex="-1">Ripasso</h2><p>Quello che vuoi ricordare per sempre: domande di studio, vocaboli, persone, brani, testi. Ogni scheda torna quando stai per dimenticarla, con FSRS, l'algoritmo di ripasso adottato da Anki. <button type="button" class="mem-linkbtn" data-m="lesson-jump" data-id="ripasso">Come funziona</button></p></div>
      <section class="mem-card mem-rev-today">
        <div class="mem-big"><strong>${sum.total + mq.due.length}</strong><span>da ripassare</span></div>
        <ul class="mem-rev-rows">${rows.map((r) => `<li><span>${esc(r.label)}</span><b>${r.n}</b><em>${esc(r.extra)}</em>${r.act}</li>`).join("")}</ul>
      </section>
      <section class="mem-card">
        <h3>I tuoi mazzi</h3>
        ${l.decks.length ? `<ul class="mem-decks">${l.decks.map((d) => { const st = E.deckStats(d); return `<li><div><strong>${esc(d.name)}</strong><span>${esc(E.DECK_KINDS[d.kind].label)}${d.lang ? ` (${esc(d.lang)})` : ""}: ${d.kind === "vocab" ? plural(st.cards, "parola", "parole") : plural(st.cards, "scheda", "schede")}, ${st.due} da ripassare, ${st.fresh} nuove, ${st.mature} imparate</span></div><button type="button" class="ghost-action small" data-m="deck-open" data-id="${d.id}">Apri</button>${st.due + st.fresh ? `<button type="button" class="primary-action small" data-m="rev-start" data-id="${d.id}">Ripassa</button>` : ""}</li>`; }).join("")}</ul>` : `<p class="mem-empty">Nessun mazzo. Crea il primo qui sotto, oppure parti dalle aperture di scacchi.</p>`}
        <form class="mem-deck-new" id="memDeckNew">
          <label class="mem-field">Tipo <select id="memDeckKind">${KIND_ORDER.map((k) => `<option value="${k}">${esc(E.DECK_KINDS[k].label)}</option>`).join("")}</select></label>
          <label class="mem-field">Nome <input type="text" id="memDeckName" maxlength="60" placeholder="Es. Diritto privato, Spagnolo, Persone del lavoro"></label>
          <label class="mem-field">Lingua (per i vocaboli) <input type="text" id="memDeckLang" maxlength="30" placeholder="Es. spagnolo"></label>
          <div class="mem-actions"><button type="submit" class="primary-action small">Crea il mazzo</button>${l.decks.some((d) => d.name === "Aperture: le prime mosse") ? "" : `<button type="button" class="ghost-action small" data-m="starter" data-id="openings">Aggiungi «Aperture: le prime mosse» (${C.OPENINGS.length} schede)</button>`}</div>
        </form>
      </section>
      <section class="mem-card">
        <h3>Quanto vuoi ricordare</h3>
        <div class="mem-targets" role="group" aria-label="Obiettivo di ricordo">${S.TARGETS.map((t) => `<button type="button" data-m="ret" data-v="${t.r}" aria-pressed="${Math.abs(l.prefs.retention - t.r) < 0.001}"><strong>${esc(t.label)}</strong><span>${esc(t.note)}</span></button>`).join("")}</div>
        <label class="mem-field mem-inline">Schede nuove al giorno <select id="memNewPerDay">${[5, 10, 15, 20, 30, 50].map((n) => `<option value="${n}" ${E.newPerDay(l) === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <p class="mem-small">${tr.n >= 5 ? `Negli ultimi 30 giorni hai ricordato il ${Math.round(tr.share * 100)}% di ${tr.n} ripassi di schede già imparate (FSRS prevedeva il ${Math.round(tr.predicted * 100)}%).` : "Quando avrai fatto qualche ripasso di schede già imparate, qui vedi quanto ricordi davvero rispetto all'obiettivo."}</p>
      </section>
    </div>`;
  }
  function deckView(id) {
    const l = lab();
    const d = E.deckById(l, id);
    if (!d) { ui.deckOpen = null; return reviewHome(); }
    const kk = E.DECK_KINDS[d.kind];
    const st = E.deckStats(d);
    const now = Date.now();
    const nextOf = (c) => {
      const states = E.sidesOf(d).map((s) => c.st[s]).filter(Boolean);
      if (!states.length) return "nuova";
      return dueLabel(Math.min(...states.map((x) => x.due)));
    };
    const back = ui.returnTab === "course" ? "← Torna al percorso" : "← Ripasso";
    return `<div class="mem-review">
      <div class="mem-back"><button type="button" class="ghost-action small" data-m="deck-back">${back}</button></div>
      <article class="mem-card">
        <span class="mem-kicker">${esc(kk.label)}${d.lang ? ` · ${esc(d.lang)}` : ""}</span>
        <h2 data-focus tabindex="-1">${esc(d.name)}</h2>
        <p>${d.kind === "vocab" ? `${plural(st.cards, "parola", "parole")}, ognuna nei due sensi (${st.sides} schede)` : plural(st.cards, "scheda", "schede")}: ${st.due} da ripassare, ${st.fresh} nuove, ${st.mature} imparate.</p>
        <div class="mem-actions">${st.due + st.fresh ? `<button type="button" class="primary-action" data-m="rev-start" data-id="${d.id}">Ripassa questo mazzo</button>` : ""}
          <label class="mem-field mem-inline">Obiettivo <select data-deck-ret="${d.id}"><option value="">Quello generale (${esc(retentionLabel(l.prefs.retention))})</option>${S.TARGETS.map((t) => `<option value="${t.r}" ${d.retention && Math.abs(d.retention - t.r) < 0.001 ? "selected" : ""}>${esc(t.label)}</option>`).join("")}</select></label></div>
        ${deckHelp(d)}
      </article>
      <form class="mem-card mem-card-new" id="memCardNew" data-deck="${d.id}">
        <h3>Nuova ${esc(kk.one)}</h3>
        <label class="mem-field">${esc(kk.front)} <input type="text" id="memCardF" maxlength="400" autocomplete="off" required></label>
        <label class="mem-field">${esc(kk.back)} <textarea id="memCardB" rows="2" maxlength="800" required></textarea></label>
        <label class="mem-field">${esc(kk.extra)} <input type="text" id="memCardX" maxlength="400" autocomplete="off"></label>
        <div class="mem-actions"><button type="submit" class="primary-action small">Aggiungi</button><span class="mem-small" id="memCardMsg" aria-live="polite"></span></div>
      </form>
      ${d.kind === "qa" || d.kind === "vocab" ? `<details class="mem-card"><summary>Incolla tante schede insieme</summary><p class="mem-small">Una per riga: davanti | dietro | nota (la nota è facoltativa). Va bene anche il punto e virgola o la tabulazione, come quando copi da un foglio di calcolo.</p><textarea id="memImport" rows="6" placeholder="${d.kind === "vocab" ? "la mela | the apple&#10;correre | to run | ran, run" : "Cos'è la sovranità popolare? | Il potere appartiene al popolo (Cost. art. 1)"}"></textarea><div class="mem-actions"><button type="button" class="ghost-action small" data-m="deck-import" data-id="${d.id}">Aggiungi le righe</button></div></details>` : ""}
      <section class="mem-card">
        <h3>Le schede</h3>
        ${d.cards.length ? `<ul class="mem-cardlist">${d.cards.slice().reverse().slice(0, 300).map((c) => `<li><div><strong>${esc(c.f)}</strong><span>${esc(c.b)}</span>${c.x ? `<em>${esc(c.x)}</em>` : ""}</div><small>${esc(nextOf(c))}</small><button type="button" class="ghost-action small" data-m="card-del" data-deck="${d.id}" data-id="${c.id}" aria-label="Elimina: ${esc(c.f)}">×</button></li>`).join("")}</ul>` : `<p class="mem-empty">Ancora nessuna scheda.</p>`}
        <div class="mem-actions"><button type="button" class="ghost-action small" data-m="deck-del" data-id="${d.id}" data-confirm="">Elimina il mazzo</button></div>
      </section>
    </div>`;
  }
  function deckHelp(d) {
    const map = {
      qa: "Domande brevi, una cosa per scheda, risposte corte. Meglio «Perché…?» e «Come…?» che «Cos'è…?». Prima di girare, rispondi a voce.",
      vocab: "Parola straniera e significato. Nella nota scrivi la parola chiave e la scena per le parole che non entrano: «gato → gatto» non serve, «ventana (finestra) → una finestra con un ventaglio» sì.",
      people: "Nome, dove l'hai conosciuta e un dettaglio del viso con l'immagine del nome. Il ripasso ti chiede il nome partendo da dove e da come è.",
      piece: "Una scheda per sezione del brano (A, B, ripresa…): nel retro i punti di ripartenza e cosa ricordare (armonia, diteggiatura difficile, espressione). Al ripasso suoni a memoria la sezione e voti come è andata."
    };
    return `<p class="mem-small">${esc(map[d.kind])}</p>`;
  }
  K.tabs.review = () => (ui.deckOpen ? deckView(ui.deckOpen) : reviewHome());

  // sessione di ripasso dei mazzi
  function startReview(deckId = null, source = "review") {
    const l = lab();
    const q = E.deckQueue(l, Date.now(), deckId);
    const items = q.due.concat(q.fresh);
    if (!items.length) {
      // niente nei mazzi: apri il Ripasso (carte, persone, testi e la creazione dei mazzi)
      if (source === "course" && ui.tab === "course") { ui.tab = "review"; ui.returnTab = "course"; ui.deckOpen = null; }
      announce("Nei mazzi non c'è niente da ripassare adesso");
      render(true);
      return;
    }
    K.stopTimers();
    ui.run = { type: "deck", items, idx: 0, shown: false, typed: "", counts: { 1: 0, 2: 0, 3: 0, 4: 0 }, again: {}, source, deckId };
    render(true);
  }
  function promptOf(deck, card, side) {
    const lang = deck.lang ? ` in ${deck.lang}` : "";
    if (deck.kind === "vocab") return side === "a" ? { q: card.f, hint: "Cosa vuol dire?", a: card.b } : { q: card.b, hint: `Come si dice${lang}?`, a: card.f };
    if (deck.kind === "people") return { q: card.b, sub: card.x, hint: "Come si chiama?", a: card.f };
    if (deck.kind === "piece") return { q: `${card.x ? `${card.x} · ` : ""}${card.f}`, hint: "Suona a memoria questa sezione, poi gira la scheda e vota come è andata.", a: card.b };
    return { q: card.f, hint: "Rispondi a voce o per iscritto, poi gira la scheda.", a: card.b };
  }
  function deckRunView() {
    const r = ui.run;
    const l = lab();
    const head = `${backBar("← Fine")}<div class="mem-run-head"><span class="mem-kicker">Ripasso</span><span>${Math.min(r.idx + 1, r.items.length)}/${r.items.length}</span></div>`;
    if (r.idx >= r.items.length) {
      const total = Object.values(r.counts).reduce((a, b) => a + b, 0);
      const sum = E.reviewSummary(l);
      return `${head}<article class="mem-card mem-result"><div class="mem-big"><strong>${total}</strong><span>risposte</span></div><div>
        <h2 data-focus tabindex="-1">Ripasso finito</h2>
        <p>${r.counts[3] + r.counts[4]} bene o facili, ${r.counts[2]} difficili, ${r.counts[1]} da rivedere${r.counts[1] ? " (tornano prima della fine e di nuovo domani)" : ""}.</p>
        ${sum.total ? `<p>Restano da fare: ${[sum.cardsDue ? `carte ${sum.cardsDue}` : "", sum.paoDue ? `persone e azioni ${sum.paoDue}` : "", sum.texts ? `testi ${sum.texts}` : "", sum.decksDue ? `mazzi ${sum.decksDue}` : ""].filter(Boolean).join(", ")}.</p>` : "<p>Per oggi hai ripassato tutto.</p>"}
        <div class="mem-actions"><button type="button" class="primary-action" data-m="exit" data-autofocus>${r.source === "course" ? "Torna al percorso" : "Torna al ripasso"}</button></div></div></article>`;
    }
    const ref = r.items[r.idx];
    const x = E.cardRef(l, ref);
    if (!x) { r.idx += 1; return deckRunView(); }
    const p = promptOf(x.deck, x.card, ref.side);
    const st = x.card.st[ref.side];
    const pv = S.preview(st, Date.now(), E.retentionOf(l, x.deck));
    const typedOk = r.shown && r.typed && (x.deck.kind === "vocab" || x.deck.kind === "people") ? E.sameWord(r.typed, p.a) : null;
    return `${head}<article class="mem-card mem-flash">
      <span class="mem-kicker">${esc(x.deck.name)}${ref.isNew && !st ? " · nuova" : ""}</span>
      <p class="mem-hint">${esc(p.hint)}</p>
      <div class="mem-flash-q">${esc(p.q)}${p.sub ? `<small>${esc(p.sub)}</small>` : ""}</div>
      ${r.shown ? `<div class="mem-flash-a" role="status"><strong>${esc(p.a)}</strong>${x.card.x && x.deck.kind !== "people" && x.deck.kind !== "piece" ? `<span>${esc(x.card.x)}</span>` : ""}${r.typed ? `<em class="${typedOk === true ? "ok" : typedOk === false ? "ko" : ""}">Hai scritto: ${esc(r.typed)}</em>` : ""}</div>
        <div class="mem-grades" role="group" aria-label="Quanto l'hai ricordata?">${[1, 2, 3, 4].map((g) => `<button type="button" class="mem-grade g${g} ${typedOk === true && g === 3 ? "hint" : typedOk === false && g === 1 ? "hint" : ""}" data-m="rev-grade" data-g="${g}"><kbd>${g}</kbd><strong>${GRADE_LABEL[g]}</strong><span>${esc(S.label(pv[g]))}</span></button>`).join("")}</div>`
        : `${x.deck.kind !== "piece" ? `<input type="text" class="mem-flash-input" id="memRevTyped" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Scrivi la risposta (facoltativo)" data-autofocus>` : ""}<div class="mem-actions"><button type="button" class="primary-action" data-m="rev-show" ${x.deck.kind === "piece" ? "data-autofocus" : ""}>Gira la scheda</button></div>`}
    </article>`;
  }
  function revShow() {
    const r = ui.run;
    if (!r || r.type !== "deck" || r.shown) return;
    const inp = K.$("memRevTyped");
    r.typed = inp ? inp.value.trim() : "";
    r.shown = true;
    render(true);
  }
  function revGrade(g) {
    const r = ui.run;
    if (!r || r.type !== "deck" || !r.shown) return;
    const l = lab();
    const ref = r.items[r.idx];
    E.answerCard(l, ref, g);
    r.counts[g] += 1;
    r.combo = g >= 2 ? (r.combo || 0) + 1 : 0;
    if (g === 1) {
      const k = `${ref.cardId}:${ref.side}`;
      r.again[k] = (r.again[k] || 0) + 1;
      if (r.again[k] <= 3) r.items.push({ ...ref, isNew: false });
    }
    r.idx += 1;
    r.shown = false;
    r.typed = "";
    if (r.idx >= r.items.length) E.logActivity(l, "review", Date.now(), { score: r.counts[3] + r.counts[4], max: Object.values(r.counts).reduce((a, b) => a + b, 0) });
    save();
    render(true);
  }
  K.views.deck = deckRunView;
  K.actions["rev-start"] = (el) => startReview(el.dataset.id || null, ui.tab === "course" ? "course" : "review");
  K.actions["rev-show"] = revShow;
  K.actions["rev-grade"] = (el) => revGrade(Number(el.dataset.g));
  K.actions["deck-open"] = (el) => { ui.deckOpen = el.dataset.id; render(true); };
  K.actions["deck-back"] = () => { ui.deckOpen = null; if (ui.returnTab) { ui.tab = ui.returnTab; ui.returnTab = null; } render(true); };
  K.actions["deck-del"] = (el) => {
    if (el.dataset.confirm !== "1") { el.dataset.confirm = "1"; el.textContent = "Conferma: elimina il mazzo e le schede"; return; }
    const l = lab();
    E.removeDeck(l, el.dataset.id);
    save();
    ui.deckOpen = null;
    render(true);
  };
  K.actions["card-del"] = (el) => { const l = lab(); E.removeCard(l, el.dataset.deck, el.dataset.id); save(); render(false); };
  K.actions["deck-import"] = (el) => {
    const l = lab();
    const box = K.$("memImport");
    const n = E.importCards(l, el.dataset.id, box ? box.value : "");
    save();
    render(false);
    announce(n ? `${plural(n, "scheda aggiunta", "schede aggiunte")}` : "Nessuna riga valida: davanti | dietro");
  };
  K.actions.starter = (el) => { const l = lab(); const d = E.addStarter(l, el.dataset.id); save(); if (d) { ui.tab = "review"; ui.deckOpen = d.id; } render(true); };
  K.actions.ret = (el) => { const l = lab(); l.prefs.retention = Number(el.dataset.v); save(); render(false, true); };
  K.actions["lesson-jump"] = (el) => { K.setTab("techniques"); ui.technique = `lesson:${el.dataset.id}`; render(true); };
  K.soft.push("ret");

  /* ------------------------------------------------------------ sistema delle carte */
  K.blocks = K.blocks || {};
  K.blocks.cardsys = (l) => {
    const q = E.cardsQueue(l);
    const sure = E.cardsSure(l);
    const todo = q.due.length + q.fresh.length;
    return `<div class="mem-practice"><h3>Le tue 52 carte</h3>
      <p>${sure}/52 sicure. ${todo ? `Oggi: ${plural(q.due.length, "ripasso", "ripassi")} e ${plural(q.fresh.length, "carta nuova", "carte nuove")}.` : "Per oggi hai finito."} Ti servono le immagini del sistema fonetico: ${E.majorLearned(l)}/100 imparate.</p>
      <div class="mem-actions"><button type="button" class="primary-action" data-m="cs-go" ${todo ? "" : "disabled"}>Allenati con le carte</button></div>
      <details class="mem-majortable"><summary>Tabella delle 52 carte</summary><div class="mem-cardsys-grid">${E.DECK.map((c) => { const img = E.cardImage(c); const st = l.systems.cards[c]; return `<div class="${st && st.s >= 7 ? "known" : st ? "seen" : ""}">${K.cardFace(E.cardInfo(c))}<b>${img.code}</b><span>${esc(img.word)}</span></div>`; }).join("")}</div></details></div>`;
  };
  function startCards(source = "technique") {
    const l = lab();
    const q = E.cardsQueue(l);
    const cards = E.shuffle(q.due).concat(q.fresh);
    if (!cards.length) { announce("Carte: niente da fare oggi"); render(true); return; }
    K.stopTimers();
    ui.run = { type: "cardsys", queue: cards, idx: 0, q: E.cardQuestion(cards[0], Date.now()), answered: null, ok: 0, ko: 0, source, fresh: new Set(q.fresh), intro: q.fresh.includes(cards[0]) };
    render(true);
  }
  function cardsView() {
    const r = ui.run;
    const head = `${backBar("← Fine")}<div class="mem-run-head"><span class="mem-kicker">Sistema delle carte</span><span>${Math.min(r.idx + 1, r.queue.length)}/${r.queue.length}</span></div>`;
    if (r.idx >= r.queue.length) {
      return `${head}<article class="mem-card"><h2 data-focus tabindex="-1">Finito</h2><p>${r.ok} giuste, ${r.ko} da rivedere. ${E.cardsSure(lab())}/52 carte sicure.</p><div class="mem-actions"><button type="button" class="primary-action" data-m="exit" data-autofocus>Torna</button></div></article>`;
    }
    const card = r.queue[r.idx];
    const info = E.cardInfo(card);
    const img = E.cardImage(card);
    const m = E.MAJOR.find((x) => x.code === img.code);
    if (r.intro) {
      return `${head}<article class="mem-card mem-major-card"><span class="mem-kicker">Carta nuova</span><div class="mem-cs-intro">${K.cardFace(info, true)}<div><strong>${img.code}</strong><span>${esc(img.word)}</span></div></div>
        <p>${esc(cardRule(card))}</p><p class="mem-lead">Immagina: ${esc(m.hint)}.</p>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="cs-seen" data-autofocus>Fatto, chiedimela</button></div></article>`;
    }
    const a = r.answered;
    const body = r.q.kind === "pick"
      ? `<p class="mem-hint">Che immagine è questa carta?</p><div class="mem-cs-q">${K.cardFace(info, true)}</div><div class="mem-options">${r.q.options.map((o, i) => `<button type="button" class="mem-option ${a ? (o === r.q.answer ? "right" : o === a.value ? "wrong" : "") : ""}" data-m="cs-pick" data-v="${esc(o)}" ${a ? "disabled" : ""}><kbd>${i + 1}</kbd>${esc(o)}</button>`).join("")}</div>`
      : `<p class="mem-hint">Che numero è questa carta?</p><div class="mem-cs-q">${K.cardFace(info, true)}</div><input class="mem-major-input" id="memCsInput" inputmode="numeric" maxlength="2" autocomplete="off" ${a ? "disabled" : "data-autofocus"} value="${esc(a ? a.value : "")}">${a ? "" : `<div class="mem-actions"><button type="button" class="primary-action" data-m="cs-type">Conferma</button></div>`}`;
    return `${head}<article class="mem-card mem-major-card">${body}
      ${a ? `<div class="mem-feedback ${a.ok ? "ok" : "ko"}" role="status"><strong>${a.ok ? "Giusto" : "No"}: ${esc(info.name)} = ${img.code} = ${esc(img.word)}</strong><span>${esc(cardRule(card))}</span><button type="button" class="primary-action" data-m="cs-next" data-autofocus>Avanti</button></div>` : ""}</article>`;
  }
  function cardRule(card) {
    const info = E.cardInfo(card);
    const suit = { S: "picche = 9", C: "fiori = 8", H: "cuori = 7", D: "quadri = 1" }[info.suit];
    const face = { K: "re = 4", Q: "donna = 2", J: "fante = 6" }[info.rank];
    if (face) return `Figura: ${face} (prima cifra), ${suit} (seconda).`;
    return `Seme: ${suit} (prima cifra); valore: ${info.rank === "A" ? "asso = 1" : info.rank === "10" ? "10 = 0" : info.rank} (seconda).`;
  }
  function csAnswer(value) {
    const r = ui.run;
    if (!r || r.answered || r.intro) return;
    const ok = String(value).trim().toLowerCase() === String(r.q.answer).toLowerCase();
    r.answered = { value, ok };
    E.cardAnswer(lab(), r.q.card, ok);
    r.combo = ok ? (r.combo || 0) + 1 : 0;
    if (ok) r.ok += 1; else { r.ko += 1; if (r.queue.filter((c) => c === r.q.card).length < 3) r.queue.push(r.q.card); }
    save();
    render(true);
  }
  function csNext() {
    const r = ui.run;
    r.idx += 1;
    r.answered = null;
    if (r.idx >= r.queue.length) { E.logActivity(lab(), "sys:cards", Date.now(), { score: r.ok, max: r.ok + r.ko }); save(); render(true); return; }
    const card = r.queue[r.idx];
    r.intro = r.fresh.has(card) && !lab().systems.cards[card];
    r.q = E.cardQuestion(card, Date.now() + r.idx);
    render(true);
  }
  K.views.cardsys = cardsView;
  K.actions["cs-go"] = () => startCards(ui.tab === "course" ? "course" : "technique");
  K.actions["cs-seen"] = () => { const r = ui.run; r.intro = false; render(true); };
  K.actions["cs-pick"] = (el) => csAnswer(el.dataset.v);
  K.actions["cs-type"] = () => { const i = K.$("memCsInput"); csAnswer(i ? i.value : ""); };
  K.actions["cs-next"] = csNext;

  /* ------------------------------------------------------------ persona-azione-oggetto */
  K.blocks.pao = (l) => {
    const q = E.paoQueue(l);
    const filled = E.paoFilled(l);
    const groups = [];
    for (let g = 0; g < 10; g += 1) groups.push(Array.from({ length: 10 }, (_, i) => String(g * 10 + i).padStart(2, "0")));
    return `<div class="mem-practice"><h3>Le tue 100 persone</h3>
      <p><b id="memPaoCount">${filled}</b>/100 con persona e azione. ${q.due.length + q.fresh.length ? `Oggi: ${plural(q.due.length, "ripasso", "ripassi")} e ${plural(q.fresh.length, "persona nuova", "persone nuove")}.` : filled ? "Per oggi hai finito i ripassi." : "Comincia dalle coppie 00-09."}</p>
      <div class="mem-actions"><button type="button" class="primary-action" data-m="pao-go" ${q.due.length + q.fresh.length ? "" : "disabled"}>Allenati con persone e azioni</button></div>
      <p class="mem-small">Si salva mentre scrivi. Le iniziali del sistema Dominic sono solo un aiuto; l'oggetto è la tua immagine del sistema fonetico.</p>
      ${groups.map((codes, gi) => `<details class="mem-pao-group" ${gi === 0 && filled < 10 ? "open" : ""}><summary>${codes[0]}-${codes[9]} <span>${codes.filter((c) => l.systems.pao[c] && l.systems.pao[c].p && l.systems.pao[c].a).length}/10</span></summary>
        <div class="mem-pao-rows">${codes.map((c) => { const x = l.systems.pao[c] || { p: "", a: "" }; const m = E.MAJOR.find((y) => y.code === c); return `<div class="mem-pao-row"><b>${c}</b><em title="Iniziali (sistema Dominic)">${E.dominic(c)}</em><input type="text" maxlength="60" placeholder="Persona" value="${esc(x.p)}" data-pao="${c}" data-f="p" aria-label="Persona per ${c}"><input type="text" maxlength="60" placeholder="Azione" value="${esc(x.a)}" data-pao="${c}" data-f="a" aria-label="Azione per ${c}"><span title="Oggetto (sistema fonetico)">${esc(m ? m.word : "")}</span></div>`; }).join("")}</div></details>`).join("")}
      <div class="mem-pao-try"><label class="mem-field">Prova un numero <input type="text" inputmode="numeric" maxlength="24" id="memPaoTry" placeholder="Es. 151434" autocomplete="off"></label><div id="memPaoStory" aria-live="polite"></div></div></div>`;
  };
  function paoStoryHtml(digits) {
    const l = lab();
    const list = E.paoStory(l, digits);
    if (!list.length) return "";
    return `<ol class="mem-pao-story">${list.map((x) => `<li><b>${esc(x.digits)}</b><span>${x.person ? esc(x.person) : "<i>persona?</i>"} ${x.action ? esc(x.action) : "<i>azione?</i>"} ${x.object ? `con ${esc(x.object)}` : x.digits.length >= 5 ? "<i>oggetto?</i>" : ""}</span></li>`).join("")}</ol>`;
  }
  function startPao(source = "technique") {
    const l = lab();
    const q = E.paoQueue(l);
    const codes = E.shuffle(q.due).concat(q.fresh);
    if (!codes.length) { announce("Persone e azioni: niente da fare oggi"); render(true); return; }
    K.stopTimers();
    ui.run = { type: "pao", queue: codes, idx: 0, shown: false, counts: { 1: 0, 2: 0, 3: 0, 4: 0 }, source };
    render(true);
  }
  function paoView() {
    const r = ui.run;
    const l = lab();
    const head = `${backBar("← Fine")}<div class="mem-run-head"><span class="mem-kicker">Persona, azione, oggetto</span><span>${Math.min(r.idx + 1, r.queue.length)}/${r.queue.length}</span></div>`;
    if (r.idx >= r.queue.length) return `${head}<article class="mem-card"><h2 data-focus tabindex="-1">Finito</h2><p>${r.counts[3] + r.counts[4]} bene, ${r.counts[2]} difficili, ${r.counts[1]} da rivedere.</p><div class="mem-actions"><button type="button" class="primary-action" data-m="exit" data-autofocus>Torna</button></div></article>`;
    const code = r.queue[r.idx];
    const x = l.systems.pao[code];
    const m = E.MAJOR.find((y) => y.code === code);
    const pv = S.preview(x.st, Date.now(), E.retentionOf(l));
    return `${head}<article class="mem-card mem-flash">
      <p class="mem-hint">Chi è e cosa fa?</p>
      <div class="mem-flash-q mem-pao-q">${code}<small>${E.dominic(code)}</small></div>
      ${r.shown ? `<div class="mem-flash-a" role="status"><strong>${esc(x.p)} · ${esc(x.a)}</strong><span>Oggetto: ${esc(m ? m.word : "")}</span></div><div class="mem-grades" role="group" aria-label="Quanto l'hai ricordata?">${[1, 2, 3, 4].map((g) => `<button type="button" class="mem-grade g${g}" data-m="pao-grade" data-g="${g}"><kbd>${g}</kbd><strong>${GRADE_LABEL[g]}</strong><span>${esc(S.label(pv[g]))}</span></button>`).join("")}</div>`
        : `<div class="mem-actions"><button type="button" class="primary-action" data-m="pao-show" data-autofocus>Mostra</button></div>`}
    </article>`;
  }
  K.views.pao = paoView;
  K.actions["pao-go"] = () => startPao(ui.tab === "course" ? "course" : "technique");
  K.actions["pao-show"] = () => { if (ui.run) { ui.run.shown = true; render(true); } };
  K.actions["pao-grade"] = (el) => {
    const r = ui.run;
    if (!r || !r.shown) return;
    const g = Number(el.dataset.g);
    const l = lab();
    const code = r.queue[r.idx];
    E.paoAnswer(l, code, g);
    r.counts[g] += 1;
    r.combo = g >= 2 ? (r.combo || 0) + 1 : 0;
    if (g === 1 && r.queue.filter((c) => c === code).length < 3) r.queue.push(code);
    r.idx += 1;
    r.shown = false;
    if (r.idx >= r.queue.length) E.logActivity(l, "sys:pao", Date.now(), { score: r.counts[3] + r.counts[4], max: Object.values(r.counts).reduce((a, b) => a + b, 0) });
    save();
    render(true);
  };

  /* ------------------------------------------------------------ Usala: applicazioni */
  function toolCard(tool, l) {
    const [kind, arg] = tool.split(":");
    if (kind === "deck") {
      if (arg === "openings") {
        const d = l.decks.find((x) => x.name === "Aperture: le prime mosse");
        return `<li><strong>Aperture: le prime mosse</strong><span>${C.OPENINGS.length} schede: nome dell'apertura → mosse e idea.</span>${d ? `<button type="button" class="ghost-action small" data-m="deck-goto" data-id="${d.id}">Apri</button>` : `<button type="button" class="primary-action small" data-m="starter" data-id="openings">Aggiungi</button>`}</li>`;
      }
      const d = l.decks.find((x) => x.kind === arg);
      const kk = E.DECK_KINDS[arg];
      return `<li><strong>Mazzo ${esc(kk.label)}</strong><span>${d ? `${plural(d.cards.length, "scheda", "schede")} · ${E.deckStats(d).due} da ripassare` : `${esc(kk.front)} → ${esc(kk.back.toLowerCase())}`}</span><button type="button" class="${d ? "ghost-action" : "primary-action"} small" data-m="tool-deck" data-kind="${arg}">${d ? "Apri" : "Crea"}</button></li>`;
    }
    if (kind === "import") return `<li><strong>Incolla le domande</strong><span>Da un foglio o dagli appunti: domanda | risposta, una per riga.</span><button type="button" class="ghost-action small" data-m="tool-deck" data-kind="qa">Apri</button></li>`;
    if (kind === "text") {
      if (arg) {
        const s = C.TEXTS.find((x) => x.id === arg);
        return `<li><strong>${esc(s.title)}</strong><span>${esc(s.note || "Da sapere parola per parola.")}</span><button type="button" class="ghost-action small" data-m="text-sample" data-id="${arg}">Apri</button></li>`;
      }
      return `<li><strong>Testi a memoria</strong><span>${l.texts.length ? plural(l.texts.length, "testo", "testi") : "Poesie, articoli, discorsi: iniziali, cancellazione progressiva, richiamo."}</span><button type="button" class="ghost-action small" data-m="texts-list">Apri</button></li>`;
    }
    if (kind === "chess") {
      const c = l.chessDrills[arg];
      const best = c && c.best ? ` · record ${Math.round(c.best.pct * 100)}%${c.best.ms ? ` in ${fmtSec(c.best.ms / 1000)}` : ""}` : "";
      const line = arg === "colors" ? "Chiara o scura? Venti case contro il tempo." : arg === "knight" ? "In quante mosse il cavallo arriva da una casa all'altra." : "Una posizione vista per pochi secondi, poi le domande.";
      return `<li><strong>${esc(E.CHESS_DRILLS[arg])}</strong><span>${esc(line)}${esc(best)}</span><button type="button" class="primary-action small" data-m="chess-go" data-drill="${arg}">Inizia</button></li>`;
    }
    if (kind === "life") {
      const d = E.LIFE_DRILLS[arg];
      return `<li><strong>${esc(d.label)}</strong><span>${arg === "phone" ? "Dieci cifre in un minuto." : "Dodici cose da comprare in un minuto e mezzo."}</span><button type="button" class="primary-action small" data-m="life-go" data-drill="${arg}">Inizia</button></li>`;
    }
    return "";
  }
  function appsHome() {
    return `<div class="mem-apps">
      <div class="mem-intro"><h2 data-focus tabindex="-1">Usa la memoria</h2><p>Le tecniche servono se finiscono dove ti servono: lo studio, gli scacchi, le lingue, il pianoforte, le persone che incontri. Ogni area ha le lezioni con le fonti e gli strumenti già collegati al ripasso.</p></div>
      <ul class="mem-area-list">${C.AREAS.map((a) => `<li><button type="button" data-m="area" data-id="${a.id}"><strong>${esc(a.title)}</strong><span>${esc(a.line)}</span></button></li>`).join("")}</ul>
    </div>`;
  }
  function areaView(id) {
    const a = C.AREAS.find((x) => x.id === id);
    if (!a) { ui.area = null; return appsHome(); }
    const l = lab();
    return `<div class="mem-apps">
      <div class="mem-back"><button type="button" class="ghost-action small" data-m="area-back">← Tutte le aree</button></div>
      <article class="mem-card"><span class="mem-kicker">Usala</span><h2 data-focus tabindex="-1">${esc(a.title)}</h2><p class="mem-lead">${esc(a.line)}</p>
        <h3>Strumenti</h3><ul class="mem-tools">${a.tools.map((t) => toolCard(t, l)).join("")}</ul></article>
      ${a.lessons.map((lid, i) => { const ls = E.lessonById(lid); return ls ? `<details class="mem-card mem-lesson" ${i === 0 ? "open" : ""}><summary><span class="mem-kicker">Lezione</span><strong>${esc(ls.title)}</strong></summary>${lessonBody(ls)}</details>` : ""; }).join("")}
    </div>`;
  }
  function textsList() {
    const l = lab();
    const back = ui.area ? "← Torna all'area" : "← Usala";
    return `<div class="mem-apps">
      <div class="mem-back"><button type="button" class="ghost-action small" data-m="texts-back">${back}</button></div>
      <article class="mem-card"><span class="mem-kicker">Testi a memoria</span><h2 data-focus tabindex="-1">I tuoi testi</h2>
        ${l.texts.length ? `<ul class="mem-decks">${l.texts.map((t) => { const best = E.textBest(t); return `<li><div><strong>${esc(t.title)}</strong><span>${plural(E.textWordsFlat(t.body).length, "parola", "parole")}${best != null ? ` · migliore richiamo ${best}%` : ""}${t.st ? ` · ${t.st.due <= Date.now() ? "da recitare oggi" : `prossimo ${dateShort(t.st.due)}`}` : ""}</span></div><button type="button" class="ghost-action small" data-m="text-open" data-id="${t.id}">Apri</button></li>`; }).join("")}</ul>` : `<p class="mem-empty">Nessun testo. Prendine uno qui sotto o scrivi il tuo.</p>`}
        <h3>Da dove partire</h3>
        <ul class="mem-tools">${C.TEXTS.map((s) => `<li><strong>${esc(s.title)}</strong><span>${plural(E.textWordsFlat(s.body).length, "parola", "parole")}</span><button type="button" class="ghost-action small" data-m="text-sample" data-id="${s.id}">${l.texts.some((t) => t.sample === s.id) ? "Apri" : "Aggiungi"}</button></li>`).join("")}</ul>
      </article>
      <form class="mem-card" id="memTextNew"><h3>Un testo tuo</h3>
        <label class="mem-field">Titolo <input type="text" id="memTextTitle" maxlength="80" placeholder="Es. Discorso di sabato, Art. 2043 c.c."></label>
        <label class="mem-field">Testo <textarea id="memTextBody" rows="7" maxlength="4000" placeholder="Incolla il testo, a righe come vuoi impararlo"></textarea></label>
        <div class="mem-actions"><button type="submit" class="primary-action small">Aggiungi</button></div>
      </form>
    </div>`;
  }
  const TEXT_MODES = [
    { id: "read", label: "Leggi e capisci" },
    { id: "initials", label: "Iniziali" },
    { id: "mask25", label: "Un quarto nascosto", share: 0.25 },
    { id: "mask50", label: "Metà nascosta", share: 0.5 },
    { id: "mask75", label: "Tre quarti nascosti", share: 0.75 },
    { id: "full", label: "Richiamo completo" }
  ];
  function textView(id) {
    const l = lab();
    const t = l.texts.find((x) => x.id === id);
    if (!t) { ui.textOpen = null; return textsList(); }
    const st = ui.textStage && ui.textStage.id === id ? ui.textStage : (ui.textStage = { id, mode: suggestMode(t), revealed: new Set(), result: null });
    const lines = E.textLines(t.body);
    const back = ui.returnTab === "course" ? "← Torna al percorso" : ui.returnTab === "today" ? "← Torna a Oggi" : "← I tuoi testi";
    const ch = st.challenge || null;
    let body = "";
    let flat = 0;
    if (st.mode === "read") {
      body = `<div class="mem-text">${lines.map((ws) => `<p>${ws.map(esc).join(" ")}</p>`).join("")}</div><p class="mem-small">Leggi ad alta voce, blocco per blocco: di cosa parla, cosa vuole dire ogni frase. Dai a ogni blocco un'immagine.</p>${t.sample === "opera" ? `<p class="mem-small">${esc(C.TEXTS.find((x) => x.id === "opera").note)}</p>` : ""}<div class="mem-actions"><button type="button" class="primary-action" data-m="text-done">Ho capito il senso</button></div>`;
    } else if (st.mode === "initials") {
      body = `<div class="mem-text initials">${lines.map((ws, li) => `<p><button type="button" class="mem-text-line ${st.revealed.has(li) ? "open" : ""}" data-m="text-line" data-i="${li}" aria-label="Riga ${li + 1}: ${st.revealed.has(li) ? "mostrata" : "tocca per vederla"}">${st.revealed.has(li) ? ws.map(esc).join(" ") : ws.map((w) => esc(E.initials(w))).join(" ")}</button></p>`).join("")}</div><p class="mem-small">Ricostruisci ogni riga a voce dalle iniziali; tocca una riga solo se ti blocchi.</p><div class="mem-actions"><button type="button" class="primary-action" data-m="text-done">Finito</button></div>`;
    } else if (st.mode.startsWith("mask")) {
      const share = TEXT_MODES.find((m) => m.id === st.mode).share;
      const total = E.textWordsFlat(t.body).length;
      const hidden = E.maskedSet(total, share, (t.created % 100000) + 7);
      body = `<div class="mem-text masked">${lines.map((ws) => `<p>${ws.map((w) => { const k = flat; flat += 1; if (!hidden.has(k)) return esc(w); const open = st.revealed.has(k); return `<button type="button" class="mem-blank ${open ? "open" : ""}" data-m="text-word" data-i="${k}" aria-label="${open ? esc(w) : "parola nascosta"}">${open ? esc(w) : "&nbsp;".repeat(Math.max(3, Math.min(12, w.length)))}</button>`; }).join(" ")}</p>`).join("")}</div><p class="mem-small">Recita il testo a voce riempiendo i buchi; tocca un buco solo se non ti viene. Nascoste ${hidden.size} parole su ${total}.</p><div class="mem-actions"><button type="button" class="primary-action" data-m="text-done">Finito</button></div>`;
    } else if (st.result) {
      const r = st.result;
      body = `<div class="mem-big"><strong>${r.pct}%</strong><span>${r.correct} parole su ${r.total}</span></div>${ch ? `<p class="mem-feedback-line ${r.pct >= ch.target ? "ok" : "ko"}">${r.pct >= ch.target ? `Sfida superata: terza stella al piano ${ch.day}.` : `Sfida: serve il ${ch.target}%, hai fatto il ${r.pct}%. Ripassa con le parole nascoste e riprova.`}</p>` : ""}<div class="mem-text check">${(() => { let k = 0; return lines.map((ws) => `<p>${ws.map(() => { const x = r.words[k]; k += 1; return `<span class="${x.ok ? "ok" : "ko"}">${esc(x.w)}</span>`; }).join(" ")}</p>`).join(""); })()}</div>
        <p>${r.grade ? `Voto per il ripasso: ${GRADE_LABEL[r.grade].toLowerCase()}. ` : ""}${t.st ? `Da recitare di nuovo ${dueLabel(t.st.due)}.` : ""}</p>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="text-again">Riprova</button><button type="button" class="ghost-action" data-m="text-mode" data-mode="mask50">Torna alla metà nascosta</button></div>`;
    } else {
      body = `${ch ? `<p class="mem-tip">Sfida del piano ${ch.day}: il testo intero con almeno il ${ch.target}% delle parole.</p>` : ""}<p class="mem-hint">Scrivi il testo a memoria, come lo ricordi. Punteggiatura e maiuscole non contano.</p><textarea id="memTextRecall" rows="8" autocomplete="off" autocapitalize="sentences" spellcheck="false" data-autofocus></textarea><div class="mem-actions"><button type="button" class="primary-action" data-m="text-check">Controlla</button></div>`;
    }
    const runs = t.runs.slice(-5).reverse();
    return `<div class="mem-apps">
      <div class="mem-back"><button type="button" class="ghost-action small" data-m="text-back">${back}</button></div>
      <article class="mem-card mem-textcard"><span class="mem-kicker">Testo a memoria</span><h2 data-focus tabindex="-1">${esc(t.title)}</h2>
        <ol class="mem-seg mem-text-modes" aria-label="Passi">${TEXT_MODES.map((m) => `<li><button type="button" data-m="text-mode" data-mode="${m.id}" aria-pressed="${m.id === st.mode}">${esc(m.label)}</button></li>`).join("")}</ol>
        ${body}
        ${runs.length ? `<p class="mem-small">Ultimi giri: ${runs.map((x) => `${TEXT_MODES.find((m) => m.id === x.mode) ? TEXT_MODES.find((m) => m.id === x.mode).label.toLowerCase() : x.mode} ${x.mode === "read" ? "" : `${x.pct}%`} (${dateShort(x.t)})`).join(" · ")}</p>` : ""}
        <div class="mem-actions"><button type="button" class="ghost-action small" data-m="text-del" data-id="${t.id}" data-confirm="">Elimina il testo</button></div>
      </article>
    </div>`;
  }
  // il passo da cui ripartire: quello dopo l'ultimo fatto bene
  function suggestMode(t) {
    const last = t.runs[t.runs.length - 1];
    if (!last) return "read";
    if (t.st && t.st.due <= Date.now()) return "full";
    const order = TEXT_MODES.map((m) => m.id);
    const i = order.indexOf(last.mode);
    if (i < 0) return "read";
    if (last.mode === "full") return last.pct >= 90 ? "full" : "mask75";
    return last.mode === "read" || last.pct >= 85 ? order[Math.min(i + 1, order.length - 1)] : last.mode;
  }
  function textDone() {
    const l = lab();
    const st = ui.textStage;
    const t = l.texts.find((x) => x.id === st.id);
    if (!t) return;
    let pct = 100;
    if (st.mode === "initials") pct = Math.round(100 - (st.revealed.size / Math.max(1, E.textLines(t.body).length)) * 100);
    else if (st.mode.startsWith("mask")) {
      const share = TEXT_MODES.find((m) => m.id === st.mode).share;
      const hidden = Math.max(1, Math.round(share * E.textWordsFlat(t.body).length));
      pct = Math.round(100 - (st.revealed.size / hidden) * 100);
    }
    E.recordTextRun(l, t.id, st.mode, pct);
    save();
    const order = TEXT_MODES.map((m) => m.id);
    ui.textStage = { id: t.id, mode: pct >= 85 || st.mode === "read" ? order[Math.min(order.indexOf(st.mode) + 1, order.length - 1)] : st.mode, revealed: new Set(), result: null };
    announce(st.mode === "read" ? "Passo fatto" : `${pct}%: ${pct >= 85 ? "passa al passo dopo" : "rifai questo passo"}`);
    render(true);
  }
  function textCheck() {
    const l = lab();
    const st = ui.textStage;
    const t = l.texts.find((x) => x.id === st.id);
    const box = K.$("memTextRecall");
    if (!t || !box) return;
    const res = E.scoreText(t.body, box.value);
    const rec = E.recordTextRun(l, t.id, "full", res.pct, Date.now(), st.challenge ? { ch: st.challenge.day, tg: st.challenge.target } : null);
    save();
    st.result = { ...res, grade: rec ? rec.grade : null };
    render(true);
  }
  K.tabs.apps = () => (ui.textOpen === "list" ? textsList() : ui.textOpen ? textView(ui.textOpen) : ui.area ? areaView(ui.area) : appsHome());
  K.actions.area = (el) => { ui.area = el.dataset.id; render(true); };
  K.actions["area-back"] = () => { ui.area = null; render(true); };
  K.actions["tool-deck"] = (el) => { const l = lab(); const d = deckOfKind(l, el.dataset.kind, true); save(); ui.returnTab = "apps"; ui.tab = "review"; ui.deckOpen = d.id; render(true); };
  K.actions["deck-goto"] = (el) => { ui.returnTab = "apps"; ui.tab = "review"; ui.deckOpen = el.dataset.id; render(true); };
  K.actions["texts-list"] = () => { ui.textOpen = "list"; render(true); };
  K.actions["texts-back"] = () => { ui.textOpen = null; render(true); };
  K.actions["text-sample"] = (el) => { const l = lab(); const t = E.addSampleText(l, el.dataset.id); save(); ui.tab = "apps"; ui.textOpen = t.id; render(true); };
  K.actions["text-open"] = (el) => { ui.tab = "apps"; ui.textOpen = el.dataset.id; render(true); };
  K.actions["text-back"] = () => { if (ui.returnTab) { ui.tab = ui.returnTab; ui.returnTab = null; ui.textOpen = null; } else ui.textOpen = "list"; ui.textStage = null; render(true); };
  K.actions["text-mode"] = (el) => { ui.textStage = { id: ui.textOpen, mode: el.dataset.mode, revealed: new Set(), result: null }; render(true); };
  K.actions["text-line"] = (el) => { const st = ui.textStage; const i = Number(el.dataset.i); if (st.revealed.has(i)) st.revealed.delete(i); else st.revealed.add(i); render(false, true); };
  K.actions["text-word"] = (el) => { const st = ui.textStage; st.revealed.add(Number(el.dataset.i)); render(false, true); };
  K.actions["text-done"] = textDone;
  K.actions["text-check"] = textCheck;
  K.actions["text-again"] = () => { const prev = ui.textStage; ui.textStage = { id: ui.textOpen, mode: "full", revealed: new Set(), result: null, challenge: prev && prev.challenge ? prev.challenge : null }; render(true); };
  // sfida della Torre su un testo: richiamo completo con la percentuale che serve
  K.startTextChallenge = (sampleId, challenge, source) => {
    const l = lab();
    const t = E.addSampleText(l, sampleId) || l.texts[0];
    if (!t) return;
    save();
    K.stopTimers();
    ui.run = null;
    ui.tab = "apps";
    ui.area = null;
    ui.textOpen = t.id;
    ui.returnTab = source === "course" || source === "today" ? source : null;
    ui.textStage = { id: t.id, mode: "full", revealed: new Set(), result: null, challenge };
    render(true);
  };
  K.lessonBody = lessonBody;
  K.dueLabel = dueLabel;
  K.actions["text-del"] = (el) => {
    if (el.dataset.confirm !== "1") { el.dataset.confirm = "1"; el.textContent = "Conferma: elimina il testo"; return; }
    const l = lab();
    E.removeText(l, el.dataset.id);
    save();
    ui.textOpen = "list";
    render(true);
  };
  K.soft.push("text-line", "text-word");
  K.actions["life-go"] = (el) => { const l = lab(); const d = E.LIFE_DRILLS[el.dataset.drill]; K.startRound(E.makeRound(d.key, 0, Date.now(), l, { n: d.n, mem: d.mem, list: d.list || null, life: el.dataset.drill }), "apps"); };

  /* ------------------------------------------------------------ scacchi */
  // pezzi del set «Classico» della pagina scacchi (cburnett, assets/pieces)
  const pieceSrc = (p) => `assets/pieces/cburnett/${p === p.toUpperCase() ? "w" : "b"}${p.toUpperCase()}.svg`;
  function boardSvg(fen, { label = "Scacchiera" } = {}) {
    const board = E.parseFen(fen) || {};
    const sq = 40;
    const m = 18;
    let out = `<svg class="mem-board" viewBox="0 0 ${sq * 8 + m} ${sq * 8 + m}" role="img" aria-label="${esc(label)}">`;
    for (let r = 7; r >= 0; r -= 1) {
      for (let f = 0; f < 8; f += 1) {
        const x = m + f * sq;
        const y = (7 - r) * sq;
        const name = E.squareName(f, r);
        out += `<rect x="${x}" y="${y}" width="${sq}" height="${sq}" class="${E.isLight(name) ? "lt" : "dk"}"/>`;
        const p = board[name];
        if (p) out += `<image href="${pieceSrc(p)}" x="${x + 1}" y="${y + 1}" width="${sq - 2}" height="${sq - 2}"/>`;
      }
      out += `<text x="${m / 2}" y="${(7 - r) * sq + sq / 2 + 4}" text-anchor="middle" class="co">${r + 1}</text>`;
    }
    for (let f = 0; f < 8; f += 1) out += `<text x="${m + f * sq + sq / 2}" y="${sq * 8 + 13}" text-anchor="middle" class="co">${"abcdefgh"[f]}</text>`;
    return `${out}</svg>`;
  }
  let FENS = null;
  function realFens() {
    if (FENS) return FENS;
    const out = [];
    const walk = (o) => { if (!o || typeof o !== "object") return; if (Array.isArray(o)) { o.forEach(walk); return; } if (typeof o.fen === "string") out.push(o.fen); Object.values(o).forEach(walk); };
    try { if (window.ChessLessons) { walk(window.ChessLessons.LESSONS); walk(window.ChessLessons.PATTERN_LESSONS); } } catch (e) { /* niente */ }
    const count = (f) => f.split(" ")[0].replace(/[^a-zA-Z]/g, "").length;
    FENS = [...new Set(out)].filter((f) => count(f) >= 12 && E.parseFen(f) && Object.values(E.parseFen(f)).includes("k"));
    if (!FENS.length) FENS = ["r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4"];
    return FENS;
  }
  // challenge = sfida della Torre { day, target, maxMs?, secs? }
  function startChess(drill, source = "apps", challenge = null) {
    K.stopTimers();
    const seed = Date.now();
    if (drill === "colors") ui.run = { type: "chess", drill, items: E.colorsRound(seed, 20), idx: 0, ok: 0, start: Date.now(), last: null, source, phase: "play", challenge };
    else if (drill === "knight") ui.run = { type: "chess", drill, items: E.knightRound(seed, 10), idx: 0, ok: 0, start: Date.now(), last: null, source, phase: "play", challenge };
    else {
      const fens = realFens();
      const fen = fens[Math.floor(Math.random() * fens.length)];
      ui.run = { type: "chess", drill: "flash", fen, qs: E.flashQuestions(fen, seed), answers: [], idx: 0, ok: 0, secs: challenge && challenge.secs ? challenge.secs : ui.flashSecs || 10, source, phase: "intro", start: Date.now(), challenge };
    }
    render(true);
  }
  const chessExtra = (r) => (r.challenge ? { ch: r.challenge.day, tg: r.challenge.target, ...(r.challenge.maxMs ? { maxMs: r.challenge.maxMs } : {}) } : null);
  function chessChallengeLine(r, total, ms) {
    const c = r.challenge;
    if (!c) return "";
    const fast = !c.maxMs || ms <= c.maxMs;
    const won = r.ok >= c.target && fast;
    return `<p class="mem-feedback-line ${won ? "ok" : "ko"}">${won ? `Sfida superata: terza stella al piano ${c.day}.` : r.ok < c.target ? `Sfida: servono ${c.target} su ${total}, ne hai fatte ${r.ok}.` : `Sfida: tutto giusto ma in ${fmtSec(ms / 1000)}; il limite è ${fmtSec(c.maxMs / 1000)}.`}</p>`;
  }
  K.startChess = startChess;
  function chessView() {
    const r = ui.run;
    const title = E.CHESS_DRILLS[r.drill];
    const head = `${backBar("← Esci")}<div class="mem-run-head"><span class="mem-kicker">${esc(title)}</span><span>${r.phase === "play" ? `${Math.min(r.idx + 1, r.items.length)}/${r.items.length}${r.challenge && r.challenge.maxMs ? ` · ${fmtSec((Date.now() - r.start) / 1000)} di ${fmtSec(r.challenge.maxMs / 1000)}` : ""}` : ""}</span></div>`;
    if (r.phase === "done") {
      const total = r.drill === "flash" ? r.qs.length : r.items.length;
      const c = lab().chessDrills[r.drill];
      return `${head}<article class="mem-card mem-result"><div class="mem-big"><strong>${r.ok}</strong><span>su ${total}</span></div><div>
        <h2 data-focus tabindex="-1">${r.ok === total ? "Tutto giusto" : r.ok >= total * 0.8 ? "Bene" : "Da rifare"}</h2>
        <p>${r.drill === "flash" ? `Hai guardato la posizione per ${r.secs} secondi.` : `In ${fmtSec((r.end - r.start) / 1000)}.`}${c && c.best ? ` Record: ${Math.round(c.best.pct * 100)}%${r.drill !== "flash" && c.best.ms ? ` in ${fmtSec(c.best.ms / 1000)}` : ""}.` : ""}</p>
        ${chessChallengeLine(r, total, r.drill === "flash" ? 0 : r.end - r.start)}
        ${r.drill === "flash" ? `${boardSvg(r.fen, { label: "La posizione" })}<ol class="mem-flash-check">${r.qs.map((q, i) => `<li class="${r.answers[i] && r.answers[i].ok ? "ok" : "ko"}">${esc(q.prompt)} <b>${esc(q.answer)}</b>${r.answers[i] && !r.answers[i].ok ? ` <em>tu: ${esc(r.answers[i].value || "—")}</em>` : ""}</li>`).join("")}</ol>` : ""}
        <div class="mem-actions">${r.challenge ? `<button type="button" class="primary-action" data-m="ch-go" data-day="${r.challenge.day}" data-autofocus>Riprova la sfida</button>` : `<button type="button" class="primary-action" data-m="chess-go" data-drill="${r.drill}" data-autofocus>Un altro giro</button>`}<button type="button" class="ghost-action" data-m="exit">${r.source === "course" ? "Torna al percorso" : "Torna"}</button></div></div></article>`;
    }
    if (r.drill === "colors") {
      const it = r.items[r.idx];
      return `${head}<article class="mem-card mem-run mem-chess-q"><p class="mem-hint">Di che colore è la casa?</p><div class="mem-chess-sq">${it.sq}</div>
        <div class="mem-options two"><button type="button" class="mem-option" data-m="chess-color" data-v="1"><kbd>←</kbd>Chiara</button><button type="button" class="mem-option" data-m="chess-color" data-v="0"><kbd>→</kbd>Scura</button></div>
        ${r.last ? `<p class="mem-feedback-line ${r.last.ok ? "ok" : "ko"}" role="status">${r.last.ok ? "Giusto" : `No: ${r.last.sq} è ${r.last.light ? "chiara" : "scura"}`}</p>` : ""}
        <p class="mem-small">Trucco: a1 è scura; la casa è chiara se colonna (a = 1, b = 2, …) più traversa fa un numero dispari.</p></article>`;
    }
    if (r.drill === "knight") {
      const it = r.items[r.idx];
      return `${head}<article class="mem-card mem-run mem-chess-q"><p class="mem-hint">In quante mosse il cavallo va da una casa all'altra?</p><div class="mem-chess-sq">${it.a} → ${it.b}</div>
        <div class="mem-options four">${[1, 2, 3, 4].map((n) => `<button type="button" class="mem-option" data-m="chess-knight" data-v="${n}"><kbd>${n}</kbd>${n}</button>`).join("")}</div>
        ${r.last ? `<p class="mem-feedback-line ${r.last.ok ? "ok" : "ko"}" role="status">${r.last.ok ? "Giusto" : `No: ${r.last.a} → ${r.last.b} sono ${r.last.d} mosse`}</p>` : ""}
        <p class="mem-small">Senza scacchiera: immagina il cavallo e i suoi salti a L.</p></article>`;
    }
    // posizione lampo
    if (r.phase === "intro") {
      return `${head}<article class="mem-card"><h2 data-focus tabindex="-1">Posizione lampo</h2><p>Vedrai una posizione da una lezione di scacchi per pochi secondi; poi ${r.qs.length} domande: cosa c'era in una casa, dov'era il re, quanti pedoni. I giocatori forti la ricordano per schemi (arrocco, catene di pedoni, pezzi che si difendono), non pezzo per pezzo.</p>
        ${r.challenge ? `<p class="mem-tip">Sfida del piano ${r.challenge.day}: ${r.challenge.target} risposte giuste guardando ${r.secs} secondi.</p>` : `<div class="mem-seg" role="group" aria-label="Secondi">${[20, 10, 5].map((n) => `<button type="button" data-m="flash-secs" data-v="${n}" aria-pressed="${r.secs === n}">${n} secondi</button>`).join("")}</div>`}
        <div class="mem-actions"><button type="button" class="primary-action" data-m="flash-go" data-autofocus>Comincia</button></div></article>`;
    }
    if (r.phase === "show") return `${head}<article class="mem-card mem-run"><div class="mem-run-timer">${K.stageTimer(Math.round((r.deadline - Date.now()) / 1000), r.secs)}</div>${boardSvg(r.fen, { label: "Posizione da ricordare" })}</article>`;
    const q = r.qs[r.idx];
    const a = r.answers[r.idx];
    const ask = q.kind === "what"
      ? `<div class="mem-options">${q.options.map((o, i) => `<button type="button" class="mem-option ${a ? (o === q.answer ? "right" : o === a.value ? "wrong" : "") : ""}" data-m="flash-pick" data-v="${esc(o)}" ${a ? "disabled" : ""}><kbd>${i + 1}</kbd>${esc(o)}</button>`).join("")}</div>`
      : `<input class="mem-major-input" id="memFlashInput" maxlength="${q.kind === "where" ? 2 : 2}" autocomplete="off" autocapitalize="none" ${q.kind === "count" ? 'inputmode="numeric"' : ""} ${a ? "disabled" : "data-autofocus"} value="${esc(a ? a.value : "")}" aria-label="${esc(q.prompt)}">${a ? "" : `<div class="mem-actions"><button type="button" class="primary-action" data-m="flash-type">Conferma</button></div>`}`;
    return `${head}<article class="mem-card mem-major-card"><p class="mem-hint">Domanda ${r.idx + 1} di ${r.qs.length}</p><h2 data-focus tabindex="-1">${esc(q.prompt)}</h2>${ask}
      ${a ? `<div class="mem-feedback ${a.ok ? "ok" : "ko"}" role="status"><strong>${a.ok ? "Giusto" : `No: ${esc(q.answer)}`}</strong><button type="button" class="primary-action" data-m="flash-next" data-autofocus>Avanti</button></div>` : ""}</article>`;
  }
  function chessAnswer(ok, info) {
    const r = ui.run;
    if (!r || r.phase !== "play") return;
    if (ok) r.ok += 1;
    r.last = { ok, ...info };
    r.idx += 1;
    if (r.idx >= r.items.length) {
      r.end = Date.now();
      r.phase = "done";
      E.recordChess(lab(), r.drill, r.ok, r.items.length, r.end - r.start, Date.now(), chessExtra(r));
      save();
      render(true);
      return;
    }
    render(false, true);
  }
  function flashAnswer(value) {
    const r = ui.run;
    if (!r || r.phase !== "ask" || r.answers[r.idx]) return;
    const q = r.qs[r.idx];
    const v = String(value || "").trim().toLowerCase();
    const ok = v === String(q.answer).toLowerCase();
    r.answers[r.idx] = { value: String(value || "").trim(), ok };
    if (ok) r.ok += 1;
    render(true);
  }
  K.views.chess = chessView;
  K.actions["chess-go"] = (el) => startChess(el.dataset.drill, ui.tab === "course" ? "course" : "apps");
  K.actions["chess-color"] = (el) => { const r = ui.run; const it = r.items[r.idx]; chessAnswer((el.dataset.v === "1") === it.light, it); };
  K.actions["chess-knight"] = (el) => { const r = ui.run; const it = r.items[r.idx]; chessAnswer(Number(el.dataset.v) === it.d, it); };
  K.actions["flash-secs"] = (el) => { ui.flashSecs = Number(el.dataset.v); ui.run.secs = ui.flashSecs; render(false, true); };
  K.actions["flash-go"] = () => {
    const r = ui.run;
    r.phase = "show";
    r.deadline = Date.now() + r.secs * 1000;
    render(true);
    const tick = setInterval(() => {
      if (ui.run !== r || r.phase !== "show") { clearInterval(tick); return; }
      const left = Math.round((r.deadline - Date.now()) / 1000);
      const bar = document.querySelector("#memPanel .mem-timer i");
      const txt = document.querySelector("#memPanel [data-mem-left]");
      if (bar) bar.style.width = `${Math.max(0, Math.min(100, (left / r.secs) * 100))}%`;
      if (txt) txt.textContent = fmtSec(Math.max(0, left));
      if (left <= 0) { clearInterval(tick); r.phase = "ask"; render(true); }
    }, 200);
    ui.timers.push(tick);
  };
  K.actions["flash-pick"] = (el) => flashAnswer(el.dataset.v);
  K.actions["flash-type"] = () => { const i = K.$("memFlashInput"); flashAnswer(i ? i.value : ""); };
  K.actions["flash-next"] = () => {
    const r = ui.run;
    r.idx += 1;
    if (r.idx >= r.qs.length) { r.phase = "done"; E.recordChess(lab(), "flash", r.ok, r.qs.length, r.secs * 1000, Date.now(), chessExtra(r)); save(); }
    render(true);
  };
  K.soft.push("chess-color", "chess-knight", "flash-secs");

  /* ------------------------------------------------------------ progressi */
  K.progressExtra = (l) => {
    const cs = E.courseStatus(l, Date.now(), false);
    const tr = E.trueRetention(l);
    const decks = l.decks.map((d) => ({ d, st: E.deckStats(d) }));
    const mature = decks.reduce((a, x) => a + x.st.mature, 0);
    const chess = Object.entries(l.chessDrills).filter(([, c]) => c.best);
    return `
      <section class="mem-card"><h3>Percorso</h3>${cs.started ? `<p>${cs.done ? "Completato." : `Giorno ${cs.day} di ${CO.LENGTH} (settimana ${cs.week.n}: ${esc(cs.week.title)}).`} ${Object.keys(l.course.finished).length} giornate fatte, iniziato il ${dateShort(l.course.start)}.</p>` : `<p class="mem-empty">Non ancora iniziato.</p>`}</section>
      ${cs.started ? reportTable(l) : ""}
      <section class="mem-card"><h3>Ripasso</h3><p>${plural(E.totalCards(l), "scheda", "schede")} in ${plural(l.decks.length, "mazzo", "mazzi")}, ${mature} imparate (stabili per almeno tre settimane). ${tr.n >= 5 ? `Ricordo vero negli ultimi 30 giorni: ${Math.round(tr.share * 100)}% su ${tr.n} ripassi.` : ""}</p>
        <p class="mem-small">Sistemi: ${E.majorLearned(l)}/100 immagini del fonetico, ${E.cardsSure(l)}/52 carte sicure, ${E.paoFilled(l)}/100 persone e azioni. Testi: ${l.texts.length}${l.texts.length ? `, migliori richiami ${l.texts.map((t) => E.textBest(t)).filter((x) => x != null).map((x) => `${x}%`).join(", ") || "—"}` : ""}.</p></section>
      ${chess.length ? `<section class="mem-card"><h3>Scacchi a memoria</h3><ul class="mem-plain">${chess.map(([k, c]) => `<li>${esc(E.CHESS_DRILLS[k])}: record ${Math.round(c.best.pct * 100)}%${k !== "flash" && c.best.ms ? ` in ${fmtSec(c.best.ms / 1000)}` : ""} · ${plural(c.runs.length, "giro", "giri")}</li>`).join("")}</ul></section>` : ""}`;
  };

  /* ------------------------------------------------------------ moduli e tasti */
  K.input = (event) => {
    const t = event.target;
    if (t.matches && t.matches("#memPanel input[data-pao]")) {
      const l = lab();
      const code = t.dataset.pao;
      const row = t.closest(".mem-pao-row");
      const p = row.querySelector('[data-f="p"]').value;
      const a = row.querySelector('[data-f="a"]').value;
      E.paoSet(l, code, p, a);
      if (typeof saveState === "function") saveState();
      const c = K.$("memPaoCount");
      if (c) c.textContent = String(E.paoFilled(l));
      // il pulsante per allenarsi si accende appena c'e' una coppia completa
      const go = document.querySelector('#memPanel [data-m="pao-go"]');
      if (go) { const q = E.paoQueue(l); go.disabled = !(q.due.length + q.fresh.length); }
      const g = t.closest(".mem-pao-group");
      const cnt = g && g.querySelector("summary span");
      if (cnt) cnt.textContent = `${[...g.querySelectorAll(".mem-pao-row")].filter((r) => { const x = l.systems.pao[r.querySelector("[data-pao]").dataset.pao]; return x && x.p && x.a; }).length}/10`;
      return true;
    }
    if (t.id === "memPaoTry") {
      const box = K.$("memPaoStory");
      if (box) box.innerHTML = paoStoryHtml(t.value);
      return true;
    }
    if (t.id === "memNewPerDay") {
      const l = lab();
      l.prefs.newPerDay = Number(t.value);
      save();
      return true;
    }
    if (t.matches && t.matches("[data-deck-ret]")) {
      const l = lab();
      const d = E.deckById(l, t.dataset.deckRet);
      if (d) { d.retention = t.value ? Number(t.value) : null; save(); }
      return true;
    }
    return false;
  };
  function onSubmit(event) {
    const f = event.target;
    if (!f || !f.id) return;
    const l = lab();
    if (f.id === "memDeckNew") {
      event.preventDefault();
      const kind = K.$("memDeckKind").value;
      const d = E.addDeck(l, { name: K.$("memDeckName").value, kind, lang: K.$("memDeckLang").value });
      save();
      if (d) { ui.deckOpen = d.id; render(true); }
    } else if (f.id === "memCardNew") {
      event.preventDefault();
      const c = E.addCard(l, f.dataset.deck, { f: K.$("memCardF").value, b: K.$("memCardB").value, x: K.$("memCardX").value });
      if (!c) { const m = K.$("memCardMsg"); if (m) m.textContent = "Scrivi davanti e dietro."; return; }
      save();
      render(false);
      const first = K.$("memCardF");
      if (first) first.focus();
      announce("Scheda aggiunta");
    } else if (f.id === "memTextNew") {
      event.preventDefault();
      const t = E.addText(l, { title: K.$("memTextTitle").value, body: K.$("memTextBody").value });
      if (!t) { announce("Incolla prima il testo"); return; }
      save();
      ui.textOpen = t.id;
      render(true);
    }
  }
  K.keys.push((event) => {
    const r = ui.run;
    const typing = event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
    // Invio e spazio su un pulsante fanno quello che dice il pulsante (anche «Difficile» scelto col tasto Tab)
    const onButton = event.target && event.target.tagName === "BUTTON";
    const confirmKey = (event.key === " " || event.key === "Enter") && !onButton;
    if (!r) return false;
    if (r.type === "deck") {
      if (!r.shown && event.key === "Enter" && !onButton) { revShow(); event.preventDefault(); return true; }
      if (r.shown && !typing && /^[1-4]$/.test(event.key)) { revGrade(Number(event.key)); event.preventDefault(); return true; }
      if (r.shown && !typing && confirmKey) { revGrade(3); event.preventDefault(); return true; }
    }
    if (r.type === "pao") {
      if (!r.shown && !typing && confirmKey) { r.shown = true; render(true); event.preventDefault(); return true; }
      if (r.shown && !typing && /^[1-4]$/.test(event.key)) { const b = document.querySelector(`#memPanel [data-m="pao-grade"][data-g="${event.key}"]`); if (b) b.click(); event.preventDefault(); return true; }
    }
    if (r.type === "cardsys" && r.q && !r.intro && !r.answered) {
      if (r.q.kind === "pick" && /^[1-4]$/.test(event.key) && !typing) { csAnswer(r.q.options[Number(event.key) - 1]); event.preventDefault(); return true; }
      if (r.q.kind === "type" && event.key === "Enter" && typing) { csAnswer(event.target.value); event.preventDefault(); return true; }
    }
    if (r.type === "chess" && r.phase === "play" && !typing) {
      if (r.drill === "colors" && (event.key === "ArrowLeft" || event.key === "ArrowRight")) { const it = r.items[r.idx]; chessAnswer((event.key === "ArrowLeft") === it.light, it); event.preventDefault(); return true; }
      if (r.drill === "knight" && /^[1-4]$/.test(event.key)) { const it = r.items[r.idx]; chessAnswer(Number(event.key) === it.d, it); event.preventDefault(); return true; }
    }
    if (r.type === "chess" && r.phase === "ask") {
      const q = r.qs[r.idx];
      if (q.kind === "what" && !r.answers[r.idx] && /^[1-4]$/.test(event.key) && !typing) { flashAnswer(q.options[Number(event.key) - 1]); event.preventDefault(); return true; }
      if (q.kind !== "what" && event.key === "Enter" && typing && !r.answers[r.idx]) { flashAnswer(event.target.value); event.preventDefault(); return true; }
    }
    return false;
  });

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.getElementById("memory");
    if (page) page.addEventListener("submit", onSubmit);
  });
})();
