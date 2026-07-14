(function () {
  const criteria = {
    "Lettura dei fatti": {
      low: "La risposta distingue poco tra fatti e supposizioni: rischi di reagire a un'interpretazione non verificata.",
      mid: "Hai individuato alcuni elementi reali, ma mancano verifiche o segnali concreti sufficienti.",
      high: "Separi bene ciò che osservi da ciò che ipotizzi e basi la scelta su elementi verificabili.",
      improve: "Indica cosa hai realmente visto o sentito, cosa non sai ancora e come lo verifichi prima di agire."
    },
    "Chiarezza": {
      low: "La risposta è difficile da seguire oppure troppo generica; non emerge un ordine operativo preciso.",
      mid: "L'idea principale è comprensibile, ma alcuni passaggi restano vaghi o mescolati.",
      high: "La risposta è ordinata, diretta e facile da trasformare in comportamento reale.",
      improve: "Dividi la risposta in: prima cosa faccio, frase che dico, rischio da evitare e passo successivo."
    },
    "Concretezza": {
      low: "Descrivi soprattutto intenzioni generali, senza dire esattamente cosa faresti o pronunceresti.",
      mid: "Sono presenti azioni concrete, ma manca una frase completa o una conseguenza operativa.",
      high: "Indichi azioni, parole e passaggi applicabili immediatamente nella situazione.",
      improve: "Scrivi la frase esatta che diresti e almeno un'azione osservabile da compiere subito."
    },
    "Controllo emotivo": {
      low: "La strategia può apparire impulsiva, aggressiva o poco controllata sotto pressione.",
      mid: "Mantieni un controllo discreto, ma non spieghi bene come eviti escalation o reazioni emotive.",
      high: "Proteggi tono, distanza, lucidità e reputazione anche mentre la pressione aumenta.",
      improve: "Specifica tono di voce, distanza, pausa prima di reagire e comportamento da evitare."
    },
    "Assertività": {
      low: "Il confine o la richiesta non sono chiari; la risposta rischia di essere passiva oppure aggressiva.",
      mid: "La posizione si capisce, ma può essere resa più breve, ferma e difficile da fraintendere.",
      high: "Esprimi un confine o una richiesta chiara senza minacciare né sottometterti.",
      improve: "Usa una frase breve: cosa non accetti, cosa chiedi e quale conseguenza proporzionata seguirà."
    },
    "Gestione del rischio": {
      low: "La risposta non individua il pericolo principale o potrebbe aumentare il danno e l'escalation.",
      mid: "Riconosci alcuni rischi, ma le misure preventive non sono ancora sufficientemente precise.",
      high: "Prevedi conseguenze, proteggi prove e persone e scegli misure proporzionate al rischio.",
      improve: "Nomina il rischio principale e aggiungi una misura concreta per ridurlo o contenerlo."
    },
    "Piano B": {
      low: "La strategia termina dopo il primo tentativo; se non funziona non è chiaro cosa farai.",
      mid: "Esiste un'alternativa, ma non è definito quando attivarla o quale risultato deve produrre.",
      high: "Prevedi una seconda linea d'azione chiara e una condizione precisa per cambiare strategia.",
      improve: "Completa con: se continua o non funziona, allora faccio… e specifica quando."
    },
    "Etica e proporzione": {
      low: "La risposta usa o rischia di usare umiliazione, inganno, ricatto o reazioni sproporzionate.",
      mid: "La strategia è generalmente corretta, ma può proteggere meglio dignità, privacy e proporzione.",
      high: "Difendi il tuo interesse senza abusare di potere, mentire o danneggiare inutilmente gli altri.",
      improve: "Elimina minacce, vendette e manipolazioni; scegli la misura minima efficace e verificabile."
    },
    "Flessibilità": {
      low: "Tratti una sola interpretazione come certa e rischi di accusare o agire senza alternative.",
      mid: "Consideri qualche alternativa, ma la strategia cambia poco se emergono informazioni nuove.",
      high: "Valuti più spiegazioni e adatti la risposta ai segnali senza perdere il tuo obiettivo.",
      improve: "Aggiungi almeno un'interpretazione alternativa e spiega come cambieresti azione se fosse vera."
    },
    "Sequenza e tempismo": {
      low: "Le azioni non hanno un ordine chiaro oppure avvengono troppo presto, troppo tardi o tutte insieme.",
      mid: "L'ordine generale è sensato, ma mancano tempi, priorità o condizioni per il passaggio successivo.",
      high: "Distingui bene cosa fare subito, cosa rimandare e quando aumentare o ridurre l'intervento.",
      improve: "Usa una sequenza esplicita: subito, dopo la prima risposta e infine se la situazione continua."
    }
  };

  function level(score) {
    if (score < 40) return { key: "low", name: "Insufficiente" };
    if (score < 60) return { key: "low", name: "Fragile" };
    if (score < 75) return { key: "mid", name: "Discreto" };
    if (score < 90) return { key: "high", name: "Solido" };
    return { key: "high", name: "Eccellente" };
  }

  function parseScores() {
    const feedback = document.getElementById("scenarioFeedback");
    if (!feedback) return [];
    const text = feedback.textContent || "";
    return Object.keys(criteria).map((label) => {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = text.match(new RegExp(`${escaped}\\s+(\\d{1,3})`, "i"));
      return match ? [label, Math.max(0, Math.min(100, Number(match[1])))] : null;
    }).filter(Boolean);
  }

  function render() {
    const scores = parseScores();
    if (!scores.length) return;
    const feedback = document.getElementById("scenarioFeedback");
    let panel = document.getElementById("scenarioCriterionExplanations");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "scenarioCriterionExplanations";
      panel.className = "scenario-criterion-explanations";
      const deep = document.getElementById("scenarioDeepAnalysis");
      (deep || feedback).insertAdjacentElement("afterend", panel);
    }
    panel.innerHTML = `<h3>Spiegazione criterio per criterio</h3><p class="scenario-criterion-intro">Ogni voto indica quanto la risposta soddisfa quel criterio. Per ciascuno trovi il motivo del punteggio e la modifica più utile.</p><div class="scenario-criterion-grid">${scores.map(([label, score]) => {
      const meta = criteria[label];
      const band = level(score);
      const reason = score >= 90 ? `${meta.high} Il punteggio è vicino al massimo perché il criterio è presente in modo completo e coerente.` : score >= 75 ? meta.high : score >= 60 ? meta.mid : meta.low;
      const improve = score === 100 ? "Nessuna correzione essenziale: mantieni questa qualità anche in scenari più difficili." : meta.improve;
      return `<article class="scenario-criterion-card score-${band.key}"><div class="scenario-criterion-head"><strong>${label}</strong><span>${score}/100</span></div><div class="scenario-criterion-band">${band.name}</div><p><b>Perché questo voto:</b> ${reason}</p><p><b>Cosa migliorare:</b> ${improve}</p></article>`;
    }).join("")}</div>`;
  }

  function attachStyles() {
    if (document.getElementById("scenarioCriterionExplanationStyles")) return;
    const style = document.createElement("style");
    style.id = "scenarioCriterionExplanationStyles";
    style.textContent = `
      .scenario-criterion-explanations{margin-top:16px;padding:16px;border:1px solid rgba(86,214,198,.22);border-radius:16px;background:rgba(5,18,23,.76)}
      .scenario-criterion-explanations h3{margin:0 0 5px;color:#fff}.scenario-criterion-intro{color:#9db7b5;margin:0 0 13px}
      .scenario-criterion-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.scenario-criterion-card{padding:13px;border-radius:13px;background:rgba(12,35,42,.88);border:1px solid rgba(86,214,198,.18)}
      .scenario-criterion-head{display:flex;justify-content:space-between;gap:10px;color:#fff}.scenario-criterion-head span{font-weight:900;color:#56d6c6}.scenario-criterion-band{display:inline-block;margin:7px 0;padding:3px 7px;border-radius:999px;font-size:11px;font-weight:800;background:rgba(86,214,198,.12);color:#9af0df}
      .scenario-criterion-card p{margin:7px 0 0;color:#dbe8e7;line-height:1.5;font-size:13px}.scenario-criterion-card.score-low{border-color:rgba(220,95,103,.35)}.scenario-criterion-card.score-low .scenario-criterion-head span{color:#ff8e96}
      @media(max-width:760px){.scenario-criterion-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  document.addEventListener("DOMContentLoaded", function () {
    attachStyles();
    const feedback = document.getElementById("scenarioFeedback");
    if (!feedback) return;
    new MutationObserver(function () { setTimeout(render, 0); }).observe(feedback, { childList: true, subtree: true, characterData: true });
  });
})();