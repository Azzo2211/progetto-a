/*
 * Progetto A - Scacchi: livelli del bot e scelta della mossa.
 *
 * Come gioca il bot:
 *  1. Stockfish 17.1 analizza la posizione e restituisce le migliori N mosse
 *     con la loro valutazione.
 *  2. Ogni mossa viene convertita in "punti di probabilita' di vittoria persi"
 *     rispetto alla migliore (stessa scala usata dalla revisione).
 *  3. Per ogni mossa il bot decide, con probabilita' fissate per il suo livello,
 *     se giocare bene oppure commettere un'imprecisione, un errore o un blunder.
 *     L'errore e' scelto tra le mosse che perdono esattamente quella quota di
 *     probabilita' di vittoria: cosi' un 1300 sbaglia come un 1300 vero, e un
 *     2400 non regala mai pezzi a caso.
 *
 * I parametri sono calibrati facendo giocare i bot tra loro e misurando la
 * precisione con la stessa formula della revisione: ogni livello gioca con la
 * precisione tipica di un giocatore umano di quell'Elo.
 * Ai livelli alti non esistono mosse casuali: il bot non regala pezzi.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ChessBot = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  function analysis() {
    if (root.ChessAnalysis) return root.ChessAnalysis;
    if (typeof require === "function") return require("./analysis-core.js");
    throw new Error("ChessAnalysis non caricato");
  }

  /*
   * Parametri di ogni livello:
   *  depth / multipv / movetime  ricerca di Stockfish (multipv alto = il bot "vede" anche le mosse cattive)
   *  errors       probabilita' per mossa di commettere:
   *                 blunder    (perdita >= 20 punti di probabilita' di vittoria)
   *                 mistake    (perdita 10-20)
   *                 inaccuracy (perdita 4-10)
   *  spread       quanto possono essere gravi i blunder (piu' alto = piu' pezzi regalati)
   *  temperature  varieta' tra le mosse quasi equivalenti (0 = sempre la migliore)
   *  random       probabilita' di una mossa legale qualsiasi (solo primi livelli)
   *  book         usa le aperture del libro nelle prime mosse
   */
  // Frequenza degli errori per mossa (blunder, errore, imprecisione) nei punti
  // di riferimento; i livelli intermedi sono interpolati. Valori calibrati con
  // partite bot contro bot misurate con la stessa precisione della revisione.
  const ERROR_ANCHORS = [
    { elo: 250, blunder: 0.34, mistake: 0.32, inaccuracy: 0.28, spread: 70 },
    { elo: 1300, blunder: 0.085, mistake: 0.145, inaccuracy: 0.26, spread: 28 },
    { elo: 2000, blunder: 0.038, mistake: 0.09, inaccuracy: 0.215, spread: 18 },
    { elo: 2600, blunder: 0.016, mistake: 0.055, inaccuracy: 0.18, spread: 10 },
    { elo: 3000, blunder: 0.005, mistake: 0.03, inaccuracy: 0.13, spread: 6 }
  ];

  function interpolateErrors(elo) {
    if (elo > ERROR_ANCHORS[ERROR_ANCHORS.length - 1].elo) return { errors: { blunder: 0, mistake: 0, inaccuracy: 0 }, spread: 0 };
    let i = 1;
    while (i < ERROR_ANCHORS.length - 1 && elo > ERROR_ANCHORS[i].elo) i += 1;
    const a = ERROR_ANCHORS[i - 1];
    const b = ERROR_ANCHORS[i];
    const t = Math.min(1, Math.max(0, (elo - a.elo) / (b.elo - a.elo)));
    const geo = (x, y) => Math.exp(Math.log(x) + (Math.log(y) - Math.log(x)) * t);
    const lin = (x, y) => x + (y - x) * t;
    return {
      errors: { blunder: geo(a.blunder, b.blunder), mistake: geo(a.mistake, b.mistake), inaccuracy: lin(a.inaccuracy, b.inaccuracy) },
      spread: lin(a.spread, b.spread)
    };
  }

  const LEVELS = [
    { level: 1, elo: 250, name: "Principiante assoluto", description: "Ha appena imparato le regole: lascia pezzi in presa spesso.", depth: 6, multipv: 40, temperature: 3, random: 0.22, book: false },
    { level: 2, elo: 400, name: "Novizio", description: "Vede le catture semplici, non le minacce dell'avversario.", depth: 6, multipv: 40, temperature: 3, random: 0.1, book: false },
    { level: 3, elo: 550, name: "Base", description: "Sviluppa poco e calcola una sola mossa avanti.", depth: 6, multipv: 40, temperature: 2.8, random: 0.03, book: false },
    { level: 4, elo: 700, name: "Principiante", description: "Mosse naturali, tattica ancora fragile.", depth: 6, multipv: 40, temperature: 2.6, random: 0, book: false },
    { level: 5, elo: 850, name: "Intermedio basso", description: "Meno pezzi regalati, piani ancora instabili.", depth: 8, multipv: 40, temperature: 2.4, random: 0, book: false },
    { level: 6, elo: 1000, name: "Intermedio", description: "Conosce le aperture principali, sbaglia nei cambi e nei finali.", depth: 8, multipv: 40, temperature: 2.2, random: 0, book: true },
    { level: 7, elo: 1150, name: "Giocatore da circolo", description: "Manca tattiche di 2-3 mosse e piani lunghi.", depth: 8, multipv: 40, temperature: 2, random: 0, book: true },
    { level: 8, elo: 1300, name: "Intermedio forte", description: "Gioco solido, qualche svista tattica a partita.", depth: 8, multipv: 40, temperature: 1.9, random: 0, book: true },
    { level: 9, elo: 1450, name: "Club", description: "Sa giocare, ma non ha la precisione di un esperto.", depth: 10, multipv: 30, temperature: 1.8, random: 0, book: true },
    { level: 10, elo: 1600, name: "Club forte", description: "Forte, con imprecisioni strategiche reali.", depth: 10, multipv: 30, temperature: 1.6, random: 0, book: true },
    { level: 11, elo: 1800, name: "Avanzato", description: "Scelte quasi sempre sane, raramente regala qualcosa.", depth: 10, multipv: 30, temperature: 1.4, random: 0, book: true },
    { level: 12, elo: 2000, name: "Esperto", description: "Molto preciso: pochi errori non forzati.", depth: 10, multipv: 30, temperature: 1.2, random: 0, book: true },
    { level: 13, elo: 2200, name: "Candidato maestro", description: "Tattica pulita e piani coerenti.", depth: 12, multipv: 30, temperature: 1, random: 0, book: true },
    { level: 14, elo: 2400, name: "Maestro", description: "Quasi nessun errore: devi conquistare ogni vantaggio.", depth: 12, multipv: 30, temperature: 0.9, random: 0, book: true },
    { level: 15, elo: 2600, name: "Grande maestro", description: "Precisione da professionista.", depth: 12, multipv: 30, temperature: 0.8, random: 0, book: true },
    { level: 16, elo: 2800, name: "Campione del mondo", description: "Il livello dei migliori umani di sempre.", depth: 14, multipv: 20, temperature: 0.6, random: 0, book: true },
    { level: 17, elo: 3000, name: "Super motore", description: "Sopra qualsiasi umano.", depth: 14, multipv: 20, temperature: 0.4, random: 0, book: true },
    { level: 18, elo: 3200, name: "Stockfish pieno", description: "Stockfish senza limitazioni, ricerca media.", depth: 18, multipv: 1, errors: { blunder: 0, mistake: 0, inaccuracy: 0 }, spread: 0, temperature: 0, random: 0, book: false },
    { level: 19, elo: 3600, name: "Imbattibile", description: "Massima forza disponibile nel browser (2,5 secondi per mossa).", depth: 40, movetime: 2500, multipv: 1, errors: { blunder: 0, mistake: 0, inaccuracy: 0 }, spread: 0, temperature: 0, random: 0, book: false }
  ];

  LEVELS.forEach((level) => {
    if (!level.errors) Object.assign(level, interpolateErrors(level.elo));
    level.targetAccuracy = Math.round(analysis().expectedAccuracyForElo(level.elo));
  });

  const MAX_LEVEL = LEVELS.length;

  function getLevel(level) {
    const n = Math.round(Number(level));
    if (!Number.isFinite(n)) return LEVELS[0];
    return LEVELS[Math.min(MAX_LEVEL, Math.max(1, n)) - 1];
  }

  function levelForElo(elo) {
    let best = LEVELS[0];
    LEVELS.forEach((level) => {
      if (Math.abs(level.elo - elo) < Math.abs(best.elo - elo)) best = level;
    });
    return best.level;
  }

  function weightedPick(items, weights, rng) {
    const total = weights.reduce((sum, w) => sum + w, 0);
    if (total <= 0) return items[0];
    let roll = rng() * total;
    for (let i = 0; i < items.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  // Fasce di perdita (punti di probabilita' di vittoria) per ogni tipo di errore.
  const ERROR_BANDS = {
    blunder: [20, 100],
    mistake: [10, 20],
    inaccuracy: [4, 10]
  };

  // Valore di una mossa per il bot: e' la probabilita' di vittoria (0-100), ma
  // continua a crescere oltre +10 e preferisce i matti piu' corti. Senza questo,
  // in una posizione gia' vinta tutte le mosse "valgono 100%" e il bot non
  // chiuderebbe mai la partita.
  function selectionUtility(score) {
    const A = analysis();
    if (!score) return 50;
    if (typeof score.mate === "number") {
      if (score.mate > 0) return 140 - Math.min(score.mate, 30);
      return -30 - (30 - Math.min(Math.abs(score.mate), 30));
    }
    const cp = score.cp || 0;
    let value = A.winPercent(cp);
    if (cp > 1000) value += (Math.min(cp, 5000) - 1000) / 150;
    if (cp < -1000) value -= (Math.min(-cp, 5000) - 1000) / 150;
    return value;
  }

  /*
   * candidates: [{ uci, score }] con score dal punto di vista del bot.
   * options: { fen, ply }. Restituisce { uci, loss, reason }.
   */
  function selectMove(candidates, levelConfig, rng = Math.random, options = {}) {
    const A = analysis();
    const valid = candidates.filter((c) => c && c.uci);
    if (!valid.length) return null;
    // loss  = perdita sulla scala della revisione (probabilita' di vittoria): decide gli errori
    // uLoss = perdita sulla scala "chiudi la partita": sceglie tra le mosse buone
    const scored = valid.map((c) => ({ ...c, win: A.scoreWinPercent(c.score), util: selectionUtility(c.score) }));
    const bestWin = Math.max(...scored.map((c) => c.win));
    const bestUtil = Math.max(...scored.map((c) => c.util));
    scored.forEach((c) => {
      c.loss = Math.max(0, bestWin - c.win);
      c.uLoss = Math.max(0, bestUtil - c.util);
    });
    scored.sort((a, b) => a.uLoss - b.uLoss);
    const best = scored[0];
    if (scored.length === 1 || !levelConfig.temperature) return { uci: best.uci, loss: 0, reason: "mossa migliore" };

    // 1) Il bot decide se in questa mossa commette un errore (e di che gravita').
    const errors = levelConfig.errors || {};
    const roll = rng();
    const order = ["blunder", "mistake", "inaccuracy"];
    let threshold = 0;
    let category = null;
    for (const kind of order) {
      threshold += errors[kind] || 0;
      if (roll < threshold) {
        category = kind;
        break;
      }
    }
    if (category) {
      // Se non esiste una mossa di quella gravita', prova con un errore piu' lieve.
      for (const kind of order.slice(order.indexOf(category))) {
        const [min, max] = ERROR_BANDS[kind];
        const pool = scored.filter((c) => c.loss >= min && c.loss < max + (kind === "blunder" ? 1 : 0));
        if (!pool.length) continue;
        const spread = kind === "blunder" ? Math.max(levelConfig.spread || 20, 1) : 6;
        const weights = pool.map((c) => Math.exp(-(c.loss - min) / spread));
        const pick = weightedPick(pool, weights, rng);
        return { uci: pick.uci, loss: pick.loss, reason: kind === "blunder" ? "errore grave umano" : kind === "mistake" ? "errore umano" : "imprecisione umana" };
      }
    }

    // 2) Mossa normale: scelta tra le mosse quasi equivalenti alla migliore.
    const pool = scored.filter((c) => c.loss < ERROR_BANDS.inaccuracy[0]);
    const usable = pool.length ? pool : [best];
    const useBook = levelConfig.book && options.fen && (options.ply || 0) < 16;
    const weights = usable.map((c) => {
      let weight = Math.exp(-c.uLoss / levelConfig.temperature);
      if (useBook && leadsToBook(options.fen, c.uci)) weight *= 4;
      return weight;
    });
    const pick = weightedPick(usable, weights, rng);
    return { uci: pick.uci, loss: pick.loss, reason: pick === best ? "mossa migliore" : "scelta umana" };
  }

  function leadsToBook(fen, uci) {
    const A = analysis();
    const chess = A.safeChess(fen);
    if (!chess) return false;
    const move = A.applyUci(chess, uci);
    return Boolean(move && A.bookInfo(chess.fen()).inBook);
  }

  function randomLegalMove(fen, rng) {
    const A = analysis();
    const chess = A.safeChess(fen);
    if (!chess) return null;
    const moves = chess.moves({ verbose: true }).filter((m) => !m.promotion || m.promotion === "q");
    if (!moves.length) return null;
    const move = moves[Math.floor(rng() * moves.length)];
    return `${move.from}${move.to}${move.promotion || ""}`;
  }

  function searchOptions(levelConfig) {
    return {
      depth: levelConfig.depth,
      multipv: levelConfig.multipv,
      movetime: levelConfig.movetime || null
    };
  }

  // Frequenza attesa di errori (per 100 mosse) da mostrare nell'interfaccia.
  function errorProfile(levelConfig) {
    const e = levelConfig.errors || {};
    return {
      blunder: Math.round((e.blunder || 0) * 1000) / 10,
      mistake: Math.round((e.mistake || 0) * 1000) / 10,
      inaccuracy: Math.round((e.inaccuracy || 0) * 1000) / 10
    };
  }

  /*
   * Sceglie la mossa del bot. engine: oggetto con analyse(fen, opts).
   * Restituisce { ok, uci, reason, loss, lines, depth } oppure { ok:false, error }.
   */
  async function chooseMove(engine, fen, level, { rng = Math.random, ply = 0 } = {}) {
    const config = getLevel(level);
    if (config.random > 0 && rng() < config.random) {
      const uci = randomLegalMove(fen, rng);
      if (uci) return { ok: true, uci, reason: "mossa da principiante", loss: null, lines: [], depth: 0 };
    }
    const result = await engine.analyse(fen, searchOptions(config));
    if (!result || !result.ok || !result.lines.length) {
      return { ok: false, error: (result && result.error) || "Stockfish non ha restituito mosse" };
    }
    // La scacchiera dell'app promuove sempre a donna: niente sottopromozioni.
    const allCandidates = result.lines.map((line) => ({ uci: line.pv[0], score: line.score }));
    const queenOnly = allCandidates.filter((c) => !(c.uci && c.uci.length === 5 && c.uci[4] !== "q"));
    const candidates = queenOnly.length ? queenOnly : allCandidates;
    const choice = selectMove(candidates, config, rng, { fen, ply });
    if (!choice) return { ok: false, error: "Nessuna mossa valida" };
    return { ok: true, uci: choice.uci, reason: choice.reason, loss: choice.loss, lines: result.lines, depth: result.depth };
  }

  return { LEVELS, MAX_LEVEL, ERROR_BANDS, selectionUtility, getLevel, levelForElo, selectMove, chooseMove, searchOptions, errorProfile, randomLegalMove };
});
