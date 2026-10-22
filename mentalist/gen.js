/*
 * Progetto A - Mentalista: generatori (senza DOM).
 *
 *  kim    gioco di Kim: un tavolo con degli oggetti da guardare per qualche secondo, poi lo stesso
 *         tavolo con qualcosa di cambiato (sparito, aggiunto, spostato, di un altro colore,
 *         scambiato, sostituito) oppure una domanda su quello che c'era. Tra le due immagini c'e'
 *         uno schermo vuoto: e' proprio il momento in cui l'occhio perde i cambiamenti
 *         (cecita' al cambiamento).
 *  liar   «Chi mente?»: un furto, alcuni sospettati, una frase a testa e una regola su chi mente.
 *         Un risolutore prova tutte le combinazioni: l'esercizio si tiene solo se il colpevole e
 *         chi mente si ricavano in un modo solo.
 * Le difficolta' (scala tipo Elo, 1000 = risolto una volta su due) sono stime coerenti tra i
 * livelli: per questi esercizi non esistono percentuali pubblicate.
 */
(function (root) {
  "use strict";

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
  const ri = (rand, lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));
  const pick = (rand, list) => list[Math.floor(rand() * list.length)];
  function shuffle(list, rand) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ============================================================ GIOCO DI KIM */
  // g: genere, pl: plurale; colors: colori possibili (indici di COLORS)
  const COLORS = [
    { key: "red", hex: "#c23b2e", it: ["rosso", "rossa", "rossi", "rosse"] },
    { key: "blue", hex: "#2f5fb3", it: ["blu", "blu", "blu", "blu"] },
    { key: "green", hex: "#2e7d4f", it: ["verde", "verde", "verdi", "verdi"] },
    { key: "yellow", hex: "#e3b22b", it: ["giallo", "gialla", "gialli", "gialle"] },
    { key: "black", hex: "#25292d", it: ["nero", "nera", "neri", "nere"] },
    { key: "white", hex: "#f3f1ea", it: ["bianco", "bianca", "bianchi", "bianche"] }
  ];
  const OBJECTS = [
    { id: "key", name: "chiave", art: "la", g: "f", colors: [3, 4, 5] },
    { id: "cup", name: "tazza", art: "la", g: "f", colors: [0, 1, 2, 3, 4, 5] },
    { id: "pen", name: "penna", art: "la", g: "f", colors: [0, 1, 2, 4] },
    { id: "phone", name: "telefono", art: "il", g: "m", colors: [1, 4, 5] },
    { id: "glasses", name: "occhiali", art: "gli", g: "m", pl: true, colors: [0, 1, 4] },
    { id: "coin", name: "moneta", art: "la", g: "f", colors: [3, 5] },
    { id: "watch", name: "orologio", art: "l'", g: "m", colors: [1, 2, 4] },
    { id: "ring", name: "anello", art: "l'", g: "m", colors: [3, 5] },
    { id: "notebook", name: "taccuino", art: "il", g: "m", colors: [0, 1, 2, 4] },
    { id: "lighter", name: "accendino", art: "l'", g: "m", colors: [0, 1, 2, 3] },
    { id: "card", name: "carta da gioco", art: "la", g: "f", colors: [0, 4] },
    { id: "die", name: "dado", art: "il", g: "m", colors: [0, 5, 2] },
    { id: "scissors", name: "forbici", art: "le", g: "f", pl: true, colors: [0, 1, 4] },
    { id: "book", name: "libro", art: "il", g: "m", colors: [0, 1, 2, 3] },
    { id: "envelope", name: "busta", art: "la", g: "f", colors: [3, 5] },
    { id: "matches", name: "scatola di fiammiferi", art: "la", g: "f", colors: [0, 1, 3] },
    { id: "clip", name: "graffetta", art: "la", g: "f", colors: [0, 1, 2] },
    { id: "usb", name: "chiavetta USB", art: "la", g: "f", colors: [0, 1, 4] },
    { id: "candle", name: "candela", art: "la", g: "f", colors: [0, 5, 3] },
    { id: "glass", name: "bicchiere", art: "il", g: "m", colors: [5, 2] },
    { id: "apple", name: "mela", art: "la", g: "f", colors: [0, 2, 3] },
    { id: "button", name: "bottone", art: "il", g: "m", colors: [0, 1, 4, 5] },
    { id: "photo", name: "foto", art: "la", g: "f", colors: [4, 5] },
    { id: "badge", name: "tesserino", art: "il", g: "m", colors: [1, 0, 2] }
  ];
  const OBJ = Object.fromEntries(OBJECTS.map((o) => [o.id, o]));
  function colorWord(o, c) {
    const idx = (o.g === "f" ? 1 : 0) + (o.pl ? 2 : 0);
    return COLORS[c].it[idx];
  }
  function objLabel(o, c) { return `${o.art}${o.art.endsWith("'") ? "" : " "}${o.name} ${colorWord(o, c)}`; }
  function objName(o) { return `${o.art}${o.art.endsWith("'") ? "" : " "}${o.name}`; }

  // livelli: n oggetti, griglia, secondi per guardare, cambiamenti, tipi possibili, quota di domande
  const KIM_LEVELS = [
    null,
    { n: 5, cols: 4, rows: 3, secs: 15, changes: 1, types: ["gone", "added"], ask: 0 },
    { n: 6, cols: 4, rows: 3, secs: 15, changes: 1, types: ["gone", "added", "moved"], ask: 0 },
    { n: 8, cols: 5, rows: 3, secs: 15, changes: 1, types: ["gone", "added", "moved", "color", "replaced"], ask: 0.3 },
    { n: 9, cols: 5, rows: 3, secs: 12, changes: 2, types: ["gone", "added", "moved", "color", "replaced", "swap"], ask: 0.3 },
    { n: 11, cols: 5, rows: 4, secs: 12, changes: 2, types: ["gone", "added", "moved", "color", "replaced", "swap"], ask: 0.35 },
    { n: 12, cols: 5, rows: 4, secs: 10, changes: 3, types: ["gone", "added", "moved", "color", "replaced", "swap"], ask: 0.35 },
    { n: 14, cols: 6, rows: 4, secs: 10, changes: 3, types: ["moved", "color", "replaced", "swap", "color", "gone"], ask: 0.4 }
  ];
  const KIM_MAX = KIM_LEVELS.length - 1;
  const KIM_DIFF = [0, 560, 690, 820, 930, 1030, 1130, 1230];

  function placeObjects(rand, lv) {
    const slots = shuffle([...Array(lv.cols * lv.rows).keys()], rand);
    const kinds = shuffle(OBJECTS.map((o) => o.id), rand).slice(0, lv.n);
    return kinds.map((id, i) => ({ id, c: pick(rand, OBJ[id].colors), s: slots[i], rot: ri(rand, -28, 28) }));
  }
  // accordo: [maschile singolare, femminile singolare, maschile plurale, femminile plurale]
  function agree(o, forms) { return forms[(o.g === "f" ? 1 : 0) + (o.pl ? 2 : 0)]; }
  // preposizione articolata: «di» + articolo
  function di(label) { return label.replace(/^(il |la |l'|gli |le )/, (m) => ({ "il ": "del ", "la ": "della ", "l'": "dell'", "gli ": "degli ", "le ": "delle " }[m])); }
  function describeChange(ch) {
    const o = OBJ[ch.id];
    if (ch.type === "gone") return `${agree(o, ["È sparito", "È sparita", "Sono spariti", "Sono sparite"])} ${objLabel(o, ch.c)}.`;
    if (ch.type === "added") return `${agree(o, ["È comparso", "È comparsa", "Sono comparsi", "Sono comparse"])} ${objLabel(o, ch.c)}.`;
    if (ch.type === "moved") return capital(`${objLabel(o, ch.c)} ${agree(o, ["è stato spostato", "è stata spostata", "sono stati spostati", "sono state spostate"])}.`);
    if (ch.type === "color") return capital(`${objName(o)} ${o.pl ? "erano" : "era"} ${colorWord(o, ch.from)}, ora ${o.pl ? "sono" : "è"} ${colorWord(o, ch.c)}.`);
    if (ch.type === "replaced") return `Al posto ${di(objLabel(o, ch.c))} adesso c'è ${objLabel(OBJ[ch.to], ch.c2)}.`;
    if (ch.type === "swap") { const b = OBJ[ch.id2]; const allF = o.g === "f" && b.g === "f"; return capital(`${objName(o)} e ${objName(b)} si sono ${allF ? "scambiate" : "scambiati"} di posto.`); }
    return "";
  }
  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function makeChanges(rand, lv, before) {
    const total = lv.cols * lv.rows;
    let after = before.map((x) => ({ ...x }));
    const changes = [];
    const touched = new Set(); // slot gia' toccati
    const free = () => [...Array(total).keys()].filter((s) => !after.some((x) => x.s === s) && !touched.has(s));
    const unusedKinds = () => OBJECTS.filter((o) => !after.some((x) => x.id === o.id) && !before.some((x) => x.id === o.id));
    let guard = 0;
    while (changes.length < lv.changes && guard < 60) {
      guard += 1;
      const type = pick(rand, lv.types);
      const candidates = after.filter((x) => !touched.has(x.s));
      if (type === "gone" && candidates.length > 2) {
        const x = pick(rand, candidates);
        after = after.filter((y) => y !== x);
        touched.add(x.s);
        changes.push({ type, id: x.id, c: x.c, slots: [x.s], before: x.s });
      } else if (type === "added" && free().length && unusedKinds().length) {
        const o = pick(rand, unusedKinds());
        const s = pick(rand, free());
        const x = { id: o.id, c: pick(rand, o.colors), s, rot: ri(rand, -28, 28) };
        after.push(x);
        touched.add(s);
        changes.push({ type, id: x.id, c: x.c, slots: [s], after: s });
      } else if (type === "moved" && candidates.length && free().length) {
        const x = pick(rand, candidates);
        const s = pick(rand, free());
        touched.add(x.s);
        touched.add(s);
        changes.push({ type, id: x.id, c: x.c, slots: [x.s, s], before: x.s, after: s });
        x.s = s;
      } else if (type === "color" && candidates.some((x) => OBJ[x.id].colors.length > 1)) {
        const x = pick(rand, candidates.filter((y) => OBJ[y.id].colors.length > 1));
        const from = x.c;
        x.c = pick(rand, OBJ[x.id].colors.filter((c) => c !== from));
        touched.add(x.s);
        changes.push({ type, id: x.id, from, c: x.c, slots: [x.s] });
      } else if (type === "replaced" && candidates.length && unusedKinds().length) {
        const x = pick(rand, candidates);
        const n = pick(rand, unusedKinds());
        const old = { id: x.id, c: x.c };
        x.id = n.id;
        x.c = n.colors.includes(old.c) ? old.c : pick(rand, n.colors);
        touched.add(x.s);
        changes.push({ type, id: old.id, c: old.c, to: x.id, c2: x.c, slots: [x.s] });
      } else if (type === "swap" && candidates.length >= 2) {
        const [a, b] = shuffle(candidates, rand).slice(0, 2);
        if (a.id === b.id) continue;
        const sa = a.s;
        a.s = b.s;
        b.s = sa;
        touched.add(a.s);
        touched.add(b.s);
        changes.push({ type, id: a.id, id2: b.id, slots: [a.s, b.s] });
      }
    }
    return { after, changes };
  }

  // domande sulla scena (quando non si mostra la seconda immagine)
  function makeQuestion(rand, lv, scene) {
    const kinds = shuffle(["color", "absent", "neighbor", "count", "where"], rand);
    for (const kind of kinds) {
      if (kind === "color") {
        const x = pick(rand, scene.filter((y) => OBJ[y.id].colors.length >= 2));
        if (!x) continue;
        const o = OBJ[x.id];
        const opts = shuffle(o.colors.length >= 4 ? o.colors : [...new Set(o.colors.concat([0, 1, 2, 3, 4, 5]))], rand).filter((c) => c !== x.c).slice(0, 3).concat([x.c]);
        const order = shuffle(opts, rand);
        return { kind, text: `Di che colore ${o.pl ? "erano" : "era"} ${objName(o)}?`, options: order.map((c) => capital(colorWord(o, c))), answer: order.indexOf(x.c) };
      }
      if (kind === "absent") {
        const missing = shuffle(OBJECTS.filter((o) => !scene.some((y) => y.id === o.id)), rand)[0];
        const present = shuffle(scene, rand).slice(0, 3).map((y) => y.id);
        const order = shuffle(present.concat([missing.id]), rand);
        return { kind, text: "Quale di questi oggetti NON c'era sul tavolo?", options: order.map((id) => capital(objName(OBJ[id]))), answer: order.indexOf(missing.id) };
      }
      if (kind === "neighbor") {
        // a destra di X, nella stessa riga e nella casella subito dopo
        const pairs = scene.filter((x) => (x.s % lv.cols) < lv.cols - 1 && scene.some((y) => y.s === x.s + 1));
        if (!pairs.length) continue;
        const x = pick(rand, pairs);
        const y = scene.find((z) => z.s === x.s + 1);
        const others = shuffle(scene.filter((z) => z !== x && z !== y), rand).slice(0, 3).map((z) => z.id);
        if (others.length < 3) continue;
        const order = shuffle(others.concat([y.id]), rand);
        return { kind, text: `Che cosa c'era subito a destra ${di(objName(OBJ[x.id]))}?`, options: order.map((id) => capital(objName(OBJ[id]))), answer: order.indexOf(y.id), slot: x.s };
      }
      if (kind === "count") {
        const n = scene.length;
        const opts = shuffle([n - 2, n - 1, n + 1, n + 2].filter((v) => v > 0), rand).slice(0, 3).concat([n]);
        const order = shuffle(opts, rand);
        return { kind, text: "Quanti oggetti c'erano sul tavolo?", options: order.map(String), answer: order.indexOf(n) };
      }
      if (kind === "where") {
        const x = pick(rand, scene);
        const col = x.s % lv.cols;
        const row = Math.floor(x.s / lv.cols);
        const v = row < lv.rows / 2 ? "in alto" : "in basso";
        const h = col < lv.cols / 2 ? "a sinistra" : "a destra";
        if ((lv.cols % 2 === 1 && col === (lv.cols - 1) / 2) || (lv.rows % 2 === 1 && row === (lv.rows - 1) / 2)) continue; // riga o colonna centrale: ambiguo
        const all = ["in alto a sinistra", "in alto a destra", "in basso a sinistra", "in basso a destra"];
        const right = `${v} ${h}`;
        return { kind, text: `In quale parte del tavolo ${OBJ[x.id].pl ? "erano" : "era"} ${objName(OBJ[x.id])}?`, options: all.map(capital), answer: all.indexOf(right) };
      }
    }
    // ripiego
    const n = scene.length;
    return { kind: "count", text: "Quanti oggetti c'erano sul tavolo?", options: [String(n - 1), String(n), String(n + 1), String(n + 2)], answer: 1 };
  }

  function makeKim(level, seed) {
    const L = Math.max(1, Math.min(KIM_MAX, level | 0 || 1));
    const lv = KIM_LEVELS[L];
    const rand = rng(seed);
    const before = placeObjects(rand, lv);
    const asking = rand() < lv.ask;
    const base = { kind: "kim", level: L, seed, cols: lv.cols, rows: lv.rows, secs: lv.secs, before, diff: KIM_DIFF[L] };
    if (asking) {
      const q = makeQuestion(rand, lv, before);
      return { ...base, mode: "ask", question: q, explain: `Risposta giusta: ${q.options[q.answer]}.` };
    }
    const { after, changes } = makeChanges(rand, lv, before);
    return { ...base, mode: "spot", after, changes, explain: changes.map(describeChange).join(" ") };
  }
  // controlla le caselle segnate: ogni cambiamento conta una volta, basta una delle sue caselle
  function kimCheck(item, marks) {
    if (!item) return { ok: false, hits: 0 };
    if (item.mode === "ask") return { ok: Number(marks) === item.question.answer, hits: Number(marks) === item.question.answer ? 1 : 0, total: 1 };
    const list = Array.isArray(marks) ? marks.map(Number) : [];
    const found = new Set();
    let extra = 0;
    list.forEach((s) => {
      const i = item.changes.findIndex((ch, k) => !found.has(k) && ch.slots.includes(s));
      if (i >= 0) found.add(i);
      else if (!item.changes.some((ch, k) => found.has(k) && ch.slots.includes(s))) extra += 1;
    });
    return { ok: found.size === item.changes.length && extra === 0, hits: found.size, total: item.changes.length, found: [...found], extra };
  }

  /* ============================================================ CHI MENTE? */
  const SUSPECTS = [
    ["Bruna", "f"], ["Carlo", "m"], ["Dario", "m"], ["Elena", "f"], ["Fabio", "m"], ["Greta", "f"],
    ["Igor", "m"], ["Lucia", "f"], ["Marco", "m"], ["Nadia", "f"], ["Paolo", "m"], ["Rita", "f"],
    ["Sergio", "m"], ["Teresa", "f"], ["Ugo", "m"], ["Vera", "f"]
  ];
  const CRIMES = [
    "Durante la cena di famiglia è sparito l'orologio d'oro del nonno.",
    "Qualcuno ha rigato la macchina nuova della direttrice nel parcheggio dell'azienda.",
    "Dalla cassa della palestra mancano 300 euro.",
    "Il quadro della hall dell'albergo è stato sostituito con una copia.",
    "Qualcuno ha mandato una mail anonima e offensiva a tutto l'ufficio dal computer della reception.",
    "Le foto del prototipo sono finite alla concorrenza.",
    "Dalla cucina del ristorante è sparita la bottiglia di vino più cara.",
    "Il cane del vicino è stato liberato dal recinto durante la notte.",
    "Dal camerino del teatro è sparito il costume della prima attrice.",
    "Qualcuno ha cancellato il file della tesi dal computer condiviso del laboratorio."
  ];
  const RULES = {
    R1: { text: "Il colpevole mente. Tutti gli altri dicono la verità.", ok: (c, t, n) => t.every((v, i) => v === (i !== c)) },
    R5: { text: "Gli innocenti dicono la verità. Il colpevole può mentire oppure no.", ok: (c, t, n) => t.every((v, i) => i === c || v) },
    R3: { text: "Una sola persona mente, e non è detto che sia il colpevole.", ok: (c, t, n) => t.filter((v) => !v).length === 1 },
    R2: { text: "Una sola persona dice la verità.", ok: (c, t, n) => t.filter(Boolean).length === 1 },
    R4: { text: "Mentono in due: il colpevole e una persona che lo copre.", ok: (c, t, n) => !t[c] && t.filter((v) => !v).length === 2 }
  };
  const LIAR_LEVELS = [
    null,
    { n: 3, rules: ["R1"], types: ["self", "accuse", "clear"] },
    { n: 4, rules: ["R1"], types: ["self", "accuse", "clear", "liar"] },
    { n: 4, rules: ["R5"], types: ["self", "accuse", "clear", "liar", "honest"] },
    { n: 4, rules: ["R3"], types: ["self", "accuse", "clear", "liar", "honest", "pair"] },
    { n: 4, rules: ["R2"], types: ["self", "accuse", "clear", "liar", "honest", "pair"] },
    { n: 5, rules: ["R4"], types: ["self", "accuse", "clear", "liar", "honest", "pair"] },
    { n: 5, rules: ["R2", "R4"], types: ["accuse", "clear", "liar", "honest", "pair", "oneof"] }
  ];
  const LIAR_MAX = LIAR_LEVELS.length - 1;
  const LIAR_DIFF = [0, 560, 690, 800, 900, 990, 1090, 1180];
  const stato = (g) => (g === "f" ? "stata" : "stato");

  function statementFor(type, s, n, rand, people) {
    const others = [...Array(n).keys()].filter((i) => i !== s);
    const x = pick(rand, others);
    const P = (i) => people[i][0];
    switch (type) {
      case "self": return { type, text: `Non sono ${stato(people[s][1])} io.`, f: (c) => c !== s };
      case "accuse": return { type, text: `È ${stato(people[x][1])} ${P(x)}.`, f: (c) => c === x };
      case "clear": return { type, text: `${P(x)} non c'entra.`, f: (c) => c !== x };
      case "liar": return { type, target: x, text: `${P(x)} mente.`, f: (c, t) => !t[x] };
      case "honest": return { type, target: x, text: `${P(x)} dice la verità.`, f: (c, t) => t[x] };
      case "pair": {
        const [a, b] = shuffle([...Array(n).keys()].filter((i) => i !== s), rand).slice(0, 2);
        return { type, text: `Il colpevole è ${P(Math.min(a, b))} oppure ${P(Math.max(a, b))}.`, f: (c) => c === a || c === b };
      }
      case "oneof": {
        const [a, b] = shuffle(others, rand).slice(0, 2);
        return { type, a, b, text: `Almeno uno tra ${P(Math.min(a, b))} e ${P(Math.max(a, b))} mente.`, f: (c, t) => !t[a] || !t[b] };
      }
      default: return { type: "self", text: `Non sono ${stato(people[s][1])} io.`, f: (c) => c !== s };
    }
  }
  function liarSolve(n, stmts, rule) {
    const out = [];
    for (let c = 0; c < n; c += 1) {
      for (let m = 0; m < (1 << n); m += 1) {
        const t = [...Array(n).keys()].map((i) => Boolean(m & (1 << i)));
        if (!RULES[rule].ok(c, t, n)) continue;
        if (stmts.every((st) => st.f(c, t) === t[st.s])) out.push({ c, t });
      }
    }
    return out;
  }
  const q = (text) => `«${String(text).replace(/\.$/, "")}»`;
  // deduzione a catena (senza tentativi): parte dalle frasi che dipendono solo dal colpevole e
  // propaga chi dice il vero e chi mente; restituisce il ragionamento fino alla contraddizione
  function deduceChain(n, stmts, rule, y, people, assume = null, depth = 0) {
    const st = Array(n).fill(null); // true = sincero, false = mente
    const steps = [];
    const N = (i) => people[i][0];
    const sinc = (i) => (people[i][1] === "f" ? "è sincera" : "è sincero");
    const fail = (msg) => { steps.push(msg); return steps.join("; "); };
    const set = (i, v, why) => {
      if (st[i] === v) return null;
      if (st[i] !== null) return fail(`${why}: ma ${N(i)} ${st[i] ? "diceva la verità" : "mentiva"}, contraddizione`);
      st[i] = v;
      steps.push(why);
      return null;
    };
    if (rule === "R1") return null; // gia' coperto altrove
    if (rule === "R5") { [...Array(n).keys()].filter((i) => i !== y).forEach((i) => { st[i] = true; }); if (!depth) steps.push("gli altri, innocenti, direbbero tutti la verità"); }
    if (rule === "R4") { st[y] = false; if (!depth) steps.push(`${N(y)}, da colpevole, mentirebbe`); }
    if (assume) {
      if (st[assume.i] !== null && st[assume.i] !== assume.v) return fail(`${N(assume.i)} non può ${assume.v ? "dire la verità" : "mentire"}`);
      st[assume.i] = assume.v;
    }
    // frasi fisse
    for (const x of stmts) {
      if (!["self", "accuse", "clear", "pair"].includes(x.type)) continue;
      const v = x.f(y, []);
      const r = set(x.s, v, `la frase di ${N(x.s)} (${q(x.text)}) sarebbe ${v ? "vera" : "falsa"}, quindi ${N(x.s)} ${v ? "direbbe la verità" : "mentirebbe"}`);
      if (r) return r;
    }
    const limits = () => {
      const liars = st.filter((v) => v === false).length;
      const honest = st.filter((v) => v === true).length;
      if (rule === "R3" && liars > 1) return fail("ma così mentirebbero in due, e la regola dice uno solo");
      if (rule === "R2" && honest > 1) return fail("ma così direbbero la verità in due, e la regola dice uno solo");
      if (rule === "R4" && liars > 2) return fail("ma così mentirebbero in tre, e la regola dice due");
      if (rule === "R4" && st[y] === true) return fail("ma il colpevole deve mentire");
      if (!st.includes(null)) {
        const L = st.map((v, i) => (v ? null : N(i))).filter(Boolean);
        if (rule === "R3" && liars !== 1) return fail(L.length ? `ma così mentirebbero ${L.join(" e ")}, e la regola dice uno solo` : "ma così nessuno mentirebbe, e la regola dice che uno mente");
        if (rule === "R2" && honest !== 1) return fail(honest ? "ma così direbbero la verità in più di uno" : "ma così mentirebbero tutti, e la regola dice che uno è sincero");
        if (rule === "R4" && liars !== 2) return fail(`ma così mentirebbe${L.length > 1 ? "ro" : ""} solo ${L.join(" e ")}, e la regola dice due`);
      }
      return null;
    };
    let r = limits();
    if (r) return r;
    for (let round = 0; round < 12; round += 1) {
      let changed = false;
      // completamento con la regola
      const liars = st.filter((v) => v === false).length;
      const honest = st.filter((v) => v === true).length;
      if (st.includes(null)) {
        if (rule === "R3" && liars === 1) { steps.push("c'è già il bugiardo, quindi tutti gli altri direbbero la verità"); st.forEach((v, i) => { if (v === null) st[i] = true; }); changed = true; }
        else if (rule === "R2" && honest === 1) { steps.push("c'è già il sincero, quindi tutti gli altri mentirebbero"); st.forEach((v, i) => { if (v === null) st[i] = false; }); changed = true; }
        else if (rule === "R4" && liars === 2) { steps.push("i due bugiardi ci sono già, quindi gli altri direbbero la verità"); st.forEach((v, i) => { if (v === null) st[i] = true; }); changed = true; }
      }
      // frasi su chi mente / chi dice il vero
      for (const x of stmts) {
        if (x.type !== "liar" && x.type !== "honest") continue;
        const tgt = x.target;
        if (tgt === undefined) continue;
        const says = x.type === "honest"; // «tgt dice la verità»
        if (st[x.s] !== null && st[tgt] === null) {
          const v = st[x.s] ? says : !says;
          r = set(tgt, v, `${N(x.s)} ${st[x.s] ? sinc(x.s) : "mente"} e dice ${q(x.text)}, quindi ${N(tgt)} ${v ? "direbbe la verità" : "mentirebbe"}`);
          if (r) return r;
          changed = true;
        } else if (st[tgt] !== null && st[x.s] === null) {
          const v = st[tgt] === says;
          r = set(x.s, v, `${N(x.s)} dice ${q(x.text)}, che sarebbe ${v ? "vero" : "falso"}: quindi ${N(x.s)} ${v ? "direbbe la verità" : "mentirebbe"}`);
          if (r) return r;
          changed = true;
        } else if (st[tgt] !== null && st[x.s] !== null && (st[tgt] === says) !== st[x.s]) {
          return fail(`${N(x.s)} dice ${q(x.text)}, che sarebbe ${st[tgt] === says ? "vero" : "falso"}, ma ${N(x.s)} ${st[x.s] ? "dovrebbe dire la verità" : "dovrebbe mentire"}`);
        }
      }
      // «almeno uno tra A e B mente»
      for (const x of stmts) {
        if (x.type !== "oneof") continue;
        const A = st[x.a];
        const B = st[x.b];
        if (st[x.s] === false && (A === null || B === null)) {
          if (A === null) { r = set(x.a, true, `${N(x.s)} mente, quindi ${N(x.a)} e ${N(x.b)} direbbero entrambi la verità`); if (r) return r; }
          if (st[x.b] === null) { r = set(x.b, true, `e anche ${N(x.b)} direbbe la verità`); if (r) return r; }
          changed = true;
        } else if (st[x.s] === true && (A === true) !== (B === true) && (A === null || B === null)) {
          const other = A === true ? x.b : x.a;
          r = set(other, false, `${N(x.s)} ${sinc(x.s)} e dice ${q(x.text)}: dato che ${N(other === x.a ? x.b : x.a)} dice la verità, ${N(other)} mentirebbe`);
          if (r) return r;
          changed = true;
        } else if (st[x.s] === null && (A === false || B === false)) {
          r = set(x.s, true, `${N(x.s)} dice ${q(x.text)}, che sarebbe vero: quindi ${N(x.s)} direbbe la verità`);
          if (r) return r;
          changed = true;
        } else if (st[x.s] === null && A === true && B === true) {
          r = set(x.s, false, `${N(x.s)} dice ${q(x.text)}, che sarebbe falso: quindi ${N(x.s)} mentirebbe`);
          if (r) return r;
          changed = true;
        } else if (st[x.s] !== null && A !== null && B !== null && ((!A || !B) !== st[x.s])) {
          return fail(`${N(x.s)} dice ${q(x.text)}, che sarebbe ${(!A || !B) ? "vero" : "falso"}, ma ${N(x.s)} ${st[x.s] ? "dovrebbe dire la verità" : "dovrebbe mentire"}`);
        }
      }
      // controllo finale delle frasi fisse dopo il completamento
      for (const x of stmts) {
        if (!["self", "accuse", "clear", "pair"].includes(x.type) || st[x.s] === null) continue;
        if (x.f(y, []) !== st[x.s]) return fail(`ma la frase di ${N(x.s)} non tornerebbe`);
      }
      r = limits();
      if (r) return r;
      if (!changed) break;
    }
    // bloccati: si prova una persona nei due modi (un solo livello di tentativi)
    if (depth === 0 && st.includes(null)) {
      const i = st.indexOf(null);
      const a = deduceChain(n, stmts, rule, y, people, { i, v: true }, 1);
      const b = deduceChain(n, stmts, rule, y, people, { i, v: false }, 1);
      if (a && b) return `${steps.length ? `${steps.join("; ")}; ` : ""}poi, se ${N(i)} dicesse la verità: ${a}; se invece mentisse: ${b}`;
    }
    return null;
  }

  // perche' un altro sospettato non puo' essere il colpevole (null = nessun motivo breve)
  function whyNot(n, stmts, rule, y, people) {
    const reasons = [];
    for (let m = 0; m < (1 << n); m += 1) {
      const t = [...Array(n).keys()].map((i) => Boolean(m & (1 << i)));
      if (!RULES[rule].ok(y, t, n)) continue;
      const bad = stmts.find((st) => st.f(y, t) !== t[st.s]);
      if (bad) reasons.push({ t, bad });
    }
    const name = people[y][0];
    const se = `Se fosse ${stato(people[y][1])} ${name}`;
    const line = (t, bad) => `la frase di ${people[bad.s][0]} (${q(bad.text)}) sarebbe ${bad.f(y, t) ? "vera" : "falsa"}, ma ${people[bad.s][0]} ${t[bad.s] ? "dovrebbe dire la verità" : "dovrebbe mentire"}`;
    // conteggio con le sole frasi che dipendono solo dal colpevole (accuse, discolpe)
    const fixed = stmts.filter((st) => ["self", "accuse", "clear", "pair"].includes(st.type));
    const vals = fixed.map((st) => ({ st, v: st.f(y, []) }));
    const falses = vals.filter((x) => !x.v);
    const trues = vals.filter((x) => x.v);
    const who = (list) => list.slice(0, 3).map((x) => `${people[x.st.s][0]} (${q(x.st.text)})`).join(list.length > 2 ? ", " : " e ");
    const own = vals.find((x) => x.st.s === y);
    if ((rule === "R1" || rule === "R4") && own && own.v) return `${se}, la sua frase ${q(own.st.text)} sarebbe vera: ma il colpevole mente.`;
    if (rule === "R3" && falses.length >= 2) return `${se}, mentirebbero almeno in due, ${who(falses)}: ma mente una sola persona.`;
    if (rule === "R2" && trues.length >= 2) return `${se}, direbbero la verità almeno in due, ${who(trues)}: ma il sincero è uno solo.`;
    if (rule === "R4" && falses.length >= 3) return `${se}, mentirebbero almeno in tre, ${who(falses)}: ma i bugiardi sono due.`;
    if (rule === "R4" && falses.filter((x) => x.st.s !== y).length >= 2) return `${se}, oltre a ${people[y][1] === "f" ? "lei" : "lui"} mentirebbero anche ${who(falses.filter((x) => x.st.s !== y))}: troppi, i bugiardi sono due.`;
    const chain = deduceChain(n, stmts, rule, y, people);
    if (chain) return `${se}: ${chain}.`;
    const firsts = new Set(reasons.map((r) => r.bad.s));
    if (firsts.size === 1 && reasons.length) {
      const st = reasons[0].bad;
      if (reasons.length === 1) {
        const { t, bad } = reasons[0];
        const liars = t.map((v, i) => (v ? null : people[i][0])).filter(Boolean);
        const lead = rule === "R1" ? `${se}, mentirebbe solo ${name}` : `${se}, per rispettare la regola ${liars.length ? `mentirebbe${liars.length > 1 ? "ro" : ""} ${liars.join(" e ")}` : "direbbero tutti la verità"}`;
        return `${lead}: ${line(t, bad)}.`;
      }
      return `${se}, comunque si scelga chi mente, la frase di ${people[st.s][0]} (${q(st.text)}) non torna.`;
    }
    if (rule === "R5" && reasons.length === 2) {
      const lie = reasons.find((r) => !r.t[y]);
      const tru = reasons.find((r) => r.t[y]);
      if (lie && tru) return `${se}: se mentisse, ${line(lie.t, lie.bad)}; se dicesse la verità, ${line(tru.t, tru.bad)}.`;
    }
    return null;
  }
  const TIPS = {
    R1: "Fai un'ipotesi alla volta: se il colpevole è X, mente solo X e tutte le altre frasi devono essere vere.",
    R5: "Gli innocenti dicono il vero: parti da chi accusa o scagiona qualcuno e chiediti se può essere innocente.",
    R3: "Cerca due frasi che si contraddicono: chi mente è per forza uno dei due, quindi tutti gli altri dicono il vero.",
    R2: "Cerca due frasi che non possono essere entrambe false (per esempio Y dice «X mente» e X dice qualcosa su Y): il solo sincero è uno di quei due, tutti gli altri mentono e le loro frasi vanno rovesciate.",
    R4: "Due bugiardi, e uno è il colpevole: prova un'ipotesi, rovescia le frasi di chi mente e controlla che tutto torni."
  };

  function makeLiar(level, seed) {
    const L = Math.max(1, Math.min(LIAR_MAX, level | 0 || 1));
    const lv = LIAR_LEVELS[L];
    for (let attempt = 0; attempt < 600; attempt += 1) {
      const rand = rng((seed + attempt * 7919) >>> 0);
      const n = lv.n;
      const people = shuffle(SUSPECTS, rand).slice(0, n).sort((a, b) => a[0].localeCompare(b[0]));
      const rule = pick(rand, lv.rules);
      const stmts = people.map((_, s) => ({ s, ...statementFor(pick(rand, lv.types), s, n, rand, people) }));
      const sols = liarSolve(n, stmts, rule);
      if (sols.length !== 1) continue;
      const sol = sols[0];
      // niente esercizi in cui il colpevole si ricava da una sola frase: almeno due frasi devono servire
      const needed = stmts.filter((st, i) => liarSolve(n, stmts.filter((_, k) => k !== i), rule).length !== 1).length;
      if (n >= 4 && needed < 2) continue;
      if (L >= 3 && !stmts.some((st) => st.type === "liar" || st.type === "honest" || st.type === "oneof")) continue;
      const crime = pick(rand, CRIMES);
      const names = people.map((p) => p[0]);
      const check = stmts.map((st) => `${names[st.s]} dice ${q(st.text)}: è ${st.f(sol.c, sol.t) ? "vero" : "falso"}, e infatti ${names[st.s]} ${sol.t[st.s] ? "dice la verità" : "mente"}.`);
      const elim = [];
      const rest = [];
      [...Array(n).keys()].filter((y) => y !== sol.c).forEach((y) => { const w = whyNot(n, stmts, rule, y, people); if (w) elim.push(w); else rest.push(names[y]); });
      if (rest.length) elim.push(`Con ${rest.length === 1 ? rest[0] : `${rest.slice(0, -1).join(", ")} o ${rest[rest.length - 1]}`} come colpevole non c'è nessun modo di scegliere chi mente rispettando la regola: ogni combinazione lascia almeno una frase che non torna.`);
      return {
        kind: "liar", level: L, seed, n, names, genders: people.map((p) => p[1]), crime, rule, ruleText: RULES[rule].text,
        statements: stmts.map((st) => ({ who: names[st.s], text: st.text })),
        culprit: sol.c, truth: sol.t, diff: LIAR_DIFF[L],
        check, elim, tip: TIPS[rule],
        explain: `${check.join(" ")} ${elim.join(" ")}`
      };
    }
    // ripiego
    return {
      kind: "liar", level: 1, seed, n: 3, names: ["Bruna", "Carlo", "Dario"], genders: ["f", "m", "m"], crime: CRIMES[0], rule: "R1", ruleText: RULES.R1.text,
      statements: [{ who: "Bruna", text: "È stato Carlo." }, { who: "Carlo", text: "Non sono stato io." }, { who: "Dario", text: "Bruna non c'entra." }],
      culprit: 1, truth: [true, false, true], diff: LIAR_DIFF[1], check: [], elim: [], tip: TIPS.R1,
      explain: "Se fosse stato Carlo, mentirebbe solo lui: Bruna e Dario dicono il vero e torna tutto. Con chiunque altro, la frase di Bruna sarebbe falsa ma Bruna dovrebbe dire la verità."
    };
  }

  const api = {
    rng, shuffle, COLORS, OBJECTS, OBJ, KIM_LEVELS, KIM_MAX, KIM_DIFF, LIAR_LEVELS, LIAR_MAX, LIAR_DIFF, RULES,
    colorWord, objLabel, objName, describeChange,
    makeKim, kimCheck, makeLiar, liarSolve
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MentalistGen = api;
})(typeof window !== "undefined" ? window : globalThis);
