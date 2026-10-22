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
        { id: "door", name: "La porta sul retro", text: "Ha un sensore collegato all'allarme. Il registro dice: chiusura alle 23:46, poi apertura alle 0:52 e di nuovo chiusura alle 1:05. In tutti e due i casi l'allarme è stato disinserito con il codice.", fact: "door" },
        { id: "bin", name: "Il bidone della cucina", text: "In fondo al sacco, sopra le bucce di patata, c'è la busta della banca, strappata.", fact: "bin" },
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
          look: "Occhiaie profonde, un cerotto fresco sul pollice. Non molla mai il telefono, e lo schermo si accende di continuo: notifiche di un'app di scommesse sportive.",
          lookFact: "bets",
          ask: [
            { id: "time", q: "A che ora sei andato via sabato sera?", a: "Verso le 23:30, subito dopo Sara. Sono andato a casa a dormire e non sono più uscito.", fact: "davidesays" },
            { id: "money", q: "Come vanno le cose con i soldi?", a: "Benissimo. Perché me lo chiede?", fact: "davidestiff" }
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
            { id: "night", q: "Stanotte ha visto qualcuno vicino al bar?", a: "Verso l'una è arrivato il furgoncino bianco del cuoco, quello con la scritta del catering. Si è fermato dietro, sul retro, ed è ripartito dopo un quarto d'ora.", fact: "van" }
          ]
        }
      ],
      facts: {
        noforce: "La cassaforte è stata aperta con la combinazione, senza forzarla.",
        postit: "La combinazione è scritta su un post-it nel cassetto: non la conoscono solo Bruno e Sara.",
        door: "Qualcuno è rientrato dal retro alle 0:52 con chiavi e codice dell'allarme, ed è uscito alle 1:05.",
        bin: "La busta della banca, strappata, era nel bidone della cucina.",
        cam: "La telecamera del retro è guasta da una settimana, e lo sanno tutti.",
        photo: "Alle 23:04 i 640 euro erano nella busta: Sara li ha fotografati per Bruno.",
        keys: "Chiavi e codice dell'allarme li hanno solo Bruno, Davide e Kevin.",
        bruno: "Bruno era a un matrimonio a Modena fino alle due.",
        davideknows: "Davide conosce il post-it: la settimana scorsa ha aperto lui la cassaforte.",
        bets: "Davide ha un'app di scommesse che gli manda notifiche di continuo.",
        davidesays: "Davide dice di essere andato a casa alle 23:30 e di non essere più uscito.",
        davidestiff: "Davide si irrigidisce quando si parla di soldi.",
        kevinnervous: "Kevin è molto nervoso.",
        kevinbins: "Kevin ha svuotato il bidone della cucina prima di chiudere, alle 23:46.",
        kevinhome: "Kevin dice di essere a casa a Casalecchio da mezzanotte e mezza.",
        van: "Verso l'una il furgoncino di Davide era fermo sul retro del bar, per un quarto d'ora."
      },
      culprit: "davide",
      keys: ["door", "keys", "van", "davidesays", "kevinbins", "bin"],
      need: 3,
      motives: ["I debiti delle scommesse", "Una vendetta contro Bruno per lo stipendio", "Coprire un ammanco con i fornitori"],
      motive: 0,
      traps: [
        { text: "Dire davanti a tutti che Bruno annota i numeri di serie delle banconote da 50 per la banca, e che domani la banca li controllerà. Poi guardare chi, in giornata, prova a liberarsi dei soldi.", ok: true, why: "Solo chi ha i soldi ha un motivo per correre a spenderli. Davide va alla sala scommesse a giocare le banconote da 50 e lo fermano lì, con il resto in tasca. È il principio di quasi tutte le trappole di Jane: far agire il colpevole su un'informazione che ha solo lui." },
        { text: "Mettere Davide sotto pressione finché non confessa.", ok: false, why: "Una confessione strappata con la pressione non prova niente: può essere falsa, e in un processo non vale." },
        { text: "Guardare chi distoglie lo sguardo mentre si parla del furto.", ok: false, why: "Il nervosismo non distingue chi mente: qui il più agitato è Kevin, ed è innocente." },
        { text: "Chiedere a tutti di fare la macchina della verità.", ok: false, why: "Il poligrafo misura l'agitazione, non la menzogna, e in Italia non si usa come prova." }
      ],
      close: [
        "Si parte dai fatti con un orario. Alle 23:04 i soldi erano nella busta. La busta è finita nel bidone della cucina, ma Kevin quel bidone l'aveva svuotato alle 23:46, prima di chiudere: quindi qualcuno è tornato dopo la chiusura. Il registro della porta lo conferma: 0:52, con chiavi e codice.",
        "Chiavi e codice li hanno in tre. Bruno era a Modena. Davide dice di non essere più uscito, ma la fornaia ha visto il suo furgoncino sul retro proprio a quell'ora. Il post-it spiega come conosceva la combinazione, le scommesse spiegano perché.",
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
        { id: "course", name: "Il registro del corso di disegno", text: "Martedì, dalle 15:30 alle 17:30, presenti della 4B: Filippo, Martina e Omar. Nessuno è uscito prima.", fact: "course" }
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
          look: "Felpa verde della squadra di pallavolo. Sotto le unghie un alone azzurro che il sapone non ha tolto. Risponde prima che tu abbia finito la domanda.",
          ask: [
            { id: "after", q: "Dove sei andato martedì dopo il corso di disegno?", a: "A casa. Ho preso l'autobus delle 17:35, come sempre.", fact: "filipposays" },
            { id: "grades", q: "Come vai in matematica?", a: "Male. Ho due insufficienze, e se prendo un altro quattro non mi fanno giocare il campionato: è la regola della squadra.", fact: "grades" }
          ]
        },
        {
          id: "martina", name: "Martina Sala", role: "studentessa della 4B",
          look: "Felpa verde della pallavolo legata in vita, ginocchiere che spuntano dallo zaino. Anche lei ha le dita azzurre di gesso.",
          ask: [
            { id: "after", q: "Dove sei andata martedì dopo il corso di disegno?", a: "In palestra: alle 17:30 c'era l'allenamento. Chieda pure al mister.", fact: "martinasays" }
          ]
        },
        {
          id: "omar", name: "Omar Belli", role: "studente della 4B",
          look: "Giacca di jeans, niente felpe della scuola. Dita azzurre di gesso come gli altri del corso.",
          ask: [
            { id: "after", q: "Dove sei andato martedì dopo il corso di disegno?", a: "Sono rimasto in aula 12 a finire la tavola con il professore di disegno, fino alle sei passate.", fact: "omar" }
          ]
        },
        {
          id: "gino", name: "Gino", role: "bidello",
          look: "Un mazzo di chiavi enorme alla cintura. Conosce tutti gli studenti per nome, e sa chi fa cosa.",
          ask: [
            { id: "seen", q: "Martedì verso le sei ha visto studenti vicino alla sala professori?", a: "Alle 17:40 c'era Filippo della 4B lì davanti. Ha detto che cercava la professoressa Gatti per un colloquio. Ma i colloqui sono per i genitori.", fact: "gino" },
            { id: "gym", q: "A che ora è cominciato l'allenamento di pallavolo?", a: "Alle 17:30 in punto: il mister fa l'appello, e la squadra femminile era tutta lì.", fact: "gym" }
          ]
        }
      ],
      facts: {
        chalk: "Una copia ha una ditata di gesso azzurro sul retro.",
        sleeve: "Nella foto si vede il polsino di una felpa verde della squadra di pallavolo.",
        time: "La foto è partita per la prima volta martedì alle 17:42.",
        room: "Martedì pomeriggio la sala professori era aperta fino alle 18.",
        blue: "I gessetti azzurri ci sono solo in aula 12, dove martedì c'era il corso di disegno.",
        course: "Al corso di disegno di martedì, dalle 15:30 alle 17:30, c'erano Filippo, Martina e Omar.",
        allknow: "Tutta la classe sa dove la professoressa tiene i compiti.",
        filipposays: "Filippo dice di aver preso l'autobus delle 17:35 per tornare a casa.",
        grades: "Filippo ha due insufficienze: con un'altra, niente campionato di pallavolo.",
        martinasays: "Martina dice di essere andata all'allenamento delle 17:30.",
        omar: "Omar è rimasto in aula 12 con il professore fino alle sei passate.",
        gino: "Alle 17:40 il bidello ha visto Filippo davanti alla sala professori.",
        gym: "L'allenamento è cominciato alle 17:30 con l'appello: Martina era in palestra."
      },
      culprit: "filippo",
      keys: ["gino", "filipposays", "sleeve", "time", "gym"],
      need: 3,
      motives: ["Rischiava di non giocare il campionato per i voti", "Voleva vendere il compito ai compagni", "Ce l'aveva con la professoressa"],
      motive: 0,
      traps: [
        { text: "Preparare un nuovo compito in tre versioni appena diverse, farne vedere una diversa a ciascuno dei tre del corso e aspettare quale versione finisce nella chat.", ok: true, why: "È la «trappola del canarino»: la versione che ricompare dice da chi è uscita. In chat gira quella mostrata a Filippo, con la virgola spostata che c'era solo nella sua copia." },
        { text: "Annullare il compito e mettere una nota a tutta la classe.", ok: false, why: "Così il colpevole si confonde con gli altri: è proprio quello che spera." },
        { text: "Chiedere in classe a chi ha fotografato il compito di farsi avanti.", ok: false, why: "Senza conseguenze chiare e senza prove, nessuno si fa avanti: si perde solo l'effetto sorpresa." },
        { text: "Guardare chi arrossisce quando si nomina la chat.", ok: false, why: "Arrossisce anche chi ha soltanto letto il compito in chat, cioè mezza classe." }
      ],
      close: [
        "Due dettagli fisici stringono il campo. Il gesso azzurro c'è solo in aula 12: chi ha toccato la copia veniva dal corso di disegno, quindi Filippo, Martina o Omar. Il polsino della felpa della pallavolo toglie Omar.",
        "Poi l'orario. La foto parte alle 17:42. Martina era all'appello in palestra dalle 17:30. Filippo dice di aver preso l'autobus delle 17:35, ma alle 17:40 il bidello lo vede davanti alla sala professori. La regola della squadra spiega il perché.",
        "La trappola del canarino trasforma il sospetto in prova: non serve una confessione, basta vedere quale versione esce."
      ],
      lesson: "Un dettaglio fisico restringe il campo, un orario lo chiude. E una buona trappola fa parlare i fatti al posto delle persone."
    },

    /* ---------------------------------------------------------------- 3 */
    {
      id: "watch", level: 2, title: "L'orologio del nonno", place: "Una villa nelle Langhe",
      brief: [
        "Domenica, cena di famiglia dai Ravera. A fine serata il nonno Ettore, 86 anni, scopre che il suo orologio d'oro non è più sulla scrivania dello studio. La finestra dello studio è aperta e sul davanzale c'è del fango.",
        "In casa c'erano i nonni, il figlio Alberto con la moglie Carla, il nipote Matteo e Ana, la badante. Tutti, a voce bassa, guardano Ana."
      ],
      budget: 15,
      scene: [
        { id: "desk", name: "La scrivania dello studio", text: "Il panno di velluto dove il nonno appoggia l'orologio è vuoto. Accanto c'è ancora la chiavetta per caricarlo." },
        { id: "window", name: "La finestra dello studio", text: "Aperta, con del fango sul davanzale. Ma il fango è solo sul lato interno, e nell'aiuola sotto la finestra, fradicia di pioggia, non c'è nemmeno un'impronta.", fact: "window" },
        { id: "ficus", name: "Il vaso del ficus", text: "Nell'angolo dello studio. Nella terra, vicino al bordo, c'è un buco recente grande come tre dita: la stessa terra scura che c'è sul davanzale.", fact: "ficus" },
        { id: "map", name: "La pianta della casa", text: "Lo studio dà sul corridoio d'ingresso, come il bagno e la porta di casa. La cucina è dalla parte opposta: per andare dalla cucina allo studio si attraversa per forza la sala da pranzo, davanti alla tavola.", fact: "map" },
        { id: "porch", name: "Il portico d'ingresso", text: "Un mozzicone di sigaretta fresco, schiacciato in fretta, e la carta di una gomma da masticare alla menta.", fact: "smoke" },
        { id: "coat", name: "Il cappotto di Alberto, all'ingresso", text: "Dalla tasca spunta una busta della banca. Si legge l'intestazione: «Sollecito di pagamento. Ultimo avviso».", fact: "bank" }
      ],
      people: [
        {
          id: "ettore", name: "Ettore Ravera", role: "il nonno",
          look: "Ottantasei anni e lucidissimo. Mentre parla si tocca il polso vuoto.",
          ask: [
            { id: "last", q: "Quando ha visto l'orologio per l'ultima volta?", a: "Alle otto e un quarto. Lo carico ogni sera prima di cena e lo lascio sulla scrivania. Quando sono arrivato a tavola erano già tutti seduti.", fact: "wound" },
            { id: "who", q: "Chi sapeva che lo lascia lì?", a: "Tutti, in famiglia. È l'orologio che un giorno avevo promesso ad Alberto.", fact: "promised" }
          ]
        },
        {
          id: "lidia", name: "Lidia Ravera", role: "la nonna",
          look: "Occhiali sulla punta del naso. È il tipo di persona che nota tutto e non dice niente finché non le chiedi.",
          ask: [
            { id: "study", q: "Durante la cena è entrata nello studio?", a: "Sì, alle nove meno cinque, a prendere l'album delle foto. L'orologio non c'era già più, ma lì per lì non ci ho fatto caso.", fact: "lidia" },
            { id: "table", q: "Chi si è alzato da tavola prima di quell'ora?", a: "Solo Alberto, verso le nove meno venticinque, per una telefonata di lavoro. È tornato dopo una decina di minuti. Carla e Matteo si sono alzati più tardi. Ana andava e veniva dalla cucina, con i piatti.", fact: "onlyalberto" }
          ]
        },
        {
          id: "alberto", name: "Alberto Ravera", role: "il figlio",
          look: "Camicia buona, ma polsini consumati. Sul polso sinistro una striscia di pelle più chiara: di solito porta un orologio, stasera no.",
          lookFact: "tan",
          ask: [
            { id: "call", q: "Con chi era al telefono alle nove meno venticinque?", a: "Con un fornitore del ristorante. Guardi pure. Ti porge il telefono: l'ultima chiamata, in entrata o in uscita, è delle 18:50.", fact: "nocall" },
            { id: "rest", q: "Come va il ristorante?", a: "Benissimo. Mai andato così bene.", fact: "albfine" }
          ]
        },
        {
          id: "carla", name: "Carla Ravera", role: "la nuora",
          look: "Mani arrossate dal forno e un cerotto sull'indice: l'arrosto l'ha cucinato lei, con Ana.",
          ask: [
            { id: "before", q: "Dov'era prima di cena?", a: "In cucina con Ana dalle sette, a finire l'arrosto. Non ci siamo mai separate fino a quando ci siamo sedute.", fact: "carlaana" },
            { id: "money", q: "Come vanno davvero le cose al ristorante?", a: "Esita. Non bene. Abbiamo chiesto un prestito e non sappiamo come restituirlo. Ma Alberto non ruberebbe mai a suo padre.", fact: "debt" }
          ]
        },
        {
          id: "matteo", name: "Matteo Ravera", role: "il nipote, 19 anni",
          look: "Mastica una gomma alla menta, ma sotto si sente l'odore di fumo. Prima di rispondere guarda i genitori.",
          lookFact: "matsmell",
          ask: [
            { id: "why", q: "Perché ti sei alzato da tavola alle nove e venti?", a: "Per andare in bagno.", fact: "matsays" },
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
        lidia: "Alle 20:55 l'orologio non era più sulla scrivania.",
        onlyalberto: "Prima delle 20:55 si è alzato da tavola solo Alberto, verso le 20:35, per una telefonata.",
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
      keys: ["lidia", "onlyalberto", "nocall", "map", "wound"],
      need: 3,
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
        "Poi la finestra di tempo. L'orologio c'era alle 20:15 ed era sparito alle 20:55. In quei quaranta minuti si è alzato da tavola solo Alberto, per una telefonata che sul suo telefono non esiste. Ana non poteva arrivare allo studio senza passare davanti a tutti.",
        "Il sollecito della banca, il prestito di cui parla Carla e il «va benissimo» di Alberto dicono il perché. Matteo? Nascondeva una sigaretta, non un orologio."
      ],
      lesson: "Il primo indizio da togliere dal tavolo è il pregiudizio. E chi mente non è per forza colpevole: Matteo nascondeva solo una sigaretta."
    },

    /* ---------------------------------------------------------------- 4 */
    {
      id: "chef", level: 2, title: "Il critico a cena", place: "Ristorante Da Irene, Trieste",
      brief: [
        "Venerdì sera, al tavolo 7, c'era sotto falso nome il critico gastronomico più temuto della città. Al dessert ha assaggiato la crème brûlée, l'ha sputata nel tovagliolo e se n'è andato senza pagare: era piena di sale.",
        "Le altre undici crème brûlée della serata erano perfette. Irene, la titolare, è sicura che qualcuno l'abbia sabotata."
      ],
      budget: 14,
      scene: [
        { id: "dessert", name: "La crème brûlée del tavolo 7", text: "La crosta di zucchero è caramellata alla perfezione, intatta a parte il colpo del cucchiaino. Vicino al bordo c'è un forellino sottile che attraversa la crosta e scende nella crema.", fact: "hole" },
        { id: "trash", name: "Il cestino vicino al passe", text: "Sotto i tovaglioli usati c'è una siringa d'acciaio con un ago spesso. Dentro, qualche goccia d'acqua che sa di sale.", fact: "syringe" },
        { id: "pastry", name: "La postazione della pasticceria", text: "Le quattro siringhe da pasticceria di Lea sono al loro posto, pulite. Hanno la punta larga, per farcire: non bucherebbero mai una crosta di zucchero.", fact: "leatools" },
        { id: "meat", name: "La postazione della carne", text: "Nella valigetta degli attrezzi c'è la custodia degli iniettori per marinare la carne: tre posti, due iniettori. Manca il più grande.", fact: "meat" },
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
            { id: "plate", q: "Che cosa è successo alle 22:10?", a: "Ho caramellato la crosta, ho messo il piatto sul passe e ho suonato il campanello. Poi mi sono girata a fare i semifreddi del tavolo 3, di spalle. Mi sono voltata solo quando è arrivato Ivo: gli ho detto «vai piano, è il critico», e lui l'ha preso e l'ha portato via subito.", fact: "leaback" }
          ]
        },
        {
          id: "ivo", name: "Ivo Rakar", role: "cameriere",
          look: "Giovane, svelto, un po' sbadato: una macchia di vino sul polsino.",
          ask: [
            { id: "late", q: "Perché hai ritirato il dessert solo alle 22:14?", a: "Ero al tavolo 4, il signor Fausto voleva sapere tutto sui vini. Quando sono tornato al passe c'era Tommaso lì davanti con un grissino in mano. Ha detto che si stava «rubando la cena».", fact: "ivosaw" },
            { id: "fausto", q: "Chi è il signor Fausto?", a: "Ha un ristorante in via Cavana. Viene ogni tanto, si guarda intorno.", fact: "fausto" }
          ]
        },
        {
          id: "tommaso", name: "Tommaso Bressan", role: "secondo chef",
          look: "Avambracci pieni di piccole bruciature da griglia. Il telefono gli vibra in tasca: lo guarda e lo rimette via in fretta.",
          ask: [
            { id: "where", q: "Dov'eri tra le 22:10 e le 22:14?", a: "Alla griglia, a pulirla. Non mi sono mosso da lì.", fact: "tomsays" },
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
        meat: "Dalla valigetta della carne manca l'iniettore più grande: è la siringa del cestino.",
        window: "Il dessert del 7 è rimasto sul passe dalle 22:10 alle 22:14.",
        board: "Che al 7 ci fosse il critico lo sapeva solo la cucina (e Ivo).",
        grudge: "A settembre Tommaso non ha avuto la promozione a capo cucina.",
        leaupset: "Lea è sconvolta.",
        leaback: "Dalle 22:10 Lea lavorava di spalle al passe; alle 22:14 ha visto Ivo prendere il piatto e portarlo via subito.",
        ivosaw: "Alle 22:14 Ivo ha trovato Tommaso davanti al passe.",
        fausto: "Al tavolo 4 cenava Fausto, che ha un ristorante concorrente.",
        tomsays: "Tommaso dice di non essersi mosso dalla griglia tra le 22:10 e le 22:14.",
        tomfausto: "Tommaso dice di conoscere Fausto solo di vista.",
        offer: "Fausto ha assunto Tommaso: comincia da lui il primo del mese.",
        faustoout: "Fausto si è alzato solo alle 22:30, per il bagno, lontano dalla cucina."
      },
      culprit: "tommaso",
      keys: ["hole", "meat", "ivosaw", "tomsays", "window"],
      need: 3,
      motives: ["Il nuovo posto da Fausto: una stroncatura di Irene faceva comodo al suo nuovo capo", "Vendicarsi di Lea", "Un errore: voleva salare la carne"],
      motive: 0,
      traps: [
        { text: "Chiudere l'iniettore in una busta nell'ufficio di Irene, dire in cucina che domattina andrà al laboratorio, e restare nascosti a guardare la porta dell'ufficio.", ok: true, why: "Gli innocenti non hanno niente da temere da quella busta. Chi l'ha riempita d'acqua salata ha toccato parti che di solito nessuno tocca, e non può sapere quali tracce ha lasciato: a mezzanotte Tommaso entra in ufficio a cercarla." },
        { text: "Licenziare Lea: il dessert era suo.", ok: false, why: "Le sue siringhe non bucano la crosta, e dopo le 22:10 lavorava di spalle. Punirla vorrebbe dire lasciare in cucina chi l'ha fatto." },
        { text: "Accusare Fausto davanti a tutti.", ok: false, why: "Fausto non è mai entrato in cucina. Ha un motivo, ma senza prove un'accusa pubblica espone Irene a una denuncia per diffamazione." },
        { text: "Assaggiare tutti i dessert rimasti.", ok: false, why: "Erano perfetti: dicono che il sabotaggio era mirato, ma non chi l'ha fatto." }
      ],
      close: [
        "La crosta intatta e il forellino dicono come: il sale è stato iniettato dopo, quando il dessert era già pronto. Quindi nei quattro minuti in cui è rimasto sul passe, dalle 22:10 alle 22:14, mentre Lea lavorava di spalle e Ivo era al tavolo di Fausto.",
        "Lo strumento dice da dove: non una siringa da pasticceria, ma l'iniettore per le marinate che manca dalla postazione della carne. E alle 22:14 Ivo trova Tommaso proprio davanti al passe, mentre lui giura di non essersi mosso dalla griglia.",
        "Il perché lo dice Fausto senza volerlo: Tommaso comincia da lui il primo del mese, e una stroncatura di Irene fa comodo al nuovo capo. Il «lo conosco di vista» di Tommaso era una bugia."
      ],
      lesson: "Chiediti come prima di chiederti chi: il forellino nella crosta stringe il tempo a quattro minuti e lo strumento giusto indica la postazione."
    },

    /* ---------------------------------------------------------------- 5 */
    {
      id: "copy", level: 3, title: "La copia perfetta", place: "Museo Palazzo Doni, Firenze",
      brief: [
        "Martedì mattina la curatrice del museo, Bianca Serra, passando nella sala 4 sente odore di vernice fresca: il «Ritratto della contessa», un olio del Settecento, è stato sostituito con una copia. Ottima, ma copia.",
        "La notte prima l'allarme della sala è rimasto spento mezz'ora per una manutenzione dei sensori. Sotto osservazione ci sono Bianca, il restauratore Ottavio Landi, il custode notturno Samuele e Nina, una giovane pittrice che ogni martedì copia proprio quel ritratto."
      ],
      budget: 13,
      scene: [
        { id: "fake", name: "La copia appesa", text: "Stesse misure dell'originale, al millimetro. Sulla mano della contessa c'è una piccola macchia scura, come una bruciatura della vernice.", fact: "size" },
        { id: "back", name: "Il retro della tela", text: "La tela è antica, del Settecento, rinforzata da una seconda tela incollata dietro: una «foderatura», un lavoro da restauratori. Sul telaio, viti appena svitate e riavvitate.", fact: "canvas" },
        { id: "catalog", name: "Il catalogo della mostra", text: "La foto del ritratto in catalogo è stata scattata dopo il restauro dell'anno scorso: la mano della contessa è pulita, la macchia non c'è.", fact: "catalog" },
        { id: "report", name: "La scheda del restauro", text: "«Rimossa una bruciatura della vernice sul dorso della mano sinistra.» Firmato: Ottavio Landi, aprile dell'anno scorso.", fact: "stain" },
        { id: "easel", name: "Il cavalletto di Nina", text: "La sua copia è a metà, su una tela nuova. È più piccola dell'originale di un buon quinto.", fact: "ninacopy" },
        { id: "maint", name: "Il registro della manutenzione", text: "«Manutenzione sensori di umidità, sala 4, ore 2:10–2:40.» Richiesta dal laboratorio di restauro, approvata dalla curatrice Bianca Serra.", fact: "maint" }
      ],
      people: [
        {
          id: "bianca", name: "Bianca Serra", role: "curatrice",
          look: "Tailleur impeccabile, ma ha mangiato le unghie fino alla carne. Risponde con precisione, da manuale.",
          ask: [
            { id: "rule", q: "Che regole ci sono per i copisti come Nina?", a: "Il regolamento del museo vuole che le copie siano più piccole o più grandi dell'originale di almeno un quinto. Proprio per evitare scambi.", fact: "rule" },
            { id: "maint", q: "Perché ha approvato la manutenzione di quella notte?", a: "Me l'ha chiesta il laboratorio di restauro, per mail, come sempre. Io firmo decine di richieste così.", fact: "biancasigned" },
            { id: "lab", q: "Il laboratorio di restauro tiene tele antiche?", a: "Sì, quando si rifodera un quadro avanzano tele vecchie. Ottavio le conserva tutte: dice che prima o poi servono.", fact: "workshop" }
          ]
        },
        {
          id: "ottavio", name: "Ottavio Landi", role: "restauratore",
          look: "Dita macchiate di colore e solvente, un taglio fresco sul pollice. Mentre parliamo, sul suo telefono compare una notifica in inglese: «Delivery confirmed. Second payment Friday».",
          lookFact: "payment",
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
        size: "La copia appesa ha le stesse misure dell'originale e sulla mano ha una piccola macchia scura.",
        canvas: "La copia è dipinta su una tela del Settecento foderata: un lavoro da restauratori.",
        catalog: "Nella foto del catalogo, scattata dopo il restauro, la macchia sulla mano non c'è.",
        stain: "Quella macchia era una bruciatura che Ottavio ha tolto nel restauro dell'anno scorso.",
        ninacopy: "La copia di Nina è più piccola dell'originale di un quinto, ed è ancora sul cavalletto.",
        maint: "La notte del furto l'allarme è rimasto spento dalle 2:10 alle 2:40 per una manutenzione chiesta dal laboratorio di restauro e approvata da Bianca.",
        rule: "Le copie dei copisti devono essere di misure diverse dall'originale di almeno un quinto.",
        biancasigned: "Bianca ha approvato la manutenzione su richiesta del laboratorio, come fa sempre.",
        workshop: "Ottavio conserva le tele antiche avanzate dalle foderature.",
        payment: "Ottavio ha ricevuto un messaggio: «Delivery confirmed. Second payment Friday».",
        photos: "Le foto del ritratto prima del restauro le ha solo Ottavio, e non le ha mai date a nessuno.",
        ottaviosays: "Ottavio dice di essere stato a casa e di non aver scritto la mail della manutenzione.",
        contract: "Il museo non rinnoverà il contratto di Ottavio.",
        tube: "Alle 2:15 un uomo con un tubo porta-disegni passava nel corridoio di servizio.",
        notech: "Quella notte nessun tecnico dei sensori è venuto al museo.",
        ninapaint: "Nina ha sotto le unghie i colori del ritratto.",
        ninalive: "Nina copia dal vero, in sala, non da fotografie."
      },
      culprit: "ottavio",
      keys: ["stain", "catalog", "photos", "canvas", "workshop"],
      need: 3,
      motives: ["Soldi: un compratore privato gli paga l'originale a rate", "Coprire un errore fatto nel restauro", "Vendicarsi di Bianca"],
      motive: 0,
      traps: [
        { text: "Prima fargli raccontare, con calma e nei dettagli, chi può aver visto le sue foto di prima del restauro. Solo dopo mostrargli la macchia sulla mano della copia.", ok: true, why: "È la tecnica delle prove al momento giusto applicata a un caso: Ottavio, sicuro di sé, giura che le foto le ha solo lui. Quando vede la macchia capisce che la copia è stata dipinta proprio da quelle foto, e non ha più una versione che regga." },
        { text: "Fermare Nina: dipinge copie di quel quadro ogni martedì.", ok: false, why: "Il regolamento la obbliga a misure diverse e la sua copia è ancora sul cavalletto, più piccola di un quinto. Ed è dipinta dal vero, quindi senza la macchia tolta l'anno scorso." },
        { text: "Accusare Bianca: ha firmato lei la manutenzione.", ok: false, why: "Firma decine di richieste. Non ha le tele antiche, non sa foderare un quadro e non ha le foto di prima del restauro." },
        { text: "Esaminare la copia con i raggi X e aspettare il risultato.", ok: false, why: "Direbbe quello che si sa già, che è una copia. Non dice chi l'ha dipinta." }
      ],
      close: [
        "Il dettaglio decisivo è una macchia. Sulla copia, la mano della contessa ha una bruciatura che nel quadro vero non c'è più da un anno: Ottavio l'ha tolta durante il restauro. Chi ha dipinto la copia non stava guardando il quadro com'è oggi, e nemmeno il catalogo, dove la mano è pulita. Copiava da foto di prima del restauro.",
        "Quelle foto le ha solo Ottavio, lo ha detto lui. La tela antica foderata viene dal tipo di scorte che conserva lui. La mail della manutenzione parte dal suo laboratorio, il tecnico dei sensori non è mai arrivato, e alle 2:15 un uomo porta un quadro arrotolato in un tubo da disegni.",
        "Nina era la sospettata perfetta, e proprio per questo era una pista falsa: copia dal vero, e la sua tela è più piccola, come vuole il regolamento. Il messaggio sul telefono di Ottavio dice il resto: «secondo pagamento venerdì»."
      ],
      lesson: "A volte la prova è un dettaglio che non dovrebbe esserci: la copia conteneva un errore che solo una persona al mondo poteva conoscere."
    },

    /* ---------------------------------------------------------------- 6 */
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
            { id: "fight", q: "Ieri sera lei e Arturo avete litigato?", a: "Sì, a cena, per una vendita di quote. Abbiamo alzato la voce. Ma litighiamo da trent'anni: siamo soci, non nemici.", fact: "argue" },
            { id: "heard", q: "Stanotte ha sentito qualcosa?", a: "La mia camera è sopra la terrazza. Ero al telefono con mia moglie, a Milano, da mezzanotte. Verso mezzanotte e mezza ho sentito un colpo sordo, poi per un bel po' acqua che scorreva, come un secchio, una pompa. Ho pensato al giardiniere. Ecco il registro delle chiamate: da 0:01 a 0:47.", fact: "heard" }
          ]
        },
        {
          id: "marta", name: "Marta Galli", role: "governante",
          look: "Sguardo fermo, mani grandi da lavoro. È l'unica in casa che non ha pianto, ma ha preparato il caffè a tutti.",
          ask: [
            { id: "glasses", q: "Arturo vedeva bene senza occhiali?", a: "Senza occhiali non vedeva a un metro. Se li toglieva solo per dormire, e li metteva sul comodino. Mai nel taschino.", fact: "nosight" },
            { id: "bleach", q: "La candeggina in lavanderia era già aperta?", a: "No. L'ho comprata giovedì, era piena e sigillata. E io la scala non la lavo: la pulisce l'impresa, il martedì.", fact: "marta" },
            { id: "dinner", q: "Cosa si è detto a cena?", a: "Il signor Arturo ha detto a Edoardo, davanti a tutti: «Lunedì vado dal notaio. Così impari a lavorare.» Edoardo è uscito dalla sala senza finire.", fact: "knew" }
          ]
        },
        {
          id: "luca", name: "Luca, al telefono", role: "amico di Edoardo, in videochiamata",
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
        twoglasses: "In terrazza ci sono due bicchieri di whisky, uno con il rossetto.",
        bucket: "In lavanderia, un secchio umido e la candeggina mezza vuota.",
        will: "Arturo stava per cambiare testamento a favore di una fondazione: lunedì aveva il notaio.",
        liviapills: "Livia prende un sonnifero tutte le sere.",
        liviasays: "Livia dice di aver bevuto un whisky con Arturo alle 22 e di essere andata a letto alle 23.",
        liviaok: "Con il nuovo testamento Livia teneva comunque la casa.",
        shoes: "I mocassini di Edoardo hanno macchie sbiadite sulla punta, come gocce di candeggina.",
        edosays: "Edoardo dice di aver giocato online in camera fino alle due senza alzarsi mai.",
        heir: "Nel testamento in vigore Edoardo è l'erede principale.",
        argue: "A cena Ruggero e Arturo hanno litigato per una vendita di quote.",
        heard: "Verso le 0:30 Ruggero ha sentito un colpo sordo e poi a lungo acqua che scorreva.",
        nosight: "Senza occhiali Arturo non vedeva a un metro: li toglieva solo per dormire.",
        marta: "La candeggina era piena e sigillata da giovedì, e la scala non la lava nessuno di casa.",
        knew: "A cena Arturo ha detto a Edoardo, davanti a tutti, che lunedì andava dal notaio.",
        afk: "Il personaggio di Edoardo è rimasto «inattivo» dalle 0:10 alle 0:50."
      },
      culprit: "edoardo",
      keys: ["afk", "edosays", "shoes", "bleach", "heard", "knew"],
      need: 3,
      motives: ["Il nuovo testamento: stava per perdere l'eredità", "Una lite d'affari", "La gelosia"],
      motive: 0,
      traps: [
        { text: "Dire a tutti che domattina i carabinieri ritireranno le scarpe di ognuno per un controllo, e passare la notte a guardare la riva del lago.", ok: true, why: "Le scarpe di Livia, Ruggero e Marta non dicono niente, e loro lo sanno. Edoardo sa che sui suoi mocassini c'è la candeggina della scala: alle tre di notte scende al pontile per buttarli nel lago." },
        { text: "Chiudere come incidente: la scala era bagnata.", ok: false, why: "Era bagnata di candeggina, in una notte senza pioggia, e qualcuno l'ha versata dopo il colpo sentito da Ruggero." },
        { text: "Accusare Livia: eredita, e in terrazza c'è il suo bicchiere.", ok: false, why: "Il bicchiere è delle dieci, come dice lei. E con il nuovo testamento non perdeva niente: il nuovo testamento era un motivo per Edoardo, non per lei." },
        { text: "Mettere sotto pressione Ruggero: ha litigato con Arturo.", ok: false, why: "Litigare non è un indizio di colpa. E alle 0:30 era al telefono con la moglie: per questo può raccontare il colpo e l'acqua." }
      ],
      close: [
        "Prima domanda: è davvero un incidente? Arturo, che senza occhiali non vedeva a un metro, li aveva piegati nel taschino. Le luci della scala erano spente. E i gradini erano bagnati di candeggina in una notte senza pioggia. Nessuno scende una scala di pietra al buio e senza vederci: questa è una scena preparata.",
        "Poi il tempo. Alle 0:30 Ruggero, al telefono con la moglie, sente un colpo e poi a lungo acqua che scorre: qualcuno lava la scala dopo la caduta. Il personaggio di Edoardo è «inattivo» dalle 0:10 alle 0:50, mentre lui giura di non essersi mai alzato. E sui suoi mocassini ci sono gocce di candeggina.",
        "Il perché lo dice Arturo stesso, a cena: lunedì il notaio. Con il nuovo testamento Edoardo perdeva quasi tutto. Livia e Ruggero avevano l'aria dei colpevoli da televisione; i fatti indicavano un'altra persona."
      ],
      lesson: "Prima di chiederti chi, chiediti se la scena è vera. Un incidente non lava la scala dopo essere successo."
    }
  ];

  const api = { CASES };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MentalistCases = api;
})(typeof window !== "undefined" ? window : globalThis);
