/*
 * Progetto A - Mentalista: interrogatori simulati (senza DOM).
 *
 * Ogni scenario ha un sospettato e tre prove che tu conosci e lui no. A ogni partita il sospettato
 * e' colpevole oppure innocente (a caso). Come negli studi sulla tecnica delle prove al momento
 * giusto (Strategic Use of Evidence, Hartwig e colleghi):
 *  - l'innocente racconta spontaneamente i fatti, anche quelli che sembrano compromettenti, e le
 *    sue risposte tornano sempre con le prove;
 *  - il colpevole evita: nel racconto libero tace i fatti scomodi e, se gli chiedi di un fatto
 *    senza mostrargli la prova, spesso lo nega (contraddizione con la prova);
 *  - se la prova la mostri prima di chiedere, il colpevole adatta la storia e la contraddizione
 *    non c'e' piu'.
 * Il nervosismo e' uguale nei due casi: non distingue niente. La pressione non da' informazioni e
 * con gli innocenti produce cedimenti (false confessioni).
 * Livelli: 1 il colpevole nega tutto e l'innocente racconta tutto; 2 il colpevole ammette un
 * fatto e l'innocente ne dimentica uno; 3 il colpevole ne ammette due e l'innocente ne racconta
 * uno solo.
 */
(function (root) {
  "use strict";

  const SCENARIOS = [
    {
      id: "laptop", tu: true, back: false, title: "Il portatile sparito", who: "Paolo Riva", g: "m", role: "impiegato della contabilità",
      crime: "Martedì, tra le 18 e le 19, dalla sala riunioni del terzo piano è sparito il portatile della direttrice. Paolo è uno dei quattro dipendenti ancora in ufficio a quell'ora.",
      open: "Paolo, mi racconti tutto quello che hai fatto martedì dalle cinque in poi, senza saltare niente.",
      base: ["Martedì ho lavorato al bilancio trimestrale, era una giornata pesante.", "Poi sono tornato a casa, ho cenato e sono andato a dormire presto."],
      vague: "Verso sera ho chiuso il computer e sono andato via, come al solito.",
      evidence: [
        {
          label: "Il badge", ev: "Il badge di Paolo ha aperto la porta del terzo piano alle 18:40.",
          q: "Martedì, dopo le sei, sei salito al terzo piano?",
          free: "Prima di andare via sono salito al terzo piano a lasciare dei documenti in amministrazione.",
          yes: "Sì, verso le sette meno venti: dovevo lasciare delle fatture in amministrazione.",
          deny: "No, dopo le sei non mi sono mosso dalla mia scrivania al primo piano.",
          admit: "Sì, sono salito un attimo a prendere un caricabatterie che avevo lasciato su.",
          after: "Ah, il badge... Sì, forse sono salito un minuto. Non me lo ricordavo, sinceramente.",
          afterYes: "Esatto, è quello che le dicevo: le fatture per l'amministrazione."
        },
        {
          label: "Lo zaino", ev: "La signora delle pulizie ha visto Paolo uscire alle 19:05 con uno zaino grande e pieno.",
          q: "Che cosa avevi con te quando sei uscito?",
          free: "Avevo lo zaino della piscina: il martedì ci vado dopo il lavoro.",
          yes: "Lo zaino della piscina, quello grande blu: il martedì nuoto alle otto.",
          deny: "Niente, solo le chiavi e il telefono. Non porto mai zaini.",
          admit: "Lo zaino con le mie cose, come sempre.",
          after: "Lo zaino? Ah, sì... quello della palestra. Mi era passato di mente.",
          afterYes: "Sì, era il mio zaino della piscina: può chiedere in piscina, alle otto ero lì."
        },
        {
          label: "Il parcheggio", ev: "Le telecamere del parcheggio mostrano l'auto di Paolo ferma fino alle 19:10, con lui seduto dentro.",
          q: "A che ora sei partito dal parcheggio?",
          free: "In macchina sono rimasto un po' fermo al telefono con mia madre, poi sono partito verso le sette e dieci.",
          yes: "Verso le sette e dieci. Prima sono rimasto in macchina al telefono con mia madre.",
          deny: "Alle sei e mezza al massimo: alle sette ero già a casa.",
          admit: "Verso le sette, più o meno.",
          after: "Le sette e dieci? Può darsi, sì... ero al telefono in macchina, non guardavo l'ora.",
          afterYes: "Sì, ero al telefono con mia madre: può controllare le chiamate."
        }
      ]
    },
    {
      id: "register", tu: true, back: false, title: "La cassa del negozio", who: "Giulia Neri", g: "f", role: "commessa",
      crime: "Sabato sera, alla chiusura del negozio di abbigliamento, dalla cassa mancavano 400 euro. Giulia era di turno da sola durante la pausa pranzo.",
      open: "Giulia, raccontami la tua giornata di sabato dall'inizio, con calma.",
      base: ["Sabato ho aperto io alle nove e c'era parecchia gente, era il primo giorno di saldi.", "Il pomeriggio è stato uguale alla mattina: clienti, camerini, scaffali da rimettere a posto."],
      vague: "A pranzo ho fatto la mia pausa come sempre.",
      evidence: [
        {
          label: "Il registro di cassa", ev: "Il registro dice che la cassa è stata aperta con il codice di Giulia alle 13:12, durante la pausa, senza nessuna vendita.",
          q: "Durante la pausa pranzo hai aperto la cassa?",
          free: "Durante la pausa una signora mi ha chiesto di cambiarle una banconota da cinquanta per il parcheggio e ho aperto la cassa.",
          yes: "Sì, una volta: una signora doveva cambiare cinquanta euro per il parchimetro.",
          deny: "No, a pranzo la cassa resta chiusa. Non la tocco mai in pausa.",
          admit: "Sì, per cambiare dei soldi a una cliente.",
          after: "Alle 13:12? Ah... adesso ricordo, una cliente mi aveva chiesto di cambiare dei soldi.",
          afterYes: "Sì, è la signora del parchimetro di cui le parlavo."
        },
        {
          label: "Il magazzino", ev: "Una collega ha visto Giulia nel magazzino con la borsa aperta alle 13:20.",
          q: "Sei passata dal magazzino durante la pausa?",
          free: "Poi sono andata in magazzino, dove tengo la borsa, a prendere il pranzo che mi ero portata.",
          yes: "Sì, la borsa la lascio lì: ho preso il pranzo che mi ero portata da casa.",
          deny: "No, in pausa sono uscita subito a mangiare fuori.",
          admit: "Sì, a prendere il pranzo nella borsa.",
          after: "Nel magazzino... sì, per il pranzo. Non pensavo fosse importante.",
          afterYes: "Sì, per il pranzo: ho mangiato lì dietro, in piedi."
        },
        {
          label: "Il versamento", ev: "Lunedì Giulia ha versato 400 euro in contanti sul suo conto.",
          q: "In questi giorni hai fatto versamenti in banca?",
          free: "Lunedì sono passata in banca a versare i soldi che mi ha restituito mio fratello.",
          yes: "Sì, lunedì: quattrocento euro che mi ha ridato mio fratello, gli avevo prestato i soldi per l'assicurazione.",
          deny: "No, non uso quasi mai contanti. Pago tutto con la carta.",
          admit: "Sì, dei soldi che mi doveva mio fratello.",
          after: "Il versamento... sì, erano soldi di mio fratello. Non ci avevo pensato.",
          afterYes: "Sì, mio fratello: le do il suo numero, glielo confermerà."
        }
      ]
    },
    {
      id: "parking", tu: false, back: false, title: "Il colpo nel parcheggio", who: "Marco Bassi", g: "m", role: "proprietario di un'auto grigia",
      crime: "Sabato pomeriggio, nel parcheggio del supermercato, un'auto rossa è stata urtata e chi guidava se n'è andato senza lasciare un biglietto. Una telecamera ha ripreso un'auto grigia simile a quella di Marco.",
      open: "Marco, mi racconti il suo sabato pomeriggio, dal pranzo in poi?",
      base: ["Sabato ho pranzato con mia moglie e i bambini.", "La sera abbiamo guardato un film tutti insieme."],
      vague: "Il pomeriggio non ho fatto niente di particolare, qualche commissione.",
      evidence: [
        {
          label: "La telecamera", ev: "La telecamera dell'ingresso riprende l'auto di Marco entrare nel parcheggio del supermercato alle 17:30.",
          q: "Sabato pomeriggio è stato al supermercato?",
          free: "Verso le cinque e mezza sono andato a fare la spesa al supermercato.",
          yes: "Sì, verso le cinque e mezza, per la spesa della settimana.",
          deny: "No, sabato non sono uscito di casa.",
          admit: "Sì, sono passato a prendere un paio di cose.",
          after: "Il supermercato... ah, sabato! Sì, ci sono passato un momento. Avevo confuso i giorni.",
          afterYes: "Sì, glielo dicevo: la spesa della settimana."
        },
        {
          label: "Il graffio", ev: "Sul paraurti dell'auto di Marco c'è un graffio recente con tracce di vernice rossa.",
          q: "La sua auto ha qualche segno recente?",
          free: "Giovedì, entrando in garage, ho strusciato il paraurti contro la colonna, che è dipinta di rosso.",
          yes: "Sì, un graffio sul paraurti: giovedì ho strusciato contro la colonna rossa del garage del condominio. Può andare a vederla.",
          deny: "No, è come nuova. L'ho lavata proprio domenica.",
          admit: "Sì, c'è un graffio piccolo sul paraurti.",
          after: "Ah, quel graffio... credo me l'abbiano fatto al lavoro, nel parcheggio.",
          afterYes: "Sì, la colonna del garage: c'è ancora il segno sul cemento."
        },
        {
          label: "La giacca", ev: "Un testimone ha visto un uomo con una giacca gialla salire in fretta su un'auto grigia e partire.",
          q: "Che giacca indossava sabato?",
          free: "Avevo la mia giacca gialla da moto, la metto anche quando non vado in moto.",
          yes: "La giacca gialla da moto. La metto quasi sempre.",
          deny: "Un cappotto nero, quello lungo.",
          admit: "Una giacca gialla, sì.",
          after: "Gialla? Sì, ne ho una... ma ce l'hanno in tanti.",
          afterYes: "Sì, era la mia: gliel'avevo detto."
        }
      ]
    },
    {
      id: "hotel", tu: false, back: false, title: "Il braccialetto della 214", who: "Elena Costa", g: "f", role: "cameriera ai piani",
      crime: "Mercoledì una cliente dell'hotel ha denunciato la scomparsa di un braccialetto d'oro lasciato sul comodino della camera 214. Elena lavora al secondo piano.",
      open: "Elena, mi racconti la sua mattinata di mercoledì, camera per camera se riesce?",
      base: ["Mercoledì ho iniziato alle otto, come sempre, dal fondo del corridoio.", "Dopo pranzo ho finito le ultime camere e ho riportato giù il carrello."],
      vague: "Ho fatto il mio giro di camere, una dopo l'altra.",
      evidence: [
        {
          label: "La serratura", ev: "La serratura elettronica registra l'apertura della 214 con la chiave di Elena alle 11:05.",
          q: "Mercoledì mattina è entrata nella 214?",
          free: "Verso le undici ho fatto la 214.",
          yes: "Sì, verso le undici: era nel mio giro.",
          deny: "No, la 214 mercoledì non era nel mio giro.",
          admit: "Sì, l'ho rifatta in mattinata.",
          after: "La 214? Forse sì... ne faccio venti al giorno, si confondono.",
          afterYes: "Sì, come le dicevo, alle undici."
        },
        {
          label: "Il carrello", ev: "La telecamera del corridoio mostra il carrello di Elena davanti alla 214 per 25 minuti, il doppio del solito.",
          q: "Quanto tempo è rimasta nella 214?",
          free: "Nella 214 ci ho messo più del solito: avevano rovesciato il caffè sul tappeto e ho dovuto smacchiarlo.",
          yes: "Più del solito, quasi mezz'ora: c'era una macchia di caffè sul tappeto e l'ho dovuta smacchiare.",
          deny: "Dieci minuti, come per tutte le camere.",
          admit: "Un po' più del solito, forse.",
          after: "Venticinque minuti? Ah sì... c'era una macchia sul tappeto.",
          afterYes: "Sì, la macchia di caffè: il tappeto è ancora umido, può vederlo."
        },
        {
          label: "L'uscita anticipata", ev: "Alle 11:40 Elena ha chiesto alla responsabile di uscire mezz'ora prima.",
          q: "A che ora è uscita mercoledì?",
          free: "Sono uscita mezz'ora prima, alle due e mezza: avevo il dentista e avevo chiesto il permesso.",
          yes: "Alle due e mezza, invece che alle tre: avevo il dentista, ho chiesto il permesso.",
          deny: "Alle tre, come sempre.",
          admit: "Un po' prima, avevo un impegno.",
          after: "Ah, è vero, sono uscita prima... avevo un impegno.",
          afterYes: "Sì, il dentista: ho ancora la ricevuta."
        }
      ]
    },
    {
      id: "data", tu: false, back: false, title: "La lista clienti", who: "Luca Ferri", g: "m", role: "venditore",
      crime: "La lista dei clienti dell'azienda è finita in mano alla concorrenza. Il file è stato copiato lunedì mattina; Luca è uno dei tre venditori che ci avevano accesso.",
      open: "Luca, mi racconti la sua settimana, soprattutto lunedì e martedì?",
      base: ["Lunedì avevo la presentazione per un cliente importante, alle dieci.", "Il resto della settimana sono stato quasi sempre in giro dai clienti."],
      vague: "Lunedì mattina ho preparato la presentazione alla mia scrivania.",
      evidence: [
        {
          label: "La chiavetta", ev: "Il computer della sala riunioni registra una chiavetta USB collegata alle 8:10 di lunedì, con l'account di Luca.",
          q: "Lunedì mattina ha usato una chiavetta in sala riunioni?",
          free: "Alle otto sono andato in sala riunioni a caricare le slide con la chiavetta.",
          yes: "Sì, alle otto: le slide della presentazione le avevo sulla chiavetta.",
          deny: "No, non uso chiavette. Tengo tutto sul cloud aziendale.",
          admit: "Sì, per le slide.",
          after: "Ah, la chiavetta... sì, per le slide. Me n'ero scordato.",
          afterYes: "Sì, le slide: la chiavetta è qui, può guardarla."
        },
        {
          label: "La lista", ev: "La lista clienti è stata aperta con le credenziali di Luca alle 8:05 di lunedì.",
          q: "Lunedì mattina ha aperto la lista clienti?",
          free: "Prima ho aperto la lista clienti per controllare i numeri del cliente della presentazione.",
          yes: "Sì, mi servivano i fatturati del cliente per la presentazione.",
          deny: "No, la lista non la apro mai: non mi serve.",
          admit: "Sì, per controllare un dato.",
          after: "La lista... sì, forse l'ho aperta per controllare un nome.",
          afterYes: "Sì, per i fatturati: sono nelle slide, guardi."
        },
        {
          label: "Il pranzo", ev: "Martedì Luca ha pranzato con un dirigente della ditta concorrente: un collega li ha visti.",
          q: "Conosce qualcuno che lavora per la concorrenza?",
          free: "Martedì ho pranzato con Andrea, un mio compagno di università che adesso lavora dalla concorrenza.",
          yes: "Sì, Andrea, un mio vecchio compagno di università: martedì abbiamo pranzato insieme, ci vediamo ogni mese.",
          deny: "No, lì non conosco nessuno.",
          admit: "Sì, un vecchio amico.",
          after: "Quel pranzo? È un vecchio amico, non pensavo contasse.",
          afterYes: "Sì, Andrea: glielo avevo detto. Ci vediamo da anni."
        }
      ]
    },
    {
      id: "vending", tu: true, back: true, title: "La macchinetta scassinata", who: "Andrea Villa", g: "m", role: "studente",
      crime: "Lunedì notte, all'università, qualcuno ha forzato la macchinetta del caffè della sala studio e ha preso le monete, circa 60 euro. Andrea studia spesso lì fino a tardi.",
      open: "Andrea, mi racconti la tua serata di lunedì?",
      base: ["Lunedì ho studiato per l'esame di statistica, che ho giovedì.", "Poi sono tornato a casa in bici e sono andato a letto."],
      vague: "Ho studiato fino a tardi e poi sono andato via.",
      evidence: [
        {
          label: "Il tornello", ev: "Il badge di Andrea risulta all'uscita della biblioteca alle 23:10, mezz'ora dopo l'orario di chiusura.",
          q: "A che ora sei uscito lunedì sera?",
          free: "Sono uscito tardi, dopo le undici: il custode mi ha lasciato finire il capitolo.",
          yes: "Dopo le undici. Il custode mi conosce e mi ha lasciato finire.",
          deny: "Alle dieci e mezza, quando chiudono.",
          admit: "Un po' dopo la chiusura, forse.",
          after: "Alle 23:10? Ah, sì... mi ero perso nei conti, non guardavo l'ora.",
          afterYes: "Sì, come ti dicevo: chiedi al custode."
        },
        {
          label: "Le monete", ev: "Martedì il tabaccaio sotto casa di Andrea gli ha cambiato 60 euro in monete in banconote.",
          q: "Hai cambiato delle monete questa settimana?",
          free: "Martedì ho cambiato dal tabaccaio le monete delle mance: nel weekend faccio il cameriere.",
          yes: "Sì, martedì: le mance del weekend, faccio il cameriere in pizzeria e mi pagano quasi tutto in monete.",
          deny: "No, monete non ne ho mai.",
          admit: "Sì, qualche moneta.",
          after: "Le monete... erano le mance. Lavoro in pizzeria.",
          afterYes: "Sì, le mance: il titolare della pizzeria te lo può confermare."
        },
        {
          label: "La felpa", ev: "Vicino alla macchinetta è stata trovata una felpa grigia, con nella tasca una tessera della mensa a nome di Andrea.",
          q: "Hai perso qualcosa in sala studio?",
          free: "A proposito, ho perso la mia felpa grigia in sala studio, la cerco da martedì.",
          yes: "Sì, la mia felpa grigia: la cerco da martedì, dentro c'era anche la tessera della mensa.",
          deny: "No, niente.",
          admit: "Forse una felpa, non ricordo.",
          after: "La mia felpa... l'avrò dimenticata sulla sedia, qualcuno l'avrà spostata.",
          afterYes: "Sì, è la mia! Te l'avevo detto che la cercavo."
        }
      ]
    },
    {
      id: "gym", tu: false, back: false, title: "Lo spogliatoio della palestra", who: "Chiara Monti", g: "f", role: "iscritta alla palestra",
      crime: "Giovedì sera, dallo spogliatoio della palestra, è sparito un portafoglio da un armadietto della fila B. Chiara si allena lì da due anni.",
      open: "Chiara, mi racconti il suo giovedì sera in palestra?",
      base: ["Giovedì sono uscita dal lavoro alle sei e mezza.", "Poi sono tornata a casa e ho cenato."],
      vague: "Sono passata in palestra come al solito.",
      evidence: [
        {
          label: "Il tornello", ev: "Il tornello registra Chiara in entrata alle 19:02 e in uscita alle 19:25: di solito resta un'ora e mezza.",
          q: "Quanto tempo si è allenata giovedì?",
          free: "Mi sono allenata solo venti minuti: mi ha chiamato la baby-sitter, mio figlio aveva la febbre.",
          yes: "Pochissimo, venti minuti: la baby-sitter mi ha chiamato perché mio figlio aveva la febbre.",
          deny: "Il solito, un'ora e mezza.",
          admit: "Poco, avevo fretta.",
          after: "Venti minuti? Ah, sì... avevo fretta quella sera.",
          afterYes: "Sì, la febbre di mio figlio: c'è la chiamata sul telefono, alle 19:15."
        },
        {
          label: "La fila B", ev: "Una telecamera riprende Chiara davanti agli armadietti della fila B, quelli del furto.",
          q: "Quale armadietto usa di solito?",
          free: "Il mio armadietto era occupato, quindi ho usato uno della fila B.",
          yes: "Di solito il 12, ma giovedì era occupato e ne ho preso uno della fila B.",
          deny: "Sempre il 12, nella fila A. Nella fila B non vado mai.",
          admit: "Uno qualsiasi, quello libero.",
          after: "La fila B... sì, forse il mio era occupato.",
          afterYes: "Sì, il 31 della fila B, perché il mio era occupato."
        },
        {
          label: "Il rinnovo", ev: "Venerdì Chiara ha pagato in contanti il rinnovo annuale dell'abbonamento: 250 euro.",
          q: "Come ha pagato il rinnovo dell'abbonamento?",
          free: "Venerdì ho rinnovato l'abbonamento in contanti con i soldi del regalo di compleanno.",
          yes: "In contanti: erano i soldi che mi hanno regalato per il compleanno, la settimana scorsa.",
          deny: "Con la carta, come sempre.",
          admit: "In contanti.",
          after: "In contanti, sì... avevo dei soldi da parte.",
          afterYes: "Sì, i soldi del compleanno: ho ancora il biglietto d'auguri di mia zia."
        }
      ]
    },
    {
      id: "gallery", tu: false, back: false, title: "Il quadro rovinato", who: "Davide Russo", g: "m", role: "allestitore della mostra",
      crime: "Venerdì mattina, prima dell'apertura, un quadro della mostra è stato sfregiato con della vernice blu. Davide ha montato la mostra.",
      open: "Davide, mi racconti la sua settimana di lavoro alla mostra, fino a venerdì mattina?",
      base: ["Abbiamo montato la mostra da lunedì a giovedì, con due colleghi.", "Venerdì all'apertura c'erano già i giornalisti."],
      vague: "Venerdì sono arrivato con calma per gli ultimi ritocchi.",
      evidence: [
        {
          label: "Le chiavi", ev: "Il registro della portineria dice che Davide ha preso le chiavi della sala alle 7:30 di venerdì, prima di tutti.",
          q: "Venerdì a che ora è arrivato in sala?",
          free: "Venerdì sono arrivato presto, alle sette e mezza, per sistemare le luci.",
          yes: "Alle sette e mezza: dovevo puntare le luci prima che arrivassero tutti.",
          deny: "Verso le nove e mezza, con gli altri.",
          admit: "Presto, per le luci.",
          after: "Alle 7:30? Sì... ero passato a prendere una cosa.",
          afterYes: "Sì, per le luci: le ho finite alle otto e un quarto."
        },
        {
          label: "La vernice", ev: "Sulla giacca di Davide ci sono macchie di vernice blu, dello stesso colore di quella sul quadro.",
          q: "Questa settimana ha lavorato con la vernice?",
          free: "Mercoledì ho ridipinto di blu i pannelli dell'ingresso e mi sono sporcato tutto.",
          yes: "Sì, mercoledì ho ridipinto di blu i pannelli dell'ingresso: la stessa vernice che c'è in magazzino.",
          deny: "No, io monto e basta: la vernice non la tocco.",
          admit: "Un po', per dei ritocchi.",
          after: "La vernice... sì, avevo fatto dei ritocchi. Non ci pensavo.",
          afterYes: "Sì, i pannelli dell'ingresso: guardi il colore, è quello."
        },
        {
          label: "La lite", ev: "La settimana prima Davide e l'artista hanno litigato per messaggio sulla disposizione dei quadri.",
          q: "Che rapporti ha con l'artista?",
          free: "Con l'artista la settimana scorsa abbiamo discusso per la disposizione dei quadri, poi abbiamo chiarito.",
          yes: "Abbiamo discusso la settimana scorsa per la disposizione, anche in modo acceso. Poi ci siamo chiariti al telefono.",
          deny: "Ottimi, mai avuto un problema.",
          admit: "Normali, qualche discussione di lavoro.",
          after: "Quella discussione? Cose di lavoro, niente di serio.",
          afterYes: "Sì, abbiamo litigato e poi chiarito: le faccio vedere i messaggi del giorno dopo."
        }
      ]
    }
  ];

  const CUES = [
    "Si tocca spesso il collo.", "Evita il tuo sguardo e guarda il tavolo.", "Ti guarda fisso negli occhi, senza quasi sbattere le palpebre.",
    "Parla in fretta e si interrompe a metà delle frasi.", "Ride nervosamente.", "Sta immobile, a braccia conserte.",
    "Ha qualche goccia di sudore sulla fronte.", "Si sistema di continuo la manica.", "Muove il piede sotto il tavolo.", "Si schiarisce la voce prima di rispondere."
  ];
  const PRESSURE = {
    guilty: "Non ho fatto niente. Se continuate così, voglio un avvocato.",
    innocent: "Ma io non ho fatto niente! ...Non so più cosa dire. Se serve a finire, firmo quello che volete."
  };
  const LEVELS = [null, { admit: 0, mention: 3 }, { admit: 1, mention: 2 }, { admit: 2, mention: 1 }];
  const DIFF = [0, 640, 820, 980];
  const MAX_LEVEL = 3;

  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rand) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const sby = (g, m, f) => (g === "f" ? f : m);

  function start(level, seed, scenarioId) {
    const L = Math.max(1, Math.min(MAX_LEVEL, level | 0 || 1));
    const rand = rng(seed);
    const sc = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[Math.floor(rand() * SCENARIOS.length)];
    const guilty = rand() < 0.5;
    const order = shuffle([0, 1, 2], rand);
    const lv = LEVELS[L];
    return {
      kind: "interro", level: L, seed, sid: sc.id, guilty, diff: DIFF[L],
      admit: guilty ? order.slice(0, lv.admit) : [],
      mention: guilty ? [] : order.slice(0, lv.mention).sort(),
      asked: [false, false, false], shown: [false, false, false], denied: [false, false, false],
      free: false, observed: 0, pressed: false, firstMove: null, log: [], done: false, cueSeed: Math.floor(rand() * 1e6)
    };
  }
  function scenario(run) { return SCENARIOS.find((s) => s.id === run.sid); }

  function say(run, who, text, tag) { run.log.push({ who, text, tag: tag || "" }); }
  function act(run, kind, i) {
    if (!run || run.done) return null;
    const sc = scenario(run);
    if (!run.firstMove) run.firstMove = kind;
    if (kind === "free") {
      if (run.free) return null;
      run.free = true;
      say(run, "me", sc.open);
      const parts = [sc.base[0]];
      if (run.guilty) parts.push(sc.vague);
      else run.mention.forEach((k) => parts.push(sc.evidence[k].free));
      if (!run.guilty && !run.mention.length) parts.push(sc.vague);
      parts.push(sc.base[1]);
      say(run, "them", parts.join(" "));
      return run.log[run.log.length - 1];
    }
    if (kind === "ask") {
      const e = sc.evidence[i];
      if (!e || run.asked[i]) return null;
      run.asked[i] = true;
      say(run, "me", e.q);
      let a;
      if (!run.guilty) a = e.yes;
      else if (run.shown[i] || run.admit.includes(i)) a = e.admit;
      else { a = e.deny; run.denied[i] = true; }
      say(run, "them", a);
      return run.log[run.log.length - 1];
    }
    if (kind === "show") {
      const e = sc.evidence[i];
      if (!e || run.shown[i]) return null;
      run.shown[i] = true;
      say(run, "me", `${sc.tu ? "Guarda" : "Guardi"} questo. ${e.ev}`, "show");
      let a;
      if (!run.guilty) a = run.asked[i] || run.mention.includes(i) ? e.afterYes : e.yes;
      else if (run.denied[i]) a = e.after;
      else if (run.asked[i]) a = sc.back ? "Sì, è quello che ti ho detto." : "Sì, è quello che le ho detto.";
      else a = e.admit;
      say(run, "them", a);
      return run.log[run.log.length - 1];
    }
    if (kind === "observe") {
      run.observed += 1;
      const r = rng(run.cueSeed + run.observed * 7);
      const pickA = CUES[Math.floor(r() * CUES.length)];
      let pickB = CUES[Math.floor(r() * CUES.length)];
      if (pickB === pickA) pickB = CUES[(CUES.indexOf(pickA) + 3) % CUES.length];
      say(run, "note", `${pickA} ${pickB}`, "cue");
      return run.log[run.log.length - 1];
    }
    if (kind === "press") {
      if (run.pressed) return null;
      run.pressed = true;
      say(run, "me", sc.tu ? `Sappiamo che sei ${sby(sc.g, "stato", "stata")} tu. Ti conviene ammetterlo adesso.` : `Sappiamo che è ${sby(sc.g, "stato lui", "stata lei")}. Le conviene ammetterlo adesso.`);
      say(run, "them", run.guilty ? PRESSURE.guilty : PRESSURE.innocent);
      return run.log[run.log.length - 1];
    }
    return null;
  }
  // tecnica: racconto libero prima di tutto, domande prima di mostrare le prove, niente pressione
  function technique(run) {
    let score = 0;
    const notes = [];
    if (run.free && run.firstMove === "free") { score += 20; notes.push({ ok: true, text: "Hai cominciato dal racconto libero: è lì che chi dice il vero racconta da solo i fatti scomodi." }); }
    else if (run.free) { score += 10; notes.push({ ok: false, text: "Il racconto libero va chiesto per primo, prima di qualunque domanda: così non suggerisci niente." }); }
    else notes.push({ ok: false, text: "Non hai chiesto il racconto libero: è la prima cosa da fare, e costa niente." });
    // ricostruisco l'ordine dal registro
    const seenShow = [false, false, false];
    const askedBefore = [false, false, false];
    const sc = scenario(run);
    run.log.forEach((m) => {
      if (m.who !== "me") return;
      sc.evidence.forEach((e, i) => {
        if (m.text === e.q && !seenShow[i]) askedBefore[i] = true;
        if (m.tag === "show" && m.text.includes(e.ev)) seenShow[i] = true;
      });
    });
    const good = askedBefore.filter(Boolean).length;
    const early = [0, 1, 2].filter((i) => run.shown[i] && !askedBefore[i]).length;
    score += good * 20;
    if (good === 3) notes.push({ ok: true, text: "Hai chiesto di tutti e tre i fatti prima di mostrare le prove: è il cuore della tecnica." });
    else if (good) notes.push({ ok: false, text: `Hai chiesto ${good === 1 ? "di un solo fatto" : `di ${good} fatti`} prima di mostrare la prova. Chiedere di tutti, senza rivelare cosa sai, dà più occasioni di trovare una contraddizione.` });
    else notes.push({ ok: false, text: "Non hai chiesto dei fatti prima di mostrare le prove: così chi mente può adattare la storia a quello che sai." });
    const late = [0, 1, 2].filter((i) => run.shown[i] && askedBefore[i]).length;
    if (late && !early) { score += 20; notes.push({ ok: true, text: "Le prove le hai mostrate solo alla fine, dopo le domande: chi ha negato è costretto a cambiare versione davanti a te." }); }
    else if (!late && good) notes.push({ ok: null, text: "Alla fine puoi anche mostrare le prove: se una risposta negava il fatto, la nuova versione sarà diversa dalla prima." });
    if (early) { score -= early * 10; notes.push({ ok: false, text: `${early === 1 ? "Una prova mostrata" : `${early} prove mostrate`} prima di chiedere: per un colpevole è un regalo, gli dici cosa deve spiegare.` }); }
    if (run.pressed) { score -= 30; notes.push({ ok: false, text: "La pressione non dà informazioni: il colpevole si chiude, l'innocente può cedere e ammettere cose non vere. Negli interrogatori veri è anche vietata quando lede la libertà di decidere." }); }
    if (run.observed) notes.push({ ok: null, text: "I segni di nervosismo che hai osservato compaiono in chi mente e in chi dice il vero allo stesso modo: non vanno usati per decidere." });
    return { score: Math.max(0, Math.min(100, score)), notes, askedBefore, early };
  }
  function verdict(run, saysGuilty) {
    if (!run || run.done) return null;
    run.done = true;
    run.saysGuilty = Boolean(saysGuilty);
    const ok = run.saysGuilty === run.guilty;
    const t = technique(run);
    const sc = scenario(run);
    const contradictions = [0, 1, 2].filter((i) => run.denied[i]).map((i) => sc.evidence[i].label);
    return { ok, guilty: run.guilty, technique: t.score, notes: t.notes, contradictions, early: t.early };
  }
  // spiegazione finale: cosa avrebbe mostrato la tecnica
  function debrief(run) {
    const sc = scenario(run);
    const n = sby(sc.g, "lui", "lei");
    if (run.guilty) {
      const denied = run.denied.map((d, i) => (d ? sc.evidence[i].label.charAt(0).toLowerCase() + sc.evidence[i].label.slice(1) : null)).filter(Boolean);
      return `${sc.who} era colpevole. ${denied.length ? `Ha negato fatti che le prove dimostrano (${denied.join(", ")}): è la contraddizione che la tecnica cerca.` : `Non l'hai mai colto in contraddizione: per i fatti che ammetteva non c'era niente da trovare, quelli che avrebbe negato li hai mostrati prima di chiedere${run.asked.every(Boolean) ? "" : ", oppure non li hai chiesti"}.`} Nel racconto libero ha taciuto i fatti scomodi: chi mente evita, chi è innocente racconta.`;
    }
    const forgot = [0, 1, 2].filter((i) => !run.mention.includes(i)).length;
    return `${sc.who} era innocente. Ogni risposta tornava con le prove, e ogni prova aveva una spiegazione che si può verificare.${forgot ? ` Nel racconto libero ${n} ha dimenticato ${forgot === 1 ? "un fatto" : `${forgot} fatti`}: dimenticare non è mentire, conta che quando ${sby(sc.g, "gli", "le")} chiedi non neghi ciò che è provato.` : ""}`;
  }

  const api = { SCENARIOS, CUES, LEVELS, DIFF, MAX_LEVEL, start, scenario, act, technique, verdict, debrief };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MentalistInterro = api;
})(typeof window !== "undefined" ? window : globalThis);
