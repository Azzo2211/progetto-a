/*
 * Test delle parti nuove della memoria: ripasso FSRS, mazzi (anche vocaboli nei due sensi),
 * sistema delle carte, persona-azione-oggetto, discipline immagini e date, turni del percorso,
 * palazzo a due parole per luogo, percorso di 42 giornate, testi a memoria, esercizi di scacchi,
 * ritenzione vera, contenuti con le fonti, stato rovinato.
 *
 *   node tests/memory-plus.test.js
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

globalThis.window = globalThis;
const S = require(path.join(__dirname, "..", "memory", "srs.js"));
const C = require(path.join(__dirname, "..", "memory", "content.js"));
const CO = require(path.join(__dirname, "..", "memory", "course.js"));
const IMG = require(path.join(__dirname, "..", "memory", "images.js"));
const E = require(path.join(__dirname, "..", "memory", "engine.js"));

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
const T0 = new Date(2026, 9, 22, 9, 0, 0).getTime(); // giovedi' 22 ottobre 2026, ore 9
const DAY = 86400000;
const near = (a, b, eps = 0.01) => Math.abs(a - b) <= eps;

/* ------------------------------------------------------------ FSRS */
test("FSRS: probabilità di ricordo e intervalli come nella formula (R(S,S) = 90%)", () => {
  assert.ok(near(S.retrievabilityAt(10, 10), 0.9, 1e-9));
  assert.ok(near(S.retrievabilityAt(0, 10), 1, 1e-9));
  assert.ok(S.retrievabilityAt(30, 10) < S.retrievabilityAt(10, 10));
  assert.ok(near(S.interval(10, 0.9), 10, 1e-9), "con il 90% l'intervallo è la stabilità");
  assert.ok(near(S.interval(10, 0.95), 4.61), `${S.interval(10, 0.95)}`);
  assert.ok(near(S.interval(10, 0.97), 2.68), `${S.interval(10, 0.97)}`);
  assert.strictEqual(S.W.length, 19);
});

test("FSRS: scheda nuova, voti, stesso giorno senza ricalcolo, errore che accorcia", () => {
  const r = S.review(null, 3, T0, 0.9);
  assert.strictEqual(r.state.s, S.W[2]);
  assert.ok(near(r.state.d, 5.2824, 1e-3));
  assert.strictEqual(r.state.reps, 1);
  assert.strictEqual(r.state.due, S.startOfDay(T0) + 3 * DAY + 4 * 3600000, "torna fra 3 giorni, al mattino");
  const again = S.review(null, 1, T0, 0.9);
  assert.strictEqual(again.state.due, T0 + S.RELEARN_MS, "sbagliata: di nuovo tra 10 minuti");
  assert.strictEqual(again.state.lapses, 1);
  // stesso giorno: non si ricalcola stabilita' e difficolta'
  const same = S.review(again.state, 3, T0 + 15 * 60000, 0.9);
  assert.strictEqual(same.counted, false);
  assert.strictEqual(same.state.s, again.state.s);
  assert.ok(same.state.due >= S.startOfDay(T0) + DAY, "da domani");
  // dopo 3 giorni: bene fa crescere la stabilita', di nuovo la abbassa
  const good = S.review(r.state, 3, T0 + 3 * DAY, 0.9);
  assert.ok(good.counted && good.state.s > r.state.s * 2, `${good.state.s}`);
  assert.ok(near(good.r, 0.905, 0.01));
  const bad = S.review(r.state, 1, T0 + 3 * DAY, 0.9);
  assert.ok(bad.state.s < r.state.s && bad.state.lapses === 1);
  assert.ok(S.review(r.state, 4, T0 + 3 * DAY).state.s > S.review(r.state, 2, T0 + 3 * DAY).state.s, "facile > difficile");
  assert.ok(S.review(r.state, 4, T0 + 3 * DAY).state.d < S.review(r.state, 2, T0 + 3 * DAY).state.d);
});

