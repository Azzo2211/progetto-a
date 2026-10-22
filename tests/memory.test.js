/*
 * Test della memoria: dati (parole, sistema fonetico controllato con la conversione fonetica,
 * nomi), test di span con le regole di interruzione, lista di parole con richiamo differito,
 * punteggio delle discipline come in gara, livelli, palazzo, ripasso del sistema fonetico,
 * programma del giorno, profilo, valori di riferimento e stato rovinato.
 *
 *   node tests/memory.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const D = require(path.join(__dirname, "..", "memory", "data.js"));
const E = require(path.join(__dirname, "..", "memory", "engine.js"));
const F = require(path.join(__dirname, "..", "memory", "faces.js"));

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
const DAY = 86400000;

test("Dati: parole uniche e concrete, nomi, 100 immagini del sistema fonetico", () => {
  assert.ok(D.words.length >= 350, `${D.words.length} parole`);
  assert.strictEqual(new Set(D.words.map(E.clean)).size, D.words.length, "parole doppie");
  D.words.forEach((w) => assert.ok(/^[a-zàèéìòù]{3,}$/.test(w), w));
  assert.ok(D.names.male.length >= 40 && D.names.female.length >= 40 && D.names.surnames.length >= 60);
  assert.strictEqual(D.major.length, 100);
  D.major.forEach(([code, word, hint], i) => {
    assert.strictEqual(code, String(i).padStart(2, "0"));
    assert.strictEqual(E.phonetic(word), code, `${code} ${word} -> ${E.phonetic(word)}`);
    assert.ok(hint && hint.length > 6, `${code}: immagine`);
  });
  assert.strictEqual(new Set(D.major.map((m) => m[1])).size, 100, "immagini doppie");
});

test("Conversione fonetica italiana: dolci, dure, doppie, gn, gl, sc", () => {
  assert.strictEqual(E.phonetic("mare"), "34");
  assert.strictEqual(E.phonetic("sasso"), "00");
  assert.strictEqual(E.phonetic("cielo"), "65");
  assert.strictEqual(E.phonetic("chiave"), "78");
  assert.strictEqual(E.phonetic("gnomo"), "23");
  assert.strictEqual(E.phonetic("famiglia"), "835");
  assert.strictEqual(E.phonetic("ghiro"), "74");
  assert.strictEqual(E.phonetic("Pizza"), "90");
  assert.strictEqual(E.phonetic("scia"), "0", "sc dolce: un suono solo");
  assert.strictEqual(E.phonetic("pesce"), "90");
  assert.strictEqual(E.phonetic("scatola"), "0715", "sc duro: due suoni");
  assert.deepStrictEqual(E.majorStory("3141592").map((x) => x.word), ["moto", "ruota", "lupo", null]);
});

test("Span: si sale finché si risponde, ci si ferma dopo due errori alla stessa lunghezza", () => {
  const t = E.makeSpanTest("digitF", 11);
  assert.strictEqual(t.len, E.SPAN_TESTS.digitF.startLen);
  let guard = 0;
  while (!t.done && guard < 100) {
    guard += 1;
    const seq = E.spanNext(t);
    assert.strictEqual(seq.length, t.len);
    for (let i = 1; i < seq.length; i += 1) assert.notStrictEqual(seq[i], seq[i - 1], "cifre uguali vicine");
    E.spanAnswer(t, t.len <= 7 ? seq.slice() : [9, 9]);
  }
  assert.strictEqual(t.span, 7);
  assert.ok(t.done);
  const last = t.history.slice(-2);
  assert.ok(last.every((h) => h.len === 8 && !h.ok));
});

test("Span: una prova giusta su due basta, all'indietro si risponde al contrario", () => {
  const t = E.makeSpanTest("digitB", 5);
  const s1 = E.spanNext(t);
  E.spanAnswer(t, s1.slice()); // nello stesso ordine: sbagliato
  assert.strictEqual(t.trial, 1);
  const s2 = E.spanNext(t);
  const r = E.spanAnswer(t, s2.slice().reverse());
  assert.ok(r.ok);
  assert.strictEqual(t.span, E.SPAN_TESTS.digitB.startLen);
  assert.strictEqual(t.len, E.SPAN_TESTS.digitB.startLen + 1);
  // nessuna giusta alla prima lunghezza: span 0, finito
  const z = E.makeSpanTest("corsiF", 3);
  E.spanNext(z); E.spanAnswer(z, []);
  E.spanNext(z); E.spanAnswer(z, []);
  assert.ok(z.done);
  assert.strictEqual(z.span, 0);
});

test("Corsi: 9 blocchi, sequenze senza ripetizioni", () => {
  assert.strictEqual(E.CORSI.length, 9);
  const t = E.makeSpanTest("corsiF", 99);
  for (let k = 0; k < 6; k += 1) {
    const seq = E.spanNext(t);
    assert.strictEqual(new Set(seq).size, seq.length);
    assert.ok(seq.every((i) => i >= 0 && i < 9));
    E.spanAnswer(t, seq.slice());
  }
});

test("Lista di parole: 5 prove, disturbo, prima lista, poi richiamo differito tra 20 e 45 minuti", () => {
  const lab = E.ensure(null);
  const t = E.makeWordTest(lab, 123);
  assert.strictEqual(t.listA.length, 15);
  assert.strictEqual(t.listB.length, 15);
  assert.strictEqual(t.listA.filter((w) => t.listB.includes(w)).length, 0, "liste separate");
  for (let i = 0; i < 5; i += 1) {
    const st = E.wordStage(t);
    assert.strictEqual(st.kind, "learn");
    E.wordAnswer(t, t.listA.slice(0, 6 + i * 2).join(" "));
  }
  assert.deepStrictEqual(t.trials, [6, 8, 10, 12, 14]);
  assert.strictEqual(E.wordStage(t).kind, "distractor");
  E.wordAnswer(t, `${t.listB.slice(0, 5).join(", ")}, ${t.listA[0]}`);
  assert.strictEqual(t.b, 5);
  const st = E.wordStage(t);
  assert.strictEqual(st.kind, "recallA");
  assert.strictEqual(st.show, false);
  E.wordAnswer(t, t.listA.slice(0, 11).join("\n"));
  assert.ok(t.done);
  E.startDelayed(lab, t, T0);
  assert.strictEqual(E.delayedStatus(lab, T0 + 10 * 60000).ready, false);
  const s = E.delayedStatus(lab, T0 + 25 * 60000);
  assert.ok(s.ready && !s.late);
  const res = E.finishDelayed(lab, t.listA.slice(0, 10).map((w) => w.toUpperCase()).join(" "), T0 + 25 * 60000);
  assert.strictEqual(res.correct, 10);
  assert.strictEqual(res.total, 50);
  assert.strictEqual(lab.pending.words, null);
  assert.strictEqual(E.lastTest(lab, "words").delayed, 10);
});

test("Risposte libere: accenti e maiuscole non contano, intrusioni e ripetizioni", () => {
  const r = E.scoreFree(["caffè", "albero", "farfalla"], "CAFFE albero albero gatto farfala");
  assert.strictEqual(r.correct, 3, "farfala: una lettera sbagliata ammessa dalle 6 lettere");
  assert.strictEqual(r.repeats, 1);
  assert.deepStrictEqual(r.intrusions, ["gatto"]);
  assert.ok(!E.sameWord("ape", "apa"), "parole corte: niente tolleranza");
});

test("Discipline: punteggio a righe come in gara (perfetta tutta, un errore metà, due zero)", () => {
  const round = E.makeRound("numbers", 4, 77); // 30 cifre
  assert.strictEqual(round.items.length, 30);
  const ans = round.items.map(String);
  ans[2] = ans[2] === "1" ? "2" : "1";                 // riga 1: un errore
  ans[11] = ans[11] === "1" ? "2" : "1"; ans[15] = ans[15] === "1" ? "2" : "1"; // riga 2: due errori
  const r = E.scoreRound(round, ans);
  assert.deepStrictEqual(r.rows.map((x) => x.pts), [5, 0, 10]);
  assert.strictEqual(r.score, 15);
  assert.strictEqual(r.correct, 27);
  // ultima riga parziale senza errori: valgono le cifre scritte
  const part = round.items.map(String);
  for (let i = 25; i < 30; i += 1) part[i] = "";
  const p = E.scoreRound(round, part);
  assert.deepStrictEqual(p.rows.map((x) => x.pts), [10, 10, 5]);
  // una cifra saltata in mezzo alla riga conta come errore
  const gap = round.items.map(String);
  gap[4] = "";
  assert.strictEqual(E.scoreRound(round, gap).rows[0].pts, 5);
  // riga in mezzo lasciata a metà ma righe dopo scritte: i buchi sono errori
  const mid = round.items.map(String);
  for (let i = 17; i < 20; i += 1) mid[i] = "";
  assert.deepStrictEqual(E.scoreRound(round, mid).rows.map((x) => x.pts), [10, 0, 10]);
  // ultima riga scritta a metà con un errore: metà delle cifre scritte, per eccesso
  const odd = round.items.map(String);
  for (let i = 27; i < 30; i += 1) odd[i] = "";
  odd[21] = odd[21] === "1" ? "2" : "1";
  assert.strictEqual(E.scoreRound(round, odd).rows[2].pts, 4);
  // tutto giusto: superato
  assert.ok(E.scoreRound(round, round.items.map(String)).pass);
});

test("Discipline: carte, parole e volti", () => {
  const c = E.makeRound("cards", 2, 5);
  assert.strictEqual(c.items.length, 10);
  assert.strictEqual(new Set(c.items).size, 10);
  assert.ok(c.items.every((x) => E.DECK.includes(x)));
  assert.strictEqual(E.cardInfo("QH").name, "donna di cuori");
  assert.strictEqual(E.scoreRound(c, c.items.slice()).score, 10);
  const cw = c.items.slice();
  cw[3] = cw[4];
  assert.strictEqual(E.scoreRound(c, cw).score, 9, "carte: un punto per carta giusta");
  const w = E.makeRound("words", 2, 8);
  const ans = w.items.slice();
  ans[9] = "";
  assert.strictEqual(E.scoreRound(w, ans).score, 9);
  const f = E.makeRound("faces", 3, 9);
  assert.strictEqual(f.items.length, 8);
  assert.ok(f.items.every((p) => p.first && p.last && Number.isInteger(p.seed)));
  const names = f.items.map((p) => p.first.toLowerCase());
  names[0] = "zzz";
  const fr = E.scoreRound(f, names);
  assert.strictEqual(fr.score, 7, "volti: un punto per nome");
  assert.ok(F.svg(f.items[0].seed, { female: f.items[0].female }).startsWith("<svg"));
  assert.strictEqual(F.svg(42, {}), F.svg(42, {}), "stesso volto per lo stesso numero");
});

test("Livelli: si sblocca con il 90%, si sale solo quando si vuole", () => {
  const lab = E.ensure(null);
  const round = E.makeRound("numbers", 1, 3);
  const res = E.scoreRound(round, round.items.map(String));
  const rec = E.recordRound(lab, round, res, { memUsed: 41, now: T0 });
  assert.ok(rec.unlocked);
  assert.strictEqual(rec.nextLevel, 2);
  assert.strictEqual(lab.disciplines.numbers.level, 1, "il livello non cambia da solo");
  assert.strictEqual(lab.disciplines.numbers.unlocked, 2);
  E.setLevel(lab, "numbers", 5);
  assert.strictEqual(lab.disciplines.numbers.level, 2, "non oltre lo sbloccato");
  assert.strictEqual(lab.disciplines.numbers.best["1"], 10);
  assert.strictEqual(lab.disciplines.numbers.history[0].mem, 41);
  const bad = E.scoreRound(round, round.items.map(() => "0"));
  assert.ok(!E.recordRound(lab, round, bad, { now: T0 + 1000 }).unlocked);
});

test("Palazzo della memoria: luoghi in ordine, una parola per luogo", () => {
  const lab = E.ensure(null);
  const p = E.savePalace(lab, { name: "Casa", loci: "porta\n attaccapanni \n\nspecchio\ndivano\ntelevisore", now: T0 });
  assert.deepStrictEqual(p.loci, ["porta", "attaccapanni", "specchio", "divano", "televisore"]);
  const round = E.makePalaceRound(lab, p.id, 5, 4);
  assert.strictEqual(round.items.length, 5);
  assert.deepStrictEqual(round.loci, p.loci);
  const ans = round.items.slice();
  ans[1] = "niente";
  const res = E.scorePalace(round, ans);
  assert.strictEqual(res.correct, 4);
  E.recordPalace(lab, round, res, T0);
  assert.strictEqual(lab.palaces[0].uses, 1);
  assert.strictEqual(lab.palaces[0].best, 4);
  E.savePalace(lab, { id: p.id, name: "Casa mia", loci: ["porta", "specchio"] });
  assert.strictEqual(lab.palaces[0].name, "Casa mia");
  assert.strictEqual(lab.palaces.length, 1);
  E.removePalace(lab, p.id);
  assert.strictEqual(lab.palaces.length, 0);
});

test("Sistema fonetico: 10 immagini nuove al giorno, ripasso distanziato, sbagliate tornano subito", () => {
  const lab = E.ensure(null);
  let q = E.majorQueue(lab, T0);
  assert.strictEqual(q.fresh.length, 10);
  assert.strictEqual(q.due.length, 0);
  q.fresh.forEach((code) => E.majorAnswer(lab, code, true, T0));
  q = E.majorQueue(lab, T0 + 60000);
  assert.strictEqual(q.fresh.length, 0, "niente altre nuove oggi");
  assert.strictEqual(E.majorQueue(lab, T0 + DAY).due.length, 10);
  assert.strictEqual(E.majorQueue(lab, T0 + DAY).fresh.length, 10, "domani altre 10");
  E.majorAnswer(lab, "00", false, T0 + DAY);
  assert.strictEqual(E.majorState(lab, "00").box, 1);
  assert.ok(E.majorState(lab, "00").due <= T0 + DAY + 11 * 60000);
  const qq = E.majorQuestion("34", 1);
  assert.ok(qq.kind === "pick" ? qq.options.includes("mare") && qq.options.length === 4 : qq.answer === "34");
  // imparata dopo 3 risposte giuste di fila a giorni diversi
  ["01", "01", "01"].forEach((c, i) => E.majorAnswer(lab, c, true, T0 + i * 3 * DAY));
  assert.ok(E.majorLearned(lab) >= 1);
});

test("Programma del giorno: misura iniziale, poi immagini, disciplina, palazzo; nuova misura dopo un mese", () => {
  const lab = E.ensure(null);
  let steps = E.plan(lab, T0);
  assert.strictEqual(steps[0].id, "baseline");
  ["digitF", "digitB", "corsiF", "corsiB"].forEach((k) => E.recordTest(lab, k, 6, {}, T0));
  steps = E.plan(lab, T0);
  assert.deepStrictEqual(steps.map((s) => s.id), ["major", "discipline", "palace"]);
  assert.ok(steps.find((s) => s.id === "discipline").title.includes(E.DISCIPLINES[E.ROTATION[new Date(T0).getDay()]].label.toLowerCase()));
  assert.ok(E.plan(lab, T0 + 30 * DAY).some((s) => s.id === "retest"));
  assert.ok(E.streak(lab, T0) >= 1);
});

test("Valori di riferimento: percentile e giudizio coerenti", () => {
  ["digitF", "digitB", "corsiF", "corsiB", "wordsTotal", "wordsDelayed"].forEach((k) => {
    const n = E.NORMS[k];
    assert.ok(n && n.mean > 0 && n.sd > 0 && n.source && /^https:\/\//.test(n.url), `${k}: valori di riferimento con fonte`);
    const c = E.compare(k, n.mean, {});
    assert.strictEqual(c.pct, 50);
    assert.strictEqual(c.label, "nella media");
    assert.ok(E.compare(k, n.mean + 2.5 * n.sd, {}).pct >= 98);
  });
  assert.strictEqual(E.compare("nessuno", 5), null);
  // fascia d'età: un anziano si confronta con gli anziani
  assert.strictEqual(E.compare("corsiF", 5, { age: 70 }).mean, 4.76);
  assert.strictEqual(E.compare("corsiF", 5, { age: 25 }).mean, 6.11);
  assert.strictEqual(E.compare("wordsTotal", 50, { age: 40 }).mean, 51.7);
});

test("Profilo per il quadro: 6 categorie da 0 a 100", () => {
  const lab = E.ensure(null);
  const p = E.profile(lab, T0);
  assert.strictEqual(p.length, 6);
  p.forEach((k) => assert.ok(k.value >= 0 && k.value <= 100, k.label));
  E.recordTest(lab, "digitF", E.NORMS.digitF.mean, {}, T0);
  assert.strictEqual(E.profile(lab, T0)[0].value, 50, "conta solo il test fatto");
  assert.ok(typeof E.trend(lab, T0) === "string");
});

test("Stato rovinato o vecchio: sistemato senza errori", () => {
  const lab = E.ensure({ version: 1, profile: { age: 300 }, tests: { digitF: [{ t: T0, value: 7 }, { value: "x" }], strano: [1] }, palaces: [{ name: "A", loci: ["x", 5, " y "] }, "no"], major: { items: { "07": { box: 9, due: T0 }, abc: { box: 1, due: 1 } } }, days: ["2026-10-01", "ieri"], log: [{ t: T0, kind: "x" }, null], disciplines: { numbers: { level: 99, unlocked: 3, history: [{ t: 1 }] } } });
  assert.strictEqual(lab.profile.age, 99);
  assert.strictEqual(lab.tests.digitF.length, 1);
  assert.strictEqual(lab.palaces.length, 1);
  assert.deepStrictEqual(lab.palaces[0].loci, ["x", "y"]);
  assert.deepStrictEqual(Object.keys(lab.major.items), ["07"]);
  assert.strictEqual(lab.major.items["07"].box, E.MAJOR_INTERVALS.length - 1);
  assert.deepStrictEqual(lab.days, ["2026-10-01"]);
  assert.strictEqual(lab.log.length, 1);
  assert.strictEqual(lab.disciplines.numbers.level, 3, "mai oltre il livello sbloccato");
  assert.strictEqual(lab.disciplines.numbers.history.length, 0);
  assert.strictEqual(E.ensure("rotto").version, 1);
  assert.strictEqual(E.ensure({ version: 0, tests: { digitF: [{ t: 1, value: 5 }] } }).tests.digitF.length, 0, "versione diversa: si riparte");
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exitCode = 1;
