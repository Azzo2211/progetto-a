/*
 * Test della mira: calcoli della sensibilita' come in Valorant, proiezione 3D, colpi,
 * analisi dei flick, scenari giocati da un "giocatore perfetto" (tutti i livelli),
 * dati salvati, consigli, riepiloghi dei progressi, ricerca della sens e stato.
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
    console.error(`FALLITO: ${name}\n  ${error.stack || error.message}`);
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
  near(360 / A.degPerUnit(0.35), 14693.9, 0.1, "unita' per 360");
});

test("Calibrazione: corregge un browser che non legge il mouse 1:1", () => {
  const exact = A.calibrate(0.4, 360 / (0.4 * 0.07));
  near(exact.factor, 1, 1e-9);
  assert.ok(exact.ok);
  const small = A.calibrate(0.4, (360 / (0.4 * 0.07)) * 1.02, true);
  assert.strictEqual(small.factor, 1);
  near(small.measuredFactor, 1 / 1.02, 1e-9);
  const noRaw = A.calibrate(0.4, (360 / (0.4 * 0.07)) * 1.02, false);
  near(noRaw.factor, 1 / 1.02, 1e-9, "senza input grezzo si corregge");
  assert.ok(!A.calibrate(0.4, 10).valid, "misura assurda");
  const half = A.calibrate(0.4, 360 / (0.4 * 0.07) / 2);
  near(half.factor, 2, 1e-9);
  assert.ok(!half.ok);
  near(A.degPerUnit(0.4, half) * half.measured, 360, 0.1);
  assert.strictEqual(A.calibrate(0.4, 0), null);
});

test("Proiezione: centro, bordo del campo visivo, camera spostata", () => {
  const b = A.basis(0, 0);
  const c = A.project([0, 0, 10], b, 1600, 900);
  near(c.x, 800, 1e-6);
  near(c.y, 450, 1e-6);
  const edge = A.dir(103 / 2, 0);
  const e = A.project([edge[0] * 10, 0, edge[2] * 10], b, 1600, 900);
  near(e.x, 1600, 1e-6, "bordo destro");
  assert.strictEqual(A.project([0, 0, -5], b, 1600, 900), null, "dietro la camera");
  near(A.project([10, 0, 0], A.basis(90, 0), 1600, 900).x, 800, 1e-6);
  const up = A.dir(0, 30);
  near(A.project([up[0] * 5, up[1] * 5, up[2] * 5], A.basis(0, 30), 1600, 900).y, 450, 1e-6);
  // occhi spostati di 2 m a destra: un punto davanti a loro torna al centro
  near(A.project([2, 0, 10], A.basis(0, 0, [2, 0, 0]), 1600, 900).x, 800, 1e-6);
  assert.strictEqual(A.wrap(190), -170);
  assert.strictEqual(A.wrap(-190), 170);
});

test("Colpi: sfere, box e angoli", () => {
  const f = A.dir(0, 0);
  assert.ok(A.raySphere(f, [0, 0, 10], 0.2) > 0);
  assert.strictEqual(A.raySphere(f, [0.5, 0, 10], 0.2), -1);
  assert.strictEqual(A.raySphere(f, [0, 0, -10], 0.2), -1, "dietro");
  near(A.rayBox(f, { min: [-1, -1, 5], max: [1, 1, 6] }), 5, 1e-9);
  assert.strictEqual(A.rayBox(f, { min: [2, -1, 5], max: [3, 1, 6] }), -1);
  near(A.anglesTo([10, 0, 10]).yaw, 45, 1e-9);
  near(A.angleTo(A.dir(45, 0), [10, 0, 10]), 0, 1e-6);
});

// percorso del mirino: da (0,0) verso yaw 20, con una forma data, a 120 campioni al secondo
function flickPath(shape) {
  const out = [];
  const n = shape.length;
  shape.forEach((yaw, i) => out.push([i / 120, yaw, 0]));
  return n ? out : out;
}
const ease = (from, to, steps) => Array.from({ length: steps }, (_, i) => from + (to - from) * Math.sin(((i + 1) / steps) * Math.PI / 2));

test("Analisi dei flick: puliti, oltre e corretti, corti e corretti", () => {
  const tgt = { yaw: 20, pitch: 0 };
  const r = 0.6;
  const clean = flickPath([0, ...ease(0, 20, 18), 20, 20, 20, 20, 20]);
  assert.strictEqual(A.flickKind(clean, tgt, r), "clean");
  const over = flickPath([0, ...ease(0, 24, 18), ...ease(24, 20, 10), 20, 20]);
  assert.strictEqual(A.flickKind(over, tgt, r), "over");
  // si ferma a 14 gradi, aspetta, poi aggiusta
  const under = flickPath([0, ...ease(0, 14, 16), 14, 14, 14, 14, 14, 14, 14, 14, ...ease(14, 20, 12), 20]);
  assert.strictEqual(A.flickKind(under, tgt, r), "under");
  // il mouse che manda movimento solo ogni due fotogrammi non conta come fermata
  const steppy = [0];
  ease(0, 20, 18).forEach((v, i) => { steppy.push(i % 2 ? v : steppy[steppy.length - 1]); });
  steppy.push(20, 20, 20, 20);
  assert.strictEqual(A.flickKind(flickPath(steppy), tgt, r), "clean");
  // bersaglio troppo vicino: niente flick
  assert.strictEqual(A.flickKind(flickPath([0, 0.5, 1, 1]), { yaw: 1, pitch: 0 }, r), null);
  // colpi mancati: oltre, corto, di lato
  assert.strictEqual(A.missKind([0, 0, 0], { yaw: 22, pitch: 0 }, tgt, r), "over");
  assert.strictEqual(A.missKind([0, 0, 0], { yaw: 17, pitch: 0.5 }, tgt, r), "under");
  assert.strictEqual(A.missKind([0, 0, 0], { yaw: 20.2, pitch: 1.5 }, tgt, r), "side");
});

// Giocatore perfetto: punta il bersaglio piu' vicino (o la testa della sagoma), si ferma nel
// counter-strafe e spara. stopFirst=false: spara anche in corsa.
function play(id, { seed = 3, fps = 120, delay = 0.15, aimSpeed = Infinity, holdAll = false, lv = 1, stopFirst = true, shoot = true } = {}) {
  const sc = A.createScenario(id, { seed, lv });
  const aim = { yaw: 0, pitch: 0, holding: holdAll, move: 0 };
  let cooldown = delay;
  let dirMove = 1;
  for (let i = 0; i < fps * 300 && !sc.done; i += 1) {
    const dt = 1 / fps;
    let goal = null;
    if (sc.bots.length) {
      const b = sc.bots[0];
      if (sc.holdMode || b.visible) goal = A.botParts(b.x, b.z).head.c;
    } else if (sc.targets.length) {
      const f = A.dir(aim.yaw, aim.pitch);
      goal = sc.targets.slice().sort((p, q) => A.angleTo(f, p.c) - A.angleTo(f, q.c))[0].c;
    }
    if (id === "strafe") {
      if (!sc.bots.length) {
        if (sc.eye[0] > 2.5) dirMove = -1;
        if (sc.eye[0] < -2.5) dirMove = 1;
        aim.move = dirMove;
      } else if (stopFirst) {
        aim.move = Math.abs(sc.vx) > 0.4 ? -Math.sign(sc.vx) : 0;
      }
    }
    if (goal) {
      const g = A.anglesTo([goal[0] - sc.eye[0], goal[1] - sc.eye[1], goal[2] - sc.eye[2]]);
      if (aimSpeed === Infinity) { aim.yaw = g.yaw; aim.pitch = g.pitch; } else {
        aim.yaw += Math.max(-aimSpeed * dt, Math.min(aimSpeed * dt, g.yaw - aim.yaw));
        aim.pitch += Math.max(-aimSpeed * dt, Math.min(aimSpeed * dt, g.pitch - aim.pitch));
      }
    }
    sc.update(dt, aim);
    cooldown -= dt;
    const ready = id !== "strafe" || !stopFirst || sc.speed() <= A.STRAFE.still;
    if (shoot && goal && cooldown <= 0 && !sc.holdMode && ready && !sc.done) { sc.shoot(aim); cooldown = delay; }
  }
  return { sc, st: sc.stats() };
}

test("Scenari a tempo: tutti i livelli, giocatore perfetto, finiscono a tempo", () => {
  ["gridshot", "microshot", "headline"].forEach((id) => {
    [1, 2, 3].forEach((lv) => {
      const { sc, st } = play(id, { lv });
      assert.ok(sc.done, `${id} ${lv}: finito`);
      near(sc.time, A.scenario(id).duration, 1e-6, `${id}: durata`);
      assert.strictEqual(st.acc, 100, `${id} ${lv}: precisione`);
      assert.ok(st.kills > 100, `${id} ${lv}: ${st.kills} bersagli`);
      assert.strictEqual(st.lv, lv);
      assert.ok(Array.isArray(st.seg) && st.seg.length === 6, "andamento in 6 parti");
      assert.strictEqual(st.seg.reduce((x, y) => x + y, 0), st.kills, "le parti sommano i bersagli");
      assert.ok(st.ttkMed > 0 && st.ttkBest > 0 && st.ttkBest <= st.ttk + 1);
    });
  });
  // i livelli cambiano davvero la difficolta'
  assert.strictEqual(A.createScenario("gridshot", { lv: 3 }).targets[0].r, 0.24);
  assert.strictEqual(A.createScenario("gridshot", { lv: 9 }).lv, 1, "livello sconosciuto: Base");
  const h = play("headline").st;
  assert.ok(h.vert < 0.5, `altezza media del mirino ${h.vert}`);
  near(A.HEAD_Y, A.botParts(0, 0).head.c[1], 1e-9, "altezza della testa");
  // sparare a vuoto toglie punti e precisione, e il colpo si analizza
  const sc = A.createScenario("gridshot", { seed: 1 });
  sc.update(0.1, { yaw: 180, pitch: 0 });
  assert.strictEqual(sc.shoot({ yaw: 180, pitch: 0 }).hit, false);
  assert.strictEqual(sc.stats().acc, 0);
});

test("Dati della partita: flick, distanze, direzione dei colpi", () => {
  // giocatore che si muove a velocita' limitata: flick veri, con tempi
  const { st } = play("microshot", { aimSpeed: 300, delay: 0.05 });
  assert.ok(st.flick && st.flick.c + st.flick.o + st.flick.u > 20, "flick analizzati");
  assert.ok(st.bins && st.bins.s, "flick per distanza");
  assert.ok(st.bias && st.bias.n > 20, "direzione dei colpi");
  near(st.bias.x, 0, 0.05, "colpi al centro");
  // colpi sempre un po' a destra: si vede nella direzione media
  const sc = A.createScenario("microshot", { seed: 7 });
  for (let i = 0; i < 40; i += 1) {
    const t = sc.targets[0];
    const g = A.anglesTo(t.c);
    sc.update(0.2, g);
    const off = { yaw: g.yaw + 0.25, pitch: g.pitch };
    sc.shoot(off);
    if (sc.targets[0] === t) sc.shoot(g);
  }
  assert.ok(sc.stats().bias.x > 0.1, "a destra");
});

test("Gridshot: sempre 3 bersagli, mai due nello stesso punto", () => {
  const sc = A.createScenario("gridshot", { seed: 9 });
  for (let i = 0; i < 200; i += 1) {
    assert.strictEqual(sc.targets.length, 3);
    assert.strictEqual(new Set(sc.targets.map((t) => t.c.join(","))).size, 3);
    const g = A.anglesTo(sc.targets[0].c);
    sc.update(0.05, g);
    sc.shoot(g);
  }
});

test("Riflessi e peek: ripetizioni, reazione, muri, partenze anticipate", () => {
  [1, 2, 3].forEach((lv) => {
    const rf = play("reflex", { delay: 0.02, lv });
    assert.ok(rf.sc.done);
    assert.strictEqual(rf.sc.rep, 20);
    assert.strictEqual(rf.st.win, 100);
    assert.strictEqual(rf.st.rts.length, 20);
    assert.ok(rf.st.rt > 0 && rf.st.rt < 200, `reazione ${rf.st.rt}`);
    const pk = play("peek", { delay: 0.02, lv });
    assert.ok(pk.sc.done);
    assert.strictEqual(pk.st.heads, 20, `peek ${lv}: teste ${pk.st.heads}`);
    assert.strictEqual(pk.st.escaped || 0, 0);
    assert.deepStrictEqual(pk.st.seg, [5, 5, 5, 5], "riusciti per blocchi di 5");
  });
  // partenza anticipata
  const r = A.createScenario("reflex", { seed: 2 });
  r.update(0.1, { yaw: 0, pitch: 0 });
  assert.ok(r.shoot({ yaw: 0, pitch: 0 }).early);
  assert.strictEqual(r.stats().early, 1);
  assert.strictEqual(r.stats().shots, 0, "non conta come colpo");
  // senza sparare: tutte le sagome scappano
  const lazy = A.createScenario("peek", { seed: 4 });
  for (let i = 0; i < 120 * 120 && !lazy.done; i += 1) lazy.update(1 / 120, { yaw: 0, pitch: 0 });
  assert.ok(lazy.done);
  assert.strictEqual(lazy.stats().escaped, 20);
  assert.strictEqual(lazy.stats().win, 0);
  // un colpo verso una sagoma nascosta lo ferma il muro
  const sc = A.createScenario("peek", { seed: 5 });
  for (let i = 0; i < 1000 && !sc.bots.length; i += 1) sc.update(1 / 120, { yaw: 0, pitch: 0 });
  const b = sc.bots[0];
  assert.ok(b && !b.visible, "nasce nascosta");
  const shot = sc.shoot(A.anglesTo(A.botParts(b.x, b.z).head.c));
  assert.strictEqual(shot.hit, false);
  assert.ok(shot.blocked, "colpo bloccato dal muro");
  assert.strictEqual(sc.stats().wall, 1);
});

test("Duelli ADAD: si vincono alla testa, si perdono se aspetti", () => {
  [1, 2, 3].forEach((lv) => {
    const d = play("duel", { delay: 0.02, lv });
    assert.ok(d.sc.done);
    assert.strictEqual(d.st.win, 100, `duelli ${lv}`);
    assert.strictEqual(d.st.lost, 0);
  });
  const lazy = play("duel", { shoot: false });
  assert.strictEqual(lazy.st.lost, 20);
  assert.strictEqual(lazy.st.win, 0);
  // colpo dietro alla testa (rispetto a dove va): contato come "dietro"
  const sc = A.createScenario("duel", { seed: 3 });
  for (let i = 0; i < 1000 && !sc.bots.length; i += 1) sc.update(1 / 120, { yaw: 0, pitch: 0 });
  const b = sc.bots[0];
  const g = A.anglesTo(A.botParts(b.x, b.z).head.c);
  const behind = { yaw: g.yaw - Math.sign(b.v) * 1.5, pitch: g.pitch };
  sc.shoot(behind);
  assert.strictEqual(sc.stats().behind, 1);
});

test("Counter-strafe: fermarsi prima di sparare paga, sparare in corsa no", () => {
  let good1 = null;
  [1, 2, 3].forEach((lv) => {
    const good = play("strafe", { delay: 0.03, lv });
    if (lv === 1) good1 = good.st;
    assert.ok(good.sc.done, `strafe ${lv}: finito`);
    assert.strictEqual(good.st.win, 100, `strafe ${lv}: riusciti ${good.st.win}`);
    assert.strictEqual(good.st.moving, 0, "nessun colpo in movimento");
    assert.ok(good.st.stop >= 0, "tempo da fermo allo sparo");
  });
  const bad = play("strafe", { delay: 0.03, stopFirst: false });
  assert.ok(bad.st.moving > 10, `colpi in corsa ${bad.st.moving}`);
  assert.ok(bad.st.acc < good1.acc / 2, `in corsa si sbaglia: ${bad.st.acc}% contro ${good1.acc}%`);
  assert.ok(bad.st.score < good1.score, "e si fanno meno punti");
  // fisica: si accelera fino alla velocita' di corsa, il tasto opposto ferma prima del rilascio
  const run30 = () => { const x = A.createScenario("strafe", { seed: 1 }); for (let i = 0; i < 30; i += 1) x.update(1 / 120, { move: 1 }); return x; };
  const s1 = run30();
  near(s1.speed(), A.STRAFE.max, 1e-9, "velocita' massima");
  const s2 = run30();
  const s3 = run30();
  let tRelease = 0;
  while (s3.speed() > A.STRAFE.still) { s3.update(1 / 120, { move: 0 }); tRelease += 1; }
  let tCounter = 0;
  while (s2.speed() > A.STRAFE.still) { s2.update(1 / 120, { move: -1 }); tCounter += 1; }
  assert.ok(tCounter < tRelease, `counter-strafe ${tCounter} contro rilascio ${tRelease}`);
  for (let i = 0; i < 400; i += 1) s1.update(1 / 120, { move: 1 });
  assert.ok(Math.abs(s1.eye[0]) <= A.STRAFE.lane + 1e-9, "resta nella corsia");
});

test("Tracking: tempo addosso, dietro o davanti, riaggancio", () => {
  [1, 2, 3].forEach((lv) => {
    const good = play("tracking", { holdAll: true, lv }).st;
    assert.ok(good.track > 95, `tracking ${lv}: ${good.track}`);
    assert.strictEqual(good.hold, 100);
    assert.ok(good.seg.length === 6);
  });
  const slow = play("tracking", { holdAll: true, aimSpeed: 25 }).st;
  assert.ok(slow.track < 90, "chi insegue piano resta meno addosso");
  assert.ok(slow.lag > slow.lead, `dietro ${slow.lag} davanti ${slow.lead}`);
  assert.ok(slow.reacq > 0, "riaggancio misurato");
  const sc = A.createScenario("tracking", { seed: 2 });
  for (let i = 0; i < 46 * 60 && !sc.done; i += 1) sc.update(1 / 60, { yaw: 90, pitch: 0, holding: true });
  assert.strictEqual(sc.stats().track, 0);
  // senza tenere premuto non conta
  const idle = play("tracking", { holdAll: false }).st;
  assert.strictEqual(idle.track, 0);
  assert.strictEqual(idle.hold, 0);
});

test("Prova sensibilità: tre fasi, tracking alla fine, stessi bersagli con lo stesso seme", () => {
  const { sc, st } = play("senstest", { holdAll: true, delay: 0.1 });
  assert.ok(sc.done);
  assert.strictEqual(sc.holdMode, true, "finisce in tracking");
  assert.strictEqual(sc.phase, 2);
  assert.ok(st.sub.flick > 0 && st.sub.prec > 0 && st.sub.track > 0, JSON.stringify(st.sub));
  assert.ok(st.sub.fAcc === 100 && st.sub.pAcc === 100);
  near(st.score, Math.round(0.4 * st.sub.flick + 0.3 * st.sub.prec + 0.3 * st.sub.track), 1);
  // stesso seme, giocatore diverso: il tracking ha la stessa sagoma
  const a = A.createScenario("senstest", { seed: 77 });
  const b = A.createScenario("senstest", { seed: 77 });
  const xs = [];
  for (let i = 0; i < 40 * 60; i += 1) {
    a.update(1 / 60, { yaw: 0, pitch: 0 });
    if (i % 30 === 0 && a.targets[0]) a.shoot(A.anglesTo(a.targets[0].c));
    if (a.bots[0]) xs.push(a.bots[0].x);
  }
  const ys = [];
  for (let i = 0; i < 40 * 60; i += 1) {
    b.update(1 / 60, { yaw: 10, pitch: 0 });
    if (b.bots[0]) ys.push(b.bots[0].x);
  }
  assert.ok(xs.length > 100);
  assert.deepStrictEqual(xs, ys, "stessa sagoma nel tracking");
});

test("Consigli dalla partita", () => {
  const strafe = play("strafe", { delay: 0.03, stopFirst: false }).st;
  const tips = A.insights({ ...strafe, t: 1 });
  assert.ok(tips.some((x) => x.tone === "warn" && /movimento/.test(x.text)), JSON.stringify(tips));
  const over = A.insights({ sc: "gridshot", score: 1, shots: 40, acc: 95, flick: { c: 4, o: 10, u: 2 } });
  assert.ok(over.some((x) => /oltre il bersaglio/.test(x.text)));
  const under = A.insights({ sc: "gridshot", score: 1, shots: 40, acc: 95, flick: { c: 4, o: 1, u: 10 } });
  assert.ok(under.some((x) => /prima del bersaglio/.test(x.text)));
  const head = A.insights({ sc: "headline", score: 1, shots: 40, acc: 95, vert: 2.1, vertBias: -2 });
  assert.ok(head.some((x) => /sotto la linea/.test(x.text)));
  const track = A.insights({ sc: "tracking", score: 1, track: 40, hold: 100, lag: 80, lead: 20 });
  assert.ok(track.some((x) => /dietro alla sagoma/.test(x.text)));
  assert.ok(A.insights({ sc: "boh" }).length === 0);
  assert.ok(tips.length <= 4);
});

test("Ricerca della sens: alla cieca, A-B-B-A, consiglio e convergenza", () => {
  const f0 = A.finderStart(0.35, { now: 1000 });
  assert.strictEqual(f0.mode, "precisa");
  assert.ok(f0.a < 0.35 && f0.b > 0.35, "una piu' bassa e una piu' alta");
  near(Math.sqrt(f0.lo * f0.hi), 0.35, 1e-9, "centrata sulla sens attuale");
  assert.strictEqual(f0.seq.length, 4);
  assert.strictEqual(f0.seq[0], f0.seq[3]);
  assert.strictEqual(f0.seq[1], f0.seq[2]);
  assert.notStrictEqual(f0.seq[0], f0.seq[1]);
  assert.strictEqual(A.finderLabel(f0, f0.seq[0]), 1, "la prima provata e' la Sens 1");
  // le prove si registrano solo nell'ordine giusto
  const wrong = f0.seq[0] === "a" ? "b" : "a";
  assert.strictEqual(A.finderRecord(f0, wrong, { score: 1 }), false);
  assert.strictEqual(A.finderSuggest(f0), null, "turno incompleto: nessun consiglio");
  const quick = A.finderStart(0.35, { mode: "rapida" });
  assert.strictEqual(quick.seq.length, 2);

  // giocatore simulato: il punteggio migliore e' a 0,42
  const best = 0.42;
  const scoreAt = (s) => Math.round(1000 - 1500 * Math.abs(Math.log(s / best)));
  const run = (mode) => {
    let f = A.finderStart(0.35, { mode, now: 5 });
    while (!f.done) {
      let next = A.finderNext(f);
      while (next) { A.finderRecord(f, next.which, { score: scoreAt(f[next.which]) }); next = A.finderNext(f); }
      const s = A.finderSuggest(f);
      f = A.finderChoose(f, s.pick);
    }
    return f;
  };
  const p = run("precisa");
  assert.strictEqual(p.history.length, A.FINDER_ROUNDS);
  assert.ok(Math.abs(p.result - best) / best < 0.08, `risultato ${p.result}`);
  assert.strictEqual(p.edge, null);
  const q = run("rapida");
  assert.ok(Math.abs(q.result - best) / best < 0.08, `rapida ${q.result}`);

  // sensazione e flick oltre il bersaglio spostano il consiglio quando i punteggi sono pari
  const g = A.finderStart(0.5, { mode: "rapida" });
  g.seq.forEach((w) => A.finderRecord(g, w, { score: 1000, flick: w === "b" ? { c: 2, o: 9, u: 1 } : { c: 6, o: 2, u: 2 } }));
  let s = A.finderSuggest(g);
  assert.strictEqual(s.pick, "a", "la piu' alta supera il bersaglio: meglio la bassa");
  assert.ok(s.reasons.some((r) => r.k === "over"));
  A.finderFeel(g, "b", "fast");
  s = A.finderSuggest(g);
  assert.strictEqual(s.pick, "a");
  const h = A.finderStart(0.5, { mode: "rapida" });
  h.seq.forEach((w) => A.finderRecord(h, w, { score: 1000 }));
  A.finderFeel(h, "a", "slow");
  A.finderFeel(h, "b", "fast");
  assert.strictEqual(A.finderSuggest(h).pick, "tie", "lenta e veloce: la giusta sta in mezzo");
  const span = h.hi / h.lo;
  A.finderChoose(h, "tie");
  near(h.hi / h.lo, Math.sqrt(span), 1e-9, "pari: si tiene la meta' centrale");
  assert.strictEqual(h.trials.length, 0, "turno nuovo, prove nuove");
  assert.strictEqual(h.history[0].sugg, "tie");

  // sempre la piu' alta: risultato al bordo
  let e = A.finderStart(0.3, { mode: "rapida" });
  while (!e.done) { e.seq.forEach((w) => A.finderRecord(e, w, { score: w === "b" ? 900 : 500 })); e = A.finderChoose(e, "b"); }
  assert.strictEqual(e.edge, "high");
  assert.ok(e.result > 0.3 && e.result <= 0.3 * A.FINDER_SPAN);

  // turno rifatto
  const r = A.finderStart(0.4, { mode: "rapida" });
  A.finderRecord(r, r.seq[0], { score: 10 });
  A.finderRedo(r);
  assert.strictEqual(r.trials.length, 0);
});

test("Progressi: riepiloghi, somme, sens, abilità, calendario, livelli", () => {
  const lab = A.ensure({});
  const t0 = new Date(2026, 9, 16, 12).getTime();
  const day = 24 * 3600 * 1000;
  for (let i = 0; i < 10; i += 1) {
    A.recordRun(lab, { sc: "gridshot", lv: 1, score: 4000 + i * 100, shots: 80, hits: 72, acc: 90 + i * 0.5, kps: 1.2 + i * 0.05, ttk: 700 - i * 10, dur: 60, flick: { c: 6, o: 2, u: 2 }, miss: { o: 3, u: 1, s: 1 }, bins: { s: [10, 1, 400], m: [8, 2, 600], l: [3, 2, 900] }, bias: { x: 0.1, y: -0.2, r: 1, n: 20 } }, { now: t0 - (9 - i) * day, sens: i < 5 ? 0.35 : 0.4 });
  }
  const sum = A.summary(lab, "gridshot", 1);
  const score = sum.metrics.find((m) => m.key === "score");
  assert.strictEqual(score.best, 4900);
  assert.strictEqual(score.n, 10);
  assert.ok(score.change > 0 && score.better === true, "punteggio migliorato");
  const ttk = sum.metrics.find((m) => m.key === "ttk");
  assert.ok(ttk.change < 0 && ttk.better === true, "tempo sceso = meglio");
  assert.strictEqual(sum.metrics.find((m) => m.key === "clean").last, 60);
  const ag = A.aggregate(sum.runs);
  assert.strictEqual(ag.flick.c, 60);
  assert.strictEqual(ag.bins.l[0], 30);
  assert.strictEqual(ag.bins.l[2], 900);
  near(ag.bias.y, -0.2, 1e-9);
  const sens = A.bySens(sum.runs);
  assert.strictEqual(sens.length, 2);
  assert.ok(sens[1].value > sens[0].value);
  const prof = A.skillProfile(lab);
  const speed = prof.find((p) => p.sc === "gridshot");
  assert.ok(speed.value > 1.2 && speed.better === true);
  assert.strictEqual(prof.find((p) => p.sc === "duel").value, null);
  const act = A.activity(lab, t0, 14);
  assert.strictEqual(act.length, 14);
  assert.strictEqual(act[act.length - 1].minutes, 1);
  assert.strictEqual(act.filter((d) => d.runs).length, 10);
  const adv = A.levelAdvice(lab, "gridshot");
  assert.ok(adv.ready, "ultime 3 sopra il 90%");
  assert.strictEqual(adv.next, 2);
  lab.settings.levels.gridshot = 3;
  assert.strictEqual(A.levelAdvice(lab, "gridshot").ready, false, "al livello Pro non si sale");
  assert.strictEqual(A.stats(lab, t0).per.gridshot.count, 0, "record per livello");
  assert.strictEqual(A.stats(lab, t0).per.gridshot.total, 10);
});

test("Stato: dati rovinati sistemati, partite, sens, ricerche, versione precedente", () => {
  const lab = A.ensure({ settings: { dpi: "x", sens: 99, levels: { gridshot: 7, peek: 2 }, crosshair: { color: "red", len: 99 } }, runs: [null, { t: 1, sc: "boh", score: 3 }, { t: 2, sc: "peek", score: 5 }], finder: { lo: 2, hi: 1 } });
  assert.strictEqual(lab.settings.dpi, 800);
  assert.strictEqual(lab.settings.sens, 0.35);
  assert.strictEqual(lab.settings.levels.gridshot, 1);
  assert.strictEqual(lab.settings.levels.peek, 2);
  assert.strictEqual(lab.settings.levels.duel, 1);
  assert.strictEqual(lab.settings.crosshair.color, "#2ef27a");
  assert.strictEqual(lab.settings.crosshair.len, 20);
  assert.strictEqual(lab.runs.length, 1);
  assert.strictEqual(lab.runs[0].lv, 1, "le partite vecchie sono livello Base");
  assert.strictEqual(lab.finder, null);
  const day = 24 * 3600 * 1000;
  const t0 = new Date(2026, 9, 16, 12).getTime();
  lab.runs = [];
  const r1 = A.recordRun(lab, { sc: "gridshot", lv: 1, score: 5000, shots: 60, hits: 55, acc: 91.7, ttk: 520, kps: 0.9, dur: 60 }, { now: t0 - day });
  assert.ok(A.isBest(lab, r1));
  const r2 = A.recordRun(lab, { sc: "gridshot", lv: 1, score: 4000, shots: 60, hits: 50, acc: 83, ttk: 600, kps: 0.8, dur: 60 }, { now: t0 });
  assert.ok(!A.isBest(lab, r2));
  const r3 = A.recordRun(lab, { sc: "gridshot", lv: 2, score: 3000, shots: 60, hits: 50, acc: 83, dur: 60 }, { now: t0 });
  assert.ok(A.isBest(lab, r3), "record del livello Avanzato");
  A.recordRun(lab, { sc: "senstest", score: 999, dur: 40 }, { now: t0 });
  const st = A.stats(lab, t0);
  assert.strictEqual(st.runs, 3, "le prove della ricerca non contano nei totali");
  assert.strictEqual(st.per.gridshot.best, 5000);
  assert.strictEqual(st.streak, 2);
  assert.strictEqual(st.minutes, 3);
  assert.strictEqual(st.shots, 180);
  assert.ok(st.acc30 > 80 && st.acc30 < 90);
  assert.ok(!("senstest" in st.per), "la prova sens non compare nei progressi");
  assert.ok(A.setSens(lab, 0.4123, { now: t0, method: "ricerca" }));
  assert.strictEqual(lab.settings.sens, 0.412);
  assert.ok(!A.setSens(lab, 0.412), "stessa sens: nessun cambio");
  // ricerca interrotta: dopo una ricarica si riprende dallo stesso punto
  lab.finder = A.finderStart(0.4, { now: 99 });
  A.finderRecord(lab.finder, lab.finder.seq[0], { score: 900 });
  const again = A.ensure(JSON.parse(JSON.stringify(lab)));
  assert.strictEqual(again.finder.trials.length, 1);
  assert.strictEqual(again.finder.round, 0);
  // ricerca finita: si annota una volta e le ricerche fanno media
  let f = again.finder;
  A.finderRedo(f);
  while (!f.done) { f.seq.forEach((w) => A.finderRecord(f, w, { score: 500 })); f = A.finderChoose(f, "tie", t0); }
  assert.ok(A.saveFinderResult(again, { now: t0 }));
  assert.ok(!A.saveFinderResult(again, { now: t0 }), "una volta sola");
  again.finderResults.push({ t: t0 + day, base: 0.4, result: 0.44, mode: "precisa", edge: null });
  const adv = A.finderAdvice(again);
  assert.strictEqual(adv.n, 2);
  assert.ok(adv.avg > 0.4 && adv.avg < 0.44);
  assert.ok(adv.spread > 0);
  // ricerca finita della versione precedente: diventa una ricerca fatta
  const old = A.ensure({ finder: { lo: 0.3, hi: 0.4, round: 4, rounds: 4, history: [], scores: {}, done: true, result: 0.37, finishedAt: t0 } });
  assert.strictEqual(old.finder, null);
  assert.strictEqual(old.finderResults[0].result, 0.37);
});

console.log(`${passed} test superati${failed.length ? `, ${failed.length} falliti` : ""}`);
process.exit(failed.length ? 1 : 0);
