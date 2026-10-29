/*
 * Progetto A - Difesa: esercizi correttivi (dati e costruzione, senza DOM).
 *
 * Quando un esercizio non riesce l'utente dice perche' (vedi MartialEngine.REASONS). Gli
 * allenamenti successivi aggiungono un correttivo per i motivi piu' pesanti:
 *  - tecnica: ripasso lento proprio dell'esercizio fallito (passi, punti chiave ed errori suoi);
 *  - forza, flessibilita', coordinazione, equilibrio, fiato: un esercizio scelto per la parte del
 *    corpo che quell'esercizio usa (calci, pugni, lotta e prese, corpo intero) e con il carico del
 *    livello (base ai livelli 1-2, intermedio 3-4, avanzato 5-6).
 * Gli esercizi hanno lo stesso formato di quelli delle discipline (nome, come si fa, passi, punti
 * chiave, errori tipici, quando e' riuscito, dose per il timer).
 * Principi seguiti: carico progressivo, tempo di discesa controllato per la forza, flessibilita'
 * attiva e "contrai e rilassa" (PNF) a muscoli caldi, coordinazione prima precisa e poi veloce,
 * intervalli lavoro/recupero per il fiato.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MartialFix = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const REGION_LABEL = { gambe: "calci e gambe", braccia: "pugni e braccia", presa: "lotta e prese", corpo: "corpo intero" };
  const REASON_LABEL = { forza: "forza", tecnica: "tecnica", flessibilita: "flessibilità", coordinazione: "coordinazione", equilibrio: "equilibrio", resistenza: "fiato" };
  const WITH_ARTICLE = { forza: "la forza", tecnica: "la tecnica", flessibilita: "la flessibilità", coordinazione: "la coordinazione", equilibrio: "l'equilibrio", resistenza: "il fiato" };
  const CAUSE = { forza: "mancava forza", tecnica: "la tecnica non era pulita", flessibilita: "mancava flessibilità", coordinazione: "mancava coordinazione", equilibrio: "perdevi l'equilibrio", resistenza: "mancava il fiato" };
  const DISC_REGION = { boxe: "braccia", muaythai: "gambe", taekwondo: "gambe", karate: "corpo", capoeira: "gambe", lotta: "presa", kungfu: "corpo", systema: "corpo", sambo: "presa" };
  // dove mettere il correttivo: subito dopo il riscaldamento (gesti che vogliono freschezza) o alla fine
  const EARLY = ["tecnica", "coordinazione", "equilibrio"];

  const KICK = /\b(calci|calcio|kick|ginocchiat|mae.?geri|mawashi|yoko|ushiro|bandal|chagi|dollyo|meia.?lua|armada|queixada|martelo|spazzat|teep|low kick|tornado)/;
  const PUNCH = /\b(pugn|jab|diretto|gancio|montante|cross|uppercut|gomitat|oi.?zuki|gyaku|zuki|colpi di braccia)/;
  const GRAPPLE = /\b(proiezion|presa|prese|lotta|sprawl|takedown|atterrament|leva|ponte|caduta|ukemi|clinch|sbilanc|gambero|shrimp|immobilizz|strangol|anca|uchi.?mata|koshi|seoi)/;

  // Parte del corpo che un esercizio usa (dalle parole del testo, se no dalla disciplina).
  function regionOf(ex, disc) {
    if (ex) {
      const text = `${ex.name || ""} ${ex.how || ""} ${(ex.steps || []).join(" ")}`.toLowerCase();
      const k = (text.match(new RegExp(KICK.source, "g")) || []).length;
      const p = (text.match(new RegExp(PUNCH.source, "g")) || []).length;
      const g = (text.match(new RegExp(GRAPPLE.source, "g")) || []).length;
      const best = Math.max(k, p, g);
      if (best > 0) return best === g ? "presa" : best === k ? "gambe" : "braccia";
    }
    return DISC_REGION[disc] || "corpo";
  }

  function tierOf(level) { return level >= 5 ? 2 : level >= 3 ? 1 : 0; }

  /*
   * Libreria: per ogni motivo, una voce per parte del corpo (o "tutte"). Ogni voce ha tre gradi
   * (names, hows, doses) e i campi comuni. Le parti senza voce propria usano quella indicata da "as".
   */
  const LIB = {
    forza: {
      gambe: {
        names: ["Affondo indietro lento", "Squat bulgaro lento", "Squat bulgaro con salto"],
        goal: "Più forza nella gamba d'appoggio e nei glutei: è da lì che il calcio prende potenza e la guardia resta stabile.",
        hows: [
          "Dalla posizione in piedi fai un passo lungo indietro e scendi finché il ginocchio dietro sfiora il pavimento; risali spingendo con il tallone della gamba davanti. 3 secondi per scendere, 1 per salire.",
          "Piede dietro appoggiato su una sedia o sul divano, piede davanti a un passo e mezzo. Scendi in 3 secondi finché la coscia davanti è parallela al pavimento, fermati 1 secondo, risali in 1.",
          "Come lo squat bulgaro, ma dalla posizione bassa spingi forte e stacca il piede davanti da terra di qualche centimetro; atterra morbido e riscendi subito, controllando."
        ],
        steps: [
          "Busto alto, sguardo avanti, mani in guardia o sui fianchi.",
          "Il ginocchio davanti segue la punta del piede e non cade verso l'interno.",
          "Scendi lento contando i secondi.",
          "Spingi con tutta la pianta, soprattutto con il tallone, e risali.",
          "Finisci le ripetizioni da un lato, poi cambia gamba."
        ],
        cues: ["Ginocchio in linea con la punta", "Giù lento, su deciso", "Peso sul tallone davanti"],
        errors: [
          { e: "Il ginocchio davanti crolla verso l'interno.", fix: "Spingi il ginocchio appena in fuori, come per allargare il pavimento con il piede." },
          { e: "Il busto si piega in avanti.", fix: "Petto alto e addominali stretti: immagina un filo che ti tira su dalla testa." }
        ],
        success: "completi tutte le serie con la discesa lenta contata, senza che il ginocchio crolli in dentro e senza appoggiarti.",
        easier: "Appoggia una mano al muro per l'equilibrio e scendi solo a metà.",
        harder: "Tieni uno zaino con dei libri o due bottiglie d'acqua.",
        safety: "Fatica sì, dolore al ginocchio no: se fa male, scendi meno e fermati se continua.",
        video: "squat bulgaro tecnica corretta",
        kind: "condizionamento",
        doses: [{ sets: 3, reps: 8, rest: 60, perSide: true }, { sets: 3, reps: 8, rest: 75, perSide: true }, { sets: 4, reps: 6, rest: 90, perSide: true }]
      },
      braccia: {
        names: ["Piegamenti inclinati", "Piegamenti con pausa", "Piegamenti esplosivi"],
        goal: "Più forza di spinta in petto, spalle e tricipiti: colpi che arrivano fino in fondo senza perdere la guardia.",
        hows: [
          "Mani sul bordo di un tavolo o di un letto robusto, larghe poco più delle spalle, corpo dritto da testa a talloni. Scendi in 2 secondi finché il petto sfiora il bordo, poi spingi via.",
          "Piegamenti a terra: scendi in 3 secondi, fermati 2 secondi a un pugno dal pavimento, risali in 1. Gomiti a 45 gradi dal corpo, non aperti a T.",
          "Piegamenti esplosivi: scendi controllato e spingi così forte che le mani si staccano da terra; atterra con i gomiti morbidi e riparti. Quando sono puliti, aggiungi il battito di mani."
        ],
        steps: [
          "Mani sotto le spalle, dita aperte, corpo in una linea sola.",
          "Addominali e glutei stretti: il bacino non cede e non sale.",
          "Gomiti a circa 45 gradi dal busto.",
          "Scendi contando, risali spingendo il pavimento lontano da te.",
          "Espira quando spingi, come quando colpisci."
        ],
        cues: ["Corpo come una tavola", "Gomiti a 45 gradi", "Espira in spinta"],
        errors: [
          { e: "Il bacino cede verso il pavimento.", fix: "Stringi i glutei e fai meno ripetizioni: meglio cinque pulite che dieci storte." },
          { e: "Gomiti aperti a T.", fix: "Avvicina i gomiti al busto: le spalle lavorano in sicurezza." }
        ],
        success: "completi tutte le serie con il corpo dritto e il tempo di discesa rispettato in ogni ripetizione.",
        easier: "Alza l'appoggio delle mani: più è alto, più il piegamento è facile.",
        harder: "Piedi rialzati su una sedia.",
        video: "piegamenti tecnica corretta push up",
        kind: "condizionamento",
        doses: [{ sets: 3, reps: 10, rest: 60 }, { sets: 4, reps: 6, rest: 75 }, { sets: 5, reps: 5, rest: 90 }]
      },
      presa: {
        names: ["Rematore sotto il tavolo, ginocchia piegate", "Rematore sotto il tavolo, gambe tese", "Rematore con presa all'asciugamano"],
        goal: "Più forza di tirata e di presa: è quella che serve per controllare braccia e collo dell'avversario e per proiettare.",
        hows: [
          "Sdraiati sotto un tavolo robusto e afferra il bordo con le mani larghe quanto le spalle, ginocchia piegate e piedi a terra. Tira il petto verso il bordo stringendo le scapole, poi scendi in 2 secondi.",
          "Stessa posizione a gambe tese, corpo dritto come una tavola: tira finché il petto tocca il bordo, fermati 1 secondo con le scapole strette, scendi in 3 secondi.",
          "Avvolgi un asciugamano attorno al bordo del tavolo (o a una sbarra) e tira stringendo le due estremità: 2 secondi di pausa in alto. È la presa che usi sul bavero di una giacca."
        ],
        steps: [
          "Prima di cominciare controlla che il tavolo regga: spingilo con forza, non deve muoversi.",
          "Mani sul bordo, braccia tese, corpo dritto dalle spalle alle ginocchia (o ai talloni).",
          "Stringi le scapole, poi piega i gomiti e tira il petto al bordo.",
          "Tieni la pausa in alto senza alzare le spalle verso le orecchie.",
          "Scendi lento fino a braccia tese."
        ],
        cues: ["Petto al bordo", "Prima le scapole, poi le braccia", "Scendi lento"],
        errors: [
          { e: "Tiri solo con le braccia, spalle alle orecchie.", fix: "Comincia ogni ripetizione stringendo le scapole, poi piega i gomiti." },
          { e: "Il bacino cade.", fix: "Glutei stretti: il corpo resta una linea per tutta la ripetizione." }
        ],
        success: "tutte le ripetizioni arrivano con il petto al bordo, senza strattoni e con la discesa lenta.",
        easier: "Piedi più vicini al tavolo: il corpo è più verticale e tiri meno peso.",
        harder: "Piedi rialzati su una sedia.",
        safety: "Se il tavolo si muove o scricchiola non usarlo: va bene una sbarra o un elastico fissato a una porta chiusa.",
        video: "inverted row sotto il tavolo",
        kind: "condizionamento",
        doses: [{ sets: 3, reps: 8, rest: 60 }, { sets: 4, reps: 8, rest: 75 }, { sets: 4, reps: 6, rest: 90 }]
      },
      corpo: {
        names: ["Plank sugli avambracci", "Tenuta a barchetta", "Barchetta dondolata e plank con tocchi"],
        goal: "Più forza nel tronco: tiene uniti gambe e braccia, così colpi e difese partono da un corpo solo.",
        hows: [
          "Avambracci a terra sotto le spalle, corpo dritto da testa a talloni. Stringi addominali e glutei come se dovessi ricevere un pugno allo stomaco, e respira corto senza perdere la posizione.",
          "Sdraiato sulla schiena, braccia tese sopra la testa e gambe tese: stacca spalle e piedi da terra tenendo la zona lombare incollata al pavimento. È la barchetta (hollow hold).",
          "Alterna: metà serie di barchetta dondolata, avanti e indietro senza perdere la forma, e metà di plank sulle mani toccando una spalla alla volta senza ruotare il bacino."
        ],
        steps: [
          "Mettiti in posizione e controlla la schiena: né inarcata né curva.",
          "Stringi addominali e glutei.",
          "Respira con respiri brevi, senza mollare la tensione.",
          "Se la forma cede, fermati qualche secondo e riparti.",
          "Alla fine della serie, appoggia e scuoti le braccia."
        ],
        cues: ["Lombare incollata a terra", "Respira senza mollare", "Bacino fermo"],
        errors: [
          { e: "La schiena si inarca e la zona lombare si stacca da terra.", fix: "Piega un po' le ginocchia o porta le braccia meno indietro: la forma viene prima della durata." },
          { e: "Trattieni il respiro.", fix: "Respiri brevi dal naso, addome sempre stretto." }
        ],
        success: "tieni tutte le serie per il tempo previsto senza che la schiena si inarchi.",
        easier: "Plank sulle ginocchia, o barchetta con le ginocchia piegate.",
        harder: "Allunga la durata di 10 secondi per serie.",
        video: "hollow body hold tecnica",
        kind: "condizionamento",
        doses: [{ sets: 3, work: 30, rest: 30 }, { sets: 4, work: 25, rest: 35 }, { sets: 4, work: 40, rest: 40 }]
      }
    },
    flessibilita: {
      gambe: {
        names: ["Femorali: contrai e rilassa", "Contrai e rilassa e slanci controllati", "Calcio lento tenuto in alto"],
        goal: "Più ampiezza per calci alti e puliti. Conta la flessibilità attiva, quella che riesci a usare in movimento, non solo da seduto.",
        hows: [
          "Sdraiato sulla schiena porta una gamba tesa verso l'alto con un asciugamano attorno al piede, finché senti tirare dietro la coscia. 20 secondi di allungamento, poi 5 secondi spingi il piede contro l'asciugamano, rilassa e guadagna qualche centimetro. Tre cicli per gamba.",
          "Fai i tre cicli di contrai e rilassa, poi in piedi 10 slanci controllati per gamba, in avanti e di lato, salendo poco alla volta: la gamba sale per il tuo controllo, non per lo slancio del busto.",
          "In piedi accanto al muro: porta il ginocchio in caricamento, distendi lentamente il calcio frontale o laterale all'altezza massima pulita e tienilo 3 secondi. Torna in caricamento senza toccare terra."
        ],
        steps: [
          "Fallo a muscoli caldi, meglio a fine allenamento.",
          "Porta il muscolo fino a una tensione forte ma sopportabile.",
          "Contrai spingendo contro la resistenza per 5 secondi, senza muoverti.",
          "Rilassa, espira e lascia che l'allungamento cresca da solo.",
          "Ripeti dall'altro lato."
        ],
        cues: ["Tira, non strappare", "Contrai 5 secondi, rilassa, guadagna", "La gamba sale da sola"],
        errors: [
          { e: "Molleggi per arrivare più in là.", fix: "Niente rimbalzi: tieni la posizione e lascia che il muscolo ceda da solo." },
          { e: "Pieghi la schiena per alzare la gamba.", fix: "Schiena dritta: l'altezza vera è quella con il busto fermo." }
        ],
        success: "fai tutti i cicli senza dolore e alla fine arrivi almeno alla stessa altezza dell'inizio.",
        easier: "Piega appena il ginocchio della gamba che allunghi.",
        harder: "Aggiungi un quarto ciclo e tieni il calcio 5 secondi.",
        safety: "Il dolore pungente, o un dolore dietro il ginocchio, è il segnale per fermarsi.",
        video: "stretching PNF femorali contrai rilassa",
        kind: "flessibilita",
        doses: [{ sets: 3, work: 30, rest: 15, perSide: true }, { sets: 3, work: 45, rest: 20, perSide: true }, { sets: 3, reps: 5, rest: 30, perSide: true }]
      },
      braccia: {
        names: ["Spalle con il bastone", "Apertura del libro e bastone", "Y-T-W a pancia in giù"],
        goal: "Spalle e schiena alta più mobili: guardia alta più a lungo, colpi più lunghi e meno tensione sul collo.",
        hows: [
          "Con un bastone o un asciugamano teso tra le mani molto larghe, porta le braccia tese da davanti alle cosce fino dietro la schiena e ritorno, lentamente. Avvicina le mani solo se la spalla lo permette senza dolore.",
          "Prima 10 passaggi con il bastone, poi sdraiato su un fianco con le ginocchia piegate: apri il braccio di sopra come la copertina di un libro, segui la mano con lo sguardo e resta 3 secondi aperto.",
          "A pancia in giù, fronte su un asciugamano: alza le braccia tese formando una Y, poi una T, poi una W, 3 secondi per lettera, stringendo le scapole e con i pollici verso l'alto."
        ],
        steps: [
          "Spalle basse, lontane dalle orecchie.",
          "Movimento lento, senza scatti.",
          "Respira con calma per tutto l'esercizio.",
          "Fermati prima del dolore: la tensione va bene, la fitta no.",
          "Alla fine scuoti le braccia e fai qualche cerchio con le spalle."
        ],
        cues: ["Lento e senza dolore", "Lo sguardo segue la mano", "Scapole strette"],
        errors: [
          { e: "Inarchi la schiena per far passare il bastone.", fix: "Allarga la presa: la mobilità deve venire dalle spalle." },
          { e: "Alzi le spalle verso le orecchie.", fix: "Spalle basse per tutto l'esercizio." }
        ],
        success: "fai tutte le ripetizioni lente senza dolore e senza compensare con la schiena.",
        easier: "Presa ancora più larga e movimento più piccolo.",
        harder: "Avvicina le mani di un pugno a ogni serie.",
        video: "mobilità spalle con bastone",
        kind: "flessibilita",
        doses: [{ sets: 2, reps: 10, rest: 30 }, { sets: 2, reps: 10, rest: 30, perSide: true }, { sets: 3, reps: 6, rest: 30 }]
      },
      presa: {
        names: ["Anca 90/90", "Anca 90/90 con passaggi senza mani", "Squat profondo tenuto e 90/90"],
        goal: "Anche più mobili: entrare sotto il baricentro dell'avversario, cambiare posizione a terra e muoversi in basso.",
        hows: [
          "Seduto a terra: gamba davanti piegata a 90 gradi davanti a te, gamba dietro piegata a 90 gradi di lato. Busto dritto: inclinati in avanti sulla gamba davanti per 30 secondi, poi cambia lato ruotando le ginocchia.",
          "Dalla posizione 90/90 passa da un lato all'altro senza usare le mani, ruotando le ginocchia, 10 passaggi lenti. Poi 20 secondi inclinato in avanti per lato.",
          "Scendi in squat profondo con i talloni a terra e resta 45 secondi spingendo le ginocchia in fuori con i gomiti; poi 10 passaggi 90/90 senza mani."
        ],
        steps: [
          "Siediti con le gambe a 90 gradi, una davanti e una di lato.",
          "Busto alto: il movimento parte dalle anche, non dalla schiena.",
          "Inclinati in avanti con il petto, non con la testa.",
          "Respira lento e lascia scendere il busto un po' a ogni espirazione.",
          "Cambia lato ruotando le ginocchia."
        ],
        cues: ["Busto alto", "Ruota dalle anche", "Talloni giù nello squat"],
        errors: [
          { e: "Curvi la schiena per andare avanti.", fix: "Petto avanti, schiena dritta: anche pochi centimetri vanno bene." },
          { e: "Nello squat i talloni si alzano.", fix: "Allarga i piedi o metti uno spessore sotto i talloni finché le caviglie migliorano." }
        ],
        success: "tieni tutte le posizioni per il tempo previsto con il busto dritto, senza dolore ad anca o ginocchio.",
        easier: "Siediti su un cuscino per alzare il bacino.",
        harder: "Allunga ogni tenuta di 15 secondi.",
        video: "mobilità anca 90 90",
        kind: "flessibilita",
        doses: [{ sets: 2, work: 30, rest: 15, perSide: true }, { sets: 3, work: 40, rest: 15 }, { sets: 3, work: 45, rest: 20 }]
      },
      corpo: { as: "presa" }
    },
    coordinazione: {
      gambe: {
        names: ["Scaletta a terra: passi base", "Scaletta a terra: schemi veloci", "Scaletta e calcio in uscita"],
        goal: "Piedi veloci e precisi: arrivare alla distanza giusta nel momento giusto, senza guardarti i piedi.",
        hows: [
          "Fai una scaletta a terra con il nastro adesivo: 8 quadrati larghi un piede e mezzo. Entra con due piedi in ogni quadrato, poi esci di lato e riparti. Prima lento e preciso, poi più veloce.",
          "Sulla stessa scaletta alterna due schemi: dentro, dentro, fuori (icky shuffle) e passi laterali incrociati. Dopo i primi due quadrati alza lo sguardo.",
          "Esci dalla scaletta con lo schema veloce e appena fuori esegui un calcio della tua disciplina, poi torna in guardia. A ogni giro cambia gamba."
        ],
        steps: [
          "Prepara la scaletta con il nastro.",
          "Stai sugli avampiedi, ginocchia morbide, mani in guardia.",
          "Fai un giro lento guardando i piedi per imparare lo schema.",
          "Dal giro dopo alza lo sguardo e accelera solo se non pesti il nastro.",
          "Torna camminando e riparti."
        ],
        cues: ["Avampiedi, talloni leggeri", "Testa alta", "Preciso prima di veloce"],
        errors: [
          { e: "Guardi sempre i piedi.", fix: "Dopo due quadrati alza lo sguardo: i piedi imparano da soli." },
          { e: "Pesti il nastro.", fix: "Rallenta finché fai un giro intero senza toccarlo, poi riaccelera." }
        ],
        success: "fai l'ultima serie senza pestare il nastro e guardando avanti per almeno metà scaletta.",
        easier: "Un solo piede per quadrato.",
        harder: "Al segnale casuale cambia schema senza fermarti.",
        video: "agility ladder icky shuffle",
        kind: "drill",
        doses: [{ sets: 4, work: 30, rest: 30 }, { sets: 5, work: 30, rest: 30 }, { sets: 6, work: 30, rest: 30 }]
      },
      braccia: {
        names: ["Pallina: lancio e presa a mani alternate", "Pallina contro il muro", "Pallina contro il muro in guardia"],
        goal: "Occhi e mani coordinati: vedere arrivare qualcosa e reagire con la mano giusta, nel momento giusto.",
        hows: [
          "Con una pallina da tennis lancia da una mano all'altra all'altezza degli occhi, poi lancia con una mano e prendi con l'altra incrociando. Quando non cade più, prova con un occhio chiuso.",
          "A due metri da un muro lancia la pallina e riprendila con la mano opposta. Poi una serie solo con la mano debole.",
          "In guardia davanti al muro: lancia con la mano avanti e riprendi con la stessa; tra lancio e presa fai una schivata del busto."
        ],
        steps: [
          "Trova una pallina che rimbalzi bene e un muro libero.",
          "Mettiti in posizione con le ginocchia morbide.",
          "Lancia piano e corto, guardando la pallina fino alla mano.",
          "Prendila con la mano morbida, accompagnandola.",
          "Conta le prese di fila e prova a battere il tuo numero."
        ],
        cues: ["Occhi sulla pallina", "Mano morbida", "Prima la mano debole"],
        errors: [
          { e: "La mano rigida respinge la pallina.", fix: "Accompagna la pallina verso di te mentre la prendi." },
          { e: "Lanci storti.", fix: "Lancia piano e corto: precisione prima della velocità." }
        ],
        success: "nell'ultima serie fai 20 prese di fila senza far cadere la pallina.",
        easier: "Fai rimbalzare la pallina a terra prima di prenderla.",
        harder: "Due palline, una per mano.",
        video: "esercizi coordinazione pallina da tennis muro",
        kind: "drill",
        doses: [{ sets: 3, work: 60, rest: 30 }, { sets: 4, work: 60, rest: 30 }, { sets: 4, work: 60, rest: 30 }]
      },
      presa: {
        names: ["Camminata dell'orso e del granchio", "Gambero a terra", "Sprawl e ritorno in guardia"],
        goal: "Corpo coordinato a terra e nei cambi di livello: chi lotta si muove come un pezzo solo.",
        hows: [
          "Mani e piedi a terra, ginocchia staccate di un palmo: cammina avanti e indietro (orso) muovendo insieme mano destra e piede sinistro. Poi a pancia in su, mani dietro, cammina all'indietro (granchio).",
          "Sdraiato su un fianco spingi con il piede a terra e porta le anche indietro come un gambero (shrimp), poi passa sull'altro fianco e ripeti. Attraversa la stanza e torna.",
          "Dalla guardia butta indietro le gambe in uno sprawl, anche giù e petto pesante, poi rientra subito in guardia. Ogni 5 secondi, o al segnale casuale."
        ],
        steps: [
          "Libera lo spazio a terra.",
          "Prendi la posizione di partenza e controlla schiena e ginocchia.",
          "Muoviti lento finché lo schema è giusto.",
          "Aumenta il ritmo senza perdere lo schema.",
          "Alla fine della serie rialzati in guardia."
        ],
        cues: ["Mano e piede opposti insieme", "Anche lontane", "Rientra subito in guardia"],
        errors: [
          { e: "Nell'orso le ginocchia toccano terra.", fix: "Ginocchia a un palmo da terra e schiena piatta." },
          { e: "Nel gambero spingi con le mani invece che con le anche.", fix: "Il motore è il piede a terra: spinge le anche indietro." }
        ],
        success: "completi tutte le serie con lo schema giusto e senza fermarti a metà.",
        easier: "Metà durata, pausa più lunga.",
        harder: "Aggiungi un cambio di direzione ogni 5 secondi.",
        video: "shrimp esercizio lotta bear crawl",
        kind: "drill",
        doses: [{ sets: 4, work: 30, rest: 30 }, { sets: 4, work: 40, rest: 30 }, { sets: 5, work: 30, rest: 30 }]
      },
      corpo: {
        names: ["Corda: saltelli base", "Corda: passo del pugile", "Corda: intervalli veloci"],
        goal: "Ritmo e piedi leggeri: la corda allena la coordinazione tra mani e piedi come pochi altri esercizi.",
        hows: [
          "Saltelli a piedi uniti, bassi, sugli avampiedi; i polsi girano la corda vicino ai fianchi. Se inciampi, riparti subito.",
          "Passo del pugile: sposta il peso da un piede all'altro come una corsa sul posto molto leggera, poi due saltelli per piede.",
          "30 secondi veloci e 30 lenti, cambiando passo a ogni round; se ci riesci, un doppio giro ogni 10 saltelli."
        ],
        steps: [
          "Regola la corda: con un piede al centro, le maniglie arrivano alle ascelle.",
          "Gomiti vicini ai fianchi, girano i polsi.",
          "Salta basso, appena quanto serve.",
          "Respira con calma e tieni il ritmo.",
          "Se inciampi riparti subito, senza fermarti a lungo."
        ],
        cues: ["Salti bassi", "Girano i polsi", "Ritmo costante"],
        errors: [
          { e: "Salti troppo alto.", fix: "Basta staccare di un paio di centimetri: risparmi fiato e guadagni ritmo." },
          { e: "Giri la corda con le braccia larghe.", fix: "Gomiti vicini ai fianchi, lavorano i polsi." }
        ],
        success: "arrivi alla fine di ogni serie con al massimo tre errori.",
        easier: "Senza corda: fai gli stessi saltelli girando i polsi come se la avessi.",
        harder: "Incroci della corda davanti ogni 10 saltelli.",
        video: "salto della corda boxe tecnica",
        kind: "condizionamento",
        doses: [{ sets: 3, work: 60, rest: 45 }, { sets: 4, work: 60, rest: 45 }, { sets: 5, work: 60, rest: 45 }]
      }
    },
    equilibrio: {
      gambe: {
        names: ["Una gamba con il ginocchio alto", "Caricamento, calcio lento e tenuta", "Calcio tenuto su un cuscino"],
        goal: "Stabilità sulla gamba d'appoggio: un calcio vale solo se torni in guardia senza barcollare.",
        hows: [
          "In piedi su una gamba, l'altra con il ginocchio alto davanti, mani in guardia: 30 secondi per lato con lo sguardo su un punto fisso e il ginocchio d'appoggio appena piegato.",
          "Dal ginocchio alto distendi il calcio (frontale o laterale) in 3 secondi, tienilo 2 secondi, richiudi in 3 secondi e appoggia il piede solo alla fine.",
          "Come il livello intermedio, ma in piedi su un cuscino piegato, oppure a occhi chiusi durante la tenuta."
        ],
        steps: [
          "Trova un punto fisso davanti a te all'altezza degli occhi.",
          "Spingi tutta la pianta a terra, soprattutto l'alluce.",
          "Alza il ginocchio senza inclinare il busto.",
          "Muovi la gamba lentamente, il busto resta fermo.",
          "Richiudi prima di appoggiare il piede, poi cambia lato."
        ],
        cues: ["Sguardo su un punto", "Ginocchio d'appoggio morbido", "Richiudi prima di appoggiare"],
        errors: [
          { e: "Il busto si inclina per compensare.", fix: "Abbassa il calcio finché il busto resta fermo." },
          { e: "Il piede d'appoggio ruota o saltella.", fix: "Spingi tutta la pianta a terra e accorcia la tenuta." }
        ],
        success: "completi tutte le ripetizioni senza appoggiare il piede prima del tempo.",
        easier: "Sfiora il muro con un dito.",
        harder: "Tieni la posizione mentre fai tre colpi di braccia in aria.",
        video: "esercizi equilibrio calci arti marziali",
        kind: "preparatorio",
        doses: [{ sets: 3, work: 30, rest: 20, perSide: true }, { sets: 3, reps: 5, rest: 30, perSide: true }, { sets: 3, reps: 5, rest: 30, perSide: true }]
      },
      tutte: {
        names: ["Stacco su una gamba con appoggio", "Stacco su una gamba", "Stacco su una gamba con peso"],
        goal: "Equilibrio e controllo del corpo intero con le anche al lavoro: è quello che ti tiene in piedi quando ti spingono o dopo un colpo a vuoto.",
        hows: [
          "Su una gamba, l'altra dietro, una mano appoggiata al muro: piegati in avanti dalle anche con la schiena dritta mentre la gamba libera sale dietro, finché il busto è quasi parallelo al pavimento. Torna su stringendo il gluteo.",
          "Stesso movimento senza appoggio, lento: 3 secondi per scendere, 3 per salire.",
          "Con uno zaino carico o una bottiglia d'acqua nella mano opposta alla gamba d'appoggio, e un secondo di pausa in basso."
        ],
        steps: [
          "In piedi su una gamba, ginocchio d'appoggio appena piegato.",
          "Piegati dalle anche, schiena dritta, la gamba libera sale dietro.",
          "Scendi finché il busto è quasi orizzontale o finché la schiena resta dritta.",
          "Fermati un istante in basso.",
          "Torna su spingendo con il tallone e stringendo il gluteo."
        ],
        cues: ["Schiena dritta", "Anche parallele al pavimento", "Il gluteo ti riporta su"],
        errors: [
          { e: "Il bacino ruota e si apre verso l'alto.", fix: "Punta l'alluce della gamba libera verso il pavimento." },
          { e: "La schiena si curva.", fix: "Scendi meno: la schiena resta dritta, la profondità arriva col tempo." }
        ],
        success: "completi le ripetizioni senza appoggiare il piede libero e con la schiena dritta.",
        easier: "Appoggia la punta del piede libero a terra dietro di te.",
        harder: "Chiudi gli occhi nella fase di salita.",
        video: "stacco rumeno su una gamba",
        kind: "preparatorio",
        doses: [{ sets: 3, reps: 8, rest: 30, perSide: true }, { sets: 3, reps: 8, rest: 40, perSide: true }, { sets: 3, reps: 8, rest: 45, perSide: true }]
      },
      braccia: { as: "tutte" },
      presa: { as: "tutte" },
      corpo: { as: "tutte" }
    },
    resistenza: {
      tutte: {
        names: ["Intervalli 30/30 di shadow", "Intervalli 40/20 di shadow", "Round da 3 minuti con scatti"],
        goal: "Fiato da combattimento: restare preciso anche stanco, come nei round veri.",
        hows: [
          "30 secondi di shadow a ritmo sostenuto con i colpi semplici della tua disciplina, sempre in guardia, e 30 secondi di passo sul posto per recuperare. Nella pausa respira dal naso.",
          "40 secondi di shadow veloce e 20 di pausa attiva. Negli ultimi 10 secondi di ogni intervallo raddoppia la velocità.",
          "Round da 3 minuti a ritmo da combattimento; ogni 30 secondi, 5 secondi di colpi alla massima velocità. 1 minuto di pausa tra i round."
        ],
        steps: [
          "Riscaldati bene prima: qualche minuto di saltelli e di colpi leggeri.",
          "Parti a un ritmo che puoi tenere fino alla fine.",
          "Espira a ogni colpo e tieni le mani alte.",
          "Nella pausa cammina e respira dal naso.",
          "Nell'ultimo intervallo dai tutto, sempre con la tecnica pulita."
        ],
        cues: ["Guardia su anche da stanco", "Espira a ogni colpo", "Recupera dal naso"],
        errors: [
          { e: "Abbassi la guardia quando arriva la fatica.", fix: "Rallenta i colpi ma tieni le mani alte: è proprio quello che stai allenando." },
          { e: "Trattieni il fiato.", fix: "Un soffio corto a ogni colpo." }
        ],
        success: "arrivi alla fine dell'ultimo intervallo con la guardia alta e la tecnica ancora pulita.",
        easier: "Stessa durata, ritmo più basso.",
        harder: "Un intervallo in più.",
        video: "shadow boxing intervalli allenamento fiato",
        kind: "shadow",
        doses: [{ sets: 6, work: 30, rest: 30 }, { sets: 8, work: 40, rest: 20 }, { sets: 3, work: 180, rest: 60 }]
      },
      presa: {
        names: ["Circuito da lotta leggero", "Circuito da lotta", "Circuito da lotta con sprawl esplosivi"],
        goal: "Resistenza di chi lotta: abbassarsi, spingere e rialzarsi tante volte senza perdere forza.",
        hows: [
          "Un giro è: 20 secondi di squat a corpo libero, 20 di sprawl lenti, 20 di gambero a terra, senza pause tra un esercizio e l'altro. Poi 1 minuto di recupero.",
          "Un giro è: 30 secondi ciascuno di squat con salto, sprawl, gambero e plank, senza pause. Poi 1 minuto di recupero.",
          "Un giro è: 30 secondi ciascuno di sprawl esplosivi, squat con salto, gambero veloce e piegamenti. 45 secondi di recupero."
        ],
        steps: [
          "Prepara lo spazio a terra.",
          "Fai il primo esercizio del giro, poi passa subito al successivo.",
          "Tieni un ritmo che ti permetta di finire il giro.",
          "Nel recupero cammina e respira lento.",
          "Ripeti i giri previsti."
        ],
        cues: ["Niente pause dentro il giro", "Anche giù nello sprawl", "Respira lento nel recupero"],
        errors: [
          { e: "Parti troppo forte e ti fermi a metà.", fix: "Il primo giro al 70%: il ritmo si alza dopo." },
          { e: "Sprawl con le anche alte.", fix: "Anche giù verso il pavimento, petto pesante." }
        ],
        success: "finisci tutti i giri senza fermarti dentro un giro.",
        easier: "Un giro in meno.",
        harder: "Recupero di 30 secondi.",
        video: "circuito allenamento lotta sprawl",
        kind: "condizionamento",
        doses: [{ sets: 3, work: 60, rest: 60 }, { sets: 3, work: 120, rest: 60 }, { sets: 4, work: 120, rest: 45 }]
      },
      gambe: { as: "tutte" },
      braccia: { as: "tutte" },
      corpo: { as: "tutte" }
    }
  };

  function entryFor(reason, region) {
    const group = LIB[reason];
    if (!group) return null;
    let e = group[region] || group.tutte || group.corpo;
    let guard = 0;
    while (e && e.as && guard < 4) { e = group[e.as]; guard += 1; }
    return e || null;
  }
  function entryRegion(reason, region) {
    const group = LIB[reason] || {};
    let key = group[region] ? region : group.tutte ? "tutte" : "corpo";
    let guard = 0;
    while (group[key] && group[key].as && guard < 4) { key = group[key].as; guard += 1; }
    return key;
  }

  /*
   * item: { reason, ref } (da MartialEngine.remedial o dall'allenamento salvato).
   * ctx: { level, disc, exById(id) -> esercizio o null }.
   * Restituisce un esercizio pronto per la sessione, con fix: { reason, label, because, early }.
   */
  function build(item, ctx = {}) {
    if (!item || !REASON_LABEL[item.reason]) return null;
    const failed = item.ref && ctx.exById ? ctx.exById(item.ref) : null;
    const level = Number(ctx.level) || 1;
    const tier = tierOf(level);
    const because = failed ? `Aggiunto perché «${failed.name}» non ti è riuscito: ${CAUSE[item.reason]}.` : `Aggiunto per allenare ${WITH_ARTICLE[item.reason]}.`;
    const fix = { reason: item.reason, label: REASON_LABEL[item.reason], because, early: EARLY.includes(item.reason) };
    if (item.reason === "tecnica") {
      if (!failed) return null;
      const cues = (failed.cues || []).slice(0, 3);
      return {
        id: `fix-tecnica-${failed.id}`,
        name: `Ripasso lento: ${failed.name}`,
        kind: "tecnica",
        goal: "Rifare il gesto che non ti è riuscito con calma, un punto chiave alla volta, finché torna pulito.",
        how: `Rifai «${failed.name}» a metà velocità e senza forza. A ogni serie controlla un solo punto chiave${cues.length ? `: ${cues.join("; ")}` : ""}.${failed.easier ? ` Parti dalla versione più facile: ${failed.easier}` : ""}`,
        watch: failed.watch,
        steps: (failed.steps || []).slice(),
        cues: cues.length ? cues : ["Lento e pulito"],
        errors: (failed.errors || []).slice(),
        success: "in tutte e tre le serie le ripetizioni sono lente e pulite, con il punto chiave rispettato. Filmati almeno una volta e confrontati con il video.",
        easier: failed.easier,
        video: failed.video,
        safety: failed.safety,
        dose: { sets: 3, reps: 5, rest: 45, perSide: !!(failed.dose && failed.dose.perSide) },
        fix
      };
    }
    const region = regionOf(failed, item.refDisc || ctx.disc);
    const key = entryRegion(item.reason, region);
    const e = entryFor(item.reason, region);
    if (!e) return null;
    return {
      id: `fix-${item.reason}-${key}-${tier + 1}`,
      name: e.names[tier],
      kind: e.kind,
      goal: e.goal,
      how: e.hows[tier],
      steps: e.steps.slice(),
      cues: e.cues.slice(),
      errors: e.errors.slice(),
      success: e.success,
      easier: e.easier,
      harder: e.harder,
      safety: e.safety,
      video: e.video,
      dose: Object.assign({}, e.doses[tier]),
      fix: Object.assign(fix, { region: key, regionLabel: REGION_LABEL[key] || "" })
    };
  }

  // Tutti gli esercizi della libreria (per i test): motivo x parte x grado.
  function all() {
    const out = [];
    Object.keys(LIB).forEach((reason) => Object.keys(LIB[reason]).forEach((region) => {
      const e = LIB[reason][region];
      if (e.as) return;
      [0, 1, 2].forEach((t) => out.push({ reason, region, tier: t, entry: e }));
    }));
    return out;
  }

  return { REGION_LABEL, REASON_LABEL, WITH_ARTICLE, CAUSE, EARLY, regionOf, tierOf, build, all, LIB };
});
