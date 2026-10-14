/*
 * Test delle arti marziali: settimana a rotazione, allenamento con esiti,
 * scelta del livello, storico, contributo al profilo e schema delle discipline.
 *
 *   node tests/martial.test.js
 */
const assert = require("assert");
const path = require("path");
const fs = require("fs");

globalThis.window = globalThis;
const root = path.join(__dirname, "..");
const M = require(path.join(root, "defense", "martial.js"));
const E = require(path.join(root, "defense", "engine.js"));
const dataFile = path.join(root, "defense", "martial-data.js");
if (fs.existsSync(dataFile)) require(dataFile);
const REAL = globalThis.MartialDisciplines || null;

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

// Discipline finte per i test del motore: 7 stili, 6 livelli da 5 esercizi.
const IDS = ["boxe", "muaythai", "taekwondo", "karate", "capoeira", "lotta", "kungfu"];
const DISC = IDS.map((id) => ({
  id,
  name: id,
  levels: Array.from({ length: 6 }, (_, l) => ({ level: l + 1, title: `L${l + 1}`, exercises: Array.from({ length: 5 }, (_, i) => ({ id: `${id}-${l + 1}-${i + 1}`, dose: { sets: 3, reps: 10, rest: 30 } })) }))
}));
const exOf = (id, level) => DISC.find((d) => d.id === id).levels[level - 1].exercises;

const WED = new Date(2026, 9, 14, 19, 0).getTime(); // mercoledi' 14 ottobre 2026
const START = new Date(2026, 8, 1, 9, 0).getTime(); // inizio del metodo (1 settembre): niente giorni esclusi
const DAY = M.DAY;

test("Settimana: lunedi' come inizio, indici dei giorni", () => {
  assert.strictEqual(M.weekKey(WED), "2026-10-12");
  assert.strictEqual(M.dayIndex(WED), 2);
  const sun = new Date(2026, 9, 18, 23, 30).getTime();
  assert.strictEqual(M.weekKey(sun), "2026-10-12");
  assert.strictEqual(M.dayIndex(sun), 6);
  assert.strictEqual(M.addWeeks("2026-10-12", 1), "2026-10-19");
  // cambio dell'ora (25 ottobre 2026): la settimana dopo resta di lunedi'
  assert.strictEqual(M.addWeeks("2026-10-19", 1), "2026-10-26");
  assert.strictEqual(M.weekKey(new Date(2026, 9, 26, 0, 30).getTime()), "2026-10-26");
});

test("Rotazione: 5 stili diversi a settimana, in 7 settimane ognuno 5 volte", () => {
  const lab = M.ensure(null, DISC, START);
  const counts = {};
  let w = "2026-10-12";
  for (let i = 0; i < 7; i += 1) {
    const plan = M.planWeek(lab, DISC, w);
    const ids = Object.values(plan.days);
    assert.strictEqual(ids.length, 5);
    assert.strictEqual(new Set(ids).size, 5, "stili ripetuti nella stessa settimana");
    ids.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
    w = M.addWeeks(w, 1);
  }
  IDS.forEach((id) => assert.strictEqual(counts[id], 5, `${id}: ${counts[id]}`));
  // la settimana dopo la prima contiene i due stili rimasti fuori
  const lab2 = M.ensure(null, DISC, START);
  const first = Object.values(M.planWeek(lab2, DISC, "2026-10-12").days);
  const second = Object.values(M.planWeek(lab2, DISC, "2026-10-19").days);
  IDS.filter((id) => !first.includes(id)).forEach((id) => assert.ok(second.includes(id), `${id} manca nella seconda settimana`));
});

test("Giorni e stili scelti dall'utente: cambi a mano, giorni fatti intoccabili", () => {
  const lab = M.ensure(null, DISC, START);
  const t = M.today(lab, DISC, WED);
  assert.strictEqual(t.day, 2);
  assert.ok(t.disc);
  assert.ok(M.setDay(lab, t.week, 2, "capoeira"));
  assert.strictEqual(M.today(lab, DISC, WED).disc, "capoeira");
  M.startSession(lab, "capoeira", { now: WED });
  M.finishSession(lab, exOf("capoeira", 1), WED + 3600000);
  assert.strictEqual(M.setDay(lab, t.week, 2, "boxe"), false, "giorno gia' fatto");
  // solo 3 giorni a settimana: il piano si rifa' ma tiene il giorno fatto
  M.setTrainDays(lab, [0, 2, 4]);
  const plan = M.replanWeek(lab, DISC, t.week);
  assert.strictEqual(plan.days[2], "capoeira");
  assert.deepStrictEqual(Object.keys(plan.days).map(Number).sort(), [0, 2, 4]);
  // stili esclusi non compaiono piu'
  M.setPool(lab, ["boxe", "karate"]);
  const next = M.planWeek(lab, DISC, M.addWeeks(t.week, 1));
  Object.values(next.days).forEach((id) => assert.ok(["boxe", "karate"].includes(id)));
});

