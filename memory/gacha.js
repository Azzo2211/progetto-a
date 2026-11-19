/*
 * Progetto A - Memoria: il personaggio e gli scrigni (senza DOM).
 *
 * Il personaggio sale di livello con i punti della Torre e cambia forma; si veste con quello che
 * trovi negli scrigni: mantelli, aure, emblemi, compagni, sfondi. Le reliquie sono carte da
 * collezione con un fatto vero della storia dell'arte della memoria.
 *
 * Cristalli e scrigni arrivano solo allenandosi (memory/game.js): piano completato, stelle,
 * guardiani, livelli, missioni, record. Probabilita' scritte, con le garanzie: un epico almeno
 * ogni 10 evocazioni, un leggendario almeno ogni 60. I doppioni diventano polvere di stelle, che
 * serve a forgiare l'oggetto che vuoi. Niente soldi veri: e' solo un gioco per allenarsi.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MemoryGacha = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const RARITIES = [
    { id: "C", label: "Comune", odds: 0.55, color: "#9aa7b8", dust: 5, craft: 60 },
    { id: "R", label: "Raro", odds: 0.3, color: "#4f8ef7", dust: 15, craft: 180 },
    { id: "E", label: "Epico", odds: 0.11, color: "#a35cf0", dust: 50, craft: 600 },
    { id: "L", label: "Leggendario", odds: 0.035, color: "#f2b53c", dust: 200, craft: 1800 },
    { id: "M", label: "Mitico", odds: 0.005, color: "#ff5f7e", dust: 600, craft: 5000 }
  ];
  const RAR = Object.fromEntries(RARITIES.map((r) => [r.id, r]));
  const RANK = { C: 0, R: 1, E: 2, L: 3, M: 4 };
  const SLOTS = [
    { id: "cloak", label: "Mantello", none: false },
    { id: "aura", label: "Aura", none: true },
    { id: "emblem", label: "Emblema", none: true },
    { id: "pet", label: "Compagno", none: true },
    { id: "bg", label: "Sfondo", none: false }
  ];
  const CATS = SLOTS.concat([{ id: "relic", label: "Reliquie", none: true }]);
  const PULL_COST = 100;
  const TEN_COST = 900;
  const PITY_E = 10;  // un epico (o meglio) almeno ogni 10 evocazioni
  const PITY_L = 60;  // un leggendario (o meglio) almeno ogni 60
  const CHESTS = {
    piano: { label: "Scrigno del piano", line: "Per ogni piano completato.", min: "C" },
    oro: { label: "Scrigno d'oro", line: "Ogni 5 livelli: almeno raro.", min: "R" },
    guardiano: { label: "Scrigno del guardiano", line: "Per ogni guardiano battuto: almeno epico.", min: "E" }
  };
  // forme del personaggio: arrivano con i livelli
  const FORMS = [
    { level: 1, name: "Ombra", line: "Il mantello e lo sguardo: si comincia." },
    { level: 5, name: "Viandante", line: "Il bordo del cappuccio si accende." },
    { level: 10, name: "Guardia", line: "Spallacci: i palazzi sono tuoi." },
    { level: 15, name: "Cavaliere", line: "La cintura con la gemma." },
    { level: 20, name: "Veggente", line: "Un cerchio di rune sotto i piedi." },
    { level: 30, name: "Alato", line: "Ali di luce." },
    { level: 40, name: "Incoronato", line: "L'aureola di chi ricorda tutto." }
  ];

  // Oggetti. r = rarita'; art = come si disegna (memory/art.js). Quelli con start: true li hai gia'.
  const I = (id, cat, r, name, lore, art, start = false) => ({ id, cat, r, name, lore, art, start });
  const CATALOG = [
    // mantelli
    I("cloak0", "cloak", "C", "Mantello dell'apprendista", "Il primo, quello di tutti: viola come la Torre.", { base: "#3b2f6b", lining: "#231c45", trim: null, pattern: "none" }, true),
    I("cloak1", "cloak", "C", "Mantello di lana", "Caldo e senza pretese: il primo passo conta più della stoffa.", { base: "#5b6270", lining: "#363b46", trim: null, pattern: "none" }),
    I("cloak2", "cloak", "C", "Mantello del viandante", "Per chi cammina ogni giorno nei suoi palazzi.", { base: "#6b4f3a", lining: "#3d2c20", trim: "#c79a5b", pattern: "none" }),
    I("cloak3", "cloak", "C", "Mantello notturno", "Blu come la notte che fissa i ricordi del giorno.", { base: "#1f2a4a", lining: "#121a30", trim: "#6f86c9", pattern: "none" }),
    I("cloak4", "cloak", "C", "Mantello del bosco", "Verde come i sentieri che conosci a occhi chiusi.", { base: "#2f5a45", lining: "#1b3a2b", trim: "#9cc58a", pattern: "none" }),
    I("cloak5", "cloak", "R", "Mantello cremisi", "Rosso e oro: si nota, e quello che si nota si ricorda.", { base: "#8c2035", lining: "#4c1120", trim: "#e6c777", pattern: "none" }),
    I("cloak6", "cloak", "R", "Mantello del mare", "Onde regolari, come i ripassi.", { base: "#1f6f78", lining: "#11444a", trim: "#9be3e8", pattern: "waves" }),
    I("cloak7", "cloak", "R", "Mantello d'argento", "Brilla appena, come una risposta sicura.", { base: "#8e97aa", lining: "#555d70", trim: "#ffffff", pattern: "stripes" }),
    I("cloak8", "cloak", "E", "Mantello delle costellazioni", "Ogni stella è un luogo: unite, fanno una mappa.", { base: "#1b2550", lining: "#0d1330", trim: "#f2c14e", pattern: "stars" }),
    I("cloak9", "cloak", "E", "Mantello delle rune", "Segni antichi che si accendono quando ricordi.", { base: "#4b2a8c", lining: "#28165a", trim: "#c9a8ff", pattern: "runes" }),
    I("cloak10", "cloak", "L", "Mantello d'aurora", "Verde, azzurro e viola che si muovono: raro come un ricordo perfetto.", { base: "#123a4a", lining: "#0a2130", trim: "#e9fff7", pattern: "aurora" }),
    I("cloak11", "cloak", "L", "Mantello di brace", "Sotto la cenere il fuoco resta: come quello che hai ripassato.", { base: "#2a1214", lining: "#140809", trim: "#ff9a3c", pattern: "flames" }),
    I("cloak12", "cloak", "M", "Mantello del tempo", "Tessuto con le ore che hai dato alla memoria.", { base: "#2b2350", lining: "#140f2c", trim: "#fff3c4", pattern: "time" }),
    // aure
    I("aura1", "aura", "C", "Bagliore", "Una luce tenue: il primo segno di allenamento.", { kind: "glow", color: "#b8b0ff" }),
    I("aura2", "aura", "C", "Anello", "Un cerchio semplice, come una giornata fatta.", { kind: "ring", color: "#c3cbd8" }),
    I("aura3", "aura", "R", "Doppio anello", "Due giri: imparare e ripassare.", { kind: "rings", color: "#6aa2ff" }),
    I("aura4", "aura", "R", "Scintille", "Piccoli lampi: le immagini che ti vengono in mente.", { kind: "sparks", color: "#ffe08a" }),
    I("aura5", "aura", "E", "Cerchio di rune", "Le rune girano lente intorno a chi ricorda.", { kind: "runes", color: "#c084fc" }),
    I("aura6", "aura", "E", "Vortice", "Un vortice di immagini, ognuna al suo posto.", { kind: "spiral", color: "#8b6cff" }),
    I("aura7", "aura", "L", "Fiamme d'oro", "Brucia ma non consuma: è la concentrazione.", { kind: "flames", color: "#f2b53c" }),
    I("aura8", "aura", "M", "Galassia", "Miliardi di stelle, e tu sai dov'è ognuna.", { kind: "galaxy", color: "#ff7ab6" }),
    // emblemi
    I("em1", "emblem", "C", "Occhio di ferro", "Guardare bene è metà del ricordare.", { icon: "eye", metal: "iron" }),
    I("em2", "emblem", "C", "Chiave di ferro", "Ogni immagine è una chiave per un ricordo.", { icon: "key", metal: "iron" }),
    I("em3", "emblem", "C", "Libro di ferro", "Studiare per non dimenticare.", { icon: "book", metal: "iron" }),
    I("em4", "emblem", "C", "Clessidra di ferro", "Il tempo giusto tra un ripasso e l'altro.", { icon: "hourglass", metal: "iron" }),
    I("em5", "emblem", "R", "Torre d'argento", "La Torre: un piano al giorno.", { icon: "tower", metal: "silver" }),
    I("em6", "emblem", "R", "Bussola d'argento", "Nel palazzo non ti perdi mai.", { icon: "compass", metal: "silver" }),
    I("em7", "emblem", "R", "Labirinto d'argento", "Ogni corridoio porta a un luogo.", { icon: "maze", metal: "silver" }),
    I("em8", "emblem", "E", "Gufo d'oro", "L'animale di Atena, dea della saggezza.", { icon: "owl", metal: "gold" }),
    I("em9", "emblem", "E", "Infinito d'oro", "Quello che ripassi al momento giusto resta a lungo.", { icon: "infinity", metal: "gold" }),
    I("em10", "emblem", "L", "Stella di cristallo", "Limpida come una memoria allenata.", { icon: "star", metal: "crystal" }),
    I("em11", "emblem", "L", "Palazzo di cristallo", "Il tuo palazzo, visto da fuori.", { icon: "temple", metal: "crystal" }),
    I("em12", "emblem", "M", "Corona astrale", "Per chi arriva in cima alla Torre.", { icon: "crown", metal: "astral" }),
    // compagni
    I("pet1", "pet", "C", "Gatto", "Curioso: nota ogni dettaglio.", { species: "cat", c: ["#e8a85c", "#f7d9b5", "#c9783a"] }),
    I("pet2", "pet", "C", "Volpe", "Astuta: trova sempre la strada nel palazzo.", { species: "fox", c: ["#e2763a", "#fff3e4", "#9c4420"] }),
    I("pet3", "pet", "C", "Tartaruga", "Lenta e costante, come il ripasso.", { species: "turtle", c: ["#5aa36b", "#2f6b46", "#b7dd9a"] }),
    I("pet4", "pet", "R", "Gufo", "L'animale di Atena: vede nel buio.", { species: "owl", c: ["#8b6a4f", "#e4cfb1", "#f2b53c"] }),
    I("pet5", "pet", "R", "Corvo Muninn", "Nella mitologia norrena uno dei corvi di Odino si chiama Muninn, «memoria»: vola sul mondo e torna a raccontare.", { species: "raven", c: ["#1d2233", "#5d7fd6", "#c9d6ff"] }),
    I("pet6", "pet", "R", "Lupo", "Conosce il suo territorio a memoria.", { species: "wolf", c: ["#8d97a8", "#eef2f7", "#7fd3ff"] }),
    I("pet7", "pet", "E", "Elefante", "Il proverbio dice che un elefante non dimentica; negli elefanti africani le matriarche più anziane riconoscono i richiami di moltissimi altri elefanti.", { species: "elephant", c: ["#8a95b5", "#c9d1e6", "#f3f0ff"] }),
    I("pet8", "pet", "E", "Axolotl", "Sorride sempre e rigenera quello che perde: come un ricordo ripassato.", { species: "axolotl", c: ["#f7a6c6", "#e2558f", "#ffe3ee"] }),
    I("pet9", "pet", "E", "Medusa di luce", "Fluttua leggera e brilla nel buio.", { species: "jelly", c: ["#7fe3ff", "#b48cff", "#e9fbff"] }),
    I("pet10", "pet", "L", "Drago", "Custodisce un tesoro: i tuoi ricordi.", { species: "dragon", c: ["#2fa58a", "#f2c14e", "#bff2df"] }),
    I("pet11", "pet", "L", "Fenice", "Rinasce dalle ceneri: come un ricordo ripassato al momento giusto.", { species: "phoenix", c: ["#ff6b35", "#ffd166", "#fff1c2"] }),
    I("pet12", "pet", "M", "Balena celeste", "Nuota tra le stelle e conosce il nome di ognuna.", { species: "whale", c: ["#2b3f9e", "#9ad0ff", "#ffffff"] }),
    // sfondi
    I("bg0", "bg", "C", "La Torre", "Il cielo sopra la Torre della Memoria.", { scene: "tower" }, true),
    I("bg1", "bg", "C", "Biblioteca", "Scaffali pieni: ogni libro al suo posto.", { scene: "library" }),
    I("bg2", "bg", "C", "Il primo palazzo", "Casa tua: il primo palazzo di tutti.", { scene: "house" }),
    I("bg3", "bg", "R", "Giardino di pietra", "Sabbia rastrellata e silenzio: concentrazione.", { scene: "garden" }),
    I("bg4", "bg", "R", "Grotta di cristallo", "Cristalli che riflettono le immagini.", { scene: "crystal" }),
    I("bg5", "bg", "E", "Montagne all'alba", "Ogni mattina un piano nuovo.", { scene: "mountains" }),
    I("bg6", "bg", "E", "Città di notte", "Mille finestre accese, mille luoghi.", { scene: "city" }),
    I("bg7", "bg", "L", "Mare di stelle", "Il cielo come un palazzo infinito.", { scene: "stars" }),
    I("bg8", "bg", "M", "Il Teatro della Memoria", "Ispirato al teatro di Giulio Camillo: il sapere su sette livelli, ogni porta un ricordo.", { scene: "theatre" }),
    // reliquie: fatti veri della storia dell'arte della memoria
    I("rel1", "relic", "C", "Le tavolette di cera", "La «Rhetorica ad Herennium» paragona i luoghi della memoria alle tavolette di cera e le immagini alle lettere scritte sopra.", { icon: "tablet" }),
    I("rel2", "relic", "C", "Il quipu", "Gli Inca tenevano numeri e conti con i quipu, cordicelle annodate: il tipo e la posizione dei nodi davano il valore.", { icon: "quipu" }),
    I("rel3", "relic", "C", "I consigli di Tommaso d'Aquino", "Nella «Summa Theologiae» Tommaso d'Aquino dà quattro consigli per la memoria: immagini insolite, ordine, interesse vero e ripetizione frequente.", { icon: "quill" }),
    I("rel4", "relic", "R", "La Rhetorica ad Herennium", "Il più antico trattato latino arrivato fino a noi che descrive i luoghi e le immagini (I secolo a.C.); nel Medioevo era attribuito a Cicerone.", { icon: "scroll" }),
    I("rel5", "relic", "R", "Le ruote di Lullo", "Raimondo Lullo, nel XIII secolo, ideò dischi girevoli per combinare concetti: furono il modello delle ruote della memoria del Rinascimento.", { icon: "wheel" }),
    I("rel6", "relic", "R", "Lo zodiaco di Metrodoro", "Quintiliano racconta che Metrodoro di Scepsi ricavò 360 luoghi dai dodici segni dello zodiaco.", { icon: "zodiac" }),
    I("rel7", "relic", "E", "La Fenice di Pietro da Ravenna", "Pietro da Ravenna pubblicò a Venezia nel 1491 la «Phoenix», sull'arte della memoria; raccontava di aver imparato a dieci anni l'intero codice di diritto civile.", { icon: "phoenix" }),
    I("rel8", "relic", "E", "Il palazzo di Matteo Ricci", "Il gesuita maceratese Matteo Ricci scrisse in cinese, nel 1596, un trattato sulla memoria per il governatore del Jiangxi: insegnava il palazzo della memoria.", { icon: "pagoda" }),
    I("rel9", "relic", "E", "La fonte di Mnemosine", "Nelle laminette d'oro orfiche l'anima è invitata a non bere alla prima fonte e a chiedere l'acqua fresca del lago di Mnemosine, la Memoria.", { icon: "spring" }),
    I("rel10", "relic", "L", "Le ruote di Giordano Bruno", "Nel «De umbris idearum» (1582) Giordano Bruno usò ruote che combinano figure, azioni e attributi per creare immagini da ricordare: un antenato del sistema persona-azione-oggetto.", { icon: "rings" }),
    I("rel11", "relic", "L", "Il Teatro di Giulio Camillo", "Giulio Camillo (circa 1480-1544) immaginò un teatro della memoria con il sapere ordinato su sette livelli; «L'idea del theatro» uscì a Firenze nel 1550.", { icon: "theatre" }),
    I("rel12", "relic", "M", "La sala di Simonide", "Cicerone racconta che Simonide di Ceo, uscito da una sala poco prima del crollo, riconobbe i morti ricordando il posto di ciascuno: la leggenda della nascita del metodo dei luoghi.", { icon: "hall" })
  ];
  const BY_ID = Object.fromEntries(CATALOG.map((it) => [it.id, it]));
  const POOL = CATALOG.filter((it) => !it.start);
  const STARTER = { cloak: "cloak0", aura: null, emblem: null, pet: null, bg: "bg0" };

  function itemById(id) { return BY_ID[id] || null; }
  function formOf(level) {
    let f = FORMS[0];
    FORMS.forEach((x, i) => { if (level >= x.level) f = { ...x, n: i + 1 }; });
    return f.n ? f : { ...FORMS[0], n: 1 };
  }
  function nextForm(level) { return FORMS.find((x) => x.level > level) || null; }

  /* ------------------------------------------------------------ stato del personaggio */
  // la prima volta: un regalo di benvenuto (uno scrigno e un'evocazione), cosi' si prova subito
  function ensureChar(x) {
    const fresh = !isObj(x);
    const o = isObj(x) ? x : { crystals: PULL_COST, chests: { piano: 1 } };
    const items = {};
    if (isObj(o.items)) Object.keys(o.items).forEach((id) => { const n = o.items[id]; if (BY_ID[id] && !BY_ID[id].start && Number.isInteger(n) && n > 0) items[id] = Math.min(n, 999); });
    const ch = {
      name: typeof o.name === "string" && o.name.trim() ? o.name.trim().slice(0, 20) : "Mnemonista",
      crystals: num(o.crystals) && o.crystals >= 0 ? Math.round(o.crystals) : 0,
      dust: num(o.dust) && o.dust >= 0 ? Math.round(o.dust) : 0,
      chests: { piano: 0, oro: 0, guardiano: 0 },
      items,
      equip: { ...STARTER },
      pity: { e: 0, l: 0 },
      pulls: Number.isInteger(o.pulls) && o.pulls >= 0 ? o.pulls : 0,
      seen: {},
      history: Array.isArray(o.history) ? o.history.filter((h) => isObj(h) && BY_ID[h.id] && num(h.t)).slice(-30) : [],
      form: Number.isInteger(o.form) ? clamp(o.form, 1, FORMS.length) : 1,
      welcome: fresh ? true : Boolean(o.welcome)
    };
    if (isObj(o.chests)) Object.keys(CHESTS).forEach((k) => { if (Number.isInteger(o.chests[k]) && o.chests[k] > 0) ch.chests[k] = Math.min(o.chests[k], 999); });
    if (isObj(o.pity)) { if (Number.isInteger(o.pity.e)) ch.pity.e = clamp(o.pity.e, 0, PITY_E - 1); if (Number.isInteger(o.pity.l)) ch.pity.l = clamp(o.pity.l, 0, PITY_L - 1); }
    if (isObj(o.seen)) Object.keys(o.seen).forEach((id) => { if (BY_ID[id] && num(o.seen[id])) ch.seen[id] = o.seen[id]; });
    if (isObj(o.equip)) SLOTS.forEach((s) => {
      const id = o.equip[s.id];
      if (id === null && s.none) ch.equip[s.id] = null;
      else if (typeof id === "string" && BY_ID[id] && BY_ID[id].cat === s.id && owns(ch, id)) ch.equip[s.id] = id;
    });
    return ch;
  }
  function owns(ch, id) {
    const it = BY_ID[id];
    return Boolean(it && (it.start || (ch.items[id] || 0) > 0));
  }
  function award(ch, crystals) {
    if (ch && crystals > 0) ch.crystals += Math.round(crystals);
  }
  function addChest(ch, kind, n = 1) {
    if (ch && CHESTS[kind]) ch.chests[kind] += n;
  }
  function chestsTotal(ch) { return Object.values(ch.chests).reduce((a, b) => a + b, 0); }

  /* ------------------------------------------------------------ evocazioni */
  function rollRarity(rand, minRank = 0) {
    const pool = RARITIES.filter((r) => RANK[r.id] >= minRank);
    const total = pool.reduce((s, r) => s + r.odds, 0);
    let x = rand() * total;
    for (let i = 0; i < pool.length; i += 1) { x -= pool[i].odds; if (x < 0) return pool[i].id; }
    return pool[pool.length - 1].id;
  }
  function pickItem(rid, rand) {
    const list = POOL.filter((it) => it.r === rid);
    return list[Math.min(list.length - 1, Math.floor(rand() * list.length))];
  }
  // una evocazione, con le garanzie (minimo richiesto dallo scrigno, epico ogni 10, leggendario ogni 60)
  function pullOne(ch, rand, minRank = 0, now = Date.now(), source = "evocazione") {
    let min = minRank;
    if (ch.pity.l + 1 >= PITY_L) min = Math.max(min, RANK.L);
    else if (ch.pity.e + 1 >= PITY_E) min = Math.max(min, RANK.E);
    const rid = rollRarity(rand, min);
    const it = pickItem(rid, rand);
    ch.pity.e = RANK[rid] >= RANK.E ? 0 : ch.pity.e + 1;
    ch.pity.l = RANK[rid] >= RANK.L ? 0 : ch.pity.l + 1;
    const dup = owns(ch, it.id);
    ch.items[it.id] = (ch.items[it.id] || 0) + 1;
    const dust = dup ? RAR[rid].dust : 0;
    ch.dust += dust;
    ch.pulls += 1;
    ch.history.push({ id: it.id, t: now, s: source });
    ch.history = ch.history.slice(-30);
    return { id: it.id, r: rid, dup, dust };
  }
  // n = 1 o 10. Restituisce i risultati, o null se mancano i cristalli.
  function summon(ch, n, rand = Math.random, now = Date.now()) {
    const cost = n === 10 ? TEN_COST : n === 1 ? PULL_COST : null;
    if (!cost || ch.crystals < cost) return null;
    ch.crystals -= cost;
    const out = [];
    for (let i = 0; i < n; i += 1) {
      // nelle dieci evocazioni insieme almeno un epico
      const needE = n === 10 && i === n - 1 && !out.some((x) => RANK[x.r] >= RANK.E);
      out.push(pullOne(ch, rand, needE ? RANK.E : 0, now, n === 10 ? "dieci" : "evocazione"));
    }
    return out;
  }
  function openChest(ch, kind, rand = Math.random, now = Date.now()) {
    if (!CHESTS[kind] || ch.chests[kind] <= 0) return null;
    ch.chests[kind] -= 1;
    return [pullOne(ch, rand, RANK[CHESTS[kind].min], now, kind)];
  }
  // forgia: un oggetto che non hai, con la polvere di stelle dei doppioni
  function craftCost(id) { const it = BY_ID[id]; return it ? RAR[it.r].craft : null; }
  function craft(ch, id, now = Date.now()) {
    const it = BY_ID[id];
    if (!it || it.start || owns(ch, id) || ch.dust < RAR[it.r].craft) return false;
    ch.dust -= RAR[it.r].craft;
    ch.items[id] = 1;
    ch.history.push({ id, t: now, s: "forgia" });
    ch.history = ch.history.slice(-30);
    return true;
  }
  function equip(ch, slot, id) {
    const s = SLOTS.find((x) => x.id === slot);
    if (!s) return false;
    if (id === null) { if (!s.none) return false; ch.equip[slot] = null; return true; }
    const it = BY_ID[id];
    if (!it || it.cat !== slot || !owns(ch, id)) return false;
    ch.equip[slot] = id;
    return true;
  }
  function markSeen(ch, ids, now = Date.now()) { (ids || []).forEach((id) => { if (BY_ID[id]) ch.seen[id] = now; }); }
  function unseen(ch) { return Object.keys(ch.items).filter((id) => !num(ch.seen[id])); }
  function collection(ch) {
    const out = {};
    CATS.forEach((c) => {
      const list = POOL.filter((it) => it.cat === c.id);
      out[c.id] = { total: list.length, owned: list.filter((it) => owns(ch, it.id)).length };
    });
    const all = Object.values(out);
    return { byCat: out, owned: all.reduce((a, x) => a + x.owned, 0), total: all.reduce((a, x) => a + x.total, 0) };
  }
  function rng(seed) {
    let a = (Number(seed) || 1) >>> 0;
    return function next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  return {
    RARITIES, RAR, RANK, SLOTS, CATS, CATALOG, POOL, STARTER, CHESTS, FORMS, PULL_COST, TEN_COST, PITY_E, PITY_L,
    itemById, formOf, nextForm, ensureChar, owns, award, addChest, chestsTotal, rollRarity, pullOne, summon, openChest,
    craftCost, craft, equip, markSeen, unseen, collection, rng
  };
});
