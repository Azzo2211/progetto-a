/*
 * Test del recupero (LCA + arti marziali): schema dei contenuti, impostazione, controllo del
 * ginocchio (verde/giallo/rosso), programma del giorno, sessioni (alternanza, versione leggera,
 * niente gambe col rosso), livelli (due «facile» = su, «dolore» = giu', limiti di fase e di mese),
 * test e fasi (criteri MOON e Grindem, date minime, cedimenti), avvisi (estensione ferma),
 * profilo, avvisi per gli esercizi della Difesa, stato rovinato.
 *
 *   node tests/recovery.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const D = require(path.join(__dirname, "..", "recovery", "data.js"));
const E = require(path.join(__dirname, "..", "recovery", "engine.js"));

let passed = 0;
const failed = [];
function test(name, fn) {
  try { fn(); passed += 1; } catch (error) { failed.push(name); console.error(`FALLITO: ${name}\n  ${error.stack || error.message}`); }
}
const DAY = 86400000;
const T0 = new Date(2026, 10, 2, 9, 0, 0).getTime(); // 2 novembre 2026
const iso = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const monthsAgo = (m, from = T0) => { const d = new Date(from); d.setMonth(d.getMonth() - m); return iso(d.getTime()); };
function fresh(months = 4, flex = 0) {
  const lab = E.ensure({}, T0);
  const r = E.setSetup(lab, { surgery: monthsAgo(months), side: "destra", graft: "rotuleo", flex }, T0);
  assert.ok(r.ok, r.error);
  return lab;
}
// test che superano i criteri fino alla fase n
function testsFor(n) {
  if (n <= 1) return { heel: 2, slr: 12, swell: 1, gait: 0 };
  if (n === 2) return { heel: 1, slr: 20, swell: 0, gait: 1, sit: [6, 10], bridge: [10, 14], balance: [12, 20], stepdown: 1 };
  if (n === 3) return { heel: 0, slr: 25, swell: 0, gait: 2, sit: [9, 10], calf: [20, 25], bridge: [13, 15], balance: [25, 30], stepdown: 2 };
  return { heel: 0, slr: 25, swell: 0, gait: 2, sit: [19, 20], calf: [28, 30], bridge: [19, 20], balance: [30, 30], stepdown: 2, hop: [150, 160], clear: 1 };
}

/* ------------------------------------------------------------ contenuti */
test("Esercizi: id unici e schema completo", () => {
  const ids = new Set();
  const areas = D.AREAS.map((a) => a.id);
  D.EXERCISES.forEach((e) => {
    assert.ok(!ids.has(e.id), `id doppio ${e.id}`);
    ids.add(e.id);
    assert.ok(areas.includes(e.area), `${e.id}: area`);
    assert.ok(typeof e.name === "string" && e.name.length >= 4, `${e.id}: nome`);
    ["goal", "how", "martial"].forEach((k) => assert.ok(typeof e[k] === "string" && e[k].length > 30, `${e.id}: ${k}`));
    assert.ok(Array.isArray(e.steps) && e.steps.length >= 3, `${e.id}: passi`);
    assert.ok(Array.isArray(e.cues) && e.cues.length >= 2, `${e.id}: punti chiave`);
    assert.ok(Array.isArray(e.errors) && e.errors.length >= 2 && e.errors.every((x) => x.e && x.fix), `${e.id}: errori`);
    assert.ok(Array.isArray(e.levels) && e.levels.length >= 3, `${e.id}: livelli`);
    e.levels.forEach((L, i) => {
      assert.ok(L.name && L.text, `${e.id} livello ${i}`);
      if (L.phase) assert.ok([2, 3, 4].includes(L.phase), `${e.id} livello ${i}: fase`);
      if (L.minMonths) assert.ok(L.minMonths >= 3 && L.minMonths <= 12, `${e.id} livello ${i}: mesi`);
    });
    // il primo livello deve essere sempre disponibile
    assert.ok(!e.levels[0].phase && !e.levels[0].minMonths, `${e.id}: primo livello libero`);
    [e.dose, ...e.levels.map((L) => ({ ...e.dose, ...(L.dose || {}) }))].forEach((d) => {
      assert.ok(Number.isInteger(d.sets) && d.sets >= 1, `${e.id}: serie`);
      assert.ok((d.work != null) !== (d.reps != null) || d.work != null, `${e.id}: tempo o ripetizioni`);
      if (d.tasks) assert.ok(d.tasks.length >= d.sets, `${e.id}: un compito per serie`);
    });
  });
});

