(function(){
  "use strict";

  const criteria=[
    ["clarity",["Chiarezza"]],
    ["context",["Lettura contesto","Lettura del contesto","Lettura dei fatti"]],
    ["ethics",["Etica","Etica e proporzione"]],
    ["empathy",["Empatia"]],
    ["assertiveness",["Assertività","Assertivita"]],
    ["leverage",["Leva","Leva sociale"]],
    ["risk",["Gestione rischio","Gestione del rischio"]],
    ["timing",["Tempismo","Sequenza e tempismo"]],
    ["contingency",["Piano B"]]
  ];

  const terms={
    sequence:["prima","poi","dopo","successivamente","infine","subito","inizialmente","a quel punto"],
    action:["dico","direi","chiedo","chiederei","scrivo","scriverei","propongo","proporrei","faccio","farei","verifico","controllo","avviso","contatto"],
    objective:["obiettivo","per ottenere","in modo da","così da","per evitare","priorità","risultato"],
    context:["osservo","noto","verifico","fatto","dato","segnale","contesto","situazione","non so","prima di concludere"],
    uncertainty:["potrebbe","forse","non è certo","non do per scontato","ipotesi","verifico prima","non so ancora"],
    ethics:["rispetto","privacy","onesto","proporzionato","senza umiliare","senza accusare","non espongo","non mento","non uso"],
    empathy:["capisco","comprendo","ascolto","punto di vista","preoccupazione","esigenza","bisogno","emozione","come si sente"],
    boundary:["non accetto","non posso","non intendo","chiedo che","serve","basta","confine","la mia posizione","preferisco","ritengo necessario"],
    leverage:["dato","prova","beneficio","vantaggio","alternativa","opzione","conseguenza","criterio","proposta","accordo","incentivo","scadenza"],
    risk:["rischio","sicurezza","pericolo","escalation","prova","traccia","conseguenza","danno","tutelo","evito"],
    reduceRisk:["ridurre","limitare","proteggere","salvo","documento","mantengo distanza","avviso","segnalo","chiedo conferma","metto per iscritto"],
    timing:["subito","entro","prima","poi","dopo","successivamente","infine","quando","appena","nei primi"],
    planB:["se continua","se insiste","se peggiora","se non funziona","altrimenti","in alternativa","piano b","se necessario","in quel caso","qualora"],
    harmful:["urlo","insulto","minaccio","vendetta","umilio","ricatto","punisco","aggredisco","spingo","colpisco","fingo","mento","manipolo","inganno"]
  };

  const normalize=value=>String(value||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’‘]/g,"'");
  const escapeHtml=value=>String(value||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
  const hits=(answer,list,limit=4)=>list.filter(term=>normalize(answer).includes(normalize(term))).slice(0,limit);
  const sentenceList=answer=>String(answer||"").split(/(?<=[.!?;])\s+|\n+/).map(part=>part.trim()).filter(Boolean);
  const quoteTerms=list=>list.slice(0,2).map(item=>`“${escapeHtml(item)}”`).join(" e ");
  const level=score=>score>=80?"alto":score>=60?"medio-alto":score>=40?"intermedio":"basso";

  function evidence(answer,list){
    const sentence=sentenceList(answer).find(item=>list.some(term=>normalize(item).includes(normalize(term))));
    if(!sentence)return "";
    const excerpt=sentence.length>180?sentence.slice(0,177)+"...":sentence;
    return ` La frase della tua risposta che incide maggiormente è: “${escapeHtml(excerpt)}”.`;
  }

  function currentScenarioData(){
    let scenario=null;
    try{if(typeof currentScenario!=="undefined")scenario=currentScenario;}catch(error){}
    return {
      objective:document.getElementById("scenarioObjective")?.textContent?.trim()||scenario?.objective||"",
      risk:document.getElementById("scenarioRisk")?.textContent?.trim()||scenario?.riskLevel||"",
      ideal:Array.isArray(scenario?.ideal)?scenario.ideal:[],
      traps:Array.isArray(scenario?.traps)?scenario.traps:[]
    };
  }

  function inspectAnswer(answer,scenario){
    const found={};
    Object.entries(terms).forEach(([key,list])=>{found[key]=hits(answer,list,5);});
    return {
      found,
      idealFound:scenario.ideal.filter(term=>normalize(answer).includes(normalize(term))),
      idealMissing:scenario.ideal.filter(term=>!normalize(answer).includes(normalize(term))),
      trapsFound:scenario.traps.filter(term=>normalize(answer).includes(normalize(term))),
      words:answer.trim()?answer.trim().split(/\s+/).length:0,
      direct:/["“”']/.test(answer)||/\b(dico|direi|rispondo|risponderei|chiedo|chiederei)\b/i.test(answer)
    };
  }

  function scenarioSpecific(data,scenario){
    let text="";
    if(data.idealFound.length)text+=` Hai considerato ${quoteTerms(data.idealFound)}.`;
    if(data.idealMissing.length)text+=` Non risultano affrontati ${quoteTerms(data.idealMissing)}, che erano elementi specifici dello scenario.`;
    if(!data.idealFound.length&&!data.idealMissing.length&&scenario.objective)text+=` L'obiettivo della scena è “${escapeHtml(scenario.objective)}”.`;
    return text;
  }

  function explain(key,score,answer,scenario,data){
    const f=data.found,positive=[],missing=[];
    if(key==="clarity"){
      f.sequence.length?positive.push(`usi un ordine con ${quoteTerms(f.sequence)}`):missing.push("non emerge cosa fai prima, cosa dici e cosa fai dopo");
      f.action.length?positive.push("indichi almeno un'azione concreta"):missing.push("non specifichi un'azione o una frase realmente pronunciata");
      f.objective.length?positive.push("rendi riconoscibile il risultato cercato"):missing.push("non chiarisci quale risultato vuoi ottenere");
      if(data.words<18)missing.push(`la risposta è molto breve (${data.words} parole) e lascia passaggi impliciti`);
      return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; tuttavia ":""}${missing.join("; ")}.`+evidence(answer,[...terms.sequence,...terms.action]);
    }
    if(key==="context"){
      f.context.length?positive.push(`richiami il contesto con ${quoteTerms(f.context)}`):missing.push("non separi fatti osservabili e interpretazioni");
      f.uncertainty.length?positive.push("lasci spazio a più spiegazioni prima di decidere"):missing.push("non indichi cosa deve ancora essere verificato");
      if(!data.idealFound.length&&scenario.ideal.length)missing.push("non riprendi gli elementi specifici richiesti dalla scena");
      return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; mentre ":""}${missing.join("; ")}.`+scenarioSpecific(data,scenario)+evidence(answer,[...terms.context,...terms.uncertainty]);
    }
    if(key==="ethics"){
      if(!f.harmful.length&&!data.trapsFound.length)positive.push("non usi minacce, inganni o reazioni sproporzionate");
      f.ethics.length?positive.push(`espliciti tutele come ${quoteTerms(f.ethics)}`):missing.push("non spieghi espressamente come tuteli dignità, privacy e proporzione");
      if(f.harmful.length)missing.push(`compaiono espressioni problematiche come ${quoteTerms(f.harmful)}`);
      if(data.trapsFound.length)missing.push(`usi una scelta rischiosa per questa scena: ${quoteTerms(data.trapsFound)}`);
      return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; ma ":""}${missing.join("; ")}.`+evidence(answer,[...terms.ethics,...terms.harmful]);
    }
    if(key==="empathy"){
      f.empathy.length?positive.push(`consideri il punto di vista altrui con ${quoteTerms(f.empathy)}`):missing.push("descrivi quasi solo la tua azione senza considerare cosa gli altri possano pensare, temere o volere");
      f.uncertainty.length?positive.push("eviti di attribuire intenzioni certe"):missing.push("non distingui il comportamento osservato dalle possibili motivazioni altrui");
      return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; tuttavia ":""}${missing.join("; ")}.`+evidence(answer,[...terms.empathy,...terms.uncertainty]);
    }
    if(key==="assertiveness"){
      f.boundary.length?positive.push(`esprimi una posizione con ${quoteTerms(f.boundary)}`):missing.push("non emerge una richiesta, un limite o una decisione netta");
      data.direct?positive.push("indichi cosa diresti concretamente"):missing.push("non riporti una frase che potresti pronunciare davvero");
      if(f.harmful.length)missing.push("la fermezza è indebolita da un tono aggressivo o manipolativo");
      return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; ma ":""}${missing.join("; ")}.`+evidence(answer,[...terms.boundary,...terms.action]);
    }
    if(key==="leverage"){
      f.leverage.length?positive.push(`usi leve concrete come ${quoteTerms(f.leverage)}`):missing.push("non usi dati, prove, vantaggi, alternative o conseguenze per dare forza alla proposta");
      f.action.length?positive.push("trasformi la leva in un'azione"):missing.push("non colleghi il ragionamento a una proposta operativa");
      if(!data.idealFound.length&&scenario.ideal.length)missing.push("non utilizzi gli elementi specifici che avrebbero avuto peso in questa scena");
      return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; mentre ":""}${missing.join("; ")}.`+scenarioSpecific(data,scenario)+evidence(answer,[...terms.leverage,...terms.action]);
    }
    if(key==="risk"){
      f.risk.length?positive.push(`riconosci rischi o conseguenze con ${quoteTerms(f.risk)}`):missing.push("non nomini il pericolo principale o la conseguenza da evitare");
      f.reduceRisk.length?positive.push("indichi una misura concreta per contenerlo"):missing.push("non spieghi quale misura concreta riduce il rischio");
      if(data.trapsFound.length)missing.push(`la risposta contiene una scelta segnalata come rischiosa: ${quoteTerms(data.trapsFound)}`);
      return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; tuttavia ":""}${missing.join("; ")}.`+(scenario.risk?` Il livello di rischio della scena è ${escapeHtml(scenario.risk)}.`:"")+evidence(answer,[...terms.risk,...terms.reduceRisk]);
    }
    if(key==="timing"){
      f.timing.length?positive.push(`indichi quando agire con ${quoteTerms(f.timing)}`):missing.push("non è chiaro cosa fai subito e cosa rimandi");
      f.sequence.length>=2?positive.push("separi più fasi"):missing.push("la strategia non distingue abbastanza le fasi");
      if(!f.planB.length)missing.push("non indichi quando passeresti a una risposta diversa");
      return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; ma ":""}${missing.join("; ")}.`+evidence(answer,[...terms.timing,...terms.planB]);
    }
    f.planB.length?positive.push(`prevedi una condizione alternativa con ${quoteTerms(f.planB)}`):missing.push("la risposta termina al primo tentativo e non dice cosa accade se non funziona");
    f.action.length>=2?positive.push("descrivi più di un'azione possibile"):missing.push("non emerge una seconda azione distinta dalla prima");
    return `Il punteggio è ${level(score)} perché ${positive.join(", ")}${positive.length&&missing.length?"; tuttavia ":""}${missing.join("; ")}.`+evidence(answer,[...terms.planB,...terms.action]);
  }

  function regexEscape(value){return value.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
  function readScore(text,labels,separator="\\s*"){
    for(const label of labels){
      const match=text.match(new RegExp(`${regexEscape(label)}${separator}(\\d{1,3})\\s*%?`,"i"));
      if(match)return Math.max(0,Math.min(100,Number(match[1])));
    }
    return null;
  }

  function visibleScores(bars){
    const text=bars.textContent||"";
    return criteria.map(([key,labels])=>{
      const score=readScore(text,labels);
      if(score===null)return null;
      const label=labels.find(item=>new RegExp(regexEscape(item),"i").test(text))||labels[0];
      return {key,labels,label,score};
    }).filter(Boolean);
  }

  function answerScores(feedback){
    const text=feedback.textContent||"";
    const ethics=readScore(text,["Etica e proporzione","Etica"],"\\s+");
    const flexibility=readScore(text,["Flessibilità","Flessibilita"],"\\s+");
    return {
      clarity:readScore(text,["Chiarezza"],"\\s+"),
      context:readScore(text,["Lettura dei fatti","Lettura contesto"],"\\s+"),
      ethics,
      empathy:ethics!==null&&flexibility!==null?Math.round((ethics+flexibility)/2):ethics,
      assertiveness:readScore(text,["Assertività","Assertivita"],"\\s+"),
      leverage:readScore(text,["Concretezza","Leva"],"\\s+"),
      risk:readScore(text,["Gestione del rischio","Gestione rischio"],"\\s+"),
      timing:readScore(text,["Sequenza e tempismo","Tempismo"],"\\s+"),
      contingency:readScore(text,["Piano B"],"\\s+")
    };
  }

  function findRow(bars,labels){
    return [...bars.children].filter(element=>!element.classList.contains("scenario-inline-score-reason")).find(element=>labels.some(label=>normalize(element.textContent).includes(normalize(label))))||null;
  }

  let lastSignature="";
  function render(){
    const bars=document.getElementById("scenarioBars");
    const textarea=document.getElementById("scenarioFreeAnswer");
    const feedback=document.getElementById("scenarioFeedback");
    if(!bars||!textarea||!feedback||!textarea.value.trim())return;
    const visible=visibleScores(bars);
    if(!visible.length)return;
    const current=answerScores(feedback);
    const scenario=currentScenarioData();
    const answer=textarea.value.trim();
    const signature=JSON.stringify([answer,visible.map(item=>[item.key,item.score,current[item.key]])]);
    if(signature===lastSignature&&bars.querySelectorAll(".scenario-inline-score-reason").length===visible.length)return;
    lastSignature=signature;
    const data=inspectAnswer(answer,scenario);
    bars.querySelectorAll(".scenario-inline-score-reason").forEach(element=>element.remove());
    visible.forEach(item=>{
      const row=findRow(bars,item.labels);
      if(!row)return;
      const responseScore=current[item.key];
      const intro=responseScore===null||responseScore===undefined
        ?`Il valore mostrato è ${item.score}/100.`
        :`Il valore ${item.score}/100 è il profilo cumulativo aggiornato. Nella risposta appena analizzata questo criterio vale ${responseScore}/100.`;
      const box=document.createElement("div");
      box.className="scenario-inline-score-reason";
      box.innerHTML=`<strong>Perché ${escapeHtml(item.label)} è ${item.score}/100</strong><p>${intro} ${explain(item.key,responseScore??item.score,answer,scenario,data)}</p>`;
      row.insertAdjacentElement("afterend",box);
    });
    document.getElementById("scenarioScoreReasonsV2")?.remove();
    document.getElementById("scenarioCriterionExplanations")?.remove();
  }

  function schedule(){setTimeout(render,0);setTimeout(render,80);setTimeout(render,250);}
  function init(){
    if(!document.getElementById("scenarioScoreReasonsV3Styles")){
      const style=document.createElement("style");
      style.id="scenarioScoreReasonsV3Styles";
      style.textContent=".scenario-inline-score-reason{width:100%;box-sizing:border-box;margin:8px 0 14px;padding:11px 13px;border-left:3px solid rgba(86,214,198,.85);border-radius:0 10px 10px 0;background:rgba(86,214,198,.07);color:#dbe8e7;line-height:1.48}.scenario-inline-score-reason strong{display:block;margin-bottom:5px;color:#fff;font-size:13px}.scenario-inline-score-reason p{margin:0;color:#c8d9d7;font-size:12.5px}#scenarioScoreReasonsV2,#scenarioCriterionExplanations{display:none!important}";
      document.head.appendChild(style);
    }
    const button=document.getElementById("analyzeScenarioBtn");
    const bars=document.getElementById("scenarioBars");
    const feedback=document.getElementById("scenarioFeedback");
    const next=document.getElementById("newScenarioBtn");
    if(!button||!bars||!feedback)return;
    button.addEventListener("click",schedule);
    next?.addEventListener("click",()=>{
      lastSignature="";
      document.querySelectorAll(".scenario-inline-score-reason").forEach(element=>element.remove());
    });
    new MutationObserver(schedule).observe(bars,{childList:true,subtree:true,characterData:true});
    new MutationObserver(schedule).observe(feedback,{childList:true,subtree:true,characterData:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();