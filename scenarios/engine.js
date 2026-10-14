/*
 * Progetto A - Scenari: motore di valutazione (senza DOM, testabile con Node).
 *
 * - Esami speciali: 3 round a scelta multipla + una frase da scrivere.
 *   Il punteggio viene dalle scelte (qualita' di ogni mossa) e dalla frase.
 * - Frase: chiavi specifiche dello scenario + segnali di comunicazione
 *   (accuse, attenuazioni, minacce, richiesta concreta, frasi in prima persona).
 * - Profilo a 6 categorie: cambia dopo ogni esame in base alle mosse scelte,
 *   pesato per difficolta'; le ripetizioni contano poco.
 * - Classe stile Classroom of the Elite (D, C, B, A) e punti privati.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.ScenarioEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 1;
  const START_VALUE = 40;
  const MAX_EXAM_CHANGE = 8;
  const REPLAY_WEIGHT = 0.25;
  const FREE_WEIGHT = 0.6;

  const DIMENSIONS = [
    { key: "lettura", label: "Lettura", text: "Capire cosa sta succedendo davvero: fatti, segnali, motivi nascosti." },
    { key: "autocontrollo", label: "Autocontrollo", text: "Non reagire d'impulso, prendere tempo, non regalare scenate." },
    { key: "assertivita", label: "Assertività", text: "Dire con chiarezza cosa vuoi e cosa non accetti." },
    { key: "empatia", label: "Empatia", text: "Tenere conto di cosa provano e cosa temono gli altri." },
    { key: "strategia", label: "Strategia", text: "Leve, tempi, alternative e piano B: pensare due mosse avanti." },
    { key: "etica", label: "Etica", text: "Vincere pulito: niente bugie, ricatti o umiliazioni." }
  ];
  const DIM_KEYS = DIMENSIONS.map((d) => d.key);

  const CATEGORIES = {
    lavoro: { label: "Lavoro e clienti", mentor: "horikita" },
    negoziazione: { label: "Negoziazione", mentor: "sakayanagi" },
    leadership: { label: "Leadership", mentor: "horikita" },
    pressione: { label: "Pressione di gruppo", mentor: "ryuen" },
    confini: { label: "Confini", mentor: "horikita" },
    reputazione: { label: "Reputazione", mentor: "kushida" },
    manipolazione: { label: "Manipolazione", mentor: "ayanokoji" },
    crisi: { label: "Crisi", mentor: "ayanokoji" }
  };

  const DIFFICULTY_LABELS = { 1: "Base", 2: "Base", 3: "Intermedio", 4: "Avanzato", 5: "Esperto" };

  const QUALITY = {
    best: { points: 100, label: "Mossa migliore" },
    good: { points: 72, label: "Buona" },
    weak: { points: 38, label: "Debole" },
    bad: { points: 8, label: "Errore" }
  };

  // Classi: il profilo decide la classe, ma servono anche esami fatti davvero.
  const CLASSES = [
    { key: "D", name: "Classe D", min: 0, exams: 0, hard: 0, text: "Si parte da qui: leggi, scegli, impara dagli errori." },
    { key: "C", name: "Classe C", min: 50, exams: 4, hard: 0, text: "Profilo almeno 50 e 4 esami completati." },
    { key: "B", name: "Classe B", min: 65, exams: 10, hard: 3, text: "Profilo almeno 65, 10 esami di cui 3 avanzati o esperti." },
    { key: "A", name: "Classe A", min: 80, exams: 18, hard: 6, text: "Profilo almeno 80, 18 esami di cui 6 avanzati o esperti, tutte le categorie provate." }
  ];

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[’`´]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function wordCount(text) {
    const t = String(text || "").trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function countTerms(text, terms) {
    return terms.reduce((n, term) => n + (text.includes(term) ? 1 : 0), 0);
  }

  // Mescola (Fisher-Yates) con un generatore opzionale, per i test.
  function shuffle(list, random = Math.random) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /* ------------------------------------------------------- frase scritta */

  const SIGNALS = {
    accuse: ["tu sei", "sei sempre", "sei un ", "sei una ", "colpa tua", "non capisci", "fai sempre", "non fai mai", "ridicol", "stupid", "idiot", "vergognati", "incapace", "sei il solito", "sei la solita"],
    threat: ["te la faccio pagare", "ti rovino", "ti denuncio", "vedrai che", "te ne pentirai", "ti distruggo", "ti faccio licenziare", "lo dico a tutti"],
    hedge: ["scusa", "scusami", "forse", "magari", "non so se", "se non ti dispiace", "mi dispiace disturbare", "un attimo solo", "piccola cosa", "se possibile eh"],
    self: [" io ", "per me", "ho notato", "mi serve", "preferisco", "propongo", "vorrei", "mi aspetto", "ci tengo", "ho bisogno", "la mia ", "il mio "],
    request: [" puoi ", "potresti", "ti chiedo", "vi chiedo", "propongo", " entro ", "domani", "lunedi", "martedi", "mercoledi", "giovedi", "venerdi", " alle ", "facciamo", "fissiamo", "ci sentiamo", "ti mando", "ti invio", "possiamo"],
    empathy: ["capisco", "immagino", "ha senso", "comprendo", "grazie", "apprezzo", "mi rendo conto", "comprensibile", " so che"]
  };

  function readSignals(text) {
    const t = ` ${normalize(text)} `;
    const found = {};
    Object.entries(SIGNALS).forEach(([key, terms]) => {
      found[key] = countTerms(t, terms);
    });
    found.question = /\?/.test(String(text || "")) ? 1 : 0;
    found.numbers = /\d/.test(String(text || "")) ? 1 : 0;
    return found;
  }

  /*
   * Valuta una frase: keys = [{ label, terms }]. Restituisce punteggio 0-100,
   * chiavi trovate/mancanti, consigli brevi e piccoli effetti sul profilo.
   */
  function evalPhrase(text, keys = []) {
    const words = wordCount(text);
    const t = ` ${normalize(text)} `;
    if (words === 0) return { score: 0, words, hits: [], misses: keys.map((k) => k.label), signals: {}, notes: [], effects: {}, empty: true };
    const hits = [];
    const misses = [];
    keys.forEach((key) => {
      const ok = key.terms.some((term) => t.includes(normalize(term)));
      (ok ? hits : misses).push(key.label);
    });
    const s = readSignals(text);
    const keyPart = keys.length ? (hits.length / keys.length) * 60 : 40;
    let score = keyPart;
    if (words >= 8 && words <= 70) score += 10;
    else if (words < 5) score -= 10;
    else if (words > 90) score -= 5;
    if (s.self) score += 8;
    if (s.request || s.numbers) score += 8;
    if (s.empathy) score += 6;
    if (s.question) score += 4;
    score -= Math.min(12, s.hedge * 4);
    score -= Math.min(24, s.accuse * 12);
    if (s.threat) score -= 20;
    score = Math.round(clamp(score, 0, 100));

    const notes = [];
    if (s.threat) notes.push({ tone: "bad", text: "C'è una minaccia: anche se ti dà forza adesso, ti toglie credibilità e alza lo scontro." });
    if (s.accuse) notes.push({ tone: "bad", text: "Togli le accuse (\"tu sei…\", \"fai sempre…\"): descrivi il comportamento e cosa chiedi." });
    misses.forEach((label) => notes.push({ tone: "miss", text: `Manca: ${label.toLowerCase()}.` }));
    if (s.hedge >= 2) notes.push({ tone: "miss", text: "Troppe attenuazioni (\"scusa\", \"forse\", \"magari\"): ne basta una, o nessuna." });
    if (!s.request && !s.numbers && !s.question) notes.push({ tone: "miss", text: "Chiudi con un passo concreto: una richiesta, un orario, una proposta." });
    if (words < 5) notes.push({ tone: "miss", text: "È troppo corta per far capire cosa vuoi." });
    else if (words > 90) notes.push({ tone: "miss", text: "È lunga: taglia a 2-3 frasi, chi ascolta ricorda solo l'inizio e la fine." });
    if (hits.length) notes.push({ tone: "good", text: `Bene: ${hits.map((h) => h.toLowerCase()).join(", ")}.` });
    if (s.self && !s.accuse) notes.push({ tone: "good", text: "Parli in prima persona invece di accusare: tiene basse le difese." });

    const effects = {};
    const add = (k, v) => {
      if (v) effects[k] = (effects[k] || 0) + v;
    };
    add("assertivita", score >= 70 ? 1 : score < 40 ? -1 : 0);
    if (s.request || s.numbers) add("strategia", 1);
    if (s.empathy) add("empatia", 1);
    if (s.hedge >= 2) add("assertivita", -1);
    if (s.accuse) {
      add("empatia", -1);
      add("autocontrollo", -1);
    }
    if (s.threat) add("etica", -2);
    return { score, words, hits, misses, signals: s, notes: notes.slice(0, 5), effects };
  }

  /* ------------------------------------------------------- esame speciale */

  function gradeFor(score) {
    if (score >= 92) return "S";
    if (score >= 80) return "A";
    if (score >= 65) return "B";
    if (score >= 50) return "C";
    return "D";
  }

  /*
   * choices: [{ round, quality, effects, text }] (una per round)
   * phrase: risultato di evalPhrase oppure null se saltata
   */
  function scoreExam(scenario, choices, phrase) {
    const roundPoints = choices.map((c) => (QUALITY[c.quality] || QUALITY.weak).points);
    const roundsAvg = roundPoints.length ? roundPoints.reduce((a, b) => a + b, 0) / roundPoints.length : 0;
    const phraseScore = phrase && !phrase.empty ? phrase.score : 0;
    const score = Math.round(roundsAvg * 0.8 + phraseScore * 0.2);
    const effects = {};
    choices.forEach((c) => {
      Object.entries(c.effects || {}).forEach(([k, v]) => {
        if (DIM_KEYS.includes(k)) effects[k] = (effects[k] || 0) + v;
      });
    });
    if (phrase && !phrase.empty) {
      Object.entries(phrase.effects || {}).forEach(([k, v]) => {
        effects[k] = (effects[k] || 0) + v;
      });
    }
    // cosa avresti guadagnato con la mossa migliore, per categoria
    const missed = {};
    choices.forEach((c) => {
      const round = scenario.rounds[c.round];
      const best = round && round.options.find((o) => o.quality === "best");
      if (!best || c.quality === "best") return;
      DIM_KEYS.forEach((k) => {
        const gap = ((best.effects || {})[k] || 0) - ((c.effects || {})[k] || 0);
        if (gap > 0) missed[k] = (missed[k] || 0) + gap;
      });
    });
    return { score, grade: gradeFor(score), roundsAvg: Math.round(roundsAvg), phraseScore, effects, missed };
  }

  function privatePoints(scenario, score, replay) {
    if (replay) return 0;
    return Math.round((scenario.difficulty || 2) * 20 * (score / 100));
  }

  /* ---------------------------------------------------------- profilo */

  function ensureProfile(raw) {
    const p = raw && typeof raw === "object" && raw.version === VERSION ? raw : { version: VERSION };
    DIM_KEYS.forEach((k) => {
      if (typeof p[k] !== "number" || Number.isNaN(p[k])) p[k] = START_VALUE;
    });
    if (!Array.isArray(p.history)) p.history = [];
    if (!p.completed || typeof p.completed !== "object") p.completed = {};
    if (typeof p.pp !== "number") p.pp = 0;
    if (typeof p.freeCount !== "number") p.freeCount = 0;
    return p;
  }

  function total(profile) {
    const p = ensureProfile(profile);
    return Math.round(DIM_KEYS.reduce((sum, k) => sum + Math.round(p[k]), 0) / DIM_KEYS.length);
  }

  // Applica gli effetti grezzi: piu' difficile = guadagni di piu' e perdi meno.
  function scaleEffects(effects, { difficulty = 2, weight = 1 } = {}) {
    const kPos = 0.8 + 0.1 * difficulty;
    const kNeg = 1.2 - 0.1 * difficulty;
    const out = {};
    DIM_KEYS.forEach((k) => {
      const raw = effects[k] || 0;
      if (!raw) return;
      const scaled = raw * (raw > 0 ? kPos : kNeg) * weight;
      out[k] = Math.round(clamp(scaled, -MAX_EXAM_CHANGE, MAX_EXAM_CHANGE) * 10) / 10;
    });
    return out;
  }

  function applyChanges(profile, changes) {
    const p = ensureProfile(profile);
    const applied = {};
    DIM_KEYS.forEach((k) => {
      if (!changes[k]) return;
      const before = p[k];
      p[k] = Math.round(clamp(before + changes[k], 10, 99) * 10) / 10;
      applied[k] = Math.round((p[k] - before) * 10) / 10;
    });
    return applied;
  }

  /*
   * Registra un esame completato. Restituisce { changes, pp, replay, result }.
   */
  function recordExam(profile, scenario, choices, phrase, { date = new Date().toISOString() } = {}) {
    const p = ensureProfile(profile);
    const prev = p.completed[scenario.id];
    const replay = Boolean(prev);
    const result = scoreExam(scenario, choices, phrase);
    const weight = replay ? REPLAY_WEIGHT : 1;
    const changes = applyChanges(p, scaleEffects(result.effects, { difficulty: scenario.difficulty, weight }));
    const pp = privatePoints(scenario, result.score, replay);
    p.pp += pp;
    p.completed[scenario.id] = {
      attempts: (prev ? prev.attempts : 0) + 1,
      best: Math.max(prev ? prev.best : 0, result.score),
      grade: prev && prev.best > result.score ? prev.grade : result.grade,
      first: prev ? prev.first : result.score,
      date
    };
    p.history.unshift({
      kind: "exam",
      id: scenario.id,
      title: scenario.title,
      category: scenario.category,
      difficulty: scenario.difficulty,
      score: result.score,
      grade: result.grade,
      replay,
      pp,
      changes,
      missed: result.missed,
      date
    });
    p.history = p.history.slice(0, 60);
    p.last = { id: scenario.id, changes, date };
    return { changes, pp, replay, result };
  }

  /* ----------------------------------------------------- risposta libera */

  const FREE_MARKERS = {
    observe: ["osservo", "noto", " vedo", "sembra", "potrebbe", "non so", "verific", "chiedo", "fatti", "segnal", "capire se", "prima di", "contesto", " tono", " chi "],
    hypothesis: ["forse", "potrebbe", "magari", "ipotesi", "non e' detto", "o forse", "oppure"],
    planB: [" se ", "nel caso", "altrimenti", "se continua", "se insiste", "se non", " dopo", "a quel punto", "in quel caso"],
    planAction: ["parlo con", "ne parlo", "chiudo", "mi allontano", "segnal", "per iscritto", "riepilogo", "coinvolgo", "rimando", "fisso", "chiedo aiuto", "lascio", "interrompo", "documento", "salvo"],
    calm: ["calma", "respiro", "aspetto", "non reagisco", "a freddo", "in privato", "a parte", "con ordine"]
  };

  const DIRTY = ["ricatt", "bugia", " mento ", "umili", "minacc", "vendetta", "manipolo", "sputtan", "lo dico a tutti", "insult", "urlo", "picchio", "spingo", "colpisco"];

  /*
   * answers: { observe, say, planB }; scenario: { ideal: [], traps: [] }
   * Valuta le tre parti e restituisce punteggi, consigli ed effetti (gia' pesati).
   */
  function evalFree(answers, scenario) {
    const obs = normalize(answers.observe);
    const plan = normalize(answers.planB);
    const all = normalize(`${answers.observe} ${answers.say} ${answers.planB}`);
    const ideal = (scenario.ideal || []).map(normalize);
    const traps = (scenario.traps || []).map(normalize).concat(DIRTY);
    const dirty = countTerms(` ${all} `, traps);
    const idealHits = ideal.filter((term) => all.includes(term));

    const obsWords = wordCount(answers.observe);
    let observe = obsWords ? 25 + Math.min(30, obsWords * 1.2) + countTerms(` ${obs} `, FREE_MARKERS.observe) * 7 + (countTerms(` ${obs} `, FREE_MARKERS.hypothesis) ? 8 : 0) : 0;
    observe = Math.round(clamp(observe, 0, 100));

    // la frase: segnali di comunicazione + elementi chiave della scena
    const say = evalPhrase(answers.say, []);
    const sayText = normalize(answers.say);
    const sayIdeal = ideal.filter((term) => sayText.includes(term)).length;
    if (!say.empty) say.score = Math.round(clamp(say.score + Math.min(24, sayIdeal * 8), 0, 100));

    const planWords = wordCount(answers.planB);
    let planB = planWords ? 20 + Math.min(25, planWords * 1.2) + (countTerms(` ${plan} `, FREE_MARKERS.planB) ? 18 : 0) + Math.min(3, countTerms(` ${plan} `, FREE_MARKERS.planAction)) * 10 : 0;
    planB = Math.round(clamp(planB, 0, 100));

    const ethics = Math.round(clamp(90 - dirty * 25, 0, 100));
    const calm = countTerms(` ${all} `, FREE_MARKERS.calm);
    const control = Math.round(clamp(55 + calm * 10 - dirty * 15 - (say.signals.accuse || 0) * 10, 0, 100));
    const parts = { observe, say: say.score, planB, ethics, control };
    const score = Math.round(observe * 0.25 + say.score * 0.35 + planB * 0.25 + ethics * 0.1 + control * 0.05);

    const notes = [];
    if (!obsWords) notes.push({ part: "observe", tone: "miss", text: "Scrivi cosa osservi e cosa non sai ancora: è da lì che parte una buona mossa." });
    else if (observe < 60) notes.push({ part: "observe", tone: "miss", text: "Separa i fatti (\"noto che…\") dalle ipotesi (\"potrebbe essere…\") e scrivi come lo verifichi." });
    else notes.push({ part: "observe", tone: "good", text: "Buona lettura: distingui cosa vedi da cosa ipotizzi." });
    say.notes.slice(0, 3).forEach((n) => notes.push({ part: "say", tone: n.tone, text: n.text }));
    if (!planWords) notes.push({ part: "planB", tone: "miss", text: "Manca il piano B: cosa fai se la prima mossa non funziona?" });
    else if (planB < 60) notes.push({ part: "planB", tone: "miss", text: "Rendi il piano B concreto: \"se succede X, allora faccio Y\" (parlo con…, metto per iscritto…, chiudo…)." });
    else notes.push({ part: "planB", tone: "good", text: "Piano B concreto, con una condizione e un'azione." });
    if (dirty) notes.push({ part: "ethics", tone: "bad", text: "Ci sono leve sporche o reazioni aggressive: funzionano un giorno, poi ti costano reputazione." });
    if (idealHits.length) notes.push({ part: "say", tone: "good", text: `Hai colto elementi chiave della scena: ${idealHits.slice(0, 4).join(", ")}.` });

    const raw = {
      lettura: Math.round((observe - 50) / 15),
      assertivita: Math.round((say.score - 50) / 15),
      strategia: Math.round((planB - 50) / 15),
      etica: dirty ? -2 : ethics >= 85 ? 1 : 0,
      autocontrollo: Math.round((control - 55) / 15),
      empatia: say.signals.empathy ? 1 : (say.signals.accuse ? -1 : 0)
    };
    Object.keys(raw).forEach((k) => {
      if (!raw[k]) delete raw[k];
    });
    return { score, grade: gradeFor(score), parts, notes, say, raw, idealHits };
  }

  function recordFree(profile, scenario, evaluation, { date = new Date().toISOString() } = {}) {
    const p = ensureProfile(profile);
    const changes = applyChanges(p, scaleEffects(evaluation.raw, { difficulty: scenario.difficulty || 2, weight: FREE_WEIGHT }));
    p.freeCount += 1;
    p.history.unshift({ kind: "free", id: scenario.id, title: scenario.title, category: scenario.category || "libera", difficulty: scenario.difficulty || 2, score: evaluation.score, grade: evaluation.grade, changes, date });
    p.history = p.history.slice(0, 60);
    p.last = { id: scenario.id, changes, date };
    return { changes };
  }

  /* ----------------------------------------------------- classe e consigli */

  function classFor(profile, scenarios = []) {
    const p = ensureProfile(profile);
    const score = total(p);
    const done = Object.keys(p.completed);
    const byId = new Map(scenarios.map((s) => [s.id, s]));
    const hard = done.filter((id) => (byId.get(id) || {}).difficulty >= 4).length;
    const cats = new Set(done.map((id) => (byId.get(id) || {}).category).filter(Boolean));
    const allCats = Object.keys(CATEGORIES).every((c) => cats.has(c));
    let current = CLASSES[0];
    CLASSES.forEach((c) => {
      const ok = score >= c.min && done.length >= c.exams && hard >= c.hard && (c.key !== "A" || allCats);
      if (ok) current = c;
    });
    const index = CLASSES.indexOf(current);
    const next = CLASSES[index + 1] || null;
    const needs = [];
    if (next) {
      if (score < next.min) needs.push(`profilo ${score}/${next.min}`);
      if (done.length < next.exams) needs.push(`esami ${done.length}/${next.exams}`);
      if (hard < next.hard) needs.push(`avanzati ${hard}/${next.hard}`);
      if (next.key === "A" && !allCats) needs.push(`categorie ${cats.size}/${Object.keys(CATEGORIES).length}`);
    }
    return { current, next, needs, score, done: done.length, hard };
  }

  // Dove perdi piu' punti: somma dei "mancati" (mossa migliore - mossa scelta).
  function weakness(profile) {
    const p = ensureProfile(profile);
    const missed = {};
    p.history.filter((h) => h.kind === "exam").slice(0, 20).forEach((h) => {
      Object.entries(h.missed || {}).forEach(([k, v]) => {
        missed[k] = (missed[k] || 0) + v;
      });
    });
    const ranked = Object.entries(missed).sort((a, b) => b[1] - a[1]);
    if (ranked.length) return { key: ranked[0][0], amount: ranked[0][1], source: "errors" };
    const lowest = DIM_KEYS.slice().sort((a, b) => p[a] - p[b])[0];
    return { key: lowest, amount: 0, source: "profile" };
  }

  // Quanto un esame allena una categoria: effetti delle mosse migliori.
  function focusOf(scenario) {
    const sum = {};
    scenario.rounds.forEach((r) => {
      const best = r.options.find((o) => o.quality === "best") || {};
      Object.entries(best.effects || {}).forEach(([k, v]) => {
        if (v > 0) sum[k] = (sum[k] || 0) + v;
      });
    });
    return sum;
  }

  function recommend(profile, scenarios) {
    const p = ensureProfile(profile);
    const weak = weakness(p);
    const level = classFor(p, scenarios).current.key;
    const target = { D: 2, C: 3, B: 4, A: 5 }[level] || 2;
    const fresh = scenarios.filter((s) => !p.completed[s.id]);
    const pool = fresh.length ? fresh : scenarios;
    const ranked = pool
      .map((s) => ({ s, value: (focusOf(s)[weak.key] || 0) * 2 - Math.abs((s.difficulty || 2) - target) * 1.5 }))
      .sort((a, b) => b.value - a.value);
    return { scenario: ranked.length ? ranked[0].s : null, weakness: weak };
  }

  return {
    VERSION,
    START_VALUE,
    MAX_EXAM_CHANGE,
    REPLAY_WEIGHT,
    DIMENSIONS,
    DIM_KEYS,
    CATEGORIES,
    DIFFICULTY_LABELS,
    QUALITY,
    CLASSES,
    normalize,
    wordCount,
    shuffle,
    readSignals,
    evalPhrase,
    gradeFor,
    scoreExam,
    privatePoints,
    ensureProfile,
    total,
    scaleEffects,
    applyChanges,
    recordExam,
    evalFree,
    recordFree,
    classFor,
    weakness,
    focusOf,
    recommend
  };
});
