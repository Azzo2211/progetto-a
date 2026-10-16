/*
 * Progetto A - Mira: motore senza DOM (testato in tests/aim.test.js).
 *
 * - Sensibilita' come in Valorant: 0,07 gradi per unita' di movimento del mouse a sens 1,
 *   campo visivo orizzontale 103 gradi. eDPI = DPI x sens; cm/360 = 2,54 x 360 / (0,07 x eDPI).
 * - Calibrazione: se il browser non legge il mouse 1:1 come il gioco, un fattore lo corregge
 *   (si misura facendo lo stesso giro di 360 gradi nel gioco e qui).
 * - Scenari puri: posizionano bersagli e sagome in una stanza 3D, gestiscono colpi, tracking e
 *   punteggio. Il disegno e l'input stanno in aim/game.js.
 * - Ricerca della sensibilita': confronti a coppie su scala logaritmica, l'intervallo si dimezza
 *   a ogni turno (come il metodo PSA).
 * - Stato: impostazioni, partite, ricerca in corso, storico delle sensibilita'.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AimEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 1;
  const YAW = 0.07; // Valorant: gradi per unita' di movimento a sens 1
  const FOV_H = 103; // Valorant: campo visivo orizzontale fisso
  const DEG = Math.PI / 180;
  const DAY = 24 * 60 * 60 * 1000;

  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  /* ------------------------------------------------------------ sensibilita' */
  function edpi(dpi, sens) { return dpi * sens; }
  function cm360(dpi, sens) { return (360 / (YAW * sens * dpi)) * 2.54; }
  function sensForCm(dpi, cm) { return (360 * 2.54) / (YAW * dpi * cm); }
  function roundSens(s) { return Math.round(s * 1000) / 1000; }

  // Gradi di rotazione per unita' di movimento letta dal browser.
  function degPerUnit(sens, calib) {
    const factor = calib && num(calib.factor) && calib.factor > 0 ? calib.factor : 1;
    return sens * YAW * factor;
  }

  // measured: unita' lette qui per lo stesso movimento fisico che in Valorant fa 360 gradi.
  function calibrate(sens, measured) {
    const expected = 360 / (sens * YAW);
    if (!num(measured) || measured <= 0) return null;
    const factor = expected / measured;
    return { factor, expected: Math.round(expected), measured: Math.round(measured), sens, ok: Math.abs(1 - factor) <= 0.05 };
  }

  /* ------------------------------------------------------------ vettori */
  function dir(yaw, pitch) {
    const y = yaw * DEG;
    const p = pitch * DEG;
    return [Math.sin(y) * Math.cos(p), Math.sin(p), Math.cos(y) * Math.cos(p)];
  }
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const len = (a) => Math.sqrt(dot(a, a));
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  // Base della camera: avanti, destra, su.
  function basis(yaw, pitch) {
    const f = dir(yaw, pitch);
    const y = yaw * DEG;
    const r = [Math.cos(y), 0, -Math.sin(y)];
    const u = cross(f, r);
    return { f, r, u };
  }

  function toCamera(p, b) { return [dot(p, b.r), dot(p, b.u), dot(p, b.f)]; }

  function focal(width, fovH = FOV_H) { return width / 2 / Math.tan((fovH / 2) * DEG); }

  // Proiezione sullo schermo (null se dietro la camera).
  function project(p, b, width, height, fovH = FOV_H) {
    const c = toCamera(p, b);
    if (c[2] <= 0.05) return null;
    const fl = focal(width, fovH);
    return { x: width / 2 + (c[0] / c[2]) * fl, y: height / 2 - (c[1] / c[2]) * fl, z: c[2], scale: fl / c[2] };
  }

  // Raggio dalla camera (origine) lungo f contro una sfera: distanza o -1.
  function raySphere(f, center, r) {
    const t = dot(center, f);
    if (t < 0) return -1;
    const d2 = dot(center, center) - t * t;
    return d2 <= r * r ? t : -1;
  }

  // Raggio contro un box allineato agli assi {min, max}: distanza di ingresso o -1.
  function rayBox(f, box) {
    let tmin = 0;
    let tmax = Infinity;
    for (let i = 0; i < 3; i += 1) {
      if (Math.abs(f[i]) < 1e-9) {
        if (0 < box.min[i] || 0 > box.max[i]) return -1;
      } else {
        let t1 = box.min[i] / f[i];
        let t2 = box.max[i] / f[i];
        if (t1 > t2) [t1, t2] = [t2, t1];
        tmin = Math.max(tmin, t1);
        tmax = Math.min(tmax, t2);
        if (tmin > tmax) return -1;
      }
    }
    return tmin;
  }

  // Angolo (gradi) tra la direzione di mira e un punto.
  function angleTo(f, p) {
    const c = clamp(dot(f, p) / (len(p) || 1), -1, 1);
    return Math.acos(c) / DEG;
  }

  // Yaw/pitch per guardare un punto (usato dai test e dalle sagome).
  function anglesTo(p) {
    const yaw = Math.atan2(p[0], p[2]) / DEG;
    const pitch = Math.atan2(p[1], Math.sqrt(p[0] * p[0] + p[2] * p[2])) / DEG;
    return { yaw, pitch };
  }

  // Generatore casuale ripetibile.
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ------------------------------------------------------------ stanza */
  // Stanza: pavimento a -1.6 m (occhi a 1,6 m), soffitto a 6 m. Le teste stanno a quota 0.
  const ROOM = { x: [-24, 24], y: [-1.6, 6], z: [-24, 30] };
  const HEAD_Y = 0.02;

  // Sagoma: corpo come box verticale, testa come sfera.
  function botParts(x, z, crouch = false) {
    const top = crouch ? -0.55 : -0.18;
    return {
      body: { min: [x - 0.25, ROOM.y[0], z - 0.18], max: [x + 0.25, top, z + 0.18] },
      head: { c: [x, top + 0.16, z], r: 0.13 }
    };
  }

  /* ------------------------------------------------------------ scenari */
  const SCENARIOS = [
    {
      id: "gridshot", name: "Gridshot", trains: "Velocità e flick brevi", duration: 60,
      text: "Tre bersagli alla volta su una griglia davanti a te: colpiscili il più in fretta possibile senza sprecare colpi.",
      tip: "Non inseguire il bersaglio: guarda il prossimo prima di sparare e lascia che il mouse arrivi lì."
    },
    {
      id: "microshot", name: "Precisione", trains: "Micro-correzioni sulla testa", duration: 60,
      text: "Un bersaglio piccolo come una testa, vicino al centro: un colpo preciso alla volta.",
      tip: "Movimenti corti col polso, mirino fermo prima del clic. La precisione viene prima della velocità."
    },
    {
      id: "headline", name: "Linea della testa", trains: "Mirino all'altezza della testa e flick orizzontali", duration: 60,
      text: "Le teste compaiono sempre alla stessa altezza, a destra e a sinistra: tieni il mirino su quella linea e muoviti solo di lato.",
      tip: "Il numero da guardare è l'altezza media del mirino: più è vicina a 0 gradi, meno correzioni verticali farai in partita."
    },
    {
      id: "peek", name: "Peek dagli angoli", trains: "Reazione e one-tap alla testa", duration: 0, reps: 20,
      text: "Una sagoma esce da dietro un muro e rientra: colpiscila alla testa prima che sparisca. Il corpo non basta.",
      tip: "Tieni il mirino sul bordo del muro, all'altezza della testa: devi solo cliccare, non correre dietro alla sagoma."
    },
    {
      id: "tracking", name: "Tracking ADAD", trains: "Seguire un nemico che scatta a destra e sinistra", duration: 45,
      text: "Una sagoma si sposta a destra e sinistra cambiando direzione a caso, come uno strafe ADAD. Tieni premuto e restale addosso.",
      tip: "Guarda il busto, non i piedi, e anticipa i cambi di direzione con piccoli movimenti fluidi."
    },
    {
      id: "reflex", name: "Riflessi", trains: "Tempo di reazione e primo flick", duration: 0, reps: 20,
      text: "Aspetta il bersaglio: compare dopo un attimo a caso. Colpiscilo prima che sparisca.",
      tip: "Non anticipare il clic. Il tempo che conta è dal bersaglio che compare al colpo a segno."
    },
    {
      id: "senstest", name: "Prova sensibilità", trains: "Flick lunghi e corti insieme", duration: 30, hidden: true,
      text: "Flick lunghi e piccoli aggiustamenti alternati: serve a confrontare due sensibilità.",
      tip: "Gioca come in partita: preciso, senza strafare."
    }
  ];
  const SCN = new Map(SCENARIOS.map((s) => [s.id, s]));
  const ROUTINE = ["gridshot", "microshot", "headline", "peek", "tracking", "reflex"];

  /*
   * Crea uno scenario. Interfaccia:
   *   sc.update(dt, aim)  aim = { yaw, pitch, holding }
   *   sc.shoot(aim)       -> { hit, head, kill, blocked }
   *   sc.targets          sfere { id, c, r, born, kind }
   *   sc.bots             sagome { id, x, z, crouch, visible, born }
   *   sc.covers           box di copertura (muri) per il disegno e i colpi bloccati
   *   sc.done, sc.time, sc.stats()
   */
  function createScenario(id, { seed = Date.now(), aim = { yaw: 0, pitch: 0 } } = {}) {
    const def = SCN.get(id);
    if (!def) throw new Error(`scenario sconosciuto: ${id}`);
    const rand = rng(seed);
    const sc = {
      id, def, time: 0, done: false, targets: [], bots: [], covers: [], effects: [],
      shots: 0, hits: 0, heads: 0, kills: 0, body: 0, misses: 0, escaped: 0,
      points: 0, ttk: [], rt: [], onTarget: 0, trackTime: 0, vertSum: 0, vertN: 0,
      nextId: 1, lastKillAt: 0
    };
    const between = (a, b) => a + rand() * (b - a);
    const spherePoint = (yaw, pitch, dist) => { const d = dir(yaw, pitch); return [d[0] * dist, d[1] * dist, d[2] * dist]; };
    const addTarget = (c, r, extra = {}) => { const t = { id: sc.nextId++, c, r, born: sc.time, ...extra }; sc.targets.push(t); return t; };
    const killTarget = (t) => { sc.targets = sc.targets.filter((x) => x !== t); sc.effects.push({ c: t.c, t: sc.time, kind: "hit" }); };

    /* ---- gridshot: 3 bersagli su una griglia 5x5 */
    if (id === "gridshot") {
      const spots = [];
      for (let i = 0; i < 5; i += 1) for (let j = 0; j < 5; j += 1) spots.push([(i - 2) * 1.35, 0.8 + (j - 2) * 1.0, 11]);
      const free = () => spots.filter((s) => !sc.targets.some((t) => t.c === s));
      const spawn = () => { const f = free(); addTarget(f[Math.floor(rand() * f.length)], 0.42); };
      for (let k = 0; k < 3; k += 1) spawn();
      sc.onKill = () => spawn();
    }

    /* ---- precisione: un bersaglio piccolo vicino al centro */
    if (id === "microshot") {
      const spawn = () => addTarget(spherePoint(between(-11, 11), between(-4, 6), 12), 0.14);
      spawn();
      sc.onKill = () => spawn();
    }

    /* ---- linea della testa: teste alla stessa quota */
    if (id === "headline") {
      const spawn = () => {
        const yaw = between(-42, 42);
        const d = between(10, 18);
        const p = spherePoint(yaw, 0, d);
        addTarget([p[0], HEAD_Y, p[2]], 0.13, { kind: "head" });
      };
      spawn();
      sc.onKill = () => spawn();
    }

    /* ---- riflessi: compare dopo un'attesa a caso, sparisce dopo 1,6 s */
    if (id === "reflex") {
      sc.wait = between(0.8, 2.0);
      sc.rep = 0;
      sc.onKill = (t) => { sc.rt.push(sc.time - t.born); sc.rep += 1; sc.wait = between(0.7, 1.9); if (sc.rep >= def.reps) sc.done = true; };
      sc.tick = (dt) => {
        if (sc.targets.length) {
          const t = sc.targets[0];
          if (sc.time - t.born > 1.6) { sc.targets = []; sc.escaped += 1; sc.rep += 1; sc.wait = between(0.7, 1.9); if (sc.rep >= def.reps) sc.done = true; }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) addTarget(spherePoint(between(-26, 26), between(-9, 11), 11), 0.3);
      };
    }

    /* ---- prova sensibilita': flick lunghi e corti alternati, relativi alla mira */
    if (id === "senstest") {
      let flip = 0;
      const spawn = (a) => {
        flip += 1;
        const long = flip % 2 === 1;
        const ang = between(0, Math.PI * 2);
        const amount = long ? between(16, 42) : between(3, 8);
        const yaw = clamp(a.yaw + Math.cos(ang) * amount, -70, 70);
        const pitch = clamp(a.pitch + Math.sin(ang) * amount * 0.45, -18, 22);
        addTarget(spherePoint(yaw, pitch, 12), long ? 0.24 : 0.14);
      };
      spawn(aim);
      sc.onKill = (t, a) => spawn(a);
    }

    /* ---- peek: sagome che escono da dietro i muri */
    if (id === "peek") {
      const lanes = [
        { x: -5.5, z: 14, side: 1 },
        { x: 4.2, z: 18, side: -1 },
        { x: -1.0, z: 24, side: 1 },
        { x: 9.5, z: 12, side: -1 }
      ];
      const W = 2.4;
      lanes.forEach((l) => {
        const w = W;
        const x0 = l.side > 0 ? l.x - w : l.x;
        sc.covers.push({ min: [x0, ROOM.y[0], l.z - 0.6], max: [x0 + w, 1.6, l.z - 0.2] });
      });
      sc.rep = 0;
      sc.wait = between(0.6, 1.4);
      sc.tick = (dt) => {
        if (sc.bots.length) {
          const b = sc.bots[0];
          const age = sc.time - b.born;
          // esce (0..out), si ferma (hold), rientra
          if (age < b.out) b.x = b.start + b.side * b.speed * age;
          else if (age < b.out + b.hold) b.x = b.start + b.side * b.speed * b.out;
          else b.x = b.start + b.side * b.speed * Math.max(0, b.out - (age - b.out - b.hold));
          // visibile quando la testa non e' coperta dal muro (vista dalla tua posizione)
          const head = botParts(b.x, b.z).head.c;
          const toHead = head.map((v) => v / len(head));
          const tWall = sc.covers.reduce((m, c) => { const t = rayBox(toHead, c); return t >= 0 && t < m ? t : m; }, Infinity);
          b.visible = tWall > len(head);
          if (b.visible && b.seenAt == null) b.seenAt = sc.time;
          if (age > b.out * 2 + b.hold) { sc.bots = []; sc.escaped += 1; sc.rep += 1; sc.wait = between(0.5, 1.3); if (sc.rep >= def.reps) sc.done = true; }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) {
          const l = lanes[Math.floor(rand() * lanes.length)];
          const speed = between(4.6, 5.8);
          // parte nascosta: abbastanza dietro il muro da non vedersi dalla tua posizione
          const hidden = (x) => {
            const head = botParts(x, l.z + 0.4).head.c;
            const d = len(head);
            const toHead = head.map((v) => v / d);
            const tWall = sc.covers.reduce((m, c) => { const t = rayBox(toHead, c); return t >= 0 && t < m ? t : m; }, Infinity);
            return tWall < d;
          };
          let start = l.x - l.side * 0.35;
          while (!hidden(start) && Math.abs(start - l.x) < W - 0.3) start -= l.side * 0.1;
          sc.bots.push({ id: sc.nextId++, lane: l, edge: l.x, start, side: l.side, x: start, z: l.z + 0.4, speed, out: between(0.3, 0.42), hold: between(0.35, 0.7), born: sc.time, seenAt: null, visible: false, hp: 1 });
        }
      };
      sc.botKill = (b) => {
        sc.rt.push(sc.time - (b.seenAt == null ? b.born : b.seenAt));
        sc.effects.push({ c: botParts(b.x, b.z).head.c, t: sc.time, kind: "head" });
        sc.bots = [];
        sc.rep += 1;
        sc.wait = between(0.5, 1.3);
        if (sc.rep >= def.reps) sc.done = true;
      };
    }

    /* ---- tracking ADAD */
    if (id === "tracking") {
      const b = { id: sc.nextId++, x: 0, z: 10, v: 0, dirLeft: between(0.25, 0.8), crouch: false, visible: true, born: 0 };
      b.v = rand() < 0.5 ? -5 : 5;
      sc.bots.push(b);
      sc.tick = (dt, a) => {
        b.dirLeft -= dt;
        if (b.dirLeft <= 0) { b.v = (b.v > 0 ? -1 : 1) * between(3.8, 6); b.dirLeft = between(0.22, 0.85); }
        b.x += b.v * dt;
        if (b.x > 5.5) { b.x = 5.5; b.v = -Math.abs(b.v); }
        if (b.x < -5.5) { b.x = -5.5; b.v = Math.abs(b.v); }
        sc.trackTime += dt;
        if (a && a.holding) {
          const f = dir(a.yaw, a.pitch);
          const parts = botParts(b.x, b.z);
          const on = raySphere(f, parts.head.c, parts.head.r) >= 0 || rayBox(f, parts.body) >= 0;
          if (on) sc.onTarget += dt;
        }
      };
    }

    sc.update = function update(dt, a = { yaw: 0, pitch: 0, holding: false }) {
      if (sc.done) return;
      sc.time += dt;
      if (sc.tick) sc.tick(dt, a);
      if (id === "headline") { sc.vertSum += Math.abs(a.pitch - Math.atan2(HEAD_Y, 15) / DEG) * dt; sc.vertN += dt; }
      if (def.duration && sc.time >= def.duration) { sc.time = def.duration; sc.done = true; }
      sc.effects = sc.effects.filter((e) => sc.time - e.t < 0.4);
    };

    sc.shoot = function shoot(a) {
      if (sc.done || id === "tracking") return { hit: false };
      sc.shots += 1;
      const f = dir(a.yaw, a.pitch);
      // sagome (peek): i muri bloccano il colpo
      if (sc.bots.length && id === "peek") {
        const b = sc.bots[0];
        const parts = botParts(b.x, b.z);
        const tHead = raySphere(f, parts.head.c, parts.head.r);
        const tBody = rayBox(f, parts.body);
        const tWall = sc.covers.reduce((m, c) => { const t = rayBox(f, c); return t >= 0 && t < m ? t : m; }, Infinity);
        if (tHead >= 0 && tHead < tWall) {
          sc.hits += 1; sc.heads += 1; sc.kills += 1;
          const react = sc.time - (b.seenAt == null ? b.born : b.seenAt);
          sc.points += 150 + Math.round(clamp(1 - react / 0.9, 0, 1) * 100);
          sc.botKill(b);
          return { hit: true, head: true, kill: true };
        }
        if (tBody >= 0 && tBody < tWall) { sc.hits += 1; sc.body += 1; sc.points += 20; sc.effects.push({ c: [b.x, -0.6, b.z], t: sc.time, kind: "body" }); return { hit: true, head: false, kill: false }; }
        sc.misses += 1;
        sc.points -= 15;
        return { hit: false, blocked: tWall < Infinity };
      }
      // sfere: la piu' vicina colpita
      let best = null;
      let bestT = Infinity;
      sc.targets.forEach((t) => { const d = raySphere(f, t.c, t.r); if (d >= 0 && d < bestT) { bestT = d; best = t; } });
      if (!best) { sc.misses += 1; sc.points -= id === "microshot" ? 40 : 25; return { hit: false }; }
      sc.hits += 1;
      sc.kills += 1;
      if (best.kind === "head") sc.heads += 1;
      const ttk = sc.time - Math.max(best.born, sc.lastKillAt);
      sc.ttk.push(ttk);
      sc.lastKillAt = sc.time;
      // punti: base + rapidita' (+ precisione nel centro per "precisione")
      const speed = Math.round(clamp(1 - (ttk - 0.25) / 0.9, 0, 1) * 50);
      const off = angleTo(f, best.c) / (Math.atan2(best.r, len(best.c)) / DEG);
      const center = id === "microshot" ? Math.round(clamp(1 - off, 0, 1) * 40) : 0;
      sc.points += 100 + speed + center;
      killTarget(best);
      if (sc.onKill) sc.onKill(best, a);
      return { hit: true, head: best.kind === "head", kill: true };
    };

    sc.stats = function stats() {
      const avg = (list) => (list.length ? list.reduce((x, y) => x + y, 0) / list.length : null);
      const acc = sc.shots ? sc.hits / sc.shots : id === "tracking" ? null : 0;
      const out = {
        sc: id, dur: Math.round(sc.time * 10) / 10, shots: sc.shots, hits: sc.hits, kills: sc.kills, heads: sc.heads,
        acc: acc == null ? null : Math.round(acc * 1000) / 10,
        ttk: avg(sc.ttk) == null ? null : Math.round(avg(sc.ttk) * 1000),
        rt: avg(sc.rt) == null ? null : Math.round(avg(sc.rt) * 1000),
        escaped: sc.escaped
      };
      if (id === "tracking") {
        out.track = sc.trackTime ? Math.round((sc.onTarget / sc.trackTime) * 1000) / 10 : 0;
        out.score = Math.round(out.track * 100);
      } else if (id === "headline") {
        out.vert = sc.vertN ? Math.round((sc.vertSum / sc.vertN) * 100) / 100 : null;
        out.score = Math.max(0, Math.round(sc.points));
      } else if (id === "reflex") {
        // punteggio: colpiti, piu' veloce meglio
        out.score = Math.max(0, Math.round(sc.rt.reduce((s, r) => s + 100 + clamp(1 - (r - 0.25) / 0.8, 0, 1) * 100, 0) - sc.misses * 20));
      } else if (id === "senstest") {
        // per confrontare due sensibilita': bersagli al secondo pesati per la precisione
        const kps = sc.time ? sc.kills / sc.time : 0;
        out.score = Math.round(kps * 1000 * (0.5 + 0.5 * (acc || 0)));
      } else {
        out.score = Math.max(0, Math.round(sc.points));
      }
      out.kps = sc.time ? Math.round((sc.kills / sc.time) * 100) / 100 : 0;
      return out;
    };

    return sc;
  }

  /* ------------------------------------------------------------ ricerca della sens */
  // Confronti a coppie su scala logaritmica: a ogni turno si tiene la meta' con la sens migliore.
  const FINDER_ROUNDS = 6;
  const FINDER_SPAN = 1.6;

  function finderStart(base, { rounds = FINDER_ROUNDS, now = Date.now() } = {}) {
    const lo = base / FINDER_SPAN;
    const hi = base * FINDER_SPAN;
    return finderPair({ base, lo, hi, round: 0, rounds, history: [], startedAt: now, scores: {} });
  }

  function finderPair(f) {
    const ratio = f.hi / f.lo;
    f.a = roundSens(f.lo * Math.pow(ratio, 0.25));
    f.b = roundSens(f.lo * Math.pow(ratio, 0.75));
    f.scores = {};
    // ordine alternato: un turno si parte dalla bassa, l'altro dall'alta
    f.order = f.round % 2 === 0 ? ["a", "b"] : ["b", "a"];
    return f;
  }

  function finderScore(f, which, score) {
    if (!f || (which !== "a" && which !== "b")) return f;
    f.scores[which] = score;
    return f;
  }

  // Consiglio: la sens con il punteggio migliore; sotto il 5% di differenza conta la sensazione.
  function finderSuggest(f) {
    const a = f.scores.a;
    const b = f.scores.b;
    if (!num(a) || !num(b)) return null;
    const top = Math.max(a, b, 1);
    if (Math.abs(a - b) / top < 0.05) return "tie";
    return a > b ? "a" : "b";
  }

  // winner: "a" (piu' bassa), "b" (piu' alta) o "tie" (uguali: si stringe verso il centro).
  function finderChoose(f, winner, now = Date.now()) {
    const ratio = f.hi / f.lo;
    const mid = Math.sqrt(f.lo * f.hi);
    f.history.push({ round: f.round + 1, a: f.a, b: f.b, scoreA: f.scores.a == null ? null : f.scores.a, scoreB: f.scores.b == null ? null : f.scores.b, winner });
    if (winner === "a") f.hi = mid;
    else if (winner === "b") f.lo = mid;
    else { const lo = f.lo * Math.pow(ratio, 0.25); const hi = f.lo * Math.pow(ratio, 0.75); f.lo = lo; f.hi = hi; }
    f.round += 1;
    if (f.round >= f.rounds) {
      f.done = true;
      f.result = roundSens(Math.sqrt(f.lo * f.hi));
      f.finishedAt = now;
      return f;
    }
    return finderPair(f);
  }

  /* ------------------------------------------------------------ stato */
  const COLORS = ["#2ef27a", "#33e0ff", "#ffe14d", "#ff4d6d", "#ffffff", "#ff4dff"];

  function defaultSettings() {
    return {
      dpi: 800, sens: 0.35, calib: null, sound: true, targetColor: "#33e0ff",
      crosshair: { color: "#2ef27a", len: 5, thick: 2, gap: 3, dot: false, outline: true }
    };
  }

  function ensure(raw, now = Date.now()) {
    const lab = isObj(raw) ? raw : {};
    lab.version = VERSION;
    const d = defaultSettings();
    const s = isObj(lab.settings) ? lab.settings : {};
    s.dpi = num(s.dpi) && s.dpi >= 100 && s.dpi <= 32000 ? Math.round(s.dpi) : d.dpi;
    s.sens = num(s.sens) && s.sens > 0.01 && s.sens <= 10 ? s.sens : d.sens;
    if (!isObj(s.calib) || !num(s.calib.factor) || s.calib.factor < 0.2 || s.calib.factor > 5) s.calib = null;
    s.sound = typeof s.sound === "boolean" ? s.sound : d.sound;
    s.targetColor = typeof s.targetColor === "string" && /^#[0-9a-f]{6}$/i.test(s.targetColor) ? s.targetColor : d.targetColor;
    const c = isObj(s.crosshair) ? s.crosshair : {};
    s.crosshair = {
      color: typeof c.color === "string" && /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : d.crosshair.color,
      len: num(c.len) ? clamp(Math.round(c.len), 0, 20) : d.crosshair.len,
      thick: num(c.thick) ? clamp(Math.round(c.thick), 1, 6) : d.crosshair.thick,
      gap: num(c.gap) ? clamp(Math.round(c.gap), 0, 20) : d.crosshair.gap,
      dot: typeof c.dot === "boolean" ? c.dot : d.crosshair.dot,
      outline: typeof c.outline === "boolean" ? c.outline : d.crosshair.outline
    };
    lab.settings = s;
    lab.runs = Array.isArray(lab.runs) ? lab.runs.filter((r) => isObj(r) && num(r.t) && SCN.has(r.sc) && num(r.score)).slice(-800) : [];
    lab.sensHistory = Array.isArray(lab.sensHistory) ? lab.sensHistory.filter((h) => isObj(h) && num(h.t) && num(h.to)).slice(-60) : [];
    const f = lab.finder;
    const okFinder = isObj(f) && num(f.lo) && num(f.hi) && f.lo > 0 && f.hi > f.lo && Number.isInteger(f.round) && Number.isInteger(f.rounds) && Array.isArray(f.history) && isObj(f.scores);
    if (!okFinder) lab.finder = null;
    if (lab.finder && !lab.finder.done) finderPairKeep(lab.finder);
    if (!num(lab.createdAt) || lab.createdAt > now) lab.createdAt = now;
    return lab;
  }

  // Dopo una ricarica: ricalcola la coppia se manca, senza perdere i punteggi gia' fatti.
  function finderPairKeep(f) {
    const scores = f.scores;
    if (!num(f.a) || !num(f.b) || !Array.isArray(f.order)) finderPair(f);
    f.scores = isObj(scores) ? scores : {};
  }

  function recordRun(lab, stats, { sens, now = Date.now(), routine = false } = {}) {
    if (!stats || !SCN.has(stats.sc)) return null;
    const run = { t: now, sc: stats.sc, score: stats.score, shots: stats.shots, hits: stats.hits, acc: stats.acc, ttk: stats.ttk, rt: stats.rt, kps: stats.kps, sens: num(sens) ? sens : lab.settings.sens, dur: stats.dur };
    if (stats.track != null) run.track = stats.track;
    if (stats.vert != null) run.vert = stats.vert;
    if (stats.heads) run.heads = stats.heads;
    if (stats.escaped) run.escaped = stats.escaped;
    if (routine) run.routine = true;
    lab.runs.push(run);
    if (lab.runs.length > 800) lab.runs = lab.runs.slice(-800);
    return run;
  }

  function setSens(lab, sens, { now = Date.now(), method = "manuale" } = {}) {
    if (!num(sens) || sens <= 0.01 || sens > 10) return false;
    const from = lab.settings.sens;
    const to = roundSens(sens);
    if (from === to) return false;
    lab.settings.sens = to;
    lab.sensHistory.push({ t: now, from, to, dpi: lab.settings.dpi, method });
    return true;
  }

  function dayKey(t) { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

  function stats(lab, now = Date.now()) {
    const per = {};
    SCENARIOS.filter((s) => !s.hidden).forEach((s) => {
      const list = lab.runs.filter((r) => r.sc === s.id);
      const scores = list.map((r) => r.score);
      const last5 = scores.slice(-5);
      per[s.id] = {
        count: list.length,
        best: scores.length ? Math.max(...scores) : null,
        last: list.length ? list[list.length - 1] : null,
        avg5: last5.length ? Math.round(last5.reduce((x, y) => x + y, 0) / last5.length) : null,
        trend: scores.slice(-20)
      };
    });
    const days = [...new Set(lab.runs.map((r) => dayKey(r.t)))];
    let streak = 0;
    for (let i = 0; i < 400; i += 1) {
      const k = dayKey(now - i * DAY);
      if (days.includes(k)) streak += 1;
      else if (i === 0) continue;
      else break;
    }
    const minutes = Math.round(lab.runs.reduce((n, r) => n + (r.dur || 0), 0) / 60);
    const today = lab.runs.filter((r) => dayKey(r.t) === dayKey(now));
    return { per, runs: lab.runs.length, minutes, streak, days: days.length, today: today.length, routineToday: ROUTINE.every((id) => today.some((r) => r.sc === id)) };
  }

  // Un record nuovo per lo scenario? (confronta con le partite precedenti)
  function isBest(lab, run) {
    const prev = lab.runs.filter((r) => r.sc === run.sc && r !== run).map((r) => r.score);
    return !prev.length || run.score > Math.max(...prev);
  }

  return {
    VERSION, YAW, FOV_H, ROOM, HEAD_Y, SCENARIOS, ROUTINE, COLORS, FINDER_ROUNDS, FINDER_SPAN,
    edpi, cm360, sensForCm, roundSens, degPerUnit, calibrate,
    dir, basis, toCamera, focal, project, raySphere, rayBox, angleTo, anglesTo, rng, botParts,
    scenario: (id) => SCN.get(id), createScenario,
    finderStart, finderScore, finderSuggest, finderChoose,
    defaultSettings, ensure, recordRun, setSens, stats, isBest, dayKey
  };
});