test("Sessioni: ogni id esiste, le aree sono giuste e ogni fase ha gambe e tecnica", () => {
  const all = [D.SESSIONS.ext, D.SESSIONS.upperA, D.SESSIONS.upperB, ...Object.values(D.SESSIONS.legs), ...Object.values(D.SESSIONS.martial), ...Object.values(D.SESSIONS.kick)].flat();
  all.forEach((id) => assert.ok(E.EX.has(id), `manca ${id}`));
  D.SESSIONS.ext.forEach((id) => assert.strictEqual(E.EX.get(id).area, "ext"));
  [1, 2, 3, 4].forEach((n) => {
    assert.ok(D.SESSIONS.legs[n].length >= 6, `gambe fase ${n}`);
    D.SESSIONS.legs[n].forEach((id) => assert.strictEqual(E.EX.get(id).area, "legs", id));
    D.SESSIONS.martial[n].forEach((id) => assert.strictEqual(E.EX.get(id).area, "martial", id));
    // Estensione e calci: solo esercizi di flessibilità, nessuno con impatto, tutti con il primo livello libero
    assert.ok(D.SESSIONS.kick[n].length >= 6, `calci fase ${n}`);
    D.SESSIONS.kick[n].forEach((id) => { assert.strictEqual(E.EX.get(id).area, "kick", id); assert.ok(!E.EX.get(id).impact, id); });
  });
  // ogni esercizio di flessibilità è usato
  D.EXERCISES.filter((e) => e.area === "kick").forEach((e) => assert.ok(Object.values(D.SESSIONS.kick).some((l) => l.includes(e.id)), e.id));
  // nessun impatto nelle fasi 1 e 2
  [1, 2].forEach((n) => D.SESSIONS.legs[n].concat(D.SESSIONS.martial[n]).forEach((id) => assert.ok(!E.EX.get(id).impact, `${id} in fase ${n}`)));
  // gli esercizi della parte alta non chiedono di stare in ginocchio
  D.SESSIONS.upperA.concat(D.SESSIONS.upperB).forEach((id) => assert.ok(!/in ginocchio/i.test(E.EX.get(id).how), id));
});

