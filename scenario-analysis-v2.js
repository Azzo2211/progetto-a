(function () {
  const advancedScenarios = [
    {
      type: "Scenario insolito",
      category: "strano",
      title: "L'ascensore si blocca con due persone che iniziano a litigare",
      text: "L'ascensore si ferma tra due piani. Una persona accusa l'altra di aver premuto un pulsante sbagliato e il tono sale rapidamente. Non sai quanto durerà il blocco. Scrivi cosa osservi, cosa dici, come riduci il rischio e cosa fai se qualcuno perde il controllo.",
      model: "Controllo prima il pulsante di emergenza e comunico la situazione. Poi dico con tono calmo: 'Adesso la priorità è uscire in sicurezza; discutere sul pulsante non ci aiuta.' Tengo distanza, evito contatto fisico e, se il tono peggiora, chiedo a ciascuno di stare su lati diversi mentre resto in comunicazione con l'assistenza.",
      ideal: ["emergenza", "sicurezza", "calmo", "distanza", "assistenza", "se peggiora", "priorita"],
      traps: ["spingo", "minaccio", "colpisco", "chiudo la bocca"],
      difficulty: 8,
      riskLevel: "Alto",
      objective: "Ridurre escalation in uno spazio chiuso"
    },
    {
      type: "Scenario assurdo",
      category: "strano",
      title: "A una cena tutti credono che tu sia un'altra persona",
      text: "Arrivi a una cena e, per un equivoco, diverse persone ti chiamano con un altro nome e ti attribuiscono un lavoro che non fai. Una persona inizia anche a confidarti informazioni private pensando di conoscerti. Scrivi quando correggi l'equivoco, con quale frase e come gestisci ciò che hai già sentito.",
      model: "Interrompo appena capisco l'equivoco: 'Credo ci sia un errore: io sono Maurizio, non la persona che pensate.' Non uso le informazioni ascoltate e dico alla persona che preferisco fermarla perché probabilmente non voleva condividerle con me. Mantengo un tono leggero senza alimentare la situazione.",
      ideal: ["errore", "chiarisco", "subito", "privacy", "non uso", "tono leggero"],
      traps: ["fingo", "sfrutto", "registro", "racconto agli altri"],
      difficulty: 6,
      riskLevel: "Medio",
      objective: "Correggere l'identità senza umiliare nessuno"
    },
    {
      type: "Tecnologia e reputazione",
      category: "strano",
      title: "Circola un audio falso con la tua voce",
      text: "In una chat di gruppo compare un audio che sembra avere la tua voce e contiene una frase offensiva. Alcuni ci credono, altri chiedono spiegazioni. Scrivi cosa fai nei primi dieci minuti, quali prove raccogli e come comunichi senza sembrare difensivo o confuso.",
      model: "Salvo il file e gli screenshot, verifico origine e orario, poi scrivo: 'Quell'audio non è mio. Sto verificando da dove provenga; nel frattempo vi chiedo di non inoltrarlo.' Contatto in privato gli amministratori e le persone coinvolte, preparo un confronto verificabile e, se necessario, segnalo formalmente il contenuto.",
      ideal: ["salvo", "screenshot", "origine", "non inoltrare", "amministratori", "verifico", "segnalo"],
      traps: ["minaccio tutti", "cancello prove", "accuso senza prove", "vendetta"],
      difficulty: 9,
      riskLevel: "Alto",
      objective: "Proteggere reputazione e catena delle prove"
    },
    {
      type: "Dilemma sociale",
      category: "strano",
      title: "Uno sconosciuto ti chiede di custodire una busta sigillata",
      text: "In una stazione uno sconosciuto agitato ti chiede di tenere per pochi minuti una busta chiusa mentre lui va via. Non sai cosa contenga. Vuole lasciartela in mano e insiste che è urgente. Scrivi cosa dici e come mantieni sicurezza senza creare panico.",
      model: "Non accetto la busta e rispondo: 'Non posso custodire oggetti di sconosciuti. Può rivolgersi al personale della stazione.' Mantengo distanza, non tocco l'oggetto e, se viene abbandonato, avviso il personale senza manipolarlo.",
      ideal: ["non accetto", "personale", "distanza", "non tocco", "avviso"],
      traps: ["apro", "porto via", "nascondo", "accetto"],
      difficulty: 7,
      riskLevel: "Alto",
      objective: "Rifiutare in modo sicuro e proporzionato"
    },
    {
      type: "Imbarazzo pubblico",
      category: "strano",
      title: "Durante una cerimonia ti assegnano per errore un premio",
      text: "Il presentatore pronuncia il tuo nome e ti consegna un premio che capisci essere destinato a un'altra persona. Il pubblico applaude e la diretta è già iniziata. Scrivi come correggi l'errore senza mettere in difficoltà il presentatore o il vero vincitore.",
      model: "Prendo il microfono con calma: 'Grazie, ma credo ci sia un errore nel nome. Preferisco fermarmi un momento per verificare e dare il riconoscimento alla persona corretta.' Sorrido, restituisco il premio al presentatore e lascio che l'organizzazione chiarisca.",
      ideal: ["errore", "verificare", "persona corretta", "calma", "restituisco"],
      traps: ["tengo il premio", "ridicolizzo", "scappo", "fingo"],
      difficulty: 6,
      riskLevel: "Medio",
      objective: "Correggere pubblicamente con eleganza"
    },
    {
      type: "Pressione di gruppo",
      category: "strano",
      title: "Tutti votano una decisione chiaramente sbagliata",
      text: "In una riunione dieci persone scelgono rapidamente una soluzione che, secondo i dati che hai davanti, creerà un problema serio. Sei l'unico contrario e il gruppo vuole chiudere. Scrivi come interrompi il consenso senza trasformarti nel nemico del gruppo.",
      model: "Non attacco le persone. Dico: 'Prima di chiudere, vorrei mostrare un dato che cambia il rischio della scelta.' Presento un fatto verificabile, propongo un test piccolo o una pausa breve e chiedo quale condizione farebbe rivedere la decisione.",
      ideal: ["dato", "rischio", "verificabile", "test", "condizione", "pausa"],
      traps: ["siete tutti stupidi", "impongo", "saboto", "minaccio"],
      difficulty: 8,
      riskLevel: "Medio-alto",
      objective: "Rompere il conformismo con prove"
    },
    {
      type: "Emergenza reputazionale",
      category: "strano",
      title: "Un giornalista ti fa una domanda a sorpresa davanti a una telecamera",
      text: "All'uscita da un evento una persona con telecamera ti chiede conto di una vicenda che conosci solo in parte. La domanda contiene un'accusa e cerca una reazione immediata. Scrivi una risposta di venti secondi e cosa fai subito dopo.",
      model: "Rispondo: 'Non ho elementi sufficienti per commentare in modo responsabile. Posso confermare che verificheremo i fatti e forniremo una risposta precisa tramite il canale ufficiale.' Non improvviso dettagli; annoto domanda e contesto, avviso le persone competenti e preparo una risposta documentata.",
      ideal: ["non ho elementi", "verificare", "fatti", "canale ufficiale", "risposta precisa", "non improvviso"],
      traps: ["nego tutto", "insulto", "invento", "scappo urlando"],
      difficulty: 9,
      riskLevel: "Alto",
      objective: "Evitare dichiarazioni impulsive e inaccurate"
    },
    {
      type: "Ambiguità estrema",
      category: "strano",
      title: "Una stanza intera smette di parlare quando entri",
      text: "Entri in una stanza e una conversazione si interrompe di colpo. Alcuni evitano il tuo sguardo. Potrebbero parlare di te oppure semplicemente di qualcosa di riservato. Scrivi come reagisci nei primi minuti e come verifichi senza creare paranoia.",
      model: "Non tratto il silenzio come una prova. Saluto normalmente, osservo se il comportamento continua e proseguo con il mio obiettivo. Solo se emergono segnali concreti chiedo in privato a una persona affidabile: 'Ho percepito un cambio di tono entrando; c'è qualcosa che devo sapere o era un tema riservato?'",
      ideal: ["non è una prova", "osservo", "segnali concreti", "privato", "chiedo"],
      traps: ["accuso tutti", "spio", "controllo telefoni", "minaccio"],
      difficulty: 7,
      riskLevel: "Medio",
      objective: "Separare percezione e prova"
    },
    {
      type: "Lealtà e integrità",
      category: "strano",
      title: "Un amico ti chiede di confermare una bugia piccola ma verificabile",
      text: "Un amico ti chiede di dire che era con te in un certo momento. Sembra una bugia piccola, ma la persona a cui dovresti dirla potrebbe facilmente verificare. Scrivi come proteggi il rapporto senza diventare parte della menzogna.",
      model: "Dico in privato: 'Non posso confermare una cosa falsa. Posso però aiutarti a spiegare la situazione in modo onesto o a preparare una risposta breve.' Non lo espongo davanti agli altri, ma non accetto di diventare una prova inventata.",
      ideal: ["non posso", "falsa", "privato", "onesto", "aiutarti", "non espongo"],
      traps: ["confermo", "ricatto", "umilio", "minaccio"],
      difficulty: 6,
      riskLevel: "Medio",
      objective: "Mantenere lealtà senza mentire"
    },
    {
      type: "Caos operativo",
      category: "strano",
      title: "Due responsabili ti danno ordini incompatibili nello stesso minuto",
      text: "Due persone con autorità ti assegnano richieste urgenti che non possono essere completate insieme. Entrambe danno per scontato di avere priorità. Scrivi come chiarisci la gerarchia senza scegliere arbitrariamente e senza apparire passivo.",
      model: "Rendo visibile il conflitto: 'Ho ricevuto due priorità incompatibili, A richiede due ore e B tre. Posso iniziare subito, ma serve una decisione sulla precedenza.' Metto entrambe le persone nello stesso scambio, propongo l'ordine più logico con motivo e chiedo conferma scritta.",
      ideal: ["incompatibili", "priorita", "tempo", "decisione", "propongo", "conferma"],
      traps: ["ignoro", "fingo di farle entrambe", "accuso", "sparisco"],
      difficulty: 8,
      riskLevel: "Medio-alto",
      objective: "Rendere esplicito il conflitto di priorità"
    }
  ];

  const dimensionLabels = {
    observation: "Lettura dei fatti",
    clarity: "Chiarezza",
    concrete: "Concretezza",
    emotionalControl: "Controllo emotivo",
    assertiveness: "Assertività",
    risk: "Gestione del rischio",
    contingency: "Piano B",
    ethics: "Etica e proporzione",
    flexibility: "Flessibilità",
    timing: "Sequenza e tempismo"
  };

  function normalizeText(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function hasAny(text, terms) {
    return terms.some((term) => text.includes(normalizeText(term)));
  }

  function countAny(text, terms) {
    return terms.reduce((sum, term) => sum + (text.includes(normalizeText(term)) ? 1 : 0), 0);
  }

  function sentenceCount(answer) {
    return Math.max(1, answer.split(/[.!?]+/).filter((part) => part.trim()).length);
  }

  function addAdvancedScenarios() {
    if (typeof scenarios === "undefined" || !Array.isArray(scenarios)) return;
    advancedScenarios.forEach((scenario) => {
      if (!scenarios.some((item) => item.title === scenario.title)) scenarios.push(scenario);
    });
    scenarios.forEach((scenario) => {
      if (!scenario.category) scenario.category = "reale";
    });
  }

  function ensureAdvancedControls() {
    const briefing = document.getElementById("scenarioBriefing");
    if (!briefing || document.getElementById("scenarioLabControls")) return;
    const controls = document.createElement("div");
    controls.id = "scenarioLabControls";
    controls.className = "scenario-lab-controls";
    controls.innerHTML = `
      <label class="scenario-filter-field"><span>Tipo di scenario</span><select id="scenarioCategoryFilter"><option value="all">Tutti</option><option value="reale">Realistici</option><option value="strano">Insoliti e strani</option></select></label>
      <label class="scenario-filter-field"><span>Difficoltà minima</span><select id="scenarioDifficultyFilter"><option value="1">Qualsiasi</option><option value="5">Da 5/10</option><option value="7">Da 7/10</option><option value="9">Da 9/10</option></select></label>`;
    briefing.insertAdjacentElement("afterend", controls);
  }

  function filteredScenarioPool() {
    if (typeof scenarios === "undefined") return [];
    const category = document.getElementById("scenarioCategoryFilter")?.value || "all";
    const minimum = Number(document.getElementById("scenarioDifficultyFilter")?.value || 1);
    const filtered = scenarios.filter((scenario) => {
      const categoryOk = category === "all" || (scenario.category || "reale") === category;
      return categoryOk && Number(scenario.difficulty || 4) >= minimum;
    });
    return filtered.length ? filtered : scenarios;
  }

  function setScenario(scenario) {
    currentScenario = scenario;
    document.getElementById("scenarioType").textContent = scenario.type;
    document.getElementById("scenarioTitle").textContent = scenario.title;
    document.getElementById("scenarioText").textContent = scenario.text;
    document.getElementById("scenarioFreeAnswer").value = "";
    document.getElementById("scenarioFeedback").textContent = "Costruisci la risposta in quattro passaggi: fatti osservabili, frase concreta, rischio e piano B.";
    document.getElementById("scenarioDifficulty").textContent = `${scenario.difficulty || 4}/10`;
    document.getElementById("scenarioRisk").textContent = scenario.riskLevel || "Medio";
    document.getElementById("scenarioObjective").textContent = scenario.objective || "Gestire la situazione con lucidità";
    document.getElementById("scenarioResultSummary")?.remove();
    document.getElementById("scenarioDeepAnalysis")?.remove();
    document.getElementById("scenarioFreeAnswer").dispatchEvent(new Event("input"));
    if (typeof renderScenarioBars === "function") renderScenarioBars();
  }

  function loadAdvancedScenario() {
    const pool = filteredScenarioPool();
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (next) setScenario(next);
  }

  function analyzeAnswer(answer, scenario) {
    const text = normalizeText(answer);
    const words = answer.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const sentences = sentenceCount(answer);
    const quoteLike = /["“”']/.test(answer) || hasAny(text, ["dico", "rispondo", "chiedo", "direi", "scrivo"]);
    const observationHits = countAny(text, ["osservo", "noto", "verifico", "fatti", "dato", "segnali", "contesto", "prima capisco", "non so ancora", "chiedo conferma"]);
    const sequenceHits = countAny(text, ["prima", "poi", "dopo", "subito", "nel frattempo", "infine", "se", "altrimenti"]);
    const controlHits = countAny(text, ["calmo", "tono basso", "non reagisco", "respiro", "breve", "senza accusare", "non urlo", "mantengo distanza"]);
    const assertiveHits = countAny(text, ["non accetto", "non posso", "basta", "preferisco", "chiedo", "serve", "la mia risposta", "fermo", "confine"]);
    const riskHits = countAny(text, ["rischio", "sicurezza", "escalation", "conseguenza", "prova", "traccia", "distanza", "non tocco", "non inoltrare", "personale", "autorita"]);
    const contingencyHits = countAny(text, ["se continua", "se insiste", "se peggiora", "altrimenti", "piano b", "passo successivo", "se non", "in quel caso", "se necessario"]);
    const ethicsHits = countAny(text, ["rispetto", "privacy", "onesto", "proporzionato", "senza umiliare", "non espongo", "non uso", "persona corretta"]);
    const flexibilityHits = countAny(text, ["potrebbe", "alternativa", "opzione", "verifico prima", "se invece", "non do per scontato", "ascolto"]);
    const idealHits = (scenario.ideal || []).filter((term) => text.includes(normalizeText(term))).length;
    const trapHits = (scenario.traps || []).filter((term) => text.includes(normalizeText(term))).length;
    const aggressionHits = countAny(text, ["urlo", "insulto", "minaccio", "picchio", "spingo", "vendetta", "umilio", "ricatto", "punisco", "rovino"]);
    const manipulationHits = countAny(text, ["fingo", "mento", "manipolo", "lo faccio sentire in colpa", "lo inganno", "registro di nascosto"]);
    const unsupportedCertainty = hasAny(text, ["sicuramente", "è ovvio che", "so che sta mentendo", "sono certo senza prove"]);

    const lengthQuality = wordCount < 20 ? 20 : wordCount < 40 ? 48 : wordCount <= 150 ? 78 : wordCount <= 230 ? 68 : 48;
    const scores = {
      observation: clamp(28 + observationHits * 11 + flexibilityHits * 3 - (unsupportedCertainty ? 16 : 0), 0, 100),
      clarity: clamp(lengthQuality + Math.min(sentences, 7) * 3 + sequenceHits * 3 - Math.max(0, sentences - 10) * 3, 0, 100),
      concrete: clamp(28 + (quoteLike ? 24 : 0) + idealHits * 6 + sequenceHits * 4, 0, 100),
      emotionalControl: clamp(42 + controlHits * 10 - aggressionHits * 25, 0, 100),
      assertiveness: clamp(34 + assertiveHits * 10 + (quoteLike ? 7 : 0) - manipulationHits * 10, 0, 100),
      risk: clamp(30 + riskHits * 9 + observationHits * 3 - trapHits * 18 - aggressionHits * 20, 0, 100),
      contingency: clamp(24 + contingencyHits * 14 + sequenceHits * 2, 0, 100),
      ethics: clamp(62 + ethicsHits * 7 - trapHits * 20 - aggressionHits * 20 - manipulationHits * 22, 0, 100),
      flexibility: clamp(30 + flexibilityHits * 12 + observationHits * 3 - (unsupportedCertainty ? 15 : 0), 0, 100),
      timing: clamp(30 + sequenceHits * 9 + contingencyHits * 3, 0, 100)
    };

    const difficulty = Number(scenario.difficulty || 4);
    const completeness = [scores.observation, scores.concrete, scores.risk, scores.contingency].filter((score) => score >= 55).length;
    let total = averageObject(scores);
    total += idealHits * 1.4;
    total -= trapHits * 5 + aggressionHits * 7 + manipulationHits * 6;
    if (completeness === 4) total += 5;
    if (difficulty >= 8 && total >= 70) total += 2;
    total = Math.round(clamp(total, 0, 100));

    const immediate = Math.round(averageArray([scores.clarity, scores.concrete, scores.assertiveness, scores.timing]));
    const longTerm = Math.round(averageArray([scores.ethics, scores.risk, scores.contingency, scores.flexibility, scores.observation]));
    return { scores, total, immediate, longTerm, idealHits, trapHits, aggressionHits, manipulationHits, wordCount };
  }

  function weakestDimensions(scores, count = 3) {
    return Object.entries(scores).sort((a, b) => a[1] - b[1]).slice(0, count);
  }

  function strongestDimensions(scores, count = 2) {
    return Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, count);
  }

  function improvementFor(key) {
    const map = {
      observation: "Distingui ciò che sai da ciò che stai ipotizzando e cita almeno un fatto osservabile.",
      clarity: "Riduci la risposta a passaggi ordinati: prima, poi, se necessario.",
      concrete: "Inserisci la frase esatta che diresti, non solo l'intenzione generale.",
      emotionalControl: "Descrivi come mantieni tono, distanza e autocontrollo durante la pressione.",
      assertiveness: "Formula un confine o una richiesta breve, chiara e non aggressiva.",
      risk: "Nomina il rischio principale e una misura concreta per ridurlo.",
      contingency: "Aggiungi cosa fai se la prima risposta non funziona.",
      ethics: "Evita umiliazione, inganno, ricatto o punizioni sproporzionate.",
      flexibility: "Considera almeno un'interpretazione alternativa prima di accusare.",
      timing: "Indica cosa fai subito, cosa fai dopo e quando cambi strategia."
    };
    return map[key];
  }

  function renderAdvancedResult(result, scenario) {
    const feedback = document.getElementById("scenarioFeedback");
    const label = result.total >= 85 ? "Strategia molto solida" : result.total >= 70 ? "Buona risposta" : result.total >= 55 ? "Risposta discreta ma incompleta" : result.total >= 40 ? "Strategia fragile" : "Risposta ad alto rischio";
    const strongest = strongestDimensions(result.scores);
    const weakest = weakestDimensions(result.scores);

    let summary = document.getElementById("scenarioResultSummary");
    if (!summary) {
      summary = document.createElement("div");
      summary.id = "scenarioResultSummary";
      summary.className = "scenario-result-summary";
      feedback.insertAdjacentElement("beforebegin", summary);
    }
    summary.innerHTML = `
      <div class="scenario-result-card"><span>Valutazione</span><strong>${result.total}</strong><small>${label}</small></div>
      <div class="scenario-result-card"><span>Impatto immediato</span><strong>${result.immediate}</strong><small>Chiarezza e fermezza</small></div>
      <div class="scenario-result-card"><span>Tenuta futura</span><strong>${result.longTerm}</strong><small>Rischio, etica e piano B</small></div>`;

    let deep = document.getElementById("scenarioDeepAnalysis");
    if (!deep) {
      deep = document.createElement("section");
      deep.id = "scenarioDeepAnalysis";
      deep.className = "scenario-deep-analysis";
      feedback.insertAdjacentElement("afterend", deep);
    }
    deep.innerHTML = `
      <div class="scenario-analysis-column">
        <h3>Cosa funziona</h3>
        <ul>${strongest.map(([key, value]) => `<li><strong>${dimensionLabels[key]} ${Math.round(value)}</strong>: elemento già convincente.</li>`).join("")}</ul>
      </div>
      <div class="scenario-analysis-column">
        <h3>Cosa migliorare</h3>
        <ul>${weakest.map(([key, value]) => `<li><strong>${dimensionLabels[key]} ${Math.round(value)}</strong>: ${improvementFor(key)}</li>`).join("")}</ul>
      </div>
      <div class="scenario-rewrite-box">
        <h3>Struttura consigliata</h3>
        <p><strong>1. Fatti:</strong> “Prima verifico…”<br><strong>2. Frase:</strong> “Dico in modo breve…”<br><strong>3. Rischio:</strong> “Evito che…”<br><strong>4. Piano B:</strong> “Se continua, allora…”</p>
        <details><summary>Confronta con una risposta modello</summary><p>${scenario.model}</p></details>
      </div>`;

    feedback.innerHTML = `<strong>${label}: ${result.total}/100</strong><br>${Object.entries(result.scores).map(([key, value]) => `${dimensionLabels[key]} ${Math.round(value)}`).join(" · ")}<br><small>${result.wordCount} parole · elementi specifici trovati ${result.idealHits} · segnali rischiosi ${result.trapHits + result.aggressionHits + result.manipulationHits}</small>`;
    feedback.classList.toggle("scenario-danger-note", result.total < 45);
  }

  function analyzeAdvancedScenarioAnswer() {
    const answer = document.getElementById("scenarioFreeAnswer").value.trim();
    if (!answer) {
      document.getElementById("scenarioFeedback").textContent = "Scrivi una risposta completa: fatti, frase concreta, rischio e piano B.";
      return;
    }
    if (answer.split(/\s+/).length < 12) {
      document.getElementById("scenarioFeedback").textContent = "La risposta è troppo breve per essere valutata bene. Inserisci almeno cosa osservi, cosa dici e cosa fai se non funziona.";
      return;
    }
    const result = analyzeAnswer(answer, currentScenario);
    const mapping = {
      clarity: result.scores.clarity,
      context: result.scores.observation,
      ethics: result.scores.ethics,
      empathy: Math.round(averageArray([result.scores.ethics, result.scores.flexibility])),
      assertiveness: result.scores.assertiveness,
      leverage: result.scores.concrete,
      risk: result.scores.risk,
      timing: result.scores.timing,
      contingency: result.scores.contingency
    };
    Object.entries(mapping).forEach(([key, value]) => {
      state.socialScores[key] = clamp(Math.round(state.socialScores[key] * 0.82 + value * 0.18), 0, 100);
    });
    if (typeof updateModuleMetrics === "function") {
      updateModuleMetrics("scenarios", {
        lucidita: Math.round((result.scores.observation - 50) / 10),
        efficacia: Math.round((result.immediate - 50) / 10),
        rischio: Math.round((result.scores.risk - 50) / 10),
        controllo: Math.round((result.scores.emotionalControl - 50) / 10),
        adattamento: Math.round((result.scores.flexibility - 50) / 10),
        ragionamento: Math.round((result.scores.concrete - 50) / 10),
        sostenibilita: Math.round((result.longTerm - 50) / 10),
        tempo: Math.round((result.scores.timing - 50) / 10)
      });
    }
    if (typeof addModulePattern === "function") {
      weakestDimensions(result.scores, 2).forEach(([key]) => addModulePattern("scenarios", key));
    }
    saveState();
    renderAdvancedResult(result, currentScenario);
    if (typeof renderScenarioBars === "function") renderScenarioBars();
    if (typeof renderDashboard === "function") renderDashboard();
  }

  function loadStyles() {
    if (document.getElementById("scenarioAnalysisV2Style")) return;
    const link = document.createElement("link");
    link.id = "scenarioAnalysisV2Style";
    link.rel = "stylesheet";
    link.href = "scenario-analysis-v2.css?v=20260714-1";
    document.head.appendChild(link);
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadStyles();
    addAdvancedScenarios();
    setTimeout(function () {
      ensureAdvancedControls();
      document.getElementById("scenarioCategoryFilter")?.addEventListener("change", loadAdvancedScenario);
      document.getElementById("scenarioDifficultyFilter")?.addEventListener("change", loadAdvancedScenario);
    }, 0);
  });

  window.loadRandomScenario = loadAdvancedScenario;
  window.analyzeScenarioAnswer = analyzeAdvancedScenarioAnswer;
})();