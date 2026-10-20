/*
 * Progetto A - Difesa: la libreria dei movimenti dell'omino 3D (defense/figure3d.js).
 *
 * Ogni movimento ha un nome (es. "boxe.jab"), una descrizione e una serie di fotogrammi:
 *   { pose, t: ms per arrivarci, h: ms di sosta, act: parti che lavorano (arml, armr, legl, legr, torso, head) }
 * Le pose si costruiscono con il costruttore B a partire dalle posizioni di base (in questo file):
 * guardie e posizioni dei vari stili, colpi dritti, ganci, montanti, calci, parate, terra.
 * I movimenti dei singoli stili stanno in defense/moves/*.js e si aggiungono con MartialMoves.add("stile", fn):
 * le pose di uno stile vengono costruite solo quando servono la prima volta.
 *
 * Coordinate: x avanti, y su, z a destra della figura; yaw positivo = girato verso la propria
 * sinistra. Destrimano in guardia ortodossa: piede e mano sinistri avanti ("l" = anteriore).
 *
 * window.MartialMoves = { add, get, has, names, catalog, demoFor, keyFrames, lib }
 */
(function (root, factory) {
  const F = typeof module === "object" && module.exports ? require("./figure3d.js") : root.MartialFigure;
  const api = factory(F);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MartialMoves = api;
})(typeof window !== "undefined" ? window : globalThis, function (F) {
  "use strict";

  const DEG = Math.PI / 180;
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const len = (a) => Math.sqrt(dot(a, a));
  const norm = (a) => { const l = len(a); return l > 1e-9 ? mul(a, 1 / l) : [0, 1, 0]; };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const ARM = F.DIM.upper + F.DIM.fore;
  const LEG = F.DIM.thigh + F.DIM.shin;
  const GROUND = 0.025; // altezza della pianta a terra

  // Altezza della caviglia con il piede inclinato di "deg" e la punta a terra.
  const ankleY = (deg) => GROUND + 0.15 * Math.sin(deg * DEG) + 0.055 * Math.cos(deg * DEG);
  const HEIGHT = { low: 0.5, leg: 0.55, mid: 0.98, body: 0.98, high: 1.42, head: 1.52 };

  /* ------------------------------------------------------------ costruttore di pose */
  class B {
    constructor(p) {
      this.p = clone(p);
      if (!this.p.o) this.p.o = [0, 0];
      ["hand", "foot", "footYaw", "footPitch", "footRoll", "grip", "pole"].forEach((k) => { if (!this.p[k]) this.p[k] = {}; });
    }
    static of(p) { return new B(p); }
    copy() { return new B(this.p); }
    done() { return clone(this.p); }
    frame() { return F.frame(norm(sub(this.p.chest, this.p.pel)), this.p.chestYaw, this.p.chestRoll || 0); }
    hipFrame() { return F.frame(norm(sub(this.p.chest, this.p.pel)), this.p.hipYaw, this.p.hipRoll || 0); }
    sh(s) { const fr = this.frame(); return add(this.p.chest, mul(fr.right, (s === "l" ? -1 : 1) * F.DIM.sh)); }
    hip(s) { const fr = this.hipFrame(); return add(this.p.pel, mul(fr.right, (s === "l" ? -1 : 1) * F.DIM.hip)); }
    // punto relativo al petto: avanti, su, destra (secondo come e' girato il busto)
    rel(f, u, r) { const fr = this.frame(); return add(add(add(this.p.chest, mul(fr.fwd, f)), mul(fr.up, u)), mul(fr.right, r)); }
    relHead(f, u, r) { const fr = this.frame(); return add(add(add(this.p.head, mul(fr.fwd, f)), mul(fr.up, u)), mul(fr.right, r)); }
    relPel(f, u, r) { const fr = this.hipFrame(); return add(add(add(this.p.pel, mul(fr.fwd, f)), mul(fr.up, u)), mul(fr.right, r)); }
    // bersagli di un avversario immaginario davanti (relativi alla posizione di partenza)
    tgt(name) {
      const T = { head: [0.8, 1.5, 0.0], chin: [0.78, 1.46, 0.0], body: [0.66, 1.12, 0.02], low: [0.62, 0.62, -0.04], leg: [0.55, 0.55, -0.06], high: [0.75, 1.62, 0], groin: [0.6, 0.85, 0] };
      const t = Array.isArray(name) ? name : T[name] || T.head;
      return [t[0] + this.p.o[0], t[1], t[2] + this.p.o[1]];
    }
    // busto e bacino
    turn(d) { this.p.hipYaw += d; this.p.chestYaw += d; return this; }
    hips(d) { this.p.hipYaw += d; return this; }
    twist(d) { this.p.chestYaw += d; return this; }
    roll(chest, hip = 0) { this.p.chestRoll = (this.p.chestRoll || 0) + chest; this.p.hipRoll = (this.p.hipRoll || 0) + hip; return this; }
    lean(dx, dz = 0, dy = 0) {
      this.p.chest = add(this.p.chest, [dx, -dy, dz]);
      this.p.head = add(this.p.head, [dx * 1.3, -dy * 1.15, dz * 1.3]);
      return this;
    }
    headTo(dx, dy, dz = 0) { this.p.head = add(this.p.head, [dx, dy, dz]); return this; }
    look(d) { this.p.headYaw = d; return this; }
    sink(dy) { ["pel", "chest", "head"].forEach((k) => { this.p[k] = add(this.p[k], [0, -dy, 0]); }); ["l", "r"].forEach((s) => { if (this.p.hand[s]) this.p.hand[s] = add(this.p.hand[s], [0, -dy, 0]); }); return this; }
    shift(dx, dz = 0) { ["pel", "chest", "head"].forEach((k) => { this.p[k] = add(this.p[k], [dx, 0, dz]); }); ["l", "r"].forEach((s) => { if (this.p.hand[s]) this.p.hand[s] = add(this.p.hand[s], [dx, 0, dz]); }); return this; }
    move(dx, dz = 0) { this.shift(dx, dz); ["l", "r"].forEach((s) => { if (this.p.foot[s]) this.p.foot[s] = add(this.p.foot[s], [dx, 0, dz]); }); this.p.o = [this.p.o[0] + dx, this.p.o[1] + dz]; return this; }
    // ruota tutta la figura attorno al punto di partenza (per girarsi su se stessi)
    spin(d) {
      const o = [this.p.o[0], 0, this.p.o[1]];
      const c = Math.cos(d * DEG);
      const sn = Math.sin(d * DEG);
      const rv = (v) => [v[0] * c + v[2] * sn, v[1], -v[0] * sn + v[2] * c];
      const rp = (pt) => add(o, rv(sub(pt, o)));
      ["pel", "chest", "head"].forEach((k) => { this.p[k] = rp(this.p[k]); });
      ["l", "r"].forEach((k) => {
        if (this.p.hand[k]) this.p.hand[k] = rp(this.p.hand[k]);
        if (this.p.foot[k]) this.p.foot[k] = rp(this.p.foot[k]);
        if (this.p.footYaw[k] != null) this.p.footYaw[k] += d;
        ["e", "k"].forEach((j) => { if (this.p.pole[j + k]) this.p.pole[j + k] = rv(this.p.pole[j + k]); });
      });
      this.p.hipYaw += d;
      this.p.chestYaw += d;
      return this;
    }
    set(k, v) { this.p[k] = clone(v); return this; }
    // piedi (x, z relativi al punto di partenza; heel = gradi di tallone alzato)
    foot(s, x, z, yaw, heel = 0) {
      this.p.foot[s] = [x + this.p.o[0], ankleY(heel), z + this.p.o[1]];
      if (yaw != null) this.p.footYaw[s] = yaw;
      this.p.footPitch[s] = heel;
      if (this.p.footRoll) this.p.footRoll[s] = 0;
      return this;
    }
    step(s, dx, dz = 0) { const f = this.p.foot[s]; this.p.foot[s] = [f[0] + dx, f[1], f[2] + dz]; return this; }
    heel(s, deg) { const f = this.p.foot[s]; this.p.foot[s] = [f[0], ankleY(deg), f[2]]; this.p.footPitch[s] = deg; return this; }
    fyaw(s, deg) { this.p.footYaw[s] = deg; return this; }
    // piede libero (calci, terra): punto assoluto relativo alla partenza, orientamento
    footAt(s, pt, yaw, pitch = 0, roll = 0) {
      this.p.foot[s] = [pt[0] + this.p.o[0], pt[1], pt[2] + this.p.o[1]];
      if (yaw != null) this.p.footYaw[s] = yaw;
      this.p.footPitch[s] = pitch;
      this.p.footRoll[s] = roll;
      return this;
    }
    footW(s, pt, yaw, pitch = 0, roll = 0) { this.p.foot[s] = pt; if (yaw != null) this.p.footYaw[s] = yaw; this.p.footPitch[s] = pitch; this.p.footRoll[s] = roll; return this; }
    lift(s, dy, dx = 0, dz = 0) { const f = this.p.foot[s]; this.p.foot[s] = [f[0] + dx, f[1] + dy, f[2] + dz]; return this; }
    // ginocchio e gomito verso una direzione (vettore nel mondo)
    knee(s, v) { this.p.pole["k" + s] = v; return this; }
    elbow(s, v) { this.p.pole["e" + s] = v; return this; }
    // mani
    hand(s, pt, grip) { this.p.hand[s] = pt; if (grip) this.p.grip[s] = grip; return this; }
    handW(s, x, y, z, grip) { return this.hand(s, [x + this.p.o[0], y, z + this.p.o[1]], grip); }
    handRel(s, f, u, r, grip) { return this.hand(s, this.rel(f, u, r), grip); }
    handHead(s, f, u, r, grip) { return this.hand(s, this.relHead(f, u, r), grip); }
    handPel(s, f, u, r, grip) { return this.hand(s, this.relPel(f, u, r), grip); }
    grip(s, g) { this.p.grip[s] = g; return this; }
    fists() { this.p.grip.l = "fist"; this.p.grip.r = "fist"; return this; }
    open() { this.p.grip.l = "open"; this.p.grip.r = "open"; return this; }
    // guardia generica: mani al viso rispetto a come e' girato il busto
    guard(kind = "box") {
      const G = {
        box: { l: [0.2, -0.06, -0.1], r: [0.1, -0.08, 0.07], g: "fist" },
        high: { l: [0.24, 0.0, -0.08], r: [0.2, -0.02, 0.08], g: "fist" },
        thai: { l: [0.3, -0.02, -0.09], r: [0.22, -0.04, 0.09], g: "fist" },
        low: { l: [0.3, -0.32, -0.08], r: [0.22, -0.36, 0.1], g: "fist" },
        open: { l: [0.32, -0.12, -0.08], r: [0.24, -0.16, 0.08], g: "open" },
        wrestle: { l: [0.38, -0.42, -0.14], r: [0.32, -0.46, 0.16], g: "open" }
      }[kind] || null;
      if (!G) return this;
      this.handHead("l", G.l[0], G.l[1], G.l[2], G.g);
      this.handHead("r", G.r[0], G.r[1], G.r[2], G.g);
      const fr = this.frame();
      this.elbow("l", add(add(mul(fr.up, -1), mul(fr.right, -0.25)), mul(fr.fwd, -0.1)));
      this.elbow("r", add(add(mul(fr.up, -1), mul(fr.right, 0.25)), mul(fr.fwd, -0.1)));
      return this;
    }
    // colpo dritto: mano verso il bersaglio, braccio quasi teso
    straight(s, target = "head", ext = 0.96, grip) {
      const shp = this.sh(s);
      const d = norm(sub(this.tgt(target), shp));
      this.p.hand[s] = add(shp, mul(d, ARM * ext));
      this.p.grip[s] = grip || "fist";
      this.elbow(s, add(this.frame().up, [0, -2.2, 0]));
      return this;
    }
    // gancio: braccio piegato a 90 gradi, gomito all'altezza della spalla, pugno verso il centro
    hook(s, target = "head") {
      const sign = s === "l" ? -1 : 1;
      const fr = this.frame();
      const t = this.tgt(target);
      const shp = this.sh(s);
      const hand = add(add(shp, mul(fr.fwd, 0.36)), mul(fr.right, -sign * 0.2));
      hand[1] = target === "body" ? t[1] + 0.05 : Math.min(shp[1] + 0.02, t[1]);
      this.p.hand[s] = hand;
      this.p.grip[s] = "fist";
      this.elbow(s, add(add(mul(fr.right, sign), [0, target === "body" ? -0.3 : 0.25, 0]), mul(fr.fwd, -0.2)));
      return this;
    }
    // montante: pugno sale davanti, gomito sotto il pugno
    upper(s, target = "chin") {
      const sign = s === "l" ? -1 : 1;
      const fr = this.frame();
      const shp = this.sh(s);
      this.p.hand[s] = add(add(add(shp, mul(fr.fwd, 0.3)), mul(fr.right, -sign * 0.08)), [0, target === "body" ? -0.25 : 0.02, 0]);
      this.p.grip[s] = "fist";
      this.elbow(s, add(mul(fr.fwd, 0.6), [0, -1, 0]));
      return this;
    }
    // gomitata orizzontale: mano verso la spalla opposta, gomito avanti all'altezza del viso
    elbowStrike(s, kind = "horizontal") {
      const sign = s === "l" ? -1 : 1;
      const fr = this.frame();
      if (kind === "up") {
        this.handHead(s, 0.06, 0.12, -sign * 0.02, "fist");
        this.elbow(s, add(mul(fr.fwd, 1), [0, 0.6, 0]));
      } else if (kind === "down") {
        this.handHead(s, 0.05, 0.1, sign * 0.05, "fist");
        this.elbow(s, add(mul(fr.fwd, 1), [0, 1.2, 0]));
      } else {
        this.handHead(s, 0.08, -0.12, -sign * 0.14, "fist");
        this.elbow(s, add(mul(fr.fwd, 1), mul(fr.right, sign * 0.6)));
      }
      return this;
    }
    // parate (karate, taekwondo, kung fu)
    hikite(s) { const sign = s === "l" ? -1 : 1; this.handRel(s, -0.06, -0.42, sign * 0.2, "fist"); this.elbow(s, add(mul(this.frame().fwd, -1), [0, -0.3, 0])); return this; }
    block(s, kind) {
      const sign = s === "l" ? -1 : 1;
      const fr = this.frame();
      if (kind === "low") { this.handRel(s, 0.3, -0.62, sign * 0.1, "fist"); this.elbow(s, add(mul(fr.right, sign), [0, 0.2, 0])); }
      if (kind === "high") { this.handHead(s, 0.16, 0.16, -sign * 0.02, "fist"); this.elbow(s, add(add(mul(fr.right, sign), mul(fr.fwd, 0.5)), [0, 0.3, 0])); }
      if (kind === "out") { this.handRel(s, 0.3, 0.06, sign * 0.12, "fist"); this.elbow(s, add([0, -1, 0], mul(fr.right, sign * 0.2))); }
      if (kind === "in") { this.handRel(s, 0.32, 0.06, -sign * 0.02, "fist"); this.elbow(s, add([0, -1, 0], mul(fr.right, sign * 0.3))); }
      if (kind === "knife") { this.handRel(s, 0.32, 0.04, sign * 0.06, "blade"); this.elbow(s, add([0, -1, 0], mul(fr.right, sign * 0.3))); }
      return this;
    }

    /*
     * Calcio. s = gamba che calcia, kind = front | teep | round | low | side | back | hook | axe |
     * crescentIn | crescentOut | knee | check, phase = chamber | ext | recoil | hook,
     * h = low | mid | high | head | numero (altezza della caviglia), o = { arms: guard|swing|low|clinch }
     */
    kick(s, kind, phase = "ext", h = "mid", o = {}) {
      const p = this.p;
      const sup = s === "l" ? "r" : "l";
      const ss = s === "r" ? 1 : -1;
      const H = typeof h === "number" ? h : HEIGHT[h] || 0.98;
      const sf = p.foot[sup];
      const ch = phase === "chamber" || phase === "recoil";
      const hipAt = (pel, yaw) => add(pel, mul(F.yawRight(yaw), F.DIM.hip * ss));
      const toward = (hip, dir, k = 0.85) => add(hip, mul(norm(dir), k));
      let hipYaw = p.hipYaw;
      let chestOff = 0;
      let pel = [sf[0] - 0.04, 0.92, sf[2] + ss * 0.03];
      let lean = [-0.05, 0, 0];
      let headYaw = 0;
      let supYaw = p.footYaw[sup];
      let supHeel = 0;
      let ankle;
      let fyaw = 0;
      let fpitch = 0;
      let froll = 0;
      let kpole = [1, 0.5, 0];
      let arms = o.arms || "guard";
      if (kind === "front" || kind === "teep") {
        hipYaw = o.hipYaw != null ? o.hipYaw : s === "r" ? -12 : -28;
        pel = [sf[0] - 0.03 + (kind === "teep" && !ch ? 0.05 : 0), ch ? 0.93 : 0.92, sf[2] + ss * 0.04];
        lean = kind === "teep" && !ch ? [-0.13, 0, 0] : [-0.06, 0, 0];
        const hp = hipAt(pel, hipYaw);
        if (ch) { ankle = add(hp, [0.28, -0.37, 0]); kpole = [1, 0.8, 0]; fpitch = 45; } else { ankle = toward(hp, [0.85, H - hp[1], -ss * 0.04]); kpole = [0.2, 1, 0]; fpitch = kind === "teep" ? -70 : 5; }
        fyaw = 0;
        supHeel = ch ? 0 : 6;
      } else if (kind === "round" || kind === "low") {
        const HH = kind === "low" ? 0.55 : H;
        hipYaw = ch ? ss * 40 : ss * 95;
        chestOff = ch ? -ss * 15 : -ss * 30;
        supYaw = ch ? ss * 55 : ss * 112;
        supHeel = 22;
        pel = [sf[0] - (ch ? 0.02 : 0.07), ch ? 0.93 : 0.92, sf[2] + ss * 0.03];
        lean = ch ? [-0.05, 0, 0] : [-0.14, 0, 0];
        headYaw = ch ? -ss * 20 : -ss * 65;
        const hp = hipAt(pel, hipYaw);
        if (ch) {
          ankle = add(hp, [0.0, -0.06, ss * 0.3]);
          kpole = [0.8, 0.35, -ss * 0.6];
          fyaw = ss > 0 ? -155 : 155;
          fpitch = 30;
        } else {
          const dir = [0.85, HH - hp[1], -ss * 0.16];
          ankle = toward(hp, dir);
          kpole = [0, 0.3, -ss];
          fyaw = -ss * 8;
          fpitch = -Math.atan2(HH - hp[1], 0.85) / DEG + 8;
          froll = ss * 80;
        }
        if (o.arms == null) arms = "swing";
      } else if (kind === "side") {
        hipYaw = ss * (ch ? 72 : 92);
        supYaw = ss * (ch ? 120 : 158);
        supHeel = ch ? 0 : 8;
        pel = [sf[0] - (ch ? 0.02 : 0.09), ch ? 0.92 : 0.93, sf[2]];
        lean = ch ? [-0.05, 0, 0] : [-0.22, 0, 0];
        headYaw = -ss * (ch ? 55 : 82);
        const hp = hipAt(pel, hipYaw);
        if (ch) { ankle = add(hp, [0.2, -0.22, -ss * 0.14]); kpole = [0.2, 0.8, -ss * 0.8]; fyaw = ss * 90; fpitch = 30; } else { ankle = toward(hp, [0.86, H - hp[1], 0]); kpole = [0, 0.4, -ss]; fyaw = ss * 90; fpitch = 22; }
      } else if (kind === "back") {
        hipYaw = ch ? -ss * 150 : -ss * 180;
        supYaw = -ss * 170;
        supHeel = 8;
        pel = [sf[0] + 0.02, 0.92, sf[2] + ss * 0.02];
        lean = ch ? [-0.06, 0, 0] : [-0.17, 0, 0];
        headYaw = -ss * 85;
        const hp = hipAt(pel, hipYaw);
        if (ch) { ankle = add(hp, [-0.18, -0.26, 0]); kpole = [-1, 0.6, 0]; fyaw = 180; fpitch = 60; } else { ankle = toward(hp, [0.86, H - hp[1], 0]); kpole = [0, -1, 0]; fyaw = 180; fpitch = 82; }
      } else if (kind === "hook") {
        hipYaw = ss * 90;
        supYaw = ss * 150;
        supHeel = 8;
        pel = [sf[0] - 0.08, 0.93, sf[2]];
        lean = [-0.2, 0, 0];
        headYaw = -ss * 82;
        const hp = hipAt(pel, hipYaw);
        if (ch) { ankle = add(hp, [0.2, -0.22, -ss * 0.14]); kpole = [0.2, 0.8, -ss * 0.8]; fyaw = ss * 90; fpitch = 30; } else if (phase === "hook") { ankle = add(hp, [0.4, H - hp[1] - 0.05, ss * 0.25]); kpole = [0.3, 0.5, -ss]; fyaw = ss * 60; fpitch = 30; } else { ankle = toward(hp, [0.8, H - hp[1], -ss * 0.42]); kpole = [0, 0.4, -ss]; fyaw = ss * 90; fpitch = 22; }
      } else if (kind === "axe") {
        hipYaw = s === "r" ? -15 : -30;
        pel = [sf[0] - 0.05, 0.93, sf[2] + ss * 0.04];
        lean = [-0.08, 0, 0];
        const hp = hipAt(pel, hipYaw);
        if (ch) { ankle = toward(hp, [0.42, 1, -ss * 0.18]); fpitch = -20; } else { ankle = toward(hp, [0.86, H - hp[1], 0]); fpitch = 10; }
        kpole = [1, 0.3, 0];
      } else if (kind === "crescentIn" || kind === "crescentOut") {
        hipYaw = s === "r" ? -15 : -30;
        pel = [sf[0] - 0.05, 0.93, sf[2] + ss * 0.04];
        lean = [-0.07, 0, 0];
        const hp = hipAt(pel, hipYaw);
        const outSide = kind === "crescentOut" ? ss : -ss; // dove finisce l'arco
        if (phase === "chamber") ankle = toward(hp, [0.7, 0.55, -outSide * 0.7]);
        else if (phase === "recoil") ankle = toward(hp, [0.6, 0.35, outSide * 0.8]);
        else ankle = toward(hp, [0.55, 1, 0]);
        kpole = [1, 0.3, 0];
        fpitch = 0;
        fyaw = 0;
      } else if (kind === "knee") {
        hipYaw = ss * 15;
        supHeel = 30;
        pel = [sf[0] + 0.06, 0.93, sf[2] + ss * 0.03];
        lean = [-0.1, 0, 0];
        const hp = hipAt(pel, hipYaw);
        if (ch) { ankle = add(hp, [-0.08, -0.55, 0]); kpole = [1, 0.3, 0]; fpitch = 40; } else { ankle = add(hp, [0.12, -0.3, -ss * 0.02]); kpole = [1, 1.3, 0]; fpitch = 70; }
        if (o.arms == null) arms = "clinch";
      } else if (kind === "check") {
        pel = [sf[0] + 0.02, 0.92, sf[2] + ss * 0.04];
        lean = [-0.03, 0, 0];
        const hp = hipAt(pel, hipYaw);
        ankle = add(hp, [0.16, -0.36, ss * 0.06]);
        kpole = [0.7, 0.6, ss * 0.5];
        fpitch = 25;
        fyaw = p.footYaw[s];
      }
      p.pel = pel;
      p.hipYaw = hipYaw;
      p.chestYaw = hipYaw + chestOff;
      p.chest = add(pel, [lean[0], 0.48 - Math.abs(lean[0]) * 0.25, lean[2]]);
      p.head = add(p.chest, [lean[0] * 0.35 + 0.02, 0.2, lean[2] * 0.3]);
      p.headYaw = headYaw;
      p.foot[sup] = [sf[0], ankleY(supHeel), sf[2]];
      p.footYaw[sup] = supYaw;
      p.footPitch[sup] = supHeel;
      p.footRoll[sup] = 0;
      p.foot[s] = ankle;
      p.footYaw[s] = fyaw;
      p.footPitch[s] = fpitch;
      p.footRoll[s] = froll;
      p.pole["k" + s] = kpole;
      delete p.pole["k" + sup];
      this.kickArms(arms, s);
      p.act = ["leg" + s];
      return this;
    }
    kickArms(kind, s) {
      const ss = s === "r" ? 1 : -1;
      const other = s === "r" ? "l" : "r";
      if (kind === "swing") {
        this.handRel(s, -0.18, -0.5, ss * 0.22, "open");
        this.elbow(s, [0, -1, 0]);
        this.handHead(other, 0.16, -0.02, -ss * 0.05, "fist");
        this.elbow(other, add(mul(this.frame().up, -1), mul(this.frame().right, -ss * 0.3)));
      } else if (kind === "clinch") {
        this.hand("l", this.tgt([0.42, 1.38, -0.1]), "open");
        this.hand("r", this.tgt([0.42, 1.38, 0.1]), "open");
        this.elbow("l", [0, -1, -0.2]);
        this.elbow("r", [0, -1, 0.2]);
      } else if (kind === "low") {
        this.guard("low");
      } else if (kind !== "none") {
        this.guard("box");
      }
      return this;
    }
    act(...parts) { this.p.act = parts; return this; }
    // a specchio (destra <-> sinistra): per la guardia mancina e per ripetere dall'altro lato
    mirror() {
      const p = this.p;
      const mz = (v) => (Array.isArray(v) ? [v[0], v[1], -v[2]] : v);
      const swap = (o, f = (x) => x) => { if (!o) return o; const l = o.l; const r = o.r; const n = Object.assign({}, o); delete n.l; delete n.r; if (r !== undefined) n.l = f(r); if (l !== undefined) n.r = f(l); return n; };
      ["pel", "chest", "head"].forEach((k) => { p[k] = mz(p[k]); });
      p.o = [p.o[0], -p.o[1]];
      ["hipYaw", "chestYaw", "headYaw", "hipRoll", "chestRoll"].forEach((k) => { if (p[k]) p[k] = -p[k]; });
      p.hand = swap(p.hand, mz);
      p.foot = swap(p.foot, mz);
      p.footYaw = swap(p.footYaw, (y) => -y);
      p.footRoll = swap(p.footRoll, (y) => -y);
      p.footPitch = swap(p.footPitch);
      p.grip = swap(p.grip);
      const pole = {};
      Object.keys(p.pole || {}).forEach((k) => { pole[k[0] + (k[1] === "l" ? "r" : "l")] = mz(p.pole[k]); });
      p.pole = pole;
      if (p.act) p.act = p.act.map((a) => a.replace(/(arm|leg)([lr])$/, (m, x, s) => x + (s === "l" ? "r" : "l")));
      return this;
    }
  }

  /* ------------------------------------------------------------ posizioni di base */
  function standing() {
    return B.of({
      o: [0, 0], pel: [0, 0.95, 0], hipYaw: 0, chest: [0.0, 1.45, 0], chestYaw: 0, head: [0.01, 1.65, 0],
      hand: { l: [0.03, 0.9, -0.24], r: [0.03, 0.9, 0.24] }, grip: { l: "open", r: "open" },
      foot: { l: [0, ankleY(0), -0.11], r: [0, ankleY(0), 0.11] }, footYaw: { l: 8, r: -8 }, footPitch: { l: 0, r: 0 }
    });
  }
  // pronto: piedi alla larghezza delle spalle, pugni chiusi davanti alla cintura
  function ready() { return standing().foot("l", 0, -0.16, 12).foot("r", 0, 0.16, -12).handRel("l", 0.16, -0.5, -0.13, "fist").handRel("r", 0.16, -0.5, 0.13, "fist"); }

  // Guardia da pugile, ortodossa (sinistro avanti).
  function boxStance() {
    const b = standing();
    b.foot("l", 0.25, -0.1, -8, 0).foot("r", -0.27, 0.15, -45, 18);
    b.set("pel", [-0.01, 0.89, 0.03]).set("hipYaw", -40).set("chestYaw", -42);
    b.set("chest", [0.04, 1.37, 0.03]).set("head", [0.09, 1.56, 0.02]);
    return b;
  }
  function boxGuard(b) {
    const f = b.frame();
    b.hand("l", add(add(b.p.head, mul(f.fwd, 0.2)), add(mul(f.right, -0.1), [0, -0.05, 0])), "fist");
    b.hand("r", add(add(b.p.head, mul(f.fwd, 0.1)), add(mul(f.right, 0.07), [0, -0.07, 0])), "fist");
    b.elbow("l", add(add(mul(f.up, -1), mul(f.right, -0.25)), mul(f.fwd, -0.1)));
    b.elbow("r", add(add(mul(f.up, -1), mul(f.right, 0.25)), mul(f.fwd, -0.1)));
    return b;
  }
  const box = () => boxGuard(boxStance());
  // Muay Thai: piu' alta e frontale, peso dietro, mani alte e avanti
  function thai() {
    const b = standing();
    b.foot("l", 0.2, -0.12, -5, 8).foot("r", -0.22, 0.16, -35, 10);
    b.set("pel", [-0.03, 0.91, 0.03]).set("hipYaw", -22).set("chestYaw", -22).set("chest", [-0.01, 1.4, 0.03]).set("head", [0.03, 1.6, 0.02]);
    return b.guard("thai");
  }
  // Taekwondo: di lato, sulle punte, mani basse
  function tkd() {
    const b = standing();
    b.foot("l", 0.24, -0.04, -60, 12).foot("r", -0.24, 0.06, -80, 14);
    b.set("pel", [0, 0.9, 0.01]).set("hipYaw", -72).set("chestYaw", -60).set("chest", [0.01, 1.39, 0.01]).set("head", [0.04, 1.59, 0.0]);
    return b.guard("low");
  }
  // Karate (kumite): di tre quarti, mano avanti all'altezza del mento, l'altra al plesso
  function kumite() {
    const b = standing();
    b.foot("l", 0.3, -0.08, -15, 6).foot("r", -0.3, 0.12, -50, 15);
    b.set("pel", [-0.02, 0.88, 0.02]).set("hipYaw", -45).set("chestYaw", -45).set("chest", [0.02, 1.37, 0.02]).set("head", [0.06, 1.57, 0.01]);
    b.handRel("l", 0.42, 0.05, -0.04, "fist").handRel("r", 0.22, -0.18, 0.02, "fist");
    return b;
  }
  // Posizioni del karate e del kung fu
  function zenkutsu(lead = "l") {
    const ss = lead === "l" ? 1 : -1;
    const b = standing();
    b.foot(lead, 0.44, -ss * 0.14, -ss * 5, 0).foot(lead === "l" ? "r" : "l", -0.46, ss * 0.16, -ss * 28, 0);
    b.set("pel", [0.03, 0.78, 0.0]).set("hipYaw", -ss * 15).set("chestYaw", -ss * 15).set("chest", [0.05, 1.28, 0.0]).set("head", [0.07, 1.48, 0.0]);
    b.knee(lead === "l" ? "r" : "l", [0, 0, ss]);
    return b.hikite("l").hikite("r");
  }
  function kiba() {
    const b = standing();
    b.foot("l", 0, -0.4, 5, 0).foot("r", 0, 0.4, -5, 0);
    b.set("pel", [0, 0.68, 0]).set("chest", [0.01, 1.18, 0]).set("head", [0.02, 1.38, 0]);
    b.knee("l", [0.6, 0, -1]).knee("r", [0.6, 0, 1]);
    return b.hikite("l").hikite("r");
  }
  function kokutsu(lead = "l") {
    const ss = lead === "l" ? 1 : -1;
    const back = lead === "l" ? "r" : "l";
    const b = standing();
    b.foot(lead, 0.36, -ss * 0.02, -ss * 5, 0).foot(back, -0.36, ss * 0.06, -ss * 90, 0);
    b.set("pel", [-0.13, 0.8, ss * 0.02]).set("hipYaw", -ss * 60).set("chestYaw", -ss * 60).set("chest", [-0.11, 1.3, ss * 0.02]).set("head", [-0.08, 1.5, ss * 0.01]);
    b.knee(back, [0.3, 0, ss]);
    return b.hikite("l").hikite("r");
  }
  function neko(lead = "l") {
    const ss = lead === "l" ? 1 : -1;
    const back = lead === "l" ? "r" : "l";
    const b = standing();
    b.foot(lead, 0.26, -ss * 0.02, -ss * 10, 35).foot(back, -0.1, ss * 0.06, -ss * 45, 0);
    b.set("pel", [-0.1, 0.8, ss * 0.02]).set("hipYaw", -ss * 40).set("chestYaw", -ss * 40).set("chest", [-0.08, 1.3, ss * 0.02]).set("head", [-0.05, 1.5, 0]);
    return b.hikite("l").hikite("r");
  }
  // Wing Chun: Yee Jee Kim Yeung Ma (piedi in dentro, ginocchia verso l'interno, frontale)
  function wcStance() {
    const b = standing();
    b.foot("l", 0, -0.2, -22, 0).foot("r", 0, 0.2, 22, 0);
    b.set("pel", [-0.03, 0.85, 0]).set("chest", [-0.01, 1.35, 0]).set("head", [0.0, 1.55, 0]);
    b.knee("l", [1, 0, 0.35]).knee("r", [1, 0, -0.35]);
    return b;
  }
  // guardia Wing Chun: man sao (mano avanti sulla linea centrale) e wu sao (mano di protezione)
  function wcGuard(b, lead = "l") {
    const ss = lead === "l" ? -1 : 1;
    b.handRel(lead, 0.42, -0.02, 0.0, "blade").handRel(lead === "l" ? "r" : "l", 0.22, -0.04, 0.0, "blade");
    b.elbow(lead, [0, -1, 0]).elbow(lead === "l" ? "r" : "l", [0, -1, -ss * 0.2]);
    return b;
  }
  // Lotta: bassa, piedi larghi, gomiti dentro, testa su
  function wrestle() {
    const b = standing();
    b.foot("l", 0.22, -0.18, -10, 10).foot("r", -0.22, 0.2, -30, 12);
    b.set("pel", [-0.03, 0.74, 0.01]).set("hipYaw", -15).set("chestYaw", -15).set("chest", [0.2, 1.17, 0.01]).set("head", [0.34, 1.32, 0.0]);
    return b.guard("wrestle");
  }
  // Sambo: piu' dritta, mani avanti aperte pronte a prendere la giacca
  function sambo() {
    const b = standing();
    b.foot("l", 0.2, -0.16, -10, 6).foot("r", -0.2, 0.18, -30, 8);
    b.set("pel", [-0.02, 0.85, 0.01]).set("hipYaw", -18).set("chestYaw", -18).set("chest", [0.08, 1.33, 0.01]).set("head", [0.13, 1.52, 0.0]);
    return b.guard("open");
  }
  // Systema: naturale, rilassata, mani basse e morbide
  function natural() {
    const b = standing();
    b.foot("l", 0.12, -0.14, 5, 0).foot("r", -0.12, 0.15, -25, 0);
    b.set("pel", [0, 0.91, 0.01]).set("hipYaw", -10).set("chestYaw", -10).set("chest", [0.02, 1.41, 0.01]).set("head", [0.04, 1.61, 0.0]);
    b.handRel("l", 0.22, -0.38, -0.12, "open").handRel("r", 0.16, -0.42, 0.14, "open");
    return b;
  }
  // Capoeira: ginga. phase 0 = piede destro dietro (braccio destro... protegge con il sinistro), 1 = piedi paralleli, 2 = sinistro dietro
  function ginga(phase = 0) {
    const b = standing();
    if (phase === 1) {
      b.foot("l", 0.02, -0.26, 15, 0).foot("r", 0.02, 0.26, -15, 0);
      b.set("pel", [-0.04, 0.8, 0]).set("chest", [0.12, 1.25, 0]).set("head", [0.22, 1.42, 0]);
      b.handRel("l", 0.3, -0.05, -0.2, "open").handRel("r", 0.3, -0.05, 0.2, "open");
      return b;
    }
    const back = phase === 0 ? "r" : "l";
    const front = phase === 0 ? "l" : "r";
    const ss = phase === 0 ? 1 : -1; // +1: il destro va dietro
    b.foot(front, 0.06, -ss * 0.26, ss * 15, 0).foot(back, -0.5, ss * 0.1, -ss * 20, 30);
    b.set("pel", [-0.18, 0.78, ss * 0.0]).set("hipYaw", -ss * 15).set("chestYaw", -ss * 25).set("chest", [-0.02, 1.22, 0]).set("head", [0.07, 1.4, -ss * 0.02]);
    // il braccio dalla parte del piede dietro protegge il viso
    b.handHead(back, 0.18, 0.0, -ss * 0.04, "open").handRel(front, 0.1, -0.35, -ss * 0.28, "open");
    b.elbow(back, [0, -1, ss * 0.5]);
    return b;
  }

  // A terra e condizionamento
  function lieBack(o = {}) {
    const b = standing();
    b.set("pel", [0, 0.12, 0]).set("chest", [-0.5, 0.13, 0]).set("head", [-0.72, 0.13, 0]).set("hipYaw", 0).set("chestYaw", 0);
    b.footAt("l", [0.86, 0.08, -0.12], 0, -80).footAt("r", [0.86, 0.08, 0.12], 0, -80);
    b.handW("l", -0.08, 0.05, -0.3, "open").handW("r", -0.08, 0.05, 0.3, "open");
    b.elbow("l", [0, 0.4, -1]).elbow("r", [0, 0.4, 1]);
    b.knee("l", [0, 1, 0]).knee("r", [0, 1, 0]);
    if (o.kneesUp) { b.footAt("l", [0.42, 0.08, -0.13], 0, 0).footAt("r", [0.42, 0.08, 0.13], 0, 0); }
    return b;
  }
  function lieFront() {
    const b = standing();
    b.set("pel", [0, 0.13, 0]).set("chest", [0.5, 0.15, 0]).set("head", [0.72, 0.18, 0]).set("hipYaw", 0).set("chestYaw", 0);
    b.footAt("l", [-0.86, 0.07, -0.12], 180, 0, 180).footAt("r", [-0.86, 0.07, 0.12], 180, 0, 180);
    b.handW("l", 0.62, 0.05, -0.3, "open").handW("r", 0.62, 0.05, 0.3, "open");
    b.knee("l", [0, -1, 0]).knee("r", [0, -1, 0]);
    b.elbow("l", [0, 0.2, -1]).elbow("r", [0, 0.2, 1]);
    return b;
  }
  function plank(o = {}) {
    // in appoggio sulle mani (o sugli avambracci) e sulle punte, corpo dritto
    const b = standing();
    const low = !!o.forearms;
    b.set("pel", [-0.3, low ? 0.27 : 0.36, 0]).set("chest", [0.18, low ? 0.36 : 0.58, 0]).set("head", [0.4, low ? 0.4 : 0.66, 0]).set("hipYaw", 0).set("chestYaw", 0);
    b.footAt("l", [low ? -1.12 : -1.1, ankleY(62), -0.1], 0, 62).footAt("r", [low ? -1.12 : -1.1, ankleY(62), 0.1], 0, 62);
    if (low) { b.handW("l", 0.42, 0.05, -0.1, "fist").handW("r", 0.42, 0.05, 0.1, "fist").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]); } else { b.handW("l", 0.2, 0.04, -0.2, "open").handW("r", 0.2, 0.04, 0.2, "open").elbow("l", [-1, 0, -0.3]).elbow("r", [-1, 0, 0.3]); }
    b.knee("l", [0, -1, 0]).knee("r", [0, -1, 0]);
    return b;
  }
  function pushDown() {
    return plank().set("pel", [-0.3, 0.2, 0]).set("chest", [0.18, 0.2, 0]).set("head", [0.4, 0.24, 0]).footAt("l", [-1.13, ankleY(62), -0.1], 0, 62).footAt("r", [-1.13, ankleY(62), 0.1], 0, 62).elbow("l", [-1, 0.4, -0.8]).elbow("r", [-1, 0.4, 0.8]);
  }
  function squat(depth = 1) {
    const b = standing();
    b.foot("l", 0, -0.17, 15, 0).foot("r", 0, 0.17, -15, 0);
    const y = 0.95 - 0.43 * depth;
    b.set("pel", [-0.12 * depth, y, 0]).set("chest", [0.06 * depth, y + 0.48, 0]).set("head", [0.12 * depth, y + 0.68, 0]);
    b.handRel("l", 0.42, 0.0, -0.12, "fist").handRel("r", 0.42, 0.0, 0.12, "fist");
    b.knee("l", [1, 0, -0.35]).knee("r", [1, 0, 0.35]);
    return b;
  }
  function sitLong() {
    const b = standing();
    b.set("pel", [0, 0.12, 0]).set("chest", [0.06, 0.62, 0]).set("head", [0.08, 0.82, 0]);
    b.footAt("l", [0.86, 0.07, -0.12], 0, -80).footAt("r", [0.86, 0.07, 0.12], 0, -80);
    b.handW("l", 0.02, 0.06, -0.28, "open").handW("r", 0.02, 0.06, 0.28, "open");
    b.knee("l", [0, 1, 0]).knee("r", [0, 1, 0]);
    return b;
  }
  function kneel() {
    // in ginocchio, seduto sui talloni
    const b = standing();
    b.set("pel", [-0.18, 0.36, 0]).set("chest", [-0.14, 0.86, 0]).set("head", [-0.12, 1.06, 0]);
    b.footAt("l", [-0.36, 0.07, -0.1], 180, -85).footAt("r", [-0.36, 0.07, 0.1], 180, -85);
    b.knee("l", [1, -0.4, 0]).knee("r", [1, -0.4, 0]);
    b.handW("l", 0.12, 0.42, -0.14, "open").handW("r", 0.12, 0.42, 0.14, "open");
    return b;
  }
  function allFours() {
    const b = standing();
    b.set("pel", [-0.3, 0.52, 0]).set("chest", [0.2, 0.58, 0]).set("head", [0.42, 0.62, 0]);
    b.footAt("l", [-0.72, 0.06, -0.12], 180, -80).footAt("r", [-0.72, 0.06, 0.12], 180, -80);
    b.knee("l", [1, -1, 0]).knee("r", [1, -1, 0]);
    b.handW("l", 0.22, 0.04, -0.18, "open").handW("r", 0.22, 0.04, 0.18, "open");
    return b;
  }
  function lunge(lead = "l", depth = 1) {
    const ss = lead === "l" ? 1 : -1;
    const back = lead === "l" ? "r" : "l";
    const b = standing();
    b.foot(lead, 0.42, -ss * 0.12, 0, 0).foot(back, -0.48, ss * 0.12, 0, 55);
    const y = 0.95 - 0.38 * depth;
    b.set("pel", [-0.02, y, 0]).set("chest", [0.0, y + 0.5, 0]).set("head", [0.02, y + 0.7, 0]);
    b.knee(back, [0.3, -1, 0]);
    b.handRel("l", 0.05, -0.45, -0.22, "open").handRel("r", 0.05, -0.45, 0.22, "open");
    return b;
  }

  /* ------------------------------------------------------------ registro */
  const MOVES = new Map();
  // frames: array di { p (B o posa), t, h, act }
  function mv(name, label, frames, extra = {}) {
    if (MOVES.has(name)) throw new Error(`movimento doppio: ${name}`);
    if (!/^[a-z]+\.[A-Za-z0-9]+$/.test(name)) throw new Error(`nome non valido: ${name}`);
    const fr = frames.map((f) => {
      const pose = f.p instanceof B ? f.p.done() : clone(f.p);
      if (f.act) pose.act = f.act;
      return { pose, t: f.t == null ? 380 : f.t, h: f.h == null ? 220 : f.h, act: pose.act || null, partner: f.partner ? (f.partner instanceof B ? f.partner.done() : clone(f.partner)) : null };
    });
    MOVES.set(name, { name, label, frames: fr, props: extra.props || null, style: name.split(".")[0] });
  }
  // fotogramma: posa, ms per arrivarci, ms di sosta, parti che lavorano, compagno (facoltativo)
  const K = (p, t, h, act, partner) => ({ p, t, h, act, partner });
  // un compagno davanti, rivolto verso di te (per prese, proiezioni e lavoro a coppie)
  function facing(b, dist = 0.95) { return b.copy().spin(180).move(dist); }
  const BAG = { k: "bag", x: 0.86, z: 0, r: 0.18, y0: 0.55, y1: 1.65 };

  const lib = {
    B, mv, K, F, add, sub, mul, norm, len, dot, clone, ankleY, ARM, LEG, HEIGHT,
    facing, BAG, standing, ready, boxStance, boxGuard, box, thai, tkd, kumite, zenkutsu, kiba, kokutsu, neko, wcStance, wcGuard, wrestle, sambo, natural, ginga,
    lieBack, lieFront, plank, pushDown, squat, sitLong, kneel, allFours, lunge
  };

  // I file degli stili aggiungono i loro movimenti con add("stile", function (L) { ... }).
  // Le pose di uno stile si costruiscono solo la prima volta che servono (all'avvio non si calcola niente).
  const PENDING = new Map();
  function addStyle(key, fn) {
    if (typeof key === "function") { fn = key; key = "*"; }
    if (!PENDING.has(key)) PENDING.set(key, []);
    PENDING.get(key).push(fn);
  }
  function runStyle(key) {
    const list = PENDING.get(key);
    if (!list) return;
    PENDING.delete(key);
    list.forEach((fn) => {
      try { fn(lib); } catch (err) { if (typeof console !== "undefined") console.error(`Movimenti "${key}":`, err); }
    });
  }
  function ensure(key) {
    runStyle("*");
    runStyle("gen");
    if (key) runStyle(key); else [...PENDING.keys()].forEach(runStyle);
  }
  const styleOf = (name) => String(name).split(".")[0];

  /* ------------------------------------------------------------ API */
  function get(name) { ensure(styleOf(name)); return MOVES.get(name) || null; }
  function has(name) { ensure(styleOf(name)); return MOVES.has(name); }
  function names() { ensure(null); return [...MOVES.keys()]; }
  function catalog() { return names().map((n) => ({ name: n, label: MOVES.get(n).label, frames: MOVES.get(n).frames.length })); }

  // Una dimostrazione da una lista di passi: [[didascalia, "mossa", "mossa*2", ...], ...]
  // Sposta una posa (e il suo punto di partenza) di dx, dz sul pavimento.
  function moved(pose, dx, dz) {
    if (!pose || (!dx && !dz)) return pose;
    const q = clone(pose);
    const tr = (v) => (Array.isArray(v) ? [v[0] + dx, v[1], v[2] + dz] : v);
    ["pel", "chest", "head"].forEach((k) => { q[k] = tr(q[k]); });
    ["hand", "foot"].forEach((k) => { if (q[k]) Object.keys(q[k]).forEach((s) => { q[k][s] = tr(q[k][s]); }); });
    q.o = [(q.o || [0, 0])[0] + dx, (q.o || [0, 0])[1] + dz];
    return q;
  }

  function demoFor(steps) {
    const out = { steps: [], props: null };
    (steps || []).forEach((st) => {
      if (!Array.isArray(st) || typeof st[0] !== "string") return;
      const frames = [];
      // dentro un passo, una mossa riparte da dove e' finita la precedente (passi avanti, uscite...)
      let at = null;
      st.slice(1).forEach((spec) => {
        if (spec === "@bag") { out.props = [Object.assign({}, BAG)]; return; }
        const m = /^([a-z]+\.[A-Za-z0-9]+)(?:\*(\d))?$/.exec(String(spec));
        if (!m) return;
        const one = get(m[1]);
        if (!one) return;
        const times = m[2] ? Number(m[2]) : 1;
        const o0 = one.frames[0].pose.o || [0, 0];
        const o1 = one.frames[one.frames.length - 1].pose.o || [0, 0];
        for (let i = 0; i < times; i += 1) {
          let dx = 0;
          let dz = 0;
          if (at && Math.hypot(at[0] - o0[0], at[1] - o0[1]) > 0.005) { dx = at[0] - o0[0]; dz = at[1] - o0[1]; }
          one.frames.forEach((f) => frames.push({ pose: moved(f.pose, dx, dz), t: f.t, h: f.h, act: f.act, partner: moved(f.partner, dx, dz), rep: i, mv: m[1] }));
          at = [o1[0] + dx, o1[1] + dz];
        }
        if (one.props) out.props = one.props;
      });
      if (frames.length) out.steps.push({ label: st[0], frames });
    });
    return out;
  }

  // Firma di una posa (arrotondata) per riconoscere i fotogrammi uguali.
  function sig(f) {
    // gli angoli contano a meno di giri interi (un calcio girato di 360 gradi torna alla stessa posa)
    const ang = (a) => Math.round((((a % 360) + 540) % 360) - 180);
    const r = (v, k) => {
      if (/Yaw$|Roll$/.test(k || "") && typeof v === "number") return ang(v);
      if (/Yaw$|Roll$/.test(k || "") && v && typeof v === "object") return Object.keys(v).sort().map((x) => [x, ang(v[x])]);
      return Array.isArray(v) ? v.map((x) => r(x)) : typeof v === "number" ? Math.round(v * 50) : v && typeof v === "object" ? Object.keys(v).sort().map((x) => [x, r(v[x], x)]) : v;
    };
    return JSON.stringify([r(f.pose), f.partner ? r(f.partner) : 0]);
  }

  // Le immagini della sequenza di un passo: i fotogrammi diversi tra loro, senza le ripetizioni
  // ("mossa*3" conta una volta) e senza i ritorni alla posa gia' vista. Al massimo "max".
  function keyFrames(frames, max = 6) {
    const seen = new Set();
    const out = [];
    (frames || []).forEach((f, i) => {
      if (f.rep) return;
      const s = sig(f);
      if (seen.has(s)) return;
      seen.add(s);
      out.push(i);
    });
    if (out.length <= max) return out;
    // troppi: tiene il primo e poi i fotogrammi in azione (le tecniche); i passaggi solo se avanza posto
    const pick = (list, n) => (list.length <= n ? list : Array.from({ length: n }, (_, k) => list[Math.round((k * (list.length - 1)) / Math.max(1, n - 1))]));
    const rest = out.slice(1);
    const acting = rest.filter((i) => frames[i].act && frames[i].act.length);
    const still = rest.filter((i) => !(frames[i].act && frames[i].act.length));
    const keep = new Set([out[0], ...pick(acting, max - 1)]);
    if (keep.size < max) pick(still, max - keep.size).forEach((i) => keep.add(i));
    return [...keep].sort((a, b) => a - b);
  }

  return { add: addStyle, get, has, names, catalog, demoFor, keyFrames, sig, lib, B };
});
