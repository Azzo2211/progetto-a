/*
 * Test della Cultura: schede (schema, collegamenti, quiz), ripasso distanziato
 * e profilo calcolato dalle risposte.
 *
 *   node tests/culture.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const root = path.join(__dirname, "..");
const E = require(path.join(root, "culture", "engine.js"));
require(path.join(root, "culture", "cards.js"));
const CARDS = globalThis.CultureCards;
const DAY = E.DAY;

let passed = 0;
const failed = [];
function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failed.push(name);
    console.error(`FALLITO: ${name}\n  ${error.message}`);
  }
}

const allRight = (card) => card.quiz.map((q, i) => ({ q: i, correct: true }));
const allWrong = (card) => card.quiz.map((q, i) => ({ q: i, correct: false }));

test("Schede: schema completo, collegamenti validi, quiz ben formati", () => {
  assert.ok(CARDS.length >= 30, `poche schede: ${CARDS.length}`);
  const ids = new Set(CARDS.map((c) => c.id));
  assert.strictEqual(ids.size, CARDS.length, "id duplicati");
  CARDS.forEach((c) => {
    assert.ok(E.AREAS[c.area], `${c.id}: area ${c.area}`);
    assert.ok([1, 2, 3].includes(c.level), `${c.id}: livello`);
    assert.ok(c.title && c.hook && c.minutes > 0, `${c.id}: testi`);
    assert.ok(c.sections.length >= 3 && c.sections.every((s) => s.h && s.text), `${c.id}: sezioni`);
    assert.ok(c.facts.length >= 3, `${c.id}: fatti`);
    c.links.forEach((l) => assert.ok(ids.has(l) && l !== c.id, `${c.id}: collegamento ${l}`));
    assert.strictEqual(c.quiz.length, 5, `${c.id}: 5 domande`);
    const types = c.quiz.map((q) => q.type);
    ["comprensione", "applicazione", "collegamento"].forEach((t) => assert.ok(types.includes(t), `${c.id}: manca ${t}`));
    c.quiz.forEach((q, i) => {
      assert.ok(E.TYPE_LABELS[q.type], `${c.id} q${i}: tipo`);
      assert.strictEqual(q.options.length, 4, `${c.id} q${i}: 4 opzioni`);
      assert.strictEqual(new Set(q.options).size, 4, `${c.id} q${i}: opzioni duplicate`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${c.id} q${i}: risposta`);
      assert.ok(q.q && q.why, `${c.id} q${i}: testo`);
    });
    assert.ok(c.explain && c.explain.prompt && c.explain.model && c.explain.points.length === 3, `${c.id}: spiegazione`);
  });
});

test("Schede: tutte le aree, livelli diversi", () => {
  Object.keys(E.AREAS).forEach((a) => assert.ok(CARDS.filter((c) => c.area === a).length >= 3, `area ${a}`));
  [1, 2, 3].forEach((lv) => assert.ok(CARDS.some((c) => c.level === lv), `livello ${lv}`));
});

test("Studio: verifica buona = ripasso tra 3 giorni, debole = domani", () => {
  const now = Date.UTC(2026, 9, 14, 10);
  const lab = E.ensureLab(null, { cards: CARDS, now });
  const [a, b] = CARDS;
  const sa = E.recordStudy(lab, a, allRight(a), "ok", now);
  assert.strictEqual(sa.box, 2);
  assert.strictEqual(sa.due, now + 3 * DAY);
  const sb = E.recordStudy(lab, b, allWrong(b), null, now);
  assert.strictEqual(sb.box, 1);
  assert.strictEqual(sb.due, now + DAY);
  const sa2 = E.recordStudy(lab, a, allRight(a), "no", now);
  assert.strictEqual(sa2.box, 1, "'da rivedere' rimanda il ripasso a domani");
});

test("Studio: le statistiche contano solo il primo studio", () => {
  const lab = E.ensureLab(null, { cards: CARDS });
  const c = CARDS[0];
  E.recordStudy(lab, c, allWrong(c));
  const attempts = Object.values(lab.stats).reduce((n, s) => n + s.a, 0);
  E.recordStudy(lab, c, allRight(c));
  E.recordStudy(lab, c, allRight(c));
  const after = Object.values(lab.stats).reduce((n, s) => n + s.a, 0);
  assert.strictEqual(after, attempts, "rifare la verifica non gonfia il profilo");
});

test("Ripasso: giuste = scatola su, sbagliate = torna a 1, scadenze crescenti", () => {
  let now = Date.UTC(2026, 9, 14, 10);
  const lab = E.ensureLab(null, { cards: CARDS, now });
  const c = CARDS[0];
  E.recordStudy(lab, c, allRight(c), "ok", now);
  const boxes = [];
  for (let i = 0; i < 4; i += 1) {
    now = lab.cards[c.id].due;
    assert.ok(E.dueCards(lab, CARDS, now).some((x) => x.id === c.id), "in scadenza");
    const qs = E.pickReviewQuestions(c, lab.cards[c.id], 2);
    E.recordReview(lab, c, qs.map((q) => ({ q, correct: true })), now);
    boxes.push(lab.cards[c.id].box);
  }
  assert.deepStrictEqual(boxes, [3, 4, 5, 5]);
  assert.strictEqual(lab.cards[c.id].due - now, 35 * DAY);
  E.recordReview(lab, c, [{ q: 0, correct: false }, { q: 1, correct: false }], now);
  assert.strictEqual(lab.cards[c.id].box, 1);
  assert.strictEqual(lab.reviewsOnTime, lab.reviewsDone, "ripassi fatti alla scadenza: in tempo");
});

test("Ripasso: prima le domande sbagliate", () => {
  const c = CARDS[0];
  const qs = E.pickReviewQuestions(c, { wrong: [3], asked: [0, 1, 2, 3, 4] }, 2, () => 0.5);
  assert.strictEqual(qs[0], 3);
  assert.strictEqual(qs.length, 2);
  assert.notStrictEqual(qs[1], 3);
});

test("Profilo: sale con risposte giuste, la memoria cala con ripassi scaduti", () => {
  let now = Date.UTC(2026, 9, 14, 10);
  const lab = E.ensureLab(null, { cards: CARDS, now });
  const start = E.profile(lab, CARDS, now);
  CARDS.slice(0, 8).forEach((c) => E.recordStudy(lab, c, allRight(c), "ok", now));
  CARDS.slice(0, 8).forEach((c) => {
    const t = lab.cards[c.id].due;
    E.recordReview(lab, c, [{ q: 0, correct: true }, { q: 1, correct: true }], t);
  });
  const good = E.profile(lab, CARDS, now + 4 * DAY);
  assert.ok(good.comprensione > start.comprensione && good.memoria > start.memoria && good.ampiezza > start.ampiezza);
  const late = E.profile(lab, CARDS, now + 60 * DAY);
  assert.ok(late.memoria < good.memoria, "ripassi scaduti da settimane: memoria in calo");
  Object.values(late).forEach((v) => assert.ok(v >= 10 && v <= 99));
});

test("Migrazione: gli argomenti gia' studiati entrano subito in ripasso", () => {
  const now = Date.UTC(2026, 9, 14, 10);
  const legacy = ["storia-guerra-fredda", "geografia-suez", "inesistente"];
  const lab = E.ensureLab(null, { legacy, cards: CARDS, now });
  const present = legacy.filter((id) => CARDS.some((c) => c.id === id));
  present.forEach((id) => assert.strictEqual(lab.cards[id].box, 1));
  assert.ok(!lab.cards.inesistente);
  assert.strictEqual(E.dueCards(lab, CARDS, now).length, present.length);
  const again = E.ensureLab(lab, { legacy: ["economia-domanda-offerta"], cards: CARDS, now });
  assert.ok(!again.cards["economia-domanda-offerta"], "la migrazione avviene una sola volta");
});

test("Consigli: prossima scheda nell'area meno coperta, livello base prima", () => {
  const lab = E.ensureLab(null, { cards: CARDS });
  const first = E.nextCard(lab, CARDS);
  assert.ok(first && first.level === Math.min(...CARDS.filter((c) => c.area === first.area).map((c) => c.level)));
  CARDS.filter((c) => c.area === first.area).forEach((c) => E.recordStudy(lab, c, allRight(c)));
  const second = E.nextCard(lab, CARDS);
  assert.notStrictEqual(second.area, first.area);
});

if (failed.length) {
  console.error(`${failed.length} test falliti, ${passed} superati.`);
  process.exitCode = 1;
} else {
  console.log(`Tutti i test superati (${passed}).`);
}
