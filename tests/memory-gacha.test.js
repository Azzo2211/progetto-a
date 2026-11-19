/*
 * Test del personaggio e degli scrigni (memory/gacha.js, memory/art.js e i premi in memory/game.js):
 * catalogo, probabilita', garanzie, doppioni e forgia, equipaggiamento, regalo di benvenuto,
 * cristalli e scrigni solo allenandosi, forme del personaggio, disegni validi, stato rovinato.
 *
 *   node tests/memory-gacha.test.js
 */
const assert = require("assert");
const path = require("path");

globalThis.window = globalThis;
const GA = require(path.join(__dirname, "..", "memory", "gacha.js"));
const A = require(path.join(__dirname, "..", "memory", "art.js"));
const E = require(path.join(__dirname, "..", "memory", "engine.js"));
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
const always = (v) => () => v;

test("Catalogo: 64 oggetti da trovare, id unici, rarità e categorie, probabilità che fanno 100%", () => {
  assert.strictEqual(GA.POOL.length, 64);
  assert.strictEqual(new Set(GA.CATALOG.map((i) => i.id)).size, GA.CATALOG.length);
  const sum = GA.RARITIES.reduce((s, r) => s + r.odds, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9, `${sum}`);
  const by = (r) => GA.POOL.filter((i) => i.r === r).length;
  assert.deepStrictEqual(["C", "R", "E", "L", "M"].map(by), [18, 16, 14, 10, 6]);
  GA.CATS.forEach((c) => assert.ok(GA.POOL.some((i) => i.cat === c.id), c.id));
  GA.CATALOG.forEach((it) => {
    assert.ok(it.name && it.lore && it.lore.length > 15 && it.art, it.id);
    assert.ok(GA.RAR[it.r] && GA.CATS.some((c) => c.id === it.cat), it.id);
  });
  assert.ok(GA.CATALOG.filter((i) => i.start).every((i) => !GA.POOL.includes(i)), "quelli iniziali non sono negli scrigni");
  // ogni categoria ha almeno un mitico
  GA.CATS.forEach((c) => assert.ok(GA.POOL.some((i) => i.cat === c.id && i.r === "M"), `mitico: ${c.id}`));
});

test("Regalo di benvenuto la prima volta, poi niente regali", () => {
  const ch = GA.ensureChar(null);
  assert.strictEqual(ch.crystals, GA.PULL_COST);
  assert.strictEqual(ch.chests.piano, 1);
  assert.deepStrictEqual(ch.equip, GA.STARTER);
  ch.crystals = 0;
  ch.chests.piano = 0;
  const again = GA.ensureChar(JSON.parse(JSON.stringify(ch)));
  assert.strictEqual(again.crystals, 0);
  assert.strictEqual(again.chests.piano, 0);
  assert.strictEqual(again.name, "Mnemonista");
});

test("Evocazioni: costo, cristalli che mancano, dieci con almeno un epico", () => {
  const ch = GA.ensureChar({});
  assert.strictEqual(GA.summon(ch, 1, Math.random, T0), null, "senza cristalli niente");
  GA.award(ch, 1000);
  const one = GA.summon(ch, 1, GA.rng(1), T0);
  assert.strictEqual(one.length, 1);
  assert.strictEqual(ch.crystals, 900);
  const ten = GA.summon(ch, 10, always(0), T0);
  assert.strictEqual(ten.length, 10);
  assert.strictEqual(ch.crystals, 0);
  assert.ok(ten.some((x) => GA.RANK[x.r] >= GA.RANK.E), "almeno un epico");
  assert.strictEqual(GA.summon(ch, 3, Math.random, T0), null, "solo 1 o 10");
  assert.strictEqual(ch.pulls, 11);
});

test("Garanzie: un epico ogni 10, un leggendario ogni 60 anche con la sfortuna peggiore", () => {
  const ch = GA.ensureChar({});
  const unlucky = always(0); // ogni tiro e' il piu' basso possibile
  const got = [];
  for (let i = 0; i < 60; i += 1) got.push(GA.pullOne(ch, unlucky, 0, T0).r);
  got.forEach((r, i) => {
    if ((i + 1) % 10 === 0 && i + 1 !== 60) assert.strictEqual(r, "E", `evocazione ${i + 1}`);
    else if (i + 1 === 60) assert.strictEqual(r, "L", "la sessantesima");
    else assert.strictEqual(r, "C", `evocazione ${i + 1}`);
  });
  assert.deepStrictEqual(ch.pity, { e: 0, l: 0 });
});

