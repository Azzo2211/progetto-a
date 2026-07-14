(function(){
  const labels=["Chiarezza","Lettura dei fatti","Concretezza","Controllo emotivo","Assertività","Gestione del rischio","Piano B","Etica e proporzione","Flessibilità","Sequenza e tempismo"];
  function reason(label,score,answer){
    const a=(answer||"").toLowerCase();
    const hasSequence=/\b(prima|poi|dopo|infine|subito)\b/.test(a);
    const hasAction=/\b(dico|chiedo|scrivo|propongo|faccio|verifico)\b/.test(a);
    const hasAlternative=/\b(se|altrimenti|in alternativa|piano b)\b/.test(a);
    const hasContext=/\b(osservo|noto|contesto|fatto|dato|segnale)\b/.test(a);
    const hasTone=/\b(calmo|tono|pausa|ascolto)\b/.test(a);
    if(label==="Chiarezza") return hasSequence?"La risposta presenta un ordine comprensibile, ma il voto dipende da quanto sono distinti i passaggi e l'obiettivo.":"Il voto è basso perché nella risposta non emerge una sequenza chiara: non si capisce cosa fai prima, cosa fai dopo e quale risultato vuoi ottenere.";
    if(label==="Lettura dei fatti") return hasContext?"Hai citato elementi del contesto; il punteggio dipende da quanto distingui fatti, dubbi e interpretazioni.":"Il voto è basso perché la risposta non indica quali fatti osservi e quali informazioni devi ancora verificare.";
    if(label==="Concretezza") return hasAction?"Hai indicato almeno un'azione concreta; il punteggio dipende dalla precisione della frase o del comportamento descritto.":"Il voto è basso perché la risposta resta generale e non specifica cosa diresti o faresti realmente.";
    if(label==="Controllo emotivo") return hasTone?"Hai considerato il modo in cui reagire; il punteggio dipende da quanto descrivi tono, pausa e autocontrollo.":"Il voto è basso perché non spieghi come manterresti lucidità e controllo durante la situazione.";
    if(label==="Assertività") return hasAction?"Hai espresso un'azione o una richiesta; il punteggio dipende da quanto è chiara e ferma.":"Il voto è basso perché non emerge una posizione precisa, una richiesta o un limite comprensibile.";
    if(label==="Gestione del rischio") return /rischio|sicurezza|conseguenza|prova/.test(a)?"Hai considerato almeno un rischio; il punteggio dipende da quanto è concreta la misura scelta per ridurlo.":"Il voto è basso perché non indichi quale problema potrebbe verificarsi e come lo limiteresti.";
    if(label==="Piano B") return hasAlternative?"Hai previsto un'alternativa; il punteggio dipende da quando la useresti e con quale obiettivo.":"Il voto è basso perché la risposta termina al primo tentativo e non dice cosa faresti se non funzionasse.";
    if(label==="Etica e proporzione") return "Il punteggio indica quanto la risposta tutela le persone coinvolte e usa una reazione proporzionata alla situazione.";
    if(label==="Flessibilità") return hasAlternative?"Hai considerato almeno una possibilità alternativa; il punteggio dipende da quanto adatti la strategia alle nuove informazioni.":"Il voto è basso perché la risposta considera una sola lettura della situazione e non prevede alternative.";
    if(label==="Sequenza e tempismo") return hasSequence?"Hai indicato una successione di azioni; il punteggio dipende da quanto sono chiari i tempi e le condizioni di passaggio.":"Il voto è basso perché non è chiaro cosa fai subito, cosa rimandi e quando cambi strategia.";
    return score<60?"Il voto è basso perché il criterio è poco visibile nella risposta.":"Il voto è alto perché il criterio è presente nella risposta.";
  }
  function render(){
    const feedback=document.getElementById("scenarioFeedback");
    const answer=document.getElementById("scenarioFreeAnswer")?.value||"";
    if(!feedback||!answer.trim())return;
    let panel=document.getElementById("scenarioScoreReasonsV2");
    if(!panel){panel=document.createElement("section");panel.id="scenarioScoreReasonsV2";panel.className="scenario-score-reasons-v2";feedback.insertAdjacentElement("afterend",panel);}
    const text=feedback.textContent||"";
    const items=labels.map(label=>{const m=text.match(new RegExp(label+"\\s+(\\d{1,3})","i"));return m?[label,Number(m[1])]:null;}).filter(Boolean);
    if(!items.length)return;
    panel.innerHTML='<h3>Perché hai ottenuto questi punteggi</h3>'+items.map(([label,score])=>'<div class="scenario-score-reason"><strong>'+label+' '+score+'/100</strong><p>'+reason(label,score,answer)+'</p></div>').join('');
  }
  document.addEventListener("DOMContentLoaded",function(){const f=document.getElementById("scenarioFeedback");if(!f)return;new MutationObserver(()=>setTimeout(render,30)).observe(f,{childList:true,subtree:true,characterData:true});});
})();