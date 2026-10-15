/*
 * Progetto A - Difesa: riferimenti a Lookism (webtoon di Taejun Pak) per il "metodo Johan Seong".
 * Solo fatti sul webtoon verificati su wiki dei fan (Lookism fandom, namu.wiki, MyAnimeList),
 * scritti con parole nostre: niente battute citate, niente immagini dei personaggi.
 * - method: i quattro passi del metodo (come li fa l'app)
 * - johan: fatti brevi su Johan Seong
 * - roster: chi usa quale arte marziale in Lookism e cosa copiarne davvero in palestra
 * - styles: la scheda "In Lookism" di ogni disciplina dell'app
 * - ranks: il rango, dalla media di quanto hai copiato di tutti gli stili
 */
window.MartialLookism = {
  intro: "In Lookism Johan Seong impara una tecnica dopo averla vista una volta. Ma anche nel webtoon una copia senza il corpo per reggerla vale meno dell'originale. Nella realtà nessuno copia al primo sguardo: si copia guardando con attenzione, ripetendo lento, poi veloce, poi sotto fatica, e costruendo il fisico che serve. Questo metodo fa proprio questo, uno stile al giorno, e alla fine di ogni livello ti mette alla prova.",
  method: [
    { title: "Osserva", text: "Ogni tecnica ha un riquadro «Osserva» con due o tre dettagli da guardare nel video, uno per visione. Johan guarda una volta; tu guarda finché quei dettagli li vedi davvero." },
    { title: "Copia", text: "Ripetizioni lente allo specchio con i punti chiave, poi a velocità media senza perdere la forma. Filmati col telefono: il video non mente." },
    { title: "Ripeti", text: "La sessione Ripeti porta la tecnica dentro drill e combinazioni, sotto fatica, insieme al ripasso dei livelli precedenti e al condizionamento che dà alla copia un corpo." },
    { title: "Fallo tuo", text: "Round con un compito diverso ogni volta, poi liberi. La Prova del livello ti dice se l'hai copiata davvero; poi decidi tu se salire." }
  ],
  johan: [
    "Impara una tecnica dopo averla vista una sola volta: è il talento della copia, che nel webtoon ha anche Daniel Park.",
    "La sua base è la boxe: ha copiato il jab di Zack (Lee Jin Sung) guardandolo una volta, ed era più veloce di lui.",
    "Ha battuto Zack nel campionato di boxe delle medie.",
    "Nel webtoon copia anche altri stili, tra cui la Muay Thai di Vasco e il karate Kyokushin e l'aikido di Gun.",
    "Il suo limite: una copia senza il fisico per reggerla è più debole dell'originale.",
    "È il capo della crew God Dog."
  ],
  roster: [
    {
      name: "Johan Seong",
      style: "Copia: boxe come base, poi molti stili",
      styles: ["boxe", "muaythai", "karate"],
      note: "Vede una tecnica una volta e la rifà. La boxe l'ha presa da Zack guardandolo tirare il jab; poi ha copiato tra gli altri la Muay Thai di Vasco e il Kyokushin di Gun.",
      copy: "Il modo di guardare: un dettaglio per volta (piedi, anche, spalle, ritorno), poi lo rifai lento finché è uguale al video. E il fisico che regge la copia: per questo c'è il condizionamento."
    },
    {
      name: "Zack Lee",
      style: "Boxe, out-boxer",
      styles: ["boxe"],
      note: "Pugile veloce: colpisce ed esce, combinazioni rapide di pugni dritti, gambe e testa sempre in movimento. Usa la Philly shell con lo shoulder roll e i contrattacchi. Con Gongseob Ji ha aggiunto la potenza da corta distanza.",
      copy: "Il jab doppio con uscita laterale, lo shoulder roll e il contrattacco del livello 5 di boxe, i round lunghi a ritmo alto."
    },
    {
      name: "Gongseob Ji",
      style: "Boxe e lotta",
      styles: ["boxe", "lotta"],
      note: "Re di prima generazione di Daegu e maestro di Zack: gli ha dato resistenza, velocità e testa. Combatte unendo boxe e lotta.",
      copy: "Il condizionamento serio e il lavoro in corta distanza; dalla lotta, sprawl e cambi di livello."
    },
    {
      name: "Vasco",
      style: "Muay Thai",
      styles: ["muaythai"],
      note: "La Muay Thai gliel'ha insegnata Brekdak, un ex campione thailandese: in suo onore Vasco porta il mongkol rosso sulla testa.",
      copy: "Teep, ginocchiate e guardia alta dei primi livelli di Muay Thai, poi il clinch del livello 4."
    },
    {
      name: "Gun Park",
      style: "Karate Kyokushin, aikido, kudo",
      styles: ["karate"],
      note: "Cresciuto da Tom Lee ed erede di un clan yakuza, combatte con il karate Kyokushin, a contatto pieno, e conosce anche aikido e kudo.",
      copy: "Il livello 5 di karate è tutto Kyokushin: pugni al corpo a catena, calcio basso, un tronco che incassa."
    },
    {
      name: "Jay Hong",
      style: "Systema e Kali",
      styles: ["systema"],
      note: "Combina il Systema, arte marziale russa insegnata anche alle forze speciali, con l'Arnis/Kali filippino (bastoni e armi). Aveva mollato l'allenamento con Sophia Alexander perché troppo duro, poi è tornato a finirlo.",
      copy: "Respiro e rilassamento sotto sforzo, colpi sciolti che attraversano, cadute e rotolamenti, il bastone del livello 6."
    },
    {
      name: "Sophia Alexander",
      style: "Systema",
      styles: ["systema"],
      note: "La guardia del corpo di Steve Hong, il padre di Jay. Ha insegnato il Systema a Jay e a Daniel.",
      copy: "La costanza: Jay ce l'ha fatta solo tornando ad allenarsi dopo aver mollato."
    },
    {
      name: "Daniel Park",
      style: "Copia",
      styles: ["boxe", "karate", "systema"],
      note: "Ha lo stesso talento di Johan: ha copiato la boxe di Zack, il Kyokushin e l'aikido di Gun, il Systema di Sophia.",
      copy: "Copiare da più maestri e poi fonderli: è il lavoro del livello 6 di ogni stile, quello dello stile personale."
    },
    {
      name: "Mandeok",
      style: "Capoeira",
      styles: ["capoeira"],
      note: "Combattente dei Workers che usa la capoeira; Johan e Daniel l'hanno copiata.",
      copy: "Ginga, esquivas e calci girati con il perno sull'avampiede: la capoeira si copia prima di tutto con il ritmo."
    },
    {
      name: "Mary Kim",
      style: "Judo",
      styles: ["sambo"],
      note: "Judoka, chiamata l'imperatrice dei due secondi per le proiezioni con cui chiude in fretta.",
      copy: "Entrate di proiezione rapide e cadute sicure: nel sambo, nato anche dal judo, le trovi dai livelli 1 e 2."
    },
    {
      name: "Vin Jin",
      style: "Ssireum e lotta",
      styles: ["lotta"],
      note: "Viene dal ssireum, la lotta tradizionale coreana, e usa anche lotta, judo e kudo.",
      copy: "Posizione bassa, prese e cambi di livello: la base della lotta dei livelli 1 e 2."
    },
    {
      name: "Warren Chae",
      style: "Jeet Kune Do e CQC",
      styles: ["kungfu"],
      note: "Usa il Jeet Kune Do e il combattimento ravvicinato (CQC). Il Jeet Kune Do l'ha fondato Bruce Lee, che aveva cominciato dal Wing Chun.",
      copy: "La linea centrale e i colpi corti e diretti del Wing Chun, la radice del suo stile."
    },
    {
      name: "Eli Jang",
      style: "Stile selvaggio, aikido",
      styles: [],
      note: "Combatte d'istinto, come un animale; l'aikido gliel'ha insegnato Gun e Tom Lee lo ha riallenato da zero.",
      copy: "Non lo stile da strada: la lezione è che anche l'istinto va riallenato dalle basi."
    }
  ],
  styles: {
    boxe: {
      who: "Zack Lee, Johan Seong, Gongseob Ji",
      text: "Zack è un out-boxer: velocità, colpisci ed esci, dritti in combinazione, gioco di gambe e testa, Philly shell e contrattacchi. Johan ha copiato il suo jab dopo averlo visto una volta. Gongseob Ji, maestro di Zack, gli ha dato resistenza e potenza.",
      copy: "Livello 1: il jab come lo ha copiato Johan. Livello 5: lo stile di Zack, con lo shoulder roll e il contrattacco, e la scuola sovietica di gambe e distanza."
    },
    muaythai: {
      who: "Vasco",
      text: "Vasco combatte con la Muay Thai che gli ha insegnato Brekdak, ex campione thailandese, e porta il mongkol rosso in suo onore. Johan e Daniel l'hanno copiata.",
      copy: "Guardia alta, teep e ginocchiate dei primi livelli; poi calcio circolare, gomiti e clinch."
    },
    taekwondo: {
      who: "Nessuno come stile principale",
      text: "In Lookism il taekwondo non è lo stile principale di nessuno: i suoi calci compaiono soprattutto come tecniche copiate, da Johan e da Daniel.",
      copy: "Qui il taekwondo lo costruisci dalle basi: caricamento, perno, calci in sequenza, poi i calci girati con i loro preparatori."
    },
    karate: {
      who: "Gun Park",
      text: "Gun combatte con il karate Kyokushin, a contatto pieno, e conosce anche aikido e kudo. Daniel e Johan hanno copiato il suo Kyokushin.",
      copy: "Kihon e kata per la forma, poi il livello 5 tutto Kyokushin: pugni al corpo, calcio basso, condizionamento."
    },
    capoeira: {
      who: "Mandeok",
      text: "Nei Workers Mandeok combatte con la capoeira; Johan e Daniel l'hanno copiata.",
      copy: "La ginga e il ritmo prima di tutto, poi calci girati e gioco basso."
    },
    lotta: {
      who: "Gongseob Ji e Vin Jin",
      text: "Gongseob Ji, il maestro di Zack, unisce boxe e lotta. Vin Jin viene dal ssireum, la lotta coreana, e usa anche lotta e judo.",
      copy: "Posizione, cambio di livello, sprawl e catene in piedi: quello che serve per non finire a terra e per portarci gli altri."
    },
    kungfu: {
      who: "Nessuno: lo copi tu per primo",
      text: "Nessun personaggio usa il Wing Chun. Il più vicino è Warren Chae con il Jeet Kune Do, l'arte che Bruce Lee ha fondato partendo dal Wing Chun.",
      copy: "Linea centrale, pugno a catena, mani che difendono e attaccano insieme."
    },
    systema: {
      who: "Jay Hong e Sophia Alexander",
      text: "Jay usa il Systema, l'arte marziale russa insegnata anche alle forze speciali, insieme al Kali filippino. Gliel'ha insegnato Sophia Alexander, che l'ha passato anche a Daniel. È l'unico stile russo del webtoon.",
      copy: "Respiro che guida il movimento, rilassamento, colpi sciolti, cadute e rotolamenti, lavoro libero contro più attaccanti immaginari."
    },
    sambo: {
      who: "Nessuno: la scuola sovietica e il judo di Mary Kim",
      text: "Il sambo non compare in Lookism: l'unico stile russo è il Systema di Jay. Ma il sambo è nato in URSS anche dal judo, quello di Mary Kim, l'imperatrice dei due secondi.",
      copy: "Entrate rapide di proiezione, cadute sicure, controllo a terra: le basi che il sambo ha preso dal judo."
    }
  },
  ranks: [
    { min: 0, name: "Nuovo arrivato", text: "Hai appena cominciato a guardare. Il primo livello di ogni stile è la porta." },
    { min: 5, name: "Allievo", text: "I primi livelli sono passati: le basi cominciano a restare." },
    { min: 15, name: "Combattente di strada", text: "Ti muovi e colpisci in più stili. Ora conta la pulizia." },
    { min: 30, name: "Membro di crew", text: "Le tecniche ti escono senza pensarci in quasi tutti gli stili." },
    { min: 50, name: "Capo crew", text: "Metà di tutto quello che c'è da copiare è tuo." },
    { min: 70, name: "Re", text: "Pochi arrivano qui: molti stili copiati fino in fondo." },
    { min: 95, name: "Occhio di Johan", text: "Hai copiato quasi tutto. Adesso fallo tuo." }
  ]
};
