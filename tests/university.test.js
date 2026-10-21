/*
 * Test della mini università (Cultura): motore (lezioni, ripasso distanziato, esame in trentesimi,
 * libretto, dati salvati) e controllo di tutti i corsi in culture/university.js (struttura,
 * lunghezze, link https, domande ben formate, id unici).
 *
 *   node tests/university.test.js
 */
const assert = require("assert");
const path = require("path");

const U = require(path.join(__dirname, "..", "culture", "uni-engine.js"));
global.window = global.window || {};
require(path.join(__dirname, "..", "culture", "university.js"));
const COURSES = window.CultureUniversity.courses;

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
const DAY = 86400000;
const T0 = new Date(2026, 9, 21, 10, 0, 0).getTime();

// corso finto per provare il motore
function fake(id = "prova-corso", n = 8) {
  return {
    id, faculty: "psicologia", title: "Corso di prova", level: 1, summary: "x",
    source: { inst: "MIT", code: "1", title: "t", prof: "p", year: "y", url: "https://x", license: "l", lang: "inglese" },
    extra: [],
    lessons: Array.from({ length: n }, (_, i) => ({
      id: `${id}-${String(i + 1).padStart(2, "0")}`, title: `Lezione ${i + 1}`, minutes: 10,
      quiz: Array.from({ length: 5 }, (_, k) => ({ q: `D${i}-${k}`, options: ["a", "b", "c", "d"], answer: k % 4, why: "w" }))
    }))
  };
}

test("Lezione: si supera dal 60%, entra in ripasso, il meglio resta", () => {
  const u = U.ensure(null);
  const c = fake();
  const l = c.lessons[0];
  const r1 = U.finishLesson(u, l, { correct: 2, total: 5, now: T0 });
  assert.strictEqual(r1.passed, false);
  assert.strictEqual(U.isDone(u, l.id), false);
  const r2 = U.finishLesson(u, l, { correct: 3, total: 5, now: T0 + 1000, note: "spiegazione mia" });
  assert.strictEqual(r2.passed, true);
  assert.strictEqual(r2.first, true);
  assert.strictEqual(U.lessonState(u, l.id).box, 1);
  assert.strictEqual(U.lessonState(u, l.id).due, U.addDays(T0, 1));
  assert.strictEqual(U.lessonState(u, l.id).note, "spiegazione mia");
  U.finishLesson(u, l, { correct: 1, total: 5, now: T0 + 2000 });
  assert.strictEqual(U.lessonState(u, l.id).best, 60, "resta il migliore");
  assert.strictEqual(U.lessonState(u, l.id).tries, 3);
  assert.ok(U.isDone(u, l.id), "una lezione superata resta superata");
  assert.strictEqual(u.minutes, 30);
});

test("Ripasso: scadenze 1-3-7-16-35 giorni, giusto sale, sbagliato scende", () => {
  const u = U.ensure(null);
  const c = fake();
  const l = c.lessons[0];
  U.finishLesson(u, l, { correct: 5, total: 5, now: T0 });
  assert.strictEqual(U.dueLessons(u, [c], T0).length, 0);
  assert.strictEqual(U.dueLessons(u, [c], U.addDays(T0, 1)).length, 1);
  let t = U.addDays(T0, 1);
  [2, 3, 4, 5].forEach((box) => {
    const r = U.reviewLesson(u, l, { correct: 2, total: 2, now: t });
    assert.strictEqual(r.box, box);
    assert.strictEqual(r.due, U.addDays(t, U.INTERVALS[box]));
    t = r.due;
  });
  const down = U.reviewLesson(u, l, { correct: 1, total: 2, now: t });
  assert.strictEqual(down.box, 4);
  const qs = U.reviewQuestions(l, 2, 42);
  assert.strictEqual(qs.length, 2);
  assert.notStrictEqual(qs[0].q, qs[1].q);
  assert.strictEqual(U.reviewLesson(u, c.lessons[3], { correct: 2, total: 2, now: t }), null, "solo lezioni superate");
});

test("Corso ed esame: si sblocca a lezioni finite, 12 domande da tutte le lezioni", () => {
  const u = U.ensure(null);
  const c = fake();
  assert.strictEqual(U.courseProgress(u, c).examOpen, false);
  c.lessons.forEach((l, i) => U.finishLesson(u, l, { correct: 4, total: 5, now: T0 + i }));
  const p = U.courseProgress(u, c);
  assert.strictEqual(p.done, 8);
  assert.strictEqual(p.examOpen, true);
  assert.strictEqual(p.next, null);
  const ex = U.makeExam(c, 7);
  assert.strictEqual(ex.length, U.EXAM_SIZE);
  assert.strictEqual(new Set(ex.map((q) => q.lesson)).size, 8, "almeno una domanda per lezione");
  assert.strictEqual(new Set(ex.map((q) => q.q)).size, ex.length, "nessuna domanda doppia");
  ex.forEach((q) => assert.deepStrictEqual(q.order.slice().sort(), [0, 1, 2, 3]));
  assert.deepStrictEqual(U.makeExam(c, 7).map((q) => q.q), ex.map((q) => q.q), "stesso seme, stesso esame");
});

