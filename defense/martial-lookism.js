/*
 * Progetto A - Difesa: riferimenti a Lookism (webtoon di Taejun Pak) per il "metodo Johan Seong".
 * Solo fatti verificati sul webtoon, scritti con parole nostre: niente battute citate, niente immagini.
 * - method: i quattro passi del metodo (come li fa l'app)
 * - johan: fatti brevi su Johan Seong
 * - roster: chi usa quale arte marziale in Lookism e cosa copiarne davvero in palestra
 * - styles: la scheda "In Lookism" di ogni disciplina dell'app
 * - ranks: il rango, dalla media di quanto hai copiato di tutti gli stili
 */
window.MartialLookism = {
  intro: "In Lookism Johan Seong impara una tecnica dopo averla vista una volta. Nella realtà nessuno copia al primo sguardo: si copia guardando con attenzione, ripetendo lento, poi veloce, poi sotto fatica. Questo metodo fa proprio questo, uno stile al giorno, e alla fine di ogni livello ti mette alla prova.",
  method: [
    { title: "Osserva", text: "Ogni tecnica ha un riquadro «Osserva» con due o tre dettagli da guardare nel video, uno per visione. Johan guarda una volta; tu guarda finché quei dettagli li vedi davvero." },
    { title: "Copia", text: "Ripetizioni lente allo specchio con i punti chiave, poi a velocità media senza perdere la forma. Filmati col telefono: il video non mente." },
    { title: "Ripeti", text: "La sessione Ripeti porta la tecnica dentro drill e combinazioni, sotto fatica, insieme al ripasso dei livelli precedenti." },
    { title: "Fallo tuo", text: "Round con un compito diverso ogni volta, poi liberi. La Prova del livello ti dice se l'hai copiata davvero; poi decidi tu se salire." }
  ],
  johan: [
    "Impara una tecnica dopo averla vista una sola volta.",
    "Ha imparato il jab di Zack (Lee Jin Sung) guardandolo una volta, ed era più veloce di lui.",
    "Ha battuto Zack nel campionato di boxe delle medie.",
    "Oltre alla boxe usa l'aikido.",
    "È il capo della crew God Dog."
  ],
  roster: [
    {
      name: "Johan Seong",
      style: "Copia di qualsiasi stile, boxe, aikido",
      styles: ["boxe"],
      note: "Il suo talento è copiare: vede una tecnica una volta e la rifà. La boxe l'ha presa da Zack guardandolo tirare il jab.",
      copy: "Il modo di guardare: un dettaglio per volta (piedi, anche, spalle, ritorno), poi lo rifai lento finché è uguale al video."
    },
    {
      name: "Zack Lee",
      style: "Boxe, out-boxer",
      styles: ["boxe"],
      note: "Pugile veloce: colpisce ed esce, combinazioni rapide di pugni dritti, pochi colpi al corpo, gambe e testa sempre in movimento. Usa la Philly shell e i contrattacchi. Si è allenato con Gongseob Ji, re di prima generazione di Daegu, su resistenza, velocità e testa.",
      copy: "Il jab doppio con uscita laterale, lo shoulder roll del livello 5 di boxe e i round lunghi a ritmo alto."
    },
    {
      name: "Jay Hong",
      style: "Systema e Kali",
      styles: ["systema"],
      note: "Combina il Systema, arte marziale russa insegnata anche alle forze speciali, con l'Arnis/Kali filippino (bastoni e armi). Ha completato l'allenamento con Sophia Alexander, la guardia del corpo di suo padre.",
      copy: "Respiro e rilassamento sotto sforzo, colpi sciolti che attraversano, cadute e rotolamenti per tornare in piedi."
    },
    {
      name: "Mary Kim",
      style: "Judo",
      styles: ["sambo"],
      note: "Judoka, chiamata l'imperatrice dei due secondi per quanto chiude in fretta.",
      copy: "Entrate di proiezione rapide e cadute sicure: nel sambo, che è nato anche dal judo, le trovi dai livelli 1 e 2."
    },
    {
      name: "Eli Jang",
      style: "Stile selvaggio, aikido",
      styles: [],
      note: "Combatte d'istinto, come un animale; l'aikido gliel'ha insegnato Gun e Tom Lee lo ha riallenato da zero.",
      copy: "Non lo stile da strada: la lezione è che anche l'istinto va riallenato dalle basi."
    },
    {
      name: "Jinyoung Park",
      style: "Copia",
      styles: [],
      note: "Come Johan, rifà qualsiasi tecnica vista una volta.",
      copy: "Lo stesso metodo: guardare con un obiettivo preciso prima di provare."
    }
  ],
  styles: {
    boxe: {
      who: "Zack Lee e Johan Seong",
      text: "Zack è un out-boxer: velocità, colpisci-e-esci, dritti in combinazione, gioco di gambe e testa, Philly shell e contrattacchi. Johan ha copiato il suo jab dopo averlo visto una volta.",
      copy: "Livello 1: il jab come lo ha copiato Johan. Livello 5: lo stile di Zack, con lo shoulder roll e il contrattacco."
    },
    systema: {
      who: "Jay Hong",
      text: "Jay usa il Systema, l'arte marziale russa insegnata anche alle forze speciali, insieme al Kali filippino. Ha finito l'allenamento con Sophia Alexander.",
      copy: "Respiro che guida il movimento, rilassamento, colpi sciolti, cadute e rotolamenti, lavoro libero contro più attaccanti immaginari."
    },
    sambo: {
      who: "La scuola sovietica (e il judo di Mary Kim)",
      text: "Il sambo è nato in URSS anche dal judo. In Lookism Mary Kim è la judoka che chiude in due secondi.",
      copy: "Entrate rapide di proiezione, cadute sicure, controllo a terra: le basi del sambo arrivano dal judo."
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
