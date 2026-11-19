/*
 * Progetto A - Memoria: contenuti (lezioni del percorso e delle applicazioni con le fonti, testi da
 * imparare a memoria, eventi per le date, lista della spesa, prime mosse delle aperture).
 * Solo dati: window.MemoryContent. Le fonti sono state controllate una per una (link nei testi).
 */
(function (root) {
  "use strict";

  const SOURCES = {
    maguire: ["Maguire e colleghi 2003, Nature Neuroscience", "https://pubmed.ncbi.nlm.nih.gov/12483214/"],
    dresler: ["Dresler e colleghi 2017, Neuron", "https://pmc.ncbi.nlm.nih.gov/articles/PMC5439266/"],
    wagner: ["Wagner e colleghi 2021, Science Advances (versione preprint)", "https://www.biorxiv.org/content/10.1101/2020.04.29.067561v1.abstract"],
    melby: ["Melby-Lervåg e Hulme 2013, Developmental Psychology", "https://acuresearchbank.acu.edu.au/item/8757y/is-working-memory-training-effective-a-meta-analytic-review"],
    born: ["Diekelmann e Born 2010, Nature Reviews Neuroscience", "https://pubmed.ncbi.nlm.nih.gov/20046194/"],
    yoo: ["Yoo e colleghi 2007, Nature Neuroscience", "https://pubmed.ncbi.nlm.nih.gov/17293859/"],
    walker: ["Walker e colleghi 2002, Neuron", "https://pubmed.ncbi.nlm.nih.gov/12123620/"],
    roediger: ["Roediger e Karpicke 2006, Psychological Science", "https://psychology.ecu.edu/wp-content/pv-uploads/sites/216/2019/03/Roediger-Karpicke-2006.pdf"],
    cepeda: ["Cepeda e colleghi 2006, Psychological Bulletin", "https://www.evullab.org/pdf/CepedaPashlerVulWixtedRohrer-PB-2006.pdf"],
    mcgee: ["McGee 1980, Memory & Cognition", "https://link.springer.com/article/10.3758/BF03211135"],
    arxiv: ["Introduzione alle gare di memoria, record e tecniche (arXiv 2025)", "https://arxiv.org/html/2504.06747v2"],
    fsrs: ["Borretti, «Implementing FSRS in 100 Lines»", "https://borretti.me/article/implementing-fsrs-in-100-lines"],
    retention: ["FSRS: la ritenzione ottimale (wiki di open-spaced-repetition)", "https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-optimal-retention"],
    benchmark: ["Benchmark of Spaced Repetition Algorithms", "https://expertium.github.io/Benchmark.html"],
    dunlosky: ["Dunlosky e colleghi 2013 (sintesi dell'APS)", "https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html"],
    noice: ["Noice e Noice 2006, Current Directions in Psychological Science (sintesi dell'APS)", "https://www.psychologicalscience.org/observer/to-be-or-or-um-line"],
    atkinson: ["Atkinson e Raugh 1975, Journal of Experimental Psychology", "https://scilit.com/publications/8107c569f5fca235d7db8383c7d0d20f"],
    keyword: ["Parola chiave e ripasso a confronto (Memory Key)", "https://mempowered.memory-key.com/node/9"],
    chase: ["Chase e Simon 1973, «Perception in chess» (appunti)", "https://notes.andymatuschak.org/Chase_and_Simon_-_Perception_in_chess"],
    gobet: ["Gobet e Simon 1996, Cognitive Psychology", "https://www.Gwern.net/doc/psychology/chess/1996-gobet.pdf"],
    chaffin: ["Chaffin e Imreh 2002, Psychological Science", "https://musiclab.uconn.edu/wp-content/uploads/sites/290/2013/10/Practicing-Perfection-Chaffin-2002.pdf"],
    dominic: ["Sistema Dominic, Wikipedia", "https://en.wikipedia.org/wiki/Dominic_system"],
    mlrecords: ["Record online di Memory League (IAM)", "https://iam-stats.org/records_ml_online.php"],
    mlimages: ["Memory League: la prova delle immagini", "https://artofmemory.com/memory-league/images-game/"]
  };

  /*
   * Lezioni. body = paragrafi; steps = cosa fare; sources = chiavi di SOURCES.
   */
  const LESSONS = [
    {
      id: "perfetta",
      title: "Memoria quasi perfetta: cosa si può fare davvero",
      lead: "Non serve un talento: i campioni di memoria hanno un cervello come il tuo e usano poche tecniche, allenate ogni giorno.",
      body: [
        "Nello studio di Maguire e colleghi (2003) 10 campioni delle gare mondiali di memoria sono stati confrontati con 10 persone comuni: stesso quoziente intellettivo e nessuna differenza nella struttura del cervello. La differenza era il metodo: 9 su 10 usavano il palazzo della memoria. Con le cifre erano molto più bravi (span di 16,8 contro 12), ma non nella memoria visiva, che non allenavano.",
        "E si impara in fretta. Nello studio di Dresler e colleghi (2017) persone comuni, allenate 30 minuti al giorno per 40 giorni con il metodo dei loci, sono passate da circa 26-30 a 62 parole ricordate su 72; quattro mesi dopo ne tenevano ancora più di 22 in più rispetto all'inizio. Questo percorso segue la stessa idea: sei settimane, mezz'ora al giorno.",
        "«Quasi perfetta» vuol dire due cose. Ricordare subito tanto e in ordine (una lista, un numero, un mazzo di carte): lo danno le tecniche. Non dimenticare per mesi quello che studi: lo dà il ripasso al momento giusto. Ti servono tutte e due, e qui si allenano insieme.",
        "Il limite onesto: si migliora in quello che si allena. Le meta-analisi di Melby-Lervåg e colleghi non trovano effetti dell'allenamento della memoria sull'intelligenza in generale. Per questo il percorso finisce su quello che ti serve davvero: studio, scacchi, lingue, pianoforte."
      ],
      steps: ["Fai la misura iniziale: è il tuo punto zero.", "Mezz'ora al giorno, tutti i giorni: la costanza conta più della durata.", "Segui l'ordine: ogni tecnica usa quella di prima.", "Rifai i test a metà, alla fine e dopo quattro mesi."],
      sources: ["maguire", "dresler", "melby"]
    },
    {
      id: "fasi",
      title: "Codificare, consolidare, richiamare",
      lead: "Ogni ricordo passa da tre fasi: se ne salti una, le altre non bastano.",
      body: [
        "Codifica: il momento in cui l'informazione entra. Senza attenzione non entra niente; con un significato, un'immagine o un luogo entra meglio. Tutte le tecniche del percorso lavorano qui.",
        "Consolidamento: nelle ore dopo, soprattutto durante il sonno, il cervello rinforza quello che hai codificato (rassegna di Diekelmann e Born, 2010).",
        "Richiamo: tirare fuori il ricordo senza guardare lo rinforza più che rileggerlo. Nell'esperimento di Roediger e Karpicke (2006), dopo una settimana chi si era interrogato ricordava il 56% del testo, chi l'aveva riletto il 42%. E ripassare a distanza batte il ripassare tutto insieme (Cepeda e colleghi, 2006)."
      ],
      steps: ["Prima di memorizzare: telefono lontano, una cosa sola.", "Mentre memorizzi: trasforma tutto in immagini, luoghi o significati.", "Subito dopo: chiudi e richiama a memoria, poi controlla.", "Il giorno dopo richiama di nuovo, poi a distanze sempre più lunghe."],
      sources: ["born", "roediger", "cepeda"]
    },
    {
      id: "immagini",
      title: "Immagini che restano",
      lead: "Le parole astratte scivolano via; un'immagine concreta, esagerata e in azione resta.",
      body: [
        "Ogni tecnica di memoria trasforma l'informazione in immagini, perché le cose concrete si ricordano meglio di quelle astratte. Ma due immagini una accanto all'altra non bastano: devono fare qualcosa insieme. Negli esperimenti sulle coppie di parole, le immagini che interagiscono si riconoscono meglio di quelle immaginate separate (McGee, 1980).",
        "Le regole dei campioni: grande o minuscola, mai normale; in movimento; con un suono, un odore, una sensazione; buffa, assurda o disgustosa; legata a te. «Gatto e libro» non resta; «un gatto enorme che si mangia il libro e ti sputa le pagine in faccia» sì."
      ],
      steps: ["Rendi concreta ogni parola: non «animale», ma «un pitbull bagnato».", "Esagera: dimensioni, quantità, colori.", "Fai agire le immagini tra loro: urti, esplosioni, una dentro l'altra.", "Aggiungi un senso in più: rumore, odore, caldo, freddo.", "Mettici dentro te stesso: le immagini che ti riguardano restano di più."],
      sources: ["mcgee"]
    },
    {
      id: "palazzo",
      title: "Costruire i palazzi come i campioni",
      lead: "Un palazzo è un percorso che conosci a occhi chiusi: ogni luogo tiene un'immagine.",
      body: [
        "Nelle gare si usano migliaia di luoghi, divisi in tanti percorsi (rassegna sulle gare di memoria, arXiv 2025). Si comincia con pochi palazzi da 10-20 luoghi e si allarga.",
        "Regole per i luoghi: diversi tra loro (non dieci sedie uguali), a distanze simili, sempre nello stesso senso di marcia, ben illuminati, né enormi né minuscoli. Meglio oggetti fissi: un mobile, una finestra, una porta.",
        "Un palazzo si usa in due modi. Per gli esercizi si riusa dopo un giorno o due, quando le immagini vecchie sono sbiadite. Per quello che vuoi tenere per sempre (un discorso, un esame, le parole di una lingua) usi un palazzo dedicato, che non riusi."
      ],
      steps: ["Scegli un posto che conosci benissimo: casa, la casa dei nonni, la scuola, la palestra.", "Cammina con la mente e scegli i luoghi in ordine, uno ogni pochi passi.", "Ripercorrilo avanti e indietro senza immagini finché è automatico.", "Ti serviranno almeno tre palazzi da 20 luoghi: costruiscili nei prossimi giorni."],
      sources: ["arxiv"]
    },
    {
      id: "ripasso",
      title: "Ripasso distanziato: quando ripassare",
      lead: "Si ripassa quando si sta per dimenticare: le schede imparate bene tornano dopo mesi, quelle difficili dopo pochi giorni.",
      body: [
        "Qui il ripasso usa FSRS, l'algoritmo adottato da Anki. Per ogni scheda stima quanto è difficile e quanto è stabile il ricordo, cioè dopo quanti giorni la probabilità di ricordarla scende al 90%. Ogni risposta aggiorna i due numeri e sceglie il giorno del ripasso successivo. Nel confronto pubblico tra algoritmi FSRS prevede il ricordo meglio del vecchio SM-2 di Anki per la quasi totalità degli utenti.",
        "Scegli tu quanto vuoi ricordare. 90% è lo standard. Al 95% gli intervalli diventano meno della metà, quindi i ripassi circa raddoppiano; al 97% quasi quadruplicano. Per una memoria quasi perfetta delle cose importanti usa il 95% e non di più: oltre, il tempo esplode e il guadagno è piccolo.",
        "Il voto deve essere onesto: «Di nuovo» se non l'hai ricordata, «Difficile» se ci hai messo tanto, «Bene» se è venuta, «Facile» se era immediata."
      ],
      steps: ["Prima i ripassi del giorno, poi le schede nuove.", "Rispondi a memoria prima di girare la scheda.", "Vota onesto: l'algoritmo impara da te.", "Poche schede nuove al giorno (10-20): i ripassi di domani nascono dalle nuove di oggi."],
      sources: ["fsrs", "retention", "benchmark"]
    },
    {
      id: "sonno",
      title: "Dormire per ricordare",
      lead: "Il sonno non è tempo perso: è quando i ricordi del giorno si fissano.",
      body: [
        "Il sonno dopo lo studio consolida i ricordi (Diekelmann e Born, 2010), e quello prima serve a memorizzare: nello studio di Yoo e colleghi (2007), dopo una notte in bianco i partecipanti ricordavano in media il 19% in meno delle immagini viste il giorno dopo.",
        "Vale anche per le abilità delle dita, come suonare: nello studio di Walker e colleghi (2002) una sequenza alla tastiera migliorava di circa il 20% dopo una notte di sonno e solo del 2% dopo 12 ore da svegli."
      ],
      steps: ["Studia o allenati e poi dormi: la sera va bene.", "Niente notti in bianco prima di un esame: studi peggio e ricordi peggio.", "La mattina richiama subito quello che hai fatto ieri.", "Dopo una sessione pesante un pisolino aiuta."],
      sources: ["born", "yoo", "walker"]
    },
    {
      id: "riuso",
      title: "Due immagini per luogo e palazzi a rotazione",
      lead: "Per andare oltre le prime decine servono più luoghi o più immagini per luogo.",
      body: [
        "Quando i luoghi sono automatici puoi metterne due per luogo: la prima a sinistra e la seconda a destra, oppure le fai interagire. È quello che fanno i campioni con le carte: Alex Mullen mette due carte per immagine, così un mazzo da 52 diventa 26 scene (arXiv 2025).",
        "Riusare un palazzo lo stesso giorno crea confusione con le immagini di prima («fantasmi»). Alterna almeno tre palazzi e lascia passare un giorno prima di riusarne uno."
      ],
      steps: ["Prova 2 parole per luogo: 30 parole in 15 luoghi.", "Tieni sempre lo stesso schema: prima a sinistra, seconda a destra.", "Alterna i palazzi: oggi A, domani B, dopodomani C."],
      sources: ["arxiv"]
    },
    {
      id: "nomi",
      title: "Nomi e volti, nella vita vera",
      lead: "Un nome si perde nei primi secondi, quando non lo stai davvero ascoltando.",
      body: [
        "Il problema di solito è l'attenzione, non la memoria: mentre l'altro dice il nome stai pensando a cosa dire tu. La tecnica ha due parti: sentire il nome (ripeterlo, usarlo) e legarlo al viso con un'immagine. Nelle gare i nomi si memorizzano così, senza palazzo (arXiv 2025).",
        "Nella vita conta anche il ripasso: la sera aggiungi le persone nuove al mazzo «Persone», con dove le hai conosciute e un dettaglio. Il ripasso distanziato fa il resto."
      ],
      steps: ["Quando senti il nome, fermati un secondo e ascolta.", "Ripetilo subito: «Piacere, Marco».", "Trasforma il nome in un'immagine (Marco → un marchio a fuoco) e mettila su un tratto del viso.", "Usalo una volta parlando e una salutando.", "La sera: mazzo «Persone», con nome, dove e un dettaglio."],
      sources: ["arxiv"]
    },
    {
      id: "fonetico",
      title: "Numeri: a coppie, con il sistema fonetico",
      lead: "Le cifre da sole non si immaginano; due alla volta diventano una parola e una scena.",
      body: [
        "Con le 100 immagini del sistema fonetico un numero lungo diventa una fila di scene: 1492 sono un toro (14) e un pane (92). Una coppia per luogo all'inizio; poi due coppie per luogo, cioè 4 cifre per luogo: 40 cifre in 10 luoghi. È la strada per le 80 cifre del formato Memory League.",
        "I campioni vanno oltre: c'è chi usa mille immagini per tre cifre (così fa Andrea Muzii, record mondiale IAM dei numeri in 5 minuti) e chi il sistema persona-azione-oggetto, che vedi nella quinta settimana. Prima però le 100 immagini devono uscire senza pensarci: meno di un secondo l'una."
      ],
      steps: ["Finisci le 100 immagini (10 nuove al giorno) e ripassale.", "Allenati a leggerle veloci: numero → immagine, subito.", "Numeri lunghi: una coppia per luogo, poi due per luogo.", "Numeri di telefono e codici: una scena sola con 3-5 immagini."],
      sources: ["arxiv"]
    },
    {
      id: "date",
      title: "Date: un evento e quattro cifre",
      lead: "Una data è una scena con dentro le immagini del suo anno.",
      body: [
        "Nelle gare si memorizzano gli anni, dal 1000 al 2099, di eventi inventati; poi gli eventi vengono mescolati e si scrive l'anno di ognuno. Il record del mondo in 5 minuti è di 148 date (Prateek Yadav; arXiv 2025).",
        "La tecnica: l'evento diventa una scena precisa, e nella scena metti l'immagine delle ultime due cifre. Per le prime due (10-20) usa la loro immagine del sistema fonetico oppure un dettaglio fisso per secolo: 19 = tutto in bianco e nero, 20 = luci e schermi, 18 = vestiti dell'Ottocento. Così «1734» è l'evento più una scena del Settecento con la tua immagine del 34 (il mare).",
        "Per la storia vera vale lo stesso: 1492 = Colombo che sbarca in groppa a un toro (14) con un pane (92) in mano."
      ],
      steps: ["Trasforma l'evento in una scena.", "Metti nella scena l'immagine delle ultime due cifre.", "Aggiungi le prime due: immagine o dettaglio del secolo.", "Rivedi la scena un attimo prima di passare alla prossima."],
      sources: ["arxiv"]
    },
    {
      id: "meta",
      title: "Metà percorso: guarda i numeri",
      lead: "Tre settimane: rifai i test e confronta con il primo giorno.",
      body: [
        "Aspettati poco sugli span di cifre all'indietro e sui blocchi, e molto nelle prove dove usi le tecniche: parole nel palazzo, numeri. È lo stesso quadro degli studi: si migliora molto in quello che si allena, poco nel resto.",
        "Se un numero è sceso, prima di dare la colpa alla tecnica guarda il sonno e la costanza delle ultime due settimane."
      ],
      steps: ["Rifai i quattro test di span.", "Parole nel palazzo: il giro più lungo che riesci.", "Guarda il confronto in Percorso e in Progressi."],
      sources: ["dresler"]
    },
    {
      id: "carte",
      title: "Il sistema delle carte, già pronto",
      lead: "Con il sistema fonetico hai già le immagini per tutte le 52 carte: ogni carta diventa un numero di due cifre.",
      body: [
        "Il seme dà la prima cifra con la stessa logica dei suoni: Picche = 9 (P), Fiori = 8 (F), Cuori = 7 (C dura), Quadri = 1 (D di Denari, il seme delle carte italiane che corrisponde ai quadri). Il valore dà la seconda: asso = 1, dal 2 al 9 la cifra stessa, il 10 = 0. Quindi il 7 di cuori è 77 (cocco), l'asso di picche 91 (botte), il 10 di fiori 80 (vaso).",
        "Le figure hanno una prima cifra loro, e il seme va in seconda: Re = 4 (R), Donna = 2 (la N di doNNa), Fante = 6 (la G dolce di «giovane»: il fante è il ragazzo). Il re di cuori è 47 (rocca), la donna di picche 29 (nube), il fante di quadri 61 (giada).",
        "Così 52 carte sono 52 delle tue 100 immagini: impari solo la regola. Poi, come i campioni, due carte per luogo: con 26 luoghi fai un mazzo intero."
      ],
      steps: ["Impara la regola: seme = prima cifra, valore = seconda; figure: Re 4, Donna 2, Fante 6, poi il seme.", "Allenati con le carte singole: carta → numero → immagine.", "Una carta per luogo con 10 carte, poi due per luogo.", "Obiettivo del percorso: mezzo mazzo, 26 carte."],
      sources: ["arxiv"]
    },
    {
      id: "astratte",
      title: "Immagini astratte: storie a righe di cinque",
      lead: "Le forme senza nome si ricordano dando a ognuna un nome e legando la riga in una storia.",
      body: [
        "In Memory League si memorizza l'ordine di immagini in un minuto e si prende un punto per ogni immagine al posto giusto. Qui le immagini sono forme astratte, a righe di cinque. La tecnica dei campioni per le immagini non usa il palazzo: a ogni forma dai la prima interpretazione che ti viene (la spirale è una lumaca, la stella rossa un riccio) e leghi le cinque di una riga in una storia breve (arXiv 2025).",
        "Il record online di Memory League è di 30 immagini in 7,58 secondi (Enrico Marraffa, 2026)."
      ],
      steps: ["Per ogni forma: la prima cosa che ti ricorda, subito, senza cercare.", "Lega le cinque della riga in una mini-storia.", "Alla risposta, ricostruisci la storia e rimetti le forme in ordine."],
      sources: ["mlimages", "arxiv", "mlrecords"]
    },
    {
      id: "studio",
      title: "Studiare per non dimenticare",
      lead: "Le due tecniche di studio con le prove più solide: interrogarsi e distribuire lo studio nel tempo.",
      body: [
        "Nella grande rassegna di Dunlosky e colleghi (2013) su dieci tecniche, solo due hanno avuto il voto più alto: interrogarsi e distribuire lo studio. Rileggere, sottolineare ed evidenziare, riassumere sono tra quelle con il voto più basso: danno la sensazione di sapere, non il ricordo.",
        "Il metodo pratico: leggi una parte, chiudi, ripeti a voce o scrivi quello che ricordi, poi controlla. Trasforma i punti importanti in domande e mettile nel mazzo «Studio»: le ripassi alle scadenze giuste fino all'esame. Spiegare aiuta: chi studiava immaginando di spiegare il significato a qualcuno ricordava di più di chi ripeteva a memoria (Noice e Noice, 2006).",
        "Per le liste da sapere in ordine (fasi, cause, articoli) usa un palazzo dedicato; per date e dati, le immagini del sistema fonetico."
      ],
      steps: ["Leggi un paragrafo, chiudi il libro, richiama a voce.", "Per ogni pagina importante 3-5 domande, con risposte brevi.", "Mettile nel mazzo Studio e ripassa ogni giorno.", "Prima dell'esame interrogati, non rileggere.", "Liste ordinate: un palazzo dedicato."],
      sources: ["dunlosky", "noice", "roediger"]
    },
    {
      id: "testi",
      title: "Testi e discorsi a memoria",
      lead: "Prima il senso, poi le parole: gli attori non imparano ripetendo a pappagallo.",
      body: [
        "Gli studi di Helga e Tony Noice sugli attori (2006) mostrano che dividono il copione in blocchi di senso e capiscono cosa vuole ottenere ogni battuta: le parole vengono dietro al senso. Per un discorso usa il palazzo, un punto per luogo, come facevano gli oratori antichi.",
        "Per un testo parola per parola (una poesia, un articolo di legge, un monologo) qui fai tre passi: le iniziali (vedi solo la prima lettera di ogni parola e ricostruisci), la cancellazione progressiva (spariscono sempre più parole) e il richiamo completo, con il controllo parola per parola. Poi il testo entra nel ripasso distanziato."
      ],
      steps: ["Leggi tutto e capisci di cosa parla, blocco per blocco.", "Dai a ogni blocco un'immagine e mettila in un luogo.", "Ricostruisci dalle iniziali, ad alta voce.", "Cancellazione progressiva: un quarto, metà, tre quarti, tutto.", "Ripassa il testo intero nei giorni dopo."],
      sources: ["noice"]
    },
    {
      id: "lingue",
      title: "Vocaboli: parola chiave e ripasso nei due sensi",
      lead: "Per le parole difficili una parola chiave che suona simile; per tutte, il ripasso nei due sensi.",
      body: [
        "Il metodo della parola chiave: trovi una parola italiana che suona come quella straniera e la leghi al significato con una scena. Nell'esperimento di Atkinson e Raugh (1975) con 120 parole russe, chi lo usava ne ricordava il 72% contro il 46%; a sorpresa, sei settimane dopo, il 43% contro il 28%.",
        "Ma non è tutto: in studi successivi interrogarsi con il ripasso ha dato risultati uguali o migliori, soprattutto per dire la parola straniera partendo dall'italiano. Quindi: parola chiave solo per le parole che non entrano, e per tutte il ripasso nei due sensi.",
        "Impara le parole dentro frasi brevi, ascoltale pronunciate e dille a voce. Per il genere (der/die/das in tedesco, le/la in francese) usa un luogo fisso per ogni genere: tutte le parole femminili in cucina, per esempio."
      ],
      steps: ["10-20 parole nuove al giorno nel mazzo Vocaboli.", "Per quelle difficili: parola chiave e scena con il significato.", "Ripasso nei due sensi: straniera → italiano e italiano → straniera.", "Ogni parola anche dentro una frase tua, detta a voce.", "Genere: un luogo o un colore fisso per ogni genere."],
      sources: ["atkinson", "keyword"]
    },
    {
      id: "scacchi",
      title: "La memoria negli scacchi",
      lead: "Un maestro non ricorda i pezzi uno per uno: ricorda schemi che conosce.",
      body: [
        "Negli esperimenti classici di Chase e Simon (1973) i giocatori forti ricostruivano posizioni di partite vere viste per 5 secondi molto meglio dei principianti, ma con i pezzi messi a caso il vantaggio quasi spariva. Gobet e Simon (1996), con posizioni a caso, hanno misurato circa il 21% di pezzi giusti per i maestri contro il 12% dei giocatori di categoria A: una differenza piccola. La memoria degli scacchi è fatta di blocchi (strutture di pedoni, arrocchi, schemi tattici) imparati giocando e studiando.",
        "Quindi niente liste di mosse a pappagallo: le aperture si imparano come piani e motivi (perché si gioca quella mossa), le posizioni si ricordano per schemi, e la visualizzazione si allena: colori delle case, diagonali, salti del cavallo, poi le posizioni a memoria."
      ],
      steps: ["Ogni giorno 2 minuti sui colori delle case: devono essere immediati.", "Posizione lampo: guarda per pochi secondi, poi rispondi.", "Aperture: una scheda per idea («perché 3.Ab5?»), non per sequenza.", "Dopo ogni partita rigiocala a memoria, senza scacchiera.", "Impara a memoria una partita famosa: la Partita dell'Opera."],
      sources: ["chase", "gobet"]
    },
    {
      id: "piano",
      title: "Pianoforte: memorizzare un brano",
      lead: "La memoria delle dita da sola è fragile: un brano si sa davvero quando se ne conosce la struttura.",
      body: [
        "La pianista Gabriela Imreh ha preparato per un disco il terzo movimento del Concerto italiano di Bach, e Roger Chaffin ne ha analizzato la pratica: 33,5 ore in 57 sessioni (Psychological Science, 2002). La sua memoria era organizzata per sezioni e per punti di riferimento scelti apposta: inizi di sezione, passaggi tecnici, punti espressivi. 27 mesi dopo ha riscritto a memoria la prima pagina: la prima battuta di ogni sezione la ricordava con probabilità 0,97, e struttura e punti di riferimento spiegavano il 76% della precisione battuta per battuta.",
        "Suonando usi quattro memorie: delle dita, dell'orecchio, degli occhi (la pagina, la tastiera) e analitica (armonia, forma). Quella delle dita viene da sola ripetendo, ma sotto pressione si inceppa: le altre sono la rete di sicurezza.",
        "Il sonno consolida anche le sequenze delle dita: circa +20% dopo una notte, +2% dopo 12 ore da svegli (Walker e colleghi, 2002)."
      ],
      steps: ["Analizza il brano: sezioni, frasi, armonia, dove si ripete e dove cambia.", "Scegli i punti di ripartenza: ogni inizio di sezione e i passaggi difficili.", "Allenati a partire da ognuno, in ordine sparso, a memoria.", "Pratica mentale lontano dal piano: suona in testa e vedi la tastiera.", "Metti il brano nel mazzo Brani: ogni sezione torna al momento giusto."],
      sources: ["chaffin", "walker"]
    },
    {
      id: "pao",
      title: "Persona, azione, oggetto: 6 cifre in un luogo",
      lead: "Il sistema dei campioni per i numeri: ogni coppia di cifre ha una persona, un'azione e un oggetto.",
      body: [
        "Nel sistema Dominic, inventato dal campione del mondo Dominic O'Brien, le cifre diventano lettere (1 A, 2 B, 3 C, 4 D, 5 E, 6 S, 7 G, 8 H, 9 N, 0 O) e una coppia diventa le iniziali di una persona: 15 = A.E. = Albert Einstein. Ogni persona ha una sua azione tipica.",
        "Con persona, azione e oggetto metti 6 cifre in un luogo: la persona della prima coppia fa l'azione della seconda con l'oggetto della terza. Qui l'oggetto è già pronto: è l'immagine del sistema fonetico. Persone e azioni le scegli tu, perché quelle che conosci (amici, parenti, personaggi che ami) funzionano meglio di quelle suggerite. Le iniziali sono solo un aiuto: se per il 15 ti viene in mente subito un altro, va bene lo stesso."
      ],
      steps: ["Per ogni coppia guarda le iniziali e scegli una persona: famosa, conosciuta o un personaggio.", "Dai a ognuna un'azione tipica, diversa dalle altre.", "Impara 10 persone al giorno con il ripasso.", "Prova: 12 cifre in 2 luoghi."],
      sources: ["dominic", "arxiv"]
    },
    {
      id: "velocita",
      title: "Velocità: il formato da un minuto",
      lead: "Quando la tecnica è sicura si accorcia il tempo: prima precisi, poi veloci.",
      body: [
        "In Memory League si memorizza per un minuto al massimo. I record online elencati dalla IAM nel 2026 comprendono due italiani: 80 cifre in 11,26 secondi (Enrico Marraffa) e 30 nomi in 20,73 secondi (Matteo Cillo). Non è l'obiettivo: serve a capire dove si può arrivare.",
        "La regola dell'allenamento: tieni la precisione sopra il 90% e accorcia il tempo poco alla volta. Se gli errori salgono, torna indietro di un passo."
      ],
      steps: ["Turni brevi, sempre con le tecniche.", "Prima la precisione: almeno il 90%.", "Poi togli 10 secondi alla volta.", "Annota dove ti blocchi: immagini lente o luoghi incerti."],
      sources: ["mlrecords"]
    },
    {
      id: "quotidiano",
      title: "La memoria di tutti i giorni",
      lead: "Numeri, liste, appuntamenti, oggetti: le stesse tecniche, in piccolo.",
      body: [
        "Numeri di telefono e codici: a coppie con il sistema fonetico, e la scena la fa la persona che chiami. Il numero di Luca che finisce con 34 92? Luca che si tuffa in mare (34) con un pane (92) in bocca.",
        "Liste (spesa, cose da fare, valigia): un palazzo corto dedicato, ad esempio la strada dall'ingresso alla cucina. Appuntamenti: giorno e ora diventano immagini nella scena del posto o della persona.",
        "Dove hai messo le cose: il problema è l'attenzione nel momento in cui le appoggi. Dillo a voce («chiavi sul mobile dell'ingresso») e immagina un dettaglio assurdo: le chiavi che bruciano il mobile."
      ],
      steps: ["Telefono: coppie di cifre → immagini → scena con la persona.", "Spesa: un luogo per ogni cosa, poi fai la spesa senza lista.", "Appuntamenti: immagine del giorno e dell'ora nella scena.", "Oggetti: dillo a voce e aggiungi un dettaglio assurdo."],
      sources: ["arxiv"]
    },
    {
      id: "mantenimento",
      title: "Dopo il percorso",
      lead: "Le tecniche restano se le usi: bastano i ripassi del giorno e tre allenamenti a settimana.",
      body: [
        "Nello studio di Dresler i miglioramenti c'erano ancora dopo quattro mesi, e il lavoro successivo sullo stesso gruppo (Wagner e colleghi, 2021) ha legato l'allenamento a ricordi più duraturi. Per tenerli: ripassi del giorno (5-10 minuti), tre turni di discipline a settimana, e le tecniche usate per davvero: nomi, numeri, studio.",
        "Tra quattro mesi dall'inizio l'app ti chiede di rifare i test: è lo stesso controllo che fanno gli studi."
      ],
      steps: ["Ogni giorno: i ripassi.", "Tre volte a settimana: una disciplina, a rotazione.", "Usa le tecniche nella vita: nomi, numeri, liste, studio.", "A quattro mesi dall'inizio: rifai i test."],
      sources: ["dresler", "wagner"]
    }
  ];

  /* ------------------------------------------------------------ testi da imparare (pubblico dominio) */
  const TEXTS = [
    {
      id: "infinito",
      title: "L'infinito (Giacomo Leopardi, 1819)",
      body: "Sempre caro mi fu quest'ermo colle,\ne questa siepe, che da tanta parte\ndell'ultimo orizzonte il guardo esclude.\nMa sedendo e mirando, interminati\nspazi di là da quella, e sovrumani\nsilenzi, e profondissima quiete\nio nel pensier mi fingo; ove per poco\nil cor non si spaura. E come il vento\nodo stormir tra queste piante, io quello\ninfinito silenzio a questa voce\nvo comparando: e mi sovvien l'eterno,\ne le morte stagioni, e la presente\ne viva, e il suon di lei. Così tra questa\nimmensità s'annega il pensier mio:\ne il naufragar m'è dolce in questo mare."
    },
    {
      id: "inferno",
      title: "Inferno, canto I, versi 1-12 (Dante Alighieri)",
      body: "Nel mezzo del cammin di nostra vita\nmi ritrovai per una selva oscura,\nché la diritta via era smarrita.\nAhi quanto a dir qual era è cosa dura\nesta selva selvaggia e aspra e forte\nche nel pensier rinova la paura!\nTant'è amara che poco è più morte;\nma per trattar del ben ch'i' vi trovai,\ndirò de l'altre cose ch'i' v'ho scorte.\nIo non so ben ridir com'i' v'intrai,\ntant'era pien di sonno a quel punto\nche la verace via abbandonai."
    },
    {
      id: "costituzione",
      title: "Costituzione italiana, articoli 1-3",
      body: "Art. 1. L'Italia è una Repubblica democratica, fondata sul lavoro. La sovranità appartiene al popolo, che la esercita nelle forme e nei limiti della Costituzione.\nArt. 2. La Repubblica riconosce e garantisce i diritti inviolabili dell'uomo, sia come singolo sia nelle formazioni sociali ove si svolge la sua personalità, e richiede l'adempimento dei doveri inderogabili di solidarietà politica, economica e sociale.\nArt. 3. Tutti i cittadini hanno pari dignità sociale e sono eguali davanti alla legge, senza distinzione di sesso, di razza, di lingua, di religione, di opinioni politiche, di condizioni personali e sociali. È compito della Repubblica rimuovere gli ostacoli di ordine economico e sociale, che, limitando di fatto la libertà e l'eguaglianza dei cittadini, impediscono il pieno sviluppo della persona umana e l'effettiva partecipazione di tutti i lavoratori all'organizzazione politica, economica e sociale del Paese."
    },
    {
      id: "opera",
      title: "La Partita dell'Opera (Paul Morphy, Parigi 1858)",
      body: "1.e4 e5 2.Cf3 d6 3.d4 Ag4 4.dxe5 Axf3 5.Dxf3 dxe5 6.Ac4 Cf6 7.Db3 De7 8.Cc3 c6 9.Ag5 b5 10.Cxb5 cxb5 11.Axb5+ Cbd7 12.0-0-0 Td8 13.Txd7 Txd7 14.Td1 De6 15.Axd7+ Cxd7 16.Db8+ Cxb8 17.Td8#",
      note: "Morphy (Bianco) contro il duca di Brunswick e il conte Isouard, giocata in un palco dell'Opera di Parigi. Impara le mosse per idee: sviluppo veloce, attacco su f7 e b7, il sacrificio in b5, la torre che entra in d7, il matto in d8."
    }
  ];

  /* ------------------------------------------------------------ date: eventi inventati */
  const EVENT_SUBJECTS = [
    "Un orso polare", "Un gatto parlante", "Una nonna di Bergamo", "Un robot da cucina", "Un pinguino", "Una banda di pirati",
    "Un bambino di sei anni", "Una squadra di cuochi", "Un vulcano", "Un gruppo di monaci", "Un pianista cieco", "Un cavallo da corsa",
    "Una scienziata svedese", "Un drago", "Un elefante", "Un pescatore", "Un treno", "Una principessa", "Un astronauta",
    "Un pappagallo", "Un mago", "Una tartaruga gigante", "Un sindaco", "Un samurai", "Un vigile", "Una regina", "Un dinosauro",
    "Un poeta", "Una ballerina", "Un orologiaio", "Un esercito di formiche", "Un faraone", "Un calciatore", "Una mucca",
    "Un fantasma", "Un giardiniere", "Uno scoiattolo", "Una sirena", "Un pompiere", "Un gigante"
  ];
  const EVENT_PREDICATES = [
    "vince il campionato del mondo di scacchi", "scopre un'isola di cioccolato", "inventa l'ombrello volante", "attraversa l'Atlantico a nuoto",
    "apre una pizzeria sulla Luna", "dipinge il Colosseo di rosa", "trova la chiave di Atlantide", "fonda una città sotto il mare",
    "scrive un libro di mille pagine", "costruisce un ponte di ghiaccio", "vende la Torre Eiffel", "insegna a volare alle galline",
    "beve un lago intero", "ruba la corona del re", "sposa un principe", "accende il primo semaforo", "scala l'Everest in pigiama",
    "dirige un'orchestra di cani", "conquista Venezia", "inventa il gelato al pepe", "perde la memoria per un anno", "trova un tesoro in giardino",
    "diventa imperatore", "apre la prima banca", "corre la maratona all'indietro", "parla con le balene", "spegne il Vesuvio",
    "costruisce una nave di carta", "vince le Olimpiadi di salto", "pianta il primo giardino di cactus", "scopre una cometa verde",
    "taglia la barba al re", "canta per tre giorni di fila", "inventa la bicicletta a vela", "affonda una flotta di pirati",
    "costruisce una piramide di neve", "regala un elefante al papa", "atterra su Marte", "abolisce il lunedì", "apre una scuola di magia"
  ];

  /* ------------------------------------------------------------ vita quotidiana */
  const GROCERIES = [
    "latte", "pane", "uova", "burro", "farina", "zucchero", "caffè", "mele", "banane", "pomodori", "insalata", "patate",
    "cipolle", "aglio", "formaggio", "prosciutto", "pasta", "riso", "olio", "sale", "yogurt", "arance", "limoni", "carote",
    "zucchine", "pollo", "tonno", "biscotti", "acqua", "detersivo", "sapone", "dentifricio", "spugne", "birra", "vino",
    "gelato", "cereali", "miele", "marmellata", "pepe", "funghi", "fragole", "basilico", "salsiccia", "mozzarella"
  ];

  /* ------------------------------------------------------------ scacchi: le prime mosse */
  // In italiano: R re, D donna, T torre, A alfiere, C cavallo.
  const OPENINGS = [
    ["Partita Italiana: le prime 3 mosse", "1.e4 e5 2.Cf3 Cc6 3.Ac4", "Il Bianco punta l'alfiere su f7, il punto debole vicino al re nero."],
    ["Partita Spagnola: le prime 3 mosse", "1.e4 e5 2.Cf3 Cc6 3.Ab5", "L'alfiere attacca il cavallo che difende e5."],
    ["Difesa Berlinese (Spagnola)", "1.e4 e5 2.Cf3 Cc6 3.Ab5 Cf6", "Il Nero contrattacca e4 invece di difendere il cavallo."],
    ["Partita Scozzese", "1.e4 e5 2.Cf3 Cc6 3.d4", "Il Bianco apre subito il centro."],
    ["Difesa Petrov", "1.e4 e5 2.Cf3 Cf6", "Il Nero risponde all'attacco su e5 attaccando e4."],
    ["Gambetto di Re", "1.e4 e5 2.f4", "Il Bianco offre un pedone per aprire la colonna f e prendere il centro."],
    ["Difesa Siciliana", "1.e4 c5", "Il Nero contesta d4 dal lato: partite asimmetriche e piene di tattica."],
    ["Difesa Francese", "1.e4 e6 2.d4 d5", "Il Nero attacca e4 con una catena di pedoni solida."],
    ["Difesa Caro-Kann", "1.e4 c6 2.d4 d5", "Come la Francese, ma l'alfiere di c8 resta libero di uscire."],
    ["Difesa Scandinava", "1.e4 d5", "Il Nero attacca e4 subito: dopo 2.exd5 Dxd5 la donna esce presto."],
    ["Difesa Pirc", "1.e4 d6 2.d4 Cf6 3.Cc3 g6", "Il Nero lascia il centro al Bianco per attaccarlo dopo, con l'alfiere in g7."],
    ["Gambetto di Donna", "1.d4 d5 2.c4", "Il Bianco offre il pedone c per togliere al Nero il controllo del centro."],
    ["Difesa Slava", "1.d4 d5 2.c4 c6", "Il Nero difende d5 con il pedone c e tiene l'alfiere di c8 libero."],
    ["Difesa Nimzo-Indiana", "1.d4 Cf6 2.c4 e6 3.Cc3 Ab4", "L'alfiere inchioda il cavallo che controlla e4."],
    ["Difesa Est-Indiana (Indiana di Re)", "1.d4 Cf6 2.c4 g6 3.Cc3 Ag7 4.e4 d6", "Il Nero lascia il centro al Bianco e prepara l'attacco con ...e5 o ...c5."],
    ["Difesa Grünfeld", "1.d4 Cf6 2.c4 g6 3.Cc3 d5", "Il Nero attacca subito il centro con i pezzi e con l'alfiere in g7."],
    ["Sistema di Londra", "1.d4 d5 2.Cf3 Cf6 3.Af4", "Il Bianco mette l'alfiere in f4 prima di chiudere la diagonale con e3."],
    ["Apertura Inglese", "1.c4", "Il Bianco controlla d5 dal lato: spesso diventa una Siciliana a colori invertiti."],
    ["Difesa Olandese", "1.d4 f5", "Il Nero controlla e4 con il pedone f, preparando un attacco sul lato di re."]
  ];

  /* ------------------------------------------------------------ applicazioni */
  const AREAS = [
    { id: "studio", title: "Studio", line: "Libri, esami, lavoro: domande da ripassare, testi da sapere parola per parola.", lessons: ["studio", "testi", "sonno"], tools: ["deck:qa", "import", "text"] },
    { id: "scacchi", title: "Scacchi", line: "Visualizzazione, posizioni lampo, aperture come idee, partite a memoria.", lessons: ["scacchi"], tools: ["chess:colors", "chess:knight", "chess:flash", "deck:openings", "text:opera"] },
    { id: "lingue", title: "Lingue", line: "Parola chiave per le parole difficili e ripasso nei due sensi.", lessons: ["lingue"], tools: ["deck:vocab"] },
    { id: "piano", title: "Pianoforte", line: "Struttura, punti di ripartenza, pratica mentale e ripasso delle sezioni.", lessons: ["piano", "sonno"], tools: ["deck:piece"] },
    { id: "vita", title: "Vita quotidiana", line: "Nomi delle persone, numeri di telefono, liste, appuntamenti.", lessons: ["nomi", "quotidiano"], tools: ["deck:people", "life:phone", "life:shop"] }
  ];

  // Sistema Dominic: cifra -> lettera
  const DOMINIC = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E", 6: "S", 7: "G", 8: "H", 9: "N", 0: "O" };

  const DATA = { SOURCES, LESSONS, TEXTS, EVENT_SUBJECTS, EVENT_PREDICATES, GROCERIES, OPENINGS, AREAS, DOMINIC };
  if (typeof module === "object" && module.exports) module.exports = DATA;
  root.MemoryContent = DATA;
})(typeof window !== "undefined" ? window : globalThis);