test("FSRS: obiettivo più alto = ripassi più vicini; anteprima ed etichette", () => {
  const st = S.review(null, 3, T0).state;
  const at = T0 + 3 * DAY;
  const n90 = S.review(st, 3, at, 0.9).state.due;
  const n95 = S.review(st, 3, at, 0.95).state.due;
  const n97 = S.review(st, 3, at, 0.97).state.due;
  assert.ok(n90 > n95 && n95 > n97);
  assert.deepStrictEqual(S.preview(null, T0, 0.9), { 1: 0, 2: 1, 3: 3, 4: 16 });
  assert.deepStrictEqual(S.preview(null, T0, 0.97), { 1: 0, 2: 1, 3: 1, 4: 4 });
  assert.deepStrictEqual([0, 1, 5, 45, 400].map(S.label), ["tra 10 min", "domani", "tra 5 giorni", "tra 2 mesi", "tra 1,1 anni"]);
  assert.strictEqual(S.clean({ s: "x" }), null);
  assert.strictEqual(S.clean({ s: 5, d: 99, due: T0 }).d, 10);
  assert.ok(S.mature({ s: 21 }) && !S.mature({ s: 20 }));
});

/* ------------------------------------------------------------ mazzi */
test("Mazzi: schede, incolla da foglio, nuove al giorno, ripasso e statistiche", () => {
  const lab = E.ensure(null);
  const d = E.addDeck(lab, { name: "Diritto", kind: "qa", now: T0 });
  assert.ok(d && lab.decks.length === 1);
  assert.strictEqual(E.addCard(lab, d.id, { f: "Senza risposta", b: "  " }), null);
  assert.ok(E.addCard(lab, d.id, { f: "Art. 1?", b: "Sovranità al popolo", now: T0 }));
  const lines = Array.from({ length: 20 }, (_, i) => `Domanda ${i} | Risposta ${i}${i % 3 === 0 ? " | nota" : ""}`).concat(["riga sbagliata", "A;B", "Tab\tTab"]).join("\n");
  assert.strictEqual(E.importCards(lab, d.id, lines, T0 + 1), 22);
  assert.strictEqual(d.cards.length, 23);
  assert.strictEqual(d.cards[1].x, "nota");
  let q = E.deckQueue(lab, T0 + 1000);
  assert.strictEqual(q.due.length, 0);
  assert.strictEqual(q.fresh.length, E.newPerDay(lab), "le nuove fino al limite del giorno");
  q.fresh.forEach((ref) => E.answerCard(lab, ref, 3, T0 + 2000));
  q = E.deckQueue(lab, T0 + 3000);
  assert.strictEqual(q.fresh.length, 0, "limite raggiunto oggi");
  q = E.deckQueue(lab, T0 + 4 * DAY);
  assert.strictEqual(q.due.length, 15, "dopo 4 giorni tornano le 15 viste");
  assert.strictEqual(q.fresh.length, 8, "e le altre 8 nuove");
  const st = E.deckStats(d, T0 + 4 * DAY);
  assert.deepStrictEqual([st.cards, st.due, st.fresh, st.mature], [23, 15, 8, 0]);
  assert.strictEqual(lab.revlog.length, 15);
  E.removeCard(lab, d.id, d.cards[0].id);
  assert.strictEqual(d.cards.length, 22);
  lab.prefs.newPerDay = 5;
  assert.strictEqual(E.deckQueue(lab, T0 + 4 * DAY).fresh.length, 5);
  E.removeDeck(lab, d.id);
  assert.strictEqual(lab.decks.length, 0);
});

test("Mazzi di vocaboli: due sensi, il secondo solo dal giorno dopo; obiettivo per mazzo", () => {
  const lab = E.ensure(null);
  const d = E.addDeck(lab, { name: "Spagnolo", kind: "vocab", lang: "spagnolo", now: T0 });
  E.addCard(lab, d.id, { f: "ventana", b: "finestra", x: "ventaglio sulla finestra", now: T0 });
  let q = E.deckQueue(lab, T0);
  assert.deepStrictEqual(q.fresh.map((r) => r.side), ["a"], "prima il senso straniero → italiano");
  E.answerCard(lab, q.fresh[0], 3, T0);
  assert.strictEqual(E.deckQueue(lab, T0 + 60000).fresh.length, 0, "non lo stesso giorno");
  q = E.deckQueue(lab, T0 + DAY);
  assert.deepStrictEqual(q.fresh.map((r) => r.side), ["b"]);
  assert.strictEqual(E.deckStats(d).sides, 2);
  assert.strictEqual(E.retentionOf(lab, d), 0.9);
  d.retention = 0.97;
  assert.strictEqual(E.retentionOf(lab, d), 0.97);
  lab.prefs.retention = 0.5;
  assert.strictEqual(E.retentionOf(lab), 0.85, "mai sotto l'85%");
});

