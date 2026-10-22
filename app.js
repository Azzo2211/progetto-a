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
    levelStats: {},
    levelScheme: 3,
    mode: "rated",
    ui: { theme: "accademia", pieceSet: "cote", effects: true, sound: true, coords: true, evalBarInGame: false, orientation: "white" },
    rating: {},
    lessons: {},
    mistakeBank: []
  },
  planScores: [],
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
  mentalist: { lucidita: 35, efficacia: 35, rischio: 35, controllo: 35, adattamento: 35, ragionamento: 35, sostenibilita: 35, tempo: 35 },
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
  mentalist: {},
  aesthetic: {}
};

const routes = [
  "dashboard",
  "chess",
  "scenarios",
  "culture",
  "planning",
  "defense",
  "aim",
  "logic",
  "memory",
  "influence",
  "mentalist",
  "aesthetic"
];

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

// Livelli del bot: definiti in chess/bot.js (Elo, errori calibrati, ricerca Stockfish).
const botLevels = ChessBot.LEVELS.map((level) => ({
  level: level.level,
  name: level.name,
  description: level.description,
  estimatedElo: level.elo,
  targetAccuracy: level.targetAccuracy
}));

const botLevelProfiles = Object.fromEntries(botLevels.map((level) => [level.level, { elo: level.estimatedElo, displayElo: String(level.estimatedElo), label: level.name, description: level.description }]));

const STOCKFISH_ENGINE_ENABLED = true;
const CHESS_REVIEW_DEPTH = ChessReview.DEFAULT_DEPTH;
const CHESS_REVIEW_MULTIPV = ChessReview.DEFAULT_MULTIPV;
const STOCKFISH_ENGINE_LABEL = "Stockfish 17.1 Lite";
const STOCKFISH_REQUIRED_NOTICE = "Stockfish non disponibile: avvia il server locale (node local-server.js) e apri http://localhost:8765.";
// Analisi gia' calcolate (anche in background durante la partita), per FEN.
const chessAnalysisCache = ChessReview.createCache();

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
  forced: { label: "Forzata", icon: "\u25a1", report: "Forzata" },
  pending: { label: "In attesa di revisione", icon: "\u2026", report: "In attesa" },
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
    "Difesa: una sessione del programma, oppure una prova di riflessi e un turno di situazioni.",
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

// Gli scenari sociali sono in scenarios/ (esami speciali e risposta libera).

// Le schede di cultura sono in culture/ (biblioteca, verifica e ripasso distanziato).

const planningGoals = [
  "Una persona ti prende in giro spesso davanti agli altri. Crea un piano per farla smettere senza peggiorare la situazione e senza perdere controllo.",
  "Vuoi migliorare la concentrazione nello studio per 30 giorni, ma perdi tempo con telefono e notifiche.",
  "Devi convincere un gruppo a lavorare meglio senza sembrare autoritario.",
  "Vuoi imparare una competenza nuova con poco tempo libero e rischio di mollare dopo una settimana.",
  "Hai un conflitto con qualcuno che fraintende spesso le tue intenzioni. Crea un piano per chiarire e ridurre attrito."
];

// Le tecniche, il programma e le situazioni della difesa sono in defense/.

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
    { key: "lettura", label: "Lettura", general: "clarity" },
    { key: "autocontrollo", label: "Autocontrollo", general: "emotionalControl" },
    { key: "assertivita", label: "Assertività", general: "presence" },
    { key: "empatia", label: "Empatia", general: "presence" },
    { key: "strategia", label: "Strategia", general: "strategicMind" },
    { key: "etica", label: "Etica", general: "emotionalControl" }
  ],
  culture: [
    { key: "comprensione", label: "Comprensione", general: "culture" },
    { key: "memoria", label: "Memoria", general: "memory" },
    { key: "collegamenti", label: "Collegamenti", general: "culture" },
    { key: "applicazione", label: "Applicazione", general: "strategicMind" },
    { key: "ampiezza", label: "Ampiezza", general: "culture" },
    { key: "costanza", label: "Costanza", general: "memory" }
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
    { key: "prevenzione", label: "Prevenzione", general: "strategicMind" },
    { key: "decisione", label: "Decisione", general: "clarity" },
    { key: "riflessi", label: "Riflessi", general: "clarity" },
    { key: "controllo", label: "Controllo", general: "emotionalControl" },
    { key: "tecnica", label: "Tecnica", general: "presence" },
    { key: "costanza", label: "Costanza", general: "emotionalControl" }
  ],
  logic: [
    { key: "abstract", label: "Ragionamento astratto", general: "strategicMind" },
    { key: "pattern", label: "Serie e pattern", general: "clarity" },
    { key: "deduction", label: "Deduzione", general: "strategicMind" },
    { key: "formal", label: "Logica formale", general: "strategicMind" },
    { key: "probability", label: "Probabilità", general: "clarity" },
    { key: "reflection", label: "Riflessione", general: "emotionalControl" }
  ],
  // Memoria: categorie calcolate da test, tecniche e discipline (memory/engine.js).
  memory: [
    { key: "working", label: "Memoria di lavoro", general: "memory" },
    { key: "spatial", label: "Memoria visiva", general: "memory" },
    { key: "verbal", label: "Richiamo verbale", general: "memory" },
    { key: "technique", label: "Tecnica", general: "strategicMind" },
    { key: "speed", label: "Discipline", general: "clarity" },
    { key: "consistency", label: "Costanza", general: "emotionalControl" }
  ],
  influence: [
    { key: "recognition", label: "Riconoscimento", general: "clarity" },
    { key: "leverage", label: "Persuasione", general: "presence" },
    { key: "negotiation", label: "Negoziazione", general: "strategicMind" },
    { key: "defense", label: "Difesa", general: "emotionalControl" },
    { key: "knowledge", label: "Conoscenza", general: "strategicMind" },
    { key: "consistency", label: "Costanza", general: "emotionalControl" }
  ],
  // Mentalista: casi, osservazione, deduzione, lettura, interrogatorio, metodo (mentalist/engine.js).
  mentalist: [
    { key: "observation", label: "Osservazione", general: "memory" },
    { key: "deduction", label: "Deduzione", general: "strategicMind" },
    { key: "reading", label: "Lettura", general: "presence" },
    { key: "interview", label: "Interrogatorio", general: "emotionalControl" },
    { key: "cases", label: "Casi", general: "strategicMind" },
    { key: "method", label: "Metodo", general: "culture" }
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

let state = loadState();
let board = createInitialBoard();
let gameState = createInitialGameState();
let selectedSquare = null;
let history = [];
let moveNumber = 1;
let thinkStartedAt = Date.now();
let botMoveTimer = null;
let chessGameOver = false;
let reviewBoard = null;
let lastMoveSquares = null;
let reviewMoveSquares = null;
let currentGame = createNewGame();

document.addEventListener("DOMContentLoaded", () => {
  maybeRedirectFileChessToLocalServer();
  registerServiceWorker();
  bindDataTransfer();
  bindNavigation();
  bindControls();
  renderAestheticChecklist();
  renderDashboard();
  renderBoard();
  renderMistakes();
  renderBotLevel();
  initEngine();
  renderGameReport(buildGameAnalysis("partial"));
  loadRandomGoal();
  renderAesthetic();
  routeToCurrentHash();
});

function maybeRedirectFileChessToLocalServer() {
  if (typeof window === "undefined" || !window.location || window.location.protocol !== "file:") return;
  if (typeof fetch !== "function") return;
  const target = `http://127.0.0.1:8765/index.html${window.location.hash || ""}`;
  fetch("http://127.0.0.1:8765/chess/engine.js", { mode: "no-cors", cache: "no-store" })
    .then(() => {
      window.location.replace(target);
    })
    .catch(() => {});
}

window.addEventListener("hashchange", routeToCurrentHash);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const merged = mergeDefaults(defaultState, saved || {});
    const scheme = saved && saved.chess ? Number(saved.chess.levelScheme) || 1 : 3;
    return scheme < 3 ? migrateChessState(merged, scheme) : merged;
  } catch (error) {
    return JSON.parse(JSON.stringify(defaultState));
  }
}

// Schema 1 -> 2: i vecchi livelli (1-15) avevano Elo diversi, li convertiamo al livello nuovo
// con l'Elo piu' vicino, statistiche comprese. Schema 2 -> 3: bot ritarati (ottobre 2026).
function migrateChessState(loaded, scheme = 1) {
  if (!loaded || !loaded.chess) return loaded;
  if (scheme < 2) migrateChessLevels(loaded);
  if (scheme < 3) recalibrateChessBots(loaded);
  return loaded;
}

function migrateChessLevels(loaded) {
  const oldElo = [250, 400, 550, 700, 850, 1000, 1150, 1300, 1450, 1600, 1800, 2000, 2300, 2800, 3500];
  const mapLevel = (level) => ChessBot.levelForElo(oldElo[Math.min(oldElo.length, Math.max(1, Number(level) || 1)) - 1]);
  const hadGames = Boolean(loaded.chess.games);
  if (hadGames || loaded.chess.botLevel !== defaultState.chess.botLevel) loaded.chess.botLevel = mapLevel(loaded.chess.botLevel);
  const migratedStats = {};
  Object.entries(loaded.chess.levelStats || {}).forEach(([key, stats]) => {
    const target = String(mapLevel(key));
    const current = migratedStats[target] || { games: 0, wins: 0, losses: 0, draws: 0, accuracySum: 0, accuracyGames: 0 };
    Object.keys(current).forEach((field) => { current[field] += Number(stats && stats[field]) || 0; });
    migratedStats[target] = current;
  });
  loaded.chess.levelStats = migratedStats;
  loaded.chess.levelScheme = 2;
}

// I bot di prima erano piu' deboli dell'Elo scritto. Il rating viene ricalcolato con la loro
// forza vera (ChessBot.legacyTrueElo) e le statistiche per livello ripartono da zero, perche'
// i bot nuovi sono diversi. I dati vecchi restano in chess.recalibrationBackup.
function recalibrateChessBots(loaded) {
  const chess = loaded.chess;
  const rating = chess.rating && chess.rating.game && chess.rating.game.count > 0;
  const stats = Object.values(chess.levelStats || {}).some((item) => item && item.games > 0);
  if (rating || stats) {
    const date = new Date().toISOString();
    chess.recalibrationBackup = { date, rating: JSON.parse(JSON.stringify(chess.rating || {})), levelStats: JSON.parse(JSON.stringify(chess.levelStats || {})) };
    let before = null;
    let after = null;
    if (rating) {
      const res = ChessRating.recalibrate(chess.rating, ChessBot.legacyTrueElo);
      chess.rating = res.profile;
      before = res.before;
      after = res.after;
    }
    chess.levelStats = {};
    chess.recalibration = { date, before, after, seen: false };
  }
  chess.levelScheme = 3;
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

// App sul telefono: il service worker fa funzionare il sito anche senza rete (vedi sw.js).
function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !/^https?:$/.test(window.location.protocol)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

/*
 * I tuoi dati: i progressi stanno nel browser di ogni dispositivo. Per portarli dal computer
 * al telefono (o fare una copia) si esportano in un file e si importano sull'altro dispositivo.
 */
const DATA_FILE_APP = "metodo-integrale";
let pendingImport = null;

function dataStatus(text, kind = "") {
  const el = document.getElementById("dataStatus");
  if (!el) return;
  el.textContent = text;
  el.className = `data-status ${kind}`;
}

async function exportData() {
  saveState();
  const today = new Date();
  const stamp = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const payload = { app: DATA_FILE_APP, version: 1, exportedAt: today.toISOString(), state: JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  const name = `metodo-integrale-${stamp}.json`;
  const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
  // sul telefono si apre il menu Condividi (salva su File, Drive, invia a te stesso); sul computer si scarica
  const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  if (coarse && typeof File === "function" && navigator.canShare) {
    const file = new File([blob], name, { type: "application/json" });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Dati Metodo Integrale" });
        dataStatus(`File ${name} condiviso. Sull'altro dispositivo usa "Importa da file".`, "ok");
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }
  }
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 5000);
  dataStatus(`File ${name} scaricato. Sull'altro dispositivo usa "Importa da file".`, "ok");
}

function readImportFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    let data = null;
    try { data = JSON.parse(String(reader.result)); } catch (error) { data = null; }
    const incoming = data && data.app === DATA_FILE_APP && data.state ? data.state : data;
    const valid = incoming && typeof incoming === "object" && !Array.isArray(incoming)
      && Object.keys(defaultState).some((key) => key in incoming);
    if (!valid) {
      pendingImport = null;
      showImportConfirm(false);
      dataStatus("Questo file non contiene dati di Metodo Integrale: scegli il file esportato dall'app.", "bad");
      return;
    }
    pendingImport = incoming;
    const when = data && data.exportedAt ? new Date(data.exportedAt).toLocaleString("it-IT", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "data sconosciuta";
    dataStatus(`File esportato il ${when}. Sostituisce tutti i dati di questo dispositivo.`, "");
    showImportConfirm(true);
  };
  reader.onerror = () => dataStatus("Non riesco a leggere il file.", "bad");
  reader.readAsText(file);
}

function showImportConfirm(show) {
  const box = document.getElementById("importConfirm");
  if (box) box.hidden = !show;
  if (show) {
    const yes = document.getElementById("importYesBtn");
    if (yes) yes.focus();
  }
}

function applyImport() {
  if (!pendingImport) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingImport));
  pendingImport = null;
  dataStatus("Dati importati: ricarico l'app.", "ok");
  setTimeout(() => window.location.reload(), 400);
}

function bindDataTransfer() {
  const exportBtn = document.getElementById("exportDataBtn");
  const importBtn = document.getElementById("importDataBtn");
  const input = document.getElementById("importDataInput");
  if (exportBtn) exportBtn.addEventListener("click", () => { exportData(); });
  if (importBtn && input) importBtn.addEventListener("click", () => { input.value = ""; input.click(); });
  if (input) input.addEventListener("change", () => readImportFile(input.files && input.files[0]));
  const yes = document.getElementById("importYesBtn");
  const no = document.getElementById("importNoBtn");
  if (yes) yes.addEventListener("click", applyImport);
  if (no) no.addEventListener("click", () => { pendingImport = null; showImportConfirm(false); dataStatus("Importazione annullata: i dati di questo dispositivo non sono cambiati."); });
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
  document.body.dataset.route = activeRoute;
  // su telefono il menu e' una striscia: la voce attiva va portata in vista
  const nav = document.querySelector(".nav-list");
  const activeLink = nav && nav.querySelector(".nav-link.active");
  if (nav && activeLink && nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, activeLink.offsetLeft - (nav.clientWidth - activeLink.offsetWidth) / 2);
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
  decoratePageEyebrows();
  document.getElementById("resetBoardBtn").addEventListener("click", resetChess);
  document.getElementById("undoMoveBtn").addEventListener("click", undoMovePair);
  document.getElementById("reviewGameBtn").addEventListener("click", () => {
    if (currentGame.rated && !chessGameOver) return;
    if (window.setChessTab) setChessTab("review");
    renderMoveReview(false);
  });
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
  document.getElementById("reviewEvalSparkline").addEventListener("click", handleEvalSparklineClick);
  document.getElementById("startReviewFromReportBtn").addEventListener("click", () => {
    if (currentGame.rated && !chessGameOver) {
      if (window.coachSay) coachSay("L'analisi con Stockfish si apre a fine partita: in una partita valutata non ci sono aiuti.");
      return;
    }
    renderMoveReview(false);
  });
  document.getElementById("newGoalBtn").addEventListener("click", loadRandomGoal);
  document.getElementById("clearGoalBtn").addEventListener("click", clearGoal);
  document.getElementById("analyzePlanBtn").addEventListener("click", analyzePlan);
  document.getElementById("newStyleTipBtn").addEventListener("click", renderRandomStyleTip);
  document.getElementById("saveAestheticBtn").addEventListener("click", saveAestheticChecklist);
}

function renderDashboard() {
  const abilities = getAbilities();
  const average = abilities.reduce((sum, item) => sum + item.value, 0) / abilities.length;
  const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
  setText("disciplineScore", Math.round(average));
  setText("overallRank", rankFromScore(average));
  renderRankCard(average);

  const weakest = [...abilities].sort((a, b) => a.value - b.value)[0];
  const strongest = [...abilities].sort((a, b) => b.value - a.value)[0];
  setText("rankStrong", `${abilityLabels[strongest.key]} · ${strongest.value}`);
  setText("rankWeak", `${abilityLabels[weakest.key]} · ${weakest.value}`);
  const moduleNames = { chess: "Scacchi", scenarios: "Scenari", culture: "Cultura", planning: "Piani", defense: "Difesa", logic: "Logica", memory: "Memoria", influence: "Influenza", mentalist: "Mentalista", aesthetic: "Estetica" };
  const moduleScores = Object.keys(moduleSkillDefinitions).map((key) => ({ key, value: getModuleScore(key) })).sort((a, b) => b.value - a.value);
  if (moduleScores.length) {
    setText("rankTopModule", `${moduleNames[moduleScores[0].key] || moduleScores[0].key} · ${moduleScores[0].value}`);
    const low = moduleScores[moduleScores.length - 1];
    setText("rankLowModule", `${moduleNames[low.key] || low.key} · ${low.value}`);
  }
  setText("profileSummary", `Punto forte: ${abilityLabels[strongest.key]}. Punto da spingere: ${abilityLabels[weakest.key]}. Rango generale ${rankFromScore(average)}.`);
  setText("finalRecap", buildFinalRecap(abilities));

  renderTodayPlan(false);
  renderAbilityRadar();
  renderGlobalParameters();
  renderAllModuleStatus();
  renderModeCardIndicators();
}

// Icona del reparto accanto al nome in cima a ogni pagina (presa dal menu).
function decoratePageEyebrows() {
  document.querySelectorAll("section.page").forEach((page) => {
    const eyebrow = page.querySelector(".page-heading .eyebrow");
    const link = document.querySelector(`.nav-link[data-route="${page.id}"] use`);
    if (!eyebrow || !link || eyebrow.querySelector(".eyebrow-icon")) return;
    const href = link.getAttribute("href");
    eyebrow.insertAdjacentHTML("afterbegin", `<svg class="eyebrow-icon" aria-hidden="true"><use href="${href}"/></svg>`);
  });
}

// Tessera del rango nel quadro e nel menu: lettera, scala E-S e punti mancanti al rango successivo.
const RANK_ORDER = ["E", "D", "C", "B", "A", "S"];
const RANK_FLOOR = { E: 0, D: 45, C: 60, B: 70, A: 80, S: 90 };
function renderRankCard(score) {
  const rank = rankFromScore(score);
  const next = RANK_ORDER[RANK_ORDER.indexOf(rank) + 1];
  const card = document.getElementById("rankCard");
  const letter = document.getElementById("rankLetter");
  if (card) card.dataset.rank = rank;
  if (letter) letter.textContent = rank;
  document.querySelectorAll("#rankScale li").forEach((item) => {
    const index = RANK_ORDER.indexOf(item.dataset.rank);
    item.classList.toggle("current", item.dataset.rank === rank);
    item.classList.toggle("reached", index < RANK_ORDER.indexOf(rank));
  });
  const missing = next ? Math.max(1, Math.ceil(RANK_FLOOR[next] - score)) : 0;
  const nextText = next ? `Mancano ${missing} punti al rango ${next}.` : "Rango massimo raggiunto.";
  const nextBox = document.getElementById("rankNext");
  if (nextBox) nextBox.textContent = nextText;
  const pct = next ? Math.round(((score - RANK_FLOOR[rank]) / (RANK_FLOOR[next] - RANK_FLOOR[rank])) * 100) : 100;
  const fill = document.getElementById("rankFill");
  if (fill) fill.style.width = `${clamp(pct, 2, 100)}%`;
  // menu laterale
  const side = document.getElementById("sideRank");
  if (side) {
    side.dataset.rank = rank;
    side.querySelector("#sideRankLetter").textContent = rank;
    side.querySelector("#sideRankScore").textContent = Math.round(score);
    side.querySelector("#sideRankFill").style.width = `${clamp(pct, 2, 100)}%`;
    side.querySelector("#sideRankNext").textContent = next ? `${missing} punti al rango ${next}` : "Rango massimo";
  }
  const brandRank = document.getElementById("brandRank");
  if (brandRank) brandRank.textContent = `Rango ${rank} · ${Math.round(score)} su 100`;
}

function buildFinalRecap(abilities) {
  const weakest = [...abilities].sort((a, b) => a.value - b.value)[0];
  const chessErrors = Object.values(state.mistakeCounts).reduce((sum, item) => sum + item, 0);
  const studied = state.cultureLab && state.cultureLab.cards ? (window.CultureCards || []).filter((c) => state.cultureLab.cards[c.id] && state.cultureLab.cards[c.id].box >= 1).length : 0;
  const memoryText = window.memoryTrend ? (() => { try { return window.memoryTrend(); } catch (error) { return "da misurare"; } })() : "da misurare";
  const influenceText = window.influenceTrend ? (() => { try { return window.influenceTrend(); } catch (error) { return "da iniziare"; } })() : "da iniziare";
  const mentalistText = window.mentalistTrend ? (() => { try { return window.mentalistTrend(); } catch (error) { return "da iniziare"; } })() : "da iniziare";
  return `Priorita': ${abilityLabels[weakest.key]}. Scacchi: ${state.chess.games} partite, ${chessErrors} pattern errore. Cultura: ${studied} schede studiate. Memoria: ${memoryText}. Influenza: ${influenceText}. Mentalista: ${mentalistText}. Estetica: ${state.aesthetic.score || 0}/100.`;
}

