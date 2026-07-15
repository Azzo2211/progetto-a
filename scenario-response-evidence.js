(function(){
  "use strict";

  function loadScoreExplanations(){
    const old=document.getElementById("scenarioScoreExplainV2Script");
    if(old)old.remove();
    const script=document.createElement("script");
    script.id="scenarioScoreExplainV2Script";
    script.src="scenario-score-explain-v2.js?v=20260715-3";
    document.head.appendChild(script);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",loadScoreExplanations,{once:true});
  }else{
    loadScoreExplanations();
  }
})();