/*
 * Progetto A - Logica: il metodo. Lezioni brevi con esempi (example: domanda e soluzione
 * nascosta) e la disciplina in cui allenarsi (train).
 */
(function (root) {
  "use strict";
  const LESSONS = [
    {
      id: "dedurre", title: "Dedurre, indurre, abdurre", minutes: 6, train: "knights",
      lead: "Tre modi di ragionare con garanzie molto diverse. Confonderli è il primo errore.",
      sections: [
        { title: "Deduzione: se le premesse sono vere, la conclusione lo è per forza", body: ["«Tutti i fornitori della lista sono certificati; Rossi è nella lista; quindi Rossi è certificato.» Non c'è spazio per eccezioni: se la conclusione è falsa, almeno una premessa è falsa. È il ragionamento di griglie, sillogismi, cavalieri e furfanti."] },
        { title: "Induzione: dai casi a una regola probabile", body: ["«I primi dieci ordini di questo cliente sono stati pagati in tempo, quindi pagherà anche l'undicesimo.» Ragionevole, mai certo: basta un caso contrario. Le serie di numeri sono induzione: per questo un buon esercizio deve escludere le regole alternative."] },
        { title: "Abduzione: la spiegazione migliore", body: ["«Il cantiere è fermo e il fornitore non risponde: probabilmente ha problemi di liquidità.» È quello che Sherlock Holmes chiama «deduzione», ma è un'ipotesi: va messa alla prova cercando che cosa la smentirebbe.", "La domanda utile è sempre la stessa: questa conclusione è obbligata, probabile o solo possibile?"],
          example: { q: "«Ogni volta che piove il cantiere si ferma. Oggi il cantiere è fermo. Quindi piove.» Che errore è?", a: "Affermazione del conseguente: il cantiere può fermarsi per mille altri motivi. Dalla regola si può solo dire: se piove, è fermo; se non è fermo, non piove." } }
      ]
    },
    {
      id: "condizionale", title: "Il «se… allora»", minutes: 7, train: "knights",
      lead: "Quattro modi di ragionare con un condizionale: due validi, due sbagliati ma frequentissimi.",
      sources: [["Oaksford, Chater e Larkin 2000, Journal of Experimental Psychology: LMC", "https://www.dectech.co.uk/publications/LinksNick/ReasoningAndDecisionMaking/probability%20and%20polarity%20biases%20in%20conditional%20inference.pdf"], ["Stanovich e West 1998, il compito di Wason", ""]],
      sections: [
        { title: "Le due forme valide", body: ["Modus ponens: se P allora Q; P è vero; quindi Q. «Se il pagamento arriva, spedisco. Il pagamento è arrivato: spedisco.»", "Modus tollens: se P allora Q; Q è falso; quindi P è falso. «Se il pagamento arriva, spedisco. Non ho spedito: il pagamento non è arrivato.» È valido, ma più difficile: negli esperimenti il modus ponens lo accettano quasi tutti, il modus tollens solo il 60-75% delle persone."] },
        { title: "I due errori", body: ["Affermare il conseguente: se P allora Q; Q; quindi P. «Ho spedito, quindi il pagamento è arrivato» (magari ho spedito per fiducia).", "Negare l'antecedente: se P allora Q; non P; quindi non Q. «Il pagamento non è arrivato, quindi non ho spedito» (magari ho spedito lo stesso).", "Non sono errori rari: negli esperimenti con frasi astratte li accetta da circa metà a due terzi degli adulti."] },
        { title: "Il trucco: la contronominale", body: ["«Se P allora Q» equivale a «se non Q allora non P». «Se è socio, ha la tessera» = «se non ha la tessera, non è socio». Ma NON equivale a «se ha la tessera, è socio». Per controllare una regola si guardano i P (devono avere Q) e i non-Q (non devono essere P): è la soluzione del compito di Wason."],
          example: { q: "Regola: «se un ordine supera 10.000 €, serve la firma del titolare». Quali pratiche controlli tra: ordine da 15.000 €, ordine da 3.000 €, pratica firmata dal titolare, pratica senza firma?", a: "L'ordine da 15.000 € (deve avere la firma) e la pratica senza firma (non deve superare 10.000 €). Le altre due non possono violare la regola." } }
      ]
    },
    {
      id: "quantificatori", title: "Tutti, alcuni, nessuno", minutes: 7, train: "syllo",
      lead: "Come controllare un sillogismo: cercare il controesempio invece di fidarsi della conclusione.",
      sources: [["Khemlani e Johnson-Laird 2012, meta-analisi dei sillogismi", "https://modeltheory.org/papers/ssk/ssk2012syllogisms-meta-analysis.pdf"], ["Dati aperti di Ragni e colleghi 2016 (CCOBRA)", "https://github.com/CognitiveComputationLab/ccobra"], ["Evans, Barston e Pollard 1983, Memory & Cognition", ""]],
      sections: [
        { title: "Le quattro frasi", body: ["Tutti gli A sono B. Alcuni A sono B. Nessun A è B. Alcuni A non sono B. Attenzione: «alcuni» in logica vuol dire «almeno uno, forse tutti». E «tutti gli A sono B» non dice niente sui B: non è detto che tutti i B siano A."] },
        { title: "Il metodo del controesempio", body: ["Una conclusione segue per forza solo se non esiste nessuna situazione in cui le premesse sono vere e la conclusione falsa. Quindi: prova a costruire quella situazione. Se ci riesci, il ragionamento non è valido.", "I diagrammi di Venn (tre cerchi che si sovrappongono) aiutano: si cancella quello che le premesse escludono, si segna quello che garantiscono, e si guarda se la conclusione è già scritta nel disegno."],
          example: { q: "«Tutti i tovi sono dalvi. Alcuni dalvi sono ferzi. Quindi alcuni tovi sono ferzi.» Segue?", a: "No. Controesempio: i tovi sono una parte dei dalvi, i ferzi un'altra parte dei dalvi, senza sovrapposizione. Le premesse sono vere e nessun tovo è un ferzo." } },
        { title: "Quanto sono difficili", body: ["In un esperimento con dati aperti, 139 persone hanno affrontato tutti i 64 sillogismi possibili scegliendo la conclusione: in media le risposte giuste erano il 41%. «Tutti gli A sono B; nessun B è C» lo risolveva l'88%; «Nessun A è B; tutti i B sono C» solo il 4% (quasi tutti concludono «nessun A è C», che non segue: segue solo «alcuni C non sono A»). Negli esercizi di livello 3 e 4 la difficoltà di ogni sillogismo viene da questi dati."] },
        { title: "La trappola della conclusione credibile", body: ["Quando la conclusione ci sembra vera, accettiamo anche ragionamenti sbagliati; quando ci sembra assurda, rifiutiamo anche quelli giusti. Negli esperimenti di Evans, Barston e Pollard le conclusioni valide e credibili venivano accettate dall'89%, quelle valide ma incredibili dal 56%; quelle non valide ma credibili dal 71%, quelle non valide e incredibili dal 10%. È l'effetto della credibilità (belief bias). Per questo negli esercizi le parole sono inventate: conta solo la forma."] }
      ]
    },
    {
      id: "griglie", title: "Come si risolve una griglia", minutes: 6, train: "grid",
      lead: "Tabella di eliminazione, catene di indizi e ragionamento per casi.",
      sections: [
        { title: "La tabella", body: ["Su un foglio: una riga per casa, una colonna per ogni valore di ogni categoria. Una X dove un valore è escluso, un cerchio dove è certo. Quando in una riga resta un solo valore libero per una categoria, è quello."] },
        { title: "L'ordine degli indizi", body: ["Prima quelli che fissano una posizione («nella prima casa»), poi quelli che legano due cose («chi ha il gatto fa il medico»): uniscono due colonne in una. Gli indizi «subito a sinistra» escludono molto: chi è subito a sinistra non può stare nell'ultima casa, e il suo vicino non può stare nella prima."] },
        { title: "Quando ti blocchi: prova un caso", body: ["Scegli il punto con meno possibilità (due), supponi la prima e vai avanti. Se arrivi a una contraddizione, era la seconda. È lo stesso metodo dei cavalieri e furfanti: «se Aldo fosse un cavaliere, allora…»."] }
      ]
    },
    {
      id: "regole", title: "Matrici e serie: cercare le regole", minutes: 6, train: "matrix",
      lead: "Come lavorano le persone che risolvono le matrici difficili, e un metodo per le serie.",
      sources: [["Carpenter, Just e Shell 1990, Psychological Review", "https://apps.dtic.mil/sti/pdfs/ADA221448.pdf"], ["Matzen e colleghi 2010, Behavior Research Methods (dati aperti)", "https://github.com/sandialabs/Matrices"], ["Hu e colleghi 2021, I-RAVEN: risposte costruite senza scorciatoie", "https://arxiv.org/pdf/2002.06838"]],
      sections: [
        { title: "Un attributo alla volta", body: ["Studiando i movimenti degli occhi di chi risolveva le matrici di Raven, Patricia Carpenter, Marcel Just e Peter Shell videro che i più bravi non «vedono» la soluzione: scompongono il problema, trovano una regola alla volta e se le tengono a mente. La differenza tra bravi e meno bravi stava soprattutto nel gestire più regole insieme: con una regola sola gli errori erano circa il 16%, con tre o quattro regole circa il 59%. Anche nelle matrici generate di Matzen e colleghi le risposte giuste scendono dall'87% (una regola) al 55% (tre regole) e al 38% con le sovrapposizioni logiche.", "Metodo: guarda la prima riga e chiediti, per ogni caratteristica (forma, numero, grandezza, colore, linee), se resta uguale, cresce, o compare una volta sola per riga. Poi verifica la regola sulla seconda riga, e solo allora applicala alla terza."] },
        { title: "Serie: differenze, rapporti, intrecci", body: ["Scrivi le differenze tra un numero e il successivo. Se sono costanti è facile; se crescono in modo regolare, scrivi le differenze delle differenze. Se crescono in fretta, prova i rapporti (×2, ×3). Se la serie va su e giù, guarda i posti pari e dispari separatamente. Pensa anche ai quadrati, ai cubi e ai primi."],
          example: { q: "3, 5, 9, 15, 23, 33, ?", a: "Differenze: 2, 4, 6, 8, 10: crescono di 2. La prossima è 12: 33 + 12 = 45." } }
      ]
    },
    {
      id: "probabilita", title: "Probabilità senza paura", minutes: 8, train: "prob",
      lead: "Quattro strumenti che risolvono quasi tutti i problemi: il contrario, la moltiplicazione, le frequenze, il valore atteso.",
      sources: [["Gigerenzer e Hoffrage 1995, Psychological Review", "https://pages.ucsd.edu/~scoulson/203/GG_How_1995.pdf"]],
      sections: [
        { title: "Il contrario", body: ["«Almeno uno» si calcola quasi sempre al contrario: almeno un 6 in 4 lanci = 1 − (probabilità di nessun 6) = 1 − (5/6)⁴ ≈ 52%. Sommare 1/6 quattro volte (67%) è sbagliato."] },
        { title: "Moltiplicare (con attenzione)", body: ["Eventi indipendenti si moltiplicano: due teste di fila = 1/2 × 1/2. Senza reinserimento la seconda probabilità cambia: due assi = 4/52 × 3/51."] },
        { title: "Le frequenze naturali", body: ["Gerd Gigerenzer e Ulrich Hoffrage hanno mostrato che i problemi con probabilità condizionate diventano molto più facili scritti come conteggi: «su 1.000 persone, 10 sono malate; di queste, 8 risultano positive; delle 990 sane, 95 risultano positive». A quel punto la risposta è un rapporto: 8 su 103. Nei loro esperimenti, gli stessi problemi venivano risolti dal 16% scritti con le percentuali e dal 46% scritti con le frequenze."],
          example: { q: "Un test antifrode segnala il 90% delle transazioni false e per errore il 5% di quelle regolari. Le false sono 1 su 100. Una transazione è segnalata: quanto è probabile che sia falsa?", a: "Su 10.000 transazioni: 100 false, 90 segnalate; 9.900 regolari, 495 segnalate. Segnalate in tutto 585, false 90: circa il 15%." } },
        { title: "Il valore atteso", body: ["Quanto vale una scommessa in media: ogni esito per la sua probabilità, sommati. Un biglietto da 5 € con una possibilità su 1.000 di vincere 2.000 € vale in media 2 − 5 = −3 €. Utile per decidere su sconti, garanzie, assicurazioni e premi."] }
      ]
    },
    {
      id: "riflessione", title: "Fermarsi un secondo", minutes: 5, train: "crt",
      lead: "Perché la risposta d'istinto è spesso sbagliata e come controllarla senza rallentare tutto.",
      sources: [["Frederick 2005, Journal of Economic Perspectives", "https://www.aeaweb.org/articles?id=10.1257/089533005775196732"], ["Thomson e Oppenheimer 2016, il test di riflessione 2", "https://journal.sjdm.org/15/151029/jdm151029.pdf"], ["Kahneman, Pensieri lenti e veloci, 2011", ""]],
      sections: [
        { title: "Due modi di pensare", body: ["Daniel Kahneman descrive un pensiero veloce e automatico (Sistema 1) e uno lento e controllato (Sistema 2). Il primo ci fa vivere, ma propone risposte sicure anche quando sono sbagliate; il secondo controlla, se lo chiamiamo. I problemi di riflessione cognitiva misurano proprio questo: quanto spesso fermiamo la prima risposta. Nel test originale di Shane Frederick (3 domande, oltre 3.400 persone) la media era 1,24 risposte giuste su 3, e il 33% non ne azzeccava nessuna."] },
        { title: "Tre controlli rapidi", body: ["Rimettere il numero nel problema (racchetta e pallina: 1,10 + 0,10 non fa 1,10). Chiedersi «che cosa mi chiedono esattamente?» (il buco: la terra, non il volume). Fare il caso estremo (le ninfee: il giorno prima della fine il lago era mezzo pieno)."] },
        { title: "Quando fidarsi dell'istinto", body: ["Nelle cose in cui hai molta esperienza con un riscontro rapido (un venditore esperto con i clienti, un giocatore di scacchi con le posizioni) l'intuizione è spesso buona. Nelle situazioni nuove, con numeri e probabilità, controlla."] }
      ]
    },
    {
      id: "transfer", title: "Cosa si porta nella vita vera", minutes: 5, train: null,
      lead: "Gli esercizi migliorano gli esercizi. Le regole imparate bene migliorano il ragionamento di tutti i giorni.",
      sources: [["Simons e colleghi 2016, Do «brain-training» programs work?", "https://www.psychologicalscience.org/news/releases/brain-training-claims-not-backed-by-science-report-shows.html"], ["Sala e Gobet 2017, Current Directions in Psychological Science", "https://eprints.lse.ac.uk/102204/"], ["Fong, Krantz e Nisbett 1986, Cognitive Psychology", ""], ["Lehman, Lempert e Nisbett 1988, American Psychologist", ""]],
      sections: [
        { title: "Il limite dei giochi di allenamento", body: ["Una grande rassegna di sette ricercatori su 132 studi citati dalle aziende di allenamento cerebrale ha concluso che migliorano i compiti allenati, con poche prove di benefici su compiti diversi o sulla vita quotidiana. Lo stesso vale per scacchi, musica e memoria di lavoro: il trasferimento lontano è raro. Fare matrici ti rende bravo nelle matrici. E nessun quiz online può darti un QI: i punteggi qui servono a vedere i tuoi progressi, non sono un test d'intelligenza."] },
        { title: "Quello che si trasferisce", body: ["Gli studi di Richard Nisbett e colleghi hanno mostrato che insegnare regole di ragionamento esplicite, come la legge dei grandi numeri, con esempi presi da campi diversi migliora il ragionamento su problemi quotidiani anche in contesti nuovi. Due anni di dottorato in psicologia o medicina migliorano il ragionamento statistico; legge e medicina quello condizionale; chimica nessuno dei due. Per questo qui, accanto agli esercizi, ci sono le lezioni di metodo: il punto è usarle fuori."] },
        { title: "Abitudini che funzionano", body: ["Chiedersi «su 100 casi, quanti?». Guardare quanto è raro un evento prima di credere a un indizio. Cercare il caso che smentirebbe la propria idea invece di quelli che la confermano. Considerare il contrario: perché potrei sbagliarmi?"] }
      ]
    }
  ];
  const api = { LESSONS };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LogicData = api;
})(typeof window !== "undefined" ? window : globalThis);
