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
        yaw = Math.atan2(dn[2] / s, -dn[0] / s) / DEG;
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
    const brk2 = g.copy().step("r", -0.32, 0.02).fyaw("r", 40).shift(-0.14).turn(-40).handRel("l", 0.24, -0.5, -0.06, "open").handRel("r", 0.26, -0.48, 0.02, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.4]);
    mv("sambo.gripBreak", "Rottura: la destra strappa il polso in basso verso il pollice, passo indietro e spalla indietro", [K(g, 300, 150), K(brk0.copy().act("arml"), 280, 200), K(brk1.copy().act("armr"), 240, 200), K(brk2.copy().act("armr", "arml", "legr", "torso"), 220, 450), K(g, 340, 250)]);
    mv("sambo.gripBreakL", "Rottura dall'altro lato: la sinistra strappa il polso destro", [K(g.copy().mirror(), 300, 150), K(brk0.copy().mirror().act("armr"), 280, 200), K(brk1.copy().mirror().act("arml"), 240, 200), K(brk2.copy().mirror().act("arml", "armr", "legl", "torso"), 220, 450), K(g.copy().mirror(), 340, 250)]);
    // rottura sulla propria giacca, passo avanti e presa sulla giacca appesa (compagno a un passo)
    const Pfar = facing(gP, D + 0.3);
    const brkFar = (b) => b.copy();
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
    void brkFar; void len; void ankleY; void squat; void lieBack; void sitLong; void kneel; void lerp3; void xf;
  });
})(typeof window !== "undefined" ? window : globalThis);
