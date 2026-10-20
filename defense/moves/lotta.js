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
  });
})(typeof window !== "undefined" ? window : globalThis);