test("Probabilità reali vicine a quelle scritte (con le garanzie che aiutano un po')", () => {
  const ch = GA.ensureChar({});
  const rand = GA.rng(2026);
  const n = 20000;
  const count = { C: 0, R: 0, E: 0, L: 0, M: 0 };
  for (let i = 0; i < n; i += 1) count[GA.pullOne(ch, rand, 0, T0).r] += 1;
  const share = (k) => count[k] / n;
  assert.ok(share("C") > 0.48 && share("C") < 0.56, `C ${share("C")}`);
  assert.ok(share("R") > 0.26 && share("R") < 0.32, `R ${share("R")}`);
  assert.ok(share("E") > 0.11 && share("E") < 0.17, `E ${share("E")}`);
  assert.ok(share("L") > 0.03 && share("L") < 0.06, `L ${share("L")}`);
  assert.ok(share("M") > 0.002 && share("M") < 0.012, `M ${share("M")}`);
});

test("Scrigni: del piano, d'oro (almeno raro), del guardiano (almeno epico)", () => {
  const ch = GA.ensureChar({});
  assert.strictEqual(GA.openChest(ch, "oro", always(0), T0), null);
  GA.addChest(ch, "piano");
  GA.addChest(ch, "oro");
  GA.addChest(ch, "guardiano");
  assert.strictEqual(GA.chestsTotal(ch), 3);
  assert.strictEqual(GA.openChest(ch, "piano", always(0), T0)[0].r, "C");
  assert.strictEqual(GA.openChest(ch, "oro", always(0), T0)[0].r, "R");
  assert.strictEqual(GA.openChest(ch, "guardiano", always(0), T0)[0].r, "E");
  assert.strictEqual(GA.chestsTotal(ch), 0);
  assert.strictEqual(GA.openChest(ch, "boh", always(0), T0), null);
});

test("Doppioni in polvere di stelle, forgia dell'oggetto che vuoi", () => {
  const ch = GA.ensureChar({});
  const first = GA.pullOne(ch, always(0), 0, T0);
  assert.strictEqual(first.dup, false);
  const dup = GA.pullOne(ch, always(0), 0, T0);
  assert.strictEqual(dup.id, first.id);
  assert.strictEqual(dup.dup, true);
  assert.strictEqual(ch.dust, GA.RAR.C.dust);
  const target = GA.POOL.find((i) => i.r === "R");
  assert.strictEqual(GA.craft(ch, target.id), false, "polvere insufficiente");
  ch.dust = GA.craftCost(target.id);
  assert.ok(GA.craft(ch, target.id));
  assert.strictEqual(ch.dust, 0);
  assert.ok(GA.owns(ch, target.id));
  ch.dust = 10000;
  assert.strictEqual(GA.craft(ch, target.id), false, "ce l'hai già");
  assert.strictEqual(GA.craft(ch, "cloak0"), false, "quello iniziale non si forgia");
  // forgiare costa almeno 8 doppioni della stessa rarità: gli scrigni restano la via principale
  assert.deepStrictEqual(GA.RARITIES.map((r) => r.craft >= r.dust * 8), [true, true, true, true, true]);
});

test("Equipaggiamento: solo quello che hai, nello spazio giusto; aura, emblema e compagno si possono togliere", () => {
  const ch = GA.ensureChar({});
  assert.strictEqual(GA.equip(ch, "pet", "pet12"), false, "non ce l'hai");
  ch.items.pet12 = 1;
  assert.strictEqual(GA.equip(ch, "aura", "pet12"), false, "spazio sbagliato");
  assert.ok(GA.equip(ch, "pet", "pet12"));
  assert.strictEqual(ch.equip.pet, "pet12");
  assert.ok(GA.equip(ch, "pet", null));
  assert.strictEqual(GA.equip(ch, "cloak", null), false, "il mantello serve sempre");
  assert.strictEqual(GA.equip(ch, "boh", "pet12"), false);
  ch.equip.pet = "pet12";
  const back = GA.ensureChar({ ...JSON.parse(JSON.stringify(ch)), items: {} });
  assert.strictEqual(back.equip.pet, null, "se non ce l'hai più, torna vuoto");
});

