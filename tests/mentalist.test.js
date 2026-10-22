/*
 * Test del mentalista: gioco di Kim (cambiamenti coerenti, controllo delle risposte), «Chi mente?»
 * (soluzione unica ricontrollata da un risolutore indipendente che rilegge le frasi, spiegazioni
 * sempre presenti), interrogatori (il colpevole si contraddice solo se chiedi prima di mostrare,
 * l'innocente mai), lettura, casi (fatti raggiungibili, prove ottenibili con le mosse, punteggio),
 * lezioni, punteggio Elo, programma, profilo e stato rovinato.
 *
 *   node tests/mentalist.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const dir = path.join(__dirname, "..", "mentalist");
const G = require(path.join(dir, "gen.js"));
const I = require(path.join(dir, "interro.js"));
const R = require(path.join(dir, "reading.js"));
const C = require(path.join(dir, "cases.js"));
const D = require(path.join(dir, "data.js"));
const E = require(path.join(dir, "engine.js"));

let passed = 0;
const failed = [];
function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failed.push(name);
    console.error(`FALLITO: ${name}\n  ${error.stack || error.message}`);
  }
}
const T0 = new Date(2026, 9, 22, 9, 0, 0).getTime();

/* ------------------------------------------------------------ Kim */
test("Gioco di Kim: tavoli coerenti a ogni livello, cambiamenti del numero giusto", () => {
  for (let lv = 1; lv <= G.KIM_MAX; lv += 1) {
    const L = G.KIM_LEVELS[lv];
    for (let i = 0; i < 60; i += 1) {
      const it = G.makeKim(lv, 500 + i * 7919 + lv);
      const total = it.cols * it.rows;
      assert.strictEqual(it.before.length, L.n);
      const slots = new Set(it.before.map((x) => x.s));
      assert.strictEqual(slots.size, it.before.length, "due oggetti nella stessa casella");
      assert.strictEqual(new Set(it.before.map((x) => x.id)).size, it.before.length, "oggetto ripetuto");
      it.before.forEach((x) => { assert.ok(x.s >= 0 && x.s < total); assert.ok(G.OBJ[x.id].colors.includes(x.c), `colore non ammesso per ${x.id}`); });
      if (it.mode === "spot") {
        assert.strictEqual(it.changes.length, L.changes, `L${lv}: cambiamenti ${it.changes.length}`);
        assert.strictEqual(new Set(it.after.map((x) => x.s)).size, it.after.length);
        it.after.forEach((x) => assert.ok(G.OBJ[x.id].colors.includes(x.c)));
        // nessuna casella condivisa tra due cambiamenti
        const all = it.changes.flatMap((ch) => ch.slots);
        assert.strictEqual(new Set(all).size, all.length, "cambiamenti sovrapposti");
        assert.ok(it.explain.length > 10);
        // risposta perfetta (una casella per cambiamento) e risposta sbagliata
        const perfect = it.changes.map((ch) => ch.slots[0]);
        assert.ok(G.kimCheck(it, perfect).ok);
        const untouched = [...Array(total).keys()].filter((s) => !all.includes(s));
        if (untouched.length >= it.changes.length) assert.ok(!G.kimCheck(it, untouched.slice(0, it.changes.length)).ok);
      } else {
        const q = it.question;
        assert.ok(q.options.length === 4 && q.answer >= 0 && q.answer < 4, `domanda ${q.kind}`);
        assert.strictEqual(new Set(q.options).size, 4, `opzioni ripetute: ${q.options}`);
        assert.ok(G.kimCheck(it, q.answer).ok);
      }
    }
  }
});

test("Gioco di Kim: le differenze dichiarate corrispondono davvero ai due tavoli", () => {
  for (let i = 0; i < 300; i += 1) {
    const it = G.makeKim(3 + (i % 5), 9000 + i * 104729);
    if (it.mode !== "spot") continue;
    const at = (list, s) => list.find((x) => x.s === s);
    const changed = new Set();
    const slots = new Set(it.before.map((x) => x.s).concat(it.after.map((x) => x.s)));
    slots.forEach((s) => {
      const a = at(it.before, s);
      const b = at(it.after, s);
      if (!a || !b || a.id !== b.id || a.c !== b.c) changed.add(s);
    });
    const declared = new Set(it.changes.flatMap((ch) => ch.slots));
    assert.deepStrictEqual([...changed].sort((x, y) => x - y), [...declared].sort((x, y) => x - y), `seme ${i}: ${it.explain}`);
  }
});

