/*
 * Progetto A - Influenza: motore (senza DOM).
 *
 *  - Trattativa: simulatore contro una controparte con un limite nascosto, una personalita' e un
 *    interesse nascosto su un secondo punto. Il risultato si misura in valore catturato: quanto
 *    dello spazio tra la tua alternativa (BATNA) e il loro limite hai portato a casa.
 *  - Riconosci la leva: messaggi reali, scegli la tattica; quelle sbagliate tornano presto.
 *  - Casi: situazioni a scelta, ogni opzione ha efficacia, relazione e rischio.
 *  - Schede: definizioni e contromosse delle tattiche, a ripasso distanziato.
 *  - Programma del giorno, profilo per il quadro, storico.
 * Stato: state.influenceLab. Dati: InfluenceTactics, InfluenceDeals, InfluenceDrills, InfluenceData.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.InfluenceEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";
  const req = (name, file) => {
    if (root[name]) return root[name];
    if (typeof require === "function") { try { return require(file); } catch (e) { return {}; } }
    return {};
  };
  const TAC = req("InfluenceTactics", "./tactics.js");
  const DEAL = req("InfluenceDeals", "./deals.js");
  const DRILLS = req("InfluenceDrills", "./drills.js");
  const DATA = req("InfluenceData", "./data.js");
  const TACTICS = TAC.TACTICS || {};
  const FAMILIES = TAC.FAMILIES || {};
  const DEALS = DEAL.DEALS || [];
  const COUNTERPARTS = DEAL.COUNTERPARTS || [];
  const LINES = DEAL.LINES || {};
  const SPOT = (DRILLS && DRILLS.SPOT) || [];
  const CASES = (DRILLS && DRILLS.CASES) || [];
  const CHAPTERS = (DATA && DATA.CHAPTERS) || [];

  const VERSION = 1;
  const DAY = 86400000;

  /* ------------------------------------------------------------ utilita' */
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
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
  function shuffle(list, rand = Math.random) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const pick = (list, rand) => list[Math.floor(rand() * list.length)];
  function startOfDay(t) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  function addDays(t, n) {
    const d = new Date(t);
    d.setDate(d.getDate() + n);
    return d.getTime();
  }
  function dayKey(t) {
    const d = new Date(t);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  function euro(v) {
    const n = Math.round(Math.abs(v));
    return `${v < 0 ? "−" : ""}${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} €`;
  }
  const fill = (text, map) => String(text).replace(/\{(\w)\}/g, (all, k) => (map[k] != null ? map[k] : all));

  /* ============================================================ TRATTATIVA */
  const NO_ZOPA_CHANCE = 0.12;
  const MAX_LEVEL = COUNTERPARTS.length || 1;

  function dealById(id) { return DEALS.find((d) => d.id === id) || null; }
  function cpById(id) { return COUNTERPARTS.find((c) => c.id === id) || null; }
  function cpByLevel(level) { return COUNTERPARTS.find((c) => c.level === level) || COUNTERPARTS[0]; }

  function roundTo(v, step, dir) {
    // dir +1 = arrotonda per eccesso, -1 per difetto
    const f = dir > 0 ? Math.ceil : dir < 0 ? Math.floor : Math.round;
    return f(v / step) * step;
  }

  /*
   * Nuova partita. opts: { dealId, cpId | level, seed, noZopa (true/false/undefined = a caso) }
   * Convenzioni: s = +1 se vendi (vuoi un prezzo alto), -1 se compri. Per la controparte il "costo"
   * di un accordo e' E = s*prezzo - vThem(opzione): piu' basso e' meglio per lei; il suo limite e'
   * ER = s*R. Le sue offerte partono da E0 e salgono verso ER con il tempo e le concessioni.
   */
  function newGame(opts = {}) {
    const seed = num(opts.seed) ? opts.seed >>> 0 : (Date.now() >>> 0);
    const rand = rng(seed);
    const deal = dealById(opts.dealId) || pick(DEALS, rand);
    const cp = cpById(opts.cpId) || cpByLevel(opts.level || 1);
    const s = deal.role === "seller" ? 1 : -1;
    const noZopa = opts.noZopa === true || (opts.noZopa !== false && rand() < NO_ZOPA_CHANCE);
    let R;
    if (noZopa) {
      // limite peggiore della tua alternativa, anche contando il secondo punto
      const best = Math.max(...deal.issue.options.map((o) => o.them + o.you));
      const gap = deal.step * (2 + Math.floor(rand() * 8));
      R = deal.you.batna - s * (best + gap);
    } else {
      R = deal.res[0] + rand() * (deal.res[1] - deal.res[0]);
    }
    R = roundTo(R, deal.step, -s);
    const gap = cp.gap[0] + rand() * (cp.gap[1] - cp.gap[0]);
    const O = roundTo(R * (1 - s * gap), deal.step, -s);
    const T = cp.patience[0] + Math.floor(rand() * (cp.patience[1] - cp.patience[0] + 1));
    return {
      v: 1, seed, dealId: deal.id, cpId: cp.id, level: cp.level, s, R, O, T,
      noZopa, beta: cp.beta, trust: 0.5, round: 0, phase: "start",
      E0: s * O, ER: s * R, Ecur: null, theirPrice: null, tableOpt: 0,
      yours: [], theirs: [], anchorDone: false, firstBy: null,
      revealed: false, strikes: 0, qCal: 0, ultimatum: false, bluffAlt: false, bluffDeadline: false,
      bluffCalled: false, youBluffed: null, claimedBatna: null, finalOffer: false, hurried: false,
      log: [], done: false, outcome: null, randN: 0
    };
  }
  function gRand(g) {
    g.randN += 1;
    return rng((g.seed + g.randN * 2654435761) >>> 0)();
  }
  function gDeal(g) { return dealById(g.dealId); }
  function gCp(g) { return cpById(g.cpId); }
  function optOf(g, idx) { const d = gDeal(g); return d.issue.options[clamp(idx | 0, 0, d.issue.options.length - 1)]; }
  // costo per la controparte di un prezzo con un'opzione
  function Eof(g, price, opt) { return g.s * price - optOf(g, opt).them; }
  // prezzo che corrisponde a un costo E per la controparte con l'opzione data
  function priceOf(g, E, opt) { return g.s * (E + optOf(g, opt).them); }
  // valore per te
  function youValue(g, price, opt) { return g.s * price + optOf(g, opt).you; }
  function say(g, who, text, extra = {}) { g.log.push({ who, text, round: g.round, ...extra }); }
  function line(g, key, map = {}) {
    const set = LINES[key];
    const list = Array.isArray(set) ? set : (set && (set[g.cpId] || set.prag)) || [""];
    return fill(list[Math.floor(gRand(g) * list.length)], map);
  }
  function fmtP(g, p) { return euro(p); }
  function marketInfo(g) {
    const d = gDeal(g);
    const mid = (d.market.low + d.market.high) / 2;
    const half = (d.market.high - d.market.low) / 2;
    return { mid, half, low: d.market.low, high: d.market.high };
  }
  // la loro prossima offerta pianificata (costo E), senza ancora applicarla
  function planNext(g, userConcession = 0) {
    const cp = gCp(g);
    // il tempo conta in turni: anche le domande e le etichette fanno passare il tempo
    const f = (k) => Math.min(1, Math.pow(clamp(k, 0, g.T) / g.T, 1 / Math.max(0.2, g.beta)));
    const cur = g.Ecur == null ? g.E0 : g.Ecur;
    const pathNext = g.E0 + (g.ER - g.E0) * f(g.round + 1);
    const tf = clamp(0.5 + 0.6 * g.trust, 0.4, 1);
    let next = cur + Math.max(0, pathNext - cur) * tf;
    next = Math.max(next, cur + Math.max(0, userConcession) * cp.recip * (0.6 + 0.8 * g.trust)); // ricambiano le tue concessioni
    if (g.round >= g.T - 2) next = Math.max(next, g.ER - (g.ER - cur) * 0.25); // in fondo si avvicinano al limite
    return Math.min(g.ER, Math.max(cur, next));
  }
  function setTheirOffer(g, E, text) {
    const d = gDeal(g);
    g.Ecur = Math.min(g.ER, E);
    let p = priceOf(g, g.Ecur, g.tableOpt);
    p = roundTo(p, d.step, -g.s); // arrotondano a loro favore
    g.theirPrice = p;
    g.Ecur = Eof(g, p, g.tableOpt);
    g.theirs.push({ price: p, opt: g.tableOpt, round: g.round });
    say(g, "them", fill(text, { p: fmtP(g, p), o: optOf(g, g.tableOpt).label }), { price: p, opt: g.tableOpt });
    return p;
  }
  function end(g, outcome) {
    g.done = true;
    g.phase = "done";
    g.outcome = outcome;
  }
  function dealAt(g, price, opt, by) {
    say(g, "them", line(g, by === "them" ? "accept" : "accept"));
    end(g, { deal: true, price, opt, by });
  }
  function noDeal(g, by, text) {
    if (text) say(g, by === "you" ? "you" : "them", text);
    end(g, { deal: false, by });
  }
  // chi apre: "you" (fai tu la prima offerta) o "them"
  function start(g, who) {
    if (g.phase !== "start") return g;
    g.firstBy = who;
    if (who === "them") {
      g.phase = "talk";
      setTheirOffer(g, g.E0, line(g, "openThem"));
    } else {
      g.phase = "talk";
    }
    return g;
  }
  function afterResponse(g) {
    g.round += 1;
    if (g.done) return;
    const cp = gCp(g);
    if (!g.hurried && g.round >= g.T - 2 && g.round < g.T) { g.hurried = true; say(g, "them", line(g, "hurry"), { tone: "hint" }); }
    if (g.round >= g.T) noDeal(g, "time", line(g, "leaveTime"));
    // bluffatore: alternativa inventata e finta ultima offerta
    if (!g.done && cp.bluff && g.theirPrice != null) {
      if (!g.bluffAlt && g.theirs.length >= 2) {
        g.bluffAlt = true;
        const fake = roundTo(g.R - g.s * (gDeal(g).step * 6 + Math.abs(g.R) * 0.04), gDeal(g).step, -g.s);
        g.fakeAlt = fake;
        say(g, "them", line(g, "themBluffAlt", { b: fmtP(g, g.s > 0 ? Math.min(fake, g.theirPrice) : Math.max(fake, g.theirPrice)) }), { tone: "bluff" });
      } else if (g.bluffAlt && !g.bluffDeadline && g.theirs.length >= 4 && g.round < g.T - 1) {
        g.bluffDeadline = true;
        say(g, "them", line(g, "themBluffDeadline", { p: fmtP(g, g.theirPrice) }), { tone: "bluff" });
      }
    }
  }
  function isInsult(g, price) {
    const d = gDeal(g);
    const cp = gCp(g);
    const bound = g.s > 0 ? d.market.high * (1 + cp.tol) : d.market.low * (1 - cp.tol);
    return g.s * price > g.s * bound;
  }
  function credibility(g, price, criterionId) {
    const d = gDeal(g);
    let cred = 0.55;
    const c = d.criteria.find((x) => x.id === criterionId);
    if (c) {
      // il criterio sostiene l'offerta se e' almeno vicino alla cifra chiesta
      const supports = g.s * c.value >= g.s * price - Math.abs(price) * 0.04;
      cred += supports ? 0.25 : -0.1;
    }
    if (price % 500 !== 0) cred += 0.1; // cifra precisa: sembra calcolata (Mason e colleghi, 2013)
    return clamp(cred, 0.2, 0.9);
  }
  function applyAnchor(g, price, criterionId) {
    if (g.anchorDone) return;
    g.anchorDone = true;
    const m = marketInfo(g);
    const rel = (g.s * price - g.s * m.mid) / m.half;
    const strength = (clamp(rel, 0, 1.3) / 1.3) * credibility(g, price, criterionId) * (g.firstBy === "them" ? 0.7 : 1) * (g.strikes ? 0.4 : 1);
    g.anchorStrength = Math.round(strength * 100) / 100;
    if (strength <= 0) return;
    g.beta *= 1 + 0.9 * strength;
    const cur = g.Ecur == null ? g.E0 : g.Ecur;
    g.E0 = g.E0 + 0.35 * strength * (g.ER - g.E0);
    if (g.Ecur != null) g.Ecur = Math.max(cur, g.Ecur);
  }

  /*
   * Azioni dell'utente: { type, price, opt, criterion, kind, index, claim }
   *   offer       prezzo (+ opt, + criterion per motivarlo)
   *   question    kind: "calibrated" | "closed" | "why"
   *   label       index: quale etichetta (vedi deal.labels)
   *   batna       claim: cifra dichiarata (se diversa dalla tua alternativa vera e' un bluff)
   *   ultimatum   prezzo (+ opt): ultima offerta
   *   split       facciamo a meta'
   *   accept      accetti la loro offerta
   *   walk        ti alzi dal tavolo
   */
  function act(g, a = {}) {
    if (!g || g.done) return g;
    if (g.phase === "start") start(g, "you");
    const d = gDeal(g);
    const cp = gCp(g);
    const type = a.type;
    if (type === "accept") {
      if (g.theirPrice == null) return g;
      say(g, "you", "Accetto.");
      end(g, { deal: true, price: g.theirPrice, opt: g.tableOpt, by: "you" });
      return g;
    }
    if (type === "walk") {
      say(g, "you", "Grazie, ma preferisco la mia alternativa.");
      say(g, "them", line(g, "walkOk"));
      end(g, { deal: false, by: "you" });
      return g;
    }
    if (type === "offer" || type === "ultimatum") {
      const price = Math.round(Number(a.price) || 0);
      const opt = clamp(a.opt | 0, 0, d.issue.options.length - 1);
      const crit = d.criteria.find((x) => x.id === a.criterion);
      const prev = g.yours.length ? g.yours[g.yours.length - 1] : null;
      g.yours.push({ price, opt, round: g.round, criterion: crit ? crit.id : null, ultimatum: type === "ultimatum" });
      say(g, "you", `${type === "ultimatum" ? "Ultima offerta: " : ""}${fmtP(g, price)}${opt ? `, ${optOf(g, opt).label}` : ""}${crit ? `, secondo ${crit.text} (${fmtP(g, crit.value)})` : ""}.`, { price, opt });
      if (g.ultimatum && type === "offer" && prev && g.s * price < g.s * prev.price) g.trust = clamp(g.trust - 0.15, 0, 1); // dopo un ultimatum hai ceduto: perdi credibilita'
      if (isInsult(g, price)) {
        g.strikes += 1;
        g.trust = clamp(g.trust - 0.2, 0, 1);
        g.beta *= 0.75; // offesi, concedono meno
        if (g.strikes > cp.strikes) { noDeal(g, "insult", line(g, "leaveInsult")); return g; }
        say(g, "them", line(g, "insult"), { tone: "angry" });
        afterResponse(g);
        return g;
      }
      if (crit) g.trust = clamp(g.trust + 0.03, 0, 1);
      applyAnchor(g, price, crit && crit.id);
      if (opt && opt !== g.tableOpt) {
        const likes = optOf(g, opt).them > 0;
        say(g, "them", line(g, likes ? "optionLike" : "optionNo"), { tone: "info" });
      }
      g.tableOpt = opt;
      const Eu = Eof(g, price, opt);
      const userConcession = prev ? (youValue(g, prev.price, prev.opt) - youValue(g, price, opt)) : 0;
      if (g.bluffAlt && !g.bluffCalled && userConcession > marketInfo(g).half * 0.25) g.bluffWorked = true;
      const next = planNext(g, userConcession);
      const deadline = g.round >= g.T - 1;
      if (type === "ultimatum") {
        g.ultimatum = true;
        if (Eu <= g.ER && !(cp.id === "duro" && g.trust < 0.3)) { dealAt(g, price, opt, "them"); return g; }
        if (cp.id === "coop" || (cp.id === "prag" && g.trust >= 0.45) || (cp.id === "bluff" && g.trust >= 0.55)) {
          g.finalOffer = true;
          const cur = g.Ecur == null ? g.E0 : g.Ecur;
          setTheirOffer(g, cur + (g.ER - cur) * 0.85, line(g, "ultimatumLast"));
          afterResponse(g);
          return g;
        }
        noDeal(g, "ultimatum", line(g, "ultimatumNo"));
        return g;
      }
      if (Eu <= next || (deadline && Eu <= g.ER) || (g.Ecur != null && Eu <= g.Ecur)) { dealAt(g, price, opt, "them"); return g; }
      if (next <= (g.Ecur == null ? -Infinity : g.Ecur) + 1e-9) {
        setTheirOffer(g, g.Ecur, line(g, "still"));
      } else if (cp.id === "duro" && next >= g.ER - 1e-9 && !g.finalOffer) {
        g.finalOffer = true;
        setTheirOffer(g, next, line(g, "themFinal"));
      } else {
        setTheirOffer(g, next, g.theirPrice == null ? line(g, "openThem") : line(g, "counter"));
      }
      afterResponse(g);
      return g;
    }
    if (g.theirPrice == null && type !== "label" && type !== "question" && type !== "batna") return g;
    if (type === "question") {
      const kind = a.kind;
      if (kind === "calibrated") {
        say(g, "you", g.qCal % 2 === 0 ? "Cosa ti serve per chiudere oggi?" : "Come faccio ad accettare questa cifra con quello che ho a disposizione?");
        if (g.bluffAlt && !g.bluffCalled && g.log.slice(-4).some((x) => x.tone === "bluff")) {
          g.bluffCalled = true;
          g.beta *= 1.4;
          say(g, "them", line(g, "themBluffBack"));
        }
        const effect = Math.pow(0.5, Math.floor(g.qCal / 2));
        g.qCal += 1;
        g.trust = clamp(g.trust + 0.04 * effect, 0, 1);
        if (!g.revealed && g.trust >= 0.45 && g.qCal === 1) {
          g.revealed = true;
          say(g, "them", line(g, "qCalibratedReveal", { i: d.interestFromLabel || d.issue.interest }), { tone: "reveal" });
        } else if (g.theirPrice != null && effect >= 0.5) {
          const next = planNext(g, 0);
          const cur = g.Ecur;
          setTheirOffer(g, cur + (next - cur) * 0.7 * effect, line(g, "qCalibratedMove"));
        } else if (g.theirPrice != null) {
          say(g, "them", line(g, "qCalibratedNothing", { p: fmtP(g, g.theirPrice) }));
        } else {
          say(g, "them", "Prima mi dica lei una cifra.");
        }
      } else if (kind === "closed") {
        say(g, "you", "È davvero il massimo che puoi fare?");
        say(g, "them", line(g, "qClosed"));
      } else {
        say(g, "you", "Perché così?");
        g.trust = clamp(g.trust - 0.03, 0, 1);
        say(g, "them", line(g, "qWhy"));
      }
      afterResponse(g);
      return g;
    }
    if (type === "label") {
      const lb = d.labels[clamp(a.index | 0, 0, d.labels.length - 1)];
      say(g, "you", lb.text);
      if (lb.ok) {
        g.trust = clamp(g.trust + 0.1, 0, 1);
        if (!g.revealed) {
          g.revealed = true;
          say(g, "them", line(g, "labelOk", { i: d.interestFromLabel || d.issue.interest }), { tone: "reveal" });
        } else say(g, "them", "Sì, gliel'ho detto: è così.");
      } else {
        g.trust = clamp(g.trust + 0.01, 0, 1);
        say(g, "them", line(g, "labelNo"));
      }
      afterResponse(g);
      return g;
    }
    if (type === "batna") {
      const claim = roundTo(num(Number(a.claim)) && a.claim !== "" && a.claim != null ? Number(a.claim) : d.you.batna, d.step, 0);
      const bluff = g.s * claim > g.s * d.you.batna + 1e-9;
      g.claimedBatna = claim;
      say(g, "you", `Ho un'alternativa: ${fmtP(g, claim)}.`);
      const m = marketInfo(g);
      if (bluff) {
        g.youBluffed = { claim, caught: false };
        const beyond = Math.max(0, (g.s * claim - g.s * (g.s > 0 ? m.high : m.low)) / m.half);
        const size = Math.max(0, (g.s * claim - g.s * d.you.batna) / m.half);
        const pc = clamp(0.12 + 0.6 * beyond + 0.2 * size + (cp.id === "duro" ? 0.1 : 0) + (cp.bluff ? 0.15 : 0), 0.08, 0.9);
        if (gRand(g) < pc) {
          g.youBluffed.caught = true;
          g.trust = clamp(g.trust - 0.3, 0, 1);
          g.strikes += 1;
          g.beta *= 0.8;
          if (g.strikes > cp.strikes) { noDeal(g, "bluff", line(g, "bluffCaught") + " " + line(g, "leaveInsult")); return g; }
          say(g, "them", line(g, "bluffCaught"), { tone: "angry" });
          afterResponse(g);
          return g;
        }
      }
      const Eb = g.s * claim; // per battere la tua alternativa (senza secondo punto) devono arrivare qui
      const theirYou = g.theirPrice == null ? -Infinity : youValue(g, g.theirPrice, g.tableOpt);
      if (theirYou >= g.s * claim) {
        // la loro offerta e' gia' migliore della tua alternativa: hai rivelato il tuo minimo
        g.beta *= 0.7;
        say(g, "them", line(g, "batnaWeak"));
      } else if (g.ER >= Eb + optOf(g, g.tableOpt).you * 0) {
        const target = Math.min(g.ER, Eb + gDeal(g).step - optOf(g, g.tableOpt).them);
        g.beta *= 1.2;
        setTheirOffer(g, Math.max(g.Ecur == null ? g.E0 : g.Ecur, target), line(g, "batnaGood"));
      } else if (bluff) {
        // il bluff e' oltre il loro limite: ti dicono di andare dall'altro e smettono di concedere
        g.youBluffed.beyond = true;
        g.trust = clamp(g.trust - 0.15, 0, 1);
        g.beta *= 0.6;
        say(g, "them", line(g, "bluffBeyond"), { tone: "angry" });
        if (g.theirPrice != null) say(g, "them", line(g, "still", { p: fmtP(g, g.theirPrice) }));
      } else {
        // la tua alternativa vera e' migliore del loro limite
        if (cp.id === "duro" || cp.id === "anch") { noDeal(g, "batna", line(g, "leaveTime")); return g; }
        g.finalOffer = true;
        setTheirOffer(g, g.ER, line(g, "themFinal"));
      }
      afterResponse(g);
      return g;
    }
    if (type === "split") {
      const last = g.yours[g.yours.length - 1];
      if (!last || g.theirPrice == null) return g;
      const mid = roundTo((last.price + g.theirPrice) / 2, d.step, 0);
      say(g, "you", `Facciamo a metà: ${fmtP(g, mid)}.`);
      const Em = Eof(g, mid, g.tableOpt);
      const next = planNext(g, youValue(g, last.price, last.opt) - youValue(g, mid, g.tableOpt));
      g.yours.push({ price: mid, opt: g.tableOpt, round: g.round, split: true });
      if (Em <= next || (cp.id === "coop" && Em <= g.ER)) {
        say(g, "them", line(g, "splitOk"));
        end(g, { deal: true, price: mid, opt: g.tableOpt, by: "split" });
        return g;
      }
      say(g, "them", line(g, "splitNo"));
      setTheirOffer(g, next, line(g, "counter"));
      afterResponse(g);
      return g;
    }
    return g;
  }

  /* ---- risultato e analisi */
  function bestJoint(g) {
    const d = gDeal(g);
    let best = { idx: 0, u: -Infinity };
    d.issue.options.forEach((o, i) => {
      const u = g.s * g.R + o.them + o.you;
      if (u > best.u) best = { idx: i, u };
    });
    return best;
  }
  function result(g) {
    const d = gDeal(g);
    const Ub = g.s * d.you.batna;
    const best = bestJoint(g);
    const zopa = best.u > Ub;
    const o = g.outcome || { deal: false };
    const U = o.deal ? youValue(g, o.price, o.opt) : Ub;
    let captured;
    if (zopa) captured = (U - Ub) / (best.u - Ub);
    else captured = o.deal ? 0 : 1;
    const pct = Math.round(clamp(captured, 0, 1) * 100);
    const worse = o.deal && U < Ub;
    const lessons = [];
    const m = marketInfo(g);
    const first = g.yours[0];
    // apertura
    if (g.firstBy === "them" && g.theirs.length && o.deal && o.by === "you" && g.theirs.length === 1) lessons.push({ kind: "bad", text: "Hai accettato la loro prima offerta: quasi mai è la migliore. Chi accetta subito fa pensare all'altro di aver chiesto troppo poco, e lascia valore sul tavolo." });
    if (first) {
      const rel = (g.s * first.price - g.s * m.mid) / m.half;
      if (isInsult(g, first.price)) lessons.push({ kind: "bad", text: `La tua prima offerta (${euro(first.price)}) era fuori mercato: invece di ancorare, ha fatto perdere fiducia. Un'ancora funziona se è ambiziosa ma difendibile.` });
      else if (rel >= 0.5) lessons.push({ kind: "good", text: `Prima offerta ambiziosa e credibile (${euro(first.price)}): ha spostato il centro della trattativa a tuo favore. È l'effetto ancora (Galinsky e Mussweiler, 2001).${first.criterion ? " Motivarla con un criterio oggettivo l'ha resa più forte." : " Motivarla con un criterio oggettivo l'avrebbe resa ancora più forte."}` });
      else if (rel < 0) lessons.push({ kind: "bad", text: `Prima offerta timida (${euro(first.price)}, sotto il centro del mercato a tuo sfavore): hai ancorato contro di te.` });
      else lessons.push({ kind: "info", text: `Prima offerta nella media (${euro(first.price)}): potevi partire più in alto restando credibile, fino al limite alto del mercato (${euro(g.s > 0 ? m.high : m.low)}).` });
    } else if (g.firstBy === "them" && g.cpId === "anch") lessons.push({ kind: "info", text: "Contro chi apre con una cifra estrema non si risponde facendo a metà: si rimette in discussione l'ancora con un criterio oggettivo e si riparte da lì." });
    // concessioni
    const conc = [];
    for (let i = 1; i < g.yours.length; i += 1) conc.push(youValue(g, g.yours[i - 1].price, g.yours[i - 1].opt) - youValue(g, g.yours[i].price, g.yours[i].opt));
    const real = conc.filter((c) => c > 0);
    if (real.length >= 2) {
      const decreasing = real.every((c, i) => i === 0 || c <= real[i - 1] * 1.15 + d.step * 0.5);
      if (decreasing) lessons.push({ kind: "good", text: `Concessioni decrescenti (${real.map((c) => euro(c)).join(", ")}): segnalano che ti stai avvicinando al tuo limite.` });
      else lessons.push({ kind: "bad", text: `Concessioni irregolari o crescenti (${real.map((c) => euro(c)).join(", ")}): fanno capire che c'è ancora margine e invitano a chiedere di più.` });
    }
    if (real.length && real[0] > m.half * 0.6) lessons.push({ kind: "bad", text: `La prima concessione (${euro(real[0])}) era molto grande: le concessioni grandi vanno comprate con qualcosa in cambio.` });
    // interessi e secondo punto
    const usedOpt = o.deal ? o.opt : g.tableOpt;
    const optVal = optOf(g, usedOpt);
    if (g.revealed && o.deal && optVal.you + optVal.them > 0 && usedOpt) lessons.push({ kind: "good", text: `Hai scoperto il loro interesse e l'hai usato (${optVal.label}): per loro valeva ${euro(optVal.them)}, a te costava ${euro(-optVal.you)}. È valore creato, non tolto a qualcuno (Fisher e Ury: interessi, non posizioni).` });
    else if (g.revealed && o.deal && !usedOpt) lessons.push({ kind: "bad", text: `Avevi scoperto cosa contava per loro (${d.issue.label.toLowerCase()}), ma non l'hai messo sul tavolo: potevi scambiarlo con un prezzo migliore.` });
    else if (!g.revealed && zopa) lessons.push({ kind: "info", text: `Non hai scoperto l'interesse nascosto: ${d.interestFromLabel || d.issue.interest} Un'etichetta giusta o una domanda calibrata l'avrebbero fatto emergere.` });
    // bluff
    if (g.youBluffed) lessons.push(g.youBluffed.caught ? { kind: "bad", text: "Hai bluffato sulla tua alternativa e ti hanno scoperto: fiducia persa, e da lì ogni tua cifra vale meno. Un bluff verificabile è un rischio, non una tecnica." } : { kind: "info", text: `Hai bluffato sulla tua alternativa (${euro(g.youBluffed.claim)}) e non ti hanno scoperto. È andata, ma con un'altra persona poteva finire la trattativa.` });
    if (g.bluffAlt) lessons.push(g.bluffCalled ? { kind: "good", text: "Hai smascherato la loro offerta inventata con una domanda calibrata, senza accusarli: da lì hanno concesso di più." } : g.bluffWorked ? { kind: "bad", text: "La loro «altra offerta» era inventata e ti ha fatto concedere molto. Davanti a un'alternativa dichiarata, chiedi con calma: «Come mai non hai già chiuso con loro?»" } : { kind: "info", text: "La loro «altra offerta» era inventata: si poteva smascherare con una domanda calibrata." });
    // esito
    if (!zopa) lessons.push(o.deal ? { kind: "bad", text: `Non c'era spazio per un accordo: il loro limite (${euro(g.R)}) era peggiore della tua alternativa (${euro(d.you.batna)}). Chiudendo hai perso valore: a volte la mossa giusta è alzarsi.` } : { kind: "good", text: `Non c'era spazio per un accordo: il loro limite era ${euro(g.R)}, peggiore della tua alternativa (${euro(d.you.batna)}). Non chiudere era la scelta giusta.` });
    else if (!o.deal) lessons.push({ kind: "bad", text: `Accordo mancato: potevi arrivare fino a ${euro(priceOf(g, g.ER, best.idx))} (${optOf(g, best.idx).label}), meglio della tua alternativa (${euro(d.you.batna)}).${o.by === "insult" ? " Se ne sono andati perché si sono sentiti presi in giro." : o.by === "time" ? " È finito il tempo: tenere duro funziona solo se ogni tanto ti muovi." : o.by === "ultimatum" ? " L'ultimatum era oltre il loro limite." : ""}` });
    else lessons.push({ kind: pct >= 60 ? "good" : "info", text: `Il loro limite era ${euro(g.R)} (${optOf(g, 0).label}); con ${optOf(g, best.idx).label} sarebbero arrivati a ${euro(priceOf(g, g.ER, best.idx))}. Hai chiuso a ${euro(o.price)}${o.opt ? `, ${optOf(g, o.opt).label}` : ""}.` });
    const grade = !zopa ? (o.deal ? "Accordo da evitare" : "Scelta giusta: niente accordo") : !o.deal ? "Accordo mancato" : pct >= 80 ? "Eccellente" : pct >= 60 ? "Buona" : pct >= 40 ? "Discreta" : "Da rifare";
    return {
      zopa, deal: !!o.deal, price: o.deal ? o.price : null, opt: o.deal ? o.opt : null, by: o.by, U, batnaU: Ub, maxU: best.u, bestOpt: best.idx,
      captured: Math.round(captured * 1000) / 1000, pct, worse, grade, lessons,
      R: g.R, O: g.O, limitWithBest: priceOf(g, g.ER, best.idx), rounds: g.round, trust: Math.round(g.trust * 100) / 100,
      passed: zopa ? (o.deal && pct >= 60) : !o.deal
    };
  }
  function recordGame(lab, g, now = Date.now()) {
    const r = result(g);
    const n = lab.nego;
    n.history.push({ t: now, deal: g.dealId, cp: g.cpId, level: g.level, pct: r.pct, zopa: r.zopa, ok: r.deal, passed: r.passed, rounds: r.rounds });
    if (n.history.length > 200) n.history = n.history.slice(-200);
    let unlocked = false;
    if (r.passed && g.level >= n.unlocked && n.unlocked < MAX_LEVEL) { n.unlocked += 1; unlocked = true; }
    logActivity(lab, "nego", now);
    return { ...r, unlocked, nextLevel: unlocked ? n.unlocked : null };
  }
  function setNegoLevel(lab, level) {
    lab.nego.level = clamp(level | 0, 1, lab.nego.unlocked);
    return lab.nego.level;
  }

  /* ============================================================ SCHEDE */
  const CARD_INTERVALS = [0, 1, 2, 4, 8, 16, 32];
  const CARDS_NEW_PER_DAY = 6;
  const CARD_IDS = Object.keys(TACTICS).flatMap((id) => [`${id}:def`, `${id}:counter`]);

  function cardQueue(lab, now = Date.now()) {
    const due = [];
    const fresh = [];
    const today = dayKey(now);
    const newToday = Object.values(lab.cards).filter((c) => c.first === today).length;
    CARD_IDS.forEach((id) => {
      const st = lab.cards[id];
      if (st) { if (st.due <= now) due.push(id); }
      else fresh.push(id);
    });
    due.sort((a, b) => lab.cards[a].due - lab.cards[b].due);
    // nuove nell'ordine del catalogo (leve, bias, trattativa, manipolazione); la contromossa di una
    // tattica arriva solo dopo averne visto la definizione
    fresh.sort((a, b) => CARD_IDS.indexOf(a) - CARD_IDS.indexOf(b));
    return { due, fresh: fresh.filter((id) => !id.endsWith(":counter") || lab.cards[id.replace(":counter", ":def")]).slice(0, Math.max(0, CARDS_NEW_PER_DAY - newToday)) };
  }
  // domanda a scelta multipla per una scheda
  function cardQuestion(id, seed = Date.now()) {
    const [tid, kind] = id.split(":");
    const t = TACTICS[tid];
    if (!t) return null;
    const rand = rng(seed);
    const same = Object.keys(TACTICS).filter((k) => k !== tid && TACTICS[k].family === t.family);
    const others = shuffle(same, rand).slice(0, 3);
    if (kind === "def") {
      const options = shuffle([tid, ...others], rand);
      return { id, kind, tid, prompt: t.def, ask: "Di che tattica si tratta?", options: options.map((k) => ({ value: k, text: TACTICS[k].label })), answer: tid };
    }
    const options = shuffle([tid, ...others], rand);
    return { id, kind, tid, prompt: `${t.family === "manip" ? "La usano su di te" : "La usano su di te"}: ${t.label.toLowerCase()}.`, ask: "Qual è la contromossa giusta?", options: options.map((k) => ({ value: k, text: TACTICS[k].counter })), answer: tid };
  }
  function cardAnswer(lab, id, ok, now = Date.now()) {
    const st = lab.cards[id] || { box: 0, due: now, right: 0, wrong: 0, first: dayKey(now) };
    if (ok) {
      st.box = Math.min(st.box + 1, CARD_INTERVALS.length - 1);
      st.right += 1;
      st.due = startOfDay(addDays(now, CARD_INTERVALS[st.box])) + 4 * 3600000;
    } else {
      st.box = 1;
      st.wrong += 1;
      st.due = now + 10 * 60000;
    }
    lab.cards[id] = st;
    logActivity(lab, "cards", now);
    return st;
  }
  const cardsLearned = (lab) => Object.values(lab.cards).filter((c) => c.box >= 3).length;

  /* ============================================================ RICONOSCI */
  const SPOT_INTERVALS = [0, 2, 7, 21];
  function spotPool(families) {
    return SPOT.filter((x) => !families || families.includes(x.family));
  }
  function makeSpotRound(lab, opts = {}, now = Date.now()) {
    const families = opts.families || ["leva", "cornice", "nego"];
    const n = opts.n || 10;
    const rand = rng(num(opts.seed) ? opts.seed : now);
    const pool = spotPool(families);
    const st = lab.spot.items;
    const due = shuffle(pool.filter((x) => st[x.id] && st[x.id].due <= now), rand);
    const unseen = shuffle(pool.filter((x) => !st[x.id]), rand);
    const rest = pool.filter((x) => st[x.id] && st[x.id].due > now).sort((a, b) => st[a.id].due - st[b.id].due);
    const chosen = [];
    [due, unseen, rest].forEach((list) => list.forEach((x) => { if (chosen.length < n && !chosen.includes(x)) chosen.push(x); }));
    const items = chosen.map((x) => ({ id: x.id, options: shuffle([x.answer, ...x.alt], rand) }));
    return { families, items, idx: 0, answers: [], startedAt: now, done: false };
  }
  function spotItem(id) { return SPOT.find((x) => x.id === id) || null; }
  function spotAnswer(lab, round, choice, ms = null, now = Date.now()) {
    if (round.done) return null;
    const cur = round.items[round.idx];
    const item = spotItem(cur.id);
    const ok = choice === item.answer;
    round.answers.push({ id: item.id, choice, ok, ms });
    const st = lab.spot.items[item.id] || { box: 0, due: now, right: 0, wrong: 0 };
    if (ok) { st.box = Math.min(st.box + 1, SPOT_INTERVALS.length - 1); st.right += 1; st.due = startOfDay(addDays(now, SPOT_INTERVALS[st.box])) + 4 * 3600000; }
    else { st.box = 0; st.wrong += 1; st.due = now; }
    lab.spot.items[item.id] = st;
    lab.spot.history.push({ t: now, id: item.id, fam: item.family, ok, ms: num(ms) ? Math.round(ms) : null });
    if (lab.spot.history.length > 600) lab.spot.history = lab.spot.history.slice(-600);
    round.idx += 1;
    if (round.idx >= round.items.length) {
      round.done = true;
      logActivity(lab, round.families.includes("manip") && round.families.length === 1 ? "defense" : "spot", now);
    }
    return { ok, item };
  }
  function spotSummary(round) {
    const right = round.answers.filter((a) => a.ok).length;
    return { right, total: round.answers.length, pct: round.answers.length ? Math.round((right / round.answers.length) * 100) : 0 };
  }

  /* ============================================================ CASI */
  function optionScore(o) { return Math.round(0.5 * o.eff + 0.3 * o.rel + 0.2 * (100 - o.risk)); }
  function caseById(id) { return CASES.find((c) => c.id === id) || null; }
  function pickCases(lab, opts = {}, now = Date.now()) {
    const n = opts.n || 2;
    const areas = opts.areas || null;
    const rand = rng(num(opts.seed) ? opts.seed : now);
    const pool = CASES.filter((c) => !areas || areas.includes(c.area));
    const seen = new Map();
    lab.cases.history.forEach((h) => seen.set(h.id, Math.max(seen.get(h.id) || 0, h.t)));
    const fresh = shuffle(pool.filter((c) => !seen.has(c.id)), rand);
    const old = pool.filter((c) => seen.has(c.id)).sort((a, b) => seen.get(a.id) - seen.get(b.id));
    return fresh.concat(old).slice(0, n).map((c) => ({ id: c.id, order: shuffle(c.options.map((_, i) => i), rand) }));
  }
  function scoreCase(c, idx) {
    const scores = c.options.map(optionScore);
    const best = Math.max(...scores);
    const bestIdx = scores.indexOf(best);
    const s = scores[idx];
    return { score: s, best, bestIdx, pts: Math.round((100 * s) / best), scores };
  }
  function recordCase(lab, id, idx, now = Date.now()) {
    const c = caseById(id);
    if (!c) return null;
    const r = scoreCase(c, idx);
    lab.cases.history.push({ t: now, id, area: c.area, pick: idx, pts: r.pts });
    if (lab.cases.history.length > 300) lab.cases.history = lab.cases.history.slice(-300);
    logActivity(lab, c.area === "difesa" ? "defense" : "cases", now);
    return r;
  }

  /* ============================================================ MANUALE */
  function markRead(lab, chapterId, now = Date.now()) {
    if (!CHAPTERS.some((c) => c.id === chapterId)) return false;
    lab.read[chapterId] = now;
    logActivity(lab, "read", now);
    return true;
  }

  /* ============================================================ GIORNO, PROFILO */
  function logActivity(lab, kind, now = Date.now()) {
    const k = dayKey(now);
    if (!lab.days.includes(k)) lab.days.push(k);
    if (lab.days.length > 400) lab.days = lab.days.slice(-400);
    lab.log.push({ t: now, kind });
    if (lab.log.length > 400) lab.log = lab.log.slice(-400);
  }
  function doneToday(lab, kind, now = Date.now()) {
    const k = dayKey(now);
    return lab.log.filter((x) => dayKey(x.t) === k && (!kind || x.kind === kind)).length;
  }
  function streak(lab, now = Date.now()) {
    const set = new Set(lab.days);
    let n = 0;
    let t = startOfDay(now);
    if (!set.has(dayKey(t))) t = addDays(t, -1);
    while (set.has(dayKey(t))) { n += 1; t = addDays(t, -1); }
    return n;
  }
  // rotazione della terza attivita' (0 = domenica)
  const ROTATION = ["read", "nego", "cases", "nego", "defense", "nego", "cases"];
  function plan(lab, now = Date.now()) {
    const steps = [];
    const unread = CHAPTERS.find((c) => !lab.read[c.id]);
    if (!Object.keys(lab.read).length && unread) {
      steps.push({ id: "read", title: `Leggi: ${unread.title}`, detail: "Si parte dalla teoria: gli esperimenti che spiegano perché le persone dicono sì.", minutes: unread.minutes || 8, done: false, go: { kind: "read", id: unread.id } });
    }
    const q = cardQueue(lab, now);
    const cardsLeft = q.due.length + q.fresh.length;
    const cardsDone = doneToday(lab, "cards", now);
    steps.push({ id: "cards", title: "Schede", detail: cardsLeft ? `${q.due.length} da ripassare, ${q.fresh.length} nuove: definizioni e contromosse.` : "Tutte ripassate per oggi.", minutes: 4, done: cardsLeft === 0 && (cardsDone > 0 || Object.keys(lab.cards).length > 0), go: { kind: "cards" } });
    steps.push({ id: "spot", title: "Riconosci la leva", detail: "10 messaggi veri: quale tattica stanno usando?", minutes: 4, done: doneToday(lab, "spot", now) > 0, go: { kind: "spot" } });
    const rot = ROTATION[new Date(now).getDay()];
    if (rot === "nego") steps.push({ id: "nego", title: "Trattativa", detail: `Una partita contro una controparte di livello ${lab.nego.level}: ${cpByLevel(lab.nego.level).label.toLowerCase()}.`, minutes: 8, done: doneToday(lab, "nego", now) > 0, go: { kind: "nego" } });
    else if (rot === "cases") steps.push({ id: "cases", title: "Due casi", detail: "Situazioni di lavoro e di classe: scegli la mossa migliore.", minutes: 5, done: doneToday(lab, "cases", now) >= 2, go: { kind: "cases" } });
    else if (rot === "defense") steps.push({ id: "defense", title: "Difesa dalla manipolazione", detail: "10 messaggi: riconosci la manipolazione e la contromossa.", minutes: 5, done: doneToday(lab, "defense", now) > 0, go: { kind: "defense" } });
    else if (unread) steps.push({ id: "read2", title: `Leggi: ${unread.title}`, detail: "Un capitolo del manuale, con gli esperimenti e le fonti.", minutes: unread.minutes || 8, done: doneToday(lab, "read", now) > 0, go: { kind: "read", id: unread.id } });
    else steps.push({ id: "nego", title: "Trattativa", detail: "Hai letto tutto il manuale: allenati in trattativa.", minutes: 8, done: doneToday(lab, "nego", now) > 0, go: { kind: "nego" } });
    return steps;
  }
  function blend(value, n, need) {
    // pochi dati: il valore parte da 35 e si avvicina al dato vero man mano
    if (!n) return 35;
    const w = Math.min(1, n / need);
    return Math.round(35 + (value - 35) * w);
  }
  function profile(lab, now = Date.now()) {
    const h = lab.spot.history;
    const persuasion = h.filter((x) => x.fam !== "manip").slice(-60);
    const manip = h.filter((x) => x.fam === "manip").slice(-40);
    const acc = (list) => (list.length ? (list.filter((x) => x.ok).length / list.length) * 100 : 0);
    const recognition = blend(acc(persuasion), persuasion.length, 20);
    const cs = lab.cases.history.filter((x) => x.area !== "difesa").slice(-10);
    const caseAvg = cs.length ? cs.reduce((s, x) => s + x.pts, 0) / cs.length : 0;
    // i punti dei casi sono relativi alla scelta migliore: 100 = sempre la migliore; 60 ~ scelta mediocre
    const leverage = blend(clamp((caseAvg - 50) * 2, 0, 100), cs.length, 6);
    const games = lab.nego.history.slice(-8);
    const negoVal = games.length ? games.reduce((s, x) => s + x.pct * (0.85 + 0.05 * x.level), 0) / games.length : 0;
    const negotiation = blend(clamp(negoVal, 0, 100), games.length, 3);
    const dcases = lab.cases.history.filter((x) => x.area === "difesa").slice(-6);
    const dAvg = dcases.length ? clamp((dcases.reduce((s, x) => s + x.pts, 0) / dcases.length - 50) * 2, 0, 100) : null;
    const dSpot = manip.length ? acc(manip) : null;
    const dVal = dAvg == null ? dSpot : dSpot == null ? dAvg : dSpot * 0.7 + dAvg * 0.3;
    const defense = blend(dVal || 0, manip.length + dcases.length * 3, 15);
    const read = Object.keys(lab.read).length;
    const knowledge = Math.round(clamp(20 + (cardsLearned(lab) / Math.max(1, CARD_IDS.length)) * 60 + (read / Math.max(1, CHAPTERS.length)) * 20, 0, 100));
    const since = startOfDay(addDays(now, -13));
    const days = lab.days.filter((k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d).getTime() >= since; }).length;
    const consistency = Math.round((days / 14) * 100);
    return [
      { key: "recognition", label: "Riconoscimento", value: recognition },
      { key: "leverage", label: "Persuasione", value: leverage },
      { key: "negotiation", label: "Negoziazione", value: negotiation },
      { key: "defense", label: "Difesa", value: defense },
      { key: "knowledge", label: "Conoscenza", value: knowledge },
      { key: "consistency", label: "Costanza", value: consistency }
    ];
  }
  function trend(lab, now = Date.now()) {
    const g = lab.nego.history.length;
    const h = lab.spot.history.length;
    if (!g && !h && !lab.cases.history.length) return "Base iniziale · parti dal manuale";
    const p = profile(lab, now);
    const parts = [];
    if (g) parts.push(`${g} ${g === 1 ? "trattativa" : "trattative"} · negoziazione ${p[2].value}`);
    if (h) parts.push(`riconoscimento ${p[0].value}`);
    if (!parts.length) parts.push(`persuasione ${p[1].value}`);
    return parts.join(" · ");
  }

  /* ============================================================ STATO */
  // partita in corso salvata (per riprenderla se chiudi l'app)
  function validGame(g) {
    return isObj(g) && g.v === 1 && !g.done && dealById(g.dealId) && cpById(g.cpId) && num(g.R) && num(g.O) && num(g.T) && num(g.E0) && num(g.ER) && Array.isArray(g.log) && Array.isArray(g.yours) && Array.isArray(g.theirs);
  }
  function ensure(x) {
    const o = isObj(x) && x.version === VERSION ? x : {};
    const cards = {};
    if (isObj(o.cards)) Object.keys(o.cards).forEach((id) => {
      const c = o.cards[id];
      if (CARD_IDS.includes(id) && isObj(c) && num(c.box) && num(c.due)) cards[id] = { box: clamp(c.box | 0, 0, CARD_INTERVALS.length - 1), due: c.due, right: num(c.right) ? c.right : 0, wrong: num(c.wrong) ? c.wrong : 0, first: typeof c.first === "string" ? c.first : "" };
    });
    const spotItems = {};
    const spot = isObj(o.spot) ? o.spot : {};
    if (isObj(spot.items)) Object.keys(spot.items).forEach((id) => {
      const c = spot.items[id];
      if (isObj(c) && num(c.box) && num(c.due)) spotItems[id] = { box: clamp(c.box | 0, 0, SPOT_INTERVALS.length - 1), due: c.due, right: num(c.right) ? c.right : 0, wrong: num(c.wrong) ? c.wrong : 0 };
    });
    const spotHist = Array.isArray(spot.history) ? spot.history.filter((h) => isObj(h) && num(h.t) && typeof h.id === "string" && typeof h.ok === "boolean").slice(-600) : [];
    const cs = isObj(o.cases) ? o.cases : {};
    const caseHist = Array.isArray(cs.history) ? cs.history.filter((h) => isObj(h) && num(h.t) && typeof h.id === "string" && num(h.pts)).slice(-300) : [];
    const ng = isObj(o.nego) ? o.nego : {};
    const negoHist = Array.isArray(ng.history) ? ng.history.filter((h) => isObj(h) && num(h.t) && num(h.pct) && num(h.level)).slice(-200) : [];
    const unlocked = clamp(Number.isInteger(ng.unlocked) ? ng.unlocked : 1, 1, MAX_LEVEL);
    const read = {};
    if (isObj(o.read)) Object.keys(o.read).forEach((k) => { if (num(o.read[k])) read[k] = o.read[k]; });
    return {
      version: VERSION,
      cards,
      spot: { items: spotItems, history: spotHist },
      cases: { history: caseHist },
      nego: { history: negoHist, unlocked, level: clamp(Number.isInteger(ng.level) ? ng.level : 1, 1, unlocked), current: validGame(ng.current) ? ng.current : null },
      read,
      days: Array.isArray(o.days) ? o.days.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-400) : [],
      log: Array.isArray(o.log) ? o.log.filter((l) => isObj(l) && num(l.t) && typeof l.kind === "string").slice(-400) : []
    };
  }

  return {
    VERSION, DAY, MAX_LEVEL, ROTATION, CARD_IDS, CARD_INTERVALS, CARDS_NEW_PER_DAY, NO_ZOPA_CHANCE,
    TACTICS, FAMILIES, DEALS, COUNTERPARTS, SPOT, CASES, CHAPTERS,
    rng, shuffle, clamp, euro, dayKey, addDays, startOfDay,
    dealById, cpById, cpByLevel, newGame, start, act, result, recordGame, setNegoLevel, optOf, youValue, marketInfo, credibility, isInsult,
    cardQueue, cardQuestion, cardAnswer, cardsLearned,
    makeSpotRound, spotItem, spotAnswer, spotSummary,
    optionScore, caseById, pickCases, scoreCase, recordCase,
    markRead, logActivity, doneToday, streak, plan, profile, trend, ensure
  };
});