test("Collezione e novità", () => {
  const ch = GA.ensureChar({});
  ch.items.pet1 = 1;
  ch.items.rel12 = 2;
  const col = GA.collection(ch);
  assert.strictEqual(col.total, 64);
  assert.strictEqual(col.owned, 2);
  assert.strictEqual(col.byCat.pet.owned, 1);
  assert.deepStrictEqual(GA.unseen(ch).sort(), ["pet1", "rel12"]);
  GA.markSeen(ch, ["pet1"], T0);
  assert.deepStrictEqual(GA.unseen(ch), ["rel12"]);
});

test("Forme: si sbloccano con i livelli", () => {
  assert.deepStrictEqual([1, 4, 5, 9, 10, 19, 20, 29, 30, 40, 99].map((l) => GA.formOf(l).n), [1, 1, 2, 2, 3, 4, 5, 5, 6, 7, 7]);
  assert.strictEqual(GA.nextForm(3).level, 5);
  assert.strictEqual(GA.nextForm(40), null);
});

test("Cristalli e scrigni solo allenandosi: piano, stelle, livelli, scrigno d'oro, guardiano, missioni, record", () => {
  const lab = E.ensure(null);
  const ch = lab.game.char;
  assert.ok(ch && ch.crystals === GA.PULL_COST && ch.chests.piano === 1, "regalo di benvenuto");
  ch.crystals = 0;
  ch.chests.piano = 0;
  // livelli: +50 cristalli a livello, scrigno d'oro al 5
  G.gain(lab, G.levelOf(0).to, T0);
  assert.strictEqual(ch.crystals, G.GEMS.level);
  G.gain(lab, 1000, T0 + 1);
  assert.strictEqual(G.levelOf(lab.game.xp).level, 5);
  assert.strictEqual(ch.chests.oro, 1);
  assert.strictEqual(ch.form, 2, "forma Viandante al livello 5");
  assert.ok(lab.game.events.some((e) => e.type === "form"));
  const c0 = ch.crystals;
  // piano completato: cristalli e scrigno
  E.courseStart(lab, T0);
  G.setStar(lab, 1, "c", T0 + 2);
  assert.strictEqual(ch.chests.piano, 1);
  assert.ok(ch.crystals >= c0 + G.GEMS.day);
  // guardiano: cristalli e scrigno del guardiano
  const c1 = ch.crystals;
  G.setStar(lab, 7, "s", T0 + 3);
  assert.strictEqual(ch.chests.guardiano, 1);
  assert.ok(ch.crystals >= c1 + G.GEMS.boss);
  // missioni
  const k = E.dayKey(T0);
  lab.game.missions[k] = { list: [{ id: "minutes", target: 30 }], done: {}, all: null };
  G.addActiveTime(lab, 31 * 60, T0);
  const c2 = ch.crystals;
  G.status(lab, T0 + 4, true);
  assert.ok(ch.crystals >= c2 + G.GEMS.mission + G.GEMS.allMissions);
  // record in una disciplina a livelli
  const c3 = ch.crystals;
  const r = E.makeRound("numbers", 1, 5, lab);
  E.recordRound(lab, r, E.scoreRound(r, r.items.map(String)), { now: T0 + 5 });
  assert.ok(ch.crystals >= c3 + G.GEMS.record);
  // un ripasso da solo non da' cristalli (solo punti)
  const c4 = ch.crystals;
  const d = E.addDeck(lab, { name: "S", kind: "qa", now: T0 });
  E.addCard(lab, d.id, { f: "a", b: "b", now: T0 });
  E.answerCard(lab, E.deckQueue(lab, T0).fresh[0], 3, T0 + 6);
  assert.strictEqual(ch.crystals, c4);
  const st = G.status(lab, T0 + 7, false);
  assert.ok(st.char && st.char.chests >= 2 && st.char.form.n === 2);
});

