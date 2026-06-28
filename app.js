const STORAGE_KEY = "metodoIntegraleState";
const SUPABASE_REST_URL = "https://qrzwuyowoaputrqprnuh.supabase.co/rest/v1";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyend1eW93b2FwdXRycXBybnVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTk1NTIsImV4cCI6MjA5MzY3NTU1Mn0.QUC0xqpn7IJRuxUkBbLUXS7Sl9MxOCiQYZvVueOpzb4";
const SUPABASE_TABLE_CANDIDATES = {
  games: ["chess_games"],
  moves: ["chess_moves", "chess_move", "scacchi_mosse", "mosse_scacchi", "mosse", "moves"],
  analyses: ["chess_analysis"],
  exercises: ["chess_exercises"]
};

let supabaseSchemaPromise = null;
let supabaseSchema = null;
let supabaseTableCache = {};
let supabaseWriteQueue = Promise.resolve();

const defaultState = {
  completedDays: 0,
  studied: [],
  mistakeCounts: {
    concentration: 0,
    hangingPiece: 0,
    calculation: 0,
    missedThreat: 0,
    development: 0,
    kingSafety: 0,
    noPlan: 0,
    weakEndgame: 0
  },
  socialScores: {
    clarity: 35,
    context: 35,
    ethics: 45,
    empathy: 35,
    assertiveness: 35,
    leverage: 30,
    risk: 35,
    timing: 35,
    contingency: 25
  },
  chess: {
    botLevel: 2,
    games: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    lastAccuracy: 0,
    levelStats: {}
  },
  planScores: [],
  defenseLevel: 1,
  reflexBest: null,
  logicSolved: 0,
  logicAttempts: 0,
  memory: {
    level: 1,
    attempts: 0,
    correct: 0,
    best: 0
  },
  influence: {
    attempts: 0,
    average: 35
  },
  aesthetic: {
    score: 0,
    streak: 0,
    lastCompleted: []
  },
  currentTopicId: null
};

defaultState.moduleMetrics = {
  chess: { lucidita: 35, efficacia: 35, rischio: 45, controllo: 35, adattamento: 35, ragionamento: 35, sostenibilita: 45, tempo: 35 },
  scenarios: { lucidita: 35, efficacia: 35, rischio: 35, controllo: 35, adattamento: 35, ragionamento: 35, sostenibilita: 35, tempo: 35 },
  culture: { lucidita: 35, efficacia: 35, rischio: 60, controllo: 35, adattamento: 35, ragionamento: 35, sostenibilita: 35, tempo: 35 },
  planning: { lucidita: 35, efficacia: 35, rischio: 35, controllo: 35, adattamento: 35, ragionamento: 35, sostenibilita: 35, tempo: 35 },
  defense: { lucidita: 35, efficacia: 35, rischio: 45, controllo: 35, adattamento: 35, ragionamento: 30, sostenibilita: 35, tempo: 35 },
  logic: { lucidita: 35, efficacia: 35, rischio: 60, controllo: 35, adattamento: 35, ragionamento: 35, sostenibilita: 35, tempo: 35 },
  memory: { lucidita: 35, efficacia: 35, rischio: 60, controllo: 35, adattamento: 35, ragionamento: 35, sostenibilita: 35, tempo: 35 },
  influence: { lucidita: 35, efficacia: 35, rischio: 35, controllo: 35, adattamento: 35, ragionamento: 35, sostenibilita: 35, tempo: 35 },
  aesthetic: { lucidita: 35, efficacia: 35, rischio: 60, controllo: 35, adattamento: 35, ragionamento: 30, sostenibilita: 35, tempo: 35 }
};

defaultState.cultureReviews = [];
defaultState.modulePatterns = {
  chess: {},
  scenarios: {},
  culture: {},
  planning: {},
  defense: {},
  logic: {},
  memory: {},
  influence: {},
  aesthetic: {}
};

const routes = [
  "dashboard",
  "chess",
  "scenarios",
  "culture",
  "planning",
  "defense",
  "logic",
  "memory",
  "influence",
  "aesthetic"
];

const pieceValues = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0
};

const pieceNames = {
  P: "pedone bianco",
  N: "cavallo bianco",
  B: "alfiere bianco",
  R: "torre bianca",
  Q: "regina bianca",
  K: "re bianco",
  p: "pedone nero",
  n: "cavallo nero",
  b: "alfiere nero",
  r: "torre nera",
  q: "regina nera",
  k: "re nero"
};

const mistakeLabels = {
  concentration: "Impulsività",
  hangingPiece: "Pezzi appesi",
  calculation: "Calcolo incompleto",
  missedThreat: "Mancato controllo minacce",
  development: "Sviluppo lento",
  kingSafety: "Sicurezza re",
  noPlan: "Mancanza di piano",
  weakEndgame: "Finale debole"
};

const mistakeDrills = {
  concentration: "Drill anti-impulso: prima di muovere trova 3 candidate, 2 minacce avversarie e 1 motivo per non giocare subito.",
  hangingPiece: "Drill pezzi appesi: per 10 posizioni controlla ogni pezzo di valore, chi lo attacca, chi lo difende e cosa succede dopo una cattura.",
  calculation: "Drill varianti corte: calcola la tua mossa, la risposta piu' forzante avversaria e la tua replica. Non muovere finche' non vedi tre mezze mosse.",
  missedThreat: "Drill minacce: prima di muovere scrivi 2 minacce avversarie e 2 mosse candidate che le neutralizzano.",
  development: "Drill sviluppo: nelle prime 8 mosse porta fuori pezzi leggeri, collega le torri quando possibile e non muovere lo stesso pezzo due volte senza guadagno.",
  kingSafety: "Drill sicurezza re: prima di attaccare controlla colonne aperte, diagonali verso il re, case deboli e pezzi difensivi mancanti.",
  noPlan: "Drill piano: prima di muovere scrivi mentalmente il tuo obiettivo di 3 mosse: migliorare pezzo, creare minaccia, ridurre debolezza.",
  weakEndgame: "Drill finale: in ogni finale controlla attività del re, pedoni deboli, opposizione e conversione prima di spingere pedoni."
};

const chessPatternOrder = ["hangingPiece", "calculation", "concentration", "missedThreat", "kingSafety", "development", "noPlan", "weakEndgame"];

const botLevels = [
  { level: 1, name: "Principiante assoluto", description: "Errori frequenti, pezzi appesi e mosse passive.", estimatedElo: 250, skillLevel: 0, depth: 1, moveTimeMs: 50, mistakeRatePercent: 60, blunderRatePercent: 40, randomMovePercent: 30, topN: 5, noiseCp: 260 },
  { level: 2, name: "Novizio", description: "Vede poco le minacce e sbaglia tattiche semplici.", estimatedElo: 400, skillLevel: 1, depth: 1, moveTimeMs: 80, mistakeRatePercent: 52, blunderRatePercent: 32, randomMovePercent: 24, topN: 5, noiseCp: 220 },
  { level: 3, name: "Base", description: "Sviluppo irregolare e calcolo molto corto.", estimatedElo: 550, skillLevel: 2, depth: 2, moveTimeMs: 120, mistakeRatePercent: 44, blunderRatePercent: 24, randomMovePercent: 18, topN: 5, noiseCp: 180 },
  { level: 4, name: "Principiante", description: "Mosse naturali ma tattica ancora fragile.", estimatedElo: 700, skillLevel: 3, depth: 2, moveTimeMs: 180, mistakeRatePercent: 36, blunderRatePercent: 18, randomMovePercent: 13, topN: 5, noiseCp: 150 },
  { level: 5, name: "Intermedio basso", description: "Meno blunder, piani ancora instabili.", estimatedElo: 850, skillLevel: 4, depth: 3, moveTimeMs: 250, mistakeRatePercent: 30, blunderRatePercent: 13, randomMovePercent: 9, topN: 5, noiseCp: 120 },
  { level: 6, name: "Intermedio", description: "Sviluppa meglio ma sbaglia cambi e finali.", estimatedElo: 1000, skillLevel: 5, depth: 4, moveTimeMs: 350, mistakeRatePercent: 24, blunderRatePercent: 9, randomMovePercent: 6, topN: 5, noiseCp: 95 },
  { level: 7, name: "Buon principiante", description: "Manca tattiche da 2-3 mosse e piani lunghi.", estimatedElo: 1150, skillLevel: 5, depth: 4, moveTimeMs: 350, mistakeRatePercent: 26, blunderRatePercent: 8, randomMovePercent: 8, topN: 6, noiseCp: 130 },
  { level: 8, name: "Intermedio forte", description: "Gioco discreto, ma sbaglia ancora piani e tattiche corte.", estimatedElo: 1300, skillLevel: 6, depth: 4, moveTimeMs: 500, mistakeRatePercent: 20, blunderRatePercent: 4, randomMovePercent: 5, topN: 5, noiseCp: 90 },
  { level: 9, name: "Club basso", description: "1450 realistico: sa giocare, ma non ha precisione da motore.", estimatedElo: 1450, skillLevel: 8, depth: 5, moveTimeMs: 650, mistakeRatePercent: 17, blunderRatePercent: 2, randomMovePercent: 3, topN: 5, noiseCp: 70 },
  { level: 10, name: "Club", description: "1600 realistico: forte, ma con imprecisioni strategiche vere.", estimatedElo: 1600, skillLevel: 9, depth: 6, moveTimeMs: 750, mistakeRatePercent: 14, blunderRatePercent: 2, randomMovePercent: 2, topN: 4, noiseCp: 55 },
  { level: 11, name: "Avanzato", description: "Forte ma non perfetto, scelte quasi sempre sane.", estimatedElo: 1800, skillLevel: 11, depth: 7, moveTimeMs: 900, mistakeRatePercent: 9, blunderRatePercent: 1, randomMovePercent: 1, topN: 4, noiseCp: 45 },
  { level: 12, name: "Esperto", description: "Molto preciso, pochi errori non forzati.", estimatedElo: 2000, skillLevel: 14, depth: 10, moveTimeMs: 1200, mistakeRatePercent: 4, blunderRatePercent: 0, randomMovePercent: 0, topN: 3, noiseCp: 18 },
  { level: 13, name: "Maestro", description: "Quasi sempre tra le migliori linee Stockfish.", estimatedElo: 2300, skillLevel: 17, depth: 14, moveTimeMs: 2200, mistakeRatePercent: 1, blunderRatePercent: 0, randomMovePercent: 0, topN: 2, noiseCp: 3 },
  { level: 14, name: "Super Maestro", description: "Comportamento quasi da motore.", estimatedElo: 2800, skillLevel: 20, depth: 20, moveTimeMs: 3500, mistakeRatePercent: 0, blunderRatePercent: 0, randomMovePercent: 0, topN: 1, noiseCp: 0 },
  { level: 15, name: "Imbattibile", description: "Massima forza disponibile nel browser.", estimatedElo: 3500, skillLevel: 20, depth: 24, moveTimeMs: 6000, mistakeRatePercent: 0, blunderRatePercent: 0, randomMovePercent: 0, topN: 1, noiseCp: 0 }
];

const botLevelProfiles = Object.fromEntries(botLevels.map((level) => [level.level, { elo: level.estimatedElo, displayElo: level.displayElo || String(level.estimatedElo), label: level.name, description: level.description }]));
const botLevelSpecs = Object.fromEntries(botLevels.map((level) => [level.level, { mode: "Stockfish", depth: level.depth, timeMs: level.moveTimeMs, moveTimeMs: level.moveTimeMs, topN: level.topN, noiseCp: level.noiseCp, skillLevel: level.skillLevel, mistakeRatePercent: level.mistakeRatePercent, blunderRatePercent: level.blunderRatePercent, randomMovePercent: level.randomMovePercent }]));

const STOCKFISH_ENGINE_ENABLED = true;
const CHESS_REVIEW_DEPTH = 14;
const CHESS_REVIEW_TIME_MS = 1800;
const CHESS_REVIEW_MULTIPV = 5;
const STOCKFISH_REQUIRED_NOTICE = "Stockfish non disponibile: il bot non muove con euristiche finte. Avvia il server locale e ricarica la pagina per usare il motore.";
const STOCKFISH_WORKER_SOURCES = [
  { label: "Stockfish WASM locale", url: "stockfish-wasm-worker.js", remote: false },
  { label: "Stockfish ASM locale", url: "stockfish-worker.js", remote: false },
  { label: "Stockfish ASM diretto", url: "stockfish-asm.js", remote: false }
];

const botAccuracyRanges = botLevels.map((level) => {
  const targets = {
    1: [30, 42], 2: [38, 48], 3: [44, 54], 4: [50, 58], 5: [55, 64],
    6: [60, 69], 7: [65, 73], 8: [69, 76], 9: [72, 80], 10: [75, 82],
    11: [80, 86], 12: [84, 90], 13: [88, 94], 14: [94, 97], 15: [97, 99]
  };
  const [min, max] = targets[level.level];
  return { elo: level.estimatedElo, level: level.level, min, max };
});

const moveQualityMeta = {
  book: { label: "Mossa da libro", icon: "📖", report: "Libro" },
  best: { label: "Migliore", icon: "★", report: "Migliore" },
  great: { label: "Grande", icon: "!", report: "Grande" },
  brilliant: { label: "Brillante", icon: "!!", report: "Brillante" },
  excellent: { label: "Ottima", icon: "!", report: "Ottima" },
  good: { label: "Buona", icon: "✓", report: "Buona" },
  inaccuracy: { label: "Imprecisione", icon: "?!", report: "Imprecisione" },
  inexact: { label: "Imprecisione", icon: "?!", report: "Imprecisione" },
  mistake: { label: "Errore", icon: "?", report: "Errore" },
  blunder: { label: "Blunder", icon: "??", report: "Blunder" },
  missed: { label: "Mossa mancata", icon: "X", report: "Mossa mancata" },
  unknown: { label: "Analisi non disponibile", icon: "-", report: "Unknown" },
  bot: { label: "Risposta bot", icon: "B", report: "Bot" }
};

Object.assign(moveQualityMeta.book, { icon: "\ud83d\udcd6" });
Object.assign(moveQualityMeta.best, { icon: "\u2605" });
Object.assign(moveQualityMeta.great, { label: "Grande", report: "Grande" });
Object.assign(moveQualityMeta.good, { icon: "\u2713" });
Object.assign(moveQualityMeta.blunder, { label: "Blunder", report: "Blunder" });

function getMoveQualityMeta(quality) {
  return moveQualityMeta[quality] || (quality === "inaccuracy" ? moveQualityMeta.inaccuracy : null) || moveQualityMeta.good;
}

const dailyPlans = [
  [
    "Scacchi: una partita lenta e revisione di almeno 6 mosse.",
    "Memoria: un esercizio di richiamo attivo.",
    "Cultura: un argomento completo e risposta alla domanda.",
    "Estetica: completa almeno 5 punti della checklist."
  ],
  [
    "Scenari: una risposta libera con piano B.",
    "Difesa: un drill tecnico piu' 5 bersagli riflessi.",
    "Logica: un indovinello e spiegazione a voce.",
    "Piani: scrivi un piano tuo e fallo valutare."
  ],
  [
    "Influenza: studia una tattica e descrivi un uso pulito.",
    "Scacchi: cerca solo minacce e pezzi indifesi.",
    "Cultura: storia, geografia o economia.",
    "Memoria: prova a battere il livello precedente."
  ]
];

const scenarios = [
  {
    type: "Pressione sociale",
    title: "Il gruppo ride mentre una persona ti sminuisce",
    text: "Durante una conversazione, una persona fa battute ripetute su di te e gli altri ridono. La situazione non e' apertamente violenta, ma sta creando una gerarchia sociale contro di te. Scrivi cosa osservi, cosa dici, cosa fai se continua e come eviti di sembrare impulsivo.",
    model: "Osservo chi ride per abitudine e chi sta guidando la pressione. Rispondo breve e fermo: 'La battuta e' chiara, ora basta. Se vuoi parlare di me, fallo seriamente.' Se continua, smetto di nutrire la scena e parlo con una persona chiave a parte.",
    ideal: ["osservo", "chi", "fermo", "basta", "continua", "a parte", "serio", "pubblico"],
    traps: ["insulto", "urlo", "vendetta", "minaccia"]
  },
  {
    type: "Negoziazione",
    title: "Devi convincere un gruppo senza sembrare autoritario",
    text: "Un gruppo deve lavorare, ma tutti rimandano. Tu vuoi guidare senza essere percepito come quello che comanda. Scrivi un intervento che crei direzione, ruoli, tempi e responsabilita'.",
    model: "Propongo una divisione semplice: 'Abbiamo 40 minuti. Io prendo struttura e consegna, tu fonti, tu esempi. Alle 18:20 uniamo tutto e vediamo cosa manca.' Chiedo conferma, non ordino a freddo.",
    ideal: ["ruoli", "tempo", "conferma", "divisione", "manca", "consegna", "propongo"],
    traps: ["comando", "minaccio", "zitti", "obbligo"]
  },
  {
    type: "Conflitto ambiguo",
    title: "Qualcuno ti ignora apposta o forse no",
    text: "Una persona risponde in modo freddo e tu sospetti che voglia escluderti. Non hai prove solide. Scrivi come verifichi la realta' senza accusare subito e senza farti trattare da invisibile.",
    model: "Prima raccolgo due segnali concreti. Poi chiedo in privato: 'Ho notato che nelle ultime due volte hai tagliato corto. C'e' qualcosa da chiarire o sto leggendo male?' Se evita, riduco investimento e mantengo educazione.",
    ideal: ["prove", "segnali", "privato", "notato", "chiarire", "leggendo male", "riduci"],
    traps: ["accuso", "spio", "punisco", "umilio"]
  },
  {
    type: "Autocontrollo",
    title: "Provocazione davanti a un adulto o superiore",
    text: "Qualcuno ti provoca davanti a una figura importante. Reagire male ti danneggia, ma subire in silenzio ti fa perdere posizione. Scrivi una risposta con controllo, confine e reputazione.",
    model: "Resto calmo e porto il focus sul comportamento: 'Preferisco restare sul tema. La battuta personale non aiuta.' Se insiste, dico: 'Ne parliamo dopo in modo serio.' Non regalo una scenata.",
    ideal: ["calmo", "tema", "comportamento", "personale", "dopo", "serio", "scenata"],
    traps: ["stupido", "ridicolo", "odio", "urlo"]
  }
];

const topics = [
  {
    id: "storia-guerra-fredda",
    area: "Storia",
    difficulty: 6,
    title: "Guerra fredda: perche' si chiama fredda e come ha diviso il mondo",
    brief: "La Guerra fredda fu il lungo confronto tra Stati Uniti e Unione Sovietica dopo la Seconda guerra mondiale. Si chiama 'fredda' perche' le due superpotenze evitarono quasi sempre uno scontro militare diretto tra loro, ma combatterono attraverso alleanze, propaganda, spionaggio, corsa agli armamenti, economia e guerre indirette in altri Paesi.\n\nIl punto di partenza e' il 1945: la Germania nazista e' sconfitta, ma il mondo non torna semplicemente alla normalita'. Gli Stati Uniti rappresentano capitalismo liberale, mercato, democrazia rappresentativa e influenza occidentale. L'Unione Sovietica rappresenta comunismo, economia pianificata, partito unico e controllo dell'Europa orientale. Le due potenze hanno interessi incompatibili e soprattutto si temono a vicenda.\n\nL'Europa viene divisa simbolicamente e concretamente. A ovest ci sono Paesi legati agli Stati Uniti e alla NATO; a est Paesi sotto influenza sovietica e Patto di Varsavia. Berlino diventa il simbolo piu' potente: una citta' divisa dentro una Germania divisa. Il Muro di Berlino, costruito nel 1961, mostra che la divisione non e' solo ideologica, ma fisica.\n\nLa Guerra fredda e' anche corsa nucleare. Entrambe le parti accumulano armi capaci di distruggere il pianeta. Nasce cosi' la logica della deterrenza: non attacco perche' anche l'altro puo' distruggermi. E' un equilibrio terribile, ma per decenni impedisce la guerra diretta. La crisi dei missili di Cuba del 1962 e' il momento in cui il mondo si avvicina di piu' alla guerra nucleare.\n\nFinisce tra il 1989 e il 1991: cade il Muro di Berlino, i regimi comunisti europei crollano, l'URSS si dissolve. Capire la Guerra fredda serve ancora oggi per leggere alleanze, diffidenza tra potenze, propaganda, intelligence e conflitti indiretti.",
    question: "Perche' la deterrenza nucleare puo' impedire una guerra e allo stesso tempo rendere il mondo piu' pericoloso?"
  },
  {
    id: "geografia-suez",
    area: "Geografia",
    difficulty: 5,
    title: "Canale di Suez: il collo di bottiglia che collega Mediterraneo e Oceano Indiano",
    brief: "Il Canale di Suez e' un passaggio artificiale in Egitto che collega il Mar Mediterraneo al Mar Rosso. Prima della sua apertura nel 1869, molte navi dovevano circumnavigare l'Africa passando dal Capo di Buona Speranza. Suez riduce enormemente tempi, distanza e costi tra Europa e Asia.\n\nLa cosa importante e' che non e' solo una via d'acqua. E' un punto strategico globale. Petrolio, gas, merci industriali, componenti elettronici, cibo e container possono passare da li'. Se il canale si blocca, come e' accaduto nel 2021 con la nave Ever Given, le catene di approvvigionamento rallentano e i costi salgono.\n\nIn geografia politica si parla spesso di chokepoint, cioe' colli di bottiglia. Sono zone strette in cui passa tanto movimento. Chi controlla o influenza questi punti puo' condizionare Paesi lontanissimi. Suez, Malacca, Hormuz, Panama e Bosforo sono esempi fondamentali.\n\nPer capirlo bene, pensa a una porta in un edificio affollato: la stanza puo' essere enorme, ma se tutti devono passare da una sola porta, quella porta diventa potere. Il Canale di Suez e' una porta del commercio mondiale.",
    question: "Perche' bloccare un punto geografico piccolo puo' produrre effetti economici mondiali?"
  },
  {
    id: "biologia-sistema-immunitario",
    area: "Biologia",
    difficulty: 6,
    title: "Sistema immunitario: difesa, memoria e rischio di errore",
    brief: "Il sistema immunitario e' l'insieme di cellule, organi e molecole che protegge il corpo da virus, batteri, funghi, parassiti e cellule anomale. Non e' una singola barriera: e' una rete di difesa distribuita.\n\nLa prima linea e' l'immunita' innata. Comprende pelle, mucose, infiammazione, febbre e cellule che attaccano in modo rapido ma poco specifico. Se ti tagli, il rossore e il gonfiore indicano che il corpo sta portando risorse nella zona. Questa risposta e' veloce, ma non ha una memoria raffinata.\n\nLa seconda linea e' l'immunita' adattativa. Qui entrano in gioco linfociti B e T. I linfociti B producono anticorpi, molecole che riconoscono bersagli specifici. I linfociti T aiutano a coordinare la risposta o distruggono cellule infette. Questa parte richiede piu' tempo, ma crea memoria immunitaria.\n\nLa memoria immunitaria e' il motivo per cui alcuni vaccini funzionano: mostrano al corpo un bersaglio o una sua parte in modo controllato, cosi' il sistema impara a riconoscerlo prima di incontrare il pericolo vero. La prossima risposta sara' piu' rapida ed efficace.\n\nIl sistema pero' puo' sbagliare. Nelle allergie reagisce troppo a sostanze normalmente innocue. Nelle malattie autoimmuni attacca parti del corpo. Quindi una difesa perfetta non e' solo forte: deve anche distinguere bene il bersaglio.",
    question: "Perche' la memoria immunitaria e' utile, ma una risposta troppo aggressiva puo' diventare un problema?"
  },
  {
    id: "economia-domanda-offerta",
    area: "Economia",
    difficulty: 4,
    title: "Domanda e offerta: il meccanismo base dei prezzi",
    brief: "Domanda e offerta sono due forze fondamentali dell'economia. La domanda indica quanto le persone vogliono comprare un bene a un certo prezzo. L'offerta indica quanto i produttori sono disposti a vendere a quel prezzo. Il prezzo nasce dall'incontro tra queste due forze.\n\nSe la domanda aumenta e l'offerta resta uguale, il prezzo tende a salire. Esempio: se tutti vogliono comprare un certo modello di scarpe ma i pezzi disponibili sono pochi, chi vende puo' alzare il prezzo. Se invece l'offerta aumenta molto e la domanda resta uguale, il prezzo tende a scendere.\n\nIl prezzo non e' solo un numero: e' un segnale. Dice ai consumatori se qualcosa e' scarso o abbondante e dice ai produttori dove conviene investire. Se il prezzo di un bene sale molto, nuove imprese potrebbero entrare nel mercato per produrlo.\n\nQuesto modello e' semplice, ma non spiega tutto. Nella realta' esistono monopoli, regolamenti, mode, pubblicita', informazioni incomplete e comportamenti irrazionali. Pero' domanda e offerta restano la grammatica base per capire mercati, affitti, stipendi, materie prime e inflazione.",
    question: "Perche' un prezzo alto puo' essere sia un problema per chi compra sia un segnale per chi produce?"
  },
  {
    id: "matematica-crescita-esponenziale",
    area: "Matematica",
    difficulty: 5,
    title: "Crescita esponenziale: quando il piccolo diventa enorme",
    brief: "La crescita esponenziale avviene quando una quantita' cresce in proporzione a se stessa. Non aggiunge sempre lo stesso numero, ma moltiplica. Questo rende l'inizio lento e quasi invisibile, poi improvvisamente rapidissimo.\n\nEsempio: se qualcosa raddoppia ogni giorno, al giorno 1 hai 1, al giorno 2 hai 2, al giorno 3 hai 4, poi 8, 16, 32. Per molte fasi sembra gestibile, ma dopo pochi raddoppi diventa grande. La mente umana spesso sottovaluta questo tipo di crescita perche' ragiona in modo lineare.\n\nLa crescita esponenziale compare in interessi composti, popolazioni, epidemie, diffusione di contenuti online, potenza di calcolo e apprendimento cumulativo. Anche migliorare dell'1% al giorno non sembra molto, ma nel tempo produce differenze enormi.\n\nIl concetto centrale e': quando la crescita dipende dalla quantita' gia' presente, il tempo diventa una forza potentissima. Piccoli vantaggi ripetuti possono diventare superiorita' enorme; piccoli problemi ignorati possono diventare crisi.",
    question: "Perche' la crescita esponenziale e' facile da sottovalutare all'inizio?"
  },
  {
    id: "trading-gestione-rischio",
    area: "Trading",
    difficulty: 7,
    title: "Gestione del rischio nel trading: sopravvivere prima di guadagnare",
    brief: "Nel trading molte persone guardano prima al guadagno possibile. La gestione del rischio ribalta la domanda: prima chiedi quanto puoi perdere, poi chiedi quanto puoi guadagnare. Senza questa disciplina, anche una strategia buona puo' fallire per una serie negativa.\n\nUn concetto base e' il rischio per operazione. Se hai un capitale e rischi una percentuale troppo alta in una singola operazione, poche perdite consecutive possono distruggerti. Rischiare poco non garantisce il guadagno, ma ti permette di restare nel gioco abbastanza a lungo da valutare se la strategia funziona.\n\nAltro concetto e' il rapporto rischio/rendimento. Se rischi 100 per provare a guadagnare 200, il rapporto e' 1:2. Ma serve anche la probabilita': una strategia che vince poco spesso deve guadagnare molto quando vince; una che vince spesso deve evitare perdite enormi.\n\nQuesta scheda e' educativa, non un consiglio finanziario. La lezione generale e' utile anche fuori dal trading: non confondere possibilita' con piano. Un piano serio definisce perdita massima, criterio di uscita, dimensione della posizione e revisione degli errori.",
    question: "Perche' una strategia con tante piccole vittorie puo' comunque essere pericolosa?"
  }
];

const cultureEnhancements = {
  default: {
    example: "Esempio pratico: prova a collegare il concetto a una notizia, una scelta quotidiana o una decisione strategica. Se riesci a usarlo per spiegare un fatto reale, non lo stai solo leggendo: lo stai capendo.",
    importance: "Perche' e' importante: la cultura generale serve a costruire mappe mentali. Piu' mappe hai, piu' riconosci pattern, cause, conseguenze e analogie tra campi diversi.",
    links: "Collegamenti: storia, economia, geografia, psicologia, tecnologia e politica si intrecciano spesso. Ogni argomento va collegato almeno a un altro per diventare conoscenza utilizzabile.",
    answer: "Risposta spiegata: una buona risposta deve citare causa, effetto e limite del concetto, non solo ripetere una definizione."
  }
};

const planningGoals = [
  "Una persona ti prende in giro spesso davanti agli altri. Crea un piano per farla smettere senza peggiorare la situazione e senza perdere controllo.",
  "Vuoi migliorare la concentrazione nello studio per 30 giorni, ma perdi tempo con telefono e notifiche.",
  "Devi convincere un gruppo a lavorare meglio senza sembrare autoritario.",
  "Vuoi imparare una competenza nuova con poco tempo libero e rischio di mollare dopo una settimana.",
  "Hai un conflitto con qualcuno che fraintende spesso le tue intenzioni. Crea un piano per chiarire e ridurre attrito."
];

const defenseDrills = [
  {
    level: 1,
    title: "Guardia base e mento basso",
    text: "Esercizio tecnico di base: crea una struttura stabile che protegge viso e centro.",
    steps: [
      "Piedi alla larghezza spalle, piede dominante leggermente dietro.",
      "Mento basso, spalle rilassate, mani alte vicino a zigomi e tempie.",
      "Gomiti stretti verso le costole: non aprire il centro.",
      "Muoviti avanti e indietro a piccoli passi senza incrociare i piedi."
    ]
  },
  {
    level: 1,
    title: "Parata esterna semplice",
    text: "Serve a deviare una linea dritta senza abbassare l'altra mano.",
    steps: [
      "Parti in guardia.",
      "Immagina un colpo dritto verso il viso.",
      "Con la mano anteriore devia verso l'esterno usando avambraccio e rotazione minima.",
      "La mano posteriore resta alta: non difendere con entrambe la stessa zona.",
      "Ritorna subito in guardia."
    ]
  },
  {
    level: 2,
    title: "Copertura a conchiglia",
    text: "Esercizio per proteggere testa e mascella quando non hai tempo di leggere bene il colpo.",
    steps: [
      "Avambracci vicini alle tempie.",
      "Mento chiuso, gomiti davanti al busto.",
      "Fai tre passi corti laterali mantenendo visuale.",
      "Dopo ogni passo riapri leggermente la guardia e respira."
    ]
  },
  {
    level: 2,
    title: "Liberazione dal polso",
    text: "Movimento lento e controllato per uscire da una presa al polso senza strappi.",
    steps: [
      "Individua il punto debole della presa: tra pollice e dita.",
      "Ruota il tuo pollice verso quell'apertura.",
      "Tira il gomito verso il tuo corpo mentre fai un passo indietro.",
      "Ritorna in guardia e controlla equilibrio."
    ]
  },
  {
    level: 3,
    title: "Parata piu' passo laterale",
    text: "Unisce difesa e cambio angolo, cosi' non resti fermo sulla linea.",
    steps: [
      "Parti in guardia.",
      "Esegui parata esterna.",
      "Contemporaneamente fai mezzo passo laterale.",
      "Rimetti entrambe le mani alte.",
      "Ripeti lentamente: precisione prima della velocita'."
    ]
  },
  {
    level: 4,
    title: "Sequenza difensiva completa",
    text: "Combinazione controllata per coordinare guardia, parata, copertura e ritorno stabile.",
    steps: [
      "Guardia base per 3 secondi.",
      "Parata esterna.",
      "Copertura a conchiglia.",
      "Passo laterale.",
      "Ritorno in guardia con respiro controllato."
    ]
  },
  {
    level: 2,
    title: "Footwork a triangolo",
    text: "Allena entrata e uscita dalla linea mantenendo equilibrio e mani alte.",
    steps: [
      "Disegna mentalmente un triangolo sul pavimento.",
      "Parti dal vertice basso in guardia.",
      "Passa al vertice destro con piede destro, poi richiama il sinistro.",
      "Torna al centro e ripeti a sinistra.",
      "Non saltare: passi corti, busto stabile, mani alte."
    ]
  },
  {
    level: 3,
    title: "Schivata laterale semplice",
    text: "Movimento difensivo per togliere la testa dalla linea senza perdere postura.",
    steps: [
      "Parti in guardia davanti a uno specchio o muro libero.",
      "Sposta leggermente testa e spalla fuori linea.",
      "Piega poco le ginocchia, non inclinarti troppo.",
      "Ritorna al centro con mani alte.",
      "Ripeti lento: destra, centro, sinistra, centro."
    ]
  },
  {
    level: 3,
    title: "Low kick tecnico a vuoto",
    text: "Esercizio a vuoto e controllato: lavora equilibrio, anche e ritorno in guardia, senza colpire persone.",
    steps: [
      "Parti in guardia con peso bilanciato.",
      "Ruota leggermente il piede di appoggio.",
      "Simula il calcio basso a mezz'aria con tibia allineata.",
      "Rientra subito in guardia senza restare scoperto.",
      "Fai 5 ripetizioni lente per lato."
    ]
  },
  {
    level: 4,
    title: "Counter semplice dopo parata",
    text: "Sequenza responsabile e controllata: difendi, riprendi equilibrio, simula un contrattacco a vuoto e torna in guardia.",
    steps: [
      "Parata esterna controllata.",
      "Passo laterale corto.",
      "Simula un colpo dritto a vuoto senza iperestendere il gomito.",
      "Mano opposta resta alta.",
      "Ritorna in guardia e respira."
    ]
  },
  {
    level: 5,
    title: "Gestione distanza con bersaglio immaginario",
    text: "Allena la distanza di sicurezza e la capacita' di rientrare in guardia dopo ogni movimento.",
    steps: [
      "Scegli un punto sul muro come bersaglio.",
      "Avanza finche' potresti toccarlo con il braccio esteso.",
      "Esci di mezzo passo mantenendo guardia.",
      "Rientra e riesci senza incrociare i piedi.",
      "Valuta: se perdi equilibrio, riduci velocita'."
    ]
  }
];

const logicRiddles = [
  {
    type: "Sequenze",
    title: "Numeri",
    text: "Quale numero continua la sequenza: 2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "44"],
    answer: 2,
    explanation: "La sequenza aggiunge numeri pari crescenti: +4, +6, +8, +10, quindi +12. 30 + 12 = 42."
  },
  {
    type: "Deduzione",
    title: "Tre interruttori",
    text: "Hai tre interruttori fuori da una stanza e una sola lampadina dentro. Puoi entrare una volta. Come capisci quale interruttore controlla la lampadina?",
    options: ["Accendi il primo e poi entri subito", "Accendi il primo, aspetti, lo spegni, accendi il secondo ed entri", "Accendi tutti e tre e poi entri", "Non si puo' sapere"],
    answer: 1,
    explanation: "Se la lampadina e' accesa, e' il secondo. Se e' spenta ma calda, e' il primo. Se e' spenta e fredda, e' il terzo."
  },
  {
    type: "Probabilita'",
    title: "Moneta",
    text: "Lanci una moneta equa 3 volte. Qual e' la probabilita' di ottenere almeno una testa?",
    options: ["1/8", "3/8", "7/8", "1/2"],
    answer: 2,
    explanation: "Conviene calcolare il contrario: nessuna testa significa tre croci, probabilita' 1/8. Quindi almeno una testa = 1 - 1/8 = 7/8."
  },
  {
    type: "Attenzione",
    title: "Padre e figlio",
    text: "Un padre e un figlio hanno insieme 36 anni. Il padre ha 30 anni piu' del figlio. Quanti anni ha il figlio?",
    options: ["3", "4", "5", "6"],
    answer: 0,
    explanation: "Se il figlio ha x anni, il padre ha x + 30. Totale: 2x + 30 = 36, quindi 2x = 6 e x = 3."
  }
];

const memoryWords = ["ponte", "rame", "luna", "chiave", "vento", "quadro", "sale", "vetro", "fuoco", "mappa", "fiore", "torre", "fiume", "ombra", "stella", "porta"];

const influenceTactics = [
  {
    category: "Framing",
    title: "Cornice della scelta",
    lesson: "Il framing consiste nel presentare una stessa opzione dentro una cornice mentale diversa. Non cambia i fatti, cambia il punto da cui la persona li guarda.\n\nUso pulito: rendi chiaro il criterio giusto. Esempio: invece di dire 'devi studiare', dici 'scegliamo il metodo che ti fa perdere meno tempo domani'.\n\nAbuso da evitare: nascondere costi, mentire o creare panico per forzare una decisione.",
    scenario: "Scenario fittizio: vuoi convincere un compagno a iniziare prima un lavoro di gruppo. Come incornici la scelta senza ingannarlo?",
    ideal: ["criterio", "costo", "beneficio", "tempo", "chiaro", "scelta"]
  },
  {
    category: "Reciprocita'",
    title: "Dare prima di chiedere",
    lesson: "La reciprocita' e' la tendenza a voler ricambiare un favore. E' una leva sociale potente perche' crea fiducia e movimento.\n\nUso pulito: offri un aiuto reale e proporzionato, poi fai una richiesta chiara. Esempio: 'Ho gia' preparato la struttura, puoi occuparti degli esempi?'\n\nAbuso da evitare: fare favori finti per creare debito emotivo o far sentire l'altro intrappolato.",
    scenario: "Scenario fittizio: vuoi ottenere collaborazione da una persona passiva nel gruppo. Che cosa offri e che cosa chiedi?",
    ideal: ["aiuto", "proporzionato", "richiesta", "chiara", "collaborazione", "ruolo"]
  },
  {
    category: "Impegno",
    title: "Micro-impegno",
    lesson: "Le persone rispettano piu' facilmente un impegno piccolo e specifico rispetto a una promessa vaga. Il micro-impegno riduce attrito.\n\nUso pulito: chiedi un passo minimo verificabile. Esempio: 'Mi mandi tre idee entro le 18?' invece di 'impegnati di piu'.'\n\nAbuso da evitare: usare piccoli si' per trascinare una persona verso qualcosa che non avrebbe accettato sapendo tutto.",
    scenario: "Scenario fittizio: devi far partire un progetto fermo. Quale micro-impegno chiedi?",
    ideal: ["piccolo", "specifico", "entro", "verificabile", "passo", "idee"]
  },
  {
    category: "Autorita'",
    title: "Autorita' credibile",
    lesson: "L'autorita' funziona quando una persona percepisce competenza, calma e prove. Non serve alzare la voce: serve essere affidabili.\n\nUso pulito: mostra dati, esperienza, limiti e metodo. Esempio: 'Ho controllato tre fonti, il rischio e' questo, propongo questo passo'.\n\nAbuso da evitare: fingere competenza, inventare fonti o usare status per zittire.",
    scenario: "Scenario fittizio: vuoi far cambiare idea a un gruppo su una scelta rischiosa. Come costruisci autorita' senza arroganza?",
    ideal: ["fonti", "prove", "rischio", "metodo", "limiti", "propongo"]
  },
  {
    category: "Scarsita'",
    title: "Scarsita' reale",
    lesson: "La scarsita' aumenta il valore percepito quando una risorsa e' davvero limitata: tempo, posti, attenzione, opportunita'.\n\nUso corretto: dichiara un limite reale e verificabile. Esempio: 'Posso aiutarti oggi per 20 minuti, poi devo chiudere.'\n\nAbuso da evitare: inventare urgenza falsa per far decidere una persona sotto pressione.",
    scenario: "Scenario fittizio: vuoi far decidere un gruppo prima della scadenza. Come usi la scarsita' senza creare panico falso?",
    ideal: ["limite", "reale", "tempo", "scadenza", "verificabile", "scelta"]
  },
  {
    category: "Riprova sociale",
    title: "Riprova sociale",
    lesson: "La riprova sociale funziona perche' le persone guardano cosa fanno gli altri quando sono incerte.\n\nUso corretto: mostra esempi reali di persone simili che hanno ottenuto un risultato.\n\nAbuso da evitare: fingere consenso, gonfiare numeri o usare il gruppo per schiacciare una scelta individuale.",
    scenario: "Scenario fittizio: vuoi proporre un metodo di studio a un gruppo scettico. Quale prova sociale porti?",
    ideal: ["esempio", "reale", "persone", "risultato", "simile", "metodo"]
  },
  {
    category: "Ancoraggio",
    title: "Ancoraggio",
    lesson: "L'ancoraggio e' il primo numero, criterio o riferimento che orienta il giudizio successivo.\n\nUso corretto: parti da un riferimento onesto per rendere concreta la discussione. Esempio: 'Abbiamo 60 minuti, quindi scegliamo due priorita'.'\n\nAbuso da evitare: sparare numeri falsi o estremi per deformare la percezione.",
    scenario: "Scenario fittizio: devi negoziare tempi di consegna. Quale ancora iniziale usi?",
    ideal: ["numero", "riferimento", "onesto", "tempo", "priorita", "criterio"]
  },
  {
    category: "Contrasto",
    title: "Principio di contrasto",
    lesson: "Il contrasto fa percepire un'opzione diversamente quando viene confrontata con un'altra.\n\nUso corretto: confronta alternative reali, con costi e benefici chiari.\n\nAbuso da evitare: creare una falsa opzione pessima solo per far sembrare buona quella che vuoi imporre.",
    scenario: "Scenario fittizio: vuoi far scegliere tra due piani di lavoro. Come presenti il confronto in modo corretto?",
    ideal: ["alternative", "costi", "benefici", "confronto", "reali", "scelta"]
  },
  {
    category: "Domande guidate",
    title: "Domande che orientano",
    lesson: "Una domanda puo' guidare l'attenzione verso un criterio. Le domande buone non intrappolano: fanno pensare meglio.\n\nUso corretto: chiedi 'Qual e' il rischio se aspettiamo?' invece di accusare.\n\nAbuso da evitare: domande-trappola costruite per far sembrare stupida qualsiasi risposta.",
    scenario: "Scenario fittizio: vuoi far emergere un rischio che il gruppo ignora. Che domanda fai?",
    ideal: ["domanda", "rischio", "criterio", "pensare", "attenzione", "scelta"]
  },
  {
    category: "Obiezioni",
    title: "Gestione obiezioni",
    lesson: "Un'obiezione non e' per forza un attacco: spesso e' informazione su rischio, paura o priorita'.\n\nUso corretto: riconosci l'obiezione, chiarisci, rispondi con prova o modifica il piano.\n\nAbuso da evitare: ignorare dubbi reali o usare pressione per far tacere.",
    scenario: "Scenario fittizio: qualcuno dice che il tuo piano e' troppo rischioso. Come rispondi?",
    ideal: ["riconosco", "chiarisco", "prova", "rischio", "modifico", "piano"]
  },
  {
    category: "Negoziazione",
    title: "Scambio e BATNA",
    lesson: "Negoziare bene significa sapere cosa vuoi, cosa puoi offrire e qual e' la tua alternativa se l'accordo non arriva. Questa alternativa si chiama spesso BATNA.\n\nUso corretto: proponi uno scambio chiaro e tieni pronta un'alternativa.\n\nAbuso da evitare: minacce vuote o promesse che non manterrai.",
    scenario: "Scenario fittizio: vuoi ottenere piu' tempo per un progetto. Che scambio proponi e qual e' la tua alternativa?",
    ideal: ["scambio", "alternativa", "tempo", "offro", "accordo", "chiaro"]
  }
];

const aestheticItems = [
  { id: "shave", title: "Barba", text: "Barba rasata o linee pulite su collo e guance." },
  { id: "hair", title: "Capelli", text: "Capelli pettinati, puliti e taglio coerente con il viso." },
  { id: "skin", title: "Pelle", text: "Detersione delicata, idratazione e protezione solare di giorno." },
  { id: "teeth", title: "Denti", text: "Denti lavati, filo o scovolino, alito controllato." },
  { id: "clothes", title: "Vestiti", text: "Vestiti puliti, taglia corretta, colori semplici e coordinati." },
  { id: "posture", title: "Postura", text: "Spalle aperte, collo lungo, camminata stabile." },
  { id: "scent", title: "Profumo", text: "Odore pulito; profumo leggero, non invasivo." },
  { id: "sleep", title: "Sonno", text: "Sonno sufficiente: e' il miglior 'filtro estetico' reale." }
];

const styleTips = [
  "Il fit batte il prezzo: una maglietta semplice della taglia giusta migliora piu' di un capo costoso largo o deformato.",
  "Per la barba: se non e' piena, meglio linee pulite e lunghezza corta. L'effetto ordinato vince sull'effetto casuale.",
  "Capelli: scegli tagli che rispettano densita' e forma del viso. Porta al barbiere una foto realistica, non un taglio impossibile per il tuo tipo di capello.",
  "Skincare base verificata: detergente delicato, idratante, SPF al mattino. Pochi prodotti costanti battono routine aggressive.",
  "Colori: parti da neutri facili, come bianco, nero, grigio, blu, verde scuro. Aggiungi un colore alla volta.",
  "Postura e composizione: spalle rilassate, schiena lunga, sguardo stabile. Non e' estetica finta, cambia davvero la presenza."
];

const abilityLabels = {
  strategicMind: "Mente strategica",
  clarity: "Lucidità",
  culture: "Cultura",
  memory: "Memoria",
  emotionalControl: "Controllo emotivo",
  presence: "Presenza personale"
};

const generalProfileCategories = [
  { key: "strategicMind", label: "Mente strategica" },
  { key: "clarity", label: "Lucidità" },
  { key: "culture", label: "Cultura" },
  { key: "memory", label: "Memoria" },
  { key: "emotionalControl", label: "Controllo emotivo" },
  { key: "presence", label: "Presenza personale" }
];

const moduleSkillDefinitions = {
  chess: [
    { key: "concentration", label: "Concentrazione", general: "clarity" },
    { key: "calculation", label: "Calcolo", general: "strategicMind" },
    { key: "strategy", label: "Strategia", general: "strategicMind" },
    { key: "threatVision", label: "Visione minacce", general: "clarity" },
    { key: "kingSafety", label: "Sicurezza re", general: "emotionalControl" },
    { key: "impulseControl", label: "Controllo impulso", general: "emotionalControl" }
  ],
  scenarios: [
    { key: "contextReading", label: "Lettura contesto", general: "clarity" },
    { key: "emotionalControl", label: "Controllo emotivo", general: "emotionalControl" },
    { key: "assertiveness", label: "Assertività", general: "presence" },
    { key: "riskManagement", label: "Gestione rischio", general: "strategicMind" },
    { key: "timing", label: "Tempismo", general: "clarity" },
    { key: "planB", label: "Piano B", general: "strategicMind" }
  ],
  culture: [
    { key: "understanding", label: "Comprensione", general: "culture" },
    { key: "conceptMemory", label: "Memoria concetti", general: "memory" },
    { key: "connections", label: "Collegamenti", general: "culture" },
    { key: "depth", label: "Profondità", general: "culture" },
    { key: "practicalApplication", label: "Applicazione pratica", general: "strategicMind" },
    { key: "recall", label: "Richiamo", general: "memory" }
  ],
  planning: [
    { key: "goalClarity", label: "Chiarezza obiettivo", general: "strategicMind" },
    { key: "priority", label: "Priorità", general: "strategicMind" },
    { key: "riskManagement", label: "Gestione rischio", general: "strategicMind" },
    { key: "flexibility", label: "Flessibilità", general: "clarity" },
    { key: "sustainability", label: "Sostenibilità", general: "strategicMind" },
    { key: "planB", label: "Piano B", general: "strategicMind" }
  ],
  defense: [
    { key: "distance", label: "Distanza", general: "presence" },
    { key: "reflexes", label: "Riflessi", general: "clarity" },
    { key: "control", label: "Controllo", general: "emotionalControl" },
    { key: "prevention", label: "Prevenzione", general: "strategicMind" },
    { key: "movement", label: "Movimento", general: "presence" },
    { key: "reaction", label: "Reazione", general: "clarity" }
  ],
  logic: [
    { key: "deduction", label: "Deduzione", general: "strategicMind" },
    { key: "precision", label: "Precisione", general: "clarity" },
    { key: "speed", label: "Velocità", general: "clarity" },
    { key: "pattern", label: "Pattern", general: "strategicMind" },
    { key: "coherence", label: "Coerenza", general: "strategicMind" },
    { key: "problemSolving", label: "Problem solving", general: "strategicMind" }
  ],
  memory: [
    { key: "recall", label: "Richiamo", general: "memory" },
    { key: "sequences", label: "Sequenze", general: "memory" },
    { key: "attention", label: "Attenzione", general: "clarity" },
    { key: "precision", label: "Precisione", general: "clarity" },
    { key: "visualMemory", label: "Memoria visiva", general: "memory" },
    { key: "resistance", label: "Resistenza", general: "emotionalControl" }
  ],
  influence: [
    { key: "framing", label: "Framing", general: "strategicMind" },
    { key: "socialLeverage", label: "Leva sociale", general: "strategicMind" },
    { key: "ethicalBoundaries", label: "Confini etici", general: "emotionalControl" },
    { key: "personReading", label: "Lettura persona", general: "clarity" },
    { key: "negotiation", label: "Negoziazione", general: "strategicMind" },
    { key: "objectionHandling", label: "Gestione obiezioni", general: "emotionalControl" }
  ],
  aesthetic: [
    { key: "personalCare", label: "Cura personale", general: "presence" },
    { key: "style", label: "Stile", general: "presence" },
    { key: "posture", label: "Postura", general: "presence" },
    { key: "skinHair", label: "Pelle/capelli", general: "presence" },
    { key: "presence", label: "Presenza", general: "presence" },
    { key: "lookConsistency", label: "Coerenza look", general: "presence" }
  ]
};

const pieceImageCache = {};
const ChessEngineService = createChessEngineService();

let state = loadState();
let board = createInitialBoard();
let gameState = createInitialGameState();
let selectedSquare = null;
let history = [];
let moveNumber = 1;
let playerMoveStats = {};
let thinkStartedAt = Date.now();
let botMoveTimer = null;
let chessGameOver = false;
let reviewBoard = null;
let lastMoveSquares = null;
let reviewMoveSquares = null;
let currentGame = createNewGame();
let currentScenario = null;
let currentTopic = null;
let currentRiddle = null;
let currentMemory = null;
let memoryTimer = null;
let currentInfluence = null;
let timerId = null;
let timerLeft = 30;
let reflexTimer = null;
let reflexShownAt = 0;
let reflexSession = { active: false, round: 0, times: [], mistakes: 0 };

document.addEventListener("DOMContentLoaded", () => {
  maybeRedirectFileChessToLocalServer();
  bindNavigation();
  bindControls();
  renderAestheticChecklist();
  renderDashboard();
  renderBoard();
  renderMistakes();
  renderBotLevel();
  initEngine();
  renderGameReport(buildGameAnalysis("partial"));
  renderStudiedList();
  renderReviewList();
  loadRandomScenario();
  loadRandomTopic();
  loadRandomGoal();
  loadDefenseDrill();
  loadRandomRiddle();
  loadMemoryExercise();
  loadInfluenceTactic();
  renderAesthetic();
  routeToCurrentHash();
});

function maybeRedirectFileChessToLocalServer() {
  if (typeof window === "undefined" || !window.location || window.location.protocol !== "file:") return;
  if (typeof fetch !== "function") return;
  const target = `http://127.0.0.1:8765/index.html${window.location.hash || ""}`;
  fetch("http://127.0.0.1:8765/stockfish-worker.js", { mode: "no-cors", cache: "no-store" })
    .then(() => {
      window.location.replace(target);
    })
    .catch(() => {});
}

window.addEventListener("hashchange", routeToCurrentHash);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return mergeDefaults(defaultState, saved || {});
  } catch (error) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function mergeDefaults(defaults, saved) {
  if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : [...defaults];
  if (defaults && typeof defaults === "object") {
    const result = {};
    Object.keys(defaults).forEach((key) => {
      result[key] = mergeDefaults(defaults[key], saved ? saved[key] : undefined);
    });
    if (saved && typeof saved === "object") {
      Object.keys(saved).forEach((key) => {
        if (!(key in result)) result[key] = saved[key];
      });
    }
    return result;
  }
  return saved === undefined || saved === null ? defaults : saved;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra
  };
}

function isSupabaseConfigured() {
  return Boolean(SUPABASE_REST_URL && SUPABASE_ANON_KEY && typeof fetch === "function");
}

function queueSupabaseWrite(kind, payload) {
  if (!isSupabaseConfigured()) return Promise.resolve({ ok: false, error: "Supabase non configurato" });
  const task = () => writeSupabaseRecord(kind, payload)
    .then((result) => {
      setSupabaseStatus(result.ok ? `Supabase: ${kind} salvato` : `Supabase: ${result.error || "salvataggio non riuscito"}`);
      return result;
    })
    .catch((error) => {
      const message = error && error.message ? error.message : String(error);
      setSupabaseStatus(`Supabase: ${message}`);
      return { ok: false, error: message };
    });
  supabaseWriteQueue = supabaseWriteQueue.then(task, task);
  return supabaseWriteQueue;
}

function setSupabaseStatus(message) {
  if (!currentGame) return;
  currentGame.supabaseStatus = message;
  currentGame.supabaseUpdatedAt = new Date().toISOString();
}

function chessDebugLog(event, details = {}) {
  if (typeof console === "undefined") return;
  const payload = {
    event,
    gameId: currentGame && currentGame.id,
    time: new Date().toISOString(),
    ...details
  };
  if (console.groupCollapsed) {
    console.groupCollapsed(`[Chess Debug] ${event}`);
    console.log(payload);
    console.groupEnd();
  } else {
    console.log("[Chess Debug]", payload);
  }
}

async function writeSupabaseRecord(kind, payload) {
  const tableNames = await getSupabaseCandidateTables(kind);
  const errors = [];
  for (const tableName of tableNames) {
    const rowVariants = buildSupabaseRowVariants(tableName, payload);
    for (const row of rowVariants) {
      const response = await fetch(`${SUPABASE_REST_URL}/${encodeURIComponent(tableName)}`, {
        method: "POST",
        headers: supabaseHeaders({
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        }),
        body: JSON.stringify(row)
      });
      if (response.ok) {
        supabaseTableCache[kind] = tableName;
        return { ok: true, table: tableName };
      }
      const detail = await response.text().catch(() => "");
      errors.push(`${tableName} ${response.status}: ${detail.slice(0, 160)}`);
      if (![400, 404, 406].includes(response.status)) break;
    }
  }
  return { ok: false, error: errors[0] || `Nessuna tabella Supabase valida per ${kind}` };
}

async function getSupabaseCandidateTables(kind) {
  const schema = await getSupabaseSchema().catch(() => null);
  const preferred = supabaseTableCache[kind] ? [supabaseTableCache[kind]] : [];
  const explicit = SUPABASE_TABLE_CANDIDATES[kind] || [];
  const discovered = schema ? discoverSupabaseTablesForKind(schema, kind) : [];
  return uniqueList([...preferred, ...explicit, ...discovered]);
}

async function getSupabaseSchema() {
  if (supabaseSchema) return supabaseSchema;
  if (!supabaseSchemaPromise) {
    supabaseSchemaPromise = fetch(SUPABASE_REST_URL, { headers: supabaseHeaders({ Accept: "application/openapi+json" }) })
      .then((response) => response.ok ? response.json() : null)
      .then((schema) => {
        supabaseSchema = parseSupabaseOpenApiSchema(schema);
        return supabaseSchema;
      })
      .catch(() => null);
  }
  return supabaseSchemaPromise;
}

function parseSupabaseOpenApiSchema(schema) {
  const definitions = schema && (schema.definitions || (schema.components && schema.components.schemas));
  if (!definitions || typeof definitions !== "object") return null;
  const tables = {};
  Object.entries(definitions).forEach(([name, definition]) => {
    const properties = definition && definition.properties;
    if (properties && typeof properties === "object") tables[name] = Object.keys(properties);
  });
  return Object.keys(tables).length ? tables : null;
}

function discoverSupabaseTablesForKind(schema, kind) {
  if (!schema) return [];
  const names = Object.keys(schema);
  const tokens = {
    games: ["game", "games", "partite", "partita"],
    moves: ["move", "moves", "mosse", "mossa"],
    analyses: ["analysis", "analyses", "analisi", "review"],
    exercises: ["exercise", "exercises", "esercizi", "drill"]
  }[kind] || [];
  return names.filter((name) => {
    const lower = name.toLowerCase();
    return (lower.includes("chess") || lower.includes("scacchi")) && tokens.some((token) => lower.includes(token));
  });
}

function buildSupabaseRowVariants(tableName, payload) {
  const columns = supabaseSchema && supabaseSchema[tableName] ? new Set(supabaseSchema[tableName]) : null;
  const full = sanitizeForJson(payload);
  if (!columns) {
    const minimalKeys = [
      "game_id", "date", "saved_at", "stage", "bot_level", "bot_elo", "result", "status", "final_state", "player_color", "move_count", "accuracy", "bot_accuracy", "main_pattern",
      "analyzed_at", "engine", "engine_based",
      "fen_before", "correct_move", "theme", "difficulty", "explanation", "created_at"
    ];
    const minimal = {};
    minimalKeys.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(full, key) && full[key] !== undefined) minimal[key] = full[key];
    });
    return [
      full,
      minimal,
      { game_id: payload.game_id || payload.gameId || currentGame.id, payload: full },
      { payload: full }
    ].filter((row) => row && Object.keys(row).length);
  }
  const mapped = {};
  Object.entries(full).forEach(([key, value]) => {
    if (columns.has(key)) mapped[key] = value;
  });
  const aliases = {
    game_id: payload.game_id || payload.gameId,
    gameId: payload.game_id || payload.gameId,
    created_at: payload.created_at || payload.date || new Date().toISOString(),
    payload: full,
    data: full,
    raw: full
  };
  Object.entries(aliases).forEach(([key, value]) => {
    if (columns.has(key) && value !== undefined) mapped[key] = sanitizeForJson(value);
  });
  return [mapped, { payload: full }, full].filter((row) => row && Object.keys(row).length);
}

function sanitizeForJson(value) {
  return JSON.parse(JSON.stringify(value, (key, item) => {
    if (typeof item === "function") return undefined;
    if (item === undefined) return null;
    return item;
  }));
}

function uniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

function routeToCurrentHash() {
  const route = window.location.hash.replace("#", "") || "dashboard";
  const activeRoute = routes.includes(route) ? route : "dashboard";
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active-page", page.id === activeRoute);
  });
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === activeRoute);
  });
  window.scrollTo({ top: 0, behavior: "auto" });
}

function bindNavigation() {
  document.querySelectorAll(".mode-card").forEach((card) => {
    card.addEventListener("click", () => {
      window.setTimeout(routeToCurrentHash, 0);
    });
  });
}

function bindControls() {
  document.getElementById("generateDayBtn").addEventListener("click", () => renderTodayPlan(true));
  document.getElementById("completeDayBtn").addEventListener("click", () => {
    state.completedDays += 1;
    saveState();
    renderDashboard();
  });
  document.getElementById("resetBoardBtn").addEventListener("click", resetChess);
  document.getElementById("undoMoveBtn").addEventListener("click", undoMovePair);
  document.getElementById("botLevelSelect").addEventListener("change", handleBotLevelChange);
  document.getElementById("reviewGameBtn").addEventListener("click", () => renderMoveReview(false));
  document.getElementById("exitReviewBtn").addEventListener("click", exitReviewMode);
  document.getElementById("reviewStartBtn").addEventListener("click", () => selectReviewMove(-1));
  document.getElementById("reviewPrevBtn").addEventListener("click", () => stepReviewMove(-1));
  document.getElementById("reviewNextBtn").addEventListener("click", () => stepReviewMove(1));
  document.getElementById("reviewEndBtn").addEventListener("click", selectReviewEnd);
  document.getElementById("reviewKeyMomentsBtn").addEventListener("click", toggleReviewKeyMoments);
  document.getElementById("reviewNextErrorBtn").addEventListener("click", selectNextReviewError);
  document.getElementById("reviewShowBestBtn").addEventListener("click", showReviewBestMove);
  document.getElementById("reviewShowLineBtn").addEventListener("click", showReviewBestLine);
  document.getElementById("moveReviewList").addEventListener("click", handleReviewClick);
  document.getElementById("evalSparkline").addEventListener("click", handleEvalSparklineClick);
  document.getElementById("reviewEvalSparkline").addEventListener("click", handleEvalSparklineClick);
  document.getElementById("startReviewFromReportBtn").addEventListener("click", () => renderMoveReview(false));
  document.getElementById("chessCheckDrillBtn").addEventListener("click", checkChessDrillAnswer);
  document.getElementById("chessHintDrillBtn").addEventListener("click", showChessDrillHint);
  document.getElementById("chessSolutionDrillBtn").addEventListener("click", showChessDrillSolution);
  document.getElementById("chessNextDrillBtn").addEventListener("click", nextChessDrill);
  document.getElementById("chessRetryDrillBtn").addEventListener("click", retryChessDrill);
  document.getElementById("newScenarioBtn").addEventListener("click", loadRandomScenario);
  document.getElementById("analyzeScenarioBtn").addEventListener("click", analyzeScenarioAnswer);
  document.getElementById("showScenarioModelBtn").addEventListener("click", showScenarioModel);
  document.getElementById("newTopicBtn").addEventListener("click", loadRandomTopic);
  document.getElementById("markTopicBtn").addEventListener("click", markTopicStudied);
  document.getElementById("newGoalBtn").addEventListener("click", loadRandomGoal);
  document.getElementById("clearGoalBtn").addEventListener("click", clearGoal);
  document.getElementById("analyzePlanBtn").addEventListener("click", analyzePlan);
  document.getElementById("newDefenseBtn").addEventListener("click", loadDefenseDrill);
  document.getElementById("startTimerBtn").addEventListener("click", startDefenseTimer);
  document.getElementById("startReflexBtn").addEventListener("click", startReflexGame);
  document.getElementById("reflexTarget").addEventListener("click", hitReflexTarget);
  document.getElementById("reflexDecoy").addEventListener("click", hitReflexDecoy);
  document.getElementById("levelUpDefenseBtn").addEventListener("click", () => {
    state.defenseLevel = clamp(state.defenseLevel + 1, 1, 8);
    saveState();
    renderDashboard();
    loadDefenseDrill();
  });
  document.getElementById("newRiddleBtn").addEventListener("click", loadRandomRiddle);
  document.getElementById("newMemoryBtn").addEventListener("click", loadMemoryExercise);
  document.getElementById("hideMemoryBtn").addEventListener("click", hideMemoryStimulus);
  document.getElementById("checkMemoryBtn").addEventListener("click", checkMemoryAnswer);
  document.getElementById("newInfluenceBtn").addEventListener("click", loadInfluenceTactic);
  document.getElementById("analyzeInfluenceBtn").addEventListener("click", analyzeInfluenceAnswer);
  document.getElementById("newStyleTipBtn").addEventListener("click", renderRandomStyleTip);
  document.getElementById("saveAestheticBtn").addEventListener("click", saveAestheticChecklist);
}

function renderDashboard() {
  const abilities = getAbilities();
  const average = abilities.reduce((sum, item) => sum + item.value, 0) / abilities.length;
  document.getElementById("disciplineScore").textContent = Math.round(average);
  document.getElementById("overallRank").textContent = rankFromScore(average);

  const weakest = [...abilities].sort((a, b) => a.value - b.value)[0];
  const strongest = [...abilities].sort((a, b) => b.value - a.value)[0];
  document.getElementById("profileSummary").textContent = `Punto forte: ${abilityLabels[strongest.key]}. Punto da spingere: ${abilityLabels[weakest.key]}. Rango generale ${rankFromScore(average)}.`;
  document.getElementById("finalRecap").textContent = buildFinalRecap(abilities);

  renderTodayPlan(false);
  renderAbilityRadar();
  renderGlobalParameters();
  renderAllModuleStatus();
  renderModeCardIndicators();
}

function buildFinalRecap(abilities) {
  const weakest = [...abilities].sort((a, b) => a.value - b.value)[0];
  const chessErrors = Object.values(state.mistakeCounts).reduce((sum, item) => sum + item, 0);
  const studied = state.studied.length;
  const memoryRate = state.memory.attempts ? Math.round((state.memory.correct / state.memory.attempts) * 100) : 0;
  return `Priorita': ${abilityLabels[weakest.key]}. Scacchi: ${state.chess.games} partite, ${chessErrors} pattern errore. Cultura: ${studied} argomenti studiati. Memoria: ${memoryRate}% precisione. Estetica: ${state.aesthetic.score || 0}/100.`;
}

function renderTodayPlan(forceNew) {
  const list = document.getElementById("todayTasks");
  const index = forceNew ? Math.floor(Math.random() * dailyPlans.length) : state.completedDays % dailyPlans.length;
  list.innerHTML = "";
  dailyPlans[index].forEach((task) => {
    const item = document.createElement("li");
    item.textContent = task;
    list.appendChild(item);
  });
}

function getAbilities() {
  const buckets = Object.fromEntries(generalProfileCategories.map((category) => [category.key, []]));
  Object.keys(moduleSkillDefinitions).forEach((moduleKey) => {
    getModuleSkills(moduleKey).forEach((skill) => {
      if (buckets[skill.general]) buckets[skill.general].push(skill.value);
    });
  });
  return generalProfileCategories.map((category) => ({
    key: category.key,
    label: category.label,
    value: Math.round(averageArray(buckets[category.key]))
  }));
}

function renderAbilityRadar() {
  const svg = document.getElementById("abilityRadar");
  const abilities = getAbilities();
  const labeledAbilities = abilities.map((ability) => ({ ...ability, label: abilityLabels[ability.key] }));
  svg.innerHTML = buildRadarMarkup(labeledAbilities, 380, 190, 112, true);

  const abilityList = document.getElementById("abilityList");
  const generalScore = Math.round(averageArray(abilities.map((ability) => ability.value)));
  abilityList.classList.add("profile-skill-list");
  abilityList.innerHTML = `
    <div class="module-score-card profile-score-card">
      <span>Punteggio generale</span>
      <strong>${generalScore}</strong>
      <em>Rango ${rankFromScore(generalScore)}</em>
    </div>
    ${renderSkillBars(labeledAbilities)}
  `;
}

function buildRadarMarkup(values, size, center, maxRadius, showLabels) {
  const angles = [-90, -30, 30, 90, 150, 210].map((deg) => (Math.PI / 180) * deg);
  const pointFor = (radius, index) => {
    const angle = angles[index];
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
  };
  const rings = [0.33, 0.66, 1].map((ratio) => {
    const points = angles.map((_, index) => pointFor(maxRadius * ratio, index).join(",")).join(" ");
    return `<polygon class="radar-grid" points="${points}"></polygon>`;
  }).join("");
  const axes = angles.map((_, index) => {
    const [x, y] = pointFor(maxRadius, index);
    return `<line class="radar-axis" x1="${center}" y1="${center}" x2="${x}" y2="${y}"></line>`;
  }).join("");
  const shapePoints = values.map((item, index) => {
    const value = clamp(item.value || 0, 0, 100);
    const [x, y] = pointFor(maxRadius * (value / 100), index);
    return `${x},${y}`;
  }).join(" ");
  const dots = values.map((item, index) => {
    const value = clamp(item.value || 0, 0, 100);
    const [x, y] = pointFor(maxRadius * (value / 100), index);
    if (!showLabels) return `<circle class="radar-dot" cx="${x}" cy="${y}" r="4"></circle>`;
    const [labelX, labelY] = pointFor(maxRadius + 42, index);
    const [valueX, valueY] = pointFor(maxRadius + 58, index);
    return `<circle class="radar-dot" cx="${x}" cy="${y}" r="5"></circle><text class="radar-label" x="${labelX}" y="${labelY}">${item.label}</text><text class="radar-value" x="${valueX}" y="${valueY}">${Math.round(value)} ${rankFromScore(value)}</text>`;
  }).join("");
  return `<rect x="0" y="0" width="${size}" height="${size}" rx="8" fill="#ffffff"></rect>${rings}${axes}<polygon class="radar-shape" points="${shapePoints}"></polygon>${dots}`;
}

function renderGlobalParameters() {
  const container = document.getElementById("globalParamList");
  const abilities = getAbilities().map((ability) => ({
    label: abilityLabels[ability.key],
    value: ability.value
  }));
  container.classList.add("module-skill-panel");
  container.innerHTML = renderSkillBars(abilities);
}

function renderAllModuleStatus() {
  Object.keys(state.moduleMetrics).forEach((moduleKey) => renderModuleStatus(moduleKey));
}

function renderModuleStatus(moduleKey) {
  const skills = getModuleSkills(moduleKey);
  const score = getModuleScore(moduleKey);
  const radar = document.getElementById(`${moduleKey}ModuleRadar`);
  const metricBox = document.getElementById(`${moduleKey}ModuleMetrics`);
  if (radar) radar.innerHTML = buildRadarMarkup(skills, 280, 140, 82, false);
  if (metricBox) {
    metricBox.classList.add("module-skill-panel");
    metricBox.innerHTML = `
      <div class="module-score-card">
        <span>Punteggio totale</span>
        <strong>${score}</strong>
        <em>Rango ${rankFromScore(score)}</em>
      </div>
      ${renderSkillBars(skills)}
    `;
  }
  renderModulePatternAndTraining(moduleKey);
}

function renderModeCardIndicators() {
  Object.keys(moduleSkillDefinitions).forEach((moduleKey) => {
    const box = document.getElementById(`${moduleKey}CardIndicators`);
    if (!box) return;
    const values = getModuleSkills(moduleKey);
    const average = getModuleScore(moduleKey);
    box.classList.add("dashboard-card-profile");
    box.innerHTML = `
      <div class="dashboard-card-top">
        <svg class="dashboard-card-radar" viewBox="0 0 180 180" role="img" aria-label="Radar ${moduleKey}">
          ${buildRadarMarkup(values, 180, 90, 58, false)}
        </svg>
        <div class="dashboard-card-average">
          <strong>${average}</strong>
          <span>totale · Rango ${rankFromScore(average)}</span>
        </div>
      </div>
      <div class="dashboard-value-list">
        ${values.map((item) => `
          <div class="dashboard-value-row">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
            <div class="mini-track"><div class="mini-fill" style="width:${item.value}%"></div></div>
          </div>
        `).join("")}
      </div>
      <div class="dashboard-card-trend">${dashboardTrend(moduleKey, average)}</div>
    `;
  });
}

function getModuleSkills(moduleKey) {
  const m = state.moduleMetrics[moduleKey] || {};
  const metric = (key, fallback = 35) => typeof m[key] === "number" ? m[key] : fallback;
  const patternCount = (key) => state.mistakeCounts[key] || 0;
  const studied = state.studied.length;
  const planAverage = state.planScores.length ? averageArray(state.planScores) : metric("ragionamento");
  const logicAccuracy = state.logicAttempts ? (state.logicSolved / state.logicAttempts) * 100 : metric("efficacia");
  const memoryAccuracy = state.memory.attempts ? (state.memory.correct / state.memory.attempts) * 100 : metric("efficacia");
  const reflexScore = state.reflexBest ? clamp(105 - state.reflexBest / 7, 10, 99) : metric("tempo");
  const aestheticScore = state.aesthetic.score || metric("efficacia");
  const social = state.socialScores;

  const profiles = {
    chess: [
      ["Concentrazione", metric("lucidita") - patternCount("concentration") * 3],
      ["Calcolo", metric("ragionamento") - patternCount("calculation") * 3],
      ["Strategia", (metric("adattamento") + metric("ragionamento")) / 2],
      ["Visione minacce", metric("rischio") - patternCount("hangingPiece") * 3],
      ["Sicurezza re", metric("rischio") - patternCount("kingSafety") * 3],
      ["Controllo impulso", metric("controllo") - patternCount("concentration") * 3]
    ],
    scenarios: [
      ["Lettura contesto", social.context],
      ["Controllo emotivo", metric("controllo")],
      ["Assertività", social.assertiveness],
      ["Gestione rischio", social.risk],
      ["Tempismo", social.timing],
      ["Piano B", social.contingency]
    ],
    culture: [
      ["Comprensione", metric("ragionamento") + studied * 2],
      ["Memoria concetti", metric("sostenibilita") + studied * 1.5],
      ["Collegamenti", metric("adattamento") + studied * 1.5],
      ["Profondità", metric("ragionamento") + studied * 1.5],
      ["Applicazione pratica", metric("efficacia") + studied],
      ["Richiamo", metric("tempo") + (state.cultureReviews.length ? 4 : 0)]
    ],
    planning: [
      ["Chiarezza obiettivo", (metric("lucidita") + planAverage) / 2],
      ["Priorità", (metric("ragionamento") + planAverage) / 2],
      ["Gestione rischio", metric("rischio")],
      ["Flessibilità", metric("flessibilita", metric("adattamento"))],
      ["Sostenibilità", metric("sostenibilita")],
      ["Piano B", metric("adattamento") + (state.planScores.length ? 4 : 0)]
    ],
    defense: [
      ["Distanza", metric("adattamento") + state.defenseLevel * 2],
      ["Riflessi", reflexScore],
      ["Controllo", metric("controllo")],
      ["Prevenzione", metric("rischio")],
      ["Movimento", metric("adattamento") + state.defenseLevel * 2],
      ["Reazione", (metric("tempo") + reflexScore) / 2]
    ],
    logic: [
      ["Deduzione", metric("ragionamento") + state.logicSolved * 3],
      ["Precisione", logicAccuracy],
      ["Velocità", metric("tempo")],
      ["Pattern", metric("adattamento") + state.logicSolved * 2],
      ["Coerenza", (metric("controllo") + metric("ragionamento")) / 2],
      ["Problem solving", (metric("efficacia") + metric("ragionamento")) / 2]
    ],
    memory: [
      ["Richiamo", memoryAccuracy],
      ["Sequenze", metric("ragionamento") + state.memory.level * 2],
      ["Attenzione", metric("lucidita")],
      ["Precisione", (metric("efficacia") + memoryAccuracy) / 2],
      ["Memoria visiva", metric("adattamento") + state.memory.level],
      ["Resistenza", metric("sostenibilita") + Math.min(state.memory.attempts, 12)]
    ],
    influence: [
      ["Framing", metric("ragionamento")],
      ["Leva sociale", metric("efficacia")],
      ["Confini etici", (metric("sostenibilita") + metric("controllo")) / 2],
      ["Lettura persona", metric("adattamento")],
      ["Negoziazione", state.influence.average],
      ["Gestione obiezioni", metric("flessibilita", metric("adattamento"))]
    ],
    aesthetic: [
      ["Cura personale", aestheticScore],
      ["Stile", metric("adattamento") + state.aesthetic.streak * 2],
      ["Postura", metric("controllo")],
      ["Pelle/capelli", (metric("ragionamento") + aestheticScore) / 2],
      ["Presenza", (metric("controllo") + aestheticScore) / 2],
      ["Coerenza look", metric("sostenibilita") + state.aesthetic.streak * 3]
    ]
  };

  const rawValues = Object.fromEntries((profiles[moduleKey] || []).map(([label, value]) => [label, value]));
  return (moduleSkillDefinitions[moduleKey] || []).map((skill) => ({
    ...skill,
    value: Math.round(clamp(rawValues[skill.label] ?? 35, 10, 99))
  }));
}

function getModuleScore(moduleKey) {
  const skills = getModuleSkills(moduleKey);
  return Math.round(averageArray(skills.map((skill) => skill.value)));
}

function renderSkillBars(skills) {
  return `<div class="dashboard-value-list">${skills.map((skill) => `
    <div class="dashboard-value-row">
      <span>${skill.label}</span>
      <strong>${skill.value}</strong>
      <div class="mini-track"><div class="mini-fill" style="width:${skill.value}%"></div></div>
    </div>
  `).join("")}</div>`;
}

function dashboardTrend(moduleKey, average) {
  const patternTotal = Object.values(state.modulePatterns[moduleKey] || {}).reduce((sum, value) => sum + value, 0);
  const trends = {
    chess: state.chess.games ? `${state.chess.games} partite · accuratezza ${state.chess.lastAccuracy || 0}%` : "Base iniziale · migliora giocando partite",
    scenarios: patternTotal ? `${patternTotal} pattern rilevati · media ${average}` : "Base iniziale · rispondi agli scenari",
    culture: `${state.studied.length} argomenti · ${state.cultureReviews.length} ripassi programmati`,
    planning: state.planScores.length ? `${state.planScores.length} piani · media ${Math.round(averageArray(state.planScores))}` : "Base iniziale · scrivi un piano",
    defense: state.reflexBest ? `Livello ${state.defenseLevel} · miglior riflesso ${state.reflexBest} ms` : `Livello ${state.defenseLevel} · riflessi non misurati`,
    logic: state.logicAttempts ? `${state.logicSolved}/${state.logicAttempts} corretti · media ${average}` : "Base iniziale · risolvi un indovinello",
    memory: state.memory.attempts ? `Livello ${state.memory.level} · ${state.memory.correct}/${state.memory.attempts} prove forti` : `Livello ${state.memory.level} · base iniziale`,
    influence: state.influence.attempts ? `${state.influence.attempts} analisi · media ${state.influence.average}` : "Base iniziale · prova una tattica",
    aesthetic: `Score ${state.aesthetic.score || 0}/100 · streak ${state.aesthetic.streak || 0}`
  };
  return trends[moduleKey] || `Media ${average}`;
}

function updateModuleMetrics(moduleKey, changes) {
  if (!state.moduleMetrics[moduleKey]) return;
  Object.entries(changes).forEach(([key, delta]) => {
    if (typeof state.moduleMetrics[moduleKey][key] !== "number") return;
    state.moduleMetrics[moduleKey][key] = clamp(state.moduleMetrics[moduleKey][key] + delta, 0, 100);
  });
}

function addModulePattern(moduleKey, patternKey) {
  if (!state.modulePatterns[moduleKey]) state.modulePatterns[moduleKey] = {};
  state.modulePatterns[moduleKey][patternKey] = (state.modulePatterns[moduleKey][patternKey] || 0) + 1;
}

function renderModulePatternAndTraining(moduleKey) {
  const patternBox = document.getElementById(`${moduleKey}PatternBox`);
  const trainingBox = document.getElementById(`${moduleKey}TrainingBox`);
  if (!patternBox || !trainingBox) return;
  if (moduleKey === "chess") {
    renderChessModulePatternAndTraining(patternBox, trainingBox);
    return;
  }
  const patterns = state.modulePatterns[moduleKey] || {};
  const top = Object.entries(patterns).sort((a, b) => b[1] - a[1])[0];
  if (!top) return;
  patternBox.textContent = `Pattern principale: ${patternReadable(top[0])} (${top[1]} volte).`;
  trainingBox.textContent = trainingForPattern(moduleKey, top[0]);
}

function renderChessModulePatternAndTraining(patternBox, trainingBox) {
  const top = getCurrentGameTopPattern();
  if (!top) {
    patternBox.textContent = "Pattern partita: nessun errore ricorrente nella partita corrente.";
    trainingBox.textContent = "Allenamento: continua con mosse lente, controllando minacce e pezzi appesi.";
    return;
  }
  patternBox.textContent = `Pattern principale della partita: ${mistakeLabels[top[0]]} (${top[1]} volte).`;
  trainingBox.textContent = mistakeDrills[top[0]];
}

function getCurrentGameTopPattern() {
  const patterns = currentGame.patternCounts || {};
  return Object.entries(patterns).sort((a, b) => b[1] - a[1])[0] || null;
}

function patternReadable(key) {
  const labels = {
    order: "ordine sbagliato",
    missing: "elementi dimenticati",
    inversion: "inversione",
    distraction: "distrazione",
    vague: "risposta vaga",
    noPlanB: "manca piano B",
    highRisk: "rischio alto",
    slowReflex: "riflessi lenti",
    decoy: "distrattori",
    lowConsistency: "costanza bassa",
    darkInfluence: "leva scorretta",
    weakEvidence: "prove deboli",
    "ripasso programmato": "ripasso programmato",
    "ragionamento incompleto": "ragionamento incompleto"
  };
  return labels[key] || mistakeLabels[key] || key;
}

function trainingForPattern(moduleKey, key) {
  if (moduleKey === "chess") return mistakeDrills[key] || "Drill: rivedi 5 mosse e scrivi piano, minaccia, rischio.";
  if (moduleKey === "memory") return "Allenamento: usa chunking da 3 elementi, poi richiamo attivo dopo 20 secondi.";
  if (moduleKey === "scenarios") return "Allenamento: struttura risposta in contesto, frase, conseguenza, piano B.";
  if (moduleKey === "defense") return "Allenamento: 3 round lenti su guardia, footwork e reazione a stimolo.";
  if (moduleKey === "influence") return "Allenamento: riscrivi la leva rendendo chiari costi, confini e possibilita' di dire no.";
  if (moduleKey === "culture") return "Allenamento: ripasso programmato e spiegazione in parole tue.";
  if (moduleKey === "planning") return "Allenamento: aggiungi metrica, soglia di rischio e revisione a 72 ore.";
  if (moduleKey === "aesthetic") return "Allenamento: completa 5 punti checklist per 5 giorni.";
  return "Allenamento: ripeti l'esercizio spiegando il ragionamento.";
}

function rankFromScore(score) {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "E";
}

function createInitialBoard() {
  return [
    ["r", "n", "b", "q", "k", "b", "n", "r"],
    ["p", "p", "p", "p", "p", "p", "p", "p"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],
    ["R", "N", "B", "Q", "K", "B", "N", "R"]
  ];
}

function createInitialGameState() {
  return {
    castling: { K: true, Q: true, k: true, q: true },
    enPassant: null,
    halfmove: 0
  };
}

function createNewGame() {
  const level = state && state.chess ? getActiveBotLevel(state.chess.botLevel || 1) : 1;
  const profile = getBotProfile(level);
  const startedAt = Date.now();
  const reviewResult = createStableReviewResult({ status: "idle" });
  const game = {
    id: createChessGameId(startedAt),
    date: new Date(startedAt).toISOString(),
    moves: [],
    mistakes: [],
    patternCounts: {},
    reviewIndex: -1,
    showOnlyKeyMoments: false,
    reviewStatus: "idle",
    reviewResult,
    reviewFailed: false,
    startedAt,
    endedAt: null,
    initialState: createInitialGameState(),
    exerciseObjects: [],
    activeExerciseIndex: 0,
    drillSelection: null,
    drillAttempt: null,
    botLevel: level,
    botElo: profile.elo,
    botLabel: profile.label,
    result: "in corso",
    status: "in corso",
    finalState: "in corso",
    playerColor: "Bianco"
  };
  game.moveList = game.moves;
  return game;
}

function createStableReviewResult(overrides = {}) {
  return {
    engineAnalysis: [],
    moveClassifications: {},
    drills: [],
    summary: null,
    error: null,
    status: "idle",
    engineBased: false,
    completed: false,
    ...overrides
  };
}

function getSafeChessMoves() {
  return currentGame && Array.isArray(currentGame.moves) ? currentGame.moves.filter(Boolean) : [];
}

function setChessReviewStatus(reviewStatus, reviewResult = {}) {
  if (!currentGame) return createStableReviewResult({ ...reviewResult, status: reviewStatus });
  const stableResult = createStableReviewResult({
    ...(currentGame.reviewResult || {}),
    ...reviewResult,
    status: reviewStatus
  });
  currentGame.reviewStatus = reviewStatus;
  currentGame.reviewResult = stableResult;
  currentGame.engineAnalysisInProgress = reviewStatus === "analyzing";
  currentGame.reviewFailed = reviewStatus === "error";
  console.log("reviewStatus:", reviewStatus);
  console.log("reviewResult:", stableResult);
  console.log("engineAnalysis:", stableResult?.engineAnalysis);
  return stableResult;
}

function getReviewStatusMessage(status) {
  if (status === "idle") return "Avvia la review per ricevere il report del coach.";
  if (status === "analyzing") return "Stockfish sta analizzando la partita...";
  if (status === "error") return "Errore durante l'analisi. Riprova.";
  return null;
}

function createChessGameId(startedAt = Date.now()) {
  const gameNumber = state && state.chess ? (state.chess.games || 0) + 1 : 1;
  return `chess-${gameNumber}-${startedAt.toString(36)}`;
}

function resetChessGameData() {
  currentGame = createNewGame();
  currentGame.mistakes = [];
  currentGame.patternCounts = {};
  currentGame.reviewIndex = -1;
  currentGame.showOnlyKeyMoments = false;
  currentGame.moveList = currentGame.moves;
  reviewBoard = null;
  lastMoveSquares = null;
  reviewMoveSquares = null;
  return currentGame;
}

function getCurrentGameHistory() {
  return JSON.parse(JSON.stringify(currentGame));
}

function getMoveRecord(moveReference) {
  if (typeof moveReference === "number") return currentGame.moves[moveReference] || null;
  return moveReference || null;
}

function getFenBeforeMove(moveReference) {
  const record = getMoveRecord(moveReference);
  return record ? record.fenBefore : null;
}

function getFenAfterMove(moveReference) {
  const record = getMoveRecord(moveReference);
  return record ? record.fenAfter : null;
}

function saveMoveData(record) {
  if (currentGame) {
    currentGame.reviewStatus = "idle";
    currentGame.reviewResult = createStableReviewResult({ status: "idle" });
    currentGame.reviewFailed = false;
    currentGame.engineError = null;
    currentGame.supabaseAnalysisQueued = false;
    currentGame.supabaseExercisesQueued = false;
  }
  const normalized = {
    gameId: currentGame.id,
    ply: currentGame.moves.length + 1,
    ...record,
    moveListIndex: currentGame.moves.length,
    colorMoved: record.colorMoved || record.color,
    timeSeconds: typeof record.timeSeconds === "number" ? record.timeSeconds : record.seconds || 0,
    san: record.san || record.moveSan || record.move,
    moveSan: record.moveSan || record.san || record.move,
    uci: record.uci || null,
    fenBefore: record.fenBefore || null,
    fenAfter: record.fenAfter || null
  };
  currentGame.moves.push(normalized);
  currentGame.moveList = currentGame.moves;
  queueSupabaseMoveSave(normalized);
  return normalized;
}

function queueSupabaseMoveSave(move) {
  if (move.supabaseQueued) return;
  move.supabaseQueued = true;
  queueSupabaseWrite("moves", buildSupabaseMovePayload(move));
}

function queueSupabaseGameSave(stage = "partial", analysis = null) {
  if (!currentGame || !currentGame.id) return;
  const payload = buildSupabaseGamePayload(stage, analysis || buildGameAnalysis(currentGame.result || "partial", currentGame.endReason || null));
  queueSupabaseWrite("games", payload);
}

function queueSupabaseAnalysisSave(analysis) {
  if (!currentGame || !currentGame.id || currentGame.supabaseAnalysisQueued) return;
  currentGame.supabaseAnalysisQueued = true;
  queueSupabaseWrite("analyses", buildSupabaseAnalysisPayload(analysis));
  queueSupabaseExerciseSaves(analysis);
}

function queueSupabaseExerciseSaves(analysis) {
  if (!analysis || currentGame.supabaseExercisesQueued) return;
  currentGame.supabaseExercisesQueued = true;
  const exercises = analysis.exerciseObjects || [];
  chessDebugLog("exercise-created", { count: exercises.length, exercises });
  console.log("drillCreated", exercises);
  exercises.forEach((exercise) => {
    queueSupabaseWrite("exercises", {
      game_id: exercise.game_id || currentGame.id,
      fen_before: exercise.fen_before,
      correct_move: exercise.correct_move,
      theme: exercise.theme,
      difficulty: exercise.difficulty,
      explanation: exercise.explanation,
      created_at: new Date().toISOString(),
      payload: {
        ...exercise,
        source: "chess-engine-review",
        bot_level: analysis.botLevel,
        result: analysis.result
      }
    });
  });
}

function buildSupabaseMovePayload(move) {
  return {
    game_id: currentGame.id,
    ply: move.ply,
    move_number: move.moveNumber,
    side: move.side,
    color: move.colorMoved || move.color,
    san: move.san || move.moveSan || move.move,
    uci: move.uci,
    fen_before: move.fenBefore,
    fen_after: move.fenAfter,
    time_seconds: move.timeSeconds || move.seconds || 0,
    classification: move.classification,
    quality: move.quality,
    eval_before: move.evalBefore,
    eval_after: move.evalAfter,
    best_move: move.bestMoveText,
    pattern: move.pattern,
    created_at: new Date().toISOString(),
    payload: move
  };
}

function buildSupabaseGamePayload(stage, analysis) {
  return {
    game_id: currentGame.id,
    date: currentGame.date,
    saved_at: new Date().toISOString(),
    stage,
    bot_level: currentGame.botLevel,
    bot_elo: currentGame.botElo,
    bot_label: currentGame.botLabel,
    result: currentGame.result,
    status: currentGame.status,
    final_state: currentGame.finalState,
    player_color: currentGame.playerColor,
    move_count: currentGame.moves.length,
    accuracy: analysis && analysis.engineBased ? analysis.accuracy : null,
    bot_accuracy: analysis && analysis.engineBased ? analysis.botAccuracy : null,
    main_pattern: analysis && analysis.mainPattern ? analysis.mainPattern.key : null,
    payload: {
      game: getCurrentGameHistory(),
      analysis
    }
  };
}

function buildSupabaseAnalysisPayload(analysis) {
  return {
    game_id: currentGame.id,
    analyzed_at: new Date().toISOString(),
    engine: ChessEngineService && ChessEngineService.getStatus ? ChessEngineService.getStatus().name : "Stockfish",
    engine_based: Boolean(analysis && analysis.engineBased),
    accuracy: analysis ? analysis.accuracy : null,
    bot_accuracy: analysis ? analysis.botAccuracy : null,
    result: analysis ? analysis.result : currentGame.result,
    main_pattern: analysis && analysis.mainPattern ? analysis.mainPattern.key : null,
    coach_summary: analysis && analysis.coachSummary ? analysis.coachSummary.summary : null,
    payload: {
      analysis,
      moves: getSafeChessMoves().map((move) => ({
        ply: move.ply,
        san: move.san,
        uci: move.uci,
        classification: move.classification,
        quality: move.quality,
        epLoss: move.epLoss,
        loss: move.loss,
        bestMove: move.bestMoveText,
        pattern: move.pattern,
        drill: move.drill
      })),
      exercises: analysis && analysis.exerciseObjects ? analysis.exerciseObjects : [],
      coach: analysis && analysis.coachSummary ? analysis.coachSummary : null
    }
  };
}

function setChessGameFinalState(result, reason = null) {
  currentGame.result = result;
  currentGame.endReason = reason;
  currentGame.status = chessFinalStateLabel(result, reason);
  currentGame.finalState = currentGame.status;
  currentGame.endedAt = new Date().toISOString();
}

function chessFinalStateLabel(result, reason = null) {
  if (reason === "checkmate") return "scacco matto";
  if (reason === "stalemate" || result === "draw") return "patta";
  if (reason === "resign") return "abbandono";
  if (!result || result === "partial" || result === "in corso") return "in corso";
  return "conclusa";
}

function resetChess() {
  clearBotTimer();
  board = createInitialBoard();
  gameState = createInitialGameState();
  selectedSquare = null;
  history = [];
  moveNumber = 1;
  playerMoveStats = {};
  thinkStartedAt = Date.now();
  chessGameOver = false;
  reviewBoard = null;
  lastMoveSquares = null;
  reviewMoveSquares = null;
  resetChessGameData();
  document.getElementById("coachMessage").textContent = "Nuova partita. Prima domanda: quale casa centrale controlla la tua mossa?";
  document.getElementById("chessDrill").textContent = "Gioca 5 mosse lente: prima di ogni mossa trova una minaccia per entrambi i lati.";
  document.getElementById("gameAnalysis").textContent = "Finisci una partita o premi Rivedi partita per analizzare le mosse gia' giocate.";
  document.getElementById("moveReviewList").innerHTML = "";
  document.getElementById("reviewAccuracy").textContent = "--";
  resetReviewPanel();
  renderChessExercises(buildGameAnalysis("partial"));
  updateReviewEvalBar(0);
  renderGameReport(buildGameAnalysis("partial"));
  renderBotLevel();
  renderMistakes();
  renderModuleStatus("chess");
  renderBoard();
}

function undoMovePair() {
  if (reviewBoard) return;
  clearBotTimer();
  if (history.length === 0) return;
  let lastWhiteState = null;
  let lastWhiteIndex = -1;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index].turn === "white") {
      lastWhiteState = history[index];
      lastWhiteIndex = index;
      break;
    }
  }
  if (!lastWhiteState) return;
  board = cloneBoard(lastWhiteState.board);
  gameState = cloneGameState(lastWhiteState.gameState || createInitialGameState());
  history = history.slice(0, lastWhiteIndex);
  selectedSquare = null;
  chessGameOver = false;
  while (currentGame.moves.length) {
    const removed = currentGame.moves.pop();
    if (removed?.side === "Bianco") break;
  }
  currentGame.moveList = currentGame.moves;
  currentGame.result = "in corso";
  currentGame.status = "in corso";
  currentGame.finalState = "in corso";
  currentGame.endedAt = null;
  rebuildCurrentGamePatterns();
  const lastMoves = getSafeChessMoves();
  const last = lastMoves[lastMoves.length - 1];
  lastMoveSquares = last ? moveSquaresFromRecord(last) : null;
  thinkStartedAt = Date.now();
  renderMistakes();
  renderModuleStatus("chess");
  renderBoard();
}

function renderBoard() {
  const displayBoard = reviewBoard || board;
  const boardElement = document.getElementById("chessBoard");
  boardElement.innerHTML = "";
  const legalTargets = selectedSquare && !reviewBoard ? getLegalMoves(board, selectedSquare.row, selectedSquare.col) : [];
  const activeLastMove = reviewBoard ? reviewMoveSquares : lastMoveSquares;
  const activeReviewMove = reviewBoard && currentGame.reviewIndex >= 0 ? currentGame.moves[currentGame.reviewIndex] || null : null;
  const activeQualityClass = activeReviewMove ? ` move-${reviewQualityClass(activeReviewMove.quality)}` : "";
  const checkedKing = getCheckedKingSquare(displayBoard);

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = displayBoard[row][col];
      const square = document.createElement("button");
      const isLight = (row + col) % 2 === 0;
      const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
      const legalMove = legalTargets.find((move) => move.toRow === row && move.toCol === col);
      const isLastFrom = activeLastMove && activeLastMove.fromRow === row && activeLastMove.fromCol === col;
      const isLastTo = activeLastMove && activeLastMove.toRow === row && activeLastMove.toCol === col;
      const isCheck = checkedKing && checkedKing.row === row && checkedKing.col === col;
      square.className = `square ${isLight ? "light" : "dark"}${isSelected ? " selected" : ""}${legalMove ? " legal" : ""}${legalMove && piece ? " capture" : ""}${isLastFrom ? ` last-from${activeQualityClass}` : ""}${isLastTo ? ` last-to${activeQualityClass}` : ""}${isCheck ? " in-check" : ""}`;
      square.type = "button";
      square.disabled = Boolean(reviewBoard) || chessGameOver;
      square.setAttribute("aria-label", squareLabel(displayBoard, row, col));
      if (col === 0) {
        const rank = document.createElement("span");
        rank.className = "coord-label rank-label";
        rank.textContent = String(8 - row);
        square.appendChild(rank);
      }
      if (row === 7) {
        const file = document.createElement("span");
        file.className = "coord-label file-label";
        file.textContent = String.fromCharCode(97 + col);
        square.appendChild(file);
      }
      if (piece) {
        const img = document.createElement("img");
        img.className = "piece-img";
        img.src = pieceImage(piece);
        img.alt = pieceNames[piece];
        square.appendChild(img);
      }
      if (activeReviewMove && isLastTo) {
        const symbol = document.createElement("span");
        const meta = getMoveQualityMeta(activeReviewMove.quality);
        symbol.className = `board-move-symbol ${reviewQualityClass(activeReviewMove.quality)}`;
        symbol.textContent = meta.icon;
        square.appendChild(symbol);
      }
      square.addEventListener("click", () => handleSquareClick(row, col));
      boardElement.appendChild(square);
    }
  }

  document.getElementById("evalStatus").textContent = `Valutazione ${formatEval(evaluateBoard(displayBoard))}`;
  if (reviewBoard) {
    document.getElementById("turnStatus").textContent = "Revisione";
  } else if (chessGameOver) {
    document.getElementById("turnStatus").textContent = "Partita conclusa";
  } else {
    document.getElementById("turnStatus").textContent = isKingInCheck(board, "w") ? "Sei sotto scacco" : "Tocca a te";
  }
}

function getCheckedKingSquare(currentBoard) {
  if (isKingInCheck(currentBoard, "w")) return findKing(currentBoard, "w");
  if (isKingInCheck(currentBoard, "b")) return findKing(currentBoard, "b");
  return null;
}

function findKing(currentBoard, color) {
  const kingPiece = color === "w" ? "K" : "k";
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (currentBoard[row][col] === kingPiece) return { row, col };
    }
  }
  return null;
}

function pieceImage(piece) {
  if (pieceImageCache[piece]) return pieceImageCache[piece];
  const white = isWhite(piece);
  const fill = white ? "#fff7e6" : "#151c22";
  const stroke = white ? "#26323b" : "#f2efe6";
  const accent = white ? "#d4b24f" : "#6f8f80";
  const kind = piece.toLowerCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${pieceShape(kind, fill, stroke, accent)}</svg>`;
  pieceImageCache[piece] = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return pieceImageCache[piece];
}

function pieceShape(kind, fill, stroke, accent) {
  const base = `<path d="M24 82h52l5 10H19l5-10Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>`;
  if (kind === "p") return `<circle cx="50" cy="25" r="14" fill="${fill}" stroke="${stroke}" stroke-width="5"/><path d="M38 42h24l7 40H31l7-40Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>${base}`;
  if (kind === "n") return `<path d="M34 79c4-19 1-33 14-45 6-6 9-12 7-22 14 7 24 20 22 36-1 10-8 15-17 18l9 13H34Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><circle cx="58" cy="35" r="3" fill="${accent}"/>${base}`;
  if (kind === "b") return `<circle cx="50" cy="18" r="10" fill="${fill}" stroke="${stroke}" stroke-width="5"/><path d="M50 30c17 13 20 29 8 49H42c-12-20-9-36 8-49Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><path d="M50 35l12 16" stroke="${accent}" stroke-width="5" stroke-linecap="round"/>${base}`;
  if (kind === "r") return `<path d="M28 16h12v10h20V16h12v31H28V16Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><path d="M34 47h32l6 35H28l6-35Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>${base}`;
  if (kind === "q") return `<path d="M22 35l10-19 13 18 5-23 5 23 13-18 10 19-9 44H31l-9-44Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/><circle cx="32" cy="16" r="5" fill="${accent}"/><circle cx="50" cy="11" r="5" fill="${accent}"/><circle cx="68" cy="16" r="5" fill="${accent}"/>${base}`;
  return `<path d="M46 8h8v12h12v8H54v12h-8V28H34v-8h12V8Z" fill="${accent}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/><path d="M34 42h32l7 40H27l7-40Z" fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round"/>${base}`;
}

function handleSquareClick(row, col) {
  if (reviewBoard || chessGameOver) return;
  const piece = board[row][col];
  if (selectedSquare) {
    const legalMoves = getLegalMoves(board, selectedSquare.row, selectedSquare.col);
    const move = legalMoves.find((item) => item.toRow === row && item.toCol === col);
    if (move) {
      makePlayerMove(move);
      return;
    }
  }
  selectedSquare = piece && isWhite(piece) ? { row, col } : null;
  renderBoard();
}

function makePlayerMove(move) {
  const beforeGameState = cloneGameState(gameState);
  history.push({ turn: "white", board: cloneBoard(board), gameState: beforeGameState });
  const before = cloneBoard(board);
  const movedPiece = before[move.fromRow][move.fromCol];
  const seconds = Math.round((Date.now() - thinkStartedAt) / 1000);
  board = applyMove(board, move);
  updateGameStateForMove(move, before);
  selectedSquare = null;
  const analysis = analyzePlayerMove(before, board, move, movedPiece, seconds);
  const classification = classifyChessMove(analysis, before, board, move);
  const record = buildMoveRecord({
    side: "Bianco",
    color: "w",
    move,
    piece: movedPiece,
    before,
    after: board,
    beforeState: beforeGameState,
    afterState: gameState,
    seconds,
    analysis,
    classification
  });
  record.quality = "good";
  const engineReadyForReview = isStockfishEngineEnabled();
  record.classification = engineReadyForReview ? "In attesa Stockfish" : "Da analizzare";
  record.categories = [];
  record.pattern = null;
  record.loss = 0;
  record.bestGap = 0;
  record.accuracyScore = null;
  record.bestMoveText = engineReadyForReview ? "Stockfish" : "Motore non disponibile";
  record.drill = engineReadyForReview ? "Attendi la review Stockfish per il drill reale." : "Analisi reale bloccata: installa una build Stockfish funzionante per avere il drill engine-based.";
  record.comment = engineReadyForReview ? "Mossa salvata. La classificazione reale verra' calcolata da Stockfish." : "Mossa salvata. Stockfish non e' disponibile, quindi questa mossa non riceve una classificazione engine-based.";
  record.note = record.comment;
  const savedRecord = saveMoveData(record);
  lastMoveSquares = moveSquaresFromRecord(savedRecord);
  document.getElementById("coachMessage").textContent = engineReadyForReview ? "Mossa salvata. Stockfish analizzera' la precisione reale; ora il motore calcola la risposta." : "Mossa salvata. Stockfish sta partendo: se non risponde, ricarica dal server locale.";
  document.getElementById("chessDrill").textContent = engineReadyForReview ? "Drill in attesa: dopo la review Stockfish apparira' il pattern reale." : "Drill in pausa: la review reale richiede Stockfish disponibile.";
  renderBoard();
  if (finishIfGameOver("b")) return;
  botMoveTimer = window.setTimeout(makeBotMove, 420);
}

function activeBotLevelForAnalysis() {
  return getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
}

async function makeBotMove() {
  botMoveTimer = null;
  if (chessGameOver) return;
  const moves = getAllLegalMoves(board, "b");
  if (moves.length === 0) {
    finishIfGameOver("b");
    return;
  }
  const beforeGameState = cloneGameState(gameState);
  const activeLevelForThinking = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const activeProfileForThinking = getBotProfile(activeLevelForThinking);
  document.getElementById("coachMessage").textContent = `Stockfish livello ${activeLevelForThinking} (${activeProfileForThinking.elo} Elo) sta calcolando...`;
  const botMove = await chooseBotMoveAsync(board, moves);
  if (!botMove || chessGameOver) {
    const error = currentGame.engineError ? ` Dettaglio: ${currentGame.engineError}` : "";
    document.getElementById("coachMessage").textContent = `Stockfish non e' riuscito a muovere. Avvia il server locale e ricarica la pagina.${error}`;
    renderBotLevel();
    return;
  }
  history.push({ turn: "black", board: cloneBoard(board), gameState: beforeGameState });
  const movedPiece = board[botMove.fromRow][botMove.fromCol];
  const before = cloneBoard(board);
  const engineResult = currentGame.lastEngineResult && currentGame.lastEngineResult.ok ? currentGame.lastEngineResult : null;
  const engineBestMove = engineResult ? moveFromUci(engineResult.bestMove, moves) : null;
  const evalBefore = engineResult ? engineEvalToCentipawns(engineResult.evaluation, "b", "w") : 0;
  board = applyMove(board, botMove);
  updateGameStateForMove(botMove, before);
  const evalAfter = evalBefore;
  const botMates = getAllLegalMoves(board, "w").length === 0 && isKingInCheck(board, "w");
  const botWasBest = engineBestMove && sameMove(botMove, engineBestMove);
  const botClassification = botMates
    ? { quality: "excellent", label: "Scacco matto", explanation: engineResult ? "Stockfish chiude la partita." : "il bot locale chiude la partita." }
      : engineResult && engineResult.source === "book"
        ? { quality: "book", label: "Mossa da libro", explanation: "segue il book d'apertura curato prima della ricerca motore." }
      : botWasBest
        ? { quality: "best", label: "Migliore", explanation: "coincide con la mossa migliore calcolata da Stockfish." }
        : { quality: "good", label: "Buona", explanation: "mossa scelta tra le linee Stockfish del livello selezionato." };
  const activeBotLevel = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const activeBotProfile = getBotProfile(activeBotLevel);
  const botRecord = {
    side: "Nero",
    color: "b",
    move: formatMoveText(botMove),
    readable: readableMove(movedPiece, botMove, before),
    piece: movedPiece,
    moveNumber: Math.floor(currentGame.moves.length / 2) + 1,
    fromRow: botMove.fromRow,
    fromCol: botMove.fromCol,
    toRow: botMove.toRow,
    toCol: botMove.toCol,
    san: moveToSan(before, board, botMove, movedPiece, "b"),
    moveSan: moveToSan(before, board, botMove, movedPiece, "b"),
    uci: moveToUci(before, botMove),
    colorMoved: "b",
    timeSeconds: 0,
    fenBefore: boardToFen(before, "b", beforeGameState),
    fenAfter: boardToFen(board, "w", gameState),
    eval: evalAfter,
    seconds: 0,
    categories: [],
    loss: 0,
    quality: botMates ? "excellent" : botClassification.quality,
    classification: botClassification.label,
    bestMoveText: botMates ? "Scacco matto" : engineBestMove ? formatMoveText(engineBestMove) : "Stockfish",
    evalBefore,
    evalAfter,
    evalDiff: evalAfter - evalBefore,
    variation: engineResult && engineResult.pv && engineResult.pv.length ? engineResult.pv.slice(0, 5).join(" ") : "-",
    pattern: null,
    drill: "-",
    note: `Risposta Stockfish: ${readableMove(movedPiece, botMove, before)}.`,
    comment: botMates ? "Stockfish chiude la partita con scacco matto." : `Stockfish livello ${activeBotLevel} (${activeBotProfile.elo} Elo) gioca: ${botClassification.explanation}`,
    boardBefore: cloneBoard(before),
    boardAfter: cloneBoard(board),
    engineAnalysis: null,
    reviewMeta: engineResult ? { engine: engineResult.source === "book" ? "Book apertura" : ChessEngineService.getStatus().name || "Stockfish", depth: engineResult.depth || 0, timeMs: engineResult.source === "book" ? 0 : getEngineTimeForLevel(activeBotLevel), model: engineResult.source === "book" ? "book-fast-path" : "stockfish-bot" } : null
  };
  const savedBotRecord = saveMoveData(botRecord);
  lastMoveSquares = moveSquaresFromRecord(savedBotRecord);
  moveNumber += 1;
  thinkStartedAt = Date.now();
  document.getElementById("coachMessage").textContent = `Il bot risponde ${formatMoveText(botMove)}. Cerca la minaccia piu' forzante prima di muovere.`;
  renderBoard();
  finishIfGameOver("w");
}

function buildMoveRecord({ side, color, move, piece, before, after, beforeState, afterState, seconds, analysis, classification }) {
  const realError = isErrorQuality(classification.quality);
  const categories = realError ? analysis.categories : [];
  const pattern = categories[0] || null;
  const drill = pattern ? mistakeDrills[pattern] : "Drill mantenimento: prima della prossima mossa trova una minaccia per entrambi i lati.";
  const hasUsefulBestMove = analysis.bestMove && analysis.bestGap > 30 && !analysis.isMate;
  const bestMoveText = analysis.isMate ? "Scacco matto" : hasUsefulBestMove ? formatMoveText(analysis.bestMove) : "nessuna alternativa necessaria";
  const reviewSignals = buildReviewSignals(before, after, move, color, analysis, classification);
  const comment = buildCoachComment(classification, analysis, bestMoveText, drill);
  return {
    side,
    color,
    move: formatMoveText(move),
    readable: readableMove(piece, move, before),
    piece,
    moveNumber: Math.floor(currentGame.moves.length / 2) + 1,
    fromRow: move.fromRow,
    fromCol: move.fromCol,
    toRow: move.toRow,
    toCol: move.toCol,
    san: moveToSan(before, after, move, piece, color),
    moveSan: moveToSan(before, after, move, piece, color),
    uci: moveToUci(before, move),
    colorMoved: color,
    timeSeconds: seconds,
    fenBefore: boardToFen(before, color, beforeState),
    fenAfter: boardToFen(after, color === "w" ? "b" : "w", afterState),
    eval: analysis.afterEval,
    seconds,
    categories,
    loss: Math.max(0, analysis.bestGap),
    bestGap: Math.max(0, analysis.bestGap),
    accuracyScore: typeof analysis.accuracyScore === "number" ? analysis.accuracyScore : heuristicAccuracyScore(classification.quality, analysis.bestGap, reviewSignals),
    quality: classification.quality,
    classification: classification.label,
    bestMoveText,
    evalBefore: analysis.beforeEval,
    evalAfter: analysis.afterEval,
    evalDiff: analysis.afterEval - analysis.beforeEval,
    epLoss: analysis.epLoss,
    epBefore: analysis.epBefore,
    epBest: analysis.epBest,
    epPlayed: analysis.epPlayed,
    reviewRating: analysis.reviewRating,
    variation: hasUsefulBestMove ? analysis.variation : "-",
    pattern,
    phase: reviewSignals.phase,
    reviewSignals,
    drill,
    note: comment,
    comment,
    boardBefore: cloneBoard(before),
    boardAfter: cloneBoard(after)
  };
}

function buildCoachComment(classification, analysis, bestMoveText, drill) {
  const pattern = isErrorQuality(classification.quality) ? analysis.categories[0] : null;
  const patternText = pattern ? mistakeLabels[pattern] : "nessun pattern critico";
  if (analysis.isMate) {
    return `Questa e' ${classification.label}: la mossa conclude la partita con scacco matto. Non serve proporre un'alternativa casuale: il punto era riconoscere la rete di matto e chiuderla. Pattern: ${patternText}. Drill: rivedi la posizione finale e trova tutte le case di fuga controllate.`;
  }
  const delta = moveDeltaPawns(analysis.beforeEval, analysis.afterEval, "w");
  const epText = typeof analysis.epLoss === "number" ? ` Perdita risultato atteso: ${(analysis.epLoss * 100).toFixed(1)}%.` : "";
  const lossText = `Delta valutazione: ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} pedoni.${epText}`;
  const usefulAlternative = bestMoveText && bestMoveText !== "nessuna alternativa necessaria" && bestMoveText !== "-";
  const alternativeText = usefulAlternative ? `Alternativa migliore: ${bestMoveText}.` : "Non c'e' una alternativa migliore utile da mostrare: la mossa e' abbastanza coerente con la posizione.";
  return `Questa e' ${classification.label}: ${classification.explanation} ${lossText} Dovevi controllare minacce, catture e risposta forzante dell'avversario. ${alternativeText} Pattern: ${patternText}. Drill: ${drill}`;
}

function buildReviewSignals(before, after, move, color, analysis, classification) {
  const opponent = color === "w" ? "b" : "w";
  const movedPiece = before[move.fromRow][move.fromCol];
  const capturedPiece = move.enPassant ? before[move.fromRow][move.toCol] : before[move.toRow][move.toCol];
  const beforeLoose = looseMaterial(before, color);
  const afterLoose = looseMaterial(after, color);
  const opponentLooseBefore = looseMaterial(before, opponent);
  const opponentLooseAfter = looseMaterial(after, opponent);
  const ownThreatBefore = immediateThreatScore(before, color).score;
  const ownThreatAfter = immediateThreatScore(after, color).score;
  const opponentThreatBefore = immediateThreatScore(before, opponent).score;
  const opponentThreatAfter = immediateThreatScore(after, opponent).score;
  const phase = getChessPhase(before);
  const evalDelta = moveDeltaPawns(analysis.beforeEval, analysis.afterEval, color);
  const bestGapPawns = Math.max(0, analysis.bestGap) / 100;
  return {
    phase,
    piece: movedPiece,
    captured: capturedPiece,
    evalDelta,
    bestGapPawns,
    beforeLoose,
    afterLoose,
    looseChange: afterLoose - beforeLoose,
    opponentLooseChange: opponentLooseAfter - opponentLooseBefore,
    ownThreatChange: ownThreatAfter - ownThreatBefore,
    opponentThreatChange: opponentThreatAfter - opponentThreatBefore,
    givesCheck: isKingInCheck(after, opponent),
    givesMate: analysis.isMate,
    worsened: evalDelta < -0.3 || classification.quality === "mistake" || classification.quality === "blunder"
  };
}

function getChessPhase(currentBoard) {
  if (isEndgame(currentBoard)) return "Finale";
  if (currentGame.moves.length < 12) return "Apertura";
  return "Mediogioco";
}

function heuristicAccuracyScore(quality, bestGap, signals) {
  if (quality === "book") return 98;
  if (quality === "brilliant" || quality === "best") return 100;
  if (quality === "excellent") return clamp(98 - bestGap / 120, 95, 99);
  if (quality === "good") return clamp(93 - bestGap / 100, 88, 94);
  if (quality === "inexact") return clamp(86 - bestGap / 80, 75, 87);
  if (quality === "mistake") return clamp(72 - bestGap / 60 - Math.max(0, signals.looseChange) / 20, 45, 74);
  if (quality === "blunder") return clamp(42 - bestGap / 35 - Math.max(0, signals.looseChange) / 12, 0, 44);
  if (quality === "missed") return clamp(78 - bestGap / 55, 35, 80);
  return 90;
}

function readableMove(piece, move, currentBoard) {
  if (move.castle && move.toCol === 6) return "Arrocco corto";
  if (move.castle && move.toCol === 2) return "Arrocco lungo";
  const names = { p: "Pedone", n: "Cavallo", b: "Alfiere", r: "Torre", q: "Donna", k: "Re" };
  const capture = currentBoard[move.toRow][move.toCol] || move.enPassant ? "x" : "-";
  return `${names[piece.toLowerCase()]} ${coord(move.fromRow, move.fromCol)}${capture}${coord(move.toRow, move.toCol)}${move.enPassant ? " e.p." : ""}`;
}

function moveToUci(currentBoard, move) {
  const piece = currentBoard[move.fromRow][move.fromCol];
  const promotionRow = piece && piece.toLowerCase() === "p" ? (isWhite(piece) ? 0 : 7) : null;
  const promotion = promotionRow !== null && move.toRow === promotionRow ? "q" : "";
  return `${coord(move.fromRow, move.fromCol)}${coord(move.toRow, move.toCol)}${promotion}`;
}

function moveToSan(beforeBoard, afterBoard, move, piece, color) {
  if (move.castle && move.toCol === 6) return addSanCheckSuffix(afterBoard, color, "O-O");
  if (move.castle && move.toCol === 2) return addSanCheckSuffix(afterBoard, color, "O-O-O");
  const lower = piece.toLowerCase();
  const target = move.enPassant ? beforeBoard[move.fromRow][move.toCol] : beforeBoard[move.toRow][move.toCol];
  const capture = Boolean(target);
  const destination = coord(move.toRow, move.toCol);
  const promotionRow = lower === "p" ? (color === "w" ? 0 : 7) : null;
  const promotion = promotionRow !== null && move.toRow === promotionRow ? "=Q" : "";
  if (lower === "p") {
    const pawnPrefix = capture ? String.fromCharCode(97 + move.fromCol) : "";
    return addSanCheckSuffix(afterBoard, color, `${pawnPrefix}${capture ? "x" : ""}${destination}${promotion}`);
  }
  const letters = { n: "N", b: "B", r: "R", q: "Q", k: "K" };
  const disambiguation = sanDisambiguation(beforeBoard, move, piece, color);
  return addSanCheckSuffix(afterBoard, color, `${letters[lower]}${disambiguation}${capture ? "x" : ""}${destination}`);
}

function sanDisambiguation(beforeBoard, move, piece, color) {
  const lower = piece.toLowerCase();
  if (lower === "p" || lower === "k") return "";
  const matches = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (row === move.fromRow && col === move.fromCol) continue;
      const candidate = beforeBoard[row][col];
      if (!candidate || candidate.toLowerCase() !== lower) continue;
      if (color === "w" && !isWhite(candidate)) continue;
      if (color === "b" && !isBlack(candidate)) continue;
      const canReach = getPseudoMoves(beforeBoard, row, col).some((item) => item.toRow === move.toRow && item.toCol === move.toCol);
      if (canReach) matches.push({ row, col });
    }
  }
  if (!matches.length) return "";
  const sameFile = matches.some((item) => item.col === move.fromCol);
  const sameRank = matches.some((item) => item.row === move.fromRow);
  if (!sameFile) return String.fromCharCode(97 + move.fromCol);
  if (!sameRank) return String(8 - move.fromRow);
  return coord(move.fromRow, move.fromCol);
}

function addSanCheckSuffix(afterBoard, color, san) {
  const opponent = color === "w" ? "b" : "w";
  if (!isKingInCheck(afterBoard, opponent)) return san;
  return getAllLegalMoves(afterBoard, opponent).length ? `${san}+` : `${san}#`;
}

function moveSquaresFromRecord(record) {
  if (!record || typeof record.fromRow !== "number") return null;
  return {
    fromRow: record.fromRow,
    fromCol: record.fromCol,
    toRow: record.toRow,
    toCol: record.toCol
  };
}

function boardToFen(currentBoard, activeColor = "w", stateSnapshot = gameState) {
  const rows = currentBoard.map((row) => {
    let empty = 0;
    let fenRow = "";
    row.forEach((piece) => {
      if (!piece) {
        empty += 1;
        return;
      }
      if (empty) {
        fenRow += empty;
        empty = 0;
      }
      fenRow += piece;
    });
    return fenRow + (empty ? empty : "");
  });
  const rights = ["K", "Q", "k", "q"].filter((key) => stateSnapshot.castling && stateSnapshot.castling[key]).join("") || "-";
  const ep = stateSnapshot.enPassant ? coord(stateSnapshot.enPassant.row, stateSnapshot.enPassant.col) : "-";
  return `${rows.join("/")} ${activeColor} ${rights} ${ep} ${stateSnapshot.halfmove || 0} ${moveNumber}`;
}

function finishIfGameOver(sideToMove) {
  const moves = getAllLegalMoves(board, sideToMove);
  if (moves.length > 0) return false;
  const inCheck = isKingInCheck(board, sideToMove);
  if (!inCheck) finishGame("draw", "stalemate");
  else if (sideToMove === "b") finishGame("win", "checkmate");
  else finishGame("loss", "checkmate");
  return true;
}

function finishGame(result, reason = null) {
  chessGameOver = true;
  setChessGameFinalState(result, reason);
  const playedLevel = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const analysis = buildGameAnalysis(result, reason);
  const levelStats = getLevelStats(playedLevel);
  levelStats.games += 1;
  if (analysis.engineBased) {
    levelStats.accuracySum += analysis.accuracy;
    levelStats.accuracyGames += 1;
  }
  state.chess.games += 1;
  if (result === "win") {
    state.chess.wins += 1;
    levelStats.wins += 1;
  } else if (result === "loss") {
    state.chess.losses += 1;
    levelStats.losses += 1;
  } else {
    state.chess.draws += 1;
    levelStats.draws += 1;
  }
  state.chess.lastAccuracy = analysis.engineBased ? analysis.accuracy : 0;
  saveState();
  queueSupabaseGameSave("finish", analysis);
  renderBotLevel();
  renderMoveReview(true, analysis);
  renderDashboard();
  renderBoard();
}

function buildGameAnalysis(result = "partial", reason = currentGame.endReason || null) {
  const safeMoves = getSafeChessMoves();
  const whiteMoves = safeMoves.filter((move) => move.side === "Bianco");
  const blackMoves = safeMoves.filter((move) => move.side === "Nero");
  const reviewStatus = currentGame.reviewStatus || "idle";
  const reviewCompleted = reviewStatus === "completed" || Boolean(safeMoves.length && safeMoves.every((move) => move?.engineAnalysis));
  const reviewedWhiteMoves = whiteMoves.filter((move) => move?.engineAnalysis?.ok && move.quality !== "unknown");
  const reviewedBlackMoves = blackMoves.filter((move) => move?.engineAnalysis?.ok && move.quality !== "unknown");
  const counts = countMoveQualities(whiteMoves);
  const botCounts = countMoveQualities(blackMoves);
  const evalSeries = [0].concat(safeMoves.map((move) => move.evalAfter || 0));
  const playerAccuracyDetails = reviewedWhiteMoves.length ? computeAccuracyDetails(reviewedWhiteMoves, "w", result, evalSeries) : null;
  const rawAccuracy = playerAccuracyDetails ? playerAccuracyDetails.final : 0;
  const mistakeMap = {};
  (currentGame.mistakes || []).forEach((mistake) => {
    if (!mistake || !Array.isArray(mistake.categories)) return;
    mistake.categories.forEach((category) => {
      mistakeMap[category] = (mistakeMap[category] || 0) + 1;
    });
  });
  const topErrors = Object.entries(mistakeMap).sort((a, b) => b[1] - a[1]);
  let resultLabel = result === "win" ? "Vittoria" : result === "loss" ? "Sconfitta" : result === "draw" ? "Patta" : safeMoves.length ? "Analisi parziale" : "In corso";
  if (reason === "checkmate") resultLabel = result === "win" ? "Vittoria per scacco matto" : "Sconfitta per scacco matto";
  if (reason === "stalemate") resultLabel = "Patta per stallo";
  const exerciseObjects = buildChessExerciseObjects(whiteMoves);
  const exercises = exerciseObjects.length ? exerciseObjects.map((exercise) => `${exercise.theme}: ${exercise.explanation}`) : topErrors.length ? topErrors.slice(0, 2).map(([category]) => mistakeDrills[category]) : ["Esercizio: rigioca mentalmente le ultime 5 mosse e cerca una minaccia nascosta per ogni lato."];
  const botLevel = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const botProfile = getBotProfile(botLevel);
  const botAccuracyDetails = reviewedBlackMoves.length ? computeAccuracyDetails(reviewedBlackMoves, "b", result, evalSeries) : null;
  const rawBotAccuracy = botAccuracyDetails ? botAccuracyDetails.final : 0;
  const accuracy = calibratePlayerAccuracy(rawAccuracy, counts, result);
  const botAccuracy = blackMoves.length ? calibrateBotAccuracy(rawBotAccuracy, botCounts, botLevel) : 0;
  const engineAvailable = isStockfishEngineEnabled();
  const engineBased = Boolean(reviewCompleted && (reviewedWhiteMoves.length || reviewedBlackMoves.length));
  const mainPattern = topErrors[0] ? { key: topErrors[0][0], label: mistakeLabels[topErrors[0][0]], count: topErrors[0][1] } : null;
  const phase = getGamePhaseLabel();
  const gameRating = null;
  const analysis = {
    result,
    reason,
    resultLabel,
    accuracy,
    botAccuracy,
    counts,
    botCounts,
    evalSeries,
    topErrors,
    exercises,
    exerciseObjects,
    botLevel,
    botElo: botProfile.elo,
    botEloLabel: botProfile.displayElo || String(botProfile.elo),
    botLabel: botProfile.label,
    engineAvailable,
    engineBased,
    reviewStatus,
    reviewResult: currentGame.reviewResult || createStableReviewResult({ status: reviewStatus }),
    analysisSource: engineBased ? "Stockfish engine-based" : reviewStatus === "analyzing" ? "Stockfish sta analizzando" : "Stockfish non disponibile: analisi reale bloccata",
    engineError: currentGame.engineError || (engineAvailable ? null : "Motore non disponibile"),
    gameRating,
    phase,
    moveCount: safeMoves.length,
    playerMoveCount: whiteMoves.length,
    accuracyDetails: playerAccuracyDetails,
    botAccuracyDetails,
    accuracyBreakdown: buildAccuracyBreakdown(counts, whiteMoves.length, playerAccuracyDetails),
    mainPattern,
    message: ""
  };
  analysis.gameRating = engineBased && whiteMoves.length ? estimateGameRating(accuracy, botProfile.elo, result, analysis) : null;
  analysis.message = buildChessReportMessage(analysis);
  analysis.coachSummary = buildChessCoachSummary(analysis, whiteMoves);
  chessDebugLog("review-summary", {
    finalAccuracy: analysis.accuracy,
    botAccuracy: analysis.botAccuracy,
    gameRating: analysis.gameRating,
    moveClassifications: analysis.counts,
    accuracyDetails: analysis.accuracyDetails,
    botAccuracyDetails: analysis.botAccuracyDetails,
    reviewStatus: analysis.reviewStatus
  });
  console.log("finalAccuracy", analysis.accuracy);
  console.log("gameRating", analysis.gameRating);
  return analysis;
}

function buildChessExerciseObjects(playerMoves) {
  return playerMoves
    .filter((move) => move && ["inaccuracy", "inexact", "mistake", "blunder", "missed"].includes(move.quality))
    .map((move, index) => {
      const theme = move.pattern ? mistakeLabels[move.pattern] : move.quality === "missed" ? "Mossa mancata" : "Calcolo";
      const difficulty = move.quality === "blunder" ? 5 : move.quality === "mistake" || move.quality === "missed" ? 4 : 3;
      return {
        game_id: currentGame.id,
        exercise_index: index + 1,
        ply: move.ply,
        fen_before: move.fenBefore,
        correct_move: move.bestMoveText || move.engineAnalysis?.bestMove || null,
        theme,
        difficulty,
        explanation: move.comment || buildShortReviewComment(move),
        hint: `Cerca prima scacchi, catture e minacce. Tema: ${theme}.`,
        source_quality: move.quality
      };
    })
    .filter((exercise) => exercise.fen_before && exercise.correct_move);
}

function buildChessCoachSummary(analysis, playerMoves) {
  const averageTime = playerMoves.length ? Math.round(playerMoves.reduce((sum, move) => sum + (move.timeSeconds || move.seconds || 0), 0) / playerMoves.length) : 0;
  const strongMoves = (analysis.counts.best || 0) + (analysis.counts.great || 0) + (analysis.counts.brilliant || 0) + (analysis.counts.good || 0);
  const weakMoves = (analysis.counts.inaccuracy || 0) + (analysis.counts.inexact || 0) + (analysis.counts.mistake || 0) + (analysis.counts.blunder || 0) + (analysis.counts.missed || 0);
  const mainWeakness = analysis.mainPattern ? analysis.mainPattern.label : "nessun pattern critico";
  const focus = analysis.exerciseObjects && analysis.exerciseObjects.length ? analysis.exerciseObjects[0].theme : mainWeakness;
  return {
    summary: `${analysis.resultLabel}: precisione ${analysis.engineBased ? `${analysis.accuracy}%` : "in attesa"}, ${analysis.moveCount} mosse, tempo medio ${averageTime}s.`,
    strengths: strongMoves ? [`${strongMoves} mosse tra Migliore/Grande/Brillante/Buona`, "Uso di Stockfish per confermare le scelte sane"] : ["Partita ancora troppo breve per punti forti affidabili"],
    weaknesses: weakMoves ? [`${weakMoves} mosse da rivedere`, `Pattern principale: ${mainWeakness}`] : ["Nessun errore critico rilevato dalla review"],
    advice: ["Prima di muovere controlla candidate, minaccia avversaria e pezzi appesi.", "Rivedi solo i momenti chiave prima di giocare un'altra partita."],
    nextFocus: focus,
    averageThinkTime: averageTime
  };
}

function getGamePhaseLabel() {
  const moves = getSafeChessMoves();
  const lastMove = moves[moves.length - 1];
  const currentBoard = lastMove && lastMove.boardAfter ? lastMove.boardAfter : board;
  return getChessPhase(currentBoard);
}

function estimateGameRating(accuracy, botElo, result, analysis = null) {
  const counts = analysis && analysis.counts ? analysis.counts : {};
  const moveCount = analysis ? analysis.playerMoveCount || analysis.moveCount || 0 : 0;
  const complexityMoves = getSafeChessMoves().filter((move) => move.side === "Bianco" && typeof move.moveComplexity === "number");
  const averageComplexity = analysis?.accuracyDetails && typeof analysis.accuracyDetails.averageComplexity === "number"
    ? analysis.accuracyDetails.averageComplexity
    : complexityMoves.length
      ? complexityMoves.reduce((sum, move) => sum + move.moveComplexity, 0) / complexityMoves.length
      : 0.35;
  const normalizedMoveCount = Math.max(moveCount, 1);
  const exactTopCount = (counts.best || 0) + (counts.great || 0) + (counts.brilliant || 0);
  const strongMoveCount = exactTopCount + (counts.excellent || 0) * 0.6 + (counts.book || 0) * 0.35;
  const strongMoveRatio = strongMoveCount / normalizedMoveCount;
  let rating = botElo + (accuracy - 78) * 12 + (averageComplexity - 0.35) * 180;
  rating += result === "win" ? 45 : result === "loss" ? -75 : 0;
  rating += moveCount >= 24 ? 25 : moveCount <= 10 ? -70 : 0;
  rating += (strongMoveRatio - 0.45) * 120;
  rating -= (counts.blunder || 0) * 320;
  rating -= (counts.mistake || 0) * 150;
  rating -= ((counts.inaccuracy || 0) + (counts.inexact || 0)) * 45;
  rating -= (counts.missed || 0) * 120;
  if ((counts.blunder || 0) >= 1) rating = Math.min(rating, 1800);
  if ((counts.mistake || 0) >= 2) rating = Math.min(rating, 1700);
  if (averageComplexity < 0.28 && accuracy < 97) rating = Math.min(rating, botElo <= 1600 ? 1850 : 2150);
  const hasMajorError = Boolean((counts.blunder || 0) || (counts.mistake || 0));
  if (botElo <= 600) rating = Math.min(rating, botElo + (hasMajorError ? 450 : 650));
  else if (botElo <= 1000) rating = Math.min(rating, botElo + (hasMajorError ? 500 : 700));
  else if (botElo <= 1300) rating = Math.min(rating, botElo + (hasMajorError ? 500 : 650));
  else if (botElo <= 1600) rating = Math.min(rating, botElo + (accuracy >= 97 && !hasMajorError ? 450 : 350));
  else if (botElo <= 2000) rating = Math.min(rating, botElo + (accuracy >= 97 && !hasMajorError ? 500 : 350));
  const gameRating = clamp(Math.round(rating), 250, 3000);
  chessDebugLog("game-rating", { accuracy, botElo, result, averageComplexity, strongMoveRatio, counts, gameRating });
  return gameRating;
}

function countMoveQualities(moves) {
  const counts = { book: 0, best: 0, great: 0, brilliant: 0, excellent: 0, good: 0, inaccuracy: 0, inexact: 0, mistake: 0, blunder: 0, missed: 0, unknown: 0 };
  moves.forEach((move) => {
    const key = move.quality && Object.prototype.hasOwnProperty.call(counts, move.quality) ? move.quality : "good";
    counts[key] += 1;
  });
  return counts;
}

function getReportClassificationRows(counts = {}) {
  const safeCounts = counts || {};
  return [
    { key: "best", label: "Migliore", count: safeCounts.best || 0, className: "best" },
    { key: "great", label: "Grande", count: safeCounts.great || 0, className: "great" },
    { key: "brilliant", label: "Brillante", count: safeCounts.brilliant || 0, className: "brilliant" },
    { key: "excellent", label: "Ottima", count: safeCounts.excellent || 0, className: "excellent" },
    { key: "good", label: "Buona", count: safeCounts.good || 0, className: "good" },
    { key: "inaccuracy", label: "Imprecisione", count: (safeCounts.inaccuracy || 0) + (safeCounts.inexact || 0), className: "inexact" },
    { key: "mistake", label: "Errore", count: (safeCounts.mistake || 0) + (safeCounts.missed || 0), className: "mistake" },
    { key: "blunder", label: "Blunder", count: safeCounts.blunder || 0, className: "blunder" }
  ];
}

function formatReviewClassificationCounts(counts = {}) {
  const safeCounts = counts || {};
  const parts = getReportClassificationRows(safeCounts).map((row) => `${row.count} ${row.label}`);
  if (safeCounts.book) parts.push(`${safeCounts.book} Libro`);
  if (safeCounts.unknown) parts.push(`${safeCounts.unknown} non analizzate`);
  return parts.join(", ");
}

function computeAccuracyFromMoves(moves, side, result, evalSeries) {
  return computeAccuracyDetails(moves, side, result, evalSeries).final;
}

function computeAccuracyDetails(moves, side, result, evalSeries) {
  if (!moves.length) return {
    final: 0,
    rawWeighted: 0,
    harmonic: 0,
    base: 0,
    cap: 100,
    averageComplexity: 0,
    exactTopRatio: 0,
    strongMoveRatio: 0,
    nonBestPenalty: 0,
    simplePositionPenalty: 0,
    goodOnlyPenalty: 0,
    tacticalPenalty: 0
  };
  const counts = countMoveQualities(moves);
  const totals = moves.reduce((acc, move) => {
    const impact = moveAccuracyImpactWeight(move);
    const score = moveAccuracyWeight(move) * 100;
    acc.score += score * impact;
    acc.harmonic += impact / Math.max(score, 1);
    acc.weight += impact;
    acc.complexity += (typeof move.moveComplexity === "number" ? move.moveComplexity : 0.35);
    return acc;
  }, { score: 0, harmonic: 0, complexity: 0, weight: 0 });
  const weightedMean = totals.score / (totals.weight || moves.length);
  const harmonicMean = totals.weight / (totals.harmonic || 1);
  const averageComplexity = totals.complexity / moves.length;
  const exactTopCount = (counts.best || 0) + (counts.great || 0) + (counts.brilliant || 0);
  const excellentCount = counts.excellent || 0;
  const bookCount = counts.book || 0;
  const goodCount = counts.good || 0;
  const inaccuracyCount = (counts.inaccuracy || 0) + (counts.inexact || 0);
  const exactTopRatio = exactTopCount / moves.length;
  const strongMoveRatio = (exactTopCount + excellentCount * 0.6 + bookCount * 0.35) / moves.length;
  const goodRatio = goodCount / moves.length;
  const base = weightedMean * 0.68 + harmonicMean * 0.32;
  const nonBestPenalty = Math.max(0, 0.52 - strongMoveRatio) * 8;
  const simplePositionPenalty = base > 88 ? Math.max(0, 0.45 - averageComplexity) * 18 : 0;
  const goodOnlyPenalty = goodRatio * 2.5;
  const tacticalPenalty = inaccuracyCount * 0.7 + (counts.mistake || 0) * 1.4 + (counts.blunder || 0) * 3.5 + (counts.missed || 0) * 2.2;
  let adjusted = base - nonBestPenalty - simplePositionPenalty - goodOnlyPenalty - tacticalPenalty;
  let cap = 100;
  if (moves.length >= 6 && exactTopRatio < 0.12 && base > 88) cap = Math.min(cap, 89);
  if (moves.length >= 6 && exactTopRatio < 0.22 && averageComplexity < 0.38 && base > 90) cap = Math.min(cap, 88);
  if (averageComplexity < 0.28 && base > 88) cap = Math.min(cap, 87);
  if ((counts.blunder || 0) >= 1) cap = Math.min(cap, 78);
  if ((counts.mistake || 0) >= 2) cap = Math.min(cap, 82);
  if (inaccuracyCount >= Math.max(3, Math.ceil(moves.length * 0.25))) cap = Math.min(cap, 86);
  const final = Math.round(clamp(Math.min(adjusted, cap), 0, 100));
  return {
    final,
    rawWeighted: Math.round(weightedMean),
    harmonic: Math.round(harmonicMean),
    base: Math.round(base),
    cap,
    averageComplexity: Number(averageComplexity.toFixed(2)),
    exactTopRatio: Number(exactTopRatio.toFixed(2)),
    strongMoveRatio: Number(strongMoveRatio.toFixed(2)),
    nonBestPenalty: Number(nonBestPenalty.toFixed(1)),
    simplePositionPenalty: Number(simplePositionPenalty.toFixed(1)),
    goodOnlyPenalty: Number(goodOnlyPenalty.toFixed(1)),
    tacticalPenalty: Number(tacticalPenalty.toFixed(1))
  };
}

function moveAccuracyWeight(move) {
  if (typeof move.accuracyScore === "number") return clamp(move.accuracyScore, 0, 100) / 100;
  if (move.quality === "best" || move.quality === "brilliant" || move.quality === "great") return 1;
  if (move.quality === "book") return 0.99;
  if (move.quality === "excellent") return 0.97;
  if (move.quality === "good") return 0.91;
  if (move.quality === "inexact" || move.quality === "inaccuracy") return 0.81;
  if (move.quality === "mistake" || move.quality === "missed") return 0.6;
  if (move.quality === "blunder") return 0.25;
  return 0.9;
}

function moveAccuracyImpactWeight(move) {
  if (move.quality === "book") return 0.75;
  if (move.quality === "brilliant" || move.quality === "great") return 1.15;
  if (move.quality === "missed") return 1.15;
  if (move.quality === "blunder") return 1.25;
  if (move.quality === "mistake") return 1.1;
  return 1;
}

function getReviewRatingForMove(move) {
  if (move.side === "Nero" || move.colorMoved === "b") return getBotProfile(currentGame.botLevel || state.chess.botLevel || 1).elo;
  return clamp(1200 + (state.chess.wins || 0) * 18 - (state.chess.losses || 0) * 12 + (state.chess.lastAccuracy || 65) * 2, 800, 2200);
}

function expectedPoints(evalCpFromPlayerPOV, playerRating = 1300) {
  const cp = clamp(evalCpFromPlayerPOV || 0, -1200, 1200);
  const skill = 0.75 + 0.00025 * (playerRating - 400);
  return 1 / (1 + Math.exp(-(skill * cp) / 230.0));
}

function expectedPointsFromEval(evalCpFromPlayerPov, playerRating = 1300) {
  if (evalCpFromPlayerPov >= 90000) return 1;
  if (evalCpFromPlayerPov <= -90000) return 0;
  return expectedPoints(evalCpFromPlayerPov, playerRating);
}

function qualityScoreFromExpectedLoss(quality, epLoss, context = {}) {
  const loss = Math.max(0, typeof epLoss === "number" ? epLoss : 0);
  let score = 90;
  if (quality === "best") score = 100;
  else if (quality === "excellent") score = interpolateClamped(loss, 0.00, 0.02, 99, 95);
  else if (quality === "good") score = interpolateClamped(loss, 0.02, 0.05, 94, 88);
  else if (quality === "inexact" || quality === "inaccuracy") score = interpolateClamped(loss, 0.05, 0.10, 87, 75);
  else if (quality === "mistake") score = interpolateClamped(loss, 0.10, 0.20, 74, 45);
  else if (quality === "blunder") score = interpolateClamped(loss, 0.20, 1.00, 44, 0);
  else if (quality === "missed") score = interpolateClamped(loss, 0.10, 0.35, 80, 35);
  else if (quality === "great") score = Math.max(98, interpolateClamped(loss, 0, 0.02, 100, 98));
  else if (quality === "brilliant") score = Math.max(99, interpolateClamped(loss, 0, 0.02, 100, 99));
  else if (quality === "book") score = 98;
  if (context.epBefore >= 0.92 && context.epPlayed >= 0.88) score = Math.max(score, 82);
  if (context.positionAlreadyDecided && ["good", "inaccuracy", "mistake"].includes(quality)) score = Math.max(score, 82);
  return Math.round(clamp(score, 0, 100));
}

function interpolateClamped(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMax;
  const ratio = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + (outMax - outMin) * ratio;
}

function getAccuracyDecayK(context = {}) {
  if (context.isNormalOpening) return 0.25;
  if (context.positionAlreadyDecided) return 0.20;
  const complexity = calculateMoveComplexity(context);
  if (complexity >= 0.72) return 0.45;
  return 0.35;
}

function calculateMoveComplexity(context = {}) {
  let complexity = 0.3;
  const topMoves = Array.isArray(context.topMoves) ? context.topMoves : [];
  if (topMoves.length >= 4) complexity += 0.1;
  if (typeof context.secondBestCp === "number" && typeof context.playedCp === "number" && Math.abs(context.playedCp - context.secondBestCp) >= 140) complexity += 0.18;
  if (Math.abs(context.beforeCp || 0) <= 250) complexity += 0.12;
  if ((context.lossCp || 0) >= 120) complexity += 0.14;
  if (context.isMissed || context.isGreat || context.isBrilliant) complexity += 0.18;
  if (context.positionAlreadyDecided) complexity -= 0.18;
  if (context.isNormalOpening) complexity -= 0.08;
  return clamp(complexity, 0.15, 1);
}

function calibratePlayerAccuracy(raw, counts, result) {
  return Math.round(clamp(raw, 0, 100));
}

function calibrateBotAccuracy(raw, counts, level) {
  if (!raw) return 0;
  return Math.round(clamp(raw, 0, 100));
}

function getBotAccuracyRange(level) {
  const elo = getBotProfile(level).elo;
  const ranges = botAccuracyRanges;
  const exact = ranges.find((range) => range.elo === elo);
  if (exact) return [exact.min, exact.max];
  const lower = [...ranges].reverse().find((range) => range.elo < elo) || ranges[0];
  const upper = ranges.find((range) => range.elo > elo) || ranges[ranges.length - 1];
  if (lower.elo === upper.elo) return [lower.min, lower.max];
  const ratio = (elo - lower.elo) / (upper.elo - lower.elo);
  const min = Math.round(lower.min + (upper.min - lower.min) * ratio);
  const max = Math.round(lower.max + (upper.max - lower.max) * ratio);
  return [min, max];
}

function conversionPenalty(side, result, evalSeries) {
  if (!evalSeries.length) return 0;
  const finalEval = evalSeries[evalSeries.length - 1];
  if (side === "w") {
    const peak = Math.max(...evalSeries);
    if (peak > 300 && finalEval < 80 && result !== "win") return 8;
    if (peak > 180 && finalEval < -100) return 5;
  } else {
    const trough = Math.min(...evalSeries);
    if (trough < -300 && finalEval > -80 && result !== "loss") return 8;
    if (trough < -180 && finalEval > 100) return 5;
  }
  return 0;
}

function buildAccuracyBreakdown(counts, moveCount, details = null) {
  if (!moveCount) return "Precisione calcolata da: nessuna mossa ancora giocata.";
  const detailText = details
    ? ` Base ${details.base}%, media grezza ${details.rawWeighted}%, complessita' ${details.averageComplexity}, rapporto Migliore ${Math.round(details.exactTopRatio * 100)}%, penalita' semplicita'/non-migliori ${Math.round(details.simplePositionPenalty + details.nonBestPenalty + details.goodOnlyPenalty)}%.`
    : "";
  return `Precisione calcolata da: ${formatReviewClassificationCounts(counts)}.${detailText}`;
}

function buildChessReportMessage(analysis) {
  const c = analysis.counts;
  const majorErrors = c.mistake + c.blunder + c.missed;
  if (analysis.result === "win" && majorErrors >= 2) return "Hai vinto perche' hai convertito meglio il vantaggio, ma hai concesso controgioco.";
  if (analysis.result === "loss" && c.blunder > 0) return "Hai perso per un Blunder tattico: nella revisione guarda la prima mossa rossa.";
  if (analysis.result === "loss" && analysis.accuracy >= 75 && analysis.botAccuracy > analysis.accuracy) return "Hai giocato una partita precisa, ma il bot ha mantenuto una qualita' superiore.";
  if (analysis.result === "win" && analysis.mainPattern && analysis.mainPattern.key === "development") return "Hai vinto con buona tattica finale, ma la fase di apertura e' stata debole.";
  if (analysis.result === "win" && analysis.accuracy >= 80) return "Hai vinto con buona qualita': poche concessioni e mosse decisive corrette.";
  if (!analysis.moveCount) return "Gioca una partita per ottenere una diagnosi completa.";
  if (!analysis.mainPattern) return "Partita pulita: nessun pattern critico nella partita.";
  return `Pattern principale: ${analysis.mainPattern.label}. La priorita' e' ridurre questo errore nella prossima partita.`;
}

async function analyzeCurrentGameWithEngine(depth = CHESS_REVIEW_DEPTH, timeMs = CHESS_REVIEW_TIME_MS) {
  return analyzeGame(null, { depth, timeMs });
}

async function reviewFromPGN(pgn) {
  const tokens = parsePgnMoveTokens(pgn);
  resetChess();
  currentGame.importSource = "pgn";
  let color = "w";
  for (const token of tokens) {
    const legalMoves = getAllLegalMoves(board, color);
    const move = findMoveBySanToken(token, legalMoves, color);
    if (!move) {
      console.warn("PGN move not recognized:", token);
      currentGame.engineError = `PGN non riconosciuto alla mossa ${token}`;
      break;
    }
    const beforeState = cloneGameState(gameState);
    const before = cloneBoard(board);
    const piece = before[move.fromRow][move.fromCol];
    board = applyMove(board, move);
    updateGameStateForMove(move, before);
    const after = cloneBoard(board);
    const san = moveToSan(before, after, move, piece, color);
    saveMoveData({
      side: color === "w" ? "Bianco" : "Nero",
      color,
      move: formatMoveText(move),
      readable: readableMove(piece, move, before),
      piece,
      moveNumber: Math.floor(currentGame.moves.length / 2) + 1,
      fromRow: move.fromRow,
      fromCol: move.fromCol,
      toRow: move.toRow,
      toCol: move.toCol,
      san,
      moveSan: san,
      uci: moveToUci(before, move),
      colorMoved: color,
      timeSeconds: 0,
      fenBefore: boardToFen(before, color, beforeState),
      fenAfter: boardToFen(after, oppositeColor(color), gameState),
      categories: [],
      loss: 0,
      quality: "good",
      classification: "In attesa Stockfish",
      bestMoveText: "Stockfish",
      evalBefore: 0,
      evalAfter: 0,
      evalDiff: 0,
      variation: "-",
      pattern: null,
      drill: "Attendi la review Stockfish per il drill reale.",
      note: "Mossa importata da PGN.",
      comment: "Mossa importata da PGN: la classificazione reale verra' calcolata da Stockfish.",
      boardBefore: cloneBoard(before),
      boardAfter: cloneBoard(after),
      engineAnalysis: null
    });
    if (color === "b") moveNumber += 1;
    color = oppositeColor(color);
  }
  lastMoveSquares = currentGame.moves.length ? moveSquaresFromRecord(currentGame.moves[currentGame.moves.length - 1]) : null;
  renderBoard();
  const reviewResult = await analyzeGame(pgn);
  if (reviewResult?.summary) renderMoveReview(false, reviewResult.summary);
  return reviewResult;
}

function parsePgnMoveTokens(pgn) {
  let text = String(pgn || "");
  text = text.replace(/\[[^\]]*\]/g, " ");
  text = text.replace(/\{[^}]*\}/g, " ");
  while (/\([^()]*\)/.test(text)) text = text.replace(/\([^()]*\)/g, " ");
  text = text.replace(/\$\d+/g, " ");
  return text.split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !/^\d+\.(\.\.)?$/.test(token))
    .map((token) => token.replace(/^\d+\.+/, ""))
    .filter((token) => token && !["1-0", "0-1", "1/2-1/2", "*"].includes(token));
}

function normalizeSanToken(token) {
  return String(token || "").replace(/[?!]+/g, "").replace(/0/g, "O").trim();
}

function findMoveBySanToken(token, legalMoves, color) {
  const wanted = normalizeSanToken(token);
  for (const move of legalMoves) {
    const before = cloneBoard(board);
    const piece = before[move.fromRow][move.fromCol];
    const after = applyMove(before, move);
    const san = normalizeSanToken(moveToSan(before, after, move, piece, color));
    const uci = moveToUci(before, move);
    if (san === wanted || uci === wanted.toLowerCase()) return move;
  }
  return null;
}

async function analyzeGame(pgn = null, options = {}) {
  const moves = getSafeChessMoves();
  if (!moves.length) return setChessReviewStatus("idle", createStableReviewResult({ status: "idle", summary: null }));
  const depth = options.depth || CHESS_REVIEW_DEPTH;
  const timeMs = options.timeMs || CHESS_REVIEW_TIME_MS;
  currentGame.reviewFailed = false;
  currentGame.engineError = null;
  setChessReviewStatus("analyzing", createStableReviewResult({ status: "analyzing" }));
  currentGame.engineReviewConfig = { depth, timeMs, requestedAt: new Date().toISOString(), source: pgn ? "pgn-or-current-game" : "current-game" };
  const init = await ChessEngineService.initEngine();
  if (!init.ok || !isStockfishEngineEnabled()) {
    currentGame.reviewFailed = true;
    currentGame.engineError = init.error || "Stockfish non disponibile";
    setReviewProgress(getReviewStatusMessage("error"));
    chessDebugLog("Stockfish error", { error: currentGame.engineError });
    return setChessReviewStatus("error", {
      error: currentGame.engineError,
      summary: null,
      engineAnalysis: [],
      moveClassifications: {},
      drills: []
    });
  }
  const total = moves.length;
  const engineAnalysis = [];
  for (let index = 0; index < total; index += 1) {
    const move = moves[index];
    if (!move) {
      engineAnalysis.push({ ply: index + 1, ok: false, classification: "unknown", error: "Move data missing" });
      continue;
    }
    if (move.engineAnalysis?.ok) {
      setReviewProgress(`Stockfish sta analizzando mossa ${index + 1} di ${total}`);
      engineAnalysis.push(move.engineAnalysis);
      continue;
    }
    setReviewProgress(`Stockfish sta analizzando mossa ${index + 1} di ${total}`);
    chessDebugLog("analyzing move", { index: index + 1, total, fen: move.fenBefore, uci: move.uci, depth });
    const analysis = await analyzeRecordedMoveWithEngine(move, depth, timeMs, index + 1, total);
    applyEngineAnalysisToMove(move, analysis);
    engineAnalysis.push(move.engineAnalysis || analysis);
    if (!analysis.ok) {
      const moveError = analysis.error || "Stockfish failed on this move";
      currentGame.engineError = moveError;
      chessDebugLog("Stockfish error", { index: index + 1, error: moveError });
    }
  }
  rebuildCurrentGamePatterns();
  const hasEngineData = moves.some((move) => move?.engineAnalysis?.ok);
  if (!hasEngineData) {
    currentGame.engineError = currentGame.engineError || "Errore: Stockfish non ha restituito analisi valide.";
    setReviewProgress(getReviewStatusMessage("error"));
    return setChessReviewStatus("error", {
      error: currentGame.engineError,
      engineAnalysis,
      moveClassifications: countMoveQualities(moves),
      drills: [],
      summary: null
    });
  }
  currentGame.reviewStatus = "completed";
  const analysis = buildGameAnalysis(currentGame.result || "partial", currentGame.endReason || null);
  const reviewResult = setChessReviewStatus("completed", {
    completed: true,
    engineBased: analysis.engineBased,
    engineAnalysis,
    moveClassifications: analysis.counts || {},
    drills: analysis.exerciseObjects || [],
    summary: analysis,
    error: currentGame.engineError || null
  });
  queueSupabaseGameSave("engine-review", analysis);
  queueSupabaseAnalysisSave(analysis);
  setReviewProgress("Analisi Stockfish completata.");
  return reviewResult;
}

function setReviewProgress(message) {
  const gameBox = document.getElementById("gameAnalysis");
  const coach = document.getElementById("coachMessage");
  if (gameBox) gameBox.textContent = message;
  if (coach) coach.textContent = message;
}

async function analyzeRecordedMoveWithEngine(move, depth, timeMs, progressIndex = null, progressTotal = null) {
  if (!move.fenBefore || !move.uci) return { ok: false, error: "Dati FEN/UCI mancanti" };
  const color = move.colorMoved || move.color;
  const opponent = oppositeColor(color);
  const root = await analyzePosition(move.fenBefore, depth, timeMs, CHESS_REVIEW_MULTIPV);
  if (!root.ok || !root.bestMove) return { ok: false, error: root.error || "Mossa migliore non disponibile" };
  const playedAfter = await analyzePosition(move.fenAfter, depth, timeMs, 1);
  if (!playedAfter.ok) return { ok: false, error: playedAfter.error || "Errore: Stockfish non ha risposto." };
  const rootCandidates = root.candidateMoves || [];
  const bestCandidate = rootCandidates[0] || { uci: root.bestMove, evaluation: root.evaluation, pv: root.pv || [], depth: root.depth || 0 };
  const secondCandidate = rootCandidates[1] || null;
  const playedCandidate = findCandidateForMove(rootCandidates, move.uci);
  const bestMove = bestCandidate.uci || root.bestMove;
  if (!root.bestMove) return { ok: false, error: "Mossa migliore nulla: posizione terminale o nessuna mossa legale", rawLines: root.rawLines || [] };
  const bestAfter = await analyzePositionAfterMoves(move.fenBefore, [bestMove], depth, timeMs, 1);
  const rootEvaluation = root.engineEvaluation || cpToEngineEvaluation(root.evaluationCp, root.mate);
  const bestEvaluation = bestAfter && bestAfter.ok ? bestAfter.engineEvaluation || cpToEngineEvaluation(bestAfter.evaluationCp, bestAfter.mate) : bestCandidate.evaluation || rootEvaluation;
  const playedPostMoveEvaluation = playedAfter.engineEvaluation || cpToEngineEvaluation(playedAfter.evaluationCp, playedAfter.mate);
  const playedEvaluation = playedPostMoveEvaluation;
  const beforeActiveColor = getFenActiveColor(move.fenBefore) || color;
  const playedAfterActiveColor = getFenActiveColor(move.fenAfter) || opponent;
  const bestAfterActiveColor = opponent;
  const beforeWhite = engineEvalToWhiteCentipawns(rootEvaluation, beforeActiveColor);
  const bestWhite = engineEvalToWhiteCentipawns(bestEvaluation, bestAfterActiveColor);
  const playedWhite = engineEvalToWhiteCentipawns(playedEvaluation, playedAfterActiveColor);
  const playedPostMoveCp = engineEvalToPlayerCentipawns(playedPostMoveEvaluation, getFenActiveColor(move.fenAfter) || opponent, color);
  const beforeCp = engineEvalToPlayerCentipawns(rootEvaluation, beforeActiveColor, color);
  const bestCp = engineEvalToPlayerCentipawns(bestEvaluation, bestAfterActiveColor, color);
  const playedCp = engineEvalToPlayerCentipawns(playedEvaluation, playedAfterActiveColor, color);
  const secondBestCp = secondCandidate && secondCandidate.evaluation ? engineEvalToPlayerCentipawns(secondCandidate.evaluation, beforeActiveColor, color) : null;
  const bestLine = bestCandidate.pv && bestCandidate.pv.length ? bestCandidate.pv : [bestMove].filter(Boolean);
  const playedLine = playedCandidate && playedCandidate.pv && playedCandidate.pv.length ? playedCandidate.pv : [move.uci].concat(playedAfter.pv || []).filter(Boolean);
  const bestOpponentReply = bestAfter && bestAfter.bestMove ? bestAfter.bestMove : bestLine[1] || null;
  const playedOpponentReply = playedLine[1] || playedAfter.bestMove || null;
  const evalBefore = beforeCp / 100;
  const evalBest = bestCp / 100;
  const evalAfter = playedCp / 100;
  const evalLoss = Math.max(0, evalBest - evalAfter);
  const lossCp = Math.max(0, bestCp - playedCp);
  const reviewRating = getReviewRatingForMove(move);
  const epBefore = expectedPointsFromEval(beforeCp, reviewRating);
  const epBest = expectedPointsFromEval(bestCp, reviewRating);
  const epPlayed = expectedPointsFromEval(playedCp, reviewRating);
  const epLoss = Math.max(0, epBest - epPlayed);
  const context = {
    color,
    beforeCp,
    bestCp,
    playedCp,
    evalBefore,
    evalBest,
    evalAfter,
    evalLoss,
    lossCp,
    epBefore,
    epBest,
    epPlayed,
    epLoss,
    reviewRating,
    bestMove,
    playedMove: move.uci,
    move,
    moveNumber: move.moveNumber,
    san: move.san || move.moveSan || move.move,
    secondBestCp,
    topMoves: rootCandidates,
    isNormalOpening: isNormalOpeningMove(move, move.moveNumber, move.san || move.moveSan || move.move),
    positionAlreadyDecided: Math.abs(beforeCp) >= 650 && Math.abs(playedCp) >= 500,
    tablebaseFallback: isTablebasePosition(move.boardBefore) && !isTablebaseAvailable(),
    playedAfter,
    bestOpponentReply,
    playedOpponentReply,
    evaluationHorizon: "bestMove/actualMove post-move Stockfish",
    isBook: isBookMoveRecord(move, lossCp, epLoss),
    isGreat: isEngineGreatMove(move, beforeCp, bestCp, playedCp, lossCp, epBefore, epBest, epPlayed, secondBestCp, rootCandidates),
    isBrilliant: isEngineBrilliantMove(move, beforeCp, playedCp, lossCp, epBefore, epPlayed),
    isMissed: isEngineMissedMove(beforeCp, bestCp, playedCp, lossCp, epBefore, epBest, epPlayed)
  };
  const classification = classifyEngineMove(context);
  const moveComplexity = calculateMoveComplexity(context);
  const moveAccuracy = qualityScoreFromExpectedLoss(classification.quality, epLoss, context);
  chessDebugLog("move-analysis", {
    ply: move.ply,
    san: move.san,
    uci: move.uci,
    depth,
    candidateMoves: rootCandidates.map((candidate) => ({ rank: candidate.rank, uci: candidate.uci, eval: candidate.evaluation })),
    beforeActiveColor,
    bestAfterActiveColor,
    playedAfterActiveColor,
    bestOpponentReply,
    playedOpponentReply,
    playedPostMoveCp,
    playedEvaluationSource: "post-move-search",
    eval_before: evalBefore,
    eval_after: evalAfter,
    eval_loss: evalLoss,
    evalBeforeWhitePOV: beforeWhite,
    bestEvalWhitePOV: bestWhite,
    actualEvalWhitePOV: playedWhite,
    bestEvalPlayerPOV: bestCp,
    actualEvalPlayerPOV: playedCp,
    epBest,
    epActual: epPlayed,
    epLoss,
    moveAccuracy,
    moveComplexity,
    classification: classification.label,
    quality: classification.quality,
    reason: classification.reason || null,
    reasonClassification: classification.reason || null,
    brilliantReason: context.isBrilliant ? "sacrificio corretto con miglioramento concreto validato da Stockfish" : null,
    greatReason: context.isGreat ? "mossa critica o risorsa difensiva validata da Stockfish" : null
  });
  console.log("evalBefore", evalBefore);
  console.log("evalAfter", evalAfter);
  console.log("evalLoss", evalLoss);
  console.log("moveAccuracy", moveAccuracy);
  console.log("classification", classification.label);
  console.log("reasonClassification", classification.reason || null);
  console.log("moveComplexity", moveComplexity);
  console.table([{
    moveNumber: move.moveNumber,
    playerColor: color,
    fenBefore: move.fenBefore,
    playedMove: move.uci,
    bestMove,
    beforeActiveColor,
    bestAfterActiveColor,
    playedAfterActiveColor,
    bestOpponentReply,
    playedOpponentReply,
    actualPostMovePlayerPOV: playedPostMoveCp,
    playedEvaluationSource: "post-move-search",
    evalBeforeWhitePOV: beforeWhite,
    bestEvalWhitePOV: bestWhite,
    actualEvalWhitePOV: playedWhite,
    bestEvalPlayerPOV: bestCp,
    actualEvalPlayerPOV: playedCp,
    epBest,
    epActual: epPlayed,
    epLoss,
    classification: classification.label,
    moveQualityScore: moveAccuracy,
    moveWeight: moveAccuracyImpactWeight({ quality: classification.quality }),
    accuracyMove: moveAccuracy,
    reasonClassification: classification.reason || null
  }]);
  return {
    ok: true,
    bestMove,
    playedMove: move.uci,
    lossCp,
    evalLoss,
    evalBefore,
    evalBest,
    evalAfter,
    epLoss,
    epBefore,
    epBest,
    epPlayed,
    reviewRating,
    moveComplexity,
    accuracyScore: moveAccuracy,
    beforeCp,
    bestCp,
    playedCp,
    playedPostMoveCp,
    bestOpponentReply,
    playedOpponentReply,
    bestLine,
    playedLine,
    evaluationHorizon: context.evaluationHorizon,
    beforeWhite,
    bestWhite,
    playedWhite,
    evalBeforeWhitePOV: beforeWhite,
    bestEvalWhitePOV: bestWhite,
    actualEvalWhitePOV: playedWhite,
    bestEvalPlayerPOV: bestCp,
    actualEvalPlayerPOV: playedCp,
    tablebaseFallback: context.tablebaseFallback,
    depth: Math.min(root.depth || 0, playedAfter.depth || 0),
    timeMs,
    engineName: ChessEngineService.getStatus().name || "Stockfish",
    pv: bestCandidate.pv || [],
    classification
  };
}

function normalizeEngineCandidates(result) {
  const raw = result && result.topMoves && result.topMoves.length
    ? result.topMoves
    : [{ rank: 1, uci: result && result.bestMove, evaluation: result && result.evaluation, depth: result && result.depth, pv: result && result.pv }];
  return raw
    .filter((item) => item && item.uci)
    .sort((a, b) => (a.rank || 1) - (b.rank || 1));
}

function findCandidateForMove(candidates, moveUci) {
  const normalized = normalizeMoveAnswer(moveUci);
  if (!normalized || !Array.isArray(candidates)) return null;
  return candidates.find((candidate) => normalizeMoveAnswer(candidate && candidate.uci) === normalized) || null;
}

async function analyzePosition(fen, depth = CHESS_REVIEW_DEPTH, timeMs = CHESS_REVIEW_TIME_MS, multiPv = CHESS_REVIEW_MULTIPV) {
  if (!fen) return { ok: false, fen, error: "FEN mancante", bestMove: null, evaluation: null, evaluationCp: null, mate: null, depth: 0, rawLines: [], rawStockfishLines: [] };
  const ready = await ensureStockfishReadyForChess();
  if (!ready) {
    const status = ChessEngineService && ChessEngineService.getStatus ? ChessEngineService.getStatus() : {};
    const error = status.error || "Stockfish non disponibile";
    chessDebugLog("Stockfish error", { fen, error });
    return { ok: false, fen, error, bestMove: null, evaluation: null, evaluationCp: null, mate: null, depth: 0, rawLines: [], rawStockfishLines: [] };
  }
  const result = await ChessEngineService.getTopMoves(fen, depth, timeMs, multiPv);
  const analyzed = {
    ok: Boolean(result.ok && (result.bestMove || result.terminal)),
    fen,
    error: result.ok ? null : result.error || "Stockfish non ha restituito una mossa migliore",
    bestMove: result.bestMove,
    evaluation: result.evaluationPawns,
    evaluationCp: result.evaluationCp,
    engineEvaluation: result.evaluation,
    mate: result.mate,
    depth: result.depth || 0,
    terminal: Boolean(result.terminal),
    pv: result.pv || [],
    candidateMoves: normalizeEngineCandidates(result).map((candidate) => ({
      rank: candidate.rank,
      uci: candidate.uci,
      evaluation: candidate.evaluation,
      depth: candidate.depth,
      pv: candidate.pv || []
    })),
    rawLines: result.rawLines || result.rawStockfishLines || [],
    rawStockfishLines: result.rawStockfishLines || result.rawLines || []
  };
  chessDebugLog("analyzePosition", {
    fen,
    depth,
    bestMove: analyzed.bestMove,
    evaluationCp: analyzed.evaluationCp,
    evaluation: analyzed.evaluation,
    candidateMoves: analyzed.candidateMoves
  });
  return analyzed;
}

async function analyzePositionAfterMoves(fen, moves = [], depth = CHESS_REVIEW_DEPTH, timeMs = CHESS_REVIEW_TIME_MS, multiPv = 1) {
  if (!fen) return { ok: false, fen, error: "FEN mancante", bestMove: null, evaluation: null, evaluationCp: null, mate: null, depth: 0, rawLines: [], rawStockfishLines: [] };
  const ready = await ensureStockfishReadyForChess();
  if (!ready) {
    const status = ChessEngineService && ChessEngineService.getStatus ? ChessEngineService.getStatus() : {};
    return { ok: false, fen, error: status.error || "Stockfish non disponibile", bestMove: null, evaluation: null, evaluationCp: null, mate: null, depth: 0, rawLines: [], rawStockfishLines: [] };
  }
  const result = await ChessEngineService.evaluatePosition(fen, depth, timeMs, moves);
  return {
    ok: Boolean(result.ok || result.terminal),
    fen,
    error: result.ok ? null : result.error || "Stockfish non ha valutato la posizione",
    bestMove: result.bestMove,
    evaluation: result.evaluationPawns,
    evaluationCp: result.evaluationCp,
    engineEvaluation: result.evaluation,
    mate: result.mate,
    depth: result.depth || 0,
    terminal: Boolean(result.terminal),
    pv: result.pv || [],
    candidateMoves: normalizeEngineCandidates(result),
    rawLines: result.rawLines || result.rawStockfishLines || [],
    rawStockfishLines: result.rawStockfishLines || result.rawLines || []
  };
}

function applyEngineAnalysisToMove(move, analysis) {
  if (!move) return;
  const failedAnalysis = { ok: false, classification: "unknown", error: "Stockfish failed on this move" };
  move.engineAnalysis = analysis && analysis.ok ? analysis : { ...failedAnalysis, ...(analysis || {}) };
  if (!move.engineAnalysis.ok) {
    move.quality = "unknown";
    move.classification = "unknown";
    move.comment = move.engineAnalysis.error || "Stockfish failed on this move";
    move.note = move.comment;
    move.categories = [];
    move.pattern = null;
    move.drill = "Analisi non disponibile per questa mossa: riprova la review.";
    move.bestMoveText = null;
    return;
  }
  const classification = analysis.classification;
  move.quality = classification.quality;
  move.classification = classification.label;
  move.loss = Math.round(analysis.lossCp);
  move.evalLoss = analysis.evalLoss;
  move.epLoss = analysis.epLoss;
  move.accuracyScore = analysis.accuracyScore;
  move.bestMoveText = analysis.bestMove || "nessuna alternativa necessaria";
  move.variation = analysis.bestLine && analysis.bestLine.length ? analysis.bestLine.join(" ") : analysis.pv && analysis.pv.length ? analysis.pv.slice(0, 5).join(" ") : "-";
  move.playedLine = analysis.playedLine && analysis.playedLine.length ? analysis.playedLine.join(" ") : move.uci || "-";
  move.bestOpponentReply = analysis.bestOpponentReply || null;
  move.playedOpponentReply = analysis.playedOpponentReply || null;
  move.evalBefore = analysis.beforeWhite;
  move.evalAfter = analysis.playedWhite;
  move.evalDiff = analysis.playedWhite - analysis.beforeWhite;
  move.engineBestEval = analysis.bestWhite;
  move.moveComplexity = analysis.moveComplexity;
  move.evalBeforeWhitePOV = analysis.evalBeforeWhitePOV;
  move.bestEvalWhitePOV = analysis.bestEvalWhitePOV;
  move.actualEvalWhitePOV = analysis.actualEvalWhitePOV;
  move.bestEvalPlayerPOV = analysis.bestEvalPlayerPOV;
  move.actualEvalPlayerPOV = analysis.actualEvalPlayerPOV;
  move.moveWeight = moveAccuracyImpactWeight(move);
  move.reviewMeta = { engine: analysis.engineName || "Stockfish", depth: analysis.depth || 0, timeMs: analysis.timeMs || 0, model: "expected-points + post-game reply", horizon: analysis.evaluationHorizon || "single-position search" };
  move.comment = buildEngineCoachComment(move, analysis, classification);
  move.note = move.comment;
  if (isErrorQuality(move.quality)) {
    move.categories = detectEngineErrorCategories(move, analysis);
    move.pattern = move.categories[0];
    move.drill = mistakeDrills[move.pattern] || "Drill: rivedi la posizione e scrivi 3 candidate prima di muovere.";
  } else {
    move.categories = [];
    move.pattern = null;
    move.drill = "Drill mantenimento: prima della prossima mossa trova la minaccia piu' forzante avversaria.";
  }
}

function detectEngineErrorCategories(move, analysis) {
  const categories = [];
  const loss = analysis.lossCp || 0;
  const seconds = move.timeSeconds || move.seconds || 0;
  if (move.quality === "missed" || analysis.epLoss >= 0.12) categories.push("missedThreat");
  if (loss >= 500) categories.push("hangingPiece");
  if (seconds > 0 && seconds <= 6 && analysis.epLoss >= 0.05) categories.push("concentration");
  if (move.moveNumber <= 8 && loss >= 120) categories.push("development");
  if (loss >= 180) categories.push("calculation");
  if (analysis.playedCp <= -250 && analysis.beforeCp >= -80) categories.push("kingSafety");
  if (!categories.length && loss >= 90) categories.push("noPlan");
  if (!categories.length) categories.push("calculation");
  return uniqueList(categories).slice(0, 3);
}

function classifyEngineMove(context) {
  if (context.isBook) return { quality: "book", label: "Mossa da libro", reason: "book-db" };
  if (context.isBrilliant) return { quality: "brilliant", label: "Brillante", reason: "sacrificio corretto con vantaggio concreto" };
  if (context.isGreat) return { quality: "great", label: "Grande", reason: "risorsa critica o unica mossa forte" };
  if (context.isMissed) return { quality: "missed", label: "Mossa mancata", reason: "tattica o risorsa decisiva non sfruttata" };
  const epLoss = typeof context.epLoss === "number" ? context.epLoss : null;
  const loss = typeof context.evalLoss === "number" ? context.evalLoss : Math.max(0, (context.lossCp || 0) / 100);
  const positionShift = typeof context.evalBefore === "number" && typeof context.evalAfter === "number" ? Math.abs(context.evalBefore - context.evalAfter) : null;
  if (epLoss !== null) {
    if (sameUciMove(context.playedMove, context.bestMove) || (epLoss <= 0.001 && (context.lossCp || 0) <= 8)) return { quality: "best", label: "Migliore", reason: "mossa migliore o perdita expected points praticamente zero" };
    if (epLoss <= 0.02) return { quality: "excellent", label: "Ottima", reason: "epLoss <= 0.02" };
    if (context.isNormalOpening && epLoss <= 0.10) return { quality: "good", label: "Buona", reason: "apertura naturale: epLoss basso, non punita" };
    if (context.positionAlreadyDecided && epLoss <= 0.14) return { quality: "good", label: "Buona", reason: "posizione gia' decisa: risultato atteso quasi invariato" };
    if (context.tablebaseFallback && epLoss <= 0.20) return { quality: "inaccuracy", label: "Imprecisione", reason: "finale tecnico senza tablebase: giudizio attenuato" };
    if (epLoss <= 0.05) return { quality: "good", label: "Buona", reason: "epLoss <= 0.05" };
    if (epLoss <= 0.10) return { quality: "inaccuracy", label: "Imprecisione", reason: "epLoss <= 0.10" };
    if (epLoss <= 0.20) return { quality: "mistake", label: "Errore", reason: "epLoss <= 0.20" };
    return { quality: "blunder", label: "Blunder", reason: "epLoss > 0.20" };
  }
  if (loss <= 0.15) return { quality: "best", label: "Migliore", reason: "fallback centipawn: perdita <= 0.15 pedoni" };
  if (loss <= 0.35) return { quality: "excellent", label: "Ottima", reason: "fallback centipawn: perdita <= 0.35 pedoni" };
  if (context.isNormalOpening && loss <= 1.00) return { quality: "good", label: "Buona", reason: "fallback apertura naturale" };
  if (positionShift !== null && positionShift <= 0.25 && loss <= 1.50) return { quality: "good", label: "Buona", reason: "fallback cambio valutazione minimo" };
  if (loss <= 0.75) return { quality: "good", label: "Buona", reason: "fallback perdita <= 0.75 pedoni" };
  if (loss <= 1.50) return { quality: "inaccuracy", label: "Imprecisione", reason: "fallback perdita <= 1.50 pedoni" };
  if (loss <= 3.00) return { quality: "mistake", label: "Errore", reason: "fallback perdita <= 3.00 pedoni" };
  return { quality: "blunder", label: "Blunder", reason: "fallback perdita > 3.00 pedoni" };
}

function sameUciMove(a, b) {
  return normalizeMoveAnswer(a) === normalizeMoveAnswer(b);
}

function isNormalOpeningMove(move, moveNumber, san) {
  if (!move || moveNumber > 8) return false;
  const cleanSan = String(san || "").replace(/[+#?!]/g, "").trim();
  const normalSan = new Set(["e4", "d4", "c4", "Nf3", "e5", "c5", "e6", "c6", "d5", "Nf6", "Nc6", "g6", "b6"]);
  const normalUci = new Set(["e2e4", "d2d4", "c2c4", "g1f3", "e7e5", "c7c5", "e7e6", "c7c6", "d7d5", "g8f6", "b8c6", "g7g6", "b7b6"]);
  return normalSan.has(cleanSan) || normalUci.has(move.uci || "");
}

function isBookMoveRecord(move, lossCp, epLoss = null) {
  return Boolean(move && move.moveNumber <= 8 && isNormalOpeningMove(move, move.moveNumber, move.san || move.moveSan || move.move) && (typeof epLoss !== "number" || epLoss <= 0.02) && (lossCp || 0) <= 75);
}

function isEngineGreatMove(move, beforeCp, bestCp, playedCp, lossCp, epBefore = null, epBest = null, epPlayed = null, secondBestCp = null, topMoves = []) {
  if (!move || lossCp > 20 || currentGame.moves.indexOf(move) < 8 || move.moveNumber <= 8) return false;
  if (move.classification === "Scacco matto") return false;
  if (isNormalOpeningMove(move, move.moveNumber, move.san || move.moveSan || move.move)) return false;
  const improvesFromBad = beforeCp <= -120 && playedCp >= -30;
  const savesResult = typeof epBefore === "number" && typeof epPlayed === "number" && epBefore <= 0.42 && epPlayed >= 0.50;
  const keepsCriticalAdvantage = typeof epBefore === "number" && typeof epBest === "number" && typeof epPlayed === "number" && epBest >= 0.70 && epPlayed >= 0.68 && epBefore <= 0.62;
  const uniqueMove = typeof secondBestCp === "number" && playedCp - secondBestCp >= 220;
  const playerColor = move.colorMoved || move.color;
  const candidatePressure = Array.isArray(topMoves) && topMoves.length >= 3 ? topMoves.slice(2, 5).filter((candidate) => {
    const cp = candidate.evaluation ? engineEvalToPlayerCentipawns(candidate.evaluation, playerColor, playerColor) : playedCp;
    return playedCp - cp >= 180;
  }).length >= 2 : uniqueMove;
  return Boolean(candidatePressure && (improvesFromBad || savesResult || keepsCriticalAdvantage || uniqueMove));
}

function isEngineBrilliantMove(move, beforeCp, playedCp, lossCp, epBefore = null, epPlayed = null) {
  if (!move || lossCp > 15 || currentGame.moves.indexOf(move) < 8 || move.moveNumber <= 8) return false;
  if (currentGame.moves.filter((item) => item && item.quality === "brilliant").length >= 1) return false;
  if (move.classification === "Scacco matto") return false;
  if (isNormalOpeningMove(move, move.moveNumber, move.san || move.moveSan || move.move)) return false;
  if (beforeCp >= 500 || (typeof epBefore === "number" && epBefore >= 0.82)) return false;
  if (playedCp < 160 || (typeof epPlayed === "number" && epPlayed < 0.62)) return false;
  const improvesEnough = playedCp - beforeCp >= 120 || (typeof epBefore === "number" && typeof epPlayed === "number" && epPlayed - epBefore >= 0.06);
  if (!improvesEnough) return false;
  const movedValue = move.piece ? pieceValues[move.piece.toLowerCase()] || 0 : 0;
  if (movedValue < 300 || !move.boardAfter) return false;
  const targetPiece = move.boardBefore ? move.boardBefore[move.toRow][move.toCol] : null;
  const capturedValue = targetPiece ? pieceValues[targetPiece.toLowerCase()] || 0 : 0;
  const sacrifice = capturedValue < movedValue && isSquareAttacked(move.boardAfter, move.toRow, move.toCol, oppositeColor(move.colorMoved || move.color));
  return sacrifice && playedCp >= beforeCp - 30 && playedCp >= 150;
}

function isEngineMissedMove(beforeCp, bestCp, playedCp, lossCp, epBefore = null, epBest = null, epPlayed = null) {
  if (typeof epBefore === "number" && typeof epBest === "number" && typeof epPlayed === "number") {
    if (epBefore >= 0.82 || epPlayed >= 0.82) return false;
    const epSwing = epBest - epBefore;
    const epLoss = epBest - epPlayed;
    const changesResult = (epBefore < 0.38 && epBest >= 0.50) || (epBefore < 0.62 && epBest >= 0.82);
    return epLoss >= 0.12 && epSwing >= 0.10 && changesResult;
  }
  if (beforeCp >= 500 || playedCp >= 500) return false;
  const bestSwing = bestCp - beforeCp;
  const changesResult = (beforeCp < -120 && bestCp >= -30) || (beforeCp < 120 && bestCp >= 350);
  return lossCp >= 180 && bestSwing >= 220 && changesResult;
}

function buildEngineCoachComment(move, analysis, classification) {
  const loss = (typeof analysis.evalLoss === "number" ? analysis.evalLoss : analysis.lossCp / 100).toFixed(2);
  const epLoss = typeof analysis.epLoss === "number" ? (analysis.epLoss * 100).toFixed(1) : null;
  const epText = epLoss !== null ? ` Perdita risultato atteso: ${epLoss}%.` : "";
  const best = analysis.bestMove || "-";
  const replyText = analysis.playedOpponentReply ? ` Risposta critica considerata: ${analysis.playedOpponentReply}.` : "";
  const tablebaseText = analysis.tablebaseFallback ? " Finale tecnico: tablebase non disponibile, giudizio attenuato con fallback Stockfish." : "";
  if (classification.quality === "best") return `Migliore: la perdita di risultato atteso e' praticamente zero dopo la miglior risposta avversaria. Mossa migliore: ${best}.${epText}${replyText}${tablebaseText}`;
  if (classification.quality === "book") return `Libro: mossa di apertura sana e vicina alla scelta del motore. Mossa migliore: ${best}.${epText}${replyText}`;
  if (classification.quality === "great") return `Grande: risorsa critica validata da Stockfish anche dopo la risposta avversaria. Perdita rispetto alla migliore: ${loss} pedoni. Mossa migliore: ${best}.${epText}${replyText}`;
  if (classification.quality === "brilliant") return `Brillante: sacrificio corretto o idea tattica rara, mossa migliore o quasi anche dopo la miglior risposta. Perdita rispetto alla migliore: ${loss} pedoni.${epText}${replyText}`;
  if (classification.quality === "missed") return `Mossa mancata reale: il motore vedeva una risorsa decisiva (${best}) che cambiava il risultato della posizione.`;
  return `${classification.label}: perdita rispetto alla mossa migliore ${best}: ${loss} pedoni dopo la miglior risposta disponibile.${epText}${replyText}${tablebaseText}`;
}

function engineEvalToCentipawns(evaluation, activeColor, perspectiveColor) {
  if (!evaluation) return 0;
  const raw = evaluation.type === "mate" ? Math.sign(evaluation.value || 1) * 100000 : Number(evaluation.value || 0);
  return activeColor === perspectiveColor ? raw : -raw;
}

function engineEvalToWhiteCentipawns(evaluation, activeColor = "w") {
  if (!evaluation) return 0;
  const sideToMoveCp = evaluation.type === "mate" ? Math.sign(evaluation.value || 1) * 100000 : Number(evaluation.value || 0);
  return activeColor === "b" ? -sideToMoveCp : sideToMoveCp;
}

function playerCpFromWhiteCp(evalWhiteCp, color) {
  return color === "b" ? -evalWhiteCp : evalWhiteCp;
}

function engineEvalToPlayerCentipawns(evaluation, activeColor, playerColor) {
  return playerCpFromWhiteCp(engineEvalToWhiteCentipawns(evaluation, activeColor), playerColor);
}

function getFenActiveColor(fen) {
  const parts = String(fen || "").trim().split(/\s+/);
  return parts[1] === "b" ? "b" : "w";
}

function engineEvalToNormalizedPawns(evaluation, activeColor, perspectiveColor) {
  if (!evaluation) return 0;
  const raw = evaluation.type === "mate" ? Math.sign(evaluation.value || 1) * 100 : Number(evaluation.value || 0) / 100;
  return activeColor === perspectiveColor ? raw : -raw;
}

function cpToEngineEvaluation(evaluationCp, mate = null) {
  if (typeof mate === "number") return { type: "mate", value: mate };
  if (typeof evaluationCp === "number") return { type: "cp", value: evaluationCp };
  return null;
}

function oppositeColor(color) {
  return color === "w" ? "b" : "w";
}

function isTablebasePosition(currentBoard) {
  return countBoardPieces(currentBoard || board) <= 7;
}

function isTablebaseAvailable() {
  return false;
}

function countBoardPieces(currentBoard) {
  if (!currentBoard || !Array.isArray(currentBoard)) return 32;
  return currentBoard.flat().filter(Boolean).length;
}

function queueEngineReviewAnalysis(fromFinish = false) {
  const moves = getSafeChessMoves();
  if (!moves.length || currentGame.engineAnalysisInProgress) return;
  if (currentGame.reviewStatus === "completed" && moves.every((move) => move?.engineAnalysis)) return;
  setChessReviewStatus("analyzing", currentGame.reviewResult || createStableReviewResult({ status: "analyzing" }));
  const box = document.getElementById("gameAnalysis");
  if (box) box.innerHTML += "<br>Analisi motore in corso...";
  analyzeCurrentGameWithEngine().then((reviewResult) => {
    const analysis = reviewResult?.summary || buildGameAnalysis(currentGame.result || "partial", currentGame.endReason || null);
    if (reviewResult?.status === "completed" && analysis.engineBased) renderMoveReview(fromFinish, analysis);
    else {
      renderGameReport(analysis);
      const message = currentGame.engineError || "Errore: Stockfish non ha risposto.";
      const gameBox = document.getElementById("gameAnalysis");
      if (gameBox) gameBox.textContent = message;
      const drillBox = document.getElementById("chessDrill");
      if (drillBox) drillBox.textContent = "Drill non generati: la review Stockfish non e' stata completata.";
    }
  }).catch((error) => {
    currentGame.engineError = error.message || String(error);
    setChessReviewStatus("error", {
      error: currentGame.engineError,
      engineAnalysis: currentGame.reviewResult?.engineAnalysis || [],
      moveClassifications: currentGame.reviewResult?.moveClassifications || {},
      drills: currentGame.reviewResult?.drills || []
    });
    setReviewProgress(getReviewStatusMessage("error"));
    renderBotLevel();
  });
}

function renderMoveReview(fromFinish = false, analysis = null) {
  const gameAnalysis = analysis || buildGameAnalysis("partial");
  renderGameReport(gameAnalysis);
  const statusMessage = getReviewStatusMessage(gameAnalysis.reviewStatus || currentGame.reviewStatus);
  const accuracyText = gameAnalysis.engineBased && typeof gameAnalysis.accuracy === "number" ? `${gameAnalysis.accuracy}%` : "--";
  const sourceText = gameAnalysis.engineBased ? "Analisi Stockfish engine-based." : statusMessage || "Stockfish non disponibile: analisi reale bloccata, nessuna review euristica.";
  document.getElementById("reviewAccuracy").textContent = accuracyText;
  updateReviewSparklineActive();
  updateReviewKeyFilterButton();
  const errors = gameAnalysis.engineBased
    ? gameAnalysis.topErrors.length ? gameAnalysis.topErrors.map(([category, count]) => `${mistakeLabels[category]} (${count})`).join(", ") : "nessun errore grave rilevato"
    : "in attesa di Stockfish";
  const breakdown = gameAnalysis.engineBased ? gameAnalysis.accuracyBreakdown : statusMessage || "La precisione verra' mostrata solo dopo analisi Stockfish.";
  const exercises = gameAnalysis.engineBased ? gameAnalysis.exercises : ["Attendi il completamento dell'analisi motore per vedere pattern e drill reali."];
  document.getElementById("gameAnalysis").innerHTML = `<strong>${gameAnalysis.resultLabel}</strong><br>${sourceText} Precisione engine-based: ${accuracyText}. Errori principali: ${errors}.<br>${breakdown}<ul class="plan-steps">${exercises.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  if (gameAnalysis.engineBased) {
    renderChessExercises(gameAnalysis);
    renderChessCoachSummary(gameAnalysis);
  }

  const list = document.getElementById("moveReviewList");
  list.innerHTML = "";
  if (!getSafeChessMoves().length) {
    list.textContent = "Non ci sono ancora mosse da rivedere.";
    updateReviewEvalBar(0);
    resetReviewPanel();
    return;
  }
  if (!gameAnalysis.engineBased) {
    const pending = document.createElement("div");
    pending.className = "review-empty-state";
    pending.textContent = currentGame.reviewFailed
      ? currentGame.engineError || "Errore: Stockfish non ha risposto."
      : currentGame.engineAnalysisInProgress
        ? "Stockfish sta analizzando: la lista mosse reale apparira' al termine."
        : "Analisi Stockfish in attesa: la lista mosse reale apparira' solo dopo la review engine-based.";
    list.appendChild(pending);
    resetReviewPanel();
    if (!currentGame.reviewFailed && !currentGame.engineAnalysisInProgress) queueEngineReviewAnalysis(fromFinish);
    return;
  }
  const visibleEntries = getReviewVisibleMoveEntries();
  if (!visibleEntries.length) {
    const empty = document.createElement("div");
    empty.className = "review-empty-state";
    empty.textContent = "Nessun momento chiave rilevato: disattiva il filtro per vedere tutte le mosse.";
    list.appendChild(empty);
  }
  visibleEntries.forEach(({ move, index }) => {
    list.appendChild(buildMoveReviewButton(move, index));
  });
  selectReviewMove(currentGame.reviewIndex >= 0 ? getNearestVisibleReviewIndex(currentGame.reviewIndex) : getDefaultReviewIndex());
  if (fromFinish && !gameAnalysis.engineBased) document.getElementById("coachMessage").textContent = "Partita conclusa: usa la revisione per cliccare ogni mossa e vedere la posizione relativa.";
}

function buildMoveReviewButton(move, index) {
  const button = document.createElement("button");
  const qualityClass = reviewQualityClass(move.quality);
  const meta = getMoveQualityMeta(move.quality);
  button.type = "button";
  button.dataset.reviewIndex = String(index);
  button.className = `move-review-item ${qualityClass}`;

  const top = document.createElement("div");
  top.className = "move-review-top";

  const icon = document.createElement("span");
  icon.className = `move-quality-icon ${qualityClass}`;
  icon.textContent = meta.icon;

  const notation = document.createElement("span");
  notation.className = "move-review-notation";
  notation.textContent = `${move.moveNumber}. ${move.side} ${move.san || move.move}`;

  const classification = document.createElement("span");
  classification.className = "move-review-classification";
  classification.textContent = move.classification || meta.label;

  top.append(icon, notation, classification);

  const bottom = document.createElement("div");
  bottom.className = "move-review-bottom";
  const evalText = document.createElement("span");
  evalText.textContent = `Eval ${formatEval(move.evalBefore)} -> ${formatEval(move.evalAfter)}`;
  const bestText = document.createElement("span");
  bestText.textContent = `Migliore: ${move.bestMoveText || "-"}`;
  const diffText = document.createElement("span");
  diffText.textContent = `Diff: ${formatBestMoveDiff(move)}`;
  const patternText = document.createElement("span");
  patternText.textContent = `Pattern: ${move.pattern ? mistakeLabels[move.pattern] : "-"}`;
  bottom.append(evalText, bestText, diffText, patternText);

  const note = document.createElement("div");
  note.className = "move-review-note";
  note.textContent = buildShortReviewComment(move);

  button.append(top, bottom, note);
  return button;
}

function renderGameReport(gameAnalysis) {
  const result = document.getElementById("chessReportResult");
  if (!result) return;
  const statusMessage = getReviewStatusMessage(gameAnalysis.reviewStatus || currentGame.reviewStatus);
  result.textContent = gameAnalysis.resultLabel;
  document.getElementById("playerAccuracy").textContent = gameAnalysis.engineBased && typeof gameAnalysis.accuracy === "number" ? `${gameAnalysis.accuracy}%` : "--";
  document.getElementById("botAccuracy").textContent = gameAnalysis.engineBased && typeof gameAnalysis.botAccuracy === "number" ? `${gameAnalysis.botAccuracy}%` : "--";
  document.getElementById("reportBotLevel").textContent = `Livello ${gameAnalysis.botLevel}`;
  document.getElementById("reportBotElo").textContent = `${gameAnalysis.botEloLabel || gameAnalysis.botElo} Elo`;
  document.getElementById("reportGameRating").textContent = gameAnalysis.engineBased && gameAnalysis.gameRating ? `${gameAnalysis.gameRating}` : "--";
  document.getElementById("reportPhase").textContent = gameAnalysis.phase || "--";
  document.getElementById("reportMoveCount").textContent = String(gameAnalysis.moveCount);
  document.getElementById("evalSparkline").innerHTML = buildEvalSparkline(gameAnalysis.evalSeries || [0], null, getSafeChessMoves());
  const displayCounts = gameAnalysis.engineBased ? gameAnalysis.counts : {};
  document.getElementById("moveClassificationCounts").innerHTML = getReportClassificationRows(displayCounts).map((row) => `
    <div class="classification-count ${row.className}">
      <span>${row.label}</span>
      <strong>${row.count}</strong>
    </div>
  `).join("");
  document.getElementById("accuracyBreakdown").textContent = gameAnalysis.engineBased ? gameAnalysis.accuracyBreakdown : statusMessage || "Analisi Stockfish in attesa: nessun numero euristico mostrato.";
  document.getElementById("reportMainPattern").textContent = gameAnalysis.engineBased && gameAnalysis.mainPattern ? `Pattern principale: ${gameAnalysis.mainPattern.label} (${gameAnalysis.mainPattern.count})` : gameAnalysis.engineBased ? "Pattern principale: nessun pattern critico nella partita." : "Pattern principale: in attesa di Stockfish.";
  document.getElementById("chessReportMessage").textContent = gameAnalysis.engineBased ? gameAnalysis.message : statusMessage || "Attendi Stockfish: il report finale non usa piu' valutazioni euristiche.";
}

function buildEvalSparkline(values, activeIndex = null, moves = []) {
  const width = 360;
  const height = 120;
  const padding = 12;
  const safeValues = values.length ? values : [0];
  const coordinates = safeValues.map((value, index) => {
    const x = safeValues.length === 1 ? width / 2 : padding + (index / (safeValues.length - 1)) * (width - padding * 2);
    const clipped = clamp(value, -600, 600);
    const y = height / 2 - (clipped / 600) * (height / 2 - padding);
    return { x, y };
  });
  const points = coordinates.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const active = typeof activeIndex === "number" ? clamp(activeIndex, 0, coordinates.length - 1) : null;
  const activePoint = active !== null ? coordinates[active] : null;
  const pointMarkup = coordinates.map((point, index) => {
    const move = index > 0 ? moves[index - 1] : null;
    const qualityClass = move && isKeyReviewMove(move) ? reviewQualityClass(move.quality) : "";
    const marker = qualityClass ? `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4.5" class="eval-sparkline-marker ${qualityClass}"></circle>` : "";
    return `${marker}<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="10" class="eval-sparkline-hit ${qualityClass}" data-review-index="${index - 1}" tabindex="0"></circle>`;
  }).join("");
  const activeMarkup = activePoint ? `
    <line x1="${activePoint.x.toFixed(1)}" y1="${padding}" x2="${activePoint.x.toFixed(1)}" y2="${height - padding}" class="eval-sparkline-active-line"></line>
    <circle cx="${activePoint.x.toFixed(1)}" cy="${activePoint.y.toFixed(1)}" r="6" class="eval-sparkline-active-dot"></circle>
  ` : "";
  return `
    <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" class="eval-sparkline-mid"></line>
    <polyline points="${points}" class="eval-sparkline-line"></polyline>
    <circle cx="${points.split(" ").pop().split(",")[0]}" cy="${points.split(" ").pop().split(",")[1]}" r="4" class="eval-sparkline-dot"></circle>
    ${pointMarkup}
    ${activeMarkup}
  `;
}

function handleReviewClick(event) {
  const button = event.target.closest("[data-review-index]");
  if (!button) return;
  const index = Number(button.dataset.reviewIndex);
  selectReviewMove(index);
}

function handleEvalSparklineClick(event) {
  const point = event.target.closest("[data-review-index]");
  if (!point || !currentGame.moves.length) return;
  renderMoveReview(false);
  selectReviewMove(Number(point.dataset.reviewIndex));
}

function toggleReviewKeyMoments() {
  currentGame.showOnlyKeyMoments = !currentGame.showOnlyKeyMoments;
  renderMoveReview(false);
}

function updateReviewKeyFilterButton() {
  const button = document.getElementById("reviewKeyMomentsBtn");
  if (!button) return;
  button.classList.toggle("active", Boolean(currentGame.showOnlyKeyMoments));
  button.textContent = currentGame.showOnlyKeyMoments ? "Mostra tutte le mosse" : "Mostra solo momenti chiave";
}

function isKeyReviewMove(move) {
  if (!move) return false;
  return ["great", "brilliant", "inexact", "inaccuracy", "mistake", "blunder", "missed"].includes(move.quality) || move.classification === "Scacco matto";
}

function getReviewVisibleMoveEntries() {
  return currentGame.moves
    .map((move, index) => ({ move, index }))
    .filter(({ move }) => Boolean(move))
    .filter(({ move }) => !currentGame.showOnlyKeyMoments || isKeyReviewMove(move));
}

function getDefaultReviewIndex() {
  const entries = getReviewVisibleMoveEntries();
  if (entries.length) return entries[entries.length - 1].index;
  return -1;
}

function getNearestVisibleReviewIndex(index) {
  if (!currentGame.showOnlyKeyMoments) return clamp(index, -1, currentGame.moves.length - 1);
  const entries = getReviewVisibleMoveEntries();
  if (!entries.length) return clamp(index, -1, currentGame.moves.length - 1);
  const exact = entries.find((entry) => entry.index === index);
  if (exact) return exact.index;
  const previous = [...entries].reverse().find((entry) => entry.index < index);
  return previous ? previous.index : entries[0].index;
}

function exitReviewMode() {
  reviewBoard = null;
  reviewMoveSquares = null;
  currentGame.reviewIndex = -1;
  resetReviewPanel();
  renderBoard();
}

function stepReviewMove(direction) {
  if (!currentGame.moves.length) return;
  if (currentGame.showOnlyKeyMoments) {
    const entries = getReviewVisibleMoveEntries();
    if (!entries.length) return;
    const current = entries.findIndex((entry) => entry.index === currentGame.reviewIndex);
    const base = current >= 0 ? current : direction > 0 ? -1 : entries.length;
    const next = clamp(base + direction, 0, entries.length - 1);
    selectReviewMove(entries[next].index);
    return;
  }
  const current = typeof currentGame.reviewIndex === "number" ? currentGame.reviewIndex : currentGame.moves.length - 1;
  selectReviewMove(clamp(current + direction, -1, currentGame.moves.length - 1));
}

function selectReviewEnd() {
  selectReviewMove(getDefaultReviewIndex());
}

function selectNextReviewError() {
  const entries = getSafeChessMoves()
    .map((move, index) => ({ move, index }))
    .filter(({ move }) => isErrorQuality(move.quality));
  if (!entries.length) return;
  const current = typeof currentGame.reviewIndex === "number" ? currentGame.reviewIndex : -1;
  const next = entries.find((entry) => entry.index > current) || entries[0];
  selectReviewMove(next.index);
}

function showReviewBestMove() {
  const move = currentGame.moves[currentGame.reviewIndex];
  const panel = document.getElementById("reviewCoachPanel");
  if (!move || !panel) return;
  panel.textContent = `Mossa migliore: ${move.bestMoveText || "-"}. ${move.classification ? `La mossa giocata e' stata classificata ${move.classification}.` : ""}`;
}

function showReviewBestLine() {
  const move = currentGame.moves[currentGame.reviewIndex];
  const panel = document.getElementById("reviewCoachPanel");
  if (!move || !panel) return;
  panel.textContent = `Linea consigliata: ${move.variation && move.variation !== "-" ? move.variation : "linea non disponibile per questa mossa."}`;
}

function selectReviewMove(index) {
  if (!currentGame.moves.length && index !== -1) return;
  currentGame.reviewIndex = clamp(index, -1, currentGame.moves.length - 1);
  if (currentGame.reviewIndex === -1) {
    reviewBoard = createInitialBoard();
    reviewMoveSquares = null;
    updateReviewEvalBar(0);
    document.getElementById("reviewPlyText").textContent = "Inizio";
    document.getElementById("reviewMoveTitle").textContent = "Posizione iniziale";
    document.getElementById("reviewCoachPanel").textContent = "Partenza della partita. Usa Avanti o clicca una mossa per rivedere la posizione.";
    document.getElementById("reviewBestMove").textContent = "-";
    document.getElementById("reviewBestDiff").textContent = "-";
    document.getElementById("reviewVariation").textContent = "-";
    document.getElementById("reviewPattern").textContent = "-";
    document.getElementById("reviewDrill").textContent = "-";
    document.getElementById("reviewMeta").textContent = "-";
    updateReviewActiveItem();
    updateReviewSparklineActive(0);
    renderBoard();
    return;
  }
  const move = currentGame.moves[currentGame.reviewIndex];
  if (!move) {
    resetReviewPanel();
    return;
  }
  reviewBoard = cloneBoard(move.boardAfter || board);
  reviewMoveSquares = moveSquaresFromRecord(move);
  document.getElementById("reviewPlyText").textContent = `${currentGame.reviewIndex + 1}/${currentGame.moves.length}`;
  document.getElementById("reviewMoveTitle").textContent = `${move.moveNumber}. ${move.side} ${move.readable || move.move} - ${move.classification}`;
  document.getElementById("reviewCoachPanel").textContent = buildDetailedReviewComment(move);
  document.getElementById("reviewBestMove").textContent = move.bestMoveText || "-";
  document.getElementById("reviewBestDiff").textContent = formatBestMoveDiff(move);
  document.getElementById("reviewVariation").textContent = move.variation || "-";
  document.getElementById("reviewPattern").textContent = move.pattern ? mistakeLabels[move.pattern] : "-";
  document.getElementById("reviewDrill").textContent = move.drill || "-";
  document.getElementById("reviewMeta").textContent = formatReviewMeta(move);
  document.getElementById("coachMessage").textContent = `${move.moveNumber}. ${move.side} ${move.move}: ${move.comment || move.note}`;
  updateReviewEvalBar(move.evalAfter || 0);
  updateReviewActiveItem();
  updateReviewSparklineActive(currentGame.reviewIndex + 1);
  renderBoard();
}

function updateReviewSparklineActive(activeIndex = null) {
  const sparkline = document.getElementById("reviewEvalSparkline");
  if (!sparkline) return;
  const series = [0].concat(getSafeChessMoves().map((move) => move.evalAfter || 0));
  const index = typeof activeIndex === "number" ? activeIndex : currentGame.reviewIndex >= 0 ? currentGame.reviewIndex + 1 : null;
  sparkline.innerHTML = buildEvalSparkline(series, index, getSafeChessMoves());
}

function formatBestMoveDiff(move) {
  if (!move) return "-";
  const parts = [];
  if (typeof move.epLoss === "number") parts.push(`-${move.epLoss.toFixed(3)} EP`);
  if (typeof move.evalLoss === "number") parts.push(`${move.evalLoss.toFixed(2)} pedoni`);
  else if (typeof move.loss === "number") parts.push(`${(move.loss / 100).toFixed(2)} pedoni`);
  return parts.length ? parts.join(" / ") : "-";
}

function formatReviewMeta(move) {
  const meta = move && move.reviewMeta;
  if (!meta) return "Quick review locale";
  const depth = meta.depth ? `depth ${meta.depth}` : "book/fast path";
  const time = meta.timeMs ? `${meta.timeMs} ms` : "0 ms";
  return `${meta.engine || "Stockfish"} - ${depth} - ${time} - ${meta.model || "expected-points"} - ${meta.horizon || "post-game"}`;
}

function buildDetailedReviewComment(move) {
  if (!move) return "Analisi in corso o non disponibile.";
  if (move.quality === "unknown") return move.comment || "Stockfish non ha completato l'analisi di questa mossa. Puoi riprovare la review.";
  const meta = getMoveQualityMeta(move.quality);
  const best = move.bestMoveText && move.bestMoveText !== "nessuna alternativa necessaria" ? move.bestMoveText : "nessuna alternativa utile da mostrare";
  const lossText = typeof move.loss === "number" ? `${(move.loss / 100).toFixed(2)} pedoni` : "non disponibile";
  const epText = typeof move.epLoss === "number" ? `; perdita risultato atteso ${(move.epLoss * 100).toFixed(1)}%` : "";
  return [
    `Cosa e' successo: ${reviewWhatHappenedText(move, meta)}.`,
    `Perche' e' ${move.classification || meta.label}: ${reviewWhyText(move, lossText + epText)}.`,
    `Fattori posizione: ${formatReviewSignals(move)}.`,
    `Cosa controllare: ${reviewChecklistText(move)}.`,
    `Mossa migliore: ${best}. Differenza dalla migliore: ${formatBestMoveDiff(move)}. Linea consigliata: ${move.variation && move.variation !== "-" ? move.variation : "non disponibile"}. Linea valutata: ${move.playedLine || move.move || "-"}.`,
    `Cosa imparare: ${reviewLearningText(move)}`
  ].join("\n");
}

function reviewWhatHappenedText(move, meta) {
  const signals = move.reviewSignals || {};
  if (move.classification === "Scacco matto") return "la mossa chiude la partita con scacco matto";
  if (signals.captured) return `${move.san || move.move} cattura ${pieceName(signals.captured)} e cambia la tensione tattica`;
  if (signals.givesCheck) return `${move.san || move.move} crea scacco e forza una risposta precisa`;
  if (move.quality === "book") return `hai giocato una mossa di apertura riconosciuta (${move.san || move.move})`;
  if (move.quality === "best") return `hai trovato la scelta indicata dal motore (${move.san || move.move})`;
  if (move.quality === "great") return "hai trovato una risorsa critica che mantiene o recupera la posizione";
  if (move.quality === "brilliant") return "hai giocato una risorsa tattica rara senza perdere il filo della posizione";
  if (move.quality === "missed") return "hai mancato una risorsa concreta che poteva cambiare la posizione";
  if (isErrorQuality(move.quality)) return `la posizione peggiora dopo ${move.san || move.move}`;
  return `la mossa ${move.san || move.move} mantiene la posizione dentro margini accettabili`;
}

function reviewWhyText(move, lossText) {
  if (move.quality === "book") return "sviluppa secondo principi sani e resta vicina alla mossa migliore";
  if (move.quality === "best") return "coincide con la mossa migliore del motore, quindi non perde valore rispetto alla scelta migliore";
  if (move.quality === "great") return "era una delle pochissime mosse corrette in una posizione critica";
  if (move.quality === "brilliant") return "richiede un'idea tattica o un sacrificio non ovvio e resta mossa migliore o quasi";
  if (move.quality === "excellent") return `resta molto vicina alla mossa migliore (${lossText}) e migliora o stabilizza la posizione`;
  if (move.quality === "good") return `perde poco rispetto alla mossa migliore (${lossText}) e non concede problemi seri`;
  if (move.quality === "inexact" || move.quality === "inaccuracy") return `la perdita rispetto alla mossa migliore e' moderata (${lossText}), ma non crolla la partita`;
  if (move.quality === "mistake") return `la perdita rispetto alla mossa migliore e' concreta (${lossText}) e concede iniziativa o materiale`;
  if (move.quality === "blunder") return `la perdita rispetto alla mossa migliore e' grave (${lossText}) e cambia nettamente la posizione`;
  if (move.quality === "missed") return "la mossa migliore era una risorsa decisiva, non un semplice miglioramento di una posizione gia' vinta";
  return `la perdita rispetto alla mossa migliore e' ${lossText}`;
}

function reviewLearningText(move) {
  if (move.pattern) return `${patternShortReason(move.pattern)}. Drill: ${move.drill || mistakeDrills[move.pattern] || "calcola candidate, minacce e risposta forzante prima di muovere"}.`;
  if (move.quality === "best") return "conserva il processo: candidate, minaccia avversaria, verifica tattica, poi mossa.";
  if (move.quality === "book") return "memorizza il piano dietro l'apertura, non solo la mossa.";
  if (move.quality === "great") return "salva questa posizione: il punto era trovare la risorsa critica, non la mossa naturale.";
  if (move.quality === "brilliant") return "riguarda la posizione e trova quale pezzo era sacrificabile e quale minaccia nasceva dopo.";
  if (move.quality === "good" || move.quality === "excellent") return "nota quali fattori migliorano la posizione: sviluppo, sicurezza re, pressione o difesa.";
  return "prima della prossima mossa confronta 2 candidate e cerca la risposta piu' forzante dell'avversario.";
}

function formatReviewSignals(move) {
  const signals = move.reviewSignals;
  if (!signals) return `eval ${formatEval(move.evalBefore)} -> ${formatEval(move.evalAfter)}`;
  const parts = [
    `${signals.phase || "Fase"}: eval ${formatEval(move.evalBefore)} -> ${formatEval(move.evalAfter)} (${signals.evalDelta >= 0 ? "+" : ""}${signals.evalDelta.toFixed(2)} pedoni)`
  ];
  if (signals.captured) parts.push(`cattura ${pieceName(signals.captured)}`);
  if (signals.looseChange > 60) parts.push(`pezzi tuoi piu' esposti (+${Math.round(signals.looseChange)})`);
  if (signals.looseChange < -60) parts.push(`riduci pezzi appesi (${Math.round(signals.looseChange)})`);
  if (signals.opponentLooseChange > 60) parts.push(`aumenti pressione su materiale avversario`);
  if (signals.opponentThreatChange > 70) parts.push(`concedi una minaccia immediata`);
  if (signals.ownThreatChange > 70) parts.push(`crei minaccia concreta`);
  if (signals.givesCheck) parts.push("scacco");
  return parts.join("; ");
}

function reviewChecklistText(move) {
  const signals = move.reviewSignals || {};
  if (move.quality === "book") return "piano dell'apertura: sviluppo, centro, sicurezza del re";
  if (move.quality === "best" || move.quality === "excellent" || move.quality === "great") return "perche' questa candidata funziona e quale risposta forzata limita l'avversario";
  if (move.pattern === "hangingPiece" || signals.looseChange > 60) return "pezzi appesi dopo la mossa, soprattutto donna, torri e pezzi non difesi";
  if (move.pattern === "missedThreat" || signals.opponentThreatChange > 70) return "minacce avversarie immediate: scacchi, catture e attacchi doppi";
  if (move.pattern === "kingSafety") return "linee verso il re, case deboli e possibilita' di arroccare o semplificare";
  if (move.pattern === "development") return "pezzi ancora fermi, controllo del centro e tempi persi in apertura";
  if (move.pattern === "noPlan") return "obiettivo delle prossime 2-3 mosse: migliorare pezzo, creare pressione o eliminare debolezza";
  if (move.quality === "missed") return "candidate forzanti: scacco, cattura, minaccia e unica risorsa difensiva";
  return "candidate migliori, risposta piu' forzante dell'avversario e sicurezza del pezzo mosso";
}

function pieceName(piece) {
  const names = { p: "pedone", n: "cavallo", b: "alfiere", r: "torre", q: "donna", k: "re" };
  return names[String(piece || "").toLowerCase()] || "pezzo";
}

function buildShortReviewComment(move) {
  if (move.classification === "Scacco matto") return "Ottima: dai scacco matto e chiudi la partita.";
  if (move.quality === "book") return "Libro: segui una linea di apertura sana e sviluppi senza rischi.";
  if (move.quality === "best") return "Migliore: perdita entro 0.15 pedoni rispetto alla scelta Stockfish.";
  if (move.quality === "great") return "Grande: trovi una risorsa critica o una delle pochissime mosse corrette.";
  if (move.quality === "brilliant") return "Brillante: trovi una risorsa tattica rara con sacrificio o idea non ovvia.";
  if (move.quality === "excellent") return "Ottima: migliori la posizione e resti molto vicino alla mossa migliore.";
  if (move.quality === "good") return "Buona mossa: sviluppi, difendi o migliori la posizione senza concedere problemi seri.";
  if (move.quality === "inexact" || move.quality === "inaccuracy") return move.pattern ? `Imprecisione: ${patternShortReason(move.pattern)}.` : "Imprecisione: piccolo peggioramento, ma la posizione resta giocabile.";
  if (move.quality === "mistake") return move.pattern ? `Errore: ${patternShortReason(move.pattern)}.` : "Errore: la posizione peggiora in modo concreto.";
  if (move.quality === "blunder") return move.pattern ? `Blunder: ${patternShortReason(move.pattern)}.` : "Blunder: perdi materiale importante o concedi una tattica decisiva.";
  if (move.quality === "missed") return "Mossa mancata: c'era una continuazione molto piu' forte da trovare.";
  return move.comment || move.note || "Mossa registrata nella revisione.";
}

function patternShortReason(pattern) {
  const reasons = {
    hangingPiece: "lasci un pezzo in presa",
    calculation: "il calcolo della variante era incompleto",
    concentration: "hai mosso troppo in fretta e la valutazione peggiora",
    missedThreat: "ignori una minaccia diretta",
    kingSafety: "il re resta troppo esposto",
    development: "perdi tempo in apertura invece di sviluppare",
    noPlan: "la mossa non migliora piano, pressione o sicurezza",
    weakEndgame: "nel finale perdi attivita' o pedoni importanti"
  };
  return reasons[pattern] || "il pattern richiede revisione";
}

function updateReviewActiveItem() {
  document.querySelectorAll("[data-review-index]").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.reviewIndex) === currentGame.reviewIndex);
  });
}

function resetReviewPanel() {
  const ids = ["reviewPlyText", "reviewMoveTitle", "reviewCoachPanel", "reviewBestMove", "reviewBestDiff", "reviewVariation", "reviewPattern", "reviewDrill", "reviewMeta"];
  if (!document.getElementById("reviewPlyText")) return;
  document.getElementById("reviewPlyText").textContent = "--";
  document.getElementById("reviewMoveTitle").textContent = "Nessuna mossa selezionata";
  document.getElementById("reviewCoachPanel").textContent = "Avvia la revisione per vedere commento, pattern e drill della mossa.";
  ids.slice(3).forEach((id) => {
    document.getElementById(id).textContent = "-";
  });
}

function reviewQualityClass(quality) {
  if (quality === "book") return "book";
  if (quality === "best") return "best";
  if (quality === "great") return "great";
  if (quality === "brilliant") return "brilliant";
  if (quality === "excellent") return "excellent";
  if (quality === "inexact" || quality === "inaccuracy") return "inexact";
  if (quality === "mistake") return "mistake";
  if (quality === "blunder") return "blunder";
  if (quality === "missed") return "missed";
  if (quality === "unknown") return "unknown";
  return "good";
}

function updateReviewEvalBar(score) {
  const fill = document.getElementById("reviewEvalFill");
  if (!fill) return;
  const width = clamp(50 + (score || 0) / 18, 3, 97);
  fill.style.width = `${width}%`;
  fill.style.background = score >= 0 ? "rgba(31, 122, 109, 0.72)" : "rgba(184, 74, 58, 0.72)";
}

function classifyBotMove(loss, evalBefore, evalAfter, isMate) {
  if (isMate) return { quality: "excellent", label: "Ottima", explanation: "chiude con scacco matto." };
  const delta = moveDeltaPawns(evalBefore, evalAfter, "b");
  return classifyByDelta(delta, {
    winningBefore: isWinningForColor(evalBefore, "b"),
    winningAfter: isWinningForColor(evalAfter, "b")
  });
}

function moveDeltaPawns(evalBefore, evalAfter, color) {
  const deltaCentipawns = color === "b" ? evalBefore - evalAfter : evalAfter - evalBefore;
  return deltaCentipawns / 100;
}

function isWinningForColor(evalScore, color) {
  return color === "b" ? evalScore <= -500 : evalScore >= 500;
}

function classifyByDelta(delta, context = {}) {
  if (context.isMate) {
    return {
      quality: "excellent",
      label: "Ottima",
      explanation: "da' scacco matto e conclude la partita senza bisogno di alternative."
    };
  }
  if (context.brilliant) {
    return {
      quality: "brilliant",
      label: "Brillante",
      explanation: "sacrifica o accetta un rischio non ovvio e migliora nettamente la posizione. E' una classificazione rara."
    };
  }
  if (context.missed) {
    return {
      quality: "missed",
      label: "Mossa mancata",
      explanation: "c'era una risorsa decisiva che cambiava la partita, ma la posizione non era gia' vinta."
    };
  }
  if (context.winningBefore && context.winningAfter && delta < 0) {
    if (delta >= -0.8) {
      return {
        quality: "good",
        label: "Buona",
        explanation: "mantiene un vantaggio grande: non e' perfetta, ma non cambia il controllo della partita."
      };
    }
    return {
      quality: "inexact",
      label: "Imprecisione",
      explanation: "perde precisione in una posizione gia' vinta, ma conserva un vantaggio molto ampio."
    };
  }
  if (delta >= 0) {
    return {
      quality: "excellent",
      label: "Ottima",
      explanation: "migliora o mantiene la valutazione dal punto di vista di chi muove."
    };
  }
  if (delta >= -0.3) {
    return {
      quality: "good",
      label: "Buona",
      explanation: "peggiora pochissimo la valutazione e resta coerente con la posizione."
    };
  }
  if (delta >= -0.8) {
    return {
      quality: "inexact",
      label: "Imprecisione",
      explanation: "perde qualcosa rispetto alla posizione iniziale, ma non concede un vantaggio decisivo."
    };
  }
  if (delta >= -2) {
    return {
      quality: "mistake",
      label: "Errore",
      explanation: "peggiora chiaramente la valutazione e concede iniziativa o materiale."
    };
  }
  return {
    quality: "blunder",
    label: "Blunder",
    explanation: "crolla di oltre due pedoni o permette una tattica decisiva."
  };
}

function classifyChessMove(analysis, before, after, move) {
  const loss = Math.max(0, analysis.bestGap);
  const givesCheck = isKingInCheck(after, "b");
  const captured = before[move.toRow][move.toCol];
  const movedPiece = before[move.fromRow][move.fromCol];
  const givesMate = analysis.isMate || (givesCheck && getAllLegalMoves(after, "b").length === 0);
  const delta = moveDeltaPawns(analysis.beforeEval, analysis.afterEval, "w");
  const winningBefore = isWinningForColor(analysis.beforeEval, "w");
  const winningAfter = isWinningForColor(analysis.afterEval, "w");
  const movedValue = movedPiece ? pieceValues[movedPiece.toLowerCase()] || 0 : 0;
  const capturedValue = captured ? pieceValues[captured.toLowerCase()] || 0 : 0;
  const sacrificeRisk = movedValue >= 300 && capturedValue < movedValue && isSquareAttacked(after, move.toRow, move.toCol, "b");
  const brilliant = !givesMate && currentGame.moves.length >= 6 && sacrificeRisk && delta >= 1.5 && (givesCheck || captured || analysis.threatAfter.score > 180);
  const reviewRating = getReviewRatingForMove({ side: "Bianco", colorMoved: "w" });
  const bestEval = typeof analysis.bestEval === "number" ? analysis.bestEval : analysis.afterEval;
  const epBefore = expectedPointsFromEval(analysis.beforeEval, reviewRating);
  const epBest = expectedPointsFromEval(bestEval, reviewRating);
  const epPlayed = expectedPointsFromEval(analysis.afterEval, reviewRating);
  const epLoss = Math.max(0, epBest - epPlayed);
  const missed = shouldMarkMissedMoveExpected(analysis, delta, epBefore, epBest, epPlayed);
  const context = {
    lossCp: loss,
    epBefore,
    epBest,
    epPlayed,
    epLoss,
    reviewRating,
    winningBefore,
    winningAfter,
    brilliant,
    missed,
    isBest: analysis.bestMove && sameMove(move, analysis.bestMove)
  };
  analysis.epBefore = epBefore;
  analysis.epBest = epBest;
  analysis.epPlayed = epPlayed;
  analysis.epLoss = epLoss;
  analysis.reviewRating = reviewRating;
  if (givesMate) {
    analysis.accuracyScore = qualityScoreFromExpectedLoss("excellent", 0, context);
    return classifyByDelta(delta, { isMate: true });
  }
  if (isBookMove(move) && loss <= 70 && !analysis.categories.includes("hangingPiece")) {
    analysis.accuracyScore = qualityScoreFromExpectedLoss("book", epLoss, context);
    return {
      quality: "book",
      label: "Mossa da libro",
      explanation: "sviluppa o controlla il centro secondo un impianto sano, senza concedere materiale evidente."
    };
  }
  const result = classifyByExpectedLoss(context, delta);
  analysis.accuracyScore = qualityScoreFromExpectedLoss(result.quality, epLoss, context);
  return result;
}

function sameMove(a, b) {
  return a && b && a.fromRow === b.fromRow && a.fromCol === b.fromCol && a.toRow === b.toRow && a.toCol === b.toCol;
}

function classifyByExpectedLoss(context, delta = 0) {
  if (context.brilliant) {
    return {
      quality: "brilliant",
      label: "Brillante",
      explanation: "sacrificio o idea tattica rara, mossa migliore o quasi, senza nascere da una posizione gia' completamente vinta."
    };
  }
  if (context.isBest || context.lossCp <= 12 || context.epLoss <= 0.003) {
    return {
      quality: "best",
      label: "Migliore",
      explanation: "coincide con la scelta migliore stimata o perde praticamente zero risultato atteso."
    };
  }
  if (context.missed) {
    return {
      quality: "missed",
      label: "Mossa mancata",
      explanation: "c'era una risorsa decisiva che cambiava davvero il risultato atteso, non solo una mossa leggermente piu' precisa."
    };
  }
  if (context.epBefore >= 0.92 && context.epPlayed >= 0.88) {
    if (context.epLoss <= 0.08 || delta > -1.5) {
      return {
        quality: "good",
        label: "Buona",
        explanation: "la posizione era gia' molto favorevole e la mossa conserva il risultato pratico."
      };
    }
    return {
      quality: "inexact",
      label: "Imprecisione",
      explanation: "perde precisione, ma non trasforma una posizione vinta in un errore grave."
    };
  }
  if (context.epLoss <= 0.02) {
    return { quality: "excellent", label: "Ottima", explanation: "resta molto vicina alla scelta migliore in termini di risultato atteso." };
  }
  if (context.epLoss <= 0.05) {
    return { quality: "good", label: "Buona", explanation: "perde poco risultato atteso e mantiene una posizione sana." };
  }
  if (context.epLoss <= 0.10) {
    return { quality: "inexact", label: "Imprecisione", explanation: "perdita moderata di risultato atteso, senza crollo immediato." };
  }
  if (context.epLoss <= 0.20) {
    return { quality: "mistake", label: "Errore", explanation: "perdita seria di risultato atteso: concede iniziativa, materiale o difesa piu' difficile." };
  }
  return { quality: "blunder", label: "Blunder", explanation: "crollo netto del risultato atteso, spesso legato a materiale, matto o tattica decisiva." };
}

function shouldMarkMissedMove(analysis, delta) {
  if (!analysis.bestMove || analysis.bestEval === null) return false;
  if (isWinningForColor(analysis.beforeEval, "w")) return false;
  const bestDelta = moveDeltaPawns(analysis.beforeEval, analysis.bestEval, "w");
  const missedSwing = bestDelta - delta;
  const changesResult = (analysis.beforeEval < -100 && analysis.bestEval >= -50) || (analysis.beforeEval < 150 && analysis.bestEval >= 350);
  return bestDelta >= 2 && missedSwing >= 1.8 && changesResult;
}

function shouldMarkMissedMoveExpected(analysis, delta, epBefore, epBest, epPlayed) {
  if (!analysis.bestMove || analysis.bestEval === null) return false;
  if (epBefore >= 0.82 || epPlayed >= 0.82 || isWinningForColor(analysis.beforeEval, "w") || isWinningForColor(analysis.afterEval, "w")) return false;
  const epSwing = epBest - epBefore;
  const epLoss = epBest - epPlayed;
  const classicMiss = shouldMarkMissedMove(analysis, delta);
  const changesResult = (epBefore < 0.38 && epBest >= 0.50) || (epBefore < 0.62 && epBest >= 0.82);
  return (epLoss >= 0.12 && epSwing >= 0.10 && changesResult) || classicMiss;
}

function isBookMove(move) {
  const bookMoves = new Set([
    "e2-e4",
    "d2-d4",
    "g1-f3",
    "c2-c4",
    "b1-c3",
    "e7-e5",
    "c7-c5",
    "e7-e6",
    "c7-c6",
    "g8-f6",
    "d7-d5",
    "b8-c6"
  ]);
  return currentGame.moves.length < 10 && bookMoves.has(formatMoveText(move));
}

function buildRecommendedVariation(currentBoard, bestMove) {
  const afterBest = applyMove(currentBoard, bestMove);
  const blackMoves = getAllLegalMoves(afterBest, "b");
  if (!blackMoves.length) return formatMoveText(bestMove);
  const blackReply = chooseAnalysisBlackMove(afterBest, blackMoves);
  const afterReply = applyMove(afterBest, blackReply);
  const whiteReply = getBestWhiteMove(afterReply);
  const parts = [
    formatMoveText(bestMove),
    formatMoveText(blackReply)
  ];
  if (whiteReply) parts.push(formatMoveText(whiteReply.move));
  return parts.join(" ");
}

function chooseAnalysisBlackMove(currentBoard, moves) {
  const level = activeBotLevelForAnalysis();
  let best = null;
  moves.forEach((move) => {
    const score = scoreMoveForColorFast(currentBoard, move, "b", Math.max(level, 7));
    if (!best || score > best.score) best = { move, score };
  });
  return best ? best.move : moves[0];
}

function analyzePlayerMove(before, after, move, movedPiece, seconds) {
  const categories = [];
  const analysisLevel = Math.max(activeBotLevelForAnalysis(), 7);
  const beforeEval = evaluateBoardAdvanced(before, analysisLevel);
  const afterEval = evaluateBoardAdvanced(after, analysisLevel);
  const best = getBestWhiteMove(before);
  const bestGap = best ? best.eval - afterEval : 0;
  const evalLoss = beforeEval - afterEval;
  const movedIntoAttack = isSquareAttacked(after, move.toRow, move.toCol, "b");
  const isProtected = isSquareAttacked(after, move.toRow, move.toCol, "w");
  const kingCheck = isKingInCheck(after, "w");
  const pieceKey = movedPiece + coord(move.fromRow, move.fromCol);
  playerMoveStats[pieceKey] = (playerMoveStats[pieceKey] || 0) + 1;
  const movedToCenter = [[3, 3], [3, 4], [4, 3], [4, 4]].some(([r, c]) => r === move.toRow && c === move.toCol);
  const wasCapture = Boolean(before[move.toRow][move.toCol]);
  const givesCheck = isKingInCheck(after, "b");
  const hanging = isHangingProblem(before, after, move, movedPiece, movedIntoAttack, isProtected);
  const threatBefore = immediateThreatScore(before, "b");
  const threatAfter = immediateThreatScore(after, "b");
  const developing = isDevelopingMove(before, after, move, movedPiece);
  const neutralMove = !wasCapture && !givesCheck && !developing && !move.castle && !movedToCenter;
  const isMate = givesCheck && getAllLegalMoves(after, "b").length === 0;

  if (seconds < 4 && (evalLoss > 30 || bestGap > 60 || hanging)) categories.push("concentration");
  if (hanging) categories.push("hangingPiece");
  if (bestGap > 80 || evalLoss > 80) categories.push("calculation");
  if (threatBefore.score > 110 && threatAfter.score > 90 && neutralMove) categories.push("missedThreat");
  if (kingCheck || kingPressureScore(after, "w") > kingPressureScore(before, "w") + 1 || (movedPiece === "K" && !move.castle) || isCastlingRightWeakened(move, movedPiece)) categories.push("kingSafety");
  if (isSlowDevelopment(before, after, move, movedPiece, pieceKey, bestGap)) categories.push("development");
  if (moveNumber > 6 && bestGap > 70 && neutralMove) categories.push("noPlan");
  if (isEndgame(before) && (evalLoss > 55 || lostWhitePawn(before, after))) categories.push("weakEndgame");
  if (isMate) categories.length = 0;

  const uniqueCategories = [...new Set(categories)];
  return {
    categories: uniqueCategories,
    bestMove: best ? best.move : null,
    bestEval: best ? best.eval : null,
    bestGap,
    beforeEval,
    afterEval,
    variation: best && !isMate ? buildRecommendedVariation(before, best.move) : "-",
    threatBefore,
    threatAfter,
    isMate
  };
}

function isHangingProblem(before, after, move, movedPiece, movedIntoAttack, isProtected) {
  const movedValue = pieceValues[movedPiece.toLowerCase()] || 0;
  const movedHanging = movedValue >= 300 && movedIntoAttack && (!isProtected || evaluateBoard(after) <= evaluateBoard(before) + 60);
  if (movedHanging) return true;
  const loose = findLooseWhitePiece(after);
  return Boolean(loose && loose.value >= 300 && evaluateBoard(after) <= evaluateBoard(before) + 50);
}

function findLooseWhitePiece(currentBoard) {
  let worst = null;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = currentBoard[row][col];
      if (!piece || !isWhite(piece) || piece === "K") continue;
      const attacked = isSquareAttacked(currentBoard, row, col, "b");
      const defended = isSquareAttacked(currentBoard, row, col, "w");
      const value = pieceValues[piece.toLowerCase()] || 0;
      if (attacked && !defended && (!worst || value > worst.value)) worst = { row, col, piece, value };
    }
  }
  return worst;
}

function immediateThreatScore(currentBoard, color) {
  const moves = getAllLegalMoves(currentBoard, color);
  if (!moves.length) return { score: 0, move: null };
  const base = evaluateBoard(currentBoard);
  let best = { score: 0, move: null };
  moves.forEach((candidate) => {
    const next = applyMove(currentBoard, candidate);
    const nextEval = evaluateBoard(next);
    const gain = color === "b" ? base - nextEval : nextEval - base;
    const captured = currentBoard[candidate.toRow][candidate.toCol];
    const captureBonus = captured ? pieceValues[captured.toLowerCase()] * 0.25 : 0;
    const checkBonus = isKingInCheck(next, color === "b" ? "w" : "b") ? 45 : 0;
    const score = gain + captureBonus + checkBonus;
    if (score > best.score) best = { score, move: candidate };
  });
  return best;
}

function kingPressureScore(currentBoard, color) {
  const king = findKing(currentBoard, color);
  if (!king) return 0;
  const enemy = color === "w" ? "b" : "w";
  let pressure = 0;
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      const row = king.row + dr;
      const col = king.col + dc;
      if (inside(row, col) && isSquareAttacked(currentBoard, row, col, enemy)) pressure += 1;
    }
  }
  if (color === "w" && king.row === 7 && king.col === 4 && moveNumber > 6) pressure += 2;
  return pressure;
}

function isCastlingRightWeakened(move, movedPiece) {
  if (movedPiece === "R" && move.fromRow === 7 && (move.fromCol === 0 || move.fromCol === 7) && moveNumber <= 10) return true;
  return false;
}

function isDevelopingMove(before, after, move, movedPiece) {
  const lower = movedPiece.toLowerCase();
  if (move.castle) return true;
  if ((lower === "n" || lower === "b") && move.fromRow === 7 && move.toRow < 7) return true;
  if (lower === "p" && (move.fromCol === 3 || move.fromCol === 4) && Math.abs(move.toRow - move.fromRow) >= 1) return true;
  return evaluateBoard(after) > evaluateBoard(before) + 35;
}

function isSlowDevelopment(before, after, move, movedPiece, pieceKey, bestGap) {
  if (moveNumber > 10) return false;
  const lower = movedPiece.toLowerCase();
  const repeatedMinor = (lower === "n" || lower === "b" || lower === "q") && move.fromRow !== 7;
  const blockedPieces = countWhiteHomeMinorPieces(after);
  return repeatedMinor || (blockedPieces >= 3 && !isDevelopingMove(before, after, move, movedPiece) && bestGap > 35) || playerMoveStats[pieceKey] > 1;
}

function countWhiteHomeMinorPieces(currentBoard) {
  return ["N", "B"].reduce((count, piece) => count + currentBoard[7].filter((item) => item === piece).length, 0);
}

function isEndgame(currentBoard) {
  let queens = 0;
  let nonPawnMaterial = 0;
  currentBoard.flat().forEach((piece) => {
    if (!piece || piece.toLowerCase() === "k" || piece.toLowerCase() === "p") return;
    if (piece.toLowerCase() === "q") queens += 1;
    nonPawnMaterial += pieceValues[piece.toLowerCase()] || 0;
  });
  return moveNumber >= 22 && (queens === 0 || nonPawnMaterial <= 1800);
}

function lostWhitePawn(before, after) {
  const beforePawns = before.flat().filter((piece) => piece === "P").length;
  const afterPawns = after.flat().filter((piece) => piece === "P").length;
  return afterPawns < beforePawns;
}

function registerChessMoveImpact(record, seconds) {
  if (isErrorQuality(record.quality) && record.categories.length) {
    currentGame.mistakes.push({ move: record.move, categories: record.categories, bestGap: record.loss || 0 });
    record.categories.forEach((category) => {
      if (!currentGame.patternCounts) currentGame.patternCounts = {};
      currentGame.patternCounts[category] = (currentGame.patternCounts[category] || 0) + 1;
      state.mistakeCounts[category] = (state.mistakeCounts[category] || 0) + 1;
      addModulePattern("chess", category);
    });
  }
  updateModuleMetrics("chess", {
    lucidita: record.categories.includes("concentration") ? -4 : 1,
    efficacia: record.quality === "blunder" ? -5 : record.quality === "mistake" ? -3 : record.quality === "missed" ? -2 : 2,
    rischio: record.categories.includes("hangingPiece") || record.categories.includes("kingSafety") ? -5 : 1,
    controllo: seconds < 4 && record.categories.length ? -4 : 1,
    adattamento: record.categories.includes("noPlan") ? -3 : 1,
    ragionamento: record.categories.includes("calculation") ? -5 : 2,
    sostenibilita: record.categories.includes("development") ? -2 : 1,
    tempo: seconds < 4 ? -2 : 1
  });
  saveState();
  renderMistakes();
  renderDashboard();
}

function updateCoachAfterPlayerMove(record, seconds) {
  if (!isErrorQuality(record.quality) || record.categories.length === 0) {
    document.getElementById("coachMessage").textContent = `Mossa stabile. Tempo pensato: ${seconds}s. Ora controlla la risposta forzante del bot.`;
    document.getElementById("chessDrill").textContent = "Drill mantenimento: nomina ad alta voce la minaccia del bot prima della prossima mossa.";
    return;
  }
  const main = record.categories[0];
  const count = currentGame.patternCounts && currentGame.patternCounts[main] ? currentGame.patternCounts[main] : 1;
  const repeated = count >= 2 ? ` Nella partita corrente e' gia' successo ${count} volte.` : "";
  document.getElementById("coachMessage").textContent = `${mistakeLabels[main]}: errore da rivedere nella lista mossa per mossa.${repeated}`;
  document.getElementById("chessDrill").textContent = mistakeDrills[main];
}

function renderMistakes() {
  const wrapper = document.getElementById("mistakeTags");
  wrapper.innerHTML = "";
  const counts = currentGame.patternCounts || {};
  const entries = chessPatternOrder.map((key) => [key, counts[key] || 0]).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = "Nessun pattern critico nella partita.";
    wrapper.appendChild(tag);
    return;
  }
  entries.forEach(([key, count], index) => {
    const tag = document.createElement("span");
    tag.className = `tag ${index === 0 || count >= 2 ? "hot" : ""}`;
    tag.textContent = `${index === 0 ? "Principale: " : ""}${mistakeLabels[key]} ${count}`;
    wrapper.appendChild(tag);
  });
}

function renderChessExercises(gameAnalysis = null) {
  const analysis = gameAnalysis || buildGameAnalysis(currentGame.result || "partial", currentGame.endReason || null);
  const exercises = analysis.exerciseObjects || [];
  currentGame.exerciseObjects = exercises;
  const list = document.getElementById("chessExerciseList");
  const weakThemes = document.getElementById("chessWeakThemes");
  if (!list || !weakThemes) return;
  if (!exercises.length) {
    list.textContent = analysis.engineBased ? "Nessun drill generato: non sono stati trovati errori gravi." : "Completa una review Stockfish per generare esercizi dagli errori.";
    weakThemes.textContent = analysis.topErrors && analysis.topErrors.length
      ? `Errori piu' frequenti: ${analysis.topErrors.map(([key, count]) => `${mistakeLabels[key]} (${count})`).join(", ")}`
      : "Temi tattici piu' deboli: in attesa di analisi.";
    renderActiveChessExercise(null, analysis.engineBased ? "Nessun drill generato: non sono stati trovati errori gravi." : "Nessun drill caricato.");
    return;
  }
  list.innerHTML = "";
  exercises.forEach((exercise, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "exercise-chip";
    button.textContent = `${index + 1}. ${exercise.theme} - diff. ${exercise.difficulty}`;
    button.addEventListener("click", () => {
      currentGame.activeExerciseIndex = index;
      renderActiveChessExercise(exercise);
    });
    list.appendChild(button);
  });
  weakThemes.textContent = `Errori piu' frequenti: ${analysis.topErrors.length ? analysis.topErrors.map(([key, count]) => `${mistakeLabels[key]} (${count})`).join(", ") : "nessun pattern critico"}. Temi tattici deboli: ${uniqueList(exercises.map((exercise) => exercise.theme)).join(", ")}.`;
  const active = exercises[clamp(currentGame.activeExerciseIndex || 0, 0, exercises.length - 1)] || exercises[0];
  renderActiveChessExercise(active);
}

function renderChessCoachSummary(gameAnalysis) {
  const coach = gameAnalysis && gameAnalysis.coachSummary;
  const box = document.getElementById("coachMessage");
  if (!box) return;
  const status = gameAnalysis?.reviewStatus || currentGame.reviewStatus || "idle";
  const statusMessage = getReviewStatusMessage(status);
  if (statusMessage && status !== "completed") {
    box.textContent = statusMessage;
    return;
  }
  if (!coach) {
    box.textContent = "Analisi in corso o non disponibile.";
    return;
  }
  box.textContent = `${coach.summary} Punti forti: ${coach.strengths.join(" | ")}. Punti deboli: ${coach.weaknesses.join(" | ")}. Focus prossimo: ${coach.nextFocus}.`;
}

function renderActiveChessExercise(exercise, emptyMessage = "Nessun drill caricato.") {
  const boardBox = document.getElementById("chessDrillBoard");
  const feedback = document.getElementById("chessDrillFeedback");
  const answer = document.getElementById("chessDrillAnswer");
  if (!boardBox || !feedback || !answer) return;
  answer.value = "";
  currentGame.drillSelection = null;
  currentGame.drillAttempt = null;
  if (!exercise) {
    boardBox.innerHTML = "";
    feedback.textContent = emptyMessage;
    return;
  }
  currentGame.activeExercise = exercise;
  boardBox.innerHTML = buildMiniBoardHtml(fenToBoard(exercise.fen_before), {});
  boardBox.onclick = handleMiniDrillBoardClick;
  feedback.textContent = `Tocca il pezzo e poi la casa di arrivo. Tema: ${exercise.theme}. Difficolta': ${exercise.difficulty}/5.`;
}

function checkChessDrillAnswer() {
  const exercise = currentGame.activeExercise;
  const input = document.getElementById("chessDrillAnswer");
  const feedback = document.getElementById("chessDrillFeedback");
  if (!exercise || !input || !feedback) return;
  const answer = normalizeMoveAnswer(input.value || (currentGame.drillAttempt && currentGame.drillAttempt.uci));
  evaluateChessDrillMove(answer);
}

function showChessDrillHint() {
  const exercise = currentGame.activeExercise;
  const feedback = document.getElementById("chessDrillFeedback");
  if (!exercise || !feedback) return;
  feedback.textContent = exercise.hint || `Hint: cerca scacchi, catture e minacce. Tema: ${exercise.theme}.`;
}

function showChessDrillSolution() {
  const exercise = currentGame.activeExercise;
  const feedback = document.getElementById("chessDrillFeedback");
  if (!exercise || !feedback) return;
  currentGame.drillAttempt = { uci: normalizeMoveAnswer(exercise.correct_move), solution: true };
  renderMiniDrillBoard();
  feedback.textContent = `Soluzione: ${exercise.correct_move}. ${exercise.explanation}`;
}

function nextChessDrill() {
  const exercises = currentGame.exerciseObjects || [];
  if (!exercises.length) return;
  currentGame.activeExerciseIndex = ((currentGame.activeExerciseIndex || 0) + 1) % exercises.length;
  renderActiveChessExercise(exercises[currentGame.activeExerciseIndex]);
}

function retryChessDrill() {
  const exercise = currentGame.activeExercise;
  if (!exercise) return;
  renderActiveChessExercise(exercise);
}

function handleMiniDrillBoardClick(event) {
  const square = event.target.closest("[data-mini-row]");
  const exercise = currentGame.activeExercise;
  if (!square || !exercise) return;
  const row = Number(square.dataset.miniRow);
  const col = Number(square.dataset.miniCol);
  const selected = currentGame.drillSelection;
  if (!selected) {
    currentGame.drillSelection = { row, col };
    currentGame.drillAttempt = null;
    renderMiniDrillBoard();
    return;
  }
  const uci = miniDrillMoveFromSquares(selected, { row, col }, exercise.correct_move);
  currentGame.drillAttempt = { from: selected, to: { row, col }, uci };
  currentGame.drillSelection = null;
  const input = document.getElementById("chessDrillAnswer");
  if (input) input.value = uci;
  renderMiniDrillBoard();
  evaluateChessDrillMove(uci);
}

function miniDrillMoveFromSquares(from, to, correctMove = "") {
  if (!from || !to) return "";
  let uci = `${coord(from.row, from.col)}${coord(to.row, to.col)}`;
  const correct = normalizeMoveAnswer(correctMove);
  if (correct.length === 5 && correct.startsWith(uci)) uci = correct;
  return uci;
}

function evaluateChessDrillMove(answer) {
  const exercise = currentGame.activeExercise;
  const feedback = document.getElementById("chessDrillFeedback");
  if (!exercise || !feedback) return;
  const normalizedAnswer = normalizeMoveAnswer(answer);
  const correct = normalizeMoveAnswer(exercise.correct_move);
  const ok = normalizedAnswer && correct && normalizedAnswer === correct;
  if (ok) {
    exercise.completed = true;
    exercise.completed_at = new Date().toISOString();
    currentGame.drillAttempt = currentGame.drillAttempt || { uci: normalizedAnswer };
    feedback.textContent = `Corretto: ${exercise.correct_move}. ${exercise.explanation}`;
    queueSupabaseExerciseCompletion(exercise);
  } else {
    feedback.textContent = `Non corretto. ${exercise.hint || "Hint: cerca scacchi, catture e minacce prima della mossa candidata."}`;
  }
  renderMiniDrillBoard();
  chessDebugLog("exercise-answer", { ok, answer: normalizedAnswer, correct, theme: exercise.theme });
}

function renderMiniDrillBoard() {
  const exercise = currentGame.activeExercise;
  const boardBox = document.getElementById("chessDrillBoard");
  if (!exercise || !boardBox) return;
  boardBox.innerHTML = buildMiniBoardHtml(fenToBoard(exercise.fen_before), {
    selected: currentGame.drillSelection,
    attempt: currentGame.drillAttempt,
    correctMove: exercise.completed || currentGame.drillAttempt && currentGame.drillAttempt.solution ? normalizeMoveAnswer(exercise.correct_move) : ""
  });
}

function queueSupabaseExerciseCompletion(exercise) {
  if (!exercise || exercise.supabaseCompletedQueued) return;
  exercise.supabaseCompletedQueued = true;
  queueSupabaseWrite("exercises", {
    game_id: exercise.game_id || currentGame.id,
    fen_before: exercise.fen_before,
    correct_move: exercise.correct_move,
    theme: exercise.theme,
    difficulty: exercise.difficulty,
    explanation: exercise.explanation,
    completed: true,
    completed_at: exercise.completed_at || new Date().toISOString(),
    payload: {
      ...exercise,
      source: "chess-drill-completion"
    }
  });
}

function normalizeMoveAnswer(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-h1-8qrbn]/g, "");
}

function fenToBoard(fen) {
  const boardPart = String(fen || "").split(" ")[0];
  const rows = boardPart.split("/");
  if (rows.length !== 8) return createInitialBoard();
  return rows.map((row) => {
    const squares = [];
    row.split("").forEach((char) => {
      if (/\d/.test(char)) {
        for (let i = 0; i < Number(char); i += 1) squares.push(null);
      } else {
        squares.push(char);
      }
    });
    return squares.slice(0, 8);
  });
}

function buildMiniBoardHtml(miniBoard, state = {}) {
  const correctSquares = state.correctMove ? uciToMiniSquares(state.correctMove) : null;
  return miniBoard.map((row, rowIndex) => row.map((piece, colIndex) => {
    const color = (rowIndex + colIndex) % 2 === 0 ? "light" : "dark";
    const selected = state.selected && state.selected.row === rowIndex && state.selected.col === colIndex;
    const attempted = state.attempt && state.attempt.to && state.attempt.to.row === rowIndex && state.attempt.to.col === colIndex;
    const correct = correctSquares && ((correctSquares.from.row === rowIndex && correctSquares.from.col === colIndex) || (correctSquares.to.row === rowIndex && correctSquares.to.col === colIndex));
    const pieceHtml = piece ? `<img src="${pieceImage(piece)}" alt="${pieceNames[piece] || piece}">` : "";
    return `<button type="button" class="mini-square ${color}${selected ? " selected" : ""}${attempted ? " attempted" : ""}${correct ? " correct" : ""}" data-mini-row="${rowIndex}" data-mini-col="${colIndex}">${pieceHtml}</button>`;
  }).join("")).join("");
}

function uciToMiniSquares(uci) {
  const parsed = uciToChessMove(uci);
  if (!parsed) return null;
  return {
    from: { row: 8 - Number(parsed.from[1]), col: parsed.from.charCodeAt(0) - 97 },
    to: { row: 8 - Number(parsed.to[1]), col: parsed.to.charCodeAt(0) - 97 }
  };
}

function rebuildCurrentGamePatterns() {
  currentGame.patternCounts = {};
  currentGame.mistakes = [];
  getSafeChessMoves().filter((move) => move.side === "Bianco" && isErrorQuality(move.quality) && move.categories && move.categories.length).forEach((move) => {
    currentGame.mistakes.push({ move: move.move, categories: move.categories, bestGap: move.loss || 0 });
    move.categories.forEach((category) => {
      currentGame.patternCounts[category] = (currentGame.patternCounts[category] || 0) + 1;
    });
  });
}

function renderBotLevel() {
  const requestedLevel = state.chess.botLevel || 1;
  const level = getActiveBotLevel(requestedLevel);
  if (state.chess.botLevel !== level && !isStockfishEngineInitializing()) {
    state.chess.botLevel = level;
    saveState();
  }
  const profile = getBotProfile(level);
  const spec = getBotLevelSpec(level);
  const config = getBotLevelConfig(level);
  const [targetMin, targetMax] = getBotAccuracyRange(level);
  const stats = getLevelStats(level);
  const accuracyGames = stats.accuracyGames || 0;
  const averageAccuracy = accuracyGames ? Math.round(stats.accuracySum / accuracyGames) : 0;
  const engineStatus = getEngineStatusText();
  const engineNotice = isStockfishEngineEnabled() ? "" : `<br><strong>${STOCKFISH_REQUIRED_NOTICE}</strong>`;
  console.log("botLevel", level);
  console.log("botElo", profile.elo);
  document.getElementById("botLevelText").innerHTML = `Livello ${level} - ${profile.displayElo || profile.elo} Elo stimato, ${profile.label}.<br>${profile.description || config.description || "Livello Stockfish calibrato."}<br>Modalita': ${spec.mode}; skill ${config.skillLevel}; depth ${spec.depth}; budget ${spec.moveTimeMs || spec.timeMs} ms; Top-${spec.topN}.<br>Errori target: mistake ${config.mistakeRatePercent}%, blunder ${config.blunderRatePercent}%, candidate inferiore ${config.randomMovePercent}%.<br>Motore: ${engineStatus}.<br>Record contro questo livello: ${stats.wins} vittorie, ${stats.losses} sconfitte, ${stats.draws} patte.<br>Range target futuro: ${targetMin}-${targetMax}%. Media reale engine-based: ${accuracyGames ? `${averageAccuracy}%` : "non disponibile"}.${engineNotice}`;
  renderBotLevelOptions(level);
}

function renderBotLevelOptions(activeLevel) {
  const select = document.getElementById("botLevelSelect");
  if (!select) return;
  const profiles = getAvailableBotProfiles();
  const levels = Object.keys(profiles).map(Number).sort((a, b) => a - b);
  const optionsKey = levels.join("|");
  if (select.dataset.optionsKey !== optionsKey) {
    select.innerHTML = levels.map((level) => {
      const profile = profiles[level];
      return `<option value="${level}">Livello ${level} - ${profile.label} - ${profile.displayElo || profile.elo} Elo</option>`;
    }).join("");
    select.dataset.optionsKey = optionsKey;
  }
  select.value = String(activeLevel);
}

function handleBotLevelChange(event) {
  const level = getActiveBotLevel(Number(event.target.value));
  state.chess.botLevel = level;
  saveState();
  resetChess();
}

function getBotProfile(level) {
  const profiles = getAvailableBotProfiles();
  return profiles[getActiveBotLevel(level)] || profiles[1];
}

function getBotLevelConfig(level) {
  return botLevels.find((item) => item.level === getActiveBotLevel(level)) || botLevels[0];
}

function getBotLevelSpec(level) {
  const activeLevel = getActiveBotLevel(level);
  const profile = getBotProfile(activeLevel);
  const spec = botLevelSpecs[activeLevel] || botLevelSpecs[1];
  return {
    elo: profile.elo,
    mode: spec.mode,
    depth: spec.depth,
    timeMs: spec.timeMs,
    moveTimeMs: spec.moveTimeMs || spec.timeMs,
    topN: spec.topN,
    noiseCp: spec.noiseCp,
    skillLevel: spec.skillLevel,
    mistakeRatePercent: spec.mistakeRatePercent,
    blunderRatePercent: spec.blunderRatePercent,
    randomMovePercent: spec.randomMovePercent
  };
}

function getLevelStats(level) {
  if (!state.chess.levelStats) state.chess.levelStats = {};
  const key = String(getActiveBotLevel(level));
  const defaults = { games: 0, wins: 0, losses: 0, draws: 0, accuracySum: 0, accuracyGames: 0 };
  state.chess.levelStats[key] = { ...defaults, ...(state.chess.levelStats[key] || {}) };
  return state.chess.levelStats[key];
}

function isStockfishEngineEnabled() {
  return Boolean(STOCKFISH_ENGINE_ENABLED && ChessEngineService && ChessEngineService.isEngineAvailable());
}

function isStockfishEngineInitializing() {
  if (!STOCKFISH_ENGINE_ENABLED || !ChessEngineService) return false;
  const status = ChessEngineService.getStatus();
  return Boolean(status && status.initializing);
}

function getEngineStatusText() {
  if (!ChessEngineService) return "Motore non disponibile";
  const status = ChessEngineService.getStatus();
  if (status.available) return `${status.name || "Stockfish"} pronto`;
  if (status.initializing) return "inizializzazione Stockfish";
  if (status.error) return `Motore non disponibile (${status.error})`;
  return "Motore non disponibile";
}

function initEngine() {
  if (!ChessEngineService) return Promise.resolve({ ok: false, error: "Servizio motore non inizializzato" });
  const initPromise = ChessEngineService.initEngine();
  renderBotLevel();
  return initPromise.then((result) => {
    if (result && result.ok && currentGame && currentGame.moves && !currentGame.moves.length) {
      syncCurrentGameBotLevel();
    }
    renderBotLevel();
    renderGameReport(buildGameAnalysis("partial"));
    return result;
  });
}

function syncCurrentGameBotLevel() {
  const level = getActiveBotLevel(state.chess.botLevel || currentGame.botLevel || 1);
  const profile = getBotProfile(level);
  currentGame.botLevel = level;
  currentGame.botElo = profile.elo;
  currentGame.botLabel = profile.label;
}

function createChessEngineService() {
  let worker = null;
  let workerUrl = null;
  let available = false;
  let initializing = false;
  let name = "Stockfish";
  let error = "Motore non inizializzato";
  let queue = Promise.resolve();
  let supportedOptions = new Set();
  const listeners = new Set();

  function getStatus() {
    return { available, initializing, name, error };
  }

  function isEngineAvailable() {
    return available;
  }

  async function initEngine() {
    if (!STOCKFISH_ENGINE_ENABLED) return fail("Motore disattivato");
    if (available) return { ok: true, name };
    if (initializing) return waitUntilReady();
    if (typeof Worker === "undefined") return fail("Web Worker non supportato");
    if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
      return fail("Stockfish richiede server locale http://localhost, non file://");
    }
    initializing = true;
    error = null;
    for (const source of getStockfishSources()) {
      try {
        await startWorker(source);
        available = true;
        initializing = false;
        name = source.label;
        error = null;
        chessDebugLog("Stockfish loaded", { source: source.url, name });
        return { ok: true, name, source: source.url };
      } catch (sourceError) {
        stopWorker();
        error = sourceError.message || String(sourceError);
        chessDebugLog("Stockfish error", { source: source.url, error });
      }
    }
    initializing = false;
    available = false;
    return fail(error || "Stockfish non caricato");
  }

  function waitUntilReady() {
    return new Promise((resolve) => {
      const started = Date.now();
      const timer = setInterval(() => {
        if (available || !initializing || Date.now() - started > 18000) {
          clearInterval(timer);
          resolve(available ? { ok: true, name } : fail(error || "Timeout motore"));
        }
      }, 120);
    });
  }

  async function startWorker(source) {
    stopWorker();
    worker = await createStockfishWorker(source);
    worker.onmessage = (event) => {
      const line = normalizeEngineLine(event.data);
      rememberEngineOption(line);
      listeners.forEach((listener) => listener(line));
    };
    worker.onerror = (event) => {
      const message = event && event.message ? event.message : "Errore worker Stockfish";
      listeners.forEach((listener) => listener(`error ${message}`));
    };
    post("uci");
    await waitForLine((line) => line === "uciok", 18000);
    if (hasEngineOption("Hash")) post("setoption name Hash value 16");
    post("ucinewgame");
    post("isready");
    await waitForLine((line) => line === "readyok", 12000);
  }

  function rememberEngineOption(line) {
    const match = line.match(/^option name (.+?) type /);
    if (match && match[1]) supportedOptions.add(match[1]);
  }

  function hasEngineOption(optionName) {
    return supportedOptions.has(optionName);
  }

  function createStockfishWorker(source) {
    if (source.remote) {
      const sourceCode = `importScripts(${JSON.stringify(source.url)});`;
      workerUrl = URL.createObjectURL(new Blob([sourceCode], { type: "application/javascript" }));
      return new Worker(workerUrl);
    }
    return new Worker(new URL(source.url, window.location.href).href);
  }

  function getStockfishSources() {
    return STOCKFISH_WORKER_SOURCES.slice();
  }

  function stopWorker() {
    if (worker) worker.terminate();
    worker = null;
    if (workerUrl) URL.revokeObjectURL(workerUrl);
    workerUrl = null;
    supportedOptions = new Set();
    listeners.clear();
  }

  function post(command) {
    if (!worker) throw new Error("Motore non disponibile");
    worker.postMessage(command);
  }

  function waitForLine(predicate, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        listeners.delete(listener);
        reject(new Error("Timeout risposta Stockfish"));
      }, timeoutMs);
      const listener = (line) => {
        if (line.startsWith("error ")) {
          clearTimeout(timer);
          listeners.delete(listener);
          reject(new Error(line.replace(/^error\s+/, "")));
          return;
        }
        if (!predicate(line)) return;
        clearTimeout(timer);
        listeners.delete(listener);
        resolve(line);
      };
      listeners.add(listener);
    });
  }

  function enqueue(task) {
    const run = queue.then(task, task);
    queue = run.catch(() => {});
    return run;
  }

  function getBestMove(fen, depth = 8, timeMs = 400) {
    return searchPosition(fen, [], depth, timeMs);
  }

  function getTopMoves(fen, depth = 8, timeMs = 400, multiPv = 1) {
    return searchPosition(fen, [], depth, timeMs, multiPv);
  }

  function evaluatePosition(fen, depth = 8, timeMs = 400, moves = []) {
    return searchPosition(fen, moves, depth, timeMs);
  }

  function configureBotLevel(level, elo) {
    if (!isEngineAvailable()) return Promise.resolve(unavailableResult());
    return enqueue(() => new Promise((resolve) => {
      const skill = getStockfishSkillForLevel(level);
      const config = getBotLevelConfig(level);
      const limitStrength = Number(elo || config.estimatedElo || 0) >= 1350;
      const timer = setTimeout(() => {
        listeners.delete(listener);
        resolve({ ok: false, error: "Timeout configurazione Stockfish" });
      }, 3000);
      const listener = (line) => {
        if (line.startsWith("error ")) {
          clearTimeout(timer);
          listeners.delete(listener);
          resolve({ ok: false, error: line.replace(/^error\s+/, "") });
          return;
        }
        if (line !== "readyok") return;
        clearTimeout(timer);
        listeners.delete(listener);
        resolve({ ok: true, skill, elo, limitStrength });
      };
      listeners.add(listener);
      try {
        if (hasEngineOption("Skill Level")) post(`setoption name Skill Level value ${skill}`);
        if (hasEngineOption("UCI_LimitStrength")) post(`setoption name UCI_LimitStrength value ${limitStrength ? "true" : "false"}`);
        if (limitStrength && hasEngineOption("UCI_Elo")) post(`setoption name UCI_Elo value ${clamp(Math.round(elo || config.estimatedElo || 1350), 1350, 2850)}`);
        post("isready");
      } catch (configurationError) {
        clearTimeout(timer);
        listeners.delete(listener);
        resolve({ ok: false, error: configurationError.message || String(configurationError) });
      }
    }));
  }

  async function analyzeMove(fenBefore, playedMove, depth = 8, timeMs = 400) {
    if (!isEngineAvailable()) return unavailableResult();
    const uci = typeof playedMove === "string" ? playedMove : playedMove && playedMove.uci;
    if (!uci) return { ok: false, error: "Mossa UCI mancante", bestMove: null, evaluation: null, depth: 0, pv: [] };
    const before = await searchPosition(fenBefore, [], depth, timeMs);
    const after = await searchPosition(fenBefore, [uci], depth, timeMs);
    return {
      ok: before.ok && after.ok,
      error: before.ok && after.ok ? null : before.error || after.error,
      playedMove: uci,
      bestMove: before.bestMove,
      evaluationBefore: before.evaluation,
      evaluationAfter: after.evaluation,
      depth: Math.min(before.depth || 0, after.depth || 0),
      pv: before.pv || []
    };
  }

  function searchPosition(fen, moves = [], depth = 8, timeMs = 400, multiPv = 1) {
    if (!isEngineAvailable()) return Promise.resolve(unavailableResult());
    return enqueue(async () => {
      const ready = await waitForReadyBeforeSearch();
      if (!ready.ok) return { ...unavailableResult(), error: ready.error || "Stockfish non pronto", fen, rawLines: ready.rawLines || [], rawStockfishLines: ready.rawLines || [] };
      return runSearch(fen, moves, depth, timeMs, multiPv);
    });
  }

  function waitForReadyBeforeSearch() {
    return new Promise((resolve) => {
      const rawLines = [];
      const timer = setTimeout(() => {
        listeners.delete(listener);
        console.log("Stockfish timeout: nessuna readyok ricevuta", rawLines);
        resolve({ ok: false, error: "Stockfish timeout: nessuna readyok ricevuta", rawLines });
      }, 5000);
      const listener = (line) => {
        if (line) rawLines.push(line);
        if (line.startsWith("error ")) {
          clearTimeout(timer);
          listeners.delete(listener);
          resolve({ ok: false, error: line.replace(/^error\s+/, ""), rawLines });
          return;
        }
        if (line !== "readyok") return;
        clearTimeout(timer);
        listeners.delete(listener);
        resolve({ ok: true, rawLines });
      };
      listeners.add(listener);
      try {
        post("isready");
      } catch (readyError) {
        clearTimeout(timer);
        listeners.delete(listener);
        resolve({ ok: false, error: readyError.message || String(readyError), rawLines });
      }
    });
  }

  function runSearch(fen, moves, depth, timeMs, multiPv = 1) {
    return new Promise((resolve) => {
      let latest = { depth: 0, evaluation: null, pv: [] };
      const topMoves = {};
      const rawStockfishLines = [];
      const timer = setTimeout(() => {
        listeners.delete(listener);
        console.log("Stockfish timeout: nessuna bestmove ricevuta", rawStockfishLines);
        resolve(buildSearchResult({
          ok: false,
          error: "Stockfish timeout: nessuna bestmove ricevuta",
          fen,
          bestMove: null,
          terminal: false,
          latest,
          topMoves,
          rawStockfishLines
        }));
      }, 15000);
      const listener = (line) => {
        console.log("Stockfish raw line:", line);
        if (line) rawStockfishLines.push(line);
        if (line.startsWith("info ")) {
          latest = parseEngineInfo(line, latest);
          if (latest.pv && latest.pv[0]) {
            topMoves[latest.multiPv || 1] = {
              rank: latest.multiPv || 1,
              uci: latest.pv[0],
              evaluation: latest.evaluation,
              depth: latest.depth,
              pv: latest.pv
            };
          }
        }
        if (!line.startsWith("bestmove ")) return;
        clearTimeout(timer);
        listeners.delete(listener);
        const parsedBest = parseBestMove(line);
        const bestMove = parsedBest.bestMove;
        console.log("Bestmove found:", bestMove);
        console.log("Evaluation cp:", evaluationToCp(latest.evaluation));
        console.log("FEN:", fen);
        console.log("Depth:", latest.depth || depth);
        const sortedTopMoves = Object.values(topMoves).sort((a, b) => a.rank - b.rank);
        const bestLine = sortedTopMoves[0] || null;
        if (parsedBest.terminal) {
          resolve(buildSearchResult({
            ok: true,
            error: null,
            fen,
            bestMove: null,
            terminal: true,
            latest,
            topMoves,
            rawStockfishLines,
            pv: bestLine ? bestLine.pv : latest.pv
          }));
          return;
        }
        resolve(buildSearchResult({
          ok: Boolean(bestMove),
          error: bestMove ? null : "Mossa migliore non trovata",
          fen,
          bestMove,
          terminal: false,
          latest,
          topMoves,
          rawStockfishLines,
          pv: bestLine ? bestLine.pv : latest.pv
        }));
      };
      listeners.add(listener);
      try {
        const moveSuffix = moves.length ? ` moves ${moves.join(" ")}` : "";
        if (hasEngineOption("MultiPV")) post(`setoption name MultiPV value ${Math.max(1, multiPv || 1)}`);
        post(`position fen ${fen}${moveSuffix}`);
        post(`go depth ${Math.max(1, depth || 1)}`);
      } catch (searchError) {
        clearTimeout(timer);
        listeners.delete(listener);
        resolve({ ok: false, error: searchError.message || String(searchError), fen, bestMove: null, evaluation: null, evaluationCp: null, mate: null, depth: 0, pv: [], topMoves: [], candidateMoves: [], rawLines: rawStockfishLines, rawStockfishLines });
      }
    });
  }

  function buildSearchResult({ ok, error, fen, bestMove, terminal, latest, topMoves, rawStockfishLines, pv = null }) {
    const sortedTopMoves = Object.values(topMoves || {}).sort((a, b) => a.rank - b.rank);
    const bestLine = sortedTopMoves[0] || null;
    const evaluation = bestLine && bestLine.evaluation ? bestLine.evaluation : latest && latest.evaluation ? latest.evaluation : null;
    const evaluationCp = evaluationToCp(evaluation);
    const result = {
      ok,
      error,
      fen,
      bestMove,
      terminal: Boolean(terminal),
      evaluation,
      evaluationCp,
      evaluationPawns: typeof evaluationCp === "number" ? evaluationCp / 100 : null,
      mate: evaluation && evaluation.type === "mate" ? evaluation.value : null,
      depth: latest && latest.depth ? latest.depth : 0,
      pv: pv || (latest && latest.pv) || [],
      topMoves: sortedTopMoves,
      candidateMoves: sortedTopMoves,
      rawLines: rawStockfishLines,
      rawStockfishLines
    };
    if (!ok && error) console.log("Stockfish error", error, rawStockfishLines);
    return result;
  }

  function unavailableResult() {
    return { ok: false, error: "Motore non disponibile", bestMove: null, evaluation: null, depth: 0, pv: [], topMoves: [] };
  }

  function fail(message) {
    error = message || "Motore non disponibile";
    return { ok: false, error, bestMove: null, evaluation: null, depth: 0, pv: [] };
  }

  return {
    initEngine,
    isEngineAvailable,
    getStatus,
    getBestMove,
    getTopMoves,
    evaluatePosition,
    configureBotLevel,
    analyzeMove
  };
}

function getStockfishSkillForLevel(level) {
  return getBotLevelConfig(level).skillLevel;
}

function normalizeEngineLine(message) {
  return String(message && message.data ? message.data : message).trim();
}

function parseEngineInfo(line, previous = {}) {
  const depthMatch = line.match(/\bdepth\s+(\d+)/);
  const multiPvMatch = line.match(/\bmultipv\s+(\d+)/);
  const cpMatch = line.match(/\bscore\s+cp\s+(-?\d+)/);
  const mateMatch = line.match(/\bscore\s+mate\s+(-?\d+)/);
  const pvMatch = line.match(/\bpv\s+(.+)$/);
  const evaluation = cpMatch ? { type: "cp", value: Number(cpMatch[1]) } : mateMatch ? { type: "mate", value: Number(mateMatch[1]) } : previous.evaluation || null;
  return {
    depth: depthMatch ? Number(depthMatch[1]) : previous.depth || 0,
    multiPv: multiPvMatch ? Number(multiPvMatch[1]) : previous.multiPv || 1,
    evaluation,
    pv: pvMatch ? pvMatch[1].split(/\s+/).filter(Boolean) : previous.pv || []
  };
}

function parseBestMove(line) {
  const match = line.match(/^bestmove\s+(\S+)/);
  const token = match ? match[1] : null;
  const terminal = !token || token === "(none)" || token === "0000";
  return {
    bestMove: terminal ? null : token,
    terminal
  };
}

function evaluationToCp(evaluation) {
  if (!evaluation) return null;
  if (evaluation.type === "mate") return Math.sign(evaluation.value || 1) * 10000;
  return Number(evaluation.value || 0);
}

function uciToChessMove(uci) {
  if (!uci || typeof uci !== "string" || uci.length < 4) return null;
  const move = {
    from: uci.slice(0, 2),
    to: uci.slice(2, 4)
  };
  if (uci.length >= 5) move.promotion = uci[4].toLowerCase();
  return move;
}

function getAvailableBotProfiles() {
  return botLevelProfiles;
}

function getMaxBotLevel() {
  return Math.max(...Object.keys(getAvailableBotProfiles()).map((key) => Number(key)));
}

function getActiveBotLevel(level) {
  const parsed = Number(level);
  if (!Number.isFinite(parsed)) return 1;
  return clamp(Math.round(parsed), 1, getMaxBotLevel());
}

function isErrorQuality(quality) {
  return quality === "inexact" || quality === "inaccuracy" || quality === "missed" || quality === "mistake" || quality === "blunder";
}

function filterBotCandidateMoves(currentBoard, moves, level) {
  if (level < 7 || moves.length <= 1) return moves;
  const safeMoves = moves.filter((move) => !isBotSuicideMove(currentBoard, move, level));
  return safeMoves.length ? safeMoves : moves;
}

function isBotSuicideMove(currentBoard, move, level) {
  const next = applyMove(currentBoard, move);
  const blackMates = getAllLegalMoves(next, "w").length === 0 && isKingInCheck(next, "w");
  if (blackMates) return false;
  if (hasImmediateMate(next, "w")) return true;

  const captured = currentBoard[move.toRow][move.toCol];
  const capturedValue = captured ? pieceValues[captured.toLowerCase()] || 0 : 0;
  const movedPiece = next[move.toRow][move.toCol];
  const movedValue = movedPiece ? pieceValues[movedPiece.toLowerCase()] || 0 : 0;
  const blackCounter = immediateThreatScore(next, "b").score;
  const compensation = capturedValue + blackCounter * 0.4 + (isKingInCheck(next, "w") ? 90 : 0);

  if (movedPiece && movedValue >= 500) {
    const attacked = isSquareAttacked(next, move.toRow, move.toCol, "w");
    const defended = isSquareAttacked(next, move.toRow, move.toCol, "b");
    if (attacked && !defended && compensation < movedValue * 0.7) return true;
  }

  const looseBefore = looseMaterial(currentBoard, "b");
  const looseAfter = looseMaterial(next, "b");
  const looseIncrease = looseAfter - looseBefore;
  const highValueLooseBefore = highestHangingPiece(currentBoard, "b", 500);
  const highValueLooseAfter = highestHangingPiece(next, "b", 500);
  const looseLimit = level >= 11 ? 300 : 450;
  if (looseIncrease >= looseLimit && compensation < looseIncrease * 0.65) return true;
  if (highValueLooseAfter && (!highValueLooseBefore || highValueLooseAfter.value >= highValueLooseBefore.value)) {
    if (compensation < highValueLooseAfter.value * 0.55) return true;
  }

  const whiteThreat = immediateThreatScore(next, "w").score;
  const threatLimit = level >= 11 ? 360 : 520;
  if (whiteThreat >= threatLimit && compensation + blackCounter * 0.5 < whiteThreat * 0.85) return true;

  const whiteCapture = bestImmediateCaptureGain(next, "w");
  if (level >= 7 && whiteCapture.gain >= 460 && compensation < whiteCapture.gain * 0.75) return true;
  if (level >= 7 && whiteCapture.capturedValue >= 500 && whiteCapture.gain >= 240 && compensation < whiteCapture.capturedValue * 0.55) return true;
  if (level >= 8 && whiteCapture.capturedValue >= 300 && whiteCapture.gain >= 180 && compensation < whiteCapture.capturedValue * 0.45) return true;

  const bestImmediate = immediateThreatScore(currentBoard, "b").score;
  const selectedImmediate = moveImmediateScore(currentBoard, move, "b", level);
  if (bestImmediate >= 420 && selectedImmediate < bestImmediate * 0.45) {
    const tacticalGap = bestImmediate - selectedImmediate;
    if (level >= 11 || tacticalGap >= 650 || whiteThreat >= 220) return true;
  }
  const bestCaptureBefore = bestImmediateCaptureGain(currentBoard, "b");
  const bestCaptureAfter = bestImmediateCaptureGain(next, "b");
  if (level >= 7 && bestCaptureBefore.gain >= 420 && bestCaptureAfter.gain < bestCaptureBefore.gain * 0.45 && selectedImmediate < bestCaptureBefore.gain * 0.55) return true;

  const beforeEval = evaluateBoardAdvanced(currentBoard, level);
  const afterEval = evaluateBoardAdvanced(next, level);
  const blackDrop = afterEval - beforeEval;
  if (level >= 7 && blackDrop > 200 && compensation < 320) return true;
  return false;
}

function bestImmediateCaptureGain(currentBoard, color) {
  const opponent = color === "w" ? "b" : "w";
  let best = { gain: 0, capturedValue: 0, move: null };
  getAllLegalMoves(currentBoard, color).forEach((move) => {
    const captured = move.enPassant ? currentBoard[move.fromRow][move.toCol] : currentBoard[move.toRow][move.toCol];
    if (!captured) return;
    const moved = currentBoard[move.fromRow][move.fromCol];
    const movedValue = moved ? pieceValues[moved.toLowerCase()] || 0 : 0;
    const capturedValue = pieceValues[captured.toLowerCase()] || 0;
    const next = applyMove(currentBoard, move);
    const recaptureRisk = isSquareAttacked(next, move.toRow, move.toCol, opponent) ? movedValue * 0.85 : 0;
    const checkBonus = isKingInCheck(next, opponent) ? 70 : 0;
    const mateBonus = getAllLegalMoves(next, opponent).length === 0 && isKingInCheck(next, opponent) ? 100000 : 0;
    const gain = capturedValue - recaptureRisk + checkBonus + mateBonus;
    if (gain > best.gain) best = { gain, capturedValue, move };
  });
  return best;
}

function moveImmediateScore(currentBoard, move, color, level = 10) {
  const next = applyMove(currentBoard, move);
  const beforeEval = evaluateBoardAdvanced(currentBoard, level);
  const afterEval = evaluateBoardAdvanced(next, level);
  const gain = color === "b" ? beforeEval - afterEval : afterEval - beforeEval;
  const captured = currentBoard[move.toRow][move.toCol];
  const capturedValue = captured ? pieceValues[captured.toLowerCase()] || 0 : 0;
  const opponent = color === "w" ? "b" : "w";
  const checkBonus = isKingInCheck(next, opponent) ? 45 : 0;
  return gain + capturedValue * 0.5 + checkBonus;
}

function highestHangingPiece(currentBoard, color, minimumValue = 0) {
  const enemy = color === "w" ? "b" : "w";
  let worst = null;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = currentBoard[row][col];
      if (!piece || piece.toLowerCase() === "k") continue;
      if (color === "w" && !isWhite(piece)) continue;
      if (color === "b" && !isBlack(piece)) continue;
      const value = pieceValues[piece.toLowerCase()] || 0;
      if (value < minimumValue) continue;
      if (isSquareAttacked(currentBoard, row, col, enemy) && !isSquareAttacked(currentBoard, row, col, color)) {
        if (!worst || value > worst.value) worst = { row, col, piece, value };
      }
    }
  }
  return worst;
}

function botMoveSafetyPenalty(currentBoard, move, level) {
  if (level < 7) return 0;
  if (isBotSuicideMove(currentBoard, move, level)) return 100000;
  const next = applyMove(currentBoard, move);
  const looseIncrease = Math.max(0, looseMaterial(next, "b") - looseMaterial(currentBoard, "b"));
  const whiteThreat = immediateThreatScore(next, "w").score;
  const blackThreat = immediateThreatScore(next, "b").score;
  const threatGap = Math.max(0, whiteThreat - blackThreat * 0.45);
  return looseIncrease * (level >= 11 ? 2.3 : 1.5) + threatGap * (level >= 11 ? 1.2 : 0.7);
}

function chooseBotMove(currentBoard, moves) {
  const level = Math.min(getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1), 7);
  const candidateMoves = filterBotCandidateMoves(currentBoard, moves, level);
  if (level >= 7) return chooseSearchBotMove(currentBoard, candidateMoves, level);
  const scored = candidateMoves.map((move) => ({ move, score: scoreBlackMove(currentBoard, move) })).sort((a, b) => b.score - a.score);
  const randomChance = { 1: 0.32, 2: 0.24, 3: 0.16, 4: 0.1, 5: 0.05, 6: 0.02, 7: 0 }[level];
  if (Math.random() < randomChance) {
    const poolTargets = { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 1 };
    const poolSize = Math.min(scored.length, poolTargets[level] || 5);
    const pool = scored.slice(0, poolSize);
    return pool[Math.floor(Math.random() * pool.length)].move;
  }
  const candidateSize = level <= 2 ? Math.min(8, scored.length) : level <= 4 ? Math.min(5, scored.length) : level <= 5 ? Math.min(3, scored.length) : level <= 6 ? Math.min(2, scored.length) : 1;
  const candidates = scored.slice(0, candidateSize);
  return candidates[Math.floor(Math.random() * candidates.length)].move;
}

async function chooseBotMoveAsync(currentBoard, moves) {
  const level = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const ready = await ensureStockfishReadyForChess();
  if (!ready) return null;
  const profile = getBotProfile(level);
  const configured = await ChessEngineService.configureBotLevel(level, profile.elo);
  if (!configured.ok) {
    currentGame.engineError = configured.error || "Configurazione Stockfish non riuscita";
    return null;
  }
  const depth = getEngineDepthForLevel(level);
  const timeMs = getEngineTimeForLevel(level);
  const multiPv = getEngineTopCountForLevel(level);
  const fen = boardToFen(currentBoard, "b", gameState);
  const engineResult = await ChessEngineService.getTopMoves(fen, depth, timeMs, multiPv);
  currentGame.lastEngineResult = engineResult;
  chessDebugLog("bot-search", {
    botLevel: level,
    botElo: profile.elo,
    depth,
    moveTimeMs: timeMs,
    fenBefore: fen,
    bestMove: engineResult.bestMove,
    evalBefore: engineResult.evaluation,
    candidateMoves: normalizeEngineCandidates(engineResult).map((candidate) => ({
      rank: candidate.rank,
      uci: candidate.uci,
      eval: candidate.evaluation
    }))
  });
  console.log("bestMove", engineResult.bestMove);
  console.log("fenBefore", fen);
  console.log("evalBefore", engineResult.evaluation);
  if (!engineResult.ok) {
    currentGame.engineError = engineResult.error || "Motore non disponibile";
    return null;
  }
  const engineMove = chooseEngineMoveFromResult(currentBoard, engineResult, moves, level);
  if (!engineMove) {
    currentGame.engineError = `Mossa Stockfish non legale: ${engineResult.bestMove || "-"}`;
    return null;
  }
  currentGame.engineError = null;
  return engineMove;
}

async function ensureStockfishReadyForChess() {
  if (isStockfishEngineEnabled()) return true;
  const status = ChessEngineService ? ChessEngineService.getStatus() : null;
  currentGame.engineError = status && status.error ? status.error : "Stockfish non ancora pronto";
  const result = await initEngine();
  return Boolean(result && result.ok && isStockfishEngineEnabled());
}

function ensureSafeBotMove(currentBoard, legalMoves, selectedMove, level) {
  if (!selectedMove) return null;
  if (level < 7 || !isBotSuicideMove(currentBoard, selectedMove, level)) return selectedMove;
  return null;
}

function getEngineDepthForLevel(level) {
  return getBotLevelSpec(level).depth;
}

function getEngineTimeForLevel(level) {
  return getBotLevelSpec(level).timeMs;
}

function getEngineTopCountForLevel(level) {
  return getBotLevelSpec(level).topN;
}

function chooseEngineMoveFromResult(currentBoard, engineResult, legalMoves, level) {
  const engineCandidates = (engineResult.topMoves && engineResult.topMoves.length ? engineResult.topMoves : [{ rank: 1, uci: engineResult.bestMove, evaluation: engineResult.evaluation, depth: engineResult.depth, pv: engineResult.pv }])
    .map((item) => ({ ...item, move: moveFromUci(item.uci, legalMoves) }))
    .filter((item) => item.move);
  const candidates = engineCandidates.sort((a, b) => (a.rank || 1) - (b.rank || 1));
  if (!candidates.length) return null;
  const safeMoveSet = level >= 7 ? new Set(filterBotCandidateMoves(currentBoard, candidates.map((candidate) => candidate.move), level)) : null;
  const safeCandidates = safeMoveSet ? candidates.filter((candidate) => safeMoveSet.has(candidate.move)) : candidates;
  const pool = (safeCandidates.length ? safeCandidates : candidates).slice(0, getEngineTopCountForLevel(level));
  const selection = selectHumanizedEngineCandidate(pool, level);
  chessDebugLog("bot-choice", {
    botLevel: level,
    botElo: getBotProfile(level).elo,
    selectedMove: selection.candidate && selection.candidate.uci,
    bestMove: candidates[0] && candidates[0].uci,
    reason: selection.reason,
    pool: pool.map((candidate) => ({ rank: candidate.rank, uci: candidate.uci, eval: candidate.evaluation }))
  });
  console.log("selectedMove", selection.candidate && selection.candidate.uci);
  console.log("candidateMoves", pool.map((candidate) => candidate.uci));
  return selection.candidate ? selection.candidate.move : pool[0].move;
}

function selectHumanizedEngineCandidate(pool, level) {
  if (!pool.length) return { candidate: null, reason: "no-candidates" };
  const spec = getBotLevelSpec(level);
  const config = getBotLevelConfig(level);
  if (pool.length === 1 || (config.mistakeRatePercent + config.blunderRatePercent + config.randomMovePercent <= 0 && spec.noiseCp <= 0)) {
    return { candidate: pool[0], reason: "best-move" };
  }
  const roll = Math.random() * 100;
  const blunderLimit = config.blunderRatePercent;
  const mistakeLimit = blunderLimit + config.mistakeRatePercent;
  const randomLimit = mistakeLimit + config.randomMovePercent;
  let selectedPool = pool.slice(0, Math.max(1, Math.ceil(pool.length / 2)));
  let reason = "normal-top-candidate";
  if (roll < blunderLimit && pool.length >= 4) {
    selectedPool = pool.slice(Math.max(1, Math.floor(pool.length * 0.65)));
    reason = "controlled-blunder-candidate";
  } else if (roll < mistakeLimit && pool.length >= 3) {
    selectedPool = pool.slice(Math.max(1, Math.floor(pool.length * 0.4)));
    reason = "controlled-mistake-candidate";
  } else if (roll < randomLimit && pool.length >= 2) {
    selectedPool = pool.slice(1);
    reason = "inferior-human-candidate";
  }
  selectedPool = keepHumanCandidatePoolWithinLoss(pool, selectedPool, level, reason);
  if (level <= 10) {
    const candidate = selectWeightedEngineCandidate(selectedPool, level);
    return { candidate: candidate || selectedPool[0] || pool[0], reason: `${reason}-weighted-human` };
  }
  const noiseCp = spec.noiseCp;
  if (noiseCp <= 0 || selectedPool.length <= 1) return { candidate: selectedPool[0] || pool[0], reason };
  let selected = null;
  selectedPool.forEach((candidate, index) => {
    const base = engineCandidateScoreCp(candidate) - index * 2;
    const jitter = (Math.random() * 2 - 1) * noiseCp;
    const score = base + jitter;
    if (!selected || score > selected.score) selected = { candidate, score };
  });
  return { candidate: selected ? selected.candidate : selectedPool[0], reason };
}

function keepHumanCandidatePoolWithinLoss(pool, selectedPool, level, reason = "") {
  if (!pool.length || !selectedPool.length) return selectedPool.length ? selectedPool : pool;
  const bestScore = engineCandidateScoreCp(pool[0]);
  const limit = getHumanCandidateLossLimit(level, reason);
  const filtered = selectedPool.filter((candidate) => {
    const gap = bestScore - engineCandidateScoreCp(candidate);
    return gap <= limit;
  });
  if (filtered.length) return filtered;
  const safeFallback = pool.filter((candidate) => bestScore - engineCandidateScoreCp(candidate) <= limit);
  return safeFallback.length ? safeFallback : pool.slice(0, 1);
}

function getHumanCandidateLossLimit(level, reason = "") {
  const base = {
    7: 280,
    8: 230,
    9: 180,
    10: 150,
    11: 120,
    12: 90
  }[level] || 80;
  if (reason.includes("controlled-blunder")) return level >= 9 ? base : base + 90;
  if (reason.includes("controlled-mistake")) return base + 45;
  if (reason.includes("inferior")) return base + 25;
  return base;
}

function selectWeightedEngineCandidate(candidates, level) {
  if (!candidates.length) return null;
  const weights = getEngineChoiceWeights(level, candidates.length);
  const total = candidates.reduce((sum, _candidate, index) => sum + (weights[index] || 0), 0) || 1;
  let roll = Math.random() * total;
  for (let index = 0; index < candidates.length; index += 1) {
    roll -= weights[index] || 0;
    if (roll <= 0) return candidates[index];
  }
  return candidates[0];
}

function chooseEngineMoveWithNoise(candidates, noiseCp) {
  let selected = null;
  candidates.forEach((candidate, index) => {
    const base = engineCandidateScoreCp(candidate) - index * 2;
    const jitter = (Math.random() * 2 - 1) * noiseCp;
    const score = base + jitter;
    if (!selected || score > selected.score) selected = { move: candidate.move, score };
  });
  return selected ? selected.move : candidates[0].move;
}

function engineCandidateScoreCp(candidate) {
  const evaluation = candidate && candidate.evaluation;
  if (!evaluation) return -((candidate && candidate.rank) || 1) * 10;
  if (evaluation.type === "mate") return Math.sign(evaluation.value || 1) * 100000;
  return Number(evaluation.value || 0);
}

function getEngineChoiceWeights(level, count) {
  const table = {
    1: [0.18, 0.16, 0.14, 0.12, 0.1, 0.09, 0.08, 0.06, 0.04, 0.03],
    2: [0.24, 0.2, 0.16, 0.12, 0.1, 0.08, 0.06, 0.04],
    3: [0.32, 0.22, 0.16, 0.11, 0.08, 0.06, 0.05],
    4: [0.42, 0.22, 0.14, 0.1, 0.07, 0.05],
    5: [0.55, 0.22, 0.12, 0.07, 0.04],
    6: [0.68, 0.2, 0.08, 0.04],
    7: [0.38, 0.24, 0.16, 0.1, 0.07, 0.05],
    8: [0.5, 0.24, 0.13, 0.08, 0.05],
    9: [0.58, 0.23, 0.11, 0.05, 0.03],
    10: [0.66, 0.22, 0.08, 0.04],
    11: [0.82, 0.13, 0.04, 0.01],
    12: [0.9, 0.08, 0.02]
  };
  const weights = table[level] || [1];
  return weights.slice(0, count);
}

function weightedEngineChoice(candidates, weights) {
  if (!candidates.length) return null;
  const total = candidates.reduce((sum, _candidate, index) => sum + (weights[index] || 0), 0) || 1;
  let roll = Math.random() * total;
  for (let index = 0; index < candidates.length; index += 1) {
    roll -= weights[index] || 0;
    if (roll <= 0) return candidates[index].move;
  }
  return candidates[0].move;
}

function moveFromUci(uci, legalMoves) {
  const chessMove = uciToChessMove(uci);
  if (!chessMove) return null;
  const fromCol = chessMove.from.charCodeAt(0) - 97;
  const fromRow = 8 - Number(chessMove.from[1]);
  const toCol = chessMove.to.charCodeAt(0) - 97;
  const toRow = 8 - Number(chessMove.to[1]);
  return legalMoves.find((move) => {
    if (move.fromRow !== fromRow || move.fromCol !== fromCol || move.toRow !== toRow || move.toCol !== toCol) return false;
    if (chessMove.promotion && move.promotion && move.promotion.toLowerCase() !== chessMove.promotion) return false;
    return true;
  }) || null;
}

function chooseBotOpeningBookMove(currentBoard, legalMoves, level) {
  if (level < 5 || currentGame.moves.length > 10 || isEndgame(currentBoard)) return null;
  const lastWhite = [...currentGame.moves].reverse().find((move) => move.colorMoved === "w");
  const firstWhite = currentGame.moves.find((move) => move.colorMoved === "w");
  const firstUci = firstWhite ? firstWhite.uci : "";
  const bookLines = {
    e2e4: ["c7c5", "e7e5", "c7c6", "e7e6", "g8f6"],
    d2d4: ["g8f6", "d7d5", "e7e6", "c7c5"],
    c2c4: ["e7e5", "g8f6", "c7c5", "e7e6"],
    g1f3: ["d7d5", "g8f6", "c7c5"],
    b1c3: ["d7d5", "g8f6", "e7e5"]
  };
  const priority = [
    ...(bookLines[firstUci] || []),
    "g8f6",
    "b8c6",
    "e7e6",
    "d7d5",
    "c7c5",
    "e7e5",
    "f8e7",
    "f8b4",
    "g7g6",
    "d8e7",
    "e8g8"
  ];
  if (lastWhite && lastWhite.uci === "f1b5") priority.unshift("a7a6", "g8f6");
  if (lastWhite && lastWhite.uci === "d1h5") priority.unshift("g7g6", "g8f6");
  for (const uci of priority) {
    const move = moveFromUci(uci, legalMoves);
    if (move && !isBotSuicideMove(currentBoard, move, level)) return move;
  }
  return null;
}

function chooseSearchBotMove(currentBoard, moves, level) {
  if (!moves.length) return null;
  const candidateMoves = filterBotCandidateMoves(currentBoard, moves, level);
  const bookMove = chooseBotOpeningBookMove(currentBoard, candidateMoves, level);
  if (bookMove) return bookMove;
  const settings = getHeuristicSearchSettings(level);
  const depth = settings.depth;
  const search = createBotSearchContext(level);
  const ordered = orderMovesForSearch(currentBoard, candidateMoves, "b", level, true);
  if (!ordered.length) return candidateMoves[0] || moves[0] || null;
  let best = null;
  ordered.forEach((move) => {
    const next = applyMove(currentBoard, move);
    const score = minimaxBlack(next, depth, "w", -Infinity, Infinity, level, search);
    if (!best || score > best.score) best = { move, score };
  });
  return best ? best.move : ordered[0];
}

function createBotSearchContext(level, maxNodes = null) {
  const settings = getHeuristicSearchSettings(level);
  return {
    evalCache: new Map(),
    nodeCount: 0,
    settings,
    maxNodes: maxNodes || settings.maxNodes
  };
}

function getHeuristicSearchSettings(level) {
  if (level >= 7) return { depth: 4, maxNodes: 12000, rootLimit: 12, innerLimit: 8, tacticalLimit: 6, quiescenceDepth: 3 };
  if (level >= 6) return { depth: 3, maxNodes: 7000, rootLimit: 10, innerLimit: 7, tacticalLimit: 5, quiescenceDepth: 3 };
  if (level >= 5) return { depth: 2, maxNodes: 4200, rootLimit: 9, innerLimit: 6, tacticalLimit: 4, quiescenceDepth: 2 };
  if (level >= 4) return { depth: 2, maxNodes: 2600, rootLimit: 8, innerLimit: 5, tacticalLimit: 4, quiescenceDepth: 2 };
  return { depth: 1, maxNodes: 1400, rootLimit: 7, innerLimit: 5, tacticalLimit: 3, quiescenceDepth: 1 };
}

function minimaxBlack(currentBoard, depth, color, alpha, beta, level, search = createBotSearchContext(level)) {
  search.nodeCount += 1;
  if (search.nodeCount > search.maxNodes) return evaluateForBlackCached(currentBoard, level, search);
  const moves = getAllLegalMoves(currentBoard, color);
  if (!moves.length) {
    const inCheck = isKingInCheck(currentBoard, color);
    if (!inCheck) return 0;
    return color === "w" ? 100000 + depth : -100000 - depth;
  }
  if (depth <= 0) return quiescenceBlack(currentBoard, color, alpha, beta, level, search, search.settings.quiescenceDepth);

  const ordered = orderMovesForSearch(currentBoard, moves, color, level);
  if (color === "b") {
    let best = -Infinity;
    for (const move of ordered) {
      const score = minimaxBlack(applyMove(currentBoard, move), depth - 1, "w", alpha, beta, level, search);
      best = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of ordered) {
    const score = minimaxBlack(applyMove(currentBoard, move), depth - 1, "b", alpha, beta, level, search);
    best = Math.min(best, score);
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function quiescenceBlack(currentBoard, color, alpha, beta, level, search, depth) {
  const standPat = evaluateForBlackCached(currentBoard, level, search);
  if (depth <= 0 || search.nodeCount > search.maxNodes) return standPat;
  if (color === "b") {
    if (standPat >= beta) return beta;
    alpha = Math.max(alpha, standPat);
    const moves = orderMovesForSearch(currentBoard, getTacticalSearchMoves(currentBoard, "b"), "b", level).slice(0, search.settings.tacticalLimit);
    for (const move of moves) {
      search.nodeCount += 1;
      const score = quiescenceBlack(applyMove(currentBoard, move), "w", alpha, beta, level, search, depth - 1);
      alpha = Math.max(alpha, score);
      if (alpha >= beta) break;
    }
    return alpha;
  }

  if (standPat <= alpha) return alpha;
  beta = Math.min(beta, standPat);
  const moves = orderMovesForSearch(currentBoard, getTacticalSearchMoves(currentBoard, "w"), "w", level).slice(0, search.settings.tacticalLimit);
  for (const move of moves) {
    search.nodeCount += 1;
    const score = quiescenceBlack(applyMove(currentBoard, move), "b", alpha, beta, level, search, depth - 1);
    beta = Math.min(beta, score);
    if (beta <= alpha) break;
  }
  return beta;
}

function getTacticalSearchMoves(currentBoard, color) {
  const opponent = color === "w" ? "b" : "w";
  return getAllLegalMoves(currentBoard, color).filter((move) => {
    const capture = Boolean(currentBoard[move.toRow][move.toCol] || move.enPassant);
    const next = applyMove(currentBoard, move);
    return capture || isKingInCheck(next, opponent) || hasPromotionMove(currentBoard, move);
  });
}

function hasPromotionMove(currentBoard, move) {
  const piece = currentBoard[move.fromRow][move.fromCol];
  if (!piece || piece.toLowerCase() !== "p") return false;
  return move.toRow === (isWhite(piece) ? 0 : 7);
}

function evaluateForBlackCached(currentBoard, level, search) {
  const key = `${level}|${boardSignature(currentBoard)}`;
  if (search.evalCache.has(key)) return search.evalCache.get(key);
  const value = evaluateForBlack(currentBoard, level);
  if (search.evalCache.size < 6000) search.evalCache.set(key, value);
  return value;
}

function boardSignature(currentBoard) {
  return currentBoard.map((row) => row.map((piece) => piece || ".").join("")).join("/");
}

function orderMovesForSearch(currentBoard, moves, color, level, isRoot = false) {
  const settings = getHeuristicSearchSettings(level);
  const limit = isRoot ? settings.rootLimit : settings.innerLimit;
  return moves
    .map((move) => ({ move, score: tacticalMoveOrderScore(currentBoard, move, color, level) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.move);
}

function tacticalMoveOrderScore(currentBoard, move, color, level) {
  const next = applyMove(currentBoard, move);
  const opponent = color === "w" ? "b" : "w";
  const captured = currentBoard[move.toRow][move.toCol];
  let score = color === "b" ? -evaluateBoardAdvanced(next, level) : evaluateBoardAdvanced(next, level);
  if (captured) {
    const moved = currentBoard[move.fromRow][move.fromCol];
    const captureValue = pieceValues[captured.toLowerCase()] || 0;
    const movedValue = moved ? pieceValues[moved.toLowerCase()] || 0 : 0;
    score += captureValue * 4 - movedValue * 0.35;
  }
  if (isKingInCheck(next, opponent)) score += 450;
  const movedPiece = next[move.toRow][move.toCol];
  if (movedPiece && isSquareAttacked(next, move.toRow, move.toCol, opponent) && !isSquareAttacked(next, move.toRow, move.toCol, color)) {
    score -= (pieceValues[movedPiece.toLowerCase()] || 0) * (level >= 9 ? 4 : 2);
  }
  if (move.castle) score += 180;
  return score;
}

function scoreBlackMove(currentBoard, move) {
  const level = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const next = applyMove(currentBoard, move);
  const blackMates = getAllLegalMoves(next, "w").length === 0 && isKingInCheck(next, "w");
  if (blackMates) return 100000;
  const captured = currentBoard[move.toRow][move.toCol];
  const movedPiece = next[move.toRow][move.toCol];
  const lower = movedPiece.toLowerCase();
  const beforeScore = evaluateForBlack(currentBoard, level);
  const afterScore = evaluateForBlack(next, level);
  let score = (afterScore - beforeScore) * 3 + afterScore * 0.12;
  const looseBefore = looseMaterial(currentBoard, "b");
  const looseAfter = looseMaterial(next, "b");
  if (captured) score += pieceValues[captured.toLowerCase()] * (0.18 + level * 0.08);
  if (isKingInCheck(next, "w")) score += 35 + level * 10;
  if (move.castle) score += level >= 5 ? 60 : 18;
  if (isDevelopingBlackMove(currentBoard, next, move, movedPiece)) score += level >= 3 ? 18 + level * 3 : 5;
  if (level >= 5 && kingPressureScore(next, "b") < kingPressureScore(currentBoard, "b")) score += 22;
  if (level >= 7 && immediateThreatScore(next, "b").score > 100) score += 36;
  if (level >= 7) {
    score -= Math.max(0, looseAfter - looseBefore) * (level >= 9 ? 1.25 : 0.75);
    score -= immediateThreatScore(next, "w").score * (level >= 9 ? 0.55 : 0.28);
    if (hasImmediateMate(next, "w")) score -= 90000;
  }
  score -= botMoveSafetyPenalty(currentBoard, move, level);
  if (level >= 3) {
    const reply = getBestWhiteMove(next);
    if (reply) {
      const afterReply = applyMove(next, reply.move);
      const replyEval = evaluateBoardAdvanced(afterReply, level);
      score = level >= 8 ? score * 0.25 + (-replyEval) * 0.75 : score * 0.45 + (-replyEval) * 0.55;
    }
  }
  if (level >= 4) {
    const attacked = isSquareAttacked(next, move.toRow, move.toCol, "w");
    const defended = isSquareAttacked(next, move.toRow, move.toCol, "b");
    if (attacked && !defended) score -= pieceValues[lower] * (level >= 9 ? 1.35 : level >= 7 ? 0.9 : 0.45);
  }
  if (level >= 9 && isEndgame(currentBoard) && lower === "k") {
    score += Math.max(0, 4 - Math.abs(move.toRow - 3.5) - Math.abs(move.toCol - 3.5)) * 10;
  }
  const randomness = level >= 7 ? 0 : Math.max(2, 72 - level * 7);
  return score + Math.random() * randomness - randomness / 2;
}

function hasImmediateMate(currentBoard, color) {
  return getAllLegalMoves(currentBoard, color).some((move) => {
    const next = applyMove(currentBoard, move);
    const opponent = color === "w" ? "b" : "w";
    return getAllLegalMoves(next, opponent).length === 0 && isKingInCheck(next, opponent);
  });
}

function looseMaterial(currentBoard, color) {
  const enemy = color === "w" ? "b" : "w";
  let total = 0;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = currentBoard[row][col];
      if (!piece || piece.toLowerCase() === "k") continue;
      if (color === "w" && !isWhite(piece)) continue;
      if (color === "b" && !isBlack(piece)) continue;
      if (isSquareAttacked(currentBoard, row, col, enemy) && !isSquareAttacked(currentBoard, row, col, color)) {
        total += pieceValues[piece.toLowerCase()] || 0;
      }
    }
  }
  return total;
}

function evaluateForBlack(currentBoard, level = 10) {
  return -evaluateBoardAdvanced(currentBoard, level);
}

function evaluateBoardAdvanced(currentBoard, level = 10) {
  let score = evaluateBoard(currentBoard);
  score += positionalScore(currentBoard, "w") - positionalScore(currentBoard, "b");
  score += kingSafetyValue(currentBoard, "w") - kingSafetyValue(currentBoard, "b");
  score += (looseMaterial(currentBoard, "b") - looseMaterial(currentBoard, "w")) * (level >= 9 ? 0.9 : level >= 7 ? 0.72 : 0.45);
  score += centerControlScore(currentBoard, "w") - centerControlScore(currentBoard, "b");
  score += pawnStructureScore(currentBoard, "w") - pawnStructureScore(currentBoard, "b");
  score += developmentStructureScore(currentBoard, "w") - developmentStructureScore(currentBoard, "b");
  score += kingShieldScore(currentBoard, "w") - kingShieldScore(currentBoard, "b");
  return score;
}

function positionalScore(currentBoard, color) {
  let score = 0;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = currentBoard[row][col];
      if (!piece) continue;
      if (color === "w" && !isWhite(piece)) continue;
      if (color === "b" && !isBlack(piece)) continue;
      const lower = piece.toLowerCase();
      const forward = color === "w" ? 7 - row : row;
      const centerDistance = Math.abs(col - 3.5) + Math.abs(row - 3.5);
      if (lower === "n" || lower === "b") score += Math.max(0, 24 - centerDistance * 6) + forward * 3;
      if (lower === "r") score += forward >= 4 ? 8 : 0;
      if (lower === "q") score += forward >= 2 && forward <= 5 ? 8 : 0;
      if (lower === "p") score += forward * 2 + (col >= 2 && col <= 5 ? 6 : 0);
      if (lower === "k" && isEndgame(currentBoard)) score += Math.max(0, 28 - centerDistance * 5);
    }
  }
  return score;
}

function kingSafetyValue(currentBoard, color) {
  const king = findKing(currentBoard, color);
  if (!king) return -10000;
  const enemy = color === "w" ? "b" : "w";
  let score = 80 - kingPressureScore(currentBoard, color) * 28;
  if (!isEndgame(currentBoard)) {
    const homeRow = color === "w" ? 7 : 0;
    if (king.row === homeRow && (king.col === 6 || king.col === 2)) score += 70;
    if (king.row === homeRow && king.col === 4) score -= 35;
  }
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      const row = king.row + dr;
      const col = king.col + dc;
      if (inside(row, col) && isSquareAttacked(currentBoard, row, col, enemy)) score -= 12;
    }
  }
  return score;
}

function centerControlScore(currentBoard, color) {
  const centers = [[3, 3], [3, 4], [4, 3], [4, 4]];
  return centers.reduce((sum, [row, col]) => sum + (isSquareAttacked(currentBoard, row, col, color) ? 16 : 0), 0);
}

function pawnStructureScore(currentBoard, color) {
  const pawn = color === "w" ? "P" : "p";
  const enemy = color === "w" ? "b" : "w";
  const fileCounts = Array(8).fill(0);
  const pawnSquares = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (currentBoard[row][col] !== pawn) continue;
      fileCounts[col] += 1;
      pawnSquares.push({ row, col });
    }
  }
  let score = 0;
  fileCounts.forEach((count) => {
    if (count > 1) score -= (count - 1) * 18;
  });
  pawnSquares.forEach(({ row, col }) => {
    const isolated = !fileCounts[col - 1] && !fileCounts[col + 1];
    if (isolated) score -= 14;
    const forwardRows = color === "w" ? [...Array(row).keys()] : [...Array(7 - row).keys()].map((n) => row + 1 + n);
    const blockedByEnemy = forwardRows.some((r) => {
      for (let c = Math.max(0, col - 1); c <= Math.min(7, col + 1); c += 1) {
        const piece = currentBoard[r][c];
        if (piece && piece.toLowerCase() === "p" && (enemy === "w" ? isWhite(piece) : isBlack(piece))) return true;
      }
      return false;
    });
    if (!blockedByEnemy) score += 22;
  });
  return score;
}

function developmentStructureScore(currentBoard, color) {
  if (isEndgame(currentBoard)) return 0;
  const homeRow = color === "w" ? 7 : 0;
  const minorPieces = color === "w" ? ["N", "B"] : ["n", "b"];
  const queen = color === "w" ? "Q" : "q";
  const rooks = color === "w" ? "R" : "r";
  let score = 0;
  for (let col = 0; col < 8; col += 1) {
    const piece = currentBoard[homeRow][col];
    if (minorPieces.includes(piece)) score -= 18;
  }
  const queenHomeCol = 3;
  if (currentBoard[homeRow][queenHomeCol] !== queen) score -= currentGame.moves.length < 10 ? 18 : 4;
  if (currentBoard[homeRow][0] === rooks && currentBoard[homeRow][7] === rooks) score -= 10;
  const king = findKing(currentBoard, color);
  if (king && king.row === homeRow && king.col === 4 && currentGame.moves.length > 8) score -= 26;
  return score;
}

function kingShieldScore(currentBoard, color) {
  if (isEndgame(currentBoard)) return 0;
  const king = findKing(currentBoard, color);
  if (!king) return -200;
  const pawn = color === "w" ? "P" : "p";
  const dir = color === "w" ? -1 : 1;
  let score = 0;
  for (let dc = -1; dc <= 1; dc += 1) {
    const row = king.row + dir;
    const col = king.col + dc;
    if (!inside(row, col)) continue;
    score += currentBoard[row][col] === pawn ? 14 : -10;
  }
  return score;
}

function isDevelopingBlackMove(before, after, move, movedPiece) {
  const lower = movedPiece.toLowerCase();
  if (move.castle) return true;
  if ((lower === "n" || lower === "b") && move.fromRow === 0 && move.toRow > 0) return true;
  if (lower === "p" && (move.fromCol === 3 || move.fromCol === 4) && Math.abs(move.toRow - move.fromRow) >= 1) return true;
  return evaluateBoard(after) < evaluateBoard(before) - 35;
}

function getBestWhiteMove(currentBoard) {
  const moves = getAllLegalMoves(currentBoard, "w");
  if (!moves.length) return null;
  const level = Math.max(activeBotLevelForAnalysis(), 7);
  const candidates = moves
    .map((move) => ({ move, score: scoreMoveForColorFast(currentBoard, move, "w", level) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
  let best = null;
  candidates.forEach(({ move, score }) => {
    const next = applyMove(currentBoard, move);
    const evalScore = evaluateBoardAdvanced(next, level);
    const blackReply = chooseAnalysisBlackMove(next, getAllLegalMoves(next, "b"));
    const afterReplyEval = blackReply ? evaluateBoardAdvanced(applyMove(next, blackReply), level) : evalScore;
    const stability = Math.min(evalScore, afterReplyEval + 90);
    const finalScore = score * 0.35 + stability * 0.65;
    if (!best || finalScore > best.score) best = { move, eval: evalScore, score: finalScore };
  });
  return best;
}

function scoreMoveForColorFast(currentBoard, move, color, level) {
  const next = applyMove(currentBoard, move);
  const opponent = color === "w" ? "b" : "w";
  const movedPiece = next[move.toRow][move.toCol];
  const captured = move.enPassant ? currentBoard[move.fromRow][move.toCol] : currentBoard[move.toRow][move.toCol];
  const colorSign = color === "w" ? 1 : -1;
  let score = evaluateBoardAdvanced(next, level) * colorSign;
  if (captured) score += (pieceValues[captured.toLowerCase()] || 0) * 1.35;
  if (isKingInCheck(next, opponent)) score += 140;
  if (move.castle) score += 80;
  if (movedPiece && isSquareAttacked(next, move.toRow, move.toCol, opponent) && !isSquareAttacked(next, move.toRow, move.toCol, color)) {
    score -= (pieceValues[movedPiece.toLowerCase()] || 0) * 1.1;
  }
  score -= Math.max(0, looseMaterial(next, color) - looseMaterial(currentBoard, color)) * 0.75;
  score += Math.max(0, looseMaterial(next, opponent) - looseMaterial(currentBoard, opponent)) * 0.45;
  return score;
}

function scoreMoveForColor(currentBoard, move, color, level) {
  const next = applyMove(currentBoard, move);
  const opponent = color === "w" ? "b" : "w";
  const movedPiece = next[move.toRow][move.toCol];
  const captured = move.enPassant ? currentBoard[move.fromRow][move.toCol] : currentBoard[move.toRow][move.toCol];
  const colorSign = color === "w" ? 1 : -1;
  let score = evaluateBoardAdvanced(next, level) * colorSign;
  const mates = getAllLegalMoves(next, opponent).length === 0 && isKingInCheck(next, opponent);
  if (mates) score += 100000;
  if (captured) score += (pieceValues[captured.toLowerCase()] || 0) * 1.4;
  if (isKingInCheck(next, opponent)) score += 120;
  if (move.castle) score += 90;
  if (movedPiece && isSquareAttacked(next, move.toRow, move.toCol, opponent) && !isSquareAttacked(next, move.toRow, move.toCol, color)) {
    score -= (pieceValues[movedPiece.toLowerCase()] || 0) * 1.15;
  }
  score -= Math.max(0, looseMaterial(next, color) - looseMaterial(currentBoard, color)) * 0.85;
  score += Math.max(0, looseMaterial(next, opponent) - looseMaterial(currentBoard, opponent)) * 0.55;
  score += Math.max(0, immediateThreatScore(next, color).score - immediateThreatScore(currentBoard, color).score) * 0.35;
  score -= Math.max(0, immediateThreatScore(next, opponent).score - immediateThreatScore(currentBoard, opponent).score) * 0.45;
  return score;
}

function getAllLegalMoves(currentBoard, color) {
  const moves = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = currentBoard[row][col];
      if (!piece) continue;
      if (color === "w" && !isWhite(piece)) continue;
      if (color === "b" && !isBlack(piece)) continue;
      moves.push(...getLegalMoves(currentBoard, row, col));
    }
  }
  return moves;
}

function getLegalMoves(currentBoard, row, col) {
  const piece = currentBoard[row][col];
  if (!piece) return [];
  const color = isWhite(piece) ? "w" : "b";
  return getPseudoMoves(currentBoard, row, col).filter((move) => {
    const next = applyMove(currentBoard, move);
    return !isKingInCheck(next, color);
  });
}

function getPseudoMoves(currentBoard, row, col) {
  const piece = currentBoard[row][col];
  const lower = piece.toLowerCase();
  const color = isWhite(piece) ? "w" : "b";
  const moves = [];
  if (lower === "p") {
    const dir = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;
    addPawnMove(currentBoard, moves, row, col, row + dir, col);
    if (row === startRow && inside(row + dir, col) && !currentBoard[row + dir][col]) addPawnMove(currentBoard, moves, row, col, row + dir * 2, col);
    addPawnCapture(currentBoard, moves, row, col, row + dir, col - 1, color);
    addPawnCapture(currentBoard, moves, row, col, row + dir, col + 1, color);
    addEnPassantMoves(currentBoard, moves, row, col, color);
  }
  if (lower === "n") {
    [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]].forEach(([dr, dc]) => addStepMove(currentBoard, moves, row, col, row + dr, col + dc, color));
  }
  if (lower === "b" || lower === "r" || lower === "q") {
    const directions = [];
    if (lower === "b" || lower === "q") directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    if (lower === "r" || lower === "q") directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    directions.forEach(([dr, dc]) => addRayMoves(currentBoard, moves, row, col, dr, dc, color));
  }
  if (lower === "k") {
    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dr, dc]) => addStepMove(currentBoard, moves, row, col, row + dr, col + dc, color));
    addCastlingMoves(currentBoard, moves, row, col, color);
  }
  return moves;
}

function addPawnMove(currentBoard, moves, fromRow, fromCol, toRow, toCol) {
  if (!inside(toRow, toCol) || currentBoard[toRow][toCol]) return;
  moves.push({ fromRow, fromCol, toRow, toCol });
}

function addPawnCapture(currentBoard, moves, fromRow, fromCol, toRow, toCol, color) {
  if (!inside(toRow, toCol)) return;
  const target = currentBoard[toRow][toCol];
  if (target && ((color === "w" && isBlack(target)) || (color === "b" && isWhite(target)))) moves.push({ fromRow, fromCol, toRow, toCol });
}

function addEnPassantMoves(currentBoard, moves, fromRow, fromCol, color) {
  if (currentBoard !== board || !gameState.enPassant || gameState.enPassant.by === color) return;
  const dir = color === "w" ? -1 : 1;
  const target = gameState.enPassant;
  if (target.row === fromRow + dir && Math.abs(target.col - fromCol) === 1) {
    moves.push({ fromRow, fromCol, toRow: target.row, toCol: target.col, enPassant: true });
  }
}

function addCastlingMoves(currentBoard, moves, row, col, color) {
  if (currentBoard !== board) return;
  const homeRow = color === "w" ? 7 : 0;
  const kingPiece = color === "w" ? "K" : "k";
  const rookPiece = color === "w" ? "R" : "r";
  const enemy = color === "w" ? "b" : "w";
  if (row !== homeRow || col !== 4 || currentBoard[row][col] !== kingPiece || isKingInCheck(currentBoard, color)) return;

  const kingSideKey = color === "w" ? "K" : "k";
  if (
    gameState.castling[kingSideKey] &&
    currentBoard[homeRow][7] === rookPiece &&
    !currentBoard[homeRow][5] &&
    !currentBoard[homeRow][6] &&
    !isSquareAttacked(currentBoard, homeRow, 5, enemy) &&
    !isSquareAttacked(currentBoard, homeRow, 6, enemy)
  ) {
    moves.push({ fromRow: row, fromCol: col, toRow: homeRow, toCol: 6, castle: kingSideKey });
  }

  const queenSideKey = color === "w" ? "Q" : "q";
  if (
    gameState.castling[queenSideKey] &&
    currentBoard[homeRow][0] === rookPiece &&
    !currentBoard[homeRow][1] &&
    !currentBoard[homeRow][2] &&
    !currentBoard[homeRow][3] &&
    !isSquareAttacked(currentBoard, homeRow, 3, enemy) &&
    !isSquareAttacked(currentBoard, homeRow, 2, enemy)
  ) {
    moves.push({ fromRow: row, fromCol: col, toRow: homeRow, toCol: 2, castle: queenSideKey });
  }
}

function addStepMove(currentBoard, moves, fromRow, fromCol, toRow, toCol, color) {
  if (!inside(toRow, toCol)) return;
  const target = currentBoard[toRow][toCol];
  if (!target || (color === "w" ? isBlack(target) : isWhite(target))) moves.push({ fromRow, fromCol, toRow, toCol });
}

function addRayMoves(currentBoard, moves, fromRow, fromCol, dr, dc, color) {
  let row = fromRow + dr;
  let col = fromCol + dc;
  while (inside(row, col)) {
    const target = currentBoard[row][col];
    if (!target) moves.push({ fromRow, fromCol, toRow: row, toCol: col });
    else {
      if (color === "w" ? isBlack(target) : isWhite(target)) moves.push({ fromRow, fromCol, toRow: row, toCol: col });
      break;
    }
    row += dr;
    col += dc;
  }
}

function applyMove(currentBoard, move) {
  const next = cloneBoard(currentBoard);
  const piece = next[move.fromRow][move.fromCol];
  next[move.fromRow][move.fromCol] = null;
  if (move.enPassant) next[move.fromRow][move.toCol] = null;
  const promotionRow = isWhite(piece) ? 0 : 7;
  next[move.toRow][move.toCol] = piece.toLowerCase() === "p" && move.toRow === promotionRow ? (isWhite(piece) ? "Q" : "q") : piece;
  if (move.castle) {
    if (move.toCol === 6) {
      next[move.toRow][5] = next[move.toRow][7];
      next[move.toRow][7] = null;
    }
    if (move.toCol === 2) {
      next[move.toRow][3] = next[move.toRow][0];
      next[move.toRow][0] = null;
    }
  }
  return next;
}

function updateGameStateForMove(move, beforeBoard) {
  const piece = beforeBoard[move.fromRow][move.fromCol];
  const color = isWhite(piece) ? "w" : "b";
  const captured = move.enPassant ? beforeBoard[move.fromRow][move.toCol] : beforeBoard[move.toRow][move.toCol];
  gameState.enPassant = null;

  if (piece === "K") {
    gameState.castling.K = false;
    gameState.castling.Q = false;
  }
  if (piece === "k") {
    gameState.castling.k = false;
    gameState.castling.q = false;
  }
  revokeCastlingForRookSquare(piece, move.fromRow, move.fromCol);
  if (captured) revokeCastlingForRookSquare(captured, move.toRow, move.toCol);

  if (piece.toLowerCase() === "p" && Math.abs(move.toRow - move.fromRow) === 2) {
    gameState.enPassant = {
      row: (move.fromRow + move.toRow) / 2,
      col: move.fromCol,
      by: color
    };
  }
  gameState.halfmove = piece.toLowerCase() === "p" || captured ? 0 : gameState.halfmove + 1;
}

function revokeCastlingForRookSquare(piece, row, col) {
  if (piece === "R" && row === 7 && col === 0) gameState.castling.Q = false;
  if (piece === "R" && row === 7 && col === 7) gameState.castling.K = false;
  if (piece === "r" && row === 0 && col === 0) gameState.castling.q = false;
  if (piece === "r" && row === 0 && col === 7) gameState.castling.k = false;
}

function isKingInCheck(currentBoard, color) {
  let king = null;
  const kingPiece = color === "w" ? "K" : "k";
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (currentBoard[row][col] === kingPiece) king = { row, col };
    }
  }
  if (!king) return true;
  return isSquareAttacked(currentBoard, king.row, king.col, color === "w" ? "b" : "w");
}

function isSquareAttacked(currentBoard, row, col, byColor) {
  for (let fromRow = 0; fromRow < 8; fromRow += 1) {
    for (let fromCol = 0; fromCol < 8; fromCol += 1) {
      const piece = currentBoard[fromRow][fromCol];
      if (!piece) continue;
      if (byColor === "w" && !isWhite(piece)) continue;
      if (byColor === "b" && !isBlack(piece)) continue;
      if (attacksSquare(currentBoard, fromRow, fromCol, row, col)) return true;
    }
  }
  return false;
}

function attacksSquare(currentBoard, fromRow, fromCol, targetRow, targetCol) {
  const piece = currentBoard[fromRow][fromCol];
  const lower = piece.toLowerCase();
  const color = isWhite(piece) ? "w" : "b";
  const dr = targetRow - fromRow;
  const dc = targetCol - fromCol;
  if (lower === "p") {
    const dir = color === "w" ? -1 : 1;
    return dr === dir && Math.abs(dc) === 1;
  }
  if (lower === "n") return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
  if (lower === "k") return Math.max(Math.abs(dr), Math.abs(dc)) === 1;
  if (lower === "b") return Math.abs(dr) === Math.abs(dc) && clearPath(currentBoard, fromRow, fromCol, targetRow, targetCol);
  if (lower === "r") return (dr === 0 || dc === 0) && clearPath(currentBoard, fromRow, fromCol, targetRow, targetCol);
  if (lower === "q") return (Math.abs(dr) === Math.abs(dc) || dr === 0 || dc === 0) && clearPath(currentBoard, fromRow, fromCol, targetRow, targetCol);
  return false;
}

function clearPath(currentBoard, fromRow, fromCol, targetRow, targetCol) {
  const stepRow = Math.sign(targetRow - fromRow);
  const stepCol = Math.sign(targetCol - fromCol);
  let row = fromRow + stepRow;
  let col = fromCol + stepCol;
  while (row !== targetRow || col !== targetCol) {
    if (currentBoard[row][col]) return false;
    row += stepRow;
    col += stepCol;
  }
  return true;
}

function evaluateBoard(currentBoard) {
  let score = 0;
  const centerSquares = [[3, 3], [3, 4], [4, 3], [4, 4]];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = currentBoard[row][col];
      if (!piece) continue;
      const value = pieceValues[piece.toLowerCase()];
      score += isWhite(piece) ? value : -value;
      if (centerSquares.some(([r, c]) => r === row && c === col)) score += isWhite(piece) ? 14 : -14;
      if (piece.toLowerCase() === "n" || piece.toLowerCase() === "b") {
        if (isWhite(piece) && row < 7) score += 10;
        if (isBlack(piece) && row > 0) score -= 10;
      }
    }
  }
  return score;
}

function clearBotTimer() {
  if (botMoveTimer) {
    window.clearTimeout(botMoveTimer);
    botMoveTimer = null;
  }
}

function loadRandomScenario() {
  currentScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  document.getElementById("scenarioType").textContent = currentScenario.type;
  document.getElementById("scenarioTitle").textContent = currentScenario.title;
  document.getElementById("scenarioText").textContent = currentScenario.text;
  document.getElementById("scenarioFreeAnswer").value = "";
  document.getElementById("scenarioFeedback").textContent = "Scrivi una risposta libera: il coach valutera' lucidita', rischio, tempismo, etica, assertivita' e piano B.";
  renderScenarioBars();
}

function analyzeScenarioAnswer() {
  const answer = document.getElementById("scenarioFreeAnswer").value.trim();
  if (!answer) {
    document.getElementById("scenarioFeedback").textContent = "Scrivi prima una risposta: servono azione, frase concreta, rischio e piano B.";
    return;
  }
  const lower = normalize(answer);
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const idealHits = currentScenario.ideal.filter((word) => lower.includes(word)).length;
  const riskyWords = countMatches(lower, currentScenario.traps.concat(["ricatto", "bugia", "paura", "rovinare", "manipolo"]));
  const scores = {
    clarity: clamp(35 + Math.min(wordCount, 100) * 0.45 + countMatches(lower, ["fatto", "preciso", "specifico", "dico", "frase"]) * 8, 0, 100),
    context: clamp(30 + countMatches(lower, ["pubblico", "contesto", "chi", "tono", "reazione", "segnali", "prima osservo"]) * 10, 0, 100),
    ethics: clamp(58 + countMatches(lower, ["rispetto", "senza", "confine", "serio", "chiaro"]) * 7 - riskyWords * 16, 0, 100),
    empathy: clamp(35 + countMatches(lower, ["capisco", "privato", "chiedo", "ascolto", "chiarire"]) * 9, 0, 100),
    assertiveness: clamp(35 + countMatches(lower, ["fermo", "basta", "non accetto", "confine", "smettila"]) * 12 - countMatches(lower, ["forse", "scusa", "niente"]) * 4, 0, 100),
    leverage: clamp(30 + idealHits * 9 + countMatches(lower, ["opzione", "conseguenza", "ruolo", "tempo", "scelta"]) * 7 - riskyWords * 8, 0, 100),
    risk: clamp(30 + countMatches(lower, ["rischio", "se continua", "evito", "non regalo", "non urlo", "prova"]) * 9 - riskyWords * 12, 0, 100),
    timing: clamp(30 + countMatches(lower, ["prima", "poi", "dopo", "subito", "a parte", "entro"]) * 7, 0, 100),
    contingency: clamp(25 + countMatches(lower, ["piano b", "se continua", "alternativa", "altrimenti", "passo successivo"]) * 13, 0, 100)
  };
  const shortTerm = clamp((scores.assertiveness + scores.timing + scores.clarity) / 3, 0, 100);
  const longTerm = clamp((scores.ethics + scores.risk + scores.contingency + scores.empathy) / 4, 0, 100);
  Object.entries(scores).forEach(([key, value]) => {
    state.socialScores[key] = clamp(state.socialScores[key] + Math.round((value - 50) / 8), 0, 100);
  });
  if (scores.clarity < 55) addModulePattern("scenarios", "vague");
  if (scores.contingency < 55) addModulePattern("scenarios", "noPlanB");
  if (scores.risk < 55 || riskyWords > 0) addModulePattern("scenarios", "highRisk");
  updateModuleMetrics("scenarios", {
    lucidita: Math.round((scores.clarity - 50) / 10),
    efficacia: Math.round((shortTerm - 50) / 10),
    rischio: Math.round((scores.risk - 50) / 10),
    controllo: Math.round((scores.assertiveness + scores.ethics - 100) / 18),
    adattamento: Math.round((scores.context - 50) / 10),
    flessibilita: Math.round((scores.contingency - 50) / 10),
    ragionamento: Math.round((scores.leverage - 50) / 10),
    sostenibilita: Math.round((longTerm - 50) / 10),
    tempo: Math.round((scores.timing - 50) / 10)
  });
  saveState();
  const total = Math.round(averageObject(scores));
  const advice = [];
  if (scores.context < 55) advice.push("Aggiungi osservazione: chi guida la pressione, chi segue, che tono c'e'.");
  if (scores.assertiveness < 55) advice.push("Serve una frase piu' ferma e breve.");
  if (scores.contingency < 55) advice.push("Manca piano B: scrivi cosa fai se continua.");
  if (scores.risk < 55) advice.push("Valuta il rischio di escalation e come non regalare una scenata.");
  if (scores.ethics < 60) advice.push("Togli leve sporche: niente umiliazione, bugie o ricatti.");
  if (!advice.length) advice.push("Buona risposta: ora rendila piu' corta e naturale.");
  document.getElementById("scenarioFeedback").innerHTML = `<strong>Punteggio risposta: ${total}/100</strong><br>${Object.entries(scores).map(([key, value]) => `${metricLabel(key)} ${Math.round(value)}`).join(", ")}.<br>Breve periodo: ${Math.round(shortTerm)}. Lungo periodo: ${Math.round(longTerm)}.<ul class="plan-steps">${advice.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  renderScenarioBars();
  renderDashboard();
}

function showScenarioModel() {
  if (!currentScenario) return;
  document.getElementById("scenarioFeedback").textContent = `Modello forte: ${currentScenario.model}`;
}

function renderScenarioBars() {
  renderMetrics(document.getElementById("scenarioBars"), state.socialScores);
}

function loadRandomTopic() {
  const unseen = topics.filter((topic) => !state.studied.includes(topic.id));
  const pool = unseen.length ? unseen : topics;
  currentTopic = pool[Math.floor(Math.random() * pool.length)];
  state.currentTopicId = currentTopic.id;
  saveState();
  renderTopic(currentTopic);
}

function renderTopic(topic) {
  const extra = cultureEnhancements[topic.id] || cultureEnhancements.default;
  document.getElementById("topicArea").textContent = topic.area;
  document.getElementById("topicDifficulty").textContent = `Difficolta' ${topic.difficulty}/10`;
  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("topicBrief").textContent = `${topic.brief}\n\nEsempio pratico\n${extra.example}\n\nPerche' e' importante\n${extra.importance}\n\nCollegamenti con altri argomenti\n${extra.links}`;
  document.getElementById("topicQuestion").textContent = topic.question;
  document.getElementById("topicAnswer").textContent = extra.answer;
}

function markTopicStudied() {
  if (!currentTopic) loadRandomTopic();
  if (!state.studied.includes(currentTopic.id)) state.studied.push(currentTopic.id);
  const due = Date.now() + 1000 * 60 * 60 * 24;
  state.cultureReviews = state.cultureReviews.filter((item) => item.id !== currentTopic.id);
  state.cultureReviews.push({ id: currentTopic.id, title: currentTopic.title, due });
  updateModuleMetrics("culture", { lucidita: 2, efficacia: 2, ragionamento: 3, sostenibilita: 2, tempo: 1, rischio: 1 });
  addModulePattern("culture", "ripasso programmato");
  saveState();
  renderStudiedList();
  renderReviewList();
  renderDashboard();
}

function renderStudiedList() {
  const list = document.getElementById("studiedList");
  list.innerHTML = "";
  if (!state.studied.length) {
    const empty = document.createElement("li");
    empty.textContent = "Ancora nessun argomento segnato.";
    list.appendChild(empty);
    return;
  }
  state.studied.slice(-8).reverse().forEach((id) => {
    const topic = topics.find((item) => item.id === id);
    const item = document.createElement("li");
    item.textContent = topic ? `${topic.area}: ${topic.title}` : id;
    list.appendChild(item);
  });
}

function renderReviewList() {
  const list = document.getElementById("reviewList");
  if (!list) return;
  list.innerHTML = "";
  if (!state.cultureReviews.length) {
    const empty = document.createElement("li");
    empty.textContent = "Nessun ripasso programmato.";
    list.appendChild(empty);
    return;
  }
  state.cultureReviews.slice(-8).reverse().forEach((review) => {
    const item = document.createElement("li");
    const date = new Date(review.due);
    item.textContent = `${review.title} - ripasso ${date.toLocaleDateString("it-IT")}`;
    list.appendChild(item);
  });
}

function loadRandomGoal() {
  const goal = planningGoals[Math.floor(Math.random() * planningGoals.length)];
  document.getElementById("goalInput").value = goal;
  document.getElementById("planInput").value = "";
  document.getElementById("planScore").textContent = "Scrivi il tuo piano e poi premi Valuta piano.";
  document.getElementById("planSteps").innerHTML = "";
}

function clearGoal() {
  document.getElementById("goalInput").value = "";
  document.getElementById("goalInput").focus();
  document.getElementById("planScore").textContent = "Scrivi un tuo obiettivo, poi il piano.";
  document.getElementById("planSteps").innerHTML = "";
}

function analyzePlan(event) {
  if (event) event.preventDefault();
  const goal = document.getElementById("goalInput").value.trim();
  const plan = document.getElementById("planInput").value.trim();
  if (!goal || !plan) {
    document.getElementById("planScore").textContent = "Servono obiettivo e piano. Puoi usare un obiettivo random oppure scriverne uno tuo.";
    return;
  }
  const lower = normalize(plan);
  const wordCount = plan.split(/\s+/).filter(Boolean).length;
  const structure = clamp(countMatches(lower, ["prima", "poi", "dopo", "fase", "passo", "1", "2", "3"]) * 9, 0, 22);
  const timing = clamp(countMatches(lower, ["oggi", "domani", "entro", "giorni", "settimana", "minuti", "volte"]) * 8, 0, 18);
  const risk = clamp(countMatches(lower, ["se", "rischio", "alternativa", "non funziona", "ostacolo", "conseguenza"]) * 8, 0, 20);
  const resources = clamp(countMatches(lower, ["tempo", "persona", "strumento", "prova", "testimone", "dati", "energia"]) * 6, 0, 15);
  const measure = clamp(countMatches(lower, ["misuro", "verifico", "risultato", "numero", "feedback", "controllo"]) * 8, 0, 15);
  const clarity = clamp(10 + Math.min(wordCount, 120) * 0.18, 0, 15);
  const penalty = countMatches(lower, ["picch", "umilia", "minaccia", "vendetta", "ricatto", "bugia", "rovin"]) * 12;
  const total = clamp(Math.round(structure + timing + risk + resources + measure + clarity - penalty), 5, 100);
  state.planScores.push(total);
  state.planScores = state.planScores.slice(-10);
  if (risk < 8) addModulePattern("planning", "highRisk");
  if (measure < 8) addModulePattern("planning", "weakEvidence");
  if (structure < 10) addModulePattern("planning", "vague");
  updateModuleMetrics("planning", {
    lucidita: Math.round((clarity - 8) / 2),
    efficacia: Math.round((total - 55) / 10),
    rischio: Math.round((risk - 10) / 2),
    controllo: penalty ? -4 : 1,
    adattamento: Math.round((resources - 7) / 2),
    flessibilita: Math.round((risk - 10) / 2),
    ragionamento: Math.round((structure + measure - 20) / 4),
    sostenibilita: Math.round((measure + timing - 18) / 4),
    tempo: Math.round((timing - 8) / 2)
  });
  saveState();
  const improvements = buildPlanImprovements(goal, lower, total);
  document.getElementById("planScore").textContent = `Valutazione piano: ${total}/100 - ${planRank(total)}.`;
  const output = document.getElementById("planSteps");
  output.innerHTML = "";
  improvements.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    output.appendChild(item);
  });
  renderDashboard();
}

function buildPlanImprovements(goal, lower, score) {
  const bullyingGoal = normalize(goal).includes("prende in giro");
  if (bullyingGoal) {
    return [
      "Definisci il comportamento preciso: frasi, luogo, persone presenti, frequenza.",
      "Prepara una frase corta: 'Non accetto questa battuta. Smettila.'",
      "Non discutere per 10 minuti: frase, pausa, sguardo stabile, poi cambi focus.",
      "Se continua, passa a conseguenza proporzionata: testimoni, prove, adulto/docente/responsabile.",
      score < 70 ? "Aggiungi soglia: dopo quanti episodi fai il passo successivo?" : "Buona base: allenala ad alta voce per renderla naturale."
    ];
  }
  if (lower.includes("minaccia") || lower.includes("vendetta")) {
    return ["Togli pressione aggressiva: un piano forte usa confini, prove e conseguenze proporzionate.", "Riscrivi il piano in tre fasi: preparazione, azione, revisione.", "Aggiungi una metrica per capire se funziona."];
  }
  return [
    "Definisci successo misurabile: cosa deve cambiare e come lo vedi.",
    "Dividi in tre fasi: preparazione, azione, revisione.",
    "Aggiungi rischi probabili e risposta pronta.",
    "Stabilisci una scadenza e una metrica.",
    "Rivedi dopo 72 ore: tieni cio' che produce effetto, elimina il resto."
  ];
}

function planRank(score) {
  if (score >= 85) return "piano forte";
  if (score >= 70) return "buona base";
  if (score >= 55) return "da rendere piu' concreto";
  return "troppo fragile o rischioso";
}

function loadDefenseDrill() {
  const available = defenseDrills.filter((drill) => drill.level <= state.defenseLevel);
  const drill = available[Math.floor(Math.random() * available.length)];
  document.getElementById("defenseTitle").textContent = drill.title;
  document.getElementById("defenseText").textContent = drill.text;
  const steps = document.getElementById("defenseSteps");
  steps.innerHTML = "";
  drill.steps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    steps.appendChild(item);
  });
  updateModuleMetrics("defense", { lucidita: 1, controllo: 1, adattamento: 1, sostenibilita: 1 });
  resetTimer();
  renderDefenseStatus();
}

function renderDefenseStatus() {
  document.getElementById("defenseLevelText").textContent = `Livello ${state.defenseLevel}`;
  document.getElementById("reflexResult").textContent = state.reflexBest ? `Miglior media: ${state.reflexBest} ms.` : "Miglior media: nessuna.";
}

function startDefenseTimer() {
  resetTimer();
  timerId = window.setInterval(() => {
    timerLeft -= 1;
    renderTimer();
    if (timerLeft <= 0) {
      window.clearInterval(timerId);
      timerId = null;
      document.getElementById("timerDisplay").textContent = "Fatto";
    }
  }, 1000);
}

function resetTimer() {
  if (timerId) window.clearInterval(timerId);
  timerId = null;
  timerLeft = 30;
  renderTimer();
}

function renderTimer() {
  document.getElementById("timerDisplay").textContent = `00:${String(timerLeft).padStart(2, "0")}`;
}

function startReflexGame() {
  hideReflexTargets();
  reflexSession = { active: true, round: 0, times: [], mistakes: 0 };
  document.getElementById("reflexInstruction").textContent = "Preparati al primo bersaglio...";
  scheduleReflexTarget();
}

function scheduleReflexTarget() {
  hideReflexTargets();
  if (!reflexSession.active) return;
  const delay = Math.max(350, 1400 - state.defenseLevel * 90) + Math.random() * 700;
  reflexTimer = window.setTimeout(() => {
    const arena = document.getElementById("reflexArena");
    placeArenaButton(document.getElementById("reflexTarget"), arena);
    document.getElementById("reflexTarget").classList.add("visible");
    if (state.defenseLevel >= 3) {
      placeArenaButton(document.getElementById("reflexDecoy"), arena);
      document.getElementById("reflexDecoy").classList.add("visible");
    }
    reflexShownAt = performance.now();
    document.getElementById("reflexInstruction").textContent = `Bersaglio ${reflexSession.round + 1}/5: rosso!`;
  }, delay);
}

function hitReflexTarget() {
  if (!document.getElementById("reflexTarget").classList.contains("visible")) return;
  const reaction = Math.round(performance.now() - reflexShownAt);
  reflexSession.times.push(reaction);
  reflexSession.round += 1;
  hideReflexTargets();
  if (reflexSession.round >= 5) {
    finishReflexGame();
  } else {
    document.getElementById("reflexInstruction").textContent = `Tempo: ${reaction} ms. Preparati...`;
    scheduleReflexTarget();
  }
}

function hitReflexDecoy() {
  if (!document.getElementById("reflexDecoy").classList.contains("visible")) return;
  reflexSession.mistakes += 1;
  document.getElementById("reflexInstruction").textContent = "Distrattore colpito: resta sul rosso.";
  hideReflexTargets();
  scheduleReflexTarget();
}

function finishReflexGame() {
  reflexSession.active = false;
  const average = Math.round(averageArray(reflexSession.times) + reflexSession.mistakes * 80);
  if (!state.reflexBest || average < state.reflexBest) state.reflexBest = average;
  if (average < 430 && state.defenseLevel < 8) state.defenseLevel += 1;
  if (average > 650) addModulePattern("defense", "slowReflex");
  if (reflexSession.mistakes) addModulePattern("defense", "decoy");
  updateModuleMetrics("defense", {
    lucidita: average < 520 ? 2 : -1,
    efficacia: average < 520 ? 3 : -2,
    rischio: reflexSession.mistakes ? -2 : 1,
    controllo: reflexSession.mistakes ? -3 : 2,
    adattamento: state.defenseLevel >= 3 && !reflexSession.mistakes ? 2 : 0,
    tempo: average < 520 ? 3 : -2
  });
  saveState();
  document.getElementById("reflexInstruction").textContent = `Media: ${average} ms. Errori distrattore: ${reflexSession.mistakes}.`;
  renderDefenseStatus();
  renderDashboard();
}

function hideReflexTargets() {
  if (reflexTimer) window.clearTimeout(reflexTimer);
  document.getElementById("reflexTarget").classList.remove("visible");
  document.getElementById("reflexDecoy").classList.remove("visible");
}

function placeArenaButton(button, arena) {
  const maxX = Math.max(0, arena.clientWidth - 58);
  const maxY = Math.max(0, arena.clientHeight - 58);
  button.style.left = `${Math.random() * maxX}px`;
  button.style.top = `${Math.random() * maxY}px`;
}

function loadRandomRiddle() {
  currentRiddle = logicRiddles[Math.floor(Math.random() * logicRiddles.length)];
  document.getElementById("riddleType").textContent = currentRiddle.type;
  document.getElementById("riddleTitle").textContent = currentRiddle.title;
  document.getElementById("riddleText").textContent = currentRiddle.text;
  document.getElementById("riddleFeedback").textContent = "Scegli una risposta e vedrai il ragionamento.";
  const options = document.getElementById("riddleOptions");
  options.innerHTML = "";
  currentRiddle.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-button";
    button.textContent = option;
    button.addEventListener("click", () => chooseRiddleOption(button, index));
    options.appendChild(button);
  });
  renderLogicStats();
}

function chooseRiddleOption(button, index) {
  document.querySelectorAll("#riddleOptions .option-button").forEach((item) => {
    item.disabled = true;
  });
  state.logicAttempts += 1;
  const correct = index === currentRiddle.answer;
  if (correct) state.logicSolved += 1;
  if (!correct) addModulePattern("logic", "ragionamento incompleto");
  updateModuleMetrics("logic", {
    lucidita: correct ? 2 : -2,
    efficacia: correct ? 3 : -2,
    controllo: correct ? 1 : -1,
    adattamento: correct ? 1 : 0,
    ragionamento: correct ? 4 : -3,
    sostenibilita: 1,
    tempo: correct ? 1 : 0
  });
  saveState();
  button.classList.add(correct ? "correct" : "risky");
  document.getElementById("riddleFeedback").textContent = `${correct ? "Corretto." : "Non ancora."} ${currentRiddle.explanation}`;
  renderLogicStats();
  renderDashboard();
}

function renderLogicStats() {
  const accuracy = state.logicAttempts ? Math.round((state.logicSolved / state.logicAttempts) * 100) : 0;
  const stats = { solved: state.logicSolved, attempts: state.logicAttempts, accuracy };
  const labels = { solved: "Risolti", attempts: "Tentativi", accuracy: "Precisione" };
  renderMetrics(document.getElementById("logicStats"), stats, labels, true);
}

function loadMemoryExercise() {
  if (memoryTimer) window.clearTimeout(memoryTimer);
  const level = state.memory.level;
  const modes = ["numbers", "words", "grid", "position"];
  const mode = modes[(level + state.memory.attempts) % modes.length];
  const length = clamp(3 + level, 4, 10);
  const items = [];
  if (mode === "grid" || mode === "position") {
    const count = mode === "position" ? 1 : clamp(2 + Math.floor(level / 2), 3, 8);
    while (items.length < count) {
      const cell = String(Math.floor(Math.random() * 16) + 1);
      if (!items.includes(cell)) items.push(cell);
    }
  } else {
    for (let index = 0; index < length; index += 1) {
      if (mode === "words") items.push(memoryWords[Math.floor(Math.random() * memoryWords.length)]);
      else items.push(String(Math.floor(Math.random() * 9) + 1));
    }
  }
  const typeLabel = mode === "words" ? "Parole" : mode === "grid" ? "Quadrati illuminati" : mode === "position" ? "Riconoscimento posizione" : "Sequenza numerica";
  const exposure = clamp(5600 - level * 300, 1800, 5200);
  currentMemory = { mode, type: typeLabel, items, hidden: false, exposure };
  document.getElementById("memoryType").textContent = currentMemory.type;
  document.getElementById("memoryTitle").textContent = mode === "position" ? `Livello ${level}: ricorda la posizione` : `Livello ${level}: memorizza in ordine`;
  document.getElementById("memoryStimulus").textContent = mode === "grid" || mode === "position" ? "Memorizza le celle illuminate. Scrivi i numeri delle celle." : items.join("  ");
  renderMemoryGrid(false);
  document.getElementById("memoryAnswer").value = "";
  document.getElementById("memoryFeedback").textContent = `Memorizza: lo stimolo sparisce automaticamente tra ${(exposure / 1000).toFixed(1)}s. Puoi anche premere Nascondi.`;
  memoryTimer = window.setTimeout(hideMemoryStimulus, exposure);
  renderMemoryStats();
}

function hideMemoryStimulus() {
  if (!currentMemory) return;
  if (memoryTimer) {
    window.clearTimeout(memoryTimer);
    memoryTimer = null;
  }
  if (currentMemory.hidden) return;
  currentMemory.hidden = true;
  document.getElementById("memoryStimulus").textContent = "Nascosto. Richiama dalla memoria.";
  renderMemoryGrid(true);
  document.getElementById("memoryAnswer").focus();
}

function checkMemoryAnswer() {
  if (!currentMemory) return;
  const answer = normalize(document.getElementById("memoryAnswer").value).split(/[\s,;.-]+/).filter(Boolean);
  const target = currentMemory.items.map((item) => normalize(item));
  let correct = 0;
  target.forEach((item, index) => {
    if (answer[index] === item) correct += 1;
  });
  const missing = target.filter((item) => !answer.includes(item)).length;
  const extra = answer.filter((item) => !target.includes(item)).length;
  const sameSet = missing === 0 && extra === 0 && answer.length === target.length;
  const inversion = sameSet && correct < target.length;
  if (missing > 0) addModulePattern("memory", "missing");
  if (inversion) addModulePattern("memory", "inversion");
  if (!inversion && correct < target.length && missing === 0) addModulePattern("memory", "order");
  if (extra > 0) addModulePattern("memory", "distraction");
  const score = Math.round((correct / target.length) * 100);
  state.memory.attempts += 1;
  if (score >= 80) state.memory.correct += 1;
  state.memory.best = Math.max(state.memory.best, score);
  if (score >= 90) state.memory.level = clamp(state.memory.level + 1, 1, 12);
  updateModuleMetrics("memory", {
    lucidita: score >= 80 ? 2 : -2,
    efficacia: Math.round((score - 60) / 12),
    controllo: extra ? -2 : 1,
    adattamento: currentMemory.mode === "grid" || currentMemory.mode === "position" ? 2 : 1,
    flessibilita: currentMemory.mode === "grid" ? 2 : 1,
    ragionamento: inversion ? -2 : 1,
    sostenibilita: score >= 80 ? 1 : 0,
    tempo: score >= 80 ? 1 : -1
  });
  saveState();
  document.getElementById("memoryFeedback").textContent = `Risultato: ${score}/100. Corretti in posizione: ${correct}/${target.length}. Dimenticati: ${missing}. Extra/distrazioni: ${extra}. ${inversion ? "Errore: elementi giusti ma ordine invertito." : ""} Risposta giusta: ${currentMemory.items.join(" ")}.`;
  renderMemoryStats();
  renderDashboard();
}

function renderMemoryGrid(hidden) {
  const grid = document.getElementById("memoryGrid");
  grid.innerHTML = "";
  if (!currentMemory || (currentMemory.mode !== "grid" && currentMemory.mode !== "position")) return;
  for (let index = 1; index <= 16; index += 1) {
    const cell = document.createElement("div");
    const key = String(index);
    const lit = currentMemory.items.includes(key);
    cell.className = `memory-cell ${!hidden && lit ? currentMemory.mode === "position" ? "target" : "lit" : ""}`;
    cell.textContent = hidden ? index : index;
    grid.appendChild(cell);
  }
}

function renderMemoryStats() {
  const accuracy = state.memory.attempts ? Math.round((state.memory.correct / state.memory.attempts) * 100) : 0;
  renderMetrics(document.getElementById("memoryStats"), { level: state.memory.level, attempts: state.memory.attempts, best: state.memory.best, accuracy }, { level: "Livello", attempts: "Tentativi", best: "Best", accuracy: "Precisione" }, true);
}

function loadInfluenceTactic() {
  currentInfluence = influenceTactics[Math.floor(Math.random() * influenceTactics.length)];
  document.getElementById("influenceCategory").textContent = currentInfluence.category;
  document.getElementById("influenceTitle").textContent = currentInfluence.title;
  document.getElementById("influenceLesson").textContent = currentInfluence.lesson;
  document.getElementById("influenceScenario").textContent = currentInfluence.scenario;
  document.getElementById("influenceAnswer").value = "";
  document.getElementById("influenceFeedback").textContent = "Scrivi una strategia pulita: il sistema distingue influenza, pressione e confusione.";
  renderInfluenceMetrics();
}

function analyzeInfluenceAnswer() {
  const answer = document.getElementById("influenceAnswer").value.trim();
  if (!answer) {
    document.getElementById("influenceFeedback").textContent = "Scrivi prima una strategia: obiettivo, leva, confini, rischio e frase concreta.";
    return;
  }
  const lower = normalize(answer);
  const ideal = currentInfluence.ideal.filter((word) => lower.includes(word)).length;
  const dark = countMatches(lower, ["mento", "bugia", "ricatto", "paura", "umilio", "minaccio", "nascondo"]);
  const scores = {
    objective: clamp(30 + countMatches(lower, ["obiettivo", "voglio", "risultato", "ottenere"]) * 12, 0, 100),
    transparency: clamp(45 + countMatches(lower, ["chiaro", "dico", "spiego", "senza", "onesto"]) * 10 - dark * 18, 0, 100),
    leverage: clamp(35 + ideal * 10 + countMatches(lower, ["beneficio", "costo", "scelta", "criterio"]) * 8, 0, 100),
    boundaries: clamp(35 + countMatches(lower, ["confine", "no", "accetta", "libero", "rispetto"]) * 10 - dark * 10, 0, 100),
    risk: clamp(35 + countMatches(lower, ["rischio", "se", "reazione", "piano b"]) * 10 - dark * 12, 0, 100)
  };
  const total = Math.round(averageObject(scores));
  state.influence.attempts += 1;
  state.influence.average = Math.round((state.influence.average * (state.influence.attempts - 1) + total) / state.influence.attempts);
  if (dark) addModulePattern("influence", "darkInfluence");
  if (scores.transparency < 60) addModulePattern("influence", "weakEvidence");
  updateModuleMetrics("influence", {
    lucidita: Math.round((scores.objective - 50) / 10),
    efficacia: Math.round((scores.leverage - 50) / 10),
    rischio: Math.round((scores.risk - 50) / 10),
    controllo: dark ? -5 : 2,
    adattamento: Math.round((scores.leverage + scores.risk - 100) / 18),
    flessibilita: Math.round((scores.risk - 50) / 12),
    ragionamento: Math.round((scores.objective + scores.transparency - 100) / 18),
    sostenibilita: Math.round((scores.boundaries + scores.transparency - 100) / 18),
    tempo: 1
  });
  saveState();
  const advice = [];
  if (scores.transparency < 60) advice.push("Rendi piu' trasparente la richiesta: niente costi nascosti.");
  if (scores.boundaries < 60) advice.push("Aggiungi confine: l'altra persona deve poter dire no senza punizione.");
  if (scores.risk < 60) advice.push("Prevedi la reazione e prepara un piano B.");
  if (!advice.length) advice.push("Buona influenza: criterio chiaro, leva proporzionata, rischio controllato.");
  document.getElementById("influenceFeedback").innerHTML = `<strong>Punteggio tattica: ${total}/100</strong><ul class="plan-steps">${advice.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  renderInfluenceMetrics(scores);
  renderDashboard();
}

function renderInfluenceMetrics(scores = null) {
  const data = scores || { attempts: state.influence.attempts, average: state.influence.average };
  const labels = { attempts: "Tentativi", average: "Media", objective: "Obiettivo", transparency: "Trasparenza", leverage: "Leva", boundaries: "Confini", risk: "Rischio" };
  renderMetrics(document.getElementById("influenceMetrics"), data, labels, false);
}

function renderAestheticChecklist() {
  const wrapper = document.getElementById("aestheticChecklist");
  wrapper.innerHTML = "";
  aestheticItems.forEach((item) => {
    const label = document.createElement("label");
    label.className = "check-item";
    label.innerHTML = `<input type="checkbox" value="${item.id}"><span><strong>${item.title}</strong><br>${item.text}</span>`;
    wrapper.appendChild(label);
  });
}

function saveAestheticChecklist() {
  const checked = [...document.querySelectorAll("#aestheticChecklist input:checked")].map((item) => item.value);
  state.aesthetic.lastCompleted = checked;
  state.aesthetic.score = Math.round((checked.length / aestheticItems.length) * 100);
  state.aesthetic.streak += checked.length >= 5 ? 1 : 0;
  if (checked.length < 5) addModulePattern("aesthetic", "lowConsistency");
  updateModuleMetrics("aesthetic", {
    lucidita: checked.length >= 5 ? 1 : 0,
    efficacia: Math.round((state.aesthetic.score - 50) / 10),
    rischio: checked.includes("sleep") ? 1 : -1,
    controllo: checked.length >= 5 ? 2 : -1,
    adattamento: checked.includes("clothes") ? 2 : 0,
    ragionamento: checked.includes("skin") ? 1 : 0,
    sostenibilita: checked.length >= 5 ? 3 : -2,
    tempo: checked.length >= 5 ? 1 : -1
  });
  saveState();
  renderAesthetic();
  renderDashboard();
}

function renderAesthetic() {
  document.querySelectorAll("#aestheticChecklist input").forEach((input) => {
    input.checked = state.aesthetic.lastCompleted.includes(input.value);
  });
  document.getElementById("aestheticScore").textContent = `Punteggio estetica: ${state.aesthetic.score || 0}/100. Streak cura: ${state.aesthetic.streak || 0}.`;
}

function renderRandomStyleTip() {
  document.getElementById("styleTip").textContent = styleTips[Math.floor(Math.random() * styleTips.length)];
}

function renderMetrics(container, data, labels = {}, compact = false) {
  container.innerHTML = "";
  Object.entries(data).forEach(([key, rawValue]) => {
    const value = typeof rawValue === "number" ? Math.round(rawValue) : rawValue;
    const row = document.createElement("div");
    row.className = "metric";
    row.innerHTML = `<div class="metric-top"><span>${labels[key] || metricLabel(key)}</span><span>${typeof value === "number" && !compact ? `${value}%` : value}</span></div>${typeof value === "number" && !compact ? `<div class="bar-track"><div class="bar-fill" style="width:${clamp(value, 0, 100)}%"></div></div>` : ""}`;
    container.appendChild(row);
  });
}

function metricLabel(key) {
  const labels = {
    clarity: "Chiarezza",
    context: "Lettura contesto",
    ethics: "Etica",
    empathy: "Empatia",
    assertiveness: "Assertivita'",
    leverage: "Leva",
    risk: "Gestione rischio",
    timing: "Tempismo",
    contingency: "Piano B",
    observation: "Osservazione",
    objective: "Obiettivo",
    transparency: "Trasparenza",
    boundaries: "Confini"
  };
  return labels[key] || key;
}

function cloneBoard(currentBoard) {
  return currentBoard.map((row) => [...row]);
}

function cloneGameState(source) {
  const safe = source || createInitialGameState();
  return {
    castling: { ...safe.castling },
    enPassant: safe.enPassant ? { ...safe.enPassant } : null,
    halfmove: safe.halfmove || 0
  };
}

function inside(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function isWhite(piece) {
  return piece === piece.toUpperCase();
}

function isBlack(piece) {
  return piece === piece.toLowerCase();
}

function coord(row, col) {
  return `${String.fromCharCode(97 + col)}${8 - row}`;
}

function formatMoveText(move) {
  if (!move) return "-";
  if (move.castle && move.toCol === 6) return "O-O";
  if (move.castle && move.toCol === 2) return "O-O-O";
  const suffix = move.enPassant ? " e.p." : "";
  return `${coord(move.fromRow, move.fromCol)}-${coord(move.toRow, move.toCol)}${suffix}`;
}

function squareLabel(currentBoard, row, col) {
  const piece = currentBoard[row][col];
  return `${coord(row, col)}${piece ? `, ${pieceNames[piece]}` : ", vuota"}`;
}

function formatEval(score) {
  const pawns = score / 100;
  return `${pawns >= 0 ? "+" : ""}${pawns.toFixed(1)}`;
}

function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function countMatches(text, words) {
  return words.reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function averageObject(object) {
  const values = Object.values(object).filter((value) => typeof value === "number");
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function averageArray(items) {
  return items.length ? items.reduce((sum, value) => sum + value, 0) / items.length : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
