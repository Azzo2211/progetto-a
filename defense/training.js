/*
 * Progetto A - Difesa: piano di arti marziali a livelli (stile Lookism, con Johan Seong).
 * 5 allenamenti a settimana: boxe, mobilità, calci, schivate e prese, "copia e rendi tuo".
 * Ogni esercizio ha una versione facile; quelli che chiedono flessibilità sono segnati (flex).
 * Schema controllato da tests/defense.test.js.
 */
window.DefenseTraining = (function () {
  "use strict";

  // ex(id, nome, dose, come, facile, flex)
  const ex = (id, name, dose, how, easy, flex) => ({ id, name, dose, how, easy, flex: !!flex });

  const WARMUP = "Riscaldamento di 5 minuti: salto la corda o salti sul posto, cerchi con braccia, spalle, bacino e caviglie, 10 squat lenti. Finisci con 2 minuti di respiro calmo.";
  const COOLDOWN = "Defaticamento di 3 minuti: cammina, respira dal naso, allunga spalle e polpacci con calma. Niente allungamenti dolorosi.";

  const JOHAN = {
    name: "Johan Seong",
    idea: "Johan copia le tecniche che vede e le fa sue. Anche tu: guardi, copi piano, poi rendi tuo il movimento. La velocità viene dopo la pulizia.",
    note: "Nella storia di Lookism Johan è un copiatore: impara guardando. Qui è solo una guida per motivarti; gli esercizi sono allenamento vero, fatto con calma."
  };

  const DAYS = [
    { n: 1, key: "boxe", title: "Boxe", sub: "Posizione, pugni, schivate" },
    { n: 2, key: "mobilita", title: "Mobilità e core", sub: "Bacino, gambe, addominali" },
    { n: 3, key: "calci", title: "Calci e ginocchia", sub: "Stile Muay Thai" },
    { n: 4, key: "schivate", title: "Schivate e prese", sub: "Stile aikido, solo e con partner" },
    { n: 5, key: "copia", title: "Copia e rendi tuo", sub: "Il giorno di Johan" }
  ];

  const LEVELS = [
    {
      n: 1, title: "Basi", sub: "Posizione pulita e movimenti lenti",
      goal: "Muoverti bene prima di muoverti forte. Tutto al 50% della forza.",
      days: [
        [
          ex("1-1-1", "Posizione da boxe", "3 x 1 min", "Piedi sfalsati, ginocchia morbide, pugni alle guance, gomiti stretti, mento basso. Controlla davanti allo specchio.", "2 x 1 min, con pausa libera"),
          ex("1-1-2", "Jab al vuoto", "3 x 20", "Il pugno parte dritto dalla guardia e torna sulla stessa linea. Ruota appena il busto, non allungare la spalla.", "3 x 10, lentissimo"),
          ex("1-1-3", "Diretto al vuoto", "3 x 20", "Spingi il piede dietro, ruota anca e busto, il pugno segue. Torna subito in guardia.", "3 x 10"),
          ex("1-1-4", "Jab-diretto in sequenza", "4 x 10", "Un-due ritmico. Se perdi la guardia, rallenta.", "4 x 5"),
          ex("1-1-5", "Passi in guardia", "3 x 1 min", "Avanti, indietro e di lato senza incrociare i piedi. Il piede più vicino parte per primo.", "3 x 30 s")
        ],
        [
          ex("1-2-1", "Cerchi di bacino e anche", "2 x 10 per verso", "In piedi, fai cerchi lenti col bacino, poi con le anche aperte.", "1 x 10"),
          ex("1-2-2", "Affondo in avanti", "3 x 8 per gamba", "Passo lungo, ginocchio sopra la caviglia, busto dritto. Torna spingendo col tallone.", "3 x 5, passo corto"),
          ex("1-2-3", "Plank", "3 x 30 s", "Gomiti sotto le spalle, schiena dritta, glutei stretti. Respira.", "3 x 15 s sulle ginocchia"),
          ex("1-2-4", "Allungamento dietro coscia", "2 x 30 s per gamba", "Seduto, gamba tesa, scendi con la schiena lunga senza rimbalzi. Fermati prima del dolore.", "Con ginocchio piegato e un asciugamano", true),
          ex("1-2-5", "Farfalla (anche aperte)", "2 x 40 s", "Seduto con le piante dei piedi unite, ginocchia verso il basso senza forzare.", "Siediti su un cuscino alto", true)
        ],
        [
          ex("1-3-1", "Calcio frontale basso (teep)", "3 x 10 per gamba", "Alza il ginocchio e spingi col piede davanti, all'altezza della pancia. Torna in guardia.", "3 x 6, ginocchio alzato senza calcio"),
          ex("1-3-2", "Ginocchiata al vuoto", "3 x 10 per gamba", "Tira giù le mani immaginarie e porta il ginocchio in avanti, anca avanti.", "3 x 6"),
          ex("1-3-3", "Calcio basso circolare (al sacco o al cuscino)", "3 x 8 per gamba", "Ruota sul piede d'appoggio, colpisci con la tibia, non con il piede. Se non hai sacco, solo al vuoto.", "Solo al vuoto, 3 x 5"),
          ex("1-3-4", "Equilibrio su una gamba", "3 x 20 s per gamba", "Alza il ginocchio a 90 gradi e resta fermo, mani in guardia.", "Con una mano appoggiata al muro"),
          ex("1-3-5", "Calcio alto lento", "2 x 6 per gamba", "Alza la gamba fino all'altezza che ti riesce, senza dondolare. Non serve la testa.", "Fermati all'anca. Salta questo se la schiena ti dà fastidio", true)
        ],
        [
          ex("1-4-1", "Passo di lato (tai sabaki)", "3 x 10 per lato", "Quando la linea del colpo arriva, sposta il piede fuori linea e ruota. Fai con mani rilassate.", "3 x 5"),
          ex("1-4-2", "Schivata col busto", "3 x 10 per lato", "Piega le ginocchia e sposta la testa fuori dalla linea del jab immaginario.", "3 x 6"),
          ex("1-4-3", "Parata dall'interno", "3 x 15", "Con la mano posteriore, tocca il pugno immaginario e devialo di pochi centimetri.", "3 x 8"),
          ex("1-4-4", "Liberarsi da presa al polso (solo teoria + partner lento)", "2 x 5 per lato", "Ruota il polso verso il pollice dell'altro, avvicina il gomito e spingi via. Con partner, mai a forza.", "Solo il movimento, senza partner"),
          ex("1-4-5", "Caduta in avanti sul tappeto", "5 volte lente", "Dal ginocchio, braccia davanti, palmi aperti, mento al petto. Sul tappeto, mai su pavimento duro.", "Solo dalle ginocchia")
        ],
        [
          ex("1-5-1", "Guarda e copia", "10 min", "Guarda un video lento di un jab o di un teep, fermalo e copia solo la posizione dei piedi. Non copiare la velocità.", "Una sola posizione ripetuta"),
          ex("1-5-2", "Shadow boxing base", "3 round da 2 min", "Combina jab, diretto, schivata e passo. Pensa a un avversario che ti guarda.", "2 round da 1 min"),
          ex("1-5-3", "Una cosa che ho imparato", "2 min", "Scrivi o di' una sola cosa che hai capito oggi. Il resto lo lasci.", "Una frase"),
          ex("1-5-4", "Controllo della settimana", "5 min", "Guarda quali esercizi ti sono riusciti e quali no: decidi cosa tenere per la prossima settimana.", "Quello che ricordi")
        ]
      ]
    },
    {
      n: 2, title: "Combinazioni", sub: "Pugni in serie e primi calci in coppia",
      goal: "Mettere insieme due e tre movimenti senza perdere la guardia.",
      days: [
        [
          ex("2-1-1", "Jab-diretto-gancio", "4 x 10", "Gancio con il gomito alto e il pugno orizzontale, ruotando sul piede avanti.", "4 x 6, solo jab-diretto"),
          ex("2-1-2", "Schiva e rispondi", "4 x 8", "Schiva col busto, poi diretto. Il colpo parte quando torni su.", "4 x 5"),
          ex("2-1-3", "Corpo-testa", "4 x 10", "Gancio al corpo piegando le ginocchia, poi pugno alla testa. Mai solo con la schiena.", "4 x 6"),
          ex("2-1-4", "Sacco o cuscino: 3 round", "3 x 2 min", "Colpisci con forza media e torna sempre in guardia. Se non hai sacco, shadow.", "2 round da 90 s"),
          ex("2-1-5", "Rinforzo polsi e spalle", "3 x 12", "Flessioni sulle ginocchia o con elastico, lentissime.", "3 x 8")
        ],
        [
          ex("2-2-1", "Squat con pausa", "3 x 10", "Scendi lento, fermati un secondo in basso, risali. Talloni a terra.", "3 x 6, meno profondo"),
          ex("2-2-2", "Mobilità dell'anca 90/90", "2 x 8 per lato", "Seduto, una gamba davanti e una di lato a 90 gradi, passa da un lato all'altro.", "Con le mani dietro per sostenerti", true),
          ex("2-2-3", "Leg raise", "3 x 10", "Sdraiato, alza le gambe piegate senza staccare la zona lombare.", "3 x 6 con ginocchia piegate"),
          ex("2-2-4", "Spaccata assistita", "2 x 40 s", "Apri le gambe a terra senza forzare. Se tira, fermati.", "Solo apertura laterale in piedi con appoggio", true),
          ex("2-2-5", "Corda o salti", "5 x 1 min", "Salti leggeri sulla punta dei piedi, ritmo costante.", "5 x 30 s")
        ],
        [
          ex("2-3-1", "Teep-calcio circolare", "4 x 8 per gamba", "Un teep di distanza, poi un calcio basso. Cambia gamba a ogni serie.", "4 x 5"),
          ex("2-3-2", "Ginocchiata dal clinch (sul sacco)", "4 x 8 per gamba", "Mani dietro la nuca immaginaria e ginocchio in avanti. Resta alto con la testa.", "Al vuoto, 4 x 5"),
          ex("2-3-3", "Calcio alto con gamba che sale", "3 x 8 per gamba", "Ruota il piede d'appoggio e porta la gamba al livello che ti riesce.", "Calcio medio (alle costole)", true),
          ex("2-3-4", "Difesa del calcio con la tibia", "3 x 10 per lato", "Alza il ginocchio verso fuori e fai incontrare la tibia con il calcio immaginario.", "3 x 5"),
          ex("2-3-5", "Equilibrio dopo il calcio", "3 x 8", "Dopo il calcio, riappoggia il piede in guardia senza traballare.", "3 x 5")
        ],
        [
          ex("2-4-1", "Entrata e uscita", "4 x 8 per lato", "Passo fuori linea, ruota, esci dalla linea con due passi. Il tuo scopo è andartene.", "4 x 5"),
          ex("2-4-2", "Presa al petto, liberazione", "3 x 5 per lato", "Con partner lento: abbassa il peso, spezza con l'avambraccio e passo indietro.", "Solo il movimento senza partner"),
          ex("2-4-3", "Presa da dietro, liberazione", "3 x 5", "Mento al petto, abbassa le anche, passo di lato e giri fuori. Con partner, mai a forza.", "Solo il movimento senza partner"),
          ex("2-4-4", "Cadute laterali", "3 x 6 per lato", "Dal basso, picchia con il braccio a terra a 45 gradi e le gambe in aria.", "Dal ginocchio"),
          ex("2-4-5", "Rialzarsi", "5 volte", "Dalla schiena, un piede a terra, una mano, alzati senza mai voltare le spalle all'altro.", "3 volte lente")
        ],
        [
          ex("2-5-1", "Guarda e copia una combinazione", "10 min", "Scegli una combinazione di boxe o Muay Thai da un video, copiala a rallentatore.", "Solo il primo colpo"),
          ex("2-5-2", "Shadow con due stili", "4 round da 2 min", "Un round solo pugni, uno con calci, uno schivate, uno misto. Cambia ritmo.", "3 round da 1 min"),
          ex("2-5-3", "Una combinazione tua", "5 min", "Inventa una combinazione di 3 colpi e provala 20 volte.", "Combinazione di 2"),
          ex("2-5-4", "Controllo della settimana", "5 min", "Quali esercizi sono diventati facili? Quali no? Scrivilo.", "Quello che ricordi")
        ]
      ]
    },
    {
      n: 3, title: "Ritmo", sub: "Cambi di velocità e di distanza",
      goal: "Controllare la distanza e il ritmo, non solo i colpi.",
      days: [
        [
          ex("3-1-1", "Fintare e colpire", "4 x 10", "Una finta con la spalla, poi jab. Il corpo mente, il colpo no.", "4 x 6"),
          ex("3-1-2", "Entrata dalla distanza", "4 x 8", "Arrivi da fuori distanza con un passo breve e colpisci.", "4 x 5"),
          ex("3-1-3", "Blocco e risposta", "4 x 10", "Blocca con la guardia alta, poi rispondi con gancio. La guardia non cala mai.", "4 x 6"),
          ex("3-1-4", "Sacco: round a ritmo variabile", "4 x 2 min", "30 s lento, 30 s veloce, 30 s forte, 30 s lento.", "3 x 90 s"),
          ex("3-1-5", "Pugni con elastico o pesetti leggeri", "3 x 20", "Pesi molto leggeri. Se perdi la tecnica, togli i pesi.", "Senza pesi")
        ],
        [
          ex("3-2-1", "Squat bulgaro", "3 x 8 per gamba", "Piede dietro su una sedia, scendi dritto.", "3 x 5, senza appoggio dietro"),
          ex("3-2-2", "Allungamento adduttori", "2 x 40 s", "Gambe aperte, peso verso un lato, lento.", "Con appoggio delle mani avanti", true),
          ex("3-2-3", "Plank laterale", "3 x 25 s per lato", "Corpo dritto, anca in alto.", "3 x 15 s sulle ginocchia"),
          ex("3-2-4", "Mobilità del bacino con calcio alto", "2 x 8 per gamba", "Alza lentamente la gamba tesa davanti e di lato, controllando la schiena.", "Con appoggio al muro", true),
          ex("3-2-5", "Corsa intervallata", "6 x 1 min", "Un minuto veloce, un minuto lento.", "6 x 30 s")
        ],
        [
          ex("3-3-1", "Teep, calcio basso, calcio medio", "4 x 6 per gamba", "Tre calci di fila cambiando altezza. Respira.", "4 x 4"),
          ex("3-3-2", "Calcio alto con rotazione", "3 x 6 per gamba", "Ruota sul piede d'appoggio, calcia con la tibia. Solo se il riscaldamento è stato completo.", "Calcio medio", true),
          ex("3-3-3", "Calcio e pugno", "4 x 8", "Calcio basso e subito jab-diretto. Passa dalla gamba al braccio senza fermarti.", "4 x 5"),
          ex("3-3-4", "Prendere il calcio dell'altro", "3 x 5 per lato", "Con partner lento: afferra la gamba al volo e spingi via. Mai tirare giù.", "Solo il movimento senza partner"),
          ex("3-3-5", "Forza della gamba d'appoggio", "3 x 10 per gamba", "Calf raise su una gamba.", "3 x 6 con due gambe")
        ],
        [
          ex("3-4-1", "Schivare e uscire", "4 x 8", "Schiva, passo fuori linea e corri via di 3 passi.", "4 x 5"),
          ex("3-4-2", "Leva al polso (ikkyo piano)", "3 x 5 per lato", "Con partner lento: gira il polso verso fuori e guida giù. Non fare male a nessuno.", "Solo il movimento senza partner"),
          ex("3-4-3", "Parata con entrata", "4 x 8", "Parata dall'interno e passo avanti fuori linea.", "4 x 5"),
          ex("3-4-4", "Caduta con rotolo", "5 volte lente", "Su tappeto, spalla verso fuori e rotola in diagonale.", "Cadute laterali", true),
          ex("3-4-5", "Reazione a sorpresa", "5 min", "Un partner dice un comando, tu rispondi con una parata o un passo.", "Comando fisso e prevedibile")
        ],
        [
          ex("3-5-1", "Copia da un combattente", "10 min", "Scegli un combattente (anche di fantasia), copia in lento tre suoi movimenti, poi rendili tuoi.", "Copiane uno"),
          ex("3-5-2", "Shadow di 5 round", "5 round da 2 min", "Cambia ritmo come se avessi davanti un avversario che si muove.", "3 round"),
          ex("3-5-3", "Sparring a secco (solo se hai un partner e protezioni)", "3 round da 90 s", "Contatto quasi zero e regole chiare: stop se uno dice stop.", "Salta e fai solo shadow"),
          ex("3-5-4", "Controllo della settimana", "5 min", "Scrivi cosa è diventato naturale e cosa ti serve ancora.", "Quello che ricordi")
        ]
      ]
    },
    {
      n: 4, title: "Stile Johan", sub: "Mischia i mondi e rendili tuoi",
      goal: "Passare da boxe a calci a schivate senza fermarti, in modo pulito.",
      days: [
        [
          ex("4-1-1", "Combinazione lunga", "4 x 8", "Jab-diretto-gancio-diretto con uscita laterale.", "4 x 5, tre colpi"),
          ex("4-1-2", "Difesa e contro", "4 x 10", "Schiva, blocca, rispondi: tre risposte diverse a un colpo.", "4 x 6"),
          ex("4-1-3", "Sacco libero", "5 x 2 min", "Sacco con ritmo libero. Usa tutto quello che sai.", "4 x 90 s"),
          ex("4-1-4", "Corsa con shadow", "3 x 3 min", "Corri 30 s e fai shadow 30 s, a ripetizione.", "3 x 2 min"),
          ex("4-1-5", "Respirazione di recupero", "3 min", "Seduto, inspira 4 secondi, espira 6.", "2 min")
        ],
        [
          ex("4-2-1", "Squat con salto", "3 x 8", "Scendi controllato, salta e atterra morbido.", "3 x 5, senza salto"),
          ex("4-2-2", "Spaccata frontale", "3 x 40 s", "Gambe una avanti e una dietro, fermati prima del dolore.", "Affondo profondo con appoggio", true),
          ex("4-2-3", "Ponte e anche", "3 x 10", "Ponte sui glutei, schiena neutra.", "3 x 6"),
          ex("4-2-4", "Mobilità alta della gamba", "3 x 8 per gamba", "Calcio alto lento di controllo, senza forzare.", "Gamba più bassa", true),
          ex("4-2-5", "Scarico", "5 min", "Camminata lenta e respirazione.", "3 min")
        ],
        [
          ex("4-3-1", "Calcio in salto leggero", "3 x 5 per gamba", "Solo se sei molto stabile. Piccolo salto, calcio medio.", "Calcio medio senza salto", true),
          ex("4-3-2", "Calcio circolare, ginocchio, gomito", "4 x 6", "Combina colpi lunghi e corti a distanza ravvicinata.", "4 x 4"),
          ex("4-3-3", "Calcio e uscita", "4 x 8", "Dopo il calcio, passo fuori e via. Il combattimento non è lo scopo.", "4 x 5"),
          ex("4-3-4", "Calci su tre altezze", "3 x 4 per gamba", "Basso, medio, alto. Si passa all'altezza successiva solo se la precedente è pulita.", "Basso e medio", true),
          ex("4-3-5", "Controllo equilibrio dopo il calcio", "3 x 8", "Atterra e resta fermo 2 secondi.", "3 x 5")
        ],
        [
          ex("4-4-1", "Schivata e presa leggera", "4 x 6 per lato", "Partner lento: schiva, afferra il polso e muovi la testa fuori linea. Resta fluido.", "Senza partner"),
          ex("4-4-2", "Combinazione di uscita", "4 x 5", "Postura aperta, parata, passo di lato, corsa. Come nella sequenza di uscita del Programma.", "4 x 3"),
          ex("4-4-3", "Cadute e rialzarsi di seguito", "5 volte", "Cadi, ti alzi e riprendi la guardia in meno di 3 secondi.", "3 volte lente"),
          ex("4-4-4", "Scenario a sorpresa", "3 round da 90 s", "Un partner ti si avvicina in modo imprevisto: tu scegli se parlare, schivare o andare via.", "Scenario prevedibile"),
          ex("4-4-5", "Ripasso delle tecniche di Programma", "10 min", "Scegli due tecniche del Programma e rifalle con calma.", "Una tecnica")
        ],
        [
          ex("4-5-1", "Copia e fondi", "15 min", "Copia un movimento di boxe, uno di Muay Thai e uno di aikido, poi collegali in una sola sequenza tua.", "Due movimenti"),
          ex("4-5-2", "Shadow stile Johan", "6 round da 2 min", "Cambia stile ogni round e a ogni campanella.", "4 round da 90 s"),
          ex("4-5-3", "Registrati", "5 min", "Gira un breve video di te: cerca guardia, equilibrio, ritmo.", "30 secondi"),
          ex("4-5-4", "Controllo del livello", "5 min", "Decidi se restare qui, salire ancora o tornare indietro.", "Quello che ricordi")
        ]
      ]
    }
  ];

  const SAFETY = [
    "Solo allenamento personale e con partner consenziente: niente contatto vero, stop alla prima parola.",
    "Fermati se senti dolore acuto, vertigini o dolore alle articolazioni. Il dolore forte non è progresso.",
    "Se hai problemi alla schiena, alle ginocchia o alle anche, usa sempre la versione facile e parlane con un medico o un istruttore.",
    "Gli esercizi di flessibilità (segnati con una F) si fanno solo dopo il riscaldamento e senza rimbalzi.",
    "Per calci alti, cadute e leve serve un tappeto e, meglio, un istruttore: impara prima da qualcuno che ti corregge dal vivo."
  ];

  return { JOHAN, WARMUP, COOLDOWN, DAYS, LEVELS, SAFETY };
})();
