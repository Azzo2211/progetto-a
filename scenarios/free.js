/*
 * Progetto A - Scenari: situazioni per la risposta libera (scrivi tu cosa
 * osservi, cosa dici e il piano B). Ogni scenario ha una risposta modello,
 * gli elementi chiave attesi (ideal) e le reazioni da evitare (traps).
 */
window.ScenarioFree = [
  {
    "id": "libera-il-gruppo-ride-mentre-una-persona",
    "type": "Pressione sociale",
    "title": "Il gruppo ride mentre una persona ti sminuisce",
    "text": "Durante una conversazione, una persona fa battute ripetute su di te e gli altri ridono. La situazione non è apertamente violenta, ma sta creando una gerarchia sociale contro di te. Scrivi cosa osservi, cosa dici, cosa fai se continua e come eviti di sembrare impulsivo.",
    "model": "Osservo chi ride per abitudine e chi sta guidando la pressione. Rispondo breve e fermo: 'La battuta è chiara, ora basta. Se vuoi parlare di me, fallo seriamente.' Se continua, smetto di nutrire la scena e parlo con una persona chiave a parte.",
    "ideal": [
      "osservo",
      "chi",
      "fermo",
      "basta",
      "continua",
      "a parte",
      "serio",
      "pubblico"
    ],
    "traps": [
      "insulto",
      "urlo",
      "vendetta",
      "minaccia"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-devi-convincere-un-gruppo-senza-sembrare",
    "type": "Negoziazione",
    "title": "Devi convincere un gruppo senza sembrare autoritario",
    "text": "Un gruppo deve lavorare, ma tutti rimandano. Tu vuoi guidare senza essere percepito come quello che comanda. Scrivi un intervento che crei direzione, ruoli, tempi e responsabilità.",
    "model": "Propongo una divisione semplice: 'Abbiamo 40 minuti. Io prendo struttura e consegna, tu fonti, tu esempi. Alle 18:20 uniamo tutto e vediamo cosa manca.' Chiedo conferma, non ordino a freddo.",
    "ideal": [
      "ruoli",
      "tempo",
      "conferma",
      "divisione",
      "manca",
      "consegna",
      "propongo"
    ],
    "traps": [
      "comando",
      "minaccio",
      "zitti",
      "obbligo"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-qualcuno-ti-ignora-apposta-o-forse",
    "type": "Conflitto ambiguo",
    "title": "Qualcuno ti ignora apposta o forse no",
    "text": "Una persona risponde in modo freddo e tu sospetti che voglia escluderti. Non hai prove solide. Scrivi come verifichi la realtà senza accusare subito e senza farti trattare da invisibile.",
    "model": "Prima raccolgo due segnali concreti. Poi chiedo in privato: 'Ho notato che nelle ultime due volte hai tagliato corto. C'è qualcosa da chiarire o sto leggendo male?' Se evita, riduco investimento e mantengo educazione.",
    "ideal": [
      "prove",
      "segnali",
      "privato",
      "notato",
      "chiarire",
      "leggendo male",
      "riduci"
    ],
    "traps": [
      "accuso",
      "spio",
      "punisco",
      "umilio"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-provocazione-davanti-a-un-adulto-o",
    "type": "Autocontrollo",
    "title": "Provocazione davanti a un adulto o superiore",
    "text": "Qualcuno ti provoca davanti a una figura importante. Reagire male ti danneggia, ma subire in silenzio ti fa perdere posizione. Scrivi una risposta con controllo, confine e reputazione.",
    "model": "Resto calmo e porto il focus sul comportamento: 'Preferisco restare sul tema. La battuta personale non aiuta.' Se insiste, dico: 'Ne parliamo dopo in modo serio.' Non regalo una scenata.",
    "ideal": [
      "calmo",
      "tema",
      "comportamento",
      "personale",
      "dopo",
      "serio",
      "scenata"
    ],
    "traps": [
      "stupido",
      "ridicolo",
      "odio",
      "urlo"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-un-collega-si-prende-il-merito",
    "type": "Reputazione",
    "title": "Un collega si prende il merito del tuo lavoro",
    "text": "Durante una riunione, un collega presenta come propria un'idea che avevi preparato tu. Il responsabile sembra credergli. Scrivi cosa osservi, cosa dici in riunione, cosa fai dopo e come difendi la tua reputazione senza creare una guerra personale.",
    "model": "Intervengo con calma e precisione: 'Aggiungo un dettaglio, perché questa proposta nasce dal lavoro che ho preparato ieri sui dati X e Y.' Dopo la riunione invio un riepilogo scritto con contributi e prossimi passaggi. Se il comportamento si ripete, ne parlo in privato con il responsabile portando fatti e date.",
    "ideal": [
      "calma",
      "fatti",
      "dati",
      "riepilogo",
      "privato",
      "responsabile",
      "date",
      "contributi"
    ],
    "traps": [
      "umilio",
      "vendetta",
      "urlo",
      "minaccio"
    ],
    "difficulty": 4
  },
  {
    "id": "libera-il-gruppo-e-bloccato-e-nessuno",
    "type": "Leadership",
    "title": "Il gruppo è bloccato e nessuno decide",
    "text": "Una squadra deve scegliere tra due opzioni, ma tutti evitano la responsabilità. Il tempo sta finendo. Scrivi come raccogli le informazioni minime, proponi una decisione e mantieni il gruppo coinvolto.",
    "model": "Riassumo i criteri decisivi, assegno cinque minuti per l'ultimo dato mancante e poi propongo una scelta motivata. Chiedo obiezioni concrete, non opinioni generiche. Se non emergono rischi nuovi, chiudo la decisione e assegno responsabilità e verifica.",
    "ideal": [
      "criteri",
      "tempo",
      "dati",
      "propongo",
      "obiezioni",
      "rischi",
      "responsabilita",
      "verifica"
    ],
    "traps": [
      "decido io",
      "zitti",
      "obbligo",
      "colpa"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-una-persona-insiste-dopo-che-hai",
    "type": "Confini",
    "title": "Una persona insiste dopo che hai già detto no",
    "text": "Hai rifiutato una richiesta, ma la persona continua a fare pressione e prova a farti sentire in colpa. Scrivi una risposta che mantenga il rapporto, protegga il tuo confine e preveda cosa fare se insiste ancora.",
    "model": "Ripeto il confine senza nuove giustificazioni: 'Capisco che per te sia importante, ma la mia risposta resta no.' Se insiste, chiudo la conversazione e la riprendo solo quando il tono torna rispettoso. Non compenso il no con promesse che non voglio mantenere.",
    "ideal": [
      "capisco",
      "risposta resta no",
      "confine",
      "se insiste",
      "chiudo",
      "rispettoso",
      "senza giustificazioni"
    ],
    "traps": [
      "minaccio",
      "sparisco",
      "ricatto",
      "umilio"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-ricevi-un-messaggio-freddo-da-una",
    "type": "Ambiguità",
    "title": "Ricevi un messaggio freddo da una persona importante",
    "text": "Una persona importante ti risponde con poche parole e senza il solito tono. Potrebbe essere infastidita, occupata o distante. Scrivi come eviti reazioni impulsive, verifichi il contesto e proteggi la relazione.",
    "model": "Non reagisco al tono come se fosse una prova. Aspetto un momento adatto e chiedo: 'Ti sento più distante del solito: è solo una giornata piena o c'è qualcosa da chiarire?' Mantengo il messaggio breve e non aggiungo accuse.",
    "ideal": [
      "non reagisco",
      "aspetto",
      "chiedo",
      "chiarire",
      "giornata",
      "senza accuse",
      "breve"
    ],
    "traps": [
      "accuso",
      "bombardo",
      "punisco",
      "controllo"
    ],
    "difficulty": 2
  },
  {
    "id": "libera-ti-offrono-meno-di-quanto-ritieni",
    "type": "Negoziazione",
    "title": "Ti offrono meno di quanto ritieni corretto",
    "text": "Ricevi una proposta economica più bassa delle aspettative. Vuoi negoziare senza sembrare aggressivo o bisognoso. Scrivi apertura, argomenti, alternativa e punto oltre il quale non accetti.",
    "model": "Ringrazio e separo il rapporto dal numero. Espongo il valore con risultati e responsabilità, propongo una fascia concreta e chiedo quali vincoli impediscono di raggiungerla. Se il budget non cambia, valuto benefit o una revisione con data e condizioni misurabili.",
    "ideal": [
      "valore",
      "risultati",
      "fascia",
      "vincoli",
      "benefit",
      "revisione",
      "data",
      "condizioni"
    ],
    "traps": [
      "ultimatum",
      "offesa",
      "bisogno",
      "minaccia"
    ],
    "difficulty": 4
  },
  {
    "id": "libera-l-ascensore-si-blocca-con-due",
    "type": "Scenario insolito",
    "title": "L'ascensore si blocca con due persone che iniziano a litigare",
    "text": "L'ascensore si ferma tra due piani. Una persona accusa l'altra di aver premuto un pulsante sbagliato e il tono sale rapidamente. Non sai quanto durerà il blocco. Scrivi cosa osservi, cosa dici, come riduci il rischio e cosa fai se qualcuno perde il controllo.",
    "model": "Controllo prima il pulsante di emergenza e comunico la situazione. Poi dico con tono calmo: 'Adesso la priorità è uscire in sicurezza; discutere sul pulsante non ci aiuta.' Tengo distanza, evito contatto fisico e, se il tono peggiora, chiedo a ciascuno di stare su lati diversi mentre resto in comunicazione con l'assistenza.",
    "ideal": [
      "emergenza",
      "sicurezza",
      "calmo",
      "distanza",
      "assistenza",
      "se peggiora",
      "priorita"
    ],
    "traps": [
      "spingo",
      "minaccio",
      "colpisco",
      "chiudo la bocca"
    ],
    "difficulty": 4
  },
  {
    "id": "libera-a-una-cena-tutti-credono-che",
    "type": "Scenario assurdo",
    "title": "A una cena tutti credono che tu sia un'altra persona",
    "text": "Arrivi a una cena e, per un equivoco, diverse persone ti chiamano con un altro nome e ti attribuiscono un lavoro che non fai. Una persona inizia anche a confidarti informazioni private pensando di conoscerti. Scrivi quando correggi l'equivoco, con quale frase e come gestisci ciò che hai già sentito.",
    "model": "Interrompo appena capisco l'equivoco: 'Credo ci sia un errore: io sono Emanuele, non la persona che pensate.' Non uso le informazioni ascoltate e dico alla persona che preferisco fermarla perché probabilmente non voleva condividerle con me. Mantengo un tono leggero senza alimentare la situazione.",
    "ideal": [
      "errore",
      "chiarisco",
      "subito",
      "privacy",
      "non uso",
      "tono leggero"
    ],
    "traps": [
      "fingo",
      "sfrutto",
      "registro",
      "racconto agli altri"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-circola-un-audio-falso-con-la",
    "type": "Tecnologia e reputazione",
    "title": "Circola un audio falso con la tua voce",
    "text": "In una chat di gruppo compare un audio che sembra avere la tua voce e contiene una frase offensiva. Alcuni ci credono, altri chiedono spiegazioni. Scrivi cosa fai nei primi dieci minuti, quali prove raccogli e come comunichi senza sembrare difensivo o confuso.",
    "model": "Salvo il file e gli screenshot, verifico origine e orario, poi scrivo: 'Quell'audio non è mio. Sto verificando da dove provenga; nel frattempo vi chiedo di non inoltrarlo.' Contatto in privato gli amministratori e le persone coinvolte, preparo un confronto verificabile e, se necessario, segnalo formalmente il contenuto.",
    "ideal": [
      "salvo",
      "screenshot",
      "origine",
      "non inoltrare",
      "amministratori",
      "verifico",
      "segnalo"
    ],
    "traps": [
      "minaccio tutti",
      "cancello prove",
      "accuso senza prove",
      "vendetta"
    ],
    "difficulty": 5
  },
  {
    "id": "libera-uno-sconosciuto-ti-chiede-di-custodire",
    "type": "Dilemma sociale",
    "title": "Uno sconosciuto ti chiede di custodire una busta sigillata",
    "text": "In una stazione uno sconosciuto agitato ti chiede di tenere per pochi minuti una busta chiusa mentre lui va via. Non sai cosa contenga. Vuole lasciartela in mano e insiste che è urgente. Scrivi cosa dici e come mantieni sicurezza senza creare panico.",
    "model": "Non accetto la busta e rispondo: 'Non posso custodire oggetti di sconosciuti. Può rivolgersi al personale della stazione.' Mantengo distanza, non tocco l'oggetto e, se viene abbandonato, avviso il personale senza manipolarlo.",
    "ideal": [
      "non accetto",
      "personale",
      "distanza",
      "non tocco",
      "avviso"
    ],
    "traps": [
      "apro",
      "porto via",
      "nascondo",
      "accetto"
    ],
    "difficulty": 4
  },
  {
    "id": "libera-durante-una-cerimonia-ti-assegnano-per",
    "type": "Imbarazzo pubblico",
    "title": "Durante una cerimonia ti assegnano per errore un premio",
    "text": "Il presentatore pronuncia il tuo nome e ti consegna un premio che capisci essere destinato a un'altra persona. Il pubblico applaude e la diretta è già iniziata. Scrivi come correggi l'errore senza mettere in difficoltà il presentatore o il vero vincitore.",
    "model": "Prendo il microfono con calma: 'Grazie, ma credo ci sia un errore nel nome. Preferisco fermarmi un momento per verificare e dare il riconoscimento alla persona corretta.' Sorrido, restituisco il premio al presentatore e lascio che l'organizzazione chiarisca.",
    "ideal": [
      "errore",
      "verificare",
      "persona corretta",
      "calma",
      "restituisco"
    ],
    "traps": [
      "tengo il premio",
      "ridicolizzo",
      "scappo",
      "fingo"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-tutti-votano-una-decisione-chiaramente-sbagliata",
    "type": "Pressione di gruppo",
    "title": "Tutti votano una decisione chiaramente sbagliata",
    "text": "In una riunione dieci persone scelgono rapidamente una soluzione che, secondo i dati che hai davanti, creerà un problema serio. Sei l'unico contrario e il gruppo vuole chiudere. Scrivi come interrompi il consenso senza trasformarti nel nemico del gruppo.",
    "model": "Non attacco le persone. Dico: 'Prima di chiudere, vorrei mostrare un dato che cambia il rischio della scelta.' Presento un fatto verificabile, propongo un test piccolo o una pausa breve e chiedo quale condizione farebbe rivedere la decisione.",
    "ideal": [
      "dato",
      "rischio",
      "verificabile",
      "test",
      "condizione",
      "pausa"
    ],
    "traps": [
      "siete tutti stupidi",
      "impongo",
      "saboto",
      "minaccio"
    ],
    "difficulty": 4
  },
  {
    "id": "libera-un-giornalista-ti-fa-una-domanda",
    "type": "Emergenza reputazionale",
    "title": "Un giornalista ti fa una domanda a sorpresa davanti a una telecamera",
    "text": "All'uscita da un evento una persona con telecamera ti chiede conto di una vicenda che conosci solo in parte. La domanda contiene un'accusa e cerca una reazione immediata. Scrivi una risposta di venti secondi e cosa fai subito dopo.",
    "model": "Rispondo: 'Non ho elementi sufficienti per commentare in modo responsabile. Posso confermare che verificheremo i fatti e forniremo una risposta precisa tramite il canale ufficiale.' Non improvviso dettagli; annoto domanda e contesto, avviso le persone competenti e preparo una risposta documentata.",
    "ideal": [
      "non ho elementi",
      "verificare",
      "fatti",
      "canale ufficiale",
      "risposta precisa",
      "non improvviso"
    ],
    "traps": [
      "nego tutto",
      "insulto",
      "invento",
      "scappo urlando"
    ],
    "difficulty": 5
  },
  {
    "id": "libera-una-stanza-intera-smette-di-parlare",
    "type": "Ambiguità estrema",
    "title": "Una stanza intera smette di parlare quando entri",
    "text": "Entri in una stanza e una conversazione si interrompe di colpo. Alcuni evitano il tuo sguardo. Potrebbero parlare di te oppure semplicemente di qualcosa di riservato. Scrivi come reagisci nei primi minuti e come verifichi senza creare paranoia.",
    "model": "Non tratto il silenzio come una prova. Saluto normalmente, osservo se il comportamento continua e proseguo con il mio obiettivo. Solo se emergono segnali concreti chiedo in privato a una persona affidabile: 'Ho percepito un cambio di tono entrando; c'è qualcosa che devo sapere o era un tema riservato?'",
    "ideal": [
      "non è una prova",
      "osservo",
      "segnali concreti",
      "privato",
      "chiedo"
    ],
    "traps": [
      "accuso tutti",
      "spio",
      "controllo telefoni",
      "minaccio"
    ],
    "difficulty": 4
  },
  {
    "id": "libera-un-amico-ti-chiede-di-confermare",
    "type": "Lealtà e integrità",
    "title": "Un amico ti chiede di confermare una bugia piccola ma verificabile",
    "text": "Un amico ti chiede di dire che era con te in un certo momento. Sembra una bugia piccola, ma la persona a cui dovresti dirla potrebbe facilmente verificare. Scrivi come proteggi il rapporto senza diventare parte della menzogna.",
    "model": "Dico in privato: 'Non posso confermare una cosa falsa. Posso però aiutarti a spiegare la situazione in modo onesto o a preparare una risposta breve.' Non lo espongo davanti agli altri, ma non accetto di diventare una prova inventata.",
    "ideal": [
      "non posso",
      "falsa",
      "privato",
      "onesto",
      "aiutarti",
      "non espongo"
    ],
    "traps": [
      "confermo",
      "ricatto",
      "umilio",
      "minaccio"
    ],
    "difficulty": 3
  },
  {
    "id": "libera-due-responsabili-ti-danno-ordini-incompatibili",
    "type": "Caos operativo",
    "title": "Due responsabili ti danno ordini incompatibili nello stesso minuto",
    "text": "Due persone con autorità ti assegnano richieste urgenti che non possono essere completate insieme. Entrambe danno per scontato di avere priorità. Scrivi come chiarisci la gerarchia senza scegliere arbitrariamente e senza apparire passivo.",
    "model": "Rendo visibile il conflitto: 'Ho ricevuto due priorità incompatibili, A richiede due ore e B tre. Posso iniziare subito, ma serve una decisione sulla precedenza.' Metto entrambe le persone nello stesso scambio, propongo l'ordine più logico con motivo e chiedo conferma scritta.",
    "ideal": [
      "incompatibili",
      "priorita",
      "tempo",
      "decisione",
      "propongo",
      "conferma"
    ],
    "traps": [
      "ignoro",
      "fingo di farle entrambe",
      "accuso",
      "sparisco"
    ],
    "difficulty": 4
  }
];
