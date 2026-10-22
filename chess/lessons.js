/*
 * Progetto A - Scacchi: percorso di lezioni del coach.
 *
 * Ogni grado (D -> S) ha le sue lezioni. Una lezione ha:
 *  - theory: spiegazione del coach (paragrafi brevi)
 *  - sections: approfondimenti [{ title, paras }] mostrati dopo la teoria
 *    (piani tipici, errori frequenti, come allenarsi)
 *  - keyPoints: le regole da ricordare
 *  - example: esempio guidato sulla scacchiera (mosse con commento)
 *  - exercises: esercizi scritti per la lezione (verificati con Stockfish,
 *    vedi tools/verify-lessons.js)
 *  - practice: esercizi presi dal database Lichess (chess/puzzles.json) per
 *    tema e fascia di rating; contano per il rating tattico.
 *
 * Una lezione è completata quando risolvi al primo tentativo almeno
 * practice.pass esercizi su practice.count (più tutti quelli scritti).
 * Le lezioni senza practice si completano risolvendo tutti gli esercizi scritti.
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
        "Quando il tuo re è sotto scacco devi rispondere subito, e le risposte possibili sono solo tre: catturare il pezzo che dà scacco, mettere un pezzo in mezzo (interporre), spostare il re. Qualsiasi altra mossa, anche la più forte del mondo, è illegale finché lo scacco resta.",
        "Conviene controllarle in quest'ordine. Catturare spesso vince materiale ed elimina il problema alla radice. Interporre va bene se il pezzo che metti in mezzo è protetto, altrimenti lo regali. Spostare il re è la scelta più comune, ma va fatta con criterio: scegli una casa sicura, lontana da altri scacchi e da forchette.",
        "Se lo scacco è doppio (due pezzi danno scacco insieme) non puoi né catturare né interporre, perché fermeresti solo uno dei due scacchi: l'unica risposta è muovere il re.",
        "Contro il cavallo non si può interporre, perché salta. Contro un pedone o un pezzo attaccato al re non c'è spazio per mettersi in mezzo. In questi casi restano solo due strade: catturare chi dà scacco o spostare il re."
      ],
      sections: [
        {
          title: "Come scegliere la casa del re",
          paras: [
            "Quando sposti il re, guarda le case di arrivo una per una: sono attaccate da qualche pezzo avversario? Dopo la mossa il re resta esposto a un nuovo scacco con forchetta? Un re che scappa verso il centro, in mezzo ai pezzi nemici, corre molti più rischi di un re che resta dietro ai suoi pedoni.",
            "Se puoi scegliere, preferisci la casa da cui il re protegge qualcosa (un pedone, un pezzo) o quella che lo riporta verso il riparo dell'arrocco. Evita le case sulla stessa linea di una torre o di un alfiere avversario: il prossimo scacco è già pronto."
          ]
        },
        {
          title: "Gli errori tipici",
          paras: [
            "Interporre un pezzo non protetto: l'avversario lo cattura dando di nuovo scacco. Spostare il re su una casa dove arriva subito una forchetta di cavallo. Catturare con il re un pezzo che è difeso: la mossa è illegale, e in torneo, se hai toccato il re, devi muoverlo comunque.",
            "Un altro errore è di testa: lo scacco spaventa e si risponde con la prima mossa che viene in mente. Prenditi qualche secondo e passa in rassegna le tre possibilità: spesso la migliore non è la più istintiva."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Nelle partite online, ogni volta che ricevi uno scacco elenca mentalmente le risposte prima di muovere: cattura, interposizione, fuga. Dopo qualche settimana lo farai in automatico, ed è proprio questo l'obiettivo."
          ]
        }
      ],
      keyPoints: [
        "Cattura, interponi, sposta il re: in quest'ordine",
        "Il pezzo che interponi deve essere protetto",
        "Scacco doppio: si muove solo il re",
        "Contro il cavallo non si può interporre"
      ],
      example: {
        fen: "4k3/8/8/8/8/8/4q3/4K2R w K - 0 1",
        steps: [
          { text: "La donna nera in e2 dà scacco. Non è protetta da nessuno: il re la può catturare.", marks: { e2: "bad" } },
          { move: "e1e2", text: "Rxe2: la risposta migliore a uno scacco è spesso catturare il pezzo che lo dà. Il Nero resta con il solo re e tu hai una torre in più." }
        ]
      },
      exercises: [
        {
          fen: "6k1/5ppp/8/8/1b6/8/5PPP/1N2K3 w - - 0 1",
          prompt: "L'alfiere nero dà scacco. Paralo mettendo un pezzo in mezzo, protetto dal re.",
          solution: ["b1d2"],
          accept: ["b1d2"],
          explanation: "Cd2: il cavallo blocca la diagonale ed è protetto dal re. Se il Nero cattura, riprendi con il re."
        },
        {
          fen: "4r1k1/8/8/8/1b6/8/5PPP/4K3 w - - 0 1",
          prompt: "Scacco doppio di torre e alfiere: non si può né parare né catturare. Porta il re in una casa sicura.",
          solution: ["e1d1"],
          accept: ["e1d1", "e1f1"],
          tolerance: 30,
          explanation: "Con lo scacco doppio l'unica difesa è spostare il re: Rd1 e Rf1 sono le due case sicure (d2 è controllata dall'alfiere, e2 dalla torre)."
        },
        {
          fen: "rnb3k1/ppp2ppp/8/8/8/5n2/PPP2PPP/RNB3K1 w - - 0 1",
          prompt: "Il cavallo nero in f3 dà scacco. Contro il cavallo non si interpone: qual è la risposta migliore?",
          solution: ["g2f3"],
          explanation: "gxf3: il pedone cattura il cavallo che dava scacco. Con Rh1 o Rf1 il re si salverebbe, ma il Nero resterebbe con un pezzo in più."
        }
      ]
    },
    {
      id: "d-pezzi-in-presa",
      grade: "D",
      title: "Pezzi in presa e valore dei pezzi",
      summary: "Conta attaccanti e difensori prima di ogni cattura.",
      theory: [
        "Il primo motivo per cui si perdono le partite a questo livello è semplice: un pezzo resta senza difesa e l'avversario lo prende. Prima di ogni mossa fai una domanda sola: quali miei pezzi sono attaccati e chi li difende?",
        "I pezzi non valgono tutti uguale. Pedone 1, cavallo 3, alfiere 3, torre 5, donna 9. Il re non ha prezzo: perderlo significa perdere la partita. Uno scambio è buono quando ricevi almeno quanto dai.",
        "Per sapere se una cattura è sicura conta gli attaccanti e i difensori della casa. Se attacchi due volte e il pezzo è difeso una volta sola, alla fine resti con il pezzo in più. Se catturi un pezzo difeso con un pezzo che vale di più, di solito perdi materiale.",
        "Attenzione anche al contrario: un pezzo che sembra gratis a volte è un'esca. Prima di catturare chiediti che cosa succede dopo: la tua cattura lascia indifeso qualcos'altro? Apre una linea verso il tuo re? Il materiale vinto conta solo se non lo restituisci subito."
      ],
      sections: [
        {
          title: "Il conto degli attaccanti e dei difensori",
          paras: [
            "Su ogni casa contesa fai due liste: i tuoi pezzi che la attaccano e quelli avversari che la difendono, ciascuno con il suo valore. Le catture si alternano e ognuno può fermarsi quando gli conviene. Per questo non basta avere più attaccanti: se il primo pezzo che usi vale più di quello che catturi, l'avversario riprende, si ferma lì e tu hai perso materiale.",
            "Esempio: un cavallo nero difeso da un pedone, attaccato dalla tua donna e da una torre. Due attaccanti contro un difensore, eppure catturare è un errore: dopo la presa con la donna il pedone riprende e hai dato 9 punti per 3."
          ]
        },
        {
          title: "Valori indicativi, non leggi",
          paras: [
            "La tabella 1-3-3-5-9 è una guida. La coppia degli alfieri vale un po' più di due cavalli, una torre e un pedone compensano spesso un pezzo minore, tre pezzi minori lottano alla pari con la donna. In apertura un pedone vale meno del tempo che perdi per prenderlo; in finale un pedone vicino alla promozione può valere quanto un pezzo.",
            "Quindi conta il materiale, ma guarda anche la posizione: un pezzo in più che resta chiuso in un angolo serve a poco."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Prima di ogni mossa, in partita, fai una scansione veloce: per ogni tuo pezzo chiediti chi lo difende. Quelli senza difensori sono i primi candidati a sparire. Poi fai la stessa domanda per i pezzi dell'avversario: spesso il pezzo da prendere è lì e nessuno lo ha visto."
          ]
        }
      ],
      keyPoints: [
        "Pedone 1 · Cavallo 3 · Alfiere 3 · Torre 5 · Donna 9",
        "Prima di muovere: cosa è attaccato? Chi lo difende?",
        "Cattura un pezzo difeso solo se il tuo vale meno o uguale",
        "Il pezzo gratis va controllato: può essere un'esca"
      ],
      example: {
        fen: "6k1/5ppp/8/3n4/8/2N5/5PPP/6K1 w - - 0 1",
        steps: [
          { text: "Il cavallo nero in d5 non è difeso da nessun pezzo. Il tuo cavallo in c3 lo attacca.", arrows: [{ from: "c3", to: "d5", color: "green" }] },
          { move: "c3d5", text: "Cxd5: tre punti di materiale gratis. Nessun pezzo nero può riprendere." }
        ]
      },
      exercises: [
        {
          fen: "4k3/8/8/3q4/8/8/3R4/4K3 w - - 0 1",
          prompt: "La donna nera è sulla colonna della tua torre. Prendila.",
          solution: ["d2d5"],
          explanation: "Txd5: la donna non era difesa. Hai guadagnato 9 punti senza dare niente."
        },
        {
          fen: "2r3k1/5ppp/4p3/3n4/b7/8/5PPP/3Q1RK1 w - - 0 1",
          prompt: "L'alfiere nero in a4 attacca la tua donna e il cavallo in d5 sembra un bersaglio. Quale cattura è davvero sicura?",
          solution: ["d1a4"],
          explanation: "Dxa4: l'alfiere non era difeso da nessuno. Dxd5? invece sarebbe un disastro: exd5 e hai dato la donna per un cavallo."
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
        "Uno scacco matto succede quando il re è attaccato e non ha una mossa per salvarsi: non può spostarsi, non si può coprire lo scacco e non si può catturare il pezzo che lo dà.",
        "Il matto più frequente è quello del corridoio: il re è sulla prima o sull'ultima traversa, chiuso dai suoi stessi pedoni. Una torre o una donna che arriva sulla traversa dà matto.",
        "Per trovare un matto controlla prima tutti gli scacchi che hai. Sono poche mosse e sono quelle che costringono l'avversario a rispondere. Per ognuno chiediti: il re può scappare? Lo scacco si può parare o catturare?",
        "Molti matti nascono dalla collaborazione di due pezzi: uno dà scacco, l'altro protegge il primo o chiude le case di fuga. Un pezzo da solo, senza appoggio, raramente basta."
      ],
      sections: [
        {
          title: "Gli schemi da riconoscere",
          paras: [
            "Corridoio: torre o donna sull'ultima traversa contro un re chiuso dai suoi pedoni. Bacio della morte: la donna si appoggia accanto al re, protetta da un pedone o da un pezzo, e il re non la può catturare. Matto con due torri: una chiude una traversa, l'altra dà scacco su quella successiva.",
            "Più schemi conosci, meno devi calcolare: li vedi e basta. Per questo gli esercizi di matto in una sono il miglior allenamento quotidiano a questo livello."
          ]
        },
        {
          title: "Perché i matti sfuggono",
          paras: [
            "Si guardano solo le catture o le minacce comode e si dimenticano gli scacchi. Oppure si vede lo scacco ma non si controlla la casa di fuga che resta libera, e il re scappa.",
            "Per prevenire il matto del corridoio contro di te, quando hai tempo crea una presa d'aria con h3 (h6 per il Nero) o g3: il re avrà una casa in più."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Dieci matti in una al giorno, risolti in fretta ma senza sbagliare. Per ogni esercizio, prima di muovere, elenca a voce tutti gli scacchi: anche quelli che sembrano assurdi, come i sacrifici di donna."
          ]
        }
      ],
      keyPoints: [
        "Matto = scacco senza fuga, senza parata, senza cattura",
        "Guarda sempre tutti gli scacchi disponibili",
        "Re chiuso dai suoi pedoni = pericolo di matto del corridoio",
        "Due pezzi che collaborano danno matto più facilmente"
      ],
      example: {
        fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "Il re nero in g8 è chiuso dai pedoni f7, g7, h7. L'ottava traversa è libera.", marks: { f8: "bad", h8: "bad" } },
          { move: "d1d8", text: "Td8#: la torre controlla tutta l'ottava traversa. f8 e h8 sono attaccate, i pedoni chiudono la fuga. Scacco matto." }
        ]
      },
      exercises: [
        {
          fen: "6k1/5ppp/8/8/8/8/1Q3PPP/6K1 w - - 0 1",
          prompt: "Il re nero è chiuso in g8. Trova il matto in una mossa.",
          solution: ["b2b8"],
          explanation: "Db8#: matto del corridoio. La donna controlla l'ottava traversa e nessun pezzo nero può interporsi."
        },
        {
          fen: "r5k1/5p1p/5PpQ/8/8/8/1q3PPP/6K1 w - - 0 1",
          prompt: "La tua donna è già vicina al re nero e il pedone f6 controlla g7. Trova il matto.",
          solution: ["h6g7"],
          explanation: "Dg7#: il bacio della morte. La donna, protetta dal pedone f6, dà scacco a contatto: il re non la può catturare e le case f8 e h8 sono controllate dalla donna stessa."
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
        "La forchetta è un attacco doppio: un tuo pezzo attacca due pezzi avversari nello stesso momento. L'avversario può salvarne uno solo.",
        "Il cavallo è il re delle forchette perché salta e attacca case che gli altri pezzi non vedono. Le forchette più forti sono quelle con scacco: il re deve muoversi e tu prendi l'altro pezzo.",
        "Cerca le forchette guardando i pezzi avversari non difesi e il re: se due bersagli sono a un salto di cavallo dalla stessa casa, quella casa è una possibile forchetta. Anche pedoni e donna fanno ottime forchette.",
        "Una forchetta funziona solo se la casa da cui parte è sicura, o se lo scacco non lascia il tempo di catturare il tuo pezzo. Prima di saltare, controlla chi difende la casa d'arrivo."
      ],
      sections: [
        {
          title: "Il trucco del colore",
          paras: [
            "Il cavallo cambia sempre colore di casa: da una casa bianca va su una nera e viceversa. Quindi può fare forchetta solo a due pezzi che stanno su case dello stesso colore. Se il re nemico è su una casa chiara e la donna su una scura, nessuna forchetta di cavallo è possibile in una mossa.",
            "Quando vedi re e donna (o re e torre) sullo stesso colore, cerca subito la casa che li attacca entrambi: spesso c'è, ma serve una mossa di preparazione per arrivarci."
          ]
        },
        {
          title: "Le case calde: c7 e f7",
          paras: [
            "In apertura le case c7 e f7 (c2 e f2 per il Bianco) sono le preferite dei cavalli: da c7 si attaccano la torre in a8 e il re in e8. Molte partite finiscono così dopo un'apertura trascurata.",
            "Per difenderti, non lasciare re, donna e torri a distanza di salto di cavallo da una casa che l'avversario può raggiungere."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Negli esercizi, prima di cercare la mossa, individua i bersagli: re, donna, torri e pezzi non difesi. Poi chiediti quali case li attaccano insieme. È più veloce che provare tutte le mosse del cavallo."
          ]
        }
      ],
      keyPoints: [
        "Attacco doppio: l'avversario salva un solo pezzo",
        "Forchetta con scacco = vinci quasi sempre il secondo pezzo",
        "Cerca bersagli a distanza di salto di cavallo",
        "Il cavallo fa forchetta solo a pezzi sullo stesso colore"
      ],
      example: {
        fen: "r3k3/6pp/8/3N4/8/8/PP6/4K3 w - - 0 1",
        steps: [
          { text: "Re nero in e8 e torre in a8. Dalla casa c7 il cavallo li attacca entrambi.", marks: { c7: "hint" } },
          { move: "d5c7", text: "Cc7+! Scacco al re e attacco alla torre insieme.", arrows: [{ from: "c7", to: "a8", color: "red" }, { from: "c7", to: "e8", color: "red" }] },
          { move: "e8d7", text: "Il re deve spostarsi: lo scacco viene prima di tutto." },
          { move: "c7a8", text: "Cxa8: la torre è tua. Questa è la forza della forchetta con scacco." }
        ]
      },
      exercises: [
        {
          fen: "2r1k3/6pp/8/1N6/8/8/PP4PP/4K3 w - - 0 1",
          prompt: "Trova la forchetta di cavallo che vince la torre.",
          solution: ["b5d6"],
          explanation: "Cd6+: il cavallo attacca il re in e8 e la torre in c8. Dopo la mossa del re prendi la torre."
        },
        {
          fen: "3q3k/6pp/8/4N3/8/8/5PPP/6K1 w - - 0 1",
          prompt: "Re in h8 e donna in d8: trova la casa da cui il cavallo li attacca entrambi.",
          solution: ["e5f7"],
          explanation: "Cf7+: scacco al re e attacco alla donna. Il re deve spostarsi in g8 e la donna cade: Cxd8. Nota che h8 e d8 sono entrambe case scure."
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
        "I giocatori forti non sono più veloci: hanno un metodo. Prima di muovere controllano tre cose in quest'ordine: scacchi, catture, minacce. Prima le proprie, poi quelle dell'avversario.",
        "Dopo che l'avversario ha mosso chiediti: cosa vuole fare con questa mossa? Attacca un pezzo? Prepara uno scacco? Ha liberato una linea? Spesso la risposta è scritta nella mossa appena giocata.",
        "Quando hai scelto la tua mossa, prima di toccare il pezzo fai l'ultimo controllo: dopo la mia mossa, l'avversario ha uno scacco, una cattura o una minaccia forte? Questo controllo da solo elimina la maggior parte degli errori gravi.",
        "Il metodo all'inizio sembra lento. Dopo qualche settimana diventa un'abitudine che richiede pochi secondi, e quei secondi valgono più di qualsiasi apertura imparata a memoria."
      ],
      sections: [
        {
          title: "Le tre domande, in pratica",
          paras: [
            "Scacchi: elenca tutti gli scacchi che hai, anche quelli che sacrificano un pezzo. Catture: tutte le prese possibili, contando chi riprende. Minacce: le mosse che attaccano qualcosa di valore o preparano un matto.",
            "Poi fai lo stesso esercizio dal lato dell'avversario, come se toccasse a lui. È qui che si scoprono le minacce nascoste, come il matto del corridoio che sta preparando."
          ]
        },
        {
          title: "Il controllo finale",
          paras: [
            "Si chiama anche blunder check. Immagina la posizione dopo la tua mossa e guarda solo le risposte forzanti dell'avversario: i suoi scacchi, le sue catture, le sue minacce più forti. Se una di queste ti fa perdere materiale o ti dà matto, cambia mossa.",
            "Il controllo serve soprattutto quando la mossa ti sembra ovvia: è proprio lì che si abbassa la guardia."
          ]
        },
        {
          title: "Quanto tempo usare",
          paras: [
            "Nelle mosse di routine bastano pochi secondi. Spendi il tempo vero nei momenti critici: quando ci sono catture, quando il re è esposto, quando l'avversario ha appena fatto una mossa che non capisci."
          ]
        }
      ],
      keyPoints: [
        "Ordine: scacchi, catture, minacce",
        "Dopo ogni mossa avversaria: cosa vuole fare?",
        "Controllo finale: cosa può fare lui dopo la mia mossa?",
        "Più tempo nei momenti critici, poco nelle mosse ovvie"
      ],
      example: {
        fen: "6k1/5ppp/8/8/8/8/r4PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "Tocca a te. Scacchi disponibili? Td8+ è scacco... ed è anche matto, perché il re è chiuso.", arrows: [{ from: "d1", to: "d8", color: "green" }] },
          { move: "d1d8", text: "Td8#. Partire dagli scacchi ti fa trovare subito le mosse decisive." }
        ]
      },
      exercises: [
        {
          fen: "6k1/5ppp/8/4q3/8/8/4QPPP/3R2K1 w - - 0 1",
          prompt: "Matto in due mosse. Comincia dagli scacchi, non dalle catture.",
          solution: ["d1d8", "e5e8", "d8e8"],
          explanation: "Td8+ De8 (l'unica parata) Txe8#. Chi parte dagli scacchi lo trova subito; chi parte dalle catture vede solo Dxe5, che vince la donna ma non chiude la partita."
        },
        {
          fen: "4r1k1/1p3ppp/p7/8/8/1Q6/P4PPP/6K1 w - - 0 1",
          prompt: "Prima di pensare alle tue idee: che cosa minaccia il Nero? Para la minaccia.",
          solution: ["h2h3"],
          accept: ["h2h3", "g2g3", "h2h4", "g2g4", "f2f3", "f2f4", "b3d1", "g1f1"],
          explanation: "Il Nero minaccia Te1#: il tuo re è chiuso dai suoi pedoni. Una presa d'aria (h3, g3, f3...), Dd1 o Rf1 risolvono. Dxb7?? invece perderebbe subito: Te1#."
        }
      ],
      practice: { themes: ["mateIn2"], min: 400, max: 900, count: 6, pass: 4 }
    },
    {
      id: "d-difesa-base",
      grade: "D",
      title: "Pezzo attaccato: come rispondere",
      summary: "Spostarlo, difenderlo, bloccare, catturare chi attacca, contrattaccare.",
      theory: [
        "Quando l'avversario attacca un tuo pezzo hai cinque risposte possibili: spostarlo, difenderlo, mettere qualcosa in mezzo, catturare il pezzo che attacca, oppure creare una minaccia più grande. Controllale tutte prima di scegliere la più naturale.",
        "Catturare l'attaccante è spesso la soluzione migliore, perché elimina il problema e magari vince materiale. Subito dopo viene spostare il pezzo su una casa dove fa qualcosa di utile: un pezzo che scappa attaccando qualcos'altro guadagna un tempo.",
        "Difendere il pezzo va bene solo se il conto torna: se l'attaccante vale meno del pezzo attaccato (un pedone che attacca il tuo cavallo), difenderlo non basta, perché lo scambio ti costerebbe comunque materiale. In quel caso il pezzo va spostato.",
        "Il contrattacco è l'arma più rischiosa: funziona se la tua minaccia è più grande (uno scacco, un attacco alla donna) e l'avversario non può risolvere entrambe le cose con una mossa sola."
      ],
      sections: [
        {
          title: "Dove mettere il pezzo che scappa",
          paras: [
            "Non basta una casa dove il pezzo è al sicuro adesso. Chiediti: lì è difeso? Può essere attaccato di nuovo con un pedone, perdendo altri tempi? Resta attivo o finisce in un angolo?",
            "Le case migliori sono quelle da cui il pezzo minaccia qualcosa: una forchetta, un attacco a un pezzo indifeso, uno scacco. Così l'avversario deve rispondere a te."
          ]
        },
        {
          title: "Gli errori tipici",
          paras: [
            "Difendere con un pezzo che vale più dell'attaccante, quando l'attaccante è un pedone. Spostare il pezzo attaccato lasciando indifeso un altro pezzo che lui proteggeva. Rispondere con un contrattacco debole, che l'avversario ignora prendendo il pezzo.",
            "E l'errore più grave: non accorgersi dell'attacco. Per questo la domanda «cosa vuole fare?» dopo ogni mossa avversaria è la base di tutto."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Nelle tue partite, ogni volta che un pezzo viene attaccato, conta ad alta voce le cinque risposte prima di muovere. Negli esercizi di questa lezione cerca sempre prima la cattura dell'attaccante e la fuga con minaccia."
          ]
        }
      ],
      keyPoints: [
        "Cinque risposte: sposta, difendi, blocca, cattura, contrattacca",
        "Prima di tutto: posso catturare chi attacca?",
        "Attaccato da un pedone: il pezzo va spostato, non difeso",
        "La fuga migliore attacca qualcosa"
      ],
      example: {
        fen: "4k3/pr4pp/8/5p2/4N1b1/8/PPP2PPP/2R3K1 w - - 0 1",
        steps: [
          { text: "Il Nero ha appena giocato ...f5 e attacca il tuo cavallo in e4 con un pedone. Difenderlo non basterebbe: il pedone vale meno del cavallo.", arrows: [{ from: "f5", to: "e4", color: "red" }] },
          { text: "Le case di fuga sono molte, ma una sola fa qualcosa di utile: d6, da cui il cavallo dà scacco e attacca la torre in b7.", marks: { d6: "hint" } },
          { move: "e4d6", text: "Cd6+! Il cavallo si salva e fa forchetta a re e torre.", arrows: [{ from: "d6", to: "e8", color: "red" }, { from: "d6", to: "b7", color: "red" }] },
          { move: "e8d7", text: "Il re deve spostarsi." },
          { move: "d6b7", text: "Cxb7: la torre è tua. La fuga con minaccia ha trasformato una difesa in un guadagno." }
        ]
      },
      exercises: [
        {
          fen: "r4rk1/5ppp/8/8/8/3n4/PP3PPP/2R1RBK1 w - - 0 1",
          prompt: "Il cavallo nero in d3 attacca le tue due torri. Non scegliere quale salvare: c'è una soluzione migliore.",
          solution: ["f1d3"],
          explanation: "Axd3: catturi il pezzo che attacca. Il cavallo non era difeso e la forchetta sparisce. Salvando una torre avresti perso l'altra per un cavallo."
        },
        {
          fen: "r1bqkb1r/pppp1p1p/2n1pn2/6p1/3P3N/4P3/PPP2PPP/RNBQKB1R w KQkq - 0 5",
          prompt: "Il pedone g5 attacca il tuo cavallo sul bordo. Difenderlo non basta: dove lo metti al sicuro?",
          solution: ["h4f3"],
          explanation: "Cf3: è l'unica casa sicura. In f5 lo prenderebbe il pedone e6, in g6 i pedoni f7 e h7, e g2 è occupata. Un cavallo sul bordo ha poche vie di fuga: tienilo a mente prima di mandarlo lì."
        }
      ],
      practice: { themes: ["hangingPiece", "defensiveMove"], min: 400, max: 1300, count: 6, pass: 4 }
    },
    {
      id: "d-scambi",
      grade: "D",
      title: "Gli scambi: quando conviene",
      summary: "Conta attaccanti e difensori prima di catturare.",
      theory: [
        "Uno scambio è una serie di catture sulla stessa casa. Prima di iniziarlo conta: quanti tuoi pezzi attaccano la casa e quanti pezzi avversari la difendono.",
        "Se gli attaccanti sono di più, alla fine l'ultimo a catturare sei tu. Ma conta anche il valore: inizia sempre con il pezzo che vale meno, così se l'avversario riprende perdi poco.",
        "Regola pratica: quando sei in vantaggio di materiale, scambia i pezzi, perché il vantaggio pesa di più con meno pezzi sulla scacchiera. Quando sei in svantaggio evita gli scambi e cerca complicazioni.",
        "Uno scambio non si giudica solo dal materiale. Chiediti anche quale pezzo resta: se cambi il tuo pezzo migliore con il peggiore dell'avversario hai fatto un cattivo affare, anche se i punti sono pari."
      ],
      sections: [
        {
          title: "Il metodo del conteggio",
          paras: [
            "Metti in fila gli attaccanti dal meno prezioso al più prezioso, e fai lo stesso con i difensori. Poi simula le catture una alla volta, ricordando che a ogni passo chi deve riprendere può anche fermarsi. Il risultato è il punto in cui a una delle due parti conviene smettere.",
            "Con un po' di pratica il conto si fa in pochi secondi, soprattutto se sulla casa ci sono solo due o tre pezzi per parte."
          ]
        },
        {
          title: "Quando scambiare e quando no",
          paras: [
            "Scambia volentieri: quando sei in vantaggio di materiale; quando il tuo pezzo è passivo e quello avversario attivo; quando hai poco spazio, perché ogni scambio ti dà respiro; quando sei sotto attacco, perché ogni pezzo cambiato è un attaccante in meno.",
            "Evita gli scambi: quando sei tu ad attaccare il re; quando sei in svantaggio; quando l'avversario è chiuso e senza spazio, perché ogni scambio lo libera; quando lo scambio rovina la tua struttura di pedoni senza compenso."
          ]
        },
        {
          title: "Gli errori tipici",
          paras: [
            "Iniziare con il pezzo sbagliato (la torre al posto del cavallo). Dimenticare un difensore nascosto dietro un altro pezzo (una torre dietro la donna sulla stessa colonna). Contare bene ma non accorgersi che una delle catture lascia una minaccia di matto."
          ]
        }
      ],
      keyPoints: [
        "Attaccanti contro difensori sulla stessa casa",
        "Cattura prima con il pezzo che vale meno",
        "In vantaggio scambia, in svantaggio evita",
        "Guarda anche quale pezzo resta sulla scacchiera"
      ],
      example: {
        fen: "3r2k1/5ppp/8/3n4/8/2N5/5PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "Il cavallo nero in d5 è attaccato da due pezzi (cavallo e torre) e difeso da uno solo (la torre in d8).", arrows: [{ from: "c3", to: "d5", color: "green" }, { from: "d1", to: "d5", color: "green" }, { from: "d8", to: "d5", color: "red" }] },
          { move: "c3d5", text: "Cxd5: si comincia con il pezzo che vale meno." },
          { move: "d8d5", text: "Se il Nero riprende con la torre..." },
          { move: "d1d5", text: "Txd5: il Bianco ha l'ultima parola. Due attaccanti contro un difensore = pezzo guadagnato." }
        ]
      },
      exercises: [
        {
          fen: "r1bqkb1r/pp3ppp/2p1p3/3n4/2P5/2N2N2/PP1P1PPP/R1BQKB1R w KQkq - 0 7",
          prompt: "Il cavallo nero in d5 è attaccato dal pedone c4 e dal cavallo c3, e difeso da due pedoni. Con che cosa conviene prendere?",
          solution: ["c4d5"],
          explanation: "cxd5: catturi un cavallo con un pedone. Anche se il Nero riprende, hai dato 1 e preso 3. Cxd5? invece sarebbe solo uno scambio alla pari, cavallo contro cavallo."
        },
        {
          fen: "r5k1/pp3ppp/5n2/3b4/8/2N5/PP2BPPP/3R2K1 w - - 0 1",
          prompt: "L'alfiere nero in d5 è attaccato dal tuo cavallo e dalla tua torre, e difeso dal cavallo f6. Quale cattura vince un pezzo?",
          solution: ["c3d5"],
          explanation: "Cxd5! Cxd5 Txd5: due attaccanti contro un difensore, cominciando dal pezzo che vale meno. Con Txd5? Cxd5 Cxd5 avresti dato una torre per alfiere e cavallo: un solo punto di guadagno invece di un pezzo intero."
        }
      ],
      practice: { themes: ["hangingPiece", "fork"], min: 500, max: 1200, count: 6, pass: 4 }
    },
    {
      id: "d-promozione",
      grade: "D",
      title: "Pedoni passati e promozione",
      summary: "La regola del quadrato, la corsa e lo sfondamento.",
      theory: [
        "Un pedone che arriva sull'ultima traversa diventa un pezzo a scelta, quasi sempre una donna. Nei finali la partita ruota intorno a questo: chi promuove per primo, o chi riesce a fermare il pedone avversario.",
        "Un pedone è passato quando nessun pedone avversario può fermarlo o catturarlo lungo la strada. Se il re avversario è lontano, il pedone passato va spinto subito: ogni mossa sprecata è un passo che il re nemico fa verso di lui.",
        "Per sapere se il re può raggiungere un pedone usa la regola del quadrato: immagina un quadrato che ha come lato la distanza tra il pedone e la casa di promozione. Se il re avversario, con la sua mossa, entra nel quadrato, ferma il pedone; se resta fuori, il pedone promuove.",
        "Quando i pedoni sono bloccati gli uni contro gli altri, a volte un sacrificio di pedone apre la strada a un altro: è lo sfondamento, una delle combinazioni più belle dei finali."
      ],
      sections: [
        {
          title: "Come si disegna il quadrato",
          paras: [
            "Pedone bianco in b4: la casa di promozione è b8, la distanza è di quattro case. Il quadrato va da b4 a e4 a e8 a b8. Se tocca al Bianco e spinge in b5, il quadrato si restringe a b5-e5-e8-b8: il re nero deve trovarsi già dentro, o entrarci con la sua mossa.",
            "Attenzione a un dettaglio: un pedone ancora sulla seconda traversa può fare il doppio passo, quindi il quadrato si conta come se fosse già sulla terza."
          ]
        },
        {
          title: "Lo sfondamento",
          paras: [
            "Tre pedoni contro tre, uno di fronte all'altro, con i re lontani: chi spinge per primo il pedone centrale e lo sacrifica crea un pedone passato che nessuno può più fermare. Con i pedoni bianchi in a5, b5, c5 contro a7, b7, c7, la mossa b6! vince: dopo axb6 segue c6!, dopo cxb6 segue a6!.",
            "Lo sfondamento funziona solo se i re sono abbastanza lontani: prima di sacrificare, conta quante mosse servono al pedone che resterà libero."
          ]
        },
        {
          title: "Gli errori tipici",
          paras: [
            "Muovere il re invece del pedone quando il re avversario è fuori dal quadrato: si regala il tempo decisivo. Promuovere a donna quando la donna darebbe stallo. Dimenticare che il pedone avversario può promuovere con scacco, guadagnando un tempo."
          ]
        }
      ],
      keyPoints: [
        "Pedone passato + re avversario lontano = spingi subito",
        "Regola del quadrato: dentro lo ferma, fuori promuove",
        "Il doppio passo cambia il conto del quadrato",
        "Sfondamento: sacrifica il pedone centrale per liberarne un altro"
      ],
      example: {
        fen: "6k1/ppp5/8/PPP5/8/8/8/6K1 w - - 0 1",
        steps: [
          { text: "Tre pedoni contro tre e il re nero lontano. Sembra tutto bloccato, ma c'è lo sfondamento.", marks: { b6: "hint" } },
          { move: "b5b6", text: "b6!: il pedone centrale si sacrifica. Se il Nero lo ignora, bxc7 o bxa7 promuove." },
          { move: "c7b6", text: "cxb6: il Nero cattura con il pedone c." },
          { move: "a5a6", text: "a6!: secondo sacrificio. Il pedone a7 deve catturare, altrimenti axb7 e promozione." },
          { move: "b7a6", text: "bxa6: ora la colonna c è libera." },
          { move: "c5c6", text: "c6: il pedone c è passato e il re nero, in g8, è fuori dal suo quadrato." },
          { move: "g8f7", text: "Il re corre, ma è tardi." },
          { move: "c6c7", text: "c7 e la prossima mossa c8=D. Due pedoni sacrificati per farne promuovere uno." }
        ]
      },
      exercises: [
        {
          fen: "8/8/8/6k1/1P6/8/8/7K w - - 0 1",
          prompt: "Il tuo re è lontano. Il re nero può ancora fermare il pedone b4? Gioca la mossa che vince.",
          solution: ["b4b5"],
          explanation: "b5!: il quadrato diventa b5-e5-e8-b8 e il re nero in g5 resta fuori anche dopo la sua mossa. Con una mossa di re, invece, il Nero entrerebbe nel quadrato e la partita sarebbe patta."
        },
        {
          fen: "k7/5ppp/8/5PPP/8/8/8/K7 w - - 0 1",
          prompt: "Tre pedoni contro tre sull'ala di re, re lontani. Trova lo sfondamento.",
          solution: ["g5g6"],
          explanation: "g6!: se fxg6 segue h6! gxh6 f6 e il pedone f promuove; se hxg6 segue f6! gxf6 h6. Il re nero in a8 è troppo lontano per intervenire."
        }
      ],
      practice: { themes: ["endgame"], min: 400, max: 1000, count: 6, pass: 4 }
    },
    {
      id: "d-matto-donna",
      grade: "D",
      title: "Matto con re e donna",
      summary: "Spingi il re al bordo e attento allo stallo.",
      theory: [
        "Con re e donna contro re solo si vince sempre, ma bisogna sapere come. La donna chiude il re avversario in una zona sempre più piccola, restando a distanza di salto di cavallo dal re nemico.",
        "Quando il re avversario è sul bordo, porta il tuo re vicino: la donna da sola non basta per dare matto, serve il re che copre le case di fuga.",
        "Attenzione allo stallo: se il re avversario non ha mosse e non è sotto scacco, la partita è patta. Prima di ogni mossa di donna chiediti: il suo re avrà ancora una mossa?",
        "Con il metodo giusto il matto arriva in meno di dieci mosse da qualsiasi posizione. Non serve dare scacco a ogni mossa: gli scacchi inutili spesso fanno solo scappare il re verso il centro."
      ],
      sections: [
        {
          title: "Il metodo in tre fasi",
          paras: [
            "Fase 1: la donna si mette a un salto di cavallo dal re nemico, togliendogli metà della scacchiera. Fase 2: ogni volta che il re si sposta, la donna lo segue restando a salto di cavallo, finché il re finisce sul bordo. Fase 3: la donna si ferma su una traversa (o colonna) che chiude il re sul bordo, e il tuo re si avvicina.",
            "Quando il tuo re è di fronte al re nemico, con una casa in mezzo, la donna dà matto sul bordo oppure accanto al re, protetta dal tuo re."
          ]
        },
        {
          title: "Lo stallo: come evitarlo",
          paras: [
            "Lo stallo arriva quasi sempre nella fase 3, quando il re nemico ha solo due o tre case e la donna gliele toglie tutte. Il caso classico: re nero in h8, donna bianca in f7 o g6 senza scacco.",
            "La regola pratica: quando il re nemico è sul bordo, non avvicinare più la donna. Lascialo andare avanti e indietro tra due case e porta il tuo re."
          ]
        },
        {
          title: "La regola delle cinquanta mosse",
          paras: [
            "Se per cinquanta mosse di ciascun giocatore non c'è nessuna cattura e nessuna mossa di pedone, la partita può essere dichiarata patta. Con re e donna non è un problema, se si conosce il metodo; lo diventa se si danno scacchi a caso."
          ]
        }
      ],
      keyPoints: [
        "Donna a salto di cavallo dal re nemico per chiuderlo",
        "Re al bordo, poi avvicina il tuo re",
        "Controlla sempre di non dare stallo",
        "Niente scacchi inutili: restringi la gabbia"
      ],
      example: {
        fen: "7k/8/6K1/8/8/8/8/5Q2 w - - 0 1",
        steps: [
          { text: "Il re nero è nell'angolo. Attenzione: Df7?? sarebbe stallo, il re nero non avrebbe mosse.", marks: { f7: "bad" } },
          { move: "f1f8", text: "Df8#: la donna dà scacco sull'ottava traversa, il re bianco copre g7 e h7. Scacco matto." }
        ]
      },
      exercises: [
        {
          fen: "6k1/8/6K1/8/8/8/8/Q7 w - - 0 1",
          prompt: "Il tuo re copre le case davanti al re nero. Dà matto con la donna.",
          solution: ["a1a8"],
          explanation: "Da8#: la donna controlla l'ottava traversa, il re bianco copre f7, g7 e h7. Anche Dg7# funziona: la donna è protetta dal re."
        },
        {
          fen: "7k/8/4Q1K1/8/8/8/8/8 w - - 0 1",
          prompt: "Matto in una mossa, ma attento a non dare stallo.",
          solution: ["e6e8"],
          explanation: "De8# (anche Dc8# va bene). Df7?? invece lascerebbe il re nero senza mosse e senza scacco: stallo, cioè patta."
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
        "Con due torri si dà matto con la scala: una torre controlla una traversa, l'altra dà scacco sulla traversa successiva. A turno spingono il re fino al bordo.",
        "Con re e torre contro re solo serve l'aiuto del re: la torre taglia il re avversario, il tuo re si mette di fronte (opposizione) e la torre dà scacco sul bordo.",
        "In tutti questi finali ricorda: le torri vanno tenute lontane dal re avversario, così non le può attaccare. Se il re nemico si avvicina a una torre, spostala dall'altra parte della scacchiera mantenendo la linea.",
        "Il matto con re e torre richiede più pazienza di quello con la donna, ma il metodo è sempre lo stesso e si impara in mezz'ora: vale la pena saperlo fare senza pensarci."
      ],
      sections: [
        {
          title: "La scala con due torri",
          paras: [
            "Le torri lavorano in coppia su due traverse vicine (o due colonne vicine). Quella che non dà scacco tiene chiusa la traversa; l'altra salta oltre e dà scacco. Il re è costretto ad arretrare di una riga a ogni coppia di mosse.",
            "Se il re nemico si avvicina alla torre che deve muovere, portala all'estremo opposto della stessa traversa: continua a fare il suo lavoro da lontano."
          ]
        },
        {
          title: "Re e torre: il metodo della scatola",
          paras: [
            "La torre crea una scatola in cui il re nemico è chiuso, e a ogni occasione la rimpicciolisce di una riga o di una colonna. Il tuo re si avvicina per proteggere la torre e per togliere case al re avversario.",
            "Quando il re nemico è sul bordo e il tuo re gli sta di fronte, con una casa in mezzo, lo scacco di torre sul bordo è matto. Se il re nemico non è di fronte, fai una mossa di attesa con la torre lungo la sua linea: sarà costretto a mettersi in opposizione o a cedere altro spazio."
          ]
        },
        {
          title: "Gli errori tipici",
          paras: [
            "Lasciare la torre vicino al re avversario, che la cattura. Dare scacchi dal lato sbagliato, facendo uscire il re dalla scatola. Dimenticare lo stallo quando il re nemico è nell'angolo e ha una sola casa."
          ]
        }
      ],
      keyPoints: [
        "Due torri: una blocca, l'altra dà scacco",
        "Re e torre: re di fronte al re, torre sul bordo",
        "Torri lontane dal re nemico",
        "Mossa d'attesa con la torre per forzare l'opposizione"
      ],
      example: {
        fen: "8/8/3k4/R7/8/8/8/6KR w - - 0 1",
        steps: [
          { text: "La torre in a5 controlla la quinta traversa: il re nero non può scendere." },
          { move: "h1h6", text: "Th6+: la seconda torre dà scacco sulla sesta traversa." },
          { move: "d6e7", text: "Il re deve salire in settima." },
          { move: "a5a7", text: "Ta7+: ora è la prima torre a dare scacco, la seconda chiude la sesta." },
          { move: "e7e8", text: "Il re arriva sul bordo." },
          { move: "h6h8", text: "Th8#: la scala è completa." }
        ]
      },
      exercises: [
        {
          fen: "6k1/R7/8/8/8/8/8/1R4K1 w - - 0 1",
          prompt: "Una torre controlla la settima traversa. Dà matto con l'altra.",
          solution: ["b1b8"],
          explanation: "Tb8#: la torre in a7 impedisce al re di scendere, quella in b8 dà scacco sul bordo."
        },
        {
          fen: "6k1/8/6K1/8/8/8/8/R7 w - - 0 1",
          prompt: "Il tuo re è di fronte al re nero. Dà matto con la torre.",
          solution: ["a1a8"],
          explanation: "Ta8#: il re bianco copre f7, g7 e h7, la torre controlla tutta l'ottava traversa."
        }
      ],
      practice: { themes: ["mateIn1"], min: 600, max: 1100, count: 6, pass: 4 }
    },
    {
      id: "d-patta",
      grade: "D",
      title: "Stallo e patta: salvare mezzo punto",
      summary: "Stallo, scacco perpetuo, ripetizione e materiale insufficiente.",
      theory: [
        "Una partita non si perde solo con il matto, e non si vince solo con il materiale. Ci sono quattro modi di arrivare alla patta che ogni giocatore deve conoscere: lo stallo, lo scacco perpetuo, la triplice ripetizione e il materiale insufficiente.",
        "Lo stallo succede quando chi deve muovere non ha mosse legali e il suo re non è sotto scacco. La partita finisce subito, patta. È la risorsa preferita di chi sta perdendo, e l'incubo di chi sta vincendo.",
        "Lo scacco perpetuo è una serie di scacchi a cui l'avversario non può sfuggire. Di solito porta alla triplice ripetizione: quando la stessa posizione si ripete tre volte (con lo stesso giocatore al tratto) si può chiedere la patta.",
        "Infine, se nessuno dei due ha abbastanza materiale per dare matto (re contro re, re e alfiere contro re, re e cavallo contro re) la partita è patta automaticamente."
      ],
      sections: [
        {
          title: "Quando sei in svantaggio",
          paras: [
            "Prima di arrenderti cerca le risorse: puoi dare scacchi continui? Il tuo re ha poche mosse, e se i tuoi ultimi pezzi sparissero sarebbe stallo? Un pezzo che si offre dando scacco, in modo che catturarlo dia stallo, si chiama pezzo kamikaze o desperado.",
            "Nei finali di re e pedone, se il pedone avversario è sulla colonna a o h, al re che difende basta raggiungere l'angolo davanti al pedone: con il solo pedone di torre non si può vincere."
          ]
        },
        {
          title: "Quando sei in vantaggio",
          paras: [
            "Fai il controllo inverso: dopo la mia mossa, l'avversario ha ancora mosse legali? Ha scacchi a ripetizione contro il mio re? Mettere il re al riparo dagli scacchi prima di raccogliere il materiale è la tecnica più semplice per non farsi scappare la vittoria.",
            "Contro il re nell'angolo, lascia sempre almeno una casa libera finché non sei pronto a dare matto."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Quando analizzi una partita persa, controlla se c'era uno scacco perpetuo o uno stallo che ti era sfuggito. Succede molto più spesso di quanto si pensi, soprattutto nelle partite veloci."
          ]
        }
      ],
      keyPoints: [
        "Stallo: nessuna mossa legale e re non sotto scacco = patta",
        "Scacco perpetuo e triplice ripetizione salvano le partite perse",
        "In svantaggio cerca scacchi continui e stalli",
        "In vantaggio lascia sempre una mossa al re avversario"
      ],
      example: {
        fen: "1k6/1p6/8/8/3Q4/8/PPP3rq/1K6 w - - 0 1",
        steps: [
          { text: "Il Nero ha donna e torre contro la sola donna bianca, e minaccia Dg1+ con matto. Ma il re nero ha poche case: c'è uno scacco perpetuo.", marks: { b1: "bad" } },
          { move: "d4d8", text: "Dd8+: il re può andare solo in a7." },
          { move: "b8a7", text: "Ra7 forzata." },
          { move: "d8a5", text: "Da5+: scacco sulla colonna a. Il re deve tornare in b8." },
          { move: "a7b8", text: "Rb8 forzata." },
          { move: "a5d8", text: "Dd8+ di nuovo: la posizione si ripete all'infinito. Patta per scacco perpetuo, da una posizione persa." }
        ]
      },
      exercises: [
        {
          fen: "7k/7p/4Q2P/8/8/8/1r4PP/6K1 b - - 0 1",
          prompt: "Giochi con il Nero e hai solo una torre contro la donna. Il tuo re non ha mosse: trova la risorsa che salva la partita.",
          solution: ["b2g2"],
          explanation: "Txg2+!: se Rxg2 il Nero non ha più mosse legali e non è sotto scacco, quindi è stallo. Se il re bianco scappa, la torre continua a dare scacco e a offrirsi. Qualsiasi altra mossa perde."
        },
        {
          fen: "8/3k4/8/3K3P/8/8/8/8 b - - 0 1",
          prompt: "Giochi con il Nero: re e pedone di torre contro re. Trova la mossa che salva la partita.",
          solution: ["d7e7"],
          accept: ["d7e7", "d7e8"],
          explanation: "Re7 (o Re8): il re corre verso l'angolo h8 e il pedone di torre non può più vincere. Con Rc7? o Rd8? il re si allontana e il pedone promuove."
        },
        {
          fen: "6k1/6p1/8/8/4Q3/8/qr3PPP/6K1 w - - 0 1",
          prompt: "Il Nero ha donna e torre contro la tua donna e minaccia matto. Salva la partita.",
          solution: ["e4e8"],
          explanation: "De8+ Rh7 Dh5+ Rg8 De8+: il re nero non può sfuggire agli scacchi. Scacco perpetuo, patta. Qualsiasi altra mossa perde."
        }
      ]
    },

    /* ------------------------------------------------------------ grado C */
    {
      id: "c-inchiodatura",
      grade: "C",
      title: "L'inchiodatura",
      summary: "Un pezzo che non può muoversi senza scoprire qualcosa di più prezioso.",
      theory: [
        "Un pezzo è inchiodato quando sta davanti a un pezzo più prezioso, sulla stessa linea di un tuo alfiere, di una torre o della donna. Se si sposta, scopre il pezzo dietro.",
        "L'inchiodatura è assoluta quando dietro c'è il re: il pezzo non può proprio muoversi, perché la mossa sarebbe illegale. È relativa quando dietro c'è un altro pezzo, per esempio la donna: muoversi è legale ma costa caro.",
        "Un pezzo inchiodato è un bersaglio: attaccalo di nuovo, magari con un pedone. Non può scappare e chi lo difende spesso non basta.",
        "C'è anche un secondo effetto, meno visibile: un pezzo inchiodato non difende davvero. Se protegge una casa o un altro pezzo, quella protezione è solo apparente, perché catturare con il pezzo inchiodato è illegale o disastroso."
      ],
      sections: [
        {
          title: "Le inchiodature tipiche in apertura",
          paras: [
            "Ab5 contro il cavallo in c6 quando il re nero è ancora in e8; Ag5 contro il cavallo in f6 con la donna in d8 dietro; Ab4 contro il cavallo in c3. Sono inchiodature che si vedono in migliaia di partite: l'idea è aumentare la pressione sul pezzo bloccato, spesso con una spinta di pedone.",
            "Per liberarti hai tre strade: rompere la linea mettendo un pezzo in mezzo, spostare il pezzo più prezioso che sta dietro (per esempio arroccare), oppure attaccare il pezzo che inchioda per costringerlo a decidere."
          ]
        },
        {
          title: "Come sfruttarla",
          paras: [
            "Primo: aggiungi attaccanti sul pezzo inchiodato, soprattutto pedoni, che costano poco. Secondo: cerca le case che il pezzo inchiodato dovrebbe difendere e colpisci lì. Terzo: non avere fretta di catturare il pezzo che inchiodi, finché resta bloccato lavora per te.",
            "Attenzione all'inchiodatura relativa: l'avversario può rompere l'inchiodatura muovendo il pezzo con una minaccia più grande, per esempio uno scacco. Prima di contare sulla vittoria del materiale, controlla le sue mosse forzanti."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Nelle tue partite cerca le linee dove due pezzi avversari sono allineati con una casa che un tuo pezzo a lunga gittata può raggiungere. Spesso l'inchiodatura è già lì, a una mossa di distanza."
          ]
        }
      ],
      keyPoints: [
        "Inchiodatura assoluta: dietro c'è il re, il pezzo non si muove",
        "Attacca il pezzo inchiodato con forze in più, meglio un pedone",
        "Il pezzo inchiodato non difende davvero",
        "Alfieri, torri e donna creano le inchiodature"
      ],
      example: {
        fen: "4k3/8/2n5/8/3P4/8/8/4KB2 w - - 0 1",
        steps: [
          { text: "Il cavallo in c6 e il re in e8 sono sulla stessa diagonale b5-e8." },
          { move: "f1b5", text: "Ab5: il cavallo è inchiodato al re. Non può muoversi.", arrows: [{ from: "b5", to: "e8", color: "red" }] },
          { move: "e8d7", text: "Il Nero difende il cavallo con il re, ma il cavallo resta inchiodato." },
          { move: "d4d5", text: "d5: il pedone attacca il cavallo che non può scappare. Il Nero perde un pezzo." }
        ]
      },
      exercises: [
        {
          fen: "4k2r/pp3ppp/8/4q3/8/3Q4/PP3KPP/R7 w k - 0 1",
          prompt: "La donna nera e il re nero sono sulla stessa colonna. Sfruttalo.",
          solution: ["a1e1"],
          explanation: "Te1: la donna è inchiodata al re. Può solo catturare la torre, ma Dxe1+ Rxe1 e hai vinto la donna per una torre."
        },
        {
          fen: "r2q1r1k/pp3p1p/5np1/6N1/7Q/8/PB3PPP/R5K1 w - - 0 1",
          prompt: "Il cavallo in f6 sembra difendere h7. Ma è davvero libero di farlo? Trova il matto.",
          solution: ["h4h7"],
          explanation: "Dxh7#: la donna è protetta dal cavallo g5 e il cavallo f6 non può catturarla, perché è inchiodato al re in h8 dall'alfiere b2. Un pezzo inchiodato non difende."
        }
      ],
      practice: { themes: ["pin"], min: 600, max: 1400, count: 6, pass: 4 }
    },
    {
      id: "c-infilata",
      grade: "C",
      title: "L'infilata",
      summary: "Attacchi il pezzo grande, prendi quello dietro.",
      theory: [
        "L'infilata è un'inchiodatura al contrario: il pezzo di valore maggiore è davanti. Quando si sposta, il pezzo dietro resta scoperto e lo catturi.",
        "Succede spesso con il re davanti e la donna o una torre dietro, sulla stessa traversa, colonna o diagonale. Lo scacco obbliga il re a muoversi e l'infilata diventa forzata.",
        "Nei finali con torri e donne controlla sempre se il re avversario e un suo pezzo sono allineati: un solo scacco può vincere la partita.",
        "L'infilata funziona anche senza scacco: se attacchi la donna e dietro c'è una torre non difesa, la donna deve spostarsi e la torre cade. In quel caso però l'avversario può rispondere con una minaccia più grande, quindi controlla le sue mosse forzanti."
      ],
      sections: [
        {
          title: "Dove nascono le infilate",
          paras: [
            "Re al centro con la donna sulla stessa diagonale; re e torre sulla stessa traversa nei finali; due torri non collegate sulla stessa colonna. Sono situazioni che si creano da sole quando i pezzi si muovono senza controllare le linee.",
            "Nei finali di torre il motivo più famoso è il trucco della torre: torre davanti al pedone in settima e scacco laterale che, se il re avversario è sulla traversa sbagliata, vince la torre nemica."
          ]
        },
        {
          title: "Come evitarle",
          paras: [
            "Quando sposti il re o la donna, guarda le linee che restano aperte tra loro e i tuoi pezzi non difesi. Una regola semplice nei finali: non mettere il re sulla stessa traversa o colonna della tua torre, se l'avversario ha una torre libera di dare scacco."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Negli esercizi chiediti sempre: quali pezzi avversari sono allineati? Da quale casa un mio pezzo li attacca entrambi in fila? Con l'abitudine queste linee si vedono al primo sguardo."
          ]
        }
      ],
      keyPoints: [
        "Pezzo prezioso davanti, bersaglio dietro",
        "Lo scacco rende l'infilata forzata",
        "Attenzione a re e donna sulla stessa linea",
        "Nei finali controlla re e torre allineati"
      ],
      example: {
        fen: "8/8/8/q2k4/8/8/6K1/7R w - - 0 1",
        steps: [
          { text: "Re nero in d5 e donna in a5 sulla quinta traversa. La torre può arrivare in h5." },
          { move: "h1h5", text: "Th5+: scacco sulla quinta traversa.", arrows: [{ from: "h5", to: "a5", color: "red" }] },
          { move: "d5c4", text: "Il re deve lasciare la traversa." },
          { move: "h5a5", text: "Txa5: la donna era dietro al re. Infilata riuscita." }
        ]
      },
      exercises: [
        {
          fen: "6r1/6pp/8/3k4/8/8/5PPP/3B2K1 w - - 0 1",
          prompt: "Il re nero in d5 e la torre in g8 sono sulla stessa diagonale. Vinci la torre.",
          solution: ["d1b3"],
          explanation: "Ab3+: scacco sulla diagonale a2-g8. Il re deve spostarsi e l'alfiere cattura la torre in g8."
        },
        {
          fen: "8/7q/8/8/4k3/8/B4PPP/3R2K1 w - - 0 1",
          prompt: "Re nero in e4, donna nera in h7: trova la casa da cui l'alfiere li infila.",
          solution: ["a2b1"],
          explanation: "Ab1+: l'alfiere dà scacco sulla diagonale b1-h7. Il re si sposta e Axh7 vince la donna."
        }
      ],
      practice: { themes: ["skewer"], min: 400, max: 1400, count: 6, pass: 4 }
    },
    {
      id: "c-scoperta",
      grade: "C",
      title: "Attacco di scoperta e scacco doppio",
      summary: "Muovi un pezzo e ne liberi un altro.",
      theory: [
        "In un attacco di scoperta muovi un pezzo che stava davanti a un tuo alfiere, torre o donna. Il pezzo che si sposta fa una minaccia e quello dietro ne fa un'altra: due attacchi con una mossa.",
        "Lo scacco di scoperta è ancora più forte: il pezzo dietro dà scacco, quindi quello che si muove può andare dove vuole, anche a prendere la donna, perché l'avversario deve prima occuparsi del re.",
        "Lo scacco doppio è il caso estremo: sia il pezzo che si muove sia quello scoperto danno scacco. L'unica risposta possibile è muovere il re; se il re non ha case, è matto.",
        "Una coppia di pezzi allineati (la batteria) è come un'arma carica. Quando ne vedi una puntata verso il re o la donna avversaria, cerca la mossa del pezzo davanti che crea una seconda minaccia."
      ],
      sections: [
        {
          title: "Le batterie più comuni",
          paras: [
            "Torre dietro un cavallo sulla colonna del re avversario; alfiere dietro un cavallo sulla diagonale lunga verso il re arroccato; donna dietro un alfiere sulla diagonale b1-h7 contro h7. In tutte, il pezzo davanti è il grilletto.",
            "Il pezzo davanti dovrebbe muoversi con una minaccia sua: uno scacco, un attacco alla donna, una cattura. Se si sposta senza minacciare nulla, l'avversario ha il tempo di parare l'unico attacco."
          ]
        },
        {
          title: "Una trappola d'apertura famosa",
          paras: [
            "Nella Difesa Russa (1.e4 e5 2.Cf3 Cf6) chi copia le mosse dell'avversario può cadere in una scoperta: dopo 3.Cxe5 Cxe4? 4.De2 Cf6?? 5.Cc6+ il cavallo dà scacco di scoperta con la donna sulla colonna e e attacca la donna nera. Il Nero perde la donna.",
            "La lezione: quando l'avversario mette la donna sulla colonna del tuo re, controlla subito che cosa può fare il pezzo che sta in mezzo."
          ]
        },
        {
          title: "Come difendersi",
          paras: [
            "Togli il re o la donna dalla linea della batteria prima che scatti, oppure attacca il pezzo davanti in modo che debba muoversi senza minacce. E non lasciare pezzi indifesi nel raggio d'azione del pezzo che può saltare via."
          ]
        }
      ],
      keyPoints: [
        "Pezzo davanti + pezzo a lunga gittata dietro = arma carica",
        "Scacco di scoperta: il pezzo che si muove è libero",
        "Scacco doppio: si risponde solo muovendo il re",
        "Il pezzo davanti deve muoversi con una minaccia sua"
      ],
      example: {
        fen: "4k3/1q6/8/8/4N3/8/8/4R1K1 w - - 0 1",
        steps: [
          { text: "La torre in e1 è dietro al cavallo, sulla colonna del re nero. La donna nera è in b7." },
          { move: "e4d6", text: "Cd6++: scacco doppio, dal cavallo e dalla torre. Il cavallo attacca anche la donna.", arrows: [{ from: "e1", to: "e8", color: "red" }, { from: "d6", to: "b7", color: "red" }] },
          { move: "e8d8", text: "L'unica difesa è muovere il re." },
          { move: "d6b7", text: "Cxb7+: la donna è presa." }
        ]
      },
      exercises: [
        {
          fen: "rnbqkb1r/pppp1ppp/5n2/4N3/8/8/PPPPQPPP/RNB1KB1R w KQkq - 2 5",
          prompt: "Difesa Russa: il Nero ha appena ritirato il cavallo in f6. La tua donna è sulla colonna del re nero. Punisci.",
          solution: ["e5c6"],
          explanation: "Cc6+: scacco di scoperta della donna e2 sul re in e8, e il cavallo attacca la donna d8. Il Nero deve parare lo scacco e perde la donna."
        },
        {
          fen: "7k/5p1p/6p1/q3N3/8/8/1B3PPP/6K1 w - - 0 1",
          prompt: "L'alfiere b2 è dietro al cavallo, sulla diagonale del re nero. Vinci la donna.",
          solution: ["e5c4"],
          accept: ["e5c4", "e5c6"],
          explanation: "Cc4+ (o Cc6+): il cavallo scopre lo scacco dell'alfiere e intanto attacca la donna in a5. Il Nero para lo scacco e la donna cade."
        },
        {
          fen: "rn1qkb1r/pppb1ppp/8/8/4N3/8/PPP2PPP/R1BQR1K1 w kq - 0 1",
          prompt: "Torre in e1, cavallo in e4, re nero in e8 senza case libere. Matto in una.",
          solution: ["e4f6"],
          accept: ["e4f6", "e4d6"],
          explanation: "Cf6# (o Cd6#): scacco doppio di cavallo e torre. Il Nero non può catturare il cavallo né interporsi sulla colonna, e il re non ha case: d7 e f7 sono occupate, e7 è sulla colonna della torre."
        }
      ],
      practice: { themes: ["discoveredAttack", "doubleCheck"], min: 600, max: 1600, count: 6, pass: 4 }
    },
    {
      id: "c-matto-in-due",
      grade: "C",
      title: "Matto in due",
      summary: "La prima mossa forza, la seconda chiude.",
      theory: [
        "Nei matti in due la prima mossa è quasi sempre forzante: uno scacco, una cattura o un sacrificio che l'avversario deve accettare. Lo scopo è togliere al re una casa di fuga o eliminare un difensore.",
        "Metodo: elenca le case di fuga del re e i pezzi che lo difendono. Poi cerca la mossa che toglie una delle due cose. Spesso si sacrifica un pezzo per attirare un difensore lontano o per attirare il re su una casa peggiore.",
        "Quando provi una variante, considera tutte le risposte dell'avversario, non solo quella che speri. Un matto in due è corretto solo se funziona contro ogni difesa.",
        "Non avere paura dei sacrifici di donna: nei matti in due sono frequentissimi, perché la donna è il pezzo che più spesso può dare scacco o catturare con forza."
      ],
      sections: [
        {
          title: "Gli schemi che tornano",
          paras: [
            "Matto del corridoio con eliminazione del difensore: la prima torre si sacrifica sulla traversa, la seconda dà matto. Matto di Anastasia: cavallo in e7 che controlla g8 e g6, sacrificio di donna in h7 e torre sulla colonna h. Matto di Légal: sacrificio di donna e matto con i pezzi minori.",
            "Imparare questi schemi a memoria è utile: quando li riconosci, il calcolo diventa una semplice verifica."
          ]
        },
        {
          title: "La verifica",
          paras: [
            "Trovata l'idea, controlla tre cose: il re può scappare su una casa che non avevi visto? Un pezzo avversario può interporsi? Qualcuno può catturare il tuo pezzo che dà matto? Se la risposta è sempre no, gioca.",
            "Molti errori nascono dall'ultima mossa avversaria immaginata male: un pedone che può spingere e aprire una casa, un pezzo lontano che può tornare a difendere."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Risolvi i matti in due senza muovere i pezzi, scrivendo o dicendo la variante completa prima di provarla. È il primo vero allenamento di calcolo."
          ]
        }
      ],
      keyPoints: [
        "Prima mossa: scacco, cattura o sacrificio",
        "Togli case di fuga o elimina il difensore",
        "Verifica tutte le risposte dell'avversario",
        "I sacrifici di donna sono la norma, non l'eccezione"
      ],
      example: {
        fen: "r5k1/5ppp/8/8/8/8/3R1PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "La torre in a8 difende l'ottava traversa. Hai due torri sulla colonna d." },
          { move: "d2d8", text: "Td8+: la prima torre attira la torre nera.", arrows: [{ from: "d1", to: "d8", color: "green" }] },
          { move: "a8d8", text: "Txd8 è forzata." },
          { move: "d1d8", text: "Txd8#: il difensore è sparito, matto del corridoio." }
        ]
      },
      exercises: [
        {
          fen: "3r1r1k/ppq1Nppp/8/7Q/8/3R4/PP3PPP/6K1 w - - 0 1",
          prompt: "Il cavallo in e7 controlla g8 e g6. Matto in due.",
          solution: ["h5h7", "h8h7", "d3h3"],
          explanation: "Dxh7+! Rxh7 Th3#: il matto di Anastasia. Il re in h7 non ha case: g8 e g6 sono del cavallo, la colonna h è della torre, g7 è occupata dal suo pedone."
        },
        {
          fen: "rn1qkbnr/ppp2p1p/3p2p1/4N3/2B1P3/2N5/PPPP1PPP/R1BbK2R w KQkq - 0 6",
          prompt: "Il Nero ha appena catturato la tua donna in d1. Fagliela pagare: matto in due.",
          solution: ["c4f7", "e8e7", "c3d5"],
          explanation: "Axf7+ Re7 Cd5#: il matto di Légal. Il re in e7 è circondato dai suoi pezzi e dalle case controllate dai tuoi tre pezzi minori."
        }
      ],
      practice: { themes: ["mateIn2"], min: 800, max: 1400, count: 6, pass: 4 }
    },
    {
      id: "c-forchette-avanzate",
      grade: "C",
      title: "Forchette di pedone e di donna",
      summary: "Tutti i pezzi possono fare un attacco doppio.",
      theory: [
        "Non solo il cavallo: anche un pedone che avanza può attaccare due pezzi insieme, e un pedone vale meno di qualsiasi pezzo. La forchetta di pedone è spesso decisiva, perché anche se l'avversario lo cattura ha comunque perso un pezzo per un pedone.",
        "La donna fa forchette in tutte le direzioni, ma attenzione: vale tanto, quindi la forchetta funziona solo se la casa su cui va non è attaccata. Le forchette di donna più comuni attaccano il re con uno scacco e un pezzo non difeso dall'altra parte della scacchiera.",
        "Anche torre, alfiere e re possono fare forchette: il re soprattutto nei finali, quando si avvicina a due pedoni o pezzi avversari non protetti.",
        "Per vedere le forchette guarda le coppie di pezzi avversari sulla stessa traversa, diagonale o a distanza di salto di cavallo, soprattutto se non sono difesi. I pezzi non difesi sono i bersagli preferiti di ogni attacco doppio."
      ],
      sections: [
        {
          title: "La forchetta di pedone",
          paras: [
            "Due pezzi avversari su case vicine della stessa traversa, con una casa libera tra loro più avanti di un passo: è l'occasione per la forchetta di pedone. In apertura succede spesso con i cavalli in c6 ed e6 (o c3 ed e3) e una spinta in d5 (d4).",
            "Prima di spingere controlla che il pedone non possa essere catturato da un pezzo avversario: se è protetto da un tuo pedone o da un pezzo, la forchetta è quasi sempre vincente."
          ]
        },
        {
          title: "La forchetta di donna",
          paras: [
            "Gli schemi da ricordare: Da4+ o Db5+ (per il Nero ...Da5+ o ...Db4+) che attaccano il re e un pezzo non difeso; De4 o Dd5 al centro che attaccano due pezzi sui lati. Più la donna è centrale, più direzioni controlla.",
            "La regola d'oro: prima di saltare con la donna, verifica che la casa d'arrivo non sia attaccata da un pezzo di valore inferiore."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Abituati a notare i pezzi non difesi dell'avversario: dopo ogni sua mossa contali. Se sono due o più, c'è quasi sempre un attacco doppio da qualche parte."
          ]
        }
      ],
      keyPoints: [
        "Il pedone fa forchette che costano poco",
        "La donna: forchetta solo su una casa sicura",
        "Cerca coppie di pezzi allineati o non difesi",
        "Nei finali anche il re fa forchette"
      ],
      example: {
        fen: "4k3/8/2n1b3/8/3P4/8/8/4K3 w - - 0 1",
        steps: [
          { text: "Cavallo in c6 e alfiere in e6: c'è una casa da cui un pedone li attacca entrambi.", marks: { d5: "hint" } },
          { move: "d4d5", text: "d5!: il pedone attacca cavallo e alfiere. Il Nero ne salva uno solo.", arrows: [{ from: "d5", to: "c6", color: "red" }, { from: "d5", to: "e6", color: "red" }] }
        ]
      },
      exercises: [
        {
          fen: "q3k3/8/8/1N6/8/8/PP6/4K3 w - - 0 1",
          prompt: "Re in e8 e donna in a8: trova la forchetta.",
          solution: ["b5c7"],
          explanation: "Cc7+: scacco al re e attacco alla donna. Dopo la mossa del re prendi la donna."
        },
        {
          fen: "r1bqkb1r/pppp1ppp/2n1n3/8/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5",
          prompt: "I due cavalli neri sono in c6 ed e6. Trova la forchetta di pedone.",
          solution: ["d4d5"],
          explanation: "d5: il pedone attacca entrambi i cavalli e nessun pezzo nero lo può catturare. Il Nero ne salva uno solo e perde un pezzo."
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
        "Un pezzo è sovraccarico quando deve difendere due cose insieme. Se lo costringi a occuparsi di una, l'altra resta scoperta.",
        "La deviazione è la mossa (spesso un sacrificio o uno scacco) che allontana il difensore dalla casa importante. Funziona perché l'avversario è obbligato a rispondere: se non cattura, perde qualcosa di peggio.",
        "Parente stretta è l'eliminazione del difensore: invece di allontanarlo, lo catturi. Se un cavallo è l'unico pezzo che difende il re, cambiarlo anche al prezzo di un pezzo può aprire la strada al matto.",
        "Quando vedi un pezzo avversario che difende due cose, chiediti: posso attaccare una delle due in modo che sia costretto a muoversi? Posso catturarlo, anche dando qualcosa in cambio?"
      ],
      sections: [
        {
          title: "Come riconoscere il sovraccarico",
          paras: [
            "Per ogni pezzo avversario elenca quello che difende: pezzi, pedoni, case vicine al re. Se compare due volte con compiti importanti (per esempio difende una torre e la casa di matto), hai trovato il bersaglio.",
            "Il caso più frequente è il difensore dell'ultima traversa: una torre o una donna che deve impedire il matto del corridoio e intanto difende un altro pezzo."
          ]
        },
        {
          title: "L'ordine delle mosse",
          paras: [
            "Nelle combinazioni di deviazione l'ordine conta: di solito si comincia con la mossa più forzante (lo scacco o la cattura che costringe a riprendere) e solo dopo si colpisce il bersaglio rimasto scoperto. Invertire l'ordine dà all'avversario il tempo di sistemare tutto, o di contrattaccare.",
            "Prima di giocare, controlla anche le risorse dell'avversario: dopo la tua prima mossa ha uno scacco, una cattura con scacco o una minaccia di matto?"
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Negli esercizi, prima di cercare la mossa, fai l'elenco dei difensori del re e dei pezzi importanti dell'avversario. Il sacrificio giusto spesso salta fuori da solo."
          ]
        }
      ],
      keyPoints: [
        "Un difensore, due compiti = sovraccarico",
        "Devia il difensore con uno scacco o un sacrificio",
        "Oppure eliminalo: cattura il pezzo che difende",
        "Prima la mossa più forzante, poi il bersaglio"
      ],
      example: {
        fen: "r4rk1/pp2bppp/4pn2/6B1/7Q/3B4/PPP2PPP/R5K1 w - - 0 1",
        steps: [
          { text: "Donna in h4 e alfiere in d3 puntano su h7. L'unico pezzo che lo difende è il cavallo in f6.", arrows: [{ from: "h4", to: "h7", color: "green" }, { from: "d3", to: "h7", color: "green" }, { from: "f6", to: "h7", color: "red" }] },
          { move: "g5f6", text: "Axf6!: elimini il difensore. Ora minacci Dxh7 matto." },
          { move: "e7f6", text: "Se il Nero riprende con l'alfiere, h7 resta senza difesa." },
          { move: "h4h7", text: "Dxh7#: la donna, protetta dall'alfiere d3, dà matto. Anche dopo gxf6 il matto sarebbe lo stesso; la difesa migliore del Nero era ...g6, ma perdeva comunque un pezzo." }
        ]
      },
      exercises: [
        {
          fen: "4r1k1/p1bq1pp1/1p5p/8/2Q5/B6P/PP3PP1/4R1K1 w - - 0 1",
          prompt: "La donna nera difende sia la torre in e8 sia l'alfiere in c7. Sfrutta il sovraccarico.",
          solution: ["e1e8", "d7e8", "c4c7"],
          explanation: "Txe8+ Dxe8 Dxc7: la donna nera ha dovuto riprendere in e8 e non difende più l'alfiere. Dxc7 subito sarebbe stato un errore: Txe1+ e il Nero vince."
        },
        {
          fen: "4r1k1/5ppp/8/4q3/8/8/1Q3PPP/3R2K1 w - - 0 1",
          prompt: "La torre in e8 difende la donna e l'ottava traversa. Trova la mossa che vince.",
          solution: ["b2e5"],
          explanation: "Dxe5!: se Txe5, Td8+ Te8 Txe8#. La torre non può fare due lavori insieme: o riprende la donna o difende la traversa. Il Nero resta con una donna in meno."
        }
      ],
      practice: { themes: ["sacrifice"], min: 1000, max: 1500, count: 6, pass: 4 }
    },
    {
      id: "c-mossa-intermedia",
      grade: "C",
      title: "La mossa intermedia",
      summary: "Prima di riprendere, guarda se c'è qualcosa di meglio.",
      theory: [
        "Quando l'avversario cattura un tuo pezzo, la reazione automatica è riprendere. Ma la ripresa non è obbligatoria: a volte esiste una mossa più forte da giocare prima, uno scacco o una minaccia, e solo dopo si riprende. Questa è la mossa intermedia (in tedesco Zwischenzug).",
        "La mossa intermedia funziona quando è forzante: l'avversario deve rispondere a lei, e intanto la tua ripresa resta disponibile. Il risultato tipico è un pezzo vinto, un tempo guadagnato o un re spostato su una casa peggiore.",
        "Lo stesso vale in difesa: se l'avversario ti attacca un pezzo o ti offre uno scambio, prima di rispondere nel modo ovvio controlla se hai uno scacco o una cattura che cambia il conto.",
        "Per vedere le mosse intermedie basta applicare la routine anche nei momenti di tensione: dopo ogni cattura dell'avversario, prima di riprendere, guarda i tuoi scacchi, le tue catture e le tue minacce."
      ],
      sections: [
        {
          title: "Le situazioni tipiche",
          paras: [
            "Scambi in serie, in cui chi inserisce uno scacco al momento giusto cambia il risultato finale. Pezzi che si attaccano a vicenda, in cui prima di salvare il tuo puoi catturare l'altro con tempo. Promozioni, in cui uno scacco intermedio porta il pedone a promuovere con guadagno di tempo.",
            "Due trappole d'apertura famose si basano su questa idea: la trappola dell'elefante nel Gambetto di Donna rifiutato e la trappola di Lasker nel Controgambetto Albin. Le trovi negli esercizi."
          ]
        },
        {
          title: "Il trucco della forchetta",
          paras: [
            "Nella Partita dei Quattro Cavalli con Ac4 il Nero può giocare ...Cxe4: dopo Cxe4 non riprende subito, ma gioca ...d5!, una forchetta di pedone che attacca alfiere e cavallo. Recupera il pezzo e libera il gioco.",
            "Idee come questa si memorizzano una volta e si usano per sempre: in apertura i motivi intermedi si ripetono in molte varianti."
          ]
        },
        {
          title: "Gli errori tipici",
          paras: [
            "Riprendere in automatico senza guardare. Giocare una mossa intermedia che non è forzante: l'avversario la ignora, si salva il pezzo e tu non hai più la ripresa. Dimenticare che anche l'avversario può rispondere con una sua mossa intermedia."
          ]
        }
      ],
      keyPoints: [
        "La ripresa non è obbligatoria",
        "La mossa intermedia deve essere forzante",
        "Dopo ogni cattura avversaria: scacchi, catture, minacce",
        "Anche l'avversario può avere la sua mossa intermedia"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Il trucco della forchetta, un classico dei Quattro Cavalli." },
          { move: "e2e4", text: "1.e4." },
          { move: "e7e5", text: "1...e5." },
          { move: "g1f3", text: "2.Cf3." },
          { move: "b8c6", text: "2...Cc6." },
          { move: "f1c4", text: "3.Ac4." },
          { move: "g8f6", text: "3...Cf6." },
          { move: "b1c3", text: "4.Cc3: il Bianco sviluppa, ma il pedone e4 resta difeso solo dal cavallo." },
          { move: "f6e4", text: "4...Cxe4!: il Nero prende il pedone e offre il cavallo." },
          { move: "c3e4", text: "5.Cxe4: il Bianco riprende e ha un pezzo in più. Per ora." },
          { move: "d7d5", text: "5...d5!: la mossa intermedia. Il pedone attacca alfiere e cavallo insieme.", arrows: [{ from: "d5", to: "c4", color: "red" }, { from: "d5", to: "e4", color: "red" }] },
          { move: "c4d3", text: "6.Ad3: l'alfiere si salva difendendo il cavallo." },
          { move: "d5e4", text: "6...dxe4." },
          { move: "d3e4", text: "7.Axe4: il materiale è di nuovo pari e il Nero ha un bel centro. Senza ...d5 sarebbe rimasto con un pezzo in meno." }
        ]
      },
      exercises: [
        {
          fen: "r1bBkb1r/pppn1ppp/8/3n4/3P4/8/PP2PPPP/R2QKBNR b KQkq - 0 7",
          prompt: "Trappola dell'elefante: il Bianco ha appena preso la tua donna in d8. Non riprendere subito.",
          solution: ["f8b4", "d1d2", "b4d2", "e1d2", "e8d8"],
          explanation: "...Ab4+! (la mossa intermedia) Dd2 Axd2+ Rxd2 Rxd8: le donne sono sparite e tu hai un pezzo in più per un pedone. Con ...Rxd8 subito avresti avuto solo due pezzi minori contro donna e pedone, e il vantaggio sarebbe stato del Bianco."
        },
        {
          fen: "rnbqk1nr/ppp2ppp/8/4P3/1BP5/4p3/PP3PPP/RN1QKBNR b KQkq - 0 6",
          prompt: "Controgambetto Albin: il Bianco ha preso il tuo alfiere in b4. Invece di riprendere, c'è di meglio.",
          solution: ["e3f2", "e1e2", "f2g1n"],
          explanation: "...exf2+! Re2 fxg1=C+!: la trappola di Lasker. Dopo lo scacco intermedio il pedone promuove a cavallo, con scacco: a donna non darebbe scacco e il Bianco cambierebbe le donne con Dxd8+ prima di riprendere in g1. Se ora Txg1, ...Ag4+ vince la donna bianca."
        }
      ]
    },
    {
      id: "c-aperture",
      grade: "C",
      title: "I principi d'apertura",
      summary: "Centro, sviluppo, arrocco: in quest'ordine.",
      theory: [
        "Le prime 10-12 mosse servono a preparare la battaglia. Tre principi: controlla il centro con i pedoni (e4, d4), sviluppa cavalli e alfieri verso il centro, arrocca presto per mettere il re al sicuro.",
        "Errori tipici: muovere lo stesso pezzo più volte, uscire con la donna troppo presto (diventa un bersaglio e fai perdere tempo a te stesso), muovere troppi pedoni sul lato del re.",
        "Non serve imparare a memoria lunghe varianti. Se ogni mossa sviluppa un pezzo, controlla il centro o mette al sicuro il re, arriverai al mediogioco con una buona posizione.",
        "Il tempo conta: in apertura ogni mossa è un mattone. Chi finisce lo sviluppo per primo può aprire il gioco e attaccare, mentre l'altro ha ancora pezzi a casa. Per questo un pedone preso al prezzo di tre mosse di donna è spesso un cattivo affare."
      ],
      sections: [
        {
          title: "Il centro",
          paras: [
            "Le case e4, d4, e5, d5 sono il cuore della scacchiera: un pezzo al centro controlla più case e può andare rapidamente su entrambi i lati. Puoi occupare il centro con i pedoni (stile classico) oppure controllarlo da lontano con pezzi e pedoni laterali, come nelle aperture moderne.",
            "Se l'avversario ti lascia il centro gratis, prendilo: due pedoni in e4 e d4 tolgono spazio ai suoi pezzi."
          ]
        },
        {
          title: "Un ordine semplice per lo sviluppo",
          paras: [
            "Pedone centrale, cavallo del lato di re, alfiere del lato di re, arrocco, poi cavallo e alfiere dell'altro lato, poi la donna su una casa modesta (e2, d2, c2) e le torri al centro. I cavalli di solito prima degli alfieri, perché le loro case migliori (f3, c3) si conoscono già.",
            "Alla fine dello sviluppo le torri devono essere collegate, cioè senza pezzi in mezzo tra loro sulla prima traversa."
          ]
        },
        {
          title: "Quando infrangere le regole",
          paras: [
            "I principi sono una guida, non una legge. Si muove di nuovo un pezzo già sviluppato se vince materiale o se l'avversario minaccia qualcosa; si esce con la donna se c'è un motivo concreto. La domanda da farsi è sempre la stessa: questa mossa fa qualcosa di più utile dello sviluppo?"
          ]
        }
      ],
      keyPoints: [
        "Pedoni centrali, poi cavalli e alfieri",
        "Arrocca entro le prime 10 mosse",
        "Non muovere lo stesso pezzo due volte senza motivo",
        "Alla fine dello sviluppo: torri collegate"
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
          prompt: "Hai sviluppato alfiere e cavallo. È il momento di mettere il re al sicuro.",
          solution: ["e1g1"],
          accept: ["e1g1", "c2c3", "b1c3"],
          explanation: "O-O mette il re al sicuro e porta la torre verso il centro. Anche c3 o Cc3 vanno bene, ma l'arrocco è la mossa più semplice."
        }
      ]
    },
    {
      id: "c-italiana",
      grade: "C",
      title: "Apertura: la Partita Italiana",
      summary: "Un'apertura semplice e solida da giocare con il Bianco.",
      theory: [
        "La Partita Italiana nasce dopo 1.e4 e5 2.Cf3 Cc6 3.Ac4. L'alfiere punta su f7, la casa più debole del Nero all'inizio, e prepara l'arrocco veloce.",
        "Il piano classico è semplice: c3 e d3 (o d4) per costruire il centro, arrocco, torre in e1, poi il cavallo di b1 va in d2, f1 e g3 per partecipare all'attacco sul lato di re.",
        "Non serve correre: nella Italiana lenta (con d3) si vince con la posizione migliore dei pezzi. Evita di attaccare con la donna troppo presto e non giocare Cg5 senza un motivo concreto: muovere due volte lo stesso cavallo in apertura costa tempo.",
        "Con il Nero le risposte principali sono 3...Ac5 (la Giuoco Piano, con piani simmetrici) e 3...Cf6 (la Difesa dei Due Cavalli, più tattica). Contro entrambe il piano con c3 e d3 resta valido."
      ],
      sections: [
        {
          title: "I piani del Bianco",
          paras: [
            "Piano lento: c3, d3, O-O, Te1, Cbd2-f1-g3, h3 e magari a4 per guadagnare spazio sull'ala di donna. L'alfiere c4 spesso si ritira in b3 o c2 per non essere scambiato da ...Ca5 o ...Ce7-...d5.",
            "Piano centrale: c3 e d4 subito, per conquistare il centro. È più ambizioso ma lascia più tattica: se il Nero cambia in d4, il Bianco riprende con il pedone c e ottiene un bel centro."
          ]
        },
        {
          title: "Le idee del Nero",
          paras: [
            "Il Nero vuole liberarsi con ...d5 al momento giusto, oppure piazzare l'alfiere in a7 o b6 e giocare ...d6, ...h6 (contro Ag5) e ...Ce7-g6. L'idea ...Ca5 per cambiare l'alfiere c4 è sempre da tenere d'occhio.",
            "Per il Bianco la regola è: se il Nero gioca ...d5 e tu hai preparato bene, il centro si apre a tuo favore; se l'hai trascurato, il Nero si libera e la partita diventa pari."
          ]
        },
        {
          title: "Errori tipici del principiante",
          paras: [
            "Cg5 e Axf7+ senza calcolo, nella speranza di un attacco rapido. Dimenticare l'arrocco per inseguire un pedone. Giocare h3 e a3 troppo presto, perdendo tempi di sviluppo. Nell'Italiana lenta la pazienza è un'arma."
          ]
        }
      ],
      keyPoints: [
        "1.e4 e5 2.Cf3 Cc6 3.Ac4: alfiere su f7",
        "c3 e d3/d4, arrocco, Te1",
        "Cavallo b1-d2-f1-g3 verso il re avversario",
        "Attenzione a ...d5 e a ...Ca5 del Nero"
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
          { move: "f1e1", text: "7.Te1: la torre sostiene il centro. Ora Cbd2-f1-g3 e il piano è completo." }
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
          prompt: "Hai giocato c3 e il Nero attacca e4: continua con il piano.",
          solution: ["d2d4"],
          accept: ["d2d4", "d2d3"],
          explanation: "d4 è il seguito naturale di c3 e conquista il centro; d3 difende e4 con calma. Attenzione all'arrocco: dopo O-O il Nero prende in e4 e il pedone è perso."
        }
      ]
    },
    {
      id: "c-trappole",
      grade: "C",
      title: "Trappole d'apertura",
      summary: "Il matto del barbiere, il matto di Légal e come difendersi.",
      theory: [
        "Molte partite tra principianti finiscono in poche mosse per lo stesso motivo: il punto f7 (f2 per il Bianco) è difeso solo dal re all'inizio.",
        "Il matto del barbiere arriva con donna e alfiere che attaccano insieme f7. Per difendersi basta coprire f7 o bloccare l'attacco della donna: g6, De7 o Df6.",
        "Se l'avversario esce presto con la donna, non spaventarti: sviluppa i pezzi attaccandola. Ogni volta che deve scappare tu guadagni tempo.",
        "Conoscere le trappole serve soprattutto a non caderci. Usarle contro l'avversario va bene solo se la mossa che le prepara è anche una buona mossa: una trappola che peggiora la tua posizione, contro chi la conosce, ti fa solo perdere."
      ],
      sections: [
        {
          title: "Il matto di Légal",
          paras: [
            "1.e4 e5 2.Cf3 d6 3.Ac4 Ag4 4.Cc3 g6? 5.Cxe5! Il Bianco sembra regalare la donna, inchiodata dall'alfiere g4. Ma se 5...Axd1?? segue 6.Axf7+ Re7 7.Cd5#: tre pezzi minori danno matto al re circondato dai suoi pezzi.",
            "Se il Nero non prende la donna, ha comunque perso un pedone. La lezione per chi difende: un'inchiodatura relativa non è un muro, il pezzo inchiodato può muoversi se la contropartita è più grande."
          ]
        },
        {
          title: "La trappola del cavallo in d4",
          paras: [
            "1.e4 e5 2.Cf3 Cc6 3.Ac4 Cd4!? è una mossa dubbia ma insidiosa: se il Bianco prende il pedone con 4.Cxe5?, il Nero gioca 4...Dg5! e attacca insieme il cavallo e il pedone g2. Il seguito naturale 5.Cxf7 Dxg2 6.Tf1 Dxe4+ 7.Ae2 Cf3# è un matto da ricordare.",
            "Per il Bianco la risposta sana a 3...Cd4 è semplice: 4.Cxd4 exd4 5.c3 o 5.O-O, con un bel vantaggio di sviluppo."
          ]
        },
        {
          title: "Come non cadere nelle trappole",
          paras: [
            "Dopo ogni mossa dell'avversario chiediti che cosa minaccia, soprattutto se ha appena offerto un pezzo. Un regalo in apertura è sospetto: prima di accettarlo controlla gli scacchi e le catture che seguono."
          ]
        }
      ],
      keyPoints: [
        "f7 e f2 sono i punti deboli all'inizio",
        "Contro Dh5 + Ac4: g6, De7 o Df6",
        "Attacca la donna uscita presto con i pezzi in sviluppo",
        "Un pezzo regalato in apertura va controllato due volte"
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
          explanation: "Dxf7#: la donna è protetta dall'alfiere e il re non ha case libere."
        },
        {
          fen: "rn1qkbnr/ppp2p1p/3p2p1/4p3/2B1P1b1/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 5",
          prompt: "Il Nero ha giocato 4...g6?, una mossa lenta. Il tuo cavallo f3 è inchiodato alla donna, ma c'è un colpo.",
          solution: ["f3e5"],
          explanation: "Cxe5!: se 5...Axd1?? 6.Axf7+ Re7 7.Cd5# (il matto di Légal); se 5...dxe5 6.Dxg4 e il Bianco ha vinto un pedone con un'ottima posizione."
        },
        {
          fen: "r1bqkbnr/pppp1ppp/8/4N3/2BnP3/8/PPPP1PPP/RNBQK2R b KQkq - 0 4",
          prompt: "Giochi con il Nero: il Bianco ha preso il pedone e5 con il cavallo. Punisci l'ingordigia.",
          solution: ["d8g5"],
          explanation: "...Dg5!: la donna attacca il cavallo e5 e il pedone g2 insieme. Se 5.Cxf7 Dxg2 6.Tf1 Dxe4+ 7.Ae2 Cf3#. Il Bianco deve restituire materiale."
        }
      ]
    },
    {
      id: "c-gambetto-donna",
      grade: "C",
      title: "Apertura: il Gambetto di Donna",
      summary: "1.d4 d5 2.c4: la lotta per il centro spiegata con i piani.",
      theory: [
        "Il Gambetto di Donna nasce dopo 1.d4 d5 2.c4. Non è un vero gambetto: se il Nero prende in c4, di solito il Bianco recupera il pedone con facilità. Lo scopo di c4 è attaccare il pedone d5 e togliere al Nero il controllo del centro.",
        "Il Nero ha due grandi strade. Nel Gambetto di Donna rifiutato (2...e6) difende d5 con solidità, accetta per qualche mossa una posizione un po' chiusa e cerca di liberarsi più avanti con ...c5 o ...e5. Nel Gambetto di Donna accettato (2...dxc4) cede il centro per un momento, sviluppa i pezzi e attacca il centro bianco con ...c5.",
        "Per il Bianco i piani sono chiari: sviluppo rapido (Cc3, Cf3, Ag5 o Af4, e3, Ad3), pressione sulla colonna c e, quando conviene, la spinta e4 per prendere tutto il centro.",
        "La difficoltà principale del Nero nel rifiutato è l'alfiere c8, chiuso dietro il pedone e6. Molte delle idee del Nero (...b6 con ...Ab7, oppure ...dxc4 e ...e5) servono proprio a dargli aria."
      ],
      sections: [
        {
          title: "Il rifiutato: la manovra liberatoria",
          paras: [
            "Nella linea classica (4.Ag5 Ae7 5.e3 O-O 6.Cf3 Cbd7 7.Tc1 c6 8.Ad3) il Nero spesso gioca ...dxc4 quando l'alfiere bianco ha già mosso una volta, poi ...Cd5 per cambiare pezzi e infine ...e5. Ogni scambio dà spazio a chi ne ha poco, e la spinta ...e5 libera l'alfiere c8.",
            "Il Bianco, da parte sua, cerca di impedire questa liberazione o di attaccare prima che arrivi: per esempio con l'attacco di minoranza (b4-b5) nelle posizioni con i pedoni neri in c6 e d5."
          ]
        },
        {
          title: "L'accettato: recuperare il pedone e il centro",
          paras: [
            "Dopo 2...dxc4 il Bianco non deve inseguire il pedone con la donna: lo riprende con naturalezza giocando e3 e Axc4. Il Nero risponde con ...e6, ...c5 e ...a6, e spesso nasce una posizione con il pedone isolato in d4 per il Bianco: dinamica per chi attacca, solida per chi difende.",
            "Il Nero invece non deve cercare di tenere il pedone con ...b5: la struttura si sfalda dopo a4, e in certe posizioni la donna bianca arriva in f3 attaccando la torre in a8."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Per il Nero: dimenticare l'alfiere c8, che resta chiuso tutta la partita; cadere nella trappola dell'elefante (che trovi nella lezione sulla mossa intermedia). Per il Bianco: sviluppare la donna troppo presto per riprendere c4, perdendo tempi preziosi."
          ]
        }
      ],
      keyPoints: [
        "c4 attacca il centro, non è un vero sacrificio",
        "Rifiutato: solidità, poi liberazione con ...c5 o ...e5",
        "Accettato: e3 e Axc4, il pedone torna da solo",
        "Il problema del Nero è l'alfiere c8"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "La linea classica del Gambetto di Donna rifiutato, con la manovra liberatoria del Nero." },
          { move: "d2d4", text: "1.d4." },
          { move: "d7d5", text: "1...d5." },
          { move: "c2c4", text: "2.c4: il Bianco attacca d5." },
          { move: "e7e6", text: "2...e6: il Nero difende con un pedone. Solido, ma chiude l'alfiere c8." },
          { move: "b1c3", text: "3.Cc3: altra pressione su d5." },
          { move: "g8f6", text: "3...Cf6." },
          { move: "c1g5", text: "4.Ag5: inchioda il cavallo che difende d5." },
          { move: "f8e7", text: "4...Ae7: rompe l'inchiodatura." },
          { move: "e2e3", text: "5.e3." },
          { move: "e8g8", text: "5...O-O." },
          { move: "g1f3", text: "6.Cf3." },
          { move: "b8d7", text: "6...Cbd7." },
          { move: "a1c1", text: "7.Tc1: la torre va sulla colonna c, dove si aprirà il gioco." },
          { move: "c7c6", text: "7...c6: il Nero rinforza d5 e aspetta." },
          { move: "f1d3", text: "8.Ad3." },
          { move: "d5c4", text: "8...dxc4: ora che l'alfiere ha mosso, il Nero cambia in c4 e lo costringe a muovere ancora." },
          { move: "d3c4", text: "9.Axc4." },
          { move: "f6d5", text: "9...Cd5!: il cavallo propone il cambio degli alfieri." },
          { move: "g5e7", text: "10.Axe7." },
          { move: "d8e7", text: "10...Dxe7." },
          { move: "e1g1", text: "11.O-O." },
          { move: "d5c3", text: "11...Cxc3: un altro cambio." },
          { move: "c1c3", text: "12.Txc3." },
          { move: "e6e5", text: "12...e5!: la spinta liberatoria. L'alfiere c8 respira e il Nero ha una posizione solida." }
        ]
      },
      exercises: [
        {
          fen: "rnbqkb1r/ppp2ppp/4pn2/8/2pP4/4PN2/PP3PPP/RNBQKB1R w KQkq - 0 5",
          prompt: "Gambetto di Donna accettato: il Nero ha preso in c4. Recupera il pedone sviluppando un pezzo.",
          solution: ["f1c4"],
          explanation: "Axc4: sviluppi l'alfiere e riprendi il pedone in una mossa sola. Il Bianco ha un bel centro e può arroccare subito."
        },
        {
          fen: "rnbqkbnr/p3pppp/8/1p6/2pP4/4P3/1P3PPP/RNBQKBNR w KQkq - 0 6",
          prompt: "Il Nero ha cercato di tenere il pedone c4 con ...b5 e ...c6, ma la diagonale lunga si è aperta. Punisci.",
          solution: ["d1f3"],
          explanation: "Df3!: la donna attacca la torre in a8 lungo la diagonale e il Nero non può difenderla bene. Se ...Cc6, Dxc6+. È il motivo per cui nel Gambetto accettato non si difende il pedone con ...b5."
        }
      ]
    },
    {
      id: "c-siciliana",
      grade: "C",
      title: "Apertura: la Difesa Siciliana",
      summary: "1.e4 c5: squilibrio, colonna c e la lotta per d4 e d5.",
      theory: [
        "La Siciliana (1.e4 c5) è la risposta più popolare a 1.e4. Il Nero non copia il Bianco con ...e5: controlla la casa d4 da lato e crea subito una posizione asimmetrica, con più possibilità di vincere ma anche più rischi.",
        "Nella Siciliana aperta (2.Cf3 e 3.d4 cxd4 4.Cxd4) il Bianco ottiene sviluppo e spazio, il Nero un pedone centrale in più (il suo pedone d contro nessun pedone c bianco) e la colonna c semiaperta. È uno scambio tipico: il Bianco attacca, il Nero contrattacca.",
        "I piani tipici sono speculari. Il Bianco spesso arrocca lungo e attacca sul lato di re con le spinte f4, g4 o h4. Il Nero gioca sulla colonna c, con ...a6, ...b5 e la torre in c8, e cerca la spinta liberatoria ...d5.",
        "Contro la Siciliana il Bianco può anche evitare le linee teoriche con sistemi come 2.c3 (Alapin) o il gambetto Morra (2.d4 cxd4 3.c3): sono posizioni più semplici da imparare, ma con le loro trappole."
      ],
      sections: [
        {
          title: "Le case chiave: d4 e d5",
          paras: [
            "Il pedone c5 nasce per controllare d4. Quando il Bianco apre con d4 e il Nero cambia, la lotta si sposta su d5: se il Nero riesce a giocare ...d5 senza perdere materiale, di solito ha risolto i problemi dell'apertura.",
            "Nelle strutture con ...e5 (come la Najdorf con 6...e5) la casa d5 diventa un buco nel campo nero: il Bianco cerca di piazzarci un cavallo, il Nero di controllarla o di cambiare i pezzi che la occupano."
          ]
        },
        {
          title: "Le idee da non dimenticare",
          paras: [
            "Per il Nero: lo sviluppo in Siciliana è più lento, quindi le mosse vanno fatte nell'ordine giusto; ogni tempo perso può costare un attacco al re. Per il Bianco: la colonna c semiaperta e la pressione su c3 sono pericolose, e i sacrifici di qualità in c3 sono un motivo classico del Nero.",
            "In molte varianti l'alfiere c4 del Bianco punta su f7: con il re nero ancora al centro, i sacrifici su f7 o e6 vanno sempre controllati."
          ]
        },
        {
          title: "Come impararla senza memorizzare tutto",
          paras: [
            "Scegli una sola variante con il Nero e una sola risposta con il Bianco, gioca molte partite e dopo ognuna confronta le prime mosse con la teoria. In Siciliana la comprensione dei piani conta più della memoria: chi sa dove vanno i pezzi trova da solo le mosse giuste."
          ]
        }
      ],
      keyPoints: [
        "1.e4 c5: asimmetria e controllo di d4",
        "Il Bianco attacca sul lato di re, il Nero gioca sulla colonna c",
        "La spinta ...d5 libera il gioco del Nero",
        "Attenzione ai sacrifici su f7 ed e6 con il re nero al centro"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "La Siciliana aperta, nella variante Najdorf con ...e5." },
          { move: "e2e4", text: "1.e4." },
          { move: "c7c5", text: "1...c5: il pedone controlla d4 da lato." },
          { move: "g1f3", text: "2.Cf3: prepara d4." },
          { move: "d7d6", text: "2...d6." },
          { move: "d2d4", text: "3.d4: il Bianco apre il centro." },
          { move: "c5d4", text: "3...cxd4: il Nero cambia un pedone laterale con uno centrale." },
          { move: "f3d4", text: "4.Cxd4: il Bianco ha più spazio e sviluppo." },
          { move: "g8f6", text: "4...Cf6: attacca e4." },
          { move: "b1c3", text: "5.Cc3: difende." },
          { move: "a7a6", text: "5...a6: la mossa della Najdorf. Toglie b5 ai pezzi bianchi e prepara ...e5 o ...b5." },
          { move: "f1e2", text: "6.Ae2: sviluppo tranquillo." },
          { move: "e7e5", text: "6...e5: il Nero caccia il cavallo e prende spazio al centro, al prezzo di una casa debole in d5.", marks: { d5: "hint" } },
          { move: "d4b3", text: "7.Cb3." },
          { move: "f8e7", text: "7...Ae7." },
          { move: "e1g1", text: "8.O-O." },
          { move: "e8g8", text: "8...O-O." },
          { move: "c1e3", text: "9.Ae3: il Bianco controlla d4 e d5." },
          { move: "c8e6", text: "9...Ae6: anche il Nero lotta per d5. Se riesce a giocare ...d5, avrà risolto ogni problema." }
        ]
      },
      exercises: [
        {
          fen: "r1bqkb1r/p3pp1p/2pp1np1/8/2B1P3/2N5/PPP2PPP/R1BQK2R w KQkq - 0 8",
          prompt: "Il Nero ha ancora il re al centro e l'alfiere c4 punta su f7. Gioca la spinta che prepara la trappola e, se il Nero prende, completala.",
          solution: ["e4e5", "d6e5", "c4f7", "e8f7", "d1d8"],
          explanation: "e5! e se ...dxe5?? Axf7+! Rxf7 Dxd8: la colonna d si è aperta e la donna nera cade (la trappola di Magnus Smith). Il Nero doveva rispondere a e5 con ...Cg4 o ...Cd7."
        },
        {
          fen: "r1b1kb1r/ppqp1ppp/2n1p3/8/2B1P1n1/2N2N1P/PP2QPP1/R1B2RK1 b kq - 0 9",
          prompt: "Gambetto Morra: giochi con il Nero e il Bianco ha appena attaccato il tuo cavallo con h3. Non ritirarlo: c'è un colpo.",
          solution: ["c6d4"],
          explanation: "...Cd4!: la trappola siberiana. Il cavallo attacca la donna e2 e, se il Bianco cattura in g4, ...Cxe2+; se la donna si sposta, ...Dh2#. Il Bianco perde la donna."
        }
      ]
    },
    {
      id: "c-london",
      grade: "C",
      title: "Apertura: il Sistema Londra",
      summary: "Un sistema con il Bianco da giocare con i piani, non a memoria.",
      theory: [
        "Il Sistema Londra è un'apertura di sistema: il Bianco gioca quasi sempre le stesse mosse, d4, Af4, e3, Cf3, c3, Cbd2, Ad3 e arrocco, qualunque cosa faccia il Nero. Per questo è amata dai giocatori di club: si impara in fretta e porta a posizioni solide.",
        "La struttura tipica ha i pedoni in c3, d4 ed e3, una piramide difficile da attaccare. L'alfiere f4 esce prima di e3, così non resta chiuso come succede in molte altre aperture di donna.",
        "I piani principali sono due. Il primo è l'attacco sul lato di re: cavallo in e5, spesso sostenuto da f4, donna in f3 o h5, alfiere d3 puntato su h7. Il secondo è la spinta centrale e4, quando il Nero ha trascurato il centro.",
        "Il prezzo della solidità è un certo ritardo nel creare problemi: contro un Nero ben preparato il Londra porta a posizioni pari. Il vantaggio pratico è che conosci i piani meglio dell'avversario."
      ],
      sections: [
        {
          title: "Le reazioni del Nero da conoscere",
          paras: [
            "...c5 e ...Db6: il Nero attacca b2, il punto lasciato debole dall'uscita dell'alfiere. Le risposte sane sono Db3, Dc1 o Cc3 con l'idea Cb5; se il Nero prende in b2 senza preparazione, spesso la sua donna finisce in trappola.",
            "...Ad6: il Nero offre il cambio degli alfieri. Ag3 mantiene l'alfiere e, se il Nero cambia, hxg3 apre la colonna h per la torre. Anche Axd6 e Ad3 sono possibili: l'importante è non regalare tempi."
          ]
        },
        {
          title: "Il piano con Ce5 e f4",
          paras: [
            "Quando il Nero arrocca corto e non controlla e5, il cavallo salta in e5 e il pedone f arriva in f4 per sostenerlo. Poi la torre può andare in f3 e in h3, la donna in f3 o h5. È una struttura simile a quella dello Stonewall, ma con l'alfiere scuro fuori dalla catena.",
            "Questo piano funziona bene contro i setup passivi del Nero; contro ...c5 e ...Cc6 attivi conviene prima completare lo sviluppo e controllare il centro."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Giocare le mosse in automatico senza guardare le minacce del Nero, soprattutto ...Db6 contro b2 e ...Cb4 contro c2. Dimenticare che l'alfiere f4 può essere cacciato da ...Ch5: prepara h3 o una ritirata in g3 per non perderlo."
          ]
        }
      ],
      keyPoints: [
        "d4, Af4, e3, Cf3, c3, Cbd2, Ad3, O-O",
        "Piramide c3-d4-e3: solida e difficile da attaccare",
        "Piani: Ce5 con f4 sul lato di re, oppure e4 al centro",
        "Attenzione a ...Db6 contro b2"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Una partita tipica con il Sistema Londra e il piano d'attacco con Ce5 e f4." },
          { move: "d2d4", text: "1.d4." },
          { move: "d7d5", text: "1...d5." },
          { move: "c1f4", text: "2.Af4: l'alfiere esce prima di e3, così non resta chiuso." },
          { move: "g8f6", text: "2...Cf6." },
          { move: "e2e3", text: "3.e3." },
          { move: "c7c5", text: "3...c5: il Nero attacca il centro." },
          { move: "c2c3", text: "4.c3: la piramide c3-d4-e3 è completa." },
          { move: "b8c6", text: "4...Cc6." },
          { move: "b1d2", text: "5.Cd2: il cavallo difende e prepara Cgf3." },
          { move: "e7e6", text: "5...e6." },
          { move: "g1f3", text: "6.Cgf3." },
          { move: "f8d6", text: "6...Ad6: il Nero offre il cambio degli alfieri." },
          { move: "f4g3", text: "7.Ag3: il Bianco mantiene l'alfiere. Se ...Axg3, hxg3 apre la colonna h." },
          { move: "e8g8", text: "7...O-O." },
          { move: "f1d3", text: "8.Ad3: l'alfiere punta su h7." },
          { move: "b7b6", text: "8...b6." },
          { move: "f3e5", text: "9.Ce5: il cavallo occupa la casa avanzata." },
          { move: "c8b7", text: "9...Ab7." },
          { move: "f2f4", text: "10.f4: il cavallo è sostenuto e il Bianco prepara l'attacco con Tf3-h3 o Df3." }
        ]
      },
      exercises: [
        {
          fen: "rnbqk2r/ppp2ppp/3bpn2/3p4/3P1B2/4PN2/PPP2PPP/RN1QKB1R w KQkq - 2 5",
          prompt: "Il Nero offre il cambio degli alfieri con ...Ad6. Gioca una risposta tipica del Londra.",
          solution: ["f4g3"],
          accept: ["f4g3", "f4d6", "f1d3", "b1d2"],
          explanation: "Ag3 è la risposta più tipica: se il Nero cambia, hxg3 apre la colonna h. Vanno bene anche Axd6 e lo sviluppo con Ad3 o Cbd2. Da evitare le mosse che regalano tempi, come ritirare l'alfiere in c1."
        },
        {
          fen: "rnb1kbnr/pp2pppp/8/2pp4/3P1B2/2N1P3/PqP2PPP/R2QKBNR w KQkq - 0 5",
          prompt: "Il Nero ha preso il pedone b2 con la donna, ma è in ritardo di sviluppo e c7 è debole. Punisci.",
          solution: ["c3d5"],
          explanation: "Cxd5!: il cavallo prende un pedone e minaccia Cc7+ con forchetta a re e torre, aiutato dall'alfiere f4. La donna nera è lontana e il Nero non riesce a difendersi senza perdere materiale."
        }
      ]
    },

    /* ------------------------------------------------------------ grado B */
    {
      id: "b-candidate",
      grade: "B",
      title: "Mosse candidate e controllo dell'errore",
      summary: "Un metodo per scegliere la mossa nelle posizioni complicate.",
      theory: [
        "Nelle posizioni tattiche il problema non è calcolare tanto, ma calcolare le mosse giuste. Le mosse candidate sono le due, tre o quattro mosse che meritano di essere esaminate. Sceglierle bene è metà del lavoro.",
        "Le prime candidate sono sempre le mosse forzanti: scacchi, catture, minacce gravi, in quest'ordine. Poi le mosse che rispondono alla minaccia principale dell'avversario. Infine la mossa che ti suggerisce l'istinto, che va comunque verificata come le altre.",
        "Il metodo di Aleksandr Kotov, reso celebre dal libro «Think Like a Grandmaster», chiede di elencare le candidate prima di calcolarne anche una sola, e poi di esaminarle una alla volta senza saltare avanti e indietro. Nella pratica basta una versione semplice: elenco, calcolo ordinato, confronto, scelta.",
        "Il controllo dell'errore chiude il processo: prima di toccare il pezzo, guarda la posizione dopo la mossa scelta con gli occhi dell'avversario. Quali sono le sue risposte forzanti? Questo ultimo sguardo salva più punti di qualsiasi apertura."
      ],
      sections: [
        {
          title: "Come scegliere le candidate",
          paras: [
            "Fai un inventario veloce: re avversario esposto? Pezzi non difesi da entrambe le parti? Pezzi sovraccarichi? Linee aperte verso pezzi importanti? Ogni risposta positiva suggerisce una o due candidate. Se non c'è nulla di tattico, le candidate diventano le mosse di piano: migliorare il pezzo peggiore, occupare una colonna, preparare una spinta.",
            "Non serve elencare dieci mosse: tre candidate ben scelte valgono più di dieci esaminate di fretta. Se tutte le candidate sembrano cattive, allargare la lista è la cosa giusta da fare."
          ]
        },
        {
          title: "Calcolare con ordine",
          paras: [
            "Per ogni candidata considera le risposte forzanti dell'avversario e fermati quando la posizione è chiara: un matto, un guadagno netto di materiale, oppure una posizione tranquilla da valutare a occhio. Non serve arrivare in fondo a ogni ramo: serve sapere dove ti fermi e perché.",
            "Un errore classico è innamorarsi della prima idea e cercare solo le varianti che la confermano. Fai l'avvocato del diavolo: cerca attivamente la confutazione della tua mossa preferita."
          ]
        },
        {
          title: "Il controllo finale",
          paras: [
            "Domande da farsi in due secondi: dopo la mia mossa, quali miei pezzi sono indifesi? Il mio re ha case di fuga? L'avversario ha uno scacco che cambia tutto? Se la risposta preoccupa, torna alle candidate.",
            "Nelle partite a cadenza lenta usa il metodo completo nei momenti critici e la versione rapida nelle mosse normali. Nelle partite veloci tieni almeno il controllo finale: è il filtro che elimina gli errori da un pezzo."
          ]
        }
      ],
      keyPoints: [
        "Prima l'elenco delle candidate, poi il calcolo",
        "Candidate forzanti per prime: scacchi, catture, minacce",
        "Calcola una variante alla volta e sappi dove fermarti",
        "Controllo finale con gli occhi dell'avversario"
      ],
      example: {
        fen: "r4rk1/pp3ppp/2p5/8/8/3B3R/PP3PPP/3Q2K1 w - - 0 1",
        steps: [
          { text: "Tocca al Bianco. Candidate forzanti: Axh7+, Txh7, Dh5 (minaccia). Tutte sembrano buone: calcoliamo la più forzante, lo scacco.", arrows: [{ from: "d3", to: "h7", color: "green" }, { from: "h3", to: "h7", color: "green" }, { from: "d1", to: "h5", color: "green" }] },
          { move: "d3h7", text: "1.Axh7+: il re non può prendere, perché dopo Rxh7 la donna arriva in h5 con scacco e matto." },
          { move: "g8h8", text: "1...Rh8: l'unica alternativa." },
          { move: "h7b1", text: "2.Ab1+: scacco di scoperta della torre h3. L'alfiere si toglie di mezzo." },
          { move: "h8g8", text: "2...Rg8 forzata." },
          { move: "h3h8", text: "3.Th8+!!: la torre si sacrifica per attirare il re in h8." },
          { move: "g8h8", text: "3...Rxh8." },
          { move: "d1h5", text: "4.Dh5+: la donna arriva con scacco." },
          { move: "h8g8", text: "4...Rg8." },
          { move: "h5h7", text: "5.Dh7#. Le altre candidate vincevano materiale; la più forzante dava matto. Calcolare prima gli scacchi paga." }
        ]
      },
      exercises: [
        {
          fen: "r1bq1rk1/pp3ppp/2n1p3/3pP3/3P3R/3B1N2/PP3PPP/R2Q2K1 w - - 0 1",
          prompt: "Tre candidate forzanti contro l'arrocco nero: Axh7+, Txh7 e Cg5. Calcolale e gioca la più forte.",
          solution: ["d3h7"],
          explanation: "Axh7+! Rh8 (se Rxh7, Cg5+ e Dh5 con attacco decisivo) e poi Th3 o Cg5: l'alfiere in h7 apre la colonna h alla torre. Txh7 è meno forte perché il Nero risponde ...f5 e chiude la diagonale; Cg5 subito permette ...h6."
        }
      ],
      practice: { themes: ["fork", "pin", "skewer", "discoveredAttack"], min: 1200, max: 1700, count: 6, pass: 4 }
    },
    {
      id: "b-sacrifici",
      grade: "B",
      title: "Sacrifici e combinazioni",
      summary: "Dare materiale per ottenere di più.",
      theory: [
        "Una combinazione è una sequenza forzata in cui dai materiale per ottenere qualcosa di più grande: un matto, più materiale, una promozione.",
        "I sacrifici funzionano quando le risposte dell'avversario sono forzate. Per questo si calcolano solo con mosse forzanti: scacchi, catture e minacce gravi. Un sacrificio senza mosse forzanti dopo è una scommessa.",
        "Le idee ricorrenti sono tre. La deviazione allontana un difensore dalla casa importante. L'adescamento attira un pezzo, spesso il re, su una casa sfortunata. L'eliminazione del difensore cattura il pezzo che tiene in piedi la difesa. Prima riconosci il bersaglio, poi cerca chi lo protegge.",
        "Distingui i sacrifici calcolati da quelli posizionali. I primi si verificano fino in fondo prima di giocarli; i secondi danno materiale per vantaggi duraturi (iniziativa, re avversario esposto) e richiedono giudizio più che calcolo. A questo livello concentrati sui primi."
      ],
      sections: [
        {
          title: "Riconoscere il momento",
          paras: [
            "I segnali che un sacrificio è nell'aria: il re avversario ha poche case o pochi difensori; i tuoi pezzi puntano tutti verso la stessa zona; un pezzo avversario difende da solo una casa chiave; l'avversario è in ritardo di sviluppo.",
            "Quando li vedi, cerca deliberatamente i sacrifici sulle case vicine al re (h7, g7, f7, e6) e sulle case difese da un solo pezzo."
          ]
        },
        {
          title: "Il sacrificio di adescamento sul re",
          paras: [
            "Uno schema da conoscere: torre sulla colonna aperta che si sacrifica in h8 (o h7) per attirare il re, e subito dopo la donna arriva con scacco sulla stessa colonna. Funziona quando un cavallo o un pedone controlla le case di fuga, per esempio un cavallo in g5 che copre h7 e f7.",
            "Lo stesso principio vale per i sacrifici di donna sull'ultima traversa: la donna cattura il difensore, il difensore riprende, e la torre dà matto sulla casa rimasta libera."
          ]
        },
        {
          title: "Gli errori tipici",
          paras: [
            "Sacrificare contando su una sola risposta dell'avversario. Dimenticare le sue mosse intermedie con scacco. Sacrificare quando l'attacco ha pochi pezzi: se dopo il sacrificio ti resta un solo attaccante, raramente basta.",
            "E, al contrario, rinunciare per paura a un sacrificio che si poteva calcolare fino in fondo: allenarsi sugli esercizi serve proprio a trasformare il dubbio in certezza."
          ]
        }
      ],
      keyPoints: [
        "Un sacrificio va calcolato fino in fondo",
        "Usa mosse forzanti per limitare le risposte",
        "Deviazione, adescamento, eliminazione del difensore",
        "Servono abbastanza attaccanti dopo il sacrificio"
      ],
      example: {
        fen: "2rq1bk1/ppp2pp1/8/6N1/8/8/PPP1QPP1/2K4R w - - 0 1",
        steps: [
          { text: "Colonna h aperta, cavallo in g5 che controlla h7 e f7. Il re nero ha solo il pedone f7 e l'alfiere f8 vicino.", arrows: [{ from: "h1", to: "h8", color: "green" }, { from: "g5", to: "h7", color: "green" }] },
          { move: "h1h8", text: "1.Th8+!: adescamento. La torre si offre per attirare il re in h8." },
          { move: "g8h8", text: "1...Rxh8: forzata, il re non ha altre case." },
          { move: "e2h5", text: "2.Dh5+: la donna arriva sulla colonna con scacco." },
          { move: "h8g8", text: "2...Rg8: unica casa." },
          { move: "h5h7", text: "3.Dh7#: la donna è protetta dal cavallo g5. Il re non ha case: f8 è occupata dall'alfiere, f7 dal pedone." }
        ]
      },
      exercises: [
        {
          fen: "3r2k1/2q2ppp/8/3Q4/8/8/3R1PPP/3R2K1 w - - 0 1",
          prompt: "La torre in d8 è l'unica difesa dell'ottava traversa ed è protetta dalla donna. Matto in due.",
          solution: ["d5d8", "c7d8", "d2d8"],
          explanation: "Dxd8+! Dxd8 Txd8#: la donna elimina il difensore, la donna nera deve riprendere e la torre, sostenuta dalla seconda torre, dà matto del corridoio."
        }
      ],
      practice: { themes: ["sacrifice"], min: 1200, max: 1800, count: 6, pass: 4 }
    },
    {
      id: "b-re-e-pedoni",
      grade: "B",
      title: "Finali di re e pedoni",
      summary: "Opposizione, case chiave e regola del quadrato.",
      theory: [
        "Nei finali di re e pedoni il re diventa un pezzo d'attacco. Il concetto chiave è l'opposizione: due re sulla stessa colonna con una casa in mezzo. Chi NON deve muovere ha l'opposizione e costringe l'altro re a cedere terreno.",
        "Regola del quadrato: per sapere se il re raggiunge un pedone passato, immagina un quadrato che va dal pedone alla casa di promozione. Se il re può entrare nel quadrato con la sua mossa, ferma il pedone.",
        "Con re e pedone contro re, il re attaccante deve stare davanti al pedone, non dietro. Se raggiunge le case chiave, vince. Per un pedone che non ha ancora superato la metà della scacchiera, le case chiave sono le tre case due traverse davanti a lui; per un pedone in quinta o sesta, bastano le tre case davanti e accanto.",
        "Il pedone di torre è un'eccezione: se il re difensore raggiunge l'angolo davanti al pedone, la partita è patta qualunque cosa succeda."
      ],
      sections: [
        {
          title: "Opposizione in pratica",
          paras: [
            "Re bianco in e4, re nero in e6, tocca al Nero: il Nero deve spostarsi e il re bianco avanza. Se tocca al Bianco, è lui a dover cedere. Per questo nei finali di pedoni si conta sempre chi ha la mossa.",
            "Quando i re sono lontani si parla di opposizione a distanza: stessa colonna con un numero dispari di case in mezzo. La regola è la stessa e serve a decidere la marcia dei re verso le case chiave."
          ]
        },
        {
          title: "Il re va di lato",
          paras: [
            "Con il pedone in quinta o sesta e il re accanto, spesso la mossa vincente è mettere il re di lato al pedone, non davanti: così il re nemico non può prendere l'opposizione e il pedone avanza protetto. È un dettaglio che decide molte partite.",
            "La triangolazione è il trucco per passare la mossa all'avversario: il re fa un giro di tre mosse su un triangolo di case, mentre il re nemico, più limitato, non può imitarlo."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Gioca contro il computer le posizioni base: re e pedone contro re, con il pedone in diverse colonne e traverse. Bastano pochi minuti al giorno per una settimana e non sbaglierai più questi finali."
          ]
        }
      ],
      keyPoints: [
        "Opposizione: ha il vantaggio chi non deve muovere",
        "Quadrato del pedone: entra nel quadrato o il pedone promuove",
        "Re davanti al pedone, sulle case chiave",
        "Pedone di torre: con il re nell'angolo è patta"
      ],
      example: {
        fen: "8/8/4k3/8/4K3/4P3/8/8 b - - 0 1",
        steps: [
          { text: "Re contro re sulla stessa colonna, con una casa in mezzo. Tocca al Nero: il Bianco ha l'opposizione." },
          { move: "e6d6", text: "Il re nero deve spostarsi e cede una casa." },
          { move: "e4f5", text: "Rf5: il re bianco avanza su una casa chiave davanti al pedone." },
          { move: "d6e7", text: "Il Nero prova a tornare davanti al pedone." },
          { move: "f5e5", text: "Re5: il Bianco riprende l'opposizione. Il pedone verrà accompagnato a promozione." }
        ]
      },
      exercises: [
        {
          fen: "8/8/8/4k3/8/3K4/4P3/8 w - - 0 1",
          prompt: "Il re bianco deve passare davanti al pedone. Trova la mossa che prende l'opposizione.",
          solution: ["d3e3"],
          explanation: "Re3: i re sono uno di fronte all'altro con una casa in mezzo e tocca al Nero. Qualsiasi mossa del re nero lascia passare il tuo re verso d4, e4 o f4, le case chiave del pedone."
        },
        {
          fen: "7k/8/8/p7/8/5K2/8/8 w - - 0 1",
          prompt: "Il pedone nero in a5 corre verso a1. Entra nel suo quadrato con il re per fermarlo.",
          solution: ["f3e4"],
          accept: ["f3e4", "f3e3", "f3e2"],
          explanation: "Il quadrato del pedone va da a5 a e1: la colonna e è l'ultima dentro. Con il re sulla colonna e raggiungi il pedone in tempo; con Rf4 o Rg4 resteresti fuori e il pedone promuoverebbe."
        },
        {
          fen: "3k4/8/3K4/3P4/8/8/8/8 w - - 0 1",
          prompt: "Il pedone è in quinta e il tuo re è davanti. Trova la mossa che vince.",
          solution: ["d6e6"],
          accept: ["d6e6", "d6c6"],
          explanation: "Re6 (o Rc6): il re si sposta di lato e il pedone potrà avanzare protetto. Con Re5? o Rc5? il re si allontana e il Nero, prendendo l'opposizione, fa patta."
        }
      ]
    },
    {
      id: "b-difesa",
      grade: "B",
      title: "La mossa difensiva",
      summary: "Trovare l'unica mossa che salva la posizione.",
      theory: [
        "Difendersi bene vale quanto attaccare bene. Quando l'avversario minaccia qualcosa, non cercare subito il contrattacco: prima elenca le sue minacce reali e valuta quanto sono gravi.",
        "Le difese si dividono in quattro tipi: spostare il pezzo attaccato, difenderlo, bloccare la linea d'attacco, contro-minacciare qualcosa di più grande. Contro le minacce di matto aggiungi le difese con il re (fargli spazio, spostarlo prima che arrivi l'attacco).",
        "Spesso esiste una sola mossa buona. Se tutte le mosse naturali perdono, cerca quelle meno ovvie: una mossa intermedia con scacco, una cattura che cambia il conto, un pedone che attacca un pezzo chiave dell'attacco.",
        "La difesa migliore è quella che elimina o respinge i pezzi attaccanti più pericolosi. Un attacco con tre pezzi diventa innocuo se uno di loro viene cambiato o cacciato via con tempo."
      ],
      sections: [
        {
          title: "La gerarchia delle minacce",
          paras: [
            "Non tutte le minacce sono uguali: un matto viene prima della perdita della donna, che viene prima di un pezzo, che viene prima di un pedone. Se l'avversario ha due minacce, para la più grave e chiediti se puoi parare anche l'altra con la stessa mossa.",
            "A volte la difesa più efficace è accettare una perdita piccola per evitarne una grande: restituire un pedone per cambiare la donna avversaria può spegnere un attacco intero."
          ]
        },
        {
          title: "Difendersi da un attacco al re",
          paras: [
            "Contro la batteria donna-alfiere puntata su h7 le difese tipiche sono: un pezzo in f6 che copre h7, la spinta ...g6 per bloccare la diagonale, oppure ...h6 per cacciare un cavallo in g5. Contro la batteria sulla diagonale lunga verso g7 si blocca con ...f6 o ...e5.",
            "Ogni difesa ha un costo: ...g6 indebolisce le case scure intorno al re, ...h6 crea un bersaglio per i sacrifici. Scegli quella che lascia meno debolezze dopo."
          ]
        },
        {
          title: "La mentalità",
          paras: [
            "Chi difende bene non si dispera quando la posizione peggiora: cerca la mossa che crea più problemi all'avversario e lo costringe a calcolare. Molti attacchi vincenti sulla carta falliscono perché l'attaccante sbaglia sotto pressione."
          ]
        }
      ],
      keyPoints: [
        "Prima le minacce dell'avversario, poi le tue",
        "Sposta, difendi, blocca o contrattacca più forte",
        "Cambia o caccia via il pezzo d'attacco più pericoloso",
        "Se tutto sembra perdere, cerca la mossa intermedia"
      ],
      example: {
        fen: "r4rk1/pp3ppp/4p3/8/6Q1/8/PB3PPP/6K1 b - - 0 1",
        steps: [
          { text: "Il Bianco minaccia Dxg7#: donna e alfiere puntano entrambi su g7, difeso solo dal re.", arrows: [{ from: "g4", to: "g7", color: "red" }, { from: "b2", to: "g7", color: "red" }] },
          { text: "Le difese possibili: bloccare la diagonale con ...e5 o ...f6, oppure spostare il pedone con ...g6. Le mosse che ignorano la minaccia, come ...a6, perdono subito.", marks: { e5: "hint", f6: "hint" } },
          { move: "e6e5", text: "1...e5!: il pedone si mette sulla diagonale dell'alfiere. Costa un pedone dopo Axe5, ma il re è salvo." },
          { move: "b2e5", text: "2.Axe5." },
          { move: "f7f6", text: "2...f6: il Nero caccia l'alfiere e chiude di nuovo la diagonale. Ha un pedone in meno ma nessun matto in vista." }
        ]
      },
      exercises: [
        {
          fen: "2rq1rk1/pp1nbppp/4p3/6NQ/8/3B4/PPP2PPP/R4RK1 b - - 0 1",
          prompt: "Giochi con il Nero: donna, alfiere e cavallo puntano su h7. Trova l'unica difesa.",
          solution: ["h7h6"],
          explanation: "...h6!: il pedone attacca il cavallo e toglie alla donna la colonna h. Dopo Ah7+ Rh8 Cxf7+ Txf7 Dxf7 Rxh7 il materiale è pari. ...Cf6 perde dopo Axh7+, ...Te8 per Axh7+ Rh8 Cxf7#."
        }
      ],
      practice: { themes: ["defensiveMove"], min: 1000, max: 1900, count: 6, pass: 4 }
    },
    {
      id: "b-matto-in-tre",
      grade: "B",
      title: "Calcolo: matto in tre",
      summary: "Visualizzare tre mosse senza muovere i pezzi.",
      theory: [
        "Il calcolo è la capacità di vedere la posizione dopo alcune mosse senza toccare i pezzi. Si allena come un muscolo: un po' ogni giorno, con esercizi sempre un po' più lunghi.",
        "Calcola in modo ordinato: scegli le mosse candidate (le più forzanti), poi per ognuna tutte le risposte dell'avversario. Non saltare da una variante all'altra.",
        "Alla fine della variante fermati e guarda la posizione immaginata: è davvero matto? C'è una casa libera che ti era sfuggita? Un pezzo lontano che può interporsi?",
        "Nei matti in tre la mossa chiave è spesso la seconda: la prima prepara (uno scacco che sposta il re), la seconda sacrifica, la terza chiude. Se non trovi la prima mossa, prova a immaginare la posizione di matto finale e a lavorare all'indietro."
      ],
      sections: [
        {
          title: "Lavorare all'indietro",
          paras: [
            "Molti matti hanno una forma finale riconoscibile: matto affogato, matto di Anastasia, matto del corridoio. Chiediti quale forma è possibile con i tuoi pezzi e che cosa manca per arrivarci: un pezzo avversario da togliere di mezzo, una casa da liberare, il re da spostare di una casa.",
            "Trovata la forma, le mosse che portano lì spesso sono obbligate."
          ]
        },
        {
          title: "Il matto affogato di Philidor",
          paras: [
            "Con il re nemico in g8, la donna sulla diagonale verso g8 e un cavallo vicino, lo schema classico è: scacco doppio di cavallo e donna, il re va nell'angolo, sacrificio di donna in g8 che obbliga la torre a catturare, e il cavallo dà matto in f7. È un matto che si studia da secoli ed è ancora frequente nelle partite di club.",
            "La chiave è che dopo il sacrificio la torre nera chiude l'ultima casa del suo re."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Risolvi i matti in tre senza muovere i pezzi, dicendo ad alta voce tutta la variante, comprese le risposte dell'avversario. Se sbagli, rimetti la posizione e trova dove il calcolo si è rotto: è lì che migliori."
          ]
        }
      ],
      keyPoints: [
        "Candidate forzanti, una variante alla volta",
        "Per ogni tua mossa, tutte le risposte",
        "Immagina la posizione di matto e lavora all'indietro",
        "Verifica la posizione finale prima di muovere"
      ],
      example: {
        fen: "r4rk1/ppp2Npp/1q6/8/2Q5/8/PPP2PPP/6K1 w - - 0 1",
        steps: [
          { text: "Il cavallo in f7 copre la diagonale della donna verso g8. Se si sposta con scacco, lo scacco è doppio.", arrows: [{ from: "c4", to: "g8", color: "green" }] },
          { move: "f7h6", text: "1.Ch6++: scacco doppio di cavallo e donna. Il re non può restare in g8 e in f8 c'è la sua torre." },
          { move: "g8h8", text: "1...Rh8 forzata." },
          { move: "c4g8", text: "2.Dg8+!!: la donna si sacrifica. Il re non può prenderla perché g8 è controllata dal cavallo." },
          { move: "f8g8", text: "2...Txg8: la torre deve catturare e chiude l'ultima casa del suo re." },
          { move: "h6f7", text: "3.Cf7#: matto affogato. Il re è murato dai suoi stessi pezzi." }
        ]
      },
      exercises: [
        {
          fen: "1q1r1rk1/pp3ppp/8/3N3Q/8/3R4/PP3PPP/6K1 w - - 0 1",
          prompt: "Il cavallo può arrivare in e7 con scacco. Trova il matto in tre.",
          solution: ["d5e7", "g8h8", "h5h7", "h8h7", "d3h3"],
          explanation: "Ce7+ Rh8 Dxh7+!! Rxh7 Th3#: il cavallo in e7 controlla g8 e g6, il sacrificio di donna apre la colonna h e la torre chiude. È il matto di Anastasia preparato da uno scacco: immagina prima la posizione finale, poi trova le mosse che ci portano."
        }
      ],
      practice: { themes: ["mateIn3"], min: 1000, max: 1800, count: 6, pass: 4 }
    },
    {
      id: "b-pezzi-attivi",
      grade: "B",
      title: "Pezzi attivi e pezzi intrappolati",
      summary: "Un pezzo vale quanto le case che controlla.",
      theory: [
        "Il valore dei pezzi cambia con la posizione. Un cavallo in una casa centrale protetta da un pedone (avamposto) può valere più di una torre chiusa. Un alfiere bloccato dai suoi pedoni vale poco.",
        "Un pezzo è intrappolato quando non ha case sicure dove andare: allora puoi attaccarlo e vincerlo anche se non è in presa adesso. Succede spesso ad alfieri e cavalli entrati troppo in profondità, e alla donna che va a prendere pedoni lontani.",
        "Nel mediogioco chiediti quale tuo pezzo è il peggiore e come migliorarlo. Spesso la mossa giusta non attacca niente: porta un pezzo passivo su una casa migliore.",
        "L'attività ha anche un lato difensivo: i pezzi attivi creano minacce che tengono occupato l'avversario, mentre quelli passivi aspettano. In molte posizioni equilibrate vince chi ha i pezzi più attivi, non chi ha un pedone in più."
      ],
      sections: [
        {
          title: "Il pezzo peggiore",
          paras: [
            "Un esercizio semplice da fare in partita, quando non ci sono tattiche: guarda i tuoi pezzi uno per uno e chiediti quante case utili controllano. Quello con meno attività è il candidato da migliorare. Un cavallo in b1 a metà partita, un alfiere che guarda i propri pedoni, una torre ancora in a1 sono i soliti sospetti.",
            "Il piano allora diventa concreto: trovare il percorso che porta quel pezzo su una casa migliore, anche se servono tre o quattro mosse."
          ]
        },
        {
          title: "Pezzi in trappola: i casi classici",
          paras: [
            "L'alfiere che prende un pedone in a7 o h2 e resta chiuso da una spinta di pedone (Fischer cadde in questa trappola contro Spassky nella prima partita del match del 1972, prendendo in h2). La donna che prende il pedone b2 e viene circondata. L'alfiere in b3 della Spagnola, intrappolato dai pedoni neri con ...c5 e ...c4: è la trappola dell'arca di Noè.",
            "Prima di mandare un pezzo in profondità, conta le sue vie di ritorno."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Rigioca una tua partita persa e segna, per ogni fase, il tuo pezzo peggiore. Spesso scoprirai che la sconfitta è iniziata da un pezzo rimasto fuori gioco per venti mosse."
          ]
        }
      ],
      keyPoints: [
        "Avamposti per i cavalli, diagonali aperte per gli alfieri",
        "Un pezzo senza case di fuga si può catturare",
        "Migliora il tuo pezzo peggiore",
        "Conta le vie di ritorno prima di entrare in profondità"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "La trappola dell'arca di Noè nella Partita Spagnola: un alfiere attivo che diventa un pezzo intrappolato." },
          { move: "e2e4", text: "1.e4." },
          { move: "e7e5", text: "1...e5." },
          { move: "g1f3", text: "2.Cf3." },
          { move: "b8c6", text: "2...Cc6." },
          { move: "f1b5", text: "3.Ab5: la Spagnola." },
          { move: "a7a6", text: "3...a6." },
          { move: "b5a4", text: "4.Aa4." },
          { move: "d7d6", text: "4...d6." },
          { move: "d2d4", text: "5.d4." },
          { move: "b7b5", text: "5...b5: il Nero caccia l'alfiere." },
          { move: "a4b3", text: "6.Ab3: l'alfiere è attivo, punta su f7. Ma le sue case di ritirata sono poche." },
          { move: "c6d4", text: "6...Cxd4." },
          { move: "f3d4", text: "7.Cxd4." },
          { move: "e5d4", text: "7...exd4." },
          { move: "d1d4", text: "8.Dxd4?: il Bianco riprende il pedone e cade nella trappola. Lo vedrai negli esercizi." }
        ]
      },
      exercises: [
        {
          fen: "r1bqkbnr/2p2ppp/p2p4/1p6/3QP3/1B6/PPP2PPP/RNB1K2R b KQkq - 0 8",
          prompt: "Giochi con il Nero. L'alfiere b3 ha poche case: chiudilo in trappola.",
          solution: ["c7c5"],
          explanation: "...c5!: la donna deve spostarsi e poi ...c4 chiude l'alfiere in b3, che non ha più case di fuga. È la trappola dell'arca di Noè: il Nero vince un pezzo."
        }
      ],
      practice: { themes: ["trappedPiece", "pin"], min: 1300, max: 1900, count: 6, pass: 4 }
    },
    {
      id: "b-matti-tipici",
      grade: "B",
      title: "Matti tipici: affogato, Boden e corridoio",
      summary: "Schemi di matto da riconoscere al volo.",
      theory: [
        "Molti matti si ripetono uguali. Conoscerli ti fa vedere la combinazione in un attimo. Il matto affogato: il re è circondato dai suoi pezzi e un cavallo lo attacca senza che nessuno possa catturarlo.",
        "Il matto di Philidor unisce sacrificio e matto affogato: la donna si sacrifica in g8, la torre la cattura e chiude l'ultima casa del re, poi il cavallo dà matto in f7.",
        "Il matto di Boden si dà con due alfieri che si incrociano contro il re arroccato lungo: uno controlla la diagonale a6-c8, l'altro le case b8 e c7. Spesso è preceduto da un sacrificio di donna in c6 o in b7.",
        "Il matto del corridoio funziona anche con più pezzi: se l'ultima traversa è difesa una volta sola, un sacrificio sulla traversa elimina il difensore."
      ],
      sections: [
        {
          title: "Altri schemi da conoscere",
          paras: [
            "Matto di Anastasia: cavallo in e7, torre sulla colonna h, re in h7. Matto arabo: torre in h7 o h8 sostenuta da un cavallo in f6. Matto di Damiano: donna in h7 sostenuta da un pedone in g6. Matto dei due alfieri, matto dell'epaulette (il re chiuso tra due torri sue).",
            "Non serve impararli tutti in un giorno: aggiungine uno alla settimana e cercalo negli esercizi."
          ]
        },
        {
          title: "Come usarli in partita",
          paras: [
            "Quando vedi una delle configurazioni tipiche (re arroccato lungo con c6 indebolito, re in h8 con g7 e h7 al loro posto, cavallo che arriva in e7) fermati e chiediti se manca solo un sacrificio per arrivare allo schema.",
            "Lo stesso vale in difesa: se il tuo re è in una di queste gabbie, crea una via di fuga prima che arrivino i pezzi avversari."
          ]
        }
      ],
      keyPoints: [
        "Affogato: re chiuso dai suoi pezzi + cavallo",
        "Sacrificio in g8 per chiudere l'ultima casa",
        "Boden: due alfieri incrociati contro l'arrocco lungo",
        "Corridoio: elimina l'unico difensore della traversa"
      ],
      example: {
        fen: "r6k/6pp/7N/8/8/1Q6/8/6K1 w - - 0 1",
        steps: [
          { text: "Re nero in h8, pedoni in g7 e h7. La casa g8 è coperta dal cavallo." },
          { move: "b3g8", text: "Dg8+!!: sacrificio di donna. Il re non può prendere, la casa è protetta dal cavallo.", arrows: [{ from: "h6", to: "g8", color: "green" }] },
          { move: "a8g8", text: "Txg8 è forzata: ora la torre chiude l'ultima casa del suo re." },
          { move: "h6f7", text: "Cf7#: matto affogato." }
        ]
      },
      exercises: [
        {
          fen: "6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1",
          prompt: "Il re nero è chiuso dai suoi pezzi. Trova il matto.",
          solution: ["g5f7"],
          explanation: "Cf7#: matto affogato. Torre e pedoni tolgono al re tutte le case."
        },
        {
          fen: "2kr1b1r/pp1nqppp/2n5/8/5B2/5Q2/PPP1BPPP/R4RK1 w - - 0 1",
          prompt: "Il re nero ha arroccato lungo e l'alfiere f4 controlla b8 e c7. Matto in due.",
          solution: ["f3c6", "b7c6", "e2a6"],
          explanation: "Dxc6+! bxc6 Aa6#: il matto di Boden. Il sacrificio apre la diagonale a6-c8, l'alfiere f4 copre b8 e c7, e d7 è occupata dal cavallo nero."
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
        "Le torri hanno bisogno di colonne aperte (senza pedoni). Una torre su una colonna aperta controlla tutta la colonna e può entrare nel campo avversario.",
        "La settima traversa (seconda per il Nero) è il bersaglio: una torre lì attacca i pedoni dalla parte dove non sono protetti e chiude il re sul bordo.",
        "Due torri sulla stessa colonna o in settima sono fortissime: si proteggono a vicenda e moltiplicano le minacce. Due torri in settima contro il re arroccato possono dare matto o scacco perpetuo da sole.",
        "Le colonne semiaperte (con un solo pedone, dell'avversario) sono utili quanto quelle aperte: la torre fa pressione sul pedone e lo trasforma in un bersaglio fisso."
      ],
      sections: [
        {
          title: "Come conquistare una colonna",
          paras: [
            "Chi occupa per primo una colonna aperta e la difende spesso la tiene per tutta la partita. Se l'avversario contesta la colonna con la sua torre, raddoppia: due torri contro una vincono la colonna. Se non puoi raddoppiare, valuta se lo scambio di torri ti conviene o se è meglio lasciargli la colonna e coprire le case d'entrata.",
            "Le case d'entrata sono quelle in cui la torre penetra nel campo avversario: d7, d8, c7. Controllarle con un pezzo minore vale quanto possedere la colonna."
          ]
        },
        {
          title: "I maiali ciechi",
          paras: [
            "Due torri in settima contro il re arroccato hanno un nome scherzoso, i maiali (o porci) ciechi, perché divorano tutto quello che trovano sulla traversa. Con il re nemico in g8 e una torre nera in f8 lo schema è: Txg7+, Txh7+ e la seconda torre torna in g7 con matto.",
            "Se il re ha una via di fuga, le due torri danno almeno scacco perpetuo: una risorsa preziosa anche in posizioni inferiori."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Lasciare le torri in a1 e h1 fino al finale. Mettere la torre su una colonna che non si aprirà mai. Entrare in settima senza controllare se la torre può essere tagliata fuori o intrappolata."
          ]
        }
      ],
      keyPoints: [
        "Torri sulle colonne aperte e semiaperte",
        "La settima traversa è il bersaglio",
        "Torri raddoppiate si difendono a vicenda",
        "Due torri in settima: matto o scacco perpetuo"
      ],
      example: {
        fen: "2r3k1/1p3ppp/p7/8/8/P7/1P3PPP/3R1RK1 w - - 0 1",
        steps: [
          { text: "La colonna d è aperta: nessun pedone la blocca." },
          { move: "d1d7", text: "Td7: la torre entra in settima e attacca il pedone b7." },
          { move: "c8b8", text: "Il Nero deve difendere b7." },
          { move: "f1d1", text: "Tfd1: la seconda torre raddoppia sulla colonna aperta." },
          { move: "g8f8", text: "Il Nero aspetta." },
          { move: "d7d8", text: "Td8+: con due torri sulla colonna il Bianco forza gli scambi e resta più attivo." }
        ]
      },
      exercises: [
        {
          fen: "5rk1/1RR3pp/8/8/8/8/5PPP/6K1 w - - 0 1",
          prompt: "Due torri in settima, il re nero chiuso dalla sua torre. Matto in tre.",
          solution: ["c7g7", "g8h8", "g7h7", "h8g8", "b7g7"],
          explanation: "Txg7+ Rh8 Txh7+ Rg8 Tbg7#: i maiali ciechi. La torre f8 toglie al re l'unica casa di fuga."
        }
      ],
      practice: { themes: ["endgame"], min: 1300, max: 1700, count: 6, pass: 4 }
    },
    {
      id: "b-pedone-passato",
      grade: "B",
      title: "Il pedone passato",
      summary: "Un pedone che nessuno può fermare.",
      theory: [
        "Un pedone è passato quando nessun pedone avversario può fermarlo o catturarlo sulla sua strada verso la promozione. Nei finali vale quasi quanto un pezzo.",
        "I pedoni passati vanno spinti, soprattutto quando il re avversario è lontano. Un pedone passato esterno (sul lato opposto a quello dove si trovano gli altri pedoni) costringe il re avversario ad andare a fermarlo, lasciando liberi gli altri pedoni.",
        "Per fermare un pedone passato avversario bloccalo con un pezzo, idealmente un cavallo, sulla casa davanti a lui. Nimzowitsch insisteva su questo punto: un passato non bloccato tende ad avanzare, e ogni passo lo rende più forte.",
        "Due pedoni passati uniti sono una forza enorme: arrivati in sesta traversa battono da soli una torre, perché se la torre ne cattura uno l'altro promuove."
      ],
      sections: [
        {
          title: "Passato protetto e passato esterno",
          paras: [
            "Il passato protetto (difeso da un altro pedone) non può essere catturato dal re avversario: nei finali di pedoni lega il re nemico come un'ancora. Il passato esterno è l'arma classica per vincere i finali di re e pedoni: lo si spinge per attirare il re avversario da una parte e poi il proprio re va a mangiare i pedoni dall'altra.",
            "Quando valuti un finale, conta i pedoni passati possibili: una maggioranza sull'ala (tre contro due, due contro uno) prima o poi crea un passato."
          ]
        },
        {
          title: "Torre e pedone passato",
          paras: [
            "La regola di Tarrasch: le torri vanno dietro ai pedoni passati, sia ai propri (per spingerli) sia a quelli avversari (per frenarli). Una torre davanti al proprio passato è passiva e può diventare vittima di trucchi tattici, come quello che vedrai nella lezione sui finali di torre."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Spingere il passato troppo presto, quando può essere bloccato e perso. Lasciarlo bloccare da un pezzo avversario forte. Dimenticare di bloccare il passato dell'avversario e occuparsi solo del proprio."
          ]
        }
      ],
      keyPoints: [
        "I pedoni passati vanno spinti",
        "Il passato esterno distrae il re avversario",
        "Per fermarlo, blocca la casa davanti",
        "Due passati uniti in sesta battono una torre"
      ],
      example: {
        fen: "8/8/5k2/7p/P7/5K1P/8/8 w - - 0 1",
        steps: [
          { text: "Il pedone a4 è passato: nessun pedone nero può fermarlo. Il re nero è lontano." },
          { move: "a4a5", text: "a5: avanti subito." },
          { move: "f6e6", text: "Il re nero corre verso il pedone." },
          { move: "a5a6", text: "a6." },
          { move: "e6d6", text: "Il re nero è fuori dal quadrato del pedone." },
          { move: "a6a7", text: "a7: non c'è più modo di fermarlo." },
          { move: "d6c7", text: "Troppo tardi." },
          { move: "a7a8q", text: "a8=D: il pedone passato è diventato donna." }
        ]
      },
      exercises: [
        {
          fen: "8/8/2k2PP1/8/8/8/r7/6K1 w - - 0 1",
          prompt: "Due pedoni passati uniti in sesta contro la torre. Il tuo re è lontano: come vinci?",
          solution: ["f6f7"],
          accept: ["f6f7", "g6g7"],
          explanation: "f7 (o g7): spingi! Il Nero dà qualche scacco, ma non può fermare entrambi i pedoni: se la torre ne cattura uno, l'altro promuove. Muovere il re (Rf1 o Rh1) invece regala il tempo per Tf2 o Ta6 e il Nero si salva."
        }
      ],
      practice: { themes: ["endgame"], min: 1200, max: 1600, count: 6, pass: 4 }
    },
    {
      id: "b-torre-attiva",
      grade: "B",
      title: "Finali di torre: le regole d'oro",
      summary: "Torre attiva, torre dietro il passato e re tagliato fuori.",
      theory: [
        "I finali di torre sono i più frequenti in assoluto: si dice che siano metà di tutti i finali. Le regole sono poche e valgono quasi sempre: la torre deve essere attiva, deve stare dietro ai pedoni passati, e serve a tagliare fuori il re avversario.",
        "Torre attiva significa una torre che attacca pedoni, dà scacchi o taglia il re, invece di difendere passivamente un pedone. Spesso conviene perfino sacrificare un pedone per attivare la torre: una torre passiva perde lentamente.",
        "La regola di Tarrasch: le torri stanno dietro ai pedoni passati. Dietro al proprio passato la torre lo spinge e diventa più forte a ogni passo; dietro al passato avversario lo frena e resta attiva. Davanti al proprio pedone, invece, la torre si blocca da sola.",
        "Tagliare fuori il re è il modo più semplice per vincere con un pedone in più: la torre controlla una colonna (o una traversa) e il re avversario non può avvicinarsi al pedone."
      ],
      sections: [
        {
          title: "Il trucco della torre in a8",
          paras: [
            "Pedone bianco in a7, torre bianca in a8 davanti al pedone, torre nera dietro sulla colonna a. Se il re nero è in f7 o e7, il Bianco gioca Th8!: se ...Txa7, Th7+ e la torre nera cade per infilata. Se il re nero è in g7 o h7, il trucco non funziona.",
            "Per questo il difensore, in questi finali, tiene il re proprio su g7 e h7: sono le case sicure."
          ]
        },
        {
          title: "Il re attivo",
          paras: [
            "Nei finali di torre il re è un pezzo d'attacco: deve sostenere i propri pedoni e attaccare quelli avversari. Un re lontano dal gioco è come un pezzo in meno.",
            "Prima di scambiare le torri, invece, fai sempre il conto del finale di pedoni che resta: con il re attivo spesso è vinto, con il re passivo spesso è perso."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Studia le posizioni di Lucena e di Philidor (nella lezione di grado A) e gioca contro il computer i finali di torre con un pedone in più. Annota quali regole hai violato quando non riesci a vincere."
          ]
        }
      ],
      keyPoints: [
        "Torre attiva > torre passiva, anche a costo di un pedone",
        "Torri dietro ai pedoni passati (regola di Tarrasch)",
        "Taglia fuori il re avversario con la torre",
        "Pedone in settima: attento al trucco Th8"
      ],
      example: {
        fen: "R7/P3k3/8/8/8/8/r7/6K1 w - - 0 1",
        steps: [
          { text: "Torre bianca davanti al pedone in a7, torre nera dietro. Il re nero è in e7, sulla settima traversa: il trucco della torre è possibile.", marks: { h8: "hint" } },
          { move: "a8h8", text: "1.Th8!: la torre libera la casa a8. Ora minaccia a8=D." },
          { move: "a2a7", text: "1...Txa7: il Nero prende il pedone..." },
          { move: "h8h7", text: "2.Th7+!: infilata. Il re deve spostarsi e la torre in a7 resta indifesa." },
          { move: "e7d6", text: "2...Rd6." },
          { move: "h7a7", text: "3.Txa7: il Bianco resta con una torre in più. Con il re nero in g7 o h7 tutto questo non sarebbe stato possibile." }
        ]
      },
      exercises: [
        {
          fen: "R7/P4k2/8/8/8/8/r7/6K1 w - - 0 1",
          prompt: "Il re nero è in f7. Trova la mossa che vince.",
          solution: ["a8h8"],
          explanation: "Th8!: se ...Txa7, Th7+ e la torre nera cade; se il Nero lascia stare il pedone, a8=D. Con il re nero in g7 o h7 Th8 non funzionerebbe."
        },
        {
          fen: "8/6k1/r7/P7/8/8/5PPK/2R5 w - - 0 1",
          prompt: "Hai un pedone passato in a5 e la torre nera lo blocca da davanti. Gioca una mossa da buon giocatore di finali di torre.",
          solution: ["c1a1"],
          accept: ["c1a1", "c1c7", "c1c5"],
          explanation: "Ta1 mette la torre dietro al passato (regola di Tarrasch); Tc7+ e Tc5 la attivano tenendo il pedone. Da evitare g4 o Tc3, che lasciano cadere il pedone a5."
        }
      ],
      practice: { themes: ["endgame"], min: 1200, max: 1700, count: 6, pass: 4 }
    },
    {
      id: "b-scoperte-avanzate",
      grade: "B",
      title: "Inchiodature e scoperte nel mediogioco",
      summary: "Le linee nascoste dietro i pezzi.",
      theory: [
        "Nel mediogioco le inchiodature e gli attacchi di scoperta sono più nascosti: le linee sono piene di pezzi e una mossa può aprirne una all'improvviso.",
        "Prima di muovere un pezzo che sta su una linea (colonna, traversa o diagonale) tra un tuo pezzo e uno avversario, chiediti cosa si apre. Vale anche al contrario: guarda cosa può aprire l'avversario.",
        "Un pezzo inchiodato non difende davvero: se difende qualcosa, quella cosa è più debole di quanto sembra.",
        "Il motivo più frequente nelle partite di club è la donna sulla stessa colonna di una torre avversaria, con un pezzo in mezzo: quando il pezzo in mezzo si sposta con una minaccia (meglio se con scacco), la donna è persa."
      ],
      sections: [
        {
          title: "Le radiografie",
          paras: [
            "Una torre dietro un pezzo avversario agisce attraverso di lui: si parla di radiografia. Torre in d1 contro donna in d8 con pezzi in mezzo, alfiere in b2 contro re in g7 con un cavallo in mezzo: sono tensioni latenti che esplodono appena la linea si libera.",
            "Allenati a notare queste linee anche quando sono bloccate: chiediti chi può sgomberarle e con quale tempo."
          ]
        },
        {
          title: "Lo scacco di scoperta in h7",
          paras: [
            "Con l'alfiere in d3 davanti alla torre d1 e la donna nera in d8, Axh7+ è un colpo classico: l'alfiere dà scacco e intanto la torre attacca la donna. Il Nero deve occuparsi del re e la donna cade.",
            "Lo stesso schema esiste con l'alfiere che scopre una donna, o con il cavallo che scopre una torre sulla colonna e."
          ]
        },
        {
          title: "Difendersi",
          paras: [
            "Togli la donna dalle colonne dove può arrivare una torre avversaria. Non lasciare il re sulla stessa diagonale di un alfiere avversario, anche se ci sono pezzi in mezzo. Quando un tuo pezzo è inchiodato, rompi l'inchiodatura appena possibile."
          ]
        }
      ],
      keyPoints: [
        "Ogni mossa può aprire una linea",
        "Il pezzo inchiodato non difende davvero",
        "Controlla le linee di entrambi i colori",
        "Donna sulla colonna di una torre avversaria = pericolo"
      ],
      example: {
        fen: "3q1rk1/pp3ppp/2n1b3/8/8/3B4/PPQ2PPP/3R2K1 w - - 0 1",
        steps: [
          { text: "La torre d1 guarda la donna d8 attraverso l'alfiere d3: è una radiografia. Se l'alfiere si sposta con scacco, la donna è persa.", arrows: [{ from: "d1", to: "d8", color: "red" }] },
          { move: "d3h7", text: "1.Axh7+!: scacco al re e, intanto, la torre attacca la donna." },
          { move: "g8h8", text: "1...Rh8: il Nero deve occuparsi del re." },
          { move: "d1d8", text: "2.Txd8: la donna è presa." },
          { move: "f8d8", text: "2...Txd8: il Nero ha torre e due pezzi minori contro donna e alfiere, ma ha perso materiale e il re è scoperto." }
        ]
      },
      exercises: [
        {
          fen: "3r2k1/ppq2ppp/3b4/8/8/2N1B3/PP3PPP/3Q1RK1 b - - 0 1",
          prompt: "Giochi con il Nero. La tua torre d8 guarda la donna bianca attraverso l'alfiere d6. Vinci la donna.",
          solution: ["d6h2"],
          explanation: "...Axh2+!: l'alfiere dà scacco e scopre la torre d8 sulla donna d1. Il Bianco deve spostare il re e ...Txd1 vince la donna."
        }
      ],
      practice: { themes: ["discoveredAttack", "pin"], min: 1400, max: 1900, count: 6, pass: 4 }
    },
    {
      id: "b-pedone-isolato",
      grade: "B",
      title: "Il pedone isolato",
      summary: "Forza dinamica in mediogioco, debolezza in finale.",
      theory: [
        "Un pedone è isolato quando sulle colonne vicine non ci sono pedoni dello stesso colore. Il caso più importante è il pedone isolato in d4 (o d5), che nasce da molte aperture: Gambetto di Donna accettato, attacco Panov della Caro-Kann, difesa Tarrasch.",
        "Il pedone isolato ha due facce. In mediogioco dà spazio, controlla le case e5 e c5 e apre colonne e diagonali ai pezzi: chi lo possiede attacca. In finale diventa un bersaglio: non può essere difeso da altri pedoni e la casa davanti a lui è un buco perfetto per un pezzo avversario.",
        "Da qui i piani. Chi ha il pedone isolato cerca l'attacco sul lato di re (cavallo in e5, batteria donna-alfiere su h7, torre in e3 o d3 verso il re) e, al momento giusto, la spinta d4-d5 che apre il gioco. Chi gioca contro blocca la casa davanti al pedone, idealmente con un cavallo, e cerca gli scambi: ogni pezzo cambiato avvicina il finale.",
        "Il giudizio dipende quindi da una sola domanda: chi riesce a imporre il proprio tipo di partita? Con molti pezzi e iniziativa il pedone isolato è una forza; con pochi pezzi e nessun attacco è una debolezza."
      ],
      sections: [
        {
          title: "Il piano di chi ha il pedone isolato",
          paras: [
            "Pezzi attivi e diretti verso il re: Ad3 o Ac2, Dd3, Te1, Ag5, cavallo in e5. Le idee tattiche ricorrenti sono i sacrifici in f7 ed e6 (con la torre sulla colonna e) e la spinta d5, che spesso arriva quando i pezzi avversari sono legati alla difesa.",
            "Evita gli scambi inutili, soprattutto dei pezzi che attaccano. E non spingere d5 se non porta qualcosa di concreto: il pedone che avanza senza scopo lascia libere le case dietro di sé."
          ]
        },
        {
          title: "Il piano di chi gioca contro",
          paras: [
            "Blocca la casa davanti al pedone (d5 contro il pedone d4) con un cavallo: lì non può essere cacciato da nessun pedone. Cambia i pezzi, soprattutto quelli che attaccano il tuo re e l'alfiere che punta su h7. Attacca il pedone con torri, cavallo e alfiere: in finale cadrà.",
            "Nimzowitsch descriveva così la strategia: prima bloccare, poi attaccare. Il blocco viene prima perché toglie al pedone la sua forza dinamica."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Gioca entrambe le parti in partite di allenamento con aperture che portano al pedone isolato (per esempio il Gambetto di Donna accettato) e, dopo ogni partita, chiediti chi ha imposto il proprio piano e in quale momento."
          ]
        }
      ],
      keyPoints: [
        "Pedone isolato: dinamico in mediogioco, debole in finale",
        "Chi lo ha: attacco sul re, cavallo in e5, spinta d5",
        "Chi gioca contro: blocca la casa davanti e cambia i pezzi",
        "In finale attaccalo con più pezzi di quanti lo difendono"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Come nasce un pedone isolato: l'attacco Panov della Caro-Kann." },
          { move: "e2e4", text: "1.e4." },
          { move: "c7c6", text: "1...c6." },
          { move: "d2d4", text: "2.d4." },
          { move: "d7d5", text: "2...d5." },
          { move: "e4d5", text: "3.exd5." },
          { move: "c6d5", text: "3...cxd5." },
          { move: "c2c4", text: "4.c4: l'attacco Panov. Il Bianco attacca d5 con un pedone laterale." },
          { move: "g8f6", text: "4...Cf6." },
          { move: "b1c3", text: "5.Cc3." },
          { move: "e7e6", text: "5...e6." },
          { move: "g1f3", text: "6.Cf3." },
          { move: "f8e7", text: "6...Ae7." },
          { move: "c4d5", text: "7.cxd5." },
          { move: "f6d5", text: "7...Cxd5: ecco il pedone isolato in d4. Il cavallo nero occupa già la casa di blocco.", marks: { d4: "bad", d5: "hint" } },
          { move: "f1d3", text: "8.Ad3: l'alfiere punta su h7. Il Bianco arrocca, mette la torre in e1 e cerca l'attacco; il Nero risponde con ...Cc6, ...O-O, ...Cf6 e ...b6-Ab7, pronto a cambiare i pezzi." }
        ]
      },
      exercises: [
        {
          fen: "r2q1rk1/pb1nbppp/1p2pn2/6B1/3P4/1BN2N2/PP3PPP/R2QR1K1 w - - 0 12",
          prompt: "Il Bianco ha il pedone isolato e i pezzi attivi: la torre in e1 guarda il pedone e6, l'alfiere b3 guarda d5. Gioca la rottura tipica di queste posizioni.",
          solution: ["d4d5"],
          explanation: "d5!: il pedone isolato avanza e apre le linee nel momento in cui i pezzi bianchi sono pronti. Dopo ...exd5 la colonna e si apre per la torre e il cavallo arriva in d4 o in d5. Anche Ah4 o De2 sono buone mosse, ma d5 è il piano tipico."
        },
        {
          fen: "3r2k1/pp3ppp/2n2b2/8/3P4/5N2/PPB2PPP/3R2K1 b - - 0 1",
          prompt: "Giochi con il Nero, in finale. Il pedone isolato d4 è attaccato da torre, cavallo e alfiere e difeso solo da torre e cavallo. Prendilo.",
          solution: ["c6d4"],
          explanation: "...Cxd4!: tre attaccanti contro due difensori, e il pedone isolato cade. Dopo Cxd4 Axd4 il Nero ha recuperato il pedone e ha i pezzi più attivi. È esattamente quello che succede in molti finali con il pedone isolato: senza pezzi per attaccare, diventa un bersaglio."
        }
      ]
    },
    {
      id: "b-case-deboli",
      grade: "B",
      title: "Case deboli e avamposti",
      summary: "Le case che nessun pedone può più difendere.",
      theory: [
        "Una casa è debole quando nessun pedone può più difenderla, perché i pedoni vicini sono avanzati o scomparsi. Una casa debole nel campo avversario, protetta da un tuo pedone, è un avamposto: il posto ideale per un cavallo, che lì non può essere cacciato da nessun pedone.",
        "Le case deboli nascono dalle spinte di pedone. Ogni pedone che avanza lascia indietro case che non potrà mai più controllare. Per questo i giocatori forti spingono i pedoni con parsimonia, soprattutto davanti al proprio re.",
        "Un caso tipico è la casa d5 nella Siciliana con ...e5 e ...d6: il pedone nero e5 non la difende più, il pedone c è stato cambiato, e un cavallo bianco in d5 diventa un pezzo dominante. Un altro è il complesso di case scure intorno al re dopo ...g6, quando l'alfiere nero campo scuro è stato cambiato: f6 e h6 diventano buchi.",
        "Legato alle case deboli è il concetto di alfiere buono e cattivo: un alfiere è cattivo quando i suoi pedoni sono fissati sulle case del suo colore, e quindi gli tolgono spazio. Il cavallo su un avamposto contro un alfiere cattivo è uno degli squilibri più favorevoli della strategia."
      ],
      sections: [
        {
          title: "Come sfruttare una casa debole",
          paras: [
            "Primo: individuala e chiediti quale tuo pezzo può arrivarci, e in quante mosse. Secondo: elimina o cambia i pezzi avversari che possono controllarla (spesso il cavallo o l'alfiere dello stesso colore). Terzo: occupala, possibilmente con un cavallo, e usala come base per l'attacco.",
            "Se l'avversario cattura il tuo pezzo sull'avamposto, riprendi in modo da mantenere il controllo della casa: spesso riprendere con un pedone crea un pedone passato protetto."
          ]
        },
        {
          title: "Alfiere buono, alfiere cattivo",
          paras: [
            "Guarda i pedoni centrali fissati: se sono su case chiare, l'alfiere campochiaro è il cattivo. La soluzione per chi lo possiede è portarlo fuori dalla catena di pedoni, o cambiarlo. Per l'avversario, il piano è fissare altri pedoni sulle case di quel colore e cambiare l'alfiere buono.",
            "Un alfiere cattivo può comunque essere utile in difesa: protegge i pedoni che lo bloccano. Il giudizio è sempre concreto."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Spingere i pedoni davanti al re senza motivo, creando buchi. Cambiare l'alfiere che difende le case deboli del proprio colore. Lasciare all'avversario un avamposto permanente nel proprio campo."
          ]
        }
      ],
      keyPoints: [
        "Casa debole: nessun pedone può più difenderla",
        "Avamposto + cavallo = pezzo dominante",
        "Ogni spinta di pedone crea case deboli dietro di sé",
        "Alfiere cattivo: pedoni fissati sul suo colore"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "La casa d5 nella Najdorf con ...e5: come nasce e come si sfrutta." },
          { move: "e2e4", text: "1.e4." },
          { move: "c7c5", text: "1...c5." },
          { move: "g1f3", text: "2.Cf3." },
          { move: "d7d6", text: "2...d6." },
          { move: "d2d4", text: "3.d4." },
          { move: "c5d4", text: "3...cxd4." },
          { move: "f3d4", text: "4.Cxd4." },
          { move: "g8f6", text: "4...Cf6." },
          { move: "b1c3", text: "5.Cc3." },
          { move: "a7a6", text: "5...a6." },
          { move: "c1g5", text: "6.Ag5: l'alfiere punta sul cavallo f6, che controlla d5." },
          { move: "e7e5", text: "6...e5: il Nero guadagna spazio, ma la casa d5 non sarà più difesa da un pedone.", marks: { d5: "hint" } },
          { move: "d4f3", text: "7.Cf3." },
          { move: "f8e7", text: "7...Ae7." },
          { move: "g5f6", text: "8.Axf6!: il Bianco cambia il pezzo che controlla d5." },
          { move: "e7f6", text: "8...Axf6." },
          { move: "c3d5", text: "9.Cd5: il cavallo occupa l'avamposto. Nessun pedone nero può cacciarlo e da lì controlla c7, e7, f6 e b6." }
        ]
      },
      exercises: [
        {
          fen: "r1bqkb1r/5p1p/p1np1p2/1p2p3/4P3/N1N5/PPP2PPP/R2QKB1R w KQkq - 0 10",
          prompt: "Siciliana Sveshnikov: il Nero ha la struttura e5-d6 e ha appena ripreso in f6. Occupa la casa debole.",
          solution: ["c3d5"],
          explanation: "Cd5!: il cavallo si piazza nel buco in d5, da dove non può essere cacciato da nessun pedone. Il Nero dovrà spendere tempo e pezzi per contestarlo."
        },
        {
          fen: "r4rk1/pb1q1p1p/1pn1p1p1/8/4N3/8/PP2QPPP/2R2BK1 w - - 0 1",
          prompt: "Il Nero ha giocato ...g6 senza l'alfiere campo scuro: la casa f6 è un buco. Sfruttalo.",
          solution: ["e4f6"],
          explanation: "Cf6+!: il cavallo salta nel buco con scacco e attacca la donna in d7. Nessun pedone nero può catturarlo, e dopo la mossa del re Cxd7."
        }
      ]
    },

    /* ------------------------------------------------------------ grado A */
    {
      id: "a-finali-torre",
      grade: "A",
      title: "Finali di torre: Lucena e Philidor",
      summary: "Le due posizioni che ogni giocatore deve conoscere.",
      theory: [
        "Una parte enorme dei finali sono finali di torre, e quasi tutti si riducono prima o poi a torre e pedone contro torre. Due posizioni vanno conosciute a memoria, perché sono il punto di arrivo di centinaia di varianti: la posizione di Lucena (che vince) e quella di Philidor (che permette al difensore di salvare la patta).",
        "La posizione di Lucena: il re attaccante è davanti al suo pedone in settima, il re difensore è tagliato fuori di una colonna, la torre difensiva dà scacchi da dietro. Il metodo per vincere si chiama costruire il ponte: la torre attaccante va sulla quarta traversa, il re esce dalla casa di promozione e, quando gli scacchi finiscono, la torre si interpone proteggendo il re.",
        "La posizione di Philidor: il re difensore è davanti al pedone avversario, che non ha ancora raggiunto la sesta traversa. La torre difensiva si mette sulla sesta traversa (la terza dal punto di vista del Bianco) e impedisce al re avversario di avanzare. Quando il pedone avanza in sesta, la torre scende sulla prima traversa e dà scacchi da dietro: il re attaccante non ha più ripari.",
        "Le due posizioni insegnano anche le regole generali: il re che taglia fuori il re avversario vince, la torre attiva difende meglio di quella passiva, e gli scacchi da lontano sono più efficaci di quelli da vicino."
      ],
      sections: [
        {
          title: "Lucena passo per passo",
          paras: [
            "1. Scacco laterale con la torre per spingere il re difensore ancora più lontano dal pedone. 2. Torre sulla quarta traversa (il ponte). 3. Il re esce dalla casa davanti al pedone e si avvicina alla torre, mentre il difensore dà scacchi. 4. Quando il re è sulla quinta traversa, la torre si interpone sulla quarta e copre il re: il pedone promuove.",
            "Il ponte funziona perché la torre, protetta dal re, blocca l'ultimo scacco. Se il difensore prova ad attaccare il pedone invece di dare scacchi, il pedone promuove subito."
          ]
        },
        {
          title: "Philidor passo per passo",
          paras: [
            "1. Re davanti al pedone (o il più vicino possibile). 2. Torre sulla sesta traversa, che impedisce al re attaccante di arrivare in sesta. 3. Appena il pedone avanza in sesta, la torre scende sulla prima traversa (lontano) e dà scacchi da dietro: il re attaccante non può nascondersi davanti al pedone, perché la casa è occupata dal pedone stesso.",
            "L'errore tipico è aspettare passivamente con la torre sull'ultima traversa: così il re attaccante arriva in sesta e la difesa diventa molto più difficile."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Imposta le due posizioni sulla scacchiera e giocale contro il computer da entrambe le parti, dieci volte ciascuna. Poi spostale di una colonna: il metodo resta lo stesso, ma cambiano i dettagli (con i pedoni di cavallo e di torre ci sono eccezioni da scoprire)."
          ]
        }
      ],
      keyPoints: [
        "Lucena: costruisci il ponte con la torre sulla quarta traversa",
        "Philidor: torre sulla sesta, poi scacchi da dietro",
        "Il re tagliato fuori di una colonna decide i finali",
        "Torre attiva > torre passiva"
      ],
      example: {
        fen: "1K1k4/1P6/8/8/8/8/r7/2R5 w - - 0 1",
        steps: [
          { text: "Posizione di Lucena. Il re bianco è bloccato davanti al pedone dalla torre nera sulla colonna a." },
          { move: "c1d1", text: "Td1+: allontana il re nero dal pedone." },
          { move: "d8e7", text: "Il re nero si sposta." },
          { move: "d1d4", text: "Td4!: il ponte. La torre servirà a bloccare gli scacchi." },
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
          prompt: "Posizione di Lucena: comincia il metodo classico allontanando il re nero dal pedone.",
          solution: ["c1d1"],
          accept: ["c1d1"],
          explanation: "Td1+ allontana il re nero di una colonna. Poi Td4 e il ponte: è il metodo più semplice e sicuro, anche se in questa posizione vincono pure altre mosse di torre."
        },
        {
          fen: "1K6/1P2k3/8/8/8/8/r7/3R4 w - - 2 2",
          prompt: "Il re nero è stato allontanato. Prepara il ponte.",
          solution: ["d1d4"],
          accept: ["d1d4", "b8c7"],
          explanation: "Td4: la torre si mette sulla quarta traversa, pronta a interporsi quando il re uscirà. Anche Rc7 subito (con il ponte in c4 più avanti) vince."
        },
        {
          fen: "4k3/7R/8/4PK2/8/8/8/1r6 b - - 0 1",
          prompt: "Giochi con il Nero: difendi con il metodo di Philidor.",
          solution: ["b1b6"],
          explanation: "...Tb6: la torre sulla sesta traversa impedisce al re bianco di avanzare (vanno bene anche a6 e c6, ma non d6, attaccata dal pedone). Se il Bianco spinge e6, la torre scende sulla prima traversa e dà scacchi da dietro: patta."
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
        "Gli attacchi al re più forti nascono dalla collaborazione: due o tre pezzi che puntano sulle stesse case. Un pezzo da solo raramente dà matto.",
        "Nelle combinazioni lunghe tieni a mente quali case controlla ogni tuo pezzo dopo ogni mossa. Disegna mentalmente la gabbia del re: quali case sono coperte, quali restano libere, quale pezzo avversario può tornare a difendere.",
        "Quando la variante è lunga, fissa i punti intermedi: «dopo la mossa due il re è in h8 e la colonna h è aperta». Ti aiuta a non perdere il filo e a ripartire da lì se qualcosa non torna.",
        "Nei matti in tre e quattro compaiono spesso i sacrifici doppi: due pezzi che si offrono uno dopo l'altro per deviare due difensori. Se un solo difensore tiene la posizione, cerca il sacrificio che lo devia; se sono due, cerca la sequenza che li devia entrambi."
      ],
      sections: [
        {
          title: "Il metodo per le varianti lunghe",
          paras: [
            "Primo: individua la forma del matto finale (affogato, corridoio, Anastasia...). Secondo: conta i difensori delle case decisive. Terzo: cerca le mosse forzanti che eliminano o deviano quei difensori, nell'ordine che lascia all'avversario meno scelte.",
            "Per ogni tua mossa considera tutte le risposte, non solo quella naturale: un re che scappa dalla parte inattesa, un pezzo che si interpone con scacco, una cattura intermedia."
          ]
        },
        {
          title: "Il matto di Philidor completo",
          paras: [
            "Lo schema visto in grado B nasce spesso da una posizione con il re in h8: scacco di cavallo in f7, il re torna in g8, scacco doppio in h6, il re torna in h8, sacrificio di donna in g8 e matto affogato in f7. Quattro mosse, tutte forzate.",
            "La condizione è che la donna sia sulla diagonale a2-g8 e che nessun pezzo nero possa catturare il cavallo in f7."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Risolvi i matti in quattro senza muovere i pezzi e scrivi la variante completa, con le risposte dell'avversario. Poi verifica: se hai sbagliato, trova la mossa precisa in cui la tua visualizzazione si è rotta."
          ]
        }
      ],
      keyPoints: [
        "Più pezzi sulle stesse case del re",
        "Disegna la gabbia del re",
        "Fissa posizioni intermedie nelle varianti lunghe",
        "Due difensori? Due sacrifici di deviazione"
      ],
      example: {
        fen: "4r2k/pp4pp/8/q5N1/2Q5/8/PP3PPP/6K1 w - - 0 1",
        steps: [
          { text: "Re nero in h8, donna bianca sulla diagonale verso g8, cavallo in g5. È il momento del matto di Philidor.", arrows: [{ from: "c4", to: "g8", color: "green" }] },
          { move: "g5f7", text: "1.Cf7+: scacco. Il cavallo copre anche la diagonale della donna." },
          { move: "h8g8", text: "1...Rg8: forzata." },
          { move: "f7h6", text: "2.Ch6++: scacco doppio di cavallo e donna." },
          { move: "g8h8", text: "2...Rh8: se ...Rf8, Df7#." },
          { move: "c4g8", text: "3.Dg8+!!: la donna si sacrifica sulla casa protetta dal cavallo." },
          { move: "e8g8", text: "3...Txg8: forzata." },
          { move: "h6f7", text: "4.Cf7#: matto affogato in quattro mosse." }
        ]
      },
      exercises: [
        {
          fen: "r5k1/pp3p1p/5Pp1/8/8/8/PP1Q1PPP/R5K1 w - - 0 1",
          prompt: "Il pedone f6 controlla g7. Matto in due con una mossa tranquilla.",
          solution: ["d2h6"],
          explanation: "Dh6!: nessuno scacco, ma Dg7# è imparabile. Le mosse tranquille sono le più difficili da vedere nei matti: chi cerca solo scacchi non le trova."
        }
      ],
      practice: { themes: ["mateIn3", "mateIn4"], min: 1600, max: 2200, count: 6, pass: 4 }
    },
    {
      id: "a-combinazioni",
      grade: "A",
      title: "Combinazioni da giocatore forte",
      summary: "Motivi multipli nella stessa sequenza.",
      theory: [
        "A questo livello le combinazioni uniscono più motivi: un sacrificio di deviazione seguito da una forchetta, uno scacco di scoperta che prepara un'infilata, un'inchiodatura che rende possibile un matto.",
        "Il segnale che una combinazione esiste è quasi sempre uno di questi: re poco protetto, pezzi non difesi, pezzi sovraccarichi (che difendono due cose), linee aperte verso pezzi importanti, pezzi avversari allineati.",
        "Quando vedi uno di questi segnali, fermati e cerca: anche se la prima mossa sembra assurda, se è forzante vale la pena calcolarla. Molte combinazioni partono da un sacrificio che, da solo, non ha senso.",
        "Una combinazione ben fatta funziona contro tutte le difese. Per questo, dopo averla trovata, cerca la risposta migliore dell'avversario: spesso non è quella che hai immaginato, e la combinazione deve vincere anche contro quella."
      ],
      sections: [
        {
          title: "I motivi che si combinano",
          paras: [
            "Deviazione + matto del corridoio; adescamento del re + forchetta di cavallo; inchiodatura + attacco con il pedone; scacco di scoperta + cattura della donna. Quando un motivo da solo non basta, chiediti quale secondo motivo si apre dopo la prima mossa.",
            "Il pezzo sovraccarico è il collante di molte combinazioni: se un difensore copre due cose, la prima mossa lo costringe a scegliere e la seconda colpisce quella rimasta scoperta."
          ]
        },
        {
          title: "Il sacrificio in f7",
          paras: [
            "Con il re nero in g8 e un cavallo bianco pronto a saltare in g5, Axf7+ è un motivo antico: se il re cattura, Cg5+ attacca il re e un pezzo in e6 o e4 (forchetta). Se il re non cattura, l'alfiere in f7 spesso vince la qualità o apre la colonna f.",
            "Funziona quando il pezzo da vincere (spesso la donna) è su una casa raggiungibile dal cavallo e quando nessun pezzo nero può riprendere in f7 senza conseguenze."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Dopo ogni esercizio risolto, nomina i motivi che hai usato. Classificare le combinazioni (deviazione, forchetta, inchiodatura...) ti aiuta a riconoscerle quando compaiono in forma nuova."
          ]
        }
      ],
      keyPoints: [
        "Segnali: re esposto, pezzi indifesi, difensori sovraccarichi",
        "Una combinazione unisce più motivi",
        "Le mosse assurde ma forzanti vanno calcolate",
        "Controlla la difesa migliore dell'avversario"
      ],
      example: {
        fen: "2rr2k1/5ppp/8/4Q3/8/8/5PPP/3RR1K1 w - - 0 1",
        steps: [
          { text: "Le due torri nere difendono l'ottava traversa: la torre c8 protegge d8, la torre d8 protegge e8. Ogni difensore ha un compito, e ognuno può essere deviato.", arrows: [{ from: "d1", to: "d8", color: "green" }, { from: "e5", to: "e8", color: "green" }] },
          { move: "d1d8", text: "1.Txd8+!: prima deviazione. La torre c8 deve riprendere." },
          { move: "c8d8", text: "1...Txd8: ora l'ottava traversa è difesa da una torre sola." },
          { move: "e5e8", text: "2.De8+!!: seconda deviazione, con la donna." },
          { move: "d8e8", text: "2...Txe8: forzata." },
          { move: "e1e8", text: "3.Txe8#: due motivi (doppia deviazione e matto del corridoio) nella stessa combinazione." }
        ]
      },
      exercises: [
        {
          fen: "r3r1k1/ppp2ppp/2nb4/8/2B1q3/5N2/PPP2PPP/R2Q1RK1 w - - 0 1",
          prompt: "La donna nera è in e4 e il re in g8 difende da solo f7. Trova la mossa che vince materiale contro ogni difesa.",
          solution: ["c4f7"],
          explanation: "Axf7+!: se ...Rxf7, Cg5+ è una forchetta a re e donna; se ...Rh8, Te1 inchioda la donna contro la torre e8 (o Axe8 vince la qualità). Due motivi, una sola mossa."
        }
      ],
      practice: { themes: ["sacrifice", "discoveredAttack"], min: 1800, max: 2200, count: 6, pass: 4 }
    },
    {
      id: "a-finali-tattici",
      grade: "A",
      title: "Finali tattici",
      summary: "Pochi pezzi, calcolo preciso.",
      theory: [
        "Nei finali ogni tempo conta. Un pedone passato avanzato può valere un pezzo intero, e le combinazioni di promozione sono frequenti.",
        "Il re è un pezzo attivo: portalo verso il centro e verso i pedoni. Nei finali tattici controlla sempre se un pedone può promuovere con uno sfondamento, un sacrificio o una sotto-promozione.",
        "Conta i tempi: quante mosse servono a te per promuovere e quante all'avversario? Spesso la partita si decide di un solo tempo, e una mossa di re che fa due cose insieme (avvicinarsi al proprio pedone e al pedone avversario) può salvare una posizione persa.",
        "Non dare per scontata la promozione a donna: a volte un cavallo dà scacco e vince la donna avversaria, a volte una torre evita lo stallo."
      ],
      sections: [
        {
          title: "Lo studio di Réti",
          paras: [
            "Re bianco in h8, pedone bianco in c6; re nero in a6, pedone nero in h5. Sembra tutto perso: il re bianco è lontanissimo dal pedone h, e il re nero prenderà il pedone c. Ma 1.Rg7! h4 2.Rf6! e il re bianco minaccia di raggiungere il pedone h oppure di aiutare il proprio pedone: il Nero non può fare entrambe le cose e la partita è patta.",
            "L'idea di Réti (1921) è la mossa di re in diagonale che insegue due obiettivi insieme. Sulla scacchiera la diagonale è lunga quanto la linea retta: è una scorciatoia che si dimentica facilmente."
          ]
        },
        {
          title: "La sotto-promozione",
          paras: [
            "Si promuove a cavallo quando il cavallo dà scacco e vince qualcosa (spesso con una forchetta), o quando la donna si farebbe catturare o darebbe stallo. Si promuove a torre quando la donna darebbe stallo, come nel celebre studio di Saavedra.",
            "Prima di promuovere, quindi, chiediti: la donna è davvero il pezzo migliore qui?"
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Gli studi di finale sono il miglior allenamento: posizioni con pochi pezzi in cui c'è una sola soluzione, spesso sorprendente. Risolvine uno al giorno, senza muovere i pezzi."
          ]
        }
      ],
      keyPoints: [
        "Pedoni passati e promozioni prima di tutto",
        "Re attivo al centro, e in diagonale verso due obiettivi",
        "Conta i tempi di entrambi",
        "Non sempre si promuove a donna"
      ],
      example: {
        fen: "7K/8/k1P5/7p/8/8/8/8 w - - 0 1",
        steps: [
          { text: "Lo studio di Réti. Il pedone h corre e il re bianco sembra troppo lontano; il re nero prenderà il pedone c6." },
          { move: "h8g7", text: "1.Rg7!: il re avanza in diagonale, verso il pedone h e verso il proprio pedone insieme." },
          { move: "h5h4", text: "1...h4." },
          { move: "g7f6", text: "2.Rf6!: ora il re è nel quadrato del pedone h, oppure può correre ad aiutare il pedone c." },
          { move: "a6b6", text: "2...Rb6: il Nero va a prendere il pedone c." },
          { move: "f6e5", text: "3.Re5!: se ...Rxc6, Rf4 e il re raggiunge il pedone h. Se ...h3, Rd6 e il pedone c promuove insieme a quello nero. Patta." }
        ]
      },
      exercises: [
        {
          fen: "8/2P1k3/1q6/8/8/8/6PP/7K w - - 0 1",
          prompt: "Il tuo pedone in c7 sta per promuovere. Scegli bene il pezzo.",
          solution: ["c7c8n"],
          explanation: "c8=C+!: il cavallo dà scacco al re in e7 e attacca la donna in b6. Dopo la mossa del re, Cxb6. Con c8=D? il Nero dà matto: ...Db1+ Dc1 Dxc1#."
        }
      ],
      practice: { themes: ["endgame"], min: 1800, max: 2200, count: 6, pass: 4 }
    },
    {
      id: "a-attacco-re",
      grade: "A",
      title: "Attacco al re arroccato",
      summary: "Il regalo greco, le spinte di pedone e quando sacrificare.",
      theory: [
        "Il re arroccato è al sicuro solo finché i pezzi che lo proteggono restano al loro posto. Senza il cavallo in f6 il punto h7 diventa debole; senza l'alfiere in g7 le case scure intorno al re diventano buchi.",
        "Il regalo greco (Axh7+) funziona quando ci sono tre condizioni: l'alfiere può prendere in h7, il cavallo può arrivare in g5 con scacco, la donna può arrivare in h5 (o sulla colonna h). Se l'avversario può difendere facilmente g5 o h7, o se il suo re può scappare in g6 senza pericolo, il sacrificio fallisce.",
        "Con gli arrocchi opposti l'attacco si fa con i pedoni: avanzarli contro il re avversario non indebolisce il proprio re. Chi apre per primo le colonne vince la corsa, quindi ogni tempo conta.",
        "In ogni attacco conta i pezzi: se attacchi il re con più pezzi di quelli che lo difendono, di solito un sacrificio funziona. Se no, prima porta altri pezzi: una torre che arriva sulla terza traversa (Tf3-h3) è spesso il pezzo che mancava."
      ],
      sections: [
        {
          title: "Il regalo greco in dettaglio",
          paras: [
            "Dopo Axh7+ Rxh7 Cg5+ il Nero ha tre case. Rg8 porta a Dh5 con la minaccia Dh7#. Rg6 è la difesa più complessa e richiede calcolo preciso (spesso Dg4 o h4-h5 con attacco). Rh6 espone il re a scacchi di scoperta e quasi sempre perde.",
            "Gli ingredienti utili: pedone in e5 che toglie f6 al cavallo nero, alfiere nero lontano da e7 (che coprirebbe g5), torre pronta ad arrivare in h-colonna o in e3-h3."
          ]
        },
        {
          title: "Arrocchi opposti: la corsa dei pedoni",
          paras: [
            "Nella variante del Dragone, per esempio, il Bianco arrocca lungo e spinge h4-h5 per aprire la colonna h, mentre il Nero gioca sulla colonna c con sacrifici di qualità in c3. Le regole sono semplici: non perdere tempo in difesa, aprire linee verso il re avversario, cambiare i pezzi che difendono il re nemico (come l'alfiere g7 con Ah6).",
            "Un pedone sacrificato per aprire una colonna è quasi sempre un buon investimento in queste posizioni."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Sacrificare con un solo pezzo di supporto. Attaccare con i pedoni davanti al proprio re arroccato sullo stesso lato senza un motivo concreto. Dimenticare il centro: un attacco sull'ala si respinge spesso con un contrattacco al centro."
          ]
        }
      ],
      keyPoints: [
        "Senza cavallo in f6, h7 è debole",
        "Regalo greco: alfiere in h7, cavallo g5, donna h5",
        "Arrocchi opposti: attacca con i pedoni e apri linee",
        "Attaccanti più dei difensori prima di sacrificare"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Arrocchi opposti: l'attacco jugoslavo contro il Dragone, un classico dell'attacco con i pedoni." },
          { move: "e2e4", text: "1.e4." },
          { move: "c7c5", text: "1...c5." },
          { move: "g1f3", text: "2.Cf3." },
          { move: "d7d6", text: "2...d6." },
          { move: "d2d4", text: "3.d4." },
          { move: "c5d4", text: "3...cxd4." },
          { move: "f3d4", text: "4.Cxd4." },
          { move: "g8f6", text: "4...Cf6." },
          { move: "b1c3", text: "5.Cc3." },
          { move: "g7g6", text: "5...g6: il Dragone. L'alfiere andrà in g7, sulla diagonale lunga." },
          { move: "c1e3", text: "6.Ae3." },
          { move: "f8g7", text: "6...Ag7." },
          { move: "f2f3", text: "7.f3: protegge e4 e prepara g4." },
          { move: "e8g8", text: "7...O-O." },
          { move: "d1d2", text: "8.Dd2: la donna prepara Ah6 per cambiare l'alfiere g7, il miglior difensore del re nero." },
          { move: "b8c6", text: "8...Cc6." },
          { move: "e1c1", text: "9.O-O-O: arrocchi opposti. Ora il Bianco spingerà h4-h5 e g4, il Nero cercherà il contrattacco sulla colonna c. Vince chi arriva prima." }
        ]
      },
      exercises: [
        {
          fen: "rnbq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 4 7",
          prompt: "Il cavallo nero è stato cacciato da f6 e l'alfiere nero è lontano, in b4. Gioca il regalo greco e continua l'attacco.",
          solution: ["d3h7", "g8h7", "f3g5"],
          explanation: "Axh7+! Rxh7 Cg5+: dopo ...Rg8 segue Dh5 (o Dd3) con la minaccia Dh7#, e il Nero deve dare materiale, per esempio ...Dxg5 Axg5. L'alfiere in b4 non può tornare in e7 a coprire g5: è la condizione che fa funzionare il sacrificio."
        }
      ],
      practice: { themes: ["mateIn3", "sacrifice"], min: 1600, max: 2000, count: 6, pass: 4 }
    },
    {
      id: "a-risorse-difensive",
      grade: "A",
      title: "Risorse difensive: stallo e scacco perpetuo",
      summary: "Salvare partite che sembrano perse.",
      theory: [
        "Anche in posizioni perse esistono risorse: lo scacco perpetuo (dare scacco all'infinito) e lo stallo (rimanere senza mosse legali senza essere sotto scacco) portano alla patta. Ci sono poi le fortezze: posizioni in cui chi ha più materiale non riesce a sfondare.",
        "Quando sei in svantaggio cerca di semplificare verso finali di patta conosciuti (pedone di torre con l'alfiere sbagliato, alfieri di colore contrario, torre contro torre e pedone in posizione di Philidor), attiva il re e crea problemi all'avversario con minacce concrete.",
        "Quando sei in vantaggio, al contrario, controlla sempre che l'avversario non abbia scacchi perpetui o stalli a disposizione. La tecnica più sicura è mettere il re al riparo dagli scacchi prima di raccogliere il materiale.",
        "Lo stallo come risorsa ha forme ricorrenti: la torre pazza che si offre dando scacco, la donna che si sacrifica quando il proprio re non ha mosse, il re nell'angolo contro il pedone di torre o di alfiere in settima."
      ],
      sections: [
        {
          title: "Donna contro pedone in settima",
          paras: [
            "Con il pedone avversario in settima su una colonna centrale o di cavallo, la donna vince di solito avvicinando il proprio re. Ma con il pedone di alfiere o di torre il difensore ha una risorsa: il re va nell'angolo, e se la donna cattura il pedone è stallo. Se il re attaccante è lontano, è patta.",
            "È uno di quei finali da conoscere: decide se conviene correre a promuovere o fermarsi a difendere."
          ]
        },
        {
          title: "La mentalità del difensore",
          paras: [
            "Non arrenderti finché non hai controllato le risorse: il tuo re ha poche mosse? Puoi dare scacchi continui? Esiste un finale teoricamente patto a portata di mano? Molte partite si salvano perché l'avversario, convinto di avere già vinto, smette di calcolare.",
            "Crea problemi: la mossa che obbliga l'avversario a trovare un'unica risposta è spesso la migliore difesa pratica."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Raccogli le tue partite perse da posizioni migliori e quelle salvate da posizioni perse: confrontale e cerca il momento in cui la risorsa è comparsa. Imparerai a sentirla arrivare."
          ]
        }
      ],
      keyPoints: [
        "Scacco perpetuo, stallo e fortezze = patta",
        "In svantaggio crea problemi, non aspettare",
        "In vantaggio metti il re al riparo prima di raccogliere",
        "Torre pazza e donna kamikaze: lo stallo come arma"
      ],
      example: {
        fen: "8/8/8/6K1/8/2Q5/2p5/1k6 w - - 0 1",
        steps: [
          { text: "Donna contro pedone di alfiere in settima, con il re bianco lontano. Sembra una vittoria facile." },
          { move: "c3b3", text: "1.Db3+: il Bianco dà scacco per guadagnare tempo." },
          { move: "b1a1", text: "1...Ra1!: il re va nell'angolo. Ora se 2.Dxc2 è stallo: il Nero non ha mosse e non è sotto scacco.", marks: { c2: "bad" } },
          { move: "b3a3", text: "2.Da3+: il Bianco riprova." },
          { move: "a1b1", text: "2...Rb1: il re torna, e il pedone resta pronto a promuovere. Il re bianco è troppo lontano per aiutare: patta." }
        ]
      },
      exercises: [
        {
          fen: "k7/8/8/8/8/p7/P1q5/K6R w - - 0 1",
          prompt: "Il tuo re non ha mosse e il Nero minaccia matto. Hai solo la torre: salva la partita.",
          solution: ["h1h8"],
          explanation: "Th8+!: la torre pazza. Darà scacco a ogni mossa, e se il Nero la cattura il Bianco non ha mosse legali: stallo. Il re nero non può sfuggire agli scacchi senza avvicinarsi alla torre. Qualsiasi altra mossa perde subito."
        }
      ],
      practice: { themes: ["defensiveMove"], min: 1600, max: 2100, count: 6, pass: 4 }
    },
    {
      id: "a-finali-complessi",
      grade: "A",
      title: "Finali con più pezzi",
      summary: "Attività, pedoni passati e il re al centro.",
      theory: [
        "Nei finali con più pezzi il principio è l'attività: un pezzo attivo vale più di un pedone in più con pezzi passivi.",
        "Crea pedoni passati dove sei in maggioranza, porta il re al centro e scambia i pezzi quando il finale che resta è vinto. Lo scambio giusto al momento giusto è la tecnica più importante dei finali.",
        "Prima di ogni scambio immagina il finale che resta: è vinto, patto o perso? Con i pedoni da entrambe le parti, un pedone passato esterno di solito decide il finale di re e pedoni, perché attira il re avversario lontano dal resto della scacchiera.",
        "Il re va centralizzato appena le donne spariscono: nei finali è un pezzo che vale quasi quanto una torre."
      ],
      sections: [
        {
          title: "Quali pezzi scambiare",
          paras: [
            "Con un vantaggio di materiale scambia i pezzi, non i pedoni: ogni pezzo in meno rende il vantaggio più pesante, ogni pedone in meno riduce le possibilità di vincere. Con un vantaggio posizionale (un pezzo migliore dell'avversario) scambia i pezzi dell'avversario che difendono le sue debolezze.",
            "Attenzione agli alfieri di colore contrario: sono il finale più patto di tutti, anche con uno o due pedoni in più."
          ]
        },
        {
          title: "Il passato esterno nel finale di pedoni",
          paras: [
            "Con quattro pedoni contro tre, tre dei quali di fronte sull'ala di re e uno passato sull'ala di donna, il finale di re e pedoni è quasi sempre vinto: il re difensore deve fermare il passato, e intanto il re attaccante divora i pedoni sull'altra ala.",
            "Per questo, con il passato esterno, lo scambio delle ultime torri o delle donne è spesso la via più rapida per vincere."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Nelle partite di allenamento, ogni volta che uno scambio porta a un finale, fermati e scrivi la tua valutazione del finale che resta. Dopo la partita controlla con il computer: imparerai in fretta a riconoscere i finali vinti."
          ]
        }
      ],
      keyPoints: [
        "Attività dei pezzi prima di tutto",
        "Crea pedoni passati con la maggioranza",
        "Prima di scambiare valuta il finale che resta",
        "Con il passato esterno il finale di pedoni è vinto"
      ],
      example: {
        fen: "6k1/5ppp/8/8/8/8/PPP2PPP/6K1 w - - 0 1",
        steps: [
          { text: "Finale di re e pedoni con un pedone in più sull'ala di donna. Il piano: creare un passato esterno e spingerlo." },
          { move: "a2a4", text: "1.a4: il pedone a è già passato. Va spinto subito, perché il re nero è lontano." },
          { move: "h7h6", text: "1...h6." },
          { move: "a4a5", text: "2.a5." },
          { move: "g7g5", text: "2...g5." },
          { move: "a5a6", text: "3.a6: il re nero in g8 è fuori dal quadrato del pedone." },
          { move: "g5g4", text: "3...g4." },
          { move: "a6a7", text: "4.a7 e il pedone promuove. Un pedone passato esterno, con il re avversario lontano, vale un pezzo." }
        ]
      },
      exercises: [
        {
          fen: "3q4/4kppp/8/8/P7/8/5PPP/3Q2K1 w - - 0 1",
          prompt: "Hai un pedone passato esterno in a4. Trova la mossa che porta a un finale vinto.",
          solution: ["d1d8"],
          explanation: "Dxd8+! Rxd8 e il finale di pedoni è vinto: il re nero deve correre verso il pedone a, e il re bianco va a mangiare i pedoni dell'ala di re. Con le donne in gioco la vittoria sarebbe molto più difficile."
        }
      ],
      practice: { themes: ["endgame"], min: 1900, max: 2300, count: 6, pass: 4 }
    },
    {
      id: "a-strutture",
      grade: "A",
      title: "Strutture pedonali: catene, doppiati e sospesi",
      summary: "Leggere i pedoni per capire dove giocare.",
      theory: [
        "I pedoni sono l'anima degli scacchi, diceva Philidor. La loro struttura decide dove si gioca: le catene indicano la direzione dell'attacco, i pedoni deboli indicano i bersagli, le colonne aperte indicano dove vanno le torri.",
        "Una catena di pedoni (per esempio d4-e5 per il Bianco contro d5-e6 per il Nero, come nella Difesa Francese) si attacca alla base: il Nero colpisce d4 con ...c5 e la base e5 con ...f6. Chi ha la catena di solito attacca sul lato verso cui la catena punta: con e5 il Bianco attacca sul lato di re.",
        "I pedoni doppiati (due pedoni sulla stessa colonna) sono deboli soprattutto nei finali, perché non si proteggono a vicenda e valgono meno nel creare pedoni passati. In mediogioco però spesso aprono colonne utili e controllano case centrali: vanno giudicati caso per caso.",
        "I pedoni sospesi (due pedoni affiancati, come c4 e d4, senza pedoni sulle colonne vicine) sono una forza dinamica finché possono avanzare e una debolezza se vengono fermati e attaccati. Chi li ha cerca la spinta d5 al momento giusto; chi gioca contro li blocca e li attacca con i pezzi."
      ],
      sections: [
        {
          title: "Catene di pedoni: la regola di Nimzowitsch",
          paras: [
            "Si attacca la catena alla base, non in testa: la base è il pedone che sostiene tutti gli altri. Nella Francese di avanzata la base bianca è d4, e infatti la reazione naturale del Nero è ...c5 subito, seguita da ...Cc6 e ...Db6 per aumentare la pressione.",
            "Se la base cede, la testa della catena diventa un pedone isolato e debole. Se invece regge, chi ha la catena ottiene spazio e un attacco sull'ala dove la catena punta."
          ]
        },
        {
          title: "Pedoni sospesi e isolati: parenti stretti",
          paras: [
            "Quando i pedoni sospesi vengono attaccati, uno dei due spesso avanza e si trasforma in un pedone isolato o in un passato. Per questo chi li possiede deve scegliere il momento della spinta: troppo presto e lascia buchi, troppo tardi e i pedoni vengono bloccati.",
            "Chi gioca contro i pedoni sospesi cerca di costringerli ad avanzare con attacchi di pezzi e pedoni (per esempio ...b5 o ...e5), per poi bloccarli e attaccare il pedone rimasto indietro."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Prima di scegliere un piano, descrivi a parole la struttura: catene, pedoni isolati o doppiati, colonne aperte, case deboli. Dopo qualche settimana lo farai in pochi secondi, e i piani verranno da soli."
          ]
        }
      ],
      keyPoints: [
        "La catena si attacca alla base",
        "Si attacca dal lato verso cui punta la catena",
        "Doppiati: deboli in finale, utili per le colonne",
        "Sospesi: forti se avanzano, deboli se bloccati"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "La catena di pedoni nella Difesa Francese, variante di avanzata." },
          { move: "e2e4", text: "1.e4." },
          { move: "e7e6", text: "1...e6." },
          { move: "d2d4", text: "2.d4." },
          { move: "d7d5", text: "2...d5." },
          { move: "e4e5", text: "3.e5: nasce la catena d4-e5. Punta verso il lato di re, dove il Bianco cercherà l'attacco.", marks: { d4: "hint", e5: "hint" } },
          { move: "c7c5", text: "3...c5: il Nero attacca subito la base della catena." },
          { move: "c2c3", text: "4.c3: il Bianco sostiene la base." },
          { move: "b8c6", text: "4...Cc6: altra pressione su d4." },
          { move: "g1f3", text: "5.Cf3." },
          { move: "d8b6", text: "5...Db6: tre pezzi contro d4. Più avanti arriverà anche ...f6, contro la testa e5. È la lotta tipica di questa struttura." }
        ]
      },
      exercises: [
        {
          fen: "rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3",
          prompt: "Giochi con il Nero nella Francese di avanzata. Attacca la catena bianca nel punto giusto.",
          solution: ["c7c5"],
          explanation: "...c5!: si colpisce la base della catena, il pedone d4. È la mossa più naturale e più forte: senza questa pressione il Bianco avrebbe spazio e mani libere sul lato di re."
        }
      ]
    },
    {
      id: "a-piano",
      grade: "A",
      title: "Come fare un piano nel mediogioco",
      summary: "Squilibri, debolezze e il pezzo peggiore.",
      theory: [
        "Fare un piano non significa prevedere venti mosse: significa sapere che cosa vuoi ottenere nelle prossime cinque o dieci. Il punto di partenza è sempre la valutazione della posizione, e la valutazione si fa con gli squilibri.",
        "Gli squilibri principali sono: materiale, struttura dei pedoni, pezzi minori (alfiere contro cavallo, coppia degli alfieri), spazio, sviluppo e iniziativa, sicurezza dei re, controllo di colonne e case chiave. Il tuo piano nasce dagli squilibri a tuo favore: se hai più spazio sul lato di re, gioca lì; se l'avversario ha un pedone debole, attaccalo.",
        "Quando non ci sono squilibri evidenti, le domande semplici funzionano: qual è il mio pezzo peggiore e come lo miglioro? Quale pezzo avversario è il migliore e posso cambiarlo? Quale spinta di pedone migliora la mia struttura?",
        "Un buon piano tiene conto anche dell'avversario: prima di lanciarti, chiediti che cosa farebbe lui se avesse la mossa. Se la sua idea è più veloce o più pericolosa della tua, il primo passo del tuo piano è impedirla."
      ],
      sections: [
        {
          title: "Un metodo in quattro passi",
          paras: [
            "1. Guarda le minacce tattiche: se ci sono, il piano può aspettare. 2. Elenca gli squilibri e decidi quali sono a tuo favore. 3. Scegli il settore dove giocare (dove sei più forte o dove l'avversario è più debole). 4. Trova la prima mossa concreta: il pezzo da migliorare, la colonna da occupare, la spinta da preparare.",
            "Non serve essere precisi al millimetro: un piano ragionevole giocato con coerenza batte quasi sempre una serie di mosse buone ma scollegate."
          ]
        },
        {
          title: "Pianificare la semplificazione",
          paras: [
            "Uno dei piani più importanti è la trasformazione: cambiare i pezzi per arrivare a un finale vinto. Per farlo bisogna saper valutare i finali che restano. Con un pedone passato esterno, per esempio, lo scambio delle torri porta spesso a un finale di pedoni vinto.",
            "La domanda da farsi è: se cambio tutto quello che posso, chi vince il finale? Se la risposta è «io», semplificare è il piano."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Giocare mosse senza scopo («aspetto che lui sbagli»). Cambiare piano a ogni mossa. Ignorare il piano dell'avversario. Scegliere il piano più spettacolare invece di quello più adatto alla struttura."
          ]
        }
      ],
      keyPoints: [
        "Il piano nasce dagli squilibri a tuo favore",
        "Migliora il pezzo peggiore, cambia il migliore dell'avversario",
        "Prima di attaccare, guarda il piano avversario",
        "Semplificare verso un finale vinto è un piano"
      ],
      example: {
        fen: "r1b2rk1/pp1nqppp/2p1p3/3n4/2BP4/2N1PN2/PPQ2PPP/R4RK1 w - - 0 1",
        steps: [
          { text: "Una posizione tipica del Gambetto di Donna. Squilibri: il Bianco ha più spazio al centro e l'alfiere c4 attivo; il Nero è solido ma ha l'alfiere c8 chiuso. Il piano del Bianco: tenere il centro, impedire la liberazione ...e5 e attaccare.", arrows: [{ from: "c4", to: "e6", color: "green" }] },
          { move: "c3e4", text: "1.Ce4: il cavallo evita il cambio in c3 (che aiuterebbe il Nero ad alleggerire la posizione) e si dirige verso g5 o d6." },
          { move: "f8d8", text: "1...Td8: il Nero prepara ...c5 per liberarsi." },
          { move: "f3e5", text: "2.Ce5: il secondo cavallo occupa la casa centrale. Il Bianco ha un piano chiaro e i pezzi attivi; il Nero dovrà cambiare per respirare." }
        ]
      },
      exercises: [
        {
          fen: "3r4/4kppp/8/8/P7/8/5PPP/3R2K1 w - - 0 1",
          prompt: "Hai un pedone passato esterno. Qual è il piano più semplice per vincere?",
          solution: ["d1d8"],
          explanation: "Txd8! Rxd8 e il finale di re e pedoni è vinto: il re nero deve fermare il pedone a, il re bianco va a prendere i pedoni dell'ala di re. Pianificare significa anche sapere quando semplificare."
        }
      ]
    },
    {
      id: "a-minoranza",
      grade: "A",
      title: "L'attacco di minoranza",
      summary: "Due pedoni contro tre per creare una debolezza.",
      theory: [
        "L'attacco di minoranza è uno dei piani strategici più famosi. Nasce soprattutto nella struttura Carlsbad del Gambetto di Donna, variante di cambio: il Bianco ha i pedoni a2, b2, d4, e3, il Nero a7, b7, c6, d5, e6. Sull'ala di donna il Bianco ha due pedoni contro tre: una minoranza.",
        "L'idea è spingere b4 e b5 per scambiare il pedone b5 con il pedone c6. Se il Nero riprende con un pedone (...cxb5 o ...bxc6), resta con un pedone debole: un pedone d5 isolato o un pedone c6 arretrato, su una colonna semiaperta, bersaglio perfetto per torri e pezzi minori.",
        "Il Bianco prepara la spinta con Tb1 (o la torre sulla colonna c), a3 o a4, e la donna in c2 o b3. Nel frattempo il Nero non sta a guardare: il suo piano tipico è l'attacco sul lato di re, con il cavallo che arriva in e4 o g6, la torre che si attiva sulla traversa e i pezzi diretti verso il re bianco.",
        "Come sempre nelle strutture asimmetriche, conta la velocità: se l'attacco di minoranza crea la debolezza prima che il Nero sfondi sul lato di re, il Bianco ha un vantaggio duraturo."
      ],
      sections: [
        {
          title: "Il piano del Bianco",
          paras: [
            "Pezzi in posizione: Tb1, Dc2, Ad3, cavalli in f3 e c3. Poi b4, a4 e b5. Dopo lo scambio in c6 il bersaglio è il pedone debole: torri sulla colonna c, cavallo in a4-c5, eventualmente re al centro nel finale.",
            "Il momento migliore per spingere b5 è quando il Nero non può rispondere ...c5 o mantenere la struttura con ...a6 senza perdere qualcosa."
          ]
        },
        {
          title: "La difesa del Nero",
          paras: [
            "Il Nero può contrastare l'attacco di minoranza in due modi: con il contrattacco sul lato di re (...Ce4, ...f5, ...Tf6-h6) oppure accettando la debolezza ma piazzando i pezzi in modo che sia difficile da attaccare (per esempio il cavallo in d6 che protegge c4 e b5).",
            "Una risorsa tipica è ...b5 al momento giusto, che blocca la minoranza e lascia al Bianco la casa c5 ma toglie il bersaglio principale."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Gioca la variante di cambio del Gambetto di Donna in partite di allenamento, una volta con il Bianco e una con il Nero. Annota quante mosse servono al Bianco per b5 e quante al Nero per il suo attacco: capirai in fretta la corsa dei piani."
          ]
        }
      ],
      keyPoints: [
        "Struttura Carlsbad: due pedoni contro tre sull'ala di donna",
        "b4-b5 per creare un pedone debole in c6 o d5",
        "Preparazione: Tb1, a3 o a4, donna in c2",
        "Il Nero risponde con l'attacco sul lato di re"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "La variante di cambio del Gambetto di Donna e la preparazione dell'attacco di minoranza." },
          { move: "d2d4", text: "1.d4." },
          { move: "d7d5", text: "1...d5." },
          { move: "c2c4", text: "2.c4." },
          { move: "e7e6", text: "2...e6." },
          { move: "b1c3", text: "3.Cc3." },
          { move: "g8f6", text: "3...Cf6." },
          { move: "c4d5", text: "4.cxd5: la variante di cambio." },
          { move: "e6d5", text: "4...exd5: nasce la struttura Carlsbad.", marks: { a2: "hint", b2: "hint", a7: "bad", b7: "bad", c7: "bad" } },
          { move: "c1g5", text: "5.Ag5." },
          { move: "c7c6", text: "5...c6." },
          { move: "d1c2", text: "6.Dc2." },
          { move: "f8e7", text: "6...Ae7." },
          { move: "e2e3", text: "7.e3." },
          { move: "b8d7", text: "7...Cbd7." },
          { move: "f1d3", text: "8.Ad3." },
          { move: "e8g8", text: "8...O-O." },
          { move: "g1f3", text: "9.Cf3." },
          { move: "f8e8", text: "9...Te8." },
          { move: "e1g1", text: "10.O-O." },
          { move: "d7f8", text: "10...Cf8: il cavallo va verso g6, sul lato di re." },
          { move: "a1b1", text: "11.Tb1: la torre si prepara a sostenere b4 e b5. Il piano del Bianco è chiaro." }
        ]
      },
      exercises: [
        {
          fen: "r1bqr1k1/pp2bppp/2p2nn1/3p2B1/3P4/2NBPN2/PPQ2PPP/1R3RK1 w - - 9 12",
          prompt: "La torre è in b1 e i pezzi sono pronti. Dai il via all'attacco di minoranza.",
          solution: ["b2b4"],
          explanation: "b4!: il primo passo. Seguiranno a4 e b5 per scambiare il pedone c6 e lasciare al Nero un pedone debole. Il Nero cercherà contrattacco con ...Ce4 sul lato di re."
        }
      ]
    },
    {
      id: "a-pezzi-minori",
      grade: "A",
      title: "Finali di pezzi minori",
      summary: "Alfiere contro cavallo, alfieri di colore contrario, alfiere sbagliato.",
      theory: [
        "Nei finali con i pezzi minori la regola principale è semplice: l'alfiere ama le posizioni aperte e i pedoni su entrambi i lati della scacchiera, il cavallo ama le posizioni chiuse e i pedoni su un solo lato. Un alfiere può fermare un pedone da lontano, un cavallo deve avvicinarsi.",
        "Gli alfieri di colore contrario (uno campo chiaro, l'altro campo scuro) portano spesso alla patta anche con uno o due pedoni in più: il difensore blocca i pedoni sulle case del colore del suo alfiere, dove l'altro alfiere non può mai attaccarli. Con altri pezzi sulla scacchiera, invece, gli alfieri di colore contrario favoriscono chi attacca, perché nessuno dei due alfieri può difendere le case dell'altro colore.",
        "Il caso dell'alfiere sbagliato: re, alfiere e pedone di torre contro re è patta se l'alfiere non controlla la casa di promozione e il re difensore raggiunge l'angolo. Per esempio pedone a con alfiere campo scuro: la casa a8 è chiara, l'alfiere non potrà mai cacciare il re nero da lì.",
        "Con alfiere contro cavallo e pedoni su entrambi i lati, l'alfiere di solito è più forte; con tutti i pedoni su un lato, il cavallo regge bene. Il re attivo resta comunque il fattore decisivo."
      ],
      sections: [
        {
          title: "Alfieri di colore contrario: come difendersi",
          paras: [
            "Il difensore cerca una fortezza: re davanti ai pedoni avversari, alfiere che controlla una casa sulla loro strada. Se i pedoni avversari sono uniti, il re si mette davanti e l'alfiere li tiene dalla diagonale; se sono separati di almeno tre colonne, il compito è molto più difficile e spesso la posizione è persa.",
            "Per chi attacca il piano è creare due pedoni passati lontani tra loro: re e alfiere difensori non riescono a coprirli entrambi."
          ]
        },
        {
          title: "Il cavallo contro l'alfiere cattivo",
          paras: [
            "Se i pedoni del difensore sono fissati sulle case del colore del suo alfiere, il cavallo può attaccarli da case che l'alfiere non controlla mai. È il caso classico del buon cavallo contro alfiere cattivo, visto nella lezione sulle case deboli.",
            "La tecnica: fissare i pedoni avversari con i propri, portare il cavallo su una casa forte e infiltrare il re."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Gioca contro il computer le posizioni base: alfiere sbagliato con pedone di torre, alfieri di colore contrario con un pedone in più, cavallo contro pedone passato. Bastano poche partite per ciascuna."
          ]
        }
      ],
      keyPoints: [
        "Alfiere: pedoni su due lati. Cavallo: pedoni su un lato",
        "Alfieri di colore contrario: finali pattosi, mediogiochi d'attacco",
        "Alfiere sbagliato + pedone di torre: con il re nell'angolo è patta",
        "Il re attivo decide anche questi finali"
      ],
      example: {
        fen: "8/2b2k2/p3p1p1/1p1pPp2/1P1P1P2/P2N2P1/5K2/8 w - - 0 1",
        steps: [
          { text: "Cavallo contro alfiere cattivo: i pedoni neri sono fissati su case chiare, l'alfiere nero (campo scuro) non può difenderli.", marks: { a6: "bad", e6: "bad", g6: "bad" } },
          { move: "d3c5", text: "1.Cc5: il cavallo occupa la casa forte, da cui attacca a6 ed e6. Nessun pedone nero potrà mai cacciarlo." },
          { move: "c7b6", text: "1...Ab6: l'alfiere prova a contestare il cavallo." },
          { move: "c5b3", text: "2.Cb3: il cavallo evita il cambio e cerca un'altra strada (a5-b7 o d2-f3-g5). Il Bianco non rischia nulla e il Nero deve difendersi a lungo: con la difesa giusta la posizione resta in equilibrio, ma è il Bianco a giocare per vincere." }
        ]
      },
      exercises: [
        {
          fen: "8/4k3/8/P7/8/1K6/8/2B5 b - - 0 1",
          prompt: "Giochi con il Nero: il Bianco ha l'alfiere campo scuro e il pedone a. Trova la mossa che salva la partita.",
          solution: ["e7d7"],
          accept: ["e7d7", "e7d6"],
          explanation: "...Rd7 (o ...Rd6): il re corre verso l'angolo a8 passando per c7 e b8. L'alfiere campo scuro non controlla a8: una volta lì, il re nero non può essere cacciato. Con mosse più lente il pedone promuove."
        }
      ],
      practice: { themes: ["endgame"], min: 1600, max: 2100, count: 6, pass: 4 }
    },

    /* ------------------------------------------------------------ grado S */
    {
      id: "s-matti-profondi",
      grade: "S",
      title: "Matti profondi",
      summary: "Quattro, cinque mosse e oltre di calcolo forzato.",
      theory: [
        "Ai livelli più alti un attacco si vince calcolando fino al matto, non sperando. Le sequenze di quattro o cinque mosse richiedono metodo: candidate forzanti, risposte complete, controllo finale.",
        "La differenza con i matti brevi è la memoria di lavoro: devi tenere in testa una posizione che cambia molto. Per questo i giocatori forti calcolano per blocchi: «dopo il sacrificio il re è in h7 e la colonna h è aperta» diventa un punto fermo da cui ripartire.",
        "Allenati a calcolare senza toccare i pezzi e solo dopo verifica. L'abitudine di confermare la variante intera prima di muovere è quella che separa un candidato maestro da un buon giocatore di club.",
        "Nei matti profondi il re avversario spesso viene trascinato fuori dal suo rifugio: la caccia al re. Una volta che il re è all'aperto, ogni scacco lo spinge in territorio nemico, e i pezzi che sembravano lontani entrano in gioco uno dopo l'altro."
      ],
      sections: [
        {
          title: "La caccia al re",
          paras: [
            "Nella partita Edward Lasker – Thomas (Londra 1912) il Bianco sacrifica la donna in h7 e il re nero viene spinto con una serie di scacchi da g8 fino a g1, dove riceve matto. È l'esempio più celebre di caccia al re: ogni mossa del Bianco è uno scacco, e il re nero non ha mai una scelta che lo salvi.",
            "La lezione pratica: quando il re avversario esce dal riparo, cerca gli scacchi che lo spingono verso i tuoi pezzi, non quelli che lo lasciano tornare a casa."
          ]
        },
        {
          title: "Calcolare per blocchi",
          paras: [
            "Dividi la variante in tappe: sacrificio iniziale, fuga del re, prima ondata di scacchi, arrivo dei pezzi lenti, matto. A ogni tappa fermati e verifica la posizione: case libere del re, pezzi che possono interporsi, scacchi intermedi dell'avversario.",
            "Se a una tappa trovi un problema, non buttare tutta l'idea: spesso basta cambiare l'ordine delle mosse."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Prendi matti in quattro o cinque e risolvili guardando la posizione per un tempo fisso (cinque minuti), poi scrivi la variante e solo alla fine controlla. Con il tempo la visualizzazione diventa più nitida e più lunga."
          ]
        }
      ],
      keyPoints: [
        "Calcola fino al matto prima di sacrificare",
        "Una variante alla volta, tutte le risposte",
        "Calcola per blocchi e fissa i punti intermedi",
        "Re fuori dal riparo: cerca gli scacchi che lo spingono avanti"
      ],
      example: {
        fen: "rn3rk1/pbppq1pp/1p2pb2/4N2Q/3PN3/3B4/PPP2PPP/R3K2R w KQ - 6 11",
        steps: [
          { text: "Ed. Lasker – Thomas, Londra 1912. Il Bianco ha tutti i pezzi puntati sul re nero. Segue una delle cacce al re più famose della storia." },
          { move: "h5h7", text: "11.Dxh7+!!: sacrificio di donna." },
          { move: "g8h7", text: "11...Rxh7." },
          { move: "e4f6", text: "12.Cxf6+: scacco di scoperta dell'alfiere d3." },
          { move: "h7h6", text: "12...Rh6." },
          { move: "e5g4", text: "13.Ceg4+." },
          { move: "h6g5", text: "13...Rg5." },
          { move: "h2h4", text: "14.h4+." },
          { move: "g5f4", text: "14...Rf4." },
          { move: "g2g3", text: "15.g3+." },
          { move: "f4f3", text: "15...Rf3: il re nero è ormai nel campo bianco." },
          { move: "d3e2", text: "16.Ae2+." },
          { move: "f3g2", text: "16...Rg2." },
          { move: "h1h2", text: "17.Th2+." },
          { move: "g2g1", text: "17...Rg1." },
          { move: "e1d2", text: "18.Rd2#: il re nero, partito da g8, riceve matto in g1." }
        ]
      },
      practice: { themes: ["mateIn4", "mateIn5"], min: 2000, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-tattica-maestro",
      grade: "S",
      title: "Tattica da maestro",
      summary: "Sacrifici profondi e mosse tranquille.",
      theory: [
        "Le combinazioni dei maestri hanno spesso una mossa tranquilla nel mezzo: dopo i sacrifici, una mossa che non dà scacco ma crea una minaccia impossibile da parare, o porta un pezzo in più nell'attacco.",
        "Cerca anche le risorse dell'avversario: la combinazione è corretta solo se funziona contro la sua difesa migliore. I maestri passano più tempo a cercare la confutazione delle proprie idee che a cercare le idee stesse.",
        "Le combinazioni più profonde sono preparate dalla posizione: vantaggio di sviluppo, re avversario al centro, pezzi avversari inchiodati. Quando questi elementi ci sono, la combinazione quasi sempre esiste, e il compito è trovarla.",
        "Infine, i sacrifici si fanno per tempo, linee e case: un pezzo dato per aprire una colonna verso il re o per guadagnare due tempi di sviluppo può valere più del materiale."
      ],
      sections: [
        {
          title: "La partita dell'Opera",
          paras: [
            "Parigi 1858: Paul Morphy gioca contro il duca di Brunswick e il conte Isouard durante una rappresentazione all'Opera. Dopo un'apertura in cui i suoi avversari perdono tempo, Morphy sviluppa tutto, sacrifica un cavallo per aprire le linee e chiude con una combinazione di sacrifici e una mossa tranquilla, Td1, che porta l'ultima torre nell'attacco.",
            "È la dimostrazione più famosa del valore dello sviluppo: Morphy gioca con tutti i pezzi, i suoi avversari con metà."
          ]
        },
        {
          title: "Le mosse tranquille",
          paras: [
            "Dopo uno o due sacrifici l'istinto cerca altri scacchi. Ma spesso la mossa vincente è una mossa di sviluppo o di raddoppio che aumenta la pressione: l'avversario, già in difficoltà, non ha il tempo di riorganizzarsi.",
            "Quando calcoli, fermati nelle posizioni critiche e chiediti: c'è una mossa tranquilla che rende la minaccia imparabile?"
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Studia le combinazioni classiche dei grandi (Morphy, Anderssen, Tal) senza guardare le soluzioni: prova a giocare tu le mosse del vincitore. Poi confronta e cerca le differenze."
          ]
        }
      ],
      keyPoints: [
        "Le mosse tranquille nelle combinazioni",
        "Controlla la difesa migliore dell'avversario",
        "Sacrifici per tempo, linee e case",
        "Il vantaggio di sviluppo prepara le combinazioni"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Morphy – duca di Brunswick e conte Isouard, Parigi 1858: la partita dell'Opera, fino alla posizione critica." },
          { move: "e2e4", text: "1.e4." },
          { move: "e7e5", text: "1...e5." },
          { move: "g1f3", text: "2.Cf3." },
          { move: "d7d6", text: "2...d6: la Difesa Philidor." },
          { move: "d2d4", text: "3.d4." },
          { move: "c8g4", text: "3...Ag4?!: l'alfiere inchioda il cavallo, ma presto verrà cambiato." },
          { move: "d4e5", text: "4.dxe5." },
          { move: "g4f3", text: "4...Axf3." },
          { move: "d1f3", text: "5.Dxf3." },
          { move: "d6e5", text: "5...dxe5." },
          { move: "f1c4", text: "6.Ac4: minaccia Dxf7#." },
          { move: "g8f6", text: "6...Cf6." },
          { move: "f3b3", text: "7.Db3: doppio attacco a f7 e b7." },
          { move: "d8e7", text: "7...De7." },
          { move: "b1c3", text: "8.Cc3: Morphy sviluppa invece di prendere b7." },
          { move: "c7c6", text: "8...c6." },
          { move: "c1g5", text: "9.Ag5: inchioda il cavallo f6." },
          { move: "b7b5", text: "9...b5." },
          { move: "c3b5", text: "10.Cxb5!: sacrificio per aprire le linee." },
          { move: "c6b5", text: "10...cxb5." },
          { move: "c4b5", text: "11.Axb5+." },
          { move: "b8d7", text: "11...Cbd7." },
          { move: "e1c1", text: "12.O-O-O: la torre arriva sulla colonna d, dove il cavallo d7 è inchiodato." },
          { move: "a8d8", text: "12...Td8: tutti i pezzi bianchi attaccano, metà di quelli neri sono ancora a casa. Ora tocca a te: la combinazione è negli esercizi." }
        ]
      },
      exercises: [
        {
          fen: "3rkb1r/p2nqppp/5n2/1B2p1B1/4P3/1Q6/PPP2PPP/2KR3R w k - 3 13",
          prompt: "La partita dell'Opera, mossa 13. Trova l'inizio della combinazione di Morphy, compresa la sua mossa tranquilla.",
          solution: ["d1d7", "d8d7", "h1d1"],
          explanation: "13.Txd7! Txd7 14.Td1! (la mossa tranquilla: l'ultima torre entra in gioco) De6 15.Axd7+ Cxd7 16.Db8+!! Cxb8 17.Td8#. Sacrifici di torre, alfiere e donna: resta il minimo indispensabile per il matto."
        }
      ],
      practice: { themes: ["sacrifice", "doubleCheck"], min: 2200, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-difesa-elite",
      grade: "S",
      title: "Difesa d'élite",
      summary: "Salvare le posizioni difficili e trovare le difese nascoste.",
      theory: [
        "I giocatori di vertice perdono poche partite perché si difendono con precisione. Nelle posizioni difficili cercano la mossa che crea più problemi all'avversario, non quella che sembra più comoda.",
        "Contro un attacco, chiediti quale pezzo dell'avversario è essenziale e se puoi cambiarlo. Uno scambio al momento giusto spegne gli attacchi; restituire materiale per cambiare la donna avversaria è spesso la difesa migliore.",
        "La difesa d'élite richiede calcolo quanto l'attacco: le combinazioni famose sono piene di difese che lo sconfitto non trovò. Quando l'avversario sacrifica, non accettare per riflesso: verifica se esiste una risposta che rifiuta il sacrificio o lo accetta in un modo diverso.",
        "Il fattore psicologico conta: chi attacca si aspetta la risposta naturale. Una difesa inattesa, anche solo leggermente migliore, costringe l'attaccante a ricalcolare tutto, e spesso è lì che sbaglia."
      ],
      sections: [
        {
          title: "La difesa che Dufresne non vide",
          paras: [
            "Nella partita Sempreverde (Anderssen – Dufresne, Berlino 1852) il Bianco gioca 20.Txe7+ e il Nero riprende con il cavallo, permettendo una famosa combinazione di matto. Ma 20...Rd8! avrebbe evitato il matto: il re si sposta verso il lato di donna e il Bianco, pur restando meglio, deve ancora dimostrare la vittoria.",
            "Le partite brillanti sono piene di difese mancate: studiarle dal punto di vista di chi perde è un ottimo allenamento difensivo."
          ]
        },
        {
          title: "Limitare i danni",
          paras: [
            "Quando una posizione è comunque persa sul piano del materiale, la difesa migliore è quella che lascia più problemi all'avversario. Dare la donna per due pezzi e respingere l'attacco, per esempio, porta spesso a posizioni in cui l'attaccante deve ancora lavorare molto.",
            "Contro il regalo greco, per esempio, la scelta della casa del re dopo Cg5+ decide molto: Rh8 perde subito, Rg8 e la restituzione di materiale tengono in piedi la partita."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Prendi le combinazioni famose e cerca le difese dello sconfitto a ogni mossa. Usa il motore solo alla fine, per verificare. È lo stesso lavoro che i grandi difensori fanno con le proprie partite."
          ]
        }
      ],
      keyPoints: [
        "Cerca la mossa che crea problemi all'avversario",
        "Cambia i pezzi d'attacco più pericolosi",
        "Non accettare i sacrifici per riflesso: verifica le alternative",
        "In posizione persa, limita i danni e resta pericoloso"
      ],
      example: {
        fen: "rnbq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R w KQ - 4 7",
        steps: [
          { text: "Il regalo greco visto dalla parte di chi difende. Il Bianco sacrifica in h7: dove andrà il re?" },
          { move: "d3h7", text: "7.Axh7+." },
          { move: "g8h7", text: "7...Rxh7." },
          { move: "f3g5", text: "8.Cg5+: ora il Nero ha quattro scelte. Rh8?? perde subito per Dh5+ Rg8 Dh7#; Rh6 si espone agli scacchi di scoperta; Rg6 è complicata." },
          { move: "h7g8", text: "8...Rg8: la scelta più solida." },
          { move: "d1h5", text: "9.Dh5: minaccia Dh7#." },
          { move: "d8g5", text: "9...Dxg5!: il Nero restituisce la donna per il cavallo e respinge l'attacco." },
          { move: "c1g5", text: "10.Axg5: il Bianco è in vantaggio, ma il re nero è salvo e la partita continua. Senza questa difesa il Nero avrebbe ricevuto matto." }
        ]
      },
      exercises: [
        {
          fen: "1r2k1r1/pbppRp1p/1bn2P2/8/Q7/B1PB1q2/P4PPP/3R2K1 b - - 0 20",
          prompt: "Anderssen – Dufresne, Berlino 1852: il Bianco ha appena giocato 20.Txe7+. Giochi con il Nero: trova la difesa che evita il matto.",
          solution: ["e8d8"],
          explanation: "20...Rd8!: il re si allontana dalla colonna e e dalla diagonale dell'alfiere d3. Dopo 20...Cxe7? (la partita) segue 21.Dxd7+!! Rxd7 22.Af5++ Re8 23.Ad7+ Rf8 24.Axe7#. Con ...Rd8 il Bianco resta meglio ma il matto non c'è."
        }
      ],
      practice: { themes: ["defensiveMove"], min: 2000, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-profilassi",
      grade: "S",
      title: "La profilassi",
      summary: "Pensare per l'avversario prima di pensare per sé.",
      theory: [
        "La profilassi è l'arte di impedire i piani dell'avversario prima che diventino pericolosi. Nimzowitsch ne fece un pilastro del suo sistema; Petrosian e Karpov la portarono al massimo livello, vincendo partite in cui l'avversario non riusciva mai a realizzare le proprie idee.",
        "Il metodo è una domanda: «se fosse il turno del mio avversario, che cosa giocherebbe?». Se la risposta è una mossa forte (una spinta che libera il gioco, un sacrificio, un pezzo che arriva su una casa chiave), la tua prossima mossa dovrebbe impedirla, o almeno renderla meno efficace.",
        "Le mosse profilattiche sono spesso modeste: una presa d'aria per il re, un pedone che toglie una casa al cavallo avversario, un pezzo che si ritira per controllare una casa d'entrata. Sembrano passive, ma tolgono all'avversario il suo piano e lo costringono a cercarne un altro, di solito peggiore.",
        "La profilassi non è difesa pura: si gioca quando si ha il controllo della posizione e si vuole conservarlo. Il giocatore profilattico vince lentamente, togliendo una possibilità alla volta."
      ],
      sections: [
        {
          title: "La domanda di Dvoretsky",
          paras: [
            "Mark Dvoretsky, il celebre allenatore, insegnava a fare la domanda profilattica a ogni mossa importante: che cosa vuole l'avversario? Spesso la risposta indica la tua mossa migliore meglio di qualsiasi piano astratto.",
            "Esempio tipico: l'avversario prepara un sacrificio in h7 con la batteria donna-alfiere. La mossa profilattica (...g6, ...f5, ...Cf6, ...h6) arriva prima che il sacrificio sia possibile."
          ]
        },
        {
          title: "Profilassi contro il regalo greco",
          paras: [
            "Nella struttura francese con il pedone bianco in e5 e il cavallo nero cacciato da f6, il regalo greco è sempre nell'aria. Le difese preventive sono ...f6 (attacca la base del pedone e5 e prepara il ritorno del cavallo in f6) o ...h6 (toglie la casa g5 al cavallo bianco). Se il Nero ignora la minaccia con una mossa qualunque, Axh7+ vince.",
            "È l'esercizio di questa lezione: la stessa posizione del regalo greco di grado A, ma questa volta tocca al Nero."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Fare profilassi contro minacce che non esistono, perdendo tempi preziosi. Diventare passivi: la profilassi serve a togliere i piani all'avversario, non a rinunciare ai propri. Dimenticare la tattica: la mossa profilattica deve essere anche tatticamente corretta."
          ]
        }
      ],
      keyPoints: [
        "Chiediti sempre: che cosa vuole fare l'avversario?",
        "Impedisci il suo piano prima che diventi pericoloso",
        "Le mosse profilattiche sono modeste ma potenti",
        "Profilassi sì, passività no"
      ],
      example: {
        fen: "r2q1rk1/pb2bppp/1pn1pn2/8/3P4/P1N2N2/1PB2PPP/R1BQR1K1 w - - 2 13",
        steps: [
          { text: "Pedone isolato bianco, alfiere in c2 puntato su h7. Il Bianco sta per giocare Dd3, con la minaccia Dxh7#.", arrows: [{ from: "c2", to: "h7", color: "red" }] },
          { move: "d1d3", text: "13.Dd3: la batteria è pronta. Il Nero deve reagire subito." },
          { move: "g7g6", text: "13...g6: profilassi. La diagonale verso h7 è chiusa una volta per tutte." },
          { move: "c1h6", text: "14.Ah6: il Bianco cerca altre strade, attaccando la torre f8." },
          { move: "f8e8", text: "14...Te8: la torre si sposta, e il Nero è solido. La sua profilassi ha tolto al Bianco l'idea principale." }
        ]
      },
      exercises: [
        {
          fen: "rnbq1rk1/pppn1ppp/4p3/3pP3/1b1P4/2NB1N2/PPP2PPP/R1BQK2R b KQ - 4 7",
          prompt: "La posizione del regalo greco, ma tocca al Nero. Il Bianco minaccia Axh7+. Gioca una mossa profilattica.",
          solution: ["f7f6"],
          accept: ["f7f6", "h7h6"],
          explanation: "...f6 (o ...h6). Con ...f6 il Nero attacca la base e5 e, se exf6, il cavallo torna in f6 a difendere h7. Con ...h6 toglie la casa g5 al cavallo bianco. Una mossa qualunque, come ...c5, permetterebbe Axh7+ con attacco vincente."
        }
      ],
      practice: { themes: ["defensiveMove"], min: 1800, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-sacrificio-qualita",
      grade: "S",
      title: "Il sacrificio di qualità",
      summary: "Dare una torre per un pezzo minore in cambio di qualcosa di duraturo.",
      theory: [
        "Il sacrificio di qualità (una torre in cambio di un alfiere o di un cavallo) è uno degli strumenti più raffinati dei giocatori forti. La differenza di materiale è di circa due pedoni, ma il valore reale dipende dalla posizione: una torre senza colonne aperte può valere meno di un pezzo minore attivo.",
        "Le ragioni classiche sono quattro: rovinare la struttura di pedoni avversaria (il tipico ...Txc3 nella Siciliana, dopo il quale il Bianco riprende con il pedone b e resta con il re scoperto); eliminare un pezzo difensivo chiave; ottenere un pezzo minore dominante (un cavallo su un avamposto contro una torre senza colonne); guadagnare tempo e iniziativa.",
        "Petrosian è il nome legato al sacrificio di qualità posizionale: lo usava anche in difesa, per eliminare l'unico pezzo attivo dell'avversario e costruire una fortezza. Il sacrificio dinamico, invece, appartiene ai giocatori d'attacco come Tal: la qualità data apre il re avversario.",
        "Per decidere se sacrificare la qualità, chiediti: la torre avversaria avrà colonne su cui giocare? Il mio pezzo minore sarà più forte della torre che resta? Il compenso (struttura, re esposto, pedone in più, iniziativa) è duraturo?"
      ],
      sections: [
        {
          title: "Il ...Txc3 della Siciliana",
          paras: [
            "Nelle varianti con arrocchi opposti (Dragone, Najdorf, Scheveningen), la torre nera sulla colonna c spesso si sacrifica in c3. Dopo bxc3 il re bianco in c1 o b1 perde i pedoni protettivi, il pedone e4 diventa debole e l'alfiere nero sulla diagonale lunga diventa un pezzo d'attacco formidabile.",
            "Il motore spesso valuta queste posizioni come equilibrate nonostante la qualità in meno: il compenso è reale, ma si concretizza solo con un gioco attivo e preciso."
          ]
        },
        {
          title: "Il sacrificio difensivo",
          paras: [
            "In difesa, la qualità si dà per eliminare il pezzo più pericoloso dell'avversario: un cavallo che minaccia di arrivare su una casa decisiva, un alfiere che domina una diagonale verso il re. Dopo lo scambio, la posizione si chiude e la torre avversaria non trova colonne.",
            "Questo tipo di sacrificio è difficile da valutare con il calcolo: serve il giudizio posizionale, ed è per questo che è il marchio dei giocatori di alto livello."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Quando analizzi una tua partita, cerca i momenti in cui un sacrificio di qualità avrebbe cambiato la natura della posizione. Valuta con il motore solo dopo aver formulato il tuo giudizio: è l'unico modo per allenare l'intuito."
          ]
        }
      ],
      keyPoints: [
        "Qualità = torre contro pezzo minore, circa due pedoni",
        "Si sacrifica per struttura, pezzo dominante, re esposto o iniziativa",
        "La torre senza colonne vale poco",
        "Il compenso deve essere duraturo"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Il sacrificio di qualità tipico del Dragone: ...Txc3." },
          { move: "e2e4", text: "1.e4." },
          { move: "c7c5", text: "1...c5." },
          { move: "g1f3", text: "2.Cf3." },
          { move: "d7d6", text: "2...d6." },
          { move: "d2d4", text: "3.d4." },
          { move: "c5d4", text: "3...cxd4." },
          { move: "f3d4", text: "4.Cxd4." },
          { move: "g8f6", text: "4...Cf6." },
          { move: "b1c3", text: "5.Cc3." },
          { move: "g7g6", text: "5...g6." },
          { move: "c1e3", text: "6.Ae3." },
          { move: "f8g7", text: "6...Ag7." },
          { move: "f2f3", text: "7.f3." },
          { move: "e8g8", text: "7...O-O." },
          { move: "d1d2", text: "8.Dd2." },
          { move: "b8c6", text: "8...Cc6." },
          { move: "f1c4", text: "9.Ac4." },
          { move: "c8d7", text: "9...Ad7." },
          { move: "e1c1", text: "10.O-O-O: arrocchi opposti." },
          { move: "a8c8", text: "10...Tc8: la torre va sulla colonna semiaperta." },
          { move: "c4b3", text: "11.Ab3." },
          { move: "c6e5", text: "11...Ce5." },
          { move: "c1b1", text: "12.Rb1." },
          { move: "e5c4", text: "12...Cc4." },
          { move: "b3c4", text: "13.Axc4." },
          { move: "c8c4", text: "13...Txc4: la torre è in c4, pronta al sacrificio." },
          { move: "g2g4", text: "14.g4: il Bianco prepara h4-h5." },
          { move: "c4c3", text: "14...Txc3!?: la qualità per il cavallo che difende il re bianco." },
          { move: "b2c3", text: "15.bxc3: il re bianco ha perso un pedone di protezione, c3 e c2 sono deboli, l'alfiere g7 punta sulla diagonale lunga. Secondo il motore il Bianco resta solo leggermente meglio: per una qualità, il compenso è reale." },
          { move: "d8a5", text: "15...Da5: la donna attacca c3 e a2. Il Nero gioca per l'attacco con una qualità in meno." }
        ]
      },
      practice: { themes: ["sacrifice"], min: 1800, max: 2400, count: 6, pass: 4 }
    },
    {
      id: "s-finali-precisione",
      grade: "S",
      title: "Finali di precisione",
      summary: "Tecnica e calcolo nei finali complessi.",
      theory: [
        "Nei finali di alto livello conta la tecnica: sapere quale finale semplificato è vinto e quale è patta, e scegliere lo scambio giusto. Una sola mossa imprecisa trasforma la vittoria in patta, o la patta in sconfitta.",
        "Alla base ci sono le posizioni teoriche (Lucena, Philidor, opposizione, alfiere sbagliato, donna contro pedone in settima) e i loro dettagli: una colonna più in là, un tempo in più o in meno, e il risultato cambia.",
        "Sopra le posizioni teoriche c'è il calcolo concreto, spesso basato su idee sorprendenti: la sotto-promozione per evitare lo stallo, la mossa d'attesa che mette l'avversario in zugzwang, il re che insegue due obiettivi insieme.",
        "Il simbolo di questo mondo è lo studio di Saavedra (1895): re e pedone contro re e torre, una vittoria che sembra impossibile e che si ottiene con una promozione a torre."
      ],
      sections: [
        {
          title: "Lo studio di Saavedra",
          paras: [
            "Re bianco in b6, pedone in c6; re nero in a1, torre in d5. Il Bianco spinge 1.c7 e il Nero risponde con scacchi: 1...Td6+ 2.Rb5 Td5+ 3.Rb4 Td4+ 4.Rb3 Td3+ 5.Rc2. Gli scacchi sono finiti, ma il Nero ha una risorsa: 5...Td4!, e se 6.c8=D? Tc4+! 7.Dxc4 è stallo.",
            "La risposta è 6.c8=T!!: la torre non dà stallo e minaccia Ta8 matto. Il Nero gioca 6...Ta4 e allora 7.Rb3!, con doppia minaccia: matto in c1 e cattura della torre. Il pedone sotto-promosso vince."
          ]
        },
        {
          title: "Zugzwang e mosse d'attesa",
          paras: [
            "Nei finali di pedoni e in molti finali di pezzi la mossa migliore è a volte quella che non fa nulla: cede la mossa all'avversario, che è costretto a peggiorare la sua posizione. La triangolazione del re e le mosse d'attesa di un pezzo sono gli strumenti tipici.",
            "Prima di ogni mossa nei finali tesi chiediti: se toccasse all'avversario, starebbe meglio o peggio? Se peggio, cerca la mossa che gli passa il tratto."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Gli studi di finale classici (Réti, Saavedra, Troitzky) e i finali teorici giocati contro il motore sono l'allenamento più efficace. Una posizione al giorno, risolta senza muovere i pezzi."
          ]
        }
      ],
      keyPoints: [
        "Conosci i finali teorici e i loro dettagli",
        "Scegli gli scambi in base al finale che resta",
        "Sotto-promozione, zugzwang, mosse d'attesa",
        "Una mossa imprecisa cambia il risultato"
      ],
      example: {
        fen: "8/8/1KP5/3r4/8/8/8/k7 w - - 0 1",
        steps: [
          { text: "Lo studio di Saavedra (1895). Il pedone c6 sembra fermato dalla torre, ma il Bianco ha un piano preciso." },
          { move: "c6c7", text: "1.c7: il pedone minaccia di promuovere. ...Td8 non basta, perché il pedone cattura in d8: al Nero restano solo gli scacchi." },
          { move: "d5d6", text: "1...Td6+." },
          { move: "b6b5", text: "2.Rb5: il re scende verso la torre, non verso il bordo." },
          { move: "d6d5", text: "2...Td5+." },
          { move: "b5b4", text: "3.Rb4." },
          { move: "d5d4", text: "3...Td4+." },
          { move: "b4b3", text: "4.Rb3." },
          { move: "d4d3", text: "4...Td3+." },
          { move: "b3c2", text: "5.Rc2: gli scacchi sono finiti, la torre è attaccata." },
          { move: "d3d4", text: "5...Td4!: la risorsa del Nero. Se ora 6.c8=D, ...Tc4+ 7.Dxc4 è stallo. Come vince il Bianco? Lo trovi negli esercizi." }
        ]
      },
      exercises: [
        {
          fen: "8/2P5/8/8/3r4/8/2K5/k7 w - - 9 6",
          prompt: "Studio di Saavedra, dopo 5...Td4!. Promuovere a donna dà stallo: trova la soluzione dello studio.",
          solution: ["c7c8r"],
          explanation: "6.c8=T!!: la torre non permette lo stallo e minaccia Ta8#. Se 6...Ta4, 7.Rb3! minaccia insieme Tc1# e la cattura della torre in a4. Una delle sotto-promozioni più famose della storia."
        }
      ],
      practice: { themes: ["endgame"], min: 2200, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-conversione",
      grade: "S",
      title: "Convertire il vantaggio",
      summary: "Dal vantaggio alla vittoria, senza concedere controgioco.",
      theory: [
        "Avere un vantaggio non basta: bisogna trasformarlo in vittoria. È la parte del gioco che distingue i professionisti, e che i giocatori di club sottovalutano più spesso, perdendo mezzi punti in posizioni vinte.",
        "Il primo principio è non avere fretta. Con un vantaggio solido, la priorità è togliere all'avversario ogni controgioco: mettere il re al sicuro, coprire le case d'entrata, neutralizzare i suoi pezzi attivi. Solo dopo si passa all'azione.",
        "Il secondo è il principio delle due debolezze: una sola debolezza avversaria spesso si difende; due debolezze lontane tra loro (per esempio un pedone debole su un lato e un re esposto sull'altro) sovraccaricano la difesa. Chi converte bene crea la seconda debolezza prima di sfondare.",
        "Il terzo è la semplificazione: con un vantaggio materiale, scambia i pezzi e semplifica verso un finale che sai vincere. Anche restituire un po' di materiale va bene, se il finale che resta è vinto con certezza."
      ],
      sections: [
        {
          title: "Le tappe della conversione",
          paras: [
            "1. Consolida: re al sicuro, pezzi coordinati, nessun pezzo indifeso. 2. Limita: togli all'avversario le sue idee attive (profilassi). 3. Crea la seconda debolezza o un pedone passato. 4. Semplifica nel momento giusto, quando il finale è chiaramente vinto. 5. Calcola con precisione l'ultima fase.",
            "Capablanca era famoso per questa tecnica: le sue vittorie sembravano semplici proprio perché ogni tappa era eseguita senza concessioni."
          ]
        },
        {
          title: "Quando semplificare",
          paras: [
            "Lo scambio giusto è quello che lascia un finale vinto senza rischi. Il caso tipico: un pedone passato esterno e pezzi da scambiare. Con pezzi in gioco l'avversario ha ancora risorse tattiche; nel finale di re e pedoni il passato esterno decide da solo.",
            "Prima di ogni scambio, quindi, calcola o valuta il finale che resta. Se è vinto, scambia senza esitare, anche dando indietro un po' di materiale."
          ]
        },
        {
          title: "Errori tipici",
          paras: [
            "Cercare il colpo decisivo invece di migliorare la posizione. Rilassarsi dopo aver guadagnato materiale e lasciare all'avversario un attacco o uno scacco perpetuo. Evitare gli scambi per paura di sbagliare il finale: con la tecnica giusta, il finale è proprio dove il vantaggio si incassa."
          ]
        }
      ],
      keyPoints: [
        "Prima consolida, poi attacca",
        "Principio delle due debolezze",
        "Semplifica verso finali che sai vincere",
        "Niente fretta, niente controgioco"
      ],
      example: {
        fen: "8/pp3pk1/6p1/8/8/1P4P1/P4PKP/8 w - - 0 1",
        steps: [
          { text: "Finale di re e pedoni con un pedone in più per il Bianco, tre contro due sull'ala di re. La tecnica: prima il re al centro, poi il pedone passato." },
          { move: "g2f3", text: "1.Rf3: il re si centralizza. Nei finali di pedoni il re è il pezzo più forte." },
          { move: "g7f6", text: "1...Rf6." },
          { move: "f3f4", text: "2.Rf4: il re occupa la casa più attiva e tiene il re nero sulla difensiva." },
          { move: "g6g5", text: "2...g5+." },
          { move: "f4g4", text: "3.Rg4: il re resta attivo. Il piano ora è creare un pedone passato sull'ala di re con f4 e h4: se il re nero si allontana per fermarlo, il re bianco andrà a prendere i pedoni dell'ala di donna. È il principio delle due debolezze applicato al finale." }
        ]
      },
      exercises: [
        {
          fen: "8/4kppp/2n5/1B6/P7/8/5PPP/6K1 w - - 0 1",
          prompt: "Hai un pedone passato esterno. Trova la via più sicura per vincere.",
          solution: ["b5c6"],
          explanation: "Axc6!: cambi l'ultimo pezzo e il finale di re e pedoni è vinto, perché il re nero deve fermare il pedone a e il re bianco si prende l'ala di re. Con i pezzi in gioco il cavallo nero avrebbe potuto bloccare il pedone a lungo."
        }
      ],
      practice: { themes: ["endgame"], min: 2000, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-scacchi-doppi",
      grade: "S",
      title: "Scacchi doppi e scoperte d'élite",
      summary: "Le combinazioni con le linee nascoste.",
      theory: [
        "Allo scacco doppio non c'è difesa se non muovere il re: per questo nelle combinazioni dei maestri prepara spesso il matto o la vincita di un pezzo. Un sacrificio che attira il re su una casa dove arriva uno scacco doppio è un'arma devastante.",
        "Allenati a vedere le batterie (due pezzi a lunga gittata sulla stessa linea, oppure un pezzo a lunga gittata dietro un pezzo che può muoversi) e i pezzi che le coprono: quando il pezzo davanti si muove con minaccia, nasce l'attacco doppio.",
        "Il mulino a vento è la forma più spettacolare: una torre e un alfiere (o una donna) alternano scacchi di scoperta e scacchi diretti, e la torre cattura un pezzo a ogni giro.",
        "Le scoperte d'élite sono spesso preparate da un sacrificio che porta il re avversario sulla linea della batteria: la mossa decisiva non è lo scacco doppio, ma quella che costringe il re ad andarci."
      ],
      sections: [
        {
          title: "Réti – Tartakower, Vienna 1910",
          paras: [
            "Una delle miniature più famose: dopo poche mosse di una Caro-Kann, il Bianco sacrifica la donna in d8 con scacco, il re cattura, e segue uno scacco doppio di alfiere e torre che porta al matto in tre mosse.",
            "Il segreto è la batteria: la torre in d1 e l'alfiere in d2 sulla stessa colonna. Quando il re nero arriva in d8, l'alfiere si sposta con scacco e la torre dà scacco a sua volta."
          ]
        },
        {
          title: "Riconoscere le batterie nascoste",
          paras: [
            "Torre dietro alfiere sulla colonna del re avversario, alfiere dietro cavallo sulla diagonale verso il re, donna dietro alfiere. Quando ne vedi una, chiediti: come posso portare il re avversario sulla linea? Spesso la risposta è un sacrificio sulla casa giusta.",
            "Per difenderti, togli il re dalle linee delle batterie avversarie anche quando sono bloccate: basta una mossa per aprirle."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Negli esercizi di scacco doppio, prima di cercare la mossa, individua tutte le batterie sulla scacchiera, tue e avversarie. È un'abitudine che rende visibili combinazioni altrimenti nascoste."
          ]
        }
      ],
      keyPoints: [
        "Scacco doppio: solo il re può muoversi",
        "Cerca le batterie nascoste",
        "Il pezzo davanti deve muovere con una minaccia",
        "Sacrifica per portare il re sulla linea della batteria"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Réti – Tartakower, Vienna 1910: come nasce la batteria sulla colonna d." },
          { move: "e2e4", text: "1.e4." },
          { move: "c7c6", text: "1...c6: la Caro-Kann." },
          { move: "d2d4", text: "2.d4." },
          { move: "d7d5", text: "2...d5." },
          { move: "b1c3", text: "3.Cc3." },
          { move: "d5e4", text: "3...dxe4." },
          { move: "c3e4", text: "4.Cxe4." },
          { move: "g8f6", text: "4...Cf6." },
          { move: "d1d3", text: "5.Dd3." },
          { move: "e7e5", text: "5...e5?!: il Nero apre il gioco con il re ancora al centro." },
          { move: "d4e5", text: "6.dxe5." },
          { move: "d8a5", text: "6...Da5+." },
          { move: "c1d2", text: "7.Ad2." },
          { move: "a5e5", text: "7...Dxe5." },
          { move: "e1c1", text: "8.O-O-O: la torre arriva in d1, dietro l'alfiere d2 e la donna d3. La colonna d è una batteria puntata verso d8." },
          { move: "f6e4", text: "8...Cxe4?: il Nero prende il cavallo, ma il suo re è ancora in e8, a un passo dalla colonna d. Ora tocca al Bianco." }
        ]
      },
      exercises: [
        {
          fen: "rnb1kb1r/pp3ppp/2p5/4q3/4n3/3Q4/PPPB1PPP/2KR1BNR w kq - 0 9",
          prompt: "Réti – Tartakower, mossa 9. Il re nero è a un passo dalla colonna d. Matto in tre.",
          solution: ["d3d8", "e8d8", "d2g5", "d8c7", "g5d8"],
          explanation: "9.Dd8+!! Rxd8 10.Ag5++: scacco doppio di alfiere e torre. Se 10...Re8 11.Td8#; nella partita 10...Rc7 11.Ad8#. Il sacrificio di donna ha portato il re sulla linea della batteria."
        }
      ],
      practice: { themes: ["doubleCheck", "discoveredAttack"], min: 2000, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-sacrifici-profondi",
      grade: "S",
      title: "Sacrifici profondi",
      summary: "Dare materiale per l'iniziativa e per il re avversario.",
      theory: [
        "I sacrifici dei giocatori di vertice non sempre portano a un matto immediato: a volte danno l'iniziativa, linee aperte o un re avversario senza difesa per molte mosse. Si giudicano con un misto di calcolo e valutazione.",
        "Per decidere se sacrificare calcola le varianti forzanti e valuta la posizione finale: quanti pezzi attaccano, quanti difendono, quanto tempo serve all'avversario per riorganizzarsi, quanto materiale hai dato e quanto puoi recuperare.",
        "Il doppio sacrificio di alfieri è l'esempio classico: Emanuel Lasker contro Bauer (Amsterdam 1889) sacrificò entrambi gli alfieri in h7 e g7 per distruggere l'arrocco nero; la donna e una torre arrivarono poi a raccogliere più materiale di quello dato.",
        "Il sacrificio profondo richiede coraggio, ma il coraggio va sostenuto dal lavoro: i grandi attaccanti calcolavano più varianti dei loro avversari, non meno."
      ],
      sections: [
        {
          title: "Il doppio sacrificio di alfieri",
          paras: [
            "Lo schema: alfiere in d3 che cattura in h7 con scacco, donna che arriva in h5 con scacco, alfiere della diagonale lunga che cattura in g7. Il re nero resta senza pedoni davanti, e la donna con una torre (Tf3-g3 o h3) completano l'attacco.",
            "Le condizioni: la diagonale lunga aperta verso g7, la donna libera di arrivare sul lato di re, una torre pronta a entrare con tempo. Senza la torre, il doppio sacrificio spesso si ferma a metà."
          ]
        },
        {
          title: "Valutare la posizione finale",
          paras: [
            "Alla fine delle varianti forzanti chiediti: il mio attacco continua o si è esaurito? L'avversario ha mosse utili o deve solo difendersi? Il materiale che ho dato tornerà indietro? Se l'attacco continua e l'avversario non ha controgioco, il sacrificio è quasi sempre corretto anche senza un matto forzato.",
            "Al contrario, se dopo il sacrificio l'avversario può cambiare la donna o riportare pezzi in difesa con tempo, il materiale dato pesa."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Studia le partite d'attacco classiche coprendo le mosse del vincitore e prova a indovinarle. Quando sbagli, chiediti se ti mancava il calcolo o il coraggio: sono due difetti diversi, e si curano in modi diversi."
          ]
        }
      ],
      keyPoints: [
        "Sacrificio per iniziativa e linee",
        "Calcola le varianti forzanti",
        "Valuta la posizione finale, non solo il materiale",
        "Doppio sacrificio di alfieri: h7, g7, poi donna e torre"
      ],
      example: {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        steps: [
          { text: "Lasker – Bauer, Amsterdam 1889: la preparazione del doppio sacrificio di alfieri." },
          { move: "f2f4", text: "1.f4: l'apertura di Bird." },
          { move: "d7d5", text: "1...d5." },
          { move: "e2e3", text: "2.e3." },
          { move: "g8f6", text: "2...Cf6." },
          { move: "b2b3", text: "3.b3: l'alfiere andrà in b2, sulla diagonale lunga verso g7." },
          { move: "e7e6", text: "3...e6." },
          { move: "c1b2", text: "4.Ab2." },
          { move: "f8e7", text: "4...Ae7." },
          { move: "f1d3", text: "5.Ad3: il secondo alfiere punta su h7." },
          { move: "b7b6", text: "5...b6." },
          { move: "b1c3", text: "6.Cc3." },
          { move: "c8b7", text: "6...Ab7." },
          { move: "g1f3", text: "7.Cf3." },
          { move: "b8d7", text: "7...Cbd7." },
          { move: "e1g1", text: "8.O-O." },
          { move: "e8g8", text: "8...O-O." },
          { move: "c3e2", text: "9.Ce2: il cavallo si trasferisce verso il lato di re." },
          { move: "c7c5", text: "9...c5." },
          { move: "e2g3", text: "10.Cg3." },
          { move: "d8c7", text: "10...Dc7." },
          { move: "f3e5", text: "11.Ce5." },
          { move: "d7e5", text: "11...Cxe5." },
          { move: "b2e5", text: "12.Axe5: l'alfiere arriva in e5, ancora sulla diagonale verso g7." },
          { move: "c7c6", text: "12...Dc6." },
          { move: "d1e2", text: "13.De2." },
          { move: "a7a6", text: "13...a6." },
          { move: "g3h5", text: "14.Ch5." },
          { move: "f6h5", text: "14...Cxh5: il Nero ha eliminato un attaccante. Ma ora tocca a Lasker, e i suoi alfieri sono puntati su h7 e g7." }
        ]
      },
      exercises: [
        {
          fen: "r4rk1/1b2bppp/ppq1p3/2ppB2n/5P2/1P1BP3/P1PPQ1PP/R4RK1 w - - 0 15",
          prompt: "Lasker – Bauer, mossa 15. Trova il doppio sacrificio di alfieri.",
          solution: ["d3h7", "g8h7", "e2h5", "h7g8", "e5g7", "g8g7", "h5g4"],
          explanation: "15.Axh7+! Rxh7 16.Dxh5+ Rg8 17.Axg7!! Rxg7 18.Dg4+ Rh7 19.Tf3: la torre arriva con la minaccia Th3#. Il Nero deve dare la donna (19...e5 20.Th3+ Dh6 21.Txh6+) e Lasker vince."
        }
      ],
      practice: { themes: ["sacrifice"], min: 2400, max: 2600, count: 6, pass: 4 }
    },
    {
      id: "s-matti-cinque",
      grade: "S",
      title: "Matti in cinque mosse",
      summary: "Il calcolo più lungo.",
      theory: [
        "I matti in cinque richiedono di tenere a mente una posizione che cambia molto. Il metodo è sempre lo stesso: mosse forzanti, tutte le risposte, posizione finale.",
        "Quando ti perdi, torna alla posizione di partenza e ricalcola una variante sola fino in fondo invece di saltare da un'idea all'altra.",
        "Nelle sequenze lunghe i sacrifici si susseguono: ogni pezzo dato elimina un difensore o apre una linea. Per non perdere il conto, fissa a ogni tappa quali pezzi ti restano e quali case controllano: alla fine, spesso, il matto si dà con due soli pezzi.",
        "Le combinazioni lunghe della storia (la Sempreverde, la partita dell'Opera, l'Immortale) sono il miglior materiale di allenamento: ogni mossa è forzante e la soluzione è unica."
      ],
      sections: [
        {
          title: "La Sempreverde",
          paras: [
            "Anderssen – Dufresne, Berlino 1852, è chiamata la partita Sempreverde: una combinazione di sacrifici che, a quasi due secoli di distanza, resta tra le più belle di sempre. Il Bianco dà torre e donna per arrivare a un matto con due alfieri.",
            "Il Nero minaccia matto in g2 e ha più materiale: la combinazione deve essere forzante dalla prima all'ultima mossa, e lo è (dopo la risposta della partita; la difesa migliore la trovi nella lezione sulla difesa d'élite)."
          ]
        },
        {
          title: "Tenere il filo",
          paras: [
            "Nelle varianti di cinque mosse il rischio maggiore è perdere di vista un pezzo avversario lontano che può tornare a difendere, o una casa di fuga che si libera dopo una cattura. Dopo ogni sacrificio rifai l'inventario: pezzi difensori rimasti, case libere del re.",
            "Se l'inventario mostra un difensore che non avevi considerato, chiediti se esiste uno scacco intermedio che lo elimina prima."
          ]
        },
        {
          title: "Come allenarlo",
          paras: [
            "Rigioca le grandi combinazioni dalla posizione critica, senza guardare le mosse, e prova a trovare tu la sequenza intera. Poi verifica con il motore le difese alternative: è lì che si capisce davvero perché la combinazione funziona."
          ]
        }
      ],
      keyPoints: [
        "Solo mosse forzanti",
        "Una variante alla volta, fino in fondo",
        "Dopo ogni sacrificio rifai l'inventario dei difensori",
        "Se ti perdi, riparti dalla posizione iniziale"
      ],
      example: {
        fen: "1r2k1r1/pbppnp1p/1bn2P2/8/Q7/B1PB1q2/P4PPP/3RR1K1 w - - 0 20",
        steps: [
          { text: "Anderssen – Dufresne, Berlino 1852, dopo 19...Dxf3. Il Nero minaccia Dxg2 matto e ha una torre in più: il Bianco deve dare scacco a ogni mossa.", arrows: [{ from: "f3", to: "g2", color: "red" }] },
          { text: "Inventario: torre e1 e alfiere a3 puntano su e7; la donna a4 guarda d7; l'alfiere d3 può arrivare in f5 con scacco di scoperta dalla torre d1. Il re nero in e8 ha poche case. Prova a trovare la combinazione negli esercizi.", arrows: [{ from: "e1", to: "e7", color: "green" }, { from: "a4", to: "d7", color: "green" }, { from: "d1", to: "d7", color: "green" }] }
        ]
      },
      exercises: [
        {
          fen: "1r2k1r1/pbppnp1p/1bn2P2/8/Q7/B1PB1q2/P4PPP/3RR1K1 w - - 0 20",
          prompt: "La Sempreverde, mossa 20. Matto in cinque, tutto con scacchi: trova la combinazione di Anderssen.",
          solution: ["e1e7", "c6e7", "a4d7", "e8d7", "d3f5", "d7e8", "f5d7", "e8f8", "a3e7"],
          explanation: "20.Txe7+ Cxe7 21.Dxd7+!! Rxd7 22.Af5++ Re8 23.Ad7+ Rf8 24.Axe7#. La torre e la donna si sacrificano, e i due alfieri danno matto con l'aiuto della torre d1."
        }
      ],
      practice: { themes: ["mateIn5", "mateIn4"], min: 2200, max: 2600, count: 6, pass: 4 }
    }
  ];

  const GRADE_UNITS = {
    D: { title: "Fondamenti", text: "Materiale, scacco e matto, prime tattiche, promozione e patta." },
    C: { title: "Tattica e aperture", text: "Inchiodature, infilate, scoperte, mossa intermedia e le aperture spiegate con i piani." },
    B: { title: "Calcolo, finali e strategia", text: "Sacrifici, difesa, mosse candidate, finali di re e pedoni e di torre, pedone isolato e case deboli." },
    A: { title: "Gioco avanzato", text: "Lucena e Philidor, attacco al re, strutture pedonali, piani di mediogioco e finali di pezzi minori." },
    S: { title: "Livello maestro", text: "Calcolo profondo, profilassi, sacrificio di qualità, conversione del vantaggio e finali di precisione." }
  };

  // Pattern di errore delle revisioni -> lezione consigliata.
  const PATTERN_LESSONS = {
    hangingPiece: "d-pezzi-in-presa",
    concentration: "d-routine",
    missedThreat: "b-difesa",
    calculation: "b-candidate",
    kingSafety: "c-aperture",
    development: "c-aperture",
    noPlan: "a-piano",
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
