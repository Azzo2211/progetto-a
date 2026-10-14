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
