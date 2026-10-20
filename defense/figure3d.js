/*
 * Progetto A - Difesa: l'omino 3D che mostra le tecniche (arti marziali).
 *
 * - Una posa dice dove stanno bacino, petto, testa, mani e caviglie (in metri) e come sono
 *   girati bacino, busto e piedi; gomiti e ginocchia li calcola la cinematica inversa a due ossa,
 *   cosi' braccia e gambe hanno sempre la stessa lunghezza.
 * - Coordinate: x avanti (verso l'avversario), y in alto, z alla destra della figura.
 *   Yaw in gradi: 0 = rivolto avanti; positivo = girato verso la propria sinistra.
 * - Proiezione ortografica con telecamera girevole: 3/4, lato, fronte, da dietro.
 * - Disegno in SVG (anche per le miniature): arti lontani piu' scuri, l'arto che lavora evidenziato,
 *   frecce del movimento dal fotogramma precedente.
 * - Lettore: interpola i fotogrammi, play/pausa, lento, passi, vista, trascina per girare.
 *
 * window.MartialFigure = { solve, svg, player, lerpPose, VIEWS, DIM }
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MartialFigure = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const DEG = Math.PI / 180;
  // misure di una persona di circa 1,75 m
  const DIM = { ankle: 0.08, shin: 0.44, thigh: 0.44, hip: 0.095, upper: 0.29, fore: 0.28, sh: 0.18, headR: 0.105, toe: 0.15, heel: 0.05, neck: 0.2 };
  const FOOT_DROP = 0.055; // dalla caviglia alla pianta
  const W = { thigh: 0.155, shin: 0.125, foot: 0.075, upper: 0.115, fore: 0.1, neck: 0.085, fist: 0.06, torsoR: 0.09, torsoHalf: 0.12, ol: 0.022 };

  const VIEWS = {
    tq: { name: "3/4", yaw: 58, pitch: 12 },
    side: { name: "Lato", yaw: 90, pitch: 6 },
    front: { name: "Fronte", yaw: 4, pitch: 8 },
    back: { name: "Dietro", yaw: 155, pitch: 14 }
  };

  /* ------------------------------------------------------------ vettori */
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.sqrt(dot(a, a));
  const norm = (a) => { const l = len(a); return l > 1e-9 ? mul(a, 1 / l) : [0, 1, 0]; };
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const yawFwd = (deg) => [Math.cos(deg * DEG), 0, -Math.sin(deg * DEG)];
  const yawRight = (deg) => [Math.sin(deg * DEG), 0, Math.cos(deg * DEG)];

  // Rotazione di v attorno all'asse k (unitario) di a radianti.
  function rot(v, k, a) {
    const c = Math.cos(a);
    const s = Math.sin(a);
    return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c)));
  }

  // Terna di una parte del corpo: asse (lungo la colonna), destra (dallo yaw, poi ruotata di roll), avanti.
  function frame(axis, yaw, roll) {
    let r = yawRight(yaw);
    r = sub(r, mul(axis, dot(r, axis)));
    if (len(r) < 1e-4) r = sub([0, 0, 1], mul(axis, axis[2]));
    r = norm(r);
    if (roll) r = norm(rot(r, axis, roll * DEG));
    return { up: axis, right: r, fwd: norm(cross(axis, r)) };
  }

  // Cinematica inversa a due ossa: giunto intermedio piegato verso "pole".
  function ik(a, t, l1, l2, pole) {
    const d = sub(t, a);
    const dist = len(d);
    const dd = clamp(dist, Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-4);
    const u = dist > 1e-6 ? mul(d, 1 / dist) : [0, -1, 0];
    const end = add(a, mul(u, dd));
    const x = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
    const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
    let p = sub(pole, mul(u, dot(pole, u)));
    if (len(p) < 1e-6) p = Math.abs(u[1]) < 0.9 ? sub([0, 1, 0], mul(u, u[1])) : sub([1, 0, 0], mul(u, u[0]));
    p = norm(p);
    return { joint: add(add(a, mul(u, x)), mul(p, h)), end };
  }

  /* ------------------------------------------------------------ posa */
  const SIDES = ["l", "r"];

  // Completa una posa con i valori mancanti (senza modificarla).
  function normalize(p) {
    const q = {
      pel: p.pel || [0, 0.94, 0],
      hipYaw: isNum(p.hipYaw) ? p.hipYaw : 0,
      hipRoll: p.hipRoll || 0,
      chestRoll: p.chestRoll || 0,
      hand: p.hand || {},
      foot: p.foot || {},
      footYaw: p.footYaw || {},
      footPitch: p.footPitch || {},
      footRoll: p.footRoll || {},
      pole: p.pole || {},
      grip: p.grip || {},
      act: p.act || null
    };
    q.chestYaw = isNum(p.chestYaw) ? p.chestYaw : q.hipYaw;
    q.chest = p.chest || add(q.pel, [0, 0.5, 0]);
    const axis = norm(sub(q.chest, q.pel));
    q.head = p.head || add(q.chest, mul(axis, DIM.neck));
    return q;
  }

  // Calcola tutto lo scheletro di una posa.
  function solve(pose) {
    const p = normalize(pose);
    const axis = norm(sub(p.chest, p.pel));
    const hipF = frame(axis, p.hipYaw, p.hipRoll);
    const chF = frame(axis, p.chestYaw, p.chestRoll);
    const sk = { pel: p.pel, chest: p.chest, head: p.head, hipF, chF, grip: p.grip, act: p.act, hip: {}, sh: {}, elbow: {}, hand: {}, knee: {}, ankle: {}, toe: {}, heel: {} };
    const headUp = norm(sub(p.head, p.chest));
    sk.neck = add(p.chest, mul(headUp, 0.04));
    sk.face = norm(sub(chF.fwd, mul(headUp, dot(chF.fwd, headUp))));
    if (pose.headYaw) sk.face = norm(rot(sk.face, headUp, pose.headYaw * DEG));
    SIDES.forEach((s) => {
      const sign = s === "l" ? -1 : 1;
      sk.hip[s] = add(p.pel, mul(hipF.right, DIM.hip * sign));
      sk.sh[s] = add(p.chest, mul(chF.right, DIM.sh * sign));
      // mano: se manca, lungo il fianco
      const hand = p.hand[s] || add(sk.sh[s], add(mul(axis, -0.5), mul(chF.right, 0.05 * sign)));
      const ePole = p.pole["e" + s] || add(add(mul(chF.up, -1), mul(chF.right, 0.35 * sign)), mul(chF.fwd, -0.3));
      const arm = ik(sk.sh[s], hand, DIM.upper, DIM.fore, ePole);
      sk.elbow[s] = arm.joint;
      sk.hand[s] = arm.end;
      // gamba
      const yaw = isNum(p.footYaw[s]) ? p.footYaw[s] : p.hipYaw;
      const ankle = p.foot[s] || add(sk.hip[s], [0, -(DIM.thigh + DIM.shin) + 0.002, 0]);
      const kPole = p.pole["k" + s] || add(yawFwd(yaw), [0, 0.1, 0]);
      const leg = ik(sk.hip[s], ankle, DIM.thigh, DIM.shin, kPole);
      sk.knee[s] = leg.joint;
      sk.ankle[s] = leg.end;
      // piede: direzione dallo yaw, inclinato di pitch (positivo = punta in giu', tallone su)
      const pitch = (p.footPitch[s] || 0) * DEG;
      const hz = yawFwd(yaw);
      let fdir = sub(mul(hz, Math.cos(pitch)), [0, Math.sin(pitch), 0]);
      let fdown = mul(add([0, Math.cos(pitch), 0], mul(hz, Math.sin(pitch))), -1);
      if (p.footRoll[s]) { const ax = norm(fdir); fdown = rot(fdown, ax, p.footRoll[s] * DEG); }
      sk.toe[s] = add(add(sk.ankle[s], mul(fdir, DIM.toe)), mul(fdown, FOOT_DROP));
      sk.heel[s] = add(add(sk.ankle[s], mul(fdir, -DIM.heel)), mul(fdown, FOOT_DROP));
    });
    return sk;
  }

  /*
   * Controllo di una posa (per chi crea i movimenti): braccia o gambe che non arrivano al punto
   * chiesto (troppo tese), giunti sotto il pavimento, ossa con lunghezze strane.
   */
  function check(pose) {
    const p = normalize(pose);
    const sk = solve(pose);
    const out = [];
    SIDES.forEach((s) => {
      if (p.hand[s]) { const d = len(sub(p.hand[s], sk.sh[s])) / (DIM.upper + DIM.fore); if (d > 1.03) out.push(`mano ${s} troppo lontana (${Math.round(d * 100)}%)`); }
      if (p.foot[s]) { const d = len(sub(p.foot[s], sk.hip[s])) / (DIM.thigh + DIM.shin); if (d > 1.03) out.push(`piede ${s} troppo lontano (${Math.round(d * 100)}%)`); }
      [["ginocchio", sk.knee[s]], ["gomito", sk.elbow[s]], ["mano", sk.hand[s]], ["caviglia", sk.ankle[s]], ["punta", sk.toe[s]], ["tallone", sk.heel[s]]].forEach(([n, q]) => { if (q[1] < -0.04) out.push(`${n} ${s} sotto il pavimento (${q[1].toFixed(2)})`); });
    });
    if (sk.head[1] - DIM.headR < -0.02) out.push("testa sotto il pavimento");
    if (sk.pel[1] < 0.05) out.push("bacino sotto il pavimento");
    const spine = len(sub(p.chest, p.pel));
    if (spine < 0.38 || spine > 0.6) out.push(`busto lungo ${spine.toFixed(2)} m (normale 0,5)`);
    const neck = len(sub(p.head, p.chest));
    if (neck < 0.12 || neck > 0.28) out.push(`collo lungo ${neck.toFixed(2)} m (normale 0,2)`);
    return out;
  }

  /* ------------------------------------------------------------ interpolazione */
  function lerpVal(a, b, t) {
    if (a == null) return b;
    if (b == null) return a;
    if (isNum(a) && isNum(b)) return a + (b - a) * t;
    if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => lerpVal(v, b[i], t));
    if (typeof a === "object" && typeof b === "object") {
      const out = {};
      Object.keys(Object.assign({}, a, b)).forEach((k) => { out[k] = lerpVal(a[k], b[k], t); });
      return out;
    }
    return t < 0.5 ? a : b;
  }
  // Tra due pose: i campi mancanti si completano prima, cosi' l'interpolazione e' sempre liscia.
  function lerpPose(a, b, t) {
    if (t <= 0) return a;
    if (t >= 1) return b;
    const A = normalize(a);
    const B = normalize(b);
    const out = lerpVal(A, B, t);
    out.act = t < 0.5 ? a.act : b.act;
    out.grip = t < 0.5 ? A.grip : B.grip;
    if (a.headYaw || b.headYaw) out.headYaw = lerpVal(a.headYaw || 0, b.headYaw || 0, t);
    // mani e piedi assenti in una delle due: si interpolano i punti risolti
    const sa = solve(a);
    const sb = solve(b);
    SIDES.forEach((s) => {
      if (!(a.hand && a.hand[s]) || !(b.hand && b.hand[s])) out.hand[s] = lerpVal(sa.hand[s], sb.hand[s], t);
      if (!(a.foot && a.foot[s]) || !(b.foot && b.foot[s])) out.foot[s] = lerpVal(sa.ankle[s], sb.ankle[s], t);
    });
    return out;
  }

  /* ------------------------------------------------------------ telecamera e disegno */
  function camera(view) {
    const v = typeof view === "string" ? VIEWS[view] || VIEWS.tq : view || VIEWS.tq;
    const a = v.yaw * DEG;
    const e = v.pitch * DEG;
    const toCam = [Math.cos(e) * Math.cos(a), Math.sin(e), -Math.cos(e) * Math.sin(a)];
    const fwd = mul(toCam, -1);
    const right = norm(cross(fwd, [0, 1, 0]));
    const up = cross(right, fwd);
    return { toCam, right, up, yaw: v.yaw, pitch: v.pitch };
  }
  const P2 = (cam, p) => [dot(p, cam.right), -dot(p, cam.up), dot(p, cam.toCam)];

  const f1 = (n) => (Math.round(n * 1000) / 1000).toString();

  // Primitive di una figura, raggruppate per parte (ogni gruppo ha la sua profondita').
  function figurePrims(sk, cam, opt = {}) {
    const groups = [];
    const pr = (p) => P2(cam, p);
    const act = new Set(opt.act || sk.act || []);
    const role = opt.role || "you";
    // lato vicino: quello la cui spalla/anca e' piu' vicina alla telecamera
    const nearArm = dot(sk.sh.l, cam.toCam) >= dot(sk.sh.r, cam.toCam) ? "l" : "r";
    const nearLeg = dot(sk.hip.l, cam.toCam) >= dot(sk.hip.r, cam.toCam) ? "l" : "r";
    const tone = (s, near, part) => (act.has(part + s) || act.has(part) ? "act" : s === near ? "near" : "far");
    SIDES.forEach((s) => {
      const legPts = [sk.hip[s], sk.knee[s], sk.ankle[s], sk.toe[s]].map(pr);
      const heel = pr(sk.heel[s]);
      groups.push({
        depth: (legPts[0][2] + legPts[1][2] + legPts[2][2]) / 3,
        tone: tone(s, nearLeg, "leg"), role,
        items: [
          { k: "seg", a: legPts[0], b: legPts[1], w: W.thigh },
          { k: "seg", a: legPts[1], b: legPts[2], w: W.shin },
          { k: "seg", a: heel, b: legPts[3], w: W.foot }
        ]
      });
      const armPts = [sk.sh[s], sk.elbow[s], sk.hand[s]].map(pr);
      const grip = (sk.grip && sk.grip[s]) || "fist";
      const handItem = grip === "fist"
        ? { k: "dot", c: armPts[2], r: W.fist }
        : { k: "seg", a: armPts[2], b: pr(add(sk.hand[s], mul(norm(sub(sk.hand[s], sk.elbow[s])), grip === "blade" ? 0.1 : 0.085))), w: grip === "blade" ? 0.05 : 0.065 };
      groups.push({
        depth: (armPts[0][2] + armPts[1][2] * 2 + armPts[2][2] * 2) / 5,
        tone: tone(s, nearArm, "arm"), role,
        items: [
          { k: "seg", a: armPts[0], b: armPts[1], w: W.upper },
          { k: "seg", a: armPts[1], b: armPts[2], w: W.fore },
          handItem
        ]
      });
    });
    // busto: poligono arrotondato tra spalle e anche (piu' stretto delle spalle vere)
    const shL = add(sk.chest, mul(sk.chF.right, -W.torsoHalf));
    const shR = add(sk.chest, mul(sk.chF.right, W.torsoHalf));
    const hpL = add(sk.pel, mul(sk.hipF.right, -DIM.hip * 0.9));
    const hpR = add(sk.pel, mul(sk.hipF.right, DIM.hip * 0.9));
    const torso = [shL, shR, hpR, hpL].map(pr);
    const neckA = pr(sk.neck);
    const headC = pr(sk.head);
    groups.push({
      depth: (pr(sk.chest)[2] + pr(sk.pel)[2]) / 2,
      tone: act.has("torso") ? "act" : "body", role,
      items: [
        { k: "seg", a: neckA, b: headC, w: W.neck },
        { k: "poly", pts: torso, w: W.torsoR * 2 },
        { k: "belt", a: pr(add(hpL, mul(sk.hipF.up, 0.05))), b: pr(add(hpR, mul(sk.hipF.up, 0.05))), w: 0.03 }
      ]
    });
    // testa con il viso (due occhi se guarda verso di noi, un naso se di profilo)
    const faceVis = dot(sk.face, cam.toCam);
    const headItems = [{ k: "dot", c: headC, r: DIM.headR }];
    if (faceVis > -0.25) {
      const side = norm(cross(norm(sub(sk.head, sk.neck)), sk.face));
      const eyeY = add(sk.head, mul(norm(sub(sk.head, sk.neck)), 0.015));
      const e1 = pr(add(add(eyeY, mul(sk.face, 0.09)), mul(side, 0.035)));
      const e2 = pr(add(add(eyeY, mul(sk.face, 0.09)), mul(side, -0.035)));
      headItems.push({ k: "eye", c: e1, r: 0.011 }, { k: "eye", c: e2, r: 0.011 });
    }
    groups.push({ depth: headC[2] + 0.02, tone: act.has("head") ? "act" : "body", role, items: headItems });
    return groups;
  }

  function propPrims(props, cam) {
    const groups = [];
    (props || []).forEach((pp) => {
      if (pp.k === "bag") {
        const c = [pp.x, (pp.y0 + pp.y1) / 2, pp.z || 0];
        const top = P2(cam, [pp.x, pp.y1, pp.z || 0]);
        const bot = P2(cam, [pp.x, pp.y0, pp.z || 0]);
        const ry = pp.r * Math.sin(cam.pitch * DEG);
        groups.push({ depth: P2(cam, c)[2] - pp.r * 0.5, tone: "prop", role: "prop", items: [
          { k: "chain", a: top, b: P2(cam, [pp.x, 2.2, pp.z || 0]) },
          { k: "cyl", top, bot, r: pp.r, ry }
        ] });
      }
    });
    return groups;
  }

  // Pavimento: tappeto attorno ai piedi e ombra.
  function floorPrims(cam, center, half = 1.1) {
    const c = [center[0], 0, center[2]];
    const corners = [[-half, -half * 0.8], [half, -half * 0.8], [half, half * 0.8], [-half, half * 0.8]].map(([x, z]) => P2(cam, add(c, [x, 0, z])));
    const lines = [];
    for (let i = 1; i < 4; i += 1) {
      const x = -half + (2 * half * i) / 4;
      lines.push([P2(cam, add(c, [x, 0, -half * 0.8])), P2(cam, add(c, [x, 0, half * 0.8]))]);
    }
    for (let i = 1; i < 3; i += 1) {
      const z = -half * 0.8 + (1.6 * half * i) / 3;
      lines.push([P2(cam, add(c, [-half, 0, z])), P2(cam, add(c, [half, 0, z]))]);
    }
    return { corners, lines };
  }

  function arrowPath(a, b, bend) {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 1;
    const cx = mx - (dy / L) * bend * L;
    const cy = my + (dx / L) * bend * L;
    const tx = b[0] - cx;
    const ty = b[1] - cy;
    const tl = Math.hypot(tx, ty) || 1;
    const ux = tx / tl;
    const uy = ty / tl;
    const s = Math.min(0.07, L * 0.45);
    const h1 = [b[0] - ux * s - uy * s * 0.6, b[1] - uy * s + ux * s * 0.6];
    const h2 = [b[0] - ux * s + uy * s * 0.6, b[1] - uy * s - ux * s * 0.6];
    return { line: `M${f1(a[0])} ${f1(a[1])}Q${f1(cx)} ${f1(cy)} ${f1(b[0])} ${f1(b[1])}`, head: `M${f1(h1[0])} ${f1(h1[1])}L${f1(b[0])} ${f1(b[1])}L${f1(h2[0])} ${f1(h2[1])}` };
  }

  // Punti estremi delle parti attive (per le frecce del movimento).
  const ENDS = { arml: (s) => s.hand.l, armr: (s) => s.hand.r, legl: (s) => s.ankle.l, legr: (s) => s.ankle.r, torso: (s) => s.chest, head: (s) => s.head, arm: null, leg: null };
  function arrowsFor(prevSk, sk, act, cam) {
    if (!prevSk || !act) return [];
    const out = [];
    act.forEach((a) => {
      const fn = ENDS[a];
      if (!fn) return;
      const p0 = fn(prevSk);
      const p1 = fn(sk);
      if (len(sub(p1, p0)) < 0.08) return;
      // la freccia si ferma poco prima del punto d'arrivo
      const q0 = P2(cam, add(p0, mul(sub(p1, p0), 0.08)));
      const q1 = P2(cam, add(p0, mul(sub(p1, p0), 0.86)));
      out.push(arrowPath(q0, q1, 0.12));
    });
    return out;
  }

  // Limiti dello schermo (per inquadrare in modo stabile tutta la dimostrazione).
  function boundsOf(skels, cam, props) {
    let x0 = Infinity; let x1 = -Infinity; let y0 = Infinity; let y1 = -Infinity;
    const take = (p) => { const q = P2(cam, p); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); };
    skels.forEach((s) => {
      [s.head, s.pel, s.chest].forEach(take);
      SIDES.forEach((k) => { [s.hand[k], s.elbow[k], s.knee[k], s.ankle[k], s.toe[k], s.heel[k]].forEach(take); });
      take(add(s.head, [0, DIM.headR, 0]));
      take([s.pel[0], 0, s.pel[2]]);
    });
    (props || []).forEach((pp) => { if (pp.k === "bag") { take([pp.x, pp.y1, pp.z || 0]); take([pp.x, pp.y0, pp.z || 0]); } });
    const pad = 0.16;
    return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
  }

  // Rende i gruppi in SVG: prima i contorni scuri, poi i colori, dal piu' lontano al piu' vicino.
  function groupsSVG(groups) {
    groups.sort((a, b) => a.depth - b.depth);
    let out = "";
    groups.forEach((g) => {
      const cls = `mf-${g.tone}${g.role === "partner" ? " mf-partner" : ""}`;
      let ol = "";
      let fill = "";
      g.items.forEach((it) => {
        if (it.k === "seg") {
          const d = `x1="${f1(it.a[0])}" y1="${f1(it.a[1])}" x2="${f1(it.b[0])}" y2="${f1(it.b[1])}"`;
          ol += `<line ${d} stroke-width="${f1(it.w + W.ol * 2)}"/>`;
          fill += `<line ${d} stroke-width="${f1(it.w)}"/>`;
        } else if (it.k === "dot") {
          ol += `<circle cx="${f1(it.c[0])}" cy="${f1(it.c[1])}" r="${f1(it.r + W.ol)}" stroke-width="0"/>`;
          fill += `<circle cx="${f1(it.c[0])}" cy="${f1(it.c[1])}" r="${f1(it.r)}" stroke-width="0"/>`;
        } else if (it.k === "poly") {
          const pts = it.pts.map((q) => `${f1(q[0])},${f1(q[1])}`).join(" ");
          ol += `<polygon points="${pts}" stroke-width="${f1(it.w + W.ol * 2)}"/>`;
          fill += `<polygon points="${pts}" stroke-width="${f1(it.w)}"/>`;
        } else if (it.k === "belt") {
          fill += `<line class="mf-belt" x1="${f1(it.a[0])}" y1="${f1(it.a[1])}" x2="${f1(it.b[0])}" y2="${f1(it.b[1])}" stroke-width="${f1(it.w)}"/>`;
        } else if (it.k === "eye") {
          fill += `<circle class="mf-eye" cx="${f1(it.c[0])}" cy="${f1(it.c[1])}" r="${f1(it.r)}" stroke-width="0"/>`;
        } else if (it.k === "chain") {
          fill += `<line class="mf-chain" x1="${f1(it.a[0])}" y1="${f1(it.a[1])}" x2="${f1(it.b[0])}" y2="${f1(it.b[1])}"/>`;
        } else if (it.k === "cyl") {
          const x = it.top[0];
          fill += `<path class="mf-bag" d="M${f1(x - it.r)} ${f1(it.top[1])}L${f1(x - it.r)} ${f1(it.bot[1])}A${f1(it.r)} ${f1(it.ry)} 0 0 0 ${f1(x + it.r)} ${f1(it.bot[1])}L${f1(x + it.r)} ${f1(it.top[1])}Z"/><ellipse class="mf-bagtop" cx="${f1(x)}" cy="${f1(it.top[1])}" rx="${f1(it.r)}" ry="${f1(it.ry)}"/>`;
        }
      });
      out += `<g class="${cls}"><g class="mf-ol">${ol}</g><g class="mf-fill">${fill}</g></g>`;
    });
    return out;
  }

  /*
   * SVG di un istante. opts: { view, box, prev (posa precedente per le frecce), act, props, partner, cls, label, floor }
   */
  function svg(pose, opts = {}) {
    const cam = camera(opts.view);
    const sk = solve(pose);
    const groups = figurePrims(sk, cam, { act: opts.act || pose.act });
    if (opts.partner) groups.push(...figurePrims(solve(opts.partner), cam, { role: "partner", act: [] }));
    groups.push(...propPrims(opts.props, cam));
    const box = opts.box || boundsOf([sk], cam, opts.props);
    const fl = floorPrims(cam, opts.floorAt || [sk.pel[0], 0, sk.pel[2]]);
    const shadow = P2(cam, [sk.pel[0], 0, sk.pel[2]]);
    const ry = 0.32 * Math.sin(cam.pitch * DEG) + 0.012;
    let arrows = "";
    if (opts.prev) {
      arrowsFor(solve(opts.prev), sk, opts.act || pose.act, cam).forEach((a) => { arrows += `<path class="mf-arrow" d="${a.line}"/><path class="mf-arrow mf-arrowhead" d="${a.head}"/>`; });
    }
    const floor = opts.floor === false ? "" : `<polygon class="mf-mat" points="${fl.corners.map((q) => `${f1(q[0])},${f1(q[1])}`).join(" ")}"/>${fl.lines.map(([a, b]) => `<line class="mf-matline" x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}"/>`).join("")}<ellipse class="mf-shadow" cx="${f1(shadow[0])}" cy="${f1(shadow[1])}" rx="0.34" ry="${f1(ry)}"/>`;
    const label = opts.label ? ` role="img" aria-label="${String(opts.label).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))}"` : ` aria-hidden="true"`;
    return `<svg class="mf ${opts.cls || ""}" viewBox="${f1(box.x)} ${f1(box.y)} ${f1(box.w)} ${f1(box.h)}" preserveAspectRatio="xMidYMid meet"${label}>${floor}${groupsSVG(groups)}${arrows}</svg>`;
  }

  /* ------------------------------------------------------------ dimostrazione */
  /*
   * demo = { steps: [{ label, frames: [{ pose, t, h, act, key }] }], props }
   * Ogni fotogramma: t = ms per arrivarci dal precedente, h = ms di sosta.
   */
  function timeline(demo) {
    const items = [];
    let time = 0;
    demo.steps.forEach((st, si) => {
      st.frames.forEach((f, fi) => {
        const t = items.length ? (f.t == null ? 450 : f.t) : 0;
        const h = f.h == null ? 250 : f.h;
        items.push({ pose: f.pose, act: f.act || f.pose.act || null, start: time, t, h, step: si, local: fi, first: fi === 0, partner: f.partner || null, props: f.props || null });
        time += t + h;
      });
      // pausa a fine passo
      if (items.length) { items[items.length - 1].h += st.pause == null ? 450 : st.pause; time += st.pause == null ? 450 : st.pause; }
    });
    // ritorno al primo fotogramma per ricominciare
    const back = 600;
    return { items, total: time + back, back };
  }

  const easeIO = (t) => 0.5 - Math.cos(Math.PI * t) / 2;

  // Posa all'istante "ms" della dimostrazione.
  function poseAt(tl, ms) {
    const items = tl.items;
    const total = tl.total;
    let m = ((ms % total) + total) % total;
    for (let i = 0; i < items.length; i += 1) {
      const it = items[i];
      const arrive = it.start + it.t;
      const next = items[i + 1];
      if (m < it.start + it.t) {
        const prev = items[i - 1] || items[items.length - 1];
        const k = it.t ? (m - it.start) / it.t : 1;
        return { pose: lerpPose(prev.pose, it.pose, easeIO(k)), act: it.act, step: it.step, index: i, partner: it.partner || prev.partner ? lerpPose(prev.partner || it.partner, it.partner || prev.partner, easeIO(k)) : null };
      }
      if (!next || m < next.start) {
        if (m < arrive + it.h || !next) {
          if (!next && m >= arrive + it.h) {
            const k = (m - arrive - it.h) / tl.back;
            const first = items[0];
            return { pose: lerpPose(it.pose, first.pose, easeIO(clamp(k, 0, 1))), act: null, step: it.step, index: i, partner: it.partner && first.partner ? lerpPose(it.partner, first.partner, easeIO(clamp(k, 0, 1))) : null };
          }
          return { pose: it.pose, act: it.act, step: it.step, index: i, partner: it.partner };
        }
      }
    }
    const last = items[items.length - 1];
    return { pose: last.pose, act: last.act, step: last.step, index: items.length - 1, partner: last.partner };
  }

  /*
   * Lettore animato. opts: { view, speed, autoplay, reduced, fps, state, onStep(i), onFrame(passo, fotogramma) }
   * Restituisce { play, pause, toggle, goStep(i), showFrame(passo, fotogramma), loopStep(i|null),
   *               setView(v), state(), destroy, isPlaying, step }
   */
  function player(container, demo, opts = {}) {
    const full = timeline(demo);
    const perStep = [];
    const tlOf = (i) => perStep[i] || (perStep[i] = timeline({ steps: [demo.steps[i]], props: demo.props }));
    const saved = opts.state || {};
    const n = demo.steps.length;
    let loop = saved.loop != null && saved.loop < n ? saved.loop : null; // passo ripetuto da solo
    let tl = loop != null ? tlOf(loop) : full;
    let viewKey = saved.view && VIEWS[saved.view] ? saved.view : opts.view && VIEWS[opts.view] ? opts.view : "tq";
    let custom = saved.custom || null; // vista girata a mano
    let speed = saved.speed || opts.speed || 1;
    let playing = false;
    let clock = saved.clock || 0;
    let last = 0;
    let lastDraw = 0;
    let raf = 0;
    let stepShown = -1;
    let frameShown = "";
    let visible = true;
    const minGap = 1000 / (opts.fps || 30) - 2;
    const props = demo.props || [];
    const boxes = {};
    const skels = full.items.map((it) => solve(it.pose));
    const partners = full.items.filter((it) => it.partner).map((it) => solve(it.partner));
    const boxFor = (cam, key) => {
      if (key && boxes[key]) return boxes[key];
      const b = boundsOf(skels.concat(partners), cam, props);
      // proporzioni fisse del riquadro (16:10) centrate sulla figura
      const ratio = 1.6;
      let { x, y, w, h } = b;
      if (w / h < ratio) { const nw = h * ratio; x -= (nw - w) / 2; w = nw; } else { const nh = w / ratio; y -= (nh - h) / 2; h = nh; }
      const out = { x, y, w, h };
      if (key) boxes[key] = out;
      return out;
    };
    const floorAt = (() => { const xs = skels.map((s) => s.pel[0]); const zs = skels.map((s) => s.pel[2]); return [(Math.min(...xs) + Math.max(...xs)) / 2, 0, (Math.min(...zs) + Math.max(...zs)) / 2]; })();

    container.innerHTML = `
      <div class="mf-player">
        <div class="mf-stage" tabindex="0" role="img" aria-label="Dimostrazione animata"></div>
        <p class="mf-cap" aria-live="polite"><span class="mf-step"></span><span class="mf-captext"></span></p>
        <div class="mf-ctrl">
          <button type="button" class="mf-btn mf-play" data-mf="toggle" aria-label="Riproduci"><span class="mf-ico" aria-hidden="true"></span></button>
          <button type="button" class="mf-btn" data-mf="prev" aria-label="Passo precedente">‹</button>
          <button type="button" class="mf-btn" data-mf="next" aria-label="Passo successivo">›</button>
          <button type="button" class="mf-btn mf-txt" data-mf="loop" aria-pressed="${loop != null}" aria-label="Ripeti il passo" title="Ripeti solo questo passo">Ripeti</button>
          <button type="button" class="mf-btn mf-txt" data-mf="slow" aria-pressed="${speed < 1}" title="Al rallentatore">Lento</button>
          <span class="mf-views" role="group" aria-label="Vista">${Object.keys(VIEWS).map((k) => `<button type="button" class="mf-btn mf-txt" data-mf="view" data-v="${k}" aria-pressed="${!custom && k === viewKey}">${VIEWS[k].name}</button>`).join("")}</span>
        </div>
      </div>`;
    const stage = container.querySelector(".mf-stage");
    const capText = container.querySelector(".mf-captext");
    const stepEl = container.querySelector(".mf-step");
    const playBtn = container.querySelector(".mf-play");
    const loopBtn = container.querySelector('[data-mf="loop"]');

    function viewNow() { return custom || VIEWS[viewKey]; }
    function draw() {
      const v = viewNow();
      const cam = camera(v);
      const st = poseAt(tl, clock);
      const it = tl.items[st.index];
      const step = loop != null ? loop : st.step;
      // frecce: dal fotogramma prima a quello a cui si sta arrivando
      const prevItem = tl.items[st.index - 1];
      stage.innerHTML = svg(st.pose, { view: v, box: boxFor(cam, custom ? null : viewKey), act: st.act, props, partner: st.partner, floorAt, prev: prevItem && clock % tl.total < it.start + it.t + it.h ? prevItem.pose : null });
      if (step !== stepShown) {
        stepShown = step;
        const label = demo.steps[step] ? demo.steps[step].label : "";
        capText.textContent = label;
        stepEl.textContent = `${step + 1}/${n}`;
        stage.setAttribute("aria-label", `Dimostrazione animata, passo ${step + 1} di ${n}: ${label}`);
        if (opts.onStep) opts.onStep(step);
      }
      const fk = `${step}:${it.local}`;
      if (fk !== frameShown) {
        frameShown = fk;
        if (opts.onFrame) opts.onFrame(step, it.local);
      }
    }
    function frameLoop(now) {
      if (!playing) return;
      const dt = Math.min(100, now - (last || now));
      last = now;
      clock += dt * speed;
      if (visible && now - lastDraw >= minGap) { lastDraw = now; draw(); }
      raf = requestAnimationFrame(frameLoop);
    }
    function setPlayBtn() {
      playBtn.setAttribute("aria-label", playing ? "Pausa" : "Riproduci");
      playBtn.classList.toggle("on", playing);
    }
    function play() {
      if (playing) return;
      playing = true;
      last = 0;
      setPlayBtn();
      raf = requestAnimationFrame(frameLoop);
    }
    function pause() {
      playing = false;
      cancelAnimationFrame(raf);
      setPlayBtn();
    }
    function stepStart(i) {
      const it = full.items.find((x) => x.step === i);
      return it ? it.start + it.t : 0;
    }
    function goStep(i, keepPlaying = true) {
      const k = ((i % n) + n) % n;
      if (loop != null) { loop = k; tl = tlOf(k); clock = 0; } else clock = stepStart(k);
      stepShown = -1;
      draw();
      if (!keepPlaying) pause();
    }
    // mostra un fotogramma preciso di un passo, fermo
    function showFrame(step, local) {
      const k = Math.max(0, Math.min(n - 1, step));
      pause();
      let it;
      if (loop != null) { loop = k; tl = tlOf(k); it = tl.items[local] || tl.items[0]; } else it = full.items.find((x) => x.step === k && x.local === local) || full.items.find((x) => x.step === k);
      clock = it ? it.start + it.t : 0;
      draw();
    }
    // ripete solo il passo i (null = tutta la dimostrazione)
    function loopStep(i) {
      const cur = stepShown < 0 ? 0 : stepShown;
      if (i == null) { loop = null; tl = full; clock = stepStart(cur); } else { loop = ((i % n) + n) % n; tl = tlOf(loop); clock = 0; }
      loopBtn.setAttribute("aria-pressed", String(loop != null));
      stepShown = -1;
      draw();
    }
    function onClick(e) {
      const b = e.target.closest("[data-mf]");
      if (!b) return;
      const a = b.dataset.mf;
      if (a === "toggle") { if (playing) pause(); else play(); } else if (a === "prev") goStep(stepShown - 1, playing); else if (a === "next") goStep(stepShown + 1, playing); else if (a === "loop") { loopStep(loop != null ? null : stepShown); } else if (a === "slow") { speed = speed < 1 ? 1 : 0.45; b.setAttribute("aria-pressed", String(speed < 1)); } else if (a === "view") {
        viewKey = b.dataset.v;
        custom = null;
        container.querySelectorAll('[data-mf="view"]').forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
        draw();
      }
    }
    // trascina per girare l'omino
    let drag = null;
    function onDown(e) { drag = { x: e.clientX, yaw: viewNow().yaw, pitch: viewNow().pitch }; if (stage.setPointerCapture && e.pointerId != null) try { stage.setPointerCapture(e.pointerId); } catch (err) { /* niente */ } }
    function onMove(e) {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) < 3 && !custom) return;
      custom = { name: "", yaw: drag.yaw - dx * 0.5, pitch: drag.pitch };
      container.querySelectorAll('[data-mf="view"]').forEach((x) => x.setAttribute("aria-pressed", "false"));
      draw();
    }
    function onUp() { drag = null; }
    function onKey(e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); if (playing) pause(); else play(); } else if (e.key === "ArrowRight") { e.preventDefault(); goStep(stepShown + 1, playing); } else if (e.key === "ArrowLeft") { e.preventDefault(); goStep(stepShown - 1, playing); }
    }
    container.addEventListener("click", onClick);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("keydown", onKey);
    let io = null;
    if (typeof IntersectionObserver === "function") {
      io = new IntersectionObserver((en) => { visible = en.some((x) => x.isIntersecting); });
      io.observe(stage);
    }
    draw();
    const auto = saved.playing != null ? saved.playing : opts.autoplay !== false && !opts.reduced;
    if (auto) play(); else pause();
    return {
      play, pause, goStep, showFrame, loopStep,
      toggle() { if (playing) pause(); else play(); },
      isPlaying: () => playing,
      setView(v) { if (VIEWS[v]) { viewKey = v; custom = null; draw(); } },
      state: () => ({ view: viewKey, custom, speed, clock, loop, playing }),
      get step() { return stepShown; },
      destroy() { pause(); if (io) io.disconnect(); container.removeEventListener("click", onClick); container.innerHTML = ""; }
    };
  }

  // Inquadratura comune per le miniature di una dimostrazione (stessa scala per tutte).
  function demoBox(demo, view) {
    const cam = camera(view);
    const skels = [];
    demo.steps.forEach((s) => s.frames.forEach((f) => { skels.push(solve(f.pose)); if (f.partner) skels.push(solve(f.partner)); }));
    return boundsOf(skels, cam, demo.props);
  }

  return { solve, check, svg, player, lerpPose, timeline, poseAt, demoBox, camera, VIEWS, DIM, frame, ik, yawFwd, yawRight };
});