test("Stato dei giorni: fatto, oggi, saltato, da fare, riposo", () => {
  const lab = M.ensure(null, DISC, START);
  const t = M.today(lab, DISC, WED);
  assert.strictEqual(M.dayStatus(lab, t.week, 0, WED), "missed");
  assert.strictEqual(M.dayStatus(lab, t.week, 2, WED), "today");
  assert.strictEqual(M.dayStatus(lab, t.week, 4, WED), "planned");
  assert.strictEqual(M.dayStatus(lab, t.week, 6, WED), "rest");
  M.startSession(lab, t.disc, { now: WED });
  M.finishSession(lab, exOf(t.disc, 1), WED + 1000);
  assert.strictEqual(M.dayStatus(lab, t.week, 2, WED), "done");
});

test("Prima settimana: i giorni prima dell'inizio non sono saltati", () => {
  const lab = M.ensure(null, DISC, new Date(2026, 9, 15, 20).getTime()); // si comincia giovedi'
  const plan = M.planWeek(lab, DISC, "2026-10-12");
  assert.deepStrictEqual(Object.keys(plan.days).map(Number), [3, 4], "solo giovedi' e venerdi'");
  assert.strictEqual(M.dayStatus(lab, "2026-10-12", 0, new Date(2026, 9, 15, 21).getTime()), "rest");
  assert.deepStrictEqual(M.planWeek(lab, DISC, "2026-10-05").days, {}, "settimane prima: vuote");
  assert.strictEqual(Object.keys(M.planWeek(lab, DISC, "2026-10-19").days).length, 5);
});

test("Allenamento: esiti, consiglio, decide l'utente se salire", () => {
  const lab = M.ensure(null, DISC, START);
  M.startSession(lab, "boxe", { now: WED });
  const ex = exOf("boxe", 1);
  ex.forEach((e, i) => M.setResult(lab, e.id, i < 3));
  const s = M.finishSession(lab, ex, WED + 40 * 60000);
  assert.strictEqual(s.done, 3);
  assert.strictEqual(s.total, 5);
  assert.strictEqual(s.recommend, false, "3 su 5: consiglia di restare");
  assert.strictEqual(s.minutes, 40);
  // l'utente sceglie comunque di salire: si rispetta
  assert.ok(M.chooseLevel(lab, true, WED + 41 * 60000));
  assert.strictEqual(M.levelOf(lab, "boxe"), 2);
  assert.strictEqual(M.chooseLevel(lab, true), false, "una sola scelta per allenamento");
  // allenamento successivo tutto riuscito: consiglia di salire, l'utente resta
  M.startSession(lab, "boxe", { now: WED + DAY });
  exOf("boxe", 2).forEach((e) => M.setResult(lab, e.id, true));
  const s2 = M.finishSession(lab, exOf("boxe", 2), WED + DAY + 1000);
  assert.strictEqual(s2.level, 2);
  assert.ok(s2.recommend);
  M.chooseLevel(lab, false);
  assert.strictEqual(M.levelOf(lab, "boxe"), 2);
  assert.strictEqual(lab.history.length, 1);
  assert.strictEqual(M.copyPercent(lab, "boxe"), 17);
});

test("Ultimo livello: salire significa stile copiato al 100%", () => {
  const lab = M.ensure(null, DISC, START);
  M.setLevel(lab, "karate", 6, WED);
  assert.strictEqual(M.copyPercent(lab, "karate"), 83);
  M.startSession(lab, "karate", { now: WED });
  exOf("karate", 6).forEach((e) => M.setResult(lab, e.id, true));
  const s = M.finishSession(lab, exOf("karate", 6), WED + 1000);
  assert.ok(s.atMax);
  M.chooseLevel(lab, true);
  assert.strictEqual(M.levelOf(lab, "karate"), 6);
  assert.strictEqual(M.copyPercent(lab, "karate"), 100);
  // tornare indietro a mano toglie il 100%
  M.setLevel(lab, "karate", 4);
  assert.strictEqual(M.copyPercent(lab, "karate"), 50);
});

test("Fuori programma: allenarsi in un giorno di riposo lo segna con quello stile", () => {
  const lab = M.ensure(null, DISC, START);
  const sat = new Date(2026, 9, 17, 10).getTime();
  const t = M.today(lab, DISC, sat);
  assert.strictEqual(t.disc, null);
  M.startSession(lab, "lotta", { now: sat });
  M.finishSession(lab, exOf("lotta", 1), sat + 1000);
  assert.strictEqual(M.today(lab, DISC, sat).disc, "lotta");
  assert.strictEqual(M.dayStatus(lab, t.week, 5, sat), "done");
});

