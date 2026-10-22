/*
 * Progetto A - Mentalista: «Lettura» (dati, senza DOM).
 *
 * Due tipi di esercizio:
 *  tech   una frase di un finto sensitivo: quale tecnica sta usando? (lettura a freddo)
 *         Nomi delle tecniche: Ian Rowland, The Full Facts Book of Cold Reading (Barnum Statement,
 *         Rainbow Ruse, Jacques Statement, Fuzzy Fact, hot reading, Good Chance Guess); la «pesca»
 *         e' tra le regole di Ray Hyman (1977); «sparo a ventaglio» e' il nome comune dello
 *         shotgunning.
 *  infer  un dettaglio osservato su una persona: che cosa se ne puo' dire davvero? La risposta
 *         giusta e' l'inferenza che il dettaglio sostiene, con la sicurezza che merita: ne' il
 *         salto alla conclusione del sensitivo, ne' il «non vuol dire niente».
 * lv = livello (1-3).
 */
(function (root) {
  "use strict";

  const TECH = {
    barnum: { label: "Affermazione Barnum", hint: "Una frase così generica che vale per quasi tutti (Rowland: Barnum Statement)." },
    rainbow: { label: "Arcobaleno", hint: "Ti attribuisce un tratto e anche il suo contrario: qualunque cosa tu sia, ci prende (Rowland: Rainbow Ruse)." },
    jacques: { label: "Frase sull'età", hint: "Una frase cucita sulla fase della vita della persona: a quarant'anni quasi tutti si chiedono se hanno preso la strada giusta (Rowland: Jacques Statement)." },
    fuzzy: { label: "Fatto sfocato", hint: "Il sensitivo dice qualcosa di vago e lascia che sia il cliente a dargli un significato preciso (Rowland: Fuzzy Fact)." },
    fishing: { label: "Pesca", hint: "Una domanda travestita da affermazione: la risposta del cliente gli dice dove andare (Hyman, regola 8)." },
    guess: { label: "Colpo probabile", hint: "Un dettaglio che sembra preciso ma è vero per tantissime persone (Rowland: Good Chance Guess)." },
    hot: { label: "Lettura a caldo", hint: "Informazioni raccolte prima, di nascosto, e poi presentate come visioni (hot reading)." },
    shotgun: { label: "Sparo a ventaglio", hint: "Tanti dettagli vaghi lanciati a un pubblico: qualcuno, per forza, si riconosce (shotgunning)." }
  };
  const TECH_KEYS = Object.keys(TECH);

  const ITEMS = [
    /* ---- tecniche dei sensitivi */
    { id: "t1", type: "tech", lv: 1, tech: "barnum", text: "«Hai molte capacità che non hai ancora sfruttato fino in fondo.»", why: "Vale per chiunque: nessuno pensa di aver già dato tutto. Nell'esperimento di Forer (1949) gli studenti diedero in media circa 4,3 su 5 a un profilo identico per tutti, preso da un libro di astrologia." },
    { id: "t2", type: "tech", lv: 1, tech: "barnum", text: "«A volte ti chiedi se hai preso la decisione giusta.»", why: "È vero per tutti gli esseri umani. Suona come un'intuizione solo perché è detto con sicurezza e rivolto a te." },
    { id: "t3", type: "tech", lv: 1, tech: "rainbow", text: "«Sai essere molto socievole, al centro della festa. Ma ci sono momenti in cui hai bisogno di stare da solo.»", why: "Socievole e solitario: un tratto e il suo contrario. Qualunque cosa tu sia, la frase ci prende." },
    { id: "t4", type: "tech", lv: 1, tech: "rainbow", text: "«Di solito sei una persona paziente, però quando ti trattano ingiustamente sai esplodere.»", why: "Paziente e capace di esplodere: copre tutti i caratteri possibili." },
    { id: "t5", type: "tech", lv: 2, tech: "rainbow", text: "«Sei una persona razionale, eppure in certe scelte segui l'istinto anche contro la logica.»", why: "Razionale e istintivo insieme: è l'arcobaleno, una frase che non può sbagliare." },
    { id: "t6", type: "tech", lv: 2, tech: "jacques", context: "A una donna sui quarantacinque anni:", text: "«Sento che sei a un punto della vita in cui ti chiedi se la strada che hai preso è davvero la tua.»", why: "È la classica crisi di mezza età: a quarantacinque anni moltissimi se lo chiedono. Il sensitivo ha solo letto l'età." },
    { id: "t7", type: "tech", lv: 2, tech: "jacques", context: "A un ragazzo di vent'anni:", text: "«C'è una scelta sul tuo futuro, studio o lavoro, che ti pesa più di quanto ammetti.»", why: "A vent'anni quasi tutti hanno una scelta così davanti. La frase è cucita sull'età, non su di lui." },
    { id: "t8", type: "tech", lv: 2, tech: "jacques", context: "A un uomo sui settant'anni:", text: "«Ultimamente ripensi spesso a una casa del passato, e a qualcuno che non c'è più.»", why: "A settant'anni quasi tutti hanno perso qualcuno e ripensano al passato: è statistica dell'età." },
    { id: "t9", type: "tech", lv: 2, tech: "fuzzy", text: "«Vedo dei documenti, qualcosa da firmare: una pratica che non è ancora chiusa.»", why: "Un mutuo, un contratto, un divorzio, una multa, l'università: il cliente sceglie da solo il significato e poi ricorda che il sensitivo «aveva visto la pratica della casa»." },
    { id: "t10", type: "tech", lv: 3, tech: "fuzzy", text: "«Sento un legame con l'estero... un paese caldo, forse il Mediterraneo, o qualcuno che ha viaggiato.»", why: "Il fatto è sfocato apposta: un parente emigrato, una vacanza, un collega straniero. È il cliente a riempire il vuoto." },
    { id: "t11", type: "tech", lv: 3, tech: "fuzzy", text: "«C'è un cambiamento in arrivo, qualcosa che riguarda il luogo dove vivi o dove lavori.»", why: "Un trasloco, un ufficio nuovo, dei lavori in casa, un collega che se ne va: qualunque cosa succeda nei prossimi mesi «era stata vista»." },
    { id: "t12", type: "tech", lv: 2, tech: "fishing", text: "«Sento qualcosa legato al lavoro... ti dice qualcosa?»", why: "È una domanda travestita: se il cliente annuisce e racconta, il sensitivo gli rimanda le sue stesse informazioni qualche minuto dopo." },
    { id: "t13", type: "tech", lv: 2, tech: "fishing", text: "«C'è un problema di salute che riguarda qualcuno vicino a te. È un uomo o una donna?»", why: "Fa una domanda e fa sembrare che l'informazione l'abbia lui. Qualunque risposta diventa una conferma." },
    { id: "t14", type: "tech", lv: 3, tech: "fishing", text: "«Perché sento così forte la figura di tuo padre?»", why: "È una domanda: è il cliente a spiegare perché. Il sensitivo raccoglie e restituisce." },
    { id: "t15", type: "tech", lv: 1, tech: "guess", text: "«Hai una scatola o un cassetto pieno di vecchie foto che non guardi da anni.»", why: "Sembra un dettaglio preciso, ma è vero in quasi tutte le case." },
    { id: "t16", type: "tech", lv: 2, tech: "guess", text: "«Da bambino hai avuto un piccolo incidente con l'acqua che ti ha spaventato.»", why: "Quasi tutti da bambini hanno bevuto acqua in piscina o al mare e si sono spaventati. Suona specifico, ma è statistica." },
    { id: "t17", type: "tech", lv: 3, tech: "guess", text: "«Hai una cicatrice sul ginocchio, una di quelle di quando eri piccolo.»", why: "Le cicatrici sulle ginocchia dell'infanzia sono comunissime: è un colpo probabile presentato come visione." },
    { id: "t18", type: "tech", lv: 1, tech: "hot", context: "Prima dello spettacolo un assistente ha letto i profili social di chi ha comprato il biglietto.", text: "«Signora in terza fila: sento una persona che ama i cavalli... e vedo un nome, Fulmine.»", why: "Non è una visione: il nome del cavallo era nelle foto pubbliche della signora. È lettura a caldo, informazione raccolta prima." },
    { id: "t19", type: "tech", lv: 2, tech: "hot", context: "Il sensitivo ha cercato il cliente su internet prima dell'appuntamento.", text: "«Sento che di recente hai cambiato lavoro, e il nuovo posto è vicino all'acqua.»", why: "Il profilo di lavoro del cliente diceva tutto, sede compresa. Chi crede nella visione non pensa di controllare." },
    { id: "t20", type: "tech", lv: 3, tech: "hot", context: "Nella sala d'attesa un collaboratore chiacchierava con i clienti, come se fosse uno di loro.", text: "«C'è qualcuno qui che sta per affrontare un intervento importante... a luglio?»", why: "Il collaboratore aveva sentito la conversazione in sala d'attesa. È lettura a caldo, anche se sembra pesca." },
    { id: "t21", type: "tech", lv: 2, tech: "shotgun", context: "A un pubblico di trecento persone:", text: "«Sento un uomo anziano, un nonno o uno zio, con un problema al petto, il cuore o i polmoni. Qualcuno l'ha perso così?»", why: "In trecento persone c'è per forza qualcuno che ha perso un parente anziano per il cuore o i polmoni. Poi il sensitivo si concentra su chi reagisce." },
    { id: "t22", type: "tech", lv: 3, tech: "shotgun", context: "A una sala piena:", text: "«C'è un anniversario a marzo... o in primavera... un compleanno, o forse una perdita.»", why: "Tre mesi, due tipi di ricorrenza, una sala intera: qualcuno si riconosce sicuramente." },
    { id: "t23", type: "tech", lv: 1, tech: "barnum", text: "«Ci tieni alla tua indipendenza e non ti piace quando sono gli altri a decidere per te.»", why: "A chi piace che decidano gli altri? Vale per tutti, ma suona come un ritratto." },
    { id: "t24", type: "tech", lv: 3, tech: "barnum", text: "«Dai molto agli altri, e non sempre ti viene riconosciuto quanto.»", why: "Quasi tutti pensano di dare più di quanto ricevono. È Barnum, con una lusinga dentro: piace, quindi non si discute." },

    /* ---- inferenze dai dettagli */
    { id: "i1", type: "infer", lv: 1, text: "Un uomo sui trentacinque anni ha una striscia di pelle più chiara attorno all'anulare sinistro, ma nessun anello.",
      options: ["Si è separato da poco.", "Di solito porta un anello che oggi non ha: può averlo tolto per lavoro, perso, o essersi separato.", "È sposato e tradisce la moglie.", "Il segno non vuol dire niente."], answer: 1,
      why: "Il segno prova un'abitudine, un anello portato a lungo, non il motivo per cui oggi non c'è. Un sensitivo direbbe «vedo una separazione»: se sbaglia nessuno se lo ricorda, se indovina sembra un miracolo." },
    { id: "i2", type: "infer", lv: 1, text: "Una donna ha calli duri sui polpastrelli della mano sinistra; le unghie della destra sono lunghe e curate, quelle della sinistra cortissime.",
      options: ["Lavora con le mani in un'officina.", "È mancina.", "Suona la chitarra, o un altro strumento a corde pizzicate.", "Si mangia le unghie della sinistra per nervosismo."], answer: 2,
      why: "Calli sulla mano che preme le corde, unghie lunghe sulla mano che pizzica: è la combinazione tipica dei chitarristi. Due indizi indipendenti che indicano la stessa cosa valgono molto più di uno." },
    { id: "i3", type: "infer", lv: 1, text: "Giacca di buona qualità, ma con i gomiti lucidi e i polsini consumati. Sul lato del mignolo destro, una macchia d'inchiostro.",
      options: ["È in difficoltà economiche.", "Passa molte ore alla scrivania appoggiato sui gomiti, e scrive a mano.", "Fa l'insegnante.", "È una persona disordinata."], answer: 1,
      why: "L'usura dice la postura e l'abitudine, l'inchiostro dice la penna. «In difficoltà economiche» è un salto: una giacca buona consumata dice soprattutto che è usata da anni. «Insegnante» è troppo preciso." },
    { id: "i4", type: "infer", lv: 1, text: "Un uomo di trent'anni con il collo largo ha le orecchie ispessite e deformate, «a cavolfiore».",
      options: ["Ha avuto un incidente stradale.", "Pratica o ha praticato a lungo uno sport di lotta o di contatto (lotta, judo, jiu-jitsu, rugby).", "Ha problemi di udito.", "Fa il buttafuori."], answer: 1,
      why: "L'orecchio «a cavolfiore» viene da colpi e sfregamenti ripetuti: è tipico degli sport di presa e di mischia. Qui un dettaglio solo permette un'inferenza forte, perché ha poche altre cause." },
    { id: "i5", type: "infer", lv: 2, text: "Mani screpolate e arrossate, unghie cortissime e senza smalto, un leggero odore di disinfettante.",
      options: ["È un'infermiera.", "Ha una malattia della pelle.", "Si lava e disinfetta le mani molto spesso: lavora probabilmente in ospedale, in uno studio medico, in una cucina o nelle pulizie.", "È ossessionata dalla pulizia."], answer: 2,
      why: "Il dettaglio dice «lavaggi frequenti», non quale mestiere. Scegliere subito una professione è il trucco del sensitivo: se ci prende sembra geniale, se no si corregge." },
    { id: "i6", type: "infer", lv: 2, text: "Abbronzatura netta su avambracci, collo e viso; sopra il gomito le braccia sono bianche.",
      options: ["È appena tornato dalle vacanze al mare.", "Passa molto tempo all'aperto con le maniche corte: per lavoro o per sport.", "Fa il muratore.", "Usa le lampade abbronzanti."], answer: 1,
      why: "Al mare ci si abbronza ovunque, con le lampade anche. Il confine sul braccio dice maglietta e tanto sole: lavoro all'aperto, ciclismo, giardinaggio. Il mestiere preciso non si può dire." },
    { id: "i7", type: "infer", lv: 1, text: "Un collega arriva in ufficio con gli occhi rossi e gonfi.",
      options: ["Ha pianto: è successo qualcosa di brutto.", "Ha dormito poco.", "Ha un'allergia.", "Da solo non dice il perché: pianto, sonno, allergia, lenti, piscina. Serve un altro indizio o una domanda."], answer: 3,
      why: "Un indizio ambiguo ha tante spiegazioni. Chi «legge» le emozioni da un segno solo sbaglia spesso. Jane combina più dettagli prima di concludere, o fa una domanda." },
    { id: "i8", type: "infer", lv: 2, text: "Sul sedile posteriore della sua auto c'è un seggiolino per bambini, impolverato e con il cartellino del prezzo ancora attaccato.",
      options: ["Ha un figlio piccolo.", "Il seggiolino non è mai stato usato: forse un bambino in arrivo, o un regalo. Non è detto che abbia figli piccoli.", "È separato e vede il figlio nei fine settimana.", "Fa il tassista."], answer: 1,
      why: "Polvere e cartellino contraddicono la lettura ovvia. I dettagli che stonano con la prima impressione sono quelli che contano di più." },
    { id: "i9", type: "infer", lv: 2, text: "Una donna guarda di continuo il telefono e sorride a ogni notifica.",
      options: ["Ha una relazione nuova.", "Sta ricevendo messaggi che le fanno piacere; il motivo, da qui, non si sa.", "È dipendente dai social.", "Ti sta ignorando apposta."], answer: 1,
      why: "L'osservazione regge fino a «messaggi che le piacciono». Il salto alla relazione nuova è quello che fa sembrare bravo un sensitivo quando indovina, e che nessuno ricorda quando sbaglia." },
    { id: "i10", type: "infer", lv: 2, text: "Scarpe da corsa costose ma consumate sul bordo esterno del tallone, polpacci asciutti, orologio sportivo con il sensore del battito.",
      options: ["Corre spesso, e da tempo.", "Ha problemi ai piedi.", "È benestante.", "È un atleta professionista."], answer: 0,
      why: "Tre indizi indipendenti nella stessa direzione: qui la conclusione può essere sicura. «Professionista» invece va oltre quello che si vede." },
    { id: "i11", type: "infer", lv: 3, text: "Un uomo dice di essere appena arrivato in treno da Milano. Piove forte da stamattina, ovunque, eppure il suo ombrello chiuso è asciutto, e anche le spalle della giacca.",
      options: ["Mente: è un ladro.", "Qualcosa non torna con il suo racconto: o è arrivato in auto fino alla porta, o è qui da più tempo di quanto dice. Va chiesto.", "Ha un ombrello che si asciuga subito.", "Nessuna conclusione: un dettaglio così non conta."], answer: 1,
      why: "Una contraddizione tra racconto e dettaglio non è una prova di colpa: è la domanda giusta da fare. Jane non accusa subito, chiede e guarda se la risposta torna." },
    { id: "i12", type: "infer", lv: 2, text: "Ha il tesserino aziendale con il cordino blu infilato nella tasca della giacca, in modo che non si legga il nome dell'azienda.",
      options: ["Lavora per i servizi segreti.", "Si vergogna del suo lavoro.", "Lavora in un posto con il badge e preferisce non mostrare dove; il perché non si sa.", "È solo un visitatore."], answer: 2,
      why: "Si sa che ha un badge e che lo nasconde. Riservatezza, abitudine, sicurezza: le ragioni sono tante, e scegliere la più romanzesca è un errore." },
    { id: "i13", type: "infer", lv: 1, text: "Peli bianchi corti sui pantaloni scuri e graffietti sottili sul dorso delle mani.",
      options: ["Vive probabilmente con un gatto, o con un animale a pelo corto e chiaro.", "Ha un cane grande.", "Lavora in un canile.", "È allergico agli animali."], answer: 0,
      why: "Peli corti e graffi sottili insieme indicano un gatto, con buona probabilità. Il «probabilmente» è parte della risposta giusta." },
    { id: "i14", type: "infer", lv: 1, text: "Ai lati del naso ha due segni rossi, ma non porta occhiali.",
      options: ["Di solito porta gli occhiali: oggi forse ha le lenti a contatto, o li ha appena tolti.", "Si è fatto male al naso.", "Ha gravi problemi di vista.", "Non vuol dire niente."], answer: 0,
      why: "I segni dei naselli sono un'abitudine visibile. Quanto veda male, invece, non si può dire." },
    { id: "i15", type: "infer", lv: 3, text: "Un uomo parla con un chiaro accento veneto, ma dice di essere nato e cresciuto a Napoli.",
      options: ["Mente sulle sue origini.", "Probabilmente ha vissuto a lungo in Veneto: l'accento dice dove si è passato tanto tempo, non per forza dove si è nati. Vale la pena chiedere.", "È un attore che imita gli accenti.", "Dagli accenti non si può dire nulla."], answer: 1,
      why: "Un accento forte dice qualcosa di vero, ma la conclusione «mente» è un salto: può essersi trasferito da piccolo, o avere i genitori veneti. Davanti a una discrepanza, prima si chiede." },
    { id: "i16", type: "infer", lv: 3, text: "Un uomo che dice di non fumare ha la punta dell'indice e del medio destri un po' gialle.",
      options: ["Mente: fuma.", "Può essere nicotina, ma anche curcuma, tinte, un vizio smesso da poco: da solo è un indizio debole. Con l'odore di fumo e un accendino in tasca diventerebbe forte.", "Ha appena sbucciato delle arance.", "Lavora con le vernici."], answer: 1,
      why: "Un indizio da solo ha più spiegazioni. Il mentalista vero conta gli indizi indipendenti: quando puntano tutti nella stessa direzione, la conclusione diventa solida." },
    { id: "i17", type: "infer", lv: 2, text: "Uno studente ha un callo sul lato del medio della mano destra, all'altezza dell'ultima falange.",
      options: ["Scrive molto a mano, stringendo forte la penna.", "È mancino.", "Suona il violino.", "Gioca molto ai videogiochi."], answer: 0,
      why: "È il «callo dello scrittore», nel punto dove appoggia la penna. Mano destra, quindi probabilmente destrorso." },
    { id: "i18", type: "infer", lv: 2, text: "Un collega che arriva sempre alle 9 in punto oggi arriva alle 9:40, con la camicia spiegazzata di ieri.",
      options: ["Ha dormito fuori casa.", "Probabilmente non è passato da casa o ha avuto una notte insolita; il motivo può essere qualunque (lavoro, ospedale, una festa, un treno perso).", "Ha litigato con la moglie.", "Lo hanno licenziato."], answer: 1,
      why: "Due dettagli dicono «notte diversa dal solito». Tutto il resto è una storia che ci si inventa: va verificata, non raccontata come certa." }
  ];

  const DIFF = [0, 640, 840, 1040];

  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(list, rand) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // costruisce l'esercizio pronto da mostrare (opzioni mescolate)
  function build(raw, seed) {
    const rand = rng(seed);
    if (raw.type === "tech") {
      const others = shuffle(TECH_KEYS.filter((k) => k !== raw.tech), rand).slice(0, 3);
      const keys = shuffle(others.concat([raw.tech]), rand);
      return { kind: "read", id: raw.id, type: "tech", level: raw.lv, diff: DIFF[raw.lv], context: raw.context || "", text: raw.text, options: keys.map((k) => TECH[k].label), keys, answer: keys.indexOf(raw.tech), why: raw.why, hint: TECH[raw.tech].hint };
    }
    const order = shuffle([0, 1, 2, 3], rand);
    return { kind: "read", id: raw.id, type: "infer", level: raw.lv, diff: DIFF[raw.lv], context: "", text: raw.text, options: order.map((i) => raw.options[i]), answer: order.indexOf(raw.answer), why: raw.why };
  }
  // sceglie un esercizio del livello (alternando i due tipi), evitando quelli gia' usati nel turno
  function pickItem(level, seed, used) {
    const rand = rng(seed);
    const L = Math.max(1, Math.min(3, level | 0 || 1));
    const type = (used || []).length % 2 === 0 ? (rand() < 0.5 ? "tech" : "infer") : (ITEMS.find((x) => x.id === used[used.length - 1]) || {}).type === "tech" ? "infer" : "tech";
    let pool = ITEMS.filter((x) => x.lv === L && x.type === type && !(used || []).includes(x.id));
    if (!pool.length) pool = ITEMS.filter((x) => Math.abs(x.lv - L) <= 1 && !(used || []).includes(x.id));
    if (!pool.length) pool = ITEMS.filter((x) => !(used || []).includes(x.id));
    if (!pool.length) pool = ITEMS;
    const raw = pool[Math.floor(rand() * pool.length)];
    return build(raw, (seed ^ 0x9e3779b9) >>> 0);
  }

  const api = { TECH, TECH_KEYS, ITEMS, DIFF, build, pickItem };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MentalistReading = api;
})(typeof window !== "undefined" ? window : globalThis);
