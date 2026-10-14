window.ScenarioExams = [
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
            "text": "\"Va bene, te li mando subito, tranquillo.\"",
            "quality": "bad",
            "effects": {
              "assertivita": -2,
              "strategia": -2,
              "autocontrollo": -1,
              "empatia": 1
            },
            "outcome": "Luca ti ringrazia mille volte. Dopo la riunione ti accorgi che non avete parlato né di tempi né di come li restituirà.",
            "why": "Dire sì per chiudere il disagio della telefonata non è generosità: è evitare il conflitto, lo stesso schema dell'ultima volta."
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
            "why": "Hai visto la leva, ma smontarla in modo secco fa sentire l'altro accusato e alza le difese."
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
  }
];
