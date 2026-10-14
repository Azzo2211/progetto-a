/*
 * Progetto A - Scacchi: percorso di lezioni del coach.
 *
 * Ogni grado (D -> S) ha le sue lezioni. Una lezione ha:
 *  - theory: spiegazione del coach (paragrafi brevi)
 *  - keyPoints: le regole da ricordare
 *  - example: esempio guidato sulla scacchiera (mosse con commento)
 *  - exercises: esercizi scritti per la lezione (verificati con Stockfish,
 *    vedi tools/verify-lessons.js)
 *  - practice: esercizi presi dal database Lichess (chess/puzzles.json) per
 *    tema e fascia di rating; contano per il rating tattico.
 *
 * Una lezione e' completata quando risolvi al primo tentativo almeno
 * practice.pass esercizi su practice.count (piu' tutti quelli scritti).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessLessons = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const THEME_LABELS = {
    hangingPiece: "Pezzo in presa",
    mateIn1: "Matto in 1",
    mateIn2: "Matto in 2",
    mateIn3: "Matto in 3",
    mateIn4: "Matto in 4",
    mateIn5: "Matto in 5",
    mate: "Matto",
    fork: "Forchetta",
    pin: "Inchiodatura",
    skewer: "Infilata",
    discoveredAttack: "Attacco di scoperta",
    doubleCheck: "Scacco doppio",
    sacrifice: "Sacrificio",
    defensiveMove: "Mossa difensiva",
    trappedPiece: "Pezzo intrappolato",
    endgame: "Finale"
  };

  const LESSONS = [
    /* ------------------------------------------------------------ grado D */
    {
      id: "d-scacco",
      grade: "D",
      title: "Lo scacco: tre modi per pararlo",
      summary: "Catturare, interporre o spostare il re.",
      theory: [
        "Quando il tuo re e' sotto scacco devi rispondere subito, e le risposte possibili sono solo tre: catturare il pezzo che da' scacco, mettere un pezzo in mezzo, spostare il re.",
        "Conviene controllarle in quest'ordine. Catturare spesso vince materiale. Interporre va bene se il pezzo che metti in mezzo e' protetto. Spostare il re e' l'ultima scelta: scegli una casa sicura, lontana da altri scacchi.",
        "Se lo scacco e' doppio (due pezzi danno scacco insieme) non puoi ne' catturare ne' interporre: l'unica risposta e' muovere il re."
      ],
      keyPoints: [
        "Cattura, interponi, sposta il re: in quest'ordine",
        "Il pezzo che interponi deve essere protetto",
        "Scacco doppio: si muove solo il re"
      ],
      example: {
        fen: "4k3/8/8/8/8/8/4q3/4K2R w K - 0 1",
        steps: [
          { text: "La donna nera in e2 da' scacco. Non e' protetta da nessuno: il re la puo' catturare.", marks: { e2: "bad" } },
          { move: "e1e2", text: "Rxe2: la risposta migliore a uno scacco e' spesso catturare il pezzo che lo da'." }
        ]
      },
      exercises: [
        {
          fen: "6k1/5ppp/8/8/1b6/8/5PPP/1N2K3 w - - 0 1",
          prompt: "L'alfiere nero da' scacco. Paralo mettendo un pezzo in mezzo, protetto dal re.",
          solution: ["b1d2"],
          accept: ["b1d2"],
          explanation: "Cd2: il cavallo blocca la diagonale ed e' protetto dal re."
        },
        {
          fen: "4r1k1/8/8/8/1b6/8/5PPP/4K3 w - - 0 1",
          prompt: "Scacco doppio di torre e alfiere. Qual e' l'unica risposta possibile?",
          solution: ["e1d1"],
          accept: ["e1d1", "e1f1"],
          tolerance: 15,
          explanation: "Con lo scacco doppio si puo' solo spostare il re: Rd1 o Rf1 sono le uniche case sicure (Rd1 e' un po' meglio)."
        }
      ]
    },
    {
      id: "d-pezzi-in-presa",
      grade: "D",
      title: "Pezzi in presa e valore dei pezzi",
      summary: "Conta attaccanti e difensori prima di ogni cattura.",
      theory: [
        "Il primo motivo per cui si perdono le partite a questo livello e' semplice: un pezzo resta senza difesa e l'avversario lo prende. Prima di ogni mossa fai una domanda sola: quali miei pezzi sono attaccati e chi li difende?",
        "I pezzi non valgono tutti uguale. Pedone 1, cavallo 3, alfiere 3, torre 5, donna 9. Il re non ha prezzo: perderlo significa perdere la partita. Uno scambio e' buono quando ricevi almeno quanto dai.",
        "Per sapere se una cattura e' sicura conta gli attaccanti e i difensori della casa. Se attacchi due volte e il pezzo e' difeso una volta sola, alla fine resti con il pezzo in piu'. Se catturi un pezzo difeso con un pezzo che vale di piu', di solito perdi materiale."
      ],
      keyPoints: [
        "Pedone 1 · Cavallo 3 · Alfiere 3 · Torre 5 · Donna 9",
        "Prima di muovere: cosa e' attaccato? Chi lo difende?",
        "Cattura un pezzo difeso solo se il tuo vale meno o uguale"
      ],
      example: {
        fen: "6k1/5ppp/8/3n4/8/2N5/5PPP/6K1 w - - 0 1",
        steps: [
          { text: "Il cavallo nero in d5 non e' difeso da nessun pezzo. Il tuo cavallo in c3 lo attacca.", arrows: [{ from: "c3", to: "d5", color: "green" }] },
          { move: "c3d5", text: "Cxd5: tre punti di materiale gratis. Nessun pezzo nero puo' riprendere." }
        ]
      },
      exercises: [
        {
          fen: "4k3/8/8/3q4/8/8/3R4/4K3 w - - 0 1",
          prompt: "La donna nera e' sulla colonna della tua torre. Prendila.",
          solution: ["d2d5"],
          explanation: "Txd5: la donna non era difesa. Hai guadagnato 9 punti dando niente."
        }
      ],
      practice: { themes: ["hangingPiece"], min: 400, max: 1400, count: 6, pass: 4 }
    },
    {
      id: "d-matto-in-uno",
      grade: "D",
      title: "Il matto in una mossa",
      summary: "Scacchi forzanti e matto del corridoio.",
      theory: [
        "Uno scacco matto succede quando il re e' attaccato e non ha una mossa per salvarsi: non puo' spostarsi, non si puo' coprire lo scacco e non si puo' catturare il pezzo che lo da'.",
        "Il matto piu' frequente e' quello del corridoio: il re e' sulla prima o ultima traversa, chiuso dai suoi stessi pedoni. Una torre o una donna che arriva sulla traversa da' matto.",
        "Per trovare un matto controlla prima tutti gli scacchi che hai. Sono poche mosse e sono quelle che costringono l'avversario a rispondere. Per ognuno chiediti: il re puo' scappare? Lo scacco si puo' parare o catturare?"
      ],
      keyPoints: [
        "Matto = scacco senza fuga, senza parata, senza cattura",
        "Guarda sempre tutti gli scacchi disponibili",
        "Re chiuso dai suoi pedoni = pericolo di matto del corridoio"
      ],
      example: {
        fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "Il re nero in g8 e' chiuso dai pedoni f7, g7, h7. L'ottava traversa e' libera.", marks: { f8: "bad", h8: "bad" } },
          { move: "d1d8", text: "Td8#: la torre controlla tutta l'ottava traversa. f8 e h8 sono attaccate, i pedoni chiudono la fuga. Scacco matto." }
        ]
      },
      exercises: [
        {
          fen: "6k1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1",
          prompt: "Il re nero e' chiuso in g8. Trova il matto in una mossa.",
          solution: ["b2b8"],
          explanation: "Db8#: matto del corridoio. La donna controlla l'ottava traversa e nessun pezzo nero puo' interporsi."
        }
      ],
      practice: { themes: ["mateIn1"], min: 400, max: 1000, count: 6, pass: 4 }
    },
    {
      id: "d-forchetta",
      grade: "D",
      title: "La forchetta",
      summary: "Un pezzo che attacca due bersagli insieme.",
      theory: [
        "La forchetta e' un attacco doppio: un tuo pezzo attacca due pezzi avversari nello stesso momento. L'avversario puo' salvarne uno solo.",
        "Il cavallo e' il re delle forchette perche' salta e attacca case che gli altri pezzi non vedono. Le forchette piu' forti sono quelle con scacco: il re deve muoversi e tu prendi l'altro pezzo.",
        "Cerca le forchette guardando i pezzi avversari non difesi e il re: se due bersagli sono a un salto di cavallo dalla stessa casa, quella casa e' una possibile forchetta. Anche pedoni e donna fanno ottime forchette."
      ],
      keyPoints: [
        "Attacco doppio: l'avversario salva un solo pezzo",
        "Forchetta con scacco = vinci quasi sempre il secondo pezzo",
        "Cerca bersagli non difesi a distanza di salto di cavallo"
      ],
      example: {
        fen: "r3k3/6pp/8/3N4/8/8/PP6/4K3 w - - 0 1",
        steps: [
          { text: "Re nero in e8 e torre in a8. Dalla casa c7 il cavallo li attacca entrambi.", marks: { c7: "hint" } },
          { move: "d5c7", text: "Cc7+! Scacco al re e attacco alla torre insieme.", arrows: [{ from: "c7", to: "a8", color: "red" }, { from: "c7", to: "e8", color: "red" }] },
          { move: "e8d7", text: "Il re deve spostarsi: lo scacco viene prima di tutto." },
          { move: "c7a8", text: "Cxa8: la torre e' tua. Questa e' la forza della forchetta con scacco." }
        ]
      },
      exercises: [
        {
          fen: "2r1k3/6pp/8/1N6/8/8/PP4PP/4K3 w - - 0 1",
          prompt: "Trova la forchetta di cavallo che vince la torre.",
          solution: ["b5d6"],
          explanation: "Cd6+: il cavallo attacca il re in e8 e la torre in c8. Dopo la mossa del re prendi la torre."
        }
      ],
      practice: { themes: ["fork"], min: 400, max: 1000, count: 6, pass: 4 }
    },
    {
      id: "d-routine",
      grade: "D",
      title: "La routine prima di ogni mossa",
      summary: "Scacchi, catture, minacce: per te e per l'avversario.",
      theory: [
        "I giocatori forti non sono piu' veloci: hanno un metodo. Prima di muovere controllano tre cose in quest'ordine: scacchi, catture, minacce. Prima le proprie, poi quelle dell'avversario.",
        "Dopo che l'avversario ha mosso chiediti: cosa vuole fare con questa mossa? Attacca un pezzo? Prepara uno scacco? Spesso la risposta e' scritta nella mossa appena giocata.",
        "Quando hai scelto la tua mossa, prima di toccare il pezzo fai l'ultimo controllo: dopo la mia mossa, l'avversario ha uno scacco, una cattura o una minaccia forte? Questo controllo da solo elimina la maggior parte degli errori gravi."
      ],
      keyPoints: [
        "Ordine: scacchi, catture, minacce",
        "Dopo ogni mossa avversaria: cosa vuole fare?",
        "Controllo finale: cosa puo' fare lui dopo la mia mossa?"
      ],
      example: {
        fen: "6k1/5ppp/8/8/8/8/r4PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "Tocca a te. Scacchi disponibili? Td8+ e' scacco... ed e' anche matto, perche' il re e' chiuso.", arrows: [{ from: "d1", to: "d8", color: "green" }] },
          { move: "d1d8", text: "Td8#. Partire dagli scacchi ti fa trovare subito le mosse decisive." }
        ]
      },
      exercises: [],
      practice: { themes: ["mateIn2"], min: 400, max: 900, count: 6, pass: 4 }
    },

    {
      id: "d-scambi",
      grade: "D",
      title: "Gli scambi: quando conviene",
      summary: "Conta attaccanti e difensori prima di catturare.",
      theory: [
        "Uno scambio e' una serie di catture sulla stessa casa. Prima di iniziarlo conta: quanti tuoi pezzi attaccano la casa e quanti pezzi avversari la difendono.",
        "Se gli attaccanti sono di piu', alla fine l'ultimo a catturare sei tu. Ma conta anche il valore: inizia sempre con il pezzo che vale meno, cosi' se l'avversario riprende perdi poco.",
        "Regola pratica: quando sei in vantaggio di materiale, scambia i pezzi (il vantaggio pesa di piu' con meno pezzi). Quando sei in svantaggio, evita gli scambi e cerca complicazioni."
      ],
      keyPoints: [
        "Attaccanti contro difensori sulla stessa casa",
        "Cattura prima con il pezzo che vale meno",
        "In vantaggio scambia, in svantaggio evita"
      ],
      example: {
        fen: "3r2k1/5ppp/8/3n4/8/2N5/5PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "Il cavallo nero in d5 e' attaccato da due pezzi (cavallo e torre) e difeso da uno solo (la torre in d8).", arrows: [{ from: "c3", to: "d5", color: "green" }, { from: "d1", to: "d5", color: "green" }, { from: "d8", to: "d5", color: "red" }] },
          { move: "c3d5", text: "Cxd5: si comincia con il pezzo che vale meno." },
          { move: "d8d5", text: "Se il Nero riprende con la torre..." },
          { move: "d1d5", text: "Txd5: il Bianco ha l'ultima parola. Due attaccanti contro un difensore = pezzo guadagnato." }
        ]
      },
      exercises: [],
      practice: { themes: ["hangingPiece", "fork"], min: 500, max: 1200, count: 6, pass: 4 }
    },
    {
      id: "d-matto-donna",
      grade: "D",
      title: "Matto con re e donna",
      summary: "Spingi il re al bordo e attento allo stallo.",
      theory: [
        "Con re e donna contro re solo si vince sempre, ma bisogna sapere come. La donna chiude il re avversario in una zona sempre piu' piccola, restando a distanza di salto di cavallo dal re nemico.",
        "Quando il re avversario e' sul bordo, porta il tuo re vicino: la donna da sola non basta per dare matto, serve il re che copre le case di fuga.",
        "Attenzione allo stallo: se il re avversario non ha mosse e non e' sotto scacco, la partita e' patta. Prima di ogni mossa di donna chiediti: il suo re avra' ancora una mossa?"
      ],
      keyPoints: [
        "Donna a salto di cavallo dal re nemico per chiuderlo",
        "Re al bordo, poi avvicina il tuo re",
        "Controlla sempre di non dare stallo"
      ],
      example: {
        fen: "7k/8/6K1/8/8/8/8/5Q2 w - - 0 1",
        steps: [
          { text: "Il re nero e' nell'angolo. Attenzione: Df7?? sarebbe stallo, il re nero non avrebbe mosse.", marks: { f7: "bad" } },
          { move: "f1f8", text: "Df8#: la donna da' scacco sull'ottava traversa, il re bianco copre g7 e h7. Scacco matto." }
        ]
      },
      exercises: [
        {
          fen: "6k1/8/6K1/8/8/8/8/Q7 w - - 0 1",
          prompt: "Il tuo re copre le case davanti al re nero. Da' matto con la donna.",
          solution: ["a1a8"],
          explanation: "Da8#: la donna controlla l'ottava traversa, il re bianco copre f7, g7 e h7."
        },
        {
          fen: "7k/8/4Q1K1/8/8/8/8/8 w - - 0 1",
          prompt: "Matto in una mossa, ma attento a non dare stallo.",
          solution: ["e6e8"],
          explanation: "De8# (anche Dc8# va bene). Df7?? invece lascerebbe il re nero senza mosse e senza scacco: stallo, cioe' patta."
        }
      ],
      practice: { themes: ["mateIn1"], min: 400, max: 900, count: 6, pass: 4 }
    },
    {
      id: "d-matti-torri",
      grade: "D",
      title: "Matti con le torri",
      summary: "La scala con due torri e il matto con re e torre.",
      theory: [
        "Con due torri si da' matto con la 'scala': una torre controlla una traversa, l'altra da' scacco sulla traversa successiva. A turno spingono il re fino al bordo.",
        "Con re e torre contro re solo serve l'aiuto del re: la torre taglia il re avversario, il tuo re si mette di fronte (opposizione) e la torre da' scacco sul bordo.",
        "In tutti questi finali ricorda: le torri vanno tenute lontane dal re avversario, cosi' non le puo' attaccare."
      ],
      keyPoints: [
        "Due torri: una blocca, l'altra da' scacco",
        "Re e torre: re di fronte al re, torre sul bordo",
        "Torri lontane dal re nemico"
      ],
      example: {
        fen: "8/8/3k4/R7/8/8/8/6KR w - - 0 1",
        steps: [
          { text: "La torre in a5 controlla la quinta traversa: il re nero non puo' scendere." },
          { move: "h1h6", text: "Th6+: la seconda torre da' scacco sulla sesta traversa." },
          { move: "d6e7", text: "Il re deve salire in settima." },
          { move: "a5a7", text: "Ta7+: ora e' la prima torre a dare scacco, la seconda chiude la sesta." },
          { move: "e7e8", text: "Il re arriva sul bordo." },
          { move: "h6h8", text: "Th8#: la scala e' completa." }
        ]
      },
      exercises: [
        {
          fen: "6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1",
          prompt: "Una torre controlla la settima traversa. Da' matto con l'altra.",
          solution: ["b1b8"],
          explanation: "Tb8#: la torre in a7 impedisce al re di scendere, quella in b8 da' scacco sul bordo."
        },
        {
          fen: "6k1/8/6K1/8/8/8/8/R7 w - - 0 1",
          prompt: "Il tuo re e' di fronte al re nero. Da' matto con la torre.",
          solution: ["a1a8"],
          explanation: "Ta8#: il re bianco copre f7, g7 e h7, la torre controlla tutta l'ottava traversa."
        }
      ],
      practice: { themes: ["mateIn1"], min: 600, max: 1100, count: 6, pass: 4 }
    },

    /* ------------------------------------------------------------ grado C */
    {
      id: "c-inchiodatura",
      grade: "C",
      title: "L'inchiodatura",
      summary: "Un pezzo che non puo' muoversi senza scoprire qualcosa di piu' prezioso.",
      theory: [
        "Un pezzo e' inchiodato quando sta davanti a un pezzo piu' prezioso sulla stessa linea di un tuo alfiere, torre o donna. Se si sposta, scopre il pezzo dietro.",
        "L'inchiodatura e' assoluta quando dietro c'e' il re: il pezzo non puo' proprio muoversi. E' relativa quando dietro c'e' un altro pezzo, per esempio la donna: muoversi e' legale ma costa caro.",
        "Un pezzo inchiodato e' un bersaglio: attaccalo di nuovo, magari con un pedone. Non puo' scappare e chi lo difende spesso non basta."
      ],
      keyPoints: [
        "Inchiodatura assoluta: dietro c'e' il re, il pezzo non si muove",
        "Attacca il pezzo inchiodato con forze in piu'",
        "Alfieri, torri e donna creano le inchiodature"
      ],
      example: {
        fen: "4k3/8/2n5/8/3P4/8/8/4KB2 w - - 0 1",
        steps: [
          { text: "Il cavallo in c6 e il re in e8 sono sulla stessa diagonale b5-e8." },
          { move: "f1b5", text: "Ab5: il cavallo e' inchiodato al re. Non puo' muoversi.", arrows: [{ from: "b5", to: "e8", color: "red" }] },
          { move: "e8d7", text: "Il Nero difende il cavallo con il re, ma il cavallo resta inchiodato." },
          { move: "d4d5", text: "d5: il pedone attacca il cavallo che non puo' scappare. Il Nero perde un pezzo." }
        ]
      },
      exercises: [],
      practice: { themes: ["pin"], min: 600, max: 1400, count: 6, pass: 4 }
    },
    {
      id: "c-infilata",
      grade: "C",
      title: "L'infilata",
      summary: "Attacchi il pezzo grande, prendi quello dietro.",
      theory: [
        "L'infilata e' un'inchiodatura al contrario: il pezzo di valore maggiore e' davanti. Quando si sposta, il pezzo dietro resta scoperto e lo catturi.",
        "Succede spesso con il re davanti e la donna o una torre dietro sulla stessa traversa, colonna o diagonale. Lo scacco obbliga il re a muoversi.",
        "Nei finali con torri e donne, controlla sempre se il re avversario e un suo pezzo sono allineati: un solo scacco puo' vincere la partita."
      ],
      keyPoints: [
        "Pezzo prezioso davanti, bersaglio dietro",
        "Lo scacco rende l'infilata forzata",
        "Attenzione a re e donna sulla stessa linea"
      ],
      example: {
        fen: "8/8/8/q2k4/8/8/6K1/7R w - - 0 1",
        steps: [
          { text: "Re nero in d5 e donna in a5 sulla quinta traversa. La torre puo' arrivare in h5." },
          { move: "h1h5", text: "Th5+: scacco sulla quinta traversa.", arrows: [{ from: "h5", to: "a5", color: "red" }] },
          { move: "d5c4", text: "Il re deve lasciare la traversa." },
          { move: "h5a5", text: "Txa5: la donna era dietro al re. Infilata riuscita." }
        ]
      },
      exercises: [],
      practice: { themes: ["skewer"], min: 400, max: 1400, count: 6, pass: 4 }
    },
    {
      id: "c-scoperta",
      grade: "C",
      title: "Attacco di scoperta e scacco doppio",
      summary: "Muovi un pezzo e ne libera un altro.",
      theory: [
        "In un attacco di scoperta muovi un pezzo che stava davanti a un tuo alfiere, torre o donna. Il pezzo che si sposta fa una minaccia e quello dietro ne fa un'altra: due attacchi con una mossa.",
        "Lo scacco di scoperta e' ancora piu' forte: il pezzo dietro da' scacco, quindi quello che si muove puo' andare dove vuole, anche a prendere la donna.",
        "Lo scacco doppio e' il caso estremo: sia il pezzo che si muove sia quello scoperto danno scacco. L'unica risposta possibile e' muovere il re."
      ],
      keyPoints: [
        "Pezzo davanti + pezzo a lunga gittata dietro = arma carica",
        "Scacco di scoperta: il pezzo che si muove e' libero",
        "Scacco doppio: si risponde solo muovendo il re"
      ],
      example: {
        fen: "4k3/1q6/8/8/4N3/8/8/4R1K1 w - - 0 1",
        steps: [
          { text: "La torre in e1 e' dietro al cavallo, sulla colonna del re nero. La donna nera e' in b7." },
          { move: "e4d6", text: "Cd6++: scacco doppio, dal cavallo e dalla torre. Il cavallo attacca anche la donna.", arrows: [{ from: "e1", to: "e8", color: "red" }, { from: "d6", to: "b7", color: "red" }] },
          { move: "e8d8", text: "L'unica difesa e' muovere il re." },
          { move: "d6b7", text: "Cxb7+: la donna e' presa." }
        ]
      },
      exercises: [],
      practice: { themes: ["discoveredAttack", "doubleCheck"], min: 600, max: 1600, count: 6, pass: 4 }
    },
    {
      id: "c-matto-in-due",
      grade: "C",
      title: "Matto in due",
      summary: "La prima mossa forza, la seconda chiude.",
      theory: [
        "Nei matti in due la prima mossa e' quasi sempre forzante: uno scacco, una cattura o un sacrificio che l'avversario deve accettare. Lo scopo e' togliere al re una casa di fuga o un difensore.",
        "Metodo: elenca le case di fuga del re e i pezzi che lo difendono. Poi cerca la mossa che toglie una delle due cose. Spesso si sacrifica un pezzo per attirare un difensore lontano.",
        "Quando provi una variante, considera tutte le risposte dell'avversario, non solo quella che speri."
      ],
      keyPoints: [
        "Prima mossa: scacco, cattura o sacrificio",
        "Togli case di fuga o elimina il difensore",
        "Verifica tutte le risposte dell'avversario"
      ],
      example: {
        fen: "r5k1/5ppp/8/8/8/8/3R1PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "La torre in a8 difende l'ottava traversa. Hai due torri sulla colonna d." },
          { move: "d2d8", text: "Td8+: la prima torre attira la torre nera.", arrows: [{ from: "d1", to: "d8", color: "green" }] },
          { move: "a8d8", text: "Txd8 e' forzata." },
          { move: "d1d8", text: "Txd8#: il difensore e' sparito, matto del corridoio." }
        ]
      },
      exercises: [],
      practice: { themes: ["mateIn2"], min: 800, max: 1400, count: 6, pass: 4 }
    },
    {
      id: "c-aperture",
      grade: "C",
      title: "I principi d'apertura",
      summary: "Centro, sviluppo, arrocco: in quest'ordine.",
      theory: [
        "Le prime 10-12 mosse servono a preparare la battaglia. Tre principi: controlla il centro con i pedoni (e4, d4), sviluppa cavalli e alfieri verso il centro, arrocca presto per mettere il re al sicuro.",
        "Errori tipici: muovere lo stesso pezzo piu' volte, uscire con la donna troppo presto (diventa un bersaglio e fai perdere tempo a te stesso), muovere troppi pedoni sul lato del re.",
        "Non serve imparare a memoria lunghe varianti. Se ogni mossa sviluppa un pezzo, controlla il centro o mette al sicuro il re, arriverai al mediogioco con una buona posizione."
      ],
      keyPoints: [
        "Pedoni centrali, poi cavalli e alfieri",
        "Arrocca entro le prime 10 mosse",
        "Non muovere lo stesso pezzo due volte senza motivo"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Posizione iniziale. Guardiamo un'apertura che segue tutti i principi." },
          { move: "e2e4", text: "1.e4: il pedone occupa il centro e libera alfiere e donna." },
          { move: "e7e5", text: "1...e5: il Nero fa lo stesso." },
          { move: "g1f3", text: "2.Cf3: sviluppa e attacca il pedone e5." },
          { move: "b8c6", text: "2...Cc6: sviluppa e difende." },
          { move: "f1c4", text: "3.Ac4: l'alfiere punta su f7, il punto debole del Nero." },
          { move: "f8c5", text: "3...Ac5: risposta simmetrica e sana." },
          { move: "e1g1", text: "4.O-O: re al sicuro e torre verso il centro. Tre mosse di sviluppo, una di sicurezza." }
        ]
      },
      exercises: [
        {
          fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
          prompt: "Il Nero ha appena sviluppato il cavallo. Gioca una mossa che sviluppa un pezzo verso il centro.",
          solution: ["f1b5"],
          accept: ["f1b5", "f1c4", "b1c3", "d2d4"],
          explanation: "Ab5, Ac4, Cc3 e d4 seguono tutte i principi: sviluppo e controllo del centro."
        },
        {
          fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 1 5",
          prompt: "Hai sviluppato alfiere e cavallo. E' il momento di mettere il re al sicuro.",
          solution: ["e1g1"],
          accept: ["e1g1", "c2c3", "b1c3"],
          explanation: "O-O mette il re al sicuro e porta la torre verso il centro. Anche c3 o Cc3 vanno bene, ma l'arrocco e' la mossa piu' semplice."
        }
      ]
    },

    {
      id: "c-italiana",
      grade: "C",
      title: "Apertura: la Partita Italiana",
      summary: "Un'apertura semplice e solida da giocare con il Bianco.",
      theory: [
        "La Partita Italiana nasce dopo 1.e4 e5 2.Cf3 Cc6 3.Ac4. L'alfiere punta su f7, la casa piu' debole del Nero all'inizio, e prepara l'arrocco veloce.",
        "Il piano classico e' semplice: c3 e d3 (o d4) per costruire il centro, arrocco, torre in e1, poi il cavallo di b1 va in d2, f1 e g3 per partecipare all'attacco sul lato di re.",
        "Non serve correre: nella Italiana lenta si vince con la posizione migliore dei pezzi. Evita di attaccare con la donna troppo presto."
      ],
      keyPoints: [
        "1.e4 e5 2.Cf3 Cc6 3.Ac4: alfiere su f7",
        "c3 e d3/d4, arrocco, Te1",
        "Cavallo b1-d2-f1-g3 verso il re avversario"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Vediamo le prime mosse della Partita Italiana lenta." },
          { move: "e2e4", text: "1.e4: centro." },
          { move: "e7e5", text: "1...e5." },
          { move: "g1f3", text: "2.Cf3: attacca e5." },
          { move: "b8c6", text: "2...Cc6: difende." },
          { move: "f1c4", text: "3.Ac4: l'alfiere punta su f7." },
          { move: "f8c5", text: "3...Ac5: il Nero fa lo stesso." },
          { move: "c2c3", text: "4.c3: prepara d4 per prendere il centro." },
          { move: "g8f6", text: "4...Cf6: sviluppo e attacco a e4." },
          { move: "d2d3", text: "5.d3: difende e4, versione tranquilla." },
          { move: "d7d6", text: "5...d6." },
          { move: "e1g1", text: "6.O-O: re al sicuro." },
          { move: "e8g8", text: "6...O-O." },
          { move: "f1e1", text: "7.Te1: la torre sostiene il centro. Ora Cbd2-f1-g3 e il piano e' completo." }
        ]
      },
      exercises: [
        {
          fen: "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
          prompt: "Il Nero ha risposto con 3...Cf6 e attacca e4. Gioca una mossa sana.",
          solution: ["d2d3"],
          accept: ["d2d3", "b1c3", "d2d4", "e1g1"],
          explanation: "d3 difende e4 con calma; anche Cc3, d4 o l'arrocco vanno bene. Cg5 sarebbe un attacco rischioso, non adatto per iniziare."
        },
        {
          fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 1 5",
          prompt: "Hai giocato c3: continua con il piano.",
          solution: ["d2d4"],
          accept: ["d2d4", "d2d3", "e1g1"],
          explanation: "d4 e' il seguito naturale di c3 (centro); anche d3 o l'arrocco seguono il piano."
        }
      ]
    },
    {
      id: "c-trappole",
      grade: "C",
      title: "Trappole d'apertura",
      summary: "Il matto del barbiere e come difendersi.",
      theory: [
        "Molte partite tra principianti finiscono in poche mosse per lo stesso motivo: il punto f7 (f2 per il Bianco) e' difeso solo dal re all'inizio.",
        "Il 'matto del barbiere' arriva con donna e alfiere che attaccano insieme f7. Per difendersi basta coprire f7 o bloccare l'attacco della donna: g6, De7 o Df6.",
        "Se l'avversario esce presto con la donna, non spaventarti: sviluppa i pezzi attaccandola. Ogni volta che deve scappare tu guadagni tempo."
      ],
      keyPoints: [
        "f7 e f2 sono i punti deboli all'inizio",
        "Contro Dh5 + Ac4: g6, De7 o Df6",
        "Attacca la donna uscita presto con i pezzi in sviluppo"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Ecco come si prepara il matto del barbiere e come il Nero lo evita." },
          { move: "e2e4", text: "1.e4." },
          { move: "e7e5", text: "1...e5." },
          { move: "f1c4", text: "2.Ac4: l'alfiere punta su f7." },
          { move: "b8c6", text: "2...Cc6." },
          { move: "d1h5", text: "3.Dh5: anche la donna attacca f7. Minaccia Dxf7 matto!", arrows: [{ from: "h5", to: "f7", color: "red" }, { from: "c4", to: "f7", color: "red" }] },
          { move: "g7g6", text: "3...g6!: blocca la donna e la attacca." },
          { move: "h5f3", text: "4.Df3: minaccia di nuovo f7." },
          { move: "g8f6", text: "4...Cf6: difende e sviluppa. Il Nero sta bene e la donna bianca ha perso tempo." }
        ]
      },
      exercises: [
        {
          fen: "r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 3 3",
          prompt: "Giochi con il Nero: la donna e l'alfiere minacciano matto in f7. Difenditi.",
          solution: ["g7g6"],
          accept: ["g7g6", "d8e7", "d8f6"],
          explanation: "g6 blocca la donna e la attacca; anche De7 o Df6 difendono f7. Cf6?? invece perde subito: Dxf7#."
        },
        {
          fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
          prompt: "Il Nero ha attaccato la donna con 3...Cf6?? senza difendere f7. Punisci.",
          solution: ["h5f7"],
          explanation: "Dxf7#: la donna e' protetta dall'alfiere e il re non ha case libere."
        }
      ]
    },
    {
      id: "c-forchette-avanzate",
      grade: "C",
      title: "Forchette di pedone e di donna",
      summary: "Tutti i pezzi possono fare un attacco doppio.",
      theory: [
        "Non solo il cavallo: anche un pedone che avanza puo' attaccare due pezzi insieme, e un pedone vale meno di qualsiasi pezzo. La forchetta di pedone e' spesso decisiva.",
        "La donna fa forchette in tutte le direzioni, ma attenzione: vale tanto, quindi la forchetta funziona solo se la casa su cui va non e' attaccata.",
        "Per vedere le forchette guarda le coppie di pezzi avversari sulla stessa traversa, diagonale o a distanza di salto di cavallo, soprattutto se non sono difesi."
      ],
      keyPoints: [
        "Il pedone fa forchette che costano poco",
        "La donna: forchetta solo su una casa sicura",
        "Cerca coppie di pezzi allineati o non difesi"
      ],
      example: {
        fen: "4k3/8/2n1b3/8/3P4/8/8/4K3 w - - 0 1",
        steps: [
          { text: "Cavallo in c6 e alfiere in e6: c'e' una casa da cui un pedone li attacca entrambi.", marks: { d5: "hint" } },
          { move: "d4d5", text: "d5!: il pedone attacca cavallo e alfiere. Il Nero ne salva uno solo.", arrows: [{ from: "d5", to: "c6", color: "red" }, { from: "d5", to: "e6", color: "red" }] }
        ]
      },
      exercises: [
        {
          fen: "q3k3/8/8/1N6/8/8/PP6/4K3 w - - 0 1",
          prompt: "Re in e8 e donna in a8: trova la forchetta.",
          solution: ["b5c7"],
          explanation: "Cc7+: scacco al re e attacco alla donna. Dopo la mossa del re prendi la donna."
        }
      ],
      practice: { themes: ["fork"], min: 1000, max: 1600, count: 6, pass: 4 }
    },
    {
      id: "c-deviazione",
      grade: "C",
      title: "Deviazione e difensore sovraccarico",
      summary: "Togli di mezzo il pezzo che difende tutto.",
      theory: [
        "Un pezzo e' sovraccarico quando deve difendere due cose insieme. Se lo costringi a occuparsi di una, l'altra resta scoperta.",
        "La deviazione e' la mossa (spesso un sacrificio o uno scacco) che allontana il difensore dalla casa importante. Funziona perche' l'avversario e' obbligato a rispondere.",
        "Quando vedi un pezzo avversario che difende due cose, chiediti: posso attaccare una delle due in modo che sia costretto a muoversi?"
      ],
      keyPoints: [
        "Un difensore, due compiti = sovraccarico",
        "Devia il difensore con uno scacco o un sacrificio",
        "Poi colpisci la cosa rimasta scoperta"
      ],
      exercises: [],
      practice: { themes: ["sacrifice"], min: 1000, max: 1500, count: 6, pass: 4 }
    },

    /* ------------------------------------------------------------ grado B */
    {
      id: "b-sacrifici",
      grade: "B",
      title: "Sacrifici e combinazioni",
      summary: "Dare materiale per ottenere di piu'.",
      theory: [
        "Una combinazione e' una sequenza forzata in cui dai materiale per ottenere qualcosa di piu' grande: un matto, piu' materiale, una promozione.",
        "I sacrifici funzionano quando le risposte dell'avversario sono forzate. Per questo si calcolano solo con mosse forzanti: scacchi, catture e minacce gravi.",
        "Le idee ricorrenti sono deviazione (allontanare un difensore), adescamento (attirare un pezzo su una casa sfortunata) ed eliminazione del difensore. Prima riconosci il bersaglio, poi cerca chi lo protegge."
      ],
      keyPoints: [
        "Un sacrificio va calcolato fino in fondo",
        "Usa mosse forzanti per limitare le risposte",
        "Deviazione, adescamento, eliminazione del difensore"
      ],
      exercises: [],
      practice: { themes: ["sacrifice"], min: 1200, max: 1800, count: 6, pass: 4 }
    },
    {
      id: "b-re-e-pedoni",
      grade: "B",
      title: "Finali di re e pedoni",
      summary: "Opposizione e regola del quadrato.",
      theory: [
        "Nei finali di re e pedoni il re diventa un pezzo d'attacco. Il concetto chiave e' l'opposizione: due re sulla stessa colonna con una casa in mezzo. Chi NON deve muovere ha l'opposizione e costringe l'altro re a cedere terreno.",
        "Regola del quadrato: per sapere se il re raggiunge un pedone passato, immagina un quadrato che va dal pedone alla casa di promozione. Se il re puo' entrare nel quadrato con la sua mossa, ferma il pedone.",
        "Con re e pedone contro re, il re attaccante deve stare davanti al pedone, non dietro. Se raggiunge le case chiave (due case davanti al pedone), vince."
      ],
      keyPoints: [
        "Opposizione: ha il vantaggio chi non deve muovere",
        "Quadrato del pedone: entra nel quadrato o il pedone promuove",
        "Re davanti al pedone, sulle case chiave"
      ],
      example: {
        fen: "8/8/4k3/8/4K3/4P3/8/8 b - - 0 1",
        steps: [
          { text: "Re contro re sulla colonna e con una casa in mezzo. Tocca al Nero: il Bianco ha l'opposizione." },
          { move: "e6d6", text: "Il re nero deve spostarsi e cede una casa." },
          { move: "e4f5", text: "Rf5: il re bianco avanza su una casa chiave davanti al pedone." },
          { move: "d6e7", text: "Il Nero prova a tornare davanti al pedone." },
          { move: "f5e5", text: "Re5: il Bianco riprende l'opposizione. Il pedone verra' accompagnato a promozione." }
        ]
      },
      exercises: [
        {
          fen: "8/8/8/4k3/8/3K4/4P3/8 w - - 0 1",
          prompt: "Il re bianco deve passare davanti al pedone. Trova la mossa che prende l'opposizione.",
          solution: ["d3e3"],
          explanation: "Re3: i re sono uno di fronte all'altro con una casa in mezzo e tocca al Nero. Qualsiasi mossa del re nero lascia passare il tuo re su d4, e4 o f4, le case chiave del pedone."
        },
        {
          fen: "7k/8/8/p7/8/5K2/8/8 w - - 0 1",
          prompt: "Il pedone nero in a5 corre verso a1. Entra nel suo quadrato con il re per fermarlo.",
          solution: ["f3e4"],
          accept: ["f3e4", "f3e3", "f3e2"],
          explanation: "Il quadrato del pedone va da a5 a e1: la colonna e e' l'ultima dentro. Con il re sulla colonna e raggiungi il pedone in tempo; con Rf4 o Rg4 resteresti fuori e il pedone promuoverebbe."
        }
      ]
    },
    {
      id: "b-difesa",
      grade: "B",
      title: "La mossa difensiva",
      summary: "Trovare l'unica mossa che salva la posizione.",
      theory: [
        "Difendersi bene vale quanto attaccare bene. Quando l'avversario minaccia qualcosa, non cercare subito il contrattacco: prima elenca le sue minacce reali.",
        "Le difese si dividono in quattro tipi: spostare il pezzo attaccato, difenderlo, bloccare la linea di attacco, contro-minacciare qualcosa di piu' grande.",
        "Spesso esiste una sola mossa buona. Se tutte le mosse naturali perdono, cerca quelle meno ovvie: una mossa intermedia con scacco, una cattura che cambia il conto."
      ],
      keyPoints: [
        "Prima le minacce dell'avversario, poi le tue",
        "Sposta, difendi, blocca o contrattacca piu' forte",
        "Se tutto sembra perdere, cerca la mossa intermedia"
      ],
      exercises: [],
      practice: { themes: ["defensiveMove"], min: 1000, max: 1900, count: 6, pass: 4 }
    },
    {
      id: "b-matto-in-tre",
      grade: "B",
      title: "Calcolo: matto in tre",
      summary: "Visualizzare tre mosse senza muovere i pezzi.",
      theory: [
        "Il calcolo e' la capacita' di vedere la posizione dopo alcune mosse senza toccare i pezzi. Si allena come un muscolo: un po' ogni giorno, con esercizi sempre un po' piu' lunghi.",
        "Calcola in modo ordinato: scegli le mosse candidate (le piu' forzanti), poi per ognuna tutte le risposte dell'avversario. Non saltare da una variante all'altra.",
        "Alla fine della variante fermati e guarda la posizione immaginata: e' davvero matto? C'e' una casa libera che ti era sfuggita?"
      ],
      keyPoints: [
        "Candidate forzanti, una variante alla volta",
        "Per ogni tua mossa, tutte le risposte",
        "Verifica la posizione finale prima di muovere"
      ],
      exercises: [],
      practice: { themes: ["mateIn3"], min: 1000, max: 1800, count: 6, pass: 4 }
    },
    {
      id: "b-pezzi-attivi",
      grade: "B",
      title: "Pezzi attivi e pezzi intrappolati",
      summary: "Un pezzo vale quanto le case che controlla.",
      theory: [
        "Il valore dei pezzi cambia con la posizione. Un cavallo in una casa centrale protetta da un pedone (avamposto) puo' valere piu' di una torre chiusa. Un alfiere bloccato dai suoi pedoni vale poco.",
        "Un pezzo e' intrappolato quando non ha case sicure dove andare: allora puoi attaccarlo e vincerlo anche se non e' in presa adesso. Succede spesso ad alfieri e cavalli entrati troppo in profondita'.",
        "Nel mediogioco chiediti quale tuo pezzo e' il peggiore e come migliorarlo. Spesso la mossa giusta non attacca niente: porta un pezzo passivo su una casa migliore."
      ],
      keyPoints: [
        "Avamposti per i cavalli, diagonali aperte per gli alfieri",
        "Un pezzo senza case di fuga si puo' catturare",
        "Migliora il tuo pezzo peggiore"
      ],
      exercises: [],
      practice: { themes: ["trappedPiece", "pin"], min: 1300, max: 1900, count: 6, pass: 4 }
    },

    {
      id: "b-matti-tipici",
      grade: "B",
      title: "Matti tipici: affogato e corridoio",
      summary: "Schemi di matto da riconoscere al volo.",
      theory: [
        "Molti matti si ripetono uguali. Conoscerli ti fa vedere la combinazione in un attimo. Il matto affogato: il re e' circondato dai suoi pezzi e un cavallo lo attacca senza che nessuno possa catturarlo.",
        "Il 'matto di Philidor' unisce sacrificio e matto affogato: la donna si sacrifica in g8, la torre la cattura e chiude l'ultima casa del re, poi il cavallo da' matto in f7.",
        "Il matto del corridoio funziona anche con piu' pezzi: se l'ultima traversa e' difesa una volta sola, un sacrificio sulla traversa elimina il difensore."
      ],
      keyPoints: [
        "Affogato: re chiuso dai suoi pezzi + cavallo",
        "Sacrificio in g8 per chiudere l'ultima casa",
        "Corridoio: elimina l'unico difensore della traversa"
      ],
      example: {
        fen: "r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1",
        steps: [
          { text: "Re nero in h8, pedoni in g7 e h7. La casa g8 e' coperta dal cavallo." },
          { move: "b3g8", text: "Dg8+!!: sacrificio di donna. Il re non puo' prendere, la casa e' protetta dal cavallo.", arrows: [{ from: "h6", to: "g8", color: "green" }] },
          { move: "a8g8", text: "Txg8 e' forzata: ora la torre chiude l'ultima casa del suo re." },
          { move: "h6f7", text: "Cf7#: matto affogato." }
        ]
      },
      exercises: [
        {
          fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
          prompt: "Il re nero e' chiuso dai suoi pezzi. Trova il matto.",
          solution: ["g5f7"],
          explanation: "Cf7#: matto affogato. Torre e pedoni tolgono al re tutte le case."
        }
      ],
      practice: { themes: ["mateIn2"], min: 1200, max: 1700, count: 6, pass: 4 }
    },
    {
      id: "b-colonne",
      grade: "B",
      title: "Colonne aperte e torri in settima",
      summary: "Dove mettere le torri nel mediogioco.",
      theory: [
        "Le torri hanno bisogno di colonne aperte (senza pedoni). Una torre su una colonna aperta controlla tutta la colonna e puo' entrare nel campo avversario.",
        "La settima traversa (seconda per il Nero) e' il bersaglio: una torre li' attacca i pedoni dalla parte dove non sono protetti e chiude il re sul bordo.",
        "Due torri sulla stessa colonna o in settima sono fortissime: si proteggono a vicenda e moltiplicano le minacce."
      ],
      keyPoints: [
        "Torri sulle colonne aperte",
        "La settima traversa e' il bersaglio",
        "Torri raddoppiate si difendono a vicenda"
      ],
      example: {
        fen: "2r3k1/1p3ppp/p7/8/8/P7/1P3PPP/3R1RK1 w - - 0 1",
        steps: [
          { text: "La colonna d e' aperta: nessun pedone la blocca." },
          { move: "d1d7", text: "Td7: la torre entra in settima e attacca il pedone b7." },
          { move: "c8b8", text: "Il Nero deve difendere b7." },
          { move: "f1d1", text: "Tfd1: la seconda torre raddoppia sulla colonna aperta." },
          { move: "g8f8", text: "Il Nero aspetta." },
          { move: "d7d8", text: "Td8+: con due torri sulla colonna il Bianco forza gli scambi e resta piu' attivo." }
        ]
      },
      exercises: [],
      practice: { themes: ["endgame"], min: 1300, max: 1700, count: 6, pass: 4 }
    },
    {
      id: "b-pedone-passato",
      grade: "B",
      title: "Il pedone passato",
      summary: "Un pedone che nessuno puo' fermare.",
      theory: [
        "Un pedone e' passato quando nessun pedone avversario puo' fermarlo o catturarlo sulla sua strada verso la promozione. Nei finali vale quasi quanto un pezzo.",
        "I pedoni passati vanno spinti, soprattutto quando il re avversario e' lontano. Un pedone passato 'esterno' (sul lato opposto) costringe il re avversario ad andare a fermarlo, lasciando liberi gli altri pedoni.",
        "Per fermare un pedone passato avversario bloccalo con un pezzo, idealmente un cavallo, sulla casa davanti a lui."
      ],
      keyPoints: [
        "I pedoni passati vanno spinti",
        "Il passato esterno distrae il re avversario",
        "Per fermarlo, blocca la casa davanti"
      ],
      example: {
        fen: "8/8/5k2/7p/P7/5K1P/8/8 w - - 0 1",
        steps: [
          { text: "Il pedone a4 e' passato: nessun pedone nero puo' fermarlo. Il re nero e' lontano." },
          { move: "a4a5", text: "a5: avanti subito." },
          { move: "f6e6", text: "Il re nero corre verso il pedone." },
          { move: "a5a6", text: "a6." },
          { move: "e6d6", text: "Il re nero e' fuori dal quadrato del pedone." },
          { move: "a6a7", text: "a7: non c'e' piu' modo di fermarlo." },
          { move: "d6c7", text: "Troppo tardi." },
          { move: "a7a8q", text: "a8=D: il pedone passato e' diventato donna." }
        ]
      },
      exercises: [],
      practice: { themes: ["endgame"], min: 1200, max: 1600, count: 6, pass: 4 }
    },
    {
      id: "b-scoperte-avanzate",
      grade: "B",
      title: "Inchiodature e scoperte nel mediogioco",
      summary: "Le linee nascoste dietro i pezzi.",
      theory: [
        "Nel mediogioco le inchiodature e gli attacchi di scoperta sono piu' nascosti: le linee sono piene di pezzi e una mossa puo' aprirne una all'improvviso.",
        "Prima di muovere un pezzo che sta su una linea (colonna, traversa o diagonale) tra un tuo pezzo e uno avversario, chiediti cosa si apre. Vale anche al contrario: guarda cosa puo' aprire l'avversario.",
        "Un pezzo inchiodato non difende davvero: se difende qualcosa, quella cosa e' piu' debole di quanto sembra."
      ],
      keyPoints: [
        "Ogni mossa puo' aprire una linea",
        "Il pezzo inchiodato non difende davvero",
        "Controlla le linee di entrambi i colori"
      ],
      exercises: [],
      practice: { themes: ["discoveredAttack", "pin"], min: 1400, max: 1900, count: 6, pass: 4 }
    },

    /* ------------------------------------------------------------ grado A */
    {
      id: "a-finali-torre",
      grade: "A",
      title: "Finali di torre: Lucena e Philidor",
      summary: "Le due posizioni che ogni giocatore deve conoscere.",
      theory: [
        "Meta' dei finali sono finali di torre. Due posizioni vanno conosciute a memoria. La posizione di Lucena e' la vittoria: il re attaccante e' davanti al suo pedone in settima e si costruisce un 'ponte' con la torre per ripararsi dagli scacchi.",
        "La posizione di Philidor e' la difesa: il difensore tiene la torre sulla sesta traversa (terza per il Bianco) finche' il pedone non avanza; quando il pedone arriva in sesta, la torre va in fondo e da' scacco da dietro.",
        "Regola generale: nei finali di torre la torre deve essere attiva. Una torre passiva che difende un pedone e' quasi sempre peggio di una torre che attacca."
      ],
      keyPoints: [
        "Lucena: costruisci il ponte con la torre sulla quarta traversa",
        "Philidor: torre sulla sesta, poi scacchi da dietro",
        "Torre attiva > torre passiva"
      ],
      example: {
        fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
        steps: [
          { text: "Posizione di Lucena. Il re bianco e' bloccato davanti al pedone dalla torre nera sulla colonna a." },
          { move: "c1d1", text: "Td1+: allontana il re nero dal pedone." },
          { move: "d8e7", text: "Il re nero si sposta." },
          { move: "d1d4", text: "Td4!: il ponte. La torre servira' a bloccare gli scacchi." },
          { move: "a2a1", text: "Il Nero aspetta." },
          { move: "b8c7", text: "Rc7: il re esce davanti al pedone." },
          { move: "a1c1", text: "Tc1+: scacco." },
          { move: "c7b6", text: "Rb6: il re va verso la torre." },
          { move: "c1b1", text: "Tb1+." },
          { move: "b6c6", text: "Rc6." },
          { move: "b1c1", text: "Tc1+." },
          { move: "c6b5", text: "Rb5: il re si avvicina alla torre." },
          { move: "c1b1", text: "Tb1+: l'ultimo scacco." },
          { move: "d4b4", text: "Tb4: il ponte! La torre, protetta dal re, blocca gli scacchi. Il pedone promuove." }
        ]
      },
      exercises: [
        {
          fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
          prompt: "Posizione di Lucena: prima mossa per vincere.",
          solution: ["c1d1"],
          accept: ["c1d1"],
          explanation: "Td1+ allontana il re nero di una colonna. Poi Td4 e il ponte."
        }
      ],
      practice: { themes: ["endgame"], min: 1600, max: 2000, count: 6, pass: 4 }
    },
    {
      id: "a-matti-lunghi",
      grade: "A",
      title: "Matti in tre e quattro",
      summary: "Attacchi al re calcolati fino in fondo.",
      theory: [
        "Gli attacchi al re piu' forti nascono dalla collaborazione: due o tre pezzi che puntano sulle stesse case. Un pezzo da solo raramente da' matto.",
        "Nelle combinazioni lunghe tieni a mente quali case controlla ogni tuo pezzo dopo ogni mossa. Disegna mentalmente la 'gabbia' del re: quali case sono coperte, quali restano libere.",
        "Quando la variante e' lunga, fissa i punti intermedi: 'dopo la mossa due il re e' in h8 e la colonna h e' aperta'. Ti aiuta a non perdere il filo."
      ],
      keyPoints: [
        "Piu' pezzi sulle stesse case del re",
        "Disegna la gabbia del re",
        "Fissa posizioni intermedie nelle varianti lunghe"
      ],
      exercises: [],
      practice: { themes: ["mateIn3", "mateIn4"], min: 1600, max: 2200, count: 6, pass: 4 }
    },
    {
      id: "a-combinazioni",
      grade: "A",
      title: "Combinazioni da giocatore forte",
      summary: "Motivi multipli nella stessa sequenza.",
      theory: [
        "A questo livello le combinazioni uniscono piu' motivi: un sacrificio di deviazione seguito da una forchetta, uno scacco di scoperta che prepara un'infilata.",
        "Il segnale che una combinazione esiste e' quasi sempre uno di questi: re poco protetto, pezzi non difesi, pezzi sovraccarichi (che difendono due cose), linee aperte verso pezzi importanti.",
        "Quando vedi uno di questi segnali, fermati e cerca: anche se la prima mossa sembra assurda, se e' forzante vale la pena calcolarla."
      ],
      keyPoints: [
        "Segnali: re esposto, pezzi indifesi, difensori sovraccarichi",
        "Una combinazione unisce piu' motivi",
        "Le mosse assurde ma forzanti vanno calcolate"
      ],
      exercises: [],
      practice: { themes: ["sacrifice", "discoveredAttack"], min: 1800, max: 2200, count: 6, pass: 4 }
    },
    {
      id: "a-finali-tattici",
      grade: "A",
      title: "Finali tattici",
      summary: "Pochi pezzi, calcolo preciso.",
      theory: [
        "Nei finali ogni tempo conta. Un pedone passato avanzato puo' valere un pezzo intero, e le combinazioni di promozione sono frequenti.",
        "Il re e' un pezzo attivo: portalo verso il centro e verso i pedoni. Nei finali tattici controlla sempre se un pedone puo' promuovere con uno sfondamento o un sacrificio.",
        "Conta i tempi: quante mosse servono a te per promuovere e quante all'avversario? Spesso la partita si decide di un solo tempo."
      ],
      keyPoints: [
        "Pedoni passati e promozioni prima di tutto",
        "Re attivo al centro",
        "Conta i tempi di entrambi"
      ],
      exercises: [],
      practice: { themes: ["endgame"], min: 1800, max: 2200, count: 6, pass: 4 }
    },

    {
      id: "a-attacco-re",
      grade: "A",
      title: "Attacco al re arroccato",
      summary: "Il sacrificio in h7 e quando funziona.",
      theory: [
        "Il re arroccato e' al sicuro solo finche' i pezzi che lo proteggono restano al loro posto. Senza il cavallo in f6 il punto h7 diventa debole.",
        "Il 'regalo greco' (Axh7+) funziona quando ci sono tre condizioni: l'alfiere puo' prendere in h7, il cavallo puo' arrivare in g5, la donna puo' arrivare in h5. Se l'avversario puo' difendere facilmente g5 o h7, il sacrificio fallisce.",
        "In ogni attacco conta i pezzi: se attacchi il re con piu' pezzi di quelli che lo difendono, di solito un sacrificio funziona. Se no, prima porta altri pezzi."
      ],
      keyPoints: [
        "Senza cavallo in f6, h7 e' debole",
        "Regalo greco: alfiere in h7, cavallo g5, donna h5",
        "Attaccanti piu' dei difensori prima di sacrificare"
      ],
      example: {
        fen: "rnbq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 4 7",
        steps: [
          { text: "Il cavallo nero e' stato cacciato da f6. L'alfiere in d3 punta su h7." },
          { move: "d3h7", text: "Axh7+!: il regalo greco." },
          { move: "g8h7", text: "Kxh7." },
          { move: "f3g5", text: "Cg5+: il cavallo arriva con scacco." },
          { move: "h7g8", text: "Il re torna in g8." },
          { move: "d1h5", text: "Dh5: minaccia Dh7 matto. Il Nero deve dare materiale per difendersi.", arrows: [{ from: "h5", to: "h7", color: "red" }] }
        ]
      },
      exercises: [],
      practice: { themes: ["mateIn3", "sacrifice"], min: 1600, max: 2000, count: 6, pass: 4 }
    },
    {
      id: "a-risorse-difensive",
      grade: "A",
      title: "Risorse difensive: stallo e scacco perpetuo",
      summary: "Salvare partite che sembrano perse.",
      theory: [
        "Anche in posizioni perse esistono risorse: lo scacco perpetuo (dare scacco all'infinito) e lo stallo (rimanere senza mosse legali senza essere sotto scacco) portano alla patta.",
        "Quando sei in svantaggio cerca di semplificare verso finali di patta conosciuti, attiva il re e crea problemi all'avversario con minacce concrete.",
        "Quando sei in vantaggio, al contrario, controlla sempre che l'avversario non abbia scacchi perpetui o stalli a disposizione."
      ],
      keyPoints: [
        "Scacco perpetuo e stallo = patta",
        "In svantaggio crea problemi, non aspettare",
        "In vantaggio controlla le risorse dell'avversario"
      ],
      exercises: [],
      practice: { themes: ["defensiveMove"], min: 1600, max: 2100, count: 6, pass: 4 }
    },
    {
      id: "a-finali-complessi",
      grade: "A",
      title: "Finali con piu' pezzi",
      summary: "Attivita', pedoni passati e il re al centro.",
      theory: [
        "Nei finali con piu' pezzi il principio e' l'attivita': un pezzo attivo vale piu' di un pedone in piu' con pezzi passivi.",
        "Crea pedoni passati dove sei in maggioranza, porta il re al centro e scambia i pezzi quando il finale che resta e' vinto.",
        "Prima di ogni scambio immagina il finale che resta: e' vinto, patto o perso?"
      ],
      keyPoints: [
        "Attivita' dei pezzi prima di tutto",
        "Crea pedoni passati con la maggioranza",
        "Prima di scambiare valuta il finale che resta"
      ],
      exercises: [],
      practice: { themes: ["endgame"], min: 1900, max: 2300, count: 6, pass: 4 }
    },

    /* ------------------------------------------------------------ grado S */
    {
      id: "s-matti-profondi",
      grade: "S",
      title: "Matti profondi",
      summary: "Quattro e cinque mosse di calcolo forzato.",
      theory: [
        "Ai livelli piu' alti un attacco si vince calcolando fino al matto, non sperando. Le sequenze da quattro o cinque mosse richiedono metodo: candidate forzanti, risposte complete, controllo finale.",
        "Allenati a calcolare senza toccare i pezzi e solo dopo verifica. L'abitudine di confermare la variante intera prima di muovere e' quella che separa un candidato maestro da un buon giocatore di club."
      ],
      keyPoints: [
        "Calcola fino al matto prima di sacrificare",
        "Una variante alla volta, tutte le risposte",
        "Verifica la posizione finale"
      ],
      exercises: [],
      practice: { themes: ["mateIn4", "mateIn5"], min: 2000, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-tattica-maestro",
      grade: "S",
      title: "Tattica da maestro",
      summary: "Sacrifici profondi e scacchi doppi.",
      theory: [
        "Le combinazioni dei maestri hanno spesso una mossa tranquilla nel mezzo: dopo i sacrifici, una mossa che non da' scacco ma crea una minaccia impossibile da parare.",
        "Cerca anche le risorse dell'avversario: la combinazione e' corretta solo se funziona contro la sua difesa migliore."
      ],
      keyPoints: [
        "Le mosse tranquille nelle combinazioni",
        "Controlla la difesa migliore dell'avversario",
        "Sacrifici per tempo, linee e case"
      ],
      exercises: [],
      practice: { themes: ["sacrifice", "doubleCheck"], min: 2200, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-difesa-elite",
      grade: "S",
      title: "Difesa d'elite",
      summary: "Salvare le posizioni difficili.",
      theory: [
        "I giocatori di vertice perdono poche partite perche' si difendono con precisione. Nelle posizioni difficili cercano la mossa che crea piu' problemi all'avversario, non quella che sembra piu' comoda.",
        "Contro un attacco, chiediti quale pezzo dell'avversario e' essenziale e se puoi cambiarlo. Uno scambio al momento giusto spegne gli attacchi."
      ],
      keyPoints: [
        "Cerca la mossa che crea problemi all'avversario",
        "Cambia i pezzi d'attacco piu' pericolosi",
        "Non arrenderti nelle posizioni peggiori: cerca risorse"
      ],
      exercises: [],
      practice: { themes: ["defensiveMove"], min: 2000, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-finali-precisione",
      grade: "S",
      title: "Finali di precisione",
      summary: "Tecnica e calcolo nei finali complessi.",
      theory: [
        "Nei finali di alto livello conta la tecnica: sapere quale finale semplificato e' vinto e quale e' patta, e scegliere lo scambio giusto.",
        "Allena la precisione: in queste posizioni una sola mossa imprecisa trasforma la vittoria in patta."
      ],
      keyPoints: [
        "Conosci i finali teorici",
        "Scegli gli scambi in base al finale che resta",
        "Una mossa imprecisa cambia il risultato"
      ],
      exercises: [],
      practice: { themes: ["endgame"], min: 2200, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-scacchi-doppi",
      grade: "S",
      title: "Scacchi doppi e scoperte d'elite",
      summary: "Le combinazioni con le linee nascoste.",
      theory: [
        "Allo scacco doppio non c'e' difesa se non muovere il re: per questo nelle combinazioni dei maestri prepara spesso il matto o la vincita di un pezzo.",
        "Allenati a vedere le batterie (due pezzi a lunga gittata sulla stessa linea) e i pezzi che le coprono: quando il pezzo davanti si muove con minaccia, nasce l'attacco doppio."
      ],
      keyPoints: [
        "Scacco doppio: solo il re puo' muoversi",
        "Cerca le batterie nascoste",
        "Il pezzo davanti deve muovere con una minaccia"
      ],
      exercises: [],
      practice: { themes: ["doubleCheck", "discoveredAttack"], min: 2000, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-sacrifici-profondi",
      grade: "S",
      title: "Sacrifici profondi",
      summary: "Dare materiale per l'iniziativa.",
      theory: [
        "I sacrifici dei giocatori di vertice non sempre portano a un matto immediato: a volte danno l'iniziativa, linee aperte o un re avversario senza difesa per molte mosse.",
        "Per decidere se sacrificare calcola le varianti forzanti e valuta la posizione finale: quanti pezzi attaccano, quanti difendono, quanto tempo serve all'avversario per riorganizzarsi."
      ],
      keyPoints: [
        "Sacrificio per iniziativa e linee",
        "Calcola le varianti forzanti",
        "Valuta la posizione finale, non solo il materiale"
      ],
      exercises: [],
      practice: { themes: ["sacrifice"], min: 2400, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-matti-cinque",
      grade: "S",
      title: "Matti in cinque mosse",
      summary: "Il calcolo piu' lungo.",
      theory: [
        "I matti in cinque richiedono di tenere a mente una posizione che cambia molto. Il metodo e' sempre lo stesso: mosse forzanti, tutte le risposte, posizione finale.",
        "Quando ti perdi, torna alla posizione di partenza e ricalcola una variante sola fino in fondo invece di saltare da un'idea all'altra."
      ],
      keyPoints: [
        "Solo mosse forzanti",
        "Una variante alla volta, fino in fondo",
        "Se ti perdi, riparti dalla posizione iniziale"
      ],
      exercises: [],
      practice: { themes: ["mateIn5", "mateIn4"], min: 2200, max: 2600, count: 6, pass: 4 }
    }
  ];

  const GRADE_UNITS = {
    D: { title: "Fondamenti", text: "Materiale, matti semplici e prime tattiche." },
    C: { title: "Tattica e aperture", text: "Inchiodature, infilate, scoperte e principi d'apertura." },
    B: { title: "Calcolo e finali base", text: "Sacrifici, difesa, calcolo e finali di re e pedoni." },
    A: { title: "Gioco avanzato", text: "Finali di torre, attacchi lunghi e combinazioni." },
    S: { title: "Livello maestro", text: "Calcolo profondo, difesa e finali di precisione." }
  };

  // Pattern di errore delle revisioni -> lezione consigliata.
  const PATTERN_LESSONS = {
    hangingPiece: "d-pezzi-in-presa",
    concentration: "d-routine",
    missedThreat: "b-difesa",
    calculation: "b-matto-in-tre",
    kingSafety: "c-aperture",
    development: "c-aperture",
    noPlan: "b-pezzi-attivi",
    weakEndgame: "b-re-e-pedoni"
  };

  function byId(id) {
    return LESSONS.find((lesson) => lesson.id === id) || null;
  }

  function forGrade(grade) {
    return LESSONS.filter((lesson) => lesson.grade === grade);
  }

  // Esercizi del database per un tema e una fascia di rating.
  function filterPuzzles(puzzles, { themes, min, max }) {
    return puzzles.filter((puzzle) => puzzle.rating >= min && puzzle.rating <= max && themes.some((theme) => puzzle.themes.includes(theme)));
  }

  function parsePuzzleLine(line) {
    const [id, fen, moves, rating, themes] = line.split("|");
    return { id, fen, moves: moves.split(" "), rating: Number(rating), themes: themes ? themes.split(" ") : [] };
  }

  return { LESSONS, GRADE_UNITS, PATTERN_LESSONS, THEME_LABELS, byId, forGrade, filterPuzzles, parsePuzzleLine };
});
