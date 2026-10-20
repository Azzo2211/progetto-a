/*
 * Progetto A - Difesa: movimenti del taekwondo (prefisso "taekwondo.").
 * Guardia di combattimento WT di lato, sulle punte, mani basse (tkd); posizioni e tecniche dei Taegeuk.
 * Le versioni "...Dx" sono le stesse tecniche partendo dalla guardia destra (a specchio).
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { mv, K, standing, ready, tkd, zenkutsu, kokutsu, add, sub, mul, norm, ankleY, BAG, lieBack, lieFront, sitLong, kneel, allFours, plank, squat, lunge } = L;

    /* ---------------------------------------------------------------- aiuti */
    const other = (s) => (s === "l" ? "r" : "l");
    const sgn = (s) => (s === "r" ? 1 : -1);
    const mAct = (a) => (a ? a.map((x) => x.replace(/(arm|leg)([lr])$/, (m, p, s) => p + (s === "l" ? "r" : "l"))) : a);
    const mirrorFrames = (fr) => fr.map((f) => ({ p: f.p.copy().mirror(), t: f.t, h: f.h, act: mAct(f.act), partner: f.partner ? f.partner.copy().mirror() : undefined }));
    // registra la tecnica e la sua versione dalla guardia destra ("Dx")
    function both(name, label, fr, labelDx, extra) {
      mv(name, label, fr, extra);
      mv(name + "Dx", labelDx, mirrorFrames(fr), extra);
    }
    // aggiunge d gradi a tutte le rotazioni senza spostare nulla (360 = stessa posa: serve per i giri completi)
    function yawAdd(b, d) {
      const p = b.p;
      p.hipYaw += d;
      p.chestYaw += d;
      ["l", "r"].forEach((s) => { if (p.footYaw[s] != null) p.footYaw[s] += d; });
      return b;
    }
    // ruota tutta la figura attorno a un punto del pavimento (coordinate assolute)
    function about(b, d, x, z) { const o = b.p.o; b.p.o = [x, z]; b.spin(d); b.p.o = o; return b; }
    // sposta tutto in alto (salti)
    function air(b, dy) {
      ["pel", "chest", "head"].forEach((k) => { b.p[k] = add(b.p[k], [0, dy, 0]); });
      ["l", "r"].forEach((s) => {
        if (b.p.hand[s]) b.p.hand[s] = add(b.p.hand[s], [0, dy, 0]);
        if (b.p.foot[s]) b.p.foot[s] = add(b.p.foot[s], [0, dy, 0]);
      });
      return b;
    }
    // piede rispetto all'anca della stessa gamba
    function legRel(b, s, off, pole, yaw, pitch, roll) {
      b.p.foot[s] = add(b.hip(s), off);
      if (pole) b.knee(s, pole);
      if (yaw != null) b.p.footYaw[s] = yaw;
      if (pitch != null) b.p.footPitch[s] = pitch;
      if (roll != null) b.p.footRoll[s] = roll;
      return b;
    }
    // gamba distesa verso un punto: dx avanti, H altezza della caviglia, dz di lato
    function legAim(b, s, dx, H, dz, k = 0.85) {
      const hp = b.hip(s);
      b.p.foot[s] = add(hp, mul(norm([dx, H - hp[1], dz]), k));
      return b;
    }
    // guarda verso il bersaglio (avanti, +x) girando la testa rispetto al petto
    const eyes = (b, max = 80) => b.look(Math.max(-max, Math.min(max, -b.p.chestYaw)));
    // mano appoggiata a una sedia o al muro immaginari (coordinate assolute)
    const prop = (b, s, x, y, z) => b.hand(s, [x, y, z], "open").elbow(s, [0, -1, 0]);

    /* ---------------------------------------------------------------- guardia e passi */
    const g = tkd().look(30); // guardia sinistra: di lato, sulle punte, mani basse, sguardo al bersaglio
    const gD = g.copy().mirror(); // guardia destra
    const st = () => standing();

    const bUp = air(g.copy().heel("l", 22).heel("r", 24), 0.035);
    const bDn = g.copy().sink(0.025);
    const bounceFr = (n = 3, end = 150) => {
      const fr = [K(g, 200, 30)];
      for (let i = 0; i < n; i += 1) fr.push(K(bUp, 150, 20), K(bDn, 140, 20));
      fr.push(K(g, 150, end));
      return fr;
    };
    mv("taekwondo.bounce", "Saltello di base: piccoli rimbalzi sugli avampiedi, ginocchia morbide, mani basse", bounceFr(3));
    mv("taekwondo.guard", "Guardia WT: di lato, peso sugli avampiedi, talloni staccati, mani davanti al corpo", [K(g, 300, 1100)]);

    const fw1 = g.copy().step("l", 0.17).shift(0.08).act("legl");
    const fw2 = g.copy().move(0.17).act("legr");
    mv("taekwondo.stepFwd", "Passo avanti: il dietro spinge, l'avanti scivola e il dietro lo segue subito", [K(g, 250, 120), K(fw1, 200, 60), K(fw2, 180, 250)]);
    const bk1 = g.copy().step("r", -0.17).shift(-0.08).act("legr");
    const bk2 = g.copy().move(-0.17).act("legl");
    mv("taekwondo.stepBack", "Passo indietro: il piede dietro arretra e l'avanti lo segue, stessa distanza", [K(g, 250, 120), K(bk1, 200, 60), K(bk2, 180, 250)]);
    // indietro di d partendo da una guardia b (dietro = lato "rear"): due fotogrammi
    const backSteps = (b, d, rear) => [K(b.copy().step(rear, -d).shift(-d / 2).act(), 220, 40), K(b.copy().move(-d), 200, 120)];
    const sl1 = g.copy().step("r", 0.3).heel("r", 25).shift(0.15).act("legr");
    const sl2 = g.copy().move(0.3).act("legl");
    mv("taekwondo.slideStep", "Passo scivolato: il piede dietro raggiunge il tallone avanti, che subito avanza", [K(g, 250, 100), K(sl1, 200, 40), K(sl2, 170, 250), ...backSteps(g.copy().move(0.3), 0.3, "r")]);
    mv("taekwondo.exitBack", "Uscita: passo indietro lungo in guardia, mani che restano davanti", [K(g, 250, 80), K(g.copy().step("r", -0.3).shift(-0.15).act("legr"), 200, 40), K(g.copy().move(-0.3).act("legl"), 180, 300)]);
    const sd1 = g.copy().step("r", 0.02, 0.28).shift(0.0, 0.14).act("legr");
    const sd2 = g.copy().move(0.02, 0.28).act("legl");
    mv("taekwondo.exitSide", "Uscita di lato: il piede dietro si sposta di fianco e l'altro lo segue", [K(g, 250, 80), K(sd1, 200, 40), K(sd2, 180, 300)]);

    // cambio di guardia saltato: i piedi si scambiano a mezz'aria
    const swAir = st().set("pel", [0, 0.96, 0.0]).set("chest", [0.03, 1.45, 0]).set("head", [0.06, 1.65, 0]).set("hipYaw", 0).set("chestYaw", 0);
    swAir.footAt("l", [0.03, 0.13, -0.13], 0, 25).footAt("r", [-0.03, 0.13, 0.13], 0, 25).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]).guard("low").act("legl", "legr");
    mv("taekwondo.switchJump", "Cambio di guardia saltato: piccolo salto, i piedi si scambiano, atterri sugli avampiedi", [K(g, 200, 60), K(swAir, 150, 0), K(gD, 150, 260), K(swAir, 150, 0), K(g, 150, 260)]);

    /* ---------------------------------------------------------------- caricamento e calcio frontale */
    // ginocchio su davanti (caricamento frontale), dita tirate indietro
    function frontChamber(base, s, dz = 0) {
      const b = base.copy().kick(s, "front", "chamber", "mid", { arms: "low" });
      legRel(b, s, [0.18, -0.2, -sgn(s) * 0.02 + dz], [1, 1, dz * 2], b.p.footYaw[s], 30, 0);
      return b.act("leg" + s);
    }
    function frontExt(base, s, H) {
      const b = base.copy().kick(s, "front", "ext", H, { arms: "low" });
      return b.act("leg" + s);
    }
    const apCh = frontChamber(g, "r");
    const apEx = frontExt(g, "r", 1.0);
    const apFr = (tc = 180, th = 40, te = 140, he = 160) => [K(g, 280, 120), K(apCh, tc, th), K(apEx, te, he), K(apCh, 140, 40), K(g, 200, 260)];
    both("taekwondo.apChagi", "Ap chagi: ginocchio su, gamba che schiocca alla cintura, ritorno piegato e piede dietro", apFr(),
      "Ap chagi dalla guardia destra: calcia la gamba sinistra, dietro");
    mv("taekwondo.apChagiFast", "Ap chagi veloce: il ritorno è rapido come l'andata", [K(g, 250, 80), K(apCh, 150, 10), K(apEx, 110, 90), K(apCh, 100, 10), K(g, 150, 220)]);
    mv("taekwondo.apChagiPause", "Ap chagi con pausa: fermo mezzo secondo in caricamento, poi distendi", [K(g, 280, 120), K(apCh, 200, 500), K(apEx, 140, 200), K(apCh, 140, 60), K(g, 200, 260)]);
    mv("taekwondo.apFour", "Ap chagi in quattro tempi: caricamento, distensione, ritorno, piede giù", [K(g, 300, 200), K(apCh, 300, 600), K(apEx, 250, 600), K(apCh, 250, 600), K(g, 300, 400)]);
    // gamba avanti: piccolo saltello di aggiustamento (il piede dietro avanza) e calcio, il piede torna avanti
    const gHop = g.copy().step("r", 0.14).shift(0.06);
    const apChL = frontChamber(gHop, "l");
    const apExL = frontExt(gHop, "l", 1.0);
    mv("taekwondo.apChagiFront", "Ap chagi di gamba avanti: saltello di aggiustamento, calcio e piede che torna avanti", [K(g, 250, 80), K(air(gHop.copy(), 0.03).act("legr"), 130, 10), K(apChL, 150, 30), K(apExL, 130, 160), K(apChL, 130, 30), K(gHop, 150, 60), K(g, 220, 220)]);

    // caricamento tenuto
    const chamberFr = (hold) => [K(g, 280, 120), K(apCh, 260, hold), K(g, 300, 300)];
    both("taekwondo.chamber", "Caricamento: ginocchio sopra la cintura, tallone vicino al gluteo, busto dritto", chamberFr(700),
      "Caricamento della gamba sinistra dalla guardia destra");
    mv("taekwondo.chamberHold", "Caricamento tenuto fermo: busto verticale, ginocchio d'appoggio morbido", chamberFr(2400));
    const CH = [0.2, 0.9, -0.34]; // schienale della sedia (mano sinistra)
    const onChair = (b) => prop(b.copy(), "l", CH[0], CH[1], CH[2]);
    const chairG = onChair(g);
    const chairCh = onChair(apCh);
    mv("taekwondo.chairStance", "Di fianco alla sedia: mano sullo schienale, in guardia con la gamba che lavora dietro", [K(g, 300, 200), K(chairG.copy().act("arml"), 400, 900)]);
    mv("taekwondo.chairChamber", "Alla sedia: ginocchio su davanti in meno di mezzo secondo e tieni", [K(chairG, 300, 200), K(chairCh, 300, 1300), K(chairG, 350, 300)]);
    mv("taekwondo.chairChamberHold", "Alla sedia: caricamento tenuto fermo, busto dritto, ginocchio d'appoggio morbido, sguardo avanti", [K(chairG, 300, 150), K(chairCh, 300, 2600), K(chairG, 350, 250)]);
    const chairApEx = onChair(apEx);
    mv("taekwondo.chairApExt", "Alla sedia, tempo 2: dal caricamento la gamba si distende alla cintura, colpisce con l'avampiede", [K(chairG, 300, 150), K(chairCh, 300, 400), K(chairApEx, 220, 1000), K(chairCh, 250, 300), K(chairG, 300, 250)]);
    mv("taekwondo.chairApFour", "Alla sedia, ap chagi in quattro tempi: su, fuori, indietro, giù", [K(chairG, 300, 200), K(chairCh, 300, 600), K(chairApEx, 250, 600), K(chairCh, 250, 600), K(chairG, 300, 400)]);

    /* ---------------------------------------------------------------- circolari: dollyo e bandal */
    const DEG = Math.PI / 180;
    // phase "chamber" = perno e ginocchio orizzontale puntato al bersaglio; "ext" = gamba tesa
    // o: hip/chest/sup (gradi, verso del calcio), dz (quanto la gamba incrocia), roll (collo del piede)
    function roundPose(base, s, phase, H, o = {}) {
      const ss = sgn(s);
      const sup = other(s);
      const ext = phase === "ext";
      const b = base.copy().kick(s, "round", ext ? "ext" : "chamber", H);
      const hip = o.hip != null ? o.hip : ext ? 95 : 75;
      const chest = o.chest != null ? o.chest : ext ? 62 : 45;
      b.set("hipYaw", ss * hip).set("chestYaw", ss * chest).fyaw(sup, ss * (o.sup != null ? o.sup : ext ? 150 : 130));
      if (ext) {
        const dz = o.dz != null ? o.dz : 0.16;
        legAim(b, s, 0.85, H, -ss * dz, o.k || 0.85);
        const hp = b.hip(s);
        b.p.footYaw[s] = (ss * Math.atan2(dz, 0.85)) / DEG;
        b.p.footPitch[s] = -Math.atan2(H - hp[1], 0.85) / DEG + 8;
        b.p.footRoll[s] = ss * (o.roll != null ? o.roll : 80);
        b.knee(s, [0, 0.3, -ss]);
      } else {
        legRel(b, s, [0.22, 0.03, ss * 0.3], [1, 0.2, -ss * 0.6], -ss * 120, 10, ss * 80);
      }
      eyes(b);
      return b.act("leg" + s);
    }
    const dlCh = roundPose(g, "r", "chamber", 1.0);
    const dlEx = roundPose(g, "r", "ext", 1.0);
    both("taekwondo.dollyoChagi", "Dollyo chagi: ginocchio su, perno completo, gamba tesa in orizzontale, collo del piede",
      [K(g, 280, 100), K(apCh, 170, 20), K(dlCh, 150, 20), K(dlEx, 140, 180), K(dlCh, 150, 30), K(g, 220, 250)],
      "Dollyo chagi dalla guardia destra: calcia la gamba sinistra");
    mv("taekwondo.dollyoFour", "Dollyo chagi in quattro tempi: ginocchio su, perno, distensione, ritorno", [K(g, 300, 200), K(apCh, 300, 600), K(dlCh, 300, 700), K(dlEx, 250, 700), K(dlCh, 250, 500), K(g, 300, 400)]);
    mv("taekwondo.dollyoHold", "Dollyo chagi tenuto: busto inclinato di lato, testa sopra l'appoggio, mani in guardia", [K(g, 280, 100), K(apCh, 200, 30), K(dlCh, 200, 30), K(dlEx, 220, 1200), K(dlCh, 220, 60), K(g, 260, 250)]);
    const chairDlCh = onChair(dlCh);
    mv("taekwondo.chairPivot", "Alla sedia: ginocchio su, perno sull'avampiede e ginocchio orizzontale, tieni", [K(chairG, 300, 200), K(chairCh, 300, 500), K(chairDlCh, 400, 1300), K(chairCh, 350, 300), K(chairG, 300, 300)]);
    mv("taekwondo.chairPivotHold", "Alla sedia: tieni 3 secondi, anca sopra l'appoggio, mani in guardia, poi torna sullo stesso percorso", [K(chairG, 300, 150), K(chairCh, 300, 200), K(chairDlCh, 400, 2600), K(chairCh, 400, 200), K(chairG, 350, 250)]);
    mv("taekwondo.chairDollyo", "Alla sedia, dollyo in quattro tempi: su, perno, distensione, ritorno e giù", [K(chairG, 300, 200), K(chairCh, 300, 500), K(chairDlCh, 300, 600), K(onChair(dlEx), 250, 600), K(chairDlCh, 250, 500), K(chairG, 300, 300)]);
    // atterra avanti in guardia destra, poi il piede avanti torna dietro
    const gDF = gD.copy().move(0.48, 0.0);
    const landMid = (from, to) => { const m = new L.B(L.F.lerpPose(from.done(), to.done(), 0.5)); return m; };
    const stepHome = (from, to, side) => { const m = landMid(from, to); m.p.foot[side] = add(m.p.foot[side], [0, 0.1, 0]); return [K(m.act(), 170, 0), K(to.copy(), 160, 200)]; };
    mv("taekwondo.dollyoLandFwd", "Dollyo e appoggio avanti in guardia destra, poi il piede torna dietro", [K(g, 280, 100), K(apCh, 170, 20), K(dlCh, 150, 20), K(dlEx, 140, 150), K(dlCh, 150, 20), K(gDF.copy().act("legr"), 220, 300), ...stepHome(gDF, g, "r")]);

    // bandal: il ginocchio sale dritto davanti in diagonale, l'anca gira solo all'ultimo, perno ridotto
    function bandalCh(base, s, hip) {
      const b = base.copy().kick(s, "front", "chamber", "mid", { arms: "low", hipYaw: hip });
      legRel(b, s, [0.18, -0.18, -sgn(s) * 0.06], [1, 1, -sgn(s) * 0.4], b.p.footYaw[s], 30, 0);
      return b.act("leg" + s);
    }
    const BND = { hip: 60, chest: 36, sup: 90, dz: 0.12, roll: 55 };
    const bnCh = bandalCh(g, "r", 15);
    const bnEx = roundPose(g, "r", "ext", 1.05, BND);
    const bnFr = (tc = 160, te = 130, he = 140) => [K(g, 250, 80), K(bnCh, tc, 10), K(bnEx, te, he), K(bnCh, 130, 10), K(g, 180, 240)];
    both("taekwondo.bandalChagi", "Bandal chagi: ginocchio su in diagonale, giro d'anca all'ultimo, schiocco al corpetto",
      bnFr(), "Bandal chagi dalla guardia destra: calcia la gamba sinistra");
    mv("taekwondo.bandalFast", "Bandal veloce: schiocco e ritorno immediato in guardia", [K(g, 220, 50), K(bnCh, 130, 0), K(bnEx, 110, 80), K(bnCh, 100, 0), K(g, 140, 200)]);
    const bnHi = roundPose(g, "r", "ext", 1.3, BND);
    mv("taekwondo.bandalHigh", "Bandal un poco più alto, solo fin dove resta pulito", [K(g, 250, 80), K(bnCh, 170, 10), K(bnHi, 140, 160), K(bnCh, 140, 10), K(g, 200, 250)]);
    mv("taekwondo.bandalKnee", "Bandal, partenza: dal saltello il ginocchio sale veloce davanti, in diagonale", [...bounceFr(1, 40), K(bnCh, 170, 700), K(g, 250, 250)]);
    mv("taekwondo.bandalSlow", "Bandal lento fino alla distanza: a gamba tesa il collo del piede sfiora il bersaglio", [K(g, 280, 120), K(bnCh, 300, 200), K(bnEx, 500, 1000), K(bnCh, 300, 100), K(g, 300, 250)]);
    mv("taekwondo.bandalBounce", "Bandal dal saltello continuo: il calcio parte senza fermare il ritmo", [...bounceFr(2, 0), K(bnCh, 140, 10), K(bnEx, 120, 120), K(bnCh, 120, 10), K(bUp, 150, 20), K(bDn, 140, 20), K(g, 150, 150)]);
    const bnLand = [K(gDF.copy().act("legr"), 200, 280), ...stepHome(gDF, g, "r")];
    mv("taekwondo.bandalLandFwd", "Bandal e appoggio avanti in guardia destra, poi rientro in guardia sinistra", [K(g, 250, 80), K(bnCh, 160, 10), K(bnEx, 130, 130), K(bnCh, 130, 10), ...bnLand]);
    // gamba avanti: saltello (il dietro avanza) e bandal di gamba avanti
    const BNDL = { hip: 105, chest: 80, sup: 140, dz: 0.04, roll: 55 };
    const bnChL = bandalCh(gHop, "l", -85);
    const bnExL = roundPose(gHop, "l", "ext", 1.05, BNDL);
    both("taekwondo.bandalFront", "Calcio veloce: piccolo saltello e bandal di gamba avanti, il busto non sale",
      [K(g, 230, 60), K(air(gHop.copy(), 0.03).act("legr"), 120, 0), K(bnChL, 120, 10), K(bnExL, 110, 140), K(bnChL, 110, 10), K(gHop, 130, 40), K(g, 200, 220)],
      "Calcio veloce di gamba avanti dalla guardia destra");
    // passo scivolato: il dietro scivola fin quasi al tallone avanti e la gamba avanti calcia
    const gSl = g.copy().step("r", 0.3).heel("r", 22).shift(0.15);
    const gFw = g.copy().move(0.3);
    const slideIn = K(gSl.copy().act("legr"), 170, 0);
    const bnChS = bandalCh(gSl, "l", -85);
    const bnExS = roundPose(gSl, "l", "ext", 1.05, BNDL);
    both("taekwondo.slideBandal", "Passo scivolato e bandal di gamba avanti, piede giù e passo indietro",
      [K(g, 250, 60), slideIn, K(bnChS, 120, 10), K(bnExS, 120, 150), K(bnChS, 120, 10), K(gFw.copy().act("legl"), 170, 120), ...backSteps(gFw, 0.3, "r")],
      "Passo scivolato e bandal di gamba avanti dalla guardia destra");

    /* ---------------------------------------------------------------- laterale (yeop chagi) */
    function sidePose(base, s, phase, H = 1.0) {
      const b = base.copy().kick(s, "side", phase, H, { arms: "low" });
      if (phase !== "ext") legRel(b, s, [0.17, -0.12, -sgn(s) * 0.12], [0.2, 1, -sgn(s) * 0.8], sgn(s) * 90, 30, 0);
      return b.act("leg" + s);
    }
    const ypCh = sidePose(g, "r", "chamber");
    const ypEx = sidePose(g, "r", "ext", 1.0);
    both("taekwondo.yopChagi", "Yop chagi: caricamento al petto e perno, spinta in linea con taglio e tallone, ritorno",
      [K(g, 280, 100), K(ypCh, 200, 40), K(ypEx, 170, 220), K(ypCh, 170, 40), K(g, 240, 250)],
      "Yop chagi dalla guardia destra: calcia la gamba sinistra");
    mv("taekwondo.yopChamber", "Caricamento del laterale: ginocchio al petto, piede di taglio, tallone d'appoggio al bersaglio", [K(g, 280, 120), K(ypCh, 320, 1200), K(g, 320, 300)]);
    mv("taekwondo.yopHold", "Yop chagi tenuto: linea tallone-anca-spalla, sguardo sopra la spalla", [K(g, 280, 100), K(ypCh, 220, 60), K(ypEx, 260, 1200), K(ypCh, 220, 60), K(g, 260, 250)]);
    const ypChS = sidePose(gSl, "l", "chamber");
    const ypExS = sidePose(gSl, "l", "ext", 1.0);
    mv("taekwondo.slideYop", "Passo scivolato e laterale di gamba avanti: il calcio d'arresto",
      [K(g, 250, 60), slideIn, K(ypChS, 140, 20), K(ypExS, 140, 180), K(ypChS, 140, 20), K(gFw.copy().act("legl"), 170, 120), ...backSteps(gFw, 0.3, "r")]);
    const ypChL = sidePose(gHop, "l", "chamber");
    const ypExL = sidePose(gHop, "l", "ext", 1.0);
    mv("taekwondo.yopFront", "Laterale veloce di gamba avanti: caricamento e spinta in un tempo", [K(g, 230, 60), K(gHop.copy().act("legr"), 120, 0), K(ypChL, 120, 10), K(ypExL, 130, 160), K(ypChL, 120, 10), K(gHop, 130, 40), K(g, 200, 220)]);
    // al muro (o alla sedia): fianco al muro, mano sul muro, la gamba lontana calcia dalla parte opposta
    const wallG = gD.copy().handHead("l", -0.05, -0.25, -0.05, "open");
    const WALL = [-0.64, 1.28, -0.12];
    const onWall = (b, y = WALL[1], x = WALL[0]) => prop(b.copy(), "l", x, y, WALL[2]);
    const ypChW = sidePose(gD, "r", "chamber");
    const ypHalfW = sidePose(gD, "r", "ext", 0.85);
    legAim(ypHalfW, "r", 0.85, 0.85, 0, 0.62);
    mv("taekwondo.wallYopChamber", "Al muro: ginocchio al petto, piede di taglio, perno, tieni e distendi a metà", [K(onWall(wallG), 300, 200), K(onWall(ypChW), 350, 1000), K(onWall(ypHalfW), 450, 500), K(onWall(ypChW), 350, 200), K(onWall(wallG), 350, 300)]);
    const ypChW0 = ypChW.copy().fyaw("l", wallG.p.footYaw.l).look(10);
    const ypChW1 = ypChW.copy().fyaw("l", 168).look(-80);
    mv("taekwondo.wallStance", "Fianco al muro a un braccio di distanza, mano sul muro, il bersaglio dall'altra parte", [K(onWall(wallG), 300, 1200)]);
    mv("taekwondo.wallKnee", "Al muro: ginocchio della gamba lontana al petto, piede flesso di taglio, tallone più alto delle dita", [K(onWall(wallG), 300, 200), K(onWall(ypChW0).act("legr"), 400, 1100), K(onWall(wallG), 400, 300)]);
    mv("taekwondo.wallPivot", "Al muro: perno sul piede d'appoggio finché il tallone punta al bersaglio, sguardo sopra la spalla", [K(onWall(wallG), 300, 150), K(onWall(ypChW0), 350, 200), K(onWall(ypChW1).act("legl", "head"), 450, 1100), K(onWall(ypChW0), 400, 100), K(onWall(wallG), 350, 250)]);
    const ypLowW = sidePose(gD, "r", "ext", 0.55);
    mv("taekwondo.yopHoldLow", "Tenuta del laterale alla sedia: gamba di lato all'altezza del ginocchio, piede di taglio", [K(onWall(wallG, 0.98, -0.5), 300, 150), K(onWall(ypChW, 0.98, -0.5), 320, 100), K(onWall(ypLowW, 0.98, -0.5), 350, 1500), K(onWall(ypChW, 0.98, -0.5), 320, 100), K(onWall(wallG, 0.98, -0.5), 320, 250)]);

    /* ---------------------------------------------------------------- ascia (naeryo chagi) */
    function axePose(base, s, phase) {
      const ss = sgn(s);
      const b = base.copy().kick(s, "axe", "ext", 1.3, { arms: "low" });
      if (phase === "knee") legRel(b, s, [0.25, -0.04, -ss * 0.03], [0.5, 1, 0], 0, 25, 0);
      else if (phase === "top") { legRel(b, s, mul(norm([0.42, 0.88, -ss * 0.05]), 0.85), [1, 0.2, 0], 0, -25, 0); b.lean(-0.05); }
      else legRel(b, s, mul(norm([0.85, 0.42, -ss * 0.02]), 0.85), [0.3, 1, 0], 0, -30, 0);
      return eyes(b).act("leg" + s);
    }
    const axK = axePose(g, "r", "knee");
    const axT = axePose(g, "r", "top");
    const axD = axePose(g, "r", "down");
    both("taekwondo.naeryoChagi", "Naeryo chagi: ginocchio alto, gamba tesa in cima, tallone giù in verticale, appoggio avanti",
      [K(g, 280, 100), K(axK, 200, 40), K(axT, 180, 80), K(axD, 200, 120), K(gDF.copy().act("legr"), 220, 250), ...stepHome(gDF, g, "r")],
      "Naeryo chagi dalla guardia destra: calcia la gamba sinistra");
    mv("taekwondo.naeryoKnee", "Ascia, salita: il ginocchio sale piegato davanti al petto, busto dritto", [K(g, 280, 120), K(axK, 300, 1000), K(g, 300, 250)]);
    mv("taekwondo.naeryoTop", "Ascia: in cima la gamba si distende, piede flesso, poi il tallone scende in verticale", [K(g, 280, 100), K(axK, 220, 60), K(axT, 220, 500), K(axD, 260, 500), K(axK, 250, 60), K(g, 280, 250)]);
    const axDlow = axePose(g, "r", "down");
    legRel(axDlow, "r", mul(norm([0.85, 0.12, -0.02]), 0.85), [0.3, 1, 0], 0, -30, 0);
    mv("taekwondo.chairNaeryo", "Alla sedia, ascia con bersaglio alla cintura: ginocchio alto, gamba su, tallone giù", [K(chairG, 280, 100), K(onChair(axK), 250, 80), K(onChair(axT), 250, 200), K(onChair(axDlow), 280, 300), K(onChair(axK), 250, 60), K(chairG, 280, 250)]);
    const axKS = axePose(gSl, "l", "knee");
    const axTS = axePose(gSl, "l", "top");
    const axDS = axePose(gSl, "l", "down");
    mv("taekwondo.slideNaeryo", "Passo scivolato e ascia di gamba avanti, appoggio controllato", [K(g, 250, 60), slideIn, K(axKS, 150, 20), K(axTS, 160, 60), K(axDS, 180, 120), K(gFw.copy().act("legl"), 200, 150), ...backSteps(gFw, 0.3, "r")]);

    /* ---------------------------------------------------------------- spinta (mireo chagi) */
    function pushPose(base, s, phase, H = 1.0) {
      const b = base.copy().kick(s, "teep", phase === "ext" ? "ext" : "chamber", H, { arms: "low", hipYaw: s === "l" ? -48 : -18 });
      if (phase === "ext") { b.shift(0.04).lean(0.08); legAim(b, s, 0.85, H, 0, 0.84); b.p.footPitch[s] = -70; b.knee(s, [0.2, 1, 0]); }
      else legRel(b, s, [0.24, -0.1, 0], [1, 0.7, 0], 0, -55, 0);
      return b.act("leg" + s);
    }
    const msCh = pushPose(gHop, "l", "chamber");
    const msEx = pushPose(gHop, "l", "ext");
    const gFw2 = g.copy().move(0.2);
    both("taekwondo.mireoChagi", "Mireo chagi di gamba avanti: ginocchio al petto, spinta con tutta la pianta, anca avanti",
      [K(g, 250, 80), K(gHop.copy().act("legr"), 140, 0), K(msCh, 160, 60), K(msEx, 170, 260), K(msCh, 150, 30), K(gFw2.copy().act("legl"), 180, 120), ...backSteps(gFw2, 0.2, "r")],
      "Mireo chagi di gamba avanti dalla guardia destra");
    mv("taekwondo.mireoChamber", "Mireo, caricamento: ginocchio al petto, piede flesso con la pianta verso il bersaglio", [K(g, 280, 100), K(msCh, 300, 1100), K(g, 300, 250)]);
    mv("taekwondo.mireoHold", "Mireo: dal ginocchio al petto la pianta spinge alla pancia, anca avanti, busto quasi verticale", [K(g, 250, 80), K(gHop.copy().act("legr"), 160, 0), K(msCh, 220, 300), K(msEx, 260, 1000), K(msCh, 220, 100), K(gHop, 200, 40), K(g, 250, 250)]);
    const msChS = pushPose(gSl, "l", "chamber");
    const msExS = pushPose(gSl, "l", "ext");
    both("taekwondo.slideMireo", "Passo scivolato e mireo di gamba avanti: arrivi più lontano",
      [K(g, 250, 60), slideIn, K(msChS, 140, 30), K(msExS, 160, 240), K(msChS, 150, 30), K(gFw.copy().act("legl"), 180, 120), ...backSteps(gFw, 0.3, "r")],
      "Passo scivolato e mireo di gamba avanti dalla guardia destra");
    const msChR = pushPose(g, "r", "chamber");
    const msExR = pushPose(g, "r", "ext");
    mv("taekwondo.mireoRear", "Mireo di gamba dietro: più potente, la pianta spinge e il piede torna dietro", [K(g, 260, 80), K(msChR, 190, 60), K(msExR, 180, 260), K(msChR, 160, 30), K(g, 220, 250)]);

    /* ---------------------------------------------------------------- mezzalune e slanci */
    const crPose = (kind, phase, H) => base1(g.copy().kick("r", kind, phase, H, { arms: "low" }));
    function base1(b) { return b.act("legr"); }
    mv("taekwondo.bakkatChagi", "Bakkat chagi: gamba tesa che disegna un arco dall'interno verso l'esterno", [K(g, 280, 100), K(crPose("crescentOut", "chamber", "mid"), 260, 0), K(crPose("crescentOut", "ext", "high"), 220, 60), K(crPose("crescentOut", "recoil", "mid"), 240, 60), K(g, 280, 250)]);
    mv("taekwondo.anChagi", "An chagi: gamba tesa che sale di lato e disegna l'arco dall'esterno verso l'interno", [K(g, 280, 100), K(crPose("crescentIn", "chamber", "mid"), 260, 0), K(crPose("crescentIn", "ext", "high"), 220, 60), K(crPose("crescentIn", "recoil", "mid"), 240, 60), K(g, 280, 250)]);
    const swingTo = (k, hand) => {
      const b = g.copy().kick("r", "axe", "ext", 1.3, { arms: "low" });
      legRel(b, "r", mul(norm([0.6, k, -0.12]), 0.85), [1, 0.2, 0], 0, 5, 0);
      if (hand) b.handRel("l", 0.5, 0.0, -0.02, "open").elbow("l", [0, -1, 0]);
      return b.act("legr");
    };
    mv("taekwondo.frontSwing", "Slancio teso frontale: la gamba dietro sale tesa verso la mano avanti", [K(g, 280, 80), K(swingTo(0.75, true), 300, 60), K(g, 300, 80), K(swingTo(0.85, true), 300, 60), K(g, 300, 200)]);
    mv("taekwondo.swingRise", "Slanci ad ampiezza crescente: parti a metà altezza e sali poco a ogni ripetizione, busto dritto", [K(g, 280, 60), K(swingTo(0.1), 320, 40), K(g, 300, 40), K(swingTo(0.45), 320, 40), K(g, 300, 40), K(swingTo(0.8), 320, 40), K(g, 300, 200)]);
    const raise = onChair(swingTo(0.0));
    raise.lean(0.04);
    mv("taekwondo.activeRaise", "Sollevamento attivo: gamba tesa che sale davanti senza slancio, tieni 2 secondi", [K(chairG, 300, 150), K(raise, 900, 1500), K(chairG, 700, 250)]);

    // parata alta: avambraccio di traverso sopra la fronte, gomito in fuori
    function highBlk(b, s) {
      const fr = b.frame();
      b.handHead(s, 0.14, 0.1, -sgn(s) * 0.08, "fist");
      return b.elbow(s, add(add(mul(fr.right, sgn(s)), mul(fr.fwd, 0.6)), [0, 0.1, 0]));
    }

    /* ---------------------------------------------------------------- pugni in combattimento */
    const punchRear = (b0) => b0.copy().turn(40).shift(0.06).straight("r", [0.7 + b0.p.o[0], 1.12, 0.02]).heel("r", 26).act("armr", "legr");
    const punchFront = (b0) => b0.copy().turn(-8).shift(0.04).straight("l", [0.72 + b0.p.o[0], 1.12, -0.02]).act("arml");
    // la stessa posa in guardia destra, avanzata di 0,48 (dopo un calcio appoggiato avanti)
    const fwdD = (b) => b.copy().mirror().move(0.48, 0);

    /* ---------------------------------------------------------------- calcio all'indietro (dwi chagi) */
    function backPose(base, s, phase, H = 1.0) { return base.copy().kick(s, "back", phase, H, { arms: "low" }).act("leg" + s); }
    const lookOver = (base) => base.copy().twist(-18).look(-75).act("head");
    // dwi chagi di gamba dietro da una guardia sinistra "base": testa, perno, tallone dritto, atterraggio avanti
    // in guardia destra, poi il piede avanti torna dietro (giro completo: alla fine la posa e' identica a "base")
    function dwiFrames(base, H = 1.0, quiet = false) {
      const lx = base.p.foot.l[0];
      const lz = base.p.foot.l[2];
      const ch = about(backPose(base, "r", "chamber"), -20, lx, lz);
      const ex = backPose(base, "r", "ext", H);
      const re = about(backPose(base, "r", "chamber"), -60, lx, lz);
      const land = yawAdd(fwdD(base), -360);
      const home = yawAdd(base.copy(), -360);
      const lk = quiet ? lookOver(base).act() : lookOver(base);
      return [K(base, 260, 60), K(lk, 150, 10), K(ch, 170, 20), K(ex, 150, 200), K(re.act(), 150, 10), K(land.copy().act("legr"), 180, 220), ...stepHome(land, home, "r"), K(base, 0, 150)];
    }
    const dwChB = about(backPose(g, "r", "chamber"), -20, g.p.foot.l[0], g.p.foot.l[2]);
    both("taekwondo.dwiChagi", "Dwi chagi: la testa gira, perno, tallone dritto al bersaglio, atterraggio avanti",
      dwiFrames(g), "Dwi chagi dalla guardia destra: calcia la gamba sinistra");
    mv("taekwondo.dwiTurn", "Giro di spalle: testa, perno sull'avampiede avanti, ginocchio raccolto, sguardo sul bersaglio", [K(g, 280, 100), K(lookOver(g), 220, 80), K(dwChB, 320, 1300), K(lookOver(g), 300, 40), K(g, 260, 250)]);
    mv("taekwondo.dwiTurnHold", "Fermo 2 secondi di spalle: sguardo sopra la spalla, ginocchia vicine, poi torna in guardia", [K(g, 280, 100), K(lookOver(g), 220, 80), K(dwChB, 320, 2100), K(lookOver(g), 300, 40), K(g, 260, 250)]);
    const dwExH = backPose(g, "r", "ext", 1.0);
    mv("taekwondo.dwiHold", "Dwi chagi: tallone dritto al bersaglio, ginocchia vicine, punta in basso, busto avanti", [K(g, 280, 80), K(lookOver(g), 180, 40), K(dwChB, 200, 100), K(dwExH, 200, 900), K(dwChB, 220, 100), K(lookOver(g), 260, 40), K(g, 260, 250)]);
    const dwLow = about(backPose(g, "r", "ext", 0.65), -5, g.p.foot.l[0], g.p.foot.l[2]);
    mv("taekwondo.dwiSlow", "Di spalle, spinta lenta del tallone dritto dietro all'altezza della coscia, punta in basso", [K(g, 280, 100), K(lookOver(g), 220, 60), K(dwChB, 300, 500), K(dwLow, 650, 700), K(dwChB, 450, 200), K(g, 320, 250)]);
    const gBk = g.copy().move(-0.2);
    mv("taekwondo.stepBackDwi", "Contrattacco: passo indietro sul circolare dell'avversario e subito dwi chagi", [K(g, 250, 60), K(g.copy().step("r", -0.2).shift(-0.1).act("legr"), 180, 20), K(gBk.copy().act(), 160, 40), ...dwiFrames(gBk, 1.0, true).slice(1)]);
    // sguardo e giro senza calcio
    const backFace = g.copy().set("hipYaw", -168).set("chestYaw", -172).fyaw("l", -190).fyaw("r", -205).set("head", [0.0, 1.59, 0.0]).guard("low").look(-80);
    mv("taekwondo.lookBack", "Sguardo: la testa gira sopra la spalla dietro e il corpo la segue fino a darti di spalle", [K(g, 280, 100), K(lookOver(g), 300, 300), K(backFace.copy().act("torso", "head"), 450, 700), K(lookOver(g), 400, 100), K(g, 300, 250)]);
    // giro completo sull'avampiede avanti, la testa guida (alla fine stessa guardia)
    function spinFrames(base) {
      const lx = base.p.foot.l[0];
      const lz = base.p.foot.l[2];
      const step = (d, look) => { const b = about(base.copy(), d, lx, lz).look(look); b.p.foot.r = add(b.p.foot.r, [0, 0.06, 0]); return b.act("legr", "head"); };
      return [K(base, 260, 80), K(lookOver(base), 220, 60), K(step(-120, -70), 300, 0), K(step(-240, -40), 300, 0), K(yawAdd(base.copy(), -360).act("legr"), 280, 500), K(base, 0, 100)];
    }
    both("taekwondo.spinTurn", "Giro completo sull'avampiede avanti: la testa gira per prima e ritrova il bersaglio",
      spinFrames(g), "Giro completo nell'altro verso, dalla guardia destra");
    const spH = about(g.copy(), -180, g.p.foot.l[0], g.p.foot.l[2]).look(75);
    spH.p.foot.r = add(spH.p.foot.r, [0, 0.04, 0]);
    mv("taekwondo.spinHalf", "Perno sull'avampiede avanti fino a darti di spalle: la testa ritrova il bersaglio dall'altra parte", [K(g, 260, 80), K(lookOver(g), 250, 100), K(spH.act("legr", "head"), 450, 900), K(lookOver(g), 400, 60), K(g, 280, 250)]);
    // salto con mezzo giro: atterra in guardia girato, poi torna con il mezzo giro inverso
    const gBack = about(g.copy(), -180, 0, 0);
    const htAir2 = air(about(g.copy(), -90, 0, 0), 0.1);
    mv("taekwondo.halfTurnJump", "Salto con mezzo giro: la testa guida, atterraggio in guardia fermo, poi giro inverso", [K(g, 250, 60), K(g.copy().sink(0.08).look(-40), 180, 30), K(htAir2.act("legl", "legr", "head"), 200, 0), K(gBack, 200, 800), K(gBack.copy().sink(0.08), 180, 30), K(htAir2, 200, 0), K(g, 200, 700)]);

    /* ---------------------------------------------------------------- calcio a gancio (huryeo) e girato a uncino (dwi huryeo) */
    function hookPose(base, s, phase, H = 1.05) { return base.copy().kick(s, "hook", phase, H, { arms: "low" }).act("leg" + s); }
    const huChS = hookPose(gSl, "l", "chamber");
    const huExS = hookPose(gSl, "l", "ext");
    const huHkS = hookPose(gSl, "l", "hook");
    both("taekwondo.slideHuryeo", "Passo scivolato e huryeo di gamba avanti: gamba oltre il bersaglio, aggancio di tallone",
      [K(g, 250, 60), slideIn, K(huChS, 140, 20), K(huExS, 140, 40), K(huHkS, 120, 180), K(huChS, 130, 20), K(gFw.copy().act("legl"), 170, 120), ...backSteps(gFw, 0.3, "r")],
      "Passo scivolato e huryeo di gamba avanti dalla guardia destra");
    const huCh = hookPose(gHop, "l", "chamber");
    const huEx = hookPose(gHop, "l", "ext");
    const huHk = hookPose(gHop, "l", "hook");
    both("taekwondo.huryeoChagi", "Huryeo chagi di gamba avanti: parte come un laterale, aggancia di tallone e torna",
      [K(g, 240, 60), K(gHop.copy().act("legr"), 120, 0), K(huCh, 130, 20), K(huEx, 130, 40), K(huHk, 120, 180), K(huCh, 130, 20), K(gHop, 130, 40), K(g, 200, 220)],
      "Huryeo chagi di gamba avanti dalla guardia destra");
    const CHR = [-0.45, 1.0, 0.25]; // sedia per la mano destra (calci di gamba avanti)
    const onChairR = (b) => prop(b.copy(), "r", CHR[0], CHR[1], CHR[2]);
    const huCh0 = hookPose(g, "l", "chamber");
    const huEx0 = hookPose(g, "l", "ext", 0.75);
    const huHk0 = hookPose(g, "l", "hook", 0.75);
    mv("taekwondo.chairHuryeo", "Alla sedia, huryeo in tre tempi: caricamento, gamba oltre il bersaglio, aggancio del tallone", [K(onChairR(g), 300, 200), K(onChairR(huCh0), 320, 500), K(onChairR(huEx0), 300, 500), K(onChairR(huHk0), 220, 500), K(onChairR(huCh0), 280, 200), K(onChairR(g), 300, 300)]);
    mv("taekwondo.chairHookChamber", "Alla sedia: caricamento come per il laterale, ginocchio al petto, piede d'appoggio girato", [K(onChairR(g), 300, 200), K(onChairR(huCh0), 350, 1200), K(onChairR(g), 350, 300)]);
    mv("taekwondo.chairHookExt", "Alla sedia: la gamba si distende poco a lato del bersaglio, all'altezza della coscia", [K(onChairR(g), 300, 150), K(onChairR(huCh0), 320, 300), K(onChairR(huEx0), 350, 1000), K(onChairR(huCh0), 320, 150), K(onChairR(g), 320, 250)]);
    mv("taekwondo.slideHookChamber", "Passo scivolato e caricamento della gamba avanti come per il laterale", [K(g, 250, 60), slideIn, K(huChS, 180, 900), K(gSl, 220, 60), K(g, 250, 250)]);
    mv("taekwondo.huryeoSlow", "Huryeo lento: gamba distesa oltre il bersaglio, poi il tallone aggancia in orizzontale", [K(g, 250, 60), K(gHop.copy().act("legr"), 150, 0), K(huCh, 220, 200), K(huEx, 280, 500), K(huHk, 260, 600), K(huCh, 250, 100), K(gHop, 180, 40), K(g, 250, 250)]);
    function dwiHuryeoFrames(base, H = 1.1, quiet = false) {
      const lx = base.p.foot.l[0];
      const lz = base.p.foot.l[2];
      const ch = about(backPose(base, "r", "chamber"), -20, lx, lz);
      const ex = yawAdd(hookPose(base, "r", "ext", H), -360);
      const hk = about(yawAdd(hookPose(base, "r", "hook", H), -360), -25, lx, lz);
      const home = yawAdd(base.copy(), -360);
      const fol = landMid(hk, home);
      fol.p.foot.r = add(fol.p.foot.r, [0, 0.2, 0]);
      const lk = quiet ? lookOver(base).act() : lookOver(base);
      return [K(base, 260, 60), K(lk, 150, 10), K(ch, 170, 10), K(ex, 160, 20), K(hk, 130, 160), K(fol.act(), 170, 10), K(home, 180, 250), K(base, 0, 150)];
    }
    both("taekwondo.dwiHuryeo", "Dwi huryeo chagi: giro, gamba oltre il bersaglio, aggancio di tallone e atterraggio in guardia",
      dwiHuryeoFrames(g), "Dwi huryeo chagi dalla guardia destra: calcia la gamba sinistra");
    mv("taekwondo.dwiHuryeoSlow", "Dwi huryeo a mezza velocità: giro stabile, aggancio e atterraggio fermo in guardia", dwiHuryeoFrames(g).map((f, i) => K(f.p, Math.round(f.t * 1.6), Math.round(f.h * 1.4) + (i && f.t ? 80 : 0), f.act)));
    // tempi del dwi huryeo: di spalle, distensione e ritorno (senza completare il giro)
    const dhEx = yawAdd(hookPose(g, "r", "ext", 1.1), -360);
    mv("taekwondo.dwiHuryeoExt", "Di spalle: gamba dietro distesa poco a lato del bersaglio, all'altezza del corpo", [K(g, 280, 80), K(lookOver(g), 200, 40), K(dwChB, 280, 300), K(dhEx, 320, 800), K(dwChB, 300, 100), K(g, 300, 250)]);
    const CHB = [-0.25, 1.0, -0.2]; // sedia davanti quando sei di spalle
    const onChairB = (b) => prop(b.copy(), "r", CHB[0], CHB[1], CHB[2]);
    const dcEx = backPose(g, "r", "ext", 1.0);
    legAim(dcEx, "r", 0.8, 1.0, -0.42);
    const dcHk = backPose(g, "r", "ext", 1.0);
    legRel(dcHk, "r", [0.3, 0.08, 0.3], [0.4, 0.2, -1], 150, 40, 0);
    mv("taekwondo.chairDwiHuryeo", "Di spalle alla sedia: ginocchio raccolto, distensione oltre il bersaglio e aggancio", [K(g, 280, 80), K(onChairB(backFace), 400, 400), K(onChairB(dwChB), 300, 400), K(onChairB(dcEx), 300, 450), K(onChairB(dcHk), 220, 450), K(onChairB(dwChB), 280, 200), K(onChairB(backFace), 250, 100), K(g, 380, 250)]);
    mv("taekwondo.chairBackStance", "Di spalle al bersaglio con la mano sulla sedia, sguardo sopra la spalla sul bersaglio", [K(g, 280, 100), K(onChairB(backFace).act("torso", "head"), 450, 1100), K(g, 400, 250)]);
    mv("taekwondo.chairDwiExt", "Di spalle alla sedia: ginocchio raccolto, poi gamba distesa poco a lato del bersaglio", [K(g, 280, 80), K(onChairB(backFace), 400, 300), K(onChairB(dwChB), 300, 400), K(onChairB(dcEx), 320, 900), K(onChairB(dwChB), 280, 200), K(onChairB(backFace), 250, 100), K(g, 380, 250)]);

    /* ---------------------------------------------------------------- salti */
    const tuck = (b, s) => legRel(b, s, [-0.12, -0.7, sgn(s) * 0.02], [1, -0.2, 0], b.p.footYaw[s], 35, 0);
    const jPrep = g.copy().sink(0.07).act("legl", "legr");
    const jKnee = tuck(air(frontChamber(g, "r"), 0.22), "l");
    jKnee.act("legr", "legl");
    const jKick = tuck(air(frontExt(g, "r", 0.82), 0.22), "l");
    const jLand = g.copy().sink(0.08).act("legl", "legr");
    mv("taekwondo.kneeJump", "Salto con ginocchio: il ginocchio dietro sale al petto e tira su il corpo, atterraggio in guardia", [K(g, 260, 60), K(jPrep, 180, 30), K(jKnee, 170, 60), K(jLand, 180, 900), K(g, 280, 200)]);
    both("taekwondo.twieoApChagi", "Twieo ap chagi: stacco, ap chagi in aria con la gamba salita, atterraggio morbido in guardia",
      [K(g, 260, 60), K(jPrep, 170, 20), K(jKnee, 150, 0), K(jKick, 120, 120), K(jKnee, 120, 0), K(jLand, 160, 900), K(g, 280, 200)],
      "Twieo ap chagi dalla guardia destra: calcia in aria la gamba sinistra");
    const par = st().foot("l", 0, -0.13, 6, 0).foot("r", 0, 0.13, -6, 0).handRel("l", 0.25, -0.25, -0.12, "fist").handRel("r", 0.25, -0.25, 0.12, "fist");
    const parDn = par.copy().sink(0.1).heel("l", 15).heel("r", 15);
    const parUp = air(par.copy().heel("l", 30).heel("r", 30), 0.1);
    mv("taekwondo.landHold", "Atterraggio: piccolo salto a piedi uniti, giù sugli avampiedi a ginocchia morbide, fermo", [K(par, 250, 60), K(parDn, 200, 30), K(parUp.act("legl", "legr"), 160, 0), K(parDn.copy().sink(0.04).act("legl", "legr"), 160, 1200), K(par, 300, 200)]);
    mv("taekwondo.hops", "Saltelli a piedi uniti sul posto: bassi e rapidi, contatto breve e silenzioso", [K(par, 200, 20), K(air(par.copy().heel("l", 30).heel("r", 30), 0.05).act("legl", "legr"), 120, 0), K(parDn, 110, 0), K(air(par.copy().heel("l", 30).heel("r", 30), 0.05).act("legl", "legr"), 120, 0), K(parDn, 110, 0), K(air(par.copy().heel("l", 30).heel("r", 30), 0.05).act("legl", "legr"), 120, 0), K(par, 120, 150)]);
    const hopS = (dz) => air(par.copy().move(0, dz).heel("l", 30).heel("r", 30), 0.06).act("legl", "legr");
    mv("taekwondo.hopsSide", "Saltelli laterali a piedi uniti sopra una linea", [K(par, 200, 20), K(hopS(0.1), 130, 0), K(parDn.copy().move(0, 0.18), 120, 30), K(hopS(0.06), 130, 0), K(parDn.copy().move(0, -0.06), 130, 30), K(hopS(0.06), 130, 0), K(par, 130, 150)]);
    const tj = air(par.copy(), 0.25);
    legRel(tj, "l", [0.28, -0.25, -0.02], [1, 1, 0], 6, 30);
    legRel(tj, "r", [0.28, -0.25, 0.02], [1, 1, 0], -6, 30);
    tj.act("legl", "legr");
    mv("taekwondo.tuckJump", "Salto raccolto basso: ginocchia al petto, atterraggio morbido e un secondo di stop", [K(par, 250, 60), K(parDn, 200, 30), K(tj, 180, 40), K(parDn.copy().sink(0.04).act("legl", "legr"), 180, 900), K(par, 280, 200)]);

    /* ---------------------------------------------------------------- doppio circolare alternato (narae chagi) */
    function naraeFrames(base, quiet = false) {
      const bD = fwdD(base);
      const c1 = air(bandalCh(base, "r", 15), 0.03);
      const e1 = roundPose(base, "r", "ext", 1.05, BND);
      const c2 = air(bandalCh(bD, "l", -15), 0.02);
      const e2 = roundPose(bD, "l", "ext", 1.05, BND);
      if (quiet) { c1.act(); c2.act(); }
      return [K(base, 240, 50), K(c1, 140, 0), K(e1, 110, 60), K(c2, 120, 0), K(e2, 110, 120), K(bD.copy().act(), 160, 200), ...stepHome(bD, base, "r")];
    }
    both("taekwondo.naraeChagi", "Narae chagi: due bandal a gambe alternate, il secondo parte mentre il primo piede scende",
      naraeFrames(g), "Narae chagi dalla guardia destra");
    mv("taekwondo.naraeSlow", "Doppio a mezza velocità e basso: due circolari alternati e atterraggio in guardia", naraeFrames(g).map((f, i) => K(f.p, Math.round((f.t || 0) * 1.7), Math.round((f.h || 0) * 1.5) + (i ? 60 : 0), f.act)));
    // ritmo del doppio: solo ginocchia in aria, come a pedalare
    const nk1 = air(roundPose(g, "r", "chamber", 1.0, { hip: 50, chest: 35, sup: 80 }), 0.05);
    const nk2 = air(roundPose(gDF, "l", "chamber", 1.0, { hip: 50, chest: 35, sup: 80 }), 0.06);
    tuck(nk1, "l");
    mv("taekwondo.naraeKnees", "Ritmo del doppio: piccolo stacco, un ginocchio sale in caricamento, poi l'altro, solo ginocchia", [K(g, 260, 60), K(g.copy().sink(0.05), 150, 20), K(nk1, 170, 40), K(nk2, 190, 60), K(gDF.copy().act("legl", "legr"), 180, 400), ...stepHome(gDF, g, "r")]);
    mv("taekwondo.naraeKneesFast", "Stesso gesto veloce: ginocchia alternate in aria, atterraggio in guardia invertita", [K(g, 240, 40), K(g.copy().sink(0.05), 120, 0), K(nk1, 120, 0), K(nk2, 130, 0), K(gDF.copy().act("legl", "legr"), 140, 400), ...stepHome(gDF, g, "r")]);
    both("taekwondo.naraeKneesB", "Ginocchia alternate in aria dalla guardia sinistra, filmando i piedi",
      [K(g, 240, 40), K(g.copy().sink(0.05), 130, 0), K(nk1, 130, 10), K(nk2, 140, 10), K(gDF.copy().act("legl", "legr"), 150, 300), ...stepHome(gDF, g, "r")],
      "Ginocchia alternate in aria dalla guardia destra");

    /* ---------------------------------------------------------------- più calci con la stessa gamba */
    const bnLow = roundPose(g, "r", "ext", 0.62, BND);
    const bnRc = roundPose(g, "r", "chamber", 1.0, { hip: 55, chest: 35, sup: 90 });
    both("taekwondo.doubleSame", "Due bandal con la stessa gamba senza appoggiare: alla coscia, ritorno in caricamento, al corpo",
      [K(g, 250, 60), K(bnCh, 160, 10), K(bnLow, 130, 120), K(bnRc, 140, 40), K(bnEx, 130, 150), K(bnCh, 130, 10), K(g, 180, 240)],
      "Due bandal con la stessa gamba dalla guardia destra");
    mv("taekwondo.chairDoubleSame", "Alla sedia: bandal alla coscia, ritorno in caricamento, bandal al corpo senza appoggiare", [K(chairG, 280, 100), K(onChair(bnCh), 200, 60), K(onChair(bnLow), 170, 250), K(onChair(bnRc), 180, 150), K(onChair(bnEx), 170, 300), K(onChair(bnCh), 180, 60), K(chairG, 220, 250)]);
    mv("taekwondo.bandalYopSame", "Bandal al corpo e, senza appoggiare, laterale con la stessa gamba ruotando ancora l'anca", [K(g, 250, 60), K(bnCh, 160, 10), K(bnEx, 130, 140), K(ypCh, 170, 30), K(ypEx, 150, 180), K(ypCh, 150, 20), K(g, 220, 240)]);
    mv("taekwondo.tripleSame", "Tre calci con la stessa gamba: basso, medio, medio, sempre tornando in caricamento", [K(g, 250, 60), K(bnCh, 160, 10), K(bnLow, 130, 100), K(bnRc, 130, 20), K(bnEx, 130, 110), K(bnRc, 130, 20), K(bnEx, 130, 130), K(bnCh, 130, 10), K(g, 180, 240)]);
    const bnHalf = roundPose(g, "r", "ext", 1.0, Object.assign({}, BND, { k: 0.68 }));
    mv("taekwondo.bandalPulse", "Ginocchio sopra la cintura: tre bandal a metà distensione senza appoggiare, poi tieni", [K(g, 250, 60), K(bnRc, 220, 100), K(bnHalf, 160, 60), K(bnRc, 160, 40), K(bnHalf, 160, 60), K(bnRc, 160, 40), K(bnHalf, 160, 60), K(bnRc, 180, 1500), K(g, 250, 250)]);

    /* ---------------------------------------------------------------- combinazioni */
    // calcio di gamba dietro che appoggia avanti (in guardia destra) e frame di uscita
    const bnD = { ch: bandalCh(gDF, "l", -15), ex: roundPose(gDF, "l", "ext", 1.05, BND) };
    const R = (b, t, h) => K(b.copy().act(), t, h); // ritorno: fotogramma di passaggio
    const landD = R(gDF, 190, 120);
    const home = stepHome(gDF, g, "r");
    both("taekwondo.apPunch", "Ap chagi che appoggia avanti e, nello stesso istante, pugno al corpo con la mano dietro",
      [K(g, 260, 80), K(apCh, 170, 20), K(apEx, 140, 140), R(apCh, 130, 10), K(fwdD(punchRear(g)), 190, 300), K(gDF, 180, 200), ...home],
      "Ap chagi e pugno dalla guardia destra");
    mv("taekwondo.apPunch2", "Ap chagi, appoggio avanti, due pugni al corpo e uscita con un passo indietro", [K(g, 260, 80), K(apCh, 170, 20), K(apEx, 140, 140), R(apCh, 130, 10), K(fwdD(punchRear(g)), 190, 150), K(gDF, 130, 20), K(fwdD(punchFront(g)), 140, 200), K(gDF, 160, 100), ...home]);
    both("taekwondo.comboApBandal", "Ap chagi di gamba dietro, appoggio avanti, bandal con l'altra gamba e passo indietro",
      [K(g, 250, 60), K(apCh, 160, 10), K(apEx, 130, 120), R(apCh, 120, 0), landD, K(bnD.ch, 140, 0), K(bnD.ex, 120, 140), R(bnD.ch, 120, 0), K(gDF, 150, 100), ...home],
      "Ap chagi e bandal dalla guardia destra");
    const bnF = { ch: bandalCh(gFw, "r", 15), ex: roundPose(gFw, "r", "ext", 1.05, BND) };
    both("taekwondo.comboSlideBandal", "Bandal di gamba avanti con passo scivolato, appoggio, subito bandal di gamba dietro",
      [K(g, 250, 60), slideIn, K(bnChS, 120, 0), K(bnExS, 120, 120), R(bnChS, 110, 0), K(gFw.copy().act("legl"), 150, 20), K(bnF.ch, 140, 0), K(bnF.ex, 120, 140), R(bnF.ch, 120, 0), K(gFw, 150, 80), ...backSteps(gFw, 0.3, "r")],
      "Gamba avanti e gamba dietro dalla guardia destra");
    both("taekwondo.comboBandalPunch", "Bandal di gamba dietro, appoggio avanti, pugno al corpo, bandal con l'altra gamba",
      [K(g, 250, 60), R(bnCh, 150, 0), K(bnEx, 120, 120), R(bnCh, 120, 0), K(fwdD(punchRear(g)), 180, 160), K(gDF, 130, 0), K(bnD.ch, 140, 0), K(bnD.ex, 120, 140), R(bnD.ch, 120, 0), K(gDF, 150, 100), ...home],
      "Bandal, pugno e bandal dalla guardia destra");
    mv("taekwondo.bandalSwitch", "Bandal che appoggia avanti cambiando guardia, poi bandal con l'altra gamba",
      [K(g, 250, 60), K(bnCh, 150, 0), K(bnEx, 120, 120), R(bnCh, 120, 0), landD, K(bnD.ch, 140, 0), K(bnD.ex, 120, 140), R(bnD.ch, 120, 0), K(gDF, 150, 100), ...home]);
    mv("taekwondo.bandalAlt", "Bandal alternati destro e sinistro alla massima velocità, sempre di ritorno in guardia", [K(g, 220, 40), K(bnCh, 120, 0), K(bnEx, 100, 80), R(bnCh, 100, 0), K(g, 130, 20), K(air(gHop.copy(), 0.03), 100, 0), K(bnChL, 100, 0), K(bnExL, 100, 80), R(bnChL, 100, 0), K(g, 160, 200)]);
    // difesa e risposta
    const outBlock = g.copy().turn(12).handRel("r", 0.16, -0.06, 0.2, "fist").elbow("r", [0, -1, 0.15]).act("armr");
    both("taekwondo.bakkatBandal", "Parata corta: momtong bakkat makki con il braccio dietro, gomito sulle costole, subito bandal",
      [K(g, 250, 60), K(outBlock, 140, 220), K(bnCh, 150, 0), K(bnEx, 120, 140), R(bnCh, 120, 10), K(g, 180, 240)],
      "Parata esterna e bandal dalla guardia destra");
    const gB15 = g.copy().move(-0.15);
    const lowBlock = gB15.copy().turn(-8).handRel("l", 0.3, -0.45, -0.06, "fist").elbow("l", [0, -1, -0.4]).act("arml", "legr");
    const bnB = { ch: bandalCh(gB15, "r", 15), ex: roundPose(gB15, "r", "ext", 1.05, BND) };
    mv("taekwondo.araeCounter", "Contro il frontale: passo indietro con arae makki, poi pugno al corpo e bandal", [K(g, 250, 60), K(lowBlock, 180, 200), K(punchRear(gB15), 150, 120), K(gB15, 120, 0), K(bnB.ch, 140, 0), K(bnB.ex, 120, 140), R(bnB.ch, 120, 10), K(gB15, 160, 120), K(g, 250, 200)]);
    const highBlock = highBlk(g.copy(), "l").act("arml");
    mv("taekwondo.olgulYop", "Contro il calcio alto: olgul makki sopra la fronte, poi laterale di gamba avanti", [K(g, 250, 60), K(highBlock, 150, 220), K(gHop.copy().act("legr"), 120, 0), K(ypChL, 120, 10), K(ypExL, 130, 160), R(ypChL, 120, 10), K(gHop, 130, 40), K(g, 200, 220)]);
    const ypF = { ch: bandalCh(gFw2, "r", 15), ex: roundPose(gFw2, "r", "ext", 1.05, BND) };
    mv("taekwondo.yopBandal", "Laterale di gamba avanti, appoggio avanti, bandal di gamba dietro: lo fermi e lo punisci", [K(g, 240, 60), K(gHop.copy().act("legr"), 120, 0), K(ypChL, 120, 10), K(ypExL, 130, 150), R(ypChL, 120, 0), K(gFw2.copy().act("legl"), 150, 20), K(ypF.ch, 140, 0), K(ypF.ex, 120, 140), R(ypF.ch, 120, 0), K(gFw2, 150, 80), ...backSteps(gFw2, 0.2, "r")]);
    both("taekwondo.slideYopBandal", "Laterale di gamba avanti con passo scivolato, appoggio, bandal di gamba dietro",
      [K(g, 240, 60), slideIn, K(ypChS, 130, 10), K(ypExS, 130, 150), R(ypChS, 120, 0), K(gFw.copy().act("legl"), 150, 20), K(bnF.ch, 140, 0), K(bnF.ex, 120, 140), R(bnF.ch, 120, 0), K(gFw, 150, 80), ...backSteps(gFw, 0.3, "r")],
      "Laterale e bandal dalla guardia destra");
    const axDf = { k: axePose(gDF, "l", "knee"), t: axePose(gDF, "l", "top"), d: axePose(gDF, "l", "down") };
    both("taekwondo.comboBandalNaeryo", "Bandal di gamba dietro, appoggio avanti, ascia con l'altra gamba",
      [K(g, 250, 60), R(bnCh, 150, 0), K(bnEx, 120, 120), R(bnCh, 120, 0), landD, K(axDf.k, 160, 20), K(axDf.t, 160, 60), K(axDf.d, 180, 100), R(gDF, 180, 120), ...home],
      "Bandal e ascia dalla guardia destra");
    mv("taekwondo.comboNaeryoPunch", "Passo scivolato, ascia di gamba avanti, appoggio, doppio pugno al corpo e uscita", [K(g, 250, 60), R(gSl, 170, 0), R(axKS, 150, 20), K(axTS, 150, 50), K(axDS, 170, 100), R(gFw, 170, 20), K(punchRear(gFw), 140, 80), K(gFw, 100, 0), K(punchFront(gFw), 130, 160), K(gFw, 150, 80), ...backSteps(gFw, 0.3, "r")]);
    const bnSw = mirrorFrames(bnFr());
    mv("taekwondo.switchBandal", "Cambio di guardia saltato e subito bandal con la gamba che è diventata dietro", [K(g, 220, 60), K(swAir, 150, 0), K(gD, 150, 40), ...bnSw.slice(1, 4), K(gD, 160, 60), K(swAir, 150, 0), K(g, 150, 240)]);
    const msF = { ch: bandalCh(gFw2, "r", 15), ex: roundPose(gFw2, "r", "ext", 1.05, BND) };
    mv("taekwondo.mireoBandal", "Mireo che spinge lontano, poi bandal di gamba dietro quando l'avversario torna", [K(g, 250, 80), K(gHop.copy().act("legr"), 140, 0), K(msCh, 150, 40), K(msEx, 160, 240), R(msCh, 140, 20), K(gFw2.copy().act("legl"), 170, 250), K(msF.ch, 140, 0), K(msF.ex, 120, 150), R(msF.ch, 120, 0), K(gFw2, 150, 80), ...backSteps(gFw2, 0.2, "r")]);
    const gB30 = g.copy().move(-0.3);
    mv("taekwondo.backNarae", "Passo indietro lungo e subito doppio mentre l'avversario continua ad avanzare", [K(g, 250, 60), K(g.copy().step("r", -0.3).shift(-0.15).act("legr"), 180, 0), K(gB30.copy().act("legl"), 160, 40), ...naraeFrames(gB30).slice(1)]);
    const io1 = g.copy().step("r", 0.25).heel("r", 22).shift(0.12).act("legr");
    const gI1 = g.copy().move(0.25);
    const io2 = gI1.copy().step("r", 0.25).heel("r", 22).shift(0.12).act("legr");
    const gI2 = g.copy().move(0.5);
    mv("taekwondo.inOut", "Entrata e uscita: due passi scivolati avanti e uno lungo indietro, sempre in guardia", [K(g, 250, 60), K(io1, 170, 10), K(gI1.copy().act("legl"), 150, 50), K(io2, 170, 10), K(gI2.copy().act("legl"), 150, 120), K(gI2.copy().step("r", -0.5).shift(-0.25).sink(0.07).act("legr"), 230, 30), K(g.copy().act("legl"), 200, 250)]);
    const angS = g.copy().step("l", 0.04, -0.26).shift(0.02, -0.12).act("legl");
    const angT = about(g.copy().move(0.04, -0.26), -55, 0.28, -0.3).act("legr", "torso");
    mv("taekwondo.angleStep", "Angolo: il piede avanti fa un passo di lato e il corpo ruota, l'avversario resta fuori linea", [K(g, 250, 60), K(angS, 200, 30), K(angT, 250, 500), K(g, 380, 250)]);
    const fk = bandalCh(gHop, "l", -85);
    const feint = [K(g, 240, 60), R(gHop, 110, 0), K(fk, 130, 120), R(g, 150, 30)];
    both("taekwondo.feintDwi", "Finta di bandal di gamba avanti (sale solo il ginocchio), appoggio e subito dwi chagi", [...feint, ...dwiFrames(g, 1.0, true).slice(1)], "Finta di gamba avanti e dwi chagi dalla guardia destra");
    mv("taekwondo.feintDwiHuryeo", "Finta di gamba avanti, appoggio e dwi huryeo con la gamba dietro", [...feint, ...dwiHuryeoFrames(g, 1.1, true).slice(1)]);
    const dwiD = mirrorFrames(dwiFrames(g.copy().move(0.48), 1.0, true)); // dwi con la gamba sinistra dalla guardia destra avanzata
    mv("taekwondo.naraeDwi", "Doppio alternato, atterraggio e dwi chagi: lo raggiungi girando mentre arretra", [...naraeFrames(g, true).slice(0, 6), ...dwiD.slice(1), ...home]);
    mv("taekwondo.bandalDwi", "Bandal di gamba dietro, appoggio avanti, dwi chagi con l'altra gamba", [K(g, 250, 60), R(bnCh, 150, 0), K(bnEx, 120, 120), R(bnCh, 120, 0), landD, ...dwiD.slice(1), ...home]);
    const huF = { ch: bandalCh(gFw, "r", 15), ex: roundPose(gFw, "r", "ext", 1.05, BND) };
    mv("taekwondo.huryeoBandal", "Huryeo di gamba avanti con passo scivolato, appoggio, bandal di gamba dietro", [K(g, 250, 60), R(gSl, 170, 0), R(huChS, 130, 10), K(huExS, 130, 30), K(huHkS, 110, 140), R(huChS, 120, 0), R(gFw, 150, 20), K(huF.ch, 140, 0), K(huF.ex, 120, 140), R(huF.ch, 120, 0), K(gFw, 150, 80), ...backSteps(gFw, 0.3, "r")]);
    /* ---------------------------------------------------------------- forme: posizioni e tecniche di braccia */
    const charyeot = st().foot("l", 0, -0.07, 12, 0).foot("r", 0, 0.07, -12, 0).handRel("l", 0.02, -0.52, -0.23, "fist").handRel("r", 0.02, -0.52, 0.23, "fist");
    const junbi = ready().foot("l", 0, -0.15, 4, 0).foot("r", 0, 0.15, -4, 0);
    const junbiMid = junbi.copy().handRel("l", 0.2, -0.16, -0.09, "fist").handRel("r", 0.2, -0.16, 0.09, "fist");
    function apSeogi(lead = "l") {
      const ss = lead === "l" ? 1 : -1;
      const b = st();
      b.foot(lead, 0.3, -ss * 0.1, -ss * 2, 0).foot(other(lead), -0.28, ss * 0.1, -ss * 28, 0);
      b.set("pel", [0.01, 0.92, 0]).set("hipYaw", -ss * 8).set("chestYaw", -ss * 8).set("chest", [0.02, 1.42, 0]).set("head", [0.03, 1.62, 0]);
      return b.hikite("l").hikite("r");
    }
    const apKubi = (lead = "l") => zenkutsu(lead);
    const dwitKubi = (lead = "l") => kokutsu(lead);
    // tecniche di braccia sulla posa b (la modificano): s = braccio che lavora
    const T = {
      araePrep: (b, s) => b.handRel(s, 0.12, 0.0, -sgn(s) * 0.15, "fist").elbow(s, [0, -1, -sgn(s) * 0.2]).handRel(other(s), 0.3, -0.42, 0, "fist").elbow(other(s), [0, -1, 0]),
      arae: (b, s) => b.handRel(s, 0.28, -0.48, sgn(s) * 0.08, "fist").elbow(s, add(mul(b.frame().right, sgn(s)), [0, 0.2, 0])).hikite(other(s)).act("arm" + s),
      punch: (b, s, h = 1.12, z = 0) => b.straight(s, [0.95, h, z]).hikite(other(s)).act("arm" + s),
      anPrep: (b, s) => b.handRel(s, 0.0, 0.1, sgn(s) * 0.34, "fist").elbow(s, [0, -1, sgn(s) * 0.5]).handRel(other(s), 0.32, -0.12, 0, "fist"),
      an: (b, s) => b.block(s, "in").hikite(other(s)).act("arm" + s),
      olgulPrep: (b, s) => b.handRel(s, 0.28, -0.3, -sgn(s) * 0.05, "fist").handRel(other(s), 0.3, -0.06, sgn(s) * 0.03, "fist"),
      olgul: (b, s) => highBlk(b, s).hikite(other(s)).act("arm" + s),
      outPrep: (b, s) => b.handRel(s, 0.12, 0.0, -sgn(s) * 0.16, "fist").elbow(s, [0, -1, 0]).handRel(other(s), 0.3, -0.1, 0, "fist"),
      out: (b, s) => b.handRel(s, 0.28, 0.12, sgn(s) * 0.2, "fist").elbow(s, [0, -1, sgn(s) * 0.3]).hikite(other(s)).act("arm" + s)
    };
    mv("taekwondo.charyeot", "Charyeot: attenti, piedi uniti, braccia lungo i fianchi, pugni chiusi", [K(st(), 300, 200), K(charyeot, 400, 900)]);
    mv("taekwondo.junbi", "Junbi: il piede sinistro si apre, i pugni salgono al petto e scendono davanti alla cintura", [K(charyeot, 300, 200), K(junbiMid.copy().act("arml", "armr", "legl"), 600, 150), K(junbi.copy().act("arml", "armr"), 700, 700)]);
    mv("taekwondo.junbiHold", "In posizione di pronti (junbi), fermo: piedi paralleli, pugni davanti alla cintura", [K(junbi, 300, 1200)]);
    const apS = apSeogi("l");
    const akL = apKubi("l");
    mv("taekwondo.apSeogi", "Ap seogi: passo naturale avanti, peso diviso a metà, gambe quasi tese", [K(junbi, 300, 200), K(apS.copy().act("legl"), 450, 1000), K(junbi, 400, 200)]);
    mv("taekwondo.apKubi", "Ap kubi: posizione lunga, ginocchio avanti sopra la punta, gamba dietro tesa e tallone a terra", [K(junbi, 300, 200), K(akL.copy().act("legl", "legr"), 500, 1100), K(junbi, 450, 200)]);
    mv("taekwondo.araeMakki", "Arae makki: il pugno parte dalla spalla opposta e scende sopra la coscia avanti, l'altro al fianco", [K(junbi, 300, 150), K(T.araePrep(akL.copy(), "l"), 450, 250), K(T.arae(akL.copy(), "l"), 200, 700), K(junbi, 450, 200)]);
    mv("taekwondo.momtongJireugi", "Momtong jireugi: il pugno parte dal fianco e arriva al plesso, al centro; l'altro torna al fianco", [K(junbi, 300, 150), K(akL, 450, 300), K(T.punch(akL.copy().turn(8), "r"), 190, 600), K(akL, 220, 150), K(T.punch(akL.copy().turn(-8), "l"), 190, 600), K(junbi, 450, 200)]);
    mv("taekwondo.anOlgul", "Momtong an makki e olgul makki, lente: l'avambraccio finisce davanti al corpo", [K(junbi, 300, 150), K(T.anPrep(apS.copy(), "r"), 450, 250), K(T.an(apS.copy(), "r"), 350, 700), K(T.olgulPrep(apS.copy(), "l"), 400, 250), K(T.olgul(apS.copy(), "l"), 350, 700), K(junbi, 450, 200)]);
    const apSR = apSeogi("r").move(0.58);
    mv("taekwondo.formBasics", "Studio della forma, lento: ap seogi con arae makki, passo avanti e momtong jireugi", [K(junbi, 300, 150), K(T.araePrep(apS.copy(), "l"), 500, 200), K(T.arae(apS.copy(), "l"), 250, 700), K(apSR.copy().act("legr"), 450, 0), K(T.punch(apSR.copy(), "r"), 220, 800), K(junbi, 650, 250)]);
    mv("taekwondo.formSlow", "Forma lenta, ogni tecnica ferma un istante: arae makki, pugno, an makki, olgul makki", [K(junbi, 300, 150), K(T.araePrep(akL.copy(), "l"), 450, 150), K(T.arae(akL.copy(), "l"), 220, 600), K(T.punch(akL.copy().turn(8), "r"), 250, 600), K(T.anPrep(akL.copy(), "l"), 300, 100), K(T.an(akL.copy(), "l"), 250, 600), K(T.olgulPrep(akL.copy(), "r"), 300, 100), K(T.olgul(akL.copy(), "r"), 250, 600), K(junbi, 500, 200)]);
    mv("taekwondo.kihapPunch", "Ultimo movimento: momtong jireugi in ap kubi con il kihap, poi ritorno in junbi", [K(junbi, 300, 150), K(akL, 450, 250), K(T.punch(akL.copy().turn(8), "r").act("armr", "head"), 170, 900), K(junbi, 500, 250)]);
    // calcio frontale da ap kubi e appoggio avanti in ap kubi destra
    const akCh = frontChamber(akL, "r");
    const akEx = frontExt(akL, "r", 1.0);
    const akR = apKubi("r").move(0.9);
    const akRp = (h, s) => T.punch(akR.copy().turn(s === "l" ? 8 : -8), s, h);
    mv("taekwondo.apHighPunch", "Ap chagi da ap kubi, appoggio avanti in ap kubi e pugno alto (olgul jireugi)", [K(junbi, 300, 150), K(akL, 450, 250), K(akCh, 220, 40), K(akEx, 170, 180), K(akCh, 170, 20), K(akR.copy().act("legr"), 220, 60), K(akRp(1.45, "l"), 180, 700), K(junbi, 650, 250)]);
    mv("taekwondo.apDoublePunch", "Ap chagi, appoggio avanti in ap kubi e doppio pugno (dubeon jireugi) in un tempo", [K(junbi, 300, 150), K(akL, 450, 250), K(akCh, 220, 40), K(akEx, 170, 180), K(akCh, 170, 20), K(akR.copy().act("legr"), 220, 20), K(akRp(1.12, "l"), 160, 60), K(akRp(1.12, "r"), 160, 600), K(junbi, 650, 250)]);
    const dkL = dwitKubi("l");
    const dkR = dwitKubi("r");
    mv("taekwondo.dwitKubi", "Dwit kubi: piedi a L, ginocchio dietro piegato sopra la punta, due terzi del peso dietro", [K(junbi, 300, 150), K(dkL.copy().act("legl", "legr"), 500, 900), K(junbi, 450, 200), K(dkR.copy().act("legl", "legr"), 500, 900), K(junbi, 450, 200)]);
    const sonPrep = (b) => b.handRel("l", 0.08, 0.04, 0.16, "blade").elbow("l", [0, -1, 0]).handRel("r", 0.3, -0.25, 0.02, "fist");
    const sonOut = (b) => b.handRel("l", 0.26, 0.04, -0.2, "blade").elbow("l", [0, -1, -0.3]).hikite("r").act("arml");
    mv("taekwondo.sonnalBakkat", "In dwit kubi, parata esterna di taglio della mano (hansonnal momtong bakkat makki)", [K(junbi, 300, 150), K(sonPrep(dkL.copy()), 500, 250), K(sonOut(dkL.copy()), 230, 800), K(junbi, 500, 200)]);
    const sonTwoPrep = (b) => b.handRel("l", -0.02, 0.06, 0.22, "blade").handRel("r", -0.06, -0.06, 0.32, "blade").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0.4]);
    const sonTwo = (b) => b.handRel("l", 0.34, 0.03, -0.1, "blade").elbow("l", [0, -1, -0.2]).handRel("r", 0.22, -0.16, 0.0, "blade").elbow("r", [0, -1, 0.3]).act("arml", "armr");
    mv("taekwondo.sonnalMomtong", "In dwit kubi, parata a due mani di taglio (sonnal momtong makki): arrivano insieme", [K(junbi, 300, 150), K(sonTwoPrep(dkL.copy()), 500, 250), K(sonTwo(dkL.copy()), 230, 800), K(junbi, 500, 200)]);
    const spear = akL.copy().turn(10).straight("r", [0.95, 1.15, 0], 0.96, "blade").act("armr");
    const spElb = L.F.solve(spear.done()).elbow.r;
    spear.hand("l", add(spElb, [0.02, -0.07, 0]), "open").elbow("l", [0, -1, -0.3]);
    mv("taekwondo.pyeonsonkkeut", "Colpo a punta di dita (pyeonsonkkeut sewo jireugi), l'altra mano sotto il gomito", [K(junbi, 300, 150), K(akL, 450, 250), K(spear, 220, 800), K(junbi, 500, 200)]);
    // due laterali consecutivi: il primo appoggia avanti prima del secondo
    const ypD = { ch: sidePose(gDF, "l", "chamber"), ex: sidePose(gDF, "l", "ext", 1.0) };
    const g96 = g.copy().move(0.96);
    mv("taekwondo.doubleYop", "Due laterali consecutivi: il primo appoggia avanti, subito il secondo con l'altra gamba", [K(g, 260, 80), K(ypCh, 200, 30), K(ypEx, 170, 180), K(ypCh, 160, 10), K(gDF.copy().act(), 190, 60), K(ypD.ch, 190, 30), K(ypD.ex, 170, 180), K(ypD.ch, 160, 10), K(g96.copy().act(), 190, 120), ...backSteps(g96, 0.48, "r"), ...backSteps(g.copy().move(0.48), 0.48, "r")]);
    // O Jang
    const oen = st().foot("l", 0.26, -0.02, -5, 0).foot("r", -0.26, 0.06, -88, 0);
    oen.set("pel", [-0.02, 0.92, 0.01]).set("hipYaw", -45).set("chestYaw", -55).set("chest", [-0.01, 1.42, 0.01]).set("head", [0.02, 1.62, 0]).look(45).hikite("l").hikite("r");
    const hamPrep = oen.copy().handHead("l", -0.04, 0.22, 0.06, "fist").elbow("l", [0, 0.3, -1]);
    const hamHit = oen.copy().handRel("l", 0.48, -0.1, -0.06, "fist").elbow("l", [0, -1, -0.3]).act("arml");
    mv("taekwondo.mejumeok", "Pugno a martello verso il basso (mejumeok naeryo chigi) in oen seogi, gambe tese", [K(junbi, 300, 150), K(hamPrep, 500, 250), K(hamHit, 220, 800), K(junbi, 500, 200)]);
    const elb = akL.copy().turn(30).elbowStrike("r", "horizontal").hikite("l").act("armr");
    mv("taekwondo.palkupDollyo", "Gomitata circolare (palkup dollyo chigi) in ap kubi, l'altro pugno al fianco", [K(junbi, 300, 150), K(akL, 450, 250), K(elb, 200, 800), K(junbi, 500, 200)]);
    const pal = apS.copy().handRel("l", 0.42, -0.1, 0.02, "open").elbow("l", [0, -1, -0.3]);
    const pyCh = sidePose(pal, "r", "chamber");
    const pyEx = sidePose(pal, "r", "ext", 1.0);
    const akR76 = apKubi("r").move(0.76);
    const pyHit = akR76.copy().turn(20).elbowStrike("r", "horizontal").act("armr", "legr");
    const pyElb = L.F.solve(pyHit.done()).elbow.r;
    pyHit.hand("l", add(pyElb, [0.04, 0, -0.02]), "open").elbow("l", [0, -1, -0.4]);
    mv("taekwondo.yopPyojeok", "Laterale e, appoggiando avanti, gomitata nel palmo (pyojeok chigi) nello stesso tempo", [K(junbi, 300, 150), K(pal, 450, 250), K(pyCh, 220, 40), K(pyEx, 180, 200), K(pyCh, 170, 20), K(pyHit, 220, 800), K(junbi, 650, 250)]);
    const koa = st().foot("r", 0.45, 0.02, -8, 0).foot("l", 0.3, 0.12, -20, 40);
    koa.set("pel", [0.36, 0.8, 0.05]).set("hipYaw", -10).set("chestYaw", -15).set("chest", [0.39, 1.29, 0.04]).set("head", [0.42, 1.49, 0.03]).knee("l", [1, 0, 0.2]).knee("r", [1, 0, 0]);
    koa.handHead("r", 0.4, -0.05, 0.0, "fist").elbow("r", [0, -1, 0.2]);
    const koaElb = L.F.solve(koa.done()).elbow.r;
    koa.hand("l", add(koaElb, [0.0, -0.08, -0.02]), "fist").elbow("l", [0, -1, -0.3]).act("armr", "legl", "legr", "head");
    const koaPrep = akL.copy().handRel("r", 0.1, 0.0, -0.15, "fist").elbow("r", [0, -1, 0]);
    const koaAir = air(koa.copy(), 0.1).handRel("r", 0.1, 0.0, -0.15, "fist").handRel("l", 0.25, -0.3, 0, "fist").act("legl", "legr");
    mv("taekwondo.dwitKoa", "Finale: piccolo balzo avanti in dwit koa seogi, pugno a rovescio e kihap", [K(junbi, 300, 150), K(koaPrep, 450, 250), K(koaAir, 200, 0), K(koa, 170, 900), K(junbi, 600, 250)]);
    // Yuk Jang
    const yjCh = roundPose(akL, "r", "chamber", 1.3);
    const yjEx = roundPose(akL, "r", "ext", 1.45);
    const yjLand = T.out(akR.copy(), "r");
    mv("taekwondo.dollyoHighLand", "Dollyo chagi alto da ap kubi, appoggio avanti e subito la parata esterna alta", [K(junbi, 300, 150), K(akL, 450, 250), K(frontChamber(akL, "r"), 200, 20), K(yjCh, 170, 20), K(yjEx, 160, 220), K(yjCh, 160, 20), K(akR.copy().act("legr"), 200, 20), K(yjLand, 180, 700), K(junbi, 650, 250)]);
    const btPrep = akL.copy().handHead("r", -0.05, -0.02, 0.2, "blade").elbow("r", [0, -1, 0.3]).handRel("l", 0.3, -0.1, 0, "fist");
    const btBlock = akL.copy().turn(15).handHead("r", 0.3, -0.06, -0.06, "blade").elbow("r", [0, -1, 0.2]).hikite("l").act("armr");
    mv("taekwondo.bitureoMakki", "Parata alta di taglio della mano con torsione (hansonnal olgul bitureo makki)", [K(junbi, 300, 150), K(btPrep, 500, 250), K(btBlock, 230, 800), K(junbi, 500, 200)]);
    const nar = st().foot("l", 0, -0.2, 0, 0).foot("r", 0, 0.2, 0, 0).set("pel", [0, 0.93, 0]);
    const hcPrep = nar.copy().handRel("l", 0.26, -0.1, 0.05, "fist").handRel("r", 0.27, -0.12, -0.05, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    const hcOpen = nar.copy().handRel("l", 0.2, -0.5, -0.28, "fist").handRel("r", 0.2, -0.5, 0.28, "fist").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]).act("arml", "armr");
    mv("taekwondo.hecheoMakki", "Parata bassa ad apertura (arae hecheo makki): avambracci incrociati, poi giù ai lati", [K(junbi, 300, 150), K(hcPrep, 500, 250), K(hcOpen, 230, 800), K(junbi, 500, 200)]);

    /* ---------------------------------------------------------------- costruire la guardia */
    const feetOnly = g.copy().set("hipYaw", -40).set("chestYaw", -30).look(25).heel("l", 0).heel("r", 0).sink(-0.04);
    feetOnly.handRel("l", 0.03, -0.5, -0.23, "open").handRel("r", 0.03, -0.5, 0.23, "open");
    const torsoOnly = g.copy().handRel("l", 0.05, -0.5, -0.22, "open").handRel("r", 0.05, -0.5, 0.22, "open");
    mv("taekwondo.stepToGuard", "Da charyeot, passo indietro con il destro: piedi a una spalla e mezza, piede dietro in fuori", [K(charyeot, 300, 300), K(feetOnly.copy().act("legr"), 600, 1000)]);
    mv("taekwondo.guardTorso", "Busto di tre quarti, ginocchia morbide, peso a metà, talloni staccati di un dito", [K(feetOnly, 300, 300), K(torsoOnly.copy().act("torso", "legl", "legr"), 600, 1000)]);
    mv("taekwondo.guardHands", "Mani in guardia: sinistra avanti all'altezza della spalla, destra davanti al petto, gomiti stretti", [K(torsoOnly, 300, 300), K(g.copy().act("arml", "armr"), 500, 1000)]);
    mv("taekwondo.guardRecall", "Da rilassato in piedi rientra in guardia in un solo tempo e controlla", [K(st(), 300, 500), K(g.copy().act("legl", "legr", "arml", "armr"), 350, 900), K(st(), 450, 400), K(g.copy().act("legl", "legr", "arml", "armr"), 350, 800)]);
    mv("taekwondo.guardRight", "Guardia destra: piede destro avanti, stessa distanza, stesso angolo, stesse mani", [K(st(), 300, 300), K(gD.copy().act("legl", "legr", "arml", "armr"), 450, 1200), K(st(), 450, 300)]);
    mv("taekwondo.guardWalk", "Recupero camminando in guardia: passi lenti avanti e indietro", [K(g, 300, 100), K(fw1, 380, 100), K(fw2, 320, 250), K(g.copy().move(0.17).step("r", -0.17).shift(-0.08).act("legr"), 380, 100), K(g.copy().act("legl"), 320, 300)]);
    const TBAG = Object.assign({}, BAG, { x: 1.02 });
    mv("taekwondo.bagGuard", "In guardia davanti al sacco, alla distanza del calcio di gamba dietro", [K(g, 300, 1100)], { props: [TBAG] });
    mv("taekwondo.bagDistance", "Distanza dal sacco: a gamba distesa il collo del piede tocca il sacco, caviglia tesa", [K(g, 280, 120), K(bnCh, 300, 200), K(bnEx, 500, 1000), K(bnCh, 300, 100), K(g, 300, 250)], { props: [TBAG] });

    /* ---------------------------------------------------------------- riscaldamento e mobilità per i calci */
    const gtB = st().foot("l", 0, -0.1, 8, 0).foot("r", 0, 0.1, -8, 0).set("pel", [0, 0.94, -0.04]).handPel("l", 0.02, 0.06, -0.19, "open").handPel("r", 0.02, 0.06, 0.19, "open");
    const gtF = legRel(gtB.copy(), "r", [0.3, -0.36, 0.0], [1, 1, 0], 0, 20).act("legr");
    const gtS = legRel(gtB.copy(), "r", [0.06, -0.36, 0.32], [0.3, 0.8, 1.2], -45, 20).act("legr");
    mv("taekwondo.gate", "Apri il cancello: ginocchio su davanti, aprilo di lato e appoggia; poi il giro al contrario", [K(gtB, 300, 100), K(gtF, 350, 80), K(gtS, 350, 80), K(gtB, 300, 150), K(gtS, 350, 80), K(gtF, 350, 80), K(gtB, 300, 250)]);
    const fkB = st().foot("l", 0, -0.1, 5, 0).foot("r", 0, 0.1, -5, 0);
    const fkR = fkB.copy().set("pel", [-0.02, 0.94, -0.05]).handRel("l", 0.5, -0.04, 0.06, "open").elbow("l", [0, -1, 0]);
    legRel(fkR, "r", mul(norm([0.6, 0.62, -0.12]), 0.85), [1, 0.2, 0], 0, -10, 0).act("legr");
    const fkL = fkB.copy().set("pel", [-0.02, 0.94, 0.05]).handRel("r", 0.5, -0.04, -0.06, "open").elbow("r", [0, -1, 0]);
    legRel(fkL, "l", mul(norm([0.6, 0.62, 0.12]), 0.85), [1, 0.2, 0], 0, -10, 0).act("legl");
    mv("taekwondo.frankenstein", "Camminata Frankenstein: la gamba tesa sale verso la mano opposta tesa davanti, alternando", [K(fkB, 300, 80), K(fkR, 400, 80), K(fkB, 350, 60), K(fkL, 400, 80), K(fkB, 350, 200)]);
    const ssB = st().foot("l", 0, -0.1, 5, 0).foot("r", 0, 0.1, -5, 0).set("pel", [0, 0.94, -0.05]).lean(0, -0.04);
    prop(ssB, "l", 0.02, 1.2, -0.52);
    const ssUp = (k) => legRel(ssB.copy(), "r", mul(norm([0.08, k, 0.85]), 0.85), [0, 1, 0.2], -8, 0, -80).act("legr");
    mv("taekwondo.sideSwingOpen", "Slanci laterali in apertura: mano al muro, gamba esterna tesa di lato, taglio del piede in alto", [K(ssB, 300, 80), K(ssUp(-0.4), 350, 60), K(ssB, 320, 40), K(ssUp(-0.05), 350, 60), K(ssB, 320, 200)]);
    const bsB = st().foot("l", 0, -0.1, 3, 0).foot("r", 0, 0.1, -3, 0).lean(0.08);
    prop(bsB, "l", 0.48, 1.32, -0.2);
    prop(bsB, "r", 0.48, 1.32, 0.2);
    const bsUp = legRel(bsB.copy().lean(0.06), "r", mul(norm([-0.6, -0.62, 0.02]), 0.85), [0, -1, 0], 0, 30, 0).act("legr");
    const bsFw = legRel(bsB.copy(), "r", mul(norm([0.35, -0.85, 0.02]), 0.85), [1, 0, 0], 0, 20, 0).act("legr");
    mv("taekwondo.backSwing", "Slanci all'indietro con le mani al muro: gamba tesa che va dietro, busto fermo", [K(bsB, 300, 80), K(bsFw, 320, 20), K(bsUp, 350, 60), K(bsFw, 350, 20), K(bsUp, 350, 60), K(bsB, 350, 200)]);
    const half = roundPose(g, "r", "ext", 0.95, { hip: 80, chest: 50, sup: 120, k: 0.68 });
    mv("taekwondo.chamberSwing", "Slancio in caricamento laterale: il ginocchio sale di lato e la gamba si apre a metà", [K(g, 280, 80), K(dlCh, 300, 60), K(half, 260, 100), K(dlCh, 240, 40), K(g, 280, 250)]);
    const pv = g.copy().set("hipYaw", 15).set("chestYaw", 0).look(0).fyaw("l", 150).heel("l", 25).act("legl", "torso");
    pv.p.foot.r = [-0.14, 0.13, 0.14];
    pv.fyaw("r", 0).knee("r", [1, 0.3, 0]).guard("low");
    mv("taekwondo.pivotDrill", "Perno a vuoto: ruota sull'avampiede avanti finché il tallone guarda in avanti, poi torna", [K(g, 280, 100), K(pv, 500, 400), K(g, 450, 150), K(pv, 500, 400), K(g, 450, 250)]);
    mv("taekwondo.guardTwist", "Rotazioni del busto in guardia: le spalle girano, i piedi restano fermi", [K(g, 280, 60), K(g.copy().twist(38).look(-5).act("torso"), 400, 60), K(g.copy().twist(-30).look(55).act("torso"), 500, 60), K(g.copy().twist(38).look(-5).act("torso"), 500, 60), K(g, 400, 200)]);

    /* ---------------------------------------------------------------- condizionamento in piedi */
    const oneLeg = (b) => legRel(b, "r", [0.1, -0.6, 0.02], [1, 0.2, 0], 0, 25);
    const bpB = oneLeg(st().set("pel", [0, 0.92, -0.07]).foot("l", 0, -0.1, 0, 12).handPel("l", 0.02, 0.06, -0.19, "open").handPel("r", 0.02, 0.06, 0.19, "open"));
    const bpT = about(bpB.copy(), 90, 0, -0.1).act("legl", "torso");
    mv("taekwondo.balancePivot", "Equilibrio con perno: su una gamba, ginocchio morbido, ruota lento di un quarto di giro e torna", [K(bpB, 300, 300), K(bpT, 900, 400), K(bpB, 900, 300)]);
    const crB = st().foot("l", 0, -0.08, 5, 0).set("pel", [0, 0.94, -0.06]);
    crB.footAt("r", [-0.12, 0.2, -0.03], 0, 40).knee("r", [1, 0, 0]).handRel("r", 0.05, -0.5, 0.22, "open");
    prop(crB, "l", 0.05, 1.25, -0.5);
    const crUp = crB.copy().sink(-0.07).heel("l", 40).act("legl");
    crUp.p.foot.r = add(crUp.p.foot.r, [0, 0.07, 0]);
    mv("taekwondo.calfRaiseSingle", "Polpaccio su una gamba: un dito al muro, sali sulla punta, tieni in alto e scendi piano", [K(crB, 300, 200), K(crUp, 500, 900), K(crB, 600, 300)]);
    const sqU = st().foot("l", 0, -0.1, 5, 0).set("pel", [0, 0.94, -0.06]).footAt("r", [0.3, 0.16, 0.08], 0, -20).knee("r", [1, 0.5, 0]).handRel("l", 0.4, -0.1, -0.1, "fist").handRel("r", 0.4, -0.1, 0.1, "fist");
    const sqD = sqU.copy().set("pel", [-0.2, 0.52, -0.07]).set("chest", [0.08, 0.95, -0.04]).set("head", [0.17, 1.13, -0.03]).footAt("r", [0.52, 0.28, 0.08], 0, -30).knee("l", [1, 0, -0.1]).handRel("l", 0.42, -0.05, -0.1, "fist").handRel("r", 0.42, -0.05, 0.1, "fist").act("legl");
    mv("taekwondo.singleSquat", "Mezzo squat su una gamba alla sedia: ti siedi sul bordo in 3 secondi e ti rialzi", [K(sqU, 300, 200), K(sqD, 1500, 300), K(sqU, 1100, 300)]);
    const slB = st().set("pel", [0, 0.94, -0.05]);
    prop(slB, "l", 0.02, 0.98, -0.4);
    const slUp = legRel(slB.copy().lean(0, -0.05), "r", mul(norm([0.02, -0.78, 0.6]), 0.86), [1, 0, 0], -5, 0, 0).act("legr");
    mv("taekwondo.sideLegLift", "Alla sedia: solleva lenta la gamba tesa di lato e tieni 2 secondi in alto", [K(slB, 300, 200), K(slUp, 900, 1100), K(slB, 900, 300)]);
    const hkG = (s) => {
      const b = st().sink(-0.02).footAt(s, [0.3, 0.62, sgn(s) * 0.1], 0, 40).knee(s, [1, 1, 0]).foot(other(s), -0.04, -sgn(s) * 0.1, 0, 25);
      b.handHead("l", 0.2, -0.14, -0.1, "fist").handHead("r", 0.18, -0.16, 0.1, "fist");
      return b.act("leg" + s);
    };
    mv("taekwondo.highKneesGuard", "Skip a ginocchia alte esplosivo sul posto, braccia in guardia", [K(hkG("l"), 200, 20), K(hkG("r"), 180, 20), K(hkG("l"), 180, 20), K(hkG("r"), 180, 20), K(hkG("l"), 180, 20), K(hkG("r"), 180, 120)]);
    const gS = g.copy().foot("l", 0.13, -0.04, -60, 12).foot("r", -0.13, 0.06, -80, 14);
    const gKn = (s) => {
      const b = frontChamber(gS, s);
      legRel(b, s, [0.2, -0.06, -sgn(s) * 0.02], [1, 1.2, 0], 0, 30, 0);
      return b.handHead("l", 0.14, -0.15, -0.07, "fist").handHead("r", 0.12, -0.16, 0.07, "fist");
    };
    mv("taekwondo.guardKnees", "In guardia, ginocchia al petto alternate il più veloce possibile, mani ferme al mento", [K(g, 250, 40), K(gKn("r"), 170, 20), K(gKn("l"), 170, 20), K(gKn("r"), 170, 20), K(gKn("l"), 170, 20), K(gKn("r"), 170, 20), K(g, 220, 200)]);
    const skA = (dx) => air(st().move(dx).footAt("r", [0.32, 0.6, 0.1], 0, 40).knee("r", [1, 1, 0]).foot("l", -0.04, -0.1, 0, 30).handRel("l", 0.25, -0.2, -0.2, "fist").handRel("r", -0.1, -0.25, 0.22, "fist"), 0.06).act("legr");
    const skB = (dx) => air(st().move(dx).footAt("l", [0.32, 0.6, -0.1], 0, 40).knee("l", [1, 1, 0]).foot("r", -0.04, 0.1, 0, 30).handRel("r", 0.25, -0.2, 0.2, "fist").handRel("l", -0.1, -0.25, -0.22, "fist"), 0.06).act("legl");
    mv("taekwondo.skipHigh", "Skip alto in avanti: il ginocchio guida ogni salto", [K(st(), 250, 40), K(skA(0.12), 220, 30), K(skB(0.3), 220, 30), K(skA(0.48), 220, 30), K(skB(0.66), 220, 30), K(st().move(0.75), 220, 250)]);
    const skL = st().set("pel", [-0.05, 0.78, -0.3]).set("chest", [0.12, 1.24, -0.27]).set("head", [0.2, 1.43, -0.26]).foot("l", 0, -0.32, 5, 0).footAt("r", [-0.28, 0.24, -0.16], 0, 30).knee("r", [1, 0, 0]).knee("l", [1, 0, -0.2]).handRel("r", 0.3, -0.25, -0.15, "open").handRel("l", -0.1, -0.35, -0.2, "open").act("legl");
    const skR = skL.copy().mirror();
    const skMid = air(st().sink(0.05).handRel("l", 0.2, -0.3, -0.2, "open").handRel("r", 0.2, -0.3, 0.2, "open"), 0.12).act("legl", "legr");
    mv("taekwondo.skater", "Skater: salto laterale da un piede all'altro, atterraggio morbido su un piede, fermo un secondo", [K(st(), 300, 80), K(skL, 350, 700), K(skMid, 220, 0), K(skR, 220, 700), K(skMid, 220, 0), K(skL, 220, 600), K(st(), 400, 200)]);
    const ljL = lunge("l").handRel("l", 0.15, -0.3, -0.2, "fist").handRel("r", 0.15, -0.3, 0.2, "fist");
    const ljR = lunge("r").handRel("l", 0.15, -0.3, -0.2, "fist").handRel("r", 0.15, -0.3, 0.2, "fist");
    const ljAir = air(landMid(ljL, ljR).sink(-0.12), 0.12).act("legl", "legr");
    mv("taekwondo.jumpLunge", "Affondi saltati bassi: dall'affondo cambia gamba in aria con un salto di pochi centimetri", [K(st(), 300, 60), K(ljL, 400, 200), K(ljAir, 200, 0), K(ljR.copy().act("legl", "legr"), 200, 300), K(ljAir, 200, 0), K(ljL.copy().act("legl", "legr"), 200, 300), K(st(), 400, 200)]);
    const wkB = st().foot("l", 0, -0.08, 0, 0).foot("r", 0, 0.08, 0, 0).set("chest", [0.12, 1.42, 0]).set("head", [0.2, 1.6, 0]);
    prop(wkB, "l", 0.5, 1.3, -0.18);
    prop(wkB, "r", 0.5, 1.3, 0.18);
    const wkCh = legRel(wkB.copy().set("pel", [0, 0.94, -0.05]), "r", [0.18, -0.25, 0.0], [1, 1, 0], 0, 50, 0).act("legr");
    const wkEx = legRel(wkB.copy().set("pel", [0, 0.94, -0.05]).lean(0.08), "r", mul(norm([-0.85, -0.42, 0.0]), 0.85), [0, -1, 0], 0, 82, 0).act("legr");
    mv("taekwondo.wallBackKick", "Fronte al muro: ginocchio al petto e tallone che spinge dritto dietro, punta in basso", [K(wkB, 300, 150), K(wkCh, 350, 250), K(wkEx, 300, 600), K(wkCh, 300, 150), K(wkB, 300, 250)]);

    /* ---------------------------------------------------------------- condizionamento a terra */
    // sdraiato sul fianco sinistro, testa avanti (come il plank laterale, ma giù)
    const sideLie = st().set("pel", [-0.2, 0.17, 0]).set("chest", [0.28, 0.2, 0]).set("head", [0.48, 0.27, 0]).set("hipYaw", 0).set("chestYaw", 0).set("chestRoll", -90).set("hipRoll", -90);
    sideLie.footAt("l", [-1.06, 0.075, 0.0], 0, 0, 90).footAt("r", [-1.06, 0.17, 0.0], 0, 0, 90).knee("l", [0, 0, 1]).knee("r", [0, 0, 1]);
    sideLie.handW("l", 0.76, 0.05, 0.06, "open").elbow("l", [0, 1, 0]).handW("r", 0.22, 0.05, 0.3, "open").elbow("r", [0, 1, 0]);
    const sideUp = legRel(sideLie.copy(), "r", mul(norm([-0.85, 0.42, 0.0]), 0.86), [0, 0, 1], 0, 0, 90).act("legr");
    mv("taekwondo.sideLegRaise", "Sdraiato su un fianco, gambe tese: solleva la gamba di sopra, punta avanti, bacino fermo", [K(sideLie, 300, 200), K(sideUp, 600, 300), K(sideLie, 600, 200), K(sideUp, 600, 300), K(sideLie, 600, 200)]);
    const clam = sideLie.copy().footAt("l", [-0.72, 0.075, 0.0], 0, 0, 90).footAt("r", [-0.72, 0.17, 0.0], 0, 0, 90).knee("l", [0, 0, 1]).knee("r", [0, 0, 1]);
    const clamUp = clam.copy().knee("r", [0, 1.2, 0.7]).act("legr");
    mv("taekwondo.clamshell", "Conchiglia: sul fianco, ginocchia piegate, apri il ginocchio di sopra con i piedi uniti", [K(clam, 300, 200), K(clamUp, 500, 700), K(clam, 500, 200), K(clamUp, 500, 700), K(clam, 500, 200)]);
    const dbB = lieBack().handW("l", -0.5, 0.66, -0.18, "open").handW("r", -0.5, 0.66, 0.18, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    dbB.footAt("l", [0.42, 0.56, -0.12], 0, 0).footAt("r", [0.42, 0.56, 0.12], 0, 0).knee("l", [-0.2, 1, 0]).knee("r", [-0.2, 1, 0]);
    const dbE = dbB.copy().handW("r", -1.05, 0.2, 0.2, "open").elbow("r", [0, 1, 0.3]).footAt("l", [0.84, 0.16, -0.12], 0, -20).knee("l", [0, 1, 0]).act("armr", "legl");
    const dbE2 = dbB.copy().handW("l", -1.05, 0.2, -0.2, "open").elbow("l", [0, 1, -0.3]).footAt("r", [0.84, 0.16, 0.12], 0, -20).knee("r", [0, 1, 0]).act("arml", "legr");
    mv("taekwondo.deadBug", "Dead bug: braccia e ginocchia in alto, distendi lenti braccio e gamba opposti, schiena a terra", [K(dbB, 300, 200), K(dbE, 800, 300), K(dbB, 700, 100), K(dbE2, 800, 300), K(dbB, 700, 200)]);
    const hh = lieBack().set("chest", [-0.46, 0.24, 0]).set("head", [-0.62, 0.36, 0]).footAt("l", [0.82, 0.3, -0.06], 0, -50).footAt("r", [0.82, 0.3, 0.06], 0, -50).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).handW("l", 0.02, 0.32, -0.24, "open").handW("r", 0.02, 0.32, 0.24, "open").elbow("l", [0, 1, -0.4]).elbow("r", [0, 1, 0.4]);
    mv("taekwondo.hollowHold", "Hollow hold: sulla schiena, gambe e spalle sollevate, zona lombare a terra, tieni", [K(lieBack(), 300, 200), K(hh.act("torso", "legl", "legr"), 600, 1600), K(lieBack(), 600, 200)]);
    const brS = lieBack({ kneesUp: true }).set("pel", [0.05, 0.38, 0]).set("chest", [-0.42, 0.2, 0]).set("head", [-0.62, 0.14, 0]).footAt("r", [0.78, 0.44, 0.12], 0, -40).knee("r", [0, 1, 0]).act("torso", "legl");
    mv("taekwondo.bridgeSingle", "Ponte su una gamba: l'altra tesa, spingi i fianchi in alto con il bacino orizzontale", [K(lieBack({ kneesUp: true }), 300, 150), K(brS, 500, 600), K(lieBack({ kneesUp: true }), 450, 200)]);
    const af = allFours();
    const dk = af.copy().footAt("r", [-0.72, 0.95, 0.12], 0, -80).knee("r", [-1, -0.3, 0]).act("legr");
    mv("taekwondo.donkeyKick", "Calcio dell'asino in quadrupedia: tallone verso il soffitto, ginocchio a 90 gradi, schiena ferma", [K(af, 300, 200), K(dk, 450, 400), K(af, 400, 150), K(dk, 450, 400), K(af, 400, 200)]);
    const qbk = af.copy().footAt("r", [-1.16, 0.5, 0.12], 180, -70).knee("r", [0, -1, 0]).act("legr");
    mv("taekwondo.quadBackKick", "Calcio all'indietro in quadrupedia: la gamba si distende dritta dietro all'altezza dell'anca", [K(af, 300, 200), K(qbk, 500, 400), K(af, 450, 150), K(qbk, 500, 400), K(af, 450, 200)]);
    const spl = st().set("pel", [-0.18, 0.36, 0]).set("chest", [0.3, 0.52, 0]).set("head", [0.49, 0.58, 0]).set("hipYaw", 0).set("chestYaw", 0).set("chestRoll", -90).set("hipRoll", -90);
    spl.footAt("l", [-1.0, 0.075, 0.0], 0, 0, 90).footAt("r", [-1.0, 0.17, 0.0], 0, 0, 90).handW("l", 0.3, 0.04, 0.28, "fist").handW("r", 0.3, 1.2, 0.0, "open").elbow("l", [0, -1, 0]).knee("l", [0, 0, 1]).knee("r", [0, 0, 1]);
    const splUp = legRel(spl.copy(), "r", mul(norm([-0.85, 0.3, 0.0]), 0.86), [0, 0, 1], 0, 0, 90).act("torso", "legr");
    mv("taekwondo.sidePlankLeg", "Plank laterale sull'avambraccio con la gamba di sopra sollevata tesa", [K(spl, 300, 200), K(splUp, 500, 1400), K(spl, 500, 200)]);
    const pf = plank({ forearms: true });
    const pfR = spl.copy().mirror().act("torso");
    mv("taekwondo.plankRotate", "Plank con rotazione: dal plank sugli avambracci ruoti in plank laterale e torni, poi dall'altro lato", [K(pf, 300, 400), K(spl.copy().act("torso"), 500, 500), K(pf, 500, 300), K(pfR, 500, 500), K(pf, 500, 300)]);
    const seat = st().set("pel", [-0.05, 0.52, 0]).set("chest", [-0.08, 1.02, 0]).set("head", [-0.06, 1.22, 0]).foot("l", 0.38, -0.12, 0, 0).foot("r", 0.38, 0.12, 0, 0).knee("l", [1, 0.3, 0]).knee("r", [1, 0.3, 0]);
    seat.handW("l", -0.08, 0.5, -0.24, "open").handW("r", -0.08, 0.5, 0.24, "open").elbow("l", [-1, 0, 0]).elbow("r", [-1, 0, 0]);
    const seatUp = seat.copy().set("chest", [-0.16, 1.0, 0]).set("head", [-0.16, 1.2, 0]).footAt("l", [0.12, 0.85, -0.1], 0, 20).footAt("r", [0.12, 0.85, 0.1], 0, 20).knee("l", [0.4, 1, 0]).knee("r", [0.4, 1, 0]).act("legl", "legr", "torso");
    mv("taekwondo.seatedKneeTuck", "Sul bordo della sedia, mani ai lati: porta le ginocchia al petto e scendi lento", [K(seat, 300, 200), K(seatUp, 450, 300), K(seat, 800, 200), K(seatUp, 450, 300), K(seat, 800, 200)]);

    /* ---------------------------------------------------------------- allungamenti */
    const hrd = sitLong().footAt("l", [0.3, 0.06, 0.02], 0, 0, -80).knee("l", [0, 0.3, -1]);
    const hrdF = hrd.copy().set("chest", [0.38, 0.46, 0.06]).set("head", [0.55, 0.42, 0.08]).handW("l", 0.74, 0.12, 0.06, "open").handW("r", 0.74, 0.12, 0.18, "open").act("torso", "legr");
    mv("taekwondo.hurdlerStretch", "Posteriori da seduto: una gamba tesa, l'altra piegata con il piede all'interno coscia, busto avanti", [K(hrd, 300, 150), K(hrdF, 900, 1500), K(hrd, 700, 200)]);
    const hsp = st().set("pel", [-0.2, 0.52, 0]).set("chest", [0.22, 0.78, 0]).set("head", [0.4, 0.86, 0]);
    hsp.footAt("l", [-0.62, 0.07, -0.1], 180, -85).knee("l", [1, -0.3, 0]).footAt("r", [0.55, 0.07, 0.1], 0, -70).knee("r", [0, 1, 0]);
    hsp.handW("l", 0.4, 0.28, -0.12, "open").handW("r", 0.4, 0.28, 0.26, "open");
    const hspP = hsp.copy().act("legr");
    const hspD = hsp.copy().set("chest", [0.26, 0.74, 0]).set("head", [0.45, 0.8, 0]).act("torso", "legr");
    mv("taekwondo.halfSplit", "Mezza spaccata: in ginocchio, gamba davanti tesa con il tallone a terra, busto lungo in avanti", [K(hsp, 400, 1600), K(hspD, 900, 1200), K(hsp, 700, 300)]);
    mv("taekwondo.halfSplitPress", "Contrai-rilassa: in mezza spaccata premi il tallone a terra, poi rilassa e scendi un poco", [K(hsp, 400, 800), K(hspP, 300, 1300), K(hsp, 300, 400), K(hspD, 900, 1300), K(hsp, 600, 200)]);
    const fsp = st().set("pel", [0.0, 0.36, 0]).set("chest", [0.03, 0.86, 0]).set("head", [0.05, 1.06, 0]);
    fsp.footAt("r", [0.74, 0.07, 0.1], 0, -70).knee("r", [0, 1, 0]).footAt("l", [-0.8, 0.06, -0.1], 180, -80).knee("l", [0, -1, 0]);
    fsp.handW("l", 0.02, 0.48, -0.42, "open").handW("r", 0.02, 0.48, 0.42, "open").elbow("l", [0, -0.3, -1]).elbow("r", [0, -0.3, 1]);
    mv("taekwondo.frontSplit", "Spaccata frontale assistita: mani su due sedie, gamba avanti tesa, ginocchio dietro sul cuscino", [K(st(), 300, 100), K(lunge("r").handW("l", 0.02, 0.6, -0.42, "open").handW("r", 0.02, 0.6, 0.42, "open"), 700, 300), K(fsp.act("legl", "legr"), 900, 1600), K(st(), 800, 200)]);
    const ssp = st().set("pel", [0, 0.6, 0]).set("chest", [0.24, 1.02, 0]).set("head", [0.38, 1.16, 0]).foot("l", 0, -0.79, 0, 0).foot("r", 0, 0.79, 0, 0).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]);
    ssp.handW("l", 0.3, 0.5, -0.34, "open").handW("r", 0.3, 0.5, 0.34, "open");
    mv("taekwondo.sideSplit", "Spaccata laterale assistita: tra due sedie apri le gambe di lato, peso sulle mani, punte avanti", [K(st(), 300, 100), K(ssp.act("legl", "legr"), 1000, 1600), K(st(), 900, 200)]);
    const law = st().foot("l", 0.48, -0.12, 0, 0).footAt("r", [-0.55, 0.06, 0.12], 180, 0).knee("r", [0, -1, 0]).set("pel", [-0.05, 0.48, 0]).set("chest", [-0.06, 0.98, 0]).set("head", [-0.05, 1.18, 0]);
    law.handW("l", 0.28, 0.6, -0.13, "open").handW("r", -0.06, 1.5, 0.12, "open").elbow("r", [0, 0, 1]);
    mv("taekwondo.lungeArmUp", "Affondo basso con il ginocchio dietro sul cuscino e il braccio dello stesso lato in alto", [K(st(), 300, 100), K(law.act("legr", "torso", "armr"), 900, 1500), K(st(), 700, 200)]);
    const f4 = lieBack({ kneesUp: true }).footAt("l", [0.2, 0.52, -0.1], 0, -10).knee("l", [0, 1, 0]).footAt("r", [0.02, 0.56, -0.02], 0, 0).knee("r", [0.2, 0.5, 1]);
    f4.handW("l", -0.02, 0.4, -0.16, "open").handW("r", -0.04, 0.36, 0.06, "open");
    mv("taekwondo.figure4", "Figura 4: sdraiato, caviglia sopra il ginocchio opposto, tira piano la coscia verso il petto", [K(lieBack({ kneesUp: true }), 300, 150), K(f4.act("legl", "legr"), 800, 1500), K(lieBack({ kneesUp: true }), 700, 200)]);

    mv("taekwondo.mireoDwiHuryeo","Mireo di gamba avanti per fermare, appoggio, dwi huryeo con la gamba dietro", [K(g, 250, 80), K(gHop.copy().act("legr"), 140, 0), R(msCh, 150, 40), K(msEx, 160, 220), R(msCh, 140, 20), R(gFw2, 170, 60), ...dwiHuryeoFrames(gFw2, 1.1, true).slice(1), ...backSteps(gFw2, 0.2, "r")]);
  });
})(typeof window !== "undefined" ? window : globalThis);