test("Mazzo pronto delle aperture e limite di schede", () => {
  const lab = E.ensure(null);
  const d = E.addStarter(lab, "openings", T0);
  assert.strictEqual(d.cards.length, C.OPENINGS.length);
  assert.ok(C.OPENINGS.length >= 15);
  C.OPENINGS.forEach(([q, moves, idea]) => assert.ok(q && /^1\.\s?[a-hCDTAR]/.test(moves) && idea.length > 20, q));
  assert.strictEqual(E.addStarter(lab, "nessuno"), null);
});

/* ------------------------------------------------------------ sistemi */
test("Sistema delle carte: 52 codici diversi del sistema fonetico, regole del seme e delle figure", () => {
  assert.deepStrictEqual(["7H", "KS", "10D", "AC", "QH", "JD"].map(E.cardCode), ["77", "49", "10", "81", "27", "61"]);
  const codes = E.DECK.map(E.cardCode);
  assert.strictEqual(new Set(codes).size, 52);
  codes.forEach((c) => assert.ok(E.MAJOR.some((m) => m.code === c), c));
  assert.strictEqual(E.cardImage("7H").word, E.MAJOR.find((m) => m.code === "77").word);
  const lab = E.ensure(null);
  let q = E.cardsQueue(lab, T0);
  assert.strictEqual(q.fresh.length, E.CARDS_NEW_PER_DAY);
  q.fresh.forEach((c) => E.cardAnswer(lab, c, true, T0));
  assert.strictEqual(E.cardsQueue(lab, T0 + 1000).fresh.length, 0);
  assert.strictEqual(E.cardsQueue(lab, T0 + DAY).fresh.length, 13);
  const cq = E.cardQuestion("KS", 3);
  assert.ok(cq.kind === "pick" ? cq.options.length === 4 && cq.options.includes(cq.answer) : cq.answer === "49");
  // sicura quando la stabilita' arriva a una settimana
  let t = T0;
  for (let i = 0; i < 4; i += 1) { t += 6 * DAY; E.cardAnswer(lab, "AS", true, t); }
  assert.ok(E.cardsSure(lab) >= 1);
});

test("Persona-azione-oggetto: iniziali Dominic, 10 nuove al giorno, storia da 6 cifre", () => {
  assert.deepStrictEqual(["15", "00", "90", "37"].map(E.dominic), ["AE", "OO", "NO", "CG"]);
  const lab = E.ensure(null);
  assert.strictEqual(E.paoSet(lab, "1x", "a", "b"), null);
  for (let i = 0; i < 15; i += 1) E.paoSet(lab, String(i).padStart(2, "0"), `Persona ${i}`, i === 14 ? "" : `azione ${i}`);
  assert.strictEqual(E.paoFilled(lab), 14, "serve persona e azione");
  E.paoSet(lab, "14", "Persona 14", "corre");
  const q = E.paoQueue(lab, T0);
  assert.strictEqual(q.fresh.length, 10);
  q.fresh.forEach((c) => E.paoAnswer(lab, c, 3, T0));
  assert.strictEqual(E.paoQueue(lab, T0 + 1000).fresh.length, 0);
  const story = E.paoStory(lab, "011434");
  assert.deepStrictEqual(story, [{ digits: "011434", person: "Persona 1", action: "corre", object: E.MAJOR.find((m) => m.code === "34").word }]);
  E.paoSet(lab, "01", "", "");
  assert.ok(!lab.systems.pao["01"], "vuota: tolta");
});

