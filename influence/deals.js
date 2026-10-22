/*
 * Progetto A - Influenza: trattative per il simulatore (scenari, controparti, battute).
 *
 * Ogni scenario ha un prezzo e un secondo punto (pagamento, garanzia, durata...). Per te il secondo
 * punto costa poco, per la controparte vale molto (o viceversa): trovarlo crea valore per tutti e
 * due. Il limite della controparte (res) e' nascosto ed estratto a caso a ogni partita; a volte e'
 * peggiore della tua alternativa: allora l'accordo giusto e' non fare l'accordo.
 *
 * Valori: you/them = quanto vale l'opzione per te / per loro, in euro (positivo = conviene).
 */
(function (root) {
  "use strict";
  const DEALS = [
    {
      id: "gres",
      title: "Lotto di gres per un cantiere",
      role: "seller",
      who: "Ing. Rinaldi, impresa edile",
      brief: "Hai in magazzino 1.200 m² di gres porcellanato di fine serie. Un'impresa edile lo vuole per un cantiere di 24 appartamenti e ti ha chiesto un incontro per il prezzo di tutto il lotto.",
      you: { batna: 18000, text: "Un grossista di stock ti ha offerto 18.000 € per tutto il lotto, ritiro immediato." },
      market: { low: 19000, high: 26000, text: "Il listino del lotto è 26.000 €; i fine serie simili si vendono tra 19.000 e 23.000 €." },
      criteria: [
        { id: "list", text: "il listino ufficiale del lotto", value: 26000 },
        { id: "comp", text: "il prezzo di due lotti simili venduti il mese scorso", value: 23400 },
        { id: "cost", text: "il costo d'acquisto più il trasporto", value: 19800 }
      ],
      res: [20800, 25200],
      step: 100,
      issue: {
        label: "Pagamento",
        interest: "L'impresa incassa dal committente solo a stato avanzamento lavori: pagarti più tardi per loro vale molto.",
        options: [
          { id: "now", label: "alla consegna", you: 0, them: 0 },
          { id: "d60", label: "a 60 giorni", you: -350, them: 1300 },
          { id: "d90", label: "a 90 giorni", you: -700, them: 1900 }
        ]
      },
      labels: [
        { text: "Sembra che i tempi di pagamento del cantiere ti mettano in difficoltà.", ok: true },
        { text: "Sembra che tu non sia convinto della qualità del materiale.", ok: false },
        { text: "Sembra che tu abbia già un altro fornitore in mente.", ok: false }
      ]
    },
    {
      id: "magazzino",
      title: "Affitto di un magazzino",
      role: "buyer",
      who: "Sig.ra Ferri, proprietaria",
      brief: "Ti serve un magazzino di 800 m² vicino all'autostrada per i prossimi anni. Quello della signora Ferri è perfetto: trattate il canone annuo.",
      you: { batna: 31000, text: "Un altro capannone, più lontano, costa 28.000 € l'anno, ma con i trasporti in più ti costa come 31.000 €." },
      market: { low: 22000, high: 34000, text: "Capannoni simili in zona si affittano tra 22.000 e 34.000 € l'anno." },
      criteria: [
        { id: "omi", text: "le quotazioni immobiliari della zona (OMI)", value: 25500 },
        { id: "near", text: "il canone del capannone accanto, appena affittato", value: 26800 },
        { id: "ask", text: "il prezzo dell'annuncio", value: 33000 }
      ],
      res: [23500, 30500],
      step: 100,
      issue: {
        label: "Durata",
        interest: "La proprietaria ha già avuto un inquilino che è andato via dopo un anno: per lei un contratto lungo e sicuro vale molto.",
        options: [
          { id: "3", label: "3 + 3 anni", you: 0, them: 0 },
          { id: "6", label: "6 + 6 anni", you: -400, them: 2600 },
          { id: "6g", label: "6 + 6 anni con garanzia bancaria", you: -1100, them: 3400 }
        ]
      },
      labels: [
        { text: "Sembra che la cosa che più ti preoccupa sia restare di nuovo con il capannone vuoto.", ok: true },
        { text: "Sembra che tu abbia bisogno di incassare subito.", ok: false },
        { text: "Sembra che tu voglia vendere il capannone a breve.", ok: false }
      ]
    },
    {
      id: "auto",
      title: "Furgone usato per le consegne",
      role: "buyer",
      who: "Marco, concessionario",
      brief: "Cerchi un furgone usato per le consegne. Ne hai trovato uno con 60.000 km che fa al caso tuo. Il cartellino dice 16.900 €.",
      you: { batna: 14600, text: "Un altro concessionario ha un furgone simile, con qualche chilometro in più, a 14.600 €." },
      market: { low: 12500, high: 17000, text: "Sui siti di annunci furgoni simili vanno da 12.500 a 17.000 €." },
      criteria: [
        { id: "quot", text: "la quotazione dell'usato per quel modello e chilometraggio", value: 13400 },
        { id: "tag", text: "il prezzo sul cartellino", value: 16900 },
        { id: "ads", text: "la media degli annunci simili", value: 14800 }
      ],
      res: [12200, 14400],
      step: 100,
      issue: {
        label: "Garanzia",
        interest: "Il concessionario ha una convenzione con un'assicurazione: estendere la garanzia gli costa poco, ma per te vale molto.",
        options: [
          { id: "g0", label: "garanzia di legge (12 mesi)", you: 0, them: 0 },
          { id: "g24", label: "garanzia estesa a 24 mesi", you: 900, them: -250 },
          { id: "g24t", label: "24 mesi + tagliando e gomme", you: 1300, them: -650 }
        ]
      },
      labels: [
        { text: "Sembra che tu voglia chiudere la vendita entro fine mese.", ok: true },
        { text: "Sembra che questo furgone non ti interessi molto venderlo.", ok: false },
        { text: "Sembra che tu sia offeso dalla mia richiesta.", ok: false }
      ],
      // qui l'etichetta giusta fa emergere un altro interesse: i premi di fine mese del concessionario
      interestFromLabel: "A fine mese il concessionario prende un premio se raggiunge un numero di vendite: chiudere oggi per lui conta. E la garanzia estesa gli costa poco."
    },
    {
      id: "fornitore",
      title: "Rinnovo con un fornitore che alza i prezzi",
      role: "buyer",
      who: "Dott. Bassi, direttore commerciale",
      brief: "Il tuo fornitore principale di colle e massetti vuole rinnovare il contratto annuale con un aumento. L'anno scorso hai speso 90.000 €. Devi decidere il valore del nuovo contratto.",
      you: { batna: 101000, text: "Un fornitore concorrente ti fa 97.000 €, ma cambiare (prove, formazione delle squadre) ti costa circa 4.000 €: in tutto 101.000 €." },
      market: { low: 88000, high: 104000, text: "Gli aumenti del settore quest'anno sono tra il 2% e il 9%." },
      criteria: [
        { id: "ist", text: "l'indice dei prezzi dei materiali da costruzione (ISTAT)", value: 93600 },
        { id: "last", text: "il contratto dell'anno scorso", value: 90000 },
        { id: "req", text: "il listino nuovo che ti hanno mandato", value: 103500 }
      ],
      res: [89000, 99500],
      step: 500,
      issue: {
        label: "Pagamento",
        interest: "Il fornitore ha problemi di liquidità con le banche: essere pagato prima per lui vale più di uno sconto.",
        options: [
          { id: "d90", label: "a 90 giorni (come oggi)", you: 0, them: 0 },
          { id: "d30", label: "a 30 giorni", you: -600, them: 2400 },
          { id: "pre", label: "anticipato a trimestre", you: -1500, them: 4200 }
        ]
      },
      labels: [
        { text: "Sembra che in questo periodo la liquidità sia un problema per voi.", ok: true },
        { text: "Sembra che non vi importi molto di perdere un cliente come noi.", ok: false },
        { text: "Sembra che l'aumento dipenda solo dalle materie prime.", ok: false }
      ]
    },
    {
      id: "parquet",
      title: "Parquet per un cliente in showroom",
      role: "seller",
      who: "Avv. Conti, cliente privato",
      brief: "Un cliente vuole il parquet in rovere per tutta la casa: 95 m². Il preventivo a listino, posa esclusa, è 9.400 €. È la terza volta che viene in showroom.",
      you: { batna: 6900, text: "Se non chiudi, quel parquet lo vendi comunque ad altri clienti nei prossimi mesi: ti renderebbe circa 6.900 € di oggi." },
      market: { low: 7000, high: 9800, text: "Un rovere simile online, senza consulenza né posa, si trova tra 7.000 e 8.200 €." },
      criteria: [
        { id: "list", text: "il listino dello showroom", value: 9400 },
        { id: "web", text: "il prezzo online più basso di un rovere simile", value: 7000 },
        { id: "comp", text: "il preventivo di un altro showroom che il cliente ti ha mostrato", value: 8600 }
      ],
      res: [7300, 9000],
      step: 50,
      issue: {
        label: "Posa",
        interest: "Il cliente è preoccupato per la posa: ha avuto brutte esperienze e vuole una squadra affidabile. Per te la posa con la tua squadra costa poco in più.",
        options: [
          { id: "no", label: "posa esclusa", you: 0, them: 0 },
          { id: "posa", label: "posa con la tua squadra", you: -650, them: 1500 },
          { id: "posa2", label: "posa + garanzia di 5 anni sulla posa", you: -800, them: 1900 }
        ]
      },
      labels: [
        { text: "Sembra che tu abbia paura che la posa venga fatta male.", ok: true },
        { text: "Sembra che il budget sia l'unica cosa che conta.", ok: false },
        { text: "Sembra che tu voglia aspettare i saldi.", ok: false }
      ]
    },
    {
      id: "container",
      title: "Un container per un distributore a Jakarta",
      role: "seller",
      who: "Pak Hendra, importatore",
      brief: "Un importatore indonesiano vuole un container di piastrelle italiane per il suo primo ordine. Trattate il prezzo del container.",
      you: { batna: 52000, text: "Un cliente in Europa prende lo stesso materiale a 52.000 € franco fabbrica." },
      market: { low: 50000, high: 64000, text: "Container simili per il Sud-Est asiatico si vendono tra 50.000 e 64.000 €." },
      criteria: [
        { id: "eu", text: "il prezzo ai clienti europei", value: 56000 },
        { id: "list", text: "il listino export", value: 63000 },
        { id: "local", text: "il prezzo delle piastrelle locali a Jakarta", value: 41000 }
      ],
      res: [53000, 61500],
      step: 250,
      issue: {
        label: "Resa (Incoterm)",
        interest: "L'importatore non ha ancora uno spedizioniere di fiducia: se organizzi tu nave e assicurazione per lui vale molto più di quanto ti costa.",
        options: [
          { id: "exw", label: "franco fabbrica (EXW)", you: 0, them: 0 },
          { id: "fob", label: "franco a bordo (FOB Genova)", you: -900, them: 1400 },
          { id: "cif", label: "nave e assicurazione fino a Jakarta (CIF)", you: -2300, them: 4400 }
        ]
      },
      labels: [
        { text: "Sembra che organizzare la spedizione dall'Italia ti preoccupi.", ok: true },
        { text: "Sembra che tu non ti fidi dei prodotti italiani.", ok: false },
        { text: "Sembra che tu abbia fretta di tornare in Indonesia.", ok: false }
      ]
    },
    {
      id: "assunzione",
      title: "Stipendio di un responsabile vendite",
      role: "buyer",
      who: "Giulia, candidata",
      brief: "Vuoi assumere una responsabile vendite molto brava, che oggi lavora per un concorrente. Trattate la retribuzione annua lorda.",
      you: { batna: 50000, text: "Il secondo candidato accetterebbe 44.000 €, ma è meno esperto: per te equivale a pagare lei 50.000 €." },
      market: { low: 40000, high: 56000, text: "Per questo ruolo in Lombardia gli stipendi vanno da 40.000 a 56.000 € lordi." },
      criteria: [
        { id: "survey", text: "l'indagine retributiva di settore per il ruolo", value: 46500 },
        { id: "now", text: "il suo stipendio attuale più un aumento normale per chi cambia", value: 47500 },
        { id: "ask", text: "la sua prima richiesta", value: 55000 }
      ],
      res: [42500, 49500],
      step: 500,
      issue: {
        label: "Smart working",
        interest: "La candidata ha un figlio piccolo: due giorni di lavoro da casa per lei valgono tantissimo, e a te costano poco.",
        options: [
          { id: "sw0", label: "sempre in ufficio", you: 0, them: 0 },
          { id: "sw1", label: "1 giorno da casa a settimana", you: -300, them: 1800 },
          { id: "sw2", label: "2 giorni da casa a settimana", you: -800, them: 3500 }
        ]
      },
      labels: [
        { text: "Sembra che la flessibilità degli orari per te conti quanto lo stipendio.", ok: true },
        { text: "Sembra che tu non sia sicura di voler cambiare lavoro.", ok: false },
        { text: "Sembra che tu voglia solo usare la nostra offerta per farti aumentare dove sei.", ok: false }
      ]
    }
  ];

  /*
   * Controparti. gap = quanto apre lontano dal suo limite (frazione del limite); beta = come
   * concede nel tempo (<1 tiene duro fino alla fine, >1 concede presto); recip = quanto ricambia le
   * tue concessioni; patience = turni prima di andarsene; tol = quanto oltre il mercato puo' arrivare
   * un'offerta prima di sembrare un insulto; strikes = insulti tollerati; bluff = inventa
   * alternative e scadenze.
   */
  const COUNTERPARTS = [
    { id: "coop", level: 1, label: "Collaborativo", desc: "Vuole chiudere e ricambia le concessioni. Ideale per provare le tecniche.", gap: [0.12, 0.18], beta: 1.5, recip: 0.6, patience: [9, 11], tol: 0.3, strikes: 2, bluff: false },
    { id: "prag", level: 2, label: "Pragmatico", desc: "Concede con regolarità, ma solo se anche tu ti muovi.", gap: [0.16, 0.22], beta: 1.0, recip: 0.45, patience: [8, 9], tol: 0.22, strikes: 1, bluff: false },
    { id: "duro", level: 3, label: "Duro", desc: "Concede pochissimo fino alla fine e si offende facilmente.", gap: [0.2, 0.28], beta: 0.5, recip: 0.25, patience: [7, 8], tol: 0.15, strikes: 1, bluff: false },
    { id: "anch", level: 4, label: "Ancorante", desc: "Apre con una cifra estrema per spostare il centro della trattativa.", gap: [0.38, 0.48], beta: 0.7, recip: 0.35, patience: [8, 9], tol: 0.2, strikes: 2, bluff: false },
    { id: "bluff", level: 5, label: "Bluffatore", desc: "Inventa offerte migliori e scadenze finte. Va smascherato senza rompere.", gap: [0.2, 0.26], beta: 0.75, recip: 0.4, patience: [8, 9], tol: 0.2, strikes: 1, bluff: true }
  ];

  // Battute. {p} = prezzo, {o} = opzione, {b} = alternativa dichiarata.
  const LINES = {
    openThem: {
      coop: ["Ho fatto due conti: possiamo partire da {p}.", "Vorrei chiudere in fretta. Direi {p}."],
      prag: ["La mia proposta è {p}.", "Per come la vedo io, il prezzo giusto è {p}."],
      duro: ["{p}. Più di così non ha senso.", "Il prezzo è {p}, e già è generoso."],
      anch: ["Guardi, il valore reale è {p}, e sono stato largo.", "Partiamo da {p}: è quello che vale."],
      bluff: ["Posso arrivare a {p}, ma devo dirle che ho anche altre proposte.", "{p}, e devo decidere entro domani."]
    },
    counter: {
      coop: ["Va bene, mi muovo anch'io: {p}.", "Posso arrivare a {p}.", "Facciamo {p}, così ci avviciniamo."],
      prag: ["Allora {p}.", "Posso fare {p}.", "Mi sposto a {p}, ma adesso tocca a lei."],
      duro: ["{p}. E faccio fatica.", "Al massimo {p}.", "{p}, non di più."],
      anch: ["Posso scendere a {p}, ma siamo ancora lontani dal valore.", "{p}. Il mercato è questo."],
      bluff: ["{p}. E guardi che dall'altra parte mi danno di più.", "Arrivo a {p}, ma non so per quanto."]
    },
    still: ["Resto a {p}.", "Non mi muovo da {p} se non si muove lei.", "Sono sempre a {p}."],
    accept: ["Va bene, affare fatto.", "D'accordo, chiudiamo così.", "Ci sto. Stringiamoci la mano."],
    insult: ["Con tutto il rispetto, così non ha senso parlarne.", "Questa cifra non è seria. Rifletta.", "Mi sta prendendo in giro?"],
    leaveInsult: ["Mi dispiace, non ci sono le condizioni. Arrivederci.", "Lasciamo stare, non è una trattativa seria."],
    leaveTime: ["Non riusciamo a trovarci. Ci risentiamo, magari.", "Ho altri impegni: per oggi chiudiamo qui senza accordo."],
    hurry: ["Devo chiudere a breve, ho altri appuntamenti.", "Ho ancora pochi minuti."],
    walkOk: ["Peccato. Se cambia idea, ha il mio numero.", "Capisco. Arrivederci."],
    optionLike: ["Questo punto mi interessa, vediamo.", "Interessante, questo mi aiuta."],
    optionNo: ["Questo per me cambia poco.", "Non è questo il punto."],
    qCalibratedReveal: ["Le dico la verità: {i}", "Ecco, il punto vero è questo. {i}"],
    qCalibratedMove: ["Mmh. Diciamo che potrei fare uno sforzo: {p}.", "Se la mette così, posso venirle incontro: {p}."],
    qCalibratedNothing: ["Ci sto pensando anch'io. Il mio prezzo resta {p}.", "Bella domanda. Ma resto a {p}."],
    qClosed: ["Sì, è il massimo.", "Diciamo di sì."],
    qWhy: ["Perché i costi sono questi, mi creda.", "Perché il mercato è questo. Non posso farci niente."],
    labelOk: ["Esatto, è proprio così. {i}", "Ha centrato il punto. {i}"],
    labelNo: ["No, non direi.", "Non proprio. Non è quello."],
    batnaGood: ["Capisco. Vediamo cosa posso fare: {p}.", "Allora cerchiamo di non perderci: {p}."],
    batnaWeak: ["Allora la sua alternativa è parecchio sotto quello che le offro io.", "Mi sembra che la mia offerta sia già migliore della sua alternativa."],
    bluffCaught: ["Mi scusi, ma conosco quel mercato: un'offerta così non esiste.", "Ho fatto una telefonata: quell'offerta non mi risulta."],
    bluffBeyond: ["Se le danno davvero così tanto, vada pure da loro.", "Allora le conviene accettare la loro. Io a quella cifra non arrivo."],
    themBluffAlt: ["Le dico la verità: un altro mi offre {b}.", "Ho una proposta scritta a {b}, sul tavolo."],
    themBluffDeadline: ["Questa è la mia ultima offerta: {p}.", "Ultima offerta: {p}. Prendere o lasciare."],
    themBluffBack: ["Beh… diciamo che ci sono altri aspetti da valutare.", "Non è proprio un'offerta firmata, ecco."],
    themFinal: ["Arrivo a {p}, ed è davvero il mio limite.", "{p}: oltre non posso andare, mi creda."],
    ultimatumNo: ["Allora non ci siamo. Arrivederci.", "A quella cifra no. Mi dispiace."],
    ultimatumLast: ["Aspetti. L'ultima parola è mia: {p}, e chiudiamo.", "Non a quella cifra, ma posso fare {p}. Davvero l'ultima."],
    splitNo: ["La metà tra le nostre cifre? No, la sua partenza era troppo alta.", "Fare a metà da lì non mi conviene."],
    splitOk: ["Va bene, facciamo a metà.", "D'accordo, a metà strada."]
  };

  const api = { DEALS, COUNTERPARTS, LINES };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.InfluenceDeals = api;
})(typeof window !== "undefined" ? window : globalThis);
