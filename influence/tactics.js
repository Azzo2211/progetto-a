/*
 * Progetto A - Influenza: catalogo delle leve e delle tattiche (id, nome, famiglia, definizione,
 * contromossa). Lo usano il manuale, le schede, gli esercizi di riconoscimento e il profilo.
 * Famiglie: leva (persuasione, Cialdini e tecniche in sequenza), cornice (bias di decisione),
 * nego (negoziazione), manip (manipolazione: si studia per riconoscerla e neutralizzarla).
 */
(function (root) {
  "use strict";
  const FAMILIES = {
    leva: { label: "Leve di persuasione", short: "Leve" },
    cornice: { label: "Cornici e bias", short: "Bias" },
    nego: { label: "Negoziazione", short: "Trattativa" },
    manip: { label: "Manipolazione", short: "Manipolazione" }
  };
  // def = che cos'e' (una frase); counter = cosa fai quando la usano su di te
  const TACTICS = {
    reciprocita: { family: "leva", label: "Reciprocità", def: "Ricevere qualcosa ci fa sentire in debito: tendiamo a ricambiare, anche con più di quanto abbiamo ricevuto.", counter: "Accetta il regalo per quello che è e valuta la richiesta come se il regalo non ci fosse." },
    impegno: { family: "leva", label: "Impegno e coerenza", def: "Dopo aver detto sì, o preso posizione in pubblico, vogliamo restare coerenti con quello che abbiamo detto.", counter: "Chiediti: sapendo quello che so adesso, lo rifarei? Se no, cambiare idea è lucidità, non incoerenza." },
    riprova: { family: "leva", label: "Riprova sociale", def: "Quando siamo incerti guardiamo cosa fanno gli altri, soprattutto quelli simili a noi.", counter: "Chiedi chi sono davvero «gli altri» e se la loro situazione è come la tua." },
    autorita: { family: "leva", label: "Autorità", def: "Seguiamo chi sembra esperto o ha un ruolo, spesso anche solo per i simboli: titolo, divisa, sicurezza nel parlare.", counter: "Chiedi: è davvero esperto di questo? Che interesse ha? Cosa direbbe un altro esperto?" },
    simpatia: { family: "leva", label: "Simpatia", def: "Diciamo sì più facilmente a chi ci piace: chi è simile a noi, ci fa complimenti, collabora con noi.", counter: "Separa la persona dall'offerta: l'accordo sarebbe buono anche con uno sconosciuto antipatico?" },
    scarsita: { family: "leva", label: "Scarsità", def: "Quello che è raro o sta per finire sembra più prezioso, e l'idea di perderlo spinge a decidere in fretta.", counter: "Chiediti perché lo vuoi: per usarlo o per non perderlo? Se la scadenza è vera, lo sarà anche domani mattina." },
    unita: { family: "leva", label: "Unità", def: "«Siamo dei nostri»: famiglia, paese, squadra, identità comune. Chi è dei nostri ci influenza di più.", counter: "Riconosci il legame e poi giudica la richiesta nel merito, come faresti con un estraneo." },
    piede: { family: "leva", label: "Piede nella porta", def: "Prima una richiesta piccola che è facile accettare, poi quella grande: il primo sì rende più probabile il secondo.", counter: "Valuta ogni richiesta da sola: aver detto sì alla prima non ti obbliga alla seconda." },
    porta: { family: "leva", label: "Porta in faccia", def: "Prima una richiesta esagerata che verrà rifiutata, poi quella vera, che sembra una concessione da ricambiare.", counter: "Dimentica la prima richiesta: la seconda la accetteresti se fosse arrivata per prima?" },
    lowball: { family: "leva", label: "Palla bassa", def: "Si ottiene il sì con condizioni vantaggiose, poi le condizioni peggiorano: molti restano nell'accordo già preso.", counter: "Se le condizioni cambiano, la decisione si rifà da zero: hai diritto di ritirarti." },
    nonfinito: { family: "leva", label: "«Non è finita»", def: "Prima che tu risponda, l'offerta migliora (uno sconto, un omaggio): sembra un regalo e fa dire sì.", counter: "Confronta il prezzo finale con il mercato, non con il primo prezzo detto." },
    perche: { family: "leva", label: "Il «perché»", def: "Una richiesta accompagnata da una ragione viene accettata di più, anche quando la ragione è vuota.", counter: "Ascolta la ragione: spiega davvero qualcosa o è solo un «perché sì» ben vestito?" },
    libero: { family: "leva", label: "«Ma sei libero»", def: "Ricordare all'altro che è libero di dire no riduce la resistenza e aumenta i sì.", counter: "Sei davvero libero: usalo. Una richiesta educata resta una richiesta." },
    ancora: { family: "cornice", label: "Ancoraggio", def: "Il primo numero detto fa da ancora: le stime e le controfferte restano vicine a lui, anche se è arbitrario.", counter: "Prima di sentire numeri, decidi il tuo valore con dati esterni; se arriva un'ancora assurda, non contrattare da lì: rimettila in discussione." },
    cornice: { family: "cornice", label: "Cornice (framing)", def: "Gli stessi fatti presentati in modo diverso (90% di successo o 10% di fallimento) portano a scelte diverse.", counter: "Riformula nell'altro modo: se il giudizio cambia, stai reagendo alla cornice, non ai fatti." },
    perdita: { family: "cornice", label: "Avversione alla perdita", def: "Perdere fa più male di quanto faccia piacere guadagnare la stessa cifra: «non perdere 200 €» spinge più di «guadagna 200 €».", counter: "Traduci la perdita in guadagno e chiediti se lo vorresti ancora." },
    esca: { family: "cornice", label: "Effetto esca", def: "Un'opzione inserita apposta per essere peggiore fa sembrare migliore quella vicina.", counter: "Togli mentalmente l'opzione che nessuno sceglierebbe e confronta quelle rimaste." },
    default: { family: "cornice", label: "Opzione predefinita", def: "Quello che è già selezionato tende a restare: cambiare richiede uno sforzo e sembra una presa di posizione.", counter: "Davanti a una casella già spuntata chiediti: la sceglierei se partissi da zero?" },
    contrasto: { family: "cornice", label: "Contrasto", def: "Giudichiamo per confronto: dopo una cosa cara, una meno cara sembra economica; dopo una richiesta grande, una media sembra piccola.", counter: "Confronta con alternative vere, non con quello che ti hanno mostrato prima." },
    specchio: { family: "nego", label: "Specchio", def: "Ripetere le ultime parole dell'altro, con tono di domanda, lo spinge a spiegare di più e crea sintonia.", counter: "Se ti ripetono le parole e tu parli molto, fermati: stai dando informazioni." },
    etichetta: { family: "nego", label: "Etichetta", def: "Dare un nome all'emozione o alla preoccupazione dell'altro («sembra che i tempi ti preoccupino») abbassa la tensione e fa emergere cosa conta davvero.", counter: "Se ti etichettano bene, va bene: è comunicazione. Decidi tu quanto rivelare." },
    calibrata: { family: "nego", label: "Domanda calibrata", def: "Una domanda aperta con «come» o «cosa» che fa ragionare l'altro sul tuo problema: «Come faccio ad accettare questo prezzo?».", counter: "Rispondi con i tuoi criteri e restituisci una domanda: non fare concessioni solo per rispondere." },
    audit: { family: "nego", label: "Audit delle accuse", def: "Dire per primo le critiche che l'altro potrebbe fare («penserai che sono rigido…») le toglie forza.", counter: "Riconosci la mossa e guarda la sostanza: l'aver ammesso il difetto non lo elimina." },
    condizionata: { family: "nego", label: "Concessione condizionata", def: "Mai concedere gratis: «se tu fai X, io faccio Y». Ogni concessione compra qualcosa.", counter: "Quando ti chiedono qualcosa, chiedi a tua volta: cosa ricevo in cambio?" },
    batna: { family: "nego", label: "Alternativa (BATNA)", def: "La migliore cosa che puoi fare se non c'è accordo. Più è forte, più sei libero di dire no.", counter: "Prima di trattare, conosci la tua alternativa e stima la loro." },
    criterio: { family: "nego", label: "Criterio oggettivo", def: "Ancorare la discussione a un riferimento esterno (listino, perizia, prezzo di mercato) invece che alla volontà di chi è più testardo.", counter: "Controlla il criterio: è davvero indipendente o l'hanno scelto apposta?" },
    gaslighting: { family: "manip", label: "Gaslighting", def: "Negare fatti evidenti o la tua memoria («non è mai successo», «ti inventi le cose») finché inizi a dubitare di te.", counter: "Tieni traccia per iscritto (date, messaggi), confrontati con persone di fiducia, non discutere all'infinito sulla realtà." },
    darvo: { family: "manip", label: "DARVO", def: "Quando viene accusato: nega, attacca chi accusa e si presenta come la vera vittima (Deny, Attack, Reverse Victim and Offender).", counter: "Riporta il discorso al fatto iniziale: «Stiamo parlando di quello che è successo martedì»." },
    lovebombing: { family: "manip", label: "Love bombing", def: "Attenzioni, regali e complimenti esagerati all'inizio, per creare dipendenza e abbassare le difese.", counter: "Lascia scorrere il tempo: l'affetto vero regge la lentezza e i tuoi «no»." },
    colpa: { family: "manip", label: "Ricatto emotivo", def: "Usare colpa, paura o obbligo («dopo tutto quello che ho fatto per te…») per ottenere qualcosa.", counter: "Separa l'emozione dalla richiesta: puoi capire come si sente e dire comunque no." },
    isolamento: { family: "manip", label: "Isolamento", def: "Allontanarti poco a poco da amici, famiglia o fonti esterne, così resta una sola voce.", counter: "Mantieni i tuoi legami e le tue fonti: se qualcuno ti chiede di tagliarli, è il segnale." },
    rinforzo: { family: "manip", label: "Rinforzo intermittente", def: "Alternare calore e freddezza in modo imprevedibile: l'attesa della ricompensa crea un legame difficile da spezzare.", counter: "Guarda il comportamento medio, non i picchi: conta come ti tratta di solito." },
    triangolazione: { family: "manip", label: "Triangolazione", def: "Mettere in mezzo una terza persona (vera o inventata) per creare gelosia, competizione o pressione.", counter: "Parla direttamente con la persona coinvolta e non entrare nella gara." },
    urgenza: { family: "manip", label: "Falsa urgenza", def: "Una fretta creata ad arte («solo adesso», «decidi entro 10 minuti») per impedirti di pensare e confrontare.", counter: "Le decisioni importanti si prendono a mente fredda: «Ti rispondo domani». Se l'offerta sparisce, non era un'offerta." },
    paletti: { family: "manip", label: "Spostare i paletti", def: "Ogni volta che soddisfi una richiesta, la richiesta cambia: non è mai abbastanza.", counter: "Fissa per iscritto cosa è stato chiesto e cosa hai fatto; chiedi qual è il criterio finale." },
    silenzio: { family: "manip", label: "Silenzio punitivo", def: "Ignorarti o toglierti la parola per punirti e farti cedere.", counter: "Non inseguire: dì una volta che sei disponibile a parlare e poi vai avanti con la tua giornata." }
  };
  const api = { FAMILIES, TACTICS };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.InfluenceTactics = api;
})(typeof window !== "undefined" ? window : globalThis);