test("Disegni: ogni oggetto, ogni forma e gli scrigni sono SVG validi e diversi", () => {
  const bad = /undefined|NaN|null/;
  const seen = new Set();
  GA.CATALOG.forEach((it) => {
    const s = A.item(it);
    assert.ok(/^<svg[\s\S]*<\/svg>$/.test(s), it.id);
    assert.ok(!bad.test(s), `${it.id}: ${s.match(bad)}`);
    seen.add(s.replace(/ma[0-9a-z]+/g, "x"));
  });
  assert.strictEqual(seen.size, GA.CATALOG.length, "ogni oggetto ha il suo disegno");
  const ch = GA.ensureChar({ items: Object.fromEntries(GA.POOL.map((i) => [i.id, 1])) });
  ["cloak12", "aura8", "em12", "pet12", "bg8"].forEach((id, i) => GA.equip(ch, GA.SLOTS[i].id, id));
  GA.FORMS.forEach((f) => {
    const s = A.avatar(ch, f.level);
    assert.ok(/^<svg/.test(s) && !bad.test(s), `forma ${f.name}`);
  });
  const a1 = A.avatar(ch, 40);
  const a2 = A.avatar(ch, 40);
  const ids = (s) => [...s.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids(a1).every((x) => !ids(a2).includes(x)), "id diversi tra due disegni sulla stessa pagina");
  ["piano", "oro", "guardiano"].forEach((k) => assert.ok(/^<svg/.test(A.chest(k))));
  assert.ok(/^<svg/.test(A.crystal()));
});

test("Chi si allenava già prima del personaggio riceve i premi arretrati, una volta sola", () => {
  const lv6 = (() => { let x = 0; while (G.levelOf(x).level < 6) x += 10; return x; })();
  const old = { version: 1, game: { xp: lv6, stars: { 1: { c: T0, p: T0 }, 2: { c: T0, s: T0 }, 7: { s: T0 } }, seals: { 7: T0 } } };
  const lab = E.ensure(JSON.parse(JSON.stringify(old)));
  const ch = lab.game.char;
  const gems = GA.PULL_COST + G.GEMS.level * 5 + G.GEMS.day * 2 + G.GEMS.precise + G.GEMS.challenge + G.GEMS.boss;
  assert.strictEqual(ch.crystals, gems);
  assert.deepStrictEqual(ch.chests, { piano: 3, oro: 1, guardiano: 1 });
  assert.strictEqual(ch.form, 2);
  assert.ok(lab.game.events.some((e) => /già fatto/.test(e.text)));
  const again = E.ensure(JSON.parse(JSON.stringify(lab)));
  assert.strictEqual(again.game.char.crystals, gems, "niente premi doppi");
  assert.deepStrictEqual(again.game.char.chests, { piano: 3, oro: 1, guardiano: 1 });
  // chi comincia da zero ha solo il regalo
  const zero = E.ensure(null);
  assert.strictEqual(zero.game.char.crystals, GA.PULL_COST);
  assert.ok(!zero.game.events.some((e) => /già fatto/.test(e.text)));
});

test("Stato rovinato del personaggio: sistemato senza errori", () => {
  const ch = GA.ensureChar({ name: "  ", crystals: -4, dust: "x", chests: { piano: 2.5, oro: 3, boh: 9 }, items: { pet1: 2, nulla: 4, cloak0: 3, pet2: -1 }, equip: { cloak: "pet1", aura: null, pet: "pet1", bg: "bg99" }, pity: { e: 99, l: -3 }, seen: { pet1: 5, x: 1 }, history: [{ id: "pet1", t: 1 }, { id: "boh" }], form: 12 });
  assert.strictEqual(ch.name, "Mnemonista");
  assert.deepStrictEqual([ch.crystals, ch.dust], [0, 0]);
  assert.deepStrictEqual(ch.chests, { piano: 0, oro: 3, guardiano: 0 });
  assert.deepStrictEqual(ch.items, { pet1: 2 });
  assert.deepStrictEqual(ch.equip, { cloak: "cloak0", aura: null, emblem: null, pet: "pet1", bg: "bg0" });
  assert.deepStrictEqual(ch.pity, { e: GA.PITY_E - 1, l: 0 });
  assert.deepStrictEqual(Object.keys(ch.seen), ["pet1"]);
  assert.strictEqual(ch.history.length, 1);
  assert.strictEqual(ch.form, GA.FORMS.length);
  const lab = E.ensure({ version: 1, game: { char: "rotto" } });
  assert.ok(lab.game.char && lab.game.char.crystals === GA.PULL_COST, "personaggio nuovo con il regalo");
});

console.log(`\n${passed} test superati, ${failed.length} falliti`);
if (failed.length) process.exitCode = 1;
