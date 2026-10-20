/*
 * Progetto A - Difesa: movimenti della lotta (prefisso "lotta.").
 * Posizione sfalsata con il sinistro avanti (wrestle) e frontale (piedi in linea).
 * Il compagno (in blu) fa da avversario o da manichino nelle prese e nel lavoro a terra.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { mv, K, standing, wrestle, allFours, lieBack, lieFront, kneel, sitLong, ankleY } = L;

    /* ---------------------------------------------------------------- aiuti */
    // sposta e gira una posa costruita all'origine (per il compagno e per i giri attorno a un punto)
    const place = (b, yaw, x, z) => { const c = b.copy(); c.p.o = [0, 0]; if (yaw) c.spin(yaw); c.move(x || 0, z || 0); c.p.o = [0, 0]; return c; };
    const opp = (b, d = 0.95) => place(b, 180, d, 0);
    const around = (b, cx, cz, deg) => { const c = b.copy(); c.p.o = [cx, cz]; c.spin(deg); c.p.o = [0, 0]; return c; };
    const P = (b) => b.done();
    // fotogrammi a specchio (dall'altro lato), compagno compreso
    const mirrorFrames = (frames) => frames.map((f) => K(f.p.copy().mirror(), f.t, f.h, f.act ? f.act.map((a) => a.replace(/(arm|leg)([lr])$/, (m, x, s) => x + (s === "l" ? "r" : "l"))) : f.act, f.partner ? f.partner.copy().mirror() : undefined));

    /* ---------------------------------------------------------------- posizioni */
    const g = wrestle();                       // sfalsata, sinistro avanti
    const gR = g.copy().mirror();              // sfalsata, destro avanti
    function square() {
      const b = standing();
      b.foot("l", 0.02, -0.26, 8, 8).foot("r", 0.02, 0.26, -8, 8);
      b.set("pel", [-0.06, 0.72, 0]).set("hipYaw", 0).set("chestYaw", 0).set("chest", [0.16, 1.16, 0]).set("head", [0.3, 1.31, 0]);
      b.knee("l", [1, 0, -0.25]).knee("r", [1, 0, 0.25]);
      return b.guard("wrestle");
    }
    const sq = square();
    const up = standing();

    mv("lotta.squareStance", "Posizione frontale: piedi paralleli e larghi, anche basse, busto avanti", [K(up, 300, 200), K(sq.copy().act("legl", "legr", "torso"), 600, 1000), K(up, 500, 200)]);
    mv("lotta.stance", "Posizione sfalsata: sinistro avanti, peso diviso, ginocchia piegate", [K(up, 300, 200), K(g.copy().act("legl", "legr"), 600, 1000), K(up, 500, 200)]);
    mv("lotta.stanceR", "Posizione sfalsata con il destro avanti", [K(up, 300, 200), K(gR.copy().act("legl", "legr"), 600, 1000), K(up, 500, 200)]);
    const handsIn = g.copy().handHead("l", 0.36, -0.46, -0.1, "open").handHead("r", 0.32, -0.48, 0.12, "open").act("arml", "armr", "head");
    mv("lotta.hands", "Mani davanti alle ginocchia, gomiti stretti ai fianchi, testa su", [K(g, 300, 200), K(handsIn, 400, 900), K(g, 400, 300)]);
    mv("lotta.stanceHold", "Posizione sfalsata ferma, pronta", [K(g, 400, 1000)]);
    const clap = up.copy().handRel("l", 0.32, -0.18, -0.02, "open").handRel("r", 0.32, -0.18, 0.02, "open").act("arml", "armr");
    mv("lotta.dropIn", "Battito di mani e giù in posizione in un solo tempo, poi su", [K(up, 300, 200), K(clap, 200, 120), K(g.copy().act("legl", "legr"), 260, 700), K(up, 450, 300)]);
    mv("lotta.dropInSquare", "Battito di mani e giù in posizione frontale, poi su", [K(up, 300, 200), K(clap, 200, 120), K(sq.copy().act("legl", "legr"), 260, 700), K(up, 450, 300)]);
    mv("lotta.dropInR", "Battito di mani e giù in sfalsata destra, poi su", [K(up, 300, 200), K(clap, 200, 120), K(gR.copy().act("legl", "legr"), 260, 700), K(up, 450, 300)]);

    /* ---------------------------------------------------------------- motion */
    const fA = g.copy().step("l", 0.16).shift(0.07).act("legl");
    const fB = g.copy().move(0.16).act("legr");
    const bA = g.copy().move(0.16).step("r", -0.16).shift(-0.07).act("legr");
    mv("lotta.motionFB", "Motion avanti e indietro: passo e richiamo, piedi che sfiorano il tappeto", [K(g, 300, 100), K(fA, 220, 60), K(fB, 200, 120), K(bA, 220, 60), K(g.copy().act("legl"), 200, 200)]);
    const sA = g.copy().step("r", 0, 0.17).shift(0, 0.08).act("legr");
    const sB = g.copy().move(0, 0.17).act("legl");
    const sC = g.copy().move(0, 0.17).step("l", 0, -0.17).shift(0, -0.08).act("legl");
    mv("lotta.motionSide", "Motion laterale: parte il piede dal lato verso cui vai, l'altro segue", [K(g, 300, 100), K(sA, 220, 60), K(sB, 200, 120), K(sC, 220, 60), K(g.copy().act("legr"), 200, 200)]);
    const lead = [0.22, -0.18];
    const pivA = around(g, lead[0], lead[1], -35).act("legr", "torso");
    const pivB = around(g, lead[0], lead[1], 35).act("legr", "torso");
    mv("lotta.circle", "Cerchio: perno sul piede avanti, il piede dietro gira a destra e a sinistra", [K(g, 300, 100), K(pivA, 340, 200), K(g, 300, 100), K(pivB, 340, 200), K(g, 300, 200)]);
    const angA = g.copy().step("l", 0.2, -0.2).shift(0.1, -0.1).act("legl");
    const angB = place(g, -15, 0.2, -0.2).act("legr", "torso");
    mv("lotta.angleStep", "Passo d'angolo: in diagonale avanti e fuori, poi ritorno in posizione", [K(g, 300, 100), K(angA, 230, 60), K(angB, 220, 300), K(g, 320, 200)]);
    const shuf = sq.copy().sink(0.04);
    const shA = shuf.copy().step("r", 0, 0.22).shift(0, 0.1).act("legr");
    const shB = shuf.copy().move(0, 0.22).act("legl");
    mv("lotta.shuffle", "Passi laterali scivolati in posizione bassa, la testa non sale", [K(shuf, 300, 60), K(shA, 200, 40), K(shB, 180, 60), K(shB.copy().step("r", 0, 0.22).shift(0, 0.1).act("legr"), 200, 40), K(shuf.copy().move(0, 0.44).act("legl"), 180, 100), K(shuf.copy().move(0, 0.44).step("l", 0, -0.22).shift(0, -0.1).act("legl"), 200, 40), K(shB.copy().act("legr"), 180, 60), K(shB.copy().step("l", 0, -0.22).shift(0, -0.1), 200, 40), K(shuf, 180, 200)]);
    mv("lotta.switchStance", "Cambio di posizione: il piede dietro passa avanti con un passo", [K(g, 300, 100), K(g.copy().step("r", 0.22, -0.1).shift(0.08).act("legr"), 240, 80), K(gR.copy().act("legl"), 240, 300), K(gR, 200, 100)]);

    /* ---------------------------------------------------------------- livello, affondo, squat */
    const lv = g.copy().sink(0.2).lean(0.04).handHead("l", 0.36, -0.42, -0.14).handHead("r", 0.3, -0.46, 0.16).act("legl", "legr");
    mv("lotta.levelChange", "Cambio di livello: le anche scendono di colpo, testa e busto allineati", [K(g, 260, 100), K(lv, 180, 260), K(g.copy().act("legl", "legr"), 240, 260)]);
    mv("lotta.levelChangeR", "Cambio di livello con il destro avanti", [K(gR, 260, 100), K(lv.copy().mirror(), 180, 260), K(gR.copy().act("legl", "legr"), 240, 260)]);
    function halfShot() {
      const b = g.copy();
      b.foot("l", 0.66, -0.16, -8, 0).foot("r", -0.2, 0.2, -12, 50);
      b.set("pel", [0.26, 0.52, 0.02]).set("hipYaw", -10).set("chestYaw", -8).set("chest", [0.46, 0.98, 0.01]).set("head", [0.6, 1.13, 0.0]);
      b.knee("l", [1, 0.3, 0]).knee("r", [0.4, -1, 0]);
      b.handHead("l", 0.3, -0.36, -0.14, "open").handHead("r", 0.26, -0.4, 0.14, "open");
      return b.act("legl", "legr");
    }
    const hs = halfShot();
    mv("lotta.halfShot", "Mezzo passo di penetrazione: livello giù e passo lungo, ginocchio dietro alto", [K(g, 260, 100), K(lv, 170, 40), K(hs, 220, 380), K(g.copy().act("legr"), 300, 300)]);
    mv("lotta.halfShotR", "Mezzo passo di penetrazione con il destro avanti", [K(gR, 260, 100), K(lv.copy().mirror(), 170, 40), K(hs.copy().mirror(), 220, 380), K(gR.copy().act("legl"), 300, 300)]);
    function deepLunge() {
      const b = g.copy();
      b.foot("l", 0.78, -0.16, -5, 0).foot("r", -0.22, 0.18, -10, 65);
      b.set("pel", [0.26, 0.44, 0.02]).set("hipYaw", -6).set("chestYaw", -6).set("chest", [0.3, 0.94, 0.01]).set("head", [0.33, 1.14, 0.0]);
      b.knee("l", [1, 0.3, 0]).knee("r", [0.5, -1, 0]);
      b.handRel("l", 0.25, -0.15, -0.12, "open").handRel("r", 0.25, -0.15, 0.12, "open");
      return b.act("legl", "legr");
    }
    const dl = deepLunge();
    mv("lotta.deepLunge", "Affondo profondo: passo lungo, ginocchio dietro a un palmo dal tappeto, busto dritto", [K(g, 300, 100), K(dl, 450, 2000), K(g.copy().act("legl"), 400, 300)]);
    const wsq = sq.copy().foot("l", 0.02, -0.32, 15, 0).foot("r", 0.02, 0.32, -15, 0).set("pel", [-0.18, 0.5, 0]).set("chest", [0.12, 0.89, 0]).set("head", [0.26, 1.05, 0]).knee("l", [1, 0, -0.4]).knee("r", [1, 0, 0.4]);
    wsq.handRel("l", 0.32, -0.08, -0.12, "open").handRel("r", 0.32, -0.08, 0.12, "open");
    mv("lotta.wrestlerSquat", "Squat del lottatore: piedi larghi, cosce parallele, schiena piatta, mani avanti", [K(sq, 300, 100), K(wsq.act("legl", "legr"), 600, 2000), K(sq, 500, 300)]);

    /* ---------------------------------------------------------------- penetrazione */
    function pen1() {
      const b = g.copy();
      b.foot("l", 0.62, -0.15, -6, 0).foot("r", -0.21, 0.2, -12, 55);
      b.set("pel", [0.38, 0.42, 0.03]).set("hipYaw", -8).set("chestYaw", -6).set("chest", [0.58, 0.88, 0.02]).set("head", [0.7, 1.04, 0.0]);
      b.knee("l", [1, -0.2, 0]).knee("r", [0.3, -1, 0]);
      b.handHead("l", 0.3, -0.34, -0.14, "open").handHead("r", 0.26, -0.38, 0.14, "open");
      return b.act("legl", "legr");
    }
    function penKnee() {
      const b = g.copy();
      b.footAt("l", [0.38, ankleY(78), -0.13], -4, 78).foot("r", -0.21, 0.21, -10, 65);
      b.set("pel", [0.56, 0.46, 0.04]).set("hipYaw", -6).set("chestYaw", -4).set("chest", [0.73, 0.92, 0.03]).set("head", [0.84, 1.09, 0.02]);
      b.knee("l", [1, -0.4, 0]).knee("r", [0.2, -1, 0]);
      b.handHead("l", 0.28, -0.32, -0.14, "open").handHead("r", 0.24, -0.36, 0.14, "open");
      return b.act("legl", "legr");
    }
    function stepUp() {
      const b = penKnee();
      b.foot("r", 0.68, 0.24, -20, 10).knee("r", [1, 0.4, 0.3]);
      b.set("pel", [0.52, 0.52, 0.06]).set("chest", [0.68, 0.99, 0.05]).set("head", [0.78, 1.17, 0.04]);
      b.handHead("l", 0.28, -0.34, -0.14, "open").handHead("r", 0.24, -0.38, 0.14, "open");
      return b.act("legr");
    }
    const p1 = pen1();
    const pk = penKnee();
    const su = stepUp();
    const after = g.copy().move(0.58).act("legl", "legr");
    mv("lotta.penStep1", "Tempo 1: livello giù e passo profondo, il ginocchio avanti scende", [K(g, 260, 100), K(lv, 170, 40), K(p1, 260, 700), K(g, 360, 300)]);
    mv("lotta.penKnee", "Tempo 2: ginocchio avanti a terra morbido, gamba dietro distesa sulla punta", [K(g, 260, 100), K(lv, 170, 40), K(p1, 220, 40), K(pk.copy().act("legl"), 220, 900), K(g, 400, 300)]);
    mv("lotta.stepUp", "Tempo 3: step-up, il piede dietro arriva accanto al ginocchio e ti alzi", [K(pk.copy().act(), 300, 300), K(su, 300, 300), K(after, 300, 300), K(g, 450, 200)]);
    mv("lotta.penetration", "Passo di penetrazione completo: livello, ginocchio a terra, step-up, su", [K(g, 260, 80), K(lv, 160, 20), K(p1, 180, 20), K(pk, 180, 160), K(su, 240, 80), K(after, 260, 200), K(g, 420, 200)]);
    mv("lotta.penetrationR", "Passo di penetrazione con il ginocchio destro", mirrorFrames([K(g, 260, 80), K(lv, 160, 20), K(p1, 180, 20), K(pk, 180, 160), K(su, 240, 80), K(after, 260, 200), K(g, 420, 200)]));
    // penetrazioni alternate in avanzamento: dopo lo step-up il destro e' avanti
    const afterR = gR.copy().move(0.58);
    const pkR2 = pk.copy().mirror().move(0.58);
    const suR2 = su.copy().mirror().move(0.58);
    mv("lotta.penWalk", "Penetrazioni alternate in avanzamento: ginocchio sinistro, poi destro", [K(g, 260, 60), K(lv, 150, 20), K(pk, 220, 120), K(su, 220, 40), K(afterR.copy().act("legl", "legr"), 220, 80), K(lv.copy().mirror().move(0.58), 150, 20), K(pkR2.act("legr", "legl"), 220, 120), K(suR2.act("legl"), 220, 40), K(g.copy().move(1.16).act("legl", "legr"), 220, 200)]);

    /* ---------------------------------------------------------------- sprawl */
    function sprawlPose() {
      const b = g.copy();
      b.set("pel", [-0.36, 0.24, 0.0]).set("hipYaw", 0).set("chestYaw", 0).set("chest", [0.1, 0.43, 0]).set("head", [0.3, 0.57, 0]);
      b.footAt("l", [-1.15, ankleY(62), -0.36], 0, 62).footAt("r", [-1.15, ankleY(62), 0.36], 0, 62);
      b.knee("l", [0, -1, -0.3]).knee("r", [0, -1, 0.3]);
      b.handW("l", 0.42, 0.2, -0.2, "open").handW("r", 0.42, 0.2, 0.2, "open").elbow("l", [-0.3, -0.3, -1]).elbow("r", [-0.3, -0.3, 1]);
      return b.act("legl", "legr", "torso");
    }
    const spr = sprawlPose();
    const sprMid = g.copy().set("pel", [-0.2, 0.46, 0]).set("hipYaw", -5).set("chestYaw", -5).set("chest", [0.2, 0.74, 0]).set("head", [0.38, 0.86, 0])
      .footAt("l", [-0.5, 0.32, -0.22], 0, 40).footAt("r", [-0.66, 0.3, 0.26], 0, 40).knee("l", [0, -1, 0]).knee("r", [0, -1, 0])
      .handW("l", 0.5, 0.42, -0.18, "open").handW("r", 0.5, 0.42, 0.18, "open").act("arml", "armr", "legl", "legr");
    const hop = g.copy().set("pel", [-0.12, 0.5, 0]).set("chest", [0.22, 0.86, 0]).set("head", [0.36, 1.0, 0]).foot("l", 0.12, -0.2, -5, 25).foot("r", -0.26, 0.22, -20, 30).knee("l", [1, 0.2, 0]).knee("r", [1, 0, 0]).handHead("l", 0.34, -0.4, -0.14, "open").handHead("r", 0.3, -0.44, 0.16, "open").act("legl", "legr");
    const sprawlFrames = [K(g, 240, 60), K(sprMid, 150, 0), K(spr, 170, 500), K(hop, 230, 60), K(g, 200, 250)];
    mv("lotta.sprawl", "Sprawl: mani avanti, gambe indietro e larghe, anche giù, poi su in posizione", sprawlFrames);
    mv("lotta.sprawlSoft", "Sprawl morbido: anche giù piano, poi di nuovo in posizione", [K(g, 300, 100), K(sprMid.copy(), 300, 50), K(spr.copy(), 350, 500), K(hop, 400, 80), K(g, 350, 250)]);
    mv("lotta.sprawlHands", "Sprawl, fase 1: le mani bloccano avanti mentre le gambe partono", [K(g, 260, 100), K(sprMid, 220, 600), K(g, 300, 300)]);
    mv("lotta.sprawlHold", "Sprawl tenuto: cosce che sfiorano il tappeto, petto pesante, testa su", [K(g, 260, 100), K(sprMid, 150, 0), K(spr, 170, 1600), K(hop, 260, 60), K(g, 220, 250)]);
    mv("lotta.sprawlFast", "Sprawl veloce e completo, ritorno subito in posizione", [K(g, 180, 20), K(sprMid, 120, 0), K(spr, 140, 200), K(hop, 170, 20), K(g, 150, 100)]);

    /* ---------------------------------------------------------------- rialzo in base */
    function baseSit() {
      const b = standing();
      b.set("pel", [0, 0.14, 0]).set("chest", [-0.2, 0.57, 0]).set("head", [-0.13, 0.76, 0]).set("hipYaw", 0).set("chestYaw", 0);
      b.foot("l", 0.4, -0.12, 0, 0).footAt("r", [0.72, 0.07, 0.17], 0, -70);
      b.knee("l", [0.3, 1, -0.2]).knee("r", [0, 1, 0]);
      b.handW("r", -0.38, 0.04, 0.24, "open").handHead("l", 0.24, -0.1, -0.04, "open").elbow("l", [0, -1, -0.3]).elbow("r", [-0.3, 0, 1]);
      return b;
    }
    const bs = baseSit();
    const bsUp = bs.copy().set("pel", [0.05, 0.36, 0.06]).set("chest", [-0.3, 0.58, 0.1]).set("head", [-0.22, 0.77, 0.08]).handW("r", -0.4, 0.04, 0.3).act("arml", "armr", "legl");
    bsUp.handHead("l", 0.24, -0.12, -0.06, "open");
    const bsPass = bsUp.copy().footAt("r", [-0.72, ankleY(55), 0.18], 0, 55).knee("r", [0, -1, 0.2]).set("pel", [0.08, 0.4, 0.06]).act("legr");
    bsPass.handHead("l", 0.24, -0.12, -0.06, "open");
    const bsEnd = g.copy().move(-0.46).act("legl", "legr", "arml");
    mv("lotta.baseSit", "Seduto in base: mano dietro a terra, piede opposto piantato, l'altra mano davanti", [K(bs.copy().act("arml", "armr", "legl"), 500, 1000)]);
    mv("lotta.baseHips", "Mano e piede spingono insieme e le anche si sollevano dal tappeto", [K(bs, 300, 300), K(bsUp, 400, 700), K(bs, 400, 300)]);
    mv("lotta.basePass", "La gamba libera passa dritta sotto il corpo e il piede atterra dietro", [K(bs, 300, 200), K(bsUp, 300, 100), K(bsPass, 380, 700), K(bsUp, 350, 100), K(bs, 350, 200)]);
    mv("lotta.standUpBase", "Rialzo in base: anche su, gamba libera sotto e dietro, arrivo in sfalsata", [K(bs, 300, 300), K(bsUp, 320, 120), K(bsPass, 320, 160), K(bsEnd, 380, 600), K(bs, 700, 200)]);
    mv("lotta.standUpBaseR", "Rialzo in base dall'altro lato: mano sinistra a terra", mirrorFrames([K(bs, 300, 300), K(bsUp, 320, 120), K(bsPass, 320, 160), K(bsEnd, 380, 600), K(bs, 700, 200)]));

    /* ---------------------------------------------------------------- hand fighting (a vuoto) */
    const swReach = g.copy().handRel("l", 0.5, -0.02, -0.02, "open").elbow("l", [0, -1, -0.3]).act("arml");
    const swDown = g.copy().turn(-8).handRel("l", 0.28, -0.42, -0.3, "open").elbow("l", [0, -0.3, -1]).act("arml");
    mv("lotta.swipe", "Spazzata: il palmo spinge in basso e in fuori la mano avanti dell'avversario", [K(g, 260, 100), K(swReach, 180, 80), K(swDown, 180, 260), K(g, 260, 250)]);
    const wcGrab = g.copy().handRel("l", 0.5, -0.08, 0.02, "fist").handRel("r", 0.44, -0.12, 0.1, "fist").elbow("l", [0, -1, -0.2]).elbow("r", [0, -1, 0.2]).act("arml", "armr");
    const wcPull = place(g, -22, 0.12, -0.16).act("arml", "armr", "legl");
    wcPull.handPel("l", 0.2, 0.12, 0.12, "fist").handPel("r", 0.14, 0.06, 0.24, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [-0.3, -1, 0.3]);
    mv("lotta.wristControl", "Controllo del polso: due mani sul polso, tira verso l'anca e passo d'angolo", [K(g, 260, 100), K(wcGrab, 200, 150), K(wcPull, 260, 400), K(g, 320, 250)]);
    const cbIn = g.copy().headTo(0.02, -0.04).handRel("l", 0.3, 0.02, 0.08, "open").elbow("l", [0.3, -1, -0.5]).act("arml");
    const cbUp = g.copy().move(-0.08).turn(-12).handRel("l", 0.34, 0.4, -0.02, "open").elbow("l", [0.4, 0.2, -1]).act("arml", "head", "legr");
    mv("lotta.collarBreak", "Liberarsi dal collar tie: avambraccio sotto il suo gomito, spingi su e via", [K(g, 260, 100), K(cbIn, 200, 150), K(cbUp, 220, 400), K(g, 300, 250)]);
    const inside = g.copy().handRel("l", 0.44, -0.06, -0.2, "open").handRel("r", 0.4, -0.08, 0.2, "open").elbow("l", [0, -1, 0.1]).elbow("r", [0, -1, -0.1]).act("arml", "armr");
    const insideIn = g.copy().handRel("l", 0.3, -0.1, -0.02, "open").handRel("r", 0.28, -0.12, 0.02, "open").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]);
    mv("lotta.insidePos", "Posizione interna: le mani entrano tra le sue braccia, palmi sui bicipiti", [K(g, 260, 100), K(insideIn, 160, 40), K(inside, 200, 500), K(g, 280, 250)]);
    mv("lotta.handFight", "Hand fighting in motion: spazzata, polso, collar tie, posizione interna", [K(g, 240, 40), K(swReach, 160, 40), K(swDown, 160, 80), K(fA.copy().act("legl"), 180, 40), K(wcGrab.copy().move(0.16), 180, 60), K(wcPull.copy().move(0.16), 220, 120), K(fB.copy().act("legr"), 200, 40), K(cbIn.copy().move(0.16), 160, 60), K(cbUp.copy().move(0.16), 200, 120), K(inside.copy().move(0.08), 200, 200), K(g, 240, 200)]);
    mv("lotta.handFake", "Preparazione: un'azione di mani e un cambio di livello falso, poi su", [K(g, 220, 60), K(swReach, 150, 40), K(swDown, 150, 60), K(lv.copy().sink(-0.08), 160, 80), K(g, 180, 200)]);

    /* ---------------------------------------------------------------- posizione di sotto e uscite */
    function btm() {
      const b = standing();
      b.set("pel", [-0.3, 0.52, 0]).set("hipYaw", 0).set("chestYaw", 0).set("chest", [0.18, 0.6, 0]).set("head", [0.37, 0.72, 0]);
      b.foot("l", -0.72, -0.12, 0, 80).foot("r", -0.72, 0.12, 0, 80);
      b.knee("l", [1, -1, 0]).knee("r", [1, -1, 0]);
      b.handW("l", 0.2, 0.04, -0.18, "open").handW("r", 0.2, 0.04, 0.18, "open").elbow("l", [-1, 0, -0.2]).elbow("r", [-1, 0, 0.2]);
      return b;
    }
    const bt = btm();
    mv("lotta.bottom", "Posizione di sotto: mani sotto le spalle, ginocchia sotto le anche, testa su", [K(up, 300, 100), K(kneel(), 400, 100), K(bt.copy().act("arml", "armr", "head"), 400, 1000)]);
    // stand-up: piede interno (sinistro) avanti, testa e busto su, schiena indietro
    const su1 = bt.copy().foot("l", 0.12, -0.16, -5, 0).knee("l", [1, 0.3, 0]).set("pel", [-0.26, 0.5, 0.0]).set("chest", [-0.16, 0.99, 0]).set("head", [-0.12, 1.19, 0])
      .knee("r", [1, -1, 0]).handPel("l", 0.16, 0.18, -0.15, "fist").handPel("r", 0.2, 0.12, 0.02, "open").elbow("l", [-0.3, -1, -0.4]).elbow("r", [0, -1, 0.6]).act("legl", "torso", "head");
    const su2 = standing().foot("l", 0.1, -0.24, 5, 0).foot("r", -0.3, 0.24, -20, 0).set("pel", [-0.12, 0.84, 0]).set("chest", [-0.17, 1.33, 0]).set("head", [-0.15, 1.53, 0])
      .knee("l", [1, 0, -0.2]).knee("r", [1, 0, 0.2]).handPel("l", 0.18, 0.16, -0.06, "fist").handPel("r", 0.2, 0.14, 0.04, "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]).act("legl", "legr");
    const su3 = su2.copy().shift(0.06, 0.08).handRel("l", 0.36, -0.38, -0.14, "fist").handRel("r", 0.38, -0.36, 0.02, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]).act("arml", "armr", "torso");
    const su4 = place(g, 100, -0.05, 0.1).act("legl", "legr", "torso");
    const suHand = su2.copy().handPel("l", 0.24, 0.1, -0.02, "fist").handPel("r", 0.24, 0.08, 0.06, "fist").act("arml", "armr");
    const standUpF = [K(bt, 300, 200), K(su1, 260, 150), K(su2, 260, 200), K(su3, 220, 150), K(su4, 320, 400), K(bt, 600, 200)];
    mv("lotta.standUp", "Stand-up da sotto: piede interno avanti, schiena indietro, in piedi e girata", standUpF);
    mv("lotta.standUpR", "Stand-up con l'avversario a destra: piede destro avanti, girata a destra", mirrorFrames(standUpF));
    mv("lotta.standUpBurst", "Esplosione: piede interno avanti, testa e busto su, schiena che spinge indietro", [K(bt, 300, 200), K(su1, 260, 800), K(bt, 400, 200)]);
    mv("lotta.standUpElbow", "Gomito interno stretto al fianco, l'altra mano cerca la sua mano sulla pancia", [K(bt, 300, 100), K(su1, 300, 1000), K(bt, 400, 200)]);
    mv("lotta.standUpTurn", "In piedi, piedi larghi e anche avanti: via le sue mani e girata verso di lui", [K(su1, 300, 100), K(su2, 300, 200), K(su3, 220, 200), K(su4, 320, 500), K(su2, 400, 200)]);
    const cut = su2.copy().move(0.15, 0.18).turn(-15).handRel("l", 0.3, -0.42, 0.06, "fist").handRel("r", 0.28, -0.44, 0.16, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]).act("arml", "armr", "legl", "legr");
    const handCtrlF = [K(bt, 300, 150), K(su1, 240, 100), K(su2, 240, 100), K(suHand, 200, 300), K(cut, 260, 250), K(su4, 320, 400), K(bt, 600, 200)];
    mv("lotta.standUpHands", "Stand-up con controllo delle mani: polso staccato, anche via, girata", handCtrlF);
    mv("lotta.standUpHandsR", "Stand-up con controllo delle mani con l'avversario a destra", mirrorFrames(handCtrlF));
    mv("lotta.handControl", "In piedi: due mani sul suo polso alla pancia, gomiti stretti", [K(su2, 300, 100), K(suHand, 250, 1000), K(su2, 300, 200)]);
    mv("lotta.cutAway", "Spingi il polso in basso e via mentre le anche si allontanano, poi girati", [K(suHand, 300, 150), K(cut, 280, 400), K(su4, 320, 500), K(suHand, 450, 200)]);

    // seduto controllato (il riporto a terra)
    const sitDown = sitLong().footAt("l", [0.62, 0.07, -0.14], 0, -60).footAt("r", [0.66, 0.07, 0.16], 0, -60).knee("l", [0.2, 1, 0]).knee("r", [0.2, 1, 0]).set("pel", [-0.1, 0.13, 0]).set("chest", [-0.06, 0.62, 0]).set("head", [-0.02, 0.82, 0])
      .handPel("l", 0.18, 0.22, -0.16, "fist").handPel("r", 0.18, 0.22, 0.16, "fist").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
    // hip heist: seduto su mano destra e piede sinistro, la gamba destra passa sotto
    const hhMid = (() => {
      const b = standing();
      b.set("pel", [-0.05, 0.36, 0.12]).set("hipYaw", -80).set("chestYaw", -95).set("chest", [-0.28, 0.6, 0.42]).set("head", [-0.34, 0.76, 0.56]);
      b.foot("l", 0.32, -0.08, -40, 0).footAt("r", [0.12, ankleY(70), 0.1], -90, 70);
      b.knee("l", [0.3, 1, 0.3]).knee("r", [-0.3, -0.55, 1]);
      b.handW("r", -0.42, 0.04, 0.42, "open").handHead("l", 0.18, -0.1, -0.06, "open").elbow("r", [-1, 0, 0]).elbow("l", [0, -1, 0]);
      return b.act("legr", "torso");
    })();
    const hhEnd = place(bt, 180, -0.12, 0.2).act("legl", "legr", "head");
    const heistF = [K(bs, 300, 200), K(bsUp, 260, 80), K(hhMid, 280, 80), K(hhEnd, 300, 500), K(hhMid, 450, 50), K(bs, 450, 200)];
    mv("lotta.hipHeist", "Hip heist: anche su, la gamba passa sotto, arrivo a quattro appoggi girato", heistF);
    mv("lotta.hipHeistR", "Hip heist dall'altro lato: mano sinistra dietro, gamba sinistra sotto", mirrorFrames(heistF));
    mv("lotta.hipHeistSlow", "Hip heist lento: anche su, ginocchio che scivola, testa su", [K(bs, 400, 300), K(bsUp, 450, 200), K(hhMid, 500, 200), K(hhEnd, 500, 700), K(hhMid, 500, 100), K(bs, 500, 200)]);
    mv("lotta.heistPass", "La gamba destra passa sotto il corpo, il ginocchio scivola verso la mano", [K(bs, 300, 200), K(bsUp, 260, 100), K(hhMid, 380, 900), K(bs, 450, 200)]);
    mv("lotta.sitControl", "Ti siedi controllato sul tappeto, gomiti stretti, testa su", [K(g, 300, 100), K(sitDown.copy().act("legl", "legr", "torso"), 500, 900), K(g, 500, 200)]);
    mv("lotta.sitHeist", "Riportato giù: seduto controllato e subito hip heist verso di lui", [K(su2, 300, 100), K(sitDown.copy().act("legl", "legr"), 380, 200), K(bs, 260, 60), K(bsUp, 220, 60), K(hhMid, 240, 60), K(hhEnd, 260, 400), K(su2, 600, 200)]);

    // sit-out e turn-in (avversario a sinistra)
    const soPost = bt.copy().foot("r", -0.22, 0.24, -20, 0).knee("r", [1, 0.6, 0.3]).set("pel", [-0.26, 0.56, 0.06]).set("chest", [0.17, 0.62, 0.03]).set("head", [0.35, 0.75, 0.02]).act("legr");
    const soSit = (() => {
      const b = sitLong();
      b.set("pel", [-0.22, 0.13, 0]).set("chest", [-0.18, 0.63, 0]).set("head", [-0.14, 0.83, 0]);
      b.footAt("l", [0.58, 0.07, -0.14], 0, -60).footAt("r", [0.5, 0.07, 0.17], 0, -50).knee("l", [0.2, 1, 0]).knee("r", [0.2, 1, 0]);
      b.handPel("l", 0.2, 0.16, -0.12, "fist").handPel("r", 0.2, 0.16, 0.12, "fist").elbow("l", [-0.2, -1, -0.4]).elbow("r", [-0.2, -1, 0.4]);
      return b.act("legl", "legr", "torso");
    })();
    const soSwing = bt.copy().set("pel", [-0.22, 0.34, 0.02]).set("chest", [-0.1, 0.82, 0.0]).set("head", [-0.05, 1.02, 0]).handPel("l", 0.24, 0.2, -0.14, "fist").handPel("r", 0.24, 0.2, 0.14, "fist")
      .footAt("l", [0.2, 0.22, -0.12], 0, -20).footAt("r", [0.12, 0.2, 0.15], 0, -10).knee("l", [0.2, 1, 0]).knee("r", [0.2, 1, 0]).elbow("l", [-0.2, -1, -0.4]).elbow("r", [-0.2, -1, 0.4]).act("legl", "legr");
    const tiSide = (() => {
      const b = standing();
      b.set("pel", [-0.2, 0.2, -0.05]).set("hipYaw", 45).set("chestYaw", 70).set("chest", [-0.12, 0.55, -0.25]).set("head", [-0.06, 0.73, -0.34]).set("hipRoll", 20);
      b.footAt("l", [0.3, 0.07, 0.05], 30, 0, -70).footAt("r", [0.25, 0.1, 0.32], 20, -10);
      b.knee("l", [0.3, 0.6, -1]).knee("r", [0.4, 1, 0]);
      b.handW("l", -0.2, 0.04, -0.45, "open").handPel("r", 0.2, 0.25, -0.05, "fist").elbow("l", [0, 0, -1]);
      return b.act("torso", "legl", "legr");
    })();
    const tiEnd = place(bt, 90, -0.1, 0.12).act("legl", "legr", "head");
    const sitOutF = [K(bt, 300, 150), K(soPost, 220, 60), K(soSwing, 220, 40), K(soSit, 220, 600), K(soSwing, 400, 50), K(bt, 400, 200)];
    mv("lotta.sitOut", "Sit-out: piede esterno piantato, le gambe passano avanti, seduto, gomiti stretti", sitOutF);
    mv("lotta.sitOutR", "Sit-out con l'avversario a destra", mirrorFrames(sitOutF));
    mv("lotta.sitOutHold", "Seduto dopo il sit-out: gomiti stretti, mani a proteggere la vita, testa su", [K(soSit, 400, 1200)]);
    const turnInF = [K(soSit, 300, 150), K(tiSide, 300, 100), K(tiEnd, 300, 600), K(soSit, 600, 200)];
    mv("lotta.turnIn", "Turn-in: spalle e anche girano verso di lui, ginocchia sotto, a quattro appoggi", turnInF);
    const soTiF = [K(bt, 300, 150), K(soPost, 220, 60), K(soSwing, 220, 40), K(soSit, 220, 300), K(tiSide, 280, 80), K(tiEnd, 280, 500), K(bt, 600, 200)];
    mv("lotta.sitOutTurnIn", "Sit-out e turn-in: seduto fuori, poi girato verso l'avversario a quattro appoggi", soTiF);
    mv("lotta.sitOutTurnInR", "Sit-out e turn-in con l'avversario a destra", mirrorFrames(soTiF));

    // switch (avversario a sinistra)
    const swSit = (() => {
      const b = standing();
      b.set("pel", [-0.22, 0.16, 0.22]).set("hipYaw", -40).set("chestYaw", -40).set("chest", [-0.36, 0.6, 0.38]).set("head", [-0.34, 0.8, 0.44]);
      b.footAt("l", [0.38, 0.07, 0.2], -30, -60).foot("r", 0.12, 0.62, -50, 0);
      b.knee("l", [0.2, 1, 0]).knee("r", [0.3, 1, 0.4]);
      b.handW("r", -0.5, 0.04, 0.62, "open").handPel("l", 0.25, 0.3, -0.1, "open").elbow("r", [-0.6, 0, 0.6]);
      return b.act("torso", "legl", "legr", "armr");
    })();
    const swArm = swSit.copy().handW("l", -0.6, 0.38, -0.05, "open").elbow("l", [0.3, 1, -0.4]).act("arml");
    const swLever = swArm.copy().set("pel", [-0.18, 0.16, 0.42]).set("chest", [-0.48, 0.52, 0.5]).set("head", [-0.58, 0.66, 0.5]).set("chestRoll", 25)
      .handW("l", -0.62, 0.3, 0.05, "open").act("torso", "arml");
    const swTop = (() => {
      const b = standing();
      b.set("pel", [-0.5, 0.52, 0.12]).set("hipYaw", 150).set("chestYaw", 150).set("chest", [-0.88, 0.78, -0.08]).set("head", [-1.04, 0.86, -0.15]);
      b.footAt("l", [-0.2, ankleY(75), 0.42], 150, 75).footAt("r", [-0.1, ankleY(75), 0.12], 150, 75);
      b.knee("l", [-1, -1, -0.3]).knee("r", [-1, -1, -0.3]);
      b.handRel("l", 0.28, -0.3, -0.12, "open").handRel("r", 0.28, -0.3, 0.12, "open");
      return b.act("legl", "legr", "torso");
    })();
    const switchF = [K(bt, 300, 150), K(swSit, 300, 150), K(swArm, 250, 150), K(swLever, 280, 150), K(swTop, 320, 600), K(bt, 700, 200)];
    mv("lotta.switch", "Switch: anche via da lui, braccio sopra il suo e mano nella coscia, leva e sali dietro", switchF);
    mv("lotta.switchR", "Switch con l'avversario a destra", mirrorFrames(switchF));
    mv("lotta.switchSit", "Siediti lontano da lui con la mano dietro come perno", [K(bt, 300, 150), K(swSit, 350, 900), K(bt, 450, 200)]);
    mv("lotta.switchArm", "Il braccio passa sopra il suo e la mano va dentro la sua coscia", [K(swSit, 300, 150), K(swArm, 350, 900), K(swSit, 400, 200)]);
    mv("lotta.switchLever", "Anche ancora più via e spalla giù: la leva lo porta avanti", [K(swSit, 300, 100), K(swArm, 300, 150), K(swLever, 350, 800), K(swSit, 400, 200)]);
    mv("lotta.switchTop", "Ruota verso di lui e sali dietro: petto sulla schiena, braccio alla vita", [K(swLever, 300, 150), K(swTop, 400, 1000), K(swLever, 500, 200)]);
    mv("lotta.sitOutSwitch", "Sit-out e switch: seduto fuori, braccio sopra il suo, leva e dietro", [K(bt, 300, 100), K(soPost, 220, 40), K(soSwing, 200, 40), K(soSit, 200, 150), K(swSit, 260, 80), K(swArm, 220, 80), K(swLever, 240, 80), K(swTop, 300, 500), K(bt, 700, 200)]);

    // uscita dalla schiena: ponte di glutei e rotazione su una spalla
    const lbArms = lieBack({ kneesUp: true }).footAt("l", [0.36, 0.08, -0.13], 0, 0).footAt("r", [0.36, 0.08, 0.13], 0, 0).handW("l", -0.3, 0.24, -0.06, "fist").handW("r", -0.3, 0.24, 0.06, "fist").elbow("l", [0.3, 0.2, -1]).elbow("r", [0.3, 0.2, 1]);
    const brUp = lbArms.copy().set("pel", [0.02, 0.4, 0]).set("chest", [-0.44, 0.22, 0]).set("head", [-0.64, 0.14, 0]).handW("l", -0.3, 0.4, -0.06).handW("r", -0.3, 0.4, 0.06).act("torso", "legl", "legr");
    const brTwist = lbArms.copy().set("pel", [-0.02, 0.38, 0.02]).set("chest", [-0.44, 0.2, -0.12]).set("head", [-0.62, 0.15, -0.2]).set("hipRoll", -45).set("chestRoll", -40)
      .footAt("r", [0.0, 0.1, -0.12], 0, 0).knee("r", [0.4, 0.2, -1]).handW("l", -0.42, 0.06, -0.3, "open").handW("r", -0.36, 0.3, -0.1, "open").act("torso", "legr");
    const brEnd = place(bt, 90, -0.3, -0.1).act("legl", "legr", "head");
    const backEscF = [K(lbArms, 300, 200), K(brUp, 260, 250), K(brTwist, 280, 120), K(brEnd, 320, 500), K(lbArms, 650, 200)];
    mv("lotta.backEscape", "Uscita dalla schiena: ponte alto, rotazione sulla spalla, a quattro appoggi", backEscF);
    mv("lotta.backEscapeR", "Uscita dalla schiena girando verso destra", mirrorFrames(backEscF));
    mv("lotta.bridgeHigh", "Ponte di glutei esplosivo: anche alte, peso su spalle e piedi", [K(lbArms, 300, 200), K(brUp, 260, 900), K(lbArms, 450, 200)]);
    mv("lotta.backLie", "Sdraiato sulla schiena: ginocchia piegate, piedi vicini, braccia al petto", [K(lbArms, 400, 1000)]);

    // rialzo da sdraiato e da in ginocchio
    const lbSide = lbArms.copy().set("hipRoll", -40).set("chestRoll", -50).set("chest", [-0.46, 0.2, 0.1]).set("head", [-0.66, 0.22, 0.16]).handW("r", -0.3, 0.04, 0.3, "open").act("torso");
    mv("lotta.standFromBack", "Da sdraiato: gira sul fianco, pianta mano e piede e rialzati in base", [K(lbArms, 300, 200), K(lbSide, 300, 100), K(bs, 300, 150), K(bsUp, 260, 80), K(bsPass, 260, 120), K(bsEnd, 320, 500), K(lbArms, 800, 200)]);
    function halfKneel() {
      const b = standing();
      b.set("pel", [-0.06, 0.52, 0.02]).set("hipYaw", -10).set("chestYaw", -10).set("chest", [-0.02, 1.02, 0.01]).set("head", [0.01, 1.22, 0]);
      b.foot("l", 0.38, -0.15, -5, 0).foot("r", -0.48, 0.13, -5, 80);
      b.knee("l", [1, 0.2, 0]).knee("r", [0.3, -1, 0]);
      b.handRel("l", 0.32, -0.3, -0.14, "open").handRel("r", 0.3, -0.32, 0.14, "open");
      return b;
    }
    const hk = halfKneel();
    const hkUp = gR.copy().move(0.3).act("legr", "legl");
    mv("lotta.halfKneel", "Mezzo inginocchiato: un ginocchio a terra, l'altro piede avanti, busto dritto", [K(up, 300, 100), K(hk.copy().act("legr"), 500, 1000), K(up, 500, 200)]);
    mv("lotta.halfKneelUp", "Spingi sulle dita del piede dietro e porta avanti la gamba fino alla sfalsata", [K(hk, 300, 200), K(hk.copy().shift(0.12).heel("r", 85).act("legr"), 200, 60), K(hkUp, 320, 500), K(hk.copy().act("legl"), 500, 200)]);
    mv("lotta.halfKneelDown", "Torna giù appoggiando il ginocchio piano", [K(hkUp, 300, 200), K(hk.copy().act("legr"), 650, 500), K(hkUp, 400, 200)]);
    const kneelToUp = place(g, 15, -0.25, 0.12).act("legl", "legr");
    mv("lotta.standFromKnee", "Da in ginocchio: un piede avanti e su spingendo indietro in diagonale", [K(kneel().handW("l", 0.25, 0.6, -0.2).handW("r", 0.25, 0.6, 0.2), 300, 200), K(hk.copy().act("legl"), 300, 150), K(kneelToUp, 320, 500), K(kneel(), 700, 200)]);
    const tk = (dl, dr, al, ar) => {
      const b = standing();
      b.set("pel", [0.0 + (dl + dr) / 2, 0.55, 0]).set("chest", [0.03 + (dl + dr) / 2, 1.05, 0]).set("head", [0.05 + (dl + dr) / 2, 1.25, 0]);
      b.footAt("l", [dl - 0.42, 0.07 + al * 0.4, -0.12], 180, 0, 180).footAt("r", [dr - 0.42, 0.07 + ar * 0.4, 0.12], 180, 0, 180);
      b.knee("l", [1, -1, 0]).knee("r", [1, -1, 0]);
      b.handRel("l", 0.25, -0.3, -0.18, "open").handRel("r", 0.25, -0.3, 0.18, "open");
      return b;
    };
    mv("lotta.kneeWalk", "Camminata in ginocchio: busto dritto, avanza un ginocchio alla volta", [K(tk(0, 0, 0, 0), 300, 100), K(tk(0.08, 0, 0.12, 0).act("legl"), 220, 40), K(tk(0.16, 0, 0, 0), 180, 60), K(tk(0.16, 0.24, 0, 0.12).act("legr"), 220, 40), K(tk(0.16, 0.32, 0, 0), 180, 60), K(tk(0.4, 0.32, 0.12, 0).act("legl"), 220, 40), K(tk(0.48, 0.32, 0, 0), 180, 60), K(tk(0.48, 0.48, 0, 0).act("legr"), 260, 200)]);

    // calcio passante a quattro appoggi (kick-through)
    const bear = allFours().set("pel", [-0.3, 0.6, 0]).footAt("l", [-0.7, ankleY(45), -0.13], 0, 45).footAt("r", [-0.7, ankleY(45), 0.13], 0, 45).knee("l", [0.4, -1, 0]).knee("r", [0.4, -1, 0]).set("head", [0.42, 0.66, 0]);
    const kt = (() => {
      const b = standing();
      b.set("pel", [-0.25, 0.32, 0.02]).set("hipYaw", 80).set("chestYaw", 30).set("chest", [0.08, 0.62, 0.1]).set("head", [0.18, 0.8, 0.0]).set("hipRoll", 0);
      b.foot("l", -0.58, -0.08, 80, 0).footAt("r", [0.22, 0.12, -0.42], 80, -40, 0);
      b.knee("l", [0.3, 1, -0.4]).knee("r", [0.6, 0.6, 0]);
      b.handW("r", 0.22, 0.04, 0.2, "open").handW("l", 0.25, 0.85, -0.3, "open").elbow("r", [-1, 0, 0.3]).elbow("l", [0, -1, -0.3]);
      return b.act("legr", "torso");
    })();
    mv("lotta.kickThrough", "Calcio passante: a quattro appoggi, una gamba passa sotto verso il lato opposto", [K(bear, 300, 100), K(kt, 300, 300), K(bear, 280, 100), K(kt.copy().mirror(), 300, 300), K(bear, 280, 200)]);
    const bearL = bear.copy().footAt("l", [-0.5, ankleY(45), -0.13], 0, 45).handW("r", 0.4, 0.04, 0.18).act("legl", "armr");
    const bearR = bear.copy().footAt("r", [-0.5, ankleY(45), 0.13], 0, 45).handW("l", 0.4, 0.04, -0.18).act("legr", "arml");
    mv("lotta.bearWalk", "Camminata dell'orso: ginocchia a un palmo da terra, mano e piede opposti", [K(bear, 300, 60), K(bearL, 260, 40), K(bear.copy().move(0.2), 240, 40), K(bearR.copy().move(0.2), 260, 40), K(bear.copy().move(0.4), 240, 200)]);
    const tapL = bear.copy().handW("l", 0.05, 0.62, 0.15, "open").elbow("l", [0, -1, -0.5]).set("chest", [0.2, 0.62, 0.03]).act("arml");
    mv("lotta.bearTap", "Orso con tocchi: una mano tocca la spalla opposta, poi l'altra", [K(bear, 300, 60), K(tapL, 220, 100), K(bear, 200, 40), K(tapL.copy().mirror(), 220, 100), K(bear, 200, 200)]);
    const crab = (s) => {
      const b = sitLong().set("pel", [0.0, 0.34, 0]).set("chest", [-0.38, 0.6, 0]).set("head", [-0.42, 0.8, 0]);
      b.foot("l", 0.32 + (s > 0 ? 0.08 : 0), -0.18, 0, 0).foot("r", 0.32 + (s < 0 ? 0.08 : 0), 0.18, 0, 0).knee("l", [0.3, 1, 0]).knee("r", [0.3, 1, 0]);
      b.handW("l", -0.55 + (s < 0 ? 0.06 : 0), 0.04, -0.22, "open").handW("r", -0.55 + (s > 0 ? 0.06 : 0), 0.04, 0.22, "open").elbow("l", [-1, 0, 0]).elbow("r", [-1, 0, 0]);
      return b;
    };
    mv("lotta.crabWalk", "Camminata del granchio: mani dietro, anche sollevate, passi alternati", [K(crab(0), 300, 60), K(crab(1).act("legl", "armr"), 240, 40), K(crab(0).move(0.12), 220, 40), K(crab(-1).move(0.12).act("legr", "arml"), 240, 40), K(crab(0).move(0.24), 220, 200)]);

    /* ---------------------------------------------------------------- pose in coordinate assolute (compagno e lotta a terra) */
    // fl/fr = [x, y, z, yaw, pitch, roll]; hl/hr = [x, y, z, presa]
    function mk(o) {
      const b = standing();
      b.set("pel", o.pel).set("chest", o.chest).set("head", o.head);
      b.set("hipYaw", o.yaw || 0).set("chestYaw", o.cyaw != null ? o.cyaw : o.yaw || 0);
      if (o.hroll) b.set("hipRoll", o.hroll);
      if (o.croll) b.set("chestRoll", o.croll);
      ["l", "r"].forEach((s) => {
        const f = o["f" + s];
        if (f) b.footW(s, [f[0], f[1], f[2]], f[3] || 0, f[4] || 0, f[5] || 0);
        const h = o["h" + s];
        if (h) b.hand(s, [h[0], h[1], h[2]], h[3] || "open");
        if (o["k" + s]) b.knee(s, o["k" + s]);
        if (o["e" + s]) b.elbow(s, o["e" + s]);
      });
      if (o.look) b.look(o.look);
      return b;
    }
    const flat = (x, z, yaw, heel = 0) => [x, ankleY(heel), z, yaw, heel, 0];
    const toes = (x, z, yaw, pitch = 78) => [x, ankleY(pitch), z, yaw, pitch, 0];

    /* ---------------------------------------------------------------- doppia gamba (con compagno) */
    const D2 = 0.82;
    const S2 = 0.28;
    const s2 = (b) => place(b, 0, S2, 0);
    const pS = opp(sq, D2 + S2);
    const pUp = mk({ pel: [0.84, 0.88, 0], chest: [0.88, 1.37, 0], head: [0.87, 1.57, 0], yaw: 180, fl: flat(0.83, 0.14, 175), fr: flat(0.83, -0.14, -175), kl: [-1, 0, 0], kr: [-1, 0, 0], hl: [0.58, 0.98, 0.13], hr: [0.58, 0.98, -0.13], el: [0, -1, 0.4], er: [0, -1, -0.4] });
    const pDrive = mk({ pel: [0.9, 0.93, -0.02], chest: [1.0, 1.39, -0.04], head: [1.04, 1.59, -0.04], yaw: 180, fl: [0.88, 0.14, 0.1, 175, 20], fr: [0.88, 0.14, -0.1, -175, 20], kl: [-1, 0, 0], kr: [-1, 0, 0], hl: [0.62, 1.05, 0.12], hr: [0.62, 1.05, -0.12], el: [0, -1, 0.4], er: [0, -1, -0.4] });
    const pFall = mk({ pel: [0.98, 0.48, -0.22], chest: [1.25, 0.76, -0.48], head: [1.38, 0.87, -0.6], yaw: 150, fl: [0.62, 0.62, 0.02, 150, -20], fr: [0.6, 0.5, -0.18, 150, -20], kl: [-0.5, 1, 0], kr: [-0.5, 1, 0], hl: [1.28, 0.36, -0.24], hr: [1.5, 0.32, -0.65], el: [0.3, 0, 1], er: [0.3, 0, -1] });
    const pDown = place(lieBack({ kneesUp: true }), 180, 0.58, -0.48);
    const dlReach = mk({ pel: [0.48, 0.45, 0.03], chest: [0.68, 0.86, 0.03], head: [0.8, 1.0, 0.02], yaw: -6, cyaw: -4, fl: toes(0.32, -0.13, -4), fr: toes(-0.21, 0.21, -10, 65), kl: [1, -0.4, 0], kr: [0.2, -1, 0], hl: [0.94, 0.62, -0.16], hr: [0.94, 0.62, 0.16], el: [0, -1, -0.5], er: [0, -1, 0.5] }).act("legl", "legr", "arml", "armr");
    const dlWrap = dlReach.copy().hand("l", [0.93, 0.48, -0.08]).hand("r", [0.93, 0.48, 0.1]).elbow("l", [0, -0.3, -1]).elbow("r", [0, -0.3, 1]).act("arml", "armr");
    const dlKnee = dlWrap.copy().set("chest", [0.68, 0.84, 0.07]).set("head", [0.79, 0.98, 0.21]).hand("l", [0.93, 0.48, -0.06]).hand("r", [0.93, 0.48, 0.12]).act("head", "torso");
    const dlStep = mk({ pel: [0.5, 0.56, 0.1], chest: [0.66, 0.97, 0.12], head: [0.78, 1.11, 0.23], yaw: -8, cyaw: -6, fl: toes(0.34, -0.13, -4), fr: flat(0.62, 0.38, -20, 10), kl: [1, -0.4, 0], kr: [1, 0.4, 0.3], hl: [0.9, 0.56, -0.05], hr: [0.9, 0.56, 0.13], el: [0, -0.3, -1], er: [0, -0.3, 1] }).act("legr");
    const crouch = mk({ pel: [-0.06, 0.62, 0], chest: [0.2, 1.04, 0], head: [0.34, 1.16, 0], fl: flat(0.1, -0.26, 5, 10), fr: flat(-0.12, 0.26, -10, 15), kl: [1, 0, -0.2], kr: [1, 0, 0.2], hl: [0.42, 0.8, -0.12], hr: [0.42, 0.8, 0.12], el: [0, -1, -0.5], er: [0, -1, 0.5] });
    const dlCorner = place(crouch, 45, 0.5, 0.2).act("legl", "legr", "torso", "head");
    function topKneel() {
      return mk({ pel: [0, 0.5, 0], chest: [0.3, 0.88, 0], head: [0.45, 1.0, 0], fl: toes(-0.42, -0.14, 0, 80), fr: toes(-0.42, 0.14, 0, 80), kl: [1, -1, 0], kr: [1, -1, 0], hl: [0.5, 0.36, -0.16], hr: [0.5, 0.36, 0.16], el: [0, 0, -1], er: [0, 0, 1] });
    }
    const tk0 = topKneel();
    const dlFinish = place(tk0, 90, 0.56, 0.06).act("legl", "legr", "torso");
    const dlF = [K(g, 260, 80, null, pS), K(lv, 160, 20, null, pS), K(s2(p1), 180, 20, null, pS), K(s2(dlKnee), 200, 250, null, s2(pUp)), K(s2(dlStep), 240, 120, null, s2(pDrive)), K(s2(dlCorner), 300, 80, null, s2(pFall)), K(s2(dlFinish), 320, 700, null, s2(pDown)), K(g, 700, 200, null, pS)];
    mv("lotta.doubleLeg", "Doppia gamba: penetrazione, braccia dietro le ginocchia, testa di lato, giro e a terra", dlF);
    mv("lotta.doubleLegR", "Doppia gamba con il ginocchio destro a terra", mirrorFrames(dlF));
    mv("lotta.dlEntry", "Doppia gamba, entrata: livello e penetrazione, il ginocchio tra i suoi piedi", [K(g, 260, 100, null, pS), K(lv, 160, 30, null, pS), K(s2(p1), 180, 30, null, pS), K(s2(dlReach), 220, 800, null, pS), K(g, 450, 200, null, pS)]);
    mv("lotta.dlWrap", "Mentre il ginocchio scende, le braccia avvolgono le gambe dietro le ginocchia", [K(g, 260, 100, null, pS), K(lv, 160, 30, null, pS), K(s2(dlReach), 240, 60, null, pS), K(s2(dlWrap), 200, 900, null, s2(pUp)), K(g, 450, 200, null, pS)]);
    mv("lotta.dlHead", "La testa va di lato, l'orecchio contro le sue costole, schiena dritta", [K(g, 260, 100, null, pS), K(lv, 160, 30, null, pS), K(s2(dlWrap), 260, 100, null, s2(pUp)), K(s2(dlKnee), 220, 900, null, s2(pUp)), K(g, 450, 200, null, pS)]);
    mv("lotta.dlCorner", "Step-up all'esterno, testa che spinge dentro, giro di 90 gradi", [K(s2(dlKnee), 300, 200, null, s2(pUp)), K(s2(dlStep), 260, 150, null, s2(pDrive)), K(s2(dlCorner), 320, 150, null, s2(pFall)), K(s2(dlFinish), 320, 600, null, s2(pDown)), K(s2(dlKnee), 700, 200, null, s2(pUp))]);
    mv("lotta.dlFinish", "In ginocchio di fianco a lui a terra, petto avanti, poi su in posizione", [K(s2(dlCorner), 300, 100, null, s2(pFall)), K(s2(dlFinish), 320, 1000, null, s2(pDown)), K(g, 600, 300, null, pS)]);

    /* ---------------------------------------------------------------- sprawl e go-behind (compagno a quattro appoggi) */
    function quadP() {
      // avversario a quattro appoggi, testa bassa (dopo il suo attacco o dopo lo snap)
      return btm().set("chest", [0.16, 0.56, 0]).set("head", [0.33, 0.6, 0]).handW("l", 0.22, 0.04, -0.2).handW("r", 0.22, 0.04, 0.2);
    }
    const DQ = 0.5;
    const pQ = opp(quadP(), DQ);
    const sprOn = mk({ pel: [-0.16, 0.42, 0], chest: [0.24, 0.7, 0], head: [0.42, 0.8, 0], fl: [-0.92, ankleY(60), -0.36, 0, 60], fr: [-0.92, ankleY(60), 0.36, 0, 60], kl: [0, -1, -0.3], kr: [0, -1, 0.3], hl: [0.36, 0.64, -0.06], hr: [0.3, 0.42, 0.22], el: [0.2, 0, -1], er: [0, -0.3, 1] }).act("legl", "legr", "torso");
    const sprOnCtl = sprOn.copy().hand("l", [0.32, 0.6, -0.02]).hand("r", [0.32, 0.36, 0.24]).act("arml", "armr");
    const CQ = [DQ + 0.06, 0];
    const gb1 = around(sprOnCtl, CQ[0], CQ[1], 50).act("legl", "legr");
    const gb2 = around(sprOnCtl, CQ[0], CQ[1], 100).act("legl", "legr");
    const gbBehind = (() => {
      // dietro: ginocchio a terra accanto alla sua anca, braccio alla vita, petto sulla schiena
      const b = mk({ pel: [0.0, 0.55, 0.0], chest: [0.36, 0.84, -0.04], head: [0.5, 0.96, -0.06], fl: flat(0.12, -0.3, 10), fr: toes(-0.3, 0.16, 0, 80), kl: [1, 0.3, -0.3], kr: [1, -1, 0], hl: [0.5, 0.52, 0.16], hr: [0.62, 0.55, -0.02], el: [0, 0, -1], er: [0, -1, 0.5] });
      return place(b, 180, DQ + 0.62, 0.04);
    })().act("arml", "armr", "legl", "legr");
    const gbSide = place(g, 90, DQ + 0.05, 0.75);
    const gbF = [K(g, 260, 80, null, pQ), K(sprOn, 260, 200, null, pQ), K(sprOnCtl, 200, 200, null, pQ), K(gb1, 280, 60, null, pQ), K(gb2, 280, 60, null, pQ), K(gbBehind, 300, 600, null, pQ), K(gbSide, 450, 60, null, pQ), K(g, 450, 200, null, pQ)];
    mv("lotta.goBehind", "Sprawl e go-behind: petto sopra, testa giù, blocca il gomito e gira dietro", gbF);
    mv("lotta.goBehindL", "Go-behind girando dall'altra parte", mirrorFrames(gbF));
    mv("lotta.sprawlOn", "Sprawl con il petto sopra l'avversario a quattro appoggi, anche basse", [K(g, 260, 100, null, pQ), K(sprOn, 260, 1000, null, pQ), K(g, 400, 200, null, pQ)]);
    mv("lotta.sprawlControl", "Una mano tiene giù la testa, l'altra blocca il gomito dal lato del giro", [K(sprOn, 300, 200, null, pQ), K(sprOnCtl, 250, 1000, null, pQ), K(sprOn, 300, 200, null, pQ)]);
    mv("lotta.circleWalk", "I piedi camminano in cerchio a piccoli passi, il petto resta sopra", [K(sprOnCtl, 300, 100, null, pQ), K(gb1, 380, 80, null, pQ), K(gb2, 380, 300, null, pQ), K(gb1, 380, 80, null, pQ), K(sprOnCtl, 380, 200, null, pQ)]);
    mv("lotta.goBehindEnd", "Dietro: ginocchio accanto alla sua anca, braccio alla vita, petto sulla schiena", [K(gb2, 300, 100, null, pQ), K(gbBehind, 320, 1200, null, pQ), K(gb2, 400, 200, null, pQ)]);

    /* ---------------------------------------------------------------- gamba singola e high crotch (compagno in sfalsata opposta) */
    const S3 = 0.2;
    const s3 = (b) => place(b, 0, S3, 0);
    const pSL = place(gR, 180, 0.95 + S3, 0.08);
    const pSLHit = mk({ pel: [1.0, 0.82, 0.06], chest: [0.92, 1.3, 0.06], head: [0.86, 1.49, 0.06], yaw: 180, fl: flat(1.2, 0.3, 160, 10), fr: flat(0.74, -0.1, -170), kl: [-1, 0, 0.2], kr: [-1, 0, 0], hl: [0.62, 1.0, -0.1], hr: [0.62, 1.04, -0.3], el: [0, -1, 0.4], er: [0, -1, -0.4] });
    const slStepA = mk({ pel: [0.18, 0.56, -0.16], chest: [0.36, 1.02, -0.16], head: [0.48, 1.17, -0.15], yaw: -18, fl: flat(0.5, -0.4, -20), fr: toes(-0.24, 0.12, -15, 50), kl: [1, 0.2, -0.2], kr: [0.3, -1, 0], hl: [0.7, 0.8, -0.22], hr: [0.64, 0.78, -0.02], el: [0, -1, -0.5], er: [0, -1, 0.5] }).act("legl", "legr");
    const slKnee = mk({ pel: [0.42, 0.46, -0.24], chest: [0.58, 0.86, -0.13], head: [0.68, 1.0, -0.0], yaw: -25, cyaw: -28, fl: toes(0.34, -0.36, -25), fr: toes(-0.2, 0.0, -25, 65), kl: [1, -0.4, -0.3], kr: [0.3, -1, 0], hl: [0.8, 0.46, -0.16], hr: [0.8, 0.5, -0.04], el: [0, -0.3, -1], er: [0.2, -0.3, 1] }).act("legl", "legr", "arml", "armr", "head");
    const slStand = mk({ pel: [0.26, 0.78, -0.13], chest: [0.34, 1.27, -0.12], head: [0.4, 1.46, -0.11], yaw: -10, fl: flat(0.34, -0.36, -15, 5), fr: flat(0.16, 0.1, -20, 5), kl: [1, 0, -0.3], kr: [1, 0, 0.3], hl: [0.56, 0.88, -0.19], hr: [0.56, 0.88, -0.03], el: [0, -1, -0.6], er: [0, -1, 0.6] });
    const slUp = slStand.copy().act("legl", "legr", "torso");
    const pSLup = mk({ pel: [0.98, 0.9, 0.06], chest: [0.98, 1.38, 0.06], head: [0.97, 1.58, 0.06], yaw: 180, fl: flat(1.12, 0.22, 175), fr: [0.45, 0.44, -0.11, -170, 30], kl: [-1, 0, 0.2], kr: [-1, 0.6, 0], hl: [0.55, 1.22, 0.06], hr: [0.55, 1.2, -0.28], el: [0, -1, 0.5], er: [0, -1, -0.5] });
    const slF = [K(g, 260, 80, null, pSL), K(lv, 160, 20, null, pSL), K(s3(slStepA), 200, 30, null, pSL), K(s3(slKnee), 200, 300, null, s3(pSLHit)), K(s3(slUp), 360, 800, null, s3(pSLup)), K(g, 600, 200, null, pSL)];
    mv("lotta.singleLeg", "Gamba singola: entrata d'angolo, testa dentro, mani dietro il ginocchio, su", slF);
    mv("lotta.singleLegR", "Gamba singola con il ginocchio destro a terra", mirrorFrames(slF));
    mv("lotta.slEntry", "Passo d'angolo e penetrazione: ginocchio a terra fuori dal suo piede", [K(g, 260, 100, null, pSL), K(lv, 160, 30, null, pSL), K(s3(slStepA), 200, 40, null, pSL), K(s3(slKnee).copy().act("legl", "legr"), 200, 900, null, s3(pSLHit)), K(g, 450, 200, null, pSL)]);
    mv("lotta.slGrip", "Testa dentro contro il petto, mani chiuse dietro il ginocchio", [K(s3(slStepA), 300, 100, null, pSL), K(s3(slKnee), 250, 1200, null, s3(pSLHit)), K(g, 450, 200, null, pSL)]);
    mv("lotta.slStepUp", "Step-up: la gamba dietro arriva avanti e ti alzi con la schiena dritta", [K(s3(slKnee).copy().act(), 300, 200, null, s3(pSLHit)), K(s3(slUp), 400, 900, null, s3(pSLup)), K(s3(slKnee).copy().act(), 500, 200, null, s3(pSLHit))]);
    mv("lotta.slHigh", "Gamba alta: caviglia tra le ginocchia, ginocchio sul fianco, mani chiuse", [K(s3(slStand), 300, 100, null, s3(pSLup)), K(s3(slUp).copy().act("arml", "armr", "legl", "legr"), 300, 1400, null, s3(pSLup)), K(g, 550, 200, null, pSL)]);
    // passo d'angolo da solo (segno di nastro)
    const angKnee = slKnee.copy().hand("l", [0.62, 0.78, -0.3]).hand("r", [0.6, 0.76, -0.04]).elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]).set("head", [0.7, 1.02, -0.06]).act("legl", "legr");
    const angF = [K(g, 260, 100), K(lv, 160, 30), K(slStepA, 220, 200), K(angKnee, 220, 500), K(slStand.copy().hand("l", [0.5, 0.95, -0.32]).hand("r", [0.48, 0.95, -0.02]).act("legr"), 300, 200), K(g, 400, 200)];
    mv("lotta.angleShot", "Penetrazione d'angolo: passo in diagonale, ginocchio a terra fuori dal segno", angF);
    mv("lotta.angleShotR", "Penetrazione d'angolo con il destro avanti", mirrorFrames(angF));
    mv("lotta.angleStepIn", "Cambio di livello e passo in diagonale: il piede avanti atterra fuori dal segno", [K(g, 260, 100), K(lv, 160, 30), K(slStepA, 240, 900), K(g, 400, 200)]);
    mv("lotta.angleKnee", "Il ginocchio avanti scende morbido fuori dal segno, busto girato al centro", [K(slStepA, 300, 100), K(angKnee, 300, 1100), K(g, 450, 200)]);

    // high crotch: testa fuori sull'anca, braccio interno alto tra le gambe, mano esterna dietro il ginocchio
    const hcKnee = mk({ pel: [0.38, 0.46, -0.3], chest: [0.56, 0.86, -0.27], head: [0.7, 0.98, -0.32], yaw: -20, cyaw: -10, fl: toes(0.3, -0.42, -20), fr: toes(-0.22, -0.04, -20, 65), kl: [1, -0.4, -0.3], kr: [0.3, -1, 0], hl: [0.86, 0.46, -0.22], hr: [0.9, 0.72, 0.02], el: [0, -0.3, -1], er: [-0.3, -1, 0.5] }).act("legl", "legr", "arml", "armr", "head");
    const pHC = pSLHit.copy().hand("l", [0.62, 1.0, 0.0]).hand("r", [0.66, 1.02, -0.3]);
    const hcStep = mk({ pel: [0.42, 0.6, -0.36], chest: [0.6, 1.02, -0.3], head: [0.74, 1.12, -0.36], yaw: -30, cyaw: -20, fl: toes(0.3, -0.44, -25), fr: flat(0.62, -0.62, -40, 10), kl: [1, -0.4, -0.3], kr: [1, 0.4, -0.3], hl: [0.86, 0.58, -0.22], hr: [0.9, 0.76, 0.02], el: [0, -0.3, -1], er: [-0.3, -1, 0.5] }).act("legr");
    const hcTurn = place(crouch, -50, 0.82, -0.62).act("legl", "legr", "torso", "head");
    hcTurn.hand("l", [1.05, 0.6, -0.4]).hand("r", [1.1, 0.75, -0.18]);
    const pHCfall = mk({ pel: [1.05, 0.5, 0.15], chest: [1.25, 0.8, 0.45], head: [1.38, 0.9, 0.58], yaw: 200, fl: flat(1.1, 0.28, 190, 10), fr: [0.75, 0.55, -0.22, 170, -20], kl: [-1, 0.5, 0.3], kr: [-0.5, 1, 0], hl: [1.2, 0.35, 0.75], hr: [1.3, 0.38, 0.38], el: [0, 0, 1], er: [0.3, 0, -1] });
    const pHCdown = place(lieBack({ kneesUp: true }), 180, 0.95, 0.42);
    const hcFinish = place(tk0, -90, 0.98, -0.04).act("legl", "legr", "torso");
    const hcF = [K(g, 260, 80, null, pSL), K(lv, 160, 20, null, pSL), K(s3(slStepA), 200, 30, null, pSL), K(s3(hcKnee), 200, 300, null, s3(pHC)), K(s3(hcStep), 240, 100, null, s3(pHC)), K(s3(hcTurn), 320, 100, null, s3(pHCfall)), K(s3(hcFinish), 320, 700, null, s3(pHCdown)), K(g, 700, 200, null, pSL)];
    mv("lotta.highCrotch", "High crotch: testa fuori sull'anca, braccio alto tra le gambe, giro dell'angolo", hcF);
    mv("lotta.highCrotchR", "High crotch dall'altro lato", mirrorFrames(hcF));
    mv("lotta.hcEntry", "Passo d'angolo fuori dal suo piede avanti, ginocchio a terra", [K(g, 260, 100, null, pSL), K(lv, 160, 30, null, pSL), K(s3(slStepA), 220, 40, null, pSL), K(s3(hcKnee).copy().act("legl", "legr"), 220, 900, null, s3(pHC)), K(g, 450, 200, null, pSL)]);
    mv("lotta.hcArms", "Testa fuori sull'anca, braccio interno alto, mano esterna dietro il ginocchio", [K(s3(slStepA), 300, 100, null, pSL), K(s3(hcKnee), 260, 1200, null, s3(pHC)), K(g, 450, 200, null, pSL)]);
    mv("lotta.hcCorner", "Step-up e giro dell'angolo verso la sua schiena, testa che spinge", [K(s3(hcKnee).copy().act(), 300, 150, null, s3(pHC)), K(s3(hcStep), 260, 120, null, s3(pHC)), K(s3(hcTurn), 340, 150, null, s3(pHCfall)), K(s3(hcFinish), 340, 600, null, s3(pHCdown)), K(s3(hcKnee).copy().act(), 700, 200, null, s3(pHC))]);
    mv("lotta.hcFinish", "In ginocchio di fianco a lui a terra, poi torna in posizione", [K(s3(hcTurn), 300, 100, null, s3(pHCfall)), K(s3(hcFinish), 320, 1000, null, s3(pHCdown)), K(g, 600, 300, null, pSL)]);

    // whizzer: l'avversario ha preso la gamba avanti (il compagno fa la gamba singola su di te)
    const pSLatk = place(slKnee.copy().mirror(), 180, 0.86, -0.08);
    const wzIn = g.copy().act();
    const wz = mk({ pel: [-0.14, 0.5, -0.04], chest: [0.08, 0.92, -0.14], head: [0.18, 1.06, -0.1], yaw: 25, cyaw: 30, fl: toes(-0.36, -0.42, 20, 60), fr: flat(-0.2, 0.32, -10, 10), kl: [0.2, -1, -0.5], kr: [1, 0.2, 0.3], hl: [0.22, 0.48, -0.42], hr: [0.24, 0.98, -0.02], el: [-0.2, 1, -0.6], er: [0, -1, 0.5] }).act("arml", "armr", "legl", "torso");
    const pWz = mk({ pel: [0.4, 0.44, -0.12], chest: [0.24, 0.8, -0.12], head: [0.12, 0.88, -0.06], yaw: 160, fl: toes(0.56, -0.3, 160), fr: toes(1.0, -0.02, 165, 65), kl: [-1, -0.4, 0.2], kr: [-0.3, -1, 0], hl: [0.05, 0.42, -0.2], hr: [0.02, 0.48, -0.36], el: [0, -0.3, 1], er: [0, -0.3, -1] });
    const wzF = [K(wzIn, 300, 200, null, pSLatk), K(wzIn.copy().handHead("l", 0.3, -0.25, -0.2).act("arml"), 220, 150, null, pSLatk), K(wz, 320, 600, null, pWz), K(g.copy().act("legl"), 400, 300, null, opp(gR, 1.0))];
    mv("lotta.whizzer", "Whizzer: braccio sopra il suo, anche giù e ruotate, gamba presa indietro", wzF);
    mv("lotta.whizzerR", "Whizzer con la gamba destra presa", mirrorFrames(wzF));
    mv("lotta.legCaught", "L'avversario ti ha preso la gamba avanti con la testa all'interno", [K(g, 300, 200, null, pSL), K(wzIn, 300, 1000, null, pSLatk)]);
    mv("lotta.whizzerArm", "Il braccio dal lato della gamba presa avvolge il suo da sopra, mano sulla coscia", [K(wzIn, 300, 200, null, pSLatk), K(wzIn.copy().set("chest", [0.22, 1.1, -0.03]).hand("l", [0.22, 0.56, -0.42]).elbow("l", [-0.2, 1, -0.6]).act("arml"), 300, 1000, null, pSLatk), K(wzIn, 400, 200, null, pSLatk)]);
    mv("lotta.whizzerHips", "Anche giù e ruotate contro di lui, la gamba presa scivola indietro", [K(wzIn, 300, 200, null, pSLatk), K(wz.copy().act("legl", "torso"), 350, 1000, null, pWz), K(wzIn, 450, 200, null, pSLatk)]);
    mv("lotta.whizzerHead", "L'altra mano spinge la sua testa lontano dal petto", [K(wz, 300, 200, null, pWz), K(wz.copy().hand("r", [0.3, 0.92, 0.02]).elbow("r", [0, -1, 0.5]).act("armr"), 250, 1000, null, pWz), K(wz, 300, 200, null, pWz)]);

    /* ---------------------------------------------------------------- prese in piedi (frontale, compagno vicino) */
    const cl = mk({ pel: [-0.04, 0.78, 0], chest: [0.1, 1.26, 0], head: [0.2, 1.45, -0.08], fl: flat(0.02, -0.26, 8, 8), fr: flat(0.02, 0.26, -8, 8), kl: [1, 0, -0.25], kr: [1, 0, 0.25] });
    const DC = 0.56;
    const pumA = cl.copy().hand("r", [0.6, 1.3, 0.1], "open").elbow("r", [0, -1, 0.6]).hand("l", [0.34, 1.1, -0.22], "open").elbow("l", [-0.2, 0.3, -1]);
    const pumM = cl.copy().hand("r", [0.36, 1.12, 0.16], "open").elbow("r", [0, -1, 0.5]).hand("l", [0.34, 1.08, -0.1], "open").elbow("l", [0, -1, -0.5]);
    const pumB = pumA.copy().mirror();
    const pumM2 = pumM.copy().mirror();
    const pumF = [K(sq, 300, 100, null, opp(sq, 0.8)), K(pumA, 300, 200, null, opp(pumA, DC)), K(pumM.copy().act("arml", "armr"), 220, 40, null, opp(pumM, DC)), K(pumB.copy().act("arml", "armr"), 220, 200, null, opp(pumB, DC)), K(pumM2.copy().act("arml", "armr"), 220, 40, null, opp(pumM2, DC)), K(pumA.copy().act("arml", "armr"), 220, 200, null, opp(pumA, DC)), K(sq, 350, 200, null, opp(sq, 0.8))];
    mv("lotta.pummel", "Pummeling: un braccio passa sotto l'ascella (underhook), l'altro esce, poi cambiano", pumF);
    const pumAir = cl.copy().hand("r", [0.5, 1.28, 0.08], "open").elbow("r", [0, -1, 0.6]).hand("l", [0.3, 1.08, -0.2], "open").elbow("l", [-0.2, 0.3, -1]);
    mv("lotta.pummelAir", "Pummeling a vuoto in motion: braccia alternate sotto le ascelle, gomiti stretti", [K(sq, 260, 60), K(pumAir.copy().act("armr"), 220, 100), K(pumM.copy().move(0, 0.12), 200, 30), K(pumAir.copy().mirror().move(0, 0.2).act("arml"), 220, 100), K(pumM2.copy().move(0, 0.1), 200, 30), K(pumAir.copy().act("armr"), 220, 100), K(sq, 260, 200)]);

    // collar tie: mano dietro la sua testa, avambraccio sulla clavicola, gomito dentro
    const DT = 0.72;
    const sqH = sq.copy().set("head", [0.29, 1.31, -0.08]);
    const ct = sqH.copy().hand("r", [0.5, 1.36, 0.06], "open").elbow("r", [0.2, -1, -0.4]).hand("l", [0.38, 1.0, -0.2], "open").elbow("l", [0, -1, -0.3]);
    const pCt = opp(ct, DT);
    const ctPull = ct.copy().hand("r", [0.47, 1.25, 0.05]).sink(0.03).act("armr");
    const pCtPull = opp(ct, DT).sink(0.08).lean(0.0, 0, 0.04).hand("r", [0.22, 1.28, -0.02]).hand("l", [0.36, 1.0, 0.18]);
    const pFar = opp(sq, 0.95);
    mv("lotta.collarTie", "Collar tie: mano dietro la sua testa, avambraccio sulla clavicola, tira giù", [K(sq, 300, 100, null, pFar), K(ct.copy().act("armr", "arml"), 300, 300, null, pCt), K(ctPull, 220, 600, null, pCtPull), K(sq, 350, 200, null, pFar)]);
    // inside tie: mano interna sul suo bicipite, gomito dentro, spingi
    const pIn = opp(sq, DT).hand("l", [0.3, 1.02, -0.22]).hand("r", [0.3, 1.02, 0.22]).elbow("l", [0, -1, 0.3]).elbow("r", [0, -1, -0.3]);
    const it = sqH.copy().hand("r", [0.42, 1.06, 0.13], "open").elbow("r", [0, -1, 0.2]).hand("l", [0.36, 0.98, -0.2], "open").elbow("l", [0, -1, -0.2]);
    const itPush = it.copy().hand("r", [0.5, 1.08, 0.14]).act("armr");
    const pInPush = place(pIn, 0, 0.08, 0).lean(0.04).hand("l", [0.38, 1.02, -0.22]).hand("r", [0.4, 1.0, 0.22]);
    mv("lotta.insideTie", "Inside tie: mano interna sul suo bicipite, gomito dentro, lo tieni lontano", [K(sq, 300, 100, null, pFar), K(it.copy().act("armr"), 300, 300, null, pIn), K(itPush, 220, 600, null, pInPush), K(sq, 350, 200, null, pFar)]);
    // two-on-one: due mani su un suo braccio, spalla incollata, tira giù con il peso
    const p21 = opp(sq, 0.8).hand("r", [0.24, 0.98, -0.16]).elbow("r", [0, -1, -0.3]).hand("l", [0.45, 1.0, 0.25]);
    const t21 = mk({ pel: [-0.06, 0.72, -0.02], chest: [0.1, 1.17, -0.08], head: [0.22, 1.32, -0.12], yaw: 30, fl: flat(0.06, -0.3, 20, 8), fr: flat(-0.08, 0.22, -5, 8), kl: [1, 0, -0.3], kr: [1, 0, 0.3], hl: [0.27, 0.97, -0.17], hr: [0.42, 1.1, -0.22], el: [0, -1, -0.4], er: [0, -1, 0.4] });
    const t21Pull = t21.copy().sink(0.12).hand("l", [0.26, 0.82, -0.14]).hand("r", [0.4, 0.96, -0.2]).act("arml", "armr", "legl", "legr");
    const p21Pull = place(p21, 0, -0.04, 0).sink(0.06).lean(-0.06, 0, 0.04).hand("r", [0.26, 0.83, -0.14]);
    mv("lotta.twoOnOne", "Two-on-one: mano bassa sul polso, mano alta sopra il gomito, tira giù col peso", [K(sq, 300, 100, null, pFar), K(t21.copy().act("arml", "armr"), 320, 300, null, p21), K(t21Pull, 260, 600, null, p21Pull), K(sq, 350, 200, null, pFar)]);
    mv("lotta.tieChain", "In motion: pummeling, collar tie, inside tie e two-on-one", [K(sq, 260, 60, null, pFar), K(pumA, 260, 100, null, opp(pumA, DC)), K(pumB, 240, 100, null, opp(pumB, DC)), K(ct, 260, 200, null, pCt), K(it, 260, 200, null, pIn), K(t21, 280, 200, null, p21), K(t21Pull, 220, 200, null, p21Pull), K(sq, 320, 200, null, pFar)]);

    // snap down: tira testa e gomito verso le anche con un passo indietro, lui cade sulle mani
    const ctE = ct.copy().hand("l", [0.36, 1.06, -0.18]);
    const snap = mk({ pel: [-0.24, 0.72, 0], chest: [-0.06, 1.15, 0], head: [0.06, 1.31, -0.04], fl: flat(-0.1, -0.26, 8, 8), fr: flat(-0.34, 0.26, -8, 12), kl: [1, 0, -0.25], kr: [1, 0, 0.25], hl: [0.18, 0.8, -0.12], hr: [0.2, 0.84, 0.08], el: [-0.3, -1, -0.5], er: [-0.3, -1, 0.5] }).act("arml", "armr", "legr", "legl");
    const pSnap = mk({ pel: [0.66, 0.78, 0], chest: [0.28, 0.96, 0], head: [0.12, 0.9, 0], yaw: 180, fl: flat(0.6, 0.22, 175, 30), fr: flat(0.86, -0.22, -175, 20), kl: [-1, 0, 0.2], kr: [-1, 0, -0.2], hl: [0.12, 0.6, 0.2], hr: [0.14, 0.6, -0.2], el: [0.3, -1, 0.3], er: [0.3, -1, -0.3] });
    const fhl = mk({ pel: [-0.2, 0.4, 0], chest: [0.22, 0.66, 0], head: [0.4, 0.76, -0.04], fl: [-0.86, ankleY(60), -0.38, 0, 60], fr: [-0.86, ankleY(60), 0.38, 0, 60], kl: [0, -1, -0.3], kr: [0, -1, 0.3], hl: [0.32, 0.38, -0.2], hr: [0.12, 0.5, 0.02], el: [0, 0.3, -1], er: [0.2, 0, 1] }).act("legl", "legr", "torso", "arml", "armr");
    const snapF = [K(sq, 260, 80, null, pFar), K(ctE, 260, 250, null, pCt), K(snap, 180, 120, null, pSnap), K(fhl, 240, 600, null, pQ), K(sq, 500, 200, null, pFar)];
    mv("lotta.snapDown", "Snap down: dalla presa al collo tira testa e gomito giù con un passo indietro", snapF);
    mv("lotta.snapDownR", "Snap down dall'altro lato", mirrorFrames(snapF));
    mv("lotta.snapTie", "In frontale, braccia piegate, gomiti dentro: presa al collo e al gomito", [K(sq, 300, 100, null, pFar), K(ctE.copy().act("arml", "armr"), 300, 1000, null, pCt), K(sq, 350, 200, null, pFar)]);
    mv("lotta.snapPull", "Colpo secco: mani verso le anche e passo indietro nello stesso istante", [K(ctE, 300, 200, null, pCt), K(snap, 180, 800, null, pSnap), K(ctE, 400, 200, null, pCt)]);
    mv("lotta.snapSprawl", "Subito anche giù in uno sprawl corto: lui atterra davanti a te", [K(snap, 300, 100, null, pSnap), K(fhl, 260, 1000, null, pQ), K(sq, 500, 200, null, pFar)]);
    // da solo: asciugamano sopra la sbarra e snap a vuoto
    const twA = sq.copy().hand("l", [0.36, 1.5, -0.08], "fist").hand("r", [0.36, 1.5, 0.08], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]);
    const twB = sq.copy().move(-0.18).sink(0.08).hand("l", [0.06, 0.95, -0.1], "fist").hand("r", [0.06, 0.95, 0.1], "fist").elbow("l", [-0.3, -1, -0.5]).elbow("r", [-0.3, -1, 0.5]).act("arml", "armr", "legl", "legr");
    mv("lotta.towelGrip", "Asciugamano sopra la sbarra: una mano per estremità, braccia piegate", [K(sq, 300, 100), K(twA.copy().act("arml", "armr"), 350, 1000), K(sq, 350, 200)]);
    mv("lotta.towelSnap", "Snap con l'asciugamano: tira giù verso le anche e passo indietro", [K(twA, 300, 200), K(twB, 170, 300), K(twB.copy().move(0).sink(0.1).act("legl", "legr"), 200, 300), K(twA, 450, 200)]);
    const snapAir = snap.copy().hand("l", [0.14, 0.82, -0.12]).hand("r", [0.16, 0.84, 0.1]);
    mv("lotta.snapAir", "Snap down a vuoto: mani giù verso le anche, passo indietro, anche basse", [K(sq, 260, 100), K(sqH.copy().hand("r", [0.42, 1.32, 0.06]).hand("l", [0.36, 1.06, -0.18]).act("arml", "armr"), 240, 200), K(snapAir, 170, 200), K(snapAir.copy().sink(0.14).act("legl", "legr"), 200, 300), K(sq, 400, 200)]);

    // front headlock e go-behind (compagno sulle mani)
    const fhlGo1 = around(fhl, CQ[0], CQ[1], 50).act("legl", "legr");
    const fhlGo2 = around(fhl, CQ[0], CQ[1], 100).act("legl", "legr");
    const fhlF = [K(g, 260, 80, null, pQ), K(fhl, 260, 300, null, pQ), K(fhlGo1, 280, 60, null, pQ), K(fhlGo2, 280, 60, null, pQ), K(gbBehind, 300, 600, null, pQ), K(gbSide, 450, 60, null, pQ), K(g, 450, 200, null, pQ)];
    mv("lotta.frontHeadlock", "Front headlock: petto sulla sua testa, mano sotto il mento, l'altra sul gomito", [K(g, 260, 100, null, pQ), K(fhl, 280, 1200, null, pQ), K(g, 400, 200, null, pQ)]);
    mv("lotta.fhlGoBehind", "Dal front headlock: blocca il gomito e cammina fino dietro, petto incollato", fhlF);
    mv("lotta.fhlGoBehindL", "Go-behind dal front headlock girando dall'altra parte", mirrorFrames(fhlF));
    mv("lotta.fhlHips", "Anche indietro e basse, gambe larghe, peso sul petto", [K(fhl, 300, 100, null, pQ), K(fhl.copy().set("pel", [-0.26, 0.34, 0]).act("legl", "legr", "torso"), 300, 1000, null, pQ), K(fhl, 300, 200, null, pQ)]);

    // duck under: solleva il suo gomito, testa sotto l'ascella, passo dietro il suo piede
    const pCtUp = pCt.copy().elbow("r", [0.2, 1, -0.6]).hand("r", [0.26, 1.42, -0.06]);
    const du1 = ct.copy().hand("l", [0.4, 1.36, -0.2]).elbow("l", [0, -1, -0.4]).act("arml");
    const du2 = mk({ pel: [0.36, 0.56, -0.3], chest: [0.56, 0.95, -0.32], head: [0.7, 1.08, -0.38], yaw: -20, fl: flat(0.9, -0.42, -30), fr: toes(0.02, 0.05, -15, 50), kl: [1, 0.2, -0.3], kr: [0.3, -1, 0], hl: [0.5, 1.38, -0.26], hr: [0.66, 0.95, 0.08], el: [0, -1, -0.5], er: [0, -1, 0.5] }).act("legl", "legr", "head", "torso");
    const pDu2 = pCtUp.copy().hand("r", [0.62, 1.48, -0.3]).elbow("r", [0, 1, -0.6]);
    const du3 = mk({ pel: [0.86, 0.82, -0.34], chest: [0.86, 1.31, -0.26], head: [0.86, 1.5, -0.22], yaw: -100, fl: flat(1.0, -0.42, -100), fr: flat(0.72, -0.56, -110), kl: [0.1, 0, 1], kr: [0.1, 0, 1], hl: [0.84, 0.98, 0.15], hr: [0.6, 0.98, 0.1], el: [1, -0.5, 0], er: [-1, -0.5, 0] }).act("legl", "legr", "arml", "armr");
    const pDu3 = mk({ pel: [0.74, 0.86, 0.02], chest: [0.72, 1.35, 0.02], head: [0.7, 1.55, 0.02], yaw: 165, fl: flat(0.72, 0.24, 170), fr: flat(0.7, -0.24, -175), kl: [-1, 0, 0.2], kr: [-1, 0, -0.2], hl: [0.5, 1.0, 0.3], hr: [0.95, 1.38, -0.36], el: [0, -1, 0.3], er: [0, 0.5, -1] });
    const duF = [K(sq, 260, 80, null, pFar), K(ct, 280, 250, null, pCt), K(du1, 220, 200, null, pCtUp), K(du2, 240, 120, null, pDu2), K(du3, 280, 700, null, pDu3), K(sq, 600, 200, null, pFar)];
    mv("lotta.duckUnder", "Duck under: solleva il gomito, testa sotto l'ascella, passo dietro e mani alla vita", duF);
    mv("lotta.duckUnderR", "Duck under dall'altro lato", mirrorFrames(duF));
    mv("lotta.duckLift", "Con la mano interna sollevi il suo gomito", [K(ct, 300, 200, null, pCt), K(du1, 260, 1000, null, pCtUp), K(ct, 350, 200, null, pCt)]);
    mv("lotta.duckStep", "Livello giù, testa sotto il braccio, passo profondo dietro il suo piede", [K(du1, 300, 200, null, pCtUp), K(du2, 300, 1000, null, pDu2), K(du1, 400, 200, null, pCtUp)]);
    mv("lotta.duckFinish", "Sali dietro: testa alta, petto sul suo fianco, mani chiuse alla vita", [K(du2, 300, 150, null, pDu2), K(du3, 320, 1200, null, pDu3), K(sq, 600, 200, null, pFar)]);

    // arm drag: polso con la mano opposta, l'altra afferra sopra il gomito, tira verso l'anca e passo fuori
    const pAd = opp(sq, 0.8).hand("r", [0.24, 1.18, -0.2]).elbow("r", [0, -1, -0.2]);
    const ad1 = sq.copy().hand("l", [0.3, 1.14, -0.18], "fist").elbow("l", [0, -1, -0.3]).hand("r", [0.44, 1.18, -0.22], "fist").elbow("r", [0, -1, 0.5]).act("arml", "armr");
    const ad2 = mk({ pel: [0.12, 0.7, -0.22], chest: [0.24, 1.15, -0.2], head: [0.34, 1.31, -0.22], yaw: -25, fl: flat(0.48, -0.5, -30, 5), fr: flat(-0.08, 0.14, -30, 15), kl: [1, 0, -0.3], kr: [1, 0, 0.3], hl: [0.2, 0.86, 0.1, "fist"], hr: [0.3, 0.92, 0.0, "fist"], el: [0, -1, -0.5], er: [0, -1, 0.5] }).act("arml", "armr", "legl");
    const pAd2 = mk({ pel: [0.72, 0.8, 0.02], chest: [0.52, 1.18, 0.06], head: [0.38, 1.3, 0.06], yaw: 205, fl: flat(0.74, 0.28, 200, 10), fr: flat(0.6, -0.16, 200, 20), kl: [-1, 0, 0.3], kr: [-1, 0, -0.2], hl: [0.6, 0.95, 0.3], hr: [0.26, 0.9, 0.04], el: [0, -1, 0.3], er: [0, -1, -0.3] });
    const ad3 = place(sq, -70, 0.6, -0.5).act("legl", "legr");
    ad3.hand("l", [0.84, 1.05, -0.2], "open").hand("r", [0.72, 0.95, -0.12], "open");
    const pAd3 = mk({ pel: [0.8, 0.82, 0.04], chest: [0.66, 1.26, 0.1], head: [0.58, 1.44, 0.12], yaw: 225, fl: flat(0.86, 0.3, 225, 10), fr: flat(0.62, -0.06, 220, 20), kl: [-1, 0, 0.5], kr: [-1, 0, 0], hl: [0.7, 0.95, 0.35], hr: [0.5, 0.92, -0.08], el: [0, -1, 0.3], er: [0, -1, -0.3] });
    const adF = [K(sq, 260, 80, null, pAd), K(ad1, 260, 250, null, pAd), K(ad2, 260, 200, null, pAd2), K(ad3, 300, 600, null, pAd3), K(sq, 600, 200, null, pAd)];
    mv("lotta.armDrag", "Arm drag: polso e sopra il gomito, tira verso l'anca e passo fuori al suo fianco", adF);
    mv("lotta.armDragR", "Arm drag dall'altro lato, mani invertite", mirrorFrames(adF));
    mv("lotta.dragReady", "Il suo braccio destro teso verso di te, tu in frontale", [K(sq, 300, 1200, null, pAd)]);
    mv("lotta.dragWrist", "La mano sinistra prende il suo polso destro", [K(sq, 300, 150, null, pAd), K(sq.copy().hand("l", [0.3, 1.14, -0.18], "fist").elbow("l", [0, -1, -0.3]).act("arml"), 300, 1000, null, pAd), K(sq, 350, 200, null, pAd)]);
    mv("lotta.dragGrip", "La mano sinistra sul suo polso, la destra attraversa e afferra sopra il gomito", [K(sq, 300, 150, null, pAd), K(ad1, 300, 1100, null, pAd), K(sq, 350, 200, null, pAd)]);
    mv("lotta.dragPull", "Tira verso l'anca destra e passo avanti fuori: finisci al suo fianco", [K(ad1, 300, 150, null, pAd), K(ad2, 280, 200, null, pAd2), K(ad3, 320, 900, null, pAd3), K(ad1, 500, 200, null, pAd)]);

    /* ---------------------------------------------------------------- finte */
    const hf = g.copy().headTo(0.02, -0.02, 0.14).twist(-10).shift(0, 0.05).act("head", "torso");
    mv("lotta.headFake", "Finta di testa: la testa scatta di lato come per entrare", [K(g, 240, 80), K(hf, 140, 160), K(g, 160, 100)]);
    const kt2 = g.copy().sink(0.14).lean(0.08).handRel("l", 0.42, -0.38, -0.08, "open").elbow("l", [0, -1, -0.3]).act("arml", "legl", "legr");
    mv("lotta.kneeTouch", "Tocco al ginocchio: la mano scende a toccare il suo ginocchio avanti", [K(g, 240, 80), K(kt2, 170, 160), K(g, 170, 100)]);
    mv("lotta.levelFake", "Finta di livello: scendi a metà e risali subito", [K(g, 240, 80), K(g.copy().sink(0.11).lean(0.02).act("legl", "legr"), 160, 120), K(g, 160, 100)]);
    mv("lotta.stutter", "Stutter step: tre passi corti e veloci verso di lui", [K(g, 240, 40), K(g.copy().step("l", 0.1).shift(0.05).heel("r", 25).act("legl"), 110, 10), K(g.copy().move(0.1).act("legr"), 110, 10), K(g.copy().move(0.1).step("l", 0.1).shift(0.05).act("legl"), 110, 10), K(g.copy().move(0.2).act("legr"), 110, 10), K(g.copy().move(0.2).step("l", 0.1).shift(0.05).act("legl"), 110, 10), K(g.copy().move(0.3).act("legr"), 110, 150), K(g, 350, 100)]);

    /* ---------------------------------------------------------------- tiro bloccato: lui fa sprawl, ritiro */
    const pSprOnMe = mk({ pel: [1.12, 0.68, 0], chest: [0.74, 0.98, 0], head: [0.56, 1.06, 0], yaw: 180, fl: [1.78, ankleY(60), 0.3, 180, 60], fr: [1.78, ankleY(60), -0.3, 180, 60], kl: [0, -1, 0.3], kr: [0, -1, -0.3], hl: [0.44, 0.78, 0.2], hr: [0.44, 0.78, -0.2], el: [0.3, 0, 1], er: [0.3, 0, -1] });
    const blkHead = dlKnee.copy().set("chest", [0.64, 0.84, 0.02]).set("head", [0.78, 0.97, 0.02]).hand("l", [1.02, 0.66, -0.12]).hand("r", [1.02, 0.66, 0.12]).elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]).act("head", "arml", "armr");
    const blkBack = mk({ pel: [0.12, 0.6, 0.06], chest: [0.4, 0.98, 0.04], head: [0.53, 1.12, 0.02], yaw: -10, fl: flat(0.4, -0.16, -8, 0), fr: toes(-0.2, 0.22, -15, 40), kl: [1, 0.2, 0], kr: [0.4, -1, 0], hl: [0.7, 0.8, -0.12], hr: [0.7, 0.8, 0.14], el: [0, -1, -0.4], er: [0, -1, 0.4] }).act("legl", "legr");
    const pRise = mk({ pel: [1.14, 0.62, 0], chest: [0.8, 0.94, 0], head: [0.64, 1.04, 0], yaw: 180, fl: [1.5, ankleY(45), 0.28, 180, 45], fr: [1.5, ankleY(45), -0.28, 180, 45], kl: [-0.3, -1, 0.3], kr: [-0.3, -1, -0.3], hl: [0.6, 0.6, 0.2], hr: [0.6, 0.6, -0.2], el: [0.3, 0, 1], er: [0.3, 0, -1] });
    const blkF = [K(g, 260, 80, null, pS), K(lv, 160, 20, null, pS), K(s2(dlKnee), 220, 150, null, s2(pUp)), K(s2(dlKnee).copy().act(), 200, 150, null, s2(pSprOnMe)), K(s2(blkHead), 220, 300, null, s2(pSprOnMe)), K(blkBack, 280, 150, null, s2(pRise)), K(g.copy().act("legl", "legr"), 300, 300, null, pS)];
    mv("lotta.shotBlocked", "Tiro bloccato: lui fa sprawl, testa su contro il petto, anche indietro, su", blkF);
    mv("lotta.blockHead", "Lui fa sprawl: testa su contro il suo petto, mani che bloccano le anche", [K(s2(dlKnee), 300, 150, null, s2(pUp)), K(s2(dlKnee).copy().act(), 220, 150, null, s2(pSprOnMe)), K(s2(blkHead), 250, 1000, null, s2(pSprOnMe)), K(g, 600, 200, null, pS)]);
    mv("lotta.blockBack", "Passo indietro, anche indietro e su in posizione senza restare sotto", [K(s2(blkHead), 300, 150, null, s2(pSprOnMe)), K(blkBack, 300, 200, null, s2(pRise)), K(g.copy().act("legl", "legr"), 320, 600, null, pS)]);

    /* ---------------------------------------------------------------- uscita dal front headlock */
    const meQ = quadP();
    const pFhl = opp(fhl, DQ);
    const heHands = meQ.copy().set("chest", [0.12, 0.6, 0]).set("head", [0.28, 0.68, 0]).hand("l", [0.3, 0.5, -0.06], "fist").hand("r", [0.3, 0.5, 0.06], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]).act("arml", "armr", "head");
    const heFeet = mk({ pel: [-0.12, 0.56, 0], chest: [0.2, 0.92, 0], head: [0.32, 0.98, 0], fl: flat(-0.05, -0.22, 10, 20), fr: flat(-0.2, 0.22, -10, 25), kl: [1, 0.2, -0.3], kr: [1, 0.2, 0.3], hl: [0.38, 0.9, -0.06, "fist"], hr: [0.38, 0.9, 0.06, "fist"], el: [0, -1, -0.6], er: [0, -1, 0.6] }).act("legl", "legr");
    const pFhlUp = place(pFhl, 0, 0.06, 0).set("pel", [0.86, 0.6, 0]).set("chest", [0.42, 0.9, 0]).set("head", [0.26, 1.0, 0.04]).hand("l", [0.3, 0.88, 0.04]).hand("r", [0.24, 0.94, -0.06]).footW("l", [1.3, ankleY(50), 0.38], 180, 50).footW("r", [1.3, ankleY(50), -0.38], 180, 50);
    const heOut = place(g, -40, -0.1, -0.25).act("legl", "legr", "head", "torso");
    const pFhlLost = place(pFhlUp, 0, 0, 0).set("chest", [0.46, 0.84, 0]).set("head", [0.3, 0.9, 0]).hand("l", [0.28, 0.66, 0.18]).hand("r", [0.28, 0.66, -0.18]);
    const heF = [K(meQ, 300, 200, null, pFhl), K(heHands, 260, 250, null, pFhl), K(heFeet, 300, 250, null, pFhlUp), K(heOut, 300, 600, null, pFhlLost), K(meQ, 650, 200, null, pFhl)];
    mv("lotta.headlockEscape", "Uscita dal front headlock: mani sul polso, piedi sotto, giro e testa fuori", heF);
    mv("lotta.headlockBottom", "A quattro appoggi dopo lo snap: il suo braccio attorno alla tua testa", [K(meQ, 400, 1200, null, pFhl)]);
    mv("lotta.headlockHands", "Mani sul suo polso vicino al mento, gomiti stretti, testa su e indietro", [K(meQ, 300, 150, null, pFhl), K(heHands, 300, 1100, null, pFhl), K(meQ, 400, 200, null, pFhl)]);
    mv("lotta.headlockFeet", "Piedi sotto di te con passi corti: dalle ginocchia ai piedi", [K(heHands, 300, 150, null, pFhl), K(heFeet, 400, 1100, null, pFhlUp), K(heHands, 450, 200, null, pFhl)]);
    mv("lotta.headlockOut", "Gira verso il lato della tua testa e tirala fuori salendo in posizione", [K(heFeet, 300, 150, null, pFhlUp), K(heOut, 350, 1100, null, pFhlLost), K(heFeet, 500, 200, null, pFhlUp)]);

    /* ---------------------------------------------------------------- lotta a terra da sopra (manichino = compagno) */
    // corpo disteso lungo x, ruotato di r gradi sul proprio asse (0 = a pancia in giu', -180 = sulla schiena)
    function bodyRoll(r, x, z, lift = 0) {
      const R = (r * Math.PI) / 180;
      const right = [0, -Math.sin(R), Math.cos(R)];
      const fwd = [0, -Math.cos(R), -Math.sin(R)];
      const h = 0.13 + 0.07 * Math.abs(Math.sin(R)) + lift;
      const P0 = [x, h, z];
      const at = (ax, rr, ff) => [P0[0] + ax, P0[1] + right[1] * rr + fwd[1] * ff, P0[2] + right[2] * rr + fwd[2] * ff];
      const b = standing();
      b.set("pel", P0).set("chest", at(0.5, 0, 0.02)).set("head", at(0.72, 0, 0.04)).set("hipYaw", 0).set("chestYaw", 0).set("hipRoll", r).set("chestRoll", r);
      const fp = (r / -180) * -90;
      b.footW("l", at(-0.86, -0.12, 0.03), 180, fp, 180 + r).footW("r", at(-0.86, 0.12, 0.03), 180, fp, 180 + r);
      b.hand("l", at(0.2, -0.14, 0.13), "open").hand("r", at(0.2, 0.14, 0.13), "open");
      b.knee("l", fwd.map((v) => -v)).knee("r", fwd.map((v) => -v)).elbow("l", [-1, 0, 0]).elbow("r", [-1, 0, 0]);
      return b;
    }
    const pB = place(bt, 0, 0.3, 0);                                    // manichino a quattro appoggi
    const topSt = mk({ pel: [0.05, 0.5, -0.44], chest: [0.22, 0.82, -0.12], head: [0.32, 0.94, 0.0], yaw: -75, cyaw: -70, fl: toes(0.14, -0.8, -75, 80), fr: toes(-0.08, -0.74, -75, 80), kl: [0.26, -1, 0.97], kr: [0.26, -1, 0.97], hl: [0.46, 0.34, -0.2], hr: [0.12, 0.4, 0.0], el: [0.3, 0, -1], er: [-0.3, -0.5, 0.5] });
    const pChop = (() => {
      const b = pB.copy().set("chest", [0.46, 0.36, -0.08]).set("head", [0.64, 0.34, -0.1]).set("chestRoll", -15);
      b.hand("l", [0.22, 0.12, -0.12]).elbow("l", [0, 1, -1]);
      return b;
    })();
    const chop = mk({ pel: [0.22, 0.44, -0.32], chest: [0.42, 0.7, -0.04], head: [0.55, 0.78, 0.06], yaw: -60, cyaw: -55, fl: toes(0.2, -0.78, -60, 75), fr: toes(-0.06, -0.7, -60, 75), kl: [0.4, -1, 0.9], kr: [0.4, -1, 0.9], hl: [0.26, 0.24, -0.18], hr: [0.2, 0.3, 0.06], el: [0, 0.3, -1], er: [-0.3, -0.5, 0.5] }).act("arml", "legl", "legr", "torso");
    const pFlat = bodyRoll(0, 0.12, 0.02);
    const tight = mk({ pel: [0.12, 0.32, -0.42], chest: [0.36, 0.38, -0.02], head: [0.5, 0.42, 0.14], yaw: -55, cyaw: -60, fl: toes(-0.3, -1.1, -55, 60), fr: toes(-0.5, -0.98, -55, 60), kl: [0, -1, 0], kr: [0, -1, 0], hl: [0.5, 0.2, -0.2], hr: [0.16, 0.12, 0.14], el: [0, 0.3, -1], er: [0, 0.6, 0.6] }).act("torso", "armr");
    const topF = [K(topSt, 400, 300, null, pB), K(chop, 220, 200, null, pChop), K(tight, 300, 700, null, pFlat), K(topSt, 700, 200, null, pB)];
    mv("lotta.chop", "Chop e tight waist: strappa il gomito, anche in diagonale, petto sulla schiena", topF);
    mv("lotta.chopR", "Chop e tight waist dal lato destro", mirrorFrames(topF));
    mv("lotta.topStart", "Partenza di sopra: mano sul suo gomito, braccio alla vita, ginocchio vicino all'anca", [K(topSt.copy().act("arml", "armr"), 400, 1200, null, pB)]);
    mv("lotta.chopStrike", "La mano strappa il gomito indietro, le anche spingono verso l'appoggio tolto", [K(topSt, 300, 200, null, pB), K(chop, 220, 900, null, pChop), K(topSt, 450, 200, null, pB)]);
    mv("lotta.tightWaist", "Schiacciato sul tappeto: petto sulla schiena, braccio stretto alla vita, anche basse", [K(chop, 300, 100, null, pChop), K(tight, 320, 1200, null, pFlat), K(topSt, 600, 200, null, pB)]);
    // spin drill: petto sulla sua schiena, piedi che girano intorno
    const spin0 = mk({ pel: [0.24, 0.42, -0.32], chest: [0.24, 0.74, 0.04], head: [0.24, 0.8, 0.23], yaw: -90, fl: [0.48, ankleY(60), -1.06, -90, 60], fr: [0.0, ankleY(60), -1.06, -90, 60], kl: [0, -1, 0], kr: [0, -1, 0], hl: [0.45, 0.5, 0.2], hr: [0.05, 0.5, 0.2], el: [1, 0.3, 0], er: [-1, 0.3, 0] }).act("legl", "legr");
    const SC = [0.24, 0.04];
    const spinAt = (a) => around(spin0, SC[0], SC[1], a);
    const spinF = [K(spin0, 300, 100, null, pB), K(spinAt(-45), 260, 20, null, pB), K(spinAt(-90), 260, 20, null, pB), K(spinAt(-135), 260, 20, null, pB), K(spinAt(-180), 260, 150, null, pB), K(spinAt(-135), 260, 20, null, pB), K(spinAt(-90), 260, 20, null, pB), K(spinAt(-45), 260, 20, null, pB), K(spin0, 260, 200, null, pB)];
    mv("lotta.spin", "Spin drill: petto sulla sua schiena, gambe distese, piedi che girano in cerchio", spinF);
    mv("lotta.spinPos", "Sopra il manichino: petto sulla schiena, gambe distese sulle punte, anche basse", [K(topSt, 300, 100, null, pB), K(spin0, 400, 1100, null, pB), K(topSt, 450, 200, null, pB)]);
    mv("lotta.spinHalf", "Mezzo giro di spin fino al lato opposto, petto incollato", [K(spin0, 300, 100, null, pB), K(spinAt(-60), 280, 20, null, pB), K(spinAt(-120), 280, 20, null, pB), K(spinAt(-180), 280, 500, null, pB), K(spin0, 700, 200, null, pB)]);
    mv("lotta.spinSwitch", "Al segnale cambia direzione subito", [K(spin0, 300, 100, null, pB), K(spinAt(-50), 260, 20, null, pB), K(spinAt(-100), 260, 80, null, pB), K(spinAt(-50), 220, 20, null, pB), K(spin0, 220, 20, null, pB), K(spinAt(50), 260, 20, null, pB), K(spinAt(100), 260, 80, null, pB), K(spinAt(50), 220, 20, null, pB), K(spin0, 220, 200, null, pB)]);

    // chiusura delle mani e sollevamento con le anche (borsone a terra immaginario)
    const lockSt = up.copy().hand("l", [0.32, 1.08, -0.01], "open").hand("r", [0.32, 1.04, 0.01], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]).act("arml", "armr");
    mv("lotta.gripLock", "Chiusura palmo contro palmo: un palmo in su e uno in giù, dita mai incrociate", [K(up, 300, 100), K(lockSt, 350, 1200), K(up, 350, 200)]);
    const llA = mk({ pel: [-0.05, 0.5, 0], chest: [0.28, 0.82, 0], head: [0.42, 0.95, 0], fl: toes(-0.47, -0.14, 0, 80), fr: toes(-0.47, 0.14, 0, 80), kl: [1, -1, 0], kr: [1, -1, 0], hl: [0.48, 0.36, -0.02], hr: [0.48, 0.34, 0.02], el: [0, 0, -1], er: [0, 0, 1] });
    const llLow = llA.copy().set("pel", [-0.12, 0.4, 0]).set("chest", [0.24, 0.72, 0]).set("head", [0.38, 0.85, 0]).hand("l", [0.46, 0.3, -0.02]).hand("r", [0.46, 0.28, 0.02]).act("legl", "legr");
    const llUp = llA.copy().set("pel", [0.04, 0.56, 0]).set("chest", [0.3, 0.98, 0]).set("head", [0.4, 1.15, 0]).hand("l", [0.46, 0.5, -0.02]).hand("r", [0.46, 0.48, 0.02]).act("legl", "legr", "torso");
    mv("lotta.lockKneel", "In ginocchio di fianco al borsone, braccia attorno, mani chiuse sotto", [K(up, 300, 100), K(kneel(), 400, 100), K(llA.copy().act("arml", "armr", "torso"), 400, 1200)]);
    mv("lotta.lockLiftR", "Lock and lift dall'altro lato", mirrorFrames([K(llA, 300, 200), K(llLow, 300, 200), K(llUp, 300, 600), K(llA, 400, 200)]));
    mv("lotta.lockLift", "In ginocchio, mani chiuse sotto: anche giù, poi spingi e solleva con le anche", [K(llA, 300, 200), K(llLow, 300, 200), K(llUp, 300, 600), K(llA, 400, 200)]);
    // gut wrench a camminata (manichino a pancia in giu')
    const pG0 = bodyRoll(0, 0.0, 0.02);
    const gw0 = mk({ pel: [0.2, 0.42, -0.52], chest: [0.28, 0.48, -0.12], head: [0.3, 0.54, 0.08], yaw: -90, fl: toes(0.32, -0.9, -90, 75), fr: toes(0.08, -0.9, -90, 75), kl: [0, -1, 1], kr: [0, -1, 1], hl: [0.38, 0.1, 0.14], hr: [0.3, 0.1, 0.16], el: [1, 0.2, 0], er: [-1, 0.2, 0] });
    const gwLift = gw0.copy().knee("l", [0, -0.5, 1]).knee("r", [0, -0.5, 1]).footW("l", [0.32, ankleY(75), -1.0], -90, 75).footW("r", [0.08, ankleY(75), -1.0], -90, 75).set("pel", [0.2, 0.37, -0.42]).set("chest", [0.28, 0.5, -0.02]).set("head", [0.3, 0.58, 0.16]).hand("l", [0.38, 0.2, 0.16]).hand("r", [0.3, 0.2, 0.18]).act("legl", "legr", "torso");
    const pG1 = bodyRoll(-25, 0.0, 0.02, 0.08);
    const gwWalk = mk({ pel: [0.4, 0.5, -0.5], chest: [0.4, 0.68, -0.06], head: [0.42, 0.86, 0.02], yaw: -125, fl: flat(0.72, -0.62, -125, 10), fr: flat(0.42, -0.86, -125, 20), kl: [0.4, 0.3, 1], kr: [0.4, 0.3, 1], hl: [0.4, 0.36, 0.1, "fist"], hr: [0.28, 0.36, 0.06, "fist"], el: [1, -0.5, 0], er: [-1, -0.5, 0] }).act("legl", "legr", "arml", "armr");
    const pG2 = bodyRoll(-100, 0.0, -0.06, 0.14);
    const gwEnd = mk({ pel: [0.48, 0.5, -0.44], chest: [0.5, 0.62, -0.02], head: [0.52, 0.76, 0.12], yaw: -90, fl: toes(0.62, -0.84, -90, 75), fr: toes(0.36, -0.84, -90, 75), kl: [0, -1, 1], kr: [0, -1, 1], hl: [0.6, 0.12, 0.14, "fist"], hr: [0.44, 0.12, 0.14, "fist"], el: [1, 0.2, 0], er: [-1, 0.2, 0] }).act("torso");
    const pG3 = bodyRoll(-180, 0.0, 0.0);
    const gutF = [K(gw0, 400, 250, null, pG0), K(gwLift, 300, 200, null, pG1), K(gwWalk, 360, 100, null, pG2), K(gwEnd, 360, 700, null, pG3), K(gw0, 800, 200, null, pG0)];
    mv("lotta.gutWrench", "Gut wrench a camminata: mani chiuse sotto le costole, cammina verso la testa e gira", gutF);
    mv("lotta.gutWrenchR", "Gut wrench dall'altro lato", mirrorFrames(gutF));
    mv("lotta.gutLock", "In ginocchio al suo fianco, petto sul fianco, mani chiuse sotto le costole", [K(gw0.copy().act("arml", "armr"), 400, 1200, null, pG0)]);
    mv("lotta.gutLift", "Anche basse incollate al suo fianco, poi solleva il suo centro con le anche", [K(gw0, 300, 200, null, pG0), K(gwLift, 350, 900, null, pG1), K(gw0, 400, 200, null, pG0)]);
    mv("lotta.gutRoll", "Cammina verso la sua testa e tira la chiusura al petto: lui gira sulla schiena", [K(gwLift, 300, 150, null, pG1), K(gwWalk, 380, 150, null, pG2), K(gwEnd, 380, 800, null, pG3), K(gw0, 800, 200, null, pG0)]);
    mv("lotta.gutHold", "Fermati con il petto sopra di lui e le mani ancora chiuse", [K(gwWalk, 300, 100, null, pG2), K(gwEnd, 350, 1200, null, pG3), K(gw0, 800, 200, null, pG0)]);
    mv("lotta.topChain", "Catena da sopra: chop, mezzo spin, chiusura e gut wrench", [K(topSt, 300, 150, null, pB), K(chop, 220, 150, null, pChop), K(spinAt(-30).copy(), 300, 60, null, pB), K(spinAt(-100), 280, 60, null, pB), K(spinAt(-180), 280, 150, null, pB), K(gw0.copy().mirror(), 400, 150, null, pG0.copy().mirror()), K(gwWalk.copy().mirror(), 360, 80, null, pG2.copy().mirror()), K(gwEnd.copy().mirror(), 360, 500, null, pG3.copy().mirror()), K(topSt, 800, 200, null, pB)]);
    mv("lotta.breakdown", "Sopra il manichino: chop e petto sulla schiena", [K(topSt, 300, 150, null, pB), K(chop, 220, 150, null, pChop), K(tight, 300, 500, null, pFlat), K(topSt, 600, 200, null, pB)]);

    /* ---------------------------------------------------------------- drill con lo zaino (a vuoto, peso immaginario) */
    // doppia gamba sullo zaino: penetra, abbraccia, su con le gambe, gira e appoggia
    const sbKnee = pk.copy().hand("l", [0.98, 0.56, -0.06], "fist").hand("r", [0.98, 0.56, 0.06], "fist").elbow("l", [0, -0.3, -1]).elbow("r", [0, -0.3, 1]).set("head", [0.84, 1.07, 0.16]).act("legl", "legr", "arml", "armr");
    const sbUp = after.copy().hand("l", [0.86, 1.05, -0.04], "fist").hand("r", [0.86, 1.05, 0.04], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]).act("legl", "legr");
    const carry = sq.copy().set("pel", [-0.04, 0.8, 0]).set("chest", [0.06, 1.29, 0]).set("head", [0.1, 1.49, 0]).hand("l", [0.3, 1.05, -0.04], "fist").hand("r", [0.3, 1.05, 0.04], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]);
    const carryT = place(carry, 45, 0.62, 0.05);
    const carryT2 = place(carry, 90, 0.62, 0.05).act("legl", "legr");
    const sdP = wsq.copy().set("chest", [0.2, 0.82, 0]).set("head", [0.34, 0.96, 0]).hand("l", [0.42, 0.36, -0.04], "fist").hand("r", [0.42, 0.36, 0.04], "fist").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
    const setDownB = place(sdP, 90, 0.62, 0.05).act("legl", "legr");
    const sbF = [K(g, 300, 80), K(lv, 170, 20), K(p1, 180, 20), K(sbKnee, 200, 250), K(su.copy().hand("l", [0.95, 0.6, -0.05], "fist").hand("r", [0.95, 0.6, 0.05], "fist"), 260, 80), K(sbUp, 300, 150), K(carryT.copy().act("legl", "legr"), 260, 60), K(carryT2, 260, 150), K(setDownB, 320, 300), K(g, 600, 200)];
    mv("lotta.sandbagShot", "Doppia gamba sullo zaino: penetra, abbraccia, su con le gambe, gira e appoggia", sbF);
    mv("lotta.sandbagShotR", "Doppia gamba sullo zaino con il ginocchio destro", mirrorFrames(sbF));
    mv("lotta.sbGrip", "Braccia attorno allo zaino, mani chiuse, gomiti stretti, petto incollato", [K(g, 300, 80), K(lv, 170, 20), K(sbKnee, 300, 1100), K(g, 450, 200)]);
    mv("lotta.sbLift", "Step-up e salita con le gambe, schiena dritta, zaino al petto", [K(sbKnee, 300, 150), K(su.copy().hand("l", [0.95, 0.6, -0.05], "fist").hand("r", [0.95, 0.6, 0.05], "fist").act("legr"), 300, 150), K(sbUp, 320, 800), K(sbKnee, 500, 200)]);
    mv("lotta.sbTurn", "Gira di 90 gradi con due passi e appoggia lo zaino piegando le gambe", [K(sbUp, 300, 100), K(carryT.copy().act("legl", "legr"), 280, 60), K(carryT2, 280, 150), K(setDownB, 350, 600), K(g, 600, 200)]);
    // finiture della gamba singola tenendo lo zaino stretto al petto e tra le cosce
    const slHold = slStand.copy().move(-0.3, 0.12).hand("l", [0.22, 1.0, -0.06], "fist").hand("r", [0.22, 0.98, 0.06], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]);
    const slCorner1 = around(slHold.copy().step("l", -0.25, -0.15), 0.0, 0.0, 70).act("legl", "torso");
    const slCorner2 = around(slHold, 0.0, 0.0, 150).act("legl", "legr");
    const slCorner3 = around(slHold, 0.0, 0.0, 180).sink(0.06).act("arml", "armr");
    mv("lotta.slHoldPack", "Zaino stretto al petto, la parte bassa tra le cosce, schiena dritta", [K(g, 300, 100), K(slHold.copy().act("arml", "armr"), 350, 1100), K(g, 400, 200)]);
    mv("lotta.slTurnCorner", "Giro dell'angolo: passo indietro col piede esterno e cerchio di 180 gradi", [K(slHold, 300, 150), K(slCorner1, 320, 60), K(slCorner2, 320, 60), K(slCorner3, 300, 400), K(slHold, 700, 200)]);
    const pipe = (dx, dz) => mk({ pel: [-0.2 + dx, 0.6, 0.04 + dz], chest: [0.14 + dx, 0.88, 0.04 + dz], head: [0.3 + dx, 0.98, 0.0 + dz], yaw: -20, fl: flat(0.12 + dx, -0.28 + dz, -20, 20), fr: toes(-0.42 + dx, 0.22 + dz, -20, 50), kl: [1, 0, -0.3], kr: [0.4, -1, 0.2], hl: [0.4 + dx, 0.44, -0.06 + dz, "fist"], hr: [0.4 + dx, 0.44, 0.06 + dz, "fist"], el: [0, -0.5, -1], er: [0, -0.5, 1] }).act("torso", "legl", "legr", "arml", "armr");
    mv("lotta.runPipe", "Run the pipe: zaino verso il tappeto, spalla che spinge, tre passi in diagonale", [K(slHold, 300, 100), K(pipe(0, 0), 300, 150), K(pipe(0.12, -0.08), 200, 40), K(pipe(0.24, -0.16), 200, 40), K(pipe(0.36, -0.24), 200, 300), K(slHold, 600, 200)]);
    const trip = slHold.copy().hand("l", [0.14, 1.08, 0.1], "fist").hand("r", [0.16, 1.04, 0.2], "fist").twist(-15).act("arml", "armr");
    const tripSweep = trip.copy().footAt("r", [-0.3, 0.22, -0.18], -10, 40).knee("r", [1, 0, -0.3]).act("legr", "torso");
    mv("lotta.slTrip", "Sgambetto interno: zaino alto sul fianco, il piede interno spazza indietro", [K(slHold, 300, 100), K(trip, 280, 150), K(tripSweep, 220, 500), K(slHold, 450, 200)]);
    mv("lotta.packDown", "Appoggia lo zaino di lato piegando le gambe e torna in posizione", [K(slHold, 300, 100), K(place(sdP, -50, -0.15, 0.1).act("legl", "legr"), 420, 500), K(g, 450, 200)]);
    // mat return con lo zaino: abbraccio da dietro, anche sotto, solleva, gira e accompagna a terra
    const mrHold = up.copy().hand("l", [0.34, 1.08, -0.04], "fist").hand("r", [0.34, 1.08, 0.04], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]).foot("l", 0.02, -0.2, 10, 0).foot("r", -0.06, 0.2, -10, 0);
    const mrLow = mrHold.copy().set("pel", [-0.12, 0.7, 0]).set("chest", [0.02, 1.18, 0]).set("head", [0.06, 1.38, 0]).hand("l", [0.32, 0.98, -0.04]).hand("r", [0.32, 0.98, 0.04]).knee("l", [1, 0, -0.3]).knee("r", [1, 0, 0.3]).act("legl", "legr");
    const mrLift = place(mrHold.copy().set("pel", [0.0, 0.96, 0]).set("chest", [-0.02, 1.46, 0]).set("head", [0.0, 1.66, 0]).hand("l", [0.32, 1.24, -0.04]).hand("r", [0.32, 1.24, 0.04]).heel("l", 15).heel("r", 15), 45, 0, 0).act("legl", "legr", "torso");
    const mrTurn = place(mrHold, 90, 0, 0).act("legl", "legr");
    const mrDown = place(halfKneel().set("chest", [0.26, 0.86, 0]).set("head", [0.42, 0.97, 0]).hand("l", [0.5, 0.38, -0.04], "fist").hand("r", [0.5, 0.38, 0.04], "fist"), 90, 0, 0).act("legl", "legr", "torso");
    const mrF = [K(mrHold, 300, 200), K(mrLow, 300, 200), K(mrLift, 280, 120), K(mrTurn, 260, 80), K(mrDown, 380, 600), K(mrHold, 600, 200)];
    mv("lotta.matReturn", "Mat return: anche sotto, solleva poco, ruota di 90 gradi e accompagna a terra", mrF);
    mv("lotta.matReturnR", "Mat return ruotando dall'altra parte", mirrorFrames(mrF));
    mv("lotta.mrHold", "Zaino stretto al petto con le mani chiuse, come la vita da dietro", [K(up, 300, 100), K(mrHold.copy().act("arml", "armr"), 350, 1100), K(up, 350, 200)]);
    mv("lotta.mrLow", "Abbassa le anche finché sono sotto lo zaino, petto incollato", [K(mrHold, 300, 100), K(mrLow, 400, 1000), K(mrHold, 400, 200)]);
    mv("lotta.mrLift", "Spingi con le gambe, solleva di poco e ruota di 90 gradi", [K(mrLow, 300, 100), K(mrLift, 320, 150), K(mrTurn, 300, 600), K(mrHold, 500, 200)]);
    mv("lotta.mrDown", "Scendi in ginocchio e accompagna lo zaino a terra di lato, petto sopra", [K(mrTurn, 300, 100), K(mrDown, 450, 1000), K(mrHold, 600, 200)]);

    /* ---------------------------------------------------------------- condizionamento */
    const armsUp = up.copy().hand("l", [0.0, 1.98, -0.22], "fist").hand("r", [0.0, 1.98, 0.22], "fist").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    const hang = mk({ pel: [0, 1.06, 0], chest: [0, 1.56, 0], head: [0.02, 1.75, 0], fl: [0.03, 0.2, -0.1, 0, 40], fr: [0.03, 0.2, 0.1, 0, 40], kl: [1, 0, 0], kr: [1, 0, 0], hl: [0.0, 2.1, -0.22, "fist"], hr: [0.0, 2.1, 0.22, "fist"], el: [0, 0, -1], er: [0, 0, 1] });
    mv("lotta.hang", "Appeso alla sbarra a braccia tese, spalle attive e lontane dalle orecchie", [K(up, 300, 100), K(armsUp, 350, 150), K(hang.copy().act("arml", "armr"), 300, 1500), K(armsUp, 300, 100), K(up, 350, 200)]);
    const tHang = hang.copy().hand("l", [0.02, 2.08, -0.07], "fist").hand("r", [0.02, 2.08, 0.07], "fist").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    mv("lotta.towelHang", "Appeso agli asciugamani piegati sulla sbarra, braccia tese, presa stretta", [K(up, 300, 100), K(armsUp.copy().hand("l", [0.02, 1.96, -0.07]).hand("r", [0.02, 1.96, 0.07]), 350, 150), K(tHang.copy().act("arml", "armr"), 300, 1500), K(up, 400, 200)]);
    const pull = tHang.copy().set("pel", [0, 1.42, 0]).set("chest", [0.02, 1.9, 0]).set("head", [0.08, 2.05, 0]).footW("l", [0.05, 0.6, -0.1], 0, 40).footW("r", [0.05, 0.6, 0.1], 0, 40).elbow("l", [0.3, -1, -0.8]).elbow("r", [0.3, -1, 0.8]).act("arml", "armr");
    mv("lotta.pullUp", "Trazione agli asciugamani: da appeso, tira il petto verso le mani", [K(tHang, 300, 200), K(pull, 500, 300), K(tHang, 500, 200)]);
    const wrA = up.copy().hand("l", [0.32, 1.12, -0.03], "fist").hand("r", [0.32, 1.02, 0.03], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]);
    const wrB = up.copy().hand("l", [0.32, 1.02, -0.03], "fist").hand("r", [0.32, 1.12, 0.03], "fist").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]);
    mv("lotta.towelWring", "Strizza l'asciugamano bagnato con tutta la forza, mani che girano opposte", [K(up, 300, 100), K(wrA.copy().act("arml", "armr"), 300, 200), K(wrB.copy().act("arml", "armr"), 300, 200), K(wrA.copy().act("arml", "armr"), 300, 200), K(wrB.copy().act("arml", "armr"), 300, 200), K(up, 300, 200)]);
    const fw = (x, s) => {
      const b = up.copy().hand("l", [0, 0.9, -0.25], "fist").hand("r", [0, 0.9, 0.25], "fist").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
      if (s > 0) b.foot("l", x + 0.08, -0.1, 5, 0).foot("r", x - 0.08, 0.1, -5, 25); else b.foot("l", x - 0.08, -0.1, 5, 25).foot("r", x + 0.08, 0.1, -5, 0);
      return b.shift(x);
    };
    mv("lotta.farmerWalk", "Camminata del contadino: due pesi, passi corti, spalle basse, busto dritto", [K(fw(0, 1), 300, 50), K(fw(0.15, -1).act("legr", "arml", "armr"), 300, 40), K(fw(0.3, 1).act("legl", "arml", "armr"), 300, 40), K(fw(0.45, -1).act("legr", "arml", "armr"), 300, 40), K(fw(0.6, 1).act("legl"), 300, 150)]);
    const sw1 = (x, s) => fw(x, s).hand("l", [x + 0.05, 1.0, -0.35], "open").elbow("l", [0, -1, -0.5]);
    mv("lotta.suitcaseWalk", "Camminata con un peso solo: busto dritto, poi cambia mano", [K(sw1(0, 1), 300, 50), K(sw1(0.15, -1).act("armr", "legr"), 300, 40), K(sw1(0.3, 1).act("armr", "legl"), 300, 150), K(sw1(0.3, 1).copy().mirror(), 400, 100), K(sw1(0.45, -1).copy().mirror().act("arml", "legl"), 300, 40), K(sw1(0.6, 1).copy().mirror().act("arml", "legr"), 300, 150)]);
    const sdw = mk({ pel: [-0.17, 0.58, 0], chest: [0.15, 0.95, 0], head: [0.28, 1.1, 0], fl: flat(0, -0.2, 10), fr: flat(0, 0.2, -10), kl: [1, 0, -0.3], kr: [1, 0, 0.3], hl: [0.22, 0.42, -0.27, "fist"], hr: [0.22, 0.42, 0.27, "fist"], el: [0, 0, -1], er: [0, 0, 1] }).act("legl", "legr");
    mv("lotta.setDown", "Appoggia i pesi piegando le gambe, schiena dritta", [K(fw(0, 1), 300, 100), K(sdw, 500, 700), K(up, 450, 200)]);
    const rowA = mk({ pel: [-0.15, 0.85, 0], chest: [0.25, 1.15, 0], head: [0.42, 1.25, 0], fl: flat(0, -0.17, 8), fr: flat(0, 0.17, -8), kl: [1, 0, -0.2], kr: [1, 0, 0.2], hl: [0.32, 0.64, -0.1, "fist"], hr: [0.32, 0.64, 0.1, "fist"], el: [0, 0, -1], er: [0, 0, 1] });
    const rowB = rowA.copy().hand("l", [0.1, 0.95, -0.12]).hand("r", [0.1, 0.95, 0.12]).elbow("l", [-1, 0.6, -0.4]).elbow("r", [-1, 0.6, 0.4]).act("arml", "armr");
    mv("lotta.row", "Rematore con lo zaino: busto inclinato, schiena dritta, tira verso l'ombelico", [K(up, 300, 100), K(rowA, 400, 200), K(rowB, 400, 300), K(rowA, 400, 200), K(rowB, 400, 300), K(rowA, 400, 100), K(up, 400, 200)]);
    const pumpA = up.copy().hand("l", [0.5, 1.32, -0.14], "open").hand("r", [0.5, 1.32, 0.14], "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    mv("lotta.handPump", "Braccia avanti: apri e chiudi le mani veloce", [K(up, 250, 50), K(pumpA, 250, 60), K(pumpA.copy().fists().act("arml", "armr"), 120, 60), K(pumpA, 120, 60), K(pumpA.copy().fists().act("arml", "armr"), 120, 60), K(pumpA, 120, 60), K(pumpA.copy().fists().act("arml", "armr"), 120, 60), K(up, 250, 100)]);
    const lgT = (side) => {
      const b = L.lunge(side, 1).twist(side === "l" ? 35 : -35);
      b.handRel("l", 0.3, -0.15, -0.02, "fist").handRel("r", 0.3, -0.15, 0.02, "fist");
      return b.act("legl", "legr", "torso");
    };
    mv("lotta.lungeTwist", "Affondo con il busto che ruota verso la gamba avanti, poi l'altra gamba", [K(up, 300, 100), K(lgT("l"), 600, 400), K(up, 450, 100), K(lgT("r"), 600, 400), K(up, 450, 200)]);
    // burpee da lotta: sprawl, su, penetrazione con ginocchio a terra, su
    mv("lotta.burpee", "Burpee da lotta: sprawl, su in posizione, penetrazione con ginocchio a terra, su", [K(g, 240, 40), K(sprMid, 140, 0), K(spr, 160, 150), K(hop, 200, 30), K(g, 160, 40), K(lv, 140, 20), K(pk, 220, 120), K(su, 220, 40), K(after, 220, 150), K(g, 380, 150)]);
    mv("lotta.burpeeR", "Burpee da lotta con la penetrazione sul ginocchio destro", mirrorFrames([K(g, 240, 40), K(sprMid, 140, 0), K(spr, 160, 150), K(hop, 200, 30), K(g, 160, 40), K(lv, 140, 20), K(pk, 220, 120), K(su, 220, 40), K(after, 220, 150), K(g, 380, 150)]));
    const brOne = lbArms.copy().set("pel", [0.02, 0.4, 0]).set("chest", [-0.44, 0.22, 0]).set("head", [-0.64, 0.14, 0]).footAt("l", [0.78, 0.52, -0.1], 0, -20).knee("l", [0, 1, 0]).handW("l", -0.15, 0.04, -0.3, "open").handW("r", -0.15, 0.04, 0.3, "open").act("torso", "legr");
    mv("lotta.bridgeOneLeg", "Ponte di glutei su una gamba: l'altra distesa, peso su spalle e piede", [K(lbArms, 300, 150), K(brOne, 450, 400), K(lbArms, 400, 100), K(brOne.copy().mirror(), 450, 400), K(lbArms, 400, 200)]);

    /* ---------------------------------------------------------------- allungamenti e defaticamento */
    const nn = mk({ pel: [0, 0.13, 0], chest: [0.08, 0.63, -0.02], head: [0.12, 0.83, -0.02], yaw: 10, fl: [0.42, 0.07, 0.18, 80, 0, -80], fr: [-0.38, 0.07, 0.42, 170, 0, 80], kl: [0.4, 0.2, -0.6], kr: [0.1, 0.2, 1], hl: [0.22, 0.12, -0.22], hr: [0.08, 0.1, 0.3], el: [0, 0, -1], er: [0, 0, 1] });
    mv("lotta.ninety", "Seduto in 90/90: gamba avanti e dietro piegate a 90 gradi, busto alto", [K(sitLong(), 300, 100), K(nn.copy().act("legl", "legr", "torso"), 600, 1300), K(nn.copy().mirror().act("legl", "legr", "torso"), 700, 1300), K(sitLong(), 600, 200)]);
    const kcA = lieBack().footAt("l", [-0.02, 0.5, -0.1], 0, -20).footAt("r", [-0.02, 0.5, 0.1], 0, -20).knee("l", [-1, 1, 0]).knee("r", [-1, 1, 0]).handW("l", -0.18, 0.44, -0.13, "open").handW("r", -0.18, 0.44, 0.13, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    mv("lotta.kneesChest", "Sdraiato sulla schiena, ginocchia al petto tenute con le mani, respiro lento", [K(lieBack(), 300, 100), K(kcA.copy().act("legl", "legr"), 500, 800), K(kcA.copy().set("chest", [-0.5, 0.14, 0]).act("torso"), 1500, 400), K(kcA, 1500, 200)]);
    const kc1 = lieBack().footAt("l", [-0.02, 0.5, -0.1], 0, -20).knee("l", [-1, 1, 0]).handW("l", -0.18, 0.44, -0.13, "open").handW("r", -0.18, 0.44, -0.05, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    mv("lotta.kneeChestOne", "Sdraiato, un ginocchio al petto e l'altra gamba distesa, poi cambia", [K(lieBack(), 300, 100), K(kc1.copy().act("legl"), 500, 1300), K(lieBack(), 400, 100), K(kc1.copy().mirror().act("legr"), 500, 1300), K(lieBack(), 400, 200)]);
    const sideLie = mk({ pel: [0, 0.2, 0], chest: [0.5, 0.21, 0], head: [0.71, 0.23, 0.03], hroll: -90, croll: -90, fl: [-0.86, 0.09, 0.02, -90, 0, -90], fr: [-0.84, 0.2, 0.02, -90, 0, -90], kl: [0, 0, 1], kr: [0, 0, 1], hl: [0.92, 0.07, 0.04], hr: [0.5, 0.06, 0.3], el: [0, 0, 1], er: [0, 0.5, 1] });
    const sqd = sideLie.copy().footW("r", [0.02, 0.3, -0.18], 180, 0, -90).knee("r", [-1, 0, 0.3]).hand("r", [0.04, 0.32, -0.21]).elbow("r", [0, 0.5, -1]).act("legr", "armr");
    mv("lotta.sideQuad", "Quadricipite da sdraiato sul fianco: tallone verso il gluteo, ginocchia vicine", [K(sideLie, 400, 200), K(sqd, 500, 1500), K(sideLie, 450, 200)]);
    const lh = lieBack().footAt("r", [0.12, 0.95, 0.1], 0, -10).knee("r", [1, 0, 0]).handW("l", -0.2, 0.52, -0.02, "fist").handW("r", -0.2, 0.52, 0.08, "fist").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    mv("lotta.lyingHamstring", "Sdraiato, gamba tesa in alto tenuta con l'asciugamano dietro al piede", [K(lieBack(), 300, 100), K(lh.copy().act("legr"), 600, 1300), K(lieBack(), 450, 100), K(lh.copy().mirror().act("legl"), 600, 1300), K(lieBack(), 450, 200)]);
    const faA = up.copy().hand("l", [0.5, 1.4, -0.08], "open").elbow("l", [0, -1, 0]).hand("r", [0.48, 1.34, -0.04], "open").elbow("r", [0, -1, 0.4]).act("arml");
    const faB = up.copy().hand("l", [0.5, 1.4, -0.08], "open").elbow("l", [0, -1, 0]).hand("r", [0.47, 1.47, -0.04], "open").elbow("r", [0, -1, 0.4]).act("arml");
    mv("lotta.forearmStretch", "Avambraccio: braccio teso, l'altra mano tira piano le dita; palmo su, poi giù", [K(up, 300, 100), K(faA, 500, 1200), K(up, 400, 100), K(faB, 500, 1200), K(up, 400, 200)]);
    const frog = mk({ pel: [-0.24, 0.32, 0], chest: [0.24, 0.3, 0], head: [0.45, 0.34, 0], fl: [-0.54, 0.07, -0.44, 180, 0, 180], fr: [-0.54, 0.07, 0.44, 180, 0, 180], kl: [0.2, -1, -1], kr: [0.2, -1, 1], hl: [0.52, 0.05, -0.12], hr: [0.52, 0.05, 0.12], el: [0, -1, 0], er: [0, -1, 0] });
    mv("lotta.frog", "Rana: ginocchia larghe, avambracci a terra, anche che vanno indietro piano", [K(L.allFours(), 300, 100), K(frog.copy().act("legl", "legr"), 600, 400), K(frog.copy().set("pel", [-0.36, 0.3, 0]).act("torso"), 1200, 1000), K(L.allFours(), 600, 200)]);
    const af = L.allFours();
    const cat = af.copy().set("pel", [-0.3, 0.56, 0]).set("chest", [0.18, 0.61, 0]).set("head", [0.3, 0.46, 0]).act("torso", "head");
    const cow = af.copy().set("chest", [0.2, 0.54, 0]).set("head", [0.4, 0.72, 0]).act("torso", "head");
    mv("lotta.catCow", "Gatto e cammello: schiena che si arrotonda e si allunga, piano", [K(af, 300, 100), K(cat, 900, 300), K(cow, 1000, 300), K(cat, 1000, 300), K(af, 700, 200)]);
    const bookA = sideLie.copy().footW("l", [-0.3, 0.09, 0.42], -90, 0, -90).footW("r", [-0.3, 0.22, 0.42], -90, 0, -90).knee("l", [0.3, 0, 1]).knee("r", [0.3, 0, 1]).hand("l", [0.5, 0.07, 0.5]).hand("r", [0.5, 0.2, 0.52]).elbow("l", [0, 1, 0.5]).elbow("r", [0, 1, 0]);
    const bookB = bookA.copy().set("chestRoll", -165).hand("r", [0.5, 0.08, -0.55]).elbow("r", [0, 1, 0]).act("torso", "armr");
    mv("lotta.openBook", "Libro aperto sul fianco: ginocchia unite, il braccio sopra si apre dall'altra parte", [K(bookA, 400, 200), K(bookB, 900, 1300), K(bookA, 800, 200)]);
    const f4 = lieBack({ kneesUp: true }).footAt("r", [0.16, 0.48, 0.12], 0, -30).knee("r", [0, 1, 0.2]).footAt("l", [0.26, 0.58, 0.02], 80, 0, -70).knee("l", [0.3, 0.4, -1]).handW("l", -0.05, 0.4, 0.04, "open").handW("r", -0.05, 0.4, 0.18, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    mv("lotta.figureFour", "Figura quattro: caviglia sul ginocchio opposto, tira la coscia verso il petto", [K(lieBack({ kneesUp: true }), 300, 100), K(f4.copy().act("legl", "legr"), 600, 1300), K(lieBack({ kneesUp: true }), 450, 100), K(f4.copy().mirror().act("legl", "legr"), 600, 1300), K(lieBack({ kneesUp: true }), 450, 200)]);
    const lat = mk({ pel: [-0.1, 0.92, 0], chest: [0.38, 0.84, 0], head: [0.56, 0.8, 0], fl: flat(-0.05, -0.15, 5), fr: flat(-0.05, 0.15, -5), kl: [1, 0, 0], kr: [1, 0, 0], hl: [0.92, 0.88, -0.15], hr: [0.92, 0.88, 0.15], el: [0, -1, -0.3], er: [0, -1, 0.3] }).act("torso", "arml", "armr");
    mv("lotta.latStretch", "Dorsale: mani sullo schienale, anche indietro, petto verso il pavimento", [K(up, 300, 100), K(lat, 700, 1500), K(up, 600, 200)]);
    const door = up.copy().foot("l", 0.22, -0.12, 5, 0).shift(0.06).hand("r", [0.02, 1.7, 0.46], "open").elbow("r", [0, -1, 1]).act("armr", "torso");
    mv("lotta.doorChest", "Petto allo stipite: avambraccio a 90 gradi sullo stipite, piccolo passo avanti", [K(up, 300, 100), K(door, 600, 1300), K(up, 450, 100), K(door.copy().mirror(), 600, 1300), K(up, 450, 200)]);
    const wk = af.copy().set("pel", [-0.42, 0.42, 0]).set("chest", [0.02, 0.6, 0]).set("head", [0.2, 0.7, 0]).handW("l", 0.18, 0.04, -0.16).handW("r", 0.18, 0.04, 0.16).act("arml", "armr");
    mv("lotta.wristKneel", "Avambracci in ginocchio: palmi a terra con le dita verso di te, anche indietro", [K(af, 300, 100), K(wk, 800, 1400), K(af, 600, 200)]);
    const kd = (sgn) => lieBack({ kneesUp: true }).footAt("l", [0.38, 0.1, -0.06 + sgn * 0.12], 0, 0, sgn * 40).footAt("r", [0.38, 0.1, 0.18 + sgn * 0.12], 0, 0, sgn * 40).knee("l", [0, 0.4, sgn]).knee("r", [0, 0.4, sgn]).set("hipRoll", -sgn * 35).handW("l", -0.45, 0.05, -0.62, "open").handW("r", -0.45, 0.05, 0.62, "open").act("legl", "legr");
    mv("lotta.kneeDrops", "Sdraiato, ginocchia piegate che cadono piano a destra e a sinistra", [K(lieBack({ kneesUp: true }).handW("l", -0.45, 0.05, -0.62, "open").handW("r", -0.45, 0.05, 0.62, "open"), 300, 200), K(kd(1), 900, 600), K(kd(-1), 1200, 600), K(lieBack({ kneesUp: true }).handW("l", -0.45, 0.05, -0.62, "open").handW("r", -0.45, 0.05, 0.62, "open"), 900, 200)]);
    const lo = lieBack().handW("l", -0.4, 0.05, -0.66, "open").handW("r", -0.4, 0.05, 0.66, "open").elbow("l", [0, 1, 0]).elbow("r", [0, 1, 0]);
    mv("lotta.lieOpen", "Sdraiato a pancia in su, braccia aperte, respiro lento", [K(lo, 400, 300), K(lo.copy().set("chest", [-0.5, 0.16, 0]).act("torso"), 1600, 400), K(lo, 2000, 300)]);
    mv("lotta.breathe46", "Sdraiato: inspira in 4 secondi, espira in 6, senza apnee", [K(lieBack({ kneesUp: true }), 400, 200), K(lieBack({ kneesUp: true }).set("chest", [-0.5, 0.17, 0]).act("torso"), 2400, 200), K(lieBack({ kneesUp: true }), 3600, 300)]);
    mv("lotta.film", "Prepara lo spazio e il telefono, poi torna in posizione", [K(up, 300, 300), K(up.copy().foot("l", 0.12, -0.12, 0, 0).set("chest", [0.12, 1.42, 0]).set("head", [0.22, 1.58, 0]).hand("r", [0.42, 1.2, 0.1], "open").elbow("r", [0, -1, 0.4]).act("armr"), 400, 800), K(g, 500, 600)]);
    mv("lotta.review", "Rivedi il video e conta: riposa e respira", [K(up.copy().hand("l", [0.3, 1.18, -0.05], "open").hand("r", [0.3, 1.18, 0.05], "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]).set("head", [0.04, 1.63, 0]), 400, 1500)]);
  });
})(typeof window !== "undefined" ? window : globalThis);
