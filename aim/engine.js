/*
 * Progetto A - Mira: motore senza DOM (testato in tests/aim.test.js).
 *
 * - Sensibilita' come in Valorant: 0,07 gradi per unita' di movimento del mouse a sens 1,
 *   campo visivo orizzontale 103 gradi. eDPI = DPI x sens; cm/360 = 2,54 x 360 / (0,07 x eDPI).
 * - Calibrazione: se il browser non legge il mouse 1:1 come il gioco, un fattore lo corregge
 *   (si misura facendo lo stesso giro di 360 gradi nel gioco e qui).
 * - Scenari puri, con tre livelli (Base, Avanzato, Pro): posizionano bersagli e sagome in una
 *   stanza 3D, gestiscono colpi, tracking, movimento laterale (counter-strafe) e punteggio.
 *   Il disegno e l'input stanno in aim/game.js.
 * - Dati di ogni partita: precisione, tempi (media, mediana, migliore, costanza), come arrivi sul
 *   bersaglio (flick puliti, oltre e corretti, corti e corretti), dove finiscono i colpi mancati,
 *   flick per distanza, andamento dentro la partita, tracking (dietro/davanti, riaggancio).
 * - Consigli automatici dalla partita, livelli consigliati, riepiloghi per i progressi.
 * - Ricerca della sensibilita': prove alla cieca a coppie su scala logaritmica, intervallo che si
 *   dimezza a ogni turno; prova a tre fasi (flick, precisione, tracking), ordine A-B-B-A nella
 *   versione precisa, giudizio a sensazione e indizi da superamento/correzione del bersaglio.
 * - Stato: impostazioni, partite, ricerca in corso, ricerche fatte, storico delle sensibilita'.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.AimEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const VERSION = 2;
  const YAW = 0.07; // Valorant: gradi per unita' di movimento a sens 1
  const FOV_H = 103; // Valorant: campo visivo orizzontale fisso
  const DEG = Math.PI / 180;
  const DAY = 24 * 60 * 60 * 1000;

  const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
  const num = (v) => typeof v === "number" && Number.isFinite(v);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
  const avg = (l) => (l.length ? l.reduce((x, y) => x + y, 0) / l.length : null);
  const median = (l) => {
    if (!l.length) return null;
    const s = l.slice().sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };
  const stdev = (l) => {
    if (l.length < 3) return null;
    const m = avg(l);
    return Math.sqrt(avg(l.map((x) => (x - m) * (x - m))));
  };
  const r1 = (v) => (num(v) ? Math.round(v * 10) / 10 : null);
  const r2 = (v) => (num(v) ? Math.round(v * 100) / 100 : null);
  const ms = (v) => (num(v) ? Math.round(v * 1000) : null);
  const it = (v, d = 0) => (num(v) ? v.toFixed(d).replace(".", ",") : "—");

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
  function calibrate(sens, measured, raw = null) {
    const expected = 360 / (sens * YAW);
    if (!num(measured) || measured <= 0) return null;
    const measuredFactor = expected / measured;
    // con l'input grezzo uno scarto sotto il 3% e' errore di misura a mano: si tiene 1:1
    const snap = raw === true && Math.abs(1 - measuredFactor) < 0.03;
    const factor = snap ? 1 : measuredFactor;
    return { factor, measuredFactor, expected: Math.round(expected), measured: Math.round(measured), sens, raw, ok: Math.abs(1 - measuredFactor) <= 0.05, valid: measuredFactor >= 0.2 && measuredFactor <= 5 };
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

  // Base della camera: avanti, destra, su; eye = posizione degli occhi (di solito l'origine).
  function basis(yaw, pitch, eye = null) {
    const f = dir(yaw, pitch);
    const y = yaw * DEG;
    const r = [Math.cos(y), 0, -Math.sin(y)];
    const u = cross(f, r);
    return { f, r, u, o: eye && (eye[0] || eye[1] || eye[2]) ? eye : null };
  }

  function toCamera(p, b) {
    const q = b.o ? [p[0] - b.o[0], p[1] - b.o[1], p[2] - b.o[2]] : p;
    return [dot(q, b.r), dot(q, b.u), dot(q, b.f)];
  }

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

  /* ------------------------------------------------------------ analisi dei flick */
  // Le distanze sono nello "spazio del mouse": gradi di yaw e pitch (quello che muove la mano).
  const binOf = (d) => (d < 10 ? "s" : d < 30 ? "m" : "l");

  /*
   * Come il mirino e' arrivato su un bersaglio colpito.
   * path: campioni [tempo, yaw, pitch] dall'inizio del flick al colpo; tgt: {yaw, pitch}; rDeg: raggio angolare.
   * "over": e' andato oltre ed e' tornato indietro; "under": si e' fermato prima e ha aggiustato;
   * "clean": arrivato senza correzioni; null: bersaglio troppo vicino per parlare di flick.
   */
  function flickKind(path, tgt, rDeg) {
    if (!path || path.length < 2 || !tgt) return null;
    const s = path[0];
    const fx = wrap(tgt.yaw - s[1]);
    const fy = tgt.pitch - s[2];
    const D = Math.hypot(fx, fy);
    if (D < Math.max(3, rDeg * 3)) return null;
    const ux = fx / D;
    const uy = fy / D;
    const tol = rDeg + D * 0.05;
    let maxAlong = -Infinity;
    let stopAlong = null;
    let moving = false;
    let j = 0;
    for (let i = 1; i < path.length; i += 1) {
      const p = path[i];
      const along = wrap(p[1] - s[1]) * ux + (p[2] - s[2]) * uy;
      if (along > maxAlong) maxAlong = along;
      // velocita' su almeno 30 ms: il mouse non manda movimento a ogni fotogramma
      while (j < i - 1 && p[0] - path[j + 1][0] >= 0.03) j += 1;
      const q = path[j];
      const dt = p[0] - q[0];
      if (dt < 0.03) continue;
      const sp = Math.hypot(wrap(p[1] - q[1]), p[2] - q[2]) / dt;
      if (sp >= 60) moving = true;
      else if (moving && stopAlong == null && sp < 20) stopAlong = along;
    }
    if (maxAlong > D + tol) return "over";
    if (stopAlong != null && stopAlong < D - tol) return "under";
    return "clean";
  }

  // Dove e' finito un colpo mancato rispetto al flick: oltre, corto o di lato (null se non c'era flick).
  function missKind(start, aim, tgt, rDeg) {
    if (!start || !tgt) return null;
    const fx = wrap(tgt.yaw - start[1]);
    const fy = tgt.pitch - start[2];
    const D = Math.hypot(fx, fy);
    if (D < Math.max(3, rDeg * 3)) return null;
    const ux = fx / D;
    const uy = fy / D;
    const ox = wrap(aim.yaw - tgt.yaw);
    const oy = aim.pitch - tgt.pitch;
    const along = ox * ux + oy * uy;
    const lat = -ox * uy + oy * ux;
    if (Math.abs(along) >= Math.abs(lat)) return along > 0 ? "over" : "under";
    return "side";
  }

  /* ------------------------------------------------------------ stanza */
  // Stanza: pavimento a -1.6 m (occhi a 1,6 m), soffitto a 6 m. Le teste stanno a quota 0.
  const ROOM = { x: [-24, 24], y: [-1.6, 6], z: [-24, 30] };
  const HEAD_Y = -0.02; // centro della testa delle sagome (vedi botParts)

  // Sagoma: corpo come box verticale, testa come sfera.
  function botParts(x, z, crouch = false) {
    const top = crouch ? -0.55 : -0.18;
    return {
      body: { min: [x - 0.25, ROOM.y[0], z - 0.18], max: [x + 0.25, top, z + 0.18] },
      head: { c: [x, top + 0.16, z], r: 0.13 }
    };
  }

  // Movimento laterale (counter-strafe): velocita' di corsa e accelerazioni del modello.
  const STRAFE = { lane: 3, depth: 1.5, max: 6.75, acc: 40, friction: 22, still: 1.0 };

  /*
   * Fucili di precisione di Valorant (dati controllati a ottobre 2026: Liquipedia per l'Operator,
   * note delle patch 2.03 e 3.0 per il Marshal, TheSpike per l'Outlaw; nessuna modifica a Operator e
   * Marshal nelle patch 13.x, l'Outlaw ha avuto un ritocco al rinculo nella 13.01).
   * Danni per colpo; i nemici hanno 150 punti tra vita (100) e scudo pesante (50).
   * scopedMove: velocita' di movimento nello scope rispetto a quella normale.
   */
  const WEAPONS = {
    operator: { id: "operator", name: "Operator", price: 4700, rps: 0.6, zooms: [2.5, 5], dmg: { head: 255, body: 150, legs: 120 }, mag: 5, scopedMove: 0.72, pen: "alta", unscope: true },
    marshal: { id: "marshal", name: "Marshal", price: 950, rps: 1.5, zooms: [3.5], dmg: { head: 202, body: 101, legs: 85 }, mag: 5, scopedMove: 0.9, pen: "media", unscope: true },
    outlaw: { id: "outlaw", name: "Outlaw", price: 2400, rps: 2.75, zooms: [3.5], dmg: { head: 238, body: 140, legs: 119 }, mag: 2, scopedMove: 0.8, pen: "alta", unscope: false, info: true }
  };
  const HP = 150;
  // Modello dell'app (non un dato di Valorant): lo scope entra in 0,15 s; prima i colpi sono imprecisi.
  const SCOPE_IN = 0.15;
  // Campo visivo con lo zoom: in Valorant l'ingrandimento divide il campo visivo (103 / 2,5 = 41,2 gradi).
  function scopeFov(zoom) { return FOV_H / zoom; }
  // Gradi per unita' di mouse nello scope rispetto a senza: moltiplicatore / zoom (1,0 = predefinito di Valorant).
  function scopeFactor(zoom, mult = 1) { return (num(mult) && mult > 0 ? mult : 1) / zoom; }
  // Moltiplicatore che rende uguali i piccoli movimenti vicino al mirino (0% della distanza sullo schermo).
  function zeroMatch(zoom) {
    const fz = scopeFov(zoom);
    return (Math.tan((fz / 2) * DEG) / Math.tan((FOV_H / 2) * DEG)) / (fz / FOV_H);
  }

  /* ------------------------------------------------------------ scenari */
  const LEVELS = [{ id: 1, name: "Base" }, { id: 2, name: "Avanzato" }, { id: 3, name: "Pro" }];

  const SCENARIOS = [
    {
      id: "gridshot", name: "Gridshot", trains: "Velocità e flick brevi", duration: 60,
      text: "Tre bersagli alla volta su una griglia davanti a te: colpiscili il più in fretta possibile senza sprecare colpi.",
      tip: "Non inseguire il bersaglio: guarda il prossimo prima di sparare e lascia che il mouse arrivi lì.",
      levels: ["Bersagli grandi", "Bersagli medi", "Bersagli piccoli"],
      lv: { 1: { r: 0.42 }, 2: { r: 0.32 }, 3: { r: 0.24 } },
      up: { key: "acc", min: 90 }
    },
    {
      id: "microshot", name: "Precisione", trains: "Micro-correzioni sulla testa", duration: 60,
      text: "Un bersaglio piccolo come una testa, vicino al centro: un colpo preciso alla volta.",
      tip: "Movimenti corti col polso, mirino fermo prima del clic. La precisione viene prima della velocità.",
      levels: ["Testa grande, vicino al centro", "Testa più piccola, più sparsa", "Testa piccola, tutto lo schermo"],
      lv: { 1: { r: 0.14, yaw: 11, pitch: [-4, 6] }, 2: { r: 0.11, yaw: 16, pitch: [-6, 8] }, 3: { r: 0.085, yaw: 22, pitch: [-8, 10] } },
      up: { key: "acc", min: 90 }
    },
    {
      id: "headline", name: "Linea della testa", trains: "Mirino all'altezza della testa e flick orizzontali", duration: 60,
      text: "Le teste compaiono sempre alla stessa altezza, a destra e a sinistra: tieni il mirino su quella linea e muoviti solo di lato.",
      tip: "Il numero da guardare è l'errore in altezza: più è vicino a 0 gradi, meno correzioni verticali farai in partita.",
      levels: ["Vicine, davanti a te", "Più lontane e più larghe", "Lontane, fino ai lati"],
      lv: { 1: { dist: [10, 18], yaw: 42 }, 2: { dist: [12, 24], yaw: 55 }, 3: { dist: [16, 30], yaw: 70 } },
      up: { key: "acc", min: 90 }
    },
    {
      id: "strafe", name: "Counter-strafe", trains: "Fermarsi prima di sparare (tasti A e D)", duration: 0, reps: 20,
      text: "Ti muovi a destra e a sinistra con A e D. Il nemico esce mentre corri: fermati e colpiscilo alla testa. Come in Valorant, i colpi sparati in movimento vanno a caso.",
      tip: "Per fermarti subito tocca il tasto opposto (se vai a destra con D, un tocco di A), poi spara: la barra in basso diventa verde quando sei fermo.",
      levels: ["Resta 2 secondi", "Resta 1,5 secondi", "Resta 1,1 secondi, più lontano"],
      lv: { 1: { life: 2.0, dist: [10, 15], yaw: 25 }, 2: { life: 1.5, dist: [12, 20], yaw: 32 }, 3: { life: 1.1, dist: [15, 26], yaw: 40 } },
      up: { key: "win", min: 85 },
      keys: true
    },
    {
      id: "peek", name: "Peek dagli angoli", trains: "Reazione e one-tap alla testa", duration: 0, reps: 20,
      text: "Una sagoma esce da dietro un muro e rientra: colpiscila alla testa prima che sparisca. Il corpo non basta.",
      tip: "Tieni il mirino sul bordo del muro, all'altezza della testa: devi solo cliccare, non correre dietro alla sagoma.",
      levels: ["Resta fuori a lungo", "Resta fuori poco", "Esce e rientra subito"],
      lv: { 1: { speed: [4.6, 5.8], hold: [0.35, 0.7] }, 2: { speed: [5.2, 6.4], hold: [0.25, 0.5] }, 3: { speed: [5.8, 6.8], hold: [0.16, 0.32] } },
      up: { key: "win", min: 85 }
    },
    {
      id: "duel", name: "Duelli ADAD", trains: "One-tap alla testa su un nemico che si muove", duration: 0, reps: 20,
      text: "Un nemico compare e si sposta a destra e sinistra come in un duello vero. Colpiscilo alla testa prima che spari lui.",
      tip: "Non inseguirlo con tutto il braccio: aspetta che la testa passi nel mirino o anticipala di poco, poi un clic secco.",
      levels: ["Ti lascia 1,3 secondi", "Ti lascia 0,95 secondi", "Ti lascia 0,65 secondi, scatti veloci"],
      lv: {
        1: { window: 1.3, speed: [3.5, 5], change: [0.3, 0.9], dist: [10, 15], yaw: 30 },
        2: { window: 0.95, speed: [4.5, 6], change: [0.22, 0.75], dist: [12, 20], yaw: 36 },
        3: { window: 0.65, speed: [5.5, 6.75], change: [0.15, 0.55], dist: [15, 25], yaw: 42 }
      },
      up: { key: "win", min: 85 }
    },
    {
      id: "tracking", name: "Tracking ADAD", trains: "Seguire un nemico che scatta a destra e sinistra", duration: 45,
      text: "Una sagoma si sposta a destra e sinistra cambiando direzione a caso, come uno strafe ADAD. Tieni premuto e restale addosso.",
      tip: "Guarda il busto, non i piedi, e anticipa i cambi di direzione con piccoli movimenti fluidi.",
      levels: ["Cambi lenti", "Cambi più rapidi, più lontana", "Scatti veloci, lontana"],
      lv: {
        1: { speed: [3.8, 6], change: [0.22, 0.85], z: 10, bound: 5.5 },
        2: { speed: [4.5, 6.75], change: [0.18, 0.7], z: 12, bound: 5.5 },
        3: { speed: [5.5, 7.5], change: [0.12, 0.55], z: 14, bound: 5.5 }
      },
      up: { key: "track", min: 65 }
    },
    {
      id: "reflex", name: "Riflessi", trains: "Tempo di reazione e primo flick", duration: 0, reps: 20,
      text: "Aspetta il bersaglio: compare dopo un attimo a caso. Colpiscilo prima che sparisca. Cliccare prima che compaia è una partenza anticipata.",
      tip: "Non anticipare il clic. Il tempo che conta è dal bersaglio che compare al colpo a segno.",
      levels: ["Grande, resta 1,6 secondi", "Medio, resta 1,15 secondi", "Piccolo, resta 0,85 secondi"],
      lv: { 1: { r: 0.3, life: 1.6, yaw: 26, pitch: [-9, 11] }, 2: { r: 0.22, life: 1.15, yaw: 35, pitch: [-12, 14] }, 3: { r: 0.16, life: 0.85, yaw: 45, pitch: [-15, 18] } },
      up: { key: "win", min: 85 }
    },
    {
      id: "opflick", name: "Flick con lo scope", weapon: "operator", trains: "Arrivare sul nemico, entrare nello scope e sparare", duration: 0, reps: 15,
      text: "Un nemico fermo compare lontano, in un punto a caso. Sei senza scope: gira il mirino verso di lui, entra nello scope con il tasto destro e colpiscilo prima che spari lui. Con l'Operator basta il busto.",
      tip: "Fai il grosso del movimento senza scope ed entra nello scope quando il mirino è già quasi sul nemico: nello scope sistemi solo di poco.",
      levels: ["Vicino, ti lascia 2,4 secondi", "Più largo, 1,9 secondi", "Tutto lo schermo, 1,5 secondi"],
      lv: { 1: { yaw: [8, 24], dist: [16, 22], window: 2.4 }, 2: { yaw: [12, 36], dist: [18, 26], window: 1.9 }, 3: { yaw: [16, 50], dist: [20, 28], window: 1.5 } },
      up: { key: "win", min: 85 }
    },
    {
      id: "ophold", name: "Tieni l'angolo", weapon: "operator", trains: "Mirino pronto sul passaggio, un clic quando esce", duration: 0, reps: 15,
      text: "Entra nello scope sul passaggio tra i due muri. Un nemico lo attraversa: spara quando entra nel mirino. Un colpo sul muro o a vuoto ti costa il caricamento, e lui passa.",
      tip: "Non inseguirlo: tieni il mirino fermo vicino al bordo da cui esce, all'altezza del petto, e clicca appena lo vedi. Dopo il colpo rientra subito nello scope.",
      levels: ["Cammina, passaggio largo", "Corre, passaggio medio", "Corre, passaggio stretto e più lontano"],
      lv: { 1: { speed: 3.0, gap: 3.2, z: 18 }, 2: { speed: 5.4, gap: 2.6, z: 22 }, 3: { speed: 6.75, gap: 2.0, z: 26 } },
      up: { key: "win", min: 80 }
    },
    {
      id: "marshalhead", name: "Marshal alla testa", weapon: "marshal", trains: "Colpo alla testa su un nemico che si sposta", duration: 0, reps: 20,
      text: "Un nemico si sposta a destra e sinistra a media distanza. Con il Marshal serve la testa: un colpo al corpo fa 101 danni e non basta contro 150 punti tra vita e scudo. Due al corpo bastano, se ti dà il tempo.",
      tip: "Resta nello scope con il mirino all'altezza della testa e lascia che la testa ci passi dentro. Dopo un colpo al corpo rientra subito nello scope per il secondo.",
      levels: ["Ti lascia 1,8 secondi", "Ti lascia 1,4 secondi", "Ti lascia 1 secondo, scatti veloci"],
      lv: {
        1: { window: 1.8, speed: [2.5, 4], change: [0.4, 1.0], dist: [14, 20], yaw: 20 },
        2: { window: 1.4, speed: [3.5, 5.5], change: [0.3, 0.8], dist: [16, 24], yaw: 26 },
        3: { window: 1.0, speed: [4.5, 6.75], change: [0.2, 0.6], dist: [18, 28], yaw: 32 }
      },
      up: { key: "win", min: 80 }
    },
    {
      id: "quickscope", name: "Quickscope", weapon: "marshal", trains: "Scope e colpo veloci, senza anticipare", duration: 0, reps: 20,
      text: "Un nemico compare vicino al mirino e resta poco. Entra nello scope e spara subito, ma non prima che lo scope sia entrato: un colpo sparato a metà va storto. Serve la testa o due colpi al corpo.",
      tip: "Due tempi: tasto destro, poi clic appena l'immagine si ingrandisce. Con l'allenamento il secondo tempo si accorcia, ma non si salta.",
      levels: ["Resta 1,2 secondi", "Resta 0,9 secondi", "Resta 0,65 secondi"],
      lv: { 1: { life: 1.2, yaw: [3, 8], dist: [12, 18] }, 2: { life: 0.9, yaw: [3, 10], dist: [14, 22] }, 3: { life: 0.65, yaw: [4, 12], dist: [16, 26] } },
      up: { key: "win", min: 80 }
    },
    {
      id: "senstest", name: "Prova sensibilità", trains: "Flick, precisione e tracking", duration: 40, hidden: true,
      text: "Tre fasi: flick lunghi e corti, bersagli piccoli e vicini, tracking tenendo premuto. Serve a confrontare due sensibilità.",
      tip: "Gioca come in partita: preciso, senza strafare.",
      phases: [
        { name: "Flick", until: 16, text: "Flick lunghi e corti" },
        { name: "Precisione", until: 28, text: "Bersagli piccoli e vicini" },
        { name: "Tracking", until: 40, text: "Tieni premuto e seguila", hold: true }
      ]
    }
  ];
  const SCN = new Map(SCENARIOS.map((s) => [s.id, s]));
  const VISIBLE = SCENARIOS.filter((s) => !s.hidden).map((s) => s.id);
  const ROUTINE = ["gridshot", "microshot", "headline", "strafe", "peek", "duel", "tracking"];
  const SNIPER = SCENARIOS.filter((s) => s.weapon).map((s) => s.id);
  const SNIPER_ROUTINE = ["opflick", "ophold", "marshalhead", "quickscope"];
  const HEAD_ONLY = ["peek", "duel", "strafe"];

  /*
   * Crea uno scenario. Interfaccia:
   *   sc.update(dt, aim)  aim = { yaw, pitch, holding, move (-1 sinistra, 0, 1 destra) }
   *   sc.shoot(aim)       -> { hit, head, kill, blocked, early }
   *   sc.targets          sfere { id, c, r, born, kind }
   *   sc.bots             sagome { id, x, z, crouch, visible, born }
   *   sc.covers, sc.decor box da disegnare (i muri delle coperture bloccano i colpi)
   *   sc.eye              posizione degli occhi (cambia solo nel counter-strafe)
   *   sc.holdMode         true quando conta tenere premuto (tracking)
   *   sc.done, sc.time, sc.stats()
   */
  function createScenario(id, { seed = Date.now(), aim = { yaw: 0, pitch: 0 }, lv = 1 } = {}) {
    const def = SCN.get(id);
    if (!def) throw new Error(`scenario sconosciuto: ${id}`);
    const level = def.lv && def.lv[lv] ? lv : 1;
    const P = def.lv ? def.lv[level] : {};
    const rand = rng(seed);
    const NSEG = def.duration ? 6 : 4;
    const zeros = () => new Array(NSEG).fill(0);
    const sc = {
      id, def, lv: level, P, time: 0, done: false,
      targets: [], bots: [], covers: [], decor: [], effects: [], eye: [0, 0, 0],
      holdMode: id === "tracking", phase: 0, hint: "",
      shots: 0, hits: 0, heads: 0, kills: 0, body: 0, misses: 0, escaped: 0, wall: 0, early: 0, lost: 0,
      moving: 0, still: 0, behind: 0, ahead: 0,
      points: 0, ttk: [], rt: [], stop: [],
      onTarget: 0, trackTime: 0, holdTime: 0, lagT: 0, leadT: 0, highT: 0, errSum: 0, reacq: [], rc: null,
      vertSum: 0, vertSigned: 0, vertN: 0,
      path: [[0, aim.yaw || 0, aim.pitch || 0]], resetPath: false,
      flick: { c: 0, o: 0, u: 0 }, miss: { o: 0, u: 0, s: 0 },
      bins: { s: [0, 0, 0], m: [0, 0, 0], l: [0, 0, 0] },
      bias: { x: 0, y: 0, n: 0, r: 0 },
      segK: zeros(), segS: zeros(), segH: zeros(), segOn: zeros(), segT: zeros(),
      rep: 0, wait: 0, nextId: 1, lastKillAt: 0, vx: 0, stillSince: 0, movedFor: 0,
      weapon: def.weapon ? WEAPONS[def.weapon] : null, nextShot: 0, unscoped: 0, earlyScope: 0, legs: 0, scopeT: []
    };
    const between = (a, b) => a + rand() * (b - a);
    const spherePoint = (yaw, pitch, dist) => { const d = dir(yaw, pitch); return [d[0] * dist, d[1] * dist, d[2] * dist]; };
    const rel = (c) => sub(c, sc.eye);
    const addTarget = (c, r, extra = {}) => { const t = { id: sc.nextId++, c, r, born: sc.time, ...extra }; sc.targets.push(t); return t; };
    const killTarget = (t) => { sc.targets = sc.targets.filter((x) => x !== t); sc.effects.push({ c: t.c, t: sc.time, kind: t.kind === "head" ? "head" : "hit" }); };
    const segNow = () => (def.duration
      ? Math.min(NSEG - 1, Math.floor((sc.time / def.duration) * NSEG))
      : Math.min(NSEG - 1, Math.floor((sc.rep / def.reps) * NSEG)));
    // fine di una ripetizione (scenari a ripetizioni)
    const endRep = (success) => {
      const seg = segNow();
      if (success) sc.segK[seg] += 1;
      sc.rep += 1;
      sc.wait = id === "reflex" ? between(0.7, 1.9) : between(0.5, 1.2);
      // cecchino: il prossimo nemico arriva dopo il caricamento del colpo (e il tempo di rientrare nello scope)
      if (sc.weapon) sc.wait += Math.max(0, sc.nextShot - sc.time) + 0.3;
      if (id === "strafe") sc.movedFor = 0;
      if (sc.rep >= def.reps) sc.done = true;
    };
    // direzione media dei colpi rispetto al centro del bersaglio (solo colpi vicini al bersaglio)
    const addBias = (a, tg, rDeg) => {
      const dx = wrap(a.yaw - tg.yaw);
      const dy = a.pitch - tg.pitch;
      if (Math.hypot(dx, dy) > rDeg * 3 + 2) return;
      sc.bias.x += dx;
      sc.bias.y += dy;
      sc.bias.r += rDeg;
      sc.bias.n += 1;
    };

    /* ---- movimento a destra e sinistra (tracking, duelli, prova sens) */
    const stepAdad = (b, dt, Q, rnd) => {
      b.dirLeft -= dt;
      if (b.dirLeft <= 0) {
        b.v = (b.v > 0 ? -1 : 1) * (Q.speed[0] + rnd() * (Q.speed[1] - Q.speed[0]));
        b.dirLeft = Q.change[0] + rnd() * (Q.change[1] - Q.change[0]);
        b.changed = true;
      }
      b.s += b.v * dt;
      if (b.s > Q.bound) { b.s = Q.bound; b.v = -Math.abs(b.v); b.changed = true; }
      if (b.s < -Q.bound) { b.s = -Q.bound; b.v = Math.abs(b.v); b.changed = true; }
    };

    // Misura del tracking su una sagoma: tempo addosso, dietro o davanti, riaggancio dopo i cambi.
    const measureTrack = (dt, a, b) => {
      sc.trackTime += dt;
      const seg = segNow();
      sc.segT[seg] += dt;
      const parts = botParts(b.x, b.z);
      const f = dir(a.yaw, a.pitch);
      const on = raySphere(f, parts.head.c, parts.head.r) >= 0 || rayBox(f, parts.body) >= 0;
      if (b.changed) {
        b.changed = false;
        if (sc.rc && sc.rc.lost) sc.reacq.push(Math.min(1, sc.time - sc.rc.t0));
        sc.rc = { t0: sc.time, lost: !on };
      }
      if (!a.holding) return;
      sc.holdTime += dt;
      if (on) { sc.onTarget += dt; sc.segOn[seg] += dt; }
      const ex = wrap(a.yaw - anglesTo([b.x, -0.6, b.z]).yaw);
      sc.errSum += Math.abs(ex) * dt;
      // fuori dalla sagoma: di lato (dietro o davanti, rispetto a dove va) oppure in altezza
      if (!on) {
        const half = Math.atan2(0.3, Math.hypot(b.x, b.z)) / DEG;
        if (Math.abs(ex) <= half) sc.highT += dt;
        else if (ex * b.v > 0) sc.leadT += dt;
        else sc.lagT += dt;
      }
      if (sc.rc) {
        if (!on) sc.rc.lost = true;
        else if (sc.rc.lost) { sc.reacq.push(sc.time - sc.rc.t0); sc.rc = null; } else if (sc.time - sc.rc.t0 > 0.25) { sc.reacq.push(0); sc.rc = null; }
      }
    };

    /* ---- gridshot: 3 bersagli su una griglia 5x5 */
    if (id === "gridshot") {
      const spots = [];
      for (let i = 0; i < 5; i += 1) for (let j = 0; j < 5; j += 1) spots.push([(i - 2) * 1.35, 0.8 + (j - 2) * 1.0, 11]);
      const spawn = () => {
        const free = spots.filter((s) => !sc.targets.some((t) => t.c === s));
        addTarget(free[Math.floor(rand() * free.length)], P.r);
      };
      for (let k = 0; k < 3; k += 1) spawn();
      sc.onKill = () => spawn();
    }

    /* ---- precisione: un bersaglio piccolo vicino al centro */
    if (id === "microshot") {
      const spawn = () => addTarget(spherePoint(between(-P.yaw, P.yaw), between(P.pitch[0], P.pitch[1]), 12), P.r);
      spawn();
      sc.onKill = () => spawn();
    }

    /* ---- linea della testa: teste alla stessa quota */
    if (id === "headline") {
      const spawn = () => {
        const p = spherePoint(between(-P.yaw, P.yaw), 0, between(P.dist[0], P.dist[1]));
        addTarget([p[0], HEAD_Y, p[2]], 0.13, { kind: "head" });
      };
      spawn();
      sc.onKill = () => spawn();
    }

    /* ---- riflessi: compare dopo un'attesa a caso, sparisce dopo un po' */
    if (id === "reflex") {
      sc.wait = between(0.8, 2.0);
      sc.onKill = (t) => { sc.rt.push(sc.time - t.born); endRep(true); };
      sc.tick = (dt) => {
        if (sc.targets.length) {
          const t = sc.targets[0];
          if (sc.time - t.born > P.life) { sc.targets = []; sc.escaped += 1; endRep(false); }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) {
          addTarget(spherePoint(between(-P.yaw, P.yaw), between(P.pitch[0], P.pitch[1]), 11), P.r);
          sc.resetPath = true;
        }
      };
    }

    /* ---- prova sensibilita': flick, precisione, tracking (ogni fase con i suoi bersagli fissi) */
    if (id === "senstest") {
      const PH = def.phases.map((p) => p.until);
      const randF = rng(seed ^ 0x2545f491);
      const randP = rng(seed ^ 0x6c078965);
      const randT = rng(seed ^ 0x9e3779b9);
      const inF = (a, b) => a + randF() * (b - a);
      const inP = (a, b) => a + randP() * (b - a);
      sc.ph = [0, 1, 2].map(() => ({ shots: 0, hits: 0, kills: 0 }));
      let flip = 0;
      // un flick verso il centro quando si e' gia' vicini al bordo
      const away = (from, amount, limit) => (Math.abs(from + amount) > limit ? from - amount : from + amount);
      const spawnFlick = (a) => {
        flip += 1;
        const long = flip % 2 === 1;
        const ang = inF(0, Math.PI * 2);
        const amount = long ? inF(18, 70) : inF(3, 8);
        const yaw = away(a.yaw, Math.cos(ang) * amount, 85);
        const pitch = clamp(away(a.pitch, Math.sin(ang) * amount * 0.35, 18), -15, 22);
        addTarget(spherePoint(yaw, pitch, 12), long ? 0.26 : 0.16);
      };
      const spawnPrec = (a) => {
        const ang = inP(0, Math.PI * 2);
        const amount = inP(2, 6);
        const yaw = away(a.yaw, Math.cos(ang) * amount, 85);
        const pitch = clamp(away(a.pitch, Math.sin(ang) * amount * 0.6, 16), -12, 18);
        addTarget(spherePoint(yaw, pitch, 10), 0.1);
      };
      const T = { speed: [4, 6], change: [0.25, 0.8], bound: 4.5 };
      let bot = null;
      sc.tick = (dt, a) => {
        const ph = sc.time < PH[0] ? 0 : sc.time < PH[1] ? 1 : 2;
        if (ph !== sc.phase) {
          sc.phase = ph;
          sc.targets = [];
          sc.resetPath = true;
          if (ph === 1) spawnPrec(a);
          if (ph === 2) {
            sc.holdMode = true;
            bot = { id: sc.nextId++, s: 0, x: 0, z: 11, v: randT() < 0.5 ? -T.speed[0] : T.speed[0], dirLeft: 0.3 + randT() * 0.4, crouch: false, visible: true, born: sc.time };
            sc.bots.push(bot);
          }
        }
        if (ph === 2 && bot) {
          stepAdad(bot, dt, T, randT);
          bot.x = bot.s;
          measureTrack(dt, a, bot);
        }
      };
      sc.onKill = (t, a) => (sc.phase === 0 ? spawnFlick(a) : spawnPrec(a));
      spawnFlick({ yaw: aim.yaw || 0, pitch: aim.pitch || 0 });
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
        const x0 = l.side > 0 ? l.x - W : l.x;
        sc.covers.push({ min: [x0, ROOM.y[0], l.z - 0.6], max: [x0 + W, 1.6, l.z - 0.2] });
      });
      const wallBefore = (pt) => {
        const d = len(pt);
        const to = pt.map((v) => v / d);
        return sc.covers.reduce((m, c) => { const t = rayBox(to, c); return t >= 0 && t < m ? t : m; }, Infinity);
      };
      sc.wait = between(0.6, 1.4);
      sc.tick = (dt) => {
        if (sc.bots.length) {
          const b = sc.bots[0];
          const age = sc.time - b.born;
          // esce (0..out), si ferma (hold), rientra
          if (age < b.out) b.x = b.start + b.side * b.speed * age;
          else if (age < b.out + b.hold) b.x = b.start + b.side * b.speed * b.out;
          else b.x = b.start + b.side * b.speed * Math.max(0, b.out - (age - b.out - b.hold));
          // visibile quando si vede la testa (il centro o il bordo che esce) dalla tua posizione
          const hp = botParts(b.x, b.z).head;
          const seen = (pt) => wallBefore(pt) > len(pt);
          b.visible = seen(hp.c) || seen([hp.c[0] + b.side * hp.r * 0.8, hp.c[1], hp.c[2]]);
          if (b.visible && b.seenAt == null) { b.seenAt = sc.time; sc.resetPath = true; }
          if (age > b.out * 2 + b.hold) { sc.bots = []; sc.escaped += 1; endRep(false); }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) {
          const l = lanes[Math.floor(rand() * lanes.length)];
          const speed = between(P.speed[0], P.speed[1]);
          // parte nascosta: abbastanza dietro il muro da non vedersi dalla tua posizione
          const hidden = (x) => { const head = botParts(x, l.z + 0.4).head.c; return wallBefore(head) < len(head); };
          let start = l.x - l.side * 0.35;
          while (!hidden(start) && Math.abs(start - l.x) < W - 0.3) start -= l.side * 0.1;
          sc.bots.push({ id: sc.nextId++, lane: l, edge: l.x, start, side: l.side, x: start, z: l.z + 0.4, speed, out: between(0.3, 0.42), hold: between(P.hold[0], P.hold[1]), born: sc.time, seenAt: null, visible: false });
        }
      };
    }

    /* ---- duelli: un nemico che si sposta a destra e sinistra e spara dopo un po' */
    if (id === "duel") {
      sc.wait = between(0.6, 1.2);
      const Q = { speed: P.speed, change: P.change, bound: 2.2 };
      sc.tick = (dt) => {
        if (sc.bots.length) {
          const b = sc.bots[0];
          stepAdad(b, dt, Q, rand);
          b.changed = false;
          b.x = b.base[0] + b.L[0] * b.s;
          b.z = b.base[2] + b.L[2] * b.s;
          if (sc.time - b.born > P.window) {
            sc.lost += 1;
            sc.effects.push({ c: botParts(b.x, b.z).head.c, t: sc.time, kind: "lost" });
            sc.bots = [];
            endRep(false);
          }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) {
          const yaw = between(-P.yaw, P.yaw);
          const p = spherePoint(yaw, 0, between(P.dist[0], P.dist[1]));
          const L = [Math.cos(yaw * DEG), 0, -Math.sin(yaw * DEG)];
          const s = between(-1, 1);
          sc.bots.push({ id: sc.nextId++, base: [p[0], 0, p[2]], L, s, v: (rand() < 0.5 ? -1 : 1) * between(P.speed[0], P.speed[1]), dirLeft: between(P.change[0], P.change[1]), x: p[0] + L[0] * s, z: p[2] + L[2] * s, crouch: false, visible: true, born: sc.time });
          sc.resetPath = true;
        }
      };
    }

    /* ---- counter-strafe: ti muovi con A e D, il nemico esce mentre corri */
    if (id === "strafe") {
      const S = STRAFE;
      sc.decor.push(
        { min: [-S.lane - 0.5, ROOM.y[0], -1.4], max: [-S.lane - 0.3, ROOM.y[0] + 0.3, 1.4] },
        { min: [S.lane + 0.3, ROOM.y[0], -1.4], max: [S.lane + 0.5, ROOM.y[0] + 0.3, 1.4] }
      );
      sc.wait = between(0.4, 0.9);
      sc.tick = (dt, a) => {
        const m = a.move > 0 ? 1 : a.move < 0 ? -1 : 0;
        if (m) {
          const step = S.acc * dt;
          sc.vx += clamp(m * S.max - sc.vx, -step, step);
        } else {
          const step = S.friction * dt;
          sc.vx = Math.abs(sc.vx) <= step ? 0 : sc.vx - Math.sign(sc.vx) * step;
        }
        // A e D muovono a sinistra e destra rispetto a dove guardi, come in Valorant
        const yr = (a.yaw || 0) * DEG;
        let x = sc.eye[0] + Math.cos(yr) * sc.vx * dt;
        let z = sc.eye[2] - Math.sin(yr) * sc.vx * dt;
        const nx = clamp(x, -S.lane, S.lane);
        const nz = clamp(z, -S.depth, S.depth);
        if (nx !== x || nz !== z) sc.vx = 0; // contro il bordo della corsia ti fermi
        sc.eye = [nx, 0, nz];
        const speed = Math.abs(sc.vx);
        if (speed > S.still) sc.stillSince = null;
        else if (sc.stillSince == null) sc.stillSince = sc.time;
        if (speed > 3) sc.movedFor += dt;
        if (sc.bots.length) {
          const b = sc.bots[0];
          sc.hint = speed > S.still ? "Fermati e spara" : "";
          if (sc.time - b.born > P.life) { sc.bots = []; sc.escaped += 1; endRep(false); }
          return;
        }
        sc.hint = sc.movedFor < 0.25 ? "Muoviti con A e D" : "";
        sc.wait -= dt;
        // esce solo mentre corri: per colpirlo devi fermarti
        if (sc.wait <= 0 && sc.movedFor >= 0.25 && speed > 2.5 && !sc.done) {
          const p = spherePoint(between(-P.yaw, P.yaw), 0, between(P.dist[0], P.dist[1]));
          sc.bots.push({ id: sc.nextId++, x: p[0], z: p[2], crouch: false, visible: true, born: sc.time });
          sc.resetPath = true;
        }
      };
    }

    /* ---- cecchino: flick con lo scope (un nemico fermo, lontano, in un punto a caso) */
    if (id === "opflick") {
      sc.wait = between(0.6, 1.2);
      sc.tick = (dt, a) => {
        if (sc.bots.length) {
          const b = sc.bots[0];
          if (sc.time - b.born > P.window) {
            sc.lost += 1;
            sc.effects.push({ c: botParts(b.x, b.z).head.c, t: sc.time, kind: "lost" });
            sc.bots = [];
            endRep(false);
          }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) {
          let side = rand() < 0.5 ? -1 : 1;
          const amount = between(P.yaw[0], P.yaw[1]);
          if (Math.abs(a.yaw + side * amount) > 80) side = -side;
          const p = spherePoint(a.yaw + side * amount, 0, between(P.dist[0], P.dist[1]));
          sc.bots.push({ id: sc.nextId++, x: p[0], z: p[2], hp: HP, crouch: false, visible: true, born: sc.time });
          sc.resetPath = true;
        }
      };
    }

    /* ---- cecchino: tieni l'angolo (un nemico attraversa il passaggio tra due muri) */
    if (id === "ophold") {
      const half = P.gap / 2;
      const z = P.z;
      sc.covers.push(
        { min: [-half - 6, ROOM.y[0], z - 0.5], max: [-half, 1.6, z - 0.1] },
        { min: [half, ROOM.y[0], z - 0.5], max: [half + 6, 1.6, z - 0.1] }
      );
      const wallBefore = (pt) => {
        const d = len(pt);
        const to = pt.map((v) => v / d);
        return sc.covers.reduce((m, c) => { const t = rayBox(to, c); return t >= 0 && t < m ? t : m; }, Infinity);
      };
      const seen = (pt) => wallBefore(pt) > len(pt);
      sc.wait = between(0.9, 2.0);
      sc.tick = (dt) => {
        if (sc.bots.length) {
          const b = sc.bots[0];
          b.x += b.side * P.speed * dt;
          const hp = botParts(b.x, b.z).head;
          b.visible = seen(hp.c) || seen([b.x, -0.6, b.z]) || seen([hp.c[0] + b.side * 0.25, -0.6, hp.c[2]]);
          if (b.visible && b.seenAt == null) { b.seenAt = sc.time; sc.resetPath = true; }
          if (b.side * b.x > half + 1.6) { sc.bots = []; sc.escaped += 1; endRep(false); }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) {
          const side = rand() < 0.5 ? -1 : 1;
          sc.bots.push({ id: sc.nextId++, side, x: -side * (half + 1.6), z: z + 0.6, hp: HP, crouch: false, visible: false, seenAt: null, born: sc.time });
        }
      };
    }

    /* ---- cecchino: Marshal alla testa (nemico che si sposta, spara dopo un po') */
    if (id === "marshalhead") {
      sc.wait = between(0.6, 1.2);
      const Q = { speed: P.speed, change: P.change, bound: 2.0 };
      sc.tick = (dt) => {
        if (sc.bots.length) {
          const b = sc.bots[0];
          stepAdad(b, dt, Q, rand);
          b.changed = false;
          b.x = b.base[0] + b.L[0] * b.s;
          b.z = b.base[2] + b.L[2] * b.s;
          if (sc.time - b.born > P.window) {
            sc.lost += 1;
            sc.effects.push({ c: botParts(b.x, b.z).head.c, t: sc.time, kind: "lost" });
            sc.bots = [];
            endRep(false);
          }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) {
          const yaw = between(-P.yaw, P.yaw);
          const p = spherePoint(yaw, 0, between(P.dist[0], P.dist[1]));
          const L = [Math.cos(yaw * DEG), 0, -Math.sin(yaw * DEG)];
          const s0 = between(-1, 1);
          sc.bots.push({ id: sc.nextId++, base: [p[0], 0, p[2]], L, s: s0, v: (rand() < 0.5 ? -1 : 1) * between(P.speed[0], P.speed[1]), dirLeft: between(P.change[0], P.change[1]), x: p[0] + L[0] * s0, z: p[2] + L[2] * s0, hp: HP, crouch: false, visible: true, born: sc.time });
          sc.resetPath = true;
        }
      };
    }

    /* ---- cecchino: quickscope (compare vicino al mirino e sparisce presto) */
    if (id === "quickscope") {
      sc.wait = between(0.7, 1.5);
      sc.tick = (dt, a) => {
        if (sc.bots.length) {
          const b = sc.bots[0];
          if (sc.time - b.born > P.life) { sc.bots = []; sc.escaped += 1; endRep(false); }
          return;
        }
        sc.wait -= dt;
        if (sc.wait <= 0 && !sc.done) {
          let side = rand() < 0.5 ? -1 : 1;
          const amount = between(P.yaw[0], P.yaw[1]);
          if (Math.abs(a.yaw + side * amount) > 80) side = -side;
          const p = spherePoint(a.yaw + side * amount, 0, between(P.dist[0], P.dist[1]));
          sc.bots.push({ id: sc.nextId++, x: p[0], z: p[2], hp: HP, crouch: false, visible: true, born: sc.time });
          sc.resetPath = true;
        }
      };
    }

    /* ---- tracking ADAD */
    if (id === "tracking") {
      const b = { id: sc.nextId++, s: 0, x: 0, z: P.z, v: rand() < 0.5 ? -P.speed[0] : P.speed[0], dirLeft: between(P.change[0], P.change[1]), crouch: false, visible: true, born: 0 };
      sc.bots.push(b);
      sc.tick = (dt, a) => { stepAdad(b, dt, P, rand); b.x = b.s; measureTrack(dt, a, b); };
    }

    sc.update = function update(dt, a = {}) {
      if (sc.done) return;
      const aim = { yaw: a.yaw || 0, pitch: a.pitch || 0, holding: !!a.holding, move: a.move || 0 };
      sc.time += dt;
      if (sc.tick) sc.tick(dt, aim);
      if (sc.resetPath) { sc.path = []; sc.resetPath = false; }
      sc.path.push([sc.time, aim.yaw, aim.pitch]);
      if (sc.path.length > 3000) sc.path.splice(1, sc.path.length - 3000);
      // linea della testa: quanto il mirino sta sopra o sotto la testa da colpire (in gradi)
      if (id === "headline") {
        const t = sc.targets[0];
        const linePitch = t ? anglesTo(rel(t.c)).pitch : Math.atan2(HEAD_Y, 14) / DEG;
        sc.vertSum += Math.abs(aim.pitch - linePitch) * dt;
        sc.vertSigned += (aim.pitch - linePitch) * dt;
        sc.vertN += dt;
      }
      if (def.duration && sc.time >= def.duration) { sc.time = def.duration; sc.done = true; }
      sc.effects = sc.effects.filter((e) => sc.time - e.t < 0.45);
    };

    function shootSpheres(a, f, seg) {
      let best = null;
      let bestT = Infinity;
      let near = null;
      let nearA = Infinity;
      sc.targets.forEach((t) => {
        const c = rel(t.c);
        const d = raySphere(f, c, t.r);
        if (d >= 0 && d < bestT) { bestT = d; best = t; }
        const ang = angleTo(f, c);
        if (ang < nearA) { nearA = ang; near = t; }
      });
      const goal = best || near;
      let tg = null;
      let rDeg = 0;
      let D = 0;
      if (goal) {
        const c = rel(goal.c);
        tg = anglesTo(c);
        rDeg = Math.atan2(goal.r, len(c)) / DEG;
        addBias(a, tg, rDeg);
        const s = sc.path[0];
        D = Math.hypot(wrap(tg.yaw - s[1]), tg.pitch - s[2]);
      }
      if (!best) {
        sc.misses += 1;
        sc.points -= id === "microshot" ? 40 : id === "reflex" ? 20 : 25;
        if (goal) {
          const k = missKind(sc.path[0], a, tg, rDeg);
          if (k) sc.miss[k[0]] += 1;
          sc.bins[binOf(D)][1] += 1;
        }
        return { hit: false };
      }
      sc.hits += 1;
      sc.kills += 1;
      sc.segH[seg] += 1;
      if (def.duration) sc.segK[seg] += 1;
      if (sc.ph) { sc.ph[sc.phase].hits += 1; sc.ph[sc.phase].kills += 1; }
      if (best.kind === "head") sc.heads += 1;
      const ttk = sc.time - Math.max(best.born, sc.lastKillAt);
      sc.ttk.push(ttk);
      sc.lastKillAt = sc.time;
      const k = flickKind(sc.path, tg, rDeg);
      if (k) sc.flick[k[0]] += 1;
      const bin = sc.bins[binOf(D)];
      bin[0] += 1;
      bin[2] += ttk;
      // punti: base + rapidita' (+ precisione nel centro per "precisione")
      const speed = Math.round(clamp(1 - (ttk - 0.25) / 0.9, 0, 1) * 50);
      const off = angleTo(f, rel(best.c)) / rDeg;
      const center = id === "microshot" ? Math.round(clamp(1 - off, 0, 1) * 40) : 0;
      sc.points += 100 + speed + center;
      killTarget(best);
      sc.path = [[sc.time, a.yaw, a.pitch]];
      if (sc.onKill) sc.onKill(best, a);
      return { hit: true, head: best.kind === "head", kill: true };
    }

    function shootBot(a, f, b, movingShot, seg) {
      const parts = botParts(b.x, b.z, b.crouch);
      const headC = rel(parts.head.c);
      const tHead = raySphere(f, headC, parts.head.r);
      const tBody = rayBox(f, { min: rel(parts.body.min), max: rel(parts.body.max) });
      const tWall = sc.covers.reduce((m, c) => { const t = rayBox(f, { min: rel(c.min), max: rel(c.max) }); return t >= 0 && t < m ? t : m; }, Infinity);
      const tg = anglesTo(headC);
      const rDeg = Math.atan2(parts.head.r, len(headC)) / DEG;
      addBias(a, tg, rDeg);
      const s = sc.path[0];
      const D = Math.hypot(wrap(tg.yaw - s[1]), tg.pitch - s[2]);
      const still = id === "strafe" || id === "peek"; // sagome ferme quando le colpisci (o quasi)
      if (tHead >= 0 && tHead < tWall) {
        sc.hits += 1;
        sc.heads += 1;
        sc.kills += 1;
        sc.segH[seg] += 1;
        const since = sc.time - (b.seenAt != null ? b.seenAt : b.born);
        sc.rt.push(since);
        sc.ttk.push(since);
        if (id === "strafe") { const k = flickKind(sc.path, tg, rDeg); if (k) sc.flick[k[0]] += 1; }
        if (still) { const bin = sc.bins[binOf(D)]; bin[0] += 1; bin[2] += since; }
        const window = id === "peek" ? 0.9 : id === "duel" ? P.window : P.life;
        sc.points += 150 + Math.round(clamp(1 - since / window, 0, 1) * 100);
        sc.effects.push({ c: parts.head.c, t: sc.time, kind: "head" });
        sc.bots = [];
        sc.path = [[sc.time, a.yaw, a.pitch]];
        endRep(true);
        return { hit: true, head: true, kill: true };
      }
      if (tBody >= 0 && tBody < tWall) {
        sc.hits += 1;
        sc.body += 1;
        sc.points += 10;
        sc.effects.push({ c: [b.x, -0.6, b.z], t: sc.time, kind: "body" });
        return { hit: true, head: false, kill: false };
      }
      sc.misses += 1;
      sc.points -= movingShot ? 30 : 15;
      const blocked = tWall < Infinity && ((tHead >= 0 && tHead >= tWall) || (tBody >= 0 && tBody >= tWall));
      if (blocked) sc.wall += 1;
      if (id === "duel") {
        const dx = wrap(a.yaw - tg.yaw);
        if (Math.abs(dx) > rDeg * 0.3) { if (dx * b.v > 0) sc.ahead += 1; else sc.behind += 1; }
      }
      if (id === "strafe" && !movingShot) {
        const k = missKind(s, a, tg, rDeg);
        if (k) sc.miss[k[0]] += 1;
        sc.bins[binOf(D)][1] += 1;
      }
      if (id === "peek" && !blocked) sc.bins[binOf(D)][1] += 1;
      return { hit: false, blocked };
    }

    // Colpo di un fucile di precisione: danno per parte del corpo (testa, busto, gambe), 150 punti da togliere.
    function shootSniper(a, f, b, seg) {
      const W = sc.weapon;
      const parts = botParts(b.x, b.z, b.crouch);
      const top = parts.body.max[1];
      const hip = ROOM.y[0] + (top - ROOM.y[0]) * 0.48;
      const headC = rel(parts.head.c);
      const tHead = raySphere(f, headC, parts.head.r);
      const tTorso = rayBox(f, { min: rel([parts.body.min[0], hip, parts.body.min[2]]), max: rel(parts.body.max) });
      const tLegs = rayBox(f, { min: rel(parts.body.min), max: rel([parts.body.max[0], hip, parts.body.max[2]]) });
      const tWall = sc.covers.reduce((m, c) => { const t = rayBox(f, { min: rel(c.min), max: rel(c.max) }); return t >= 0 && t < m ? t : m; }, Infinity);
      const tg = anglesTo(headC);
      const rDeg = Math.atan2(parts.head.r, len(headC)) / DEG;
      addBias(a, anglesTo(rel([b.x, -0.45, b.z])), Math.atan2(0.3, len(headC)) / DEG);
      const hits = [["head", tHead], ["body", tTorso], ["legs", tLegs]].filter(([, t]) => t >= 0 && t < tWall).sort((x, y) => x[1] - y[1]);
      if (!hits.length) {
        sc.misses += 1;
        sc.points -= 20;
        const blocked = tWall < Infinity && [tHead, tTorso, tLegs].some((t) => t >= 0 && t >= tWall);
        if (blocked) sc.wall += 1;
        return { hit: false, blocked };
      }
      const part = hits[0][0];
      b.hp -= W.dmg[part];
      sc.hits += 1;
      sc.segH[seg] += 1;
      if (part === "head") sc.heads += 1; else if (part === "body") sc.body += 1; else sc.legs += 1;
      const effectAt = part === "head" ? parts.head.c : [b.x, part === "body" ? -0.6 : -1.2, b.z];
      if (b.hp > 0) {
        sc.points += 25;
        sc.effects.push({ c: effectAt, t: sc.time, kind: "body" });
        return { hit: true, head: false, kill: false, part, dmg: W.dmg[part] };
      }
      sc.kills += 1;
      const since = sc.time - (b.seenAt != null ? b.seenAt : b.born);
      sc.rt.push(since);
      sc.ttk.push(since);
      if (num(a.scopeT)) sc.scopeT.push(a.scopeT);
      const k = flickKind(sc.path, tg, Math.max(rDeg, 0.6));
      if (k && id === "opflick") sc.flick[k[0]] += 1;
      const window = id === "opflick" || id === "marshalhead" ? P.window : id === "quickscope" ? P.life : 1.2;
      sc.points += 150 + Math.round(clamp(1 - since / window, 0, 1) * 100) + (part === "head" ? 30 : 0);
      sc.effects.push({ c: effectAt, t: sc.time, kind: part === "head" ? "head" : "hit" });
      sc.bots = [];
      sc.path = [[sc.time, a.yaw, a.pitch]];
      endRep(true);
      return { hit: true, head: part === "head", kill: true, part, dmg: W.dmg[part] };
    }

    // tempo che manca prima di poter sparare di nuovo (caricamento del colpo)
    sc.boltLeft = () => (sc.weapon ? Math.max(0, sc.nextShot - sc.time) : 0);

    sc.shoot = function shoot(a) {
      if (sc.done || sc.holdMode) return { hit: false };
      if (sc.weapon) {
        const W = sc.weapon;
        if (sc.time < sc.nextShot - 1e-6) return { hit: false, bolt: true };
        sc.nextShot = sc.time + 1 / W.rps;
        sc.shots += 1;
        const seg = segNow();
        sc.segS[seg] += 1;
        // senza scope il colpo va quasi a caso; a scope non ancora entrato e' storto
        let spread = 0;
        if (!a.scoped) { sc.unscoped += 1; spread = between(2.5, 6); } else if (!a.ready) { sc.earlyScope += 1; spread = between(0.8, 2.4); }
        let f = dir(a.yaw, a.pitch);
        if (spread) { const ang = rand() * Math.PI * 2; f = dir(a.yaw + Math.cos(ang) * spread, a.pitch + Math.sin(ang) * spread); }
        const out = sc.bots.length ? shootSniper(a, f, sc.bots[0], seg) : (sc.misses += 1, sc.points -= 20, { hit: false });
        out.unscope = W.unscope;
        out.spread = spread > 0;
        return out;
      }
      if (id === "reflex" && !sc.targets.length) { sc.early += 1; sc.points -= 30; return { hit: false, early: true }; }
      let f = dir(a.yaw, a.pitch);
      let movingShot = false;
      if (id === "strafe") {
        const speed = Math.abs(sc.vx);
        if (speed > STRAFE.still) {
          // come in Valorant: in corsa il colpo parte storto (piu' veloce, piu' storto)
          movingShot = true;
          sc.moving += 1;
          const amount = 1 + ((speed - STRAFE.still) / (STRAFE.max - STRAFE.still)) * 6;
          const ang = rand() * Math.PI * 2;
          f = dir(a.yaw + Math.cos(ang) * amount, a.pitch + Math.sin(ang) * amount);
        } else {
          sc.still += 1;
          if (sc.bots.length) sc.stop.push(sc.time - Math.max(sc.stillSince == null ? sc.time : sc.stillSince, sc.bots[0].born));
        }
      }
      sc.shots += 1;
      if (sc.ph) sc.ph[sc.phase].shots += 1;
      const seg = segNow();
      sc.segS[seg] += 1;
      if (sc.bots.length) return shootBot(a, f, sc.bots[0], movingShot, seg);
      if (HEAD_ONLY.includes(id)) { sc.misses += 1; sc.points -= movingShot ? 30 : 15; return { hit: false }; }
      return shootSpheres(a, f, seg);
    };

    sc.stats = function stats() {
      const st = {
        sc: id, lv: sc.lv, dur: r1(sc.time), shots: sc.shots, hits: sc.hits, kills: sc.kills, heads: sc.heads, misses: sc.misses
      };
      if (id === "tracking") st.acc = null;
      else st.acc = sc.shots ? r1(((HEAD_ONLY.includes(id) ? sc.heads : sc.hits) / sc.shots) * 100) : 0;
      st.kps = sc.time ? r2(sc.kills / sc.time) : 0;
      if (sc.ttk.length) { st.ttk = ms(avg(sc.ttk)); st.ttkMed = ms(median(sc.ttk)); st.ttkBest = ms(Math.min(...sc.ttk)); }
      if (sc.rt.length) {
        st.rt = ms(avg(sc.rt));
        st.rtMed = ms(median(sc.rt));
        st.rtBest = ms(Math.min(...sc.rt));
        const d = stdev(sc.rt);
        if (d != null) st.rtSd = ms(d);
        st.rts = sc.rt.map((v) => ms(v));
      }
      if (def.reps) { st.reps = def.reps; st.win = Math.round((sc.kills / def.reps) * 100); }
      if (sc.escaped) st.escaped = sc.escaped;
      const fl = sc.flick.c + sc.flick.o + sc.flick.u;
      if (fl) st.flick = { ...sc.flick };
      const mi = sc.miss.o + sc.miss.u + sc.miss.s;
      if (mi) st.miss = { ...sc.miss };
      const bins = {};
      Object.keys(sc.bins).forEach((k) => { const b = sc.bins[k]; if (b[0] + b[1]) bins[k] = [b[0], b[1], b[0] ? ms(b[2] / b[0]) : null]; });
      if (Object.keys(bins).length) st.bins = bins;
      if (sc.bias.n >= 3) st.bias = { x: r2(sc.bias.x / sc.bias.n), y: r2(sc.bias.y / sc.bias.n), r: r2(sc.bias.r / sc.bias.n), n: sc.bias.n };
      if (id === "tracking" || id === "senstest") {
        st.track = sc.trackTime ? r1((sc.onTarget / sc.trackTime) * 100) : 0;
        st.hold = sc.trackTime ? Math.round((sc.holdTime / sc.trackTime) * 100) : 0;
        const off = sc.holdTime - sc.onTarget;
        if (off > 0.05) {
          const tot = sc.lagT + sc.leadT + sc.highT || off;
          st.lag = Math.round((sc.lagT / tot) * 100);
          st.lead = Math.round((sc.leadT / tot) * 100);
          st.high = Math.max(0, 100 - st.lag - st.lead);
        }
        if (sc.holdTime > 0.05) st.err = r2(sc.errSum / sc.holdTime);
        if (sc.reacq.length) st.reacq = ms(avg(sc.reacq));
      }
      if (id === "tracking") st.seg = sc.segT.map((t, i) => (t ? r1((sc.segOn[i] / t) * 100) : null));
      else if (def.duration && id !== "senstest") { st.seg = sc.segK.slice(); st.segAcc = sc.segS.map((s, i) => (s ? Math.round((sc.segH[i] / s) * 100) : null)); } else if (def.reps) st.seg = sc.segK.slice();
      if (id === "headline" && sc.vertN) { st.vert = r2(sc.vertSum / sc.vertN); st.vertBias = r2(sc.vertSigned / sc.vertN); }
      if (id === "peek") { st.body = sc.body; st.wall = sc.wall; }
      if (id === "duel") { st.body = sc.body; st.lost = sc.lost; st.behind = sc.behind; st.ahead = sc.ahead; }
      if (id === "strafe") {
        st.body = sc.body;
        st.moving = sc.moving;
        st.still = sc.still;
        st.movingPct = sc.shots ? Math.round((sc.moving / sc.shots) * 100) : 0;
        if (sc.stop.length) st.stop = ms(avg(sc.stop));
      }
      if (id === "reflex") st.early = sc.early;
      if (sc.weapon) {
        st.acc = sc.shots ? r1((sc.hits / sc.shots) * 100) : 0;
        st.body = sc.body;
        st.legs = sc.legs;
        st.unscoped = sc.unscoped;
        st.earlyScope = sc.earlyScope;
        st.unscopedPct = sc.shots ? Math.round(((sc.unscoped + sc.earlyScope) / sc.shots) * 100) : 0;
        if (id === "opflick" || id === "marshalhead") st.lost = sc.lost;
        if (id === "ophold") st.wall = sc.wall;
        if (sc.scopeT.length) st.scopeT = ms(avg(sc.scopeT));
      }

      if (id === "tracking") {
        st.score = Math.round(st.track * 100);
      } else if (id === "reflex") {
        st.score = Math.max(0, Math.round(sc.rt.reduce((s, r) => s + 100 + clamp(1 - (r - 0.25) / 0.8, 0, 1) * 100, 0) - sc.misses * 20 - sc.early * 30));
      } else if (id === "senstest") {
        const PH = def.phases.map((p) => p.until);
        const p0 = sc.ph[0];
        const p1 = sc.ph[1];
        const t0 = Math.min(sc.time, PH[0]);
        const t1 = clamp(sc.time - PH[0], 0, PH[1] - PH[0]);
        const fAcc = p0.shots ? p0.hits / p0.shots : 0;
        const pAcc = p1.shots ? p1.hits / p1.shots : 0;
        const fKps = t0 ? p0.kills / t0 : 0;
        const pKps = t1 ? p1.kills / t1 : 0;
        const fs = Math.round(clamp((fKps * (0.4 + 0.6 * fAcc)) / 1.5, 0, 2) * 1000);
        const ps = Math.round(clamp((pKps * (0.4 + 0.6 * pAcc)) / 1.6, 0, 2) * 1000);
        const ts = Math.round(clamp((st.track || 0) / 60, 0, 2) * 1000);
        st.sub = { flick: fs, prec: ps, track: ts, fKps: r2(fKps), fAcc: r1(fAcc * 100), pKps: r2(pKps), pAcc: r1(pAcc * 100), trk: st.track || 0 };
        st.score = Math.round(0.4 * fs + 0.3 * ps + 0.3 * ts);
      } else {
        st.score = Math.max(0, Math.round(sc.points));
      }
      return st;
    };

    // velocita' laterale (per la barra del counter-strafe)
    sc.speed = () => Math.abs(sc.vx);
    return sc;
  }

  /* ------------------------------------------------------------ dati per i progressi */
  const METRICS = {
    score: { label: "Punteggio", unit: "", d: 0, up: true },
    acc: { label: "Precisione", unit: "%", d: 1, up: true },
    kps: { label: "Bersagli al secondo", unit: "", d: 2, up: true },
    ttk: { label: "Tempo per bersaglio", unit: " ms", d: 0, up: false },
    rt: { label: "Reazione media", unit: " ms", d: 0, up: false },
    hitTime: { label: "Tempo per colpirlo", unit: " ms", d: 0, up: false },
    rtBest: { label: "Reazione migliore", unit: " ms", d: 0, up: false },
    rtSd: { label: "Irregolarità dei tempi", unit: " ms", d: 0, up: false },
    win: { label: "Riusciti", unit: "%", d: 0, up: true },
    track: { label: "Tempo addosso", unit: "%", d: 1, up: true },
    err: { label: "Distanza media dalla sagoma", unit: "°", d: 2, up: false },
    reacq: { label: "Riaggancio dopo un cambio", unit: " ms", d: 0, up: false },
    vert: { label: "Errore in altezza", unit: "°", d: 2, up: false },
    stop: { label: "Da fermo allo sparo", unit: " ms", d: 0, up: false },
    movingPct: { label: "Colpi in movimento", unit: "%", d: 0, up: false },
    clean: { label: "Flick puliti", unit: "%", d: 0, up: true },
    over: { label: "Flick oltre e corretti", unit: "%", d: 0, up: false },
    under: { label: "Flick corti e corretti", unit: "%", d: 0, up: false },
    unscopedPct: { label: "Colpi senza scope o a scope non entrato", unit: "%", d: 0, up: false },
    scopeT: { label: "Dallo scope al colpo", unit: " ms", d: 0, up: false }
  };
  const SC_METRICS = {
    gridshot: ["score", "kps", "acc", "ttk", "clean", "over", "under"],
    microshot: ["score", "acc", "kps", "ttk", "clean", "over", "under"],
    headline: ["score", "acc", "vert", "ttk", "clean", "over", "under"],
    strafe: ["score", "win", "movingPct", "stop", "hitTime", "acc"],
    peek: ["score", "win", "rt", "rtBest", "acc"],
    duel: ["score", "win", "hitTime", "acc"],
    tracking: ["score", "track", "err", "reacq"],
    reflex: ["score", "rt", "rtBest", "rtSd", "win"],
    opflick: ["score", "win", "hitTime", "acc", "unscopedPct", "clean", "over", "under"],
    ophold: ["score", "win", "rt", "rtBest", "acc"],
    marshalhead: ["score", "win", "hitTime", "acc", "unscopedPct"],
    quickscope: ["score", "win", "scopeT", "hitTime", "unscopedPct"]
  };

  function metricValue(run, key) {
    if (!run) return null;
    if (key === "clean" || key === "over" || key === "under") {
      const f = run.flick;
      if (!f) return null;
      const n = (f.c || 0) + (f.o || 0) + (f.u || 0);
      if (n < 5) return null;
      return Math.round(((key === "clean" ? f.c : key === "over" ? f.o : f.u) / n) * 100);
    }
    const v = run[key === "hitTime" ? "rt" : key];
    return num(v) ? v : null;
  }

  const levelOf = (lab, id) => (lab && lab.settings && lab.settings.levels && [1, 2, 3].includes(lab.settings.levels[id]) ? lab.settings.levels[id] : 1);
  const runsOf = (lab, id, lv = null) => lab.runs.filter((r) => r.sc === id && (lv == null || (r.lv || 1) === lv));

  // Per ogni dato: record, ultima, media delle ultime 5, prime partite e variazione.
  function summary(lab, id, lv = null) {
    const runs = runsOf(lab, id, lv).slice().sort((x, y) => x.t - y.t);
    const keys = SC_METRICS[id] || ["score"];
    const metrics = keys.map((key) => {
      const m = METRICS[key];
      const vals = runs.map((r) => metricValue(r, key)).filter(num);
      const k = Math.min(5, Math.floor(vals.length / 2));
      const first = k ? avg(vals.slice(0, k)) : null;
      const recent = k ? avg(vals.slice(-k)) : null;
      const last5 = vals.slice(-5);
      const change = first != null && recent != null && first !== 0 ? ((recent - first) / Math.abs(first)) * 100 : null;
      return {
        key, label: m.label, unit: m.unit, d: m.d, up: m.up, n: vals.length,
        best: vals.length ? (m.up ? Math.max(...vals) : Math.min(...vals)) : null,
        last: vals.length ? vals[vals.length - 1] : null,
        avg5: last5.length ? avg(last5) : null,
        first, recent, k,
        change: change == null ? null : Math.round(change * 10) / 10,
        better: change == null || Math.abs(change) < 1 ? null : (change > 0) === m.up
      };
    });
    return { runs, metrics };
  }

  // Somme delle ultime partite: come arrivi sul bersaglio, colpi mancati, flick per distanza, direzione.
  function aggregate(runs) {
    const a = { n: runs.length, flick: { c: 0, o: 0, u: 0 }, miss: { o: 0, u: 0, s: 0 }, bins: { s: [0, 0, 0, 0], m: [0, 0, 0, 0], l: [0, 0, 0, 0] }, bias: { x: 0, y: 0, r: 0, n: 0 } };
    runs.forEach((r) => {
      if (r.flick) ["c", "o", "u"].forEach((k) => { a.flick[k] += r.flick[k] || 0; });
      if (r.miss) ["o", "u", "s"].forEach((k) => { a.miss[k] += r.miss[k] || 0; });
      if (r.bins) Object.keys(a.bins).forEach((k) => {
        const b = r.bins[k];
        if (!Array.isArray(b)) return;
        a.bins[k][0] += b[0] || 0;
        a.bins[k][1] += b[1] || 0;
        if (num(b[2]) && b[0]) { a.bins[k][2] += b[2] * b[0]; a.bins[k][3] += b[0]; }
      });
      if (r.bias && r.bias.n) { a.bias.x += r.bias.x * r.bias.n; a.bias.y += r.bias.y * r.bias.n; a.bias.r += r.bias.r * r.bias.n; a.bias.n += r.bias.n; }
    });
    if (a.bias.n) { a.bias.x = r2(a.bias.x / a.bias.n); a.bias.y = r2(a.bias.y / a.bias.n); a.bias.r = r2(a.bias.r / a.bias.n); }
    Object.keys(a.bins).forEach((k) => { const b = a.bins[k]; a.bins[k] = [b[0], b[1], b[3] ? Math.round(b[2] / b[3]) : null]; });
    return a;
  }

  // Le partite raggruppate per sensibilita' usata.
  function bySens(runs, key = "score") {
    const map = new Map();
    runs.forEach((r) => {
      if (!num(r.sens)) return;
      const s = roundSens(r.sens);
      if (!map.has(s)) map.set(s, []);
      map.get(s).push(r);
    });
    return [...map.entries()].map(([sens, list]) => ({
      sens, n: list.length,
      value: avg(list.map((r) => metricValue(r, key)).filter(num)),
      acc: avg(list.map((r) => r.acc).filter(num)),
      last: Math.max(...list.map((r) => r.t))
    })).sort((x, y) => x.sens - y.sens);
  }

  // Abilita' (una per esercizio): valore attuale (media delle ultime 5) e variazione dalle prime partite.
  const SKILLS = [
    { sc: "gridshot", key: "kps", name: "Velocità" },
    { sc: "microshot", key: "acc", name: "Precisione" },
    { sc: "headline", key: "vert", name: "Mirino all'altezza della testa" },
    { sc: "strafe", key: "win", name: "Counter-strafe" },
    { sc: "peek", key: "rt", name: "Reazione sui peek" },
    { sc: "duel", key: "win", name: "Duelli" },
    { sc: "tracking", key: "track", name: "Tracking" },
    { sc: "reflex", key: "rt", name: "Riflessi" },
    { sc: "opflick", key: "win", name: "Cecchino: flick con lo scope" },
    { sc: "ophold", key: "rt", name: "Cecchino: tenere l'angolo" }
  ];

  function skillProfile(lab) {
    return SKILLS.map((s) => {
      const lv = levelOf(lab, s.sc);
      const vals = runsOf(lab, s.sc, lv).map((r) => metricValue(r, s.key)).filter(num);
      const m = METRICS[s.key];
      const k = Math.min(5, Math.floor(vals.length / 2));
      const first = k ? avg(vals.slice(0, k)) : null;
      const recent = k ? avg(vals.slice(-k)) : null;
      const change = first ? ((recent - first) / Math.abs(first)) * 100 : null;
      return {
        ...s, lv, label: m.label, unit: m.unit, d: m.d, up: m.up, n: vals.length,
        value: vals.length ? avg(vals.slice(-5)) : null,
        change: change == null ? null : Math.round(change * 10) / 10,
        better: change == null || Math.abs(change) < 1 ? null : (change > 0) === m.up,
        trend: vals.slice(-12)
      };
    });
  }

  function dayKey(t) { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }

  // Minuti di allenamento per giorno (ultimi giorni, il piu' vecchio per primo).
  function activity(lab, now = Date.now(), days = 84) {
    const real = lab.runs.filter((r) => SCN.has(r.sc) && !SCN.get(r.sc).hidden);
    const map = new Map();
    real.forEach((r) => {
      const k = dayKey(r.t);
      const e = map.get(k) || { sec: 0, runs: 0 };
      e.sec += r.dur || 0;
      e.runs += 1;
      map.set(k, e);
    });
    const out = [];
    const end = new Date(now);
    end.setHours(12, 0, 0, 0);
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(end.getTime() - i * DAY);
      const k = dayKey(d.getTime());
      const e = map.get(k);
      out.push({ day: k, t: d.getTime(), dow: (d.getDay() + 6) % 7, minutes: e ? Math.round((e.sec / 60) * 10) / 10 : 0, runs: e ? e.runs : 0 });
    }
    return out;
  }

  // Pronto per il livello successivo? (ultime 3 partite al livello attuale)
  function levelAdvice(lab, id, lv = levelOf(lab, id)) {
    const def = SCN.get(id);
    if (!def || !def.up) return null;
    const vals = runsOf(lab, id, lv).slice(-3).map((r) => metricValue(r, def.up.key)).filter(num);
    const value = vals.length ? avg(vals) : null;
    return { key: def.up.key, label: METRICS[def.up.key].label, unit: METRICS[def.up.key].unit, min: def.up.min, value, n: vals.length, lv, next: lv < 3 ? lv + 1 : null, ready: lv < 3 && vals.length >= 3 && value >= def.up.min };
  }

  /* ------------------------------------------------------------ consigli dalla partita */
  function insights(run) {
    if (!run || !SCN.has(run.sc)) return [];
    const out = [];
    const add = (tone, text, w) => out.push({ tone, text, w });
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
    const id = run.sc;
    const fl = run.flick;
    const mi = run.miss;
    if (fl) {
      const n = (fl.c || 0) + (fl.o || 0) + (fl.u || 0);
      if (n >= 8) {
        if (fl.o / n >= 0.35) add("warn", `Nel ${pct(fl.o, n)}% dei flick vai oltre il bersaglio e torni indietro: frena un attimo prima di arrivare. Se succede in tutti gli esercizi, la sens potrebbe essere un po' alta.`, 3);
        else if (fl.u / n >= 0.35) add("warn", `Nel ${pct(fl.u, n)}% dei flick ti fermi prima del bersaglio e devi aggiustare: flick più decisi. Se succede in tutti gli esercizi, la sens potrebbe essere un po' bassa.`, 3);
        else if (fl.c / n >= 0.7) add("good", `Flick puliti: il ${pct(fl.c, n)}% arriva sul bersaglio senza correzioni.`, 1);
      }
    }
    if (mi) {
      const n = (mi.o || 0) + (mi.u || 0) + (mi.s || 0);
      if (n >= 5) {
        if (mi.o / n >= 0.5) add("warn", `Il ${pct(mi.o, n)}% dei colpi mancati finisce oltre il bersaglio: spari mentre il mouse è ancora in corsa.`, 2);
        else if (mi.u / n >= 0.5) add("warn", `Il ${pct(mi.u, n)}% dei colpi mancati finisce prima del bersaglio: spari prima di arrivarci.`, 2);
      }
    }
    if (["gridshot", "microshot", "headline"].includes(id) && run.shots >= 15 && num(run.acc)) {
      if (run.acc < 80) add("warn", `Precisione ${it(run.acc, 1)}%: rallenta quel tanto che basta. In Valorant un colpo sbagliato costa più di un colpo un po' lento.`, 2);
      else if (run.acc >= 97 && num(run.ttk) && run.ttk > (id === "microshot" ? 650 : 480)) add("tip", `Precisione ${it(run.acc, 1)}%: puoi permetterti di andare più veloce.`, 1);
    }
    if (run.bias && run.bias.n >= 10 && run.bias.r > 0) {
      const bx = run.bias.x / run.bias.r;
      const by = run.bias.y / run.bias.r;
      if (Math.abs(by) >= 0.35 && Math.abs(by) >= Math.abs(bx)) add("tip", `I colpi tendono a finire ${by > 0 ? "sopra" : "sotto"} il centro (in media ${it(Math.abs(run.bias.y), 2)}°): ${by > 0 ? "abbassa" : "alza"} di poco il punto in cui fermi il mirino.`, 2);
      else if (Math.abs(bx) >= 0.35) add("tip", `I colpi tendono a finire a ${bx > 0 ? "destra" : "sinistra"} del centro (in media ${it(Math.abs(run.bias.x), 2)}°): prima di cliccare controlla che il mirino sia al centro del bersaglio.`, 2);
    }
    if (run.bins && Array.isArray(run.bins.s) && Array.isArray(run.bins.l)) {
      const s = run.bins.s;
      const l = run.bins.l;
      if (s[0] + s[1] >= 4 && l[0] + l[1] >= 4) {
        const as = s[0] / (s[0] + s[1]);
        const al = l[0] / (l[0] + l[1]);
        if (as - al >= 0.2) add("tip", `Sui flick lunghi (oltre 30°) prendi il ${Math.round(al * 100)}% contro il ${Math.round(as * 100)}% di quelli corti: per i flick lunghi muovi il braccio, non solo il polso.`, 2);
      }
    }
    if (Array.isArray(run.seg) && run.seg.length === 6 && ["gridshot", "microshot", "headline"].includes(id)) {
      const a = (run.seg[0] || 0) + (run.seg[1] || 0);
      const b = (run.seg[4] || 0) + (run.seg[5] || 0);
      if (a >= 6 && b < a * 0.8) add("tip", `Negli ultimi 20 secondi hai fatto ${b} bersagli contro i ${a} dei primi 20: tieni il ritmo fino alla fine.`, 1);
      else if (a >= 6 && b > a * 1.15) add("good", "Hai chiuso più forte di come hai iniziato: il riscaldamento funziona.", 1);
    }
    if (id === "headline" && num(run.vert)) {
      if (run.vert <= 0.6) add("good", `Mirino quasi sempre all'altezza della testa (${it(run.vert, 2)}° di scarto medio).`, 2);
      else if (run.vert >= 1.5) add("warn", `In media il mirino sta ${it(run.vert, 1)}° ${num(run.vertBias) && run.vertBias < 0 ? "sotto" : "sopra"} la linea delle teste: mentre ti giri tienilo all'altezza delle teste, così in partita ti basta andare di lato.`, 3);
    }
    if (id === "tracking") {
      if (num(run.hold) && run.hold < 80) add("warn", `Hai tenuto premuto solo per il ${run.hold}% del tempo: il tempo addosso conta solo con il tasto premuto.`, 4);
      if (num(run.high) && run.high >= 50) add("warn", `Quando la perdi, nel ${run.high}% dei casi il problema è l'altezza, non il lato: tieni il mirino sul busto.`, 3);
      else if (num(run.lag) && run.lag >= 65) add("warn", `Quando la perdi, nel ${run.lag}% dei casi sei dietro alla sagoma: anticipa i cambi di direzione.`, 3);
      else if (num(run.lead) && run.lead >= 65) add("warn", `Quando la perdi, nel ${run.lead}% dei casi sei davanti alla sagoma: movimenti più morbidi. Se succede sempre, la sens potrebbe essere alta.`, 3);
      if (num(run.reacq) && run.reacq > 300) add("tip", `Dopo un cambio di direzione ci metti in media ${run.reacq} ms a riprenderla.`, 2);
    }
    if (id === "strafe") {
      if (run.moving >= 3) add("warn", `${run.moving} colpi sparati in movimento: in Valorant quei colpi vanno a vuoto. Fermati (lascia il tasto o tocca quello opposto) e poi spara.`, 3);
      else if (run.moving === 0 && run.shots > 0) add("good", "Nessun colpo in movimento: ti fermi sempre prima di sparare.", 2);
      if (num(run.stop) && run.stop > 350) add("tip", `Da fermo ci metti in media ${run.stop} ms a sparare: porta il mirino sulla testa mentre ti fermi.`, 2);
    }
    if (id === "duel") {
      const n = (run.behind || 0) + (run.ahead || 0);
      if (n >= 4 && run.behind >= run.ahead * 2) add("warn", `${run.behind} colpi mancati su ${n} sono dietro alla testa: anticipa nella direzione in cui si muove.`, 3);
      else if (n >= 4 && run.ahead >= run.behind * 2) add("warn", `${run.ahead} colpi mancati su ${n} sono davanti alla testa: aspetta che entri nel mirino.`, 3);
      if (run.lost >= 5) add("tip", `${run.lost} duelli persi perché il nemico ha sparato prima: porta prima il mirino sulla testa, poi clicca.`, 2);
    }
    if ((id === "duel" || id === "peek" || id === "strafe") && run.body >= 3) add("tip", `${run.body} colpi al corpo: il mirino è basso, tienilo all'altezza della testa.`, 2);
    if (id === "peek" && run.wall >= 3) add("warn", `${run.wall} colpi sul muro: aspetta che la testa sia fuori, poi clicca.`, 3);
    if (id === "reflex") {
      if (run.early >= 2) add("warn", `${run.early} partenze anticipate: clicca solo quando vedi il bersaglio.`, 3);
      if (num(run.rtSd) && run.rtSd > 90) add("tip", `Tempi irregolari (±${run.rtSd} ms): cerca lo stesso ritmo a ogni bersaglio.`, 1);
    }
    if (SNIPER.includes(id)) {
      if ((run.unscoped || 0) >= 2) add("warn", `${run.unscoped} colpi senza scope: con i fucili di precisione vanno quasi sempre a vuoto. Entra nello scope, poi spara.`, 4);
      if ((run.earlyScope || 0) >= 2) add("warn", `${run.earlyScope} colpi sparati mentre lo scope stava entrando: qui sono storti. Aspetta l'immagine ingrandita, poi clicca.`, 3);
      if (id === "marshalhead" && (run.body || 0) + (run.legs || 0) >= 4) add("tip", `${(run.body || 0) + (run.legs || 0)} colpi al corpo o alle gambe: con il Marshal non bastano. Tieni il mirino all'altezza della testa.`, 3);
      if ((id === "opflick" || id === "ophold") && (run.legs || 0) >= 2) add("tip", `${run.legs} colpi alle gambe: con l'Operator fanno 120 danni e non uccidono. Mira al busto o più in alto.`, 2);
      if (id === "ophold" && (run.wall || 0) >= 2) add("warn", `${run.wall} colpi sul muro: aspetta che esca dal bordo, poi clicca. Ogni colpo a vuoto ti costa il caricamento.`, 3);
      if (id === "ophold" && num(run.rt) && run.rt > 450) add("tip", `Reazione media ${run.rt} ms: tieni il mirino più vicino al bordo da cui esce, così devi solo cliccare.`, 2);
      if (id === "opflick" && (run.lost || 0) >= 3) add("tip", `${run.lost} volte ha sparato prima lui: fai il movimento grande senza scope ed entra nello scope solo alla fine.`, 2);
      if (id === "quickscope" && num(run.scopeT)) {
        if (run.scopeT < 250 && (run.earlyScope || 0) === 0) add("good", `Dallo scope al colpo in ${run.scopeT} ms senza anticipare: tempi da quickscope.`, 2);
        else if (run.scopeT > 500) add("tip", `Dallo scope al colpo ci metti ${run.scopeT} ms: prepara il mirino prima di entrare nello scope, poi un clic secco.`, 2);
      }
    }
    if (num(run.win) && run.win >= 90 && (run.lv || 1) < 3) add("good", `${run.win}% riusciti: puoi provare il livello più difficile.`, 1);
    return out.sort((x, y) => y.w - x.w).slice(0, 4).map(({ tone, text }) => ({ tone, text }));
  }

  /* ------------------------------------------------------------ ricerca della sens */
  const FINDER_ROUNDS = 4; // oltre, due sens troppo vicine non si distinguono
  const FINDER_SPAN = 1.6; // si parte da sens attuale / 1,6 fino a x 1,6
  const FEELS = ["slow", "ok", "fast"];

  function finderStart(base, { mode = "precisa", rounds = FINDER_ROUNDS, now = Date.now() } = {}) {
    const f = { v: 2, mode: mode === "rapida" ? "rapida" : "precisa", base: roundSens(base), lo: base / FINDER_SPAN, hi: base * FINDER_SPAN, round: 0, rounds, history: [], startedAt: now, warm: false };
    return finderPair(f);
  }

  // Coppia del turno: A (piu' bassa) e B (piu' alta), in ordine casuale e alla cieca.
  function finderPair(f) {
    const ratio = f.hi / f.lo;
    f.a = roundSens(f.lo * Math.pow(ratio, 0.25));
    f.b = roundSens(f.lo * Math.pow(ratio, 0.75));
    // stessi bersagli per A e B nello stesso turno: cambia solo la sens
    f.seed = ((Math.round(f.startedAt || 0) % 100000) * 31 + f.round * 7919 + 1) >>> 0;
    const first = rng(f.seed ^ 0x5bd1e995)() < 0.5 ? "a" : "b";
    const second = first === "a" ? "b" : "a";
    // precisa: A-B-B-A (o B-A-A-B) cosi' il riscaldarsi durante il turno pesa uguale su tutte e due
    f.seq = f.mode === "rapida" ? [first, second] : [first, second, second, first];
    f.trials = [];
    f.feel = {};
    return f;
  }

  // Alla cieca: "Sens 1" e' quella che si prova per prima.
  function finderLabel(f, which) { return f && f.seq && f.seq[0] === which ? 1 : 2; }

  function finderNext(f) {
    if (!f || f.done || !Array.isArray(f.seq)) return null;
    const i = f.trials.length;
    return i < f.seq.length ? { which: f.seq[i], index: i, total: f.seq.length, label: finderLabel(f, f.seq[i]) } : null;
  }

  function finderRecord(f, which, st) {
    const next = finderNext(f);
    if (!next || next.which !== which || !st || !num(st.score)) return false;
    f.trials.push({ which, score: st.score, sub: st.sub || null, fl: st.flick || null, mi: st.miss || null, lag: num(st.lag) ? st.lag : null, lead: num(st.lead) ? st.lead : null });
    return true;
  }

  function finderFeel(f, which, value) {
    if (f && (which === "a" || which === "b") && FEELS.includes(value)) f.feel[which] = value;
    return f;
  }

  // Medie del turno per A e per B.
  function finderTally(f) {
    const side = (w) => {
      const list = (f.trials || []).filter((t) => t.which === w);
      if (!list.length) return null;
      const mean = (fn) => { const v = avg(list.map(fn).filter(num)); return v == null ? null : Math.round(v); };
      const count = (k1, k2) => list.reduce((n, t) => n + ((t[k1] && t[k1][k2]) || 0), 0);
      return {
        n: list.length,
        score: mean((t) => t.score),
        scores: list.map((t) => t.score),
        flick: mean((t) => t.sub && t.sub.flick),
        prec: mean((t) => t.sub && t.sub.prec),
        track: mean((t) => t.sub && t.sub.track),
        over: count("fl", "o") + count("mi", "o"),
        under: count("fl", "u") + count("mi", "u"),
        clean: count("fl", "c"),
        feel: f.feel[w] || null
      };
    };
    return { a: side("a"), b: side("b") };
  }

  /*
   * Consiglio del turno: punteggio (pesa di piu'), sensazione e come arrivi sul bersaglio.
   * Usa solo indizi che non dicono quale delle due e' la piu' alta (la scelta resta alla cieca):
   * - sensazione: vince quella giudicata "giusta" contro una lenta o veloce;
   * - flick: vince quella con le correzioni piu' equilibrate (non sempre oltre o sempre corte).
   * Restituisce { pick: "a"|"b"|"tie", reasons: [{ k, w, pct, feel, other }] }.
   */
  function finderSuggest(f) {
    if (!f || finderNext(f)) return null;
    const t = finderTally(f);
    const A1 = t.a;
    const B1 = t.b;
    if (!A1 || !B1) return null;
    const reasons = [];
    let vote = 0; // negativo: A; positivo: B
    const top = Math.max(A1.score, B1.score, 1);
    const diff = (B1.score - A1.score) / top;
    if (Math.abs(diff) >= 0.05) { vote += diff > 0 ? 2 : -2; reasons.push({ k: "score", w: diff > 0 ? "b" : "a", pct: Math.round(Math.abs(diff) * 100) }); } else reasons.push({ k: "close", pct: Math.round(Math.abs(diff) * 100) });
    const fa = A1.feel;
    const fb = B1.feel;
    if (fa && fb) {
      if (fa === "ok" && fb !== "ok") { vote -= 1; reasons.push({ k: "feel", w: "a" }); } else if (fb === "ok" && fa !== "ok") { vote += 1; reasons.push({ k: "feel", w: "b" }); } else if (fa !== fb && fa !== "ok") reasons.push({ k: "between" }); else if (fa === fb && fa !== "ok") reasons.push({ k: "same", feel: fa });
    }
    // squilibrio: quanto le correzioni vanno in un verso solo (0 = equilibrate, 1 = sempre lo stesso verso)
    const lean = (s) => { const n = s.over + s.under; return n >= 6 ? Math.abs(s.over - s.under) / n : null; };
    const la = lean(A1);
    const lb = lean(B1);
    if (la != null && lb != null && Math.abs(la - lb) >= 0.3) {
      const w = la < lb ? "a" : "b";
      vote += w === "b" ? 1 : -1;
      reasons.push({ k: "balance", w, pct: Math.round(Math.min(la, lb) * 100), other: Math.round(Math.max(la, lb) * 100) });
    }
    return { pick: vote > 0 ? "b" : vote < 0 ? "a" : "tie", reasons, diff };
  }

  // winner: "a" (piu' bassa), "b" (piu' alta) o "tie" (uguali: si stringe verso il centro).
  function finderChoose(f, winner, now = Date.now()) {
    if (!f || f.done || !["a", "b", "tie"].includes(winner)) return f;
    const t = finderTally(f);
    const sug = finderSuggest(f);
    const sideOf = (s) => (s ? { score: s.score, feel: s.feel, over: s.over, under: s.under } : null);
    f.history.push({ round: f.round + 1, a: f.a, b: f.b, first: f.seq[0], A: sideOf(t.a), B: sideOf(t.b), sugg: sug ? sug.pick : null, winner });
    const ratio = f.hi / f.lo;
    const mid = Math.sqrt(f.lo * f.hi);
    if (winner === "a") f.hi = mid;
    else if (winner === "b") f.lo = mid;
    else { const lo = f.lo * Math.pow(ratio, 0.25); const hi = f.lo * Math.pow(ratio, 0.75); f.lo = lo; f.hi = hi; }
    f.round += 1;
    if (f.round >= f.rounds) {
      f.done = true;
      f.result = roundSens(Math.sqrt(f.lo * f.hi));
      f.finishedAt = now;
      // sempre la stessa direzione: la sens migliore potrebbe stare oltre l'intervallo provato
      const w = f.history.map((h) => h.winner);
      f.edge = w.every((x) => x === "a") ? "low" : w.every((x) => x === "b") ? "high" : null;
      f.trials = [];
      return f;
    }
    return finderPair(f);
  }

  // Rifai il turno da capo (per esempio dopo una distrazione).
  function finderRedo(f) { if (f && !f.done) { f.trials = []; f.feel = {}; } return f; }

  // Ricerca finita: si annota tra le ricerche fatte (una volta sola).
  function saveFinderResult(lab, { now = Date.now() } = {}) {
    const f = lab.finder;
    if (!f || !f.done || f.saved || !num(f.result)) return false;
    lab.finderResults.push({ t: f.finishedAt || now, base: f.base, result: f.result, mode: f.mode, edge: f.edge || null, dpi: lab.settings.dpi });
    if (lab.finderResults.length > 20) lab.finderResults = lab.finderResults.slice(-20);
    f.saved = true;
    return true;
  }

  // Piu' ricerche in giorni diversi: la media (geometrica) delle ultime 3 e' piu' affidabile di una sola.
  // Si fa la media dell'eDPI (sens x DPI), cosi' vale anche se nel frattempo hai cambiato i DPI.
  function finderAdvice(lab) {
    const dpi = lab.settings.dpi;
    const list = lab.finderResults.filter((r) => !r.edge).slice(-3);
    const ed = list.map((r) => r.result * (num(r.dpi) && r.dpi > 0 ? r.dpi : dpi));
    if (list.length < 2) return { n: list.length, avg: list.length ? roundSens(ed[0] / dpi) : null, spread: null, list };
    const g = Math.exp(avg(ed.map((e) => Math.log(e))));
    return { n: list.length, avg: roundSens(g / dpi), spread: Math.round((Math.max(...ed) / Math.min(...ed) - 1) * 100), list };
  }

  /* ------------------------------------------------------------ stato */
  const COLORS = ["#2ef27a", "#33e0ff", "#ffe14d", "#ff4d6d", "#ffffff", "#ff4dff"];

  function defaultSettings() {
    return {
      dpi: 800, sens: 0.35, calib: null, sound: true, targetColor: "#33e0ff", levels: {}, scopeMult: 1, scopeHold: false,
      crosshair: { color: "#2ef27a", len: 5, thick: 2, gap: 3, dot: false, outline: true }
    };
  }

  /* ---- pulizia dei dati salvati (anche da un file importato): solo numeri e valori previsti */
  const RUN_NUM = ["t", "score", "shots", "hits", "kills", "heads", "misses", "acc", "kps", "ttk", "ttkMed", "ttkBest", "rt", "rtMed", "rtBest", "rtSd", "reps", "win",
    "escaped", "track", "hold", "lag", "lead", "high", "err", "reacq", "vert", "vertBias", "body", "wall", "lost", "behind", "ahead", "moving", "still", "movingPct", "stop", "early", "sens", "dur",
    "legs", "unscoped", "earlyScope", "unscopedPct", "scopeT"];
  const numOr = (v) => (num(v) ? v : null);
  const numList = (l, max) => (Array.isArray(l) ? l.slice(0, max).map((v) => (num(v) ? v : null)) : null);
  const numObj = (o, keys) => {
    if (!isObj(o)) return null;
    const out = {};
    keys.forEach((k) => { out[k] = num(o[k]) ? o[k] : 0; });
    return out;
  };

  function cleanRun(r) {
    const out = { t: r.t, sc: r.sc, lv: [1, 2, 3].includes(r.lv) ? r.lv : 1 };
    RUN_NUM.forEach((k) => { if (num(r[k])) out[k] = r[k]; });
    if (r.routine === true) out.routine = true;
    if (r.raw === true || r.raw === false) out.raw = r.raw;
    const fl = numObj(r.flick, ["c", "o", "u"]);
    if (fl) out.flick = fl;
    const mi = numObj(r.miss, ["o", "u", "s"]);
    if (mi) out.miss = mi;
    if (isObj(r.bins)) {
      const b = {};
      ["s", "m", "l"].forEach((k) => { const x = r.bins[k]; if (Array.isArray(x)) b[k] = [num(x[0]) ? x[0] : 0, num(x[1]) ? x[1] : 0, num(x[2]) ? x[2] : null]; });
      if (Object.keys(b).length) out.bins = b;
    }
    const bias = numObj(r.bias, ["x", "y", "r", "n"]);
    if (bias) out.bias = bias;
    ["seg", "segAcc"].forEach((k) => { const l = numList(r[k], 12); if (l) out[k] = l; });
    const rts = numList(r.rts, 60);
    if (rts) out.rts = rts.filter(num);
    const sub = numObj(r.sub, ["flick", "prec", "track", "fKps", "fAcc", "pKps", "pAcc", "trk"]);
    if (sub) out.sub = sub;
    // partite della versione precedente: bersagli e colpi mancati ricavati
    if (!num(out.kills) && num(out.hits)) out.kills = ["peek", "duel", "strafe"].includes(out.sc) && num(out.heads) ? out.heads : out.hits;
    if (!num(out.misses) && num(out.shots) && num(out.hits)) out.misses = Math.max(0, out.shots - out.hits);
    return out;
  }

  const WHO = ["a", "b"];
  function cleanSide(x) {
    if (!isObj(x)) return null;
    return { score: numOr(x.score), over: num(x.over) ? x.over : 0, under: num(x.under) ? x.under : 0, feel: FEELS.includes(x.feel) ? x.feel : null };
  }
  function cleanFinder(f) {
    f.mode = f.mode === "rapida" ? "rapida" : "precisa";
    f.base = num(f.base) ? f.base : roundSens(Math.sqrt(f.lo * f.hi));
    f.warm = f.warm === true;
    f.done = f.done === true;
    f.saved = f.saved === true;
    f.noRaw = f.noRaw === true;
    f.edge = f.edge === "low" || f.edge === "high" ? f.edge : null;
    if (!num(f.result)) delete f.result;
    if (!num(f.startedAt)) f.startedAt = 0;
    if (!f.seq.every((w) => WHO.includes(w))) return false;
    f.trials = f.trials.filter((t) => isObj(t) && WHO.includes(t.which) && num(t.score)).map((t) => ({
      which: t.which, score: t.score,
      sub: numObj(t.sub, ["flick", "prec", "track", "fKps", "fAcc", "pKps", "pAcc", "trk"]),
      fl: numObj(t.fl, ["c", "o", "u"]), mi: numObj(t.mi, ["o", "u", "s"]), lag: numOr(t.lag), lead: numOr(t.lead)
    })).slice(0, f.seq.length);
    const feel = {};
    WHO.forEach((w) => { if (FEELS.includes(f.feel[w])) feel[w] = f.feel[w]; });
    f.feel = feel;
    const pick = (v) => (["a", "b", "tie"].includes(v) ? v : null);
    f.history = f.history.filter((h) => isObj(h) && num(h.a) && num(h.b)).map((h, i) => ({
      round: i + 1, a: h.a, b: h.b, first: WHO.includes(h.first) ? h.first : "a", A: cleanSide(h.A), B: cleanSide(h.B), sugg: pick(h.sugg), winner: pick(h.winner) || "tie"
    }));
    return true;
  }

  function validFinder(f) {
    return isObj(f) && f.v === 2 && num(f.lo) && num(f.hi) && f.lo > 0 && f.hi > f.lo && Number.isInteger(f.round) && Number.isInteger(f.rounds) &&
      Array.isArray(f.history) && Array.isArray(f.trials) && Array.isArray(f.seq) && isObj(f.feel) && num(f.a) && num(f.b) && num(f.seed);
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
    s.scopeMult = num(s.scopeMult) && s.scopeMult >= 0.1 && s.scopeMult <= 3 ? Math.round(s.scopeMult * 1000) / 1000 : d.scopeMult;
    s.scopeHold = typeof s.scopeHold === "boolean" ? s.scopeHold : d.scopeHold;
    const lv = isObj(s.levels) ? s.levels : {};
    s.levels = {};
    VISIBLE.forEach((id) => { s.levels[id] = [1, 2, 3].includes(lv[id]) ? lv[id] : 1; });
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
    if (s.calib) s.calib = { factor: s.calib.factor, measuredFactor: numOr(s.calib.measuredFactor), expected: numOr(s.calib.expected), measured: numOr(s.calib.measured), sens: numOr(s.calib.sens), raw: s.calib.raw === true ? true : s.calib.raw === false ? false : null, t: numOr(s.calib.t) };
    lab.runs = Array.isArray(lab.runs) ? lab.runs.filter((r) => isObj(r) && num(r.t) && SCN.has(r.sc) && num(r.score)).slice(-800).map(cleanRun) : [];
    lab.sensHistory = Array.isArray(lab.sensHistory) ? lab.sensHistory.filter((h) => isObj(h) && num(h.t) && num(h.to)).slice(-60).map((h) => ({ t: h.t, from: numOr(h.from), to: h.to, dpi: numOr(h.dpi), method: h.method === "ricerca" ? "ricerca" : "manuale" })) : [];
    lab.finderResults = Array.isArray(lab.finderResults) ? lab.finderResults.filter((r) => isObj(r) && num(r.t) && num(r.result) && r.result > 0).slice(-20).map((r) => ({ t: r.t, base: numOr(r.base), result: r.result, mode: r.mode === "precisa" ? "precisa" : "rapida", edge: r.edge === "low" || r.edge === "high" ? r.edge : null, dpi: numOr(r.dpi) })) : [];
    const f = lab.finder;
    if (!validFinder(f) || !cleanFinder(f)) {
      // ricerca della versione precedente: se era finita si tiene il risultato
      if (isObj(f) && f.v !== 2 && f.done && num(f.result) && f.result > 0) lab.finderResults.push({ t: num(f.finishedAt) ? f.finishedAt : now, base: num(f.base) ? f.base : null, result: f.result, mode: "rapida", edge: f.edge === "low" || f.edge === "high" ? f.edge : null, dpi: s.dpi });
      lab.finder = null;
    }
    if (!num(lab.createdAt) || lab.createdAt > now) lab.createdAt = now;
    return lab;
  }

  function recordRun(lab, stats, { sens, now = Date.now(), routine = false } = {}) {
    if (!stats || !SCN.has(stats.sc) || !num(stats.score)) return null;
    const run = { t: now, ...stats, sens: num(sens) ? sens : lab.settings.sens };
    if (![1, 2, 3].includes(run.lv)) run.lv = 1;
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

  function stats(lab, now = Date.now()) {
    const per = {};
    SCENARIOS.filter((s) => !s.hidden).forEach((s) => {
      const lv = levelOf(lab, s.id);
      const list = runsOf(lab, s.id, lv);
      const scores = list.map((r) => r.score);
      const last5 = scores.slice(-5);
      per[s.id] = {
        lv,
        count: list.length,
        total: runsOf(lab, s.id).length,
        best: scores.length ? Math.max(...scores) : null,
        last: list.length ? list[list.length - 1] : null,
        avg5: last5.length ? Math.round(avg(last5)) : null,
        trend: scores.slice(-20)
      };
    });
    const real = lab.runs.filter((r) => SCN.has(r.sc) && !SCN.get(r.sc).hidden);
    const days = new Set(real.map((r) => dayKey(r.t)));
    let streak = 0;
    for (let i = 0; i < 400; i += 1) {
      const k = dayKey(now - i * DAY);
      if (days.has(k)) streak += 1;
      else if (i === 0) continue;
      else break;
    }
    const minutes = Math.round(real.reduce((n, r) => n + (r.dur || 0), 0) / 60);
    const today = real.filter((r) => dayKey(r.t) === dayKey(now));
    const shots = real.reduce((n, r) => n + (r.shots || 0), 0);
    const recent = real.filter((r) => now - r.t <= 30 * DAY && num(r.acc) && r.shots);
    const accShots = recent.reduce((n, r) => n + r.shots, 0);
    const acc30 = accShots ? Math.round((recent.reduce((n, r) => n + (r.acc / 100) * r.shots, 0) / accShots) * 1000) / 10 : null;
    const routineDays = new Set();
    const byDay = new Map();
    real.forEach((r) => { const k = dayKey(r.t); if (!byDay.has(k)) byDay.set(k, new Set()); byDay.get(k).add(r.sc); });
    byDay.forEach((set, k) => { if (ROUTINE.every((id) => set.has(id))) routineDays.add(k); });
    return {
      per, runs: real.length, minutes, streak, days: days.size, today: today.length, shots, acc30,
      routineDays: routineDays.size,
      routineToday: ROUTINE.every((id) => today.some((r) => r.sc === id)),
      sniperToday: SNIPER_ROUTINE.every((id) => today.some((r) => r.sc === id))
    };
  }

  // Un record nuovo per lo scenario e il livello? (confronta con le partite precedenti)
  function isBest(lab, run) {
    const prev = lab.runs.filter((r) => r.sc === run.sc && (r.lv || 1) === (run.lv || 1) && r !== run).map((r) => r.score);
    return !prev.length || run.score > Math.max(...prev);
  }

  return {
    VERSION, YAW, FOV_H, ROOM, HEAD_Y, STRAFE, LEVELS, SCENARIOS, VISIBLE, ROUTINE, COLORS, FINDER_ROUNDS, FINDER_SPAN, METRICS, SC_METRICS, SKILLS,
    WEAPONS, HP, SCOPE_IN, SNIPER, SNIPER_ROUTINE, scopeFov, scopeFactor, zeroMatch,
    edpi, cm360, sensForCm, roundSens, degPerUnit, calibrate,
    dir, basis, toCamera, focal, project, raySphere, rayBox, angleTo, anglesTo, rng, botParts, wrap,
    flickKind, missKind,
    scenario: (id) => SCN.get(id), createScenario,
    metricValue, summary, aggregate, bySens, skillProfile, activity, levelAdvice, levelOf, runsOf, insights,
    finderStart, finderNext, finderLabel, finderRecord, finderFeel, finderTally, finderSuggest, finderChoose, finderRedo, saveFinderResult, finderAdvice,
    defaultSettings, ensure, recordRun, setSens, stats, isBest, dayKey
  };
});
