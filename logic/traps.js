/*
 * Progetto A - Logica: le trappole della mente. Esperimenti classici della psicologia del
 * ragionamento, con la risposta giusta, quella d'istinto (lure) e i dati degli studi originali.
 * type: "choice" (answer = indice dell'opzione) o "number" (answer, tol, unit).
 */
(function (root) {
  "use strict";
  const TRAPS = [
    {
      id: "racchetta", tag: "Test di riflessione cognitiva", title: "La racchetta e la pallina",
      text: ["Una racchetta e una pallina costano in tutto 1,10 €. La racchetta costa 1 € più della pallina. Quanto costa la pallina? (in euro, per esempio 0,25)"],
      type: "number", answer: 0.05, lure: 0.1, tol: 0.001, unit: "€",
      solution: "5 centesimi: la racchetta costa 1,05 € e insieme fanno 1,10 €. Con 10 centesimi la racchetta costerebbe 1,10 € e il totale 1,20 €.",
      study: { text: "È la prima domanda del test di riflessione cognitiva di Shane Frederick (3 domande). Su oltre 3.400 persone, il punteggio medio era 1,24 su 3; anche al MIT, la scuola migliore del campione, la media era 2,18. La risposta sbagliata più comune era proprio 10 centesimi. In due campioni italiani questa domanda la risolveva circa il 40% (43% e 39%).", cite: "Frederick, Journal of Economic Perspectives, 2005; Primi e colleghi, Journal of Behavioral Decision Making, 2016", url: "https://www.aeaweb.org/articles?id=10.1257/089533005775196732" },
      lesson: "La risposta d'istinto arriva subito e sembra giusta. Il controllo costa due secondi: rimetti il numero nel problema e guarda se torna."
    },
    {
      id: "macchine", tag: "Test di riflessione cognitiva", title: "Le macchine",
      text: ["Se 5 macchine producono 5 pezzi in 5 minuti, quanto tempo serve a 100 macchine per produrre 100 pezzi? (in minuti)"],
      type: "number", answer: 5, lure: 100, tol: 0, unit: "minuti",
      solution: "5 minuti: ogni macchina fa un pezzo in 5 minuti, quindi 100 macchine fanno 100 pezzi negli stessi 5 minuti.",
      study: { text: "Seconda domanda del test di Frederick. La risposta d'istinto, 100 minuti, nasce dal ripetere lo schema «5-5-5 → 100-100-100» senza ragionare sul ritmo di ogni macchina. Nei campioni italiani la risolveva il 34-44%.", cite: "Frederick, Journal of Economic Perspectives, 2005; Primi e colleghi, 2016", url: "https://www.aeaweb.org/articles?id=10.1257/089533005775196732" },
      lesson: "Quando i numeri «si ripetono», chiediti qual è la quantità che resta costante: qui il tempo che serve a una macchina per un pezzo."
    },
    {
      id: "ninfee", tag: "Test di riflessione cognitiva", title: "Le ninfee",
      text: ["In un lago c'è una macchia di ninfee. Ogni giorno la macchia raddoppia. Se servono 48 giorni per coprire tutto il lago, quanti giorni servono per coprirne metà?"],
      type: "number", answer: 47, lure: 24, tol: 0, unit: "giorni",
      solution: "47 giorni: raddoppia ogni giorno, quindi il giorno prima di coprire tutto il lago ne copriva metà.",
      study: { text: "Terza domanda del test di Frederick. Chi risponde 24 divide per due il tempo invece della superficie: la crescita esponenziale inganna molti. Nei campioni italiani la risolveva circa una persona su due (47% e 54%).", cite: "Frederick, Journal of Economic Perspectives, 2005; Primi e colleghi, 2016", url: "https://www.aeaweb.org/articles?id=10.1257/089533005775196732" },
      lesson: "Con le crescite che raddoppiano, ragiona all'indietro dalla fine. Vale anche per interessi composti e contagi."
    },
    {
      id: "secondo", tag: "Test di riflessione cognitiva 2", title: "La gara",
      text: ["Stai correndo una gara e superi la persona che è al secondo posto. In che posizione sei adesso? (scrivi il numero)"],
      type: "number", answer: 2, lure: 1, tol: 0, unit: "°",
      solution: "Secondo: prendi il suo posto. Chi era primo è ancora davanti a te.",
      study: { text: "Fa parte del test di riflessione cognitiva 2 di Keela Thomson e Daniel Oppenheimer, pensato perché le domande di Frederick erano diventate troppo famose e richiedono calcoli. Qui non serve la matematica: serve fermarsi. Su 134 studenti dell'Università della California rispondeva giusto il 63%.", cite: "Thomson e Oppenheimer, Judgment and Decision Making, 2016", url: "https://journal.sjdm.org/15/151029/jdm151029.pdf" },
      lesson: "Le trappole non sono solo numeriche: l'istinto completa la frase con la risposta più «comoda»."
    },
    {
      id: "buco", tag: "Test di riflessione cognitiva 2", title: "Il buco",
      text: ["Quanti metri cubi di terra ci sono in un buco profondo 3 metri, largo 3 metri e lungo 3 metri?"],
      type: "number", answer: 0, lure: 27, tol: 0, unit: "m³",
      solution: "Zero: è un buco, la terra è stata tolta. 27 è il volume del buco, non della terra.",
      study: { text: "Altra domanda del test di Thomson e Oppenheimer: la parola «metri cubi» attiva il calcolo e fa perdere di vista che cosa viene chiesto. È la più difficile del test: rispondeva giusto solo il 16%.", cite: "Thomson e Oppenheimer, Judgment and Decision Making, 2016", url: "https://journal.sjdm.org/15/151029/jdm151029.pdf" },
      lesson: "Prima di calcolare, rileggi la domanda: che cosa mi chiedono esattamente?"
    },
    {
      id: "pecore", tag: "Test di riflessione cognitiva 2", title: "Le pecore",
      text: ["Un pastore ha 15 pecore. Muoiono tutte tranne 8. Quante pecore gli restano?"],
      type: "number", answer: 8, lure: 7, tol: 0, unit: "pecore",
      solution: "8: «tutte tranne 8» vuol dire che 8 sono vive. La sottrazione 15 − 8 risponde a un'altra domanda.",
      study: { text: "Dal test di Thomson e Oppenheimer: chi risponde 7 trasforma automaticamente la frase in una sottrazione; la maggior parte però la risolve (83%).", cite: "Thomson e Oppenheimer, Judgment and Decision Making, 2016", url: "https://journal.sjdm.org/15/151029/jdm151029.pdf" },
      lesson: "L'istinto riconosce lo schema («15 e 8: sottraggo») prima di capire la frase."
    },
    {
      id: "wason", tag: "Ragionamento condizionale", title: "Le quattro carte di Wason",
      text: ["Ogni carta ha una lettera da un lato e un numero dall'altro. Sul tavolo vedi: E, K, 4, 7.", "Regola: «Se una carta ha una vocale da un lato, allora ha un numero pari dall'altro». Quali carte devi girare, e solo quelle, per controllare se la regola è violata?"],
      type: "choice", options: ["E e 4", "Solo E", "E e 7", "E, 4 e 7"], answer: 2, lure: 0,
      solution: "E e 7. La E perché dietro potrebbe esserci un dispari; il 7 perché dietro potrebbe esserci una vocale. Il 4 non serve: la regola non dice niente su cosa ci sia dietro un pari.",
      study: { text: "Nella versione astratta inventata da Peter Wason, di solito meno di una persona su dieci sceglie E e 7 (tra il 6 e il 12% nei campioni di Stanovich e West); la risposta più comune è E e 4: si cercano conferme invece di cercare la carta che può smentire.", cite: "Wason, 1966 e 1968; Stanovich e West, Thinking & Reasoning, 1998", url: "https://en.wikipedia.org/wiki/Wason_selection_task" },
      lesson: "Per controllare una regola si cercano i casi che possono smentirla, non quelli che la confermano."
    },
    {
      id: "birra", tag: "Ragionamento condizionale", title: "Il controllo al bar",
      text: ["Sei il controllore in un bar. Regola: «Se una persona beve birra, deve avere almeno 18 anni». Di quattro persone sai solo una cosa: una beve birra, una beve coca-cola, una ha 25 anni, una ha 16 anni.", "Di chi devi controllare l'altra informazione?"],
      type: "choice", options: ["Chi beve birra e chi ha 25 anni", "Chi beve birra e chi ha 16 anni", "Solo chi beve birra", "Tutti e quattro"], answer: 1, lure: 0,
      solution: "Chi beve birra (potrebbe essere minorenne) e chi ha 16 anni (potrebbe bere birra). È esattamente lo stesso problema delle carte: «se P allora Q», si controllano P e non-Q.",
      study: { text: "Con un contenuto concreto di permessi e divieti, Richard Griggs e James Cox trovarono che circa il 73% dei partecipanti risolveva il problema, contro meno del 10% nella versione con lettere e numeri. La logica è identica: cambia quanto è familiare la situazione.", cite: "Griggs e Cox, British Journal of Psychology, 1982; Cosmides, Cognition, 1989", url: "https://en.wikipedia.org/wiki/Wason_selection_task" },
      lesson: "Se un problema astratto ti blocca, traducilo in una regola concreta di permesso o divieto."
    },
    {
      id: "linda", tag: "Probabilità", title: "Il problema di Linda",
      text: ["Linda ha 31 anni, è single, schietta e molto brillante. Si è laureata in filosofia. Da studentessa si occupava molto di discriminazione e giustizia sociale, e partecipava a manifestazioni contro il nucleare.", "Che cosa è più probabile?"],
      type: "choice", options: ["Linda è impiegata in banca.", "Linda è impiegata in banca ed è attiva nel movimento femminista."], answer: 0, lure: 1,
      solution: "La prima. Le impiegate femministe sono un sottoinsieme delle impiegate: due condizioni insieme non possono essere più probabili di una sola (fallacia della congiunzione).",
      study: { text: "Amos Tversky e Daniel Kahneman fecero questa domanda a 142 studenti: l'85% scelse la seconda. La descrizione «somiglia» a una femminista e la somiglianza prende il posto della probabilità. Presentando il problema in frequenze («su 100 persone come Linda, quante…») gli errori calano molto, anche se non spariscono del tutto.", cite: "Tversky e Kahneman, Psychological Review, 1983; Hertwig e Gigerenzer, Journal of Behavioral Decision Making, 1999; Mellers, Hertwig e Kahneman, Psychological Science, 2001", url: "https://en.wikipedia.org/wiki/Conjunction_fallacy" },
      lesson: "Più dettagli rendono una storia più convincente ma meno probabile. Chiediti: su 100 casi, quanti?"
    },
    {
      id: "taxi", tag: "Probabilità", title: "Il taxi della notte",
      text: ["In una città l'85% dei taxi è verde e il 15% è blu. Di notte un taxi è coinvolto in un incidente. Un testimone dice che era blu. I test dicono che, con quella luce, il testimone riconosce il colore giusto l'80% delle volte e sbaglia il 20%.", "Qual è la probabilità che il taxi fosse davvero blu? (in percentuale)"],
      type: "number", answer: 41, lure: 80, tol: 2, unit: "%",
      solution: "Circa 41%. Su 100 taxi: 15 blu, il testimone ne riconosce 12; 85 verdi, ne chiama blu per errore 17. Dei 29 «visti blu», solo 12 lo sono davvero: 12/29 ≈ 41%.",
      study: { text: "In questo problema la risposta più comune è 80%, l'affidabilità del testimone: si ignora quanto sono rari i taxi blu (la probabilità di base).", cite: "Bar-Hillel, Acta Psychologica, 1980; Tversky e Kahneman, in Judgment under uncertainty, 1982", url: "https://en.wikipedia.org/wiki/Base_rate_fallacy" },
      lesson: "Prima di credere a un indizio, chiediti quanto è raro in partenza quello che indica."
    },
    {
      id: "mammografia", tag: "Probabilità", title: "Il test positivo",
      text: ["L'1% delle donne di 40 anni che fanno uno screening ha un tumore al seno. Se c'è il tumore, la mammografia è positiva nell'80% dei casi. Se non c'è, è positiva comunque nel 9,6% dei casi.", "Una donna ha la mammografia positiva. Qual è la probabilità che abbia davvero il tumore? (in percentuale)"],
      type: "number", answer: 7.8, lure: 80, tol: 2, unit: "%",
      solution: "Circa 8%. Su 1.000 donne: 10 malate, 8 positive; 990 sane, circa 95 positive per errore. Delle 103 positive, solo 8 sono malate: circa il 7,8%.",
      study: { text: "David Eddy riferì che 95 medici su 100 stimavano il 70-80% (un resoconto informale, non uno studio controllato). Negli esperimenti di Gerd Gigerenzer e Ulrich Hoffrage, con questi problemi scritti in percentuali rispondeva bene il 16%; scritti in frequenze naturali («10 donne su 1.000…»), il 46%.", cite: "Eddy, 1982; Gigerenzer e Hoffrage, Psychological Review, 1995", url: "https://en.wikipedia.org/wiki/Base_rate_fallacy" },
      lesson: "Traduci le percentuali in persone su 1.000: il problema diventa un conteggio."
    },
    {
      id: "monty", tag: "Probabilità", title: "Le tre porte",
      text: ["A un quiz ci sono tre porte: dietro una c'è un'auto, dietro le altre due una capra. Scegli la porta 1. Il presentatore, che sa dov'è l'auto, apre la porta 3 e mostra una capra. Poi ti chiede: vuoi passare alla porta 2?"],
      type: "choice", options: ["Conviene cambiare", "Conviene restare", "È indifferente: 50 e 50"], answer: 0, lure: 2,
      solution: "Conviene cambiare: si vince 2 volte su 3. La tua porta aveva 1/3 all'inizio e il presentatore non la tocca; i 2/3 delle altre due porte passano tutti sulla porta 2, perché lui apre sempre una capra.",
      study: { text: "Negli esperimenti, la prima volta che vedono il problema meno di 2 persone su 10 cambiano porta: quasi tutti restano, convinti che sia 50 e 50. Quando nel 1990 la soluzione fu pubblicata su una rivista americana, migliaia di lettori (anche matematici) scrissero per dire che era sbagliata.", cite: "Granberg e Brown, Personality and Social Psychology Bulletin, 1995; Mueser e Granberg, 1999", url: "https://en.wikipedia.org/wiki/Monty_Hall_problem" },
      lesson: "Conta l'informazione nascosta in come vengono date le informazioni: il presentatore non sceglie a caso."
    },
    {
      id: "ospedali", tag: "Probabilità", title: "I due ospedali",
      text: ["In una città ci sono due ospedali. Nel più grande nascono circa 45 bambini al giorno, nel più piccolo circa 15. Circa metà dei neonati sono maschi, ma ogni giorno la percentuale cambia un po'.", "In un anno, quale ospedale registra più giorni in cui oltre il 60% dei nati è maschio?"],
      type: "choice", options: ["Il più grande", "Il più piccolo", "Più o meno uguali"], answer: 1, lure: 2,
      solution: "Il più piccolo: con pochi casi le percentuali oscillano di più. Con 15 nascite basta qualche maschio in più per superare il 60%.",
      study: { text: "Su 95 persone, 53 (56%) risposero «più o meno uguali», 21 «il più grande» e solo 21 (22%) «il più piccolo»: si ignora che i campioni piccoli variano di più.", cite: "Kahneman e Tversky, Cognitive Psychology, 1972", url: "https://en.wikipedia.org/wiki/Insensitivity_to_sample_size" },
      lesson: "Prima di stupirti per un risultato estremo, guarda su quanti casi è calcolato."
    },
    {
      id: "roulette", tag: "Probabilità", title: "Rosso, rosso, rosso",
      text: ["Alla roulette (senza truffe) è uscito il rosso 6 volte di fila. Al prossimo giro…"],
      type: "choice", options: ["è più probabile il nero", "è più probabile il rosso", "rosso e nero hanno la stessa probabilità di prima"], answer: 2, lure: 0,
      solution: "La stessa di prima (18 su 37 per ciascuno, con lo zero): la ruota non ha memoria. È la fallacia del giocatore d'azzardo.",
      study: { text: "La notte del 18 agosto 1913 al casinò di Monte Carlo il nero uscì 26 volte di fila; i giocatori persero cifre enormi puntando sul rosso, convinti che «dovesse» uscire. Attenzione all'errore opposto: nel basket, la «mano calda» che si credeva un'illusione (Gilovich, Vallone e Tversky, 1985) è riapparsa quando un'analisi del 2018 ha corretto un errore statistico sottile: nei dati originali c'è un effetto di circa 13 punti percentuali. Per una roulette onesta, invece, l'indipendenza è garantita.", cite: "Gilovich, Vallone e Tversky, Cognitive Psychology, 1985; Miller e Sanjurjo, Econometrica, 2018", url: "https://en.wikipedia.org/wiki/Gambler%27s_fallacy" },
      lesson: "Gli eventi indipendenti non si «compensano». Ma prima di dire che sono indipendenti, controlla."
    }
  ];
  const api = { TRAPS };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LogicTraps = api;
})(typeof window !== "undefined" ? window : globalThis);
