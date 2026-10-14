/*
 * Progetto A - Difesa: tecniche, riscaldamento e programma in 4 fasi (12 sessioni).
 * Le pose delle figure animate sono in defense/scenes.js (stessi id).
 * Schema controllato da tests/defense.test.js.
 */
window.DefenseProgram = {
  "techniques": [
    {
      "id": "t-postura-aperta",
      "phase": 1,
      "name": "Postura a mani aperte",
      "purpose": "Ti mette in una posizione protetta e pronta a muoverti, con le mani già tra te e l'altro, ma con un linguaggio del corpo calmo che non provoca.",
      "when": "Quando qualcuno è agitato, alza la voce o si avvicina troppo mentre state ancora parlando. Se puoi semplicemente andartene prima, andare via resta la scelta migliore.",
      "frames": [
        "Posizione rilassata",
        "Mani aperte davanti al petto"
      ],
      "steps": [
        "Parti in piedi rilassato, piedi alla larghezza delle spalle, peso distribuito su entrambe le gambe, sguardo verso l'altro.",
        "Porta un piede mezzo passo indietro, di solito quello del lato forte: piedi sfalsati, ginocchia morbide, busto leggermente di tre quarti.",
        "Alza le mani aperte davanti al petto, palmi verso l'altro, dita rilassate verso l'alto, gomiti morbidi vicini ai fianchi.",
        "Tieni le mani a una ventina di centimetri dal petto, tra te e lui: se si avvicina, sono già in posizione per proteggerti.",
        "Parla con voce calma e frasi brevi («Va bene, calma»), respira lento e guarda il centro del suo petto per vedere mani e spalle."
      ],
      "keys": [
        "Mani aperte e palmi visibili: comunichi calma, non sfida.",
        "Le mani stanno tra te e lui, mai sui fianchi o in tasca.",
        "Piedi sfalsati e ginocchia morbide: puoi arretrare in qualsiasi momento."
      ],
      "errors": [
        {
          "error": "Pugni chiusi o dito puntato contro l'altro",
          "fix": "Apri le mani e mostra i palmi: pugni e dito puntato sembrano una sfida e fanno salire la tensione."
        },
        {
          "error": "Braccia tese in avanti",
          "fix": "Gomiti piegati e morbidi, mani a circa 20 cm dal petto: sembri calmo e puoi reagire senza dover prima ritirare le braccia."
        },
        {
          "error": "Piedi paralleli e gambe rigide",
          "fix": "Sfalsa i piedi di mezzo passo e piega appena le ginocchia: una spinta non ti sbilancia e puoi muoverti subito."
        }
      ],
      "solo": "Davanti allo specchio passa dalla posizione rilassata alle mani aperte 10 volte, controllando palmi, gomiti e piedi. Poi ripeti parlando ad alta voce con frasi calme, senza irrigidirti.",
      "partner": "Il partner cammina lentamente verso di te parlando a voce alta; tu prendi la postura e rispondi con calma. Nessun contatto, e vi fermate appena uno dei due dice «stop».",
      "dose": "3 serie da 10 passaggi lenti, più 1 minuto parlando",
      "calls": [
        "Mani aperte",
        "Piedi sfalsati",
        "Voce calma"
      ]
    },
    {
      "id": "t-guardia",
      "phase": 1,
      "name": "Guardia di protezione",
      "purpose": "Protegge testa e viso quando la situazione diventa fisica: mani alle guance, mento basso e gomiti stretti chiudono i bersagli più delicati.",
      "when": "Quando l'altro sta per colpire o un colpo è già partito. Non serve mentre parli: la guardia può sembrare una sfida, lì usa le mani aperte e passa alla guardia solo se serve.",
      "frames": [
        "Postura a mani aperte",
        "Mani alle guance, mento basso"
      ],
      "steps": [
        "Parti dalla postura a mani aperte: piedi sfalsati, ginocchia morbide, mani aperte davanti al petto.",
        "Porta le mani alle guance, vicine al viso, con le dita all'altezza delle sopracciglia: coprono viso e tempie.",
        "Abbassa il mento verso il petto e guarda in avanti da sotto le sopracciglia, senza chiudere gli occhi.",
        "Stringi i gomiti ai fianchi per coprire le costole e alza appena le spalle; il peso resta sugli avampiedi.",
        "Respira in modo regolare, espirando dalla bocca: non trattenere il fiato."
      ],
      "keys": [
        "Mento basso: è la protezione più importante per la testa.",
        "Gomiti stretti: coprono le costole e tengono le mani vicine al viso.",
        "Le mani restano alte anche quando ti muovi o sei stanco."
      ],
      "errors": [
        {
          "error": "Mento alto, testa dritta",
          "fix": "Porta il mento verso il petto e guarda da sotto le sopracciglia, come se tenessi una pallina tra mento e petto."
        },
        {
          "error": "Gomiti larghi verso l'esterno",
          "fix": "Chiudi i gomiti contro i fianchi: se si aprono lasci scoperte le costole e le mani si allontanano dal viso."
        },
        {
          "error": "Mani che scendono dopo pochi secondi",
          "fix": "Controlla allo specchio e riporta le mani alle guance: meglio round brevi con la guardia giusta che lunghi con le mani basse."
        }
      ],
      "solo": "Allo specchio passa dalle mani aperte alla guardia 10 volte, poi tieni la guardia 30 secondi muovendoti per la stanza: controlla mento, gomiti e mani.",
      "partner": "Il partner preme piano con il palmo aperto sui tuoi gomiti e sul dorso delle mani per verificare che la guardia resti chiusa. Lento, nessun colpo, parola di stop concordata.",
      "dose": "3 serie: 10 passaggi lenti e 30 secondi in guardia",
      "calls": [
        "Guardia",
        "Mento giù",
        "Gomiti stretti"
      ]
    },
    {
      "id": "t-passi-base",
      "phase": 1,
      "name": "Passo avanti e passo indietro",
      "purpose": "Ti fa spostare restando sempre in equilibrio e in guardia: con passo e richiamo i piedi non si incrociano e non si uniscono mai.",
      "when": "Ogni volta che devi aggiustare la distanza, soprattutto per arretrare da qualcuno che avanza. È la base di tutte le altre tecniche: senza un buon passo nessuna parata funziona.",
      "frames": [
        "Guardia",
        "Avanza il piede davanti",
        "Richiama il piede dietro",
        "Indietro: parte il piede dietro"
      ],
      "steps": [
        "Parti in guardia: piedi sfalsati alla larghezza delle spalle, ginocchia morbide, peso al centro, mani alle guance.",
        "Avanti: spingi leggermente col piede dietro e fai scivolare in avanti il piede davanti con un passo corto, 20-30 cm.",
        "Richiama subito il piede dietro della stessa distanza: ritrovi esattamente la base di partenza, senza unire i piedi.",
        "Indietro: spingi col piede davanti e fai partire per primo il piede dietro, sempre con un passo corto.",
        "Poi richiama il piede davanti della stessa misura. Regola: parte sempre per primo il piede più vicino alla direzione in cui vai."
      ],
      "keys": [
        "Parte prima il piede verso cui vai, poi richiami l'altro.",
        "Passi corti e radenti: la testa resta alla stessa altezza.",
        "Dopo ogni passo hai la stessa base e la stessa guardia di prima."
      ],
      "errors": [
        {
          "error": "Incrociare i piedi o unirli",
          "fix": "Il piede che richiami si ferma dove era prima, non accanto all'altro: la distanza tra i piedi resta sempre la stessa."
        },
        {
          "error": "Passi lunghi che sbilanciano",
          "fix": "Accorcia il passo a 20-30 cm: meglio due passi corti che uno lungo, perché resti in equilibrio e pronto."
        },
        {
          "error": "Mani che scendono mentre ti muovi",
          "fix": "Pensa «prima la guardia, poi i piedi» e fai i passi lenti allo specchio finché le mani restano alle guance."
        }
      ],
      "solo": "Segna una linea sul pavimento con due oggetti e muoviti avanti e indietro lungo la linea, lentamente, controllando allo specchio piedi e mani.",
      "partner": "Il partner sta di fronte a te a mani aperte e avanza o arretra lentamente: tu lo segui mantenendo la stessa distanza. Velocità al 30%, nessun contatto.",
      "dose": "3 serie da 10 passi avanti e 10 indietro",
      "calls": [
        "Avanti",
        "Indietro",
        "Passo e richiamo"
      ]
    },
    {
      "id": "t-passo-laterale",
      "phase": 1,
      "name": "Passo laterale fuori linea",
      "purpose": "Ti toglie dalla traiettoria di chi avanza o spinge con un piccolo spostamento di lato: lui va avanti nel vuoto e tu resti in equilibrio, pronto a uscire.",
      "when": "Quando qualcuno ti viene addosso dritto, spinge o carica in avanti. È anche il modo migliore per non finire con le spalle al muro arretrando in linea retta.",
      "frames": [
        "Guardia sulla linea",
        "Passo laterale",
        "Fuori linea, mani alte"
      ],
      "steps": [
        "Parti in guardia e immagina una linea dritta tra te e l'altro: chi avanza o spinge si muove lungo quella linea.",
        "Per uscire a sinistra parte il piede sinistro, per la destra il destro: mezzo passo di lato, leggermente in diagonale.",
        "Richiama l'altro piede della stessa misura senza incrociare: ritrovi la base sfalsata, ginocchia morbide.",
        "Ruota busto e piedi quanto basta per tornare di fronte all'altro, mani alte, pronto a muoverti ancora o ad andartene."
      ],
      "keys": [
        "Basta mezzo passo: l'obiettivo è uscire dalla linea, non saltare lontano.",
        "Parte il piede dalla parte in cui vai, poi richiami l'altro.",
        "Dopo il passo ritrovi subito l'altro con lo sguardo, mani alte."
      ],
      "errors": [
        {
          "error": "Passo troppo largo che apre le gambe",
          "fix": "Fai mezzo passo, 30-40 cm: con le gambe troppo larghe perdi equilibrio e non riesci a muoverti di nuovo."
        },
        {
          "error": "Incrociare i piedi nel passo",
          "fix": "Muovi prima il piede dal lato in cui vai e solo dopo richiami l'altro: i piedi non si incrociano mai."
        },
        {
          "error": "Restare girato e perdere di vista l'altro",
          "fix": "Dopo il passo ruota sul piede davanti finché sei di nuovo di fronte a lui, con le mani alte."
        }
      ],
      "solo": "Usa una linea sul pavimento come traiettoria: esci a destra e a sinistra alternando, lentamente, controllando allo specchio piedi, mani e rotazione finale.",
      "partner": "Il partner avanza lentamente verso di te a mani aperte, al 30% della velocità: tu esci di lato e torni di fronte. Nessun contatto, parola di stop concordata.",
      "dose": "3 serie da 8 uscite per lato",
      "calls": [
        "Fuori linea",
        "Passo a destra",
        "Passo a sinistra"
      ]
    },
    {
      "id": "t-distanza",
      "phase": 1,
      "name": "Controllo della distanza",
      "purpose": "Ti tiene fuori portata: se l'altro non può toccarti senza prima fare un passo, hai il tempo di vedere, reagire e andartene.",
      "when": "Ogni volta che qualcuno ti mette a disagio o si avvicina con insistenza, prima di qualsiasi altra tecnica: la distanza giusta evita la maggior parte dei problemi.",
      "frames": [
        "Fuori portata",
        "Lui avanza, tu arretri",
        "Mani aperte tra voi"
      ],
      "steps": [
        "Misura la distanza di sicurezza: un braccio più un passo. Se lui allungasse il braccio facendo un passo, non dovrebbe arrivarti.",
        "Quando avanza, arretra con passo e richiamo, partendo col piede dietro, e mantieni la stessa distanza.",
        "Non andare dritto indietro per più di due o tre passi: arretra in diagonale o gira di lato per non finire contro un muro.",
        "Tieni le mani aperte davanti al petto, tra voi, e la voce ferma: «Fermati, resta lì».",
        "Con la coda dell'occhio cerca l'uscita e spostati gradualmente verso di essa, senza voltargli le spalle finché è vicino."
      ],
      "keys": [
        "Un braccio più un passo: sotto questa distanza perdi il tempo per reagire.",
        "Arretra girando, non in linea retta: eviti muri, angoli e ostacoli.",
        "Le mani aperte restano sempre tra te e lui."
      ],
      "errors": [
        {
          "error": "Lasciarlo avvicinare per cortesia",
          "fix": "Arretra appena entra nella tua distanza e dillo con voce ferma: tenere lo spazio non è maleducazione, è prudenza."
        },
        {
          "error": "Arretrare in linea retta fino al muro",
          "fix": "Dopo due o tre passi cambia direzione, in diagonale o di lato, girando verso lo spazio libero o l'uscita."
        },
        {
          "error": "Guardare a terra mentre arretri",
          "fix": "Tieni lo sguardo sul centro del suo petto; prima di iniziare osserva lo spazio intorno, così sai già dove muoverti."
        }
      ],
      "solo": "In una stanza sgombra immagina qualcuno che avanza: arretra e gira in diagonale senza mai andare dritto verso un muro, con mani aperte e voce calma. Lento, senza inciampare.",
      "partner": "Il partner avanza lentamente da direzioni diverse; tu mantieni la distanza arretrando e girando. Velocità al 30%, nessun contatto, stanza libera da ostacoli, parola di stop.",
      "dose": "3 round da 1 minuto, lenti",
      "calls": [
        "Distanza",
        "Arretra e gira",
        "Mani aperte"
      ]
    },
    {
      "id": "t-parata-esterna",
      "phase": 2,
      "name": "Parata esterna",
      "purpose": "Con l'avambraccio anteriore devii verso l'esterno una spinta o un braccio dritto: non blocchi la forza, la sposti quel tanto che basta da non esserne colpito.",
      "when": "Quando un braccio arriva dritto verso testa o petto e non hai più spazio per arretrare. Serve a guadagnare un attimo per uscire, non a restare lì a parare.",
      "frames": [
        "Guardia",
        "Devia verso l'esterno",
        "Torna in guardia"
      ],
      "steps": [
        "Parti in guardia, mani alle guance, gomiti stretti, sguardo sul centro del suo petto per vedere partire le braccia.",
        "Quando il braccio arriva, ruota l'avambraccio anteriore dall'interno verso l'esterno, con il gomito piegato a circa 90 gradi.",
        "Il contatto è avambraccio contro avambraccio: devii la traiettoria di pochi centimetri, fino alla linea della tua spalla, non oltre.",
        "L'altra mano resta alla guancia a proteggere il viso e il mento rimane basso per tutta la parata.",
        "Riporta subito l'avambraccio in guardia e preparati al passo laterale per uscire dalla linea."
      ],
      "keys": [
        "Deviare, non bloccare: accompagna il braccio fuori dalla linea.",
        "Movimento corto: l'avambraccio non va oltre la linea della spalla.",
        "L'altra mano resta sempre alta a coprire il viso."
      ],
      "errors": [
        {
          "error": "Movimento ampio che apre la guardia",
          "fix": "Fermati alla linea della spalla: una parata larga lascia scoperto il viso e rallenta il ritorno in guardia."
        },
        {
          "error": "Andare incontro al colpo con forza",
          "fix": "Aspetta che il braccio arrivi e devialo con una rotazione morbida: forza contro forza stanca e funziona male."
        },
        {
          "error": "Abbassare l'altra mano o chiudere gli occhi",
          "fix": "Tieni la mano libera alla guancia e lo sguardo avanti; allo specchio controlla che il viso resti coperto."
        }
      ],
      "solo": "Allo specchio, in guardia: esegui la parata lentamente, controllando che l'avambraccio si fermi alla linea della spalla e che l'altra mano resti alla guancia.",
      "partner": "Il partner allunga lentamente il braccio aperto verso la tua spalla, al 30% della velocità e senza colpire; tu devii e torni in guardia. Parola di stop concordata.",
      "dose": "3 serie da 8 per lato, lente",
      "calls": [
        "Parata esterna",
        "Torna in guardia"
      ]
    },
    {
      "id": "t-parata-interna",
      "phase": 2,
      "name": "Parata interna col palmo",
      "purpose": "Con il palmo devii verso l'interno un braccio dritto e subito esci di lato: ti ritrovi all'esterno del suo braccio, lontano dall'altra mano.",
      "when": "Quando un braccio dritto o una spinta arrivano verso viso o petto. Funziona solo se è seguita dall'uscita: la parata da sola non basta, ti dà il tempo di spostarti.",
      "frames": [
        "Guardia",
        "Il palmo devia verso l'interno",
        "Esci dalla linea"
      ],
      "steps": [
        "Parti in guardia, mani alle guance, sguardo sul centro del suo petto per vedere da che parte arriva il braccio.",
        "Usa la mano del lato da cui arriva il braccio: il palmo lo tocca sull'avambraccio e lo spinge verso l'interno, verso il centro.",
        "Tocco breve e morbido, dita unite: lo devii appena oltre la linea del tuo viso, senza afferrarlo e senza allungarti.",
        "Subito fai un passo laterale dalla parte opposta a quella in cui hai spinto il braccio: ti trovi all'esterno del suo braccio.",
        "Ruota per tornare di fronte a lui, mani alte, e prendi distanza o vai verso l'uscita."
      ],
      "keys": [
        "Contatto col palmo e dita unite, mai con la punta delle dita.",
        "Devii e lasci andare: niente prese, il braccio deve solo mancarti.",
        "Il passo va dalla parte opposta alla spinta, all'esterno del suo braccio."
      ],
      "errors": [
        {
          "error": "Afferrare il braccio o spingerlo lontano",
          "fix": "Basta un tocco che sposta il braccio di pochi centimetri: afferrare ti fa perdere tempo e ti lega a lui."
        },
        {
          "error": "Parare con le dita aperte",
          "fix": "Unisci le dita e usa il palmo: le dita aperte si piegano facilmente e la deviazione è meno precisa."
        },
        {
          "error": "Restare sulla linea dopo la parata",
          "fix": "Parata e passo laterale sono un unico movimento: se resti fermo, l'altra mano ti trova ancora lì."
        }
      ],
      "solo": "Allo specchio, in guardia: alterna parata a destra e a sinistra seguita dal passo laterale, lentamente, verificando che il passo vada sempre dalla parte opposta alla spinta.",
      "partner": "Il partner allunga lentamente il braccio aperto verso la tua spalla, al 30% e senza colpire; tu devii col palmo ed esci. Alternate i lati, parola di stop concordata.",
      "dose": "3 serie da 6 per lato, lente",
      "calls": [
        "Parata interna",
        "Palmo ed esci"
      ]
    },
    {
      "id": "t-copertura-alta",
      "phase": 2,
      "name": "Copertura alta",
      "purpose": "Chiude testa e viso con gli avambracci quando arrivano colpi larghi, veloci e confusi: ne assorbi meno e intanto ti sposti verso lo spazio libero.",
      "when": "Quando vieni sorpreso da colpi larghi o ripetuti e non riesci a vedere da dove arrivano. È una protezione temporanea: copri, ti muovi ed esci, non resti fermo a incassare.",
      "frames": [
        "Guardia",
        "Avambracci alle tempie",
        "Passi corti di lato"
      ],
      "steps": [
        "Parti in guardia, mento basso, ginocchia morbide, peso sugli avampiedi.",
        "Porta le mani sulla parte alta della testa, con gli avambracci contro le tempie e i gomiti puntati in avanti a chiudere il viso.",
        "Mento al petto e spalle alzate; guarda attraverso la fessura tra gli avambracci, senza chiudere gli occhi.",
        "Muoviti con passi corti di lato o in diagonale, fuori dalla sua linea, verso lo spazio libero o l'uscita.",
        "Appena i colpi si fermano o si apre spazio, torna in guardia, prendi distanza e allontanati."
      ],
      "keys": [
        "Gomiti avanti e vicini: tra gli avambracci resta solo lo spazio per vedere.",
        "Non restare fermo: copertura e passi corti vanno insieme.",
        "Occhi aperti: devi sapere sempre dove andare."
      ],
      "errors": [
        {
          "error": "Chiudere gli occhi e girare la schiena",
          "fix": "Tieni gli occhi aperti e il busto verso di lui: girando la schiena perdi il controllo e scopri la nuca."
        },
        {
          "error": "Gomiti larghi che lasciano spazi",
          "fix": "Avvicina i gomiti davanti al viso: tra gli avambracci deve restare solo una fessura per guardare."
        },
        {
          "error": "Restare fermo a incassare",
          "fix": "Fai subito passi corti di lato: un bersaglio che si sposta viene colpito meno e si avvicina all'uscita."
        }
      ],
      "solo": "Allo specchio passa dalla guardia alla copertura e muoviti con passi corti di lato per 20 secondi, controllando gomiti, mento e occhi aperti.",
      "partner": "Il partner tocca piano i tuoi avambracci con i palmi aperti, lento e al 30%, mai sul viso; tu tieni la copertura e ti sposti di lato. Parola di stop concordata.",
      "dose": "3 serie da 20 secondi con passi laterali",
      "calls": [
        "Copertura",
        "Passi di lato"
      ]
    },
    {
      "id": "t-schivata",
      "phase": 2,
      "name": "Schivata laterale",
      "purpose": "Toglie la testa dalla linea di un colpo dritto con un piccolo piegamento delle ginocchia, poi un passo ti porta fuori: ti muovi poco e resti in equilibrio.",
      "when": "Quando un braccio dritto arriva verso il viso e non c'è tempo di parare. Non affidarti solo a lei: è difficile da cronometrare, va sempre abbinata a mani alte e uscita.",
      "frames": [
        "Guardia",
        "Testa fuori linea",
        "Passo e mani alte"
      ],
      "steps": [
        "Parti in guardia, mento basso, ginocchia morbide, sguardo sul centro del suo petto.",
        "Piega leggermente le ginocchia e ruota appena le spalle: la testa si sposta di lato di 10-15 cm, appena fuori dalla linea.",
        "Tieni il busto quasi dritto: non piegarti in avanti con la schiena e non abbassarti troppo. Le mani restano alle guance.",
        "Subito fai un passo laterale dalla stessa parte della schivata e torna di fronte a lui con le mani alte."
      ],
      "keys": [
        "La testa esce di poco, appena oltre la linea della spalla.",
        "Si piegano le ginocchia, non la schiena.",
        "Dopo la schivata c'è sempre il passo: non restare lì."
      ],
      "errors": [
        {
          "error": "Piegarsi in avanti con la schiena",
          "fix": "Piega le ginocchia e tieni il busto quasi dritto: piegandoti in avanti perdi equilibrio e porti la testa verso di lui."
        },
        {
          "error": "Movimento troppo ampio",
          "fix": "Sposta la testa di 10-15 cm: una schivata grande è lenta e ti lascia sbilanciato per il passo successivo."
        },
        {
          "error": "Abbassare le mani durante la schivata",
          "fix": "Le mani restano alle guance per tutto il movimento: se la schivata non basta, la guardia ti protegge."
        }
      ],
      "solo": "Davanti allo specchio segui con la testa una linea verticale immaginaria: schiva a destra e a sinistra lentamente, poi aggiungi il passo, controllando busto e mani.",
      "partner": "Il partner avvicina lentamente un cuscino in linea retta verso la tua testa, al 30% della velocità; tu schivi e fai il passo. Solo cuscino, parola di stop concordata.",
      "dose": "3 serie da 6 per lato, lente",
      "calls": [
        "Schiva",
        "Schiva e passo"
      ]
    },
    {
      "id": "t-polso-una-mano",
      "phase": 3,
      "name": "Liberazione dal polso",
      "purpose": "Ti libera da una presa al polso usando il punto debole della mano che afferra, il pollice, invece della forza: ruoti, porti il gomito al corpo e arretri.",
      "when": "Quando qualcuno ti afferra il polso per trattenerti o trascinarti. Se la presa è leggera e puoi parlare, prima prova con voce ferma; la tecnica serve se non ti lascia.",
      "frames": [
        "Lui afferra il polso",
        "Ruota verso il pollice",
        "Gomito al corpo, passo indietro"
      ],
      "steps": [
        "Lui ti afferra il polso: non tirare dritto all'indietro contro la sua forza. Guarda dove si trova il suo pollice.",
        "Apri la mano e tendi le dita: l'avambraccio si attiva e il polso diventa più solido.",
        "Ruota il polso verso il suo pollice, cioè verso l'apertura tra pollice e indice: è il punto più debole della presa.",
        "Mentre ruoti piega il gomito e portalo verso il tuo fianco: il movimento parte da gomito e corpo, non solo dal polso.",
        "Nello stesso momento fai un passo indietro, poi mani alte e distanza: allontanati senza aspettare."
      ],
      "keys": [
        "Esci sempre verso il pollice: è il lato dove la presa si apre.",
        "Gomito al corpo e passo indietro insieme: lavora tutto il corpo.",
        "Funziona allo stesso modo con la presa dritta e con quella incrociata."
      ],
      "errors": [
        {
          "error": "Tirare dritto all'indietro",
          "fix": "Tirando dritto lotti contro quattro dita: ruota verso il suo pollice e lascia che il polso scivoli fuori da lì."
        },
        {
          "error": "Usare solo il polso, con il braccio rigido",
          "fix": "Piega il gomito e portalo al fianco mentre arretri: così usi peso e gambe, non solo la forza del braccio."
        },
        {
          "error": "Restare vicino dopo la liberazione",
          "fix": "Appena libero fai un passo indietro, alza le mani e allontanati: la liberazione serve solo a creare lo spazio per andare via."
        }
      ],
      "solo": "Afferra il tuo polso con l'altra mano e ripeti lentamente rotazione verso il pollice, gomito al fianco e passo indietro. Cambia mano e prova sia la presa dritta sia quella incrociata.",
      "partner": "Il partner afferra con una presa media, mai al massimo; tu esegui al 30% della velocità. Lui lascia subito se uno dei due dice «stop». Alternate ruoli, mani e tipo di presa.",
      "dose": "3 serie da 6 per mano, lente",
      "calls": [
        "Verso il pollice",
        "Gomito e indietro"
      ]
    },
    {
      "id": "t-polso-due-mani",
      "phase": 3,
      "name": "Polso preso a due mani",
      "purpose": "Ti libera quando qualcuno stringe il tuo polso con entrambe le mani: unisci la forza delle tue due braccia e delle gambe e tiri verso lo spazio tra i suoi pollici.",
      "when": "Quando qualcuno ti blocca il polso con tutte e due le mani per trattenerti o tirarti. Le sue mani sono entrambe occupate: è il momento di liberarti e allontanarti subito.",
      "frames": [
        "Due mani sul polso",
        "Afferra la tua mano",
        "Tira su tra i pollici"
      ],
      "steps": [
        "Lui ti stringe il polso con due mani: piega le ginocchia per abbassarti un poco e chiudi a pugno la mano presa.",
        "Fai passare la mano libera in mezzo alle sue braccia e afferra il tuo pugno o le tue dita.",
        "Tira verso l'alto e verso di te, come per portare il pugno alla spalla, facendo uscire il polso nello spazio tra i suoi pollici.",
        "Mentre tiri raddrizza le gambe: la spinta parte dalle gambe, non solo dalle braccia.",
        "Appena libero fai un passo indietro, mani in guardia, e allontanati."
      ],
      "keys": [
        "Si tira sempre verso i suoi pollici: se i pollici sono in basso, tira verso il basso.",
        "Due braccia più le gambe contro due mani: non tirare con un braccio solo.",
        "Libero vuol dire passo indietro e uscita, non restare lì."
      ],
      "errors": [
        {
          "error": "Tirare di lato o all'indietro",
          "fix": "Guarda i suoi pollici e tira esattamente verso lo spazio tra di loro: di lato o indietro lotti contro tutte le sue dita."
        },
        {
          "error": "Usare solo le braccia, gambe rigide",
          "fix": "Piega le ginocchia prima di tirare e raddrizzale mentre tiri: la forza delle gambe rende il movimento più facile."
        },
        {
          "error": "Mano presa aperta e molle",
          "fix": "Chiudi a pugno la mano presa: dai un appiglio solido all'altra mano e il polso diventa più compatto."
        }
      ],
      "solo": "Senza presa reale ripeti il movimento: chiudi il pugno, afferralo con l'altra mano, piega le ginocchia e tira verso la spalla con un passo indietro. Lento, alternando le mani.",
      "partner": "Il partner afferra con due mani a presa media, pollici in alto; tu esegui lento, al 30%. Lui lascia subito alla parola di stop. Poi provate con i pollici in basso.",
      "dose": "3 serie da 5 per mano, lente",
      "calls": [
        "Afferra la tua mano",
        "Tira tra i pollici"
      ]
    },
    {
      "id": "t-spinta-petto",
      "phase": 3,
      "name": "Presa o spinta al petto",
      "purpose": "Ti tiene in piedi quando qualcuno ti spinge o ti afferra al petto: base larga per assorbire, poi un passo di lato ti toglie dalla sua linea e ti permette di uscire.",
      "when": "Quando qualcuno ti spinge con due mani o ti afferra i vestiti sul petto. Lo scopo è non cadere e uscire, non spingere a tua volta per dimostrare qualcosa.",
      "frames": [
        "Due mani sul petto",
        "Base larga, piede dietro",
        "Passo di lato ed esci"
      ],
      "steps": [
        "Due mani sul petto: non irrigidirti e non spingere in avanti contro di lui. Mento basso.",
        "Fai scivolare subito un piede indietro e allarga la base, ginocchia piegate: assorbi la spinta come una molla.",
        "Alza le mani davanti al viso: spesso una spinta precede un colpo.",
        "Fai un passo laterale in diagonale ruotando il busto; se ti tiene i vestiti, col palmo spingi di lato il suo avambraccio mentre giri.",
        "Ritrova la guardia fuori dalla sua linea, prendi distanza e allontanati."
      ],
      "keys": [
        "Piede dietro subito: è la base che ti impedisce di cadere.",
        "Assorbi e giri: non serve vincere la spinta, basta uscirne.",
        "Mani alte fin dal primo istante."
      ],
      "errors": [
        {
          "error": "Piedi paralleli e gambe dritte",
          "fix": "Porta subito un piede indietro e piega le ginocchia: con i piedi paralleli anche una spinta leggera ti fa cadere."
        },
        {
          "error": "Irrigidirsi e spingere contro",
          "fix": "Lascia che la spinta ti faccia arretrare di un passo e usa quel movimento per uscire di lato."
        },
        {
          "error": "Mani basse mentre ti sistemi",
          "fix": "Alza le mani prima ancora di muovere i piedi: la spinta può servire a sbilanciarti prima di un colpo."
        }
      ],
      "solo": "Immagina la spinta: fai scivolare il piede dietro, piega le ginocchia, alza le mani, poi passo laterale e guardia. Allo specchio, lento, alternando i lati.",
      "partner": "Spazio libero dietro di te. Il partner spinge piano con due mani, al 30% della forza e sempre lento; tu assorbi ed esci di lato. Niente spinte improvvise, parola di stop.",
      "dose": "3 serie da 6 per lato, lente",
      "calls": [
        "Piede dietro",
        "Esci di lato"
      ]
    },
    {
      "id": "t-presa-da-dietro",
      "phase": 3,
      "name": "Abbraccio da dietro",
      "purpose": "Ti aiuta a non farti sollevare né trascinare quando qualcuno ti cinge da dietro: abbassi il baricentro, allarghi la base, crei spazio e ti giri per uscire.",
      "when": "Quando qualcuno ti afferra da dietro stringendoti il busto, sopra o sotto le braccia. La priorità è non essere sollevato o spostato: base bassa prima di tutto.",
      "frames": [
        "Abbraccio da dietro",
        "Abbassa il baricentro",
        "Gira ed esci"
      ],
      "steps": [
        "Ti abbracciano da dietro: non sporgerti in avanti e non irrigidirti. Mento basso, respira.",
        "Piega subito le ginocchia e allarga i piedi oltre le spalle: abbassando il baricentro diventi molto più difficile da sollevare.",
        "Porta le mani sui suoi avambracci per non farli salire verso il collo; se hai le braccia bloccate, allarga i gomiti verso l'esterno.",
        "Crea spazio: sposta il bacino di lato e spingi i suoi avambracci verso il basso e in fuori per allentare la presa.",
        "Gira verso il lato dove c'è spazio, esci dalla presa con un passo, mani alte, e allontanati verso l'uscita."
      ],
      "keys": [
        "Base bassa e larga subito: è la cosa più importante.",
        "Proteggi il collo: le sue braccia devono restare basse.",
        "Prima lo spazio, poi il giro: senza spazio il giro non riesce."
      ],
      "errors": [
        {
          "error": "Restare dritto con le gambe tese",
          "fix": "Piega le ginocchia appena senti la presa: in piedi dritto sei facile da sollevare e da spostare."
        },
        {
          "error": "Cercare di girarsi subito senza spazio",
          "fix": "Prima abbassati e sposta il bacino di lato per allentare la presa, poi gira verso il lato libero."
        },
        {
          "error": "Lasciar salire le sue braccia",
          "fix": "Tieni le mani sui suoi avambracci e il mento basso: braccia vicine al collo sono molto più pericolose."
        }
      ],
      "solo": "Prova la sequenza a vuoto davanti allo specchio: ginocchia giù e piedi larghi, mani su avambracci immaginari, bacino di lato, giro e passo. Lento, alternando i lati.",
      "partner": "Il partner abbraccia senza stringere forte e senza mai sollevarti; tu esegui lento. Niente proiezioni, niente braccia al collo. Lui lascia subito alla parola di stop.",
      "dose": "3 serie da 4 per lato, lente",
      "calls": [
        "Abbassati",
        "Base larga",
        "Gira ed esci"
      ]
    },
    {
      "id": "t-caduta-indietro",
      "phase": 4,
      "name": "Caduta all'indietro sicura",
      "purpose": "Ti insegna a cadere all'indietro senza battere la testa né farti male ai polsi: abbassi la caduta, arrotondi la schiena e distribuisci l'impatto con le braccia.",
      "when": "Quando una spinta o un inciampo ti fanno perdere l'equilibrio all'indietro. Si allena solo su un tappeto o una superficie morbida, iniziando sempre da seduto.",
      "frames": [
        "In piedi",
        "Accosciati, mento al petto",
        "Rotola sulla schiena"
      ],
      "steps": [
        "Parti in piedi su un tappeto morbido, braccia avanti, spazio libero dietro di te. Le prime volte parti da seduto.",
        "Accosciati: piega le ginocchia e porta il sedere vicino ai talloni, così la caduta parte da molto in basso.",
        "Porta il mento al petto e guarda la cintura: la testa non deve mai toccare terra.",
        "Siediti vicino ai talloni e rotola sulla schiena arrotondata, come un dondolo, fino all'altezza delle scapole.",
        "Mentre la schiena arriva a terra, braccia tese a circa 45 gradi dal corpo, palmi giù: toccano terra insieme alla schiena. Espira."
      ],
      "keys": [
        "Mento al petto per tutta la caduta: la testa non tocca mai.",
        "Mai le mani dietro per frenare: polsi e gomiti si fanno male.",
        "Schiena rotonda come un dondolo, non piatta.",
        "Se hai problemi a collo o schiena, fermati al dondolo da seduto."
      ],
      "errors": [
        {
          "error": "Mettere le mani dietro per frenare",
          "fix": "Tieni le braccia avanti mentre scendi e appoggiale a terra a 45 gradi solo quando arriva la schiena."
        },
        {
          "error": "Mento alto, testa che va indietro",
          "fix": "Guarda la cintura dall'inizio alla fine; se la testa va indietro, torna all'esercizio da seduto."
        },
        {
          "error": "Cadere rigido da in piedi",
          "fix": "Accosciati sempre prima: più parti dal basso, più la caduta è morbida. Aggiungi altezza solo quando è automatica."
        }
      ],
      "solo": "Solo su tappeto o materasso: da seduto dondola indietro e avanti 10 volte col mento al petto; poi parti da accosciato; da in piedi solo quando è facile.",
      "partner": "Il partner non spinge: osserva mento e mani e ti avvisa se la testa va indietro o le mani vanno dietro. Le spinte vere non servono a casa, senza materassini.",
      "dose": "3 serie da 5: da seduto, poi accosciato, poi in piedi",
      "calls": [
        "Caduta lenta",
        "Mento al petto"
      ],
      "shadow": false
    },
    {
      "id": "t-rialzarsi",
      "phase": 4,
      "name": "Rialzarsi in sicurezza",
      "purpose": "Ti rimette in piedi allontanandoti dall'altro, con una mano e un piede a terra e l'altra mano a proteggere: ti alzi all'indietro, non verso di lui.",
      "when": "Ogni volta che finisci a terra e l'altro è ancora vicino. Alzarsi in avanti a carponi ti lascia esposto: così arrivi in piedi già in guardia e a distanza.",
      "frames": [
        "Seduto, mano e piede a terra",
        "Solleva il bacino",
        "Porta la gamba dietro",
        "In piedi in guardia"
      ],
      "steps": [
        "Da seduto appoggia una mano a terra dietro di te, accanto al fianco, e il piede del lato opposto a terra vicino al sedere.",
        "L'altra mano sta alta davanti al viso e l'altra gamba piegata davanti a te, a protezione. Occhi sull'altro.",
        "Spingi con la mano e il piede a terra e solleva il bacino: ora sei in appoggio su tre punti.",
        "Porta la gamba libera indietro passandola sotto di te, tra la mano e il piede, e appoggiala ben dietro.",
        "Stacca la mano da terra e alzati in guardia, già a distanza; arretra di un passo e cerca l'uscita."
      ],
      "keys": [
        "Mano e piede a terra sono di lati opposti.",
        "Ti alzi all'indietro, allontanandoti: la testa non va verso di lui.",
        "Gli occhi restano sull'altro per tutto il movimento."
      ],
      "errors": [
        {
          "error": "Rialzarsi in avanti a carponi",
          "fix": "Con la testa avanti ti avvicini a lui e resti senza protezione: alzati all'indietro portando la gamba dietro."
        },
        {
          "error": "Mano e piede dello stesso lato",
          "fix": "Appoggia mano e piede di lati opposti, ad esempio mano destra e piede sinistro: la base è molto più stabile."
        },
        {
          "error": "Guardare a terra mentre ti alzi",
          "fix": "Tieni lo sguardo sull'altro e la mano libera alta: devi vedere se si avvicina mentre ti rialzi."
        }
      ],
      "solo": "Su un tappeto ripeti lentamente da seduto: mano e piede opposti, bacino su, gamba dietro, in piedi in guardia. Alterna i lati e controlla di finire più indietro di dove eri.",
      "partner": "Il partner sta in piedi a due metri e ti gira intorno lentamente; tu ti rialzi tenendolo d'occhio e finisci in guardia verso di lui. Nessun contatto, parola di stop.",
      "dose": "3 serie da 4 per lato, lente",
      "calls": [
        "A terra e rialzati",
        "In guardia"
      ],
      "shadowMax": 1
    },
    {
      "id": "t-spinta-spazio",
      "phase": 4,
      "name": "Spinta per creare spazio",
      "purpose": "Una spinta corta con i due palmi sul petto ti restituisce la distanza quando qualcuno è troppo vicino e non si ferma: subito dopo arretri in guardia ed esci.",
      "when": "Solo come ultima risorsa, quando l'altro continua a invadere il tuo spazio dopo che hai provato a parlare e ad arretrare. Se puoi andartene senza toccarlo, vai.",
      "frames": [
        "Troppo vicino",
        "Spinta con due palmi",
        "Arretra in guardia"
      ],
      "steps": [
        "È troppo vicino e non si ferma: sei in postura a mani aperte, piedi sfalsati, ginocchia piegate. Le mani sono già pronte.",
        "Spingi con i due palmi al centro del suo petto partendo da dove sono le mani, senza caricare le braccia all'indietro.",
        "La spinta parte dal piede dietro e dalle gambe e le braccia si distendono: è corta e decisa, mai un colpo.",
        "Usa il rimbalzo per arretrare subito con passo e richiamo, mani in guardia, e prendi distanza.",
        "Allontanati verso l'uscita dicendo ad alta voce «Stai indietro!»: la spinta serve solo a creare lo spazio per andare."
      ],
      "keys": [
        "Palmi aperti al centro del petto, mai al viso o alla gola.",
        "Parte dalle gambe e dalle mani già alte: niente caricamento.",
        "Dopo la spinta si arretra sempre, non si avanza."
      ],
      "errors": [
        {
          "error": "Caricare il braccio all'indietro",
          "fix": "Spingi da dove sono già le mani: se carichi, lui capisce cosa stai per fare e perdi tempo."
        },
        {
          "error": "Spingere solo con le braccia",
          "fix": "Pianta il piede dietro e spingi con le gambe: con le sole braccia la spinta è debole e ti sbilancia."
        },
        {
          "error": "Restare lì o avanzare dopo la spinta",
          "fix": "Arretra subito di due passi in guardia: lo spazio che hai creato serve per andartene, non per continuare."
        }
      ],
      "solo": "Contro il muro: appoggia i palmi, spingi lentamente partendo dalle gambe e arretra subito in guardia. Allo specchio controlla che le mani partano dal petto senza caricare.",
      "partner": "Il partner tiene un cuscino contro il petto, piedi sfalsati e spazio libero dietro; tu spingi al 30% della forza e arretri. Mai senza cuscino, parola di stop concordata.",
      "dose": "3 serie da 6 spinte lente",
      "calls": [
        "Spingi e arretra",
        "Stai indietro"
      ]
    },
    {
      "id": "t-sequenza-uscita",
      "phase": 4,
      "name": "Sequenza di uscita",
      "purpose": "Mette insieme le tecniche in un'unica risposta fluida: mani aperte per calmare, parata se arriva un braccio, passo laterale fuori linea e poi via verso l'uscita.",
      "when": "Quando una situazione tesa diventa fisica nonostante i tentativi di calmarla. È il riassunto del metodo: proteggerti per un istante e usare quell'istante per andare via.",
      "frames": [
        "Mani aperte",
        "Parata",
        "Passo laterale",
        "Via"
      ],
      "steps": [
        "Mani aperte: postura a mani aperte, distanza di un braccio più un passo, voce calma. Individua subito dov'è l'uscita.",
        "Parata: se arriva un braccio dritto o una spinta, devialo con la parata esterna o interna e riporta subito le mani alte.",
        "Passo laterale: nello stesso movimento esci dalla linea con mezzo passo di lato e torna di fronte a lui, in guardia.",
        "Via: arretra prendendo distanza verso l'uscita; quando sei fuori portata girati, allontanati in fretta e cerca aiuto."
      ],
      "keys": [
        "Parata e passo sono un unico movimento, senza pausa.",
        "L'uscita si sceglie prima, quando sei ancora a mani aperte.",
        "Ti giri per correre solo quando sei fuori portata."
      ],
      "errors": [
        {
          "error": "Fermarsi dopo la parata",
          "fix": "Collega subito il passo laterale: se ti fermi, il secondo braccio o la seconda spinta ti trovano ancora sulla linea."
        },
        {
          "error": "Girare la schiena quando è ancora vicino",
          "fix": "Prima esci di lato e arretra fino a essere fuori portata, poi girati e vai."
        },
        {
          "error": "Scappare verso un angolo o un muro",
          "fix": "Guarda dov'è l'uscita già nella fase a mani aperte e muoviti sempre in quella direzione."
        }
      ],
      "solo": "Fai la sequenza a vuoto in una stanza sgombra, scegliendo ogni volta un'uscita diversa (una porta, un corridoio). Prima lentissimo, poi a ritmo medio, sempre controllato.",
      "partner": "Il partner parla, si avvicina e allunga lentamente un braccio aperto verso la tua spalla, al 30%; tu esegui tutta la sequenza. Spazio sgombro, parola di stop concordata.",
      "dose": "5 sequenze lente per lato, poi 5 a ritmo medio",
      "calls": [
        "Sequenza completa",
        "Parata e passo",
        "Vai verso l'uscita"
      ]
    }
  ],
  "warmup": [
    {
      "id": "w-respiro",
      "name": "Respirazione calma",
      "how": "In piedi, spalle rilassate: inspira dal naso per 4 secondi, espira lentamente dalla bocca per 6. È il respiro che ti aiuta a restare lucido.",
      "seconds": 40
    },
    {
      "id": "w-spalle",
      "name": "Rotazioni delle spalle",
      "how": "Braccia rilassate lungo i fianchi: disegna cerchi ampi con le spalle, metà tempo in avanti e metà all'indietro.",
      "seconds": 30
    },
    {
      "id": "w-braccia",
      "name": "Cerchi e aperture delle braccia",
      "how": "Braccia tese di lato, cerchi piccoli che diventano grandi; poi apri e chiudi le braccia davanti al petto stringendo le scapole.",
      "seconds": 40
    },
    {
      "id": "w-collo",
      "name": "Mobilità del collo",
      "how": "Porta lentamente il mento al petto e torna, poi gira la testa a destra e a sinistra. Niente cerchi completi e niente scatti.",
      "seconds": 30
    },
    {
      "id": "w-anche",
      "name": "Cerchi con il bacino",
      "how": "Mani sui fianchi, piedi alla larghezza delle spalle: disegna cerchi ampi con il bacino, metà tempo in un senso e metà nell'altro.",
      "seconds": 30
    },
    {
      "id": "w-caviglie",
      "name": "Rotazioni delle caviglie",
      "how": "Appoggia la punta di un piede a terra e ruota la caviglia nei due sensi; a metà tempo cambia piede. Se serve, tieniti a una sedia.",
      "seconds": 30
    },
    {
      "id": "w-squat",
      "name": "Squat lenti",
      "how": "Piedi alla larghezza delle spalle, talloni a terra: scendi lentamente fin dove sei comodo e risali spingendo dai piedi, schiena lunga.",
      "seconds": 40
    },
    {
      "id": "w-affondi",
      "name": "Affondi indietro alternati",
      "how": "Fai un passo indietro e piega le ginocchia finché il ginocchio dietro si avvicina a terra, poi torna. Alterna le gambe, lento e controllato.",
      "seconds": 40
    },
    {
      "id": "w-molleggio",
      "name": "Molleggio sugli avampiedi",
      "how": "Piccoli saltelli leggeri sugli avampiedi, ginocchia morbide. Alternativa senza salti: alza e abbassa i talloni alternati, sul posto.",
      "seconds": 30
    },
    {
      "id": "w-shadow",
      "name": "Shadow leggero",
      "how": "In guardia, passo e richiamo avanti, indietro e di lato, mani alte, a metà velocità. Respira e controlla che i piedi non si incrocino.",
      "seconds": 60
    }
  ],
  "sessions": [
    {
      "id": "s01",
      "phase": 1,
      "title": "Mani aperte e guardia",
      "goal": "Impari le due posizioni di partenza di tutto il metodo: mani aperte per calmare e proteggerti senza provocare, guardia per coprire la testa quando serve.",
      "warmup": [
        "w-respiro",
        "w-spalle",
        "w-collo",
        "w-caviglie",
        "w-shadow"
      ],
      "techniques": [
        "t-postura-aperta",
        "t-guardia"
      ],
      "rounds": {
        "count": 2,
        "work": 60,
        "rest": 30
      },
      "check": [
        "Le mani sono rimaste aperte e all'altezza del petto?",
        "In guardia il mento è rimasto basso per tutto il round?",
        "I gomiti sono rimasti stretti vicino ai fianchi?",
        "Hai respirato con calma, senza trattenere il fiato?"
      ]
    },
    {
      "id": "s02",
      "phase": 1,
      "title": "Passi base e passo laterale",
      "goal": "Impari a muoverti senza mai perdere equilibrio e guardia: passo e richiamo avanti e indietro, e mezzo passo di lato per uscire dalla linea.",
      "warmup": [
        "w-respiro",
        "w-caviglie",
        "w-anche",
        "w-squat",
        "w-shadow"
      ],
      "techniques": [
        "t-passi-base",
        "t-passo-laterale"
      ],
      "rounds": {
        "count": 2,
        "work": 60,
        "rest": 30
      },
      "check": [
        "I piedi non si sono mai incrociati né uniti?",
        "Le mani sono rimaste alte mentre ti muovevi?",
        "Dopo il passo laterale sei tornato subito di fronte all'altro?",
        "I passi sono rimasti corti e la testa alla stessa altezza?"
      ]
    },
    {
      "id": "s03",
      "phase": 1,
      "title": "Distanza e ripasso delle fondamenta",
      "goal": "Impari a tenere fuori portata chi si avvicina e unisci il lavoro della fase: mani aperte, passi e uscita laterale in un unico modo di muoverti.",
      "warmup": [
        "w-respiro",
        "w-spalle",
        "w-anche",
        "w-affondi",
        "w-shadow"
      ],
      "techniques": [
        "t-distanza",
        "t-postura-aperta",
        "t-passo-laterale"
      ],
      "rounds": {
        "count": 3,
        "work": 60,
        "rest": 30
      },
      "check": [
        "Sei rimasto sempre a un braccio più un passo di distanza?",
        "Hai arretrato girando invece che in linea retta?",
        "Le mani aperte sono rimaste tra te e l'altro?",
        "Hai tenuto d'occhio l'uscita mentre ti muovevi?"
      ]
    },
    {
      "id": "s04",
      "phase": 2,
      "title": "Parate esterna e interna",
      "goal": "Impari a deviare un braccio dritto o una spinta con l'avambraccio e con il palmo, con movimenti corti, e a collegare la parata all'uscita di lato.",
      "warmup": [
        "w-respiro",
        "w-spalle",
        "w-braccia",
        "w-caviglie",
        "w-shadow"
      ],
      "techniques": [
        "t-parata-esterna",
        "t-parata-interna"
      ],
      "rounds": {
        "count": 3,
        "work": 75,
        "rest": 30
      },
      "check": [
        "La parata esterna si è fermata alla linea della spalla?",
        "Nella parata interna hai usato il palmo con le dita unite?",
        "L'altra mano è rimasta alta durante ogni parata?",
        "Dopo la parata interna hai fatto subito il passo laterale?"
      ]
    },
    {
      "id": "s05",
      "phase": 2,
      "title": "Copertura alta e schivata",
      "goal": "Impari a chiudere la testa contro colpi larghi e confusi muovendoti di lato, e a togliere la testa dalla linea con una piccola schivata seguita dal passo.",
      "warmup": [
        "w-respiro",
        "w-collo",
        "w-anche",
        "w-squat",
        "w-shadow"
      ],
      "techniques": [
        "t-copertura-alta",
        "t-schivata"
      ],
      "rounds": {
        "count": 3,
        "work": 75,
        "rest": 30
      },
      "check": [
        "In copertura hai tenuto gli occhi aperti?",
        "In copertura ti sei mosso con passi corti invece di restare fermo?",
        "Nella schivata hai piegato le ginocchia e non la schiena?",
        "Dopo ogni schivata è arrivato subito il passo laterale?"
      ]
    },
    {
      "id": "s06",
      "phase": 2,
      "title": "Proteggersi in combinazione",
      "goal": "Colleghi le protezioni della fase: parate esterna e interna e copertura alta, scegliendo quella giusta al comando e uscendo sempre dalla linea.",
      "warmup": [
        "w-respiro",
        "w-spalle",
        "w-braccia",
        "w-affondi",
        "w-shadow"
      ],
      "techniques": [
        "t-parata-esterna",
        "t-parata-interna",
        "t-copertura-alta"
      ],
      "rounds": {
        "count": 3,
        "work": 90,
        "rest": 30
      },
      "check": [
        "Hai cambiato protezione al comando senza esitare?",
        "Dopo ogni protezione sei tornato subito in guardia?",
        "Ti sei spostato fuori linea invece di restare fermo a parare?",
        "Le parate sono rimaste corte anche quando eri stanco?"
      ]
    },
    {
      "id": "s07",
      "phase": 3,
      "title": "Liberarsi dal polso",
      "goal": "Impari a liberarti da una presa al polso a una e a due mani sfruttando il punto debole, i pollici, e a creare subito distanza dopo la liberazione.",
      "warmup": [
        "w-respiro",
        "w-spalle",
        "w-braccia",
        "w-squat",
        "w-shadow"
      ],
      "techniques": [
        "t-polso-una-mano",
        "t-polso-due-mani"
      ],
      "rounds": {
        "count": 3,
        "work": 90,
        "rest": 30
      },
      "check": [
        "Sei uscito sempre verso il pollice di chi afferrava?",
        "Il gomito è andato verso il fianco insieme al passo indietro?",
        "Nella presa a due mani hai usato anche le gambe per tirare?",
        "Dopo ogni liberazione hai alzato le mani e preso distanza?"
      ]
    },
    {
      "id": "s08",
      "phase": 3,
      "title": "Spinta al petto e abbraccio da dietro",
      "goal": "Impari a non farti sbilanciare né sollevare: base larga contro la spinta al petto, baricentro basso contro l'abbraccio da dietro, poi uscita.",
      "warmup": [
        "w-respiro",
        "w-anche",
        "w-caviglie",
        "w-squat",
        "w-affondi",
        "w-shadow"
      ],
      "techniques": [
        "t-spinta-petto",
        "t-presa-da-dietro"
      ],
      "rounds": {
        "count": 3,
        "work": 90,
        "rest": 30
      },
      "check": [
        "Contro la spinta hai portato subito un piede dietro?",
        "Le mani sono salite davanti al viso già all'inizio?",
        "Nell'abbraccio da dietro hai abbassato subito il baricentro?",
        "Hai creato spazio prima di girarti per uscire?"
      ]
    },
    {
      "id": "s09",
      "phase": 3,
      "title": "Liberarsi e uscire",
      "goal": "Ripassi le liberazioni della fase con un'unica regola: ogni presa finisce con passo indietro, mani alte e distanza verso l'uscita.",
      "warmup": [
        "w-respiro",
        "w-spalle",
        "w-anche",
        "w-squat",
        "w-shadow"
      ],
      "techniques": [
        "t-polso-una-mano",
        "t-spinta-petto",
        "t-presa-da-dietro"
      ],
      "rounds": {
        "count": 4,
        "work": 90,
        "rest": 30
      },
      "check": [
        "Hai riconosciuto ogni presa al comando senza esitare?",
        "Ogni liberazione è finita con passo indietro e mani alte?",
        "Hai usato tutto il corpo invece della sola forza delle braccia?",
        "Sei rimasto lento e controllato anche negli ultimi round?"
      ]
    },
    {
      "id": "s10",
      "phase": 4,
      "title": "Cadere e rialzarsi",
      "goal": "Impari a cadere all'indietro proteggendo testa e polsi e a rialzarti allontanandoti, fino a tornare in piedi in guardia e a distanza.",
      "warmup": [
        "w-respiro",
        "w-collo",
        "w-anche",
        "w-caviglie",
        "w-squat",
        "w-shadow"
      ],
      "techniques": [
        "t-caduta-indietro",
        "t-rialzarsi"
      ],
      "rounds": {
        "count": 3,
        "work": 90,
        "rest": 45
      },
      "check": [
        "Il mento è rimasto al petto in ogni caduta?",
        "Hai evitato di mettere le mani dietro per frenare?",
        "Ti sei rialzato con mano e piede di lati opposti?",
        "Sei arrivato in piedi già in guardia e a distanza?"
      ]
    },
    {
      "id": "s11",
      "phase": 4,
      "title": "Spazio e sequenza di uscita",
      "goal": "Impari a usare la spinta come ultima risorsa per creare spazio e a collegare mani aperte, parata, passo laterale e uscita in un'unica risposta.",
      "warmup": [
        "w-respiro",
        "w-spalle",
        "w-braccia",
        "w-affondi",
        "w-shadow"
      ],
      "techniques": [
        "t-spinta-spazio",
        "t-sequenza-uscita"
      ],
      "rounds": {
        "count": 4,
        "work": 100,
        "rest": 30
      },
      "check": [
        "La spinta è partita da dove erano le mani, senza caricare?",
        "Dopo la spinta hai arretrato subito in guardia?",
        "Parata e passo laterale sono stati un unico movimento?",
        "Hai scelto la direzione d'uscita prima di muoverti?"
      ]
    },
    {
      "id": "s12",
      "phase": 4,
      "title": "Prova finale: uscita completa",
      "goal": "Metti alla prova tutto il percorso: sequenza di uscita completa, spinta per creare spazio e rialzarsi da terra, in round più lunghi ma sempre controllati.",
      "warmup": [
        "w-respiro",
        "w-spalle",
        "w-anche",
        "w-squat",
        "w-molleggio",
        "w-shadow"
      ],
      "techniques": [
        "t-sequenza-uscita",
        "t-spinta-spazio",
        "t-rialzarsi"
      ],
      "rounds": {
        "count": 4,
        "work": 120,
        "rest": 40
      },
      "check": [
        "Hai eseguito ogni comando con tecnica pulita anche da stanco?",
        "Ogni azione è finita con distanza e mani alte?",
        "Ti sei rialzato tenendo lo sguardo sull'altro?",
        "Hai mantenuto calma e respiro regolare per tutti i round?"
      ]
    }
  ]
};