test("Voto in trentesimi: 18 al 60%, 30 e lode al 100%, sotto il 60% non superato", () => {
  assert.strictEqual(U.grade(7, 12).passed, false);
  assert.deepStrictEqual(U.grade(8, 12), { passed: true, vote: 18, lode: false, pct: 67 });
  assert.strictEqual(U.minCorrect(12), 8);
  assert.strictEqual(U.minCorrect(10), 6);
  assert.deepStrictEqual([8, 9, 10, 11].map((c) => U.grade(c, 12).vote), [18, 21, 24, 27]);
  assert.strictEqual(U.grade(6, 10).vote, 18);
  assert.strictEqual(U.grade(9, 10).vote, 27);
  assert.deepStrictEqual(U.grade(12, 12), { passed: true, vote: 30, lode: true, pct: 100 });
  assert.strictEqual(U.voteLabel(U.grade(12, 12)), "30 e lode");
  assert.strictEqual(U.voteLabel(U.grade(11, 12)), "27/30");
  assert.strictEqual(U.voteLabel(U.grade(2, 12)), "Non superato");
});

test("Libretto: resta il voto migliore, media e crediti", () => {
  const u = U.ensure(null);
  const a = fake("corso-a");
  const b = fake("corso-b");
  U.recordExam(u, a, { correct: 5, total: 12, now: T0 });
  assert.strictEqual(U.libretto(u, [a, b]).rows.length, 0);
  U.recordExam(u, a, { correct: 12, total: 12, now: T0 + DAY });
  U.recordExam(u, a, { correct: 9, total: 12, now: T0 + 2 * DAY });
  assert.strictEqual(U.examResult(u, "corso-a").lode, true, "resta il migliore");
  assert.strictEqual(U.examResult(u, "corso-a").attempts, 3);
  U.recordExam(u, b, { correct: 9, total: 12, now: T0 + 3 * DAY });
  const lib = U.libretto(u, [a, b]);
  assert.strictEqual(lib.rows.length, 2);
  assert.strictEqual(lib.cfu, 12);
  assert.strictEqual(lib.avg, 25.5);
  assert.strictEqual(lib.base110, 94);
  const st = U.stats(u, [a, b], T0 + 3 * DAY);
  assert.strictEqual(st.exams, 2);
  assert.strictEqual(st.streak, 4);
});

test("Dati salvati: valori rovinati sistemati, id strani scartati", () => {
  const u = U.ensure({ version: 1, lessons: { "ok-01": { box: 9, best: 140, tries: -2, done: "ieri", note: 5 }, "<script>": { box: 1 } }, exams: { "c-1": { attempts: [{ t: 1, correct: 13, total: 12 }, { t: 2, correct: 6, total: 10 }] }, x: "no" }, days: ["2026-10-01", "oggi"], minutes: -5 });
  assert.deepStrictEqual(Object.keys(u.lessons), ["ok-01"]);
  assert.strictEqual(u.lessons["ok-01"].box, 5);
  assert.strictEqual(u.lessons["ok-01"].best, 100);
  assert.strictEqual(u.lessons["ok-01"].tries, 0);
  assert.strictEqual(u.lessons["ok-01"].done, null);
  assert.strictEqual(u.lessons["ok-01"].note, undefined);
  assert.deepStrictEqual(Object.keys(u.exams), ["c-1"]);
  assert.strictEqual(u.exams["c-1"].attempts.length, 1);
  assert.deepStrictEqual(u.days, ["2026-10-01"]);
  assert.strictEqual(u.minutes, 0);
  assert.strictEqual(U.ensure("rotto").version, 1);
  // lezione fatta ma senza voto o data di ripasso: sistemata, non persa
  const v = U.ensure({ version: 1, lessons: { "x-01": { done: T0, box: 0 } }, exams: { "c-2": { attempts: [{ t: 0, correct: 9, total: 12 }, { t: T0, correct: 9, total: 12 }] } } });
  assert.strictEqual(v.lessons["x-01"].best, 60);
  assert.strictEqual(v.lessons["x-01"].due, U.addDays(T0, 1));
  assert.strictEqual(v.lessons["x-01"].box, 1);
  assert.strictEqual(v.exams["c-2"].attempts.length, 1);
  assert.strictEqual(U.dueCount(v, U.addDays(T0, 1)), 1);
  assert.strictEqual(U.dueCount(v, T0), 0);
});

test("Spiegazione: lasciarla vuota cancella quella salvata", () => {
  const u = U.ensure(null);
  const l = fake("corso-n").lessons[0];
  U.finishLesson(u, l, { correct: 5, total: 5, now: T0, note: "prima versione" });
  assert.strictEqual(U.lessonState(u, l.id).note, "prima versione");
  U.finishLesson(u, l, { correct: 5, total: 5, now: T0 + DAY, note: "   " });
  assert.strictEqual(U.lessonState(u, l.id).note, undefined);
  U.finishLesson(u, l, { correct: 5, total: 5, now: T0 + 2 * DAY });
  assert.strictEqual(U.lessonState(u, l.id).note, undefined);
});