/* ------------------------------------------------------------ discipline nuove */
test("Immagini astratte: stessa immagine dallo stesso seme, forme diverse", () => {
  assert.strictEqual(IMG.svg(123), IMG.svg(123));
  assert.notStrictEqual(IMG.svg(123), IMG.svg(124));
  const kinds = new Set(Array.from({ length: 200 }, (_, i) => IMG.describe(i + 1).kind));
  assert.ok(kinds.size >= 10, `${kinds.size} forme`);
  assert.ok(/^<svg class="mem-abs"/.test(IMG.svg(5, { label: "x" })));
});

test("Discipline immagini e date: turni, punteggio un punto per risposta giusta", () => {
  const lab = E.ensure(null);
  const ri = E.makeRound("images", 2, 77, lab);
  assert.strictEqual(ri.items.length, 10);
  assert.strictEqual(new Set(ri.items).size, 10);
  const ans = ri.items.slice();
  [ans[0], ans[1]] = [ans[1], ans[0]];
  const si = E.scoreRound(ri, ans);
  assert.strictEqual(si.correct, 8);
  assert.strictEqual(si.score, 8);
  const rd = E.makeRound("dates", 1, 5, lab);
  assert.strictEqual(rd.items.length, 5);
  rd.items.forEach((x) => assert.ok(x.year >= 1000 && x.year <= 2099 && x.event.length > 8));
  assert.strictEqual(new Set(rd.items.map((x) => x.year)).size, 5);
  const sd = E.scoreRound(rd, rd.items.map((x, i) => (i < 4 ? String(x.year) : "")));
  assert.deepStrictEqual([sd.correct, sd.score, sd.marks[4]], [4, 4, null]);
  assert.ok(E.BENCH.images && E.BENCH.dates);
});

test("Turni su misura (percorso e vita quotidiana) e palazzo con due parole per luogo", () => {
  const lab = E.ensure(null);
  const r = E.makeRound("numbers", 0, 9, lab, { n: 12, mem: 45, life: "phone" });
  assert.ok(r.custom && r.n === 12 && r.mem === 45 && r.level === 0 && r.life === "phone");
  const res = E.scoreRound(r, r.items.map(String));
  const rec = E.recordRound(lab, r, res, { now: T0 });
  assert.strictEqual(rec.unlocked, false, "i turni su misura non sbloccano livelli");
  assert.strictEqual(lab.disciplines.numbers.unlocked, 1);
  assert.ok(lab.log.some((e) => e.kind === "life:phone") && lab.log.some((e) => e.kind === "dis:numbers" && e.m.n === 12));
  const shop = E.makeRound("words", 0, 3, lab, { n: 12, mem: 90, list: "groceries" });
  shop.items.forEach((w) => assert.ok(C.GROCERIES.includes(w), w));
  const p = E.savePalace(lab, { name: "Casa", loci: Array.from({ length: 8 }, (_, i) => `luogo ${i}`) });
  const pr = E.makePalaceRound(lab, p.id, 16, 4, 2);
  assert.strictEqual(pr.items.length, 16);
  assert.strictEqual(pr.loci.length, 8);
  assert.strictEqual(pr.per, 2);
  assert.strictEqual(E.makePalaceRound(lab, p.id, 30, 4, 2).items.length, 16, "al massimo due per luogo");
  E.recordPalace(lab, pr, E.scorePalace(pr, pr.items), T0);
  assert.ok(lab.log.some((e) => e.kind === "palace" && e.m.n === 16 && e.m.per === 2));
});