/* ------------------------------------------------------------ Chi mente? */
// risolutore indipendente: rilegge le frasi dal testo
function parseStatement(text, names) {
  const idx = (n) => names.indexOf(n);
  let m;
  if (/^Non sono stat[oa] io\.$/.test(text)) return { type: "self" };
  if ((m = text.match(/^È stat[oa] (\w+)\.$/))) return { type: "accuse", x: idx(m[1]) };
  if ((m = text.match(/^(\w+) non c'entra\.$/))) return { type: "clear", x: idx(m[1]) };
  if ((m = text.match(/^(\w+) mente\.$/))) return { type: "liar", x: idx(m[1]) };
  if ((m = text.match(/^(\w+) dice la verità\.$/))) return { type: "honest", x: idx(m[1]) };
  if ((m = text.match(/^Il colpevole è (\w+) oppure (\w+)\.$/))) return { type: "pair", x: idx(m[1]), y: idx(m[2]) };
  if ((m = text.match(/^Almeno uno tra (\w+) e (\w+) mente\.$/))) return { type: "oneof", x: idx(m[1]), y: idx(m[2]) };
  throw new Error(`frase non riconosciuta: ${text}`);
}
const RULE_OK = {
  "Il colpevole mente. Tutti gli altri dicono la verità.": (c, t) => t.every((v, i) => v === (i !== c)),
  "Gli innocenti dicono la verità. Il colpevole può mentire oppure no.": (c, t) => t.every((v, i) => i === c || v),
  "Una sola persona mente, e non è detto che sia il colpevole.": (c, t) => t.filter((v) => !v).length === 1,
  "Una sola persona dice la verità.": (c, t) => t.filter(Boolean).length === 1,
  "Mentono in due: il colpevole e una persona che lo copre.": (c, t) => !t[c] && t.filter((v) => !v).length === 2
};
function truthOf(st, s, c, t) {
  switch (st.type) {
    case "self": return c !== s;
    case "accuse": return c === st.x;
    case "clear": return c !== st.x;
    case "liar": return !t[st.x];
    case "honest": return t[st.x];
    case "pair": return c === st.x || c === st.y;
    case "oneof": return !t[st.x] || !t[st.y];
    default: return null;
  }
}
test("Chi mente?: soluzione unica ricontrollata rileggendo le frasi, a ogni livello", () => {
  for (let lv = 1; lv <= G.LIAR_MAX; lv += 1) {
    for (let i = 0; i < 70; i += 1) {
      const it = G.makeLiar(lv, 300 + i * 6007 + lv);
      assert.strictEqual(it.level, lv, "ripiego usato");
      assert.strictEqual(it.statements.length, it.n);
      const rule = RULE_OK[it.ruleText];
      assert.ok(rule, `regola sconosciuta: ${it.ruleText}`);
      const parsed = it.statements.map((s, k) => ({ s: k, ...parseStatement(s.text, it.names) }));
      parsed.forEach((p) => { assert.strictEqual(it.statements[p.s].who, it.names[p.s]); ["x", "y"].forEach((f) => { if (f in p) assert.ok(p[f] >= 0 && p[f] !== undefined); }); });
      const sols = [];
      for (let c = 0; c < it.n; c += 1) for (let m = 0; m < (1 << it.n); m += 1) {
        const t = [...Array(it.n).keys()].map((k) => Boolean(m & (1 << k)));
        if (!rule(c, t)) continue;
        if (parsed.every((p) => truthOf(p, p.s, c, t) === t[p.s])) sols.push({ c, t });
      }
      assert.strictEqual(sols.length, 1, `L${lv} seme ${i}: ${sols.length} soluzioni`);
      assert.strictEqual(sols[0].c, it.culprit);
      assert.deepStrictEqual(sols[0].t, it.truth);
    }
  }
});

test("Chi mente?: ogni esclusione ha una spiegazione concreta", () => {
  for (let lv = 1; lv <= G.LIAR_MAX; lv += 1) {
    for (let i = 0; i < 50; i += 1) {
      const it = G.makeLiar(lv, 77 + i * 3571 + lv);
      assert.strictEqual(it.check.length, it.n);
      assert.strictEqual(it.elim.length, it.n - 1, `L${lv}: esclusioni ${it.elim.length}`);
      it.elim.forEach((e) => assert.ok(/^Se fosse/.test(e), `spiegazione generica: ${e}`));
      it.names.forEach((n, k) => { if (k !== it.culprit) assert.ok(it.elim.some((e) => e.includes(` ${n}`)), `manca ${n}`); });
      assert.ok(it.tip.length > 20);
    }
  }
});

/* ------------------------------------------------------------ interrogatori */
test("Interrogatori: scenari completi, con tre prove ciascuno", () => {
  assert.ok(I.SCENARIOS.length >= 8);
  assert.strictEqual(new Set(I.SCENARIOS.map((s) => s.id)).size, I.SCENARIOS.length);
  I.SCENARIOS.forEach((s) => {
    ["title", "who", "g", "role", "crime", "open", "vague"].forEach((f) => assert.ok(s[f], `${s.id}.${f}`));
    assert.strictEqual(typeof s.tu, "boolean");
    assert.strictEqual(s.base.length, 2);
    assert.strictEqual(s.evidence.length, 3);
    s.evidence.forEach((e) => ["label", "ev", "q", "free", "yes", "deny", "admit", "after", "afterYes"].forEach((f) => assert.ok(e[f] && e[f].length > 3, `${s.id}: ${f}`)));
  });
});

test("Interrogatori: chi chiede prima di mostrare trova la contraddizione del colpevole, mai dell'innocente", () => {
  for (let lv = 1; lv <= I.MAX_LEVEL; lv += 1) {
    I.SCENARIOS.forEach((sc, k) => {
      for (let seed = 1; seed <= 12; seed += 1) {
        const run = I.start(lv, seed * 31 + k, sc.id);
        I.act(run, "free");
        [0, 1, 2].forEach((i) => I.act(run, "ask", i));
        [0, 1, 2].forEach((i) => I.act(run, "show", i));
        const denied = run.denied.filter(Boolean).length;
        if (run.guilty) {
          assert.strictEqual(denied, 3 - I.LEVELS[lv].admit, `${sc.id} L${lv}: il colpevole nega ${denied}`);
          // nel racconto libero il colpevole non racconta i fatti delle prove
          const free = run.log[1].text;
          sc.evidence.forEach((e) => assert.ok(!free.includes(e.free)));
        } else {
          assert.strictEqual(denied, 0);
          const free = run.log[1].text;
          assert.strictEqual(sc.evidence.filter((e) => free.includes(e.free)).length, I.LEVELS[lv].mention);
        }
        const v = I.verdict(run, denied > 0);
        assert.ok(v.ok, `${sc.id} L${lv}: con la tecnica giusta il verdetto torna`);
        assert.strictEqual(v.technique, 100);
      }
    });
  }
});

test("Interrogatori: mostrare le prove prima di chiedere cancella le contraddizioni", () => {
  for (let seed = 1; seed <= 60; seed += 1) {
    const run = I.start(1 + (seed % 3), seed);
    [0, 1, 2].forEach((i) => I.act(run, "show", i));
    [0, 1, 2].forEach((i) => I.act(run, "ask", i));
    assert.strictEqual(run.denied.filter(Boolean).length, 0);
    const t = I.technique(run);
    assert.ok(t.score <= 0, `tecnica ${t.score}`);
    assert.strictEqual(t.early, 3);
  }
  const run = I.start(2, 5);
  I.act(run, "free"); I.act(run, "press");
  const t = I.technique(run);
  assert.ok(t.notes.some((n) => /pressione/.test(n.text)));
  assert.ok(I.act(run, "press") === null, "la pressione si usa una volta");
});

/* ------------------------------------------------------------ lettura */
test("Lettura: esercizi ben formati, tecniche coperte, niente ripetizioni nel turno", () => {
  assert.strictEqual(new Set(R.ITEMS.map((x) => x.id)).size, R.ITEMS.length);
  R.ITEMS.forEach((x) => {
    assert.ok([1, 2, 3].includes(x.lv));
    assert.ok(x.text && x.why && x.why.length > 30, x.id);
    if (x.type === "tech") assert.ok(R.TECH[x.tech], x.id);
    else { assert.strictEqual(x.options.length, 4); assert.ok(x.answer >= 0 && x.answer < 4); assert.strictEqual(new Set(x.options).size, 4); }
  });
  R.TECH_KEYS.forEach((k) => assert.ok(R.ITEMS.filter((x) => x.tech === k).length >= 2, `tecnica ${k}`));
  for (let seed = 1; seed < 80; seed += 1) {
    const used = [];
    for (let k = 0; k < 6; k += 1) {
      const it = R.pickItem(1 + (seed % 3), seed * 97 + k, used);
      assert.ok(!used.includes(it.id), "esercizio ripetuto nel turno");
      used.push(it.id);
      assert.strictEqual(it.options.length, 4);
      assert.ok(it.answer >= 0 && it.answer < 4);
      if (it.type === "tech") assert.strictEqual(it.keys[it.answer], R.ITEMS.find((x) => x.id === it.id).tech);
    }
  }
});

/* ------------------------------------------------------------ casi */
test("Casi: dati coerenti (fatti raggiungibili, prove valide, una sola trappola giusta)", () => {
  assert.ok(C.CASES.length >= 6);
  assert.strictEqual(new Set(C.CASES.map((c) => c.id)).size, C.CASES.length);
  C.CASES.forEach((c) => {
    const ids = new Set(Object.keys(c.facts));
    const produced = new Set();
    c.scene.forEach((s) => { if (s.fact) { assert.ok(ids.has(s.fact), `${c.id}: ${s.fact}`); produced.add(s.fact); } });
    c.people.forEach((p) => {
      if (p.lookFact) { assert.ok(ids.has(p.lookFact)); produced.add(p.lookFact); }
      p.ask.forEach((q) => { if (q.fact) { assert.ok(ids.has(q.fact), `${c.id}: ${q.fact}`); produced.add(q.fact); } });
    });
    ids.forEach((f) => assert.ok(produced.has(f), `${c.id}: fatto irraggiungibile ${f}`));
    assert.ok(c.people.some((p) => p.id === c.culprit));
    c.keys.forEach((k) => assert.ok(ids.has(k), `${c.id}: prova ${k}`));
    assert.ok(c.need <= c.keys.length);
    assert.strictEqual(c.traps.filter((t) => t.ok).length, 1, `${c.id}: trappole giuste`);
    assert.ok(c.motive >= 0 && c.motive < c.motives.length);
    assert.ok(c.budget < E.totalActions(c), `${c.id}: le mosse devono costringere a scegliere`);
    assert.ok(c.budget >= c.need + 6, `${c.id}: mosse troppo poche`);
    assert.ok(c.close.length >= 2 && c.lesson);
    // ci sono fatti che non provano niente (servono a distinguere prove e impressioni)
    assert.ok(ids.size - c.keys.length >= 4, `${c.id}: pochi fatti di contorno`);
  });
});

test("Casi: mosse contate, fatti senza doppioni, punteggio della ricostruzione", () => {
  const c = C.CASES[0];
  const lab = E.ensure({});
  const run = E.startCase(c.id);
  assert.strictEqual(run.phase, "brief");
  const a = E.caseAct(run, "scene", "door");
  assert.ok(a.isNew && run.facts.includes("door") && run.phase === "inv");
  assert.strictEqual(E.caseAct(run, "scene", "door"), null, "stessa azione due volte");
  E.caseAct(run, "scene", "phone");
  const dup = E.caseAct(run, "ask", "sara", "close"); // stesso fatto della foto
  assert.ok(dup && !dup.isNew);
  assert.strictEqual(run.facts.filter((f) => f === "photo").length, 1);
  const all = c.scene.map((x) => ["scene", x.id]).concat(c.people.flatMap((p) => [["look", p.id]].concat(p.ask.filter((q) => !(p.id === "rosa" && q.id === "night")).map((q) => ["ask", p.id, q.id]))));
  for (const act of all) { if (run.used >= c.budget) break; E.caseAct(run, ...act); }
  assert.strictEqual(run.used, c.budget);
  assert.ok(E.caseAct(run, "ask", "rosa", "night").blocked, "mosse finite");
  const perfect = E.caseScore(c, { culprit: c.culprit, keys: c.keys.slice(0, c.need), motive: c.motive, trap: c.traps.findIndex((t) => t.ok) });
  assert.strictEqual(perfect.total, 100);
  const wrong = E.caseScore(c, { culprit: "kevin", keys: c.keys.slice(0, c.need), motive: c.motive, trap: c.traps.findIndex((t) => t.ok) });
  assert.strictEqual(wrong.total, 20, "colpevole sbagliato: conta solo la trappola");
  const res = E.solveCase(lab, run, { culprit: c.culprit, keys: [c.keys[0], "cam", "bets"], motive: c.motive, trap: 1 }, T0);
  assert.strictEqual(res.total, 40 + 10 + 10);
  assert.strictEqual(lab.cases[c.id].first, 60);
  const run2 = E.startCase(c.id);
  E.solveCase(lab, run2, { culprit: c.culprit, keys: c.keys.slice(0, c.need), motive: c.motive, trap: c.traps.findIndex((t) => t.ok) }, T0 + 1000);
  assert.strictEqual(lab.cases[c.id].first, 60, "conta il primo tentativo");
  assert.strictEqual(lab.cases[c.id].best, 100);
  assert.strictEqual(lab.cases[c.id].tries, 2);
});

test("Casi: con le mosse a disposizione si possono trovare le prove e scagionare gli altri", () => {
  C.CASES.forEach((c) => {
    // ogni prova si ottiene con una sola azione: bastano «need» mosse per averne abbastanza
    const sourceOf = (f) => c.scene.some((s) => s.fact === f) || c.people.some((p) => p.lookFact === f || p.ask.some((q) => q.fact === f));
    c.keys.forEach((k) => assert.ok(sourceOf(k)));
    assert.ok(c.need <= c.budget);
  });
});

/* ------------------------------------------------------------ lezioni */
test("Metodo: lezioni con fonti e due domande di verifica; conta la prima risposta", () => {
  assert.ok(D.LESSONS.length >= 8);
  D.LESSONS.forEach((l) => {
    assert.ok(l.sections.length >= 1 && l.lead);
    assert.ok(l.sources.length >= 1 && l.sources.every(([label, url]) => label && /^https:\/\//.test(url)), l.id);
    assert.strictEqual(l.checks.length, 2);
    l.checks.forEach((q) => { assert.ok(q.answer >= 0 && q.answer < q.options.length); assert.ok(q.why); });
    if (l.train) assert.ok(E.DRILLS[l.train], `${l.id}: disciplina ${l.train}`);
  });
  const lab = E.ensure({});
  const l = D.LESSONS[0];
  assert.ok(E.checkLesson(lab, l.id, 0, (l.checks[0].answer + 1) % l.checks[0].options.length, T0).ok === false);
  assert.ok(E.checkLesson(lab, l.id, 0, l.checks[0].answer, T0).ok);
  assert.strictEqual(lab.checks[`${l.id}:0`], false, "conta la prima risposta");
  assert.ok(E.markRead(lab, l.id, T0));
  assert.ok(!E.markRead(lab, "nessuna", T0));
});

/* ------------------------------------------------------------ motore */
test("Turni di tutte le discipline: si giocano fino in fondo e muovono il punteggio", () => {
  const lab = E.ensure({});
  E.KEYS.forEach((k) => {
    const round = E.makeRound(lab, k, { seed: 4242 });
    assert.ok(round.item, k);
    let guard = 0;
    while (!round.done && guard < 20) {
      guard += 1;
      const it = round.item;
      let ans;
      if (it.kind === "kim") ans = it.mode === "ask" ? it.question.answer : it.changes.map((ch) => ch.slots[0]);
      else if (it.kind === "liar") ans = it.culprit;
      else if (it.kind === "read") ans = it.answer;
      else { I.act(it, "free"); [0, 1, 2].forEach((i) => I.act(it, "ask", i)); ans = it.denied.some(Boolean); }
      const res = E.answer(lab, round, ans, T0);
      assert.ok(res.ok, `${k}: risposta giusta non riconosciuta`);
      assert.strictEqual(E.answer(lab, round, ans, T0), null, "risposta doppia");
      E.next(lab, round, T0);
    }
    assert.ok(round.done);
    assert.ok(lab.ratings[k].r > E.START_RATING, `${k}: il punteggio deve salire`);
    assert.strictEqual(lab.ratings[k].hist.length, 1);
  });
  assert.ok(lab.tech.length >= 1 && lab.tech[0] === 80);
});

test("Punteggio: converge verso il livello vero di chi gioca", () => {
  const lab = E.ensure({});
  const trueR = 1150;
  let s = 7;
  const rand = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 400; i += 1) {
    const round = E.makeRound(lab, "liar", { seed: i * 13 + 1, n: 1 });
    const it = round.item;
    const p = E.expected(trueR, it.diff);
    E.answer(lab, round, rand() < p ? it.culprit : (it.culprit + 1) % it.n, T0 + i);
  }
  assert.ok(Math.abs(lab.ratings.liar.r - trueR) < 140, `punteggio ${lab.ratings.liar.r}`);
});

test("Programma del giorno, profilo e andamento", () => {
  const lab = E.ensure({});
  const steps = E.plan(lab, T0);
  assert.ok(steps.length === 3);
  assert.ok(steps.some((x) => x.go.kind === "case"));
  assert.ok(steps.some((x) => x.go.kind === "lesson"));
  const prof = E.profile(lab);
  assert.deepStrictEqual(prof.map((x) => x.label), ["Osservazione", "Deduzione", "Lettura", "Interrogatorio", "Casi", "Metodo"]);
  assert.ok(prof.every((x) => x.value === 35));
  lab.cases.bar = { first: 90, best: 90, tries: 1, t: T0, solved: true, used: 12 };
  assert.ok(E.profile(lab).find((x) => x.key === "cases").value > 35);
  assert.strictEqual(E.nextCase(lab).id, C.CASES[1].id);
  assert.ok(/casi risolti/.test(E.trend(lab)));
  assert.strictEqual(E.scoreOf(1000), 50);
});

test("Stato rovinato o vecchio: sistemato senza errori", () => {
  const lab = E.ensure({ version: 1, ratings: { kim: { r: 99999, n: -1, hist: [{ t: T0, r: 1000 }, "x"] }, boh: {} }, history: [{ t: T0, k: "kim", ok: true }, { t: T0, k: "x", ok: true }], tech: [50, "a", 300], cases: { bar: { first: 140, best: 20 }, nessuno: { first: 50 }, test: "x" }, read: { observe: T0, x: "no" }, checks: { "observe:0": true, "observe:1": "si", "brutto": false }, days: ["2026-10-01", "ieri"], log: [{ t: T0, kind: "kim" }, 4] });
  assert.strictEqual(lab.ratings.kim.r, 2600);
  assert.strictEqual(lab.ratings.kim.n, 0);
  assert.strictEqual(lab.ratings.kim.hist.length, 1);
  assert.strictEqual(lab.ratings.liar.r, E.START_RATING);
  assert.strictEqual(lab.history.length, 1);
  assert.deepStrictEqual(lab.tech, [50, 100]);
  assert.deepStrictEqual(Object.keys(lab.cases), ["bar"]);
  assert.strictEqual(lab.cases.bar.first, 100);
  assert.deepStrictEqual(Object.keys(lab.read), ["observe"]);
  assert.deepStrictEqual(lab.checks, { "observe:0": true });
  assert.deepStrictEqual(lab.days, ["2026-10-01"]);
  assert.strictEqual(lab.log.length, 1);
  assert.strictEqual(E.ensure(null).version, 1);
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exit(1);