test("Test e lezioni: schema e fonti esistenti", () => {
  D.TESTS.forEach((t) => {
    assert.ok(t.id && t.name && t.how && t.how.length > 30, t.id);
    assert.ok(t.options ? t.options.length >= 2 : num(t.max), t.id);
  });
  D.LESSONS.forEach((l) => {
    assert.ok(l.title && l.lead && l.body.length >= 2, l.id);
    l.sources.forEach((s) => assert.ok(D.SOURCES[s] && /^https:\/\//.test(D.SOURCES[s].url), `${l.id}: fonte ${s}`));
  });
  assert.strictEqual(D.PHASES.length, 4);
  assert.deepStrictEqual(D.GATES.map((g) => g.months), [3, 4, 6, 9]);
});
function num(v) { return typeof v === "number" && Number.isFinite(v); }

/* ------------------------------------------------------------ impostazione */
test("Impostazione: data valida, livelli di partenza dalla flessione", () => {
  const lab = E.ensure({}, T0);
  assert.ok(!E.configured(lab));
  assert.deepStrictEqual(E.plan(lab, T0).map((s) => s.id), ["setup"]);
  assert.ok(!E.setSetup(lab, { surgery: "2027-01-01", side: "destra" }, T0).ok, "data futura");
  assert.ok(!E.setSetup(lab, { surgery: "ieri", side: "destra" }, T0).ok, "data non valida");
  const a = fresh(4, 0);
  assert.strictEqual(E.levelOf(a, "sedia", 1, T0), 0);
  const b = fresh(4, 1);
  assert.strictEqual(E.levelOf(b, "sedia", 1, T0), 2);
  const c = fresh(4, 2);
  assert.strictEqual(E.levelOf(c, "sedia", 1, T0), 3);
  const m = E.monthsSince(a, T0);
  assert.ok(m > 3.9 && m < 4.1, `mesi ${m}`);
  const g = E.gates(a, T0);
  assert.deepStrictEqual(g.map((x) => x.open), [true, true, false, false]);
  assert.strictEqual(iso(g[3].date), monthsAgo(-5)); // 9 mesi dall'intervento = fra 5 mesi
});

/* ------------------------------------------------------------ controllo del ginocchio */
test("Controllo: verde, giallo, rosso", () => {
  const lab = fresh();
  assert.strictEqual(E.readiness(lab, T0), null);
  E.checkIn(lab, { swelling: 0, pain: 1, trend: 0 }, T0);
  assert.strictEqual(E.readiness(lab, T0).level, "verde");
  E.checkIn(lab, { swelling: 1, pain: 2, trend: 1 }, T0);
  assert.strictEqual(E.readiness(lab, T0).level, "giallo");
  E.checkIn(lab, { swelling: 0, pain: 3, trend: 0 }, T0);
  assert.strictEqual(E.readiness(lab, T0).level, "giallo");
  E.checkIn(lab, { swelling: 2, pain: 0, trend: 0 }, T0);
  assert.strictEqual(E.readiness(lab, T0).level, "rosso");
  E.checkIn(lab, { swelling: 0, pain: 6, trend: -1 }, T0);
  assert.strictEqual(E.readiness(lab, T0).level, "rosso");
  E.checkIn(lab, { swelling: 0, pain: 0, trend: 0, gaveWay: true }, T0);
  const r = E.readiness(lab, T0);
  assert.strictEqual(r.level, "rosso");
  assert.ok(/chirurgo/.test(r.advice));
});

/* ------------------------------------------------------------ programma e sessioni */
test("Programma: controllo, estensione finché manca, sessione, Estensione e calci, test", () => {
  const lab = fresh();
  let steps = E.plan(lab, T0);
  assert.deepStrictEqual(steps.map((s) => s.id), ["check", "test", "ext1", "session", "kick"]);
  assert.strictEqual(steps.find((s) => s.id === "kick").kind, "kick");
  assert.strictEqual(steps.find((s) => s.id === "session").kind, "legs");
  E.checkIn(lab, { swelling: 0, pain: 0, trend: 0 }, T0);
  E.startSession(lab, "ext", T0);
  D.SESSIONS.ext.forEach((id) => E.rate(lab, id, "ok"));
  E.finishSession(lab, {}, T0 + 15 * 60000);
  steps = E.plan(lab, T0 + 20 * 60000);
  assert.ok(steps.find((s) => s.id === "check").done);
  assert.ok(steps.find((s) => s.id === "ext1").done && !steps.find((s) => s.id === "kick").done);
  // anche la routine Estensione e calci conta come estensione del giorno
  E.startSession(lab, "kick", T0 + 16 * 60000);
  D.SESSIONS.kick[1].forEach((id) => E.rate(lab, id, "ok"));
  E.finishSession(lab, {}, T0 + 40 * 60000);
  assert.ok(E.plan(lab, T0 + 41 * 60000).find((s) => s.id === "kick").done);
  assert.strictEqual(E.extToday(lab, T0 + 41 * 60000), 2);
  // estensione completa: niente routine classica, resta Flessibilità per i calci
  E.recordTest(lab, { heel: 0 }, T0 + 30 * 60000);
  steps = E.plan(lab, T0 + 31 * 60000);
  assert.deepStrictEqual(steps.filter((s) => s.kind === "ext").length, 0);
  assert.ok(/Flessibilità per i calci/.test(steps.find((s) => s.id === "kick").title));
  assert.ok(!steps.some((s) => s.id === "test"), "test appena fatto");
  assert.ok(E.plan(lab, T0 + 7 * DAY).some((s) => s.id === "test"), "test dopo una settimana");
});

test("Sessioni: mai gambe due giorni di fila, parte alta A e B alternate", () => {
  const lab = fresh();
  assert.strictEqual(E.suggest(lab, T0).kind, "legs");
  E.startSession(lab, "legs", T0);
  E.finishSession(lab, {}, T0 + 3600000);
  assert.ok(E.suggest(lab, T0 + 4000000).done, "fatta oggi");
  const d1 = T0 + DAY;
  assert.strictEqual(E.suggest(lab, d1).kind, "upperA");
  E.startSession(lab, "upperA", d1);
  E.finishSession(lab, {}, d1 + 3600000);
  assert.strictEqual(E.suggest(lab, T0 + 2 * DAY).kind, "legs");
  E.startSession(lab, "legs", T0 + 2 * DAY);
  E.finishSession(lab, {}, T0 + 2 * DAY + 3600000);
  assert.strictEqual(E.suggest(lab, T0 + 3 * DAY).kind, "upperB");
  // ogni sessione di allenamento ha anche la tecnica marziale della fase
  const s = E.buildSession(lab, "upperB", T0 + 3 * DAY);
  assert.ok(s.items.some((x) => E.EX.get(x.id).area === "martial"));
  assert.deepStrictEqual(s.items.filter((x) => E.EX.get(x.id).area === "martial").map((x) => x.id), D.SESSIONS.martial[1]);
});

test("Sessioni: giallo = una serie in meno e niente impatto; rosso = niente gambe, tecnica da ferma", () => {
  const lab = fresh(10);
  E.recordTest(lab, testsFor(3), T0);
  assert.strictEqual(E.phase(lab, T0), 3);
  const normal = E.buildSession(lab, "legs", T0);
  assert.ok(normal.items.some((x) => E.EX.get(x.id).impact), "in fase 3 c'è impatto");
  E.checkIn(lab, { swelling: 1, pain: 2, trend: 1 }, T0);
  const light = E.buildSession(lab, "legs", T0);
  assert.ok(light.light);
  assert.ok(!light.items.some((x) => E.EX.get(x.id).impact), "niente impatto col giallo");
  const sedia = (s) => s.items.find((x) => x.id === "sedia").dose.sets;
  assert.strictEqual(sedia(light), sedia(normal) - 1);
  E.checkIn(lab, { swelling: 2, pain: 0, trend: 0 }, T0);
  assert.strictEqual(E.buildSession(lab, "legs", T0).items.length, 0);
  assert.strictEqual(E.startSession(lab, "legs", T0), null);
  const up = E.buildSession(lab, "upperA", T0);
  up.items.filter((x) => E.EX.get(x.id).area === "martial").forEach((x) => assert.ok(D.SESSIONS.martial[1].includes(x.id), x.id));
  assert.strictEqual(E.suggest(lab, T0).kind, "upperA");
});

/* ------------------------------------------------------------ livelli */
test("Livelli: due «facile» di fila = su, «duro» azzera, «dolore» = giù", () => {
  const lab = fresh();
  const one = (v, t) => { E.startSession(lab, "ext", t); E.rate(lab, "arco-corto", v); return E.finishSession(lab, {}, t + 60000); };
  assert.strictEqual(E.levelOf(lab, "arco-corto", 1, T0), 0);
  one("easy", T0);
  assert.strictEqual(E.levelOf(lab, "arco-corto", 1, T0), 0);
  one("hard", T0 + 3600000);
  one("easy", T0 + 7200000);
  assert.strictEqual(E.levelOf(lab, "arco-corto", 1, T0), 0, "il duro ha azzerato");
  const r = one("easy", T0 + 10800000);
  assert.strictEqual(E.levelOf(lab, "arco-corto", 1, T0), 1);
  assert.strictEqual(r.ups[0].id, "arco-corto");
  const p = one("pain", T0 + 14400000);
  assert.strictEqual(E.levelOf(lab, "arco-corto", 1, T0), 0);
  assert.strictEqual(p.downs[0].id, "arco-corto");
});

test("Livelli: niente salita col giallo o con dolore al ginocchio; limiti di fase e di mese", () => {
  const lab = fresh();
  E.checkIn(lab, { swelling: 1, pain: 1, trend: 1 }, T0);
  for (let i = 0; i < 3; i += 1) { E.startSession(lab, "ext", T0 + i * 1000); E.rate(lab, "arco-corto", "easy"); E.finishSession(lab, {}, T0 + i * 1000 + 500); }
  assert.strictEqual(E.levelOf(lab, "arco-corto", 1, T0), 0, "col giallo non si sale");
  // squat libero (fase 3) non disponibile in fase 1
  const sedia = E.EX.get("sedia");
  assert.strictEqual(E.maxLevel(lab, sedia, 1, T0), sedia.levels.length - 2);
  assert.strictEqual(E.maxLevel(lab, sedia, 3, T0), sedia.levels.length - 1);
  assert.strictEqual(E.setLevel(lab, "sedia", 99, 1, T0), sedia.levels.length - 2);
  // calci al 75% solo dal sesto mese
  const calci = E.EX.get("calci-lenti");
  assert.strictEqual(E.maxLevel(lab, calci, 3, T0), 1);
  const old = fresh(7);
  assert.strictEqual(E.maxLevel(old, calci, 3, T0), 2);
});

/* ------------------------------------------------------------ fasi */
test("Fasi: criteri cumulativi, date minime e cedimenti", () => {
  const lab = fresh(4);
  assert.strictEqual(E.phase(lab, T0), 1);
  E.recordTest(lab, testsFor(1), T0);
  assert.strictEqual(E.phase(lab, T0), 1);
  const r = E.recordTest(lab, testsFor(2), T0 + 1000);
  assert.strictEqual(r.before, 1);
  assert.strictEqual(r.after, 2);
  E.recordTest(lab, testsFor(3), T0 + 2000);
  assert.strictEqual(E.phase(lab, T0 + 2000), 3);
  // la fase 4 chiede 9 mesi: a 4 mesi non basta avere i test perfetti
  E.recordTest(lab, testsFor(4), T0 + 3000);
  const info = E.phaseInfo(lab, T0 + 3000);
  assert.strictEqual(info.phase, 3);
  assert.deepStrictEqual(info.missing.map((c) => c.id), ["m9"]);
  const late = fresh(10);
  E.recordTest(late, testsFor(4), T0);
  assert.strictEqual(E.phase(late, T0), 4);
  // un cedimento recente riporta alla fase 2
  E.checkIn(late, { swelling: 0, pain: 0, trend: 0, gaveWay: true }, T0 + DAY);
  const capped = E.phaseInfo(late, T0 + DAY);
  assert.strictEqual(capped.phase, 2);
  assert.ok(capped.capped);
  // la fase 3 chiede 4 mesi
  const early = fresh(3);
  E.recordTest(early, testsFor(3), T0);
  assert.strictEqual(E.phase(early, T0), 2);
  // un test parziale usa i valori precedenti per i campi vuoti
  E.recordTest(lab, { push: 20 }, T0 + 4000);
  assert.strictEqual(E.latestValue(lab, "heel"), 0);
  assert.strictEqual(E.latestLsi(lab, "sit"), 95);
  assert.ok(!E.recordTest(lab, {}, T0 + 5000).ok, "test vuoto");
});

test("Avvisi: estensione ferma da 3 settimane, cedimento, gonfiore ripetuto", () => {
  const lab = fresh(4);
  E.recordTest(lab, { heel: 2 }, T0);
  let a = E.alerts(lab, T0);
  assert.ok(a.some((x) => x.id === "ext-info"), "manca estensione a 4 mesi");
  E.recordTest(lab, { heel: 1.5 }, T0 + 10 * DAY);
  E.recordTest(lab, { heel: 2 }, T0 + 22 * DAY);
  a = E.alerts(lab, T0 + 22 * DAY);
  assert.ok(a.some((x) => x.id === "ext" && /ciclope/.test(x.text)), "estensione ferma");
  const ok = fresh(4);
  E.recordTest(ok, { heel: 2 }, T0);
  E.recordTest(ok, { heel: 1 }, T0 + 22 * DAY);
  assert.ok(!E.alerts(ok, T0 + 22 * DAY).some((x) => x.id === "ext"), "migliora: niente avviso");
  E.checkIn(ok, { gaveWay: true }, T0 + 23 * DAY);
  assert.ok(E.alerts(ok, T0 + 23 * DAY).some((x) => x.id === "gave" && x.level === "rosso"));
  [24, 25, 26].forEach((d) => E.checkIn(ok, { swelling: 2 }, T0 + d * DAY));
  assert.ok(E.alerts(ok, T0 + 26 * DAY).some((x) => x.id === "swell"));
});

/* ------------------------------------------------------------ profilo e difesa */
test("Profilo: sei voci, «da misurare» senza dati, valori che salgono con i test", () => {
  const lab = fresh();
  let p = E.profile(lab, T0);
  assert.deepStrictEqual(p.map((x) => x.label), ["Estensione", "Forza gambe", "Parte alta", "Controllo", "Costanza", "Tecnica marziale"]);
  assert.ok(p.every((x) => !x.measured && x.value === 10));
  E.recordTest(lab, testsFor(1), T0);
  const low = E.profile(lab, T0);
  E.recordTest(lab, { ...testsFor(3), push: 30 }, T0 + 1000);
  E.startSession(lab, "upperA", T0 + 2000);
  E.EX.forEach((e, id) => { if (lab.current && lab.current.items.includes(id)) E.rate(lab, id, "ok"); });
  E.finishSession(lab, {}, T0 + 3600000);
  p = E.profile(lab, T0 + 3600000);
  const by = (rows, k) => rows.find((x) => x.key === k);
  assert.ok(by(p, "extension").value > by(low, "extension").value);
  assert.ok(by(p, "legs").measured && by(p, "legs").value >= 60);
  assert.ok(by(p, "upper").measured && by(p, "martial").measured && by(p, "consistency").measured);
  p.forEach((x) => assert.ok(x.value >= 10 && x.value <= 99));
  assert.ok(/Fase 3/.test(E.trend(lab, T0 + 3600000)));
});

test("Difesa: avvisi per calci, salti, squat e lotta secondo la fase", () => {
  const lab = fresh(4);
  assert.strictEqual(E.kneeRisk(E.ensure({}, T0), "Calcio circolare", T0), null, "senza recupero impostato niente avvisi");
  const k = E.kneeRisk(lab, "Calcio circolare alla coscia (mawashi geri)", T0);
  assert.ok(k && k.risks.some((r) => r.id === "kick") && !k.soft);
  assert.ok(E.kneeRisk(lab, "Saltelli con la corda", T0).risks.some((r) => r.id === "jump"));
  assert.ok(E.kneeRisk(lab, "Ginga e posizione del cavaliere", T0).risks.some((r) => r.id === "deep"));
  assert.ok(E.kneeRisk(lab, "Sprawl e proiezione d'anca", T0).risks.some((r) => r.id === "contact"));
  assert.strictEqual(E.kneeRisk(lab, "Jab e diretto con ritorno in guardia", T0), null);
  assert.strictEqual(E.kneeRisk(lab, "Attenzione ai pesi leggeri durante l'assalto", T0), null, "niente falsi allarmi");
  // nel corpo del testo un calcio citato di passaggio non basta, due volte sì; i salti bastano una volta
  assert.strictEqual(E.kneeRisk(lab, { title: "Defaticamento", body: "Allunga i muscoli che il teep ha lavorato." }, T0), null);
  assert.ok(E.kneeRisk(lab, { title: "Kata", body: "Parata, poi calcio frontale; giro e secondo calcio laterale." }, T0).risks.some((r) => r.id === "kick"));
  assert.ok(E.kneeRisk(lab, { title: "Circuito", body: "Dieci squat e piegamenti." }, T0).risks.some((r) => r.id === "deep"));
  // in fase 3 i calci base sono permessi con cautela, i salti sì, la lotta no
  const late = fresh(10);
  E.recordTest(late, testsFor(3), T0);
  const kk = E.kneeRisk(late, "Calcio frontale (mae geri)", T0);
  assert.ok(kk.soft && /lenti/.test(kk.risks[0].alt));
  assert.strictEqual(E.kneeRisk(late, "Saltelli", T0), null);
  assert.ok(E.kneeRisk(late, "Sparring leggero", T0).risks.some((r) => r.id === "contact" && !r.soft));
});

test("Stato rovinato: ensure ripara tutto senza eccezioni", () => {
  const bad = { setup: { surgery: "x" }, checks: { pippo: 1, "2026-11-01": { swelling: 9, pain: "a" } }, ext: ["a", 3], sessions: [{ t: 1, kind: "boh", results: {} }, { t: 2, kind: "legs", results: { sedia: "wow", "non-esiste": "ok", ponte: "easy" } }], levels: { sedia: 99, nope: 2 }, easy: { sedia: -1 }, tests: [{ t: 5, heel: -2, sit: [1], swell: 7, gait: 1 }, "x"], current: { kind: "legs", startedAt: 1, items: ["nope"], results: {} } };
  const lab = E.ensure(bad, T0);
  assert.strictEqual(lab.setup, null);
  assert.deepStrictEqual(Object.keys(lab.checks), ["2026-11-01"]);
  assert.strictEqual(lab.checks["2026-11-01"].swelling, 0);
  assert.deepStrictEqual(lab.ext, [3]);
  assert.strictEqual(lab.sessions.length, 1);
  assert.deepStrictEqual(lab.sessions[0].results, { ponte: "easy" });
  assert.strictEqual(lab.levels.sedia, E.EX.get("sedia").levels.length - 1);
  assert.ok(!("nope" in lab.levels));
  assert.deepStrictEqual(lab.tests, [{ t: 5, gait: 1 }]);
  assert.strictEqual(lab.current, null);
  assert.doesNotThrow(() => { E.plan(lab, T0); E.profile(lab, T0); E.alerts(lab, T0); E.phaseInfo(lab, T0); E.ensure(null); E.ensure("x"); });
});

test("Arti marziali: cosa allena ogni esercizio, stili, profilo dai test", () => {
  const goals = D.MA_GOALS.map((g) => g.id);
  assert.strictEqual(goals.length, 6);
  D.EXERCISES.forEach((e) => {
    const k = Object.keys(e.builds);
    assert.ok(k.length >= 1, `${e.id}: builds`);
    k.forEach((g) => { assert.ok(goals.includes(g), `${e.id}: ${g}`); assert.ok([1, 2, 3].includes(e.builds[g]), `${e.id}: peso ${g}`); });
  });
  Object.entries(D.STYLE_NEEDS).forEach(([id, st]) => {
    assert.deepStrictEqual(Object.keys(st.needs).sort(), goals.slice().sort(), id);
    assert.ok(st.text.length > 40 && st.name && /^(il tuo|la tua) /.test(st.mine), id);
  });
  // gli stili sono quelli della Difesa
  global.window = global.window || {};
  require(path.join(__dirname, "..", "defense", "martial-data.js"));
  const disc = window.MartialDisciplines.map((d) => d.id).sort();
  assert.deepStrictEqual(Object.keys(D.STYLE_NEEDS).sort(), disc);
  // taekwondo: calci alti, laterali e camera prima di tutto; la routine Estensione e calci allena soprattutto i calci alti
  assert.deepStrictEqual(E.topGoals(["taekwondo"]).map((g) => g.id).sort(), ["alti", "aperti", "frusta"]);
  assert.deepStrictEqual(E.topGoals(["boxe"]).map((g) => g.id)[0], "guardia");
  assert.strictEqual(E.topGoals([]).length, 0);
  const lab = fresh();
  const kick = E.sessionGoals(E.buildSession(lab, "kick", T0).items);
  assert.strictEqual(kick[0].id, "alti");
  assert.ok(kick.some((g) => g.id === "aperti"));
  assert.ok(E.forStyles("gambe-muro-v", ["taekwondo"]).some((g) => g.id === "aperti"));
  assert.deepStrictEqual(E.forStyles("gambe-muro-v", ["boxe"]), []);
  // profilo: da misurare senza test, poi sale con i numeri; il seduto e allungo accetta valori negativi
  assert.ok(E.maProfile(lab, T0).every((r) => !r.measured));
  E.recordTest(lab, { reach: -12, straddle: 95, kickH: [80, 110], heel: 2, slr: 10 }, T0);
  assert.strictEqual(E.latestValue(lab, "reach"), -12);
  const p1 = Object.fromEntries(E.maProfile(lab, T0).map((r) => [r.key, r]));
  assert.ok(p1.alti.measured && p1.aperti.measured && p1.frusta.measured && !p1.guardia.measured);
  E.recordTest(lab, { reach: 6, straddle: 140, kickH: [125, 130], heel: 0, slr: 22 }, T0 + 7 * DAY);
  const p2 = Object.fromEntries(E.maProfile(lab, T0 + 7 * DAY).map((r) => [r.key, r]));
  ["alti", "aperti", "frusta"].forEach((k) => assert.ok(p2[k].value > p1[k].value, k));
  // stili salvati: solo id veri, senza doppioni
  const l2 = E.ensure({ prefs: { styles: ["taekwondo", "boh", "taekwondo", "boxe"] } }, T0);
  assert.deepStrictEqual(l2.prefs.styles, ["taekwondo", "boxe"]);
  // ginocchio rosso: niente slanci né calci al rallentatore
  E.checkIn(lab, { swelling: 2, pain: 6, trend: 1 }, T0 + 7 * DAY);
  const red = E.buildSession(lab, "kick", T0 + 7 * DAY).items.map((x) => x.id);
  assert.ok(red.length >= 3 && !red.some((id) => /slancio|calci-/.test(id)), red.join());
  assert.ok(!E.buildSession(lab, "upperA", T0 + 7 * DAY).items.some((x) => x.id === "calci-rallentatore"));
});

test("Omino: ogni esercizio ha una dimostrazione per passo, con mosse vere e pose senza avvisi", () => {
  const DEF = path.join(__dirname, "..", "defense");
  const F = require(path.join(DEF, "figure3d.js"));
  globalThis.MartialFigure = F;
  const M = require(path.join(DEF, "moves.js"));
  ["comuni", "boxe", "muaythai", "recupero"].forEach((s) => require(path.join(DEF, "moves", `${s}.js`)));
  const DEMOS = require(path.join(__dirname, "..", "recovery", "demos.js"));
  const allowed = /^(rec|gen|boxe|muaythai)\./;
  D.EXERCISES.forEach((e) => {
    const spec = DEMOS[e.id];
    assert.ok(Array.isArray(spec), `${e.id}: manca la dimostrazione`);
    assert.strictEqual(spec.length, e.steps.length, `${e.id}: una riga per passo`);
    spec.forEach((row, i) => {
      assert.ok(row[0].length >= 6 && row[0].length <= 52, `${e.id} passo ${i + 1}: didascalia di ${row[0].length} caratteri`);
      const moves = row.slice(1);
      assert.ok(moves.length >= 1, `${e.id} passo ${i + 1}: nessuna mossa`);
      moves.forEach((m) => {
        const name = m.replace(/\*\d$/, "");
        assert.ok(M.has(name), `${e.id} passo ${i + 1}: la mossa ${m} non esiste`);
        assert.ok(allowed.test(name), `${e.id}: ${name} non e' una mossa del recupero o della tecnica`);
      });
    });
    const demo = M.demoFor(spec);
    assert.strictEqual(demo.steps.length, e.steps.length, `${e.id}: passi della dimostrazione`);
    demo.steps.forEach((s, i) => {
      const ms = s.frames.reduce((a, f) => a + f.t + f.h, 0);
      assert.ok(ms >= 600 && ms <= 16000, `${e.id} passo ${i + 1}: dura ${ms} ms`);
    });
  });
  const extra = Object.keys(DEMOS).filter((id) => !E.EX.get(id));
  assert.deepStrictEqual(extra, [], "dimostrazioni di esercizi che non esistono");
  const rec = M.names().filter((n) => n.startsWith("rec."));
  assert.ok(rec.length >= 60, `${rec.length} mosse del recupero`);
  const warn = [];
  rec.forEach((n) => M.get(n).frames.forEach((f, i) => F.check(f.pose).forEach((w) => warn.push(`${n}[${i}] ${w}`))));
  assert.deepStrictEqual(warn.slice(0, 5), [], `${warn.length} pose con avvisi`);
  const unused = rec.filter((n) => !Object.values(DEMOS).some((rows) => rows.some((r) => r.slice(1).some((m) => m.replace(/\*\d$/, "") === n))));
  assert.deepStrictEqual(unused, [], "mosse del recupero mai usate");
});

console.log(`\nRecupero: ${passed} test superati${failed.length ? `, ${failed.length} falliti` : ""}.`);
if (failed.length) process.exit(1);