test("Storico: settimane, serie di settimane complete, minuti", () => {
  const lab = M.ensure(null, DISC, START);
  const mon = new Date(2026, 9, 5, 18).getTime(); // settimana del 5 ottobre
  const plan = M.planWeek(lab, DISC, M.weekKey(mon));
  Object.entries(plan.days).forEach(([d, id]) => {
    const t = mon + Number(d) * DAY;
    M.startSession(lab, id, { now: t });
    M.finishSession(lab, exOf(id, 1), t + 30 * 60000);
  });
  const st = M.stats(lab, DISC, WED);
  assert.strictEqual(st.streak, 1, `serie ${st.streak}`);
  assert.strictEqual(st.sessions, 5);
  assert.strictEqual(st.minutes, 150);
  const prev = st.weeks.find((w) => w.week === "2026-10-05");
  assert.strictEqual(prev.done, 5);
  assert.strictEqual(prev.planned, 5);
});

test("Profilo Difesa: le arti marziali contano per Costanza e Tecnica", () => {
  const lab = M.ensure(null, DISC, START);
  const def = E.ensureLab(null);
  const base = E.profile(def, [], WED, M.profileExtras(lab, DISC, WED));
  assert.strictEqual(base.costanza, 0);
  for (let i = 0; i < 5; i += 1) {
    const t = WED - i * DAY;
    M.startSession(lab, IDS[i], { now: t });
    exOf(IDS[i], 1).forEach((e) => M.setResult(lab, e.id, true));
    M.finishSession(lab, exOf(IDS[i], 1), t + 1000);
    M.chooseLevel(lab, true, t + 2000);
  }
  const p = E.profile(def, [], WED, M.profileExtras(lab, DISC, WED));
  assert.ok(p.costanza >= 50, `costanza ${p.costanza}`);
  assert.ok(p.tecnica > 30, `tecnica ${p.tecnica}`);
  const later = E.profile(def, [], WED + 40 * DAY, M.profileExtras(lab, DISC, WED + 40 * DAY));
  assert.ok(later.tecnica < p.tecnica, "cala se ti fermi");
  assert.strictEqual(later.costanza, 0);
});

test("Stato rovinato: si tiene il buono", () => {
  const lab = M.ensure({ version: 9, levels: { boxe: 3, karate: "x", lotta: 99 }, pool: ["boxe", 7, "nope"], trainDays: [9, 1, 1, 3], weeks: { "2026-10-12": { days: { 2: "boxe", 8: "x" } }, bad: 1 }, sessions: [null, { t: WED, disc: "boxe", level: 1, done: 2, total: 5 }], current: "x" }, DISC);
  assert.strictEqual(lab.levels.boxe, 3);
  assert.strictEqual(lab.levels.lotta, 6);
  assert.ok(!("karate" in lab.levels));
  assert.deepStrictEqual(lab.pool, ["boxe"]);
  assert.deepStrictEqual(lab.trainDays, [1, 3]);
  assert.deepStrictEqual(Object.keys(lab.weeks), ["2026-10-12"]);
  assert.deepStrictEqual(Object.keys(lab.weeks["2026-10-12"].days), ["2"]);
  assert.strictEqual(lab.sessions.length, 1);
  assert.strictEqual(lab.current, null);
});

test("Discipline vere: 7 stili, 6 livelli, dosi e preparatori validi", () => {
  if (!REAL) { console.log("  (martial-data.js non ancora presente: salto)"); return; }
  assert.deepStrictEqual(REAL.map((d) => d.id).sort(), [...IDS].sort());
  const seen = new Set();
  REAL.forEach((d) => {
    assert.ok(d.name && d.tagline && d.intro && d.mottos.length === 3 && d.color, `${d.id}: testi`);
    assert.strictEqual(d.levels.length, 6, `${d.id}: livelli`);
    d.levels.forEach((lv, li) => {
      assert.strictEqual(lv.level, li + 1);
      assert.ok(lv.exercises.length >= 5 && lv.exercises.length <= 6, `${d.id} L${li + 1}: esercizi`);
      const ids = lv.exercises.map((e) => e.id);
      lv.exercises.forEach((e, ei) => {
        assert.ok(!seen.has(e.id), `duplicato ${e.id}`);
        seen.add(e.id);
        assert.ok(e.name && e.how && e.success && e.video, `${e.id}: testi`);
        assert.ok(e.steps.length >= 2 && e.cues.length >= 1, `${e.id}: passi`);
        const ds = e.dose;
        assert.ok(ds.sets >= 1 && (ds.reps != null) !== (ds.work != null), `${e.id}: dose`);
        if (e.prepFor) assert.ok(ids.indexOf(e.prepFor) > ei, `${e.id}: prepFor`);
      });
      const min = M.levelMinutes(lv);
      assert.ok(min >= 15 && min <= 75, `${d.id} L${li + 1}: ${min} minuti`);
    });
  });
});

console.log(`${passed} test superati${failed.length ? `, ${failed.length} falliti` : ""}`);
process.exit(failed.length ? 1 : 0);
