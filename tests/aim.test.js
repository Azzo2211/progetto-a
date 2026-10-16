/*
 * Test della mira: calcoli della sensibilita' come in Valorant, proiezione 3D, colpi,
 * scenari giocati da un "giocatore perfetto", ricerca della sens e stato.
 *
 *   node tests/aim.test.js
 */
const assert = require("assert");
const path = require("path");

const A = require(path.join(__dirname, "..", "aim", "engine.js"));

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
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg || ""} ${a} invece di ${b}`);

test("Sensibilità: eDPI, cm/360 e conversione inversa come in Valorant", () => {
  assert.strictEqual(A.YAW, 0.07);
  assert.strictEqual(A.FOV_H, 103);
  assert.strictEqual(A.edpi(800, 0.35), 280);
  near(A.cm360(800, 0.35), 46.65, 0.01, "cm/360");
  near(A.cm360(1600, 0.2), 40.82, 0.01, "cm/360");
  near(A.sensForCm(800, A.cm360(800, 0.427)), 0.427, 1e-9, "inversa");
  assert.strictEqual(A.roundSens(0.43219), 0.432);
  // 360 gradi con 0,35 di sens: 360 / (0,35 x 0,07) unita'
  near(360 / A.degPerUnit(0.35), 14693.9, 0.1, "unita' per 360");
});

test("Calibrazione: corregge un browser che non legge il mouse 1:1", () => {
  const exact = A.calibrate(0.4, 360 / (0.4 * 0.07));
  near(exact.factor, 1, 1e-9);
  assert.ok(exact.ok);
  // input grezzo e scarto piccolo: si tiene 1:1 (errore di misura a mano)
  const small = A.calibrate(0.4, (360 / (0.4 * 0.07)) * 1.02, true);
  assert.strictEqual(small.factor, 1);
  near(small.measuredFactor, 1 / 1.02, 1e-9);
  const noRaw = A.calibrate(0.4, (360 / (0.4 * 0.07)) * 1.02, false);
  near(noRaw.factor, 1 / 1.02, 1e-9, "senza input grezzo si corregge");
  assert.ok(!A.calibrate(0.4, 10).valid, "misura assurda");
  const half = A.calibrate(0.4, 360 / (0.4 * 0.07) / 2); // il browser riporta meta' delle unita'
  near(half.factor, 2, 1e-9);
  assert.ok(!half.ok);
  // con la calibrazione, le unita' misurate fanno davvero 360 gradi
  near(A.degPerUnit(0.4, half) * half.measured, 360, 0.1);
  assert.strictEqual(A.calibrate(0.4, 0), null);
});

test("Proiezione: davanti al centro, bordo del campo visivo al bordo dello schermo", () => {
  const b = A.basis(0, 0);
  const c = A.project([0, 0, 10], b, 1600, 900);
  near(c.x, 800, 1e-6);
  near(c.y, 450, 1e-6);
  const edge = A.dir(103 / 2, 0);
  const e = A.project([edge[0] * 10, 0, edge[2] * 10], b, 1600, 900);
  near(e.x, 1600, 1e-6, "bordo destro");
  assert.strictEqual(A.project([0, 0, -5], b, 1600, 900), null, "dietro la camera");
  // girandosi di 90 gradi a destra, un punto a destra torna al centro
  const r = A.project([10, 0, 0], A.basis(90, 0), 1600, 900);
  near(r.x, 800, 1e-6);
  // guardando in alto, un punto sopra torna al centro
  const up = A.dir(0, 30);
  const u = A.project([up[0] * 5, up[1] * 5, up[2] * 5], A.basis(0, 30), 1600, 900);
  near(u.y, 450, 1e-6);
});

test("Colpi: sfere, box e angoli", () => {
  const f = A.dir(0, 0);
  assert.ok(A.raySphere(f, [0, 0, 10], 0.2) > 0);
  assert.strictEqual(A.raySphere(f, [0.5, 0, 10], 0.2), -1);
  assert.strictEqual(A.raySphere(f, [0, 0, -10], 0.2), -1, "dietro");
  near(A.rayBox(f, { min: [-1, -1, 5], max: [1, 1, 6] }), 5, 1e-9);
  assert.strictEqual(A.rayBox(f, { min: [2, -1, 5], max: [3, 1, 6] }), -1);
  const ang = A.anglesTo([10, 0, 10]);
  near(ang.yaw, 45, 1e-9);
  near(A.angleTo(A.dir(45, 0), [10, 0, 10]), 0, 1e-6);
});

// Giocatore perfetto: punta il bersaglio piu' vicino (o la testa della sagoma) e spara.
function play(id, { seed = 3, fps = 120, delay = 0.15, aimSpeed = Infinity, holdAll = false } = {}) {
  const sc = A.createScenario(id, { seed });
  const aim = { yaw: 0, pitch: 0, holding: holdAll };
  let cooldown = delay;
  for (let i = 0; i < fps * 200 && !sc.done; i += 1) {
    const dt = 1 / fps;
    let goal = null;
    if (sc.bots.length) {
      const b = sc.bots[0];
      if (id === "tracking" || b.visible) goal = A.botParts(b.x, b.z).head.c;
    } else if (sc.targets.length) {
      goal = sc.targets.slice().sort((p, q) => A.angleTo(A.dir(aim.yaw, aim.pitch), p.c) - A.angleTo(A.dir(aim.yaw, aim.pitch), q.c))[0].c;
    }
    if (goal) {
      const g = A.anglesTo(goal);
      if (aimSpeed === Infinity) { aim.yaw = g.yaw; aim.pitch = g.pitch; } else {
        aim.yaw += Math.max(-aimSpeed * dt, Math.min(aimSpeed * dt, g.yaw - aim.yaw));
        aim.pitch += Math.max(-aimSpeed * dt, Math.min(aimSpeed * dt, g.pitch - aim.pitch));
      }
    }
    sc.update(dt, aim);
    cooldown -= dt;
    if (goal && cooldown <= 0 && id !== "tracking") { sc.shoot(aim); cooldown = delay; }
  }
  return { sc, st: sc.stats() };
}

test("Scenari a tempo: un giocatore perfetto colpisce tutto, finiscono a tempo", () => {
  ["gridshot", "microshot", "headline", "senstest"].forEach((id) => {
    const { sc, st } = play(id);
    assert.ok(sc.done, `${id}: finito`);
    near(sc.time, A.scenario(id).duration, 1e-6, `${id}: durata`);
    assert.strictEqual(st.acc, 100, `${id}: precisione`);
    assert.ok(st.kills > 100, `${id}: ${st.kills} bersagli`);
    assert.ok(st.score > 0, `${id}: punteggio`);
  });
  const g = play("gridshot").st;
  assert.ok(g.ttk > 0 && g.ttk < 200, `ttk ${g.ttk}`);
  const h = play("headline").st;
  assert.ok(h.vert < 0.5, `altezza media del mirino ${h.vert}`);
  // la testa da colpire coincide con la testa disegnata delle sagome
  near(A.HEAD_Y, A.botParts(0, 0).head.c[1], 1e-9, "altezza della testa");
  // sparare a vuoto toglie punti e precisione
  const sc = A.createScenario("gridshot", { seed: 1 });
  sc.update(0.1, { yaw: 180, pitch: 0 });
  const r = sc.shoot({ yaw: 180, pitch: 0 });
  assert.strictEqual(r.hit, false);
  assert.strictEqual(sc.stats().acc, 0);
});

test("Gridshot: sempre 3 bersagli, mai due nello stesso punto", () => {
  const sc = A.createScenario("gridshot", { seed: 9 });
  for (let i = 0; i < 200; i += 1) {
    assert.strictEqual(sc.targets.length, 3);
    assert.strictEqual(new Set(sc.targets.map((t) => t.c.join(","))).size, 3);
    const t = sc.targets[0];
    const g = A.anglesTo(t.c);
    sc.update(0.05, g);
    sc.shoot(g);
  }
});

test("Riflessi e peek: ripetizioni, tempi di reazione, sagome dietro i muri", () => {
  const rf = play("reflex", { delay: 0.02 });
  assert.ok(rf.sc.done);
  assert.strictEqual(rf.sc.rep, 20);
  assert.ok(rf.st.rt > 0 && rf.st.rt < 200, `reazione ${rf.st.rt}`);
  const pk = play("peek", { delay: 0.02 });
  assert.ok(pk.sc.done);
  assert.strictEqual(pk.st.heads, 20, `teste ${pk.st.heads}`);
  assert.strictEqual(pk.st.escaped, 0);
  // senza sparare: tutte le sagome scappano
  const lazy = A.createScenario("peek", { seed: 4 });
  for (let i = 0; i < 120 * 120 && !lazy.done; i += 1) lazy.update(1 / 120, { yaw: 0, pitch: 0 });
  assert.ok(lazy.done);
  assert.strictEqual(lazy.stats().escaped, 20);
  // un colpo verso una sagoma nascosta lo ferma il muro
  const sc = A.createScenario("peek", { seed: 5 });
  for (let i = 0; i < 1000 && !sc.bots.length; i += 1) sc.update(1 / 120, { yaw: 0, pitch: 0 });
  const b = sc.bots[0];
  assert.ok(b && !b.visible, "nasce nascosta");
  const g = A.anglesTo(A.botParts(b.x, b.z).head.c);
  const shot = sc.shoot(g);
  assert.strictEqual(shot.hit, false);
  assert.ok(shot.blocked, "colpo bloccato dal muro");
});

test("Tracking: restare addosso alla sagoma conta, mirare altrove no", () => {
  const good = play("tracking", { holdAll: true }).st;
  assert.ok(good.track > 95, `tracking ${good.track}`);
  const slow = play("tracking", { holdAll: true, aimSpeed: 25 }).st;
  assert.ok(slow.track < good.track, "chi insegue piano resta meno addosso");
  const sc = A.createScenario("tracking", { seed: 2 });
  for (let i = 0; i < 46 * 60 && !sc.done; i += 1) sc.update(1 / 60, { yaw: 90, pitch: 0, holding: true });
  assert.strictEqual(sc.stats().track, 0);
  assert.ok(sc.done);
});

test("Ricerca della sens: trova il punto migliore in pochi turni", () => {
  // preferenza simulata: il punteggio migliore e' a 0,42
  const best = 0.42;
  const scoreAt = (s) => 1000 - 2000 * Math.abs(Math.log(s / best));
  let f = A.finderStart(0.35);
  assert.ok(f.a < 0.35 && f.b > 0.35, "una piu' bassa e una piu' alta");
  near(Math.sqrt(f.lo * f.hi), 0.35, 1e-9, "centrata sulla sens attuale");
  while (!f.done) {
    A.finderScore(f, "a", scoreAt(f.a));
    A.finderScore(f, "b", scoreAt(f.b));
    const s = A.finderSuggest(f);
    f = A.finderChoose(f, s === "tie" ? "tie" : s);
  }
  assert.strictEqual(f.history.length, A.FINDER_ROUNDS);
  assert.ok(Math.abs(f.result - best) / best < 0.08, `risultato ${f.result}`);
  assert.strictEqual(f.edge, null);
  // stessi bersagli per A e B nello stesso turno
  const s1 = A.finderStart(0.4, { now: 12345 });
  assert.ok(Number.isInteger(s1.seed));
  const seed1 = s1.seed;
  A.finderChoose(s1, "b");
  assert.notStrictEqual(s1.seed, seed1, "turno nuovo, bersagli nuovi");
  // sempre la piu' alta: risultato al bordo
  let e = A.finderStart(0.3);
  while (!e.done) e = A.finderChoose(e, "b");
  assert.strictEqual(e.edge, "high");
  assert.ok(e.result > 0.3 && e.result <= 0.3 * A.FINDER_SPAN);
  // ordine alternato tra i turni
  const g = A.finderStart(0.5);
  assert.deepStrictEqual(g.order, ["a", "b"]);
  A.finderChoose(g, "a");
  assert.deepStrictEqual(g.order, ["b", "a"]);
  // punteggi quasi uguali: decide la sensazione
  const h = A.finderStart(0.5);
  A.finderScore(h, "a", 1000);
  A.finderScore(h, "b", 1030);
  assert.strictEqual(A.finderSuggest(h), "tie");
  const span = h.hi / h.lo;
  A.finderChoose(h, "tie");
  near(h.hi / h.lo, Math.sqrt(span), 1e-9, "pari: si tiene la meta' centrale");
});

test("Stato: dati rovinati sistemati, partite, sens e statistiche", () => {
  const lab = A.ensure({ settings: { dpi: "x", sens: 99, crosshair: { color: "red", len: 99 } }, runs: [null, { t: 1, sc: "boh", score: 3 }], finder: { lo: 2, hi: 1 } });
  assert.strictEqual(lab.settings.dpi, 800);
  assert.strictEqual(lab.settings.sens, 0.35);
  assert.strictEqual(lab.settings.crosshair.color, "#2ef27a");
  assert.strictEqual(lab.settings.crosshair.len, 20);
  assert.strictEqual(lab.runs.length, 0);
  assert.strictEqual(lab.finder, null);
  const day = 24 * 3600 * 1000;
  const t0 = new Date(2026, 9, 16, 12).getTime();
  const r1 = A.recordRun(lab, { sc: "gridshot", score: 5000, shots: 60, hits: 55, acc: 91.7, ttk: 520, kps: 0.9, dur: 60 }, { now: t0 - day });
  assert.ok(A.isBest(lab, r1));
  const r2 = A.recordRun(lab, { sc: "gridshot", score: 4000, shots: 60, hits: 50, acc: 83, ttk: 600, kps: 0.8, dur: 60 }, { now: t0 });
  assert.ok(!A.isBest(lab, r2));
  lab.runs.push({ t: t0, sc: "senstest", score: 999, dur: 30 });
  const st = A.stats(lab, t0);
  assert.strictEqual(st.runs, 2, "le prove della ricerca non contano nei totali");
  assert.strictEqual(st.per.gridshot.best, 5000);
  assert.strictEqual(st.per.gridshot.count, 2);
  assert.strictEqual(st.streak, 2);
  assert.strictEqual(st.minutes, 2);
  assert.ok(!("senstest" in st.per), "la prova sens non compare nei progressi");
  assert.ok(A.setSens(lab, 0.4123, { now: t0, method: "ricerca" }));
  assert.strictEqual(lab.settings.sens, 0.412);
  assert.strictEqual(lab.sensHistory[0].from, 0.35);
  assert.ok(!A.setSens(lab, 0.412), "stessa sens: nessun cambio");
  assert.ok(!A.setSens(lab, -1));
  // ricerca interrotta: dopo una ricarica si riprende dallo stesso turno
  lab.finder = A.finderStart(0.4);
  A.finderScore(lab.finder, "a", 900);
  const saved = JSON.parse(JSON.stringify(lab));
  const again = A.ensure(saved);
  assert.strictEqual(again.finder.scores.a, 900);
  assert.strictEqual(again.finder.round, 0);
});

console.log(`${passed} test superati${failed.length ? `, ${failed.length} falliti` : ""}`);
process.exit(failed.length ? 1 : 0);
