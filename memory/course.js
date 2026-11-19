/*
 * Progetto A - Memoria: il percorso guidato di 6 settimane (42 giorni, circa mezz'ora al giorno).
 * Segue l'idea dello studio di Dresler e colleghi (Neuron, 2017): allenamento quotidiano con il
 * metodo dei loci per 40 giorni, test all'inizio e alla fine, controllo dopo quattro mesi.
 * Qui le tecniche entrano in ordine (immagini, palazzi, numeri, carte, immagini astratte, date)
 * e la quinta settimana le porta su studio, lingue, scacchi e pianoforte.
 *
 * Compiti (k):
 *   test {test}            uno dei test di span (digitF, digitB, corsiF, corsiB)
 *   words                  lista di 15 parole (le 5 prove; il richiamo differito si fa dopo)
 *   major                  sistema fonetico: ripassi e immagini nuove del giorno
 *   build {count, min}     avere almeno count palazzi con almeno min luoghi
 *   palace {n, per}        parole nel palazzo: almeno n parole, per = parole per luogo
 *   dis {key, n, mem}      una disciplina con n elementi e mem secondi
 *   cardsys                sistema delle carte: un giro di allenamento
 *   pao {n}                persone e azioni: almeno n coppie scritte e un giro di ripasso
 *   deck {kind, min}       un mazzo tuo di quel tipo con almeno min schede
 *   review                 i ripassi del giorno finiti (mazzi e sistemi)
 *   text {text}            un giro su un testo a memoria (text = testo consigliato)
 *   chess {drill}          esercizio di memoria per gli scacchi (colors, knight, flash)
 *   life {drill}           vita quotidiana (phone = numero di telefono, shop = lista della spesa)
 *   real {text}            un compito fuori dall'app: lo segni tu
 * opt: true = facoltativo (non serve per chiudere la giornata).
 */
