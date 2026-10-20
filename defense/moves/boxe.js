/*
 * Progetto A - Difesa: movimenti della boxe (prefisso "boxe."). Guardia ortodossa.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { mv, K, standing, box, boxStance, ankleY } = L;
    const g = box();

    mv("boxe.relaxed", "In piedi rilassato, braccia lungo i fianchi", [K(standing(), 400, 600)]);
    mv("boxe.stance", "Piedi in guardia: sinistro avanti, destro dietro a 45 gradi, tallone alzato", [K(standing(), 300, 200), K(boxStance().set("hand", { l: [0.1, 0.95, -0.24], r: [-0.12, 0.95, 0.23] }), 500, 800, ["legl", "legr"])]);
    mv("boxe.guard", "Guardia: mento giù, pugni al viso, gomiti stretti", [K(standing(), 300, 300), K(g, 600, 900, ["arml", "armr"])]);
    mv("boxe.guardHold", "Guardia ferma", [K(g, 400, 1000)]);
    mv("boxe.balance", "Prova di equilibrio: alza un attimo il piede anteriore, poi il posteriore", [K(g, 300, 200), K(g.copy().lift("l", 0.1).act("legl"), 300, 500), K(g, 300, 200), K(g.copy().lift("r", 0.1).heel("r", 0).set("foot", Object.assign({}, g.p.foot, { r: [g.p.foot.r[0], 0.18, g.p.foot.r[2]] })).act("legr"), 300, 500), K(g, 300, 200)]);

    const jab = g.copy().turn(-14).shift(0.04).lean(0.03).straight("l", "head").act("arml");
    mv("boxe.jab", "Jab (1): sinistro dritto, spalla a coprire il mento", [K(g, 300, 200), K(jab, 150, 220), K(g, 220, 300)]);
    const jabBody = g.copy().sink(0.12).turn(-14).shift(0.05).lean(0.06, 0, 0.04).straight("l", "body").act("arml", "legl", "legr");
    mv("boxe.jabBody", "Jab al corpo: piega le ginocchia e colpisci dritto al busto", [K(g, 300, 200), K(jabBody, 200, 260), K(g, 260, 300)]);
    const jabStep = g.copy().move(0.12).turn(-14).shift(0.04).lean(0.03).straight("l", [0.92, 1.5, 0]).act("arml", "legl");
    mv("boxe.jabStep", "Jab con passo avanti: il piede anteriore avanza insieme al colpo", [K(g, 300, 200), K(jabStep, 180, 220), K(g.copy().move(0.12), 240, 300)]);
    const double = [K(g, 300, 150), K(jab, 150, 60), K(g.copy().turn(-6).straight("l", "head", 0.5), 110, 0), K(jab, 120, 220), K(g, 220, 300)];
    mv("boxe.doubleJab", "Doppio jab: il secondo parte da metà ritorno", double);

    const cross = g.copy().turn(48).shift(0.07).lean(0.05).straight("r", "head").heel("r", 30).fyaw("r", -12).act("armr", "legr");
    mv("boxe.cross", "Diretto (2): destro dritto, anca e piede posteriore che ruotano", [K(g, 300, 200), K(cross, 170, 240), K(g, 240, 300)]);
    const crossBody = g.copy().sink(0.12).turn(48).shift(0.08).lean(0.07, 0, 0.04).straight("r", "body").heel("r", 30).fyaw("r", -12).act("armr", "legr", "legl");
    mv("boxe.crossBody", "Diretto al corpo: abbassati sulle gambe e colpisci con il destro", [K(g, 300, 200), K(crossBody, 220, 260), K(g, 260, 300)]);
    mv("boxe.onetwo", "Uno-due (1-2): jab e diretto", [K(g, 300, 150), K(jab, 150, 120), K(g, 140, 40), K(cross, 170, 220), K(g, 240, 300)]);

    const hook = g.copy().turn(30).shift(0.02).heel("l", 22).fyaw("l", -50).hook("l", "head").act("arml", "legl");
    mv("boxe.hook", "Gancio sinistro (3): gomito all'altezza della spalla, ruota anca e piede anteriore", [K(g, 300, 200), K(hook, 190, 240), K(g, 240, 300)]);
    const hookBody = g.copy().sink(0.14).lean(0.02, 0.04, 0.04).turn(30).heel("l", 22).fyaw("l", -50).hook("l", "body").act("arml", "legl");
    mv("boxe.hookBody", "Gancio al corpo: abbassati di lato e colpisci il fianco", [K(g, 300, 200), K(hookBody, 220, 260), K(g, 260, 300)]);
    const rhook = g.copy().turn(62).shift(0.05).heel("r", 30).fyaw("r", -10).hook("r", "head").act("armr", "legr");
    mv("boxe.rhook", "Gancio destro: ruota tutto il corpo, gomito alto", [K(g, 300, 200), K(rhook, 200, 240), K(g, 240, 300)]);
    mv("boxe.onetwothree", "Uno-due-tre: jab, diretto, gancio sinistro", [K(g, 300, 150), K(jab, 150, 100), K(g, 140, 30), K(cross, 170, 100), K(g.copy().turn(30), 160, 20), K(hook, 170, 220), K(g, 240, 300)]);

    const dipL = g.copy().sink(0.08).lean(0.02, -0.04).turn(-8);
    const upL = g.copy().sink(0.02).turn(22).upper("l", "chin").act("arml", "legl");
    mv("boxe.upper", "Montante sinistro: piega un po' le ginocchia, poi spingi verso l'alto", [K(g, 300, 150), K(dipL, 200, 80), K(upL, 180, 240), K(g, 240, 300)]);
    const dipR = g.copy().sink(0.08).lean(0.02, 0.04).turn(8);
    const upR = g.copy().sink(0.02).turn(52).shift(0.04).heel("r", 30).fyaw("r", -15).upper("r", "chin").act("armr", "legr");
    mv("boxe.rupper", "Montante destro: dal basso verso il mento, spinta della gamba posteriore", [K(g, 300, 150), K(dipR, 200, 80), K(upR, 180, 240), K(g, 240, 300)]);

    // difesa
    const slipR = g.copy().sink(0.04).lean(0.02, 0.13).turn(14);
    const slipL = g.copy().sink(0.04).lean(0.03, -0.13).turn(-14);
    mv("boxe.slip", "Schivata laterale (slip): la testa esce dalla linea con un piccolo giro del busto", [K(g, 300, 150), K(slipL.act("head", "torso"), 220, 260), K(g, 220, 150), K(slipR.act("head", "torso"), 220, 260), K(g, 220, 300)]);
    const duck = g.copy().sink(0.2).lean(0.06, 0, 0.02).act("legl", "legr", "torso");
    mv("boxe.duck", "Abbassata: piega le ginocchia, schiena dritta, occhi avanti", [K(g, 300, 200), K(duck, 260, 280), K(g, 260, 300)]);
    const rollA = g.copy().sink(0.2).lean(0.05, 0.12, 0.03).turn(12).act("legl", "legr", "torso");
    const rollB = g.copy().sink(0.2).lean(0.05, -0.12, 0.03).turn(-12).act("legl", "legr", "torso");
    mv("boxe.roll", "Rotolata a U (bob and weave): scendi da un lato, passa sotto e risali dall'altro", [K(g, 300, 150), K(rollA, 260, 60), K(rollB, 320, 100), K(g, 280, 300)]);
    const block = g.copy().handHead("l", 0.08, 0.03, -0.07).handHead("r", 0.06, 0.02, 0.07).elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]).sink(0.03).act("arml", "armr");
    mv("boxe.cover", "Copertura alta: guanti alla fronte, gomiti stretti, mento giù", [K(g, 300, 200), K(block, 200, 400), K(g, 240, 300)]);
    const parry = g.copy().handRel("r", 0.32, 0.12, -0.05).act("armr");
    mv("boxe.parry", "Parata del jab: il palmo destro devia il colpo verso il basso, corto", [K(g, 300, 200), K(parry, 150, 220), K(g, 200, 300)]);
    const shoulder = g.copy().turn(-28).lean(-0.03, 0.03).handRel("l", 0.12, -0.32, -0.05).handHead("r", 0.08, -0.04, 0.05).act("arml", "torso");
    mv("boxe.shoulderRoll", "Copertura con la spalla: spalla sinistra alta a proteggere il mento", [K(g, 300, 200), K(shoulder, 240, 300), K(g, 240, 300)]);
    const elbowBlock = g.copy().sink(0.05).turn(-10).handHead("l", 0.08, -0.1, -0.02).elbow("l", [0, -1, 0.2]).handHead("r", 0.08, -0.1, 0.05).elbow("r", [0.3, -1, 0]).act("arml", "armr");
    mv("boxe.bodyBlock", "Parata al corpo: gomiti stretti sulle costole, ruota leggermente il busto", [K(g, 300, 200), K(elbowBlock, 200, 400), K(g, 240, 300)]);

    // passi
    const fwd1 = g.copy().step("l", 0.18).shift(0.08);
    const fwd2 = g.copy().move(0.18);
    mv("boxe.stepFwd", "Passo avanti: prima il piede anteriore, poi il posteriore richiama", [K(g, 300, 200), K(fwd1.act("legl"), 220, 120), K(fwd2.act("legr"), 200, 300)]);
    const back1 = g.copy().step("r", -0.18).shift(-0.08);
    const back2 = g.copy().move(-0.18);
    mv("boxe.stepBack", "Passo indietro: prima il piede posteriore, poi l'anteriore", [K(g, 300, 200), K(back1.act("legr"), 220, 120), K(back2.act("legl"), 200, 300)]);
    const left1 = g.copy().step("l", 0, -0.18).shift(0, -0.08);
    const left2 = g.copy().move(0, -0.18);
    mv("boxe.stepLeft", "Passo a sinistra: muove prima il piede sinistro", [K(g, 300, 200), K(left1.act("legl"), 220, 120), K(left2.act("legr"), 200, 300)]);
    const right1 = g.copy().step("r", 0, 0.18).shift(0, 0.08);
    const right2 = g.copy().move(0, 0.18);
    mv("boxe.stepRight", "Passo a destra: muove prima il piede destro", [K(g, 300, 200), K(right1.act("legr"), 220, 120), K(right2.act("legl"), 200, 300)]);
    mv("boxe.box4", "Passi nelle quattro direzioni: avanti, destra, indietro, sinistra", [K(g, 300, 150), K(fwd1, 200, 60), K(fwd2, 180, 120), K(fwd2.copy().step("r", 0, 0.18).shift(0, 0.08), 200, 60), K(g.copy().move(0.18, 0.18), 180, 120), K(g.copy().move(0.18, 0.18).step("r", -0.18).shift(-0.08), 200, 60), K(g.copy().move(0, 0.18), 180, 120), K(g.copy().move(0, 0.18).step("l", 0, -0.18).shift(0, -0.08), 200, 60), K(g, 180, 300)]);
    const pivot = g.copy().turn(-60).foot("r", -0.2, -0.33, -95, 18).shift(0, -0.05).act("legr", "torso");
    mv("boxe.pivot", "Perno sul piede anteriore: il piede dietro gira di un quarto", [K(g, 300, 200), K(pivot, 360, 400), K(g, 340, 300)]);
    const bounce = g.copy().heel("l", 20).heel("r", 28).sink(-0.03);
    mv("boxe.bounce", "Saltello in guardia, sulle punte, leggero", [K(g, 200, 50), K(bounce, 170, 40), K(g, 170, 40), K(bounce, 170, 40), K(g, 170, 200)]);
    const ropeA = standing().fists().handW("l", 0.05, 1.0, -0.26).handW("r", 0.05, 1.0, 0.26).heel("l", 22).heel("r", 22);
    const ropeB = ropeA.copy().sink(-0.04).set("foot", { l: [0, ankleY(30) + 0.04, -0.11], r: [0, ankleY(30) + 0.04, 0.11] }).set("footPitch", { l: 30, r: 30 }).act("legl", "legr");
    mv("boxe.rope", "Corda: saltello sulle punte, polsi che girano", [K(ropeA, 200, 40), K(ropeB, 140, 40), K(ropeA, 140, 40), K(ropeB, 140, 40), K(ropeA, 140, 200)]);
    const shuffleA = ropeA.copy().set("foot", { l: [0.1, ankleY(25) + 0.03, -0.11], r: [-0.08, ankleY(25), 0.11] }).sink(-0.02);
    const shuffleB = ropeA.copy().set("foot", { l: [-0.08, ankleY(25), -0.11], r: [0.1, ankleY(25) + 0.03, 0.11] }).sink(-0.02);
    mv("boxe.ropeShuffle", "Corda: passo del pugile, un piede avanti e uno dietro alternati", [K(ropeA, 200, 30), K(shuffleA.act("legl", "legr"), 150, 30), K(shuffleB.act("legl", "legr"), 150, 30), K(shuffleA, 150, 30), K(shuffleB, 150, 200)]);
    mv("boxe.breath", "Espira dal naso a ogni colpo (\"ts\")", [K(g, 300, 200), K(jab.copy().act("arml", "head"), 150, 260), K(g, 220, 400)]);
  });
})(typeof window !== "undefined" ? window : globalThis);
