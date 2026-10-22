/*
 * Progetto A - Influenza: il manuale. Ogni capitolo ha sezioni con spiegazione, esperimento (con
 * numeri e fonte), come si usa e contromossa. families = esercizi "Mettiti alla prova".
 * I numeri degli esperimenti sono controllati sulle fonti (vedi README, "Modulo influenza").
 */
(function (root) {
  "use strict";
  const CHAPTERS = [
    {
      id: "leve",
      title: "Le leve del sì",
      minutes: 12,
      families: ["leva"],
      lead: "Le sette scorciatoie che usiamo tutti per decidere in fretta, e che chi vuole un sì sa attivare.",
      sections: [
        {
          title: "Perché funzionano",
          body: [
            "Ogni giorno prendiamo centinaia di decisioni e non possiamo ragionare su tutte. Usiamo scorciatoie: se me l'ha regalato, ricambio; se lo fanno tutti, va bene; se lo dice un esperto, è vero; se sta finendo, vale di più. Quasi sempre funzionano. Il punto è che funzionano anche quando qualcuno le attiva apposta.",
            "Robert Cialdini, psicologo sociale, le ha raccolte studiando gli esperimenti di laboratorio e lavorando sotto copertura con venditori, raccoglitori di fondi e reclutatori. Le chiama principi: reciprocità, impegno e coerenza, riprova sociale, autorità, simpatia, scarsità e, dal 2016, unità."
          ]
        },
        {
          title: "Reciprocità",
          body: ["Quando qualcuno ci dà qualcosa, sentiamo il bisogno di ricambiare. Il debito pesa anche se il regalo non l'abbiamo chiesto, e spesso ricambiamo con più di quanto abbiamo ricevuto."],
          study: { title: "L'esperimento", text: "Nello studio di Dennis Regan, un complice portava ai partecipanti una Coca-Cola che non avevano chiesto; più tardi chiedeva loro di comprare biglietti di una lotteria. Chi aveva ricevuto la bibita ne comprava molti di più. E la simpatia per il complice contava solo per chi non aveva ricevuto niente: il debito pesava più della simpatia. In un ristorante, una caramella portata con il conto alzava le mance; due caramelle, o una seconda offerta come gesto personale («per voi, in più»), le alzavano ancora di più.", cite: "Regan, Journal of Experimental Social Psychology, 1971; Strohmetz, Rind, Fisher e Lynn, Journal of Applied Social Psychology, 2002" },
          use: "Dai per primo qualcosa di utile e personalizzato (un'analisi, un campione, un'informazione) prima di chiedere. Funziona di più se è inaspettato e su misura.",
          counter: "Accetta il regalo e poi valuta la richiesta come se il regalo non ci fosse. Un favore usato come esca non crea un debito vero."
        },
        {
          title: "Impegno e coerenza",
          body: ["Una volta presa una posizione, soprattutto se in pubblico, per iscritto o con fatica, vogliamo restarle fedeli. Cambiare idea ci sembra debolezza."],
          study: { title: "L'esperimento", text: "Durante l'estate, sulle spiagge di New York, un ricercatore lasciava l'asciugamano e la radio e si allontanava; un complice fingeva di rubare la radio. Se il ricercatore non aveva detto niente, interveniva il 20% dei vicini di asciugamano; se prima aveva chiesto «mi guarda le mie cose?» e la persona aveva detto sì, interveniva il 95% (19 su 20).", cite: "Moriarty, Journal of Personality and Social Psychology, 1975" },
          use: "Fai scrivere o dire all'altro l'impegno, con parole sue: «Quindi ci sentiamo venerdì e mi mandi i numeri, giusto?». Un sì attivo e pubblico tiene più di un sì passivo.",
          counter: "Chiediti: sapendo quello che so adesso, prenderei la stessa decisione? Se no, essere coerenti con un errore è solo testardaggine."
        },
        {
          title: "Riprova sociale",
          body: ["Quando non sappiamo cosa fare, guardiamo cosa fanno gli altri, soprattutto quelli simili a noi o nella nostra stessa situazione."],
          study: { title: "L'esperimento", text: "In un hotel americano, il cartellino «aiuta l'ambiente, riusa l'asciugamano» convinceva il 35% degli ospiti, quello «la maggior parte degli ospiti riusa l'asciugamano» il 44%. In un secondo esperimento, il messaggio sugli ospiti «di questa stessa camera» arrivava al 49%, contro il 37% del cartellino classico. Ma in due hotel tedeschi il messaggio sociale non ha funzionato meglio di quello classico: è una leva reale, non una garanzia. Negli esperimenti di Solomon Asch sulla lunghezza delle linee, davanti a un gruppo che dava apposta la risposta sbagliata, il 37% delle risposte seguiva il gruppo e tre persone su quattro cedevano almeno una volta. Però due risposte su tre restavano indipendenti, e bastava un solo alleato nel gruppo per ridurre gli errori a un quarto.", cite: "Goldstein, Cialdini e Griskevicius, Journal of Consumer Research, 2008; Bohner e Schlüter, PLoS ONE, 2014; Asch, Scientific American, 1955" },
          use: "Mostra persone simili a chi ascolta che hanno già scelto: «Tre imprese della zona hanno usato questo gres nell'ultimo anno». I numeri veri battono gli aggettivi.",
          counter: "Chiedi chi sono davvero «gli altri» e se la loro situazione è come la tua. Le recensioni e le «persone che stanno guardando» si comprano."
        },
        {
          title: "Autorità",
          body: ["Seguiamo chi sembra competente o ha un ruolo. Spesso bastano i simboli: un titolo, una divisa, un tono sicuro."],
          study: { title: "L'esperimento", text: "Negli esperimenti di Stanley Milgram, un uomo in camice chiedeva ai partecipanti di dare scosse sempre più forti a un'altra persona (un attore, le scosse erano finte). Nella versione più nota, 26 persone su 40 arrivarono fino all'ultima levetta, 450 volt, mentre gli studenti di psicologia di Yale avevano previsto l'1%. Ma le varianti contano quanto il risultato: nelle 21 versioni dell'esperimento in media arrivava in fondo il 44%, dal 65% fino al 10% quando due «colleghi» si rifiutavano di continuare; con gli ordini dati al telefono, il 22%. Una replica parziale del 2009, fermata per etica a 150 volt, ha trovato che il 70% era disposto ad andare oltre.", cite: "Milgram, Journal of Abnormal and Social Psychology, 1963; Haslam, Loughnan e Perry, PLoS ONE, 2014; Burger, American Psychologist, 2009" },
          use: "Fai vedere la competenza prima di chiedere: dati, esperienza, casi simili, anche un limite ammesso («su questo non sono il più economico, ma…»). La credibilità vera dura; il titolo esibito no.",
          counter: "Chiedi: è davvero esperto di questo argomento? Cosa ci guadagna? Cosa direbbe un altro esperto indipendente?"
        },
        {
          title: "Simpatia",
          body: ["Diciamo sì più facilmente a chi ci piace. E ci piace chi è simile a noi, chi ci fa sentire apprezzati, chi collabora con noi verso lo stesso obiettivo."],
          study: { title: "L'esperimento", text: "In uno studio, i partecipanti a cui una sconosciuta chiedeva di leggere un saggio di otto pagine e dare un parere accettavano nel 34% dei casi; se scoprivano di avere il suo stesso giorno di nascita, quasi il doppio. Una somiglianza del tutto casuale bastava a far dire sì molto più spesso.", cite: "Burger, Messian, Patel, del Prado e Anderson, Personality and Social Psychology Bulletin, 2004" },
          use: "Cerca somiglianze vere (luoghi, esperienze, interessi) e dì apprezzamenti specifici e sinceri. Lavorare insieme a un problema crea più simpatia di cento complimenti.",
          counter: "Separa la persona dall'offerta: firmeresti lo stesso accordo con uno sconosciuto antipatico?"
        },
        {
          title: "Scarsità",
          body: ["Quello che è raro, esclusivo o sta per finire sembra più prezioso. E l'idea di perderlo spinge a decidere senza confrontare."],
          study: { title: "L'esperimento", text: "Gli stessi biscotti piacevano di più presi da un barattolo con due biscotti che da uno con dieci. Ma il valore saliva davvero (il prezzo stimato passava da circa 46 a 72 centesimi) solo quando il barattolo scendeva da dieci a due davanti ai partecipanti «perché altri ne avevano bisogno»: la scarsità più forte è quella causata dalla domanda degli altri.", cite: "Worchel, Lee e Adewole, Journal of Personality and Social Psychology, 1975" },
          use: "Se un limite è vero (pezzi rimasti, scadenza di un prezzo, posti) dillo chiaramente e con il motivo. Un'informazione esclusiva vale più di un prodotto esclusivo.",
          counter: "Chiediti perché lo vuoi: per usarlo o per non perderlo? Se la scadenza è vera, lo sarà anche domani mattina, dopo che hai confrontato."
        },
        {
          title: "Unità",
          body: ["L'ultima leva aggiunta da Cialdini è più profonda della simpatia: non «mi piaci» ma «sei dei nostri». Famiglia, paese, squadra, mestiere, identità comune. Chi è dei nostri ci influenza di più, e lo aiutiamo anche a nostro svantaggio."],
          use: "Parla di «noi» quando è vero: stesso settore, stesso territorio, stesso obiettivo. Chiedere un parere («cosa faresti al posto mio?») mette l'altro dalla tua parte del tavolo.",
          counter: "Riconosci il legame e poi giudica la richiesta nel merito, come faresti con un estraneo."
        }
      ],
      sources: [
        ["Cialdini, Influence: The Psychology of Persuasion, ed. ampliata 2021", ""],
        ["Cialdini, Pre-Suasion, 2016", ""],
        ["Goldstein, Cialdini e Griskevicius 2008, Journal of Consumer Research", "https://doi.org/10.1086/586910"],
        ["Bohner e Schlüter 2014, la replica tedesca", "https://doi.org/10.1371/journal.pone.0104086"],
        ["Haslam, Loughnan e Perry 2014, le varianti di Milgram", "https://doi.org/10.1371/journal.pone.0093927"],
        ["Burger 2009, American Psychologist: replica di Milgram", "https://doi.org/10.1037/a0010932"]
      ]
    },
    {
      id: "sequenze",
      title: "Le tecniche in sequenza",
      minutes: 9,
      families: ["leva"],
      lead: "Non conta solo cosa chiedi, ma in che ordine: le tecniche che preparano il sì con la richiesta prima.",
      sections: [
        {
          title: "Piede nella porta",
          body: ["Prima una richiesta piccola, facile da accettare; poi quella grande. Il primo sì cambia l'immagine che la persona ha di sé («sono uno che aiuta») e il secondo diventa coerente."],
          study: { title: "L'esperimento", text: "Jonathan Freedman e Scott Fraser chiedevano a delle famiglie di mettere in giardino un grande cartello, brutto, sulla sicurezza stradale. Accettava il 17%. Tra chi due settimane prima aveva accettato di esporre un adesivo piccolo sullo stesso tema, accettava il 76%; anche una prima richiesta su un tema diverso portava a circa il 47%. Gli studi successivi confermano l'effetto, ma più piccolo e meno costante.", cite: "Freedman e Fraser, Journal of Personality and Social Psychology, 1966" },
          use: "Parti da un passo piccolo e concreto: una visita in showroom, un campione, un ordine di prova. Poi costruisci.",
          counter: "Valuta ogni richiesta da sola: aver detto sì alla prima non ti obbliga alla seconda."
        },
        {
          title: "Porta in faccia",
          body: ["Il contrario: prima una richiesta esagerata che verrà rifiutata, poi quella vera. La seconda sembra una concessione, e le concessioni si ricambiano."],
          study: { title: "L'esperimento", text: "Robert Cialdini e colleghi chiedevano a degli studenti di accompagnare un gruppo di ragazzi di un riformatorio allo zoo per un giorno: accettava il 17%. Se prima chiedevano di fare da consulenti ai ragazzi due ore a settimana per due anni (rifiutavano tutti) e poi la gita allo zoo, accettava il 50%.", cite: "Cialdini, Vincent, Lewis, Catalan, Wheeler e Darby, Journal of Personality and Social Psychology, 1975" },
          use: "Funziona se la prima richiesta è credibile e la seconda arriva subito, dalla stessa persona. Se la prima è assurda, perdi credibilità.",
          counter: "Dimentica la prima richiesta: la seconda la accetteresti se fosse arrivata per prima?"
        },
        {
          title: "Palla bassa",
          body: ["Si ottiene il sì a condizioni vantaggiose, poi si scopre un costo in più o un vantaggio in meno. Molti restano nell'accordo: si sono già impegnati e si sono già immaginati con quella cosa."],
          study: { title: "L'esperimento", text: "In uno studio di Cialdini e colleghi, agli studenti si chiedeva di partecipare a un esperimento alle 7 del mattino. Detto subito, accettava il 31%. Se prima si chiedeva solo di partecipare e l'orario arrivava dopo il sì, accettava il 56%. E alle 7 si presentava davvero il 53%, contro il 24%.", cite: "Cialdini, Cacioppo, Bassett e Miller, Journal of Personality and Social Psychology, 1978" },
          use: "Non usarla: chi la scopre non ti compra più. Ma conoscila, perché è il trucco classico di concessionari e preventivi «tutto compreso».",
          counter: "Se le condizioni cambiano dopo il sì, la decisione si rifà da zero. Dillo: «A queste condizioni no, ricominciamo»."
        },
        {
          title: "«Non è finita»",
          body: ["Prima che tu risponda, l'offerta migliora: uno sconto, un omaggio, un accessorio. Sembra una concessione fatta per te, e invita a ricambiare."],
          study: { title: "L'esperimento", text: "A una bancarella di dolci, i cupcake a 75 centesimi con due biscotti inclusi nel prezzo vendevano al 40% dei passanti. Se il venditore diceva il prezzo e poi, prima della risposta, aggiungeva «e ci sono anche due biscotti», al 73%.", cite: "Burger, Journal of Personality and Social Psychology, 1986" },
          use: "Un'aggiunta vera, al momento giusto, rende memorabile una trattativa. Tieni sempre qualcosa da dare alla fine.",
          counter: "Confronta il prezzo finale con il mercato, non con il primo prezzo detto."
        },
        {
          title: "Il «perché»",
          body: ["Una richiesta con una ragione viene accettata molto di più. Per le richieste piccole, sembra bastare la parola stessa."],
          study: { title: "L'esperimento", text: "Ellen Langer e colleghi chiedevano di passare avanti in fila alla fotocopiatrice per cinque pagine. Senza motivo accettava il 60%; con un motivo vero («perché ho fretta») il 94%; con un motivo vuoto («perché devo fare delle copie») il 93%. Per venti pagine, invece, il motivo vuoto non funzionava più (24%, come senza motivo): contava solo quello vero (42%).", cite: "Langer, Blank e Chanowitz, Journal of Personality and Social Psychology, 1978" },
          use: "Dai sempre la ragione, e per le cose importanti una ragione vera: è lì che le persone ascoltano davvero.",
          counter: "Ascolta la ragione: spiega qualcosa o è un «perché sì» ben vestito?"
        },
        {
          title: "«Ma sei libero»",
          body: ["Ricordare all'altro che può dire no abbassa la resistenza. La pressione genera reazione contraria (lo psicologo Jack Brehm la chiamava reattanza: quando ci sentiamo spinti, difendiamo la nostra libertà facendo l'opposto)."],
          study: { title: "L'esperimento", text: "Nicolas Guéguen e Alexandre Pascual chiedevano ai passanti qualche moneta. Senza altro dava il 10%; aggiungendo «ma è libero di accettare o di rifiutare», il 47,5%, e davano anche di più. Una meta-analisi di 42 studi con oltre 22.000 persone parlava di probabilità raddoppiate. Ma una meta-analisi preregistrata del 2023 ha trovato che negli studi più rigorosi l'effetto quasi sparisce: usala come rispetto, non come trucco.", cite: "Guéguen e Pascual, Current Research in Social Psychology, 2000; Carpenter, Communication Studies, 2013; Fillon, Souchet, Pascual e Girandola, Meta-Psychology, 2023" },
          use: "Dopo una proposta forte, lascia spazio: «Decidi tu, non c'è nessun problema se non ti convince».",
          counter: "Sei davvero libero: usalo. Una richiesta educata resta una richiesta."
        }
      ],
      sources: [
        ["Freedman e Fraser 1966", "https://doi.org/10.1037/h0023552"],
        ["Cialdini e colleghi 1975, porta in faccia", "https://doi.org/10.1037/h0076284"],
        ["Cialdini e colleghi 1978, palla bassa", "https://doi.org/10.1037/0022-3514.36.5.463"],
        ["Burger 1986, «non è finita»", "https://doi.org/10.1037/0022-3514.51.2.277"],
        ["Langer, Blank e Chanowitz 1978", "https://doi.org/10.1037/0022-3514.36.6.635"],
        ["Carpenter 2013, meta-analisi «ma sei libero»", "https://doi.org/10.1080/10510974.2012.727941"],
        ["Fillon e colleghi 2023, meta-analisi preregistrata", "https://doi.org/10.15626/MP.2020.2640"]
      ]
    },
    {
      id: "bias",
      title: "Cornici e bias",
      minutes: 10,
      families: ["cornice"],
      lead: "Come cambia una decisione cambiando solo il modo di presentarla: ancore, cornici, perdite, esche e opzioni già spuntate.",
      sections: [
        {
          title: "Ancoraggio",
          body: ["Il primo numero che sentiamo diventa un punto di riferimento, anche se è chiaramente casuale. Le stime e le controfferte restano agganciate a lui."],
          study: { title: "L'esperimento", text: "Amos Tversky e Daniel Kahneman facevano girare davanti ai partecipanti una ruota truccata che si fermava su 10 o su 65, poi chiedevano quale percentuale dei Paesi africani facesse parte dell'ONU. Chi aveva visto 10 rispondeva in media 25%, chi aveva visto 65 rispondeva 45%. In un altro studio, giudici esperti tiravano dei dadi truccati prima di decidere una pena: con 3 chiedevano in media 5 mesi, con 9 otto mesi.", cite: "Tversky e Kahneman, Science, 1974; Englich, Mussweiler e Strack, Personality and Social Psychology Bulletin, 2006" },
          use: "In trattativa, quando conosci bene il valore, fai tu la prima offerta: ambiziosa ma difendibile, con una ragione. Le cifre precise (24.850) sembrano calcolate e ancorano di più di quelle tonde.",
          counter: "Prima di sentire numeri, fissa il tuo valore con dati esterni. Se arriva un'ancora assurda, non contrattare da lì: dillo, e riparti dal tuo criterio."
        },
        {
          title: "Cornice",
          body: ["Gli stessi fatti, presentati come guadagno o come perdita, portano a scelte diverse. «Il 90% sopravvive» e «il 10% muore» sono la stessa frase, ma non la stessa decisione."],
          study: { title: "L'esperimento", text: "Nel «problema della malattia asiatica», Tversky e Kahneman descrivevano un'epidemia con 600 vite in gioco. Presentata in termini di vite salvate, il 72% sceglieva il programma sicuro. Presentata in termini di morti, con numeri identici, solo il 22% lo sceglieva: la maggioranza preferiva rischiare.", cite: "Tversky e Kahneman, Science, 1981" },
          use: "Presenta l'offerta nella cornice che rende chiaro il valore vero per l'altro: costo per metro quadro e per anno di vita del pavimento, non solo il totale.",
          counter: "Riformula nell'altro modo. Se il tuo giudizio cambia, stavi reagendo alla cornice, non ai fatti."
        },
        {
          title: "Avversione alla perdita",
          body: ["Perdere 100 euro fa più male di quanto faccia piacere guadagnarne 100: in media circa il doppio. Per questo «non perdere» spinge più di «guadagna»."],
          study: { title: "La ricerca", text: "Nella teoria del prospetto, Tversky e Kahneman stimarono che una perdita pesa circa 2,25 volte un guadagno uguale. Una meta-analisi del 2024 su 607 stime trova in media circa 2 (1,96), con grandi differenze tra persone e situazioni, e alcuni ricercatori contestano che valga sempre.", cite: "Kahneman e Tversky, Econometrica, 1979; Tversky e Kahneman, Journal of Risk and Uncertainty, 1992; Brown, Imai, Vieider e Camerer, Journal of Economic Literature, 2024; Gal e Rucker, Journal of Consumer Psychology, 2018" },
          use: "Fai vedere cosa l'altro perde a non scegliere (costi di un pavimento rifatto, giorni di cantiere fermo), con numeri veri.",
          counter: "Traduci la perdita in guadagno e chiediti se lo vorresti ancora."
        },
        {
          title: "Effetto esca",
          body: ["Aggiungere un'opzione che nessuno sceglierebbe, peggiore di un'altra in tutto, sposta le scelte verso quella che la batte."],
          study: { title: "L'esempio", text: "Dan Ariely racconta un abbonamento all'Economist: solo online 59 dollari, solo carta 125, carta più online 125. Con tutte e tre, 84 studenti su 100 sceglievano carta più online. Togliendo l'opzione «solo carta», che nessuno sceglieva, il 68% prendeva solo online. È una dimostrazione in aula, non uno studio; il fenomeno (dominanza asimmetrica) è stato descritto da Huber, Payne e Puto nel 1982, e con scelte realistiche e non solo numeriche è più debole.", cite: "Huber, Payne e Puto, Journal of Consumer Research, 1982; Ariely, Prevedibilmente irrazionale, 2008; Frederick, Lee e Baskin, Journal of Marketing Research, 2014" },
          use: "Proponi tre soluzioni: base, quella che consigli, e una più completa e cara che fa da riferimento.",
          counter: "Togli mentalmente l'opzione che nessuno sceglierebbe e confronta quelle rimaste."
        },
        {
          title: "Opzione predefinita",
          body: ["Quello che è già selezionato tende a restare. Cambiare richiede uno sforzo, e la scelta predefinita sembra un consiglio implicito."],
          study: { title: "La ricerca", text: "In un esperimento online sulla donazione degli organi, diceva sì il 42% se doveva iscriversi, l'82% se doveva cancellarsi. Tra i Paesi europei con regole diverse, i consensi alla donazione differivano di quasi 60 punti. Attenzione al mito: è il consenso, non i trapianti fatti, che con il silenzio-assenso salivano di circa il 16%.", cite: "Johnson e Goldstein, Science, 2003, e Transplantation, 2004" },
          use: "Nei preventivi, metti già incluso quello che consigli davvero (posa, garanzia) e lascia la libertà di toglierlo.",
          counter: "Davanti a una casella già spuntata chiediti: la sceglierei se partissi da zero?"
        },
        {
          title: "Contrasto",
          body: ["Giudichiamo per confronto. Dopo una cosa cara, una meno cara sembra economica; dopo una richiesta grande, una media sembra piccola. Gli agenti immobiliari mostrano prima la casa peggiore."],
          use: "Mostra prima la soluzione premium, poi quella che consigli: sembrerà ragionevole. Ma deve essere davvero buona, o perdi fiducia.",
          counter: "Confronta con alternative vere, non con quello che ti hanno mostrato prima."
        }
      ],
      sources: [
        ["Tversky e Kahneman 1974, Science", "https://doi.org/10.1126/science.185.4157.1124"],
        ["Tversky e Kahneman 1981, Science", "https://doi.org/10.1126/science.7455683"],
        ["Englich, Mussweiler e Strack 2006", "https://doi.org/10.1177/0146167205282152"],
        ["Johnson e Goldstein 2003, Science", "https://doi.org/10.1126/science.1091721"],
        ["Kahneman, Pensieri lenti e veloci, 2011", ""]
      ]
    },
    {
      id: "trattare",
      title: "Trattare",
      minutes: 14,
      families: ["nego"],
      lead: "Dalla scuola di Harvard all'FBI: come si prepara una trattativa, come si apre, come si concede e come si crea valore.",
      sections: [
        {
          title: "La tua alternativa decide tutto",
          body: [
            "Roger Fisher e William Ury, del progetto di negoziazione di Harvard, chiamano BATNA la migliore alternativa a un accordo: cosa fai se non chiudi. È il tuo potere vero. Chi ha una buona alternativa può dire no; chi non ce l'ha accetta.",
            "Tra la tua alternativa e quella dell'altro c'è lo spazio dell'accordo (in inglese ZOPA). Se lo spazio non c'è, l'accordo giusto è non fare l'accordo. Prima di ogni trattativa: scrivi la tua alternativa, migliorala se puoi, stima la loro."
          ],
          use: "Prima di sederti al tavolo cerca un'offerta concorrente vera: anche se non la usi, cambia il modo in cui tratti.",
          counter: "Non rivelare la tua alternativa se la loro offerta è già migliore: diventa il loro nuovo obiettivo."
        },
        {
          title: "Interessi, non posizioni",
          body: ["La posizione è quello che uno chiede («voglio 20.000»); l'interesse è il perché («devo pagare a 90 giorni perché il committente paga tardi»). Le posizioni si scontrano, gli interessi spesso si incastrano: quello che costa poco a te può valere molto per l'altro, e viceversa.", "Chi pensa che la trattativa sia una torta da dividere lascia valore sul tavolo."],
          study: { title: "La ricerca", text: "Negli studi di Leigh Thompson e Reid Hastie, la maggior parte dei negoziatori partiva convinta che gli interessi dell'altro fossero l'esatto opposto dei propri, anche quando non era vero, e otteneva accordi peggiori per tutti e due. Una meta-analisi di 32 esperimenti ha trovato che gli accordi in cui perdono entrambi sono frequentissimi.", cite: "Thompson e Hastie, Organizational Behavior and Human Decision Processes, 1990; Thompson e Hrebec, Psychological Bulletin, 1996" },
          use: "Fai domande sul perché, non sul quanto: «Cosa conta di più per voi in questo ordine?». Poi scambia: «Se vi do i 60 giorni, il prezzo è questo».",
          counter: "Quando ti chiedono una concessione, chiedi in cambio qualcosa che vale per te."
        },
        {
          title: "La prima offerta",
          body: ["Chi fa la prima offerta fissa l'ancora. Adam Galinsky e Thomas Mussweiler hanno mostrato che le prime offerte predicono molto bene il prezzo finale, e che chi apre per primo tende a ottenere di più, a patto di conoscere il valore.", "L'ancora deve essere ambiziosa ma difendibile: una cifra fuori mercato non ancora, offende. Una cifra precisa e motivata («24.850, secondo il listino meno il 5% di fine serie») sembra calcolata e sposta di più."],
          study: { title: "La ricerca", text: "Nella vendita simulata di Galinsky e Mussweiler, la correlazione tra prima offerta e prezzo finale era 0,85. Ma il vantaggio spariva quando chi riceveva l'ancora pensava alle alternative e al limite dell'altro. Nelle trattative di Mason e colleghi, contro un'offerta tonda la controfferta si spostava in media di 4.235 dollari, contro una precisa di 3.197: chi usa cifre precise sembra più informato.", cite: "Galinsky e Mussweiler, Journal of Personality and Social Psychology, 2001; Mason, Lee, Wiley e Ames, Journal of Experimental Social Psychology, 2013" },
          use: "Se conosci il mercato, apri tu, in alto, con una ragione. Se non lo conosci, fai parlare loro.",
          counter: "Se aprono con un'ancora estrema, non rispondere facendo a metà: rimetti in discussione la cifra con un criterio oggettivo."
        },
        {
          title: "Come si concede",
          body: ["Le concessioni sono messaggi. Grandi e frequenti dicono «c'è ancora tanto margine»; piccole e decrescenti («scendo di 1.000, poi di 400, poi di 150») dicono «sto arrivando al limite». Chris Voss propone uno schema per chi compra: offerte al 65%, 85%, 95% e 100% del proprio obiettivo, con l'ultima cifra precisa e magari un piccolo extra non in denaro per chiudere.", "Mai concedere gratis: ogni concessione compra qualcosa. «Se tu…, allora io…»."],
          use: "Decidi prima di sederti: obiettivo, limite e una sequenza di concessioni decrescenti. E tieni qualcosa da dare alla fine per chiudere.",
          counter: "Se l'altro concede sempre di più, sta mandando un segnale: c'è margine, chiedi."
        },
        {
          title: "Specchio, etichette, domande calibrate",
          body: ["Chris Voss, per anni negoziatore dell'FBI nei sequestri di persona, ha reso popolari tre strumenti. È un libro di pratica, non uno studio scientifico, ma alcune parti hanno conferme in laboratorio.", "Lo specchio: ripeti le ultime due o tre parole dell'altro, con tono di domanda («…a fine mese?»). L'altro spiega di più. L'etichetta: dai un nome a quello che sente («sembra che i tempi ti preoccupino»). La tensione scende e spesso esce l'interesse vero. La domanda calibrata: apri con «come» o «cosa» («Come faccio ad accettare questa cifra?»), così l'altro ragiona sul tuo problema invece di difendersi. L'audit delle accuse: dici tu per primo le critiche che l'altro sta pensando, e perdono forza."],
          study: { title: "La ricerca", text: "In una serie di esperimenti di trattativa, chi imitava in modo discreto la postura e i gesti dell'altro chiudeva l'accordo nel 67% dei casi, contro il 12,5% di chi non lo faceva (su gruppi piccoli: una quindicina di coppie per condizione). In un ristorante olandese, le cameriere che ripetevano l'ordinazione parola per parola ricevevano mance più alte e più frequenti.", cite: "Maddux, Mullen e Galinsky, Journal of Experimental Social Psychology, 2008; van Baaren, Holland, Steenaert e van Knippenberg, Journal of Experimental Social Psychology, 2003; Voss, Never Split the Difference, 2016" },
          use: "Nel simulatore: un'etichetta giusta o una domanda calibrata fanno emergere l'interesse nascosto. Nella vita, una sola domanda «cosa ti serve per chiudere?» spesso vale più di tre controfferte.",
          counter: "Se ti ripetono le parole e tu stai parlando molto, fermati: stai regalando informazioni."
        },
        {
          title: "Criteri oggettivi",
          body: ["Quando la discussione diventa «io voglio, tu vuoi», vince il più testardo. Fisher e Ury consigliano di spostarla su criteri esterni: listino, perizia, prezzo di mercato, indice dei costi. Il criterio fa da arbitro e permette all'altro di cedere senza perdere la faccia."],
          use: "Prepara due o tre criteri che sostengono la tua cifra, e citali quando fai l'offerta.",
          counter: "Controlla il criterio: è davvero indipendente o l'hanno scelto apposta? Proponi il tuo."
        }
      ],
      sources: [
        ["Fisher, Ury e Patton, L'arte del negoziato (Getting to Yes), 1981-2011", ""],
        ["Galinsky e Mussweiler 2001", "https://doi.org/10.1037/0022-3514.81.4.657"],
        ["Maddux, Mullen e Galinsky 2008", "https://doi.org/10.1016/j.jesp.2007.02.003"],
        ["Thompson e Hastie 1990", "https://doi.org/10.1016/0749-5978(90)90048-E"],
        ["Voss e Raz, Never Split the Difference, 2016", ""]
      ]
    },
    {
      id: "lettura",
      title: "Leggere le persone, davvero",
      minutes: 9,
      families: ["leva", "cornice", "nego"],
      lead: "Cosa dice la scienza su bugie, linguaggio del corpo e «lettura del pensiero»: molto meno di quanto promettono i libri.",
      sections: [
        {
          title: "Siamo pessimi a scoprire le bugie",
          body: ["L'idea che chi mente distolga lo sguardo, si tocchi il naso o incroci le braccia è quasi tutta falsa. Gli indizi del corpo collegati alla menzogna esistono, ma sono deboli e cambiano da persona a persona."],
          study: { title: "La ricerca", text: "Una meta-analisi di Charles Bond e Bella DePaulo su 206 studi e 24.483 persone che giudicavano ha trovato che le bugie si riconoscono nel 54% dei casi: poco più del caso. Si riconoscono meglio le verità (61%) delle bugie (47%), e gli esperti non fanno meglio degli altri. Il problema non è che guardiamo gli indizi sbagliati: è che quelli giusti sono deboli.", cite: "Bond e DePaulo, Personality and Social Psychology Review, 2006; Hartwig e Bond, Psychological Bulletin, 2011" },
          use: "Non fidarti delle sensazioni sul corpo dell'altro. Fidati dei fatti verificabili.",
          counter: "Chi ti dice di saper leggere le bugie dal corpo ti sta vendendo qualcosa."
        },
        {
          title: "Cosa funziona: domande e prove",
          body: ["Mentire costa fatica: bisogna inventare, ricordare, controllare l'altro. Le tecniche che funzionano aumentano quella fatica invece di guardare i gesti: chiedere dettagli verificabili, domande inattese (sui luoghi, sull'ordine dei fatti), raccontare la storia al contrario.", "Gli psicologi svedesi Maria Hartwig e Pär Anders Granhag hanno mostrato l'uso strategico delle prove: non mostri subito quello che sai, fai raccontare e poi confronti. Chi mente si contraddice con le prove; chi dice la verità no."],
          study: { title: "La ricerca", text: "Con 82 allievi di polizia, chi era stato formato all'uso strategico delle prove riconosceva le bugie nell'85% dei casi, chi no nel 56%. In una meta-analisi, l'approccio cognitivo (carico mentale, domande inattese, più dettagli) arrivava al 71% contro il 56% dell'approccio classico; altri ricercatori pensano che il vantaggio sia sovrastimato.", cite: "Hartwig, Granhag, Strömwall e Kronkvist, Law and Human Behavior, 2006; Vrij, Fisher e Blank, Legal and Criminological Psychology, 2017" },
          use: "Con un fornitore o un candidato: fai raccontare nei dettagli, poi confronta con quello che sai. Chiedi «come è andata la volta che…», non «sei affidabile?».",
          counter: "Se qualcuno ti fa tante domande di dettaglio e tiene per sé quello che sa, sta usando questa tecnica: rispondi solo con fatti che puoi sostenere."
        },
        {
          title: "Miti da buttare",
          body: [
            "«Il 93% della comunicazione è non verbale» (la regola 7-38-55): Albert Mehrabian studiava solo come giudichiamo un sentimento quando parola e tono sono in contraddizione, con singole parole. Lui stesso dice che non vale per la comunicazione in generale.",
            "La PNL (programmazione neuro-linguistica), con i movimenti degli occhi che rivelerebbero se uno ricorda o inventa: le ricerche non la confermano. Una rassegna ha trovato 6 studi a favore, 18 contrari e 9 incerti su 33; tre esperimenti dedicati agli occhi non hanno trovato niente.",
            "Le microespressioni come macchina della verità: compaiono in circa il 2% delle espressioni e anche in chi dice la verità; l'allenamento più famoso non migliora il riconoscimento delle bugie, e il programma della sicurezza aeroportuale americana basato su questi indizi (circa 900 milioni di dollari) è stato bocciato dal suo stesso ufficio di controllo e chiuso.",
            "Le «pose di potere» che cambierebbero gli ormoni: lo studio famoso del 2010 non è stato replicato su 200 persone e la prima autrice ha dichiarato di non credere più all'effetto.",
            "L'esperimento della prigione di Stanford come prova che i ruoli rendono crudeli: le guardie erano state istruite su come comportarsi, e i dati sono incompleti."
          ],
          study: { title: "Le fonti", text: "Mehrabian, Silent Messages, 1971; Witkowski, Polish Psychological Bulletin, 2010, e Wiseman e colleghi, PLoS ONE, 2012 (PNL); Porter e ten Brinke, Psychological Science, 2008; Jordan e colleghi, Journal of Investigative Psychology and Offender Profiling, 2019; GAO-14-159, 2013 (programma SPOT); Ranehill e colleghi, Psychological Science, 2015, e Carney, 2016 (pose di potere); Le Texier, American Psychologist, 2019 (Stanford)." }
        },
        {
          title: "La lettura a freddo",
          body: ["Maghi, sedicenti sensitivi e alcuni venditori usano frasi che valgono per quasi tutti («a volte sei estroverso, altre volte hai bisogno di stare solo») e poi seguono le reazioni. Sembra che ti leggano nel pensiero. Si chiama effetto Barnum."],
          study: { title: "L'esperimento", text: "Lo psicologo Bertram Forer diede a ogni studente un «profilo di personalità personale». In realtà era lo stesso per tutti, preso da un libro di astrologia. In media i 39 studenti lo giudicarono accurato 4,26 su 5.", cite: "Forer, Journal of Abnormal and Social Psychology, 1949" },
          use: "Le prime impressioni contano: tre clip mute di dieci secondi bastavano a prevedere i giudizi che gli studenti davano ai loro professori a fine semestre (Ambady e Rosenthal, 1993). Vuol dire che gli altri ti giudicano in fretta, non che tu sappia giudicare in fretta loro: lo studio riguardava 13 insegnanti e quanto piacevano, non quanto erano bravi. Cura i primi trenta secondi.",
          counter: "Quando qualcuno ti «legge» con frasi che potrebbero valere per chiunque, chiediti se ha detto qualcosa di verificabile."
        }
      ],
      sources: [
        ["Bond e DePaulo 2006", "https://doi.org/10.1207/s15327957pspr1003_2"],
        ["Hartwig e colleghi 2006, uso strategico delle prove", "https://doi.org/10.1007/s10979-006-9053-9"],
        ["Witkowski 2010, PNL", "https://doi.org/10.2478/v10059-010-0008-0"],
        ["GAO-14-159, 2013", "https://www.gao.gov/products/gao-14-159"],
        ["Ranehill e colleghi 2015", "https://doi.org/10.1177/0956797614553946"],
        ["Forer 1949", "https://doi.org/10.1037/h0059240"],
        ["Vrij, Fisher e Blank 2017", "https://doi.org/10.1111/lcrp.12088"],
        ["Le Texier 2019, Stanford", "https://doi.org/10.1037/amp0000401"]
      ]
    },
    {
      id: "strategia",
      title: "Strategia sociale",
      minutes: 10,
      families: [],
      lead: "La parte da Classroom of the Elite: cooperazione, tradimento, reputazione e informazione, con la teoria dei giochi.",
      sections: [
        {
          title: "Il dilemma del prigioniero",
          body: ["Due complici vengono interrogati separatamente. Se tacciono entrambi, pena lieve; se uno tradisce e l'altro tace, chi tradisce esce e l'altro paga tutto; se tradiscono entrambi, pena media. Per ciascuno tradire conviene, qualunque cosa faccia l'altro; ma se lo pensano tutti e due, finiscono peggio che collaborando.", "È la struttura di moltissime situazioni reali: prezzi tra concorrenti, gruppi di lavoro, alleanze tra classi negli esami speciali. La domanda vera è: cosa succede se il gioco si ripete?"]
        },
        {
          title: "Il torneo di Axelrod",
          body: ["Nel 1980 il politologo Robert Axelrod invitò esperti di tutto il mondo a mandare strategie per un torneo di dilemmi del prigioniero ripetuti. Tra 14 strategie vinse la più semplice: «colpo su colpo» (tit for tat) di Anatol Rapoport. Al primo turno collabora, poi fa quello che l'altro ha fatto al turno prima. Vinse anche il secondo torneo, con 62 strategie in gara."],
          study: { title: "Le quattro regole di Axelrod", text: "Le strategie vincenti avevano quattro caratteristiche: gentile (non tradisce per prima), reattiva (risponde subito a un tradimento), capace di perdonare (torna a collaborare se l'altro torna), chiara (l'altro capisce presto come funziona).", cite: "Axelrod, The Evolution of Cooperation, 1984" },
          use: "Con fornitori, clienti e colleghi che vedrai di nuovo: collabora per primo, rispondi subito a una scorrettezza, perdona presto, sii prevedibile. È la reputazione che ti rende forte.",
          counter: "Con chi gioca una volta sola e sparisce, la cooperazione non è garantita: proteggiti con contratti e garanzie."
        },
        {
          title: "Il senso di giustizia",
          body: ["Nel gioco dell'ultimatum, uno propone come dividere una somma e l'altro può accettare o rifiutare; se rifiuta, nessuno prende niente. La logica dice di accettare qualsiasi cifra. Invece si offre di solito tra il 30 e il 50% (spesso esattamente metà), e le offerte sotto il 20% vengono rifiutate molto spesso: le persone pagano pur di punire un'ingiustizia."],
          study: { title: "La ricerca", text: "Güth, Schmittberger e Schwarze, Journal of Economic Behavior and Organization, 1982; Camerer, Behavioral Game Theory, 2003." },
          use: "Un accordo che l'altro sente ingiusto è un accordo fragile. Lascia sempre all'altro qualcosa da raccontare come vittoria.",
          counter: "Se ti senti trattato ingiustamente, chiediti se rifiutare ti fa bene o ti fa solo sfogare."
        },
        {
          title: "Impegni credibili e informazione",
          body: ["Thomas Schelling, premio Nobel per l'economia, ha mostrato che a volte vince chi si lega le mani: chi rende impossibile tornare indietro (un listino pubblico, un tetto deciso dal consiglio di amministrazione) rende credibile il suo «no». Il limite: deve essere vero, o diventa un bluff da scoprire.", "L'altra arma è l'informazione. Chi sa di più (cosa vuole l'altro, quali alternative ha, quando scade il suo tempo) decide le mosse. Per questo nei negoziati si fanno domande e si danno risposte misurate."],
          use: "Prima di una partita importante, chiediti: cosa so io che loro non sanno? Cosa sanno loro che io non so? Come posso scoprirlo con una domanda?",
          counter: "Quando qualcuno dice «non dipende da me», verifica: a volte è vero, a volte è un impegno costruito per non concedere."
        },
        {
          title: "Machiavelli, senza il mito",
          body: ["Il Principe (1513) è un manuale sul potere scritto da chi aveva fatto il diplomatico. Più che consigli di cattiveria, osserva come funzionano reputazione, paura e consenso. L'idea più citata (capitolo XVII): un principe dovrebbe essere amato e temuto, ma se deve scegliere è più sicuro essere temuto, purché non odiato.", "Sull'immagine, capitolo XVIII: «ognuno vede quello che tu pari, pochi sentono quello che tu se'». E sull'astuzia: «bisogna adunque essere golpe a conoscere e' lacci, e lione a sbigottire e' lupi»: la volpe riconosce le trappole, il leone spaventa i lupi, e servono tutti e due. Sugli adulatori, capitolo XXIII: l'unico modo di difendersi è che le persone «intendino che non ti offendino a dirti el vero».", "La lezione utile oggi è quella opposta al cinismo: la reputazione è un capitale. Chi inganna una volta vince una partita e perde tutte le successive."]
        },
        {
          title: "Sun Tzu: prima l'informazione",
          body: ["L'arte della guerra, il trattato cinese attribuito a Sun Tzu, è letto da secoli come un manuale di strategia anche fuori dalla guerra. Due passi del capitolo III (dalla traduzione inglese di Lionel Giles, 1910): «Combattere e vincere tutte le battaglie non è l'eccellenza suprema; l'eccellenza suprema è spezzare la resistenza del nemico senza combattere». E: «Se conosci il nemico e conosci te stesso, non devi temere il risultato di cento battaglie. Se conosci te stesso ma non il nemico, per ogni vittoria subirai anche una sconfitta. Se non conosci né il nemico né te stesso, soccomberai in ogni battaglia»."],
          use: "Prima di una trattativa o di un confronto: cosa vuole davvero l'altro, quali alternative ha, cosa teme? E tu, qual è il tuo limite vero? Vincere senza combattere vuol dire arrivare a un accordo che l'altro accetta volentieri.",
          counter: "Chi ti fa molte domande e risponde poco sta raccogliendo informazioni: rispondi in modo misurato e fai le tue."
        }
      ],
      sources: [
        ["Axelrod, The Evolution of Cooperation, 1984", ""],
        ["Güth, Schmittberger e Schwarze 1982", "https://doi.org/10.1016/0167-2681(82)90011-7"],
        ["Schelling, La strategia del conflitto, 1960", ""],
        ["Machiavelli, Il Principe (Wikisource)", "https://it.wikisource.org/wiki/Il_Principe"],
        ["Sun Tzu, The Art of War, trad. Lionel Giles, 1910 (Project Gutenberg)", "https://www.gutenberg.org/ebooks/132"]
      ]
    },
    {
      id: "difesa",
      title: "La manipolazione: riconoscerla e difendersi",
      minutes: 12,
      families: ["manip"],
      lead: "Le tattiche che usano manipolatori, gruppi chiusi e venditori aggressivi, e le contromosse che funzionano.",
      sections: [
        {
          title: "Persuasione o manipolazione?",
          body: ["La differenza non sta nella tecnica ma in tre domande: l'altro sa cosa sto facendo? Se lo sapesse, sarebbe d'accordo? La decisione serve anche a lui? La persuasione regge alla luce del sole; la manipolazione no, perché funziona solo finché l'altro non se ne accorge.", "Gli psicologi Delroy Paulhus e Kevin Williams hanno chiamato «triade oscura» tre tratti che si ritrovano spesso nei manipolatori: narcisismo, machiavellismo (freddezza strategica, pochi scrupoli), psicopatia (impulsività, poca empatia). Non serve fare diagnosi: serve riconoscere i comportamenti."]
        },
        {
          title: "Gaslighting",
          body: ["Il nome viene da un'opera teatrale del 1938 e dal film Angoscia (Gaslight, 1944), in cui un marito abbassa le luci a gas e convince la moglie che se lo immagina. È negare fatti e ricordi («non l'ho mai detto», «sei tu che ti confondi», «sei troppo sensibile») finché la vittima dubita di sé. La sociologa Paige Sweet ha mostrato che funziona soprattutto dove c'è disparità di potere."],
          counter: "Tieni traccia per iscritto (date, messaggi, email). Confrontati con persone esterne di cui ti fidi. Non entrare in discussioni infinite su cosa è reale: «Io ricordo così, e ho il messaggio»."
        },
        {
          title: "DARVO",
          body: ["La psicologa Jennifer Freyd ha descritto una reazione tipica di chi viene accusato di un comportamento scorretto: nega (Deny), attacca chi accusa (Attack) e inverte vittima e colpevole (Reverse Victim and Offender). «Io? Sei tu che mi aggredisci, sono io quello ferito qui»."],
          study: { title: "La ricerca", text: "Negli esperimenti di Sarah Harsey e Jennifer Freyd (circa 670 persone), chi leggeva una risposta di tipo DARVO giudicava la vittima meno credibile e il colpevole meno violento e meno responsabile. Una breve spiegazione di cosa sia il DARVO ne riduceva l'effetto.", cite: "Harsey e Freyd, Journal of Aggression, Maltreatment & Trauma, 2020" },
          counter: "Riporta il discorso al fatto: «Stiamo parlando di quello che è successo martedì». Conoscere il nome della tattica è già una difesa."
        },
        {
          title: "Love bombing e rinforzo intermittente",
          body: ["All'inizio attenzioni, regali, complimenti, progetti per il futuro, tutto troppo e troppo presto: abbassa le difese e crea dipendenza. Poi arriva l'alternanza: calore e freddezza senza un motivo chiaro.", "Il rinforzo intermittente è il meccanismo delle slot machine: una ricompensa imprevedibile lega più di una costante. Gli psicologi Donald Dutton e Susan Painter l'hanno usato per spiegare perché è così difficile lasciare una relazione con alti e bassi violenti (il «legame traumatico»): in 75 donne che avevano appena lasciato un partner violento, l'imprevedibilità degli abusi e lo squilibrio di potere erano i fattori che più tenevano vivo il legame, ancora dopo sei mesi."],
          counter: "Lascia scorrere il tempo: l'affetto vero regge la lentezza e i tuoi «no». Guarda come ti tratta in media, non nei momenti migliori."
        },
        {
          title: "Isolamento e controllo",
          body: ["Il sociologo Evan Stark chiama «controllo coercitivo» un insieme di comportamenti che non sempre lasciano segni: controllare soldi, telefono, spostamenti; allontanare da amici e famiglia; regole che cambiano sempre. Lo stesso schema si trova nei gruppi chiusi: lo psichiatra Robert Lifton, studiando la «riforma del pensiero», descrisse il controllo delle informazioni e dei contatti come il primo passo."],
          counter: "Mantieni i tuoi legami e le tue fonti di informazione. Se qualcuno ti chiede di tagliarli «per il tuo bene», è il segnale più chiaro."
        },
        {
          title: "Pressione commerciale",
          body: ["Falsa urgenza («solo oggi»), scarsità inventata, «il direttore mi ha autorizzato solo per lei», regali che creano debito, contratti da firmare subito. In Italia il Codice del Consumo vieta le pratiche commerciali aggressive, fatte di molestie, coercizione o «indebito condizionamento» (articoli 24-26), e per i contratti firmati fuori dai negozi o a distanza dà 14 giorni per ripensarci senza motivare (articolo 52). Approfittare dell'inesperienza di un minore o della fragilità psichica di una persona per farle firmare un atto dannoso è reato: circonvenzione di incapace, articolo 643 del codice penale."],
          counter: "La regola delle 24 ore: le decisioni importanti si prendono il giorno dopo, a mente fredda. Un'offerta che non sopravvive a una notte non era un'offerta."
        },
        {
          title: "Il vaccino: conoscere le tecniche",
          body: ["La difesa più studiata è l'inoculazione, un'idea dello psicologo William McGuire degli anni Sessanta: come un vaccino, una dose piccola di manipolazione, smascherata, rende più resistenti a quella vera.", "Il gruppo di Sander van der Linden all'Università di Cambridge l'ha messa alla prova con il gioco Bad News, in cui si fa il manipolatore per qualche minuto, e con brevi video mostrati come pubblicità su YouTube. È esattamente quello che fanno gli esercizi di riconoscimento di questa sezione."],
          study: { title: "La ricerca", text: "In circa 15.000 giocatori di Bad News, l'affidabilità percepita dei titoli falsi scendeva da 2,61 a 2,06 su una scala da 1 a 7 (una parte del calo può essere scetticismo generale). Su YouTube, i video sono stati mostrati a circa 5,4 milioni di persone: tra chi ha risposto alla domanda di controllo, il riconoscimento delle tecniche di manipolazione è salito in media del 5%, a circa 5 centesimi di dollaro per visualizzazione.", cite: "Roozenbeek e van der Linden, Palgrave Communications, 2019; Roozenbeek, van der Linden, Goldberg, Rathje e Lewandowsky, Science Advances, 2022" },
          counter: "Allenati a dare un nome alla tattica mentre la stanno usando. Quando sai come si chiama, perde gran parte della sua forza."
        }
      ],
      sources: [
        ["Paulhus e Williams 2002, la triade oscura", "https://doi.org/10.1016/S0092-6566(02)00505-6"],
        ["Sweet 2019, The Sociology of Gaslighting, American Sociological Review", "https://doi.org/10.1177/0003122419874843"],
        ["Harsey e Freyd 2020, DARVO", "https://doi.org/10.1080/10926771.2020.1774695"],
        ["Stark, Coercive Control, 2007", ""],
        ["Lifton, Thought Reform and the Psychology of Totalism, 1961", ""],
        ["Roozenbeek e colleghi 2022, Science Advances", "https://doi.org/10.1126/sciadv.abo6254"],
        ["Codice del Consumo, d.lgs. 206/2005 (Normattiva)", "https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:2005-09-06;206"]
      ]
    }
  ];
  const api = { CHAPTERS };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.InfluenceData = api;
})(typeof window !== "undefined" ? window : globalThis);
