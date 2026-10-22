/*
 * Test della logica: generatori (matrici con risposte bilanciate, serie senza regole alternative,
 * griglie e cavalieri con soluzione unica, sillogismi controllati con i modelli, probabilita' e
 * riflessione con i conti giusti), punteggio Elo che converge al livello vero, turni, trappole,
 * programma del giorno, profilo e stato rovinato.
 *
 *   node tests/logic.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const dir = path.join(__dirname, "..", "logic");
const G = require(path.join(dir, "gen.js"));
const TR = require(path.join(dir, "traps.js"));
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

test("Tutti i generatori: esercizi completi a ogni livello, con difficoltà", () => {
  Object.keys(G.MAX_LEVEL).forEach((k) => {
    for (let lv = 1; lv <= G.MAX_LEVEL[k]; lv += 1) {
      for (let i = 0; i < 25; i += 1) {
        const it = G.make(k, lv, 1000 + i * 7919 + lv);
        assert.strictEqual(it.kind, k);
        assert.ok(Number.isFinite(it.diff) && it.diff > 300 && it.diff < 1700, `${k} L${lv}: difficoltà ${it.diff}`);
        assert.ok(it.explain && it.explain.length > 20, `${k}: spiegazione`);
      }
    }
  });
  const a = G.make("matrix", 4, 42);
  const b = G.make("matrix", 4, 42);
  assert.deepStrictEqual(a, b, "stesso seme, stesso esercizio");
});

test("Matrici: 8 risposte diverse, una giusta, nessun valore «più frequente» che la tradisca", () => {
  for (let lv = 1; lv <= G.MAX_LEVEL.matrix; lv += 1) {
    for (let i = 0; i < 40; i += 1) {
      const it = G.make("matrix", lv, 500 + i * 31 + lv);
      assert.strictEqual(it.options.length, 8);
      assert.strictEqual(new Set(it.options.map((o) => JSON.stringify(o))).size, 8);
      assert.ok(it.answer >= 0 && it.answer < 8);
      assert.strictEqual(it.grid[2][2], null);
      // ogni caratteristica della risposta giusta compare in esattamente meta' delle opzioni (o in tutte)
      const ans = it.options[it.answer];
      ["shape", "count", "size", "fill"].forEach((attr) => {
        const same = it.options.filter((o) => o[attr] === ans[attr]).length;
        assert.ok(same === 4 || same === 8, `L${lv}: ${attr} compare ${same} volte su 8`);
      });
    }
  }
});

test("Serie: nessuna regola semplice alternativa porta a un numero diverso", () => {
  for (let lv = 1; lv <= G.MAX_LEVEL.series; lv += 1) {
    for (let i = 0; i < 60; i += 1) {
      const it = G.make("series", lv, 300 + i * 13 + lv);
      assert.ok(it.terms.length >= 6);
      assert.ok(Number.isInteger(it.answer));
      assert.deepStrictEqual(G.altNexts(it.terms).filter((v) => v !== it.answer), []);
    }
  }
  assert.ok(G.altNexts([2, 4, 6, 8]).includes(10));
  assert.ok(G.altNexts([1, 2, 4, 8, 16]).includes(32));
});

test("Griglie: la soluzione rispetta tutti gli indizi ed è l'unica", () => {
  for (let lv = 1; lv <= G.MAX_LEVEL.grid; lv += 1) {
    for (let i = 0; i < 6; i += 1) {
      const it = G.make("grid", lv, 900 + i * 17 + lv);
      const pos = {};
      it.cats.forEach((c) => { pos[c] = {}; it.solution[c].forEach((v, h) => { pos[c][v] = h; }); });
      assert.ok(it.raw.every((cl) => G.gridClueOk(cl, pos)), "indizi veri");
      assert.strictEqual(G.gridSolve(it.n, it.cats, it.raw, 3).length, 1, `L${lv}: soluzione unica`);
      assert.strictEqual(it.clues.length, it.raw.length);
      assert.ok(it.clues.every((c) => /\.$/.test(c) && !/il avvocato|undefined/.test(c)), "frasi pulite");
    }
  }
});

test("Cavalieri e furfanti: il risolutore e gli esercizi", () => {
  // classico: A dice «siamo tutti furfanti» → A furfante, B cavaliere
  const sols = G.knSolve(2, [{ s: 0, f: (k) => !k[0] && !k[1] }]);
  assert.deepStrictEqual(sols, [[false, true]]);
  for (let lv = 1; lv <= G.MAX_LEVEL.knights; lv += 1) {
    for (let i = 0; i < 20; i += 1) {
      const it = G.make("knights", lv, 70 + i * 11 + lv);
      assert.strictEqual(it.solution.length, it.n);
      assert.ok(it.statements.length >= 1);
    }
  }
});

test("Sillogismi: validità controllata con i modelli (insiemi non vuoti)", () => {
  // 0 = S, 1 = M, 2 = P
  assert.ok(G.sylloValid(["A", 1, 2], ["A", 0, 1], ["A", 0, 2]), "Barbara");
  assert.ok(!G.sylloValid(["A", 2, 1], ["A", 0, 1], ["A", 0, 2]), "termine medio non distribuito");
  assert.ok(G.sylloValid(["A", 1, 2], ["A", 1, 0], ["I", 0, 2]), "Darapti vale se gli insiemi non sono vuoti");
  assert.ok(!G.sylloValid(["I", 1, 2], ["I", 0, 1], ["I", 0, 2]), "alcuni + alcuni: niente");
  let valid = 0;
  for (let i = 0; i < 400; i += 1) if (G.make("syllo", 2, i).answer) valid += 1;
  assert.ok(valid > 160 && valid < 240, `circa metà valide: ${valid}`);
  for (let i = 0; i < 60; i += 1) {
    const it = G.make("syllo", 4, i * 7);
    assert.strictEqual(it.mode, "produce");
    assert.strictEqual(it.options.length, 9);
    assert.ok(it.correct.length >= 1);
    const nvc = it.options.length - 1;
    assert.ok(it.correct.includes(nvc) === (it.correct.length === 1 && it.correct[0] === nvc));
    assert.ok(it.p > 0 && it.p < 1 && /139 persone/.test(it.src));
  }
});

test("Probabilità e riflessione: conti giusti e risposte d'istinto diverse da quelle giuste", () => {
  let seen = new Set();
  for (let i = 0; i < 400; i += 1) {
    const it = G.make("prob", 1 + (i % 5), i * 3);
    seen.add(it.type);
    if (it.unit !== "€") assert.ok(it.answer > 0 && it.answer < 1, `${it.type}: ${it.answer}`);
    if (it.type === "atleast") { const n = Number(it.text.match(/dado (\d+) volte/)[1]); assert.ok(Math.abs(it.answer - (1 - (5 / 6) ** n)) < 1e-9); }
    if (it.lure != null) assert.ok(Math.abs(it.lure - it.answer) > it.tol);
  }
  ["coin", "die", "atleast", "sum", "cards", "ev", "bayes", "bayes2", "birthday"].forEach((t) => assert.ok(seen.has(t), t));
  seen = new Set();
  for (let i = 0; i < 300; i += 1) {
    const it = G.make("crt", 1 + (i % 4), i * 5);
    seen.add(it.type);
    assert.ok(Math.abs(it.lure - it.answer) > it.tol, `${it.type}: istinto ${it.lure} = giusta ${it.answer}`);
    if (it.type === "ball") { const m = it.text.match(/in tutto ([\d,]+) €.*costa (\d+) €/); const total = Number(m[1].replace(",", ".")); const diff = Number(m[2]); assert.ok(Math.abs(2 * it.answer + diff - total) < 1e-9); }
  }
  assert.strictEqual(seen.size, 7);
});

test("Punteggio: sale con le giuste, scende con le sbagliate, pesato per la difficoltà", () => {
  const lab = E.ensure(null);
  const r = E.makeRound(lab, "series", { seed: 1, level: 1 });
  const before = lab.ratings.series.r;
  E.answer(lab, r, r.item.answer, T0);
  const up = lab.ratings.series.r - before;
  assert.ok(up > 0 && up < 20, `giusta facile: +${up}`);
  E.next(lab, r, T0);
  const b2 = lab.ratings.series.r;
  E.answer(lab, r, -12345, T0);
  const down = b2 - lab.ratings.series.r;
  assert.ok(down > up, "sbagliare un esercizio facile costa più di quanto rende indovinarlo");
  assert.strictEqual(lab.history.length, 2);
});

test("Punteggio: con abbastanza esercizi si avvicina al livello vero", () => {
  [700, 1000, 1250].forEach((trueR) => {
    const lab = E.ensure(null);
    let seed = 1;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let rr = 0; rr < 40; rr += 1) {
      const round = E.makeRound(lab, "matrix", { seed: rr * 101 + trueR });
      while (!round.done) {
        const p = E.expected(trueR, round.item.diff);
        E.answer(lab, round, rand() < p ? round.item.answer : (round.item.answer + 1) % 8, T0);
        E.next(lab, round, T0);
      }
    }
    const got = lab.ratings.matrix.r;
    // le matrici arrivano a ~1165: oltre non si puo' misurare bene
    const target = Math.min(trueR, 1250);
    assert.ok(Math.abs(got - target) < 150, `vero ${trueR}, stimato ${got}`);
  });
});

test("Livello automatico: circa 6 risposte giuste su 10 attese", () => {
  const lab = E.ensure(null);
  E.KEYS.forEach((k) => {
    const lv = E.autoLevel(lab, k);
    const p = E.expected(lab.ratings[k].r, E.DISCIPLINES[k].diff[lv]);
    assert.ok(p > 0.4 && p < 0.9, `${k}: livello ${lv}, attese ${Math.round(p * 100)}%`);
  });
});

test("Turno: n esercizi, poi fine con riepilogo; controlli per griglie, cavalieri, numeri", () => {
  const lab = E.ensure(null);
  const r = E.makeRound(lab, "knights", { seed: 9 });
  let k = 0;
  while (!r.done && k < 20) {
    E.answer(lab, r, r.item.solution.slice(), T0);
    E.next(lab, r, T0);
    k += 1;
  }
  assert.strictEqual(k, E.DISCIPLINES.knights.round);
  assert.deepStrictEqual(E.summary(r).ok, k);
  assert.ok(lab.ratings.knights.hist.length === 1);
  const g = G.make("grid", 2, 5);
  const ans = JSON.parse(JSON.stringify(g.solution));
  assert.ok(E.check(g, ans).ok);
  ans[g.cats[1]].reverse();
  const c = E.check(g, ans);
  assert.ok(!c.ok && c.wrong.length >= 2);
  const crt = G.make("crt", 3, 1);
  assert.ok(E.check(crt, crt.answer).ok);
  assert.ok(E.check(crt, crt.lure).lure);
  const pr = G.make("prob", 4, 3);
  if (pr.unit !== "€") assert.ok(E.check(pr, pr.answer * 100 + 0.4).ok, "piccolo arrotondamento accettato");
});

test("Trappole: dati completi, conta la prima risposta, riconosce la risposta d'istinto", () => {
  assert.ok(TR.TRAPS.length >= 12);
  TR.TRAPS.forEach((t) => {
    assert.ok(t.title && t.text.length && t.solution && t.study && t.study.text && t.lesson, t.id);
    if (t.type === "choice") assert.ok(t.answer >= 0 && t.answer < t.options.length && t.lure !== t.answer, t.id);
    else assert.ok(Number.isFinite(t.answer) && t.lure !== t.answer, t.id);
  });
  const lab = E.ensure(null);
  const r1 = E.trapAnswer(lab, "racchetta", 0.1, T0);
  assert.ok(!r1.ok && r1.lure && r1.first);
  const r2 = E.trapAnswer(lab, "racchetta", 0.05, T0);
  assert.ok(r2.ok && !r2.first);
  assert.strictEqual(lab.traps.racchetta.ok, false, "conta la prima");
  assert.ok(E.trapAnswer(lab, "monty", 0, T0).ok);
});

test("Lezioni di metodo: almeno 6, con sezioni", () => {
  assert.ok(D.LESSONS.length >= 6);
  D.LESSONS.forEach((l) => {
    assert.ok(l.title && l.lead && l.sections.length >= 2, l.id);
    if (l.train) assert.ok(E.DISCIPLINES[l.train], `${l.id}: disciplina`);
  });
});

test("Programma del giorno: disciplina del giorno, la più debole, una trappola", () => {
  const lab = E.ensure(null);
  const steps = E.plan(lab, T0);
  assert.strictEqual(steps[0].key, E.ROTATION[new Date(T0).getDay()]);
  assert.ok(steps[1].key !== steps[0].key);
  assert.strictEqual(steps[2].id, "trap");
  E.TRAPS.forEach((t) => E.trapAnswer(lab, t.id, 0, T0));
  assert.strictEqual(E.plan(lab, T0)[2].id, "lesson");
  assert.ok(E.streak(lab, T0) >= 1);
});

test("Profilo: 6 categorie da 0 a 100; senza dati partono da 35", () => {
  const lab = E.ensure(null);
  const p = E.profile(lab, T0);
  assert.strictEqual(p.length, 6);
  assert.deepStrictEqual(p.map((k) => k.value), [35, 35, 35, 35, 35, 35]);
  lab.ratings.matrix = { r: 1200, n: 40, ok: 30, best: 1200, hist: [] };
  assert.strictEqual(E.profile(lab, T0)[0].value, E.scoreOf(1200));
  assert.strictEqual(E.scoreOf(1000), 50);
  assert.ok(typeof E.trend(lab) === "string");
});

test("Stato rovinato o vecchio: sistemato senza errori", () => {
  const lab = E.ensure({ version: 1, ratings: { matrix: { r: 99999, n: -3, hist: [{ t: T0, r: 1000 }, "x"] }, boh: {} }, history: [{ t: T0, k: "matrix", ok: true }, { t: T0, k: "nessuno", ok: true }, null], traps: { racchetta: { t: T0, ok: true }, x: 5 }, read: { dedurre: T0, y: "no" }, days: ["2026-10-01", "ieri"], log: [{ t: T0, kind: "x" }, 3] });
  assert.strictEqual(lab.ratings.matrix.r, 2600);
  assert.strictEqual(lab.ratings.matrix.n, 0);
  assert.strictEqual(lab.ratings.matrix.hist.length, 1);
  assert.strictEqual(lab.ratings.series.r, E.START_RATING);
  assert.strictEqual(lab.history.length, 1);
  assert.deepStrictEqual(Object.keys(lab.traps), ["racchetta"]);
  assert.deepStrictEqual(Object.keys(lab.read), ["dedurre"]);
  assert.deepStrictEqual(lab.days, ["2026-10-01"]);
  assert.strictEqual(lab.log.length, 1);
  assert.strictEqual(E.ensure("rotto").version, 1);
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exit(1);
