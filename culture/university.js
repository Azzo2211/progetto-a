/*
 * Progetto A - Cultura: i corsi della mini università.
 * Ogni corso si basa su un corso aperto e gratuito di un'università (MIT OpenCourseWare, Open Yale
 * Courses, Harvard...): link alle lezioni originali, spiegazioni in italiano scritte per l'app
 * (riassunti, non traduzioni), punti chiave, glossario, quiz. Schema controllato da tests/university.test.js.
 * 3 corsi, 34 lezioni.
 */
window.CultureUniversity = {
 "courses": [
  {
   "id": "cs-mit-60001",
   "faculty": "informatica",
   "title": "Introduzione all'informatica e alla programmazione in Python",
   "level": 1,
   "summary": "Il corso introduttivo di programmazione del MIT (6.0001, autunno 2016), tenuto da Ana Bell ed Eric Grimson con John Guttag, usa Python per insegnare a ragionare come un informatico: tipi, condizioni e cicli, funzioni, liste e dizionari, ricorsione, oggetti e classi. Alla fine saprai leggere e scrivere piccoli programmi, trovare e prevenire gli errori e stimare quanto è efficiente un algoritmo con la notazione O grande.",
   "source": {
    "inst": "MIT OpenCourseWare",
    "code": "6.0001",
    "title": "Introduction to Computer Science and Programming in Python",
    "prof": "Ana Bell, Eric Grimson, John Guttag",
    "year": "Autunno 2016",
    "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/pages/lecture-videos/",
    "license": "CC BY-NC-SA 4.0",
    "lang": "inglese, con trascrizione"
   },
   "extra": [
    {
     "title": "Harvard CS50x: Introduction to Computer Science",
     "url": "https://pll.harvard.edu/course/cs50-introduction-computer-science?delta=0",
     "what": "Il celebre corso introduttivo di David J. Malan, gratuito su edX: parte dal linguaggio C e arriva a Python, SQL e sviluppo web"
    },
    {
     "title": "MIT 6.0001: slide e codice di tutte le lezioni",
     "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/pages/lecture-slides-code/",
     "what": "Le slide in PDF e i file di codice Python delle 12 lezioni, da scaricare e provare mentre guardi i video"
    },
    {
     "title": "Python Tutor",
     "url": "https://pythontutor.com/",
     "what": "Strumento gratuito che mostra passo passo variabili, liste e chiamate di funzione: utilissimo per capire alias e ricorsione"
    }
   ],
   "lessons": [
    {
     "id": "cs-mit-60001-01",
     "title": "Che cosa fa un computer e che cos'è un programma",
     "minutes": 9,
     "watch": {
      "label": "Lezione 1: What is Computation? (video con trascrizione, Ana Bell)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-1-what-is-computation/"
     },
     "read": [
      {
       "label": "Slide della lezione 1 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec1/"
      }
     ],
     "sections": [
      {
       "h": "Veloce, ma soltanto obbediente",
       "text": "Un computer sa fare essenzialmente due cose: eseguire calcoli e ricordarne i risultati. Le fa a una velocità che nessun essere umano può avvicinare, miliardi di operazioni semplici al secondo, e conserva quantità enormi di dati. Però non ha intuizione: esegue esattamente le istruzioni che riceve, nell'ordine in cui le riceve. Se un collega ti chiede di sommare le vendite di ottobre e per sbaglio dice settembre, probabilmente te ne accorgi; un programma no, somma settembre con assoluta precisione. Per questo il corso parte da un'idea semplice: programmare significa descrivere un procedimento in modo così preciso che una macchina senza buon senso possa seguirlo. L'errore tipico di chi comincia è pensare che il computer «capisca» che cosa intendiamo. Non lo fa: esegue soltanto ciò che scriviamo."
      },
      {
       "h": "Sapere che cosa e sapere come",
       "text": "La lezione distingue due tipi di conoscenza. La conoscenza dichiarativa (declarative knowledge) afferma un fatto: la radice quadrata di x è il numero y tale che y per y dà x. È vero, ma non ti dice come trovare y. La conoscenza imperativa (imperative knowledge) invece è una ricetta: indica i passi da compiere. Per la radice quadrata esiste un procedimento antico, noto come metodo di Erone o babilonese: parti da un tentativo g; se g per g è abbastanza vicino a x ti fermi; altrimenti prendi come nuovo tentativo la media tra g e x/g e ripeti. Con x = 16 e g = 3 ottieni 4,17, poi 4,003, poi 4,0000014: in tre passi sei praticamente a 4. Un computer lavora solo con conoscenza imperativa. Ecco perché il primo sforzo, prima ancora di scrivere codice, è trasformare un «che cosa» in un «come»."
      },
      {
       "h": "Gli ingredienti di un algoritmo",
       "text": "Una ricetta come quella della radice quadrata è un algoritmo (algorithm), e contiene sempre tre ingredienti. Il primo è una sequenza di passi semplici, ciascuno eseguibile senza ambiguità. Il secondo è il controllo del flusso (flow of control), cioè le regole che stabiliscono quale passo viene dopo: andare avanti, ripetere, saltare. Il terzo è una condizione di arresto, senza la quale la ricetta non finirebbe mai. Pensa alle istruzioni per montare un cassetto: avvita le quattro viti, ripeti dall'altro lato, smetti quando il cassetto scorre. Se manca la condizione di arresto il procedimento resta aperto; se un passo è vago, come «stringi bene», due persone faranno due cose diverse. Un computer non tollera né l'una né l'altra cosa, e molti errori dei principianti, come i cicli che non finiscono mai, nascono proprio da una condizione di arresto scritta male."
      },
      {
       "h": "Il computer a programma memorizzato",
       "text": "Una calcolatrice tascabile è un computer a programma fisso (fixed-program computer): fa solo le operazioni per cui è stata costruita. I computer moderni sono invece a programma memorizzato (stored-program computer): le istruzioni stanno in memoria come i dati, e quindi si possono cambiare. Dentro ci sono una memoria, un'unità aritmetico-logica che fa i conti, un'unità di controllo con un contatore di programma (program counter) che indica la prossima istruzione, e i dispositivi di input e output. Un interprete legge le istruzioni una dopo l'altra; alcune sono test che fanno saltare a un altro punto. Alan Turing mostrò che con pochissime operazioni primitive si può calcolare tutto ciò che è calcolabile, e la lezione ne cita sei. La conseguenza pratica è sorprendente: ciò che si calcola in un linguaggio di programmazione completo si può calcolare in qualunque altro. Cambia la comodità, non la potenza."
      },
      {
       "h": "Sintassi, semantica e tre tipi di errore",
       "text": "Un linguaggio di programmazione ha, come l'italiano, parole e regole. La sintassi (syntax) dice quali combinazioni sono ben formate: in Python 3.2*5 va bene, mentre 'ciao'5 è un errore, come una frase senza verbo. La semantica statica (static semantics) dice se una frase ben formata ha senso: 3 + 'ciao' è scritta correttamente ma somma un numero e un testo, e Python la rifiuta. Infine la semantica (semantics) è il significato: in Python ogni istruzione valida ne ha uno solo, che però può non essere quello che volevi. Da qui tre tipi di guai. Gli errori di sintassi sono i più comuni e i più innocui, perché Python li segnala subito. Gli errori di semantica statica in Python emergono quando il programma arriva a quella riga. I più insidiosi sono gli errori di logica: il programma gira, non protesta, ma si blocca, va in loop o, peggio, dà una risposta sbagliata che sembra giusta."
      },
      {
       "h": "Oggetti, tipi e variabili",
       "text": "In Python ogni dato è un oggetto (object) con un tipo (type), e il tipo decide che cosa ci puoi fare. I tipi scalari di base sono quattro: int per gli interi (5), float per i numeri con la virgola, che in Python si scrive col punto (3.27), bool per vero e falso (True, False) e NoneType, che ha un solo valore, None, usato per dire «niente». Con type(5) chiedi a Python il tipo. Puoi convertire: float(3) dà 3.0, int(3.9) dà 3, perché tronca invece di arrotondare. Attenzione alla divisione: 7/2 dà sempre un float, 3.5; 7//2 dà la parte intera, 3, e 7%2 il resto, 1. Il segno = non indica un'uguaglianza ma un'assegnazione: pi = 3.14159 lega il nome pi a un valore. Scrivere raggio = raggio + 1 non è un'equazione impossibile, è un aggiornamento. Errore tipico: se calcoli area = pi * raggio**2 e poi cambi raggio, area non si aggiorna da sola e resta il vecchio valore finché non la ricalcoli."
      }
     ],
     "keyPoints": [
      "Un computer calcola e memorizza a enorme velocità, ma esegue solo ciò che gli è stato scritto, senza buon senso.",
      "La conoscenza dichiarativa dice che cosa è vero; quella imperativa dice come ottenerlo, ed è l'unica che un computer sa usare.",
      "Un algoritmo è fatto di passi semplici, controllo del flusso e una condizione di arresto.",
      "Nei computer a programma memorizzato le istruzioni stanno in memoria come i dati, e un interprete le esegue in ordine.",
      "Gli errori di logica sono i più pericolosi: il programma gira ma produce risultati sbagliati.",
      "Ogni oggetto Python ha un tipo (int, float, bool, NoneType) che stabilisce quali operazioni sono possibili.",
      "Il segno = assegna un valore a un nome; cambiare una variabile non ricalcola quelle che ne dipendevano."
     ],
     "terms": [
      {
       "t": "Algoritmo (algorithm)",
       "d": "Procedimento finito fatto di passi semplici, regole sull'ordine dei passi e una condizione di arresto."
      },
      {
       "t": "Conoscenza imperativa",
       "d": "Conoscenza del come: una sequenza di istruzioni per ottenere un risultato, come una ricetta di cucina."
      },
      {
       "t": "Interprete (interpreter)",
       "d": "Programma che legge ed esegue le istruzioni una alla volta, nell'ordine indicato e seguendo i salti decisi dai test."
      },
      {
       "t": "Sintassi (syntax)",
       "d": "Regole che stabiliscono quali combinazioni di simboli sono ben formate in un linguaggio."
      },
      {
       "t": "Tipo (type)",
       "d": "Categoria di un oggetto, come int o float, che determina quali operazioni gli si possono applicare."
      },
      {
       "t": "Variabile",
       "d": "Nome legato a un valore con l'operatore di assegnazione =; in seguito può essere legato a un altro valore."
      },
      {
       "t": "Conversione di tipo (casting)",
       "d": "Trasformazione di un valore da un tipo a un altro, per esempio float(3) che produce 3.0 o int(3.9) che produce 3."
      }
     ],
     "quiz": [
      {
       "q": "Quale di queste frasi esprime conoscenza imperativa?",
       "options": [
        "Il massimo comune divisore di due numeri è il più grande numero che li divide entrambi",
        "Per trovare il massimo comune divisore, sottrai il numero minore dal maggiore e ripeti finché i due numeri diventano uguali",
        "Il massimo comune divisore di 12 e 18 è 6",
        "Ogni coppia di interi positivi ha un massimo comune divisore"
       ],
       "answer": 1,
       "why": "La seconda frase descrive passi da eseguire e quando fermarsi: è una ricetta, quindi conoscenza imperativa. Le altre affermano fatti veri, anche il caso concreto di 12 e 18, ma non dicono come calcolare il risultato."
      },
      {
       "q": "Che cosa stampa Python dopo queste righe? raggio = 2, poi area = 3 * raggio**2, poi raggio = 5, infine print(area)",
       "options": [
        "75",
        "15",
        "Un errore, perché raggio è cambiato",
        "12"
       ],
       "answer": 3,
       "why": "area è stata calcolata quando raggio valeva 2, quindi vale 3 * 4 = 12. Riassegnare raggio non ricalcola area. Chi risponde 75 ragiona come in una cella di Excel collegata, ma una variabile Python non funziona così."
      },
      {
       "q": "Un programma che calcola uno sconto applica il 20% invece del 2%, gira senza segnalare nulla e stampa un prezzo sbagliato. Che tipo di errore è?",
       "options": [
        "Errore di sintassi",
        "Errore di semantica statica",
        "Errore di logica",
        "Errore dell'interprete"
       ],
       "answer": 2,
       "why": "Il codice è ben formato e ha senso per Python, quindi non è un errore di sintassi né di semantica statica. È un errore di logica, il più insidioso, perché la macchina esegue fedelmente un'istruzione sbagliata senza avvisare."
      },
      {
       "q": "Che valore produce l'espressione int(7.8) + 7 // 2?",
       "options": [
        "11.5",
        "11",
        "10",
        "12"
       ],
       "answer": 2,
       "why": "int(7.8) tronca a 7 e non arrotonda a 8; 7 // 2 è la divisione intera e dà 3. Il totale è 10. Chi risponde 11 ha arrotondato 7.8 a 8; chi risponde 11.5 ha usato la divisione normale."
      },
      {
       "q": "Perché si dice che tutti i linguaggi di programmazione completi hanno la stessa potenza di calcolo?",
       "options": [
        "Perché, come mostrò Turing, tutto ciò che è calcolabile si ottiene con poche primitive, e ogni linguaggio completo le possiede",
        "Perché derivano tutti da Python",
        "Perché girano tutti sullo stesso tipo di processore",
        "Perché hanno tutti la stessa sintassi"
       ],
       "answer": 0,
       "why": "Il risultato di Turing riguarda le operazioni primitive: ne bastano poche per calcolare tutto ciò che è calcolabile, e ogni linguaggio completo può riprodurle. Il processore non c'entra: un linguaggio cambia la comodità con cui scrivi, non che cosa puoi calcolare."
      }
     ],
     "explain": "Spiega a un amico la differenza tra sapere che cos'è la radice quadrata di un numero e saperla calcolare, e perché a un computer serve la seconda.",
     "apply": "Scrivi su un foglio, come se fosse un algoritmo, un'operazione che fai spesso al lavoro (per esempio controllare una fattura): passi semplici, che cosa si ripete e quando ci si ferma. Poi sottolinea i passi vaghi che una macchina non saprebbe eseguire."
    },
    {
     "id": "cs-mit-60001-02",
     "title": "Condizioni e cicli: far scegliere e ripetere un programma",
     "minutes": 9,
     "watch": {
      "label": "Lezione 2: Branching and Iteration (video con trascrizione, Ana Bell)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-2-branching-and-iteration/"
     },
     "read": [
      {
       "label": "Slide della lezione 2 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec2/"
      }
     ],
     "sections": [
      {
       "h": "Stringhe, input e output",
       "text": "Oltre ai numeri, i programmi maneggiano testo. In Python un testo è una stringa (string), scritta tra apici: nome = 'Ana'. Le stringhe si uniscono con + e si ripetono con *: 'ciao' + ' ' + nome dà 'ciao Ana', mentre 'ha' * 3 dà 'hahaha'. Per mostrare qualcosa a schermo si usa print, che accetta più valori separati da virgole e li stampa con uno spazio in mezzo. Per ricevere dati dall'utente si usa input, che mostra una domanda e aspetta la risposta. Qui c'è una trappola classica: input restituisce sempre una stringa, anche se l'utente scrive un numero. Se scrivi eta = input('Quanti anni hai? ') e poi eta * 2, con la risposta 30 ottieni '3030', non 60. Per fare i conti bisogna convertire: eta = int(input('Quanti anni hai? ')). Allo stesso modo str(5) trasforma un numero in testo, utile per incollarlo dentro una frase."
      },
      {
       "h": "Confronti e logica booleana",
       "text": "Per prendere decisioni un programma deve porsi domande con risposta sì o no. Gli operatori di confronto lo fanno: maggiore (>), minore (<), maggiore o uguale (>=), minore o uguale (<=), uguale (==) e diverso (!=). Il risultato è sempre un valore booleano (boolean), True o False. I confronti si combinano con tre operatori logici: and è vero solo se entrambe le condizioni sono vere, or è vero se almeno una lo è, not rovescia il valore. Un esempio da negozio: cliente_fedele and spesa > 100 è vero solo per chi ha la tessera e ha speso più di 100 euro. L'errore più comune in assoluto è confondere = con ==. Il primo assegna un valore a una variabile, il secondo chiede se due valori sono uguali: scrivere if x = 5 è un errore di sintassi, mentre if x == 5 è la domanda corretta."
      },
      {
       "h": "Le diramazioni: if, elif, else",
       "text": "Una diramazione (branching) fa eseguire codice diverso a seconda di una condizione. La forma base è if condizione: seguito dal blocco da eseguire. Con else aggiungi il blocco alternativo, con elif (abbreviazione di else if) altre condizioni intermedie. Python le controlla dall'alto in basso ed esegue solo il primo blocco la cui condizione è vera; else scatta se nessuna lo è. Immagina le spese di spedizione: se il peso è al massimo 2 kg costa 5 euro, fino a 10 kg costa 9, oltre costa 15. In codice: if peso <= 2: costo = 5, poi elif peso <= 10: costo = 9, infine else: costo = 15. L'ordine conta moltissimo. Se metti per prima la condizione peso <= 10, anche un pacco da un chilo la soddisfa e paga 9 euro: il ramo da 5 non verrà mai raggiunto. Le condizioni più restrittive vanno prima di quelle più larghe."
      },
      {
       "h": "In Python l'indentazione conta",
       "text": "Molti linguaggi delimitano i blocchi di codice con parentesi graffe. Python invece usa l'indentazione (indentation), cioè lo spazio a inizio riga, di solito quattro spazi. Tutto ciò che è rientrato sotto un if appartiene a quel ramo; la prima riga che torna al margine precedente è fuori. Questo rende il codice leggibile, ma ha una conseguenza da non sottovalutare: spostare una riga di quattro spazi può cambiare il significato del programma senza produrre alcun errore. Nella lezione, un print('grazie') allineato al margine viene eseguito sempre; rientrato sotto l'else, comparirebbe solo in quel caso. Lo stesso vale per i blocchi annidati, come un if dentro un altro if: ogni livello aggiunge un rientro. Un consiglio pratico è lasciare che sia l'editor a gestire i rientri e non mescolare mai tabulazioni e spazi, che a occhio sembrano identici ma per Python non lo sono."
      },
      {
       "h": "Il ciclo while",
       "text": "Spesso un'azione va ripetuta finché vale una condizione. La lezione usa un videogioco, The Legend of Zelda: nei Boschi Perduti, se vai a destra ti ritrovi sempre nella stessa schermata. Scriverlo con tanti if richiederebbe infinite copie dello stesso controllo; un ciclo while (while loop) lo esprime in due righe. La forma è while condizione: seguita dal blocco da ripetere. Python controlla la condizione, se è vera esegue il blocco, poi ricontrolla, e così via finché diventa falsa. Un esempio reale è chiedere un codice finché non è corretto: while codice != '1234': codice = input('Codice? '). Il pericolo tipico è il ciclo infinito: se nel blocco nulla modifica la condizione, il ciclo non si ferma più. Prima di scrivere un while chiediti sempre quale istruzione, dentro il ciclo, prima o poi renderà falsa la condizione."
      },
      {
       "h": "Il ciclo for, range e break",
       "text": "Quando sai in anticipo quante volte ripetere, il ciclo for (for loop) è più comodo. for n in range(5): print(n) stampa 0, 1, 2, 3, 4: range genera la sequenza e la variabile n prende un valore alla volta. La forma completa è range(inizio, fine, passo): range(7, 10) dà 7, 8, 9, e range(5, 11, 2) dà 5, 7, 9. Il valore di fine è sempre escluso, ed è la fonte del classico errore di uno in più o in meno (off-by-one). L'istruzione break esce subito dal ciclo più interno in cui si trova, saltando il resto del blocco. La regola per scegliere è semplice: il for va bene quando il numero di ripetizioni è noto, per esempio i dodici mesi dell'anno; il while quando non lo è, per esempio leggere risposte finché l'utente non scrive 'fine'. Ogni for si può riscrivere come while, ma non sempre il contrario."
      }
     ],
     "keyPoints": [
      "input restituisce sempre una stringa: per fare calcoli bisogna convertirla con int o float.",
      "I confronti producono True o False e si combinano con and, or e not; = assegna, == confronta.",
      "In una catena if, elif, else viene eseguito solo il primo ramo vero: le condizioni più restrittive vanno prima.",
      "In Python l'indentazione definisce i blocchi: spostare una riga può cambiare il programma senza errori visibili.",
      "Il while ripete finché la condizione è vera; se nulla nel ciclo la modifica, il ciclo è infinito.",
      "range(inizio, fine, passo) esclude sempre il valore di fine; break esce dal ciclo più interno.",
      "Si usa il for quando il numero di ripetizioni è noto, il while quando non lo è."
     ],
     "terms": [
      {
       "t": "Stringa (string)",
       "d": "Sequenza di caratteri racchiusa tra apici, come 'ciao'; si concatena con + e si ripete con *."
      },
      {
       "t": "Booleano (boolean)",
       "d": "Tipo con due soli valori, True e False, prodotto dai confronti e usato nelle condizioni."
      },
      {
       "t": "Diramazione (branching)",
       "d": "Struttura che esegue blocchi di codice diversi a seconda che una condizione sia vera o falsa."
      },
      {
       "t": "Indentazione",
       "d": "Rientro a inizio riga che in Python stabilisce quali istruzioni appartengono a un blocco."
      },
      {
       "t": "Ciclo while",
       "d": "Ripete un blocco finché una condizione resta vera; il numero di giri non è noto in anticipo."
      },
      {
       "t": "Ciclo for",
       "d": "Ripete un blocco per ogni elemento di una sequenza, per esempio i numeri generati da range."
      },
      {
       "t": "break",
       "d": "Istruzione che interrompe subito il ciclo più interno in cui si trova."
      }
     ],
     "quiz": [
      {
       "q": "Che cosa stampa print('5' * 3)?",
       "options": [
        "15",
        "555",
        "Un errore di tipo",
        "5 5 5"
       ],
       "answer": 1,
       "why": "'5' tra apici è una stringa, e * applicato a una stringa la ripete: il risultato è 555. Chi risponde 15 dimentica che un valore tra apici, come quello restituito da input, è testo e non numero."
      },
      {
       "q": "Quanto paga un pacco da 1 kg con questo codice? if peso <= 10: costo = 9, poi elif peso <= 2: costo = 5, infine else: costo = 15",
       "options": [
        "5",
        "15",
        "9",
        "14"
       ],
       "answer": 2,
       "why": "Python controlla le condizioni nell'ordine e si ferma alla prima vera: 1 <= 10 è vera, quindi costo = 9 e il ramo elif non viene mai guardato. Per far pagare 5 ai pacchi leggeri bisogna mettere prima la condizione più restrittiva."
      },
      {
       "q": "Quali numeri produce range(2, 11, 3)?",
       "options": [
        "2, 5, 8, 11",
        "2, 5, 8",
        "3, 6, 9",
        "2, 4, 6, 8, 10"
       ],
       "answer": 1,
       "why": "Si parte da 2 e si avanza di 3: 2, 5, 8. Il successivo sarebbe 11, ma il valore di fine è sempre escluso. L'errore più frequente è includerlo, scrivendo 2, 5, 8, 11."
      },
      {
       "q": "Devi chiedere all'utente dei numeri finché non scrive 'fine', senza sapere quanti saranno. Quale struttura è più adatta?",
       "options": [
        "Un ciclo while che continua finché l'ultima risposta non è 'fine'",
        "Un ciclo for con range(100)",
        "Una lunga serie di if annidati",
        "Un if seguito da un else"
       ],
       "answer": 0,
       "why": "Il numero di ripetizioni non è noto in anticipo: è il caso tipico del while. Un for con range(100) fissa un limite arbitrario, che può essere troppo basso o costringere a uscire con break."
      },
      {
       "q": "Che cosa succede eseguendo n = 0 e poi while n < 5: print(n), senza altre istruzioni nel ciclo?",
       "options": [
        "Stampa 0, 1, 2, 3, 4",
        "Non stampa nulla",
        "Stampa 5 e si ferma",
        "Stampa 0 all'infinito"
       ],
       "answer": 3,
       "why": "Nel ciclo n non cambia mai, quindi n < 5 resta sempre vera e il ciclo non finisce. Per ottenere 0, 1, 2, 3, 4 serve n = n + 1 dentro il blocco: senza un'istruzione che renda falsa la condizione, il while diventa infinito."
      }
     ],
     "explain": "Spiega a un amico perché, in una catena di if ed elif, l'ordine delle condizioni può cambiare il risultato, usando l'esempio delle spese di spedizione.",
     "apply": "Prendi una regola del tuo lavoro con più fasce (sconti, provvigioni, costi di trasporto) e scrivila come catena di if, elif ed else. Controlla che ogni caso cada in una sola fascia e che i valori di confine, come esattamente 100 euro, finiscano dove vuoi tu."
    },
    {
     "id": "cs-mit-60001-03",
     "title": "Stringhe e primi algoritmi: tentativi, approssimazioni, bisezione",
     "minutes": 8,
     "watch": {
      "label": "Lezione 3: String Manipulation, Guess and Check, Approximations, Bisection (video, Ana Bell)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-3-string-manipulation-guess-and-check-approximations-bisection/"
     },
     "read": [
      {
       "label": "Slide della lezione 3 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec3/"
      }
     ],
     "sections": [
      {
       "h": "Dentro una stringa: indici e fette",
       "text": "Una stringa è una sequenza di caratteri, e ogni carattere ha una posizione detta indice (index). In Python si conta da 0: se s = 'abc', s[0] è 'a' e s[2] è 'c', mentre s[3] dà errore perché esce dalla stringa. Gli indici negativi contano dalla fine: s[-1] è sempre l'ultimo carattere. La funzione len(s) dà la lunghezza, qui 3. Con lo slicing (affettare) estrai un pezzo: s[inizio:fine:passo], con la fine esclusa. Se data = '2026-10-21', data[0:4] dà '2026' e data[5:7] dà '10'. Il passo -1 rovescia: 'abcdefgh'[::-1] dà 'hgfedcba'. Le stringhe sono immutabili: s[0] = 'y' produce un errore. Per «modificarne» una se ne crea una nuova, per esempio s = 'y' + s[1:]. L'errore tipico è dimenticare che il primo carattere ha indice 0, e ritrovarsi con fette spostate di una posizione."
      },
      {
       "h": "Scorrere i caratteri con un for",
       "text": "Il ciclo for non lavora solo sui numeri di range: può scorrere direttamente qualsiasi sequenza, comprese le stringhe. Si può scrivere for i in range(len(s)) e guardare s[i], ma la forma più naturale in Python è for c in s, dove c prende un carattere alla volta. Con l'operatore in si verifica l'appartenenza: c in 'aeiou' è vero se c è una vocale minuscola. Un esempio concreto è controllare che una password contenga almeno una cifra: si scorre la password e, appena un carattere è in '0123456789', si segna di averla trovata e si esce con break. La lezione propone un «robot cheerleader» che, data una parola, grida ogni lettera come allo stadio, scegliendo tra «a» e «an» a seconda della lettera. Sembra un gioco, ma allena le mosse di base: scorrere, confrontare, decidere. Attenzione alle maiuscole: per Python 'A' e 'a' sono caratteri diversi."
      },
      {
       "h": "Indovina e verifica",
       "text": "Il primo vero algoritmo del corso è il metodo indovina e verifica (guess and check), detto anche enumerazione esaustiva (exhaustive enumeration). Funziona quando sai generare i possibili candidati e controllare se uno è giusto: provi tutti i candidati in ordine finché trovi la soluzione o li esaurisci. Per la radice cubica di 8 provi 0, 1, 2 e ti fermi, perché 2 alla terza fa 8. È come aprire un lucchetto a tre cifre provando da 000 a 999: nel caso peggiore servono mille tentativi, ma il successo è garantito. Il metodo ha due limiti. Il primo è che trova solo risposte esatte tra i candidati provati: la radice cubica di 10 non è un intero, e la ricerca fallisce. Il secondo è la lentezza: se i candidati sono miliardi, provarli tutti diventa impraticabile. Nella lezione la versione migliorata gestisce anche i numeri negativi e avvisa quando il numero non è un cubo perfetto."
      },
      {
       "h": "Soluzioni approssimate",
       "text": "Molti problemi reali non hanno una risposta esatta rappresentabile, e serve una risposta «abbastanza buona». Si sceglie una tolleranza, chiamata epsilon, e ci si accontenta di un tentativo g tale che g alla terza disti meno di epsilon dal numero cercato. Per la radice cubica di 27 la lezione parte da 0 e avanza a passi di 0,0001, con epsilon 0,01: servono circa 30.000 tentativi per arrivare vicino a 3. C'è un compromesso evidente: un passo più piccolo dà più precisione ma più lentezza, un epsilon più grande dà più velocità ma meno precisione. E se il passo è troppo grande si può scavalcare la risposta, motivo per cui il ciclo deve avere anche un limite massimo. Questo modo di ragionare è indispensabile perché i numeri con la virgola sono essi stessi approssimati: in Python 0.1 + 0.2 dà 0.30000000000000004. Per confrontare due float non si usa ==, ma si controlla se abs(a - b) è minore di epsilon."
      },
      {
       "h": "La ricerca per bisezione",
       "text": "La ricerca per bisezione (bisection search) è il gioco «pensa un numero tra 1 e 1000, ti dico se è più alto o più basso». Invece di procedere un passo alla volta, si prova il punto medio dell'intervallo e si scarta la metà sbagliata. Per la radice cubica di 27 si parte dall'intervallo tra 0 e 27: se il punto medio al cubo è troppo piccolo, la metà inferiore si butta, altrimenti si butta quella superiore. Con epsilon 0,01 bastano 14 passi, contro i circa 30.000 del metodo precedente. Il motivo è che dopo k passi resta 1/2 alla k dello spazio iniziale, quindi servono circa log₂ N passi: per un numero tra 1 e 1000 bastano 10 domande, perché 2 alla 10 fa 1024. Il limite è che la bisezione funziona solo se il problema è ordinato, cioè la funzione cresce sempre nello stesso verso, e se la soluzione sta dentro l'intervallo iniziale. Per i numeri tra 0 e 1, la cui radice cubica è più grande del numero stesso, l'intervallo va scelto tra il numero e 1."
      }
     ],
     "keyPoints": [
      "Gli indici delle stringhe partono da 0; s[-1] è l'ultimo carattere e nelle fette la fine è esclusa.",
      "Le stringhe sono immutabili: per cambiarne una se ne costruisce una nuova.",
      "Indovina e verifica prova tutti i candidati: è sicuro ma diventa lento quando i candidati sono moltissimi.",
      "Le soluzioni approssimate usano una tolleranza epsilon e scambiano precisione con velocità.",
      "I float sono approssimati: non si confrontano con ==, ma controllando che la differenza sia minore di epsilon.",
      "La bisezione dimezza lo spazio di ricerca a ogni passo e richiede circa log₂ N passi.",
      "La bisezione funziona solo se il problema è ordinato e la soluzione sta nell'intervallo iniziale."
     ],
     "terms": [
      {
       "t": "Indice (index)",
       "d": "Posizione di un elemento in una sequenza; in Python il primo elemento ha indice 0 e l'ultimo -1."
      },
      {
       "t": "Slicing",
       "d": "Estrazione di una parte di una sequenza con la forma s[inizio:fine:passo], con la fine esclusa."
      },
      {
       "t": "Immutabile",
       "d": "Detto di un oggetto che non si può modificare dopo la creazione, come una stringa."
      },
      {
       "t": "Enumerazione esaustiva",
       "d": "Metodo che prova uno dopo l'altro tutti i candidati possibili finché trova una soluzione o li esaurisce."
      },
      {
       "t": "Epsilon",
       "d": "Tolleranza che stabilisce quando una risposta approssimata è abbastanza vicina a quella vera."
      },
      {
       "t": "Ricerca per bisezione",
       "d": "Algoritmo che a ogni passo prova il punto medio e scarta la metà dello spazio che non può contenere la soluzione."
      }
     ],
     "quiz": [
      {
       "q": "Se s = 'Cremona', che cosa vale s[2:5]?",
       "options": [
        "'rem'",
        "'emo'",
        "'emon'",
        "'remo'"
       ],
       "answer": 1,
       "why": "Gli indici partono da 0: s[2] è 'e', s[3] è 'm', s[4] è 'o', e l'indice 5 è escluso. Il risultato è 'emo'. Chi risponde 'rem' conta le posizioni partendo da 1."
      },
      {
       "q": "Usi la bisezione per la radice cubica di 0,5, con intervallo iniziale da 0 a 0,5. Che cosa succede?",
       "options": [
        "Trova la risposta in pochi passi, come sempre",
        "Restituisce 0,25, il punto medio",
        "Non arriva mai alla risposta, perché la radice cubica di 0,5 (circa 0,79) è fuori dall'intervallo",
        "Si ferma subito con un errore di sintassi"
       ],
       "answer": 2,
       "why": "Per i numeri tra 0 e 1 la radice cubica è più grande del numero: 0,79 supera 0,5. Se la soluzione non sta nell'intervallo, dimezzarlo non serve. Qui l'intervallo giusto va da 0,5 a 1."
      },
      {
       "q": "Un lucchetto ha 4 cifre. Quanti tentativi servono, nel caso peggiore, con l'enumerazione esaustiva?",
       "options": [
        "40",
        "10.000",
        "100",
        "1.000"
       ],
       "answer": 1,
       "why": "Ogni cifra ha 10 valori, quindi le combinazioni sono 10 × 10 × 10 × 10 = 10.000, e nel caso peggiore quella giusta è l'ultima. Chi risponde 40 somma le possibilità delle cifre invece di moltiplicarle."
      },
      {
       "q": "Con la bisezione, circa quante domande «più alto o più basso?» servono per indovinare un numero tra 1 e un milione?",
       "options": [
        "Circa 20",
        "Circa 1.000",
        "Circa 500.000",
        "Circa 6"
       ],
       "answer": 0,
       "why": "Ogni domanda dimezza l'intervallo, e 2 alla 20 è circa un milione: bastano una ventina di domande. 6 sarebbe giusto solo se ogni domanda riducesse lo spazio a un decimo invece che alla metà; 500.000 è il caso medio della ricerca uno per uno."
      },
      {
       "q": "Perché nei programmi numerici non si confrontano due float con ==?",
       "options": [
        "Perché == vale solo per le stringhe",
        "Perché i float non si possono confrontare in nessun modo",
        "Perché == è più lento di abs()",
        "Perché i float sono approssimati: 0.1 + 0.2 dà 0.30000000000000004, non 0.3"
       ],
       "answer": 3,
       "why": "I numeri con la virgola sono memorizzati in binario con precisione limitata, quindi piccoli errori di arrotondamento sono normali. Si controlla invece se la differenza è minore di un epsilon, per esempio abs(a - b) < 0.0001."
      }
     ],
     "explain": "Spiega a un amico perché, per indovinare un numero tra 1 e 1000, conviene chiedere sempre «è più alto o più basso della metà?» e quante domande servono al massimo.",
     "apply": "Prova la bisezione nella vita reale: cerca una parola in un dizionario cartaceo o una pratica in un archivio ordinato aprendo sempre a metà della parte rimasta. Conta i passi e confrontali con quelli necessari sfogliando una pagina alla volta."
    },
    {
     "id": "cs-mit-60001-04",
     "title": "Funzioni, astrazione e scope",
     "minutes": 8,
     "watch": {
      "label": "Lezione 4: Decomposition, Abstraction, and Functions (video con trascrizione, Ana Bell)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-4-decomposition-abstraction-and-functions/"
     },
     "read": [
      {
       "label": "Slide della lezione 4 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec4/"
      }
     ],
     "sections": [
      {
       "h": "Scomporre e nascondere i dettagli",
       "text": "Finché un programma è lungo venti righe si può tenere tutto in testa; con migliaia di righe no. La lezione propone due armi. La prima è la scomposizione (decomposition): dividere il problema in pezzi autonomi, ciascuno con un compito chiaro. La seconda è l'astrazione (abstraction): usare un pezzo senza sapere come funziona dentro. L'esempio è un proiettore. Lo colleghi e lo usi senza conoscerne l'elettronica: ti basta l'interfaccia, cioè quale cavo entra e quale immagine esce. È una scatola nera (black box). E per le cerimonie olimpiche, dove serve un'immagine enorme, si mettono insieme molti proiettori, ognuno responsabile di una parte: questa è la scomposizione. In un'azienda succede lo stesso: l'amministrazione non sa come lavora il magazzino, le basta sapere che un ordine compilato produce una consegna. In Python questi due principi si realizzano prima con le funzioni e, più avanti nel corso, con le classi."
      },
      {
       "h": "Anatomia di una funzione",
       "text": "Una funzione (function) è un blocco di codice riutilizzabile a cui si dà un nome. Si definisce con def, seguito dal nome e dai parametri tra parentesi: def is_even(i): return i % 2 == 0. Ha quindi un nome, zero o più parametri, una specifica facoltativa ma consigliata, un corpo e un valore restituito. Definirla non la esegue: il codice parte solo quando la funzione viene chiamata, per esempio is_even(3), che restituisce False. Al momento della chiamata il parametro formale i viene legato al valore passato, detto parametro attuale. Un esempio pratico è def con_iva(prezzo): return prezzo * 1.22: una volta scritta, la usi ovunque serva. Il vantaggio non è scrivere meno, ma scrivere meglio: il codice si corregge una volta sola e si riusa molte volte. Le funzioni sono anche oggetti come gli altri, quindi si possono passare come argomento ad altre funzioni, un'idea che la lezione mostra con tre piccoli esempi."
      },
      {
       "h": "La specifica è un contratto",
       "text": "Subito dopo la riga def si scrive di solito una stringa di documentazione, la docstring, che fa da specifica (specification). La specifica è un contratto tra chi scrive la funzione e chi la usa. Indica le ipotesi, cioè che cosa la funzione si aspetta in ingresso, e le garanzie, cioè che cosa restituirà se le ipotesi sono rispettate. Per is_even potrebbe dire: riceve un intero positivo i e restituisce True se i è pari, altrimenti False. Chi la usa non ha bisogno di leggere il corpo, ed è proprio questo che rende possibile l'astrazione: puoi riscrivere completamente l'interno della funzione, magari per renderla più veloce, senza che nessuno se ne accorga, purché il contratto resti lo stesso. L'errore tipico è scrivere specifiche che raccontano come è fatto il codice invece di che cosa fa. Un altro è violare le ipotesi, per esempio passare un numero negativo, e poi stupirsi del risultato."
      },
      {
       "h": "return non è print",
       "text": "È la confusione più diffusa tra i principianti. return consegna un valore a chi ha chiamato la funzione, che può salvarlo, sommarlo, passarlo altrove. print invece mostra qualcosa sullo schermo e basta: il valore non torna a nessuno. Se una funzione non ha un return, Python restituisce comunque qualcosa, il valore speciale None, che significa assenza di valore. Prova a immaginare def iva(p): print(p * 0.22). Chiamando iva(100) vedi 22.0 a schermo e sembra tutto a posto; ma se poi scrivi totale = 100 + iva(100), ottieni un errore, perché stai sommando 100 e None. Altre due differenze contano. Dentro una funzione possono esserci molte print, ma viene eseguito un solo return per chiamata: appena Python lo incontra esce dalla funzione, e le righe successive non vengono eseguite. E print funziona ovunque, mentre return ha senso solo dentro una funzione."
      },
      {
       "h": "Lo scope: ogni chiamata ha il suo spazio di nomi",
       "text": "Ogni volta che una funzione viene chiamata, Python crea un nuovo ambiente, detto scope o frame, cioè una tabella che associa nomi a oggetti. Le variabili create lì dentro sono locali e scompaiono quando la funzione finisce. Considera x = 3, poi def f(x): x = x + 1, return x, e infine z = f(x). Dentro f esiste una x locale che parte da 3 e diventa 4; f restituisce 4, che finisce in z. La x globale resta 3, perché è un'altra variabile con lo stesso nome. Una funzione può leggere una variabile definita fuori, ma se le assegna un valore Python la considera locale. Per questo un'istruzione come x += 1 dentro una funzione, riferita a una x esterna, provoca un errore: Python cerca una x locale che non ha ancora un valore. Esiste la parola chiave global per aggirare la regola, ma la lezione la sconsiglia. Per vedere i frame comparire e sparire, Python Tutor è lo strumento ideale."
      }
     ],
     "keyPoints": [
      "Scomposizione significa dividere il programma in pezzi autonomi; astrazione significa usarli senza conoscerne l'interno.",
      "Una funzione si definisce con def, ma il suo codice viene eseguito solo quando la si chiama.",
      "La specifica (docstring) è un contratto: dice che cosa la funzione presuppone e che cosa garantisce, non come lavora.",
      "return consegna un valore a chi chiama; print lo mostra soltanto. Senza return la funzione restituisce None.",
      "Ogni chiamata crea un proprio scope: le variabili locali non toccano quelle esterne con lo stesso nome.",
      "Dentro una funzione si possono leggere le variabili esterne, ma assegnare loro un valore le rende locali."
     ],
     "terms": [
      {
       "t": "Scomposizione (decomposition)",
       "d": "Suddivisione di un problema o di un programma in moduli autonomi, ciascuno con un compito preciso."
      },
      {
       "t": "Astrazione (abstraction)",
       "d": "Principio per cui si usa un componente conoscendone solo l'interfaccia, senza preoccuparsi di come è fatto dentro."
      },
      {
       "t": "Funzione (function)",
       "d": "Blocco di codice con un nome, eventuali parametri e un valore restituito, eseguito quando viene chiamato."
      },
      {
       "t": "Parametro",
       "d": "Nome indicato nella definizione di una funzione che, alla chiamata, viene legato al valore passato."
      },
      {
       "t": "Specifica (docstring)",
       "d": "Testo all'inizio di una funzione che ne descrive ipotesi in ingresso e garanzie in uscita."
      },
      {
       "t": "None",
       "d": "Valore speciale che indica assenza di valore; è ciò che restituisce una funzione senza return."
      },
      {
       "t": "Scope",
       "d": "Ambiente creato a ogni chiamata, che associa i nomi delle variabili locali ai loro valori."
      }
     ],
     "quiz": [
      {
       "q": "Con def sconto(p): print(p * 0.9), che cosa contiene totale dopo totale = sconto(100)?",
       "options": [
        "90.0",
        "None",
        "100",
        "Un errore già alla riga della definizione"
       ],
       "answer": 1,
       "why": "La funzione stampa 90.0 sullo schermo ma non restituisce nulla, quindi Python restituisce None e totale vale None. Il 90.0 visto a schermo inganna: print mostra, solo return consegna il valore a chi chiama."
      },
      {
       "q": "x = 10, poi def g(x): x = x * 2 e return x. Dopo y = g(x), quanto valgono x e y?",
       "options": [
        "x = 10, y = 20",
        "x = 20, y = 20",
        "x = 10, y = 10",
        "x = 20, y = 10"
       ],
       "answer": 0,
       "why": "Dentro g il parametro x è una variabile locale, nuova a ogni chiamata: raddoppiarla non tocca la x globale, che resta 10. Il valore restituito, 20, finisce in y. Pensare che la funzione modifichi la x esterna è l'errore più comune."
      },
      {
       "q": "Che cosa deve contenere una buona specifica (docstring)?",
       "options": [
        "La spiegazione riga per riga di come è scritto il codice",
        "L'elenco delle variabili interne usate",
        "Che cosa la funzione presuppone in ingresso e che cosa garantisce in uscita, senza dire come",
        "I risultati dei test già eseguiti"
       ],
       "answer": 2,
       "why": "La specifica è un contratto: chi usa la funzione deve sapere che cosa passarle e che cosa riceverà, non come lavora dentro. È questo che permette l'astrazione. Spiegare il codice riga per riga è compito dei commenti."
      },
      {
       "q": "Perché conviene scrivere una funzione calcola_iva invece di ripetere la formula in dieci punti del programma?",
       "options": [
        "Perché il programma diventa sempre più veloce",
        "Perché Python vieta di ripetere la stessa formula",
        "Perché le funzioni occupano meno memoria",
        "Perché se l'aliquota cambia la modifichi, e la verifichi, in un solo punto"
       ],
       "answer": 3,
       "why": "Il vantaggio è la manutenzione: la logica vive in un posto solo, si testa una volta e si riusa ovunque. La velocità non c'entra; anzi, chiamare una funzione ha un piccolo costo in più rispetto a scrivere la formula direttamente."
      },
      {
       "q": "x = 5, poi def h(): x += 1. Che cosa succede chiamando h()?",
       "options": [
        "La x globale diventa 6",
        "Errore: dentro h, x è considerata locale ma non ha ancora un valore",
        "x resta 5 e non succede nulla",
        "h restituisce 6"
       ],
       "answer": 1,
       "why": "Poiché h assegna a x, Python la tratta come variabile locale di h; ma x += 1 deve prima leggerla, e la x locale non esiste ancora, quindi si ottiene un errore. Leggere una variabile esterna si può, riassegnarla no, salvo usare global, che è sconsigliato."
      }
     ],
     "explain": "Spiega a un amico perché si può usare un proiettore, o una funzione scritta da altri, senza sapere come funziona dentro, e che cosa bisogna sapere invece.",
     "apply": "Scegli un compito ripetitivo del tuo lavoro e descrivilo come una funzione: nome, dati in ingresso, risultato in uscita e una specifica di due righe. Poi chiediti chi potrebbe usarla senza conoscerne i dettagli."
    },
    {
     "id": "cs-mit-60001-05",
     "title": "Tuple, liste e il pericolo degli alias",
     "minutes": 8,
     "watch": {
      "label": "Lezione 5: Tuples, Lists, Aliasing, Mutability, and Cloning (video con trascrizione, Ana Bell)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-5-tuples-lists-aliasing-mutability-and-cloning/"
     },
     "read": [
      {
       "label": "Slide della lezione 5 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec5/"
      }
     ],
     "sections": [
      {
       "h": "Le tuple: sequenze che non cambiano",
       "text": "Una tupla (tuple) è una sequenza ordinata di elementi, anche di tipi diversi, scritta tra parentesi tonde: t = (2, 'mit', 3). Si usa come una stringa: t[0] dà 2, t[1:3] dà ('mit', 3), len(t) dà 3, e due tuple si concatenano con +. Come le stringhe, le tuple sono immutabili: t[1] = 4 produce un errore. Sembra una limitazione, ma è una garanzia: una tupla con le coordinate di un magazzino non può essere alterata per sbaglio da un'altra parte del programma. Le tuple hanno due usi molto comodi. Il primo è scambiare due variabili in una riga, x, y = y, x, senza variabile di appoggio. Il secondo è restituire più valori da una funzione: def quoziente_resto(a, b): return a // b, a % b, e poi q, r = quoziente_resto(17, 5) mette 3 in q e 2 in r. Un dettaglio che inganna: una tupla con un solo elemento richiede la virgola, ('mit',), altrimenti le parentesi sono solo parentesi."
      },
      {
       "h": "Le liste: sequenze modificabili",
       "text": "Una lista (list) è una sequenza ordinata scritta tra parentesi quadre: L = [2, 1, 3]. Di solito contiene elementi dello stesso tipo, anche se non è obbligatorio, e a differenza delle tuple è mutabile (mutable): L[1] = 5 trasforma la lista in [2, 5, 3], e si tratta dello stesso oggetto, modificato, non di uno nuovo. Le liste hanno molti metodi, funzioni legate all'oggetto che si chiamano con il punto. L.append(4) aggiunge un elemento in fondo; L.extend([0, 6]) aggiunge tutti gli elementi di un'altra lista; L.remove(3) toglie la prima occorrenza del valore 3 e dà errore se non c'è; del L[0] elimina l'elemento in una posizione; L.pop() toglie e restituisce l'ultimo. Attenzione alla differenza tra modificare e creare: L1 + L2 produce una lista nuova e lascia intatte le originali, mentre extend modifica L1. Una lista d'ordine che si allunga riga dopo riga è il caso tipico in cui la mutabilità è utile."
      },
      {
       "h": "Ordinare, spezzare e unire",
       "text": "Per ordinare una lista ci sono due strade, e confonderle è un errore classico. sorted(L) restituisce una nuova lista ordinata e lascia L com'era. L.sort() invece ordina L sul posto e restituisce None. Per questo scrivere L = L.sort() è un disastro: la lista viene ordinata e subito dopo il nome L viene legato a None. Lo stesso vale per L.reverse(), che rovescia sul posto. Tra liste e stringhe si passa facilmente. list('ciao') dà ['c', 'i', 'a', 'o']. Il metodo split spezza una stringa in una lista: 'Rossi;Mario;Milano'.split(';') dà ['Rossi', 'Mario', 'Milano'], ed è il modo più semplice di leggere una riga di un file esportato da un foglio di calcolo. Senza argomenti, split spezza sugli spazi. Il percorso inverso lo fa join, che si chiama sul separatore: '-'.join(['a', 'b', 'c']) dà 'a-b-c'. Queste poche operazioni bastano già per ripulire e riorganizzare molti dati testuali."
      },
      {
       "h": "Alias: due nomi, un solo oggetto",
       "text": "Ecco il punto più delicato della lezione. In Python una variabile non contiene una lista: punta a una lista che sta in memoria. Se scrivi caldi = ['rosso', 'giallo'] e poi tiepidi = caldi, non hai creato una seconda lista: hai dato un secondo nome alla stessa. Ogni modifica fatta attraverso un nome si vede dall'altro: dopo tiepidi.append('rosa'), anche caldi contiene 'rosa'. Questo fenomeno si chiama aliasing, e la modifica inattesa è un effetto collaterale (side effect). La lezione usa l'analogia dei soprannomi: una persona famosa conosciuta con più nomi è sempre la stessa persona. Pensa a Roberto Baggio e al «Divin Codino»: se Baggio si taglia il codino, se lo è tagliato anche il Divin Codino. Con oggetti immutabili come numeri, stringhe e tuple il problema non si pone, perché nessuno può modificarli. Con le liste e gli altri oggetti mutabili, invece, chiedersi «chi altro punta a questo oggetto?» evita moltissimi bug."
      },
      {
       "h": "Clonare, e non modificare mentre si scorre",
       "text": "Se ti serve una copia indipendente, devi crearla esplicitamente: copia = originale[:] prende una fetta che va dall'inizio alla fine, cioè tutta la lista, e ne fa un oggetto nuovo; lo stesso fanno list(originale) e originale.copy(). Attenzione però alle liste che contengono altre liste: la copia è superficiale, quindi le liste interne restano condivise. C'è poi un bug che la lezione mostra con cura. Una funzione deve togliere da L1 gli elementi presenti anche in L2, con L1 = [1, 2, 3, 4] e L2 = [1, 2, 5, 6]. Scorrendo L1 con un for e rimuovendo gli elementi trovati, il risultato è [2, 3, 4] invece di [3, 4]. Il for usa un contatore interno: quando togli 1, tutti gli elementi scalano di una posizione, il 2 finisce dove c'era l'1 e il contatore lo scavalca. Python non segnala nulla, il risultato è semplicemente sbagliato. La soluzione è scorrere una copia, for e in L1[:], e modificare l'originale."
      }
     ],
     "keyPoints": [
      "Le tuple sono immutabili e servono a raggruppare dati fissi, scambiare variabili e restituire più valori.",
      "Le liste sono mutabili: append, extend, remove e sort modificano l'oggetto stesso.",
      "sorted(L) restituisce una nuova lista; L.sort() ordina sul posto e restituisce None.",
      "Assegnare una lista a un'altra variabile crea un alias, non una copia: le modifiche si vedono da entrambi i nomi.",
      "Per una copia indipendente si usa L[:], list(L) o L.copy(); le liste annidate restano però condivise.",
      "Non bisogna togliere elementi da una lista mentre la si scorre: si scorre una copia e si modifica l'originale."
     ],
     "terms": [
      {
       "t": "Tupla (tuple)",
       "d": "Sequenza ordinata e immutabile di elementi, scritta tra parentesi tonde."
      },
      {
       "t": "Lista (list)",
       "d": "Sequenza ordinata e mutabile di elementi, scritta tra parentesi quadre."
      },
      {
       "t": "Mutabile (mutable)",
       "d": "Detto di un oggetto che si può modificare dopo la creazione, come una lista o un dizionario."
      },
      {
       "t": "Metodo",
       "d": "Funzione legata a un oggetto, chiamata con la notazione a punto, come L.append(5)."
      },
      {
       "t": "Alias",
       "d": "Secondo nome che punta allo stesso oggetto in memoria: modificare l'oggetto tramite un nome lo modifica per tutti."
      },
      {
       "t": "Effetto collaterale (side effect)",
       "d": "Modifica di un oggetto che si ripercuote su altre parti del programma, spesso in modo inatteso."
      },
      {
       "t": "Clonare",
       "d": "Creare una copia indipendente di una lista, per esempio con L[:], così da poterla modificare senza toccare l'originale."
      }
     ],
     "quiz": [
      {
       "q": "a = [1, 2, 3], poi b = a, poi b.append(4). Che cosa stampa print(a)?",
       "options": [
        "[1, 2, 3]",
        "[1, 2, 3, 4]",
        "[4]",
        "Un errore"
       ],
       "answer": 1,
       "why": "b = a non crea una copia: dà un secondo nome alla stessa lista. Modificandola attraverso b, la modifica si vede anche da a. Per avere una lista indipendente serve b = a[:] oppure b = a.copy()."
      },
      {
       "q": "voti = [7, 5, 9], poi voti = voti.sort(). Che cosa contiene voti?",
       "options": [
        "[5, 7, 9]",
        "[9, 7, 5]",
        "None",
        "[7, 5, 9]"
       ],
       "answer": 2,
       "why": "sort() ordina la lista sul posto e restituisce None; assegnando quel risultato a voti, la lista va persa. Si scrive voti.sort() da solo, oppure voti = sorted(voti), che restituisce una nuova lista ordinata."
      },
      {
       "q": "Devi conservare le coordinate di un magazzino, che non devono mai cambiare per errore. Che cosa usi?",
       "options": [
        "Una tupla, perché è immutabile",
        "Una lista, perché è più facile da modificare",
        "Una stringa con le coordinate separate da virgole",
        "Due variabili globali"
       ],
       "answer": 0,
       "why": "La tupla non si può modificare, quindi nessuna parte del programma può alterarne il contenuto per sbaglio. La lista funzionerebbe, ma qui il fatto di poterla cambiare è un rischio, non un vantaggio."
      },
      {
       "q": "Che cosa restituisce 'Rossi;Mario;Milano'.split(';')[1]?",
       "options": [
        "'Rossi'",
        "';'",
        "'Mario;Milano'",
        "'Mario'"
       ],
       "answer": 3,
       "why": "split(';') spezza la stringa nella lista ['Rossi', 'Mario', 'Milano'], e l'indice 1 indica il secondo elemento, 'Mario'. Chi risponde 'Rossi' dimentica che gli indici partono da 0."
      },
      {
       "q": "Perché togliere elementi da una lista mentre la si scorre con un for è un errore?",
       "options": [
        "Perché Python lo vieta con un errore di sintassi",
        "Perché il for usa un contatore interno: togliendo un elemento gli altri scalano e uno viene saltato",
        "Perché le liste sono immutabili",
        "Perché remove funziona solo fuori dai cicli"
       ],
       "answer": 1,
       "why": "Il for avanza di posizione in posizione; se togli l'elemento corrente, il successivo scivola al suo posto e il contatore lo scavalca. Python non segnala nulla: il risultato è solo sbagliato. La soluzione è scorrere una copia."
      }
     ],
     "explain": "Spiega a un amico, con l'esempio dei soprannomi di una persona famosa, perché in Python due variabili possono «cambiare insieme».",
     "apply": "Apri Python Tutor e scrivi a = [1, 2], poi b = a, poi c = a[:], poi b.append(3). Osserva le frecce verso gli oggetti e descrivi a voce quale variabile è un alias e quale una copia."
    },
    {
     "id": "cs-mit-60001-06",
     "title": "Ricorsione e dizionari",
     "minutes": 9,
     "watch": {
      "label": "Lezione 6: Recursion and Dictionaries (video, Eric Grimson)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-6-recursion-and-dictionaries/"
     },
     "read": [
      {
       "label": "Slide della lezione 6 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec6/"
      }
     ],
     "sections": [
      {
       "h": "Risolvere un problema riducendolo a se stesso",
       "text": "La ricorsione (recursion) è un modo di risolvere un problema riducendolo a una versione più piccola dello stesso problema. In pratica è una funzione che chiama se stessa. Perché funzioni servono due ingredienti: almeno un caso base (base case), così semplice da risolvere direttamente, e un passo ricorsivo che chiama la funzione su un input più piccolo, in modo da avvicinarsi sempre al caso base. La lezione parte dalla moltiplicazione: a per b è a più a per (b - 1), e il caso base è b uguale a 1, dove il risultato è a. Il fattoriale segue lo stesso schema: fact(n) = n * fact(n - 1), con fact(1) = 1. Ogni chiamata ha il suo scope, con la propria n: fact(4) apre fact(3), che apre fact(2), e così via, poi i risultati risalgono. È come aprire una matrioska dopo l'altra fino alla più piccola. Se dimentichi il caso base, le chiamate non finiscono e Python si ferma con un RecursionError dopo circa mille livelli."
      },
      {
       "h": "Perché funziona: l'induzione",
       "text": "Come si fa a fidarsi di una funzione che chiama se stessa? Con lo stesso ragionamento dell'induzione matematica (mathematical induction). Per dimostrare che una proprietà vale per tutti i numeri basta mostrare che vale per il caso più piccolo e che, se vale per k, allora vale anche per k + 1. La lezione usa la formula 0 + 1 + ... + n = n(n + 1)/2: per n = 0 entrambi i lati valgono 0, e aggiungendo k + 1 alla somma fino a k si ottiene esattamente la formula per k + 1. Per una funzione ricorsiva il ragionamento è identico: se il caso base è corretto e, supponendo che la funzione funzioni su input più piccoli, il passo ricorsivo dà il risultato giusto, allora la funzione è corretta per tutti gli input. Ricorsione e iterazione possono risolvere gli stessi problemi. La ricorsione spesso produce codice più breve e più vicino al ragionamento, ma non è sempre la scelta più efficiente per il computer."
      },
      {
       "h": "Torri di Hanoi e palindromi",
       "text": "Le torri di Hanoi mostrano la forza della ricorsione. Ci sono tre pioli e una pila di dischi di grandezza decrescente; bisogna spostare la pila su un altro piolo muovendo un disco alla volta e senza mai mettere un disco grande su uno più piccolo. La leggenda parla di 64 dischi. Trovare le mosse a mano è difficile, ma ragionando in modo ricorsivo è semplice: sposta gli n - 1 dischi superiori sul piolo libero, sposta il disco più grande sulla destinazione, poi sposta di nuovo gli n - 1 dischi sopra di esso. In Python sono tre righe. Il numero di mosse è 2 alla n meno 1: per 64 dischi, al ritmo di una mossa al secondo, servirebbero circa 585 miliardi di anni. Anche i palindromi si prestano alla ricorsione: una frase come «I topi non avevano nipoti», tolti spazi e maiuscole, è palindroma se la prima e l'ultima lettera coincidono e se lo è la parte centrale. Il caso base è una stringa di zero o una lettera."
      },
      {
       "h": "Fibonacci e il prezzo dei calcoli ripetuti",
       "text": "Nel Liber Abaci, del 1202, Leonardo Pisano detto Fibonacci propose un problema sui conigli: ogni coppia, dal secondo mese di vita, genera una nuova coppia al mese, e nessuno muore. Il numero di coppie mese per mese è 1, 1, 2, 3, 5, 8, 13: ogni valore è la somma dei due precedenti. In Python la traduzione ricorsiva è immediata: fib(n) = fib(n - 1) + fib(n - 2), con due casi base. Ma nasconde un costo enorme, perché gli stessi valori vengono ricalcolati moltissime volte: fib(5) chiede fib(4) e fib(3), ma anche fib(4) chiede fib(3), e così via. Con la versione delle slide, fib(34) richiede oltre 11 milioni di chiamate. La soluzione si chiama memoizzazione (memoization): si salva ogni risultato in un dizionario e, prima di calcolare, si controlla se c'è già. Così le chiamate per fib(34) scendono a 65. Funziona solo con funzioni senza effetti collaterali, che con lo stesso input danno sempre lo stesso risultato."
      },
      {
       "h": "I dizionari: cercare per chiave",
       "text": "Immagina di gestire nomi e voti degli studenti con due liste parallele: devono restare sempre allineate, e per trovare un voto devi prima cercare la posizione del nome. Il dizionario (dictionary) risolve il problema associando direttamente una chiave (key) a un valore: voti = {'Ana': 'B', 'John': 'A+'}. Con voti['John'] ottieni 'A+'; una chiave inesistente provoca un KeyError. Si aggiunge con voti['Sara'] = 'A', si controlla con 'Ana' in voti, si cancella con del voti['Ana']; keys() e values() danno chiavi e valori. Le chiavi devono essere uniche e immutabili, quindi stringhe, numeri o tuple, non liste; i valori possono essere qualsiasi cosa. La lezione conta le parole del testo di una canzone: per ogni parola, se è già nel dizionario si aggiunge 1, altrimenti la si inserisce con 1. La lezione dice che i dizionari non hanno ordine: era vero in Python 3.5, mentre dalla versione 3.7 l'ordine di inserimento è garantito."
      }
     ],
     "keyPoints": [
      "Una funzione ricorsiva ha almeno un caso base e un passo che la richiama su un input più piccolo.",
      "La correttezza di una funzione ricorsiva si dimostra con lo stesso schema dell'induzione matematica.",
      "Le torri di Hanoi si risolvono in tre righe ricorsive, ma richiedono 2 alla n meno 1 mosse.",
      "Il Fibonacci ricorsivo ingenuo ricalcola gli stessi valori milioni di volte; la memoizzazione con un dizionario lo evita.",
      "Un dizionario associa chiavi uniche e immutabili a valori e permette di trovare un valore direttamente dalla sua chiave.",
      "Cercare una chiave inesistente provoca KeyError: prima di leggere si può controllare con in."
     ],
     "terms": [
      {
       "t": "Ricorsione (recursion)",
       "d": "Tecnica in cui una funzione risolve un problema chiamando se stessa su una versione più piccola del problema."
      },
      {
       "t": "Caso base (base case)",
       "d": "Caso abbastanza semplice da essere risolto direttamente, che interrompe la catena delle chiamate ricorsive."
      },
      {
       "t": "Induzione matematica",
       "d": "Metodo di dimostrazione: si prova il caso iniziale e si mostra che, se la proprietà vale per k, vale per k + 1."
      },
      {
       "t": "Divide et impera (divide and conquer)",
       "d": "Strategia che spezza un problema in sotto-problemi più facili e ne combina le soluzioni."
      },
      {
       "t": "Dizionario (dictionary)",
       "d": "Struttura che associa chiavi uniche a valori, scritta tra graffe, come {'Ana': 'B'}."
      },
      {
       "t": "Chiave (key)",
       "d": "Elemento immutabile, come una stringa o un numero, che identifica un valore in un dizionario."
      },
      {
       "t": "Memoizzazione (memoization)",
       "d": "Tecnica che salva i risultati già calcolati per riusarli invece di ricalcolarli."
      }
     ],
     "quiz": [
      {
       "q": "Con def conta(n): return conta(n - 1) + 1, che cosa succede chiamando conta(3)?",
       "options": [
        "Restituisce 3",
        "Restituisce 4",
        "Continua a chiamarsi finché Python si ferma con un errore, perché manca il caso base",
        "Restituisce 0"
       ],
       "answer": 2,
       "why": "Senza un caso base, come if n == 0: return 0, ogni chiamata ne genera un'altra, finché Python supera il limite di chiamate annidate e solleva RecursionError. Con quel caso base la funzione restituirebbe 3."
      },
      {
       "q": "Quale di questi oggetti non può essere usato come chiave di un dizionario?",
       "options": [
        "La stringa 'IT-CR'",
        "La tupla (45, 9)",
        "Il numero 2026",
        "La lista [45, 9]"
       ],
       "answer": 3,
       "why": "Le chiavi devono essere immutabili, perché il dizionario le usa per calcolare dove conservare il valore: se cambiassero, la voce non si ritroverebbe più. La lista è mutabile; la tupla con gli stessi numeri invece va bene."
      },
      {
       "q": "Perché fib(34) scritta in modo ricorsivo ingenuo fa milioni di chiamate, mentre la versione con dizionario ne fa poche decine?",
       "options": [
        "Perché i dizionari rendono Python più veloce in generale",
        "Perché la versione ingenua ricalcola tante volte gli stessi valori, mentre la memoizzazione li calcola una volta e poi li rilegge",
        "Perché la versione con dizionario usa un ciclo for",
        "Perché la versione ingenua ha un caso base sbagliato"
       ],
       "answer": 1,
       "why": "fib(34) chiede fib(33) e fib(32), ma anche fib(33) chiede fib(32), e così via: gli stessi sotto-problemi si ripetono moltissime volte. Salvando ogni risultato, ciascuno si calcola una volta sola. Il caso base è corretto in entrambe le versioni."
      },
      {
       "q": "Hai un listino con 50.000 codici prodotto e i relativi prezzi, e devi trovare spesso il prezzo di un codice. Quale struttura è più adatta?",
       "options": [
        "Un dizionario codice → prezzo",
        "Due liste parallele, una di codici e una di prezzi",
        "Una lista di stringhe 'codice:prezzo'",
        "Una tupla di soli prezzi"
       ],
       "answer": 0,
       "why": "Il dizionario trova il valore direttamente dalla chiave, in un tempo che in media non dipende dalla dimensione, e tiene legati codice e prezzo. Con le liste parallele dovresti scorrere i codici e badare che le due liste restino allineate."
      },
      {
       "q": "Per convincersi che una funzione ricorsiva è corretta si usa un ragionamento simile all'induzione. Quale?",
       "options": [
        "Provarla su molti esempi scelti a caso",
        "Mostrare che il caso base è giusto e che, se funziona per input più piccoli, il passo ricorsivo dà il risultato giusto",
        "Controllare che non contenga cicli for",
        "Contare quante volte chiama se stessa"
       ],
       "answer": 1,
       "why": "È lo schema dell'induzione matematica: caso base vero, più il passo che porta dai casi più piccoli a quello attuale. I test su esempi casuali danno fiducia, ma non sono una dimostrazione."
      }
     ],
     "explain": "Spiega a un amico come si risolve la torre di Hanoi con tre dischi pensando in modo ricorsivo: che cosa fai con i due dischi superiori e con quello più grande?",
     "apply": "Pensa a un elenco che consulti spesso al lavoro (clienti e telefoni, codici e prezzi) e chiediti quale sarebbe la chiave e quale il valore se fosse un dizionario. La chiave è davvero unica? Che cosa succederebbe con due clienti omonimi?"
    },
    {
     "id": "cs-mit-60001-07",
     "title": "Test, debugging, eccezioni e asserzioni",
     "minutes": 10,
     "watch": {
      "label": "Lezione 7: Testing, Debugging, Exceptions, and Assertions (video con trascrizione, Ana Bell)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-7-testing-debugging-exceptions-and-assertions/"
     },
     "read": [
      {
       "label": "Slide della lezione 7 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec7/"
      }
     ],
     "sections": [
      {
       "h": "Prevenire, controllare, correggere",
       "text": "La lezione apre con un'immagine domestica: in cucina continuano a cadere insetti nella zuppa. Puoi controllare la zuppa prima di servirla, che corrisponde al test; tenere il coperchio chiuso, cioè la programmazione difensiva (defensive programming); oppure pulire la cucina, eliminando la fonte dei bug. Nel software servono tutte e tre le cose. La programmazione difensiva consiste nello scrivere specifiche, dividere il codice in moduli e controllare le condizioni in ingresso e in uscita. Il test (testing) confronta coppie di input e output con quanto promette la specifica, con una domanda in mente: come posso rompere questo programma? Il debugging, infine, studia la catena di eventi che ha portato all'errore. Conviene progettare il codice fin dall'inizio perché sia facile da testare: moduli piccoli, ciascuno verificabile da solo, con ingressi e uscite documentati. E prima di testare il codice deve almeno girare, senza errori di sintassi."
      },
      {
       "h": "Tre livelli di test",
       "text": "Il test di unità (unit testing) verifica una funzione alla volta, isolata dal resto. Il test di regressione (regression testing) nasce ogni volta che si trova un bug: si scrive un test che lo riproduce e lo si tiene per sempre, così se una modifica futura reintroduce l'errore lo si scopre subito. Il test di integrazione (integration testing) controlla che i pezzi funzionino insieme, ed è la fase che la lezione avverte di non affrettare. Un caso celebre di guasto all'integrazione è la sonda Mars Climate Orbiter della NASA, persa nel 1999: un software di terra forniva valori in unità anglosassoni, mentre il resto del sistema si aspettava unità metriche. Ogni parte, presa da sola, era coerente; insieme no. Per scegliere i casi di prova, si cercano le partizioni naturali del problema: per una funzione is_bigger(x, y) si provano x maggiore di y, x uguale a y e x minore di y. Quando non ci sono partizioni evidenti si può ricorrere a test casuali."
      },
      {
       "h": "Scatola nera e scatola trasparente",
       "text": "Nel test a scatola nera (black box testing) i casi di prova si ricavano solo dalla specifica, senza guardare il codice. Possono quindi scriverli persone diverse dall'autore, che non condividono i suoi pregiudizi, e restano validi anche se l'implementazione cambia. Vanno coperti i casi limite (boundary cases): lista vuota, lista con un solo elemento, numeri molto grandi o molto piccoli. Per una funzione che calcola la radice quadrata la lezione propone x = 0, un quadrato perfetto come 25, un numero minore di 1 come 0,05, un numero con radice irrazionale come 2 e valori estremi come 2 alla 64. Nel test a scatola trasparente (glass box testing) si guarda invece il codice e si cerca di percorrere ogni cammino possibile: una batteria di test che li percorre tutti si dice completa nei cammini (path-complete). Non basta però: una funzione per il valore assoluto con il controllo scritto male, x < -1 invece di x < 0, supera i test con 2 e -2 ma sbaglia proprio con -1."
      },
      {
       "h": "Il debugging come metodo scientifico",
       "text": "La parola bug era già in uso tra gli ingegneri quando, nel 1947, gli operatori del calcolatore Harvard Mark II trovarono una falena incastrata in un relè e la incollarono nel registro di lavoro come primo caso di bug «vero». Oggi i bug facili sono quelli segnalati da un messaggio chiaro: IndexError quando si legge oltre la fine di una lista, TypeError quando si mescolano tipi incompatibili, NameError per una variabile mai definita, SyntaxError per una parentesi non chiusa. I difficili sono gli errori di logica, che non producono messaggi. Qui serve metodo: osservare i dati, formulare un'ipotesi, fare un esperimento ripetibile, partendo dall'input più semplice che riproduce il problema. Le print sono lo strumento più semplice, e si possono usare a bisezione: una a metà del codice dice in quale metà nasce l'errore. Aiuta anche spiegare il codice ad alta voce, persino a una paperella di gomma. E mai cambiare dieci righe insieme senza ricordare che cosa si è toccato."
      },
      {
       "h": "Le eccezioni: gestire l'imprevisto",
       "text": "Quando qualcosa va storto durante l'esecuzione, Python solleva un'eccezione (exception): ZeroDivisionError per una divisione per zero, ValueError per un valore del tipo giusto ma inaccettabile, come int('abc'), KeyError per una chiave assente. Se nessuno la gestisce, il programma si ferma. Con try ed except la si intercetta: try: n = int(input('Quantità? ')) seguito da except ValueError: print('Serve un numero'). Si possono avere più except per tipi diversi, un else che gira solo se non ci sono state eccezioni e un finally che gira sempre, ideale per chiudere file e connessioni. Davanti a un errore, la lezione scarta il fallire in silenzio e sconsiglia di restituire valori speciali, come -1, che ogni chiamante deve ricordarsi di controllare. Meglio sollevare a propria volta un'eccezione chiara, con raise ValueError('data non valida'). Un'eccezione non gestita può costare cara: nel 1996 il primo razzo Ariane 5 andò perso meno di un minuto dopo il lancio per una conversione numerica fuori scala non gestita."
      },
      {
       "h": "Le asserzioni: verificare le ipotesi",
       "text": "Un'asserzione (assertion) è un controllo che il programmatore inserisce per verificare che un'ipotesi sia vera in quel punto del programma. Si scrive con assert seguito da una condizione e, facoltativamente, da un messaggio: assert len(voti) != 0, 'nessun voto'. Se la condizione è falsa, Python solleva un AssertionError e si ferma. La lezione mostra perché serve con un registro di classe: uno studente senza voti fa calcolare una media che divide per zero. Si può stampare un avviso e restituire None, si può decidere che la media sia 0, oppure si può fermare tutto con un'asserzione, perché un elenco vuoto lì non dovrebbe mai arrivare. La differenza con le eccezioni è di scopo. Le eccezioni gestiscono problemi prevedibili, come un utente che scrive male una data. Le asserzioni scovano errori del programmatore il prima possibile: controllano i tipi degli argomenti, le proprietà che una struttura dati deve sempre rispettare, i limiti sui valori restituiti."
      }
     ],
     "keyPoints": [
      "La qualità del software si costruisce con tre attività: programmazione difensiva, test e debugging.",
      "I test di unità verificano le singole funzioni, quelli di regressione impediscono ai bug di tornare, quelli di integrazione controllano l'insieme.",
      "I test a scatola nera nascono dalla specifica; quelli a scatola trasparente dal codice. In entrambi i casi servono i casi limite.",
      "Il debugging è un metodo scientifico: ipotesi, esperimento ripetibile, input più semplice, e print usate a bisezione.",
      "try ed except gestiscono le eccezioni; finally gira sempre; raise segnala un errore invece di fallire in silenzio.",
      "Le asserzioni fermano il programma quando un'ipotesi del programmatore è falsa e aiutano a trovare subito l'origine dei bug."
     ],
     "terms": [
      {
       "t": "Programmazione difensiva",
       "d": "Stile che previene gli errori con specifiche chiare, moduli separati e controlli su ingressi e uscite."
      },
      {
       "t": "Test di unità (unit testing)",
       "d": "Verifica di una singola funzione o modulo, isolato dal resto del programma."
      },
      {
       "t": "Test di regressione",
       "d": "Test aggiunto dopo aver corretto un bug, per accorgersi subito se l'errore ricompare."
      },
      {
       "t": "Caso limite (boundary case)",
       "d": "Input ai confini del previsto, come lista vuota, zero o numeri enormi, dove gli errori si nascondono più spesso."
      },
      {
       "t": "Eccezione (exception)",
       "d": "Segnale che Python solleva quando qualcosa va storto durante l'esecuzione, come ValueError o ZeroDivisionError."
      },
      {
       "t": "try / except",
       "d": "Costrutto che esegue un blocco e, se si verifica un'eccezione, passa al blocco di gestione corrispondente."
      },
      {
       "t": "Asserzione (assertion)",
       "d": "Istruzione assert che verifica un'ipotesi e ferma il programma con AssertionError se è falsa."
      }
     ],
     "quiz": [
      {
       "q": "Hai corretto un bug che sbagliava il calcolo dei giorni di ferie a febbraio. Che cosa suggerisce l'idea del test di regressione?",
       "options": [
        "Niente: il bug è corretto e la questione è chiusa",
        "Aggiungere un test che riproduce quel caso, così ti accorgi subito se l'errore ricompare",
        "Riscrivere da capo tutto il programma",
        "Eliminare i test vecchi che già passavano"
       ],
       "answer": 1,
       "why": "Un test di regressione cattura il bug una volta per tutte: se una modifica futura lo reintroduce, il test fallisce subito. Considerare chiusa la questione senza un test è proprio il modo in cui i bug ritornano."
      },
      {
       "q": "Una funzione per il valore assoluto contiene if x < -1: return -x, altrimenti return x. I test con 5 e -5 passano. Che cosa insegna questo caso?",
       "options": [
        "Che due test bastano sempre, se percorrono tutti i rami",
        "Che la funzione è corretta",
        "Che i casi limite, come -1 e 0, trovano errori che sfuggono anche a test che percorrono tutti i rami",
        "Che bisogna testare solo numeri positivi"
       ],
       "answer": 2,
       "why": "5 e -5 percorrono entrambi i rami, quindi i test sono completi nei cammini; eppure con -1 la funzione restituisce -1, che è sbagliato. Per questo ai test sui cammini si aggiungono sempre i casi limite."
      },
      {
       "q": "Che cosa stampa questo codice se l'utente scrive 'abc'? try: n = int(input()), except ValueError: print('Non è un numero'), else: print('Grazie'), finally: print('Fine')",
       "options": [
        "Grazie e poi Fine",
        "Solo Non è un numero",
        "Non è un numero e poi Fine",
        "Un errore non gestito"
       ],
       "answer": 2,
       "why": "int('abc') solleva ValueError, quindi si esegue il ramo except; else gira solo se non ci sono eccezioni, perciò Grazie non compare. finally gira sempre, con o senza errori: per questo è il posto giusto per le operazioni di chiusura."
      },
      {
       "q": "Una funzione riceve dall'utente una data scritta male. Qual è la reazione più corretta secondo la lezione?",
       "options": [
        "Sollevare un'eccezione con un messaggio chiaro, per esempio ValueError",
        "Continuare in silenzio usando la data di oggi",
        "Restituire -1 e sperare che chi chiama lo controlli",
        "Usare assert per bloccare tutto senza spiegazioni"
       ],
       "answer": 0,
       "why": "Fallire in silenzio nasconde il problema, e un valore speciale come -1 obbliga ogni chiamante a ricordarsi di controllarlo. L'eccezione interrompe il flusso e dice che cosa non va. assert serve a scovare errori del programmatore, non a gestire input sbagliati dell'utente."
      },
      {
       "q": "Un programma di 200 righe dà un risultato sbagliato e non sai dove nasce l'errore. Qual è una buona strategia?",
       "options": [
        "Riscrivere subito le parti più vecchie",
        "Cambiare più righe insieme e vedere se il risultato migliora",
        "Mettere un try ed except attorno a tutto il codice",
        "Mettere una print a metà del codice per capire in quale metà nasce l'errore, poi ripetere"
       ],
       "answer": 3,
       "why": "È la bisezione applicata al codice: ogni controllo dimezza la zona sospetta, e in pochi passi trovi il punto. Cambiare molte righe insieme senza un'ipotesi rende impossibile capire che cosa ha risolto, o peggiorato, il problema."
      }
     ],
     "explain": "Spiega a un amico la differenza tra testare un programma e fare debugging, e perché i casi limite, come una lista vuota o lo zero, vanno sempre provati.",
     "apply": "Prendi un foglio di calcolo che usi al lavoro e prova a «romperlo»: cella vuota, zero, numero negativo, testo al posto di un numero. Annota che cosa succede in ogni caso: hai appena fatto un test a scatola nera."
    },
    {
     "id": "cs-mit-60001-08",
     "title": "Oggetti e classi: creare i propri tipi",
     "minutes": 8,
     "watch": {
      "label": "Lezione 8: Object Oriented Programming (video con trascrizione, Ana Bell)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-8-object-oriented-programming/"
     },
     "read": [
      {
       "label": "Slide della lezione 8 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec8/"
      }
     ],
     "sections": [
      {
       "h": "In Python tutto è un oggetto",
       "text": "Il numero 1234, la stringa 'ciao', la lista [1, 5, 7] e un dizionario di sigle e nomi di stati sono tutti oggetti. Ogni oggetto ha tre cose: un tipo, una rappresentazione interna dei dati e un insieme di operazioni con cui interagire con lui. 1234 è un'istanza (instance) del tipo int, 'ciao' un'istanza di str. Gli oggetti si creano, si manipolano e si distruggono: quando nessun nome punta più a un oggetto, Python recupera la memoria da solo con la raccolta dei rifiuti (garbage collection). Pensa a come usi una lista: chiami append, sort, len senza sapere come Python la memorizzi davvero. Questa separazione tra interfaccia e rappresentazione interna è la chiave della programmazione orientata agli oggetti (object oriented programming, OOP). La rappresentazione interna dovrebbe restare privata: chi la manipola direttamente, scavalcando le operazioni previste, rischia di rompere il comportamento dell'oggetto."
      },
      {
       "h": "Perché programmare a oggetti",
       "text": "Programmare a oggetti significa creare tipi nuovi su misura per il proprio problema, raggruppando i dati e le procedure che li riguardano. I vantaggi sono tre. Il primo è l'ordine: dati e operazioni stanno insieme dietro un'interfaccia ben definita. Il secondo è il divide et impera nello sviluppo: ogni classe si può scrivere e verificare separatamente, il che riduce la complessità complessiva. Il terzo è il riuso: una classe si può usare in programmi diversi, ogni classe ha un proprio spazio di nomi, quindi due metodi con lo stesso nome in classi diverse non si scontrano, e grazie all'ereditarietà, tema della prossima lezione, una classe può estenderne un'altra. Pensa al gestionale di un negozio: invece di tenere prezzi, giacenze e descrizioni in liste sparse, definisci un tipo Prodotto con i suoi dati e le sue operazioni, come applicare uno sconto o verificare la disponibilità. Va distinto bene il momento in cui si definisce una classe da quello in cui la si usa, creando istanze."
      },
      {
       "h": "Definire una classe: __init__ e self",
       "text": "Una classe si definisce con la parola class, in modo simile a def: class Coordinate(object):. La scritta object tra parentesi indica che Coordinate è un tipo di oggetto Python e ne eredita le caratteristiche di base. Dentro la classe si definiscono gli attributi: gli attributi di dati, cioè ciò che compone l'oggetto, e i metodi, cioè le funzioni che hanno senso solo per quella classe. Il primo metodo da scrivere è di solito __init__, con due trattini bassi prima e dopo, che inizializza un nuovo oggetto: def __init__(self, x, y): self.x = x e self.y = y. Il parametro self rappresenta l'istanza particolare che si sta creando. Quando scrivi c = Coordinate(3, 4), Python crea l'oggetto, lo passa da solo come self e lega x a 3 e y a 4. Da quel momento c.x vale 3. Le variabili come self.x si chiamano variabili d'istanza: ogni oggetto ha le proprie. L'errore tipico è dimenticare self, scrivendo x = x invece di self.x = x: il valore resta locale e va perso."
      },
      {
       "h": "I metodi",
       "text": "Un metodo è una funzione che vive dentro una classe e riceve sempre come primo parametro l'oggetto su cui lavora, per convenzione chiamato self. Per Coordinate la lezione definisce la distanza tra due punti: def distanza(self, altro): return ((self.x - altro.x)**2 + (self.y - altro.y)**2) ** 0.5. A parte self e la notazione a punto, un metodo si comporta come qualsiasi funzione: riceve parametri, fa calcoli, restituisce un valore. Con c = Coordinate(3, 4) e origine = Coordinate(0, 0), la chiamata c.distanza(origine) restituisce 5.0. Esiste anche una forma equivalente, più esplicita: Coordinate.distanza(c, origine). La prima è una scorciatoia: Python cerca distanza nella classe di c e la chiama passando c come self. I metodi incarnano l'idea che certe operazioni abbiano senso solo per certi tipi: la distanza tra due coordinate ha un significato, quella tra due liste no. Per sapere se un oggetto appartiene a una classe si usa isinstance(c, Coordinate)."
      },
      {
       "h": "Metodi speciali: __str__ e gli operatori",
       "text": "Se stampi un oggetto di una classe appena creata, Python mostra qualcosa di poco utile, come <__main__.Coordinate object at 0x...>. Per decidere tu il testo, definisci il metodo speciale __str__, che Python chiama quando usi print: def __str__(self): return '<' + str(self.x) + ',' + str(self.y) + '>'. Ora print(c) mostra <3,4>. Allo stesso modo puoi insegnare alla tua classe gli operatori: __add__ definisce che cosa fa +, __sub__ il segno meno, __eq__ il confronto ==, __lt__ il minore, __len__ la funzione len. Quando Python incontra f1 + f2, chiama in realtà f1.__add__(f2). La lezione costruisce così un tipo Frazione, rappresentato da due interi, numeratore e denominatore, con operazioni per sommare, sottrarre, stampare, convertire in decimale e invertire. Python offre già un tipo simile nel modulo fractions, ma costruirlo da sé mostra come un tipo nuovo possa comportarsi come quelli di base."
      }
     ],
     "keyPoints": [
      "Ogni oggetto ha un tipo, una rappresentazione interna e un'interfaccia di operazioni; un oggetto è un'istanza del suo tipo.",
      "La programmazione a oggetti raggruppa dati e procedure, separa l'interfaccia dall'implementazione e favorisce il riuso.",
      "Una classe si definisce con class; il metodo __init__ inizializza gli attributi di ogni nuova istanza.",
      "self è l'istanza su cui il metodo lavora, e Python la passa automaticamente.",
      "c.metodo(x) equivale a Classe.metodo(c, x).",
      "I metodi speciali come __str__, __add__ ed __eq__ fanno funzionare print e gli operatori con le proprie classi."
     ],
     "terms": [
      {
       "t": "Oggetto (object)",
       "d": "Dato con un tipo, una rappresentazione interna e operazioni per interagire con esso; in Python ogni valore è un oggetto."
      },
      {
       "t": "Classe (class)",
       "d": "Definizione di un nuovo tipo di oggetto, con i suoi attributi di dati e i suoi metodi."
      },
      {
       "t": "Istanza (instance)",
       "d": "Singolo oggetto creato a partire da una classe, con i propri valori degli attributi."
      },
      {
       "t": "Attributo",
       "d": "Dato o metodo che appartiene a un oggetto e si raggiunge con la notazione a punto, come c.x."
      },
      {
       "t": "self",
       "d": "Nome convenzionale del primo parametro di ogni metodo: rappresenta l'istanza su cui il metodo viene chiamato."
      },
      {
       "t": "__init__",
       "d": "Metodo speciale chiamato automaticamente alla creazione di un oggetto per inizializzarne gli attributi."
      },
      {
       "t": "Metodo speciale",
       "d": "Metodo con doppio trattino basso, come __str__ o __add__, che Python chiama per print, operatori e funzioni predefinite."
      }
     ],
     "quiz": [
      {
       "q": "In class Conto, il metodo def __init__(self, saldo): self.saldo = saldo. Che cosa rappresenta self?",
       "options": [
        "La classe Conto in generale",
        "L'istanza specifica che si sta creando o usando",
        "Una variabile globale condivisa da tutti i conti",
        "Un argomento che il programmatore deve sempre passare a mano"
       ],
       "answer": 1,
       "why": "self è l'oggetto particolare su cui il metodo lavora: con c = Conto(100), dentro __init__ self è proprio c. Python lo passa da solo, ed è per questo che scrivi Conto(100) e non Conto(c, 100)."
      },
      {
       "q": "Che cosa stampa print(p) se la classe di p non definisce __str__?",
       "options": [
        "I valori di tutti gli attributi",
        "Niente",
        "Una descrizione generica con il nome della classe e un indirizzo di memoria",
        "Un errore"
       ],
       "answer": 2,
       "why": "Senza __str__ Python non sa come vuoi rappresentare l'oggetto e mostra qualcosa come <__main__.Punto object at 0x...>. Definendo __str__ decidi tu il testo, per esempio <3,4>."
      },
      {
       "q": "Vuoi poter scrivere f1 + f2 con due oggetti della tua classe Frazione. Che cosa devi definire?",
       "options": [
        "Il metodo __add__",
        "Una funzione globale somma",
        "Il metodo __init__ con due parametri",
        "Il metodo __str__"
       ],
       "answer": 0,
       "why": "Quando Python incontra f1 + f2 chiama f1.__add__(f2). __init__ serve a creare l'oggetto e __str__ a stamparlo: senza __add__ il segno + non sa che cosa fare con le tue frazioni e solleva un TypeError."
      },
      {
       "q": "Qual è il vantaggio principale di raggruppare dati e metodi in una classe Fattura?",
       "options": [
        "Il programma usa sempre meno memoria",
        "Non servono più le funzioni",
        "Python esegue le classi più velocemente",
        "Chi usa Fattura lavora con un'interfaccia chiara, come totale() e scadenza(), senza dipendere da come i dati sono memorizzati dentro"
       ],
       "answer": 3,
       "why": "È l'astrazione applicata ai dati: puoi cambiare la rappresentazione interna senza rompere il codice di chi usa la classe, e puoi verificarla da sola. Memoria e velocità non sono il motivo per cui si usano gli oggetti."
      },
      {
       "q": "Con c = Coordinate(3, 4) e o = Coordinate(0, 0), quale chiamata equivale a c.distanza(o)?",
       "options": [
        "Coordinate.distanza(c, o)",
        "distanza(c, o)",
        "o.distanza()",
        "Coordinate.distanza(o)"
       ],
       "answer": 0,
       "why": "c.distanza(o) è una scorciatoia: Python cerca distanza nella classe di c e la chiama passando c come self e o come altro. distanza(c, o) da sola non esiste fuori dalla classe, e alle altre due forme manca un argomento."
      }
     ],
     "explain": "Spiega a un amico la differenza tra una classe e un'istanza con un esempio della vita quotidiana, come lo stampo e i biscotti o il modulo vuoto e le pratiche compilate.",
     "apply": "Scegli un oggetto del tuo lavoro (un ordine, un cliente, un preventivo) e scrivi quali dati lo descrivono e quali azioni ha senso fare su di esso. Hai appena progettato una classe, con i suoi attributi e i suoi metodi."
    },
    {
     "id": "cs-mit-60001-09",
     "title": "Ereditarietà e gerarchie di classi",
     "minutes": 8,
     "watch": {
      "label": "Lezione 9: Python Classes and Inheritance (video, Ana Bell)",
      "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/lecture-9-python-classes-and-inheritance/"
     },
     "read": [
      {
       "label": "Slide della lezione 9 (PDF, in inglese)",
       "url": "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/resources/mit6_0001f16_lec9/"
      }
     ],
     "sections": [
      {
       "h": "Classe e istanza, due punti di vista",
       "text": "La lezione insiste su una distinzione che chi comincia tende a confondere. La classe è il tipo, definito in modo generico: quando la scrivi, usi self per indicare un'istanza qualsiasi, senza sapere quale sarà. L'istanza è un oggetto concreto, con i propri valori: c1 = Coordinate(1, 2) e c2 = Coordinate(3, 4) hanno la stessa struttura, ma x diverse. Bisogna quindi saper ragionare in due ruoli: quello di chi implementa un tipo nuovo, decidendo dati e metodi, e quello di chi lo usa, creando istanze e chiamando operazioni. Gli attributi si dividono in attributi di dati, che dicono che cosa l'oggetto è, e attributi procedurali, cioè i metodi, che dicono che cosa fa. Un animale, per esempio, ha un'età e un nome e sa emettere un verso. La lezione costruisce proprio una classe Animal: __init__ riceve l'età e imposta il nome a None, da assegnare in seguito. Le classi servono così a imitare la realtà, raggruppando oggetti dello stesso genere."
      },
      {
       "h": "Getter, setter e informazione nascosta",
       "text": "Per leggere e modificare gli attributi, la classe Animal offre metodi dedicati: get_age() restituisce l'età, set_name(nome) cambia il nome. Si chiamano getter e setter. Perché non scrivere direttamente a.age? Per l'occultamento dell'informazione (information hiding). Supponi che l'autore della classe decida di memorizzare l'età in un attributo chiamato years invece di age, e aggiorni get_age di conseguenza. Il codice che usa a.get_age() continua a funzionare; quello che legge a.age si rompe. Python, va detto, è debole su questo fronte: permette di leggere e scrivere qualsiasi attributo dall'esterno, perfino a.age = 'infinito', e di aggiungerne di nuovi, come a.taglia = 'piccola'. La lezione lo definisce cattivo stile. Per convenzione, un nome che inizia con un trattino basso segnala un dettaglio interno da non toccare. Un'altra comodità vista qui sono gli argomenti predefiniti: con def set_name(self, nome=''), chiamare a.set_name() senza argomenti usa la stringa vuota."
      },
      {
       "h": "Gerarchie: genitori e figli",
       "text": "Le classi si possono organizzare in gerarchie. Una classe genitore, detta superclasse (superclass), come Animal, può avere classi figlie, dette sottoclassi (subclass), come Cat e Rabbit; a sua volta Person, figlia di Animal, ha come figlia Student. Una sottoclasse eredita tutti i dati e i comportamenti del genitore, e in più può aggiungere attributi e metodi nuovi oppure ridefinire quelli esistenti, un'operazione chiamata override. Si scrive class Cat(Animal):, mettendo il genitore tra parentesi. Nella lezione Cat aggiunge il metodo speak, che stampa meow, e ridefinisce __str__; non definisce __init__, quindi usa quello di Animal. Un gatto sa dunque parlare, un generico animale no: chiamare speak su un'istanza di Animal dà errore. Quando chiami un metodo, Python lo cerca prima nella classe dell'oggetto; se non lo trova risale al genitore, poi al nonno, e usa il primo che incontra. Per questo un metodo ridefinito nella sottoclasse vince su quello omonimo più in alto."
      },
      {
       "h": "Riusare e ridefinire",
       "text": "Spesso una sottoclasse vuole fare tutto ciò che fa il genitore, più qualcosa. Nella lezione Person ha un proprio __init__ che riceve nome ed età: prima chiama Animal.__init__(self, age), per riusare l'inizializzazione del genitore, poi imposta il nome e crea una lista vuota di amici. Aggiunge metodi per gestire gli amici, calcolare la differenza di età con un'altra persona, e ridefinisce speak perché stampi hello. Student, figlia di Person, aggiunge l'indirizzo di studio, un metodo per cambiarlo e una propria versione di speak che sceglie a caso una tra quattro frasi, come «i have homework». Nel Python di oggi la chiamata al genitore si scrive spesso super().__init__(nome, eta), che ottiene lo stesso effetto senza ripetere il nome della superclasse. Pensa a un gestionale del personale: Dipendente ha nome e stipendio; Agente, sua sottoclasse, aggiunge la percentuale di provvigione e ridefinisce il calcolo del compenso. Copiare il codice del genitore invece di richiamarlo è l'errore da evitare."
      },
      {
       "h": "Variabili di classe e operatori su misura",
       "text": "Finora ogni istanza aveva i propri attributi. Una variabile di classe (class variable), invece, è definita nella classe fuori da ogni metodo ed è condivisa da tutte le istanze. La lezione la usa per dare un identificativo unico a ogni coniglio: Rabbit ha tag = 1, e in __init__ ogni nuovo coniglio prende rid = Rabbit.tag, poi Rabbit.tag += 1. Il primo coniglio riceve 1, il secondo 2, e così via, come la numerazione progressiva delle fatture. Poi la lezione ridefinisce gli operatori. Con __add__, r1 + r2 crea un nuovo coniglio di età 0 che ha r1 e r2 come genitori. Con __eq__ due conigli sono uguali se hanno gli stessi genitori, in qualunque ordine, confrontando i loro identificativi. Qui c'è una trappola istruttiva: confrontare direttamente i genitori con == richiamerebbe __eq__ sui genitori, poi sui nonni, risalendo fino ai primi conigli, che non hanno genitori, e il programma si fermerebbe con un errore. Confrontare gli identificativi, che sono numeri, evita il problema."
      }
     ],
     "keyPoints": [
      "La classe definisce in modo generico dati e metodi; ogni istanza ha i propri valori.",
      "Getter e setter proteggono chi usa la classe dai cambiamenti interni; Python però non impedisce l'accesso diretto.",
      "Una sottoclasse eredita tutto dalla superclasse e può aggiungere o ridefinire attributi e metodi.",
      "Python cerca un metodo prima nella classe dell'oggetto e poi risale la gerarchia: vince il primo trovato.",
      "Per riusare l'inizializzazione del genitore si chiama Genitore.__init__(self, ...) oppure super().__init__(...).",
      "Le variabili di classe sono condivise da tutte le istanze, utili per esempio per numerare gli oggetti in modo progressivo."
     ],
     "terms": [
      {
       "t": "Superclasse (superclass)",
       "d": "Classe genitore da cui altre classi ereditano dati e metodi."
      },
      {
       "t": "Sottoclasse (subclass)",
       "d": "Classe figlia che eredita da una superclasse e può aggiungere o ridefinire comportamenti."
      },
      {
       "t": "Ereditarietà (inheritance)",
       "d": "Meccanismo per cui una classe riceve automaticamente attributi e metodi di un'altra."
      },
      {
       "t": "Override",
       "d": "Ridefinizione in una sottoclasse di un metodo già presente nella superclasse, che prende il suo posto."
      },
      {
       "t": "Getter e setter",
       "d": "Metodi che leggono e modificano gli attributi di un oggetto senza accedervi direttamente."
      },
      {
       "t": "Information hiding",
       "d": "Principio per cui i dettagli interni di una classe restano nascosti e si usa solo la sua interfaccia."
      },
      {
       "t": "Variabile di classe",
       "d": "Variabile definita nella classe e condivisa da tutte le istanze, a differenza delle variabili d'istanza."
      },
      {
       "t": "Argomento predefinito",
       "d": "Valore assegnato a un parametro nella definizione, usato quando la chiamata non lo specifica."
      }
     ],
     "quiz": [
      {
       "q": "Gatto eredita da Animale e non definisce __init__. Che cosa succede con g = Gatto(3)?",
       "options": [
        "Errore: manca __init__",
        "Viene usato l'__init__ di Animale",
        "g viene creato senza alcun attributo",
        "Python crea un __init__ vuoto e l'età va persa"
       ],
       "answer": 1,
       "why": "Python cerca il metodo prima in Gatto e, non trovandolo, risale alla classe genitore Animale e usa quello. È questo meccanismo di ricerca lungo la gerarchia che rende utile l'ereditarietà: si scrive una volta e si riusa nei figli."
      },
      {
       "q": "Animale ha speak() che stampa '...'; Persona, sua sottoclasse, ridefinisce speak() per stampare 'ciao'. Che cosa stampa speak() su uno Studente, sottoclasse di Persona che non definisce speak()?",
       "options": [
        "'...'",
        "Un errore",
        "Niente",
        "'ciao'"
       ],
       "answer": 3,
       "why": "La ricerca parte dalla classe dell'oggetto e risale: Studente non ha speak, Persona sì, e il primo trovato vince. Animale non viene neppure consultata. Pensare che vinca la classe più in alto è l'errore tipico."
      },
      {
       "q": "Perché è preferibile usare a.get_eta() invece di leggere direttamente a.eta?",
       "options": [
        "Perché è più veloce",
        "Perché se l'autore della classe cambia il modo in cui memorizza l'età, il getter continua a funzionare mentre l'accesso diretto si rompe",
        "Perché Python vieta l'accesso diretto agli attributi",
        "Perché a.eta restituisce sempre None"
       ],
       "answer": 1,
       "why": "Il getter fa parte dell'interfaccia, che l'autore si impegna a mantenere; il nome dell'attributo interno no. Python in realtà non vieta l'accesso diretto, ed è proprio per questo che serve disciplina."
      },
      {
       "q": "La classe Fattura ha la variabile di classe prossimo = 1; __init__ fa self.numero = Fattura.prossimo e poi Fattura.prossimo += 1. Che numero ha la terza fattura creata?",
       "options": [
        "1",
        "4",
        "3",
        "0"
       ],
       "answer": 2,
       "why": "La variabile di classe è condivisa: la prima fattura prende 1 e porta il contatore a 2, la seconda prende 2, la terza 3. Il contatore ora vale 4, ma quello sarà il numero della prossima fattura, non della terza."
      },
      {
       "q": "Agente è sottoclasse di Dipendente. Nel suo __init__ vuoi riusare l'inizializzazione del genitore e aggiungere la provvigione. Come fai?",
       "options": [
        "Chiami Dipendente.__init__(self, nome), oppure super().__init__(nome), e poi imposti self.provvigione",
        "Copi tutto il codice di Dipendente dentro Agente",
        "Non serve nulla: provvigione si crea da sola",
        "Crei un oggetto Dipendente dentro ogni Agente"
       ],
       "answer": 0,
       "why": "Richiamare l'__init__ del genitore riusa la sua logica, e poi si aggiunge solo ciò che è nuovo. Copiare il codice funziona, ma duplica la logica: se un giorno cambia Dipendente, Agente resta indietro."
      }
     ],
     "explain": "Spiega a un amico come Python decide quale metodo usare quando una sottoclasse e la sua superclasse hanno un metodo con lo stesso nome.",
     "apply": "Disegna una piccola gerarchia di classi per il tuo ambito di lavoro: una classe generale e due sottoclassi, per esempio due famiglie di prodotti o due ruoli in azienda. Per ogni sottoclasse scrivi un attributo aggiunto e un metodo che si comporta in modo diverso."
    }
   ]
  },
  {
   "id": "neuro-mit-913",
   "faculty": "neuroscienze",
   "title": "Il cervello umano",
   "level": 2,
   "summary": "Un viaggio nella mente guidato da Nancy Kanwisher, la neuroscienziata del MIT che ha scoperto l'area del cervello dedicata ai volti. Si parte da anatomia e metodi (fMRI, lesioni, elettrodi, TMS) e si arriva a volti, luoghi, numeri, suoni, musica, linguaggio, pensiero sugli altri e consapevolezza. Alla fine saprai leggere con occhio critico una notizia sulla «zona del cervello che fa X» e capire che cosa un esperimento può davvero dimostrare.",
   "source": {
    "inst": "MIT OpenCourseWare",
    "code": "9.13",
    "title": "The Human Brain",
    "prof": "Nancy Kanwisher",
    "year": "Primavera 2019",
    "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/",
    "license": "CC BY-NC-SA 4.0",
    "lang": "inglese, con trascrizioni delle lezioni"
   },
   "extra": [
    {
     "title": "Elenco delle video lezioni di 9.13",
     "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/video_galleries/lecture-videos/",
     "what": "Tutte le lezioni registrate del corso, in ordine, con video e trascrizione"
    },
    {
     "title": "Nancy Kanwisher: A neural portrait of the human mind (TED 2014)",
     "url": "https://www.ted.com/talks/nancy_kanwisher_a_neural_portrait_of_the_human_mind",
     "what": "Talk di circa 17 minuti: la docente racconta la mappa delle regioni specializzate usando il proprio cervello"
    },
    {
     "title": "Nancy's Brain Talks (MIT OCW RES.9-004)",
     "url": "https://ocw.mit.edu/courses/res-9-004-nancys-brain-talks-fall-2022",
     "what": "Brevi video della docente sui metodi per studiare mente e cervello, pensati per chi parte da zero"
    },
    {
     "title": "Letture assegnate del corso",
     "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/pages/readings/",
     "what": "Gli articoli scientifici discussi settimana per settimana, per chi vuole andare alle fonti"
    }
   ],
   "lessons": [
    {
     "id": "neuro-mit-913-01",
     "title": "Perché studiare il cervello",
     "minutes": 10,
     "watch": {
      "label": "Lezione 1: Introduction (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-1-introduction/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 1 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l01/"
      }
     ],
     "sections": [
      {
       "h": "La storia di Bob",
       "text": "Il corso si apre con una storia vera. Bob, un caro amico di Nancy Kanwisher, crolla a terra una mattina nella casa di lei a Cambridge. In ospedale non trovano nulla di strano al cuore, ma la sera arriva la notizia: c'è una massa nel cervello. Kanwisher ricorda che anni prima il suo laboratorio aveva fatto una risonanza a Bob, recupera le immagini e scopre che allora c'era già un piccolo nodulo, grande come un acino d'uva, proprio accanto all'area paraippocampale dei luoghi (parahippocampal place area, PPA), una regione scoperta dal suo gruppo. Ora era grande come un lime. Era un meningioma, un tumore non maligno ma da asportare. Prima dell'intervento Kanwisher chiede a Bob di disegnare la pianta di casa sua: ne esce un groviglio di linee. Una bicicletta e un'aragosta, invece, le disegna benissimo. Dopo l'operazione Bob torna al lavoro in pochi giorni, intelligente e spiritoso come prima, ma il senso dell'orientamento non tornerà più: per muoversi in posti nuovi usa il navigatore del telefono."
      },
      {
       "h": "Che cosa ci insegna Bob",
       "text": "La storia contiene in piccolo le idee di tutto il corso. Primo: il cervello ha parti specializzate. Bob non ha perso «un po' di intelligenza» in generale, ha perso una capacità precisa, quella di ricostruire la disposizione dello spazio intorno a sé, mentre riconosce oggetti, ragiona e scherza come sempre. Secondo: un adulto recupera molto meno di un bambino dopo un danno cerebrale, un tema che tornerà nella lezione sullo sviluppo. Terzo: per capire che cosa era successo sono serviti metodi diversi, ognuno con un pezzo della risposta: test di comportamento come il disegno, immagini anatomiche per vedere la massa, risonanza funzionale per sapere dove si trovava la regione dei luoghi, osservazione del paziente nel tempo. Un errore tipico è pensare che un singolo metodo basti a spiegare una funzione. In realtà ogni tecnica vede solo un aspetto, e le conclusioni solide nascono quando metodi diversi puntano nella stessa direzione."
      },
      {
       "h": "Quattro buone ragioni",
       "text": "Perché dedicare un corso al cervello? La prima ragione è conoscere sé stessi: un trapianto di cuore ha senso, un trapianto di cervello no, perché chi si sveglia dopo l'operazione sarebbe il donatore. Il cervello è la sede di ciò che siamo. La seconda è capire i limiti della conoscenza umana: studiare come la mente costruisce le sue certezze aiuta a capire quanto fidarci di esse. La terza riguarda l'intelligenza artificiale. Nel 2012 la rete neurale profonda (deep neural network) AlexNet, addestrata su oltre un milione di immagini del database ImageNet, ha segnato una svolta nel riconoscimento di oggetti. Eppure, quando colleghi di Kanwisher al MIT hanno messo alla prova reti come ResNet con foto più varie e insolite, la precisione è scesa da circa il 71% a circa il 25%. Le reti riconoscono bene gli schemi visti in addestramento, ma non costruiscono un modello del mondo come facciamo noi. La quarta ragione è la più semplice: capire come un organo di poco più di un chilo produce pensieri è forse la più grande impresa intellettuale che ci sia."
      },
      {
       "h": "Le due domande del corso",
       "text": "Il cervello si può studiare a molti livelli: molecole, singoli neuroni, circuiti, regioni, reti di regioni. Questo corso sceglie il livello in cui il cervello incontra la mente, e per ogni capacità mentale pone sempre due domande. La prima: esiste un macchinario dedicato a questa funzione, oppure la svolge un sistema generico? La seconda: quali informazioni vengono rappresentate, quando e in che modo? Per dare un'idea di quanto si è avanzati, Kanwisher ricorda che nel 1990 si conoscevano bene solo le aree sensoriali e motorie primarie, le aree del linguaggio individuate nell'Ottocento da Broca e Wernicke, un sospetto di zona dei volti nell'emisfero destro e alcune aree parietali legate all'attenzione. Oggi, soprattutto grazie alla risonanza magnetica funzionale, abbiamo una mappa approssimativa di decine di regioni. Il limite, dichiarato apertamente, è che il corso lascia fuori molto: controllo motorio, gran parte delle strutture sottocorticali e la memoria."
      },
      {
       "h": "Come si legge un articolo scientifico",
       "text": "Il corso non usa un manuale: si leggono circa due articoli di ricerca a settimana, quasi tutti recenti. Kanwisher suggerisce di affrontarli con cinque domande in testa. Quale domanda si pone lo studio? Che cosa è stato trovato? Come lo interpretano gli autori e perché è importante? Com'era costruito l'esperimento? Come sono stati analizzati i dati? Le prime tre risposte stanno spesso nel riassunto iniziale, le ultime due richiedono di scavare nei metodi. Un esempio pratico: leggi su un giornale che «gli scienziati hanno trovato l'area del cervello dell'amore». Applicando le cinque domande ti chiederai subito con che cosa hanno confrontato le foto della persona amata, quanti partecipanti c'erano e se il risultato dimostra davvero una funzione o solo un'attivazione. Non serve conoscere la fisica della risonanza, ma serve un po' di statistica di base. E serve pazienza: un articolo di tre pagine può richiedere ore per essere capito davvero."
      }
     ],
     "keyPoints": [
      "Il cervello ha parti specializzate: un danno può togliere una sola capacità lasciando intatte le altre, come nel caso di Bob.",
      "Gli adulti recuperano meno dei bambini dopo un danno cerebrale.",
      "Nessun metodo basta da solo: comportamento, immagini, registrazioni e pazienti danno pezzi diversi della risposta.",
      "Per ogni funzione il corso chiede: esiste un macchinario dedicato? Quali informazioni rappresenta, quando e come?",
      "Le reti neurali artificiali riconoscono schemi ma generalizzano male a immagini insolite: il cervello resta un modello da capire.",
      "Un articolo si legge chiedendosi domanda, risultato, interpretazione, disegno sperimentale e analisi."
     ],
     "terms": [
      {
       "t": "Specializzazione funzionale",
       "d": "L'idea che alcune regioni del cervello siano dedicate a una funzione precisa, come riconoscere volti o luoghi."
      },
      {
       "t": "PPA (parahippocampal place area)",
       "d": "Area paraippocampale dei luoghi: regione sulla faccia inferiore del cervello che risponde a scene e ambienti più che a oggetti o volti."
      },
      {
       "t": "Meningioma",
       "d": "Tumore di solito benigno che nasce dalle meningi, le membrane che avvolgono il cervello; cresce lentamente ma può comprimere il tessuto vicino."
      },
      {
       "t": "Neuropsicologia",
       "d": "Studio dei pazienti con danni cerebrali per capire quali capacità dipendono da quali regioni."
      },
      {
       "t": "Psicofisica",
       "d": "Metodo che misura che cosa le persone percepiscono, con quanta precisione e in quanto tempo, presentando stimoli controllati."
      },
      {
       "t": "Rete neurale profonda (deep neural network)",
       "d": "Programma composto da molti strati di unità artificiali che impara da grandi quantità di esempi, per esempio a riconoscere oggetti nelle foto."
      }
     ],
     "quiz": [
      {
       "q": "Prima dell'intervento Bob disegna bene una bicicletta ma non riesce a disegnare la pianta di casa sua. Che cosa suggerisce questo contrasto?",
       "options": [
        "Un calo generale dell'intelligenza dovuto al tumore",
        "Un deficit specifico per la disposizione spaziale dei luoghi",
        "Un problema della vista che rende difficile disegnare",
        "Una perdita generale della memoria a lungo termine"
       ],
       "answer": 1,
       "why": "Se il problema fosse generale (intelligenza, vista, memoria) anche la bicicletta e l'aragosta sarebbero venute male. Il contrasto tra oggetti ben disegnati e luoghi confusi indica un deficit selettivo per lo spazio, coerente con la posizione della massa vicino alla PPA."
      },
      {
       "q": "Perché, secondo Kanwisher, un trapianto di cervello non avrebbe senso mentre uno di cuore sì?",
       "options": [
        "Perché il cervello è troppo delicato per essere operato",
        "Perché il sistema immunitario rigetterebbe sempre il cervello",
        "Perché il cervello non si può collegare al midollo spinale",
        "Perché il cervello è la sede dell'identità: chi si sveglia sarebbe il donatore"
       ],
       "answer": 3,
       "why": "L'argomento non è tecnico ma concettuale: il cuore è una pompa sostituibile, il cervello contiene ricordi, personalità e pensieri. Le opzioni sulla difficoltà chirurgica confondono un limite pratico con il punto filosofico."
      },
      {
       "q": "Una rete neurale riconosce il 71% delle foto di un database standard ma solo il 25% di foto di oggetti in pose e contesti insoliti. Qual è la lettura più corretta?",
       "options": [
        "La rete ha imparato regolarità delle immagini di addestramento ma non un modello flessibile degli oggetti",
        "La rete è difettosa e va semplicemente riaddestrata da capo",
        "Le foto insolite sono sfocate e nessuno potrebbe riconoscerle",
        "Il calo dimostra che le reti artificiali funzionano esattamente come il cervello"
       ],
       "answer": 0,
       "why": "Noi riconosciamo una sedia anche capovolta o in un posto strano perché capiamo che cos'è una sedia. Il crollo della precisione mostra che la rete si appoggia agli schemi tipici delle foto viste, non che sia rotta o che le immagini siano irriconoscibili."
      },
      {
       "q": "Un titolo dice: «Trovata l'area del cervello della gelosia». Quale domanda, tra quelle suggerite dal corso, conviene porsi per prima?",
       "options": [
        "Quanto costa una risonanza magnetica",
        "Con quale condizione di controllo è stata confrontata la gelosia",
        "Se la gelosia è un sentimento positivo o negativo",
        "Quante aree del cervello esistono in totale"
       ],
       "answer": 1,
       "why": "Un'attivazione ha senso solo rispetto a un confronto. Senza sapere con che cosa è stata paragonata la condizione «gelosia», non si può dire se l'area risponde a quella emozione o a qualcosa di più generico come l'attenzione o l'emozione in sé."
      },
      {
       "q": "Quale di queste NON è una delle due domande guida che il corso pone per ogni funzione mentale?",
       "options": [
        "Esiste un macchinario cerebrale dedicato a questa funzione?",
        "Quali informazioni vengono rappresentate?",
        "Quali molecole precise sono coinvolte nella funzione?",
        "Quando e in che modo l'informazione viene elaborata?"
       ],
       "answer": 2,
       "why": "Il corso lavora al livello delle regioni e delle rappresentazioni, non a quello molecolare. Le altre tre opzioni riprendono le due domande guida: specializzazione e natura delle rappresentazioni nel tempo."
      }
     ],
     "explain": "Spiega a un amico, usando la storia di Bob, perché perdere una capacità mentale non significa per forza diventare meno intelligenti.",
     "apply": "Cerca online una notizia del tipo «scoperta l'area del cervello di...». Rispondi per iscritto alle cinque domande di Kanwisher: domanda, risultato, interpretazione, disegno, analisi. Annota quali risposte l'articolo non ti dà."
    },
    {
     "id": "neuro-mit-913-02",
     "title": "Neuroanatomia di base",
     "minutes": 11,
     "watch": {
      "label": "Lezione 2: Neuroanatomy (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-2-neuroanatomy/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 2 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l02/"
      }
     ],
     "sections": [
      {
       "h": "Neuroni, fili e consumi",
       "text": "Il cervello umano contiene circa cento miliardi di neuroni. Ogni neurone ha un corpo cellulare, dei dendriti corti che raccolgono segnali e un assone, un prolungamento che può essere lunghissimo e porta il segnale lontano. Molti assoni sono rivestiti di mielina, una guaina grassa che rende la conduzione molto più veloce. Ogni neurone forma migliaia di sinapsi con altri neuroni, quindi i collegamenti totali sono un numero astronomico. Eppure tutto questo funziona con circa 20 watt, meno di una lampadina. Kanwisher lo confronta con il supercomputer Watson di IBM, che per giocare a un quiz televisivo consumava circa 20.000 watt. Questo divario ricorda che il cervello non è solo potente ma anche straordinariamente efficiente, e che l'efficienza energetica è un vincolo che ha plasmato la sua architettura. Un errore comune è immaginare il cervello come una massa uniforme di cellule: in realtà circa il 45% del suo volume è sostanza bianca, cioè fasci di assoni che collegano regioni lontane."
      },
      {
       "h": "Tronco encefalico, cervelletto e talamo",
       "text": "Il tronco encefalico è il punto in cui il midollo spinale entra nel cervello. È la parte più antica, condivisa con animali molto lontani da noi, e regola respirazione, temperatura e stati di veglia. Si può sopravvivere perdendo gran parte della corteccia, ma non senza tronco encefalico. Dietro, c'è il cervelletto, con il suo aspetto a cavolfiore: serve soprattutto alla coordinazione dei movimenti. Le risonanze lo mostrano attivo anche durante compiti di linguaggio o percezione, ma i casi rari di persone nate senza cervelletto, che camminano tardi e con goffaggine ma per il resto se la cavano, suggeriscono che non sia indispensabile per quelle funzioni. Al centro del cervello si trova il talamo, la «stazione centrale»: vista, udito e tatto vi fanno tappa prima di raggiungere la corteccia. Per la vista la stazione si chiama nucleo genicolato laterale (LGN). Unica eccezione è l'olfatto, che arriva direttamente alla sua corteccia. Attenzione però a pensare al talamo come a un semplice ripetitore: dalla corteccia visiva al talamo tornano circa dieci volte più fibre di quante ne salgano."
      },
      {
       "h": "Ippocampo e amigdala",
       "text": "L'ippocampo, una struttura ricurva presente in entrambi gli emisferi, è essenziale per la memoria degli episodi. Il paziente H.M., a cui negli anni Cinquanta furono asportati entrambi gli ippocampi per curare l'epilessia, non riuscì più a formare ricordi nuovi, pur conservando molti ricordi precedenti. Un caso più recente è quello di Lonni Sue Johnson, illustratrice che aveva firmato copertine del New Yorker, pilota e agricoltrice: dopo un'encefalite virale non ricorda più quasi nessun evento della sua vita, ma personalità, intelligenza e capacità di dipingere sono intatte. L'ippocampo ha anche un ruolo chiave nell'orientamento, come vedremo. L'amigdala, il cui nome viene dal greco «mandorla» per forma e dimensioni, è coinvolta nelle emozioni, soprattutto nella paura. La paziente SM, che l'ha persa su entrambi i lati, non prova paura, non riconosce la paura sui volti altrui ed è eccessivamente fiduciosa verso gli sconosciuti, mentre riconosce normalmente chi ha davanti e ha un quoziente intellettivo nella norma. Sono esempi di quanto possa essere selettiva la perdita di una funzione."
      },
      {
       "h": "La corteccia e le sue mappe",
       "text": "La corteccia è un foglio ripiegato, spesso pochi millimetri e grande, se lo si stende, più o meno come una pizza gigante. Le aree primarie sono le prime stazioni corticali dei sensi: visiva sul retro, uditiva sulla parte superiore del lobo temporale, somatosensoriale per il tatto, con la corteccia motoria subito davanti. Molte sono organizzate come mappe. Ogni neurone visivo risponde a una piccola porzione del campo visivo, il suo campo recettivo (receptive field), e neuroni vicini hanno campi recettivi vicini: è la retinotopia. Roger Tootell lo mostrò in modo spettacolare facendo fissare a una scimmia un bersaglio a cerchi concentrici dopo averle iniettato una sostanza simile al glucosio che si accumula nelle cellule attive. Stendendo poi la corteccia visiva, il bersaglio vi compariva disegnato. Anche il tatto ha una mappa del corpo, in cui mani e labbra occupano molto più spazio della schiena, e l'udito ha una mappa delle frequenze, dai suoni gravi agli acuti. Un errore tipico è credere che tutto ciò che sta fuori dalle aree primarie sia indifferenziato: è solo meno conosciuto."
      },
      {
       "h": "Che cosa rende un'area un'area: il caso MT",
       "text": "Quando una porzione di corteccia merita il nome di area? Kanwisher propone tre criteri: una funzione diversa da quella delle zone vicine, un'impronta di connessioni distintiva (connectivity fingerprint) e un aspetto diverso al microscopio. Il neurologo Korbinian Brodmann, all'inizio del Novecento, distinse 52 aree solo in base all'aspetto delle cellule. L'esempio più chiaro dopo le aree primarie è MT, una piccola zona sul lato del cervello specializzata nel movimento. Nella scimmia i suoi neuroni rispondono a uno stimolo che si muove in una certa direzione e poco alle altre. Stimolare elettricamente un gruppo di questi neuroni sposta la direzione che l'animale dichiara di vedere: è una prova causale, non solo una correlazione. Anche l'effetto cascata, per cui dopo aver fissato un movimento una scena ferma sembra muoversi al contrario, rivela popolazioni di neuroni sintonizzate su direzioni diverse. Infine c'è la prova dei pazienti: una donna con danno in questa regione soffriva di acinetopsia, cioè non percepiva il movimento, e faticava ad attraversare la strada o a versare l'acqua in un bicchiere senza farlo traboccare."
      }
     ],
     "keyPoints": [
      "Il cervello ha circa cento miliardi di neuroni, migliaia di sinapsi per neurone e consuma circa 20 watt.",
      "Il tronco encefalico è vitale; il cervelletto coordina i movimenti; il talamo smista i segnali dei sensi verso la corteccia, tranne l'olfatto.",
      "L'ippocampo serve alla memoria degli episodi e all'orientamento; l'amigdala alla paura e al riconoscerla negli altri.",
      "Le aree primarie sono organizzate come mappe: dello spazio visivo, del corpo, delle frequenze sonore.",
      "Un'area si definisce per funzione, connessioni e struttura microscopica; MT, l'area del movimento, soddisfa tutti e tre i criteri.",
      "Registrare l'attività mostra una correlazione; stimolare o osservare lesioni permette di parlare di causa."
     ],
     "terms": [
      {
       "t": "Mielina",
       "d": "Guaina grassa che avvolge molti assoni e rende più veloce la trasmissione del segnale nervoso."
      },
      {
       "t": "Sostanza bianca",
       "d": "Parte del cervello fatta di fasci di assoni mielinizzati che collegano regioni lontane; circa il 45% del volume."
      },
      {
       "t": "Talamo",
       "d": "Struttura centrale che fa da stazione di smistamento per i segnali sensoriali diretti alla corteccia."
      },
      {
       "t": "Campo recettivo (receptive field)",
       "d": "La porzione di spazio visivo, o di corpo, in cui uno stimolo fa rispondere un certo neurone."
      },
      {
       "t": "Retinotopia",
       "d": "Organizzazione per cui punti vicini nell'immagine sulla retina sono elaborati da punti vicini nella corteccia visiva."
      },
      {
       "t": "Area MT",
       "d": "Regione della corteccia visiva specializzata nel movimento, con neuroni selettivi per la direzione."
      },
      {
       "t": "Acinetopsia",
       "d": "Incapacità di percepire il movimento dopo un danno cerebrale: il mondo appare come una serie di istantanee."
      }
     ],
     "quiz": [
      {
       "q": "Un paziente perde gran parte della corteccia di un emisfero e sopravvive; un altro subisce un danno esteso al tronco encefalico. Che cosa è più probabile?",
       "options": [
        "Il secondo è in pericolo di vita perché il tronco regola respirazione e veglia",
        "Entrambi hanno la stessa prognosi perché il danno è esteso",
        "Il primo è in maggior pericolo perché la corteccia è la parte più grande",
        "Nessuno dei due ha conseguenze se il cervelletto è intatto"
       ],
       "answer": 0,
       "why": "Il tronco encefalico controlla funzioni vitali come il respiro: senza di esso non si sopravvive. La corteccia è più grande, ma la dimensione non dice quanto una struttura sia indispensabile alla vita."
      },
      {
       "q": "Una persona ha perso l'olfatto dopo un piccolo ictus, ma il talamo risulta intatto. Perché questo non è contraddittorio?",
       "options": [
        "Perché il talamo elabora solo il movimento",
        "Perché l'olfatto è l'unico senso che raggiunge la corteccia senza passare dal talamo",
        "Perché l'olfatto dipende solo dal cervelletto",
        "Perché il talamo serve solo alla memoria"
       ],
       "answer": 1,
       "why": "Vista, udito e tatto fanno tappa nel talamo, l'olfatto no: arriva direttamente alla corteccia olfattiva. Quindi un danno all'olfatto può avvenire con il talamo integro."
      },
      {
       "q": "La paziente SM non prova paura e non la riconosce sui volti, ma riconosce normalmente le persone che conosce. Che cosa indica questo caso?",
       "options": [
        "Che il riconoscimento dei volti dipende dall'amigdala",
        "Che l'amigdala controlla l'intelligenza generale",
        "Che paura e riconoscimento dell'identità dipendono da sistemi diversi",
        "Che SM ha un problema di vista"
       ],
       "answer": 2,
       "why": "Se un danno toglie la paura ma lascia intatto il riconoscimento dell'identità, le due funzioni non possono dipendere dallo stesso meccanismo. Un problema di vista colpirebbe anche il riconoscimento delle persone."
      },
      {
       "q": "Dopo aver fissato per un minuto una cascata, guardi una roccia ferma e ti sembra salire. Che cosa rivela questa illusione sul cervello?",
       "options": [
        "Che gli occhi si sono stancati e vedono sfocato",
        "Che la corteccia visiva primaria si è spenta",
        "Che la roccia si muove davvero in modo impercettibile",
        "Che esistono neuroni sintonizzati su direzioni diverse e quelli più usati si sono adattati"
       ],
       "answer": 3,
       "why": "I neuroni che rispondono al movimento verso il basso si affaticano; quando lo stimolo si ferma prevalgono quelli per la direzione opposta. Per questo Kanwisher la chiama «elettrodo dello psicofisico»: rivela popolazioni di neuroni senza aprire il cranio."
      },
      {
       "q": "In una scimmia, stimolare elettricamente un gruppo di neuroni di MT cambia la direzione di movimento che l'animale riferisce. Perché questo dato è più forte di una semplice registrazione?",
       "options": [
        "Perché mostra che quei neuroni hanno un ruolo causale nella percezione del movimento",
        "Perché la stimolazione è più economica della registrazione",
        "Perché registra più neuroni contemporaneamente",
        "Perché dimostra che MT è presente anche negli esseri umani"
       ],
       "answer": 0,
       "why": "Registrare dice che i neuroni rispondono al movimento, stimolare dice che la loro attività modifica ciò che l'animale percepisce. Il passaggio da correlazione a causa è il punto chiave; la presenza di MT nell'uomo si dimostra con altri metodi."
      }
     ],
     "explain": "Spiega a un amico perché il talamo non è un semplice ripetitore e perché l'olfatto fa eccezione.",
     "apply": "Prova l'effetto cascata: guarda per 60 secondi un video di una cascata o di titoli di coda che scorrono, poi sposta lo sguardo su un muro o un libro. Descrivi che cosa vedi e collega l'effetto ai neuroni selettivi per la direzione."
    },
    {
     "id": "neuro-mit-913-03",
     "title": "Riconoscere i volti: le domande e la fMRI",
     "minutes": 11,
     "watch": {
      "label": "Lezione 4: Cognitive Neuroscience Methods I (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-4-cognitive-neuroscience-methods-i/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 4 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l04/"
      }
     ],
     "sections": [
      {
       "h": "I tre livelli di David Marr",
       "text": "Prima di chiedersi dove il cervello fa qualcosa, bisogna chiedersi che cosa sta calcolando e perché. È la lezione dello scienziato David Marr, che negli anni Settanta propose tre livelli di analisi. Il primo è la teoria computazionale: qual è il problema da risolvere, quali sono gli ingressi e le uscite, che cosa lo rende difficile. Il secondo è l'algoritmo: con quale strategia e con quale codice interno si risolve il problema. Il terzo è l'implementazione: quali neuroni e quali circuiti lo realizzano. Marr usava un paragone: studiare solo i neuroni per capire la percezione è come studiare le piume per capire il volo degli uccelli. Le piume contano, ma il volo si capisce con l'aerodinamica. Un esempio è il movimento: da pochi punti luminosi applicati alle articolazioni di una persona al buio riconosciamo subito che qualcuno cammina, salta o forse è stanco. Capire quante informazioni contiene il movimento è il primo passo per capire che cosa deve fare il cervello. Saltare questo passo e andare subito alle immagini cerebrali è un errore frequente."
      },
      {
       "h": "Problemi mal posti: il caso del colore",
       "text": "La luce che arriva all'occhio da un oggetto dipende da due cose: quanto la superficie riflette e di che colore è la luce che la illumina. Il cervello riceve solo il prodotto, come se dovesse risolvere A per B uguale 48 senza conoscere né A né B. È un problema mal posto (ill-posed problem): ha infinite soluzioni possibili. Per risolverlo il sistema visivo usa ipotesi sul mondo, per esempio stimando il colore della luce dagli altri indizi della scena. Rosa Lafer-Sousa, del laboratorio di Kanwisher, lo mostra con foto di automobili che sembrano rosse, verdi, blu o gialle mentre la carrozzeria è grigia in tutte: il cervello attribuisce il colore all'auto dopo aver stimato l'illuminazione della scena. Lo stesso meccanismo spiega perché nel 2015 una foto di un vestito divise il mondo tra chi lo vedeva blu e nero e chi bianco e oro. Quasi tutta la percezione funziona così, dalla forma tridimensionale ricavata da un'immagine piatta fino al bambino che sente una parola nuova e deve indovinare a che cosa si riferisce."
      },
      {
       "h": "Perché i volti sono difficili",
       "text": "I volti sono il caso di studio del corso. Circa il 2% delle persone ha una prosopagnosia evolutiva (developmental prosopagnosia): non riconosce bene i volti, a volte nemmeno quelli dei familiari, pur avendo vista e intelligenza normali. All'estremo opposto ci sono i super-riconoscitori, alcuni dei quali sono stati impiegati dalla polizia di Londra. Il problema computazionale è enorme: la stessa persona cambia con la luce, l'angolazione, il taglio di capelli, l'espressione, il trucco. Uno studio di Rob Jenkins e colleghi ha dato a partecipanti britannici venti foto di due politici olandesi chiedendo di dividerle per persona: in media hanno fatto circa sette mucchi e mezzo invece di due. Gli olandesi, che conoscevano quei volti, li hanno separati senza fatica. La conclusione è che riconosciamo bene i volti familiari, non i volti in generale. È una lezione utile anche nella vita reale: confrontare una persona sconosciuta con una foto, come ai controlli di frontiera o con un documento, è molto più difficile di quanto pensiamo, anche per i professionisti."
      },
      {
       "h": "Come funziona la risonanza funzionale",
       "text": "La risonanza magnetica funzionale (fMRI) usa la stessa macchina della risonanza clinica, ma misura l'attività del cervello nel tempo. Il segnale si chiama BOLD (blood oxygenation level dependent). Quando un gruppo di neuroni lavora, arriva più sangue del necessario: l'afflusso supera il consumo di ossigeno, così nella zona attiva aumenta l'emoglobina ossigenata. Emoglobina ossigenata e non ossigenata hanno proprietà magnetiche diverse e lo scanner rileva la differenza. Il metodo ha pregi e limiti precisi. È il modo non invasivo con la migliore risoluzione spaziale, circa un millimetro, ma è lento: la risposta del sangue arriva dopo circa sei secondi. È una misura indiretta, perché non sappiamo esattamente quale attività neurale la produca. Ed è relativa: il valore in una singola condizione non significa nulla, contano solo i confronti tra condizioni. Inoltre ogni voxel, il «pixel» tridimensionale dell'immagine, contiene centinaia di migliaia di neuroni. Chi legge che una zona «si accende» dovrebbe sempre chiedersi: rispetto a che cosa?"
      },
      {
       "h": "Un'area per i volti e i suoi controlli",
       "text": "Nell'esperimento classico di Kanwisher una persona guarda per pochi minuti blocchi di circa venti secondi di volti, di oggetti e di un punto da fissare. Confrontando volti e oggetti compare una zona sulla faccia inferiore del cervello, nel giro fusiforme, che risponde molto di più ai volti: l'area fusiforme dei volti (fusiform face area, FFA), descritta nel 1997. Si trova in quasi ogni persona e la si individua in una decina di minuti di scansione. Ma la vera scienza comincia chiedendosi come si potrebbe sbagliare. Forse risponde a qualunque parte del corpo, a forme curve, o semplicemente al fatto che i volti attirano più attenzione? Per escludere queste spiegazioni il gruppo confrontò volti e mani con un compito di memoria più difficile per le mani, che quindi richiedevano più attenzione: l'area rispondeva comunque di più ai volti. In un altro test la stessa immagine ambigua veniva vista come volto dritta e come macchia senza senso capovolta, e la risposta era più forte quando la si vedeva come volto. Restava però aperta la domanda più importante: quell'area è necessaria per riconoscere i volti?"
      }
     ],
     "keyPoints": [
      "Prima del dove, chiediti che cosa viene calcolato e perché: è il livello computazionale di Marr.",
      "Molti problemi percettivi sono mal posti: il cervello li risolve con ipotesi sul mondo, come la stima della luce per vedere i colori.",
      "Riconosciamo bene i volti familiari, molto peggio quelli sconosciuti fotografati in condizioni diverse.",
      "La fMRI misura l'ossigenazione del sangue: buona risoluzione spaziale, scarsa temporale, misura indiretta e solo relativa.",
      "L'area fusiforme dei volti risponde più ai volti che a oggetti e mani, anche controllando l'attenzione e le caratteristiche dell'immagine.",
      "Una risposta selettiva non dimostra da sola che un'area sia necessaria alla funzione."
     ],
     "terms": [
      {
       "t": "Livelli di Marr",
       "d": "Tre livelli per studiare la mente: il problema computazionale, l'algoritmo con la sua rappresentazione, l'implementazione nei neuroni."
      },
      {
       "t": "Problema mal posto (ill-posed problem)",
       "d": "Problema che ha molte soluzioni compatibili con i dati, risolvibile solo aggiungendo ipotesi o conoscenze."
      },
      {
       "t": "Prosopagnosia",
       "d": "Difficoltà specifica nel riconoscere i volti; può essere acquisita dopo un danno o presente dalla nascita senza lesioni."
      },
      {
       "t": "fMRI",
       "d": "Risonanza magnetica funzionale: misura in modo non invasivo le variazioni di ossigenazione del sangue legate all'attività neurale."
      },
      {
       "t": "Segnale BOLD",
       "d": "Il segnale della fMRI, che dipende dalla quantità di emoglobina ossigenata in una zona del cervello."
      },
      {
       "t": "Voxel",
       "d": "L'unità di volume dell'immagine di risonanza, di solito qualche millimetro cubo, che contiene centinaia di migliaia di neuroni."
      },
      {
       "t": "FFA (fusiform face area)",
       "d": "Area fusiforme dei volti: regione sulla faccia inferiore del lobo temporale che risponde selettivamente ai volti."
      }
     ],
     "quiz": [
      {
       "q": "Un ingegnere vuole capire come il cervello riconosce le melodie e parte registrando singoli neuroni. Che cosa gli suggerirebbe Marr?",
       "options": [
        "Di registrare più neuroni contemporaneamente",
        "Di definire prima il problema: ingressi, uscite e che cosa rende difficile riconoscere una melodia",
        "Di partire dalle molecole che compongono i neuroni",
        "Di usare solo la risonanza magnetica funzionale"
       ],
       "answer": 1,
       "why": "Per Marr il primo livello è la teoria computazionale: senza sapere che cosa deve calcolare il sistema, i dati sui neuroni restano difficili da interpretare. Cambiare tecnica di misura non risolve il problema di fondo."
      },
      {
       "q": "Un vestito sembra bianco e oro a te e blu e nero a un collega. Quale spiegazione è coerente con la lezione?",
       "options": [
        "Uno dei due ha un difetto nei recettori del colore",
        "Lo schermo mostra colori diversi a persone diverse",
        "Il colore percepito è una misura diretta della luce che arriva all'occhio",
        "I due cervelli fanno ipotesi diverse sulla luce che illumina il vestito"
       ],
       "answer": 3,
       "why": "La luce che arriva all'occhio mescola colore della superficie e colore dell'illuminazione. Se l'immagine è ambigua, ipotesi diverse sulla luce portano a colori percepiti diversi, senza bisogno di alcun difetto."
      },
      {
       "q": "Un addetto alla sicurezza deve verificare se il viaggiatore davanti a lui è la persona nella foto del documento. Che cosa prevede lo studio sui politici olandesi?",
       "options": [
        "Che il compito è più difficile del previsto, perché il volto è sconosciuto",
        "Che il compito è facile, perché tutti siamo esperti di volti",
        "Che basta guardare la forma degli occhi per non sbagliare",
        "Che l'errore dipende solo dalla qualità della foto"
       ],
       "answer": 0,
       "why": "Lo studio mostra che con volti sconosciuti confondiamo facilmente immagini diverse della stessa persona e persone diverse tra loro. La nostra abilità vale soprattutto per i volti familiari, non per quelli visti una volta sola."
      },
      {
       "q": "In uno studio fMRI una regione dà un valore di 726 durante la visione di volti. Che cosa si può concludere?",
       "options": [
        "Che la regione è molto attiva, perché il valore è alto",
        "Che la regione è specializzata per i volti",
        "Niente, finché non lo si confronta con il valore in un'altra condizione",
        "Che i neuroni della regione sparano 726 volte al secondo"
       ],
       "answer": 2,
       "why": "Il segnale BOLD è relativo: un numero isolato non ha significato. Solo il confronto con una condizione di controllo, per esempio oggetti, dice se la regione risponde di più ai volti."
      },
      {
       "q": "Un critico sostiene che l'FFA risponda ai volti solo perché attirano più attenzione. Quale esperimento risponde meglio a questa obiezione?",
       "options": [
        "Mostrare volti più grandi e più luminosi",
        "Confrontare volti con mani usando un compito più difficile per le mani",
        "Mostrare solo volti, senza altre categorie",
        "Chiedere ai partecipanti quanto trovano interessanti i volti"
       ],
       "answer": 1,
       "why": "Se le mani richiedono più attenzione e l'area risponde comunque di più ai volti, l'attenzione non può spiegare il risultato. Mostrare solo volti non permette alcun confronto, e i giudizi soggettivi non controllano l'attenzione."
      }
     ],
     "explain": "Spiega a un amico che cosa misura davvero una risonanza funzionale e perché un'area che «si accende» non dice nulla senza un confronto.",
     "apply": "Prendi cinque foto di un tuo collega o amico scattate in situazioni diverse e cinque foto di una persona famosa straniera che non conosci. Mescolale e chiedi a qualcuno di dividerle per persona: osserva quante volte sbaglia con il volto sconosciuto."
    },
    {
     "id": "neuro-mit-913-04",
     "title": "Lesioni, elettrodi e TMS: cercare le cause",
     "minutes": 11,
     "watch": {
      "label": "Lezione 5: Cognitive Neuroscience Methods II (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-5-cognitive-neuroscience-methods-ii/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 5 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l05/"
      },
      {
       "label": "Lezione 6: Experimental Design (video, la prima parte tratta la TMS)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-6-experimental-design/"
      }
     ],
     "sections": [
      {
       "h": "EEG e MEG: il cervello al millisecondo",
       "text": "La fMRI vede bene dove, ma è lenta. Per sapere quando, si registrano i segnali elettrici dal cuoio capelluto con l'elettroencefalogramma (EEG). Facendo la media di molte prove allineate all'istante in cui compare lo stimolo si ottengono i potenziali evento-correlati (event-related potentials, ERP). Nel 1996 Simon Thorpe e colleghi chiesero di premere un tasto se in una foto c'era un animale: l'attività per foto con e senza animali si separava già intorno ai 150 millisecondi. Per i volti esiste una risposta tipica, più ampia sopra le regioni occipito-temporali soprattutto a destra, attorno ai 170 millisecondi: la N170. La magnetoencefalografia (MEG), inventata al MIT da David Cohen alla fine degli anni Sessanta, misura i deboli campi magnetici prodotti dagli stessi neuroni e mostra l'equivalente M170. Il limite è la localizzazione: Kanwisher lo paragona a un microfono sugli spalti di uno stadio, che capta il boato per un gol ma non sente che cosa dicono i singoli giocatori. Risalire alle sorgenti da ciò che si misura fuori dalla testa è di nuovo un problema mal posto."
      },
      {
       "h": "Elettrodi dentro il cervello",
       "text": "Alcuni pazienti con epilessia resistente ai farmaci vengono operati per rimuovere la zona da cui partono le crisi. Per trovarla, i chirurghi appoggiano griglie di elettrodi direttamente sulla corteccia e le lasciano per giorni. Alcuni pazienti accettano di partecipare anche a esperimenti, e così si ottiene ciò che nessun altro metodo dà: buona precisione nello spazio e nel tempo insieme. In un paziente con elettrodi lungo il giro fusiforme, alcuni contatti rispondevano in modo molto selettivo ai volti, con un inizio intorno ai 130 millisecondi e un picco intorno ai 170. In casi ancora più rari si registrano singoli neuroni, e ne sono stati trovati alcuni selettivi per i volti proprio nell'area fusiforme localizzata con la fMRI. I limiti sono evidenti: i pazienti sono pochi, gli elettrodi vanno dove serve alla cura e non dove vorrebbe il ricercatore, e un neurone registrato oggi non si ritrova domani. Per questo la ricerca sulle scimmie resta fondamentale: Doris Tsao e Winrich Freiwald hanno trovato nei macachi sei «chiazze» di corteccia selettive per i volti e ne hanno studiato il codice neurale per anni."
      },
      {
       "h": "Lesioni e doppie dissociazioni",
       "text": "Le lesioni danno prove causali: se un danno in una zona toglie una capacità, quella zona serve. Un paziente con una lesione nella probabile sede dell'area fusiforme dei volti non riconosceva più le persone ma riconosceva normalmente gli oggetti. Basta? Non del tutto. Forse i volti sono semplicemente più difficili da distinguere degli oggetti, e un sistema generico danneggiato fallisce prima sul compito più arduo. La risposta viene dalla doppia dissociazione (double dissociation). Il paziente CK, studiato a Toronto, era gravemente incapace di riconoscere gli oggetti ma riconosceva i volti normalmente, anche meglio della media. Se un paziente perde A ma non B e un altro perde B ma non A, la spiegazione basata sulla difficoltà non regge più. C'è poi un dato che invita alla prudenza: molte persone con prosopagnosia evolutiva, come lo studente Jacob Hodes conosciuto da Kanwisher, hanno un'area dei volti che alla risonanza sembra normale. Quindi un'area che risponde ai volti non basta: servono anche i circuiti interni giusti, le connessioni e la memoria."
      },
      {
       "h": "Stimolare il cervello: elettrodi e TMS",
       "text": "Il modo più diretto per provare una causa è intervenire. Nei pazienti con elettrodi impiantati si può far passare una piccola corrente. Nel 2012, a Stanford, un paziente stimolato sull'area dei volti riferì che il volto del medico davanti a lui si deformava e cambiava, mentre il resto della stanza restava normale. In un paziente giapponese, stimolare i contatti selettivi per i volti faceva comparire volti anche su oggetti come una scatola o una palla. Nelle persone sane si usa invece la stimolazione magnetica transcranica (TMS): una bobina appoggiata alla testa genera un impulso magnetico di meno di un millisecondo che disturba brevemente la corteccia sottostante, con una precisione di uno o due centimetri. L'area fusiforme è troppo profonda, così David Pitcher ha colpito l'area occipitale dei volti, più superficiale. Con la TMS la precisione nel giudicare se due volti erano uguali scendeva da circa l'85% a circa il 78%, e solo se l'impulso arrivava tra 60 e 100 millisecondi dopo lo stimolo. Il limite: per dire che l'effetto riguarda solo i volti serve un controllo con oggetti, che va sempre cercato."
      },
      {
       "h": "Mettere insieme i pezzi",
       "text": "Ogni metodo risponde a una domanda diversa e ha un punto cieco. Il comportamento è economico e rivela le rappresentazioni, ma misura solo l'uscita finale. La fMRI localizza bene ma è lenta e non prova la necessità. EEG e MEG seguono il tempo al millisecondo ma localizzano male. Gli elettrodi intracranici uniscono spazio e tempo, ma solo in pochi pazienti scelti per ragioni cliniche. Lesioni, stimolazione elettrica e TMS permettono di parlare di causa, ciascuna con limiti propri: le lesioni sono irregolari e rare, la stimolazione elettrica dipende dall'intervento chirurgico, la TMS raggiunge solo la superficie. La forza delle conclusioni sull'area dei volti nasce proprio dalla convergenza: risposte selettive in fMRI, una firma temporale a 170 millisecondi, neuroni selettivi negli elettrodi, prosopagnosia dopo le lesioni e volti deformati con la stimolazione. È un buon criterio anche fuori dal laboratorio: quando prove indipendenti e di natura diversa puntano nella stessa direzione, ci si può fidare molto di più che di un singolo risultato spettacolare."
      }
     ],
     "keyPoints": [
      "EEG e MEG misurano l'attività al millisecondo ma localizzano male le sorgenti; per i volti c'è una risposta tipica a circa 170 ms.",
      "Gli elettrodi intracranici nei pazienti epilettici offrono precisione spaziale e temporale, ma sono rari e non scelti dal ricercatore.",
      "Una doppia dissociazione è più convincente di una singola lesione perché esclude la spiegazione basata sulla difficoltà del compito.",
      "Un'area dei volti normale alla fMRI non garantisce un buon riconoscimento: servono anche circuiti e connessioni.",
      "Stimolazione elettrica e TMS permettono di provare un ruolo causale; la TMS rivela anche quando un'area è necessaria.",
      "Le conclusioni solide nascono dalla convergenza di metodi diversi."
     ],
     "terms": [
      {
       "t": "ERP (event-related potential)",
       "d": "Risposta elettrica media del cervello a uno stimolo, ottenuta allineando e mediando molte registrazioni EEG."
      },
      {
       "t": "N170",
       "d": "Onda dell'EEG che compare circa 170 millisecondi dopo un volto, più ampia per i volti che per altri oggetti."
      },
      {
       "t": "MEG",
       "d": "Magnetoencefalografia: misura i campi magnetici generati dall'attività dei neuroni, con ottima risoluzione temporale."
      },
      {
       "t": "Doppia dissociazione (double dissociation)",
       "d": "Situazione in cui un paziente perde la funzione A ma non la B e un altro perde B ma non A: indica sistemi distinti."
      },
      {
       "t": "TMS",
       "d": "Stimolazione magnetica transcranica: un impulso magnetico dall'esterno disturba per un attimo la corteccia sottostante."
      },
      {
       "t": "Stimolazione elettrica intracranica",
       "d": "Piccole correnti applicate tramite elettrodi impiantati per verificare quale funzione dipenda da una zona."
      }
     ],
     "quiz": [
      {
       "q": "Vuoi sapere se il cervello distingue le parole vere dalle parole inventate prima o dopo 200 millisecondi. Quale metodo scegli per primo?",
       "options": [
        "La fMRI, perché ha la risoluzione spaziale migliore",
        "Lo studio di pazienti con lesioni",
        "L'EEG o la MEG, perché seguono l'attività al millisecondo",
        "La trattografia della sostanza bianca"
       ],
       "answer": 2,
       "why": "La domanda riguarda il tempo, e EEG e MEG sono i metodi non invasivi con la risoluzione temporale migliore. La fMRI è troppo lenta: la risposta del sangue arriva dopo diversi secondi."
      },
      {
       "q": "Un paziente dopo un ictus riconosce male i volti ma bene gli oggetti. Un collega obietta che i volti sono solo più difficili. Quale dato smonterebbe l'obiezione?",
       "options": [
        "Un altro paziente che riconosce bene i volti ma male gli oggetti",
        "Un secondo paziente con lo stesso identico deficit",
        "Una fMRI che mostra la lesione in modo più nitido",
        "Un test di intelligenza normale nel paziente"
       ],
       "answer": 0,
       "why": "È la logica della doppia dissociazione: se esiste anche il deficit opposto, non si può dire che i volti falliscano solo perché più difficili. Un secondo caso uguale rafforza il dato ma non risponde all'obiezione."
      },
      {
       "q": "In una persona con prosopagnosia evolutiva l'area fusiforme dei volti risponde normalmente. Che cosa ne segue?",
       "options": [
        "Che l'area dei volti non c'entra nulla con il riconoscimento",
        "Che la diagnosi di prosopagnosia è sbagliata",
        "Che la fMRI non funziona in queste persone",
        "Che una risposta selettiva non basta: possono mancare circuiti interni, connessioni o memoria"
       ],
       "answer": 3,
       "why": "Le prove di lesione e stimolazione mostrano che l'area serve, ma la sua presenza non è sufficiente. Il riconoscimento richiede anche che l'informazione sia elaborata e letta correttamente da altre parti del sistema."
      },
      {
       "q": "Con la TMS sull'area occipitale dei volti la precisione cala solo se l'impulso arriva tra 60 e 100 ms dopo lo stimolo. Che cosa aggiunge questo dato?",
       "options": [
        "Indica che l'area è grande circa 100 millimetri",
        "Indica quando l'area svolge il suo contributo, non solo che è necessaria",
        "Dimostra che l'area risponde solo ai volti",
        "Dimostra che la TMS è pericolosa dopo 100 ms"
       ],
       "answer": 1,
       "why": "Variando il momento dell'impulso si scopre la finestra temporale in cui l'area è indispensabile. Per la specificità ai volti servirebbe invece un controllo con oggetti, che questo dato da solo non fornisce."
      },
      {
       "q": "Perché i ricercatori non possono usare la TMS per disattivare l'area fusiforme dei volti?",
       "options": [
        "Perché la TMS funziona solo sul lobo frontale",
        "Perché l'area si sposta durante l'esperimento",
        "Perché è a diversi centimetri di profondità e la TMS agisce solo vicino alla superficie",
        "Perché la TMS è vietata negli esperimenti sui volti"
       ],
       "answer": 2,
       "why": "Il campo della bobina si indebolisce rapidamente allontanandosi dal cranio. Per questo Pitcher ha scelto l'area occipitale dei volti, più superficiale, pur essendo meno selettiva."
      }
     ],
     "explain": "Spiega a un amico che cos'è una doppia dissociazione e perché convince più di un singolo paziente con un deficit.",
     "apply": "Pensa a un problema ricorrente al lavoro, per esempio un calo delle vendite. Elenca le prove che hai e chiediti quali mostrano solo una correlazione e quali un effetto causale. Che «esperimento» potresti fare per intervenire su una sola variabile?"
    },
    {
     "id": "neuro-mit-913-05",
     "title": "Esperimenti ben fatti, categorie visive e MVPA",
     "minutes": 11,
     "watch": {
      "label": "Lezione 7: Category Selectivity, Controversies, and MVPA (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-7-category-selectivity-controversies-and-mvpa/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 7 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l07/"
      },
      {
       "label": "Lucidi della lezione 6: Experimental Design (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l06/"
      }
     ],
     "sections": [
      {
       "h": "La coppia minima e i confondenti",
       "text": "In un esperimento si manipola una variabile indipendente, per esempio il tipo di immagine, e se ne misura una dipendente, come il segnale BOLD. L'ideale è la coppia minima (minimal pair): due condizioni identiche in tutto tranne che nel processo mentale che interessa. È la logica della sottrazione introdotta nell'Ottocento dal fisiologo olandese Franciscus Donders con i tempi di reazione. Qualunque altra differenza che varia insieme alla variabile scelta è un confondente (confound) e apre spiegazioni alternative. In classe Kanwisher propone di cercare un'area per i serpenti. Se mostri serpenti nell'erba e confronti con oggetti su sfondo bianco, l'erba diventa un confondente. Meglio confrontare con vermi, che hanno forma simile e sono animali, o con tubi da giardino arrotolati nell'erba. Attenzione anche al compito: se si preme un tasto per i serpenti e un altro per il resto, la differenza motoria sporca il confronto. Un errore frequente è chiamare confondente qualsiasi difetto: un campione di soli uomini è un limite, ma non un confondente, perché non varia tra le condizioni."
      },
      {
       "h": "Localizzatori, linee di base e disegni fattoriali",
       "text": "Le regioni funzionali non sono nello stesso punto in tutti, così come occhi e labbra non sono nello stesso punto in tutte le foto. Per questo si usa un localizzatore (localizer): una breve scansione, per esempio volti contro oggetti, per trovare l'area in ciascuna persona, e poi si testano le ipotesi nuove su dati separati. Una linea di base, come fissare un punto, permette di misurare quanto è selettiva una risposta e non solo se due condizioni differiscono. Conviene che ogni partecipante veda tutte le condizioni, per evitare che differenze individuali, come quanto caffè ha bevuto, falsino il confronto. Poi ci sono i disegni fattoriali: per esempio due tipi di stimolo, volti e sedie, incrociati con due stati di attenzione, osservati o ignorati. Si ottengono effetti principali, cioè la differenza media lungo un fattore, e un'interazione (interaction), quando l'effetto di un fattore dipende dall'altro. Spesso è l'interazione la domanda più interessante: per esempio, l'attenzione aumenta la risposta dell'area dei volti in generale o ne aumenta proprio la selettività?"
      },
      {
       "h": "La mappa delle categorie visive",
       "text": "Sulla faccia inferiore e laterale del cervello si trova una serie di regioni con preferenze precise. Oltre all'area dei volti ci sono l'area dei luoghi (PPA), un'area per i corpi descritta da Paul Downing nel 2001 e un'area per le parole scritte, l'area della forma visiva delle parole (visual word form area, VWFA). Il gruppo di Kanwisher ha provato a cercarne altre mostrando venti categorie diverse, tra cui cibo, piante, armi, attrezzi, fiori e serpenti: solo volti, luoghi e corpi comparivano in ogni partecipante. Per attrezzi e mani alcuni laboratori riportano aree dedicate, altri no, e la questione resta aperta. Esistono anche critiche serie. Le aree reali hanno bordi frastagliati e appaiono nette solo dopo molta levigatura dei dati. Alcuni sostengono che siano solo picchi in un paesaggio continuo di risposte, altri che rispondano a caratteristiche semplici come le curve. Kanwisher ricorda che non trovare un'area non prova che non esista: neuroni sparsi, pochi dati o artefatti della risonanza possono nascondere effetti reali."
      },
      {
       "h": "Haxby e la sfida dei pattern",
       "text": "Nel 2001 Jim Haxby lanciò una sfida. Anche se l'area dei volti risponde poco a sedie e automobili, forse il disegno della sua attività, voxel per voxel, è diverso per le due categorie. In quel caso l'area conterrebbe informazioni anche sugli oggetti e farebbe parte di una rappresentazione distribuita. Il metodo è semplice. Si dividono le sessioni in pari e dispari, si calcola il pattern di attività per ogni categoria e si controlla se il pattern delle sedie nelle sessioni pari somiglia di più a quello delle sedie nelle dispari che a quello delle auto. È la base dell'analisi multivoxel (multiple voxel pattern analysis, MVPA). Il risultato, dopo anni di discussioni e nuove analisi, è che l'area dei volti distingue in effetti altre categorie, ma debolmente. Kanwisher risponde con un paragone: si può leggere l'ora sul display di un distributore automatico, ma non per questo diremmo che è un orologio. Anche una rete artificiale addestrata solo sui volti permette, nei suoi strati intermedi, di distinguere sedie da auto. Che un'informazione sia decodificabile non dice che il cervello la usi."
      },
      {
       "h": "Decodificare: potenza e limiti",
       "text": "La decodifica funziona come un indovinello: si addestra un classificatore sui pattern prodotti da categorie note, per esempio scarpe e gatti, e poi gli si chiede a quale assomiglia un pattern nuovo. Lo stesso metodo si applica ai neuroni delle scimmie e alla MEG, che con circa 300 sensori permette di decodificare istante per istante e di vedere quando un'informazione compare. Addestrare su certi stimoli e provare su altri, per esempio scarpe di colori o angolazioni diverse, misura quanto è astratta la rappresentazione. I limiti però sono importanti. In uno studio sulle scimmie, l'identità di cinque volti si decodificava bene da 167 neuroni registrati in una zona sensibile ai volti, ma male dai voxel della fMRI nella stessa zona, perché ogni voxel mescola centinaia di migliaia di neuroni. E c'è il tema della privacy: qualche anno fa si parlò di usare la fMRI come macchina della verità in tribunale. Kanwisher nota che basta muovere la testa, muovere la lingua o fare calcoli a mente per rovinare il segnale."
      }
     ],
     "keyPoints": [
      "Il confronto ideale è una coppia minima; ogni altra differenza che varia con la condizione è un confondente.",
      "Le regioni si localizzano in ogni persona con una scansione separata, perché la loro posizione varia da individuo a individuo.",
      "Nei disegni fattoriali l'interazione dice se l'effetto di un fattore dipende dall'altro, ed è spesso il dato più informativo.",
      "Volti, luoghi e corpi hanno regioni dedicate in quasi tutti; per altre categorie le prove sono deboli o contese.",
      "L'MVPA legge l'informazione nei pattern di attività, ma decodificabile non significa usato dal cervello.",
      "La fMRI vede solo l'informazione organizzata su scala di millimetri; molto codice neurale le sfugge."
     ],
     "terms": [
      {
       "t": "Coppia minima (minimal pair)",
       "d": "Due condizioni sperimentali identiche tranne che per il processo mentale che si vuole isolare."
      },
      {
       "t": "Confondente (confound)",
       "d": "Differenza non voluta tra le condizioni che varia insieme alla variabile studiata e offre una spiegazione alternativa."
      },
      {
       "t": "Localizzatore (localizer)",
       "d": "Scansione breve usata per individuare una regione funzionale in ogni singolo partecipante prima del test vero."
      },
      {
       "t": "Interazione (interaction)",
       "d": "Situazione in cui l'effetto di un fattore cambia a seconda del livello di un altro fattore."
      },
      {
       "t": "VWFA (visual word form area)",
       "d": "Area della forma visiva delle parole: regione dell'emisfero sinistro che risponde alle lettere di una scrittura che si sa leggere."
      },
      {
       "t": "MVPA",
       "d": "Analisi dei pattern su più voxel: confronta il disegno dell'attività, non solo la sua intensità media."
      },
      {
       "t": "Decodifica (decoding)",
       "d": "Uso di un classificatore per indovinare lo stimolo o lo stato mentale a partire da un pattern di attività cerebrale."
      }
     ],
     "quiz": [
      {
       "q": "Uno studio cerca un'area per il cibo confrontando foto di piatti su tavole colorate con foto di attrezzi su sfondo bianco. Qual è il problema principale?",
       "options": [
        "Il colore e la complessità dello sfondo variano insieme alla categoria",
        "Il cibo non è una categoria visiva",
        "Le foto di attrezzi sono troppo poche",
        "Il segnale BOLD non è adatto ai colori"
       ],
       "answer": 0,
       "why": "Lo sfondo colorato è un confondente: una differenza di risposta potrebbe dipendere da colori e complessità della scena, non dal cibo. Servirebbero cibo e attrezzi sugli stessi sfondi."
      },
      {
       "q": "Perché si usa un localizzatore in ogni partecipante invece di cercare l'area dei volti sempre nelle stesse coordinate di un cervello medio?",
       "options": [
        "Perché il localizzatore rende la scansione più breve",
        "Perché la posizione esatta dell'area varia da persona a persona e la media la sfoca",
        "Perché le coordinate standard sono coperte da brevetto",
        "Perché senza localizzatore la risonanza non si può accendere"
       ],
       "answer": 1,
       "why": "Come i tratti del volto, le regioni cambiano leggermente posizione tra individui. Mediare cervelli diversi senza localizzare l'area in ciascuno mescola voxel che appartengono all'area con altri che non c'entrano."
      },
      {
       "q": "In un esperimento 2x2 (volti o sedie; osservati o ignorati) l'attenzione aumenta molto la risposta ai volti e quasi per niente quella alle sedie. Come si chiama questo risultato?",
       "options": [
        "Un effetto principale della categoria",
        "Una linea di base",
        "Un confondente",
        "Un'interazione tra categoria e attenzione"
       ],
       "answer": 3,
       "why": "L'effetto dell'attenzione dipende dalla categoria: questo è un'interazione. Un effetto principale descriverebbe una differenza media lungo un solo fattore, indipendentemente dall'altro."
      },
      {
       "q": "Un classificatore distingue debolmente sedie da automobili usando l'attività dell'area dei volti. Quale conclusione è più prudente?",
       "options": [
        "L'area dei volti è in realtà un'area generica per tutti gli oggetti",
        "Il classificatore è sbagliato e va scartato",
        "L'informazione è presente, ma questo non prova che il cervello la usi per riconoscere sedie",
        "Le sedie vengono percepite come volti"
       ],
       "answer": 2,
       "why": "Decodificabile non vuol dire usato: anche una rete addestrata solo sui volti contiene informazioni su altri oggetti. Le prove causali di lesioni e stimolazione indicano che l'area serve ai volti, non agli oggetti."
      },
      {
       "q": "Un'azienda propone la fMRI come macchina della verità infallibile. Quale osservazione del corso è più pertinente?",
       "options": [
        "Il segnale si può rovinare facilmente, per esempio muovendo la testa o facendo calcoli a mente",
        "La fMRI non misura alcuna attività cerebrale",
        "La menzogna è localizzata nell'area dei volti",
        "La fMRI legge i pensieri parola per parola"
       ],
       "answer": 0,
       "why": "La decodifica richiede la collaborazione di chi è nello scanner: piccoli movimenti o attività mentali estranee alterano i dati. Le opzioni estreme (non misura nulla, legge i pensieri) sono entrambe false."
      }
     ],
     "explain": "Spiega a un amico, con l'esempio del distributore che mostra l'ora, perché un'informazione decodificabile da un'area non dice per forza a che cosa serve quell'area.",
     "apply": "Progetta su carta un esperimento per capire se esiste un'area per i loghi aziendali. Scrivi la condizione di controllo, il compito del partecipante e almeno due possibili confondenti da evitare."
    },
    {
     "id": "neuro-mit-913-06",
     "title": "Scene e navigazione",
     "minutes": 11,
     "watch": {
      "label": "Lezione 8: Navigation I (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-8-navigation-i/"
     },
     "read": [
      {
       "label": "Lezione 9: Navigation II (video, cellule di luogo e riorientamento)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-9-navigation-ii/"
      },
      {
       "label": "Lucidi della lezione 8 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l08/"
      },
      {
       "label": "Lucidi della lezione 9 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l09/"
      }
     ],
     "sections": [
      {
       "h": "Navigatori straordinari e due problemi",
       "text": "Gli animali sono navigatori formidabili. Le farfalle monarca, che pesano circa mezzo grammo, migrano per migliaia di chilometri fino a poche foreste del Messico, e il viaggio completo richiede più generazioni. Le tartarughe marine tornano a deporre le uova sulla spiaggia dove sono nate dopo una ventina d'anni in mare. La formica del deserto tunisino Cataglyphis cerca cibo vagando a zigzag e poi torna al nido in linea retta, anche senza punti di riferimento: tiene il conto di direzione e distanza percorse, come facevano i navigatori prima del GPS. Per Kanwisher ogni navigazione richiede di rispondere a due domande: dove sono? E come arrivo da qui a lì? Se la meta è visibile o udibile basta dirigersi verso di essa, come una barca verso il suono di un faro. Altrimenti servono una mappa mentale, la conoscenza dei percorsi possibili e la direzione in cui si sta guardando. Chi esce da una stazione della metropolitana di Manhattan sa che la strada va da nord a sud, ma finché non capisce da che parte è girato non sa dove andare."
      },
      {
       "h": "L'area dei luoghi e la forma dello spazio",
       "text": "Nel 1998 Russell Epstein, allora ricercatore nel laboratorio di Kanwisher, confrontò scene e oggetti e trovò in tutti i primi nove partecipanti una regione nella corteccia paraippocampale: l'area paraippocampale dei luoghi (PPA). Che cosa la attiva esattamente? Kanwisher fotografò gli appartamenti di amici a Cambridge e poi le stesse stanze svuotate dei mobili: la stanza vuota attivava la PPA quasi quanto quella arredata, mentre gli oggetti da soli la attivavano poco. Se la scena veniva tagliata a pezzi e rimescolata, la risposta crollava. Anche scene costruite con i LEGO funzionavano, la familiarità contava poco e le mappe viste dall'alto quasi niente. La conclusione è che la PPA elabora la geometria dello spazio visibile intorno a chi guarda. Un'obiezione successiva sosteneva che rispondesse solo alle linee dritte, tipiche degli ambienti costruiti; un esperimento fattoriale ha mostrato che conta la categoria scena, non la rettilineità. In un paziente con elettrodi, stimolare i contatti selettivi per le scene faceva «vedere» luoghi, come una stazione o una scala."
      },
      {
       "h": "Retrospleniale e OPA: orientarsi",
       "text": "La PPA non lavora da sola. La corteccia retrospleniale (retrosplenial cortex, RSC), vicino alla linea mediana, risponde più ai luoghi familiari e si attiva quando bisogna giudicare la propria posizione e direzione. I pazienti con danni in questa zona riconoscono gli edifici del quartiere e li sentono familiari, ma non sanno dire in che direzione si trovi un bar a due isolati. È come avere le fotografie dei posti senza la mappa che li collega. L'area occipitale dei luoghi (occipital place area, OPA), sulla superficie laterale, è abbastanza vicina al cranio da essere raggiunta con la TMS. In un esperimento, la TMS sull'OPA peggiorava la discriminazione tra stanze simili ma non tra volti, mentre la TMS sull'area occipitale dei volti faceva l'opposto: una doppia dissociazione nel cervello sano. Questo sistema spiega anche la storia di Bob, il cui tumore cresceva accanto alla PPA: riconosceva i luoghi familiari ma non riusciva a ricostruire come fossero disposti. Un errore tipico è immaginare un unico «centro dell'orientamento»: è una rete di regioni con compiti diversi."
      },
      {
       "h": "Cellule di luogo, di direzione e di griglia",
       "text": "Negli anni Quaranta Edward Tolman notò che i ratti, se il percorso abituale verso il cibo era bloccato, sceglievano una strada nuova nella direzione giusta: avevano una mappa cognitiva (cognitive map), non solo una sequenza di svolte. Decenni dopo John O'Keefe scoprì nell'ippocampo del ratto le cellule di luogo (place cells), che si attivano quando l'animale si trova in un punto preciso dell'ambiente, anche al buio. Le cellule di direzione della testa (head direction cells) si attivano quando l'animale è rivolto in una certa direzione, come una bussola. May-Britt ed Edvard Moser scoprirono nella corteccia entorinale le cellule di griglia (grid cells), che si attivano in molti punti disposti come i vertici di una griglia esagonale e funzionano come righelli per misurare la distanza percorsa. Per queste scoperte i tre hanno ricevuto il Nobel nel 2014. Ci sono anche cellule di confine, attive vicino a muri o bordi. Nei pipistrelli le cellule di luogo codificano lo spazio in tre dimensioni, e nel 2003 sono state registrate anche nell'uomo, in pazienti che esploravano una città virtuale con un joystick."
      },
      {
       "h": "Riorientarsi e usare lo spazio per pensare",
       "text": "Che cosa fa un animale disorientato? Negli anni Ottanta Ken Cheng e Randy Gallistel nascosero del cibo in un angolo di una stanza rettangolare. Dopo essere stati disorientati, i ratti cercavano con la stessa frequenza nell'angolo giusto e in quello opposto, che ha la stessa geometria, ignorando anche una parete di colore diverso che pure avevano notato. Liz Spelke trovò lo stesso comportamento nei bambini di uno o due anni e negli adulti con il linguaggio occupato, cioè mentre ripetevano ad alta voce un testo ascoltato. L'idea è che la forma del terreno sia l'indizio più stabile in natura, mentre colori e odori cambiano con le stagioni. Esperimenti più recenti nei topi mostrano che, quando l'animale sbaglia angolo, cellule di luogo, di direzione e di griglia «ruotano» tutte insieme di 180 gradi. Infine, questo sistema sembra riciclato per altro: schemi simili a quelli delle cellule di griglia compaiono quando le persone imparano uno spazio astratto, come uccelli immaginari con collo e zampe di lunghezze diverse, o uno spazio sociale fatto di potere e vicinanza."
      }
     ],
     "keyPoints": [
      "Navigare richiede di sapere dove si è e come raggiungere una meta, inclusa la direzione in cui si sta guardando.",
      "La PPA risponde alla geometria dello spazio visibile: una stanza vuota la attiva quasi quanto una arredata.",
      "La corteccia retrospleniale aiuta a collocarsi e orientarsi sulla mappa; l'OPA è necessaria per percepire le scene.",
      "Cellule di luogo, di direzione, di griglia e di confine formano nei mammiferi un sistema di posizionamento interno.",
      "Da disorientati, ratti e bambini piccoli si affidano alla forma dello spazio e ignorano colori e oggetti.",
      "Il sistema della navigazione sembra usato anche per organizzare ricordi, concetti e relazioni sociali."
     ],
     "terms": [
      {
       "t": "Mappa cognitiva (cognitive map)",
       "d": "Rappresentazione mentale della disposizione dello spazio che permette di trovare percorsi nuovi."
      },
      {
       "t": "Integrazione del percorso",
       "d": "Calcolo continuo della propria posizione sommando direzione e distanza di ogni spostamento, come fa la formica del deserto."
      },
      {
       "t": "Corteccia retrospleniale (RSC)",
       "d": "Regione vicino alla linea mediana del cervello che aiuta a capire dove ci si trova e in che direzione si guarda."
      },
      {
       "t": "OPA (occipital place area)",
       "d": "Area occipitale dei luoghi: regione laterale selettiva per le scene, raggiungibile con la TMS."
      },
      {
       "t": "Cellule di luogo (place cells)",
       "d": "Neuroni dell'ippocampo che si attivano quando l'animale si trova in un punto specifico dell'ambiente."
      },
      {
       "t": "Cellule di griglia (grid cells)",
       "d": "Neuroni della corteccia entorinale attivi in punti disposti a griglia esagonale; misurano le distanze percorse."
      },
      {
       "t": "Riorientamento",
       "d": "Recupero della propria direzione in un ambiente noto dopo essersi disorientati."
      }
     ],
     "quiz": [
      {
       "q": "In uno studio, la PPA risponde a una foto di una stanza vuota quasi come alla stessa stanza arredata. Che cosa indica?",
       "options": [
        "Che la PPA risponde agli oggetti presenti nella scena",
        "Che la PPA è sensibile alla forma dello spazio più che al suo contenuto",
        "Che la PPA risponde solo ai luoghi familiari",
        "Che la PPA non distingue scene da oggetti"
       ],
       "answer": 1,
       "why": "Togliere i mobili lascia quasi invariata la risposta, mentre gli oggetti da soli la attivano poco: conta la geometria dello spazio. La familiarità, nei test, ha avuto effetti minimi sulla PPA."
      },
      {
       "q": "Una persona riconosce il suo quartiere e sente familiari i negozi, ma non sa indicare da che parte si trovi la farmacia a due strade. Quale regione è più probabilmente danneggiata?",
       "options": [
        "La corteccia visiva primaria",
        "L'area fusiforme dei volti",
        "La corteccia retrospleniale",
        "L'area del movimento MT"
       ],
       "answer": 2,
       "why": "È il quadro descritto nei pazienti con danno retrospleniale: riconoscimento dei luoghi conservato, ma incapacità di collocarli sulla mappa e di orientarsi. Un danno alla corteccia visiva primaria toglierebbe parte della vista stessa."
      },
      {
       "q": "Un ratto esplora una stanza e un suo neurone si attiva in molti punti disposti come i vertici di triangoli regolari. Di che cellula si tratta?",
       "options": [
        "Una cellula di griglia",
        "Una cellula di luogo",
        "Una cellula di direzione della testa",
        "Una cellula di confine"
       ],
       "answer": 0,
       "why": "La disposizione esagonale ripetuta è la firma delle cellule di griglia. Le cellule di luogo hanno di solito un solo punto caldo, quelle di direzione rispondono all'orientamento e quelle di confine ai bordi."
      },
      {
       "q": "Un bambino di 18 mesi vede nascondere un giocattolo in un angolo di una stanza rettangolare con una parete rossa, poi viene fatto girare su sé stesso. Che cosa farà più probabilmente?",
       "options": [
        "Andrà sempre all'angolo giusto grazie alla parete rossa",
        "Cercherà a caso in tutti e quattro gli angoli",
        "Non cercherà affatto il giocattolo",
        "Cercherà in uguale misura nell'angolo giusto e in quello geometricamente equivalente"
       ],
       "answer": 3,
       "why": "Come i ratti, i bambini piccoli disorientati si basano sulla forma della stanza e ignorano la parete colorata. Non cercano a caso: scelgono i due angoli con la stessa geometria."
      },
      {
       "q": "Perché, dal punto di vista evolutivo, ha senso riorientarsi con la forma del terreno invece che con i colori?",
       "options": [
        "Perché gli animali non vedono i colori",
        "Perché la forma del terreno resta stabile mentre colori, piante e odori cambiano con le stagioni",
        "Perché i colori richiedono il linguaggio per essere percepiti",
        "Perché la geometria si impara solo da adulti"
       ],
       "answer": 1,
       "why": "Un indizio utile per orientarsi deve restare costante nel tempo: neve, fogliame e odori cambiano, le colline no. Molti animali vedono benissimo i colori, quindi la prima opzione è falsa."
      }
     ],
     "explain": "Spiega a un amico la differenza tra riconoscere un luogo e sapere come raggiungerlo, usando l'esempio di chi esce dalla metropolitana in una città che non conosce.",
     "apply": "La prossima volta che esci da un parcheggio sotterraneo o da una stazione, fermati e chiediti in che direzione stai guardando prima di aprire la mappa. Annota quali indizi usi: sole, edifici, forma della strada."
    },
    {
     "id": "neuro-mit-913-07",
     "title": "Sviluppo: natura, esperienza e plasticità",
     "minutes": 11,
     "watch": {
      "label": "Lezione 10: Development, Nature & Nurture I (video)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-10-development-nature-nurture-i/"
     },
     "read": [
      {
       "label": "Lezione 11: Development, Nature & Nurture II (video del 2018 con trascrizione)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-11-development-nature-nurture-ii-2018/"
      },
      {
       "label": "Lucidi della lezione 10 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l10/"
      },
      {
       "label": "Lucidi della lezione 11 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l11/"
      }
     ],
     "sections": [
      {
       "h": "Una domanda filosofica diventata esperimento",
       "text": "Da dove viene la conoscenza? Per gli empiristi come Locke e Hume, tutta dall'esperienza. Per Kant, la mente porta con sé alcune forme di partenza, come lo spazio e il tempo, che organizzano l'esperienza invece di derivarne. Oggi la domanda si può studiare in laboratorio: le regioni per volti, luoghi, corpi e parole compaiono più o meno nello stesso punto in quasi tutti, ma questo ordine è scritto nei geni o costruito dall'esperienza? Qualche dato sullo sviluppo aiuta. Quasi tutti i neuroni si formano prima della nascita e la maggior parte delle grandi connessioni è già presente nel neonato. Nel primo anno il volume del cervello raddoppia, crescono spessore della corteccia, complessità dei neuroni e numero di sinapsi, e la mielina avvolge rapidamente gli assoni, per poi continuare più lentamente fino all'adolescenza. Una precisazione importante: innato non significa presente alla nascita, ma determinato senza bisogno di esperienza. La pubertà è innata, eppure arriva dopo molti anni. Al contrario, qualcosa può essere presente presto ed essere stato imparato in fretta."
      },
      {
       "h": "I volti: un rompicapo aperto",
       "text": "I neonati, già nelle prime ore, guardano più a lungo uno schema simile a un volto che lo stesso schema rimescolato, forse grazie a una regola semplicissima come più elementi in alto che in basso. Con l'esperienza le capacità si restringono: a sei mesi i bambini distinguono tra loro volti di scimmia, a nove mesi non più, proprio come succede con i suoni delle lingue che non sentono. Ma serve vedere volti per sviluppare il sistema? Nel 2008 Yoichi Sugita allevò alcune scimmie per 6, 12 o 24 mesi senza mai mostrare loro un volto: alla prima occasione li preferivano agli oggetti e li distinguevano bene. Invece nel 2017 Michael Arcaro e Margaret Livingstone allevarono piccoli macachi accuditi da persone con maschere da saldatore, e queste scimmie non svilupparono le chiazze cerebrali per i volti. Comportamento e cervello sembrano dire cose diverse, e Kanwisher lo chiama apertamente un rompicapo. Un dato ulteriore: nei bambini di 4-6 mesi le regioni per volti e scene sono già al posto giusto, anche se meno selettive che negli adulti."
      },
      {
       "h": "Connessioni e furetti ricablati",
       "text": "Se l'area dei volti richiede esperienza, perché compare sempre nello stesso punto? Un'ipotesi è che lo decidano le connessioni di partenza. Ogni zona di corteccia ha un'impronta di collegamenti con il resto del cervello, e già negli adulti questa impronta, misurata con la risonanza a diffusione, permette di prevedere se un punto risponderà a volti, scene o corpi. Una prova causale viene da un celebre esperimento di Mriganka Sur al MIT sui furetti, che nascono molto immaturi. Subito dopo la nascita i ricercatori deviarono le fibre provenienti dalla retina verso la stazione del talamo che normalmente porta i suoni alla corteccia uditiva. Da adulta, quella corteccia uditiva rispondeva agli stimoli visivi, sviluppava un'organizzazione tipica della corteccia visiva, e gli animali addestrati si comportavano come se vedessero. La lezione è che la funzione di un pezzo di corteccia dipende in gran parte da quali segnali riceve. Il limite è che si tratta di un intervento estremo in un animale, e non dice quanto conti questo meccanismo nello sviluppo normale umano."
      },
      {
       "h": "Lettura e orientamento: imparato contro innato",
       "text": "La lettura è il test ideale: esiste da qualche migliaio di anni, troppo pochi perché l'evoluzione abbia costruito un circuito apposta. Eppure quasi tutti i lettori hanno nell'emisfero sinistro l'area della forma visiva delle parole, che risponde alle lettere di una scrittura conosciuta e poco a caratteri che non si sanno leggere. Zeynep Saygin ha seguito bambini a 5 anni, prima di imparare a leggere, e di nuovo a 8: le connessioni misurate a 5 anni prevedevano dove sarebbe comparsa l'area a 8, persino nelle differenze individuali. L'esperienza costruisce l'area, ma le connessioni decidono dove. L'orientamento racconta l'opposto. Nei ratti, già nelle prime due settimane di vita, quando cominciano a esplorare fuori dal nido, le cellule di direzione sono attive, e poco dopo compaiono quelle di luogo e di griglia. E negli esperimenti del gruppo di Giorgio Vallortigara a Trento, pulcini cresciuti in recinti circolari, senza mai vedere angoli, alla prima prova si riorientano usando la forma rettangolare della stanza. Kanwisher propone una regola di prudenza: partire dall'ipotesi che una capacità non sia innata e chiedere prove forti per sostenere il contrario."
      },
      {
       "h": "Plasticità: prima è meglio, di solito",
       "text": "Un adulto colpito da un grande ictus nell'emisfero sinistro spesso recupera poco del linguaggio. Un bambino con un danno simile nei primi mesi di vita, invece, di solito parla in modo quasi normale da adulto, perché il linguaggio si sposta nelle zone corrispondenti dell'emisfero destro; restano a volte piccoli difetti di sintassi visibili solo con test accurati. Dopo i cinque anni circa questa capacità sembra ridursi molto. È il principio di Kennard: un danno precoce è meglio di uno tardivo. Lo psicologo Donald Hebb aggiunse una correzione: alcune funzioni precoci sono fondamenta per quelle successive, e se mancano all'inizio il danno si propaga, come la sordità precoce per il linguaggio. Negli adulti i deficit visivi selettivi, come la prosopagnosia acquisita, raramente scompaiono, e chi recupera lo fa con strategie lente di compenso. Un caso sorprendente riguarda i ciechi dalla nascita: la loro corteccia visiva primaria si attiva quando ascoltano frasi, e la TMS su quella zona disturba compiti linguistici. Kanwisher mette in guardia dalle app che promettono di ricablare il cervello: si migliora nel compito allenato, non si diventa più intelligenti."
      }
     ],
     "keyPoints": [
      "Innato significa determinato senza esperienza, non necessariamente presente alla nascita.",
      "Alla nascita ci sono quasi tutti i neuroni e le grandi connessioni; nei primi due anni crescono sinapsi e mielina.",
      "Per i volti i dati sono contrastanti: capacità precoci nel comportamento, ma niente chiazze cerebrali senza esperienza di volti.",
      "Le connessioni di partenza sembrano decidere dove si sviluppa una funzione, come mostrano i furetti ricablati e l'area delle parole.",
      "La lettura è appresa, mentre il sistema di orientamento mostra forti componenti innate.",
      "Il cervello del bambino è più plastico: un danno precoce al linguaggio viene compensato meglio di uno in età adulta."
     ],
     "terms": [
      {
       "t": "Innato",
       "d": "Determinato dal patrimonio biologico senza bisogno di esperienza specifica, anche se compare tardi come la pubertà."
      },
      {
       "t": "Restringimento percettivo (perceptual narrowing)",
       "d": "Perdita, nel primo anno, della capacità di distinguere volti o suoni a cui il bambino non è esposto."
      },
      {
       "t": "Allevamento controllato",
       "d": "Esperimento in cui animali crescono privati di un'esperienza specifica, come vedere volti, per misurarne il ruolo."
      },
      {
       "t": "Impronta di connettività",
       "d": "Il profilo dei collegamenti a lunga distanza di una zona di corteccia, che ne predice la funzione."
      },
      {
       "t": "Principio di Kennard",
       "d": "L'idea che un danno cerebrale precoce venga compensato meglio di uno tardivo."
      },
      {
       "t": "Plasticità",
       "d": "Capacità del cervello di cambiare organizzazione con l'esperienza o dopo un danno, molto maggiore nell'infanzia."
      }
     ],
     "quiz": [
      {
       "q": "Un'abilità compare solo a 12 anni, uguale in tutte le culture e senza bisogno di allenamento specifico. Che cosa si può dire?",
       "options": [
        "Che è sicuramente appresa, perché arriva tardi",
        "Che potrebbe essere innata: innato non significa presente alla nascita",
        "Che è innata solo se compare nei neonati",
        "Che dipende solo dalla scuola"
       ],
       "answer": 1,
       "why": "Come la pubertà, una capacità può essere biologicamente programmata ed emergere tardi. Il momento di comparsa non basta da solo a stabilire se qualcosa sia innato o appreso."
      },
      {
       "q": "Le scimmie di Sugita, mai esposte a volti, li distinguono bene; quelle di Arcaro e Livingstone, senza volti, non sviluppano chiazze cerebrali per i volti. Qual è la lettura più onesta?",
       "options": [
        "Uno dei due studi è sicuramente falso",
        "Il riconoscimento dei volti è del tutto innato",
        "Il riconoscimento dei volti è del tutto appreso",
        "Comportamento e organizzazione cerebrale danno indicazioni diverse e la questione è aperta"
       ],
       "answer": 3,
       "why": "Kanwisher presenta il contrasto come un rompicapo non risolto: forse il comportamento iniziale usa meccanismi generici, forse le chiazze richiedono esperienza. Concludere per uno dei due estremi va oltre i dati."
      },
      {
       "q": "Nei furetti ricablati la corteccia uditiva riceve segnali dalla retina e diventa simile a quella visiva. Che cosa suggerisce?",
       "options": [
        "Che la funzione di un'area dipende molto dagli ingressi che riceve",
        "Che la corteccia uditiva è identica a quella visiva fin dalla nascita",
        "Che i furetti non hanno corteccia visiva",
        "Che i suoni diventano immagini in tutti i mammiferi"
       ],
       "answer": 0,
       "why": "Cambiando i segnali in arrivo cambia l'organizzazione e la funzione della zona: le connessioni e l'esperienza che portano plasmano la corteccia. Non significa che le aree siano identiche in partenza."
      },
      {
       "q": "Perché la lettura è un caso particolarmente utile per studiare il ruolo dell'esperienza?",
       "options": [
        "Perché tutti i primati sanno leggere",
        "Perché si impara solo da adulti",
        "Perché è troppo recente nella storia umana perché l'evoluzione abbia creato un circuito dedicato",
        "Perché non attiva alcuna area specifica del cervello"
       ],
       "answer": 2,
       "why": "La scrittura esiste da pochi millenni: se troviamo un'area specializzata, deve essere stata costruita dall'apprendimento. E infatti l'area risponde solo alle scritture che una persona sa leggere."
      },
      {
       "q": "Due persone hanno lo stesso danno all'emisfero sinistro: una a 6 mesi di vita, l'altra a 50 anni. Che cosa è più probabile per il linguaggio?",
       "options": [
        "Il recupero sarà identico",
        "L'adulto recupererà meglio perché ha più esperienza",
        "Nessuno dei due parlerà mai",
        "Il bambino svilupperà un linguaggio quasi normale usando l'emisfero destro"
       ],
       "answer": 3,
       "why": "È il principio di Kennard: nei primi anni il cervello può spostare il linguaggio nell'emisfero opposto. L'esperienza dell'adulto non compensa la minore plasticità."
      }
     ],
     "explain": "Spiega a un amico perché il fatto che un'area del cervello sia uguale in tutti non dimostra che sia innata, usando l'esempio dell'area della lettura.",
     "apply": "Scegli una tua abilità che ti sembra naturale, come orientarti o riconoscere le voci. Scrivi quali prove servirebbero per stabilire se è innata o appresa: confronti tra culture, età di comparsa, effetti della privazione."
    },
    {
     "id": "neuro-mit-913-08",
     "title": "I numeri nel cervello",
     "minutes": 11,
     "watch": {
      "label": "Lezione 13: Number (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-13-number/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 13 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l13/"
      }
     ],
     "sections": [
      {
       "h": "Un senso del numero condiviso",
       "text": "Usiamo le quantità di continuo: per scegliere la fila più corta al supermercato, per dare il resto, per capire quale piatto ha più patatine. Anche gli animali ne hanno bisogno. Un pesce isolato si unisce al banco più numeroso, dove rischia meno di essere mangiato. I leoni valutano se il loro gruppo è più numeroso di quello rivale prima di attaccare. I maschi di rana túngara, durante il corteggiamento, rispondono al richiamo di un rivale aggiungendo un elemento in più al proprio. Il neuroscienziato francese Stanislas Dehaene ha proposto che animali, neonati e adulti condividano un senso del numero (number sense) biologico e specifico. Questo senso ha tre caratteristiche. È approssimativo: stima le quantità grandi senza contarle. È astratto: vale per oggetti visti, suoni ascoltati o eventi nel tempo. E si può usare per operazioni, come sommare due insiemi a occhio. Un problema pratico, emerso subito in classe, è che il numero va di pari passo con altre proprietà, come l'area totale o la densità dei punti: gli sperimentatori devono variarle di volta in volta per essere sicuri di misurare davvero il numero."
      },
      {
       "h": "La legge di Weber",
       "text": "Guarda due nuvole di punti per un istante e di' quale ne ha di più. Con 16 contro 32 gli adulti non sbagliano quasi mai; con 16 contro 17 tirano a indovinare. Ciò che conta non è la differenza assoluta ma il rapporto tra le quantità: distinguere 8 da 16 è facile quanto distinguere 16 da 32. È la legge di Weber, la stessa che vale per la luminosità, il peso o il volume dei suoni. Il sistema che fa queste stime si chiama sistema numerico approssimativo (approximate number system, ANS), e la sua precisione si misura con la frazione di Weber, cioè il rapporto minimo che una persona riesce a distinguere. Le differenze individuali sono grandi: la precisione migliora lentamente con l'età e raggiunge il massimo intorno ai trent'anni. Esiste anche una discalculia evolutiva, una difficoltà marcata con i numeri senza danni cerebrali e con intelligenza normale, simile alla prosopagnosia per i volti. In uno studio, la rapidità di bambini dell'asilo nel confrontare insiemi di punti prevedeva il loro successo in aritmetica anni dopo, mentre altri test non lo facevano."
      },
      {
       "h": "Neonati, api e altri animali",
       "text": "Per capire se il senso del numero richieda la scuola bisogna guardare chi non ci è mai andato. In uno studio, neonati di pochi giorni ascoltavano sequenze di sillabe e poi guardavano più a lungo un'immagine con lo stesso numero di oggetti: funzionava per 4 contro 12 e 6 contro 18, molto meno per 4 contro 8. Il senso è presente, ma grossolano. Gli animali sorprendono ancora di più. Le api, con circa un milione di neuroni contro i nostri cento miliardi, sono state addestrate ad aggiungere o togliere uno a una quantità vista, e hanno generalizzato il compito a numeri e forme nuove ben sopra il caso. Negli anni Ottanta Russell Church e Warren Meck addestrarono ratti a premere una leva per due segnali e un'altra per quattro, usando luci o suoni: presentando due luci insieme a due suoni, i ratti premevano spontaneamente la leva del quattro, segno che contavano gli eventi indipendentemente dal senso. Il limite di questi studi è che serve molta cautela nell'interpretazione: anche con le api, alcuni risultati, come la presunta comprensione dello zero, sono discussi."
      },
      {
       "h": "Il solco intraparietale",
       "text": "Nel cervello il numero è legato al lobo parietale, in particolare al solco intraparietale (intraparietal sulcus, IPS). Le lesioni danno indizi interessanti. Un paziente con danno parietale sinistro non riusciva a stimare le quantità ed era più in difficoltà con 7 meno 5 che con 7 per 5. Un altro paziente, con un danno in un'altra zona dell'emisfero sinistro, stimava bene ma non ricordava le tabelline. La spiegazione è che le tabelline sono soprattutto fatti verbali imparati a memoria, mentre sottrarre richiede di manipolare davvero le grandezze. Le immagini cerebrali mostrano attività nell'IPS durante il calcolo, ma Kanwisher è scettica sulla sua esclusività: la stessa zona si attiva in molti compiti spaziali. Un esperimento elegante lo mostra: un classificatore addestrato a distinguere i movimenti degli occhi verso sinistra e verso destra riusciva a distinguere anche sottrazioni da addizioni, come se calcolassimo spostandoci lungo una linea dei numeri mentale. Anche dimensioni e luminosità producono attività sovrapposta. Il numero, insomma, sembra appoggiarsi a un sistema più generale per le grandezze e lo spazio."
      },
      {
       "h": "Neuroni del numero e parole per contare",
       "text": "Andreas Nieder ha addestrato scimmie a ricordare per un secondo quanti punti avevano visto e a riconoscere poi lo stesso numero. Registrando nei lobi parietale e frontale ha trovato neuroni con un numero preferito, per esempio due o sei, che rispondevano un po' meno ai numeri vicini e quasi per niente a quelli lontani. Questa sintonia graduale è proprio ciò che serve per spiegare la legge di Weber. Molti di questi neuroni rispondono allo stesso numero sia per punti visti sia per suoni in sequenza, quindi la rappresentazione è astratta. E allora le parole per i numeri a che cosa servono? I Pirahã, un popolo dell'Amazzonia la cui lingua non ha parole per i numeri, sono stati studiati dal gruppo di Ted Gibson del MIT: abbinano bene insiemi piccoli, ma con insiemi più grandi le loro risposte diventano approssimative, secondo la legge di Weber. Il senso del numero approssimativo non ha bisogno del linguaggio; contare con esattezza grandi quantità sembra invece richiedere una cultura del conteggio con parole e simboli. È un esempio di come uno strumento culturale possa estendere una capacità biologica."
      }
     ],
     "keyPoints": [
      "Animali, neonati e adulti condividono un senso del numero approssimativo e astratto.",
      "La distinzione tra due quantità dipende dal loro rapporto, non dalla differenza: è la legge di Weber.",
      "La precisione del sistema numerico approssimativo varia molto tra persone e sembra prevedere le abilità aritmetiche.",
      "Il solco intraparietale è coinvolto nei numeri, ma si sovrappone a sistemi per lo spazio e le grandezze.",
      "Nelle scimmie esistono neuroni sintonizzati su numeri specifici, con risposta graduale ai numeri vicini.",
      "Contare con esattezza grandi quantità richiede strumenti culturali come le parole per i numeri."
     ],
     "terms": [
      {
       "t": "Senso del numero (number sense)",
       "d": "Capacità di stimare e confrontare quantità senza contare, presente in animali e neonati."
      },
      {
       "t": "Legge di Weber",
       "d": "Principio per cui la differenza minima percepibile tra due stimoli cresce in proporzione alla loro grandezza."
      },
      {
       "t": "Sistema numerico approssimativo (ANS)",
       "d": "Il sistema mentale che rappresenta le quantità in modo approssimato, con precisione limitata dal rapporto tra i numeri."
      },
      {
       "t": "Frazione di Weber",
       "d": "Il rapporto minimo tra due quantità che una persona riesce a distinguere in modo affidabile."
      },
      {
       "t": "Discalculia evolutiva",
       "d": "Difficoltà specifica e persistente con i numeri, senza danni cerebrali e con intelligenza nella norma."
      },
      {
       "t": "Solco intraparietale (IPS)",
       "d": "Solco del lobo parietale coinvolto nella rappresentazione dei numeri, delle grandezze e dello spazio."
      },
      {
       "t": "Acalculia",
       "d": "Perdita della capacità di calcolo dopo un danno cerebrale."
      }
     ],
     "quiz": [
      {
       "q": "Secondo la legge di Weber, quale coppia è più facile da distinguere a colpo d'occhio, senza contare?",
       "options": [
        "30 contro 33 punti",
        "10 contro 20 punti",
        "50 contro 55 punti",
        "100 contro 105 punti"
       ],
       "answer": 1,
       "why": "Conta il rapporto: 10 contro 20 è un rapporto di 1 a 2, molto più facile di 30 contro 33 o 50 contro 55, che differiscono solo del 10%. Anche se 100 e 105 differiscono di 5 unità, il rapporto è vicinissimo a 1."
      },
      {
       "q": "Un esperimento mostra due gruppi di punti in cui il gruppo più numeroso occupa sempre anche più spazio. Qual è il problema?",
       "options": [
        "I punti dovrebbero essere colorati",
        "Il numero di punti è troppo basso",
        "Il numero è confuso con l'area occupata, quindi non si sa quale delle due proprietà si misura",
        "I partecipanti dovrebbero contare i punti ad alta voce"
       ],
       "answer": 2,
       "why": "Se numero e area variano insieme, una scelta corretta può dipendere dall'area. Bisogna variare dimensioni e densità in modo che non siano legate al numero. Contare ad alta voce misurerebbe un'altra abilità."
      },
      {
       "q": "Un paziente dopo un ictus sa ancora che 6 per 7 fa 42 ma fatica con 7 meno 5 e con le stime di quantità. Quale interpretazione è coerente con la lezione?",
       "options": [
        "Il danno ha colpito il sistema delle grandezze, mentre le tabelline sono fatti verbali memorizzati",
        "Il paziente ha perso la memoria verbale",
        "Il paziente ha un problema di vista",
        "Moltiplicare è sempre più facile che sottrarre per tutti"
       ],
       "answer": 0,
       "why": "Le tabelline si recuperano come frasi imparate; la sottrazione richiede di manipolare le quantità. Un danno parietale colpisce quest'ultima capacità. Se avesse perso la memoria verbale, le tabelline sarebbero state le prime a sparire."
      },
      {
       "q": "Un neurone di scimmia risponde al massimo a 4 punti, un po' meno a 3 e 5, quasi niente a 1 o 8. Perché questo profilo è importante?",
       "options": [
        "Perché dimostra che le scimmie sanno contare a voce",
        "Perché mostra che il neurone risponde solo ai colori",
        "Perché prova che il numero è rappresentato solo nel lobo frontale",
        "Perché una sintonia graduale spiega perché i numeri vicini si confondono, come prevede la legge di Weber"
       ],
       "answer": 3,
       "why": "Se i neuroni per 4 rispondono anche a 3 e 5, numeri vicini producono attività simili e si confondono facilmente. Le scimmie non parlano, e neuroni simili sono stati trovati sia nel lobo parietale sia in quello frontale."
      },
      {
       "q": "I Pirahã, la cui lingua non ha parole per i numeri, abbinano bene insiemi piccoli ma in modo approssimativo quelli grandi. Che cosa suggerisce?",
       "options": [
        "Che il senso del numero richiede il linguaggio",
        "Che il senso approssimativo non richiede parole, ma il conteggio esatto di grandi quantità sì",
        "Che i Pirahã hanno un deficit visivo",
        "Che nessun essere umano sa stimare le quantità senza scuola"
       ],
       "answer": 1,
       "why": "Le stime approssimative restano, perché dipendono da un sistema condiviso con animali e neonati. Ciò che manca è l'esattezza per le quantità grandi, che dipende da strumenti culturali come le parole per contare."
      }
     ],
     "explain": "Spiega a un amico perché distinguere 8 caramelle da 16 è facile quanto distinguere 50 da 100, ma 50 da 55 è difficile.",
     "apply": "Al supermercato, prima di contare, stima quante persone ci sono in due file diverse e quale avanzerà più in fretta. Poi conta e verifica: con quali rapporti la tua stima sbaglia di più?"
    },
    {
     "id": "neuro-mit-913-09",
     "title": "Udito e parlato",
     "minutes": 11,
     "watch": {
      "label": "Lezione 15: Hearing and Speech (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-15-hearing-and-speech/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 15 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l15/"
      }
     ],
     "sections": [
      {
       "h": "Che cosa ci dice un suono",
       "text": "Con gli occhi chiusi capiamo moltissimo: in che tipo di stanza siamo, che cosa sta succedendo, da dove arriva un rumore, chi sta parlando e che cosa dice. In classe Kanwisher fa cadere oggetti sul tavolo e gli studenti, a occhi chiusi, riconoscono se sono di legno o di plastica. Eppure il suono è un segnale poverissimo: una sola onda di pressione che comprime e dirada l'aria e arriva ai timpani. Per studiarlo si usa lo spettrogramma, un grafico che mostra nel tempo quanta energia c'è a ogni frequenza. Un fischio è quasi una riga sola; un trombone mostra molte righe parallele, le armoniche, multipli di una frequenza di base che dà l'altezza della nota. Il parlato veloce appare soprattutto come una serie di strisce verticali, perché le consonanti sono brevi esplosioni di rumore, mentre le vocali, allungate, mostrano bande armoniche. Il punto chiave è che da questo unico segnale il cervello ricava oggetti, persone, parole e luoghi. Come per la vista, la parte difficile non è ricevere il segnale, ma interpretarlo."
      },
      {
       "h": "Tre problemi difficili",
       "text": "Il primo problema è l'invarianza. La stessa parola detta da persone diverse produce spettrogrammi molto diversi, e la stessa persona che dice parole diverse anche: per capire le parole bisogna ignorare la voce, per riconoscere la voce bisogna ignorare le parole. Il secondo è l'effetto cocktail party, descritto negli anni Cinquanta: in una sala affollata i suoni di tutti si sommano nell'aria e noi riusciamo comunque a seguire una conversazione. Separare le sorgenti è come risolvere x più y uguale 9: infinite soluzioni, a meno di usare conoscenze su come sono fatti i suoni naturali. Il terzo è il riverbero: il suono arriva diretto e poi rimbalza sulle pareti, sovrapponendo copie ritardate che rendono lo spettrogramma sfocato. Josh McDermott e James Traer hanno registrato il riverbero in moltissimi luoghi reali e hanno scoperto regolarità costanti, per esempio nel modo in cui si spegne alle diverse frequenze. Quando si fa ascoltare un riverbero artificiale che viola queste regole, le persone non riescono più a separare voce e stanza. Il cervello, insomma, conosce la fisica degli ambienti, come per i colori conosce quella della luce."
      },
      {
       "h": "Dalla coclea alla corteccia uditiva",
       "text": "Il suono attraversa il condotto uditivo, fa vibrare il timpano e tre piccoli ossicini, e arriva alla coclea, l'organo a forma di chiocciola dell'orecchio interno. Qui avviene una specie di analisi delle frequenze fatta dalla fisica: la base della coclea vibra con i suoni acuti, la punta con quelli gravi, e le cellule nervose in ogni punto informano il cervello su quanta energia c'è a quella frequenza. Rispetto alla vista, la via uditiva ha molte più stazioni intermedie nel tronco encefalico prima di raggiungere la corteccia. La corteccia uditiva primaria (A1), nascosta in un solco sul lobo temporale, conserva una mappa delle frequenze, la tonotopia. Negli animali i suoi neuroni funzionano come filtri per schemi di frequenza nel tempo, per esempio un suono che sale o scende. Sam Norman-Haignere e McDermott hanno costruito suoni sintetici che stimolano questi filtri esattamente come i suoni originali ma suonano strani: il parlato diventa incomprensibile. A1 risponde quasi allo stesso modo ai due tipi di suono, mentre le regioni vicine distinguono nettamente l'originale dal falso. È lì che comincia l'elaborazione di alto livello."
      },
      {
       "h": "Fonemi: i mattoni del parlato",
       "text": "Un fonema è un suono che in una lingua cambia il significato di una parola. Ogni lingua ha i suoi: il giapponese non distingue la R dalla L, l'hindi distingue due D che a un orecchio italiano o inglese sembrano uguali, e alcune lingue dell'Africa meridionale, come lo xhosa, usano gli schiocchi della lingua come consonanti. Tra «ba» e «pa» la differenza è un intervallo di poche decine di millisecondi tra l'apertura delle labbra e l'inizio della vibrazione delle corde vocali: sullo spettrogramma è quasi invisibile, eppure la sentiamo subito. Il parlato è difficile anche perché i suoni si sovrappongono e cambiano con la velocità e con chi parla: le vocali di persone diverse occupano zone che si intrecciano. Per questo ci abituiamo alla voce di chi ascoltiamo, e una frase in cui ogni parola fosse pronunciata da una persona diversa sarebbe faticosissima. Vale anche il contrario: riconosciamo meglio le voci nella nostra lingua. Uno studio del laboratorio di John Gabrieli al MIT ha mostrato che le persone con dislessia non hanno questo vantaggio, coerente con l'idea che la dislessia nasca da difficoltà nell'elaborazione dei suoni del parlato."
      },
      {
       "h": "Una regione per il parlato",
       "text": "Appena fuori dalla corteccia uditiva primaria, lungo la parte superiore del lobo temporale, c'è una fascia di corteccia che risponde in modo selettivo al parlato. Nei dati del laboratorio di Kanwisher, con 165 suoni diversi, la risposta più forte arriva dal parlato, compreso quello in lingue straniere che i partecipanti non capiscono; seguono il canto, poi i suoni vocali senza parole come risate e sospiri, mentre versi di animali, sirene e musica strumentale restano molto più in basso. Il fatto che una lingua sconosciuta funzioni bene indica che la regione risponde alle proprietà sonore del parlato, non al significato. Le registrazioni con elettrodi nei pazienti mostrano una selettività ancora più netta, e in alcuni casi zone vicine sensibili a intonazione, identità di chi parla e contenuto delle frasi. Kanwisher insiste su una distinzione che anche molti ricercatori trascurano: parlato e linguaggio non sono la stessa cosa. Riconoscere i suoni delle parole è un passo; capire chi ha fatto che cosa a chi in una frase è un altro, che coinvolge una rete diversa, come vedremo nella lezione sul linguaggio."
      }
     ],
     "keyPoints": [
      "Il suono è un unico segnale di pressione da cui il cervello ricava sorgenti, voci, parole e ambienti.",
      "Ascoltare richiede di risolvere problemi mal posti: invarianza, separazione delle sorgenti e riverbero.",
      "Il cervello usa conoscenze implicite sulla fisica dei suoni naturali, per esempio su come si comporta il riverbero.",
      "La coclea separa le frequenze e la corteccia uditiva primaria ne conserva una mappa ordinata.",
      "I fonemi variano da lingua a lingua e distinguerli richiede di cogliere differenze di pochi millisecondi.",
      "Una regione lungo il lobo temporale risponde al parlato anche in lingue sconosciute: parlato e linguaggio sono distinti."
     ],
     "terms": [
      {
       "t": "Spettrogramma",
       "d": "Grafico che mostra come l'energia di un suono si distribuisce tra le frequenze nel corso del tempo."
      },
      {
       "t": "Armoniche",
       "d": "Frequenze multiple di una frequenza di base, tipiche dei suoni intonati come voce e strumenti musicali."
      },
      {
       "t": "Effetto cocktail party",
       "d": "Capacità di seguire una voce in mezzo a molte altre che si sovrappongono."
      },
      {
       "t": "Riverbero",
       "d": "Insieme delle riflessioni del suono sulle superfici di un ambiente, che arrivano all'orecchio in ritardo."
      },
      {
       "t": "Coclea",
       "d": "Organo dell'orecchio interno a forma di chiocciola che scompone il suono nelle sue frequenze."
      },
      {
       "t": "Tonotopia",
       "d": "Organizzazione della corteccia uditiva in una mappa ordinata delle frequenze, dai suoni gravi agli acuti."
      },
      {
       "t": "Fonema",
       "d": "Unità di suono che in una certa lingua distingue una parola da un'altra, come B e P in «bollo» e «pollo»."
      }
     ],
     "quiz": [
      {
       "q": "Al telefono riconosci subito tua madre qualunque cosa dica, e capisci le sue parole qualunque sia il tono. Quale problema computazionale sta risolvendo il tuo cervello?",
       "options": [
        "Il problema del riverbero",
        "La tonotopia",
        "La traduzione tra lingue",
        "L'invarianza: separare chi parla da che cosa dice"
       ],
       "answer": 3,
       "why": "Per riconoscere la voce bisogna ignorare le variazioni dovute alle parole, e viceversa: è il problema dell'invarianza. Il riverbero riguarda le riflessioni dell'ambiente, la tonotopia è una mappa della corteccia, non un problema da risolvere."
      },
      {
       "q": "In un esperimento si aggiunge a una voce un riverbero artificiale con proprietà che non esistono in natura, e le persone faticano a capire la voce. Che cosa suggerisce?",
       "options": [
        "Che il cervello usa conoscenze sulle regolarità del riverbero reale per separare voce e ambiente",
        "Che il riverbero artificiale è più forte di quello naturale",
        "Che le persone hanno un difetto di udito",
        "Che il riverbero non conta nella comprensione"
       ],
       "answer": 0,
       "why": "Se basta violare le regolarità fisiche del riverbero per peggiorare la comprensione, il cervello deve sfruttare quelle regolarità. Non serve un riverbero più forte: è la sua stranezza a creare il problema."
      },
      {
       "q": "Un paziente ha un danno nella parte della coclea più vicina alla base. Che cosa sentirà peggio?",
       "options": [
        "I suoni gravi, come un contrabbasso",
        "Tutti i suoni allo stesso modo",
        "I suoni acuti, come un fischietto",
        "Solo il parlato in lingue straniere"
       ],
       "answer": 2,
       "why": "Nella coclea la base risponde alle frequenze alte e la punta a quelle basse. Un danno alla base colpisce quindi i suoni acuti. La perdita dell'udito per gli acuti è infatti comune con l'età e l'esposizione al rumore."
      },
      {
       "q": "La regione selettiva per il parlato risponde molto anche a frasi in una lingua che i partecipanti non conoscono. Che cosa se ne deduce?",
       "options": [
        "Che la regione elabora il significato delle frasi",
        "Che la regione risponde alle proprietà sonore del parlato, non al suo significato",
        "Che i partecipanti capivano in realtà la lingua",
        "Che la regione risponde a qualunque suono"
       ],
       "answer": 1,
       "why": "Se il significato fosse decisivo, una lingua sconosciuta darebbe una risposta debole. Inoltre la regione risponde poco a musica strumentale, versi animali e sirene, quindi non reagisce a qualunque suono."
      },
      {
       "q": "Un adulto giapponese che ha imparato l'inglese tardi confonde «right» e «light». Qual è la spiegazione più coerente con la lezione?",
       "options": [
        "Ha un difetto della coclea",
        "Non presta attenzione quando ascolta",
        "La R e la L producono suoni identici",
        "Nella sua lingua R e L non sono fonemi distinti, e il suo sistema percettivo si è tarato su quella lingua"
       ],
       "answer": 3,
       "why": "I fonemi sono specifici di ogni lingua: chi cresce con il giapponese non ha bisogno di distinguere R e L e la sua percezione si adatta di conseguenza. I due suoni sono acusticamente diversi, ma la differenza non viene sfruttata."
      }
     ],
     "explain": "Spiega a un amico perché seguire una conversazione in un locale affollato è un problema matematicamente difficile, e come il cervello riesce a risolverlo.",
     "apply": "In un ambiente rumoroso, come un bar, chiudi gli occhi per un minuto e prova a contare e identificare le sorgenti sonore che senti. Poi prova a seguire una sola voce: nota quali indizi usi, come tono, direzione e ritmo."
    },
    {
     "id": "neuro-mit-913-10",
     "title": "La musica nel cervello",
     "minutes": 11,
     "watch": {
      "label": "Lezione 16: Music (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-16-music/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 16 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l16/"
      }
     ],
     "sections": [
      {
       "h": "Un'abilità umana e universale",
       "text": "Con la musica il corso passa alle capacità tipicamente umane, più affascinanti ma più difficili da studiare perché mancano modelli animali. La musica è presente in tutte le culture conosciute, i flauti d'osso più antichi hanno circa 40.000 anni e il canto è probabilmente ancora più vecchio. Il canto degli uccelli non è un vero equivalente: è molto meno flessibile e interessa all'uccello soprattutto quando segnala un partner o un rivale. Perché esiste la musica? Darwin la trovava misteriosa, perché non sembra servire alla sopravvivenza, e ipotizzò che fosse nata per la selezione sessuale, magari prima del linguaggio. Lo psicologo Sam Mehr di Harvard propone che il canto ai neonati serva a rassicurarli e a gestire il bisogno di attenzione dei piccoli. All'estremo opposto Steven Pinker ha definito la musica una «cheesecake uditiva» (auditory cheesecake): un piacere costruito sfruttando meccanismi nati per altro, come il linguaggio, senza essere un adattamento. Il bello è che l'ipotesi di Pinker si può mettere alla prova: se la musica prende in prestito i circuiti del linguaggio, nel cervello dovremmo vederli condivisi."
      },
      {
       "h": "Che cosa sentono i neonati",
       "text": "Trovare un circuito specializzato non basterebbe a dimostrare che la musica è innata: anche l'area della lettura è specializzata, eppure è appresa. E i neonati hanno già ascoltato suoni nell'utero. Per questo i ricercatori si chiedono quanto presto e quanto in fretta una capacità compare. I risultati sono notevoli. Neonati di due o tre giorni, addormentati, mostrano all'EEG una risposta di sorpresa quando in un ritmo regolare manca un colpo atteso: percepiscono il battito, non solo i cambiamenti di suono. A cinque o sei mesi riconoscono una melodia familiare anche trasportata in un'altra tonalità, segno che usano le relazioni tra le note e non le note assolute. A sei mesi i bambini nordamericani notano errori sia nei ritmi occidentali regolari sia in quelli irregolari tipici della musica balcanica; a dodici mesi notano solo quelli della propria cultura. È lo stesso restringimento percettivo visto per volti e fonemi: il sistema parte aperto e si specializza sulla musica che sente. Gli adulti possono ancora imparare ritmi nuovi, ma solo con molta pratica."
      },
      {
       "h": "Che cosa hanno in comune le musiche del mondo",
       "text": "Definire la musica è sorprendentemente difficile, e Kanwisher suggerisce di partire dagli esempi su cui quasi tutti sono d'accordo. Un'analisi di 304 registrazioni da tutto il mondo, pubblicata nel 2015 da Patrick Savage e colleghi, non ha trovato nessuna proprietà presente in assoluto ovunque, ma molte tendenze comuni. La più diffusa è usare un piccolo insieme di altezze distinte, di solito sette o meno, organizzate in scale con intervalli non tutti uguali. Molto comune è anche una pulsazione regolare su cui si organizza il ritmo. La musica, inoltre, è quasi sempre sociale: per gran parte della storia umana la si è fatta e ascoltata in gruppo. E la preferenza per gli accordi consonanti? Il gruppo di Josh McDermott ha studiato gli Tsimane', una popolazione dell'Amazzonia boliviana con pochissimo contatto con la musica occidentale: non preferivano gli intervalli consonanti a quelli dissonanti, a differenza degli ascoltatori occidentali. Una preferenza che sembrava naturale si rivela in buona parte culturale. È un buon promemoria: ciò che ci sembra ovvio può dipendere dalla musica con cui siamo cresciuti."
      },
      {
       "h": "Amusia: quando le note non tornano",
       "text": "Alcune persone, dopo un danno cerebrale, non riconoscono più melodie familiari pur capendo normalmente il parlato e seguendo il ritmo. Altre nascono con un'amusia congenita, stimata nel corso intorno al 4% della popolazione: non si accorgono delle note stonate e spesso dicono di non trovare piacere nella musica. A lungo si è pensato che l'amusia fosse un disturbo specifico della musica. Test più accurati mostrano invece difficoltà con l'altezza dei suoni anche fuori dalla musica: alcune persone con amusia congenita faticano a capire dall'intonazione se una frase è una domanda o un'affermazione, quando le parole sono identiche. Questo fa pensare che il problema riguardi soprattutto la percezione dell'altezza più che la musica in sé. Ma il quadro è più complicato: alcuni amusici hanno anche problemi di ritmo, e separare ritmo e melodia è difficile, perché quasi ogni melodia ha un battito. È un esempio di come un deficit apparentemente netto possa rivelare, a un esame attento, confini diversi da quelli che ci aspettavamo, e di come la scelta dei test decida le conclusioni."
      },
      {
       "h": "Popolazioni neurali per la musica",
       "text": "Molti studi avevano sostenuto che musica e linguaggio condividono l'area di Broca, ma si basavano su medie di gruppo, che possono creare sovrapposizioni inesistenti nei singoli individui. Ev Fedorenko ha localizzato le regioni del linguaggio in ogni persona e ha visto che non rispondono più alla musica intatta che a quella rimescolata. Il colpo decisivo è venuto da un approccio senza ipotesi. Sam Norman-Haignere, McDermott e Kanwisher hanno fatto ascoltare 165 suoni a dieci persone e hanno analizzato le risposte di circa 11.000 voxel senza dire all'algoritmo quali suoni fossero. L'analisi ha trovato sei componenti: quattro legate a proprietà acustiche, una al parlato e una alla musica, strumentale o cantata, situata davanti e dietro la corteccia uditiva primaria. Il risultato è stato replicato in persone con e senza formazione musicale, quindi non dipende dallo studio di uno strumento. Le registrazioni con elettrodi in alcuni pazienti hanno confermato zone molto selettive per la musica e persino per il canto. La conclusione provvisoria smentisce Pinker: la musica sembra avere un macchinario proprio, distinto da quello del linguaggio."
      }
     ],
     "keyPoints": [
      "La musica è universale e antica: i flauti d'osso più antichi hanno circa 40.000 anni.",
      "Le teorie vanno dalla selezione sessuale di Darwin alla «cheesecake uditiva» di Pinker, che la considera un sottoprodotto.",
      "I neonati percepiscono il battito; nel primo anno la sensibilità al ritmo si restringe sulla musica della propria cultura.",
      "Molte musiche usano poche altezze distinte e una pulsazione regolare; la preferenza per la consonanza è in buona parte culturale.",
      "L'amusia riguarda soprattutto l'altezza dei suoni, anche nel parlato, ma a volte anche il ritmo.",
      "Nella corteccia uditiva esistono popolazioni neurali selettive per la musica, distinte da quelle per il parlato e il linguaggio."
     ],
     "terms": [
      {
       "t": "Cheesecake uditiva (auditory cheesecake)",
       "d": "Espressione di Steven Pinker per descrivere la musica come piacere che sfrutta meccanismi nati per altri scopi."
      },
      {
       "t": "Altezza relativa",
       "d": "Capacità di riconoscere una melodia dalle relazioni tra le note, anche se suonata partendo da una nota diversa."
      },
      {
       "t": "Consonanza",
       "d": "Qualità degli intervalli che a orecchie occidentali suonano stabili e piacevoli, legata ai rapporti tra le frequenze."
      },
      {
       "t": "Amusia congenita",
       "d": "Difficoltà presente dalla nascita a percepire le differenze di altezza e a riconoscere le melodie."
      },
      {
       "t": "Pulsazione (beat)",
       "d": "Il battito regolare su cui si organizza il ritmo di un brano, quello che si segue battendo il piede."
      },
      {
       "t": "Scomposizione delle risposte",
       "d": "Analisi statistica che trova, senza ipotesi iniziali, i profili di risposta ricorrenti in migliaia di voxel."
      }
     ],
     "quiz": [
      {
       "q": "Pinker sostiene che la musica sfrutti i circuiti del linguaggio. Quale risultato lo metterebbe più in difficoltà?",
       "options": [
        "Le regioni del linguaggio, localizzate in ogni persona, non rispondono più alla musica intatta che a quella rimescolata",
        "La musica è presente in tutte le culture",
        "I neonati amano le ninne nanne",
        "I musicisti professionisti hanno un buon orecchio"
       ],
       "answer": 0,
       "why": "Se la musica usasse il macchinario del linguaggio, le regioni del linguaggio dovrebbero reagire alla struttura musicale. Il fatto che non lo facciano va contro l'ipotesi. Gli altri dati non dicono nulla sui circuiti condivisi."
      },
      {
       "q": "Un bambino di 12 mesi cresciuto in Italia non nota errori in un ritmo balcanico irregolare, mentre a 6 mesi li notava. Come si spiega?",
       "options": [
        "Ha perso l'udito per i suoni acuti",
        "Il restringimento percettivo ha specializzato il suo sistema sui ritmi della musica che ascolta",
        "I ritmi balcanici sono troppo veloci per qualsiasi bambino",
        "Il suo cervello non ha ancora sviluppato il senso del ritmo"
       ],
       "answer": 1,
       "why": "A sei mesi i bambini sono sensibili a ritmi di molte culture; a dodici mantengono soprattutto quelli familiari. È lo stesso fenomeno osservato per fonemi e volti, non un difetto o un ritardo."
      },
      {
       "q": "Gli Tsimane' della Bolivia non preferiscono gli accordi consonanti a quelli dissonanti. Che cosa implica questo dato?",
       "options": [
        "Che gli Tsimane' hanno un udito diverso dal nostro",
        "Che la consonanza non esiste dal punto di vista fisico",
        "Che la preferenza per la consonanza dipende molto dall'esposizione culturale",
        "Che la musica non è universale"
       ],
       "answer": 2,
       "why": "Se la preferenza fosse innata e universale, dovrebbe comparire anche in chi ha ascoltato poca musica occidentale. La consonanza ha basi fisiche nei rapporti tra frequenze, ma piacere o meno dipende dalla cultura."
      },
      {
       "q": "Una persona con amusia congenita fatica a capire se «Vieni stasera» detto da un amico è una domanda o un'affermazione. Che cosa suggerisce?",
       "options": [
        "Che ha un problema di comprensione del significato delle parole",
        "Che non conosce bene l'italiano",
        "Che l'amusia riguarda solo la musica classica",
        "Che il deficit riguarda la percezione dell'altezza, anche fuori dalla musica"
       ],
       "answer": 3,
       "why": "Domanda e affermazione si distinguono qui solo per l'intonazione, cioè per l'andamento dell'altezza della voce. La difficoltà mostra che il problema è percettivo e va oltre la musica."
      },
      {
       "q": "Lo studio con 165 suoni ha trovato una componente selettiva per la musica anche in persone senza formazione musicale. Perché questo dettaglio conta?",
       "options": [
        "Perché mostra che la selettività non dipende dall'aver studiato uno strumento",
        "Perché dimostra che la musica è innata",
        "Perché prova che i musicisti hanno un cervello peggiore",
        "Perché indica che la componente è in realtà legata al linguaggio"
       ],
       "answer": 0,
       "why": "Se la componente comparisse solo nei musicisti, potrebbe essere frutto dell'allenamento specifico. Trovarla in tutti la rende una proprietà generale del cervello umano, anche se questo da solo non prova che sia innata."
      }
     ],
     "explain": "Spiega a un amico perché scoprire una zona del cervello dedicata alla musica non basta a dimostrare che la musica sia innata.",
     "apply": "Ascolta un brano di una tradizione musicale lontana dalla tua, per esempio musica balcanica, indiana o dell'Africa centrale. Prova a battere il piede a tempo e annota dove perdi il ritmo: è il segno del restringimento percettivo."
    },
    {
     "id": "neuro-mit-913-11",
     "title": "Linguaggio e pensiero",
     "minutes": 11,
     "watch": {
      "label": "Lezione 18: Language I (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-18-language-i/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 18 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l18/"
      }
     ],
     "sections": [
      {
       "h": "Che cosa rende unico il linguaggio",
       "text": "Il linguaggio trasforma idee astratte in suoni, o in gesti, che fanno nascere idee simili nella testa di chi ascolta. Esistono circa 7.000 lingue, comprese le lingue dei segni, tutte ugualmente capaci di esprimere qualunque cosa. Per capire che cosa lo rende speciale Kanwisher mostra Chaser, una border collie che conosce i nomi di circa mille giocattoli. Chaser riesce persino a dedurre che una parola nuova indica l'unico giocattolo che non ha ancora un nome, la stessa regola che usano i bambini. Ma non può capire chi ha fatto che cosa a chi: per lei «lo squalo morde l'uomo» e «l'uomo morde lo squalo» sarebbero la stessa cosa. Il linguaggio umano è composizionale: combina parole in frasi mai sentite prima. Ha diversi livelli: la fonologia, cioè il sistema dei suoni; il lessico, il significato delle parole; la sintassi, le regole che le combinano; la pragmatica, ciò che intendiamo davvero, come quando «sai dov'è il sale?» è una richiesta di passarlo. La lezione si concentra su significato e sintassi, il cuore di ciò che chiamiamo linguaggio, e pone tre domande: è separato dal pensiero? Ha parti distinte? Come rappresenta il significato?"
      },
      {
       "h": "Broca, Wernicke e le afasie",
       "text": "Nel 1861 il medico francese Paul Broca presentò a Parigi il caso di un paziente soprannominato Tan, perché dopo una lesione al lobo frontale sinistro riusciva a dire quasi soltanto quella sillaba. Broca notò che Tan capiva e ragionava molto più di quanto riuscisse a esprimere, e ne concluse che il lobo frontale sinistro fosse la sede della parola articolata. Era una tesi controcorrente: molti allora negavano che le funzioni avessero una sede precisa. Nel 1874 il neurologo tedesco Carl Wernicke descrisse pazienti con lesioni nel lobo temporale che parlavano fluentemente ma capivano poco. Da allora le difficoltà di linguaggio dovute a un danno cerebrale si chiamano afasie (aphasia). Anche alcune condizioni genetiche mostrano che linguaggio e intelligenza generale possono separarsi: le persone con sindrome di Williams hanno spesso gravi difficoltà spaziali e pratiche ma un linguaggio ricco ed espressivo. Un errore frequente è pensare che le aree di Broca e Wernicke siano due punti precisi e uguali per tutti: oggi si parla piuttosto di una rete di regioni, la cui posizione esatta varia da persona a persona."
      },
      {
       "h": "Si può pensare senza parole?",
       "text": "I neonati ragionano prima di parlare e molti animali risolvono problemi complessi senza linguaggio. Ma la prova più forte viene da adulti che il linguaggio lo hanno perso. La neuropsicologa Rosemary Varley ha studiato pazienti con afasia globale dovuta a grandi lesioni dell'emisfero sinistro: non riuscivano a nominare figure né a capire frasi reversibili come «il ragazzo bacia la ragazza», in cui solo la sintassi dice chi fa che cosa. Eppure risolvevano problemi di aritmetica e di logica, apprezzavano la musica, capivano che cosa pensavano gli altri e giudicavano correttamente chi faceva che cosa a chi nelle scene illustrate. Il critico d'arte Tom Lubbock, che perse gradualmente il linguaggio per un tumore, scrisse che i suoi pensieri restavano ampi e normali anche quando le parole mancavano. Questo non significa che il linguaggio sia irrilevante. È cruciale nello sviluppo: i bambini sordi che imparano tardi una lingua dei segni capiscono più tardi le credenze altrui. E rende salienti certe informazioni: chi parla il kuuk thaayorre, in Australia, usa i punti cardinali invece di destra e sinistra, e sa sempre dov'è il nord. Il linguaggio orienta il pensiero, ma non lo contiene tutto."
      },
      {
       "h": "Il tranello delle medie di gruppo",
       "text": "Per vent'anni molti studi di risonanza hanno riportato che le aree del linguaggio si attivano anche durante il calcolo, la musica e altri compiti, in contrasto con i pazienti di Varley. Kanwisher e Ev Fedorenko hanno individuato il motivo nelle analisi di gruppo. In queste analisi si allineano i cervelli di molte persone per la loro anatomia e si cerca ciò che è attivo in media. Ma le regioni funzionali cambiano un po' posizione da persona a persona. Se in ogni individuo il linguaggio attiva una zona e l'aritmetica una zona vicina ma separata, la media di molti cervelli, un po' sfocata, può far sembrare che le due attività si sovrappongano anche se in nessun singolo cervello lo fanno. È come sovrapporre le foto di cento persone e concludere che naso e bocca occupano lo stesso punto. La soluzione è l'allineamento funzionale: trovare le regioni del linguaggio in ogni persona con un localizzatore e poi misurare come rispondono agli altri compiti. È la stessa logica usata per l'area dei volti, e ha cambiato le conclusioni di un intero campo di studi."
      },
      {
       "h": "La rete del linguaggio",
       "text": "Il localizzatore di Fedorenko è semplice: si confronta la lettura o l'ascolto di frasi con quello di liste di non-parole, sequenze che somigliano a parole ma non hanno significato né sintassi. Il risultato è affidabile: le stesse regioni compaiono ripetendo la scansione, leggendo o ascoltando, e nei bilingui in entrambe le lingue. Si tratta di regioni del lobo frontale e temporale, soprattutto a sinistra. Poi viene il test cruciale. Fedorenko e Kanwisher hanno chiesto alle stesse persone di fare calcoli, compiti di memoria spaziale, esercizi di controllo cognitivo e di ascoltare musica. Questi compiti attivavano molte zone del cervello, ma le regioni del linguaggio, identificate in ciascun individuo, rispondevano pochissimo. La rete del linguaggio è quindi molto selettiva, in perfetto accordo con i pazienti afasici che ragionano bene. La sintesi di Kanwisher è che il linguaggio è distinto dal resto del pensiero, probabilmente necessario per imparare a pensare durante lo sviluppo, ma non per ragionare una volta adulti. Un limite: questo riguarda frasi e significati, non il parlato o la pragmatica, che dipendono da altri sistemi."
      }
     ],
     "keyPoints": [
      "Il linguaggio umano è composizionale: combina parole in frasi nuove e codifica chi fa che cosa a chi.",
      "Broca e Wernicke descrissero nell'Ottocento deficit di produzione e di comprensione dopo lesioni dell'emisfero sinistro.",
      "Pazienti con afasia globale fanno aritmetica, ragionano sugli altri e apprezzano la musica: il pensiero sopravvive al linguaggio.",
      "Il linguaggio resta cruciale nello sviluppo e rende salienti alcune informazioni, come l'orientamento.",
      "Le medie di gruppo possono creare sovrapposizioni false; servono localizzatori individuali.",
      "La rete del linguaggio risponde a frasi e quasi per niente a calcolo, memoria di lavoro, controllo cognitivo o musica."
     ],
     "terms": [
      {
       "t": "Composizionalità",
       "d": "Proprietà per cui il significato di una frase deriva dalle parole e da come sono combinate."
      },
      {
       "t": "Sintassi",
       "d": "Insieme delle regole che stabiliscono come le parole si combinano in frasi, compreso l'ordine."
      },
      {
       "t": "Pragmatica",
       "d": "Studio di ciò che i parlanti intendono davvero, oltre il significato letterale delle parole."
      },
      {
       "t": "Afasia (aphasia)",
       "d": "Disturbo del linguaggio causato da un danno cerebrale, che può colpire produzione, comprensione o entrambe."
      },
      {
       "t": "Afasia globale",
       "d": "Forma grave di afasia in cui sono compromesse sia la produzione sia la comprensione del linguaggio."
      },
      {
       "t": "Analisi di gruppo",
       "d": "Metodo che allinea anatomicamente i cervelli di molti partecipanti e ne studia l'attività media."
      },
      {
       "t": "Localizzatore del linguaggio",
       "d": "Confronto tra frasi e liste di non-parole usato per trovare le regioni del linguaggio in ogni persona."
      }
     ],
     "quiz": [
      {
       "q": "Un cane obbedisce a «porta la palla» e «porta la corda». Che cosa manca, secondo la lezione, perché si possa parlare di linguaggio umano?",
       "options": [
        "Un vocabolario più ampio",
        "La capacità di sentire i suoni",
        "La composizionalità: capire chi fa che cosa a chi combinando parole in frasi nuove",
        "La capacità di abbaiare in modi diversi"
       ],
       "answer": 2,
       "why": "Anche Chaser conosce mille nomi, quindi il vocabolario non è il punto. Ciò che manca è la sintassi che permette di distinguere «il cane morde il gatto» da «il gatto morde il cane»."
      },
      {
       "q": "Una paziente con afasia globale non capisce frasi semplici ma risolve correttamente sottrazioni e problemi di logica. Che cosa suggerisce?",
       "options": [
        "Che il ragionamento non richiede il sistema del linguaggio, almeno negli adulti",
        "Che la paziente finge di non capire",
        "Che aritmetica e linguaggio usano la stessa rete",
        "Che l'afasia non è un disturbo reale"
       ],
       "answer": 0,
       "why": "Se il pensiero dipendesse dal linguaggio, perderlo dovrebbe compromettere anche calcolo e logica. Il fatto che restino intatti indica sistemi distinti, almeno dopo lo sviluppo."
      },
      {
       "q": "In un'analisi di gruppo, linguaggio e aritmetica sembrano attivare la stessa zona; nei singoli individui le zone sono vicine ma separate. Come si spiega?",
       "options": [
        "Le persone hanno svolto i compiti in modo sbagliato",
        "Le regioni cambiano un po' posizione da persona a persona e la media le fa sembrare sovrapposte",
        "La risonanza è più precisa quando si analizza un gruppo",
        "Linguaggio e aritmetica sono la stessa funzione"
       ],
       "answer": 1,
       "why": "Mediare cervelli in cui le regioni sono in punti leggermente diversi sfoca l'immagine e crea sovrapposizioni apparenti. Per questo servono localizzatori individuali."
      },
      {
       "q": "Perché il localizzatore del linguaggio confronta frasi con liste di non-parole e non con uno schermo vuoto?",
       "options": [
        "Perché lo schermo vuoto stanca troppo i partecipanti",
        "Perché le non-parole sono più facili da leggere",
        "Perché lo schermo vuoto attiverebbe l'area dei volti",
        "Perché le non-parole mantengono gli aspetti visivi e di lettura, togliendo solo significato e sintassi"
       ],
       "answer": 3,
       "why": "È la logica della coppia minima: le non-parole hanno lettere, suoni e ritmo simili alle frasi, quindi la differenza isola il significato e la struttura. Uno schermo vuoto differirebbe in troppi aspetti."
      },
      {
       "q": "Chi parla il kuuk thaayorre sa quasi sempre dov'è il nord. Quale conclusione è coerente con la lezione?",
       "options": [
        "La lingua determina interamente i pensieri possibili",
        "Gli altri popoli non sono capaci di orientarsi",
        "La lingua rende salienti alcune informazioni e allena a tenerle presenti, senza contenere tutto il pensiero",
        "L'orientamento è una capacità solo linguistica"
       ],
       "answer": 2,
       "why": "Usare i punti cardinali in ogni frase costringe a tenere traccia della direzione, quindi la lingua orienta l'attenzione. Ma i pazienti afasici mostrano che il pensiero non coincide con il linguaggio."
      }
     ],
     "explain": "Spiega a un amico perché i pazienti con afasia globale sono una prova importante che si può pensare senza parole, e perché il linguaggio resta comunque importante.",
     "apply": "Per un giorno, quando dai indicazioni a qualcuno, prova a usare i punti cardinali invece di destra e sinistra. Annota quanto spesso devi fermarti a capire dov'è il nord e se alla fine ti viene più naturale."
    },
    {
     "id": "neuro-mit-913-12",
     "title": "Teoria della mente: pensare ai pensieri altrui",
     "minutes": 11,
     "watch": {
      "label": "Lezione 20: Mentalizing and Theory of Mind (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-20-mentalizing-theory-of-mind/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 20 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l20/"
      }
     ],
     "sections": [
      {
       "h": "Leggere le menti, ogni giorno",
       "text": "Siamo animali profondamente sociali: quasi tutto ciò che conta nella vita coinvolge altre persone, e l'isolamento è una delle punizioni più dure. Una parte enorme del nostro tempo, e della nostra corteccia, è dedicata agli altri. Kanwisher mostra un video famoso: bambini di 18 mesi vedono uno sconosciuto che, con le mani occupate, non riesce ad aprire un armadietto, e corrono ad aprirglielo. Hanno capito che cosa voleva fare e hanno deciso di aiutarlo. Vedere un'azione è solo l'inizio: la domanda difficile è perché qualcuno la compie. Quando Romeo porta alla bocca la fiala, capiamo il gesto solo se gli attribuiamo una catena di stati mentali invisibili: crede che Giulietta sia morta, sa che il liquido è veleno, vuole morire. Credenze, desideri e intenzioni non si osservano, eppure sono il modo migliore per spiegare e prevedere il comportamento. Questa capacità si chiama mentalizzazione, o teoria della mente (theory of mind). Nessun computer la possiede al nostro livello, e tra gli animali se ne trovano solo forme limitate, per esempio negli scimpanzé quando competono per il cibo."
      },
      {
       "h": "Il test della falsa credenza",
       "text": "Per verificare se un bambino attribuisce credenze bisogna usare credenze false: se la credenza è vera, il bambino può rispondere semplicemente guardando come stanno le cose. Nel classico test di Sally e Anne, Sally mette una biglia nel cestino ed esce; Anne la sposta nella scatola. Dove la cercherà Sally al ritorno? A tre anni i bambini rispondono «nella scatola», dove la biglia è davvero; verso i cinque anni rispondono «nel cestino», dove Sally crede che sia. I bambini con autismo superano il test molto più tardi o non lo superano. Ma perché falliscono? Forse il problema non è pensare ai pensieri, ma tenere a mente due versioni della realtà o ignorare quella vera. Per distinguere queste ipotesi Debbie Zaitchik inventò il test della foto falsa: una polaroid scattata prima che l'oggetto venga spostato mostra una situazione non più vera. La logica è identica, ma riguarda una foto invece di una mente. I bambini con autismo superavano il test della foto e fallivano quello della credenza. Pensare ai pensieri altrui sembra quindi una capacità distinta, non una semplice abilità logica generale."
      },
      {
       "h": "La giunzione temporo-parietale destra",
       "text": "Rebecca Saxe, allora nel laboratorio di Kanwisher, fece leggere agli adulti brevi storie nello scanner. Alcune parlavano di credenze false, altre di foto o mappe superate, come una foto satellitare di un'isola scattata prima di un'eruzione. Due regioni rispondevano di più alle storie sulle credenze: la giunzione temporo-parietale destra (right temporoparietal junction, rTPJ) e la corteccia prefrontale mediale. Ma forse rispondevano a qualunque informazione sulle persone? In un secondo esperimento le storie descrivevano l'aspetto di qualcuno, come un adolescente allampanato, oppure le sue sensazioni fisiche, come una ragazza affamata dopo aver saltato la colazione, oppure i suoi pensieri. La rTPJ rispondeva solo ai pensieri; la corteccia prefrontale mediale a tutte le storie sulle persone. Per escludere il ruolo delle parole, lo stesso effetto è stato trovato con un cortometraggio animato della Pixar senza dialoghi, confrontando i momenti in cui bisogna capire che cosa pensano i personaggi con quelli in cui provano dolore fisico. Nei bambini che guardano lo stesso film, la rTPJ continua a svilupparsi dopo i quattro anni, diventando più selettiva."
      },
      {
       "h": "Intenzioni e giudizio morale",
       "text": "Il giudizio morale dipende moltissimo da che cosa una persona sapeva e voleva. Immagina Grace, in visita a una fabbrica, che mette una polvere bianca nel caffè di un'amica. In una versione il barattolo dice «zucchero» e Grace pensa che sia zucchero, ma è veleno. In un'altra il barattolo dice «tossico», Grace lo sa, e invece è zucchero. Gli adulti giudicano la seconda Grace molto peggio della prima, anche se il danno reale l'ha fatto la prima: contano le intenzioni. I bambini arrivano a questo giudizio più tardi rispetto al test della falsa credenza. La rTPJ sembra avere un ruolo causale: nel 2010 Liane Young e colleghi hanno mostrato che la TMS su questa regione riduce il peso dato alle intenzioni: per esempio, chi ha tentato di nuocere senza riuscirci viene giudicato meno grave. Anche gli adulti con autismo ad alto funzionamento distinguono meno tra danno accidentale e intenzionale. Un esempio della vita di tutti i giorni: quando un collega cancella per errore un file importante, la tua reazione dipende quasi tutta da ciò che pensi sapesse in quel momento."
      },
      {
       "h": "Autismo e rTPJ: una storia ancora aperta",
       "text": "Che cosa succede nella rTPJ delle persone con autismo? Uno studio ampio ha confrontato 31 adulti con autismo ad alto funzionamento con 462 persone neurotipiche: dimensione, posizione e intensità della risposta della rTPJ erano uguali. Il grande campione di controllo veniva dai localizzatori raccolti in molti studi diversi. A prima vista sembrerebbe che la regione funzioni normalmente. Ma l'analisi dei pattern racconta altro: nelle persone neurotipiche il disegno di attività della rTPJ distingue il danno intenzionale da quello accidentale, e la forza di questa distinzione è legata ai giudizi morali di ciascuno; nelle persone con autismo questa informazione non c'era. Kanwisher la definisce una piccola storia coerente che si sta formando, ma invita alla prudenza. Il campione di persone con autismo era piccolo, l'autismo è molto eterogeneo e la letteratura è spesso contraddittoria. Inoltre gli adulti studiati erano quelli in grado di superare il test della falsa credenza, quindi non rappresentano tutto lo spettro. È un buon esempio di come un risultato interessante vada letto insieme ai suoi limiti."
      }
     ],
     "keyPoints": [
      "Spieghiamo il comportamento attribuendo agli altri credenze, desideri e intenzioni che non possiamo osservare.",
      "Il test della falsa credenza separa ciò che una persona crede da come stanno le cose; si supera verso i cinque anni.",
      "Il test della foto falsa mostra che pensare ai pensieri è diverso dal ragionare su qualunque rappresentazione.",
      "La giunzione temporo-parietale destra risponde ai pensieri altrui, non all'aspetto o alle sensazioni fisiche.",
      "Il giudizio morale pesa le intenzioni; la TMS sulla rTPJ riduce questo peso.",
      "Nell'autismo la rTPJ sembra normale nelle misure medie ma non distingue danno intenzionale e accidentale nei pattern."
     ],
     "terms": [
      {
       "t": "Teoria della mente (theory of mind)",
       "d": "Capacità di attribuire a sé e agli altri stati mentali come credenze, desideri e intenzioni."
      },
      {
       "t": "Mentalizzazione",
       "d": "L'insieme delle inferenze con cui ricostruiamo che cosa pensano e vogliono gli altri."
      },
      {
       "t": "Test della falsa credenza",
       "d": "Compito in cui bisogna prevedere il comportamento di qualcuno che crede una cosa non vera, come nel test di Sally e Anne."
      },
      {
       "t": "Test della foto falsa",
       "d": "Versione di controllo del test della falsa credenza in cui la rappresentazione superata è una foto, non una mente."
      },
      {
       "t": "rTPJ (right temporoparietal junction)",
       "d": "Giunzione temporo-parietale destra: regione che risponde selettivamente quando pensiamo ai pensieri di altre persone."
      },
      {
       "t": "Corteccia prefrontale mediale",
       "d": "Regione frontale sulla linea mediana che risponde a molte informazioni sulle persone, non solo ai loro pensieri."
      }
     ],
     "quiz": [
      {
       "q": "Perché per studiare la teoria della mente si usano credenze false e non credenze vere?",
       "options": [
        "Perché le credenze false sono più divertenti per i bambini",
        "Perché con una credenza vera si può rispondere guardando la realtà, senza attribuire alcun pensiero",
        "Perché le credenze vere non attivano il cervello",
        "Perché i bambini non conoscono le credenze vere"
       ],
       "answer": 1,
       "why": "Se Sally crede la verità, basta sapere dove sta la biglia per prevedere dove guarderà. Solo quando credenza e realtà divergono si può verificare se il bambino rappresenta davvero il pensiero di Sally."
      },
      {
       "q": "Un bambino con autismo supera il test della foto falsa ma non quello della falsa credenza. Quale ipotesi diventa meno probabile?",
       "options": [
        "Che il bambino abbia difficoltà specifiche nell'attribuire pensieri",
        "Che il bambino abbia un problema di linguaggio sui pensieri",
        "Che il bambino abbia una difficoltà generale a tenere a mente una rappresentazione non più vera",
        "Che il bambino sia più lento nel capire le persone"
       ],
       "answer": 2,
       "why": "Il test della foto richiede di gestire una rappresentazione superata, proprio come quello della credenza. Se il bambino supera il primo, il problema non può essere una difficoltà logica generale."
      },
      {
       "q": "In uno studio, una regione risponde allo stesso modo a storie sull'aspetto fisico, sulla fame e sui pensieri di una persona. Quale regione si comporta più probabilmente così?",
       "options": [
        "La corteccia prefrontale mediale, che risponde alle persone in generale",
        "La giunzione temporo-parietale destra",
        "L'area fusiforme dei volti",
        "La corteccia uditiva primaria"
       ],
       "answer": 0,
       "why": "Negli esperimenti di Saxe la prefrontale mediale rispondeva a tutte le informazioni sulle persone, mentre la rTPJ solo ai pensieri. Le aree dei volti e uditive non rispondono a storie scritte di questo tipo."
      },
      {
       "q": "Dopo una TMS sulla rTPJ, una persona giudica meno grave chi ha cercato di avvelenare un'amica ma per caso ha usato zucchero. Come si interpreta?",
       "options": [
        "La TMS ha reso la persona più buona in generale",
        "La persona non ha capito la storia",
        "La TMS ha cancellato la memoria della storia",
        "Il giudizio dà meno peso a ciò che l'autore credeva e voleva, e più al danno prodotto"
       ],
       "answer": 3,
       "why": "Un tentativo fallito si condanna per l'intenzione malvagia, visto che il danno non c'è stato. Se la rTPJ è disturbata, l'intenzione pesa meno e conta di più il risultato innocuo. L'effetto è specifico, non una generica indulgenza."
      },
      {
       "q": "Lo studio su 31 adulti con autismo non trova differenze nella risposta media della rTPJ, ma l'analisi dei pattern sì. Quale conclusione è più prudente?",
       "options": [
        "La rTPJ è identica nelle persone con e senza autismo",
        "Le misure medie possono nascondere differenze nell'informazione codificata, ma il campione piccolo impone cautela",
        "L'analisi dei pattern è sbagliata",
        "L'autismo dipende solo dalla rTPJ"
       ],
       "answer": 1,
       "why": "Una risposta media uguale non garantisce che l'informazione codificata sia la stessa. Tuttavia il campione era limitato e l'autismo è eterogeneo, quindi il risultato va considerato un indizio, non una spiegazione completa."
      }
     ],
     "explain": "Spiega a un amico il test di Sally e Anne e perché un bambino di tre anni risponde in modo diverso da uno di cinque.",
     "apply": "La prossima volta che qualcuno al lavoro commette un errore che ti danneggia, prima di reagire scrivi due righe: che cosa sapeva quella persona in quel momento? Che cosa voleva ottenere? Osserva se il tuo giudizio cambia."
    },
    {
     "id": "neuro-mit-913-13",
     "title": "Reti cerebrali e apprendimento",
     "minutes": 11,
     "watch": {
      "label": "Lezione 21: Brain Networks (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-21-brain-networks/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 21 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l21/"
      }
     ],
     "sections": [
      {
       "h": "Il cablaggio del cervello",
       "text": "Finora il corso ha parlato di regioni specializzate, ma nessuna regione lavora da sola. Circa il 45% del cervello umano è sostanza bianca, una proporzione più alta che in molti altri animali, e le fibre mielinizzate messe in fila supererebbero i centomila chilometri, abbastanza per fare più volte il giro della Terra. Le connessioni contano perché decidono che cosa una regione può sapere, cioè quali segnali le arrivano, e su chi può influire, cioè dove mandano i suoi messaggi. Per questo ogni area ha un'impronta di connettività che fa parte della sua identità, e che potrebbe aiutare a trovare l'area corrispondente in altre specie. Le connessioni plasmano anche lo sviluppo, come mostrano i furetti in cui la corteccia uditiva, ricevendo segnali visivi, è diventata simile a quella visiva. Molti disturbi, dalla dislessia all'autismo alla prosopagnosia, sono stati collegati ad alterazioni della sostanza bianca. Ma i cavi costano energia e spazio: la necessità di ridurre la lunghezza dei collegamenti è probabilmente uno dei grandi vincoli che hanno dato forma al cervello, e forse spiega perché funzioni correlate stanno spesso vicine."
      },
      {
       "h": "Vedere le connessioni: pregi e trappole",
       "text": "Nelle scimmie il metodo più affidabile consiste nell'iniettare un tracciante che viaggia lungo gli assoni e poi cercarlo dove arriva, cosa impossibile negli esseri umani. Da noi si usa la risonanza a diffusione (diffusion MRI), che misura in che direzione si muove l'acqua nei tessuti: lungo i fasci di fibre si muove più facilmente. Così si vedono i grandi fasci, come il corpo calloso che collega i due emisferi o il fascicolo arcuato che unisce regioni del linguaggio. L'anisotropia frazionaria (fractional anisotropy, FA) misura quanto la diffusione è orientata, e uno studio del laboratorio di John Gabrieli l'ha trovata più alta nel fascicolo arcuato dei bambini senza dislessia. La trattografia (tractography) prova a seguire le fibre punto per punto, ma sbaglia spesso: partendo dal talamo visivo trova collegamenti con aree a cui in realtà non è collegato, e non distingue bene fibre che si incrociano da fibre che si uniscono. Il tranello più grave è il movimento della testa. In uno studio sull'autismo, una volta abbinati i gruppi per quanto si muovevano nello scanner, quasi tutte le differenze di connettività riportate in decine di articoli sparivano."
      },
      {
       "h": "Imparare a leggere: le connessioni decidono dove",
       "text": "Le connessioni aiutano a capire come il cervello accoglie un apprendimento culturale come la lettura. Zeynep Saygin ha mostrato che l'area dei volti di una persona si può prevedere dalla sola impronta delle sue connessioni, misurata con la trattografia. Poi ha seguito bambini a 5 anni, prima che sapessero leggere, e a 8 anni: le connessioni a 5 anni prevedevano dove sarebbe comparsa l'area della forma visiva delle parole, persino nelle differenze tra un bambino e l'altro. È probabile che quella zona venga scelta perché è ben collegata alle regioni del linguaggio. Anche studi su adulti che hanno imparato a leggere tardi indicano che l'alfabetizzazione aumenta la risposta di quella regione alle lettere. La lezione è doppia. Da un lato l'apprendimento costruisce davvero nuove specializzazioni nel cervello. Dall'altro non lo fa su una lavagna bianca: usa zone che per posizione e connessioni sono già adatte al compito. Per chi insegna è un invito a rispettare i tempi biologici; per chi impara, la conferma che un'abilità complessa come leggere è il risultato di anni di pratica su un terreno predisposto."
      },
      {
       "h": "Reti che lavorano insieme anche a riposo",
       "text": "Nel 1995 Bharat Biswal notò che le aree motorie dei due emisferi, attive insieme quando si muovono le dita, continuano a fluttuare insieme anche quando la persona è ferma nello scanner. Da allora si studiano le correlazioni a riposo: si sceglie una zona e si cercano quelle la cui attività sale e scende con lei. Così è emersa la rete di default (default mode network), più attiva quando non facciamo compiti esterni e lasciamo vagare la mente, ricordiamo o pensiamo agli altri. All'opposto c'è la rete a domanda multipla (multiple demand network), che si attiva in compiti difficili di ogni tipo, dalla memoria spaziale all'aritmetica. John Duncan la collega all'intelligenza fluida, quella misurata con problemi nuovi: in circa 80 pazienti con lesioni cerebrali, il calo del quoziente intellettivo era proporzionale al danno in queste regioni e non altrove. Idan Blank, nel laboratorio di Ev Fedorenko, ha mostrato che a riposo le regioni del linguaggio correlano tra loro anche a dieci centimetri di distanza, quelle a domanda multipla tra loro, ma i due sistemi no. Le regioni funzionano davvero come reti separate."
      },
      {
       "h": "Che cosa cambia davvero quando impariamo",
       "text": "Se le connessioni sono così importanti, l'allenamento le cambia? Ci sono risultati suggestivi. Nei tassisti di Londra, che devono memorizzare migliaia di strade, l'ippocampo posteriore è risultato più grande che nei controlli e cresceva con gli anni di servizio, e chi superava il durissimo esame di abilitazione mostrava un aumento rispetto a chi falliva. Imparare a leggere crea l'area delle parole. Ma Kanwisher invita alla prudenza su molte affermazioni popolari: le prove che imparare a fare il giocoliere cambi la sostanza bianca sono deboli e problematiche, e la FA è un indicatore lontano da ciò che le fibre fanno davvero. Soprattutto, mette in guardia dalle app che promettono di ricablare il cervello. Uno studio con oltre 11.000 partecipanti, pubblicato su Nature nel 2010, ha trovato che chi si allenava per settimane con giochi cognitivi migliorava nei giochi stessi, ma non in compiti diversi. La regola pratica è che si diventa bravi in ciò che si pratica. Se vuoi migliorare in una lingua, in uno strumento o nel tuo lavoro, allenati proprio su quello, con difficoltà crescente e per molto tempo."
      }
     ],
     "keyPoints": [
      "Circa il 45% del cervello è sostanza bianca: le connessioni definiscono che cosa una regione riceve e su chi influisce.",
      "La risonanza a diffusione vede i grandi fasci, ma la trattografia sbaglia spesso e il movimento della testa può creare falsi risultati.",
      "L'impronta di connettività prevede dove si svilupperà un'abilità appresa come la lettura.",
      "A riposo le regioni dello stesso sistema fluttuano insieme: linguaggio e rete a domanda multipla sono reti separate.",
      "La rete a domanda multipla è legata all'intelligenza fluida; la rete di default al pensiero spontaneo e sociale.",
      "L'allenamento migliora soprattutto ciò che si pratica: le promesse di potenziamento generale del cervello hanno prove deboli."
     ],
     "terms": [
      {
       "t": "Risonanza a diffusione (diffusion MRI)",
       "d": "Tecnica che misura la direzione in cui si muove l'acqua nei tessuti, rivelando l'orientamento dei fasci di fibre."
      },
      {
       "t": "Trattografia (tractography)",
       "d": "Ricostruzione al computer dei percorsi delle fibre nervose a partire dai dati di diffusione."
      },
      {
       "t": "Anisotropia frazionaria (FA)",
       "d": "Misura di quanto la diffusione dell'acqua è orientata in una direzione; usata come indice della struttura della sostanza bianca."
      },
      {
       "t": "Correlazioni a riposo",
       "d": "Fluttuazioni dell'attività che salgono e scendono insieme in regioni diverse mentre la persona non svolge compiti."
      },
      {
       "t": "Rete di default (default mode network)",
       "d": "Insieme di regioni più attive quando la mente vaga, ricorda o pensa agli altri, e meno durante compiti esterni."
      },
      {
       "t": "Rete a domanda multipla (multiple demand network)",
       "d": "Regioni frontali e parietali attive in molti compiti difficili, legate all'intelligenza fluida."
      },
      {
       "t": "Intelligenza fluida",
       "d": "Capacità di risolvere problemi nuovi ragionando, distinta dalle conoscenze accumulate."
      }
     ],
     "quiz": [
      {
       "q": "Uno studio trova connessioni più deboli in bambini con un disturbo dello sviluppo, ma questi bambini si sono mossi di più nello scanner. Qual è la prima verifica da fare?",
       "options": [
        "Rifare lo studio con più bambini senza cambiare nulla",
        "Pubblicare subito, perché la differenza è significativa",
        "Abbinare i gruppi per quantità di movimento e vedere se la differenza resta",
        "Usare uno scanner più potente"
       ],
       "answer": 2,
       "why": "Il movimento della testa può produrre da solo un falso calo della connettività. Nello studio sull'autismo discusso a lezione, abbinando i gruppi per movimento quasi tutte le differenze sparivano. Più bambini con lo stesso difetto non risolvono il problema."
      },
      {
       "q": "Le connessioni di un bambino a 5 anni prevedono dove comparirà la sua area per le parole a 8 anni. Che cosa significa per l'apprendimento della lettura?",
       "options": [
        "Che la lettura è innata",
        "Che l'apprendimento costruisce l'area, ma in una zona predisposta dalle connessioni",
        "Che le connessioni non cambiano mai",
        "Che leggere non modifica il cervello"
       ],
       "answer": 1,
       "why": "L'area per le parole compare solo con l'esperienza della lettura, quindi non è innata; ma la sua posizione è prevedibile dalle connessioni precedenti. Apprendimento e predisposizione lavorano insieme."
      },
      {
       "q": "In una persona a riposo, l'attività dell'area di Broca sale e scende insieme a quella di una regione temporale del linguaggio, ma non con le regioni a domanda multipla. Che cosa indica?",
       "options": [
        "Che le regioni del linguaggio formano un sistema coordinato separato dalla rete a domanda multipla",
        "Che la persona stava parlando in silenzio",
        "Che le regioni a domanda multipla sono danneggiate",
        "Che l'area di Broca non serve al linguaggio"
       ],
       "answer": 0,
       "why": "È il risultato di Idan Blank: le regioni dello stesso sistema correlano tra loro anche a distanza, sistemi diversi no. Non serve ipotizzare danni o attività nascoste."
      },
      {
       "q": "In un gruppo di pazienti, il calo del quoziente intellettivo dopo una lesione dipende da quanto tessuto è stato perso in certe regioni frontali e parietali. Quali?",
       "options": [
        "Le regioni della rete di default",
        "Le regioni del linguaggio",
        "La corteccia visiva primaria",
        "Le regioni della rete a domanda multipla"
       ],
       "answer": 3,
       "why": "John Duncan e colleghi hanno trovato che il danno alla rete a domanda multipla, e non altrove, prevedeva il calo dell'intelligenza fluida. È coerente con il fatto che questa rete si attiva in compiti difficili di ogni tipo."
      },
      {
       "q": "Un'azienda propone ai dipendenti un'app di giochi cognitivi per «potenziare il cervello» e lavorare meglio. Che cosa suggeriscono i dati?",
       "options": [
        "Che i dipendenti diventeranno più intelligenti in generale",
        "Che miglioreranno soprattutto nei giochi dell'app, con poco trasferimento al lavoro",
        "Che l'app ricablerà la sostanza bianca in poche settimane",
        "Che i giochi peggiorano le capacità lavorative"
       ],
       "answer": 1,
       "why": "Nello studio su oltre 11.000 persone l'allenamento migliorava i compiti allenati ma non quelli diversi. Per migliorare nel lavoro conviene allenarsi su compiti simili a quelli reali."
      }
     ],
     "explain": "Spiega a un amico perché le connessioni di una regione contano quanto la regione stessa, usando l'esempio di come il cervello impara a leggere.",
     "apply": "Scegli un'abilità che vuoi migliorare al lavoro, per esempio scrivere email chiare o negoziare. Per due settimane allenati ogni giorno per 15 minuti proprio su quel compito, aumentando la difficoltà, e annota i progressi invece di affidarti a esercizi generici."
    },
    {
     "id": "neuro-mit-913-14",
     "title": "Attenzione e consapevolezza",
     "minutes": 11,
     "watch": {
      "label": "Lezione 24: Attention and Awareness (video con trascrizione)",
      "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/lecture-24-attention-and-awareness/"
     },
     "read": [
      {
       "label": "Lucidi della lezione 24 (PDF)",
       "url": "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/resources/mit9_13s19_l24/"
      }
     ],
     "sections": [
      {
       "h": "Una risorsa limitata",
       "text": "È pericoloso guidare parlando al telefono, anche con il vivavoce? Quasi tutti sentiamo che sì, almeno nel traffico o su strade che non conosciamo. L'intuizione è che abbiamo una capacità di elaborazione limitata: più ne usa un compito, meno ne resta per l'altro. Kanwisher la chiama con ironia il «modello tostapane» della mente, avvertendo che il cervello non funziona davvero come un elettrodomestico che si divide la corrente, e che non sappiamo bene quale sia la risorsa scarsa. Le differenze individuali sono notevoli: alcuni leggono testi difficili con la musica, altri non ci riescono affatto. E i limiti dipendono da che cosa si combina. Michael Cohen, che lavorava con Kanwisher, ha mostrato che riconosciamo meglio un volto e una scena presentati insieme che due volti o due scene: quanto più due compiti usano zone diverse della via visiva, tanto meno si ostacolano. Perché la capacità sia limitata resta una domanda aperta. Un'ipotesi è che di solito possiamo pianificare una sola azione alla volta, e riempire il sistema motorio di informazioni inutili lo rallenterebbe, come accade al luccio che cattura prima una preda se nella vasca ce n'è una sola invece di dieci."
      },
      {
       "h": "Vediamo meno di quanto crediamo",
       "text": "Nella cecità al cambiamento (change blindness) due versioni di una foto si alternano con un breve lampo grigio in mezzo: cambiano un'insegna, un'automobile, una persona compare e scompare, e gli osservatori spesso impiegano molto tempo ad accorgersene, o non se ne accorgono affatto. Nella cecità da disattenzione (inattentional blindness) non vediamo qualcosa di evidente perché siamo concentrati su altro: il caso più noto è il video di Daniel Simons e Christopher Chabris, in cui molti spettatori che contano i passaggi di una palla non notano una persona travestita da gorilla. Kanwisher cita un esempio più serio: in un simulatore di volo, alcuni piloti di linea che atterravano nella nebbia guardando i dati proiettati sul parabrezza non videro un aereo fermo sulla pista. L'attenzione funziona come un filtro con due proprietà: ha una capacità limitata e seleziona che cosa far passare verso la consapevolezza. Le conseguenze pratiche sono enormi, dalla guida alla sicurezza sul lavoro: essere davanti a qualcosa con gli occhi aperti non garantisce di vederlo. Resta discusso se non vediamo affatto o se vediamo e dimentichiamo subito."
      },
      {
       "h": "Forme di attenzione",
       "text": "Già Hermann von Helmholtz, nell'Ottocento, notò che si può spostare l'attenzione in un punto del campo visivo senza muovere gli occhi. È l'attenzione nascosta (covert attention), contrapposta a quella palese (overt attention) che si sposta con lo sguardo. Muoviamo gli occhi da due a quattro volte al secondo per portare sugli oggetti la fovea, la piccola zona centrale della retina con la visione più nitida, a cui è dedicata una porzione enorme di corteccia. L'attenzione nascosta resta preziosa: chi ci sta intorno vede dove guardiamo, perché il bianco dei nostri occhi rende evidente la direzione dello sguardo, e a volte conviene osservare senza farsi notare. C'è poi la distinzione tra attenzione catturata dallo stimolo, come un pop-up lampeggiante o un unico oggetto rosso tra tanti grigi, e attenzione volontaria, guidata dai nostri scopi. Negli esperimenti con un segnale che indica dove comparirà un bersaglio, le risposte sono più rapide nel punto atteso e più lente altrove. Infine si può dirigere l'attenzione verso un luogo o verso una caratteristica: cercare in un cassetto una spatola viola è facile, un pelapatate nero tra utensili scuri no."
      },
      {
       "h": "Che cosa fa l'attenzione nel cervello",
       "text": "Alla fine degli anni Novanta diversi laboratori, compreso quello di Kanwisher, mostrarono con la fMRI che basta aspettarsi uno stimolo in un punto per aumentare l'attività della corteccia visiva primaria che rappresenta quel punto, prima ancora che lo stimolo compaia: i neuroni vengono preparati. In altri esperimenti le stesse immagini di volti e case restavano sullo schermo, ma ai partecipanti si chiedeva di giudicare ora i volti, ora le case: l'area dei volti rispondeva di più quando l'attenzione era sui volti, l'area dei luoghi quando era sulle case. Lo stesso stimolo, insomma, produce risposte diverse secondo dove guardiamo con la mente. L'effetto arriva fino al talamo, dove ricordiamo che le fibre che scendono dalla corteccia sono molto più numerose di quelle che salgono. Chi decide dove va l'attenzione? Una rete di regioni frontali e parietali che si sovrappone alla rete a domanda multipla ed è estremamente generica. Un danno parietale bilaterale provoca la sindrome di Balint: il paziente vede un solo oggetto alla volta e non riesce a spostare l'attenzione da un oggetto all'altro."
      },
      {
       "h": "Consapevolezza: rivalità e percezione inconscia",
       "text": "Come studiare la consapevolezza? Un trucco è tenere costante lo stimolo e far cambiare solo l'esperienza. Nella rivalità binoculare (binocular rivalry) un occhio vede un volto e l'altro una casa: invece di una miscela, percepiamo a turno l'uno o l'altra, ogni pochi secondi. Nel 1998 Frank Tong, Kanwisher e colleghi chiesero ai partecipanti di segnalare con un tasto che cosa vedevano: l'area dei volti si attivava quando vedevano il volto e quella dei luoghi quando vedevano la casa, anche se sulla retina arrivava sempre la stessa coppia di immagini. Queste aree seguono la percezione, non lo stimolo. L'opposto si studia con il lampeggiamento attentivo (attentional blink): in una rapida sequenza di immagini, dopo aver individuato un primo bersaglio spesso non ci accorgiamo di un secondo che arriva subito dopo. Quando una scena veniva persa in questo modo, l'area dei luoghi rispondeva comunque, anche se meno che per le scene viste. Il cervello elabora quindi informazioni di cui non siamo consapevoli. Capire che cosa trasforma questa elaborazione in esperienza cosciente resta una delle domande più aperte delle neuroscienze."
      }
     ],
     "keyPoints": [
      "L'attenzione è un filtro con capacità limitata che seleziona che cosa arriva alla consapevolezza.",
      "Cecità al cambiamento e cecità da disattenzione mostrano che possiamo non vedere cose evidenti.",
      "L'attenzione può spostarsi con gli occhi o senza, essere catturata dagli stimoli o guidata dagli scopi, puntare a luoghi o caratteristiche.",
      "L'attenzione aumenta le risposte delle aree visive, persino prima dello stimolo e fino al talamo.",
      "Una rete frontale e parietale molto generica controlla l'attenzione; un danno parietale bilaterale causa la sindrome di Balint.",
      "Nella rivalità binoculare le aree dei volti e dei luoghi seguono la percezione cosciente; ma il cervello elabora anche ciò che non vediamo."
     ],
     "terms": [
      {
       "t": "Cecità al cambiamento (change blindness)",
       "d": "Incapacità di notare cambiamenti anche grandi in una scena quando sono separati da una breve interruzione."
      },
      {
       "t": "Cecità da disattenzione (inattentional blindness)",
       "d": "Mancata percezione di un oggetto evidente perché l'attenzione è impegnata in un altro compito."
      },
      {
       "t": "Attenzione nascosta (covert attention)",
       "d": "Spostamento dell'attenzione verso un punto senza muovere gli occhi."
      },
      {
       "t": "Fovea",
       "d": "Piccola zona centrale della retina con la visione più nitida, su cui portiamo gli oggetti muovendo gli occhi."
      },
      {
       "t": "Sindrome di Balint",
       "d": "Disturbo da danno parietale bilaterale in cui si percepisce un solo oggetto alla volta."
      },
      {
       "t": "Rivalità binoculare (binocular rivalry)",
       "d": "Alternanza della percezione quando i due occhi ricevono immagini diverse, con stimolo costante."
      },
      {
       "t": "Lampeggiamento attentivo (attentional blink)",
       "d": "Difficoltà a notare un secondo bersaglio che compare poco dopo un primo in una sequenza rapida."
      }
     ],
     "quiz": [
      {
       "q": "Secondo i dati di Michael Cohen, quale coppia di compiti visivi simultanei dovrebbe interferire di meno?",
       "options": [
        "Riconoscere due volti",
        "Riconoscere un volto e una scena",
        "Riconoscere due scene",
        "Riconoscere un volto e un corpo"
       ],
       "answer": 1,
       "why": "L'interferenza è minore quando i due compiti usano zone molto diverse della via visiva, come area dei volti e area dei luoghi. Volti e corpi attivano zone più sovrapposte, quindi interferiscono di più."
      },
      {
       "q": "Un operaio esperto, concentrato su un pannello di controllo, non nota un collega che entra in una zona pericolosa davanti a lui. Quale fenomeno descrive meglio il caso?",
       "options": [
        "Cecità al cambiamento",
        "Rivalità binoculare",
        "Cecità da disattenzione",
        "Sindrome di Balint"
       ],
       "answer": 2,
       "why": "L'oggetto era visibile, ma l'attenzione era impegnata altrove: è la cecità da disattenzione, come nei piloti che non videro l'aereo in pista. La cecità al cambiamento riguarda invece il confronto tra due versioni di una scena."
      },
      {
       "q": "In un esperimento volti e case restano sempre sullo schermo, ma la risposta dell'area dei volti cambia a seconda del compito. Che cosa dimostra?",
       "options": [
        "Che l'attenzione modula la risposta delle aree visive anche a parità di stimolo",
        "Che l'area dei volti risponde anche alle case",
        "Che lo schermo cambiava luminosità",
        "Che i partecipanti chiudevano gli occhi"
       ],
       "answer": 0,
       "why": "Lo stimolo è identico; cambia solo ciò a cui si presta attenzione. Una risposta diversa nelle due condizioni può quindi dipendere solo dall'attenzione, non dalle immagini."
      },
      {
       "q": "Nella rivalità binoculare, perché il fatto che l'area dei volti segua ciò che la persona riferisce è importante per studiare la coscienza?",
       "options": [
        "Perché mostra che l'area dei volti risponde solo agli stimoli molto luminosi",
        "Perché prova che la persona mente",
        "Perché dimostra che la retina cambia immagine",
        "Perché lo stimolo resta costante e cambia solo l'esperienza cosciente"
       ],
       "answer": 3,
       "why": "Sulla retina arrivano sempre le stesse due immagini: ciò che cambia è solo la percezione. Se l'attività segue il resoconto della persona, quell'attività è legata all'esperienza cosciente, non allo stimolo fisico."
      },
      {
       "q": "Durante il lampeggiamento attentivo una persona dice di non aver visto una scena, ma l'area dei luoghi ha risposto. Quale conclusione è corretta?",
       "options": [
        "La persona ha visto la scena ma lo nega",
        "Il cervello può elaborare informazioni di cui non siamo consapevoli",
        "L'area dei luoghi non ha nulla a che fare con le scene",
        "La risonanza era guasta"
       ],
       "answer": 1,
       "why": "La risposta, più debole che per le scene viste ma presente, indica un'elaborazione senza consapevolezza. Non c'è motivo di pensare a una menzogna: il risultato si ripete in modo sistematico."
      }
     ],
     "explain": "Spiega a un amico perché guardare qualcosa con gli occhi aperti non basta per vederlo, usando un esempio di cecità da disattenzione.",
     "apply": "Per una settimana, quando guidi o cammini in città, metti via il telefono e conta quante cose noti che di solito ti sfuggono, come segnali, insegne o persone. Poi prova per pochi minuti, da passeggero, a parlare al telefono e osserva che cosa ti perdi."
    }
   ]
  },
  {
   "id": "prob-harvard-stat110",
   "faculty": "matematica",
   "title": "Probabilità: la logica dell'incertezza",
   "level": 2,
   "summary": "Il corso di probabilità di Harvard tenuto da Joe Blitzstein (Stat 110), uno dei più frequentati dell'università, raccontato in italiano in 14 lezioni. Si parte dal contare i casi possibili e si arriva a Bayes, Monty Hall, alle distribuzioni principali, alla legge dei grandi numeri e al teorema del limite centrale. Alla fine saprai leggere un test medico, valutare un rischio e non farti ingannare dalle coincidenze.",
   "source": {
    "inst": "Harvard University",
    "code": "Stat 110",
    "title": "Statistics 110: Probability",
    "prof": "Joe Blitzstein",
    "year": "Autunno 2011 (lezioni registrate in aula)",
    "url": "https://stat110.hsites.harvard.edu/",
    "license": "Gratuito; © President and Fellows of Harvard College (nessuna licenza aperta dichiarata)",
    "lang": "inglese (sottotitoli su YouTube)"
   },
   "extra": [
    {
     "title": "Stat 110: elenco completo delle 34 video lezioni",
     "url": "https://stat110.hsites.harvard.edu/youtube",
     "what": "Pagina ufficiale con i link YouTube di tutte le lezioni, anche quelle non incluse qui"
    },
    {
     "title": "Stat 110: esercizi strategici con soluzioni",
     "url": "https://stat110.hsites.harvard.edu/strategic-practice-problems",
     "what": "Undici dispense di esercizi con soluzioni complete, in inglese, divise per argomento"
    },
    {
     "title": "Programma del corso Stat 110",
     "url": "https://stat110.hsites.harvard.edu/resource/syllabus",
     "what": "Gli argomenti lezione per lezione: utile per orientarsi tra i video"
    }
   ],
   "lessons": [
    {
     "id": "prob-harvard-stat110-01",
     "title": "Probabilità come conteggio",
     "minutes": 10,
     "watch": {
      "label": "Lezione 1: Probability and Counting (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=KbB0FjPg0mw&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Strategic Practice 1 con soluzioni: definizione ingenua e conteggio (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_1.pdf"
      }
     ],
     "sections": [
      {
       "h": "Esperimenti, risultati ed eventi",
       "text": "Ogni discorso di probabilità parte da un esperimento il cui esito non si conosce in anticipo: lanciare un dado, estrarre una carta, aspettare di sapere se un cliente pagherà in tempo. L'insieme di tutti i risultati possibili si chiama spazio campionario (sample space). Un evento (event) è un sottoinsieme di questi risultati, cioè una domanda a cui alla fine si potrà rispondere sì o no. Lanciando due monete lo spazio campionario ha quattro elementi: TT, TC, CT, CC (T sta per testa, C per croce). L'evento «almeno una testa» contiene tre di questi quattro risultati. Blitzstein insiste su questo punto fin dalla prima lezione perché, una volta scritti gli eventi come insiemi, le parole del linguaggio comune diventano operazioni precise: «e» è l'intersezione, «o» è l'unione, «non» è il complementare. L'errore tipico è descrivere lo spazio in modo troppo sbrigativo. Se scrivo solo «due teste, una testa, nessuna testa» ottengo tre casi, ma, come vedremo subito, non hanno affatto la stessa probabilità."
      },
      {
       "h": "Casi favorevoli su casi possibili",
       "text": "Quando i risultati sono in numero finito e tutti ugualmente probabili, la probabilità di un evento è il numero di casi favorevoli diviso il numero di casi possibili. Il corso la chiama definizione ingenua (naive definition): funziona benissimo per dadi, carte e lotterie. Con due dadi i risultati equiprobabili sono 36 coppie ordinate. La somma 7 si ottiene in 6 modi (1-6, 2-5, 3-4, 4-3, 5-2, 6-1), quindi ha probabilità 6/36, cioè 1/6. La somma 12 si ottiene in un modo solo: 1/36. Tutto dipende dall'ipotesi di equiprobabilità, ed è lì che si sbaglia. Persino Leibniz sostenne che con due dadi la somma 11 e la somma 12 fossero ugualmente probabili, perché ciascuna «si fa in un solo modo». In realtà 11 si ottiene con 5-6 e con 6-5: è due volte più probabile di 12. Lo stesso vale per il ragionamento «o vinco o perdo, quindi è 50%» applicato a un biglietto della lotteria: si contano due casi che non pesano affatto uguale."
      },
      {
       "h": "La regola del prodotto",
       "text": "Per contare senza elencare tutto si usa la regola del prodotto (multiplication rule): se una scelta si fa in passi successivi, il numero totale di possibilità è il prodotto delle possibilità di ogni passo. Un ristorante con 3 antipasti, 4 primi e 2 dolci offre 3 × 4 × 2 = 24 menù diversi. Un PIN di 4 cifre ha 10 × 10 × 10 × 10 = 10.000 combinazioni: chi lo prova a caso con 3 tentativi ha 3 probabilità su 10.000 di indovinarlo. Se le cifre non si possono ripetere, i codici diventano 10 × 9 × 8 × 7 = 5.040, perché a ogni passo resta un'opzione in meno. La regola funziona anche quando le opzioni concrete cambiano da un passo all'altro, purché il loro numero resti lo stesso qualunque cosa si sia scelto prima. Questo è il punto da controllare: se il numero di opzioni del secondo passo dipende dalla prima scelta, bisogna dividere il conteggio in casi separati e poi sommarli."
      },
      {
       "h": "Quando l'ordine non conta",
       "text": "Spesso interessa il gruppo, non l'ordine. Per scegliere 2 persone su 5 per un turno, contando l'ordine avrei 5 × 4 = 20 possibilità, ma ogni coppia compare due volte (Anna-Marco e Marco-Anna), quindi le coppie sono 10. Questo numero si chiama coefficiente binomiale (binomial coefficient), si legge «5 su 2» e conta i sottoinsiemi di 2 elementi presi da 5. Con la stessa idea si calcola che nel SuperEnalotto, dove si estraggono 6 numeri su 90, le combinazioni sono 622.614.630: con una colonna sola la probabilità di fare 6 è circa una su 622 milioni. Nel poker, su 2.598.960 mani possibili di 5 carte, i full sono 3.744, cioè circa lo 0,14%. Il corso riassume il conteggio in una tabella con quattro casi: estrazione con o senza reinserimento (sampling with replacement), con l'ordine che conta oppure no. L'errore più comune è mescolare i casi, per esempio contare le sequenze ordinate al numeratore e i gruppi non ordinati al denominatore."
      }
     ],
     "keyPoints": [
      "Lo spazio campionario è l'insieme di tutti i risultati possibili; un evento è un suo sottoinsieme.",
      "La definizione ingenua (favorevoli diviso possibili) vale solo se i risultati sono finiti ed equiprobabili.",
      "La regola del prodotto moltiplica il numero di opzioni di scelte fatte in sequenza.",
      "Il coefficiente binomiale conta i gruppi in cui l'ordine non conta: «5 su 2» fa 10.",
      "Prima di contare chiediti sempre due cose: l'ordine conta? lo stesso elemento si può ripetere?"
     ],
     "terms": [
      {
       "t": "Spazio campionario (sample space)",
       "d": "L'insieme di tutti i risultati possibili di un esperimento."
      },
      {
       "t": "Evento (event)",
       "d": "Un sottoinsieme dello spazio campionario, cioè un insieme di risultati che rende vera una certa affermazione."
      },
      {
       "t": "Definizione ingenua (naive definition)",
       "d": "Probabilità uguale a casi favorevoli diviso casi possibili; vale solo con risultati finiti ed equiprobabili."
      },
      {
       "t": "Regola del prodotto (multiplication rule)",
       "d": "Se una scelta si fa in più passi, il numero totale di esiti è il prodotto delle opzioni di ciascun passo."
      },
      {
       "t": "Coefficiente binomiale (binomial coefficient)",
       "d": "Numero di modi di scegliere k elementi da n senza badare all'ordine; si legge «n su k»."
      },
      {
       "t": "Con reinserimento (with replacement)",
       "d": "Estrazione in cui l'elemento estratto viene rimesso dentro e può uscire di nuovo."
      }
     ],
     "quiz": [
      {
       "q": "Lanci due dadi equilibrati. Qual è la probabilità che la somma sia 11?",
       "options": [
        "1/36",
        "1/18",
        "1/11",
        "1/6"
       ],
       "answer": 1,
       "why": "La somma 11 si ottiene con 5-6 e con 6-5: 2 casi su 36, cioè 1/18. La risposta 1/11 tratta le 11 somme possibili (da 2 a 12) come equiprobabili, che è proprio l'errore di Leibniz."
      },
      {
       "q": "Un sistema assegna codici di 3 lettere (alfabeto di 26 lettere, ripetizioni ammesse). Quanti codici diversi esistono?",
       "options": [
        "78",
        "2.600",
        "15.600",
        "17.576"
       ],
       "answer": 3,
       "why": "Per la regola del prodotto sono 26 × 26 × 26 = 17.576. Il valore 15.600 (26 × 25 × 24) sarebbe giusto solo se le lettere non potessero ripetersi."
      },
      {
       "q": "Devi scegliere 3 colleghi su 6 per una commissione in cui i ruoli sono tutti uguali. Quanti gruppi diversi puoi formare?",
       "options": [
        "20",
        "120",
        "18",
        "216"
       ],
       "answer": 0,
       "why": "In ordine sarebbero 6 × 5 × 4 = 120, ma ogni gruppo di 3 compare in 3 × 2 × 1 = 6 ordini diversi: 120 / 6 = 20. Scegliere 120 significa contare come diversi gruppi identici."
      },
      {
       "q": "Un amico dice: «Domani o piove o non piove, quindi la probabilità di pioggia è del 50%». Dov'è l'errore?",
       "options": [
        "Ha contato male i casi possibili",
        "Ha usato la definizione ingenua con due esiti che non sono ugualmente probabili",
        "La pioggia non è un evento in senso probabilistico",
        "La probabilità non si può applicare al meteo"
       ],
       "answer": 1,
       "why": "I casi sono davvero due, ma la definizione ingenua richiede che siano equiprobabili, e niente lo garantisce: in luglio a Palermo la pioggia è molto meno probabile della non pioggia. Il conteggio in sé non è sbagliato."
      },
      {
       "q": "In quale di queste situazioni la definizione ingenua si può applicare senza problemi?",
       "options": [
        "Probabilità che un cliente nuovo paghi in ritardo",
        "Probabilità che un titolo di borsa salga domani",
        "Probabilità di estrarre un asso da un mazzo di 52 carte ben mescolato",
        "Probabilità che un paziente guarisca con una certa cura"
       ],
       "answer": 2,
       "why": "Con un mazzo ben mescolato ogni carta ha la stessa probabilità di uscire, quindi la risposta è 4/52. Negli altri casi gli esiti (paga o non paga, sale o scende) non hanno nessun motivo di essere equiprobabili."
      }
     ],
     "explain": "Spiega a un amico perché, lanciando due dadi, la somma 7 esce molto più spesso della somma 12, contando i casi possibili.",
     "apply": "Prendi il configuratore di un prodotto (un'auto, una cucina, un pavimento) e calcola con la regola del prodotto quante combinazioni diverse offre. Poi chiediti se tutte vengono scelte con la stessa frequenza: quasi mai è così."
    },
    {
     "id": "prob-harvard-stat110-02",
     "title": "Gli assiomi e il problema del compleanno",
     "minutes": 12,
     "watch": {
      "label": "Lezione 3: Birthday Problem, Properties of Probability (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=LZ5Wergp_PA&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo&index=3"
     },
     "read": [
      {
       "label": "Lezione 2 (video): Story Proofs, Axioms of Probability, dove compaiono gli assiomi",
       "url": "https://www.youtube.com/watch?v=FJd_1H3rZGg&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
      },
      {
       "label": "Strategic Practice 2 con soluzioni: inclusione-esclusione, indipendenza (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_2.pdf"
      }
     ],
     "sections": [
      {
       "h": "Dalla conta agli assiomi",
       "text": "La definizione ingenua non basta quando i risultati non sono equiprobabili, come per una moneta truccata o per il guasto di un macchinario, o quando sono infiniti. Per questo il corso introduce la definizione generale, che si regge su due soli assiomi (axioms). Primo: l'evento impossibile ha probabilità 0 e l'intero spazio campionario ha probabilità 1. Secondo: se alcuni eventi non possono accadere insieme, cioè sono disgiunti (disjoint), la probabilità che se ne verifichi uno è la somma delle loro probabilità. Tutto il resto si dimostra a partire da qui. Esempio: un fornitore consegna in anticipo con probabilità 0,2, puntuale con 0,5, in ritardo con 0,3. I tre casi si escludono a vicenda e coprono tutte le possibilità, e infatti la somma fa 1. Se un modello di previsione assegna a casi del genere probabilità che sommano a 1,2, non è «un po' ottimista»: è incoerente. Negli esercizi del corso si mostra che chi scommette seguendo probabilità incoerenti può essere battuto con certezza da un avversario furbo."
      },
      {
       "h": "Complementare e inclusione-esclusione",
       "text": "Dagli assiomi discendono due regole che si usano di continuo. La prima è quella del complementare (complement): la probabilità che A non accada è 1 meno la probabilità di A. Sembra banale, ma spesso è molto più facile calcolare che qualcosa non succeda mai che contare tutti i modi in cui succede. La seconda è l'inclusione-esclusione (inclusion-exclusion): la probabilità di «A oppure B» è P(A) + P(B) − P(A e B). L'intersezione si sottrae perché, sommando, l'abbiamo contata due volte. In un ufficio il 60% delle persone beve caffè, il 30% beve tè e il 20% beve entrambi: chi beve almeno una delle due bevande è il 60 + 30 − 20 = 70%, non il 90%. L'errore tipico è proprio sommare le probabilità di eventi che si sovrappongono. Con tre o più eventi la formula continua alternando somme e sottrazioni delle intersezioni, e Blitzstein la usa per risolvere il problema delle concordanze che vedremo alla fine."
      },
      {
       "h": "Il problema del compleanno",
       "text": "Quante persone servono perché la probabilità che almeno due compiano gli anni lo stesso giorno superi il 50%? Molti dicono 183, cioè metà di 365. La risposta è 23. Il trucco è passare al complementare e calcolare la probabilità che tutti i compleanni siano diversi. La prima persona può essere nata in qualunque giorno, la seconda deve evitare un giorno (364/365), la terza due giorni (363/365) e così via. Moltiplicando i 23 fattori si ottiene circa 0,493, quindi la probabilità di almeno un compleanno in comune è circa il 50,7%. Con 30 persone si sale al 71%, con 50 al 97%, con 70 oltre il 99,9%. Il calcolo assume 365 giorni ugualmente probabili e ignora il 29 febbraio e i gemelli. La ragione per cui il numero è così basso è che contano le coppie, non le persone: con 23 persone le coppie possibili sono 253, e ognuna è un'occasione di coincidenza."
      },
      {
       "h": "Non confondere le domande",
       "text": "L'errore più comune è scambiare «due persone qualsiasi hanno lo stesso compleanno» con «qualcuno ha il mio compleanno». Nel secondo caso le coppie utili sono solo quelle che mi coinvolgono. Con altre 22 persone in una stanza la probabilità che almeno una sia nata nel mio stesso giorno è appena del 6% circa, e per arrivare al 50% servono circa 253 persone. La lezione vale ben oltre i compleanni. Le coincidenze che sembrano incredibili, come incontrare un ex compagno di scuola in vacanza, diventano probabili quando le occasioni sono moltissime e non avevamo fissato in anticipo quale coincidenza ci avrebbe stupito. C'è anche un'applicazione pratica: gli identificativi casuali troppo corti si ripetono prima del previsto. Se assegni a caso codici di 3 cifre (1.000 possibili) ai clienti, con soli 40 clienti la probabilità di avere almeno un doppione è già del 55% circa."
      },
      {
       "h": "Il problema delle concordanze",
       "text": "Un altro classico della terza lezione è il problema delle concordanze (matching problem), studiato all'inizio del Settecento da Pierre Rémond de Montmort. Si mescolano n carte numerate da 1 a n e le si gira una alla volta: qual è la probabilità che almeno una carta esca esattamente nella sua posizione? Con l'inclusione-esclusione si trova che, quando n cresce, la risposta si avvicina a 1 − 1/e, circa il 63%, e che il numero di carte quasi non conta: con 10 carte è già 0,632. Un esempio familiare è il Babbo Natale segreto in ufficio. Se i bigliettini con i nomi si estraggono senza controlli, nel 63% dei casi almeno una persona pesca il proprio nome, che siano in 10 o in 100. La sorpresa sta nel fatto che l'intuizione si aspetta un risultato che dipende molto dal numero di persone: con più persone ognuna ha meno probabilità di pescarsi, ma ci sono più persone a cui può capitare, e i due effetti si compensano quasi perfettamente."
      }
     ],
     "keyPoints": [
      "Gli assiomi: l'evento impossibile vale 0, lo spazio intero vale 1, le probabilità di eventi disgiunti si sommano.",
      "Il complementare è spesso la via più breve: calcola la probabilità che una cosa non accada mai.",
      "Inclusione-esclusione: P(A o B) = P(A) + P(B) − P(A e B), per non contare due volte la sovrapposizione.",
      "Bastano 23 persone per superare il 50% di probabilità di un compleanno condiviso.",
      "Le coincidenze sono frequenti perché il numero di coppie cresce molto più in fretta del numero di persone.",
      "Nel problema delle concordanze la probabilità di almeno una coincidenza tende a 1 − 1/e, circa il 63%."
     ],
     "terms": [
      {
       "t": "Assiomi della probabilità (axioms)",
       "d": "Le due regole di base da cui si deduce tutto: P(vuoto) = 0, P(tutto) = 1, e additività per eventi disgiunti."
      },
      {
       "t": "Eventi disgiunti (disjoint)",
       "d": "Eventi che non possono verificarsi insieme, come «esce 1» ed «esce 6» nello stesso lancio di dado."
      },
      {
       "t": "Complementare (complement)",
       "d": "L'evento «A non accade»; la sua probabilità è 1 − P(A)."
      },
      {
       "t": "Inclusione-esclusione (inclusion-exclusion)",
       "d": "Regola per la probabilità di un'unione: si sommano le probabilità e si tolgono le sovrapposizioni contate due volte."
      },
      {
       "t": "Problema del compleanno (birthday problem)",
       "d": "Calcolo della probabilità che in un gruppo almeno due persone condividano il compleanno; supera il 50% con 23 persone."
      },
      {
       "t": "Problema delle concordanze (matching problem)",
       "d": "Probabilità che in una permutazione casuale almeno un elemento resti al suo posto; tende a circa il 63%."
      }
     ],
     "quiz": [
      {
       "q": "Tra i clienti di un'azienda il 40% compra pavimenti, il 25% rivestimenti e il 10% entrambi. Che percentuale compra almeno uno dei due prodotti?",
       "options": [
        "65%",
        "55%",
        "50%",
        "35%"
       ],
       "answer": 1,
       "why": "Per l'inclusione-esclusione: 40 + 25 − 10 = 55%. Il 65% conta due volte il 10% che compra entrambi."
      },
      {
       "q": "Perché nel problema del compleanno conviene calcolare prima la probabilità che tutti i compleanni siano diversi?",
       "options": [
        "Perché è l'unico metodo corretto in assoluto",
        "Perché i compleanni non sono equiprobabili",
        "Perché è un caso solo e facile da contare, mentre «almeno una coppia» comprende moltissimi casi sovrapposti",
        "Perché così non servono gli assiomi"
       ],
       "answer": 2,
       "why": "«Almeno una coppia» include una coppia, due coppie, un terzetto e così via, casi che si sovrappongono e sono difficili da contare. «Tutti diversi» è un unico prodotto semplice, e la regola del complementare fa il resto."
      },
      {
       "q": "In una classe di 30 studenti, quale stima è più vicina alla probabilità che almeno due abbiano lo stesso compleanno?",
       "options": [
        "8%",
        "30%",
        "50%",
        "70%"
       ],
       "answer": 3,
       "why": "Con 30 persone la probabilità è circa il 71%. L'8% (30/365) è l'errore di chi pensa solo alle coincidenze con una data fissata, invece che a tutte le 435 coppie possibili."
      },
      {
       "q": "Un collega dice: «Siamo in 23 in riunione, quindi c'è circa il 50% di probabilità che qualcuno sia nato il mio stesso giorno». Ha ragione?",
       "options": [
        "Sì, è esattamente il problema del compleanno",
        "No: per una data fissata, con 22 altre persone, la probabilità è circa il 6%",
        "No: è esattamente 23/365",
        "Sì, ma solo se nessuno è nato il 29 febbraio"
       ],
       "answer": 1,
       "why": "Il 50% con 23 persone riguarda una coppia qualsiasi. Per una data fissata la probabilità è 1 − (364/365)^22, circa il 6%. Il valore 22/365 o 23/365 è vicino ma non esatto, perché sommare le probabilità ignora i casi in cui più persone sono nate quel giorno."
      },
      {
       "q": "Un report interno stima: ordine acquisito 0,5, ordine perso 0,3, trattativa ancora aperta 0,3. I tre casi si escludono e coprono tutto. Cosa non va?",
       "options": [
        "Le probabilità di casi disgiunti che coprono tutto devono sommare a 1, qui fanno 1,1",
        "Niente, sono stime plausibili",
        "Nessuna probabilità può valere esattamente 0,5",
        "Andrebbero moltiplicate invece che sommate"
       ],
       "answer": 0,
       "why": "Per gli assiomi, eventi disgiunti ed esaustivi hanno probabilità totale 1. Una somma di 1,1 rivela stime incoerenti tra loro, anche se ciascuna presa da sola sembra ragionevole."
      }
     ],
     "explain": "Spiega a un amico perché a una festa con 30 persone non c'è niente di strano se due festeggiano il compleanno lo stesso giorno, ma sarebbe molto più strano trovare qualcuno nato il tuo stesso giorno.",
     "apply": "Alla prossima occasione con almeno 25 persone (una riunione, una cena, un gruppo WhatsApp) raccogli le date di compleanno e controlla se c'è una coppia. Annota il risultato e ripeti con altri gruppi: vedrai che capita più spesso di quanto immaginavi."
    },
    {
     "id": "prob-harvard-stat110-03",
     "title": "Indipendenza e probabilità condizionata",
     "minutes": 12,
     "watch": {
      "label": "Lezione 4: Conditional Probability (video, circa 50 minuti; si apre con l'indipendenza)",
      "url": "https://www.youtube.com/watch?v=P7NE4WF8j-Q&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Strategic Practice 2 con soluzioni: indipendenza e ragionare in modo condizionato (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_2.pdf"
      }
     ],
     "sections": [
      {
       "h": "Che cosa vuol dire indipendenti",
       "text": "Due eventi sono indipendenti (independent) quando sapere che uno si è verificato non cambia la probabilità dell'altro. In formula: la probabilità che accadano entrambi è il prodotto delle singole probabilità, P(A e B) = P(A) × P(B). Due lanci di una moneta sono l'esempio tipico: testa e poi testa ha probabilità 1/2 × 1/2 = 1/4. Nel lavoro la regola si usa per stimare rischi combinati. Se due macchinari si guastano in un giorno con probabilità 0,05 e 0,02 e sono davvero indipendenti, la probabilità che si fermino entrambi è 0,001, una volta su mille. Ma se sono collegati alla stessa linea elettrica non sono più indipendenti: un blackout li ferma insieme, e la probabilità reale del doppio guasto è molto più alta. Moltiplicare probabilità di eventi che hanno una causa comune è uno degli errori più costosi nella valutazione dei rischi, dalle centrali elettriche ai portafogli di prestiti."
      },
      {
       "h": "Indipendenti non vuol dire incompatibili",
       "text": "Un equivoco diffusissimo è confondere eventi indipendenti con eventi disgiunti, cioè incompatibili. In realtà due eventi disgiunti, ciascuno con probabilità positiva, sono fortemente dipendenti: se so che uno è accaduto, so con certezza che l'altro non è accaduto. «Il cliente paga questa fattura con bonifico» e «la paga in contanti» sono disgiunti, e proprio per questo sapere l'uno dice tutto sull'altro. Il corso mette in guardia anche da un'altra trappola: con tre eventi non basta che siano indipendenti a due a due. Si lanciano due monete e si considerano gli eventi A, la prima è testa; B, la seconda è testa; C, le due monete mostrano la stessa faccia. Ogni coppia di eventi è indipendente, si può verificare contando i quattro casi. Però se A e B sono veri, C è certo: i tre eventi insieme non sono indipendenti. Per dirlo servirebbe anche che la probabilità di A, B e C insieme fosse 1/8, mentre è 1/4."
      },
      {
       "h": "Il problema di Newton-Pepys",
       "text": "Nel 1693 Samuel Pepys, noto per il suo diario, scrisse a Isaac Newton per sapere quale di tre scommesse fosse più conveniente: ottenere almeno un sei lanciando 6 dadi, almeno due sei lanciando 12 dadi, oppure almeno tre sei lanciando 18 dadi. Pepys pensava che l'ultima fosse la migliore. Newton rispose correttamente che la più probabile è la prima. Grazie all'indipendenza dei dadi la prima si calcola in una riga con il complementare: la probabilità di nessun sei in 6 lanci è (5/6) elevato alla sesta, circa 0,335, quindi almeno un sei ha probabilità circa 0,665. Le altre due valgono circa 0,619 e 0,597. L'intuizione di Pepys era «proporzionale»: se raddoppio i dadi e raddoppio i sei richiesti, la probabilità dovrebbe restare uguale. Non è così, e la storia mostra perché nel corso il calcolo prevale sempre sull'impressione: anche chi è abituato a scommettere può sbagliare su domande semplici."
      },
      {
       "h": "Probabilità condizionata",
       "text": "La probabilità condizionata (conditional probability) risponde alla domanda: quanto è probabile A, sapendo che B è vero? Si scrive P(A|B) e vale P(A e B) diviso P(B). L'idea è semplice: si restringe il mondo ai soli casi in cui B è accaduto e si guarda quale frazione di questi contiene anche A. In uno showroom entrano 200 visitatori in un mese; 80 chiedono un preventivo e 30 di loro poi comprano, mentre altri 10 comprano senza preventivo. La probabilità di acquisto in generale è 40 su 200, il 20%. La probabilità di acquisto sapendo che il cliente ha chiesto un preventivo è 30 su 80, il 37,5%. Il preventivo è un'informazione che cambia la stima, quindi i due eventi non sono indipendenti. In questi termini l'indipendenza ha una lettura molto naturale: P(A|B) = P(A). Blitzstein ripete spesso che il condizionamento è «l'anima della statistica» (the soul of statistics): imparare qualcosa significa aggiornare le probabilità."
      },
      {
       "h": "L'errore di invertire il condizionale",
       "text": "P(A|B) e P(B|A) sono numeri diversi, spesso diversissimi, ma il linguaggio comune li confonde di continuo. Quasi tutti i giocatori di basket professionisti sono molto alti, quindi P(alto | giocatore professionista) è vicina a 1. Ma tra le persone molto alte i giocatori professionisti sono una frazione minuscola, quindi P(giocatore professionista | alto) è vicina a 0. Nel lavoro l'errore prende forme meno evidenti. «L'80% dei clienti insoddisfatti aveva ricevuto la merce in ritardo» non significa che l'80% di chi riceve la merce in ritardo sia insoddisfatto: dipende da quanti ritardi ci sono in totale e da quanti clienti si lamentano comunque. Per passare da una direzione all'altra serve un ingrediente in più, cioè quanto sono frequenti i due eventi presi da soli. Questo passaggio ha un nome preciso, teorema di Bayes, ed è l'argomento della prossima lezione."
      }
     ],
     "keyPoints": [
      "Due eventi sono indipendenti se P(A e B) = P(A) × P(B), cioè se uno non dice nulla sull'altro.",
      "Moltiplicare le probabilità è lecito solo con vera indipendenza: una causa comune la distrugge.",
      "Eventi disgiunti con probabilità positiva sono dipendenti, non indipendenti.",
      "L'indipendenza a coppie non garantisce l'indipendenza di tre o più eventi insieme.",
      "La probabilità condizionata P(A|B) restringe il mondo ai casi in cui B è vero.",
      "P(A|B) e P(B|A) sono diverse: confonderle è uno degli errori più comuni."
     ],
     "terms": [
      {
       "t": "Indipendenza (independence)",
       "d": "Due eventi sono indipendenti se la probabilità che accadano entrambi è il prodotto delle due probabilità."
      },
      {
       "t": "Probabilità condizionata (conditional probability)",
       "d": "P(A|B) = P(A e B) / P(B): la probabilità di A quando si sa che B è accaduto."
      },
      {
       "t": "Indipendenza a coppie (pairwise independence)",
       "d": "Ogni coppia di eventi è indipendente; non basta a rendere indipendente l'intero gruppo."
      },
      {
       "t": "Causa comune",
       "d": "Un fattore che influenza più eventi insieme e li rende dipendenti, come un blackout per due macchinari."
      },
      {
       "t": "Problema di Newton-Pepys",
       "d": "Domanda posta da Pepys a Newton nel 1693 su tre scommesse con i dadi; la più probabile è almeno un sei con 6 dadi."
      }
     ],
     "quiz": [
      {
       "q": "Due fornitori indipendenti consegnano in ritardo con probabilità 0,1 e 0,2. Qual è la probabilità che siano in ritardo entrambi?",
       "options": [
        "0,3",
        "0,15",
        "0,02",
        "0,28"
       ],
       "answer": 2,
       "why": "Con l'indipendenza si moltiplica: 0,1 × 0,2 = 0,02. Il valore 0,3 è la somma, che non ha senso per «entrambi»; 0,28 è la probabilità che almeno uno sia in ritardo (0,1 + 0,2 − 0,02)."
      },
      {
       "q": "Gli eventi «il prossimo cliente paga con carta» e «il prossimo cliente paga in contanti» (un solo metodo per pagamento) sono:",
       "options": [
        "Indipendenti, perché sono metodi diversi",
        "Disgiunti e quindi dipendenti",
        "Indipendenti e disgiunti insieme",
        "Né disgiunti né dipendenti"
       ],
       "answer": 1,
       "why": "Non possono verificarsi insieme, quindi sono disgiunti; sapere che ha pagato con carta azzera la probabilità dei contanti, quindi sono fortemente dipendenti. Chi risponde «indipendenti» confonde incompatibilità e indipendenza."
      },
      {
       "q": "Su 500 email ricevute, 100 contengono la parola «offerta»; di queste 60 sono spam. In totale le email spam sono 150. Quanto vale P(spam | «offerta»)?",
       "options": [
        "60%",
        "30%",
        "40%",
        "12%"
       ],
       "answer": 0,
       "why": "Si restringe il mondo alle 100 email con «offerta»: 60 su 100 sono spam, il 60%. Il 40% sarebbe 60/150, cioè la probabilità inversa P(«offerta» | spam); il 30% è la percentuale di spam in generale."
      },
      {
       "q": "Pepys pensava che «almeno tre sei con 18 dadi» fosse più probabile di «almeno un sei con 6 dadi». Qual è il suo errore di ragionamento?",
       "options": [
        "Credeva che i dadi fossero truccati",
        "Ha confuso eventi disgiunti e indipendenti",
        "Ha supposto che triplicando dadi e sei richiesti la probabilità restasse uguale o crescesse",
        "Non conosceva la regola del complementare, che non esisteva"
       ],
       "answer": 2,
       "why": "L'intuizione proporzionale sembra ragionevole ma è falsa: le probabilità sono circa 0,665 contro 0,597. Più dadi rendono il risultato più vicino alla media, e chiedere esattamente «la propria quota» di sei diventa meno facile del previsto."
      },
      {
       "q": "Un articolo dice: «Il 90% dei piloti coinvolti in incidenti aveva meno di 10 anni di esperienza». Cosa si può concludere sulla pericolosità dei piloti poco esperti?",
       "options": [
        "Che sono 9 volte più pericolosi degli altri",
        "Che il 90% dei piloti poco esperti ha incidenti",
        "Che gli esperti non hanno mai incidenti",
        "Niente di preciso, finché non si sa quanti piloti in totale hanno meno di 10 anni di esperienza"
       ],
       "answer": 3,
       "why": "Il dato è P(poco esperto | incidente). Per giudicare il rischio serve P(incidente | poco esperto), e per ricavarla bisogna conoscere quanti piloti sono poco esperti: se fossero il 90% di tutti, il dato non direbbe nulla."
      }
     ],
     "explain": "Spiega a un amico la differenza tra «eventi indipendenti» ed «eventi incompatibili», con un esempio preso dalla vita di tutti i giorni.",
     "apply": "Cerca nei tuoi dati di lavoro (vendite, reclami, consegne) due eventi che di solito vengono trattati come indipendenti. Chiediti se esiste una causa comune che li lega, come la stagione, un fornitore o una persona, e se questo cambia la stima del rischio combinato."
    },
    {
     "id": "prob-harvard-stat110-04",
     "title": "Il teorema di Bayes e i test medici",
     "minutes": 13,
     "watch": {
      "label": "Lezione 5: Conditioning Continued, Law of Total Probability (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=JzDvVgNDxo8&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Strategic Practice 3 con soluzioni: include la forma a quote di Bayes per test ripetuti (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_3.pdf"
      }
     ],
     "sections": [
      {
       "h": "Il teorema di Bayes",
       "text": "Il teorema di Bayes (Bayes' rule) è la formula che permette di invertire una probabilità condizionata: P(A|B) = P(B|A) × P(A) / P(B). Prende il nome dal reverendo inglese Thomas Bayes, il cui lavoro fu pubblicato nel 1763, dopo la sua morte. Si legge così: parto da quanto credevo probabile A prima dell'informazione, la probabilità a priori (prior); la moltiplico per quanto l'informazione B è compatibile con A; divido per quanto B è frequente in generale. Ottengo la probabilità a posteriori (posterior). Un esempio di tutti i giorni: un allarme antifurto suona quasi sempre se c'è un ladro, ma i furti sono rari e gli allarmi scattano anche per un gatto o per il vento. Quando l'allarme suona, la probabilità di un furto vero è molto più bassa di quanto suggerisca la sua affidabilità. Il punto centrale di Bayes è che la stessa prova vale molto o poco a seconda di quanto era probabile l'ipotesi prima di vederla."
      },
      {
       "h": "La legge della probabilità totale",
       "text": "Per usare Bayes serve P(B), la probabilità complessiva dell'informazione. La si ottiene con la legge della probabilità totale (law of total probability): si divide il mondo in casi che si escludono e coprono tutto, si calcola la probabilità di B in ciascun caso e si fa la media pesata. Esempio aziendale: il 70% delle piastrelle arriva dal fornitore X, che ha il 2% di pezzi difettosi, e il 30% dal fornitore Y, che ne ha il 5%. La probabilità che una piastrella presa a caso sia difettosa è 0,7 × 0,02 + 0,3 × 0,05 = 0,014 + 0,015 = 2,9%. Ora Bayes: se trovo un pezzo difettoso, la probabilità che venga da Y è 0,015 / 0,029, circa il 52%, anche se Y fornisce solo il 30% della merce. Blitzstein consiglia di pensare sempre per casi: quando un problema sembra difficile, ci si chiede «su cosa vorrei poter condizionare?» e si spezza il calcolo lì."
      },
      {
       "h": "Il test medico: perché un positivo non è una condanna",
       "text": "Una malattia colpisce l'1% della popolazione. Un test è accurato al 95%: dà positivo nel 95% dei malati e negativo nel 95% dei sani. Una persona presa a caso risulta positiva: quanto è probabile che sia malata? Quasi tutti rispondono 95%. La risposta è circa 16%. Il modo più chiaro per vederlo è usare frequenze invece di percentuali. Su 10.000 persone, 100 sono malate e 95 di loro risultano positive. Le altre 9.900 sono sane, ma il 5% di loro, cioè 495, risulta comunque positivo. I positivi sono 590 in tutto, e solo 95 sono davvero malati: 95 su 590 fa il 16%. Il test non è inutile, perché ha fatto salire la probabilità dall'1% al 16%, ma i falsi positivi sono tanti perché i sani sono tantissimi. Ignorare quanto è rara la malattia si chiama trascurare la frequenza di base (base rate fallacy), ed è un errore documentato anche tra medici e giudici."
      },
      {
       "h": "Un secondo test e l'indipendenza condizionata",
       "text": "Se la persona fa un secondo test e risulta di nuovo positiva, Bayes si applica ancora, partendo questa volta dal 16% invece che dall'1%. Il risultato è circa il 78%. Le informazioni si accumulano: la probabilità a posteriori di oggi diventa la probabilità a priori di domani. Il calcolo però presuppone che i due test sbaglino in modo indipendente una volta fissato lo stato di salute, cioè l'indipendenza condizionata (conditional independence). I due risultati non sono affatto indipendenti in generale, perché dipendono entrambi dalla malattia, ma lo sono dato lo stato di salute. Se invece lo stesso laboratorio ripete lo stesso errore, il secondo positivo aggiunge poca informazione. Il contesto conta anche nell'altra direzione: tra pazienti con sintomi, dove la malattia riguarda magari il 10% delle persone, un solo positivo porta la probabilità al 68% circa. Lo stesso test, applicato a gruppi diversi, significa cose diverse."
      },
      {
       "h": "La fallacia del procuratore",
       "text": "Lo stesso errore dei test medici, portato in tribunale, si chiama fallacia del procuratore (prosecutor's fallacy): si confonde la probabilità della prova se l'imputato è innocente con la probabilità che l'imputato sia innocente data la prova. Supponiamo che una traccia di DNA corrisponda per caso a una persona su un milione. Sembra una prova schiacciante, ma in una regione di 5 milioni di abitanti ci si aspettano circa 5 persone innocenti compatibili con la traccia. Se l'imputato è stato trovato solo cercando nel database, senza altri indizi, la probabilità che sia colpevole è lontanissima da 999.999 su un milione. Negli esercizi del corso compare anche un caso giudiziario costruito su questo tipo di ragionamento. La regola pratica vale anche in azienda: prima di dire che un indizio «dimostra» qualcosa, chiediti quanti casi innocenti produrrebbero lo stesso indizio, e quanti erano i candidati in partenza."
      }
     ],
     "keyPoints": [
      "Bayes inverte il condizionale: P(A|B) = P(B|A) × P(A) / P(B).",
      "La probabilità a priori conta quanto la prova: un'ipotesi rara resta poco probabile anche dopo un indizio buono.",
      "La legge della probabilità totale calcola P(B) come media pesata sui casi possibili.",
      "Con malattia all'1% e test accurato al 95%, un positivo indica la malattia solo nel 16% dei casi.",
      "Ragionare con frequenze (su 10.000 persone) rende Bayes intuitivo.",
      "Le prove si accumulano: la probabilità a posteriori di oggi è la probabilità a priori di domani."
     ],
     "terms": [
      {
       "t": "Teorema di Bayes (Bayes' rule)",
       "d": "Formula che ricava P(A|B) da P(B|A), dalla probabilità a priori di A e dalla probabilità di B."
      },
      {
       "t": "Probabilità a priori (prior)",
       "d": "Quanto si ritiene probabile un'ipotesi prima di vedere una nuova informazione."
      },
      {
       "t": "Probabilità a posteriori (posterior)",
       "d": "La probabilità aggiornata dopo aver tenuto conto dell'informazione."
      },
      {
       "t": "Legge della probabilità totale (law of total probability)",
       "d": "La probabilità di un evento è la media delle sue probabilità nei vari casi, pesata dalla probabilità di ciascun caso."
      },
      {
       "t": "Frequenza di base (base rate)",
       "d": "Quanto è comune un fenomeno nella popolazione; ignorarla porta a sovrastimare il valore di un indizio."
      },
      {
       "t": "Indipendenza condizionata (conditional independence)",
       "d": "Due eventi sono indipendenti una volta fissata una terza informazione, anche se in generale non lo sono."
      },
      {
       "t": "Fallacia del procuratore (prosecutor's fallacy)",
       "d": "Confondere P(prova | innocente) con P(innocente | prova)."
      }
     ],
     "quiz": [
      {
       "q": "Un test per una malattia rara (1 persona su 1.000) è accurato al 99% sia sui malati sia sui sani. Una persona presa a caso risulta positiva. Qual è la stima più vicina alla probabilità che sia malata?",
       "options": [
        "99%",
        "50%",
        "9%",
        "1%"
       ],
       "answer": 2,
       "why": "Su 100.000 persone, 100 sono malate e 99 risultano positive; dei 99.900 sani l'1%, circa 999, risulta positivo. I malati veri sono 99 su circa 1.098 positivi: il 9% circa. Il 99% confonde P(positivo | malato) con P(malato | positivo)."
      },
      {
       "q": "Il 60% degli ordini arriva dal canale web, con il 10% di resi; il 40% dal negozio, con il 5% di resi. Qual è la percentuale complessiva di resi?",
       "options": [
        "7,5%",
        "8%",
        "15%",
        "6%"
       ],
       "answer": 1,
       "why": "Legge della probabilità totale: 0,6 × 0,10 + 0,4 × 0,05 = 0,06 + 0,02 = 8%. Il 7,5% è la media semplice dei due tassi, che ignora che il web pesa di più."
      },
      {
       "q": "Nello stesso esempio, un ordine è stato reso. Qual è la probabilità che venisse dal web?",
       "options": [
        "60%",
        "10%",
        "50%",
        "75%"
       ],
       "answer": 3,
       "why": "Bayes: 0,06 / 0,08 = 75%. Il 60% è la probabilità a priori, che non tiene conto del fatto che i resi sono più frequenti sul web."
      },
      {
       "q": "Perché lo stesso test dà risultati più affidabili in un ambulatorio di pazienti con sintomi che in uno screening di massa?",
       "options": [
        "Perché tra chi ha sintomi la malattia è più frequente, quindi la probabilità a priori è più alta",
        "Perché il test funziona meglio sulle persone malate",
        "Perché in ambulatorio i medici sono più bravi",
        "Perché nello screening i test vengono fatti più in fretta"
       ],
       "answer": 0,
       "why": "L'accuratezza del test è la stessa; cambia la frequenza di base. Con più malati tra i testati, i veri positivi pesano di più rispetto ai falsi positivi, e la probabilità a posteriori sale."
      },
      {
       "q": "Un secondo test positivo fa salire la probabilità di malattia dal 16% al 78% solo se:",
       "options": [
        "Il secondo test è più accurato del primo",
        "Gli errori dei due test sono indipendenti una volta fissato lo stato di salute",
        "I due risultati sono indipendenti in generale",
        "Il paziente non sa il risultato del primo test"
       ],
       "answer": 1,
       "why": "Serve l'indipendenza condizionata: dato lo stato di salute, un errore del primo test non rende più probabile un errore del secondo. I due risultati non sono indipendenti in generale, perché dipendono entrambi dalla malattia."
      }
     ],
     "explain": "Spiega a un amico, usando 10.000 persone immaginarie, perché un test accurato al 95% per una malattia rara può dare tanti falsi allarmi.",
     "apply": "La prossima volta che leggi una notizia del tipo «il test individua il 90% dei casi» o «l'algoritmo riconosce le frodi con il 99% di precisione», chiediti quanto è frequente il fenomeno di partenza e prova a rifare il conto su 10.000 casi."
    },
    {
     "id": "prob-harvard-stat110-05",
     "title": "Monty Hall e il paradosso di Simpson",
     "minutes": 12,
     "watch": {
      "label": "Lezione 6: Monty Hall, Simpson's Paradox (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=fDcjhAKuhqQ&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Strategic Practice 3 con soluzioni: Monty Hall con conduttore distorto e paradosso di Simpson (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_3.pdf"
      }
     ],
     "sections": [
      {
       "h": "Il problema delle tre porte",
       "text": "Il problema prende il nome da Monty Hall, conduttore del quiz televisivo americano Let's Make a Deal. Ci sono tre porte: dietro una c'è un'automobile, dietro le altre due una capra. Scegli una porta, per esempio la 1. Il conduttore, che sa dove si trova l'auto, apre una delle altre due porte e mostra una capra, poi ti chiede se vuoi cambiare. Nel 1990 la giornalista Marilyn vos Savant scrisse sulla rivista Parade che conviene cambiare, e ricevette migliaia di lettere che le davano torto, molte firmate da persone con un dottorato. Aveva ragione lei. Nella lezione Blitzstein comincia elencando le ipotesi, perché la risposta dipende da quelle: il conduttore conosce la posizione dell'auto, apre sempre una porta con una capra, e quando ha due porte con la capra tra cui scegliere ne apre una a caso. Senza fissare queste regole il problema non ha una risposta unica, ed è uno dei motivi per cui ha generato tante discussioni."
      },
      {
       "h": "Perché cambiare vince due volte su tre",
       "text": "Il ragionamento sbagliato è: restano due porte, quindi 50 e 50. Il modo più semplice per vedere l'errore è condizionare su dove si trova l'auto, come fa il professore con un albero di probabilità. Hai scelto la porta 1. Se l'auto è dietro la 1, cosa che accade con probabilità 1/3, cambiando perdi. Se l'auto è dietro la 2, il conduttore è obbligato ad aprire la 3, e cambiando vinci. Se l'auto è dietro la 3, deve aprire la 2, e cambiando vinci di nuovo. Cambiare vince quindi in due casi su tre equiprobabili: 2/3. In altre parole, la tua prima scelta aveva 1/3 di probabilità e il gesto del conduttore non la cambia, perché una porta con la capra la può aprire comunque. Tutta la probabilità restante, 2/3, si concentra sull'unica porta che lui ha evitato. Per convincersi, il professore propone di immaginare un milione di porte: ne scegli una, il conduttore ne apre 999.998 con la capra e ne lascia chiusa una sola. Qui quasi tutti cambierebbero, eppure la logica è identica."
      },
      {
       "h": "Le ipotesi cambiano la risposta",
       "text": "Il problema di Monty Hall è soprattutto una lezione su quanto conti il modo in cui un'informazione arriva. Se il conduttore non sapesse dove è l'auto e aprisse a caso una delle due porte rimaste, mostrando per pura fortuna una capra, la probabilità di vincere cambiando scenderebbe a 1/2. L'informazione visibile è la stessa, una capra dietro una porta, ma il processo che l'ha prodotta è diverso. Negli esercizi del corso compare anche un conduttore «distorto», che quando può scegliere preferisce una certa porta, e lì la probabilità dipende da quale porta apre. Lo stesso accade nella vita reale. Un venditore che ti mostra solo i clienti soddisfatti, un fondo che pubblicizza solo i prodotti andati bene, un collega che riporta solo i dati che confermano la sua idea: in tutti questi casi bisogna chiedersi come è stata selezionata l'informazione, prima di aggiornare le proprie convinzioni. Bayes funziona solo se si modella anche il comportamento di chi ci dà i dati."
      },
      {
       "h": "Il paradosso di Simpson",
       "text": "Nella seconda parte della lezione Blitzstein presenta due medici dei Simpson, il dottor Hibbert e il dottor Nick, che eseguono 100 interventi ciascuno di due tipi: operazioni al cuore, difficili, e rimozione di cerotti, facili. Hibbert fa 90 operazioni al cuore con 70 successi e 10 rimozioni di cerotti tutte riuscite. Nick fa 10 operazioni al cuore con 2 successi e 90 rimozioni di cerotti con 81 successi. Hibbert è migliore in entrambe le categorie: 78% contro 20% al cuore, 100% contro 90% con i cerotti. Eppure nel totale Nick ha l'83% di successi e Hibbert solo l'80%. Questo rovesciamento si chiama paradosso di Simpson (Simpson's paradox). Non c'è nessun errore di calcolo: Nick sembra migliore solo perché fa quasi esclusivamente interventi facili. Il tipo di intervento è una variabile confondente (confounder), cioè un fattore che influenza sia chi esegue l'intervento sia la probabilità di successo."
      },
      {
       "h": "Come difendersi: cercare il confondente",
       "text": "Il paradosso di Simpson non è una curiosità da manuale. Nel corso si cita il caso delle ammissioni ai corsi post-laurea dell'Università di Berkeley: i dati complessivi del 1973 sembravano mostrare uno svantaggio per le donne, ma guardando dipartimento per dipartimento lo svantaggio spariva. Le donne si candidavano più spesso ai dipartimenti più selettivi. Lo stesso schema si ritrova nelle medie dei battitori di baseball e nei confronti tra ospedali: chi cura i pazienti più gravi può avere una mortalità complessiva più alta pur essendo migliore in ogni categoria. In azienda capita confrontando agenti di vendita: chi segue i clienti più difficili può avere un tasso di conversione totale più basso anche se è il migliore con ogni tipo di cliente. La difesa è chiedersi sempre se i gruppi confrontati sono composti allo stesso modo e, se non lo sono, dividere i dati per il fattore che li distingue. Attenzione però: non sempre il dato disaggregato è quello giusto, dipende da qual è la domanda e da quali sono le relazioni di causa."
      }
     ],
     "keyPoints": [
      "Nel problema di Monty Hall, con le ipotesi standard, cambiare porta vince con probabilità 2/3.",
      "Il conduttore sa dove è l'auto e apre sempre una capra: è questo che rende informativo il suo gesto.",
      "Se il conduttore aprisse a caso, la stessa scena porterebbe a 1/2: conta come nasce l'informazione.",
      "Il paradosso di Simpson: un confronto può rovesciarsi quando si uniscono gruppi di composizione diversa.",
      "Una variabile confondente influenza sia il gruppo sia il risultato e può falsare i confronti aggregati.",
      "Prima di confrontare tassi complessivi, verifica che i gruppi siano composti allo stesso modo."
     ],
     "terms": [
      {
       "t": "Problema di Monty Hall",
       "d": "Rompicapo delle tre porte: con un conduttore informato che apre sempre una capra, conviene cambiare porta."
      },
      {
       "t": "Albero di probabilità (tree diagram)",
       "d": "Schema che segue passo per passo i possibili esiti e le loro probabilità, moltiplicandole lungo i rami."
      },
      {
       "t": "Paradosso di Simpson (Simpson's paradox)",
       "d": "Una relazione presente in ogni sottogruppo si inverte quando i gruppi vengono uniti."
      },
      {
       "t": "Variabile confondente (confounder)",
       "d": "Fattore che influenza sia la variabile che si confronta sia il risultato, creando relazioni ingannevoli."
      },
      {
       "t": "Disaggregare",
       "d": "Dividere i dati in sottogruppi omogenei per vedere se il confronto complessivo regge."
      }
     ],
     "quiz": [
      {
       "q": "Nel gioco di Monty Hall con le regole standard, scegli la porta 2. Il conduttore apre la 3 e mostra una capra. Qual è la probabilità di vincere se cambi e passi alla 1?",
       "options": [
        "1/3",
        "1/2",
        "2/3",
        "1"
       ],
       "answer": 2,
       "why": "La tua prima scelta aveva 1/3 e il conduttore, che sa dove è l'auto, può sempre aprire una capra senza cambiarla. Il restante 2/3 va tutto alla porta che ha evitato. Il 50% nasce dal pensare che due porte rimaste valgano per forza uguale."
      },
      {
       "q": "Un conduttore non sa dove è l'auto e apre a caso una delle due porte che non hai scelto. Per fortuna c'è una capra. Quanto vale ora cambiare?",
       "options": [
        "1/2",
        "2/3",
        "1/3",
        "3/4"
       ],
       "answer": 0,
       "why": "Senza informazione del conduttore, il fatto che sia uscita una capra elimina in modo simmetrico i casi: restano equiprobabili la tua porta e l'altra, quindi 1/2. La risposta 2/3 vale solo se il conduttore sa e sceglie apposta una capra."
      },
      {
       "q": "Il reparto A di un'azienda ha un tasso di errore più basso del reparto B sia sugli ordini semplici sia su quelli complessi, ma un tasso complessivo più alto. Qual è la spiegazione più probabile?",
       "options": [
        "Un errore nei conti",
        "A gestisce una quota molto maggiore di ordini complessi",
        "B è più grande di A",
        "I tassi di errore non si possono confrontare"
       ],
       "answer": 1,
       "why": "È il paradosso di Simpson: se A tratta soprattutto ordini complessi, che hanno più errori per natura, il suo tasso totale sale anche se è migliore in ogni categoria. La dimensione dei reparti da sola non basta a spiegarlo: conta la composizione."
      },
      {
       "q": "Nell'esempio dei due medici, quale informazione toglie il paradosso?",
       "options": [
        "Il numero totale di interventi di ciascun medico",
        "L'età dei pazienti",
        "Il nome dell'ospedale",
        "Il tipo di intervento, che separa operazioni difficili e facili"
       ],
       "answer": 3,
       "why": "Il tipo di intervento è la variabile confondente: Nick fa quasi solo rimozioni di cerotti. Condizionando su questo fattore, Hibbert è migliore in entrambe le categorie. Il totale degli interventi è uguale per i due e non spiega nulla."
      },
      {
       "q": "Un fondo d'investimento pubblicizza solo i suoi prodotti che hanno battuto il mercato. Che lezione di Monty Hall si applica?",
       "options": [
        "Bisogna sempre cambiare scelta",
        "Le probabilità restano sempre 50 e 50",
        "Bisogna considerare come è stata selezionata l'informazione mostrata, non solo l'informazione",
        "I fondi sono come le capre"
       ],
       "answer": 2,
       "why": "Come nel gioco, ciò che vedi dipende dalle scelte di chi te lo mostra. Se vengono mostrati solo i successi, il loro numero dice poco sulla bravura media. Cambiare sempre scelta non è la morale del problema, ma una conseguenza delle sue regole precise."
      }
     ],
     "explain": "Spiega a un amico perché nel problema di Monty Hall conviene cambiare porta, usando la versione con un milione di porte.",
     "apply": "Prendi un confronto che usi al lavoro (tra agenti, negozi, fornitori o mesi) e chiediti se i gruppi sono composti allo stesso modo. Prova a dividere i dati per il fattore più ovvio, come il tipo di cliente o di prodotto, e guarda se la classifica cambia."
    },
    {
     "id": "prob-harvard-stat110-06",
     "title": "Variabili casuali e distribuzione binomiale",
     "minutes": 13,
     "watch": {
      "label": "Lezione 7: Gambler's Ruin and Random Variables (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=PNrqCdslGi4&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Lezione 8 (video): Random Variables and Their Distributions, con funzione di ripartizione e ipergeometrica",
       "url": "https://www.youtube.com/watch?v=k2BB0p8byGA&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
      },
      {
       "label": "Strategic Practice 3 con soluzioni: rovina del giocatore, Bernoulli e binomiale (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_3.pdf"
      }
     ],
     "sections": [
      {
       "h": "Una variabile casuale è una funzione",
       "text": "Una variabile casuale (random variable) assegna un numero a ogni possibile risultato di un esperimento. Il nome è fuorviante, come sottolinea Blitzstein: non è una variabile nel senso dell'algebra, è una funzione che va dallo spazio campionario ai numeri. Se lancio tre monete, il numero di teste è una variabile casuale: al risultato TCT associa 2, al risultato CCC associa 0. Altri esempi sono l'incasso di una giornata, il numero di piastrelle difettose in un bancale, i giorni di ritardo di un pagamento. La distribuzione (distribution) dice con quale probabilità la variabile assume ciascun valore. Per le variabili che assumono valori isolati, come 0, 1, 2, si descrive con la funzione di massa di probabilità (PMF). Il corso chiama «magia simpatica» (sympathetic magic) l'errore di confondere la variabile con la sua distribuzione. In una moneta, «vale 1 se esce testa» e «vale 1 se esce croce» hanno esattamente la stessa distribuzione, eppure non sono mai uguali nello stesso lancio."
      },
      {
       "h": "Bernoulli e binomiale",
       "text": "La variabile casuale più semplice è la Bernoulli (Bernoulli): vale 1 con probabilità p, che si chiama successo, e 0 con probabilità 1 − p. Un preventivo che diventa ordine o no, un pezzo difettoso o no, un tiro libero segnato o sbagliato. Se ripeto n prove indipendenti, tutte con la stessa probabilità p, e conto i successi, ottengo una binomiale (binomial). La probabilità di k successi è il coefficiente binomiale «n su k» moltiplicato per p elevato a k e per (1 − p) elevato a n − k: si sceglie quali prove sono successi, poi si moltiplicano le probabilità grazie all'indipendenza. Lanciando 10 volte una moneta, la probabilità di ottenere esattamente 5 teste è 252/1024, circa il 24,6%. Il risultato «più probabile» capita quindi solo una volta su quattro. Il valore medio di una binomiale è n × p: con 20 piastrelle e il 5% di difettosità, in media se ne trova una difettosa per scatola."
      },
      {
       "h": "Un esempio di controllo qualità",
       "text": "Restiamo sulla scatola da 20 piastrelle, ciascuna difettosa con probabilità 5% in modo indipendente dalle altre. La probabilità che non ce ne sia nessuna difettosa è 0,95 elevato alla 20, circa il 36%. Quindi in quasi due scatole su tre c'è almeno un pezzo difettoso, anche se il tasso del 5% sembra basso. La probabilità di trovarne al massimo uno è circa il 74%, il che vuol dire che in una scatola su quattro ne compaiono due o più senza che il processo produttivo sia peggiorato. Questo tipo di calcolo serve a non reagire in modo sbagliato: un cliente che trova due pezzi difettosi in una scatola non dimostra che il fornitore ha un problema, mentre trovarne cinque sarebbe molto più sospetto. La binomiale aiuta anche a stabilire soglie di controllo ragionevoli, decidendo in anticipo quanti difetti in un campione sono normali e quanti richiedono un intervento."
      },
      {
       "h": "Quando la binomiale non va bene",
       "text": "La binomiale ha tre requisiti: numero di prove fissato, stessa probabilità in ogni prova, prove indipendenti. Se manca uno di questi, il modello può sbagliare di molto. Un caso frequente è l'estrazione senza reinserimento da un gruppo piccolo. Se un lotto contiene 50 pezzi di cui 5 difettosi e ne controllo 10, ogni pezzo estratto cambia la composizione di quelli rimasti, quindi le prove non sono indipendenti. Il conteggio corretto segue la distribuzione ipergeometrica (hypergeometric), presentata nella lezione 8, che negli esercizi del corso compare con la stima di una popolazione di alci catturate e marcate. Altro caso: la probabilità cambia nel tempo, come la conversione dei preventivi che cala in agosto. Oppure le prove sono collegate, come gli ordini di più negozi della stessa catena. La lezione 8 introduce anche la funzione di ripartizione (CDF), che dà la probabilità che la variabile sia minore o uguale a un certo valore e funziona per qualunque tipo di variabile."
      },
      {
       "h": "La rovina del giocatore",
       "text": "La lezione 7 si apre con un classico: la rovina del giocatore (gambler's ruin). Due giocatori puntano un euro alla volta finché uno dei due resta senza soldi. Se il gioco è equo, la probabilità di vincere tutto è pari alla propria quota del capitale totale. Chi ha 10 euro contro un banco che ne ha 990 vince tutto con probabilità 10 su 1.000, cioè l'1%, anche se ogni singola partita è perfettamente equa. Se il gioco è appena sfavorevole, le cose peggiorano molto in fretta. Alla roulette europea, puntando un euro alla volta sul rosso si vince ogni giro con probabilità 18/37, poco meno della metà. Partendo da 50 euro con l'obiettivo di arrivare a 100, la probabilità di riuscirci è solo del 6% circa, invece del 50% di un gioco equo. Per Blitzstein il problema è anche un esempio di metodo: si condiziona sul risultato della prima partita (first step analysis) e si risolve l'equazione che ne risulta."
      }
     ],
     "keyPoints": [
      "Una variabile casuale è una funzione che associa un numero a ogni risultato dell'esperimento.",
      "La distribuzione dice con che probabilità la variabile assume ogni valore; non va confusa con la variabile.",
      "La binomiale conta i successi in n prove indipendenti con la stessa probabilità p; la media è n × p.",
      "Anche il risultato più probabile può essere raro: 5 teste su 10 lanci escono solo nel 24,6% dei casi.",
      "Senza reinserimento da un gruppo piccolo serve l'ipergeometrica, non la binomiale.",
      "Nella rovina del giocatore, un piccolo svantaggio per partita diventa uno svantaggio enorme sul lungo periodo."
     ],
     "terms": [
      {
       "t": "Variabile casuale (random variable)",
       "d": "Funzione che associa un numero a ciascun risultato possibile di un esperimento casuale."
      },
      {
       "t": "Distribuzione (distribution)",
       "d": "Descrizione delle probabilità con cui una variabile casuale assume i suoi valori."
      },
      {
       "t": "Funzione di massa di probabilità (PMF)",
       "d": "Per una variabile discreta, la probabilità di ciascun valore possibile."
      },
      {
       "t": "Bernoulli",
       "d": "Variabile che vale 1 (successo) con probabilità p e 0 con probabilità 1 − p."
      },
      {
       "t": "Binomiale (binomial)",
       "d": "Numero di successi in n prove indipendenti con la stessa probabilità p di successo."
      },
      {
       "t": "Ipergeometrica (hypergeometric)",
       "d": "Numero di elementi speciali in un campione estratto senza reinserimento da un gruppo finito."
      },
      {
       "t": "Funzione di ripartizione (CDF)",
       "d": "La probabilità che la variabile sia minore o uguale a x, per ogni valore x."
      },
      {
       "t": "Rovina del giocatore (gambler's ruin)",
       "d": "Problema della probabilità di arrivare a un obiettivo prima di perdere tutto, puntando una somma fissa a ogni giro."
      }
     ],
     "quiz": [
      {
       "q": "Il 30% dei preventivi diventa un ordine, in modo indipendente. Su 10 preventivi, qual è il numero medio di ordini?",
       "options": [
        "3",
        "30",
        "0,3",
        "7"
       ],
       "answer": 0,
       "why": "Il numero di ordini è una binomiale con n = 10 e p = 0,3, la cui media è n × p = 3. Il 7 è il numero medio di preventivi persi, non di ordini."
      },
      {
       "q": "Quale di questi conteggi NON è ben descritto da una binomiale?",
       "options": [
        "Teste in 20 lanci di una moneta",
        "Assi in una mano di 5 carte pescate da un mazzo senza rimetterle",
        "Pezzi difettosi in 100 pezzi prodotti indipendentemente con la stessa probabilità di difetto",
        "Rigori segnati su 10 calciati da un giocatore con probabilità costante"
       ],
       "answer": 1,
       "why": "Le carte si pescano senza reinserimento da un mazzo piccolo: ogni asso pescato cambia le probabilità dei successivi, quindi serve l'ipergeometrica. Gli altri casi hanno prove indipendenti con probabilità fissa."
      },
      {
       "q": "Lanci 10 volte una moneta equilibrata. Qual è la stima più vicina alla probabilità di ottenere esattamente 5 teste?",
       "options": [
        "50%",
        "10%",
        "75%",
        "25%"
       ],
       "answer": 3,
       "why": "La probabilità è 252/1024, circa il 24,6%. Il 50% confonde «il valore più probabile» con «il valore che esce di solito»: ci sono molti altri risultati vicini, come 4 o 6 teste."
      },
      {
       "q": "X vale 1 se una moneta dà testa e 0 altrimenti; Y vale 1 se la stessa moneta dà croce e 0 altrimenti. Quale affermazione è corretta?",
       "options": [
        "X e Y sono la stessa variabile casuale",
        "X e Y hanno la stessa distribuzione ma non sono mai uguali",
        "X e Y hanno distribuzioni diverse",
        "X + Y vale 2 con probabilità 1/4"
       ],
       "answer": 1,
       "why": "Entrambe sono Bernoulli con p = 1/2, quindi hanno la stessa distribuzione; ma in ogni lancio una vale 1 e l'altra 0. Pensare che stessa distribuzione voglia dire stessa variabile è la «magia simpatica». Inoltre X + Y vale sempre 1."
      },
      {
       "q": "Un giocatore con 20 euro sfida, a un gioco perfettamente equo da un euro a partita, un avversario con 80 euro. Con che probabilità finirà per vincere tutti i 100 euro?",
       "options": [
        "50%",
        "80%",
        "20%",
        "Dipende dalla fortuna, non si può calcolare"
       ],
       "answer": 2,
       "why": "Nella rovina del giocatore con gioco equo, la probabilità di vincere tutto è uguale alla propria quota del capitale totale: 20/100 = 20%. Che ogni partita sia al 50% non rende al 50% l'esito finale."
      }
     ],
     "explain": "Spiega a un amico perché una variabile casuale non è un numero misterioso ma una regola che assegna un numero a ogni possibile esito, usando l'esempio delle teste in tre lanci di moneta.",
     "apply": "Scegli un controllo che fai al lavoro (pezzi difettosi, errori in fattura, consegne in ritardo) e stima la probabilità di un singolo caso negativo. Con la binomiale calcola quanti casi su 20 o su 50 sono normali, e fissa una soglia oltre la quale vale la pena indagare."
    },
    {
     "id": "prob-harvard-stat110-07",
     "title": "Valore atteso, geometrica e linearità",
     "minutes": 12,
     "watch": {
      "label": "Lezione 9: Expectation, Indicator Random Variables, Linearity (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=LX2q356N2rU&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Lezione 10 (video): ancora linearità, binomiale negativa e paradosso di San Pietroburgo",
       "url": "https://www.youtube.com/watch?v=P1fSFvhPf7Q&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
      },
      {
       "label": "Strategic Practice 4 con soluzioni: valori attesi, variabili indicatrici e linearità (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_4.pdf"
      }
     ],
     "sections": [
      {
       "h": "Il valore atteso, cioè la media di lungo periodo",
       "text": "Il valore atteso (expected value) di una variabile casuale è la media dei suoi valori, ciascuno pesato con la sua probabilità. Si indica con E(X). Per un dado: (1 + 2 + 3 + 4 + 5 + 6) / 6 = 3,5. Il dado non mostrerà mai 3,5: il valore atteso non è il risultato più probabile né un risultato possibile, è il centro di gravità della distribuzione e la media a cui ci si avvicina ripetendo l'esperimento molte volte. Il concetto si usa ovunque si parli di guadagni incerti. Alla roulette europea, puntando un euro sul rosso si vince un euro con probabilità 18/37 e lo si perde con probabilità 19/37. Il valore atteso è 18/37 − 19/37 = −1/37, cioè circa 2,7 centesimi persi per ogni euro giocato. Il singolo giocatore può vincere stasera, ma il casinò, che gioca milioni di puntate, incassa quasi esattamente quella percentuale. Nelle decisioni aziendali il valore atteso è il primo numero da calcolare, ma come vedremo nell'ultima lezione non è l'unico che conta."
      },
      {
       "h": "La distribuzione geometrica",
       "text": "Quanto bisogna aspettare per il primo successo? Se ogni prova riesce con probabilità p in modo indipendente, il numero di fallimenti prima del primo successo segue la distribuzione geometrica (geometric). Il suo valore atteso è (1 − p) / p. Con un dado, aspettando il primo sei, p = 1/6: in media ci sono 5 fallimenti, quindi il primo sei arriva in media al sesto lancio. Un venditore che chiude un contratto nel 20% delle telefonate fa in media 4 telefonate a vuoto e chiude alla quinta. Ma la media nasconde molta variabilità: la probabilità di non chiudere nulla nelle prime 4 telefonate è 0,8 elevato alla quarta, circa il 41%. Una nota pratica: nel corso di Blitzstein la geometrica conta i fallimenti prima del successo, mentre molti altri libri contano tutte le prove compreso il successo, e allora la media diventa 1 / p. È una fonte classica di errori di uno: prima di usare una formula trovata in rete conviene controllare quale convenzione segue."
      },
      {
       "h": "La linearità: la proprietà più utile",
       "text": "La proprietà più potente del valore atteso è la linearità (linearity): il valore atteso di una somma è la somma dei valori attesi, E(X + Y) = E(X) + E(Y). Vale sempre, anche quando X e Y sono dipendenti, e questo la rende straordinariamente comoda. Il valore atteso del numero di sei lanciando 10 dadi è 10 × 1/6, circa 1,67, senza calcolare nessuna probabilità complicata. Se un'azienda ha tre linee di prodotto con incassi mensili attesi di 40, 25 e 15 mila euro, l'incasso atteso totale è 80 mila euro, anche se le tre linee vanno bene o male insieme perché dipendono dalla stessa stagione. Vale anche la regola E(aX + b) = a E(X) + b: se ogni pezzo venduto porta 12 euro di margine e i costi fissi sono 500 euro, il profitto atteso è 12 volte le vendite attese meno 500. Attenzione però: la linearità vale per le somme e le costanti, non per tutte le funzioni. In generale E(X²) non è uguale a E(X)², e la differenza tra i due è proprio la varianza della prossima lezione."
      },
      {
       "h": "Le variabili indicatrici",
       "text": "La tecnica preferita del corso per calcolare valori attesi difficili è scomporre un conteggio in una somma di variabili indicatrici (indicator random variables). Un'indicatrice vale 1 se un certo evento accade e 0 altrimenti, e il suo valore atteso è semplicemente la probabilità dell'evento: Blitzstein lo chiama il «ponte fondamentale» (fundamental bridge) tra probabilità e valore atteso. Riprendiamo il problema delle concordanze: n persone ritirano a caso n cappotti al guardaroba. Quante, in media, ricevono il proprio? Ogni persona riceve il suo con probabilità 1/n, quindi l'indicatrice di ciascuna vale in media 1/n. Sommando le n indicatrici, per linearità il valore atteso è n × 1/n = 1, qualunque sia n. Le indicatrici sono dipendenti tra loro, ma alla linearità non importa. Con lo stesso metodo si trova che in un gruppo di 23 persone il numero medio di coppie con lo stesso compleanno è 253/365, circa 0,69. Il metodo funziona perché trasforma una domanda difficile su un totale in tante domande facili su singoli casi."
      }
     ],
     "keyPoints": [
      "Il valore atteso è la media dei valori pesati con le loro probabilità: il centro della distribuzione.",
      "Il valore atteso può essere un valore impossibile, come 3,5 per un dado.",
      "La geometrica conta i fallimenti prima del primo successo; con probabilità p la media è (1 − p) / p.",
      "Linearità: E(X + Y) = E(X) + E(Y) vale sempre, anche con variabili dipendenti.",
      "Il valore atteso di un'indicatrice è la probabilità del suo evento: il «ponte fondamentale».",
      "Scomporre un conteggio in indicatrici rende facili molti valori attesi difficili."
     ],
     "terms": [
      {
       "t": "Valore atteso (expected value)",
       "d": "Media dei valori di una variabile casuale pesata con le probabilità; si scrive E(X)."
      },
      {
       "t": "Geometrica (geometric)",
       "d": "Numero di fallimenti prima del primo successo in prove indipendenti con probabilità p."
      },
      {
       "t": "Linearità (linearity)",
       "d": "Proprietà per cui il valore atteso di una somma è sempre la somma dei valori attesi."
      },
      {
       "t": "Variabile indicatrice (indicator)",
       "d": "Variabile che vale 1 se un evento accade e 0 altrimenti; la sua media è la probabilità dell'evento."
      },
      {
       "t": "Ponte fondamentale (fundamental bridge)",
       "d": "Il legame tra probabilità e valore atteso: E(indicatrice di A) = P(A)."
      }
     ],
     "quiz": [
      {
       "q": "Un gioco costa 2 euro: si lancia un dado e si vincono 10 euro se esce 6, niente altrimenti. Qual è il guadagno atteso netto per partita?",
       "options": [
        "Circa −0,33 euro",
        "Circa +1,67 euro",
        "Circa −1,67 euro",
        "Zero"
       ],
       "answer": 0,
       "why": "La vincita attesa è 10 × 1/6, circa 1,67 euro; togliendo i 2 euro del costo si ottiene circa −0,33 euro a partita. L'opzione +1,67 dimentica di sottrarre il costo del gioco."
      },
      {
       "q": "Un operatore risolve al primo tentativo il 25% delle richieste, in modo indipendente. Seguendo la convenzione del corso, quanti tentativi falliti ci sono in media prima della prima soluzione?",
       "options": [
        "4",
        "3",
        "0,25",
        "1,33"
       ],
       "answer": 1,
       "why": "Geometrica con p = 0,25: la media dei fallimenti è (1 − p) / p = 0,75 / 0,25 = 3. Il 4 è il numero medio di tentativi totali, compreso quello riuscito: è la convenzione di altri libri."
      },
      {
       "q": "In un'azienda, 3 commerciali hanno vendite mensili attese di 20, 30 e 50 mila euro, ma le loro vendite sono correlate perché dipendono dallo stesso mercato. Quanto valgono le vendite mensili attese totali?",
       "options": [
        "Non si può dire senza conoscere la correlazione",
        "Meno di 100 mila, per via della correlazione",
        "100 mila euro",
        "Più di 100 mila, per via della correlazione"
       ],
       "answer": 2,
       "why": "Per la linearità il valore atteso della somma è la somma dei valori attesi, 100 mila euro, qualunque sia la dipendenza. La correlazione conta per la variabilità del totale, non per la sua media."
      },
      {
       "q": "In una festa 40 persone lasciano il cappello all'ingresso e all'uscita li ritirano completamente a caso. Quante persone, in media, riprendono il proprio cappello?",
       "options": [
        "40",
        "Circa 0,63",
        "20",
        "1"
       ],
       "answer": 3,
       "why": "Ogni persona ha probabilità 1/40 di riprendere il suo; per linearità la media totale è 40 × 1/40 = 1. Il valore 0,63 è un'altra cosa: la probabilità che almeno una persona lo riprenda."
      },
      {
       "q": "Perché la linearità del valore atteso è così utile con le variabili indicatrici?",
       "options": [
        "Perché rende indipendenti le indicatrici",
        "Perché permette di sommare le singole probabilità anche quando gli eventi sono dipendenti",
        "Perché funziona solo con eventi rari",
        "Perché evita di dover conoscere le probabilità"
       ],
       "answer": 1,
       "why": "La linearità non richiede indipendenza: si calcola la probabilità di ogni singolo evento e si sommano. Le indicatrici restano dipendenti, ma per la media non importa."
      }
     ],
     "explain": "Spiega a un amico perché il valore atteso di un dado è 3,5 anche se nessuna faccia mostra 3,5, e cosa significa allora quel numero.",
     "apply": "Per una scelta reale di questa settimana (accettare un ordine, partecipare a una gara, comprare una garanzia estesa) scrivi gli esiti possibili, una stima delle loro probabilità e il loro valore in euro. Calcola il valore atteso e confrontalo con quello che avresti deciso d'istinto."
    },
    {
     "id": "prob-harvard-stat110-08",
     "title": "La distribuzione di Poisson e gli eventi rari",
     "minutes": 11,
     "watch": {
      "label": "Lezione 11: The Poisson distribution (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=TD1N4hxqMzY&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Strategic Practice 5 con soluzioni: distribuzione e paradigma di Poisson (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_5.pdf"
      }
     ],
     "sections": [
      {
       "h": "Contare eventi rari",
       "text": "Quante email arrivano in un'ora? Quanti reclami in una settimana? Quanti refusi in una pagina? Quando si contano eventi che possono capitare molte volte ma ciascuno con bassa probabilità e in modo più o meno indipendente, il modello naturale è la distribuzione di Poisson (Poisson distribution), dal nome del matematico francese Siméon-Denis Poisson. Ha un solo parametro, λ (lambda), che è il numero medio di eventi nell'intervallo considerato. La probabilità di osservarne esattamente k è e elevato a −λ, moltiplicato per λ elevato a k, diviso k fattoriale. Una sua caratteristica è che la media e la varianza sono entrambe uguali a λ. Un esempio storico famoso è quello di Ladislaus Bortkiewicz, che nel 1898 mostrò che il numero annuo di soldati prussiani uccisi da un calcio di cavallo, in ogni corpo d'armata, seguiva molto bene una distribuzione di Poisson: eventi rari, tante occasioni, nessun legame tra un caso e l'altro."
      },
      {
       "h": "Un esempio con i numeri",
       "text": "Uno showroom riceve in media 3 reclami a settimana. Se i reclami arrivano in modo indipendente, il loro numero settimanale è una Poisson con λ = 3. Facendo i conti: una settimana senza reclami ha probabilità del 5% circa, una con un solo reclamo del 15%, con 2 o con 3 reclami del 22% ciascuna. Una settimana con 6 o più reclami ha probabilità dell'8% circa, cioè capita più o meno una settimana ogni dodici senza che nulla sia cambiato. Questo è il messaggio pratico più importante della Poisson: i conteggi di eventi rari oscillano molto per puro caso. Un responsabile che convoca una riunione d'urgenza ogni volta che i reclami raddoppiano rispetto alla media finirà per reagire al rumore. Un aumento è davvero un segnale quando è molto improbabile sotto il modello, per esempio 10 reclami in una settimana, che con λ = 3 capita circa una settimana su novecento, oppure quando l'aumento dura per diverse settimane di fila."
      },
      {
       "h": "L'approssimazione di Poisson",
       "text": "La Poisson nasce come limite della binomiale: quando le prove sono moltissime e la probabilità di successo di ciascuna è piccola, il numero di successi è circa una Poisson con λ = n × p. Se vengono venduti 1.000 biglietti di una lotteria, ciascuno con probabilità 1 su 1.000 di vincere un premio, il numero di biglietti vincenti è circa una Poisson con λ = 1. La probabilità che nessuno vinca è circa e elevato a −1, cioè il 36,8%, quasi identica al valore esatto della binomiale, 36,77%. Blitzstein parla di paradigma di Poisson (Poisson paradigm): l'approssimazione funziona bene anche quando gli eventi sono solo debolmente dipendenti. Un bell'esempio è il problema del compleanno. Con 23 persone ci sono 253 coppie, ciascuna con probabilità 1/365 di coincidere, quindi il numero medio di coincidenze è circa 0,69. La probabilità di nessuna coincidenza è circa e elevato a −0,69, cioè il 50%, molto vicina al valore esatto del 49,3%."
      },
      {
       "h": "Quando la Poisson non funziona",
       "text": "Il modello di Poisson si basa sull'idea che gli eventi non si influenzino tra loro e che il loro ritmo medio sia costante. Quando gli eventi arrivano a grappoli, il modello sottostima la variabilità. Le richieste di risarcimento a un'assicurazione dopo una grandinata, gli incidenti stradali nelle giornate di ghiaccio, i guasti causati da un unico lotto difettoso di componenti: in tutti questi casi un evento rende più probabili gli altri, o tutti dipendono da una causa comune. Un controllo semplice è confrontare la media e la varianza dei conteggi osservati: se la varianza è molto più grande della media si parla di sovradispersione (overdispersion), e la Poisson non è il modello giusto. Un altro errore è usare lo stesso λ per periodi diversi: un negozio che riceve in media 2 clienti l'ora di mattina e 10 il sabato pomeriggio non ha un unico λ. In quel caso conviene un λ diverso per ogni fascia oraria."
      }
     ],
     "keyPoints": [
      "La Poisson conta eventi rari e indipendenti in un intervallo; ha un solo parametro λ, la media.",
      "Nella Poisson media e varianza coincidono: entrambe valgono λ.",
      "I conteggi di eventi rari oscillano molto per caso: con media 3, una settimana con 6 o più eventi capita circa una volta su dodici.",
      "Con molte prove e probabilità piccola, la binomiale è approssimata da una Poisson con λ = n × p.",
      "Il paradigma di Poisson funziona anche con dipendenze deboli, come nel problema del compleanno.",
      "Se gli eventi arrivano a grappoli, la varianza supera la media e la Poisson non va bene."
     ],
     "terms": [
      {
       "t": "Distribuzione di Poisson",
       "d": "Distribuzione del numero di eventi rari e indipendenti in un intervallo, con media λ."
      },
      {
       "t": "Lambda (λ)",
       "d": "Il parametro della Poisson: il numero medio di eventi nell'intervallo, che è anche la varianza."
      },
      {
       "t": "Approssimazione di Poisson",
       "d": "Una binomiale con n grande e p piccolo si comporta circa come una Poisson con λ = n × p."
      },
      {
       "t": "Paradigma di Poisson (Poisson paradigm)",
       "d": "Principio per cui il numero di molti eventi rari e debolmente dipendenti è circa Poisson."
      },
      {
       "t": "Sovradispersione (overdispersion)",
       "d": "Situazione in cui i conteggi variano più di quanto preveda la Poisson, spesso per eventi a grappoli."
      }
     ],
     "quiz": [
      {
       "q": "Un call center riceve in media 2 chiamate al minuto, in modo indipendente. Qual è la stima più vicina alla probabilità di un minuto senza chiamate?",
       "options": [
        "0%",
        "50%",
        "13,5%",
        "2%"
       ],
       "answer": 2,
       "why": "Con una Poisson di λ = 2, la probabilità di zero eventi è e elevato a −2, circa 0,135. Lo zero non è impossibile solo perché la media è 2: i conteggi oscillano."
      },
      {
       "q": "Un responsabile nota 7 reclami in una settimana, contro una media storica di 4. Qual è la reazione più sensata?",
       "options": [
        "Considerarlo un'oscillazione che con una Poisson capita circa una settimana su dieci, e guardare se si ripete",
        "Concludere che la qualità è crollata",
        "Ignorare per sempre i reclami",
        "Raddoppiare subito il personale"
       ],
       "answer": 0,
       "why": "Con λ = 4 la probabilità di 7 o più reclami è circa l'11%: succede abbastanza spesso per caso. Diventa un segnale se si ripete per più settimane o se il numero è molto più improbabile."
      },
      {
       "q": "Un portale vende 5.000 biglietti di un concorso; ogni biglietto ha probabilità 1 su 10.000 di vincere un premio. Quale distribuzione approssima bene il numero di biglietti vincenti?",
       "options": [
        "Normale con media 5.000",
        "Poisson con λ = 0,5",
        "Geometrica con p = 0,5",
        "Uniforme tra 0 e 5.000"
       ],
       "answer": 1,
       "why": "Molte prove, probabilità piccola: il numero di vincite è circa Poisson con λ = n × p = 5.000 / 10.000 = 0,5. La normale funziona male per eventi così rari."
      },
      {
       "q": "In un'assicurazione il numero medio di sinistri al giorno è 10, ma la varianza osservata è 60. Cosa suggerisce questo dato?",
       "options": [
        "Che il modello di Poisson è perfetto",
        "Che i sinistri sono diminuiti",
        "Che la media è sbagliata",
        "Che i sinistri arrivano a grappoli e la Poisson sottostima la variabilità"
       ],
       "answer": 3,
       "why": "In una Poisson varianza e media coincidono. Una varianza sei volte maggiore indica sovradispersione: eventi collegati, per esempio dal maltempo, che arrivano insieme."
      },
      {
       "q": "Con 23 persone ci sono 253 coppie, ognuna con probabilità 1/365 di condividere il compleanno. Come stima il paradigma di Poisson la probabilità di nessuna coincidenza?",
       "options": [
        "253/365",
        "e elevato alla −253/365, circa il 50%",
        "1/365",
        "1 − 1/e, circa il 63%"
       ],
       "answer": 1,
       "why": "Il numero di coincidenze è circa Poisson con λ = 253/365, circa 0,69, e la probabilità di zero è e elevato a −λ, circa 0,50, vicina al valore esatto di 0,493. 253/365 è invece il numero medio di coincidenze."
      }
     ],
     "explain": "Spiega a un collega perché una settimana con il doppio dei reclami rispetto alla media non dimostra per forza che qualcosa è andato storto.",
     "apply": "Prendi un conteggio settimanale che segui al lavoro (reclami, ordini urgenti, richieste di assistenza) per le ultime 10-20 settimane. Calcola la media e la varianza: se sono simili la Poisson è un buon modello e puoi stimare quali settimane erano davvero anomale."
    },
    {
     "id": "prob-harvard-stat110-09",
     "title": "Varianza e distribuzioni continue",
     "minutes": 12,
     "watch": {
      "label": "Lezione 12: Discrete vs. Continuous, the Uniform (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=Tci---bVs60&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Strategic Practice 5 con soluzioni: distribuzioni continue e LOTUS (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_5.pdf"
      }
     ],
     "sections": [
      {
       "h": "Misurare la dispersione: la varianza",
       "text": "Due situazioni possono avere lo stesso valore atteso ed essere molto diverse. L'investimento A rende sempre 100 euro; l'investimento B rende 50 o 150 euro con la stessa probabilità. Entrambi valgono in media 100, ma B è chiaramente più rischioso. Per misurare quanto una variabile si allontana dalla sua media si usa la varianza (variance): la media dei quadrati delle distanze dalla media, Var(X) = E[(X − μ)²]. Si elevano al quadrato le distanze perché altrimenti quelle positive e quelle negative si annullerebbero. Siccome la varianza si misura in unità al quadrato, euro al quadrato, si usa spesso la sua radice, la deviazione standard (standard deviation), che torna nelle unità originali. Per B le distanze dalla media sono sempre 50, quindi la deviazione standard è 50 euro; per A è zero. Per un dado la varianza vale circa 2,92 e la deviazione standard circa 1,71: in media i risultati si discostano da 3,5 di quasi due punti."
      },
      {
       "h": "Proprietà e trappole della varianza",
       "text": "Un modo comodo per calcolare la varianza è Var(X) = E(X²) − [E(X)]². Per un dado, E(X²) si ottiene facendo la media dei quadrati 1, 4, 9, 16, 25, 36, cioè circa 15,17, senza bisogno di trovare la distribuzione di X². Questo trucco, usare direttamente la distribuzione di X per calcolare la media di una sua funzione, il corso lo chiama LOTUS (law of the unconscious statistician). Togliendo 3,5 al quadrato, cioè 12,25, si ritrova 2,92. Le regole di calcolo della varianza sono diverse da quelle della media. Aggiungere una costante non cambia nulla: un bonus fisso di 100 euro a tutti non rende gli stipendi più dispersi. Moltiplicare per una costante moltiplica la varianza per il quadrato: chi raddoppia la puntata quadruplica la varianza e raddoppia la deviazione standard. La varianza di una somma è la somma delle varianze solo se le variabili sono indipendenti. E la media di n prove indipendenti ha una deviazione standard divisa per la radice di n: con 4 misure la dispersione della media si dimezza."
      },
      {
       "h": "Variabili continue e densità",
       "text": "Molte grandezze non assumono valori isolati ma possono cadere ovunque in un intervallo: il tempo di consegna, il peso di una piastrella, la temperatura. Sono variabili continue (continuous). Per loro la probabilità di un valore esatto è zero: la probabilità che una consegna duri esattamente 2 ore, zero secondi e zero millesimi è nulla. Hanno senso solo le probabilità di intervalli, come «tra 2 e 3 ore». Al posto della funzione di massa si usa la densità di probabilità (PDF, probability density function), una curva in cui la probabilità di un intervallo è l'area sotto la curva in quell'intervallo. L'area totale è 1. Un errore comune è leggere la densità come una probabilità: la densità può anche superare 1, purché l'area totale resti 1. Una variabile uniforme tra 0 e mezzo minuto, per esempio, ha densità 2 su tutto l'intervallo. Per passare dalle variabili discrete a quelle continue basta sostituire le somme con gli integrali: medie, varianze e funzione di ripartizione restano gli stessi concetti."
      },
      {
       "h": "La distribuzione uniforme",
       "text": "La più semplice distribuzione continua è l'uniforme (uniform) su un intervallo da a a b: intervalli della stessa lunghezza hanno la stessa probabilità, ovunque si trovino. Un autobus passa ogni 10 minuti esatti e arrivi alla fermata senza conoscere l'orario: il tempo di attesa è uniforme tra 0 e 10 minuti. In media aspetti 5 minuti, con una deviazione standard di circa 2,9 minuti, e la probabilità di aspettare più di 8 minuti è 2 su 10, il 20%. Nella lezione Blitzstein mostra una proprietà sorprendente, l'universalità dell'uniforme (universality of the uniform): partendo da un numero uniforme tra 0 e 1 si può costruire una variabile con qualsiasi distribuzione si voglia, applicando la giusta trasformazione. È il principio su cui si basano le simulazioni al computer, che generano numeri uniformi e li trasformano in tempi di attesa, rendimenti o domande di mercato. Il limite pratico è l'ipotesi stessa: molti fenomeni «a caso» non sono affatto uniformi, e trattarli come tali porta a sottovalutare i valori estremi."
      }
     ],
     "keyPoints": [
      "La varianza misura quanto una variabile si allontana dalla media; la deviazione standard è la sua radice.",
      "Due scelte con lo stesso valore atteso possono avere rischi molto diversi.",
      "Var(X) = E(X²) − E(X)²; aggiungere una costante non cambia la varianza, moltiplicare per c la moltiplica per c².",
      "La media di n prove indipendenti ha deviazione standard divisa per la radice di n.",
      "Per una variabile continua la probabilità è un'area sotto la densità; un singolo valore esatto ha probabilità zero.",
      "Con l'uniforme, intervalli di uguale lunghezza hanno uguale probabilità; dall'uniforme si può simulare ogni distribuzione."
     ],
     "terms": [
      {
       "t": "Varianza (variance)",
       "d": "Media del quadrato della distanza dalla media; misura la dispersione di una variabile casuale."
      },
      {
       "t": "Deviazione standard (standard deviation)",
       "d": "Radice quadrata della varianza, espressa nelle stesse unità della variabile."
      },
      {
       "t": "LOTUS",
       "d": "Regola per calcolare la media di una funzione di X usando direttamente la distribuzione di X."
      },
      {
       "t": "Variabile continua (continuous)",
       "d": "Variabile che può assumere qualunque valore in un intervallo; ogni singolo valore ha probabilità zero."
      },
      {
       "t": "Densità di probabilità (PDF)",
       "d": "Curva la cui area su un intervallo dà la probabilità che la variabile cada lì."
      },
      {
       "t": "Uniforme (uniform)",
       "d": "Distribuzione continua in cui intervalli della stessa lunghezza hanno la stessa probabilità."
      }
     ],
     "quiz": [
      {
       "q": "Il progetto A rende 0 o 200 mila euro con probabilità 1/2; il progetto B rende 90 o 110 mila con probabilità 1/2. Cosa si può dire?",
       "options": [
        "Stesso valore atteso, ma A ha deviazione standard molto maggiore",
        "A ha valore atteso maggiore",
        "B ha valore atteso maggiore",
        "Hanno la stessa varianza"
       ],
       "answer": 0,
       "why": "Entrambi valgono in media 100 mila euro; le distanze dalla media sono 100 mila per A e 10 mila per B, che sono anche le loro deviazioni standard. Chi guarda solo la media li considera equivalenti."
      },
      {
       "q": "Un venditore ha vendite giornaliere con deviazione standard di 300 euro. Se l'azienda gli raddoppia tutti i prezzi a parità di pezzi venduti, quanto diventa la deviazione standard degli incassi?",
       "options": [
        "300 euro",
        "1.200 euro",
        "600 euro",
        "424 euro"
       ],
       "answer": 2,
       "why": "Moltiplicare una variabile per 2 moltiplica la deviazione standard per 2 e la varianza per 4. La risposta 1.200 confonde deviazione standard e varianza."
      },
      {
       "q": "Il tempo di consegna di un corriere è una variabile continua. Qual è la probabilità che duri esattamente 48 ore, senza nessuna frazione di secondo in più o in meno?",
       "options": [
        "1/48",
        "Dipende dalla densità in quel punto",
        "Circa 50%",
        "Zero"
       ],
       "answer": 3,
       "why": "Per una variabile continua ogni singolo valore esatto ha probabilità zero; hanno probabilità positiva solo gli intervalli. La densità in un punto non è una probabilità, serve un'area."
      },
      {
       "q": "Un treno passa ogni 20 minuti e tu arrivi in stazione in un momento a caso. Qual è la probabilità di aspettare meno di 5 minuti?",
       "options": [
        "5%",
        "25%",
        "50%",
        "Impossibile da dire"
       ],
       "answer": 1,
       "why": "L'attesa è uniforme tra 0 e 20 minuti, quindi la probabilità di un intervallo è la sua lunghezza divisa per 20: 5/20 = 25%."
      },
      {
       "q": "Fai la media di 9 misure indipendenti, ciascuna con deviazione standard di 6 millimetri. Quanto vale la deviazione standard della media?",
       "options": [
        "6 mm",
        "0,67 mm",
        "54 mm",
        "2 mm"
       ],
       "answer": 3,
       "why": "La deviazione standard della media di n misure indipendenti è quella della singola misura divisa per la radice di n: 6 / 3 = 2 mm. Dividere per 9 (0,67 mm) varrebbe per la varianza, non per la deviazione standard."
      }
     ],
     "explain": "Spiega a un amico perché, per scegliere tra due investimenti, non basta conoscere il rendimento medio, usando l'esempio di due investimenti con la stessa media e rischi diversi.",
     "apply": "Prendi le vendite o gli incassi degli ultimi 12 mesi di un'attività che conosci e calcola media e deviazione standard (un foglio di calcolo lo fa con MEDIA e DEV.ST). Chiediti se pianifichi tenendo conto solo della media o anche della dispersione."
    },
    {
     "id": "prob-harvard-stat110-10",
     "title": "La distribuzione normale",
     "minutes": 12,
     "watch": {
      "label": "Lezione 14: Location, Scale, and LOTUS (video, circa 50 minuti; normale e standardizzazione)",
      "url": "https://www.youtube.com/watch?v=9vp1Ll2NpRw&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Lezione 13 (video): Normal distribution, dove si introduce la normale standard",
       "url": "https://www.youtube.com/watch?v=72QjzHnYvL0&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
      },
      {
       "label": "Strategic Practice 5 con soluzioni: distribuzioni continue (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_5.pdf"
      }
     ],
     "sections": [
      {
       "h": "La curva a campana",
       "text": "La distribuzione normale (normal distribution), detta anche gaussiana, è la famosa curva a campana: simmetrica, con un picco al centro e code che scendono rapidamente ai lati. È determinata da due soli numeri, la media μ, che dice dove sta il centro, e la deviazione standard σ, che dice quanto è larga la campana. La versione con media 0 e deviazione standard 1 si chiama normale standard (standard normal) ed è quella studiata nella lezione 13. Il motivo per cui la normale compare ovunque, negli errori di misura, nei pesi dei prodotti confezionati, nella somma di tanti piccoli effetti, è il teorema del limite centrale, che vedremo più avanti: sommando molte piccole cause indipendenti si ottiene quasi sempre una campana. Questo però non vuol dire che tutto sia normale. Redditi, dimensioni delle aziende o perdite assicurative hanno distribuzioni molto asimmetriche, con pochi valori enormi. Usare la normale anche lì è uno degli errori più frequenti dell'analisi dei dati."
      },
      {
       "h": "La regola 68-95-99,7",
       "text": "Per la normale vale una regola da tenere a mente. Circa il 68% dei valori cade entro una deviazione standard dalla media, circa il 95% entro due e circa il 99,7% entro tre. Prendiamo i punteggi dei test di intelligenza, che sono costruiti apposta per avere media 100 e deviazione standard 15. Due persone su tre hanno un punteggio tra 85 e 115; il 95% sta tra 70 e 130; superare 130 riguarda circa il 2,3% delle persone, e superare 145 appena l'1,3 per mille. La regola permette stime rapide in molte situazioni di lavoro. Se un macchinario taglia piastrelle con spessore medio di 10 millimetri e deviazione standard di 0,2 millimetri, quelle oltre 10,4 millimetri, cioè oltre due deviazioni standard, sono circa il 2,3%. Se la tolleranza accettata dal cliente fosse di 10,4 millimetri, circa due pezzi su cento andrebbero scartati da quel lato. Il limite è chiaro: la regola vale solo se i dati sono davvero vicini a una normale."
      },
      {
       "h": "Posizione, scala e punteggio z",
       "text": "Il titolo della lezione 14, posizione e scala (location and scale), riassume un'idea comoda: ogni normale si ottiene da quella standard spostandola e allargandola. Se Z è una normale standard, allora μ + σZ è una normale con media μ e deviazione standard σ. Il passaggio inverso si chiama standardizzazione: si prende un valore x, si sottrae la media e si divide per la deviazione standard. Il risultato, il punteggio z (z-score), dice quante deviazioni standard il valore dista dalla media, e permette di confrontare grandezze misurate su scale diverse. Uno studente prende 28 in un esame in cui la media è 24 e la deviazione standard 2: il suo punteggio z è 2. Un altro prende 27 in un esame con media 25 e deviazione standard 3: il suo z è circa 0,67. Il primo voto è più basso in assoluto ma molto più notevole rispetto al gruppo. Lo stesso confronto si usa per giudicare le prestazioni di negozi in città diverse o di prodotti con volumi molto diversi."
      },
      {
       "h": "Le code e i limiti della normale",
       "text": "Le code della normale si assottigliano in modo estremamente rapido. Un valore oltre 5 deviazioni standard sopra la media ha una probabilità di circa 1 su 3,5 milioni; oltre 10 deviazioni standard è un evento che in pratica non dovrebbe mai accadere. Il problema è che molti fenomeni reali hanno code pesanti (heavy tails), cioè valori estremi molto più frequenti di quanto preveda la campana. L'esempio classico sono i mercati finanziari. Il 19 ottobre 1987 l'indice Dow Jones perse circa il 22% in un solo giorno: con le oscillazioni giornaliere tipiche dell'epoca, dell'ordine dell'uno per cento, sotto un modello normale sarebbe stato un evento di oltre venti deviazioni standard, cioè praticamente impossibile. Eppure è successo, e crolli meno estremi ma comunque «impossibili» per la normale si ripetono. La lezione per chi valuta rischi è netta: la normale è ottima per descrivere il centro di molti fenomeni, ma per le code, che sono proprio dove si nascondono le perdite gravi, va usata con grande prudenza."
      }
     ],
     "keyPoints": [
      "La normale è una campana simmetrica determinata da media e deviazione standard.",
      "Regola 68-95-99,7: percentuale di valori entro 1, 2 e 3 deviazioni standard dalla media.",
      "Ogni normale è una normale standard spostata (posizione) e allargata (scala).",
      "Il punteggio z dice quante deviazioni standard un valore dista dalla media e permette confronti tra scale diverse.",
      "La normale è frequente perché la somma di molti piccoli effetti indipendenti tende a una campana.",
      "Molti fenomeni reali hanno code pesanti: la normale sottostima gli eventi estremi."
     ],
     "terms": [
      {
       "t": "Distribuzione normale (normal)",
       "d": "Distribuzione continua a campana, simmetrica attorno alla media, descritta da media e deviazione standard."
      },
      {
       "t": "Normale standard (standard normal)",
       "d": "La normale con media 0 e deviazione standard 1, da cui si ottengono tutte le altre."
      },
      {
       "t": "Standardizzazione",
       "d": "Trasformare un valore sottraendo la media e dividendo per la deviazione standard."
      },
      {
       "t": "Punteggio z (z-score)",
       "d": "Numero di deviazioni standard di cui un valore si discosta dalla media."
      },
      {
       "t": "Posizione e scala (location and scale)",
       "d": "Spostare e allargare una distribuzione: aggiungere una costante e moltiplicare per una costante positiva."
      },
      {
       "t": "Code pesanti (heavy tails)",
       "d": "Distribuzioni in cui i valori estremi sono molto più frequenti che nella normale."
      }
     ],
     "quiz": [
      {
       "q": "Il peso delle confezioni di un prodotto è circa normale con media 500 g e deviazione standard 5 g. Circa quale percentuale pesa tra 490 e 510 g?",
       "options": [
        "68%",
        "95%",
        "99,7%",
        "50%"
       ],
       "answer": 1,
       "why": "490 e 510 sono a due deviazioni standard dalla media, quindi l'intervallo contiene circa il 95% delle confezioni. Il 68% riguarda l'intervallo di una sola deviazione standard, tra 495 e 505 g."
      },
      {
       "q": "Anna fa 80 punti in un test con media 70 e deviazione standard 5; Luca fa 85 punti in un test con media 75 e deviazione standard 10. Chi ha ottenuto il risultato relativamente migliore?",
       "options": [
        "Luca, perché ha più punti",
        "Sono equivalenti",
        "Anna, con z = 2 contro z = 1",
        "Non si può confrontare"
       ],
       "answer": 2,
       "why": "Anna è 10 punti sopra la media con deviazione standard 5, quindi z = 2; Luca è 10 punti sopra con deviazione standard 10, quindi z = 1. Guardare solo i punti assoluti ignora la diversa dispersione dei due test."
      },
      {
       "q": "Circa quale percentuale di persone ha un punteggio di QI (media 100, deviazione standard 15) superiore a 115?",
       "options": [
        "16%",
        "32%",
        "5%",
        "2,5%"
       ],
       "answer": 0,
       "why": "115 è una deviazione standard sopra la media. Entro una deviazione standard c'è il 68%, fuori il 32%, diviso equamente tra le due code: circa il 16% sopra 115. Il 32% conta entrambe le code."
      },
      {
       "q": "Un analista dice: «Secondo il nostro modello normale, una perdita del 15% in un mese capita una volta ogni 10.000 anni». Qual è l'obiezione più forte?",
       "options": [
        "La normale non ha code",
        "Le perdite sono sempre normali, quindi il calcolo è certo",
        "Bisognerebbe usare l'uniforme",
        "I rendimenti finanziari hanno code pesanti, quindi gli eventi estremi sono molto più frequenti di quanto dica la normale"
       ],
       "answer": 3,
       "why": "La normale descrive bene il centro ma sottostima le code dei mercati, come mostrano crolli del tipo di quello del 1987. La normale ha code, ma si assottigliano troppo in fretta per questi dati."
      },
      {
       "q": "Se Z è una normale standard, che distribuzione ha 50 + 4Z?",
       "options": [
        "Normale con media 4 e deviazione standard 50",
        "Normale con media 50 e deviazione standard 4",
        "Normale con media 54 e deviazione standard 1",
        "Non è più normale"
       ],
       "answer": 1,
       "why": "Spostare di 50 cambia la posizione, moltiplicare per 4 cambia la scala: si ottiene una normale con media 50 e deviazione standard 4 (varianza 16). Le trasformazioni di posizione e scala mantengono la forma a campana."
      }
     ],
     "explain": "Spiega a un amico cosa vuol dire che un risultato ha «punteggio z uguale a 2» e perché questo permette di confrontare voti presi in esami diversi.",
     "apply": "Prendi una misura ripetuta del tuo lavoro o della tua vita (tempi di consegna, spesa settimanale, minuti di allenamento) e calcola media e deviazione standard. Controlla quanti valori cadono entro due deviazioni standard: se sono molto meno del 95%, i tuoi dati hanno code più pesanti della normale."
    },
    {
     "id": "prob-harvard-stat110-11",
     "title": "Esponenziale: tempi di attesa e assenza di memoria",
     "minutes": 11,
     "watch": {
      "label": "Lezione 16: Exponential Distribution (video, circa 50 minuti)",
      "url": "https://www.youtube.com/watch?v=bM6nFDjvEns&list=EC2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo"
     },
     "read": [
      {
       "label": "Strategic Practice 6 con soluzioni: esponenziale e assenza di memoria (PDF, inglese)",
       "url": "https://stat110.hsites.harvard.edu/sites/g/files/omnuum10111/files/stat110/files/strategic_practice_and_homework_6.pdf"
      }
     ],
     "sections": [
      {
       "h": "Tempi di attesa continui",
       "text": "La distribuzione esponenziale (exponential) descrive il tempo che passa prima che accada un evento che può arrivare in qualunque istante con un ritmo costante: il prossimo cliente che entra, la prossima chiamata, il prossimo guasto di un componente elettronico che non si usura. Ha un parametro λ, il ritmo medio degli eventi, e il tempo medio di attesa è 1/λ. La probabilità di aspettare più di un tempo t è e elevato a −λt. Se in un negozio entra in media un cliente ogni 10 minuti, la probabilità di aspettare più di 10 minuti il prossimo cliente è e elevato a −1, circa il 37%; più di 20 minuti, il 13,5%; meno di 5 minuti, il 39%. La forma della distribuzione è sbilanciata: le attese brevi sono le più frequenti, ma ogni tanto ne capita una molto lunga. La mediana è circa 0,69 volte la media, quindi metà delle attese dura meno di 7 minuti anche se la media è 10. L'esponenziale è la versione continua della geometrica, che conta i tentativi prima del primo successo."
      },
      {
       "h": "L'assenza di memoria",
       "text": "La proprietà che rende speciale l'esponenziale è l'assenza di memoria (memoryless property): se hai già aspettato un certo tempo, il tempo che ti resta da aspettare ha la stessa distribuzione che aveva all'inizio. In formula, la probabilità di aspettare altri t minuti, sapendo che ne sono già passati s, è uguale alla probabilità di aspettare t minuti partendo da zero. Nel negozio di prima, se sono passati 10 minuti senza clienti, l'attesa media per il prossimo è ancora 10 minuti, non 0. Blitzstein dimostra nella lezione che, tra le distribuzioni continue, l'esponenziale è l'unica con questa proprietà. Le conseguenze sono spesso controintuitive. Negli esercizi del corso Alice entra in un ufficio postale con due sportelli, entrambi occupati da Bob e Claire. Qual è la probabilità che Alice sia l'ultima dei tre a uscire? Quando uno dei due finisce, Alice prende il suo posto e, per l'assenza di memoria, la gara con l'altro cliente riparte alla pari: la probabilità è 1/2."
      },
      {
       "h": "Il legame con la Poisson",
       "text": "Esponenziale e Poisson sono due facce dello stesso modello, il processo di Poisson (Poisson process). Se gli eventi arrivano in modo indipendente con un ritmo costante di λ per ora, il numero di eventi in un'ora è una Poisson con media λ, e i tempi tra un evento e il successivo sono esponenziali con media 1/λ ore. Un centralino che riceve in media 6 chiamate l'ora ha quindi un numero di chiamate orarie che segue una Poisson con media 6, e un tempo tra due chiamate esponenziale con media 10 minuti. La probabilità di un'ora intera senza chiamate è e elevato a −6, circa 2,5 per mille, che è anche la probabilità che l'attesa superi 60 minuti: due modi di guardare lo stesso evento. Questo legame è prezioso per il dimensionamento: sapere quante richieste arrivano in media basta per stimare quanto spesso si formeranno code e quanto a lungo resteranno vuoti gli sportelli. Il limite è che nella realtà il ritmo cambia durante la giornata, e allora il modello va applicato fascia oraria per fascia oraria."
      },
      {
       "h": "Quando la memoria conta",
       "text": "L'assenza di memoria è un'ipotesi forte, e molte attese reali non la rispettano. Un essere umano di 80 anni non ha la stessa aspettativa di vita residua di uno di 20, e una pompa che lavora da dieci anni si guasta più facilmente di una nuova: in questi casi c'è usura, e l'esponenziale sottostima i guasti degli oggetti vecchi. Il modello va bene per eventi causati da shock esterni che non dipendono dall'età. C'è poi un paradosso famoso, discusso negli esercizi del corso con un passeggero che aspetta l'autobus. Se gli autobus arrivano secondo un processo di Poisson con un intervallo medio di 10 minuti, chi arriva alla fermata in un momento a caso aspetta in media 10 minuti, non 5. Il motivo è che è più facile capitare dentro un intervallo lungo che dentro uno breve, e l'intervallo in cui si cade dura in media 20 minuti. Questo paradosso dell'ispezione (inspection paradox) spiega perché i viaggiatori hanno l'impressione che l'autobus sia sempre in ritardo: lo stesso effetto fa sembrare le classi più affollate di quanto dica la media."
      }
     ],
     "keyPoints": [
      "L'esponenziale descrive attese per eventi che arrivano a ritmo costante; la media è 1/λ.",
      "Le attese brevi sono le più frequenti, ma ogni tanto ne capita una molto lunga.",
      "Assenza di memoria: avere già aspettato non riduce l'attesa residua.",
      "Nei processi di Poisson il numero di eventi è Poisson e i tempi tra eventi sono esponenziali.",
      "Oggetti che si usurano o persone che invecchiano non seguono l'esponenziale.",
      "Paradosso dell'ispezione: arrivando a caso si tende a cadere negli intervalli lunghi."
     ],
     "terms": [
      {
       "t": "Esponenziale (exponential)",
       "d": "Distribuzione del tempo di attesa di un evento che arriva a ritmo costante λ; media 1/λ."
      },
      {
       "t": "Assenza di memoria (memoryless property)",
       "d": "Proprietà per cui il tempo residuo di attesa non dipende da quanto si è già aspettato."
      },
      {
       "t": "Processo di Poisson (Poisson process)",
       "d": "Modello di eventi indipendenti a ritmo costante: conteggi Poisson e intervalli esponenziali."
      },
      {
       "t": "Usura (aging)",
       "d": "Situazione in cui la probabilità di guasto cresce con l'età, incompatibile con l'esponenziale."
      },
      {
       "t": "Paradosso dell'ispezione (inspection paradox)",
       "d": "Osservando in un momento a caso si cade più spesso negli intervalli lunghi, che sembrano così più frequenti."
      }
     ],
     "quiz": [
      {
       "q": "In un pronto soccorso notturno arriva in media un paziente ogni 30 minuti, secondo un processo di Poisson. Nessuno è arrivato negli ultimi 30 minuti. Quanto bisogna aspettare in media il prossimo paziente?",
       "options": [
        "Circa 0 minuti, è in ritardo",
        "30 minuti",
        "15 minuti",
        "60 minuti"
       ],
       "answer": 1,
       "why": "Per l'assenza di memoria l'attesa residua ha la stessa distribuzione di quella iniziale: media 30 minuti. Pensare che il paziente sia «dovuto» è la stessa trappola della fallacia del giocatore."
      },
      {
       "q": "Le chiamate a un centralino arrivano in media ogni 5 minuti (esponenziale). Qual è la stima più vicina alla probabilità di aspettare più di 10 minuti?",
       "options": [
        "50%",
        "37%",
        "0%",
        "13,5%"
       ],
       "answer": 3,
       "why": "Con media 5 minuti, λ = 1/5 al minuto: la probabilità è e elevato a −10/5 = e elevato a −2, circa 13,5%. Il 37% è la probabilità di superare 5 minuti, cioè la media."
      },
      {
       "q": "Per quale di questi tempi l'esponenziale è il modello meno adatto?",
       "options": [
        "Tempo fino al guasto di un'auto che ha già 300.000 km",
        "Tempo fino alla prossima email in arrivo",
        "Tempo tra due clienti in un negozio tranquillo",
        "Tempo fino al prossimo decadimento di un atomo radioattivo"
       ],
       "answer": 0,
       "why": "Un'auto molto usata si usura: la probabilità di guasto cresce con i chilometri, quindi manca l'assenza di memoria. Gli altri casi sono eventi a ritmo circa costante, indipendenti dal passato."
      },
      {
       "q": "Gli autobus passano secondo un processo di Poisson, con intervallo medio di 12 minuti. Arrivi alla fermata in un istante a caso. Quanto aspetti in media?",
       "options": [
        "12 minuti",
        "6 minuti",
        "24 minuti",
        "3 minuti"
       ],
       "answer": 0,
       "why": "Per l'assenza di memoria l'attesa dal tuo arrivo è esponenziale con media 12. La risposta 6 sarebbe giusta con autobus perfettamente regolari ogni 12 minuti; con arrivi casuali si cade più spesso negli intervalli lunghi."
      },
      {
       "q": "Due impiegati servono due clienti; i tempi di servizio sono esponenziali con la stessa media. Entri e aspetti il primo sportello libero. Con che probabilità sarai l'ultimo dei tre a uscire?",
       "options": [
        "1/3",
        "2/3",
        "1/2",
        "Dipende da quanto è lunga la media"
       ],
       "answer": 2,
       "why": "Quando uno sportello si libera, tu inizi e l'altro cliente, per l'assenza di memoria, riparte come se cominciasse ora: siete alla pari, quindi 1/2. L'1/3 nasce dal pensare i tre clienti come simmetrici, ma tu parti in svantaggio."
      }
     ],
     "explain": "Spiega a un amico perché, se gli autobus passano in modo casuale ogni 10 minuti in media, aspettare già da 10 minuti non vuol dire che l'autobus «sta per arrivare».",
     "apply": "Per una settimana annota gli orari di arrivo di un tipo di evento (email da clienti, telefonate, ordini online). Calcola gli intervalli tra un evento e l'altro: se le attese brevi sono le più frequenti e ogni tanto ce n'è una lunghissima, l'esponenziale è un buon modello."
    }
   ]
  }
 ]
};
