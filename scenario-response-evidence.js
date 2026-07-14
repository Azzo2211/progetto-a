(function(){
  const criterionMap={
    "Lettura dei fatti":{need:["osservo","noto","verifico","fatto","dato","segnale","contesto"],positive:"Hai indicato elementi osservabili o verificabili",missing:"non distingui chiaramente ciò che sai da ciò che stai ipotizzando",improve:"Aggiungi un fatto preciso, ciò che non sai ancora e come lo verifichi."},
    "Chiarezza":{need:["prima","poi","dopo","infine","subito"],positive:"Hai dato un ordine comprensibile ai passaggi",missing:"la risposta non ha una sequenza chiara e alcuni passaggi restano generici",improve:"Scrivi in ordine: cosa fai subito, cosa dici, cosa fai dopo e quando cambi strategia."},
    "Concretezza":{need:["dico","rispondo","chiedo","scrivo","propongo"],positive:"Hai inserito azioni o frasi applicabili",missing:"descrivi soprattutto intenzioni ma non la frase esatta o l'azione concreta",improve:"Inserisci la frase precisa che pronunceresti e un'azione osservabile."},
    "Controllo emotivo":{need:["calmo","tono","non urlo","respiro","distanza","senza accusare"],positive:"Hai previsto come mantenere controllo e tono",missing:"non spieghi come eviti una reazione impulsiva o un'escalation",improve:"Specifica tono, distanza, pausa prima di reagire e comportamento da evitare."},
    "Assertività":{need:["non accetto","non posso","basta","confine","serve","chiedo"],positive:"Hai espresso una posizione o un confine",missing:"la tua posizione non è abbastanza ferma o può essere fraintesa",improve:"Formula una frase breve con limite, richiesta e conseguenza proporzionata."},
    "Gestione del rischio":{need:["rischio","sicurezza","escalation","prova","traccia","distanza","conseguenza"],positive:"Hai riconosciuto almeno un rischio concreto",missing:"non consideri il pericolo principale o come ridurlo",improve:"Nomina il rischio specifico della scena e una misura concreta per contenerlo."},
    "Piano B":{need:["se continua","se insiste","se peggiora","altrimenti","piano b","se necessario"],positive:"Hai previsto cosa fare se il primo tentativo fallisce",missing:"la strategia si ferma al primo tentativo",improve:"Completa con: se non funziona o continua, allora faccio..."},
    "Etica e proporzione":{need:["rispetto","privacy","onesto","proporzionato","senza umiliare","non espongo"],positive:"Hai evitato soluzioni scorrette o sproporzionate",missing:"non chiarisci abbastanza come proteggi dignità, privacy e proporzione",improve:"Scegli la misura minima efficace ed evita umiliazione, inganno o vendetta."},
    "Flessibilità":{need:["potrebbe","alternativa","se invece","non do per scontato","verifico prima","ascolto"],positive:"Hai considerato più di una possibile interpretazione",missing:"tratti una sola lettura come certa",improve:"Aggiungi un'interpretazione alternativa e come cambieresti azione se fosse vera."},
    "Sequenza e tempismo":{need:["subito","prima","poi","dopo","infine","entro"],positive:"Hai distinto le diverse fasi dell'intervento",missing:"non è chiaro quando fai ogni cosa",improve:"Indica cosa fai subito, dopo la prima risposta e quando passi al livello successivo."}
  };
  const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  function evidence(answer,terms){return terms.filter(t=>norm(answer).includes(norm(t))).slice(0,3);}
  function quote(answer){const s=String(answer||"").trim();return s.length>180?s.slice(0,177)+"...":s;}
  function render(){
    const feedback=document.getElementById("scenarioFeedback");
    const panel=document.getElementById("scenarioCriterionExplanations");
    const textarea=document.getElementById("scenarioFreeAnswer");
    if(!feedback||!panel||!textarea)return;
    const answer=textarea.value.trim();
    if(!answer)return;
    const text=feedback.textContent||"";
    const cards=[...panel.querySelectorAll(".scenario-criterion-card")];
    cards.forEach(card=>{
      const label=card.querySelector(".scenario-criterion-head strong")?.textContent?.trim();
      const scoreText=card.querySelector(".scenario-criterion-head span")?.textContent||"";
      const score=Number(scoreText.replace(/\D/g,""));
      const cfg=criterionMap[label];
      if(!cfg)return;
      const hits=evidence(answer,cfg.need);
      const reason=hits.length
        ? `${cfg.positive}. Nella tua risposta compaiono elementi come “${hits.join("”, “")}”. ${score<70?"Però il criterio è presente solo in parte o non è sviluppato abbastanza.":"Questo sostiene il punteggio ottenuto."}`
        : `${cfg.missing}. Nella tua risposta non trovo riferimenti chiari a ${cfg.need.slice(0,3).join(", ")}.`;
      const paragraphs=card.querySelectorAll("p");
      if(paragraphs[0])paragraphs[0].innerHTML=`<b>Perché questo voto sulla tua risposta:</b> ${reason}`;
      if(paragraphs[1])paragraphs[1].innerHTML=`<b>Cosa migliorare nella tua risposta:</b> ${score===100?"Il criterio è completo; mantieni la stessa precisione anche in scenari più difficili.":cfg.improve}`;
    });
    let box=document.getElementById("scenarioAnswerQuoted");
    if(!box){box=document.createElement("div");box.id="scenarioAnswerQuoted";box.className="scenario-answer-quoted";panel.insertAdjacentElement("afterbegin",box);}
    box.innerHTML=`<strong>Risposta analizzata</strong><p>“${quote(answer)}”</p>`;
  }
  function attach(){
    const feedback=document.getElementById("scenarioFeedback");
    if(!feedback)return;
    new MutationObserver(()=>setTimeout(render,20)).observe(feedback,{childList:true,subtree:true,characterData:true});
    const style=document.createElement("style");style.textContent=".scenario-answer-quoted{margin:10px 0 14px;padding:12px;border-left:4px solid #f0a35a;background:rgba(240,163,90,.08);border-radius:0 12px 12px 0}.scenario-answer-quoted p{margin:6px 0 0;color:#dbe8e7;font-style:italic}";document.head.appendChild(style);
  }
  document.addEventListener("DOMContentLoaded",attach);
})();