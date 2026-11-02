/*
 * Progetto A - Recupero: piano dopo la ricostruzione del crociato anteriore (LCA) che allena anche
 * le arti marziali. Contenuti senza DOM: fasi, esercizi, sessioni, test, lezioni con le fonti.
 *
 * Basi (vedi LESSONS e SOURCES): linee guida MOON (Wright 2015, progressione per criteri, catena
 * aperta dalla 6a settimana, corsa quando cammini e saltelli senza dolore ne' gonfiore, test su una
 * gamba all'85%), Grindem 2016 (ritorno agli sport con pivot dopo il 9o mese e con il quadricipite
 * almeno al 90% dell'altra gamba), Perriman 2018 (catena aperta e chiusa equivalenti per lassita'),
 * Shelbourne 2012 (anche pochi gradi di estensione persi contano per l'artrosi), Schoenfeld 2017
 * (ipertrofia anche con carichi leggeri vicino al cedimento), Morton 2018 (proteine).
 *
 * Ogni esercizio: obiettivo, descrizione, passi, punti chiave, errori con correzione, dose,
 * sicurezza, livelli (dal piu' facile; un livello puo' chiedere una fase o un mese minimo) e cosa
 * da' alle arti marziali. Schema controllato da tests/recovery.test.js.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RecoveryData = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const AREAS = [
    { id: "ext", label: "Estensione" },
    { id: "legs", label: "Gambe" },
    { id: "upper", label: "Parte alta" },
    { id: "core", label: "Tronco" },
    { id: "martial", label: "Tecnica marziale" }
  ];

  const PHASES = [
    {
      n: 1,
      name: "Estensione e controllo",
      goal: "Ginocchio dritto come l'altro, quadricipite che risponde subito, niente gonfiore dopo le sessioni.",
      focus: "Ogni giorno la routine di estensione due volte. Forza con il ginocchio poco piegato: l'altezza della sedia decide quanto scendi. Parte alta piena.",
      difesaYes: ["Shadow da seduto e parate a piedi fermi", "Tecnica delle braccia, guardia e respirazione", "Esercizi per la parte alta e per il tronco"],
      difesaNo: ["Calci, salti, corda e sprawl", "Squat profondi, affondi e posizioni basse (cavaliere, ginga)", "Pivot sul piede, corsa, lotta e proiezioni"]
    },
    {
      n: 2,
      name: "Forza",
      goal: "Quadricipite e glutei forti su ogni gamba, equilibrio su una gamba, ginocchio in linea quando ti pieghi.",
      focus: "Esercizi su una gamba, profondità che cresce poco a poco, carico con i manubri. In piedi torni a tirare colpi a piedi fermi.",
      difesaYes: ["Shadow in piedi a piedi fermi, ruotando sull'avampiede", "Passi in guardia avanti e indietro", "Colpi e ginocchiate lente in equilibrio"],
      difesaNo: ["Calci veloci, salti e corda", "Cambi di direzione e pivot veloci", "Sprawl, lotta, proiezioni e sparring"]
    },
    {
      n: 3,
      name: "Corsa, salti e tecnica in movimento",
      goal: "Correre in linea retta, saltare e atterrare con le ginocchia in linea, shadow in movimento e calci lenti.",
      focus: "Impatto a dosi crescenti con il controllo del giorno dopo. Forza sempre presente. Tecnica in movimento al 50–75% della velocità.",
      difesaYes: ["Corda e saltelli", "Shadow in movimento con pivot sull'avampiede al 50–75%", "Calci bassi e lenti"],
      difesaNo: ["Calci girati o saltati, calci alti a piena velocità", "Sprawl, lotta, proiezioni e sparring"]
    },
    {
      n: 4,
      name: "Ritorno al combattimento",
      goal: "Velocità piena, cambi di direzione e calci completi; contatto per gradi con l'ok del chirurgo.",
      focus: "Agilità, salti su una gamba, sparring progressivo. La forza resta due volte a settimana anche dopo: è la migliore prevenzione.",
      difesaYes: ["Tutta la tecnica a velocità piena", "Sparring progressivo, poi lotta e proiezioni"],
      difesaNo: ["Saltare i gradi dello sparring", "Smettere la forza: due sessioni a settimana restano"]
    }
  ];

  // Date minime prudenti dall'intervento (mesi): contano prima i criteri, poi il calendario.
  const GATES = [
    { id: "jog", months: 3, label: "Corsa leggera in linea retta" },
    { id: "jump", months: 4, label: "Salti a due piedi e corda" },
    { id: "pivot", months: 6, label: "Cambi di direzione, pivot e calci al 75% e oltre" },
    { id: "contact", months: 9, label: "Sparring, proiezioni, lotta: il contatto vero" }
  ];

  const GRAFTS = [
    { id: "rotuleo", label: "Tendine rotuleo", tip: "Con il tendine rotuleo stare in ginocchio può dar fastidio per mesi: metti un cuscino o scegli le versioni in piedi e da sdraiato. Dolore davanti alla rotula negli esercizi per il quadricipite: carico più basso per qualche sessione." },
    { id: "semitendinoso", label: "Flessori (semitendinoso)", tip: "Con il tendine preso dai flessori, quei muscoli recuperano più lentamente: stacco rumeno e curl scivolato salgono con calma. Niente Nordic curl senza l'ok del fisioterapista; fermati se senti tirare dietro la coscia, dove è stato preso il tendine." },
    { id: "quadricipitale", label: "Tendine quadricipitale", tip: "Con il tendine quadricipitale il quadricipite è il muscolo da ricostruire per primo: estensione da seduto, arco corto e sedia sono i tuoi esercizi chiave." },
    { id: "nonso", label: "Non lo so", tip: "Chiedi al chirurgo o guarda la lettera di dimissione: il tipo di innesto cambia qualche dettaglio (in ginocchio, flessori)." }
  ];

  const FLEX = [
    { id: 0, label: "Poco: mi alzo bene solo da sedute alte", start: 0 },
    { id: 1, label: "A metà: una sedia normale va bene", start: 2 },
    { id: 2, label: "Quasi tutto: scendo bene anche più in basso", start: 3 }
  ];

  const EXERCISES = [
    /* ------------------------------------------------------------------ ESTENSIONE */
    {
      id: "prono-appeso", area: "ext", name: "Prono appeso",
      goal: "Recuperare gli ultimi gradi di estensione lasciando lavorare il peso della gamba, senza forzare.",
      how: "Sdraiato a pancia in giù sul letto con le ginocchia appena fuori dal bordo: la rotula resta fuori dal materasso e la gamba pende nel vuoto. Il peso della gamba stira piano il retro del ginocchio.",
      steps: [
        "Sdraiati a pancia in giù vicino al bordo del letto, con un cuscino sotto la pancia se la schiena tira.",
        "Scivola indietro finché le ginocchia sono appena fuori: il bordo del materasso deve stare sopra la rotula, non sotto.",
        "Lascia pendere le gambe rilassando del tutto coscia e polpaccio. Respira lento.",
        "Resta per tutto il tempo. Per uscire piega prima la gamba sana e girati sul fianco."
      ],
      cues: [
        "Rilassa i muscoli: se contrai i flessori il ginocchio non si stende.",
        "Stiramento dietro il ginocchio va bene; dolore che sale o formicolio no.",
        "Guarda i talloni: l'obiettivo è che arrivino alla stessa altezza."
      ],
      errors: [
        { e: "Rotula appoggiata sul materasso", fix: "Scivola più indietro: il materasso sotto la rotula spinge il ginocchio in alto e annulla l'esercizio." },
        { e: "Pochi secondi alla volta", fix: "L'estensione si recupera con tempi lunghi e carico basso: minuti, non secondi." },
        { e: "Peso aggiunto troppo presto", fix: "Prima 5 minuti comodi senza peso, poi una scarpa o 0,5–1 kg alla caviglia." }
      ],
      dose: { sets: 1, work: 300 },
      safety: "Se compare formicolio al piede o dolore acuto dietro il ginocchio, esci e la volta dopo resta meno tempo.",
      levels: [
        { name: "3 minuti", text: "Tre minuti senza peso.", dose: { sets: 1, work: 180 } },
        { name: "5 minuti", text: "Cinque minuti senza peso." },
        { name: "5 minuti con una scarpa", text: "Una scarpa da ginnastica o 0,5–1 kg legato alla caviglia." },
        { name: "8 minuti con 1–2 kg", text: "Un sacchetto da 1–2 kg alla caviglia (uno zainetto con una bottiglia).", dose: { sets: 1, work: 480 } }
      ],
      martial: "Un ginocchio che si stende del tutto è la base della guardia e dei calci: senza gli ultimi gradi il calcio frontale e la spinta del diretto perdono forza."
    },
    {
      id: "tallone-rialzo", area: "ext", name: "Tallone su rialzo con contrazioni",
      goal: "Stendere il ginocchio da supino e insegnare al quadricipite a tenerlo dritto da solo.",
      how: "Seduto con il tallone su un rialzo (asciugamano arrotolato, libri, uno sgabello basso) e niente sotto il ginocchio, che resta sospeso. Ogni 30 secondi contrai la coscia per 10 secondi spingendo il ginocchio verso il basso.",
      steps: [
        "Seduto a terra o sul letto con la schiena appoggiata. Tallone su un rialzo di 10–15 cm, sotto il ginocchio solo aria.",
        "Punta del piede verso il soffitto: la gamba non ruota verso l'esterno.",
        "Lascia scendere il ginocchio per 20 secondi, rilassato.",
        "Contrai la coscia per 10 secondi: la rotula sale, il retro del ginocchio scende. Rilassa e ricomincia fino alla fine del tempo."
      ],
      cues: [
        "Piede che guarda in alto: se cade verso l'esterno il ginocchio non si stira davvero.",
        "Nella contrazione senti indurirsi la parte interna sopra il ginocchio.",
        "Se contraendo il tallone si stacca appena dal rialzo, il quadricipite sta tirando bene."
      ],
      errors: [
        { e: "Cuscino sotto il ginocchio", fix: "Mai, nemmeno a letto la sera: è comodo ma tiene la gamba piegata, il contrario di quello che serve." },
        { e: "Fiato trattenuto", fix: "Espira mentre contrai e conta i 10 secondi ad alta voce." }
      ],
      dose: { sets: 1, work: 300 },
      safety: "Il peso va sulla coscia appena sopra la rotula, mai sulla rotula. Stiramento sì, dolore acuto no.",
      levels: [
        { name: "Solo contrazioni", text: "Gamba distesa a terra: 10 contrazioni da 10 secondi.", dose: { sets: 1, reps: "10 × 10 s" } },
        { name: "Tallone su rialzo", text: "Cinque minuti con una contrazione ogni 30 secondi." },
        { name: "Con peso sopra il ginocchio", text: "Come prima, con 2–4 kg (zaino o borsa) sulla coscia appena sopra la rotula." },
        { name: "Asciugamano", text: "Asciugamano intorno all'avampiede: lo tiri verso di te con le mani mentre spingi il ginocchio giù con la coscia. 10 tirate da 10 secondi.", dose: { sets: 1, reps: "10 × 10 s" } }
      ],
      martial: "Il quadricipite che chiude l'ultimo grado di estensione è lo stesso che stende la gamba d'appoggio quando calci e che blocca il ginocchio nella spinta del diretto."
    },
    {
      id: "arco-corto", area: "ext", name: "Arco corto",
      goal: "Rinforzare l'ultimo tratto di estensione: il quadricipite deve saper portare il ginocchio dritto e tenerlo lì.",
      how: "Sdraiato con un asciugamano arrotolato grosso (o una bottiglia da un litro e mezzo) sotto il ginocchio: da lì stendi la gamba fino a dritta, tieni 3 secondi e torni giù lento.",
      steps: [
        "Sdraiato sulla schiena, rotolo da 10–15 cm sotto il ginocchio operato, l'altra gamba piegata con il piede a terra.",
        "Punta il piede verso di te e contrai la coscia.",
        "Solleva il tallone fino a stendere del tutto il ginocchio, con il retro del ginocchio che resta sul rotolo.",
        "Tieni 3 secondi con la gamba dritta, poi scendi in 2 secondi."
      ],
      cues: [
        "Conta: su in 1, fermo 3, giù in 2.",
        "Il ginocchio deve arrivare dritto davvero: se si ferma prima, il carico è troppo.",
        "Prima la gamba operata, poi la sana."
      ],
      errors: [
        { e: "Calcio veloce senza tenuta", fix: "Lo slancio fa il lavoro al posto del muscolo: fermati 3 secondi in alto." },
        { e: "Tallone che non arriva in alto", fix: "Togli il peso: meglio dritto senza peso che a metà con il peso." }
      ],
      dose: { sets: 3, reps: 12, rest: 45 },
      safety: "A 4 mesi sei oltre i tempi in cui le linee guida MOON aprono l'estensione in catena aperta a tutto l'arco. Se senti dolore davanti al ginocchio, riduci il peso.",
      levels: [
        { name: "Senza peso", text: "Solo la gamba." },
        { name: "Con una scarpa", text: "Una scarpa da ginnastica al piede." },
        { name: "1 kg alla caviglia", text: "Zainetto o sacchetto da 1 kg appeso alla caviglia." },
        { name: "2–3 kg alla caviglia", text: "Zaino con 2–3 kg (bottiglie d'acqua) appeso alla caviglia." }
      ],
      martial: "È l'ultimo tratto del calcio frontale e del circolare: un quadricipite che chiude forte gli ultimi gradi dà potenza al colpo."
    },

    /* ------------------------------------------------------------------ GAMBE */
    {
      id: "slr", area: "legs", name: "Sollevamento a gamba tesa",
      goal: "Controllo del quadricipite: alzare la gamba senza che il ginocchio si pieghi (il «ritardo di estensione»).",
      how: "Sdraiato, gamba sana piegata e operata distesa: contrai la coscia fino a stendere del tutto il ginocchio e solleva la gamba dritta fino all'altezza dell'altro ginocchio.",
      steps: [
        "Sdraiato sulla schiena, gamba sana piegata con il piede a terra.",
        "Gamba operata distesa, piede verso di te, coscia contratta: il ginocchio è dritto prima di salire.",
        "Solleva la gamba dritta fino all'altezza del ginocchio piegato, in 2 secondi.",
        "Tieni 2 secondi e scendi lento, senza appoggiare del tutto prima della ripetizione successiva."
      ],
      cues: [
        "Prima contrai, poi sollevi: mai il contrario.",
        "Se il ginocchio si piega anche di poco salendo, fermati e fai qualche contrazione in più a terra.",
        "Schiena appoggiata e pancia leggermente contratta."
      ],
      errors: [
        { e: "Ginocchio che si piega salendo", fix: "È il ritardo di estensione: torna alle contrazioni con il tallone sul rialzo e riprova alla sessione dopo." },
        { e: "Gamba lanciata in alto", fix: "Più lento: 2 secondi su, 2 fermo, 2 giù." }
      ],
      dose: { sets: 3, reps: 10, rest: 45 },
      safety: "Le linee guida MOON chiedono 20 sollevamenti senza ritardo prima di passare alle fasi successive: è anche uno dei tuoi test.",
      levels: [
        { name: "Lento", text: "2 secondi su, 2 di tenuta, 2 giù." },
        { name: "Tenuta lunga", text: "5 secondi fermo in alto.", dose: { sets: 3, reps: 8, rest: 45 } },
        { name: "Con una scarpa", text: "Scarpa al piede o 0,5 kg alla caviglia." },
        { name: "1–2 kg alla caviglia", text: "Zainetto da 1–2 kg appeso alla caviglia." }
      ],
      martial: "Alzare e tenere la gamba dritta con il quadricipite è lo stesso controllo del calcio frontale spinto (teep)."
    },
    {
      id: "sedia", area: "legs", name: "Seduto-in piedi dalla sedia",
      goal: "Rinforzare cosce e glutei piegando il ginocchio solo fin dove oggi è comodo: l'altezza della seduta decide quanto scendi.",
      how: "Ti alzi e ti risiedi su una sedia resa più alta con dei cuscini. Quando il ginocchio tollera di più, togli un cuscino: scendi un po' di più senza cambiare esercizio.",
      steps: [
        "Sedia contro il muro, con i cuscini del livello. Piedi alla larghezza delle anche, un po' indietro rispetto alle ginocchia.",
        "Busto in avanti con la schiena dritta, peso su entrambi i piedi (controlla che l'operata non si scarichi).",
        "Spingi il pavimento e alzati fino a stendere del tutto anche e ginocchia.",
        "Torna a sederti in 3 secondi, sfiorando la seduta senza lasciarti cadere."
      ],
      cues: [
        "Ginocchia in linea con le punte dei piedi: non cadono verso l'interno.",
        "Stessa spinta sulle due gambe: allo specchio il bacino non scivola verso la gamba sana.",
        "In piedi stendi del tutto il ginocchio e stringi i glutei."
      ],
      errors: [
        { e: "Peso tutto sulla gamba sana", fix: "Metti il piede della gamba sana mezzo passo più avanti: così l'operata lavora di più." },
        { e: "Seduta di colpo", fix: "Discesa in 3 secondi: la fase in discesa costruisce forza e controllo." },
        { e: "Ginocchia che entrano", fix: "Spingi le ginocchia appena verso l'esterno, come ad allargare il pavimento." }
      ],
      dose: { sets: 3, reps: 10, rest: 75 },
      safety: "Fastidio leggero (fino a 3 su 10) che passa entro il giorno dopo va bene. Dolore acuto, o ginocchio più gonfio il giorno dopo: torna al livello precedente.",
      levels: [
        { name: "Sedia + 2 cuscini", text: "Seduta alta: il ginocchio si piega poco." },
        { name: "Sedia + 1 cuscino", text: "Un cuscino solo." },
        { name: "Sedia normale", text: "La seduta di una sedia normale, circa 45 cm." },
        { name: "Sedia con manubrio", text: "Un manubrio tenuto al petto con due mani (goblet).", dose: { sets: 3, reps: "8–12", rest: 90 } },
        { name: "Manubrio, discesa lenta", text: "Manubrio al petto, discesa in 4 secondi e 1 secondo seduto senza rilassarti.", dose: { sets: 4, reps: "8–10", rest: 90 } },
        { name: "Squat goblet libero", text: "Senza sedia, fino a cosce parallele o dove arrivi senza dolore.", dose: { sets: 4, reps: "6–10", rest: 120 }, phase: 3 }
      ],
      martial: "Alzarsi forte da piegati è la spinta della guardia bassa, del cambio di livello e del rialzarsi da terra."
    },
    {
      id: "muro", area: "legs", name: "Seduta al muro",
      goal: "Forza del quadricipite in tenuta, con l'angolo che scegli tu: utile quando piegarsi in movimento dà ancora fastidio.",
      how: "Schiena al muro, scivoli giù solo di poco e resti fermo. La tenuta fa lavorare il quadricipite con poco movimento dentro il ginocchio.",
      steps: [
        "Schiena appoggiata al muro, piedi a 40–50 cm dal muro, alla larghezza delle anche.",
        "Scivola giù fino all'angolo del livello (al primo appena un quarto di squat).",
        "Peso uguale sui due piedi, ginocchia sopra le caviglie e in linea con le punte.",
        "Tieni il tempo respirando, poi risali scivolando."
      ],
      cues: [
        "Le ginocchia non superano le punte: se succede, allontana i piedi dal muro.",
        "Spingi con i talloni.",
        "Il bruciore nella coscia va bene; il dolore dentro il ginocchio no."
      ],
      errors: [
        { e: "Scendere di più per fare più fatica", fix: "Resta all'angolo del livello: la fatica arriva con il tempo, non con la profondità." },
        { e: "Mani sulle cosce", fix: "Braccia incrociate al petto o lungo il muro." }
      ],
      dose: { sets: 4, work: 30, rest: 40 },
      safety: "Se a un angolo senti dolore davanti al ginocchio, risali di qualche centimetro: l'angolo giusto è quello senza dolore.",
      levels: [
        { name: "Quarto di squat, 20 s", text: "Appena piegato (circa 30°).", dose: { sets: 4, work: 20, rest: 40 } },
        { name: "Quarto di squat, 30 s", text: "Circa 30°, 30 secondi." },
        { name: "Mezzo squat, 30 s", text: "Circa 45–60°.", dose: { sets: 4, work: 30, rest: 45 } },
        { name: "Mezzo squat, 45 s", text: "Circa 60°, 45 secondi.", dose: { sets: 4, work: 45, rest: 60 } },
        { name: "Sbilanciato sull'operata", text: "Circa 60°, il piede sano più avanti e leggero: il peso va sull'operata.", dose: { sets: 4, work: 30, rest: 60 } }
      ],
      martial: "La guardia è una piccola seduta al muro che dura tutto il round: gambe che reggono stanche vogliono dire spostamenti puliti fino alla fine."
    },
    {
      id: "ponte", area: "legs", name: "Ponte per glutei",
      goal: "Glutei e flessori forti: proteggono il ginocchio quando atterri e quando giri.",
      how: "Sdraiato con i piedi a terra, sollevi il bacino stringendo i glutei. Più lontani i piedi, meno si piega il ginocchio.",
      steps: [
        "Sdraiato sulla schiena, piedi a terra alla larghezza delle anche; al primo livello i piedi sono lontani dal sedere.",
        "Stringi la pancia, spingi con i talloni e solleva il bacino fino alla linea spalle-anche-ginocchia.",
        "Tieni 2 secondi stringendo i glutei.",
        "Scendi in 2 secondi."
      ],
      cues: [
        "Spingi con i talloni, non con le punte.",
        "Costole giù: non inarcare la schiena per salire di più.",
        "Le ginocchia non si aprono e non si chiudono."
      ],
      errors: [
        { e: "Crampo dietro la coscia", fix: "Avvicina un po' i piedi al sedere e spingi di più con i glutei." },
        { e: "Schiena inarcata in alto", fix: "Sali solo fino alla linea dritta, con la pancia contratta." }
      ],
      dose: { sets: 3, reps: 12, rest: 60 },
      levels: [
        { name: "Piedi lontani", text: "Ginocchia piegate poco." },
        { name: "Ponte classico", text: "Piedi a circa 30 cm dal sedere." },
        { name: "Su una gamba", text: "Una gamba sola, l'altra tesa in alto: prima l'operata.", dose: { sets: 3, reps: "8–12", rest: 60, perSide: true } },
        { name: "Una gamba con manubrio", text: "Manubrio appoggiato sul bacino e tenuto con le mani.", dose: { sets: 3, reps: "8–12", rest: 75, perSide: true } }
      ],
      martial: "I glutei sono il motore di ginocchiate, cambi di livello e della spinta del bacino quando esci da sotto a terra."
    },
    {
      id: "polpacci", area: "legs", name: "Polpacci in piedi",
      goal: "Polpacci forti per camminare, correre e saltare: assorbono gli atterraggi prima del ginocchio.",
      how: "In piedi sali sulle punte e scendi lento. Il ginocchio resta dritto: va bene anche quando piegarti dà fastidio.",
      steps: [
        "In piedi vicino al muro, una mano appoggiata solo per l'equilibrio.",
        "Sali sulle punte più in alto che puoi in 1 secondo.",
        "Tieni 1 secondo in cima.",
        "Scendi in 3 secondi fino al tallone a terra."
      ],
      cues: [
        "Peso sull'alluce e sul secondo dito, non sul bordo esterno del piede.",
        "Ginocchio dritto ma non bloccato di colpo.",
        "Su una gamba comincia sempre dall'operata."
      ],
      errors: [
        { e: "Rimbalzo veloce", fix: "Discesa in 3 secondi." },
        { e: "Mezza altezza", fix: "Sali fino in cima: l'ultima parte è quella che conta." }
      ],
      dose: { sets: 3, reps: 15, rest: 45 },
      levels: [
        { name: "Due gambe", text: "Due piedi, mano al muro." },
        { name: "Una gamba", text: "Un piede alla volta, mano al muro.", dose: { sets: 3, reps: "10–15", rest: 45, perSide: true } },
        { name: "Una gamba con manubrio", text: "Manubrio nella mano dalla parte della gamba che lavora.", dose: { sets: 3, reps: "10–15", rest: 60, perSide: true } },
        { name: "Dal gradino", text: "Avampiede sul bordo di un gradino, il tallone scende sotto il gradino. Con manubrio.", dose: { sets: 4, reps: "8–12", rest: 60, perSide: true } }
      ],
      martial: "Si combatte sugli avampiedi: polpacci resistenti tengono il ritmo delle gambe per tutti i round."
    },
    {
      id: "abduzione", area: "legs", name: "Abduzione d'anca su un fianco",
      goal: "Medio gluteo forte: tiene il ginocchio in linea e il bacino dritto quando stai su una gamba.",
      how: "Sdraiato su un fianco, gamba di sopra dritta: la sollevi leggermente indietro con la punta del piede in avanti.",
      steps: [
        "Sdraiato sul fianco, gamba di sotto piegata per stabilità, gamba di sopra dritta e un po' indietro rispetto al busto.",
        "Punta del piede in avanti o appena verso il basso, mai verso il soffitto.",
        "Solleva la gamba di 30–40 cm in 2 secondi e tieni 2 secondi.",
        "Scendi lento. Poi girati e fai l'altro lato."
      ],
      cues: [
        "Senti il lavoro sul lato del sedere, non davanti all'anca.",
        "Bacino fermo: non rotolare indietro.",
        "Meglio poca altezza fatta bene."
      ],
      errors: [
        { e: "Punta verso il soffitto", fix: "Così lavora il flessore dell'anca: ruota la punta in avanti." },
        { e: "Gamba portata in avanti", fix: "Tienila un po' indietro, in linea con il busto." }
      ],
      dose: { sets: 3, reps: 12, rest: 45, perSide: true },
      levels: [
        { name: "Senza peso", text: "Solo la gamba." },
        { name: "Tenuta in alto", text: "5 secondi fermo in alto.", dose: { sets: 3, reps: 8, rest: 45, perSide: true } },
        { name: "Con manubrio", text: "Manubrio leggero appoggiato sulla coscia, tenuto con la mano." },
        { name: "In piedi sull'operata", text: "In piedi sull'operata con una mano al muro: sollevi la gamba sana di lato tenendo il bacino dritto. Lavora l'anca della gamba d'appoggio." }
      ],
      martial: "È il muscolo che tiene dritta la gamba d'appoggio quando calci: senza, il ginocchio cade verso l'interno."
    },
    {
      id: "equilibrio", area: "legs", name: "Equilibrio su una gamba",
      goal: "Riallenare l'equilibrio: dopo l'intervento il ginocchio «sente» peggio la sua posizione e va riprogrammato.",
      how: "In piedi su una gamba, ginocchio appena sbloccato, per il tempo indicato. Ai livelli alti aggiungi occhi chiusi, un cuscino o i pugni.",
      steps: [
        "In piedi vicino a un muro o a una sedia, per sicurezza.",
        "Solleva la gamba sana: stai sull'operata con il ginocchio morbido, non bloccato.",
        "Bacino dritto, sguardo avanti, piede «a tripode»: tallone, base dell'alluce e base del mignolo.",
        "Tieni il tempo, poi cambia gamba."
      ],
      cues: [
        "Le piccole correzioni della caviglia sono il lavoro: non irrigidirti.",
        "Il ginocchio resta sopra il piede, non scivola verso l'interno.",
        "Confronta i lati: l'operata deve arrivare come la sana."
      ],
      errors: [
        { e: "Ginocchio bloccato all'indietro", fix: "Sbloccalo di pochi gradi: così lavorano i muscoli e non i legamenti." },
        { e: "Anca che sale dalla parte della gamba sollevata", fix: "Bacino orizzontale, come se avessi un bicchiere sulle anche." }
      ],
      dose: { sets: 3, work: 30, rest: 15, perSide: true },
      levels: [
        { name: "Occhi aperti", text: "30 secondi per lato, mano vicina al muro." },
        { name: "Occhi chiusi", text: "Occhi chiusi, vicino al muro." },
        { name: "Su un cuscino", text: "In piedi su un cuscino piegato, occhi aperti." },
        { name: "Con i pugni", text: "Sull'operata, in guardia: jab e diretti lenti per 30 secondi senza perdere l'equilibrio." },
        { name: "Cuscino e pugni", text: "Sul cuscino, in guardia: combinazioni jab, diretto, gancio lente." }
      ],
      martial: "Ogni calcio è equilibrio su una gamba e ogni spinta subita lo mette alla prova: questo esercizio è già tecnica."
    },
    {
      id: "step-up", area: "legs", name: "Salita sul gradino",
      goal: "Forza in salita per la gamba operata: insegna al quadricipite a spingere da piegato.",
      how: "Appoggi il piede dell'operata sul gradino e sali spingendo con quella gamba, senza aiutarti con il piede rimasto a terra.",
      steps: [
        "Davanti a un gradino stabile, una mano al corrimano o al muro se serve.",
        "Piede dell'operata tutto sul gradino.",
        "Porta il peso in avanti sopra il piede e sali stendendo del tutto il ginocchio; l'altro piede arriva sul gradino senza spingere.",
        "Scendi lento con la gamba sana, controllando con l'operata."
      ],
      cues: [
        "Il piede a terra non spinge: alza le dita di quel piede per non barare.",
        "Ginocchio in linea con il secondo dito.",
        "In cima stendi tutto: anca e ginocchio."
      ],
      errors: [
        { e: "Spinta con il piede a terra", fix: "Alza le dita del piede a terra: fa solo da appoggio." },
        { e: "Ginocchio che cade verso l'interno", fix: "Gradino più basso finché resta in linea." }
      ],
      dose: { sets: 3, reps: 10, rest: 60, perSide: true },
      levels: [
        { name: "Gradino 10–15 cm", text: "Un gradino normale di casa." },
        { name: "Gradino 20 cm", text: "Un gradino alto, o un gradino con due libri spessi sopra." },
        { name: "Con manubri", text: "Gradino da 20 cm, un manubrio per mano.", dose: { sets: 3, reps: "8–12", rest: 75, perSide: true } },
        { name: "Gradino 30 cm con manubri", text: "Uno sgabello stabile o due gradini.", dose: { sets: 4, reps: "8–10", rest: 90, perSide: true } }
      ],
      martial: "Salire forte su una gamba è la spinta che lancia il ginocchio in avanti nella ginocchiata e che ti rialza da una caduta."
    },
    {
      id: "split-squat", area: "legs", name: "Affondo statico",
      goal: "Forza di ogni gamba separata, con la profondità che controlli tu.",
      how: "Un piede avanti e uno indietro, fermi a terra: scendi in verticale piegando le due ginocchia e risali. All'inizio scendi poco.",
      steps: [
        "Passo lungo: piede dell'operata avanti, l'altro indietro sull'avampiede. Una mano su una sedia per l'equilibrio.",
        "Busto dritto, scendi in verticale: il ginocchio dietro va verso il pavimento.",
        "Scendi solo fino alla profondità del livello, senza dolore.",
        "Risali spingendo con il tallone del piede davanti."
      ],
      cues: [
        "Ginocchio davanti sopra il piede, in linea con il secondo dito.",
        "Il peso è soprattutto sul piede davanti.",
        "Prima tutte le ripetizioni con l'operata davanti, poi l'altra."
      ],
      errors: [
        { e: "Passo troppo corto", fix: "Il ginocchio davanti scappa oltre le punte: allunga il passo." },
        { e: "Ginocchio dietro che sbatte a terra", fix: "Fermati a un palmo dal pavimento; se in ginocchio fa male, metti un cuscino sotto." }
      ],
      dose: { sets: 3, reps: 10, rest: 75, perSide: true },
      levels: [
        { name: "Discesa breve", text: "Scendi di 10–15 cm." },
        { name: "Discesa a metà", text: "Il ginocchio dietro a metà strada dal pavimento." },
        { name: "Discesa completa", text: "Il ginocchio dietro a un palmo da terra." },
        { name: "Con manubri", text: "Discesa completa con un manubrio per mano.", dose: { sets: 3, reps: "8–12", rest: 90, perSide: true } },
        { name: "Piede dietro sulla sedia", text: "Affondo bulgaro: piede dietro su una sedia, discesa fin dove controlli.", dose: { sets: 3, reps: "6–10", rest: 90, perSide: true }, phase: 3 }
      ],
      martial: "La guardia è un affondo corto: forza e controllo qui vogliono dire spostamenti esplosivi senza perdere la posizione."
    },
    {
      id: "stacco-rumeno", area: "legs", name: "Stacco rumeno con manubri",
      goal: "Flessori e glutei forti con il ginocchio quasi dritto: catena posteriore senza piegarsi sulle ginocchia.",
      how: "In piedi con i manubri e le ginocchia appena sbloccate: porti il bacino indietro e scendi con la schiena dritta finché senti tirare dietro le cosce, poi risali stringendo i glutei.",
      steps: [
        "In piedi, piedi alla larghezza delle anche, un manubrio per mano davanti alle cosce.",
        "Ginocchia sbloccate di pochi gradi e ferme così per tutto l'esercizio.",
        "Spingi il sedere indietro come per chiudere una porta: il busto si inclina, i manubri scivolano lungo le cosce.",
        "Scendi fino a metà tibia, o finché la schiena resta dritta, poi risali spingendo il bacino in avanti."
      ],
      cues: [
        "Schiena dritta e petto aperto, sguardo un paio di metri avanti.",
        "Il movimento è dell'anca, non del ginocchio.",
        "I manubri restano vicini alle gambe."
      ],
      errors: [
        { e: "Schiena tonda", fix: "Scendi meno: ti fermi dove la schiena resta dritta." },
        { e: "Ginocchia che si piegano tanto", fix: "Così diventa uno squat: ginocchia quasi ferme, sedere indietro." }
      ],
      dose: { sets: 3, reps: 10, rest: 75 },
      safety: "Se il legamento è stato fatto con il tendine dei flessori, questi muscoli recuperano più lentamente: sali di peso con calma e fermati se senti tirare dove è stato preso il tendine.",
      levels: [
        { name: "Manubri leggeri", text: "Per imparare il movimento." },
        { name: "Manubri pesanti", text: "Il peso più alto con cui la schiena resta dritta.", dose: { sets: 4, reps: "8–12", rest: 90 } },
        { name: "Una gamba con appoggio", text: "Su una gamba (prima l'operata), mano libera su una sedia, manubrio nell'altra.", dose: { sets: 3, reps: "8–10", rest: 75, perSide: true } },
        { name: "Una gamba libero", text: "Senza appoggio, manubrio nella mano opposta alla gamba d'appoggio.", dose: { sets: 3, reps: "8–10", rest: 75, perSide: true } }
      ],
      martial: "Una catena posteriore forte dà potenza a ginocchiate, calci e prese, e protegge il ginocchio: i flessori lavorano insieme al legamento."
    },
    {
      id: "estensione-seduto", area: "legs", name: "Estensione della gamba da seduto",
      goal: "Il rinforzo più diretto del quadricipite: dopo il crociato è il muscolo che resta più debole, e la sua forza decide il ritorno a combattere.",
      how: "Seduto su una sedia o sul bordo del letto con un peso alla caviglia (uno zaino appeso), stendi la gamba fino a dritta, tieni e scendi lento.",
      steps: [
        "Seduto in fondo alla sedia, schiena dritta, mani ai lati della seduta.",
        "Zaino appeso alla caviglia dell'operata (o una scarpa, ai primi livelli).",
        "Stendi il ginocchio fino a dritto in 2 secondi e tieni 2 secondi contraendo forte la coscia.",
        "Scendi in 3 secondi fino a circa 90°."
      ],
      cues: [
        "Arriva dritto del tutto: gli ultimi gradi sono quelli che mancano.",
        "Si muove solo il ginocchio: la coscia resta appoggiata.",
        "Prima l'operata, poi la sana; all'operata puoi aggiungere una serie."
      ],
      errors: [
        { e: "Slancio", fix: "Conta: 2 su, 2 fermo, 3 giù." },
        { e: "Sedere che si alza dalla sedia", fix: "Troppo peso: togli qualcosa dallo zaino." }
      ],
      dose: { sets: 3, reps: 12, rest: 60, perSide: true },
      safety: "Le linee guida MOON fanno partire questo esercizio dalla 6ª settimana con arco limitato e lo aprono a tutto l'arco più avanti; una revisione degli studi (Perriman 2018) non ha trovato più lassità del legamento con la catena aperta che con la catena chiusa. Dolore davanti alla rotula: riduci il peso e per qualche sessione muoviti tra 90° e 45°.",
      levels: [
        { name: "Senza peso", text: "Solo la gamba." },
        { name: "Scarpa o 1 kg", text: "Una scarpa o 1 kg alla caviglia." },
        { name: "Zaino 2–3 kg", text: "Zaino con bottiglie appeso alla caviglia.", dose: { sets: 3, reps: "10–15", rest: 60, perSide: true } },
        { name: "Zaino 4–5 kg", text: "Zaino più pieno; una serie in più per l'operata.", dose: { sets: 4, reps: "8–12", rest: 75, perSide: true } },
        { name: "Zaino 6 kg e oltre", text: "Il peso più alto con cui arrivi dritto, discesa in 4 secondi.", dose: { sets: 4, reps: "8–10", rest: 90, perSide: true } }
      ],
      martial: "È il gesto del calcio frontale e della frustata del circolare: un quadricipite forte vuol dire un calcio veloce."
    },
    {
      id: "curl-scivolato", area: "legs", name: "Curl femorale scivolato",
      goal: "Flessori forti e resistenti: aiutano il legamento a frenare spinte e torsioni.",
      how: "Sdraiato con i talloni su un asciugamano su un pavimento liscio (o in calzini), sollevi il bacino e fai scivolare i talloni avanti e indietro.",
      steps: [
        "Sdraiato, talloni sull'asciugamano (o calzini su parquet o piastrelle), ginocchia piegate.",
        "Solleva il bacino come nel ponte.",
        "Fai scivolare i talloni in avanti in 3 secondi fino a gambe quasi dritte, con il bacino sempre su.",
        "Riportali indietro piegando le ginocchia, oppure (al primo livello) abbassa il bacino e ricomincia."
      ],
      cues: [
        "Bacino alto per tutta la ripetizione.",
        "Lento all'andata: è lì che lavori di più.",
        "Se crampa dietro la coscia, fermati, allunga e riprendi con meno ripetizioni."
      ],
      errors: [
        { e: "Bacino che cade", fix: "Scivola meno lontano." },
        { e: "Movimento veloce", fix: "3 secondi all'andata, sempre." }
      ],
      dose: { sets: 3, reps: 8, rest: 75 },
      safety: "Con l'innesto dai flessori sali di livello solo se non senti tirare dove è stato preso il tendine.",
      levels: [
        { name: "Solo andata", text: "Scivoli fuori lento, poi abbassi il bacino e riporti i talloni senza carico." },
        { name: "Andata e ritorno", text: "Andata e ritorno con il bacino sempre su." },
        { name: "Una gamba all'andata", text: "Andata su una gamba sola, ritorno con due.", dose: { sets: 3, reps: 6, rest: 90, perSide: true } },
        { name: "Una gamba completo", text: "Andata e ritorno su una gamba.", dose: { sets: 3, reps: "6–8", rest: 90, perSide: true } }
      ],
      martial: "I flessori chiudono le gambe nelle prese a terra (guardia, triangolo) e frenano la gamba dopo il calcio."
    },
    {
      id: "step-down", area: "legs", name: "Discesa dal gradino",
      goal: "Controllo in discesa: il ginocchio impara a piegarsi sotto carico restando in linea. È anche uno dei test.",
      how: "In piedi sul gradino con l'operata, abbassi lentamente l'altro piede finché il tallone sfiora il pavimento, poi risali.",
      steps: [
        "In piedi di lato sul bordo di un gradino, sull'operata. Una mano al muro se serve.",
        "L'altra gamba è sospesa nel vuoto, dritta.",
        "Piega l'operata in 3 secondi finché il tallone libero sfiora il pavimento.",
        "Risali stendendo del tutto il ginocchio."
      ],
      cues: [
        "Ginocchio sopra il secondo dito per tutta la discesa: filmati da davanti.",
        "Bacino orizzontale: l'anca della gamba libera non cade.",
        "Busto leggermente in avanti."
      ],
      errors: [
        { e: "Ginocchio che entra", fix: "Gradino più basso, discesa più lenta, ginocchio spinto verso il mignolo." },
        { e: "Tallone che si appoggia per riposare", fix: "Sfiora soltanto." }
      ],
      dose: { sets: 3, reps: 8, rest: 60, perSide: true },
      levels: [
        { name: "Gradino 10 cm, di lato", text: "Gradino basso, di lato." },
        { name: "Gradino 15–20 cm, di lato", text: "Gradino normale, di lato." },
        { name: "Gradino 20 cm, in avanti", text: "Ti abbassi in avanti: più difficile per il ginocchio.", dose: { sets: 3, reps: 8, rest: 75, perSide: true } },
        { name: "Con manubri", text: "In avanti, un manubrio per mano.", dose: { sets: 3, reps: 8, rest: 90, perSide: true } }
      ],
      martial: "Ogni atterraggio, cambio di livello e frenata è una discesa su una gamba: qui impari a farla con il ginocchio in linea."
    },
    {
      id: "stella", area: "legs", name: "Raggiungi la stella",
      goal: "Equilibrio dinamico: stai sull'operata e allunghi l'altra gamba in tre direzioni, come quando reagisci a una spinta.",
      how: "In equilibrio sull'operata, tocchi il pavimento con la punta dell'altro piede davanti, dietro a destra e dietro a sinistra, il più lontano possibile senza appoggiarti.",
      steps: [
        "In piedi sull'operata, mani sui fianchi.",
        "Piega il ginocchio d'appoggio e allunga l'altro piede davanti: tocco leggero e ritorno.",
        "Poi in diagonale dietro verso l'esterno, poi in diagonale dietro verso l'interno.",
        "Ogni giro delle tre direzioni è una ripetizione."
      ],
      cues: [
        "Tocco leggerissimo: il peso resta sulla gamba d'appoggio.",
        "Ginocchio d'appoggio sopra il piede.",
        "Segna le distanze con lo scotch e prova a superarle di settimana in settimana."
      ],
      errors: [
        { e: "Il piede libero si appoggia", fix: "Accorcia la distanza: deve essere un tocco, non un passo." },
        { e: "Tallone d'appoggio che si alza", fix: "Tutto il piede resta giù." }
      ],
      dose: { sets: 3, reps: 5, rest: 45, perSide: true },
      levels: [
        { name: "Vicino", text: "Distanze corte, vicino al muro." },
        { name: "Lontano", text: "Più lontano che puoi senza appoggiarti." },
        { name: "Lontano e lento", text: "3 secondi per andare e 3 per tornare." },
        { name: "Con un manubrio", text: "Manubrio leggero nella mano dalla parte della gamba libera." }
      ],
      martial: "Una spinta, un calcio parato, un passo sbagliato: il ginocchio deve tenere in tutte le direzioni."
    },
    {
      id: "pogo", area: "legs", name: "Saltelli a piedi uniti", impact: true,
      goal: "Riabituare il ginocchio all'impatto con salti piccoli e veloci, prima su due piedi.",
      how: "Saltelli bassi e rapidi sugli avampiedi, ginocchia quasi dritte: lavorano caviglie e polpacci, il ginocchio assorbe poco.",
      steps: [
        "In piedi, piedi alla larghezza delle anche, braccia rilassate.",
        "Saltelli di pochi centimetri restando sugli avampiedi.",
        "Contatto con il suolo breve e silenzioso.",
        "Fermati appena perdi ritmo o leggerezza."
      ],
      cues: [
        "Atterraggio silenzioso: il rumore è il segno che il ginocchio prende il colpo.",
        "Ginocchia in linea, mai verso l'interno.",
        "Stesso peso sui due piedi."
      ],
      errors: [
        { e: "Salti alti", fix: "Bassi e veloci: qui conta il ritmo, non l'altezza." },
        { e: "Atterraggio sui talloni", fix: "Resta sugli avampiedi." }
      ],
      dose: { sets: 4, work: 20, rest: 40 },
      safety: "Solo con estensione completa, niente gonfiore e i criteri della fase 3. Se il giorno dopo il ginocchio è più gonfio, torna alla fase precedente per una settimana.",
      levels: [
        { name: "Sul posto", text: "20 secondi sul posto." },
        { name: "Ritmo corda", text: "Come con la corda, 30 secondi.", dose: { sets: 4, work: 30, rest: 40 } },
        { name: "Avanti e indietro", text: "Piccoli salti avanti e indietro su una linea." },
        { name: "Di lato", text: "Piccoli salti a destra e a sinistra su una linea." }
      ],
      martial: "Il saltello della corda e del pugile: gambe elastiche per entrare e uscire dalla distanza."
    },
    {
      id: "atterraggio", area: "legs", name: "Atterraggio controllato", impact: true,
      goal: "Imparare ad atterrare con le ginocchia in linea: il crociato si rompe spesso atterrando con il ginocchio che cade verso l'interno.",
      how: "Piccolo salto, o discesa da un gradino, e atterraggio fermo e morbido su due piedi: tieni la posizione 2 secondi.",
      steps: [
        "In piedi su un gradino basso (o a terra, per il salto sul posto).",
        "Scendi o salta e atterra sugli avampiedi e poi sui talloni, piegando anche e ginocchia insieme.",
        "Ginocchia sopra le punte, larghe come le anche, petto in avanti.",
        "Resta fermo 2 secondi senza oscillare, poi risali."
      ],
      cues: [
        "Atterra in silenzio.",
        "Ginocchia mai verso l'interno: la prima volta filmati da davanti.",
        "Sedere indietro, non solo ginocchia avanti."
      ],
      errors: [
        { e: "Atterraggio a gambe dritte", fix: "Piega anche e ginocchia mentre tocchi: ammortizza." },
        { e: "Ginocchia che si avvicinano", fix: "Altezza più bassa e ginocchia spinte verso l'esterno." }
      ],
      dose: { sets: 3, reps: 6, rest: 60 },
      safety: "Solo dalla fase 3. Su una gamba solo quando i test di forza sono vicini al 90% dell'altra gamba.",
      levels: [
        { name: "Saltello sul posto", text: "Piccolo salto e atterraggio fermo." },
        { name: "Dal gradino", text: "Scendi da un gradino di 15 cm e atterri fermo." },
        { name: "Salto e fermo", text: "Salto in alto a metà forza e atterraggio fermo." },
        { name: "Su una gamba", text: "Saltello su una gamba e atterraggio fermo.", phase: 4 }
      ],
      martial: "Atterrare dopo un salto, una schivata o un calcio senza che il ginocchio crolli: è la protezione migliore del legamento nuovo."
    },
    {
      id: "corsa", area: "legs", name: "Corsa a intervalli", impact: true,
      goal: "Tornare a correre in linea retta, con progressione e senza gonfiore.",
      how: "Alterni corsa leggera e camminata su terreno piano. Sali di livello solo se il giorno dopo il ginocchio è come prima.",
      steps: [
        "5 minuti di camminata veloce per scaldarti.",
        "Corsa leggera (riesci a parlare) per il tempo del livello, poi camminata per il recupero.",
        "Passi corti e frequenti, piede che appoggia sotto il bacino e non davanti.",
        "Il giorno dopo controlla gonfiore ed estensione prima di salire di livello."
      ],
      cues: [
        "Terreno piano e regolare: niente discese ripide e niente cambi di direzione.",
        "Passo corto e frequente.",
        "Ritmo da conversazione."
      ],
      errors: [
        { e: "Correre zoppicando", fix: "Se il passo non è simmetrico, torna alla camminata e al livello prima." },
        { e: "Saltare i livelli", fix: "Un livello alla volta, con almeno un giorno di riposo tra due corse." }
      ],
      dose: { sets: 8, work: 60, rest: 60 },
      safety: "Le linee guida MOON fanno iniziare la corsa in linea retta quando cammini e saltelli senza dolore né gonfiore. Mai prima del terzo mese.",
      levels: [
        { name: "1 corsa, 1 cammino", text: "8 volte 1 minuto di corsa e 1 di camminata." },
        { name: "2 corsa, 1 cammino", text: "6 volte.", dose: { sets: 6, work: 120, rest: 60 } },
        { name: "4 corsa, 1 cammino", text: "4 volte.", dose: { sets: 4, work: 240, rest: 60 } },
        { name: "10 minuti continui", text: "2 volte 10 minuti con 2 minuti di camminata.", dose: { sets: 2, work: 600, rest: 120 } },
        { name: "20 minuti continui", text: "Un unico blocco.", dose: { sets: 1, work: 1200 } }
      ],
      martial: "Il fiato dei round si costruisce qui: chi corre 20 minuti tranquillo regge i round di allenamento."
    },
    {
      id: "agilita", area: "legs", name: "Cambi di direzione", impact: true,
      goal: "Rieducare frenate, cambi di direzione e pivot, dal lento al veloce.",
      how: "Percorsi a otto, passi laterali e cambi di direzione a velocità crescente: 50%, poi 75%, poi piena.",
      steps: [
        "Due oggetti a 5 metri: corsa a otto intorno a loro.",
        "Passi laterali scivolati per 5 metri e ritorno.",
        "Corsa avanti, frenata in due tempi, ritorno indietro.",
        "Velocità secondo il livello."
      ],
      cues: [
        "Frena abbassando il bacino, con il ginocchio sopra il piede.",
        "Nei cambi di direzione il piede gira insieme al corpo: non piantare il piede per girarci sopra.",
        "Velocità piena solo dopo settimane senza fastidi a velocità ridotta."
      ],
      errors: [
        { e: "Piede piantato e busto che gira", fix: "È il movimento tipico della rottura del crociato: gira sull'avampiede, a piccoli passi." },
        { e: "Ginocchio verso l'interno in frenata", fix: "Velocità più bassa, ginocchio sopra il piede." }
      ],
      dose: { sets: 6, work: 20, rest: 60 },
      safety: "Le linee guida MOON portano i cambi di direzione dal 50–75% alla velocità piena solo con i test su una gamba all'85% dell'altra; nello studio di Grindem (2016) tornare agli sport con pivot dopo il nono mese e con forza simmetrica voleva dire molte meno nuove lesioni.",
      levels: [
        { name: "50% della velocità", text: "Lento e preciso." },
        { name: "75% della velocità", text: "Più veloce, stesso controllo." },
        { name: "Piena velocità", text: "Solo con l'ok del chirurgo e i test simmetrici.", minMonths: 9 }
      ],
      martial: "Uscire di lato, girare intorno all'avversario, cambiare angolo: il gioco di gambe vero è fatto di cambi di direzione."
    },
    {
      id: "salto-una-gamba", area: "legs", name: "Saltelli su una gamba", impact: true,
      goal: "L'ultimo gradino prima del ritorno al combattimento: impatto e controllo su una gamba sola.",
      how: "Saltelli su una gamba sul posto, poi avanti e di lato, con atterraggio morbido.",
      steps: [
        "Sull'operata, mani ai fianchi.",
        "Saltello basso e atterraggio morbido sull'avampiede.",
        "Ginocchio sopra il piede a ogni atterraggio.",
        "Confronta con la gamba sana: stessa altezza, stesso controllo."
      ],
      cues: [
        "Silenzio all'atterraggio.",
        "Bacino dritto.",
        "Fermati quando l'atterraggio diventa rumoroso o storto."
      ],
      errors: [
        { e: "Ginocchio che entra all'atterraggio", fix: "Torna ai salti su due piedi per una settimana." },
        { e: "Atterraggio rigido", fix: "Ammortizza piegando caviglia, ginocchio e anca insieme." }
      ],
      dose: { sets: 3, reps: 10, rest: 60, perSide: true },
      safety: "Solo quando i test su una gamba sono almeno al 90% dell'altra gamba.",
      levels: [
        { name: "Sul posto", text: "10 saltelli bassi." },
        { name: "Avanti e indietro", text: "Su una linea." },
        { name: "Di lato", text: "A destra e a sinistra di una linea." },
        { name: "Tre salti e fermo", text: "Tre salti in avanti e atterraggio fermo per 2 secondi.", dose: { sets: 3, reps: 4, rest: 75, perSide: true } }
      ],
      martial: "Saltelli su una gamba vogliono dire calci in serie e spostamenti esplosivi senza paura."
    },

    /* ------------------------------------------------------------------ PARTE ALTA */
    {
      id: "floor-press", area: "upper", name: "Distensioni a terra con manubri",
      goal: "Petto, spalle e tricipiti con le gambe distese: mentre lavori la parte alta, il ginocchio sta dritto.",
      how: "Sdraiato a terra con un manubrio per mano, li spingi in alto e li riabbassi finché i gomiti sfiorano il pavimento.",
      steps: [
        "Sdraiato sulla schiena con le gambe distese (ottimo per il ginocchio), o piegate se la schiena lo chiede.",
        "Manubri sopra il petto, braccia tese, polsi dritti.",
        "Scendi in 2–3 secondi finché i gomiti sfiorano il pavimento, a 45° dal busto.",
        "Un attimo fermo e spingi in alto."
      ],
      cues: [
        "Gomiti a 45° dal corpo, non aperti a T.",
        "Scapole strette indietro e in basso.",
        "Porta ogni serie a 1–3 ripetizioni dal cedimento: con manubri leggeri è così che il muscolo cresce."
      ],
      errors: [
        { e: "Gomiti che rimbalzano a terra", fix: "Sfiorano e si fermano un attimo." },
        { e: "Polsi piegati", fix: "Nocche verso il soffitto, polso dritto sopra il gomito." }
      ],
      dose: { sets: 3, reps: "10–15", rest: 90 },
      levels: [
        { name: "Manubri leggeri", text: "Per imparare il movimento." },
        { name: "Manubri più pesanti", text: "Il peso con cui arrivi a 10–15 ripetizioni vicino al cedimento.", dose: { sets: 4, reps: "10–15", rest: 90 } },
        { name: "Discesa lenta e pausa", text: "Discesa in 4 secondi e 2 secondi fermo con i gomiti a terra.", dose: { sets: 4, reps: "8–12", rest: 90 } },
        { name: "Un braccio alla volta", text: "Un manubrio solo, l'altro braccio a terra: lavora anche il tronco.", dose: { sets: 3, reps: "8–12", rest: 75, perSide: true } }
      ],
      martial: "Forza di spinta per il diretto, per allontanare un avversario e per uscire da sotto a terra."
    },
    {
      id: "piegamenti", area: "upper", name: "Piegamenti",
      goal: "La spinta classica del combattente, a corpo libero.",
      how: "Mani a terra (o su un rialzo) e corpo dritto come una tavola: scendi con il petto e risali.",
      steps: [
        "Mani poco più larghe delle spalle, sul tavolo, sul divano o a terra secondo il livello.",
        "Corpo dritto dalla testa ai talloni, pancia e glutei contratti, gambe tese.",
        "Scendi in 2 secondi fino a sfiorare il bordo (o il pavimento) con il petto, gomiti a 45°.",
        "Spingi via il pavimento e risali."
      ],
      cues: [
        "Gambe tese: niente piegamenti in ginocchio se appoggiare il ginocchio dà fastidio, usa un rialzo.",
        "Il bacino non cade e non sale.",
        "Ogni serie vicino al cedimento, con la forma pulita."
      ],
      errors: [
        { e: "Bacino che cade", fix: "Contrai glutei e pancia, o usa un rialzo più alto." },
        { e: "Mezzo movimento", fix: "Petto fino al bordo o a terra: meglio un rialzo più alto con il movimento completo." }
      ],
      dose: { sets: 3, reps: "8–15", rest: 90 },
      levels: [
        { name: "Mani sul tavolo", text: "Corpo molto inclinato, facile." },
        { name: "Mani su una sedia", text: "Più in basso." },
        { name: "A terra", text: "Piegamenti classici." },
        { name: "A terra con pausa", text: "Un secondo fermo a un centimetro da terra.", dose: { sets: 4, reps: "8–12", rest: 90 } },
        { name: "Piedi rialzati", text: "Piedi sul divano: più carico su spalle e petto alto.", dose: { sets: 4, reps: "8–12", rest: 90 } }
      ],
      martial: "Spinta, spalle che reggono la guardia e tronco rigido: i piegamenti sono l'esercizio base di ogni palestra di combattimento."
    },
    {
      id: "rematore", area: "upper", name: "Rematore con manubrio",
      goal: "Dorsali e parte alta della schiena: bilanciano la spinta dei pugni e tengono le spalle sane.",
      how: "Una mano su un tavolo, busto inclinato: tiri il manubrio verso il fianco.",
      steps: [
        "Mano libera su un tavolo, busto inclinato in avanti, piedi sfalsati e ginocchia appena sbloccate (niente ginocchio sulla panca).",
        "Manubrio appeso sotto la spalla, schiena dritta.",
        "Tira il gomito verso il fianco, portando il manubrio all'altezza della tasca.",
        "Un attimo fermo, poi scendi in 2 secondi allungando la spalla."
      ],
      cues: [
        "Tira con il gomito, non con la mano.",
        "Il busto non ruota per aiutarti.",
        "Vicino al cedimento a ogni serie."
      ],
      errors: [
        { e: "Busto che gira", fix: "Peso più leggero, busto fermo." },
        { e: "Spalla che sale verso l'orecchio", fix: "Spalla lontana dall'orecchio: la scapola scivola verso la tasca dei pantaloni." }
      ],
      dose: { sets: 3, reps: "10–15", rest: 75, perSide: true },
      levels: [
        { name: "Manubrio leggero", text: "Per imparare il movimento." },
        { name: "Manubrio pesante", text: "Il più pesante che hai, con la forma pulita.", dose: { sets: 4, reps: "10–15", rest: 75, perSide: true } },
        { name: "Pausa in alto", text: "2 secondi fermo con il manubrio al fianco.", dose: { sets: 4, reps: "8–12", rest: 75, perSide: true } },
        { name: "Discesa lenta", text: "Discesa in 4 secondi e pausa in alto: per quando il manubrio è diventato leggero.", dose: { sets: 4, reps: "10–12", rest: 75, perSide: true } }
      ],
      martial: "La schiena riporta il pugno in guardia e regge le prese nel corpo a corpo."
    },
    {
      id: "rematore-tavolo", area: "upper", name: "Rematore sotto il tavolo",
      goal: "Trazioni orizzontali a corpo libero: schiena e bicipiti con il peso del corpo.",
      how: "Sdraiato sotto un tavolo robusto, ti afferri al bordo e tiri il petto verso il tavolo.",
      steps: [
        "Controlla che il tavolo sia pesante e non si ribalti: provalo prima tirando forte da seduto. Mai tavoli leggeri o di plastica.",
        "Sdraiato sotto, mani al bordo alla larghezza delle spalle.",
        "Corpo dritto (ginocchia piegate al primo livello): tira finché il petto arriva vicino al bordo.",
        "Scendi in 2 secondi a braccia tese."
      ],
      cues: [
        "Corpo rigido come nel plank.",
        "Scapole indietro prima di piegare le braccia.",
        "Se non hai un tavolo adatto, fai il rematore con manubrio."
      ],
      errors: [
        { e: "Bacino che cade", fix: "Contrai glutei e pancia, o piega le ginocchia." },
        { e: "Mento proteso verso il tavolo", fix: "Tira il petto, non il mento." }
      ],
      dose: { sets: 3, reps: "6–12", rest: 90 },
      safety: "Il tavolo deve essere stabile. Se dondola anche poco, lascia perdere questo esercizio.",
      levels: [
        { name: "Ginocchia piegate", text: "Piedi a terra vicini, ginocchia piegate: più facile." },
        { name: "Gambe tese", text: "Talloni a terra, corpo dritto." },
        { name: "Pausa in alto", text: "2 secondi con il petto vicino al tavolo." },
        { name: "Piedi rialzati", text: "Talloni su una sedia.", dose: { sets: 4, reps: "6–10", rest: 90 } }
      ],
      martial: "Tirare il proprio peso è la base delle prese, del clinch e della lotta."
    },
    {
      id: "lento", area: "upper", name: "Lento avanti da seduto",
      goal: "Spalle forti e resistenti: tenere la guardia alta per tre minuti è lavoro delle spalle.",
      how: "Seduto su una sedia con lo schienale, spingi i manubri sopra la testa e li riabbassi alle spalle.",
      steps: [
        "Seduto con la schiena contro lo schienale, piedi a terra.",
        "Manubri all'altezza delle spalle, palmi in avanti o uno verso l'altro.",
        "Spingi in alto fino a braccia quasi tese, senza inarcare la schiena.",
        "Scendi in 2–3 secondi fino all'altezza del mento."
      ],
      cues: [
        "Pancia contratta, costole giù.",
        "I manubri salgono in linea con le orecchie.",
        "Vicino al cedimento a ogni serie."
      ],
      errors: [
        { e: "Schiena inarcata", fix: "Peso più leggero, glutei contro lo schienale." },
        { e: "Mezzo movimento", fix: "Scendi fino al mento." }
      ],
      dose: { sets: 3, reps: "8–12", rest: 90 },
      levels: [
        { name: "Leggero", text: "Per imparare il movimento." },
        { name: "Pesante", text: "Il peso con cui fai 8–12 ripetizioni vicino al cedimento.", dose: { sets: 4, reps: "8–12", rest: 90 } },
        { name: "Un braccio alla volta", text: "Alternato, il tronco resta fermo.", dose: { sets: 3, reps: "8–12", rest: 75, perSide: true } },
        { name: "Discesa lenta", text: "Discesa in 4 secondi.", dose: { sets: 4, reps: "8–10", rest: 90 } }
      ],
      martial: "Guardia alta fino alla fine del round, ganci e montanti con spalle che non cedono."
    },
    {
      id: "alzate-laterali", area: "upper", name: "Alzate laterali",
      goal: "Il deltoide laterale: spalle più larghe e articolazione più protetta.",
      how: "Seduto o in piedi, sollevi i manubri di lato fino all'altezza delle spalle.",
      steps: [
        "Seduto, o in piedi con le ginocchia morbide, manubri leggeri lungo i fianchi.",
        "Gomiti appena piegati, solleva di lato fino all'altezza delle spalle.",
        "Il mignolo è alla stessa altezza del pollice, non più su.",
        "Scendi in 3 secondi."
      ],
      cues: [
        "Peso leggero e molte ripetizioni: qui funziona bene arrivare vicino al cedimento.",
        "Spalle lontane dalle orecchie.",
        "Niente slancio con il busto."
      ],
      errors: [
        { e: "Slancio", fix: "Seduto e più leggero." },
        { e: "Mani sopra le spalle", fix: "Ti fermi all'altezza delle spalle." }
      ],
      dose: { sets: 3, reps: "12–20", rest: 60 },
      levels: [
        { name: "Leggero", text: "Manubri leggeri." },
        { name: "Quattro serie", text: "4 serie vicino al cedimento.", dose: { sets: 4, reps: "12–20", rest: 60 } },
        { name: "Pausa in alto", text: "1 secondo fermo in alto.", dose: { sets: 4, reps: "10–15", rest: 60 } }
      ],
      martial: "Spalle protette per i ganci e per reggere la guardia."
    },
    {
      id: "curl", area: "upper", name: "Curl con manubri",
      goal: "Bicipiti e avambracci: braccia più forti per il clinch e per le prese.",
      how: "In piedi o seduto, pieghi i gomiti portando i manubri alle spalle.",
      steps: [
        "Manubri lungo i fianchi, gomiti vicini al corpo.",
        "Piega i gomiti fino a portare i manubri alle spalle, senza muovere i gomiti.",
        "Stringi un attimo in alto.",
        "Scendi in 3 secondi fino a braccia tese."
      ],
      cues: [
        "Gomiti fermi ai fianchi.",
        "Alterna la presa classica (palmi in alto) e quella a martello (palmi uno verso l'altro).",
        "Vicino al cedimento."
      ],
      errors: [
        { e: "Slancio con la schiena", fix: "Seduto contro lo schienale." },
        { e: "Discesa a peso morto", fix: "3 secondi in discesa." }
      ],
      dose: { sets: 3, reps: "10–15", rest: 60 },
      levels: [
        { name: "Classico", text: "Palmi in alto." },
        { name: "Classico e martello", text: "Una serie classica e una a martello, alternate.", dose: { sets: 4, reps: "10–15", rest: 60 } },
        { name: "Discesa lenta", text: "Discesa in 4 secondi.", dose: { sets: 4, reps: "8–12", rest: 60 } }
      ],
      martial: "Prese più solide nel clinch e nella lotta, gomiti protetti quando pari."
    },
    {
      id: "tricipiti", area: "upper", name: "Estensioni per i tricipiti",
      goal: "Tricipiti: la forza che stende il braccio nel pugno.",
      how: "Seduto, un manubrio tenuto con due mani dietro la testa: stendi le braccia verso l'alto.",
      steps: [
        "Seduto con la schiena appoggiata, un manubrio tenuto con due mani sopra la testa.",
        "Gomiti verso l'alto e vicini alla testa.",
        "Scendi dietro la testa in 3 secondi.",
        "Stendi le braccia senza muovere i gomiti."
      ],
      cues: [
        "Si muovono solo gli avambracci.",
        "Costole giù, niente schiena inarcata.",
        "Vicino al cedimento."
      ],
      errors: [
        { e: "Gomiti che si aprono", fix: "Peso più leggero, gomiti stretti." },
        { e: "Schiena inarcata", fix: "Pancia contratta e schiena contro lo schienale." }
      ],
      dose: { sets: 3, reps: "10–15", rest: 60 },
      levels: [
        { name: "Due mani", text: "Un manubrio tenuto con due mani." },
        { name: "Da sdraiato", text: "A terra, un manubrio per mano: li porti verso le orecchie e stendi le braccia." },
        { name: "Discesa lenta", text: "Discesa in 4 secondi.", dose: { sets: 4, reps: "8–12", rest: 60 } }
      ],
      martial: "Jab e diretto finiscono con il tricipite che stende il braccio: più forza qui vuol dire un pugno che arriva teso e veloce."
    },
    {
      id: "pullover", area: "upper", name: "Pullover a terra",
      goal: "Dorsali e gabbia toracica, con le gambe distese.",
      how: "Sdraiato a terra con un manubrio tenuto con due mani sopra il petto: lo porti dietro la testa a braccia quasi tese e torni su.",
      steps: [
        "Sdraiato con le gambe distese, manubrio tenuto con due mani sopra il petto, gomiti appena piegati.",
        "Porta il manubrio dietro la testa in 3 secondi, fin dove la schiena non si inarca.",
        "Senti allungare i dorsali sotto le ascelle.",
        "Riporta il manubrio sopra il petto tirando con i dorsali."
      ],
      cues: [
        "Costole giù, schiena appoggiata.",
        "I gomiti restano piegati sempre allo stesso modo.",
        "Lento e controllato."
      ],
      errors: [
        { e: "Schiena che si stacca", fix: "Fermati prima dietro la testa." },
        { e: "Gomiti che si piegano e si stendono", fix: "È un esercizio di spalla: angolo del gomito fisso." }
      ],
      dose: { sets: 3, reps: "10–15", rest: 60 },
      levels: [
        { name: "Leggero", text: "Per imparare il movimento." },
        { name: "Pesante", text: "Il manubrio più pesante che controlli.", dose: { sets: 4, reps: "10–15", rest: 60 } },
        { name: "Pausa dietro la testa", text: "1 secondo fermo in allungamento.", dose: { sets: 3, reps: "10–12", rest: 60 } }
      ],
      martial: "Dorsali che tirano giù i gomiti per coprire il corpo e che chiudono le prese."
    },
    {
      id: "ytw", area: "upper", name: "Y-T-W a pancia in giù",
      goal: "Trapezio basso e muscoli che stabilizzano la scapola: spalle sane per tirare migliaia di pugni.",
      how: "A pancia in giù sollevi le braccia formando una Y, poi una T, poi una W, con i pollici in alto.",
      steps: [
        "A pancia in giù a terra, fronte su un asciugamano, gambe distese.",
        "Y: braccia avanti a V, pollici in alto: solleva di pochi centimetri e tieni 2 secondi.",
        "T: braccia aperte di lato, stessa tenuta.",
        "W: gomiti piegati, stringi le scapole verso le tasche dei pantaloni."
      ],
      cues: [
        "Pochi centimetri bastano.",
        "Collo lungo, sguardo a terra.",
        "Senti il lavoro tra le scapole, non sul collo."
      ],
      errors: [
        { e: "Testa che si alza", fix: "Fronte sull'asciugamano." },
        { e: "Spalle verso le orecchie", fix: "Scapole giù prima di salire." }
      ],
      dose: { sets: 2, reps: "8 per lettera", rest: 45 },
      levels: [
        { name: "Senza peso", text: "Solo le braccia." },
        { name: "Con 0,5–1 kg", text: "Bottigliette o manubri leggerissimi." },
        { name: "Tenuta 5 secondi", text: "5 secondi per posizione.", dose: { sets: 3, reps: "6 per lettera", rest: 45 } }
      ],
      martial: "Spalle stabili per ganci e parate, e per non farti male tirando a vuoto nello shadow."
    },
    {
      id: "contadino", area: "upper", name: "Camminata del contadino",
      goal: "Presa forte e passo corretto: camminare con un carico ti obbliga a stendere bene il ginocchio a ogni passo.",
      how: "Un manubrio pesante per mano, cammini a passi normali con il busto alto e il ginocchio che si stende del tutto quando il tallone tocca terra.",
      steps: [
        "Un manubrio per mano, il più pesante che la presa regga per 30–40 secondi.",
        "Spalle basse e indietro, busto alto.",
        "Cammina a passi normali: tallone, pianta, punta. Il ginocchio dell'operata si stende quando il tallone tocca.",
        "Gira con piccoli passi, senza ruotare sul piede piantato."
      ],
      cues: [
        "Passi uguali per le due gambe: contali a voce.",
        "Stringi i manici come per strizzarli.",
        "Al livello «valigia» il manubrio è in una mano sola e il tronco non si piega di lato."
      ],
      errors: [
        { e: "Ginocchio sempre un po' piegato", fix: "Rallenta e pensa «tallone e ginocchio dritto» a ogni passo dell'operata." },
        { e: "Spalle in avanti", fix: "Petto aperto, scapole indietro." }
      ],
      dose: { sets: 3, work: 40, rest: 60 },
      levels: [
        { name: "Due manubri leggeri", text: "30 secondi di camminata lenta, attenzione al passo.", dose: { sets: 3, work: 30, rest: 60 } },
        { name: "Due manubri pesanti", text: "40 secondi." },
        { name: "Valigia", text: "Un manubrio solo, 30 secondi per lato: lavora anche il fianco.", dose: { sets: 3, work: 30, rest: 45, perSide: true } },
        { name: "Pesanti e lunghi", text: "60 secondi con i manubri più pesanti.", dose: { sets: 3, work: 60, rest: 75 } }
      ],
      martial: "Una presa che non molla nel clinch e un passo sicuro: due cose che servono a ogni combattente."
    },

    /* ------------------------------------------------------------------ TRONCO */
    {
      id: "dead-bug", area: "core", name: "Dead bug",
      goal: "Tronco stabile: braccia e gambe si muovono, la schiena resta ferma.",
      how: "Sdraiato con le braccia verso il soffitto e le gambe sollevate: allunghi braccio e gamba opposti senza staccare la schiena.",
      steps: [
        "Sdraiato, braccia verso il soffitto, anche e ginocchia piegate a 90° in aria.",
        "Schiena bassa schiacciata a terra, pancia contratta.",
        "Allunga lentamente un braccio dietro la testa e la gamba opposta in avanti.",
        "Torna al centro e cambia lato."
      ],
      cues: [
        "Espira mentre allunghi.",
        "Se la schiena si stacca, allunga meno.",
        "3 secondi per allungare, 1 per tornare."
      ],
      errors: [
        { e: "Schiena inarcata", fix: "Movimento più corto, o solo le braccia." },
        { e: "Fretta", fix: "3 secondi fuori, 1 dentro." }
      ],
      dose: { sets: 3, reps: "8 per lato", rest: 45 },
      safety: "Le ginocchia piegate in aria non caricano il ginocchio; se però danno fastidio, appoggia il tallone della gamba operata su una sedia.",
      levels: [
        { name: "Solo braccia", text: "Gambe ferme in aria, si muovono le braccia." },
        { name: "Braccio e gamba", text: "Braccio e gamba opposti." },
        { name: "Con manubrio", text: "Un manubrio leggero tenuto con due mani sopra il petto; si muovono le gambe, alternate." },
        { name: "Gamba tesa", text: "La gamba si allunga tesa fino a sfiorare il pavimento.", dose: { sets: 3, reps: "6 per lato", rest: 45 } }
      ],
      martial: "Un tronco che non si piega porta la forza delle gambe nei pugni e incassa meglio i colpi al corpo."
    },
    {
      id: "plank-laterale", area: "core", name: "Plank laterale",
      goal: "Fianchi e obliqui: stabilità laterale per le spinte e le rotazioni.",
      how: "Sul fianco, appoggiato sull'avambraccio, sollevi il bacino e tieni il corpo dritto.",
      steps: [
        "Sul fianco, gomito sotto la spalla.",
        "Primo livello: ginocchia piegate e appoggiate di lato; poi gambe tese con i piedi uno sull'altro.",
        "Solleva il bacino fino a una linea dritta.",
        "Tieni il tempo respirando, poi cambia lato."
      ],
      cues: [
        "Il bacino non cade e non va indietro.",
        "Spalla lontana dall'orecchio.",
        "Respira: non trattenere il fiato."
      ],
      errors: [
        { e: "Bacino che cade", fix: "Tempo più corto o ginocchia appoggiate." },
        { e: "Busto ruotato verso il pavimento", fix: "Petto aperto di lato, spalle una sopra l'altra." }
      ],
      dose: { sets: 3, work: 30, rest: 30, perSide: true },
      levels: [
        { name: "Sulle ginocchia", text: "Ginocchia piegate a terra di lato, senza peso sulla rotula.", dose: { sets: 3, work: 20, rest: 30, perSide: true } },
        { name: "Gambe tese", text: "30 secondi." },
        { name: "45 secondi", text: "Gambe tese.", dose: { sets: 3, work: 45, rest: 30, perSide: true } },
        { name: "Gamba sollevata", text: "Con la gamba di sopra sollevata." }
      ],
      martial: "Fianchi forti per il gancio al corpo e per resistere alle spinte laterali."
    },
    {
      id: "hollow", area: "core", name: "Barchetta",
      goal: "Addome in tenuta con le gambe distese: mentre lavora la pancia, il ginocchio sta dritto.",
      how: "Sdraiato, schiena bassa a terra: sollevi spalle e gambe distese di pochi centimetri e tieni.",
      steps: [
        "Sdraiato, braccia lungo i fianchi o in avanti.",
        "Schiaccia la schiena bassa a terra.",
        "Solleva spalle e gambe distese di pochi centimetri, ginocchia dritte.",
        "Tieni il tempo respirando corto."
      ],
      cues: [
        "La schiena bassa non si stacca mai.",
        "Gambe più in alto vuol dire più facile.",
        "Ginocchia dritte: è anche lavoro per l'estensione."
      ],
      errors: [
        { e: "Schiena che si stacca", fix: "Gambe più alte o leggermente piegate." },
        { e: "Collo teso", fix: "Mento leggermente verso il petto, sguardo alle ginocchia." }
      ],
      dose: { sets: 3, work: 20, rest: 40 },
      levels: [
        { name: "Gambe alte", text: "Gambe a 45°." },
        { name: "Gambe basse", text: "Gambe a 15–20 cm da terra." },
        { name: "Braccia avanti, 30 secondi", text: "Braccia sopra la testa.", dose: { sets: 3, work: 30, rest: 40 } }
      ],
      martial: "È la base dell'addome di ginnasti e lottatori: incassare e fare ponte partono da qui."
    },

    /* ------------------------------------------------------------------ TECNICA MARZIALE */
    {
      id: "shadow-seduto", area: "martial", name: "Shadow da seduto",
      goal: "Allenare mani, guardia e schivate di busto senza caricare il ginocchio: la tecnica non si ferma mentre la gamba recupera.",
      how: "Seduto su una sedia senza braccioli con i piedi a terra, fai shadow con i pugni: jab, diretto, ganci e montanti, con la rotazione del busto e il ritorno in guardia.",
      steps: [
        "Seduto sul bordo della sedia, piedi a terra, busto dritto, mani in guardia, mento basso.",
        "Tira i colpi ruotando busto e spalla: il pugno parte dalla guardia e torna alla guardia.",
        "Espira a ogni colpo.",
        "Segui il compito del round."
      ],
      cues: [
        "Il pugno torna in guardia più veloce di come parte.",
        "La mano che non colpisce resta a proteggere il viso.",
        "La rotazione viene dal busto: le gambe restano ferme."
      ],
      errors: [
        { e: "Mano che scende dopo il colpo", fix: "Pensa «colpisci e torna» ad alta voce." },
        { e: "Braccia rigide", fix: "Spalle sciolte, pugno stretto solo all'impatto." }
      ],
      dose: { sets: 3, work: 120, rest: 45, tasks: ["Solo jab e diretto: precisione e ritorno in guardia.", "Aggiungi ganci e montanti: 1-2-3 e 1-2-5-2.", "Dopo ogni combinazione una schivata di busto a destra o a sinistra."] },
      levels: [
        { name: "3 round da 2 minuti", text: "Ritmo tecnico." },
        { name: "3 round da 3 minuti", text: "La durata di un round vero.", dose: { sets: 3, work: 180, rest: 60, tasks: ["Jab e diretto con ritorno in guardia.", "Combinazioni con ganci e montanti.", "Combinazioni e schivate di busto."] } },
        { name: "Ritmo veloce", text: "Ogni 30 secondi, 10 secondi a tutta velocità.", dose: { sets: 4, work: 120, rest: 45, tasks: ["10 secondi veloci e 20 tecnici: colpi dritti.", "10 secondi veloci e 20 tecnici: ganci.", "10 secondi veloci e 20 tecnici: montanti.", "Libero, con le esplosioni di velocità."] } }
      ],
      martial: "Tutta la tecnica di mani e busto resta allenata: quando tornerai sulle gambe ritroverai i colpi al loro posto."
    },
    {
      id: "parate", area: "martial", name: "Parate e schivate a piedi fermi",
      goal: "La difesa delle braccia e del busto, in piedi, senza spostare i piedi.",
      how: "In guardia con i piedi fermi e le ginocchia morbide: pari, blocchi e schivi con il busto contro colpi immaginari, e dopo ogni difesa rispondi.",
      steps: [
        "In piedi, piedi larghi come le spalle, ginocchia appena morbide, peso uguale sui due piedi.",
        "Parata del jab con la mano dietro, blocco del gancio con il gomito alto, gomito giù per i colpi al corpo.",
        "Schivata: il busto si sposta di lato di 10–15 cm, i piedi restano fermi.",
        "Dopo ogni difesa rispondi con un colpo."
      ],
      cues: [
        "I piedi non girano: ruota solo il busto sopra le anche.",
        "Difese piccole: pochi centimetri bastano.",
        "Sguardo sempre avanti."
      ],
      errors: [
        { e: "Ginocchio dell'operata che gira", fix: "Piedi paralleli e busto che ruota sopra le anche." },
        { e: "Difese ampie", fix: "Le mani non si allontanano dal viso più di un palmo." }
      ],
      dose: { sets: 3, work: 90, rest: 45, tasks: ["Parate di jab e diretto, risposta 1-2.", "Blocchi dei ganci con il gomito alto, risposta con il gancio.", "Schivate di busto e risposta con il montante."] },
      levels: [
        { name: "Lento", text: "Ritmo tecnico." },
        { name: "Su segnale", text: "Fai partire il video di un incontro o chiedi a qualcuno di chiamare il colpo: tu reagisci." },
        { name: "Round da 2 minuti", text: "Ritmo più alto.", dose: { sets: 3, work: 120, rest: 45, tasks: ["Parate e risposte veloci.", "Blocchi e contro.", "Schivate e contro, ritmo alto."] } }
      ],
      martial: "La difesa è metà del combattimento e si allena benissimo senza muovere le gambe."
    },
    {
      id: "shadow-fermo", area: "martial", name: "Shadow a piedi fermi",
      goal: "Tornare a tirare in piedi con tutto il corpo, senza spostamenti né torsioni sul piede piantato.",
      how: "In guardia con i piedi al loro posto: tiri le combinazioni girando il bacino e lasciando ruotare il tallone dietro sull'avampiede.",
      steps: [
        "Guardia normale, ginocchia morbide. Se l'operata è la gamba dietro e il diretto ti dà fastidio, per ora mettila davanti.",
        "Nel diretto il tallone della gamba dietro si alza e gira insieme all'anca: il piede ruota sull'avampiede e il ginocchio lo segue.",
        "Dopo ogni combinazione torna in guardia.",
        "Niente passi: solo busto, anche e braccia."
      ],
      cues: [
        "Mai piede piantato con il ginocchio che gira sopra: il tallone si alza sempre.",
        "Espira sul colpo.",
        "Prima la precisione, poi la velocità."
      ],
      errors: [
        { e: "Tallone dietro incollato a terra nel diretto", fix: "Alzalo e giralo: così il ginocchio non si torce." },
        { e: "Peso tutto sulla gamba sana", fix: "Guardia con il peso uguale sui due piedi." }
      ],
      dose: { sets: 3, work: 120, rest: 60, tasks: ["Jab, diretto e 1-2 con ritorno in guardia.", "1-2-3 e 3-2: rotazione del bacino.", "Combinazioni libere con una difesa dopo ogni serie di colpi."] },
      levels: [
        { name: "2 minuti tecnici", text: "Ritmo lento." },
        { name: "3 minuti", text: "Come un round vero.", dose: { sets: 3, work: 180, rest: 60, tasks: ["Colpi dritti.", "Ganci e montanti.", "Libero con difese."] } },
        { name: "Ritmo alto", text: "4 round con esplosioni di velocità.", dose: { sets: 4, work: 120, rest: 45, tasks: ["Esplosioni di colpi dritti.", "Esplosioni di ganci.", "Esplosioni di montanti.", "Libero."] } }
      ],
      martial: "Il pugno parte dal piede: rimettere insieme gambe, bacino e braccia riporta alla tecnica completa."
    },
    {
      id: "colpi-equilibrio", area: "martial", name: "Colpi in equilibrio su una gamba",
      goal: "Equilibrio e tecnica insieme: stare sull'operata mentre le braccia lavorano.",
      how: "In piedi sulla gamba operata con l'altra sollevata, tiri jab e diretti senza perdere la posizione.",
      steps: [
        "Vicino al muro per sicurezza, in piedi sull'operata, ginocchio morbido.",
        "Guardia alta: tira colpi dritti lenti, poi più veloci.",
        "Il ginocchio d'appoggio resta sopra il piede.",
        "Cambia gamba a metà."
      ],
      cues: [
        "Bacino fermo e orizzontale.",
        "Colpi controllati, non lanciati.",
        "Se perdi l'equilibrio, appoggia e riparti."
      ],
      errors: [
        { e: "Ginocchio d'appoggio che oscilla verso l'interno", fix: "Colpi più lenti, sguardo fisso." },
        { e: "Busto che si piega per compensare", fix: "Colpi più corti, busto alto." }
      ],
      dose: { sets: 3, work: 30, rest: 20, perSide: true },
      levels: [
        { name: "Colpi dritti lenti", text: "Jab e diretto lenti." },
        { name: "Combinazioni", text: "1-2-3 lenti." },
        { name: "Su un cuscino", text: "In piedi su un cuscino piegato." },
        { name: "Ginocchiata", text: "Sull'operata, ginocchiata lenta con l'altra gamba e ritorno in guardia senza appoggiare." }
      ],
      martial: "Ogni volta che calci, o pari un calcio, stai su una gamba: questo esercizio prepara proprio quel momento."
    },
    {
      id: "passi-guardia", area: "martial", name: "Passi in guardia",
      goal: "Tornare a muoversi in guardia avanti e indietro, senza ancora girare o tagliare di lato.",
      how: "Passo-richiamo in linea retta: avanzando si muove prima il piede davanti, arretrando quello dietro.",
      steps: [
        "In guardia, peso uguale, ginocchia morbide, sugli avampiedi.",
        "Avanti: spingi con il piede dietro, il piede davanti fa un passo di 20–30 cm e quello dietro lo segue della stessa distanza.",
        "Indietro: il contrario, si muove prima il piede dietro.",
        "Quando il movimento è pulito, aggiungi un jab a ogni passo avanti."
      ],
      cues: [
        "I piedi non si incrociano e non si avvicinano.",
        "Passi piccoli e uguali.",
        "Testa sempre alla stessa altezza: niente saltelli."
      ],
      errors: [
        { e: "Piedi che si incrociano", fix: "Passi più corti e più lenti." },
        { e: "Saltellare", fix: "Striscia i piedi: l'impatto arriva in fase 3." }
      ],
      dose: { sets: 3, work: 90, rest: 45, tasks: ["Avanti e indietro su una linea.", "Jab a ogni passo avanti.", "1-2 entrando, uscita indietro con la guardia alta."] },
      levels: [
        { name: "Lento su una linea", text: "Passi lenti." },
        { name: "Con il jab", text: "Jab a ogni passo avanti." },
        { name: "Passi laterali", text: "Anche a destra e a sinistra, senza incrociare, quando avanti-indietro è pulito." },
        { name: "Cambi di ritmo", text: "Due passi lenti e uno veloce.", phase: 3 }
      ],
      martial: "La distanza si controlla con le gambe: chi si muove bene colpisce senza farsi colpire."
    },
    {
      id: "shadow-movimento", area: "martial", name: "Shadow in movimento",
      goal: "Shadow completo con spostamenti, angoli e pivot, a velocità controllata.",
      how: "Shadow libero muovendoti in tutte le direzioni, con il pivot sull'avampiede al 50–75% della velocità.",
      steps: [
        "Scaldati con 2 minuti di passi in guardia.",
        "Combina spostamenti avanti, indietro e laterali con le combinazioni.",
        "Pivot: ruoti sull'avampiede del piede davanti per cambiare angolo, a velocità media.",
        "Chiudi ogni round con 20 secondi di sole difese."
      ],
      cues: [
        "Il pivot è sull'avampiede, mai a piede piantato.",
        "Velocità al 50–75%: quella piena torna in fase 4.",
        "Ogni combinazione finisce fuori linea."
      ],
      errors: [
        { e: "Pivot sul tallone o a piede piantato", fix: "Alza il tallone e gira sulla parte davanti del piede." },
        { e: "Scatti improvvisi", fix: "Ritmo continuo: velocità costante e controllata." }
      ],
      dose: { sets: 3, work: 180, rest: 60, tasks: ["Avanti, indietro e combinazioni.", "Laterali e angoli.", "Un pivot dopo ogni combinazione."] },
      levels: [
        { name: "50%", text: "Tecnico." },
        { name: "75%", text: "Ritmo medio.", minMonths: 6 },
        { name: "Piena velocità", text: "Solo in fase 4.", phase: 4 }
      ],
      martial: "È lo shadow vero delle palestre: qui torni a combattere con il corpo intero."
    },
    {
      id: "corda", area: "martial", name: "Corda", impact: true,
      goal: "Ritmo, piedi leggeri e fiato: la corda è il riscaldamento di quasi tutte le palestre di combattimento.",
      how: "Saltelli bassi a piedi uniti con la corda (o senza, mimando il movimento), sugli avampiedi.",
      steps: [
        "Corda della lunghezza giusta: con un piede al centro, i manici arrivano alle ascelle.",
        "Saltelli bassi a piedi uniti, polsi che girano, gomiti vicini ai fianchi.",
        "Atterraggio sugli avampiedi, silenzioso.",
        "Quando è facile, passo del pugile alternando i piedi."
      ],
      cues: [
        "Bassi e leggeri.",
        "Girano i polsi, non le braccia.",
        "Fermati se l'atterraggio diventa pesante."
      ],
      errors: [
        { e: "Salti alti", fix: "Bastano 2–3 cm." },
        { e: "Braccia larghe", fix: "Gomiti ai fianchi, girano solo i polsi." }
      ],
      dose: { sets: 4, work: 60, rest: 45 },
      safety: "Solo dalla fase 3, quando i saltelli a piedi uniti non lasciano gonfiore il giorno dopo.",
      levels: [
        { name: "30 secondi a piedi uniti", text: "4 volte 30 secondi.", dose: { sets: 4, work: 30, rest: 45 } },
        { name: "1 minuto", text: "4 volte 1 minuto." },
        { name: "Passo del pugile", text: "Alternando i piedi, 3 volte 2 minuti.", dose: { sets: 3, work: 120, rest: 45 } },
        { name: "Round da 3 minuti", text: "3 volte 3 minuti con variazioni.", dose: { sets: 3, work: 180, rest: 60 } }
      ],
      martial: "Coordinazione, ritmo e polpacci per stare sugli avampiedi tutti i round."
    },
    {
      id: "calci-lenti", area: "martial", name: "Calci tecnici lenti",
      goal: "Ritrovare i calci poco a poco: prima lenti e bassi, con la gamba d'appoggio che gira bene.",
      how: "Calci lenti e controllati a bassa altezza: prima il frontale spinto, poi il circolare basso, ruotando sull'avampiede della gamba d'appoggio.",
      steps: [
        "Nelle prime sessioni stai vicino a un muro o a una sedia per l'equilibrio.",
        "Calcio frontale spinto (teep) all'altezza della coscia, lento: carica il ginocchio, spingi, ricarica, appoggia.",
        "Circolare basso lento: il piede d'appoggio ruota sull'avampiede finché il tallone punta verso il bersaglio.",
        "Prima calci con la gamba sana (l'operata fa da appoggio), poi con l'operata."
      ],
      cues: [
        "La gamba d'appoggio gira sempre sull'avampiede: piede piantato e corpo che gira è il movimento da evitare.",
        "Altezza bassa: la coscia o il ginocchio dell'avversario immaginario.",
        "Ricarica la gamba dopo ogni calcio prima di appoggiarla."
      ],
      errors: [
        { e: "Calcio che «schiocca» a ginocchio bloccato", fix: "Lento e controllato fino alla fine del gesto." },
        { e: "Appoggio piantato", fix: "Alza il tallone d'appoggio e ruota." }
      ],
      dose: { sets: 3, reps: "8 per lato", rest: 60 },
      safety: "Calci veloci e alti, girati e saltati tornano solo in fase 4, dopo il nono mese e con i test simmetrici.",
      levels: [
        { name: "Frontale lento basso", text: "Teep lento all'altezza della coscia." },
        { name: "Circolare basso lento", text: "Circolare alla coscia al 50%." },
        { name: "Calci al 75%", text: "Frontale e circolare medi, al 75%.", minMonths: 6 },
        { name: "Calci pieni", text: "Velocità e altezza piene.", phase: 4 }
      ],
      martial: "Calci ritrovati con un ginocchio che si fida di nuovo: è il ponte tra il recupero e gli stili che stai imparando."
    },
    {
      id: "sparring", area: "martial", name: "Ritorno al contatto",
      goal: "Tornare allo sparring e alla lotta per gradi, con l'ok del chirurgo.",
      how: "Si sale un gradino alla volta: sparring tecnico leggero, poi a tema, poi libero. La lotta con proiezioni torna per ultima.",
      steps: [
        "Chiedi l'ok per il contatto al chirurgo o al fisioterapista.",
        "Prime due settimane: sparring tecnico leggero con un partner di fiducia (prima solo braccia, poi anche calci bassi).",
        "Settimane 3 e 4: sparring a tema, un compito per round, intensità media.",
        "Poi sparring libero; lotta in piedi con proiezioni solo quando tutto il resto è facile."
      ],
      cues: [
        "Partner esperto e collaborativo nelle prime settimane.",
        "Una ginocchiera può dare sicurezza, ma non sostituisce la forza.",
        "Il giorno dopo controlla gonfiore ed estensione come sempre."
      ],
      errors: [
        { e: "Ripartire dallo sparring libero", fix: "Le prime settimane sono tecniche: la fiducia nel ginocchio si ricostruisce un gradino alla volta." },
        { e: "Smettere la forza", fix: "Due sessioni di gambe a settimana restano anche dopo il ritorno." }
      ],
      dose: { sets: 3, work: 120, rest: 60 },
      safety: "Nello studio di Grindem (2016) tornare agli sport con pivot e contatto prima del nono mese, o con il quadricipite sotto il 90% dell'altra gamba, voleva dire molte più nuove lesioni.",
      levels: [
        { name: "Tecnico leggero", text: "Solo braccia, 30–40% di forza." },
        { name: "A tema", text: "Un compito per round, 50–60%." },
        { name: "Libero", text: "Intensità di allenamento normale." }
      ],
      martial: "Il traguardo: tornare a combattere davvero, con un ginocchio forte."
    }
  ];

  // Le sessioni di ogni fase (id degli esercizi, in ordine).
  const SESSIONS = {
    ext: ["prono-appeso", "tallone-rialzo", "arco-corto"],
    legs: {
      1: ["slr", "sedia", "muro", "ponte", "polpacci", "abduzione", "equilibrio"],
      2: ["sedia", "estensione-seduto", "step-up", "split-squat", "stacco-rumeno", "curl-scivolato", "step-down", "polpacci", "stella"],
      3: ["pogo", "atterraggio", "sedia", "split-squat", "estensione-seduto", "stacco-rumeno", "step-down", "corsa"],
      4: ["agilita", "salto-una-gamba", "sedia", "split-squat", "stacco-rumeno", "estensione-seduto", "curl-scivolato", "corsa"]
    },
    upperA: ["floor-press", "rematore", "lento", "curl", "tricipiti", "contadino", "dead-bug"],
    upperB: ["piegamenti", "rematore-tavolo", "pullover", "alzate-laterali", "ytw", "plank-laterale", "hollow"],
    martial: {
      1: ["shadow-seduto", "parate"],
      2: ["shadow-fermo", "colpi-equilibrio", "passi-guardia"],
      3: ["shadow-movimento", "corda", "calci-lenti"],
      4: ["shadow-movimento", "calci-lenti", "sparring"]
    }
  };

  const SESSION_INFO = {
    ext: { label: "Routine di estensione", short: "Estensione", minutes: 12 },
    legs: { label: "Gambe e tecnica", short: "Gambe", minutes: 45 },
    upperA: { label: "Parte alta A e tecnica", short: "Parte alta A", minutes: 40 },
    upperB: { label: "Parte alta B e tecnica", short: "Parte alta B", minutes: 40 },
    martial: { label: "Solo tecnica marziale", short: "Tecnica", minutes: 12 }
  };

  /*
   * Test della settimana. perLeg: due numeri (operata, sana) e simmetria in percentuale.
   * from: fase da cui il test ha senso.
   */
  const TESTS = [
    {
      id: "heel", name: "Differenza dei talloni a pancia in giù", unit: "cm", step: 0.5, min: 0, max: 15, from: 1,
      how: "Sdraiato a pancia in giù sul letto con le ginocchia appena fuori dal bordo, come nel prono appeso, rilassato per un minuto. Qualcuno misura con un righello quanti centimetri il tallone operato resta più in alto dell'altro (oppure fotografa di lato e confronta). 0 vuol dire talloni alla stessa altezza: estensione uguale.",
      better: "low"
    },
    {
      id: "slr", name: "Sollevamenti a gamba tesa senza ritardo", unit: "rip.", step: 1, min: 0, max: 30, from: 1,
      how: "Quanti sollevamenti a gamba tesa riesci a fare di fila con il ginocchio che resta dritto del tutto mentre la gamba sale. Ti fermi alla prima ripetizione in cui il ginocchio si piega. Le linee guida MOON chiedono di arrivare a 20.",
      better: "high"
    },
    {
      id: "sit", name: "Seduto-in piedi su una gamba", unit: "rip.", step: 1, min: 0, max: 50, perLeg: true, from: 1,
      how: "Sempre dalla stessa seduta (una sedia normale, o una con un cuscino se oggi è troppo bassa: annota quale). Braccia incrociate, ti alzi e ti risiedi su una gamba sola, piano, finché la forma resta pulita (ginocchio in linea, niente spinta dell'altro piede). Prima la sana, poi l'operata. Se oggi non riesci, lascia vuoto: lo rifarai più avanti.",
      better: "high"
    },
    {
      id: "calf", name: "Polpacci su una gamba", unit: "rip.", step: 1, min: 0, max: 60, perLeg: true, from: 1,
      how: "Su una gamba, una mano al muro solo per l'equilibrio, ginocchio dritto: sali in punta fino in cima e scendi, al ritmo di una ripetizione ogni 2 secondi, finché arrivi in cima del tutto.",
      better: "high"
    },
    {
      id: "bridge", name: "Ponte su una gamba", unit: "rip.", step: 1, min: 0, max: 60, perLeg: true, from: 1,
      how: "Sdraiato, un piede a terra a circa 30 cm dal sedere e l'altra gamba tesa in alto: sali fino alla linea spalle-anche-ginocchio e scendi, al ritmo di una ripetizione ogni 2 secondi, finché il bacino arriva in alto dritto.",
      better: "high"
    },
    {
      id: "balance", name: "Equilibrio a occhi chiusi", unit: "s", step: 1, min: 0, max: 30, perLeg: true, from: 1,
      how: "Su una gamba, ginocchio morbido, mani sui fianchi, vicino al muro per sicurezza. Chiudi gli occhi e conta i secondi finché il piede alzato tocca terra o la mano cerca il muro. Massimo 30. Il migliore di 3 tentativi.",
      better: "high"
    },
    {
      id: "stepdown", name: "Discesa dal gradino filmata", from: 1,
      how: "Gradino di 15–20 cm, di lato, sull'operata: 5 discese lente fino a sfiorare il pavimento con il tallone dell'altra gamba. Filmati da davanti e guarda il video.",
      options: ["Il ginocchio entra verso l'interno o il bacino cade", "Quasi sempre in linea", "Sempre in linea, bacino dritto"]
    },
    {
      id: "gait", name: "Camminata e scale", from: 1,
      how: "Come cammini questa settimana, senza pensarci?",
      options: ["Zoppico, o il ginocchio resta un po' piegato", "Normale in piano, sulle scale un gradino alla volta", "Normale anche sulle scale, a passo alternato"]
    },
    {
      id: "swell", name: "Gonfiore dopo l'attività", from: 1,
      how: "Nell'ultima settimana, dopo le sessioni o una giornata in piedi, il ginocchio si è gonfiato?",
      options: ["Mai", "Qualche volta, poco", "Spesso, o in modo evidente"]
    },
    {
      id: "push", name: "Piegamenti massimi", unit: "rip.", step: 1, min: 0, max: 100, from: 1,
      how: "Piegamenti a terra con il corpo dritto e il petto che sfiora il pavimento: quanti di fila con la forma pulita. Se a terra non ne fai uno, scrivi 0.",
      better: "high"
    },
    {
      id: "hop", name: "Salto in lungo su una gamba", unit: "cm", step: 1, min: 0, max: 300, perLeg: true, from: 3,
      how: "Da fermo su una gamba, salti in avanti il più lontano possibile e atterri fermo sulla stessa gamba per 2 secondi (se non sei fermo, non vale). Misura dalla punta di partenza al tallone di arrivo. Il migliore di 3, prima la sana. Solo dalla fase 3.",
      better: "high"
    },
    {
      id: "clear", name: "Ok del chirurgo per il contatto", from: 3,
      how: "Il chirurgo o il fisioterapista ti ha visto e ha dato l'ok a tornare a sparring e lotta?",
      options: ["Non ancora", "Sì, ho l'ok"]
    }
  ];

  const SOURCES = {
    moon: { label: "Wright RW e colleghi (gruppo MOON). Anterior Cruciate Ligament Reconstruction Rehabilitation: MOON Guidelines. Sports Health 2015;7(3):239–243.", url: "https://iro.uiowa.edu/esploro/outputs/journalArticle/Anterior-Cruciate-Ligament-Reconstruction-Rehabilitation-MOON/9984294953802771" },
    moonPdf: { label: "Protocollo MOON (Vanderbilt): fasi, criteri e tempi della riabilitazione dopo LCA.", url: "https://www.vumc.org/sports-medicine/sites/vumc.org.sports-medicine/files/public_files/documents/MOON%20VSM%20ACL%20Guidelines.pdf" },
    grindem: { label: "Grindem H e colleghi. Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction: the Delaware-Oslo ACL cohort study. Br J Sports Med 2016;50(13):804–808.", url: "https://bjsm.bmj.com/content/50/13/804" },
    perriman: { label: "Perriman A, Leahy E, Semciw AI. The effect of open- versus closed-kinetic-chain exercises on anterior tibial laxity, strength, and function following ACL reconstruction: a systematic review and meta-analysis. JOSPT 2018;48(7):552–566.", url: "https://search.pedro.org.au/search-results/record-detail/54106" },
    shelbourne: { label: "Shelbourne KD e colleghi. Loss of normal knee motion after ACL reconstruction is associated with radiographic arthritic changes. Am J Sports Med 2012 (riassunto di Mike Reinold).", url: "https://mikereinold.com/what-has-the-biggest-impact-on-outcomes-following-acl-reconstruction-surgery/" },
    cyclops: { label: "Jackson DW, Schaefer RK. Cyclops syndrome: loss of extension following intra-articular ACL reconstruction. Arthroscopy 1990.", url: "https://pubmed.ncbi.nlm.nih.gov/2206179/" },
    schoenfeld: { label: "Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW. Strength and hypertrophy adaptations between low- vs. high-load resistance training: a systematic review and meta-analysis. J Strength Cond Res 2017;31(12):3508–3523.", url: "https://pubmed.ncbi.nlm.nih.gov/28834797/" },
    morton: { label: "Morton RW e colleghi. A systematic review, meta-analysis and meta-regression of the effect of protein supplementation on resistance training-induced gains in muscle mass and strength. Br J Sports Med 2018;52(6):376–384.", url: "https://bjsm.bmj.com/content/52/6/376" }
  };

  const LESSONS = [
    {
      id: "estensione",
      title: "Prima di tutto l'estensione",
      lead: "Un ginocchio che non si stende del tutto si consuma prima. Pochi gradi sembrano niente, ma contano.",
      body: [
        "Shelbourne e colleghi hanno seguito 780 persone operate al crociato per più di dieci anni: chi aveva un movimento normale mostrava segni di artrosi nel 29% dei casi, chi aveva perso movimento nel 47%. Anche una perdita di 3–5 gradi di estensione faceva differenza.",
        "Per questo la routine di estensione è ogni giorno, due volte, finché il ginocchio operato si stende come l'altro (anche oltre la linea dritta, se l'altro lo fa). Funzionano i tempi lunghi a carico basso: minuti con il peso della gamba, non strappi.",
        "Se dopo 3–4 settimane di lavoro quotidiano la differenza dei talloni non cala, o senti un blocco duro alla fine del movimento, fai vedere il ginocchio al chirurgo. A volte un piccolo nodulo di cicatrice davanti all'innesto (la lesione «a ciclope», descritta da Jackson e Schaefer nel 1990) blocca gli ultimi gradi e lo stretching non basta."
      ],
      sources: ["shelbourne", "cyclops"]
    },
    {
      id: "quadricipite",
      title: "Il quadricipite decide il ritorno",
      lead: "Dopo il crociato il quadricipite della gamba operata resta più debole per mesi. È il numero che conta di più.",
      body: [
        "Nello studio di Grindem (106 persone seguite per due anni dopo la ricostruzione), chi tornava allo sport con il quadricipite sotto il 90% dell'altra gamba si rompeva di nuovo il ginocchio nel 33% dei casi; sopra il 90%, nel 12,5%. Ogni punto di simmetria in più abbassava il rischio di circa il 3%.",
        "Per questo il piano spinge sull'estensione da seduto, l'arco corto, la sedia e le salite sul gradino, e i test confrontano sempre le due gambe. I test di casa sono approssimati: il numero vero si misura dal fisioterapista con un dinamometro, ed è una buona idea farlo prima di tornare al contatto."
      ],
      sources: ["grindem"]
    },
    {
      id: "catena-aperta",
      title: "L'estensione da seduto non è nemica",
      lead: "Per anni si è detto che l'estensione della gamba da seduto «tira» il legamento nuovo. Le linee guida di oggi la usano.",
      body: [
        "Le linee guida MOON fanno partire l'estensione in catena aperta dalla 6ª settimana, prima con un arco limitato (da 90° a 40°) e poi su tutto l'arco. A 4 mesi sei oltre quei tempi.",
        "Una revisione degli studi (Perriman 2018) non ha trovato differenze di lassità del ginocchio, forza o funzione tra esercizi in catena aperta (gamba libera, come l'estensione da seduto) e in catena chiusa (piede a terra, come lo squat). Servono tutti e due: la catena aperta isola il quadricipite, la chiusa insegna a usarlo in piedi."
      ],
      sources: ["moon", "perriman"]
    },
    {
      id: "criteri",
      title: "Criteri, non calendario",
      lead: "Si passa alla fase successiva quando il ginocchio supera i test, non quando passa il tempo.",
      body: [
        "Il protocollo MOON indica tempi medi, ma dice chiaramente che si avanza quando si raggiungono i criteri: per esempio 20 sollevamenti a gamba tesa senza ritardo, estensione completa, niente gonfiore, e più avanti test su una gamba al 75% e poi all'85% dell'altra.",
        "Qui succede lo stesso: ogni settimana fai i test e la fase si aggiorna da sola. Le date minime (corsa dal 3° mese, salti dal 4°, pivot e calci veloci dal 6°, contatto dal 9°) sono un limite in più, non un obiettivo."
      ],
      sources: ["moonPdf", "moon"]
    },
    {
      id: "nove-mesi",
      title: "Perché il contatto aspetta il nono mese",
      lead: "La lotta, lo sparring e i calci a piena velocità sono gli sport con pivot e contatto per eccellenza.",
      body: [
        "Nello studio di Grindem il rischio di una nuova lesione calava del 51% per ogni mese in cui il ritorno agli sport con pivot veniva rimandato, fino al nono mese. Il legamento nuovo ha bisogno di tempo per maturare, anche se la gamba sembra già pronta.",
        "Fino ad allora la tecnica non si ferma: mani, guardia, difese, spostamenti e calci lenti si allenano tutti, nella fase giusta. In Difesa trovi un avviso sugli esercizi che il ginocchio non deve ancora fare e cosa fare al loro posto."
      ],
      sources: ["grindem"]
    },
    {
      id: "muscoli",
      title: "Muscoli con i manubri di casa",
      lead: "Per crescere non servono pesi enormi: serve arrivare vicino al cedimento.",
      body: [
        "La revisione di Schoenfeld (2017) ha trovato una crescita muscolare simile con carichi leggeri e pesanti quando le serie arrivano vicino al cedimento; la forza massima, invece, cresce di più con i carichi pesanti. Con i manubri di casa la regola è: 10–20 ripetizioni per serie, e le ultime 1–3 devono essere davvero dure.",
        "Quando le ripetizioni diventano troppe, rallenta la discesa (4 secondi), aggiungi una pausa o passa alla versione a un braccio o a una gamba: il livello successivo di ogni esercizio fa proprio questo.",
        "Le proteine aiutano: nella meta-analisi di Morton (2018), in media oltre circa 1,6 g di proteine per kg di peso al giorno non si vedevano altri guadagni di massa muscolare (chi vuole il massimo può arrivare fino a circa 2,2)."
      ],
      sources: ["schoenfeld", "morton"]
    },
    {
      id: "segnali",
      title: "Quando fermarsi e chiamare il chirurgo",
      lead: "La maggior parte dei fastidi passa da sola. Alcuni segnali no.",
      body: [
        "Regola pratica di ogni giorno: un fastidio fino a 3 su 10 durante l'esercizio, che sparisce entro la mattina dopo, va bene. Se il giorno dopo il ginocchio è più gonfio, più rigido o si stende meno, la sessione successiva scendi di un livello.",
        "Senti il chirurgo o il fisioterapista se il ginocchio cede (si «sposta» o «scappa»), se il gonfiore cresce per più di 2–3 giorni, se si blocca, o se l'estensione non migliora in 3–4 settimane di lavoro quotidiano.",
        "Questo piano non sostituisce il fisioterapista: è il lavoro di tutti i giorni tra un controllo e l'altro. Un controllo con i test di forza misurati dal fisioterapista prima del ritorno al contatto vale molto."
      ],
      sources: ["cyclops", "moonPdf"]
    }
  ];

  return { AREAS, PHASES, GATES, GRAFTS, FLEX, EXERCISES, SESSIONS, SESSION_INFO, TESTS, SOURCES, LESSONS };
});
