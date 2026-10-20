/*
 * Progetto A - Difesa: movimenti del sambo (prefisso "sambo.").
 * Stoika destra di base (piede destro avanti, mani aperte pronte a prendere la giacca).
 * Le tecniche a coppie hanno il compagno (o il manichino) in tutti i fotogrammi.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { mv, K, B, F, standing, sambo, squat, lieBack, sitLong, kneel, facing, add, sub, mul, norm, len, dot, ankleY } = L;
    const DEG = Math.PI / 180;
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

    /* ------------------------------------------------------------ aiuti */
    // yaw e roll per avere il busto lungo "axis" con il petto rivolto verso "fwd"
    function orient(axis, fwd, hint) {
      const a = norm(axis);
      const f = norm(sub(fwd, mul(a, dot(fwd, a))));
      const r = norm(cross(f, a));
      if (Math.abs(a[1]) > 0.97) {
        let y = Math.atan2(r[0], r[2]) / DEG;
        if (hint != null) while (y - hint > 180) y -= 360;
        if (hint != null) while (hint - y > 180) y += 360;
        return { yaw: y, roll: 0 };
      }
      const cands = [];
      const y0 = Math.atan2(-a[2], a[0]) / DEG;
      [y0, y0 + 180].forEach((y) => {
        const r0 = [Math.sin(y * DEG), 0, Math.cos(y * DEG)];
        const roll = Math.atan2(dot(cross(r0, r), a), dot(r0, r)) / DEG;
        let yy = y;
        if (hint != null) { while (yy - hint > 180) yy -= 360; while (hint - yy > 180) yy += 360; }
        cands.push({ yaw: yy, roll });
      });
      if (hint == null) return Math.abs(cands[0].roll) <= Math.abs(cands[1].roll) ? cands[0] : cands[1];
      return Math.abs(cands[0].yaw - hint) + Math.abs(cands[0].roll) * 0.5 <= Math.abs(cands[1].yaw - hint) + Math.abs(cands[1].roll) * 0.5 ? cands[0] : cands[1];
    }
    // posa libera in coordinate del mondo (per terra, cadute, compagno in volo)
    function P(o) {
      const b = standing();
      const p = b.p;
      p.o = [0, 0];
      p.pel = o.pel.slice();
      p.chest = o.chest.slice();
      const ax = sub(p.chest, p.pel);
      p.head = o.head ? o.head.slice() : add(p.chest, mul(norm(ax), 0.2));
      if (o.face) { const q = orient(ax, o.face, o.yaw); p.hipYaw = q.yaw; p.chestYaw = q.yaw; p.hipRoll = q.roll; p.chestRoll = q.roll; } else { p.hipYaw = o.yaw || 0; p.chestYaw = o.yaw || 0; p.hipRoll = o.roll || 0; p.chestRoll = o.roll || 0; }
      if (o.hipFace) { const q = orient(ax, o.hipFace, p.hipYaw); p.hipYaw = q.yaw; p.hipRoll = q.roll; }
      if (o.twist) p.chestYaw += o.twist;
      if (o.look) p.headYaw = o.look;
      ["l", "r"].forEach((s) => {
        const f = o["f" + s];
        if (f) b.footW(s, f[0], f[1] == null ? p.hipYaw : f[1], f[2] || 0, f[3] || 0);
        const h = o["h" + s];
        if (h) b.hand(s, h[0], h[1] || "open");
        if (o["k" + s]) b.knee(s, o["k" + s]);
        if (o["e" + s]) b.elbow(s, o["e" + s]);
      });
      return b;
    }
    // ruota tutta la posa attorno all'origine del mondo e la sposta
    function xf(b, th, x = 0, z = 0) {
      const c = b.copy();
      const o = c.p.o;
      c.p.o = [0, 0];
      c.spin(th);
      const cs = Math.cos(th * DEG);
      const sn = Math.sin(th * DEG);
      c.p.o = [o[0] * cs + o[1] * sn, -o[0] * sn + o[1] * cs];
      c.move(x, z);
      return c;
    }
    const skel = (b) => F.solve(b instanceof B ? b.p : b);
    // punti di presa sul compagno
    function sleeveOf(pb, side = "r") { const s = skel(pb); return lerp3(s.elbow[side], s.hand[side], 0.3); }
    function lapelOf(pb, side = "l") { const s = skel(pb); const fr = s.chF; const sg = side === "l" ? -1 : 1; return add(add(add(s.chest, mul(fr.fwd, 0.12)), mul(fr.right, sg * 0.07)), mul(fr.up, -0.12)); }
    function collarOf(pb) { const s = skel(pb); const fr = s.chF; return add(add(s.chest, mul(fr.fwd, -0.09)), mul(fr.up, 0.06)); }
    function beltOf(pb) { const s = skel(pb); const fr = s.hipF; return add(add(add(s.pel, mul(fr.fwd, -0.13)), mul(fr.up, 0.08)), mul(fr.right, -0.04)); }
    function armpitOf(pb, side = "r") { const s = skel(pb); const fr = s.chF; const sg = side === "l" ? -1 : 1; return add(add(s.chest, mul(fr.right, sg * 0.14)), mul(fr.up, -0.12)); }
    // prese: { l: "sleeve" | "lapel" | ..., r: ... } (punti sul compagno pb)
    function grab(me, pb, which) {
      Object.keys(which).forEach((s) => {
        const w = which[s];
        if (!w) return;
        let pt;
        if (Array.isArray(w)) pt = w;
        else if (w === "sleeve") pt = sleeveOf(pb, s === "l" ? "r" : "l");
        else if (w === "lapel") pt = lapelOf(pb, s === "r" ? "l" : "r");
        else if (w === "collar") pt = collarOf(pb);
        else if (w === "belt") pt = beltOf(pb);
        else if (w === "armpit") pt = armpitOf(pb, s);
        me.hand(s, pt, "fist");
      });
      return me;
    }
    const D = 0.74; // distanza di presa (bacino-bacino)

    /* ------------------------------------------------------------ posizioni */
    const g = sambo().mirror(); // stoika destra
    const gL = sambo(); // stoika sinistra
    const gF = (() => {
      const b = standing();
      b.foot("l", 0.02, -0.22, 12, 4).foot("r", 0.02, 0.22, -12, 4);
      b.set("pel", [-0.03, 0.84, 0]).set("chest", [0.06, 1.32, 0]).set("head", [0.11, 1.51, 0]);
      b.knee("l", [1, 0, -0.25]).knee("r", [1, 0, 0.25]);
      return b.guard("open");
    })();
    const P0 = facing(g, D); // compagno in stoika destra davanti a te

    // mani avanti in stoika con prese su un compagno
    const gripBase = (pb, which = { l: "sleeve", r: "lapel" }, me = g.copy()) => grab(me, pb, which).elbow("l", [0.1, -1, -0.4]).elbow("r", [0.1, -1, 0.4]);

    /* ------------------------------------------------------------ stoika e spostamenti */
    mv("sambo.stance", "Stoika destra: piede destro avanti, ginocchia piegate, mani aperte avanti", [K(standing(), 300, 300), K(g, 500, 900, ["legl", "legr", "arml", "armr"])]);
    mv("sambo.stanceHold", "Stoika destra ferma, peso sugli avampiedi", [K(g, 400, 1200)]);
    const fwd1 = g.copy().step("r", 0.2).shift(0.09);
    const fwd2 = g.copy().move(0.2);
    const back1 = fwd2.copy().step("l", -0.2).shift(-0.09);
    mv("sambo.stepFwdBack", "Passo scivolato avanti (parte il piede davanti) e indietro (parte quello dietro)", [K(g, 300, 150), K(fwd1.copy().act("legr"), 240, 80), K(fwd2.copy().act("legl"), 220, 300), K(back1.copy().act("legl"), 240, 80), K(g.copy().act("legr"), 220, 300)]);
    const rgt1 = g.copy().step("r", 0, 0.2).shift(0, 0.09);
    const rgt2 = g.copy().move(0, 0.2);
    const lft1 = rgt2.copy().step("l", 0, -0.2).shift(0, -0.09);
    mv("sambo.stepSide", "Passo laterale: si muove prima il piede dal lato in cui vai, i piedi non si incrociano", [K(g, 300, 150), K(rgt1.copy().act("legr"), 240, 80), K(rgt2.copy().act("legl"), 220, 300), K(lft1.copy().act("legl"), 240, 80), K(g.copy().act("legr"), 220, 300)]);
    mv("sambo.shuffle4", "Passi scivolati in stoika: avanti, a destra, indietro, a sinistra", [
      K(g, 300, 100), K(fwd1, 220, 40), K(fwd2, 200, 100),
      K(fwd2.copy().step("r", 0, 0.2).shift(0, 0.09), 220, 40), K(g.copy().move(0.2, 0.2), 200, 100),
      K(g.copy().move(0.2, 0.2).step("l", -0.2).shift(-0.09), 220, 40), K(g.copy().move(0, 0.2), 200, 100),
      K(g.copy().move(0, 0.2).step("l", 0, -0.2).shift(0, -0.09), 220, 40), K(g, 200, 250)
    ]);
    // cambio di stoika: destra -> frontale -> sinistra -> frontale -> destra (mezzi passi, senza alzarsi)
    const gFm = gF.copy().move(0.0);
    mv("sambo.switchStance", "Cambio di stoika: da destra a frontale a sinistra con mezzi passi, senza alzarti", [K(g, 300, 250), K(gFm.copy().act("legr", "legl"), 320, 350), K(gL.copy().act("legl", "legr"), 320, 450), K(gFm.copy().act("legl", "legr"), 320, 350), K(g.copy().act("legr", "legl"), 320, 300)]);
    // presa nell'aria (shadow): manica, bavero, tirata e mezzo passo indietro
    const airSleeve = g.copy().step("r", 0.12).shift(0.06).handRel("l", 0.5, -0.12, -0.12, "fist").elbow("l", [0, -1, -0.3]);
    const airBoth = airSleeve.copy().handRel("r", 0.48, -0.1, 0.02, "fist").elbow("r", [0, -1, 0.3]);
    const airPull = g.copy().move(-0.1).turn(-12).handRel("l", 0.16, -0.32, -0.26, "fist").handRel("r", 0.44, 0.04, 0.0, "fist").elbow("l", [-0.6, -0.4, -0.7]).elbow("r", [0, -1, 0.3]);
    mv("sambo.airGrip", "Presa nell'aria: manica, poi bavero, tirata verso il fianco e mezzo passo indietro", [K(g, 300, 120), K(airSleeve.copy().act("arml", "legr"), 220, 100), K(airBoth.copy().act("armr"), 200, 120), K(airPull.copy().act("arml", "armr", "legl"), 260, 300), K(g, 280, 250)]);

    /* ------------------------------------------------------------ prese sul compagno */
    const meSleeve = gripBase(P0, { l: "sleeve" });
    meSleeve.handRel("r", 0.3, -0.12, 0.08, "open");
    const meBoth = gripBase(P0);
    // tirata: la manica verso il fianco sinistro, il bavero in alto e avanti; il compagno va sulle punte
    const Ptoes = P0.copy().heel("l", 25).heel("r", 25).shift(-0.06).lean(-0.06, 0, -0.02).sink(-0.03);
    const mePull = gripBase(Ptoes, { l: "sleeve", r: "lapel" }, g.copy().move(-0.06).turn(-10));
    mePull.hand("l", mePull.rel(0.2, -0.36, -0.24), "fist").elbow("l", [-0.5, -0.3, -0.8]);
    // il compagno segue la mano sinistra (il suo braccio destro viene tirato)
    const PtoesArm = Ptoes.copy().hand("r", add(mePull.p.hand.l, [0.1, -0.02, 0.02]), "open").elbow("r", [0, -1, 0]);
    mv("sambo.squareUp", "In stoika destra davanti al compagno, a un braccio di distanza", [K(g, 300, 300, null, P0), K(g.copy().act("legl", "legr"), 400, 900, null, P0)]);
    mv("sambo.gripSleeve", "Mano sinistra sulla manica all'altezza del gomito, dita a uncino", [K(g, 300, 200, null, P0), K(meSleeve.copy().act("arml"), 280, 900, null, P0), K(g, 300, 250, null, P0)]);
    mv("sambo.gripLapel", "Mano destra sul bavero a metà petto, nocche in alto, polso dritto", [K(meSleeve, 300, 200, null, P0), K(meBoth.copy().act("armr"), 280, 900, null, P0), K(meSleeve, 300, 250, null, P0)]);
    mv("sambo.gripPull", "Tirata: la manica verso il fianco sinistro, il bavero spinge in alto e avanti", [K(meBoth, 300, 250, null, P0), K(mePull.copy().act("arml", "armr", "torso"), 380, 1600, null, PtoesArm), K(meBoth, 380, 200, null, P0), K(g, 300, 250, null, P0)]);
    mv("sambo.gripTake", "Prendi manica e bavero, tira, lascia e torna in stoika", [K(g, 300, 150, null, P0), K(meSleeve.copy().act("arml"), 230, 80, null, P0), K(meBoth.copy().act("armr"), 220, 150, null, P0), K(mePull.copy().act("arml", "armr"), 300, 500, null, PtoesArm), K(g, 320, 300, null, P0)]);
    // dall'altro lato: stoika sinistra, mani scambiate
    mv("sambo.gripTakeL", "Presa dall'altro lato: stoika sinistra, la destra sulla manica, la sinistra sul bavero", [K(g.copy().mirror(), 300, 150, null, P0.copy().mirror()), K(meSleeve.copy().mirror().act("armr"), 230, 80, null, P0.copy().mirror()), K(meBoth.copy().mirror().act("arml"), 220, 150, null, P0.copy().mirror()), K(mePull.copy().mirror().act("arml", "armr"), 300, 500, null, PtoesArm.copy().mirror()), K(g.copy().mirror(), 320, 300, null, P0.copy().mirror())]);

    // presa in movimento: giri attorno al compagno tenendo la stessa distanza (la coppia ruota)
    const ctr = D / 2;
    const rotPair = (b, th) => xf(xf(b, 0, -ctr, 0), th, ctr, 0);
    const circ = [];
    [0, -20, -40].forEach((th, i) => {
      const me = rotPair(meBoth, th);
      const pp = rotPair(P0, th);
      const me2 = gripBase(pp, { l: "sleeve", r: "lapel" }, rotPair(g, th).step("l", 0, 0));
      circ.push([me2, pp, i]);
    });
    const meStepA = gripBase(rotPair(P0, -10), { l: "sleeve", r: "lapel" }, rotPair(g, -10).step("l", 0.04, -0.12).shift(0, -0.05));
    const pullC = (th) => { const pp = rotPair(Ptoes, th); const me = rotPair(g.copy().move(-0.06).turn(-10), th); gripBase(pp, { l: "sleeve", r: "lapel" }, me); me.hand("l", me.rel(0.2, -0.36, -0.24), "fist").elbow("l", [-0.5, -0.3, -0.8]); return [me, pp.hand("r", add(me.p.hand.l, [0.1, -0.02, 0.02]), "open")]; };
    const pc = pullC(-40);
    mv("sambo.gripCircle", "Con la presa giri attorno al compagno a passi scivolati, poi tiri la manica", [
      K(circ[0][0], 300, 150, null, circ[0][1]),
      K(meStepA.copy().act("legl"), 300, 60, null, rotPair(P0, -10)),
      K(circ[1][0].copy().act("legr"), 280, 100, null, circ[1][1]),
      K(gripBase(rotPair(P0, -30), { l: "sleeve", r: "lapel" }, rotPair(g, -30).step("l", 0.04, -0.12).shift(0, -0.05)).act("legl"), 300, 60, null, rotPair(P0, -30)),
      K(circ[2][0].copy().act("legr"), 280, 120, null, circ[2][1]),
      K(pc[0].copy().act("arml"), 280, 400, null, pc[1]),
      K(circ[2][0], 300, 300, null, circ[2][1])
    ]);
    // lascia, due passi indietro, rientra e riprendi
    mv("sambo.gripReentry", "Lascia la presa, due passi indietro, rientra e riprendi manica e bavero", [
      K(meBoth, 300, 150, null, P0), K(g.copy().move(-0.1).step("l", -0.12).act("legl"), 260, 60, null, P0), K(g.copy().move(-0.32).act("legr", "legl"), 260, 200, null, P0),
      K(g.copy().move(-0.12).step("r", 0.12).shift(0.06).act("legr"), 220, 40, null, P0), K(meSleeve.copy().act("arml", "legl"), 180, 40, null, P0), K(meBoth.copy().act("armr"), 160, 400, null, P0)
    ]);
    // presa alta sul collo, dietro la nuca (manica prima)
    const meHigh = gripBase(P0, { l: "sleeve", r: "collar" }, g.copy().shift(0.05));
    meHigh.elbow("r", [0.2, -0.2, 1]);
    mv("sambo.gripHigh", "Manica prima, poi presa alta sul collo dietro la nuca", [K(g, 300, 150, null, P0), K(meSleeve.copy().act("arml"), 230, 120, null, P0), K(meHigh.copy().act("armr"), 260, 800, null, P0), K(g, 320, 250, null, P0)]);
    // rottura della presa sulla propria giacca: la sinistra prende il bavero destro, la destra strappa il polso
    const brk0 = g.copy().handRel("l", 0.13, -0.1, 0.09, "fist").elbow("l", [0, -1, -0.3]);
    const brk1 = brk0.copy().handRel("r", 0.2, -0.13, 0.04, "fist").elbow("r", [0, -1, 0.3]);
    const brk2 = g.copy().step("r", -0.32, 0.02).fyaw("r", 40).shift(-0.14).turn(-40).handRel("l", 0.24, -0.5, -0.06, "open").handRel("r", 0.26, -0.48, 0.02, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.4]);
    mv("sambo.gripBreak", "Rottura: la destra strappa il polso in basso verso il pollice, passo indietro e spalla indietro", [K(g, 300, 150), K(brk0.copy().act("arml"), 280, 200), K(brk1.copy().act("armr"), 240, 200), K(brk2.copy().act("armr", "arml", "legr", "torso"), 220, 450), K(g, 340, 250)]);
    mv("sambo.gripBreakL", "Rottura dall'altro lato: la sinistra strappa il polso destro", [K(g.copy().mirror(), 300, 150), K(brk0.copy().mirror().act("armr"), 280, 200), K(brk1.copy().mirror().act("arml"), 240, 200), K(brk2.copy().mirror().act("arml", "armr", "legl", "torso"), 220, 450), K(g.copy().mirror(), 340, 250)]);
    // rottura sulla propria giacca, passo avanti e presa sulla giacca appesa (compagno a un passo)
    const Pfar = facing(g, D + 0.3);
    const brkFar = (b) => b.copy();
    mv("sambo.breakAndGrip", "Rottura, passo avanti e presa su manica e bavero in meno di due secondi", [
      K(brk0, 300, 150, null, Pfar), K(brk1.copy().act("armr"), 200, 80, null, Pfar), K(brk2.copy().act("armr", "legr"), 200, 120, null, Pfar),
      K(g.copy().move(0.1).act("legr"), 220, 40, null, Pfar), K(gripBase(Pfar, { l: "sleeve" }, g.copy().move(0.3)).handRel("r", 0.3, -0.12, 0.08, "open").act("arml", "legr"), 200, 40, null, Pfar),
      K(gripBase(Pfar, { l: "sleeve", r: "lapel" }, g.copy().move(0.3)).act("armr"), 180, 500, null, Pfar)
    ]);
    void brkFar; void len; void ankleY; void squat; void lieBack; void sitLong; void kneel; void lerp3; void xf;
  });
})(typeof window !== "undefined" ? window : globalThis);
