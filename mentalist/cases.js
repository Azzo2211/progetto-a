/*
 * Progetto A - Mentalista: i casi (dati, senza DOM).
 *
 * Ogni caso: un fatto, una scena da esaminare, delle persone da osservare e interrogare. Ogni
 * azione costa una mossa e le mosse sono contate: come Jane, devi scegliere che cosa guardare.
 * Quello che scopri finisce nel taccuino come «fatto». Alla fine ricostruisci: chi è stato, i
 * fatti che lo provano (si scelgono tra quelli trovati), il movente e la trappola per chiudere.
 * Regole del giallo leale: tutto quello che serve per arrivarci si può scoprire nel caso.
 *
 * Campi: scene[{id,name,text,fact}], people[{id,name,role,look,lookFact,ask[{id,q,a,fact}]}],
 * facts{id:testo}, culprit, keys[] (fatti della prova), need (quanti sceglierne), motives[],
 * motive (indice), traps[{text,ok,why}], close[] (come si chiude), lesson.
 */
(function (root) {
  "use strict";

  const CASES = [
    /* ---------------------------------------------------------------- 1 */
    {
      id: "bar", level: 1, title: "Il fondo cassa", place: "Bar Centrale, Bologna",
      brief: [
        "Domenica mattina Bruno Ferri, titolare del Bar Centrale, apre la cassaforte nel retro e trova la busta della banca vuota: mancano 640 euro, l'incasso del sabato.",
        "La cassaforte non è forzata. Sabato sera hanno chiuso in tre: Sara, la barista; Davide, il cuoco; Kevin, il ragazzo delle pulizie, in prova da un mese."
      ],
      budget: 14,
      scene: [
        { id: "safe", name: "La cassaforte", text: "Nessun segno di scasso, né sulla porta né sulla serratura. Si apre con una combinazione di quattro cifre.", fact: "noforce" },
        { id: "drawer", name: "Il cassetto della scrivania", text: "Sotto un blocco di ricevute c'è un post-it ingiallito con quattro cifre: la combinazione della cassaforte. Chiunque abbia lavorato qui per un po' può averlo visto.", fact: "postit" },
        { id: "door", name: "La porta sul retro", text: "Ha un sensore collegato all'allarme. Il registro dice: alle 23:46 porta chiusa e allarme inserito; alle 0:52 la porta si riapre e l'allarme viene disinserito con il codice; all'1:05 si richiude e l'allarme viene reinserito.", fact: "door" },
        { id: "bin", name: "Il bidone della cucina", text: "Il sacco è nuovo, quasi vuoto: sul fondo c'è soltanto la busta della banca, strappata.", fact: "bin" },
        { id: "cam", name: "La telecamera del retro", text: "È spenta da una settimana: Bruno aspetta il tecnico. Lo sanno tutti, se ne parla da giorni.", fact: "cam" },
        { id: "phone", name: "Il telefono di Bruno", text: "Alle 23:04 di sabato Sara gli ha mandato la foto dell'incasso contato, 640 euro nella busta, come fa ogni sera.", fact: "photo" }
      ],
      people: [
        {
          id: "bruno", name: "Bruno Ferri", role: "titolare",
          look: "Sui sessant'anni, occhi arrossati di chi ha dormito poco. Al polso ha ancora il braccialetto di carta di una festa.",
          ask: [
            { id: "keys", q: "Chi ha le chiavi del bar e il codice dell'allarme?", a: "Io, Davide, che la mattina apre alle sette per i fornitori, e Kevin, perché la sera chiude lui. Sara no: lei esce sempre prima.", fact: "keys" },
            { id: "where", q: "Dov'era sabato notte?", a: "Al matrimonio di mio nipote a Modena, fino alle due passate. C'erano cento persone, e ci sono le foto.", fact: "bruno" }
          ]
        },
        {
          id: "sara", name: "Sara Lodi", role: "barista",
          look: "Unghie corte, gesti precisi, risponde guardandoti in faccia. Ha il telefono pieno di foto di scontrini: tiene i conti in ordine.",
          ask: [
            { id: "close", q: "Che cosa hai fatto alla chiusura?", a: "Ho contato l'incasso, 640 euro, ho mandato la foto a Bruno alle 23:04 e ho messo la busta in cassaforte. Alle 23:15 ero già alla fermata dell'autobus.", fact: "photo" },
            { id: "postit", q: "Chi sa del post-it con la combinazione?", a: "Credo tutti quelli che sono qui da un po'. Davide di sicuro: la settimana scorsa l'ho visto aprire la cassaforte per metterci i soldi dei fornitori.", fact: "davideknows" }
          ]
        },
        {
          id: "davide", name: "Davide Conti", role: "cuoco",
          look: "Occhiaie profonde, un cerotto fresco sul pollice. Non molla mai il telefono, e lo schermo si accende di continuo: notifiche di un'app di scommesse sportive. Una dice «Saldo negativo: ricarica per continuare».",
          lookFact: "bets",
          ask: [
            { id: "time", q: "A che ora sei andato via sabato sera?", a: "Verso le 23:30, poco dopo Sara. Sono andato a casa a dormire e non sono più uscito.", fact: "davidesays" },
            { id: "money", q: "Come vanno le cose con i soldi?", a: "Si irrigidisce. «Benissimo. Perché me lo chiede?»", fact: "davidestiff" }
          ]
        },
        {
          id: "kevin", name: "Kevin Mancini", role: "pulizie, in prova",
          look: "Diciannove anni. Non ti guarda negli occhi e si tormenta le mani: è il suo primo lavoro e ha paura di perderlo.",
          lookFact: "kevinnervous",
          ask: [
            { id: "close", q: "Che cosa hai fatto alla chiusura?", a: "Ho pulito, ho svuotato tutti i bidoni, anche quello della cucina, e ho portato fuori i sacchi. Poi ho chiuso e ho messo l'allarme, alle 23:46.", fact: "kevinbins" },
            { id: "after", q: "E dopo dove sei andato?", a: "Ho preso il notturno delle 23:55 per Casalecchio. A mezzanotte e mezza ero a casa: mia madre era sveglia e mi ha scaldato la cena.", fact: "kevinhome" }
          ]
        },
        {
          id: "rosa", name: "Rosa Bellei", role: "fornaia, di fronte al bar",
          look: "Farina fino ai gomiti. Il suo forno apre a mezzanotte e mezza per il pane del mattino: di notte, in questa strada, è l'unica sveglia.",
          ask: [
            { id: "night", q: "Stanotte ha visto qualcuno vicino al bar?", a: "Verso l'una è arrivato il furgoncino bianco del cuoco, quello con la scritta del catering. Si è fermato sul retro, e alla guida c'era lui: l'ho visto scendere sotto il lampione. È ripartito dopo un quarto d'ora.", fact: "van" }
          ]
        }
      ],
      facts: {
        noforce: "La cassaforte è stata aperta con la combinazione, senza forzarla.",
        postit: "La combinazione è scritta su un post-it nel cassetto: non la conoscono solo Bruno e Sara.",
        door: "Qualcuno è rientrato dal retro alle 0:52 con chiavi e codice dell'allarme, ed è uscito all'1:05.",
        bin: "La busta della banca, strappata, era da sola in un sacco nuovo nel bidone della cucina.",
        cam: "La telecamera del retro è guasta da una settimana, e lo sanno tutti.",
        photo: "Alle 23:04 i 640 euro erano nella busta: Sara li ha fotografati per Bruno.",
        keys: "Chiavi e codice dell'allarme li hanno solo Bruno, Davide e Kevin.",
        bruno: "Bruno era a un matrimonio a Modena fino alle due.",
        davideknows: "Davide conosce la combinazione: Sara l'ha visto aprire la cassaforte.",
        bets: "Davide è in rosso sul conto delle scommesse.",
        davidesays: "Davide dice di essere andato a casa alle 23:30 e di non essere più uscito.",
        davidestiff: "Davide si irrigidisce quando si parla di soldi.",
        kevinnervous: "Kevin è molto nervoso.",
        kevinbins: "Kevin ha svuotato il bidone della cucina prima di chiudere il bar alle 23:46.",
        kevinhome: "Kevin dice di essere a casa a Casalecchio da mezzanotte e mezza.",
        van: "Verso l'una Davide è sceso dal suo furgoncino sul retro del bar ed è rimasto un quarto d'ora."
      },
      culprit: "davide",
      keys: ["door", "keys", "van", "davidesays", "kevinbins", "bin", "photo", "bruno", "davideknows", "postit"],
      need: 3,
      motives: ["I debiti delle scommesse", "Una vendetta contro Bruno per lo stipendio", "Coprire un ammanco con i fornitori"],
      motive: 0,
      traps: [
        { text: "Dire davanti a tutti che Bruno annota i numeri di serie delle banconote da 50 per la banca, e che domani la banca li controllerà. Poi guardare chi, in giornata, prova a liberarsi dei soldi.", ok: true, why: "Solo chi ha i soldi ha un motivo per correre a spenderli. Davide va alla sala scommesse a giocare le banconote da 50 e lo fermano lì, con il resto in tasca. È il principio di quasi tutte le trappole di Jane: una notizia che può preoccupare solo il colpevole, perché solo lui sa di avere i soldi." },
        { text: "Mettere Davide sotto pressione finché non confessa.", ok: false, why: "Una confessione strappata con la pressione non prova niente: può essere falsa, e in un processo non vale." },
        { text: "Guardare chi distoglie lo sguardo mentre si parla del furto.", ok: false, why: "Il nervosismo non distingue chi mente: qui il più agitato è Kevin, ed è innocente." },
        { text: "Chiedere a tutti di fare la macchina della verità.", ok: false, why: "Il poligrafo misura l'agitazione, non la menzogna, e in Italia non si usa come prova." }
      ],
      close: [
        "Si parte dai fatti con un orario. Alle 23:04 i soldi erano nella busta. La busta è finita nel bidone della cucina, ma Kevin quel bidone l'aveva svuotato alle 23:46, prima di chiudere: quindi qualcuno è tornato dopo la chiusura. Il registro della porta lo conferma: alle 0:52 qualcuno rientra con chiavi e codice.",
        "Chiavi e codice li hanno in tre. Bruno era a Modena. Davide dice di non essere più uscito, ma la fornaia lo ha visto scendere dal suo furgoncino sul retro proprio a quell'ora. Il post-it spiega come conosceva la combinazione, il saldo in rosso delle scommesse spiega perché.",
        "E Kevin? Era solo un ragazzo al primo lavoro con paura di perderlo. Il suo nervosismo non diceva niente."
      ],
      lesson: "I fatti con un orario valgono più di qualsiasi sguardo: la busta in un bidone appena svuotato racconta più di tutto il nervosismo di Kevin."
    },

    /* ---------------------------------------------------------------- 2 */
    {
      id: "test", level: 1, title: "Il compito in classe", place: "Liceo Volta, Como",
      brief: [
        "Giovedì la 4B ha il compito di matematica. Mercoledì sera il testo, identico, gira già nella chat della classe.",
        "La professoressa Gatti lo aveva stampato martedì pomeriggio e lasciato in una cartellina, nel cassetto della cattedra in sala professori. Il preside vuole sapere chi l'ha fotografato prima di decidere se annullare il compito per tutti."
      ],
      budget: 13,
      scene: [
        { id: "folder", name: "La cartellina", text: "Dentro ci sono le 25 copie. Una ha un angolo piegato e, sul retro, una ditata di gesso azzurro.", fact: "chalk" },
        { id: "photo", name: "La foto nella chat", text: "Il foglio è appoggiato su un piano di legno chiaro, come le cattedre della sala professori. Nell'angolo si vede il polsino di una felpa verde con lo stemma della squadra di pallavolo della scuola.", fact: "sleeve" },
        { id: "first", name: "Il primo messaggio", text: "Risalendo gli inoltri si arriva al primo messaggio: martedì alle 17:42, da un numero che non è in rubrica a nessuno. Una SIM nuova.", fact: "time" },
        { id: "room", name: "La sala professori", text: "Martedì pomeriggio era aperta fino alle 18 per i colloqui con i genitori. La porta non ha serratura.", fact: "room" },
        { id: "aula12", name: "L'aula 12", text: "È l'unica aula con i gessetti colorati: il martedì pomeriggio ci si tiene il corso di disegno tecnico.", fact: "blue" },
        { id: "course", name: "Il registro del corso di disegno", text: "Martedì, dalle 15:30 alle 17:15. Presenti: Filippo, Martina e Omar, tutti della 4B. Nessuno è uscito prima.", fact: "course" }
      ],
      people: [
        {
          id: "gatti", name: "Prof.ssa Gatti", role: "insegnante di matematica",
          look: "Penne divise per colore nel taschino, voce ferma. Parla del compito come di un tradimento personale.",
          ask: [
            { id: "know", q: "Chi sapeva dove teneva il compito?", a: "Lo dico in classe da anni: «I compiti sono nel cassetto, non provateci nemmeno». Lo sanno tutti.", fact: "allknow" },
            { id: "count", q: "Quando ha controllato le copie l'ultima volta?", a: "Le ho contate martedì alle 16, prima dei colloqui. Erano tutte lì, in ordine." }
          ]
        },
        {
          id: "filippo", name: "Filippo Neri", role: "studente della 4B",
          look: "Felpa verde della squadra di pallavolo. Risponde prima che tu abbia finito la domanda e intanto controlla la porta.",
          ask: [
            { id: "after", q: "Dove sei andato martedì dopo il corso di disegno?", a: "A casa. Ho preso l'autobus delle 17:35, come sempre.", fact: "filipposays" },
            { id: "grades", q: "Come vai in matematica?", a: "Male. Ho due insufficienze, e se prendo un altro quattro non mi fanno giocare il campionato: è la regola della squadra.", fact: "grades" }
          ]
        },
        {
          id: "martina", name: "Martina Sala", role: "studentessa della 4B",
          look: "Felpa verde della pallavolo legata in vita, ginocchiere che spuntano dallo zaino.",
          ask: [
            { id: "after", q: "Dove sei andata martedì dopo il corso di disegno?", a: "In palestra: alle 17:30 c'era l'allenamento. Chieda pure al mister.", fact: "martinasays" }
          ]
        },
        {
          id: "omar", name: "Omar Belli", role: "studente della 4B",
          look: "Giacca di jeans, niente felpe della scuola. Dice di non aver mai fatto sport in vita sua.",
          ask: [
            { id: "after", q: "Dove sei andato martedì dopo il corso di disegno?", a: "Sono rimasto in aula 12 a finire la tavola con il professore di disegno, fino alle sei passate.", fact: "omar" }
          ]
        },
        {
          id: "gino", name: "Gino", role: "bidello",
          look: "Un mazzo di chiavi enorme alla cintura. Conosce tutti gli studenti per nome, e sa chi fa cosa.",
          ask: [
            { id: "seen", q: "Martedì, dopo le cinque e mezza, ha visto studenti vicino alla sala professori?", a: "Alle 17:40 c'era Filippo della 4B lì davanti. Ha detto che cercava la professoressa Gatti per un colloquio. Ma i colloqui sono per i genitori.", fact: "gino" },
            { id: "gym", q: "A che ora è cominciato l'allenamento di pallavolo?", a: "Alle 17:30 in punto il mister fa l'appello e ritira i telefoni fino alle sette. La squadra femminile era tutta lì, Martina compresa.", fact: "gym" }
          ]
        }
      ],
      facts: {
        chalk: "Una copia ha una ditata di gesso azzurro sul retro.",
        sleeve: "Nella foto si vede il polsino di una felpa verde della squadra di pallavolo.",
        time: "La foto è partita per la prima volta martedì alle 17:42.",
        room: "Martedì pomeriggio la sala professori era aperta fino alle 18.",
        blue: "I gessetti azzurri ci sono solo in aula 12, dove martedì c'era il corso di disegno.",
        course: "Al corso di disegno di martedì, dalle 15:30 alle 17:15, c'erano Filippo, Martina e Omar.",
        allknow: "Tutta la classe sa dove la professoressa tiene i compiti.",
        filipposays: "Filippo dice di aver preso l'autobus delle 17:35 per tornare a casa.",
        grades: "Filippo ha due insufficienze: con un'altra, niente campionato di pallavolo.",
        martinasays: "Martina dice di essere andata all'allenamento delle 17:30.",
        omar: "Omar dice di essere rimasto in aula 12 con il professore fino alle sei passate.",
        gino: "Alle 17:40 il bidello ha visto Filippo davanti alla sala professori.",
        gym: "Alle 17:30 Martina era all'appello in palestra, e i telefoni sono stati ritirati fino alle sette."
      },
      culprit: "filippo",
      keys: ["gino", "filipposays", "sleeve", "time", "gym", "chalk", "blue", "course"],
      need: 3,
      motives: ["Rischiava di non giocare il campionato per i voti", "Voleva vendere il compito ai compagni", "Ce l'aveva con la professoressa"],
      motive: 0,
      traps: [
        { text: "Preparare un nuovo compito in tre versioni appena diverse, fare in modo che ciascuno dei tre del corso possa vederne «per caso» una sola, e aspettare quale versione finisce nella chat.", ok: true, why: "È la «trappola del canarino»: la versione che ricompare dice da chi è uscita. In chat gira quella mostrata a Filippo, con la virgola spostata che c'era solo nella sua copia." },
        { text: "Annullare il compito e mettere una nota a tutta la classe.", ok: false, why: "Così il colpevole si confonde con gli altri: è proprio quello che spera." },
        { text: "Chiedere in classe a chi ha fotografato il compito di farsi avanti.", ok: false, why: "Senza conseguenze chiare e senza prove, nessuno si fa avanti: si perde solo l'effetto sorpresa." },
        { text: "Guardare chi arrossisce quando si nomina la chat.", ok: false, why: "Arrossisce anche chi ha soltanto letto il compito in chat, cioè mezza classe." }
      ],
      close: [
        "Due dettagli fisici stringono il campo. Il gesso azzurro c'è solo in aula 12: chi ha toccato la copia veniva dal corso di disegno, quindi Filippo, Martina o Omar. Il polsino della felpa della pallavolo toglie Omar, che non fa sport e non ha la felpa.",
        "Poi l'orario. Il corso finisce alle 17:15 e la foto parte alle 17:42. Alle 17:30 Martina è all'appello in palestra e consegna il telefono fino alle sette. Filippo dice di aver preso l'autobus delle 17:35, ma alle 17:40 il bidello lo vede davanti alla sala professori. La regola della squadra spiega il perché.",
        "La trappola del canarino trasforma il sospetto in prova: non serve una confessione, basta vedere quale versione esce."
      ],
      lesson: "Un dettaglio fisico restringe il campo, un orario lo chiude. E una buona trappola fa parlare i fatti al posto delle persone."
    },

    /* ---------------------------------------------------------------- 3 */
    {
      id: "book", level: 1, title: "La cinquecentina", place: "Biblioteca civica, Ferrara",
      brief: [
        "Sabato pomeriggio, alle 15:50, la bibliotecaria Ines Ruffo trova aperta e vuota la vetrina della sala antica: manca un Orlando furioso stampato a Ferrara nel 1532, il pezzo più prezioso della biblioteca.",
        "Alle 16 i carabinieri hanno controllato borse, zaini e cappotti di tutti i presenti: il libro non c'è. In biblioteca c'erano Ines, il volontario Pietro, il laureando Lorenzo Gallo e una lettrice abituale, la signora Carla Neri."
      ],
      budget: 14,
      scene: [
        { id: "case", name: "La vetrina", text: "La serratura è vecchia: qualcuno l'ha fatta saltare facendo leva. Sul tavolo accanto c'è il tagliacarte di ottone della sala, con la punta piegata.", fact: "lever" },
        { id: "side", name: "La porta laterale", text: "È l'uscita di sicurezza sul cortile: da fuori non ha maniglia, si apre solo da dentro. Sul pavimento, appena dietro, c'è un cuneo di gomma per tenerla accostata. Il cuneo è bagnato.", fact: "wedge" },
        { id: "hall", name: "Il corridoio dei bagni", text: "Collega la sala antica alla porta laterale. Sul pavimento ci sono orme bagnate che vanno dalla porta alla sala antica e tornano. Appoggiato al termosifone, un ombrello verde con il logo della Canottieri Ferrara gocciola ancora.", fact: "umbrella" },
        { id: "office", name: "Il telefono dell'ufficio", text: "L'ufficio di Ines è al piano di sopra. Il registro del telefono fisso: una chiamata con il Comune dalle 15:28 alle 15:47.", fact: "call" },
        { id: "desk", name: "Il computer del bancone", text: "Il bancone è all'ingresso, lontano dalla sala antica. Il programma dei prestiti ha registrato tre restituzioni fatte da Pietro, alle 15:33, alle 15:39 e alle 15:46.", fact: "loans" },
        { id: "table", name: "Il tavolo di Lorenzo", text: "Nella sala antica, nel cestino sotto il tavolo di Lorenzo, c'è un foglio appallottolato: la stampa di un sito d'aste. «Ariosto, Orlando furioso, Ferrara 1532. Stima 25.000-35.000 euro.» Gli appunti della tesi, sul tavolo, sono fermi a tre settimane fa.", fact: "auction" }
      ],
      people: [
        {
          id: "ines", name: "Ines Ruffo", role: "bibliotecaria",
          look: "Cinquant'anni, occhiali sulla testa, più furiosa che spaventata. Sul bancone c'è una petizione contro il trasferimento dei libri antichi a Bologna: la sua firma è la prima.",
          lookFact: "petition",
          ask: [
            { id: "car", q: "Di chi sono le auto nel cortile?", a: "La Golf è mia, la Punto di Pietro. La Panda rossa è di Lorenzo: viene a studiare tutti i sabati e lo lascio parcheggiare dentro.", fact: "car" },
            { id: "value", q: "Qualcuno le ha chiesto della cinquecentina, ultimamente?", a: "Lorenzo, la settimana scorsa: voleva sapere quanto vale. Gli ho detto che una copia come la nostra, all'asta, è andata a trentamila euro. Ho pensato che fosse curiosità da studente.", fact: "value" }
          ]
        },
        {
          id: "pietro", name: "Pietro Malaguti", role: "volontario",
          look: "Settantadue anni, cardigan abbottonato fino in cima. Le scarpe sono asciutte e lucide.",
          lookFact: "pietrodry",
          ask: [
            { id: "seen", q: "Quando ha visto il libro per l'ultima volta?", a: "Alle 15:30. Sono passato in sala antica a chiudere le finestre, perché il cielo si era fatto nero. Il libro era nella vetrina, e Lorenzo al suo tavolo. Poi sono tornato al bancone e non mi sono più mosso.", fact: "seen" },
            { id: "carla", q: "La signora Neri si è mai alzata?", a: "Solo per andare in bagno, verso le 15:35: tre minuti. Per il resto era seduta davanti al bancone con il suo cruciverba, e mi chiedeva le parole.", fact: "carlatime" }
          ]
        },
        {
          id: "lorenzo", name: "Lorenzo Gallo", role: "laureando",
          look: "Ventiquattro anni, felpa della Canottieri Ferrara. Le scarpe da ginnastica sono fradice e i jeans bagnati fino alle caviglie.",
          lookFact: "wet",
          ask: [
            { id: "where", q: "Oggi pomeriggio sei mai uscito dalla sala antica?", a: "No, mai. Sono arrivato alle due e sono rimasto al mio tavolo finché non è scoppiato il casino.", fact: "lorenzosays" },
            { id: "thesis", q: "Come va la tesi?", a: "Male. Ho perso la borsa di studio e a fine mese devo lasciare la stanza. Ma questo che c'entra?", fact: "broke" }
          ]
        },
        {
          id: "carla", name: "Carla Neri", role: "lettrice abituale",
          look: "Settant'anni, stringe la borsa al petto e guarda tutti di traverso. Porta scarpe di camoscio chiaro, asciutte e immacolate.",
          lookFact: "carladry",
          ask: [
            { id: "bag", q: "Perché stringe così la borsa?", a: "Arrossisce. «C'è un panino con la mortadella. Lo so che in biblioteca non si mangia... Non lo dica alla dottoressa.»", fact: "sandwich" },
            { id: "hall", q: "Andando in bagno ha notato qualcosa?", a: "La porta laterale era accostata, con qualcosa sotto per non farla chiudere. Fuori diluviava. Ho pensato: chi è quel matto che la lascia aperta con questo tempo?", fact: "dooropen" }
          ]
        },
        {
          id: "franco", name: "Franco Bonora", role: "barista, di fronte al cortile",
          look: "Grembiule, l'aria annoiata del sabato pomeriggio. Dal bancone del suo bar si vede tutto il cortile della biblioteca.",
          ask: [
            { id: "rain", q: "Che tempo ha fatto oggi pomeriggio?", a: "Sole fino alle tre e mezza. Alle 15:35 è venuto giù il diluvio, e va avanti ancora.", fact: "rain" },
            { id: "yard", q: "Ha visto qualcuno nel cortile?", a: "Verso le 15:40 un ragazzo è uscito dalla porta laterale con un ombrello verde. È andato alla Panda rossa in fondo al cortile, ha aperto il bagagliaio, ci ha messo dentro qualcosa ed è rientrato dalla stessa porta.", fact: "panda" }
          ]
        }
      ],
      facts: {
        lever: "La vetrina è stata forzata con il tagliacarte della sala.",
        wedge: "La porta laterale, che da fuori non si apre, è stata tenuta accostata con un cuneo di gomma, che è bagnato.",
        umbrella: "Nel corridoio ci sono orme bagnate tra la porta laterale e la sala antica, e un ombrello verde della Canottieri Ferrara che gocciola.",
        call: "Ines era al telefono con il Comune, nel suo ufficio al piano di sopra, dalle 15:28 alle 15:47.",
        loans: "Pietro ha registrato delle restituzioni al bancone alle 15:33, alle 15:39 e alle 15:46.",
        auction: "Nel cestino di Lorenzo c'è la stampa di un'asta con la stima del libro: 25.000-35.000 euro.",
        petition: "Ines ha firmato per prima una petizione contro il trasferimento dei libri antichi a Bologna.",
        car: "La Panda rossa nel cortile è di Lorenzo.",
        value: "La settimana scorsa Lorenzo ha chiesto a Ines quanto vale il libro.",
        seen: "Alle 15:30 il libro era nella vetrina e Lorenzo era al suo tavolo, in sala antica.",
        carlatime: "Carla si è alzata solo tre minuti, verso le 15:35, per andare in bagno.",
        pietrodry: "Pietro ha le scarpe asciutte e lucide.",
        wet: "Lorenzo, con la felpa della Canottieri Ferrara, ha le scarpe fradice e i jeans bagnati fino alle caviglie.",
        lorenzosays: "Lorenzo dice di essere arrivato alle due e di non essere mai uscito dalla sala antica.",
        broke: "Lorenzo ha perso la borsa di studio e a fine mese deve lasciare la stanza.",
        carladry: "Carla ha scarpe di camoscio chiaro, asciutte e immacolate.",
        sandwich: "Nella borsa Carla nasconde un panino.",
        dooropen: "Verso le 15:35 la porta laterale era già accostata, mentre fuori diluviava.",
        rain: "Fino alle 15:35 c'era il sole, poi è cominciato il diluvio.",
        panda: "Verso le 15:40 un ragazzo con un ombrello verde è uscito dalla porta laterale, ha messo qualcosa nel bagagliaio della Panda rossa ed è rientrato."
      },
      culprit: "lorenzo",
      keys: ["panda", "car", "wet", "rain", "lorenzosays", "umbrella", "wedge", "seen", "call", "carladry", "loans", "pietrodry"],
      need: 3,
      motives: ["Rivenderlo: aveva perso la borsa di studio e aveva cercato quanto vale", "Impedire che il libro finisse a Bologna", "Studiarlo a casa per la tesi"],
      motive: 0,
      traps: [
        { text: "Dire ad alta voce che domattina i carabinieri apriranno tutte le auto del cortile, e intanto tenere d'occhio la Panda rossa.", ok: true, why: "Le auto di Ines e di Pietro non nascondono niente, e loro lo sanno. Lorenzo sa che nel bagagliaio c'è il libro: alle otto di sera torna nel cortile per portarlo via, e lo fermano con il volume avvolto in una busta di plastica. Una buona trappola mette in allarme solo chi sa dov'è la refurtiva." },
        { text: "Accusare Ines: ha firmato per prima la petizione contro il trasferimento dei libri a Bologna.", ok: false, why: "Dalle 15:28 alle 15:47 era al telefono al piano di sopra, e intanto qualcuno portava il libro nel cortile. Una firma su una petizione non è un indizio." },
        { text: "Perquisire Carla: stringe la borsa come se nascondesse qualcosa.", ok: false, why: "Nascondeva un panino. E i carabinieri le borse le hanno già controllate tutte: il libro era già fuori dall'edificio." },
        { text: "Far giurare a Lorenzo che non è stato lui.", ok: false, why: "Un giuramento non prova niente, in nessuna direzione. Servono i fatti, e qui ci sono." }
      ],
      close: [
        "Il libro non era addosso a nessuno: o è nascosto qui dentro, o è uscito dall'edificio. La porta laterale si apre solo da dentro, ed era tenuta accostata con un cuneo bagnato: qualcuno è uscito nel cortile sotto il diluvio ed è rientrato. Il diluvio è cominciato alle 15:35, e alle 15:40 il barista vede un ragazzo con un ombrello verde mettere qualcosa nel bagagliaio della Panda rossa.",
        "La Panda è di Lorenzo, l'ombrello della Canottieri come la sua felpa. Lorenzo dice di essere arrivato alle due e di non essere mai uscito, ma alle due c'era il sole: le sue scarpe fradice raccontano un'altra storia. Il perché è nel cestino, con la stima d'asta del libro, e in una borsa di studio persa.",
        "Ines era al telefono al piano di sopra, Pietro registrava restituzioni al bancone, Carla aveva le scarpe di camoscio asciutte: nessuno di loro era uscito sotto la pioggia."
      ],
      lesson: "Prima di chiederti chi, chiediti come è uscito l'oggetto. E usa il tempo che fa come un orologio: chi è bagnato è uscito dopo che ha cominciato a piovere."
    },
    /* ---------------------------------------------------------------- 4 */
    {
      id: "watch", level: 2, title: "L'orologio del nonno", place: "Una villa nelle Langhe",
      brief: [
        "Domenica, cena di famiglia dai Ravera. A fine serata il nonno Ettore, 86 anni, scopre che il suo orologio d'oro non è più sulla scrivania dello studio. La finestra dello studio è aperta e sul davanzale c'è del fango.",
        "In casa c'erano i nonni, il figlio Alberto con la moglie Carla, il nipote Matteo e Ana, la badante. Tutti, senza dirlo, guardano Ana."
      ],
      budget: 15,
      scene: [
        { id: "desk", name: "La scrivania dello studio", text: "Il panno di velluto dove il nonno appoggia l'orologio è vuoto. Accanto c'è ancora la chiavetta per caricarlo." },
        { id: "window", name: "La finestra dello studio", text: "Aperta, con del fango sul davanzale. Ma il fango è solo sul lato interno, e nell'aiuola sotto la finestra, fradicia di pioggia, non c'è nemmeno un'impronta.", fact: "window" },
        { id: "ficus", name: "Il vaso del ficus", text: "Nell'angolo dello studio. Nella terra, vicino al bordo, c'è un buco recente grande come tre dita: la stessa terra scura che c'è sul davanzale.", fact: "ficus" },
        { id: "map", name: "La pianta della casa", text: "Lo studio dà sul corridoio d'ingresso, come il bagno e la porta di casa. La cucina è dalla parte opposta: per andare dalla cucina allo studio si attraversa per forza la sala da pranzo, davanti alla tavola.", fact: "map" },
        { id: "porch", name: "Il portico d'ingresso", text: "Un mozzicone di sigaretta fresco, schiacciato in fretta, e la carta di una gomma da masticare alla menta.", fact: "smoke" },
        { id: "coat", name: "Il cappotto di Alberto, all'ingresso", text: "Dalla tasca spunta una lettera della banca. Si legge l'oggetto: «Sollecito di pagamento. Ultimo avviso».", fact: "bank" }
      ],
      people: [
        {
          id: "ettore", name: "Ettore Ravera", role: "il nonno",
          look: "Ottantasei anni e lucidissimo. Mentre parla si tocca il polso vuoto.",
          ask: [
            { id: "last", q: "Quando ha visto l'orologio per l'ultima volta?", a: "Alle otto e un quarto. Lo carico ogni sera prima di cena e lo lascio sulla scrivania. Quando sono arrivato a tavola erano già tutti seduti.", fact: "wound" },
            { id: "who", q: "Chi sapeva che lo lascia lì?", a: "Tutti, in famiglia. È l'orologio che ho promesso ad Alberto: un giorno sarà suo.", fact: "promised" }
          ]
        },
        {
          id: "lidia", name: "Lidia Ravera", role: "la nonna",
          look: "Occhiali sulla punta del naso. È il tipo di persona che nota tutto e non dice niente finché non glielo chiedi.",
          ask: [
            { id: "study", q: "Durante la cena è entrata nello studio?", a: "Sì, alle nove meno cinque, con Carla, a prendere l'album delle foto. L'orologio non c'era già più: abbiamo pensato che Ettore l'avesse messo via.", fact: "lidia" },
            { id: "table", q: "Chi si è alzato da tavola prima di quell'ora?", a: "Solo Alberto, verso le nove meno venticinque, per una telefonata di lavoro. È tornato dopo una decina di minuti. Io e Carla ci siamo alzate alle nove meno cinque, Matteo più tardi. Ana andava e veniva con i piatti, ma sempre dalla porta della cucina, davanti a noi.", fact: "onlyalberto" }
          ]
        },
        {
          id: "alberto", name: "Alberto Ravera", role: "il figlio",
          look: "Camicia buona, ma polsini consumati. Sul polso sinistro una striscia di pelle più chiara: di solito porta un orologio, stasera no.",
          lookFact: "tan",
          ask: [
            { id: "call", q: "Con chi era al telefono quando si è alzato da tavola?", a: "«Con un fornitore del ristorante. Guardi pure.» Ti porge il telefono: l'ultima chiamata, in entrata o in uscita, è delle 18:50.", fact: "nocall" },
            { id: "rest", q: "Come va il ristorante?", a: "Benissimo. Mai andato così bene.", fact: "albfine" }
          ]
        },
        {
          id: "carla", name: "Carla Ravera", role: "la nuora",
          look: "Mani arrossate dal forno e un cerotto sull'indice: l'arrosto l'ha cucinato lei, con Ana.",
          ask: [
            { id: "before", q: "Dov'era prima di cena?", a: "In cucina con Ana dalle sette, a finire l'arrosto. Non ci siamo mai separate fino a quando ci siamo sedute.", fact: "carlaana" },
            { id: "money", q: "Come vanno davvero le cose al ristorante?", a: "Esita. «Non bene. Abbiamo chiesto un prestito e non sappiamo come restituirlo. Ma Alberto non ruberebbe mai a suo padre.»", fact: "debt" }
          ]
        },
        {
          id: "matteo", name: "Matteo Ravera", role: "il nipote, 19 anni",
          look: "Mastica una gomma alla menta, ma sotto si sente l'odore di fumo. Prima di rispondere guarda i genitori.",
          lookFact: "matsmell",
          ask: [
            { id: "why", q: "Perché ti sei alzato da tavola durante la cena?", a: "Verso le nove e venti, per andare in bagno.", fact: "matsays" },
            { id: "smoke", q: "A bassa voce: sei uscito a fumare, vero? Ai tuoi non lo dico.", a: "...Sì. Cinque minuti sotto il portico. Non ditelo a mio padre, per favore.", fact: "matsmoke" }
          ]
        },
        {
          id: "ana", name: "Ana Petrescu", role: "badante",
          look: "Ha ancora il grembiule. Parla piano, a frasi corte: ha capito che tutti la guardano.",
          ask: [
            { id: "dinner", q: "Durante la cena è uscita dalla cucina, a parte per servire?", a: "No. Portavo i piatti e tornavo in cucina. Per andare di là avrei dovuto passare davanti a tutti.", fact: "ana" }
          ]
        }
      ],
      facts: {
        window: "Il fango è solo sul lato interno del davanzale e nell'aiuola bagnata non ci sono impronte: nessuno è entrato dalla finestra.",
        ficus: "Il fango del davanzale viene dal vaso del ficus dello studio: è una messinscena.",
        map: "Dalla cucina allo studio si passa per forza davanti alla tavola; dal corridoio d'ingresso no.",
        smoke: "Sotto il portico qualcuno ha fumato di nascosto durante la cena.",
        bank: "Alberto ha in tasca un ultimo sollecito di pagamento della banca.",
        wound: "Alle 20:15 l'orologio era sulla scrivania; poi il nonno è venuto a tavola, dove erano già tutti seduti.",
        promised: "L'orologio era promesso in eredità ad Alberto.",
        lidia: "Alle 20:55, quando Lidia e Carla entrano nello studio, l'orologio non c'è più.",
        onlyalberto: "Prima delle 20:55 si è alzato da tavola solo Alberto, verso le 20:35, per una telefonata; Ana è sempre passata dalla porta della cucina.",
        tan: "Alberto di solito porta un orologio, ma stasera non ce l'ha.",
        nocall: "Sul telefono di Alberto non c'è nessuna chiamata dopo le 18:50.",
        albfine: "Alberto dice che il ristorante va benissimo.",
        carlaana: "Prima di cena Carla e Ana erano insieme in cucina.",
        debt: "Il ristorante di Alberto è in difficoltà: c'è un prestito che non riescono a restituire.",
        matsmell: "Matteo sa di fumo coperto dalla menta.",
        matsays: "Matteo dice di essersi alzato alle 21:20 per andare in bagno.",
        matsmoke: "Alle 21:20 Matteo è uscito a fumare di nascosto: per questo ha mentito.",
        ana: "Ana dice di essersi mossa solo tra la cucina e la sala."
      },
      culprit: "alberto",
      keys: ["lidia", "onlyalberto", "nocall", "map", "wound", "ficus", "window"],
      need: 4,
      motives: ["I debiti del ristorante", "La gelosia verso il nipote", "Il rancore verso il padre"],
      motive: 0,
      traps: [
        { text: "Annunciare a tutti che l'orologio è stato ritrovato in giardino, sotto la finestra, e poi guardare chi esce a controllare il proprio nascondiglio.", ok: true, why: "Chi non c'entra si rallegra e basta. Il colpevole invece sa dove l'ha messo, e la notizia non torna: deve controllare. Dieci minuti dopo Alberto va alla sua macchina e apre il vano portaoggetti. L'orologio è lì." },
        { text: "Perquisire la stanza di Ana.", ok: false, why: "Non c'è un solo fatto contro di lei: dalla cucina non poteva arrivare allo studio senza passare davanti a tutti. Era il sospetto di tutti solo per pregiudizio." },
        { text: "Mettere Matteo alle strette: ha mentito sul bagno.", ok: false, why: "Matteo ha mentito, ma per una sigaretta, e dopo le 20:55, quando l'orologio era già sparito. Chi mente non è per forza il colpevole." },
        { text: "Aspettare che l'orologio compaia in vendita su internet.", ok: false, why: "Potrebbe non comparire mai, o comparire tra mesi, lontano da qui." }
      ],
      close: [
        "Prima di tutto la finestra: fango solo all'interno, nessuna impronta nell'aiuola bagnata, terra presa dal ficus dello studio. Nessun ladro da fuori: l'ha preso qualcuno della casa e ha voluto farlo sembrare un furto.",
        "Poi la finestra di tempo. L'orologio c'era alle 20:15 ed era sparito alle 20:55, quando Lidia e Carla entrano nello studio. In quei quaranta minuti si è alzato da tavola solo Alberto, per una telefonata che sul suo telefono non esiste. Ana non poteva arrivare allo studio senza passare davanti a tutti.",
        "Il sollecito della banca, il prestito di cui parla Carla e il «va benissimo» di Alberto dicono il perché. Matteo? Nascondeva una sigaretta, non un orologio."
      ],
      lesson: "Il primo indizio da togliere dal tavolo è il pregiudizio. E chi mente non è per forza colpevole: Matteo nascondeva solo una sigaretta."
    },

    /* ---------------------------------------------------------------- 5 */
    {
      id: "chef", level: 2, title: "Il critico a cena", place: "Ristorante Da Irene, Trieste",
      brief: [
        "Venerdì sera, al tavolo 7, c'era sotto falso nome il critico gastronomico più temuto della città. Al dessert ha assaggiato la crème brûlée, l'ha sputata nel tovagliolo e se n'è andato senza pagare: era piena di sale.",
        "Le altre undici crème brûlée della serata erano perfette. Irene, la titolare, è sicura che qualcuno l'abbia sabotata."
      ],
      budget: 14,
      scene: [
        { id: "dessert", name: "La crème brûlée del tavolo 7", text: "La crosta di zucchero è caramellata alla perfezione, intatta a parte il colpo del cucchiaino. Vicino al bordo c'è un forellino sottile che attraversa la crosta e scende nella crema.", fact: "hole" },
        { id: "trash", name: "Il cestino vicino al passe", text: "Sotto i tovaglioli usati c'è una siringa d'acciaio con un ago lungo e appuntito. Dentro, qualche goccia d'acqua che sa di sale.", fact: "syringe" },
        { id: "pastry", name: "La postazione della pasticceria", text: "Le quattro siringhe da pasticceria di Lea sono al loro posto, pulite. Hanno la punta larga, per farcire: non bucherebbero mai una crosta di zucchero.", fact: "leatools" },
        { id: "meat", name: "La postazione della carne", text: "È la postazione di Tommaso. Nella valigetta dei suoi attrezzi c'è la custodia degli iniettori per marinare la carne: tre posti, due iniettori. Manca il più grande.", fact: "meat" },
        { id: "tickets", name: "Le comande della serata", text: "Dessert del tavolo 7: pronto alle 22:10, ritirato dal cameriere alle 22:14. Per quattro minuti è rimasto sul passe, il bancone tra cucina e sala.", fact: "window" },
        { id: "board", name: "La lavagna del briefing", text: "In cucina, scritto col gesso: «T7 = critico. Tutto perfetto!». Dalla sala non si vede.", fact: "board" }
      ],
      people: [
        {
          id: "irene", name: "Irene Furlan", role: "titolare e chef",
          look: "Giacca da chef senza una macchia, voce rotta. Tiene in mano il conto del tavolo 7, mai pagato.",
          ask: [
            { id: "knew", q: "Chi sapeva del critico?", a: "La brigata: l'ho scritto sulla lavagna al briefing delle sei. In sala, solo Ivo.", fact: "board" },
            { id: "grudge", q: "Qualcuno in cucina ce l'ha con lei?", a: "Tommaso, il mio secondo. A settembre ho dato il posto di capo cucina a un altro e lui ha sbattuto la porta. Ma è rimasto.", fact: "grudge" }
          ]
        },
        {
          id: "lea", name: "Lea Zorzi", role: "pasticciera",
          look: "Occhi gonfi, mani che tremano. Continua a ripetere «era perfetta, era perfetta».",
          lookFact: "leaupset",
          ask: [
            { id: "plate", q: "Che cosa è successo alle 22:10?", a: "Ho caramellato la crosta, ho messo il piatto sul passe e ho suonato il campanello. Poi mi sono girata a fare i semifreddi del tavolo 3, di spalle. Mi sono voltata solo quando è arrivato Ivo: gli ho detto «vai piano, è il critico», e lui l'ha preso e l'ha portato via subito. Lì vicino c'era anche Tommaso, con un grissino in mano.", fact: "leaback" }
          ]
        },
        {
          id: "ivo", name: "Ivo Rakar", role: "cameriere",
          look: "Giovane, svelto, un po' sbadato: una macchia di vino sul polsino.",
          ask: [
            { id: "late", q: "Perché hai ritirato il dessert solo alle 22:14?", a: "Ero al tavolo 4, il signor Fausto voleva sapere tutto sui vini. Quando sono tornato al passe c'era Tommaso lì davanti con un grissino in mano: ha detto che si stava «rubando la cena». Lea era girata sui semifreddi.", fact: "ivosaw" },
            { id: "fausto", q: "Chi è il signor Fausto?", a: "Ha un ristorante in via Cavana. Viene ogni tanto, si guarda intorno.", fact: "fausto" }
          ]
        },
        {
          id: "tommaso", name: "Tommaso Bressan", role: "secondo chef",
          look: "Avambracci pieni di piccole bruciature da griglia. Il telefono gli vibra in tasca: lo guarda e lo rimette via in fretta.",
          ask: [
            { id: "where", q: "Dov'eri quando il dessert del 7 era sul passe?", a: "Alla griglia, a pulirla. Non mi sono mosso da lì.", fact: "tomsays" },
            { id: "fausto", q: "Conosci Fausto, quello del tavolo 4?", a: "Di vista. In città lo conoscono tutti.", fact: "tomfausto" }
          ]
        },
        {
          id: "fausto", name: "Fausto Marin", role: "ristoratore concorrente, al tavolo 4",
          look: "Abito costoso, sorriso tranquillo. Ha finito il dolce e chiede il conto come se niente fosse.",
          ask: [
            { id: "job", q: "Ha mai offerto lavoro a qualcuno di questa cucina?", a: "Offro lavoro ai bravi, è il mio mestiere. A Tommaso, per esempio: comincia da me il primo del mese. Non è un segreto.", fact: "offer" },
            { id: "up", q: "Si è alzato da tavola durante la cena?", a: "Una volta, per il bagno, verso le dieci e mezza. È dall'altra parte della sala, lontano dalla cucina.", fact: "faustoout" }
          ]
        }
      ],
      facts: {
        hole: "Il sale è stato iniettato sotto la crosta già caramellata, a dessert pronto.",
        syringe: "Nel cestino vicino al passe c'è una siringa con dentro acqua salata.",
        leatools: "Le siringhe di Lea ci sono tutte e hanno la punta larga: non è una delle sue.",
        meat: "Dalla valigetta di Tommaso manca l'iniettore più grande: è quello del cestino.",
        window: "Il dessert del 7 è rimasto sul passe dalle 22:10 alle 22:14.",
        board: "Che al 7 ci fosse il critico lo sapeva solo la cucina (e Ivo).",
        grudge: "A settembre Tommaso non ha avuto la promozione a capo cucina.",
        leaupset: "Lea è sconvolta.",
        leaback: "Dalle 22:10 Lea lavorava di spalle al passe; alle 22:14 ha visto Ivo prendere il piatto e portarlo via subito.",
        ivosaw: "Alle 22:14 Ivo ha trovato Tommaso davanti al passe, mentre Lea era girata.",
        fausto: "Al tavolo 4 cenava Fausto, che ha un ristorante concorrente.",
        tomsays: "Tommaso dice di non essersi mosso dalla griglia tra le 22:10 e le 22:14.",
        tomfausto: "Tommaso dice di conoscere Fausto solo di vista.",
        offer: "Fausto ha assunto Tommaso: comincia da lui il primo del mese.",
        faustoout: "Fausto si è alzato solo alle 22:30, per il bagno, lontano dalla cucina."
      },
      culprit: "tommaso",
      keys: ["hole", "meat", "ivosaw", "tomsays", "window", "syringe", "leatools", "leaback"],
      need: 4,
      motives: ["Il nuovo posto da Fausto: una stroncatura del ristorante di Irene faceva comodo al suo nuovo capo", "Vendicarsi di Lea", "Un errore: voleva salare la carne"],
      motive: 0,
      traps: [
        { text: "Chiudere l'iniettore in una busta nell'ufficio di Irene, dire in cucina che domattina andrà al laboratorio, e restare nascosti a guardare la porta dell'ufficio.", ok: true, why: "Le impronte di Tommaso sul manico sarebbero normali: è un suo attrezzo. Ma per riempirlo d'acqua salata ha dovuto svitare il tappo e tirare lo stantuffo, parti che si toccano solo per riempirlo e che dopo il servizio si lavano. Non può sapere che cosa ci ha lasciato sopra: a mezzanotte entra in ufficio a cercare la busta." },
        { text: "Licenziare Lea: il dessert era suo.", ok: false, why: "Le sue siringhe non bucano la crosta, e dopo le 22:10 lavorava di spalle. Punirla vorrebbe dire lasciare in cucina chi l'ha fatto." },
        { text: "Accusare Fausto davanti a tutti.", ok: false, why: "Fausto non è mai entrato in cucina. Ha un motivo, ma senza prove un'accusa pubblica espone Irene a una denuncia per diffamazione." },
        { text: "Assaggiare tutti i dessert rimasti.", ok: false, why: "Erano perfetti: dicono che il sabotaggio era mirato, ma non chi l'ha fatto." }
      ],
      close: [
        "La crosta intatta e il forellino dicono come: il sale è stato iniettato dopo, quando il dessert era già pronto. Quindi nei quattro minuti in cui è rimasto sul passe, dalle 22:10 alle 22:14, mentre Lea lavorava di spalle e Ivo era al tavolo di Fausto.",
        "Lo strumento dice da dove: non una siringa da pasticceria, ma l'iniettore per le marinate che manca dalla valigetta di Tommaso. E alle 22:14 Ivo trova Tommaso proprio davanti al passe, mentre lui giura di non essersi mosso dalla griglia.",
        "Il perché lo dice Fausto senza volerlo: Tommaso comincia da lui il primo del mese, e una stroncatura del ristorante di Irene fa comodo al nuovo capo. Il «lo conosco di vista» di Tommaso era una bugia."
      ],
      lesson: "Chiediti come prima di chiederti chi: il forellino nella crosta stringe il tempo a quattro minuti e lo strumento giusto indica la postazione."
    },

    /* ---------------------------------------------------------------- 6 */
    {
      id: "truffle", level: 2, title: "Il cane che non abbaiò", place: "Una cascina ad Acqualagna, Marche",
      brief: [
        "Sabato all'alba Aldo Bartolucci, cavatore di tartufi da cinquant'anni, apre il frigo della cantina e lo trova vuoto: manca il tartufo bianco di 850 grammi trovato mercoledì, che domenica avrebbe venduto alla fiera di Acqualagna per più di quattromila euro.",
        "In cascina vivono Aldo e il nipote Fabio; nella dependance dorme Mirko, un operaio stagionale. Davanti alla cantina, libera nel cortile, dorme Brina, la lagotta di Aldo, che abbaia a chiunque non sia di casa."
      ],
      budget: 15,
      scene: [
        { id: "fridge", name: "Il frigo dei tartufi", text: "Il lucchetto a combinazione è aperto e intatto: nessuno l'ha forzato. Sullo sportello, il foglio dove Aldo segna i controlli: «Ven. 22:00, tartufo bianco 850 g, a posto».", fact: "lock" },
        { id: "glove", name: "Il pavimento della cantina", text: "Davanti al frigo c'è un guanto da lavoro con le iniziali «M.B.» scritte a pennarello.", fact: "glove" },
        { id: "yard", name: "Il cortile e la cuccia di Brina", text: "La cuccia è accanto alla porta della cantina. Chi vuole entrare in cantina, da qualunque parte arrivi, deve passare a un metro da Brina.", fact: "kennel" },
        { id: "boots", name: "Gli stivali all'ingresso di casa", text: "Due paia. Quelli di Fabio sono coperti di fango fresco, ancora umido. Quelli di Aldo sono puliti e asciutti.", fact: "boots" },
        { id: "gauge", name: "La stazione meteo di Aldo", text: "Non pioveva da due settimane. Stanotte ha piovuto da mezzanotte all'una e mezza, poi più niente.", fact: "rain" },
        { id: "room", name: "La camera di Fabio", text: "Sulla scrivania, il modulo d'iscrizione a una scuola di cucina di Torino, già compilato: 3.900 euro in tutto, con un anticipo di 2.000 euro da versare entro lunedì.", fact: "school" }
      ],
      people: [
        {
          id: "aldo", name: "Aldo Bartolucci", role: "cavatore, il derubato",
          look: "Mani nodose, giacca di velluto, la voce che trema di rabbia. Ripete: «Quattro giorni di bosco, buttati.»",
          ask: [
            { id: "combo", q: "Chi conosce la combinazione del frigo?", a: "Io e Fabio. E Mirko, da venerdì: gli ho chiesto di tirare fuori il tartufo per farlo vedere al commerciante.", fact: "combo" },
            { id: "brina", q: "Brina con chi abbaia?", a: "Con tutti quelli che non sono di casa. Con me e con Fabio sta zitta, ci è cresciuta in braccio. Con Mirko abbaia ancora: lui ha paura dei cani e lei lo sente. Con Gianni, il vicino, poi diventa matta.", fact: "barks" },
            { id: "fabio", q: "Come vanno le cose con Fabio?", a: "Vuole andare a Torino a fare il cuoco. Gli ho detto che finché ci sono io i soldi li tengo io, e che il bosco non si lascia.", fact: "quarrel" }
          ]
        },
        {
          id: "fabio", name: "Fabio Bartolucci", role: "il nipote",
          look: "Ventitré anni, unghie corte e mani pulitissime, da cuoco. Si offre subito di andare a cercare nel bosco, «perché magari è stata una volpe».",
          lookFact: "fox",
          ask: [
            { id: "night", q: "Che cosa hai fatto stanotte?", a: "Ho dormito. Non sono uscito di casa da dopo cena, verso le nove.", fact: "fabiosays" },
            { id: "who", q: "Secondo te chi può essere stato?", a: "Il commerciante, Testa: ha offerto una miseria e se n'è andato arrabbiato. Oppure Gianni, che ce l'ha con lo zio da anni. Oppure... non so, Mirko è qui da poco.", fact: "fabiopoints" }
          ]
        },
        {
          id: "mirko", name: "Mirko Baldelli", role: "operaio stagionale",
          look: "Trentun anni, qui per la raccolta delle olive. Resta lontano dalla cuccia e guarda Brina di sbieco: ha paura dei cani.",
          lookFact: "afraid",
          ask: [
            { id: "night", q: "Dov'eri stanotte?", a: "Al bar del paese fino alle undici, poi in bicicletta fino a qui. Brina mi ha abbaiato come sempre, mi sono chiuso nella dependance e ho dormito.", fact: "mirkosays" },
            { id: "gloves", q: "Dove tieni i guanti da lavoro?", a: "Sulla panca dell'ingresso di casa, con le cesoie: il signor Aldo vuole gli attrezzi tutti lì. Ieri alle sei li ho lasciati lì tutti e due, come sempre.", fact: "bench" }
          ]
        },
        {
          id: "gianni", name: "Gianni Pierini", role: "vicino, cavatore anche lui",
          look: "Il cane al guinzaglio, stivali infangati fino al ginocchio, un sorriso storto: si gode la scena.",
          lookFact: "gianniboots",
          ask: [
            { id: "night", q: "Dov'era stanotte?", a: "A cercare, dall'una alle quattro, dalle parti di Cagli. I posti buoni non glieli dico.", fact: "giannisays" },
            { id: "threat", q: "È vero che ha minacciato Aldo?", a: "Al bar gli ho detto che gliela facevo pagare, per il bosco delle querce. Parole. Comunque quel cane mi abbaia anche quando passo in macchina.", fact: "threat" }
          ]
        },
        {
          id: "pina", name: "Pina Rossi", role: "vicina",
          look: "Ottant'anni. La finestra della sua cucina guarda dritta sul cortile dei Bartolucci. Dorme poco e sente tutto.",
          ask: [
            { id: "dog", q: "Stanotte ha sentito Brina?", a: "Verso le undici e dieci ha abbaiato come una matta: era l'operaio che rientrava in bicicletta. Poi silenzio fino a mattina. Neanche un guaito.", fact: "silent" },
            { id: "light", q: "Ha visto qualcosa nel cortile?", a: "Verso le tre meno un quarto, una torcia che andava dalla porta di casa alla cantina, e dopo dieci minuti tornava indietro. Dalla casa, eh: non dalla strada e non dalla dependance.", fact: "torch" }
          ]
        },
        {
          id: "testa", name: "Marco Testa", role: "commerciante di tartufi",
          look: "Giaccone impermeabile di marca, telefono sempre in mano. Venerdì Brina gli si è lanciata contro e lui non è sceso dalla macchina finché Aldo non l'ha chiusa.",
          lookFact: "testabark",
          ask: [
            { id: "offer", q: "Com'è andata venerdì?", a: "Ho offerto tremila euro, Aldo ne voleva il doppio. Non ci siamo messi d'accordo: normale trattativa.", fact: "offer" },
            { id: "call", q: "Qualcuno le ha offerto un tartufo grosso, stamattina?", a: "Sì, alle sette. Un numero che non conosco, una voce giovane: «Bianco, più di ottocento grammi, duemila euro, consegna oggi.» Ho detto che ci pensavo.", fact: "call" }
          ]
        }
      ],
      facts: {
        lock: "Il lucchetto del frigo è stato aperto con la combinazione, non forzato; venerdì alle 22 il tartufo era ancora lì.",
        glove: "Davanti al frigo c'è un guanto da lavoro con le iniziali di Mirko.",
        kennel: "Per arrivare alla cantina bisogna passare a un metro dalla cuccia di Brina.",
        boots: "Gli stivali di Fabio sono coperti di fango fresco; quelli di Aldo sono puliti.",
        rain: "Non pioveva da due settimane: stanotte ha piovuto solo da mezzanotte all'una e mezza.",
        school: "Fabio deve versare entro lunedì un anticipo di 2.000 euro per iscriversi a una scuola di cucina.",
        combo: "La combinazione la conoscono Aldo, Fabio e, da venerdì, Mirko.",
        barks: "Brina sta zitta solo con Aldo e Fabio; a Mirko e a Gianni abbaia sempre.",
        quarrel: "Aldo non vuole dare a Fabio i soldi per andare a Torino.",
        fox: "Fabio insiste che può essere stata una volpe.",
        fabiosays: "Fabio dice di non essere uscito di casa dalle nove di sera.",
        fabiopoints: "Fabio indica come sospetti il commerciante, Gianni e Mirko.",
        afraid: "Mirko ha paura dei cani.",
        mirkosays: "Mirko dice di essere rientrato alle undici, con Brina che abbaiava, e di aver dormito nella dependance.",
        bench: "Mirko lascia i guanti sulla panca dell'ingresso, dentro casa: ieri li ha lasciati lì tutti e due.",
        gianniboots: "Anche Gianni ha gli stivali infangati.",
        giannisays: "Gianni dice di essere stato a cercare tartufi dall'una alle quattro.",
        threat: "Gianni ha minacciato Aldo al bar per una lite su un bosco.",
        silent: "Brina ha abbaiato solo alle 23:10, quando è rientrato Mirko; poi silenzio fino a mattina.",
        torch: "Verso le 2:45 una torcia è andata dalla porta di casa alla cantina ed è tornata dieci minuti dopo.",
        testabark: "Venerdì Brina si è lanciata contro il commerciante, che non è sceso dalla macchina.",
        offer: "Venerdì il commerciante ha offerto tremila euro e Aldo ha rifiutato.",
        call: "Alle sette una voce giovane, da un numero sconosciuto, ha offerto al commerciante un tartufo bianco di più di 800 grammi per duemila euro."
      },
      culprit: "fabio",
      keys: ["silent", "barks", "kennel", "torch", "boots", "rain", "fabiosays", "bench", "lock", "combo", "testabark"],
      need: 4,
      motives: ["L'anticipo per la scuola di cucina, da versare entro lunedì", "La lite per il bosco delle querce", "Un debito con il commerciante"],
      motive: 0,
      traps: [
        { text: "Far richiamare dal commerciante il numero di stamattina: accetta i duemila euro, appuntamento a mezzogiorno nel parcheggio della fiera. Poi aspettare lì.", ok: true, why: "Solo chi ha il tartufo può presentarsi a venderlo. A mezzogiorno arriva Fabio, con il tartufo avvolto in un canovaccio nello zaino. Non serve una confessione, se il colpevole viene da solo a portarti la prova." },
        { text: "Mandare via Mirko: il guanto davanti al frigo è suo.", ok: false, why: "Il guanto stava sulla panca, dentro casa: chi l'ha lasciato davanti al frigo voleva farti guardare Mirko. E Brina, che con lui abbaia sempre, alle 2:45 è rimasta zitta." },
        { text: "Accusare Gianni: ha minacciato Aldo e ha gli stivali sporchi.", ok: false, why: "Un cavatore che ha cercato tartufi di notte ha sempre gli stivali sporchi. E Brina gli abbaia anche quando passa in macchina: stanotte non ha fiatato." },
        { text: "Portare Brina davanti ai sospettati e vedere da chi va.", ok: false, why: "Brina è un cane da tartufo, non da pista: andrebbe dalle persone che conosce, cioè Aldo e Fabio, e non per quello che hanno fatto stanotte. Non prova niente." }
      ],
      close: [
        "Il fatto più importante di questo caso è una cosa che non è successa: Brina, che abbaia a chiunque non sia di casa, alle 2:45 non ha abbaiato. Pina l'ha sentita una volta sola, alle 23:10, per Mirko. E chi va in cantina deve passarle a un metro. Quindi stanotte in cantina è entrato qualcuno di casa, Aldo o Fabio; e la torcia, dice Pina, partiva proprio dalla porta di casa.",
        "Aldo ha gli stivali puliti. Quelli di Fabio sono coperti di fango fresco, ma non pioveva da due settimane e stanotte ha piovuto solo da mezzanotte all'una e mezza: il fango è di stanotte, e Fabio giura di non essere uscito dalle nove. Conosceva la combinazione, e il guanto di Mirko l'ha preso dalla panca dell'ingresso per lasciare una pista falsa.",
        "Il perché è sulla sua scrivania: un anticipo di 2.000 euro da versare entro lunedì, proprio la cifra chiesta al telefono, e uno zio che non voleva dargli niente. Chi ruba in casa, spesso, prepara un colpevole di fuori."
      ],
      lesson: "Conta anche quello che non succede. È il «curioso episodio del cane» di Conan Doyle, in Silver Blaze: se il cane non abbaia, il ladro era di casa."
    },
    /* ---------------------------------------------------------------- 7 */
    {
      id: "letter", level: 2, title: "La lettera anonima", place: "Officine Bassi, Brescia",
      brief: [
        "Venerdì mattina l'ingegner Bassi trova sulla scrivania una busta senza nome. Dentro c'è una lettera stampata che comincia così: «Laura Ferrero, la contabile, gonfia un pò le fatture e si tiene la differenza. Guardi la 418.» Con la lettera, la fotocopia della fattura 418: 41.800 euro, con la sigla di Laura.",
        "Bassi ha sospeso Laura il giorno stesso. Lei giura che è un falso e ti chiede di scoprire chi ha scritto la lettera."
      ],
      budget: 14,
      scene: [
        { id: "letter", name: "La lettera", text: "Stampata, senza firma, una pagina. Due errori saltano all'occhio: «un pò» con l'accento e «qual'è» con l'apostrofo. Lungo il margine sinistro corre una sottile riga grigia.", fact: "errors" },
        { id: "copy", name: "La fotocopia della fattura", text: "In alto a destra si vede il timbro «Merce ricevuta» del magazzino: la fotocopia è stata fatta dalla copia che sta nei fascicoli del magazzino, non da quella dell'amministrazione.", fact: "stamp" },
        { id: "printer", name: "La stampante del primo piano", text: "È l'unica stampante dell'azienda. Giovedì alle 18, dopo un inceppamento, il tamburo si è rigato: da allora ogni foglio esce con una sottile riga grigia sul margine sinistro. Da giovedì alle 18 a venerdì alle 9 il registro segna una sola stampa: venerdì alle 7:12, una pagina, dall'account «ospite», quello che chiunque può usare dai computer comuni.", fact: "print" },
        { id: "badges", name: "Il registro dei badge", text: "Venerdì: Rosa delle pulizie e il custode dalle 6:00, Sergio Tonoli dalle 6:58, Paola Rinaldi alle 7:40, Laura Ferrero alle 8:10, l'ingegner Bassi alle 9:00. Prima delle 7:30 non è entrato nessun altro.", fact: "badges" },
        { id: "board", name: "La lavagna del magazzino", text: "Gli avvisi della settimana, firmati «S.T.»: «Consegne un pò in ritardo», «Chi sa qual'è il problema col corriere?».", fact: "board" },
        { id: "camera", name: "La telecamera della portineria", text: "Dalle 7:00 alle 7:25 riprende Rosa e il custode che prendono il caffè in portineria, senza mai allontanarsi.", fact: "camera" }
      ],
      people: [
        {
          id: "bassi", name: "Carlo Bassi", role: "titolare",
          look: "Sessant'anni, camicia stirata, imbarazzato: ha sospeso Laura senza nemmeno sentirla.",
          ask: [
            { id: "desk", q: "Dove ha trovato la lettera?", a: "Sulla scrivania, venerdì alle nove. Il mio ufficio è al primo piano e la porta resta sempre aperta: chiunque può entrare.", fact: "desk" },
            { id: "audit", q: "Laura le aveva segnalato qualcosa, prima?", a: "Sì... martedì mi ha scritto che le bolle del magazzino non tornavano con le fatture, e chiedeva un controllo. Mercoledì ho chiesto a Sergio di prepararmi tutte le bolle dell'anno. Venerdì è arrivata la lettera, e ho pensato che Laura avesse provato a coprirsi.", fact: "audit" }
          ]
        },
        {
          id: "laura", name: "Laura Ferrero", role: "contabile, sospesa",
          look: "Quarantadue anni, occhi rossi ma voce ferma. Ha portato una cartellina con le copie di tutte le sue fatture.",
          ask: [
            { id: "invoice", q: "La fattura 418 com'è davvero?", a: "Quattromilacentottanta euro, non quarantunmilaottocento. L'originale è in archivio. E la sigla sulla fotocopia è ricalcata: io la F la faccio diversa, guardi.", fact: "forged" },
            { id: "paola", q: "Come va con Paola?", a: "Male. Lunedì dovevano nominare me responsabile dell'amministrazione e lei ci sperava. Abbiamo litigato forte, davanti a tutti.", fact: "rivalry" }
          ]
        },
        {
          id: "paola", name: "Paola Rinaldi", role: "collega dell'amministrazione",
          look: "Tailleur, sguardo di sfida. Non fa niente per nascondere che è contenta.",
          lookFact: "paolahappy",
          ask: [
            { id: "time", q: "Venerdì a che ora è arrivata?", a: "Alle 7:40, come sempre. C'è il badge.", fact: "paolatime" },
            { id: "laura", q: "Crede che Laura abbia rubato?", a: "Credo che chi tiene i conti abbia tante occasioni. Ma la lettera non l'ho scritta io: se ho qualcosa da dire a qualcuno, glielo dico in faccia. E con Laura l'ho fatto.", fact: "paolafrank" }
          ]
        },
        {
          id: "sergio", name: "Sergio Tonoli", role: "capo magazzino",
          look: "Giubbotto da lavoro sopra una camicia di marca, un orologio d'oro al polso. È l'unico che chiede subito come sta Laura.",
          lookFact: "watch",
          ask: [
            { id: "friday", q: "Venerdì mattina dov'era?", a: "In magazzino dalle sette. Al primo piano non sono mai salito: lì io non ho niente da fare.", fact: "sergiosays" },
            { id: "notes", q: "Ha preparato le bolle per l'ingegnere?", a: "Ci sto lavorando, sono tante, ci vuole tempo. Comunque, se c'è qualcosa che non va, io guarderei in amministrazione, non da me.", fact: "sergiopoints" }
          ]
        },
        {
          id: "rosa", name: "Rosa Pellegrini", role: "pulizie",
          look: "Sessant'anni, il carrello delle pulizie sempre dietro. Conosce l'azienda meglio di chiunque.",
          ask: [
            { id: "coffee", q: "Venerdì verso le sette dov'era?", a: "In portineria con il custode, a prendere il caffè, fino alle sette e venticinque circa. È la nostra pausa, tutte le mattine.", fact: "rosacoffee" },
            { id: "stairs", q: "A quell'ora ha visto qualcuno?", a: "Sì: verso le sette e un quarto è sceso dalle scale del primo piano Sergio, del magazzino. Mi ha detto «ciao Rosa» senza fermarsi, di fretta. Dalla portineria le scale si vedono bene.", fact: "stairs" }
          ]
        }
      ],
      facts: {
        errors: "La lettera anonima ha due errori, «un pò» con l'accento e «qual'è» con l'apostrofo, e una sottile riga grigia sul margine sinistro.",
        stamp: "La fotocopia della fattura ha il timbro «Merce ricevuta»: viene dai fascicoli del magazzino.",
        print: "Dall'inceppamento di giovedì alle 18 l'unica stampante dell'azienda lascia una riga grigia su ogni foglio, e fino alle 9 di venerdì ha stampato una sola pagina: venerdì alle 7:12, dall'account comune.",
        badges: "Prima delle 7:30 di venerdì in azienda c'erano solo Rosa, il custode e Sergio.",
        board: "Negli avvisi di Sergio sulla lavagna del magazzino ci sono gli stessi due errori della lettera.",
        camera: "Dalle 7:00 alle 7:25 Rosa e il custode sono in portineria, ripresi dalla telecamera.",
        desk: "La lettera era sulla scrivania di Bassi, al primo piano, in un ufficio sempre aperto.",
        audit: "Martedì Laura aveva chiesto un controllo perché le bolle del magazzino non tornavano con le fatture; mercoledì Bassi ha chiesto le bolle a Sergio.",
        forged: "La fattura 418 vera è di 4.180 euro, e la sigla di Laura sulla fotocopia è ricalcata.",
        rivalry: "Paola sperava nel posto di responsabile che stava per andare a Laura.",
        paolahappy: "Paola non nasconde di essere contenta.",
        paolatime: "Venerdì Paola è entrata alle 7:40.",
        paolafrank: "Paola dice che le cose le dice in faccia, e a Laura le ha dette.",
        watch: "Sergio porta un orologio d'oro e una camicia di marca.",
        sergiosays: "Sergio dice che venerdì non è mai salito al primo piano.",
        sergiopoints: "Sergio invita a cercare in amministrazione, non in magazzino.",
        rosacoffee: "Rosa dice di aver preso il caffè con il custode in portineria fino alle 7:25.",
        stairs: "Verso le 7:15 Rosa ha visto Sergio scendere di fretta dalle scale del primo piano."
      },
      culprit: "sergio",
      keys: ["print", "badges", "camera", "stairs", "sergiosays", "stamp", "board", "errors", "paolatime"],
      need: 4,
      motives: ["Fermare il controllo sulle bolle: era lui a rubare", "Far avere a Paola il posto di Laura", "Vendicarsi di un rimprovero di Laura"],
      motive: 0,
      traps: [
        { text: "Annunciare che lunedì un revisore esterno controllerà una per una le bolle del magazzino dell'ultimo anno, e lasciare l'archivio del magazzino sotto una telecamera nascosta.", ok: true, why: "Solo chi ha falsificato le bolle ha bisogno di correre in archivio prima del revisore. Domenica sera Sergio entra con il badge, e la telecamera lo riprende mentre sostituisce le bolle con copie «aggiustate». La lettera serviva a questo: far guardare tutti Laura, che stava per scoprirlo." },
        { text: "Licenziare Paola: litigava con Laura e voleva il suo posto.", ok: false, why: "Volere un posto non è scrivere una lettera. E alle 7:12, quando la lettera è stata stampata, Paola non era ancora entrata." },
        { text: "Far scrivere a tutti un dettato con le frasi della lettera, e vedere chi sbaglia.", ok: false, why: "Chi ha scritto la lettera sa quali errori cerchi e starà attento. E «un pò» lo scrivono in tanti: è un indizio che conferma, non una prova che basta da sola." },
        { text: "Confrontare le calligrafie con quella della lettera.", ok: false, why: "La lettera è stampata: non c'è nessuna calligrafia da confrontare." }
      ],
      close: [
        "La riga grigia dice che la lettera è uscita dall'unica stampante dell'azienda dopo il guasto di giovedì sera, e il registro, in quelle ore, segna una sola stampa: venerdì alle 7:12. A quell'ora, dice il registro dei badge, in azienda c'erano solo tre persone: Rosa, il custode e Sergio. Rosa e il custode erano in portineria a prendere il caffè, ripresi dalla telecamera. Resta Sergio, che giura di non essere mai salito al primo piano, mentre Rosa lo vede scendere di lì alle 7:15, di fretta.",
        "Gli errori della lettera sono gli stessi degli avvisi di Sergio sulla lavagna, e la fotocopia della fattura viene dai fascicoli del magazzino, cioè dai suoi. Da soli sarebbero indizi deboli; insieme all'orario diventano una firma.",
        "Il perché lo racconta Bassi senza accorgersene: martedì Laura aveva chiesto un controllo sulle bolle del magazzino, mercoledì le bolle sono state chieste a Sergio, venerdì è arrivata la lettera contro Laura. Chi accusa per primo, a volte, sta solo cercando di non essere guardato."
      ],
      lesson: "Chiediti a chi conviene davvero. Paola voleva il posto di Laura, Sergio aveva bisogno che nessuno controllasse le bolle: il movente più rumoroso non è sempre quello vero."
    },
    /* ---------------------------------------------------------------- 8 */
    {
      id: "copy", level: 3, title: "La copia perfetta", place: "Museo Palazzo Doni, Firenze",
      brief: [
        "Martedì mattina la curatrice del museo, Bianca Serra, passando nella sala 4 sente odore di vernice fresca: il «Ritratto della contessa», un olio del Settecento, è stato sostituito con una copia. Ottima, ma copia.",
        "La notte prima l'allarme della sala è rimasto spento mezz'ora per una manutenzione dei sensori. Sotto osservazione ci sono Bianca, il restauratore Ottavio Landi, il custode notturno Samuele e Nina, una giovane pittrice che ogni martedì copia proprio quel ritratto."
      ],
      budget: 13,
      scene: [
        { id: "fake", name: "La copia appesa", text: "Stesse misure dell'originale, al millimetro. Sul dorso della mano sinistra della contessa c'è una piccola macchia scura, come una bruciatura della vernice.", fact: "size" },
        { id: "back", name: "Il retro della tela", text: "La tela è antica, del Settecento, rinforzata da una seconda tela incollata dietro: una «foderatura», un lavoro da restauratori. Sul telaio, viti appena svitate e riavvitate.", fact: "canvas" },
        { id: "catalog", name: "Il catalogo della mostra", text: "Il ritratto viene da una collezione privata ed è esposto al pubblico per la prima volta in questa mostra, dopo il restauro dell'anno scorso. Nella foto del catalogo la mano della contessa è pulita: la macchia non c'è.", fact: "catalog" },
        { id: "report", name: "La scheda del restauro", text: "«Rimossa una bruciatura della vernice sul dorso della mano sinistra.» Firmato: Ottavio Landi, aprile dell'anno scorso.", fact: "stain" },
        { id: "easel", name: "Il cavalletto di Nina", text: "La sua copia è a metà, su una tela nuova. È più piccola dell'originale di un buon quinto.", fact: "ninacopy" },
        { id: "maint", name: "Il registro della manutenzione", text: "«Manutenzione sensori di umidità, sala 4, ore 2:10–2:40.» Richiesta dal laboratorio di restauro, approvata dalla curatrice Bianca Serra.", fact: "maint" },
        { id: "labbin", name: "Il cestino del laboratorio di restauro", text: "Tra i fogli appallottolati, la ricevuta di un bonifico dall'estero sul conto di Ottavio Landi: 40.000 euro, causale «consulenza», arrivato la settimana scorsa.", fact: "payment" }
      ],
      people: [
        {
          id: "bianca", name: "Bianca Serra", role: "curatrice",
          look: "Tailleur impeccabile, ma si è mangiata le unghie fino alla carne. Risponde con precisione, da manuale.",
          ask: [
            { id: "rule", q: "Che regole ci sono per i copisti come Nina?", a: "Il regolamento del museo vuole che le copie siano più piccole o più grandi dell'originale di almeno un quinto. Proprio per evitare scambi.", fact: "rule" },
            { id: "maint", q: "Perché ha approvato la manutenzione di quella notte?", a: "Me l'ha chiesta il laboratorio di restauro, per mail, come sempre. Io firmo decine di richieste così.", fact: "biancasigned" },
            { id: "lab", q: "Il laboratorio di restauro tiene tele antiche?", a: "Sì, quando si rifodera un quadro avanzano tele vecchie. Ottavio le conserva tutte: dice che prima o poi servono.", fact: "workshop" }
          ]
        },
        {
          id: "ottavio", name: "Ottavio Landi", role: "restauratore",
          look: "Dita macchiate di colore e solvente, un taglio fresco sul pollice. Mentre parla il telefono vibra: lo gira a faccia in giù sul tavolo, svelto.",
          lookFact: "ottphone",
          ask: [
            { id: "photos", q: "Esistono foto del ritratto prima del restauro?", a: "Solo le mie, ad altissima risoluzione. Le ho scattate io, centimetro per centimetro. Sono il mio archivio personale: non le ho mai date a nessuno, nemmeno al museo.", fact: "photos" },
            { id: "night", q: "Dov'era lunedì notte?", a: "A casa, a Fiesole. Dormivo. La mail della manutenzione? Non l'ho scritta io: qualcuno avrà usato il computer del laboratorio.", fact: "ottaviosays" },
            { id: "contract", q: "Come vanno le cose con il museo?", a: "Dall'anno prossimo non mi rinnovano il contratto. Trent'anni qui dentro, e mi mandano via con una mail.", fact: "contract" }
          ]
        },
        {
          id: "samuele", name: "Samuele Ricci", role: "custode notturno",
          look: "Divisa stropicciata, occhi da notte in bianco. Ripete che lui ha fatto il suo giro, come sempre.",
          ask: [
            { id: "night", q: "Durante la manutenzione ha visto qualcuno?", a: "Alle 2:15, nel corridoio di servizio, un uomo con un tubo porta-disegni lungo così. Di spalle, cappuccio in testa. Ho pensato fosse il tecnico dei sensori.", fact: "tube" },
            { id: "tech", q: "Il tecnico dei sensori è arrivato davvero?", a: "No. Me ne sono accorto dopo: in portineria non risulta nessun tecnico, quella notte.", fact: "notech" }
          ]
        },
        {
          id: "nina", name: "Nina Ferri", role: "copista",
          look: "Colore sotto le unghie, proprio i bruni e gli ocra del ritratto. Ha gli occhi lucidi: sa di essere la prima sospettata.",
          lookFact: "ninapaint",
          ask: [
            { id: "where", q: "Dove ha lavorato alla sua copia?", a: "Qui in sala, ogni martedì, davanti all'originale. Copio dal vero, non da foto: è il senso del mestiere.", fact: "ninalive" }
          ]
        }
      ],
      facts: {
        size: "La copia appesa ha le stesse misure dell'originale e sul dorso della mano sinistra ha una piccola macchia scura.",
        canvas: "La copia è dipinta su una tela del Settecento foderata: un lavoro da restauratori.",
        catalog: "Il ritratto è esposto per la prima volta dopo il restauro, e nella foto del catalogo la macchia non c'è.",
        stain: "Quella macchia era una bruciatura che Ottavio ha tolto nel restauro dell'anno scorso.",
        ninacopy: "La copia di Nina è più piccola dell'originale di un quinto, ed è ancora sul cavalletto.",
        maint: "La notte del furto l'allarme è rimasto spento dalle 2:10 alle 2:40 per una manutenzione chiesta dal laboratorio di restauro e approvata da Bianca.",
        rule: "Le copie dei copisti devono essere di misure diverse dall'originale di almeno un quinto.",
        biancasigned: "Bianca ha approvato la manutenzione su richiesta del laboratorio, come fa sempre.",
        workshop: "Ottavio conserva le tele antiche avanzate dalle foderature.",
        payment: "La settimana scorsa Ottavio ha ricevuto dall'estero un bonifico di 40.000 euro per una «consulenza».",
        ottphone: "Quando il telefono vibra, Ottavio lo gira a faccia in giù.",
        photos: "Ottavio dice che le foto di prima del restauro le ha solo lui e che non le ha mai date a nessuno.",
        ottaviosays: "Ottavio dice di essere stato a casa e di non aver scritto la mail della manutenzione.",
        contract: "Il museo non rinnoverà il contratto di Ottavio.",
        tube: "Alle 2:15 un uomo con un tubo porta-disegni passava nel corridoio di servizio.",
        notech: "Quella notte nessun tecnico dei sensori è venuto al museo.",
        ninapaint: "Nina ha sotto le unghie i colori del ritratto.",
        ninalive: "Nina copia dal vero, in sala, non da fotografie."
      },
      culprit: "ottavio",
      keys: ["stain", "catalog", "photos", "canvas", "workshop", "size", "maint", "notech", "tube", "ninacopy", "ninalive", "rule"],
      need: 4,
      motives: ["Soldi: un compratore privato lo ha pagato per l'originale", "Coprire un difetto del suo restauro", "Vendicarsi di Bianca"],
      motive: 0,
      traps: [
        { text: "Prima far raccontare a Ottavio, con calma e nei dettagli, chi può aver visto le sue foto di prima del restauro. Solo dopo mostrargli la macchia sulla mano della copia.", ok: true, why: "È la tecnica delle prove al momento giusto applicata a un caso: Ottavio, sicuro di sé, giura che le foto le ha solo lui. Quando vede la macchia capisce che il falsario ha copiato proprio quelle foto, e non ha più una versione che regga." },
        { text: "Fermare Nina: dipinge copie di quel quadro ogni martedì.", ok: false, why: "Il regolamento la obbliga a misure diverse e la sua copia è ancora sul cavalletto, più piccola di un quinto. E copia dal vero un quadro che è arrivato al pubblico già restaurato: la macchia non l'ha mai vista." },
        { text: "Accusare Bianca: ha firmato lei la manutenzione.", ok: false, why: "Firma decine di richieste così. Non ha le tele antiche avanzate dalle foderature e non ha le foto di prima del restauro." },
        { text: "Esaminare la copia con i raggi X e aspettare il risultato.", ok: false, why: "Direbbe quello che si sa già, che è una copia. Non dice chi l'ha dipinta." }
      ],
      close: [
        "Il dettaglio decisivo è una macchia. Sulla copia, la mano della contessa ha una bruciatura che nel quadro vero non c'è più da un anno: Ottavio l'ha tolta durante il restauro. Il quadro è arrivato al pubblico già restaurato, e nel catalogo la mano è pulita: chi ha dipinto la copia non ha guardato né il quadro né il catalogo. Ha copiato foto di prima del restauro.",
        "Quelle foto, lo dice lui stesso, le ha solo Ottavio. Non ha dipinto la copia di sua mano, perché quella bruciatura non l'avrebbe mai rimessa: ha dato le foto e una tela antica a un falsario, che ha copiato tutto, macchia compresa. Poi ha fatto lo scambio: la tela antica foderata viene dalle scorte che conserva lui, la mail della manutenzione parte dal suo laboratorio, il tecnico dei sensori non è mai arrivato e alle 2:15 un uomo porta un quadro arrotolato in un tubo da disegni.",
        "Nina era la sospettata perfetta, e proprio per questo una pista falsa: copia dal vero, la macchia non l'ha mai vista e la sua tela è più piccola, come vuole il regolamento. Il bonifico dall'estero nel cestino del laboratorio dice il resto."
      ],
      lesson: "A volte la prova è un dettaglio che non dovrebbe esserci: la copia conteneva un difetto che solo una persona al mondo poteva conoscere."
    },

    /* ---------------------------------------------------------------- 9 */
    {
      id: "terrace", level: 3, title: "La notte della terrazza", place: "Una villa sul lago di Como",
      brief: [
        "All'alba il giardiniere trova Arturo Brivio, 74 anni, industriale in pensione, senza vita ai piedi della scala di pietra che scende dalla terrazza al lago. Per il medico la caduta è avvenuta tra mezzanotte e l'una. I gradini sono bagnati e scivolosi: sembra un incidente.",
        "In casa, quella notte, c'erano la moglie Livia, il nipote Edoardo, il socio d'affari Ruggero, ospite per il fine settimana, e la governante Marta."
      ],
      budget: 14,
      scene: [
        { id: "stairs", name: "La scala della terrazza", text: "I gradini sono bagnati fino in fondo. Ma stanotte non ha piovuto, il prato intorno è asciutto e sale un odore pungente di candeggina.", fact: "bleach" },
        { id: "glasses", name: "La giacca da camera di Arturo", text: "Nel taschino ci sono i suoi occhiali, piegati con cura. Lenti spesse da forte miope.", fact: "glasses" },
        { id: "lights", name: "La domotica della casa", text: "Il registro delle luci: quelle della scala, che si accendono solo dall'interruttore in cima, sono rimaste spente tutta la notte.", fact: "light" },
        { id: "table", name: "Il tavolino in terrazza", text: "Due bicchieri da whisky. Su uno c'è un segno di rossetto.", fact: "twoglasses" },
        { id: "laundry", name: "La lavanderia", text: "Un secchio ancora umido e un flacone di candeggina mezzo vuoto.", fact: "bucket" },
        { id: "study", name: "Lo studio di Arturo", text: "Sulla scrivania, una bozza di testamento non firmata, datata venerdì: quasi tutto a una fondazione per la ricerca. In agenda, lunedì alle 10: «notaio».", fact: "will" }
      ],
      people: [
        {
          id: "livia", name: "Livia Brivio", role: "la moglie",
          look: "Quarantacinque anni, rossetto rosso anche stamattina, voce impastata. Sul comodino della sua stanza c'è una scatola di sonniferi aperta.",
          lookFact: "liviapills",
          ask: [
            { id: "night", q: "Quando ha visto suo marito per l'ultima volta?", a: "Alle dieci abbiamo bevuto un whisky in terrazza. Alle undici sono andata a letto, ho preso il sonnifero come tutte le sere. Non ho sentito niente.", fact: "liviasays" },
            { id: "will", q: "Sapeva del nuovo testamento?", a: "Sì, ne avevamo parlato. A me lasciava la casa in ogni caso. La fondazione era il suo sogno, e io ero d'accordo.", fact: "liviaok" }
          ]
        },
        {
          id: "edoardo", name: "Edoardo Brivio", role: "il nipote",
          look: "Trent'anni, cuffie da gioco al collo. Mocassini scamosciati blu, con delle piccole macchie sbiadite sulla punta, come gocce di candeggina.",
          lookFact: "shoes",
          ask: [
            { id: "night", q: "Dov'era tra mezzanotte e l'una?", a: "In camera mia, a giocare online con i miei amici fino alle due. Non mi sono mai alzato. Chieda a loro.", fact: "edosays" },
            { id: "heir", q: "Lei è nel testamento di suo zio?", a: "Sono il suo unico nipote. Nel testamento che c'è, quello vero, sono l'erede principale.", fact: "heir" }
          ]
        },
        {
          id: "ruggero", name: "Ruggero Valli", role: "il socio d'affari",
          look: "Sessant'anni, abbronzato, nervoso. Parla molto e si giustifica prima ancora che tu chieda.",
          ask: [
            { id: "fight", q: "Com'è andata la cena di ieri sera?", a: "Male. Io e Arturo abbiamo litigato per una vendita di quote, abbiamo alzato la voce. Ma litighiamo da trent'anni: siamo soci, non nemici.", fact: "argue" },
            { id: "heard", q: "Stanotte ha sentito qualcosa?", a: "La mia camera è sopra la terrazza. Ero al telefono con mia moglie, a Milano, da mezzanotte. Verso mezzanotte e mezza ho sentito un colpo sordo, poi per un bel po' acqua che scorreva, come un secchio, una pompa. Ho pensato all'irrigazione automatica. Ecco il registro delle chiamate: da 0:01 all'1:10.", fact: "heard" }
          ]
        },
        {
          id: "marta", name: "Marta Galli", role: "governante",
          look: "Sguardo fermo, mani grandi da lavoro. È l'unica in casa che non ha pianto, però il caffè a tutti l'ha preparato lei.",
          ask: [
            { id: "glasses", q: "Arturo vedeva bene senza occhiali?", a: "Senza occhiali non vedeva a un metro. Se li toglieva solo per dormire, e li metteva sul comodino. Mai nel taschino.", fact: "nosight" },
            { id: "bleach", q: "La candeggina in lavanderia era già aperta?", a: "No. L'ho comprata giovedì, era piena e sigillata. E io la scala non la lavo: la pulisce l'impresa, il martedì.", fact: "marta" },
            { id: "dinner", q: "Cosa si è detto a cena?", a: "Il signor Arturo ha detto a Edoardo, davanti a tutti: «Lunedì vado dal notaio. Così impari a lavorare.» Edoardo è uscito dalla sala senza finire.", fact: "knew" }
          ]
        },
        {
          id: "luca", name: "Luca, in videochiamata", role: "amico di Edoardo",
          look: "Vent'anni, sullo sfondo una stanza piena di schermi. Ha voglia di aiutare l'amico.",
          ask: [
            { id: "game", q: "Edoardo ha giocato con voi tutta la notte?", a: "Sì, fino alle due... Beh, verso mezzanotte e dieci ha detto «vado a prendere da bere» e ha lasciato il personaggio fermo. È tornato verso l'una meno dieci. Il gioco segna «inattivo» dalle 0:10 alle 0:50.", fact: "afk" }
          ]
        }
      ],
      facts: {
        bleach: "La scala è stata bagnata con la candeggina stanotte: non ha piovuto.",
        glasses: "Arturo aveva gli occhiali piegati nel taschino della giacca da camera.",
        light: "Le luci della scala sono rimaste spente tutta la notte.",
        twoglasses: "In terrazza ci sono due bicchieri da whisky, uno con il rossetto.",
        bucket: "In lavanderia, un secchio umido e la candeggina mezza vuota.",
        will: "Arturo stava per cambiare testamento a favore di una fondazione: lunedì aveva il notaio.",
        liviapills: "Livia prende un sonnifero tutte le sere.",
        liviasays: "Livia dice di aver bevuto un whisky con Arturo alle 22 e di essere andata a letto alle 23.",
        liviaok: "Con il nuovo testamento Livia teneva comunque la casa.",
        shoes: "I mocassini di Edoardo hanno macchie sbiadite sulla punta, come gocce di candeggina.",
        edosays: "Edoardo dice di aver giocato online in camera fino alle due senza alzarsi mai.",
        heir: "Nel testamento in vigore Edoardo è l'erede principale.",
        argue: "A cena Ruggero e Arturo hanno litigato per una vendita di quote.",
        heard: "Verso le 0:30 Ruggero, al telefono con la moglie fino all'1:10, ha sentito un colpo sordo e poi a lungo acqua che scorreva.",
        nosight: "Senza occhiali Arturo non vedeva a un metro: li toglieva solo per dormire.",
        marta: "La candeggina era piena e sigillata da giovedì, e la scala non la lava nessuno di casa.",
        knew: "A cena Arturo ha detto a Edoardo, davanti a tutti, che lunedì andava dal notaio.",
        afk: "Il personaggio di Edoardo è rimasto «inattivo» dalle 0:10 alle 0:50."
      },
      culprit: "edoardo",
      keys: ["afk", "edosays", "shoes", "bleach", "heard", "marta", "bucket", "nosight", "glasses", "light"],
      need: 4,
      motives: ["Il nuovo testamento: stava per perdere l'eredità", "Una lite d'affari", "La gelosia"],
      motive: 0,
      traps: [
        { text: "Dire a tutti che domattina i carabinieri ritireranno le scarpe di ognuno per un controllo, e passare la notte a guardare la riva del lago.", ok: true, why: "Le scarpe di Livia, Ruggero e Marta non dicono niente, e loro lo sanno. Edoardo sa che sui suoi mocassini c'è la candeggina della scala: alle tre di notte scende al pontile per buttarli nel lago." },
        { text: "Chiudere come incidente: la scala era bagnata.", ok: false, why: "Era bagnata di candeggina, in una notte senza pioggia, e qualcuno l'ha versata dopo il colpo sentito da Ruggero." },
        { text: "Accusare Livia: eredita, e in terrazza c'è il suo bicchiere.", ok: false, why: "Il bicchiere è delle dieci, come dice lei. E con il nuovo testamento non perdeva niente: il nuovo testamento era un motivo per Edoardo, non per lei." },
        { text: "Mettere sotto pressione Ruggero: ha litigato con Arturo.", ok: false, why: "Litigare non è un indizio di colpa. E dalla mezzanotte all'1:10 era al telefono con la moglie: per questo può raccontare il colpo e l'acqua." }
      ],
      close: [
        "Prima domanda: è davvero un incidente? Arturo, che senza occhiali non vedeva a un metro, li aveva piegati nel taschino. Le luci della scala erano spente. E i gradini erano bagnati di candeggina in una notte senza pioggia. Nessuno scende una scala di pietra al buio e senza vederci: questa è una scena preparata.",
        "Poi il tempo. Alle 0:30 Ruggero, al telefono con la moglie, sente un colpo e poi a lungo acqua che scorre: qualcuno lava la scala dopo la caduta. Il personaggio di Edoardo è «inattivo» dalle 0:10 alle 0:50, mentre lui giura di non essersi mai alzato. E sui suoi mocassini ci sono gocce di candeggina.",
        "Il perché lo dice Arturo stesso, a cena: lunedì il notaio. Con il nuovo testamento Edoardo perdeva quasi tutto. Livia e Ruggero avevano l'aria dei colpevoli da televisione; i fatti indicavano un'altra persona."
      ],
      lesson: "Prima di chiederti chi, chiediti se la scena è vera. Un incidente non lava la scala dopo essere successo."
    },
    /* ---------------------------------------------------------------- 10 */
    {
      id: "medium", level: 3, title: "La sensitiva", place: "Sanremo",
      brief: [
        "Adele Moretti, 79 anni, vedova, da sei mesi va ogni giovedì da «Madame Iris», sensitiva con lo studio in centro. Giovedì scorso Iris le ha detto: «Vedo l'anello di tuo marito. Lui lo rivuole con sé: presto tornerà agli spiriti.»",
        "Sabato mattina l'anello, un brillante di due carati, non è più nella cassaforte della camera. Niente è forzato. Adele è convinta che sia un segno, e lunedì vuole portare a Iris 15.000 euro per il rito che lo farà tornare. Il nipote Paolo ti chiede di capire chi c'è dietro, prima di lunedì."
      ],
      budget: 15,
      scene: [
        { id: "safe", name: "La cassaforte", text: "Nessun segno di scasso: è stata aperta con la combinazione. Dentro ci sono ancora i gioielli di poco valore; manca solo l'anello.", fact: "safe" },
        { id: "keys", name: "Le chiavi di Adele", text: "Nelle scanalature della chiave di casa c'è un residuo bianco e untuoso, come di cera: qualcuno ne ha preso l'impronta.", fact: "wax" },
        { id: "door", name: "La serratura di casa", text: "Intatta. Ma sullo zerbino, proprio sotto la toppa, brillano dei granelli di limatura: succede con una chiave copiata da poco e non rifinita.", fact: "newkey" },
        { id: "calendar", name: "Il calendario della cucina", text: "Ogni venerdì, dalle 10 alle 12, la stessa scritta: «Cimitero, da Franco». Adele va a trovare il marito tutte le settimane.", fact: "routine" },
        { id: "notebook", name: "Il quaderno di Adele", text: "Adele annota tutto quello che le dice Iris. Giovedì: «L'anello tornerà agli spiriti. Per riaverlo serve un rito: 15.000 euro in contanti, lunedì.»", fact: "ritual" },
        { id: "site", name: "Il sito di Madame Iris", text: "Nella pagina «Chi sono» c'è una foto di Iris abbracciata a un ragazzo con una rondine tatuata sul dorso della mano. Didascalia: «Con mio figlio Nicola, la mia forza.»", fact: "son" }
      ],
      people: [
        {
          id: "adele", name: "Adele Moretti", role: "la derubata",
          look: "Settantanove anni, elegante, gli occhi che si illuminano quando parla di Iris. Al collo porta una medaglietta con la foto del marito.",
          ask: [
            { id: "ring", q: "Quando ha visto l'anello l'ultima volta?", a: "Venerdì mattina alle nove: lo guardo ogni mattina, mi fa compagnia. Poi sono andata al cimitero, come ogni venerdì. Sabato alle nove non c'era più.", fact: "seen" },
            { id: "combo", q: "Chi conosce la combinazione della cassaforte?", a: "Nessuno, nemmeno Paolo: è la data del mio matrimonio, così non me la scordo. Ah... l'ho detta a Nicola, quel ragazzo così caro della sala d'attesa di Iris. Parliamo di tutto: di Franco, del cimitero il venerdì, di quanto sono smemorata.", fact: "told" },
            { id: "bag", q: "Durante le sedute dove lascia la borsa?", a: "In sala d'attesa: Iris dice che le borse disturbano l'energia. Dentro ci sono le chiavi, ma Nicola me la tiene d'occhio.", fact: "bag" }
          ]
        },
        {
          id: "paolo", name: "Paolo Moretti", role: "il nipote",
          look: "Quarant'anni, cravatta, parla di Iris con disprezzo. È l'unico erede della zia, e non lo nasconde.",
          lookFact: "heir",
          ask: [
            { id: "where", q: "Dov'era venerdì?", a: "A Milano per lavoro, da giovedì sera a sabato a mezzogiorno. Ecco il biglietto del treno e la ricevuta dell'albergo.", fact: "milan" },
            { id: "iris", q: "Che cosa pensa di Iris?", a: "Che è una truffatrice. Ho provato a dirlo a mia zia, e da un mese non mi parla più.", fact: "paolofight" }
          ]
        },
        {
          id: "wanda", name: "Wanda Costa", role: "collaboratrice domestica",
          look: "Sessant'anni, mani sciupate dai detersivi. Parla poco e guarda Adele con affetto.",
          ask: [
            { id: "friday", q: "Venerdì quando è venuta?", a: "Dalle due alle cinque del pomeriggio, come ogni lunedì, mercoledì e venerdì. La signora è stata in casa con me tutto il tempo.", fact: "wanda" },
            { id: "combo", q: "Sa la combinazione della cassaforte?", a: "No. La signora non la dice a nessuno. La cassaforte non la tocco nemmeno per spolverarla.", fact: "wandanocombo" }
          ]
        },
        {
          id: "iris", name: "Madame Iris", role: "sensitiva",
          look: "Sessant'anni, scialle viola, un anello a ogni dito. Ti guarda a lungo e poi dice, piano: «Lei ha perso qualcuno di importante, vero?»",
          lookFact: "irisreads",
          ask: [
            { id: "friday", q: "Dov'era venerdì mattina?", a: "In studio, con le mie clienti, dalle nove all'una. Può chiedere a ciascuna di loro.", fact: "irisalibi" },
            { id: "ring", q: "Come sapeva dell'anello?", a: "Me l'ha detto suo marito. Gli spiriti parlano, a chi sa ascoltare.", fact: "irisspirits" },
            { id: "nicola", q: "Chi è il ragazzo che sta sempre nella sua sala d'attesa?", a: "Un cliente. Viene per suo padre, poverino. Non so nemmeno come si chiama.", fact: "irislie" }
          ]
        },
        {
          id: "gina", name: "Gina Ferraro", role: "portinaia del palazzo",
          look: "Portinaia da trent'anni. Dal suo gabbiotto vede chiunque entri, e se lo ricorda.",
          ask: [
            { id: "friday", q: "Venerdì chi è salito dalla signora Moretti?", a: "Alle dieci e mezza, mentre lei era al cimitero, un ragazzo con un mazzo di fiori: «Per la signora Moretti», ha detto. È sceso dopo un quarto d'ora, con i fiori ancora in mano. Aveva una rondine tatuata sulla mano. Il pomeriggio è venuta la Wanda, e basta. Il nipote non si vede da un mese.", fact: "gina" },
            { id: "before", q: "Quel ragazzo l'aveva già visto?", a: "Sì. Giovedì ho accompagnato io la signora dalla sensitiva, e lui era in sala d'attesa. Le teneva la borsa, tutto gentile.", fact: "waiting" }
          ]
        },
        {
          id: "lucia", name: "Lucia Sardi", role: "ex cliente di Iris",
          look: "Settant'anni, un po' imbarazzata. Ha chiesto lei di parlarti, quando ha saputo dell'anello.",
          ask: [
            { id: "story", q: "Che cosa le è successo?", a: "Un anno fa Iris mi ha detto che la collana di mia madre «sarebbe tornata agli spiriti». Due giorni dopo è sparita da casa. Ho pagato il rito, ottomila euro, e una settimana dopo la collana era di nuovo nel mio cassetto. Ci ho creduto fino a oggi.", fact: "lucia" },
            { id: "boy", q: "In sala d'attesa c'era qualcuno?", a: "Sempre lo stesso ragazzo, con una rondine sulla mano. Gli raccontavo tutto: era così attento.", fact: "luciawait" }
          ]
        }
      ],
      facts: {
        safe: "La cassaforte è stata aperta con la combinazione: manca solo l'anello.",
        wax: "Sulla chiave di casa di Adele c'è un residuo di cera: qualcuno ne ha preso l'impronta.",
        newkey: "La porta è stata aperta con una chiave copiata da poco: sotto la toppa c'è della limatura.",
        routine: "Ogni venerdì, dalle 10 alle 12, Adele va al cimitero.",
        ritual: "Giovedì Iris ha predetto che l'anello sarebbe «tornato agli spiriti», e chiede 15.000 euro in contanti per il rito che lo farà tornare.",
        son: "Il ragazzo con la rondine tatuata sulla mano è Nicola, il figlio di Iris.",
        seen: "Venerdì alle nove l'anello era in cassaforte; sabato alle nove no.",
        told: "Adele ha detto la combinazione soltanto a Nicola, il ragazzo della sala d'attesa; con lui ha parlato anche del cimitero del venerdì.",
        bag: "Per regola di Iris («le borse disturbano l'energia»), durante le sedute la borsa di Adele, con le chiavi, resta in sala d'attesa, «sorvegliata» da Nicola.",
        heir: "Paolo è l'unico erede di Adele.",
        milan: "Da giovedì sera a sabato a mezzogiorno Paolo era a Milano.",
        paolofight: "Paolo e Adele non si parlano da un mese per colpa di Iris.",
        wanda: "Venerdì Wanda ha lavorato dalle 14 alle 17, sempre con Adele in casa.",
        wandanocombo: "Wanda non conosce la combinazione.",
        irisreads: "Iris ti accoglie con una frase che vale per quasi chiunque: «Lei ha perso qualcuno di importante.»",
        irisalibi: "Venerdì mattina Iris era nel suo studio con le clienti.",
        irisspirits: "Iris dice che dell'anello le ha parlato il marito di Adele, dall'aldilà.",
        irislie: "Iris dice di non sapere nemmeno come si chiama il ragazzo della sala d'attesa.",
        gina: "Venerdì alle 10:30, mentre Adele era al cimitero, un ragazzo con una rondine tatuata sulla mano è salito «a portare dei fiori» ed è sceso dopo un quarto d'ora con i fiori in mano.",
        waiting: "Giovedì quel ragazzo era nella sala d'attesa di Iris e teneva la borsa di Adele.",
        lucia: "Un anno fa, a Lucia, Iris ha «predetto» la sparizione di una collana: è sparita, Lucia ha pagato il rito e la collana è ricomparsa.",
        luciawait: "Anche Lucia, in sala d'attesa, raccontava tutto al ragazzo con la rondine."
      },
      culprit: "iris",
      keys: ["son", "irislie", "ritual", "lucia", "told", "bag", "waiting", "gina", "wax", "newkey", "routine", "seen", "safe", "luciawait", "milan", "wandanocombo"],
      need: 4,
      motives: ["Il rito: 15.000 euro, e poi l'anello sarebbe «ricomparso»", "Allontanare Adele dal nipote", "Rivendere l'anello"],
      motive: 0,
      traps: [
        { text: "Lasciare che lunedì Adele porti a Iris i 15.000 euro, in banconote segnate, e sorvegliare la casa nei giorni dopo: l'anello deve «ricomparire».", ok: true, why: "Il trucco di Iris ha due tempi: incassare il rito e poi far tornare l'anello, come con Lucia. Martedì mattina, mentre Adele è al mercato, Nicola sale con la chiave copiata per rimettere l'anello in cassaforte e trova i carabinieri; nello studio di Iris ci sono le banconote segnate. È la trappola giusta perché funziona solo con chi l'anello ce l'ha." },
        { text: "Accusare Paolo: è l'erede, e odia Iris.", ok: false, why: "Era a Milano da giovedì sera a sabato, e la combinazione non la conosceva. È stato lui a chiedere aiuto." },
        { text: "Smascherare Iris davanti ad Adele, facendo una lettura a freddo più brava della sua.", ok: false, why: "Dimostreresti che Iris è un'imbrogliona, non che ha preso l'anello. Adele si offende e la difende, Iris si tiene l'anello e cambia città." },
        { text: "Interrogare Wanda: venerdì era in casa.", ok: false, why: "È stata con Adele tutto il pomeriggio e la combinazione non la sa. Sospettare di chi pulisce la casa è il pregiudizio più comodo." }
      ],
      close: [
        "La cassaforte è stata aperta con la combinazione, la porta con una chiave copiata da poco. La combinazione Adele l'ha detta a una sola persona, Nicola, il ragazzo della sala d'attesa; e in sala d'attesa, per «l'energia», restava la borsa con le chiavi, che Nicola sorvegliava. A lui Adele aveva raccontato anche del cimitero, il venerdì dalle 10 alle 12. Venerdì alle 10:30 la portinaia vede salire un ragazzo con una rondine tatuata e dei fiori che non consegnerà mai.",
        "Iris ha l'alibi perfetto: venerdì era in studio. Ma un giorno prima aveva «visto» l'anello tornare agli spiriti, e il ragazzo con la rondine è suo figlio, anche se lei giura di non sapere come si chiama. Con Lucia era andata allo stesso modo: gioiello sparito, rito pagato, gioiello ricomparso.",
        "Le «visioni» di Iris erano informazioni raccolte in sala d'attesa: lettura a caldo. Il furto serviva a vendere il rito. Le mani erano di Nicola, la testa di Iris."
      ],
      lesson: "Chi ha l'alibi perfetto non è per forza innocente: a volte vuol dire che ha mandato qualcun altro. E davanti a una previsione che si avvera chiediti chi aveva bisogno che si avverasse."
    }
  ];

  const api = { CASES };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MentalistCases = api;
})(typeof window !== "undefined" ? window : globalThis);
