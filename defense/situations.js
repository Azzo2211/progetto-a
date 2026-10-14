/*
 * Progetto A - Difesa: situazioni decisionali (6 categorie, 3 livelli).
 * Ogni opzione ha un voto: 2 la migliore, 1 accettabile, 0 sbagliata.
 * Le note legali citano le fonti (campo sources). Schema in tests/defense.test.js.
 */
window.DefenseSituations = [
  {
    "id": "prev-parcheggio-borse",
    "category": "prevenzione",
    "level": 1,
    "title": "Il parcheggio del supermercato alle 21",
    "text": "Esci dal supermercato alle 21 con due borse pesanti. La tua auto è in fondo al parcheggio, a circa 80 metri, in una zona poco illuminata. Hai il telefono in mano perché stai rispondendo a un messaggio di lavoro e le chiavi sono in fondo alla tasca della giacca.",
    "question": "Cosa fai prima di avviarti?",
    "seconds": 14,
    "options": [
      {
        "text": "Metto via il telefono, prendo le chiavi in mano e attraverso guardandomi intorno.",
        "score": 2,
        "note": "Mani libere, occhi alzati e chiavi pronte: arrivi all'auto senza fermarti a frugare nelle tasche al buio, che è il momento in cui sei più distratto."
      },
      {
        "text": "Torno dentro e chiedo a un addetto se può accompagnarmi fino all'auto, per sicurezza.",
        "score": 1,
        "note": "Non è sbagliato e in certi casi è la scelta giusta, ma qui non c'è nessun segnale di pericolo: bastano attenzione e chiavi pronte. Tienila per quando qualcosa non ti torna."
      },
      {
        "text": "Finisco di scrivere il messaggio mentre cammino, così una volta in auto riparto subito.",
        "score": 0,
        "note": "Sembra efficiente, ma per 80 metri non vedi chi c'è tra le auto. Chi cerca un bersaglio sceglie proprio chi cammina a testa bassa sullo schermo."
      },
      {
        "text": "Arrivato all'auto carico le borse con calma e rispondo al messaggio a portiera aperta.",
        "score": 0,
        "note": "Il tempo passato fermo accanto all'auto aperta, con le mani occupate, è quello in cui sei più esposto. Prima entri e chiudi, poi sistemi il resto o rispondi."
      }
    ],
    "principle": "Telefono in tasca e chiavi in mano: in auto si entra, si chiude e poi si pensa al resto."
  },
  {
    "id": "prev-citofono-tecnico",
    "category": "prevenzione",
    "level": 1,
    "title": "Il finto tecnico al citofono",
    "text": "Sono le 19:30, sei a casa a Soresina. Suona il citofono: un uomo dice di essere della società del gas e di dover controllare subito il contatore per una perdita in zona. Non hai ricevuto nessun avviso. Dalla telecamera vedi una pettorina arancione e una cartellina.",
    "question": "Cosa fai?",
    "seconds": 14,
    "options": [
      {
        "text": "Non apro e gli dico che chiamo io la società al numero scritto sulla bolletta.",
        "score": 2,
        "note": "Il numero lo scegli tu, da una fonte che hai già in casa. Se il controllo è vero, il tecnico tornerà con un appuntamento; se è falso, la porta è rimasta chiusa."
      },
      {
        "text": "Gli chiedo di mostrare il tesserino alla telecamera prima di decidere.",
        "score": 1,
        "note": "Meglio che aprire subito, ma un tesserino si stampa in dieci minuti e da solo non dimostra niente. La verifica vera è la telefonata al numero ufficiale."
      },
      {
        "text": "Gli chiedo un numero di telefono dell'azienda e lo chiamo subito per verificare.",
        "score": 0,
        "note": "Sembra prudente, ma il numero che ti dà lui può portarti a un complice che conferma tutto. Vale solo il numero che trovi tu, sulla bolletta o sul sito ufficiale."
      },
      {
        "text": "Apro, ma lo accompagno io al contatore e non lo perdo di vista neanche un secondo.",
        "score": 0,
        "note": "Una volta che è in casa, il controllo è suo: basta un attimo di distrazione, tua o di chi vive con te, e non sai più cosa succede nelle altre stanze."
      }
    ],
    "principle": "Chi suona senza preavviso si verifica a porta chiusa, con un numero trovato da te.",
    "sources": [
      {
        "label": "Consigli dei Carabinieri contro le truffe (Sky TG24, 2026)",
        "url": "https://tg24.sky.it/cronaca/2026/01/05/truffe-anziani-consigli-carabinieri"
      }
    ]
  },
  {
    "id": "prev-passi-dietro",
    "category": "prevenzione",
    "level": 2,
    "title": "Gli stessi passi da due incroci",
    "text": "Sono le 23:30, torni a piedi all'auto dopo una cena in zona Porta Venezia, a Milano. Lo stesso uomo che era fuori dal ristorante ti è dietro da due incroci, a una ventina di metri, e ha girato anche lui due volte. La via è quasi vuota; 50 metri più avanti c'è un bar ancora aperto con gente dentro.",
    "question": "Cosa fai?",
    "seconds": 17,
    "options": [
      {
        "text": "Entro nel bar, mi metto al bancone e guardo se passa oltre o resta fuori.",
        "score": 2,
        "note": "Ti metti tra luci e persone senza affrontarlo e intanto raccogli l'indizio che ti manca: se tira dritto era un caso, se aspetta fuori chiedi aiuto al barista o chiami il 112."
      },
      {
        "text": "Attraverso la strada e rallento, per vedere se cambia lato anche lui.",
        "score": 1,
        "note": "È un buon test per capire se ti segue davvero, ma in una via vuota resti solo con il dubbio. Con un bar aperto a 50 metri, conviene fare il test lì dentro."
      },
      {
        "text": "Accelero verso l'auto, salgo, chiudo le portiere e parto senza guardarmi indietro.",
        "score": 0,
        "note": "Se ti segue davvero, lo porti dove sei più vulnerabile: una via buia, le chiavi da cercare, la portiera da aprire. E intanto non sai più dov'è lui."
      },
      {
        "text": "Mi fermo, mi giro verso di lui e gli chiedo se ha bisogno di qualcosa.",
        "score": 0,
        "note": "Fargli capire che l'hai notato può bastare con un'occhiata, ma fermarti a parlargli in una via vuota lo fa avvicinare. Se ha cattive intenzioni, gli hai appena offerto il contatto."
      }
    ],
    "principle": "Se pensi di essere seguito, vai dove ci sono luce e persone: lì il dubbio si scioglie."
  },
  {
    "id": "prev-giacarta-taxi",
    "category": "prevenzione",
    "level": 2,
    "title": "Il taxi offerto agli arrivi di Giacarta",
    "text": "Atterri a Soekarno-Hatta alle 23:40, stanco dopo il volo. Agli arrivi un uomo con un badge al collo ti affianca: «Taxi, Pak? Prezzo fisso, la macchina è al parcheggio». Ha già una mano sul tuo carrello e dice che la fila dei Blue Bird è lunghissima. Lo stand ufficiale dei taxi è poco più avanti.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Tengo la mano sul carrello, dico «No, grazie» e prendo il taxi allo stand o con l'app.",
        "score": 2,
        "note": "Il personale Blue Bird vero non cerca clienti lontano dal suo stand. Taxi ufficiale o app che traccia il viaggio: di notte, appena arrivato, il canale conta più dei minuti risparmiati."
      },
      {
        "text": "Gli chiedo di mostrarmi bene il badge e, se è in regola, lo seguo al parcheggio.",
        "score": 0,
        "note": "Un badge al collo non dimostra niente: esistono perfino taxi che imitano quelli ufficiali. Chi lavora davvero per le compagnie riconosciute non ti viene a cercare tra la folla."
      },
      {
        "text": "Tratto sul prezzo: se scende sotto la tariffa del taxi, accetto e risparmio.",
        "score": 0,
        "note": "Il problema non è il prezzo ma l'auto: non registrata, senza tracciamento, di notte. Quello che risparmi non vale il rischio di salire su un'auto di cui non sai nulla."
      },
      {
        "text": "Per gentilezza lo lascio spingere il carrello fino all'uscita, poi rifiuto con una mancia.",
        "score": 0,
        "note": "La cortesia è comprensibile, ma intanto i bagagli sono in mano a lui e ti porta dove vuole. Più a lungo resta con te, più diventa difficile dire di no."
      }
    ],
    "principle": "In aeroporto il taxi si prende allo stand ufficiale o in app: chi ti viene a cercare non è un servizio.",
    "sources": [
      {
        "label": "Smartraveller, Indonesia (Governo australiano)",
        "url": "https://www.smartraveller.gov.au/destinations/asia/indonesia"
      },
      {
        "label": "Travel advice Indonesia (Governo del Canada)",
        "url": "https://travel.gc.ca/destinations/indonesia"
      },
      {
        "label": "ACICIS, arrivo a Soekarno-Hatta",
        "url": "https://www.landing.acicis.edu.au/faq-items/arriving-at-soekarno-hatta-airport/"
      }
    ]
  },
  {
    "id": "prev-indicazioni-due",
    "category": "prevenzione",
    "level": 3,
    "title": "La richiesta di indicazioni che si stringe",
    "text": "Sono le 19, stai andando al parcheggio vicino alla stazione di Cremona. Un uomo sui quarant'anni, gentile, ti chiede la strada per l'ospedale con il telefono in mano e mentre parla si avvicina: ora è a un metro. Con la coda dell'occhio vedi un secondo uomo che arriva dal tuo lato sinistro, senza fretta.",
    "question": "Cosa fai?",
    "seconds": 20,
    "options": [
      {
        "text": "Rispondo, ma faccio un passo indietro e di lato per averli tutti e due davanti.",
        "score": 2,
        "note": "Non tratti da ladro chi forse chiede solo una strada, ma ti riprendi distanza e visuale. Se il secondo ha un motivo innocente tira dritto; se si stringe ancora, lo vedi subito e te ne vai."
      },
      {
        "text": "Dico «Mi spiace, non sono di qui» e proseguo verso il parcheggio senza fermarmi.",
        "score": 1,
        "note": "Ti toglie dalla situazione ed è una scelta difendibile. Però riparti con il secondo uomo alle spalle senza averlo guardato: meglio prima riprendere visuale."
      },
      {
        "text": "Mi avvicino al suo telefono per guardare meglio la mappa che mi sta mostrando.",
        "score": 0,
        "note": "È il gesto più naturale ed è proprio il problema: testa bassa sullo schermo, lui a pochi centimetri, il secondo fuori dalla tua vista. Così funzionano molti borseggi in coppia."
      },
      {
        "text": "Gli dico a voce alta di stare indietro e alzo le mani in guardia davanti al viso.",
        "score": 0,
        "note": "Se è davvero una richiesta di strada, hai creato una scena per niente; se non lo è, hai mostrato tensione restando fermo dove sei. Spazio e visuale si recuperano senza alzare i toni."
      }
    ],
    "principle": "Si può essere gentili e prudenti insieme: rispondi pure, ma con distanza e tutti davanti agli occhi."
  },
  {
    "id": "prev-auto-che-segue",
    "category": "prevenzione",
    "level": 3,
    "title": "Un'auto dietro di te fino in paese",
    "text": "Torni a Soresina in auto alle 23:30 dopo una cena a Milano. Un'auto scura ti sta dietro da una ventina di chilometri e, quando lasci la provinciale per entrare in paese, gira anche lei. Potrebbe essere qualcuno che abita in zona. Casa tua è a due minuti, con il cancello automatico.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Tiro dritto oltre casa e faccio un giro dell'isolato per vedere se mi segue.",
        "score": 2,
        "note": "Hai la risposta senza esporti: chi va per la sua strada sparisce al primo giro. Se ti segue ancora, vai verso un posto illuminato e chiama il 112 con targa e direzione."
      },
      {
        "text": "Chiamo subito il 112 in vivavoce e dico che un'auto mi segue da Milano.",
        "score": 1,
        "note": "Non è sbagliato, ma con quello che sai potrebbe essere un vicino. Prima fai la prova del giro: se ti segue ancora, la chiamata sarà più precisa e più utile."
      },
      {
        "text": "Vado dritto a casa, apro il cancello col telecomando ed entro più veloce che posso.",
        "score": 0,
        "note": "Se ti stava davvero seguendo, ora sa dove abiti. E mentre il cancello si apre lento sei fermo, in un passaggio stretto, con lui alle spalle."
      },
      {
        "text": "Accosto in una via laterale e mi fermo per farlo passare e vedere chi è.",
        "score": 0,
        "note": "Accostare da solo in una via laterale, di notte, ti lascia immobile proprio accanto a lui. Se vuoi farlo passare, fallo dove c'è luce e c'è gente."
      }
    ],
    "principle": "Se un'auto ti segue, non portarla a casa: un giro in più ti dice se è un caso."
  },
  {
    "id": "conf-birra-rovesciata",
    "category": "confini",
    "level": 1,
    "title": "La birra rovesciata al bancone",
    "text": "Venerdì, 23:30, bar affollato sui Navigli. Un uomo visibilmente ubriaco ti urta, ti rovescia mezza birra sulla camicia e poi ti punta il dito: «Guarda dove vai». È a mezzo metro, alza la voce, i suoi due amici ridono. I tuoi amici sono al tavolo in fondo al locale.",
    "question": "Cosa fai?",
    "seconds": 14,
    "options": [
      {
        "text": "Dico «Tranquillo, capita» con tono basso e vado a raggiungere i miei amici al tavolo.",
        "score": 2,
        "note": "Gli dai la frase di chiusura che cerca e ti togli dal suo raggio. Con un ubriaco davanti ai suoi amici, ogni secondo in più al bancone è un'occasione per peggiorare."
      },
      {
        "text": "Gli offro un'altra birra per chiudere la questione con un sorriso.",
        "score": 1,
        "note": "Spesso calma le acque, ma ti tiene accanto a lui mentre aspettate al bancone. Con chi ha bevuto troppo, meno tempo insieme vale più di un gesto gentile."
      },
      {
        "text": "Gli faccio notare con calma che è stato lui a urtarmi e che mi deve una birra.",
        "score": 0,
        "note": "Hai ragione, ma la ragione non interessa a chi è ubriaco e ha un pubblico. Correggerlo davanti agli amici gli dà un motivo in più per non cedere."
      },
      {
        "text": "Lo ignoro, gli giro le spalle e continuo a parlare con il barista.",
        "score": 0,
        "note": "Ignorarlo a mezzo metro dandogli la schiena può suonargli come un insulto, e non vedi cosa fa. Se esci dalla scena, fallo spostandoti, non restando lì girato."
      }
    ],
    "principle": "Una frase che chiude e un passo per andartene valgono più di avere ragione."
  },
  {
    "id": "conf-semaforo-lite",
    "category": "confini",
    "level": 1,
    "title": "L'automobilista che scende al semaforo",
    "text": "Ore 18, viale trafficato a Milano. L'auto dietro di te suona da un minuto: forse poco fa hai cambiato corsia senza freccia. Al rosso l'autista scende e viene verso il tuo finestrino gridando. I finestrini sono mezzi abbassati, davanti hai un'auto ferma e il verde scatta tra pochi secondi.",
    "question": "Cosa fai?",
    "seconds": 15,
    "options": [
      {
        "text": "Chiudo portiere e finestrini, alzo una mano in segno di scuse e non rispondo.",
        "score": 2,
        "note": "Il vetro chiuso ti protegge e la mano alzata gli dà le scuse che cerca senza aprire una discussione. Al verde riparti normalmente; se ti blocca e insiste, chiami il 112."
      },
      {
        "text": "Abbasso del tutto il finestrino e gli chiedo scusa a voce per il cambio di corsia.",
        "score": 1,
        "note": "Scusarsi è giusto e spesso basta, ma il finestrino aperto lo mette a un braccio da te. Le stesse scuse arrivano anche da dietro il vetro, con un gesto."
      },
      {
        "text": "Scendo anch'io, così ne parliamo in faccia da persone adulte.",
        "score": 0,
        "note": "Fuori dall'auto perdi l'unico vantaggio che hai e diventate due persone arrabbiate in mezzo alla strada. È così che una lite da clacson finisce in rissa."
      },
      {
        "text": "Gli rispondo a gesti da dietro il vetro: è lui che suona da un minuto.",
        "score": 0,
        "note": "Dietro il vetro sembra innocuo, ma un gesto di sfida trasforma il suo nervosismo in una questione personale. E al prossimo semaforo potrebbe essere ancora dietro di te."
      }
    ],
    "principle": "In auto, vetro chiuso e una mano alzata in segno di scuse chiudono più liti di qualsiasi frase."
  },
  {
    "id": "conf-metro-molestie",
    "category": "confini",
    "level": 2,
    "title": "Le battute pesanti in metropolitana",
    "text": "Metro M2, ore 22, vagone semivuoto. Un uomo sui cinquant'anni si siede accanto a una ragazza e le fa commenti pesanti sul suo aspetto; lei fissa il telefono, si stringe verso il finestrino e ti lancia un'occhiata. Lui non l'ha toccata. Tu sei in piedi a tre metri, mancano due fermate alla tua.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Mi avvicino e chiedo a lei «Scusa, sai che ore sono?», poi resto lì a parlarle.",
        "score": 2,
        "note": "Rompi la scena senza sfidarlo: lei ha un appiglio per alzarsi o cambiare posto, lui perde il suo pubblico. Se insiste, sei già lì e alla fermata puoi avvisare il personale."
      },
      {
        "text": "Resto dove sono e la tengo d'occhio, pronto a intervenire se lui la tocca.",
        "score": 1,
        "note": "Stare attento conta, ma aspettare che la tocchi la lascia sola con il problema fino a quel momento. Un'interruzione leggera adesso è più utile di un intervento dopo."
      },
      {
        "text": "Vado da lui e gli dico a voce alta di lasciarla in pace o lo faccio scendere io.",
        "score": 0,
        "note": "Il coraggio c'è, ma la minaccia sposta lo scontro su di te e può far salire la tensione anche verso di lei. Lo scopo è proteggerla, non vincere una sfida con lui."
      },
      {
        "text": "Faccio finta di niente: non l'ha toccata, e intervenire potrebbe peggiorare le cose.",
        "score": 0,
        "note": "È la reazione più comune, tra imbarazzo e paura di sbagliare. Ma il suo sguardo era una richiesta d'aiuto, e basta pochissimo per cambiare la situazione senza rischi."
      }
    ],
    "principle": "Per aiutare non serve affrontare: spesso basta interrompere la scena e restare vicino."
  },
  {
    "id": "conf-cantiere-fatture",
    "category": "confini",
    "level": 2,
    "title": "Il posatore furioso in cantiere",
    "text": "Ore 8, ufficio di cantiere a Lodi. Un posatore di una ditta in subappalto entra e urla che da due mesi non gli pagate le fatture; ti punta il dito a un palmo dal viso, rosso in volto. Non ha niente in mano. Tra voi c'è un tavolo, alle sue spalle la porta aperta e due operai che guardano.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "A voce bassa gli dico che lo capisco e propongo di vedere le fatture insieme alle 9.",
        "score": 2,
        "note": "Riconoscere la rabbia e dargli un passo concreto gli toglie il motivo di urlare. Il tuo tono basso tira giù anche il suo, e il tavolo tra voi lascia lo spazio che serve."
      },
      {
        "text": "Gli dico con fermezza che così non si parla e che torni quando si sarà calmato.",
        "score": 1,
        "note": "Il confine è giusto, ma detto così, davanti agli operai, suona come un ordine e può umiliarlo. Un confine funziona meglio se arriva insieme a una via d'uscita."
      },
      {
        "text": "Alzo la voce anch'io: davanti ai miei operai non posso farmi trattare in questo modo.",
        "score": 0,
        "note": "È l'istinto di non perdere la faccia, ma due voci alte si alimentano a vicenda. In quella stanza chi resta calmo è quello che ne esce con più autorità."
      },
      {
        "text": "Giro intorno al tavolo e gli metto una mano sulla spalla per calmarlo un po'.",
        "score": 0,
        "note": "Nelle intenzioni è un gesto amichevole, ma toccare chi è furioso può essere letto come una sfida. Il tavolo in mezzo è un vantaggio: tienilo."
      }
    ],
    "principle": "Con chi urla per un torto: voce bassa, riconosci il problema, proponi un passo concreto."
  },
  {
    "id": "conf-amico-ha-cominciato",
    "category": "confini",
    "level": 3,
    "title": "L'amico che ha cominciato lui",
    "text": "Pub a Cremona, mezzanotte. Il tuo amico Luca ha bevuto e ha insultato pesantemente un ragazzo per una battuta sulla sua squadra. Ora il ragazzo e un suo amico sono in piedi davanti a Luca e gli chiedono di scusarsi; Luca si toglie la giacca e dice «Andiamo fuori». Tutti e tre si girano verso di te.",
    "question": "Cosa fai?",
    "seconds": 20,
    "options": [
      {
        "text": "Mi metto davanti a Luca: «Scusate, ha bevuto, ce ne andiamo», e lo porto via.",
        "score": 2,
        "note": "Ha torto lui, e saperlo ti indica la mossa giusta: scuse al posto suo e uscita. Gli altri ottengono quello che chiedevano e Luca non deve perdere la faccia da solo."
      },
      {
        "text": "Chiedo subito al barista di intervenire prima che escano a regolare i conti.",
        "score": 1,
        "note": "Coinvolgere il personale è sensato, ma mentre aspetti la tensione sale. Tu sei l'unico che Luca forse ascolta: la mossa più rapida è portarlo via tu."
      },
      {
        "text": "Sto dalla parte di Luca: è mio amico e non lo lascio da solo contro quei due.",
        "score": 0,
        "note": "Lealtà comprensibile, ma così trasformi un suo torto in una rissa due contro due. Difendere a ogni costo un amico che ha cominciato vi mette entrambi dalla parte sbagliata."
      },
      {
        "text": "Dico agli altri che stanno esagerando: era solo una battuta sul calcio.",
        "score": 0,
        "note": "Minimizzare l'insulto dà loro un motivo in più per arrabbiarsi. Hanno chiesto delle scuse: negarle è la strada più breve per finire fuori dal locale a spintoni."
      }
    ],
    "principle": "Se ha torto il tuo amico, aiutarlo vuol dire scusarsi al posto suo e portarlo via."
  },
  {
    "id": "conf-scherzo-pesante",
    "category": "confini",
    "level": 3,
    "title": "Lo scherzo che diventa sfida",
    "text": "Festa di matrimonio, l'una di notte. Un invitato che non conosci, alticcio, ti dà pacche sulla spalla sempre più forti e davanti a tutti dice ridendo: «Dai, braccio di ferro, o hai paura?». Gli altri al tavolo sorridono, qualcuno lo incoraggia. Non capisci se scherza o se cerca davvero lo scontro.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Sorrido, dico «Stasera passo, campione» e vado al bar con un amico.",
        "score": 2,
        "note": "Una battuta leggera chiude il gioco senza umiliarlo e senza accettare la sfida. Se era uno scherzo resta uno scherzo; se cercava lo scontro, non trova appigli."
      },
      {
        "text": "Gli dico con tono secco di smetterla con le pacche e di non toccarmi più.",
        "score": 1,
        "note": "Il confine è legittimo e, se le pacche continuano, va detto. Ma secco e davanti a tutti lo mette all'angolo: prima prova con una battuta che lasci uscire entrambi."
      },
      {
        "text": "Accetto il braccio di ferro, così la chiudiamo in fretta tra le risate.",
        "score": 0,
        "note": "Sembra il modo di chiuderla ridendo, ma accetti il suo gioco: se perdi rilancia, se vinci si sente umiliato davanti a tutti. Con chi ha bevuto è il primo passo verso lo scontro."
      },
      {
        "text": "Gli restituisco una pacca altrettanto forte, ridendo anch'io.",
        "score": 0,
        "note": "Sembra stare al gioco, ma alzi il livello fisico con qualcuno che sta già testando i limiti. Da una pacca a una spinta il passo è breve, soprattutto a quell'ora."
      }
    ],
    "principle": "Davanti a una sfida ambigua, una battuta che chiude il gioco ti fa uscire senza perdere la faccia."
  },
  {
    "id": "fuga-fumo-pizzeria",
    "category": "fuga",
    "level": 1,
    "title": "Fumo nero in pizzeria",
    "text": "Sabato sera, pizzeria affollata su due sale. Dalla cucina esce fumo nero e scatta l'allarme; quasi tutti si alzano e spingono verso l'ingresso principale, da cui siete entrati, dove si forma un tappo. A cinque metri dal tuo tavolo c'è una porta con il cartello verde di uscita di emergenza.",
    "question": "Cosa fai?",
    "seconds": 13,
    "options": [
      {
        "text": "Vado subito verso l'uscita di emergenza vicina, chiamando gli altri del tavolo.",
        "score": 2,
        "note": "In un'emergenza la folla torna da dove è entrata, anche se c'è un'uscita più vicina. Quella porta a cinque metri è libera proprio perché nessuno la guarda."
      },
      {
        "text": "Mi abbasso sotto il fumo e seguo la parete fino all'ingresso principale del locale.",
        "score": 1,
        "note": "Stare bassi sotto il fumo è giusto, ma così vai verso il tappo di gente. Il gesto è buono, la direzione no."
      },
      {
        "text": "Seguo la folla verso l'ingresso principale: se vanno tutti lì, sarà la strada giusta.",
        "score": 0,
        "note": "È l'istinto più forte e il più pericoloso: la folla segue l'abitudine, non l'uscita migliore. Davanti a un tappo, ogni secondo in coda pesa."
      },
      {
        "text": "Prendo giacca, telefono e portafoglio dalla sedia prima di muovermi.",
        "score": 0,
        "note": "Sembrano pochi secondi, ma con il fumo nero sono proprio quelli che decidono. Giacca e telefono si ricomprano, il tempo perso no."
      }
    ],
    "principle": "Appena entri in un locale guarda le uscite: in emergenza la folla torna solo da dove è entrata."
  },
  {
    "id": "fuga-ascensore-garage",
    "category": "fuga",
    "level": 1,
    "title": "L'ascensore del garage a mezzanotte",
    "text": "Mezzanotte, garage sotterraneo di un hotel a Milano. Chiami l'ascensore per salire al quarto piano. Le porte si aprono: dentro c'è un uomo che borbotta da solo, barcolla un po' e ti fissa senza dire niente. Non preme nessun pulsante e non accenna a uscire.",
    "question": "Cosa fai?",
    "seconds": 13,
    "options": [
      {
        "text": "Gli dico «Vada pure, aspetto il prossimo» e lascio chiudere le porte.",
        "score": 2,
        "note": "Due minuti di attesa costano meno di quattro piani chiuso in uno spazio stretto con chi non ti convince. E nessuno si offende davvero per un ascensore lasciato andare."
      },
      {
        "text": "Entro, ma mi metto accanto ai pulsanti, girato verso di lui e pronto a scendere.",
        "score": 1,
        "note": "Se proprio entri, è la posizione migliore: controlli le porte e lo vedi. Ma resta un rischio che potevi evitare con due minuti di attesa."
      },
      {
        "text": "Entro per non sembrare scortese: in fondo sono solo quattro piani.",
        "score": 0,
        "note": "È l'imbarazzo che decide al posto tuo. Il disagio di aspettare l'ascensore successivo dura due secondi; quello di trovarti chiuso con lui no."
      },
      {
        "text": "Entro e guardo il telefono, così evito di incrociare il suo sguardo per tutto il tragitto.",
        "score": 0,
        "note": "Abbassare gli occhi sembra un modo per non provocarlo, ma ti toglie l'unico controllo che hai: vedere cosa fa a un metro da te, a porte chiuse."
      }
    ],
    "principle": "Se chi è in ascensore non ti convince, non entrare: aspettare il prossimo costa due minuti."
  },
  {
    "id": "fuga-spalle-al-muro",
    "category": "fuga",
    "level": 2,
    "title": "Spalle alla saracinesca",
    "text": "Ore 21, marciapiede stretto davanti a un negozio chiuso. Un uomo ti accusa di avergli graffiato l'auto parcheggiata, ti urla contro e avanza finché hai la saracinesca alle spalle. È a un metro e mezzo, a mani vuote. Alla tua sinistra il marciapiede si allarga verso una fermata del bus con alcune persone.",
    "question": "Cosa fai?",
    "seconds": 17,
    "options": [
      {
        "text": "Mani aperte davanti al petto, «Ok, ok», e scivolo di lato verso la fermata.",
        "score": 2,
        "note": "Le mani aperte calmano e insieme proteggono; il passo laterale ti toglie dall'angolo senza girargli le spalle. Vicino alla fermata hai testimoni e spazio per andartene."
      },
      {
        "text": "Resto fermo con le mani aperte davanti a me e cerco di calmarlo a parole.",
        "score": 1,
        "note": "Mani e parole vanno bene, ma con la saracinesca alle spalle resti senza spazio se lui avanza ancora. Calmalo mentre ti sposti, non al posto di spostarti."
      },
      {
        "text": "Lo spingo indietro con decisione per liberarmi lo spazio davanti e passare.",
        "score": 0,
        "note": "Toccarlo per primo, mentre è a mani vuote e a un metro e mezzo, trasforma una lite a parole in una colluttazione. E agli occhi di chi guarda sei tu ad aver cominciato."
      },
      {
        "text": "Gli dico che non ho toccato niente e che chiamo i vigili per dimostrarglielo.",
        "score": 0,
        "note": "Discutere del graffio schiacciato contro la saracinesca lo tiene lì davanti a te a parlare del suo torto. Prima esci dall'angolo, poi, a distanza, si chiariscono i fatti."
      }
    ],
    "principle": "Con le spalle al muro: mani aperte, voce calma e intanto un passo di lato verso le persone."
  },
  {
    "id": "fuga-folla-piazza",
    "category": "fuga",
    "level": 2,
    "title": "L'ondata di folla al concerto in piazza",
    "text": "Concerto gratuito in piazza, ore 22, migliaia di persone. All'improvviso da dietro arriva una spinta forte e la folla ondeggia in avanti; qualcuno grida e ti cade il telefono. Sei con la tua compagna, più bassa di te, che fatica a respirare. A una ventina di metri in diagonale la folla si dirada verso una via laterale.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "La tengo per mano, assecondiamo la spinta e nelle pause ci spostiamo in diagonale.",
        "score": 2,
        "note": "Assecondare la spinta vi tiene in equilibrio; muovervi in diagonale nelle pause vi porta dove la folla si dirada. Con le mani unite non vi perdete."
      },
      {
        "text": "Ci lasciamo portare senza opporci, con le braccia davanti al petto, finché non si calma.",
        "score": 1,
        "note": "Non opporsi e proteggere il petto sono giusti, ma aspettare fermi vi lascia nel punto più compresso. Assecondate la spinta e intanto guadagnate il bordo."
      },
      {
        "text": "Mi chino un attimo a raccogliere il telefono, prima che qualcuno lo calpesti.",
        "score": 0,
        "note": "Chinarsi in una folla che spinge è il modo più rapido per perdere l'equilibrio e finire a terra. Il telefono si ricompra; restare in piedi è tutto."
      },
      {
        "text": "Torniamo indietro controcorrente, verso la strada da cui siamo arrivati in piazza.",
        "score": 0,
        "note": "La strada conosciuta attira, ma andare contro la spinta di migliaia di persone vi schiaccia e rischia di dividervi. Si esce di lato, non all'indietro."
      }
    ],
    "principle": "Nella calca si resta in piedi e si esce in diagonale verso dove la folla si dirada, mai controcorrente.",
    "sources": [
      {
        "label": "Ten tips for surviving a crowd crush (The Conversation)",
        "url": "https://theconversation.com/ten-tips-for-surviving-a-crowd-crush-112169"
      },
      {
        "label": "Expert stampede and crowd survival advice (Gov1)",
        "url": "https://www.gov1.com/emergency-management/articles/heres-expert-stampede-crowd-craze-survival-advice-ohXtm4PpKykDHWzj/"
      }
    ]
  },
  {
    "id": "fuga-rissa-ingresso",
    "category": "fuga",
    "level": 3,
    "title": "La rissa davanti all'uscita",
    "text": "Discoteca, le 2 di notte. Vicino all'ingresso principale scoppia una rissa tra due gruppi: bottiglie a terra, spinte, gente che si accalca per guardare o per scappare. Tu e un collega siete al bancone in fondo, a 25 metri. La sicurezza sta arrivando. Accanto al bancone c'è un corridoio con i bagni e un'uscita di emergenza.",
    "question": "Cosa fate?",
    "seconds": 20,
    "options": [
      {
        "text": "Ci spostiamo vicino all'uscita di emergenza: se la rissa si allarga, usciamo da lì.",
        "score": 2,
        "note": "Vi allontanate dal punto caldo e vi mettete accanto a una via d'uscita che non passa dalla rissa. Se la sicurezza la chiude restate; se si allarga, siete già fuori in pochi passi."
      },
      {
        "text": "Restiamo al bancone, lontani dalla rissa, e aspettiamo che la sicurezza la chiuda.",
        "score": 1,
        "note": "La distanza c'è e non è una scelta folle, ma se la rissa si sposta verso di voi siete in un angolo senza un piano. Avvicinarvi all'uscita sul retro costa pochi passi."
      },
      {
        "text": "Andiamo subito verso l'ingresso principale, per uscire prima che la cosa peggiori.",
        "score": 0,
        "note": "Andarsene è giusto, ma passare accanto alla rissa e alla calca vi porta proprio dove volano le bottiglie. La porta da cui siete entrati non è l'unica."
      },
      {
        "text": "Ci avviciniamo di qualche metro per capire chi è coinvolto e se a qualcuno serve aiuto.",
        "score": 0,
        "note": "Curiosità e voglia di aiutare portano tantissime persone vicino a una rissa, e chi sta a pochi metri è spesso chi si prende una bottigliata. Da lontano vedete abbastanza."
      }
    ],
    "principle": "L'uscita migliore non è quella da cui sei entrato: è quella lontana dal pericolo."
  },
  {
    "id": "fuga-dove-correre",
    "category": "fuga",
    "level": 3,
    "title": "Dove correre: l'auto o la pizzeria",
    "text": "Ore 23, quartiere periferico di Milano. Hai rifiutato una sigaretta a due ragazzi e ora ti seguono gridando «Fermati!», a 30 metri, accelerando. La tua auto è a 60 metri in una traversa buia, chiavi in tasca. Sul viale illuminato, a 150 metri, c'è una pizzeria al taglio aperta con gente dentro.",
    "question": "Dove vai?",
    "seconds": 18,
    "options": [
      {
        "text": "Corro verso la pizzeria sul viale, entro e chiedo al personale di chiamare il 112.",
        "score": 2,
        "note": "È più lontana, ma ha luce, persone e un posto dove fermarti al sicuro. Davanti a testimoni, di solito chi insegue lascia perdere; se no, il 112 è già in arrivo."
      },
      {
        "text": "Suono a tutti i citofoni del portone più vicino chiedendo aiuto a gran voce.",
        "score": 1,
        "note": "Qualcuno può rispondere o affacciarsi, e il rumore aiuta. Ma resti fermo davanti a una porta chiusa ad aspettare, mentre loro si avvicinano."
      },
      {
        "text": "Corro verso l'auto: è molto più vicina, mi chiudo dentro e parto appena salgo.",
        "score": 0,
        "note": "È la scelta più istintiva, ma in una traversa buia devi tirare fuori le chiavi, aprire, salire e chiudere: con 30 metri di vantaggio rischi che ti raggiungano mentre armeggi."
      },
      {
        "text": "Mi fermo e mi giro: se scappo si sentono più forti, meglio affrontarli.",
        "score": 0,
        "note": "L'orgoglio dice di non scappare, ma due contro uno che gridano e accelerano non sono una discussione. Andarsene non è debolezza: è la scelta che ti riporta a casa."
      }
    ],
    "principle": "Se devi correre, corri verso luce e persone, anche quando sono più lontane del buio."
  },
  {
    "id": "rap-telefono-sottopasso",
    "category": "rapina",
    "level": 1,
    "title": "Il sottopasso e il telefono",
    "text": "Sono le 23, attraversi il sottopasso della stazione per tornare all'auto. Un ragazzo sui vent'anni ti si piazza davanti a un metro: «Dammi il telefono, subito». Ha la mano destra nella tasca della felpa, non vedi armi. Dietro di te, a venti metri, un altro ragazzo è fermo e guarda.",
    "question": "Cosa fai?",
    "seconds": 12,
    "options": [
      {
        "text": "Gli porgo il telefono con calma, mani bene in vista, e mi allontano verso l'uscita",
        "score": 2,
        "note": "La mano in tasca può nascondere un coltello e quello dietro può essere un complice. Il telefono si ricompra e i dati si bloccano dopo: in cinque secondi è tutto finito."
      },
      {
        "text": "Gli dico che non ce l'ho e provo a passargli di lato a passo svelto",
        "score": 0,
        "note": "Mentire mentre ti sbarra la strada lo costringe a decidere se alzare il livello. Passargli accanto ti porta a portata di mano proprio quando è più nervoso."
      },
      {
        "text": "Lo spingo via con decisione e corro indietro verso le scale da cui sono sceso",
        "score": 0,
        "note": "Correre indietro ti porta dritto verso il ragazzo fermo a venti metri, che potrebbe essere con lui. La spinta trasforma una richiesta in una colluttazione."
      },
      {
        "text": "Lancio il telefono a qualche metro da lui e intanto mi allontano dall'altra parte",
        "score": 1,
        "note": "Crea distanza e gli dà quello che vuole, ma a un metro di distanza un lancio può sembrare una provocazione. Se è già così vicino, consegnarlo e basta è più pulito."
      }
    ],
    "principle": "Se ti chiedono un oggetto e non sai se sono armati, lo dai: le cose si ricomprano, tu no."
  },
  {
    "id": "rap-specchietto-finto-incidente",
    "category": "rapina",
    "level": 1,
    "title": "Il finto specchietto rotto",
    "text": "Esci a passo d'uomo dal parcheggio di un centro commerciale. Un'auto ti affianca, il conducente suona e ti fa segno di fermarti: dice che gli hai rotto lo specchietto, ti mostra il vetro incrinato e vuole 200 euro in contanti, «così non passiamo dall'assicurazione». Tu non hai sentito nessun colpo.",
    "question": "Come ti comporti?",
    "seconds": 15,
    "options": [
      {
        "text": "Resto chiuso in auto e gli dico che chiamo il 112 per far venire una pattuglia",
        "score": 2,
        "note": "I Carabinieri consigliano di chiamare il 112 per far venire una pattuglia: spesso basta dirlo perché i truffatori se ne vadano. Restare in auto ti tiene al sicuro se la discussione si scalda."
      },
      {
        "text": "Pago i 200 euro: costano meno di un sinistro in assicurazione e chiudo subito la storia",
        "score": 0,
        "note": "È esattamente ciò su cui conta la truffa: contanti, fretta, niente documenti. Spesso il danno era già lì o è finto, e lo stesso trucco tocca alla vittima successiva."
      },
      {
        "text": "Scendo a guardare la sua auto e gli faccio vedere che la mia non ha un graffio",
        "score": 0,
        "note": "Scendere ti espone: mentre discuti, un complice può avvicinarsi alla tua auto aperta, o la lite può diventare fisica. La prova tecnica non convince chi vuole solo soldi."
      },
      {
        "text": "Fotografo targa e specchietto dal finestrino e riparto senza discutere",
        "score": 1,
        "note": "Hai le prove e non ti esponi, ma andartene dopo una presunta collisione può creare equivoci. Meglio chiamare il 112 e lasciare che sia la pattuglia a chiarire."
      }
    ],
    "principle": "Contanti subito per un danno che non hai sentito: è una truffa. Resta in auto e chiama il 112.",
    "sources": [
      {
        "label": "il Dolomiti, truffa dello specchietto e consigli dei Carabinieri (2025)",
        "url": "https://www.ildolomiti.it/cronaca/2025/truffa-dello-specchietto-simulano-uno-scontro-e-chiedono-600-euro-alla-vittima-un-uomo-e-una-donna-denunciati-ecco-come-comportarsi-in-queste-situazioni"
      }
    ]
  },
  {
    "id": "rap-giacarta-scooter-tracolla",
    "category": "rapina",
    "level": 2,
    "title": "Giacarta, lo scooter che accosta",
    "text": "Giacarta, 21:30. Aspetti l'auto prenotata sul marciapiede davanti a un ristorante, borsa a tracolla con dentro passaporto e portafoglio. Uno scooter con due persone accosta alle tue spalle: il passeggero afferra la borsa e lo scooter riparte. La cinghia ti tira il braccio e senti che stai per perdere l'equilibrio.",
    "question": "Cosa fai?",
    "seconds": 10,
    "options": [
      {
        "text": "Mollo subito la cinghia e lascio andare la borsa, passaporto compreso",
        "score": 2,
        "note": "Uno scooter che accelera ti trascina a terra in un attimo. I documenti si rifanno, la testa sull'asfalto no. Poi, al sicuro nel ristorante, chiami il 110 (polizia) o il 112."
      },
      {
        "text": "Stringo la cinghia con tutte e due le mani e punto i piedi per non mollare",
        "score": 0,
        "note": "Contro un mezzo a motore la tua forza non conta: o la cinghia si rompe o vieni trascinato. È l'istinto più naturale ed è quello che manda le persone in ospedale."
      },
      {
        "text": "Mollo, poi salto sul primo ojek e gli dico di seguire lo scooter",
        "score": 0,
        "note": "Un inseguimento nel traffico ti mette su una moto guidata da uno sconosciuto, dietro due persone che hanno appena usato la forza. Le cose sono già perse: tu no."
      },
      {
        "text": "Tengo la borsa e colpisco la mano del passeggero per fargli mollare la presa",
        "score": 0,
        "note": "Con lo scooter in accelerazione non hai né tempo né equilibrio: colpire ti tiene attaccato al mezzo un secondo in più, e ogni secondo è un metro di trascinamento."
      }
    ],
    "principle": "Se ti strappano qualcosa da un mezzo in movimento, molla subito: trattenere vuol dire essere trascinati.",
    "sources": [
      {
        "label": "Ambasciata d'Italia a Giacarta, numeri di emergenza",
        "url": "https://ambjakarta.esteri.it/en/chi-siamo/numeri-di-emergenza/"
      }
    ]
  },
  {
    "id": "rap-borseggio-metro",
    "category": "rapina",
    "level": 2,
    "title": "Una mano nella tasca, in metro",
    "text": "Ore 18, metropolitana affollata, sei schiacciato vicino alle porte. Senti qualcosa che sfiora la tasca del giubbotto dove tieni il portafoglio. Ti giri: un ragazzo a trenta centimetri guarda il telefono, altri due vicino a lui sembrano non conoscerlo. La prossima fermata è tra un minuto.",
    "question": "Cosa fai?",
    "seconds": 15,
    "options": [
      {
        "text": "Copro la tasca, dico forte «Attenti ai borseggiatori!» e mi sposto",
        "score": 2,
        "note": "I borseggiatori lavorano in gruppo e vivono di non essere notati: l'avviso ad alta voce li espone senza accusare nessuno in particolare. E le tue cose sono di nuovo coperte."
      },
      {
        "text": "Gli afferro il polso e gli dico in faccia che l'ho visto rubare",
        "score": 0,
        "note": "Non sei sicuro che fosse lui, e se lo era non è solo: in un vagone pieno, uno scontro con tre persone a trenta centimetri è lo scenario peggiore."
      },
      {
        "text": "Faccio finta di niente per non fare scene e controllo la tasca a casa",
        "score": 0,
        "note": "L'imbarazzo li aiuta. Se il portafoglio è già sparito, scoprirlo a casa vuol dire perdere tempo prezioso per bloccare carte e documenti."
      },
      {
        "text": "Senza dire niente controllo il portafoglio e scendo alla fermata dopo",
        "score": 1,
        "note": "Ti allontani e verifichi, ed è già buono. Ma in silenzio lasci il gruppo libero di provarci con il prossimo passeggero: un avviso generico costa poco e protegge anche gli altri."
      }
    ],
    "principle": "Al borseggio rispondi con attenzione pubblica, non con accuse: copri, avvisa ad alta voce, spostati."
  },
  {
    "id": "rap-gomma-a-terra-semaforo",
    "category": "rapina",
    "level": 3,
    "title": "«Hai una gomma a terra!» al semaforo",
    "text": "Sei fermo al semaforo, finestrini chiusi, la borsa del portatile sul sedile del passeggero. Un uomo a piedi bussa al tuo vetro e indica la ruota posteriore: «Gomma a terra, accosta!». Nello specchietto vedi un secondo uomo che si avvicina dal lato del passeggero. L'auto non ti sembra diversa dal solito.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Portiere bloccate, riparto al verde e controllo la gomma a un distributore",
        "score": 2,
        "note": "Il trucco della gomma serve a farti scendere o abbassare il vetro mentre il complice apre dall'altro lato. Se la gomma è davvero bucata, qualche centinaio di metri piano non cambia nulla."
      },
      {
        "text": "Abbasso un po' il finestrino per ringraziarlo e chiedergli quale ruota è a terra",
        "score": 0,
        "note": "È il gesto cortese su cui contano: il vetro aperto e la tua attenzione su di lui lasciano scoperto il lato del passeggero, proprio dove c'è la borsa."
      },
      {
        "text": "Accosto subito lì a destra e scendo a controllare insieme a lui",
        "score": 0,
        "note": "Scendere con l'auto aperta e la borsa dentro è la scena del furto: uno ti mostra la ruota, l'altro apre la portiera dal lato opposto e prende la borsa in pochi secondi."
      },
      {
        "text": "Sposto la borsa sotto il sedile e poi accosto per guardare la ruota",
        "score": 1,
        "note": "Nascondere la borsa riduce il rischio, ma accostando lì resti esposto a due persone che si sono già avvicinate. Meglio controllare in un posto scelto da te."
      }
    ],
    "principle": "Chi ti chiede di fermarti o scendere al semaforo può essere un'esca: controlli dopo, dove scegli tu.",
    "sources": [
      {
        "label": "Il Giorno, truffa della gomma bucata nel Milanese (2025)",
        "url": "https://www.ilgiorno.it/milano/cronaca/attenti-alla-truffa-della-gomma-65cf95f1"
      }
    ]
  },
  {
    "id": "rap-non-salire-in-auto",
    "category": "rapina",
    "level": 3,
    "title": "«Ora vieni con me al bancomat»",
    "text": "Parcheggio sotterraneo, ore 22. Un uomo con un coltello corto in mano ti ha già preso portafoglio e telefono, a due metri da te. Ora indica la sua auto con la portiera aperta: «Sali, andiamo al bancomat». L'uscita pedonale è a quindici metri alle tue spalle, illuminata.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Gli lascio carta e PIN ma non salgo: se insiste, urlo e corro all'uscita",
        "score": 2,
        "note": "Finché chiedeva oggetti, cedere era giusto. Salire in auto cambia tutto: perdi testimoni, uscite e controllo. Il PIN gli dà quello che vuole senza portarti altrove."
      },
      {
        "text": "Salgo senza discutere: se collaboro fino in fondo, tutto finisce prima e senza danni",
        "score": 0,
        "note": "Collaborare con gli oggetti è saggio, con lo spostamento no: un secondo luogo scelto da lui è quasi sempre più pericoloso del primo, perché lì nessuno ti vede."
      },
      {
        "text": "Provo a strappargli il coltello mentre guarda verso la sua auto",
        "score": 0,
        "note": "Disarmare qualcuno è tra le cose più rischiose in assoluto, anche per chi si allena. Hai un'uscita illuminata a quindici metri: la distanza ti protegge meglio."
      },
      {
        "text": "Gli offro anche orologio e giacca, tutto quello che ho, pur di non salire",
        "score": 1,
        "note": "Rifiutare lo spostamento è giusto e offrire altro può calmarlo, ma non chiude la situazione: se insiste resti lì a trattare con un coltello a due metri. Serve un piano per uscire."
      }
    ],
    "principle": "Dai gli oggetti, mai te stesso: non farti portare in un secondo luogo."
  },
  {
    "id": "legge-spray-bancarella",
    "category": "legge",
    "level": 1,
    "title": "Lo spray «extra forte» della bancarella",
    "text": "Al mercato del sabato una bancarella vende spray al peperoncino «extra forte»: bomboletta da 50 ml, gittata dichiarata 5 metri, etichetta solo in inglese, 15 euro. Il venditore assicura che «è legale ovunque». Da qualche settimana torni a casa tardi e ci stai pensando.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Non lo compro: cerco uno spray a norma, controllando bene l'etichetta",
        "score": 2,
        "note": "Il D.M. 103/2011 ammette spray fino a 20 ml, oleoresin capsicum max 10% (capsaicinoidi max 2,5%), senza sostanze tossiche o infiammabili, gittata entro 3 metri, sigillo e sicura; vendita vietata ai minori di 16 anni."
      },
      {
        "text": "Lo compro: più è potente e più lontano arriva, meglio riesco a difendermi",
        "score": 0,
        "note": "50 ml e 5 metri superano i limiti di legge. Uno spray non conforme ricade nella disciplina delle armi: portarlo fuori casa può essere reato (Cass. 30140/2021)."
      },
      {
        "text": "Lo compro ma lo tengo solo nel cruscotto: in auto non conta come porto",
        "score": 0,
        "note": "L'auto non è casa tua: tenerlo nel cruscotto è comunque portarlo fuori dall'abitazione. Il problema è lo spray non conforme, non dove lo metti."
      },
      {
        "text": "Lascio perdere qualsiasi spray: tanto sono vietati tutti",
        "score": 1,
        "note": "Scelta prudente, ma parte da un'idea sbagliata: gli spray conformi si comprano e si portano liberamente, e si possono usare solo per difendersi da un pericolo reale e attuale."
      }
    ],
    "principle": "Spray legale: max 20 ml, capsicum max 10%, gittata max 3 m, sigillo e sicura. Il resto è fuori legge.",
    "sources": [
      {
        "label": "Brocardi, spray al peperoncino e D.M. 103/2011 (2024)",
        "url": "https://brocardi.it/notizie-giuridiche/spray-peperoncino-quando-puoi-usarlo-quando-invece-andresti-incontro/4706.html"
      },
      {
        "label": "Studio Cataldi, spray antiaggressione: requisiti e Cass. 30140/2021",
        "url": "https://www.studiocataldi.it/guide_legali/diritto-penale-parte-speciale/spray-antiaggressione"
      }
    ]
  },
  {
    "id": "legge-coltello-in-auto",
    "category": "legge",
    "level": 1,
    "title": "Il coltello nel cruscotto «per sicurezza»",
    "text": "In cantiere un collega ti mostra il coltello pieghevole con blocco della lama, 9 cm, che tiene sempre nel cruscotto: «Per sicurezza, non si sa mai. Dovresti farlo anche tu». Nel furgone hai già la cassetta degli attrezzi con il taglierino che usi per tagliare guaine e pavimenti.",
    "question": "Cosa fai?",
    "seconds": 15,
    "options": [
      {
        "text": "Tengo solo gli attrezzi da lavoro e nessun coltello «per difesa»",
        "score": 2,
        "note": "Portare una lama fuori casa senza giustificato motivo è reato (art. 4 L. 110/1975) e «per difesa» non è un motivo valido. Il taglierino che ti serve per il cantiere sì, finché serve al lavoro."
      },
      {
        "text": "Ne compro uno uguale: se mi fermano dico che mi serve per lavoro",
        "score": 0,
        "note": "Il motivo deve essere vero e coerente con il momento: il sabato sera in centro non regge. Dal 2026, per lame oltre 8 cm o pieghevoli da 5 cm con blocco o apertura a una mano, la pena è la reclusione da 6 mesi a 3 anni."
      },
      {
        "text": "Lo tengo in macchina ma non lo porto mai addosso, così sono in regola",
        "score": 0,
        "note": "Anche in auto sei fuori dall'abitazione, quindi conta come porto. E un coltello «per sicurezza» a portata di mano durante una lite stradale è un'escalation già pronta."
      },
      {
        "text": "Al posto del coltello metto nel cruscotto uno spray al peperoncino a norma",
        "score": 1,
        "note": "Uno spray conforme al D.M. 103/2011 si può portare, quindi è lecito. Ma resta l'idea di girare pronti allo scontro: usarlo è legittimo solo contro un pericolo attuale."
      }
    ],
    "principle": "«Per difesa» non è un giustificato motivo: fuori casa porti solo gli attrezzi che ti servono davvero.",
    "sources": [
      {
        "label": "G.U. n. 95 del 24/04/2026, testo coordinato D.L. 23/2026 conv. L. 54/2026 (PDF)",
        "url": "https://www.sistemapenale.it/pdf_contenuti/1777304668_20260424-095-1.pdf"
      },
      {
        "label": "Normattiva, D.L. 24 febbraio 2026 n. 23 (testo vigente)",
        "url": "https://www.normattiva.it/eli/id/2026/02/24/26G00042/CONSOLIDATED/"
      },
      {
        "label": "Brocardi, spray conforme e oggetti atti a offendere",
        "url": "https://brocardi.it/notizie-giuridiche/spray-peperoncino-quando-puoi-usarlo-quando-invece-andresti-incontro/4706.html"
      },
      {
        "label": "Brocardi, coltello nel vano portaoggetti dell'auto è porto (Cass. 6974/2018)",
        "url": "https://brocardi.it/notizie-giuridiche/commette-reato-lascia-coltello-nella-propria-auto/1706.html"
      },
      {
        "label": "Cass. pen. sez. VII n. 1594/2024: la difesa personale non è giustificato motivo (Lexced)",
        "url": "https://www.lexced.com/?p=153914"
      }
    ]
  },
  {
    "id": "legge-difendere-sconosciuta",
    "category": "legge",
    "level": 2,
    "title": "Alla fermata la sta strattonando",
    "text": "Fermata del tram, ore 20. Un uomo sulla trentina tiene una ragazza per il braccio e la strattona; lei piange e gli dice di lasciarla. Sei a cinque metri, accanto a te c'è un signore sulla sessantina. L'uomo non ha niente in mano e non vi ha ancora notati.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Chiedo al signore di chiamare il 112 e dico forte all'uomo di lasciarla",
        "score": 2,
        "note": "La legittima difesa copre anche il diritto «altrui» (art. 52 c.p.): puoi intervenire per lei. Voce, testimoni e chiamata spesso bastano; il contatto fisico solo se è l'unico modo per farlo smettere."
      },
      {
        "text": "Non intervengo: per legge la legittima difesa vale solo se aggrediscono me",
        "score": 0,
        "note": "Falso: l'art. 52 c.p. parla di difendere un diritto «proprio od altrui». Nessuno ti obbliga a rischiare, ma restare fermi senza nemmeno chiamare aiuto la lascia sola."
      },
      {
        "text": "Lo prendo alle spalle e lo butto a terra prima che abbia il tempo di reagire",
        "score": 0,
        "note": "La difesa deve essere necessaria e proporzionata: se basta la voce, buttarlo a terra di sorpresa può causare lesioni. Se esageri, rischi di rispondere per eccesso colposo (art. 55 c.p.)."
      },
      {
        "text": "Chiamo il 112 restando a distanza e tengo d'occhio dove la porta",
        "score": 1,
        "note": "Scelta sicura e utile, ma una pattuglia impiega minuti. Farvi vedere e sentire in due, a voce alta, spesso basta a fermarlo subito senza toccarlo."
      }
    ],
    "principle": "Puoi difendere anche un'altra persona (art. 52 c.p.), con gli stessi limiti: necessità e proporzione.",
    "sources": [
      {
        "label": "Art. 52 c.p. Difesa legittima (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-primo/titolo-iii/capo-i/art52.html"
      },
      {
        "label": "Art. 55 c.p. Eccesso colposo (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-primo/titolo-iii/capo-i/art55.html"
      }
    ]
  },
  {
    "id": "legge-scippatore-a-terra",
    "category": "legge",
    "level": 2,
    "title": "Lo scippatore inciampa davanti a te",
    "text": "In una via del centro un ragazzo strappa la borsa a una signora anziana e scappa. Dopo trenta metri inciampa e cade proprio davanti a te e a due passanti. È a terra, la borsa gli è scivolata di mano, non si vedono armi. La signora grida dall'altra parte della strada.",
    "question": "Cosa fai?",
    "seconds": 20,
    "options": [
      {
        "text": "Con i due passanti lo teniamo fermo, senza colpirlo, e chiamiamo subito il 112",
        "score": 1,
        "note": "È lecito: per uno scippo in flagranza chiunque può arrestare (art. 383 c.p.p.), con l'obbligo di consegnarlo subito alla polizia. Ma può avere un'arma nascosta: niente peso sul petto e, se reagisce, lasciatelo."
      },
      {
        "text": "Lo portiamo nel retro del bar e lo teniamo lì finché arriva il figlio della signora",
        "score": 0,
        "note": "Il privato deve consegnare l'arrestato alla polizia senza ritardo: trattenerlo più del necessario, o per altri scopi, può diventare sequestro di persona (Cass. 48332/2018)."
      },
      {
        "text": "Gli do un paio di calci mentre è a terra, così ci pensa due volte",
        "score": 0,
        "note": "A terra e senza borsa non è più un pericolo: colpirlo ora è vendetta, non difesa, e risponderesti di lesioni. Il potere di arresto non comprende la punizione."
      },
      {
        "text": "Raccolgo la borsa per la signora, resto a distanza e chiamo il 112 descrivendolo",
        "score": 2,
        "note": "La borsa è già recuperata: ora serve la polizia, e una descrizione precisa (viso, vestiti, direzione) la aiuta. Fermarlo in flagranza è un tuo diritto (art. 383 c.p.p.), non un obbligo."
      }
    ],
    "principle": "Fermare chi ha scippato è un diritto, non un dovere: se lo fai, consegnalo subito alla polizia. Mai punire.",
    "sources": [
      {
        "label": "Art. 383 c.p.p. Facoltà di arresto da parte dei privati (Brocardi)",
        "url": "https://www.brocardi.it/codice-di-procedura-penale/libro-quinto/titolo-vi/art383.html"
      },
      {
        "label": "Art. 380 c.p.p. Arresto obbligatorio in flagranza (Brocardi)",
        "url": "https://www.brocardi.it/codice-di-procedura-penale/libro-quinto/titolo-vi/art380.html"
      }
    ]
  },
  {
    "id": "legge-amico-ha-cominciato",
    "category": "legge",
    "level": 3,
    "title": "Il tuo amico ha cominciato, l'altro esagera",
    "text": "Fuori da un locale il tuo amico, un po' alticcio, insulta un ragazzo e gli dà una spinta. L'altro risponde con uno schiaffo, poi afferra una bottiglia da un tavolino e la alza verso la testa del tuo amico. Sei a due metri; alle vostre spalle la strada verso il parcheggio è libera.",
    "question": "Cosa fai?",
    "seconds": 20,
    "options": [
      {
        "text": "Tiro via il mio amico per il giubbotto e arretriamo verso il parcheggio, mani aperte verso l'altro",
        "score": 2,
        "note": "Chi provoca di solito non può invocare la legittima difesa, ma una bottiglia alla testa è un'offesa nuova e molto più grave: lì difenderlo può essere lecito (Cass. 36143/2019). Allontanarlo è la difesa più sicura."
      },
      {
        "text": "Lo lascio arrangiarsi: ha cominciato lui, se intervengo passo dalla parte del torto",
        "score": 0,
        "note": "Lo schiaffo rispondeva alla spinta, la bottiglia alla testa no: è un pericolo serio anche per chi ha provocato. Puoi agire per fermarlo; sui dettagli decide poi il giudice."
      },
      {
        "text": "Colpisco il ragazzo con un pugno prima che riesca a usare la bottiglia",
        "score": 0,
        "note": "Contro una bottiglia alla testa potrebbe anche essere ritenuta difesa legittima, ma è la scelta più rischiosa: con la via libera alle spalle, il giudice potrebbe concludere che bastava allontanarsi."
      },
      {
        "text": "Urlo al ragazzo di fermarsi e intanto chiamo il 112",
        "score": 0,
        "note": "Chiamare è giusto, ma la bottiglia è già alzata e le parole non tolgono il tuo amico dalla traiettoria. Prima lo allontani, poi chiami."
      }
    ],
    "principle": "Difendere chi ha provocato è lecito solo contro un'offesa nuova e più grave. Prima allontana, poi difendi.",
    "sources": [
      {
        "label": "Art. 52 c.p. e giurisprudenza su provocazione e fuga (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-primo/titolo-iii/capo-i/art52.html"
      },
      {
        "label": "Brocardi, Cass. 36143/2019: sviluppo imprevedibile e offesa ingiusta",
        "url": "https://brocardi.it/notizie-giuridiche/sviluppo-imprevedibile-rissa-costituisce-offesa-ingiusta-consente/2051.html"
      }
    ]
  },
  {
    "id": "legge-ladro-in-casa",
    "category": "legge",
    "level": 3,
    "title": "Di notte in casa: il ladro sta uscendo",
    "text": "Sono le 3. Senti un rumore al piano di sotto, scendi e accendi la luce: un uomo con un cacciavite in mano sta scavalcando la finestra della cucina verso il giardino, con il tuo portatile sotto il braccio. Si gira un attimo verso di te, poi continua a uscire. Sei a quattro metri; di sopra c'è chi vive con te.",
    "question": "Cosa fai?",
    "seconds": 22,
    "options": [
      {
        "text": "Resto dove sono, lo lascio uscire e chiamo il 112 descrivendolo",
        "score": 2,
        "note": "Sta andando via: il pericolo si sta chiudendo da solo. In casa la legge protegge anche i beni, ma solo se non c'è desistenza e c'è pericolo di aggressione (art. 52 c.p.)."
      },
      {
        "text": "Afferro il mattarello e lo colpisco prima che salti: in casa mia la difesa è sempre legittima",
        "score": 0,
        "note": "Il «sempre» del 2019 non è un via libera: la Cassazione chiede comunque un pericolo attuale. E il grave turbamento (art. 55 c.p.) copre chi difende l'incolumità, non un portatile che se ne va."
      },
      {
        "text": "Lo inseguo in giardino per riprendermi il portatile prima che scavalchi",
        "score": 0,
        "note": "Fuori, al buio, contro uno con un cacciavite e magari un complice in strada: l'inseguimento ribalta la situazione e ti espone, per un oggetto che si ricompra."
      },
      {
        "text": "Gli grido che la polizia sta arrivando e torno di sopra a chiudermi dentro",
        "score": 1,
        "note": "Mettere al sicuro te e chi è di sopra è giusto, e il grido può farlo uscire più in fretta. Manca la cosa più utile: la chiamata vera, con descrizione e direzione."
      }
    ],
    "principle": "In casa la legge ti protegge di più, ma non contro chi sta già scappando: lascialo andare e chiama.",
    "sources": [
      {
        "label": "Art. 52 c.p., commi 2-4 e Cass. 13191/2020 (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-primo/titolo-iii/capo-i/art52.html"
      },
      {
        "label": "Art. 55 c.p., comma 2 grave turbamento (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-primo/titolo-iii/capo-i/art55.html"
      }
    ]
  },
  {
    "id": "dopo-prima-al-sicuro",
    "category": "dopo",
    "level": 1,
    "title": "Prima al sicuro, poi la chiamata",
    "text": "Hai appena consegnato il portafoglio a un uomo con un coltello, sotto i portici vicino alla stazione. Lui si allontana a piedi verso la piazza. Sei illeso, ma ti tremano le mani. A trenta metri c'è un bar aperto con gente dentro.",
    "question": "Cosa fai adesso?",
    "seconds": 15,
    "options": [
      {
        "text": "Entro nel bar e da lì chiamo il 112, con posizione e descrizione",
        "score": 2,
        "note": "Prima ti metti tra la gente, poi chiami. Dove sei, cosa è successo, com'era e dove è andato: detti subito, a partire da dove sei, servono più di qualsiasi racconto lungo."
      },
      {
        "text": "Lo seguo a distanza, senza farmi vedere, per dire poi alla polizia dove va",
        "score": 0,
        "note": "Ha un coltello e sa che l'hai visto: seguirlo ti rimette nel pericolo da cui sei appena uscito. La direzione di fuga la puoi dare anche dal bar."
      },
      {
        "text": "Non chiamo nessuno: sto bene, nessuno è ferito e il portafoglio ormai è perso",
        "score": 0,
        "note": "La rapina si persegue d'ufficio e una descrizione data a caldo può far fermare chi magari colpirà ancora stasera. Poi serve comunque la denuncia per carte e documenti."
      },
      {
        "text": "Chiamo il 112 restando lì sotto i portici, così intanto lo tengo d'occhio",
        "score": 1,
        "note": "La chiamata è giusta e veloce, ma resti da solo nel punto della rapina, con lui ancora in vista. Trenta metri fino al bar ti mettono al sicuro e ti aiutano a parlare chiaro."
      }
    ],
    "principle": "Dopo: prima al sicuro tra la gente, poi il 112. Dove sei, cosa è successo, com'era, dove è andato.",
    "sources": [
      {
        "label": "Regione Lombardia, NUE 112 e app Where ARE U",
        "url": "https://www.regione.lombardia.it/sanita/emergenze-e-urgenze/chiaamta-del-soccorso-sanitario-where-areu-112-salutile-pronto-soccorso"
      },
      {
        "label": "deQuo, denuncia, querela e reati d'ufficio (2026)",
        "url": "https://www.dequo.it/articoli/quanto-tempo-ho-per-denunciare"
      }
    ]
  },
  {
    "id": "dopo-pronto-soccorso",
    "category": "dopo",
    "level": 1,
    "title": "«È solo un graffio», dici tu",
    "text": "Ieri sera, in una lite davanti a un locale, hai preso un pugno sullo zigomo. Hai un piccolo taglio, la guancia gonfia e un leggero mal di testa, ma ti senti bene. Stamattina un amico ti dice: «Lascia perdere il pronto soccorso, perdi la giornata per niente».",
    "question": "Cosa fai?",
    "seconds": 15,
    "options": [
      {
        "text": "Vado oggi al pronto soccorso e racconto che è stato un pugno",
        "score": 2,
        "note": "Un colpo alla testa seguito da mal di testa va visto da un medico. Il referto, con data e prognosi, è anche la prova delle lesioni: senza, una querela diventa parola contro parola."
      },
      {
        "text": "Aspetto qualche giorno: se il mal di testa continua, ci vado",
        "score": 0,
        "note": "Dopo un colpo alla testa aspettare è proprio il rischio. E un referto fatto giorni dopo collega peggio la lesione a quella sera."
      },
      {
        "text": "Scrivo a chi mi ha colpito per chiedergli di pagarmi i danni",
        "score": 0,
        "note": "Contattarlo riapre la lite e un messaggio del genere può essere letto come una minaccia. Danni e risarcimento passano da querela e avvocato, con il referto in mano."
      },
      {
        "text": "Faccio foto al taglio e al gonfiore e vado dal mio medico domani",
        "score": 1,
        "note": "Le foto sono utili e il medico di base è meglio di niente, ma il pronto soccorso valuta subito il trauma e mette nero su bianco data, ora e causa delle lesioni."
      }
    ],
    "principle": "Anche per lesioni lievi: pronto soccorso subito. Ti cura e mette le prove nero su bianco."
  },
  {
    "id": "dopo-mani-che-tremano",
    "category": "dopo",
    "level": 2,
    "title": "In auto, con le mani che tremano",
    "text": "Dieci minuti fa, in un'area di servizio, un automobilista furioso ha preso a pugni il tuo finestrino; sei ripartito senza reagire e lui non ti ha seguito. Ora sei fermo nel piazzale illuminato di un distributore: cuore a mille, mani che tremano. Vuoi solo fare i 40 km fino a casa.",
    "question": "Cosa fai?",
    "seconds": 15,
    "options": [
      {
        "text": "Resto fermo qui, respiro lento, chiamo qualcuno e riparto quando sono calmo",
        "score": 2,
        "note": "Tremore e cuore a mille sono la normale coda dell'adrenalina e passano. Guidare in quello stato è il rischio vero: qualche minuto in un posto sicuro rimette a posto mani e testa."
      },
      {
        "text": "Riparto subito e spingo un po': prima arrivo a casa, prima mi calmo",
        "score": 0,
        "note": "Con l'adrenalina alta riflessi e giudizio peggiorano: un incidente in autostrada è un rischio più concreto di lui, che non ti ha seguito."
      },
      {
        "text": "Torno all'area di servizio per prendere la sua targa",
        "score": 0,
        "note": "Ti sei appena tolto da lì senza danni: tornare ti rimette davanti a una persona fuori controllo. Se vuoi denunciare, luogo, ora e descrizione bastano per cominciare."
      },
      {
        "text": "Prendo un caffè al bar del distributore e poi riparto",
        "score": 1,
        "note": "Fermarsi è giusto, ma un caffè non aiuta a calmarsi e la pausa rischia di essere troppo breve. Meglio acqua, respiro lento e qualche minuto in più."
      }
    ],
    "principle": "Dopo uno scontro l'adrenalina ha bisogno di tempo per scendere: aspetta al sicuro prima di guidare."
  },
  {
    "id": "dopo-querela-tre-mesi",
    "category": "dopo",
    "level": 2,
    "title": "La querela può aspettare?",
    "text": "Sette settimane fa, a una festa, un conoscente ti ha spinto giù da tre gradini: polso incrinato, prognosi di 25 giorni. Hai il referto e due amici che hanno visto tutto. Non hai ancora deciso se querelarlo: speri che si faccia vivo per scusarsi.",
    "question": "Cosa fai?",
    "seconds": 18,
    "options": [
      {
        "text": "Presento querela in questi giorni, con referto e nomi dei testimoni",
        "score": 2,
        "note": "Per lesioni come queste, senza aggravanti, si procede solo a querela, e il termine è di tre mesi da quando sai del fatto (art. 124 c.p.). Ne sono passati quasi due: dopo, il diritto si perde."
      },
      {
        "text": "Aspetto ancora le sue scuse: tanto per querelare ho un anno di tempo",
        "score": 0,
        "note": "Il termine generale è di tre mesi, non un anno. Scaduto quello, anche se cambi idea non si può più procedere per queste lesioni."
      },
      {
        "text": "Non faccio niente: il referto del pronto soccorso vale già come denuncia",
        "score": 0,
        "note": "Il medico deve fare referto solo per i reati perseguibili d'ufficio (art. 365 c.p.). Per lesioni come le tue serve la tua querela, cioè la volontà espressa che si proceda."
      },
      {
        "text": "Prendo appuntamento con un avvocato per il mese prossimo",
        "score": 1,
        "note": "Farsi consigliare è sensato, ma il mese prossimo potresti essere oltre i tre mesi. La querela si può presentare anche da soli a Carabinieri o Polizia, e l'avvocato arriva dopo."
      }
    ],
    "principle": "Querela entro 3 mesi da quando sai del fatto: dopo, per i reati a querela, non si torna indietro.",
    "sources": [
      {
        "label": "Art. 124 c.p. Termine per proporre la querela (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-primo/titolo-iv/capo-iv/art124.html"
      },
      {
        "label": "Art. 582 c.p. Lesione personale, procedibilità (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-secondo/titolo-xii/capo-i/art582.html"
      },
      {
        "label": "Art. 365 c.p. Omissione di referto (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-secondo/titolo-iii/capo-i/art365.html"
      },
      {
        "label": "deQuo, denuncia e querela: dove e come (2026)",
        "url": "https://www.dequo.it/articoli/quanto-tempo-ho-per-denunciare"
      }
    ]
  },
  {
    "id": "dopo-amici-niente-polizia",
    "category": "dopo",
    "level": 3,
    "title": "«Niente ambulanza, lo portiamo noi»",
    "text": "Esci da un locale e trovi un ragazzo seduto a terra contro il muro, sangue dalla testa, risponde lento e confuso. I suoi amici, agitati, ti dicono: «Non chiamare nessuno, niente polizia, adesso lo portiamo a casa noi». Di chi l'ha colpito non c'è traccia.",
    "question": "Cosa fai?",
    "seconds": 20,
    "options": [
      {
        "text": "Chiamo comunque il 112 per un'ambulanza, dico che è confuso, e resto con lui",
        "score": 2,
        "note": "Sangue dalla testa e risposte confuse richiedono un medico, non un divano. La legge (art. 593 c.p.) chiede di prestare assistenza o avvisare subito l'autorità: la loro paura non cambia questo."
      },
      {
        "text": "Rispetto la loro scelta: sono suoi amici e lo conoscono meglio di me",
        "score": 0,
        "note": "Forse temono guai per sé, forse sono solo spaventati: in ogni caso non sono medici. Un colpo alla testa che sembra lieve può peggiorare nelle ore successive."
      },
      {
        "text": "Lo aiuto ad alzarsi e lo accompagno con loro fino alla macchina",
        "score": 0,
        "note": "Muovere chi ha preso un colpo alla testa ed è confuso, senza un pericolo immediato, può fargli danno. E portarlo via in auto evita proprio il controllo che gli serve."
      },
      {
        "text": "Fotografo la scena e lascio il mio numero agli amici, se serve un testimone",
        "score": 1,
        "note": "Utile per dopo, ma il problema è adesso: la priorità è un'ambulanza per lui. Il tuo numero puoi lasciarlo anche ai soccorritori o alle forze dell'ordine."
      }
    ],
    "principle": "Ferito alla testa e confuso: ambulanza sempre, anche se gli altri dicono di no.",
    "sources": [
      {
        "label": "Art. 593 c.p. Omissione di soccorso (Brocardi)",
        "url": "https://www.brocardi.it/codice-penale/libro-secondo/titolo-xii/capo-i/art593.html"
      }
    ]
  },
  {
    "id": "dopo-video-profilo-instagram",
    "category": "dopo",
    "level": 3,
    "title": "Il video, il profilo e la tentazione",
    "text": "Due giorni dopo l'aggressione che hai subito in piazza, un amico ti manda il video girato da un passante e il profilo Instagram di un ragazzo che, secondo lui, è uno degli aggressori: «Lo pubblico taggandolo, e stasera andiamo sotto casa sua a chiarire». Nel video il viso non si vede bene.",
    "question": "Cosa fai?",
    "seconds": 22,
    "options": [
      {
        "text": "Porto ai Carabinieri il video originale e il contatto di chi l'ha girato",
        "score": 2,
        "note": "Il file originale e chi l'ha girato valgono come prova; il riconoscimento lo fanno gli investigatori. Se il profilo è quello sbagliato, nessuno ha accusato un innocente."
      },
      {
        "text": "Lo pubblichiamo: se è davvero lui, qualcuno lo riconoscerà e lo segnalerà",
        "score": 0,
        "note": "Pubblicare il volto riconoscibile di una persona accusandola può violare la privacy ed esporvi a guai legali, soprattutto se è la persona sbagliata. E lui, avvisato, cancella tutto."
      },
      {
        "text": "Andiamo sotto casa sua stasera, ma solo per parlargli e chiarire a voce",
        "score": 0,
        "note": "Due persone arrabbiate sotto casa di chi forse ti ha aggredito non è un chiarimento: è la strada più rapida per una seconda aggressione, magari con te dalla parte del torto."
      },
      {
        "text": "Salvo il video sul telefono e ci penso con calma nei prossimi giorni",
        "score": 1,
        "note": "Non fare mosse impulsive è già molto. Ma i video spariscono e chi li ha girati dimentica i dettagli: consegnarlo presto rende la prova più forte."
      }
    ],
    "principle": "Le prove si consegnano, non si pubblicano. E l'aggressore non si va a cercare.",
    "sources": [
      {
        "label": "Fanpage, avvocato su filmare e pubblicare presunti borseggiatori (2023)",
        "url": "https://www.fanpage.it/milano/perche-potrebbe-commettere-un-reato-chi-filma-e-pubblica-i-video-delle-presunte-borseggiatrici-in-metro/"
      }
    ]
  }
];