// «Oggi» nel quadro: i passi che restano nei reparti con un programma del giorno.
const todaySources = [
  { route: "memory", name: "Memoria", engine: "MemoryEngine", lab: "memoryLab" },
  { route: "logic", name: "Logica", engine: "LogicEngine", lab: "logicLab" },
  { route: "influence", name: "Influenza", engine: "InfluenceEngine", lab: "influenceLab" },
  { route: "mentalist", name: "Mentalista", engine: "MentalistEngine", lab: "mentalistLab" }
];
function todayItems() {
  const items = [];
  todaySources.forEach((src) => {
    const E = window[src.engine];
    if (!E || typeof E.plan !== "function" || typeof E.ensure !== "function") return;
    try {
      const steps = E.plan(E.ensure(state[src.lab]));
      const left = steps.filter((x) => !x.done);
      items.push({ route: src.route, name: src.name, left: left.length, total: steps.length, minutes: left.reduce((sum, x) => sum + (x.minutes || 0), 0), text: left.length ? left[0].title : "Programma di oggi completato" });
    } catch (error) { /* reparto non leggibile: lo salto */ }
  });
  try {
    if (window.CultureEngine && window.CultureCards && state.cultureLab) {
      const due = CultureEngine.dueCards(state.cultureLab, window.CultureCards).length;
      items.push({ route: "culture", name: "Cultura", left: due ? 1 : 0, total: 1, minutes: due ? Math.min(20, due * 3) : 0, text: due ? `${due} ${due === 1 ? "scheda da ripassare" : "schede da ripassare"}` : "Nessun ripasso in scadenza" });
    }
  } catch (error) { /* niente */ }
  items.push({ route: "chess", name: "Scacchi", left: 1, total: 1, minutes: 20, text: "Una partita valutata, poi la revisione delle mosse", open: true });
  items.push({ route: "defense", name: "Difesa", left: 1, total: 1, minutes: 30, text: "Lo stile del giorno, o riflessi e situazioni", open: true });
  return items;
}
function renderTodayPlan() {
  const list = document.getElementById("todayTasks");
  if (!list) return;
  const items = todayItems();
  const pending = items.filter((x) => x.left > 0);
  const counted = pending.filter((x) => !x.open);
  const steps = counted.reduce((sum, x) => sum + x.left, 0);
  const head = document.getElementById("todaySummary");
  if (head) head.textContent = steps ? `${steps} ${steps === 1 ? "passo" : "passi"} nei programmi dei reparti` : "Programmi dei reparti completati";
  const ordered = pending.concat(items.filter((x) => x.left === 0));
  list.innerHTML = ordered.map((x) => {
    const icon = document.querySelector(`.nav-link[data-route="${x.route}"] use`);
    const href = icon ? icon.getAttribute("href") : "#i-dashboard";
    return `<li class="today-item ${x.left ? "" : "done"}" data-route="${x.route}">
      <a href="#${x.route}">
        <svg class="today-icon" aria-hidden="true"><use href="${href}"/></svg>
        <span class="today-copy"><strong>${x.name}</strong><span>${x.text}</span></span>
        <span class="today-count">${x.left ? (x.open ? `${x.minutes} min` : x.route === "culture" ? `${x.minutes} min` : `${x.left} ${x.left === 1 ? "passo" : "passi"}`) : "fatto"}</span>
      </a>
    </li>`;
  }).join("");
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
  if (!svg) return;
  const abilities = getAbilities();
  const labeledAbilities = abilities.map((ability) => ({ ...ability, label: abilityLabels[ability.key] }));
  svg.innerHTML = buildRadarMarkup(labeledAbilities, 380, 190, 112, true);
  const abilityList = document.getElementById("abilityList");
  if (!abilityList) return;
  abilityList.innerHTML = labeledAbilities.map((ability) => `
    <div class="ability-chip" data-rank="${rankFromScore(ability.value)}">
      <span>${ability.label}</span>
      <strong>${ability.value}</strong>
      <em>${rankFromScore(ability.value)}</em>
    </div>`).join("");
}

function buildRadarMarkup(values, size, center, maxRadius, showLabels) {
  const angles = [-90, -30, 30, 90, 150, 210].map((deg) => (Math.PI / 180) * deg);
  const pointFor = (radius, index) => {
    const angle = angles[index];
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
  };
  const rings = [0.33, 0.66, 1].map((ratio) => {
    const points = angles.map((_, index) => pointFor(maxRadius * ratio, index).join(",")).join(" ");
    return `<polygon class="radar-grid${ratio === 1 ? " radar-grid-outer" : ""}" points="${points}"></polygon>`;
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
    const [labelX, labelY] = pointFor(maxRadius + 40, index);
    const [valueX, valueY] = [labelX, labelY + 14];
    return `<circle class="radar-dot" cx="${x}" cy="${y}" r="5"></circle><text class="radar-label" x="${labelX}" y="${labelY}">${item.label}</text><text class="radar-value" x="${valueX}" y="${valueY}">${Math.round(value)} ${rankFromScore(value)}</text>`;
  }).join("");
  return `<rect class="radar-bg" x="0" y="0" width="${size}" height="${size}" rx="8"></rect>${rings}${axes}<polygon class="radar-shape" points="${shapePoints}"></polygon>${dots}`;
}

