/*
 * Test dell'omino che mostra come si fa (Difesa, arti marziali): motore 3D (ossa, cinematica
 * inversa, controllo delle pose), pose a specchio, libreria dei movimenti di tutti gli stili,
 * immagini della sequenza, lettore (linea del tempo) e copertura: ogni passo di ogni esercizio
 * ha la sua dimostrazione.
 *
 *   node tests/omino.test.js
 */
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const DEF = path.join(__dirname, "..", "defense");
const F = require(path.join(DEF, "figure3d.js"));
globalThis.MartialFigure = F;
const M = require(path.join(DEF, "moves.js"));
const STYLES = ["boxe", "muaythai", "taekwondo", "karate", "capoeira", "lotta", "kungfu", "systema", "sambo"];
require(path.join(DEF, "moves", "comuni.js"));
STYLES.forEach((s) => require(path.join(DEF, "moves", `${s}.js`)));
const DEMOS = require(path.join(DEF, "martial-demos.js"));
global.window = global.window || {};
require(path.join(DEF, "martial-data.js"));
const DISC = window.MartialDisciplines;

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
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const near = (a, b, eps, msg) => assert.ok(Math.abs(a - b) <= eps, `${msg || ""} ${a} invece di ${b}`);
const allFrames = () => {
  const out = [];
  M.names().forEach((n) => M.get(n).frames.forEach((f, i) => { out.push({ n, i, pose: f.pose }); if (f.partner) out.push({ n, i, pose: f.partner, partner: true }); }));
  return out;
};
const exercisesOf = (d) => {
  const out = [];
  d.levels.forEach((l) => [].concat(l.warmup || [], ...l.sessions.map((s) => s.exercises), l.cooldown || []).forEach((e) => out.push(e)));
  return out;
};

test("Motore: le ossa hanno sempre la loro lunghezza in tutte le pose", () => {
  const D = F.DIM;
  allFrames().forEach(({ n, i, pose }) => {
    const sk = F.solve(pose);
    ["l", "r"].forEach((s) => {
      near(len(sub(sk.elbow[s], sk.sh[s])), D.upper, 1e-6, `${n}[${i}] braccio ${s}`);
      near(len(sub(sk.hand[s], sk.elbow[s])), D.fore, 1e-6, `${n}[${i}] avambraccio ${s}`);
      near(len(sub(sk.knee[s], sk.hip[s])), D.thigh, 1e-6, `${n}[${i}] coscia ${s}`);
      near(len(sub(sk.ankle[s], sk.knee[s])), D.shin, 1e-6, `${n}[${i}] tibia ${s}`);
    });
  });
});

test("Motore: la cinematica inversa raggiunge il punto e piega verso il pole", () => {
  const a = [0, 0, 0];
  const t = [0.4, 0.1, 0];
  const r = F.ik(a, t, 0.3, 0.3, [0, 1, 0]);
  const j = r.joint;
  const end = r.end;
  near(len(sub(end, t)), 0, 1e-9, "arriva al punto");
  near(len(sub(j, a)), 0.3, 1e-9, "primo osso");
  near(len(sub(end, j)), 0.3, 1e-9, "secondo osso");
  assert.ok(j[1] > 0.05, "il giunto si piega verso l'alto");
});

test("Controllo delle pose: quasi nessuna posa impossibile in tutta la libreria", () => {
  const frames = allFrames();
  const bad = frames.filter((f) => F.check(f.pose).length);
  assert.ok(frames.length > 1500, `solo ${frames.length} fotogrammi`);
  assert.ok(bad.length <= Math.ceil(frames.length * 0.01), `${bad.length} pose con avvisi su ${frames.length}: ${bad.slice(0, 5).map((f) => `${f.n}[${f.i}] ${F.check(f.pose).join(", ")}`).join(" | ")}`);
  // e il controllo se ne accorge davvero
  const wrong = JSON.parse(JSON.stringify(M.get("boxe.jab").frames[1].pose));
  wrong.hand.l = [3, 1.4, 0];
  assert.ok(F.check(wrong).some((w) => /troppo lontana/.test(w)));
});

test("Specchio: due volte torna uguale, e lo scheletro e' riflesso", () => {
  const b = M.lib.box();
  const once = b.copy().mirror().done();
  const twice = b.copy().mirror().mirror().done();
  assert.deepStrictEqual(JSON.parse(JSON.stringify(twice)), JSON.parse(JSON.stringify(b.done())));
  const s0 = F.solve(b.done());
  const s1 = F.solve(once);
  ["hand", "elbow", "knee", "ankle"].forEach((k) => {
    near(s1[k].r[2], -s0[k].l[2], 1e-6, `${k} z`);
    near(s1[k].r[1], s0[k].l[1], 1e-6, `${k} y`);
    near(s1[k].r[0], s0[k].l[0], 1e-6, `${k} x`);
  });
});

test("Libreria: tutti gli stili hanno i loro movimenti, con nome e descrizione", () => {
  const names = M.names();
  assert.ok(names.filter((n) => n.startsWith("gen.")).length >= 60);
  STYLES.forEach((s) => assert.ok(names.filter((n) => n.startsWith(`${s}.`)).length >= 25, `pochi movimenti per ${s}`));
  names.forEach((n) => {
    const mv = M.get(n);
    assert.ok(mv.label && mv.label.length >= 6 && mv.label.length <= 120, `descrizione di ${n}`);
    assert.ok(mv.frames.length >= 1 && mv.frames.length <= 120, `fotogrammi di ${n}`);
    mv.frames.forEach((f) => assert.ok(f.t >= 0 && f.t <= 5000 && f.h >= 0 && f.h <= 8000, `tempi di ${n}`));
  });
});

