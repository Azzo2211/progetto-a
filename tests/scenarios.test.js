/*
 * Test degli Scenari: dati degli esami speciali, valutazione della frase,
 * punteggio dell'esame, profilo, classi e risposta libera.
 *
 *   node tests/scenarios.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const root = path.join(__dirname, "..");
const E = require(path.join(root, "scenarios", "engine.js"));
require(path.join(root, "scenarios", "exams.js"));
require(path.join(root, "scenarios", "free.js"));
const EXAMS = globalThis.ScenarioExams;
const FREE = globalThis.ScenarioFree;

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    console.error(`FALLITO: ${name}`);
    throw error;
  }
}

const bestChoices = (s) => s.rounds.map((r, i) => {
  const index = r.options.findIndex((o) => o.quality === "best");
  return { round: i, index, quality: "best", effects: r.options[index].effects, text: r.options[index].text };
});
const worstChoices = (s) => s.rounds.map((r, i) => {
  const index = r.options.findIndex((o) => o.quality === "bad");
  return { round: i, index, quality: "bad", effects: r.options[index].effects, text: r.options[index].text };
});

test("Esami: schema completo e coerente", () => {
  assert.ok(EXAMS.length >= 20, `pochi esami: ${EXAMS.length}`);
  const ids = new Set();
  EXAMS.forEach((s) => {
    assert.ok(!ids.has(s.id), `id duplicato ${s.id}`);
    ids.add(s.id);
    assert.ok(E.CATEGORIES[s.category], `${s.id}: categoria ${s.category}`);
    assert.ok(s.difficulty >= 1 && s.difficulty <= 5, `${s.id}: difficolta'`);
    assert.ok(s.title && s.setting && s.objective, `${s.id}: testi`);
    assert.ok(Array.isArray(s.cast) && s.cast.length >= 1, `${s.id}: cast`);
    assert.strictEqual(s.rounds.length, 3, `${s.id}: 3 round`);
    s.rounds.forEach((r, ri) => {
      assert.ok(r.text && r.prompt, `${s.id} r${ri}: testo`);
      assert.strictEqual(r.options.length, 4, `${s.id} r${ri}: 4 opzioni`);
      const q = r.options.map((o) => o.quality);
      assert.strictEqual(q.filter((x) => x === "best").length, 1, `${s.id} r${ri}: una best`);
      assert.ok(q.includes("bad"), `${s.id} r${ri}: almeno una bad`);
      r.options.forEach((o) => {
        assert.ok(E.QUALITY[o.quality], `${s.id} r${ri}: qualita' ${o.quality}`);
        assert.ok(o.text && o.outcome && o.why, `${s.id} r${ri}: testi opzione`);
        Object.entries(o.effects || {}).forEach(([k, v]) => {
          assert.ok(E.DIM_KEYS.includes(k), `${s.id} r${ri}: dimensione ${k}`);
          assert.ok(Number.isInteger(v) && v >= -3 && v <= 3, `${s.id} r${ri}: effetto ${k}=${v}`);
        });
      });
      // la best deve far crescere il profilo piu' della bad
      const sum = (o) => Object.values(o.effects || {}).reduce((a, b) => a + b, 0);
      const best = r.options.find((o) => o.quality === "best");
      const bad = r.options.find((o) => o.quality === "bad");
      assert.ok(sum(best) > sum(bad), `${s.id} r${ri}: best non migliore della bad`);
    });
    assert.ok(s.phrase && s.phrase.round >= 0 && s.phrase.round <= 2, `${s.id}: frase`);
    assert.strictEqual(s.phrase.keys.length, 3, `${s.id}: 3 chiavi frase`);
    assert.ok(s.debrief && s.debrief.truth && s.debrief.principle && s.debrief.tip, `${s.id}: debrief`);
  });
});

test("Esami: tutte le categorie, piu' livelli di difficolta'", () => {
  Object.keys(E.CATEGORIES).forEach((c) => {
    const list = EXAMS.filter((s) => s.category === c);
    assert.ok(list.length >= 2, `categoria ${c}: ${list.length} esami`);
  });
  const hard = EXAMS.filter((s) => s.difficulty >= 4).length;
  const base = EXAMS.filter((s) => s.difficulty <= 2).length;
  assert.ok(hard >= 6 && base >= 6, `difficolta': base ${base}, avanzati ${hard}`);
});

test("Esami: la frase modello soddisfa le sue chiavi", () => {
  EXAMS.forEach((s) => {
    const r = E.evalPhrase(s.phrase.model, s.phrase.keys);
    assert.strictEqual(r.misses.length, 0, `${s.id}: il modello non soddisfa ${r.misses.join(", ")}`);
    assert.ok(r.score >= 65, `${s.id}: modello valutato solo ${r.score}`);
  });
});

test("Frase: accuse e minacce abbassano, prima persona e richiesta alzano", () => {
  const keys = [{ label: "Cifra", terms: ["300", "euro"] }, { label: "Tempi", terms: ["entro", "al mese"] }, { label: "Tono", terms: ["ci tengo", "tra noi"] }];
  const good = E.evalPhrase("Ciao Luca, ti presto 300 euro e me li restituisci con 100 al mese, entro il 5. Ci tengo che tra noi i soldi non siano un problema.", keys);
  const bad = E.evalPhrase("Sei sempre il solito, colpa tua. Te ne pentirai.", keys);
  const hedgy = E.evalPhrase("Scusa, forse magari ti presto 300 euro, non so se...", keys);
  assert.ok(good.score >= 80, `buona ${good.score}`);
  assert.ok(bad.score <= 10, `cattiva ${bad.score}`);
  assert.ok(hedgy.score < good.score, "le attenuazioni costano");
  assert.ok(bad.notes.some((n) => n.tone === "bad"), "nota sulle accuse");
  assert.ok((bad.effects.etica || 0) < 0, "minaccia: etica in calo");
  assert.strictEqual(E.evalPhrase("", keys).score, 0);
});

test("Esame: punteggio, voto e mosse mancate", () => {
  const s = EXAMS[0];
  const phrase = E.evalPhrase(s.phrase.model, s.phrase.keys);
  const top = E.scoreExam(s, bestChoices(s), phrase);
  assert.ok(top.score >= 92 && top.grade === "S", `tutto giusto: ${top.score}`);
  assert.deepStrictEqual(top.missed, {});
  const low = E.scoreExam(s, worstChoices(s), null);
  assert.ok(low.score <= 10 && low.grade === "D", `tutto sbagliato: ${low.score}`);
  assert.ok(Object.keys(low.missed).length > 0, "mosse mancate registrate");
  const skipped = E.scoreExam(s, bestChoices(s), null);
  assert.strictEqual(skipped.score, 80, "senza frase si arriva al massimo a 80");
});

test("Profilo: il primo tentativo conta, le ripetizioni poco e senza punti", () => {
  const s = EXAMS.find((x) => x.difficulty >= 3) || EXAMS[0];
  const p = E.ensureProfile(null);
  const first = E.recordExam(p, s, bestChoices(s), E.evalPhrase(s.phrase.model, s.phrase.keys));
  assert.ok(first.pp > 0 && !first.replay);
  const gained = Object.values(first.changes).reduce((a, b) => a + b, 0);
  assert.ok(gained > 0, "le mosse migliori fanno salire il profilo");
  Object.values(first.changes).forEach((v) => assert.ok(Math.abs(v) <= E.MAX_EXAM_CHANGE));
  const again = E.recordExam(p, s, bestChoices(s), null);
  assert.ok(again.replay && again.pp === 0, "ripetizione senza punti privati");
  const gainedAgain = Object.values(again.changes).reduce((a, b) => a + b, 0);
  assert.ok(gainedAgain < gained / 2, "la ripetizione pesa meno");
  assert.strictEqual(p.completed[s.id].attempts, 2);
  assert.strictEqual(p.history.length, 2);
});

test("Profilo: gli errori fanno scendere, i valori restano tra 10 e 99", () => {
  const p = E.ensureProfile(null);
  EXAMS.forEach((s) => E.recordExam(p, s, worstChoices(s), null));
  E.DIM_KEYS.forEach((k) => assert.ok(p[k] >= 10 && p[k] <= 99, `${k}=${p[k]}`));
  assert.ok(E.total(p) < E.START_VALUE, "tutto sbagliato: profilo sotto la partenza");
  const q = E.ensureProfile(null);
  for (let i = 0; i < 4; i += 1) EXAMS.forEach((s) => E.recordExam(q, s, bestChoices(s), E.evalPhrase(s.phrase.model, s.phrase.keys)));
  E.DIM_KEYS.forEach((k) => assert.ok(q[k] <= 99));
});

test("Classe: servono profilo ed esami, la A richiede tutte le categorie", () => {
  const p = E.ensureProfile(null);
  assert.strictEqual(E.classFor(p, EXAMS).current.key, "D");
  E.DIM_KEYS.forEach((k) => { p[k] = 70; });
  assert.strictEqual(E.classFor(p, EXAMS).current.key, "D", "senza esami resta D");
  EXAMS.slice(0, 4).forEach((s) => { p.completed[s.id] = { attempts: 1, best: 70, grade: "B" }; });
  assert.strictEqual(E.classFor(p, EXAMS).current.key, "C");
  const hard = EXAMS.filter((s) => s.difficulty >= 4).slice(0, 3);
  const more = EXAMS.filter((s) => !p.completed[s.id] && s.difficulty < 4).slice(0, 10);
  hard.concat(more).forEach((s) => { p.completed[s.id] = { attempts: 1, best: 70, grade: "B" }; });
  assert.strictEqual(E.classFor(p, EXAMS).current.key, "B");
  E.DIM_KEYS.forEach((k) => { p[k] = 85; });
  EXAMS.forEach((s) => { p.completed[s.id] = { attempts: 1, best: 85, grade: "A" }; });
  assert.strictEqual(E.classFor(p, EXAMS).current.key, "A");
});

test("Consigli: propone un esame nuovo che allena il punto debole", () => {
  const p = E.ensureProfile(null);
  const s = EXAMS[0];
  E.recordExam(p, s, worstChoices(s), null);
  const rec = E.recommend(p, EXAMS);
  assert.ok(rec.scenario && rec.scenario.id !== s.id, "esame nuovo");
  assert.strictEqual(rec.weakness.source, "errors");
  assert.ok((E.focusOf(rec.scenario)[rec.weakness.key] || 0) > 0, "allena la categoria debole");
});

test("Risposta libera: dati validi, valutazione sensata", () => {
  assert.ok(FREE.length >= 15);
  FREE.forEach((s) => assert.ok(s.id && s.title && s.text && s.model && Array.isArray(s.ideal) && Array.isArray(s.traps), s.id));
  const sc = FREE[0];
  const good = E.evalFree({
    observe: "Noto che chi guida le battute è una sola persona, gli altri ridono per abitudine. Potrebbe voler testare la mia reazione davanti al gruppo.",
    say: "La battuta è chiara, ora basta. Se vuoi parlare di me fallo seriamente, a parte.",
    planB: "Se continua, smetto di dare spettacolo e ne parlo in privato con la persona chiave; se serve coinvolgo chi organizza."
  }, sc);
  const poor = E.evalFree({ observe: "", say: "Lo insulto e urlo, così impara.", planB: "" }, sc);
  assert.ok(good.score >= 65, `buona ${good.score}`);
  assert.ok(poor.score < 35, `povera ${poor.score}`);
  assert.ok(poor.parts.ethics < good.parts.ethics);
  const p = E.ensureProfile(null);
  E.recordFree(p, sc, good);
  assert.strictEqual(p.freeCount, 1);
});

console.log(`Tutti i test superati (${passed}).`);
