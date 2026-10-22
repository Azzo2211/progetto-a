/*
 * Test dell'influenza: dati (tattiche, trattative, capitoli, esercizi), simulatore di trattativa
 * (limite nascosto mai superato, ancora, insulti, etichette, bluff, niente accordo quando lo spazio
 * non c'e', calcolo del valore catturato, strategia brava meglio di quella ingenua), schede a
 * ripasso distanziato, riconoscimento, casi, programma del giorno, profilo e stato rovinato.
 *
 *   node tests/influence.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const dir = path.join(__dirname, "..", "influence");
const TAC = require(path.join(dir, "tactics.js"));
const DEAL = require(path.join(dir, "deals.js"));
const DR = require(path.join(dir, "drills.js"));
const DATA = require(path.join(dir, "data.js"));
const E = require(path.join(dir, "engine.js"));

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
const seller = (d) => d.role === "seller";

test("Tattiche: quattro famiglie, ognuna con definizione e contromossa", () => {
  const ids = Object.keys(TAC.TACTICS);
  assert.ok(ids.length >= 30);
  ids.forEach((id) => {
    const t = TAC.TACTICS[id];
    assert.ok(TAC.FAMILIES[t.family], `${id}: famiglia`);
    assert.ok(t.label && t.def.length > 30 && t.counter.length > 20, `${id}: testi`);
  });
  Object.keys(TAC.FAMILIES).forEach((f) => assert.ok(ids.filter((id) => TAC.TACTICS[id].family === f).length >= 4, f));
});

test("Trattative: dati coerenti (criteri, una sola etichetta giusta, secondo punto, limiti nel mercato)", () => {
  assert.ok(DEAL.DEALS.length >= 6);
  DEAL.DEALS.forEach((d) => {
    assert.ok(["seller", "buyer"].includes(d.role), d.id);
    assert.ok(d.market.low < d.market.high, d.id);
    assert.strictEqual(d.labels.filter((l) => l.ok).length, 1, `${d.id}: una etichetta giusta`);
    assert.strictEqual(d.issue.options[0].you, 0);
    assert.strictEqual(d.issue.options[0].them, 0);
    assert.ok(d.issue.options.some((o) => o.you + o.them > 0), `${d.id}: c'è valore da creare`);
    assert.ok(d.criteria.length >= 2);
    assert.ok(d.res[0] < d.res[1]);
    // il limite della controparte sta (quasi) dentro il mercato e la tua alternativa e' peggiore
    assert.ok(d.res[0] >= d.market.low * 0.95 && d.res[1] <= d.market.high * 1.05, `${d.id}: limiti nel mercato`);
    if (seller(d)) assert.ok(d.you.batna < d.res[0], `${d.id}: alternativa sotto il loro limite`);
    else assert.ok(d.you.batna > d.res[1], `${d.id}: alternativa sopra il loro limite`);
  });
  const levels = DEAL.COUNTERPARTS.map((c) => c.level);
  assert.deepStrictEqual(levels, [1, 2, 3, 4, 5]);
});

test("Capitoli ed esercizi: sezioni, fonti, famiglie valide", () => {
  assert.ok(DATA.CHAPTERS.length >= 6);
  DATA.CHAPTERS.forEach((c) => {
    assert.ok(c.title && c.lead && c.sections.length >= 3, c.id);
    (c.families || []).forEach((f) => assert.ok(TAC.FAMILIES[f], `${c.id}: famiglia ${f}`));
    c.sections.forEach((s) => assert.ok(s.title && (s.body || []).length, `${c.id}: ${s.title}`));
  });
  assert.ok(DR.SPOT.length >= 60, "esercizi di riconoscimento");
  assert.ok(DR.CASES.length >= 20, "casi");
  DR.SPOT.forEach((x) => {
    assert.ok(TAC.TACTICS[x.answer] && TAC.TACTICS[x.answer].family === x.family, x.id);
    assert.strictEqual(new Set([x.answer, ...x.alt]).size, 4, `${x.id}: 4 opzioni diverse`);
  });
});

test("Nuova partita: deterministica con lo stesso seme, limite nascosto nell'intervallo, apertura peggiore del limite", () => {
  const a = E.newGame({ dealId: "gres", level: 1, seed: 42, noZopa: false });
  const b = E.newGame({ dealId: "gres", level: 1, seed: 42, noZopa: false });
  assert.deepStrictEqual(a, b);
  const d = E.dealById("gres");
  for (let s = 1; s < 60; s += 1) {
    const g = E.newGame({ dealId: "gres", level: 3, seed: s, noZopa: false });
    assert.ok(g.R >= d.res[0] - d.step && g.R <= d.res[1] + d.step, `R ${g.R}`);
    assert.ok(g.O < g.R, "chi compra apre sotto il suo limite");
    const m = E.newGame({ dealId: "magazzino", level: 3, seed: s, noZopa: false });
    assert.ok(m.O > m.R, "chi vende apre sopra il suo limite");
  }
});

test("Accettare la prima offerta lascia quasi tutto sul tavolo", () => {
  let sum = 0;
  for (let s = 1; s <= 40; s += 1) {
    const g = E.newGame({ level: 1, seed: s * 13, noZopa: false });
    E.start(g, "them");
    E.act(g, { type: "accept" });
    const r = E.result(g);
    assert.ok(r.deal);
    sum += r.pct;
    assert.ok(r.lessons.some((x) => /prima offerta/.test(x.text)));
  }
  assert.ok(sum / 40 < 25, `media ${sum / 40}`);
});

test("La controparte non accetta mai oltre il suo limite, nemmeno all'ultimo turno", () => {
  for (let s = 1; s <= 30; s += 1) {
    const g = E.newGame({ dealId: "gres", level: 2, seed: s, noZopa: false });
    E.start(g, "them");
    const over = g.R + 500; // oltre il limite (senza secondo punto)
    let k = 0;
    while (!g.done && k < 20) { k += 1; E.act(g, { type: "offer", price: over }); }
    assert.ok(g.done);
    assert.ok(!g.outcome.deal || g.outcome.price <= g.R, `accordo a ${g.outcome.price} oltre ${g.R}`);
  }
});

test("All'ultimo turno accettano un'offerta dentro il loro limite", () => {
  let deals = 0;
  for (let s = 1; s <= 30; s += 1) {
    const g = E.newGame({ dealId: "parquet", level: 3, seed: s, noZopa: false });
    E.start(g, "them");
    let k = 0;
    while (!g.done && k < 20) { k += 1; E.act(g, { type: "offer", price: g.R }); }
    if (g.outcome.deal) deals += 1;
  }
  assert.ok(deals >= 27, `accordi ${deals}/30`);
});

test("Offerte fuori mercato: insulto, fiducia giù, poi se ne vanno", () => {
  const g = E.newGame({ dealId: "gres", level: 1, seed: 7, noZopa: false });
  E.start(g, "them");
  E.act(g, { type: "offer", price: 60000 });
  assert.ok(!g.done);
  assert.strictEqual(g.strikes, 1);
  assert.ok(g.trust < 0.5);
  E.act(g, { type: "offer", price: 60000 });
  E.act(g, { type: "offer", price: 60000 });
  assert.ok(g.done);
  assert.strictEqual(g.outcome.by, "insult");
  const r = E.result(g);
  assert.strictEqual(r.pct, 0);
  assert.strictEqual(r.grade, "Accordo mancato");
});

test("Etichetta giusta: interesse scoperto e fiducia su; sbagliata: niente", () => {
  const d = E.dealById("fornitore");
  const g = E.newGame({ dealId: "fornitore", level: 2, seed: 3, noZopa: false });
  E.start(g, "them");
  const wrong = d.labels.findIndex((l) => !l.ok);
  E.act(g, { type: "label", index: wrong });
  assert.ok(!g.revealed);
  E.act(g, { type: "label", index: d.labels.findIndex((l) => l.ok) });
  assert.ok(g.revealed);
  assert.ok(g.trust > 0.55);
  assert.ok(g.log.some((x) => x.tone === "reveal"));
});

test("Il secondo punto crea valore: con l'opzione giusta il loro limite sale", () => {
  const g = E.newGame({ dealId: "gres", level: 1, seed: 11, noZopa: false });
  const d = E.dealById("gres");
  E.start(g, "you");
  // offerta al loro limite con il pagamento a 90 giorni: sotto il limite effettivo, accettata all'ultimo
  const target = g.R + d.issue.options[2].them - 100;
  let k = 0;
  while (!g.done && k < 20) { k += 1; E.act(g, { type: "offer", price: target, opt: 2 }); }
  assert.ok(g.outcome.deal, "accordo");
  const r = E.result(g);
  assert.ok(r.price > g.R, "prezzo oltre il loro limite «alla consegna»");
  assert.ok(r.pct >= 85, `valore ${r.pct}`);
});

test("Niente spazio d'accordo: alzarsi vale il 100%, chiudere vale 0", () => {
  const g = E.newGame({ dealId: "container", level: 1, seed: 5, noZopa: true });
  const r0 = E.result({ ...g, outcome: { deal: false } });
  assert.ok(!r0.zopa);
  E.start(g, "them");
  E.act(g, { type: "walk" });
  const r = E.result(g);
  assert.strictEqual(r.pct, 100);
  assert.ok(r.passed);
  const h = E.newGame({ dealId: "container", level: 1, seed: 5, noZopa: true });
  E.start(h, "them");
  E.act(h, { type: "accept" });
  const rh = E.result(h);
  assert.strictEqual(rh.pct, 0);
  assert.ok(rh.worse && !rh.passed);
});

test("Calcolo del valore catturato", () => {
  const g = E.newGame({ dealId: "gres", level: 1, seed: 9, noZopa: false });
  const d = E.dealById("gres");
  g.done = true;
  g.outcome = { deal: true, price: d.you.batna, opt: 0, by: "you" };
  assert.strictEqual(E.result(g).pct, 0);
  const best = Math.max(...d.issue.options.map((o) => g.R + o.them + o.you));
  const k = d.issue.options.findIndex((o) => g.R + o.them + o.you === best);
  g.outcome = { deal: true, price: g.R + d.issue.options[k].them, opt: k, by: "you" };
  assert.strictEqual(E.result(g).pct, 100);
  g.outcome = { deal: true, price: (d.you.batna + g.R) / 2, opt: 0, by: "you" };
  const r = E.result(g);
  assert.ok(r.pct > 30 && r.pct < 50, `meta' senza secondo punto: ${r.pct}`);
});

test("Bluff sulla tua alternativa: a volte scoperto (fiducia giù), oltre il loro limite smettono di concedere", () => {
  let caught = 0;
  let beyond = 0;
  for (let s = 1; s <= 60; s += 1) {
    const g = E.newGame({ dealId: "gres", level: 2, seed: s, noZopa: false });
    E.start(g, "them");
    E.act(g, { type: "offer", price: 25500 });
    if (g.done) continue;
    const t0 = g.trust;
    E.act(g, { type: "batna", claim: 26000 });
    if (g.youBluffed && g.youBluffed.caught) { caught += 1; assert.ok(g.trust < t0); }
    else if (g.youBluffed && g.youBluffed.beyond) beyond += 1;
  }
  assert.ok(caught > 5, `scoperti ${caught}`);
  assert.ok(beyond > 5, `oltre il limite ${beyond}`);
});

test("La verità sull'alternativa quando la loro offerta e' peggiore: rilanciano per batterla", () => {
  const g = E.newGame({ dealId: "parquet", level: 2, seed: 21, noZopa: false });
  const d = E.dealById("parquet");
  E.start(g, "them");
  if (g.theirPrice < d.you.batna) {
    E.act(g, { type: "batna" });
    assert.ok(g.theirPrice > d.you.batna, `${g.theirPrice}`);
  }
});

test("Una strategia brava batte quella ingenua e quella che accetta subito", () => {
  const extreme = (d) => (seller(d) ? d.market.high : d.market.low);
  function naive(g) {
    const d = E.dealById(g.dealId);
    E.start(g, "them");
    let mine = Math.round(extreme(d) / 1000) * 1000;
    E.act(g, { type: "offer", price: mine });
    while (!g.done) {
      if (Math.abs(g.theirPrice - mine) <= d.step * 2) { E.act(g, { type: "accept" }); break; }
      mine = Math.round((mine + g.theirPrice) / 2 / d.step) * d.step;
      E.act(g, { type: "offer", price: mine });
    }
  }
  function skilled(g) {
    const d = E.dealById(g.dealId);
    const s = g.s;
    const crit = d.criteria.filter((c) => s * c.value <= s * extreme(d)).sort((a, b) => s * b.value - s * a.value)[0];
    let mine = crit.value - s * 130;
    E.start(g, "you");
    E.act(g, { type: "offer", price: mine, criterion: crit.id });
    if (g.done) return;
    E.act(g, { type: "label", index: d.labels.findIndex((l) => l.ok) });
    const opt = d.issue.options.map((o, i) => ({ i, j: o.you + o.them })).sort((a, b) => b.j - a.j)[0].i;
    const half = (d.market.high - d.market.low) / 2;
    const fr = [0.14, 0.09, 0.06, 0.04, 0.03, 0.02];
    let i = 0;
    while (!g.done) {
      if (Math.abs(mine - g.theirPrice) <= d.step) { E.act(g, { type: "accept" }); break; }
      if (g.hurried) {
        E.act(g, { type: "ultimatum", price: Math.round((mine - (mine - g.theirPrice) * 0.3) / d.step) * d.step, opt });
        if (!g.done) E.act(g, { type: E.youValue(g, g.theirPrice, g.tableOpt) >= s * d.you.batna ? "accept" : "walk" });
        break;
      }
      mine = Math.round((mine - s * Math.min(Math.abs(mine - g.theirPrice) * 0.5, half * (fr[i] || 0.02))) / d.step) * d.step;
      i += 1;
      E.act(g, { type: "offer", price: mine, opt });
    }
  }
  [1, 2, 3].forEach((level) => {
    const avg = (fn) => {
      let sum = 0;
      for (let s = 1; s <= 80; s += 1) {
        const g = E.newGame({ level, seed: 5000 + s * 31 + level, noZopa: false });
        fn(g);
        sum += E.result(g).pct;
      }
      return sum / 80;
    };
    const a = avg(skilled);
    const b = avg(naive);
    const c = avg((g) => { E.start(g, "them"); E.act(g, { type: "accept" }); });
    assert.ok(a > b + 10, `livello ${level}: brava ${a} vs ingenua ${b}`);
    assert.ok(b > c, `livello ${level}: ingenua ${b} vs accetta subito ${c}`);
  });
});

test("Livelli: si sblocca il successivo con il 60%, si sceglie solo tra quelli sbloccati", () => {
  const lab = E.ensure(null);
  const g = E.newGame({ dealId: "gres", level: 1, seed: 9, noZopa: false });
  g.done = true;
  g.outcome = { deal: true, price: g.R, opt: 0, by: "you" };
  const r = E.recordGame(lab, g, T0);
  assert.ok(r.pct >= 60);
  assert.ok(r.unlocked);
  assert.strictEqual(lab.nego.unlocked, 2);
  assert.strictEqual(E.setNegoLevel(lab, 5), 2);
  assert.strictEqual(lab.nego.history.length, 1);
});

test("Schede: 6 nuove al giorno (prima le definizioni), sbagliate tornano tra 10 minuti, imparate dopo 3 giuste", () => {
  const lab = E.ensure(null);
  let q = E.cardQueue(lab, T0);
  assert.strictEqual(q.fresh.length, 6);
  assert.ok(q.fresh.every((id) => id.endsWith(":def")));
  q.fresh.forEach((id) => E.cardAnswer(lab, id, true, T0));
  assert.strictEqual(E.cardQueue(lab, T0 + 60000).fresh.length, 0, "niente altre nuove oggi");
  const tomorrow = E.cardQueue(lab, T0 + DAY);
  assert.strictEqual(tomorrow.due.length, 6);
  assert.ok(tomorrow.fresh.some((id) => id.endsWith(":counter")), "le contromosse arrivano dopo la definizione");
  const id = q.fresh[0];
  E.cardAnswer(lab, id, false, T0 + DAY);
  assert.ok(lab.cards[id].due <= T0 + DAY + 11 * 60000);
  [2, 4, 8].forEach((d) => E.cardAnswer(lab, id, true, T0 + d * DAY));
  assert.ok(E.cardsLearned(lab) >= 1);
  const cq = E.cardQuestion("ancora:def", 1);
  assert.strictEqual(cq.options.length, 4);
  assert.ok(cq.options.some((o) => o.value === "ancora"));
  assert.ok(cq.options.every((o) => E.TACTICS[o.value].family === "cornice"));
});

test("Riconosci la leva: 10 esercizi, le sbagliate tornano per prime, riepilogo", () => {
  const lab = E.ensure(null);
  const r = E.makeSpotRound(lab, { seed: 1 }, T0);
  assert.strictEqual(r.items.length, 10);
  assert.ok(r.items.every((x) => ["leva", "cornice", "nego"].includes(E.spotItem(x.id).family)));
  const first = E.spotItem(r.items[0].id);
  E.spotAnswer(lab, r, first.alt[0], 3000, T0);
  for (let i = 1; i < 10; i += 1) E.spotAnswer(lab, r, E.spotItem(r.items[i].id).answer, 2000, T0);
  assert.ok(r.done);
  assert.deepStrictEqual(E.spotSummary(r), { right: 9, total: 10, pct: 90 });
  const r2 = E.makeSpotRound(lab, { seed: 2 }, T0 + 1000);
  assert.strictEqual(r2.items[0].id, first.id, "la sbagliata torna subito");
  const m = E.makeSpotRound(lab, { families: ["manip"], seed: 3 }, T0);
  assert.ok(m.items.every((x) => E.spotItem(x.id).family === "manip"));
});

test("Casi: la mossa migliore vale 100, punteggio come da formula", () => {
  const c = E.CASES[0];
  const scores = c.options.map(E.optionScore);
  const best = scores.indexOf(Math.max(...scores));
  assert.strictEqual(E.scoreCase(c, best).pts, 100);
  const o = c.options[0];
  assert.strictEqual(E.optionScore(o), Math.round(0.5 * o.eff + 0.3 * o.rel + 0.2 * (100 - o.risk)));
  const lab = E.ensure(null);
  const picks = E.pickCases(lab, { n: 2, seed: 4 }, T0);
  assert.strictEqual(picks.length, 2);
  assert.strictEqual(picks[0].order.length, 4);
  E.recordCase(lab, picks[0].id, 0, T0);
  assert.strictEqual(lab.cases.history.length, 1);
  assert.notStrictEqual(E.pickCases(lab, { n: 1, seed: 5 }, T0)[0].id, picks[0].id, "prima i casi non visti");
});

test("Programma del giorno: prima il manuale, poi schede, riconoscimento e la rotazione", () => {
  const lab = E.ensure(null);
  let steps = E.plan(lab, T0);
  assert.strictEqual(steps[0].id, "read");
  E.markRead(lab, E.CHAPTERS[0].id, T0);
  steps = E.plan(lab, T0);
  assert.deepStrictEqual(steps.slice(0, 2).map((s) => s.id), ["cards", "spot"]);
  const rot = E.ROTATION[new Date(T0).getDay()];
  assert.ok(steps[2].id.startsWith(rot === "read" ? "read" : rot), `${rot} ${steps[2].id}`);
  assert.ok(E.streak(lab, T0) >= 1);
});

test("Profilo: 6 categorie da 0 a 100; senza dati partono da 35", () => {
  const lab = E.ensure(null);
  const p = E.profile(lab, T0);
  assert.strictEqual(p.length, 6);
  p.forEach((k) => assert.ok(k.value >= 0 && k.value <= 100, k.label));
  assert.deepStrictEqual(p.slice(0, 4).map((k) => k.value), [35, 35, 35, 35]);
  assert.ok(typeof E.trend(lab, T0) === "string");
});

test("Stato rovinato o vecchio: sistemato senza errori; partita in corso tenuta solo se valida", () => {
  const good = E.newGame({ dealId: "auto", level: 1, seed: 2, noZopa: false });
  const lab = E.ensure({ version: 1, cards: { "ancora:def": { box: 9, due: T0 }, "boh:def": { box: 1, due: 1 } }, spot: { items: { s001: { box: 1, due: T0 } }, history: [{ t: T0, id: "s001", ok: true }, { t: "x" }] }, cases: { history: [{ t: T0, id: "c01", pts: 80 }, null] }, nego: { history: [{ t: T0, pct: 70, level: 1 }, { t: T0 }], unlocked: 9, level: 4, current: good }, read: { leve: T0, x: "no" }, days: ["2026-10-01", "ieri"], log: [{ t: T0, kind: "x" }, 5] });
  assert.deepStrictEqual(Object.keys(lab.cards), ["ancora:def"]);
  assert.strictEqual(lab.cards["ancora:def"].box, E.CARD_INTERVALS.length - 1);
  assert.strictEqual(lab.spot.history.length, 1);
  assert.strictEqual(lab.cases.history.length, 1);
  assert.strictEqual(lab.nego.history.length, 1);
  assert.strictEqual(lab.nego.unlocked, E.MAX_LEVEL);
  assert.ok(lab.nego.current && lab.nego.current.dealId === "auto");
  assert.deepStrictEqual(Object.keys(lab.read), ["leve"]);
  assert.deepStrictEqual(lab.days, ["2026-10-01"]);
  assert.strictEqual(lab.log.length, 1);
  assert.strictEqual(E.ensure({ version: 1, nego: { current: { v: 1, dealId: "nessuno" } } }).nego.current, null);
  assert.strictEqual(E.ensure("rotto").version, 1);
  assert.strictEqual(E.ensure({ version: 0, cards: { "ancora:def": { box: 1, due: 1 } } }).cards["ancora:def"], undefined, "versione diversa: si riparte");
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exit(1);