/* ------------------------------------------------------------ percorso */
test("Percorso: 6 settimane, 42 giornate valide, lezioni esistenti, test all'inizio, a metà e alla fine", () => {
  assert.strictEqual(CO.WEEKS.length, 6);
  assert.strictEqual(CO.DAYS.length, 42);
  assert.strictEqual(CO.LENGTH, 42);
  const kinds = new Set(Object.keys(E.taskInfo ? { test: 1, words: 1, major: 1, build: 1, palace: 1, dis: 1, cardsys: 1, pao: 1, deck: 1, review: 1, text: 1, chess: 1, life: 1, real: 1 } : {}));
  const lab = E.ensure(null);
  CO.DAYS.forEach((d, i) => {
    assert.strictEqual(d.d, i + 1);
    assert.strictEqual(d.w, Math.ceil((i + 1) / 7));
    assert.ok(d.title && d.tasks.length >= 1, `giorno ${d.d}`);
    if (d.lesson) assert.ok(E.lessonById(d.lesson), `giorno ${d.d}: lezione ${d.lesson}`);
    assert.strictEqual(new Set(d.tasks.map((t) => t.id)).size, d.tasks.length);
    d.tasks.forEach((t) => {
      assert.ok(kinds.has(t.k), `giorno ${d.d}: compito ${t.k}`);
      const info = E.taskInfo(t, lab, T0);
      assert.ok(info.label && typeof info.detail === "string", `giorno ${d.d}: ${t.k}`);
      if (t.k === "test") assert.ok(E.SPAN_TESTS[t.test]);
      if (t.k === "dis") assert.ok(E.DISCIPLINES[t.key] && t.n > 0 && t.mem > 0);
      if (t.k === "chess") assert.ok(E.CHESS_DRILLS[t.drill]);
      if (t.k === "life") assert.ok(E.LIFE_DRILLS[t.drill]);
      if (t.k === "deck") assert.ok(E.DECK_KINDS[t.kind] && t.min > 0);
      if (t.k === "text") assert.ok(!t.text || C.TEXTS.some((x) => x.id === t.text));
      if (t.k === "real") assert.ok(t.text && t.text.length > 10);
    });
  });
  const testsOn = (n) => CO.DAYS[n - 1].tasks.filter((t) => t.k === "test").map((t) => t.test).sort();
  assert.deepStrictEqual(testsOn(1), ["corsiB", "corsiF", "digitB", "digitF"]);
  assert.ok(CO.DAYS[0].tasks.some((t) => t.k === "words"));
  assert.ok(testsOn(21).length >= 2, "test a metà");
  assert.ok(CO.DAYS.slice(-2).some((d) => d.tasks.some((t) => t.k === "test")), "test alla fine");
  // ogni lezione citata ha fonti esistenti
  C.LESSONS.forEach((ls) => {
    assert.ok(ls.title && ls.lead && ls.body.length, ls.id);
    (ls.sources || []).forEach((k) => assert.ok(C.SOURCES[k] && /^https:\/\//.test(C.SOURCES[k][1]), `${ls.id}: fonte ${k}`));
  });
  assert.strictEqual(new Set(C.LESSONS.map((l) => l.id)).size, C.LESSONS.length);
  C.AREAS.forEach((a) => a.lessons.forEach((id) => assert.ok(E.lessonById(id), `${a.id}: ${id}`)));
});

test("Percorso: una giornata al giorno, compiti riconosciuti da soli, giorno dopo si apre il successivo", () => {
  const lab = E.ensure(null);
  assert.strictEqual(E.courseStatus(lab, T0).started, false);
  // fatto prima di iniziare: non conta
  E.recordTest(lab, "digitF", 6, {}, T0 - 3600000);
  E.courseStart(lab, T0);
  let cs = E.courseStatus(lab, T0 + 1000);
  assert.ok(cs.started && cs.active && cs.day === 1 && !cs.complete);
  assert.ok(cs.tasks.every((t) => !t.done));
  assert.strictEqual(cs.week.n, 1);
  ["digitF", "digitB", "corsiF", "corsiB"].forEach((k, i) => E.recordTest(lab, k, 6, {}, T0 + (i + 1) * 60000));
  E.logActivity(lab, "test:words-trials", T0 + 10 * 60000);
  cs = E.courseStatus(lab, T0 + 11 * 60000, true);
  assert.ok(cs.complete && cs.waiting && cs.day === 1 && cs.changed, "finita: aspetta domani");
  assert.ok(lab.course.finished[1]);
  assert.strictEqual(E.courseStatus(lab, T0 + 12 * 60000, true).day, 1, "stesso giorno: resta il giorno 1");
  // piano del giorno: giornata fatta
  assert.strictEqual(E.plan(lab, T0 + 13 * 60000)[0].id, "course-wait");
  // il giorno dopo si apre il giorno 2
  cs = E.courseStatus(lab, T0 + DAY, true);
  assert.strictEqual(cs.day, 2);
  assert.ok(!cs.waiting);
  assert.strictEqual(lab.course.opened[2], E.startOfDay(T0 + DAY));
  const steps = E.plan(lab, T0 + DAY + 1000);
  assert.ok(steps.length && steps.every((s) => s.go.tab === "course" || s.id === "review"));
  // un compito fuori dall'app: lo segni tu
  const real = CO.DAYS.flatMap((d) => d.tasks.map((t) => ({ d: d.d, t }))).find((x) => x.t.k === "real");
  assert.ok(real, "c'è almeno un compito fuori dall'app");
  lab.course.day = real.d;
  lab.course.opened[real.d] = T0 + DAY;
  E.courseManual(lab, real.t.id, true, T0 + DAY + 2000);
  assert.ok(E.courseStatus(lab, T0 + DAY + 3000, false).tasks.find((t) => t.id === real.t.id).done);
  E.courseManual(lab, real.t.id, false);
  assert.ok(!E.courseStatus(lab, T0 + DAY + 3000, false).tasks.find((t) => t.id === real.t.id).done);
  // giorni saltati: non si perde niente, si riprende da dove eri
  assert.strictEqual(E.courseStatus(lab, T0 + 10 * DAY, true).day, real.d);
  E.courseReset(lab);
  assert.strictEqual(E.courseStatus(lab, T0).started, false);
});

test("Percorso: ultimo giorno, controllo a quattro mesi e confronto con il primo giorno", () => {
  const lab = E.ensure(null);
  E.courseStart(lab, T0);
  E.recordTest(lab, "digitF", 6, {}, T0 + 1000);
  E.recordTest(lab, "digitF", 8, {}, T0 + 40 * DAY);
  const rows = E.courseReport(lab);
  assert.deepStrictEqual(rows.map((r) => [r.key, r.from, r.to]), [["digitF", 6, 8]]);
  lab.course.day = 42;
  lab.course.opened[42] = T0 + 41 * DAY;
  CO.DAYS[41].tasks.filter((t) => t.k === "real").forEach((t) => E.courseManual(lab, t.id, true, T0 + 41 * DAY));
  // segna fatti i compiti dell'ultimo giorno con i registri giusti
  const now = T0 + 41 * DAY + 3600000;
  CO.DAYS[41].tasks.forEach((t) => {
    if (t.k === "test") E.recordTest(lab, t.test, 7, {}, now);
    if (t.k === "words") E.logActivity(lab, "test:words-trials", now);
  });
  const cs = E.courseStatus(lab, now + 1000, true);
  assert.ok(cs.done && !cs.active, JSON.stringify(cs.tasks.filter((t) => !t.done && !t.opt).map((t) => t.k)));
  assert.strictEqual(cs.followUpAt, T0 + CO.FOLLOW_UP_DAYS * DAY);
  assert.ok(!cs.followUpDue);
  assert.ok(E.courseStatus(lab, T0 + 121 * DAY, false).followUpDue);
  assert.ok(E.plan(lab, T0 + 121 * DAY).some((s) => s.id === "followup"));
});

/* ------------------------------------------------------------ testi */
test("Testi a memoria: iniziali, parole nascoste che crescono, richiamo parola per parola", () => {
  assert.deepStrictEqual(["quest'ermo,", "Sempre", "caro"].map(E.initials), ["q'e,", "S", "c"]);
  const body = "Sempre caro mi fu quest'ermo colle,\ne questa siepe";
  assert.deepStrictEqual(E.textLines(body).map((l) => l.length), [6, 3]);
  const a = E.maskedSet(40, 0.25, 7);
  const b = E.maskedSet(40, 0.5, 7);
  assert.strictEqual(a.size, 10);
  assert.ok([...a].every((i) => b.has(i)), "la parte nascosta cresce, non cambia");
  assert.strictEqual(E.scoreText(body, "sempre caro mi fu questermo colle e questa siepe").pct, 100);
  assert.strictEqual(E.scoreText(body, "sempre caro mi fu colle e questa siepe").correct, 8);
  assert.strictEqual(E.scoreText(body, "Sempre caro mi fu quest'ermo colle e questa siepa").correct, 8, "parole corte: niente errori di battitura");
  const lab = E.ensure(null);
  const t = E.addSampleText(lab, "infinito", T0);
  assert.strictEqual(E.addSampleText(lab, "infinito", T0 + 1).id, t.id, "non lo aggiunge due volte");
  assert.strictEqual(E.addText(lab, { title: "Vuoto", body: "   " }), null);
  E.recordTextRun(lab, t.id, "mask50", 90, T0);
  assert.strictEqual(t.st, null, "solo il richiamo completo entra nel ripasso");
  const rec = E.recordTextRun(lab, t.id, "full", 95, T0 + 1000);
  assert.strictEqual(rec.grade, 3);
  assert.ok(t.st && t.st.due > T0);
  assert.strictEqual(E.textBest(t), 95);
  assert.strictEqual(E.reviewSummary(lab, t.st.due + 1).texts, 1);
  C.TEXTS.forEach((x) => assert.ok(E.textWordsFlat(x.body).length >= 30, x.id));
});

/* ------------------------------------------------------------ scacchi */
test("Scacchi: colori delle case, salti del cavallo, posizione lampo", () => {
  assert.deepStrictEqual(["a1", "h1", "e4", "d4", "a8"].map(E.isLight), [false, true, true, false, true]);
  assert.deepStrictEqual([["a1", "b3"], ["a1", "c2"], ["e4", "e5"], ["a1", "b2"], ["a1", "h8"]].map(([x, y]) => E.knightDistance(x, y)), [1, 1, 3, 4, 6]);
  const cr = E.colorsRound(1, 20);
  assert.strictEqual(cr.length, 20);
  cr.forEach((x) => assert.strictEqual(x.light, E.isLight(x.sq)));
  const kr = E.knightRound(2, 10);
  assert.strictEqual(kr.length, 10);
  kr.forEach((x) => assert.ok(x.d >= 1 && x.d <= 4 && E.knightDistance(x.a, x.b) === x.d));
  const fen = "r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4";
  const board = E.parseFen(fen);
  assert.strictEqual(Object.keys(board).length, 32);
  assert.strictEqual(board.e1, "K");
  assert.strictEqual(board.c4, "B");
  assert.deepStrictEqual(["K", "q", "R", "n"].map(E.pieceLabel), ["re bianco", "donna nera", "torre bianca", "cavallo nero"]);
  const qs = E.flashQuestions(fen, 5);
  assert.ok(qs.length >= 4);
  qs.forEach((q) => {
    if (q.kind === "what") { assert.ok(q.options.includes(q.answer) && q.options.length === 4); assert.strictEqual(q.answer, E.pieceLabel(board[q.sq])); }
    if (q.kind === "where") assert.strictEqual(board[q.answer], "k");
    if (q.kind === "count") assert.strictEqual(q.answer, "8");
  });
  const lab = E.ensure(null);
  E.recordChess(lab, "colors", 18, 20, 30000, T0);
  E.recordChess(lab, "colors", 20, 20, 40000, T0 + 1);
  E.recordChess(lab, "colors", 20, 20, 35000, T0 + 2);
  assert.deepStrictEqual([lab.chessDrills.colors.best.pct, lab.chessDrills.colors.best.ms], [1, 35000]);
  assert.ok(lab.log.some((e) => e.kind === "chess:colors"));
});

/* ------------------------------------------------------------ ritenzione e profilo */
test("Ritenzione vera, riepilogo dei ripassi, profilo con «Ritenzione» come nel quadro", () => {
  const lab = E.ensure(null);
  const d = E.addDeck(lab, { name: "Studio", kind: "qa", now: T0 });
  for (let i = 0; i < 10; i += 1) E.addCard(lab, d.id, { f: `D${i}`, b: `R${i}`, now: T0 + i });
  E.deckQueue(lab, T0).fresh.forEach((ref) => E.answerCard(lab, ref, 3, T0));
  assert.strictEqual(E.trueRetention(lab, T0).n, 0, "le schede nuove non contano");
  const due = E.deckQueue(lab, T0 + 4 * DAY).due;
  due.forEach((ref, i) => E.answerCard(lab, ref, i < 8 ? 3 : 1, T0 + 4 * DAY));
  const tr = E.trueRetention(lab, T0 + 4 * DAY);
  assert.strictEqual(tr.n, 10);
  assert.ok(near(tr.share, 0.8, 1e-9));
  assert.ok(tr.predicted > 0.8 && tr.predicted < 1);
  const sum = E.reviewSummary(lab, T0 + 4 * DAY + 20 * 60000);
  assert.strictEqual(sum.decksDue, 2, "le due sbagliate tornano dopo 10 minuti");
  assert.ok(E.plan(lab, T0 + 4 * DAY + 20 * 60000).some((s) => s.id === "review"));
  const p = E.profile(lab, T0 + 4 * DAY);
  assert.deepStrictEqual(p.map((k) => k.label), ["Memoria di lavoro", "Memoria visiva", "Richiamo verbale", "Tecnica", "Discipline", "Ritenzione"]);
  p.forEach((k) => assert.ok(k.value >= 0 && k.value <= 100, k.label));
  // le etichette devono essere le stesse dell'esagono nel quadro (app.js)
  const app = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
  const block = app.slice(app.indexOf("  memory: ["), app.indexOf("],", app.indexOf("  memory: [")));
  const labels = [...block.matchAll(/label: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepStrictEqual(labels, p.map((k) => k.label));
});

test("Stato rovinato delle parti nuove: sistemato senza errori", () => {
  const lab = E.ensure({
    version: 1,
    prefs: { retention: 2, newPerDay: 900 },
    course: { start: T0, day: 99, opened: { 1: T0, x: 3 }, finished: { 1: "no" }, manual: { 1: { t1: T0, zz: 1 } } },
    decks: [{ id: "d1", kind: "vocab", name: "", cards: [{ id: "c1", f: "a", b: "b", st: { a: { s: 3, d: 5, due: T0 }, b: "rotto" } }, { id: 5 }] }, { id: "d2", kind: "strano" }, null],
    texts: [{ id: "x1", body: "  " }, { id: "x2", title: "Ok", body: "uno due tre", runs: [{ t: 1, pct: 50, mode: "full" }, { t: "x" }] }],
    systems: { cards: { AS: { s: 2, d: 5, due: T0 }, ZZ: { s: 1, d: 1, due: 1 } }, pao: { "07": { p: "Zio", a: "salta" }, abc: { p: "x" } } },
    chessDrills: { colors: { runs: [{ t: 1, correct: 2, total: 3 }, {}], best: { pct: 0.5 } }, strano: {} },
    revlog: [{ t: T0, g: 3 }, { t: "x" }]
  });
  assert.deepStrictEqual([lab.prefs.retention, lab.prefs.newPerDay], [0.97, 100]);
  assert.strictEqual(lab.course.day, 42);
  assert.deepStrictEqual(Object.keys(lab.course.finished), []);
  assert.deepStrictEqual(Object.keys(lab.course.manual[1]), ["t1"]);
  assert.strictEqual(lab.decks.length, 1);
  assert.strictEqual(lab.decks[0].name, "Vocaboli");
  assert.strictEqual(lab.decks[0].cards.length, 1);
  assert.strictEqual(lab.decks[0].cards[0].st.b, null);
  assert.ok(lab.decks[0].cards[0].st.a);
  assert.deepStrictEqual(lab.texts.map((t) => [t.id, t.runs.length]), [["x2", 1]]);
  assert.deepStrictEqual(Object.keys(lab.systems.cards), ["AS"]);
  assert.deepStrictEqual(Object.keys(lab.systems.pao), ["07"]);
  assert.deepStrictEqual(Object.keys(lab.chessDrills), ["colors"]);
  assert.strictEqual(lab.chessDrills.colors.runs.length, 1);
  assert.strictEqual(lab.revlog.length, 1);
  // e tutto il resto funziona su questo stato
  assert.ok(Array.isArray(E.plan(lab, T0)) && E.profile(lab, T0).length === 6);
  assert.ok(E.reviewSummary(lab, T0 + DAY).total >= 1);
  assert.strictEqual(E.ensure({ version: 1, course: { day: 3 } }).course, null, "percorso senza inizio: non iniziato");
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exitCode = 1;
