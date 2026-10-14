/*
 * Progetto A - Cultura: le schede della biblioteca (8 aree).
 * Ogni scheda: testo a sezioni, fatti da ricordare, collegamenti, 5 domande
 * (dato, comprensione, applicazione, collegamento) con spiegazione, e la
 * spiegazione con parole proprie. Schema controllato da tests/culture.test.js.
 */
window.CultureCards = [
  {
    "id": "storia-impero-romano-caduta",
    "area": "storia",
    "title": "La caduta dell'Impero romano d'Occidente",
    "level": 2,
    "minutes": 5,
    "hook": "Nel 476 l'ultimo imperatore romano d'Occidente fu deposto e nessuno prese il suo posto, ma quasi nessuna fonte dell'epoca vi vide la fine di un mondo: l'Impero d'Oriente durò quasi altri mille anni.",
    "sections": [
      {
        "h": "476: una fine quasi senza rumore",
        "text": "Nel 476 Odoacre, un capo militare germanico al comando delle truppe federate in Italia, sconfisse e uccise il generale Oreste e depose a Ravenna suo figlio, il giovane imperatore Romolo Augustolo, senza nominare nessun successore. Mandò le insegne imperiali a Costantinopoli, riconobbe l'autorità dell'imperatore d'Oriente e governò l'Italia con il titolo di re. Il Senato continuò a riunirsi e l'amministrazione romana a funzionare. Per questo il 476 è una data convenzionale, scelta in seguito dagli storici: per chi la visse fu un cambio di governo tra i tanti, in un Occidente che da decenni perdeva pezzi. La parte orientale dell'Impero, con capitale Costantinopoli, sopravvisse invece fino alla conquista ottomana del 1453."
      },
      {
        "h": "Il circolo vizioso tra tasse ed esercito",
        "text": "Il cuore del problema era fiscale. L'esercito assorbiva la parte maggiore delle entrate dello Stato, che venivano soprattutto dalle tasse sulla terra delle province. Nel 376 i Goti, in fuga dagli Unni, attraversarono il Danubio, e l'Impero si trovò ad avere sul proprio territorio popoli armati che non riusciva né a respingere né a integrare del tutto. Ad Adrianopoli, nel 378, l'imperatore Valente morì combattendo contro di loro. Da allora Roma si affidò sempre di più a eserciti federati, pagati con terre e tributi. Ogni provincia perduta riduceva le tasse; meno tasse significavano meno soldati propri e più dipendenza da alleati poco affidabili, e questo portava a nuove perdite. Le guerre civili tra generali e usurpatori consumavano intanto le forze migliori."
      },
      {
        "h": "Un esempio: la perdita dell'Africa",
        "text": "Nel 439 i Vandali di Genserico conquistarono Cartagine, nell'attuale Tunisia, e con essa il cuore dell'Africa romana, la regione più ricca dell'Occidente: forniva grano a Roma e una quota decisiva delle entrate fiscali. Nel 455, partiti proprio dall'Africa, i Vandali misero a sacco Roma, già saccheggiata nel 410 dai Visigoti di Alarico. Nel 468 una grande spedizione congiunta di Oriente e Occidente per riprendere l'Africa fallì. Senza quelle risorse gli ultimi imperatori d'Occidente diventarono figure deboli, spesso messe sul trono e poi rimosse da generali come Ricimero. Quando Odoacre depose Romolo Augustolo, il potere reale era già da tempo nelle mani dei comandanti militari."
      },
      {
        "h": "Caduta o trasformazione?",
        "text": "Sulle cause gli storici discutono da secoli: negli anni Ottanta del Novecento lo storico tedesco Alexander Demandt ne contò più di duecento, proposte nel corso del tempo. Edward Gibbon, alla fine del Settecento, insisteva sulla perdita delle virtù civiche e sul ruolo del cristianesimo. Dagli anni Settanta del Novecento molti studiosi, sulla scia di Peter Brown, hanno preferito parlare di 'tarda antichità', un'epoca di trasformazione più che di crollo, in cui Chiesa, diritto e cultura latina continuarono. Altri, come Bryan Ward-Perkins, ricordano con i dati dell'archeologia che in Occidente la vita materiale, dalla qualità della ceramica alla circolazione delle monete, peggiorò davvero. La lezione utile oggi è diffidare delle spiegazioni con una causa sola: i sistemi complessi cedono quando più debolezze si rinforzano a vicenda."
      }
    ],
    "facts": [
      "476: Odoacre depone Romolo Augustolo, ultimo imperatore d'Occidente; è una data convenzionale.",
      "378: ad Adrianopoli i Goti sconfiggono e uccidono l'imperatore Valente.",
      "410 e 455: sacchi di Roma da parte di Visigoti e Vandali.",
      "439: i Vandali prendono Cartagine e l'Occidente perde la sua regione più ricca.",
      "L'Impero d'Oriente sopravvive fino al 1453."
    ],
    "links": [
      "mente-machiavelli-principe",
      "economia-utile-cassa",
      "mente-bias-cognitivi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Chi depose nel 476 Romolo Augustolo, considerato l'ultimo imperatore romano d'Occidente?",
        "options": [
          "Alarico",
          "Genserico",
          "Odoacre",
          "Attila"
        ],
        "answer": 2,
        "why": "Odoacre, comandante delle truppe federate in Italia, non nominò un successore e governò come re. Alarico guidò il sacco del 410, Genserico quello del 455."
      },
      {
        "type": "comprensione",
        "q": "Perché la perdita di province innescava un circolo vizioso per l'Impero d'Occidente?",
        "options": [
          "Meno province volevano dire meno tasse, quindi meno soldati e più dipendenza dai federati",
          "Le province perdute smettevano di mandare senatori a Roma, bloccando le leggi",
          "I popoli germanici rifiutavano di commerciare con le città rimaste romane",
          "Ogni sconfitta faceva perdere all'imperatore il sostegno ufficiale della Chiesa"
        ],
        "answer": 0,
        "why": "L'esercito viveva delle tasse sulla terra: perdere territori significava perdere entrate, e con meno entrate diventava più difficile difendere ciò che restava."
      },
      {
        "type": "comprensione",
        "q": "Perché molti storici considerano il 476 una data 'convenzionale'?",
        "options": [
          "Perché Romolo Augustolo continuò a regnare per molti anni dopo il 476",
          "Perché per i contemporanei fu un cambio di potere tra tanti e le istituzioni continuarono",
          "Perché le fonti antiche non registrano nulla di ciò che accadde quell'anno",
          "Perché Roma era già stata conquistata dagli Unni di Attila alcuni anni prima"
        ],
        "answer": 1,
        "why": "Odoacre mandò le insegne a Costantinopoli e il Senato continuò a riunirsi: la 'fine' è una scelta degli storici successivi, utile per dividere le epoche."
      },
      {
        "type": "applicazione",
        "q": "Un'azienda in crisi riduce la propria rete commerciale e affida i clienti più importanti ad agenti esterni che lavorano anche per altri. Quale rischio richiama la storia dell'Occidente romano?",
        "options": [
          "Che gli agenti costino sempre più di quanto costavano i dipendenti",
          "Che la legge vieti di affidare a esterni i clienti più importanti",
          "Che i clienti chiedano subito sconti più alti agli agenti esterni",
          "Che chi gestisce davvero i clienti finisca per contare più dell'azienda"
        ],
        "answer": 3,
        "why": "A Roma i comandanti dei federati, come Ricimero e Odoacre, finirono per fare e disfare gli imperatori: chi svolge una funzione vitale accumula potere."
      },
      {
        "type": "collegamento",
        "q": "Machiavelli nel Principe sostiene che affidare la propria difesa a milizie mercenarie è pericoloso per uno Stato. Quale aspetto della crisi dell'Occidente romano si accorda meglio con questa tesi?",
        "options": [
          "La conversione dell'Impero al cristianesimo sotto Costantino",
          "La scelta di fondare una nuova capitale a Costantinopoli",
          "La dipendenza da eserciti federati, il cui capo depose l'imperatore",
          "L'abbandono del latino a favore del greco nell'amministrazione"
        ],
        "answer": 2,
        "why": "Lo stesso Machiavelli, nel Principe, indica come prima causa della rovina dell'Impero romano l'aver cominciato ad assoldare i Goti."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega perché l'Impero romano d'Occidente non è 'caduto' in un giorno.",
      "model": "Il 476 è solo il momento in cui un generale, Odoacre, depose l'ultimo imperatore e non ne nominò un altro. Il declino era cominciato molto prima: l'Impero viveva delle tasse sulla terra per pagare l'esercito, e ogni provincia perduta riduceva le entrate e quindi la capacità di difendersi. Roma si affidò sempre più a truppe federate, i cui capi finirono per avere il potere reale. La perdita dell'Africa nel 439 tolse all'Occidente la sua regione più ricca, e da lì non si riprese.",
      "points": [
        "Il 476 è una data convenzionale, non un crollo improvviso",
        "Circolo vizioso tra province perdute, tasse ed esercito",
        "Dipendenza da eserciti federati che presero il potere reale"
      ]
    }
  },
  {
    "id": "storia-rinascimento-firenze",
    "area": "storia",
    "title": "Il Rinascimento a Firenze: banche, mecenati e genio",
    "level": 1,
    "minutes": 5,
    "hook": "La cupola del Duomo di Firenze, ancora oggi la più grande in mattoni mai costruita, fu un cantiere gestito dalla corporazione dei mercanti di lana: il Rinascimento è anche una storia di soldi.",
    "sections": [
      {
        "h": "Una città di lana e di fiorini",
        "text": "Nel Trecento e nel Quattrocento la ricchezza di Firenze veniva soprattutto da due attività: la lavorazione della lana e la finanza. Le Arti, cioè le corporazioni di mestiere, controllavano l'economia e buona parte della vita politica della Repubblica. Il fiorino d'oro, coniato dal 1252, era una moneta così stabile e affidabile che circolava in tutta Europa come moneta di riferimento. I banchieri fiorentini prestavano denaro a re e papi, trasferivano fondi da una piazza all'altra con le lettere di cambio, senza spostare monete, e tenevano i conti in partita doppia, una tecnica che il frate toscano Luca Pacioli avrebbe descritto in un trattato a stampa nel 1494."
      },
      {
        "h": "I Medici: la banca e il potere",
        "text": "Giovanni di Bicci de' Medici fondò il Banco Medici nel 1397. Suo figlio Cosimo, detto poi il Vecchio, estese la rete di filiali fino a Bruges e Londra, mentre la gestione delle finanze del papato restava l'affare più redditizio del banco. Nel 1434, rientrato dall'esilio, Cosimo guidò Firenze per trent'anni senza mai assumere un titolo: la Repubblica restava formalmente in piedi, ma le cariche andavano agli amici della famiglia. Il nipote Lorenzo il Magnifico sopravvisse nel 1478 alla congiura dei Pazzi, in cui fu ucciso suo fratello Giuliano, e guidò la città fino alla morte, nel 1492. Il potere dei Medici si reggeva su denaro, clientele e prestigio, e il prestigio si costruiva anche con l'arte."
      },
      {
        "h": "Perché i ricchi pagavano gli artisti",
        "text": "Il mecenatismo non era solo amore per il bello. Per una famiglia di banchieri finanziare chiese, conventi e opere d'arte era un modo per trasformare il denaro in reputazione, mostrare la propria potenza senza ostentare un titolo e, secondo la mentalità del tempo, riscattarsi dal sospetto di usura, che la Chiesa condannava. Cosimo pagò, tra l'altro, la ricostruzione del convento di San Marco. Anche le Arti competevano a colpi di commissioni. Nel 1401 l'Arte di Calimala bandì un concorso per le porte del Battistero: vinse Lorenzo Ghiberti, battendo tra gli altri Filippo Brunelleschi. In seguito Brunelleschi si dedicò soprattutto all'architettura. Il cantiere della cattedrale era gestito dall'Opera del Duomo, controllata dall'Arte della Lana: fu lì che, dal 1420, Brunelleschi costruì la cupola senza le centine, le grandi armature di legno che di solito reggevano le volte in costruzione, grazie a una doppia calotta e a mattoni disposti a spina di pesce. Fu chiusa nel 1436."
      },
      {
        "h": "Il genio come ecosistema",
        "text": "Firenze non produsse tanti grandi artisti per caso. Concentrava capitali, committenti in competizione tra loro, botteghe dove gli apprendisti imparavano lavorando accanto ai maestri, come Leonardo in quella del Verrocchio, e umanisti che riscoprivano i testi antichi. Le idee circolavano in fretta in una città che si attraversava a piedi. Anche la fine racconta qualcosa: il Banco Medici entrò in crisi per i prestiti a sovrani che non rimborsavano, come il re d'Inghilterra Edoardo IV, e per una gestione sempre meno attenta delle filiali; crollò nel 1494, quando i Medici furono cacciati da Firenze. Il modello resta attuale: i poli dell'innovazione nascono dove si incontrano denaro, competizione e talenti, e possono sfiorire quando il rischio viene gestito male."
      }
    ],
    "facts": [
      "Fiorino d'oro: coniato dal 1252, moneta di riferimento in Europa.",
      "1397: Giovanni di Bicci de' Medici fonda il Banco Medici.",
      "1434-1464: Cosimo il Vecchio guida Firenze senza titoli ufficiali.",
      "1420-1436: Brunelleschi costruisce la cupola del Duomo senza centine.",
      "1478: congiura dei Pazzi; 1492: muore Lorenzo il Magnifico."
    ],
    "links": [
      "arte-prospettiva",
      "economia-utile-cassa",
      "mente-machiavelli-principe"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Chi vinse nel 1401 il concorso per le porte del Battistero di Firenze?",
        "options": [
          "Filippo Brunelleschi",
          "Lorenzo Ghiberti",
          "Donatello",
          "Andrea del Verrocchio"
        ],
        "answer": 1,
        "why": "Ghiberti batté Brunelleschi, che si dedicò poi all'architettura e realizzò la cupola del Duomo."
      },
      {
        "type": "comprensione",
        "q": "Perché una famiglia di banchieri come i Medici finanziava chiese e opere d'arte?",
        "options": [
          "Perché la legge fiorentina obbligava le banche a spendere in arte parte degli utili",
          "Perché le opere d'arte erano l'investimento finanziario più redditizio del tempo",
          "Per trasformare il denaro in prestigio e consenso, anche contro il sospetto di usura",
          "Perché la Chiesa accettava pagamenti solo in opere d'arte e non in fiorini"
        ],
        "answer": 2,
        "why": "Il mecenatismo era anche uno strumento politico: costruiva reputazione e clientele per una famiglia che governava senza titoli ufficiali."
      },
      {
        "type": "comprensione",
        "q": "Come governò Firenze Cosimo de' Medici dopo il 1434?",
        "options": [
          "Senza titoli, lasciando in piedi la Repubblica e controllando chi otteneva le cariche",
          "Come duca ereditario, nominato dall'imperatore dopo il ritorno dall'esilio",
          "Come signore assoluto, dopo aver sciolto le Arti e i consigli cittadini",
          "Come capo della Chiesa fiorentina, unendo potere religioso e politico"
        ],
        "answer": 0,
        "why": "Il suo era un potere informale fondato su denaro e clientele: le istituzioni repubblicane restavano, ma le cariche andavano agli amici della famiglia."
      },
      {
        "type": "applicazione",
        "q": "Una regione vuole diventare un polo d'eccellenza nel design. Quale lezione della Firenze del Quattrocento è più utile?",
        "options": [
          "Attirare un singolo genio molto famoso, che da solo trascini tutto il settore",
          "Proteggere le imprese locali dalla concorrenza, che disperde le energie",
          "Puntare solo sul finanziamento pubblico, perché i privati cercano solo il profitto",
          "Concentrare capitali, committenti in competizione e luoghi dove i giovani imparano dai maestri"
        ],
        "answer": 3,
        "why": "Il Rinascimento fiorentino fu un ecosistema: denaro, competizione tra committenti e botteghe come scuole produssero molti talenti, non uno solo."
      },
      {
        "type": "collegamento",
        "q": "Il Banco Medici era redditizio, ma entrò in crisi anche per prestiti a sovrani che non rimborsavano. Quale principio aziendale illustra?",
        "options": [
          "Un'impresa in utile può fallire se i crediti non diventano cassa",
          "Un'impresa fallisce solo quando i costi superano stabilmente i ricavi",
          "Una banca non può fallire se i suoi clienti sono re e governi",
          "Gli utili di una banca dipendono soprattutto dal numero di filiali"
        ],
        "answer": 0,
        "why": "Un credito verso un re che non paga vale poco: senza incassi reali, anche una banca famosa resta senza liquidità."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché il Rinascimento è nato proprio a Firenze.",
      "model": "Firenze era ricca grazie alla lana e alla finanza: il fiorino circolava in tutta Europa e banchieri come i Medici prestavano a re e papi. Famiglie e corporazioni competevano per il prestigio, e l'arte era il modo più visibile per trasformare il denaro in reputazione e consenso. Questa domanda di opere alimentava botteghe dove i giovani imparavano dai maestri, in una città piccola dove le idee circolavano in fretta. Il genio, insomma, crebbe in un ecosistema fatto di soldi, competizione e talenti.",
      "points": [
        "Ricchezza da lana e banca",
        "Mecenatismo come investimento in prestigio e potere",
        "Concentrazione di committenti, botteghe e talenti in competizione"
      ]
    }
  },
  {
    "id": "storia-rivoluzione-industriale",
    "area": "storia",
    "title": "La rivoluzione industriale: perché iniziò in Inghilterra",
    "level": 1,
    "minutes": 5,
    "hook": "Per millenni il reddito medio di una persona è rimasto quasi fermo; poi, dalla fine del Settecento e partendo dall'Inghilterra, ha cominciato a crescere generazione dopo generazione.",
    "sections": [
      {
        "h": "Dall'energia dei muscoli a quella del carbone",
        "text": "Prima della rivoluzione industriale quasi tutta l'energia disponibile veniva da muscoli umani e animali, dal legno, dall'acqua e dal vento. La produzione cresceva, ma la popolazione cresceva con lei e il reddito per persona restava più o meno lo stesso. La svolta, iniziata in Gran Bretagna nella seconda metà del Settecento, fu usare il carbone per alimentare le macchine. La macchina a vapore di Thomas Newcomen, del 1712, serviva a pompare l'acqua dalle miniere; James Watt, con il condensatore separato brevettato nel 1769, la rese molto più efficiente e, con i perfezionamenti successivi, adatta a muovere macchinari di ogni tipo. Con il carbone l'energia smise di dipendere dalla terra coltivabile e dai boschi."
      },
      {
        "h": "Perché proprio in Inghilterra",
        "text": "Le spiegazioni principali sono diverse e in parte complementari. Lo storico economico Robert Allen insiste sui prezzi: in Inghilterra i salari erano alti e il carbone, abbondante e vicino alla superficie, era economico. Sostituire lavoro costoso con macchine alimentate da energia a buon mercato conveniva lì più che altrove, per esempio più che in India o in Cina, dove la manodopera costava meno. Joel Mokyr sottolinea invece la cultura scientifica e la circolazione delle conoscenze tra studiosi e artigiani. Altri, come Kenneth Pomeranz, danno peso alla posizione dei giacimenti di carbone e alle risorse delle colonie. Contavano anche un sistema di brevetti, mercati ampi e istituzioni che tutelavano la proprietà."
      },
      {
        "h": "Un esempio: il cotone e la fabbrica",
        "text": "Il settore che cambiò per primo fu il tessile. La spinning jenny di James Hargreaves, intorno al 1764, permetteva a un solo operaio di filare più fili insieme; il filatoio idraulico di Richard Arkwright, brevettato nel 1769, portò la filatura nelle fabbriche. A Cromford, nel 1771, Arkwright aprì una filanda mossa dall'acqua, con turni regolari e centinaia di lavoratori, molti dei quali bambini. Il lavoro passò dalla casa alla fabbrica, scandito dall'orologio e dal ritmo delle macchine. Le condizioni erano dure: solo con il Factory Act del 1833 il Parlamento britannico vietò il lavoro nelle fabbriche tessili ai bambini sotto i nove anni e istituì ispettori incaricati dei controlli. Nel 1830 la ferrovia Liverpool-Manchester collegò il porto in cui arrivava il cotone alla città delle filande, con treni a vapore."
      },
      {
        "h": "Vincitori, perdenti e lezioni per oggi",
        "text": "Nel lungo periodo la rivoluzione industriale ha moltiplicato il reddito medio e la speranza di vita. Nel breve, però, i guadagni non furono distribuiti in modo uniforme: gli storici discutono ancora se le condizioni dei lavoratori britannici siano migliorate o peggiorate nei primi decenni, e molti ritengono che i salari reali siano cresciuti nettamente solo dagli anni Trenta e Quaranta dell'Ottocento. I luddisti, tra il 1811 e il 1816, distrussero macchine tessili per protesta. Il meccanismo da ricordare è semplice: una tecnologia si diffonde quando conviene, cioè quando il rapporto tra il costo del lavoro e quello di macchine ed energia la rende vantaggiosa. Vale ancora oggi per l'automazione e l'intelligenza artificiale."
      }
    ],
    "facts": [
      "Inizio: Gran Bretagna, seconda metà del Settecento.",
      "1712: macchina a vapore di Newcomen; 1769: condensatore separato di Watt.",
      "Primo settore trasformato: il tessile del cotone.",
      "1830: ferrovia Liverpool-Manchester.",
      "Tesi di Allen: salari alti e carbone economico rendevano convenienti le macchine."
    ],
    "links": [
      "tecnologia-intelligenza-artificiale",
      "scienza-effetto-serra",
      "matematica-crescita-esponenziale",
      "economia-domanda-offerta"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Quale innovazione di James Watt, brevettata nel 1769, rese la macchina a vapore molto più efficiente?",
        "options": [
          "La caldaia a carbone",
          "Il filatoio idraulico",
          "La locomotiva a vapore",
          "Il condensatore separato"
        ],
        "answer": 3,
        "why": "Il condensatore separato evitava di raffreddare e riscaldare il cilindro a ogni ciclo, riducendo molto il consumo di carbone. Il filatoio idraulico, dello stesso anno, è invece di Arkwright."
      },
      {
        "type": "comprensione",
        "q": "Secondo la tesi di Robert Allen, perché le macchine si diffusero prima in Inghilterra che in India?",
        "options": [
          "Perché in Inghilterra il lavoro costava molto e il carbone poco",
          "Perché in India era vietato per legge costruire macchine tessili",
          "Perché gli inglesi lavoravano meno ore degli artigiani indiani",
          "Perché in Inghilterra mancavano del tutto i lavoratori agricoli"
        ],
        "answer": 0,
        "why": "Conta il prezzo relativo: dove la manodopera è cara e l'energia economica, sostituire lavoratori con macchine conviene di più."
      },
      {
        "type": "comprensione",
        "q": "Che cosa cambiò in modo decisivo con l'uso del carbone per alimentare le macchine?",
        "options": [
          "I lavoratori poterono tornare a produrre in casa invece che in fabbrica",
          "L'energia disponibile smise di dipendere dalla terra coltivabile e dai boschi",
          "Le città si svuotarono perché le fabbriche sorgevano solo in campagna",
          "La produzione aumentò, ma il reddito per persona rimase uguale"
        ],
        "answer": 1,
        "why": "Muscoli, legna e acqua avevano limiti fisici; il carbone offriva una quantità enorme di energia, e la produzione poté crescere più in fretta della popolazione."
      },
      {
        "type": "applicazione",
        "q": "In un paese il costo del lavoro sale molto, mentre robot ed energia diventano più economici. Cosa suggerisce la storia della rivoluzione industriale?",
        "options": [
          "Che le imprese assumeranno di più, perché i salari alti attirano lavoratori",
          "Che l'automazione rallenterà, perché i lavoratori costano di più",
          "Che le imprese avranno più incentivi ad automatizzare la produzione",
          "Che i prezzi relativi non influiscono sulla scelta delle tecnologie"
        ],
        "answer": 2,
        "why": "È lo stesso calcolo dell'Inghilterra del Settecento: quando il lavoro è caro rispetto a macchine ed energia, sostituirlo diventa conveniente."
      },
      {
        "type": "collegamento",
        "q": "Perché gli studi sul clima usano spesso il livello 'preindustriale' come riferimento?",
        "options": [
          "Perché il clima preindustriale era il più caldo degli ultimi mille anni",
          "Perché le fabbriche del Settecento consumavano più carbone di quelle attuali",
          "Perché da allora si bruciano su larga scala combustibili fossili, a partire dal carbone",
          "Perché l'industria del cotone richiedeva enormi quantità di acqua dei fiumi"
        ],
        "answer": 2,
        "why": "Il passaggio al carbone, e poi a petrolio e gas, ha iniziato ad aumentare la concentrazione di anidride carbonica nell'atmosfera, che rafforza l'effetto serra."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega perché la rivoluzione industriale iniziò in Inghilterra e non altrove.",
      "model": "Prima, quasi tutta l'energia veniva da muscoli, legna e acqua, e la crescita della produzione era assorbita dall'aumento della popolazione. Nell'Inghilterra del Settecento il carbone era abbondante ed economico, mentre i salari erano alti. Secondo una delle spiegazioni più influenti, quella di Robert Allen, questo rendeva conveniente investire in macchine, come quelle a vapore e i filatoi meccanici, che sostituivano lavoro costoso con energia a buon mercato. Altri storici danno più peso alla cultura scientifica, ai mercati e alle istituzioni, fattori che probabilmente contarono insieme.",
      "points": [
        "Passaggio dall'energia di muscoli, legna e acqua al carbone",
        "Salari alti e carbone economico rendevano convenienti le macchine",
        "Altre spiegazioni complementari: cultura scientifica, mercati, istituzioni"
      ]
    }
  },
  {
    "id": "storia-unita-italia",
    "area": "storia",
    "title": "L'Unità d'Italia: come nasce lo Stato italiano",
    "level": 2,
    "minutes": 5,
    "hook": "Alle prime elezioni del Regno d'Italia, nel 1861, poteva votare circa il 2% degli abitanti, e secondo alcune stime solo una piccola minoranza parlava abitualmente italiano.",
    "sections": [
      {
        "h": "Tre progetti per una penisola divisa",
        "text": "All'inizio dell'Ottocento la penisola era divisa in diversi Stati: l'Austria controllava direttamente Lombardia e Veneto e influenzava gran parte degli altri. Sul futuro si confrontavano tre progetti. Giuseppe Mazzini, fondatore della Giovine Italia nel 1831, voleva una repubblica unitaria nata dall'insurrezione popolare. I neoguelfi, come Vincenzo Gioberti, pensavano a una federazione di Stati guidata dal papa. I liberali moderati puntavano su una monarchia costituzionale sotto i Savoia, re di Sardegna, l'unico Stato che dopo le rivoluzioni del 1848-49 mantenne la costituzione concessa in quegli anni, lo Statuto Albertino. Dopo il fallimento di quelle rivoluzioni prevalse il terzo progetto."
      },
      {
        "h": "Il metodo di Cavour: diplomazia e guerra",
        "text": "Camillo Benso di Cavour, capo del governo piemontese dal 1852, capì che il Piemonte da solo non poteva battere l'Austria. Con gli accordi di Plombières del 1858 ottenne l'alleanza di Napoleone III in cambio di Nizza e della Savoia. Nella seconda guerra d'indipendenza, nel 1859, le vittorie franco-piemontesi di Magenta e Solferino portarono la Lombardia al Piemonte; nel 1860 i plebisciti in Toscana ed Emilia sancirono l'annessione dell'Italia centrale. Poi l'iniziativa passò a Giuseppe Garibaldi: nel maggio 1860 partì da Quarto con poco più di mille volontari, sbarcò a Marsala e in pochi mesi conquistò il Regno delle Due Sicilie. Per fermarlo prima che marciasse su Roma, difesa dalla Francia, l'esercito piemontese attraversò lo Stato pontificio prendendo Marche e Umbria. Il 17 marzo 1861 nacque il Regno d'Italia, con Vittorio Emanuele II re e Torino capitale."
      },
      {
        "h": "Uno Stato da completare e da cucire",
        "text": "Mancavano ancora il Veneto, ottenuto nel 1866 con la terza guerra d'indipendenza al fianco della Prussia, e Roma, presa il 20 settembre 1870 con la breccia di Porta Pia e capitale dal 1871; Trento e Trieste arrivarono solo dopo la Prima guerra mondiale. Il nuovo Stato scelse un modello centralizzato: estese a tutto il paese le leggi e l'amministrazione piemontesi, con i prefetti, unificò i debiti pubblici dei vecchi Stati e scartò i progetti di autonomie regionali. Anche lo Statuto Albertino, una costituzione flessibile che si poteva modificare con una legge ordinaria, divenne la carta del Regno e restò in vigore fino al 1948. Nel 1861 gli abitanti erano circa 22 milioni, in maggioranza contadini e analfabeti, e secondo le stime dei linguisti solo una piccola minoranza, tra il 2,5% e il 10% circa, parlava abitualmente italiano. Nel Mezzogiorno la lotta al brigantaggio, nei primi anni dopo l'Unità, fu un conflitto durissimo, che molti storici descrivono come una guerra civile, combattuto anche con leggi speciali come la legge Pica del 1863."
      },
      {
        "h": "Le interpretazioni",
        "text": "La frase 'fatta l'Italia, bisogna fare gli italiani', di solito attribuita a Massimo d'Azeglio, riassume il problema: lo Stato esisteva, la nazione andava costruita. Per la tradizione risorgimentale l'Unità fu il riscatto di un popolo diviso da secoli. Altre letture insistono sui limiti: Antonio Gramsci parlò di 'rivoluzione passiva', guidata dalle élite senza un vero coinvolgimento delle masse contadine; altri storici hanno sottolineato il carattere di annessione al Piemonte, il voto palese nei plebisciti e il costo della repressione nel Sud. Le letture neoborboniche, che descrivono il Regno delle Due Sicilie come un paese prospero impoverito dall'Unità, hanno avuto successo divulgativo ma sono contestate dalla maggior parte degli storici di professione. Il dibattito sulle origini del divario tra Nord e Sud e sul centralismo dello Stato parte ancora da qui."
      }
    ],
    "facts": [
      "17 marzo 1861: nasce il Regno d'Italia, capitale Torino.",
      "1859: seconda guerra d'indipendenza con la Francia; la Lombardia passa al Piemonte.",
      "1860: spedizione dei Mille, da Quarto a Marsala.",
      "1866: Veneto; 20 settembre 1870: Roma, capitale dal 1871.",
      "Alle elezioni del 1861 votava circa il 2% della popolazione."
    ],
    "links": [
      "diritto-costituzione-italiana",
      "arte-manzoni-promessi-sposi",
      "geopolitica-unione-europea"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "In che anno Roma entrò a far parte del Regno d'Italia con la breccia di Porta Pia?",
        "options": [
          "1861",
          "1866",
          "1870",
          "1848"
        ],
        "answer": 2,
        "why": "Il 20 settembre 1870 le truppe italiane entrarono a Roma; la capitale vi fu trasferita nel 1871, dopo Torino e, dal 1865, Firenze."
      },
      {
        "type": "comprensione",
        "q": "Perché Cavour cercò l'alleanza con Napoleone III?",
        "options": [
          "Perché il Piemonte da solo non aveva la forza per sconfiggere l'Austria",
          "Perché la Francia controllava allora la Lombardia e il Veneto",
          "Perché Napoleone III voleva un'Italia repubblicana e unita",
          "Perché il papa aveva chiesto alla Francia di unificare l'Italia"
        ],
        "answer": 0,
        "why": "In cambio di Nizza e Savoia la Francia combatté con il Piemonte nel 1859: le vittorie di Magenta e Solferino portarono la Lombardia ai Savoia."
      },
      {
        "type": "comprensione",
        "q": "Perché nel 1860 l'esercito piemontese attraversò lo Stato pontificio verso sud?",
        "options": [
          "Per aiutare i Borbone a respingere la spedizione dei Mille",
          "Per fermare Garibaldi prima che marciasse su Roma, difesa dalla Francia",
          "Per rispondere a un attacco delle truppe del papa contro la Toscana",
          "Per raggiungere Venezia evitando i territori controllati dall'Austria"
        ],
        "answer": 1,
        "why": "Un attacco a Roma avrebbe provocato l'intervento francese: Cavour prese l'iniziativa, annesse Marche e Umbria e si ricongiunse alle conquiste di Garibaldi."
      },
      {
        "type": "applicazione",
        "q": "Un gruppo acquisisce aziende in regioni diverse e impone subito a tutte procedure, sistemi e debiti della capogruppo. Quale rischio richiama l'Unità d'Italia?",
        "options": [
          "Che le aziende acquisite diventino subito più efficienti della capogruppo",
          "Che la centralizzazione elimini in poco tempo ogni differenza tra le sedi",
          "Che le regole comuni rendano inutile ogni intervento successivo",
          "Che l'integrazione formale arrivi molto prima di quella reale, tra resistenze locali"
        ],
        "answer": 3,
        "why": "Nel 1861 lo Stato esisteva sulla carta, ma territori con storie, economie e lingue diverse andavano ancora integrati: 'fatta l'Italia, bisogna fare gli italiani'."
      },
      {
        "type": "collegamento",
        "q": "Lo Statuto Albertino si poteva modificare con una legge ordinaria. Quale scelta dei costituenti del 1948 si spiega anche con questa esperienza?",
        "options": [
          "Permettere al governo di aggiornare la Costituzione con un decreto",
          "Rendere la Costituzione rigida, modificabile solo con una procedura aggravata",
          "Scrivere una Costituzione breve, con pochi principi molto generali",
          "Mantenere lo Statuto, aggiungendo soltanto un elenco di diritti sociali"
        ],
        "answer": 1,
        "why": "Durante il fascismo lo Statuto flessibile fu svuotato con leggi ordinarie; la Costituzione del 1948 è rigida e affida a una Corte costituzionale il controllo sulle leggi."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico straniero come è nato lo Stato italiano.",
      "model": "Fino a metà Ottocento l'Italia era divisa in vari Stati, con l'Austria dominante al Nord. Il Regno di Sardegna, guidato da Cavour, si alleò con la Francia e nel 1859 sconfisse l'Austria, ottenendo la Lombardia; nel 1860 l'Italia centrale votò l'annessione e Garibaldi conquistò il Sud con i Mille. Nel 1861 nacque il Regno d'Italia, completato con il Veneto nel 1866 e Roma nel 1870. Fu un'unificazione guidata dall'alto, con un modello centralizzato, e gli storici discutono ancora di quanto abbia coinvolto davvero la popolazione.",
      "points": [
        "Ruolo del Piemonte e della diplomazia di Cavour con la Francia",
        "Spedizione dei Mille e annessione del Sud",
        "Unificazione dall'alto e centralizzata, con interpretazioni diverse"
      ]
    }
  },
  {
    "id": "storia-guerra-fredda",
    "area": "storia",
    "title": "La Guerra fredda: perché si chiama fredda",
    "level": 2,
    "minutes": 5,
    "hook": "Per oltre quarant'anni Stati Uniti e Unione Sovietica si prepararono a combattersi con decine di migliaia di testate nucleari, e proprio per questo non si scontrarono mai direttamente.",
    "sections": [
      {
        "h": "Da alleati a rivali",
        "text": "Nel 1945 Stati Uniti e Unione Sovietica avevano appena sconfitto insieme la Germania nazista, ma avevano sistemi opposti: democrazia liberale e mercato da una parte, partito unico ed economia pianificata dall'altra. L'Armata Rossa occupava l'Europa orientale, dove nel giro di pochi anni si insediarono governi comunisti. Nel marzo 1946 Winston Churchill parlò di una 'cortina di ferro' calata sull'Europa. Nel 1947 gli Stati Uniti adottarono la strategia del contenimento: la dottrina Truman promise sostegno ai paesi minacciati dal comunismo e il Piano Marshall finanziò la ricostruzione dell'Europa occidentale, Italia compresa. Nel 1949 nacque la NATO, di cui l'Italia fu tra i fondatori; nel 1955 il blocco sovietico rispose con il Patto di Varsavia. L'espressione 'guerra fredda' si diffuse proprio in quegli anni, anche grazie a un libro del giornalista americano Walter Lippmann del 1947."
      },
      {
        "h": "Il meccanismo della deterrenza",
        "text": "La guerra restò 'fredda', cioè senza uno scontro armato diretto tra le due superpotenze, soprattutto a causa delle armi nucleari. Gli Stati Uniti le avevano dal 1945, l'URSS sperimentò la sua prima bomba nel 1949. Da allora ciascuno sapeva che un attacco avrebbe provocato una rappresaglia devastante: è la logica della distruzione mutua assicurata. A metà degli anni Ottanta nel mondo c'erano circa 70.000 testate nucleari. La competizione si spostò allora su altri terreni: la corsa agli armamenti e quella allo spazio, dallo Sputnik sovietico del 1957 allo sbarco americano sulla Luna del 1969, lo spionaggio, la propaganda, gli aiuti economici e le guerre 'per procura', combattute da alleati o in paesi terzi, come in Corea, in Vietnam e in Afghanistan."
      },
      {
        "h": "Un esempio: tredici giorni a Cuba",
        "text": "Nell'ottobre 1962 aerei spia americani fotografarono basi per missili sovietici in costruzione a Cuba, a circa 150 chilometri dalla Florida. John F. Kennedy scelse una 'quarantena', cioè un blocco navale, invece di un attacco immediato. Per alcuni giorni il mondo fu vicino alla guerra nucleare. Il 28 ottobre Nikita Chruščëv accettò di ritirare i missili; in cambio gli Stati Uniti si impegnarono pubblicamente a non invadere Cuba e, in segreto, a ritirare i loro missili Jupiter dalla Turchia. Anche i Jupiter schierati in Italia furono smantellati nel 1963. Dopo la crisi fu creato un collegamento diretto tra Washington e Mosca, il cosiddetto 'telefono rosso', che in realtà era una telescrivente, per comunicare in fretta nelle emergenze."
      },
      {
        "h": "Come finì e come leggerla",
        "text": "Negli anni Ottanta l'economia sovietica era in difficoltà e la corsa agli armamenti pesava enormemente sul suo bilancio. Michail Gorbačëv, al potere dal 1985, avviò riforme e aperture e rinunciò a intervenire militarmente nei paesi alleati. Il 9 novembre 1989 cadde il Muro di Berlino, costruito nel 1961; nel dicembre 1991 l'Unione Sovietica si dissolse. Sulle responsabilità gli storici hanno proposto letture diverse: la scuola 'ortodossa' accusava soprattutto l'espansionismo sovietico, quella 'revisionista' gli interessi economici e politici degli Stati Uniti, mentre gli studi successivi, aiutati anche dall'apertura di parte degli archivi sovietici, insistono sull'intreccio di ideologia, paure reciproche e calcoli di sicurezza. Capirla aiuta a leggere le rivalità tra grandi potenze di oggi, in cui deterrenza, sanzioni, competizione tecnologica e conflitti indiretti restano strumenti centrali."
      }
    ],
    "facts": [
      "1946: Churchill parla di 'cortina di ferro'.",
      "1949: nasce la NATO e l'URSS sperimenta la prima bomba atomica; 1955: Patto di Varsavia.",
      "Ottobre 1962: crisi dei missili di Cuba.",
      "Muro di Berlino: costruito nel 1961, abbattuto il 9 novembre 1989.",
      "Dicembre 1991: dissoluzione dell'Unione Sovietica."
    ],
    "links": [
      "mente-teoria-giochi",
      "geopolitica-taiwan-chip",
      "geopolitica-unione-europea"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "In che anno l'Unione Sovietica sperimentò la sua prima bomba atomica?",
        "options": [
          "1945",
          "1949",
          "1957",
          "1962"
        ],
        "answer": 1,
        "why": "Il test del 1949 mise fine al monopolio nucleare americano e aprì la corsa agli armamenti tra le due superpotenze."
      },
      {
        "type": "comprensione",
        "q": "Perché la Guerra fredda non diventò mai uno scontro armato diretto tra Stati Uniti e URSS?",
        "options": [
          "Perché un trattato del 1945 vietava alle due potenze di farsi la guerra",
          "Perché nessuna delle due aveva un esercito capace di combattere in Europa",
          "Perché un attacco avrebbe provocato una rappresaglia nucleare devastante per entrambi",
          "Perché l'ONU aveva il potere di fermare qualsiasi guerra tra i suoi membri"
        ],
        "answer": 2,
        "why": "È la logica della distruzione mutua assicurata: la certezza della rappresaglia rendeva irrazionale il primo colpo, e la competizione si spostò su altri terreni."
      },
      {
        "type": "comprensione",
        "q": "Perché dopo la crisi di Cuba fu creato un collegamento diretto tra Washington e Mosca?",
        "options": [
          "Per ridurre il rischio che un malinteso degenerasse in una guerra nucleare",
          "Per permettere ai due leader di negoziare accordi commerciali più in fretta",
          "Per sostituire le ambasciate, che erano state chiuse durante la crisi",
          "Per coordinare insieme la corsa allo spazio e i lanci dei satelliti"
        ],
        "answer": 0,
        "why": "Durante la crisi le comunicazioni erano state lente e indirette: in un sistema basato sulla deterrenza, parlarsi in fretta riduce il rischio di errori fatali."
      },
      {
        "type": "applicazione",
        "q": "Leggi che due grandi potenze rivali, entrambe dotate di armi nucleari, competono su chip, sanzioni e alleanze ma evitano lo scontro diretto. Quale schema della Guerra fredda riconosci?",
        "options": [
          "Una fase che di solito precede un'invasione reciproca entro pochi mesi",
          "Una competizione solo economica, senza alcuna dimensione militare",
          "Un'alleanza di fatto, perché chi commercia non si fa mai la guerra",
          "Una rivalità frenata dalla deterrenza e spostata su terreni indiretti"
        ],
        "answer": 3,
        "why": "Come tra Stati Uniti e URSS, la deterrenza rende troppo costoso lo scontro diretto e la rivalità passa per tecnologia, economia, alleanze e conflitti per procura."
      },
      {
        "type": "collegamento",
        "q": "Perché la corsa agli armamenti si può leggere come un dilemma del prigioniero?",
        "options": [
          "Perché uno dei due giocatori vince sempre e l'altro è costretto a seguirlo",
          "Perché entrambi starebbero meglio spendendo meno, ma ciascuno si arma per paura dell'altro",
          "Perché le due potenze si fidano l'una dell'altra e collaborano per non perdere",
          "Perché chi si arma per primo ottiene sempre un vantaggio definitivo"
        ],
        "answer": 1,
        "why": "Senza fiducia né controlli, armarsi è la scelta 'razionale' per ciascuno, ma il risultato è peggiore per tutti: per questo contano i trattati con verifiche reciproche."
      }
    ],
    "explain": {
      "prompt": "Spiega a un ragazzo di vent'anni perché la Guerra fredda si chiama 'fredda'.",
      "model": "Dopo il 1945 Stati Uniti e Unione Sovietica divennero rivali, con sistemi politici ed economici opposti e due blocchi di alleati in Europa. Ma entrambe avevano armi nucleari, e un attacco diretto avrebbe significato una rappresaglia devastante: la deterrenza le spinse a non combattersi mai direttamente. La rivalità si scaricò su corsa agli armamenti e allo spazio, spionaggio, propaganda e guerre per procura in paesi come Corea, Vietnam e Afghanistan. Finì con il crollo dell'URSS nel 1991.",
      "points": [
        "Rivalità tra due sistemi e due blocchi dopo il 1945",
        "Deterrenza nucleare: nessuno scontro diretto tra le superpotenze",
        "Competizione indiretta: armi, spazio, propaganda, guerre per procura"
      ]
    }
  },
  {
    "id": "geografia-suez",
    "area": "geopolitica",
    "title": "Il Canale di Suez e i colli di bottiglia del commercio",
    "level": 1,
    "minutes": 5,
    "hook": "Nel marzo 2021 una nave lunga 400 metri, incagliata di traverso, ha bloccato per sei giorni il Canale di Suez: centinaia di navi in coda e consegne in ritardo in mezzo mondo.",
    "sections": [
      {
        "h": "Una scorciatoia di 193 chilometri",
        "text": "Il Canale di Suez taglia l'istmo tra Africa e Asia e collega Port Said, sul Mediterraneo, a Suez, sul Mar Rosso. Fu costruito tra il 1859 e il 1869 dalla compagnia del francese Ferdinand de Lesseps e inaugurato il 17 novembre 1869. Oggi è lungo circa 193 chilometri e non ha chiuse: Mediterraneo e Mar Rosso hanno quasi lo stesso livello, quindi è bastato scavare. Alle navi tra Asia ed Europa risparmia il giro dell'Africa dal Capo di Buona Speranza, che sulla rotta Asia–Nord Europa significa oltre 6.000 chilometri e dieci giorni o più di navigazione in più. Prima della crisi del Mar Rosso del 2023-24 vi passava, secondo le stime più citate, circa il 12% del commercio mondiale."
      },
      {
        "h": "Perché un collo di bottiglia amplifica ogni problema",
        "text": "Un collo di bottiglia, in inglese chokepoint, è un passaggio stretto da cui transita una quota sproporzionata del traffico. Il danno non viene solo dal blocco totale. Se le navi devono girare intorno all'Africa, ogni viaggio dura di più: la stessa flotta compie meno rotazioni l'anno e la capacità disponibile si riduce, anche se nessuna nave è sparita. Con meno offerta di stive e la stessa domanda, i noli salgono. Si aggiungono premi assicurativi per rischio di guerra, carburante extra e porti congestionati, dove le navi arrivano a ondate. Gli altri grandi colli di bottiglia funzionano allo stesso modo: lo Stretto di Hormuz, tra Iran e Oman, da cui passa circa un quinto del petrolio consumato nel mondo; Bab el-Mandeb, all'ingresso meridionale del Mar Rosso; Malacca, in Asia; il Canale di Panama, che però ha le chiuse e dipende dall'acqua dolce di un lago artificiale, tanto che la siccità del 2023 ha costretto a ridurre i transiti."
      },
      {
        "h": "Quattro crisi in settant'anni",
        "text": "Nel luglio 1956 il presidente egiziano Nasser nazionalizzò il canale, gestito fino ad allora da una compagnia a capitale soprattutto francese e britannico. Regno Unito, Francia e Israele intervennero militarmente, ma dovettero ritirarsi sotto la pressione di Stati Uniti e Unione Sovietica. Dopo la guerra dei Sei giorni il canale restò chiuso dal 1967 al 1975, con alcune navi intrappolate all'interno per otto anni. Nel marzo 2021 la portacontainer Ever Given si incagliò di traverso e bloccò il passaggio dal 23 al 29 marzo: centinaia di navi in coda e, secondo le stime citate allora, quasi 10 miliardi di dollari di merci ferme ogni giorno. Dalla fine del 2023 gli attacchi degli Houthi yemeniti alle navi mercantili, avviati dopo lo scoppio della guerra di Gaza, hanno spinto molti armatori a passare dal Capo: nel 2024 i transiti nel canale si sono ridotti di circa la metà e i noli tra Asia ed Europa sono più che raddoppiati in poche settimane."
      },
      {
        "h": "Che cosa significa per chi importa ed esporta",
        "text": "Per un'azienda che spedisce piastrelle dall'Italia a Giacarta, Suez è la strada normale: Mar Rosso, Oceano Indiano, spesso un trasbordo a Singapore. Se le navi deviano dal Capo, il viaggio si allunga di una o due settimane. Per i porti del Mediterraneo la deviazione pesa in proporzione ancora di più, perché Suez è quasi sulla porta di casa, mentre il giro dell'Africa costringe a ripassare da Gibilterra. Più giorni in mare significano più merce in viaggio da finanziare, scorte di sicurezza più alte e preventivi di trasporto che invecchiano in fretta. Per questo nei contratti internazionali conta sapere chi paga il nolo e chi sopporta il rischio del viaggio, che è proprio la funzione degli Incoterms, e conviene leggere le notizie sui colli di bottiglia come un segnale anticipato di costi e ritardi."
      }
    ],
    "facts": [
      "Inaugurato il 17 novembre 1869, lungo circa 193 km, senza chiuse.",
      "Evita il giro dell'Africa: sulla rotta Asia–Nord Europa oltre 6.000 km e dieci giorni o più in meno.",
      "Nazionalizzato da Nasser nel 1956; chiuso dal 1967 al 1975.",
      "Ever Given: canale bloccato dal 23 al 29 marzo 2021.",
      "Una deviazione riduce la capacità effettiva della flotta e fa salire i noli."
    ],
    "links": [
      "geopolitica-stretto-malacca",
      "storia-guerra-fredda",
      "economia-domanda-offerta",
      "geopolitica-acqua-fiumi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "In che anno fu inaugurato il Canale di Suez?",
        "options": [
          "1914",
          "1869",
          "1956",
          "1888"
        ],
        "answer": 1,
        "why": "Il canale fu inaugurato il 17 novembre 1869, dopo dieci anni di lavori; il 1914 è l'anno del Canale di Panama, il 1956 quello della nazionalizzazione."
      },
      {
        "type": "comprensione",
        "q": "Perché il Canale di Suez non ha chiuse, mentre quello di Panama sì?",
        "options": [
          "Perché vi transitano navi più piccole, che non ne hanno bisogno",
          "Perché le chiuse furono smantellate dopo la nazionalizzazione del 1956",
          "Perché i due mari che collega hanno quasi lo stesso livello",
          "Perché il fondale sabbioso dell'istmo non permette di costruirle"
        ],
        "answer": 2,
        "why": "Tra Mediterraneo e Mar Rosso il dislivello è minimo e basta un canale scavato; a Panama le navi salgono fino a un lago artificiale e le chiuse consumano acqua dolce."
      },
      {
        "type": "comprensione",
        "q": "Durante la crisi del Mar Rosso molte navi passano dal Capo di Buona Speranza. Perché i noli salgono anche se il numero di navi nel mondo non cambia?",
        "options": [
          "Perché ogni viaggio dura di più e la stessa flotta offre meno capacità nell'anno",
          "Perché l'Egitto alza i pedaggi per compensare il calo dei transiti",
          "Perché le navi che fanno il giro dell'Africa devono essere più grandi",
          "Perché i porti europei applicano tasse speciali sulle rotte più lunghe"
        ],
        "answer": 0,
        "why": "Se ogni rotazione richiede più giorni, la capacità effettiva si riduce: con meno offerta di stive e domanda invariata, il prezzo del trasporto sale."
      },
      {
        "type": "applicazione",
        "q": "Un importatore di Giacarta riceve piastrelle dall'Italia e legge che le compagnie tornano a evitare Suez. Qual è la reazione più sensata?",
        "options": [
          "Nessuna, perché le merci dirette in Asia non passano da Suez",
          "Spostare tutte le forniture sul trasporto aereo, che costa poco di più",
          "Aspettare, perché le deviazioni cambiano i noli ma non i tempi",
          "Aumentare le scorte e aggiornare tempi e costi di trasporto nei preventivi"
        ],
        "answer": 3,
        "why": "La rotta Italia–Indonesia passa normalmente da Suez: senza il canale servono una o due settimane in più, quindi più scorte di sicurezza e noli più cari da mettere in conto."
      },
      {
        "type": "collegamento",
        "q": "Nella crisi di Suez del 1956 Regno Unito e Francia si ritirarono sotto la pressione di Stati Uniti e URSS. Che cosa rivela l'episodio sull'ordine del dopoguerra?",
        "options": [
          "Che Stati Uniti e URSS erano alleati stabili contro l'Europa",
          "Che ormai contavano le superpotenze più delle vecchie potenze coloniali",
          "Che l'Egitto era entrato nella NATO per proteggere il canale",
          "Che l'ONU disponeva già di un esercito permanente"
        ],
        "answer": 1,
        "why": "Nella logica della Guerra fredda Londra e Parigi non potevano più agire contro la volontà sia di Washington sia di Mosca: Suez segnò il tramonto dei vecchi imperi coloniali."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega dell'ufficio acquisti perché una crisi nel Mar Rosso può far salire il costo di una spedizione dall'Italia all'Asia anche se la nostra nave non viene mai attaccata.",
      "model": "Dal Canale di Suez passa la rotta più breve tra Mediterraneo e Asia. Se il passaggio diventa rischioso, le navi girano intorno all'Africa: ogni viaggio dura una o due settimane in più, quindi la stessa flotta trasporta meno merce in un anno. Meno capacità con la stessa domanda vuol dire noli più alti, a cui si aggiungono assicurazioni e carburante. Per noi significa anche più merce in viaggio da finanziare e consegne meno prevedibili.",
      "points": [
        "Suez è la scorciatoia tra Asia ed Europa",
        "La deviazione riduce la capacità effettiva della flotta",
        "Costi e tempi salgono per tutti, non solo per chi viene colpito"
      ]
    }
  },
  {
    "id": "geopolitica-stretto-malacca",
    "area": "geopolitica",
    "title": "Lo Stretto di Malacca e l'Indonesia",
    "level": 2,
    "minutes": 5,
    "hook": "Nel punto più stretto, vicino a Singapore, il canale navigabile è largo meno di 3 chilometri: eppure da qui passa gran parte del petrolio diretto in Cina, Giappone e Corea del Sud.",
    "sections": [
      {
        "h": "Il corridoio tra Oceano Indiano e Pacifico",
        "text": "Lo Stretto di Malacca separa la penisola malese dall'isola indonesiana di Sumatra ed è lungo circa 800 chilometri. All'estremità meridionale si restringe nello Stretto di Singapore, dove il canale navigabile di Phillips è largo meno di 3 chilometri. È la via più breve tra l'Oceano Indiano e il Mar Cinese Meridionale, quindi tra Medio Oriente, Europa e Africa da una parte e Asia orientale dall'altra. Secondo le stime recenti lo attraversano oltre 80.000 navi l'anno, e per petrolio trasportato rivaleggia con Hormuz: l'EIA americana stimava oltre 20 milioni di barili al giorno nel 2023. Per questo Singapore, sulla punta dello stretto, è diventata il secondo porto container del mondo dopo Shanghai."
      },
      {
        "h": "Acque nazionali, passaggio garantito",
        "text": "Le acque dello stretto appartengono a Indonesia, Malesia e Singapore, ma la Convenzione ONU sul diritto del mare del 1982 stabilisce che negli stretti usati per la navigazione internazionale vale il passaggio in transito: le navi di tutti i Paesi, anche militari, li attraversano senza chiedere permesso e gli Stati costieri non possono sospenderlo. Gli Stati costieri sostengono però gran parte dei costi di sicurezza, segnalamento e lotta all'inquinamento, e chiedono da tempo agli utenti di contribuire. All'inizio degli anni Duemila la pirateria era un problema serio, al punto che nel 2005 gli assicuratori dei Lloyd's classificarono temporaneamente lo stretto come zona a rischio di guerra. I pattugliamenti coordinati avviati nel 2004 da Indonesia, Malesia e Singapore, poi estesi alla Thailandia, fecero calare gli attacchi. Indonesia e Malesia respinsero invece l'ipotesi di pattugliamenti americani: la sovranità sulle proprie acque non è negoziabile."
      },
      {
        "h": "L'Indonesia, Stato arcipelago",
        "text": "L'Indonesia conta circa 17.000 isole e si considera un unico insieme di terra e mare. Con la dichiarazione Djuanda del 1957 rivendicò come acque nazionali i mari tra le isole, una tesi che la Convenzione del 1982 ha accolto, con alcuni limiti, nello statuto di Stato arcipelago. In cambio deve garantire alle navi straniere corridoi di attraversamento: ne ha designati tre, da nord a sud, riconosciuti in sede IMO alla fine degli anni Novanta, che passano per lo Stretto della Sonda, tra Sumatra e Giava, per lo Stretto di Lombok, a est di Bali, e per l'Indonesia orientale. Malacca in alcuni punti ha fondali intorno ai 25 metri: le petroliere più grandi a pieno carico passano per Lombok e Makassar, più profondi ma più lunghi. Per Giacarta la posizione è insieme una rendita e una responsabilità."
      },
      {
        "h": "Il «dilemma di Malacca» e le catene di fornitura",
        "text": "Per la Cina lo stretto è una vulnerabilità: negli anni Duemila si stimava che vi passasse circa l'80% delle sue importazioni di petrolio, e si attribuisce al presidente Hu Jintao, nel 2003, l'espressione «dilemma di Malacca». Da qui l'oleodotto e il gasdotto attraverso il Myanmar, il porto pakistano di Gwadar e il potenziamento della marina. Gli Stati Uniti insistono sulla libertà di navigazione; gli Stati costieri cercano di restare equidistanti tra le grandi potenze senza cedere il controllo delle proprie acque. L'idea di un canale alternativo attraverso l'istmo di Kra, in Thailandia, torna a galla da secoli senza mai partire. Per chi importa in Indonesia la lezione è pratica: molti container diretti a Giacarta vengono trasbordati a Singapore o a Port Klang, quindi una congestione in quei porti si traduce in giorni di ritardo anche se la nave madre è puntuale."
      }
    ],
    "facts": [
      "Malacca: circa 800 km tra Malesia e Sumatra; meno di 3 km nel canale di Phillips, vicino a Singapore.",
      "Convenzione ONU sul diritto del mare (1982): negli stretti internazionali il passaggio in transito non può essere sospeso.",
      "Dichiarazione Djuanda (1957): l'Indonesia come Stato arcipelago.",
      "Le petroliere più grandi a pieno carico usano Lombok e Makassar.",
      "«Dilemma di Malacca»: la dipendenza energetica cinese dallo stretto."
    ],
    "links": [
      "geografia-suez",
      "geopolitica-taiwan-chip",
      "mente-teoria-giochi",
      "economia-domanda-offerta"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Che cosa affermò l'Indonesia con la dichiarazione Djuanda del 1957?",
        "options": [
          "Che lo Stretto di Malacca è chiuso alle navi militari straniere",
          "Che i pedaggi sullo stretto spettano soltanto all'Indonesia",
          "Che i mari tra le sue isole sono acque indonesiane",
          "Che Singapore deve condividere i proventi del suo porto"
        ],
        "answer": 2,
        "why": "Con la dichiarazione Djuanda l'Indonesia si definì un unico insieme di terra e mare; la Convenzione del 1982 ha poi accolto il principio dello Stato arcipelago, con l'obbligo di garantire corridoi di transito."
      },
      {
        "type": "comprensione",
        "q": "Perché Indonesia, Malesia e Singapore non possono chiudere lo stretto alle navi di un Paese con cui sono in contrasto?",
        "options": [
          "Perché negli stretti internazionali vale un passaggio in transito che non può essere sospeso",
          "Perché lo stretto è acqua internazionale che non appartiene a nessuno Stato",
          "Perché un trattato con gli Stati Uniti vieta loro di farlo",
          "Perché la sovranità sulle rotte più trafficate spetta all'IMO"
        ],
        "answer": 0,
        "why": "Le acque appartengono agli Stati costieri, ma la Convenzione del 1982 garantisce a tutte le navi il diritto di attraversare gli stretti usati per la navigazione internazionale."
      },
      {
        "type": "applicazione",
        "q": "Un'azienda di Giacarta aspetta un container dall'Italia, trasbordato a Singapore. La nave madre arriva puntuale, ma il porto di Singapore è congestionato. Che cosa deve aspettarsi?",
        "options": [
          "Nessun ritardo, perché conta solo la puntualità della nave madre",
          "Un ritardo, perché il container deve aspettare la nave di collegamento",
          "Che il container venga dirottato via Lombok senza costi aggiuntivi",
          "Un ritardo solo se la merce trasportata è petrolio o gas"
        ],
        "answer": 1,
        "why": "Nel trasbordo la catena va alla velocità dell'anello più lento: se il porto hub è congestionato, il container aspetta la nave feeder anche per giorni."
      },
      {
        "type": "comprensione",
        "q": "Perché le petroliere più grandi, a pieno carico, passano per lo Stretto di Lombok invece che per Malacca?",
        "options": [
          "Perché a Malacca le petroliere pagano pedaggi molto più alti",
          "Perché Lombok è la rotta più breve tra Golfo Persico e Giappone",
          "Perché a Malacca il transito di navi cisterna è vietato",
          "Perché Malacca in alcuni punti ha fondali troppo bassi per il loro pescaggio"
        ],
        "answer": 3,
        "why": "Con fondali intorno ai 25 metri, le navi più profonde a pieno carico devono passare per Lombok e Makassar, più profondi ma più lunghi."
      },
      {
        "type": "collegamento",
        "q": "Gli Stati costieri pagano sicurezza, segnalamento e controllo dell'inquinamento, ma ne beneficiano tutte le navi che passano, senza contribuire. Quale concetto della teoria dei giochi descrive la situazione?",
        "options": [
          "Un monopolio naturale degli Stati costieri",
          "Un gioco a somma zero tra gli armatori",
          "Il problema del free rider tipico dei beni pubblici",
          "Un caso di concorrenza perfetta tra rotte"
        ],
        "answer": 2,
        "why": "Chi non paga non può essere escluso dal beneficio: senza accordi di cooperazione ciascun utente ha interesse a lasciar pagare gli altri, e il servizio rischia di essere finanziato troppo poco."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega perché lo Stretto di Malacca è considerato uno dei punti più strategici del mondo.",
      "model": "Lo Stretto di Malacca è la scorciatoia tra l'Oceano Indiano e il Pacifico: lo attraversano decine di migliaia di navi l'anno e una quantità di petrolio paragonabile a quella di Hormuz. Le alternative, come Lombok, esistono ma allungano il viaggio, quindi ogni problema nello stretto fa salire costi e tempi. Il diritto del mare garantisce a tutti il passaggio, ma la sicurezza la gestiscono Indonesia, Malesia e Singapore, mentre Cina e Stati Uniti lo considerano vitale. Per questo pirateria, tensioni o congestione nei porti come Singapore si riflettono su noli, scorte e prezzi.",
      "points": [
        "È la via più breve tra Oceano Indiano e Asia orientale",
        "Le alternative esistono ma costano tempo e denaro",
        "Gli Stati costieri lo gestiscono, le grandi potenze lo considerano vitale"
      ]
    }
  },
  {
    "id": "geopolitica-unione-europea",
    "area": "geopolitica",
    "title": "Come funziona l'Unione Europea: chi decide cosa",
    "level": 2,
    "minutes": 5,
    "hook": "Un avvocato milanese si rifiutò di pagare una bolletta della luce da 1.925 lire: dalla sua causa, decisa nel 1964, nacque il principio per cui il diritto europeo prevale sulle leggi italiane.",
    "sections": [
      {
        "h": "Quattro istituzioni, quattro mestieri",
        "text": "La Commissione europea, con un commissario per ciascuno dei 27 Stati, propone le leggi, vigila sul rispetto dei trattati, applica le regole di concorrenza e negozia gli accordi commerciali. Il Parlamento europeo, eletto ogni cinque anni (dal 2024 conta 720 deputati, di cui 76 eletti in Italia), discute, emenda e approva le leggi. Il Consiglio dell'UE riunisce i ministri dei governi nazionali, diversi a seconda della materia, e approva le leggi insieme al Parlamento. Il Consiglio europeo, cioè i capi di Stato o di governo, non legifera: fissa l'indirizzo politico, propone il presidente della Commissione e gestisce le crisi. Completano il quadro la Corte di giustizia, a Lussemburgo, che interpreta il diritto dell'Unione, e la Banca centrale europea, a Francoforte, che decide in modo indipendente la politica monetaria dei Paesi dell'euro."
      },
      {
        "h": "Come nasce una legge europea",
        "text": "Nella procedura legislativa ordinaria, la regola generale dal Trattato di Lisbona del 2009, la Commissione presenta una proposta e Parlamento e Consiglio devono approvare lo stesso testo; i compromessi si trovano di solito in negoziati a tre chiamati triloghi. Nel Consiglio la maggior parte delle decisioni si prende a maggioranza qualificata: servono almeno il 55% degli Stati, cioè 15 su 27, che rappresentino almeno il 65% della popolazione. Nessun grande Paese può quindi bloccare da solo: per fermare una proposta servono almeno quattro Stati. Su fiscalità, politica estera, adesione di nuovi membri e modifica dei trattati serve invece l'unanimità, e un solo governo può dire no. Il sistema è lento, ma obbliga a costruire coalizioni."
      },
      {
        "h": "Chi è competente su cosa",
        "text": "L'Unione può agire solo nelle materie che i trattati le attribuiscono. In alcune la competenza è esclusiva: unione doganale, regole di concorrenza del mercato interno, politica monetaria dell'euro, politica commerciale. Per questo i dazi su un prodotto indonesiano, o misure antidumping come quelle introdotte nel 2011 sulle piastrelle ceramiche cinesi, si decidono a livello europeo e non a Roma. In altre materie, come mercato interno, ambiente, energia e tutela dei consumatori, la competenza è concorrente: gli Stati legiferano nella misura in cui l'Unione non è intervenuta. Istruzione, cultura e organizzazione della sanità restano essenzialmente nazionali. Gli strumenti principali sono due: il regolamento si applica direttamente e in modo identico in tutti gli Stati, come il GDPR; la direttiva fissa un risultato che ogni Stato raggiunge con una propria legge, come la direttiva del 2011 sui ritardi di pagamento, recepita in Italia nel 2012."
      },
      {
        "h": "Il primato del diritto europeo e gli equivoci comuni",
        "text": "Nel 1964, con la sentenza Costa contro ENEL, la Corte di giustizia ha affermato il primato del diritto europeo su quello nazionale. Oggi un giudice italiano che trova una legge interna in contrasto con una norma europea direttamente applicabile deve disapplicarla, e la Corte costituzionale ha fondato questa soluzione sull'articolo 11 della Costituzione. L'equivoco più diffuso è «l'Europa ci impone»: le leggi le approvano anche i ministri italiani nel Consiglio e i deputati eletti in Italia. Un altro è confondere Consiglio europeo e Consiglio dell'UE con il Consiglio d'Europa, un'organizzazione diversa, con sede a Strasburgo e 46 Stati membri, che veglia sulla Convenzione europea dei diritti dell'uomo. Sul giudizio complessivo le posizioni divergono: c'è chi denuncia un deficit democratico e vorrebbe restituire poteri agli Stati, e chi ritiene che l'unanimità paralizzi l'Unione e vorrebbe più decisioni a maggioranza."
      }
    ],
    "facts": [
      "La Commissione propone, Parlamento e Consiglio approvano.",
      "Maggioranza qualificata: 55% degli Stati con almeno il 65% della popolazione.",
      "Unanimità su fisco, politica estera, adesioni e modifica dei trattati.",
      "Regolamento: si applica direttamente; direttiva: va recepita da ogni Stato.",
      "Costa contro ENEL (1964): primato del diritto europeo."
    ],
    "links": [
      "diritto-gdpr-privacy",
      "economia-inflazione-tassi",
      "diritto-costituzione-italiana"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Che cosa serve, nel Consiglio dell'UE, per raggiungere la maggioranza qualificata?",
        "options": [
          "I due terzi degli Stati, indipendentemente dalla popolazione",
          "Il 65% degli Stati che rappresentino almeno il 55% della popolazione",
          "La maggioranza semplice degli Stati con l'assenso della Commissione",
          "Il 55% degli Stati che rappresentino almeno il 65% della popolazione"
        ],
        "answer": 3,
        "why": "La doppia soglia impedisce sia ai piccoli sia ai grandi di decidere da soli; per bloccare una decisione servono almeno quattro Stati."
      },
      {
        "type": "comprensione",
        "q": "Qual è la differenza tra un regolamento e una direttiva europea?",
        "options": [
          "Il regolamento lo approva il Parlamento, la direttiva solo la Commissione",
          "Il regolamento si applica direttamente, la direttiva va recepita da ogni Stato",
          "La direttiva è obbligatoria, il regolamento è solo una raccomandazione",
          "Il regolamento vale solo per i Paesi dell'euro, la direttiva per tutti"
        ],
        "answer": 1,
        "why": "Per questo il GDPR è identico in tutta l'Unione, mentre le leggi nate da una direttiva possono differire nei dettagli da un Paese all'altro."
      },
      {
        "type": "applicazione",
        "q": "Un'azienda italiana vorrebbe dazi più bassi sulle importazioni di un prodotto dall'Indonesia. A quale livello si decide?",
        "options": [
          "A livello UE, perché la politica commerciale è competenza esclusiva dell'Unione",
          "Al Ministero delle imprese, che fissa i dazi nazionali",
          "Al Consiglio d'Europa di Strasburgo, che riunisce 46 Stati",
          "Alla BCE, che gestisce gli scambi con l'estero"
        ],
        "answer": 0,
        "why": "Dazi e accordi commerciali li negozia la Commissione per conto dei 27; l'Italia pesa attraverso i suoi ministri nel Consiglio e i suoi deputati al Parlamento europeo."
      },
      {
        "type": "comprensione",
        "q": "Perché la sentenza Costa contro ENEL conta ancora oggi per chi fa impresa in Italia?",
        "options": [
          "Perché ha privatizzato il mercato elettrico italiano dopo la nazionalizzazione",
          "Perché ha vietato agli Stati di nazionalizzare le imprese private",
          "Perché ha affermato il primato della norma europea sulla legge nazionale",
          "Perché ha introdotto l'elezione diretta dei deputati al Parlamento europeo"
        ],
        "answer": 2,
        "why": "Da quel principio deriva che il giudice italiano disapplica la legge interna incompatibile con una norma europea direttamente applicabile: le regole del mercato unico valgono davvero."
      },
      {
        "type": "collegamento",
        "q": "Chi decide i tassi di interesse di riferimento che si riflettono sui mutui e sui fidi di un'azienda italiana?",
        "options": [
          "La Commissione europea, su proposta dei governi",
          "Il Consiglio europeo, all'unanimità",
          "La Banca d'Italia, in autonomia dal resto dell'euro",
          "La Banca centrale europea, indipendente dai governi"
        ],
        "answer": 3,
        "why": "La politica monetaria dei Paesi dell'euro è competenza esclusiva dell'Unione ed è affidata alla BCE, che decide senza istruzioni dai governi; la Banca d'Italia partecipa attraverso il suo governatore."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega che dice «è l'Europa che ci impone le regole» come nasce davvero una legge europea.",
      "model": "La Commissione propone una legge, ma a deciderla sono il Parlamento europeo, eletto dai cittadini, e il Consiglio, dove siedono i ministri dei governi nazionali, compreso quello italiano. Nella maggior parte dei casi il Consiglio vota a maggioranza qualificata, quindi servono coalizioni ampie; su fisco e politica estera serve l'unanimità. L'Unione agisce solo nelle materie che i trattati le assegnano, come commercio e concorrenza. Quando una norma europea è in vigore, prevale su quella nazionale in contrasto.",
      "points": [
        "La Commissione propone, Parlamento e Consiglio decidono",
        "I governi nazionali partecipano attraverso il Consiglio",
        "L'UE agisce solo nelle materie attribuite e il suo diritto prevale"
      ]
    }
  },
  {
    "id": "geopolitica-taiwan-chip",
    "area": "geopolitica",
    "title": "Taiwan e i semiconduttori: perché un'isola conta per il mondo",
    "level": 3,
    "minutes": 6,
    "hook": "Un'isola di circa 23 milioni di abitanti produce gran parte dei chip più avanzati del pianeta, compresi quelli che fanno funzionare gli smartphone di punta e i server dell'intelligenza artificiale.",
    "sections": [
      {
        "h": "Un'industria che si è concentrata in un punto",
        "text": "Fino agli anni Ottanta chi progettava chip di solito li produceva anche. Nel 1987 Morris Chang fondò a Taiwan, con il sostegno del governo, la TSMC, la prima grande fonderia pura: produce chip progettati da altri e non ne vende di propri. Il modello ha permesso la crescita delle aziende fabless, come Nvidia, AMD e Qualcomm, che progettano e affidano la produzione. Fabbricare ai livelli più avanzati richiede impianti da decine di miliardi di dollari, macchine per la litografia EUV che costruisce solo l'olandese ASML e anni di esperienza per ridurre gli scarti. Chi produce più volumi impara più in fretta, abbassa i costi e attira altri clienti: così il settore tende a concentrarsi. Nel 2024 TSMC deteneva oltre il 60% del mercato mondiale della produzione conto terzi, e uno studio di BCG e della Semiconductor Industry Association collocava a Taiwan circa il 90% della capacità mondiale per i chip sotto i 10 nanometri (dato 2019)."
      },
      {
        "h": "Lo status dell'isola: posizioni a confronto",
        "text": "Nel 1949, alla fine della guerra civile, il governo della Repubblica di Cina si ritirò a Taiwan mentre a Pechino nasceva la Repubblica Popolare. Dal 1971 il seggio cinese all'ONU spetta a Pechino e oggi solo una dozzina circa di Stati, per lo più piccoli, riconosce formalmente Taipei. La Repubblica Popolare considera Taiwan parte del proprio territorio, punta alla riunificazione e, con la legge anti-secessione del 2005, non esclude l'uso della forza. A Taiwan, democrazia con elezioni presidenziali dirette dal 1996, il Partito democratico progressista sottolinea un'identità taiwanese distinta, mentre il Kuomintang è favorevole al dialogo e a rapporti più stretti con Pechino; nei sondaggi la maggioranza preferisce mantenere lo status quo. Gli Stati Uniti riconoscono Pechino dal 1979 ma, in base al Taiwan Relations Act dello stesso anno, forniscono armi difensive all'isola e mantengono un'«ambiguità strategica» su un eventuale intervento, pensata per scoraggiare sia un attacco sia passi unilaterali verso l'indipendenza. Quasi tutti i governi, Italia compresa, seguono una politica di «una sola Cina» e si oppongono a cambiamenti dello status quo con la forza."
      },
      {
        "h": "Lo «scudo di silicio» e i suoi limiti",
        "text": "Secondo la teoria dello scudo di silicio, la dipendenza del mondo, Cina inclusa, dai chip taiwanesi rende un attacco troppo costoso per chiunque. Una stima di Bloomberg Economics del 2024 valutava il costo di una guerra intorno al 10% del PIL mondiale. I critici ricordano che l'interdipendenza economica non ha mai garantito la pace e che lo scudo si indebolisce man mano che la produzione si diversifica. È proprio ciò che stanno cercando di fare i grandi blocchi: gli Stati Uniti con il CHIPS and Science Act del 2022, circa 52 miliardi di dollari per produzione e ricerca; l'Unione Europea con il Chips Act del 2023, che punta al 20% del mercato mondiale entro il 2030; la stessa TSMC con nuovi impianti in Arizona, in Giappone e in Germania. Dal 2022 Washington limita inoltre l'export verso la Cina di chip e macchinari avanzati, e Pechino investe per rendersi autonoma."
      },
      {
        "h": "Che cosa significa per le imprese",
        "text": "La carenza di chip del 2020-2022, causata da pandemia e boom della domanda di elettronica e non da una guerra, ha già mostrato il meccanismo: le case automobilistiche hanno perso milioni di veicoli di produzione per la mancanza di componenti che costano pochi euro, mentre un'auto moderna ne contiene centinaia. Un blocco navale di Taiwan, anche senza combattimenti, avrebbe effetti molto più ampi, dagli smartphone ai macchinari industriali. Per un'impresa la lezione è la stessa dei colli di bottiglia marittimi: quando una sola fonte produce gran parte di un componente critico, il rischio resta invisibile finché non si materializza. Le contromisure classiche sono chiedere ai fornitori da dove arrivano i componenti chiave, tenere scorte di sicurezza dei pezzi insostituibili e qualificare fonti alternative."
      }
    ],
    "facts": [
      "TSMC, fondata nel 1987 da Morris Chang, è la prima grande fonderia pura.",
      "Nel 2024 TSMC deteneva oltre il 60% del mercato mondiale delle fonderie.",
      "Le macchine per la litografia EUV le produce solo l'olandese ASML.",
      "1979: gli Stati Uniti riconoscono Pechino e approvano il Taiwan Relations Act.",
      "CHIPS and Science Act USA (2022); Chips Act UE (2023, obiettivo 20% al 2030)."
    ],
    "links": [
      "geopolitica-stretto-malacca",
      "tecnologia-intelligenza-artificiale",
      "mente-teoria-giochi",
      "storia-guerra-fredda"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Che cosa fa una «fonderia pura» come TSMC?",
        "options": [
          "Progetta chip e ne affida la produzione ad altri",
          "Estrae e raffina il silicio usato nei wafer",
          "Produce chip progettati da altre aziende, senza venderne di propri",
          "Costruisce le macchine per la litografia dei chip"
        ],
        "answer": 2,
        "why": "Il modello della fonderia, introdotto da TSMC nel 1987, ha separato produzione e progettazione: chi progetta senza fabbriche proprie, come Nvidia, è detto fabless."
      },
      {
        "type": "comprensione",
        "q": "Perché la produzione dei chip più avanzati tende a concentrarsi in pochissime aziende?",
        "options": [
          "Perché costi fissi enormi ed esperienza premiano chi produce più volumi",
          "Perché i brevetti sui transistor appartengono tutti a TSMC",
          "Perché solo Taiwan dispone del silicio purissimo necessario",
          "Perché i governi vietano di costruire nuove fabbriche"
        ],
        "answer": 0,
        "why": "Impianti da decine di miliardi e anni per ridurre gli scarti creano un circolo: più volumi, costi più bassi, più clienti. Il silicio come materia prima, invece, non è raro."
      },
      {
        "type": "applicazione",
        "q": "Un produttore italiano di macchinari scopre che il microcontrollore di tutte le sue macchine arriva da un solo fornitore che produce a Taiwan. Qual è la contromisura più ragionevole?",
        "options": [
          "Nessuna, perché un componente da pochi euro non può fermare la produzione",
          "Spostare tutti gli acquisti sulla Cina continentale",
          "Attendere che il Chips Act europeo risolva il problema entro il 2030",
          "Aumentare le scorte di quel componente e qualificare un fornitore alternativo"
        ],
        "answer": 3,
        "why": "La carenza del 2020-2022 ha mostrato che un pezzo economico ma insostituibile può fermare un'intera linea: scorte e fonti alternative riducono la dipendenza da un unico punto."
      },
      {
        "type": "comprensione",
        "q": "Quale critica viene mossa alla teoria dello «scudo di silicio»?",
        "options": [
          "Che Taiwan produce ormai solo chip di vecchia generazione",
          "Che si indebolisce man mano che la produzione di chip si diversifica",
          "Che la Cina non utilizza chip prodotti a Taiwan",
          "Che gli Stati Uniti vietano già l'export di chip taiwanesi"
        ],
        "answer": 1,
        "why": "Lo scudo regge finché il mondo dipende da Taiwan: più impianti nascono altrove, meno costoso diventa, in teoria, fare a meno dell'isola. E l'interdipendenza, da sola, non ha mai garantito la pace."
      },
      {
        "type": "collegamento",
        "q": "Gli Stati Uniti non dicono chiaramente se difenderebbero Taiwan. Secondo la logica della teoria dei giochi, a che cosa serve questa «ambiguità strategica»?",
        "options": [
          "A garantire a entrambe le parti la vittoria in caso di conflitto",
          "Ad affidare all'ONU la decisione su chi ha ragione",
          "A scoraggiare sia un attacco sia mosse unilaterali, lasciando tutti nell'incertezza",
          "A trasformare la contesa in un gioco a somma zero"
        ],
        "answer": 2,
        "why": "Pechino non può escludere una risposta americana e Taipei non può contare su un sostegno garantito: l'incertezza rende rischiose per entrambi le mosse che cambierebbero lo status quo."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché una crisi intorno a Taiwan preoccuperebbe anche un'azienda italiana che non vende nulla in Asia.",
      "model": "Taiwan, soprattutto grazie a TSMC, produce gran parte dei chip più avanzati del mondo, e la produzione si è concentrata lì perché richiede investimenti enormi e anni di esperienza. Quei chip finiscono in auto, macchinari, computer e telefoni, cioè in quasi tutto ciò che un'azienda compra o usa. La Cina considera l'isola parte del proprio territorio, Taiwan si governa da sé e gli Stati Uniti la sostengono senza impegni espliciti, quindi il rischio di crisi è reale. Anche un blocco senza guerra fermerebbe le forniture, come ha mostrato in piccolo la carenza di chip del 2020-2022.",
      "points": [
        "La produzione avanzata è concentrata a Taiwan per ragioni economiche",
        "Lo status dell'isola è conteso tra posizioni diverse",
        "Un'interruzione colpirebbe le filiere in tutto il mondo"
      ]
    }
  },
  {
    "id": "geopolitica-acqua-fiumi",
    "area": "geopolitica",
    "title": "L'acqua come leva geopolitica: il Nilo e il Mekong",
    "level": 3,
    "minutes": 6,
    "hook": "L'Egitto ricava dal Nilo oltre il 90% della sua acqua dolce, ma gran parte di quell'acqua nasce in Etiopia, dove nel 2011 è iniziata la costruzione della più grande centrale idroelettrica dell'Africa.",
    "sections": [
      {
        "h": "Chi sta a monte ha il rubinetto",
        "text": "Quando un fiume attraversa più Stati, la geografia distribuisce il potere in modo asimmetrico. Lo Stato a monte può costruire dighe, prelevare acqua per l'irrigazione e trattenere sedimenti; quello a valle ne subisce le conseguenze. Una diga idroelettrica in sé consuma poca acqua, a parte l'evaporazione dal bacino, perché le turbine la restituiscono al fiume. Quello che controlla è il calendario: quando e quanta acqua scende, e questo pesa soprattutto mentre il bacino si riempie e negli anni di siccità. L'irrigazione invece consuma davvero, perché l'acqua evaporata dai campi non torna al fiume. La Convenzione ONU sui corsi d'acqua internazionali del 1997 fissa principi generali, come l'uso equo e ragionevole e l'obbligo di non causare danni significativi, ma molti Stati chiave non l'hanno ratificata e manca un giudice con poteri effettivi."
      },
      {
        "h": "Il Nilo: diritti storici contro diritto allo sviluppo",
        "text": "Circa l'85% dell'acqua del Nilo che arriva in Egitto nasce sugli altopiani etiopici, soprattutto con il Nilo Azzurro. L'accordo del 1959 tra Egitto e Sudan assegnava 55,5 miliardi di metri cubi l'anno all'Egitto e 18,5 al Sudan, senza l'Etiopia. Nel 2011 Addis Abeba ha avviato sul Nilo Azzurro la Grande diga della rinascita etiopica (GERD): oltre 5.000 megawatt di potenza, un bacino di circa 74 miliardi di metri cubi, riempimento a partire dal 2020, elettricità dal 2022. Per l'Etiopia, oltre 120 milioni di abitanti e quasi metà della popolazione senza elettricità all'inizio degli anni Venti, la diga è sviluppo e sovranità, e l'acqua, sostiene Addis Abeba, continua a scorrere a valle. Per l'Egitto, senza un accordo vincolante su riempimento e rilasci in caso di siccità, è una minaccia esistenziale. Il Sudan oscilla tra vantaggi, come piene regolate ed energia a basso costo, e timori per una gestione non coordinata. La dichiarazione di principi firmata dai tre Paesi nel 2015 non è mai diventata un accordo vincolante."
      },
      {
        "h": "Il Mekong: dighe a monte, riso e pesce a valle",
        "text": "Il Mekong, lungo circa 4.900 chilometri, nasce sull'altopiano tibetano e attraversa Cina, Myanmar, Laos, Thailandia, Cambogia e Vietnam. La Cina ha costruito sul corso principale una decina di grandi dighe; il Laos, che punta a diventare la «batteria del Sud-est asiatico», ne ha aggiunte altre e vende gran parte dell'elettricità alla Thailandia. In Cambogia, nella stagione delle piogge, il fiume in piena inverte la corrente del Tonlé Sap, che riempie il grande lago omonimo: è la base di una delle maggiori pesche d'acqua dolce del mondo. Il delta vietnamita produce circa metà del riso del Paese e soffre per sedimenti trattenuti e risalita di acqua salata. Durante la siccità del 2019 uno studio finanziato dagli Stati Uniti ha accusato le dighe cinesi di aver trattenuto acqua; ricercatori cinesi hanno replicato che i bacini avevano invece aumentato i deflussi nella stagione secca. La Commissione del fiume Mekong, creata nel 1995, riunisce i quattro Paesi a valle; la Cina vi partecipa solo come partner di dialogo e dal 2016 promuove un proprio forum, la Cooperazione Lancang-Mekong."
      },
      {
        "h": "Guerre dell'acqua o cooperazione obbligata?",
        "text": "Si parla spesso di future «guerre dell'acqua», ma i dati invitano alla cautela. Gli studi di Aaron Wolf e colleghi all'Oregon State University, su oltre mezzo secolo di rapporti tra Stati che condividono fiumi, hanno contato episodi di cooperazione in numero più che doppio rispetto a quelli conflittuali. Chi sta a monte ha bisogno di vendere energia e di stabilità, chi sta a valle ha poche alternative al negoziato: l'acqua diventa così una leva più che un casus belli. Il cambiamento climatico, però, rende le portate più irregolari e rischia di moltiplicare gli anni magri, quando la domanda decisiva è chi rinuncia a cosa. Davanti a una notizia su una diga conviene chiedersi chi controlla i rilasci, se i dati sono condivisi e se esiste un accordo valido anche in caso di siccità."
      }
    ],
    "facts": [
      "Una diga idroelettrica consuma poca acqua, ma decide quando e quanta ne scende.",
      "Accordo del 1959: 55,5 miliardi di m³ l'anno all'Egitto e 18,5 al Sudan, Etiopia esclusa.",
      "GERD: avviata nel 2011 sul Nilo Azzurro, bacino di circa 74 miliardi di m³.",
      "Commissione del fiume Mekong (1995): quattro Paesi a valle, la Cina solo partner di dialogo.",
      "Sui fiumi condivisi la cooperazione è stata storicamente più frequente del conflitto."
    ],
    "links": [
      "geografia-suez",
      "scienza-effetto-serra",
      "mente-teoria-giochi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Che cosa stabiliva l'accordo del 1959 sulle acque del Nilo?",
        "options": [
          "Una ripartizione in parti uguali tra Egitto, Sudan ed Etiopia",
          "Una ripartizione tra Egitto e Sudan, senza l'Etiopia",
          "Il diritto dell'Etiopia di costruire dighe sul Nilo Azzurro",
          "La cessione all'Egitto dell'intera quota sudanese"
        ],
        "answer": 1,
        "why": "Assegnava 55,5 miliardi di metri cubi l'anno all'Egitto e 18,5 al Sudan; l'Etiopia, da cui viene gran parte dell'acqua, non ne faceva parte e non lo riconosce."
      },
      {
        "type": "comprensione",
        "q": "Perché, nella disputa sulla diga etiopica, i nodi principali sono il riempimento del bacino e la gestione delle siccità?",
        "options": [
          "Perché la diga devia in modo permanente metà del Nilo verso il Mar Rosso",
          "Perché l'elettricità prodotta viene venduta solo all'Egitto",
          "Perché la diga blocca la navigazione commerciale verso il Mediterraneo",
          "Perché la diga consuma poca acqua ma decide quando e quanta ne scende"
        ],
        "answer": 3,
        "why": "Le turbine restituiscono l'acqua al fiume: il rischio per chi sta a valle sta nel calendario dei rilasci, che pesa di più quando il bacino si riempie o quando piove poco."
      },
      {
        "type": "applicazione",
        "q": "Due Paesi condividono un fiume: quello a monte vuole una diga idroelettrica, quello a valle irriga i campi con quell'acqua. Quale accordo affronta il nodo principale?",
        "options": [
          "Regole vincolanti sui rilasci negli anni di siccità e dati idrologici condivisi",
          "Il divieto assoluto per lo Stato a monte di costruire dighe",
          "La cessione allo Stato a valle della proprietà della diga",
          "Un indennizzo una tantum, senza altre regole sui rilasci"
        ],
        "answer": 0,
        "why": "Il conflitto esplode negli anni magri: dati condivisi e regole valide anche in siccità riducono la sfiducia più di qualsiasi promessa generica."
      },
      {
        "type": "comprensione",
        "q": "Secondo gli studi sui fiumi condivisi, perché le tensioni sfociano più spesso in negoziati che in guerre?",
        "options": [
          "Perché il diritto internazionale prevede sanzioni automatiche per chi danneggia",
          "Perché l'ONU gestisce direttamente i grandi fiumi internazionali",
          "Perché entrambe le parti hanno interessi che richiedono un accordo",
          "Perché le dighe non hanno effetti rilevanti sui Paesi a valle"
        ],
        "answer": 2,
        "why": "Chi sta a monte ha bisogno di vendere energia e di stabilità, chi sta a valle ha poche alternative: negli studi di Aaron Wolf la cooperazione è stata più del doppio del conflitto."
      },
      {
        "type": "collegamento",
        "q": "Perché il cambiamento climatico rischia di rendere più tese le dispute su fiumi come il Nilo e il Mekong?",
        "options": [
          "Perché l'aumento della CO₂ riduce direttamente l'acqua dei fiumi",
          "Perché portate più irregolari rendono più frequenti gli anni magri da spartire",
          "Perché il caldo rende inutilizzabili le centrali idroelettriche",
          "Perché lo scioglimento dei ghiacci rende i fiumi navigabili e quindi contesi"
        ],
        "answer": 1,
        "why": "Il nodo dei negoziati è chi rinuncia a cosa quando l'acqua scarseggia: se le siccità diventano più frequenti, quel nodo si presenta più spesso."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché una diga in Etiopia può diventare un problema politico per l'Egitto, anche se l'acqua continua a scorrere.",
      "model": "Il Nilo che arriva in Egitto nasce in gran parte sugli altopiani etiopici, e l'Egitto dipende dal fiume per quasi tutta la sua acqua dolce. Una diga idroelettrica non consuma molta acqua, ma decide quando e quanta ne scende: conta soprattutto mentre il bacino si riempie e negli anni di siccità. L'Etiopia la considera un diritto allo sviluppo, l'Egitto una minaccia finché mancano regole vincolanti sui rilasci. Per questo il nodo non è l'acqua in media, ma chi garantisce cosa negli anni magri.",
      "points": [
        "Asimmetria tra chi sta a monte e chi sta a valle",
        "La diga controlla i tempi più che le quantità medie",
        "Il nodo sono le regole per gli anni di siccità"
      ]
    }
  },
  {
    "id": "diritto-costituzione-italiana",
    "area": "diritto",
    "title": "La Costituzione italiana e la separazione dei poteri",
    "level": 1,
    "minutes": 5,
    "hook": "Lo Statuto Albertino si poteva cambiare con una legge ordinaria, e il fascismo lo svuotò senza mai abrogarlo: per questo i costituenti vollero una Costituzione difficile da modificare.",
    "sections": [
      {
        "h": "Dal referendum del 1946 a una Costituzione rigida",
        "text": "Il 2 giugno 1946 gli italiani scelsero la Repubblica e, nello stesso giorno, elessero un'Assemblea costituente di 556 membri. La Costituzione fu approvata il 22 dicembre 1947 ed entrò in vigore il 1° gennaio 1948. Si apre con i principi fondamentali, prosegue con i diritti e i doveri dei cittadini e si chiude con l'ordinamento della Repubblica. È rigida: per modificarla serve la procedura dell'articolo 138, con due votazioni in ciascuna Camera a distanza di almeno tre mesi e, se nella seconda non si raggiunge la maggioranza dei due terzi, la possibilità di un referendum. La forma repubblicana non può essere oggetto di revisione. La rigidità ha uno scopo preciso: impedire a una maggioranza di passaggio di cambiare le regole del gioco a proprio favore."
      },
      {
        "h": "Tre poteri che si controllano a vicenda",
        "text": "L'idea viene da Montesquieu, che nel 1748 scriveva che per evitare l'abuso il potere deve fermare il potere. Il potere legislativo spetta al Parlamento, formato da Camera e Senato con gli stessi poteri; dopo la riforma confermata dal referendum del 2020 i deputati sono 400 e i senatori elettivi 200. Il potere esecutivo spetta al Governo, che deve avere la fiducia di entrambe le Camere e può essere sfiduciato. Il potere giudiziario spetta alla magistratura, che per l'articolo 104 è «un ordine autonomo e indipendente da ogni altro potere»: assunzioni, trasferimenti e promozioni dei magistrati non dipendono dal Governo ma da organi di autogoverno. L'articolo 101 aggiunge che i giudici sono soggetti soltanto alla legge."
      },
      {
        "h": "Una separazione con molti contrappesi",
        "text": "In Italia la separazione non è rigida come negli Stati Uniti. Il Governo nasce dalla fiducia del Parlamento e, in casi straordinari di necessità e urgenza, può adottare decreti-legge, che valgono subito ma perdono efficacia se il Parlamento non li converte in legge entro 60 giorni. Sopra le parti stanno due garanti. Il Presidente della Repubblica, eletto dal Parlamento in seduta comune con i delegati regionali e in carica sette anni, nomina il Presidente del Consiglio, promulga le leggi e può rinviarle una volta alle Camere chiedendo una nuova deliberazione. La Corte costituzionale, 15 giudici in carica nove anni, operativa dal 1956, giudica se le leggi rispettano la Costituzione. I cittadini non possono rivolgersi a lei direttamente: la questione la solleva un giudice durante un processo, se la ritiene rilevante e non manifestamente infondata."
      },
      {
        "h": "Un caso fiscale e gli errori da evitare",
        "text": "Nel 2015, con la sentenza n. 10, la Corte costituzionale ha dichiarato illegittima la cosiddetta Robin Hood Tax, un'addizionale IRES a carico di imprese del settore energetico, per contrasto con i principi di uguaglianza e capacità contributiva. Ha però stabilito che la decisione valesse solo per il futuro, per non aprire un buco nei conti pubblici: le imprese non hanno recuperato quanto già versato. L'esempio mostra che anche una legge fiscale può cadere, e che gli effetti dipendono da come la Corte modula la decisione. Tra gli errori comuni: pensare che il Presidente della Repubblica scelga liberamente il Governo, che invece ha bisogno della fiducia delle Camere; considerare un decreto-legge una norma definitiva; confondere la Corte costituzionale, che giudica le leggi, con la Corte di cassazione, vertice della giustizia ordinaria. Per un'impresa contano anche l'articolo 41, che dichiara libera l'iniziativa economica privata purché non contrasti con l'utilità sociale, e l'articolo 23, per cui nessuna prestazione patrimoniale può essere imposta se non in base alla legge."
      }
    ],
    "facts": [
      "Referendum istituzionale il 2 giugno 1946; Costituzione in vigore dal 1° gennaio 1948.",
      "Costituzione rigida: si modifica solo con la procedura dell'articolo 138.",
      "Decreto-legge: perde efficacia se non è convertito in legge entro 60 giorni.",
      "Corte costituzionale: 15 giudici in carica nove anni, operativa dal 1956.",
      "Art. 104: la magistratura è un ordine autonomo e indipendente da ogni altro potere."
    ],
    "links": [
      "storia-unita-italia",
      "geopolitica-unione-europea",
      "mente-machiavelli-principe"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Entro quanti giorni un decreto-legge deve essere convertito in legge per non perdere efficacia?",
        "options": [
          "30 giorni",
          "90 giorni",
          "60 giorni",
          "120 giorni"
        ],
        "answer": 2,
        "why": "Se il Parlamento non lo converte entro 60 giorni dalla pubblicazione, il decreto perde efficacia fin dall'inizio, come se non fosse mai esistito."
      },
      {
        "type": "comprensione",
        "q": "Perché i costituenti vollero una Costituzione rigida, modificabile solo con una procedura aggravata?",
        "options": [
          "Per impedire a una maggioranza temporanea di cambiare le regole a proprio vantaggio",
          "Perché lo Statuto Albertino era stato abolito da un referendum",
          "Per permettere al Governo di aggiornarla rapidamente con decreti",
          "Perché lo imponeva il trattato di pace firmato con gli Alleati"
        ],
        "answer": 0,
        "why": "Lo Statuto Albertino era flessibile e il fascismo poté trasformare lo Stato con leggi ordinarie; l'articolo 138 richiede invece un consenso ampio o il voto popolare."
      },
      {
        "type": "applicazione",
        "q": "Un'impresa contesta davanti al giudice tributario un'imposta che ritiene contraria al principio di capacità contributiva. Come può arrivare la questione alla Corte costituzionale?",
        "options": [
          "L'impresa ricorre direttamente alla Corte costituzionale con un proprio atto",
          "La solleva il giudice, se la ritiene rilevante e non manifestamente infondata",
          "Decide la Corte di cassazione, competente sulla costituzionalità delle leggi",
          "L'impresa chiede al Presidente della Repubblica di trasmettere la questione alla Corte"
        ],
        "answer": 1,
        "why": "In Italia il cittadino non ha accesso diretto alla Corte: la questione arriva tramite un giudice, come accadde per la Robin Hood Tax, sollevata da una commissione tributaria."
      },
      {
        "type": "comprensione",
        "q": "Perché nel sistema italiano la separazione tra potere legislativo ed esecutivo non è netta?",
        "options": [
          "Perché il Presidente della Repubblica presiede sia il Governo sia il Parlamento",
          "Perché i ministri sono nominati dalla Corte costituzionale",
          "Perché il Parlamento può annullare le sentenze dei giudici",
          "Perché il Governo dipende dalla fiducia delle Camere e può adottare decreti-legge"
        ],
        "answer": 3,
        "why": "È la logica della repubblica parlamentare: il Governo nasce dal Parlamento e, con i decreti-legge e i decreti legislativi su delega, esercita anche una parte della funzione legislativa."
      },
      {
        "type": "collegamento",
        "q": "Machiavelli descrive il potere com'è, non come dovrebbe essere. Quale principio della Costituzione nasce da un realismo simile?",
        "options": [
          "Dividere il potere, perché chi lo detiene tende ad abusarne",
          "Affidare il potere a un capo forte che garantisca stabilità",
          "Eliminare i partiti per evitare conflitti di interesse",
          "Lasciare che i giudici governino nei momenti di crisi"
        ],
        "answer": 0,
        "why": "Montesquieu parte da una constatazione realistica: invece di sperare in governanti virtuosi, si costruiscono contrappesi perché il potere fermi il potere."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega straniero come è organizzato il potere in Italia e chi controlla chi.",
      "model": "La Costituzione del 1948 divide il potere tra Parlamento, che fa le leggi, Governo, che le attua e deve avere la fiducia delle Camere, e magistratura, autonoma e indipendente. La separazione non è rigida: il Governo nasce dal Parlamento e può adottare decreti-legge, che però decadono se non vengono convertiti entro 60 giorni. Il Presidente della Repubblica e la Corte costituzionale fanno da garanti, il primo promulgando e potendo rinviare le leggi, la seconda annullando quelle incostituzionali. La Costituzione è rigida, quindi le regole del gioco non si cambiano con una semplice maggioranza.",
      "points": [
        "Tre poteri distinti con controlli reciproci",
        "Il Governo dipende dalla fiducia del Parlamento",
        "Presidente e Corte costituzionale garantiscono una Costituzione rigida"
      ]
    }
  },
  {
    "id": "diritto-contratto",
    "area": "diritto",
    "title": "Il contratto: quando una promessa diventa obbligo",
    "level": 1,
    "minutes": 5,
    "hook": "Per comprare una casa serve un atto scritto, ma per vendere un camion di piastrelle può bastare una telefonata: in Italia la regola è la libertà di forma, e le eccezioni contano moltissimo.",
    "sections": [
      {
        "h": "Che cosa rende vincolante un accordo",
        "text": "Il Codice civile del 1942 definisce il contratto all'articolo 1321: l'accordo di due o più parti per costituire, regolare o estinguere tra loro un rapporto giuridico patrimoniale. L'articolo 1325 elenca i requisiti: l'accordo delle parti; la causa, cioè una funzione economica lecita; un oggetto possibile, lecito e determinato o determinabile; la forma, quando la legge la impone a pena di nullità. Il punto chiave è l'articolo 1372: il contratto «ha forza di legge tra le parti» e si scioglie solo per mutuo consenso o per le cause ammesse dalla legge. Una promessa diventa obbligo quando c'è un accordo con questi requisiti, non quando c'è una firma su un foglio."
      },
      {
        "h": "Come e quando si conclude",
        "text": "Il contratto è concluso quando chi ha fatto la proposta viene a conoscenza dell'accettazione dell'altra parte (articolo 1326). Se l'accettazione modifica la proposta, l'accordo non c'è: vale come nuova proposta, che l'altro può accettare o no. La forma è di regola libera: un contratto può nascere a voce, per email o con un comportamento concludente, come iniziare a consegnare la merce ordinata. La legge impone però la forma scritta per alcuni contratti, come i trasferimenti di immobili o le locazioni di immobili oltre i nove anni, e senza di essa il contratto è nullo. Già durante le trattative le parti devono comportarsi secondo buona fede (articolo 1337): chi rompe senza motivo una trattativa avanzata, dopo aver fatto confidare l'altro nella conclusione, può dover risarcire spese sostenute e occasioni perse."
      },
      {
        "h": "Un ordine via email e le clausole in piccolo",
        "text": "Un distributore di pavimenti invia un preventivo con consegna in 30 giorni. Il cliente risponde: «Confermo, ma con consegna entro 15 giorni». Il contratto non è ancora concluso: quella risposta è una controproposta, e il distributore può accettarla o rifiutarla. Supponiamo poi che il preventivo rimandi a condizioni generali che limitano la responsabilità del venditore e fissano il foro competente nella sua città. Per l'articolo 1341 clausole di questo tipo, dette vessatorie, non hanno effetto se l'altra parte non le approva specificamente per iscritto: è il motivo della classica «doppia firma». Inoltre nessuna clausola può escludere o limitare la responsabilità per dolo o colpa grave (articolo 1229). Con i consumatori le regole sono ancora più protettive: il Codice del consumo, per esempio, concede in generale 14 giorni per recedere dagli acquisti a distanza."
      },
      {
        "h": "Quando l'altro non adempie",
        "text": "Se una parte non esegue la sua prestazione, l'altra può scegliere tra chiedere l'adempimento e chiedere la risoluzione del contratto, con il risarcimento del danno in entrambi i casi (articolo 1453), purché l'inadempimento non sia di scarsa importanza. Per evitare una causa si può inviare una diffida ad adempiere, di regola con almeno 15 giorni di tempo, scaduti i quali il contratto si risolve di diritto; oppure prevedere una clausola risolutiva espressa. La clausola penale fissa in anticipo quanto si paga in caso di inadempimento o ritardo, e il giudice può ridurla se è manifestamente eccessiva. La caparra confirmatoria fa da garanzia: se è inadempiente chi l'ha versata, l'altro può recedere e trattenerla; se lo è chi l'ha ricevuta, deve restituirne il doppio. Con l'estero conta anche la legge applicabile: in Indonesia una legge del 2009 impone l'indonesiano nei contratti con parti indonesiane, e nel 2013 un tribunale di Giacarta ha dichiarato nullo un contratto di finanziamento redatto solo in inglese."
      }
    ],
    "facts": [
      "Art. 1321 c.c.: il contratto è un accordo su un rapporto giuridico patrimoniale.",
      "Art. 1372: il contratto ha forza di legge tra le parti.",
      "Un'accettazione che modifica la proposta vale come nuova proposta.",
      "Clausole vessatorie nelle condizioni generali: servono approvazione specifica e per iscritto.",
      "Caparra confirmatoria: chi l'ha ricevuta e non adempie deve restituirne il doppio."
    ],
    "links": [
      "diritto-srl-spa",
      "mente-teoria-giochi",
      "economia-utile-cassa"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Che cosa stabilisce l'articolo 1372 del Codice civile?",
        "options": [
          "Che il contratto è valido solo se redatto per iscritto",
          "Che il contratto ha forza di legge tra le parti",
          "Che il contratto può essere sciolto da una parte in qualunque momento",
          "Che il contratto vincola anche i terzi che ne sono a conoscenza"
        ],
        "answer": 1,
        "why": "Il contratto vincola le parti come una legge e si scioglie solo per mutuo consenso o per cause ammesse dalla legge; di regola non produce effetti verso i terzi."
      },
      {
        "type": "comprensione",
        "q": "Perché la clausola che limita la responsabilità del venditore, inserita nelle sue condizioni generali, deve essere approvata specificamente per iscritto dal cliente?",
        "options": [
          "Perché tutte le clausole di un contratto tra imprese vanno firmate una per una",
          "Perché senza firma specifica l'intero contratto diventa nullo",
          "Perché tra imprese la limitazione di responsabilità è sempre vietata",
          "Perché è una clausola vessatoria che avvantaggia chi ha predisposto le condizioni"
        ],
        "answer": 3,
        "why": "L'articolo 1341 tutela chi aderisce a condizioni scritte dall'altro: senza approvazione specifica per iscritto la clausola non ha effetto, ma il resto del contratto resta valido."
      },
      {
        "type": "applicazione",
        "q": "Un cliente risponde al vostro preventivo: «Accetto, ma con pagamento a 90 giorni anziché a 30». Che cosa è successo dal punto di vista giuridico?",
        "options": [
          "Il cliente ha fatto una controproposta, che potete accettare o rifiutare",
          "Il contratto è concluso alle condizioni del preventivo originale",
          "Il contratto è concluso con il pagamento a 90 giorni",
          "Il contratto è concluso a una via di mezzo, cioè a 60 giorni"
        ],
        "answer": 0,
        "why": "Un'accettazione non conforme alla proposta equivale a una nuova proposta (articolo 1326): finché non la accettate, non c'è contratto."
      },
      {
        "type": "applicazione",
        "q": "Avete ricevuto una caparra confirmatoria di 5.000 euro per una fornitura e poi non consegnate, senza alcuna giustificazione. Che cosa rischiate?",
        "options": [
          "Di dover restituire soltanto i 5.000 euro ricevuti",
          "Nulla, perché la caparra resta comunque a chi la riceve",
          "Che il cliente receda e pretenda 10.000 euro",
          "Una sanzione fissa stabilita dalla Camera di commercio"
        ],
        "answer": 2,
        "why": "Se è inadempiente chi ha ricevuto la caparra confirmatoria, l'altra parte può recedere ed esigere il doppio; in alternativa può chiedere l'adempimento o la risoluzione con il risarcimento del danno."
      },
      {
        "type": "collegamento",
        "q": "Nella teoria dei giochi una promessa è credibile solo se mantenerla conviene. Come cambia il gioco una clausola penale ben calibrata?",
        "options": [
          "Elimina del tutto il bisogno di fidarsi dell'altra parte",
          "Rende più costoso non adempiere, quindi la promessa diventa più credibile",
          "Trasforma il contratto in un gioco a somma zero",
          "Obbliga il giudice a dare ragione a chi l'ha proposta"
        ],
        "answer": 1,
        "why": "La penale modifica i guadagni attesi: inadempiere costa di più e l'impegno diventa credibile. Ma il giudice può ridurla se manifestamente eccessiva, e da sola non elimina il rischio."
      }
    ],
    "explain": {
      "prompt": "Spiega a un nuovo commerciale quando una trattativa con un cliente diventa un contratto vincolante e a che cosa deve fare attenzione.",
      "model": "Un contratto nasce quando proposta e accettazione coincidono e chi ha fatto la proposta viene a sapere che è stata accettata; di regola non serve un modulo firmato, può bastare un'email. Se il cliente accetta cambiando qualcosa, è una controproposta e non c'è ancora accordo. Una volta concluso, il contratto ha forza di legge tra le parti e non si scioglie a piacere. Le clausole vessatorie delle nostre condizioni generali, come limiti di responsabilità o foro competente, valgono solo se il cliente le approva specificamente per iscritto.",
      "points": [
        "Il contratto si conclude con l'incontro tra proposta e accettazione, spesso senza forme",
        "Un'accettazione con modifiche è una nuova proposta",
        "Le clausole vessatorie richiedono un'approvazione scritta specifica"
      ]
    }
  },
  {
    "id": "diritto-srl-spa",
    "area": "diritto",
    "title": "S.r.l. e S.p.A.: responsabilità limitata e governo della società",
    "level": 2,
    "minutes": 5,
    "hook": "Una S.r.l. si può costituire anche con un euro di capitale, ma per concederle un fido la banca chiede spesso la firma personale dei soci: la responsabilità limitata protegge meno di quanto si creda.",
    "sections": [
      {
        "h": "Il patrimonio separato",
        "text": "Nella S.r.l. e nella S.p.A. per le obbligazioni sociali «risponde soltanto la società con il suo patrimonio» (articoli 2462 e 2325 del Codice civile). Se la società non paga, i creditori possono aggredire i suoi beni, non la casa o i risparmi dei soci, che rischiano solo quanto hanno conferito. È un'invenzione potente: permette di intraprendere attività rischiose senza giocarsi tutto e di raccogliere capitali da molti investitori. Ha però un costo: una parte del rischio d'impresa si sposta sui creditori, che si difendono chiedendo garanzie, tassi più alti o pagamenti anticipati. Il capitale minimo è di 50.000 euro per la S.p.A. e di 10.000 per la S.r.l., che dal 2013 può però nascere anche con 1 euro, purché i conferimenti siano in denaro e una parte degli utili venga accantonata a riserva."
      },
      {
        "h": "Due modelli di governo",
        "text": "La S.p.A. è pensata per molti soci e grandi capitali: il capitale è diviso in azioni, che circolano facilmente e, se la società è quotata, si scambiano in Borsa. Le regole sono più rigide e dalla riforma del 2003 si può scegliere tra tre sistemi di amministrazione e controllo: tradizionale, con consiglio di amministrazione e collegio sindacale; dualistico, con consiglio di gestione e consiglio di sorveglianza; monistico, con un comitato di controllo interno al consiglio. La S.r.l. è pensata per pochi soci che si conoscono: le partecipazioni sono quote e l'atto costitutivo può modellare quasi tutto, dall'amministratore unico a più amministratori con firma congiunta o disgiunta, fino a diritti particolari per singoli soci. I soci che non amministrano possono consultare libri e documenti sociali, e sopra certe soglie di attivo, ricavi o dipendenti va nominato un organo di controllo o un revisore. Per confronto, la PT indonesiana affianca alla direksi, che amministra, un consiglio dei commissari che la sorveglia: un sistema a due livelli simile al dualistico."
      },
      {
        "h": "Dove finisce la protezione",
        "text": "La responsabilità limitata ha confini precisi. Il primo è contrattuale: il socio che firma una fideiussione per i debiti della società risponde personalmente fino all'importo garantito. Il secondo riguarda gli amministratori, che rispondono verso la società e verso i creditori se violano i doveri di legge o di statuto. Dal 2019 l'articolo 2086 obbliga chi fa impresa in forma societaria a dotarsi di assetti organizzativi, amministrativi e contabili adeguati, anche per accorgersi in tempo della crisi. I giudici di regola non sindacano il merito delle scelte imprenditoriali, ma verificano che siano state prese con diligenza e informazioni adeguate. Il terzo limite riguarda il socio unico di S.r.l., che in caso di insolvenza risponde illimitatamente se i conferimenti non sono stati versati o se manca la pubblicità prevista. Infine, i finanziamenti dei soci a una S.r.l. sottocapitalizzata vengono rimborsati solo dopo gli altri creditori (articolo 2467), e i rimborsi fatti a ridosso di una procedura di insolvenza possono dover essere restituiti."
      },
      {
        "h": "Un esempio e gli errori più comuni",
        "text": "Una S.r.l. con 20.000 euro di capitale acquista merce per 300.000 euro e poi entra in crisi. I fornitori possono rivalersi su magazzino, crediti e conti della società; i beni personali dei soci restano fuori, salvo fideiussioni, conferimenti non versati o responsabilità degli amministratori, per esempio se chi amministra ha continuato a ordinare merce ignorando segnali evidenti di crisi. Gli errori più comuni sono tre: usare il conto della società per spese personali, confondendo i patrimoni; finanziare la società con prestiti dei soci invece che con capitale, convinti di essere rimborsati per primi; trattare la S.r.l. come una ditta individuale, senza verbali né delibere. Il tipo di società, lo statuto e i patti tra soci vanno sempre definiti con un notaio o un avvocato: le soluzioni cambiano da caso a caso."
      }
    ],
    "facts": [
      "Nelle società di capitali per i debiti sociali risponde solo la società con il suo patrimonio.",
      "Capitale minimo: 50.000 euro per la S.p.A.; 10.000 euro per la S.r.l., che può partire anche da 1 euro.",
      "S.p.A.: sistemi tradizionale, dualistico e monistico.",
      "Fideiussioni personali e responsabilità degli amministratori superano lo schermo della società.",
      "Art. 2467: i finanziamenti dei soci a una S.r.l. sottocapitalizzata sono rimborsati dopo gli altri creditori."
    ],
    "links": [
      "diritto-contratto",
      "economia-utile-cassa",
      "trading-gestione-rischio"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Qual è il capitale sociale minimo di una S.p.A. italiana?",
        "options": [
          "10.000 euro",
          "120.000 euro",
          "50.000 euro",
          "1 euro"
        ],
        "answer": 2,
        "why": "Il minimo per la S.p.A. è 50.000 euro dal 2014 (prima era 120.000); per la S.r.l. è 10.000 euro, con la possibilità di partire da 1 euro."
      },
      {
        "type": "comprensione",
        "q": "Perché la responsabilità limitata ha un costo anche per la società che ne beneficia?",
        "options": [
          "Perché sposta rischio sui creditori, che chiedono garanzie, tassi più alti o anticipi",
          "Perché le società di capitali pagano un'imposta aggiuntiva per la protezione",
          "Perché obbliga i soci a versare nuovo capitale ogni anno",
          "Perché impedisce alla società di ottenere finanziamenti bancari"
        ],
        "answer": 0,
        "why": "I creditori sanno che non potranno rivalersi sui soci e si proteggono: per questo le banche chiedono spesso fideiussioni personali o condizioni più onerose."
      },
      {
        "type": "applicazione",
        "q": "Il socio unico di una S.r.l. ha firmato una fideiussione per il fido bancario della società, che poi diventa insolvente. Che cosa succede?",
        "options": [
          "Il socio non rischia nulla, perché la S.r.l. ha responsabilità limitata",
          "Il socio risponde di tutti i debiti della società verso chiunque",
          "La fideiussione è nulla, perché il socio unico non può garantire la propria società",
          "Il socio risponde personalmente verso la banca fino all'importo garantito"
        ],
        "answer": 3,
        "why": "La fideiussione è un impegno personale: supera lo schermo della società, ma solo verso quel creditore e nei limiti dell'importo garantito."
      },
      {
        "type": "applicazione",
        "q": "Una S.r.l. già molto indebitata riceve un prestito dal socio invece di un aumento di capitale. Se la società entra in crisi, come viene trattato quel prestito?",
        "options": [
          "Viene rimborsato prima degli altri creditori, perché il socio ha rischiato di più",
          "Viene rimborsato solo dopo gli altri creditori",
          "Viene convertito automaticamente in capitale sociale",
          "Viene rimborsato insieme agli altri creditori, in proporzione"
        ],
        "answer": 1,
        "why": "L'articolo 2467 rende postergati i finanziamenti dei soci fatti quando sarebbe stato ragionevole un conferimento di capitale: il socio non può scavalcare i creditori esterni."
      },
      {
        "type": "collegamento",
        "q": "Una S.r.l. chiude il bilancio in utile ma ha la cassa quasi vuota perché i clienti pagano a 120 giorni. Quale dovere degli amministratori diventa centrale?",
        "options": [
          "Distribuire subito l'utile ai soci, visto che il bilancio è positivo",
          "Trasformare la società in S.p.A. per aumentare il capitale",
          "Dotarsi di assetti adeguati a cogliere in tempo i segnali di crisi",
          "Nessuno, perché un bilancio in utile esclude ogni responsabilità"
        ],
        "answer": 2,
        "why": "Un'azienda può entrare in crisi per mancanza di liquidità pur essendo in utile: l'articolo 2086 chiede strumenti organizzativi e contabili per accorgersene in tempo."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico che vuole aprire un'attività che cosa protegge davvero una S.r.l. e che cosa no.",
      "model": "Con una S.r.l. i debiti della società li paga la società con il suo patrimonio: se le cose vanno male, i creditori non possono prendersi la casa dei soci, che rischiano quanto hanno conferito. La protezione però ha limiti: se firmi una fideiussione rispondi personalmente, e se amministri male o ignori i segnali di crisi puoi essere chiamato a risarcire. Anche i prestiti dei soci a una società sottocapitalizzata vengono rimborsati dopo gli altri creditori. La S.p.A. funziona allo stesso modo ma è pensata per più soci e più capitale, con regole di governo più rigide.",
      "points": [
        "Il patrimonio della società è separato da quello dei soci",
        "Fideiussioni e responsabilità degli amministratori sono i limiti principali",
        "La S.r.l. è flessibile per pochi soci, la S.p.A. strutturata per grandi capitali"
      ]
    }
  },
  {
    "id": "diritto-gdpr-privacy",
    "area": "diritto",
    "title": "Privacy e GDPR: cosa si può fare con i dati delle persone",
    "level": 2,
    "minutes": 5,
    "hook": "Il GDPR non chiede il consenso per tutto: per consegnare un ordine o conservare una fattura non serve, e chiederlo quando non serve può persino creare problemi.",
    "sections": [
      {
        "h": "Che cosa protegge e chi riguarda",
        "text": "Il Regolamento generale sulla protezione dei dati, o GDPR (Regolamento UE 2016/679), si applica dal 25 maggio 2018 in tutta l'Unione senza bisogno di recepimento. Protegge i dati personali, cioè qualsiasi informazione su una persona fisica identificata o identificabile: un nome, un'email, un numero di telefono, una targa, in certi casi un indirizzo IP. I dati di una società non sono dati personali, ma il nome e l'email del suo buyer sì. Il titolare del trattamento decide perché e come usare i dati; il responsabile li tratta per suo conto, come il fornitore del CRM in cloud o, di regola, il consulente del lavoro che elabora le buste paga, e va vincolato con un contratto specifico. Il GDPR si applica anche alle imprese fuori dall'UE che offrono beni o servizi a persone nell'Unione o ne monitorano il comportamento."
      },
      {
        "h": "Sei basi giuridiche, non solo il consenso",
        "text": "Ogni trattamento deve poggiare su una delle sei basi dell'articolo 6: consenso, esecuzione di un contratto, obbligo di legge, interessi vitali, interesse pubblico, legittimo interesse del titolare quando non prevale sui diritti della persona. Per spedire un ordine basta il contratto, per conservare le fatture c'è l'obbligo di legge, per una telecamera antifurto si può invocare il legittimo interesse, rispettando le altre regole applicabili (sul lavoro anche quelle dello Statuto dei lavoratori). Il consenso, quando serve, deve essere libero, specifico, informato e revocabile in ogni momento. Valgono poi principi trasversali: raccogliere solo i dati necessari, usarli per le finalità dichiarate, conservarli per il tempo che serve e proteggerli. Il principio di responsabilizzazione, o accountability, obbliga il titolare a saper dimostrare di aver rispettato le regole. Dati sanitari, biometrici, sull'origine etnica o sulle opinioni politiche sono categorie particolari, con regole più severe."
      },
      {
        "h": "Diritti, violazioni e sanzioni",
        "text": "Ogni persona può accedere ai propri dati, farli correggere o cancellare, limitarne l'uso, riceverli in un formato portabile e opporsi in qualsiasi momento al marketing diretto. Il titolare deve rispondere di regola entro un mese. In caso di violazione dei dati, il data breach, va avvisato il Garante entro 72 ore da quando se ne viene a conoscenza, salvo che sia improbabile un rischio per le persone; se il rischio è elevato vanno avvisati anche gli interessati, a meno che i dati siano stati resi incomprensibili, per esempio con la cifratura. Le sanzioni arrivano fino a 20 milioni di euro o al 4% del fatturato mondiale annuo, se superiore. Nel 2023 l'autorità irlandese ha multato Meta per 1,2 miliardi di euro per i trasferimenti di dati verso gli Stati Uniti, e il Garante italiano ha bloccato temporaneamente ChatGPT."
      },
      {
        "h": "Casi pratici per un'azienda",
        "text": "Uno showroom raccoglie le email dei clienti che acquistano. Può inviare loro offerte su prodotti analoghi senza un consenso specifico, purché li abbia informati e offra sempre un modo semplice per opporsi: è l'eccezione del «soft spam» prevista dal Codice privacy italiano. Per chi ha solo chiesto un preventivo, o per contatti acquistati da terzi, di regola serve il consenso, e il Garante ha sanzionato più volte aziende che usavano liste senza verificarne l'origine. Se una società indonesiana vende online a clienti in Italia, il GDPR si applica anche a lei; se un'azienda italiana trasferisce dati di clienti o dipendenti in Indonesia, che non ha una decisione di adeguatezza della Commissione, servono garanzie come le clausole contrattuali standard. L'Indonesia ha intanto una propria legge sulla protezione dei dati, la n. 27 del 2022. Errori classici: chiedere il consenso per tutto, credere che il DPO sia sempre obbligatorio e trascurare il registro dei trattamenti e i contratti con i fornitori."
      }
    ],
    "facts": [
      "GDPR: Regolamento UE 2016/679, applicato dal 25 maggio 2018.",
      "Sei basi giuridiche: il consenso è solo una di esse.",
      "Data breach a rischio per le persone: notifica al Garante entro 72 ore.",
      "Sanzioni fino a 20 milioni di euro o al 4% del fatturato mondiale annuo.",
      "Il GDPR si applica anche alle imprese extra UE che si rivolgono a persone nell'Unione."
    ],
    "links": [
      "tecnologia-crittografia",
      "tecnologia-intelligenza-artificiale",
      "geopolitica-unione-europea"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Entro quanto tempo una violazione dei dati che presenta rischi per le persone va notificata al Garante?",
        "options": [
          "Entro 30 giorni dalla scoperta, con una relazione completa",
          "Entro 24 ore dall'evento, in ogni caso e senza eccezioni",
          "Entro la fine del mese in cui è avvenuta",
          "Entro 72 ore da quando se ne viene a conoscenza"
        ],
        "answer": 3,
        "why": "Il termine decorre da quando il titolare viene a conoscenza della violazione; se le informazioni complete non sono subito disponibili, la notifica si può integrare in seguito."
      },
      {
        "type": "comprensione",
        "q": "Perché per conservare le fatture dei clienti privati non serve il loro consenso?",
        "options": [
          "Perché la base giuridica è un obbligo di legge, non il consenso",
          "Perché i dati contenuti nelle fatture non sono dati personali",
          "Perché il GDPR non si applica ai documenti contabili",
          "Perché il consenso si presume per tutti i clienti abituali"
        ],
        "answer": 0,
        "why": "Il consenso è solo una delle sei basi dell'articolo 6: quando la legge impone di conservare un documento la base è l'obbligo legale, e un consenso revocabile sarebbe fuori luogo."
      },
      {
        "type": "applicazione",
        "q": "Una società indonesiana vende mobili online a clienti privati in Italia e ne raccoglie i dati. Il GDPR la riguarda?",
        "options": [
          "No, perché ha sede fuori dall'Unione Europea",
          "No, perché le si applica soltanto la legge indonesiana",
          "Sì, perché offre beni a persone che si trovano nell'Unione",
          "Solo se ha anche un magazzino in un Paese dell'Unione"
        ],
        "answer": 2,
        "why": "L'articolo 3 estende il GDPR alle imprese extra UE che offrono beni o servizi a persone nell'Unione; la legge indonesiana del 2022 può applicarsi in parallelo."
      },
      {
        "type": "applicazione",
        "q": "Un'azienda carica i dati dei clienti su un CRM in cloud. Che ruolo ha il fornitore del CRM e che cosa serve?",
        "options": [
          "È contitolare e deve chiedere ai clienti un proprio consenso",
          "È responsabile del trattamento e serve un contratto che lo vincoli",
          "È un soggetto estraneo e non serve alcun accordo",
          "È titolare autonomo e risponde da solo di ogni violazione"
        ],
        "answer": 1,
        "why": "Il fornitore tratta i dati per conto del titolare: l'articolo 28 richiede un contratto con istruzioni, misure di sicurezza e obblighi, e il titolare risponde della scelta del fornitore."
      },
      {
        "type": "collegamento",
        "q": "Viene rubato un portatile aziendale con i dati di migliaia di clienti, ma il disco era cifrato con una chiave robusta rimasta al sicuro. Perché la situazione è molto meno grave?",
        "options": [
          "Perché senza la chiave i dati restano illeggibili e il rischio crolla",
          "Perché il GDPR non si applica ai dispositivi portatili",
          "Perché la cifratura rende lecito qualsiasi trattamento",
          "Perché un furto non è mai una violazione dei dati"
        ],
        "answer": 0,
        "why": "Resta una violazione da valutare e documentare, ma se i dati sono incomprensibili a chi non è autorizzato il GDPR esclude l'obbligo di avvisare i singoli interessati."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega del marketing perché il GDPR non significa «chiedere il consenso per tutto».",
      "model": "Il GDPR chiede che ogni uso dei dati personali abbia una base giuridica e una finalità chiara. Il consenso è una delle sei basi: per consegnare un ordine basta il contratto, per conservare le fatture c'è un obbligo di legge, per alcune attività vale il legittimo interesse. Per il marketing via email ai privati, invece, di regola serve il consenso, salvo l'eccezione per i clienti a cui proponiamo prodotti analoghi, informandoli e lasciandoli liberi di opporsi. In ogni caso dobbiamo usare solo i dati necessari, proteggerli e saper dimostrare di aver rispettato le regole.",
      "points": [
        "Ogni trattamento richiede una delle sei basi giuridiche",
        "Il consenso serve in casi specifici, come il marketing",
        "Il titolare deve minimizzare, proteggere e documentare"
      ]
    }
  },
  {
    "id": "diritto-marchi-brevetti",
    "area": "diritto",
    "title": "Marchi, brevetti e diritto d'autore",
    "level": 2,
    "minutes": 5,
    "hook": "Nel 1421 Firenze concesse a Filippo Brunelleschi tre anni di esclusiva su una barca per trasportare marmo: uno dei primi brevetti della storia, con la stessa logica di quelli di oggi.",
    "sections": [
      {
        "h": "Tre strumenti, tre oggetti diversi",
        "text": "Il marchio protegge un segno che distingue i prodotti o i servizi di un'impresa: un nome, un logo, a certe condizioni una forma o un colore. Il brevetto protegge un'invenzione, cioè una soluzione tecnica nuova, inventiva e applicabile industrialmente. Il diritto d'autore protegge le opere dell'ingegno, come testi, fotografie, software e progetti grafici, ma solo nella loro forma espressiva, non le idee. In Italia le regole principali stanno nel Codice della proprietà industriale del 2005 e nella legge sul diritto d'autore del 1941. La logica è sempre uno scambio: la collettività concede un'esclusiva limitata in cambio di innovazione, creatività o informazione chiara per i consumatori. Le idee e il know-how non brevettati si proteggono con accordi di riservatezza e con la tutela dei segreti commerciali."
      },
      {
        "h": "Durata, novità e territorio",
        "text": "Il marchio registrato dura dieci anni dal deposito e si rinnova senza limiti, ma decade se non viene usato seriamente per cinque anni consecutivi. Si registra per classi di prodotti e servizi: le piastrelle ceramiche, per esempio, rientrano nella classe 19, quella dei materiali da costruzione non metallici. Il brevetto dura vent'anni dal deposito e non si rinnova; in Europa l'invenzione deve essere nuova al momento del deposito, quindi mostrarla in fiera o pubblicarla prima può distruggerne la novità. Il diritto d'autore nasce con la creazione, senza registrazione, e dura tutta la vita dell'autore più settant'anni. Marchi e brevetti sono territoriali: valgono solo dove sono registrati. Un marchio si deposita all'UIBM per l'Italia, all'EUIPO per tutta l'Unione o attraverso il sistema internazionale di Madrid; per i brevetti c'è l'Ufficio europeo dei brevetti e, dal 2023, il brevetto con effetto unitario, con un tribunale unificato che ha sedi anche a Milano."
      },
      {
        "h": "Chi è il titolare: dipendenti, agenzie, distributori",
        "text": "Le invenzioni del dipendente assunto e pagato proprio per inventare appartengono al datore di lavoro, e lo stesso vale per il software sviluppato dal dipendente nelle sue mansioni. Con i collaboratori esterni è diverso: se un'agenzia disegna il logo o scatta le foto del catalogo, i diritti economici restano all'autore finché non li cede, e la cessione va provata per iscritto. Un contratto chiaro evita di scoprire anni dopo di non poter usare liberamente il proprio logo. Il caso più insidioso è l'estero. In Indonesia conta chi deposita per primo: se un distributore o un terzo registra a proprio nome il marchio di un produttore italiano, recuperarlo costa tempo e denaro, anche se la Convenzione di Parigi permette al titolare di opporsi alla registrazione fatta dal proprio agente senza autorizzazione. Nel 2015 la Corte suprema indonesiana ha confermato la cancellazione di alcuni marchi IKEA, non usati nel Paese per tre anni, a favore di un'azienda locale che aveva registrato lo stesso nome. Dal 2018 l'Indonesia aderisce al sistema di Madrid."
      },
      {
        "h": "Errori tipici e il prezzo dell'esclusiva",
        "text": "Registrare un dominio internet o iscrivere una ragione sociale non equivale a registrare un marchio, e non protegge da chi ha un marchio anteriore simile. Usare il simbolo ® senza registrazione è vietato. Copiare le foto di prodotto dal sito di un concorrente o di un fornitore senza permesso viola la legge sul diritto d'autore, che tutela anche le fotografie semplici. Anche i grandi inciampano: nel 2018 la Corte di giustizia dell'UE ha confermato che, per tenere come marchio europeo la forma a quattro barrette del KitKat, Nestlé avrebbe dovuto dimostrarne il carattere distintivo in tutta l'Unione, non solo in una parte dei Paesi. L'esclusiva ha poi un prezzo per la collettività: un farmaco brevettato costa di più finché il brevetto non scade e arrivano i generici. È il compromesso su cui si regge il sistema: premiare chi innova senza bloccare per sempre la concorrenza."
      }
    ],
    "facts": [
      "Marchio: dieci anni rinnovabili; decade dopo cinque anni consecutivi di mancato uso.",
      "Brevetto: vent'anni dal deposito; divulgare l'invenzione prima può distruggerne la novità.",
      "Diritto d'autore: nasce con l'opera e dura la vita dell'autore più 70 anni.",
      "Marchi e brevetti valgono solo nei Paesi in cui sono registrati.",
      "La cessione dei diritti d'autore va provata per iscritto."
    ],
    "links": [
      "diritto-contratto",
      "economia-domanda-offerta",
      "storia-rinascimento-firenze"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Quanto dura un brevetto per invenzione in Italia e in Europa?",
        "options": [
          "10 anni, rinnovabili senza limiti",
          "20 anni dal deposito, senza rinnovo",
          "La vita dell'inventore più 70 anni",
          "50 anni dalla concessione"
        ],
        "answer": 1,
        "why": "Il brevetto dura vent'anni dal deposito; i dieci anni rinnovabili sono del marchio, la vita dell'autore più settant'anni del diritto d'autore."
      },
      {
        "type": "comprensione",
        "q": "Perché il diritto d'autore protegge la forma di un'opera ma non l'idea che contiene?",
        "options": [
          "Perché le idee si possono proteggere solo con il marchio",
          "Perché le idee sono già coperte automaticamente da brevetto",
          "Perché la legge italiana non attribuisce valore economico alle idee",
          "Perché un monopolio sulle idee bloccherebbe creatività e concorrenza"
        ],
        "answer": 3,
        "why": "Chiunque può scrivere un manuale sulla posa delle piastrelle, ma non copiare il testo di un altro. Per le idee riservate servono accordi di riservatezza e la tutela dei segreti commerciali."
      },
      {
        "type": "applicazione",
        "q": "Un'azienda vuole presentare in fiera un nuovo sistema di posa che intende brevettare. Che cosa dovrebbe fare prima?",
        "options": [
          "Depositare la domanda di brevetto prima della fiera",
          "Presentarlo e depositare entro un anno, come consente la regola europea",
          "Registrarlo come marchio, che protegge anche le soluzioni tecniche",
          "Nulla, perché il diritto d'autore lo protegge appena viene mostrato"
        ],
        "answer": 0,
        "why": "In Europa la divulgazione prima del deposito può distruggere la novità; il periodo di tolleranza di un anno esiste negli Stati Uniti, non nel sistema europeo."
      },
      {
        "type": "applicazione",
        "q": "Il distributore indonesiano di un marchio italiano propone di registrarlo lui in Indonesia, a proprio nome, «per semplificare». Qual è il rischio principale per il produttore?",
        "options": [
          "Nessuno, perché il marchio registrato in Italia vale anche in Indonesia",
          "Che il marchio decada automaticamente in tutta l'Unione",
          "Che in Indonesia il titolare del marchio diventi il distributore",
          "Che il diritto d'autore sul logo passi allo Stato indonesiano"
        ],
        "answer": 2,
        "why": "I marchi sono territoriali e in Indonesia conta chi deposita per primo: è meglio che il produttore registri a proprio nome, anche tramite il sistema di Madrid, e regoli l'uso nel contratto di distribuzione."
      },
      {
        "type": "collegamento",
        "q": "Perché alla scadenza del brevetto di un farmaco il prezzo tende a scendere molto?",
        "options": [
          "Perché lo Stato impone per legge di dimezzare il prezzo",
          "Perché entrano i generici e il monopolio lascia il posto alla concorrenza",
          "Perché la domanda del farmaco crolla appena scade il brevetto",
          "Perché il produttore originale perde il diritto di venderlo"
        ],
        "answer": 1,
        "why": "Il brevetto crea un monopolio temporaneo; quando scade, la concorrenza dei generici aumenta l'offerta e spinge il prezzo verso i costi di produzione."
      }
    ],
    "explain": {
      "prompt": "Spiega a un socio come proteggere il nome, il logo e un'innovazione tecnica di un nuovo prodotto, anche per venderlo in Asia.",
      "model": "Il nome e il logo si proteggono con il marchio, che va registrato per le classi di prodotto giuste e in ogni Paese o area in cui vogliamo vendere, perché la tutela è territoriale. L'innovazione tecnica si protegge con un brevetto, che dura vent'anni ma va depositato prima di mostrare il prodotto, altrimenti si rischia di perdere la novità. Il logo e le foto sono anche opere protette dal diritto d'autore, quindi se li ha realizzati un'agenzia serve una cessione scritta. In mercati come l'Indonesia conviene registrare prima di entrare, perché conta chi deposita per primo.",
      "points": [
        "Marchio per i segni, brevetto per le invenzioni, diritto d'autore per le opere",
        "La tutela è territoriale: si registra dove si vende",
        "Depositare prima di divulgare e mettere per iscritto le cessioni"
      ]
    }
  },
  {
    "id": "economia-domanda-offerta",
    "area": "economia",
    "title": "Domanda e offerta: come si forma un prezzo",
    "level": 1,
    "minutes": 4,
    "hook": "Il 20 aprile 2020 chi aveva in mano contratti per ricevere petrolio americano a maggio arrivò a pagare pur di liberarsene: il prezzo era sceso sotto zero, e nessuno l'aveva deciso.",
    "sections": [
      {
        "h": "Due curve che si incrociano",
        "text": "La domanda descrive quanto i compratori sono disposti ad acquistare a ogni livello di prezzo: se il prezzo sale, di solito comprano meno, perché rinunciano o passano ad alternative. L'offerta descrive quanto i produttori sono disposti a vendere: se il prezzo sale, producono di più, perché diventa conveniente anche per chi ha costi più alti. Il prezzo di equilibrio è quello a cui le due quantità coincidono. Nessuno lo calcola a tavolino: emerge da milioni di decisioni separate di chi compra e di chi vende."
      },
      {
        "h": "Come il mercato corregge un prezzo sbagliato",
        "text": "Se un prezzo è sopra l'equilibrio, si vende meno di quanto si produce: i magazzini si riempiono e i venditori, per smaltire, scontano. Se è sotto, i compratori sono più dei beni disponibili: compaiono code, liste d'attesa ed esaurimenti, e chi vende capisce che può chiedere di più. Il prezzo funziona quindi come un segnale: uno alto dice ai produttori di produrre di più e ai consumatori di risparmiare quel bene, uno basso dice il contrario. Conviene distinguere due casi che nelle notizie si confondono spesso. Se il prezzo sale perché aumentano i costi, si compra meno. Se sale perché è cresciuta la domanda, per esempio per una moda, si vendono più pezzi a un prezzo più alto."
      },
      {
        "h": "Elasticità: quanto si può dire di no",
        "text": "L'elasticità misura quanto la quantità acquistata reagisce a una variazione di prezzo. Se esistono buoni sostituti, come per una marca di pasta, un rincaro del 10% fa perdere molti clienti: la domanda è elastica. Se il bene è necessario e insostituibile nel breve periodo, come il carburante per chi va al lavoro in auto o un farmaco salvavita, si continua a comprarlo quasi come prima: la domanda è anelastica. Per questo, quando l'offerta di energia cala anche di poco, i prezzi possono impennarsi: i consumi scendono lentamente, e per riportare in equilibrio il mercato servono rincari forti."
      },
      {
        "h": "Aprile 2020: il petrolio sotto zero",
        "text": "Con i lockdown la domanda di carburante crollò: aerei a terra, auto ferme, fabbriche chiuse. L'offerta non poteva adeguarsi in pochi giorni, perché fermare un pozzo è costoso e riavviarlo lo è ancora di più. Il greggio in eccesso finì nei depositi, che si riempirono, compreso il grande snodo di Cushing, in Oklahoma, dove si consegna il petrolio WTI. Il 20 aprile 2020 il contratto future WTI per consegna a maggio chiuse a circa −37 dollari al barile: chi lo aveva in mano e non disponeva di serbatoi doveva pagare qualcuno perché se lo prendesse. I tagli alla produzione e la ripresa dei consumi lo riportarono intorno ai 40 dollari entro l'estate."
      },
      {
        "h": "Prezzi imposti e decisioni d'impresa",
        "text": "Il meccanismo spiega anche cosa succede quando un prezzo viene fissato per legge sotto l'equilibrio: la quantità richiesta supera quella offerta e compaiono scarsità, code o mercati paralleli. Non significa che ogni intervento sia sbagliato, ma che ha un costo da mettere in conto. In azienda la stessa logica aiuta a leggere i segnali: un prodotto che si esaurisce subito, con la lista d'attesa, probabilmente è prezzato sotto quanto il mercato pagherebbe; uno che resta a lungo in magazzino forse è prezzato troppo alto, oppure non è quello che i clienti cercano."
      }
    ],
    "facts": [
      "Se il prezzo sale, la quantità domandata scende e quella offerta sale.",
      "Prezzo di equilibrio: quantità domandata e quantità offerta coincidono.",
      "Sopra l'equilibrio si accumulano invenduti, sotto si formano scarsità e code.",
      "Elasticità: quanto la quantità acquistata reagisce a una variazione di prezzo.",
      "20 aprile 2020: il future WTI di maggio chiude a circa −37 dollari al barile."
    ],
    "links": [
      "economia-inflazione-tassi",
      "geografia-suez",
      "tecnologia-batterie-litio"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Che cosa misura l'elasticità della domanda al prezzo?",
        "options": [
          "Quanto cambia la quantità acquistata quando cambia il prezzo",
          "Quanto cambia il prezzo quando cambiano i costi di produzione",
          "Quanto velocemente un mercato torna al prezzo di equilibrio",
          "Quanto i clienti pagano in più per una marca famosa"
        ],
        "answer": 0,
        "why": "Una domanda elastica reagisce molto ai rincari perché esistono sostituti, una anelastica poco perché il bene è necessario: per questo certi prezzi possono salire tanto senza che i consumi crollino."
      },
      {
        "type": "comprensione",
        "q": "Perché nell'aprile 2020 il prezzo del petrolio WTI poté scendere sotto zero?",
        "options": [
          "Domanda crollata, offerta rigida e depositi quasi pieni",
          "I Paesi produttori decisero di regalarlo per sostenere l'economia",
          "Il dollaro perse all'improvviso gran parte del suo valore",
          "Negli Stati Uniti fu scoperto un giacimento enorme e facile da sfruttare"
        ],
        "answer": 0,
        "why": "Con un'offerta rigida e nessun posto dove stoccarlo, chi doveva ricevere il greggio a maggio preferì pagare pur di non ritirarlo: un caso estremo di eccesso di offerta."
      },
      {
        "type": "applicazione",
        "q": "Un governo fissa per legge, per un bene molto richiesto, un prezzo massimo molto sotto quello di mercato. Cosa prevede il modello?",
        "options": [
          "Scarsità e code, perché si chiede più di quanto si offre",
          "Più offerta, perché i venditori recuperano con i volumi",
          "Nessun effetto, perché il prezzo di mercato resta lo stesso",
          "Un eccesso di merce invenduta sugli scaffali dei negozi"
        ],
        "answer": 0,
        "why": "A un prezzo sotto l'equilibrio più persone vogliono comprare e meno produttori trovano conveniente vendere: il tetto non crea il bene, lo raziona."
      },
      {
        "type": "applicazione",
        "q": "Una nuova collezione di gres presentata in showroom va esaurita in pochi giorni e si forma una lista d'attesa. Che segnale ti sta dando il mercato?",
        "options": [
          "Che probabilmente il prezzo è sotto l'equilibrio di mercato",
          "Che il prezzo è troppo alto e conviene fare subito uno sconto",
          "Che la domanda di quel prodotto è destinata a calare presto",
          "Che l'offerta del fornitore supera la domanda dei clienti"
        ],
        "answer": 0,
        "why": "Esaurimenti e liste d'attesa sono i sintomi classici di un prezzo sotto l'equilibrio; se invece la merce resta ferma in magazzino, il segnale è opposto."
      },
      {
        "type": "collegamento",
        "q": "Quando un canale come Suez si blocca, come accadde con la nave Ever Given nel 2021, perché i noli marittimi tendono a salire?",
        "options": [
          "Si riduce l'offerta di trasporto, mentre la domanda resta quasi uguale",
          "Gli armatori chiedono all'improvviso molte più navi di grandi dimensioni",
          "Le compagnie devono pagare all'Egitto pedaggi molto più alti",
          "Il prezzo del carburante navale crolla e molte navi si fermano"
        ],
        "answer": 0,
        "why": "Navi bloccate o costrette al giro dell'Africa equivalgono a meno capacità di trasporto: con una domanda di spedizioni rigida nel breve periodo, il prezzo del servizio sale."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega perché, senza che nessuno lo decida, il prezzo di un bene tende a fermarsi a un certo livello e a muoversi quando qualcosa cambia.",
      "model": "Chi compra vuole meno merce quando il prezzo sale, chi vende ne offre di più. Se il prezzo è troppo alto restano invenduti e i venditori scontano; se è troppo basso si formano code e chi vende alza. Così il prezzo si assesta dove le due quantità si incontrano. Quando cambia qualcosa, come i costi, una moda o un blocco dei trasporti, l'equilibrio si sposta, e quanto si muove il prezzo dipende da quanto i compratori possono rinunciare al bene.",
      "points": [
        "La domanda scende e l'offerta sale al crescere del prezzo",
        "Eccedenze e scarsità spingono il prezzo verso l'equilibrio",
        "L'elasticità decide quanto il prezzo reagisce agli shock"
      ]
    }
  },
  {
    "id": "economia-interesse-composto",
    "area": "economia",
    "title": "L'interesse composto: il tempo che lavora per te (o contro di te)",
    "level": 1,
    "minutes": 4,
    "hook": "Perché 10.000 euro al 7% diventano circa 20.000 in dieci anni, e un debito di carta di credito fa lo stesso al contrario.",
    "sections": [
      {
        "h": "L'idea",
        "text": "Con l'interesse semplice guadagni sempre sulla stessa somma: 10.000 euro al 5% danno 500 euro l'anno, ogni anno. Con l'interesse composto gli interessi maturati si aggiungono al capitale e, dall'anno dopo, producono interessi anche loro. Il primo anno guadagni 500 euro, il secondo il 5% di 10.500, cioè 525, il terzo il 5% di 11.025, e così via. La differenza all'inizio è minima; col tempo diventa enorme, perché la crescita dipende da quanto hai già accumulato."
      },
      {
        "h": "La formula e la regola del 72",
        "text": "Il capitale finale è C × (1 + r)ⁿ, dove r è il tasso annuo e n il numero di anni. Per fare i conti a mente si usa la regola del 72: dividendo 72 per il tasso percentuale ottieni, in modo approssimato, gli anni necessari per raddoppiare. Al 6% servono circa 12 anni, al 9% circa 8, al 2% circa 36. La regola funziona bene per tassi tra il 2% e il 12% circa ed è utile per confrontare in fretta due alternative."
      },
      {
        "h": "Un esempio concreto",
        "text": "Due persone investono 200 euro al mese a un rendimento medio del 6% annuo. Anna comincia a 25 anni e smette a 35: versa 24.000 euro in tutto. Bruno comincia a 35 e continua fino a 65: versa 72.000 euro. A 65 anni Anna, che ha versato un terzo dei soldi, ha comunque una cifra paragonabile a quella di Bruno, perché i suoi primi versamenti hanno avuto trent'anni in più per comporsi. Il fattore decisivo non è stato quanto, ma quando."
      },
      {
        "h": "Il lato oscuro: debiti e costi",
        "text": "Lo stesso meccanismo lavora contro di te nei debiti. Un saldo di carta revolving al 18% annuo, se non lo riduci, raddoppia in circa 4 anni. Funziona così anche sui costi: una commissione dell'1,5% l'anno su un investimento sembra piccola, ma su trent'anni può portarsi via una parte rilevante del capitale finale, perché toglie ogni anno anche i rendimenti futuri di ciò che preleva. Per questo nei confronti tra prodotti finanziari i costi annui contano quasi quanto i rendimenti promessi."
      }
    ],
    "facts": [
      "Interesse composto: gli interessi producono altri interessi.",
      "Formula: C × (1 + r)ⁿ.",
      "Regola del 72: 72 ÷ tasso% ≈ anni per raddoppiare.",
      "Iniziare prima conta più di versare di più.",
      "Lo stesso meccanismo moltiplica debiti e costi annui."
    ],
    "links": [
      "matematica-crescita-esponenziale",
      "economia-inflazione-tassi",
      "trading-gestione-rischio"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Con la regola del 72, in quanti anni circa raddoppia un capitale investito all'8% annuo?",
        "options": [
          "Circa 9 anni",
          "Circa 12 anni",
          "Circa 6 anni",
          "Circa 15 anni"
        ],
        "answer": 0,
        "why": "72 diviso 8 fa 9: è una stima, ma molto vicina al valore esatto (circa 9 anni)."
      },
      {
        "type": "comprensione",
        "q": "Perché la differenza tra interesse semplice e composto è piccola all'inizio e grande dopo molti anni?",
        "options": [
          "Perché nel composto la crescita di ogni anno dipende da quanto si è già accumulato",
          "Perché le banche alzano il tasso dopo i primi anni",
          "Perché l'interesse semplice viene tassato di più",
          "Perché nel composto il tasso aumenta automaticamente ogni anno"
        ],
        "answer": 0,
        "why": "Il tasso resta uguale: cambia la base su cui si calcola, che cresce ogni anno con gli interessi già maturati."
      },
      {
        "type": "applicazione",
        "q": "Due fondi rendono entrambi il 6% lordo l'anno, ma uno costa lo 0,3% annuo e l'altro il 2%. Su 30 anni cosa succede?",
        "options": [
          "Il fondo più caro rende molto meno, perché il costo annuo si compone come un rendimento negativo",
          "Finiscono quasi uguali, perché la differenza di costo è piccola",
          "Il fondo più caro rende di più, perché costa di più",
          "Dipende solo da quale dei due ha più clienti"
        ],
        "answer": 0,
        "why": "Un costo annuo agisce come un interesse composto al contrario: l'1,7% di differenza ogni anno, su 30 anni, pesa moltissimo sul capitale finale."
      },
      {
        "type": "comprensione",
        "q": "Nell'esempio di Anna e Bruno, perché Anna arriva a una cifra simile pur avendo versato un terzo dei soldi?",
        "options": [
          "Perché i suoi versamenti hanno avuto molti più anni per comporsi",
          "Perché ha avuto un rendimento più alto di Bruno",
          "Perché ha pagato meno tasse",
          "Perché ha investito in un prodotto diverso"
        ],
        "answer": 0,
        "why": "Stesso rendimento per entrambi: a fare la differenza è il tempo, che nell'interesse composto conta più dell'importo versato."
      },
      {
        "type": "collegamento",
        "q": "Se l'inflazione è al 3% e il tuo conto rende l'1%, cosa succede al potere d'acquisto dei tuoi risparmi nel tempo?",
        "options": [
          "Diminuisce, e la perdita si compone anno dopo anno",
          "Aumenta, perché il conto rende qualcosa",
          "Resta uguale, perché inflazione e interessi si annullano",
          "Dipende solo dalla banca scelta"
        ],
        "answer": 0,
        "why": "Il rendimento reale è circa 1% − 3% = −2% l'anno: anche la perdita di potere d'acquisto segue la logica dell'interesse composto."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché conviene iniziare a risparmiare presto, anche con poco.",
      "model": "Con l'interesse composto i rendimenti si aggiungono al capitale e producono a loro volta rendimenti. Più anni lasci lavorare i soldi, più la crescita accelera, perché ogni anno parte da una base più alta. Per questo chi comincia presto con poco può arrivare dove arriva chi comincia tardi con molto. Lo stesso vale al contrario per debiti e costi annui.",
      "points": [
        "Gli interessi producono altri interessi",
        "Il tempo conta più dell'importo",
        "Vale anche al contrario per debiti e costi"
      ]
    }
  },
  {
    "id": "economia-inflazione-tassi",
    "area": "economia",
    "title": "Inflazione e tassi d'interesse: cosa fa la BCE",
    "level": 2,
    "minutes": 5,
    "hook": "Per far scendere i prezzi al supermercato, la Banca centrale europea rende più cari mutui e prestiti. Sembra un controsenso, ma è esattamente il meccanismo.",
    "sections": [
      {
        "h": "L'inflazione: soldi che valgono meno",
        "text": "L'inflazione è l'aumento generale e persistente dei prezzi. Non riguarda un singolo bene, ma un paniere che rappresenta i consumi delle famiglie: nell'area euro si misura con l'indice armonizzato dei prezzi al consumo, calcolato con gli stessi criteri in tutti i Paesi. Il suo effetto è erodere il potere d'acquisto. Con un'inflazione del 2% l'anno, dopo dieci anni 100 euro comprano quello che oggi costa circa 82 euro. Ci perde chi tiene liquidità o ha prestato denaro a tasso fisso; ci guadagna, in termini reali, chi ha un debito a tasso fisso, perché lo restituisce con euro che valgono meno."
      },
      {
        "h": "Il mandato della BCE e la sua leva",
        "text": "La Banca centrale europea, con sede a Francoforte, ha come compito principale la stabilità dei prezzi. Dal 2021 il suo obiettivo è un'inflazione del 2% nel medio termine, inteso in modo simmetrico: scostamenti sopra e sotto sono considerati ugualmente indesiderati. Le decisioni le prende il Consiglio direttivo, formato dal Comitato esecutivo e dai governatori delle banche centrali nazionali dell'area euro. La leva principale sono i tassi ufficiali, cioè il prezzo a cui le banche si finanziano presso la BCE o vi depositano la loro liquidità. Negli ultimi anni il riferimento più seguito è il tasso sui depositi."
      },
      {
        "h": "Da Francoforte al supermercato",
        "text": "Quando la BCE alza i tassi, alle banche costa di più procurarsi denaro e lo fanno pagare di più a chi chiede prestiti: salgono l'Euribor, i mutui variabili, i finanziamenti alle imprese. Famiglie e aziende si indebitano meno, rinviano acquisti e investimenti, e risparmiare diventa più conveniente. La domanda complessiva rallenta e con essa la spinta sui prezzi. L'effetto non è immediato: si stima che servano spesso tra uno e due anni perché un rialzo si trasmetta pienamente. Abbassare i tassi produce l'effetto opposto e si usa quando l'economia è debole e l'inflazione rischia di restare sotto l'obiettivo."
      },
      {
        "h": "2022-2023: la stretta più rapida della storia dell'euro",
        "text": "Dopo le riaperture post-pandemia e l'invasione russa dell'Ucraina, nel febbraio 2022, i prezzi dell'energia esplosero e l'inflazione dell'area euro superò il 10%, con un picco del 10,6% a ottobre 2022. I tassi non producono gas, ma la BCE temeva che i rincari si trasmettessero a salari e aspettative, alimentandosi da soli. Tra luglio 2022 e settembre 2023 alzò i tassi dieci volte di fila, portando il tasso sui depositi da −0,5% al 4%, e l'Euribor passò da valori negativi a circa il 4%. Su un mutuo variabile da 150.000 euro a 25 anni, passare da un tasso complessivo dell'1% al 5% porta la rata da circa 565 a circa 880 euro al mese. Con l'inflazione in calo verso il 2%, da giugno 2024 la BCE iniziò a ridurre i tassi. Quanto del calo dei prezzi si debba alla stretta e quanto al ribasso dell'energia è ancora discusso tra gli economisti."
      },
      {
        "h": "Tassi reali e punti base: leggere le notizie",
        "text": "Il numero che conta non è il tasso nominale, ma quello reale: in prima approssimazione, tasso nominale meno inflazione. Un conto deposito al 3% con inflazione al 5% fa perdere circa il 2% di potere d'acquisto l'anno; un prestito al 2% con inflazione all'8% è, in termini reali, quasi un regalo per chi lo ha ricevuto. Quando si legge che la BCE ha alzato i tassi di 25 punti base, significa 0,25 punti percentuali: un punto base è un centesimo di punto. E non conta solo la decisione del giorno, ma anche ciò che la banca centrale lascia intendere sulle mosse future, perché i mercati la anticipano."
      }
    ],
    "facts": [
      "Obiettivo della BCE: inflazione al 2% nel medio termine, in modo simmetrico (dal 2021).",
      "Tassi più alti → credito più caro → meno domanda → meno pressione sui prezzi.",
      "Gli effetti di una mossa sui tassi arrivano spesso dopo uno o due anni.",
      "Luglio 2022–settembre 2023: dieci rialzi, tasso sui depositi da −0,5% al 4%.",
      "Tasso reale ≈ tasso nominale − inflazione.",
      "25 punti base = 0,25 punti percentuali."
    ],
    "links": [
      "economia-interesse-composto",
      "economia-utile-cassa",
      "geopolitica-unione-europea"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Qual è l'obiettivo di inflazione della BCE dopo la revisione della strategia del 2021?",
        "options": [
          "Il 2% nel medio termine, in modo simmetrico",
          "Lo 0%, cioè prezzi perfettamente stabili nel tempo",
          "Un valore inferiore all'1% ogni anno",
          "Il 3%, per favorire la crescita economica"
        ],
        "answer": 0,
        "why": "Simmetrico significa che anche restare a lungo sotto il 2% è considerato un problema, non solo superarlo."
      },
      {
        "type": "comprensione",
        "q": "Perché alzare i tassi aiuta a frenare l'inflazione?",
        "options": [
          "Perché rende il credito più caro e frena la spesa",
          "Perché obbliga per legge le imprese a contenere i listini",
          "Perché aumenta la quantità di moneta in circolazione",
          "Perché riduce le imposte su chi risparmia in banca"
        ],
        "answer": 0,
        "why": "La BCE non tocca i prezzi direttamente: agisce sul costo del denaro, che raffredda la domanda complessiva e, con un ritardo, la crescita dei prezzi."
      },
      {
        "type": "comprensione",
        "q": "Nel 2022 l'inflazione era spinta soprattutto dall'energia, che i tassi non possono produrre. Perché la BCE li alzò comunque?",
        "options": [
          "Per evitare che i rincari passassero a salari e aspettative",
          "Perché tassi più alti spingono ad aumentare l'estrazione di gas",
          "Perché i trattati la obbligano a seguire le scelte della Fed",
          "Per ridurre più in fretta il debito pubblico degli Stati"
        ],
        "answer": 0,
        "why": "Il timore era una spirale in cui prezzi più alti portano a salari più alti e viceversa: tenere ancorate le aspettative è una parte centrale del lavoro di una banca centrale."
      },
      {
        "type": "applicazione",
        "q": "Hai un mutuo a tasso variabile legato all'Euribor e la BCE avvia una serie di rialzi. Cosa ti aspetti?",
        "options": [
          "Che la rata salga nei mesi successivi",
          "Che la rata resti uguale fino alla scadenza",
          "Che la rata scenda, perché l'inflazione riduce il debito",
          "Che cambino solo i tassi dei nuovi mutui"
        ],
        "answer": 0,
        "why": "L'Euribor segue da vicino i tassi della BCE e il mutuo variabile si aggiorna con lui; l'inflazione riduce il valore reale del debito, ma non la rata nominale."
      },
      {
        "type": "collegamento",
        "q": "Con un'inflazione costante del 3% l'anno, cosa succede in circa 24 anni al potere d'acquisto di una somma tenuta ferma su un conto senza interessi?",
        "options": [
          "Si dimezza, più o meno",
          "Si riduce di circa un quarto",
          "Scende di circa il 3% in tutto",
          "Resta uguale, perché la cifra non cambia"
        ],
        "answer": 0,
        "why": "È la regola del 72 al contrario: 72 diviso 3 dà 24 anni. L'inflazione si compone come un interesse, ma a tuo sfavore."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché la BCE alza i tassi quando i prezzi corrono, e cosa c'entra la rata del suo mutuo.",
      "model": "La BCE ha il compito di tenere l'inflazione intorno al 2%. Quando i prezzi corrono, alza i tassi a cui le banche si finanziano, e le banche fanno pagare di più mutui e prestiti. Famiglie e imprese spendono e investono meno, la domanda rallenta e con il tempo anche i prezzi. La rata del mutuo variabile sale proprio perché fa parte di questo raffreddamento, che agisce con ritardi di uno o due anni.",
      "points": [
        "L'obiettivo è un'inflazione al 2% nel medio termine",
        "I tassi rendono il credito più caro e frenano la domanda",
        "Gli effetti arrivano con ritardo e pesano su chi è indebitato"
      ]
    }
  },
  {
    "id": "economia-utile-cassa",
    "area": "economia",
    "title": "Utile e cassa: perché un'azienda in utile può fallire",
    "level": 2,
    "minutes": 5,
    "hook": "Un'azienda può chiudere l'anno con un utile record e, nello stesso mese, non avere i soldi per pagare gli stipendi. Non è un trucco contabile: è il modo in cui molte imprese sane finiscono in crisi.",
    "sections": [
      {
        "h": "Due orologi diversi: competenza e cassa",
        "text": "Il conto economico segue il principio di competenza: un ricavo si registra quando la vendita è fatta, un costo quando si riferisce a quel periodo, indipendentemente da quando passano i soldi. La cassa segue un solo criterio: quando il denaro entra o esce davvero dal conto. Se vendi a dicembre e il cliente paga a marzo, il ricavo sta nell'utile di quest'anno, ma i soldi arrivano l'anno prossimo. L'utile misura se l'attività crea valore; la cassa decide se l'azienda riesce a pagare i conti in scadenza. Si fallisce per mancanza di cassa, non di utile."
      },
      {
        "h": "Dove si nascondono i soldi",
        "text": "Tre voci separano più spesso i due orologi. La prima sono i crediti verso clienti: ogni fattura non ancora incassata è utile già contato ma cassa assente. La seconda è il magazzino: la merce comprata e pagata ma non ancora venduta assorbe denaro senza toccare l'utile. La terza sono gli investimenti: un macchinario da 500.000 euro pagato subito e destinato a durare dieci anni pesa sull'utile solo con l'ammortamento, cioè, a quote costanti, 50.000 euro l'anno, ma esce dal conto tutto insieme. A queste si aggiungono il rimborso dei debiti, che non è un costo ma consuma cassa, e le imposte, calcolate sull'utile anche quando i crediti non sono ancora incassati."
      },
      {
        "h": "La commessa che fa utile e svuota il conto",
        "text": "Un distributore di pavimenti compra materiale per 100.000 euro, da pagare al fornitore a 30 giorni, e lo rivende a un'impresa edile per 140.000 euro, incassabili a 120 giorni. Sulla carta il margine è di 40.000 euro. Ma per 90 giorni l'azienda deve anticipare 100.000 euro senza aver ancora incassato nulla, e se nel frattempo arrivano altre commesse simili il buco si somma. È il paradosso della crescita: più vendi a queste condizioni, più cassa ti serve. Lo riassume il ciclo di cassa, cioè i giorni di incasso dai clienti più i giorni di giacenza in magazzino meno i giorni di pagamento ai fornitori. Più è lungo, più capitale circolante bisogna finanziare, con mezzi propri o con debito."
      },
      {
        "h": "Il caso Carillion",
        "text": "Carillion era uno dei maggiori gruppi britannici di costruzioni e servizi pubblici. Il bilancio 2016 mostrava utili e la società distribuiva dividendi. Ma i margini su molti grandi contratti erano contabilizzati in base a stime ottimistiche, prima di essere incassati, mentre la cassa veniva sostenuta pagando i fornitori anche a 120 giorni. Nel luglio 2017 arrivò una svalutazione di oltre 800 milioni di sterline sui contratti; il 15 gennaio 2018 la società fu messa in liquidazione, lasciando migliaia di fornitori e subappaltatori non pagati."
      },
      {
        "h": "Cosa guardare per non farsi sorprendere",
        "text": "Il documento che racconta la cassa è il rendiconto finanziario, che spiega da dove sono arrivati e dove sono finiti i soldi nell'anno. In Italia è obbligatorio dal 2016 per le società che redigono il bilancio ordinario, mentre le più piccole, che usano quello abbreviato, ne sono esonerate. In un'impresa piccola il documento annuale non basta: serve una previsione di cassa sui mesi successivi, che metta in fila incassi attesi e uscite certe. E nelle trattative i termini di pagamento contano quanto il prezzo: trenta giorni in più concessi a un cliente sono un finanziamento gratuito che gli stai facendo."
      }
    ],
    "facts": [
      "L'utile segue la competenza (quando vendi), la cassa segue i soldi (quando incassi o paghi).",
      "Crediti verso clienti, magazzino e investimenti assorbono cassa senza ridurre l'utile.",
      "Ciclo di cassa = giorni incasso clienti + giorni di magazzino − giorni pagamento fornitori.",
      "Crescere in fretta con incassi lenti può consumare più cassa di quanta se ne generi.",
      "Carillion, in utile nel bilancio 2016, fu messa in liquidazione il 15 gennaio 2018."
    ],
    "links": [
      "diritto-contratto",
      "diritto-srl-spa",
      "economia-inflazione-tassi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Come si calcola il ciclo di cassa?",
        "options": [
          "Giorni incasso clienti + giorni di magazzino − giorni pagamento fornitori",
          "Giorni pagamento fornitori + giorni di magazzino − giorni incasso clienti",
          "Giorni incasso clienti − giorni di magazzino − giorni pagamento fornitori",
          "Giorni di magazzino + giorni pagamento fornitori + giorni incasso clienti"
        ],
        "answer": 0,
        "why": "Misura per quanti giorni l'azienda deve finanziare da sé il proprio giro d'affari: fornitori pagati più tardi lo accorciano, clienti lenti e magazzino pieno lo allungano."
      },
      {
        "type": "comprensione",
        "q": "Perché un'azienda in utile può restare senza liquidità?",
        "options": [
          "Perché i ricavi si contano alla vendita, non all'incasso",
          "Perché l'utile va versato tutto allo Stato come imposta",
          "Perché le banche trattengono l'utile fino all'approvazione del bilancio",
          "Perché il costo del personale non entra nel conto economico"
        ],
        "answer": 0,
        "why": "Utile e cassa usano orologi diversi: tra la vendita e l'incasso, e tra l'acquisto e la vendita, l'azienda deve anticipare denaro."
      },
      {
        "type": "comprensione",
        "q": "Un'impresa compra e paga subito un macchinario da 500.000 euro che durerà dieci anni. Cosa succede quell'anno?",
        "options": [
          "La cassa scende di 500.000, l'utile solo dell'ammortamento",
          "Utile e cassa scendono entrambi di 500.000 euro",
          "L'utile scende di 500.000 euro, la cassa solo di 50.000",
          "Né utile né cassa cambiano finché il macchinario non produce"
        ],
        "answer": 0,
        "why": "Con l'ammortamento il costo dell'investimento si spalma sugli anni di utilizzo, ma il pagamento esce dal conto tutto subito."
      },
      {
        "type": "applicazione",
        "q": "Un cliente propone un ordine grande e con un buon margine, ma vuole pagare a 150 giorni, mentre il tuo fornitore va pagato a 30. Qual è la prima domanda da farsi?",
        "options": [
          "Come finanzio i 120 giorni di scopertura e quanto mi costa",
          "Quanto utile mi farà registrare questa vendita a fine anno",
          "Se questo ordine mi fa crescere più dei concorrenti",
          "Se posso emettere subito la fattura per anticipare i ricavi"
        ],
        "answer": 0,
        "why": "Il margine conta solo se l'azienda arriva all'incasso senza restare a secco: per 120 giorni quell'ordine va finanziato, e il costo del finanziamento riduce il guadagno vero."
      },
      {
        "type": "collegamento",
        "q": "Se la BCE alza i tassi, perché un'azienda con un ciclo di cassa lungo ne soffre più di altre?",
        "options": [
          "Perché finanzia a debito crediti e magazzino, e quel debito costa di più",
          "Perché i suoi ricavi vengono tassati con un'aliquota più alta dell'anno prima",
          "Perché la legge la obbliga a ridurre i prezzi di vendita ai clienti",
          "Perché il suo utile, per legge, non può più essere distribuito ai soci"
        ],
        "answer": 0,
        "why": "Il capitale circolante va finanziato: con tassi più alti ogni giorno di attesa dell'incasso costa di più, e i margini si assottigliano."
      }
    ],
    "explain": {
      "prompt": "Spiega a un socio perché il bilancio dice che guadagniamo, ma il conto corrente è quasi vuoto.",
      "model": "L'utile registra le vendite quando le facciamo, la cassa quando i clienti pagano davvero. In mezzo ci sono le fatture ancora da incassare, la merce in magazzino già pagata e gli investimenti pagati subito ma ammortizzati in più anni. Se i clienti pagano a 120 giorni e noi paghiamo i fornitori a 30, ogni vendita in più ci chiede di anticipare soldi. Per questo dobbiamo guardare il ciclo di cassa e una previsione degli incassi, non solo l'utile.",
      "points": [
        "Competenza e cassa sono orologi diversi",
        "Crediti, magazzino e investimenti assorbono liquidità",
        "Termini di pagamento e previsione di cassa vanno gestiti attivamente"
      ]
    }
  },
  {
    "id": "trading-gestione-rischio",
    "area": "economia",
    "title": "Gestione del rischio: sopravvivere prima di guadagnare",
    "level": 3,
    "minutes": 6,
    "hook": "Se perdi il 50% del capitale, per tornare in pari non ti basta un +50%: ti serve un +100%.",
    "sections": [
      {
        "h": "L'aritmetica crudele delle perdite",
        "text": "Perdite e guadagni non sono simmetrici. Dopo un −10% serve un +11% per recuperare, dopo un −25% un +33%, dopo un −50% un +100%, dopo un −90% un +900%. Il motivo è che il recupero si calcola su una base più piccola. Per questo chi opera sui mercati con continuità mette al primo posto il contenimento delle perdite massime, il cosiddetto drawdown: finché il capitale resta in gran parte intatto si possono sfruttare le occasioni successive, mentre una perdita profonda può richiedere anni per essere recuperata, ammesso che succeda. Questa scheda descrive principi generali a scopo educativo, non consigli d'investimento."
      },
      {
        "h": "Quanto rischiare: il dimensionamento della posizione",
        "text": "Il rischio di un'operazione non è quanto investi, ma quanto perdi se hai torto. Molti operatori esperti fissano questa perdita massima in una piccola percentuale del capitale, spesso tra l'1 e il 2%, e ne ricavano la dimensione della posizione. Con 20.000 euro e un rischio dell'1%, la perdita accettabile è 200 euro. Se compri un titolo a 50 euro e decidi di uscire a 47,50, rischi 2,50 euro per azione: puoi comprarne 80, cioè una posizione da 4.000 euro. La dimensione discende dallo stop, non dall'entusiasmo. Lo stop però non è garantito: se il prezzo apre in forte ribasso, l'uscita avviene più in basso del previsto."
      },
      {
        "h": "Aspettativa: vincere spesso non basta",
        "text": "Quello che conta è l'aspettativa: la percentuale di operazioni vincenti moltiplicata per il guadagno medio, meno la percentuale di perdenti moltiplicata per la perdita media. Una strategia che vince l'80% delle volte guadagnando 1 e perdendo 5 ha un'aspettativa di 0,8 − 1,0 = −0,2 per operazione: perde soldi pur vincendo quasi sempre. Una che vince solo il 40% delle volte, ma guadagna in media il triplo di quanto perde, ha 1,2 − 0,6 = +0,6. Le serie negative, poi, sono normali: con una probabilità di successo del 50%, su qualche centinaio di operazioni è probabile incontrare sei o sette perdite di fila. Rischiando l'1% per volta, dieci perdite consecutive costano circa il 10% del capitale; rischiando il 10%, se ne va circa il 65%."
      },
      {
        "h": "Leva e correlazione: i moltiplicatori nascosti",
        "text": "La leva permette di muovere una posizione più grande del capitale versato e moltiplica allo stesso modo guadagni e perdite: con una leva di 10 a 1, un movimento avverso del 10% azzera il margine. Per questo nell'Unione Europea, dal 2018, la leva sui CFD offerti ai clienti al dettaglio è limitata: per esempio 30 a 1 sulle principali coppie di valute e 2 a 1 sulle criptovalute. Le regole, introdotte dall'ESMA, l'autorità europea dei mercati, obbligano anche i broker a dichiarare quale percentuale dei conti dei clienti perde denaro: di solito ben più della metà. Un altro moltiplicatore nascosto è la correlazione: comprare euro contro dollaro e sterlina contro dollaro sembrano due operazioni, ma spesso sono quasi la stessa scommessa sul dollaro."
      },
      {
        "h": "Il nemico interno: l'avversione alle perdite",
        "text": "Daniel Kahneman e Amos Tversky, con la teoria del prospetto del 1979, mostrarono che le perdite pesano più dei guadagni della stessa entità: nelle stime successive, circa il doppio. Sui mercati questo produce un errore classico: si chiudono in fretta le operazioni in guadagno per incassare la soddisfazione, e si tengono quelle in perdita sperando che tornino in pari, magari spostando lo stop più lontano. È l'esatto opposto di ciò che serve. Le difese sono semplici da dire e difficili da praticare: decidere rischio e uscita prima di entrare, metterli per iscritto, rispettarli, e giudicare le decisioni dal processo seguito e non dal singolo risultato."
      }
    ],
    "facts": [
      "Dopo un −50% serve un +100% per tornare in pari; dopo un −25%, circa +33%.",
      "Rischio per operazione = perdita se scatta lo stop, spesso l'1–2% del capitale.",
      "Numero di azioni = rischio in euro ÷ distanza tra ingresso e stop.",
      "Aspettativa = % vincite × guadagno medio − % perdite × perdita media.",
      "UE, dal 2018: leva sui CFD per i clienti al dettaglio limitata (es. 30:1 sulle valute principali)."
    ],
    "links": [
      "economia-interesse-composto",
      "mente-bias-cognitivi",
      "mente-stoicismo"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Un portafoglio perde il 25%. Che rendimento serve per tornare al valore iniziale?",
        "options": [
          "Circa +33%",
          "+25%",
          "Circa +20%",
          "+50%"
        ],
        "answer": 0,
        "why": "Il recupero si calcola sul 75% rimasto: 25 diviso 75 fa un terzo. Più la perdita è profonda, più lo squilibrio cresce."
      },
      {
        "type": "comprensione",
        "q": "Perché nella gestione del rischio evitare le grandi perdite conta più che inseguire i grandi guadagni?",
        "options": [
          "Perché più si perde, più il recupero diventa sproporzionato",
          "Perché le perdite sono tassate più dei guadagni della stessa entità",
          "Perché i broker chiudono il conto dopo una perdita molto forte",
          "Perché ai clienti al dettaglio i guadagni molto grandi sono vietati"
        ],
        "answer": 0,
        "why": "Una perdita del 50% richiede il 100% per essere recuperata: proteggere il capitale tiene aperta la possibilità di sfruttare le occasioni future."
      },
      {
        "type": "applicazione",
        "q": "Hai 10.000 euro e decidi di rischiare l'1% per operazione. Compri un titolo a 40 euro con lo stop a 38. Quante azioni compri al massimo?",
        "options": [
          "50 azioni",
          "250 azioni",
          "2 azioni",
          "100 azioni"
        ],
        "answer": 0,
        "why": "Il rischio ammesso è 100 euro e ogni azione ne rischia 2 (da 40 a 38): 100 ÷ 2 = 50 azioni, cioè una posizione da 2.000 euro."
      },
      {
        "type": "applicazione",
        "q": "La strategia A vince il 70% delle volte guadagnando 1 e perdendo 3; la B vince il 35% delle volte guadagnando 3 e perdendo 1. Quale ha aspettativa positiva?",
        "options": [
          "Solo la B",
          "Solo la A",
          "Entrambe",
          "Nessuna delle due"
        ],
        "answer": 0,
        "why": "A: 0,7 × 1 − 0,3 × 3 = −0,2. B: 0,35 × 3 − 0,65 × 1 = +0,4. La frequenza delle vincite non dice nulla senza la loro dimensione."
      },
      {
        "type": "collegamento",
        "q": "Quale errore tipico del trading nasce dall'avversione alle perdite descritta da Kahneman e Tversky?",
        "options": [
          "Spostare lo stop più lontano per non chiudere in perdita",
          "Rischiare su ogni operazione una percentuale troppo piccola del capitale",
          "Chiudere troppo presto le operazioni in perdita",
          "Distribuire il capitale su troppi mercati diversi"
        ],
        "answer": 0,
        "why": "Chiudere in perdita rende la perdita definitiva, e la mente cerca di evitarlo: così le perdite piccole diventano grandi. Lo stop deciso prima serve proprio a togliere questa scelta al momento peggiore."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico che vuole iniziare a fare trading perché la prima cosa da decidere non è cosa comprare, ma quanto rischiare.",
      "model": "Le perdite pesano più dei guadagni: dopo un −50% serve un +100% per tornare in pari, quindi la priorità è non subire perdite profonde. Per questo si decide prima quanto si è disposti a perdere su ogni operazione, di solito una piccola percentuale del capitale, e da lì si calcola quante quote comprare in base allo stop. Una strategia va giudicata sull'aspettativa, non su quante volte vince. E bisogna prepararsi alla propria testa, che tende a tenere le perdite e tagliare i guadagni.",
      "points": [
        "Le perdite si recuperano in modo asimmetrico",
        "La dimensione della posizione deriva dal rischio e dallo stop",
        "Contano aspettativa e disciplina, non la frequenza delle vincite"
      ]
    }
  },
  {
    "id": "tecnologia-internet",
    "area": "tecnologia",
    "title": "Come funziona internet: pacchetti, protocolli e cavi sottomarini",
    "level": 2,
    "minutes": 5,
    "hook": "Quando da Milano apri un sito ospitato negli Stati Uniti, i tuoi dati quasi certamente non passano dallo spazio: viaggiano come impulsi di luce in un cavo appoggiato sul fondo dell'oceano.",
    "sections": [
      {
        "h": "Una rete di reti, senza un centro",
        "text": "Internet non è un'unica rete con un proprietario: è l'interconnessione di decine di migliaia di reti indipendenti, di operatori telefonici, università, aziende e fornitori di cloud, che si accordano per scambiarsi traffico. L'antenata è ARPANET, finanziata dal Dipartimento della Difesa americano, che nel 1969 collegò i primi computer di università e centri di ricerca. Il 1° gennaio 1983 adottò i protocolli TCP/IP, ancora oggi alla base di tutto. L'Italia si collegò il 30 aprile 1986, dal CNUCE di Pisa. Il web è un'altra cosa: è uno dei servizi che viaggiano su internet, come la posta elettronica o le videochiamate, e fu inventato da Tim Berners-Lee al CERN di Ginevra tra il 1989 e il 1991."
      },
      {
        "h": "Pacchetti e indirizzi",
        "text": "Quando invii un file, questo viene spezzato in pacchetti, piccoli blocchi di dati con un'intestazione che contiene, come una busta, l'indirizzo IP del mittente e quello del destinatario. Ogni pacchetto viaggia per conto suo: i router, i computer che smistano il traffico, lo passano di nodo in nodo verso la destinazione, scegliendo di volta in volta la strada in base alle loro tabelle. Pacchetti dello stesso file possono prendere percorsi diversi e arrivare in disordine. Questo sistema permette a milioni di utenti di condividere le stesse linee e di aggirare un collegamento guasto. Gli indirizzi IPv4, a 32 bit, sono circa 4,3 miliardi e non bastano più: per questo è in corso il passaggio a IPv6, a 128 bit."
      },
      {
        "h": "I protocolli: chi fa cosa",
        "text": "Il protocollo IP si limita a far arrivare i pacchetti, senza garanzie. Sopra lavora TCP, che li numera, chiede conferma di ricezione, ritrasmette quelli persi e li rimette in ordine, rallentando se la rete è congestionata. Per le videochiamate si usa spesso UDP, più rapido e senza ritrasmissioni, perché un pacchetto arrivato tardi non serve più. Il DNS è la rubrica: traduce un nome come wikipedia.org nell'indirizzo IP del server. Il BGP, infine, è il protocollo con cui le reti si annunciano a vicenda quali indirizzi sanno raggiungere. Il 4 ottobre 2021 Facebook, Instagram e WhatsApp sparirono per circa sei ore: un errore durante una manutenzione scollegò la rete interna dell'azienda, i suoi server DNS smisero di annunciare le proprie rotte e il resto di internet non sapeva più dove trovarli."
      },
      {
        "h": "La parte fisica: luce sul fondo del mare",
        "text": "Sotto i protocolli c'è una realtà molto materiale. I dati viaggiano come impulsi di luce nelle fibre ottiche, a circa 200.000 chilometri al secondo, due terzi della velocità della luce nel vuoto. Tra i continenti la quasi totalità del traffico passa da alcune centinaia di cavi sottomarini: in mare aperto sono spessi più o meno come un tubo da giardino e, ogni 50-100 chilometri circa, hanno ripetitori che rinforzano il segnale. La maggior parte dei guasti è causata da ancore e reti da pesca, e navi specializzate li riparano. La fisica pone un limite che nessuna tecnologia aggira: tra Milano e New York, oltre 6.000 chilometri in linea d'aria, un segnale impiega almeno 30 millisecondi solo per l'andata."
      },
      {
        "h": "Colli di bottiglia e perché contano",
        "text": "Una rete senza centro non è una rete senza punti deboli. Molti cavi tra Europa e Asia attraversano l'Egitto e il Mar Rosso, altri passano per lo Stretto di Malacca o approdano in poche città costiere come Marsiglia. Un danno in questi punti rallenta il traffico di intere regioni finché non viene deviato o riparato. Per un'azienda questo significa che velocità e affidabilità dipendono anche dalla geografia: dove sta il server, quali percorsi esistono, quanti fornitori diversi si usano. Il cloud, alla fine, è fatto di edifici e cavi molto concreti."
      }
    ],
    "facts": [
      "Internet è una rete di reti; il web è uno dei servizi che ci viaggiano sopra.",
      "ARPANET collega i primi computer nel 1969 e adotta TCP/IP il 1° gennaio 1983.",
      "I dati viaggiano in pacchetti con l'indirizzo IP di mittente e destinatario.",
      "TCP ritrasmette e riordina i pacchetti; il DNS traduce i nomi in indirizzi IP.",
      "La quasi totalità del traffico intercontinentale passa da cavi sottomarini in fibra ottica.",
      "L'Italia si collega a internet il 30 aprile 1986, dal CNUCE di Pisa."
    ],
    "links": [
      "geografia-suez",
      "geopolitica-stretto-malacca",
      "tecnologia-crittografia"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Qual è la differenza tra internet e il web?",
        "options": [
          "Internet è la rete, il web uno dei suoi servizi",
          "Sono due nomi diversi per la stessa cosa",
          "Il web è la rete fisica, internet è il software che la governa",
          "Internet è nata al CERN, il web negli Stati Uniti"
        ],
        "answer": 0,
        "why": "Il web, nato al CERN tra il 1989 e il 1991, è solo uno dei servizi che viaggiano su internet, insieme a posta elettronica, videochiamate e molto altro."
      },
      {
        "type": "comprensione",
        "q": "Perché internet divide i dati in pacchetti invece di aprire una linea dedicata come il vecchio telefono?",
        "options": [
          "Perché così molti utenti condividono le linee e si aggirano i guasti",
          "Perché i pacchetti piccoli viaggiano nella fibra più veloci della luce",
          "Perché le leggi sulla privacy vietano di inviare un file intero in una volta",
          "Perché i cavi sottomarini riescono a trasportare solo blocchi di dati piccoli"
        ],
        "answer": 0,
        "why": "Con i pacchetti nessuna linea resta occupata da una sola conversazione, e ogni pacchetto può trovare una strada alternativa se un collegamento cade."
      },
      {
        "type": "applicazione",
        "q": "Il sito aziendale non si apre digitandone il nome, ma si apre se scrivi direttamente il suo indirizzo IP. Dove sta probabilmente il problema?",
        "options": [
          "Nel DNS, che non traduce correttamente il nome",
          "Nel server del sito, che è spento",
          "Nei cavi sottomarini tra l'Italia e il server",
          "Nel protocollo TCP, che perde tutti i pacchetti"
        ],
        "answer": 0,
        "why": "Se l'indirizzo IP funziona, server e collegamento sono a posto: manca il passaggio che trasforma il nome nell'indirizzo, cioè il DNS."
      },
      {
        "type": "comprensione",
        "q": "Nel blackout di Facebook del 4 ottobre 2021, perché il resto di internet non riusciva più a trovare i servizi dell'azienda?",
        "options": [
          "Perché le sue rotte non venivano più annunciate alle altre reti",
          "Perché un cavo sottomarino nell'Atlantico era stato tranciato da un'ancora",
          "Perché un attacco informatico aveva cifrato tutti i suoi dati",
          "Perché i certificati di sicurezza dei suoi siti erano scaduti"
        ],
        "answer": 0,
        "why": "Per le altre reti un indirizzo esiste solo se qualcuno lo annuncia via BGP: quando i server DNS di Facebook smisero di farlo, diventarono introvabili."
      },
      {
        "type": "collegamento",
        "q": "Perché l'Egitto e il Mar Rosso sono un punto delicato anche per internet, oltre che per le navi?",
        "options": [
          "Perché molti cavi sottomarini tra Europa e Asia passano da lì",
          "Perché lì si trovano i principali server DNS del mondo",
          "Perché da lì si lanciano i satelliti che servono l'Asia",
          "Perché l'Egitto assegna gli indirizzi IP di tutto il Medio Oriente"
        ],
        "answer": 0,
        "why": "La stessa geografia che fa di Suez un collo di bottiglia per le merci concentra lì anche i cavi: la scorciatoia tra Europa e Asia è la stessa."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico che cosa succede, in pochi passaggi, quando digita l'indirizzo di un sito e preme Invio.",
      "model": "Prima il computer chiede al DNS quale indirizzo IP corrisponde al nome del sito. Poi la richiesta viene spezzata in pacchetti, ognuno con mittente e destinatario, che i router passano di rete in rete fino al server. TCP controlla che arrivino tutti e nell'ordine giusto, ritrasmettendo quelli persi. Fisicamente i pacchetti viaggiano come luce nelle fibre ottiche e, se il server è in un altro continente, passano da cavi sottomarini.",
      "points": [
        "Il DNS traduce il nome in indirizzo IP",
        "I dati viaggiano in pacchetti instradati dai router e controllati da TCP",
        "Il percorso fisico è fatto di fibre ottiche e cavi sottomarini"
      ]
    }
  },
  {
    "id": "tecnologia-intelligenza-artificiale",
    "area": "tecnologia",
    "title": "Intelligenza artificiale: cosa fanno davvero i modelli linguistici",
    "level": 2,
    "minutes": 5,
    "hook": "Un modello linguistico, a ogni passo, fa una cosa sola: stima quale frammento di parola è più probabile che venga dopo. Da questo gesto ripetuto nascono testi, codice e traduzioni, ma anche errori detti con totale sicurezza.",
    "sections": [
      {
        "h": "Un frammento alla volta",
        "text": "Un modello linguistico non legge lettere né parole come noi. Il testo viene spezzato in token, frammenti che possono essere una parola intera, una sillaba o un segno di punteggiatura, e ogni token diventa una sequenza di numeri. Dato tutto il testo precedente, il modello calcola una probabilità per ogni token del suo vocabolario, ne sceglie uno, lo aggiunge al testo e ricomincia. Una risposta di trecento parole è il risultato di qualche centinaio di questi passaggi. Una certa dose di casualità nella scelta fa sì che la stessa domanda possa ricevere risposte diverse."
      },
      {
        "h": "Come impara: miliardi di numeri regolati sui testi",
        "text": "Il modello è una rete neurale, cioè un'enorme funzione matematica governata da parametri, numeri che all'inizio sono casuali. GPT-3, nel 2020, ne aveva 175 miliardi. Nell'addestramento il modello legge quantità immense di testo e, a ogni token, prova a indovinare il successivo; l'errore viene misurato e tutti i parametri vengono corretti di pochissimo nella direzione che lo riduce. Ripetuto su centinaia o migliaia di miliardi di token, con migliaia di processori specializzati al lavoro per settimane o mesi, questo processo produce un modello che ha assorbito grammatica, fatti, stili e schemi di ragionamento. Una seconda fase, con esempi scritti da persone e valutazioni umane delle risposte, lo trasforma in un assistente che segue istruzioni."
      },
      {
        "h": "L'architettura che ha cambiato tutto",
        "text": "Quasi tutti i modelli attuali si basano sul Transformer, presentato da un gruppo di ricercatori di Google nel 2017 nell'articolo «Attention Is All You Need». La sua idea centrale è il meccanismo di attenzione: per interpretare ogni token, il modello pesa quanto sono rilevanti tutti gli altri token del contesto. Nella frase «Il trofeo non entra nella valigia perché è troppo grande», è l'attenzione a collegare «troppo grande» al trofeo e non alla valigia. Il Transformer elabora il testo in parallelo e si presta a essere ingrandito: finora più dati, più parametri e più calcolo hanno prodotto modelli sempre più capaci. ChatGPT, lanciato il 30 novembre 2022, ha fatto conoscere questa tecnologia a tutti."
      },
      {
        "h": "Perché sembra capire, e perché sbaglia",
        "text": "Per prevedere bene il testo, il modello deve essersi costruito rappresentazioni interne utili: per questo sa riassumere, tradurre, scrivere codice e affrontare problemi nuovi. Ma i fatti non sono archiviati come in una banca dati: sono distribuiti nei parametri, e il modello genera ciò che è plausibile, che di solito coincide con ciò che è vero ma non sempre. Quando non coincide si parla di allucinazione: una citazione, una cifra o una sentenza inventata, scritta con la stessa sicurezza di una vera. Nel 2023, a New York, due avvocati furono sanzionati per aver depositato in tribunale una memoria con precedenti inventati da ChatGPT, nel caso Mata contro Avianca. Il modello, inoltre, conosce il mondo solo fino alla data dei suoi dati di addestramento, a meno che non sia collegato a strumenti di ricerca."
      },
      {
        "h": "Usarli bene al lavoro",
        "text": "I modelli linguistici rendono di più dove l'errore si vede subito o costa poco: bozze, riassunti, traduzioni, riscritture, idee, codice da provare. Rendono meno dove servono riferimenti esatti, cifre o notizie recenti, che vanno sempre verificati sulle fonti. Poiché la risposta dipende da tutto ciò che il modello riceve, il contesto conta: dire chi è il destinatario e che tono serve, dare un esempio, incollare il documento da cui partire. Chiedere al modello stesso se ciò che ha scritto è corretto non è una verifica. E prima di inserire dati di clienti o documenti riservati in un servizio online conviene sapere come quel servizio li tratta."
      }
    ],
    "facts": [
      "Un modello linguistico genera testo prevedendo un token alla volta.",
      "Token: frammento di parola trasformato in numeri.",
      "Transformer: architettura presentata da ricercatori di Google nel 2017 («Attention Is All You Need»).",
      "GPT-3 (2020) aveva 175 miliardi di parametri.",
      "Allucinazione: contenuto plausibile ma falso, scritto con la stessa sicurezza del vero.",
      "ChatGPT è stato lanciato il 30 novembre 2022."
    ],
    "links": [
      "geopolitica-taiwan-chip",
      "diritto-gdpr-privacy",
      "mente-bias-cognitivi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "In che anno è stata presentata l'architettura Transformer, su cui si basano quasi tutti i modelli linguistici attuali?",
        "options": [
          "2017",
          "2012",
          "2020",
          "2022"
        ],
        "answer": 0,
        "why": "L'articolo «Attention Is All You Need» di ricercatori di Google è del 2017; il 2020 è l'anno di GPT-3, il 2022 quello del lancio di ChatGPT."
      },
      {
        "type": "comprensione",
        "q": "Perché un modello linguistico può inventare una sentenza o una fonte che non esiste?",
        "options": [
          "Perché genera testo plausibile, non lo copia da fonti verificate",
          "Perché è programmato per inventare quando non conosce la risposta",
          "Perché cerca sempre su internet e a volte trova siti falsi",
          "Perché sceglie le parole del tutto a caso dal suo vocabolario"
        ],
        "answer": 0,
        "why": "I fatti sono sparsi nei parametri, non archiviati: il modello produce ciò che suona giusto, e il plausibile non sempre coincide con il vero."
      },
      {
        "type": "comprensione",
        "q": "Che cosa fa il meccanismo di attenzione in un Transformer?",
        "options": [
          "Valuta quali parti del contesto contano per interpretare un token",
          "Decide quali utenti hanno la priorità di accesso al server",
          "Controlla che la risposta finale non contenga errori di fatto o di calcolo",
          "Memorizza in modo permanente le conversazioni di ogni utente"
        ],
        "answer": 0,
        "why": "È ciò che permette di capire, per esempio, a quale nome si riferiscono un pronome o un aggettivo, guardando tutto il resto della frase."
      },
      {
        "type": "applicazione",
        "q": "Devi preparare per un cliente una nota con riferimenti normativi precisi. Come conviene usare un modello linguistico?",
        "options": [
          "Per bozza e struttura, verificando ogni riferimento alla fonte",
          "Copiando i riferimenti che propone, perché li ha imparati dai testi",
          "Chiedendo al modello di confermare che i riferimenti sono corretti",
          "Evitandolo del tutto, perché non è in grado di scrivere testi tecnici"
        ],
        "answer": 0,
        "why": "Il modello è utile per scrivere e organizzare, ma i riferimenti possono essere inventati; chiedergli di verificarsi da solo non basta, perché la conferma nasce dallo stesso meccanismo."
      },
      {
        "type": "collegamento",
        "q": "Perché lo sviluppo dei grandi modelli linguistici lega l'intelligenza artificiale alla geopolitica dei semiconduttori?",
        "options": [
          "Perché servono enormi quantità di chip avanzati, prodotti da pochissime aziende",
          "Perché i dati di addestramento devono restare nei Paesi che producono i chip",
          "Perché i chip servono solo a usare i modelli, non ad addestrarli",
          "Perché ogni nuovo modello deve essere approvato dai governi che producono chip"
        ],
        "answer": 0,
        "why": "Le migliaia di processori usati per l'addestramento sono tra i chip più avanzati al mondo, e la loro produzione è concentrata in pochissimi impianti, in buona parte a Taiwan."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega scettico che cosa fa davvero un modello come ChatGPT e perché a volte sbaglia con sicurezza.",
      "model": "Un modello linguistico spezza il testo in frammenti e, a ogni passo, calcola quale frammento è più probabile che venga dopo, poi ripete. Ha imparato queste probabilità leggendo enormi quantità di testo e correggendo miliardi di parametri, e così ha assorbito grammatica, fatti e schemi di ragionamento. Ma non consulta un archivio: produce ciò che è plausibile, e a volte il plausibile è falso. Per questo è ottimo per bozze e riassunti, mentre cifre e riferimenti vanno verificati.",
      "points": [
        "Genera testo prevedendo un token alla volta",
        "Ha imparato da enormi quantità di testo regolando miliardi di parametri",
        "Produce il plausibile, non il verificato: le allucinazioni vanno messe in conto"
      ]
    }
  },
  {
    "id": "tecnologia-crittografia",
    "area": "tecnologia",
    "title": "La crittografia: come si tiene un segreto in pubblico",
    "level": 3,
    "minutes": 6,
    "hook": "Ogni volta che paghi online, tu e il sito vi accordate su una chiave segreta parlando su una rete che chiunque può intercettare. Sembra impossibile: è un'idea matematica del 1976.",
    "sections": [
      {
        "h": "Il segreto sta nella chiave, non nel metodo",
        "text": "Secondo Svetonio, Giulio Cesare cifrava i messaggi spostando ogni lettera di tre posizioni nell'alfabeto. Un sistema così cade con l'analisi delle frequenze, descritta già nel IX secolo dallo studioso arabo al-Kindi: in ogni lingua alcune lettere compaiono più spesso di altre, e la regolarità resta visibile anche nel testo cifrato. Nel 1883 il linguista olandese Auguste Kerckhoffs fissò il principio che guida ancora oggi la crittografia: un sistema deve restare sicuro anche se il nemico conosce tutto, tranne la chiave. Per questo gli algoritmi seri sono pubblici e studiati da tutti, e diffidare di chi vende un metodo «segreto e quindi inviolabile» è segno di competenza."
      },
      {
        "h": "Una chiave sola e il problema di consegnarla",
        "text": "Nella crittografia simmetrica la stessa chiave serve a cifrare e a decifrare. Gli algoritmi moderni, come l'AES, adottato come standard negli Stati Uniti nel 2001, sono velocissimi e, con chiavi abbastanza lunghe, considerati sicuri: provare tutte le combinazioni di una chiave a 128 bit richiederebbe un tempo enormemente superiore all'età dell'universo. Il problema è un altro: come fanno due parti che non si sono mai incontrate a condividere la chiave? Per secoli la risposta è stata un corriere fidato. Su internet, dove un negozio dovrebbe scambiare chiavi con milioni di sconosciuti, non può funzionare."
      },
      {
        "h": "La svolta del 1976: la chiave pubblica",
        "text": "Nel 1976 Whitfield Diffie e Martin Hellman mostrarono come due persone possano costruire un segreto comune scambiandosi solo messaggi pubblici. Nel 1977 Ron Rivest, Adi Shamir e Leonard Adleman, al MIT, presentarono RSA. Solo nel 1997 si seppe che alcuni matematici dei servizi segreti britannici ci erano arrivati, in segreto, qualche anno prima. L'idea è una coppia di chiavi: una pubblica, che si può distribuire a chiunque, e una privata, che resta al proprietario. Ciò che si cifra con la pubblica si decifra solo con la privata. Tutto poggia su funzioni facili da calcolare in un senso e difficilissime nell'altro: moltiplicare due numeri primi di centinaia di cifre è immediato, risalire ai due fattori partendo dal prodotto è, con i computer attuali, praticamente impossibile. La stessa coppia permette la firma digitale: chi firma usa la propria chiave privata, e chiunque può verificare con quella pubblica che il documento viene da lui e non è stato alterato."
      },
      {
        "h": "Cosa succede dietro il lucchetto",
        "text": "Il lucchetto del browser indica che è attivo il protocollo TLS, la «S» di HTTPS, che combina i due mondi. Prima il sito presenta un certificato, firmato digitalmente da un'autorità di certificazione di cui il browser si fida: così sai di parlare davvero con la tua banca e non con un impostore. Poi browser e server usano un metodo a chiave pubblica, di solito una variante di Diffie-Hellman, per costruire una chiave di sessione che non transita mai in rete. Da lì in avanti i dati sono cifrati con un algoritmo simmetrico come l'AES, molto più rapido sui grandi volumi. Le stesse firme digitali hanno anche valore legale: nell'Unione Europea, con il regolamento eIDAS del 2014, la firma elettronica qualificata equivale alla firma autografa."
      },
      {
        "h": "Dove si rompe davvero, e il futuro quantistico",
        "text": "Gli attacchi riusciti raramente rompono la matematica: sfruttano persone e implementazioni, con password deboli, email di phishing, chiavi private rubate o software scritto male. Il rischio di lungo periodo sono i computer quantistici. Nel 1994 Peter Shor dimostrò che un computer quantistico abbastanza grande potrebbe scomporre in fattori i grandi numeri e risolvere problemi affini in tempi ragionevoli, rompendo RSA e Diffie-Hellman. Macchine simili oggi non esistono, ma i dati intercettati adesso potrebbero essere decifrati domani. Per questo nel 2024 l'istituto americano NIST ha pubblicato i primi standard di crittografia post-quantistica, basati su problemi che nemmeno un computer quantistico dovrebbe saper risolvere in fretta."
      }
    ],
    "facts": [
      "Principio di Kerckhoffs (1883): il sistema dev'essere sicuro anche se tutto è noto tranne la chiave.",
      "Simmetrica: una sola chiave, veloce (es. AES, standard dal 2001), ma va condivisa.",
      "Chiave pubblica: Diffie-Hellman (1976) e RSA (1977).",
      "RSA si basa sulla difficoltà di scomporre in fattori primi un numero enorme.",
      "HTTPS: certificato per l'identità, chiave pubblica per accordarsi, chiave simmetrica per i dati.",
      "2024: il NIST pubblica i primi standard di crittografia post-quantistica."
    ],
    "links": [
      "tecnologia-internet",
      "tecnologia-blockchain",
      "diritto-contratto"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Su quale problema matematico si basa la sicurezza di RSA?",
        "options": [
          "La difficoltà di scomporre in fattori primi un numero enorme",
          "La difficoltà di trovare numeri primi con centinaia di cifre",
          "L'impossibilità di calcolare tutte le cifre di pi greco",
          "La regolarità con cui compaiono le lettere nei testi di ogni lingua"
        ],
        "answer": 0,
        "why": "Trovare grandi numeri primi e moltiplicarli è facile; risalire ai fattori partendo dal prodotto è ciò che, con i computer attuali, resta impraticabile."
      },
      {
        "type": "comprensione",
        "q": "Quale problema risolve la crittografia a chiave pubblica rispetto a quella simmetrica?",
        "options": [
          "Permette di accordarsi su un segreto senza consegnarlo",
          "Rende molto più veloce la cifratura dei file di grandi dimensioni",
          "Elimina del tutto la necessità di usare delle chiavi",
          "Rende inutile verificare l'identità di chi sta dall'altra parte"
        ],
        "answer": 0,
        "why": "La simmetrica è rapida ma richiede di consegnare la chiave; la chiave pubblica elimina quel passaggio, ed è per questo che i due sistemi lavorano insieme."
      },
      {
        "type": "applicazione",
        "q": "Un fornitore ti propone un software con un algoritmo di cifratura «proprietario e segreto, quindi inviolabile». Perché un esperto diffida?",
        "options": [
          "Perché la sicurezza deve stare nella chiave, non nel metodo",
          "Perché gli algoritmi segreti sono vietati dalla normativa europea",
          "Perché un algoritmo segreto è sempre più lento di uno pubblico",
          "Perché i browser rifiutano qualsiasi algoritmo che non sia pubblico"
        ],
        "answer": 0,
        "why": "È il principio di Kerckhoffs: un metodo pubblico, attaccato invano per anni dai migliori esperti, offre garanzie che un metodo nascosto non può dare."
      },
      {
        "type": "applicazione",
        "q": "Ricevi un contratto in PDF firmato digitalmente. Verificando la firma con la chiave pubblica del firmatario, che cosa puoi accertare?",
        "options": [
          "Che viene dal titolare della chiave e non è stato alterato",
          "Che il contenuto del contratto è valido ed equilibrato",
          "Che nessun altro ha potuto leggerlo durante l'invio",
          "Che il firmatario ha letto davvero tutte le clausole del contratto"
        ],
        "answer": 0,
        "why": "La firma garantisce autenticità e integrità, non la riservatezza né la qualità giuridica del contenuto; per la segretezza bisogna anche cifrare il documento."
      },
      {
        "type": "collegamento",
        "q": "Nella blockchain di bitcoin, che cosa dimostra che chi spende delle monete ne ha il diritto?",
        "options": [
          "Una firma digitale fatta con la sua chiave privata",
          "Una password custodita dalla banca centrale del Paese",
          "Il suo nome e cognome registrati nel blocco",
          "Un certificato rilasciato da un'autorità pubblica"
        ],
        "answer": 0,
        "why": "Bitcoin usa la stessa crittografia a chiave pubblica: chi possiede la chiave privata può firmare la spesa, e tutti possono verificarla senza conoscere quella chiave."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico che cosa succede, dal punto di vista della crittografia, quando compare il lucchetto accanto all'indirizzo di un sito.",
      "model": "Prima il sito mostra un certificato firmato da un'autorità di cui il browser si fida, così sai che è davvero chi dice di essere. Poi browser e sito usano la crittografia a chiave pubblica per costruire una chiave segreta comune senza mai spedirla in rete, sfruttando problemi matematici facili in un verso e quasi impossibili nell'altro. Da quel momento i dati viaggiano cifrati con un algoritmo simmetrico, molto veloce. Chi intercetta vede solo dati incomprensibili.",
      "points": [
        "Il certificato verifica l'identità del sito",
        "La chiave pubblica permette di accordarsi su un segreto senza scambiarlo",
        "I dati si cifrano poi con una chiave simmetrica, più veloce"
      ]
    }
  },
  {
    "id": "tecnologia-blockchain",
    "area": "tecnologia",
    "title": "Blockchain e bitcoin: il registro senza padrone",
    "level": 2,
    "minutes": 5,
    "hook": "Una moneta digitale è un file, e un file si copia. Bitcoin ha trovato il modo di spenderla una volta sola senza una banca che tenga il conto, e il 22 maggio 2010 qualcuno ne usò 10.000 per comprare due pizze.",
    "sections": [
      {
        "h": "Il problema della doppia spesa",
        "text": "Con il denaro elettronico tradizionale nessuno spende due volte lo stesso euro perché c'è un registro centrale, quello della banca, che scala il saldo. Senza un intermediario, chi impedisce di inviare la stessa moneta digitale a due persone diverse? Il 31 ottobre 2008 un autore con lo pseudonimo di Satoshi Nakamoto pubblicò un documento di nove pagine con una soluzione: un registro pubblico di tutte le transazioni, copiato su migliaia di computer, che nessuno controlla da solo ma su cui tutti concordano. Il primo blocco fu creato il 3 gennaio 2009. L'identità di Nakamoto non è mai stata accertata."
      },
      {
        "h": "Blocchi incatenati dagli hash",
        "text": "Le transazioni vengono raccolte in blocchi, in media uno ogni dieci minuti. Ogni blocco contiene l'hash del blocco precedente, cioè la sua impronta digitale, calcolata con una funzione crittografica che dà un risultato completamente diverso se nei dati cambia anche una sola virgola. Modificare una transazione vecchia cambierebbe l'hash del suo blocco, che non corrisponderebbe più a quello registrato nel blocco successivo, e così via fino all'ultimo: la manomissione sarebbe evidente a tutti. La proprietà delle monete si dimostra con la crittografia a chiave pubblica: per spenderle bisogna firmare con la propria chiave privata. Chi la perde perde le monete, senza nessuno a cui chiedere di recuperarle."
      },
      {
        "h": "Chi scrive il registro: la proof of work",
        "text": "Il diritto di aggiungere il blocco successivo si guadagna con una gara di calcolo. I miner provano un numero enorme di combinazioni finché trovano un hash del blocco inferiore a una certa soglia, cioè che inizi con una lunga fila di zeri. Il primo che ci riesce incassa bitcoin nuovi più le commissioni delle transazioni e propone il blocco alla rete, che lo verifica in un istante. La difficoltà si ricalcola ogni 2.016 blocchi, circa due settimane, per mantenere il ritmo di dieci minuti. Riscrivere la storia richiederebbe rifare quel lavoro più in fretta del resto della rete, cioè controllare la maggioranza della potenza di calcolo: è il cosiddetto attacco del 51%. Il prezzo di questa sicurezza è un consumo di elettricità che le stime dell'Università di Cambridge paragonano a quello di un Paese di medie dimensioni. Nel settembre 2022 Ethereum, la principale rete dopo bitcoin, è passata alla proof of stake, che sostituisce il calcolo con capitale messo in garanzia e consuma oltre il 99% di energia in meno."
      },
      {
        "h": "Offerta fissa e dimezzamenti",
        "text": "Il protocollo stabilisce che non esisteranno mai più di 21 milioni di bitcoin. La ricompensa per ogni blocco si dimezza ogni 210.000 blocchi, circa ogni quattro anni: era di 50 bitcoin nel 2009 ed è scesa a 3,125 con il dimezzamento dell'aprile 2024. Nessuna autorità può aumentarne la quantità, ed è per questo che i sostenitori lo paragonano all'oro. Il prezzo, però, dipende solo da quanto qualcuno è disposto a pagare, e nella sua storia ha subìto più volte cali superiori al 70%. Le due pizze del 2010 costavano qualche decina di dollari: nei picchi successivi al 2020, quelle 10.000 monete sono arrivate a valere oltre un miliardo di dollari."
      },
      {
        "h": "Cosa fa bene e cosa no",
        "text": "Una blockchain pubblica serve quando parti che non si fidano l'una dell'altra vogliono un registro comune senza un gestore centrale. Ha però costi reali: è lenta, perché la rete principale di bitcoin gestisce una manciata di transazioni al secondo contro le migliaia di un circuito di carte, ed è costosa da mantenere. Molti progetti aziendali di «blockchain» funzionerebbero altrettanto bene con un database condiviso. C'è poi un'ironia frequente: chi tiene le monete su una piattaforma di scambio non controlla le chiavi private e torna a fidarsi di un intermediario, come mostrò il fallimento di FTX nel novembre 2022, che lasciò i clienti senza accesso ai propri fondi."
      }
    ],
    "facts": [
      "Bitcoin: documento di Satoshi Nakamoto del 31 ottobre 2008, primo blocco il 3 gennaio 2009.",
      "Ogni blocco contiene l'hash del precedente: modificare il passato rompe la catena.",
      "Proof of work: i miner competono in una gara di calcolo; un blocco ogni 10 minuti circa.",
      "Massimo 21 milioni di bitcoin; ricompensa dimezzata ogni 210.000 blocchi (circa 4 anni).",
      "22 maggio 2010: 10.000 bitcoin per due pizze.",
      "Ethereum è passata alla proof of stake nel settembre 2022."
    ],
    "links": [
      "tecnologia-crittografia",
      "mente-teoria-giochi",
      "economia-inflazione-tassi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Qual è il numero massimo di bitcoin che potranno mai esistere?",
        "options": [
          "21 milioni",
          "100 milioni",
          "21 miliardi",
          "Nessun limite: dipende dai miner"
        ],
        "answer": 0,
        "why": "Il tetto è scritto nel protocollo: la ricompensa per blocco si dimezza ogni 210.000 blocchi fino a diventare trascurabile."
      },
      {
        "type": "comprensione",
        "q": "Perché è praticamente impossibile modificare una transazione registrata molti blocchi fa?",
        "options": [
          "Perché cambierebbe il suo hash, rompendo la catena dei blocchi",
          "Perché i blocchi vecchi vengono cancellati e non sono più accessibili",
          "Perché una copia originale è custodita da una banca centrale",
          "Perché le transazioni vecchie sono protette da una password di Nakamoto"
        ],
        "answer": 0,
        "why": "Ogni blocco porta l'impronta del precedente: alterarne uno rompe la catena, e ricostruirla richiederebbe più potenza di calcolo di tutto il resto della rete."
      },
      {
        "type": "comprensione",
        "q": "Quale problema risolve, prima di tutto, la blockchain di bitcoin?",
        "options": [
          "Evitare la doppia spesa di una moneta digitale senza una banca",
          "Rendere del tutto anonime e impossibili da tracciare le transazioni",
          "Garantire che il valore della moneta resti stabile nel tempo",
          "Rendere i pagamenti più rapidi ed economici di quelli con carta"
        ],
        "answer": 0,
        "why": "Il registro pubblico condiviso sostituisce la banca nel tenere i conti. Le transazioni, invece, sono tutte visibili, il prezzo è molto volatile e la rete è lenta."
      },
      {
        "type": "applicazione",
        "q": "Un amico tiene i suoi bitcoin su una piattaforma di scambio e dice: «Sono sulla blockchain, quindi nessuno può toccarli». Cosa gli fai notare?",
        "options": [
          "Che senza le chiavi private si fida della piattaforma",
          "Che ha ragione, perché la blockchain lo protegge da ogni rischio",
          "Che i bitcoin depositati sulle piattaforme sono garantiti dallo Stato",
          "Che una piattaforma di scambio non può fallire, essendo decentralizzata"
        ],
        "answer": 0,
        "why": "Chi controlla la chiave privata controlla le monete: se è la piattaforma a custodirla, il rischio è quello di qualsiasi intermediario, come mostrò il caso FTX."
      },
      {
        "type": "collegamento",
        "q": "Chi sostiene bitcoin lo paragona all'oro e lo contrappone all'euro. Su quale differenza si basa il paragone?",
        "options": [
          "L'offerta di bitcoin è fissa, quella di euro dipende dalla BCE",
          "Bitcoin è garantito da riserve d'oro custodite dai miner, l'euro no",
          "Il valore di bitcoin resta più stabile nel tempo di quello dell'euro",
          "Anche l'euro ha un tetto massimo di emissione, ma molto più alto"
        ],
        "answer": 0,
        "why": "Nessuno può creare bitcoin oltre il tetto, mentre la quantità di euro dipende dalla politica monetaria della BCE; questo però non rende stabile il prezzo di bitcoin."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico come fa bitcoin a funzionare senza una banca che tenga i conti.",
      "model": "Tutte le transazioni stanno in un registro pubblico copiato su migliaia di computer. Sono raccolte in blocchi, e ogni blocco contiene l'impronta del precedente, così modificare il passato romperebbe la catena. Chi aggiunge un nuovo blocco deve prima vincere una gara di calcolo, e riscrivere la storia richiederebbe più potenza di tutto il resto della rete. Per spendere serve la firma con la propria chiave privata: chi la perde perde le monete.",
      "points": [
        "Un registro pubblico condiviso al posto della banca",
        "Blocchi legati dagli hash e protetti dalla proof of work",
        "La proprietà si dimostra con la chiave privata"
      ]
    }
  },
  {
    "id": "tecnologia-batterie-litio",
    "area": "tecnologia",
    "title": "Batterie e transizione energetica: perché il litio conta",
    "level": 2,
    "minutes": 5,
    "hook": "Il litio è il metallo più leggero che esista. È per questo, non per moda, che sta nel telefono di tutti e sotto il pianale di quasi ogni auto elettrica.",
    "sections": [
      {
        "h": "Perché proprio il litio",
        "text": "Il litio è il terzo elemento della tavola periodica e il metallo più leggero: a parità di volume pesa circa la metà dell'acqua. Soprattutto, cede con grande facilità il suo unico elettrone esterno. Queste due proprietà insieme significano molta energia in poco peso: una cella agli ioni di litio lavora intorno ai 3,6-3,7 volt, contro circa 1,2 di una pila ricaricabile al nichel e 2 di un elemento al piombo, e a parità di peso immagazzina diverse volte l'energia di una batteria al piombo. Per un oggetto che si porta in tasca, o per un'auto che deve trasportare la propria batteria, il peso è decisivo."
      },
      {
        "h": "Ioni che fanno la spola",
        "text": "Una cella ha due elettrodi immersi in un elettrolita e divisi da un sottile separatore: l'anodo, di solito di grafite, e il catodo, un ossido o un fosfato metallico che contiene litio. Durante la carica il caricatore spinge gli elettroni verso l'anodo attraverso il circuito esterno, mentre gli ioni di litio attraversano l'elettrolita e si infilano tra gli strati di grafite. Durante l'uso avviene il contrario: gli ioni tornano al catodo attraverso l'elettrolita e gli elettroni, che non possono seguirli, passano per il circuito esterno, alimentando il telefono o il motore. Il litio, in linea di principio, non si consuma: fa avanti e indietro. Ogni ciclo però lascia piccoli danni, accelerati dal calore, dal restare a lungo carica al 100% e dalle scariche profonde. E l'elettrolita è infiammabile: una cella danneggiata o in cortocircuito può surriscaldarsi a catena e incendiarsi."
      },
      {
        "h": "Dagli anni Settanta al Nobel",
        "text": "Le basi le pose Stanley Whittingham negli anni Settanta; nel 1980 John Goodenough introdusse un catodo all'ossido di cobalto che alzava molto la tensione, e nel 1985 Akira Yoshino costruì il primo prototipo commercialmente utilizzabile, con un anodo di carbonio. Sony mise in vendita le prime batterie agli ioni di litio nel 1991, e i tre scienziati ricevettero il Nobel per la chimica nel 2019. La produzione di massa ha poi fatto crollare i costi: secondo BloombergNEF il prezzo medio di un pacco batteria è sceso di circa il 90% tra il 2010 e i primi anni Venti. È soprattutto questo calo ad aver avvicinato le auto elettriche al mercato di massa."
      },
      {
        "h": "Chimiche diverse, compromessi diversi",
        "text": "Non esiste una sola batteria al litio. Le celle NMC, al nichel, manganese e cobalto, offrono più energia per chilo e quindi più autonomia, ma usano metalli costosi: nei primi anni Venti circa il 70% del cobalto estratto nel mondo veniva dalla Repubblica Democratica del Congo, con problemi noti di condizioni di lavoro. Le celle LFP, al litio ferro fosfato, non contengono né nichel né cobalto: immagazzinano meno energia per chilo, ma costano meno, sopportano più cicli e sono meno soggette a incendi. Negli ultimi anni hanno guadagnato molto terreno nelle auto più economiche e negli accumuli fissi, dove il peso conta poco. Si lavora anche su alternative come le batterie al sodio, un elemento molto più abbondante."
      },
      {
        "h": "La geografia della transizione",
        "text": "Il litio si estrae da rocce, soprattutto in Australia, o da salamoie sotto i deserti di sale tra Cile, Argentina e Bolivia, dove si concentra per evaporazione in grandi vasche, con un forte consumo d'acqua in zone aride. La raffinazione, però, è concentrata in Cina, che lavora più della metà del litio mondiale. L'Indonesia, primo produttore di nichel al mondo, ha vietato dal 2020 l'esportazione del minerale grezzo per attirare sul proprio territorio fonderie e filiera delle batterie. Anche qui valgono domanda e offerta: il prezzo del litio è salito di diverse volte nel 2021-2022 ed è crollato nel 2023, quando l'offerta nuova ha superato la crescita della domanda. Nella transizione energetica le batterie servono due volte: per elettrificare i trasporti e per spostare di qualche ora l'energia di sole e vento."
      }
    ],
    "facts": [
      "Il litio è il metallo più leggero; una cella agli ioni di litio lavora a circa 3,6–3,7 volt.",
      "In carica gli ioni vanno dal catodo all'anodo di grafite; durante l'uso tornano indietro.",
      "Nobel per la chimica 2019: Whittingham, Goodenough e Yoshino; Sony la commercializza nel 1991.",
      "NMC: più energia per chilo, usa nichel e cobalto. LFP: più economica, longeva e sicura.",
      "Costo dei pacchi batteria: circa −90% tra il 2010 e i primi anni Venti.",
      "L'Indonesia, primo produttore di nichel, vieta dal 2020 l'export di minerale grezzo."
    ],
    "links": [
      "economia-domanda-offerta",
      "geopolitica-stretto-malacca",
      "scienza-effetto-serra"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Quale tipo di batteria al litio non contiene né nichel né cobalto?",
        "options": [
          "Litio ferro fosfato (LFP)",
          "Nichel-manganese-cobalto (NMC)",
          "Nichel-cobalto-alluminio (NCA)",
          "Ossido di litio e cobalto (LCO)"
        ],
        "answer": 0,
        "why": "Le LFP rinunciano a un po' di energia per chilo in cambio di costi minori, più cicli di vita e maggiore sicurezza, e non dipendono da due metalli critici."
      },
      {
        "type": "comprensione",
        "q": "Che cosa succede dentro una batteria agli ioni di litio mentre alimenta un telefono?",
        "options": [
          "Gli ioni tornano al catodo, gli elettroni passano nel circuito",
          "Il litio brucia lentamente e il calore prodotto diventa corrente",
          "Gli elettroni attraversano l'elettrolita mentre gli ioni restano fermi",
          "La grafite si consuma e si trasforma in litio metallico"
        ],
        "answer": 0,
        "why": "Ioni ed elettroni compiono lo stesso viaggio per strade diverse: gli ioni dentro la cella, gli elettroni fuori, ed è questo flusso esterno a fare da corrente."
      },
      {
        "type": "comprensione",
        "q": "Perché il litio è così adatto alle batterie ricaricabili?",
        "options": [
          "È leggerissimo e dà tensioni elevate per cella",
          "È il metallo più abbondante della crosta terrestre",
          "Non può prendere fuoco, nemmeno se la cella è danneggiata",
          "Conduce l'elettricità meglio del rame e non si degrada"
        ],
        "answer": 0,
        "why": "Poco peso e alta tensione per cella significano molta energia per chilo; il rovescio è un elettrolita infiammabile, che rende la sicurezza un tema centrale."
      },
      {
        "type": "applicazione",
        "q": "Un'azienda vuole un accumulo accanto all'impianto fotovoltaico del magazzino, dove il peso non è un problema. Quale chimica ha più senso, in linea di principio?",
        "options": [
          "LFP, perché costa meno, dura di più ed è più sicura",
          "NMC, perché offre la massima energia per chilo",
          "Piombo, perché è la batteria già presente in tutte le auto",
          "Una qualsiasi, perché le chimiche si equivalgono in tutto"
        ],
        "answer": 0,
        "why": "In un impianto fisso l'energia per chilo conta poco, mentre costo, numero di cicli e sicurezza contano molto: è il terreno ideale delle LFP."
      },
      {
        "type": "collegamento",
        "q": "Dopo il boom del 2021-2022 il prezzo del litio crollò nel 2023. Quale spiegazione è coerente con domanda e offerta?",
        "options": [
          "La nuova offerta ha superato la crescita della domanda",
          "Il litio è stato sostituito dal sodio in tutte le auto",
          "I governi hanno fissato un prezzo massimo mondiale",
          "La domanda di batterie si è improvvisamente azzerata"
        ],
        "answer": 0,
        "why": "I prezzi alti avevano spinto ad aprire nuove miniere e impianti; quando la loro produzione è arrivata mentre la domanda cresceva meno del previsto, il prezzo è sceso. Il segnale di prezzo aveva fatto il suo lavoro."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché auto elettriche e smartphone dipendono dalle batterie al litio, e perché questo è anche una questione geopolitica.",
      "model": "Il litio è il metallo più leggero e cede facilmente un elettrone, quindi permette di immagazzinare molta energia in poco peso. In una cella gli ioni di litio fanno la spola tra la grafite e il catodo, mentre gli elettroni passano nel circuito esterno e fanno funzionare il dispositivo. Il costo delle batterie è crollato e ha avvicinato le auto elettriche al mercato di massa. Ma estrazione e raffinazione di litio, nichel e cobalto sono concentrate in pochi Paesi, e questo dà a chi controlla la filiera un peso strategico.",
      "points": [
        "Leggerezza e alta tensione: molta energia per chilo",
        "Gli ioni fanno la spola tra gli elettrodi, gli elettroni passano nel circuito",
        "La filiera è concentrata in pochi Paesi"
      ]
    }
  },
  {
    "id": "biologia-sistema-immunitario",
    "area": "scienza",
    "title": "Il sistema immunitario: difesa, memoria ed errori",
    "level": 2,
    "minutes": 5,
    "hook": "Per riconoscere nemici che non ha mai incontrato, il corpo fabbrica a caso milioni di recettori diversi: il difficile è impedire che qualcuno di essi attacchi te.",
    "sections": [
      {
        "h": "Due linee di difesa",
        "text": "La prima linea è l'immunità innata: pelle e mucose fanno da barriera, e cellule come neutrofili e macrofagi inglobano e digeriscono i microbi che riescono a entrare. Riconoscono schemi molecolari comuni a molti patogeni, come certi componenti della parete dei batteri, e intervengono in minuti o ore. Scatenano l'infiammazione: i vasi si dilatano, la zona si arrossa e si gonfia, arrivano altre cellule di difesa. È una risposta veloce ma generica, che non sviluppa una memoria specifica. La seconda linea è l'immunità adattativa, affidata ai linfociti B e T: è specifica per un singolo nemico, alla prima infezione impiega giorni per entrare a pieno regime e, soprattutto, si ricorda."
      },
      {
        "h": "Riconoscere un nemico mai visto",
        "text": "Il trucco dell'immunità adattativa è il caso. Ogni linfocito, mentre matura, costruisce il proprio recettore combinando a caso segmenti di geni diversi: ne esce un repertorio di molti milioni di recettori differenti, ciascuno presente su pochi linfociti. Quando arriva un virus, i rari linfociti il cui recettore si adatta a una sua molecola vengono attivati e si moltiplicano in migliaia di copie identiche: è la selezione clonale. I linfociti B diventano plasmacellule che producono anticorpi, molecole che si legano al nemico, lo neutralizzano e lo segnalano per la distruzione. I linfociti T citotossici uccidono le cellule già infettate, mentre i T helper coordinano la risposta. Il rischio è evidente: un sistema che genera recettori a caso ne produce anche contro i propri tessuti. Per questo, durante la maturazione, i linfociti che reagiscono con forza alle molecole dell'organismo vengono in gran parte eliminati, i T nel timo e i B nel midollo osseo."
      },
      {
        "h": "La memoria e i vaccini",
        "text": "Finita l'infezione, gran parte dei linfociti moltiplicati muore, ma una parte resta come cellule della memoria, a volte per decenni. Al secondo incontro la risposta è più rapida e più forte, spesso tanto da fermare il patogeno prima dei sintomi: per questo il morbillo di solito si prende una volta sola. I vaccini sfruttano questo meccanismo. Presentano al corpo il patogeno inattivato, un suo frammento o, nei vaccini a mRNA, le istruzioni per produrre una sua proteina, senza causare la malattia. Il primo vaccino documentato con metodo fu sperimentato nel 1796 dal medico inglese Edward Jenner, che usò il vaiolo bovino per proteggere da quello umano; dopo una lunga campagna di vaccinazione, nel 1980 l'OMS ha dichiarato il vaiolo eradicato. Il vaccino antinfluenzale invece va ripetuto ogni anno: il virus dell'influenza accumula mutazioni di continuo e la memoria lo riconosce sempre peggio, mentre quello del morbillo cambia molto poco."
      },
      {
        "h": "Quando la difesa sbaglia bersaglio",
        "text": "Gli errori del sistema immunitario vanno in tre direzioni. Può reagire contro sostanze innocue, come pollini o alcuni alimenti: è l'allergia, in cui anticorpi di tipo IgE spingono i mastociti a liberare istamina e altre sostanze che provocano prurito, gonfiore e, nei casi gravi, shock anafilattico. Può attaccare l'organismo stesso quando la tolleranza fallisce: sono le malattie autoimmuni, come il diabete di tipo 1, in cui vengono distrutte le cellule del pancreas che producono insulina, o la sclerosi multipla, che danneggia la mielina, la guaina che riveste le fibre nervose. Oppure può essere troppo debole: il virus HIV infetta e distrugge proprio i linfociti T helper e, senza terapia, porta all'AIDS, in cui infezioni di solito banali diventano pericolose. Un buon sistema immunitario è quindi un sistema in equilibrio: troppo poco lascia passare i nemici, troppo fa danni."
      }
    ],
    "facts": [
      "Immunità innata: rapida e generica, senza memoria specifica.",
      "Immunità adattativa: linfociti B e T, specifica, lenta al primo incontro, dotata di memoria.",
      "I recettori dei linfociti nascono da combinazioni casuali di segmenti di geni.",
      "Edward Jenner, 1796: primo vaccino documentato, contro il vaiolo; l'OMS ha dichiarato il vaiolo eradicato nel 1980.",
      "Allergie e malattie autoimmuni sono errori di bersaglio; l'HIV distrugge i linfociti T helper."
    ],
    "links": [
      "scienza-evoluzione",
      "matematica-crescita-esponenziale"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Chi sperimentò e documentò nel 1796 il primo vaccino, contro il vaiolo?",
        "options": [
          "Louis Pasteur",
          "Robert Koch",
          "Edward Jenner",
          "Alexander Fleming"
        ],
        "answer": 2,
        "why": "Jenner usò il vaiolo bovino, una malattia lieve, per proteggere da quello umano. La parola vaccino viene proprio dal latino vacca."
      },
      {
        "type": "comprensione",
        "q": "Perché, alla prima infezione da un virus nuovo, la risposta immunitaria specifica impiega giorni?",
        "options": [
          "Perché i pochi linfociti adatti devono prima attivarsi e moltiplicarsi",
          "Perché l'immunità innata blocca quella specifica nei primi giorni",
          "Perché i linfociti si formano solo quando compare la febbre",
          "Perché ogni virus nuovo resta invisibile al corpo per una settimana"
        ],
        "answer": 0,
        "why": "I linfociti con il recettore giusto esistono già, ma sono pochissimi: la selezione clonale richiede tempo per produrne migliaia di copie."
      },
      {
        "type": "applicazione",
        "q": "Un amico chiede perché il vaccino antinfluenzale va rifatto ogni anno, mentre per il morbillo no. Qual è la spiegazione migliore?",
        "options": [
          "Il vaccino antinfluenzale contiene meno antigene e protegge meno",
          "Il virus influenzale muta di continuo e la memoria lo riconosce peggio",
          "Le cellule della memoria contro l'influenza muoiono tutte poche settimane dopo il vaccino",
          "L'influenza è causata da un batterio, il morbillo da un virus"
        ],
        "answer": 1,
        "why": "La memoria immunitaria riconosce molecole precise: se il virus le cambia, il riconoscimento si indebolisce. Il virus del morbillo invece cambia poco."
      },
      {
        "type": "comprensione",
        "q": "Che cosa hanno in comune un'allergia e una malattia autoimmune?",
        "options": [
          "In entrambe il sistema immunitario è troppo debole per difendersi",
          "Sono entrambe causate da un'infezione mai guarita",
          "In entrambe mancano i linfociti T helper",
          "In entrambe il sistema immunitario colpisce il bersaglio sbagliato"
        ],
        "answer": 3,
        "why": "Nell'allergia il bersaglio è una sostanza innocua, nell'autoimmunità i tessuti dell'organismo: in entrambi i casi il sistema funziona, ma contro la cosa sbagliata."
      },
      {
        "type": "collegamento",
        "q": "Un virus produce di continuo copie con piccole mutazioni. In una popolazione dove molti sono immuni, perché tendono a diffondersi le varianti che gli anticorpi riconoscono meno?",
        "options": [
          "Perché infettano più persone e lasciano più copie: è selezione naturale",
          "Perché il virus sceglie attivamente di mutare per sfuggire agli anticorpi",
          "Perché sono gli anticorpi stessi a provocare quelle mutazioni",
          "Perché le varianti più nuove sono sempre anche le più aggressive"
        ],
        "answer": 0,
        "why": "Le mutazioni nascono a caso; l'immunità della popolazione fa da filtro e favorisce chi le sfugge. È lo stesso meccanismo che Darwin descrisse per le specie."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico come fa un vaccino a proteggere da una malattia senza fartela prendere.",
      "model": "Il sistema immunitario ha una parte specifica, fatta di linfociti, che impara a riconoscere un nemico preciso e se ne ricorda. Alla prima infezione questa risposta impiega giorni, perché i pochi linfociti adatti devono moltiplicarsi. Il vaccino mostra al corpo un pezzo del nemico, o le istruzioni per produrlo, senza la malattia, e così si formano le cellule della memoria. Se poi arriva il vero patogeno, la risposta è rapida e forte, spesso prima che compaiano i sintomi.",
      "points": [
        "La prima risposta specifica è lenta",
        "Il vaccino crea memoria senza causare la malattia",
        "Al secondo incontro la risposta è più rapida e forte"
      ]
    }
  },
  {
    "id": "matematica-crescita-esponenziale",
    "area": "scienza",
    "title": "La crescita esponenziale: quando il piccolo diventa enorme",
    "level": 1,
    "minutes": 4,
    "hook": "Se una ninfea raddoppia ogni giorno e impiega 30 giorni a coprire uno stagno, il ventinovesimo giorno metà dello stagno è ancora libera.",
    "sections": [
      {
        "h": "Aggiungere o moltiplicare",
        "text": "Una crescita lineare aggiunge sempre la stessa quantità: 100 euro al mese, tre clienti a settimana. Una crescita esponenziale moltiplica sempre per lo stesso fattore: il 10% in più al mese, il doppio ogni anno. All'inizio le due curve si somigliano, poi si separano in modo drammatico. Trenta passi da un metro ti portano a trenta metri. Se invece ogni passo è lungo il doppio del precedente, dopo trenta passi hai percorso più di un miliardo di metri: oltre un milione di chilometri, quasi tre volte la distanza tra la Terra e la Luna."
      },
      {
        "h": "La crescita che alimenta se stessa",
        "text": "Si ha crescita esponenziale quando la velocità con cui una cosa aumenta è proporzionale a quanto ce n'è già. Ogni batterio si divide in due, e ognuno dei due si dividerà ancora; ogni contagiato contagia altre persone; ogni euro di interesse produce altri interessi. Ne deriva una proprietà utile: il tempo di raddoppio resta costante. Per stimarlo basta dividere 70 per il tasso di crescita percentuale: al 7% l'anno si raddoppia in circa 10 anni, al 2% in circa 35. Dieci raddoppi moltiplicano per circa mille, venti per circa un milione, trenta per circa un miliardo. La nostra intuizione invece ragiona in modo lineare, e per questo tende a sottostimare dove porta una crescita costante in percentuale."
      },
      {
        "h": "Batteri, scacchiere e limiti",
        "text": "In condizioni ideali di laboratorio il batterio Escherichia coli si divide circa ogni 20 minuti: partendo da una sola cellula, in dieci ore si arriva a circa un miliardo. Una vecchia leggenda racconta di un saggio che chiese al re un chicco di grano sulla prima casella della scacchiera, due sulla seconda, quattro sulla terza e così via: sulla sessantaquattresima casella ne servirebbero circa 9 miliardi di miliardi, centinaia di volte il raccolto mondiale di grano di un anno. Ma nessuna crescita reale prosegue così per sempre. I batteri esauriscono nutrienti e spazio, la crescita rallenta e si ferma: la curva diventa a S, detta logistica. Già nel 1798 l'economista inglese Thomas Malthus sosteneva che una popolazione tende a crescere più in fretta delle risorse che la sostengono."
      },
      {
        "h": "I due errori tipici",
        "text": "Il primo errore è sottovalutare la fase iniziale. Nella ninfea che copre lo stagno in 30 giorni, al giorno 25 la superficie coperta è circa il 3% e il problema sembra trascurabile; cinque raddoppi dopo è tutto pieno. Nelle prime settimane del 2020, in diversi paesi, i casi di Covid-19 raddoppiavano ogni pochi giorni, e chi aspettava di vedere numeri grandi interveniva tardi. Il secondo errore è opposto: proiettare l'esponenziale all'infinito. Un prodotto che raddoppia i clienti ogni anno prima o poi satura il mercato. Anche la legge di Moore, l'osservazione di Gordon Moore secondo cui il numero di transistor su un chip raddoppiava circa ogni due anni, ha retto per decenni ma rallenta man mano che si avvicinano i limiti fisici."
      }
    ],
    "facts": [
      "Lineare: si aggiunge la stessa quantità; esponenziale: si moltiplica per lo stesso fattore.",
      "Nasce quando la crescita è proporzionale a quanto c'è già.",
      "Tempo di raddoppio ≈ 70 ÷ tasso di crescita percentuale.",
      "10 raddoppi ≈ ×1.000; 20 ≈ ×1 milione; 30 ≈ ×1 miliardo.",
      "Nella realtà ogni crescita esponenziale prima o poi rallenta: curva a S."
    ],
    "links": [
      "economia-interesse-composto",
      "scienza-evoluzione",
      "geopolitica-taiwan-chip"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Una grandezza raddoppia 10 volte di seguito. Di quanto è cresciuta, circa?",
        "options": [
          "Circa 20 volte",
          "Circa 100 volte",
          "Circa 1.000 volte",
          "Circa 10.000 volte"
        ],
        "answer": 2,
        "why": "2 elevato alla decima fa 1.024. Chi risponde 20 sta ragionando in modo lineare, sommando invece di moltiplicare."
      },
      {
        "type": "comprensione",
        "q": "Nell'indovinello della ninfea che copre lo stagno in 30 giorni, perché il giorno 29 lo stagno è ancora per metà libero?",
        "options": [
          "Perché negli ultimi giorni il tasso di crescita della ninfea aumenta",
          "Perché, raddoppiando ogni giorno, il giorno prima ne copriva metà",
          "Perché la ninfea cresce di una quantità fissa al giorno",
          "Perché verso la fine la ninfea rallenta e cresce sempre meno al giorno"
        ],
        "answer": 1,
        "why": "Il tasso resta lo stesso, è la base che cresce: l'ultimo raddoppio aggiunge quanto tutti i giorni precedenti messi insieme."
      },
      {
        "type": "applicazione",
        "q": "Il fatturato di una startup cresce a un ritmo costante del 10% al mese. In quanto tempo circa raddoppia?",
        "options": [
          "Circa 10 mesi",
          "Circa 5 mesi",
          "Circa 12 mesi",
          "Circa 7 mesi"
        ],
        "answer": 3,
        "why": "70 diviso 10 fa 7. Dieci mesi è la risposta di chi somma 10% per dieci volte, dimenticando che ogni mese si parte da una base più alta."
      },
      {
        "type": "comprensione",
        "q": "Perché una colonia di batteri in laboratorio prima o poi smette di crescere in modo esponenziale?",
        "options": [
          "Perché si esauriscono nutrienti e spazio, e la curva diventa a S",
          "Perché dopo trenta divisioni i batteri perdono la capacità di dividersi ancora",
          "Perché una crescita esponenziale dura per definizione un tempo fisso",
          "Perché i batteri più vecchi si dividono sempre più lentamente"
        ],
        "answer": 0,
        "why": "La crescita esponenziale vale finché le risorse sono abbondanti; quando diventano scarse il ritmo cala fino a fermarsi (curva logistica)."
      },
      {
        "type": "collegamento",
        "q": "Che cosa hanno in comune un capitale investito a interesse composto e una colonia di batteri in crescita?",
        "options": [
          "In entrambi si aggiunge la stessa quantità in ogni periodo",
          "In entrambi la crescita può continuare senza alcun limite",
          "In entrambi l'aumento di ogni periodo è proporzionale a quanto c'è già",
          "In entrambi la crescita accelera perché il tasso sale di periodo in periodo"
        ],
        "answer": 2,
        "why": "Gli interessi maturati producono interessi come i batteri nati producono altri batteri: il tasso è costante, la base cresce."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega perché in una crescita esponenziale bisogna intervenire all'inizio, quando i numeri sembrano ancora piccoli.",
      "model": "In una crescita esponenziale la quantità non aumenta di un tanto fisso, ma si moltiplica per lo stesso fattore a ogni periodo, perché ciò che c'è già genera nuova crescita. Per questo la fase iniziale sembra innocua: a cinque raddoppi dalla fine si è appena al 3% circa del totale. Poi bastano pochi raddoppi per passare da trascurabile a enorme. Chi aspetta di vedere numeri grandi interviene quando ne mancano pochi, cioè troppo tardi; va però ricordato che nella realtà i limiti prima o poi rallentano la crescita.",
      "points": [
        "Si moltiplica, non si aggiunge",
        "La fase iniziale sembra trascurabile",
        "Pochi raddoppi separano il piccolo dall'enorme"
      ]
    }
  },
  {
    "id": "scienza-evoluzione",
    "area": "scienza",
    "title": "L'evoluzione per selezione naturale",
    "level": 1,
    "minutes": 5,
    "hook": "Darwin ebbe l'idea della selezione naturale nel 1838, ma la rese pubblica solo vent'anni dopo, e anche allora perché un altro naturalista ci era arrivato da solo.",
    "sections": [
      {
        "h": "Un'idea arrivata due volte",
        "text": "Charles Darwin tornò in Inghilterra nel 1836, dopo quasi cinque anni di viaggio intorno al mondo sul brigantino Beagle, con taccuini pieni di osservazioni: animali leggermente diversi da un'isola all'altra delle Galápagos, fossili simili a specie ancora viventi. Nel 1838, leggendo il saggio dell'economista Thomas Malthus sulla popolazione, intuì il meccanismo. Per vent'anni raccolse prove, finché nel 1858 il naturalista Alfred Russel Wallace gli scrisse di essere arrivato alla stessa conclusione. Le idee dei due furono presentate insieme quell'anno, e nel 1859 uscì L'origine delle specie."
      },
      {
        "h": "Il meccanismo in tre passi",
        "text": "Il ragionamento si regge su tre fatti. Gli individui di una specie sono diversi tra loro. Molte di queste differenze si ereditano. E nascono molti più individui di quanti l'ambiente possa sostenere: una femmina di merluzzo depone milioni di uova, eppure la popolazione resta più o meno stabile. Da questi tre fatti segue, quasi come un teorema, una conseguenza: chi ha caratteristiche che aiutano a sopravvivere e a riprodursi in quell'ambiente lascia in media più discendenti, e quelle caratteristiche diventano più comuni generazione dopo generazione. “Il più adatto” non è il più forte, ma chi lascia più figli in quelle condizioni. Se l'ambiente cambia, cambia anche ciò che conviene."
      },
      {
        "h": "Il caso propone, l'ambiente sceglie",
        "text": "Le variazioni nascono da mutazioni del DNA e dal rimescolamento dei geni nella riproduzione, e sono casuali rispetto ai bisogni: una mutazione utile non compare perché serve. La selezione invece non è casuale, perché filtra le varianti in base agli effetti che producono. Qui sta l'equivoco più comune, l'idea associata a Lamarck che i caratteri acquisiti si trasmettano ai figli: i muscoli di un fabbro non passano alla sua discendenza. E non evolvono gli individui, ma le popolazioni, attraverso il cambiamento nella frequenza delle varianti. Darwin non conosceva il DNA né il lavoro di Mendel sull'ereditarietà: l'unione tra selezione naturale e genetica arrivò solo negli anni Trenta e Quaranta del Novecento."
      },
      {
        "h": "L'evoluzione sotto i nostri occhi",
        "text": "La resistenza agli antibiotici mostra il meccanismo in pochi anni. In una popolazione di miliardi di batteri, qualcuno porta per caso una mutazione che lo rende meno sensibile a un farmaco. L'antibiotico elimina i sensibili e lascia campo libero ai resistenti, che si moltiplicano e possono anche passare i geni di resistenza ad altri batteri. Alexander Fleming, che aveva scoperto la penicillina nel 1928, avvertì del rischio già nel discorso per il Nobel del 1945. La meticillina entrò in uso nel 1959 e nel 1961, nel Regno Unito, furono descritti i primi stafilococchi resistenti, oggi noti come MRSA. Ogni uso di un antibiotico esercita una pressione selettiva, ed è per questo che l'OMS considera la resistenza una delle grandi minacce alla salute globale."
      }
    ],
    "facts": [
      "Darwin pubblicò L'origine delle specie nel 1859; Wallace arrivò alla stessa idea in modo indipendente.",
      "Tre ingredienti: variazione, ereditarietà, più nati di quanti possano sopravvivere.",
      "Le mutazioni sono casuali rispetto ai bisogni; la selezione no.",
      "Evolvono le popolazioni, non i singoli individui.",
      "La resistenza agli antibiotici è selezione naturale osservabile in pochi anni."
    ],
    "links": [
      "matematica-crescita-esponenziale",
      "biologia-sistema-immunitario",
      "mente-teoria-giochi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "In che anno uscì L'origine delle specie di Darwin?",
        "options": [
          "1838",
          "1859",
          "1809",
          "1882"
        ],
        "answer": 1,
        "why": "Darwin aveva l'idea dal 1838, ma pubblicò solo nel 1859, spinto dalla lettera di Wallace dell'anno prima."
      },
      {
        "type": "comprensione",
        "q": "Secondo la teoria di Darwin, perché una caratteristica utile diventa più comune in una popolazione?",
        "options": [
          "Perché gli individui la sviluppano usandola e la passano ai figli",
          "Perché l'ambiente provoca le mutazioni di cui la specie ha bisogno",
          "Perché chi la possiede tende a lasciare più discendenti, che la ereditano",
          "Perché le specie tendono per natura a evolvere verso forme più perfette"
        ],
        "answer": 2,
        "why": "Il motore è la riproduzione differenziale: la caratteristica si diffonde perché i suoi portatori lasciano più figli, non perché qualcuno la acquisisca o la desideri."
      },
      {
        "type": "applicazione",
        "q": "Un agricoltore usa ogni anno lo stesso insetticida, che all'inizio elimina il 99% degli insetti. Dopo qualche anno funziona sempre meno. Che cosa è successo, con ogni probabilità?",
        "options": [
          "Gli insetti si sono abituati al veleno e hanno trasmesso l'abitudine ai figli",
          "Il veleno ha provocato negli insetti le mutazioni per resistergli",
          "L'insetticida si degrada chimicamente restando a lungo in magazzino",
          "Gli insetti resistenti per caso sono sopravvissuti e si sono moltiplicati"
        ],
        "answer": 3,
        "why": "È lo stesso meccanismo della resistenza agli antibiotici: l'1% sopravvissuto conteneva le varianti resistenti, e l'insetticida ha fatto da filtro."
      },
      {
        "type": "comprensione",
        "q": "Che cosa significa davvero “il più adatto” nella selezione naturale?",
        "options": [
          "Chi lascia più discendenti in quel particolare ambiente",
          "Il più forte fisicamente all'interno della popolazione",
          "Il più intelligente tra gli individui della specie",
          "Chi vive più a lungo, indipendentemente dai figli"
        ],
        "answer": 0,
        "why": "Contano sopravvivenza e riproduzione in un ambiente preciso: una caratteristica vantaggiosa oggi può diventare uno svantaggio se l'ambiente cambia."
      },
      {
        "type": "collegamento",
        "q": "Che ruolo ha la tendenza delle popolazioni a crescere in modo esponenziale nel ragionamento di Darwin?",
        "options": [
          "Garantisce che ogni specie diventi sempre più numerosa nel tempo",
          "Fa nascere più individui di quanti l'ambiente possa sostenere",
          "Rende inutile la selezione, perché c'è abbastanza posto per tutti",
          "Aumenta il numero di mutazioni utili in ogni individuo"
        ],
        "answer": 1,
        "why": "È l'intuizione presa da Malthus: se nascono più individui di quanti possano sopravvivere, si crea una competizione che fa da filtro alle varianti."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché i batteri diventano resistenti agli antibiotici, usando la selezione naturale.",
      "model": "In una popolazione di miliardi di batteri ce ne sono sempre alcuni che, per una mutazione casuale, resistono un po' meglio a un certo antibiotico. Quando il farmaco agisce elimina soprattutto i batteri sensibili e lascia campo libero ai resistenti, che si moltiplicano e trasmettono la resistenza. Ripetuto molte volte, il processo rende comune ciò che era raro. Non è il singolo batterio che impara: è la popolazione che cambia, perché l'ambiente premia certe varianti.",
      "points": [
        "Variazioni casuali già presenti nella popolazione",
        "L'antibiotico seleziona i resistenti",
        "Cambia la popolazione, non il singolo"
      ]
    }
  },
  {
    "id": "scienza-effetto-serra",
    "area": "scienza",
    "title": "L'effetto serra e il clima: il meccanismo fisico",
    "level": 2,
    "minutes": 5,
    "hook": "Senza effetto serra la Terra avrebbe una temperatura media di circa −18 °C invece di circa 15 °C: il problema non è l'effetto serra, ma quanto lo stiamo rafforzando.",
    "sections": [
      {
        "h": "Un bilancio di energia",
        "text": "La Terra riceve energia dal Sole soprattutto come luce visibile e vicino infrarosso: la superficie del Sole è a circa 5.500 °C, e i corpi molto caldi emettono a lunghezze d'onda corte. Circa il 30% di questa luce viene riflesso da nubi, ghiacci e superfici chiare; il resto viene assorbito e scalda il pianeta. La Terra, molto più fredda, restituisce energia sotto forma di radiazione infrarossa, cioè calore. La temperatura si stabilizza quando l'energia in uscita pareggia quella in entrata. Un calcolo semplice mostra che, se l'atmosfera lasciasse uscire tutto l'infrarosso, l'equilibrio si raggiungerebbe intorno ai −18 °C. La media reale è di circa 15 °C: la differenza è l'effetto serra."
      },
      {
        "h": "Perché alcuni gas trattengono il calore",
        "text": "Azoto e ossigeno, che formano circa il 99% dell'aria secca, sono quasi trasparenti sia alla luce sia all'infrarosso: sono molecole di due atomi uguali, e le loro vibrazioni non interagiscono con questa radiazione. Molecole come anidride carbonica (CO₂), vapore acqueo, metano e protossido di azoto vibrano invece in modi che assorbono l'infrarosso a precise lunghezze d'onda. Lasciano passare la luce del Sole in arrivo, ma intercettano una parte del calore emesso dal suolo e lo riemettono in tutte le direzioni, anche verso il basso. Il nome è un'analogia imperfetta: una serra vera si scalda soprattutto perché il vetro impedisce all'aria calda di disperdersi."
      },
      {
        "h": "Il punto decisivo: da dove esce il calore",
        "text": "Il calore lascia il pianeta soprattutto dagli strati alti dell'atmosfera, dove i gas serra sono abbastanza rarefatti da lasciarlo sfuggire nello spazio. Aggiungendo CO₂ quella quota si alza, e lassù l'aria è più fredda: un corpo più freddo irradia meno energia. Il pianeta allora perde meno energia di quanta ne riceva, finché la superficie e la bassa atmosfera non si scaldano abbastanza da ristabilire l'equilibrio. Per questo l'obiezione che l'assorbimento della CO₂ sia “già saturo” non regge, anche se l'effetto cresce in modo logaritmico: ogni raddoppio della concentrazione aggiunge all'incirca lo stesso squilibrio. Il riscaldamento poi si amplifica: l'aria più calda contiene più vapore acqueo, che è a sua volta un gas serra, e il ghiaccio che fonde scopre superfici più scure che assorbono più luce. Secondo la stima centrale dell'IPCC, un raddoppio della CO₂ porta a lungo andare a circa 3 °C di riscaldamento."
      },
      {
        "h": "Come sappiamo che siamo noi",
        "text": "Il meccanismo è noto da tempo: a partire dal 1859 il fisico irlandese John Tyndall misurò in laboratorio l'assorbimento dell'infrarosso da parte di CO₂ e vapore acqueo, e nel 1896 il chimico svedese Svante Arrhenius calcolò che un raddoppio della CO₂ avrebbe scaldato la Terra di alcuni gradi. Dal 1958 l'osservatorio di Mauna Loa, alle Hawaii, misura la concentrazione di CO₂: era intorno a 315 parti per milione, nel 2024 ha superato le 420, contro circa 280 prima della rivoluzione industriale. Il carbonio dei combustibili fossili ha una firma riconoscibile, perché è privo di carbonio-14 e povero di carbonio-13, e quella firma si ritrova nella CO₂ aggiunta all'aria. Un'altra prova è che la stratosfera si raffredda mentre la superficie si scalda, cosa che non accadrebbe se la causa fosse un Sole più attivo. Secondo l'IPCC, nel decennio 2011-2020 la superficie terrestre era circa 1,1 °C più calda della media 1850-1900."
      }
    ],
    "facts": [
      "Senza effetto serra la media sarebbe circa −18 °C; quella reale è circa 15 °C.",
      "Azoto e ossigeno non trattengono l'infrarosso; CO₂, vapore acqueo e metano sì.",
      "CO₂: circa 280 ppm prima dell'industria, oltre 420 ppm nel 2024.",
      "Ogni raddoppio della CO₂ aggiunge circa lo stesso squilibrio (effetto logaritmico).",
      "2011-2020: circa 1,1 °C sopra la media 1850-1900 (IPCC)."
    ],
    "links": [
      "storia-rivoluzione-industriale",
      "tecnologia-batterie-litio",
      "geopolitica-acqua-fiumi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Quale sarebbe, circa, la temperatura media della Terra se l'atmosfera lasciasse uscire tutto il calore infrarosso?",
        "options": [
          "Circa 0 °C",
          "Circa −60 °C",
          "Circa 5 °C",
          "Circa −18 °C"
        ],
        "answer": 3,
        "why": "Con la stessa luce assorbita, un pianeta senza gas serra si equilibrerebbe intorno ai −18 °C: l'effetto serra naturale vale circa 33 gradi."
      },
      {
        "type": "comprensione",
        "q": "Perché azoto e ossigeno, pur formando quasi tutta l'aria, non contribuiscono all'effetto serra?",
        "options": [
          "Perché si trovano soprattutto negli strati più bassi dell'atmosfera",
          "Perché le loro molecole di due atomi uguali non assorbono l'infrarosso",
          "Perché riflettono verso lo spazio la luce che arriva dal Sole",
          "Perché vengono continuamente assorbiti dagli oceani e dalle piante"
        ],
        "answer": 1,
        "why": "Conta la struttura della molecola: CO₂, vapore acqueo e metano hanno vibrazioni che interagiscono con l'infrarosso, le molecole di due atomi uguali no."
      },
      {
        "type": "comprensione",
        "q": "Perché l'obiezione che l'assorbimento della CO₂ sia “già saturo” non regge?",
        "options": [
          "Perché la CO₂ in più assorbe anche la luce visibile del Sole",
          "Perché le nuove molecole assorbono più calore di quelle già presenti nell'aria",
          "Perché alza la quota da cui il calore sfugge, dove fa più freddo",
          "Perché la CO₂ in eccesso si trasforma in vapore acqueo"
        ],
        "answer": 2,
        "why": "Uno strato più freddo irradia meno: il pianeta trattiene energia finché non si scalda. L'effetto cresce più lentamente, in modo logaritmico, ma non si ferma."
      },
      {
        "type": "applicazione",
        "q": "Un conoscente sostiene che il riscaldamento recente dipenda da un Sole più attivo. Quale osservazione è più difficile da spiegare con la sua ipotesi?",
        "options": [
          "La stratosfera si raffredda mentre la superficie si scalda",
          "Gli ultimi decenni sono i più caldi delle serie di misure",
          "La Terra riflette circa il 30% della luce solare",
          "Il vapore acqueo amplifica il riscaldamento iniziale"
        ],
        "answer": 0,
        "why": "Un Sole più attivo scalderebbe tutta l'atmosfera; più gas serra invece trattengono calore in basso e raffreddano la stratosfera. È una delle firme del meccanismo."
      },
      {
        "type": "collegamento",
        "q": "Perché come riferimento per la CO₂ si usa il periodo precedente alla rivoluzione industriale?",
        "options": [
          "Perché da allora si brucia carbonio fossile su larga scala",
          "Perché prima di allora nell'aria non c'era CO₂",
          "Perché da allora esistono le misure dirette di Mauna Loa",
          "Perché allora il Sole cominciò a essere più attivo"
        ],
        "answer": 0,
        "why": "Carbone, poi petrolio e gas, liberano carbonio rimasto sepolto per milioni di anni. Prima la CO₂ c'era, intorno a 280 ppm; le misure continue di Mauna Loa partono dal 1958."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega scettico, in modo semplice, perché aggiungere CO₂ all'atmosfera scalda il pianeta.",
      "model": "La Terra riceve luce dal Sole e si libera dell'energia emettendo calore infrarosso. Alcuni gas, come la CO₂, lasciano passare la luce ma assorbono parte dell'infrarosso, così il calore riesce a sfuggire nello spazio solo da strati alti e freddi, che irradiano meno. Aggiungendo CO₂ il pianeta perde meno energia di quanta ne riceve e si scalda finché non ritrova l'equilibrio, con amplificazioni come il vapore acqueo in più. È fisica misurata in laboratorio dall'Ottocento, e la firma isotopica mostra che la CO₂ in più viene dai combustibili fossili.",
      "points": [
        "Luce in entrata, infrarosso in uscita",
        "La CO₂ ostacola l'uscita del calore e crea uno squilibrio",
        "Prove: misure di laboratorio e firma dei combustibili fossili"
      ]
    }
  },
  {
    "id": "scienza-relativita",
    "area": "scienza",
    "title": "La relatività di Einstein spiegata semplice",
    "level": 3,
    "minutes": 5,
    "hook": "Il GPS del telefono funziona solo perché tiene conto di un fatto strano: gli orologi sui satelliti guadagnano circa 38 milionesimi di secondo al giorno rispetto a quelli a terra.",
    "sections": [
      {
        "h": "Il problema della luce",
        "text": "Alla fine dell'Ottocento i fisici pensavano che la luce viaggiasse in un mezzo invisibile, l'etere, e che la sua velocità misurata dovesse cambiare a seconda di come ci si muove rispetto a esso. Nel 1887 l'esperimento di Michelson e Morley cercò questa differenza e non la trovò. Nel 1905 Albert Einstein, allora impiegato all'ufficio brevetti di Berna, ribaltò la prospettiva con due principi: le leggi della fisica sono le stesse per chiunque si muova a velocità costante, e la velocità della luce nel vuoto, circa 300.000 km al secondo, è la stessa per tutti questi osservatori. Se la velocità della luce non cambia, a cambiare devono essere il tempo e lo spazio."
      },
      {
        "h": "Orologi che rallentano, massa che diventa energia",
        "text": "Immagina un orologio fatto di un lampo di luce che rimbalza tra due specchi: ogni andata e ritorno è un tic. Se l'orologio ti passa davanti in movimento, vedi la luce percorrere un tragitto obliquo, più lungo. Poiché la sua velocità è la stessa, ogni tic deve durare di più: gli orologi in movimento rallentano, e le lunghezze si accorciano nella direzione del moto. Alle velocità di tutti i giorni l'effetto è minuscolo, vicino alla velocità della luce diventa enorme. Dallo stesso quadro, sempre nel 1905, nacque E = mc²: massa ed energia sono equivalenti, e poiché c² è un numero gigantesco, un grammo di massa corrisponde a circa 90.000 miliardi di joule, più dell'energia liberata dalla bomba di Hiroshima. Vale per qualunque forma di energia: anche una batteria carica ha un'inezia di massa in più di una scarica, troppo poca per qualsiasi bilancia."
      },
      {
        "h": "La gravità come curvatura",
        "text": "Nel 1915 Einstein estese la teoria alla gravità. Il punto di partenza fu il principio di equivalenza: chiuso in un ascensore in caduta libera non avverti il tuo peso, e nessun esperimento locale distingue la gravità da un'accelerazione. Nella relatività generale massa ed energia curvano lo spaziotempo, e i corpi in caduta seguono le traiettorie più diritte possibili in questa geometria curva: la Terra non è tirata dal Sole da una forza a distanza, ma si muove nello spaziotempo deformato dalla sua massa. La teoria spiegava un'anomalia nell'orbita di Mercurio che la fisica di Newton non riusciva a giustificare, e prevedeva che la luce delle stelle venisse deviata passando vicino al Sole: lo confermarono le osservazioni guidate da Arthur Eddington durante l'eclissi del 29 maggio 1919. Nel 2015 i rivelatori LIGO hanno registrato le onde gravitazionali prodotte dalla fusione di due buchi neri, un'altra previsione della teoria."
      },
      {
        "h": "Il GPS e gli equivoci",
        "text": "La relatività è anche tecnologia quotidiana. I satelliti GPS, nati come sistema militare statunitense, orbitano a circa 20.000 km di quota a quasi 14.000 km/h. Per effetto della velocità i loro orologi rallentano di circa 7 microsecondi al giorno; per la gravità più debole lassù accelerano di circa 45. Il saldo, circa 38 microsecondi al giorno in anticipo, sembra nulla, ma il GPS calcola le distanze dai tempi di viaggio di segnali che corrono alla velocità della luce: senza correzioni l'errore crescerebbe di circa 10 km al giorno. Quanto agli equivoci, la relatività non dice che “tutto è relativo”: si fonda proprio su ciò che è uguale per tutti, come la velocità della luce. E il Nobel per la fisica del 1921 Einstein non lo ricevette per la relatività, ma per la spiegazione dell'effetto fotoelettrico."
      }
    ],
    "facts": [
      "1905: relatività ristretta ed E = mc²; 1915: relatività generale.",
      "La velocità della luce nel vuoto, circa 300.000 km/s, è la stessa per tutti gli osservatori.",
      "Velocità e gravità cambiano il ritmo degli orologi.",
      "1919: l'eclissi osservata dalla spedizione di Eddington conferma la deviazione della luce.",
      "GPS: senza correzioni relativistiche, errori di circa 10 km al giorno."
    ],
    "links": [
      "tecnologia-batterie-litio",
      "storia-guerra-fredda"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Di quanto vanno avanti ogni giorno, per effetti relativistici, gli orologi dei satelliti GPS rispetto a quelli a terra?",
        "options": [
          "Circa 38 secondi",
          "Circa 38 millisecondi",
          "Circa 38 nanosecondi",
          "Circa 38 microsecondi"
        ],
        "answer": 3,
        "why": "Circa 45 microsecondi guadagnati per la gravità più debole, meno circa 7 persi per la velocità: un'inezia che però, moltiplicata per la velocità della luce, vale chilometri."
      },
      {
        "type": "comprensione",
        "q": "Se la velocità della luce è la stessa per tutti, perché un orologio a luce in movimento deve scorrere più lentamente?",
        "options": [
          "Perché il movimento consuma parte dell'energia che fa funzionare l'orologio",
          "Perché la luce percorre un tragitto più lungo alla stessa velocità",
          "Perché la luce rallenta quando la sua sorgente si muove",
          "Perché l'attrito con l'aria rallenta il meccanismo"
        ],
        "answer": 1,
        "why": "Tragitto più lungo e velocità identica significano più tempo per ogni tic: non è un difetto dell'orologio, è il tempo stesso che scorre diversamente."
      },
      {
        "type": "comprensione",
        "q": "Secondo la relatività generale, perché la Terra gira intorno al Sole?",
        "options": [
          "Perché una forza istantanea la attira a distanza verso il Sole",
          "Perché il vento solare la spinge lungo un'orbita chiusa",
          "Perché la luce del Sole esercita su di essa una pressione costante",
          "Perché si muove in uno spaziotempo curvato dalla massa del Sole"
        ],
        "answer": 3,
        "why": "La forza a distanza è la descrizione di Newton, ottima per l'uso pratico. Per Einstein la gravità è geometria: la Terra segue la traiettoria più diritta possibile in uno spaziotempo curvo."
      },
      {
        "type": "applicazione",
        "q": "Un ingegnere progetta un sistema di navigazione satellitare e ignora la relatività, “tanto gli effetti sono microscopici”. Che cosa succederebbe?",
        "options": [
          "Nulla, perché gli effetti contano solo vicino alla velocità della luce",
          "Le posizioni calcolate accumulerebbero errori di chilometri al giorno",
          "Gli errori sarebbero di pochi millimetri, del tutto trascurabili",
          "Gli orologi dei satelliti si correggerebbero da soli col tempo"
        ],
        "answer": 1,
        "why": "Pochi microsecondi di scarto, per segnali che viaggiano a 300.000 km al secondo, diventano circa 10 km di errore ogni giorno."
      },
      {
        "type": "collegamento",
        "q": "Una batteria al litio carica contiene più energia della stessa batteria scarica. Secondo E = mc², che cosa succede alla sua massa?",
        "options": [
          "Aumenta in modo misurabile, di qualche grammo",
          "Non cambia, perché E = mc² vale solo per le reazioni nucleari",
          "Aumenta di una quantità minuscola, impossibile da pesare",
          "Diminuisce, perché la carica consuma parte del litio"
        ],
        "answer": 2,
        "why": "Ogni energia ha una massa equivalente, ma dividendo per c² l'energia di una batteria corrisponde a una frazione infinitesimale di grammo."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché il GPS sarebbe inutilizzabile senza la relatività di Einstein.",
      "model": "Il GPS calcola la posizione misurando quanto impiegano i segnali dei satelliti ad arrivare, quindi ha bisogno di orologi precisissimi. Secondo la relatività ristretta gli orologi dei satelliti, che si muovono veloci, rallentano di circa 7 microsecondi al giorno; secondo la generale, essendo più lontani dalla massa della Terra, accelerano di circa 45. Il risultato netto è un anticipo di circa 38 microsecondi al giorno, che senza correzione produrrebbe errori di circa 10 km al giorno. Per questo il sistema compensa l'effetto.",
      "points": [
        "Il GPS misura i tempi di viaggio dei segnali",
        "Velocità e gravità cambiano il ritmo degli orologi",
        "Senza correzione l'errore cresce di chilometri al giorno"
      ]
    }
  },
  {
    "id": "mente-bias-cognitivi",
    "area": "mente",
    "title": "I bias cognitivi: gli errori sistematici della mente",
    "level": 1,
    "minutes": 5,
    "hook": "“Una mazza e una palla costano 1,10 euro in tutto; la mazza costa 1 euro più della palla. Quanto costa la palla?” Se hai pensato 10 centesimi, sei in ottima compagnia, ma hai sbagliato.",
    "sections": [
      {
        "h": "Scorciatoie che sbagliano in modo prevedibile",
        "text": "Per decidere in fretta la mente usa euristiche, scorciatoie che quasi sempre funzionano. Un bias cognitivo è il loro lato d'ombra: un errore sistematico, cioè che va sempre nella stessa direzione e quindi si può prevedere. Questo filone di ricerca fu avviato da Amos Tversky e Daniel Kahneman, con un celebre articolo su Science del 1974; Kahneman ricevette nel 2002 il Nobel per l'economia, Tversky era morto nel 1996. Nel libro Pensieri lenti e veloci Kahneman distingue un pensiero rapido e intuitivo da uno lento e deliberato: è una metafora utile, più che una descrizione letterale del cervello. Nell'indovinello della mazza e della palla l'intuizione propone 10 centesimi, ma allora la mazza costerebbe 1,10 euro e il totale 1,20: la risposta giusta è 5 centesimi."
      },
      {
        "h": "Quattro errori ricorrenti",
        "text": "L'ancoraggio fa sì che un numero visto prima, anche irrilevante, sposti le stime successive. Il bias di conferma ci spinge a cercare e ricordare le informazioni che danno ragione a ciò che pensiamo già. L'euristica della disponibilità ci fa giudicare frequente ciò che ricordiamo facilmente: un incidente aereo in prima pagina pesa più di migliaia di incidenti stradali che non fanno notizia. L'avversione alle perdite fa pesare una perdita più di un guadagno della stessa entità, con stime spesso intorno al doppio, anche se variano molto tra studi e contesti. Vi si collega anche l'errore di continuare un progetto fallimentare per non “buttare” quanto si è già speso."
      },
      {
        "h": "La ruota della fortuna e il prezzo di una casa",
        "text": "Nell'esperimento descritto nel 1974, Tversky e Kahneman facevano girare davanti ai partecipanti una ruota della fortuna, truccata per fermarsi su 10 o su 65, e poi chiedevano quale percentuale dei paesi delle Nazioni Unite fosse africana. Chi aveva visto 10 dava una stima mediana del 25%, chi aveva visto 65 del 45%: un numero palesemente casuale spostava la risposta di venti punti. In uno studio del 1987, agenti immobiliari esperti valutarono la stessa casa partendo da prezzi di listino diversi, e le loro stime seguirono il listino, anche se in gran parte negavano di averne tenuto conto. In una trattativa, la prima cifra sul tavolo fa da ancora per entrambe le parti, esperti compresi."
      },
      {
        "h": "Che cosa regge e come difendersi",
        "text": "Non tutto quello che si legge sui bias ha retto alla prova. Dall'inizio degli anni 2010 la psicologia attraversa una crisi di replicazione: alcuni effetti celebri, come certi esperimenti di priming in cui leggere parole legate alla vecchiaia avrebbe fatto camminare più lentamente, non si sono riprodotti, mentre l'ancoraggio è tra i risultati confermati più spesso. Sapere che i bias esistono, poi, protegge poco: tendiamo a riconoscerli negli altri più che in noi stessi. Funzionano meglio le procedure: fissare i criteri prima di vedere le offerte, chiedere a qualcuno di sostenere la tesi opposta, oppure immaginare che una decisione sia già fallita e chiedersi perché, il cosiddetto pre-mortem."
      }
    ],
    "facts": [
      "Bias cognitivo: errore sistematico, prevedibile nella direzione, non casuale.",
      "Tversky e Kahneman, 1974: l'articolo fondativo su euristiche e bias; Nobel a Kahneman nel 2002.",
      "Ancoraggio: un numero iniziale, anche casuale, sposta le stime successive.",
      "Avversione alle perdite: una perdita pesa più di un guadagno equivalente, spesso circa il doppio.",
      "Conoscere i bias non basta: servono procedure decise prima."
    ],
    "links": [
      "trading-gestione-rischio",
      "mente-stoicismo",
      "mente-abitudini"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Nell'indovinello della mazza e della palla (1,10 euro in tutto, la mazza costa 1 euro più della palla), quanto costa la palla?",
        "options": [
          "10 centesimi",
          "5 centesimi",
          "15 centesimi",
          "1 centesimo"
        ],
        "answer": 1,
        "why": "Palla 0,05 e mazza 1,05 fanno 1,10. La risposta intuitiva, 10 centesimi, porterebbe il totale a 1,20."
      },
      {
        "type": "comprensione",
        "q": "Che cosa rende “sistematico” un bias cognitivo?",
        "options": [
          "Colpisce soprattutto le persone con poca istruzione",
          "Si manifesta solo sotto stress o stanchezza",
          "Si corregge da solo appena lo si conosce",
          "Sbaglia in una direzione prevedibile, non a caso"
        ],
        "answer": 3,
        "why": "Un errore casuale si compensa nella media; un bias no, perché spinge sempre dalla stessa parte. Proprio per questo si può prevedere e contrastare."
      },
      {
        "type": "applicazione",
        "q": "In una trattativa il fornitore apre chiedendo 50.000 euro per un lavoro che tu stimavi 30.000. Quale rischio descrive la scheda?",
        "options": [
          "Che la sua cifra spinga verso l'alto la tua controfferta",
          "Che tu rifiuti subito per avversione alle perdite",
          "Nessuno, se conosci bene il valore del lavoro",
          "Che tu scelga un altro fornitore per bias di conferma"
        ],
        "answer": 0,
        "why": "È l'ancoraggio: la prima cifra sposta le stime anche degli esperti, come gli agenti immobiliari dello studio del 1987. Conoscere il valore aiuta, ma non annulla l'effetto."
      },
      {
        "type": "comprensione",
        "q": "Che cosa ha mostrato la crisi di replicazione in psicologia?",
        "options": [
          "Che i bias erano tutti errori statistici",
          "Che alcuni effetti famosi non reggono, altri sì",
          "Che quasi tutti gli effetti sono stati confermati",
          "Che i bias esistono solo in laboratorio"
        ],
        "answer": 1,
        "why": "Alcuni risultati celebri, come certi esperimenti di priming, non si sono riprodotti; l'ancoraggio invece è tra i più confermati. Conviene guardare quanto è solida la prova, non quanto è famoso l'effetto."
      },
      {
        "type": "collegamento",
        "q": "Un trader, per avversione alle perdite, tiene le posizioni in perdita sperando che tornino al prezzo d'acquisto. Quale regola contrasta meglio questo bias?",
        "options": [
          "Aspettare comunque che il titolo torni al prezzo di carico",
          "Comprarne altri per abbassare il prezzo medio",
          "Fissare in anticipo il livello a cui uscire in perdita",
          "Controllare le quotazioni più spesso durante il giorno"
        ],
        "answer": 2,
        "why": "Una regola decisa a mente fredda, prima che la perdita faccia male, è la procedura che la scheda suggerisce contro i bias: non si affida alla forza di volontà del momento."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega che cos'è un bias cognitivo e perché “stare attenti” non basta a evitarlo.",
      "model": "Un bias è un errore di giudizio sistematico: nasce da scorciatoie mentali che di solito funzionano, ma in certe situazioni sbagliano sempre nella stessa direzione. Un esempio è l'ancoraggio, per cui un numero visto prima, anche casuale, sposta le nostre stime. Poiché queste scorciatoie lavorano in automatico, sapere che esistono serve a poco: ci cascano anche gli esperti. Funzionano meglio le procedure, come fissare i criteri prima di vedere le offerte o immaginare in anticipo perché una decisione potrebbe fallire.",
      "points": [
        "Errore sistematico nato da scorciatoie utili",
        "Un esempio concreto, come l'ancoraggio",
        "Servono procedure, non solo consapevolezza"
      ]
    }
  },
  {
    "id": "mente-stoicismo",
    "area": "mente",
    "title": "Lo stoicismo: distinguere ciò che dipende da te",
    "level": 1,
    "minutes": 4,
    "hook": "Marco Aurelio, uno degli uomini più potenti del suo tempo, nei suoi appunti privati si esortava così: al mattino ricordati che oggi incontrerai persone ingrate, arroganti e sleali.",
    "sections": [
      {
        "h": "Una scuola nata sotto un portico",
        "text": "Lo stoicismo nasce ad Atene intorno al 300 a.C., quando Zenone di Cizio comincia a insegnare sotto la Stoà Pecile, il “portico dipinto” da cui la scuola prende il nome. Per quasi cinque secoli è una delle filosofie più diffuse del mondo greco-romano. I testi che ci sono arrivati meglio sono di epoca romana: le lettere e i trattati di Seneca, consigliere di Nerone; le lezioni di Epitteto, un ex schiavo, trascritte dal suo allievo Arriano nelle Diatribe e nel Manuale; e i Pensieri, appunti che l'imperatore Marco Aurelio scrisse in greco per se stesso, in parte durante le campagne militari lungo il Danubio."
      },
      {
        "h": "Ciò che dipende da noi",
        "text": "Il Manuale di Epitteto si apre con una distinzione: alcune cose dipendono da noi, altre no. Dipendono da noi i giudizi, le intenzioni, i desideri e le azioni; non dipendono da noi il corpo, i beni, la reputazione, le cariche, cioè tutto ciò che altri o il caso possono toglierci. Il meccanismo psicologico sta in una delle frasi più citate dello stesso testo: a turbare gli uomini non sono le cose, ma i giudizi che essi danno delle cose. Se un collega non risponde a una mail, l'irritazione nasce dall'interpretazione “mi sta ignorando”, non dal silenzio in sé. Per gli stoici l'unico vero bene è la virtù, cioè agire con saggezza, giustizia, coraggio e misura; ricchezza e salute sono “indifferenti”, preferibili ma non decisive per una vita buona."
      },
      {
        "h": "L'arciere e la gara d'appalto",
        "text": "Un'immagine stoica riportata da Cicerone è quella dell'arciere: deve fare tutto il possibile per mirare bene, ma colpire il bersaglio non dipende solo da lui. Applicata al lavoro, l'idea è concreta. In una gara d'appalto dipendono da te la preparazione, la qualità dell'offerta, la chiarezza della presentazione; non dipendono da te il budget del cliente o il prezzo di un concorrente. Giudicarsi solo sull'esito porta a conclusioni sbagliate, perché un'ottima offerta può perdere e una mediocre può vincere. Seneca raccomandava anche di immaginare in anticipo le avversità possibili, la cosiddetta premeditazione dei mali, per non esserne travolti quando arrivano e per prepararsi meglio."
      },
      {
        "h": "Che cosa lo stoicismo non è",
        "text": "Nell'uso comune “stoico” significa impassibile, ma la scuola non chiedeva di non provare nulla: chiedeva di non farsi trascinare da passioni nate da giudizi sbagliati, come l'ira o la paura sproporzionata, e riconosceva emozioni positive fondate sulla ragione, come la gioia. Non era nemmeno rassegnazione: Seneca e Marco Aurelio ebbero ruoli pubblici di primo piano, e per gli stoici agire per il bene comune era un dovere. Due fondatori delle terapie cognitive, Albert Ellis e Aaron Beck, hanno riconosciuto un debito verso queste idee. Il rischio moderno è ridurre lo stoicismo a una tecnica per sopportare tutto, dimenticando che serve anche a capire che cosa vale la pena cambiare."
      }
    ],
    "facts": [
      "Fondato da Zenone di Cizio ad Atene intorno al 300 a.C.; il nome viene dalla Stoà Pecile, un portico.",
      "Epitteto: alcune cose dipendono da noi, altre no.",
      "Non ci turbano le cose, ma i giudizi che diamo delle cose.",
      "I grandi stoici romani: Seneca, Epitteto, Marco Aurelio.",
      "Stoico non significa insensibile né rassegnato."
    ],
    "links": [
      "mente-machiavelli-principe",
      "storia-impero-romano-caduta",
      "mente-bias-cognitivi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Da dove prende il nome lo stoicismo?",
        "options": [
          "Dal nome del suo fondatore, Stoico di Atene",
          "Da una parola greca che significa sopportare il dolore",
          "Da una scuola fondata a Roma da Seneca",
          "Da un portico di Atene dove insegnava Zenone"
        ],
        "answer": 3,
        "why": "Stoà significa portico: la Stoà Pecile era un portico dipinto nell'agorà di Atene. Il senso di “impassibile” è venuto molto dopo."
      },
      {
        "type": "comprensione",
        "q": "Per Epitteto, perché due persone possono reagire in modo opposto allo stesso evento?",
        "options": [
          "Perché a turbarle non è l'evento, ma il giudizio che ne danno",
          "Perché una delle due ha avuto più fortuna dell'altra",
          "Perché le emozioni sono innate e non si possono modificare in alcun modo",
          "Perché lo stesso evento, oggettivamente, colpisce ciascuno con forza diversa"
        ],
        "answer": 0,
        "why": "Tra l'evento e la reazione c'è un'interpretazione. Per gli stoici è lì che si può lavorare, perché il giudizio dipende da noi."
      },
      {
        "type": "applicazione",
        "q": "Un venditore prepara un'offerta eccellente, ma il cliente sceglie un concorrente per motivi di budget. Come valuterebbe la situazione uno stoico?",
        "options": [
          "Considererebbe la sconfitta la prova che prepararsi non serve",
          "Giudicherebbe il proprio lavoro dalla preparazione, non dall'esito",
          "Smetterebbe di impegnarsi, visto che l'esito non dipende da lui",
          "Darebbe la colpa al cliente, che ha scelto male"
        ],
        "answer": 1,
        "why": "Come l'arciere, il venditore controlla la mira, non dove finisce la freccia. Smettere di impegnarsi sarebbe un fraintendimento: ciò che dipende da noi va fatto al meglio."
      },
      {
        "type": "comprensione",
        "q": "Quale di queste idee sullo stoicismo è un fraintendimento?",
        "options": [
          "Che distingua ciò che dipende da noi da ciò che non dipende",
          "Che consideri decisivi i giudizi che diamo sugli eventi",
          "Che insegni a non provare alcuna emozione",
          "Che i suoi maestri fossero impegnati nella vita pubblica"
        ],
        "answer": 2,
        "why": "Gli stoici combattevano le passioni nate da giudizi sbagliati, come l'ira, ma ammettevano emozioni fondate sulla ragione, come la gioia."
      },
      {
        "type": "collegamento",
        "q": "Machiavelli scrive che la fortuna governa circa metà delle nostre azioni e che l'altra metà dipende da noi. In che cosa si avvicina agli stoici?",
        "options": [
          "Nel ritenere che il successo politico sia l'unico vero bene della vita",
          "Nel credere che il destino decida ogni cosa al posto nostro",
          "Nel pensare che la virtù coincida con la bontà morale",
          "Nel distinguere ciò che controlliamo da ciò che non controlliamo"
        ],
        "answer": 3,
        "why": "Entrambi tracciano un confine tra caso e azione. Ma per gli stoici la virtù è eccellenza morale, per Machiavelli è capacità politica."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega, con un esempio di lavoro, la distinzione stoica tra ciò che dipende da noi e ciò che non dipende.",
      "model": "Per gli stoici, e in particolare per Epitteto, dipendono da noi i giudizi, le intenzioni e le azioni; non dipendono da noi gli esiti, l'opinione degli altri, il mercato. Le emozioni nascono soprattutto dai giudizi che diamo agli eventi, quindi lavorare sui giudizi cambia le reazioni. In una gara d'appalto possiamo controllare la qualità dell'offerta e della preparazione, non la decisione finale: conviene misurarsi su quello. Non è rassegnazione: si mette il massimo impegno su ciò che si può cambiare e si accetta il resto.",
      "points": [
        "Dipendono da noi giudizi e azioni, non gli esiti",
        "Le emozioni seguono i giudizi",
        "Non è passività: impegno pieno su ciò che si controlla"
      ]
    }
  },
  {
    "id": "mente-machiavelli-principe",
    "area": "mente",
    "title": "Machiavelli e Il Principe: il potere com'è",
    "level": 2,
    "minutes": 5,
    "hook": "Il Principe fu scritto nel 1513 da un alto funzionario appena licenziato, poi arrestato e torturato, che dalla sua casa di campagna sperava di tornare a lavorare per i Medici.",
    "sections": [
      {
        "h": "Il segretario caduto in disgrazia",
        "text": "Niccolò Machiavelli, nato a Firenze nel 1469, fu dal 1498 segretario della seconda cancelleria della Repubblica fiorentina: un alto funzionario che scriveva rapporti, organizzava la milizia e andava in missione presso il re di Francia, l'imperatore e Cesare Borgia. Nel 1512 i Medici tornarono al potere con l'appoggio di un esercito spagnolo e la Repubblica cadde. Machiavelli fu licenziato e, l'anno dopo, arrestato perché sospettato di una congiura contro i Medici, torturato e poi liberato. Ritirato nel suo podere vicino a San Casciano, nel 1513 scrisse Il Principe, che dedicò poi a Lorenzo de' Medici, nipote del Magnifico, sperando in un nuovo incarico. Il libro circolò manoscritto e fu stampato solo nel 1532, cinque anni dopo la sua morte."
      },
      {
        "h": "La verità effettuale",
        "text": "Il capitolo XV dichiara il metodo: andare dietro alla “verità effettuale della cosa” piuttosto che alla sua immaginazione. I trattati precedenti descrivevano un sovrano ideale; Machiavelli descrive gli uomini come si comportano, mossi da paura e interesse. Da qui la celebre risposta del capitolo XVII: se non si può essere sia amati sia temuti, è più sicuro essere temuti, perché l'amore è un legame che gli uomini rompono quando conviene, la paura no. Ma il principe deve evitare di essere odiato, e per questo non deve toccare i beni dei sudditi: gli uomini, scrive, dimenticano prima la morte del padre che la perdita del patrimonio. Deve saper essere volpe, per riconoscere le trappole, e leone, per spaventare i lupi. La sua virtù non è la bontà morale, ma la capacità di agire con efficacia sulle circostanze; la fortuna, dice il capitolo XXV, governa circa metà delle nostre azioni, e l'altra metà resta a noi."
      },
      {
        "h": "Cesare Borgia e le offese fatte tutte insieme",
        "text": "Il modello è Cesare Borgia, figlio di papa Alessandro VI, che Machiavelli aveva osservato da vicino. Conquistata la Romagna, terra di signori locali violenti, Borgia vi mise a capo Remirro de Orco, uomo crudele e sbrigativo, che riportò l'ordine. Poi, per non attirarsi l'odio generato da quella durezza, alla fine del 1502 lo fece trovare a Cesena, sulla piazza, tagliato in due. Il capitolo VIII aggiunge una regola sui tempi: le offese vanno fatte tutte insieme, perché si sentano meno, i benefici a poco a poco, perché si apprezzino di più. È un criterio che si riconosce ancora in molte decisioni impopolari, dalla ristrutturazione di un'azienda a una manovra di bilancio."
      },
      {
        "h": "Cinico, realista o repubblicano?",
        "text": "La frase “il fine giustifica i mezzi” non compare nel Principe; il passo più vicino, nel capitolo XVIII, osserva che nelle azioni dei principi “si guarda al fine”, cioè che il giudizio comune si basa sui risultati. Nel 1559 le opere di Machiavelli finirono nell'Indice dei libri proibiti, e “machiavellico” divenne sinonimo di subdolo. Le letture restano diverse: c'è chi vede nel libro un manuale cinico, chi l'atto di nascita della scienza politica moderna, chi, come Rousseau, una lezione rivolta ai popoli più che ai re. Pesa anche il fatto che negli stessi anni Machiavelli scrisse i Discorsi sopra la prima deca di Tito Livio, un elogio della repubblica. Per chi tratta o negozia, la lezione più solida è il metodo: guardare agli interessi reali, non alle dichiarazioni."
      }
    ],
    "facts": [
      "Niccolò Machiavelli (1469-1527), segretario della Repubblica fiorentina dal 1498 al 1512.",
      "Il Principe: scritto nel 1513, stampato postumo nel 1532.",
      "“Verità effettuale”: descrivere il potere com'è, non come dovrebbe essere.",
      "Meglio essere temuti che amati, se non si possono avere entrambe le cose, ma mai odiati.",
      "La fortuna governa circa metà delle nostre azioni; l'altra metà dipende dalla virtù.",
      "“Il fine giustifica i mezzi” non compare nel testo."
    ],
    "links": [
      "storia-rinascimento-firenze",
      "mente-teoria-giochi",
      "mente-stoicismo"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Quando fu stampato per la prima volta Il Principe?",
        "options": [
          "Nel 1513, subito dopo la stesura",
          "Nel 1532, dopo la morte dell'autore",
          "Nel 1498, all'inizio della sua carriera",
          "Nel 1512, alla caduta della Repubblica"
        ],
        "answer": 1,
        "why": "Scritto nel 1513, circolò in copie manoscritte e fu stampato solo nel 1532, cinque anni dopo la morte di Machiavelli."
      },
      {
        "type": "comprensione",
        "q": "Che cosa intende Machiavelli per “virtù” del principe?",
        "options": [
          "La bontà morale e il rispetto sincero della religione",
          "La fortuna di nascere in una famiglia potente",
          "La capacità di agire con efficacia sulle circostanze",
          "L'obbedienza scrupolosa alle leggi della città"
        ],
        "answer": 2,
        "why": "La virtù machiavelliana è energia, abilità, prontezza: ciò che permette di contrastare la fortuna. Con la morale ha poco a che fare."
      },
      {
        "type": "applicazione",
        "q": "Un'azienda deve fare tagli impopolari e vuole anche concedere alcuni benefici. Che cosa suggerirebbe il criterio del capitolo VIII?",
        "options": [
          "Fare i tagli tutti insieme e i benefici a poco a poco",
          "Distribuire i tagli a piccole dosi nel tempo, per non creare allarme",
          "Annunciare subito tutti i benefici e rinviare i tagli",
          "Evitare ogni taglio per non perdere il consenso"
        ],
        "answer": 0,
        "why": "Un'offesa concentrata si assorbe una volta sola; i benefici diluiti nel tempo si notano e si ricordano di più."
      },
      {
        "type": "comprensione",
        "q": "Nell'episodio di Remirro de Orco, qual è secondo Machiavelli il calcolo di Cesare Borgia?",
        "options": [
          "Punire un ministro che aveva disobbedito ai suoi ordini sulla Romagna",
          "Mostrare clemenza per conquistare l'amore del popolo",
          "Liberarsi di un rivale che mirava a prendere il suo posto",
          "Far pacificare la regione a un ministro duro, poi addossargli l'odio"
        ],
        "answer": 3,
        "why": "Remirro fa il lavoro sporco e ne paga il prezzo: il popolo resta pacificato e insieme soddisfatto, e l'odio non ricade su Borgia."
      },
      {
        "type": "collegamento",
        "q": "Machiavelli consiglia al principe di essere anche “volpe”, per riconoscere le trappole. Nel linguaggio della teoria dei giochi, a che cosa corrisponde?",
        "options": [
          "Scegliere sempre la strategia più aggressiva possibile",
          "Fidarsi della parola data dagli avversari",
          "Prevedere le mosse e gli incentivi degli altri",
          "Decidere senza considerare le reazioni degli altri giocatori"
        ],
        "answer": 2,
        "why": "La teoria dei giochi studia proprio le decisioni che dipendono dalle scelte altrui: riconoscere una trappola significa capire che cosa conviene all'avversario."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico che cosa c'è di nuovo nel Principe e perché “machiavellico” ne è un riassunto ingiusto.",
      "model": "Prima di Machiavelli i trattati per i sovrani descrivevano come un principe dovrebbe essere: buono, generoso, pio. Machiavelli sceglie la “verità effettuale” e descrive come il potere funziona davvero, tra paure, interessi e forza. Da qui consigli duri, come preferire essere temuti che amati se non si può avere entrambe le cose, ma mai odiati. Però non scrive che il fine giustifica i mezzi, e nei Discorsi difende la repubblica: più che elogiare la crudeltà, analizza il potere senza illusioni.",
      "points": [
        "Analisi realistica del potere, non precetti morali",
        "Consigli duri legati alla stabilità del potere",
        "“Il fine giustifica i mezzi” è una semplificazione"
      ]
    }
  },
  {
    "id": "mente-teoria-giochi",
    "area": "mente",
    "title": "La teoria dei giochi e il dilemma del prigioniero",
    "level": 2,
    "minutes": 5,
    "hook": "Due persone razionali, facendo ciascuna la scelta migliore per sé, possono finire entrambe peggio di come starebbero collaborando: è il dilemma del prigioniero, e aiuta a capire guerre dei prezzi e corse agli armamenti.",
    "sections": [
      {
        "h": "Decisioni che dipendono dagli altri",
        "text": "La teoria dei giochi studia le situazioni in cui il risultato delle tue scelte dipende anche dalle scelte degli altri, che a loro volta ragionano su di te: una trattativa, un'asta, una guerra dei prezzi. Nasce come disciplina nel 1944 con il libro di John von Neumann e Oskar Morgenstern Theory of Games and Economic Behavior. Nel 1950 John Nash, allora dottorando a Princeton, definì il concetto che porta il suo nome: un equilibrio è una combinazione di strategie in cui nessun giocatore ha interesse a cambiare la propria, date quelle degli altri. Per questi studi Nash ricevette nel 1994 il Nobel per l'economia. Un equilibrio però non è per forza un buon risultato, e il caso più famoso lo dimostra."
      },
      {
        "h": "Il dilemma del prigioniero",
        "text": "Il gioco fu studiato nel 1950 alla RAND Corporation da Merrill Flood e Melvin Dresher; la storia dei prigionieri la aggiunse il matematico Albert Tucker. Due complici vengono interrogati separatamente. Se tacciono entrambi, prendono un anno ciascuno. Se uno confessa e l'altro tace, chi confessa esce libero e l'altro prende dieci anni. Se confessano entrambi, cinque anni a testa. Ragiona come uno dei due: se l'altro tace, confessando passi da un anno a zero; se l'altro confessa, passi da dieci a cinque. In ogni caso confessare conviene, e lo stesso vale per il complice. Risultato: entrambi confessano e prendono cinque anni, mentre tacendo ne avrebbero presi uno. La razionalità individuale produce un esito peggiore per tutti."
      },
      {
        "h": "Il gioco ripetuto e la cooperazione",
        "text": "Le cose cambiano se il gioco si ripete tra le stesse persone. Intorno al 1980 il politologo Robert Axelrod organizzò due tornei in cui programmi proposti da studiosi di varie discipline si sfidavano in lunghe serie di partite del dilemma. Vinse entrambe le volte la strategia più semplice, tit for tat, proposta da Anatol Rapoport: coopera alla prima mossa, poi ripeti la mossa precedente dell'avversario. Funzionava perché non tradiva mai per prima, puniva subito il tradimento, perdonava appena l'altro tornava a cooperare ed era facile da capire. La lezione è che la cooperazione può nascere anche tra egoisti, se il futuro conta abbastanza: chi sa di dover trattare ancora con te ha un motivo concreto per non ingannarti."
      },
      {
        "h": "Dove si ritrova e come si cambia il gioco",
        "text": "La struttura del dilemma compare spesso. Due Stati in corsa agli armamenti, come nella Guerra fredda, spendono enormi risorse per ritrovarsi in un equilibrio che avrebbero potuto avere senza armarsi. I paesi produttori di petrolio riuniti nell'OPEC si accordano su quote di produzione, ma ciascuno è tentato di superarle. Due concorrenti in guerra dei prezzi erodono i margini di entrambi; qui però le regole antitrust vietano gli accordi sui prezzi che risolverebbero il dilemma a danno dei clienti, ed è la società stessa a volere che il dilemma resti. Negli altri casi, per uscirne si cambia il gioco: contratti con penali, garanzie, reputazione, rapporti di lungo periodo. Negli esperimenti, comunque, le persone cooperano più spesso di quanto preveda il modello: equità e reciprocità contano."
      }
    ],
    "facts": [
      "Teoria dei giochi: von Neumann e Morgenstern, 1944.",
      "Equilibrio di Nash: nessuno ha interesse a cambiare strategia da solo.",
      "Nel dilemma del prigioniero tradire conviene a ciascuno, ma il tradimento reciproco danneggia entrambi.",
      "Nei tornei di Axelrod, intorno al 1980, vinse tit for tat: coopera, poi ricambia.",
      "Dal dilemma si esce cambiando il gioco: ripetizione, reputazione, contratti."
    ],
    "links": [
      "diritto-contratto",
      "storia-guerra-fredda",
      "economia-domanda-offerta",
      "scienza-evoluzione"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Quale strategia vinse i tornei di Axelrod sul dilemma del prigioniero ripetuto?",
        "options": [
          "Tradire sempre, fin dal primo turno, per non farsi sfruttare",
          "Cooperare al primo turno, poi copiare l'avversario",
          "Cooperare sempre, qualunque cosa accada",
          "Scegliere ogni volta a caso tra le due mosse"
        ],
        "answer": 1,
        "why": "Tit for tat non batte mai l'avversario nel singolo confronto, ma accumula più punti di tutti perché favorisce la cooperazione e punisce subito chi tradisce."
      },
      {
        "type": "comprensione",
        "q": "Nel dilemma del prigioniero giocato una sola volta, perché entrambi finiscono per confessare?",
        "options": [
          "Perché i due prigionieri non ragionano in modo razionale",
          "Perché ognuno vuole soprattutto danneggiare l'altro",
          "Perché la polizia premia chi tace insieme al complice",
          "Perché confessare conviene qualunque cosa faccia l'altro"
        ],
        "answer": 3,
        "why": "Confessare è la mossa migliore in entrambi i casi possibili: è proprio la razionalità individuale a portare all'esito peggiore per la coppia."
      },
      {
        "type": "comprensione",
        "q": "Che cos'è un equilibrio di Nash?",
        "options": [
          "Una situazione in cui nessuno guadagna cambiando strategia da solo",
          "La soluzione che dà il risultato migliore per tutti i giocatori",
          "Un accordo vincolante firmato tra i giocatori",
          "La strategia che massimizza la somma dei guadagni"
        ],
        "answer": 0,
        "why": "Equilibrio significa stabilità, non ottimo: la confessione reciproca nel dilemma è un equilibrio di Nash, eppure è peggiore per entrambi."
      },
      {
        "type": "applicazione",
        "q": "Con un fornitore, che cosa rende più conveniente comportarsi correttamente anche quando un piccolo inganno non verrebbe scoperto subito?",
        "options": [
          "L'importo particolarmente elevato del singolo affare",
          "La certezza di non rivedersi più",
          "La prospettiva di molti affari futuri insieme",
          "L'assenza di un contratto scritto"
        ],
        "answer": 2,
        "why": "È l'ombra del futuro dei tornei di Axelrod: quando il rapporto si ripete, il guadagno di un inganno oggi vale meno della fiducia che si perde domani."
      },
      {
        "type": "collegamento",
        "q": "In che modo un contratto con penali può risolvere un dilemma del prigioniero tra due soci?",
        "options": [
          "Obbliga per legge entrambi i soci a fidarsi l'uno dell'altro",
          "Cambia i guadagni, rendendo il tradimento meno conveniente",
          "Elimina ogni incertezza sul comportamento futuro",
          "Trasforma la collaborazione in una partita unica"
        ],
        "answer": 1,
        "why": "Il contratto non crea fiducia: cambia la tabella dei guadagni. Se tradire costa una penale, la cooperazione diventa la scelta conveniente per ciascuno."
      }
    ],
    "explain": {
      "prompt": "Spiega a un socio, con un esempio d'affari, perché due parti razionali possono finire entrambe peggio e come si evita.",
      "model": "Nel dilemma del prigioniero ognuno ha un incentivo a tradire, qualunque cosa faccia l'altro, perché tradire dà sempre un guadagno individuale maggiore. Se ragionano così entrambi, finiscono in una situazione peggiore di quella che avrebbero ottenuto cooperando. Succede per esempio quando due soci dovrebbero entrambi investire tempo in un progetto comune, ma ciascuno è tentato di lasciar lavorare l'altro. Se ne esce cambiando il gioco: rapporti ripetuti in cui la reputazione conta, contratti con penali, regole che rendono il tradimento meno conveniente.",
      "points": [
        "Tradire conviene a ciascuno individualmente",
        "Il risultato collettivo è peggiore della cooperazione",
        "Si esce cambiando le regole: ripetizione, reputazione, contratti"
      ]
    }
  },
  {
    "id": "mente-abitudini",
    "area": "mente",
    "title": "Come si formano le abitudini (e perché non bastano 21 giorni)",
    "level": 2,
    "minutes": 5,
    "hook": "L'idea che bastino 21 giorni per creare un'abitudine non viene da nessuno studio: in una ricerca londinese il tempo mediano fu di 66 giorni, con differenze enormi da persona a persona.",
    "sections": [
      {
        "h": "Azioni che partono da sole",
        "text": "Un'abitudine non è solo qualcosa che si fa spesso: è un'azione che parte in automatico quando compare un certo segnale del contesto, che sia un luogo, un'ora o l'azione appena conclusa. Allacciare la cintura appena saliti in auto o prendere il telefono quando si illumina lo schermo sono esempi tipici: non decidiamo, reagiamo. In studi basati su diari, la psicologa Wendy Wood e i suoi colleghi hanno stimato che circa il 40% delle azioni quotidiane si ripete quasi ogni giorno nello stesso contesto, spesso mentre si pensa ad altro. Il vantaggio è grande: l'automatismo libera l'attenzione per ciò che è nuovo. Il prezzo è che le abitudini continuano anche quando non ci servono più."
      },
      {
        "h": "Il meccanismo: contesto, ripetizione, ricompensa",
        "text": "Le abitudini si formano per associazione. Ogni volta che ripetiamo un'azione nello stesso contesto, e l'azione porta un risultato gradito, il legame tra segnale e risposta si rafforza, finché il segnale basta da solo ad avviarla. Gli studi, in gran parte sugli animali, indicano che con la ripetizione il controllo del comportamento si sposta da circuiti che valutano gli obiettivi ad altri circuiti, in una parte dei gangli della base, che lavorano in modo più automatico. Un esperimento classico lo rende evidente: un ratto addestrato a lungo a premere una leva per ottenere cibo continua a premerla anche quando quel cibo non gli interessa più. L'abitudine si è staccata dallo scopo che l'aveva creata."
      },
      {
        "h": "Il mito dei 21 giorni",
        "text": "La cifra dei 21 giorni risale al chirurgo plastico Maxwell Maltz, che nel libro Psycho-Cybernetics del 1960 osservava che i pazienti impiegavano almeno una ventina di giorni ad abituarsi al proprio nuovo aspetto. Non parlava di formazione delle abitudini. Uno studio condotto a Londra da Phillippa Lally e colleghi, pubblicato nel 2010, ha seguito per dodici settimane un centinaio di volontari, ciascuno impegnato a ripetere ogni giorno un comportamento scelto, come bere una bottiglia d'acqua a pranzo. Il tempo stimato per raggiungere quasi il massimo dell'automatismo andava da 18 a 254 giorni, con una mediana di 66, e i comportamenti più semplici, come bere o mangiare qualcosa, tendevano ad automatizzarsi prima dell'esercizio fisico. Saltare una singola occasione non comprometteva il processo: conta la regolarità complessiva, non la perfezione."
      },
      {
        "h": "Progettare il contesto",
        "text": "Ne segue che contare sulla sola forza di volontà è una strategia fragile. Anche l'idea popolare che l'autocontrollo sia un serbatoio che si esaurisce, la cosiddetta deplezione dell'io, è oggi molto discussa: una grande replica coordinata in 23 laboratori, pubblicata nel 2016, ha trovato un effetto vicino a zero. Funzionano meglio due leve più solide. La prima sono i piani “se... allora...”, che lo psicologo Peter Gollwitzer chiama intenzioni di implementazione: “quando finisco il caffè del mattino, chiamo il primo cliente della lista”. La seconda è l'attrito: rendere facile l'azione desiderata e scomoda quella da evitare. I grandi cambiamenti di vita, come un trasloco o un nuovo lavoro, sono finestre utili, perché spariscono i segnali che attivavano le vecchie abitudini."
      }
    ],
    "facts": [
      "Abitudine: azione avviata in automatico da un segnale del contesto.",
      "Circa il 40% delle azioni quotidiane si ripete nello stesso contesto, secondo studi basati su diari.",
      "I “21 giorni” sono un mito: nello studio di Lally la mediana fu 66 giorni, da 18 a 254.",
      "Saltare un giorno non compromette la formazione di un'abitudine.",
      "Piani “se... allora...” e attrito funzionano meglio della sola forza di volontà."
    ],
    "links": [
      "mente-bias-cognitivi",
      "mente-stoicismo",
      "trading-gestione-rischio"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Nello studio di Lally e colleghi, qual era il tempo mediano perché un nuovo comportamento diventasse quasi automatico?",
        "options": [
          "Circa 21 giorni",
          "Circa 30 giorni",
          "Circa 66 giorni",
          "Circa 254 giorni"
        ],
        "answer": 2,
        "why": "66 giorni è la mediana; 254 era il caso più lento stimato e 21 viene da un libro del 1960 che parlava d'altro."
      },
      {
        "type": "comprensione",
        "q": "Perché un trasloco o un nuovo lavoro sono buoni momenti per cambiare abitudini?",
        "options": [
          "Perché lo stress aumenta la forza di volontà",
          "Perché mancano i segnali che attivavano le vecchie abitudini",
          "Perché le abitudini si cancellano dopo qualche settimana di pausa",
          "Perché il cervello si rinnova quando cambia ambiente"
        ],
        "answer": 1,
        "why": "Le abitudini sono legate a segnali del contesto: se il contesto cambia, l'automatismo perde il suo innesco e c'è spazio per costruirne uno nuovo."
      },
      {
        "type": "applicazione",
        "q": "Un commerciale vuole aggiornare il CRM dopo ogni visita, ma se ne dimentica spesso. Quale strategia è più coerente con la scheda?",
        "options": [
          "Ripetersi ogni mattina quanto è importante aggiornare il CRM",
          "Aspettare un periodo meno impegnato per cominciare con calma",
          "Recuperare tutto con un grande aggiornamento settimanale il venerdì",
          "Legarlo a un segnale: “risalito in auto, aggiorno il CRM”"
        ],
        "answer": 3,
        "why": "Un piano “se... allora...” lega l'azione a un segnale preciso e ripetuto, cioè alla condizione in cui si forma un'abitudine."
      },
      {
        "type": "comprensione",
        "q": "Che cosa è emerso sull'idea della forza di volontà come serbatoio che si esaurisce?",
        "options": [
          "Una grande replica ha trovato un effetto vicino a zero",
          "È stata confermata da tutti gli studi successivi più rigorosi",
          "Vale solo per le persone che hanno poco autocontrollo",
          "È stata dimostrata misurando il consumo di glucosio nel cervello"
        ],
        "answer": 0,
        "why": "La replica del 2016 in 23 laboratori non ha trovato l'effetto atteso: per questo è più prudente progettare il contesto che contare sulla volontà."
      },
      {
        "type": "collegamento",
        "q": "Perché, sia per le abitudini sia per i bias cognitivi, cambiare il contesto funziona meglio che contare sulla consapevolezza?",
        "options": [
          "Perché la consapevolezza peggiora entrambi i problemi",
          "Perché dipendono soltanto dall'ambiente esterno e non dalla mente",
          "Perché entrambi agiscono in automatico, prima del ragionamento",
          "Perché si possono correggere solo con l'aiuto di esperti"
        ],
        "answer": 2,
        "why": "Abitudini e scorciatoie mentali scattano senza deliberazione: per questo funzionano meglio procedure e ambienti preparati prima che buoni propositi."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega perché, per creare un'abitudine, conta più il contesto della forza di volontà.",
      "model": "Un'abitudine è un'azione che parte da sola quando compare un certo segnale: un luogo, un orario, l'azione precedente. Si forma ripetendo lo stesso comportamento nello stesso contesto finché l'associazione diventa automatica, e spesso servono settimane o mesi, non 21 giorni. La forza di volontà aiuta all'inizio ma è incostante, mentre un piano preciso del tipo “quando succede X, faccio Y” e un ambiente che renda facile l'azione giusta funzionano anche nei giorni no. Saltare una volta ogni tanto non rovina il processo.",
      "points": [
        "Un segnale del contesto avvia l'azione",
        "Ripetizione nello stesso contesto per settimane o mesi",
        "Piani se-allora e ambiente contano più della volontà"
      ]
    }
  },
  {
    "id": "arte-dante-commedia",
    "area": "arte",
    "title": "La Divina Commedia: il viaggio che ha fatto l'italiano",
    "level": 1,
    "minutes": 5,
    "hook": "Ogni volta che dici 'senza infamia e senza lode' o che qualcosa 'ti fa tremare le vene e i polsi' stai citando un libro scritto settecento anni fa da un esule.",
    "sections": [
      {
        "h": "Un esule e il suo viaggio",
        "text": "Dante Alighieri nacque a Firenze nel 1265 e partecipò attivamente alla politica della città: nel 1300 fu tra i priori, la massima magistratura. Nelle lotte tra le fazioni guelfe dei Bianchi e dei Neri si schierò con i Bianchi e, quando prevalsero i Neri, nel 1302 fu condannato all'esilio. Non tornò mai più a Firenze e morì a Ravenna nel 1321. Durante l'esilio scrisse la Commedia, il racconto di un viaggio immaginario nell'aldilà compiuto nella settimana santa del 1300, quando Dante aveva 35 anni: 'nel mezzo del cammin di nostra vita'. Lo guidano il poeta latino Virgilio attraverso Inferno e Purgatorio, poi Beatrice, la donna amata in gioventù, nel Paradiso."
      },
      {
        "h": "Un'architettura quasi matematica",
        "text": "L'opera è divisa in tre cantiche, Inferno, Purgatorio e Paradiso, di 33 canti ciascuna, più un canto introduttivo: cento in tutto. È scritta in terzine di endecasillabi a rima incatenata, ABA BCB CDC, che fanno avanzare il testo come una catena, e ogni cantica si chiude con la parola 'stelle'. Nell'Inferno vale la legge del contrappasso: la pena rispecchia la colpa. I lussuriosi, come Paolo e Francesca, sono trascinati per sempre da una bufera, come in vita si lasciarono travolgere dalla passione; gli indovini, che pretesero di vedere il futuro, camminano con la testa girata all'indietro. Il titolo era solo 'Commedia': secondo la retorica medievale, infatti, la commedia comincia male e finisce bene e può mescolare registri alti e bassi, come fa Dante. L'aggettivo 'divina' viene da Boccaccio e compare nel titolo in un'edizione veneziana del 1555."
      },
      {
        "h": "Perché ha fatto l'italiano",
        "text": "Dante scelse di scrivere in volgare fiorentino, la lingua parlata, e non in latino, la lingua della cultura. Così si rivolgeva a un pubblico più ampio e mostrava che quel volgare poteva dire tutto, dal linguaggio crudo dei diavoli alla teologia più astratta. L'opera ebbe un successo enorme, fu copiata in centinaia di manoscritti e commentata già nel Trecento. Insieme a Petrarca e Boccaccio, le 'tre corone' fiorentine, Dante diede al toscano un prestigio che nessun altro volgare aveva. Nel Cinquecento Pietro Bembo indicò come modello il fiorentino letterario del Trecento, e nel 1612 il Vocabolario della Crusca fissò quella lingua come norma. Per questo un italiano di oggi riconosce gran parte delle parole della Commedia, mentre un inglese legge con fatica Chaucer, vissuto qualche decennio dopo Dante."
      },
      {
        "h": "Dante nella lingua di tutti i giorni",
        "text": "Molte espressioni comuni vengono dalla Commedia: 'lasciate ogni speranza', 'non ragioniam di lor, ma guarda e passa', 'galeotto fu il libro', 'cosa fatta capo ha', 'il bel paese'. Ma il motivo per leggerla non è solo linguistico. È anche un libro sul potere e sulle sue degenerazioni: Dante colloca all'Inferno papi simoniaci e politici corrotti della sua epoca, e nel canto di Ulisse fa dire 'fatti non foste a viver come bruti, ma per seguir virtute e canoscenza'. Dal 2020 il 25 marzo, data che molti studiosi indicano come inizio del viaggio, si celebra il Dantedì."
      }
    ],
    "facts": [
      "Dante: Firenze 1265 - Ravenna 1321, esule dal 1302.",
      "Tre cantiche, 100 canti, terzine di endecasillabi a rima incatenata.",
      "Il viaggio è ambientato nella settimana santa del 1300.",
      "Contrappasso: la pena rispecchia la colpa.",
      "'Divina' è un'aggiunta successiva, che risale a Boccaccio."
    ],
    "links": [
      "arte-manzoni-promessi-sposi",
      "storia-unita-italia",
      "storia-rinascimento-firenze"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Quanti canti ha in tutto la Divina Commedia?",
        "options": [
          "99",
          "100",
          "33",
          "120"
        ],
        "answer": 1,
        "why": "Tre cantiche di 33 canti più un canto introduttivo: 1 + 33 × 3 = 100, un numero che nel Medioevo simboleggiava la perfezione."
      },
      {
        "type": "applicazione",
        "q": "Seguendo la logica del contrappasso, quale pena sarebbe più coerente per chi in vita ha seminato discordia e diviso le persone?",
        "options": [
          "Restare immerso nel ghiaccio, immobile e in silenzio",
          "Correre per sempre dietro a un'insegna senza significato",
          "Essere tagliato e diviso nel corpo, come divise gli altri",
          "Bruciare per sempre dentro una tomba infuocata"
        ],
        "answer": 2,
        "why": "È proprio la pena che Dante sceglie nel canto XXVIII: i seminatori di discordia sono squarciati da un diavolo, come in vita spezzarono comunità e famiglie."
      },
      {
        "type": "comprensione",
        "q": "Perché la Commedia ebbe un ruolo così importante nella nascita dell'italiano?",
        "options": [
          "Perché Dante inventò da solo la maggior parte delle parole italiane di oggi",
          "Perché fu imposta per legge nelle scuole di tutti gli Stati italiani",
          "Perché era scritta in un latino semplice, comprensibile in tutta la penisola",
          "Perché il suo prestigio, con Petrarca e Boccaccio, rese il fiorentino il modello"
        ],
        "answer": 3,
        "why": "Non fu un'imposizione: il fiorentino si affermò perché le 'tre corone' lo resero la lingua letteraria più prestigiosa, poi codificata da Bembo e dalla Crusca."
      },
      {
        "type": "comprensione",
        "q": "Perché Dante intitolò la sua opera 'Commedia'?",
        "options": [
          "Perché comincia nell'orrore, finisce bene e mescola stili alti e bassi",
          "Perché era destinata a essere recitata in teatro dagli attori",
          "Perché contiene molte scene comiche pensate per far ridere",
          "Perché il titolo fu scelto da Boccaccio dopo la morte di Dante"
        ],
        "answer": 0,
        "why": "Per la retorica medievale la commedia va da un inizio triste a una fine lieta, con uno stile anche umile; 'divina' fu aggiunto dopo, su suggestione di Boccaccio."
      },
      {
        "type": "collegamento",
        "q": "Cinque secoli dopo Dante, Manzoni rivide I promessi sposi sul fiorentino parlato. Che cosa conferma questa scelta?",
        "options": [
          "Che il milanese era ormai diventato la lingua letteraria più diffusa",
          "Che il fiorentino era rimasto il riferimento per la lingua comune",
          "Che la lingua di Dante era diventata del tutto incomprensibile",
          "Che la lingua italiana era nata soltanto con l'Unità del 1861"
        ],
        "answer": 1,
        "why": "Dalla Commedia in poi il toscano letterario è stato il modello dell'italiano scritto; Manzoni volle ancorarlo all'uso vivo dei fiorentini colti."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico perché si dice che la Divina Commedia ha 'fatto l'italiano'.",
      "model": "Dante, esule da Firenze, scrisse la Commedia nel volgare fiorentino invece che in latino, mostrando che quella lingua poteva esprimere tutto, dall'insulto alla teologia. L'opera ebbe un successo enorme e, insieme a Petrarca e Boccaccio, diede al fiorentino un prestigio unico. Nei secoli successivi letterati e vocabolari presero quella lingua come modello, che così è diventata la base dell'italiano. Per questo usiamo ancora sue espressioni, come 'senza infamia e senza lode'.",
      "points": [
        "Scelta del volgare fiorentino invece del latino",
        "Prestigio delle tre corone e codificazione successiva",
        "Molte parole ed espressioni dantesche sono ancora in uso"
      ]
    }
  },
  {
    "id": "arte-caravaggio",
    "area": "arte",
    "title": "Caravaggio: luce, ombra e scandalo",
    "level": 1,
    "minutes": 5,
    "hook": "Nella Roma di inizio Seicento alcuni suoi quadri sacri furono rifiutati o fecero scandalo: i santi sembravano popolani con i piedi nudi in primo piano, la Madonna una donna qualunque.",
    "sections": [
      {
        "h": "Una vita da romanzo",
        "text": "Michelangelo Merisi nacque a Milano nel 1571 da una famiglia originaria di Caravaggio, in provincia di Bergamo, il paese da cui prese il nome. Si formò nella bottega del pittore Simone Peterzano e negli anni Novanta del Cinquecento si trasferì a Roma. Dopo anni difficili trovò un protettore nel cardinale Francesco Maria Del Monte e, nel 1599-1600, ottenne la prima grande commissione pubblica: le tele con le storie di san Matteo nella cappella Contarelli, in San Luigi dei Francesi. Fu un successo immediato. La sua vita però era segnata da risse e denunce: nel 1606 uccise Ranuccio Tomassoni in uno scontro e fu condannato a morte. Fuggì tra Napoli, Malta e la Sicilia, continuando a dipingere, e morì nel 1610 a Porto Ercole mentre cercava di tornare a Roma per ottenere la grazia. Le cause della morte sono ancora discusse."
      },
      {
        "h": "Il metodo: dal vero e al buio",
        "text": "Caravaggio dipingeva direttamente dal vero, con modelli presi dalla strada, e non ci sono disegni preparatori attribuiti a lui con certezza: a volte tracciava incisioni sulla preparazione della tela per fissare i contorni. La sua cifra è il contrasto netto tra luce e ombra: sfondi quasi neri e una luce radente, da una sola direzione, che colpisce le figure come un riflettore. Più tardi questo stile sarà chiamato tenebrismo. L'effetto è teatrale ma soprattutto selettivo: la luce decide che cosa guardare e in che ordine, e lascia nell'ombra tutto il resto."
      },
      {
        "h": "Un esempio: la Vocazione di san Matteo",
        "text": "Nella Vocazione di san Matteo, a San Luigi dei Francesi, la scena del Vangelo si svolge in una stanza qualunque della Roma del tempo. Alcuni uomini vestiti alla moda contano monete attorno a un tavolo. Da destra entra Cristo, quasi nascosto, e indica con un gesto che ricorda quello dell'Adamo di Michelangelo nella Cappella Sistina. Il fascio di luce entra con lui e attraversa la stanza in diagonale: è la luce a raccontare la chiamata. Chi sia esattamente Matteo, l'uomo con la barba o il giovane chino sulle monete, è ancora discusso. Era questa la novità: il sacro dentro la vita di tutti i giorni, con persone comuni come protagonisti."
      },
      {
        "h": "Scandalo ed eredità",
        "text": "Dopo il Concilio di Trento la Chiesa chiedeva immagini chiare e capaci di commuovere i fedeli. Caravaggio le offrì in modo radicale, ma per alcuni committenti superò il limite del decoro. La Morte della Vergine fu rifiutata dai carmelitani di Santa Maria della Scala: la Madonna appariva come una donna morta qualunque, gonfia e scalza. Il quadro fu acquistato dal duca di Mantova su consiglio di Rubens e oggi è al Louvre. Il suo stile si diffuse rapidamente in tutta Europa, dai 'caravaggeschi' come Artemisia Gentileschi fino a Ribera e ai pittori olandesi. Poi fu a lungo trascurato, finché nel Novecento lo storico dell'arte Roberto Longhi lo riportò al centro con la mostra di Milano del 1951. Fotografi, registi e allestitori usano ancora la sua lezione: un'unica luce decisa su uno sfondo scuro dice all'occhio dove guardare."
      }
    ],
    "facts": [
      "Michelangelo Merisi: Milano 1571 - Porto Ercole 1610.",
      "1599-1600: storie di san Matteo nella cappella Contarelli, a Roma.",
      "Tenebrismo: sfondi scuri e luce radente da una sola direzione.",
      "1606: uccide Ranuccio Tomassoni e fugge da Roma.",
      "Riscoperto nel Novecento grazie a Roberto Longhi (mostra di Milano, 1951)."
    ],
    "links": [
      "arte-impressionismo",
      "storia-rinascimento-firenze",
      "arte-prospettiva"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Dove si trovano le tele di Caravaggio con le storie di san Matteo?",
        "options": [
          "Nella Pinacoteca di Brera, a Milano",
          "Nella chiesa di San Luigi dei Francesi, a Roma",
          "Nella Galleria degli Uffizi, a Firenze",
          "Nella concattedrale di San Giovanni, a La Valletta"
        ],
        "answer": 1,
        "why": "La cappella Contarelli fu la prima grande commissione pubblica di Caravaggio, nel 1599-1600. A La Valletta si trova invece la sua Decollazione del Battista."
      },
      {
        "type": "comprensione",
        "q": "Che funzione ha la luce nei quadri di Caravaggio?",
        "options": [
          "Riproduce con esattezza la luce naturale di una giornata all'aperto",
          "Illumina in modo uniforme tutta la scena, per mostrare ogni dettaglio",
          "Serve soprattutto a nascondere gli errori di disegno delle figure",
          "Guida lo sguardo e racconta la scena, lasciando il resto nell'ombra"
        ],
        "answer": 3,
        "why": "Nella Vocazione di san Matteo il fascio di luce entra con Cristo e attraversa la stanza: è la luce a raccontare la chiamata."
      },
      {
        "type": "comprensione",
        "q": "Perché la Morte della Vergine fu rifiutata dai committenti?",
        "options": [
          "Perché la Madonna appariva come una donna qualunque, gonfia e scalza",
          "Perché Caravaggio la consegnò con anni di ritardo sui tempi pattuiti",
          "Perché il quadro era troppo piccolo per l'altare della chiesa",
          "Perché raffigurava la Madonna in modo troppo idealizzato e distante"
        ],
        "answer": 0,
        "why": "Per i carmelitani quel realismo violava il decoro dovuto al sacro; eppure Rubens consigliò al duca di Mantova di comprarlo, e oggi è al Louvre."
      },
      {
        "type": "applicazione",
        "q": "Devi allestire la foto di un prodotto e vuoi che l'occhio vada subito su un solo dettaglio. Quale scelta segue la lezione di Caravaggio?",
        "options": [
          "Molte luci diffuse, così che tutto sia illuminato allo stesso modo",
          "Uno sfondo molto colorato e pieno di oggetti, per creare atmosfera",
          "Un'unica luce decisa e laterale, con lo sfondo lasciato in ombra",
          "La luce piena di mezzogiorno, che riduce al minimo le ombre"
        ],
        "answer": 2,
        "why": "Il contrasto forte seleziona: ciò che è illuminato diventa protagonista e il resto scompare, come nei quadri del tenebrismo."
      },
      {
        "type": "collegamento",
        "q": "Sia Caravaggio sia gli impressionisti misero la luce al centro della pittura. Qual è la differenza principale?",
        "options": [
          "Caravaggio una luce drammatica e costruita, gli impressionisti quella mutevole dell'aria aperta",
          "Caravaggio dipingeva soprattutto paesaggi, gli impressionisti soprattutto soggetti religiosi",
          "Caravaggio usava colori chiari, gli impressionisti sfondi quasi neri e luci radenti",
          "Caravaggio dipingeva all'aperto, gli impressionisti nel buio dei loro studi"
        ],
        "answer": 0,
        "why": "Caravaggio costruiva la luce come un regista; gli impressionisti cercavano di catturare quella reale, che cambia con l'ora e la stagione."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico che cosa rese Caravaggio così rivoluzionario.",
      "model": "Caravaggio dipingeva dal vero, usando come modelli persone prese dalla strada, e metteva le scene sacre in ambienti comuni della Roma del suo tempo. Il suo segno distintivo è il contrasto tra sfondi scuri e una luce forte da una sola direzione, che sceglie che cosa mostrare e guida lo sguardo come un riflettore. Questo realismo commuoveva molti ma scandalizzava altri, tanto che alcune opere furono rifiutate. Dopo di lui, pittori di tutta Europa imitarono il suo modo di usare la luce.",
      "points": [
        "Realismo: modelli dal vero e sacro nella vita quotidiana",
        "Contrasto tra luce e ombra che guida lo sguardo",
        "Scandalo all'epoca e grande influenza in Europa"
      ]
    }
  },
  {
    "id": "arte-prospettiva",
    "area": "arte",
    "title": "La prospettiva: come il Rinascimento ha insegnato a vedere",
    "level": 2,
    "minutes": 5,
    "hook": "Le rotaie di un binario non si incontrano mai, eppure in una foto scattata lungo i binari sembrano convergere in un punto: il Rinascimento ha trasformato questa illusione in una regola geometrica.",
    "sections": [
      {
        "h": "Prima della regola",
        "text": "Gli antichi romani sapevano suggerire la profondità, come mostrano gli affreschi di Pompei, e Giotto all'inizio del Trecento costruiva spazi credibili nella Cappella degli Scrovegni a Padova. Ma lo facevano a occhio, senza un metodo unico: le linee di un soffitto o di un pavimento non convergevano tutte nello stesso punto. Altre tradizioni non cercavano nemmeno questo effetto. La pittura bizantina poneva le figure sacre su fondi d'oro, fuori dallo spazio reale; quella cinese su rotolo invitava lo sguardo a spostarsi lungo la scena. La prospettiva come la intendiamo noi non è quindi il modo naturale di dipingere: è un'invenzione, con un luogo e un'epoca precisi."
      },
      {
        "h": "Brunelleschi, Alberti e la geometria",
        "text": "Nei primi decenni del Quattrocento, a Firenze, Filippo Brunelleschi dimostrò con un esperimento che si poteva dipingere uno spazio esattamente come lo vede l'occhio. Dipinse il Battistero, visto dalla porta del Duomo, su una tavoletta con un piccolo foro: chi guardava dal retro attraverso il foro vedeva il dipinto riflesso in uno specchio tenuto davanti; togliendo lo specchio, al suo posto compariva il Battistero vero, con le stesse linee. Nel 1435 Leon Battista Alberti, nel trattato De pictura, ne fissò la regola. Il quadro è come una finestra aperta: le linee che si allontanano dritte davanti all'osservatore, come i bordi di un pavimento o di un soffitto, convergono in un unico punto di fuga, posto sull'orizzonte, all'altezza dei suoi occhi. Le dimensioni sono inversamente proporzionali alla distanza: un oggetto due volte più lontano appare alto la metà."
      },
      {
        "h": "Un esempio: la Trinità di Masaccio",
        "text": "Tra il 1425 e il 1428 circa Masaccio dipinse la Trinità in Santa Maria Novella, a Firenze. Su una parete piatta sembra aprirsi una cappella con una volta a cassettoni, costruita con le regole della prospettiva, forse con i consigli di Brunelleschi. Il punto di fuga è all'altezza degli occhi di chi guarda dalla navata, così l'illusione funziona per lo spettatore reale. Alla fine del secolo Leonardo, nell'Ultima Cena di Milano, fece convergere tutte le linee della stanza sulla testa di Cristo: la geometria diventa un modo per indicare il centro del racconto. Piero della Francesca dedicò alla prospettiva un intero trattato, e nelle botteghe divenne un sapere tecnico da imparare."
      },
      {
        "h": "Perché conta ancora",
        "text": "Non è un caso che la prospettiva sia nata in una città di mercanti: nelle scuole d'abaco i figli dei commercianti imparavano geometria pratica, misure e proporzioni e, come ha sostenuto lo storico dell'arte Michael Baxandall, una pittura costruita con la matematica parlava la loro lingua. Oggi la stessa geometria è nelle macchine fotografiche, nel cinema e nei programmi di grafica 3D, che calcolano le immagini proprio come Alberti, proiettando lo spazio su un piano da un unico punto di vista. Conoscerla aiuta anche a non farsi ingannare: le foto di stanze scattate da vicino con un grandangolo esagerano la profondità e fanno sembrare gli ambienti più grandi. E ricorda che ogni immagine, anche la più realistica, mostra il mondo da un punto di vista scelto da qualcuno."
      }
    ],
    "facts": [
      "Prospettiva lineare: le linee che si allontanano davanti a chi guarda convergono in un punto di fuga sull'orizzonte.",
      "Esperimento di Brunelleschi a Firenze, nei primi decenni del Quattrocento.",
      "1435: Alberti fissa la regola nel De pictura.",
      "Masaccio, Trinità (circa 1425-1428): un'architettura dipinta che sembra reale.",
      "Un oggetto due volte più lontano appare alto la metà."
    ],
    "links": [
      "storia-rinascimento-firenze",
      "mente-bias-cognitivi",
      "arte-impressionismo"
    ],
    "quiz": [
      {
        "type": "comprensione",
        "q": "Secondo Alberti, dove convergono le linee parallele che si allontanano dritte davanti all'osservatore, come i bordi di un pavimento?",
        "options": [
          "Al centro esatto del quadro, qualunque sia il punto di vista",
          "In un unico punto di fuga sull'orizzonte, all'altezza degli occhi",
          "Ai bordi del quadro, dove la scena dipinta termina",
          "Da nessuna parte: restano parallele anche nel disegno"
        ],
        "answer": 1,
        "why": "L'orizzonte coincide con l'altezza degli occhi di chi guarda: per questo spostare il punto di vista cambia tutta la costruzione."
      },
      {
        "type": "applicazione",
        "q": "In un disegno in prospettiva due lampioni identici si trovano a 10 e a 20 metri dall'osservatore. Quanto appare alto il più vicino rispetto all'altro?",
        "options": [
          "Uguale",
          "La metà",
          "Il doppio",
          "Il quadruplo"
        ],
        "answer": 2,
        "why": "Le dimensioni apparenti sono inversamente proporzionali alla distanza: a distanza dimezzata, altezza doppia."
      },
      {
        "type": "comprensione",
        "q": "Perché Masaccio pose il punto di fuga della Trinità all'altezza degli occhi di chi guarda?",
        "options": [
          "Perché il regolamento della chiesa imponeva di dipingere solo in basso",
          "Perché Masaccio non conosceva ancora le regole della prospettiva",
          "Perché in questo modo il dipinto sembra più piccolo e raccolto",
          "Perché così l'illusione dello spazio funziona per lo spettatore reale"
        ],
        "answer": 3,
        "why": "La prospettiva è costruita per un punto di vista preciso: se coincide con quello del visitatore, la parete sembra davvero aprirsi su una cappella."
      },
      {
        "type": "applicazione",
        "q": "In un annuncio immobiliare un soggiorno sembra enorme. Che cosa ti suggerisce ciò che sai della prospettiva?",
        "options": [
          "Che una foto scattata da vicino con un grandangolo può esagerare la profondità",
          "Che le foto rispettano sempre le proporzioni reali degli ambienti",
          "Che la stanza è davvero grande, perché la prospettiva non inganna",
          "Che il fotografo ha per forza modificato l'immagine al computer"
        ],
        "answer": 0,
        "why": "Da vicino gli oggetti in primo piano diventano enormi rispetto a quelli lontani: la geometria è corretta, ma l'impressione di spazio è amplificata."
      },
      {
        "type": "collegamento",
        "q": "Perché non è un caso che la prospettiva sia nata nella Firenze dei mercanti e dei banchieri?",
        "options": [
          "Perché la Chiesa vietava altrove l'uso della geometria nella pittura sacra",
          "Perché committenti ricchi pagavano le novità e i mercanti conoscevano la geometria",
          "Perché Firenze era l'unica città italiana in cui si studiava l'arte antica",
          "Perché i banchieri volevano quadri da usare come garanzia per i prestiti"
        ],
        "answer": 1,
        "why": "Denaro e competizione tra committenti finanziavano l'innovazione, e un pubblico formato nelle scuole d'abaco apprezzava una pittura costruita con la matematica."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega che cos'è la prospettiva e perché è stata una rivoluzione.",
      "model": "La prospettiva lineare è un metodo geometrico per rappresentare lo spazio su una superficie piatta come lo vede un occhio fermo. Le linee parallele che si allontanano convergono in un punto di fuga sull'orizzonte, e gli oggetti si rimpiccioliscono in proporzione alla distanza. Brunelleschi la dimostrò a Firenze nel primo Quattrocento e Alberti la mise per iscritto nel 1435. Fu una rivoluzione perché trasformò l'illusione della profondità in una regola che si poteva insegnare, ed è la stessa geometria che usano oggi fotografia e grafica 3D.",
      "points": [
        "Linee parallele che convergono in un punto di fuga",
        "Dimensioni proporzionali alla distanza, da un unico punto di vista",
        "Da Brunelleschi e Alberti fino a fotografia e grafica 3D"
      ]
    }
  },
  {
    "id": "arte-impressionismo",
    "area": "arte",
    "title": "L'impressionismo: dipingere la luce e l'attimo",
    "level": 2,
    "minutes": 5,
    "hook": "Il nome 'impressionisti' nacque da un articolo satirico: un critico voleva prendere in giro un quadro di Monet, e quei pittori finirono per adottare l'insulto come bandiera.",
    "sections": [
      {
        "h": "Fuori dal Salon",
        "text": "Nella Parigi dell'Ottocento il successo di un pittore passava dal Salon, la grande esposizione ufficiale legata all'Accademia di Belle Arti. La giuria premiava soggetti storici, mitologici e religiosi, con una pittura levigata in cui la pennellata non si vedeva. Molti giovani artisti venivano esclusi: nel 1863 i rifiutati erano così tanti che Napoleone III autorizzò un 'Salon dei rifiutati', dove fece scandalo Le déjeuner sur l'herbe di Édouard Manet. Nel 1874 un gruppo di pittori, tra cui Claude Monet, Pierre-Auguste Renoir, Edgar Degas, Camille Pissarro, Alfred Sisley e Berthe Morisot, decise di fare da sé: fondò una società di artisti e organizzò una mostra indipendente nell'ex studio del fotografo Nadar, a Parigi. Vi partecipò anche l'italiano Giuseppe De Nittis."
      },
      {
        "h": "La tecnica: inseguire la luce che cambia",
        "text": "Tra le opere esposte c'era Impression, soleil levant di Monet, una veduta del porto di Le Havre all'alba. Il critico Louis Leroy, sul giornale satirico Le Charivari, la derise e chiamò il gruppo 'impressionisti'. In effetti il loro obiettivo era proprio l'impressione: rendere la luce di un momento preciso, che cambia con l'ora, la stagione e il tempo atmosferico. Per riuscirci dipingevano spesso all'aperto, en plein air, con pennellate brevi e visibili e colori puri accostati invece che mescolati, lasciando che fosse l'occhio a fonderli. Le ombre non sono nere ma blu o viola, come appaiono davvero sotto il sole. Monet arrivò a dipingere lo stesso soggetto decine di volte: la facciata della cattedrale di Rouen in più di trenta tele, ognuna con una luce diversa."
      },
      {
        "h": "Le condizioni materiali di una rivoluzione",
        "text": "L'impressionismo dipese anche da innovazioni tecniche. Il tubetto metallico per i colori, brevettato nel 1841 dal pittore americano John Goffe Rand, permetteva di portare con sé colori già pronti, senza doverli macinare e preparare in studio. Nuovi pigmenti industriali offrivano tinte brillanti, e le ferrovie portavano i pittori in poche ore dalla città alle rive della Senna e alla costa della Normandia. La fotografia, nata nel 1839, toglieva alla pittura il compito di documentare con esattezza; secondo un'interpretazione diffusa, la spinse verso ciò che la fotografia del tempo non sapeva rendere, come il colore e la luce in movimento. Contavano anche le stampe giapponesi, arrivate in Europa dopo l'apertura del Giappone, con le loro inquadrature asimmetriche e i colori piatti."
      },
      {
        "h": "Il mercato e la lezione",
        "text": "Le otto mostre del gruppo, dal 1874 al 1886, all'inizio vendettero poco e attirarono molte critiche. A crederci fu soprattutto un mercante, Paul Durand-Ruel, che comprò centinaia di tele rischiando più volte il fallimento e nel 1886 organizzò a New York una mostra di successo: il mercato americano cambiò la fortuna del movimento. Oggi le opere impressioniste sono tra le più costose al mondo: nel 2019 uno dei Covoni di Monet è stato venduto all'asta per circa 110 milioni di dollari. La storia ha anche una lezione pratica: quando i canali ufficiali escludono un'idea nuova, si può creare un canale proprio, ma serve qualcuno disposto a investire nel lungo periodo e un pubblico nuovo da raggiungere."
      }
    ],
    "facts": [
      "1874: prima mostra degli impressionisti, nello studio di Nadar a Parigi.",
      "Il nome viene da Impression, soleil levant di Monet, deriso dal critico Louis Leroy.",
      "Tecnica: pittura all'aperto, pennellate visibili, colori puri accostati, ombre colorate.",
      "1841: brevetto del tubetto metallico per i colori.",
      "Otto mostre del gruppo, dal 1874 al 1886."
    ],
    "links": [
      "arte-caravaggio",
      "storia-rivoluzione-industriale",
      "economia-domanda-offerta"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "Da quale quadro deriva il nome 'impressionismo'?",
        "options": [
          "Le déjeuner sur l'herbe di Manet",
          "Una delle Cattedrali di Rouen di Monet",
          "Il Ballo al Moulin de la Galette di Renoir",
          "Impression, soleil levant di Monet"
        ],
        "answer": 3,
        "why": "Louis Leroy prese spunto dal titolo del quadro di Monet per deridere tutto il gruppo. Manet, pur vicino a quei pittori, non espose mai alle loro mostre."
      },
      {
        "type": "comprensione",
        "q": "Perché Monet dipinse la facciata della cattedrale di Rouen più di trenta volte?",
        "options": [
          "Perché i committenti gli chiedevano copie identiche dello stesso quadro",
          "Per mostrare come la stessa facciata cambia con la luce delle diverse ore",
          "Per correggere a ogni versione gli errori di prospettiva della precedente",
          "Perché la Chiesa gli aveva commissionato un ciclo di immagini sacre"
        ],
        "answer": 1,
        "why": "Per gli impressionisti il vero soggetto è la luce: lo stesso edificio diventa un quadro diverso a ogni ora e con ogni tempo."
      },
      {
        "type": "comprensione",
        "q": "Perché il tubetto metallico per i colori, brevettato nel 1841, fu importante per gli impressionisti?",
        "options": [
          "Permetteva di portare colori pronti all'aperto e dipingere en plein air",
          "Rendeva i colori così economici che anche i pittori poveri potevano comprarli",
          "Rallentava l'asciugatura dell'olio, rendendo più facili i ritocchi in studio",
          "Permetteva di stendere i colori direttamente sulla tela senza pennello"
        ],
        "answer": 0,
        "why": "Prima i colori andavano macinati e preparati in studio; con i tubetti il cavalletto poteva seguire la luce dove si trovava."
      },
      {
        "type": "applicazione",
        "q": "Una piccola casa di produzione, esclusa dai grandi distributori, vuole far arrivare i suoi prodotti al pubblico. Cosa suggerisce la storia degli impressionisti?",
        "options": [
          "Adeguarsi ai gusti dei distributori finché non viene accettata",
          "Rinunciare, perché senza i canali ufficiali un prodotto non può affermarsi",
          "Creare un canale proprio e cercare partner disposti a investire nel lungo periodo",
          "Abbassare i prezzi al minimo per conquistare subito i grandi distributori"
        ],
        "answer": 2,
        "why": "Gli impressionisti organizzarono mostre proprie, ma il successo arrivò quando un mercante come Durand-Ruel investì su di loro e trovò un pubblico nuovo in America."
      },
      {
        "type": "collegamento",
        "q": "Nel 1874 le opere impressioniste si vendevano a fatica; nel 2019 un Covone di Monet ha superato i 100 milioni di dollari. Come lo spiega la legge della domanda e dell'offerta?",
        "options": [
          "L'offerta è fissa, perché non se ne producono altri, e la domanda è cresciuta",
          "Il costo per produrre quei quadri è aumentato molto nel corso del tempo",
          "I prezzi d'asta sono fissati per legge in base all'età delle opere",
          "L'offerta di quadri di Monet è aumentata e ha spinto in alto i prezzi"
        ],
        "answer": 0,
        "why": "Con un'offerta che non può crescere, ogni aumento della domanda, da parte di collezionisti, musei e investitori, si scarica tutto sul prezzo."
      }
    ],
    "explain": {
      "prompt": "Spiega a un amico che cosa cercavano di fare gli impressionisti e perché all'inizio furono derisi.",
      "model": "Gli impressionisti volevano dipingere la luce di un momento preciso, spesso all'aperto, con pennellate rapide e visibili e colori puri accostati, invece della pittura levigata premiata dal Salon ufficiale. Esclusi dai canali tradizionali, nel 1874 organizzarono una mostra propria, e un critico li derise chiamandoli 'impressionisti' prendendo spunto da un quadro di Monet. Li aiutarono novità come i colori in tubetto e le ferrovie, e il sostegno di mercanti come Durand-Ruel. Oggi sono tra i pittori più amati e quotati al mondo.",
      "points": [
        "Obiettivo: catturare la luce e l'attimo, spesso all'aperto",
        "Pennellate visibili e colori accostati, contro le regole del Salon",
        "Mostre indipendenti e un nuovo mercato privato"
      ]
    }
  },
  {
    "id": "arte-manzoni-promessi-sposi",
    "area": "arte",
    "title": "I promessi sposi: Manzoni e la lingua degli italiani",
    "level": 2,
    "minutes": 5,
    "hook": "Manzoni aveva già pubblicato I promessi sposi con grande successo, eppure passò più di dieci anni a riscriverli frase per frase per cambiarne la lingua.",
    "sections": [
      {
        "h": "Una storia di povera gente nel Seicento",
        "text": "Alessandro Manzoni, milanese, nato nel 1785 e morto nel 1873, ambientò il suo romanzo in Lombardia tra il 1628 e il 1630, sotto il dominio spagnolo. Renzo e Lucia, due giovani lavoratori della seta di un paese vicino a Lecco, devono sposarsi, ma il signorotto don Rodrigo vuole impedirlo e manda i suoi bravi dal curato, don Abbondio: 'questo matrimonio non s'ha da fare, né domani, né mai'. Da lì la storia attraversa la carestia, la rivolta del pane a Milano, la guerra e la peste del 1630. Manzoni finge di trascrivere un manoscritto anonimo del Seicento e mescola personaggi inventati e storici, come il cardinale Federigo Borromeo, sul modello del romanzo storico di Walter Scott."
      },
      {
        "h": "Il potere visto dal basso",
        "text": "Il romanzo è anche un'analisi del potere. Le autorità spagnole emanano 'gride', editti che minacciano pene durissime contro i bravi, ma le ripetono di continuo proprio perché nessuno le fa rispettare. L'avvocato Azzecca-garbugli, a cui Renzo si rivolge, usa le leggi per servire i potenti, non per proteggere i deboli. Durante la carestia il governo fissa per decreto un prezzo del pane troppo basso rispetto al costo del grano: la gente corre ai forni, i fornai lavorano in perdita e non riescono a soddisfare la richiesta, e la situazione esplode nella rivolta. Nella peste la folla e i giudici cercano colpevoli negli 'untori', presunti diffusori del contagio: a uno di quei processi, con torture e condanne di innocenti, Manzoni dedicò la Storia della colonna infame. Su tutto domina il tema della Provvidenza, che per il Manzoni cattolico agisce nella storia senza cancellare le responsabilità degli uomini."
      },
      {
        "h": "Risciacquare i panni in Arno",
        "text": "La prima edizione, uscita tra il 1825 e il 1827, era scritta in un toscano letterario con molte forme lombarde. Manzoni cercava però una lingua viva, comune a tutta l'Italia, e nel 1827 andò a Firenze per confrontarsi con il fiorentino parlato dalle persone colte: con un'espressione che gli viene attribuita ed è diventata proverbiale, andò a 'risciacquare i panni in Arno'. Riscrisse il romanzo correggendo parole, forme e costrutti, e pubblicò l'edizione definitiva tra il 1840 e il 1842, illustrata da Francesco Gonin. Il problema era reale: all'Unità, secondo la stima classica del linguista Tullio De Mauro, parlava abitualmente italiano solo il 2,5% circa della popolazione; altre stime arrivano intorno al 10%. Nel 1868, su incarico del ministro Emilio Broglio, Manzoni propose di adottare il fiorentino colto come lingua nazionale, da diffondere con la scuola e i vocabolari."
      },
      {
        "h": "Perché conta ancora",
        "text": "La proposta fu discussa: il linguista Graziadio Isaia Ascoli obiettò che una lingua comune nasce dalla cultura e dalla vita sociale di un paese, non da un modello scelto dall'alto. Di fatto l'italiano si è diffuso soprattutto con la scuola, l'amministrazione, il servizio militare, le migrazioni interne e poi la televisione. Ma I promessi sposi, letti a scuola da generazioni, hanno offerto a milioni di italiani un modello di prosa chiara e moderna. E i loro temi restano attuali: leggi che si moltiplicano senza essere applicate, prezzi fissati per decreto che creano scarsità, la paura che cerca un capro espiatorio."
      }
    ],
    "facts": [
      "Ambientazione: Lombardia spagnola, 1628-1630.",
      "Edizioni: 1825-1827 e definitiva 1840-1842, riveduta sul fiorentino colto.",
      "Stima di De Mauro: circa il 2,5% di italofoni all'Unità (altre stime circa il 10%).",
      "1868: relazione di Manzoni al ministro Broglio sull'unità della lingua.",
      "Gride: editti ripetuti di continuo perché nessuno li faceva rispettare."
    ],
    "links": [
      "arte-dante-commedia",
      "storia-unita-italia",
      "economia-domanda-offerta",
      "mente-bias-cognitivi"
    ],
    "quiz": [
      {
        "type": "fatto",
        "q": "In quale periodo è ambientata la storia dei Promessi sposi?",
        "options": [
          "Tra il 1796 e il 1799, nella Lombardia napoleonica",
          "Tra il 1848 e il 1849, durante le rivoluzioni",
          "Tra il 1576 e il 1577, durante la peste di san Carlo",
          "Tra il 1628 e il 1630, nella Lombardia spagnola"
        ],
        "answer": 3,
        "why": "La storia si svolge sotto il dominio spagnolo e attraversa la carestia, la rivolta del pane a Milano e la peste del 1630."
      },
      {
        "type": "comprensione",
        "q": "Perché nel romanzo le 'gride' contro i bravi vengono ripetute tante volte?",
        "options": [
          "Perché ogni nuovo governatore doveva per legge confermare quelle precedenti",
          "Perché nessuno le faceva rispettare, e ripeterle non cambiava la realtà",
          "Perché i bravi non sapevano leggere e bisognava annunciarle più volte",
          "Perché le pene previste erano troppo leggere e andavano aggiornate"
        ],
        "answer": 1,
        "why": "Manzoni mostra un paradosso ancora attuale: la moltiplicazione delle norme è spesso il segno che non vengono applicate."
      },
      {
        "type": "comprensione",
        "q": "Perché Manzoni riscrisse il romanzo dopo il soggiorno a Firenze del 1827?",
        "options": [
          "Per avvicinarne la lingua al fiorentino parlato dalle persone colte",
          "Per eliminare le parti che la censura austriaca aveva vietato",
          "Per tradurlo in latino e farlo leggere in tutta Europa",
          "Per aggiungere i capitoli sulla peste, assenti nella prima edizione"
        ],
        "answer": 0,
        "why": "Cercava una lingua viva e comune a tutti gli italiani: l'edizione del 1840-1842 è il risultato di quella revisione minuziosa."
      },
      {
        "type": "applicazione",
        "q": "Un'azienda introduce una regola dopo l'altra contro i ritardi nei pagamenti, ma nessuno controlla né sanziona. Quale lezione dei Promessi sposi si applica?",
        "options": [
          "Che più regole ci sono, più i comportamenti migliorano anche senza controlli",
          "Che le regole funzionano solo se sono scritte in una lingua elegante",
          "Che come per le gride, più regole non servono se nessuno le applica",
          "Che i problemi si risolvono sempre affidandoli a un buon avvocato"
        ],
        "answer": 2,
        "why": "Una norma pesa per la probabilità che venga fatta rispettare, non per quante volte viene ripetuta o per quanto sono severe le pene scritte."
      },
      {
        "type": "collegamento",
        "q": "Nel romanzo il governo fissa per decreto un prezzo del pane troppo basso e i fornai non riescono più a soddisfare la richiesta. Come lo spiega la legge della domanda e dell'offerta?",
        "options": [
          "Un prezzo più basso riduce sempre la domanda, e i fornai smettono di produrre",
          "Un prezzo imposto sotto l'equilibrio fa salire la domanda e scendere l'offerta",
          "Il prezzo non influisce sulle quantità, conta solo il raccolto di grano",
          "Un prezzo basso aumenta l'offerta, perché i fornai vendono più pagnotte"
        ],
        "answer": 1,
        "why": "Con un tetto ai prezzi troppo basso produrre conviene meno e comprare conviene di più: il risultato è la scarsità, come nella Milano del 1628."
      }
    ],
    "explain": {
      "prompt": "Spiega a un collega perché si dice che Manzoni ha contribuito alla lingua degli italiani.",
      "model": "Manzoni scrisse I promessi sposi in un'Italia divisa, dove pochissimi parlavano abitualmente italiano e quasi tutti usavano il proprio dialetto. Dopo la prima edizione andò a Firenze e riscrisse il romanzo sul fiorentino parlato dalle persone colte, cercando una lingua viva e comune. L'edizione del 1840-1842, letta a scuola per generazioni, diventò un modello di prosa moderna, e dopo l'Unità Manzoni propose di fare del fiorentino la lingua nazionale. Altri, come Ascoli, obiettarono che una lingua comune nasce dalla vita sociale e culturale del paese, non da un modello imposto.",
      "points": [
        "Italia divisa: pochi parlavano italiano all'Unità",
        "Revisione del romanzo sul fiorentino colto parlato",
        "Modello scolastico per generazioni, dentro un dibattito sulla lingua"
      ]
    }
  }
];
