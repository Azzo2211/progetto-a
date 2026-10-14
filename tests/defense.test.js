/*
 * Test della Difesa: dati (tecniche, sessioni, situazioni, pose), prove di
 * riflessi, programma, situazioni a ripasso e profilo calcolato dai dati.
 *
 *   node tests/defense.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const root = path.join(__dirname, "..");
const E = require(path.join(root, "defense", "engine.js"));
require(path.join(root, "defense", "program.js"));
require(path.join(root, "defense", "situations.js"));
require(path.join(root, "defense", "scenes.js"));
const P = globalThis.DefenseProgram;
const SITS = globalThis.DefenseSituations;
const SCENES = globalThis.DefenseScenes;
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

const T0 = new Date(2026, 9, 14, 18, 30).getTime(); // 14 ottobre 2026, 18:30 ora locale

test("Programma: tecniche, riscaldamento e sessioni coerenti con le pose", () => {
  const ids = new Set(P.techniques.map((t) => t.id));
  assert.strictEqual(ids.size, P.techniques.length, "id tecniche duplicati");
  P.techniques.forEach((t) => {
    assert.ok([1, 2, 3, 4].includes(t.phase), `${t.id}: fase`);
    assert.ok(t.name && t.purpose && t.when && t.dose && t.solo, `${t.id}: testi`);
    assert.ok(t.steps.length >= 3 && t.keys.length >= 2 && t.errors.length >= 2, `${t.id}: passi/punti/errori`);
    assert.ok(t.calls.length >= 1, `${t.id}: comandi`);
    const scene = SCENES[t.id];
    assert.ok(scene, `${t.id}: manca la scena animata`);
    assert.strictEqual(scene.frames.length, t.frames.length, `${t.id}: fotogrammi ${scene.frames.length} vs didascalie ${t.frames.length}`);
    scene.frames.forEach((f, i) => {
      ["pelvis", "chest", "head"].forEach((k) => assert.ok(Array.isArray(f.you[k]), `${t.id} #${i}: ${k}`));
      ["l", "r"].forEach((s) => assert.ok(f.you.hand[s] && f.you.foot[s], `${t.id} #${i}: mani/piedi`));
    });
  });
  const warm = new Set(P.warmup.map((w) => w.id));
  assert.strictEqual(P.sessions.length, 12);
  P.sessions.forEach((s, i) => {
    assert.strictEqual(s.phase, Math.floor(i / 3) + 1, `${s.id}: fase`);
    s.techniques.forEach((t) => assert.ok(ids.has(t), `${s.id}: tecnica ${t}`));
    s.warmup.forEach((w) => assert.ok(warm.has(w), `${s.id}: riscaldamento ${w}`));
    assert.ok(s.check.length >= 3, `${s.id}: autovalutazione`);
    assert.ok(s.rounds.count >= 2 && s.rounds.work >= 45, `${s.id}: round`);
  });
});

test("Situazioni: 4 opzioni, una sola migliore, categorie note, fonti per la legge", () => {
  assert.ok(SITS.length >= 18, `poche situazioni: ${SITS.length}`);
  const ids = new Set(SITS.map((s) => s.id));
  assert.strictEqual(ids.size, SITS.length, "id duplicati");
  SITS.forEach((s) => {
    assert.ok(E.CATEGORIES[s.category], `${s.id}: categoria ${s.category}`);
    assert.ok([1, 2, 3].includes(s.level), `${s.id}: livello`);
    assert.strictEqual(s.options.length, 4, `${s.id}: opzioni`);
    assert.strictEqual(s.options.filter((o) => o.score === 2).length, 1, `${s.id}: migliore`);
    assert.ok(s.options.filter((o) => o.score === 1).length <= 1, `${s.id}: accettabili`);
    assert.ok(s.seconds >= 10 && s.seconds <= 25, `${s.id}: secondi`);
    if (s.category === "legge") assert.ok(s.sources && s.sources.length, `${s.id}: fonti`);
  });
});

test("Semaforo: piano bilanciato, anticipi e risposte al rosso penalizzate", () => {
  const plan = E.planSemaforo(E.rng(7));
  assert.strictEqual(plan.length, 24);
  assert.strictEqual(plan.filter((p) => p.kind === "stop").length, 6);
  assert.notStrictEqual(plan[0].kind, "stop");
  assert.ok(!plan.map((p) => p.kind).join(",").includes("stop,stop,stop"));
  assert.ok(plan.every((p) => p.wait >= 900 && p.wait <= 2300));
  const clean = plan.map((p) => ({ kind: p.kind, rt: p.kind === "go" ? 300 : null, early: false }));
  const a = E.scoreSemaforo(clean);
  assert.strictEqual(a.median, 300);
  assert.strictEqual(a.control, 100);
  assert.strictEqual(a.commissions, 0);
  // stesso tempo ma due risposte al rosso e due anticipi
  let stops = 0;
  let gos = 0;
  const messy = plan.map((p) => {
    if (p.kind === "stop" && stops < 2) { stops += 1; return { kind: "stop", rt: 280, early: false }; }
    if (p.kind === "go" && gos < 2) { gos += 1; return { kind: "go", rt: 60, early: true }; }
    return { kind: p.kind, rt: p.kind === "go" ? 300 : null, early: false };
  });
  const b = E.scoreSemaforo(messy);
  assert.strictEqual(b.commissions, 2);
  assert.strictEqual(b.early, 2);
  assert.ok(b.control < a.control - 30, `controllo ${b.control} vs ${a.control}`);
  // le risposte sotto i 120 ms non entrano nella mediana
  assert.strictEqual(b.median, 300);
  // piu' lento = punteggio di velocita' piu' basso
  const slow = E.scoreSemaforo(plan.map((p) => ({ kind: p.kind, rt: p.kind === "go" ? 520 : null, early: false })));
  assert.ok(slow.speed < a.speed, "velocita'");
});

test("Direzione e Periferica: precisione, mediana sulle risposte giuste, soglia", () => {
  const plan = E.planDirezione(E.rng(3));
  assert.strictEqual(plan.length, 20);
  E.DIRECTIONS.forEach((d) => assert.strictEqual(plan.filter((p) => p.dir === d).length, 5));
  const trials = plan.map((p, i) => ({ dir: p.dir, answer: i < 4 ? "left" === p.dir ? "right" : "left" : p.dir, rt: i < 4 ? 200 : 500, early: false }));
  const r = E.scoreDirezione(trials);
  assert.strictEqual(r.wrong, 4);
  assert.strictEqual(r.accuracy, 80);
  assert.strictEqual(r.median, 500, "la mediana usa solo le risposte giuste");
  // periferica: la durata scende con risposte giuste e sale con errori, entro 50-400
  assert.strictEqual(E.nextFlash(200, true), 170);
  assert.strictEqual(E.nextFlash(200, false), 240);
  assert.strictEqual(E.nextFlash(60, true), 50);
  assert.strictEqual(E.nextFlash(390, false), 400);
  const good = E.scorePeriferica(Array.from({ length: 14 }, (_, i) => ({ flash: 250 - i * 12, shapeOk: true, posOk: true })));
  const bad = E.scorePeriferica(Array.from({ length: 14 }, () => ({ flash: 300, shapeOk: true, posOk: false })));
  assert.ok(good.score > bad.score + 30, `${good.score} vs ${bad.score}`);
  assert.strictEqual(bad.accuracy, 0);
});

test("Programma: sblocco in ordine, media delle ultime ripetizioni", () => {
  const lab = E.ensureLab(null);
  const S = P.sessions;
  assert.ok(E.isUnlocked(lab, S, 0));
  assert.ok(!E.isUnlocked(lab, S, 1));
  const r1 = E.recordSession(lab, S[0], [2, 2, 1, 0], T0);
  assert.ok(r1.first);
  assert.strictEqual(r1.quality, 5 / 8);
  assert.ok(E.isUnlocked(lab, S, 1));
  assert.strictEqual(E.nextSessionIndex(lab, S), 1);
  // ripetere con tutti Si' non cancella la prima volta: media, non massimo
  E.recordSession(lab, S[0], [2, 2, 2, 2], T0 + DAY);
  const st = E.sessionState(lab, S[0].id);
  assert.strictEqual(st.done, 2);
  assert.ok(Math.abs(st.quality - (0.63 + 1) / 2) < 0.01, `qualita' ${st.quality}`);
  assert.strictEqual(E.phaseProgress(lab, S, 1).done, 1);
  assert.strictEqual(E.currentPhase(lab, S), 1);
});

test("Situazioni: errori tornano domani, risposte giuste si allontanano", () => {
  const lab = E.ensureLab(null);
  const s = SITS[0];
  E.recordSituation(lab, s, 0, { now: T0, timedOut: true });
  let st = E.situState(lab, s.id);
  assert.strictEqual(st.box, 1);
  assert.strictEqual(st.due, E.addDays(T0, 1));
  assert.strictEqual(st.timeouts, 1);
  assert.strictEqual(E.dueSituations(lab, SITS, T0).length, 0, "non oggi");
  assert.strictEqual(E.dueSituations(lab, SITS, T0 + DAY).length, 1, "domani");
  E.recordSituation(lab, s, 2, { now: T0 + DAY });
  st = E.situState(lab, s.id);
  assert.strictEqual(st.box, 2);
  assert.strictEqual(st.due, E.addDays(T0 + DAY, E.SITU_INTERVALS[2]));
  E.recordSituation(lab, s, 1, { now: T0 + 5 * DAY });
  st = E.situState(lab, s.id);
  assert.strictEqual(st.box, 2);
  assert.strictEqual(st.due, E.addDays(T0 + 5 * DAY, 2));
});

test("Turno: niente doppioni, prima le sbagliate, poi nuove di categorie diverse", () => {
  const lab = E.ensureLab(null);
  const turn = E.pickTurn(lab, SITS, 6, T0, E.rng(11));
  assert.strictEqual(turn.length, 6);
  assert.strictEqual(new Set(turn).size, 6);
  const cats = new Set(turn.map((id) => SITS.find((s) => s.id === id).category));
  assert.ok(cats.size >= Math.min(3, new Set(SITS.map((s) => s.category)).size), "categorie varie");
  const wrong = SITS[SITS.length - 1];
  E.recordSituation(lab, wrong, 0, { now: T0 });
  const next = E.pickTurn(lab, SITS, 6, T0 + DAY, E.rng(5));
  assert.ok(next.includes(wrong.id), "la sbagliata torna nel turno del giorno dopo");
});

test("Profilo: parte basso, sale coi dati veri, i clic non lo gonfiano", () => {
  const empty = E.profile(E.ensureLab(null), P.sessions, T0);
  assert.ok(E.totalScore(empty) < 30, `profilo iniziale ${E.totalScore(empty)}`);
  assert.strictEqual(empty.costanza, 0);
  const lab = E.ensureLab(null);
  // aprire sessioni senza completarle non conta: solo recordSession
  const good = E.scoreSemaforo(E.planSemaforo(E.rng(2)).map((p) => ({ kind: p.kind, rt: p.kind === "go" ? 280 : null, early: false })));
  for (let d = 0; d < 6; d += 1) {
    E.recordReflex(lab, "semaforo", good, T0 - d * DAY);
    E.recordSession(lab, P.sessions[d], [2, 2, 2], T0 - d * DAY);
  }
  SITS.slice(0, 8).forEach((s) => E.recordSituation(lab, s, 2, { now: T0 }));
  const p = E.profile(lab, P.sessions, T0);
  assert.ok(p.riflessi > 60, `riflessi ${p.riflessi}`);
  assert.ok(p.controllo > 70, `controllo ${p.controllo}`);
  assert.ok(p.tecnica > 50, `tecnica ${p.tecnica}`);
  assert.ok(p.costanza >= 50, `costanza ${p.costanza}`);
  assert.ok(E.totalScore(p) > E.totalScore(empty) + 25);
  // un mese di stop: tecnica e costanza calano
  const later = E.profile(lab, P.sessions, T0 + 40 * DAY);
  assert.ok(later.tecnica < p.tecnica - 15, `tecnica ${later.tecnica} vs ${p.tecnica}`);
  assert.strictEqual(later.costanza, 0);
  // risposte a caso alle situazioni: la decisione resta bassa
  const lab2 = E.ensureLab(null);
  SITS.forEach((s, i) => E.recordSituation(lab2, s, i % 4 === 0 ? 2 : 0, { now: T0 }));
  const p2 = E.profile(lab2, P.sessions, T0);
  assert.ok(p2.decisione < 45 && p2.prevenzione < 45, `a caso: ${p2.decisione}/${p2.prevenzione}`);
});

test("Prossimo passo: sessione, poi situazioni da rivedere, poi riflessi", () => {
  const data = { sessions: P.sessions, situations: SITS };
  const lab = E.ensureLab(null);
  assert.deepStrictEqual(E.nextAction(lab, data, T0), { kind: "session", index: 0, id: "s01" });
  E.recordSession(lab, P.sessions[0], [2, 2, 2], T0);
  SITS.slice(0, 3).forEach((s) => E.recordSituation(lab, s, 0, { now: T0 - DAY }));
  assert.strictEqual(E.nextAction(lab, data, T0).kind, "situations");
  SITS.slice(0, 3).forEach((s) => E.recordSituation(lab, s, 2, { now: T0 }));
  assert.strictEqual(E.nextAction(lab, data, T0).kind, "reflex");
});

test("Stato vecchio o rovinato: si ricostruisce senza errori", () => {
  const lab = E.ensureLab({ version: 1, sessions: null, reflex: { semaforo: "x" }, days: 3 });
  assert.ok(Array.isArray(lab.reflex.semaforo) && Array.isArray(lab.days));
  const fresh = E.ensureLab({ version: 0, foo: 1 });
  assert.strictEqual(fresh.version, E.VERSION);
  assert.ok(E.profile(fresh, P.sessions, T0));
});

console.log(`${passed} test superati${failed.length ? `, ${failed.length} falliti` : ""}`);
process.exit(failed.length ? 1 : 0);