(function (root) {
  "use strict";

  const WEEKS = [
    { n: 1, title: "Fondamenta", line: "Misura di partenza, immagini, il primo palazzo, le prime immagini dei numeri." },
    { n: 2, title: "Palazzi", line: "Tre palazzi da 20 luoghi, due parole per luogo, nomi e volti, la spesa a memoria." },
    { n: 3, title: "Numeri", line: "Le 100 immagini del sistema fonetico al lavoro: numeri lunghi, telefono, date. Test di metà percorso." },
    { n: 4, title: "Carte e immagini", line: "Il sistema delle carte costruito sul fonetico, mezzo mazzo, immagini astratte." },
    { n: 5, title: "Usala davvero", line: "Studio, testi a memoria, lingue, scacchi, pianoforte; persona-azione-oggetto per i numeri." },
    { n: 6, title: "Velocità e prova finale", line: "Il formato da un minuto, il palazzo lungo come nello studio di Dresler, i test finali." }
  ];

  const D = (d, title, lesson, tasks, tip = "") => ({ d, w: Math.ceil(d / 7), title, lesson, tasks: tasks.map((t, i) => ({ id: `t${i + 1}`, ...t })), tip });

  const DAYS = [
    // Settimana 1 - Fondamenta
    D(1, "Il punto di partenza", "perfetta", [
      { k: "test", test: "digitF" }, { k: "test", test: "digitB" }, { k: "test", test: "corsiF" }, { k: "test", test: "corsiB" }, { k: "words" }
    ], "Oggi solo misure: rispondi come vieni, senza tecniche. Il richiamo differito delle 15 parole arriva dopo 20 minuti."),
    D(2, "Tre fasi e una storia", "fasi", [
      { k: "major" }, { k: "dis", key: "words", n: 10, mem: 90 },
      { k: "real", text: "Stasera, prima di dormire, ripeti a memoria le 10 parole di oggi, in ordine." }
    ], "Per le 10 parole usa una storia: ogni parola fa qualcosa di assurdo alla successiva."),
    D(3, "Immagini e il primo palazzo", "immagini", [
      { k: "major" }, { k: "build", count: 1, min: 10 }, { k: "palace", n: 10, per: 1 }
    ], "Il palazzo: casa tua va benissimo. Dieci luoghi, sempre nello stesso giro."),
    D(4, "Il palazzo si allunga", "palazzo", [
      { k: "major" }, { k: "build", count: 1, min: 20 }, { k: "palace", n: 15, per: 1 }
    ], "Allunga il palazzo di ieri fino a 20 luoghi, oppure creane uno nuovo da 20."),
    D(5, "Venti parole", null, [
      { k: "major" }, { k: "palace", n: 20, per: 1 }, { k: "dis", key: "faces", n: 6, mem: 60 }
    ], "Venti parole in venti luoghi. Per i volti: un tratto del viso più un'immagine del nome."),
    D(6, "Il ripasso che non dimentica", "ripasso", [
      { k: "major" }, { k: "deck", kind: "qa", min: 5 }, { k: "review" }
    ], "Crea il mazzo Studio con almeno 5 domande su qualcosa che vuoi sapere davvero: il ripasso parte da domani."),
    D(7, "Dormire per ricordare", "sonno", [
      { k: "major" }, { k: "review" }, { k: "dis", key: "words", n: 15, mem: 120 },
      { k: "real", text: "Ripercorri a occhi chiusi il tuo palazzo, avanti e indietro, senza immagini." }
    ]),

    // Settimana 2 - Palazzi
    D(8, "Tre palazzi a rotazione", "riuso", [
      { k: "build", count: 2, min: 20 }, { k: "palace", n: 20, per: 1 }, { k: "major" }, { k: "review" }
    ], "Usa il palazzo nuovo: quello vecchio riposa fino a domani."),
    D(9, "Il terzo palazzo", null, [
      { k: "build", count: 3, min: 20 }, { k: "dis", key: "words", n: 20, mem: 150 }, { k: "major" }, { k: "review" }
    ], "Nella lista di parole usa un palazzo che non hai usato ieri."),
    D(10, "Nomi e volti", "nomi", [
      { k: "dis", key: "faces", n: 10, mem: 90 }, { k: "deck", kind: "people", min: 3 }, { k: "major" }, { k: "review" }
    ], "Nel mazzo Persone metti tre persone vere che hai conosciuto (anche da tempo) di cui ricordi male il nome."),
    D(11, "Due parole per luogo", null, [
      { k: "palace", n: 30, per: 2 }, { k: "major" }, { k: "review" }
    ], "Trenta parole in quindici luoghi: la prima a sinistra, la seconda a destra."),
    D(12, "Parole e volti", null, [
      { k: "dis", key: "words", n: 25, mem: 150 }, { k: "dis", key: "faces", n: 12, mem: 120 }, { k: "major" }, { k: "review" }
    ]),
    D(13, "La spesa a memoria", "quotidiano", [
      { k: "life", drill: "shop" }, { k: "major" }, { k: "review" },
      { k: "real", text: "Oggi fai la spesa, o le cose da fare, a memoria: niente foglio." }
    ]),
    D(14, "Quaranta parole", null, [
      { k: "palace", n: 40, per: 2 }, { k: "major" }, { k: "review" }
    ], "Venti luoghi, due parole per luogo. Se è troppo, fermati a 30: la prossima settimana ci riprovi."),

    // Settimana 3 - Numeri
    D(15, "Numeri a coppie", "fonetico", [
      { k: "major" }, { k: "dis", key: "numbers", n: 20, mem: 120 }, { k: "review" }
    ], "Ogni coppia di cifre è un'immagine; una coppia per luogo del palazzo."),
    D(16, "Il numero di telefono", null, [
      { k: "major" }, { k: "dis", key: "numbers", n: 30, mem: 150 }, { k: "life", drill: "phone" }, { k: "review" }
    ]),
    D(17, "Quattro cifre per luogo", null, [
      { k: "major" }, { k: "dis", key: "numbers", n: 40, mem: 180 }, { k: "review" }
    ], "Due immagini per luogo: 40 cifre in 10 luoghi."),
    D(18, "Le date", "date", [
      { k: "dis", key: "dates", n: 8, mem: 120 }, { k: "major" }, { k: "review" }
    ]),
    D(19, "Date e numeri", null, [
      { k: "dis", key: "dates", n: 12, mem: 180 }, { k: "dis", key: "numbers", n: 40, mem: 150 }, { k: "review" }
    ]),
    D(20, "Cinquanta cifre", null, [
      { k: "dis", key: "numbers", n: 50, mem: 210 }, { k: "dis", key: "faces", n: 15, mem: 120 }, { k: "review" }
    ]),
    D(21, "Metà percorso", "meta", [
      { k: "test", test: "digitF" }, { k: "test", test: "digitB" }, { k: "test", test: "corsiF" }, { k: "test", test: "corsiB" },
      { k: "palace", n: 40, per: 2 }, { k: "review" }
    ], "Nei test di span usa pure le tecniche che conosci: guarda quanto sono cambiati i numeri."),

    // Settimana 4 - Carte e immagini
    D(22, "Le carte diventano numeri", "carte", [
      { k: "cardsys" }, { k: "dis", key: "cards", n: 10, mem: 120 }, { k: "review" }
    ]),
    D(23, "Sedici carte", null, [
      { k: "cardsys" }, { k: "dis", key: "cards", n: 16, mem: 150 }, { k: "review" }
    ]),
    D(24, "Venti carte, due per luogo", null, [
      { k: "cardsys" }, { k: "dis", key: "cards", n: 20, mem: 180 }, { k: "review" }
    ]),
    D(25, "Immagini astratte", "astratte", [
      { k: "dis", key: "images", n: 10, mem: 90 }, { k: "dis", key: "images", n: 15, mem: 90 }, { k: "review" }
    ]),
    D(26, "Mezzo mazzo", null, [
      { k: "dis", key: "cards", n: 26, mem: 240 }, { k: "dis", key: "images", n: 20, mem: 90 }, { k: "review" }
    ], "Ventisei carte: tredici luoghi con due carte ciascuno."),
    D(27, "Volti e date", null, [
      { k: "dis", key: "faces", n: 20, mem: 150 }, { k: "dis", key: "dates", n: 15, mem: 180 }, { k: "review" }
    ]),
    D(28, "Sessanta cifre", null, [
      { k: "dis", key: "numbers", n: 60, mem: 240 }, { k: "dis", key: "cards", n: 26, mem: 180 }, { k: "review" }
    ]),

    // Settimana 5 - Usala davvero
    D(29, "Studiare", "studio", [
      { k: "deck", kind: "qa", min: 10 }, { k: "text", text: "costituzione" }, { k: "review" }
    ], "Prendi un capitolo che devi studiare: 10 domande con risposte brevi. Puoi incollarle tutte insieme."),
    D(30, "Un testo a memoria", "testi", [
      { k: "text", text: "infinito" }, { k: "review" }, { k: "dis", key: "words", n: 30, mem: 150 }
    ], "L'infinito di Leopardi: prima il senso, poi le iniziali, poi la cancellazione progressiva."),
    D(31, "Lingue", "lingue", [
      { k: "deck", kind: "vocab", min: 10 }, { k: "text", text: "infinito" }, { k: "review" }
    ], "Dieci parole della lingua che vuoi imparare; per le più difficili scrivi una parola chiave."),
    D(32, "Scacchi", "scacchi", [
      { k: "chess", drill: "colors" }, { k: "chess", drill: "flash" }, { k: "review" }, { k: "text", text: "opera", opt: true }
    ]),
    D(33, "Pianoforte", "piano", [
      { k: "deck", kind: "piece", min: 2, opt: true }, { k: "chess", drill: "knight" }, { k: "dis", key: "numbers", n: 50, mem: 180 }, { k: "review" }
    ], "Se suoni: un brano diviso in sezioni nel mazzo Brani. Se non suoni, il compito è facoltativo."),
    D(34, "Persona, azione, oggetto", "pao", [
      { k: "pao", n: 10 }, { k: "dis", key: "numbers", n: 60, mem: 240 }, { k: "review" }
    ], "Scrivi persona e azione per le coppie da 00 a 09: l'oggetto è già la tua immagine fonetica."),
    D(35, "Venti persone", null, [
      { k: "pao", n: 20 }, { k: "chess", drill: "flash" }, { k: "deck", kind: "people", min: 6 }, { k: "review" }
    ]),

    // Settimana 6 - Velocita' e prova finale
    D(36, "Un minuto", "velocita", [
      { k: "dis", key: "words", n: 30, mem: 90 }, { k: "dis", key: "numbers", n: 40, mem: 90 }, { k: "review" }, { k: "pao", n: 30, opt: true }
    ]),
    D(37, "Carte e volti veloci", null, [
      { k: "dis", key: "cards", n: 26, mem: 120 }, { k: "dis", key: "faces", n: 20, mem: 90 }, { k: "build", count: 1, min: 30 }, { k: "review" }
    ], "Allunga uno dei tuoi palazzi a 30 luoghi: serve per la prova lunga del giorno 40."),
    D(38, "Immagini e date veloci", null, [
      { k: "dis", key: "images", n: 25, mem: 60 }, { k: "dis", key: "dates", n: 15, mem: 120 }, { k: "review" }
    ]),
    D(39, "Cinquanta parole", null, [
      { k: "palace", n: 50, per: 2 }, { k: "dis", key: "numbers", n: 60, mem: 120 }, { k: "review" }
    ]),
    D(40, "La prova lunga", null, [
      { k: "palace", n: 60, per: 2 }, { k: "review" }
    ], "Come nello studio di Dresler: più parole che puoi, qui fino a 60 in 30 luoghi. Il primo giorno quante ne avresti ricordate?"),
    D(41, "I test finali", null, [
      { k: "test", test: "digitF" }, { k: "test", test: "digitB" }, { k: "test", test: "corsiF" }, { k: "test", test: "corsiB" }, { k: "review" }
    ]),
    D(42, "Il traguardo", "mantenimento", [
      { k: "words" }, { k: "review" },
      { k: "real", text: "Scegli i tuoi tre giorni fissi della settimana per le discipline e scrivili nel calendario." }
    ], "Ultima misura: la lista di 15 parole, come il primo giorno. Poi guarda il confronto.")
  ];

  const COURSE = { WEEKS, DAYS, LENGTH: DAYS.length, FOLLOW_UP_DAYS: 120 };
  if (typeof module === "object" && module.exports) module.exports = COURSE;
  root.MemoryCourse = COURSE;
})(typeof window !== "undefined" ? window : globalThis);
