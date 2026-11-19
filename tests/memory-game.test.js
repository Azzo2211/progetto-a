/*
 * Test del gioco della memoria (memory/game.js): punti solo ricordando, livelli, tre stelle per
 * piano, sfide e guardiani con i sigilli, missioni del giorno, serie con gli scudi, memoria
 * attuale, tempo di allenamento, allenamento extra, stato rovinato.
 *
 *   node tests/memory-game.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const E = require(path.join(__dirname, "..", "memory", "engine.js"));
const CO = require(path.join(__dirname, "..", "memory", "course.js"));
const G = require(path.join(__dirname, "..", "memory", "game.js"));

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
// un turno su misura giocato con le risposte date
function play(lab, key, n, mem, answers, now, challenge = null) {
  const r = E.makeRound(key, 0, 7, lab, { n, mem });
  if (challenge) r.challenge = challenge;
  const res = E.scoreRound(r, answers ? answers(r) : r.items.map((x) => (key === "faces" ? x.first : key === "dates" ? String(x.year) : String(x))));
  E.recordRound(lab, r, res, { now });
  return res;
}

test("Livelli: 100 punti per il livello 2, 300 per il 3, 600 per il 4", () => {
  assert.deepStrictEqual([0, 99, 100, 299, 300, 600, 5500].map((x) => G.levelOf(x).level), [1, 1, 2, 2, 3, 4, 11]);
  const l = G.levelOf(150);
  assert.deepStrictEqual([l.from, l.to, l.into, l.need], [100, 300, 50, 200]);
});

test("Punti solo ricordando: turno, perfezione, record, ripassi, sistema fonetico, niente doppioni", () => {
  const lab = E.ensure(null);
  assert.strictEqual(lab.game.xp, 0);
  play(lab, "numbers", 10, 60, (r) => r.items.map(() => ""), T0);
  assert.strictEqual(lab.game.xp, 0, "un turno vuoto non dà punti");
  play(lab, "numbers", 10, 60, null, T0 + 1000);
  assert.strictEqual(lab.game.xp, 15, "10 cifre giuste x 1,5 perché perfetto");
  // turno a livelli con record
  const r = E.makeRound("words", 1, 3, lab);
  E.recordRound(lab, r, E.scoreRound(r, r.items.slice(0, 4)), { now: T0 + 2000 });
  assert.strictEqual(lab.game.xp, 15 + 4 + 15, "4 parole giuste + 15 per il nuovo record");
  // ripassi: 2 punti, 3 se era un ripasso vero (giorni dopo); di nuovo = 0
  const d = E.addDeck(lab, { name: "Studio", kind: "qa", now: T0 });
  E.addCard(lab, d.id, { f: "a", b: "b", now: T0 });
  const ref = E.deckQueue(lab, T0).fresh[0];
  E.answerCard(lab, ref, 3, T0 + 3000);
  assert.strictEqual(lab.game.xp, 36);
  E.answerCard(lab, ref, 3, T0 + 5 * DAY);
  assert.strictEqual(lab.game.xp, 39);
  E.answerCard(lab, ref, 1, T0 + 20 * DAY);
  assert.strictEqual(lab.game.xp, 39);
  E.majorAnswer(lab, "00", true, T0);
  E.majorAnswer(lab, "01", false, T0);
  assert.strictEqual(lab.game.xp, 41);
  // vita quotidiana: il turno conta una volta sola
  const before = lab.game.xp;
  const lr = E.makeRound("numbers", 0, 5, lab, { n: 10, mem: 60, life: "phone" });
  E.recordRound(lab, lr, E.scoreRound(lr, lr.items.map(String)), { now: T0 + 4000 });
  assert.strictEqual(lab.game.xp - before, 15);
  assert.ok(lab.game.daily[E.dayKey(T0)] > 0);
});

test("Sfide: la versione più difficile dell'esercizio del giorno, per ogni piano", () => {
  for (let d = 1; d <= CO.LENGTH; d += 1) {
    const c = G.challengeFor(d);
    assert.ok(c && c.day === d && c.label && c.label.length > 10, `piano ${d}`);
    assert.ok(["palace", "dis", "chess", "text"].includes(c.kind), `piano ${d}: ${c.kind}`);
    assert.ok(num(c.target) && c.target > 0, `piano ${d}: obiettivo`);
    if (c.kind === "dis") assert.ok(E.DISCIPLINES[c.key] && c.n >= c.target && c.mem >= 30, `piano ${d}`);
    if (c.kind === "palace") assert.ok(c.n >= c.target && (c.per === 1 || c.per === 2));
    if (c.key === "images") assert.strictEqual(c.n % 5, 0, "immagini a righe da cinque");
    if (c.key === "cards") assert.ok(c.n <= 52);
  }
  assert.strictEqual(G.challengeFor(3).n, 15, "palazzo da 10: sfida a 15");
  assert.strictEqual(G.challengeFor(2).n, 13, "10 parole: sfida a 13");
  assert.strictEqual(G.challengeFor(13).life, "shop");
  assert.strictEqual(G.challengeFor(32).drill, "colors");
  assert.strictEqual(G.challengeFor(29).kind, "text");
  assert.deepStrictEqual(Object.keys(G.BOSSES).map(Number), [7, 14, 21, 28, 35, 42]);
  Object.keys(G.BOSSES).forEach((d) => assert.ok(G.challengeFor(Number(d)).boss));
  assert.strictEqual(G.challengeFor(43), null);
});
function num(v) { return typeof v === "number" && Number.isFinite(v); }

test("Stelle: completato, preciso (90% in ogni esercizio del giorno), sfida", () => {
  const lab = E.ensure(null);
  E.courseStart(lab, T0);
  lab.course.day = 2;
  lab.course.opened[2] = T0;
  // piano 2: sistema fonetico, 10 parole in 90 secondi, un compito fuori dall'app
  const q = E.majorQueue(lab, T0);
  q.fresh.forEach((c) => E.majorAnswer(lab, c, true, T0 + 1000));
  play(lab, "words", 10, 90, (r) => r.items.map((w, i) => (i < 8 ? w : "")), T0 + 2000);
  E.courseManual(lab, "t3", true, T0 + 3000);
  E.courseStatus(lab, T0 + 4000, true);
  let st = G.status(lab, T0 + 5000, true);
  assert.ok(G.floorOf(lab, 2).stars.c, "completato");
  assert.ok(!G.floorOf(lab, 2).stars.p, "80%: non ancora preciso");
  assert.strictEqual(G.floorOf(lab, 2).quality.min, 0.8);
  play(lab, "words", 10, 90, null, T0 + 6000);
  st = G.status(lab, T0 + 7000, true);
  assert.ok(G.floorOf(lab, 2).stars.p, "rifatto bene: preciso");
  // sfida: 13 parole, ne servono 12
  const ch = G.challengeFor(2);
  play(lab, "words", ch.n, ch.mem, (r) => r.items.map((w, i) => (i < 11 ? w : "")), T0 + 8000, { day: 2, target: ch.target });
  assert.ok(!G.floorOf(lab, 2).stars.s, "11 su 13: non basta");
  play(lab, "words", ch.n, ch.mem, null, T0 + 9000, { day: 2, target: ch.target });
  assert.ok(G.floorOf(lab, 2).stars.s, "sfida superata");
  assert.strictEqual(G.floorOf(lab, 2).count, 3);
  assert.strictEqual(G.status(lab, T0 + 10000, false).stars, 3);
  const types = lab.game.events.map((e) => e.type);
  assert.ok(types.filter((t) => t === "star").length >= 3);
  assert.strictEqual(G.popEvents(lab).length > 0, true);
  assert.strictEqual(lab.game.events.length, 0);
  assert.ok(st.xp > 150 && lab.game.xp > st.xp + 100, `${st.xp} -> ${lab.game.xp}`);
});

test("Guardiani: punteggio migliore, tentativi, sigillo, titolo e uno scudo", () => {
  const lab = E.ensure(null);
  E.courseStart(lab, T0);
  lab.course.day = 21;
  const b = G.challengeFor(21);
  assert.strictEqual(b.name, "Il Guardiano dei Numeri");
  assert.ok(G.challengeOpen(lab, 21) && G.challengeOpen(lab, 7) && !G.challengeOpen(lab, 22));
  // 3 righe perfette + una con un errore = 35 punti: non basta (servono 36)
  play(lab, "numbers", 40, 180, (r) => r.items.map((x, i) => (i === 35 ? String((x + 1) % 10) : String(x))), T0, { day: 21, target: b.target });
  assert.strictEqual(lab.game.bossBest[21], 35);
  assert.strictEqual(lab.game.bossTries[21], 1);
  assert.strictEqual(G.titleOf(lab), "Novizio");
  const shields = lab.game.shields;
  play(lab, "numbers", 40, 180, null, T0 + 1000, { day: 21, target: b.target });
  assert.ok(lab.game.seals[21]);
  assert.strictEqual(G.titleOf(lab), "Maestro dei numeri");
  assert.strictEqual(lab.game.shields, Math.min(G.MAX_SHIELDS, shields + 1));
  assert.ok(lab.game.events.some((e) => e.type === "boss"));
  // il palazzo del primo guardiano
  const p = E.savePalace(lab, { name: "Casa", loci: Array.from({ length: 20 }, (_, i) => `luogo ${i}`) });
  const pr = E.makePalaceRound(lab, p.id, 20, 3, 1);
  pr.challenge = { day: 7, target: 18 };
  E.recordPalace(lab, pr, E.scorePalace(pr, pr.items.map((w, i) => (i < 18 ? w : "no"))), T0 + 2000);
  assert.ok(lab.game.seals[7]);
  assert.strictEqual(G.titleOf(lab), "Maestro dei numeri", "conta il guardiano più alto");
  assert.strictEqual(G.status(lab, T0 + 3000, false).seals, 2);
});

test("Scacchi e testi come sfida: tempo massimo e percentuale", () => {
  const lab = E.ensure(null);
  E.courseStart(lab, T0);
  lab.course.day = 32;
  E.recordChess(lab, "colors", 20, 20, 41000, T0, { ch: 32, tg: 20, maxMs: 30000 });
  assert.ok(!(lab.game.stars[32] || {}).s, "troppo lento");
  E.recordChess(lab, "colors", 20, 20, 25000, T0 + 1000, { ch: 32, tg: 20, maxMs: 30000 });
  assert.ok(lab.game.stars[32].s);
  const t = E.addSampleText(lab, "costituzione", T0);
  E.recordTextRun(lab, t.id, "full", 93, T0 + 2000, { ch: 29, tg: 95 });
  assert.ok(!(lab.game.stars[29] || {}).s);
  E.recordTextRun(lab, t.id, "full", 97, T0 + 3000, { ch: 29, tg: 95 });
  assert.ok(lab.game.stars[29].s);
});

test("Missioni: tre al giorno, sempre il tuo tempo, il ripasso se c'è qualcosa in scadenza", () => {
  const lab = E.ensure(null);
  G.setMinutes(lab, 60);
  assert.strictEqual(lab.game.minutes, 60);
  G.setMinutes(lab, 37);
  assert.strictEqual(lab.game.minutes, 60, "solo i tempi previsti");
  let st = G.status(lab, T0, true);
  assert.strictEqual(st.missions.length, 3);
  assert.ok(st.missions.some((m) => m.id === "minutes" && /60 minuti/.test(m.label)));
  // il sistema fonetico ha 10 immagini nuove: c'e' qualcosa da fare ma niente in scadenza
  assert.ok(!st.missions.some((m) => m.id === "review"), "niente in scadenza: niente missione di ripasso");
  assert.deepStrictEqual(G.status(lab, T0 + 1000, true).missions.map((m) => m.id), st.missions.map((m) => m.id), "stesse missioni per tutto il giorno");
  // tempo: 60 minuti
  G.addActiveTime(lab, 59 * 60, T0);
  assert.strictEqual(G.minutesToday(lab, T0), 59);
  st = G.status(lab, T0 + 2000, true);
  assert.ok(!st.missions.find((m) => m.id === "minutes").done);
  G.addActiveTime(lab, 60, T0 + 3000);
  const xp0 = lab.game.xp;
  st = G.status(lab, T0 + 4000, true);
  assert.ok(st.missions.find((m) => m.id === "minutes").done);
  assert.strictEqual(lab.game.xp - xp0, 50);
  // il giorno dopo: altre tre missioni
  const d2 = G.status(lab, T0 + DAY, true);
  assert.strictEqual(d2.missions.length, 3);
  assert.ok(d2.missions.every((m) => !m.done));
  // con qualcosa in scadenza arriva la missione di ripasso
  const dk = E.addDeck(lab, { name: "S", kind: "qa", now: T0 });
  E.addCard(lab, dk.id, { f: "a", b: "b", now: T0 });
  E.answerCard(lab, E.deckQueue(lab, T0).fresh[0], 3, T0);
  const d5 = G.status(lab, T0 + 5 * DAY, true);
  assert.strictEqual(d5.missions[0].id, "review");
  E.answerCard(lab, E.deckQueue(lab, T0 + 5 * DAY + 1000).due[0], 3, T0 + 5 * DAY + 1000);
  assert.ok(G.status(lab, T0 + 5 * DAY + 2000, true).missions[0].done);
});

test("Tutte e tre le missioni: bonus e, dopo tre giorni, uno scudo in più", () => {
  const lab = E.ensure(null);
  lab.game.shields = 0;
  for (let d = 0; d < 3; d += 1) {
    const now = T0 + d * DAY;
    const k = E.dayKey(now);
    lab.game.missions[k] = { list: [{ id: "minutes", target: 30 }], done: {}, all: null };
    G.addActiveTime(lab, 31 * 60, now);
    E.logActivity(lab, "major", now, { ok: 1 });
    G.status(lab, now + 1000, true);
    assert.ok(lab.game.missions[k].all, `giorno ${d + 1}`);
  }
  assert.strictEqual(lab.game.shields, 1);
  assert.strictEqual(lab.game.shieldProgress, 0);
});

test("Serie: uno scudo salva un giorno saltato quando torni ad allenarti", () => {
  const lab = E.ensure(null);
  lab.game.shields = 1;
  E.logActivity(lab, "major", T0, { ok: 1 });
  E.logActivity(lab, "major", T0 + DAY, { ok: 1 });
  assert.strictEqual(E.streak(lab, T0 + DAY), 2);
  // salta il terzo giorno; il quarto la serie e' in pericolo
  const info = G.status(lab, T0 + 3 * DAY, true).streak;
  assert.ok(info.atRisk && info.shieldsNeeded === 1);
  assert.strictEqual(lab.game.shields, 1, "lo scudo si usa solo se ti alleni");
  E.logActivity(lab, "major", T0 + 3 * DAY, { ok: 1 });
  G.status(lab, T0 + 3 * DAY + 1000, true);
  assert.strictEqual(lab.game.shields, 0);
  assert.strictEqual(E.streak(lab, T0 + 3 * DAY), 4, "giorno saltato coperto");
  assert.ok(lab.game.events.some((e) => e.type === "shield"));
  // due giorni saltati senza scudi: la serie riparte
  E.logActivity(lab, "major", T0 + 6 * DAY, { ok: 1 });
  G.status(lab, T0 + 6 * DAY + 1000, true);
  assert.strictEqual(E.streak(lab, T0 + 6 * DAY), 1);
});

test("Memoria attuale: sale con i ripassi, scende se li lasci scadere", () => {
  const lab = E.ensure(null);
  assert.strictEqual(G.memoryNow(lab, T0).pct, null);
  const d = E.addDeck(lab, { name: "S", kind: "qa", now: T0 });
  for (let i = 0; i < 5; i += 1) E.addCard(lab, d.id, { f: `d${i}`, b: `r${i}`, now: T0 + i });
  E.deckQueue(lab, T0).fresh.forEach((ref) => E.answerCard(lab, ref, 3, T0));
  E.majorAnswer(lab, "34", true, T0);
  const now = G.memoryNow(lab, T0 + 1000);
  assert.strictEqual(now.n, 6);
  assert.ok(now.pct > 99);
  const later = G.memoryNow(lab, T0 + 30 * DAY);
  assert.ok(later.pct < 80 && later.low === 6, `${later.pct}`);
  G.status(lab, T0 + 2000, true);
  assert.ok(num(lab.game.memo[E.dayKey(T0)]));
});

test("Allenamento extra: ripassi, sfida o guardiano del giorno, punto debole, settimana, livelli", () => {
  const lab = E.ensure(null);
  let x = G.extraPlan(lab, T0);
  assert.ok(x.length >= 2 && x.some((i) => i.id === "arena"));
  E.courseStart(lab, T0);
  lab.course.day = 7;
  x = G.extraPlan(lab, T0 + 1000);
  const boss = x.find((i) => i.id === "ch7");
  assert.ok(boss && boss.boss && boss.go.game === "challenge" && boss.go.day === 7);
  assert.ok(x.some((i) => /^ch\d+$/.test(i.id) && i.id !== "ch7"), "una stella mancante di un piano passato");
  // punto debole: nomi e volti al 50%
  for (let i = 0; i < 3; i += 1) play(lab, "faces", 10, 90, (r) => r.items.map((p, k) => (k < 5 ? p.first : "")), T0 + 2000 + i);
  x = G.extraPlan(lab, T0 + 5000);
  const weak = x.find((i) => i.id === "weak");
  assert.ok(weak && weak.go.custom.key === "faces" && weak.go.custom.n === 10);
  assert.strictEqual(new Set(x.map((i) => i.id)).size, x.length, "niente doppioni");
  x.forEach((i) => assert.ok(i.title && i.minutes > 0 && i.go, i.id));
  // con il guardiano battuto la sfida di oggi sparisce
  lab.game.stars[7] = { s: T0 };
  assert.ok(!G.extraPlan(lab, T0 + 6000).some((i) => i.id === "ch7"));
});

test("Stato rovinato del gioco: sistemato senza errori", () => {
  const lab = E.ensure({
    version: 1,
    game: {
      xp: -5, minutes: 33, stars: { 1: { c: T0, z: 1 }, 99: { c: T0 }, x: {} }, seals: { 7: T0, 8: T0 }, bossBest: { 7: 12, 3: 4 },
      missions: { "2026-10-22": { list: [{ id: "minutes", target: 30 }, { id: "boh" }], done: { minutes: T0, boh: T0 } }, ieri: {} },
      daily: { "2026-10-22": 50, x: 3 }, time: { "2026-10-22": -1 }, shields: 9, shieldProgress: 7, covered: ["2026-10-21", 5], events: [{ text: "ok" }, { x: 1 }]
    }
  });
  const g = lab.game;
  assert.deepStrictEqual([g.xp, g.minutes, g.shields, g.shieldProgress], [0, 30, 3, 2]);
  assert.deepStrictEqual(Object.keys(g.stars), ["1"]);
  assert.deepStrictEqual(g.stars[1], { c: T0 });
  assert.deepStrictEqual(Object.keys(g.seals), ["7"]);
  assert.deepStrictEqual(Object.keys(g.bossBest), ["7"]);
  assert.deepStrictEqual(g.missions["2026-10-22"].list.map((m) => m.id), ["minutes"]);
  assert.deepStrictEqual(Object.keys(g.missions["2026-10-22"].done), ["minutes"]);
  assert.deepStrictEqual(Object.keys(g.daily), ["2026-10-22"]);
  assert.deepStrictEqual(Object.keys(g.time), []);
  assert.deepStrictEqual(g.covered, ["2026-10-21"]);
  assert.strictEqual(g.events.length, 1);
  const fresh = E.ensure(null).game;
  assert.deepStrictEqual([fresh.xp, fresh.minutes, fresh.shields], [0, 30, 1]);
  assert.ok(G.status(E.ensure(null), T0, true));
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exitCode = 1;