test("Disegno: ogni fotogramma diventa un SVG valido, senza numeri rotti", () => {
  M.names().forEach((n) => {
    const mv = M.get(n);
    mv.frames.forEach((f, i) => {
      const s = F.svg(f.pose, { view: i % 2 ? "side" : "tq", prev: i ? mv.frames[i - 1].pose : null, act: f.act, props: mv.props, partner: f.partner });
      assert.ok(s.startsWith("<svg") && s.endsWith("</svg>"), n);
      assert.ok(!/NaN|Infinity|undefined/.test(s), `${n}[${i}] ha numeri rotti`);
    });
  });
});

test("Dimostrazione: ripetizioni, sacco e mosse sconosciute", () => {
  const d = M.demoFor([["Due jab", "boxe.jab*2", "@bag"], ["Niente", "boxe.nonEsiste"], ["Diretto", "boxe.cross"]]);
  assert.strictEqual(d.steps.length, 2, "il passo senza mosse valide sparisce");
  assert.strictEqual(d.steps[0].frames.length, M.get("boxe.jab").frames.length * 2);
  assert.deepStrictEqual(d.steps[0].frames.map((f) => f.rep), [0, 0, 0, 1, 1, 1]);
  assert.ok(d.props && d.props[0].k === "bag");
});

test("Immagini della sequenza: senza ripetizioni e senza doppioni, al massimo 6", () => {
  const d = M.demoFor([["Jab tre volte", "boxe.jab*3"]]);
  const keys = M.keyFrames(d.steps[0].frames, 6);
  assert.deepStrictEqual(keys, [0, 1], "guardia e jab: il ritorno in guardia e le ripetizioni non contano");
  const long = M.demoFor([["Tanta roba", "boxe.onetwothree", "boxe.roll", "boxe.box4"]]);
  const k2 = M.keyFrames(long.steps[0].frames, 6);
  assert.ok(k2.length <= 6 && k2.length >= 4);
  assert.strictEqual(k2[0], 0);
  assert.deepStrictEqual([...k2].sort((a, b) => a - b), k2);
});

test("Lettore: la linea del tempo somma i tempi e mostra le pose giuste", () => {
  const demo = M.demoFor([["Jab", "boxe.jab"], ["Diretto", "boxe.cross"]]);
  const tl = F.timeline(demo);
  let sum = 0;
  demo.steps.forEach((s, si) => s.frames.forEach((f, fi) => { sum += (si || fi ? f.t : 0) + f.h; }));
  sum += 450 * demo.steps.length + tl.back;
  assert.strictEqual(tl.total, sum);
  const it = tl.items[1];
  const mid = F.poseAt(tl, it.start + it.t + 1);
  assert.deepStrictEqual(mid.pose, it.pose, "durante la sosta la posa e' quella del fotogramma");
  assert.strictEqual(mid.step, 0);
  assert.strictEqual(F.poseAt(tl, tl.items[tl.items.length - 1].start + 5).step, 1);
  assert.strictEqual(tl.items[4].local, 1, "indice del fotogramma dentro il passo");
});

test("Copertura: ogni passo di ogni esercizio ha la sua dimostrazione", () => {
  let n = 0;
  let steps = 0;
  DISC.forEach((d) => {
    exercisesOf(d).forEach((e) => {
      const spec = DEMOS[e.id];
      assert.ok(Array.isArray(spec), `manca la dimostrazione di ${e.id}`);
      assert.strictEqual(spec.length, e.steps.length, `${e.id}: ${spec.length} righe per ${e.steps.length} passi`);
      spec.forEach((row, i) => {
        assert.ok(typeof row[0] === "string" && row[0].length >= 6 && row[0].length <= 52, `${e.id} passo ${i + 1}: didascalia "${row[0]}"`);
        const moves = row.slice(1).filter((x) => x !== "@bag");
        assert.ok(moves.length >= 1, `${e.id} passo ${i + 1}: nessuna mossa`);
        moves.forEach((m) => {
          const name = m.replace(/\*\d$/, "");
          assert.ok(M.has(name), `${e.id} passo ${i + 1}: la mossa ${m} non esiste`);
          assert.ok(name.startsWith("gen.") || name.startsWith(`${d.id}.`), `${e.id}: ${name} non e' di ${d.id}`);
        });
      });
      const demo = M.demoFor(spec);
      assert.strictEqual(demo.steps.length, e.steps.length, `${e.id}: passi della dimostrazione`);
      demo.steps.forEach((s, i) => {
        const ms = s.frames.reduce((a, f) => a + f.t + f.h, 0);
        assert.ok(ms >= 600 && ms <= 16000, `${e.id} passo ${i + 1}: dura ${ms} ms`);
      });
      n += 1;
      steps += e.steps.length;
    });
  });
  assert.ok(n > 1000 && steps > 4000, `${n} esercizi, ${steps} passi`);
  const extra = Object.keys(DEMOS).filter((id) => !DISC.some((d) => exercisesOf(d).some((e) => e.id === id)));
  assert.deepStrictEqual(extra, [], "dimostrazioni di esercizi che non esistono");
});

test("Pagina: index.html carica motore, movimenti di tutti gli stili e dimostrazioni prima della UI", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  const at = (f) => html.indexOf(`src="defense/${f}`);
  ["figure3d.js", "moves.js", "moves/comuni.js", ...STYLES.map((s) => `moves/${s}.js`), "martial-demos.js"].forEach((f) => {
    assert.ok(at(f) > 0, `manca ${f}`);
    assert.ok(at(f) < at("martial-ui.js"), `${f} dopo la UI`);
  });
  assert.ok(at("figure3d.js") < at("moves.js") && at("moves.js") < at("moves/comuni.js") && at("moves/comuni.js") < at("moves/boxe.js"));
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exit(1);
