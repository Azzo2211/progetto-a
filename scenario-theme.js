(function () {
  const extraScenarios = [
    {
      type: "Reputazione",
      title: "Un collega si prende il merito del tuo lavoro",
      text: "Durante una riunione, un collega presenta come propria un'idea che avevi preparato tu. Il responsabile sembra credergli. Scrivi cosa osservi, cosa dici in riunione, cosa fai dopo e come difendi la tua reputazione senza creare una guerra personale.",
      model: "Intervengo con calma e precisione: 'Aggiungo un dettaglio, perché questa proposta nasce dal lavoro che ho preparato ieri sui dati X e Y.' Dopo la riunione invio un riepilogo scritto con contributi e prossimi passaggi. Se il comportamento si ripete, ne parlo in privato con il responsabile portando fatti e date.",
      ideal: ["calma", "fatti", "dati", "riepilogo", "privato", "responsabile", "date", "contributi"],
      traps: ["umilio", "vendetta", "urlo", "minaccio"],
      difficulty: 7,
      riskLevel: "Medio-alto",
      objective: "Proteggere reputazione e prove"
    },
    {
      type: "Leadership",
      title: "Il gruppo è bloccato e nessuno decide",
      text: "Una squadra deve scegliere tra due opzioni, ma tutti evitano la responsabilità. Il tempo sta finendo. Scrivi come raccogli le informazioni minime, proponi una decisione e mantieni il gruppo coinvolto.",
      model: "Riassumo i criteri decisivi, assegno cinque minuti per l'ultimo dato mancante e poi propongo una scelta motivata. Chiedo obiezioni concrete, non opinioni generiche. Se non emergono rischi nuovi, chiudo la decisione e assegno responsabilità e verifica.",
      ideal: ["criteri", "tempo", "dati", "propongo", "obiezioni", "rischi", "responsabilita", "verifica"],
      traps: ["decido io", "zitti", "obbligo", "colpa"],
      difficulty: 6,
      riskLevel: "Medio",
      objective: "Sbloccare decisione e responsabilità"
    },
    {
      type: "Confini",
      title: "Una persona insiste dopo che hai già detto no",
      text: "Hai rifiutato una richiesta, ma la persona continua a fare pressione e prova a farti sentire in colpa. Scrivi una risposta che mantenga il rapporto, protegga il tuo confine e preveda cosa fare se insiste ancora.",
      model: "Ripeto il confine senza nuove giustificazioni: 'Capisco che per te sia importante, ma la mia risposta resta no.' Se insiste, chiudo la conversazione e la riprendo solo quando il tono torna rispettoso. Non compenso il no con promesse che non voglio mantenere.",
      ideal: ["capisco", "risposta resta no", "confine", "se insiste", "chiudo", "rispettoso", "senza giustificazioni"],
      traps: ["minaccio", "sparisco", "ricatto", "umilio"],
      difficulty: 5,
      riskLevel: "Medio",
      objective: "Mantenere un confine stabile"
    },
    {
      type: "Ambiguità",
      title: "Ricevi un messaggio freddo da una persona importante",
      text: "Una persona importante ti risponde con poche parole e senza il solito tono. Potrebbe essere infastidita, occupata o distante. Scrivi come eviti reazioni impulsive, verifichi il contesto e proteggi la relazione.",
      model: "Non reagisco al tono come se fosse una prova. Aspetto un momento adatto e chiedo: 'Ti sento più distante del solito: è solo una giornata piena o c'è qualcosa da chiarire?' Mantengo il messaggio breve e non aggiungo accuse.",
      ideal: ["non reagisco", "aspetto", "chiedo", "chiarire", "giornata", "senza accuse", "breve"],
      traps: ["accuso", "bombardo", "punisco", "controllo"],
      difficulty: 4,
      riskLevel: "Basso-medio",
      objective: "Verificare prima di interpretare"
    },
    {
      type: "Negoziazione",
      title: "Ti offrono meno di quanto ritieni corretto",
      text: "Ricevi una proposta economica più bassa delle aspettative. Vuoi negoziare senza sembrare aggressivo o bisognoso. Scrivi apertura, argomenti, alternativa e punto oltre il quale non accetti.",
      model: "Ringrazio e separo il rapporto dal numero. Espongo il valore con risultati e responsabilità, propongo una fascia concreta e chiedo quali vincoli impediscono di raggiungerla. Se il budget non cambia, valuto benefit o una revisione con data e condizioni misurabili.",
      ideal: ["valore", "risultati", "fascia", "vincoli", "benefit", "revisione", "data", "condizioni"],
      traps: ["ultimatum", "offesa", "bisogno", "minaccia"],
      difficulty: 7,
      riskLevel: "Medio",
      objective: "Aumentare valore senza rompere il rapporto"
    }
  ];

  function addStylesheet() {
    if (document.getElementById("scenarioThemeStylesheet")) return;
    const link = document.createElement("link");
    link.id = "scenarioThemeStylesheet";
    link.rel = "stylesheet";
    link.href = "scenario-theme.css?v=20260714-1";
    document.head.appendChild(link);
  }

  function extendScenarioPool() {
    if (typeof scenarios === "undefined" || !Array.isArray(scenarios)) return;
    extraScenarios.forEach((scenario) => {
      if (!scenarios.some((item) => item.title === scenario.title)) scenarios.push(scenario);
    });
  }

  function inferDifficulty(scenario) {
    if (scenario && scenario.difficulty) return scenario.difficulty;
    const type = String(scenario?.type || "").toLowerCase();
    if (type.includes("conflitto") || type.includes("pressione")) return 6;
    if (type.includes("negoziazione")) return 5;
    return 4;
  }

  function inferRisk(scenario) {
    if (scenario && scenario.riskLevel) return scenario.riskLevel;
    const type = String(scenario?.type || "").toLowerCase();
    if (type.includes("pressione") || type.includes("conflitto")) return "Medio-alto";
    if (type.includes("negoziazione")) return "Medio";
    return "Basso-medio";
  }

  function inferObjective(scenario) {
    if (scenario && scenario.objective) return scenario.objective;
    const type = String(scenario?.type || "").toLowerCase();
    if (type.includes("pressione")) return "Mantenere posizione senza escalation";
    if (type.includes("negoziazione")) return "Creare accordo e responsabilità";
    if (type.includes("autocontrollo")) return "Proteggere reputazione e controllo";
    return "Leggere il contesto e verificare i fatti";
  }

  function ensureBriefing() {
    const title = document.getElementById("scenarioTitle");
    if (!title) return null;
    let wrapper = document.getElementById("scenarioBriefing");
    if (wrapper) return wrapper;
    wrapper = document.createElement("div");
    wrapper.id = "scenarioBriefing";
    wrapper.className = "scenario-briefing";
    wrapper.innerHTML = `
      <div class="scenario-briefing-item"><span>Difficoltà</span><strong id="scenarioDifficulty">--</strong></div>
      <div class="scenario-briefing-item"><span>Rischio</span><strong id="scenarioRisk">--</strong></div>
      <div class="scenario-briefing-item"><span>Obiettivo</span><strong id="scenarioObjective">--</strong></div>`;
    title.insertAdjacentElement("afterend", wrapper);
    return wrapper;
  }

  function ensureAnswerTools() {
    const textarea = document.getElementById("scenarioFreeAnswer");
    if (!textarea) return null;
    let tools = document.getElementById("scenarioAnswerTools");
    if (tools) return tools;
    tools = document.createElement("div");
    tools.id = "scenarioAnswerTools";
    tools.className = "scenario-answer-tools";
    tools.innerHTML = `
      <span class="scenario-check-chip" data-check="observe">Osservazione</span>
      <span class="scenario-check-chip" data-check="phrase">Frase concreta</span>
      <span class="scenario-check-chip" data-check="risk">Rischio</span>
      <span class="scenario-check-chip" data-check="planb">Piano B</span>
      <span class="scenario-word-count" id="scenarioWordCount">0 parole</span>`;
    textarea.insertAdjacentElement("afterend", tools);
    textarea.addEventListener("input", updateAnswerTools);
    return tools;
  }

  function updateAnswerTools() {
    const textarea = document.getElementById("scenarioFreeAnswer");
    if (!textarea) return;
    const text = textarea.value.toLowerCase();
    const words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
    const count = document.getElementById("scenarioWordCount");
    if (count) count.textContent = `${words} parole`;
    const checks = {
      observe: ["osservo", "noto", "segnali", "contesto", "tono", "chi"],
      phrase: ["dico", "rispondo", "chiedo", "preferisco", "non accetto", "basta"],
      risk: ["rischio", "evito", "escalation", "conseguenza", "reazione"],
      planb: ["piano b", "se continua", "altrimenti", "se insiste", "passo successivo", "dopo"]
    };
    Object.entries(checks).forEach(([key, terms]) => {
      const chip = document.querySelector(`[data-check="${key}"]`);
      if (chip) chip.classList.toggle("active", terms.some((term) => text.includes(term)));
    });
  }

  function renderBriefing() {
    ensureBriefing();
    const scenario = typeof currentScenario !== "undefined" ? currentScenario : null;
    const difficulty = document.getElementById("scenarioDifficulty");
    const risk = document.getElementById("scenarioRisk");
    const objective = document.getElementById("scenarioObjective");
    if (difficulty) difficulty.textContent = `${inferDifficulty(scenario)}/10`;
    if (risk) risk.textContent = inferRisk(scenario);
    if (objective) objective.textContent = inferObjective(scenario);
    updateAnswerTools();
  }

  function enhanceFeedback() {
    const feedback = document.getElementById("scenarioFeedback");
    if (!feedback) return;
    const text = feedback.textContent || "";
    const scoreMatch = text.match(/Punteggio risposta:\s*(\d+)\/100/i);
    if (!scoreMatch) return;
    const score = Number(scoreMatch[1]);
    const shortMatch = text.match(/Breve periodo:\s*(\d+)/i);
    const longMatch = text.match(/Lungo periodo:\s*(\d+)/i);
    let summary = document.getElementById("scenarioResultSummary");
    if (!summary) {
      summary = document.createElement("div");
      summary.id = "scenarioResultSummary";
      summary.className = "scenario-result-summary";
      feedback.insertAdjacentElement("beforebegin", summary);
    }
    const label = score >= 80 ? "Risposta solida" : score >= 65 ? "Buona base" : score >= 50 ? "Da rendere più concreta" : "Risposta fragile";
    summary.innerHTML = `
      <div class="scenario-result-card"><span>Valutazione</span><strong>${score}</strong><small>${label}</small></div>
      <div class="scenario-result-card"><span>Breve periodo</span><strong>${shortMatch ? shortMatch[1] : "--"}</strong><small>Impatto immediato</small></div>
      <div class="scenario-result-card"><span>Lungo periodo</span><strong>${longMatch ? longMatch[1] : "--"}</strong><small>Tenuta della strategia</small></div>`;
    feedback.classList.toggle("scenario-danger-note", score < 50);
  }

  function enableTheme() {
    const section = document.getElementById("scenarios");
    if (section) section.classList.add("scenario-theme");
  }

  const originalLoadRandomScenario = window.loadRandomScenario;
  window.loadRandomScenario = function () {
    const result = typeof originalLoadRandomScenario === "function" ? originalLoadRandomScenario.apply(this, arguments) : undefined;
    setTimeout(() => {
      renderBriefing();
      const summary = document.getElementById("scenarioResultSummary");
      if (summary) summary.remove();
    }, 0);
    return result;
  };

  const originalAnalyzeScenarioAnswer = window.analyzeScenarioAnswer;
  window.analyzeScenarioAnswer = function () {
    const result = typeof originalAnalyzeScenarioAnswer === "function" ? originalAnalyzeScenarioAnswer.apply(this, arguments) : undefined;
    setTimeout(enhanceFeedback, 0);
    return result;
  };

  document.addEventListener("DOMContentLoaded", function () {
    addStylesheet();
    extendScenarioPool();
    enableTheme();
    ensureBriefing();
    ensureAnswerTools();
    setTimeout(renderBriefing, 0);
  });
})();

(function loadScenarioAnalysisV2() {
  if (document.getElementById("scenarioAnalysisV2Script")) return;
  const script = document.createElement("script");
  script.id = "scenarioAnalysisV2Script";
  script.src = "scenario-analysis-v2.js?v=20260714-1";
  document.head.appendChild(script);
})();

(function loadScenarioCriterionExplanations() {
  if (document.getElementById("scenarioCriterionExplanationsScript")) return;
  const script = document.createElement("script");
  script.id = "scenarioCriterionExplanationsScript";
  script.src = "scenario-criterion-explanations.js?v=20260714-2";
  document.head.appendChild(script);
})();

(function loadScenarioSpecificExpansion() {
  if (document.getElementById("scenarioSpecificExpansionScript")) return;
  const script = document.createElement("script");
  script.id = "scenarioSpecificExpansionScript";
  script.src = "scenario-specific-expansion.js?v=20260715-1";
  document.head.appendChild(script);
})();

(function loadScenarioResponseEvidence() {
  if (document.getElementById("scenarioResponseEvidenceScript")) return;
  const script = document.createElement("script");
  script.id = "scenarioResponseEvidenceScript";
  script.src = "scenario-response-evidence.js?v=20260715-1";
  document.head.appendChild(script);
})();