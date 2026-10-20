/*
 * Progetto A - Difesa: movimenti del sambo (prefisso "sambo.").
 * Stoika destra di base (piede destro avanti, mani aperte pronte a prendere la giacca).
 * Le tecniche a coppie hanno il compagno (o il manichino) in tutti i fotogrammi.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add("sambo", function (L) {
    const { mv, K, B, F, standing, sambo, squat, sitLong, facing, add, sub, mul, norm, len, dot, ankleY } = L;
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
    // orientamento del piede: punta verso "dir", pianta verso "down" -> [yaw, pitch, roll]
    function footOr(dir, down, hint = 0) {
      const d = norm(dir);
      const pitch = -Math.asin(Math.max(-1, Math.min(1, d[1]))) / DEG;
      let yaw;
      if (Math.abs(d[1]) > 0.985) {
        const dn = norm(down);
        // con la punta in verticale lo yaw decide dove guarda la pianta
        const s = Math.sin(pitch * DEG);
        yaw = Math.atan2(dn[2] / s, -dn[0] / s) / DEG; // hz = -down/sin(p) -> [cos y, 0, -sin y]
        while (yaw - hint > 180) yaw -= 360;
        while (hint - yaw > 180) yaw += 360;
        return [yaw, pitch, 0];
      }
      yaw = Math.atan2(-d[2], d[0]) / DEG;
      while (yaw - hint > 180) yaw -= 360;
      while (hint - yaw > 180) yaw += 360;
      const hz = [Math.cos(yaw * DEG), 0, -Math.sin(yaw * DEG)];
      const pr = pitch * DEG;
      const base = mul(add([0, Math.cos(pr), 0], mul(hz, Math.sin(pr))), -1);
      const dn = norm(sub(down, mul(d, dot(down, d))));
      const roll = Math.atan2(dot(cross(base, dn), d), dot(base, dn)) / DEG;
      return [yaw, pitch, roll];
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
        if (f && f[1] && typeof f[1] === "object") { const q = footOr(f[1].dir, f[1].down, f[1].hint || 0); b.footW(s, f[0], q[0], q[1], q[2]); } else if (f) b.footW(s, f[0], f[1] == null ? p.hipYaw : f[1], f[2] || 0, f[3] || 0);
        const h = o["h" + s];
        if (h) b.hand(s, h[0], h[1] || "open");
        if (o["k" + s]) b.knee(s, o["k" + s]);
        if (o["e" + s]) b.elbow(s, o["e" + s]);
      });
      return reachFix(b);
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
    // mano un po' oltre la portata (fino al 15%): la avvicina alla spalla, cosi' il braccio arriva
    function reachFix(b) {
      const sk = F.solve(b.p);
      ["l", "r"].forEach((s) => {
        const h = b.p.hand[s];
        if (!h) return;
        const v = sub(h, sk.sh[s]);
        const d = len(v);
        if (d > 0.565 && d < 0.565 * 1.15) b.p.hand[s] = add(sk.sh[s], mul(v, 0.565 / d));
      });
      return b;
    }
    // punti di presa sul compagno
    function sleeveOf(pb, side = "r") { const s = skel(pb); return lerp3(s.elbow[side], s.hand[side], 0.3); }
    function lapelOf(pb, side = "l") { const s = skel(pb); const fr = s.chF; const sg = side === "l" ? -1 : 1; return add(add(add(s.chest, mul(fr.fwd, 0.12)), mul(fr.right, sg * 0.07)), mul(fr.up, -0.12)); }
    function collarOf(pb) { const s = skel(pb); const fr = s.chF; return add(add(s.chest, mul(fr.fwd, -0.09)), mul(fr.up, 0.06)); }
    function beltOf(pb) { const s = skel(pb); const fr = s.hipF; return add(add(add(s.pel, mul(fr.fwd, -0.13)), mul(fr.up, 0.08)), mul(fr.right, -0.04)); }
    function cuffOf(pb, side = "r") { const s = skel(pb); return lerp3(s.elbow[side], s.hand[side], 0.75); }
    function shoulderOf(pb, side = "r") { const s = skel(pb); const fr = s.chF; const sg = side === "l" ? -1 : 1; return add(add(add(s.chest, mul(fr.right, sg * 0.13)), mul(fr.fwd, 0.1)), mul(fr.up, 0.02)); }
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
        else if (w === "cuff") pt = cuffOf(pb, s === "l" ? "r" : "l");
        else if (w === "shoulderR") pt = shoulderOf(pb, "r");
        else if (w === "shoulderL") pt = shoulderOf(pb, "l");
        me.hand(s, pt, "fist");
      });
      return reachFix(me);
    }
    const D = 0.74; // distanza di presa (bacino-bacino)
    // le scene a coppie si girano di PY gradi: nella vista 3/4 la coppia si vede quasi di profilo
    const PY = -30;
    const mvP = (name, label, frames, extra) => mv(name, label, frames.map((f) => Object.assign({}, f, { p: xf(f.p, PY), partner: f.partner ? xf(f.partner, PY) : f.partner })), extra);
    // le scene a terra sul manichino si girano in piu' di GY gradi (te e lui ben visibili)
    const GY = 60;
    const mvG = (name, label, frames, extra) => mvP(name, label, frames.map((f) => Object.assign({}, f, { p: xf(f.p, GY), partner: f.partner ? xf(f.partner, GY) : f.partner })), extra);
    const GA = 120; // la leva al gomito si legge meglio cosi'
    const mvA = (name, label, frames, extra) => mvP(name, label, frames.map((f) => Object.assign({}, f, { p: xf(f.p, GA), partner: f.partner ? xf(f.partner, GA) : f.partner })), extra);

    /* ------------------------------------------------------------ posizioni */
    // stoika destra: mani aperte avanti all'altezza del petto, gomiti bassi
    const g = (() => { const b = sambo().mirror(); b.handRel("r", 0.4, -0.1, 0.1, "open").handRel("l", 0.36, -0.13, -0.17, "open"); b.elbow("l", [0, -1, -0.45]).elbow("r", [0, -1, 0.45]); return b; })();
    const gL = g.copy().mirror(); // stoika sinistra
    // compagno passivo: stoika destra, mani basse in avanti
    const gP = g.copy().handRel("l", 0.3, -0.3, -0.17, "open").handRel("r", 0.32, -0.28, 0.15, "open");
    const gF = (() => {
      const b = standing();
      b.foot("l", 0.02, -0.22, 12, 4).foot("r", 0.02, 0.22, -12, 4);
      b.set("pel", [-0.03, 0.84, 0]).set("chest", [0.06, 1.32, 0]).set("head", [0.11, 1.51, 0]);
      b.knee("l", [1, 0, -0.25]).knee("r", [1, 0, 0.25]);
      return b.guard("open");
    })();
    const P0 = facing(gP, D); // compagno in stoika destra davanti a te

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
    mvP("sambo.squareUp", "In stoika destra davanti al compagno, a un braccio di distanza", [K(g, 300, 300, null, P0), K(g.copy().act("legl", "legr"), 400, 900, null, P0)]);
    mvP("sambo.gripSleeve", "Mano sinistra sulla manica all'altezza del gomito, dita a uncino", [K(g, 300, 200, null, P0), K(meSleeve.copy().act("arml"), 280, 900, null, P0), K(g, 300, 250, null, P0)]);
    mvP("sambo.gripLapel", "Mano destra sul bavero a metà petto, nocche in alto, polso dritto", [K(meSleeve, 300, 200, null, P0), K(meBoth.copy().act("armr"), 280, 900, null, P0), K(meSleeve, 300, 250, null, P0)]);
    mvP("sambo.gripPull", "Tirata: la manica verso il fianco sinistro, il bavero spinge in alto e avanti", [K(meBoth, 300, 250, null, P0), K(mePull.copy().act("arml", "armr", "torso"), 380, 1600, null, PtoesArm), K(meBoth, 380, 200, null, P0), K(g, 300, 250, null, P0)]);
    mvP("sambo.gripTake", "Prendi manica e bavero, tira, lascia e torna in stoika", [K(g, 300, 150, null, P0), K(meSleeve.copy().act("arml"), 230, 80, null, P0), K(meBoth.copy().act("armr"), 220, 150, null, P0), K(mePull.copy().act("arml", "armr"), 300, 500, null, PtoesArm), K(g, 320, 300, null, P0)]);
    // dall'altro lato: stoika sinistra, mani scambiate
    mvP("sambo.gripTakeL", "Presa dall'altro lato: stoika sinistra, la destra sulla manica, la sinistra sul bavero", [K(g.copy().mirror(), 300, 150, null, P0.copy().mirror()), K(meSleeve.copy().mirror().act("armr"), 230, 80, null, P0.copy().mirror()), K(meBoth.copy().mirror().act("arml"), 220, 150, null, P0.copy().mirror()), K(mePull.copy().mirror().act("arml", "armr"), 300, 500, null, PtoesArm.copy().mirror()), K(g.copy().mirror(), 320, 300, null, P0.copy().mirror())]);

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
    mvP("sambo.gripCircle", "Con la presa giri attorno al compagno a passi scivolati, poi tiri la manica", [
      K(circ[0][0], 300, 150, null, circ[0][1]),
      K(meStepA.copy().act("legl"), 300, 60, null, rotPair(P0, -10)),
      K(circ[1][0].copy().act("legr"), 280, 100, null, circ[1][1]),
      K(gripBase(rotPair(P0, -30), { l: "sleeve", r: "lapel" }, rotPair(g, -30).step("l", 0.04, -0.12).shift(0, -0.05)).act("legl"), 300, 60, null, rotPair(P0, -30)),
      K(circ[2][0].copy().act("legr"), 280, 120, null, circ[2][1]),
      K(pc[0].copy().act("arml"), 280, 400, null, pc[1]),
      K(circ[2][0], 300, 300, null, circ[2][1])
    ]);
    // lascia, due passi indietro, rientra e riprendi
    mvP("sambo.gripReentry", "Lascia la presa, due passi indietro, rientra e riprendi manica e bavero", [
      K(meBoth, 300, 150, null, P0), K(g.copy().move(-0.1).step("l", -0.12).act("legl"), 260, 60, null, P0), K(g.copy().move(-0.32).act("legr", "legl"), 260, 200, null, P0),
      K(g.copy().move(-0.12).step("r", 0.12).shift(0.06).act("legr"), 220, 40, null, P0), K(meSleeve.copy().act("arml", "legl"), 180, 40, null, P0), K(meBoth.copy().act("armr"), 160, 400, null, P0)
    ]);
    // presa alta sul collo, dietro la nuca (manica prima)
    const meHigh = gripBase(P0, { l: "sleeve", r: "collar" }, g.copy().shift(0.05));
    meHigh.elbow("r", [0.2, -0.2, 1]);
    mvP("sambo.gripHigh", "Manica prima, poi presa alta sul collo dietro la nuca", [K(g, 300, 150, null, P0), K(meSleeve.copy().act("arml"), 230, 120, null, P0), K(meHigh.copy().act("armr"), 260, 800, null, P0), K(g, 320, 250, null, P0)]);
    // rottura della presa sulla propria giacca: la sinistra prende il bavero destro, la destra strappa il polso
    const brk0 = g.copy().handRel("l", 0.13, -0.1, 0.09, "fist").elbow("l", [0, -1, -0.3]);
    const brk1 = brk0.copy().handRel("r", 0.2, -0.13, 0.04, "fist").elbow("r", [0, -1, 0.3]);
    const brk2 = g.copy().step("r", -0.68, 0.04).fyaw("r", 35).heel("r", 15).shift(-0.24).sink(0.03).turn(-35).handRel("l", 0.3, -0.36, -0.1, "open").handRel("r", 0.32, -0.42, 0.04, "fist").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
    mv("sambo.gripBreak", "Rottura: la destra strappa il polso in basso verso il pollice, passo indietro e spalla indietro", [K(g, 300, 150), K(brk0.copy().act("arml"), 280, 200), K(brk1.copy().act("armr"), 240, 200), K(brk2.copy().act("armr", "arml", "legr", "torso"), 220, 450), K(g, 340, 250)]);
    mv("sambo.gripBreakL", "Rottura dall'altro lato: la sinistra strappa il polso destro", [K(g.copy().mirror(), 300, 150), K(brk0.copy().mirror().act("armr"), 280, 200), K(brk1.copy().mirror().act("arml"), 240, 200), K(brk2.copy().mirror().act("arml", "armr", "legl", "torso"), 220, 450), K(g.copy().mirror(), 340, 250)]);
    // rottura sulla propria giacca, passo avanti e presa sulla giacca appesa (compagno a un passo)
    const Pfar = facing(gP, D + 0.3);
    mvP("sambo.breakAndGrip", "Rottura, passo avanti e presa su manica e bavero in meno di due secondi", [
      K(brk0, 300, 150, null, Pfar), K(brk1.copy().act("armr"), 200, 80, null, Pfar), K(brk2.copy().act("armr", "legr"), 200, 120, null, Pfar),
      K(g.copy().move(0.1).act("legr"), 220, 40, null, Pfar), K(gripBase(Pfar, { l: "sleeve" }, g.copy().move(0.3)).handRel("r", 0.3, -0.12, 0.08, "open").act("arml", "legr"), 200, 40, null, Pfar),
      K(gripBase(Pfar, { l: "sleeve", r: "lapel" }, g.copy().move(0.3)).act("armr"), 180, 500, null, Pfar)
    ]);
    /* ------------------------------------------------------------ cadute (samostrakhovka) */
    const UP = [0, 1, 0];
    const crouch = squat(1.1).handRel("l", 0.42, -0.02, -0.16, "open").handRel("r", 0.42, -0.02, 0.16, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    const flatFoot = (x, z, yaw = 0) => [[x, ankleY(0), z], yaw, 0];
    // seduto vicino ai talloni, schiena tonda, mento al petto
    const sitHeels = P({ pel: [-0.26, 0.13, 0], chest: [-0.1, 0.6, 0], head: [0.03, 0.74, 0], face: [1, 0.3, 0], fl: flatFoot(0.06, -0.16, 12), fr: flatFoot(0.06, 0.16, -12), kl: [1, 1, -0.2], kr: [1, 1, 0.2], hl: [[0.3, 0.6, -0.16], "open"], hr: [[0.3, 0.6, 0.16], "open"], el: [0, -1, -0.3], er: [0, -1, 0.3] });
    // rotolato sulla schiena, gambe su, braccia che battono a 45 gradi
    const rollSlap = P({ pel: [-0.45, 0.17, 0], chest: [-0.9, 0.15, 0], head: [-1.0, 0.33, 0], face: [0.3, 1, 0], fl: [[-0.05, 0.6, -0.15], 0, -40], fr: [[-0.05, 0.6, 0.15], 0, -40], kl: [0.2, 1, -0.2], kr: [0.2, 1, 0.2], hl: [[-0.52, 0.04, -0.56], "open"], hr: [[-0.52, 0.04, 0.56], "open"], el: [0, 1, 0], er: [0, 1, 0] });
    const rollUp = rollSlap.copy().footAt("l", [-0.25, 0.75, -0.14], 0, -60).footAt("r", [-0.25, 0.75, 0.14], 0, -60).hand("l", [-0.62, 0.3, -0.35], "open").hand("r", [-0.62, 0.3, 0.35], "open");
    mv("sambo.crouchSit", "Da accosciato, braccia avanti: siediti vicino ai talloni con la schiena tonda", [K(crouch, 300, 300), K(sitHeels.copy().act("legl", "legr", "torso"), 500, 700), K(crouch, 500, 300)]);
    mv("sambo.backRoll", "Rotola sulla schiena: le braccia battono quando toccano le scapole, gambe su", [K(crouch, 300, 150), K(sitHeels, 350, 50), K(rollSlap.copy().act("arml", "armr", "torso"), 300, 700), K(sitHeels, 450, 100), K(crouch, 400, 300)]);
    mv("sambo.rockUp", "Torna accosciato con lo slancio delle gambe", [K(rollSlap, 300, 300), K(rollUp.copy().act("legl", "legr"), 300, 50), K(sitHeels.copy().act("legl", "legr", "torso"), 350, 50), K(crouch.copy().act("legl", "legr"), 350, 500)]);
    mv("sambo.fallBack", "Caduta indietro: accosciato, seduto ai talloni, rotola e batti a 45 gradi, mento al petto", [K(g, 300, 100), K(crouch.copy().act("legl", "legr"), 400, 100), K(sitHeels.copy().act("torso"), 350, 30), K(rollSlap.copy().act("arml", "armr"), 300, 600), K(sitHeels, 450, 50), K(crouch, 400, 100), K(g, 450, 250)]);
    const gBack = g.copy().step("l", -0.22).shift(-0.1);
    mv("sambo.fallBackStep", "Mezzo passo indietro, poi accosciato, seduto e rotolata con battuta", [K(g, 300, 100), K(gBack.copy().act("legl"), 300, 80), K(crouch.copy().move(-0.15).act("legl", "legr"), 400, 80), K(sitHeels.copy().move(-0.15).act("torso"), 350, 30), K(rollSlap.copy().move(-0.15).act("arml", "armr"), 300, 600), K(sitHeels.copy().move(-0.15), 450, 50), K(crouch.copy().move(-0.15), 400, 100), K(g, 450, 250)]);
    // da sdraiato: braccia incrociate, battuta
    const lieCross = P({ pel: [0, 0.12, 0], chest: [-0.5, 0.13, 0], head: [-0.66, 0.27, 0], face: UP, fl: flatFoot(0.4, -0.13), fr: flatFoot(0.4, 0.13), kl: [0, 1, 0], kr: [0, 1, 0], hl: [[-0.4, 0.3, 0.1], "open"], hr: [[-0.37, 0.33, -0.1], "open"], el: [0.3, 0.5, -1], er: [0.3, 0.5, 1] });
    const lieSlap = lieCross.copy().hand("l", [-0.13, 0.04, -0.55], "open").hand("r", [-0.13, 0.04, 0.55], "open").elbow("l", [0, 1, 0]).elbow("r", [0, 1, 0]);
    mv("sambo.lieCross", "Sdraiato sulla schiena, mento al petto, braccia incrociate sul petto", [K(lieCross, 400, 1400)]);
    mv("sambo.slapBack", "Battuta: le braccia distese battono a 45 gradi dal corpo, palmi in basso", [K(lieCross, 300, 300), K(lieSlap.copy().act("arml", "armr"), 220, 600), K(lieCross, 500, 300), K(lieSlap.copy().act("arml", "armr"), 220, 600), K(lieCross, 500, 200)]);
    // dondolo da seduto
    const rockSit = P({ pel: [0, 0.13, 0], chest: [0.08, 0.62, 0], head: [0.17, 0.8, 0], face: [1, 0, 0], fl: flatFoot(0.42, -0.13), fr: flatFoot(0.42, 0.13), kl: [0, 1, 0], kr: [0, 1, 0], hl: [[0.2, 0.62, 0.1], "open"], hr: [[0.22, 0.6, -0.1], "open"], el: [0, -0.4, -1], er: [0, -0.4, 1] });
    const rockBack = P({ pel: [-0.18, 0.2, 0], chest: [-0.62, 0.15, 0], head: [-0.73, 0.32, 0], face: [0.3, 1, 0], fl: [[0.05, 0.52, -0.13], 0, -30], fr: [[0.05, 0.52, 0.13], 0, -30], kl: [0.3, 1, 0], kr: [0.3, 1, 0], hl: [[-0.52, 0.32, 0.1], "open"], hr: [[-0.5, 0.34, -0.1], "open"], el: [0.3, 0.5, -1], er: [0.3, 0.5, 1] });
    const rockSlapP = rockBack.copy().hand("l", [-0.24, 0.04, -0.55], "open").hand("r", [-0.24, 0.04, 0.55], "open").elbow("l", [0, 1, 0]).elbow("r", [0, 1, 0]);
    mv("sambo.rock", "Dondolo: da seduto rotola indietro fino alle scapole, testa staccata, e torna", [K(rockSit, 300, 200), K(rockBack.copy().act("torso"), 450, 150), K(rockSit.copy().act("torso"), 450, 200), K(rockBack.copy().act("torso"), 450, 150), K(rockSit, 450, 200)]);
    mv("sambo.rockSlap", "Dondolo indietro, battuta quando toccano le scapole, ritorno seduto", [K(rockSit, 300, 200), K(rockSlapP.copy().act("arml", "armr", "torso"), 420, 450), K(rockSit.copy().act("torso"), 450, 300)]);

    // caduta laterale (sul fianco destro); "L" = a sinistra (specchio)
    const sideA = norm([-0.85, 0, 0.4]);
    const sideRb = cross(UP, sideA);
    const sideF = add(mul(UP, 0.42), mul(sideRb, 0.906));
    const sidePel = [-0.05, 0.15, 0.06];
    const sideChest = add(sidePel, add(mul(sideA, 0.47), [0, 0.04, 0]));
    const sideLie = P({ pel: sidePel, chest: sideChest, head: add(sideChest, add(mul(sideA, 0.1), add(mul(sideF, 0.15), [0, 0.04, 0]))), face: sideF,
      hr: [add(sideChest, [0.5, -0.16, 0.25]), "open"], hl: [add(sideChest, mul(sideF, 0.26)), "open"], er: [0, 1, 0], el: [0, -1, -0.3],
      fr: [[0.6, 0.08, 0.26], 0, -60], fl: flatFoot(0.32, -0.1, 10), kr: [0.3, 1, 0.5], kl: [0.2, 1, -0.4] });
    const sideSeat = P({ pel: [0, 0.13, 0], chest: [0.05, 0.62, 0], head: [0.1, 0.81, 0], face: [1, 0, 0], fl: [[0.8, 0.08, -0.17], 0, -75], fr: [[0.8, 0.08, 0.17], 0, -75], kl: [0, 1, 0], kr: [0, 1, 0], hl: [[0.28, 0.48, -0.2], "open"], hr: [[0.28, 0.48, 0.2], "open"], el: [0, -1, -0.3], er: [0, -1, 0.3] });
    const sideLift = P({ pel: [0, 0.13, 0.02], chest: [-0.06, 0.61, 0.04], head: [0.02, 0.8, 0.02], face: [1, 0, 0.1], fl: [[0.8, 0.08, -0.17], 0, -75], fr: [[0.62, 0.42, 0.04], 0, -40], kl: [0, 1, 0], kr: [0.4, 1, 0], hl: [[0.25, 0.48, -0.22], "open"], hr: [[0.38, 0.62, -0.1], "open"], el: [0, -1, -0.3], er: [0, -1, 0.3] });
    const sideLieSeat = sideLie.copy().footAt("l", [0.58, 0.14, -0.08], 0, -60).knee("l", [0.3, 1, -0.2]);
    const R60 = (b) => xf(b, 90);
    mv("sambo.sideRollSit", "Da seduto: alza gamba e braccio destro, rotola sul fianco destro e batti", [K(R60(sideSeat), 300, 200), K(R60(sideLift).act("legr", "armr"), 380, 100), K(R60(sideLieSeat).act("armr", "torso"), 320, 600), K(R60(sideSeat), 500, 250)]);
    mv("sambo.sideRollSitL", "Da seduto, a sinistra: alza gamba e braccio sinistro, rotola e batti", [K(sideSeat.copy().mirror(), 300, 200), K(sideLift.copy().mirror().act("legl", "arml"), 380, 100), K(sideLieSeat.copy().mirror().act("arml", "torso"), 320, 600), K(sideSeat.copy().mirror(), 500, 250)]);
    // da accosciato: il destro scivola davanti al sinistro, seduto vicino al tallone sinistro
    const slideA = P({ pel: [-0.14, 0.4, -0.03], chest: [0.03, 0.86, -0.04], head: [0.11, 1.05, -0.04], face: [1, 0, 0], fl: flatFoot(0.02, -0.17, 15), fr: [[0.36, 0.1, -0.06], -30, -40], kl: [1, 0.2, -0.4], kr: [0.4, 1, 0.3], hl: [[0.3, 0.78, -0.22], "open"], hr: [[0.34, 0.8, 0.0], "open"], el: [0, -1, -0.3], er: [0, -1, 0.3] });
    const sitHeel = P({ pel: [-0.12, 0.14, -0.08], chest: [-0.18, 0.62, 0.02], head: [-0.06, 0.78, 0.04], face: [1, 0.2, 0.3], fl: flatFoot(0.05, -0.2, 15), fr: [[0.5, 0.08, -0.12], -20, -60], kl: [0.6, 1, -0.3], kr: [0.3, 1, 0.3], hl: [[0.15, 0.6, -0.1], "open"], hr: [[0.18, 0.66, -0.12], "open"], el: [0, -1, -0.3], er: [0, -1, 0.3] });
    mv("sambo.sideSlide", "Il piede destro scivola davanti al sinistro, siediti vicino al tallone sinistro", [K(R60(crouch), 300, 200), K(R60(slideA).act("legr"), 400, 200), K(R60(sitHeel).act("legl", "torso"), 400, 600), K(R60(crouch), 500, 300)]);
    mv("sambo.sideSlap", "Rotola sul fianco destro: il braccio destro batte, la sinistra davanti al petto", [K(R60(sitHeel), 300, 200), K(R60(sideLie).act("armr", "torso"), 320, 900), K(R60(sitHeel), 500, 300)]);
    const fallSideFr = (m) => {
      const f = (b) => (m ? b.copy().mirror() : R60(b));
      const a = (...x) => (m ? x.map((s) => s.replace(/r$/, "X").replace(/l$/, "r").replace(/X$/, "l")) : x);
      return [K(f(g), 300, 100), K(f(crouch).act(...a("legl", "legr")), 400, 80), K(f(slideA).act(...a("legr")), 300, 50), K(f(sitHeel).act("torso"), 300, 30), K(f(sideLie).act(...a("armr", "torso")), 300, 600), K(f(sitHeel), 450, 50), K(f(crouch), 400, 80), K(f(g), 450, 250)];
    };
    mv("sambo.fallSide", "Caduta laterale a destra: accosciato, la gamba scivola, rotola sul fianco e batti", fallSideFr(false));
    mv("sambo.fallSideL", "Caduta laterale a sinistra: stessa forma, batte il braccio sinistro", fallSideFr(true));

    // caduta in avanti da in ginocchio (come una tavola, su avambracci e palmi)
    const instep = { dir: [-1, 0, 0], down: [0, 1, 0], hint: 180 };
    const kneelAt = (a, arms) => {
      const s = Math.sin(a * DEG);
      const c = Math.cos(a * DEG);
      const kz = 0.07;
      const pel = [0.44 * s, kz + 0.44 * c, 0];
      const chest = [0.94 * s, kz + 0.94 * c, 0];
      const b = P({ pel, chest, head: [1.14 * s, kz + 1.14 * c, 0], face: [c, -s, 0], fl: [[-0.43, 0.065, -0.11], instep], fr: [[-0.43, 0.065, 0.11], instep], kl: [1, -1, 0], kr: [1, -1, 0] });
      if (arms === "chest") b.handRel("l", 0.24, 0.02, -0.14, "open").handRel("r", 0.24, 0.02, 0.14, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
      if (arms === "ready") b.handRel("l", 0.36, 0.0, -0.13, "open").handRel("r", 0.36, 0.0, 0.13, "open").elbow("l", [0, -0.6, -1]).elbow("r", [0, -0.6, 1]);
      return b;
    };
    const kneelTall = kneelAt(0, "chest");
    const fwdLand = (() => {
      const b = kneelAt(79, null);
      b.hand("l", [1.17, 0.04, -0.13], "open").hand("r", [1.17, 0.04, 0.13], "open").elbow("l", [0, 0.4, -1]).elbow("r", [0, 0.4, 1]);
      b.p.head = [1.11, 0.27, 0.02];
      b.look(70);
      return b;
    })();
    const fwdHold = fwdLand.copy().look(85);
    mv("sambo.kneelReady", "In ginocchio, busto dritto, braccia piegate davanti al petto, palmi avanti", [K(standing(), 300, 200), K(kneelTall.copy().act("legl", "legr"), 700, 900)]);
    mv("sambo.fallFwd", "Caduta in avanti: corpo dritto, arrivo su avambracci e palmi, testa girata", [K(kneelTall, 300, 200), K(kneelAt(30, "ready").act("torso"), 350, 0), K(fwdLand.copy().act("arml", "armr", "torso"), 260, 700), K(kneelAt(35, "ready"), 500, 0), K(kneelTall, 350, 250)]);
    mv("sambo.fallFwdBoard", "Ti lasci cadere in avanti dritto come una tavola, dalle ginocchia alla testa", [K(kneelTall, 300, 250), K(kneelAt(30, "ready").act("torso"), 450, 100), K(kneelAt(60, "ready").act("torso"), 350, 0), K(fwdLand.copy().act("arml", "armr", "torso"), 250, 600), K(kneelTall, 800, 250)]);
    mv("sambo.fallFwdLand", "Avambracci e palmi toccano insieme, mani all'altezza del viso", [K(kneelTall, 300, 250), K(kneelAt(45, "ready"), 350, 0), K(fwdLand.copy().act("arml", "armr"), 230, 1300), K(kneelTall, 800, 250)]);
    mv("sambo.fallFwdHold", "Addominali tesi: il petto si ferma sopra il materasso, testa di lato", [K(kneelTall, 300, 200), K(fwdLand, 600, 100), K(fwdHold.copy().act("torso", "head"), 300, 1800), K(kneelTall, 800, 250)]);

    /* ------------------------------------------------------------ ponte, uscita d'anca, rialzarsi in base */
    const lieKnees = P({ pel: [0, 0.12, 0], chest: [-0.5, 0.13, 0], head: [-0.71, 0.14, 0], face: UP, fl: flatFoot(0.36, -0.15), fr: flatFoot(0.36, 0.15), kl: [0, 1, 0], kr: [0, 1, 0], hl: [[-0.36, 0.3, 0.1], "open"], hr: [[-0.33, 0.33, -0.1], "open"], el: [0.3, 0.5, -1], er: [0.3, 0.5, 1] });
    const bridgeUp = P({ pel: [0.06, 0.44, 0], chest: [-0.4, 0.2, 0], head: [-0.6, 0.13, 0], face: [0.45, 1, 0], fl: flatFoot(0.36, -0.15), fr: flatFoot(0.36, 0.15), kl: [0.6, 1, -0.1], kr: [0.6, 1, 0.1], hl: [[-0.28, 0.4, 0.1], "open"], hr: [[-0.25, 0.42, -0.1], "open"], el: [0.3, 0.5, -1], er: [0.3, 0.5, 1] });
    const bridgeTurnL = P({ pel: [0.04, 0.42, 0.04], chest: [-0.4, 0.22, -0.05], head: [-0.6, 0.15, -0.1], face: [0.25, 0.75, -0.6], hipFace: [0.3, 0.9, -0.35], fl: flatFoot(0.36, -0.15), fr: [[0.36, ankleY(25), 0.15], 0, 25], kl: [0.6, 1, -0.1], kr: [0.6, 1, -0.3], hl: [[-0.38, 0.62, -0.4], "open"], hr: [[-0.3, 0.7, -0.3], "open"], el: [0, -0.3, -1], er: [0.3, -0.5, 1] });
    mv("sambo.bridge", "Ponte sulle spalle: piedi vicino ai glutei, fianchi in alto, testa senza peso", [K(lieKnees, 300, 200), K(bridgeUp.copy().act("torso", "legl", "legr"), 450, 1700), K(lieKnees, 600, 300)]);
    mv("sambo.bridgeTurn", "Ponte con rotazione: sali e ruota il bacino verso una spalla, poi dall'altra", [K(lieKnees, 300, 150), K(bridgeUp.copy().act("torso", "legl", "legr"), 380, 100), K(bridgeTurnL.copy().act("torso", "arml", "armr"), 300, 500), K(lieKnees, 450, 200), K(bridgeUp.copy().act("torso", "legl", "legr"), 380, 100), K(bridgeTurnL.copy().mirror().act("torso", "arml", "armr"), 300, 500), K(lieKnees, 450, 250)]);
    // uscita d'anca verso destra: sul fianco sinistro, il piede spinge, il sedere va indietro
    const shrimpSide = (dx = 0, dz = 0) => P({ pel: [-0.06 + dx, 0.15, 0.24 + dz], chest: [-0.52 + dx, 0.19, 0.06 + dz], head: [-0.72 + dx, 0.22, 0.0 + dz], face: [0.15, 0.55, -1], fl: [[0.12 + dx, 0.1, 0.2 + dz], { dir: [0.4, 0, -1], down: [0, -1, 0], hint: 60 }], fr: [[0.38 + dx, ankleY(0), 0.08 + dz], -25, 0], kl: [0.5, 0.4, -1], kr: [0.3, 1, -0.4], hl: [[-0.3 + dx, 0.3, -0.42 + dz], "open"], hr: [[-0.26 + dx, 0.4, -0.34 + dz], "open"], el: [0, -0.5, -0.2], er: [0, 0.5, 0.3] });
    const lieK = (dx = 0, dz = 0) => lieKnees.copy().move(dx, dz);
    mv("sambo.shrimp", "Uscita d'anca: sul fianco, il piede spinge, il sedere va indietro, le mani spingono via", [K(lieKnees, 300, 200), K(shrimpSide().act("torso", "legr", "arml", "armr"), 450, 500), K(lieKnees, 450, 300)]);
    mv("sambo.shrimpL", "Uscita d'anca dall'altro lato: sul fianco destro, il sedere va a sinistra", [K(lieKnees, 300, 200), K(shrimpSide().mirror().act("torso", "legl", "arml", "armr"), 450, 500), K(lieKnees, 450, 300)]);
    mv("sambo.shrimpLine", "Uscite d'anca in linea, alternando i lati, a zig zag lungo il materasso", [
      K(lieKnees, 300, 150), K(shrimpSide(0, 0).act("torso", "legr"), 400, 150), K(lieK(-0.15, 0.2), 380, 100),
      K(shrimpSide(-0.15, 0.2).mirror().move(0, 0.4).act("torso", "legl"), 400, 150), K(lieK(-0.3, 0), 380, 100),
      K(shrimpSide(-0.3, 0).act("torso", "legr"), 400, 150), K(lieK(-0.45, 0.2), 380, 300)
    ]);
    // rialzarsi in base: mano sinistra a terra dietro, destra davanti al viso, gamba sinistra che passa dietro
    const bs1 = P({ pel: [0, 0.14, 0], chest: [-0.2, 0.55, 0], head: [-0.12, 0.74, 0], face: [1, 0.25, 0], fr: flatFoot(0.4, 0.13), fl: [[0.58, 0.07, -0.16], 0, -70], kr: [0.2, 1, 0], kl: [0, 1, 0], hl: [[-0.36, 0.04, -0.25], "open"], hr: [[-0.02, 0.76, 0.06], "fist"], el: [-0.3, 0.2, -1], er: [0, -1, 0.4] });
    const bs2 = P({ pel: [0.02, 0.38, -0.05], chest: [-0.31, 0.62, -0.1], head: [-0.24, 0.81, -0.08], face: [1, 0.1, 0.1], fr: flatFoot(0.4, 0.13), fl: [[-0.72, 0.07, -0.16], 180, -60], kr: [0.4, 1, 0], kl: [0, -1, 0], hl: [[-0.4, 0.04, -0.3], "open"], hr: [[-0.1, 0.92, 0.06], "fist"], el: [-0.3, 0.2, -1], er: [0, -1, 0.4] });
    const bs3 = g.copy().move(-0.45);
    mv("sambo.baseStand", "Rialzarsi in base: mano dietro a terra, fianchi su, la gamba passa dietro, stoika", [K(bs1, 300, 300), K(bs2.copy().act("legl", "arml", "torso"), 450, 150), K(bs3.copy().act("legl", "legr"), 450, 450)]);
    mv("sambo.baseUp", "Seduto, solleva i fianchi su mano e piede e porta la gamba libera sotto il corpo", [K(bs1, 300, 400), K(bs2.copy().act("legl", "arml", "torso"), 600, 900), K(bs1, 600, 200)]);

    /* ------------------------------------------------------------ rotolamenti e dondolo */
    // sdraiato dritto con le braccia sopra la testa, girato di "phi" gradi sul proprio asse (verso destra)
    const rollPose = (phi, z, tuck) => {
      const A = [-1, 0, 0];
      const c = Math.cos(phi * DEG);
      const s = Math.sin(phi * DEG);
      const f = add(mul(UP, c), mul([0, 0, 1], s));
      const r = sub(mul([0, 0, 1], c), mul(UP, s));
      const h = 0.13 + 0.05 * Math.abs(s);
      const pel = [0, h, z];
      const fo = f[1] < -0.5 ? { dir: [1, -0.3, 0], down: [0.3, 1, 0], hint: 0 } : { dir: f, down: [1, 0, 0], hint: 0 };
      if (!tuck) {
        return P({ pel, chest: [-0.5, h + 0.01, z], head: [-0.71, h + 0.01, z], yaw: 0, roll: -phi,
          hl: [add([-1.03, h, z], mul(r, -0.1)), "open"], hr: [add([-1.03, h, z], mul(r, 0.1)), "open"], el: f, er: f,
          fl: [add([0.86, h - 0.04, z], mul(r, -0.1)), fo], fr: [add([0.86, h - 0.04, z], mul(r, 0.1)), fo], kl: f, kr: f });
      }
      const C = [-0.15, 0.3 - 0.03 * Math.abs(s), z];
      const pl = sub(sub(C, mul(A, 0.2)), mul(f, 0.17));
      const ch = add(pl, add(mul(A, 0.45), mul(f, 0.04)));
      const fo2 = { dir: add(f, [0.3, 0, 0]), down: add(mul(A, -1), mul(f, -0.3)), hint: 0 };
      return P({ pel: pl, chest: ch, head: add(ch, add(mul(A, 0.15), mul(f, 0.12))), yaw: 0, roll: -phi,
        hl: [add(pl, add(add(mul(A, 0.12), mul(f, 0.42)), mul(r, -0.12))), "open"], hr: [add(pl, add(add(mul(A, 0.12), mul(f, 0.42)), mul(r, 0.12))), "open"], el: add(mul(f, 0.3), mul(r, -1)), er: add(mul(f, 0.3), mul(r, 1)),
        fl: [add(pl, add(add(mul(A, -0.08), mul(f, 0.38)), mul(r, -0.11))), fo2], fr: [add(pl, add(add(mul(A, -0.08), mul(f, 0.38)), mul(r, 0.11))), fo2], kl: add(A, f), kr: add(A, f) });
    };
    mv("sambo.logRoll", "Rotolamenti laterali da sdraiato, braccia distese sopra la testa", [K(rollPose(0, 0), 300, 150), K(rollPose(90, 0.16).act("torso"), 320, 30), K(rollPose(180, 0.32).act("torso"), 320, 30), K(rollPose(270, 0.48).act("torso"), 320, 30), K(rollPose(360, 0.64).act("torso"), 320, 400)]);
    mv("sambo.tuckRoll", "Rotolamenti laterali con le ginocchia al petto, abbracciate", [K(rollPose(0, 0, true), 300, 150), K(rollPose(90, 0.18, true).act("torso"), 330, 30), K(rollPose(180, 0.36, true).act("torso"), 330, 30), K(rollPose(270, 0.54, true).act("torso"), 330, 30), K(rollPose(360, 0.72, true).act("torso"), 330, 400)]);

    /* ------------------------------------------------------------ sprawl, abbassamento, passo di penetrazione */
    const sprawlP = P({ pel: [-0.48, 0.22, 0], chest: [0.0, 0.4, 0], head: [0.17, 0.53, 0], face: [0.35, -1, 0], fl: [[-1.18, ankleY(60), -0.36], 0, 60], fr: [[-1.18, ankleY(60), 0.36], 0, 60], kl: [0, -1, 0], kr: [0, -1, 0], hl: [[0.3, 0.04, -0.24], "open"], hr: [[0.3, 0.04, 0.24], "open"], el: [-0.3, 0.2, -1], er: [-0.3, 0.2, 1] });
    const sprawlIn = g.copy().sink(0.25).lean(0.2).handRel("l", 0.35, -0.35, -0.2, "open").handRel("r", 0.35, -0.35, 0.2, "open");
    mv("sambo.sprawl", "Sprawl: mani giù, gambe che scappano indietro larghe, fianchi bassi, testa alta", [K(g, 300, 150), K(sprawlIn.copy().act("arml", "armr"), 180, 0), K(sprawlP.copy().act("legl", "legr", "torso"), 220, 450), K(g, 380, 300)]);
    mv("sambo.sprawlSlow", "Sprawl lento: mani a terra, gambe indietro, fianchi giù, poi di nuovo in stoika", [K(g, 300, 200), K(sprawlIn.copy().act("arml", "armr"), 400, 100), K(sprawlP.copy().act("legl", "legr", "torso"), 600, 800), K(g, 700, 300)]);
    const pivot = (b, th, px) => xf(xf(b, 0, -px, 0), th, px, 0);
    const fours = L.allFours().move(0.06);
    const foursT = pivot(fours, 90, 0.28);
    mv("sambo.sprawlTurn", "Dallo sprawl gira di 90 gradi a quattro zampe, come per andargli dietro, e rialzati", [K(g, 300, 120), K(sprawlP.copy().act("legl", "legr", "torso"), 300, 250), K(pivot(fours, 45, 0.28).act("legl", "legr"), 380, 30), K(foursT.copy().act("legl", "legr"), 320, 250), K(pivot(g.copy().move(-0.45), 90, 0.28).act("legl", "legr"), 500, 200), K(g, 500, 250)]);
    const lc = g.copy().sink(0.27).lean(0.1).step("r", 0.04, 0.04).step("l", -0.04, -0.04).headTo(0.01, 0.03);
    mv("sambo.levelChange", "Abbassamento: scendi piegando le ginocchia, schiena dritta, testa alta", [K(g, 300, 200), K(lc.copy().act("legl", "legr"), 500, 500), K(g, 500, 300)]);
    const ps1 = lc.copy().step("r", 0.36).shift(0.2).act("legr");
    const ps2 = P({ pel: [0.56, 0.43, 0.02], chest: [0.8, 0.86, 0.0], head: [0.92, 1.03, 0.0], face: [1, 0.15, 0], yaw: 0, fr: [[0.38, ankleY(55), 0.14], 0, 55], kr: [1, -0.4, 0], fl: [[-0.08, ankleY(25), -0.2], -20, 25], kl: [0.3, -1, 0], hl: [[1.08, 0.8, -0.18], "open"], hr: [[1.1, 0.82, 0.16], "open"], el: [0, -1, -0.4], er: [0, -1, 0.4] });
    const ps3 = P({ pel: [0.74, 0.58, 0.0], chest: [0.92, 1.04, 0.0], head: [1.02, 1.22, 0.0], face: [1, 0.1, 0], yaw: 0, fr: flatFoot(0.92, 0.16, 0), kr: [1, 0, 0], fl: [[0.95, ankleY(0), -0.2], 15, 0], kl: [1, 0, -0.2], hl: [[1.25, 0.95, -0.18], "open"], hr: [[1.27, 0.97, 0.16], "open"], el: [0, -1, -0.4], er: [0, -1, 0.4] });
    mv("sambo.penStep", "Passo di penetrazione: passo lungo, il ginocchio avanti appoggia piano, la gamba dietro segue", [K(g, 300, 120), K(lc, 300, 80), K(ps1, 260, 40), K(ps2.copy().act("legr"), 260, 350), K(ps3.copy().act("legl"), 350, 100), K(g.copy().move(0.75).act("legl", "legr"), 350, 300)]);
    // discesa in ginocchio per il mulino
    const kd1 = g.copy().step("r", 0.28).shift(0.14);
    const kd2 = P({ pel: [0.32, 0.47, -0.06], chest: [0.5, 0.92, -0.15], head: [0.6, 1.08, -0.24], face: [1, 0, -0.15], fr: [[0.02, ankleY(50), 0.13], 0, 50], kr: [1, -0.5, 0], fl: flatFoot(0.32, -0.46, 25), kl: [0.6, 0.4, -1], hl: [[0.45, 1.02, -0.04], "fist"], hr: [[0.88, 0.45, 0.06], "open"], el: [0, -1, -0.5], er: [0, -0.3, 1] });
    mv("sambo.kneeDrop", "Discesa morbida sul ginocchio destro, testa a sinistra, braccio destro tra le gambe", [K(g, 300, 150), K(kd1.copy().act("legr"), 250, 60), K(kd2.copy().act("legr", "legl", "armr", "arml", "head"), 450, 700), K(kd1.copy().act("legl"), 400, 80), K(g, 300, 250)]);
    /* ------------------------------------------------------------ proiezioni: zadnyaya podnozhka */
    // il compagno si costruisce rivolto verso +x (come te) e si porta davanti con toW
    const toW = (b) => xf(b, 180, D, 0);
    const Pback = toW(gP.copy().shift(-0.06).lean(-0.1));
    const pTilt = toW(P({ pel: [-0.12, 0.82, 0.02], chest: [-0.33, 1.25, 0.02], head: [-0.42, 1.44, 0.01], face: [1, 0.45, 0], fr: flatFoot(0.2, 0.16, 10), fl: [[-0.24, ankleY(25), -0.18], 25, 25], kr: [1, 0, 0], kl: [1, 0, 0], hl: [[0.0, 1.12, -0.32], "open"], hr: [[0.22, 1.08, 0.22], "open"], el: [0, -1, -0.5], er: [0, -1, 0.3] }));
    const zSt = (o) => P(Object.assign({ yaw: 35, fl: flatFoot(0.5, -0.5, 30), kl: [1, 0.1, -0.4] }, o));
    const Z1 = gripBase(Pback, { l: "sleeve", r: "lapel" }, g.copy().shift(0.04).lean(0.04));
    const Z2 = gripBase(Pback, { l: "sleeve", r: "lapel" }, zSt({ pel: [0.34, 0.8, -0.36], chest: [0.46, 1.27, -0.33], head: [0.52, 1.46, -0.31], fr: [[0.16, ankleY(25), 0.1], 20, 25], kr: [1, 0, 0.2] }));
    const zLeg = { fr: [[0.88, 0.09, -0.27], 35, 0], kr: [1, 0.3, 0.3] };
    const Z3 = gripBase(Pback, { l: "sleeve", r: "lapel" }, zSt(Object.assign({ pel: [0.4, 0.82, -0.38], chest: [0.53, 1.28, -0.4], head: [0.6, 1.46, -0.39] }, zLeg)));
    const Z4 = gripBase(pTilt, { l: "sleeve", r: "shoulderR" }, zSt(Object.assign({ pel: [0.44, 0.8, -0.38], chest: [0.64, 1.23, -0.38], head: [0.72, 1.41, -0.36] }, zLeg)));
    Z4.hand("l", add(Z4.p.hand.l, [-0.12, -0.12, -0.04]), "fist");
    mvP("sambo.zadnyaya", "Zadnyaya podnozhka: piede accanto al suo, gamba dietro la sua come un muro, spingi", [
      K(gripBase(P0), 300, 150, null, P0), K(Z1.copy().act("arml", "armr"), 300, 150, null, Pback),
      K(Z2.copy().act("legl"), 300, 150, null, Pback), K(Z3.copy().act("legr"), 300, 200, null, Pback),
      K(Z4.copy().act("arml", "armr", "torso"), 280, 450, null, pTilt), K(gripBase(P0), 450, 250, null, P0)
    ]);
    mvP("sambo.zadnyayaSlow", "Zadnyaya in quattro tempi: squilibrio, passo, gamba dietro, spinta", [
      K(gripBase(P0), 300, 300, null, P0), K(Z1.copy().act("arml", "armr"), 500, 700, null, Pback),
      K(Z2.copy().act("legl"), 500, 700, null, Pback), K(Z3.copy().act("legr"), 500, 800, null, Pback),
      K(Z4.copy().act("arml", "armr", "torso"), 450, 900, null, pTilt), K(gripBase(P0), 600, 300, null, P0)
    ]);
    // proiezione completa: il compagno cade all'indietro sopra la gamba
    const pZf1 = toW(P({ pel: [-0.3, 0.62, 0.06], chest: [-0.66, 0.94, 0.06], head: [-0.8, 1.08, 0.05], face: [0.6, 1, 0], fr: [[0.18, 0.09, 0.16], 0, -20], fl: [[-0.05, 0.4, -0.15], 0, -20], kr: [1, 0.2, 0], kl: [1, 1, 0], hl: [[-0.5, 1.2, -0.45], "open"], hr: [[-0.2, 1.05, 0.25], "open"], el: [0, 0, -1], er: [0, -1, 0.3] }));
    const pZf2 = toW(P({ pel: [-0.48, 0.38, 0.06], chest: [-0.94, 0.5, 0.06], head: [-1.12, 0.6, 0.05], face: [0.3, 1, 0], fr: [[0.0, 0.62, 0.16], 0, -40], fl: [[0.0, 0.85, -0.15], 0, -40], kr: [0.3, 1, 0], kl: [0.3, 1, 0], hl: [[-0.9, 0.5, -0.55], "open"], hr: [[-0.5, 0.85, 0.25], "open"], el: [0, 1, -0.3], er: [0, -1, 0.3] }));
    const pZland = toW(P({ pel: [-0.36, 0.13, 0.06], chest: [-0.85, 0.15, 0.06], head: [-1.05, 0.24, 0.05], face: UP, fr: [[0.25, 0.2, 0.18], 0, -50], fl: [[0.2, 0.42, -0.14], 0, -50], kr: [0.2, 1, 0], kl: [0.2, 1, 0], hl: [[-0.5, 0.04, -0.55], "open"], hr: [[-0.48, 0.62, 0.32], "open"], el: [0, 1, 0], er: [0, -1, 0.5] }));
    const zEnd = zSt(Object.assign({ pel: [0.62, 0.74, -0.4], chest: [1.05, 0.98, -0.36], head: [1.2, 1.12, -0.34] }, zLeg));
    grab(zEnd, pZland, { l: "cuff" }).handRel("r", 0.3, -0.25, 0.12, "open").elbow("l", [0, -1, -0.5]);
    mvP("sambo.zadnyayaThrow", "Zadnyaya podnozhka completa: il compagno cade all'indietro sopra la tua gamba", [
      K(gripBase(P0), 300, 150, null, P0), K(Z1.copy().act("arml", "armr"), 280, 80, null, Pback),
      K(Z2.copy().act("legl"), 260, 60, null, Pback), K(Z3.copy().act("legr"), 260, 100, null, Pback),
      K(gripBase(pZf1, { l: "cuff", r: "shoulderR" }, zSt(Object.assign({ pel: [0.48, 0.79, -0.38], chest: [0.72, 1.2, -0.38], head: [0.81, 1.38, -0.36] }, zLeg))).act("arml", "armr", "torso"), 260, 0, null, pZf1),
      K(grab(zSt(Object.assign({ pel: [0.56, 0.76, -0.39], chest: [0.92, 1.12, -0.37], head: [1.04, 1.28, -0.35] }, zLeg)), pZf2, { l: "cuff" }).handRel("r", 0.35, -0.15, 0.1, "open").act("arml", "torso"), 220, 0, null, pZf2),
      K(zEnd, 220, 700, null, pZland), K(gripBase(P0), 600, 250, null, P0)
    ]);
    /* ------------------------------------------------------------ girata d'anca e brosok cherez bedro */
    // girata a vuoto (senza compagno): passo e rotazione bassa
    const turnBase = (o) => P(Object.assign({ pel: [0.42, 0.72, -0.04], chest: [0.33, 1.19, -0.02], head: [0.28, 1.38, -0.01], yaw: 180, fr: flatFoot(0.42, -0.14, 180), fl: flatFoot(0.42, 0.14, 180), kr: [-1, 0, -0.25], kl: [-1, 0, 0.25] }, o));
    const ht1 = P({ pel: [0.18, 0.82, -0.04], chest: [0.24, 1.3, -0.05], head: [0.27, 1.49, -0.05], yaw: 60, fr: flatFoot(0.42, -0.12, 120), fl: [[-0.2, ankleY(15), -0.18], 30, 15], kr: [0.5, 0, -1], kl: [1, 0, 0] });
    const ht2 = P({ pel: [0.3, 0.8, 0.06], chest: [0.3, 1.28, 0.06], head: [0.3, 1.47, 0.06], yaw: 130, fr: flatFoot(0.42, -0.14, 150), fl: [[0.15, ankleY(10), 0.32], 170, 10], kr: [-0.5, 0, -1], kl: [0, 0, 1] });
    const ht3 = turnBase({});
    const armsT = (b) => b.handRel("l", 0.32, -0.08, -0.12, "fist").handRel("r", 0.3, -0.22, 0.18, "fist").elbow("l", [0, 0.2, 1]).elbow("r", [0, -1, -0.5]);
    mv("sambo.hipTurn3", "Girata d'anca in tre passi: destro davanti, sinistro gira dietro, piedi paralleli", [K(g, 300, 150), K(armsT(ht1.copy()).act("legr"), 350, 250), K(armsT(ht2.copy()).act("legl", "torso"), 380, 250), K(armsT(ht3.copy()).act("legr", "legl"), 300, 500), K(g, 500, 250)]);
    mv("sambo.hipTurn2", "Girata d'anca in due passi: destro già girato, il sinistro ruota dietro", [K(g, 300, 150), K(armsT(ht1.copy()).act("legr"), 280, 60), K(armsT(ht3.copy()).act("legl", "torso"), 380, 600), K(g, 500, 250)]);
    mv("sambo.hipTurnLow", "All'arrivo: ginocchia piegate, anche basse, schiena dritta, peso sugli avampiedi", [K(g, 300, 150), K(armsT(ht3.copy()), 500, 300), K(armsT(turnBase({ pel: [0.43, 0.66, -0.04], chest: [0.36, 1.13, -0.02], head: [0.32, 1.32, -0.01] })).act("legl", "legr"), 400, 900), K(g, 500, 250)]);
    // con il compagno: squilibrio in avanti, entrata, carico, rotazione
    const pFwd = toW(P({ pel: [0.06, 0.86, 0], chest: [0.21, 1.32, 0], head: [0.3, 1.5, 0], face: [1, -0.25, 0], fr: [[0.12, ankleY(25), 0.17], 0, 25], fl: [[0.0, ankleY(25), -0.17], 0, 25], kr: [1, 0, 0], kl: [1, 0, 0], hl: [[0.36, 1.0, -0.2], "open"], hr: [[0.44, 1.1, 0.18], "open"], el: [0, -1, -0.4], er: [0, -1, 0.4] }));
    const pLoad = toW(P({ pel: [0.12, 0.92, 0.03], chest: [0.33, 1.34, -0.02], head: [0.44, 1.5, -0.03], face: [1, -0.45, 0], fr: [[0.12, ankleY(45), 0.17], 0, 45], fl: [[0.02, ankleY(45), -0.17], 0, 45], kr: [1, 0, 0], kl: [1, 0, 0], hl: [[0.42, 1.08, -0.3], "open"], hr: [[0.6, 1.05, 0.12], "open"], el: [0, -1, -0.4], er: [0, -1, 0.4] }));
    const kz1 = gripBase(pFwd, { l: "sleeve", r: "lapel" }, g.copy().step("l", -0.14).shift(-0.07).turn(-8));
    kz1.hand("l", kz1.rel(0.3, 0.05, -0.28), "fist").elbow("l", [0, 0.6, -1]);
    const pFwdArm = pFwd.copy().hand("r", add(kz1.p.hand.l, [0.08, 0, 0.03]), "open");
    const hb2 = gripBase(pFwdArm, { l: "sleeve", r: "lapel" }, ht1.copy().shift(0.04));
    const hbIn = gripBase(pFwdArm, { l: "sleeve", r: "belt" }, turnBase({})).elbow("l", [0, 0.5, 1]).elbow("r", [0.2, 0, -1]);
    const hbLoadMe = turnBase({ pel: [0.45, 0.76, -0.06], chest: [0.24, 1.17, 0.02], head: [0.15, 1.34, 0.05], yaw: 195 });
    hbLoadMe.hand("l", hbLoadMe.rel(0.3, -0.25, -0.12), "fist").elbow("l", [0, 0.4, 1]);
    const pLoadArm = pLoad.copy();
    const hbLoad = grab(hbLoadMe.copy(), pLoadArm, { l: "sleeve", r: "belt" }).elbow("r", [0.2, 0, -1]);
    mvP("sambo.hipEntry", "Brosok cherez bedro a vuoto: squilibrio, entrata in due passi, carico e rotazione", [
      K(gripBase(P0), 300, 150, null, P0), K(kz1.copy().act("arml", "legl"), 280, 120, null, pFwdArm),
      K(hb2.copy().act("legr"), 260, 40, null, pFwdArm), K(hbIn.copy().act("legl", "torso", "armr"), 300, 250, null, pFwdArm),
      K(hbLoad.copy().act("arml", "torso", "legl", "legr"), 300, 500, null, pLoadArm), K(gripBase(P0), 500, 250, null, P0)
    ]);
    mvP("sambo.hipEntrySlow", "Proiezione d'anca in quattro tempi lenti: squilibrio, entrata, carico, rotazione", [
      K(gripBase(P0), 300, 300, null, P0), K(kz1.copy().act("arml", "legl"), 500, 700, null, pFwdArm),
      K(hbIn.copy().act("legl", "legr", "torso", "armr"), 600, 800, null, pFwdArm),
      K(hbLoad.copy().act("arml", "torso"), 500, 1000, null, pLoadArm), K(gripBase(P0), 600, 300, null, P0)
    ]);
    // proiezione completa (manichino o compagno che cade davanti a te)
    const pOver = P({ pel: [0.53, 1.12, -0.26], chest: [0.4, 1.2, 0.21], head: [0.36, 1.22, 0.41], face: [0.25, -1, 0], fr: [[0.72, 0.62, -0.6], 0, 0], fl: [[0.88, 0.72, -0.45], 0, 0], kr: [0.3, -1, -0.3], kl: [0.3, -1, 0], hl: [[0.62, 0.82, 0.42], "open"], hr: [[0.1, 0.98, 0.34], "open"], el: [0, -1, 0], er: [0, 0, 1] });
    const hbOverMe = turnBase({ pel: [0.44, 0.84, -0.02], chest: [0.14, 1.14, 0.06], head: [0.03, 1.27, 0.1], yaw: 205, kr: [-1, 0, -0.1], kl: [-1, 0, 0.1] }).look(20);
    const hbOver = grab(hbOverMe.copy(), pOver, { l: "cuff", r: "belt" }).elbow("l", [0, 0.2, 1]).elbow("r", [0.3, 0.3, -1]);
    const pLandH = P({ pel: [0.06, 0.13, -0.3], chest: [-0.14, 0.15, 0.15], head: [-0.22, 0.26, 0.33], face: UP, fr: [[0.25, 0.2, -0.82], 0, -60], fl: [[0.05, 0.42, -0.78], 0, -60], kr: [0.4, 1, 0], kl: [0.1, 1, -0.3], hl: [[-0.48, 0.04, -0.1], "open"], hr: [[0.2, 0.69, 0.16], "open"], el: [0, 1, 0], er: [1, 0, 0] });
    const hbEndMe = P({ pel: [0.44, 0.74, 0.0], chest: [0.2, 1.08, 0.1], head: [0.1, 1.25, 0.12], yaw: 215, fr: flatFoot(0.44, -0.18, 200), fl: flatFoot(0.32, 0.22, 230), kr: [-1, 0, -0.2], kl: [-0.6, 0, 0.6] });
    const hbEnd = grab(hbEndMe.copy(), pLandH, { l: "cuff" }).handRel("r", 0.25, -0.2, 0.15, "open").elbow("l", [0, -1, 0.5]);
    mvP("sambo.hipThrow", "Proiezione d'anca completa: carico, rotazione, il compagno cade davanti, tieni la manica", [
      K(gripBase(P0), 300, 150, null, P0), K(kz1.copy().act("arml", "legl"), 280, 80, null, pFwdArm),
      K(hb2.copy().act("legr"), 240, 30, null, pFwdArm), K(hbIn.copy().act("legl", "torso", "armr"), 280, 120, null, pFwdArm),
      K(hbLoad.copy().act("arml", "torso"), 250, 100, null, pLoadArm), K(hbOver.copy().act("legl", "legr", "torso", "arml"), 260, 60, null, pOver),
      K(hbEnd.copy().act("arml"), 280, 800, null, pLandH), K(gripBase(P0), 600, 250, null, P0)
    ]);
    /* ------------------------------------------------------------ bokovaya podsechka (spazzata laterale sul passo) */
    const gFP = gF.copy().handRel("l", 0.3, -0.3, -0.17, "open").handRel("r", 0.3, -0.3, 0.17, "open");
    const PF = toW(gFP);
    const PF1 = toW(gFP.copy().step("l", 0, -0.16).shift(0, -0.07));
    const meF0 = gripBase(PF, { l: "sleeve", r: "lapel" }, gF.copy());
    const meF1 = gripBase(PF1, { l: "sleeve", r: "lapel" }, gF.copy().step("r", 0, 0.2).shift(0, 0.09));
    // il suo piede destro spazzato verso la tua destra, testa verso la tua sinistra
    const pSwept = P({ pel: [0.76, 0.86, 0.03], chest: [0.79, 1.32, -0.15], head: [0.8, 1.5, -0.23], face: [-1, 0.1, -0.1], fl: flatFoot(0.72, 0.38, 170), fr: [[0.7, 0.17, 0.06], 190, 10], kl: [-1, 0, 0.1], kr: [-1, 0.3, 0.2], hl: [[0.5, 1.0, 0.3], "open"], hr: [[0.48, 1.0, -0.1], "open"], el: [0, -1, 0.3], er: [0, -1, -0.3] });
    const sweepFoot = { dir: [0.85, 0.15, 0.3], down: [0.05, -0.25, 1] };
    const meSweep = P({ pel: [0.12, 0.84, 0.2], chest: [0.25, 1.3, 0.12], head: [0.32, 1.48, 0.08], yaw: -10, fr: flatFoot(0.02, 0.42, -15), fl: [[0.58, 0.12, -0.04], sweepFoot], kr: [1, 0, 0.3], kl: [1, 0.3, -0.3] });
    grab(meSweep, pSwept, { l: "sleeve", r: "lapel" });
    meSweep.hand("l", add(meSweep.p.hand.l, [-0.04, -0.12, 0]), "fist");
    const meSweepIn = P({ pel: [0.1, 0.85, 0.15], chest: [0.22, 1.32, 0.1], head: [0.29, 1.5, 0.08], yaw: 0, fr: flatFoot(0.02, 0.42, -15), fl: [[0.52, 0.12, -0.28], sweepFoot], kr: [1, 0, 0.3], kl: [1, 0.3, -0.3] });
    grab(meSweepIn, PF1, { l: "sleeve", r: "lapel" });
    mvP("sambo.podsechka", "Bokovaya podsechka: passo laterale, la pianta spazza il suo piede, le mani girano come un volante", [
      K(meF0, 300, 150, null, PF), K(meF1.copy().act("legr"), 280, 60, null, PF1),
      K(meSweepIn.copy().act("legl"), 180, 0, null, PF1), K(meSweep.copy().act("legl", "arml", "armr"), 200, 450, null, pSwept), K(meF0, 450, 250, null, PF)
    ]);
    const pSwF = P({ pel: [0.76, 0.5, -0.12], chest: [0.77, 0.66, -0.58], head: [0.78, 0.78, -0.78], face: [-0.3, 1, 0], fl: [[0.74, 0.55, 0.38], 180, -30], fr: [[0.72, 0.72, 0.22], 180, -30], kl: [-0.3, 1, 0], kr: [-0.3, 1, 0], hl: [[1.0, 0.6, -0.6], "open"], hr: [[0.45, 0.85, -0.25], "open"], el: [0, 1, 0], er: [0, -1, 0] });
    const pSwLand = P({ pel: [0.74, 0.13, -0.15], chest: [0.75, 0.15, -0.64], head: [0.77, 0.27, -0.83], face: UP, fl: [[0.72, 0.22, 0.6], 180, -60], fr: [[0.62, 0.4, 0.5], 180, -60], kl: [0, 1, 0], kr: [0, 1, 0], hl: [[1.15, 0.04, -0.45], "open"], hr: [[0.38, 0.62, -0.42], "open"], el: [0, 1, 0], er: [-1, 0, 0] });
    const meSwEnd = grab(P({ pel: [0.1, 0.78, 0.08], chest: [0.35, 1.05, -0.1], head: [0.44, 1.2, -0.14], yaw: 20, fr: flatFoot(0.02, 0.42, -15), fl: flatFoot(0.32, -0.12, 20), kr: [1, 0, 0.3], kl: [1, 0, -0.2] }), pSwLand, { l: "cuff" }).handRel("r", 0.28, -0.2, 0.12, "open").elbow("l", [0, -1, -0.5]);
    mvP("sambo.podsechkaThrow", "Podsechka completa: il piede spazzato vola via e il compagno cade di fianco", [
      K(meF0, 300, 150, null, PF), K(meF1.copy().act("legr"), 280, 60, null, PF1),
      K(meSweepIn.copy().act("legl"), 180, 0, null, PF1), K(meSweep.copy().act("legl", "arml", "armr"), 200, 60, null, pSwept),
      K(grab(meSwEnd.copy(), pSwF, { l: "cuff" }).act("arml"), 220, 0, null, pSwF), K(meSwEnd.copy().act("arml"), 220, 800, null, pSwLand), K(meF0, 600, 250, null, PF)
    ]);
    // spazzata da solo (asciugamano sul pavimento liscio, mani sull'elastico): solo i piedi
    const swSolo = (b) => b.handRel("l", 0.36, -0.28, -0.2, "fist").handRel("r", 0.4, 0.05, 0.05, "fist").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
    mv("sambo.sweepSolo", "Spazzata a vuoto: passo laterale, la pianta spazza verso destra, la sinistra tira giù", [K(gF, 300, 150), K(gF.copy().step("r", 0, 0.2).shift(0, 0.09).act("legr"), 280, 60), K(swSolo(meSweepIn.copy().set("hand", {})).act("legl"), 180, 0), K(swSolo(P({ pel: [0.12, 0.84, 0.2], chest: [0.16, 1.32, 0.16], head: [0.2, 1.51, 0.14], yaw: -10, fr: flatFoot(0.02, 0.42, -15), fl: [[0.58, 0.12, -0.04], sweepFoot], kr: [1, 0, 0.3], kl: [1, 0.3, -0.3] })).act("legl", "arml", "armr"), 200, 450), K(gF, 450, 250)]);

    /* ------------------------------------------------------------ perednyaya podnozhka (sgambetto anteriore) */
    const pnMe = (o) => turnBase(Object.assign({ pel: [0.44, 0.78, 0.1], chest: [0.36, 1.24, 0.11], head: [0.32, 1.43, 0.11], fl: flatFoot(0.45, 0.22, 185), fr: [[0.5, ankleY(5), -0.4], 150, 5], kl: [-1, 0, 0.3], kr: [-0.4, 0.2, -1] }, o));
    const pn3 = gripBase(pFwdArm, { l: "sleeve", r: "lapel" }, turnBase({ pel: [0.42, 0.76, 0.06], chest: [0.33, 1.22, 0.07], head: [0.29, 1.41, 0.07], fl: flatFoot(0.45, 0.22, 185), fr: flatFoot(0.4, -0.12, 160) })).elbow("l", [0, 0.5, 1]);
    const pn4 = gripBase(pFwdArm, { l: "sleeve", r: "lapel" }, pnMe({})).elbow("l", [0, 0.5, 1]);
    const pTrip = toW(P({ pel: [0.12, 0.88, 0.02], chest: [0.36, 1.27, -0.06], head: [0.48, 1.42, -0.08], face: [1, -0.5, 0.1], fr: [[0.12, ankleY(35), 0.17], 0, 35], fl: [[-0.05, ankleY(40), -0.17], 0, 40], kr: [1, 0, 0], kl: [1, 0, 0], hl: [[0.4, 1.0, -0.3], "open"], hr: [[0.62, 1.0, 0.25], "open"], el: [0, -1, -0.4], er: [0, -1, 0.4] }));
    const pn5me = pnMe({ chest: [0.3, 1.2, 0.14], head: [0.24, 1.38, 0.16], yaw: 205 }).look(25);
    const pn5 = grab(pn5me, pTrip, { l: "sleeve", r: "lapel" }).elbow("l", [0, 0.3, 1]);
    pn5.hand("l", add(pn5.p.hand.l, [-0.06, -0.1, 0.06]), "fist");
    mvP("sambo.perednyaya", "Perednyaya podnozhka: ti giri, la gamba destra blocca la sua tibia, le mani tirano avanti e giù", [
      K(gripBase(P0), 300, 150, null, P0), K(kz1.copy().act("arml", "legl"), 280, 120, null, pFwdArm),
      K(hb2.copy().act("legr"), 240, 40, null, pFwdArm), K(pn3.copy().act("legl", "torso"), 280, 100, null, pFwdArm),
      K(pn4.copy().act("legr"), 240, 200, null, pFwdArm), K(pn5.copy().act("arml", "armr", "torso"), 260, 450, null, pTrip), K(gripBase(P0), 500, 250, null, P0)
    ]);
    const pDive = P({ pel: [0.58, 0.9, -0.28], chest: [0.24, 0.66, -0.1], head: [0.08, 0.6, 0.0], face: [-0.2, -0.6, 1], fr: [[0.8, 1.2, -0.5], 0, 0], fl: [[0.95, 1.05, -0.3], 0, 0], kr: [0, -1, 0], kl: [0, -1, 0], hl: [[0.0, 0.3, -0.2], "open"], hr: [[0.12, 0.85, 0.25], "open"], el: [0, 0, -1], er: [0, 0, 1] });
    mvP("sambo.perednyayaThrow", "Perednyaya completa: il compagno inciampa sulla tua gamba e cade davanti a te", [
      K(gripBase(P0), 300, 150, null, P0), K(kz1.copy().act("arml", "legl"), 280, 80, null, pFwdArm),
      K(hb2.copy().act("legr"), 240, 30, null, pFwdArm), K(pn3.copy().act("legl", "torso"), 260, 60, null, pFwdArm),
      K(pn4.copy().act("legr"), 220, 80, null, pFwdArm), K(pn5.copy().act("arml", "armr", "torso"), 240, 40, null, pTrip),
      K(grab(pnMe({ chest: [0.24, 1.14, 0.16], head: [0.16, 1.3, 0.18], yaw: 215 }), pDive, { l: "cuff" }).handRel("r", 0.3, -0.2, 0.12, "open").act("arml", "torso"), 220, 0, null, pDive),
      K(hbEnd.copy().act("arml"), 260, 800, null, pLandH), K(gripBase(P0), 600, 250, null, P0)
    ]);

    /* ------------------------------------------------------------ brosok cherez spinu (proiezione dietro la schiena) */
    const spinMe = (o) => turnBase(Object.assign({ pel: [0.47, 0.6, -0.02], chest: [0.4, 1.08, -0.01], head: [0.36, 1.27, 0], fr: flatFoot(0.47, -0.11, 180), fl: flatFoot(0.47, 0.11, 180), kr: [-1, 0, -0.35], kl: [-1, 0, 0.35] }, o));
    const elbowUp = (b) => { b.handRel("r", 0.12, 0.04, -0.06, "fist"); const fr = b.frame(); b.elbow("r", add(add(mul(fr.right, 0.6), mul(fr.fwd, 0.4)), [0, 0.6, 0])); return b; };
    const st1 = elbowUp(spinMe({}));
    st1.handRel("l", 0.34, -0.12, -0.1, "fist").elbow("l", [0, 0.3, 1]);
    mv("sambo.seoiTurn", "Girata bassa: piedi paralleli dentro i suoi, ginocchia molto piegate, gomito destro alto", [K(g, 300, 150), K(armsT(ht1.copy()).act("legr"), 300, 60), K(st1.copy().act("legl", "legr", "armr"), 400, 800), K(g, 500, 250)]);
    const pSeoi = toW(P({ pel: [0.14, 0.9, 0.03], chest: [0.32, 1.32, 0.0], head: [0.43, 1.48, 0.0], face: [1, -0.45, 0], fr: [[0.12, ankleY(40), 0.17], 0, 40], fl: [[0.02, ankleY(40), -0.17], 0, 40], kr: [1, 0, 0], kl: [1, 0, 0], hl: [[0.4, 1.0, -0.3], "open"], hr: [[0.62, 1.0, 0.12], "open"], el: [0, -1, -0.4], er: [0, -1, 0.4] }));
    const seIn = grab(elbowUp(spinMe({})), pFwdArm, { l: "sleeve" }).elbow("l", [0, 0.5, 1]);
    const seLoad = grab(elbowUp(spinMe({ pel: [0.48, 0.62, -0.03], chest: [0.33, 1.06, 0.01], head: [0.26, 1.23, 0.02], yaw: 190 })), pSeoi, { l: "sleeve" }).elbow("l", [0, 0.4, 1]);
    seLoad.hand("l", add(seLoad.p.hand.l, [-0.06, -0.08, 0.03]), "fist");
    mvP("sambo.seoiEntry", "Brosok cherez spinu a vuoto: manica, girata bassa, gomito sotto l'ascella, carico", [
      K(gripBase(P0), 300, 150, null, P0), K(kz1.copy().act("arml", "legl"), 280, 120, null, pFwdArm),
      K(hb2.copy().act("legr"), 240, 40, null, pFwdArm), K(seIn.copy().act("legl", "legr", "armr", "torso"), 300, 250, null, pFwdArm),
      K(seLoad.copy().act("arml", "torso"), 280, 500, null, pSeoi), K(gripBase(P0), 500, 250, null, P0)
    ]);
    const pSeoiOver = P({ pel: [0.42, 1.45, -0.18], chest: [0.12, 1.15, 0.08], head: [-0.02, 1.02, 0.15], face: [0.3, -0.5, 0.8], fr: [[0.62, 1.85, -0.55], 0, 0], fl: [[0.8, 1.7, -0.35], 0, 0], kr: [0, 1, 0], kl: [0, 1, 0], hl: [[0.0, 0.8, 0.45], "open"], hr: [[-0.05, 0.95, 0.3], "open"], el: [0, 0, 1], er: [0, 0, 1] });
    const seOverMe = grab(elbowUp(spinMe({ pel: [0.47, 0.82, -0.02], chest: [0.12, 1.02, 0.06], head: [0.0, 1.12, 0.09], yaw: 210, kr: [-1, 0, -0.1], kl: [-1, 0, 0.1] })), pSeoiOver, { l: "cuff" }).elbow("l", [0, 0.2, 1]);
    seOverMe.handRel("r", 0.3, 0.05, -0.05, "fist");
    mv("sambo.seoiFinish", "Finale a vuoto: distendi le gambe, piega il busto in avanti e ruota a sinistra", [K(g, 300, 120), K(st1.copy().act("legl", "legr"), 400, 300), K(elbowUp(spinMe({ pel: [0.47, 0.84, -0.02], chest: [0.12, 1.04, 0.06], head: [0.0, 1.14, 0.09], yaw: 210 })).handRel("l", 0.25, -0.35, -0.05, "fist").look(25).act("legl", "legr", "torso", "arml"), 350, 600), K(g, 500, 250)]);
    mvP("sambo.seoiThrow", "Cherez spinu completa: gambe che si distendono, busto avanti, il compagno passa sopra la spalla", [
      K(gripBase(P0), 300, 150, null, P0), K(kz1.copy().act("arml", "legl"), 280, 80, null, pFwdArm),
      K(hb2.copy().act("legr"), 240, 30, null, pFwdArm), K(seIn.copy().act("legl", "legr", "armr"), 280, 100, null, pFwdArm),
      K(seLoad.copy().act("arml", "torso"), 260, 100, null, pSeoi), K(seOverMe.copy().act("legl", "legr", "torso"), 260, 40, null, pSeoiOver),
      K(hbEnd.copy().act("arml"), 280, 800, null, pLandH), K(gripBase(P0), 600, 250, null, P0)
    ]);

    /* ------------------------------------------------------------ combinazioni e catene (entrate senza proiettare) */
    const Z3half = Z3.copy();
    // zadnyaya a metà, lui spinge avanti, entri con la perednyaya
    mvP("sambo.comboBackFwd", "Zadnyaya a metà, lui spinge in avanti, ritiri la gamba ed entri con la perednyaya", [
      K(gripBase(P0), 300, 120, null, P0), K(Z2.copy().act("legl"), 280, 40, null, Pback), K(Z3half.copy().act("legr", "arml", "armr"), 260, 250, null, Pback),
      K(gripBase(pFwdArm, { l: "sleeve", r: "lapel" }, ht1.copy().move(0.12, -0.05)).act("legr", "torso"), 260, 40, null, pFwdArm),
      K(pn3.copy().act("legl"), 240, 40, null, pFwdArm), K(pn4.copy().act("legr"), 200, 60, null, pFwdArm), K(pn5.copy().act("arml", "armr", "torso"), 240, 400, null, pTrip),
      K(gripBase(P0), 500, 250, null, P0)
    ]);
    // finta d'anca, lui resiste indietro, attacchi con la zadnyaya
    mvP("sambo.comboFwdBack", "Finta d'anca, lui si inclina indietro, torni di fronte e attacchi con la zadnyaya", [
      K(gripBase(P0), 300, 120, null, P0), K(kz1.copy().act("arml", "legl"), 260, 40, null, pFwdArm), K(hb2.copy().act("legr", "torso"), 260, 250, null, pFwdArm),
      K(Z2.copy().act("legl", "torso"), 300, 40, null, Pback), K(Z3.copy().act("legr"), 240, 60, null, Pback), K(Z4.copy().act("arml", "armr", "torso"), 240, 400, null, pTilt),
      K(gripBase(P0), 500, 250, null, P0)
    ]);
    // spazzata, lui ritira il piede e ricade avanti, proiezione d'anca
    mvP("sambo.comboSweepHip", "Spazzata, lui ritira il piede e ricade avanti: entri subito con la proiezione d'anca", [
      K(meF0, 300, 120, null, PF), K(meF1.copy().act("legr"), 260, 40, null, PF1), K(meSweep.copy().act("legl", "arml", "armr"), 200, 150, null, pSwept),
      K(gripBase(pFwdArm, { l: "sleeve", r: "lapel" }, ht1.copy()).act("legr"), 280, 40, null, pFwdArm), K(hbIn.copy().act("legl", "torso"), 260, 80, null, pFwdArm),
      K(hbLoad.copy().act("arml", "torso"), 260, 400, null, pLoadArm), K(meF0, 500, 250, null, PF)
    ]);
    // zadnyaya a metà, lui spinge avanti, girata bassa con la cherez spinu
    mvP("sambo.comboZadSeoi", "Zadnyaya a metà, lui spinge avanti: girata bassa ed entrata dietro la schiena", [
      K(gripBase(P0), 300, 120, null, P0), K(Z2.copy().act("legl"), 280, 40, null, Pback), K(Z3half.copy().act("legr", "arml", "armr"), 260, 250, null, Pback),
      K(gripBase(pFwdArm, { l: "sleeve", r: "lapel" }, ht1.copy().move(0.12, -0.05)).act("legr", "torso"), 260, 40, null, pFwdArm),
      K(seIn.copy().act("legl", "armr"), 260, 80, null, pFwdArm), K(seLoad.copy().act("arml", "torso"), 260, 400, null, pSeoi),
      K(gripBase(P0), 500, 250, null, P0)
    ]);
    // catene di tre entrate senza tornare in stoika
    mvP("sambo.chainA", "Catena: zadnyaya, perednyaya e proiezione d'anca completa, senza tornare in stoika", [
      K(gripBase(P0), 300, 100, null, P0), K(Z2.copy().act("legl"), 260, 30, null, Pback), K(Z3half.copy().act("legr"), 220, 120, null, Pback),
      K(pn3.copy().act("legr", "legl", "torso"), 300, 30, null, pFwdArm), K(pn4.copy().act("legr"), 200, 120, null, pFwdArm),
      K(hbIn.copy().act("legr", "torso"), 240, 60, null, pFwdArm), K(hbLoad.copy().act("arml", "torso"), 240, 350, null, pLoadArm), K(gripBase(P0), 500, 250, null, P0)
    ]);
    mvP("sambo.chainB", "Catena: podsechka, proiezione d'anca e zadnyaya completa, senza tornare in stoika", [
      K(gripBase(P0), 300, 100, null, P0), K(gripBase(Pback, { l: "sleeve", r: "lapel" }, meSweepIn.copy()).act("legl"), 240, 30, null, Pback),
      K(gripBase(pFwdArm, { l: "sleeve", r: "lapel" }, ht1.copy()).act("legr", "legl"), 260, 30, null, pFwdArm), K(hbIn.copy().act("legl", "torso"), 240, 120, null, pFwdArm),
      K(Z2.copy().act("legl", "torso"), 300, 30, null, Pback), K(Z3.copy().act("legr"), 220, 60, null, Pback), K(Z4.copy().act("arml", "armr", "torso"), 240, 350, null, pTilt), K(gripBase(P0), 500, 250, null, P0)
    ]);
    /* ------------------------------------------------------------ zakhvat dvukh nog (presa delle due gambe) */
    const D2 = 1.0;
    const toW2 = (b) => xf(b, 180, D2, 0);
    const PF2 = toW2(gFP);
    const PF2up = toW2(gFP.copy().handRel("r", 0.2, 0.15, 0.2, "open").handRel("l", 0.22, 0.12, -0.2, "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]));
    const dlFeint = g.copy().step("r", 0.1).shift(0.05).handRel("l", 0.5, 0.12, -0.08, "open").handRel("r", 0.3, -0.05, 0.12, "open").elbow("l", [0, -1, -0.3]);
    const dlShoot = (pb) => {
      const sk = skel(pb);
      const b = P({ pel: [0.52, 0.45, 0.06], chest: [0.74, 0.86, 0.1], head: [0.88, 0.99, 0.24], yaw: -12, fr: [[0.32, ankleY(55), 0.1], -10, 55], kr: [1, -0.6, 0], fl: [[0.05, ankleY(25), -0.22], -20, 25], kl: [0.3, -1, 0] });
      b.hand("r", add(sk.knee.l, [0.1, 0.02, 0.02]), "open").hand("l", add(sk.knee.r, [0.1, 0.02, -0.02]), "open").elbow("l", [-0.3, -0.3, -1]).elbow("r", [-0.3, -0.3, 1]);
      return reachFix(b);
    };
    const dl3 = dlShoot(PF2up);
    const pDl1 = P({ pel: [1.05, 0.72, -0.05], chest: [1.34, 1.08, -0.2], head: [1.45, 1.25, -0.26], face: [-1, 0.4, 0.2], fl: [[0.86, ankleY(0), 0.1], 180, 0], fr: [[0.86, ankleY(0), -0.08], 180, 0], kl: [-1, 0, 0], kr: [-1, 0, 0], hl: [[1.25, 1.35, 0.25], "open"], hr: [[1.15, 1.3, -0.45], "open"], el: [0, -1, 0.3], er: [0, -1, -0.3] });
    const dl4me = P({ pel: [0.62, 0.55, 0.0], chest: [0.86, 0.95, 0.02], head: [0.98, 1.1, 0.14], yaw: -20, fr: flatFoot(0.62, 0.22, -20), kr: [1, 0, 0.2], fl: flatFoot(0.55, -0.2, 0), kl: [1, 0, -0.2] });
    const dl4 = (() => { const sk = skel(pDl1); return reachFix(dl4me.hand("r", add(sk.knee.l, [0.08, 0, 0.04]), "open").hand("l", add(sk.knee.r, [0.08, 0, -0.04]), "open").elbow("l", [-0.3, -0.3, -1]).elbow("r", [-0.3, -0.3, 1])); })();
    const pDlLand = P({ pel: [1.18, 0.13, -0.16], chest: [1.6, 0.15, -0.42], head: [1.76, 0.26, -0.52], face: UP, fl: [[0.75, 0.32, 0.1], 180, -40], fr: [[0.75, 0.32, -0.12], 180, -40], kl: [0, 1, 0], kr: [0, 1, 0], hl: [[1.7, 0.04, -0.05], "open"], hr: [[1.35, 0.04, -0.85], "open"], el: [0, 1, 0], er: [0, 1, 0] });
    const dl5me = P({ pel: [0.55, 0.5, 0.02], chest: [0.95, 0.72, -0.02], head: [1.12, 0.8, 0.0], yaw: -10, fl: [[0.3, 0.065, -0.14], instep], fr: [[0.3, 0.065, 0.16], instep], kl: [1, -1, 0], kr: [1, -1, 0] });
    const dl5 = (() => { const sk = skel(pDlLand); return reachFix(dl5me.hand("r", add(sk.knee.l, [0.0, 0.0, 0.08]), "open").hand("l", add(sk.knee.r, [0.0, 0.0, -0.08]), "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1])); })();
    const dlFrames = [
      K(g, 300, 120, null, PF2), K(dlFeint.copy().act("arml"), 240, 120, null, PF2up), K(lc.copy().act("legl", "legr"), 240, 60, null, PF2up),
      K(dl3.copy().act("legr", "arml", "armr", "head"), 280, 250, null, PF2up), K(dl4.copy().act("legl", "torso"), 300, 60, null, pDl1),
      K(dl5.copy().act("torso"), 300, 700, null, pDlLand), K(g, 600, 250, null, PF2)
    ];
    mvP("sambo.doubleLeg", "Presa delle due gambe: finta, abbassamento, passo tra i suoi piedi, testa di lato, spingi e gira", dlFrames);
    mvP("sambo.doubleLegEntry", "Entrata sulle gambe: passo di penetrazione, testa di lato al fianco, mani dietro le ginocchia", [K(g, 300, 150, null, PF2), K(lc.copy().act("legl", "legr"), 300, 100, null, PF2), K(dl3.copy().act("legr", "arml", "armr", "head"), 320, 900, null, PF2up), K(g, 500, 250, null, PF2)]);

    /* ------------------------------------------------------------ melnitsa (mulino) da in ginocchio */
    const mlKneel = (o) => P(Object.assign({ pel: [0.42, 0.47, -0.06], chest: [0.54, 0.93, -0.14], head: [0.6, 1.1, -0.22], face: [1, 0, -0.1], fr: [[0.05, ankleY(50), 0.12], 0, 50], kr: [1, -0.6, 0], fl: flatFoot(0.36, -0.5, 20), kl: [0.6, 0.4, -1] }, o));
    const pMl = toW(gFP.copy().handRel("r", 0.1, -0.05, 0.42, "open").elbow("r", [0, 0.3, 1]));
    const mlEntry = (() => {
      const b = mlKneel({});
      const sk = skel(pMl);
      b.hand("l", lerp3(sk.elbow.r, sk.hand.r, 0.8), "fist").hand("r", add(sk.knee.r, [0.08, 0.18, 0.06]), "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.6]);
      return reachFix(b);
    })();
    mvP("sambo.melnitsaEntry", "Mulino a vuoto: tirata, ginocchio destro giù tra i suoi piedi, testa sotto la sua ascella", [K(gripBase(PF, { l: "sleeve" }, gF.copy()), 300, 150, null, PF), K(gripBase(PF, { l: "sleeve" }, kd1.copy()).act("legr", "arml"), 250, 60, null, PF), K(mlEntry.copy().act("legr", "legl", "head"), 450, 300, null, pMl), K(mlEntry.copy().act("arml", "armr"), 300, 800, null, pMl), K(gF, 500, 250, null, PF)]);
    // manichino di traverso sulle spalle (testa e braccio a sinistra, gambe a destra), poi rotola giù a sinistra
    const mkC = { pel: [0.0, 0.48, 0.0], chest: [0.04, 0.96, 0.0], head: [0.07, 1.15, 0.0], face: [1, 0, 0], fr: [[-0.4, ankleY(50), 0.12], 0, 50], kr: [1, -0.6, 0], fl: flatFoot(0.0, -0.42, 15), kl: [0.6, 0.4, -1] };
    const pOnSh = P({ pel: [0.0, 1.21, 0.22], chest: [0.02, 1.06, -0.26], head: [0.06, 0.93, -0.44], face: [0.2, -1, 0], fr: [[0.32, 0.78, 0.45], 0, 0], fl: [[0.38, 0.72, 0.3], 0, 0], kr: [0, -1, 0.5], kl: [0, -1, 0.5], hr: [[0.34, 0.82, -0.28], "open"], hl: [[-0.25, 0.7, -0.42], "open"], er: [0, 0, -1], el: [0, 0, -1] });
    const mlCarry = (() => { const b = P(mkC); const sk = skel(pOnSh); b.hand("l", lerp3(sk.elbow.r, sk.hand.r, 0.6), "fist").hand("r", add(sk.knee.r, [-0.05, -0.02, -0.04]), "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -0.5, 1]); return reachFix(b); })();
    const pMlMid = P({ pel: [0.22, 1.0, -0.05], chest: [0.36, 0.62, -0.32], head: [0.4, 0.45, -0.46], face: [0.6, -0.2, 0.6], fr: [[0.3, 1.25, 0.32], 0, 0], fl: [[0.45, 1.15, 0.2], 0, 0], kr: [1, 0, 0], kl: [1, 0, 0], hr: [[0.32, 0.6, -0.05], "open"], hl: [[0.55, 0.3, -0.55], "open"], er: [0, 0, 1], el: [0, 0, -1] });
    const pMlLand = P({ pel: [0.58, 0.13, -0.18], chest: [0.62, 0.15, -0.67], head: [0.64, 0.26, -0.87], face: UP, fr: [[0.5, 0.28, 0.6], 0, -50], fl: [[0.66, 0.22, 0.66], 0, -50], kr: [0, 1, 0], kl: [0, 1, 0], hr: [[0.25, 0.45, -0.5], "open"], hl: [[1.05, 0.04, -0.5], "open"], er: [-1, 0, 0], el: [0, 1, 0] });
    const mlTurn = (pb, o) => { const b = P(Object.assign({}, mkC, o)); return reachFix(grab(b, pb, { l: "cuff" }).handRel("r", 0.3, -0.2, 0.12, "open").elbow("l", [0, -1, -0.4])); };
    mvP("sambo.melnitsaLoad", "In ginocchio con il manichino di traverso sulle spalle, peso sulle spalle e non sul collo", [K(mlCarry, 400, 1400, null, pOnSh)]);
    mvP("sambo.melnitsaRoll", "Ruota spalle e testa a sinistra: il manichino rotola giù alla tua sinistra, tieni la manica", [
      K(mlCarry, 300, 300, null, pOnSh), K(mlTurn(pMlMid, { chest: [0.1, 0.93, -0.06], head: [0.14, 1.11, -0.1], yaw: 25 }).act("torso", "head", "arml"), 350, 0, null, pMlMid),
      K(mlTurn(pMlLand, { chest: [0.2, 0.9, -0.14], head: [0.27, 1.06, -0.2], yaw: 35 }).act("arml"), 300, 800, null, pMlLand), K(mlCarry, 600, 250, null, pOnSh)
    ]);

    /* ------------------------------------------------------------ immobilizzazioni sul manichino (sdraiato sulla schiena) */
    // schema: manichino con il bacino all'origine, testa verso -x, il suo fianco destro verso +z
    const dummy = (o = {}) => P(Object.assign({ pel: [0, 0.12, 0], chest: [-0.5, 0.13, 0], head: [-0.71, 0.15, 0], face: UP, fl: [[0.86, 0.08, -0.15], 0, -75], fr: [[0.86, 0.08, 0.15], 0, -75], kl: [0, 1, 0], kr: [0, 1, 0], hl: [[-0.1, 0.05, -0.32], "open"], hr: [[-0.1, 0.05, 0.32], "open"], el: [0, 1, 0], er: [0, 1, 0] }, o));
    const dm0 = dummy();
    const dmArm = dummy({ hr: [[-0.3, 0.42, 0.5], "open"], er: [0.3, 0.4, 1] }); // braccio destro sotto la tua ascella
    const sbokuPose = (o = {}) => P(Object.assign({ pel: [-0.22, 0.15, 0.36], chest: [-0.45, 0.41, 0.1], head: [-0.6, 0.48, 0.02], face: [-0.94, -0.3, -0.34], yaw: 160,
      fr: [[-0.62, 0.08, 0.66], -150, 0, 70], kr: [-1, 0.6, 0.1], fl: [[0.5, 0.08, 0.86], 30, -20, -60], kl: [0.3, 0.4, 1] }, o));
    const sbokuArms = (b, pb) => { const sk = skel(pb); b.hand("l", lerp3(sk.elbow.r, sk.hand.r, 0.35), "fist").elbow("l", [0.3, -0.5, 1]); b.hand("r", [-0.82, 0.08, -0.12], "open").elbow("r", [-0.2, 0.6, -1]); return reachFix(b); };
    const sbSit = sbokuPose({ chest: [-0.36, 0.62, 0.3], head: [-0.42, 0.81, 0.25], hl: [[-0.3, 0.05, 0.62], "open"], hr: [[-0.62, 0.3, 0.2], "open"] });
    const sbArmOnly = sbokuPose({ chest: [-0.38, 0.56, 0.22], head: [-0.46, 0.74, 0.16] });
    const sbArm = (() => { const b = sbArmOnly.copy(); const sk = skel(dmArm); b.hand("l", lerp3(sk.elbow.r, sk.hand.r, 0.35), "fist").elbow("l", [0.3, -0.5, 1]).hand("r", [-0.6, 0.3, 0.12], "open"); return reachFix(b); })();
    const sbHead = (() => { const b = sbokuPose({ chest: [-0.42, 0.46, 0.14], head: [-0.56, 0.56, 0.06] }); return sbokuArms(b, dmArm); })();
    const sbFull = sbokuArms(sbokuPose(), dmArm);
    const kneelSide = P({ pel: [-0.2, 0.5, 0.48], chest: [-0.3, 0.98, 0.42], head: [-0.34, 1.17, 0.38], face: [0, 0, -1], yaw: 90, fl: [[-0.4, 0.065, 0.85], { dir: [0, 0, 1], down: [0, 1, 0], hint: -90 }], fr: [[0.0, 0.065, 0.85], { dir: [0, 0, 1], down: [0, 1, 0], hint: -90 }], kl: [0, -1, -1], kr: [0, -1, -1], hl: [[-0.25, 0.65, 0.2], "open"], hr: [[-0.1, 0.65, 0.25], "open"] });
    mvG("sambo.sbokuSit", "Siediti al suo fianco destro: il tuo fianco attaccato alle sue costole", [K(kneelSide, 300, 300, null, dm0), K(sbSit.copy().act("legl", "legr", "torso"), 500, 1000, null, dm0), K(kneelSide, 500, 250, null, dm0)]);
    mvG("sambo.sbokuArm", "Il suo braccio destro sotto la tua ascella sinistra, la mano stringe la manica al fianco", [K(sbSit, 300, 300, null, dm0), K(sbArm.copy().act("arml"), 500, 1100, null, dmArm), K(sbSit, 500, 250, null, dm0)]);
    mvG("sambo.sbokuHead", "Il braccio destro passa sotto la sua testa e gli cinge il collo", [K(sbArm, 300, 300, null, dmArm), K(sbHead.copy().act("armr"), 500, 1100, null, dmArm), K(sbArm, 500, 250, null, dmArm)]);
    mvG("sambo.sbokuLegs", "Gambe larghe come un treppiede: destra piegata avanti, sinistra distesa dietro, petto basso", [K(sbHead, 300, 300, null, dmArm), K(sbFull.copy().act("legl", "legr", "torso"), 500, 1100, null, dmArm), K(sbHead, 500, 250, null, dmArm)]);
    const dmBridge = dummy({ pel: [0.02, 0.3, 0.0], hipFace: [0, 1, -0.4], fl: [[0.38, ankleY(0), -0.15], 0, 0], fr: [[0.38, ankleY(0), 0.15], 0, 0], kl: [0, 1, 0], kr: [0, 1, 0], hr: [[-0.3, 0.42, 0.5], "open"], er: [0.3, 0.4, 1] });
    const sbAdapt = sbokuArms(sbokuPose({ pel: [-0.18, 0.15, 0.4], fl: [[0.62, 0.08, 0.72], 30, -20, -60], fr: [[-0.7, 0.08, 0.55], -150, 0, 70] }), dmBridge);
    mvG("sambo.sboku", "Uderzhanie sboku: tieni, e se prova il ponte adatti le gambe senza mollare il braccio", [K(sbFull, 300, 600, null, dmArm), K(sbAdapt.copy().act("legl", "legr"), 400, 600, null, dmBridge), K(sbFull.copy().act("legl", "legr"), 400, 800, null, dmArm)]);
    mvG("sambo.sbokuBuild", "Uderzhanie sboku: siediti al suo fianco, braccio sotto l'ascella, testa, gambe a treppiede", [K(kneelSide, 300, 200, null, dm0), K(sbSit.copy().act("legl", "legr"), 400, 200, null, dm0), K(sbArm.copy().act("arml"), 350, 200, null, dmArm), K(sbHead.copy().act("armr"), 350, 200, null, dmArm), K(sbFull.copy().act("legl", "legr", "torso"), 350, 900, null, dmArm)]);
    // uderzhanie poperek (di traverso) e dalla parte della testa
    const kneeFoot = { dir: [0, 0, 1], down: [0, 1, 0], hint: -90 };
    const poperek = P({ pel: [-0.22, 0.42, 0.44], chest: [-0.3, 0.33, 0.03], head: [-0.31, 0.36, -0.17], face: [0, -1, 0], yaw: 90, fl: [[-0.5, 0.065, 0.78], kneeFoot], fr: [[0.04, 0.065, 0.78], kneeFoot], kl: [0, -1, -0.6], kr: [0, -1, -0.6], hl: [[-0.82, 0.08, -0.08], "open"], hr: [[0.06, 0.1, -0.26], "open"], el: [-0.5, 0.5, 0], er: [0.3, 0.5, 0] });
    const headPose = P({ pel: [-1.18, 0.3, 0.0], chest: [-0.66, 0.31, 0.0], head: [-0.46, 0.34, 0.0], face: [0, -1, 0], yaw: 0, fl: [[-1.98, ankleY(60), -0.26], 0, 60], fr: [[-1.98, ankleY(60), 0.26], 0, 60], kl: [0, -1, 0], kr: [0, -1, 0], hl: [[-0.12, 0.13, -0.24], "open"], hr: [[-0.12, 0.13, 0.24], "open"], el: [0, 0.5, -1], er: [0, 0.5, 1] });
    const walkHead = P({ pel: [-0.92, 0.42, 0.42], chest: [-0.62, 0.33, 0.08], head: [-0.48, 0.36, -0.06], face: [0, -1, 0], yaw: 45, fl: [[-1.25, 0.065, 0.55], { dir: [-0.7, 0, 0.7], down: [0, 1, 0], hint: -135 }], fr: [[-0.75, 0.065, 0.9], { dir: [-0.7, 0, 0.7], down: [0, 1, 0], hint: -135 }], kl: [0, -1, -0.6], kr: [0, -1, -0.6], hl: [[-0.9, 0.08, -0.2], "open"], hr: [[-0.2, 0.1, -0.25], "open"] });
    const dmP = dummy({ hl: [[-0.1, 0.05, -0.32], "open"], hr: [[-0.25, 0.05, 0.36], "open"] });
    mvG("sambo.poperek", "Uderzhanie poperek: petto di traverso sul suo, ginocchia contro fianco e spalla", [K(kneelSide, 300, 200, null, dmP), K(poperek.copy().act("torso", "legl", "legr"), 450, 1500, null, dmP), K(kneelSide, 500, 250, null, dmP)]);
    mvG("sambo.headHold", "Dalla parte della testa: petto sul suo petto, braccia sotto le sue ascelle alla cintura", [K(headPose, 400, 1600, null, dm0)]);
    mvG("sambo.poperekToHead", "Passaggio: petto sul suo, cammini con le ginocchia attorno alla testa", [K(poperek, 300, 300, null, dmP), K(walkHead.copy().act("legl", "legr"), 500, 200, null, dmP), K(headPose.copy().act("legl", "legr", "torso"), 500, 900, null, dm0)]);
    mvG("sambo.headToPoperek", "Dalla testa torni in poperek dall'altra parte, senza staccare il petto", [K(headPose, 300, 300, null, dm0), K(walkHead.copy().mirror().act("legl", "legr"), 500, 200, null, dmP.copy().mirror()), K(poperek.copy().mirror().act("legl", "legr", "torso"), 500, 900, null, dmP.copy().mirror())]);
    mvG("sambo.holdCircle", "Giro delle immobilizzazioni: sboku, poperek, testa, poperek e sboku dall'altra parte", [
      K(sbFull, 300, 600, null, dmArm), K(poperek.copy().act("legl", "legr", "torso"), 500, 600, null, dmP), K(walkHead.copy().act("legl", "legr"), 450, 100, null, dmP),
      K(headPose.copy().act("legl", "legr"), 450, 600, null, dm0), K(walkHead.copy().mirror().act("legl", "legr"), 450, 100, null, dmP.copy().mirror()),
      K(poperek.copy().mirror().act("legl", "legr"), 450, 600, null, dmP.copy().mirror()), K(sbFull.copy().mirror().act("legl", "legr", "torso"), 500, 700, null, dmArm.copy().mirror())
    ]);
    mvG("sambo.holdCircleBack", "Giro all'indietro: sboku a sinistra, poperek, testa, poperek e sboku a destra", [
      K(sbFull.copy().mirror(), 300, 600, null, dmArm.copy().mirror()), K(poperek.copy().mirror().act("legl", "legr", "torso"), 500, 600, null, dmP.copy().mirror()), K(walkHead.copy().mirror().act("legl", "legr"), 450, 100, null, dmP.copy().mirror()),
      K(headPose.copy().act("legl", "legr"), 450, 600, null, dm0), K(walkHead.copy().act("legl", "legr"), 450, 100, null, dmP),
      K(poperek.copy().act("legl", "legr"), 450, 600, null, dmP), K(sbFull.copy().act("legl", "legr", "torso"), 500, 700, null, dmArm)
    ]);
    // dalla proiezione all'immobilizzazione: lo schema del manichino portato dove atterra
    const TH = (b) => xf(b, 66, 0.06, -0.3); // dopo la proiezione d'anca (pLandH)
    const TM = (b) => xf(b, -95, 0.58, -0.18); // dopo il mulino (pMlLand)
    const hbDown = grab(P({ pel: [0.44, 0.55, 0.06], chest: [0.3, 1.0, 0.0], head: [0.24, 1.18, -0.02], yaw: 210, fr: [[0.62, 0.065, 0.12], instep], fl: flatFoot(0.25, 0.3, 230), kr: [-1, -1, 0], kl: [-0.6, 0, 0.6] }), pLandH, { l: "cuff" }).handRel("r", 0.3, -0.25, 0.1, "open");
    const throwFr = [
      K(gripBase(P0), 300, 150, null, P0), K(kz1.copy().act("arml", "legl"), 280, 80, null, pFwdArm),
      K(hb2.copy().act("legr"), 240, 30, null, pFwdArm), K(hbIn.copy().act("legl", "torso", "armr"), 280, 120, null, pFwdArm),
      K(hbLoad.copy().act("arml", "torso"), 250, 100, null, pLoadArm), K(hbOver.copy().act("legl", "legr", "torso", "arml"), 260, 60, null, pOver),
      K(hbEnd.copy().act("arml"), 280, 250, null, pLandH)
    ];
    mvP("sambo.throwToSboku", "Proiezione d'anca, tieni la manica, scendi in uderzhanie sboku e tieni", throwFr.concat([
      K(hbDown.copy().act("legl", "legr"), 300, 80, null, pLandH), K(TH(sbFull).act("legl", "legr", "torso", "armr"), 400, 1500, null, TH(dmArm))
    ]));
    mvP("sambo.melnitsaToSboku", "Il manichino rotola giù, tieni la manica e passa subito in uderzhanie sboku", [
      K(mlCarry, 300, 200, null, pOnSh), K(mlTurn(pMlMid, { chest: [0.1, 0.93, -0.06], head: [0.14, 1.11, -0.1], yaw: 25 }).act("torso", "head"), 350, 0, null, pMlMid),
      K(mlTurn(pMlLand, { chest: [0.2, 0.9, -0.14], head: [0.27, 1.06, -0.2], yaw: 35 }).act("arml"), 300, 250, null, pMlLand),
      K(TM(sbFull).act("legl", "legr", "torso"), 500, 1500, null, TM(dmArm))
    ]);

    /* ------------------------------------------------------------ rychag loktya: la posizione della leva al gomito (senza forza) */
    const dmUp = dummy({ hr: [[-0.5, 0.6, 0.42], "open"], er: [0, 0, 1] });
    const abHands = (b, pb) => { const sk = skel(pb); const w = lerp3(sk.elbow.r, sk.hand.r, 0.8); b.hand("l", add(w, [-0.06, 0.03, 0.02]), "fist").hand("r", add(w, [0.06, 0.03, 0.02]), "fist").elbow("l", [-0.3, -1, 0.2]).elbow("r", [0.3, -1, 0.2]); return reachFix(b); };
    const abStartMe = P({ pel: [-0.45, 0.48, 0.62], chest: [-0.47, 0.95, 0.5], head: [-0.47, 1.13, 0.43], face: [0, -0.2, -1], yaw: 90, fl: flatFoot(-0.66, 0.5, 90), fr: flatFoot(-0.26, 0.52, 90), kl: [0, 0.3, -1], kr: [0, 0.3, -1] });
    const abStart = abHands(abStartMe, dmUp);
    const abStep = abHands(P({ pel: [-0.46, 0.42, 0.52], chest: [-0.47, 0.9, 0.44], head: [-0.47, 1.08, 0.38], face: [0, -0.2, -1], yaw: 90, fl: flatFoot(-0.98, -0.04, 90), kl: [-0.3, 1, -0.6], fr: [[-0.12, 0.065, 0.62], { dir: [0, 0, 1], down: [0, 1, 0], hint: -90 }], kr: [0.2, -0.5, -1] }), dmUp);
    const abSit = abHands(P({ pel: [-0.5, 0.13, 0.4], chest: [-0.5, 0.6, 0.55], head: [-0.5, 0.79, 0.5], face: [0, 0.2, -1], yaw: 90, fl: [[-0.95, 0.09, -0.12], 90, 0, 0], kl: [0.2, 1, -0.3], fr: [[-0.2, 0.09, -0.24], 90, 0, 0], kr: [-0.2, 1, -0.3] }), dmUp);
    const dmBar = dummy({ hr: [[-0.5, 0.26, 0.74], "open"], er: [1, 0, 0] });
    const abRollMe = P({ pel: [-0.5, 0.13, 0.33], chest: [-0.5, 0.15, 0.82], head: [-0.5, 0.24, 1.0], face: [0, 1, -0.2], fl: [[-0.93, 0.1, -0.18], 0, -60], kl: [0.3, 1, 0], fr: [[-0.18, 0.1, -0.3], 0, -60], kr: [-0.3, 1, 0] });
    const abRoll = abHands(abRollMe, dmBar);
    mvA("sambo.armbar", "Posizione della leva al gomito: braccio al petto, stinco sulle costole, gamba sopra la testa, rotola", [K(abStart, 300, 300, null, dmUp), K(abStep.copy().act("legr", "legl"), 400, 200, null, dmUp), K(abSit.copy().act("torso"), 400, 150, null, dmUp), K(abRoll.copy().act("torso", "legl", "legr"), 450, 1500, null, dmBar), K(abSit, 600, 200, null, dmUp), K(abStart, 500, 250, null, dmUp)]);
    mvA("sambo.armbarHold", "Fermo nella posizione: pollice in alto, gomito oltre i fianchi, ginocchia strette, nessuna forza", [K(abRoll, 400, 2200, null, dmBar)]);
    mvA("sambo.armbarHug", "Abbraccia il braccio al petto, stinco destro sulle costole, la gamba sinistra passa sopra la testa", [K(abStart, 300, 400, null, dmUp), K(abStep.copy().act("legr", "legl", "arml", "armr"), 500, 1200, null, dmUp), K(abStart, 500, 250, null, dmUp)]);
    // preparatorio: seduta e rotolata indietro con l'asciugamano stretto al petto
    const abSitPrep = abHands(P({ pel: [-0.5, 0.13, 0.42], chest: [-0.5, 0.6, 0.56], head: [-0.5, 0.79, 0.5], face: [0, 0.2, -1], yaw: 90, fl: flatFoot(-0.6, 0.0, 90), fr: flatFoot(-0.4, 0.0, 90), kl: [0.2, 1, -0.4], kr: [-0.2, 1, -0.4] }), dmUp);
    const abRollPrep = abHands(P({ pel: [-0.5, 0.13, 0.36], chest: [-0.5, 0.15, 0.85], head: [-0.5, 0.25, 1.02], face: [0, 1, -0.2], fl: [[-0.56, 0.5, -0.05], 0, -60], kl: [0.1, 1, 0], fr: [[-0.44, 0.5, -0.05], 0, -60], kr: [-0.1, 1, 0] }), dmBar);
    mvA("sambo.armbarPrep", "Seduta indietro: braccio al petto, sedere attaccato alla spalla, rotola a ginocchia strette", [K(abStart, 300, 300, null, dmUp), K(abSitPrep.copy().act("torso", "legl", "legr"), 450, 200, null, dmUp), K(abRollPrep.copy().act("torso"), 450, 900, null, dmBar), K(abSitPrep, 500, 150, null, dmUp), K(abStart, 500, 250, null, dmUp)]);
    // dall'immobilizzazione poperek alla posizione della leva
    const popIso = abHands(P({ pel: [-0.24, 0.42, 0.46], chest: [-0.36, 0.38, 0.06], head: [-0.4, 0.43, -0.13], face: [0, -0.8, -0.3], yaw: 90, fl: [[-0.5, 0.065, 0.78], kneeFoot], fr: [[0.04, 0.065, 0.78], kneeFoot], kl: [0, -1, -0.6], kr: [0, -1, -0.6] }), dmUp);
    mvA("sambo.poperekToArmbar", "Da poperek isoli il braccio, passi la gamba, ti siedi e rotoli nella posizione della leva", [K(poperek, 300, 400, null, dmP), K(popIso.copy().act("arml", "armr"), 450, 300, null, dmUp), K(abStep.copy().act("legr", "legl"), 450, 150, null, dmUp), K(abSit.copy().act("torso"), 400, 150, null, dmUp), K(abRoll.copy().act("torso", "legl", "legr"), 450, 1300, null, dmBar), K(poperek, 800, 250, null, dmP)]);
    mvP("sambo.chainFull", "Catena completa: proiezione, immobilizzazione, posizione della leva, sempre con la manica", throwFr.concat([
      K(hbDown.copy().act("legl", "legr"), 280, 60, null, pLandH), K(TH(sbFull).act("legl", "legr", "torso"), 380, 700, null, TH(dmArm)),
      K(TH(abStart).act("legl", "legr", "arml", "armr"), 450, 100, null, TH(dmUp)), K(TH(abSit).act("legl", "legr", "torso"), 400, 100, null, TH(dmUp)),
      K(TH(abRoll).act("torso"), 400, 1100, null, TH(dmBar))
    ]));

    /* ------------------------------------------------------------ uscita da sotto: ponte e anca contro il peso */
    const pTop = poperek.copy();
    const meUnder = lieKnees.copy().hand("l", [-0.36, 0.42, 0.18], "open").hand("r", [-0.1, 0.42, 0.32], "open").elbow("l", [0, 0, -1]).elbow("r", [0.3, 0, 1]);
    const meUpa = bridgeTurnL.copy();
    const pTip = P({ pel: [-0.12, 0.72, 0.22], chest: [-0.36, 0.62, -0.22], head: [-0.4, 0.58, -0.42], face: [0, -0.6, -0.8], yaw: 90, fl: [[-0.45, 0.35, 0.55], 0, 0], fr: [[0.0, 0.38, 0.55], 0, 0], kl: [0, -1, -0.5], kr: [0, -1, -0.5], hl: [[-0.75, 0.3, -0.45], "open"], hr: [[0.05, 0.4, -0.45], "open"] });
    const pOff = dummy({ pel: [-0.12, 0.12, -0.72], chest: [-0.6, 0.13, -0.84], head: [-0.8, 0.16, -0.88], fl: [[0.7, 0.12, -0.95], 0, -70], fr: [[0.7, 0.12, -0.65], 0, -70], hl: [[-0.25, 0.05, -1.08], "open"], hr: [[-0.2, 0.05, -0.5], "open"] });
    mvG("sambo.escapeBridge", "Da sotto: ponte esplosivo in diagonale, il peso rotola oltre la spalla, poi rialzati", [K(meUnder, 300, 300, null, pTop), K(meUpa.copy().act("torso", "legl", "legr", "arml", "armr"), 300, 100, null, pTip), K(lieKnees, 350, 200, null, pOff), K(bs1.copy().act("torso"), 400, 200, null, pOff), K(bs2.copy().act("legl", "arml"), 350, 100, null, pOff), K(bs3.copy().act("legl", "legr"), 400, 400, null, pOff)]);
    const meShr = shrimpSide().mirror();
    const meKnee = P({ pel: [0.0, 0.15, -0.24], chest: [-0.48, 0.2, -0.08], head: [-0.68, 0.24, -0.02], face: [0.1, 0.6, 1], fr: [[0.08, 0.34, 0.1], { dir: [0.4, 0, 1], down: [0, -0.3, 1], hint: -60 }], kr: [-0.3, 0.6, 1], fl: [[0.35, ankleY(0), -0.12], 20, 0], kl: [0.3, 1, 0], hl: [[-0.28, 0.4, 0.22], "open"], hr: [[-0.05, 0.4, 0.28], "open"] });
    const pTopPushed = pTop.copy().shift(0, 0.08);
    mvG("sambo.escapeShrimp", "Se il peso resta: uscita d'anca dall'altra parte, mani che spingono, ginocchio in mezzo", [K(meUnder, 300, 300, null, pTop), K(meShr.copy().act("torso", "legl", "arml", "armr"), 400, 300, null, pTopPushed), K(meKnee.copy().act("legr"), 350, 500, null, pTopPushed), K(meUnder, 500, 250, null, pTop)]);
    mvG("sambo.escapeFull", "Uscita completa: ponte in diagonale, uscita d'anca, ginocchio nello spazio, rialzarsi in base", [K(meUnder, 300, 200, null, pTop), K(meUpa.copy().act("torso", "legl", "legr"), 300, 150, null, pTop.copy().shift(0, -0.05).sink(-0.12)), K(meShr.copy().act("torso", "legl", "arml", "armr"), 350, 150, null, pTopPushed), K(meKnee.copy().act("legr"), 300, 200, null, pTopPushed), K(bs1.copy().act("torso"), 400, 150, null, kneelSide), K(bs2.copy().act("legl", "arml"), 350, 80, null, kneelSide), K(bs3.copy().act("legl", "legr"), 400, 400, null, kneelSide)]);

    /* ------------------------------------------------------------ leve alle gambe: riconoscere e uscire (mai provare la leva) */
    const pLeg = P({ pel: [1.15, 0.13, -0.05], chest: [0.98, 0.58, -0.1], head: [0.92, 0.77, -0.1], face: [-1, 0.1, 0], yaw: 180, fl: [[0.38, 0.09, 0.12], 180, 0, 0], fr: [[0.32, 0.09, -0.32], 180, 0, 0], kl: [0, 1, 0], kr: [0, 1, 0], hr: [[0.86, 0.3, -0.12], "open"], hl: [[0.86, 0.38, -0.05], "fist"], er: [0.3, -0.5, -1], el: [0.3, -0.5, 1] });
    const meTrap = P({ pel: [0, 0.13, 0], chest: [-0.12, 0.59, 0], head: [-0.06, 0.78, 0], face: [1, 0.25, 0], fl: [[0.83, 0.36, -0.2], 0, -10], kl: [0.2, 1, 0], fr: flatFoot(0.38, 0.16, 0), kr: [0.2, 1, 0.2], hl: [[-0.32, 0.05, -0.24], "open"], hr: [[-0.32, 0.05, 0.24], "open"] });
    const meSitFwd = P({ pel: [0.05, 0.13, 0], chest: [0.2, 0.6, -0.04], head: [0.3, 0.77, -0.06], face: [1, -0.1, 0], fl: [[0.62, 0.3, -0.18], 0, -35], kl: [0.3, 1, 0], fr: flatFoot(0.4, 0.18, 0), kr: [0.2, 1, 0.2], hl: [[0.62, 0.45, -0.12], "open"], hr: [[0.55, 0.42, 0.1], "open"] });
    const pLegBack = pLeg.copy().set("chest", [1.1, 0.58, -0.08]).set("head", [1.1, 0.78, -0.08]).hand("r", [1.0, 0.32, -0.25], "open").hand("l", [1.05, 0.3, 0.1], "open");
    const mePush = P({ pel: [-0.05, 0.13, 0], chest: [-0.15, 0.6, 0.02], head: [-0.1, 0.79, 0.02], face: [1, 0.2, 0], fl: [[0.32, 0.09, -0.16], 0, -10], kl: [0.3, 1, -0.2], fr: [[0.78, 0.3, 0.06], 0, -40], kr: [0.4, 1, 0.2], hl: [[-0.36, 0.05, -0.24], "open"], hr: [[-0.36, 0.05, 0.24], "open"] });
    mvP("sambo.legDanger", "Pericolo: il piede intrappolato sotto la sua ascella, i suoi fianchi vicini al ginocchio", [K(meTrap, 400, 1600, null, pLeg)]);
    mvP("sambo.legEscape", "Uscita: siediti verso di lui, piede flesso, ritira la gamba piegata, l'altro piede spinge via", [K(meTrap, 300, 300, null, pLeg), K(meSitFwd.copy().act("torso", "legl"), 350, 400, null, pLeg), K(mePush.copy().act("legr", "legl"), 300, 500, null, pLegBack), K(meTrap.copy().set("foot", Object.assign({}, meTrap.p.foot, { l: [0.4, ankleY(0), -0.16] })).set("footPitch", { l: 0, r: 0 }), 450, 250, null, pLegBack)]);
    mvP("sambo.legEscapeFull", "Uscita completa: seduto in avanti, piede flesso, spinta, uscita d'anca e rialzarsi in base", [K(meTrap, 300, 250, null, pLeg), K(meSitFwd.copy().act("torso", "legl"), 300, 250, null, pLeg), K(mePush.copy().act("legr", "legl"), 300, 250, null, pLegBack), K(shrimpSide(0, 0).move(-0.1, -0.2).act("torso"), 450, 150, null, pLegBack), K(bs1.copy().move(-0.35).act("torso"), 400, 150, null, pLegBack), K(bs3.copy().move(-0.35).act("legl", "legr"), 500, 400, null, pLegBack)]);
    /* ------------------------------------------------------------ condizionamento */
    // squat fino alla posizione di carico, poi rotazione delle spalle come a fine proiezione (lati alterni)
    const lsDown = gF.copy().sink(0.24).lean(0.06).handRel("l", 0.34, -0.2, -0.24, "fist").handRel("r", 0.2, -0.28, 0.26, "fist").elbow("l", [0, 0.3, -1]).elbow("r", [0, -0.5, 1]);
    const lsTurn = gF.copy().sink(0.1).turn(40).lean(0.16, 0.04).handRel("l", 0.12, -0.38, -0.25, "fist").handRel("r", 0.3, -0.2, 0.18, "fist").elbow("l", [0, -0.3, -1]).elbow("r", [0, -1, 0.5]).look(20);
    mv("sambo.loadSquat", "Squat fino alla posizione di carico, poi rotazione delle spalle; lati alterni", [K(gF, 300, 120), K(lsDown.copy().act("legl", "legr"), 450, 150), K(lsTurn.copy().act("torso", "arml"), 350, 300), K(gF, 400, 120), K(lsDown.copy().mirror().act("legl", "legr"), 450, 150), K(lsTurn.copy().mirror().act("torso", "armr"), 350, 300), K(gF, 400, 200)]);
    const rowA = gF.copy().handRel("l", 0.52, -0.12, -0.12, "fist").handRel("r", 0.52, -0.12, 0.12, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    const rowB = gF.copy().lean(-0.02).handRel("l", 0.08, -0.28, -0.22, "fist").handRel("r", 0.08, -0.28, 0.22, "fist").elbow("l", [-1, -0.3, -0.3]).elbow("r", [-1, -0.3, 0.3]);
    mv("sambo.bandRow", "Rematore con l'elastico: gomiti stretti che vanno indietro, scapole indietro", [K(rowA, 300, 200), K(rowB.copy().act("arml", "armr", "torso"), 450, 300), K(rowA, 450, 150), K(rowB.copy().act("arml", "armr", "torso"), 450, 300), K(rowA, 450, 200)]);
    const fw = (s) => { const b = standing().handW("l", 0.02, 0.9, -0.26, "fist").handW("r", 0.02, 0.9, 0.26, "fist").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]); return s ? b.foot("l", 0.12, -0.11, 5, 0).foot("r", -0.12, 0.11, -5, 25) : b.foot("l", -0.12, -0.11, 5, 25).foot("r", 0.12, 0.11, -5, 0); };
    mv("sambo.farmerWalk", "Camminata del contadino: borse appese agli asciugamani, presa a pugno, busto dritto", [K(fw(0), 300, 50), K(fw(1).move(0.15).act("legl", "arml", "armr"), 350, 50), K(fw(0).move(0.3).act("legr", "arml", "armr"), 350, 50), K(fw(1).move(0.45).act("legl", "arml", "armr"), 350, 50), K(fw(0).move(0.6).act("legr", "arml", "armr"), 350, 200)]);
    const hollow = P({ pel: [0, 0.12, 0], chest: [-0.48, 0.24, 0], head: [-0.66, 0.34, 0], face: [0.25, 1, 0], fl: [[0.84, 0.3, -0.08], 0, -60], fr: [[0.84, 0.3, 0.08], 0, -60], kl: [0, 1, 0], kr: [0, 1, 0], hl: [[-1.0, 0.5, -0.12], "open"], hr: [[-1.0, 0.5, 0.12], "open"], el: [0, 1, 0], er: [0, 1, 0] });
    mv("sambo.hollowHold", "Barchetta sulla schiena: zona lombare a terra, braccia e gambe distese sollevate", [K(lieKnees, 300, 200), K(hollow.copy().act("torso", "legl", "legr"), 500, 1600), K(lieKnees, 500, 200)]);
    const wrA = standing().foot("l", 0.05, -0.15, 8, 0).foot("r", -0.05, 0.15, -8, 0).handRel("l", 0.34, -0.2, -0.04, "fist").handRel("r", 0.34, -0.2, 0.08, "fist").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
    const wrB = wrA.copy().handRel("l", 0.34, -0.14, -0.04, "fist").handRel("r", 0.34, -0.26, 0.08, "fist").act("arml", "armr");
    const wrC = wrA.copy().handRel("l", 0.34, -0.26, -0.04, "fist").handRel("r", 0.34, -0.14, 0.08, "fist").act("arml", "armr");
    mv("sambo.gripWork", "Lavoro di presa: strizza l'asciugamano o la giacca con le mani a pugno, alternando", [K(wrA, 300, 100), K(wrB, 300, 150), K(wrC, 300, 150), K(wrB, 300, 150), K(wrC, 300, 150), K(wrA, 300, 200)]);
    // trascinare il manichino lungo il materasso
    const dragMe = (dx, s) => { const b = P({ pel: [-0.42 + dx, 0.68, 0.0], chest: [0.0 + dx, 0.92, 0.0], head: [0.16 + dx, 1.04, 0.0], yaw: 0, fl: flatFoot(-0.25 + dx + (s ? 0.12 : 0), -0.2, 5), fr: flatFoot(-0.55 + dx + (s ? 0 : 0.12), 0.2, -5), kl: [1, 0, 0], kr: [1, 0, 0] }); return b; };
    const dragDm = (dx) => xf(dummy({ hl: [[-0.98, 0.3, -0.12], "open"], hr: [[-0.98, 0.3, 0.12], "open"], el: [0, 1, 0], er: [0, 1, 0] }), 0, 1.12 + dx, 0);
    const dragF = (dx, s) => { const pb = dragDm(dx); const b = dragMe(dx, s); const sk = skel(pb); b.hand("l", add(sk.hand.l, [0, 0.04, 0]), "fist").hand("r", add(sk.hand.r, [0, 0.04, 0]), "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]); return [reachFix(b), pb]; };
    const dg = [dragF(0, 0), dragF(-0.15, 1), dragF(-0.3, 0), dragF(-0.45, 1)];
    mvP("sambo.drag", "Trascina il manichino lungo il materasso camminando all'indietro, schiena dritta", [K(dg[0][0], 300, 150, null, dg[0][1]), K(dg[1][0].act("legl", "legr", "arml", "armr"), 400, 80, null, dg[1][1]), K(dg[2][0].act("legl", "legr", "arml", "armr"), 400, 80, null, dg[2][1]), K(dg[3][0].act("legl", "legr", "arml", "armr"), 400, 300, null, dg[3][1])]);
    // giri a carponi attorno al manichino
    const crawlAt = (ph) => xf(L.allFours().set("pel", [-0.3, 0.45, 0]).set("chest", [0.18, 0.5, 0]).set("head", [0.38, 0.6, 0]), ph - 90, -0.71 - 0.92 * Math.cos(ph * DEG), 0.92 * Math.sin(ph * DEG));
    const dmC = dummy();
    mvG("sambo.crawlAround", "A carponi, petto basso, giri attorno al manichino", [K(crawlAt(-90), 300, 100, null, dmC), K(crawlAt(-45).act("arml", "legr"), 450, 50, null, dmC), K(crawlAt(0).act("armr", "legl"), 450, 50, null, dmC), K(crawlAt(45).act("arml", "legr"), 450, 50, null, dmC), K(crawlAt(90).act("armr", "legl"), 450, 200, null, dmC)]);

    /* ------------------------------------------------------------ combat sambo: guardia alta, pugni e lotta */
    const cg = L.box().sink(0.04);
    const cJab = cg.copy().turn(-14).shift(0.04).lean(0.03).straight("l", "head").act("arml");
    const cCross = cg.copy().turn(48).shift(0.07).lean(0.05).straight("r", "head").heel("r", 30).fyaw("r", -12).act("armr", "legr");
    const cLow = cg.copy().sink(0.24).lean(0.1).step("l", 0.04, -0.04).step("r", -0.02, 0.05).act("legl", "legr");
    mv("sambo.cGuard", "Guardia di combat: mani agli zigomi, mento basso, gomiti stretti, ginocchia piegate", [K(standing(), 300, 300), K(cg.copy().act("arml", "armr", "legl", "legr"), 500, 900)]);
    mv("sambo.cJab", "Jab: la mano davanti parte dritta e torna sulla stessa linea, l'altra resta al viso", [K(cg, 300, 200), K(cJab, 160, 220), K(cg, 220, 200), K(cJab, 160, 220), K(cg, 220, 250)]);
    mv("sambo.cCross", "Diretto: il piede dietro ruota, l'anca spinge, la mano dietro va dritta", [K(cg, 300, 200), K(cCross, 180, 240), K(cg, 240, 250)]);
    mv("sambo.cOneTwo", "Uno-due: jab e diretto collegati, poi guardia ferma", [K(cg, 300, 150), K(cJab, 150, 100), K(cg, 140, 30), K(cCross, 170, 220), K(cg, 240, 300)]);
    mv("sambo.cLevel", "Abbassa il livello come per entrare sulle gambe, poi torna su in guardia", [K(cg, 300, 200), K(cLow, 300, 400), K(cg, 350, 250)]);
    mv("sambo.cOneTwoLevel", "Uno-due e abbassamento del livello, poi di nuovo in guardia", [K(cg, 300, 150), K(cJab, 150, 80), K(cg, 140, 30), K(cCross, 170, 120), K(cLow, 260, 300), K(cg, 320, 250)]);
    const cSprawlIn = cg.copy().sink(0.25).lean(0.2).handRel("l", 0.35, -0.35, -0.2, "open").handRel("r", 0.35, -0.35, 0.2, "open");
    mv("sambo.cSprawl", "Sprawl profondo dalla guardia di combat, fianchi giù, testa alta, e di nuovo in guardia", [K(cg, 300, 150), K(cSprawlIn.copy().act("arml", "armr"), 170, 0), K(sprawlP.copy().act("legl", "legr", "torso"), 220, 400), K(cg, 380, 150), K(cJab, 160, 200), K(cg, 220, 200)]);
    mv("sambo.cSprawlBehind", "Sprawl e risposta: giri a quattro zampe come per andargli dietro, poi in guardia", [K(cg, 300, 120), K(sprawlP.copy().act("legl", "legr", "torso"), 300, 250), K(pivot(fours, 45, 0.28).act("legl", "legr"), 380, 30), K(foursT.copy().act("legl", "legr"), 320, 250), K(pivot(cg.copy().move(-0.45), 90, 0.28).act("legl", "legr"), 500, 200), K(cg, 500, 250)]);
    // uno-due e presa delle due gambe (il compagno alza le mani)
    const cgP = (b) => b.copy();
    mvP("sambo.cOneTwoDouble", "Uno-due a vuoto, mentre il diretto torna abbassi il livello ed entri sulle gambe", [
      K(cg, 300, 120, null, PF2), K(cgP(cJab), 150, 60, null, PF2), K(cg, 130, 20, null, PF2up), K(cgP(cCross), 160, 80, null, PF2up),
      K(cLow.copy().act("legl", "legr"), 220, 30, null, PF2up), K(dl3.copy().act("legr", "arml", "armr", "head"), 260, 200, null, PF2up),
      K(dl4.copy().act("legl", "torso"), 300, 60, null, pDl1), K(dl5.copy().act("torso"), 300, 600, null, pDlLand), K(cg, 600, 250, null, PF2)
    ]);
    // diretto, il braccio avvolge il collo, la sinistra prende il braccio, proiezione d'anca
    const PFc = toW(gFP.copy().shift(0.05));
    const cCrossP = cg.copy().turn(48).shift(0.07).lean(0.05).straight("r", [0.64, 1.47, 0.02]).heel("r", 30).fyaw("r", -12).act("armr", "legr");
    const cWrap = grab(cg.copy().turn(40).shift(0.1).heel("r", 25).fyaw("r", -10), pFwd, { l: "sleeve", r: "collar" }).elbow("r", [0.2, 0.5, 1]).act("armr", "arml");
    const chIn = grab(turnBase({}), pFwdArm, { l: "sleeve", r: "collar" }).elbow("l", [0, 0.5, 1]).elbow("r", [0.3, 0.5, -1]);
    const chLoad = grab(hbLoadMe.copy(), pLoadArm, { l: "sleeve", r: "collar" }).elbow("r", [0.3, 0.5, -1]);
    mvP("sambo.cCrossHip", "Diretto, il braccio avvolge il collo, la sinistra prende la manica, proiezione d'anca", [
      K(cg, 300, 120, null, PFc), K(cJab.copy(), 150, 60, null, PFc), K(cg, 140, 30, null, PFc), K(cCrossP, 170, 80, null, PFc),
      K(cWrap, 220, 80, null, pFwd), K(chIn.copy().act("legr", "legl", "torso"), 300, 120, null, pFwdArm), K(chLoad.copy().act("arml", "torso", "legl", "legr"), 280, 450, null, pLoadArm), K(cg, 500, 250, null, PFc)
    ]);
    mvP("sambo.cCrossHipThrow", "Diretto, presa al collo e proiezione d'anca completa: il compagno cade davanti", [
      K(cg, 300, 120, null, PFc), K(cCrossP, 170, 80, null, PFc), K(cWrap, 220, 60, null, pFwd), K(chIn.copy().act("legr", "legl", "torso"), 280, 80, null, pFwdArm),
      K(chLoad.copy().act("arml", "torso"), 260, 80, null, pLoadArm), K(hbOver.copy().act("legl", "legr", "torso"), 260, 60, null, pOver), K(hbEnd.copy().act("arml"), 280, 700, null, pLandH), K(cg, 600, 250, null, PFc)
    ]);

    /* ------------------------------------------------------------ allungamenti e respiro del defaticamento */
    const crossSit = (up = 0) => P({ pel: [0, 0.13, 0], chest: [0.02, 0.63 + up, 0], head: [0.05, 0.83 + up, 0], face: [1, 0, 0], fl: [[0.3, 0.08, 0.14], -60, 0, -70], fr: [[0.26, 0.08, -0.16], 60, 0, 70], kl: [0.5, 0.4, -1], kr: [0.5, 0.4, 1], hl: [[0.32, 0.28, -0.25], "open"], hr: [[0.32, 0.28, 0.25], "open"], el: [0, -1, -0.5], er: [0, -1, 0.5] });
    mv("sambo.crossLegBreath", "Seduto a gambe incrociate: respiri lenti, l'espirazione più lunga dell'inspirazione", [K(crossSit(), 300, 300), K(crossSit(0.02).act("torso"), 1500, 400), K(crossSit(), 2400, 400)]);
    const faA = L.kneel().set("pel", [-0.12, 0.4, 0]).set("chest", [0.3, 0.58, 0]).set("head", [0.46, 0.7, 0]).handW("l", 0.45, 0.04, -0.14, "open").handW("r", 0.45, 0.04, 0.14, "open").elbow("l", [-1, 0, -0.2]).elbow("r", [-1, 0, 0.2]);
    const faB = faA.copy().set("pel", [-0.2, 0.37, 0]).set("chest", [0.25, 0.56, 0]).set("head", [0.39, 0.7, 0]).act("arml", "armr");
    mv("sambo.forearmStretch", "In ginocchio, palmi a terra con le dita verso di te: porta indietro il peso, poi i dorsi", [K(faA, 300, 300), K(faB, 700, 1100), K(faA, 600, 300), K(faB, 700, 900), K(faA, 600, 200)]);
    const kc0 = P({ pel: [0, 0.12, 0], chest: [-0.5, 0.13, 0], head: [-0.71, 0.14, 0], face: UP, fl: [[-0.02, 0.5, -0.1], 0, -40], fr: [[-0.02, 0.5, 0.1], 0, -40], kl: [-0.3, 1, 0], kr: [-0.3, 1, 0], hl: [[-0.15, 0.42, -0.12], "open"], hr: [[-0.15, 0.42, 0.12], "open"] });
    const kcT = (s) => P({ pel: [0, 0.14, 0], chest: [-0.5, 0.13, 0], head: [-0.71, 0.14, 0], face: UP, hipFace: [0, 0.4, s * 1], fl: [[0.15, 0.16, s * 0.42 - 0.05], 0, -20], fr: [[0.15, 0.24, s * 0.42 + 0.05], 0, -20], kl: [-0.5, 0.3, s], kr: [-0.5, 0.3, s], hl: [[-0.45, 0.05, -0.62], "open"], hr: [[-0.45, 0.05, 0.62], "open"] });
    mv("sambo.kneesChestTwist", "Sdraiato: ginocchia al petto, poi torsione lenta con le ginocchia da un lato e dall'altro", [K(lieKnees, 300, 200), K(kc0.copy().act("legl", "legr"), 500, 800), K(kcT(1).act("legl", "legr", "torso"), 700, 1000), K(kc0, 600, 100), K(kcT(-1).act("legl", "legr", "torso"), 700, 1000), K(lieKnees, 600, 200)]);
    mv("sambo.kneesTwist", "Sdraiato, ginocchia piegate che scendono da un lato, spalle a terra; poi dall'altro", [K(lieKnees.copy().hand("l", [-0.45, 0.05, -0.62], "open").hand("r", [-0.45, 0.05, 0.62], "open"), 300, 300), K(kcT(1).act("legl", "legr", "torso"), 800, 1300), K(lieKnees.copy().hand("l", [-0.45, 0.05, -0.62], "open").hand("r", [-0.45, 0.05, 0.62], "open"), 600, 100), K(kcT(-1).act("legl", "legr", "torso"), 800, 1300), K(lieKnees, 600, 200)]);
    const fig4 = P({ pel: [0, 0.12, 0], chest: [-0.5, 0.14, 0], head: [-0.68, 0.24, 0], face: UP, fl: [[0.0, 0.62, -0.12], 0, -40], kl: [-0.2, 1, 0], fr: [[-0.02, 0.48, -0.02], -80, 0, 90], kr: [0, 0.6, 1], hl: [[-0.22, 0.42, -0.2], "open"], hr: [[-0.2, 0.42, 0.0], "open"], el: [0, 0, -1], er: [0, 0, 1] });
    mv("sambo.figure4", "Sdraiato, caviglia destra sul ginocchio sinistro, tira la gamba verso il petto; poi cambia", [K(lieKnees, 300, 200), K(fig4.copy().act("legl", "legr"), 700, 1300), K(lieKnees, 600, 150), K(fig4.copy().mirror().act("legl", "legr"), 700, 1300), K(lieKnees, 600, 200)]);
    const halfF = P({ pel: [0, 0.13, 0], chest: [0.36, 0.45, -0.08], head: [0.52, 0.4, -0.1], face: [1, -0.3, 0], fl: [[0.86, 0.08, -0.12], 0, -75], kl: [0, 1, 0], fr: [[0.2, 0.08, -0.04], -80, 0, 80], kr: [0.2, 0.4, 1], hl: [[0.72, 0.1, -0.15], "open"], hr: [[0.7, 0.12, -0.05], "open"] });
    mv("sambo.halfFold", "Seduto, una gamba distesa e l'altra piegata: piegati sulla gamba distesa, poi cambia", [K(sitLong(), 300, 200), K(halfF.copy().act("torso", "legl"), 800, 1300), K(sitLong(), 600, 150), K(halfF.copy().mirror().act("torso", "legr"), 800, 1300), K(sitLong(), 600, 200)]);
    const door = standing().foot("l", 0.18, -0.14, 0, 0).foot("r", -0.1, 0.14, 0, 0).handW("r", 0.05, 1.7, 0.46, "open").elbow("r", [0.1, -0.5, 1]).twist(-28).handRel("l", 0.2, -0.38, -0.1, "open");
    door.handW("r", 0.05, 1.7, 0.46, "open").elbow("r", [0.1, -0.5, 1]);
    mv("sambo.doorStretch", "Avambraccio allo stipite, gomito all'altezza della spalla: ruota il busto dall'altra parte", [K(standing(), 300, 200), K(door.copy().act("armr", "torso"), 700, 1300), K(standing(), 600, 150), K(door.copy().mirror().act("arml", "torso"), 700, 1300), K(standing(), 600, 200)]);
    const childS = (s) => L.kneel().set("pel", [-0.3, 0.32, 0]).set("chest", [0.16, 0.22, s * 0.1]).set("head", [0.36, 0.13, s * 0.15]).handW("l", 0.58, 0.04, s * 0.38 - 0.1, "open").handW("r", 0.58, 0.04, s * 0.38 + 0.1, "open");
    mv("sambo.childSide", "Posizione del bambino con le braccia allungate prima a destra e poi a sinistra", [K(L.kneel(), 300, 200), K(childS(1).act("torso", "arml", "armr"), 800, 1300), K(childS(-1).act("torso", "arml", "armr"), 800, 1300), K(L.kneel(), 600, 200)]);
    const sq = P({ pel: [0, 0.17, 0], chest: [-0.48, 0.19, 0.02], head: [-0.68, 0.22, 0.02], face: [0, 0, -1], yaw: 0, roll: -90, fr: [[0.62, 0.08, 0.12], { dir: [0, 0, -1], down: [1, 0, 0] }], kr: [0.3, 0, -1], fl: [[-0.08, 0.42, -0.1], { dir: [-0.3, 0.3, -1], down: [-1, 0.3, 0] }], kl: [1, 0, -0.3], hl: [[-0.14, 0.4, -0.16], "open"], hr: [[-0.4, 0.04, 0.0], "open"], el: [-0.5, 0, -1], er: [0, -1, 0] });
    mv("sambo.sideQuad", "Sdraiato sul fianco: prendi la caviglia della gamba sopra e porta il tallone al gluteo", [K(sq, 400, 300), K(sq.copy().act("legl", "arml"), 500, 1400), K(sq.copy().mirror().act("legr", "armr"), 700, 1400)]);
    const fgA = standing().handRel("l", 0.32, -0.2, -0.12, "open").handRel("r", 0.32, -0.2, 0.12, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    const fgB = fgA.copy().handRel("l", 0.32, -0.2, -0.12, "fist").handRel("r", 0.32, -0.2, 0.12, "fist").act("arml", "armr");
    const fgC = standing().handRel("r", 0.45, -0.12, 0.02, "open").handRel("l", 0.36, -0.08, 0.04, "open").elbow("r", [0, -1, 0.3]).elbow("l", [0, -1, -0.5]).act("arml", "armr");
    mv("sambo.fingers", "Apri e chiudi le mani lentamente, poi allunga le dita indietro con l'altra mano", [K(fgA, 300, 200), K(fgB, 400, 200), K(fgA, 400, 200), K(fgB, 400, 200), K(fgA, 400, 200), K(fgC, 500, 1000), K(fgC.copy().mirror(), 600, 1000), K(fgA, 500, 200)]);
    const behind = standing().handPel("r", -0.16, 0.08, -0.02, "open").elbow("r", [-0.2, -1, 1]).handRel("l", 0.12, -0.2, -0.2, "open").act("armr");
    mv("sambo.armBehind", "Mano dietro la schiena all'altezza della vita, il gomito scende verso il fianco; poi l'altra", [K(standing(), 300, 200), K(behind, 600, 1300), K(standing(), 500, 150), K(behind.copy().mirror(), 600, 1300), K(standing(), 500, 200)]);
    const lowL = standing().foot("l", 0.48, -0.12, 0, 0).footAt("r", [-0.55, 0.065, 0.12], 180, 0, 180).knee("r", [0, -1, 0]).set("pel", [-0.05, 0.48, 0]).set("chest", [-0.06, 0.98, 0]).set("head", [-0.05, 1.18, 0]).handW("l", 0.3, 0.62, -0.13, "open").handW("r", 0.28, 0.62, 0.02, "open");
    mv("sambo.lowLunge", "Affondo basso con il ginocchio dietro sul materasso, bacino avanti; poi l'altra gamba", [K(standing(), 300, 150), K(lowL.copy().act("legr", "torso"), 700, 1300), K(standing(), 600, 150), K(lowL.copy().mirror().act("legl", "torso"), 700, 1300), K(standing(), 600, 200)]);
    const xArm = standing().handRel("r", 0.16, 0.02, -0.36, "open").handRel("l", 0.3, -0.05, -0.05, "open").elbow("r", [0, -0.3, 1]).elbow("l", [0, -1, 0]).act("armr");
    mv("sambo.crossArm", "Braccio disteso davanti al petto, tirato con l'altro sopra il gomito; poi cambia", [K(standing(), 300, 150), K(xArm, 600, 1300), K(standing(), 500, 150), K(xArm.copy().mirror(), 600, 1300), K(standing(), 500, 200)]);

    /* ------------------------------------------------------------ tempi singoli, tenute e preparazioni (per i passi degli esercizi) */
    mvP("sambo.gripCircleOnly", "Con la presa giri attorno al compagno a passi scivolati, stessa distanza", [K(circ[0][0], 300, 150, null, circ[0][1]), K(meStepA.copy().act("legl"), 300, 60, null, rotPair(P0, -10)), K(circ[1][0].copy().act("legr"), 280, 100, null, circ[1][1]), K(gripBase(rotPair(P0, -30), { l: "sleeve", r: "lapel" }, rotPair(g, -30).step("l", 0.04, -0.12).shift(0, -0.05)).act("legl"), 300, 60, null, rotPair(P0, -30)), K(circ[2][0].copy().act("legr"), 280, 300, null, circ[2][1]), K(circ[0][0], 600, 250, null, circ[0][1])]);
    mvP("sambo.gripHold", "Presa su manica e bavero in stoika destra, gomiti bassi", [K(g, 300, 200, null, P0), K(meBoth.copy().act("arml", "armr"), 350, 1300, null, P0), K(g, 400, 250, null, P0)]);
    const Pfar2 = facing(gP, D + 0.45);
    mvP("sambo.gripEnter", "Da due passi entri, prendi manica e bavero, tiri la manica, lasci ed esci", [
      K(g, 300, 150, null, Pfar2), K(g.copy().move(0.22).act("legr", "legl"), 250, 40, null, Pfar2), K(gripBase(Pfar2, { l: "sleeve" }, g.copy().move(0.45)).handRel("r", 0.3, -0.12, 0.08, "open").act("arml", "legr"), 220, 40, null, Pfar2),
      K(gripBase(Pfar2, { l: "sleeve", r: "lapel" }, g.copy().move(0.45)).act("armr"), 180, 150, null, Pfar2), K(mePull.copy().move(0.45).act("arml"), 280, 300, null, PtoesArm.copy().move(0.45)), K(g, 450, 250, null, Pfar2)
    ]);
    mv("sambo.lieReady", "Sdraiato sulla schiena, piedi a terra vicino ai glutei", [K(lieKnees, 400, 1400)]);
    mv("sambo.fallBackBase", "Caduta indietro da accosciato con battuta, poi rialzarsi in base", [K(g, 300, 100), K(crouch.copy().act("legl", "legr"), 400, 80), K(sitHeels.copy().act("torso"), 350, 30), K(rollSlap.copy().act("arml", "armr"), 300, 500), K(sitHeels, 400, 50), K(bs1, 350, 150), K(bs2.copy().act("legl", "arml"), 400, 100), K(bs3.copy().act("legl", "legr"), 400, 300)]);
    const fsbFr = (m) => {
      const f = (b) => (m ? b.copy().mirror() : R60(b));
      return [K(f(g), 300, 100), K(f(crouch).act("legl", "legr"), 400, 80), K(f(slideA).act(m ? "legl" : "legr"), 300, 50), K(f(sitHeel).act("torso"), 300, 30), K(f(sideLie).act(m ? "arml" : "armr", "torso"), 300, 500), K(f(sitHeel), 400, 50), K(f(bs1), 350, 150), K(f(bs2).act("legl", "legr"), 400, 100), K(f(bs3).act("legl", "legr"), 400, 300)];
    };
    mv("sambo.fallSideBase", "Caduta laterale a destra con battuta, poi rialzarsi in base", fsbFr(false));
    mv("sambo.fallSideBaseL", "Caduta laterale a sinistra con battuta, poi rialzarsi in base", fsbFr(true));
    mv("sambo.groundChain", "Catena a terra: ponte con rotazione, uscita d'anca, rialzarsi in base", [K(lieKnees, 300, 150), K(bridgeUp.copy().act("torso", "legl", "legr"), 350, 80), K(bridgeTurnL.copy().act("torso", "arml", "armr"), 280, 250), K(lieKnees, 380, 80), K(shrimpSide().act("torso", "legr"), 380, 250), K(bs1, 450, 150), K(bs2.copy().act("legl", "arml"), 400, 100), K(bs3.copy().act("legl", "legr"), 400, 300)]);
    mvP("sambo.kuzushiFwd", "Squilibrio in avanti: passo indietro, manica verso il fianco, lo porti sulle punte", [K(gripBase(P0), 300, 200, null, P0), K(kz1.copy().act("arml", "armr", "legl"), 300, 800, null, pFwdArm), K(gripBase(P0), 400, 250, null, P0)]);
    const pDiag = toW(P({ pel: [0.1, 0.86, 0.05], chest: [0.26, 1.3, 0.14], head: [0.34, 1.48, 0.18], face: [1, -0.2, 0.3], fr: [[0.2, ankleY(25), 0.17], 10, 25], fl: [[-0.15, ankleY(35), -0.17], 10, 35], kr: [1, 0, 0], kl: [1, 0, 0], hl: [[0.36, 1.0, -0.2], "open"], hr: [[0.44, 1.05, 0.25], "open"], el: [0, -1, -0.4], er: [0, -1, 0.4] }));
    const kzD = gripBase(pDiag, { l: "sleeve", r: "lapel" }, g.copy().step("l", -0.1, -0.12).shift(-0.03, -0.05).turn(18));
    kzD.hand("l", add(kzD.p.hand.l, [-0.02, -0.08, -0.02]), "fist").hand("r", add(kzD.p.hand.r, [-0.02, 0.1, -0.06]), "fist");
    mvP("sambo.kuzushiDiag", "Squilibrio in diagonale: passo indietro e di lato, le mani girano come un volante", [K(gripBase(P0), 300, 200, null, P0), K(reachFix(kzD).act("arml", "armr", "legl"), 320, 800, null, pDiag), K(gripBase(P0), 400, 250, null, P0)]);
    mvP("sambo.kuzushiBack", "Squilibrio indietro: spingi in diagonale e lo porti sui talloni", [K(gripBase(P0), 300, 200, null, P0), K(Z1.copy().act("arml", "armr", "torso"), 300, 800, null, Pback), K(gripBase(P0), 400, 250, null, P0)]);
    mvP("sambo.zStep", "Tempo 2: il piede sinistro accanto al suo destro, all'esterno, ginocchio piegato", [K(gripBase(P0), 300, 150, null, P0), K(Z1, 300, 150, null, Pback), K(Z2.copy().act("legl"), 350, 1000, null, Pback), K(gripBase(P0), 450, 250, null, P0)]);
    mvP("sambo.zLeg", "La gamba destra dietro la sua, polpaccio contro polpaccio, ginocchio quasi teso", [K(gripBase(P0), 300, 150, null, P0), K(Z2, 350, 100, null, Pback), K(Z3.copy().act("legr"), 350, 1000, null, Pback), K(gripBase(P0), 450, 250, null, P0)]);
    mvP("sambo.frontalUp", "Stoika frontale: il suo piede destro davanti al tuo sinistro", [K(gF, 400, 1400, null, PF)]);
    mvP("sambo.frontalGrip", "Stoika frontale con le prese su manica e bavero", [K(gF, 300, 200, null, PF), K(meF0.copy().act("arml", "armr"), 350, 1100, null, PF), K(gF, 400, 250, null, PF)]);
    mvP("sambo.sideStepF", "Passo laterale a destra: lui ti segue e sposta il piede", [K(meF0, 300, 200, null, PF), K(meF1.copy().act("legr"), 320, 600, null, PF1), K(meF0.copy().act("legl"), 320, 200, null, PF), K(meF1.copy().act("legr"), 320, 600, null, PF1), K(meF0, 320, 250, null, PF)]);
    mvP("sambo.hipIn", "Entrata d'anca in due passi: piedi dentro i suoi, anca destra oltre la sua", [K(gripBase(P0), 300, 150, null, P0), K(kz1, 280, 80, null, pFwdArm), K(hb2.copy().act("legr"), 250, 40, null, pFwdArm), K(hbIn.copy().act("legl", "torso", "armr"), 300, 1000, null, pFwdArm), K(gripBase(P0), 500, 250, null, P0)]);
    mvP("sambo.hipLoad", "Carico: la manica tira verso la tasca, la destra stringe il fianco, ginocchia piegate", [K(gripBase(P0), 300, 150, null, P0), K(kz1, 280, 60, null, pFwdArm), K(hbIn.copy().act("legl", "legr", "torso"), 320, 150, null, pFwdArm), K(hbLoad.copy().act("arml", "armr", "torso"), 300, 1000, null, pLoadArm), K(gripBase(P0), 500, 250, null, P0)]);
    mvP("sambo.throwHold", "Il manichino passa sopra l'anca: tieni la manica fino alla fine e resta in piedi", [K(hbLoad, 300, 150, null, pLoadArm), K(hbOver.copy().act("legl", "legr", "torso"), 260, 60, null, pOver), K(hbEnd.copy().act("arml"), 280, 1500, null, pLandH), K(gripBase(P0), 600, 250, null, P0)]);
    mv("sambo.penStepUp", "Dal ginocchio a terra: la gamba dietro viene avanti e torni in stoika", [K(ps2, 300, 400), K(ps3.copy().act("legl"), 380, 100), K(g.copy().move(0.75).act("legl", "legr"), 380, 400)]);
    mvP("sambo.dlFeint", "Finta alla manica per fargli alzare le braccia, poi abbassa il livello", [K(g, 300, 150, null, PF2), K(dlFeint.copy().act("arml"), 260, 300, null, PF2up), K(lc.copy().act("legl", "legr"), 320, 600, null, PF2up), K(g, 450, 250, null, PF2)]);
    mvP("sambo.dlGrip", "Le mani si chiudono dietro le sue ginocchia, la spalla preme sulla coscia", [K(lc, 300, 150, null, PF2up), K(dl3.copy().act("arml", "armr"), 380, 1300, null, PF2up), K(g, 500, 250, null, PF2)]);
    mv("sambo.sprawlHold", "Nello sprawl: fianchi bassi, petto pesante, testa alta, peso sulle punte", [K(g, 300, 100), K(sprawlP.copy().act("torso", "legl", "legr"), 300, 1800), K(g, 500, 250)]);
    mv("sambo.sprawlUp", "Dallo sprawl le gambe tornano sotto con un saltello e sei in stoika", [K(sprawlP, 300, 400), K(sprawlIn.copy().act("legl", "legr"), 250, 40), K(g.copy().act("legl", "legr"), 250, 500)]);
    mvP("sambo.downToSboku", "Senza lasciare la manica scendi: ginocchio alle costole e ti siedi in sboku", [K(hbEnd, 300, 300, null, pLandH), K(hbDown.copy().act("legl", "legr"), 350, 100, null, pLandH), K(TH(sbFull).act("legl", "legr", "torso", "armr"), 400, 1600, null, TH(dmArm))]);
    mvG("sambo.underHold", "Sotto, sulla schiena, con il peso di traverso sul petto, piedi vicini ai glutei", [K(meUnder, 400, 1500, null, pTop)]);
    mv("sambo.ownGrip", "La mano sinistra prende il tuo bavero destro, come la presa di un avversario", [K(g, 300, 200), K(brk0.copy().act("arml"), 350, 1300), K(g, 400, 250)]);
    mvP("sambo.pnTurn", "Il destro davanti al suo destro, il sinistro ruota dietro: peso sulla sinistra", [K(gripBase(P0), 300, 150, null, P0), K(kz1, 280, 80, null, pFwdArm), K(hb2.copy().act("legr"), 250, 60, null, pFwdArm), K(pn3.copy().act("legl", "torso"), 300, 1000, null, pFwdArm), K(gripBase(P0), 500, 250, null, P0)]);
    mvP("sambo.pnBlock", "La gamba destra si distende davanti alla sua tibia, piede a terra, ginocchio morbido", [K(gripBase(P0), 300, 150, null, P0), K(kz1, 280, 60, null, pFwdArm), K(pn3, 320, 100, null, pFwdArm), K(pn4.copy().act("legr"), 300, 1000, null, pFwdArm), K(gripBase(P0), 500, 250, null, P0)]);
    mvP("sambo.hipFeint", "Finta d'anca: tirata della manica e prima metà dell'entrata, fianchi che girano", [K(gripBase(P0), 300, 150, null, P0), K(kz1.copy().act("arml"), 280, 80, null, pFwdArm), K(hb2.copy().act("legr", "torso"), 280, 800, null, pFwdArm), K(gripBase(P0), 450, 250, null, P0)]);
    mv("sambo.kneeDropHead", "In ginocchio: la testa va a sinistra come sotto la sua ascella, schiena dritta", [K(g, 300, 150), K(kd1, 250, 60), K(kd2.copy().act("head", "torso"), 450, 1400), K(kd1, 400, 80), K(g, 300, 250)]);
    mv("sambo.kneeDropArms", "Il braccio destro avanti e in basso tra le gambe, la sinistra tira la manica al petto", [K(g, 300, 150), K(kd1, 250, 60), K(kd2.copy().act("arml", "armr"), 450, 1400), K(kd1, 400, 80), K(g, 300, 250)]);
    mvP("sambo.melnitsaArms", "Il suo braccio sopra il tuo collo, tirato al petto; il destro tra le gambe", [K(gripBase(PF, { l: "sleeve" }, gF.copy()), 300, 150, null, PF), K(mlEntry, 450, 200, null, pMl), K(mlEntry.copy().act("arml", "armr"), 300, 1300, null, pMl), K(gF, 500, 250, null, PF)]);
    const abNear = abStartMe.copy().hand("l", [-0.6, 0.55, 0.42], "open").hand("r", [-0.32, 0.55, 0.44], "open").elbow("l", [0, -1, 0.3]).elbow("r", [0, -1, 0.3]);
    mvA("sambo.armbarNear", "Accosciato alla sua destra, all'altezza della spalla; il suo braccio verso l'alto", [K(abNear, 400, 1500, null, dmUp)]);
    mvA("sambo.armbarSquat", "Abbraccia il suo braccio (o l'asciugamano) al petto con le due braccia", [K(abNear, 300, 300, null, dmUp), K(abStart.copy().act("arml", "armr"), 400, 1200, null, dmUp), K(abNear, 400, 250, null, dmUp)]);
    mvA("sambo.armbarPrepHold", "Sulla schiena, braccio stretto al petto e tra le cosce; poi rialzati", [K(abSitPrep, 300, 200, null, dmUp), K(abRollPrep.copy().act("torso", "arml", "armr"), 400, 1600, null, dmBar), K(abSitPrep, 500, 150, null, dmUp), K(abStart, 500, 250, null, dmUp)]);
    mvA("sambo.armbarCheck", "Controlla: pollice in alto, gomito oltre i fianchi, polso stretto al petto", [K(abRoll, 400, 300, null, dmBar), K(abRoll.copy().act("arml", "armr", "legl", "legr"), 300, 1600, null, dmBar)]);
    mvA("sambo.armbarIso", "Da poperek isoli il braccio vicino: lo porti in alto e lo abbracci al petto", [K(poperek, 300, 300, null, dmP), K(popIso.copy().act("arml", "armr"), 450, 1300, null, dmUp), K(poperek, 500, 250, null, dmP)]);
    const meLegFlat = P({ pel: [0, 0.13, 0], chest: [-0.06, 0.61, 0], head: [-0.02, 0.8, 0], face: [1, 0.15, 0], fl: [[0.84, 0.08, -0.14], 0, -75], kl: [0, 1, 0], fr: flatFoot(0.38, 0.16, 0), kr: [0.2, 1, 0.2], hl: [[-0.3, 0.05, -0.24], "open"], hr: [[-0.3, 0.05, 0.24], "open"] });
    const pLegFar = P({ pel: [1.35, 0.13, -0.05], chest: [1.18, 0.6, -0.08], head: [1.12, 0.79, -0.08], face: [-1, 0.1, 0], yaw: 180, fl: [[0.62, 0.09, 0.14], 180, 0, 0], fr: [[0.62, 0.09, -0.36], 180, 0, 0], kl: [0, 1, 0], kr: [0, 1, 0], hr: [[0.8, 0.2, -0.2], "open"], hl: [[0.82, 0.2, -0.06], "open"] });
    mvP("sambo.legHeld", "Seduto, gamba distesa: lui la tiene sullo stinco (il cuscino fa la sua parte)", [K(meLegFlat, 400, 1500, null, pLegFar)]);
    const tapDn = reachFix(meTrap.copy().hand("r", [-0.04, 0.06, 0.33], "open"));
    const tapUp = reachFix(meTrap.copy().hand("r", [-0.02, 0.28, 0.33], "open"));
    mvP("sambo.tap", "Se senti pressione batti subito con la mano: lui lascia", [K(meTrap, 300, 200, null, pLeg), K(tapUp.copy().act("armr"), 150, 0, null, pLeg), K(tapDn.copy().act("armr"), 120, 60, null, pLeg), K(tapUp.copy().act("armr"), 120, 0, null, pLeg), K(tapDn.copy().act("armr"), 120, 300, null, pLeg), K(meTrap, 400, 600, null, pLegBack)]);
    mvP("sambo.cWrap", "Il braccio del diretto non torna: avvolge il collo, la sinistra prende la manica", [K(cg, 300, 150, null, PFc), K(cCrossP, 170, 120, null, PFc), K(cWrap.copy().act("armr", "arml"), 250, 1200, null, pFwd), K(cg, 500, 250, null, PFc)]);
    const stLow = elbowUp(spinMe({ pel: [0.47, 0.55, -0.02], chest: [0.41, 1.03, -0.01], head: [0.37, 1.22, 0] }));
    stLow.handRel("l", 0.34, -0.12, -0.1, "fist").elbow("l", [0, 0.3, 1]);
    mv("sambo.seoiLow", "Ginocchia molto piegate: la cintura scende ben sotto la sua, schiena dritta", [K(g, 300, 150), K(armsT(ht1.copy()), 280, 60), K(stLow.copy().act("legl", "legr"), 450, 1300), K(g, 500, 250)]);
    mv("sambo.seoiElbow", "Il braccio destro si piega, il gomito sale sotto la sua ascella, pugno alla spalla", [K(g, 300, 150), K(st1, 400, 200), K(st1.copy().act("armr"), 250, 1300), K(g, 500, 250)]);
    mvP("sambo.seoiIn", "Girata bassa dentro i suoi piedi, gomito destro alto sotto l'ascella, manica tirata", [K(gripBase(P0), 300, 150, null, P0), K(kz1, 280, 80, null, pFwdArm), K(hb2.copy().act("legr"), 250, 40, null, pFwdArm), K(seIn.copy().act("legl", "legr", "armr", "torso"), 320, 1000, null, pFwdArm), K(gripBase(P0), 500, 250, null, P0)]);
    mvP("sambo.comboBackHip", "Zadnyaya a metà, lui spinge in avanti, entri con la proiezione d'anca", [
      K(gripBase(P0), 300, 120, null, P0), K(Z2.copy().act("legl"), 280, 40, null, Pback), K(Z3half.copy().act("legr", "arml", "armr"), 260, 250, null, Pback),
      K(gripBase(pFwdArm, { l: "sleeve", r: "lapel" }, ht1.copy().move(0.12, -0.05)).act("legr", "torso"), 260, 40, null, pFwdArm),
      K(hbIn.copy().act("legl"), 260, 80, null, pFwdArm), K(hbLoad.copy().act("arml", "torso"), 260, 400, null, pLoadArm), K(gripBase(P0), 500, 250, null, P0)
    ]);

    /* ------------------------------------------------------------ dall'altro lato (a specchio) */
    // rimette la scena com'era prima della rotazione, la specchia e la rigira (extra: giro in piu')
    const mvMirror = (src, name, label, rot, extra = 0) => {
      const m = MM.get(src);
      mv(name, label, m.frames.map((f) => K(xf(xf(B.of(f.pose), -rot).mirror(), rot + extra), f.t, f.h, undefined, f.partner ? xf(xf(B.of(f.partner), -rot).mirror(), rot + extra) : undefined)), m.props ? { props: m.props } : {});
    };
    [["zadnyaya", "Zadnyaya podnozhka a sinistra: piede destro accanto al suo, gamba sinistra dietro"],
      ["hipEntry", "Proiezione d'anca a vuoto a sinistra: entrata in due passi, carico e rotazione"],
      ["hipThrow", "Proiezione d'anca completa a sinistra: il compagno cade davanti, tieni la manica"],
      ["podsechka", "Podsechka a sinistra: il piede destro spazza il suo piede sinistro, mani a volante"],
      ["perednyaya", "Perednyaya a sinistra: ti giri, la gamba sinistra blocca la sua tibia"],
      ["seoiEntry", "Cherez spinu a vuoto a sinistra: girata bassa, gomito sinistro sotto l'ascella"],
      ["comboBackFwd", "A sinistra: zadnyaya a metà, poi perednyaya sulla sua spinta"],
      ["comboFwdBack", "A sinistra: finta d'anca, poi zadnyaya quando si inclina indietro"],
      ["chainA", "Catena a sinistra: zadnyaya, perednyaya e proiezione d'anca"],
      ["chainB", "Catena a sinistra: podsechka, proiezione d'anca e zadnyaya"],
      ["doubleLeg", "Presa delle due gambe dall'altro lato: testa a sinistra del suo fianco"],
      ["melnitsaRoll", "Mulino a sinistra: il manichino rotola giù alla tua destra, tieni la manica"],
      ["throwToSboku", "A sinistra: proiezione d'anca, tieni la manica e scendi in sboku"],
      ["legEscapeFull", "Uscita dalla leva alla gamba con l'altra gamba, poi rialzarsi in base"],
      ["cCrossHip", "Dall'altro lato: diretto sinistro, presa al collo e proiezione d'anca"],
      ["chainFull", "Catena completa a sinistra: proiezione, immobilizzazione, posizione della leva"]
    ].forEach(([n, lab]) => mvMirror("sambo." + n, "sambo." + n + "L", lab, PY));
    [["penStep", "Passo di penetrazione con la gamba sinistra avanti"],
      ["seoiTurn", "Girata bassa dall'altro lato: gomito sinistro alto"],
      ["groundChain", "Catena a terra a sinistra: ponte, uscita d'anca, rialzarsi in base"]
    ].forEach(([n, lab]) => mvMirror("sambo." + n, "sambo." + n + "L", lab, 0));
    mvMirror("sambo.poperekToArmbar", "sambo.poperekToArmbarL", "Dall'altro lato: da poperek isoli il braccio e rotoli nella posizione della leva", PY + GA, 180);
    [["escapeFull", "Uscita da sotto con il peso dall'altro lato: ponte, anca, ginocchio, in piedi"]
    ].forEach(([n, lab]) => mvMirror("sambo." + n, "sambo." + n + "L", lab, PY + GY, 180));
  });
})(typeof window !== "undefined" ? window : globalThis);