function renderGlobalParameters() {
  const container = document.getElementById("globalParamList");
  if (!container) return;
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
  if (moduleKey === "chess" && window.renderChessProfile) {
    renderChessProfile();
    return;
  }
  if (moduleKey === "scenarios" && window.renderScenarioProfile) {
    renderScenarioProfile();
    return;
  }
  if (moduleKey === "culture" && window.renderCultureProfile) {
    renderCultureProfile();
    return;
  }
  if (moduleKey === "defense" && window.renderDefenseProfile) {
    renderDefenseProfile();
    return;
  }
  const skills = getModuleSkills(moduleKey);
  const score = getModuleScore(moduleKey);
  const radar = document.getElementById(`${moduleKey}ModuleRadar`);
  const metricBox = document.getElementById(`${moduleKey}ModuleMetrics`);
  if (radar) { radar.setAttribute("viewBox", "0 0 380 380"); radar.innerHTML = buildRadarMarkup(skills, 380, 190, 100, true); }
  if (metricBox) {
    metricBox.classList.add("module-skill-panel");
    metricBox.innerHTML = `
      <div class="module-score-card">
        <span>Punteggio totale</span>
        <strong>${score}</strong>
        <em>Rango ${rankFromScore(score)}</em>
      </div>
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
    const rank = rankFromScore(average);
    box.classList.add("dashboard-card-profile");
    box.innerHTML = `
      <div class="dashboard-card-top">
        <svg class="dashboard-card-radar" viewBox="0 0 180 180" role="img" aria-label="Profilo ${moduleKey}: ${values.map((v) => `${v.label} ${v.value}`).join(", ")}">
          ${buildRadarMarkup(values, 180, 90, 80, false)}
        </svg>
        <div class="dashboard-card-average">
          <strong>${average}</strong>
          <span class="card-rank" data-rank="${rank}">Rango ${rank}</span>
        </div>
      </div>
      <dl class="card-values">
        ${values.map((item) => `<div><dt>${item.label}</dt><dd>${item.value}</dd></div>`).join("")}
      </dl>
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
  const aestheticScore = state.aesthetic.score || metric("efficacia");

  const profiles = {
    // Scacchi: categorie aggiornate dagli eventi di ogni partita (chess/skills.js).
    chess: window.ChessSkills ? ChessSkills.CATEGORIES.map((category) => [category.label, ChessSkills.ensureSkills(state.chess.skills)[category.key]]) : [],
    // Scenari: categorie aggiornate dalle mosse degli esami speciali (scenarios/engine.js).
    scenarios: window.ScenarioEngine ? (() => {
      const lab = ScenarioEngine.ensureProfile(state.scenarioLab);
      return ScenarioEngine.DIMENSIONS.map((d) => [d.label, lab[d.key]]);
    })() : [],
    // Cultura: categorie calcolate dalle risposte di verifiche e ripassi (culture/engine.js).
    culture: window.CultureEngine && window.cultureProfileSkills ? window.cultureProfileSkills().map((k) => [k.label, k.value]) : [],
    planning: [
      ["Chiarezza obiettivo", (metric("lucidita") + planAverage) / 2],
      ["Priorità", (metric("ragionamento") + planAverage) / 2],
      ["Gestione rischio", metric("rischio")],
      ["Flessibilità", metric("flessibilita", metric("adattamento"))],
      ["Sostenibilità", metric("sostenibilita")],
      ["Piano B", metric("adattamento") + (state.planScores.length ? 4 : 0)]
    ],
    // Difesa: categorie calcolate da sessioni, prove di riflessi e situazioni (defense/engine.js).
    defense: window.DefenseEngine && window.defenseProfileSkills ? (() => {
      try { return window.defenseProfileSkills().map((k) => [k.label, k.value]); } catch (error) { console.warn("Profilo difesa non leggibile", error); return []; }
    })() : [],
    // Logica: punteggi Elo delle discipline e trappole (logic/engine.js).
    logic: window.logicProfileSkills ? (() => {
      try { return window.logicProfileSkills().map((k) => [k.label, k.value]); } catch (error) { console.warn("Profilo logica non leggibile", error); return []; }
    })() : [],
    memory: window.memoryProfileSkills ? (() => {
      try { return window.memoryProfileSkills().map((k) => [k.label, k.value]); } catch (error) { console.warn("Profilo memoria non leggibile", error); return []; }
    })() : [],
    // Influenza: categorie calcolate da trattative, esercizi, casi e schede (influence/engine.js).
    influence: window.influenceProfileSkills ? (() => {
      try { return window.influenceProfileSkills().map((k) => [k.label, k.value]); } catch (error) { console.warn("Profilo influenza non leggibile", error); return []; }
    })() : [],
    // Mentalista: punteggi delle discipline, casi (primo tentativo) e verifiche del metodo.
    mentalist: window.mentalistProfileSkills ? (() => {
      try { return window.mentalistProfileSkills().map((k) => [k.label, k.value]); } catch (error) { console.warn("Profilo mentalista non leggibile", error); return []; }
    })() : [],
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
  // Il totale e' sempre la media delle categorie mostrate (anche per gli scacchi).
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
    chess: window.chessCertifiedGrade ? (() => {
      const est = chessEstimatedElo();
      const profile = chessRatingProfile();
      return `Grado ${chessCertifiedGrade().key} · ${profile.game.count ? `${profile.game.count} partite valutate` : "nessuna partita valutata"}${est.elo ? ` · Elo stimato ${est.elo}` : ""}`;
    })() : state.chess.games ? `${state.chess.games} partite · accuratezza ${state.chess.lastAccuracy || 0}%` : "Base iniziale · migliora giocando partite",
    scenarios: window.ScenarioEngine ? (() => {
      const lab = ScenarioEngine.ensureProfile(state.scenarioLab);
      const info = ScenarioEngine.classFor(lab, window.ScenarioExams || []);
      return info.done || lab.freeCount ? `${info.current.name} · ${info.done} esami · ${lab.pp} punti privati` : "Classe D · fai il primo esame speciale";
    })() : "Base iniziale · rispondi agli scenari",
    culture: window.CultureEngine && state.cultureLab ? (() => {
      const cards = window.CultureCards || [];
      const lab = state.cultureLab;
      const studied = cards.filter((c) => lab.cards && lab.cards[c.id] && lab.cards[c.id].box >= 1).length;
      const due = CultureEngine.dueCards(lab, cards).length;
      return studied ? `${studied}/${cards.length} schede studiate · ${due ? `${due} da ripassare oggi` : "nessun ripasso oggi"}` : "Biblioteca nuova · leggi la prima scheda";
    })() : "Biblioteca nuova · leggi la prima scheda",
    planning: state.planScores.length ? `${state.planScores.length} piani · media ${Math.round(averageArray(state.planScores))}` : "Base iniziale · scrivi un piano",
    defense: window.defenseTrend ? (() => { try { return window.defenseTrend(); } catch (error) { return "Fase 1 · inizia la prima sessione"; } })() : "Fase 1 · inizia la prima sessione",
    logic: window.logicTrend ? (() => { try { return window.logicTrend(); } catch (error) { return "Base iniziale · fai il primo turno"; } })() : "Base iniziale · fai il primo turno",
    memory: window.memoryTrend ? (() => { try { return window.memoryTrend(); } catch (error) { return "Base iniziale · fai la prima misura"; } })() : "Base iniziale · fai la prima misura",
    influence: window.influenceTrend ? (() => { try { return window.influenceTrend(); } catch (error) { return "Base iniziale · parti dal manuale"; } })() : "Base iniziale · parti dal manuale",
    mentalist: window.mentalistTrend ? (() => { try { return window.mentalistTrend(); } catch (error) { return "Base iniziale · apri il primo caso"; } })() : "Base iniziale · apri il primo caso",
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
  if (moduleKey === "memory") return "Allenamento: il programma di oggi nella pagina Memoria (sistema fonetico, una disciplina, il palazzo).";
  if (moduleKey === "scenarios") return "Allenamento: prima i fatti, poi una frase breve senza accuse, poi il piano B.";
  if (moduleKey === "defense") return "Allenamento: la prossima sessione del programma, poi una prova di riflessi e un turno di situazioni.";
  if (moduleKey === "influence") return "Allenamento: il programma di oggi nella pagina Influenza (schede, riconosci la leva, una trattativa o due casi).";
  if (moduleKey === "mentalist") return "Allenamento: il programma di oggi nella pagina Mentalista (una disciplina, un caso, una lezione).";
  if (moduleKey === "culture") return "Allenamento: fai i ripassi del giorno e spiega ogni scheda con parole tue.";
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
    playerColor: "Bianco",
    rated: state && state.chess ? state.chess.mode !== "training" : true,
    assisted: false
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

function saveMoveData(record) {
  if (currentGame) {
    currentGame.reviewStatus = "idle";
    currentGame.reviewResult = createStableReviewResult({ status: "idle" });
    currentGame.reviewFailed = false;
    currentGame.engineError = null;
    currentGame.supabaseAnalysisQueued = false;
    currentGame.supabaseExercisesQueued = false;
    currentGame.reviewSummary = null;
    currentGame.engineAnalysisInProgress = false;
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
    engine: STOCKFISH_ENGINE_LABEL,
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
  if (reason === "stalemate") return "patta per stallo";
  if (reason === "repetition") return "patta per ripetizione";
  if (reason === "insufficient") return "patta per materiale insufficiente";
  if (reason === "fifty") return "patta per regola delle 50 mosse";
  if (result === "draw") return "patta";
  if (reason === "resign") return "abbandono";
  if (!result || result === "partial" || result === "in corso") return "in corso";
  return "conclusa";
}

function resetChess() {
  clearBotTimer();
  const engines = chessEngines();
  if (engines) engines.review.cancelPending();
  board = createInitialBoard();
  gameState = createInitialGameState();
  selectedSquare = null;
  history = [];
  moveNumber = 1;
  thinkStartedAt = Date.now();
  chessGameOver = false;
  reviewBoard = null;
  lastMoveSquares = null;
  reviewMoveSquares = null;
  resetChessGameData();
  currentGame.rated = state.chess.mode !== "training";
  if (window.resetChessHelpers) resetChessHelpers();
  if (window.hideGameResult) hideGameResult();
  const opening = currentGame.rated
    ? `Nuova partita valutata contro il bot da ${currentGame.botElo} Elo. Niente aiuti: il risultato conta per il tuo rating.`
    : `Nuova partita di allenamento contro il bot da ${currentGame.botElo} Elo. Ti avviso se lasci qualcosa in presa.`;
  if (window.coachSay) coachSay(opening);
  else document.getElementById("coachMessage").textContent = opening;
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
  if (currentGame.rated) {
    if (window.coachSay) coachSay("In una partita valutata non si annullano le mosse. Passa ad Allenamento per avere gli aiuti.");
    return;
  }
  if (window.chessCoachBlocking && window.chessCoachBlocking()) return;
  if (chessGameOver) {
    document.getElementById("coachMessage").textContent = "La partita e' finita: premi Reset per giocarne un'altra.";
    return;
  }
  if (isBotTurn()) return;
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
  moveNumber = Math.floor(currentGame.moves.length / 2) + 1;
  currentGame.reviewStatus = "idle";
  currentGame.reviewResult = createStableReviewResult({ status: "idle" });
  currentGame.reviewSummary = null;
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

function renderBoard(options = {}) {
  if (!document.getElementById("chessBoard")) return;
  if (typeof getBoardView !== "function") return;
  const displayBoard = reviewBoard || board;
  if (window.chessTrainerOwnsBoard && window.chessTrainerOwnsBoard()) {
    if (window.renderChessChrome) renderChessChrome(displayBoard);
    return;
  }
  const view = getBoardView();
  const interactive = window.chessGameInteractive ? window.chessGameInteractive() : !reviewBoard && !chessGameOver && !isBotTurn();
  const pre = !reviewBoard && window.chessPremoveView ? window.chessPremoveView() : null;
  if (pre && pre.active) selectedSquare = null;
  const selected = selectedSquare && !reviewBoard ? coord(selectedSquare.row, selectedSquare.col) : null;
  const legal = selectedSquare && !reviewBoard ? getLegalMoves(board, selectedSquare.row, selectedSquare.col) : [];
  const targets = legal.map((move) => ({ square: coord(move.toRow, move.toCol), capture: Boolean(board[move.toRow][move.toCol] || move.enPassant) }));
  const activeLastMove = reviewBoard ? reviewMoveSquares : lastMoveSquares;
  const lastMove = activeLastMove ? { from: coord(activeLastMove.fromRow, activeLastMove.fromCol), to: coord(activeLastMove.toRow, activeLastMove.toCol) } : null;
  const checkedKing = getCheckedKingSquare(displayBoard);
  const checkedColor = checkedKing ? (isWhite(displayBoard[checkedKing.row][checkedKing.col]) ? "w" : "b") : null;
  const mated = checkedKing && getAllLegalMoves(displayBoard, checkedColor).length === 0 ? coord(checkedKing.row, checkedKing.col) : null;
  const reviewMove = reviewBoard && currentGame.reviewIndex >= 0 ? currentGame.moves[currentGame.reviewIndex] || null : null;
  const decorations = window.chessBoardDecorations ? window.chessBoardDecorations(reviewMove) : { arrows: [], marks: {} };
  let badge = null;
  if (reviewMove && lastMove && reviewMove.engineAnalysis && reviewMove.engineAnalysis.ok) {
    const meta = getMoveQualityMeta(reviewMove.quality);
    badge = { square: lastMove.to, cls: reviewQualityClass(reviewMove.quality), icon: meta.icon, label: meta.label };
  }
  view.render({
    position: displayBoard,
    lastMove,
    check: checkedKing ? coord(checkedKing.row, checkedKing.col) : null,
    mated,
    selected: pre && pre.active ? pre.selected : interactive ? selected : null,
    targets: pre && pre.active ? pre.targets : interactive ? targets : [],
    arrows: decorations.arrows,
    marks: pre ? { ...decorations.marks, ...pre.marks } : decorations.marks,
    premove: Boolean(pre && pre.active),
    badge,
    interactive,
    movable: "w",
    animate: options.animate !== false
  });

  renderEvalStatus(displayBoard);
  const turn = document.getElementById("turnStatus");
  if (turn) {
    if (reviewBoard) turn.textContent = currentGame.reviewIndex >= 0 ? `Mossa ${currentGame.reviewIndex + 1}/${currentGame.moves.length}` : "Posizione iniziale";
    else if (chessGameOver) turn.textContent = "Partita conclusa";
    else if (isBotTurn()) turn.textContent = pre && pre.pending ? "Il bot pensa · premossa pronta" : "Il bot pensa: puoi preparare una premossa";
    else turn.textContent = isKingInCheck(board, "w") ? "Sei sotto scacco" : "Tocca a te";
  }
  if (window.renderChessChrome) renderChessChrome(displayBoard);
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
  if (isBotTurn()) return;
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
  const fenBefore = boardToFen(before, "w", beforeGameState);
  board = applyMove(board, move);
  updateGameStateForMove(move, before);
  selectedSquare = null;
  const record = buildPlainMoveRecord({
    side: "Bianco",
    color: "w",
    move,
    piece: movedPiece,
    before,
    after: board,
    fenBefore,
    fenAfter: boardToFen(board, "b", gameState),
    seconds
  });
  const savedRecord = saveMoveData(record);
  lastMoveSquares = moveSquaresFromRecord(savedRecord);
  queueBackgroundAnalysis(savedRecord.fenAfter);
  if (window.playMoveSound) playMoveSound(savedRecord);
  if (finishIfGameOver("b")) {
    renderBoard();
    return;
  }
  // In allenamento il coach puo' fermare il bot per farti correggere un errore grave.
  const coachStops = window.coachAfterPlayerMove ? coachAfterPlayerMove(savedRecord) : false;
  if (!coachStops && currentGame.rated && window.coachSay) {
    coachSay(`Hai giocato ${ChessAnalysis.figurine(savedRecord.san)}. Il bot sta pensando.`);
  }
  renderBoard();
  if (coachStops) return;
  clearBotTimer();
  botMoveTimer = window.setTimeout(makeBotMove, 200);
}

// Record base di una mossa: la classificazione arriva dalla revisione Stockfish.
function buildPlainMoveRecord({ side, color, move, piece, before, after, fenBefore, fenAfter, seconds }) {
  const san = moveToSan(before, after, move, piece, color);
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
    san,
    moveSan: san,
    uci: moveToUci(before, move),
    colorMoved: color,
    timeSeconds: seconds,
    seconds,
    fenBefore,
    fenAfter,
    quality: "pending",
    classification: "In attesa di revisione",
    categories: [],
    pattern: null,
    loss: 0,
    bestMoveText: null,
    bestMoveUci: null,
    evalBefore: 0,
    evalAfter: 0,
    evalDiff: 0,
    variation: "-",
    drill: "-",
    comment: "Mossa salvata: la valutazione arriva con la revisione Stockfish.",
    note: "Mossa salvata.",
    boardBefore: cloneBoard(before),
    boardAfter: cloneBoard(after),
    engineAnalysis: null
  };
}

async function makeBotMove() {
  botMoveTimer = null;
  if (chessGameOver) return;
  const moves = getAllLegalMoves(board, "b");
  if (moves.length === 0) {
    finishIfGameOver("b");
    return;
  }
  const gameId = currentGame.id;
  const plyBefore = currentGame.moves.length;
  const level = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const profile = getBotProfile(level);
  const beforeGameState = cloneGameState(gameState);
  const fenBefore = boardToFen(board, "b", beforeGameState);
  const positionChanged = () => currentGame.id !== gameId || chessGameOver || currentGame.moves.length !== plyBefore || boardToFen(board, "b", gameState) !== fenBefore;
  const coach = document.getElementById("coachMessage");
  if (currentGame.rated) coach.textContent = `Il bot (${profile.elo} Elo) sta pensando...`;
  const ready = await ensureStockfishReadyForChess();
  if (positionChanged()) return;
  if (!ready) {
    coach.textContent = `${STOCKFISH_REQUIRED_NOTICE} ${currentGame.engineError ? `Dettaglio: ${currentGame.engineError}` : ""}`;
    renderBotLevel();
    return;
  }
  const startedAt = Date.now();
  const choice = await ChessBot.chooseMove(chessEngines().play, fenBefore, level, { ply: currentGame.moves.length });
  // Pausa minima per rendere la risposta naturale anche ai livelli bassi.
  const minimumThink = 350 + Math.random() * 650;
  const elapsed = Date.now() - startedAt;
  if (elapsed < minimumThink) await new Promise((resolve) => setTimeout(resolve, minimumThink - elapsed));
  if (positionChanged()) return;
  const botMove = choice.ok ? moveFromUci(choice.uci, moves) : null;
  if (!botMove) {
    currentGame.engineError = choice.error || `Mossa non valida: ${choice.uci}`;
    coach.textContent = `Stockfish non e' riuscito a muovere: ${currentGame.engineError}. Ricarica la pagina dal server locale.`;
    return;
  }
  history.push({ turn: "black", board: cloneBoard(board), gameState: beforeGameState });
  const movedPiece = board[botMove.fromRow][botMove.fromCol];
  const before = cloneBoard(board);
  board = applyMove(board, botMove);
  updateGameStateForMove(botMove, before);
  moveNumber += 1;
  const record = buildPlainMoveRecord({
    side: "Nero",
    color: "b",
    move: botMove,
    piece: movedPiece,
    before,
    after: board,
    fenBefore,
    fenAfter: boardToFen(board, "w", gameState),
    seconds: 0
  });
  record.botReason = choice.reason;
  record.comment = `Il bot gioca ${record.san}.`;
  const savedBotRecord = saveMoveData(record);
  lastMoveSquares = moveSquaresFromRecord(savedBotRecord);
  queueBackgroundAnalysis(savedBotRecord.fenAfter);
  thinkStartedAt = Date.now();
  if (window.playMoveSound) playMoveSound(savedBotRecord);
  if (currentGame.rated) coach.textContent = `Il bot risponde ${ChessAnalysis.figurine(savedBotRecord.san)}. Prima di muovere: cosa minaccia questa mossa?`;
  else if (window.coachAfterBotMove) coachAfterBotMove(savedBotRecord);
  renderBoard();
  finishIfGameOver("w");
  if (!chessGameOver && window.chessTryPremove) window.chessTryPremove();
}

function getChessPhase(currentBoard) {
  const pieces = currentBoard.flat().filter((piece) => piece && !["p", "k"].includes(piece.toLowerCase())).length;
  if (pieces <= 6) return "Finale";
  if (currentGame.moves.length < 20 && pieces > 10) return "Apertura";
  return "Mediogioco";
}

// Durante la partita mostriamo solo il bilancio materiale (la valutazione del
// motore sarebbe un suggerimento); in revisione mostriamo quella di Stockfish.
function renderEvalStatus(displayBoard) {
  const status = document.getElementById("evalStatus");
  if (!status) return;
  if (reviewBoard) {
    const move = currentGame.reviewIndex >= 0 ? currentGame.moves[currentGame.reviewIndex] : null;
    status.textContent = move && move.engineAnalysis && move.engineAnalysis.ok ? `Stockfish ${formatEngineEval(move.evalAfter)}` : "Stockfish --";
    return;
  }
  const material = materialBalance(displayBoard);
  status.textContent = material === 0 ? "Materiale pari" : `Materiale ${material > 0 ? "+" : ""}${material}`;
}

function materialBalance(currentBoard) {
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  return currentBoard.flat().reduce((sum, piece) => {
    if (!piece) return sum;
    const value = values[piece.toLowerCase()] || 0;
    return sum + (isWhite(piece) ? value : -value);
  }, 0);
}

function formatEngineEval(cp) {
  const value = Number(cp) || 0;
  if (Math.abs(value) >= ChessAnalysis.MATE_CP) return value > 0 ? "matto (vince il Bianco)" : "matto (vince il Nero)";
  if (Math.abs(value) >= 9000) {
    const mateIn = Math.max(1, Math.round((ChessAnalysis.MATE_CP - Math.abs(value)) / 10));
    return `${value > 0 ? "" : "-"}#${mateIn}`;
  }
  return `${value >= 0 ? "+" : ""}${(value / 100).toFixed(1)}`;
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
  const promotion = promotionRow !== null && move.toRow === promotionRow ? (move.promotion || "q").toLowerCase() : "";
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
  const promotion = promotionRow !== null && move.toRow === promotionRow ? `=${(move.promotion || "q").toUpperCase()}` : "";
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
  if (moves.length === 0) {
    const inCheck = isKingInCheck(board, sideToMove);
    if (!inCheck) finishGame("draw", "stalemate");
    else if (sideToMove === "b") finishGame("win", "checkmate");
    else finishGame("loss", "checkmate");
    return true;
  }
  const drawReason = detectDrawByRules();
  if (drawReason) {
    finishGame("draw", drawReason);
    return true;
  }
  return false;
}

function detectDrawByRules() {
  const moves = getSafeChessMoves();
  if (!moves.length || typeof window === "undefined" || !window.Chess) return null;
  try {
    const game = new window.Chess(moves[0].fenBefore);
    for (const record of moves) {
      if (!ChessAnalysis.applyUci(game, record.uci)) return null;
    }
    if (game.isThreefoldRepetition()) return "repetition";
    if (game.isInsufficientMaterial()) return "insufficient";
    if (game.isDrawByFiftyMoves()) return "fifty";
  } catch (error) {
    return null;
  }
  return null;
}

function finishGame(result, reason = null) {
  if (chessGameOver) return;
  chessGameOver = true;
  if (window.resetChessHelpers) resetChessHelpers();
  setChessGameFinalState(result, reason);
  const ratingInfo = window.recordRatedGame ? recordRatedGame(result) : null;
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
  if (window.showGameResult) showGameResult(result, reason, ratingInfo);
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
  const evalSeries = [safeMoves.length ? safeMoves[0].evalBefore || 0 : 0].concat(safeMoves.map((move) => move.evalAfter || 0));
  const reviewSummary = currentGame.reviewSummary || null;
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
  if (reason === "repetition") resultLabel = "Patta per ripetizione";
  if (reason === "insufficient") resultLabel = "Patta per materiale insufficiente";
  if (reason === "fifty") resultLabel = "Patta per regola delle 50 mosse";
  const exerciseObjects = buildChessExerciseObjects(whiteMoves);
  const exercises = exerciseObjects.length ? exerciseObjects.map((exercise) => `${exercise.theme} - mossa ${Math.ceil(exercise.ply / 2)}: ${exercise.short}`) : topErrors.length ? topErrors.slice(0, 2).map(([category]) => mistakeDrills[category]) : ["Esercizio: rigioca mentalmente le ultime 5 mosse e cerca una minaccia nascosta per ogni lato."];
  const botLevel = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const botProfile = getBotProfile(botLevel);
  const accuracy = reviewSummary && typeof reviewSummary.accuracy.w === "number" ? Math.round(reviewSummary.accuracy.w) : 0;
  const botAccuracy = reviewSummary && typeof reviewSummary.accuracy.b === "number" ? Math.round(reviewSummary.accuracy.b) : 0;
  const engineAvailable = isStockfishEngineEnabled();
  const engineBased = Boolean(reviewCompleted && reviewSummary && (reviewedWhiteMoves.length || reviewedBlackMoves.length));
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
    analysisSource: engineBased ? STOCKFISH_ENGINE_LABEL : reviewStatus === "analyzing" ? "Stockfish sta analizzando" : "Revisione Stockfish non ancora eseguita",
    engineError: currentGame.engineError || (engineAvailable ? null : "Motore non disponibile"),
    gameRating,
    phase,
    moveCount: safeMoves.length,
    playerMoveCount: whiteMoves.length,
    opening: reviewSummary ? reviewSummary.opening : null,
    reviewDepth: reviewSummary ? reviewSummary.depth : null,
    accuracyBreakdown: buildAccuracyBreakdown(counts, whiteMoves.length, reviewSummary),
    mainPattern,
    message: ""
  };
  analysis.gameRating = engineBased && whiteMoves.length ? estimateGameRating(accuracy, botProfile.elo, result, analysis) : null;
  analysis.message = buildChessReportMessage(analysis);
  analysis.coachSummary = buildChessCoachSummary(analysis, whiteMoves);
  return analysis;
}

function buildChessExerciseObjects(playerMoves) {
  return playerMoves
    .filter((move) => move && ["inaccuracy", "inexact", "mistake", "blunder", "missed"].includes(move.quality) && move.bestMoveUci)
    .map((move, index) => {
      const theme = move.pattern ? mistakeLabels[move.pattern] : move.quality === "missed" ? "Mossa mancata" : "Calcolo";
      const difficulty = move.quality === "blunder" ? 5 : move.quality === "mistake" || move.quality === "missed" ? 4 : 3;
      return {
        game_id: currentGame.id,
        exercise_index: index + 1,
        ply: move.ply,
        fen_before: move.fenBefore,
        correct_move: move.bestMoveUci,
        correct_move_san: move.bestMoveText,
        theme,
        difficulty,
        explanation: move.comment || buildShortReviewComment(move),
        short: buildShortReviewComment(move),
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

// "Game rating": l'Elo a cui corrisponde la tua precisione in questa partita
// (stessa tabella usata per calibrare i bot). Serve almeno qualche mossa.
function estimateGameRating(accuracy, botElo, result, analysis = null) {
  const playerMoves = analysis ? analysis.playerMoveCount || 0 : 0;
  if (playerMoves < 8 || typeof accuracy !== "number") return null;
  const competitive = competitiveAccuracy(getSafeChessMoves().filter((move) => move.side === "Bianco"));
  return ChessAnalysis.eloFromAccuracy(competitive !== null ? competitive : accuracy);
}

// Precisione nelle sole posizioni ancora aperte (probabilita' di vittoria tra
// 10% e 90%): le mosse in posizioni gia' decise dicono poco sul livello reale.
function competitiveAccuracy(playerMoves) {
  const values = playerMoves
    .filter((move) => move.engineAnalysis && move.engineAnalysis.ok && typeof move.accuracyScore === "number" && move.winBefore >= 10 && move.winBefore <= 90)
    .map((move) => move.accuracyScore);
  if (values.length < 6) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const harmonic = values.length / values.reduce((sum, value) => sum + 1 / Math.max(value, 1), 0);
  return (mean + harmonic) / 2;
}

function countMoveQualities(moves) {
  const counts = { book: 0, best: 0, great: 0, brilliant: 0, excellent: 0, good: 0, inaccuracy: 0, inexact: 0, mistake: 0, blunder: 0, missed: 0, forced: 0, pending: 0, unknown: 0 };
  moves.forEach((move) => {
    const key = move.quality && Object.prototype.hasOwnProperty.call(counts, move.quality) ? move.quality : "pending";
    counts[key] += 1;
  });
  return counts;
}

function getReportClassificationRows(counts = {}) {
  const safeCounts = counts || {};
  return [
    { key: "brilliant", label: "Brillante", count: safeCounts.brilliant || 0, className: "brilliant" },
    { key: "great", label: "Grande", count: safeCounts.great || 0, className: "great" },
    { key: "best", label: "Migliore", count: (safeCounts.best || 0) + (safeCounts.forced || 0), className: "best" },
    { key: "excellent", label: "Ottima", count: safeCounts.excellent || 0, className: "excellent" },
    { key: "good", label: "Buona", count: safeCounts.good || 0, className: "good" },
    { key: "book", label: "Libro", count: safeCounts.book || 0, className: "book" },
    { key: "inaccuracy", label: "Imprecisione", count: (safeCounts.inaccuracy || 0) + (safeCounts.inexact || 0), className: "inexact" },
    { key: "mistake", label: "Errore", count: safeCounts.mistake || 0, className: "mistake" },
    { key: "missed", label: "Mancata", count: safeCounts.missed || 0, className: "missed" },
    { key: "blunder", label: "Blunder", count: safeCounts.blunder || 0, className: "blunder" }
  ];
}

function formatReviewClassificationCounts(counts = {}) {
  const safeCounts = counts || {};
  const parts = getReportClassificationRows(safeCounts).filter((row) => row.count).map((row) => `${row.count} ${row.label}`);
  if (safeCounts.pending) parts.push(`${safeCounts.pending} non analizzate`);
  return parts.length ? parts.join(", ") : "nessuna";
}

function buildAccuracyBreakdown(counts, moveCount, summary = null) {
  if (!moveCount) return "Precisione: nessuna mossa ancora giocata.";
  const depthText = summary && summary.depth ? ` Analisi ${STOCKFISH_ENGINE_LABEL}, profondita' ${summary.depth}.` : "";
  return `Precisione calcolata con il metodo Lichess: per ogni mossa si misura quanta probabilita' di vittoria perdi rispetto alla mossa migliore, poi si fa la media pesata sui momenti critici. Nessuna correzione manuale.${depthText} Mosse: ${formatReviewClassificationCounts(counts)}.`;
}

function buildChessReportMessage(analysis) {
  const c = analysis.counts;
  const opening = analysis.opening ? `Apertura: ${analysis.opening}. ` : "";
  const majorErrors = c.mistake + c.blunder + c.missed;
  let message;
  if (!analysis.moveCount) message = "Gioca una partita per ottenere una diagnosi completa.";
  else if (analysis.result === "win" && majorErrors >= 2) message = "Hai vinto, ma hai concesso occasioni all'avversario: rivedi gli errori segnati.";
  else if (analysis.result === "loss" && c.blunder > 0) message = "Hai perso per un blunder: nella revisione parti dalla prima mossa rossa.";
  else if (analysis.result === "loss" && analysis.accuracy >= 75 && analysis.botAccuracy > analysis.accuracy) message = "Partita precisa, ma il bot ha mantenuto una qualita' superiore.";
  else if (analysis.result === "win" && analysis.mainPattern && analysis.mainPattern.key === "development") message = "Hai vinto, ma la fase di apertura e' stata debole.";
  else if (analysis.result === "win" && analysis.accuracy >= 80) message = "Vittoria di qualita': poche concessioni e mosse decisive corrette.";
  else if (!analysis.mainPattern) message = "Partita pulita: nessun pattern critico nella partita.";
  else message = `Pattern principale: ${analysis.mainPattern.label}. La priorita' e' ridurre questo errore nella prossima partita.`;
  return `${opening}${message}`;
}

async function analyzeCurrentGameWithEngine(depth = CHESS_REVIEW_DEPTH) {
  return analyzeGame(null, { depth });
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
  const gameId = currentGame.id;
  const moveCount = moves.length;
  const outdated = () => currentGame.id !== gameId || currentGame.moves.length !== moveCount;
  currentGame.reviewFailed = false;
  currentGame.engineError = null;
  setChessReviewStatus("analyzing", createStableReviewResult({ status: "analyzing" }));
  currentGame.engineReviewConfig = { depth, multipv: CHESS_REVIEW_MULTIPV, requestedAt: new Date().toISOString(), source: pgn ? "pgn" : "current-game" };
  const ready = await ensureStockfishReadyForChess();
  if (!ready) {
    currentGame.reviewFailed = true;
    currentGame.engineError = currentGame.engineError || STOCKFISH_REQUIRED_NOTICE;
    setReviewProgress(currentGame.engineError);
    return setChessReviewStatus("error", { error: currentGame.engineError, summary: null, engineAnalysis: [], moveClassifications: {}, drills: [] });
  }
  const review = await ChessReview.reviewGame(moves, {
    engine: chessEngines().review,
    depth,
    multipv: CHESS_REVIEW_MULTIPV,
    cache: chessAnalysisCache,
    onProgress: (done, total) => {
      if (!outdated()) setReviewProgress(`Stockfish analizza la posizione ${done} di ${total}...`);
    },
    isCancelled: outdated,
    finalDraw: chessGameOver && ["repetition", "fifty", "insufficient"].includes(currentGame.endReason)
  });
  if (outdated()) {
    // La partita e' andata avanti nel frattempo: questa revisione non vale piu'.
    if (currentGame.id === gameId) {
      currentGame.engineAnalysisInProgress = false;
      if (chessGameOver && currentGame.reviewStatus !== "completed") queueEngineReviewAnalysis(true);
    }
    return createStableReviewResult({ status: "cancelled" });
  }
  if (!review.ok) {
    currentGame.reviewFailed = true;
    currentGame.engineError = review.error || "Stockfish non ha completato l'analisi";
    setReviewProgress(`Errore durante l'analisi: ${currentGame.engineError}`);
    return setChessReviewStatus("error", { error: currentGame.engineError, engineAnalysis: [], moveClassifications: {}, drills: [], summary: null });
  }
  applyReviewToMoves(moves, review);
  currentGame.reviewSummary = review.summary;
  rebuildCurrentGamePatterns();
  renderMistakes();
  renderModuleStatus("chess");
  currentGame.reviewStatus = "completed";
  const analysis = buildGameAnalysis(currentGame.result || "partial", currentGame.endReason || null);
  if (chessGameOver && !currentGame.skillsUpdated) {
    updateChessProfileFromReview(analysis, moves);
    currentGame.skillsUpdated = true;
  }
  const reviewResult = setChessReviewStatus("completed", {
    completed: true,
    engineBased: analysis.engineBased,
    engineAnalysis: moves.map((move) => move.engineAnalysis),
    moveClassifications: analysis.counts || {},
    drills: analysis.exerciseObjects || [],
    summary: analysis,
    error: null
  });
  queueSupabaseGameSave("engine-review", analysis);
  queueSupabaseAnalysisSave(analysis);
  setReviewProgress("Revisione Stockfish completata.");
  return reviewResult;
}

// Copia i risultati della revisione dentro i record delle mosse (usati dall'interfaccia).
function applyReviewToMoves(moves, review) {
  review.moves.forEach((result, index) => {
    const move = moves[index];
    if (!move) return;
    move.engineAnalysis = { ok: true, depth: result.depth };
    move.quality = result.quality;
    move.classification = result.label;
    move.loss = Math.round(result.loss * 10) / 10;
    move.epLoss = result.loss / 100;
    move.accuracyScore = result.accuracy;
    move.winBefore = result.winBefore;
    move.winBest = result.winBest;
    move.winSecond = result.winSecond;
    move.winAfter = result.winAfter;
    move.bestMoveUci = result.bestUci;
    move.bestMoveText = result.bestSan ? ChessAnalysis.figurine(result.bestSan) : "-";
    move.variation = result.bestLine || "-";
    move.playedLine = result.refutationLine || "-";
    move.refutation = result.refutationSan;
    move.evalBefore = result.evalBeforeWhite;
    move.evalAfter = result.evalAfterWhite;
    move.evalDiff = result.evalAfterWhite - result.evalBeforeWhite;
    move.categories = result.patterns.slice();
    move.pattern = result.patterns[0] || null;
    move.drill = move.pattern ? mistakeDrills[move.pattern] : isErrorQuality(move.quality) ? "Rivedi la posizione: trova 3 candidate e la risposta piu' forzante dell'avversario." : "-";
    move.comment = result.comment;
    move.note = result.comment;
    move.opening = result.opening;
    move.phase = result.phase;
    move.reviewMeta = { engine: STOCKFISH_ENGINE_LABEL, depth: result.depth, multipv: CHESS_REVIEW_MULTIPV };
  });
}

// Aggiorna il profilo scacchi (esagono, statistiche livello) con i dati reali della partita.
function updateChessProfileFromReview(analysis, moves) {
  const playerMoves = moves.filter((move) => move.side === "Bianco" && move.engineAnalysis && move.engineAnalysis.ok);
  if (!analysis.engineBased || !playerMoves.length) return;
  const level = getActiveBotLevel(currentGame.botLevel || state.chess.botLevel || 1);
  const stats = getLevelStats(level);
  stats.accuracySum += analysis.accuracy;
  stats.accuracyGames += 1;
  state.chess.lastAccuracy = analysis.accuracy;
  state.chess.recentGames = (state.chess.recentGames || []).concat([{
    date: currentGame.date,
    botLevel: level,
    botElo: analysis.botElo,
    result: analysis.result,
    accuracy: analysis.accuracy,
    botAccuracy: analysis.botAccuracy,
    gameRating: analysis.gameRating,
    opening: analysis.opening,
    moves: playerMoves.length,
    rated: Boolean(currentGame.rated),
    assisted: Boolean(currentGame.assisted)
  }]).slice(-30);

  playerMoves.forEach((move) => {
    (move.categories || []).forEach((category) => {
      state.mistakeCounts[category] = (state.mistakeCounts[category] || 0) + 1;
      addModulePattern("chess", category);
    });
  });
  // Partita valutata: la precisione entra nei requisiti del grado.
  if (currentGame.rated && currentGame.ratingRecorded && window.ChessRating) {
    state.chess.rating = ChessRating.attachAccuracy(state.chess.rating, currentGame.id, analysis.accuracy);
  }
  if (window.addMistakesToBank) addMistakesToBank(moves, currentGame.id);

  // Profilo a categorie: ogni errore e ogni mossa buona ha una categoria.
  if (playerMoves.length >= 5 && window.ChessSkills) {
    const gradeBefore = window.chessCertifiedGrade ? chessCertifiedGrade() : null;
    const events = ChessSkills.gameEvents(moves, { color: "w", result: analysis.result, reason: currentGame.endReason });
    const weight = currentGame.rated ? 1 : currentGame.assisted ? 0.5 : 0.7;
    const applied = ChessSkills.applyGame(state.chess.skills, events, { botElo: analysis.botElo, weight, result: analysis.result, date: currentGame.date });
    state.chess.skills = applied.skills;
    currentGame.skillChanges = applied.changes;
    state.chess.skillGames = (state.chess.skillGames || []).concat([{
      gameId: currentGame.id,
      date: currentGame.date,
      botElo: analysis.botElo,
      result: analysis.result,
      rated: Boolean(currentGame.rated),
      events: events.filter((event) => event.moveNumber !== null).map((event) => ({ category: event.category, points: event.points, label: event.label, moveNumber: event.moveNumber }))
    }]).slice(-20);
    // Il profilo puo' essere l'ultimo requisito mancante per un grado.
    const gradeAfter = window.chessCertifiedGrade ? chessCertifiedGrade() : null;
    if (gradeBefore && gradeAfter && ChessRating.gradeIndex(gradeAfter.key) > ChessRating.gradeIndex(gradeBefore.key)) currentGame.promotedTo = gradeAfter;
  }
  saveState();
  renderDashboard();
  renderBotLevel();
  if (window.renderChessGradeChip) renderChessGradeChip();
  if (window.renderChessMentor) renderChessMentor();
}

function setReviewProgress(message) {
  const gameBox = document.getElementById("gameAnalysis");
  const coach = document.getElementById("coachMessage");
  if (gameBox) gameBox.textContent = message;
  if (coach) coach.textContent = message;
}

function oppositeColor(color) {
  return color === "w" ? "b" : "w";
}

function queueEngineReviewAnalysis(fromFinish = false) {
  const moves = getSafeChessMoves();
  if (!moves.length || currentGame.engineAnalysisInProgress) return;
  if (currentGame.reviewStatus === "completed" && moves.every((move) => move?.engineAnalysis)) return;
  setChessReviewStatus("analyzing", currentGame.reviewResult || createStableReviewResult({ status: "analyzing" }));
  const gameId = currentGame.id;
  analyzeCurrentGameWithEngine().then((reviewResult) => {
    if (currentGame.id !== gameId || reviewResult?.status === "cancelled") return;
    const analysis = reviewResult?.summary || buildGameAnalysis(currentGame.result || "partial", currentGame.endReason || null);
    if (reviewResult?.status === "completed" && analysis.engineBased) renderMoveReview(fromFinish, analysis);
    else {
      renderGameReport(analysis);
      const gameBox = document.getElementById("gameAnalysis");
      if (gameBox) gameBox.textContent = currentGame.engineError || "Errore: Stockfish non ha risposto.";
      const drillBox = document.getElementById("chessDrill");
      if (drillBox) drillBox.textContent = "Drill non generati: la revisione Stockfish non e' stata completata.";
    }
  }).catch((error) => {
    currentGame.engineError = error.message || String(error);
    setChessReviewStatus("error", { error: currentGame.engineError, engineAnalysis: [], moveClassifications: {}, drills: [] });
    setReviewProgress(`Errore durante l'analisi: ${currentGame.engineError}`);
    renderBotLevel();
  });
}

// Analizza in background ogni nuova posizione: a fine partita la revisione e' quasi pronta.
function queueBackgroundAnalysis(fen) {
  const engines = chessEngines();
  if (!engines || !fen) return;
  ChessReview.analysePosition(engines.review, fen, { depth: CHESS_REVIEW_DEPTH, multipv: CHESS_REVIEW_MULTIPV, cache: chessAnalysisCache }).catch(() => {});
}

function renderMoveReview(fromFinish = false, analysis = null) {
  // In una partita valutata ancora in corso Stockfish non deve aiutare.
  if (currentGame.rated && !chessGameOver) {
    if (window.coachSay) coachSay("L'analisi con Stockfish si apre a fine partita: in una partita valutata non ci sono aiuti.");
    return;
  }
  if (window.chessCoachBlocking && window.chessCoachBlocking()) return;
  const gameAnalysis = analysis || buildGameAnalysis(chessGameOver ? currentGame.result || "partial" : "partial", currentGame.endReason || null);
  renderGameReport(gameAnalysis);
  const statusMessage = getReviewStatusMessage(gameAnalysis.reviewStatus || currentGame.reviewStatus);
  const accuracyText = gameAnalysis.engineBased && typeof gameAnalysis.accuracy === "number" ? `${gameAnalysis.accuracy}%` : "--";
  const sourceText = gameAnalysis.engineBased ? `Analisi ${STOCKFISH_ENGINE_LABEL}.` : statusMessage || "La revisione Stockfish partira' a breve.";
  document.getElementById("reviewAccuracy").textContent = accuracyText;
  updateReviewSparklineActive();
  updateReviewKeyFilterButton();
  const errors = gameAnalysis.engineBased
    ? gameAnalysis.topErrors.length ? gameAnalysis.topErrors.map(([category, count]) => `${mistakeLabels[category]} (${count})`).join(", ") : "nessun errore grave rilevato"
    : "in attesa di Stockfish";
  const breakdown = gameAnalysis.engineBased ? gameAnalysis.accuracyBreakdown : statusMessage || "La precisione verra' mostrata solo dopo analisi Stockfish.";
  const exercises = gameAnalysis.engineBased ? gameAnalysis.exercises : ["Attendi il completamento dell'analisi motore per vedere pattern e drill reali."];
  const openingText = gameAnalysis.opening ? `Apertura: ${gameAnalysis.opening}.<br>` : "";
  document.getElementById("gameAnalysis").innerHTML = `<strong>${gameAnalysis.resultLabel}</strong><br>${openingText}${sourceText} Precisione: ${accuracyText}. Errori principali: ${errors}.<br>${breakdown}<ul class="plan-steps">${exercises.map((item) => `<li>${item}</li>`).join("")}</ul>`;
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
  button.className = `move-review-item ${qualityClass} side-${move.side === "Bianco" ? "w" : "b"}`;
  const number = move.side === "Bianco" ? `${move.moveNumber}.` : `${move.moveNumber}...`;
  const evalText = move.engineAnalysis && move.engineAnalysis.ok ? formatEngineEval(move.evalAfter) : "";
  button.innerHTML = `
    <span class="move-quality-icon ${qualityClass}" aria-hidden="true">${meta.icon}</span>
    <span class="move-review-notation"><span class="mr-no">${number}</span> ${window.chessSanHtml ? chessSanHtml(move.san || move.move, move.side === "Bianco" ? "w" : "b") : ChessAnalysis.figurine(move.san || move.move)}</span>
    <span class="move-review-classification">${move.classification || meta.label}</span>
    <span class="move-review-eval">${evalText}</span>`;
  button.title = buildShortReviewComment(move);
  return button;
}

function renderGameReport(gameAnalysis) {
  const result = document.getElementById("chessReportResult");
  if (!result) return;
  const statusMessage = getReviewStatusMessage(gameAnalysis.reviewStatus || currentGame.reviewStatus);
  const setText = (id, text) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  };
  setText("playerAccuracy", gameAnalysis.engineBased && typeof gameAnalysis.accuracy === "number" ? `${gameAnalysis.accuracy}%` : "--");
  setText("botAccuracy", gameAnalysis.engineBased && typeof gameAnalysis.botAccuracy === "number" ? `${gameAnalysis.botAccuracy}%` : "--");
  setText("reportBotLevel", getBotLevelConfig(gameAnalysis.botLevel).name);
  setText("reportBotElo", `${gameAnalysis.botEloLabel || gameAnalysis.botElo} Elo`);
  setText("reportGameRating", gameAnalysis.engineBased && gameAnalysis.gameRating ? `${gameAnalysis.gameRating}` : "--");
  setText("reportPhase", gameAnalysis.phase || "--");
  setText("reportMoveCount", String(gameAnalysis.moveCount));
  setText("reviewResultText", gameAnalysis.resultLabel || "--");
  setText("reviewBotName", `Bot ${gameAnalysis.botElo}`);
  const counts = gameAnalysis.engineBased ? gameAnalysis.counts || {} : {};
  const botCounts = gameAnalysis.engineBased ? gameAnalysis.botCounts || countMoveQualities(getSafeChessMoves().filter((move) => move.side === "Nero")) : {};
  const table = document.getElementById("moveClassificationCounts");
  if (table) {
    const rows = [
      ["brilliant", "Brillante", ["brilliant"]],
      ["great", "Grande", ["great"]],
      ["best", "Migliore", ["best", "forced"]],
      ["excellent", "Ottima", ["excellent"]],
      ["good", "Buona", ["good"]],
      ["book", "Libro", ["book"]],
      ["inexact", "Imprecisione", ["inexact", "inaccuracy"]],
      ["mistake", "Errore", ["mistake"]],
      ["missed", "Mancata", ["missed"]],
      ["blunder", "Blunder", ["blunder"]]
    ];
    const sum = (source, keys) => keys.reduce((total, key) => total + (Number(source[key]) || 0), 0);
    table.innerHTML = gameAnalysis.engineBased
      ? rows.map(([cls, label, keys]) => `<div class="class-row ${cls}"><b>${sum(counts, keys)}</b><span><i class="q-dot ${cls}">${getMoveQualityMeta(keys[0]).icon}</i>${label}</span><b>${sum(botCounts, keys)}</b></div>`).join("")
      : `<p class="class-empty">${statusMessage || "Le classificazioni arrivano con l'analisi di Stockfish."}</p>`;
  }
  setText("accuracyBreakdown", gameAnalysis.engineBased ? gameAnalysis.accuracyBreakdown : statusMessage || "Analisi Stockfish in attesa.");
  setText("reportMainPattern", gameAnalysis.engineBased && gameAnalysis.mainPattern ? `Pattern principale: ${gameAnalysis.mainPattern.label} (${gameAnalysis.mainPattern.count})` : gameAnalysis.engineBased ? "Pattern principale: nessun pattern critico nella partita." : "Pattern principale: in attesa di Stockfish.");
  setText("chessReportMessage", gameAnalysis.engineBased ? gameAnalysis.message : statusMessage || "Il report finale arriva con l'analisi di Stockfish.");
  const startBtn = document.getElementById("startReviewFromReportBtn");
  if (startBtn) startBtn.hidden = Boolean(gameAnalysis.engineBased) || !getSafeChessMoves().length;
  const reviewPanel = document.getElementById("panel-review");
  if (reviewPanel) reviewPanel.classList.toggle("is-empty", !gameAnalysis.engineBased);
  const sparkline = document.getElementById("reviewEvalSparkline");
  if (sparkline && !gameAnalysis.engineBased) sparkline.innerHTML = buildEvalSparkline([0], null, []);
}

function buildEvalSparkline(values, activeIndex = null, moves = []) {
  const width = 360;
  const height = 120;
  const padding = 12;
  const safeValues = values.length ? values : [0];
  const coordinates = safeValues.map((value, index) => {
    const x = safeValues.length === 1 ? width / 2 : padding + (index / (safeValues.length - 1)) * (width - padding * 2);
    // Asse verticale = probabilita' di vittoria del Bianco (come il grafico di chess.com).
    const win = ChessAnalysis.winPercent(value || 0);
    const y = height / 2 - ((win - 50) / 50) * (height / 2 - padding);
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
  // Area chiara = vantaggio del Bianco, fondo scuro = Nero (stile chess.com).
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  const areaPoints = [`0,${height}`, `0,${first.y.toFixed(1)}`, points, `${width},${last.y.toFixed(1)}`, `${width},${height}`].join(" ");
  return `
    <polygon points="${areaPoints}" class="eval-sparkline-area"></polygon>
    <line x1="0" y1="${height / 2}" x2="${width}" y2="${height / 2}" class="eval-sparkline-mid"></line>
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
    setReviewQualityIcon(null);
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
  document.getElementById("reviewMoveTitle").textContent = `${move.moveNumber}. ${move.side} ${ChessAnalysis.figurine(move.san || move.move)} - ${move.classification}`;
  document.getElementById("reviewCoachPanel").textContent = buildDetailedReviewComment(move);
  document.getElementById("reviewBestMove").textContent = move.bestMoveText || "-";
  document.getElementById("reviewBestDiff").textContent = formatBestMoveDiff(move);
  document.getElementById("reviewVariation").textContent = move.variation || "-";
  document.getElementById("reviewPattern").textContent = move.pattern ? mistakeLabels[move.pattern] : "-";
  document.getElementById("reviewDrill").textContent = move.drill || "-";
  document.getElementById("reviewMeta").textContent = formatReviewMeta(move);
  setReviewQualityIcon(move);
  updateReviewEvalBar(move.evalAfter || 0);
  updateReviewActiveItem();
  updateReviewSparklineActive(currentGame.reviewIndex + 1);
  renderBoard();
}

function setReviewQualityIcon(move) {
  const icon = document.getElementById("reviewQualityIcon");
  if (!icon) return;
  if (!move || !move.engineAnalysis || !move.engineAnalysis.ok) {
    icon.className = "review-quality-icon";
    icon.textContent = move ? "\u2026" : "\u25b6";
    return;
  }
  const cls = reviewQualityClass(move.quality);
  icon.className = `review-quality-icon ${cls}`;
  icon.textContent = getMoveQualityMeta(move.quality).icon;
}

function updateReviewSparklineActive(activeIndex = null) {
  const sparkline = document.getElementById("reviewEvalSparkline");
  if (!sparkline) return;
  const reviewMoves = getSafeChessMoves();
  const series = [reviewMoves.length ? reviewMoves[0].evalBefore || 0 : 0].concat(reviewMoves.map((move) => move.evalAfter || 0));
  const index = typeof activeIndex === "number" ? activeIndex : currentGame.reviewIndex >= 0 ? currentGame.reviewIndex + 1 : null;
  sparkline.innerHTML = buildEvalSparkline(series, index, getSafeChessMoves());
}

function formatBestMoveDiff(move) {
  if (!move || !move.engineAnalysis || !move.engineAnalysis.ok) return "-";
  if (!move.loss) return "nessuna perdita";
  return `-${move.loss.toFixed(1)} punti di probabilita' di vittoria`;
}

function formatReviewMeta(move) {
  const meta = move && move.reviewMeta;
  if (!meta) return "Revisione non ancora eseguita";
  const accuracy = typeof move.accuracyScore === "number" ? ` · precisione mossa ${move.accuracyScore}%` : "";
  return `${meta.engine || STOCKFISH_ENGINE_LABEL} · profondita' ${meta.depth || "-"} · ${meta.multipv || 1} linee${accuracy}`;
}

function buildDetailedReviewComment(move) {
  if (!move) return "Analisi in corso o non disponibile.";
  if (!move.engineAnalysis || !move.engineAnalysis.ok) return move.comment || "Questa mossa non e' ancora stata analizzata da Stockfish.";
  const lines = [move.comment];
  if (typeof move.winBefore === "number") {
    const who = move.side === "Bianco" ? "tua" : "del bot";
    lines.push(`Probabilita' di vittoria ${who}: ${Math.round(move.winBefore)}% prima, ${Math.round(move.winAfter)}% dopo. Precisione della mossa: ${move.accuracyScore}%.`);
  }
  if (move.refutation && isErrorQuality(move.quality)) lines.push(`Risposta che punisce la mossa: ${ChessAnalysis.figurine(move.refutation)}${move.playedLine && move.playedLine !== "-" ? ` (${move.playedLine})` : ""}.`);
  lines.push(`Cosa imparare: ${reviewLearningText(move)}`);
  return lines.join("\n");
}

function reviewLearningText(move) {
  if (move.pattern) return `${patternShortReason(move.pattern)}. ${move.drill || mistakeDrills[move.pattern] || "Calcola candidate, minacce e risposta forzante prima di muovere."}`;
  if (move.quality === "best") return "conserva il processo: candidate, minaccia avversaria, verifica tattica, poi mossa.";
  if (move.quality === "book") return "memorizza il piano dietro l'apertura, non solo la mossa.";
  if (move.quality === "great") return "salva questa posizione: il punto era trovare la risorsa critica, non la mossa naturale.";
  if (move.quality === "brilliant") return "riguarda la posizione e trova quale pezzo era sacrificabile e quale minaccia nasceva dopo.";
  if (move.quality === "good" || move.quality === "excellent") return "nota quali fattori migliorano la posizione: sviluppo, sicurezza re, pressione o difesa.";
  return "prima della prossima mossa confronta 2 candidate e cerca la risposta piu' forzante dell'avversario.";
}

function buildShortReviewComment(move) {
  if (!move.engineAnalysis || !move.engineAnalysis.ok) return move.comment || move.note || "Mossa registrata.";
  if (move.quality === "book") return move.opening ? `Libro: ${move.opening}.` : "Libro: linea di apertura conosciuta.";
  if (move.quality === "forced") return "Forzata: era l'unica mossa legale.";
  if (move.quality === "best") return "Migliore: la scelta di Stockfish.";
  if (move.quality === "great") return "Grande: l'unica mossa che teneva la posizione.";
  if (move.quality === "brilliant") return "Brillante: sacrificio corretto.";
  if (move.quality === "excellent") return "Ottima: quasi equivalente alla migliore.";
  if (move.quality === "good") return `Buona: perdi poco (${move.loss.toFixed(1)} punti).`;
  const reason = move.pattern ? patternShortReason(move.pattern) : "la posizione peggiora";
  if (move.quality === "inexact" || move.quality === "inaccuracy") return `Imprecisione: ${reason}.`;
  if (move.quality === "mistake") return `Errore: ${reason}.`;
  if (move.quality === "blunder") return `Blunder: ${reason}.`;
  if (move.quality === "missed") return `Mossa mancata: c'era ${move.bestMoveText || "una mossa"} per sfruttare l'errore avversario.`;
  return move.comment || "Mossa registrata.";
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
  if (quality === "best" || quality === "forced") return "best";
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
  const width = clamp(ChessAnalysis.winPercent(score || 0), 3, 97);
  fill.style.width = `${width}%`;
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
  const box = document.getElementById("coachMessage");
  if (!box) return;
  const status = gameAnalysis?.reviewStatus || currentGame.reviewStatus || "idle";
  const statusMessage = getReviewStatusMessage(status);
  if (statusMessage && status !== "completed") {
    box.textContent = statusMessage;
    return;
  }
  if (!gameAnalysis || !gameAnalysis.engineBased) return;
  const moves = getSafeChessMoves().filter((move) => move.side === "Bianco" && move.engineAnalysis && move.engineAnalysis.ok);
  const good = moves.filter((move) => ["brilliant", "great", "best"].includes(move.quality));
  const worst = moves.filter((move) => isErrorQuality(move.quality)).sort((a, b) => (b.loss || 0) - (a.loss || 0))[0];
  const parts = [`${gameAnalysis.resultLabel}. Precisione ${gameAnalysis.accuracy}%${gameAnalysis.gameRating ? `, hai giocato come un ${gameAnalysis.gameRating}` : ""}.`];
  if (currentGame.promotedTo) parts.unshift(`Nuovo grado ${currentGame.promotedTo.key}: ${currentGame.promotedTo.name}!`);
  if (good.length) parts.push(`${good.length} mosse da Migliore o meglio: bene.`);
  let actions = [];
  if (worst) {
    parts.push(`Il momento chiave e' la mossa ${worst.moveNumber} (${ChessAnalysis.figurine(worst.san)}): ${buildShortReviewComment(worst).toLowerCase()}`);
    const lessonId = worst.pattern && window.ChessLessons ? ChessLessons.PATTERN_LESSONS[worst.pattern] : null;
    const lesson = lessonId ? ChessLessons.byId(lessonId) : null;
    if (lesson) {
      parts.push(`Ti consiglio la lezione "${lesson.title}".`);
      actions.push({ label: "Apri la lezione", primary: true, onClick: () => { setChessTab("learn"); ChessLearn.openLesson(lesson.id); } });
    }
    actions.push({ label: "Vedi la mossa", onClick: () => { setChessTab("review"); selectReviewMove(currentGame.moves.indexOf(worst)); } });
  } else {
    parts.push("Nessun errore grave: continua cosi' e prova un bot piu' forte.");
  }
  if (currentGame.skillChanges && window.ChessSkills) {
    const changed = ChessSkills.CATEGORIES
      .map((category) => [category.label, currentGame.skillChanges[category.key] || 0])
      .filter(([, delta]) => Math.abs(delta) >= 0.5)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 3)
      .map(([label, delta]) => `${label} ${delta > 0 ? "+" : ""}${Math.round(delta)}`);
    if (changed.length) parts.push(`Profilo: ${changed.join(", ")}.`);
  }
  if (window.coachSay) coachSay(parts.join(" "), actions);
  else box.textContent = parts.join(" ");
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
  feedback.textContent = `Soluzione: ${exercise.correct_move_san || exercise.correct_move}. ${exercise.explanation}`;
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
    feedback.textContent = `Corretto: ${exercise.correct_move_san || exercise.correct_move}. ${exercise.explanation}`;
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
  if (state.chess.botLevel !== level) {
    state.chess.botLevel = level;
    saveState();
  }
  if (window.renderBotPicker) renderBotPicker();
}

// Selettore del livello anche dentro il report partita.
function ensureReportBotLevelSelect(level) {
  const reportValue = document.getElementById("reportBotLevel");
  if (!reportValue) return;
  reportValue.style.display = "none";
  let select = document.getElementById("reportBotLevelSelect");
  if (!select) {
    select = document.createElement("select");
    select.id = "reportBotLevelSelect";
    select.className = "bot-level-report-select";
    select.setAttribute("aria-label", "Scegli livello bot");
    select.addEventListener("change", () => applyBotLevel(select.value));
    reportValue.insertAdjacentElement("afterend", select);
  }
  const options = botLevels.map((item) => `<option value="${item.level}">Livello ${item.level} - ${item.name} - ${item.estimatedElo} Elo</option>`).join("");
  if (select.dataset.optionsKey !== String(botLevels.length)) {
    select.innerHTML = options;
    select.dataset.optionsKey = String(botLevels.length);
  }
  select.value = String(level);
}

function applyBotLevel(value) {
  const level = getActiveBotLevel(Number(value));
  state.chess.botLevel = level;
  saveState();
  resetChess();
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
  applyBotLevel(event.target.value);
}

function getBotProfile(level) {
  const profiles = getAvailableBotProfiles();
  return profiles[getActiveBotLevel(level)] || profiles[1];
}

function getBotLevelConfig(level) {
  return ChessBot.getLevel(getActiveBotLevel(level));
}

function getLevelStats(level) {
  if (!state.chess.levelStats) state.chess.levelStats = {};
  const key = String(getActiveBotLevel(level));
  const defaults = { games: 0, wins: 0, losses: 0, draws: 0, accuracySum: 0, accuracyGames: 0 };
  state.chess.levelStats[key] = { ...defaults, ...(state.chess.levelStats[key] || {}) };
  return state.chess.levelStats[key];
}

function chessEngines() {
  return typeof window !== "undefined" ? window.ChessEngines || null : null;
}

function isStockfishEngineEnabled() {
  const engines = chessEngines();
  return Boolean(STOCKFISH_ENGINE_ENABLED && engines && engines.play.ready);
}

function isStockfishEngineInitializing() {
  const engines = chessEngines();
  return Boolean(engines && engines.play.initPromise && !engines.play.ready && !engines.play.error);
}

function getEngineStatusText() {
  const engines = chessEngines();
  if (!engines) {
    return typeof window !== "undefined" && window.location && window.location.protocol === "file:"
      ? "non disponibile: il sito va aperto da http://localhost:8765, non con doppio click sul file"
      : "non disponibile in questo browser";
  }
  if (engines.play.ready) return `${engines.play.name} pronto`;
  if (engines.play.error) return `non disponibile (${engines.play.error})`;
  return "in caricamento...";
}

function initEngine() {
  const engines = chessEngines();
  if (!engines) {
    renderBotLevel();
    return Promise.resolve({ ok: false, error: getEngineStatusText() });
  }
  const initPromise = Promise.all([engines.play.init(), engines.review.init()]).then(([play]) => play);
  renderBotLevel();
  return initPromise.then((result) => {
    if (result && result.ok && currentGame && currentGame.moves && !currentGame.moves.length) syncCurrentGameBotLevel();
    renderBotLevel();
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

async function ensureStockfishReadyForChess() {
  if (isStockfishEngineEnabled()) return true;
  const result = await initEngine();
  if (!result || !result.ok) currentGame.engineError = result && result.error ? result.error : getEngineStatusText();
  return Boolean(result && result.ok);
}

function moveFromUci(uci, legalMoves) {
  const chessMove = uciToChessMove(uci);
  if (!chessMove) return null;
  const fromCol = chessMove.from.charCodeAt(0) - 97;
  const fromRow = 8 - Number(chessMove.from[1]);
  const toCol = chessMove.to.charCodeAt(0) - 97;
  const toRow = 8 - Number(chessMove.to[1]);
  const found = legalMoves.find((move) => move.fromRow === fromRow && move.fromCol === fromCol && move.toRow === toRow && move.toCol === toCol) || null;
  if (found && chessMove.promotion) return { ...found, promotion: chessMove.promotion };
  return found;
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
  const promoted = (move.promotion || "q").toLowerCase();
  next[move.toRow][move.toCol] = piece.toLowerCase() === "p" && move.toRow === promotionRow ? (isWhite(piece) ? promoted.toUpperCase() : promoted) : piece;
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

// Tocca al Nero (il bot): il giocatore non puo' muovere ne' annullare finche' il bot non risponde.
function isBotTurn() {
  return currentGame.moves.length % 2 === 1;
}

function clearBotTimer() {
  if (botMoveTimer) {
    window.clearTimeout(botMoveTimer);
    botMoveTimer = null;
  }
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
