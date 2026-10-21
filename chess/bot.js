/*
 * Progetto A - Scacchi: livelli del bot e scelta della mossa.
 *
 * Come gioca il bot:
 *  1. Stockfish 17.1 analizza la posizione e restituisce le migliori N mosse con la loro
 *     valutazione.
 *  2. Ogni mossa viene convertita in "punti di probabilita' di vittoria persi" rispetto alla
 *     migliore (stessa scala usata dalla revisione).
 *  3. Per ogni mossa il bot decide, con probabilita' fissate per il suo livello, se giocare bene
 *     oppure commettere un'imprecisione, un errore o un blunder.
 *  4. Gli errori sono "credibili": dai livelli intermedi in su il bot sbaglia solo con mosse che
 *     sembrano buone a un calcolo corto (la sua "visione", da 1 a 6 mezze mosse) ma perdono a uno
 *     piu' lungo. E' la svista tipica di un umano: non regala un pezzo in presa senza motivo, manca
 *     la tattica che non ha visto. I principianti invece lasciano anche pezzi in presa.
 *
 * Taratura (ottobre 2026): ogni livello ha giocato centinaia di partite contro Stockfish 17.1
 * completo con forza limitata (UCI_LimitStrength / UCI_Elo, la scala Elo ufficiale di Stockfish,
 * da 1320 a 3190). L'Elo scritto e' quello misurato su quella scala; sotto 1320 i livelli sono
 * misurati a catena, uno contro l'altro. Strumento: tools/calibrate.js.
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

  function interp(table, x, log = false) {
    if (x <= table[0][0]) return table[0][1];
    for (let i = 1; i < table.length; i += 1) {
      if (x <= table[i][0]) {
        const [x0, y0] = table[i - 1];
        const [x1, y1] = table[i];
        const t = (x - x0) / (x1 - x0);
        if (log && y0 > 0 && y1 > 0) return Math.exp(Math.log(y0) + (Math.log(y1) - Math.log(y0)) * t);
        return y0 + (y1 - y0) * t;
      }
    }
    return table[table.length - 1][1];
  }

  /*
   * Il comportamento dipende da una "forza interna" s (non e' l'Elo: la corrispondenza
   * forza -> Elo misurato e' nella tabella LEVELS). Al crescere di s:
   *  errori per mossa      blunder (perdita >= 20 punti di probabilita' di vittoria),
   *                        errore (10-20), imprecisione (4-10): sempre piu' rari;
   *  visione / credibili   profondita' del calcolo corto e quota di errori che devono sembrare
   *                        buoni a quel calcolo;
   *  temperatura           varieta' tra le mosse quasi equivalenti;
   *  casuali               mosse legali qualsiasi (solo i primissimi livelli).
   */
  const BLUNDER = [[0, 0.3], [250, 0.25], [500, 0.2], [750, 0.16], [1000, 0.13], [1300, 0.085], [2000, 0.038], [2400, 0.016], [2800, 0.005], [3200, 0.001], [3600, 0.0002]];
  const MISTAKE = [[0, 0.3], [500, 0.24], [1000, 0.1865], [1300, 0.145], [2000, 0.09], [2400, 0.05], [2800, 0.022], [3200, 0.006], [3600, 0.002]];
  const INACCURACY = [[0, 0.28], [1300, 0.26], [2000, 0.215], [2400, 0.13], [2800, 0.07], [3200, 0.03], [3600, 0.015]];
  const SPREAD = [[250, 70], [1300, 28], [2000, 18], [2400, 10], [2800, 6], [3600, 4]];
  const TEMPERATURE = [[250, 3], [1000, 2.2], [1600, 1.6], [2000, 1.13], [2400, 0.7], [2800, 0.4], [3200, 0.2], [3600, 0.15]];
  const RANDOM = [[0, 0.5], [250, 0.25], [500, 0.08], [750, 0]];
  const PLAUSIBLE = [[800, 0], [1000, 0.5], [1600, 0.85], [2000, 0.95], [2400, 1]];
  // Profondita' della ricerca e della "visione": valori con la virgola, a ogni mossa si arrotonda
  // a caso (5,3 = 5 nel 70% delle mosse, 6 nel 30%), cosi' la forza cresce senza scalini.
  const DEPTH = [[0, 6], [700, 6], [1300, 8], [1900, 10], [2000, 10.4], [2400, 12], [2800, 14], [3200, 16]];
  const VISION = [[800, 0], [900, 1], [1300, 2], [1700, 3], [2100, 4], [2500, 5], [2900, 6]];

  function configForStrength(s) {
    return {
      strength: s,
      depth: Math.round(interp(DEPTH, s) * 100) / 100,
      multipv: s < 1300 ? 40 : s < 2400 ? 30 : 16,
      vision: Math.round(interp(VISION, s) * 100) / 100,
      plausibleShare: interp(PLAUSIBLE, s),
      plausibleMax: 6,
      errors: { blunder: interp(BLUNDER, s, true), mistake: interp(MISTAKE, s, true), inaccuracy: interp(INACCURACY, s) },
      spread: interp(SPREAD, s),
      temperature: interp(TEMPERATURE, s),
      random: interp(RANDOM, s),
      book: s >= 1000
    };
  }

  const FULL = { errors: { blunder: 0, mistake: 0, inaccuracy: 0 }, spread: 0, temperature: 0, random: 0, vision: 0, plausibleShare: 0, book: false };

  // Elo = forza misurata sulla scala di Stockfish; strength = forza interna che la produce.
  const LEVELS = [
    { level: 1, elo: 250, strength: 50, name: "Principiante assoluto", description: "Ha appena imparato le regole: lascia pezzi in presa spesso." },
    { level: 2, elo: 400, strength: 255, name: "Novizio", description: "Vede le catture semplici, non le minacce dell'avversario." },
    { level: 3, elo: 550, strength: 430, name: "Base", description: "Sviluppa poco e calcola una sola mossa avanti." },
    { level: 4, elo: 700, strength: 620, name: "Principiante", description: "Mosse naturali, tattica ancora fragile." },
    { level: 5, elo: 850, strength: 805, name: "Intermedio basso", description: "Meno pezzi regalati, piani ancora instabili." },
    { level: 6, elo: 1000, strength: 935, name: "Intermedio", description: "Conosce le aperture principali, sbaglia nei cambi e nei finali." },
    { level: 7, elo: 1150, strength: 1030, name: "Giocatore da circolo", description: "Manca tattiche di 2-3 mosse e piani lunghi." },
    { level: 8, elo: 1300, strength: 1185, name: "Intermedio forte", description: "Gioco solido, qualche svista tattica a partita." },
    { level: 9, elo: 1450, strength: 1272, name: "Club", description: "Sa giocare, ma non ha la precisione di un esperto." },
    { level: 10, elo: 1600, strength: 1375, name: "Club forte", description: "Forte, con imprecisioni strategiche reali." },
    { level: 11, elo: 1800, strength: 1505, name: "Avanzato", description: "Scelte quasi sempre sane, raramente regala qualcosa." },
    { level: 12, elo: 2000, strength: 1635, name: "Esperto", description: "Molto preciso: pochi errori non forzati." },
    { level: 13, elo: 2200, strength: 1765, name: "Candidato maestro", description: "Tattica pulita e piani coerenti." },
    { level: 14, elo: 2400, strength: 1890, name: "Maestro", description: "Quasi nessun errore: devi conquistare ogni vantaggio." },
    { level: 15, elo: 2600, strength: 2015, name: "Grande maestro", description: "Precisione da professionista." },
    { level: 16, elo: 2800, strength: 2490, name: "Campione del mondo", description: "Il livello dei migliori umani di sempre." },
    { level: 17, elo: 3000, strength: 2610, name: "Super motore", description: "Sopra qualsiasi umano." },
    { level: 18, elo: 3200, full: { depth: 18, multipv: 1 }, name: "Stockfish pieno", description: "Stockfish senza limitazioni, ricerca media." },
    { level: 19, elo: 3600, full: { depth: 40, movetime: 2500, multipv: 1 }, name: "Imbattibile", description: "Massima forza disponibile nel browser (2,5 secondi per mossa)." }
  ];

  LEVELS.forEach((level) => {
    Object.assign(level, level.full ? { ...FULL, ...level.full } : configForStrength(level.strength));
    level.targetAccuracy = Math.round(analysis().expectedAccuracyForElo(level.elo));
  });

  /*
   * Forza vera dei bot della versione precedente (fino a ottobre 2026), misurata allo stesso modo.
   * Serve a ricalcolare il rating delle partite gia' giocate: chi batteva il vecchio "2000"
   * batteva in realta' un bot piu' debole. Chiave: Elo scritto allora; valore: Elo misurato.
   */
  const LEGACY_STRENGTH = [
    [250, 50], [400, 320], [550, 410], [700, 530], [850, 600], [1000, 750], [1150, 770], [1300, 870],
    [1450, 1300], [1600, 1335], [1800, 1465], [2000, 1785], [2200, 2075], [2400, 2310], [2600, 2510], [2800, 2530], [3000, 2650], [3200, 3200], [3600, 3600]
  ];
  function legacyTrueElo(label) {
    return interp(LEGACY_STRENGTH, Number(label) || 0);
  }

  const MAX_LEVEL = LEVELS.length;

  function getLevel(level) {
    if (level && typeof level === "object") return level;
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
  const ERROR_ORDER = ["blunder", "mistake", "inaccuracy"];

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

  // Il bot decide se in questa mossa sbaglia, e quanto (null = gioca bene).
  function rollError(levelConfig, rng) {
    const errors = levelConfig.errors || {};
    const roll = rng();
    let threshold = 0;
    for (const kind of ERROR_ORDER) {
      threshold += errors[kind] || 0;
      if (roll < threshold) return kind;
    }
    return null;
  }

  /*
   * candidates: [{ uci, score, shallowLoss? }] con score dal punto di vista del bot.
   * options: { fen, ply, category (errore gia' deciso, null = nessuno), plausible (true: l'errore
   * deve sembrare buono al calcolo corto, cioe' avere shallowLoss piccolo) }.
   * Restituisce { uci, loss, reason }.
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

    // 1) Errore (gia' deciso da chooseMove, oppure estratto qui).
    const category = "category" in options ? options.category : rollError(levelConfig, rng);
    if (category) {
      // Se non esiste una mossa di quella gravita' (credibile), prova con un errore piu' lieve.
      for (const kind of ERROR_ORDER.slice(ERROR_ORDER.indexOf(category))) {
        const [min, max] = ERROR_BANDS[kind];
        let pool = scored.filter((c) => c.loss >= min && c.loss < max + (kind === "blunder" ? 1 : 0));
        if (options.plausible) pool = pool.filter((c) => typeof c.shallowLoss === "number" && c.shallowLoss <= (levelConfig.plausibleMax || 6));
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

  // 5,3 -> 5 oppure 6 (6 con probabilita' 0,3)
  function roundDepth(value, rng = Math.random) {
    const base = Math.floor(value);
    return base + (rng() < value - base ? 1 : 0);
  }

  function searchOptions(levelConfig, rng = Math.random) {
    return {
      depth: roundDepth(levelConfig.depth, rng),
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

  // Oltre questa probabilita' di vittoria il bot "chiude la partita": errori ridotti a CONVERT_FACTOR.
  const WINNING = 90;
  const CONVERT_FACTOR = 0.3;
  function scaleErrors(errors = {}, factor) {
    return { blunder: (errors.blunder || 0) * factor, mistake: (errors.mistake || 0) * factor, inaccuracy: (errors.inaccuracy || 0) * factor };
  }

  // La scacchiera dell'app promuove sempre a donna: niente sottopromozioni.
  function queenOnly(list) {
    const filtered = list.filter((c) => !(c.uci && c.uci.length === 5 && c.uci[4] !== "q"));
    return filtered.length ? filtered : list;
  }

  /*
   * Sceglie la mossa del bot. engine: oggetto con analyse(fen, opts).
   * level: numero del livello (1-19) oppure una configurazione (per la taratura).
   * Restituisce { ok, uci, reason, loss, lines, depth } oppure { ok:false, error }.
   */
  async function chooseMove(engine, fen, level, { rng = Math.random, ply = 0 } = {}) {
    const A = analysis();
    const config = getLevel(level);
    const randomRoll = config.random > 0 ? rng() : 1;
    const result = await engine.analyse(fen, searchOptions(config, rng));
    if (!result || !result.ok || !result.lines.length) {
      return { ok: false, error: (result && result.error) || "Stockfish non ha restituito mosse" };
    }
    let candidates = queenOnly(result.lines.map((line) => ({ uci: line.pv[0], score: line.score })));
    // Con la partita gia' vinta anche un giocatore debole gioca piu' semplice e prova a chiudere:
    // meno errori e quasi niente mosse a caso (senza questo i livelli bassi non danno mai matto).
    const winning = Math.max(...candidates.map((c) => A.scoreWinPercent(c.score))) >= WINNING;
    if (config.random > 0 && randomRoll < config.random * (winning ? 0.25 : 1)) {
      const uci = randomLegalMove(fen, rng);
      if (uci) return { ok: true, uci, reason: "mossa da principiante", loss: null, lines: result.lines, depth: result.depth };
    }
    const rollConfig = winning ? { ...config, errors: scaleErrors(config.errors, CONVERT_FACTOR) } : config;
    const category = config.temperature ? rollError(rollConfig, rng) : null;
    // Errore credibile: serve il calcolo corto per sapere quali mosse "sembrano" buone.
    let plausible = false;
    const vision = category && config.vision > 0 ? roundDepth(config.vision, rng) : 0;
    if (vision > 0 && rng() < (config.plausibleShare || 0)) {
      plausible = true;
      const shallow = await engine.analyse(fen, { depth: vision, multipv: config.multipv });
      if (shallow && shallow.ok && shallow.lines.length) {
        const wins = new Map(shallow.lines.map((line) => [line.pv[0], A.scoreWinPercent(line.score)]));
        const bestShallow = Math.max(...wins.values());
        candidates = candidates.map((c) => (wins.has(c.uci) ? { ...c, shallowLoss: Math.max(0, bestShallow - wins.get(c.uci)) } : c));
      }
    }
    const choice = selectMove(candidates, config, rng, { fen, ply, category, plausible });
    if (!choice) return { ok: false, error: "Nessuna mossa valida" };
    return { ok: true, uci: choice.uci, reason: choice.reason, loss: choice.loss, lines: result.lines, depth: result.depth };
  }

  return { LEVELS, MAX_LEVEL, ERROR_BANDS, LEGACY_STRENGTH, legacyTrueElo, configForStrength, selectionUtility, getLevel, levelForElo, selectMove, chooseMove, searchOptions, errorProfile, randomLegalMove };
});