test("Corsi: struttura completa, link https, domande ben formate, id unici", () => {
  assert.ok(COURSES.length >= 8, `${COURSES.length} corsi`);
  const ids = new Set();
  const lids = new Set();
  const faculties = new Set();
  let lessons = 0;
  COURSES.forEach((c) => {
    assert.ok(/^[a-z0-9]+(-[a-z0-9]+)+$/.test(c.id), c.id);
    assert.ok(!ids.has(c.id), `corso doppio ${c.id}`);
    ids.add(c.id);
    assert.ok(U.FACULTIES[c.faculty], `${c.id}: facoltà ${c.faculty}`);
    faculties.add(c.faculty);
    assert.ok([1, 2, 3].includes(c.level));
    ["inst", "code", "title", "prof", "year", "license", "lang"].forEach((k) => assert.ok(typeof c.source[k] === "string" && c.source[k].trim(), `${c.id}: source.${k}`));
    assert.ok(/^https:\/\/\S+$/.test(c.source.url), `${c.id}: url`);
    (c.extra || []).forEach((x) => assert.ok(/^https:\/\/\S+$/.test(x.url) && x.title && x.what, `${c.id}: extra`));
    assert.ok(c.lessons.length >= 8 && c.lessons.length <= 14, `${c.id}: ${c.lessons.length} lezioni`);
    c.lessons.forEach((l, i) => {
      const at = `${c.id} lezione ${i + 1}`;
      assert.strictEqual(l.id, `${c.id}-${String(i + 1).padStart(2, "0")}`, at);
      assert.ok(!lids.has(l.id), `${at}: id doppio`);
      lids.add(l.id);
      assert.ok(/^https:\/\/\S+$/.test(l.watch.url) && l.watch.label.length >= 10, `${at}: lezione originale`);
      (l.read || []).forEach((r) => assert.ok(/^https:\/\/\S+$/.test(r.url) && r.label, `${at}: letture`));
      assert.ok(Number.isInteger(l.minutes) && l.minutes >= 5 && l.minutes <= 30, `${at}: minuti`);
      assert.ok(l.sections.length >= 3 && l.sections.length <= 6, `${at}: sezioni`);
      l.sections.forEach((s) => assert.ok(s.h && s.text.length >= 450 && s.text.length <= 1700, `${at}: sezione "${s.h}" ${s.text.length} caratteri`));
      assert.ok(l.keyPoints.length >= 4 && l.keyPoints.length <= 7, `${at}: punti chiave`);
      assert.ok(l.terms.length >= 3 && l.terms.every((t) => t.t && t.d), `${at}: glossario`);
      assert.ok(l.quiz.length >= 4 && l.quiz.length <= 6, `${at}: quiz`);
      l.quiz.forEach((q, k) => {
        assert.strictEqual(q.options.length, 4, `${at} domanda ${k + 1}: 4 opzioni`);
        assert.strictEqual(new Set(q.options).size, 4, `${at} domanda ${k + 1}: opzioni doppie`);
        assert.ok([0, 1, 2, 3].includes(q.answer), `${at} domanda ${k + 1}: risposta`);
        assert.ok(q.q.length >= 15 && q.why.length >= 30, `${at} domanda ${k + 1}: testo`);
        // le opzioni vengono mescolate: la spiegazione non può dire "la prima opzione"
        assert.ok(!/\b(prima|seconda|terza|quarta|ultima)\s+(opzione|risposta|alternativa)\b|\b(opzione|risposta)\s+[ABCD]\b/i.test(q.why), `${at} domanda ${k + 1}: riferimento alla posizione`);
      });
      assert.ok(typeof l.explain === "string" && l.explain.length >= 30, `${at}: spiegalo tu`);
      lessons += 1;
    });
    // l'esame si puo' sempre comporre
    assert.strictEqual(U.makeExam(c, 1).length, U.EXAM_SIZE);
    // la risposta giusta non si riconosce dalla lunghezza
    const qs = c.lessons.flatMap((l) => l.quiz);
    const longest = qs.filter((q) => { const lens = q.options.map((o) => o.length); const m = Math.max(...lens); return lens[q.answer] === m && lens.filter((x) => x === m).length === 1; }).length;
    assert.ok(longest / qs.length <= 0.35, `${c.id}: la giusta è la più lunga nel ${Math.round((longest / qs.length) * 100)}% delle domande`);
    const shortest = qs.filter((q) => { const lens = q.options.map((o) => o.length); const m = Math.min(...lens); return lens[q.answer] === m && lens.filter((x) => x === m).length === 1; }).length;
    assert.ok(shortest / qs.length <= 0.4, `${c.id}: la giusta è la più corta nel ${Math.round((shortest / qs.length) * 100)}% delle domande`);
  });
  assert.ok(faculties.size >= 8, `${faculties.size} facoltà`);
  assert.ok(lessons >= 80, `${lessons} lezioni`);
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exit(1);
