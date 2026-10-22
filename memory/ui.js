/*
 * Progetto A - Memoria: la pagina (Oggi, Misura, Tecniche, Discipline, Progressi).
 * Motore: window.MemoryEngine (memory/engine.js). Volti: window.MemoryFaces. Stato: state.memoryLab.
 * Usa le globali di app.js: state, saveState, renderDashboard.
 */
(function () {
  "use strict";

  const E = window.MemoryEngine;
  const F = window.MemoryFaces;
  if (!E || !F) return;

  const ui = {
    tab: "today",     // today | measure | techniques | disciplines | progress
    technique: null,  // id della tecnica aperta
    palaceEdit: null, // { id } palazzo in modifica (id null = nuovo)
    run: null,        // esercizio in corso
    timers: [],
    tick: null,
    progKey: "digitF"
  };

  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const dateShort = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
  const dateLong = (t) => new Date(t).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const fmtSec = (s) => (s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : `${Math.round(s)} s`);

  function lab() {
    state.memoryLab = E.ensure(state.memoryLab);
    return state.memoryLab;
  }
  function save() {
    if (typeof saveState === "function") saveState();
    if (typeof renderDashboard === "function") renderDashboard();
    renderChip();
  }
  function announce(text) {
    const live = $("memLive");
    if (!live) return;
    live.textContent = "";
    setTimeout(() => { live.textContent = text; }, 30);
  }
  function after(ms, fn) {
    const id = setTimeout(() => { ui.timers = ui.timers.filter((t) => t !== id); fn(); }, ms);
    ui.timers.push(id);
    return id;
  }
  function stopTimers() {
    ui.timers.forEach(clearTimeout);
    ui.timers = [];
    if (ui.tick) { clearInterval(ui.tick); ui.tick = null; }
  }
  function stop() {
    stopTimers();
    ui.run = null;
  }

  /* ------------------------------------------------------------ testi */
  const TECHNIQUES = [
    {
      id: "chunk",
      title: "Raggruppare",
      line: "La memoria di lavoro tiene circa 4 blocchi: rendi ogni blocco più grande.",
      why: "La memoria a breve termine tiene pochi elementi alla volta: circa 4 blocchi di informazione secondo la rassegna di Nelson Cowan (2001); il famoso «7 più o meno 2» di Miller era una stima approssimativa. Il trucco è far diventare un blocco più grande: 1-9-4-5 sono quattro cifre, «1945» è una data sola. SF, uno studente qualunque seguito da Chase ed Ericsson, partì da uno span di 7 cifre e in circa due anni (oltre 250 ore di pratica) arrivò a 82, trasformando le cifre in tempi di corsa che conosceva. La sua memoria per le lettere invece restò quella di prima: si allena la tecnica, non la memoria in generale.",
      sources: [["Cowan 2001, Behavioral and Brain Sciences", "https://www.cambridge.org/core/journals/behavioral-and-brain-sciences/article/magical-number-4-in-shortterm-memory-a-reconsideration-of-mental-storage-capacity/44023F1147D4A1D44BDC0AD226838496"], ["Chase ed Ericsson 1982, Skill and working memory", "https://apps.dtic.mil/sti/pdfs/ADA114634.pdf"]],
      steps: ["Dividi le cifre a gruppi di 2, 3 o 4.", "Dai a ogni gruppo un significato: una data, un'ora, un prezzo, una persona.", "Ripeti i gruppi, non le cifre singole."],
      practice: { kind: "numbers", level: 2, note: "16 cifre: raggruppale come preferisci." }
    },
    {
      id: "story",
      title: "Storia",
      line: "Collega le parole in una scena assurda: una tira l'altra.",
      why: "Le parole concrete, che si possono immaginare, si ricordano meglio di quelle astratte, e una storia aggiunge l'ordine: ogni scena richiama la successiva. Più la scena è strana, esagerata e in movimento, più resta. È il primo passo verso il palazzo della memoria: la storia lega le immagini tra loro, il palazzo le lega a dei luoghi.",
      steps: ["Trasforma ogni parola in un'immagine precisa (non «albero»: «una quercia enorme»).", "Fai interagire la prima con la seconda in modo assurdo, poi la seconda con la terza.", "Per richiamarle, riparti dalla prima e segui la catena."],
      practice: { kind: "words", level: 2, note: "10 parole in ordine: costruisci una storia." }
    },
    {
      id: "loci",
      title: "Palazzo della memoria",
      line: "Metti le immagini in luoghi che conosci a memoria, poi ripercorrili.",
      why: "È il metodo dei loci, usato dagli oratori antichi e da quasi tutti i campioni di memoria. Nello studio di Dresler e colleghi (Neuron, 2017) 17 campioni di memoria ricordavano in media 70,8 parole su 72 (mostrate 2 secondi l'una), contro 39,9 di persone comuni. Poi persone comuni si sono allenate con questo metodo 30 minuti al giorno per 40 giorni: sono passate da circa 26-30 a 62 parole su 72, mentre chi aveva allenato la memoria di lavoro (n-back) ne guadagnava circa 11. Quattro mesi dopo ne ricordavano ancora più di 22 in più rispetto all'inizio.",
      sources: [["Dresler e colleghi 2017, Neuron", "https://pmc.ncbi.nlm.nih.gov/articles/PMC5439266/"]],
      steps: ["Scegli un percorso che conosci benissimo: casa tua, la strada per il lavoro.", "Fissa 10-20 luoghi in ordine (porta, attaccapanni, divano...). Sempre lo stesso ordine.", "Per memorizzare, metti un'immagine in ogni luogo, esagerata e in movimento.", "Per ricordare, cammina con la mente nel percorso e guarda cosa c'è in ogni luogo."],
      practice: { kind: "palace" }
    },
    {
      id: "major",
      title: "Sistema fonetico",
      line: "Ogni cifra è un suono: 00-99 diventano 100 immagini fisse.",
      why: "I numeri sono astratti e si dimenticano; le immagini no. Il sistema fonetico (in inglese «major system») converte le cifre in consonanti e le consonanti in parole: 34 = M+R = mare. Imparate le 100 immagini, un numero lungo diventa una serie di scene da mettere nel palazzo. Le vocali non contano, le doppie valgono una consonante sola e conta il suono, non la scrittura: «scia» è un suono solo (0), «scatola» sono due (0 e 7).",
      sources: [["Conversione fonetica, Wikipedia", "https://it.wikipedia.org/wiki/Conversione_fonetica"]],
      steps: ["Impara la tabella dei suoni: 0 S/Z, 1 T/D, 2 N/GN, 3 M, 4 R, 5 L, 6 C/G dolci, 7 C/G dure e Q, 8 F/V, 9 P/B.", "Impara le 100 immagini con il ripasso: 10 nuove al giorno, ripassi distanziati.", "Per un numero lungo: dividilo a coppie e metti ogni immagine in un luogo del palazzo."],
      practice: { kind: "major" }
    },
    {
      id: "faces",
      title: "Nomi e volti",
      line: "Un dettaglio del viso + un'immagine del nome, legati insieme.",
      why: "I nomi si dimenticano perché sono arbitrari: niente nel viso di Marco dice «Marco». La tecnica crea un legame: scegli un tratto evidente del volto (occhiali, sopracciglia, mento) e trasforma il nome in un'immagine (Marco → un marchio a fuoco, Rosa → una rosa). Poi metti l'immagine su quel tratto.",
      steps: ["Guarda il viso e scegli un tratto che salta all'occhio.", "Trasforma il nome in un oggetto o in una persona famosa con lo stesso nome.", "Immagina l'oggetto sul tratto scelto, in modo buffo.", "Ripeti il nome subito, ad alta voce o nella testa."],
      practice: { kind: "faces", level: 1, note: "4 volti con il nome." }
    },
    {
      id: "spacing",
      title: "Ripasso distanziato",
      line: "Ripassa quando stai per dimenticare, a distanze sempre più lunghe.",
      why: "Ripassare distanziato funziona meglio che ripassare tutto insieme: nella meta-analisi di Cepeda e colleghi (2006, 839 confronti) il ricordo finale era in media del 47% contro il 37%. E richiamare a memoria fissa più che rileggere: nell'esperimento di Roediger e Karpicke (2006), dopo una settimana chi si era interrogato ricordava il 56% del testo, chi l'aveva riletto il 42%. Il sistema fonetico qui e le schede della Cultura usano già questo metodo.",
      sources: [["Cepeda e colleghi 2006, Psychological Bulletin", "https://www.evullab.org/pdf/CepedaPashlerVulWixtedRohrer-PB-2006.pdf"], ["Roediger e Karpicke 2006, Psychological Science", "https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf"]],
      steps: ["Dopo aver imparato qualcosa, prova a richiamarlo senza guardare.", "Ripassa dopo 1 giorno, poi 2, 4, 8, 16, 32: se sbagli, si riparte da vicino.", "Pochi minuti al giorno battono un'ora una volta a settimana."],
      practice: null
    }
  ];

  const TEST_INFO = {
    digitF: "Ripeti le cifre nello stesso ordine. Misura quanto tieni a mente in un colpo solo.",
    digitB: "Ripeti le cifre al contrario. Misura la memoria di lavoro: tenere e manipolare.",
    corsiF: "Tocca i blocchi nello stesso ordine in cui si accendono. Memoria visuo-spaziale.",
    corsiB: "Tocca i blocchi al contrario. Memoria di lavoro visuo-spaziale.",
    words: "15 parole per 5 volte, poi una lista di disturbo e il richiamo dopo 20 minuti. Apprendimento e ricordo verbale."
  };

  /* ------------------------------------------------------------ pezzi comuni */
  function pctBar(c) {
    if (!c) return `<span class="mem-pct-none">Senza valori di riferimento</span>`;
    return `<span class="mem-pct" role="img" aria-label="${c.pct}° percentile: ${esc(c.label)}"><span class="mem-pct-band"></span><span class="mem-pct-mark" style="left:${c.pct}%"></span></span><span class="mem-pct-text"><b>${c.pct}°</b> percentile · ${esc(c.label)}</span>`;
  }
  // riga con media, deviazione standard, fonte e avvertenze del confronto
  function normLine(c) {
    if (!c) return "";
    const f = (v) => String(v).replace(".", ",");
    return `<p class="mem-small">Media di riferimento ${f(c.mean)} (deviazione standard ${f(c.sd)})${c.band ? `, fascia ${c.band.from}-${c.band.to} anni` : ""}. ${esc(c.source || "")}${c.url ? ` <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">Fonte</a>` : ""}${c.note ? `<br>${esc(c.note)}` : ""}</p>`;
  }
  function stageTimer(left, total) {
    const w = total ? Math.max(0, Math.min(100, (left / total) * 100)) : 0;
    return `<div class="mem-timer" aria-hidden="true"><i style="width:${w}%"></i></div><span class="mem-timer-text" data-mem-left>${fmtSec(Math.max(0, left))}</span>`;
  }
  function backBar(label = "← Indietro") {
    return `<div class="mem-back"><button type="button" class="ghost-action small" data-m="exit">${esc(label)}</button></div>`;
  }

  /* ------------------------------------------------------------ chip in alto */
  function renderChip() {
    const box = $("memChip");
    if (!box) return;
    const l = lab();
    const steps = E.plan(l);
    const left = steps.filter((s) => !s.done).length;
    const st = E.streak(l);
    const pending = E.delayedStatus(l);
    box.innerHTML = `<span class="mem-chip-num">${left}</span><span class="mem-chip-copy"><strong>${left ? `${plural(left, "passo", "passi")} oggi` : "Programma di oggi fatto"}</strong><span>${pending ? (pending.ready ? "Richiamo delle parole: adesso" : `Richiamo delle parole tra ${Math.max(1, Math.ceil((pending.readyAt - Date.now()) / 60000))} min`) : st ? `${plural(st, "giorno", "giorni")} di fila` : "Inizia oggi la serie"}</span></span>`;
  }

  /* ------------------------------------------------------------ OGGI */
  function todayView() {
    const l = lab();
    const steps = E.plan(l);
    const pending = E.delayedStatus(l);
    const done = steps.filter((s) => s.done).length;
    return `
      <div class="mem-today">
        <section class="mem-plan">
          <div class="mem-plan-head">
            <h2 data-focus tabindex="-1">Programma di oggi</h2>
            <span>${done}/${steps.length} fatti · circa ${steps.reduce((s, x) => s + x.minutes, 0)} minuti</span>
          </div>
          ${pending ? `<div class="mem-alert ${pending.ready ? "ready" : ""}"><strong>${pending.ready ? "Richiamo differito pronto" : "Richiamo differito in attesa"}</strong><span>${pending.ready ? (pending.late ? "Sono passati più di 45 minuti: puoi farlo lo stesso, ma non si confronta con i valori di riferimento." : "Scrivi le 15 parole della prima lista che ricordi ancora.") : `Torna tra ${Math.max(1, Math.ceil((pending.readyAt - Date.now()) / 60000))} minuti: intanto fai gli altri passi.`}</span>${pending.ready ? `<button type="button" class="primary-action" data-m="delayed">Fai il richiamo</button>` : ""}</div>` : ""}
          <ol class="mem-steps">
            ${steps.map((s) => `
              <li class="${s.done ? "done" : ""}">
                <span class="mem-step-mark" aria-hidden="true">${s.done ? "✓" : ""}</span>
                <div><strong>${esc(s.title)}</strong><span>${esc(s.detail)}</span></div>
                <span class="mem-step-min">${s.minutes} min</span>
                <button type="button" class="${s.done ? "ghost-action" : "primary-action"} small" data-m="go" data-go='${esc(JSON.stringify(s.go))}'>${s.done ? "Rifai" : "Inizia"}<span class="mem-sr">: ${esc(s.title)}</span></button>
              </li>`).join("")}
          </ol>
        </section>
        <aside class="mem-side">
          <h3>Profilo</h3>
          ${profileMini(l)}
          <h3 class="mem-side-how">Come funziona</h3>
          <p>Ogni giorno: le immagini del sistema fonetico, una disciplina da gara e il palazzo della memoria. Una volta al mese rifai i test per vedere se stai migliorando davvero.</p>
          <p>I test usano valori di riferimento pubblicati per adulti; le discipline usano le regole delle gare di memoria.</p>
          <p>Cosa aspettarti: le tecniche fanno crescere molto quello che alleni (parole, numeri, nomi). Allenare la memoria non rende più intelligenti in generale: le meta-analisi di Melby-Lervåg e colleghi (2013 e 2016) non trovano effetti oltre i compiti allenati.</p>
        </aside>
      </div>`;
  }
  // esagono del profilo, con gli stessi valori della scheda nel quadro
  function profileMini(l) {
    const skills = typeof getModuleSkills === "function" ? getModuleSkills("memory") : E.profile(l);
    const vals = skills.map((k) => ({ label: k.label, value: k.value }));
    const total = Math.round(vals.reduce((sum, k) => sum + k.value, 0) / Math.max(1, vals.length));
    const rank = typeof rankFromScore === "function" ? rankFromScore(total) : "";
    const svg = typeof buildRadarMarkup === "function" ? buildRadarMarkup(vals, 380, 190, 100, true) : "";
    return `<div class="mem-hex"><svg class="mem-hex-svg" viewBox="0 0 380 380" role="img" aria-label="Profilo della memoria: ${vals.map((k) => `${esc(k.label)} ${k.value}`).join(", ")}">${svg}</svg><div class="mem-hex-total"><strong>${total}</strong><span>punteggio della memoria${rank ? ` · rango ${rank}` : ""}</span></div></div>`;
  }

  /* ------------------------------------------------------------ MISURA */
  function measureView() {
    const l = lab();
    const pending = E.delayedStatus(l);
    const rows = ["digitF", "digitB", "corsiF", "corsiB"].map((key) => {
      const def = E.SPAN_TESTS[key];
      const last = E.lastTest(l, key);
      const c = last ? E.compare(key, last.value, l.profile) : null;
      return `
        <li>
          <div class="mem-test-name"><strong>${esc(def.label)}</strong><span>${esc(TEST_INFO[key])}</span></div>
          <div class="mem-test-val">${last ? `<b>${last.value}</b><span>span · ${dateShort(last.t)}</span>` : `<span>mai fatto</span>`}</div>
          <div class="mem-test-pct">${last ? pctBar(c) : ""}</div>
          <button type="button" class="${last ? "ghost-action" : "primary-action"} small" data-m="span" data-key="${key}">${last ? "Rifai" : "Fai il test"}<span class="mem-sr">: ${esc(def.label)}</span></button>
        </li>`;
    }).join("");
    const w = E.lastTest(l, "words");
    const wc = w ? E.compare("wordsTotal", w.value, l.profile) : null;
    const wd = w && num(w.delayed) && !w.late ? E.compare("wordsDelayed", w.delayed, l.profile) : null;
    return `
      <div class="mem-measure">
        <div class="mem-intro">
          <h2 data-focus tabindex="-1">Misura la tua memoria</h2>
          <p>Cinque prove classiche della neuropsicologia. Il risultato è confrontato con i valori di adulti sani pubblicati negli studi (fonti sotto): il percentile dice quante persone su 100 fanno meno di te. Non è una diagnosi, è un termometro: rifallo una volta al mese.</p>
          <label class="mem-age">Età (facoltativa, per i valori per fascia d'età) <input type="number" inputmode="numeric" min="16" max="99" id="memAge" value="${num(l.profile.age) ? l.profile.age : ""}" placeholder="—"></label>
        </div>
        <ul class="mem-tests">${rows}
          <li>
            <div class="mem-test-name"><strong>Lista di 15 parole</strong><span>${esc(TEST_INFO.words)}</span></div>
            <div class="mem-test-val">${w ? `<b>${w.value}</b><span>su 75 · ${dateShort(w.t)}</span>` : `<span>mai fatto</span>`}</div>
            <div class="mem-test-pct">${w ? `${pctBar(wc)}${num(w.delayed) ? `<span class="mem-sub">Dopo 20 minuti: <b>${w.delayed}</b>/15 ${wd ? `· ${wd.pct}° percentile` : w.late ? "· fuori tempo" : ""}</span>` : ""}` : ""}</div>
            ${pending ? `<button type="button" class="${pending.ready ? "primary-action" : "ghost-action"} small" data-m="delayed" ${pending.ready ? "" : "disabled"}>${pending.ready ? "Richiamo" : `Tra ${Math.max(1, Math.ceil((pending.readyAt - Date.now()) / 60000))} min`}</button>` : `<button type="button" class="${w ? "ghost-action" : "primary-action"} small" data-m="wordtest">${w ? "Rifai" : "Fai il test"}<span class="mem-sr">: lista di parole</span></button>`}
          </li>
        </ul>
        <details class="mem-sources"><summary>Fonti dei valori di riferimento</summary>${sourcesHtml()}</details>
      </div>`;
  }
  function sourcesHtml() {
    const seen = new Set();
    const list = Object.values(E.NORMS).filter((n) => n && n.source && !seen.has(n.source) && seen.add(n.source));
    if (!list.length) return "<p>Valori di riferimento non ancora caricati.</p>";
    return `<ul>${list.map((n) => `<li>${esc(n.source)}${n.url ? ` — <a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">fonte</a>` : ""}${n.note ? `<br><span>${esc(n.note)}</span>` : ""}</li>`).join("")}</ul>`;
  }

  /* ---- test di span */
  function startSpan(key) {
    stopTimers();
    ui.run = { type: "span", test: E.makeSpanTest(key), phase: "intro", input: [], showIdx: -1, feedback: null };
    render(true);
  }
  function spanView() {
    const r = ui.run;
    const t = r.test;
    const def = t.def;
    const corsi = def.kind === "corsi";
    const head = `${backBar("← Esci dal test")}<div class="mem-run-head"><span class="mem-kicker">${esc(def.label)}</span><span>${r.phase === "intro" || r.phase === "result" ? "" : `Lunghezza ${t.len} · prova ${Math.min(t.trial + 1, def.trials)} di ${def.trials}`}</span></div>`;
    if (r.phase === "intro") {
      return `${head}<article class="mem-card"><h2 data-focus tabindex="-1">${esc(def.label)}</h2>
        <p>${corsi ? `Si accendono dei blocchi, uno al secondo. Poi tocca${def.dir === "b" ? " gli stessi blocchi <b>al contrario</b>, dall'ultimo al primo" : " gli stessi blocchi <b>nello stesso ordine</b>"}.` : `Compaiono delle cifre, una al secondo. Poi scrivile${def.dir === "b" ? " <b>al contrario</b>, dall'ultima alla prima" : " <b>nello stesso ordine</b>"}.`}</p>
        <p>Si parte da ${def.startLen} e si sale di uno; ci sono ${def.trials} prove per lunghezza e ti fermi quando le sbagli tutte e due. Niente trucchi: niente carta, niente ripetere a voce alta.</p>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="span-go" data-autofocus>Comincia</button></div></article>`;
    }
    if (r.phase === "result") {
      const l = lab();
      const c = E.compare(t.key, t.span, l.profile);
      const prev = (l.tests[t.key] || []).slice(-2, -1)[0];
      return `${head}<article class="mem-card mem-result"><div class="mem-big"><strong>${t.span || "—"}</strong><span>span</span></div><div>
        <h2 data-focus tabindex="-1">${t.span ? `Span ${t.span}` : "Nessuna sequenza giusta"}</h2>
        ${c ? `<p>${pctBar(c)}</p>${normLine(c)}` : ""}
        ${prev ? `<p>La volta prima: ${prev.value} (${dateShort(prev.t)}).</p>` : ""}
        <div class="mem-actions"><button type="button" class="primary-action" data-m="exit" data-autofocus>Torna ai test</button><button type="button" class="ghost-action" data-m="span" data-key="${t.key}">Rifallo</button></div></div></article>`;
    }
    // durante la risposta lo schermo delle cifre e' vuoto: lascio posto al tastierino
    const stage = corsi ? corsiBoard(r) : r.phase === "answer" ? "" : digitStage(r);
    const answer = r.phase === "answer"
      ? corsi
        ? `<p class="mem-hint">Tocca i blocchi ${def.dir === "b" ? "al contrario" : "nell'ordine"} (${r.input.length}/${t.len}).</p><div class="mem-actions"><button type="button" class="ghost-action" data-m="span-undo" ${r.input.length ? "" : "disabled"}>Cancella l'ultimo</button><button type="button" class="primary-action" data-m="span-ok" ${r.input.length ? "" : "disabled"}>Conferma</button></div>`
        : `<div class="mem-entry" aria-live="polite">${r.input.length ? r.input.join(" ") : "<span>scrivi le cifre</span>"}</div>${keypad()}`
      : r.phase === "feedback" ? `<p class="mem-feedback ${r.feedback ? "ok" : "ko"}" role="status">${r.feedback ? "Giusto" : "Sbagliato"}</p>` : `<p class="mem-hint">Guarda e memorizza…</p>`;
    return `${head}<article class="mem-card mem-run">${stage}${answer}</article>`;
  }
  function digitStage(r) {
    const d = r.phase === "show" && r.showIdx >= 0 ? r.test.current[r.showIdx] : "";
    return `<div class="mem-stage mem-stage-digit" aria-live="off"><span class="mem-digit" data-mem-digit>${d === "" ? "" : d}</span></div>`;
  }
  function corsiBoard(r) {
    const lit = r.phase === "show" && r.showIdx >= 0 ? r.test.current[r.showIdx] : -1;
    const clickable = r.phase === "answer";
    return `<div class="mem-stage mem-corsi" role="group" aria-label="Tavola con 9 blocchi">${E.CORSI.map(([x, y], i) => `<button type="button" class="mem-block ${i === lit ? "lit" : ""} ${r.input.includes(i) ? "picked" : ""}" style="left:${(7 + x * 0.86).toFixed(1)}%;top:${(8 + y * 0.84).toFixed(1)}%" data-m="${clickable ? "corsi" : ""}" data-i="${i}" ${clickable ? "" : "tabindex=\"-1\" aria-disabled=\"true\""} aria-label="Blocco ${i + 1}${r.input.includes(i) ? `, scelto per ${r.input.indexOf(i) + 1}°` : ""}">${r.input.includes(i) ? r.input.indexOf(i) + 1 : ""}</button>`).join("")}</div>`;
  }
  function keypad() {
    return `<div class="mem-keypad" role="group" aria-label="Tastierino">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-m="key" data-k="${n}">${n}</button>`).join("")}<button type="button" data-m="key" data-k="del" aria-label="Cancella">⌫</button><button type="button" data-m="key" data-k="0" disabled aria-hidden="true">0</button><button type="button" class="ok" data-m="key" data-k="ok">OK</button></div>`;
  }
  function spanPlay() {
    const r = ui.run;
    const seq = E.spanNext(r.test);
    r.phase = "show";
    r.input = [];
    r.showIdx = -1;
    render(false);
    const rate = r.test.def.rateMs;
    const on = r.test.def.onMs || Math.round(rate * 0.75);
    seq.forEach((_, i) => {
      after(500 + i * rate, () => { if (ui.run !== r) return; r.showIdx = i; paintStage(); });
      after(500 + i * rate + on, () => { if (ui.run !== r) return; r.showIdx = -1; paintStage(); });
    });
    after(500 + seq.length * rate, () => { if (ui.run !== r) return; r.phase = "answer"; render(true); });
  }
  // aggiorna solo lo stadio (niente ridisegno completo durante la presentazione)
  function paintStage() {
    const r = ui.run;
    if (!r) return;
    if (r.type === "span") {
      const box = document.querySelector("#memPanel .mem-stage");
      if (!box) return;
      if (r.test.def.kind === "corsi") box.outerHTML = corsiBoard(r);
      else { const d = box.querySelector("[data-mem-digit]"); if (d) d.textContent = r.showIdx >= 0 ? r.test.current[r.showIdx] : ""; }
    } else if (r.type === "words") {
      const w = document.querySelector("#memPanel [data-mem-word]");
      if (w) w.textContent = r.showIdx >= 0 ? r.list[r.showIdx] : "";
    }
  }
  function spanSubmit() {
    const r = ui.run;
    if (!r || r.phase !== "answer" || !r.input.length) return;
    const res = E.spanAnswer(r.test, r.input.slice());
    r.feedback = res.ok;
    r.phase = "feedback";
    render(false);
    announce(res.ok ? "Giusto" : "Sbagliato");
    after(800, () => {
      if (ui.run !== r) return;
      if (res.done) {
        const l = lab();
        E.recordTest(l, r.test.key, r.test.span, { trials: r.test.history.length });
        save();
        r.phase = "result";
        render(true);
        announce(`Span ${r.test.span}`);
      } else spanPlay();
    });
  }

  /* ---- lista di parole */
  function startWords() {
    stopTimers();
    ui.run = { type: "words", test: E.makeWordTest(lab()), phase: "intro", list: [], showIdx: -1, last: null };
    render(true);
  }
  function wordsView() {
    const r = ui.run;
    const t = r.test;
    const st = E.wordStage(t);
    const head = `${backBar("← Esci dal test")}<div class="mem-run-head"><span class="mem-kicker">Lista di 15 parole</span><span>${st ? (st.kind === "learn" ? `Prova ${st.n} di 5` : st.kind === "distractor" ? "Lista di disturbo" : "Prima lista, senza rivederla") : ""}</span></div>`;
    if (r.phase === "intro") {
      return `${head}<article class="mem-card"><h2 data-focus tabindex="-1">Lista di 15 parole</h2>
        <p>Vedrai 15 parole, una al secondo. Alla fine scrivi tutte quelle che ricordi, <b>in qualsiasi ordine</b>. La stessa lista torna 5 volte: cerca di ricordarne sempre di più.</p>
        <p>Poi arriva una seconda lista, da ricordare una volta sola, e subito dopo ti chiedo di nuovo la prima, senza rivederla. Infine, <b>dopo 20 minuti</b>, la prima lista un'ultima volta: nel frattempo puoi fare altro nell'app.</p>
        <p class="mem-small">Questa è una versione della prova di Rey con parole nostre: i valori di riferimento sono quelli della prova originale, quindi il confronto è indicativo.</p>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="words-go" data-autofocus>Comincia</button></div></article>`;
    }
    if (r.phase === "show") {
      return `${head}<article class="mem-card mem-run"><div class="mem-stage mem-stage-word"><span class="mem-word" data-mem-word>${r.showIdx >= 0 ? esc(r.list[r.showIdx]) : ""}</span></div><p class="mem-hint">Leggi e memorizza…</p></article>`;
    }
    if (r.phase === "recall") {
      return `${head}<article class="mem-card mem-run"><h2 data-focus tabindex="-1">${st.kind === "distractor" ? "Scrivi le parole della seconda lista" : st.kind === "recallA" ? "Scrivi le parole della PRIMA lista" : "Scrivi tutte le parole che ricordi"}</h2>
        <textarea id="memWordsInput" rows="6" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Una dopo l'altra, separate da spazi o a capo" data-autofocus></textarea>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="words-ok">Ho finito</button></div></article>`;
    }
    if (r.phase === "between") {
      const res = r.last;
      return `${head}<article class="mem-card"><h2 data-focus tabindex="-1">${res.correct} su 15</h2>
        <p>${res.intrusions.length ? `Parole non in lista: ${res.intrusions.map(esc).join(", ")}. ` : ""}${st && st.kind === "learn" ? "Ecco di nuovo la stessa lista." : st && st.kind === "distractor" ? "Adesso una lista nuova, da ricordare una volta sola." : st && st.kind === "recallA" ? "Ora, senza rivederla, scrivi la prima lista." : ""}</p>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="words-next" data-autofocus>${st && st.show ? "Mostra la lista" : "Continua"}</button></div></article>`;
    }
    // partial: prove fatte, richiamo differito in attesa
    const total = t.trials.reduce((a, b) => a + b, 0);
    const c = E.compare("wordsTotal", total, lab().profile);
    return `${head}<article class="mem-card mem-result"><div class="mem-big"><strong>${total}</strong><span>su 75</span></div><div>
      <h2 data-focus tabindex="-1">Prove 1-5: ${t.trials.join(" · ")}</h2>
      ${c ? `<p>${pctBar(c)}</p>${normLine(c)}` : ""}
      <p>Lista di disturbo: ${t.b}/15 · prima lista senza rivederla: ${t.a6}/15.</p>
      <p><b>Torna tra 20 minuti</b> per il richiamo differito: lo trovi in Oggi e qui in Misura. Intanto fai pure altro, anche nell'app.</p>
      <div class="mem-actions"><button type="button" class="primary-action" data-m="exit" data-autofocus>Va bene</button></div></div></article>`;
  }
  function wordsShow() {
    const r = ui.run;
    const st = E.wordStage(r.test);
    if (!st) return;
    if (!st.show) { r.phase = "recall"; render(true); return; }
    r.list = st.list;
    r.phase = "show";
    r.showIdx = -1;
    render(false);
    const rate = E.WORD_TEST.rateMs;
    st.list.forEach((_, i) => {
      after(400 + i * rate, () => { if (ui.run !== r) return; r.showIdx = i; paintStage(); });
      after(400 + i * rate + Math.round(rate * 0.85), () => { if (ui.run !== r) return; r.showIdx = -1; paintStage(); });
    });
    after(400 + st.list.length * rate, () => { if (ui.run !== r) return; r.phase = "recall"; render(true); });
  }
  function wordsSubmit() {
    const r = ui.run;
    const box = $("memWordsInput");
    r.last = E.wordAnswer(r.test, box ? box.value : "");
    if (r.test.done) {
      E.startDelayed(lab(), r.test);
      save();
      r.phase = "partial";
    } else r.phase = "between";
    render(true);
  }
  function startDelayedRecall() {
    stopTimers();
    ui.run = { type: "delayed", phase: "recall", result: null };
    render(true);
  }
  function delayedView() {
    const r = ui.run;
    const head = `${backBar("← Esci")}<div class="mem-run-head"><span class="mem-kicker">Lista di 15 parole</span><span>Richiamo differito</span></div>`;
    if (r.phase === "recall") {
      return `${head}<article class="mem-card mem-run"><h2 data-focus tabindex="-1">Scrivi le parole della prima lista</h2><p>Quella che hai visto 5 volte, non la seconda. In qualsiasi ordine.</p>
        <textarea id="memWordsInput" rows="6" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="Una dopo l'altra" data-autofocus></textarea>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="delayed-ok">Ho finito</button></div></article>`;
    }
    const x = r.result;
    return `${head}<article class="mem-card mem-result"><div class="mem-big"><strong>${x.correct}</strong><span>su 15</span></div><div>
      <h2 data-focus tabindex="-1">Dopo ${x.minutes} minuti: ${x.correct} parole</h2>
      <p>Totale delle 5 prove: ${x.total}/75.</p>
      ${x.compareTotal ? `<p><span class="mem-sub">5 prove</span>${pctBar(x.compareTotal)}</p>` : ""}
      ${x.compareDelayed ? `<p><span class="mem-sub">Richiamo differito</span>${pctBar(x.compareDelayed)}</p>${normLine(x.compareDelayed)}` : x.late ? "<p>Fatto oltre i 45 minuti: non lo confronto con i valori di riferimento.</p>" : ""}
      ${x.missed.length ? `<p class="mem-small">Dimenticate: ${x.missed.map(esc).join(", ")}.</p>` : ""}
      <div class="mem-actions"><button type="button" class="primary-action" data-m="exit" data-autofocus>Torna ai test</button></div></div></article>`;
  }

  /* ------------------------------------------------------------ TECNICHE */
  function techniquesView() {
    if (ui.palaceEdit) return palaceEditor();
    if (ui.technique) return techniqueDetail(TECHNIQUES.find((t) => t.id === ui.technique));
    const l = lab();
    return `
      <div class="mem-tech">
        <div class="mem-intro"><h2 data-focus tabindex="-1">Le tecniche dei campioni di memoria</h2><p>Non servono doti speciali: i campioni di memoria usano poche tecniche, allenate ogni giorno. Qui ognuna ha la spiegazione, i passi e un esercizio.</p></div>
        <ul class="mem-tech-list">
          ${TECHNIQUES.map((t) => {
            const extra = t.id === "major" ? `${E.majorLearned(l)}/100 imparate` : t.id === "loci" ? (l.palaces.length ? plural(l.palaces.length, "palazzo", "palazzi") : "nessun palazzo") : "";
            return `<li><button type="button" data-m="tech" data-id="${t.id}"><strong>${esc(t.title)}</strong><span>${esc(t.line)}</span>${extra ? `<em>${esc(extra)}</em>` : ""}</button></li>`;
          }).join("")}
        </ul>
      </div>`;
  }
  function techniqueDetail(t) {
    if (!t) { ui.technique = null; return techniquesView(); }
    const l = lab();
    let practice = "";
    if (t.id === "loci") practice = palacesBlock(l);
    else if (t.id === "major") practice = majorBlock(l);
    else if (t.practice) practice = `<div class="mem-practice"><h3>Esercizio</h3><p>${esc(t.practice.note || "")}</p><button type="button" class="primary-action" data-m="practice" data-kind="${t.practice.kind}" data-level="${t.practice.level}">Fai l'esercizio</button></div>`;
    else practice = `<div class="mem-practice"><h3>Dove lo usi qui</h3><p>Il sistema fonetico ripassa le immagini con questo metodo. Per lo studio vero, la sezione Cultura ripassa le schede alle scadenze giuste.</p><a class="ghost-link" href="#culture">Vai alla Cultura</a></div>`;
    return `
      <div class="mem-tech-detail">
        <div class="mem-back"><button type="button" class="ghost-action small" data-m="tech-back">← Tutte le tecniche</button></div>
        <article class="mem-card">
          <span class="mem-kicker">Tecnica</span>
          <h2 data-focus tabindex="-1">${esc(t.title)}</h2>
          <p class="mem-lead">${esc(t.line)}</p>
          <h3>Perché funziona</h3>
          <p>${esc(t.why)}</p>
          ${t.sources ? `<p class="mem-small mem-refs">Fonti: ${t.sources.map(([label, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`).join(" · ")}</p>` : ""}
          <h3>Come si fa</h3>
          <ol class="mem-howto">${t.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        </article>
        ${practice}
      </div>`;
  }

  /* ---- palazzo */
  function palacesBlock(l) {
    const list = l.palaces;
    return `<div class="mem-practice"><h3>I tuoi palazzi</h3>
      ${list.length ? `<ul class="mem-palaces">${list.map((p) => `<li><div><strong>${esc(p.name)}</strong><span>${plural(p.loci.length, "luogo", "luoghi")}${p.uses ? ` · usato ${p.uses} ${p.uses === 1 ? "volta" : "volte"} · record ${p.best}/${Math.min(p.loci.length, 20)}` : ""}</span></div>
        <button type="button" class="primary-action small" data-m="palace-play" data-id="${p.id}" ${p.loci.length >= 3 ? "" : "disabled"}>Allenati</button>
        <button type="button" class="ghost-action small" data-m="palace-edit" data-id="${p.id}">Modifica</button></li>`).join("")}</ul>` : `<p>Ancora nessun palazzo. Scegli un posto che conosci a occhi chiusi e scrivi i luoghi in ordine.</p>`}
      <button type="button" class="${list.length ? "ghost-action" : "primary-action"}" data-m="palace-new">Nuovo palazzo</button></div>`;
  }
  function palaceEditor() {
    const l = lab();
    const p = ui.palaceEdit.id ? l.palaces.find((x) => x.id === ui.palaceEdit.id) : null;
    return `
      <div class="mem-tech-detail">
        <div class="mem-back"><button type="button" class="ghost-action small" data-m="palace-cancel">← Annulla</button></div>
        <article class="mem-card">
          <span class="mem-kicker">Palazzo della memoria</span>
          <h2 data-focus tabindex="-1">${p ? "Modifica il palazzo" : "Nuovo palazzo"}</h2>
          <p>Un luogo per riga, nell'ordine in cui li incontri camminando. Luoghi diversi tra loro e ben visibili: «porta d'ingresso», «specchio», «divano», «televisore», «finestra»… Ne servono almeno 10; i campioni ne usano centinaia.</p>
          <label class="mem-field">Nome <input type="text" id="memPalaceName" maxlength="60" value="${esc(p ? p.name : "")}" placeholder="Es. Casa mia, Ufficio, Strada per il lavoro"></label>
          <label class="mem-field">Luoghi in ordine <textarea id="memPalaceLoci" rows="12" placeholder="porta d'ingresso&#10;attaccapanni&#10;specchio&#10;…">${esc(p ? p.loci.join("\n") : "")}</textarea></label>
          <p class="mem-small" id="memPalaceCount">${p ? plural(p.loci.length, "luogo", "luoghi") : "0 luoghi"}</p>
          <div class="mem-actions"><button type="button" class="primary-action" data-m="palace-save">Salva</button>${p ? `<button type="button" class="ghost-action" data-m="palace-del" data-id="${p.id}">Elimina</button>` : ""}</div>
        </article>
      </div>`;
  }

  /* ---- sistema fonetico */
  function majorBlock(l) {
    const q = E.majorQueue(l);
    const learned = E.majorLearned(l);
    const todo = q.due.length + q.fresh.length;
    return `<div class="mem-practice"><h3>Le tue 100 immagini</h3>
      <p>${learned}/100 imparate. ${todo ? `Oggi: ${plural(q.due.length, "ripasso", "ripassi")} e ${plural(q.fresh.length, "immagine nuova", "immagini nuove")}.` : "Per oggi hai finito: torna domani per i ripassi."}</p>
      <div class="mem-actions"><button type="button" class="primary-action" data-m="major-go" ${todo ? "" : "disabled"}>Allenati con le immagini</button></div>
      <details class="mem-majortable"><summary>Tabella 00-99</summary><div class="mem-major-grid">${E.MAJOR.map((m) => {
        const st = E.majorState(l, m.code);
        return `<div class="${st && st.box >= 3 ? "known" : st ? "seen" : ""}" title="${esc(m.hint)}"><b>${m.code}</b><span>${esc(m.word)}</span></div>`;
      }).join("")}</div></details></div>`;
  }
  function startMajor() {
    const l = lab();
    const q = E.majorQueue(l);
    const codes = E.shuffle(q.due).concat(q.fresh);
    if (!codes.length) return;
    stopTimers();
    ui.run = { type: "major", queue: codes, idx: 0, fresh: new Set(q.fresh), q: null, answered: null, ok: 0, ko: 0, typed: "" };
    nextMajor();
  }
  function nextMajor() {
    const r = ui.run;
    if (r.idx >= r.queue.length) { r.q = null; render(true); return; }
    const code = r.queue[r.idx];
    // le immagini nuove si presentano prima (scheda), poi si chiedono
    if (r.fresh.has(code) && !r.introduced) { r.introduced = code; r.q = { kind: "intro", code }; render(true); return; }
    r.introduced = null;
    r.q = E.majorQuestion(code, Date.now() + r.idx);
    r.answered = null;
    render(true);
  }
  function majorView() {
    const r = ui.run;
    const head = `${backBar("← Fine")}<div class="mem-run-head"><span class="mem-kicker">Sistema fonetico</span><span>${Math.min(r.idx + 1, r.queue.length)}/${r.queue.length}</span></div>`;
    if (!r.q) {
      return `${head}<article class="mem-card"><h2 data-focus tabindex="-1">Finito per oggi</h2><p>${r.ok} giuste, ${r.ko} da rivedere. Le sbagliate tornano tra pochi minuti, le giuste fra qualche giorno.</p><p>${E.majorLearned(lab())}/100 immagini imparate.</p><div class="mem-actions"><button type="button" class="primary-action" data-m="exit" data-autofocus>Torna</button></div></article>`;
    }
    const m = E.MAJOR.find((x) => x.code === r.q.code);
    if (r.q.kind === "intro") {
      const letters = E.phonetic(m.word);
      return `${head}<article class="mem-card mem-major-card"><span class="mem-kicker">Immagine nuova</span><div class="mem-major-pair"><strong>${m.code}</strong><span>${esc(m.word)}</span></div>
        <p>${esc(m.word)}: ${spell(m.word)} → ${letters.split("").join(" + ")} = ${m.code}.</p><p class="mem-lead">Immagina: ${esc(m.hint)}.</p>
        <div class="mem-actions"><button type="button" class="primary-action" data-m="major-seen" data-autofocus>Fatto, chiedimela</button></div></article>`;
    }
    const answered = r.answered;
    const body = r.q.kind === "pick"
      ? `<p class="mem-hint">Che immagine è questo numero?</p><div class="mem-major-pair"><strong>${r.q.prompt}</strong></div><div class="mem-options">${r.q.options.map((o, i) => `<button type="button" class="mem-option ${answered ? (o === r.q.answer ? "right" : o === answered.value ? "wrong" : "") : ""}" data-m="major-pick" data-v="${esc(o)}" ${answered ? "disabled" : ""}><kbd>${i + 1}</kbd>${esc(o)}</button>`).join("")}</div>`
      : `<p class="mem-hint">Che numero è questa immagine?</p><div class="mem-major-pair"><span>${esc(r.q.prompt)}</span></div><input class="mem-major-input" id="memMajorInput" inputmode="numeric" maxlength="2" autocomplete="off" ${answered ? "disabled" : "data-autofocus"} value="${esc(answered ? answered.value : "")}"><div class="mem-actions">${answered ? "" : `<button type="button" class="primary-action" data-m="major-type">Conferma</button>`}</div>`;
    return `${head}<article class="mem-card mem-major-card">${body}
      ${answered ? `<div class="mem-feedback ${answered.ok ? "ok" : "ko"}" role="status"><strong>${answered.ok ? "Giusto" : `No: ${m.code} = ${esc(m.word)}`}</strong><span>${esc(m.hint)}</span><button type="button" class="primary-action" data-m="major-next" data-autofocus>Avanti</button></div>` : ""}</article>`;
  }
  function spell(word) {
    return esc(word.toUpperCase());
  }
  function majorAnswer(value) {
    const r = ui.run;
    if (!r || !r.q || r.answered) return;
    const ok = String(value).trim().toLowerCase() === String(r.q.answer).toLowerCase();
    r.answered = { value, ok };
    E.majorAnswer(lab(), r.q.code, ok);
    if (ok) r.ok += 1; else { r.ko += 1; r.queue.push(r.q.code); }
    save();
    render(true);
  }

  /* ------------------------------------------------------------ DISCIPLINE */
  const DIS_INFO = {
    numbers: "Cifre a caso, a righe di 10. Si scrivono nello stesso ordine.",
    words: "Parole concrete, a colonne di 10, da scrivere nello stesso ordine.",
    cards: "Carte da gioco mescolate, una alla volta. Si rimettono in ordine.",
    faces: "Volti con il nome. Poi i volti in un altro ordine: scrivi il nome di ognuno."
  };
  function disciplinesView() {
    const l = lab();
    return `
      <div class="mem-dis">
        <div class="mem-intro"><h2 data-focus tabindex="-1">Discipline da gara</h2><p>Le prove delle gare di memoria, a livelli; l'ultimo è il formato di Memory League: 1 minuto per memorizzare 80 cifre, 50 parole, un mazzo da 52 carte o 30 nomi. Numeri e parole si contano come nelle gare IAM, a righe da 10: riga perfetta = tutti i punti, un errore = metà, due o più = zero. Carte e nomi: un punto per risposta giusta. Superi il livello con il 90%: decidi tu quando salire.</p></div>
        <ul class="mem-dis-list">
          ${Object.values(E.DISCIPLINES).map((d) => {
            const st = l.disciplines[d.key];
            const lv = d.levels[st.level - 1];
            const best = st.best[String(st.level)];
            return `<li>
              <div class="mem-dis-name"><strong>${esc(d.label)}</strong><span>${esc(DIS_INFO[d.key])}</span></div>
              <div class="mem-dis-level">
                <button type="button" class="ghost-action small" data-m="lv" data-key="${d.key}" data-d="-1" aria-label="Livello precedente" ${st.level > 1 ? "" : "disabled"}>‹</button>
                <span><b>Livello ${st.level}</b>${lv.n} ${d.unit} · ${lv.mem} s</span>
                <button type="button" class="ghost-action small" data-m="lv" data-key="${d.key}" data-d="1" aria-label="Livello successivo" ${st.level < st.unlocked ? "" : "disabled"}>›</button>
              </div>
              <div class="mem-dis-best">${num(best) ? `record <b>${best}</b>/${lv.n}` : "nessun turno"}</div>
              <button type="button" class="primary-action small" data-m="play" data-key="${d.key}">Gioca<span class="mem-sr">: ${esc(d.label)}</span></button>
            </li>`;
          }).join("")}
        </ul>
      </div>`;
  }

  // round: { key, level, n, mem, recall, items } | palazzo { key: "palace", loci, items }
  function startRound(round, source) {
    stopTimers();
    ui.run = { type: "round", round, source, phase: "intro", answers: [], result: null, rec: null, memStart: 0, memUsed: null, cardIdx: 0, deadline: 0 };
    render(true);
  }
  function memSeconds(round) {
    if (round.key === "palace") return Math.max(60, round.items.length * 15);
    return round.mem;
  }
  function recallSeconds(round) {
    if (round.key === "palace") return Math.max(90, round.items.length * 12);
    return round.recall;
  }
  function roundTitle(round) {
    if (round.key === "palace") return "Parole nel palazzo";
    return `${E.DISCIPLINES[round.key].label} · livello ${round.level}`;
  }
  function roundView() {
    const r = ui.run;
    const round = r.round;
    const head = `${backBar("← Esci")}<div class="mem-run-head"><span class="mem-kicker">${esc(roundTitle(round))}</span><span>${r.phase === "mem" ? "Memorizza" : r.phase === "recall" ? "Ricorda" : ""}</span></div>`;
    if (r.phase === "intro") {
      const n = round.items.length;
      const what = round.key === "palace" ? `${n} parole, una per luogo del tuo palazzo` : `${n} ${E.DISCIPLINES[round.key].unit}`;
      return `${head}<article class="mem-card"><h2 data-focus tabindex="-1">${esc(roundTitle(round))}</h2>
        <p>Hai <b>${fmtSec(memSeconds(round))}</b> per memorizzare ${what}; se finisci prima premi «Ho finito». Poi <b>${fmtSec(recallSeconds(round))}</b> per rispondere.</p>
        ${round.key === "numbers" ? "<p class=\"mem-small\">Suggerimento: a coppie con il sistema fonetico, o a gruppi di tre/quattro.</p>" : round.key === "words" ? "<p class=\"mem-small\">Suggerimento: una storia o il palazzo, una parola per luogo.</p>" : round.key === "cards" ? "<p class=\"mem-small\">Frecce o tasti ‹ › per scorrere le carte. Suggerimento: un'immagine per carta e il palazzo.</p>" : round.key === "faces" ? "<p class=\"mem-small\">Suggerimento: un tratto del viso + un'immagine del nome.</p>" : "<p class=\"mem-small\">Ogni parola compare insieme al suo luogo: mettila lì con un'immagine esagerata.</p>"}
        <div class="mem-actions"><button type="button" class="primary-action" data-m="round-go" data-autofocus>Comincia</button></div></article>`;
    }
    if (r.phase === "mem") return `${head}<article class="mem-card mem-run">${memStage(r)}<div class="mem-actions"><button type="button" class="primary-action" data-m="round-done">Ho finito</button></div></article>`;
    if (r.phase === "recall") return `${head}<article class="mem-card mem-run"><div class="mem-run-timer">${stageTimer(Math.round((r.deadline - Date.now()) / 1000), recallSeconds(round))}</div>${recallForm(r)}<div class="mem-actions"><button type="button" class="primary-action" data-m="round-check">Controlla</button></div></article>`;
    return `${head}${resultView(r)}`;
  }
  function memStage(r) {
    const round = r.round;
    const timer = `<div class="mem-run-timer">${stageTimer(Math.round((r.deadline - Date.now()) / 1000), memSeconds(round))}</div>`;
    if (round.key === "numbers") {
      const rows = [];
      for (let i = 0; i < round.items.length; i += 10) rows.push(round.items.slice(i, i + 10));
      return `${timer}<div class="mem-stage mem-stage-grid"><div class="mem-num-rows">${rows.map((row, ri) => `<div class="mem-num-row"><span class="mem-row-n">${ri + 1}</span>${row.map((d, i) => `<span class="${i % 2 ? "" : "pair"}">${d}</span>`).join("")}</div>`).join("")}</div></div>`;
    }
    if (round.key === "words") {
      return `${timer}<div class="mem-stage mem-stage-grid"><ol class="mem-word-cols">${round.items.map((w) => `<li>${esc(w)}</li>`).join("")}</ol></div>`;
    }
    if (round.key === "palace") {
      return `${timer}<div class="mem-stage mem-stage-grid"><ol class="mem-loci">${round.items.map((w, i) => `<li><span>${esc(round.loci[i])}</span><b>${esc(w)}</b></li>`).join("")}</ol></div>`;
    }
    if (round.key === "cards") {
      const c = E.cardInfo(round.items[r.cardIdx]);
      return `${timer}<div class="mem-stage mem-stage-cards"><button type="button" class="ghost-action" data-m="card-prev" aria-label="Carta precedente" ${r.cardIdx ? "" : "disabled"}>‹</button>${cardFace(c, true)}<button type="button" class="ghost-action" data-m="card-next" aria-label="Carta successiva" ${r.cardIdx < round.items.length - 1 ? "" : "disabled"}>›</button></div><p class="mem-hint">Carta ${r.cardIdx + 1} di ${round.items.length}</p>`;
    }
    return `${timer}<div class="mem-stage mem-stage-faces"><ul class="mem-faces">${round.items.map((p) => `<li>${F.svg(p.seed, { female: p.female, label: `${p.first} ${p.last}` })}<strong>${esc(p.first)}</strong><span>${esc(p.last)}</span></li>`).join("")}</ul></div>`;
  }
  function cardFace(c, big = false) {
    if (!c) return "";
    return `<span class="mem-card-face ${c.red ? "red" : ""} ${big ? "big" : ""}" role="img" aria-label="${esc(c.name)}"><b>${esc(c.label.replace(/[♠♥♦♣]/, ""))}</b><i>${c.sym}\uFE0E</i></span>`;
  }
  function recallForm(r) {
    const round = r.round;
    const ans = r.answers;
    if (round.key === "numbers") {
      const rows = Math.ceil(round.items.length / 10);
      return `<p class="mem-hint">Scrivi le cifre, riga per riga (10 per riga). Lascia vuoto quello che non ricordi.</p><div class="mem-num-inputs">${Array.from({ length: rows }, (_, ri) => {
        const len = Math.min(10, round.items.length - ri * 10);
        return `<label><span>${ri + 1}</span><input type="text" inputmode="numeric" maxlength="${len}" data-row="${ri}" autocomplete="off" value="${esc((ans.slice(ri * 10, ri * 10 + len).map((x) => (x == null ? " " : x)).join("")).trimEnd())}" ${ri === 0 ? "data-autofocus" : ""} aria-label="Riga ${ri + 1}, ${len} cifre"></label>`;
      }).join("")}</div>`;
    }
    if (round.key === "words" || round.key === "palace") {
      return `<p class="mem-hint">${round.key === "palace" ? "Ripercorri il palazzo: che parola c'era in ogni luogo?" : "Scrivi le parole nell'ordine. Lascia vuoto quello che non ricordi."}</p><ol class="mem-word-inputs">${round.items.map((_, i) => `<li><label><span>${round.key === "palace" ? esc(round.loci[i]) : i + 1}</span><input type="text" autocomplete="off" autocapitalize="none" spellcheck="false" data-i="${i}" value="${esc(ans[i] || "")}" ${i === 0 ? "data-autofocus" : ""}></label></li>`).join("")}</ol>`;
    }
    if (round.key === "cards") {
      const picked = ans.filter(Boolean);
      return `<p class="mem-hint">Tocca le carte nell'ordine in cui le hai viste (${picked.length}/${round.items.length}).</p>
        <div class="mem-card-seq" aria-live="polite">${picked.length ? picked.map((code) => cardFace(E.cardInfo(code))).join("") : "<span>nessuna carta scelta</span>"}</div>
        <div class="mem-actions"><button type="button" class="ghost-action small" data-m="card-undo" ${picked.length ? "" : "disabled"}>Togli l'ultima</button></div>
        <div class="mem-card-picker" role="group" aria-label="Mazzo">${E.SUITS.map((s) => `<div>${E.RANKS.map((rk) => { const code = `${rk.id}${s.id}`; const used = picked.includes(code); return `<button type="button" data-m="card-pick" data-c="${code}" ${used || picked.length >= round.items.length ? "disabled" : ""} class="${s.red ? "red" : ""}" aria-label="${esc(E.cardInfo(code).name)}">${rk.id}${s.sym}\uFE0E</button>`; }).join("")}</div>`).join("")}</div>`;
    }
    const order = r.faceOrder || (r.faceOrder = E.shuffle(round.items.map((_, i) => i)));
    return `<p class="mem-hint">Scrivi il nome di ognuno (basta il nome, il cognome è un extra).</p><ul class="mem-faces recall">${order.map((idx, k) => {
      const p = round.items[idx];
      return `<li>${F.svg(p.seed, { female: p.female, label: `volto ${k + 1}` })}<input type="text" autocomplete="off" autocapitalize="words" spellcheck="false" data-i="${idx}" value="${esc(ans[idx] || "")}" aria-label="Nome del volto ${k + 1}" ${k === 0 ? "data-autofocus" : ""}></li>`;
    }).join("")}</ul>`;
  }
  function collectAnswers() {
    const r = ui.run;
    const round = r.round;
    const panel = $("memPanel");
    if (round.key === "numbers") {
      const out = [];
      panel.querySelectorAll("input[data-row]").forEach((inp) => {
        const ri = Number(inp.dataset.row);
        const len = Math.min(10, round.items.length - ri * 10);
        const val = inp.value.replace(/[^\d ]/g, "");
        for (let i = 0; i < len; i += 1) out[ri * 10 + i] = val[i] && val[i] !== " " ? val[i] : null;
      });
      r.answers = out;
    } else if (round.key !== "cards") {
      panel.querySelectorAll("input[data-i]").forEach((inp) => { r.answers[Number(inp.dataset.i)] = inp.value; });
    }
  }
  function roundGo() {
    const r = ui.run;
    r.phase = "mem";
    r.memStart = Date.now();
    r.deadline = Date.now() + memSeconds(r.round) * 1000;
    render(true);
    startTick(() => { if (ui.run === r && r.phase === "mem") roundRecall(); });
  }
  function roundRecall() {
    const r = ui.run;
    if (!r || r.phase !== "mem") return;
    r.memUsed = (Date.now() - r.memStart) / 1000;
    r.phase = "recall";
    r.deadline = Date.now() + recallSeconds(r.round) * 1000;
    stopTimers();
    render(true);
    startTick(() => { if (ui.run === r && r.phase === "recall") roundCheck(); });
  }
  function startTick(onEnd) {
    if (ui.tick) clearInterval(ui.tick);
    ui.tick = setInterval(() => {
      const r = ui.run;
      if (!r) { clearInterval(ui.tick); ui.tick = null; return; }
      const left = Math.round((r.deadline - Date.now()) / 1000);
      const total = r.phase === "mem" ? memSeconds(r.round) : recallSeconds(r.round);
      const bar = document.querySelector("#memPanel .mem-timer i");
      const txt = document.querySelector("#memPanel [data-mem-left]");
      if (bar) bar.style.width = `${Math.max(0, Math.min(100, (left / total) * 100))}%`;
      if (txt) txt.textContent = fmtSec(Math.max(0, left));
      if (left <= 0) { clearInterval(ui.tick); ui.tick = null; onEnd(); }
    }, 250);
  }
  function roundCheck() {
    const r = ui.run;
    if (!r || r.phase !== "recall") return;
    collectAnswers();
    stopTimers();
    const l = lab();
    if (r.round.key === "palace") {
      r.result = E.scorePalace(r.round, r.answers);
      E.recordPalace(l, r.round, r.result);
    } else {
      r.result = E.scoreRound(r.round, r.answers);
      r.rec = E.recordRound(l, r.round, r.result, { memUsed: r.memUsed });
    }
    save();
    r.phase = "result";
    render(true);
    announce(`Punteggio ${r.result.score != null ? r.result.score : r.result.correct} su ${r.result.max}`);
  }
  function resultView(r) {
    const round = r.round;
    const res = r.result;
    const score = res.score != null ? res.score : res.correct;
    let detail = "";
    if (round.key === "numbers") {
      const rows = [];
      for (let i = 0; i < round.items.length; i += 10) rows.push(i);
      detail = `<div class="mem-num-check">${rows.map((start, ri) => `<div class="mem-num-row"><span class="mem-row-n">${ri + 1}</span>${round.items.slice(start, start + 10).map((d, i) => { const m = res.marks[start + i]; const g = r.answers[start + i]; return `<span class="${m === true ? "ok" : m === false ? "ko" : "empty"}" title="${m === false ? `hai scritto ${g}` : ""}">${d}</span>`; }).join("")}<em>${res.rows[ri] ? `${res.rows[ri].pts} pt` : ""}</em></div>`).join("")}</div>`;
    } else if (round.key === "words" || round.key === "palace") {
      detail = `<ol class="mem-word-check">${round.items.map((w, i) => { const m = res.marks[i]; const g = r.answers[i]; return `<li class="${m === true ? "ok" : m === false ? "ko" : "empty"}">${round.key === "palace" ? `<em>${esc(round.loci[i])}</em>` : ""}<b>${esc(w)}</b>${m === false || (m === null && round.key === "palace" && g) ? `<span>hai scritto «${esc(g)}»</span>` : m == null || (round.key === "palace" && !m && !g) ? "<span>vuota</span>" : ""}</li>`; }).join("")}</ol>`;
    } else if (round.key === "cards") {
      detail = `<div class="mem-card-check">${round.items.map((code, i) => { const m = res.marks[i]; const g = r.answers[i]; return `<div class="${m === true ? "ok" : m === false ? "ko" : "empty"}">${cardFace(E.cardInfo(code))}${m === false ? `<small>tu: ${esc(E.cardInfo(g) ? E.cardInfo(g).label : "?")}</small>` : ""}</div>`; }).join("")}</div>`;
    } else {
      detail = `<ul class="mem-faces check">${round.items.map((p, i) => { const m = res.marks[i]; return `<li class="${m === true ? "ok" : m === false ? "ko" : "empty"}">${F.svg(p.seed, { female: p.female })}<strong>${esc(p.first)}</strong><span>${m === false ? `tu: ${esc(r.answers[i])}` : m == null ? "vuoto" : "giusto"}</span></li>`; }).join("")}</ul>`;
    }
    const d = round.key === "palace" ? null : E.DISCIPLINES[round.key];
    const unlocked = r.rec && r.rec.unlocked;
    const actions = round.key === "palace"
      ? `<button type="button" class="primary-action" data-m="palace-play" data-id="${round.palaceId}" data-autofocus>Un altro giro</button><button type="button" class="ghost-action" data-m="exit">Torna</button>`
      : `${unlocked ? `<button type="button" class="primary-action" data-m="level-up" data-key="${round.key}" data-level="${r.rec.nextLevel}" data-autofocus>Sali al livello ${r.rec.nextLevel}</button>` : ""}<button type="button" class="${unlocked ? "ghost-action" : "primary-action"}" data-m="play" data-key="${round.key}" ${unlocked ? "" : "data-autofocus"}>Un altro turno${unlocked ? " a questo livello" : ""}</button><button type="button" class="ghost-action" data-m="exit">Torna</button>`;
    return `<article class="mem-card mem-result"><div class="mem-big"><strong>${score}</strong><span>su ${res.max}</span></div><div>
      <h2 data-focus tabindex="-1">${res.pass || (round.key === "palace" && res.correct === res.max) ? "Livello superato" : score >= res.max * 0.6 ? "Buon turno" : "Da rifare"}</h2>
      <p>${res.correct} giuste su ${res.max}${r.memUsed ? ` · memorizzate in ${fmtSec(r.memUsed)}` : ""}.${r.rec && r.rec.record ? " Nuovo record a questo livello." : ""}${unlocked ? ` Hai sbloccato il livello ${r.rec.nextLevel}: ${d.levels[r.rec.nextLevel - 1].n} ${d.unit} in ${d.levels[r.rec.nextLevel - 1].mem} secondi.` : ""}</p>
      ${benchmark(round)}
      <div class="mem-actions">${actions}</div></div></article>
      <section class="mem-card mem-check"><h3>Le risposte</h3>${detail}</section>`;
  }
  function benchmark(round) {
    const b = E.BENCH && E.BENCH[round.key];
    return b ? `<p class="mem-small">${esc(b)} <a href="${esc(E.BENCH_URL)}" target="_blank" rel="noopener noreferrer">Record IAM</a></p>` : "";
  }

  /* ------------------------------------------------------------ PROGRESSI */
  function progressView() {
    const l = lab();
    const keys = ["digitF", "digitB", "corsiF", "corsiB", "words"];
    const labels = { digitF: "Cifre avanti", digitB: "Cifre indietro", corsiF: "Blocchi avanti", corsiB: "Blocchi indietro", words: "Parole (5 prove)" };
    const sel = ui.progKey;
    const list = l.tests[sel] || [];
    const days = calendar(l);
    return `
      <div class="mem-prog">
        <div class="mem-intro"><h2 data-focus tabindex="-1">Progressi</h2><p>I test nel tempo, i turni delle discipline e i giorni di allenamento. Rifare i test troppo spesso li rende più facili per abitudine: una volta al mese basta.</p></div>
        <section class="mem-card mem-prof-card"><h3>Profilo</h3>${profileMini(l)}</section>
        <section class="mem-card">
          <div class="mem-seg" role="group" aria-label="Test">${keys.map((k) => `<button type="button" data-m="prog" data-key="${k}" aria-pressed="${k === sel}">${labels[k]}</button>`).join("")}</div>
          ${list.length ? chart(list, sel, l) : `<p class="mem-empty">Ancora nessun risultato: fai il test in Misura.</p>`}
        </section>
        <section class="mem-card">
          <h3>Discipline</h3>
          <table class="mem-table"><thead><tr><th scope="col">Disciplina</th><th scope="col">Livello</th><th scope="col">Turni</th><th scope="col">Superati</th><th scope="col">Ultimo</th></tr></thead><tbody>
          ${Object.values(E.DISCIPLINES).map((d) => { const st = l.disciplines[d.key]; const last = st.history[st.history.length - 1]; return `<tr><th scope="row">${esc(d.label)}</th><td>${st.level}/${d.levels.length}</td><td>${st.history.length}</td><td>${st.history.filter((h) => h.pass).length}</td><td>${last ? `${last.score}/${last.max} (liv. ${last.level}, ${dateShort(last.t)})` : "—"}</td></tr>`; }).join("")}
          </tbody></table>
        </section>
        <section class="mem-card">
          <h3>Ultime 8 settimane</h3>
          <div class="mem-cal" role="img" aria-label="${days.filter((d) => d.on).length} giorni di allenamento nelle ultime 8 settimane">${days.map((d) => `<i class="${d.on ? "on" : ""} ${d.today ? "today" : ""}" title="${d.label}"></i>`).join("")}</div>
          <p class="mem-small">${plural(days.filter((d) => d.on).length, "giorno", "giorni")} su 56 · serie attuale: ${plural(E.streak(l), "giorno", "giorni")}</p>
        </section>
      </div>`;
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
  function chart(list, key, l) {
    const W = 560;
    const H = 200;
    const P = 34;
    const normKey = key === "words" ? "wordsTotal" : key;
    const n = E.normRef(normKey, l.profile);
    const values = list.map((x) => x.value);
    const lo = Math.max(0, Math.min(...values, n ? n.mean - 2 * n.sd : Infinity) - 1);
    const hi = Math.max(...values, n ? n.mean + 2 * n.sd : -Infinity) + 1;
    const x = (i) => P + (list.length === 1 ? (W - 2 * P) / 2 : (i / (list.length - 1)) * (W - 2 * P));
    const y = (v) => H - P - ((v - lo) / (hi - lo || 1)) * (H - 2 * P);
    const band = n ? `<rect x="${P}" y="${y(n.mean + n.sd)}" width="${W - 2 * P}" height="${Math.max(0, y(n.mean - n.sd) - y(n.mean + n.sd))}" class="band"/><line x1="${P}" x2="${W - P}" y1="${y(n.mean)}" y2="${y(n.mean)}" class="mean"/><text x="${W - P}" y="${y(n.mean) - 4}" text-anchor="end" class="lbl">media</text>` : "";
    const path = list.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
    return `<svg class="mem-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Andamento: ${values.join(", ")}">
      ${band}<path d="${path}" class="line"/>${list.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.value)}" r="4" class="dot"><title>${dateLong(p.t)}: ${p.value}</title></circle><text x="${x(i)}" y="${y(p.value) - 9}" text-anchor="middle" class="val">${p.value}</text>`).join("")}
      <text x="${P}" y="${H - 8}" class="lbl">${dateShort(list[0].t)}</text>${list.length > 1 ? `<text x="${W - P}" y="${H - 8}" text-anchor="end" class="lbl">${dateShort(list[list.length - 1].t)}</text>` : ""}
    </svg>${n ? `<p class="mem-small">Fascia colorata: media ± una deviazione standard (circa 2 adulti su 3 stanno lì dentro).</p>` : ""}`;
  }

  /* ------------------------------------------------------------ disegno */
  let renderedAt = 0;
  // soft = aggiornamento sul posto (tastierino, carte scelte): non conta per la protezione dal doppio clic
  function render(focus = false, soft = false) {
    const panel = $("memPanel");
    if (!panel) return;
    if (!soft) renderedAt = Date.now();
    renderChip();
    document.querySelectorAll("#memory [data-mem-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.memTab === ui.tab && !ui.run)));
    let html;
    if (ui.run) {
      if (ui.run.type === "span") html = spanView();
      else if (ui.run.type === "words") html = wordsView();
      else if (ui.run.type === "delayed") html = delayedView();
      else if (ui.run.type === "major") html = majorView();
      else html = roundView();
    } else if (ui.tab === "measure") html = measureView();
    else if (ui.tab === "techniques") html = techniquesView();
    else if (ui.tab === "disciplines") html = disciplinesView();
    else if (ui.tab === "progress") html = progressView();
    else html = todayView();
    panel.innerHTML = html;
    panel.dataset.running = ui.run ? ui.run.type : "";
    const page = $("memory");
    if (page) page.classList.toggle("mem-running", Boolean(ui.run));
    if (focus) {
      const el = panel.querySelector("[data-autofocus]") || panel.querySelector("[data-focus]");
      if (el) { if (!el.hasAttribute("tabindex") && !/^(BUTTON|A|INPUT|TEXTAREA)$/.test(el.tagName)) el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); }
      const top = panel.getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: Math.max(0, window.scrollY + top - 12), behavior: "auto" });
    }
  }

  function setTab(tab) {
    stop();
    ui.tab = tab;
    ui.technique = null;
    ui.palaceEdit = null;
    render(true);
  }

  function go(target) {
    stop();
    ui.tab = target.tab || "today";
    ui.technique = target.technique || null;
    ui.palaceEdit = null;
    if (target.discipline) { playDiscipline(target.discipline); return; }
    if (target.drill && target.technique === "major") {
      const q = E.majorQueue(lab());
      if (q.due.length + q.fresh.length) { startMajor(); return; }
    }
    if (target.palaceId) { playPalace(target.palaceId); return; }
    render(true);
  }
  function playDiscipline(key) {
    const l = lab();
    const st = l.disciplines[key];
    ui.tab = "disciplines";
    startRound(E.makeRound(key, st.level, Date.now(), l), "discipline");
  }
  function playPalace(id) {
    const l = lab();
    const p = l.palaces.find((x) => x.id === id);
    if (!p) return;
    ui.tab = "techniques";
    ui.technique = "loci";
    startRound(E.makePalaceRound(l, id, Math.min(20, p.loci.length)), "technique");
  }

  // un doppio clic non deve premere anche il pulsante che compare al suo posto
  // (non vale per tastierino, blocchi e carte, dove si tocca in fretta di proposito)
  const SOFT = new Set(["key", "corsi", "span-undo", "card-prev", "card-next", "card-pick", "card-undo", "lv", "prog"]);

  function onClick(event) {
    const el = event.target.closest("[data-m]");
    if (!el || !$("memory").contains(el) || el.disabled) return;
    const act = el.dataset.m;
    if (!act) return;
    if (!SOFT.has(act) && (event.detail > 1 || Date.now() - renderedAt < 300)) return;
    const l = lab();
    switch (act) {
      case "exit": stop(); render(true); break;
      case "go": try { go(JSON.parse(el.dataset.go)); } catch (e) { setTab("today"); } break;
      case "span": startSpan(el.dataset.key); break;
      case "span-go": spanPlay(); break;
      case "key": {
        const r = ui.run;
        if (!r || r.phase !== "answer") break;
        const k = el.dataset.k;
        if (k === "del") r.input.pop();
        else if (k === "ok") { spanSubmit(); break; }
        else if (r.input.length < r.test.len + 2) r.input.push(Number(k));
        render(false, true);
        const okBtn = document.querySelector('#memPanel [data-k="ok"]');
        if (okBtn && k === "ok") okBtn.focus();
        break;
      }
      case "corsi": {
        const r = ui.run;
        const i = Number(el.dataset.i);
        if (!r || r.phase !== "answer" || r.input.includes(i)) break;
        r.input.push(i);
        render(false, true);
        break;
      }
      case "span-undo": if (ui.run) { ui.run.input.pop(); render(false, true); } break;
      case "span-ok": spanSubmit(); break;
      case "wordtest": startWords(); break;
      case "words-go": case "words-next": wordsShow(); break;
      case "words-ok": wordsSubmit(); break;
      case "delayed": startDelayedRecall(); break;
      case "delayed-ok": {
        const box = $("memWordsInput");
        ui.run.result = E.finishDelayed(l, box ? box.value : "");
        save();
        ui.run.phase = "result";
        render(true);
        break;
      }
      case "tech": ui.technique = el.dataset.id; render(true); break;
      case "tech-back": ui.technique = null; render(true); break;
      case "practice": {
        const kind = el.dataset.kind;
        if (kind === "palace") break;
        startRound(E.makeRound(kind, Number(el.dataset.level) || 1, Date.now(), l), "technique");
        break;
      }
      case "palace-new": ui.palaceEdit = { id: null }; render(true); break;
      case "palace-edit": ui.palaceEdit = { id: el.dataset.id }; render(true); break;
      case "palace-cancel": ui.palaceEdit = null; render(true); break;
      case "palace-save": {
        const name = $("memPalaceName").value;
        const loci = $("memPalaceLoci").value;
        const lines = loci.split(/\n+/).map((x) => x.trim()).filter(Boolean);
        if (lines.length < 3) { announce("Scrivi almeno 3 luoghi"); $("memPalaceCount").textContent = "Servono almeno 3 luoghi (meglio 10)."; break; }
        E.savePalace(l, { id: ui.palaceEdit.id, name, loci: lines });
        save();
        ui.palaceEdit = null;
        render(true);
        break;
      }
      case "palace-del": E.removePalace(l, el.dataset.id); save(); ui.palaceEdit = null; render(true); break;
      case "palace-play": playPalace(el.dataset.id); break;
      case "major-go": startMajor(); break;
      case "major-seen": ui.run.introduced = ui.run.q.code; ui.run.q = E.majorQuestion(ui.run.q.code, Date.now()); ui.run.answered = null; render(true); break;
      case "major-pick": majorAnswer(el.dataset.v); break;
      case "major-type": { const inp = $("memMajorInput"); majorAnswer(inp ? inp.value : ""); break; }
      case "major-next": ui.run.idx += 1; nextMajor(); break;
      case "lv": { const key = el.dataset.key; E.setLevel(l, key, l.disciplines[key].level + Number(el.dataset.d)); save(); render(false, true); break; }
      case "play": playDiscipline(el.dataset.key); break;
      case "level-up": E.setLevel(l, el.dataset.key, Number(el.dataset.level)); save(); playDiscipline(el.dataset.key); break;
      case "round-go": roundGo(); break;
      case "round-done": roundRecall(); break;
      case "round-check": roundCheck(); break;
      case "card-prev": if (ui.run.cardIdx > 0) { ui.run.cardIdx -= 1; render(false, true); } break;
      case "card-next": if (ui.run.cardIdx < ui.run.round.items.length - 1) { ui.run.cardIdx += 1; render(false, true); } break;
      case "card-pick": { const r = ui.run; const picked = r.answers.filter(Boolean); if (picked.length < r.round.items.length) { r.answers = picked.concat([el.dataset.c]); render(false, true); } break; }
      case "card-undo": { const r = ui.run; r.answers = r.answers.filter(Boolean).slice(0, -1); render(false, true); break; }
      case "prog": ui.progKey = el.dataset.key; render(false, true); break;
      default: break;
    }
  }

  function onKey(event) {
    const page = $("memory");
    if (!page || !page.classList.contains("active-page")) return;
    const r = ui.run;
    if (!r || event.ctrlKey || event.metaKey || event.altKey) return;
    const typing = event.target && /^(INPUT|TEXTAREA)$/.test(event.target.tagName);
    if (r.type === "span" && r.phase === "answer" && r.test.def.kind === "digit" && !typing) {
      if (/^[1-9]$/.test(event.key)) { if (r.input.length < r.test.len + 2) r.input.push(Number(event.key)); render(false, true); event.preventDefault(); }
      else if (event.key === "Backspace") { r.input.pop(); render(false, true); event.preventDefault(); }
      else if (event.key === "Enter") { spanSubmit(); event.preventDefault(); }
      return;
    }
    if (r.type === "span" && r.phase === "answer" && r.test.def.kind === "corsi" && event.key === "Enter" && r.input.length && !typing) { spanSubmit(); event.preventDefault(); return; }
    if (r.type === "round" && r.phase === "mem" && r.round.key === "cards") {
      if (event.key === "ArrowRight" && r.cardIdx < r.round.items.length - 1) { r.cardIdx += 1; render(false, true); event.preventDefault(); }
      else if (event.key === "ArrowLeft" && r.cardIdx > 0) { r.cardIdx -= 1; render(false, true); event.preventDefault(); }
      return;
    }
    if (r.type === "major" && r.q && r.q.kind === "pick" && !r.answered && /^[1-4]$/.test(event.key)) {
      majorAnswer(r.q.options[Number(event.key) - 1]);
      event.preventDefault();
      return;
    }
    if (r.type === "major" && r.q && r.q.kind === "type" && !r.answered && event.key === "Enter" && typing) {
      majorAnswer(event.target.value);
      event.preventDefault();
    }
  }

  function onInput(event) {
    const t = event.target;
    // righe dei numeri: a riga piena passa alla successiva
    if (t.matches && t.matches("#memPanel input[data-row]")) {
      t.value = t.value.replace(/[^\d ]/g, "");
      if (t.value.length >= Number(t.maxLength)) {
        const next = $("memPanel").querySelector(`input[data-row="${Number(t.dataset.row) + 1}"]`);
        if (next) next.focus();
      }
    }
    if (t.id === "memPalaceLoci") {
      const n = t.value.split(/\n+/).map((x) => x.trim()).filter(Boolean).length;
      const c = $("memPalaceCount");
      if (c) c.textContent = `${n} ${n === 1 ? "luogo" : "luoghi"}${n < 10 ? " (ne servono almeno 10 per allenarsi bene)" : ""}`;
    }
    if (t.id === "memAge") {
      const v = Number(t.value);
      const l = lab();
      l.profile.age = Number.isFinite(v) && v >= 16 && v <= 99 ? Math.round(v) : null;
      save();
    }
  }
  function onKeyEnterInWords(event) {
    // Invio nei campi parola: passa al campo dopo (comodo da telefono)
    const t = event.target;
    if (event.key !== "Enter" || !t.matches) return;
    if (t.matches("#memPanel .mem-word-inputs input, #memPanel .mem-faces.recall input")) {
      event.preventDefault();
      const all = [...$("memPanel").querySelectorAll(".mem-word-inputs input, .mem-faces.recall input")];
      const next = all[all.indexOf(t) + 1];
      if (next) next.focus();
      else roundCheck();
    }
  }

  window.MemoryUI = {
    render,
    stop,
    setTab,
    debug: ui
  };
  window.memoryProfileSkills = () => E.profile(lab());
  window.memoryTrend = () => E.trend(lab());

  document.addEventListener("DOMContentLoaded", () => {
    const page = $("memory");
    if (!page) return;
    page.addEventListener("click", (event) => {
      const tab = event.target.closest("[data-mem-tab]");
      if (tab) { setTab(tab.dataset.memTab); return; }
      if (event.target.closest("#memChip")) { setTab("today"); return; }
      onClick(event);
    });
    page.addEventListener("input", onInput);
    page.addEventListener("keydown", onKeyEnterInWords);
    document.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", () => { if (window.location.hash !== "#memory" && ui.run) { stop(); render(false); } });
    render(false);
  });
})();
