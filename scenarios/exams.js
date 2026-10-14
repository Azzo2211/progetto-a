/*
 * Progetto A - Scenari: esami speciali (stile Classroom of the Elite).
 * Ogni esame: fascicolo, 3 round da 4 mosse (best/good/weak/bad con effetti
 * sulle 6 categorie), la frase da scrivere e il debrief con la verita' nascosta.
 * Schema controllato da tests/scenarios.test.js.
 */
window.ScenarioExams = [
  {
    "id": "lavoro-reclamo-piastrelle-lotto",
    "category": "lavoro",
    "difficulty": 2,
    "title": "La cliente furiosa per le piastrelle più scure",
    "setting": "Sabato mattina, showroom pieno. La signora Bertolini entra con una scatola di gres effetto legno sotto il braccio: 22 mq consegnati giovedì per cucina e bagno, posatore in arrivo lunedì alle 8. Davanti a due coppie che stanno scegliendo il pavimento, appoggia una piastrella sul bancone accanto al campione: è visibilmente più scura.",
    "cast": [
      {
        "name": "Giovanna Bertolini",
        "role": "cliente privata, sta ristrutturando casa",
        "note": "agitata, alza la voce, stringe in mano la bolla di consegna"
      },
      {
        "name": "Alessio",
        "role": "magazziniere",
        "note": "tranquillo, assicura di aver preparato l'ordine come sempre"
      }
    ],
    "objective": "Calmare la cliente, capire cosa è successo e salvare la posa di lunedì senza regalare il margine.",
    "rounds": [
      {
        "text": "La signora, a voce alta: \"Queste non sono quelle che ho scelto! Guardi qua, sono più scure. Mi avete preso in giro?\" Le due coppie smettono di parlare e si girano. Dal fondo, Alessio ti fa un cenno: \"L'ordine l'ho preparato io, era tutto a posto.\"",
        "prompt": "Cosa fai?",
        "options": [
          {
            "text": "\"Signora, una leggera differenza di tono tra un lotto e l'altro è normale: c'è scritto anche sulla scatola.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 1,
              "autocontrollo": 1,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "La signora alza ancora la voce: \"Quindi è colpa mia che non ho letto la scatola?\" Una delle coppie rimette giù il campione che aveva in mano.",
            "why": "Può anche essere vero, ma una regola tecnica detta a una persona arrabbiata suona come \"si arrangi\". E non hai ancora controllato niente."
          },
          {
            "text": "\"Non si preoccupi, signora: gliele cambiamo tutte entro lunedì, nessun problema.\"",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "strategia": -3,
              "assertivita": -1
            },
            "outcome": "La signora si calma subito. Dieci minuti dopo scopri che in magazzino non ci sono 22 mq dello stesso lotto del campione: hai promesso una cosa che non puoi mantenere.",
            "why": "Promettere per spegnere l'imbarazzo davanti agli altri clienti è il modo più rapido per trasformare un reclamo in una promessa mancata."
          },
          {
            "text": "Guardi la piastrella accanto al campione: \"Ha ragione, si vede. Venga di là, controlliamo subito il lotto.\"",
            "quality": "best",
            "effects": {
              "empatia": 2,
              "autocontrollo": 2,
              "lettura": 1,
              "strategia": 1
            },
            "outcome": "La signora ti segue, ancora tesa ma con la voce più bassa. Le due coppie tornano ai loro campioni.",
            "why": "Riconoscere ciò che è evidente toglie benzina alla rabbia, spostarsi in privato toglie il pubblico. Poi si guardano i fatti, compresi quelli di casa tua."
          },
          {
            "text": "\"Mi dispiace davvero, signora. Si sieda qui, le porto un caffè e mi racconta tutto con calma.\"",
            "quality": "good",
            "effects": {
              "empatia": 2,
              "autocontrollo": 1
            },
            "outcome": "Il tono scende, ma la signora racconta tre volte la stessa storia al tavolino dello showroom, e la piastrella resta sul bancone, sotto gli occhi di tutti.",
            "why": "Accogliere l'emozione va bene, ma senza guardare subito la piastrella sembra che tu stia prendendo tempo. E il pubblico è ancora lì."
          }
        ]
      },
      {
        "text": "In ufficio la signora si siede, il respiro ancora corto. Confronti le etichette: il campione è del lotto 214, le scatole consegnate sono tutte del 231, e del 214 in magazzino restano solo 14 mq. Lei: \"Il posatore viene lunedì alle 8. Se salta, il prossimo buco ce l'ha tra cinque settimane. E mio marito mi aveva detto di andare dall'altro negozio.\"",
        "escalation": "Ormai la signora non si fida più di quello che le dici.",
        "prompt": "Ora conosci il vero vincolo. Cosa fai?",
        "options": [
          {
            "text": "\"I 14 mq del lotto giusto glieli porto io oggi pomeriggio. Per il resto lunedì mattina chiedo i tempi alla fabbrica.\"",
            "quality": "good",
            "effects": {
              "strategia": 1,
              "empatia": 1,
              "assertivita": 1
            },
            "outcome": "La signora apprezza, ma chiede subito: \"E gli altri 8 metri? Il posatore non lascia il lavoro a metà.\" Hai risolto un pezzo, non il problema.",
            "why": "Mossa concreta e veloce, ma parziale: risolvi la parte che hai in mano senza aver capito cosa serve davvero lunedì."
          },
          {
            "text": "\"Quindi la cosa che non può saltare è lunedì. Cucina e bagno sono separati da una porta?\"",
            "quality": "best",
            "effects": {
              "lettura": 3,
              "strategia": 2,
              "empatia": 1
            },
            "outcome": "\"Sì, c'è la porta, e una soglia di marmo.\" La signora non capisce dove vuoi arrivare, tu sì: due lotti non vanno mai mescolati nella stessa stanza, ma in due stanze separate la differenza non si nota.",
            "why": "Hai capito che il problema vero non è il colore ma la data. Una domanda precisa apre una soluzione che nessuna scusa avrebbe trovato."
          },
          {
            "text": "\"Signora, le scatole sono integre: gliele cambio, ma il trasporto di andata e ritorno è a suo carico.\"",
            "quality": "bad",
            "effects": {
              "empatia": -2,
              "strategia": -1,
              "etica": -1,
              "assertivita": 1
            },
            "outcome": "La signora ti guarda incredula: \"Pago io il vostro errore?\" Prende il telefono e chiama il marito.",
            "why": "Non sai ancora di chi è l'errore e stai già mettendo le mani avanti sui costi. Il cliente sente che proteggi il margine, non lui."
          },
          {
            "text": "\"Chiamo io il suo posatore e gli spiego che due toni così vicini, se posati bene, non si notano.\"",
            "quality": "weak",
            "effects": {
              "strategia": 1,
              "assertivita": 1,
              "empatia": -1,
              "lettura": -1
            },
            "outcome": "Il posatore, in vivavoce, è secco: \"Due lotti nella stessa stanza non li metto, punto.\" La signora ti guarda come per dire: visto?",
            "why": "Scavalcare il professionista della cliente e minimizzare il suo dubbio ti mette contro due persone invece di una."
          }
        ]
      },
      {
        "text": "Alla fine la soluzione c'è: in cucina i 14 mq del lotto giusto, che porti oggi pomeriggio, e in bagno 8 mq di quelli già consegnati, dietro porta e soglia. La signora annuisce, poi aggiunge: \"Però per il disturbo mi dovete qualcosa. Mio marito dice che il 20% di sconto è il minimo.\" L'ordine vale 1.650 euro.",
        "escalation": "La tensione di prima ha lasciato il segno: la signora è passata al contrattacco.",
        "prompt": "Come rispondi alla richiesta di sconto?",
        "options": [
          {
            "text": "\"Signora, con tutto il rispetto: il problema gliel'abbiamo risolto in un'ora, di sabato. Lo sconto non c'entra.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Formalmente hai ragione, ma la signora se ne va gelida: \"Va bene. Lo racconterò a chi mi chiede dove ho comprato.\"",
            "why": "Chiudere la porta a qualsiasi gesto, dopo un disagio reale, vince la discussione e perde il passaparola."
          },
          {
            "text": "\"Va bene, facciamo il 20%. L'importante è che lei sia contenta e che lunedì il posatore lavori tranquillo.\"",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "assertivita": -2,
              "strategia": -2
            },
            "outcome": "La signora sorride e scrive subito al marito. Due mesi dopo una sua amica entra in showroom ed esordisce: \"Mi hanno detto che qui, se ci si lamenta, lo sconto arriva.\"",
            "why": "Uno sconto in percentuale dato sotto pressione non ripara il disagio: lo compra. E insegna che lamentarsi rende."
          },
          {
            "text": "\"Il 20% sarebbe davvero troppo, signora. Per il disagio le faccio il 5% sul totale della fattura, e chiudiamo qui.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "La signora tratta un po', poi accetta. Il caso è chiuso, ma hai ceduto margine senza legarlo a niente di concreto.",
            "why": "Contro-offerta ragionevole, ma lo sconto resta un prezzo pagato per il disturbo, non una risposta al disturbo."
          },
          {
            "text": "\"Sconto no. Però consegna e ritiro di oggi sono a carico nostro, e il battiscopa della cucina glielo regaliamo.\"",
            "quality": "best",
            "effects": {
              "strategia": 2,
              "empatia": 2,
              "assertivita": 2
            },
            "outcome": "La signora ci pensa un attimo: \"Il battiscopa... va bene, così mio marito sta zitto.\" Ride, per la prima volta da stamattina.",
            "why": "Rispondi al disagio con servizi concreti, che a te costano meno di quanto valgono per lei. Il prezzo resta intatto e il gesto si vede."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi il messaggio WhatsApp con cui riepiloghi alla signora la soluzione concordata.",
      "model": "Gentile signora, come d'accordo oggi alle 16 le consegniamo 14 mq del lotto 214 per la cucina e ritiriamo le scatole in più; in bagno il posatore userà quelle già consegnate. Consegna e battiscopa sono a carico nostro: ci scusiamo ancora per il disguido.",
      "keys": [
        {
          "label": "Soluzione chiara: cosa va dove",
          "terms": [
            "cucina",
            "bagno",
            "lotto",
            "14 mq",
            "stanz",
            "porta",
            "separat"
          ]
        },
        {
          "label": "Tempi precisi",
          "terms": [
            "oggi",
            "lunedì",
            "entro",
            "pomeriggio",
            "alle 1",
            "ore 1",
            "domani",
            "stasera"
          ]
        },
        {
          "label": "Scuse e gesto concreto",
          "terms": [
            "scus",
            "dispiace",
            "disguido",
            "a carico nostro",
            "offriamo",
            "omaggio",
            "nostro errore"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "L'errore era vostro: il lotto 214 era stato riservato all'ordine, ma giovedì Alessio aveva completato la consegna con un bancale del 231 per fare prima, senza guardare le etichette. Il posatore aveva rifiutato di iniziare perché l'anno prima un cliente non gli aveva pagato un pavimento con due toni. E alla signora, più del colore, bruciava dover dare ragione al marito.",
      "principle": "Prima i fatti, poi la difesa: e dietro ogni reclamo cerca il vincolo che il cliente non dice.",
      "tip": "Chiedi sempre: \"Qual è la cosa che non può assolutamente saltare?\" Poi costruisci la soluzione attorno a quella, non attorno alla lamentela."
    }
  },
  {
    "id": "lavoro-riunione-cantiere-accusa",
    "category": "lavoro",
    "difficulty": 3,
    "title": "Il capocantiere ti accusa davanti alla cliente",
    "setting": "Riunione di cantiere del martedì, nel container-ufficio di una palazzina di 24 appartamenti a Cremona. Ci sono l'ingegner Paola Ferrandi, titolare dell'impresa e tua cliente per 180.000 euro di pavimenti, e il suo capocantiere Sandro Maffi. Le tue squadre di posa sono in ritardo di sei giorni sul secondo piano; dal tuo capo squadra hai saputo solo che \"il piano non era pronto\".",
    "cast": [
      {
        "name": "Paola Ferrandi",
        "role": "ingegnere, titolare dell'impresa edile e tua cliente",
        "note": "asciutta, parla poco, prende appunti su un quaderno nero"
      },
      {
        "name": "Sandro Maffi",
        "role": "capocantiere dell'impresa",
        "note": "energico, sempre al telefono, dà del tu a tutti"
      },
      {
        "name": "Ivan",
        "role": "tuo capo squadra posatori",
        "note": "di poche parole, affidabile, oggi non è in riunione"
      }
    ],
    "objective": "Difendere il lavoro della tua squadra con i fatti, senza bruciare il rapporto con chi vedrai in cantiere per altri otto mesi.",
    "rounds": [
      {
        "text": "Sandro apre la riunione senza giri di parole: \"Le tue squadre sono lente. Due giorni ferme sul secondo piano e nessuno mi ha detto niente. Così il 15 non consegniamo.\" L'ingegner Ferrandi alza gli occhi dal quaderno e ti guarda, in attesa.",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Datemi dieci minuti. Sento il mio capo squadra e torno con i fatti, non con le scuse.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "strategia": 1
            },
            "outcome": "Sandro sbuffa: \"Intanto il tempo passa.\" Esci a telefonare, e per dieci minuti in sala resta solo la sua versione.",
            "why": "Prendere tempo per avere i fatti è sano, ma uscendo lasci a Sandro la scena e alla cliente una sola campana."
          },
          {
            "text": "\"Sandro, i miei sono i migliori che ho. Se si sono fermati, il problema era vostro, non loro.\"",
            "quality": "bad",
            "effects": {
              "autocontrollo": -2,
              "strategia": -2,
              "empatia": -1,
              "assertivita": 1
            },
            "outcome": "Sandro alza la voce: \"Ah, adesso è colpa nostra?\" La riunione diventa uno scontro tra due versioni, e tu non hai un solo dato per sostenere la tua.",
            "why": "Difendere la squadra d'istinto dà soddisfazione, ma senza fatti in mano è solo la tua parola contro la sua, davanti a chi paga."
          },
          {
            "text": "\"Mi dispiace, ingegnere. Recuperiamo sabato con una squadra in più, a spese nostre, così il 15 resta valido.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "empatia": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "L'ingegner Ferrandi annota il sabato. Sandro sorride appena: il ritardo, adesso, è ufficialmente tuo.",
            "why": "Scusarti e pagare il recupero prima di sapere cosa è successo significa firmare una colpa che forse non è tua."
          },
          {
            "text": "\"Quali giorni, esattamente? E in quei giorni il massetto del secondo piano era pronto per la posa?\"",
            "quality": "best",
            "effects": {
              "lettura": 2,
              "autocontrollo": 2,
              "strategia": 2
            },
            "outcome": "Sandro esita un attimo: \"Giovedì e venerdì. Pronto... sì, più o meno.\" L'ingegner Ferrandi scrive qualcosa sul quaderno: quel \"più o meno\" l'ha sentito anche lei.",
            "why": "Una domanda precisa e calma sposta la discussione dalle persone ai fatti, e lascia che sia la realtà a parlare al posto tuo."
          }
        ]
      },
      {
        "text": "La riunione passa ad altri punti, ma il telefono ti vibra in tasca. Ivan ti manda la foto dell'igrometro: 3,8% di umidità sul massetto del secondo piano, quando per posare il limite è il 2%. Sotto scrive: \"Sandro voleva che posassimo lo stesso. Abbiamo detto no e siamo andati a finire i battiscopa al primo piano.\" Tra poco la parola torna a te.",
        "escalation": "In sala l'aria è tesa, e Sandro ha già chiesto di mettere a verbale il ritardo delle tue squadre.",
        "prompt": "Hai la prova in mano. Come la usi?",
        "options": [
          {
            "text": "Chiedi a Sandro due minuti fuori dal container e gli mostri la foto, prima di parlarne davanti all'ingegner Ferrandi.",
            "quality": "good",
            "effects": {
              "empatia": 2,
              "strategia": 1,
              "lettura": 1
            },
            "outcome": "Sandro guarda la foto e si irrigidisce: \"Ok, ne parliamo dopo.\" Rientrate, ma il verbale riporta ancora \"ritardo squadre di posa\".",
            "why": "Proteggere la faccia di Sandro è intelligente, ma il problema riguarda il cantiere della cliente: tenerla fuori lascia a verbale una cosa non vera."
          },
          {
            "text": "Giri il telefono verso il tavolo, così lo vedono tutti: \"Ecco qua: 3,8%. Altro che squadre lente, Sandro. Volevi farci posare sul bagnato.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "empatia": -3,
              "strategia": -2,
              "autocontrollo": -1
            },
            "outcome": "Sandro diventa rosso e attacca sulla qualità dei battiscopa. Hai vinto il punto e ti sei fatto un nemico per otto mesi.",
            "why": "Hai i fatti dalla tua parte, ma umiliare qualcuno davanti al suo capo trasforma una prova in una vendetta. E chi è umiliato non collabora più."
          },
          {
            "text": "\"Ivan mi ha mandato la misura: massetto al 3,8%, limite 2%. Si sono fermati per evitare distacchi. Rifacciamo la misura insieme domattina?\"",
            "quality": "best",
            "effects": {
              "strategia": 2,
              "assertivita": 2,
              "autocontrollo": 1,
              "etica": 1
            },
            "outcome": "L'ingegner Ferrandi non sembra sorpresa: \"Bene. Domattina misura con la direzione lavori.\" La discussione passa dalle colpe alle date.",
            "why": "Porti il dato come un problema del cantiere, non come un'accusa: i fatti parlano e nessuno deve perdere la faccia per ascoltarli."
          },
          {
            "text": "Non dici niente in riunione: il verbale lo sistemerai più avanti, con calma, in privato, per non creare tensioni davanti alla cliente.",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "empatia": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "La riunione si chiude con \"ritardo squadre di posa\" a verbale. La sera Ivan ti scrive: \"Quindi la colpa è nostra?\"",
            "why": "Evitare la tensione oggi la scarica sulla tua squadra domani. Un verbale sbagliato diventa la verità ufficiale del cantiere."
          }
        ]
      },
      {
        "text": "A fine riunione l'ingegner Ferrandi ti accompagna alla macchina. Si assicura che nessuno senta, poi chiede: \"Mi dica la verità: Sandro vi ha chiesto di posare sul bagnato?\" Lunedì inizia il terzo piano, ancora con lui.",
        "escalation": "La riunione si è chiusa male, e il verbale non ti dà ragione.",
        "prompt": "Ti fa la domanda diretta. Cosa rispondi?",
        "options": [
          {
            "text": "\"Di preciso non so niente, ingegnere. Io guardo i numeri e la qualità della posa, il resto non lo seguo.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "strategia": 1,
              "etica": -2
            },
            "outcome": "L'ingegner Ferrandi ti guarda un secondo di troppo: \"Capisco.\" E ha capito anche un'altra cosa: quando serve, tu non dici le cose come stanno.",
            "why": "La reticenza sembra prudenza, ma davanti a una domanda diretta di chi paga suona come una mezza bugia. E la fiducia si incrina."
          },
          {
            "text": "\"Sì, me l'hanno riferito. Credo per la pressione sulla data, non per leggerezza. Dal terzo piano misuriamo l'umidità insieme, prima di ogni posa.\"",
            "quality": "best",
            "effects": {
              "etica": 2,
              "empatia": 2,
              "strategia": 2
            },
            "outcome": "Lei annuisce piano: \"Va bene. Le misure le facciamo con la direzione lavori.\" Poi, mentre sali in macchina: \"Ah, la settimana prossima parliamo del secondo lotto.\"",
            "why": "Dici la verità senza infierire e sposti subito l'attenzione su un metodo che impedisce di ripetere l'errore. Onesto, utile e senza vendette."
          },
          {
            "text": "\"Sì, e non è la prima volta. Se fossi in lei, su Sandro farei qualche riflessione seria, prima del terzo piano.\"",
            "quality": "bad",
            "effects": {
              "etica": -1,
              "empatia": -3,
              "strategia": -2,
              "assertivita": 1
            },
            "outcome": "L'ingegner Ferrandi si chiude: \"Del mio personale mi occupo io.\" Una settimana dopo Sandro sa tutto, e il terzo piano diventa una guerra.",
            "why": "Approfittare della domanda per regolare i conti ti fa sembrare uno che cerca un colpevole, non una soluzione. E le cose dette in privato arrivano sempre a destinazione."
          },
          {
            "text": "\"Preferisco che lo chieda direttamente a lui. Le dico cosa hanno fatto i miei: non hanno posato finché la misura non era a norma.\"",
            "quality": "good",
            "effects": {
              "etica": 1,
              "empatia": 1,
              "autocontrollo": 1
            },
            "outcome": "Lei apprezza la correttezza, ma resta con la domanda aperta: dovrà chiederlo a Sandro, che le darà la sua versione.",
            "why": "Corretto verso Sandro e onesto sui fatti, ma a una domanda diretta di chi paga una mezza risposta lascia spazio ai dubbi."
          }
        ]
      }
    ],
    "phrase": {
      "round": 1,
      "prompt": "Scrivi la frase con cui porti il dato in riunione, senza mettere Sandro alla gogna.",
      "model": "Ho appena ricevuto la misura: il massetto del secondo piano è al 3,8% di umidità, e per posare bisogna stare sotto il 2%. Non è un problema di nessuno in particolare: propongo di rifare la misura insieme domattina e di mettere a verbale la nuova data.",
      "keys": [
        {
          "label": "Dato tecnico preciso",
          "terms": [
            "3,8",
            "umidit",
            "massetto",
            "misura",
            "igrometr",
            "limite",
            "2%"
          ]
        },
        {
          "label": "Proposta concreta",
          "terms": [
            "propon",
            "rifare",
            "domattina",
            "domani",
            "verbale",
            "verific",
            "controll",
            "nuova data"
          ]
        },
        {
          "label": "Tono senza accuse",
          "terms": [
            "nessuno",
            "insieme",
            "non è colpa",
            "problema del cantiere",
            "tutti",
            "obiettivo",
            "capisco",
            "in particolare"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "L'ingegner Ferrandi sapeva già dal direttore lavori che il massetto del secondo piano era stato gettato con dieci giorni di ritardo: in riunione non cercava un colpevole, stava decidendo a chi affidare il secondo lotto da 2.400 mq. Sandro, al suo primo cantiere da capocantiere, le aveva promesso il 15 senza sentire la ditta dei massetti, e attaccare te era il modo per non dover ammettere la promessa sbagliata.",
      "principle": "Sotto accusa, chi guarda non giudica chi ha ragione: giudica come reagisci.",
      "tip": "Trasforma l'accusa in una domanda di fatto: \"Quali giorni, esattamente, e in che condizioni era il piano?\" Le domande precise smontano le versioni vaghe senza alzare la voce."
    }
  },
  {
    "id": "lavoro-architetto-collaboratrice",
    "category": "lavoro",
    "difficulty": 4,
    "title": "L'architetto che umilia la tua collaboratrice",
    "setting": "Showroom di Milano, giovedì pomeriggio. L'architetto Riccardo Galimberti, che da solo porta circa 120.000 euro di lavori l'anno, è al bancone con una sua cliente. Il parquet per l'attico della signora, 140 mq, è già consegnato e la posa è fissata per lunedì: è arrivato rovere liscio, e lui dice di aver chiesto spazzolato. Quando entri, sta alzando la voce con Chiara, la tua consulente.",
    "cast": [
      {
        "name": "Riccardo Galimberti",
        "role": "architetto, cliente importante",
        "note": "elegante, brillante con i clienti, abituato a essere servito subito"
      },
      {
        "name": "Chiara",
        "role": "consulente dello showroom da due anni",
        "note": "precisa e gentile; ora è rossa in viso e in silenzio"
      },
      {
        "name": "Signora Arrighi",
        "role": "cliente dell'architetto",
        "note": "osserva tutto senza dire una parola"
      }
    ],
    "objective": "Proteggere la tua collaboratrice e risolvere il problema, senza perdere il cliente e senza nascondere gli errori di nessuno.",
    "rounds": [
      {
        "text": "Galimberti, davanti alla signora Arrighi: \"Lei non capisce niente. Le avevo scritto spazzolato, spazzolato! Ma chi l'ha assunta?\" Chiara stringe una cartellina e non risponde. La signora guarda prima lei, poi te.",
        "prompt": "Cosa fai nei primi dieci secondi?",
        "options": [
          {
            "text": "\"Architetto, capisco l'arrabbiatura, e ha ragione a volerci vedere chiaro. Controlliamo subito insieme l'ordine: se c'è un errore, lo sistemiamo noi.\"",
            "quality": "good",
            "effects": {
              "empatia": 1,
              "autocontrollo": 2,
              "strategia": 1
            },
            "outcome": "Galimberti si calma di un grado: \"Lo spero bene.\" Ma resta lì accanto a Chiara, che continua a ricevere occhiate sprezzanti mentre cerca l'ordine.",
            "why": "Abbassi la temperatura e prendi in mano il problema, ma lasci Chiara esposta: per lei quei minuti durano un'ora."
          },
          {
            "text": "\"Architetto, signora, buongiorno. Da qui seguo io. Chiara, mi porti la pratica in ufficio, per favore.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "empatia": 2,
              "strategia": 2,
              "assertivita": 1
            },
            "outcome": "Chiara esce dalla scena con un compito, non con una sconfitta. Galimberti, senza più un bersaglio, ti segue in ufficio con la signora.",
            "why": "Togli il bersaglio senza umiliare nessuno: Chiara se ne va con dignità, l'architetto trova te come interlocutore e la cliente vede che qui qualcuno prende in mano le cose."
          },
          {
            "text": "\"Architetto, con questo tono qui dentro non si parla a nessuno. Né a Chiara né a me.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "etica": 1,
              "strategia": -2,
              "autocontrollo": -1
            },
            "outcome": "Galimberti, punto sul vivo davanti alla cliente, rilancia: \"Allora forse ho sbagliato negozio.\" Chiara è protetta, ma ora lo scontro è con te.",
            "why": "Il confine è giusto, ma metterlo davanti alla sua cliente lo costringe a difendere la propria faccia. Lo stesso messaggio arriva meglio in privato."
          },
          {
            "text": "\"Chiara, com'è possibile? Ti ho detto mille volte di ricontrollare gli ordini prima di mandarli ai clienti.\"",
            "quality": "bad",
            "effects": {
              "empatia": -3,
              "etica": -2,
              "strategia": 1,
              "autocontrollo": -1
            },
            "outcome": "Galimberti si calma, soddisfatto. Chiara abbassa gli occhi e, per il resto del pomeriggio, non dice più una parola a nessuno.",
            "why": "Sacrificare un collaboratore per compiacere un cliente funziona dieci minuti. Poi tutta la squadra impara che, quando sbaglia, qui viene esposta."
          }
        ]
      },
      {
        "text": "In ufficio apri la pratica. Il 3 settembre Galimberti aveva scritto \"rovere spazzolato\"; la conferma d'ordine preparata da Chiara dice \"liscio verniciato\", e porta la firma di Galimberti del 5 settembre. Lui non se n'è ancora accorto: \"Allora? Lo cambiate a vostre spese, e in fretta.\" Il cambio vale circa 9.000 euro, e lo spazzolato in magazzino c'è.",
        "escalation": "La scena al bancone ha lasciato il segno, e la signora Arrighi comincia a spazientirsi.",
        "prompt": "Hai le due carte davanti. Come ti muovi?",
        "options": [
          {
            "text": "Giri la conferma verso di lui: \"Architetto, questa l'ha firmata lei. Il problema non è nostro.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "empatia": -3,
              "strategia": -2
            },
            "outcome": "Galimberti impallidisce, poi esplode davanti alla sua cliente: \"Firmo cinquanta carte al giorno! Qui non metto più piede.\"",
            "why": "Hai ragione solo a metà e lo dici come una sentenza davanti alla sua cliente. Vinci la discussione e perdi 120.000 euro l'anno."
          },
          {
            "text": "\"Va bene, architetto, non perdiamo tempo. Cambiamo tutto a spese nostre e consegniamo venerdì, così la posa resta lunedì.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "strategia": -2,
              "assertivita": -1
            },
            "outcome": "Galimberti annuisce come se fosse ovvio. Hai salvato la posa, ma hai pagato 9.000 euro anche per una firma non tua, e lui non lo saprà mai.",
            "why": "Assorbire tutto evita lo scontro, ma lascia credere che l'errore sia solo vostro. La prossima conferma la firmerà di nuovo senza leggerla."
          },
          {
            "text": "\"Architetto, guardiamo i fatti: l'errore di trascrizione è nostro, la firma sulla conferma è sua. Il costo del cambio lo dividiamo a metà.\"",
            "quality": "good",
            "effects": {
              "etica": 2,
              "assertivita": 2,
              "strategia": 1,
              "empatia": -1
            },
            "outcome": "Galimberti si irrigidisce, guarda la firma, poi la signora: \"Va bene, va bene.\" Accetta, ma con l'aria di chi è stato colto in fallo davanti alla cliente.",
            "why": "Equo e chiaro, ma detto davanti alla signora colpisce la sua immagine: la soluzione è giusta, il momento no."
          },
          {
            "text": "\"Prima la signora: lo spazzolato ce l'ho, consegno venerdì e la posa resta lunedì. Sui costi, architetto, ci sentiamo stasera noi due.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "empatia": 2,
              "autocontrollo": 1
            },
            "outcome": "La signora Arrighi sorride per la prima volta. Galimberti annuisce, colto di sorpresa: ha capito che stasera si parlerà anche della sua firma, ma non davanti a lei.",
            "why": "Separi il problema della cliente da quello dei costi: risolvi subito il primo e porti il secondo in privato, dove si parla di responsabilità senza umiliare nessuno."
          }
        ]
      },
      {
        "text": "La sera chiami Galimberti per chiudere la questione dei costi. Lui taglia corto: \"Sui soldi ci mettiamo d'accordo. Ma quella ragazza sui miei progetti non la voglio più: mi mandi qualcun altro.\" Chiara, intanto, ti ha chiesto di parlarti domattina.",
        "escalation": "Galimberti ha in testa una sola cosa: chiudere la faccenda a modo suo.",
        "prompt": "Il cliente da 120.000 euro chiede di togliere Chiara. Cosa rispondi?",
        "options": [
          {
            "text": "\"Architetto, se basta un errore di trascrizione per chiedermi questo, forse è meglio che si cerchi un altro fornitore.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "etica": 1,
              "strategia": -3,
              "autocontrollo": -1
            },
            "outcome": "Lui, secco: \"Benissimo.\" Due settimane dopo i suoi nuovi progetti vanno a un concorrente: Chiara si sente difesa, ma hai perso un cliente che si poteva tenere.",
            "why": "Il confine c'è, ma un ultimatum a caldo trasforma una richiesta discutibile in una rottura. Difendere una persona non richiede di bruciare tutto."
          },
          {
            "text": "\"Va bene, architetto, la capisco benissimo. Da domani i suoi progetti li segue un altro collega, così lavoriamo tutti più sereni.\"",
            "quality": "bad",
            "effects": {
              "strategia": 1,
              "assertivita": -2,
              "etica": -1,
              "empatia": -1
            },
            "outcome": "Galimberti è soddisfatto. Il giorno dopo Chiara lo viene a sapere dal collega, e in showroom tutti capiscono quanto vale il loro lavoro quando un cliente alza la voce.",
            "why": "Cedere al cliente più forte su una persona della tua squadra costa poco oggi e molto domani: fiducia, impegno e, alla lunga, le persone migliori."
          },
          {
            "text": "\"L'errore c'è stato: da oggi le conferme le ricontrollo io. Ma la referente resta Chiara, e va trattata con rispetto.\"",
            "quality": "best",
            "effects": {
              "assertivita": 3,
              "etica": 2,
              "strategia": 2,
              "empatia": -1
            },
            "outcome": "Dopo una lunga pausa Galimberti, meno sicuro: \"Va bene. Ma quel controllo lo voglio davvero.\" La settimana dopo saluta Chiara con un buongiorno quasi cordiale.",
            "why": "Riconosci l'errore, rispondi alla sua preoccupazione vera con un controllo concreto e tieni fermo il confine sulla persona. Fermo, ma non contro di lui."
          },
          {
            "text": "\"Ne parlo con Chiara e domani le faccio sapere come ci organizziamo. Su una cosa così non voglio decidere al telefono.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "empatia": 1
            },
            "outcome": "Galimberti prende il rinvio per un sì. Domani dovrai comunque dirgli la tua decisione, ma partendo più debole.",
            "why": "Non decidere a caldo è prudente, ma un rinvio vago su una richiesta così lascia credere che tu stia per cedere."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi il messaggio che mandi all'architetto dopo la telefonata, per fissare la tua posizione.",
      "model": "Architetto, come detto al telefono, l'errore di trascrizione è nostro e da oggi ricontrollo io ogni conferma prima dell'invio. Chiara resta la sua referente: le chiedo di trattarla con lo stesso rispetto con cui noi trattiamo i suoi clienti.",
      "keys": [
        {
          "label": "Errore riconosciuto e correttivo",
          "terms": [
            "errore",
            "ricontroll",
            "controllo",
            "verific",
            "da oggi",
            "d'ora in poi",
            "prima dell'invio",
            "conferm"
          ]
        },
        {
          "label": "Chiara resta la referente",
          "terms": [
            "chiara",
            "referente",
            "resta",
            "continua",
            "segue",
            "seguirà"
          ]
        },
        {
          "label": "Richiesta di rispetto",
          "terms": [
            "rispetto",
            "toni",
            "tono",
            "cortesia",
            "collaborazione",
            "lavorare bene",
            "fiducia"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Galimberti firma le conferme senza leggerle, e lo sa: attaccare Chiara davanti alla signora Arrighi serviva a non far vedere che l'errore era passato anche da lui. Chiara, invece, si era accorta della discrepanza la settimana prima ma non te l'aveva detto: l'ultima volta che aveva sbagliato un ordine era stata ripresa davanti ai colleghi, e da allora gli errori preferisce nasconderli.",
      "principle": "Difendi le persone in pubblico e correggi gli errori in privato: dove c'è paura, gli errori si nascondono finché esplodono.",
      "tip": "Quando un cliente attacca un tuo collaboratore, togli il bersaglio dandogli un compito: \"Da qui seguo io. Mi porti la pratica in ufficio, per favore.\" Poi affronti tutto, errori compresi, a porte chiuse."
    }
  },
  {
    "id": "negoziazione-fornitore-aumento-listino",
    "category": "negoziazione",
    "difficulty": 2,
    "title": "Il fornitore annuncia l'aumento dell'8%",
    "setting": "Mancano dieci giorni alla fine di ottobre. Ti chiama Stefano Merlo, il commerciale di zona del tuo fornitore di parquet: dal primo novembre il listino sale dell'8%. Hai appena quotato a un'impresa 1.200 mq di parquet, circa 36.000 euro di acquisto da ordinare a dicembre. Con l'aumento perderesti quasi 2.900 euro di margine.",
    "cast": [
      {
        "name": "Stefano Merlo",
        "role": "commerciale di zona del fornitore di parquet",
        "note": "cordiale, vi conoscete da anni, oggi ha fretta di chiudere la telefonata"
      }
    ],
    "objective": "Proteggere il margine sul lavoro già quotato senza rovinare il rapporto con il fornitore.",
    "rounds": [
      {
        "text": "Stefano: \"Ti chiamo per correttezza, prima che arrivi la circolare. Materie prime, trasporti, energia: lo sai com'è. L'8% vale per tutti, non è una cosa contro di te.\" In sottofondo senti il rumore della macchina: sta guidando da un cliente all'altro.",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"L'8%? Allora comincio a guardarmi intorno. Di fornitori di parquet, qui in zona, ce ne sono quanti ne voglio.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "strategia": -2,
              "autocontrollo": -1,
              "lettura": -1
            },
            "outcome": "Stefano resta calmo: \"Fai pure, ma il nostro rovere è nel capitolato dell'impresa.\" Ha ragione, e lo sapete tutti e due: la minaccia si sgonfia da sola.",
            "why": "Una minaccia che non puoi sostenere ti toglie credibilità. Lui sa benissimo che il suo prodotto è già scritto nel tuo preventivo."
          },
          {
            "text": "\"Va bene, Stefano, se vale per tutti c'è poco da dire. Mandami la circolare quando esce, e ci sentiamo.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "empatia": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "Stefano ringrazia e chiude in fretta. Hai accettato l'aumento senza nemmeno chiedere se esistano eccezioni.",
            "why": "\"Vale per tutti\" è una frase che chiude le domande, non una legge. Accettarla subito ti fa rinunciare a sapere come funziona davvero."
          },
          {
            "text": "\"Grazie del preavviso. Ho 1.200 mq quotati ai prezzi vecchi: per i lavori già chiusi come vi regolate?\"",
            "quality": "best",
            "effects": {
              "lettura": 2,
              "strategia": 2,
              "assertivita": 1,
              "autocontrollo": 1
            },
            "outcome": "Stefano rallenta: \"Mmh, 1.200 mq... Per i lavori confermati entro fine mese qualcosa si può fare. Che tempi di consegna hai?\"",
            "why": "Invece di discutere l'aumento, chiedi come si gestiscono le eccezioni e metti sul tavolo un volume concreto. Le eccezioni esistono quasi sempre, ma solo per chi le chiede."
          },
          {
            "text": "\"Mandami la circolare per iscritto. La guardo con calma e domani ti richiamo.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "strategia": 1
            },
            "outcome": "Stefano promette la mail. Domani avrai il documento, ma dovrai riaprire tu il discorso, e lui avrà già sentito altri dieci clienti.",
            "why": "Prendere tempo evita una reazione d'istinto, ma perdi il momento in cui lui era al telefono e disponibile a parlare."
          }
        ]
      },
      {
        "text": "Stefano ci pensa un attimo. \"Facciamo così: se confermi l'ordine entro il 31 ottobre, ti tengo il prezzo vecchio. Però la merce deve partire a novembre.\" Il tuo cantiere la vuole a gennaio: anticipare vorrebbe dire pagare 36.000 euro due mesi prima e tenere venti bancali in magazzino.",
        "escalation": "Stefano adesso è più freddo: quello che ti offre, te lo offre come un favore personale.",
        "prompt": "Come rispondi alla proposta?",
        "options": [
          {
            "text": "\"Va bene, confermo entro il 31 e prendo la merce a novembre. Lo spazio in magazzino in qualche modo lo trovo.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "empatia": 1
            },
            "outcome": "Stefano è contento. Hai salvato il prezzo, ma per due mesi avrai 36.000 euro fermi in magazzino e venti bancali tra i piedi.",
            "why": "Accordo accettabile: salvi il margine, ma paghi in liquidità e spazio un vincolo che forse non era necessario."
          },
          {
            "text": "\"Confermo entro il 31, consegna a gennaio. A te conta l'ordine nel trimestre o la merce fuori dal magazzino?\"",
            "quality": "best",
            "effects": {
              "lettura": 3,
              "strategia": 2,
              "assertivita": 1
            },
            "outcome": "Stefano ride: \"Mi hai beccato. A me conta l'ordinato di ottobre.\" Poi aggiunge: \"Gennaio devo farlo approvare dal direttore, ma si può.\"",
            "why": "Separi due cose che lui aveva legato: la data dell'ordine e quella della consegna. Capire su cosa viene misurato l'altro ti dice dove ha margine."
          },
          {
            "text": "\"Confermo subito, ma visto il volume voglio anche un 3% di sconto in più.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 1,
              "strategia": -1,
              "lettura": -1
            },
            "outcome": "Stefano sospira: \"Il 3% non posso. Il prezzo vecchio entro il 31 sì, con consegna a novembre.\" Sei tornato al punto di partenza, con lui un po' più seccato.",
            "why": "Chiedere di più appena l'altro ti ha concesso qualcosa sembra avidità, non abilità. E sposta l'attenzione dal problema vero, la data di consegna."
          },
          {
            "text": "\"Un concorrente mi ha già offerto lo stesso rovere al 5% in meno. Pensaci bene prima di dirmi di no.\"",
            "quality": "bad",
            "effects": {
              "etica": -2,
              "strategia": -1,
              "lettura": -1
            },
            "outcome": "Stefano tace un secondo: \"Quel rovere in zona lo distribuiamo solo noi.\" Da oggi prenderà con le pinze tutto quello che dici.",
            "why": "Il bluff sembra furbo, ma un fornitore conosce il suo mercato meglio di te. Una bugia scoperta costa credibilità per anni."
          }
        ]
      },
      {
        "text": "Il giorno dopo Stefano ti richiama. \"Il direttore dice ok, prezzo vecchio e consegna a gennaio. Però ti chiede di mettere nello stesso ordine anche battiscopa e profili.\" Il battiscopa è comunque nel capitolato; i profili di solito li compri altrove al 6% in meno, circa 100 euro di differenza.",
        "escalation": "Dopo l'ultima telefonata Stefano è più formale, e ogni concessione ha un prezzo.",
        "prompt": "Il fornitore chiede qualcosa in cambio. Cosa fai?",
        "options": [
          {
            "text": "\"No, Stefano. O mi tieni il prezzo così com'è, o non se ne fa niente.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "strategia": -3,
              "empatia": -2
            },
            "outcome": "Stefano, gelido: \"Riferisco.\" Il direttore ritira la deroga e ti ritrovi con l'aumento pieno su tutto.",
            "why": "Irrigidirsi all'ultimo metro, quando l'altro ti ha già dato quasi tutto, trasforma una trattativa vinta in una persa."
          },
          {
            "text": "\"Va bene, battiscopa e profili nello stesso ordine, nessun problema. Ci sentiamo la settimana prossima per sistemare i dettagli.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "empatia": 1
            },
            "outcome": "La conferma arriva il 6 novembre, ma con i prezzi nuovi: \"Errore dell'ufficio, sistemo.\" Si sistema, dopo una settimana di mail.",
            "why": "La scelta è giusta, ma un accordo a voce che passa per tre persone va scritto subito, prima che arrivi la circolare."
          },
          {
            "text": "\"Il battiscopa sì, i profili no: da un altro fornitore li pago il 6% in meno, e lo sai anche tu.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 1,
              "strategia": -1,
              "lettura": -1
            },
            "outcome": "Stefano sbuffa: \"Devo risentire il direttore.\" Passano tre giorni senza risposta, e il 31 si avvicina.",
            "why": "Contrattare 100 euro di profili mentre ne stai salvando quasi 3.000 rischia l'accordo per un guadagno minimo. Conta il totale, non ogni riga."
          },
          {
            "text": "\"Ok, battiscopa e profili insieme. Mandami oggi la conferma scritta: prezzo vecchio, consegna a gennaio, 60 giorni.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "assertivita": 2,
              "lettura": 1
            },
            "outcome": "Stefano manda la conferma in serata. Il 6 novembre, quando la circolare arriva a tutti, il tuo ordine è già fissato nero su bianco.",
            "why": "Accetti uno scambio che ti conviene e lo blocchi per iscritto mentre tutti sono d'accordo. Le deroghe a voce durano fino alla prima circolare."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi l'email con cui chiedi a Stefano di confermare l'accordo per iscritto.",
      "model": "Ciao Stefano, come d'accordo confermo l'ordine di 1.200 mq di rovere, con battiscopa e profili, entro il 31 ottobre. Ti chiedo la conferma scritta con il prezzo del listino attuale, consegna a gennaio e pagamento a 60 giorni. Grazie per l'aiuto.",
      "keys": [
        {
          "label": "Prezzo bloccato",
          "terms": [
            "prezzo",
            "listino attuale",
            "listino vecchio",
            "senza aumento",
            "8%",
            "prezzi attuali",
            "invariat"
          ]
        },
        {
          "label": "Tempi di ordine e consegna",
          "terms": [
            "entro il 31",
            "31 ottobre",
            "gennaio",
            "consegna",
            "ordine",
            "data"
          ]
        },
        {
          "label": "Richiesta di conferma scritta",
          "terms": [
            "conferma scritta",
            "per iscritto",
            "nero su bianco",
            "conferma d'ordine",
            "mail",
            "ti chiedo",
            "mandami"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Stefano aveva un obiettivo trimestrale sull'ordinato e, a due settimane dalla chiusura, gli mancavano circa 40.000 euro: i tuoi 1.200 mq erano esattamente quello che cercava. E il direttore aveva già autorizzato tutti i commerciali a tenere il prezzo vecchio sui lavori confermati entro ottobre, ma Stefano quella possibilità la offriva solo a chi chiedeva: chi rispondeva \"va bene\" pagava l'8% in più.",
      "principle": "Il listino è la prima offerta, non l'ultima: chiedi sempre come si gestiscono le eccezioni.",
      "tip": "Quando arriva un aumento, metti sul tavolo un volume concreto e chiedi: \"Per gli ordini già in programma come vi organizzate?\" Poi tieni separate la data dell'ordine e quella della consegna."
    }
  },
  {
    "id": "negoziazione-impresa-pagamenti-ritardo",
    "category": "negoziazione",
    "difficulty": 3,
    "title": "L'impresa che non paga e ordina ancora",
    "setting": "L'impresa di Fabio Rinaldi è tua cliente da dieci anni. Oggi ti deve 38.600 euro su due fatture scadute da 75 giorni, e ti chiama per altri 9.000 euro di materiale da consegnare giovedì in cantiere. In passato ha sempre pagato, magari in ritardo; questa volta in amministrazione ti hanno già chiesto due volte \"cosa facciamo con Rinaldi\".",
    "cast": [
      {
        "name": "Fabio Rinaldi",
        "role": "titolare di un'impresa edile",
        "note": "simpatico, sempre di corsa, ti chiama per nome e ti dà pacche sulla spalla"
      },
      {
        "name": "Lorenzo",
        "role": "geometra dell'impresa",
        "note": "giovane e preciso, entra ed esce dall'ufficio di Fabio con fogli in mano"
      }
    ],
    "objective": "Rientrare dei soldi senza fermare il cantiere di un cliente storico e senza aumentare l'esposizione.",
    "rounds": [
      {
        "text": "Fabio, al telefono: \"Mi serve il materiale per giovedì, sennò mi si ferma il terzo piano. Per le fatture lo sai: appena il committente mi paga il SAL, ti saldo tutto. Siamo amici, no?\" Il materiale ce l'hai in magazzino.",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Fabio, mi dispiace, ma finché non saldi lo scaduto dal magazzino non esce più niente. Neanche un bancale, neanche per giovedì.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Fabio si offende: \"Dopo dieci anni mi tratti così?\" Chiude la telefonata e per giovedì chiama un altro fornitore, mentre i tuoi 38.600 euro restano dove sono.",
            "why": "Il blocco totale è legittimo, ma usato come prima mossa chiude la trattativa e ti toglie l'unica leva che avevi: il materiale che gli serve."
          },
          {
            "text": "\"Va bene, giovedì te lo mando, figurati. Per le fatture ne parliamo con calma quando arriva il SAL.\"",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "assertivita": -2,
              "strategia": -3
            },
            "outcome": "Fabio ringrazia di cuore. Giovedì il materiale parte e la tua esposizione sale a 47.600 euro, senza una data in mano.",
            "why": "Ogni consegna senza condizioni a un cliente in ritardo è un prestito senza garanzie. E gli insegna che con te si può aspettare."
          },
          {
            "text": "\"Il SAL quando arriva, esattamente? Mi servono una data e un importo.\"",
            "quality": "good",
            "effects": {
              "lettura": 2,
              "assertivita": 1,
              "strategia": 1
            },
            "outcome": "Fabio resta sul vago: \"Fine mese, più o meno. Sai come sono i committenti.\" Hai fatto la domanda giusta, ma la consegna di giovedì è rimasta fuori dal discorso.",
            "why": "Chiedere date precise è fondamentale, ma tenendo separati il nuovo ordine e il vecchio debito perdi la tua leva più forte."
          },
          {
            "text": "\"Giovedì si può fare, ma nuovo ordine e fatture aperte li decidiamo insieme. Domattina alle 9 sono da te.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "assertivita": 2,
              "empatia": 1
            },
            "outcome": "Fabio esita, poi: \"Va bene, ti aspetto.\" Hai legato le due cose senza chiudere la porta, e la trattativa si fa di persona.",
            "why": "Non dici no e non dici sì: leghi il nuovo ordine al vecchio debito e porti la discussione faccia a faccia, dove le promesse vaghe reggono meno."
          }
        ]
      },
      {
        "text": "Il giorno dopo sei nel suo ufficio. Fabio stacca un assegno: \"Ecco 10.000 adesso. Il resto a fine mese, promesso, e giovedì mi mandi il materiale.\" Lorenzo entra, posa un foglio sulla scrivania e dice a mezza voce: \"Fabio, quello del ferro vuole il saldo entro lunedì, come gli altri.\"",
        "escalation": "Dopo la telefonata di ieri Fabio è convinto di avere lui il coltello dalla parte del manico.",
        "prompt": "Cosa proponi?",
        "options": [
          {
            "text": "\"Va bene, prendo l'assegno. Giovedì parte tutto, e per il resto ci sentiamo a fine mese.\"",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "strategia": -2,
              "assertivita": -2
            },
            "outcome": "Fabio ti stringe la mano, soddisfatto. Esci con 10.000 euro e, con il nuovo materiale, un'esposizione ancora di 37.600 euro, senza una sola data scritta.",
            "why": "Un acconto dà sollievo, ma se la nuova consegna lo riassorbe sei di nuovo al punto di partenza. \"Fine mese\" non è una data."
          },
          {
            "text": "\"L'assegno lo prendo. Il materiale di giovedì lo paghi alla consegna, e i 28.600 restanti in due date: 15 e 30 novembre.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "assertivita": 2,
              "lettura": 1
            },
            "outcome": "Fabio fa una smorfia: \"Alla consegna?\" Ma sa di non avere alternative rapide per giovedì, e apre l'agenda.",
            "why": "Smetti di aumentare l'esposizione: il nuovo si paga subito, il vecchio rientra con date precise. Una condizione dura ma pulita, senza minacce."
          },
          {
            "text": "\"Ho sentito bene? Il ferro lo stai pagando. Quindi i soldi ci sono. Perché a me no?\"",
            "quality": "weak",
            "effects": {
              "lettura": 2,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Fabio arrossisce e fulmina Lorenzo con lo sguardo: \"Il ferro mi blocca il cantiere, tu no.\" È vero, ma ora si discute del tuo tono, non delle tue fatture.",
            "why": "Hai letto bene l'indizio, ma usarlo come accusa umilia Fabio davanti al suo geometra. Una buona lettura va usata, non sbattuta in faccia."
          },
          {
            "text": "\"Facciamo 20.000 adesso e il resto entro fine mese. Poi giovedì il materiale parte.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "strategia": 1
            },
            "outcome": "Fabio tratta e arriva a 15.000. Va meglio, ma il resto rimane appeso a un \"fine mese\" e il nuovo materiale si aggiunge al conto.",
            "why": "Alzare l'acconto è un passo avanti, ma senza date scritte e senza condizioni sulla nuova consegna il problema si ripresenterà."
          }
        ]
      },
      {
        "text": "Fabio si appoggia allo schienale e cambia tono: \"Senti, dopo dieci anni mi tratti come uno sconosciuto? Le condizioni si fanno a chi non si conosce. Mi offendi, sai.\" Lorenzo, sulla porta, finge di leggere un foglio.",
        "escalation": "Il clima è teso, e Fabio decide di giocarsi la carta più pesante.",
        "prompt": "Fabio gioca la carta dell'amicizia. Cosa fai?",
        "options": [
          {
            "text": "\"Non è sfiducia, Fabio, davvero: sono troppo esposto con tutti e devo rientrare. Te lo dico in faccia proprio perché ti rispetto.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "etica": 1,
              "empatia": 1
            },
            "outcome": "Fabio sbuffa ma accetta le date. Resta un po' di amaro: ha sentito il motivo, ma non quando si tornerà alla normalità.",
            "why": "Onesto e diretto, ma senza una via d'uscita la condizione sembra per sempre, e lui la vive come una retrocessione."
          },
          {
            "text": "\"Fabio, gli affari sono affari. L'amicizia è una cosa, ma non paga i miei fornitori a fine mese.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Fabio si irrigidisce: \"Ok. Allora parliamo d'affari.\" Accetta le date, ma da quel giorno ogni tuo preventivo lo confronta con altri tre fornitori.",
            "why": "Il contenuto è giusto, la frase è gelida: tratti da estraneo proprio chi ti sta chiedendo di non essere trattato come tale."
          },
          {
            "text": "Lasci passare qualche secondo: \"Proprio per i dieci anni, giovedì il materiale parte. Rispettate le due date, torniamo ai 60 giorni.\"",
            "quality": "best",
            "effects": {
              "empatia": 2,
              "assertivita": 2,
              "strategia": 2,
              "autocontrollo": 1
            },
            "outcome": "Fabio ci pensa, poi tende la mano: \"Va bene. 15 e 30, hai la mia parola, e te lo metto per iscritto.\" Lorenzo, sulla porta, sorride appena.",
            "why": "Non reagisci di getto, riconosci il rapporto senza usarlo come moneta e indichi una strada chiara per tornare alla normalità. Una condizione temporanea con un'uscita si accetta molto meglio di una punizione."
          },
          {
            "text": "\"Hai ragione, scusa, non volevo offenderti. Lasciamo stare le condizioni: so che alla fine paghi sempre.\"",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "assertivita": -3,
              "strategia": -2
            },
            "outcome": "Fabio sorride e ti dà una pacca sulla spalla. Le fatture si salderanno a febbraio, dopo altre quattro telefonate.",
            "why": "Il senso di colpa è una leva: se funziona una volta, verrà usata ancora. La fiducia non si dimostra rinunciando alle date."
          }
        ]
      }
    ],
    "phrase": {
      "round": 1,
      "prompt": "Scrivi l'email di riepilogo dell'accordo che mandi a Fabio dopo l'incontro.",
      "model": "Ciao Fabio, grazie per l'incontro. Come d'accordo: assegno di 10.000 euro oggi, materiale di giovedì pagato alla consegna e i 28.600 euro restanti in due rate, entro il 15 e il 30 novembre. Rispettate queste date, torniamo ai soliti 60 giorni, come in questi dieci anni.",
      "keys": [
        {
          "label": "Importi e date precisi",
          "terms": [
            "10.000",
            "28.600",
            "15",
            "30 novembre",
            "entro",
            "rate",
            "scadenz"
          ]
        },
        {
          "label": "Condizione sulla nuova consegna",
          "terms": [
            "alla consegna",
            "contrassegno",
            "giovedì",
            "pagato",
            "anticipat",
            "prima della consegna"
          ]
        },
        {
          "label": "Rapporto e via d'uscita",
          "terms": [
            "torniamo",
            "60 giorni",
            "dieci anni",
            "come sempre",
            "grazie",
            "collaborazione",
            "rapporto"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Il SAL del committente era arrivato dodici giorni prima. Fabio non era in malafede: con quei soldi aveva pagato prima il fornitore del ferro e il noleggio della gru, che minacciavano di fermare il cantiere. I soldi non mancavano, c'era una fila: e tu eri in fondo perché eri l'unico che non chiedeva mai una data.",
      "principle": "Chi chiede con date precise viene pagato; chi aspetta con pazienza finisce in fondo alla fila.",
      "tip": "Lega sempre il nuovo al vecchio: \"La consegna di giovedì e le fatture aperte le decidiamo insieme.\" Poi trasforma ogni promessa in una data scritta."
    }
  },
  {
    "id": "negoziazione-developer-giacarta",
    "category": "negoziazione",
    "difficulty": 5,
    "title": "Il developer di Giacarta chiede il 22%",
    "setting": "Giacarta, sala riunioni al trentesimo piano. La tua società di distribuzione tratta con un grande developer la fornitura di 16.000 mq di gres italiano per una torre residenziale: circa 460.000 euro, il contratto più importante dell'anno. Al tavolo ci sono Ibu Ratna, responsabile acquisti, e Pak Budi, responsabile del progetto; accanto a te siede Dimas, il tuo responsabile commerciale locale. Il tuo margine lordo è del 28%.",
    "cast": [
      {
        "name": "Ibu Ratna",
        "role": "responsabile acquisti del developer",
        "note": "cortese, sorride spesso, precisissima sui numeri"
      },
      {
        "name": "Pak Budi",
        "role": "responsabile del progetto",
        "note": "giovane e silenzioso, prende appunti e non interviene quasi mai"
      },
      {
        "name": "Dimas",
        "role": "tuo responsabile commerciale a Giacarta",
        "note": "conosce bene il cliente e ti suggerisce le cose sottovoce"
      }
    ],
    "objective": "Chiudere il contratto con un margine sano, senza far perdere la faccia a nessuno al tavolo.",
    "rounds": [
      {
        "text": "Dopo il tè e dieci minuti di complimenti sul prodotto, Ratna apre il fascicolo: \"Pak, la collezione ci piace molto. Ma il budget è il budget: un concorrente ci offre il 22% in meno. Potete allinearvi?\" Budi scrive qualcosa e non alza gli occhi.",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Il 22% è impossibile, Ibu. Quel concorrente vende un prodotto di livello inferiore, e credo che lo sappiate anche voi.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "empatia": -3,
              "lettura": -2,
              "strategia": -1
            },
            "outcome": "Ratna continua a sorridere, ma il sorriso si irrigidisce: \"Certo, Pak. Ne terremo conto.\" Le hai appena detto, davanti a un collega, che non sa valutare un'offerta.",
            "why": "Svalutare il suo giudizio davanti a un collega le fa perdere la faccia. Nessun argomento sul prodotto recupera quel danno."
          },
          {
            "text": "\"Grazie per la franchezza, Ibu. Il 22% non posso farlo senza togliere qualcosa al progetto. Mi aiuta a capire com'è costruito il vostro budget?\"",
            "quality": "best",
            "effects": {
              "lettura": 2,
              "empatia": 2,
              "strategia": 2,
              "assertivita": 1
            },
            "outcome": "Ratna ti osserva un momento, poi gira il fascicolo di qualche grado verso di te: \"Il budget ha una logica precisa. Gliela spiego.\"",
            "why": "Dici un no chiaro senza chiudere, e trasformi una richiesta di sconto in un problema da risolvere insieme. Chiedere del suo vincolo è anche un modo di rispettarla."
          },
          {
            "text": "\"Capisco, Ibu. Mi lasci verificare con la fabbrica in Italia cosa possiamo fare, e le faccio sapere entro venerdì.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "Ratna annuisce soddisfatta. Le hai appena comunicato che il prezzo è trattabile e che il 22% è un punto di partenza credibile.",
            "why": "Rimandare a un'autorità esterna sembra prudente, ma segnala che il prezzo è morbido. Venerdì dovrai partire da un'aspettativa altissima."
          },
          {
            "text": "\"Possiamo vedere insieme il capitolato del concorrente? Vorrei essere sicuro che stiamo confrontando lo stesso prodotto, con gli stessi spessori e la stessa scelta.\"",
            "quality": "good",
            "effects": {
              "lettura": 2,
              "strategia": 2,
              "empatia": -1
            },
            "outcome": "Ratna sorride: \"Le offerte degli altri fornitori sono riservate, Pak.\" La domanda era legittima, ma l'ha costretta a dirti di no davanti a Budi.",
            "why": "Verificare che il confronto sia corretto è giusto, ma chiedere carte riservate la mette in difficoltà. Meglio chiedere dei criteri che dei documenti."
          }
        ]
      },
      {
        "text": "Ratna ti spiega il vincolo con calma: \"Il budget è stato fissato al 12% sotto la vostra prima offerta. Io devo rispettarlo.\" Budi, per la prima volta, parla: \"L'atrio e gli appartamenti campione devono restare con la vostra collezione. Pak Hendra ci tiene.\" Pak Hendra è il fondatore del gruppo.",
        "escalation": "Il clima al tavolo si è raffreddato: Ratna resta cortese, ma ora pesa ogni parola.",
        "prompt": "Ora sai che l'obiettivo vero è il 12%. Che proposta fai?",
        "options": [
          {
            "text": "\"Per arrivare al 12% dovreste affidarci anche la seconda torre. Si può scrivere nel contratto?\"",
            "quality": "weak",
            "effects": {
              "strategia": 1,
              "assertivita": 1,
              "lettura": -1,
              "empatia": -1
            },
            "outcome": "Ratna sorride, imbarazzata: \"La seconda torre non è ancora approvata, Pak.\" Le hai chiesto un impegno che non può prendere, e lo sapevi.",
            "why": "Legare lo sconto al volume è logico, ma chiederlo a chi non ha il potere di deciderlo la mette all'angolo. Una proposta deve stare dentro il suo margine di manovra."
          },
          {
            "text": "\"Visto che la collezione l'ha scelta Pak Hendra, forse è meglio che ne parli direttamente con lui. Così decidiamo prima.\"",
            "quality": "bad",
            "effects": {
              "strategia": -2,
              "empatia": -3,
              "lettura": -1,
              "assertivita": 1
            },
            "outcome": "Ratna chiude il fascicolo con un sorriso perfetto: \"Certo, Pak. Organizzeremo.\" Dimas, sottovoce: \"Adesso ce l'hai contro per tutto il progetto.\"",
            "why": "Scavalcare chi tratta con te, davanti a un suo collega, le fa perdere la faccia. Anche se il fondatore ti desse ragione, sarà lei a gestire ordini e pagamenti."
          },
          {
            "text": "\"Proposta: atrio, appartamenti campione e piani alti con la vostra collezione; bagni di servizio e corridoi con una serie italiana più semplice. Totale: meno 12%.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "lettura": 2,
              "empatia": 1
            },
            "outcome": "Ratna rifà i conti sulla calcolatrice e alza gli occhi: \"Dodici...\" Budi annuisce piano, e il tuo sconto sul listino è rimasto al 4%: il resto lo fa la composizione.",
            "why": "Non tagli il prezzo, cambi cosa c'è dentro. Ratna rientra nel budget, il fondatore ha il gres italiano dove si vede e il tuo margine resta sano."
          },
          {
            "text": "\"Posso arrivare al 7% di sconto, con consegne a scaglioni e pagamento a 60 giorni dalla consegna di ogni lotto.\"",
            "quality": "good",
            "effects": {
              "strategia": 1,
              "assertivita": 1,
              "empatia": 1
            },
            "outcome": "Ratna prende nota, cortese: \"Ci avviciniamo, Pak.\" Ma al 12% mancano cinque punti, e il tuo margine si è già ridotto di un quarto.",
            "why": "Contro-offerta onesta, ma lavori solo sul prezzo: ogni punto che concedi è margine tuo, e il suo obiettivo resta lontano."
          }
        ]
      },
      {
        "text": "Ratna sorride: \"Iya, Pak, interessante. Kami pelajari dulu: la studiamo.\" Poi, quasi di passaggio: \"Nel contratto c'è la nostra penale standard: 1% al giorno di ritardo, senza tetto.\" La tua merce viaggia sei settimane via nave e deve passare dogana e certificazione obbligatoria SNI. Dimas ti sussurra: \"Quel 'la studiamo' non è ancora un sì.\"",
        "escalation": "Ratna ormai è cortese ma distante, e Budi ha smesso di prendere appunti.",
        "prompt": "Cosa fai?",
        "options": [
          {
            "text": "\"Sulla penale, se mi permette, le mando domani una proposta scritta, così la valutate con calma insieme alla nuova composizione.\"",
            "quality": "good",
            "effects": {
              "lettura": 2,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "Ratna annuisce, sollevata di non dover discutere al tavolo. Nel frattempo, però, il loro ufficio legale prepara la bozza con la clausola standard.",
            "why": "Rispetti il suo \"la studiamo\" e non forzi, ma rimandare senza dire cosa ti serve lascia che sia la loro bozza a diventare il punto di partenza."
          },
          {
            "text": "\"Ibu, con tutto il rispetto: una penale senza tetto, con sei settimane di nave e la dogana, non la firma nessun fornitore serio.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "lettura": 1,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Ratna resta impassibile: \"È la nostra politica per tutti, Pak.\" Davanti a Budi, hai appena definito poco seria la regola della sua azienda.",
            "why": "Sul merito hai ragione, ma una frase così trasforma una clausola in una questione d'orgoglio. Il no va dato su una proposta, non su un giudizio."
          },
          {
            "text": "\"Va bene anche la penale, nessun problema. Allora siamo d'accordo su tutto? Stasera stessa le mando il contratto da firmare.\"",
            "quality": "bad",
            "effects": {
              "lettura": -3,
              "strategia": -3,
              "assertivita": 1
            },
            "outcome": "Ratna sorride: \"Iya, Pak.\" Il contratto resta tre settimane senza risposta, e quando torna ha ancora la penale senza tetto, più due nuove richieste.",
            "why": "Hai scambiato la cortesia per un sì e accettato un rischio illimitato pur di chiudere. Incalzare dopo un \"la studiamo\" mette pressione e fa perdere la faccia."
          },
          {
            "text": "\"Penale sì, con tetto al 5% ed esclusi i ritardi documentati di dogana e SNI. In cambio, teniamo una scorta qui a Giacarta.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "lettura": 2,
              "assertivita": 1
            },
            "outcome": "Ratna guarda Budi, che annuisce, poi dice: \"La scorta qui è una buona idea, Pak. La mettiamo nella bozza.\" Dimas ti fa un mezzo sorriso: questa volta è un sì vero.",
            "why": "Accetti il principio, limiti il rischio che non controlli e rispondi alla loro paura vera, i cantieri fermi, con una garanzia concreta. Nessuno perde la faccia."
          }
        ]
      }
    ],
    "phrase": {
      "round": 1,
      "prompt": "Scrivi la frase con cui presenti la nuova proposta a Ratna, davanti a Budi.",
      "model": "Ibu Ratna, grazie per averci spiegato il vostro budget. Proponiamo di tenere la vostra collezione nell'atrio, negli appartamenti campione e ai piani alti, e una serie italiana più semplice nei bagni di servizio e nei corridoi tecnici: così il totale scende del 12% e rientra nel vostro obiettivo.",
      "keys": [
        {
          "label": "La collezione resta dove si vede",
          "terms": [
            "atrio",
            "appartamenti campione",
            "piani alti",
            "collezione",
            "resta",
            "dove si vede",
            "ingresso"
          ]
        },
        {
          "label": "Rientro nel budget",
          "terms": [
            "budget",
            "12%",
            "12 %",
            "rientr",
            "obiettivo",
            "scende",
            "risparmi",
            "totale"
          ]
        },
        {
          "label": "Rispetto per l'interlocutrice",
          "terms": [
            "grazie",
            "ibu",
            "vostro",
            "insieme",
            "rispett",
            "come ci ha",
            "apprezz"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Pak Budi, il più silenzioso al tavolo, è il nipote del fondatore e gli riferisce ogni riunione: la collezione italiana per atrio e appartamenti campione era già decisa, perché le brochure con scritto \"design italiano\" erano in stampa. Ibu Ratna non rischiava di perdere il fornitore, rischiava la faccia sul budget: il suo premio annuale dipende dal risparmio percentuale. Se l'avessi scavalcata o messa in difficoltà, avresti firmato lo stesso, ma poi avresti aspettato i pagamenti per mesi.",
      "principle": "Chi decide e chi può rallentarti sono spesso persone diverse: trattale entrambe con rispetto.",
      "tip": "Quando il prezzo non si muove, cambia cosa c'è dentro: \"Teniamo il prodotto scelto dove si vede e semplifichiamo dove non si vede.\" L'altro raggiunge il suo obiettivo e tu non regali margine."
    }
  },
  {
    "id": "leadership-computo-sbagliato",
    "category": "leadership",
    "difficulty": 2,
    "title": "Il tecnico junior che ha sbagliato il computo",
    "setting": "Lunedì, ore 8:15. Il cliente di un appartamento a Cremona chiama furioso: il parquet consegnato venerdì non basta, mancano 14 metri quadri e i posatori sono fermi. Il computo l'ha fatto Matteo, 26 anni, da otto mesi nel tuo ufficio tecnico e finora non ha mai sbagliato. Il materiale mancante, con il trasporto urgente, costa circa 1.100 euro.",
    "cast": [
      {
        "name": "Matteo",
        "role": "tecnico junior dell'ufficio tecnico",
        "note": "preciso e riservato, sotto pressione tende a chiudersi"
      },
      {
        "name": "Paolo",
        "role": "venditore senior",
        "note": "brillante con i clienti, sempre in giro, porta un terzo del fatturato"
      }
    ],
    "objective": "Rimediare al danno con il cliente e capire cosa è andato storto senza spegnere un collaboratore valido.",
    "rounds": [
      {
        "text": "Matteo entra nel tuo ufficio pallido, con il portatile in mano. \"Ho visto la mail del cliente. Non so come sia successo, il computo l'ho controllato tre volte.\" Intanto il cliente ha già richiamato due volte il centralino.",
        "prompt": "Cosa gli dici?",
        "options": [
          {
            "text": "\"Tranquillo, capita a tutti, anche ai migliori. Siediti, riapriamo il file insieme e vediamo con calma dove si è inceppato il calcolo.\"",
            "quality": "good",
            "effects": {
              "empatia": 2,
              "autocontrollo": 1,
              "lettura": 1,
              "strategia": -1
            },
            "outcome": "Matteo si rilassa un po' e apre il file. Mentre cercate l'errore il cliente chiama per la terza volta, e il centralino non sa più cosa rispondergli.",
            "why": "Il tono è giusto, ma l'analisi può aspettare: con un cantiere fermo la priorità è limitare il danno, non capire il perché."
          },
          {
            "text": "\"Tre volte? E allora come mancano 14 metri? Adesso mi spieghi tu cosa dico al cliente.\"",
            "quality": "bad",
            "effects": {
              "autocontrollo": -2,
              "empatia": -2,
              "assertivita": 1,
              "strategia": -1
            },
            "outcome": "Matteo abbassa lo sguardo e balbetta qualcosa sulle misure. Esce senza una soluzione e per tutta la mattina non alza la testa dallo schermo.",
            "why": "La rabbia dà sollievo a te, ma a lui toglie la lucidità proprio quando ti serve. E intanto nessuno sta parlando con il cliente."
          },
          {
            "text": "\"Del perché parliamo nel pomeriggio. Ora chiama il fornitore e alle 10 dimmi quando arriva il materiale. Il cliente lo chiamo io.\"",
            "quality": "best",
            "effects": {
              "strategia": 2,
              "autocontrollo": 2,
              "assertivita": 1,
              "empatia": 1
            },
            "outcome": "Matteo annuisce, quasi sollevato di avere un compito preciso. Alle 9:50 torna: il fornitore consegna in sette giorni invece di dieci. Tu intanto hai calmato il cliente con una data.",
            "why": "Prima si ferma l'emorragia, poi si cerca la causa. Dare a chi ha sbagliato un compito concreto per rimediare lo rimette in piedi più di qualsiasi rassicurazione."
          },
          {
            "text": "\"Lascia stare, al cliente e al fornitore penso io. Tu riguarda le altre commesse della settimana, che non ci sia qualche altro errore.\"",
            "quality": "weak",
            "effects": {
              "strategia": 1,
              "assertivita": 1,
              "empatia": -1,
              "lettura": -1
            },
            "outcome": "Sistemi tutto tu in un'ora. Matteo passa la mattina a ricontrollare file già giusti, convinto che tu non ti fidi più di lui.",
            "why": "Togliere il problema dalle mani di chi l'ha creato sembra protettivo, ma comunica sfiducia e gli toglie la possibilità di rimediare."
          }
        ]
      },
      {
        "text": "Nel pomeriggio vi sedete con il computo aperto. Le misure usate sono quelle del sopralluogo di marzo, prima che ad aprile il cliente facesse abbattere la parete della cucina. Matteo fissa lo schermo: \"Ho usato le misure che c'erano in cartella. Avrei dovuto ricontrollare.\" Non aggiunge altro.",
        "escalation": "Matteo è ancora scosso dalla mattinata e sta sulla difensiva.",
        "prompt": "Come vai avanti?",
        "options": [
          {
            "text": "\"Per un mese i tuoi computi li ricontrolla Paolo prima che partano gli ordini. Non è una punizione, è prudenza.\"",
            "quality": "bad",
            "effects": {
              "lettura": -2,
              "empatia": -2,
              "strategia": -1,
              "assertivita": 1
            },
            "outcome": "Matteo dice solo \"Va bene.\" Paolo, informato, sbuffa: \"Ci mancava anche questa.\" Il problema di fondo resta esattamente dov'era.",
            "why": "Mettere sotto tutela chi ha sbagliato senza capire come è successo è punire alla cieca. Chiamarla prudenza non cambia come la vive lui."
          },
          {
            "text": "\"Non pensarci più: il cliente è sistemato e il fornitore ha anticipato. Chiudiamola qui e andiamo avanti.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "lettura": -1,
              "strategia": -2
            },
            "outcome": "Matteo ti ringrazia, sollevato. Nessuno dei due sa perché in cartella c'erano misure vecchie, e la cartella resta com'era.",
            "why": "Chiudere in fretta toglie il disagio, ma un errore di cui non si conosce la causa torna, magari su un cantiere più grande."
          },
          {
            "text": "\"D'ora in poi ogni computo sopra i 50 metri quadri lo ricontrollate in due prima dell'ordine. Così un errore del genere non passa più.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "assertivita": 1,
              "autocontrollo": 1,
              "lettura": -1
            },
            "outcome": "Matteo annuisce, sollevato di non essere sotto accusa. La regola è sensata, ma nessuno ha ancora chiesto perché in cartella c'erano misure di due mesi prima.",
            "why": "Un doppio controllo è utile, ma ripara il sintomo. Prima di aggiungere una regola conviene capire da dove è entrato l'errore."
          },
          {
            "text": "\"Misure di marzo, ma la parete l'hanno abbattuta ad aprile. Il rilievo nuovo chi l'ha fatto, e dov'è finito?\"",
            "quality": "best",
            "effects": {
              "lettura": 3,
              "strategia": 2,
              "autocontrollo": 1
            },
            "outcome": "Matteo esita, poi risponde piano: \"Il secondo sopralluogo l'ha fatto Paolo, a maggio. In cartella non c'è.\" Adesso sai dove guardare.",
            "why": "Una domanda sul percorso, non sulla persona. Quando un collaboratore preciso sbaglia, spesso è il processo che l'ha tradito."
          }
        ]
      },
      {
        "text": "Giovedì mattina Paolo entra in ufficio tecnico di buon umore e dice ad alta voce: \"Ho sentito del pasticcio di Cremona. Matteo è bravo, ma deve stare più attento.\" Nella cartella del cantiere adesso c'è il rilievo di maggio, caricato da Paolo ieri alle 23:40. Matteo, alla scrivania accanto, fa finta di non sentire.",
        "escalation": "Da due giorni Matteo è spento e pranza da solo in macchina.",
        "prompt": "Cosa fai?",
        "options": [
          {
            "text": "Davanti a tutti: \"Curioso, Paolo: il rilievo di maggio l'hai caricato ieri alle 23:40. Vuoi raccontarci tu com'è andata?\"",
            "quality": "bad",
            "effects": {
              "lettura": 2,
              "autocontrollo": -2,
              "empatia": -2,
              "strategia": -2
            },
            "outcome": "In ufficio cala il gelo. Paolo diventa rosso, borbotta che era \"una formalità\" ed esce. Da quel giorno lui e Matteo si parlano solo per email.",
            "why": "Avere ragione in pubblico dà una soddisfazione enorme, ma umilia, divide la squadra e trasforma un problema di metodo in una guerra personale."
          },
          {
            "text": "Non dici niente a Paolo: è il tuo venditore migliore e non vuoi tensioni. Più tardi prendi Matteo da parte: \"Ho capito com'è andata, stai tranquillo.\"",
            "quality": "weak",
            "effects": {
              "empatia": 2,
              "lettura": 1,
              "assertivita": -2,
              "etica": -1
            },
            "outcome": "Matteo ti ringrazia, ma ha capito che con Paolo le regole sono diverse. Il mese dopo un altro rilievo arriva in ritardo.",
            "why": "Consolare in privato chi ha subito un torto senza correggere chi l'ha causato insegna a tutti che c'è chi può permettersi di sbagliare."
          },
          {
            "text": "A porta chiusa: \"Paolo, il rilievo nuovo è in cartella solo da ieri sera e il computo è partito da quello vecchio. Da lunedì, senza rilievo datato, nessun ordine.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "strategia": 2,
              "etica": 1,
              "autocontrollo": 1
            },
            "outcome": "Paolo prova a minimizzare, poi incassa: \"Ok, mi ero dimenticato di caricarlo.\" Il lunedì dopo la regola è in bacheca, e vale per tutti.",
            "why": "Fatti precisi, in privato, e una regola che corregge il processo: Paolo non perde la faccia e nessuno può più far ricadere la colpa sul più giovane."
          },
          {
            "text": "\"Paolo, aspetta. Sul pasticcio di Cremona Matteo c'entra meno di quanto pensi. Ne parliamo noi due dopo pranzo.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "empatia": 1,
              "lettura": 1
            },
            "outcome": "Paolo si irrigidisce ma annuisce. Matteo alza la testa dalla scrivania per la prima volta. Dopo pranzo, però, Paolo arriva già pronto a difendersi.",
            "why": "Fermare un commento ingiusto davanti al ragazzo è giusto, ma annunciare la resa dei conti in pubblico mette Paolo sulla difensiva."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi cosa dici a Paolo, a porta chiusa.",
      "model": "Paolo, il computo di Cremona è partito dal rilievo di marzo perché quello di maggio è entrato in cartella solo ieri sera. Non cerco un colpevole, ma da lunedì nessun ordine parte senza il rilievo aggiornato e datato in cartella: tu lo carichi, Matteo lo verifica.",
      "keys": [
        {
          "label": "Fatti precisi, senza aggettivi",
          "terms": [
            "rilievo",
            "marzo",
            "maggio",
            "cartella",
            "ieri",
            "caricat",
            "misure",
            "datat"
          ]
        },
        {
          "label": "Tono che non cerca il colpevole",
          "terms": [
            "non cerco",
            "colpevol",
            "tra noi",
            "capita",
            "succede",
            "senza accus",
            "nessuna accusa"
          ]
        },
        {
          "label": "Una regola per il futuro",
          "terms": [
            "da lunedì",
            "d'ora in poi",
            "nessun ordine",
            "regola",
            "procedura",
            "verific",
            "sempre",
            "ogni"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Matteo il controllo l'aveva fatto: a maggio aveva scritto a Paolo in chat \"Misure di Cremona confermate?\" e Paolo, di corsa, aveva risposto \"Sì, vai\", dimenticando la parete abbattuta. Matteo non te l'ha detto perché è stato Paolo a farlo assumere, e non voleva passare per quello che scarica la colpa su chi gli ha dato il lavoro.",
      "principle": "Quando un collaboratore preciso sbaglia, cerca prima il punto in cui il processo l'ha tradito, poi la persona.",
      "tip": "Dopo un errore chiedi il percorso, non il colpevole: \"Ricostruiamo passo per passo da dove sono arrivati quei dati.\""
    }
  },
  {
    "id": "leadership-coordinatrice-capocantiere",
    "category": "leadership",
    "difficulty": 3,
    "title": "Coordinatrice e capocantiere ai ferri corti",
    "setting": "Villetta a Lodi, consegna al cliente fra tre settimane. Martedì alle 7:30 i due posatori del parquet arrivano e trovano il massetto ancora umido: giornata persa, circa 600 euro buttati. Elena, la coordinatrice che prepara i programmi di cantiere, ti scrive alle 8: \"Gianni ha cambiato di nuovo l'ordine dei lavori senza dirmi niente. Così io non lavoro.\" Gianni, capocantiere da vent'anni, non si è fatto sentire.",
    "cast": [
      {
        "name": "Elena",
        "role": "coordinatrice di cantiere, 31 anni",
        "note": "organizzata, diretta, in azienda da un anno"
      },
      {
        "name": "Gianni",
        "role": "capocantiere",
        "note": "esperto, di poche parole, diffida dei programmi fatti al computer"
      }
    ],
    "objective": "Risolvere il conflitto tra Elena e Gianni senza schierarti e senza compromettere il cantiere.",
    "rounds": [
      {
        "text": "Alle 9 Elena è nel tuo ufficio, in piedi, con il telefono in mano. \"È la terza volta in un mese. O decidi tu chi comanda in cantiere, o il programma te lo fai da solo.\" Fuori dalla porta l'amministrazione fa finta di lavorare.",
        "prompt": "Cosa le rispondi?",
        "options": [
          {
            "text": "\"Capisco che sei stufa. Prima di dirti qualsiasi cosa voglio sentire anche Gianni. Ti richiamo entro stasera.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "empatia": 1,
              "lettura": 1
            },
            "outcome": "Elena annuisce, poco convinta, ed esce. Nel pomeriggio senti Gianni al telefono: ha una versione completamente diversa, e adesso tocca a te riportarla a lei.",
            "why": "Non schierarti è giusto, ma sentendoli separati diventi il postino tra due versioni, e ognuno penserà che tu stia dalla parte dell'altro."
          },
          {
            "text": "\"Hai ragione, così non si va avanti. Adesso chiamo Gianni e gli dico chiaro che il programma lo fai tu e lui lo rispetta.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "lettura": -2,
              "strategia": -2,
              "autocontrollo": -1
            },
            "outcome": "Elena esce soddisfatta. Gianni ascolta in silenzio e chiude con un \"Va bene, capo.\" In un'ora tutta l'impresa sa che hai dato ragione a lei senza sentirlo.",
            "why": "Decidere su una sola versione dà l'aria del capo deciso, ma è una sentenza senza processo: il condannato smette di collaborare."
          },
          {
            "text": "\"Gianni è fatto così, vent'anni di cantieri. Prova a prenderlo per il verso giusto, vedrai che si sistema.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "lettura": 1,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Elena ti guarda per un lungo secondo: \"Quindi il problema sono io.\" A pranzo chiede alla collega dell'amministrazione se conosce qualche impresa che cerca una coordinatrice.",
            "why": "Chiedere a chi si lamenta di adattarsi sembra pacificante, ma le comunica che il problema è suo. Le persone valide se ne vanno così."
          },
          {
            "text": "\"Scrivimi le tre volte: data, cosa prevedeva il programma, cosa è cambiato. Domattina alle 8 ne parliamo con Gianni, tutti e tre.\"",
            "quality": "best",
            "effects": {
              "strategia": 2,
              "autocontrollo": 2,
              "assertivita": 1,
              "lettura": 1
            },
            "outcome": "Elena si ferma, sorpresa: \"Va bene.\" Nel pomeriggio ti manda le tre date. Due su tre coincidono con giorni di pioggia o con forniture arrivate in ritardo.",
            "why": "Trasformare la rabbia in fatti e mettere i due nella stessa stanza ti evita di fare il giudice di versioni raccontate a metà."
          }
        ]
      },
      {
        "text": "Riunione a tre, la mattina dopo. Gianni parla per primo, a braccia conserte: \"La ditta ha gettato il massetto con due giorni di ritardo. Se seguivo il programma mettevamo il parquet sull'umido, e tra sei mesi il cliente ci chiamava per le doghe imbarcate.\" Elena: \"E dirmelo? Ho un telefono anch'io.\"",
        "escalation": "Nella notte la tensione è salita: Elena e Gianni non si salutano nemmeno.",
        "prompt": "Come guidi la riunione?",
        "options": [
          {
            "text": "\"Avete ragione tutti e due. Gianni ha salvato il parquet, Elena doveva essere avvisata. Stringetevi la mano e pensiamo alla consegna.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "lettura": -1,
              "strategia": -1
            },
            "outcome": "Si stringono la mano senza guardarsi. La riunione dura dieci minuti, e nessuno ha detto perché il programma si rompe al primo ritardo.",
            "why": "Dare ragione a tutti chiude la discussione ma non il problema: è una pace di facciata."
          },
          {
            "text": "\"Prima di parlare di chi doveva avvisare chi: perché il programma non aveva nemmeno un giorno di margine sul massetto?\"",
            "quality": "best",
            "effects": {
              "lettura": 3,
              "strategia": 2,
              "autocontrollo": 1
            },
            "outcome": "Silenzio. Gianni guarda Elena, Elena guarda il tavolo. È la domanda che nessuno dei due voleva sentire.",
            "why": "Quando due persone competenti litigano sempre sullo stesso punto, spesso il problema sta a monte. Una domanda sulla causa sposta l'attenzione dalle persone al sistema."
          },
          {
            "text": "\"Gianni, tecnicamente avevi ragione tu. Elena, il cantiere lo conosce lui: da oggi i programmi li fai validare a Gianni prima di mandarli.\"",
            "quality": "bad",
            "effects": {
              "lettura": 1,
              "empatia": -3,
              "strategia": -2,
              "etica": -1
            },
            "outcome": "Gianni annuisce soddisfatto. Elena raccoglie i fogli e non apre più bocca. Il giorno dopo ti chiede un colloquio \"per parlare del suo futuro\".",
            "why": "Avere ragione su un punto tecnico non significa avere ragione su tutto. Ribaltare i ruoli davanti a lei umilia chi pianifica e premia chi non comunica."
          },
          {
            "text": "\"Gianni, sul massetto hai protetto il lavoro. Ma Elena l'ha scoperto dai posatori alle 7:30. Come facciamo perché non succeda più?\"",
            "quality": "good",
            "effects": {
              "empatia": 1,
              "strategia": 1,
              "assertivita": 1,
              "lettura": 1
            },
            "outcome": "Gianni, un po' controvoglia, propone una telefonata ogni sera alle 18. Elena accetta. Funzionerà finché il prossimo ritardo non farà saltare di nuovo tutto.",
            "why": "Riconosci il merito di Gianni e il disagio di Elena, e chiedi a loro la soluzione. Ma resti sul sintomo, la comunicazione, senza toccare la causa."
          }
        ]
      },
      {
        "text": "Dopo un lungo silenzio Elena parla senza alzare gli occhi: \"Il programma è tirato perché la consegna l'hai anticipata tu al 15, quando il cliente te l'ha chiesto a cena. Io ho compresso tutto per starci dentro.\" Gianni annuisce: \"E io non le dicevo niente, tanto la data non si toccava.\" Tutti e due ti guardano.",
        "escalation": "Elena è ferita e Gianni sulla difensiva: la riunione sembra sul punto di saltare.",
        "prompt": "Cosa fai adesso?",
        "options": [
          {
            "text": "\"Elena, se la data era impossibile dovevi dirmelo tu. Pianificare è il tuo lavoro, non il mio.\"",
            "quality": "bad",
            "effects": {
              "autocontrollo": -1,
              "empatia": -2,
              "etica": -1,
              "lettura": -1
            },
            "outcome": "Elena impallidisce: \"Ok. La prossima volta te lo dico.\" Gianni scuote la testa. Hai appena insegnato a tutti e due che portarti brutte notizie è pericoloso.",
            "why": "C'è un fondo di verità, ed è per questo che è tentante. Ma scaricare su chi ha cercato di accontentarti il peso di una tua promessa distrugge la fiducia."
          },
          {
            "text": "\"Ok, la data è un problema mio. Voi due però da domani vi sentite ogni mattina alle 7:30, cinque minuti al telefono, prima di aprire il cantiere.\"",
            "quality": "good",
            "effects": {
              "etica": 1,
              "strategia": 1,
              "assertivita": 1,
              "lettura": 1
            },
            "outcome": "Elena e Gianni si accordano sulla telefonata e il clima migliora. Ma la data del 15 resta lì, e la settimana dopo salta anche la posa dei battiscopa.",
            "why": "Riconosci la tua parte e migliori la comunicazione, ma lasci in piedi la causa: una scadenza che nessuno dei due ritiene realistica."
          },
          {
            "text": "\"La data ormai è data, il cliente conta su di noi. Stringiamo i denti per tre settimane, poi rivediamo come lavoriamo.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 1,
              "etica": 1,
              "empatia": -2,
              "lettura": -1
            },
            "outcome": "Annuiscono, senza entusiasmo. Il cantiere chiude il 15, ma con due notti di straordinari e un'infiltrazione sotto una finestra che il cliente scopre a gennaio.",
            "why": "Mantenere la parola con il cliente è un valore, ma chiedere alla squadra di pagare una promessa fatta senza di loro ha un costo che arriva dopo."
          },
          {
            "text": "\"Allora il primo errore è mio: ho promesso il 15 senza chiedervi niente. Oggi chiedo al cliente quattro giorni, e da ora le date le fissiamo insieme.\"",
            "quality": "best",
            "effects": {
              "etica": 2,
              "strategia": 2,
              "empatia": 1,
              "assertivita": 1
            },
            "outcome": "Elena tira un sospiro. Gianni, per la prima volta, sorride: \"Quattro giorni bastano.\" Il cliente, al telefono, è meno contrariato del previsto: preferisce un pavimento fatto bene.",
            "why": "Un capo che dice \"il primo errore è mio\" non perde autorità: la guadagna. E correggi la causa invece di chiedere alla squadra di assorbirla."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi cosa dici a Elena e Gianni per chiudere la riunione.",
      "model": "La data del 15 l'ho promessa io senza chiedervi niente, quindi il primo errore è mio. Oggi chiamo il cliente per avere quattro giorni in più. Da adesso nessuna data esce senza il vostro via libera, e ogni cambio in cantiere Elena lo sa prima che succeda.",
      "keys": [
        {
          "label": "Riconoscere la tua parte",
          "terms": [
            "errore è mio",
            "colpa mia",
            "mia responsabilità",
            "ho promesso",
            "l'ho promessa",
            "ho sbagliato",
            "mi assumo"
          ]
        },
        {
          "label": "Agire sulla causa",
          "terms": [
            "chiamo il cliente",
            "giorni in più",
            "sposto",
            "spostare",
            "rinegozi",
            "nuova data",
            "rinvio"
          ]
        },
        {
          "label": "Una regola condivisa",
          "terms": [
            "da adesso",
            "d'ora in poi",
            "nessuna data",
            "via libera",
            "ogni cambio",
            "prima che",
            "regola"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Gianni non teneva Elena all'oscuro per disprezzo: due mesi fa lei ti aveva segnalato un suo ritardo e lui si era sentito scavalcato, così da allora le passava il minimo indispensabile. Elena, invece, sapeva già dalla settimana prima che il massetto era a rischio, ma non te l'ha detto per non contraddire la data che avevi promesso. Il loro litigio era il sintomo: la causa era una promessa fatta a cena.",
      "principle": "Quando due bravi collaboratori litigano sempre sullo stesso punto, guarda prima cosa hai chiesto loro tu.",
      "tip": "Prima di dare una data a un cliente, prendi un giorno: \"Verifico con chi fa il lavoro e domani ti do una data che posso firmare.\""
    }
  },
  {
    "id": "leadership-venditore-sconti",
    "category": "leadership",
    "difficulty": 4,
    "title": "Il venditore migliore e gli sconti fuori regola",
    "setting": "Chiara, in amministrazione, ti porta il prospetto degli ordini di settembre: tre contratti di Marco hanno sconti tra il 18 e il 22%, mentre il suo limite senza autorizzazione è il 12%. Marco porta da solo il 40% del fatturato dello showroom e i suoi clienti lo adorano. Sui tre ordini, gli sconti extra valgono circa 9.000 euro di margine.",
    "cast": [
      {
        "name": "Marco",
        "role": "venditore senior, in azienda da otto anni",
        "note": "carismatico, sicuro di sé, i clienti chiedono di lui per nome"
      },
      {
        "name": "Chiara",
        "role": "responsabile amministrazione",
        "note": "scrupolosa, riservata, detesta i conflitti"
      }
    ],
    "objective": "Riportare Marco dentro le regole senza perdere né lui né i suoi clienti.",
    "rounds": [
      {
        "text": "Chiami Marco in ufficio e gli mostri il prospetto. Lui si appoggia allo schienale e sorride: \"Il cliente minacciava di andare dalla concorrenza. Ho salvato tre ordini. Preferivi perderli?\"",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Va bene, l'importante sono gli ordini. Ma la prossima volta avvisami prima, anche solo con un messaggio.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "empatia": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "Marco sorride: \"Certo, capo.\" Esce in due minuti. Chiara, che ha visto la scena attraverso il vetro, capisce che il suo prospetto non è servito a niente.",
            "why": "Accettare la giustificazione per non incrinare il rapporto con il venditore migliore trasforma la regola in un suggerimento."
          },
          {
            "text": "\"Preferivo che rispettassi le regole. La differenza di sconto te la scalo dalle provvigioni di ottobre.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -2,
              "strategia": -2,
              "lettura": -1
            },
            "outcome": "Il sorriso di Marco sparisce. \"Ah, è così che funziona.\" Esce senza aggiungere altro, e nel pomeriggio lo vedi in macchina, al telefono, per mezz'ora.",
            "why": "La sanzione immediata dà soddisfazione, ma con un collaboratore che ha alternative trasforma un problema di metodo in uno scontro di potere."
          },
          {
            "text": "\"Uno lo capisco. Tre in un mese, tutti sopra il 18%, non sono emergenze: sono un metodo. Spiegami come lavori con questi clienti.\"",
            "quality": "best",
            "effects": {
              "lettura": 2,
              "assertivita": 2,
              "autocontrollo": 1,
              "strategia": 1
            },
            "outcome": "Marco smette di sorridere per un secondo, poi si ricompone e risponde in modo vago, parla di \"rapporto personale\". Hai visto la crepa, e lui sa che l'hai vista.",
            "why": "Separare il caso isolato dallo schema, senza accusare, costringe l'altro a spiegare invece che a difendersi. E dalle risposte vaghe si impara molto."
          },
          {
            "text": "\"Capisco la pressione, ma il tuo limite resta il 12%. Sopra serve il mio via libera: mandami un messaggio e ti rispondo entro un'ora, sempre.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "strategia": 1,
              "empatia": 1
            },
            "outcome": "Marco annuisce: \"Ok, ricevuto.\" La regola è chiara, ma non sai ancora perché tre volte in un mese ha sentito il bisogno di aggirarla.",
            "why": "Ribadire la regola e renderla praticabile è corretto. Manca però la domanda sul perché: lo schema resta da capire."
          }
        ]
      },
      {
        "text": "Una settimana dopo Marco passa nel tuo ufficio, cordiale. \"Mi fai mandare da Chiara l'estrazione del gestionale con lo storico dei miei clienti? Nomi, telefoni, cosa hanno comprato. Voglio fare un giro di richiami prima di Natale.\" Ti accorgi che da qualche mese, sui suoi preventivi, c'è il suo cellulare personale al posto del numero dello showroom.",
        "escalation": "Dal vostro ultimo colloquio Marco è più sfuggente del solito.",
        "prompt": "Cosa gli rispondi?",
        "options": [
          {
            "text": "\"Il giro di richiami è un'ottima idea, davvero. Ne parliamo lunedì con calma: prima voglio vedere con Chiara come preparare le liste nel modo giusto.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 1,
              "strategia": 1,
              "lettura": 1
            },
            "outcome": "Marco fa una smorfia appena percettibile: \"Lunedì va bene.\" Hai preso tempo, ma lui ha capito che la richiesta non è passata liscia.",
            "why": "Prendere tempo è prudente, ma rimandare senza una posizione chiara lascia aperta la porta alla stessa richiesta, magari fatta direttamente a Chiara."
          },
          {
            "text": "\"Un'estrazione completa, con telefoni e storico? Marco, cosa ci devi fare davvero con i dati dei clienti? Dimmelo in faccia, adesso.\"",
            "quality": "bad",
            "effects": {
              "lettura": 1,
              "autocontrollo": -2,
              "strategia": -2,
              "empatia": -1
            },
            "outcome": "Marco si offende in modo teatrale: \"Dopo otto anni mi tratti da ladro?\" Esce sbattendo la porta, con in mano una storia perfetta da raccontare: il capo che non si fida.",
            "why": "Il sospetto può essere fondato, ma un'accusa senza prove regala all'altro il ruolo della vittima e ti lascia a mani vuote."
          },
          {
            "text": "\"Certo, nessun problema: dico a Chiara di mandartela oggi stesso. Se ti servono altre informazioni sui clienti, chiedi pure a lei.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "strategia": -2,
              "lettura": -1
            },
            "outcome": "Chiara manda il file, controvoglia. Marco ringrazia. Da quel momento lo storico dei tuoi clienti esiste anche fuori dal gestionale.",
            "why": "Fidarsi del collaboratore migliore è naturale, ma i dati dei clienti sono un patrimonio dell'azienda: concederli per cortesia è una leggerezza."
          },
          {
            "text": "\"I richiami falli pure, ma dal gestionale: Chiara ti prepara le liste. I dati dei clienti non escono, per nessuno. E sui preventivi torna il numero dello showroom.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "strategia": 2,
              "lettura": 1,
              "etica": 1
            },
            "outcome": "Marco esita un istante di troppo, poi alza le spalle: \"Come vuoi, era per comodità.\" Non torna più sull'argomento. E i richiami non li fa.",
            "why": "Una regola valida per tutti, detta con calma, protegge l'azienda senza accusare nessuno. E il modo in cui l'altro reagisce a una regola neutra dice molto."
          }
        ]
      },
      {
        "text": "Dieci giorni dopo Chiara entra nel tuo ufficio e chiude la porta. \"Ha chiamato l'architetto Ferri: chiedeva se il preventivo resta valido, perché Marco gli ha detto che da gennaio lo trova da un'altra parte.\" Poi, a bassa voce: \"E gli sconti di settembre... Marco mi aveva detto che eri d'accordo tu.\" Marco è da un cliente e rientra alle 17.",
        "escalation": "Da giorni Marco passa più tempo fuori dallo showroom che dentro.",
        "prompt": "Cosa fai?",
        "options": [
          {
            "text": "Lo chiami subito sul cellulare: \"So tutto. Stasera riporti le chiavi dello showroom e il telefono aziendale.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -3,
              "strategia": -2,
              "lettura": -1
            },
            "outcome": "Marco nega tutto e riattacca. Il giorno dopo ti arriva la lettera di un avvocato, e intanto lui chiama i suoi clienti uno per uno, raccontando per primo la sua versione.",
            "why": "Agire d'impulso su una voce riferita ti mette dalla parte del torto: lui ha il tempo e le ragioni per presentarsi come vittima davanti ai clienti."
          },
          {
            "text": "Prima che Marco rientri, chiami tu i cinque clienti più importanti del suo portafoglio, per un saluto e un aggiornamento sui loro cantieri, senza parlare di lui.",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "autocontrollo": 1,
              "lettura": 1
            },
            "outcome": "Tre clienti sono contenti di sentirti, due ti chiedono di Marco con un certo imbarazzo. Hai rinsaldato i rapporti, ma con lui non hai ancora parlato.",
            "why": "Rafforzare il rapporto diretto con i clienti è una mossa saggia e pulita. Da sola, però, lascia aperta la questione principale: Marco."
          },
          {
            "text": "Lo aspetti alle 17, porta chiusa: \"Ferri ha chiamato e dice che da gennaio ti trova altrove. Preferisco sentirlo da te.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "autocontrollo": 2,
              "etica": 1,
              "lettura": 1
            },
            "outcome": "Marco tace a lungo, poi ammette di avere un'offerta da un concorrente. Per la prima volta parlate davvero, e potete gestire l'uscita, o la permanenza, alla luce del sole.",
            "why": "Un fatto preciso, detto a quattr'occhi, e lo spazio per la sua versione: è la mossa più dura emotivamente e la più pulita. Lui non può più giocare su due tavoli."
          },
          {
            "text": "Per ora non gli dici niente: gli limiti l'accesso al gestionale, chiedi a Chiara di girarti tutti i suoi preventivi e aspetti che sia lui a parlare.",
            "quality": "weak",
            "effects": {
              "strategia": 1,
              "autocontrollo": 1,
              "etica": -1,
              "assertivita": -1
            },
            "outcome": "Marco si accorge del blocco in due giorni e capisce. Smette di nascondersi e accelera: a fine mese si dimette, con tre clienti già convinti a seguirlo.",
            "why": "Proteggersi in silenzio sembra furbo, ma è una guerra fredda: l'altro se ne accorge e usa il tempo che gli hai lasciato."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi le prime frasi che dici a Marco alle 17.",
      "model": "Marco, stamattina ha chiamato Ferri: dice che da gennaio ti trova da un'altra parte. Preferisco sentirlo da te. Se stai valutando un'altra strada è un tuo diritto, ma i clienti e i loro dati restano all'azienda e il passaggio lo gestiamo in modo corretto, insieme.",
      "keys": [
        {
          "label": "Il fatto, senza interpretazioni",
          "terms": [
            "ferri",
            "ha chiamato",
            "telefonat",
            "gennaio",
            "mi ha detto",
            "dice",
            "è arrivat"
          ]
        },
        {
          "label": "Spazio alla sua versione",
          "terms": [
            "da te",
            "dimmi",
            "raccontami",
            "tua versione",
            "voglio capire",
            "è vero",
            "spiegami"
          ]
        },
        {
          "label": "Un confine chiaro sui clienti",
          "terms": [
            "clienti",
            "dati",
            "restano",
            "azienda",
            "corrett",
            "passaggio",
            "regol"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Marco aveva già incontrato due volte un concorrente di Lodi, che gli offriva il ruolo di responsabile commerciale se avesse portato con sé i clienti. Gli sconti fuori regola e il cellulare personale sui preventivi servivano a legare i clienti a lui, non all'azienda, e l'estrazione del gestionale doveva essere l'ultimo tassello. Non aveva ancora firmato: stava misurando quanto eri disposto a chiudere un occhio.",
      "principle": "Con un collaboratore indispensabile le regole valgono due volte: è lì che tutti guardano se sono vere.",
      "tip": "Davanti a una voce grave riportata da altri, parti dal fatto e lascia spazio: \"Mi è arrivata questa cosa. Preferisco sentirla da te.\""
    }
  },
  {
    "id": "pressione-cena-amici-battute",
    "category": "pressione",
    "difficulty": 2,
    "title": "Le battute di Federico alla cena del venerdì",
    "setting": "Venerdì sera, trattoria fuori città, otto amici di vecchia data. Sei tornato da Giacarta tre giorni fa e non vedevi il gruppo da quasi due mesi. Federico, l'anima della compagnia, ha già ordinato due bottiglie di rosso e stasera sembra aver scelto te come bersaglio.",
    "cast": [
      {
        "name": "Federico",
        "role": "amico dai tempi delle superiori",
        "note": "battuta pronta, fa ridere tutti, stasera più pungente del solito"
      },
      {
        "name": "Marta",
        "role": "amica del gruppo",
        "note": "ride alle battute, ma ogni tanto ti lancia un'occhiata complice"
      }
    ],
    "objective": "Reggere le prese in giro davanti al gruppo senza fare il permaloso e senza farti mettere sotto.",
    "rounds": [
      {
        "text": "Appena ti siedi, Federico alza il bicchiere: \"Signori, l'uomo d'affari internazionale ci onora della sua presenza! Stasera paga lui, tanto a Giacarta i soldi crescono sugli alberi.\" Risata generale. Tutti si girano verso di te.",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Magari! Guarda che là si lavora il doppio che qua, altro che bella vita.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "assertivita": -1,
              "lettura": -1
            },
            "outcome": "Federico ci va a nozze: \"Sentitelo, si lamenta pure!\" Altra risata. Ti sei messo a giustificarti e la battuta è diventata un argomento di conversazione.",
            "why": "Giustificarsi davanti a una battuta le dà peso: il gruppo capisce che ha colpito nel segno."
          },
          {
            "text": "Ridi con loro: \"Il dolce lo offro io. Il vino lo paga Federico, che l'ha scelto.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "assertivita": 2,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "Il tavolo ride ancora più forte, stavolta con te. Federico alza le mani: \"Va bene, va bene, questa me la sono cercata!\" e la serata riparte.",
            "why": "Stare al gioco con una controbattuta leggera e un gesto generoso toglie forza alla presa in giro: non sei il bersaglio, sei uno che si diverte."
          },
          {
            "text": "\"Almeno io i soldi li faccio, Fede. Tu invece come sei messo?\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "empatia": -3,
              "autocontrollo": -2,
              "strategia": -1
            },
            "outcome": "Gelo al tavolo. Qualcuno ride per sbaglio e smette subito. Federico sorride a denti stretti: \"Ok. Ricevuto.\"",
            "why": "Colpire un punto debole ti fa vincere lo scambio e perdere la serata: adesso il cattivo sei tu."
          },
          {
            "text": "Sorridi senza dire niente, ti versi dell'acqua e chiedi a Marta com'è andato il trasloco della settimana scorsa.",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "empatia": 1,
              "assertivita": -1
            },
            "outcome": "La battuta si spegne da sola. Ma Federico ha notato che l'hai schivata, e prende la mira per la prossima.",
            "why": "Non dare benzina funziona, ma sparire del tutto può sembrare disagio: chi punzecchia lo prende come un invito a riprovarci."
          }
        ]
      },
      {
        "text": "Al secondo giro di vino la serata è allegra. Copri il bicchiere con la mano: guidi tu, e domattina alle 8 hai una videochiamata con un fornitore. Federico: \"Ah, adesso non beve più con i poveri! Dai, un goccio, non fare il prete.\" Ti versa comunque mezzo bicchiere e un paio di amici battono le mani sul tavolo.",
        "escalation": "Federico non ha digerito la tua risposta di prima e stavolta coinvolge tutto il tavolo.",
        "prompt": "Il tavolo aspetta la tua mossa. Cosa fai?",
        "options": [
          {
            "text": "Bevi il mezzo bicchiere tutto d'un fiato, per chiudere la scena: \"Va bene, va bene, ho bevuto. Contenti adesso?\"",
            "quality": "bad",
            "effects": {
              "assertivita": -2,
              "autocontrollo": -1,
              "strategia": -1,
              "empatia": 1
            },
            "outcome": "Applausi. Dieci minuti dopo Federico ti riempie di nuovo il bicchiere: ormai la regola è chiara, basta insistere.",
            "why": "Cedere per far finire la pressione insegna al gruppo una cosa sola: che la pressione funziona."
          },
          {
            "text": "\"Fede, ho detto di no. Basta, non sono un ragazzino.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -1,
              "empatia": -1,
              "strategia": -1
            },
            "outcome": "Il no arriva, ma con il tono sbagliato: \"Uh, quanto sei suscettibile stasera!\" Il tavolo si divide tra chi ride e chi guarda il piatto.",
            "why": "Il confine era giusto, l'irritazione no: hai dato a Federico la prova che le sue battute ti arrivano."
          },
          {
            "text": "\"No, grazie davvero: stasera guido io, e domattina alle otto ho una videochiamata importante con un fornitore. Magari la prossima volta, promesso.\"",
            "quality": "good",
            "effects": {
              "assertivita": 1,
              "autocontrollo": 1,
              "empatia": 1
            },
            "outcome": "Federico sbuffa: \"Sempre il lavoro, eh.\" Ti lasciano in pace, ma l'etichetta di quello che pensa solo al lavoro ti resta addosso.",
            "why": "Il no tiene, ma la giustificazione lunga apre una trattativa e gli regala lo spunto per la battuta successiva."
          },
          {
            "text": "Alzi il bicchiere dell'acqua: \"Stasera guido. Ma il primo brindisi è mio: a Federico, che non cambia mai.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "autocontrollo": 2,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "Il tavolo brinda, Federico compreso, un po' spiazzato: \"Eh, questa è bella.\" Il mezzo bicchiere resta lì e nessuno ci pensa più.",
            "why": "Un no breve, senza scuse, seguito da un gesto che riprende in mano la scena: non resta niente da prendere in giro."
          }
        ]
      },
      {
        "text": "Al dolce si parla di vacanze e l'atmosfera è rilassata. Paolo, distratto, chiede: \"Per Courmayeur prendiamo due macchine?\" Così scopri che fra tre settimane c'è un weekend sulla neve e un gruppo WhatsApp in cui tu non ci sei. Federico, senza guardarti: \"Non ti abbiamo messo perché tanto non vieni mai.\"",
        "escalation": "Al dolce l'atmosfera è tesa e Federico non ti rivolge più la parola.",
        "prompt": "Ti hanno lasciato fuori. Come rispondi?",
        "options": [
          {
            "text": "\"Perfetto, bello sapere chi sono gli amici.\" Ti alzi e vai a pagare il conto per tutti, senza dire altro.",
            "quality": "bad",
            "effects": {
              "autocontrollo": -2,
              "empatia": -2,
              "strategia": -2,
              "assertivita": 1
            },
            "outcome": "Il gesto pesa più delle parole: qualcuno protesta, altri si sentono in colpa. La serata finisce lì, e il giorno dopo nel gruppo nuovo si parla solo di te.",
            "why": "Il silenzio offeso e il gesto plateale puniscono tutti invece di chiarire: fanno sentire in colpa, non vicini."
          },
          {
            "text": "\"Ma figurati, avete fatto benissimo. Tanto quel weekend avevo già un impegno di lavoro, non sarei venuto comunque.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 2,
              "assertivita": -2,
              "etica": -1
            },
            "outcome": "Sollievo generale, si torna a parlare d'altro. Ma torni a casa con la sensazione di essere diventato un ospite nel tuo stesso gruppo.",
            "why": "Fingere indifferenza salva la serata e conferma la tesi di Federico: che tu non ci sei mai."
          },
          {
            "text": "\"È vero, ultimamente ci sono stato poco. Però mettetemi nel gruppo: a Courmayeur vengo anch'io.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "assertivita": 2,
              "empatia": 2,
              "lettura": 1
            },
            "outcome": "Federico alza gli occhi, sorpreso. Poi prende il telefono: \"Fatto. Ma la camera la dividi con me, che russi meno di Paolo.\" Marta sorride.",
            "why": "Riconosci il pezzo di verità senza scusarti troppo e rivendichi il tuo posto con una richiesta concreta. Contro l'esclusione funziona più chiedere che protestare."
          },
          {
            "text": "\"Fede, mi è dispiaciuto saperlo così. Dopo cena ne parliamo un attimo io e te?\"",
            "quality": "good",
            "effects": {
              "empatia": 2,
              "assertivita": 1,
              "autocontrollo": 1
            },
            "outcome": "Federico annuisce, un po' a disagio. Fuori dal locale vi chiarite in parte, ma davanti agli altri la questione è rimasta sospesa.",
            "why": "Parlarne a quattr'occhi è maturo, ma davanti al gruppo resti quello lasciato fuori: manca un segnale chiaro che vuoi esserci."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Il giorno dopo scrivi un messaggio privato a Federico.",
      "model": "Ieri mi sono divertito, anche con le tue battute. Hai ragione, ultimamente ci sono stato poco e mi dispiace. Giovedì sera ci prendiamo una birra, io e te?",
      "keys": [
        {
          "label": "Tono leggero, senza rancore",
          "terms": [
            "divertit",
            "battut",
            "rider",
            "bella serata",
            "senza rancore",
            "tranquillo",
            "ci sta",
            "simpatic"
          ]
        },
        {
          "label": "Riconoscere il punto vero",
          "terms": [
            "hai ragione",
            "ci sono stato poco",
            "mi dispiace",
            "assente",
            "lo so",
            "scusa",
            "mancat"
          ]
        },
        {
          "label": "Proposta concreta per vedersi",
          "terms": [
            "birra",
            "giovedì",
            "cena",
            "caffè",
            "ci vediamo",
            "io e te",
            "sabato",
            "pranzo"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Federico ci era rimasto male da un mese: avevi saltato la sua festa per i quarant'anni e gli avevi mandato solo un vocale, due giorni dopo. Le battute sui soldi e su Giacarta erano il suo modo di dirti che si sentiva messo da parte. Il gruppo del weekend l'aveva creato lui, ma sperava che fossi tu a chiedere di entrare.",
      "principle": "Dietro una battuta ripetuta c'è spesso un messaggio che l'altro non sa dire: alla battuta rispondi con leggerezza, al messaggio con un gesto.",
      "tip": "Se una presa in giro contiene un pezzo di verità, riconoscilo e rilancia: \"Hai ragione, ci sono stato poco. La prossima cena la organizzo io.\""
    }
  },
  {
    "id": "pressione-riunione-agente-veterano",
    "category": "pressione",
    "difficulty": 3,
    "title": "L'agente veterano che ti contesta in riunione",
    "setting": "Lunedì, ore 9, sala riunioni dello showroom. Stai presentando a sette agenti plurimandatari il piano dell'anno: +12% sulla linea grandi formati e ogni visita registrata nel gestionale entro 48 ore. Gianni, 63 anni, porta da solo il 28% delle vendite e da quando hai acceso il proiettore tiene le braccia incrociate.",
    "cast": [
      {
        "name": "Gianni",
        "role": "agente senior, trent'anni di mestiere",
        "note": "rispettato da tutti, ironico, abituato a fare di testa sua"
      },
      {
        "name": "Chiara",
        "role": "agente, in squadra da un anno",
        "note": "metodica, ottimi risultati, in riunione parla poco"
      }
    ],
    "objective": "Far passare il piano senza perdere né l'autorità davanti alla squadra né il tuo agente migliore.",
    "rounds": [
      {
        "text": "Quando arrivi alla parte sul gestionale, Gianni sbuffa: \"Io in trent'anni i clienti li ho fatti con la stretta di mano, non con le app.\" Poi si gira verso gli altri: \"E questi numeri chi li ha fatti? Uno che i cantieri li ha visti solo in fotografia?\" Due agenti ridono.",
        "prompt": "Tutti aspettano la tua reazione. Cosa dici?",
        "options": [
          {
            "text": "\"I numeri li ho fatti io, Gianni. E il piano lo decido io, che ti piaccia o no.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -2,
              "empatia": -2,
              "strategia": -2
            },
            "outcome": "Gianni alza le mani: \"Ricevuto, capo.\" Gli altri smettono di ridere e per il resto della riunione nessuno fa più una domanda.",
            "why": "Far valere i gradi difende la tua posizione ma conferma la sua tesi: il piano è calato dall'alto. Ottieni silenzio, non adesione."
          },
          {
            "text": "Fai finta di non aver sentito e passi al punto successivo, con lo stesso tono di prima.",
            "quality": "weak",
            "effects": {
              "autocontrollo": 2,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "La riunione va avanti, ma Gianni commenta ogni punto e le risatine aumentano.",
            "why": "Ignorare una sfida pubblica del leader informale della stanza viene letto come paura, non come superiorità."
          },
          {
            "text": "\"In fotografia no, ma i cantieri li vedo meno di te, è vero. Proprio per questo serve il gestionale: la tua esperienza deve restare anche all'azienda.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "empatia": 1,
              "assertivita": 1,
              "lettura": -1
            },
            "outcome": "Qualcuno annuisce. Gianni ribatte subito: \"Ah, ecco: serve a prendersi i miei clienti.\" Hai dato una buona ragione, ma anche un appiglio.",
            "why": "Ammettere un limite è un segno di forza, ma dire a un agente che la sua esperienza \"deve restare all'azienda\" suona come voler mettere le mani sul suo portafoglio."
          },
          {
            "text": "\"Gianni, quale numero ti sembra sbagliato? Dimmelo adesso, così lo guardiamo tutti insieme.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "assertivita": 2,
              "strategia": 2
            },
            "outcome": "Gianni non se lo aspettava. Dopo un secondo indica la riga di Brescia: \"Questo +12% qui è fantascienza.\" Adesso state discutendo di numeri, non di te.",
            "why": "Una domanda precisa trasforma la battuta in contenuto: se l'obiezione è vera la ascolti, se non c'è resta solo la battuta. In entrambi i casi la stanza vede che non hai paura."
          }
        ]
      },
      {
        "text": "Mezz'ora dopo si passa ai prodotti. Gianni alza la mano: \"Domanda tecnica, visto che siamo tra esperti. Gres 120 per 280, spessore 6 millimetri, su massetto radiante: che colla usi e quanto aspetti prima di posare?\" Lo sa benissimo. Tu lo ricordi solo a grandi linee.",
        "escalation": "Gianni, galvanizzato dalle risate di prima, non ti molla un attimo.",
        "prompt": "Ti sta facendo l'esame davanti alla squadra. Cosa fai?",
        "options": [
          {
            "text": "\"Una C2 deformabile, direi, e il massetto dev'essere ben asciutto prima di posare. Poi dipende sempre dal cantiere.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 1,
              "autocontrollo": 1,
              "etica": -1,
              "lettura": -1
            },
            "outcome": "Gianni sorride: \"Dipende, eh. Ci vuole una C2 S2, e prima il massetto deve fare il ciclo di accensione del riscaldamento.\" Hai provato a cavartela e lui ti ha corretto davanti a tutti.",
            "why": "Una mezza risposta detta con sicurezza è peggio di un \"non lo so\": se viene smontata, perdi credibilità anche sul resto del piano."
          },
          {
            "text": "\"Il dettaglio esatto non lo so, e non invento. Tu sì: spiegalo a tutti, così lo mettiamo nella scheda per i clienti.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "etica": 1,
              "strategia": 2,
              "empatia": 1
            },
            "outcome": "Gianni resta spiazzato, poi spiega per tre minuti: colla, ciclo di accensione, misura dell'umidità. Chiara prende appunti. Per la prima volta stamattina Gianni parla con te, non contro di te.",
            "why": "Ammettere un limite con calma e dare la scena a chi sa toglie all'attacco il suo scopo: non stai fallendo un esame, stai usando un esperto."
          },
          {
            "text": "\"Gianni, non siamo qui per fare l'esame di posa. Siamo qui per parlare di vendite, quindi andiamo avanti.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "autocontrollo": -1,
              "strategia": -2,
              "empatia": -1
            },
            "outcome": "Gianni allarga le braccia verso gli altri: \"Ecco, non lo sa.\" Qualcuno ride, Chiara abbassa lo sguardo.",
            "why": "Svicolare con tono autoritario è la conferma più chiara che non conosci la risposta: gli regali la vittoria che cercava."
          },
          {
            "text": "\"Ti rispondo per iscritto oggi pomeriggio, con la scheda tecnica del produttore. La mando a tutti.\"",
            "quality": "good",
            "effects": {
              "etica": 1,
              "autocontrollo": 1,
              "strategia": 1
            },
            "outcome": "Risposta corretta, ma Gianni la incassa con un sorrisetto: \"Bravo, studia.\" Il punto l'ha segnato lui.",
            "why": "Rimandare a una fonte è onesto e preciso, ma lascia a lui la scena. Potevi trasformare la sua competenza da arma in risorsa."
          }
        ]
      },
      {
        "text": "La riunione sta per chiudersi. Gianni si alza per primo e dice ad alta voce: \"Ragazzi, facciamo come sempre: annuiamo, e i numeri li vediamo a dicembre.\" Qualcuno ride. Chiara ti guarda, come per capire se il piano vale davvero.",
        "escalation": "La riunione si chiude in un clima pesante, con Gianni che ormai detta il tono.",
        "prompt": "L'ultima parola è tua. Cosa fai?",
        "options": [
          {
            "text": "\"Dicembre lo guardiamo insieme, Gianni. Ma il gestionale parte lunedì, per tutti. Chi ha dubbi mi chiami entro venerdì.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "autocontrollo": 1,
              "strategia": 1
            },
            "outcome": "La regola resta in piedi e la stanza lo registra. Gianni esce senza ribattere, con la faccia di chi ha già deciso di non rispettarla.",
            "why": "Ribadire il piano in pubblico è necessario, ma il problema vero, cioè perché Gianni rema contro, resta intatto."
          },
          {
            "text": "\"Se qualcuno pensa di annuire e basta, sappia che a dicembre faremo i conti. Uno per uno, numeri alla mano.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "empatia": -2,
              "autocontrollo": -2,
              "strategia": -1
            },
            "outcome": "Silenzio. Gli agenti escono in fretta. Nel pomeriggio Gianni fa il giro di telefonate, e la versione che circola è una sola: \"Ci ha minacciati.\"",
            "why": "Una minaccia generica davanti a tutti colpisce anche chi era dalla tua parte, e regala a Gianni il ruolo di difensore della squadra."
          },
          {
            "text": "Chiudi con le scadenze del piano, poi, con calma: \"Gianni, ti fermi cinque minuti? Solo noi due.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "lettura": 2,
              "strategia": 2,
              "assertivita": 1
            },
            "outcome": "Gli altri escono. Gianni si risiede, sulla difensiva: \"Allora, la ramanzina?\" Ma è rimasto, e senza pubblico il tono è già un altro.",
            "why": "In pubblico difendi il piano, in privato capisci la persona. Tenere separate le due cose ti permette di essere fermo senza umiliare nessuno."
          },
          {
            "text": "Ridi anche tu: \"Speriamo di no, Gianni!\" e chiudi la riunione con un sorriso.",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "Risata generale, tutti escono sereni. Ma Chiara ha capito il messaggio: il piano si può anche ignorare.",
            "why": "Sdrammatizzare va bene in molti momenti, non quando qualcuno invita apertamente a ignorare una decisione: il gruppo guarda chi comanda davvero."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Gianni è rimasto. Scrivi cosa gli dici, a quattr'occhi.",
      "model": "Gianni, la tua esperienza mi serve e il tuo portafoglio vale un quarto delle vendite. Però se mi contesti davanti a tutti, gli altri smettono di seguire il piano. Dimmi cosa ti preoccupa davvero, e lo guardiamo insieme.",
      "keys": [
        {
          "label": "Riconoscere il suo valore",
          "terms": [
            "esperienza",
            "mi serve",
            "rispett",
            "stim",
            "valore",
            "portafoglio",
            "importante",
            "i tuoi clienti"
          ]
        },
        {
          "label": "Nominare il comportamento in pubblico",
          "terms": [
            "davanti a tutti",
            "davanti agli altri",
            "in riunione",
            "contest",
            "battut",
            "in pubblico",
            "squadra"
          ]
        },
        {
          "label": "Domanda sulla preoccupazione vera",
          "terms": [
            "preoccup",
            "cosa ti",
            "davvero",
            "dimmi",
            "insieme",
            "perché",
            "cosa c'è"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Due settimane prima Gianni aveva sentito in amministrazione che l'azienda pensava di prendere un nuovo agente per Brescia, cioè metà della sua zona. Era solo un'idea buttata lì in una riunione, ma nessuno gliel'aveva detto. Ai suoi occhi il gestionale era il primo passo per misurarlo e poi tagliargli il territorio: non difendeva le vecchie abitudini, difendeva il suo reddito.",
      "principle": "Chi ti sfida ogni volta davanti al gruppo ha quasi sempre una paura che non dirà mai davanti al gruppo.",
      "tip": "Rispondi alla battuta pubblica con una domanda sul merito, poi chiedi un colloquio a due: \"Quale numero non ti torna? E dopo, cinque minuti solo noi due.\""
    }
  },
  {
    "id": "pressione-cena-cliente-socio-provoca",
    "category": "pressione",
    "difficulty": 4,
    "title": "Il socio del cliente ti provoca a cena",
    "setting": "Giovedì sera, ristorante in centro a Milano. Ottavio, immobiliarista, deve scegliere il fornitore di pavimenti e rivestimenti per un residence di 42 appartamenti: circa 210.000 euro. A tavola ci sono anche il suo socio Tommaso e Sara, l'architetta del progetto. Due anni fa avete già lavorato insieme su un cantiere più piccolo, non senza intoppi.",
    "cast": [
      {
        "name": "Ottavio",
        "role": "immobiliarista, ha l'ultima parola",
        "note": "cordiale, parla poco, osserva molto"
      },
      {
        "name": "Tommaso",
        "role": "socio di Ottavio, 38 anni",
        "note": "brillante e sarcastico, sembra divertirsi a punzecchiarti"
      },
      {
        "name": "Sara",
        "role": "architetta del progetto",
        "note": "precisa e gentile, resta in disparte"
      }
    ],
    "objective": "Uscire dalla cena con la fornitura ancora in gioco, senza farti mettere sotto e senza svendere.",
    "rounds": [
      {
        "text": "All'antipasto Tommaso apre le danze: \"Sono passato dal vostro showroom. Bellissimo, davvero. Adesso so dove finiscono i nostri soldi.\" Ottavio ride, Sara sorride per educazione. Tommaso ti fissa, in attesa.",
        "prompt": "Prima stoccata della serata. Come rispondi?",
        "options": [
          {
            "text": "\"Non me ne parlare, l'affitto di quel posto è una follia! Però ne vale la pena, dai.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "Tommaso annuisce, soddisfatto: \"Appunto. E lo paghiamo noi.\" Hai confermato la sua cornice: siete cari.",
            "why": "Ridere di sé può sciogliere la tensione, ma qui hai dato ragione alla sua tesi. Scherzare va bene, confermare no."
          },
          {
            "text": "\"Lo showroom lavora per voi: i vostri clienti scelgono da noi, vedono i materiali posati e voi vendete gli appartamenti prima.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "assertivita": 1,
              "autocontrollo": 1,
              "empatia": -1
            },
            "outcome": "Ottavio fa un cenno, interessato. Tommaso: \"Già la presentazione commerciale, all'antipasto?\" L'argomento è buono, ma sei andato in difesa.",
            "why": "Il contenuto è solido, ma rispondere a una battuta con una presentazione mostra che ti ha punto."
          },
          {
            "text": "Sorridi: \"Lì finiscono anche i vostri clienti, quando devono scegliere il pavimento. Meglio che trovino un bel posto, no?\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "assertivita": 2,
              "strategia": 1,
              "lettura": 1
            },
            "outcome": "Ottavio ride di nuovo, stavolta guardando te. Tommaso alza il bicchiere: \"Uno a uno.\" Sara ti guarda con un mezzo sorriso.",
            "why": "Una battuta restituita con calma, che contiene anche un argomento, vale più di una spiegazione: non ti sei difeso, hai giocato."
          },
          {
            "text": "\"Se cercate il prezzo più basso, forse avete sbagliato tavolo.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -2,
              "empatia": -2,
              "strategia": -2
            },
            "outcome": "Silenzio. Ottavio smette di sorridere e si versa dell'acqua. Tommaso, tranquillissimo: \"Vedremo.\" Hai trasformato una battuta in uno scontro.",
            "why": "Rispondere duro a una provocazione leggera ti fa sembrare fragile, e chiudi una porta davanti a chi deve firmare."
          }
        ]
      },
      {
        "text": "Ai secondi l'atmosfera è più distesa. Tommaso appoggia il telefono sul tavolo e avvia il cronometro: \"Facciamo un gioco. Il vostro concorrente ci ha offerto il 14% in meno. Hai trenta secondi per convincermi a non firmare con lui domani.\" Ottavio si appoggia allo schienale e incrocia le mani.",
        "escalation": "Ai secondi l'atmosfera si è irrigidita e Tommaso ha smesso di sorridere.",
        "prompt": "Il cronometro corre. Cosa fai?",
        "options": [
          {
            "text": "\"Allora firmate con lui. Ci risentiamo tra sei mesi, quando le piastrelle cominceranno a staccarsi.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "etica": -2,
              "empatia": -2,
              "strategia": -2
            },
            "outcome": "Sara alza un sopracciglio. Ottavio, secco: \"Parlare male degli altri non è un argomento.\" Tommaso ferma il cronometro: non serve più.",
            "why": "Denigrare un concorrente senza prove sembra sicurezza, ma è nervosismo. E chi ti ascolta si chiede cosa dirai di lui, un giorno."
          },
          {
            "text": "\"Il 14% è tanto, lo capisco, e non voglio perdervi per una questione di prezzo. Stasera stessa posso venirvi incontro di sei o sette punti.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "lettura": 1,
              "strategia": -2,
              "assertivita": -1
            },
            "outcome": "Tommaso ferma il cronometro, soddisfatto: \"Vedi che ci capiamo?\" Hai regalato sette punti senza sapere nemmeno cosa contiene l'altra offerta.",
            "why": "Uno sconto concesso sotto cronometro non compra il contratto: insegna a loro che con te basta premere."
          },
          {
            "text": "Stai al gioco: in trenta secondi elenchi consegne con penale, posatori qualificati e assistenza dopo la vendita, e chiudi esattamente allo scadere.",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "strategia": 1,
              "assertivita": 1
            },
            "outcome": "Ottavio annuisce. Tommaso applaude piano: \"Bravo, sembri una pubblicità.\" Hai fatto bella figura, ma con le sue regole.",
            "why": "Reggere la sfida mostra sangue freddo, ma accetti la cornice di chi ti mette fretta, e il prezzo resta al centro del discorso."
          },
          {
            "text": "\"In trenta secondi non ti convinco, e non dovresti fidarti di chi ci riesce. Ma dimmi: quel 14% è sullo stesso materiale, posa inclusa?\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "lettura": 2,
              "assertivita": 1,
              "strategia": 2
            },
            "outcome": "Tommaso esita un attimo di troppo. Sara interviene, tranquilla: \"Spessore diverso, e posa esclusa.\" Ottavio guarda prima te, poi Tommaso, e gli fa cenno di spegnere il cronometro.",
            "why": "Rifiuti la fretta senza rifiutare il confronto, e lo riporti sul merito con una domanda. Una sfida di status si vince cambiando le regole del gioco, non giocando più forte."
          }
        ]
      },
      {
        "text": "Al dolce Tommaso posa la forchetta e cambia tono. \"E poi, diciamolo: a Seregno ci avete consegnato con tre settimane di ritardo e le penali all'impresa le abbiamo pagate noi. Ottavio, te lo ricordi?\" È vero: la fabbrica aveva fermato un forno e tu li avevi avvisati tardi. Ottavio ti guarda, senza espressione.",
        "escalation": "Al dolce Tommaso, ormai convinto di averti in pugno, cala l'ultima carta.",
        "prompt": "Il colpo è vero. Come rispondi?",
        "options": [
          {
            "text": "\"Guarda, quel ritardo non dipendeva da noi: la fabbrica aveva fermato un forno per un guasto e sono slittati tutti gli ordini. Abbiamo fatto il possibile, credimi.\"",
            "quality": "weak",
            "effects": {
              "etica": -1,
              "assertivita": 1,
              "autocontrollo": 1,
              "strategia": -1
            },
            "outcome": "Tommaso allarga le braccia: \"E a noi cosa cambia di chi era la colpa?\" Ottavio non dice nulla, ma si vede che prende nota.",
            "why": "La spiegazione è vera, ma al cliente non interessa di chi è la colpa: interessa sapere se succederà di nuovo."
          },
          {
            "text": "\"È vero, e la colpa è mia: vi ho avvisati tardi. Da allora le date di consegna le mettiamo per iscritto, con una penale a nostro carico. Anche per il residence.\"",
            "quality": "best",
            "effects": {
              "etica": 2,
              "assertivita": 2,
              "strategia": 2
            },
            "outcome": "Qualche secondo di silenzio. Poi Ottavio, per la prima volta in tutta la sera, si sporge verso di te: \"Questo mi interessa. Mandami la proposta lunedì.\"",
            "why": "Ammettere un errore vero senza scuse, e mostrare cosa hai cambiato, trasforma il tuo punto debole nella prova della tua affidabilità."
          },
          {
            "text": "\"Se vogliamo fare i conti, Tommaso, anche voi a Seregno avete pagato a centoventi giorni invece che a sessanta. Nessuno è perfetto.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "autocontrollo": -2,
              "empatia": -2,
              "strategia": -2
            },
            "outcome": "Tommaso sorride, come se aspettasse proprio questo. Ottavio chiede il conto, e la cena si chiude con le strette di mano di rito.",
            "why": "Il contrattacco sembra pareggiare i conti, ma davanti a chi decide dimostra solo che sotto pressione reagisci invece di rispondere."
          },
          {
            "text": "\"Hai ragione, è stato un errore nostro. Su questa fornitura vi riconosco un 3% di sconto come risarcimento.\"",
            "quality": "good",
            "effects": {
              "etica": 2,
              "empatia": 1,
              "assertivita": 1,
              "strategia": -1
            },
            "outcome": "Tommaso prende nota dello sconto con piacere. Ottavio annuisce, ma la domanda che conta resta aperta: succederà di nuovo?",
            "why": "Ammettere è giusto, ma uno sconto risarcisce il passato senza garantire il futuro. E al cliente interessa il futuro."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "La mattina dopo scrivi una mail breve a Ottavio.",
      "model": "Buongiorno Ottavio, grazie per la cena di ieri. Come detto, per il residence mettiamo nel contratto le date di consegna, con una penale a nostro carico. Entro lunedì ti mando la proposta e un confronto voce per voce con l'altra offerta.",
      "keys": [
        {
          "label": "Ringraziamento e tono cordiale",
          "terms": [
            "grazie",
            "piacere",
            "cena",
            "serata",
            "buongiorno",
            "cordiali",
            "gentile"
          ]
        },
        {
          "label": "Impegno concreto sul punto debole",
          "terms": [
            "penale",
            "consegn",
            "contratto",
            "per iscritto",
            "date",
            "garanz",
            "scadenz"
          ]
        },
        {
          "label": "Prossimo passo con una data",
          "terms": [
            "entro",
            "lunedì",
            "ti mando",
            "proposta",
            "confronto",
            "prossima settimana",
            "appuntamento",
            "martedì"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "La cena era un test. Ottavio era già orientato a scegliere te, ma nel progetto precedente un fornitore era crollato davanti ai clienti finali, promettendo date impossibili pur di chiudere: così aveva chiesto a Tommaso di provocarti, per vedere come reggi la pressione. L'offerta più bassa del 14% esisteva, ma su un gres più sottile e senza posa: Sara lo sapeva, e aspettava solo che qualcuno lo chiedesse.",
      "principle": "Nelle sfide di status, chi decide raramente guarda chi vince lo scambio: guarda chi resta lucido.",
      "tip": "Quando qualcuno ti mette fretta per farti scoprire, rallenta e fai una domanda di merito: \"Prima di risponderti: quel prezzo è sullo stesso materiale?\""
    }
  },
  {
    "id": "confini-prestito-amico",
    "category": "confini",
    "difficulty": 2,
    "title": "L'amico che chiede di nuovo un prestito",
    "setting": "Luca, amico da dieci anni, ti chiede 800 euro \"solo fino a fine mese\". Sei mesi fa gliene avevi prestati 300: li ha restituiti a metà, dopo tre solleciti. Ti scrive su WhatsApp e poi ti chiama mentre sei al lavoro.",
    "cast": [
      {
        "name": "Luca",
        "role": "amico di lunga data",
        "note": "simpatico, generoso col tempo, disordinato con i soldi"
      }
    ],
    "objective": "Proteggere i tuoi soldi senza rovinare l'amicizia.",
    "rounds": [
      {
        "text": "Luca al telefono: \"Fratello, mi serve una mano, è una cosa seria. Fine mese te li ridò, promesso. Non lo chiederei se non fosse importante.\" Hai cinque minuti prima di una riunione.",
        "prompt": "Come rispondi adesso?",
        "options": [
          {
            "text": "\"Dimmi solo una cosa: per cosa ti servono?\"",
            "quality": "good",
            "effects": {
              "lettura": 2,
              "empatia": 1,
              "autocontrollo": 1
            },
            "outcome": "Luca esita: \"Una multa... e un paio di cose arretrate.\" Hai un'informazione in più, ma la riunione incombe e la pressione resta tutta su di te.",
            "why": "Capire il motivo è utile, ma farlo di corsa al telefono ti lascia comunque decidere sotto pressione."
          },
          {
            "text": "\"Sì, sì, va bene, ci penso io. Stai tranquillo.\"",
            "quality": "bad",
            "effects": {
              "assertivita": -2,
              "strategia": -2,
              "autocontrollo": -1,
              "empatia": 1
            },
            "outcome": "Luca ti ringrazia mille volte, convinto che sia fatta. Dopo la riunione ti accorgi di avergli fatto capire un sì senza aver deciso niente: né cifra né tempi.",
            "why": "Dire sì per chiudere il disagio della telefonata non è generosità: è evitare il conflitto, lo stesso schema dell'ultima volta.",
            "escalation": "Luca ti richiama convinto che il sì sia già arrivato, e si irrigidisce appena capisce che vuoi riparlarne."
          },
          {
            "text": "\"Luca, ho una riunione e non decido di corsa. Ti richiamo stasera alle 20 e ne parliamo bene.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "strategia": 2,
              "assertivita": 1
            },
            "outcome": "Luca sospira ma accetta: \"Va bene, stasera.\" Hai guadagnato il tempo per pensare invece di decidere sotto pressione.",
            "why": "La fretta è la leva più comune nelle richieste di denaro. Spostare la decisione a un momento scelto da te è già un confine."
          },
          {
            "text": "\"Ancora? L'ultima volta ci hai messo una vita a ridarmeli.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": -1,
              "assertivita": 1,
              "empatia": -2
            },
            "outcome": "Silenzio. Poi Luca, offeso: \"Ok, scusa se ho chiesto.\" La telefonata si chiude male e il problema resta aperto.",
            "why": "Il fatto è vero, ma usarlo come rimprovero a caldo sposta il discorso sull'orgoglio invece che sulla richiesta."
          }
        ]
      },
      {
        "text": "La sera Luca ti richiama. Ha preparato il discorso: \"Sai che con te ci sono sempre stato. Quando hai traslocato chi è venuto ad aiutarti? Io.\"",
        "escalation": "Luca è ancora irritato per la prima telefonata e parte subito all'attacco.",
        "prompt": "Luca usa il debito di riconoscenza. Cosa fai?",
        "options": [
          {
            "text": "\"Il trasloco non c'entra niente, non confondere le cose.\"",
            "quality": "bad",
            "effects": {
              "empatia": -2,
              "autocontrollo": -1,
              "lettura": 1,
              "strategia": -1
            },
            "outcome": "Luca si irrigidisce: \"Ah, quindi per te l'amicizia non conta.\" Ora state litigando sull'amicizia, non sul prestito.",
            "why": "Hai visto la leva, ma smontarla in modo secco fa sentire l'altro accusato e alza le difese.",
            "escalation": "Dopo lo scambio secco Luca è sulla difensiva e taglia corto."
          },
          {
            "text": "\"È vero, e ti sono grato. Proprio perché ci tengo, sui soldi voglio essere chiaro: tra noi non devono diventare un problema.\"",
            "quality": "best",
            "effects": {
              "empatia": 2,
              "assertivita": 2,
              "lettura": 1
            },
            "outcome": "Luca si ammorbidisce: \"Sì, hai ragione.\" Il tono si abbassa e potete parlare del concreto.",
            "why": "Riconosci il legame senza accettare lo scambio \"mi hai aiutato, quindi mi devi dei soldi\". Separi gratitudine e decisione."
          },
          {
            "text": "\"Ok, ok, hai ragione, scusa. Vediamo cosa posso fare, dai.\"",
            "quality": "weak",
            "effects": {
              "assertivita": -2,
              "autocontrollo": 1,
              "strategia": -1
            },
            "outcome": "Luca capisce che la leva ha funzionato e rilancia: \"Grazie, sapevo di poter contare su di te.\"",
            "why": "Cedere al senso di colpa insegna all'altro che quella leva funziona."
          },
          {
            "text": "\"Hai ragione, ci sei sempre stato e non me lo dimentico. Raccontami bene com'è la situazione, voglio capire.\"",
            "quality": "good",
            "effects": {
              "empatia": 2,
              "lettura": 1,
              "assertivita": -1
            },
            "outcome": "Luca ti spiega la multa e le spese arretrate. Ti senti più coinvolto, e anche più in obbligo.",
            "why": "Ascoltare va bene, ma senza un confine dichiarato rischi di scivolare verso il sì per senso di colpa."
          }
        ]
      },
      {
        "text": "Luca: \"Allora, me li puoi dare? A fine mese giuro che te li restituisco.\" Sai che 800 euro adesso non ti mettono in difficoltà, ma l'ultima volta il rimborso è stato faticoso.",
        "escalation": "Luca ormai dà per scontato il sì e parla già di quando ti farà il bonifico.",
        "prompt": "Prendi la decisione finale.",
        "options": [
          {
            "text": "\"Ti do 800, ma è l'ultima volta.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 1,
              "strategia": -2,
              "autocontrollo": -1
            },
            "outcome": "Luca accetta subito. A fine mese ti scrive che gli servono ancora \"un paio di settimane\".",
            "why": "\"L'ultima volta\" senza tempi, modi e conseguenze non è un accordo: è una speranza."
          },
          {
            "text": "\"Questa volta no, Luca. Non è contro di te: con i prestiti tra amici mi sono trovato male. Se vuoi ti aiuto a chiedere la rateizzazione della multa.\"",
            "quality": "good",
            "effects": {
              "assertivita": 3,
              "etica": 1,
              "empatia": 1
            },
            "outcome": "Luca è deluso ma non arrabbiato: \"Capisco. Sì, aiutami con la rateizzazione.\"",
            "why": "Un no chiaro con un aiuto alternativo concreto protegge te e il rapporto. Un po' più duro nel breve periodo."
          },
          {
            "text": "\"800 no. Posso darti 300, e mi restituisci 100 al mese da novembre. Se ti va bene lo scriviamo in un messaggio.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "assertivita": 2,
              "empatia": 1
            },
            "outcome": "Luca ci pensa e accetta: \"Ok, è giusto.\" Vi scrivete l'accordo e il primo bonifico arriva puntuale.",
            "why": "Una cifra che puoi permetterti di perdere e un piano di rientro chiaro e scritto: aiuti senza mettere l'amicizia in ostaggio dei soldi."
          },
          {
            "text": "\"Te li do solo se mi firmi una cambiale, sennò niente.\"",
            "quality": "bad",
            "effects": {
              "etica": -1,
              "empatia": -3,
              "strategia": 1
            },
            "outcome": "Luca ride nervoso, poi capisce che sei serio: \"Wow. Lascia stare.\" Non ti chiama per settimane.",
            "why": "Mettere per iscritto è sensato, ma imporlo come condizione umiliante trasforma un amico in un debitore sospetto."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi il messaggio WhatsApp che manderesti a Luca per fissare la tua decisione.",
      "model": "Ciao Luca, come d'accordo ti presto 300 euro oggi e me li restituisci con un bonifico di 100 euro al mese, entro il 5 di novembre, dicembre e gennaio. Ci tengo che i soldi non diventino mai un problema tra noi.",
      "keys": [
        {
          "label": "Decisione o cifra chiara",
          "terms": [
            "300",
            "euro",
            "non posso",
            "questa volta no",
            "ti presto",
            "€"
          ]
        },
        {
          "label": "Tempi e modo di restituzione",
          "terms": [
            "al mese",
            "entro",
            "bonific",
            "rate",
            "novembre",
            "scadenz"
          ]
        },
        {
          "label": "Tono che protegge il rapporto",
          "terms": [
            "ci tengo",
            "amicizia",
            "tra noi",
            "capisco",
            "grazie",
            "per te"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Luca non è un approfittatore: è disordinato con i soldi e conta sul fatto che per affetto tu dica sì. La multa è vera, ma nella cifra c'erano anche spese che poteva rimandare.",
      "principle": "Presta solo ciò che potresti perdere senza rancore, e metti per iscritto tempi e modi.",
      "tip": "Quando ti chiedono soldi con urgenza, prendi tempo: \"Ti rispondo stasera alle 20.\" Decidere a freddo cambia tutto."
    }
  },
  {
    "id": "confini-architetta-messaggi-notte",
    "category": "confini",
    "difficulty": 3,
    "title": "L'architetta che ti scrive a mezzanotte",
    "setting": "Valentina, architetta d'interni, ti porta sei o sette progetti l'anno: circa il 15% del fatturato dello showroom. Da due anni le rispondi entro dieci minuti, anche alle undici di sera o la domenica mattina. Da lunedì ti sono già arrivati due vocali dopo le 22, e per uno hai rifatto un preventivo fino a mezzanotte.",
    "cast": [
      {
        "name": "Valentina",
        "role": "architetta d'interni, cliente importante",
        "note": "brillante, sempre di corsa, manda vocali da tre minuti"
      }
    ],
    "objective": "Mettere orari chiari senza perdere una cliente che vale il 15% del fatturato.",
    "rounds": [
      {
        "text": "Mercoledì, ore 23:15. Terzo vocale della settimana: Valentina vuole togliere il mosaico dal preventivo del bagno e aggiungere il battiscopa, \"per domattina alle 9, che il cliente passa in studio\". Alle 23:32 arriva un altro messaggio: \"Ci sei?\" La modifica ti richiederebbe un quarto d'ora.",
        "prompt": "Cosa fai stasera?",
        "options": [
          {
            "text": "Le rispondi con un vocale: \"Certo, te lo preparo adesso!\" Alle 23:50 il preventivo è nella sua casella.",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "assertivita": -2,
              "autocontrollo": -1,
              "strategia": -2
            },
            "outcome": "Valentina ti manda un cuore e un \"Sei un mito\". Il giorno dopo, alle 22:40, arriva il vocale successivo.",
            "why": "Ogni risposta immediata a mezzanotte è una lezione: le stai insegnando che a quell'ora ci sei."
          },
          {
            "text": "Non rispondi. Domattina alle 8:15 le mandi il preventivo aggiornato, senza commentare l'orario del messaggio.",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "strategia": 2,
              "assertivita": 1,
              "empatia": 1
            },
            "outcome": "Alle 8:20 Valentina risponde: \"Perfetto, grazie!\" Ha quello che le serve in tempo per il cliente, e nessuno ha lavorato a mezzanotte.",
            "why": "Il suo bisogno reale era avere il preventivo alle 9, non alle 23:30. Rispondere al bisogno e non all'orario è il primo confine, ed è silenzioso."
          },
          {
            "text": "Rispondi subito: \"Valentina, sono le 23:30. Ne parliamo domani in orario di lavoro.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Valentina si scusa, un po' gelata: \"Ah, scusa, non volevo disturbare.\" La mattina dopo il clima è freddo, e intanto le hai risposto comunque a mezzanotte.",
            "why": "Un confine detto a caldo, di notte e per iscritto, suona come un rimprovero. E rispondendo alle 23:30 contraddici quello che stai dicendo."
          },
          {
            "text": "Rispondi solo: \"Ricevuto, domattina alle 8:30 lo trovi in mail.\" Poi metti il telefono in carica in cucina.",
            "quality": "good",
            "effects": {
              "autocontrollo": 1,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "Valentina: \"Grazie, sei un tesoro!\" Tutto risolto, ma il messaggio implicito resta: alle 23:30 rispondi ancora.",
            "why": "Rassicurare in due righe è gentile ed efficiente, ma conferma la reperibilità notturna: è un confine a metà."
          }
        ]
      },
      {
        "text": "Lunedì Valentina passa in showroom per scegliere i materiali di una villa. Ridendo: \"Ieri ti ho cercato tre volte, eh! Ormai sei il mio pronto soccorso.\" Domenica ti aveva scritto alle 8:10 per il parquet e poi chiamato due volte. Siete soli al tavolo dei campioni.",
        "escalation": "Lunedì Valentina passa in showroom, ormai abituata alle tue risposte a qualsiasi ora.",
        "prompt": "È il momento di parlarne. Come lo dici?",
        "options": [
          {
            "text": "Ridi: \"Pronto soccorso sì, ma con gli orari dell'ambulatorio!\" e passi ai campioni.",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "assertivita": -1,
              "strategia": -1
            },
            "outcome": "Valentina ride: \"Giusto, giusto!\" Mercoledì sera alle 22:50 arriva un vocale di quattro minuti.",
            "why": "Una battuta permette di dire una cosa vera senza dirla davvero. Per questo non cambia niente."
          },
          {
            "text": "\"Valentina, te lo dico chiaro: questi messaggi a tutte le ore mi stanno esasperando. Non sono un tuo dipendente.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "empatia": -3,
              "autocontrollo": -2,
              "strategia": -2
            },
            "outcome": "Valentina impallidisce: \"Non pensavo di darti così fastidio. Scusa.\" Per il resto dell'incontro è cortese e distante, e sceglie i materiali della villa in fretta.",
            "why": "Due anni di sì accumulati escono tutti insieme, come un'accusa. Ma quell'abitudine l'avete costruita in due, e lei non sapeva che ti pesasse."
          },
          {
            "text": "\"Mi fa piacere essere il tuo riferimento, e voglio continuare a esserlo bene. Quindi facciamo così: scrivimi quando vuoi, io rispondo dalle 8:30 alle 19. Per un'urgenza vera di cantiere, chiamami.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "empatia": 2,
              "strategia": 2
            },
            "outcome": "Valentina ci pensa un attimo: \"Giusto. Anch'io dovrei fare così con i miei clienti.\" Da quel giorno i messaggi arrivano ancora la sera, ma senza \"Ci sei?\".",
            "why": "Una regola chiara, detta con calma e con un'eccezione per le vere urgenze, protegge te senza togliere niente a lei: sa esattamente cosa aspettarsi."
          },
          {
            "text": "\"Scusami tanto se ieri non ti ho risposto, non era per te. Sai, la domenica cerco di staccare un po'. Se riesci a scrivermi in settimana mi fai proprio un favore, davvero.\"",
            "quality": "good",
            "effects": {
              "empatia": 2,
              "assertivita": 1,
              "autocontrollo": 1,
              "strategia": -1
            },
            "outcome": "Valentina: \"Ma certo, scusami tu!\" Per due settimane le domeniche sono tranquille, ma la sera i vocali continuano come prima.",
            "why": "Ti scusi per un limite legittimo e lo presenti come un favore: così diventa negoziabile, e riguarda solo la domenica."
          }
        ]
      },
      {
        "text": "Tre settimane dopo, giovedì alle 22:40, arriva un messaggio di Valentina. \"Scusa l'ora, non ti chiamo per non disturbare. Domattina alle 7 il posatore inizia la villa, ma l'impresa dice che il massetto forse non è asciutto. Posa o non posa?\" Sono 140 metri quadri di gres già consegnato.",
        "escalation": "Tre settimane dopo i vocali notturni non sono diminuiti, e giovedì alle 22:40 arriva l'ennesimo messaggio di Valentina.",
        "prompt": "Il tuo orario è finito da un pezzo. Cosa fai?",
        "options": [
          {
            "text": "Non rispondi: se cedi adesso, torni al punto di partenza. La chiami domattina alle 8:30.",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "lettura": -2,
              "strategia": -2,
              "empatia": -2
            },
            "outcome": "Alle 8:30, quando la chiami, il posatore ha già steso quaranta metri. Andranno staccati e rifatti, e Valentina ti chiede solo: \"Perché non mi hai risposto?\"",
            "why": "Un confine serve a proteggere il tuo tempo, non a farti ignorare un danno reale. Applicato alla cieca, sembra un capriccio."
          },
          {
            "text": "Rispondi per messaggio: \"Non far posare finché non misuriamo l'umidità. Domattina alle 7 ti chiamo.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "lettura": 1,
              "empatia": 1
            },
            "outcome": "Valentina: \"Ok, grazie!\" Alle 7 però il posatore è già sul posto e aspetta istruzioni: si perde mezza mattina a riorganizzarsi.",
            "why": "La decisione è giusta, ma lasci aperti i dettagli fino all'ultimo minuto. In un'urgenza vera, una telefonata di due minuti vale più di un messaggio."
          },
          {
            "text": "Rispondi: \"Ok, ti aiuto, ma a quest'ora dovrebbe essere un'eccezione, lo sai. Comunque: non far posare.\"",
            "quality": "weak",
            "effects": {
              "lettura": 1,
              "assertivita": 1,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Valentina risponde solo: \"Ok.\" Hai salvato la posa, ma lei ha capito che anche quando chiede aiuto per una cosa seria si prende una lezione.",
            "why": "Rimarcare la regola in piena emergenza, quando lei ha perfino evitato di chiamarti per rispetto, trasforma un confine in una predica."
          },
          {
            "text": "La chiami subito: \"Hai fatto bene a scrivermi. Non far posare: domattina alle 7:30 mando il tecnico a misurare l'umidità.\"",
            "quality": "best",
            "effects": {
              "lettura": 2,
              "strategia": 2,
              "empatia": 2
            },
            "outcome": "Valentina tira un sospiro: \"Grazie. Davvero.\" La mattina il tecnico misura: massetto ancora umido, posa rimandata di quattro giorni, nessun danno.",
            "why": "Un confine credibile ha eccezioni chiare, e rispettarle è ciò che lo rende solido. Ora lei sa che la regola protegge entrambi: il tuo tempo e i suoi cantieri."
          }
        ]
      }
    ],
    "phrase": {
      "round": 1,
      "prompt": "Dopo l'incontro, scrivi il messaggio con cui fissi la regola per iscritto.",
      "model": "Valentina, lavorare con te mi piace e voglio farlo bene. Da oggi rispondo ai messaggi dalle 8:30 alle 19, dal lunedì al sabato. Per un'urgenza vera di cantiere chiamami pure, a qualsiasi ora.",
      "keys": [
        {
          "label": "Orari chiari",
          "terms": [
            "dalle",
            "alle",
            "orari",
            "19",
            "lunedì",
            "sabato",
            "in settimana",
            "fino alle"
          ]
        },
        {
          "label": "Eccezione per le vere urgenze",
          "terms": [
            "urgen",
            "chiam",
            "emergen",
            "cantiere",
            "telefon",
            "qualsiasi ora",
            "grave"
          ]
        },
        {
          "label": "Tono che protegge il rapporto",
          "terms": [
            "mi piace",
            "voglio",
            "ci tengo",
            "collabor",
            "insieme",
            "grazie",
            "rapporto",
            "farlo bene"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Valentina non pretendeva risposte immediate: ci si era abituata, perché per due anni gliele avevi date in dieci minuti, anche a mezzanotte. Scrive di notte perché è il suo unico momento libero dopo aver messo a letto le figlie, e perché il suo cliente più grosso fa lo stesso con lei. Dopo la tua regola ne ha messa una anche a lui, e non l'ha perso.",
      "principle": "Le persone ti trattano come le hai abituate: un confine non punisce l'altro, cambia un'abitudine che avete costruito in due.",
      "tip": "Rispondi al bisogno, non all'orario: un \"Eccoti il preventivo\" mandato alle 8:15 insegna più di qualsiasi discorso sui messaggi notturni."
    }
  },
  {
    "id": "confini-sorella-lavoro-nipote",
    "category": "confini",
    "difficulty": 5,
    "title": "Il pranzo della domenica e il posto per Matteo",
    "setting": "Domenica, pranzo a casa di tua madre. Ci sono tua sorella Elena e suo figlio Matteo, 25 anni; tuo cognato Stefano non è venuto (\"aveva da fare\") ed Elena è tesa da quando è arrivata. Due anni fa Matteo ha lavorato otto mesi da te come commerciale: appuntamenti saltati, un cliente perso, poi se n'è andato prima che dovessi mandarlo via tu. Quest'anno in azienda hai bloccato le assunzioni.",
    "cast": [
      {
        "name": "Elena",
        "role": "tua sorella maggiore",
        "note": "pratica, orgogliosa, oggi più nervosa del solito"
      },
      {
        "name": "Rosa",
        "role": "tua madre, 74 anni",
        "note": "vuole soltanto che i figli vadano d'accordo"
      },
      {
        "name": "Matteo",
        "role": "tuo nipote",
        "note": "educato, silenzioso, guarda spesso il telefono"
      }
    ],
    "objective": "Decidere sul lavoro per Matteo a mente fredda, senza cedere al senso di colpa e senza rompere con tua sorella.",
    "rounds": [
      {
        "text": "Al secondo Elena posa la forchetta: \"Matteo è cambiato, è maturato. Prendilo con te da gennaio: a te non cambia niente, a lui cambia la vita.\" La mamma aggiunge subito: \"Dai, è tuo nipote.\" Matteo fissa il piatto e non dice una parola.",
        "prompt": "Tutti ti guardano, tranne lui. Cosa fai?",
        "options": [
          {
            "text": "\"Elena, l'ultima volta è stato un disastro: appuntamenti saltati e un cliente perso. Non se ne parla.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "empatia": -3,
              "autocontrollo": -1,
              "strategia": -2
            },
            "outcome": "Matteo diventa rosso e si alza a sparecchiare. Elena ti fulmina: \"Complimenti, davanti a lui.\" La mamma ha gli occhi lucidi.",
            "why": "Tutto vero, ma umiliare Matteo davanti alla famiglia ti dà ragione e ti fa perdere il pranzo, la sorella e qualsiasi possibilità di aiutarlo davvero."
          },
          {
            "text": "\"Fammi vedere com'è messo il budget dopo le feste e poi ti faccio sapere, va bene?\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "empatia": 1,
              "assertivita": -2,
              "etica": -1
            },
            "outcome": "Elena sorride, sollevata: \"Grazie, sapevo di poter contare su di te.\" Per lei è un sì. Per te era un modo per chiudere il discorso.",
            "why": "Un \"vediamo\" detto per evitare la scena viene sentito come una promessa. Tra un mese il no costerà il doppio."
          },
          {
            "text": "Ti rivolgi a lui: \"Matteo, prima vorrei sentirlo da te. È un lavoro che vuoi davvero?\"",
            "quality": "best",
            "effects": {
              "lettura": 3,
              "empatia": 2,
              "strategia": 1
            },
            "outcome": "Silenzio. Matteo alza lo sguardo, guarda sua madre, poi mormora: \"Sì... sì, certo.\" Non suona come un sì. Elena si irrigidisce.",
            "why": "Tutti parlano di Matteo, nessuno parla con Matteo. Rimettere al centro l'interessato cambia la domanda: non \"ci fai questo favore?\", ma \"cosa serve davvero a lui?\"."
          },
          {
            "text": "\"Non decido a tavola, davanti alla mamma. Elena, martedì sera ci vediamo io e te e ne parliamo con calma.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "strategia": 1,
              "assertivita": 1,
              "empatia": -1
            },
            "outcome": "Elena insiste: \"Perché, cosa c'è da discutere?\" Hai preso tempo, ma Matteo è rimasto fuori dal discorso, come se la cosa non lo riguardasse.",
            "why": "Spostare la decisione a freddo è giusto, ma continui a trattare con la madre il futuro di un adulto di 25 anni."
          }
        ]
      },
      {
        "text": "Elena non molla. Con la voce incrinata: \"Quando papà stava male, chi lo portava in ospedale tre volte a settimana? Io. Tu eri a Giacarta. Adesso ti chiedo una cosa sola.\" La mamma abbassa gli occhi. È vero: quei mesi li ha retti lei, anche se le cure le pagavi tu.",
        "escalation": "Elena, ferita da come è andato l'inizio del pranzo, passa all'attacco.",
        "prompt": "Il senso di colpa è sul tavolo, e ha una parte di verità. Come rispondi?",
        "options": [
          {
            "text": "\"Papà non c'entra niente, Elena. E se proprio vogliamo fare i conti, la clinica e la badante le pagavo io, ogni mese, fino all'ultimo.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "empatia": -3,
              "autocontrollo": -2,
              "strategia": -2
            },
            "outcome": "La mamma si alza e va in cucina. Elena, gelida: \"Ecco, per te è sempre una questione di soldi.\" Adesso state litigando su vostro padre.",
            "why": "Rispondere a una contabilità con un'altra contabilità è la mossa più naturale e la più distruttiva: trasforma un dolore in un processo."
          },
          {
            "text": "\"Elena, scusa, ma non è da te parlare così. Oggi c'è qualcos'altro che non ci stai dicendo, vero?\"",
            "quality": "good",
            "effects": {
              "lettura": 2,
              "empatia": 2,
              "assertivita": -1
            },
            "outcome": "Elena si blocca e guarda la mamma: \"Non c'è niente! Ti ho chiesto una cosa semplice.\" L'intuizione era giusta, ma davanti a sua madre non poteva risponderti.",
            "why": "Hai letto bene la situazione, ma una domanda così intima, fatta davanti a un terzo, mette l'altro con le spalle al muro."
          },
          {
            "text": "\"Hai ragione, scusa, hai fatto tutto tu e io non c'ero. Va bene, da gennaio lo prendo con me. Basta, non litighiamo proprio oggi.\"",
            "quality": "weak",
            "effects": {
              "empatia": 2,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "La mamma sorride, Elena respira. Matteo non sorride affatto. Hai appena preso un impegno da 1.800 euro al mese per chiudere una discussione.",
            "why": "Cedere al senso di colpa riporta la pace per un pomeriggio, ma fa del lavoro di Matteo un risarcimento: per lui il ruolo peggiore possibile."
          },
          {
            "text": "\"Quei mesi li hai retti tu, e non ti ho mai ringraziata davvero. Grazie. Ma assumere Matteo non può servire a pareggiare i conti.\"",
            "quality": "best",
            "effects": {
              "empatia": 2,
              "assertivita": 2,
              "autocontrollo": 1,
              "etica": 1
            },
            "outcome": "Elena ha gli occhi lucidi. Per un momento nessuno parla. Poi, piano: \"Non è per pareggiare.\" Non aggiunge altro, ma il tono è cambiato.",
            "why": "Il senso di colpa funziona finché la ferita non viene riconosciuta. Riconoscerla davvero e separarla dalla richiesta toglie forza alla leva, senza negare il dolore."
          }
        ]
      },
      {
        "text": "Dopo il caffè Elena ti raggiunge sul balcone, da sola. A bassa voce: \"Io e Stefano ci stiamo separando. La mamma non lo sa ancora. Ho paura per Matteo, voglio che abbia almeno uno stipendio sicuro.\" Dalla finestra vedi Matteo che scrive veloce al telefono.",
        "escalation": "Dopo il caffè Elena, ancora rossa in viso per la discussione, ti raggiunge sul balcone.",
        "prompt": "Ora sai cosa c'è sotto. Qual è la tua proposta?",
        "options": [
          {
            "text": "\"Allora va bene, lo prendo. In un momento così non me la sento proprio di dirti di no, ci mancherebbe.\"",
            "quality": "weak",
            "effects": {
              "empatia": 2,
              "autocontrollo": 1,
              "assertivita": -2,
              "strategia": -2
            },
            "outcome": "Elena ti abbraccia, sollevata. A gennaio Matteo inizia svogliato, a marzo salta il primo appuntamento, e a tavola nessuno sa più come parlarne.",
            "why": "La compassione è giusta, la decisione no: assumere qualcuno per calmare l'ansia di un altro mette in difficoltà proprio la persona che vuoi proteggere."
          },
          {
            "text": "\"Mi dispiace, Elena. Ci sono, per te e per lui. Ma prima di parlare di posti, giovedì vedo Matteo da solo e sento cosa vuole lui.\"",
            "quality": "best",
            "effects": {
              "empatia": 2,
              "lettura": 2,
              "strategia": 2,
              "assertivita": 1
            },
            "outcome": "Elena esita, poi annuisce: \"Va bene. Forse con te parla più che con me.\" Ti stringe il braccio prima di rientrare.",
            "why": "Accogli la paura senza farne la base della decisione, e restituisci la scelta a chi spetta. Un confine maturo non chiude la porta: porta l'aiuto dove serve davvero."
          },
          {
            "text": "\"Mi dispiace per Stefano, Elena, davvero. Ma la tua separazione non è un buon motivo per scaricare Matteo su di me.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "empatia": -3,
              "autocontrollo": -1,
              "strategia": -2
            },
            "outcome": "Elena si irrigidisce come se l'avessi schiaffeggiata: \"Scaricare. Grazie.\" Rientra senza una parola e dieci minuti dopo se ne va, portandosi via Matteo.",
            "why": "Il confine c'è, ma le parole scelte trasformano una madre spaventata in una che approfitta. Ti ha confidato una cosa fragile e ha ricevuto un'accusa."
          },
          {
            "text": "\"Mi dispiace davvero, Elena. Un posto da noi non c'è, ma conosco due imprese che cercano un magazziniere e un impiegato: domani parlo io con loro per Matteo.\"",
            "quality": "good",
            "effects": {
              "empatia": 1,
              "strategia": 2,
              "assertivita": 2,
              "lettura": -1
            },
            "outcome": "Elena è delusa ma ringrazia: \"Va bene, grazie.\" È un no pulito con un aiuto concreto, anche se pure tu stai decidendo per Matteo senza averlo ascoltato.",
            "why": "Un no con un'alternativa concreta è solido. Ma resta una soluzione decisa tra adulti, sopra la testa di un adulto."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "La sera stessa scrivi un messaggio a Matteo.",
      "model": "Ciao Matteo, oggi a pranzo si è parlato tanto di te e poco con te. Giovedì ti va di pranzare insieme, solo io e te? Non ti prometto un posto: voglio capire cosa vuoi fare tu.",
      "keys": [
        {
          "label": "Invito concreto a due",
          "terms": [
            "giovedì",
            "pranzo",
            "pranzare",
            "insieme",
            "io e te",
            "ci vediamo",
            "caffè",
            "vieni"
          ]
        },
        {
          "label": "Al centro la sua scelta",
          "terms": [
            "cosa vuoi",
            "vuoi fare",
            "scegli",
            "decid",
            "idee",
            "progett",
            "desider",
            "ascolt"
          ]
        },
        {
          "label": "Onestà: nessuna promessa",
          "terms": [
            "non ti prometto",
            "nessuna promessa",
            "senza promess",
            "non posso promett",
            "non è un sì",
            "onest",
            "sincer",
            "chiaro"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Matteo non voleva tornare da te: aveva superato la selezione per un corso ITS da tecnico di cantiere, e il messaggio che scriveva in salotto era la conferma dell'iscrizione, in scadenza lunedì. Non l'aveva detto a nessuno per paura di lasciare la madre sola proprio durante la separazione. Elena non chiedeva davvero un lavoro: chiedeva di non sentirsi sola, e il posto da te era l'unica soluzione che conosceva.",
      "principle": "Quando il senso di colpa chiede un favore, riconosci il debito affettivo, poi chiediti: a chi serve davvero questa cosa?",
      "tip": "Se qualcuno ti chiede un favore per conto di un altro, parla prima con l'interessato: \"Prima ne parlo con Matteo, poi ti rispondo.\""
    }
  },
  {
    "id": "reputazione-merito-piano-clienti",
    "category": "reputazione",
    "difficulty": 2,
    "title": "Il collega presenta il tuo piano come suo",
    "setting": "Riunione trimestrale, ore 9:30. Ci sono il socio di maggioranza Giorgio Ferri, l'area manager Marco Pellegrini e tu. Giovedì avevi mandato a Marco, per un parere, il tuo piano per riattivare i 40 clienti fermi da sei mesi: tre sere di lavoro, numeri compresi.",
    "cast": [
      {
        "name": "Marco Pellegrini",
        "role": "area manager vendite",
        "note": "brillante davanti ai clienti, ottimo oratore, ultimamente sempre di corsa"
      },
      {
        "name": "Giorgio Ferri",
        "role": "socio di maggioranza",
        "note": "parla poco in riunione, osserva molto, decide in fretta"
      }
    ],
    "objective": "Farti riconoscere il lavoro senza trasformare la riunione in uno scontro.",
    "rounds": [
      {
        "text": "Marco proietta il tuo documento con un titolo nuovo in copertina: \"Ho preparato un piano per i 40 clienti fermi: prima i dieci con più margine, poi una visita con il campionario nuovo.\" Ferri annuisce: \"Bel lavoro, Marco.\" Marco non ti guarda.",
        "prompt": "Hai due secondi. Cosa fai?",
        "options": [
          {
            "text": "Stai zitto e annuisci. Ne parlerai con Marco dopo, a quattr'occhi, senza testimoni.",
            "quality": "weak",
            "effects": {
              "autocontrollo": 2,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "La riunione scorre liscia. Ferri chiede a Marco di seguire il progetto, e tu esci dalla sala con il tuo lavoro intestato a un altro.",
            "why": "Evitare la scena è saggio, ma in quel momento il silenzio diventa una versione dei fatti: quella di Marco."
          },
          {
            "text": "\"Scusa, Marco: quel piano l'ho scritto io giovedì. Ce l'hai ancora nella posta, se vuoi controllare.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -2,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Gelo. Marco si irrigidisce: \"Ne avevamo parlato insieme, mi sembra.\" Ferri guarda l'orologio: ora in sala c'è una lite, non un piano.",
            "why": "Hai ragione nei fatti, ma un'accusa in pubblico mette l'altro con le spalle al muro: si difenderà, e agli occhi del socio diventate due che litigano."
          },
          {
            "text": "\"Aggiungo un dettaglio che nel piano ho messo in fondo: i primi dieci li ho scelti per margine, non per fatturato.\"",
            "quality": "best",
            "effects": {
              "strategia": 2,
              "autocontrollo": 2,
              "assertivita": 2
            },
            "outcome": "Ferri si gira verso di te: \"Perché per margine?\" Spieghi i numeri con la sicurezza che solo chi li ha fatti può avere. Marco resta in silenzio.",
            "why": "Rivendichi il lavoro entrando nel merito, non accusando: chi conosce i dettagli è l'autore, e tutti lo capiscono senza che tu lo dica."
          },
          {
            "text": "\"Mi fa piacere che il piano piaccia. Marco, se ti va la parte sui margini la illustro io, visto che l'ho scritta.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "strategia": 1,
              "autocontrollo": 1,
              "empatia": -1
            },
            "outcome": "Marco, preso in contropiede, ti cede la parola. Il messaggio è passato, ma con una punta che Ferri ha notato.",
            "why": "Chiaro e senza alzare la voce. L'inciso \"visto che l'ho scritta\" però suona come una stoccata, e in pubblico pesa."
          }
        ]
      },
      {
        "text": "Dopo la riunione Marco ti raggiunge alla macchinetta del caffè: \"Dai, non farne un caso. Le idee erano anche mie, ne avevamo parlato a pranzo due settimane fa. Siamo la stessa squadra, no?\"",
        "escalation": "Marco ha già raccontato in ufficio che il piano \"l'avete fatto insieme\", e alla macchinetta ti affronta sulla difensiva.",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Va bene, non ne facciamo un caso. La prossima volta però il piano lo presentiamo insieme, e lo diciamo chiaramente a Ferri.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "Marco accetta subito, sollevato: \"Certo, ovvio.\" Il problema per il futuro è risolto; il perché di oggi resta un mistero.",
            "why": "Una regola per il futuro è utile, ma chiudi in fretta senza capire che cosa ha spinto Marco a farlo."
          },
          {
            "text": "\"Ne abbiamo parlato, è vero. Ma il documento l'ho scritto io, e voglio che si sappia. Cosa succede, Marco?\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "lettura": 2,
              "empatia": 1,
              "autocontrollo": 1
            },
            "outcome": "Marco abbassa lo sguardo. Dopo un silenzio: \"Ferri mi sta col fiato sul collo per i numeri. Ho fatto una cavolata.\"",
            "why": "Riconosci la parte vera, fissi il confine sul fatto e poi fai una domanda: spesso dietro un furto di merito c'è paura, non strategia."
          },
          {
            "text": "\"Squadra? Perfetto. Allora vediamo se Ferri la pensa così quando gli giro la mail di giovedì, con il mio file allegato.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "autocontrollo": -2,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Marco impallidisce, poi si chiude: \"Fai come vuoi.\" Da quel giorno ogni informazione che ti passa è filtrata.",
            "why": "La minaccia ti dà soddisfazione per dieci secondi e ti costa un collega per mesi. Una prova si usa se serve, non si agita come un'arma."
          },
          {
            "text": "\"Lascia stare, l'importante è che i clienti tornino. Non ne facciamo un dramma, dai.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "Marco sorride, sollevato. La settimana dopo presenta a Ferri anche la tua analisi sui listini, senza citarti.",
            "why": "Lasciar correre insegna all'altro che il tuo lavoro è a disposizione. Il merito non conta per vanità: conta per le decisioni future su di te."
          }
        ]
      },
      {
        "text": "Il giorno dopo Ferri ti chiama nel suo ufficio: \"Voglio affidare il progetto clienti fermi a Marco, con un premio se ne riattiva quindici entro marzo. Tu che ne dici?\" Ti guarda dritto, senza fretta.",
        "escalation": "Ferri ha sentito voci di tensione tra te e Marco e ti convoca per capire, già con un'idea in testa.",
        "prompt": "Cosa rispondi a Ferri?",
        "options": [
          {
            "text": "\"Decidi tu, Giorgio. A me interessa che i clienti tornino a comprare: chi segue il progetto, alla fine, conta poco.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "etica": 1,
              "assertivita": -2,
              "strategia": -1
            },
            "outcome": "Ferri annuisce lentamente: \"Va bene.\" Il progetto va a Marco, e con lui il premio e la visibilità.",
            "why": "La modestia di facciata qui è una rinuncia. Se il lavoro è tuo e lo sai guidare, dirlo con calma non è arroganza."
          },
          {
            "text": "\"Il piano l'ho scritto io, Marco l'ha presentato come suo. E sinceramente non so se saprebbe gestire la parte sui margini.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "empatia": -2,
              "etica": -1,
              "strategia": -2
            },
            "outcome": "Ferri alza un sopracciglio: \"Capisco.\" Hai detto la verità, ma ora per lui sei anche quello che parla male di un collega.",
            "why": "Il fatto andava detto, il giudizio no. Screditare l'altro trasforma una rivendicazione legittima in una lotta di potere."
          },
          {
            "text": "\"Va bene affidarlo a Marco. Vorrei solo che fosse chiaro che il documento è mio: ci ho lavorato tre sere.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "autocontrollo": 1,
              "etica": 1,
              "strategia": -1
            },
            "outcome": "Ferri prende nota: \"Ok, lo terrò presente.\" Il merito è registrato, ma il progetto l'hai ceduto tu.",
            "why": "Rivendichi in modo pulito, ma separi il merito dalla guida: domani i risultati porteranno il nome di Marco."
          },
          {
            "text": "\"Il piano l'ho scritto io e ci credo. Propongo: io guido selezione e numeri, Marco fa le visite. Premio su quanti clienti riattiviamo insieme.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "assertivita": 2,
              "etica": 1,
              "empatia": 1
            },
            "outcome": "Ferri sorride per la prima volta: \"Era quello che volevo sentire.\" Il progetto parte con due nomi, e il tuo è il primo.",
            "why": "Un fatto detto senza rancore più una proposta che include l'altro: sembri quello che risolve, non quello che si lamenta."
          }
        ]
      }
    ],
    "phrase": {
      "round": 1,
      "prompt": "Scrivi cosa dici a Marco, a quattr'occhi, per chiudere la questione.",
      "model": "Marco, il documento l'ho scritto io e la prossima volta voglio che si dica chiaramente. Se sei sotto pressione per i numeri parliamone: preferisco darti una mano che farti concorrenza.",
      "keys": [
        {
          "label": "Il fatto, detto chiaramente",
          "terms": [
            "l'ho scritto",
            "scritto io",
            "documento",
            "il piano",
            "è mio",
            "l'ho preparato",
            "giovedì"
          ]
        },
        {
          "label": "Una richiesta per il futuro",
          "terms": [
            "prossima volta",
            "d'ora in poi",
            "in futuro",
            "voglio che",
            "si dica",
            "citar",
            "insieme",
            "chiedo"
          ]
        },
        {
          "label": "Apertura a capire",
          "terms": [
            "parliamone",
            "cosa succede",
            "pressione",
            "una mano",
            "aiut",
            "capire",
            "come stai",
            "preoccup"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Marco era sotto esame: la settimana prima Ferri gli aveva detto che, senza risultati entro il trimestre, avrebbe cambiato area manager, e lui ha presentato il tuo piano per panico, non per calcolo. Ferri però se n'era accorto subito: nella barra in alto dello schermo si leggeva ancora il nome del file, con le tue iniziali. Non ha detto niente perché voleva vedere chi dei due avrebbe gestito la cosa da adulto.",
      "principle": "Il merito si difende con i fatti e con la competenza, mai con un'accusa in pubblico.",
      "tip": "Rivendica entrando nel merito, non nella polemica: \"Aggiungo un dettaglio che ho messo in fondo al documento...\" Chi conosce i dettagli si rivela autore da solo."
    }
  },
  {
    "id": "reputazione-screenshot-gruppo-posatori",
    "category": "reputazione",
    "difficulty": 3,
    "title": "Uno screenshot tagliato nel gruppo dei posatori",
    "setting": "Sono le 21:40. Nel gruppo WhatsApp \"Rete Posa Cremona\", 38 tra posatori e artigiani con cui lavora il tuo showroom, Gianni Ruggeri pubblica lo screenshot di un tuo messaggio di tre mesi fa a un geometra: \"I posatori della zona sono cari, è vero.\" Sotto, il suo commento: \"Ecco cosa dice di noi quando non ci siamo.\" Il messaggio intero continuava: \"...ma sono cari perché sono bravi: chi risparmia sulla posa poi paga il triplo.\"",
    "cast": [
      {
        "name": "Gianni Ruggeri",
        "role": "posatore, partner storico dello showroom",
        "note": "bravo, orgoglioso, parla chiaro anche quando sbaglia"
      },
      {
        "name": "Sara Bonfanti",
        "role": "tua collaboratrice in showroom",
        "note": "tiene i rapporti con i posatori, si agita quando il gruppo si infiamma"
      }
    ],
    "objective": "Fermare il danno con i posatori senza processi pubblici né contrattacchi.",
    "rounds": [
      {
        "text": "In dodici minuti arrivano tre risposte: \"Bello sapere.\" \"Ecco perché ultimamente dallo showroom non arriva più niente.\" Un pollice in giù. Sara ti scrive in privato: \"Hai visto? Rispondi subito o li perdiamo tutti.\"",
        "prompt": "Cosa fai stasera?",
        "options": [
          {
            "text": "Chiami subito Gianni, in privato, per capire da dove arriva lo screenshot e perché l'ha messo nel gruppo.",
            "quality": "good",
            "effects": {
              "lettura": 2,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "Gianni risponde secco, ma risponde. Intanto nel gruppo, senza una tua parola, i messaggi salgono a nove.",
            "why": "Parlare con la fonte è giusto, ma un gruppo che non sente la tua voce per una notte si scrive la storia da solo."
          },
          {
            "text": "Scrivi nel gruppo: \"Ho visto. La frase è tagliata, il senso era l'opposto. Domattina sento Gianni e poi scrivo qui.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "strategia": 2,
              "assertivita": 1,
              "empatia": 1
            },
            "outcome": "Due posatori mettono un pollice in su, uno scrive \"vediamo\". Il gruppo si calma: c'è una tua parola e un impegno preciso.",
            "why": "Una riga presidia il gruppo senza aprire il processo: segnali che c'è un contesto e che ci metti la faccia, poi tratti la persona prima della piazza."
          },
          {
            "text": "Posti lo screenshot intero della chat con il geometra, nome e budget del cliente compresi: \"Leggete tutto prima di sparare sentenze.\"",
            "quality": "bad",
            "effects": {
              "lettura": 1,
              "etica": -2,
              "autocontrollo": -2,
              "strategia": -1
            },
            "outcome": "Alle 22:15 il geometra ti chiama, furioso: \"Hai messo in piazza un mio cliente?\" Nel gruppo qualcuno commenta: \"Bello, adesso sappiamo anche quanto spendono i tuoi clienti.\"",
            "why": "Hai la prova e la usi male: esponi un terzo che non c'entra e trasformi il gruppo in un tribunale dove si vota chi ha ragione."
          },
          {
            "text": "Non rispondi: a quest'ora qualsiasi cosa peggiora. Domattina, a mente fredda, decidi cosa fare.",
            "quality": "weak",
            "effects": {
              "autocontrollo": 2,
              "lettura": -1,
              "strategia": -2
            },
            "outcome": "Alle 7 trovi ventidue messaggi. Qualcuno propone di \"smettere di mandare clienti allo showroom\".",
            "why": "Non reagire a caldo è sano, ma in un gruppo il silenzio totale viene letto come colpa. Bastava una riga."
          }
        ]
      },
      {
        "text": "Il mattino dopo, al telefono, Gianni è duro: \"Lo screenshot me l'hanno girato, chi non conta. Il punto è che da sei mesi dallo showroom non mi arriva un lavoro. Adesso ho capito perché.\"",
        "escalation": "Durante la notte il gruppo si è scaldato, e Gianni ti risponde gelido, convinto di aver smascherato qualcosa.",
        "prompt": "Come rispondi a Gianni?",
        "options": [
          {
            "text": "\"Dimmi chi te l'ha girato. Se non me lo dici, vuol dire che sei d'accordo con lui.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "empatia": -2,
              "lettura": -1,
              "strategia": -2
            },
            "outcome": "Gianni si chiude: \"Ecco, adesso il problema sono io.\" La telefonata finisce lì, e lui scrive nel gruppo che l'hai aggredito.",
            "why": "Pretendere la fonte con un ultimatum ti fa sembrare colpevole e spaventato. La fonte arriva, se arriva, quando l'altro si fida."
          },
          {
            "text": "\"Hai ragione, scusami. Era una frase infelice, non dovevo scriverla.\"",
            "quality": "weak",
            "effects": {
              "empatia": 2,
              "assertivita": -2,
              "lettura": -1
            },
            "outcome": "Gianni si ammorbidisce, ma nel gruppo scrive: \"Almeno l'ha ammesso.\" La frase tagliata è diventata la tua confessione.",
            "why": "Scusarsi è nobile quando hai sbagliato. Scusarti per un senso che non hai mai dato conferma la versione falsa."
          },
          {
            "text": "\"Ti leggo la frase intera, poi giudichi tu. E se sei d'accordo, scrivilo tu nel gruppo che era tagliata.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "strategia": 1,
              "lettura": 1
            },
            "outcome": "Gianni ascolta e borbotta: \"Ok, detta così è diversa.\" Ma nel gruppo non vuole esporsi: \"Scrivilo tu.\"",
            "why": "Il contesto completo funziona. Chiedergli di correggersi in pubblico, però, gli costa la faccia: è una richiesta troppo grande, adesso."
          },
          {
            "text": "\"Sui lavori calati hai ragione a chiedermelo, e voglio capirlo anch'io. Prima però ti leggo la frase intera.\"",
            "quality": "best",
            "effects": {
              "empatia": 2,
              "lettura": 2,
              "strategia": 1,
              "autocontrollo": 1
            },
            "outcome": "Gianni tace, poi: \"Va bene, leggi.\" Dopo, più calmo, si lascia scappare: \"Me l'ha girato uno che passa nei cantieri a proporre un altro marchio.\"",
            "why": "Separi il torto vero da quello falso: il calo dei lavori è un problema reale, la frase no. Chi si sente preso sul serio abbassa la guardia e ti dà informazioni."
          }
        ]
      },
      {
        "text": "Nel gruppo aspettano il tuo messaggio: il post di Gianni l'hanno già letto in trenta. Dalla descrizione, chi gli ha girato lo screenshot è quasi certamente Ivano Bassi, agente di un distributore concorrente che da mesi visita i tuoi posatori.",
        "escalation": "Gianni ha chiuso male la telefonata e nel gruppo il tono è ormai \"noi contro lo showroom\".",
        "prompt": "Che messaggio scrivi nel gruppo?",
        "options": [
          {
            "text": "\"Sappiate che lo screenshot lo fa girare Ivano Bassi, agente di un concorrente, per portarvi sul suo marchio. Non fatevi usare così.\"",
            "quality": "bad",
            "effects": {
              "lettura": 1,
              "strategia": -2,
              "etica": -2,
              "autocontrollo": -1
            },
            "outcome": "Ivano scrive in privato a mezzo gruppo: \"Vedete? Ha paura della concorrenza.\" Un posatore ti chiede: \"Hai le prove?\" Non ce le hai.",
            "why": "Accusare un nome senza prove ti fa passare da vittima ad aggressore, e regala all'altro esattamente la visibilità che cercava."
          },
          {
            "text": "\"La frase intera diceva un'altra cosa, e la penso ancora: costate perché siete bravi. Mi spiace per il malinteso.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 1,
              "assertivita": 1,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "Qualche pollice in su, un \"ok\". Il caso si sgonfia, ma la domanda vera, perché arrivano meno lavori, resta senza risposta.",
            "why": "Correggere il senso spegne l'incendio di oggi, non il malcontento sotto, che Ivano continuerà a usare."
          },
          {
            "text": "\"Ecco la frase intera: 'sono cari perché sono bravi'. Lo penso ancora. Giovedì alle 18 vi aspetto in showroom con i numeri.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "assertivita": 2,
              "empatia": 1,
              "etica": 1
            },
            "outcome": "Gianni scrive per primo: \"Giovedì ci sono.\" Ne vengono quindici: i numeri finiscono sul tavolo, le domande pure, e la serata si chiude in pizzeria.",
            "why": "Contesto completo con parole tue, nessun nome di terzi e un invito con numeri veri: rispondi alla frase e al malcontento che la rendeva credibile."
          },
          {
            "text": "Chiedi all'amministratore del gruppo di togliere lo screenshot e scrivi solo: \"Era fuori contesto, chi vuole mi chiami.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "strategia": 1,
              "assertivita": -1,
              "lettura": -1
            },
            "outcome": "Lo screenshot sparisce, ma qualcuno l'aveva già salvato: \"Lo fanno cancellare, chissà perché.\" Ti chiamano in due.",
            "why": "Far sparire una prova sembra censura, e in un gruppo la censura conferma il sospetto. Meglio aggiungere contesto che toglierlo."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi il messaggio che pubblichi nel gruppo.",
      "model": "Buongiorno a tutti, la frase intera era: \"I posatori della zona sono cari, è vero, ma sono cari perché sono bravi.\" Lo penso ancora, e giovedì alle 18 vi aspetto in showroom con i numeri dei lavori che vi abbiamo girato quest'anno.",
      "keys": [
        {
          "label": "Il contesto completo",
          "terms": [
            "intera",
            "complet",
            "contesto",
            "tagliat",
            "il resto",
            "diceva",
            "originale",
            "messaggio"
          ]
        },
        {
          "label": "La tua posizione sui posatori",
          "terms": [
            "bravi",
            "lo penso",
            "stima",
            "rispetto",
            "qualità",
            "valore",
            "fiducia",
            "professional"
          ]
        },
        {
          "label": "Un confronto concreto",
          "terms": [
            "giovedì",
            "vi aspetto",
            "incontr",
            "numeri",
            "showroom",
            "chiamatemi",
            "parliamone",
            "dati"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Ivano non aveva solo girato uno screenshot: da mesi raccontava ai posatori che lo showroom stava passando a squadre più economiche, e la frase tagliata, avuta dal geometra che lavora con entrambi, era la \"prova\" che gli mancava. Gianni era il veicolo perfetto perché arrabbiato davvero: i suoi lavori erano calati del 30%, ma per i cantieri fermi in tutta la provincia, non per colpa tua. Una frase tagliata funziona solo se si appoggia a un malcontento vero.",
      "principle": "Contro una frase tagliata servono il contesto completo e la tua presenza, non un contrattacco.",
      "tip": "Separa il torto vero da quello falso: \"Sul calo dei lavori hai ragione a chiedere, guardiamo i numeri insieme. La frase, invece, te la leggo intera.\""
    }
  },
  {
    "id": "reputazione-socio-parla-male-cliente",
    "category": "reputazione",
    "difficulty": 4,
    "title": "Il socio parla male di te a una cliente",
    "setting": "Elena Martini, architetta, è la tua cliente più importante: sei cantieri l'anno, circa 180 mila euro di fatturato. Ti chiama un martedì sera, due giorni dopo il tuo rientro da tre settimane a Giacarta. La settimana scorsa il tuo socio Stefano Corradi, con cui dividi la società al 50%, l'ha portata a cena.",
    "cast": [
      {
        "name": "Elena Martini",
        "role": "architetta, cliente principale",
        "note": "cordiale, diretta, ti dà del tu da anni"
      },
      {
        "name": "Stefano Corradi",
        "role": "socio al 50%",
        "note": "concreto, sempre in ufficio, avaro di complimenti"
      }
    ],
    "objective": "Difendere la tua reputazione e chiarire con il socio, senza perdere né la cliente né la società.",
    "rounds": [
      {
        "text": "Elena abbassa la voce: \"Ti devo dire una cosa, ma resta tra noi. A cena Stefano mi ha detto che sei poco presente, e che per i cantieri grossi è meglio passare direttamente da lui. Non voglio mettermi in mezzo, eh. Non dirgli che te l'ho detto.\"",
        "prompt": "Come rispondi a Elena?",
        "options": [
          {
            "text": "\"Ma figurati, Stefano è fatto così, ogni tanto parla senza pensarci. Tra noi non c'è nessun problema.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 2,
              "lettura": -1,
              "strategia": -1,
              "etica": -1
            },
            "outcome": "Elena sembra delusa: \"Ah, ok.\" Hai salvato la facciata, ma non sai perché Stefano l'abbia detto, né che cosa pensi lei.",
            "why": "Minimizzare protegge l'immagine per una sera e ti lascia cieco. La cliente ti ha dato un segnale: liquidarlo significa sprecarlo."
          },
          {
            "text": "\"Grazie, Elena. Detto tra noi, Stefano ultimamente è molto sotto stress, non è lucido. Da ora i tuoi cantieri li seguo io, personalmente.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "etica": -2,
              "strategia": -2,
              "empatia": -1
            },
            "outcome": "Elena prende nota. Ora sa che i due soci si contendono il suo lavoro, e ha in mano una confidenza contro ciascuno dei due.",
            "why": "Rispondere a un pettegolezzo con un pettegolezzo ti mette sullo stesso piano di Stefano. E una società divisa davanti al cliente è debole."
          },
          {
            "text": "\"Grazie, apprezzo che tu me l'abbia detto. Non preoccuparti: non ti coinvolgo, ci penso io.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "empatia": 1,
              "strategia": 1,
              "assertivita": -1
            },
            "outcome": "Elena si rilassa: \"Sapevo di poter contare su di te.\" Ma hai promesso un segreto che ti lega le mani con Stefano.",
            "why": "Tono giusto, ma la promessa di silenzio totale è una trappola: non potrai chiarire con il socio senza tradire la parola data."
          },
          {
            "text": "\"Grazie. Non farò il tuo nome, ma con Stefano ne parlerò. Prima dimmi: nei tuoi cantieri qualcosa non ha funzionato?\"",
            "quality": "best",
            "effects": {
              "lettura": 2,
              "strategia": 2,
              "assertivita": 1,
              "etica": 1
            },
            "outcome": "Elena esita, poi: \"Beh, a marzo due consegne in ritardo, e tu non rispondevi.\" Ecco da dove nasce la frase di Stefano.",
            "why": "Non prometti un silenzio che non puoi mantenere e sposti il discorso dal pettegolezzo al servizio: è lì che si gioca la tua reputazione con un cliente."
          }
        ]
      },
      {
        "text": "Il giorno dopo, in ufficio, a porta chiusa. Stefano non nega: \"Sì, l'ho detto. Tu passi sei mesi l'anno a Giacarta, e quando le consegne saltano i clienti chiamano me. A marzo con Elena ci ho messo la faccia io.\"",
        "escalation": "Stefano ha già saputo della tua telefonata con Elena e ti aspetta in ufficio sulla difensiva.",
        "prompt": "Cosa gli dici?",
        "options": [
          {
            "text": "\"Hai ragione, quando sono via manco, e non è giusto che tu resti scoperto. Facciamo un piano: chi segue cosa quando sono a Giacarta.\"",
            "quality": "good",
            "effects": {
              "empatia": 2,
              "strategia": 2,
              "assertivita": -1
            },
            "outcome": "Stefano si distende: \"Finalmente.\" Il piano è utile, ma la frase detta a Elena resta lì, come se fosse normale.",
            "why": "Riconoscere il punto valido e risolverlo è maturo. Senza un confine, però, la prossima volta ti screditerà di nuovo con un cliente."
          },
          {
            "text": "\"Sull'assenza hai un punto. Ma ai clienti non si parla male di un socio: se hai un problema con me, lo dici a me.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "empatia": 2,
              "autocontrollo": 1,
              "strategia": 1
            },
            "outcome": "Stefano tace qualche secondo, poi: \"Ok. Ho sbagliato a dirlo a lei.\" Passate un'ora a decidere come coprire i clienti quando sei via.",
            "why": "Separi la critica legittima dal modo sbagliato di esprimerla: accetti la prima, fermi il secondo. È il confine che protegge entrambi."
          },
          {
            "text": "\"Perfetto. Allora da oggi dividiamo i clienti per iscritto, ognuno i suoi, e a fine anno vediamo quanto rendono i tuoi.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "autocontrollo": -2,
              "strategia": -2,
              "empatia": -1
            },
            "outcome": "Stefano sbatte la cartellina sul tavolo: \"Benissimo.\" Da quel giorno in ufficio vi parlate per email, e i clienti se ne accorgono.",
            "why": "La ritorsione trasforma un errore in una guerra. Due soci in guerra perdono clienti più in fretta di un socio assente."
          },
          {
            "text": "\"Non mi interessa chi ha chiamato chi, né cosa è successo a marzo. Mi hai deluso, Stefano. Da te non me l'aspettavo.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 1,
              "autocontrollo": 1,
              "empatia": -1,
              "lettura": -1
            },
            "outcome": "Stefano si irrigidisce: \"E io non mi aspettavo di gestire tutto da solo.\" La conversazione gira sulle colpe e non arriva a nulla.",
            "why": "La delusione è legittima, ma non è una richiesta: lascia all'altro solo la scelta tra difendersi e contrattaccare."
          }
        ]
      },
      {
        "text": "Una settimana dopo Elena ti richiama: \"Ho il cantiere di Villa Lario, 90 mila euro di materiale. Visto il momento delicato tra voi due, mi servirebbe una garanzia: un 8% in più di sconto, e che le consegne le segua Stefano.\"",
        "escalation": "Elena ha percepito la tensione tra voi soci e alza la posta: prima di parlare di sconto accenna a \"valutare altri fornitori\".",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Elena, te lo dico con franchezza: mi sembra che tu stia approfittando di un momento delicato tra me e Stefano.\"",
            "quality": "bad",
            "effects": {
              "lettura": 2,
              "assertivita": 1,
              "empatia": -3,
              "strategia": -3
            },
            "outcome": "Silenzio gelido. \"Pensavo di avere a che fare con dei professionisti.\" Villa Lario va in gara tra tre fornitori.",
            "why": "Hai letto bene la mossa, ma dirlo in faccia a una cliente la umilia. Una leva si smonta togliendole valore, non accusando chi la usa."
          },
          {
            "text": "\"L'8% è tanto, non posso arrivarci. Facciamo il 4%, e le consegne le seguiamo tutti e due, così stai tranquilla.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "assertivita": 1,
              "strategia": -2,
              "lettura": -1
            },
            "outcome": "Elena accetta il 4% al volo. Hai pagato 3.600 euro per una tensione che con il prezzo non c'entrava niente.",
            "why": "Dividere a metà sembra ragionevole, ma accetti l'idea che la lite tra soci si paghi in sconto. Elena ha imparato che funziona."
          },
          {
            "text": "\"Lo sconto no: a marzo il problema non era il prezzo. Per Villa Lario, un referente unico e un aggiornamento ogni venerdì.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "lettura": 2,
              "assertivita": 2
            },
            "outcome": "Elena ci pensa: \"Un aggiornamento ogni venerdì... va bene, proviamo.\" Il cantiere parte a prezzi pieni.",
            "why": "La richiesta usava una preoccupazione vera per ottenere margine. Rispondi alla preoccupazione con un servizio e lasci cadere la leva sul prezzo."
          },
          {
            "text": "\"Ne parlo con Stefano, ed entro venerdì ti rispondiamo insieme, con una sola proposta per Villa Lario.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "autocontrollo": 1,
              "assertivita": 1
            },
            "outcome": "Elena è colpita: \"Insieme? Bene.\" Il fronte unito toglie forza alla richiesta, anche se lo sconto resta sul tavolo.",
            "why": "Mostrare che i soci rispondono uniti smonta metà della leva. Rimandare, però, lascia aperta la trattativa sullo sconto."
          }
        ]
      }
    ],
    "phrase": {
      "round": 1,
      "prompt": "Scrivi cosa dici a Stefano, a porta chiusa.",
      "model": "Stefano, sulla mia assenza hai ragione e voglio un piano per quando sono a Giacarta. Ma ai clienti non si parla male di un socio: se hai un problema con me, lo dici a me.",
      "keys": [
        {
          "label": "Riconosci il punto valido",
          "terms": [
            "hai ragione",
            "hai un punto",
            "è vero",
            "assenza",
            "manco",
            "giacarta",
            "capisco",
            "riconosco"
          ]
        },
        {
          "label": "Confine chiaro",
          "terms": [
            "lo dici a me",
            "non si parla",
            "ai clienti",
            "non accetto",
            "mai più",
            "non deve",
            "alle spalle",
            "con me"
          ]
        },
        {
          "label": "Soluzione concreta",
          "terms": [
            "piano",
            "organizz",
            "referente",
            "chi segue",
            "quando sono via",
            "regola",
            "accord",
            "proposta"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Stefano non voleva rubarti la cliente: a marzo, mentre eri a Giacarta, Elena lo aveva chiamato furiosa per due consegne in ritardo, e lui, per salvare la commessa, si era messo al centro con la frase sbagliata. Elena invece sapeva benissimo cosa faceva: raccontarti la confidenza era il primo passo per chiedere lo sconto. Per un cliente, due soci in tensione sono un fornitore da cui spremere margine.",
      "principle": "Tra soci ci si dice tutto in faccia; davanti al cliente si è uniti, e la pace non si paga in sconto.",
      "tip": "Quando ti riferiscono una frase su di te, sposta il discorso sui fatti: \"Grazie. Dimmi tu: nel tuo cantiere cosa non ha funzionato?\" E chiediti che cosa ti verrà chiesto subito dopo."
    }
  },
  {
    "id": "manipolazione-lotto-stock-urgenza",
    "category": "manipolazione",
    "difficulty": 3,
    "title": "Il lotto a prezzo stracciato, solo fino alle 18",
    "setting": "Martedì, ore 15:20. Fabio Rinaldi, agente di zona di una ceramica emiliana con cui lavori da anni, ti offre un lotto di 2.400 metri quadri di gres 120x120 effetto marmo a 14 euro al metro, contro i 22 di listino: circa 33.600 euro in tutto. Il magazzino è pieno per metà, ma quel formato lo vendi bene.",
    "cast": [
      {
        "name": "Fabio Rinaldi",
        "role": "agente di zona di una ceramica",
        "note": "simpatico, informato su tutto il mercato, ti chiama sempre \"capo\""
      }
    ],
    "objective": "Valutare l'affare per quello che vale, senza farti trascinare dalla fretta.",
    "rounds": [
      {
        "text": "Fabio al telefono: \"Capo, ho chiamato prima te perché sei tu. Prima scelta, effetto Calacatta, tutto su bancali. Però c'è un distributore di Brescia che lo vuole: entro le 18 mi devi dire sì o no.\"",
        "prompt": "Cosa rispondi?",
        "options": [
          {
            "text": "\"Fabio, la storia del cliente di Brescia che lo vuole subito me l'hai già raccontata altre volte. Dai, con me non serve.\"",
            "quality": "weak",
            "effects": {
              "lettura": 2,
              "assertivita": 1,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Fabio ride, un po' offeso: \"Come vuoi, poi non dire che non ti ho avvisato.\" Il sospetto forse è giusto, ma del lotto non sai ancora niente.",
            "why": "Smascherare la tecnica a voce ti fa sentire furbo, ma non ti dice se l'affare è buono. E mette l'altro sulla difensiva."
          },
          {
            "text": "\"A 14 euro? Lo prendo. Mandami la conferma d'ordine, poi con calma ci sentiamo per i dettagli della consegna.\"",
            "quality": "bad",
            "effects": {
              "strategia": -2,
              "lettura": -2,
              "autocontrollo": -1,
              "assertivita": 1
            },
            "outcome": "Fabio è velocissimo: la conferma arriva in cinque minuti, con il tuo nome già sopra. Del lotto hai visto solo il prezzo.",
            "why": "La scadenza ravvicinata serve esattamente a questo: farti decidere sul prezzo prima di guardare la merce."
          },
          {
            "text": "\"Mandami subito scheda, foto e numero di partita. Se torna tutto ti rispondo entro le 18; se no, dallo pure a Brescia.\"",
            "quality": "best",
            "effects": {
              "strategia": 2,
              "autocontrollo": 2,
              "lettura": 1,
              "assertivita": 1
            },
            "outcome": "Fabio esita mezzo secondo: \"Certo, ti mando tutto.\" Le foto arrivano, il numero di partita no: \"Quello te lo dico dopo.\"",
            "why": "Accetti la scadenza, ma alle tue condizioni, e soprattutto accetti di perdere l'affare. Chi è pronto a dire no non si manovra con la fretta."
          },
          {
            "text": "\"Interessante, ma oggi non decido. Dammi tempo fino a domattina: devo sentire il magazzino e guardare le vendite.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "strategia": 1,
              "assertivita": 1
            },
            "outcome": "Fabio sospira: \"Domattina rischi che sia andato.\" Poi, dopo una pausa: \"Vabbè, te lo tengo fino alle 10.\"",
            "why": "Prendere tempo smonta l'urgenza, e la proroga improvvisa ti dice già qualcosa. Ma senza chiedere dati non usi bene il tempo guadagnato."
          }
        ]
      },
      {
        "text": "Alle 16:30 Fabio richiama: \"Senti, per tenertelo bloccato mi basta una mail di interesse, niente di impegnativo. Così a Brescia dico che è in trattativa.\" Le foto sono belle, ma la scheda dice \"prima scelta\" senza numero di partita.",
        "escalation": "Fabio ha sentito la tua esitazione e insiste: \"Guarda che Brescia ha già chiesto i dati per il bonifico.\"",
        "prompt": "Cosa fai?",
        "options": [
          {
            "text": "Mandi la mail, ma scrivi: \"Interesse non vincolante, subordinato alla verifica dei campioni e del numero di partita.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "assertivita": 1,
              "autocontrollo": 1
            },
            "outcome": "Fabio risponde con un pollice in su. La mail ti protegge sul piano legale, ma ora lui può dire in giro che \"ci sei dentro\".",
            "why": "Ti sei tutelato per iscritto, bene. Ma ogni piccolo sì crea un impegno psicologico, ed è proprio quello che lui sta cercando."
          },
          {
            "text": "\"Ok, ma solo se scendi a 13 euro. A quel punto ci penso seriamente.\"",
            "quality": "weak",
            "effects": {
              "strategia": 1,
              "assertivita": 1,
              "lettura": -2,
              "autocontrollo": -1
            },
            "outcome": "Fabio finge di soffrire: \"Ci provo, ma è dura.\" Dieci minuti dopo: \"Fatto, 13.\" Adesso stai trattando un lotto che non hai ancora visto.",
            "why": "Trattare il prezzo sembra furbo, ma ti porta dentro l'affare prima della verifica. Il prezzo era già basso: il punto è la merce."
          },
          {
            "text": "Mandi la mail come chiede lui: \"Confermo il mio interesse per il lotto 120x120. Ci aggiorniamo domani.\" Due righe, niente di impegnativo.",
            "quality": "bad",
            "effects": {
              "strategia": -2,
              "lettura": -2,
              "autocontrollo": -1,
              "empatia": 1
            },
            "outcome": "Fabio ti ringrazia calorosamente. Dieci minuti dopo ti scrive: \"Ho detto a Brescia che è tuo.\"",
            "why": "Una richiesta piccola e innocua prepara quella grande. Da questo momento ogni no ti sembrerà una scorrettezza nei suoi confronti."
          },
          {
            "text": "\"Niente mail. Portami i campioni domattina alle 9: in mezz'ora hai una risposta definitiva.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "strategia": 2,
              "autocontrollo": 1,
              "lettura": 1
            },
            "outcome": "Fabio prova ancora: \"Ma se Brescia...\" Poi cede: \"Ok, domattina alle 9 ti porto due scatole.\"",
            "why": "Rifiuti il piccolo impegno e offri un percorso chiaro e veloce. La tua serietà non dipende da una mail, ma dalla risposta che darai sui fatti."
          }
        ]
      },
      {
        "text": "Mercoledì alle 9 Fabio porta due scatole di campioni: sulle etichette ci sono due partite diverse, e una lastra è visibilmente più scura. Lui taglia corto: \"Ho bloccato il camion per te e ho fatto una figuraccia con Brescia. Mi serve un acconto del 30%, diecimila euro, entro oggi, sennò ci rimetto io.\"",
        "escalation": "Fabio ormai parla come se l'affare fosse chiuso: \"Ieri mi avevi detto di sì, adesso non puoi tirarti indietro.\"",
        "prompt": "Prendi la decisione finale.",
        "options": [
          {
            "text": "\"Mi dispiace per Brescia, Fabio, ma il camion non è un problema mio. Ci sentiamo per il prossimo lotto.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "autocontrollo": 1,
              "empatia": -2,
              "lettura": -1
            },
            "outcome": "Fabio se ne va offeso. Hai evitato il rischio, ma senza dire il motivo vero: per lui sei solo uno che si è tirato indietro.",
            "why": "Il no è giusto, ma senza nominare il fatto verificabile, le due partite, lasci all'altro la versione \"mi ha mollato all'ultimo\"."
          },
          {
            "text": "\"Il camion non te l'ho chiesto io. E qui ci sono due partite diverse: prima dell'acconto voglio vedere il lotto intero, in magazzino.\"",
            "quality": "best",
            "effects": {
              "lettura": 2,
              "strategia": 2,
              "assertivita": 2
            },
            "outcome": "Fabio si irrigidisce, poi cambia tono: \"Il magazzino... lascia stare, vediamo più avanti.\" Il lotto intero non te lo farà mai vedere.",
            "why": "Respingi una colpa che non è tua, metti sul tavolo un fatto incontestabile e proponi una verifica. Se l'affare è vero regge; se è un bluff, crolla da solo."
          },
          {
            "text": "\"Hai ragione, ti ho fatto bloccare il camion. Ti faccio il bonifico, e le partite poi le sistemiamo in posa.\"",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "assertivita": -2,
              "strategia": -3,
              "lettura": -2
            },
            "outcome": "Il lotto arriva: metà è più scuro. Due clienti contestano la posa, e Fabio al telefono non risponde più.",
            "why": "Il senso di colpa per un favore mai chiesto ti fa pagare un rischio che avevi davanti agli occhi. Due partite mischiate, in posa, non si sistemano."
          },
          {
            "text": "\"L'acconto te lo do, ma con una clausola scritta: se il lotto non è di una sola partita, mi restituisci tutto entro dieci giorni.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "strategia": 1,
              "autocontrollo": 1,
              "lettura": -1
            },
            "outcome": "Fabio firma subito, forse troppo in fretta. Il lotto è misto: la clausola ti salva, ma per riavere i diecimila euro servono tre settimane di solleciti.",
            "why": "La clausola è una tutela vera, ma pagare prima di verificare resta un rischio: un rimborso promesso non è un rimborso incassato."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi il messaggio con cui rispondi a Fabio sull'acconto.",
      "model": "Fabio, il blocco del camion è stata una tua scelta, non una mia richiesta. Nei campioni ci sono due partite diverse: prima di qualsiasi acconto voglio vedere il lotto intero, e domani posso venire in magazzino.",
      "keys": [
        {
          "label": "Respingi colpa e fretta",
          "terms": [
            "tua scelta",
            "non ho chiesto",
            "mia richiesta",
            "non mi sono impegnat",
            "non vincol",
            "non pago",
            "nessun acconto",
            "prima di qualsiasi"
          ]
        },
        {
          "label": "Un fatto verificabile",
          "terms": [
            "partit",
            "campion",
            "lotto",
            "tonalit",
            "verific",
            "scheda",
            "etichett",
            "conform"
          ]
        },
        {
          "label": "Una proposta concreta",
          "terms": [
            "domani",
            "vengo",
            "venire",
            "magazzino",
            "appuntamento",
            "visita",
            "se vuoi",
            "vediamo insieme"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Il distributore di Brescia non esisteva: il lotto girava da tre settimane tra i rivenditori della zona, ed era un fine serie con due partite mischiate che nessuno voleva. Fabio aveva una provvigione maggiorata se svuotava il magazzino prima della chiusura del trimestre. Le tecniche erano tre, in sequenza: falsa urgenza con un concorrente fantasma, piede nella porta con la mail \"non impegnativa\", senso di colpa con il camion bloccato.",
      "principle": "Un affare vero sopravvive a una verifica di ventiquattro ore; se non la sopravvive, non era un affare.",
      "tip": "Contro la fretta, dichiara che sei disposto a perdere: \"Se entro le 18 non ho scheda e numero di partita, dallo pure a un altro.\" Chi è pronto a dire no non si può spingere."
    }
  },
  {
    "id": "manipolazione-gaslighting-massetto",
    "category": "manipolazione",
    "difficulty": 4,
    "title": "L'impresa che giura di non averlo mai detto",
    "setting": "Cantiere di una villa a Lodi, 320 metri quadri di parquet da posare. Il 12 settembre hai firmato con l'impresa di Ottavio Ferrante un'offerta a 38 euro al metro, posa inclusa, \"su massetto idoneo fornito dall'impresa, planarità entro 2 mm su 2 metri\". Oggi, al sopralluogo, il massetto ha avvallamenti fino a 8 millimetri su quasi tutto il piano. Ci sono Ottavio, il tuo tecnico Matteo e due operai.",
    "cast": [
      {
        "name": "Ottavio Ferrante",
        "role": "titolare dell'impresa edile",
        "note": "gioviale, sicuro di sé, parla forte in cantiere"
      },
      {
        "name": "Matteo Gatti",
        "role": "tuo tecnico di cantiere",
        "note": "competente, giovane, cerca di andare d'accordo con tutti"
      }
    ],
    "objective": "Far valere l'accordo firmato senza bloccare il cantiere né sacrificare il tuo tecnico.",
    "rounds": [
      {
        "text": "Ottavio indica il pavimento: \"Qui va rasato, e la rasatura è a carico vostro, come avevamo detto.\" Rispondi che l'accordo era un altro. Lui sorride, calmo: \"Non l'ho mai detto. Te lo ricordi male: quel giorno eri sempre al telefono, avevi la testa altrove.\"",
        "prompt": "Come reagisci?",
        "options": [
          {
            "text": "\"Io ricordo il contrario. Stasera ti mando l'offerta per mail e domani ne riparliamo.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "assertivita": 1,
              "strategia": 1
            },
            "outcome": "Ottavio alza le spalle: \"Manda pure.\" Hai tenuto il punto, ma gli hai lasciato una notte per preparare la prossima versione dei fatti.",
            "why": "Spostare il confronto sul documento è giusto. Rimandarlo, però, dà all'altro il tempo di cambiare terreno."
          },
          {
            "text": "\"Può darsi che ricordiamo in modo diverso. Per questo c'è l'offerta firmata: apriamola adesso, insieme.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "strategia": 2,
              "assertivita": 2
            },
            "outcome": "Ottavio esita, poi legge ad alta voce: \"...su massetto idoneo fornito dall'impresa.\" Gli operai si guardano. Lui cambia subito discorso.",
            "why": "Non litighi sulla memoria, che è il terreno di chi riscrive i fatti: porti tutti sul documento, che non si può negare. E lo fai subito, davanti ai testimoni."
          },
          {
            "text": "\"Forse ricordo male, quel giorno ero davvero distratto. Facciamo metà per uno e chiudiamola qui.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "assertivita": -2,
              "lettura": -1
            },
            "outcome": "Ottavio ti dà una pacca sulla spalla: \"Vedi che ci capiamo?\" Hai appena accettato di pagare 1.500 euro per un dubbio che ti ha messo in testa lui.",
            "why": "Il dubbio su te stesso è esattamente l'effetto cercato. Il compromesso a metà sembra saggio, ma premia chi ha riscritto la storia."
          },
          {
            "text": "\"Mi stai dando del bugiardo, Ottavio? L'abbiamo detto chiaro, davanti a tutti! E il telefono lascialo stare.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -3,
              "strategia": -2,
              "empatia": -1
            },
            "outcome": "Ottavio allarga le braccia verso gli operai: \"Vedete? Io parlo di lavoro e lui si scalda.\" Adesso sembri tu quello che ha qualcosa da nascondere.",
            "why": "Reagire alla frecciata personale gli dà il palcoscenico che cercava. Davanti ai testimoni, chi alza la voce sembra avere torto."
          }
        ]
      },
      {
        "text": "Ottavio cambia terreno: \"Sì, l'offerta dice così. Ma il tuo tecnico mi ha detto che la rasatura la facevate voi. Chiedi a lui.\" Matteo, a due metri, diventa rosso e guarda il pavimento. Gli operai smettono di lavorare per ascoltare.",
        "escalation": "Ottavio ha capito che sei in difficoltà e alza la voce perché lo sentano tutti: \"Anche il tuo tecnico è d'accordo con me!\"",
        "prompt": "Ottavio ha messo in mezzo Matteo. Cosa fai?",
        "options": [
          {
            "text": "Ti giri verso Matteo, davanti a tutti: \"Matteo, gli hai detto una cosa del genere? Rispondi, per favore.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "lettura": -1,
              "empatia": -2,
              "strategia": -2
            },
            "outcome": "Matteo balbetta: \"Avevo detto che se c'era un pezzo da sistemare ci mettevamo d'accordo...\" Ottavio trionfa: \"Ecco!\"",
            "why": "Accetti di processare il tuo collaboratore in pubblico, sul terreno scelto da Ottavio. Chiunque sia messo sotto esame davanti a un cliente dice la cosa sbagliata."
          },
          {
            "text": "\"Se Matteo ha detto una cosa simile, ha sbagliato: non aveva il potere di farlo. Vale l'offerta.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "strategia": 1,
              "empatia": -2,
              "etica": -1
            },
            "outcome": "Ottavio incassa, ma Matteo ti guarda come se l'avessi appena venduto. Da domani in cantiere parlerà il meno possibile.",
            "why": "Logicamente corretto, umanamente freddo: per vincere il punto scarichi in pubblico il tuo uomo, e Ottavio ha comunque diviso la squadra."
          },
          {
            "text": "\"Con Matteo parlo io. Gli accordi sono nell'offerta, e la firma è mia.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "strategia": 2,
              "empatia": 1,
              "autocontrollo": 1
            },
            "outcome": "Ottavio apre la bocca, poi la richiude. Matteo respira. Gli operai tornano al lavoro.",
            "why": "Togli il collaboratore dal palco e riporti la discussione su chi decide e su cosa è scritto. Ottavio cercava un terzo da usare: non lo trova."
          },
          {
            "text": "\"Ottavio, anche se Matteo avesse detto qualcosa, non cambierebbe l'offerta firmata. Andiamo avanti, abbiamo un cantiere da finire.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "autocontrollo": 1,
              "strategia": 1,
              "empatia": -1
            },
            "outcome": "Ottavio borbotta ma lascia perdere. Matteo però ha sentito quel \"anche se avesse detto\" e si chiede se lo pensi davvero.",
            "why": "Il punto sul documento regge, ma l'ipotesi detta ad alta voce lascia il collaboratore scoperto e un dubbio sospeso nell'aria."
          }
        ]
      },
      {
        "text": "Fuori dal cantiere Matteo ti conferma che aveva detto solo: \"Se c'è un pezzo da sistemare, ci mettiamo d'accordo.\" Ottavio vi raggiunge e passa alla pressione: \"Al committente dovrò dire che il ritardo è colpa vostra. E la fase due, i 1.200 metri dell'altro lotto, la sto ancora assegnando.\"",
        "escalation": "Ottavio, sentendosi in vantaggio, ha già chiamato il committente per dirgli che il cantiere è fermo per colpa vostra.",
        "prompt": "Ultima mossa. Cosa proponi?",
        "options": [
          {
            "text": "\"Va bene, la rasatura la facciamo noi. Ma allora la fase due è nostra, d'accordo?\"",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "strategia": -2,
              "assertivita": -2,
              "lettura": -1
            },
            "outcome": "Ottavio ti stringe la mano: \"Ma certo.\" Tre settimane dopo la fase due va a un'altra impresa: \"Promessa? Non mi pare di averla mai fatta.\"",
            "why": "Scambi una concessione concreta con una promessa a voce, proprio con chi ha appena dimostrato di riscrivere le promesse a voce."
          },
          {
            "text": "\"Fai come credi, Ottavio. La fase due dalla a chi vuoi: io lavoro con chi rispetta i patti.\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -1,
              "strategia": -2
            },
            "outcome": "Ottavio sorride: \"Come vuoi.\" Il cantiere resta fermo, e al committente arriva solo la sua versione.",
            "why": "L'orgoglio ti fa sentire integro, ma lasci il campo libero: il committente sentirà una sola voce, e non è la tua."
          },
          {
            "text": "\"Se vuoi dare la colpa a noi, va bene: facciamo una riunione a tre con il committente e guardiamo l'offerta insieme.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "etica": 1,
              "strategia": 1,
              "empatia": -1
            },
            "outcome": "Ottavio frena subito: \"Non c'è bisogno di scomodarlo.\" La minaccia cade, ma la rasatura resta da fare e il cantiere è fermo.",
            "why": "Andare a vedere il bluff con la trasparenza funziona: Ottavio non vuole testimoni. Ma il problema concreto del massetto resta lì."
          },
          {
            "text": "\"La rasatura la facciamo noi: 9 euro al metro, con ordine scritto prima di iniziare. E al committente lo spieghiamo insieme.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "assertivita": 2,
              "etica": 1,
              "lettura": 1
            },
            "outcome": "Ottavio fa due conti: la via d'uscita c'è, ma la paga lui. Firma l'ordine quella sera stessa, e al committente spiegate insieme tre giorni di ritardo.",
            "why": "Risolvi il problema vero, il massetto, senza accettare la versione falsa: lavoro extra, prezzo chiaro, tutto per iscritto. Con chi riscrive i fatti, la carta è l'unica lingua."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi la mail di riepilogo che mandi a Ottavio la sera stessa.",
      "model": "Ciao Ottavio, riepilogo quanto detto oggi in cantiere: come da offerta firmata il 12 settembre, il massetto idoneo è a cura dell'impresa. La rasatura possiamo farla noi a 9 euro al metro, con ordine scritto prima di iniziare: aspetto conferma entro giovedì.",
      "keys": [
        {
          "label": "Riepilogo di quanto detto",
          "terms": [
            "riepilog",
            "ricapitol",
            "quanto detto",
            "come detto",
            "oggi",
            "in cantiere",
            "concordato",
            "come d'accordo"
          ]
        },
        {
          "label": "Riferimento al documento",
          "terms": [
            "offerta",
            "firmat",
            "contratto",
            "12 settembre",
            "capitolato",
            "clausola",
            "documento",
            "come da"
          ]
        },
        {
          "label": "Proposta con condizioni scritte",
          "terms": [
            "ordine",
            "al metro",
            "prima di iniziare",
            "entro",
            "preventivo",
            "conferma",
            "per iscritto",
            "a parte"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Ottavio aveva sforato di 6 mila euro con il committente proprio sul massetto, fatto in fretta da un subappaltatore economico, e non poteva ammetterlo. Per scaricare il costo doveva riscrivere la storia: prima il gaslighting (\"non l'ho mai detto\", più la frecciata sulla tua distrazione per farti dubitare di te), poi la triangolazione con una frase innocua di Matteo, infine la minaccia sul committente e sulla fase due. Non gli serviva convincerti: gli bastava che dubitassi abbastanza da pagare metà.",
      "principle": "Con chi riscrive il passato non si discute di memoria: si torna al documento, e da quel giorno si scrive tutto.",
      "tip": "Dopo ogni accordo a voce, un riepilogo scritto entro sera: \"Ti riassumo quanto detto oggi: se qualcosa non torna, dimmelo entro domani.\""
    }
  },
  {
    "id": "manipolazione-love-bombing-giacarta",
    "category": "manipolazione",
    "difficulty": 5,
    "title": "Il socio perfetto a Giacarta",
    "setting": "Giacarta, un ristorante a Senopati: la terza cena in due settimane con Riccardo Valli, imprenditore italiano in Indonesia da quindici anni, che ti ha presentato costruttori e investitori e ti ha portato al suo circolo di golf. Ora ti propone l'affare: 18.000 metri quadri di piastrelle per un complesso residenziale a Tangerang, attraverso una nuova società al 51% sua e al 49% tua, in cui conferire l'esclusiva del marchio italiano che distribuisci. A cena c'è anche Dewi, la tua responsabile operativa.",
    "cast": [
      {
        "name": "Riccardo Valli",
        "role": "imprenditore italiano a Giacarta",
        "note": "brillante, generoso, conosce tutti e lo fa sapere"
      },
      {
        "name": "Dewi Lestari",
        "role": "tua responsabile operativa a Giacarta",
        "note": "precisa, riservata, molto rispettosa delle gerarchie"
      }
    ],
    "objective": "Capire se l'affare è vero e proteggere l'esclusiva, senza bruciare una relazione che potrebbe servirti.",
    "rounds": [
      {
        "text": "Riccardo alza il bicchiere: \"Te lo dico sinceramente: in quindici anni qui non ho mai trovato un italiano serio come te. Il costruttore vuole chiudere entro venerdì. L'esclusiva nella nuova società è una formalità: serve per presentarci come un unico fornitore.\"",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Riccardo, detto da te vale doppio. Se mi dici che è una formalità, mi fido: prepariamo i documenti per venerdì.\"",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "lettura": -2,
              "strategia": -3,
              "autocontrollo": -1
            },
            "outcome": "Riccardo ti abbraccia. Il giorno dopo arriva la bozza di statuto: 27 pagine in inglese e indonesiano, da firmare entro quattro giorni.",
            "why": "I complimenti hanno fatto il loro lavoro: ti senti speciale e abbassi la guardia. È esattamente la funzione delle cene e delle presentazioni."
          },
          {
            "text": "\"51 a te? Facciamo 50 e 50, e l'esclusiva la mettiamo dentro solo per questo progetto.\"",
            "quality": "weak",
            "effects": {
              "strategia": 1,
              "assertivita": 1,
              "lettura": -2,
              "autocontrollo": -1
            },
            "outcome": "Riccardo finge di pensarci: \"Per te, 50 e 50.\" Accetta troppo in fretta. Stai già trattando le quote di una società che non hai ancora capito.",
            "why": "Trattare sembra furbo, ma accetti la cornice di Riccardo: l'esclusiva dentro una società. Il punto non erano le percentuali."
          },
          {
            "text": "\"Ti dico subito una cosa: l'esclusiva resta fuori da qualsiasi società, non è in discussione. Il progetto però mi interessa: parliamo di fornitura.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "strategia": 1,
              "autocontrollo": 1,
              "lettura": -1
            },
            "outcome": "Il sorriso di Riccardo si incrina per un attimo, poi torna: \"Certo, certo, ne parliamo.\" Hai protetto l'esclusiva, ma hai scoperto le carte alla prima cena.",
            "why": "Il confine è giusto e chiaro. Dirlo subito, però, ti toglie la possibilità di capire che cosa voleva davvero Riccardo."
          },
          {
            "text": "\"Grazie, davvero. Ma non decido a cena. Mandami la lettera del costruttore e la bozza di statuto: le guardo con il mio avvocato.\"",
            "quality": "best",
            "effects": {
              "autocontrollo": 2,
              "strategia": 2,
              "lettura": 1,
              "empatia": 1
            },
            "outcome": "Riccardo ride: \"Sei un precisino, eh!\" Lo statuto arriva il giorno dopo. La lettera del costruttore, invece, \"la stanno ancora formalizzando\".",
            "why": "Accetti il calore senza farlo diventare un debito, e chiedi i due documenti che dicono se l'affare esiste. Quello che non arriva ti dice più di quello che arriva."
          }
        ]
      },
      {
        "text": "Il giorno dopo Riccardo ti telefona in ufficio: \"Ho sentito Bellini, il direttore export della ceramica: è entusiasta della struttura, anzi la preferisce. Non farmi fare brutta figura con lui.\" Quando riattacchi, Dewi si affaccia e dice piano: \"Pak, forse sarebbe bene studiare ancora un po' i documenti. Ho sentito che Pak Riccardo ha lavorato anche con altri italiani.\"",
        "escalation": "Riccardo ha percepito la tua freddezza e ti chiama già offeso: \"Ti ho presentato a mezza Giacarta e tu mi tratti come un estraneo?\"",
        "prompt": "Cosa fai?",
        "options": [
          {
            "text": "Richiami Riccardo: \"Bene, allora chiamo anch'io Bellini, così ci facciamo confermare la struttura per iscritto e partiamo tranquilli.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "assertivita": 1,
              "lettura": 1
            },
            "outcome": "Riccardo esita: \"Sì... ma lui è in fiera a Bologna, lascialo stare qualche giorno.\" La sua reazione vale più di una risposta.",
            "why": "Verificare apertamente l'autorità citata è un'ottima mossa: chi bluffa prende tempo. Ma il segnale di Dewi lo stai lasciando cadere."
          },
          {
            "text": "\"Dewi, grazie, ma Riccardo è un amico. Non mettiamoci a fare pettegolezzi sulle persone che ci aiutano.\"",
            "quality": "bad",
            "effects": {
              "autocontrollo": 1,
              "lettura": -3,
              "empatia": -1,
              "strategia": -2
            },
            "outcome": "Dewi abbassa lo sguardo: \"Certo, Pak. Mi scusi.\" Non ne parlerà più, e tu hai appena chiuso l'unica fonte che sapeva qualcosa.",
            "why": "In molti contesti, e spesso a Giacarta, una cosa scomoda su una persona di riguardo si dice con un \"forse\". Liquidarla come pettegolezzo vuol dire perdere l'avvertimento e la fiducia di chi te l'ha dato."
          },
          {
            "text": "Chiudi la porta e chiedi a Dewi: \"Grazie di avermelo detto. Mi interessa la tua opinione: cosa hai sentito?\"",
            "quality": "best",
            "effects": {
              "lettura": 3,
              "empatia": 2,
              "strategia": 1
            },
            "outcome": "Dewi, rassicurata, racconta: due anni fa un distributore italiano di illuminazione aveva fatto una società con Riccardo. Dopo un aumento di capitale si era ritrovato con il 12% e senza marchio.",
            "why": "Hai colto il segnale indiretto e hai creato lo spazio sicuro per parlare: porta chiusa, ringraziamento, domanda aperta. Chi rispetta la gerarchia parla davvero solo se invitato."
          },
          {
            "text": "Richiami Riccardo e vai dritto al punto: \"Ho sentito che con altri soci italiani è finita male. Com'è andata, esattamente?\"",
            "quality": "weak",
            "effects": {
              "assertivita": 2,
              "lettura": 1,
              "strategia": -2,
              "etica": -1
            },
            "outcome": "Riccardo ha la risposta pronta: \"Ah, la storia dell'illuminazione? Un incapace, ti racconto io.\" E ora sa che qualcuno ti parla di lui.",
            "why": "La franchezza è una virtù, ma qui esponi la fonte e regali all'altro il tempo di confezionare la sua versione. Prima si raccolgono i fatti, poi si fanno le domande."
          }
        ]
      },
      {
        "text": "Venerdì Riccardo arriva in ufficio con lo statuto e una lettera del costruttore, che parla di \"fornitori qualificati\" senza marchi né quantità. Bellini ti ha risposto per email: \"Abbiamo solo detto che valuteremo.\" Riccardo ti guarda serio: \"Dopo tutto quello che ho fatto per te... Se non firmi oggi il costruttore va con gli spagnoli, e io con te ho chiuso.\"",
        "escalation": "Riccardo ha già detto al costruttore che oggi firmerai e si presenta con il fatto compiuto.",
        "prompt": "Ultimo round. Cosa dici?",
        "options": [
          {
            "text": "\"Riccardo, Bellini mi ha scritto che non ha approvato niente. Mi hai mentito usando il suo nome, e questo non lo dimentico.\"",
            "quality": "weak",
            "effects": {
              "lettura": 2,
              "assertivita": 1,
              "autocontrollo": -2,
              "strategia": -2
            },
            "outcome": "Riccardo si alza: \"Hai frainteso tutto, ma va bene così.\" Esce, e la settimana dopo nella comunità italiana gira la voce che sei \"uno difficile\".",
            "why": "Hai ragione sui fatti, ma l'accusa frontale non ti dà niente in più e gli regala il ruolo della vittima offesa, nell'ambiente dove lui conta più di te."
          },
          {
            "text": "\"Oggi non firmo, e l'esclusiva resta fuori. Lunedì mando al costruttore un'offerta diretta: se l'affare l'hai portato tu, avrai una provvigione.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "assertivita": 2,
              "etica": 1,
              "autocontrollo": 1
            },
            "outcome": "Riccardo resta in silenzio, poi: \"Una provvigione? Ci penso.\" Non richiamerà più. Lunedì l'offerta parte, e il costruttore risponde in due giorni.",
            "why": "Confine netto senza accuse, e una strada pulita per guadagnare se l'affare è vero. Se Riccardo la rifiuta, ti ha detto lui stesso che cosa voleva davvero."
          },
          {
            "text": "\"Mi servono altre due settimane e il parere del mio avvocato. Se è un buon affare, lo sarà anche fra quindici giorni.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 2,
              "strategia": 1,
              "assertivita": 1
            },
            "outcome": "Riccardo sbuffa: \"Fra due settimane non c'è più.\" Per dieci giorni ti chiama ogni sera, alternando complimenti e rimproveri.",
            "why": "Prendere tempo smonta l'urgenza, ma lascia aperto il canale della pressione. Senza un no chiaro sull'esclusiva, il gioco continua."
          },
          {
            "text": "\"Va bene, firmo. Ma aggiungiamo una clausola: se esco dalla società, l'esclusiva torna a me.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "lettura": -2,
              "strategia": -2,
              "autocontrollo": -1
            },
            "outcome": "Riccardo accetta subito la clausola. Sei mesi dopo un aumento di capitale ti porta al 12%: non sei uscito, sei solo diventato irrilevante.",
            "why": "La clausola sembra una protezione furba, ma firmi sotto pressione e dentro la cornice dell'altro. Le trappole societarie non si chiudono con una riga scritta di fretta."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi il messaggio con cui chiudi la trattativa con Riccardo.",
      "model": "Riccardo, ti ringrazio per le presentazioni e per il tempo che mi hai dedicato. Oggi non firmo, e l'esclusiva resta fuori da qualsiasi società. Lunedì mando al costruttore un'offerta di fornitura diretta: se l'affare l'hai portato tu, avrai una provvigione.",
      "keys": [
        {
          "label": "Gratitudine senza debito",
          "terms": [
            "ringrazi",
            "grazie",
            "apprezz",
            "presentazion",
            "tempo",
            "stima",
            "riconosc",
            "gentilezza"
          ]
        },
        {
          "label": "Confine non negoziabile",
          "terms": [
            "non firmo",
            "esclusiva",
            "resta fuori",
            "non entra",
            "non cedo",
            "non è in discussione",
            "nessuna società",
            "fuori da"
          ]
        },
        {
          "label": "Alternativa pulita",
          "terms": [
            "offerta",
            "fornitura",
            "provvigion",
            "lunedì",
            "diretta",
            "propongo",
            "alternativa",
            "commission"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Il costruttore non aveva mai chiesto una nuova società: cercava solo fornitori affidabili, e gli spagnoli non esistevano. Riccardo raccoglieva esclusive di marchi italiani dentro società che controllava, per poi diluire il socio con un aumento di capitale, come era successo al distributore di illuminazione di cui Dewi aveva sentito parlare. La sequenza era da manuale: love bombing (le cene, \"l'unico italiano serio\"), pressione dell'autorità (il nome di Bellini), falsa urgenza (venerdì) e senso di colpa (\"dopo tutto quello che ho fatto per te\").",
      "principle": "Più un affare ti fa sentire speciale e di fretta, più lentamente va letto.",
      "tip": "Quando complimenti e scadenze arrivano insieme, separali: \"Ti ringrazio per la stima. Sulla decisione mi prendo il tempo che serve.\" E ascolta i \"forse\" delle persone di cui ti fidi."
    }
  },
  {
    "id": "crisi-allegato-sbagliato",
    "category": "crisi",
    "difficulty": 2,
    "title": "Il file con i margini mandato alla cliente",
    "setting": "Venerdì alle 18:40 mandi all'architetta Serena Galli il preventivo per le piastrelle di un hotel a Brescia: 2.300 metri quadri, circa 96.000 euro. Alle 19:05 ti accorgi di aver allegato il file interno, con prezzi d'acquisto, margini e una colonna di note. Accanto al suo nome c'è scritto: \"Tratta sempre, partire alto +8%\". Il programma di posta segnala che l'email è stata aperta alle 18:52.",
    "cast": [
      {
        "name": "Serena Galli",
        "role": "architetta, cliente da quattro anni",
        "note": "competente, diretta, porta allo showroom molti progetti"
      }
    ],
    "objective": "Rimediare al tuo errore salvando la fiducia di Serena e il progetto dell'hotel.",
    "rounds": [
      {
        "text": "Sono le 19:05 di venerdì e l'ufficio è vuoto. Rileggi la nota tre volte: l'hai scritta tu, l'anno scorso, dopo una trattativa estenuante. Il telefono è sulla scrivania.",
        "prompt": "Cosa fai adesso?",
        "options": [
          {
            "text": "Stasera non fai niente: sei agitato e rischi di peggiorare le cose. Lunedì mattina, a mente fredda e con le idee chiare, la chiami e chiarisci.",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "strategia": -1,
              "empatia": -1
            },
            "outcome": "Passi un fine settimana pessimo. Serena anche: ha riletto il file più volte, e lunedì la segretaria ti dice che è \"in riunione tutto il giorno\".",
            "why": "Non decidere a caldo è spesso saggio, ma qui l'altra persona ha già letto: il silenzio non è prudenza, è lasciarle scrivere la storia da sola."
          },
          {
            "text": "Le mandi il file giusto: \"Scusa, il precedente era una bozza di un collega, ignoralo pure. In allegato il preventivo corretto.\"",
            "quality": "bad",
            "effects": {
              "etica": -3,
              "strategia": -1,
              "lettura": -1,
              "autocontrollo": 1
            },
            "outcome": "Serena risponde dopo dieci minuti, una riga sola: \"Nelle proprietà del file l'autore sei tu.\" Adesso l'errore è diventato una bugia.",
            "why": "Scaricare la colpa su un collega sembra un'uscita elegante, ma le bugie si scoprono e trasformano un incidente in una questione di onestà."
          },
          {
            "text": "Le scrivi subito: \"Ti ho mandato per errore un file interno, scusami. In allegato il preventivo corretto. Lunedì ti chiamo per parlarne.\"",
            "quality": "good",
            "effects": {
              "etica": 2,
              "autocontrollo": 1,
              "strategia": 1,
              "empatia": -1
            },
            "outcome": "Serena non risponde. Il messaggio è corretto, ma lei passa il fine settimana con quella nota in testa e tre giorni per immaginare il peggio.",
            "why": "Ammettere subito è giusto. Ma per un errore che tocca la persona, un'email la lascia sola con la sua rabbia fino a lunedì."
          },
          {
            "text": "La chiami subito. Se non risponde, un vocale: \"Ho fatto un errore con l'allegato e voglio spiegartelo a voce. Ti richiamo alle 20.\"",
            "quality": "best",
            "effects": {
              "etica": 2,
              "assertivita": 2,
              "autocontrollo": 1,
              "strategia": 1
            },
            "outcome": "Serena non risponde, ma ascolta subito il vocale. Alle 19:55 squilla il tuo telefono: è lei, prima ancora che tu la richiami.",
            "why": "Per un errore che riguarda la persona, la voce vale più di dieci email: dimostra che non ti nascondi e le dà un appuntamento invece del vuoto."
          }
        ]
      },
      {
        "text": "Quando finalmente siete al telefono, la voce di Serena è gelida: \"Ho letto tutto, anche la nota. 'Tratta sempre, partire alto.' Quindi in quattro anni mi avete sempre gonfiato i prezzi?\" Tu sai che, dopo le sue trattative, ha sempre chiuso in linea con gli altri studi. Ma detta così, la nota suona malissimo.",
        "escalation": "Serena ha avuto ore per rileggere il file da sola, e si sente.",
        "prompt": "Come rispondi?",
        "options": [
          {
            "text": "\"Serena, partire un po' più alti è normale nel commercio, lo fanno tutti, lo sai meglio di me. Anche tu con i tuoi clienti ti tieni un margine.\"",
            "quality": "bad",
            "effects": {
              "empatia": -3,
              "lettura": -1,
              "strategia": -1
            },
            "outcome": "Silenzio. Poi: \"Grazie della lezione.\" Serena chiude la chiamata e per tutto il fine settimana non risponde più ai messaggi.",
            "why": "Può anche essere vero, ma giustificarsi con \"lo fanno tutti\" manca il punto: lei non contesta il commercio, contesta il modo in cui la descrivevi."
          },
          {
            "text": "\"La nota l'ho scritta io ed era irrispettosa, scusami. Sui prezzi non ti chiedo di credermi: lunedì ti porto i tuoi prezzi finali accanto alla media degli altri studi.\"",
            "quality": "best",
            "effects": {
              "etica": 2,
              "assertivita": 2,
              "empatia": 1,
              "strategia": 1
            },
            "outcome": "Una lunga pausa. Poi Serena, più piano: \"Va bene. Lunedì alle 10, nel mio studio.\" Non è un perdono, ma è una porta aperta.",
            "why": "Separi le due cose: ti scusi per ciò che è davvero sbagliato, la nota, e sul sospetto di essere stata imbrogliata offri prove invece di parole."
          },
          {
            "text": "\"Hai ragione, mi vergogno. Per rimediare ti tolgo l'8% da tutto il preventivo dell'hotel, subito.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "etica": 1,
              "strategia": -2,
              "assertivita": -1
            },
            "outcome": "Serena tace un momento: \"Quindi era vero.\" Accetta lo sconto, freddamente. Hai perso quasi 8.000 euro e confermato il suo sospetto peggiore.",
            "why": "Lo sconto riparatore sembra generoso, ma suona come un'ammissione: se togli l'8% subito, vuol dire che c'era davvero."
          },
          {
            "text": "\"Hai tutto il diritto di essere arrabbiata. È stata una mancanza di rispetto e non ho scuse. Capisco se adesso ti serve tempo.\"",
            "quality": "good",
            "effects": {
              "empatia": 2,
              "etica": 1,
              "autocontrollo": 1,
              "strategia": -1
            },
            "outcome": "Serena risponde secca: \"Sì, mi serve tempo.\" La chiamata finisce con calma, ma la sua domanda sui prezzi è rimasta senza risposta.",
            "why": "Le scuse sono sincere e pulite, ma la sua domanda era precisa: lasciarla cadere fa crescere il dubbio."
          }
        ]
      },
      {
        "text": "Lunedì alle 10, nel suo studio, Serena scorre i dati dei suoi ordini: dopo le trattative ha sempre pagato in linea con la media degli altri studi. Poi incrocia le braccia: \"Va bene. Ma per l'hotel basta teatro: voglio il tuo prezzo vero, adesso, e non ci torniamo più sopra.\" Il listino partiva da 44 euro al metro; il tuo minimo sostenibile è 39.",
        "escalation": "Serena ti ha concesso l'incontro controvoglia e ti dice subito che ha già chiesto un preventivo a un altro distributore.",
        "prompt": "Che prezzo le dai?",
        "options": [
          {
            "text": "\"41 euro al metro. Per 2.300 metri è un prezzo molto buono, e lo sai.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "strategia": 1,
              "autocontrollo": 1,
              "lettura": -1
            },
            "outcome": "Serena alza un sopracciglio: \"È il tuo prezzo vero o il primo?\" Alla fine accetta, ma ti chiede di vedere anche le offerte degli altri fornitori sull'arredo bagno.",
            "why": "Un prezzo onesto e fermo, ma con ancora un po' di margine: dopo quella nota, lei continuerà a chiedersi se c'era altro spazio."
          },
          {
            "text": "\"36 euro. Ci perdo, ma voglio dimostrarti che con te non ho mai giocato sporco.\"",
            "quality": "bad",
            "effects": {
              "strategia": -3,
              "assertivita": -2,
              "empatia": 1
            },
            "outcome": "Serena accetta senza commentare. Tre mesi dopo, quando chiedi 42 per un altro progetto, ti ricorda che \"per l'hotel facevi 36\".",
            "why": "Svendere per farsi perdonare crea un prezzo di riferimento falso e trasforma il senso di colpa in un debito che pagherai a ogni trattativa."
          },
          {
            "text": "\"Ti mando l'offerta definitiva per iscritto entro domani mattina, così la valuti con calma e la confronti con chi vuoi.\"",
            "quality": "weak",
            "effects": {
              "autocontrollo": 1,
              "strategia": 1,
              "assertivita": -1,
              "lettura": -1
            },
            "outcome": "Serena annuisce, delusa: \"Come vuoi.\" Ti aveva chiesto un gesto di franchezza e tu hai risposto con una procedura.",
            "why": "Prendere tempo è prudente nelle trattative normali, ma qui il punto era la trasparenza: rimandare sembra un'altra tattica."
          },
          {
            "text": "\"39,50. È il mio prezzo vero, lo stesso per tutto l'hotel, e te lo metto per iscritto. Sotto non vado.\"",
            "quality": "best",
            "effects": {
              "assertivita": 2,
              "etica": 2,
              "strategia": 1,
              "lettura": 1
            },
            "outcome": "Serena ti fissa per qualche secondo, poi tende la mano: \"Affare fatto.\" Il capitolato dell'hotel arriva il giorno dopo, con due parole: \"Così si lavora.\"",
            "why": "Ti ha chiesto franchezza e l'hai data: un prezzo sostenibile, scritto, e un limite chiaro. È la strada più rapida per ricostruire la fiducia."
          }
        ]
      }
    ],
    "phrase": {
      "round": 0,
      "prompt": "Scrivi il vocale che lasci a Serena (o le prime parole se risponde).",
      "model": "Serena, ti ho mandato per errore un file interno con delle note che non avresti mai dovuto leggere, e la responsabilità è solo mia. Non voglio nascondermi dietro un'email: ti richiamo alle 20 per spiegarti tutto a voce.",
      "keys": [
        {
          "label": "Ammettere l'errore in prima persona",
          "terms": [
            "errore",
            "responsabilità",
            "colpa mia",
            "ho sbagliato",
            "scusa",
            "scusami",
            "mi dispiace"
          ]
        },
        {
          "label": "Dire cosa è successo, senza minimizzare",
          "terms": [
            "file interno",
            "allegat",
            "note",
            "per errore",
            "non avresti",
            "margini",
            "prezzi"
          ]
        },
        {
          "label": "Proporre un contatto diretto",
          "terms": [
            "a voce",
            "richiamo",
            "ti chiamo",
            "telefon",
            "stasera",
            "incontr",
            "alle 20"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "La domanda sui prezzi era soprattutto una prova: Serena sa benissimo come funzionano i listini. A ferirla era stato leggere il suo nome accanto a \"tratta sempre\", come se fosse un'avversaria da gestire. E quella sera il suo socio, che aveva visto il file, le aveva già detto di passare a un altro distributore: lei aveva deciso di aspettare la tua mossa prima di scegliere.",
      "principle": "Un errore confessato subito costa una brutta serata; un errore scoperto dall'altro costa la fiducia.",
      "tip": "Quando sbagli con qualcuno, chiama prima di scrivere e apri con il fatto: \"Ho fatto un errore e voglio dirtelo io, a voce.\""
    }
  },
  {
    "id": "crisi-secchio-dal-ponteggio",
    "category": "crisi",
    "difficulty": 4,
    "title": "Un secchio cade dal ponteggio nel cortile",
    "setting": "Rifacimento della facciata di un condominio di sette piani a Milano. Alle 10:20 un secchio di malta cade dal ponteggio del quarto piano nel cortile e colpisce di striscio la spalla della signora Bertoni, 78 anni: è sotto choc e l'ambulanza la porta al pronto soccorso per accertamenti. Il ponteggio è montato da una ditta in subappalto, ma l'impresa principale sei tu. Arrivi in cantiere alle 11.",
    "cast": [
      {
        "name": "Sergio",
        "role": "il tuo capocantiere",
        "note": "con te da quindici anni, affidabile, protettivo con la sua squadra"
      },
      {
        "name": "Rinaldi",
        "role": "amministratore del condominio",
        "note": "formale, pressato dai condòmini"
      },
      {
        "name": "Florin",
        "role": "operaio della ditta di ponteggi, 24 anni",
        "note": "silenzioso, evita gli sguardi"
      }
    ],
    "objective": "Gestire l'incidente mettendo le persone al primo posto, senza scaricare colpe e senza promesse avventate.",
    "rounds": [
      {
        "text": "Nel cortile ci sono una ventina di condòmini. Sergio ti viene incontro: \"Capo, è stato il ragazzo dei ponteggi, ha lasciato il secchio sul bordo. Noi non c'entriamo.\" Un signore con il telefono alzato ti sta già riprendendo: \"Ecco il titolare! Adesso ci spiega!\"",
        "prompt": "Cosa fai per prima cosa?",
        "options": [
          {
            "text": "\"Signori, il ponteggio è di un'altra ditta. Vi lascio il loro numero: per i danni risponderanno loro.\"",
            "quality": "bad",
            "effects": {
              "etica": -2,
              "empatia": -2,
              "strategia": -1
            },
            "outcome": "Un mormorio indignato attraversa il cortile. Prima di pranzo il video con la tua frase è nel gruppo del quartiere, con il titolo \"Lo scaricabarile\".",
            "why": "Anche se il subappalto esiste, il cantiere è tuo davanti alla legge e davanti alle persone. Scaricare in pubblico ti fa sembrare uno che scappa."
          },
          {
            "text": "Prendi Sergio da parte: \"Chiudi subito il cortile sotto la facciata e ferma i lavori in quota.\" Poi chiami la figlia della signora per sapere come sta.",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "empatia": 1,
              "autocontrollo": 1,
              "lettura": -1
            },
            "outcome": "In dieci minuti il cortile è transennato e la figlia ti ringrazia della telefonata. Ma i condòmini ti hanno visto parlare con tutti tranne che con loro.",
            "why": "Le priorità sono giuste: sicurezza e persona ferita. Ma andartene senza una parola per chi è nel cortile fa sembrare che tu stia nascondendo qualcosa."
          },
          {
            "text": "\"Mi scuso con tutti: è colpa nostra e pagheremo ogni danno, alla signora e a chiunque altro. Avete la mia parola.\"",
            "quality": "weak",
            "effects": {
              "empatia": 2,
              "etica": 1,
              "strategia": -2,
              "autocontrollo": -1
            },
            "outcome": "Il clima si calma un po'. Nel pomeriggio l'assicurazione ti richiama: la tua frase è nel video, e tre condòmini chiedono già i danni per crepe che c'erano da anni.",
            "why": "Il gesto è generoso, ma promettere risarcimenti davanti a una telecamera, prima di conoscere i fatti, crea impegni che non controlli più."
          },
          {
            "text": "\"Il cantiere è mio e ne rispondo io. Lavori in quota fermi da adesso. Ora mi informo sulla signora: alle 18 sono qui e vi spiego tutto.\"",
            "quality": "best",
            "effects": {
              "etica": 2,
              "autocontrollo": 2,
              "strategia": 2,
              "assertivita": 1
            },
            "outcome": "Il signore con il telefono abbassa il braccio. Qualcuno annuisce. Nessuno è contento, ma tutti sanno chi è il responsabile e quando avranno risposte.",
            "why": "Ti prendi la responsabilità che è comunque tua, metti in sicurezza, pensi prima alla persona e fissi un appuntamento. Niente colpe e niente cifre a caldo."
          }
        ]
      },
      {
        "text": "Alle 14 il cortile è transennato e la signora Bertoni è già a casa, con una contusione alla spalla. Rinaldi ti chiama: \"Il video è nel gruppo del quartiere, trecento condivisioni. Mi serve una sua comunicazione scritta entro le 17 da girare a tutti i condòmini.\" Il tuo assicuratore ti ha appena detto: \"Per iscritto non ammetta niente.\"",
        "escalation": "Il video gira con commenti furiosi, e qualcuno parla già di denuncia.",
        "prompt": "Cosa scrivi ai condòmini?",
        "options": [
          {
            "text": "Due righe, come suggerisce l'assicuratore: \"L'impresa sta verificando la dinamica dell'evento. Seguiranno aggiornamenti.\"",
            "quality": "weak",
            "effects": {
              "strategia": 1,
              "autocontrollo": 1,
              "empatia": -2,
              "lettura": -1
            },
            "outcome": "Rinaldi lo gira alle 17:05. Nel gruppo del quartiere qualcuno lo pubblica accanto al video: \"Ecco come ci rispondono.\"",
            "why": "Prudente sul piano legale, ma freddo: in una crisi pubblica il silenzio burocratico viene letto come indifferenza, o come colpa."
          },
          {
            "text": "Fatti certi, come sta la signora (se la famiglia è d'accordo), cosa avete fatto e farete, quando rispondi alle domande. Nessuna ipotesi sulla causa.",
            "quality": "best",
            "effects": {
              "strategia": 2,
              "etica": 2,
              "empatia": 1,
              "autocontrollo": 1
            },
            "outcome": "Rinaldi lo gira alle 16:50. Nel gruppo il tono cambia, qualcuno scrive \"Almeno ci mettono la faccia\". La sera in cortile ci sono trenta persone, ma nessuno urla.",
            "why": "Fatti, misure e un appuntamento: dici la verità senza attribuire cause che non conosci ancora. Trasparenza e prudenza possono stare insieme."
          },
          {
            "text": "Un messaggio accorato: ti scusi a lungo, racconti quanto sei dispiaciuto per la signora e assicuri che il responsabile verrà allontanato dal cantiere oggi stesso.",
            "quality": "bad",
            "effects": {
              "empatia": 1,
              "strategia": -2,
              "etica": -2,
              "lettura": -1
            },
            "outcome": "Il messaggio piace, e tutti si chiedono chi sia \"il responsabile\". Prima di sera nel gruppo circola il nome del ragazzo dei ponteggi.",
            "why": "Promettere un colpevole prima di conoscere i fatti calma la folla per un'ora, ma ti obbliga a sacrificare qualcuno, magari la persona sbagliata."
          },
          {
            "text": "Chiedi a Rinaldi un giorno: \"Preferisco scrivere quando avrò la verifica del tecnico esterno. Domani a mezzogiorno avrete una comunicazione completa, con tutti i dettagli.\"",
            "quality": "good",
            "effects": {
              "autocontrollo": 1,
              "strategia": 1,
              "etica": 1,
              "empatia": -1
            },
            "outcome": "Rinaldi accetta controvoglia. Intanto il video continua a girare per tutta la sera, senza nessuna versione dell'impresa accanto.",
            "why": "Aspettare i dati è serio, ma nel frattempo il video parla da solo. Un primo messaggio con i fatti certi non ti impediva di completarlo domani."
          }
        ]
      },
      {
        "text": "La mattina dopo il cantiere è ancora fermo. Il tecnico esterno trova smontato il fermapiede del quarto piano, e Florin ti dice a bassa voce: \"L'ha fatto togliere Sergio, per passare il materiale più veloce.\" Sergio alza le spalle: \"Dieci minuti, capo. Rinaldi ci sta col fiato sul collo per chiudere il lato cortile entro venerdì.\" Il titolare dei ponteggi ti propone di chiuderla allontanando Florin.",
        "escalation": "Nel gruppo del quartiere si chiede la testa \"del colpevole\", e Rinaldi parla di sospendere il contratto.",
        "prompt": "Cosa decidi?",
        "options": [
          {
            "text": "Sospendi Sergio da capocantiere per un mese e lo scrivi nella relazione all'assicurazione, insieme a tutti i fatti. Un segnale chiaro, per tutto il cantiere.",
            "quality": "good",
            "effects": {
              "etica": 2,
              "assertivita": 2,
              "empatia": -1,
              "strategia": -1
            },
            "outcome": "La relazione è inattaccabile e i condòmini apprezzano la fermezza. Ma la squadra di Sergio è scossa, e venerdì resta una scadenza impossibile per chiunque lo sostituisca.",
            "why": "Onesto e coraggioso, ma colpisci solo l'ultimo anello: la fretta che ha spinto Sergio a correre è ancora lì, pronta a spingere il prossimo."
          },
          {
            "text": "Florin resta, ma nella relazione scrivi solo \"fermapiede temporaneamente rimosso, dinamica in corso di accertamento\". Con Sergio ne parli a quattr'occhi.",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "strategia": 1,
              "etica": -2
            },
            "outcome": "Per ora regge. Due settimane dopo il perito dell'assicurazione sente Florin, e la tua relazione vaga diventa un problema più grosso dell'incidente.",
            "why": "Proteggere tutti con una mezza verità sembra equilibrato, ma una relazione reticente è la prima cosa che crolla quando qualcuno fa domande."
          },
          {
            "text": "Relazione con i fatti veri, ordine di Sergio compreso. Florin resta. Con Rinaldi sposti la scadenza di venerdì e con Sergio rifai il piano del lato cortile.",
            "quality": "best",
            "effects": {
              "etica": 2,
              "strategia": 2,
              "assertivita": 1,
              "empatia": 1
            },
            "outcome": "Rinaldi protesta per il ritardo, poi cede: dopo quel video nessuno vuole fretta. Sergio, a sorpresa, ti ringrazia: \"Venerdì non ci stavamo, lo sapevo.\"",
            "why": "Dici la verità, proteggi chi non ha colpa e togli la causa, cioè la fretta. Una crisi si chiude davvero solo quando cambi ciò che l'ha prodotta."
          },
          {
            "text": "Accetti la proposta del titolare: Florin passa a un altro cantiere e nella relazione scrivi \"errore individuale di un operatore\". Sergio resta al suo posto e si riparte.",
            "quality": "bad",
            "effects": {
              "strategia": 1,
              "etica": -3,
              "empatia": -2,
              "lettura": -1
            },
            "outcome": "Il caso sembra chiuso. Un mese dopo Florin racconta tutto all'ispettorato del lavoro, e nel gruppo del quartiere si legge che avete scaricato la colpa sul più debole.",
            "why": "Sacrificare l'anello debole per proteggere il tuo uomo è la soluzione più comoda e la più fragile: in un cantiere la verità viene sempre fuori."
          }
        ]
      }
    ],
    "phrase": {
      "round": 1,
      "prompt": "Scrivi il messaggio per l'amministratore, da girare ai condòmini.",
      "model": "Gentili condòmini, oggi alle 10:20 un secchio è caduto dal ponteggio nel cortile e ha colpito di striscio la signora Bertoni, che è stata visitata e ora è a casa. Abbiamo sospeso tutti i lavori in quota e domattina un tecnico esterno verificherà il ponteggio prima di ripartire. Alle 18 sarò in cortile per rispondere alle vostre domande, e da oggi potete chiamarmi direttamente.",
      "keys": [
        {
          "label": "Fatti certi e stato della persona",
          "terms": [
            "10:20",
            "caduto",
            "signora",
            "visitat",
            "a casa",
            "sta bene",
            "contusion"
          ]
        },
        {
          "label": "Misure prese e prossimi passi",
          "terms": [
            "sospes",
            "verific",
            "tecnico",
            "domattina",
            "ferm",
            "sicurezza",
            "prima di ripartire"
          ]
        },
        {
          "label": "Disponibilità diretta",
          "terms": [
            "sarò",
            "domande",
            "chiamarmi",
            "incontr",
            "riunione",
            "disposizione",
            "direttamente"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Florin aveva fatto notare due volte a Sergio che il fermapiede mancava, ma è un ragazzo di 24 anni di una ditta esterna e non ha insistito. Il signore che riprendeva con il telefono era il consigliere che a febbraio aveva proposto un'altra impresa, quella di suo cognato: da settimane spingeva Rinaldi a mettervi fretta e cercava un motivo per contestare il contratto. Ogni scusa vaga o colpevole di comodo era materiale per lui; solo fatti e misure lo lasciavano senza appigli.",
      "principle": "In una crisi la storia la scrive chi comunica per primo fatti e misure; chi tace o scarica la lascia scrivere agli altri.",
      "tip": "Nel primo messaggio usa tre blocchi: \"Cosa è successo, cosa abbiamo già fatto, quando e dove rispondo alle vostre domande.\""
    }
  },
  {
    "id": "crisi-container-giacarta",
    "category": "crisi",
    "difficulty": 5,
    "title": "Il container fermo e la riunione a Giacarta",
    "setting": "Giacarta, mercoledì mattina. Il container con 1.800 metri quadri di gres italiano per la lobby di un hotel a Kemang è fermo in dogana da nove giorni per un documento di certificazione mancante; la posa doveva iniziare lunedì. Alla riunione di coordinamento, nella sala del committente, ci sono la direttrice del progetto, l'impresa generale e il tuo responsabile locale. Tu hai saputo del blocco solo ieri sera.",
    "cast": [
      {
        "name": "Ibu Ratna",
        "role": "direttrice di progetto del committente",
        "note": "calma, cortese, parla poco e sorride spesso"
      },
      {
        "name": "Pak Agus",
        "role": "titolare dell'impresa generale",
        "note": "esuberante, voce alta, conosce tutti in cantiere"
      },
      {
        "name": "Budi",
        "role": "il tuo responsabile operativo a Giacarta",
        "note": "affidabile e discreto, in azienda da tre anni"
      }
    ],
    "objective": "Uscire dalla crisi con il committente senza far perdere la faccia a nessuno, te compreso.",
    "rounds": [
      {
        "text": "La riunione è appena iniziata. Pak Agus si rivolge a tutto il tavolo: \"Il problema sono le piastrelle italiane. Ho quindici operai fermi da lunedì e qualcuno dovrà pagarli.\" Ibu Ratna sorride, non dice niente e ti guarda. Budi fissa il tavolo.",
        "prompt": "Come rispondi, davanti a tutti?",
        "options": [
          {
            "text": "\"Pak Agus, prima di parlare di soldi vorrei vedere i fogli presenza di quei quindici operai.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 2,
              "autocontrollo": -2,
              "empatia": -2,
              "strategia": -2
            },
            "outcome": "Pak Agus diventa rosso e alza la voce. Ibu Ratna continua a sorridere, ma chiude la riunione dieci minuti prima con un \"ne riparleremo\" molto cortese.",
            "why": "Sfidare in pubblico chi ti attacca può funzionare in certe sale riunioni, ma qui fa perdere la faccia a tutti, padrona di casa compresa. E il tuo ritardo resta lì."
          },
          {
            "text": "\"Mi scuso con tutti per il ritardo del container. Entro venerdì vi mando per iscritto una data certa di consegna, garantita.\"",
            "quality": "good",
            "effects": {
              "etica": 2,
              "autocontrollo": 1,
              "assertivita": 1,
              "strategia": -1
            },
            "outcome": "Il tono si abbassa. Ma \"data certa\" è una promessa che dipende dalla dogana, e Ibu Ratna se la annota.",
            "why": "Riconoscere il ritardo con calma è giusto. Promettere una data certa su qualcosa che non controlli ti espone a un secondo errore."
          },
          {
            "text": "\"Il ritardo del container è nostro, me ne scuso. Ibu Ratna, se mi concede mezz'ora oggi pomeriggio, le porto date e alternative.\"",
            "quality": "best",
            "effects": {
              "etica": 2,
              "lettura": 2,
              "autocontrollo": 1,
              "strategia": 1
            },
            "outcome": "Ibu Ratna annuisce appena: \"Alle quattro.\" Pak Agus borbotta, ma la discussione sui soldi si chiude lì, senza vincitori né perdenti.",
            "why": "Riconosci il problema senza discutere colpe e cifre in pubblico, e porti la trattativa vera in privato, con chi decide. Dove la faccia conta, è rispetto per tutti."
          },
          {
            "text": "\"Avete ragione, è interamente colpa nostra. Copriremo noi i costi della squadra ferma, nessun problema.\"",
            "quality": "weak",
            "effects": {
              "empatia": 2,
              "etica": 1,
              "strategia": -3,
              "assertivita": -1
            },
            "outcome": "Pak Agus si illumina e chiede di metterlo a verbale. Ibu Ratna ti guarda con un'espressione che non riesci a decifrare.",
            "why": "Generoso e rapido, ma ti sei impegnato a pagare costi che nessuno ha verificato. E in pubblico è difficile tornare indietro."
          }
        ]
      },
      {
        "text": "In macchina, dopo la riunione, Budi parla a bassa voce: \"Pak, la dogana mi aveva segnalato il problema dieci giorni fa. Le avevo scritto di 'una piccola difficoltà', pensavo di risolverla da solo con lo spedizioniere. E il massetto della lobby è ancora bagnato: Pak Agus non avrebbe potuto posare comunque.\" Ritrovi il suo messaggio di dieci giorni fa: gli avevi risposto con un pollice alzato.",
        "escalation": "Uscendo, Ibu Ratna ti ha salutato con un sorriso cortese e nessuna parola in più, e Pak Agus non ti ha nemmeno guardato.",
        "prompt": "Cosa dici a Budi?",
        "options": [
          {
            "text": "\"D'ora in poi ogni problema con la dogana me lo dici con una telefonata, non con un messaggio, anche se pensi di poterlo risolvere da solo.\"",
            "quality": "good",
            "effects": {
              "assertivita": 2,
              "strategia": 1,
              "autocontrollo": 1
            },
            "outcome": "Budi annuisce: \"Sì, Pak.\" La regola è chiara, ma lui resta rigido per tutto il viaggio e risponde solo a quello che gli chiedi.",
            "why": "Una regola chiara serve. Ma senza riconoscere la tua parte suona come un rimprovero, e chi si sente rimproverato smette di portare informazioni."
          },
          {
            "text": "\"Dieci giorni, Budi? Hai idea di quanto ci costa? Se succede ancora, ne trarrò le conseguenze.\"",
            "quality": "bad",
            "effects": {
              "assertivita": 1,
              "autocontrollo": -2,
              "empatia": -2,
              "lettura": -1
            },
            "outcome": "Budi si scusa due volte, poi tace. Quello che sa su spedizioniere e scorte resta nella sua testa: tu non chiedi, lui non offre.",
            "why": "La rabbia è comprensibile, ma insegna a chi lavora con te che portare cattive notizie è pericoloso: la prossima volta te le nasconderà meglio."
          },
          {
            "text": "\"Quel messaggio l'ho letto anch'io e ho messo un pollice: abbiamo sbagliato in due. Adesso dimmi tutto quello che sai, poi decidiamo come avvisarci.\"",
            "quality": "best",
            "effects": {
              "lettura": 2,
              "empatia": 2,
              "etica": 1,
              "strategia": 1
            },
            "outcome": "Budi si rilassa e tira fuori tutto: lo spedizioniere stima sei-otto giorni, e nel magazzino di Surabaya ci sono 400 metri quadri dello stesso gres. Adesso hai un piano.",
            "why": "Riconoscere la tua parte rende sicuro portarti le brutte notizie. E in quel momento, più di una regola, ti servono informazioni."
          },
          {
            "text": "\"Lascia stare, ormai è andata. Adesso pensiamo solo a come recuperare con Ibu Ratna.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "autocontrollo": 1,
              "lettura": -1,
              "strategia": -1
            },
            "outcome": "Budi è sollevato e ti passa il numero dello spedizioniere. Della scorta nel magazzino di Surabaya non parla: nessuno gliel'ha chiesto.",
            "why": "Evitare il discorso spegne la tensione, ma perdi due cose: la lezione per il futuro e le informazioni che Budi ti darebbe se si sentisse al sicuro."
          }
        ]
      },
      {
        "text": "Alle 16 sei nell'ufficio di Ibu Ratna. Sai che lo sdoganamento richiederà sei-otto giorni e che nel magazzino di Surabaya ci sono 400 metri quadri dello stesso gres, spedibili in tre giorni. Ibu Ratna versa il tè e dice con calma: \"Pak Agus vuole addebitarvi gli operai fermi. Lei cosa mi propone?\"",
        "escalation": "Ibu Ratna ti concede l'incontro con una cortesia impeccabile e venti minuti esatti.",
        "prompt": "Cosa proponi?",
        "options": [
          {
            "text": "\"Ibu, il massetto della lobby è ancora bagnato: gli operai di Pak Agus erano fermi per colpa sua, non nostra. Noi non pagheremo niente.\"",
            "quality": "bad",
            "effects": {
              "lettura": 1,
              "empatia": -2,
              "strategia": -2,
              "autocontrollo": -1
            },
            "outcome": "Ibu Ratna posa la tazza: \"Capisco.\" Il resto dell'incontro è cortese e brevissimo. Una settimana dopo scopri che ha chiesto un preventivo a un altro distributore per i prossimi progetti.",
            "why": "È vero, ed è proprio per questo che è tentante. Ma usare la verità come un'arma per scaricarti la costringe a scegliere tra te e un partner storico, e in quella scelta perdi tu."
          },
          {
            "text": "\"Le propongo 400 metri dal magazzino di Surabaya entro lunedì per partire dalla reception, e il resto appena sdoganato. Le mando ogni giorno un aggiornamento sulla dogana.\"",
            "quality": "good",
            "effects": {
              "strategia": 2,
              "etica": 1,
              "assertivita": 1
            },
            "outcome": "Ibu Ratna annuisce: \"Bene.\" Il piano è solido, ma la questione degli operai fermi resta sul tavolo, e la settimana dopo Pak Agus manda il conto.",
            "why": "Una soluzione concreta è ciò che serve. Ma lasciare cadere la domanda sui costi tiene aperto il conflitto con Agus, che ora può scaricarlo su di te."
          },
          {
            "text": "\"Come gesto di buona volontà copriamo noi metà dei costi degli operai fermi. Ci tengo che il rapporto con voi resti ottimo.\"",
            "quality": "weak",
            "effects": {
              "empatia": 1,
              "etica": 1,
              "strategia": -2,
              "assertivita": -1
            },
            "outcome": "Ibu Ratna ringrazia con un cenno e Pak Agus incassa senza commentare. Hai pagato una parte di un ritardo che non era tuo, e nessuno te ne darà atto.",
            "why": "Il gesto è elegante e compra tranquillità, ma paghi senza sapere cosa stai pagando: è una scorciatoia che rischia di diventare un'abitudine."
          },
          {
            "text": "\"Due cose: 400 metri da Surabaya per iniziare la reception appena il massetto è asciutto, e domani un sopralluogo con Pak Agus per fissare date che reggano per tutti.\"",
            "quality": "best",
            "effects": {
              "strategia": 3,
              "lettura": 2,
              "etica": 1,
              "empatia": 1
            },
            "outcome": "Ibu Ratna ti osserva un momento, poi sorride, stavolta davvero: \"Domani alle nove.\" Al sopralluogo il massetto bagnato lo vede lei, e la richiesta di Pak Agus non torna più fuori.",
            "why": "Il massetto entra nel piano come un dato, non come un'accusa, e il sopralluogo lascia emergere i fatti senza che nessuno perda la faccia. Risolvi e proteggi insieme."
          }
        ]
      }
    ],
    "phrase": {
      "round": 2,
      "prompt": "Scrivi l'email di riepilogo per Ibu Ratna dopo l'incontro, con Pak Agus in copia.",
      "model": "Gentile Ibu Ratna, grazie per il tempo di oggi. Come concordato, lunedì consegniamo 400 metri quadri dal magazzino di Surabaya per partire dalla reception appena il massetto sarà asciutto, e domani alle 9 facciamo il sopralluogo con Pak Agus per fissare insieme il nuovo calendario. Il ritardo del container resta una nostra responsabilità: vi aggiornerò ogni giorno sulla dogana.",
      "keys": [
        {
          "label": "Riconoscere la tua parte",
          "terms": [
            "nostra responsabilità",
            "responsabilità",
            "ci scusiamo",
            "mi scuso",
            "scuse",
            "nostro ritardo",
            "dispiace"
          ]
        },
        {
          "label": "Piano concreto con date",
          "terms": [
            "lunedì",
            "400",
            "surabaya",
            "sopralluogo",
            "domani",
            "alle 9",
            "calendario",
            "date"
          ]
        },
        {
          "label": "Tono che include tutti",
          "terms": [
            "gentile",
            "grazie",
            "insieme",
            "pak agus",
            "concordato",
            "rispett",
            "tutti"
          ]
        }
      ]
    },
    "debrief": {
      "truth": "Ibu Ratna sapeva già del massetto bagnato: il suo ingegnere gliel'aveva segnalato martedì. In riunione ti stava osservando per capire se, per salvarti, avresti umiliato Pak Agus davanti a tutti: lavora con la famiglia del committente da quindici anni, e lei sta scegliendo il fornitore per altri tre hotel. Il sopralluogo congiunto le dava il modo di far emergere il ritardo di Agus senza che nessuno perdesse la faccia.",
      "principle": "Quando hai una verità che può umiliare qualcuno, il modo in cui la fai emergere vale quanto la verità stessa.",
      "tip": "Invece di accusare, proponi una verifica comune: \"Domani facciamo un sopralluogo insieme e fissiamo date che reggano per tutti.\""
    }
  }
];
