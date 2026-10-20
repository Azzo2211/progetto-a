/*
 * Progetto A - Difesa: movimenti della Muay Thai (prefisso "muaythai.").
 * Guardia thai (alta, quasi frontale, peso dietro, mani alle sopracciglia), sinistro avanti.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add("muaythai", function (L) {
    const { mv, K, standing, thai, add, mul, ankleY } = L;
    const M = (name, label, frames, extra) => mv("muaythai." + name, label, frames, extra);
    const g = thai();
    const G = (t = 300, h = 200) => K(g, t, h);
    const mir = (b) => b.copy().mirror();
    const gM = mir(g); // guardia opposta (destro avanti)

    /* ---------------- posizioni e guardia */
    const relaxed = standing();
    const stanceOnly = g.copy().handW("l", 0.06, 0.92, -0.25, "open").handW("r", -0.08, 0.92, 0.25, "open").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]);
    const stanceMid = stanceOnly.copy().shift(0.05).heel("l", 0).sink(0.01);
    M("stance", "Piedi in guardia: sinistro avanti, destro dietro ruotato e con il tallone alzato", [K(relaxed, 300, 300), K(stanceMid.copy().act("legl", "legr"), 500, 700)]);
    M("weightBack", "Due terzi del peso sul piede dietro: il piede avanti appoggia leggero", [K(stanceMid, 300, 400), K(stanceOnly.copy().act("legl", "legr", "torso"), 500, 800), K(stanceMid, 400, 200)]);
    M("guard", "Guardia thai: guanti alle sopracciglia, gomiti davanti alle costole, bacino quasi frontale", [K(relaxed, 300, 300), K(stanceOnly, 400, 150), K(g.copy().act("arml", "armr"), 450, 900)]);
    M("guardHold", "Guardia thai ferma, peso dietro", [K(g, 400, 1200)]);
    const chin = g.copy().headTo(0.015, -0.025).act("head");
    M("chinDown", "Mento basso, sguardo tra i guanti", [G(300, 200), K(chin, 300, 900), G(300, 200)]);
    const ft = g.copy().heel("l", 0).lift("l", 0.1).act("legl"); // piede avanti alzato di 10 cm
    M("footTest", "Test del piede: alza il piede avanti di 10 cm senza muovere testa e busto", [G(300, 200), K(ft, 250, 500), G(250, 300)]);

    /* ---------------- rimbalzo e passi */
    const bounceDown = g.copy().sink(0.035).heel("l", 12).act("legl", "legr");
    M("bounce", "Rimbalzo thai: molleggio delle ginocchia in tempo, tallone dietro alto", [G(250, 50), K(bounceDown, 380, 80), G(380, 80), K(bounceDown, 380, 80), G(380, 200)]);
    const fwd1 = g.copy().step("l", 0.12).shift(0.05).act("legl");
    const fwd2 = g.copy().move(0.12).act("legr");
    M("stepFwd", "Passo avanti: il piede avanti avanza, quello dietro lo segue", [G(300, 150), K(fwd1, 220, 100), K(fwd2, 200, 250), G(400, 150)]);
    const bk1 = g.copy().step("r", -0.12).shift(-0.05).act("legr");
    const bk2 = g.copy().move(-0.12).act("legl");
    M("stepBack", "Passo indietro: prima il piede dietro, poi quello avanti", [G(300, 150), K(bk1, 220, 100), K(bk2, 200, 250), G(400, 150)]);
    const bk3 = g.copy().move(-0.12).step("r", -0.12).shift(-0.05).act("legr");
    const bk4 = g.copy().move(-0.24).act("legl");
    const lf1 = g.copy().step("l", 0, -0.14).shift(0, -0.06).act("legl");
    const lf2 = g.copy().move(0, -0.14).act("legr");
    const rt1 = g.copy().step("r", 0, 0.14).shift(0, 0.06).act("legr");
    const rt2 = g.copy().move(0, 0.14).act("legl");
    M("stepSide", "Passi laterali: a sinistra muove prima il sinistro, a destra prima il destro", [G(300, 100), K(lf1, 220, 60), K(lf2, 200, 200), G(300, 100), K(rt1, 220, 60), K(rt2, 200, 200), G(300, 150)]);
    const an1 = g.copy().step("l", 0.12, -0.12).fyaw("l", 35).shift(0.05, -0.05).act("legl");
    const an2 = g.copy().move(0.12, -0.12).spin(-25).act("legr", "torso");
    M("angleStep", "Passo d'angolo: piede avanti a 45 gradi in fuori, poi ruota per tornare frontale", [G(300, 150), K(an1, 240, 120), K(an2, 260, 350), G(400, 150)]);
    // passo d'angolo d'uscita (dopo una combinazione)
    M("steps4", "Rimbalzo e passi nelle quattro direzioni senza incrociare i piedi", [G(250, 60), K(bounceDown, 300, 40), K(fwd1, 200, 40), K(fwd2, 180, 100), K(fwd2.copy().step("r", 0, 0.14).shift(0, 0.06), 200, 40), K(g.copy().move(0.12, 0.14), 180, 100), K(g.copy().move(0.12, 0.14).step("r", -0.12).shift(-0.05), 200, 40), K(g.copy().move(0, 0.14), 180, 100), K(g.copy().move(0, 0.14).step("l", 0, -0.14).shift(0, -0.06), 200, 40), G(180, 250)]);
    const sideOut1 = g.copy().step("r", 0.02, 0.18).shift(0, 0.08).act("legr");
    const sideOut2 = g.copy().move(0, 0.18).spin(15).act("legl", "torso");

    /* ---------------- pugni */
    const jab = g.copy().turn(-12).shift(0.03).lean(0.02).straight("l", "head").act("arml");
    const cross = g.copy().turn(42).shift(0.04).lean(0.03).straight("r", "head").heel("r", 35).fyaw("r", -8).act("armr", "legr");
    const crossLong = g.copy().move(0.06).turn(48).shift(0.06).lean(0.05).straight("r", [0.92, 1.5, 0]).heel("r", 38).fyaw("r", -6).act("armr", "legr");
    const hookLoad = g.copy().shift(0.03).turn(8);
    const hook = g.copy().shift(0.02).turn(-22).heel("l", 24).fyaw("l", -55).act("arml", "legl");
    {
      const fr = hook.frame();
      const sh = hook.sh("l");
      hook.hand("l", add(add(sh, mul(fr.fwd, 0.37)), add(mul(fr.right, 0.22), [0, 0.02, 0])), "fist");
      hook.elbow("l", add(add(mul(fr.right, -1), [0, 0.3, 0]), mul(fr.fwd, -0.15)));
    }
    const upR = g.copy().sink(0.02).turn(40).shift(0.03).heel("r", 30).fyaw("r", -12).upper("r", "chin").act("armr", "legr");
    const upL = g.copy().sink(0.02).turn(-14).shift(0.03).upper("l", "chin").act("arml", "legl");
    const dipR = g.copy().sink(0.07).turn(10);
    const dipL = g.copy().sink(0.07).shift(0.02).turn(-6);
    const J = (s = 1) => [K(jab, 150 * s, 160 * s), K(g, 190 * s, 80 * s)];
    const C = (s = 1) => [K(cross, 170 * s, 160 * s), K(g, 210 * s, 80 * s)];
    const H = (s = 1) => [K(hookLoad, 120 * s, 20 * s), K(hook, 180 * s, 160 * s), K(g, 220 * s, 80 * s)];
    const UL = (s = 1) => [K(dipL, 160 * s, 40 * s), K(upL, 170 * s, 180 * s), K(g, 220 * s, 80 * s)];
    const UR = (s = 1) => [K(dipR, 160 * s, 40 * s), K(upR, 170 * s, 180 * s), K(g, 220 * s, 80 * s)];
    M("jab", "Jab: il guanto avanti parte dritto dalle sopracciglia e torna sulla stessa linea", [G(300, 200), ...J()]);
    M("cross", "Diretto: ruota sull'avampiede dietro, l'anca spinge, il guanto avanti resta sulla fronte", [G(300, 200), ...C()]);
    M("jabSlow", "Jab in quattro tempi: parte, arriva, torna, controlla", [G(300, 200), K(g.copy().turn(-6).straight("l", "head", 0.62).act("arml"), 300, 150), K(jab, 300, 500), K(g, 400, 500)]);
    M("crossSlow", "Diretto in quattro tempi: ruota il piede, spingi l'anca, torna e controlla", [G(300, 200), K(g.copy().turn(20).heel("r", 20).fyaw("r", -20).straight("r", "head", 0.62).act("armr", "legr"), 320, 150), K(cross, 320, 500), K(g, 420, 500)]);
    M("onetwo", "Uno-due: jab e diretto, mani che tornano subito alte", [G(300, 150), ...J(), ...C()]);
    M("onetwoTest", "Uno-due e test del piede: alza subito il piede avanti", [G(300, 150), ...J(), ...C(), K(ft, 220, 400), G(220, 200)]);
    M("hook", "Gancio corto sinistro: piede avanti che ruota, gomito alto quanto il pugno", [G(300, 200), ...H()]);
    M("upperR", "Montante dietro: piega le ginocchia, ruota l'anca e spingi il pugno in alto", [G(300, 150), ...UR()]);
    M("upperL", "Montante avanti: peso sul piede avanti, l'anca ruota e il pugno sale", [G(300, 150), ...UL()]);

    /* ---------------- teep */
    const tg = (b) => b.guard("thai");
    const teepLC = tg(g.copy().kick("l", "teep", "chamber", "body", { arms: "none" }));
    const teepLE = tg(g.copy().kick("l", "teep", "ext", "body", { arms: "none" }));
    const teepRC = g.copy().kick("r", "teep", "chamber", "body", { arms: "none" }).guard("thai");
    const teepRE = g.copy().kick("r", "teep", "ext", "body", { arms: "none" }).guard("thai");
    {
      teepRE.handRel("r", 0.02, -0.42, 0.22, "fist").elbow("r", [0, -1, 0.3]);
      teepRE.act("legr", "armr");
    }
    const TL = (s = 1) => [K(teepLC, 200 * s, 60 * s), K(teepLE, 160 * s, 200 * s), K(teepLC, 180 * s, 40 * s), K(g, 200 * s, 100 * s)];
    const TR = (s = 1) => [K(teepRC, 230 * s, 60 * s), K(teepRE, 180 * s, 220 * s), K(teepRC, 200 * s, 40 * s), K(g, 230 * s, 100 * s)];
    M("teepL", "Teep avanti: ginocchio carico, spinta d'anca, avampiede alla pancia, ritorno piegato", [G(300, 150), ...TL()]);
    M("teepR", "Teep dietro: stessa carica con la gamba dietro, il braccio dello stesso lato bilancia", [G(300, 150), ...TR()]);
    M("teepLSlow", "Teep avanti in tre tempi: carica, spinta, ritorno", [G(300, 200), K(teepLC, 400, 500), K(teepLE, 350, 600), K(teepLC, 350, 400), G(350, 200)]);
    M("teepRSlow", "Teep dietro in tre tempi: carica, spinta, ritorno", [G(300, 200), K(teepRC, 420, 500), K(teepRE, 380, 600), K(teepRC, 360, 400), G(350, 200)]);
    M("kneeHoldL", "Equilibrio: ginocchio avanti all'ombelico, punta tirata, guanti alti", [G(300, 200), K(teepLC, 400, 1600), G(350, 300)]);
    M("kneeHoldR", "Equilibrio con il ginocchio dietro alzato, poi torna in guardia", [G(300, 200), K(teepRC.copy().guard("thai").act("legr"), 450, 1600), G(380, 300)]);

    /* ---------------- ginocchiate */
    // mani sulla nuca immaginaria (davanti agli occhi) e mani che tirano giu'
    const reachNeck = (b, f = 0.4, u = 0.12) => b.handRel("l", f, u, -0.07, "open").handRel("r", f, u, 0.07, "open").elbow("l", [0.2, -1, -0.4]).elbow("r", [0.2, -1, 0.4]);
    const pullDown = (b, f = 0.36, u = -0.22, dz = 0) => b.handRel("l", f, u, -0.08 + dz, "open").handRel("r", f, u, 0.08 + dz, "open").elbow("l", [-0.2, -1, -0.6]).elbow("r", [-0.2, -1, 0.6]);
    const reach = reachNeck(g.copy().shift(0.02)).act("arml", "armr");
    const kneeRUp = pullDown(g.copy().kick("r", "knee", "ext", "mid", { arms: "none" })).act("legr", "arml", "armr");
    const KR = (s = 1) => [K(reach, 200 * s, 60 * s), K(kneeRUp, 200 * s, 200 * s), K(g, 240 * s, 80 * s)];
    M("kneeR", "Khao trong: mani sulla nuca, tira giù e ginocchio dietro avanti, anche avanti", [G(300, 150), ...KR()]);
    M("kneeRHold", "Ginocchiata dritta ferma 2 secondi nella posizione d'impatto", [G(300, 150), K(reach, 300, 200), K(kneeRUp, 350, 1700), G(350, 200)]);
    M("kneeRSlow", "Ginocchiata dritta lenta: tallone d'appoggio alto, punta del piede in basso", [G(300, 150), K(reach, 350, 350), K(kneeRUp, 450, 900), G(400, 200)]);
    const reachM = mir(reach);
    const kneeLUpM = mir(kneeRUp);
    // cambio di guardia (saltello basso): i piedi si scambiano
    const hop = g.copy().foot("l", 0.0, -0.13, 0, 25).foot("r", 0.0, 0.15, -15, 25).set("pel", [-0.02, 0.95, 0.02]).set("hipYaw", 0).set("chestYaw", 0).set("chest", [0.0, 1.44, 0.02]).set("head", [0.04, 1.64, 0.02]).guard("thai");
    hop.p.foot.l[1] += 0.04; hop.p.foot.r[1] += 0.04;
    hop.act("legl", "legr");
    const SW = (s = 1) => [K(hop, 130 * s, 20 * s), K(gM, 130 * s, 120 * s)];
    const SWB = (s = 1) => [K(mir(hop), 130 * s, 20 * s), K(g, 130 * s, 120 * s)];
    M("switch", "Cambio di guardia con un saltello basso, guanti sempre alla fronte", [G(300, 200), ...SW(), K(gM.copy().sink(0.03), 260, 60), K(gM, 260, 150), ...SWB(), G(250, 200)]);
    M("switchShort", "Cambio corto: i piedi si spostano di pochi centimetri", [G(300, 150), K(hop.copy().sink(0.03), 110, 10), K(gM.copy().act("legl", "legr"), 110, 250), K(mir(hop).sink(0.03), 110, 10), K(g.copy().act("legl", "legr"), 110, 250)]);
    M("kneeBoth", "Ginocchiata dritta destra, cambio di guardia, ginocchiata sinistra", [G(300, 100), ...KR(), ...SW(), K(reachM, 200, 60), K(kneeLUpM, 200, 200), K(gM, 240, 80), ...SWB()]);
    const kneeLUp = pullDown(g.copy().kick("l", "knee", "ext", "mid", { arms: "none" })).act("legl", "arml", "armr");
    M("kneesAlt", "Ginocchiate dritte alternate a ritmo, anche avanti a ogni colpo", [K(g, 250, 50), K(reach, 180, 40), K(kneeRUp, 180, 120), K(reach, 180, 40), K(kneeLUp, 180, 120), K(reach, 180, 40), K(kneeRUp, 180, 120), K(reach, 180, 40), K(kneeLUp, 180, 120), K(g, 250, 150)]);

    /* ---------------- calci circolari */
    const angL = (dz = -0.12, yaw = 25) => g.copy().step("l", 0.03, dz).fyaw("l", yaw).shift(0.02, dz / 2).act("legl");
    const a1 = angL();
    const kickR = (h, step = a1) => ({ c: step.copy().kick("r", "round", "chamber", h), e: step.copy().kick("r", "round", "ext", h) });
    const kMid = kickR("mid");
    const RK = (k = kMid, s = 1, st = a1) => [K(st, 150 * s, 30 * s), K(k.c, 170 * s, 30 * s), K(k.e, 170 * s, 200 * s), K(k.c, 200 * s, 40 * s), K(g, 220 * s, 100 * s)];
    M("kick", "Calcio circolare: passo d'angolo, rotazione sull'avampiede, tibia al fianco, braccio che scende", [G(300, 150), ...RK()]);
    M("kickSlow", "Calcio circolare lento: passo, ginocchio su, anca che gira sopra, ritorno", [G(300, 200), K(a1, 350, 250), K(kMid.c, 400, 300), K(kMid.e, 400, 800), K(kMid.c, 400, 200), G(400, 200)]);
    const kLow = kickR("low", angL(-0.17, 32));
    kLow.e.lean(0.06);
    const LK = (s = 1) => RK(kLow, s, angL(-0.17, 32));
    M("lowKick", "Calcio basso: passo d'angolo largo, la tibia scende in diagonale sulla coscia", [G(300, 150), ...LK()]);
    const kBody = kickR(1.15, angL(-0.13, 30));
    kBody.e.heel("l", 34);
    const kBodyLow = a1.copy().kick("r", "round", "chamber", "mid");
    kBodyLow.p.foot.r = add(kBodyLow.p.foot.r, [0, -0.12, 0]);
    const BK = (s = 1) => [K(angL(-0.13, 30), 150 * s, 30 * s), K(kBodyLow, 170 * s, 20 * s), K(kBody.e, 170 * s, 200 * s), K(kBody.c, 200 * s, 40 * s), K(g, 220 * s, 100 * s)];
    M("bodyKick", "Te chiang: sali sulla punta, la tibia sale in diagonale sotto il gomito", [G(300, 150), ...BK()]);
    const kHigh = kickR(1.48, angL(-0.15, 35));
    kHigh.e.lean(-0.07, 0.03).heel("l", 34);
    {
      const fr = kHigh.e.frame();
      kHigh.e.handHead("l", 0.13, -0.1, 0.02, "fist").elbow("l", add(mul(fr.up, -1), mul(fr.right, -0.4)));
    }
    const HK = (s = 1) => [K(angL(-0.15, 35), 150 * s, 30 * s), K(kHigh.c, 170 * s, 20 * s), K(kHigh.e, 180 * s, 220 * s), K(kHigh.c, 200 * s, 40 * s), K(g, 230 * s, 100 * s)];
    M("highKick", "Calcio alto: rotazione completa, busto indietro, guanto opposto incollato al mento", [G(300, 150), ...HK()]);
    M("bodyKickSlow", "Calcio al corpo lento, fermo un attimo in alto", [G(300, 200), K(angL(-0.13, 30), 350, 200), K(kBodyLow, 400, 200), K(kBody.e, 450, 900), K(kBody.c, 400, 200), G(400, 200)]);
    M("highKickSlow", "Calcio alto lento: sali piano fino a dove arrivi, poi torna", [G(300, 200), K(angL(-0.15, 35), 350, 200), K(kHigh.c, 400, 200), K(kHigh.e, 600, 900), K(kHigh.c, 450, 200), G(400, 200)]);
    // calcio basso interno con la gamba avanti
    const inStep = g.copy().step("r", 0, 0.07).shift(0, 0.03).act("legr");
    const inLow = inStep.copy().set("pel", [-0.17, 0.9, 0.17]).set("hipYaw", -45).set("chestYaw", -32).set("chest", [-0.2, 1.39, 0.17]).set("head", [-0.17, 1.59, 0.16]);
    inLow.foot("r", -0.22, 0.23, -60, 18).footW("l", [0.34, 0.42, 0.06], -80, 10, -70).knee("l", [0.5, 0.4, -0.8]).guard("thai").act("legl");
    const ILK = (s = 1) => [K(inStep, 150 * s, 30 * s), K(inLow, 160 * s, 180 * s), K(g, 200 * s, 100 * s)];
    M("insideLow", "Calcio basso interno: il piede dietro si sposta in fuori, la gamba avanti colpisce corta", [G(300, 150), ...ILK()]);
    // check
    const checkL = g.copy().kick("l", "check", "ext", "mid", { arms: "none" }).guard("thai");
    {
      const fr = checkL.frame();
      checkL.handHead("l", 0.2, -0.08, -0.08, "fist").elbow("l", add(mul(fr.up, -1), mul(fr.right, -0.15)));
      checkL.act("legl", "arml");
    }
    const checkR = g.copy().kick("r", "check", "ext", "mid", { arms: "none" }).guard("thai");
    {
      const fr = checkR.frame();
      checkR.handHead("r", 0.18, -0.08, 0.08, "fist").elbow("r", add(mul(fr.up, -1), mul(fr.right, 0.15)));
      checkR.act("legr", "armr");
    }
    const CKL = (s = 1) => [K(checkL, 150 * s, 250 * s), K(g, 180 * s, 100 * s)];
    const CKR = (s = 1) => [K(checkR, 170 * s, 250 * s), K(g, 200 * s, 100 * s)];
    M("checkL", "Check avanti: ginocchio su e in fuori, gomito che scende verso il ginocchio", [G(300, 150), ...CKL()]);
    M("checkR", "Check con la gamba dietro, per i calci dall'altro lato", [G(300, 150), ...CKR()]);
    M("checkSlow", "Check tenuto: tibia inclinata, punta in fuori, busto dritto", [G(300, 200), K(checkL, 300, 1000), G(300, 300), K(checkR, 320, 1000), G(320, 200)]);
    // switch kick
    const swShort = g.copy().foot("l", -0.04, -0.12, 0, 15).foot("r", 0.04, 0.15, -25, 10).set("pel", [-0.0, 0.92, 0.03]).set("hipYaw", 5).set("chestYaw", 5).set("chest", [0.02, 1.41, 0.03]).set("head", [0.05, 1.61, 0.02]).guard("thai").act("legl", "legr");
    const swC = swShort.copy().kick("l", "round", "chamber", "mid");
    const swE = swShort.copy().kick("l", "round", "ext", 1.05);
    const SK = (s = 1) => [K(swShort, 140 * s, 30 * s), K(swC, 160 * s, 20 * s), K(swE, 170 * s, 200 * s), K(swC, 200 * s, 40 * s), K(g, 230 * s, 100 * s)];
    M("switchKick", "Switch kick: cambio corto e calcio sinistro al fianco, braccio che scende", [G(300, 150), ...SK()]);
    M("switchKickSlow", "Switch kick in due tempi: cambio, poi calcio", [G(300, 200), K(swShort, 250, 500), K(swC, 300, 100), K(swE, 300, 500), K(swC, 300, 100), G(350, 200)]);
    // calcio con la gamba sinistra dalla guardia opposta (per i cambi di guardia)
    const kMidM = { c: mir(kMid.c), e: mir(kMid.e) };
    const RKM = (s = 1) => [K(mir(a1), 150 * s, 30 * s), K(kMidM.c, 170 * s, 30 * s), K(kMidM.e, 170 * s, 200 * s), K(kMidM.c, 200 * s, 40 * s), K(gM, 220 * s, 100 * s)];
    M("kickBoth", "Calcio destro, ritorno, cambio di guardia, calcio sinistro", [G(300, 100), ...RK(kMid, 0.9), ...SW(), ...RKM(0.9), ...SWB()]);
    const kBodyM = { c: mir(kBody.c), e: mir(kBody.e), low: mir(kBodyLow), st: mir(angL(-0.13, 30)) };
    M("bodyKickBoth", "Calcio al corpo destro, cambio di guardia, calcio al corpo sinistro", [G(300, 100), ...BK(0.9), ...SW(), K(kBodyM.st, 140, 30), K(kBodyM.low, 160, 20), K(kBodyM.e, 160, 200), K(kBodyM.c, 190, 40), K(gM, 210, 100), ...SWB()]);

    /* ---------------- esercizi al muro */
    const wallFront = (b, x = 0.46) => b.handW("l", x, 1.38, -0.2, "open").handW("r", x, 1.38, 0.2, "open").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]);
    const wf0 = wallFront(g.copy());
    const pivot1 = wallFront(g.copy().fyaw("l", 95).heel("l", 28).hips(40).twist(25).heel("r", 30).shift(0.03, 0.01)).act("legl", "legr");
    const pivot2 = wallFront(g.copy().kick("r", "round", "chamber", "mid", { arms: "none" })).act("legl", "legr");
    M("pivotWall", "Mani al muro: ruota sull'avampiede avanti, tallone verso il muro, anca dietro su", [K(wf0, 300, 300), K(pivot1, 500, 600), K(wf0, 450, 300)]);
    M("pivotWallKnee", "Mani al muro: rotazione sull'avampiede e ginocchio dietro di lato, coscia orizzontale", [K(wf0, 300, 300), K(pivot1, 400, 150), K(pivot2, 400, 700), K(wf0, 450, 300)]);
    const wallL = (b, y = 1.36) => b.handW("l", 0.14, y, -0.52, "open").elbow("l", [0, -1, -0.2]);
    const tw0 = wallL(g.copy());
    const tw1 = wallL(g.copy().fyaw("l", 100).heel("l", 25).hips(25)).act("legl");
    const tw2 = wallL(g.copy().kick("r", "round", "chamber", "mid")).act("legr");
    const tw3 = wallL(g.copy().kick("r", "round", "ext", "mid")).act("legr");
    M("kickWall", "Calcio al muro in quattro tempi: rotazione, ginocchio su, anca sopra e tibia orizzontale, ritorno", [K(tw0, 300, 300), K(tw1, 400, 500), K(tw2, 400, 500), K(tw3, 450, 1600), K(tw2, 400, 300), K(tw0, 400, 300)]);
    M("kickWallSmooth", "Calcio al muro in un unico gesto lento", [K(tw0, 300, 200), K(tw2, 500, 50), K(tw3, 450, 500), K(tw2, 450, 50), K(tw0, 450, 300)]);
    const twH = wallL(g.copy().kick("r", "round", "ext", 1.42).lean(-0.06, 0.03), 1.3).act("legr");
    M("highKickWall", "Calcio alto lento al muro: ruota, gira l'anca, distendi in alto e tieni 3 secondi", [K(tw0, 300, 200), K(tw1, 400, 300), K(tw2, 450, 300), K(twH, 700, 2000), K(tw2, 500, 200), K(tw0, 450, 300)]);
    const twB = wallL(g.copy().kick("r", "round", "ext", 1.12).heel("l", 32)).act("legr");
    M("bodyKickWall", "Calcio al corpo lento con la mano al muro, fermo 2 secondi in alto", [K(tw0, 300, 200), K(tw2, 450, 200), K(twB, 500, 1500), K(tw2, 450, 200), K(tw0, 450, 300)]);
    // ginocchiata diagonale (gamba destra): ginocchio largo, poi chiude in diagonale
    function kneeDiag(base, phase) {
      const b = base.copy().kick("r", "knee", "ext", "mid", { arms: "none" });
      if (phase === "wide") {
        b.set("hipYaw", -8).set("chestYaw", -8).heel("l", 15);
        b.footW("r", add(b.hip("r"), [-0.14, -0.22, 0.34]), 70, 40, 0).knee("r", [0.3, 0.6, 1]);
      } else {
        b.set("hipYaw", 32).set("chestYaw", 18).fyaw("l", 30);
        b.footW("r", add(b.hip("r"), [-0.04, -0.3, 0.24]), 40, 65, 0).knee("r", [1, 0.9, -0.8]);
      }
      return b;
    }
    const hd0 = wallFront(g.copy());
    const hdWide = wallFront(kneeDiag(g, "wide")).act("legr");
    const hdClose = wallFront(kneeDiag(g, "close")).act("legr", "legl");
    M("hipOpenWall", "Mani al muro: ginocchio dietro largo, poi chiude in diagonale verso il centro", [K(hd0, 300, 200), K(hdWide, 500, 400), K(hdClose, 500, 600), K(hdWide, 450, 200), K(hd0, 450, 300)]);
    const hipGate = (ph) => {
      const b = standing().handW("l", 0.1, 1.3, -0.55, "open").elbow("l", [0, -1, -0.2]).handW("r", 0.05, 0.95, 0.3, "open");
      if (ph === 1) b.footAt("r", [0.3, 0.55, 0.12], 0, 40).knee("r", [1, 0.6, 0]);
      if (ph === 2) b.footAt("r", [-0.05, 0.62, 0.38], 80, 40, 0).knee("r", [0.3, 0.6, 1]).hips(-12);
      if (ph === 3) b.footAt("r", [-0.2, 0.3, 0.16], 0, 30).knee("r", [0.8, -0.2, 0.4]);
      return b.act("legr");
    };
    M("hipGate", "Cancello al muro: ginocchio su davanti, poi fuori di lato, poi giù, e al contrario", [K(hipGate(0), 300, 150), K(hipGate(1), 450, 150), K(hipGate(2), 450, 150), K(hipGate(3), 400, 150), K(hipGate(0), 350, 100), K(hipGate(3), 350, 100), K(hipGate(2), 400, 150), K(hipGate(1), 450, 150), K(hipGate(0), 400, 200)]);
    const ptStand = standing().foot("l", 0.05, -0.15, 8, 0).foot("r", -0.05, 0.15, -8, 0).handW("l", 0.0, 0.95, -0.3, "open").handW("r", 0.0, 0.95, 0.3, "open");
    M("footPivots", "Rotazioni sull'avampiede: tallone in fuori e in dentro, ginocchio morbido", [K(ptStand, 300, 150), K(ptStand.copy().fyaw("l", 90).heel("l", 25).hips(25).act("legl"), 400, 200), K(ptStand, 350, 100), K(ptStand.copy().fyaw("r", -90).heel("r", 25).hips(-25).act("legr"), 400, 200), K(ptStand, 350, 200)]);

    /* ---------------- ginocchiata diagonale */
    const kcStep = reachNeck(g.copy().step("l", 0.06, -0.12).fyaw("l", 30).shift(0.03, -0.05)).act("legl", "arml", "armr");
    const kcWide = reachNeck(kneeDiag(kcStep, "wide")).act("legr");
    const kcHit = pullDown(kneeDiag(kcStep, "close"), 0.3, -0.22, 0.1).act("legr", "arml", "armr");
    const KC = (s = 1) => [K(kcStep, 170 * s, 40 * s), K(kcWide, 170 * s, 30 * s), K(kcHit, 170 * s, 200 * s), K(g, 240 * s, 100 * s)];
    M("kneeDiag", "Khao chiang: passo a 45 gradi, ginocchio largo che chiude in diagonale alle costole", [G(300, 150), ...KC()]);
    M("kneeDiagSlow", "Khao chiang lenta: mani sulla nuca, tallone alto, anca avanti", [G(300, 150), K(kcStep, 350, 250), K(kcWide, 350, 250), K(kcHit, 350, 900), G(400, 200)]);
    M("kneeStraightDiag", "Khao trong e khao chiang alternate: dritta e poi diagonale", [G(300, 100), ...KR(), ...KC()]);
    const kcM = { st: mir(kcStep), w: mir(kcWide), h: mir(kcHit) };
    const KCM = (s = 1) => [K(kcM.st, 170 * s, 40 * s), K(kcM.w, 170 * s, 30 * s), K(kcM.h, 170 * s, 200 * s), K(gM, 240 * s, 100 * s)];
    M("kneeDiagBoth", "Khao chiang dalla tua guardia, cambio, khao chiang dalla guardia opposta", [G(300, 100), ...KC(), ...SW(), ...KCM(), ...SWB()]);

    /* ---------------- gomitate */
    const turnL = (b, d = -24) => b.turn(d).heel("l", 24).fyaw("l", -55);
    const turnR = (b, d = 48) => b.turn(d).shift(0.03).heel("r", 32).fyaw("r", -8);
    const stLc = g.copy().handHead("l", -0.03, -0.03, -0.14, "open").elbow("l", [0.2, 0.3, -1]).act("arml");
    const stL = turnL(g.copy().shift(0.02)).elbowStrike("l", "horizontal").grip("l", "open").act("arml", "legl");
    const stRc = g.copy().handHead("r", -0.03, -0.03, 0.14, "open").elbow("r", [0.2, 0.3, 1]).act("armr");
    const stR = turnR(g.copy()).elbowStrike("r", "horizontal").grip("r", "open").act("armr", "legr");
    const elDip = (b, d) => b.sink(0.08).turn(d);
    const snR = turnR(g.copy().sink(-0.01), 40).elbowStrike("r", "up").grip("r", "open").act("armr", "legr", "legl");
    const snL = g.copy().sink(-0.01).turn(-14).heel("l", 15).elbowStrike("l", "up").grip("l", "open").act("arml", "legl", "legr");
    const tiRc = g.copy().turn(12).sink(-0.02).handHead("r", -0.05, 0.05, 0.1, "open").elbow("r", [0.3, 1, 0.3]).act("armr");
    const tiR = turnR(g.copy().sink(0.07), 42).handHead("r", 0.1, -0.2, -0.03, "open").elbow("r", [1, -0.6, 0.1]).act("armr", "legr", "legl");
    const tiLc = g.copy().turn(-8).sink(-0.02).handHead("l", -0.05, 0.05, -0.1, "open").elbow("l", [0.3, 1, -0.3]).act("arml");
    const tiL = g.copy().sink(0.07).turn(-18).heel("l", 15).handHead("l", 0.1, -0.2, 0.03, "open").elbow("l", [1, -0.6, -0.1]).act("arml", "legl", "legr");
    const wkLc = g.copy().turn(-18).handRel("l", 0.2, 0.02, 0.15, "open").elbow("l", [1, -0.1, 0.4]).act("arml");
    const wkL = g.copy().turn(16).handRel("l", 0.12, 0.08, 0.05, "open").elbow("l", [0.4, 0.25, -1]).act("arml");
    const wkRc = g.copy().turn(30).handRel("r", 0.2, 0.02, -0.15, "open").elbow("r", [1, -0.1, -0.4]).act("armr");
    const wkR = g.copy().turn(-20).handRel("r", 0.12, 0.08, -0.05, "open").elbow("r", [0.4, 0.25, 1]).act("armr");
    const STL = (s = 1) => [K(stLc, 150 * s, 30 * s), K(stL, 160 * s, 200 * s), K(g, 220 * s, 80 * s)];
    const STR = (s = 1) => [K(stRc, 150 * s, 30 * s), K(stR, 170 * s, 200 * s), K(g, 230 * s, 80 * s)];
    const SNR = (s = 1) => [K(elDip(g.copy(), 8), 160 * s, 30 * s), K(snR, 170 * s, 200 * s), K(g, 230 * s, 80 * s)];
    const SNL = (s = 1) => [K(elDip(g.copy(), -6), 160 * s, 30 * s), K(snL, 170 * s, 200 * s), K(g, 230 * s, 80 * s)];
    const TIR = (s = 1) => [K(tiRc, 180 * s, 60 * s), K(tiR, 170 * s, 200 * s), K(g, 240 * s, 80 * s)];
    const TIL = (s = 1) => [K(tiLc, 180 * s, 60 * s), K(tiL, 170 * s, 200 * s), K(g, 240 * s, 80 * s)];
    const WKL = (s = 1) => [K(wkLc, 170 * s, 40 * s), K(wkL, 170 * s, 200 * s), K(g, 230 * s, 80 * s)];
    const WKR = (s = 1) => [K(wkRc, 170 * s, 40 * s), K(wkR, 170 * s, 200 * s), K(g, 230 * s, 80 * s)];
    M("elbowL", "Sok tat avanti: gomito alto, mano aperta all'orecchio, taglia orizzontale ruotando", [G(300, 150), ...STL()]);
    M("elbowR", "Sok tat dietro: ruota sull'avampiede dietro come nel diretto, gomito orizzontale", [G(300, 150), ...STR()]);
    M("elbowUpR", "Sok ngat: le ginocchia si distendono e il gomito sale verticale verso il mento", [G(300, 150), ...SNR()]);
    M("elbowDownR", "Sok ti: gomito dietro sopra la testa, scende in diagonale piegando le ginocchia", [G(300, 150), ...TIR()]);
    M("elbowBackL", "Sok wiang klap: braccio avanti davanti al petto, il gomito va di rovescio verso l'esterno", [G(300, 150), ...WKL()]);
    M("elbowsSlow", "Sok tat in tre tempi: carica, taglio, ritorno in guardia", [G(300, 200), K(stLc, 400, 400), K(stL, 400, 600), G(400, 300), K(stRc, 400, 400), K(stR, 400, 600), G(400, 200)]);
    M("elbowsUpSlow", "Sok ngat lenta: scendi sulle gambe, poi spingi e il gomito sale", [G(300, 200), K(elDip(g.copy(), 8), 400, 400), K(snR, 450, 700), G(400, 300)]);
    M("elbowsDownSlow", "Sok ti e sok wiang klap lente: traiettoria prima della forza", [G(300, 150), K(tiRc, 400, 300), K(tiR, 400, 500), G(400, 250), K(wkLc, 400, 300), K(wkL, 400, 500), G(400, 200)]);
    M("elbowTatBack", "Sok tat avanti e, se manca, ritorno di sok wiang klap con lo stesso braccio", [G(300, 150), K(stLc, 150, 30), K(stL, 160, 120), K(wkLc.copy().turn(-6), 150, 30), K(wkL, 170, 200), G(230, 150)]);
    M("elbows4L", "Braccio avanti: sok tat, sok ngat, sok ti, sok wiang klap", [G(300, 100), ...STL(), ...SNL(), ...TIL(), ...WKL()]);
    M("elbows4R", "Braccio dietro: sok tat, sok ngat, sok ti, sok wiang klap", [G(300, 100), ...STR(), ...SNR(), ...TIR(), ...WKR()]);
    M("upperElbow", "Montante avanti e subito sok ngat con il braccio dietro", [G(300, 150), ...UL(0.9), ...SNR(0.9)]);

    /* ---------------- difese */
    const coverHigh = g.copy().sink(0.03).handHead("l", 0.05, 0.1, -0.07, "fist").handHead("r", 0.05, 0.1, 0.07, "fist").elbow("l", [1, -0.4, 0.15]).elbow("r", [1, -0.4, -0.15]).act("arml", "armr");
    const coverR = g.copy().turn(-12).sink(0.02).handHead("r", -0.05, 0.09, 0.07, "fist").elbow("r", [1, 0.1, 0.5]).act("armr");
    const coverL = g.copy().turn(14).sink(0.02).handHead("l", -0.05, 0.09, -0.07, "fist").elbow("l", [1, 0.1, -0.5]).act("arml");
    const parry = g.copy().turn(-6).handRel("r", 0.34, 0.1, -0.13, "open").act("armr");
    const COV = (s = 1, hold = 300) => [K(coverHigh, 150 * s, hold * s), K(g, 180 * s, 60 * s)];
    const PAR = (s = 1) => [K(parry, 120 * s, 150 * s), K(g, 150 * s, 60 * s)];
    M("coverHigh", "Copertura alta: guanti in testa, avambracci davanti alle tempie, gomiti vicini", [G(300, 200), K(coverHigh, 250, 900), G(300, 200)]);
    M("coverSide", "Copertura laterale: guanto dietro la testa, l'avambraccio copre la tempia", [G(300, 150), K(coverR, 220, 600), G(250, 150), K(coverL, 220, 600), G(250, 200)]);
    M("parry", "Parry: il palmo del guanto dietro devia il jab verso l'interno, corto", [G(300, 200), ...PAR(), K(parry, 120, 150), G(150, 300)]);
    M("coversAnswer", "Copertura alta, destra, sinistra e parry, ognuna con una risposta", [G(300, 100), ...COV(1, 200), K(stRc, 120, 20), K(stR, 150, 120), G(200, 80), K(coverR, 160, 200), ...C(0.9), K(coverL, 160, 200), K(stLc, 120, 20), K(stL, 150, 120), G(200, 80), ...PAR(), ...C(0.9)]);
    M("coverElbow", "Copertura alta e subito sok tat di risposta", [G(300, 150), ...COV(), ...STR()]);
    M("parryCross", "Parry sul jab e subito diretto", [G(300, 150), ...PAR(), ...C()]);
    // lean back
    const leanBack = g.copy().shift(-0.14).lean(-0.16).heel("l", 26).heel("r", 14);
    leanBack.handHead("l", 0.32, -0.04, -0.04, "fist").handHead("r", 0.13, -0.13, 0.04, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]).act("torso", "head");
    const LB = (s = 1) => [K(leanBack, 200 * s, 300 * s)];
    M("leanBack", "Lean back: tutto il peso dietro, busto indietro, occhi avanti, guanto avanti a scudo", [G(300, 200), ...LB(), G(260, 300)]);
    M("leanBackKick", "Lean back e ritorno con il calcio al corpo della gamba dietro", [G(300, 150), ...LB(), K(kBodyLow, 220, 20), K(kBody.e, 170, 200), K(kBody.c, 200, 40), G(230, 200)]);
    M("leanBackTeep", "Lean back e subito teep avanti", [G(300, 150), ...LB(), K(teepLC, 200, 40), K(teepLE, 160, 200), K(teepLC, 180, 40), G(200, 200)]);
    M("leanBackCross", "Lean back e subito diretto", [G(300, 150), ...LB(), K(g, 180, 20), ...C()]);
    // finte di teep
    const feintDownOut = a1.copy();
    const feintDownFwd = g.copy().step("l", 0.1).shift(0.04).act("legl");
    const crossFromFwd = g.copy().move(0.1).turn(48).shift(0.05).lean(0.04).straight("r", [1.0, 1.5, 0]).heel("r", 38).fyaw("r", -6).act("armr", "legr");
    M("feint", "Finta di teep: il ginocchio sale come nel teep vero, si ferma e il piede riappoggia in fuori", [G(300, 150), K(teepLC, 180, 150), K(feintDownOut, 200, 300), G(300, 200)]);
    M("feintKick", "Finta di teep e calcio dietro al corpo: il passo della finta diventa il passo d'angolo", [G(300, 150), K(teepLC, 180, 120), K(feintDownOut, 180, 20), K(kBodyLow, 170, 20), K(kBody.e, 170, 200), K(kBody.c, 200, 40), G(230, 200)]);
    M("feintCross", "Finta di teep, piede avanti più avanti e diretto lungo", [G(300, 150), K(teepLC, 180, 120), K(feintDownFwd, 180, 20), K(crossFromFwd, 170, 220), G(280, 200)]);
    M("feintTeep", "Finta di teep, piede a terra e subito teep vero più profondo", [G(300, 150), K(teepLC, 180, 120), K(g, 160, 40), K(teepLC, 160, 30), K(teepLE.copy().shift(0.04).lean(-0.03), 160, 220), K(teepLC, 180, 40), G(200, 200)]);

    /* ---------------- combinazioni */
    const BNC = (s = 1) => [K(bounceDown, 230 * s, 40 * s), K(g, 230 * s, 40 * s), K(bounceDown, 230 * s, 40 * s), K(g, 230 * s, 100 * s)];
    const ANG = (s = 1) => [K(an1, 200 * s, 60 * s), K(an2, 220 * s, 300 * s), K(g, 380 * s, 150 * s)];
    const BACK2 = (s = 1) => [K(bk1, 200 * s, 50 * s), K(bk2, 180 * s, 60 * s), K(bk3, 200 * s, 50 * s), K(bk4, 180 * s, 250 * s), K(g, 400 * s, 150 * s)];
    const SIDEOUT = (s = 1) => [K(sideOut1, 200 * s, 60 * s), K(sideOut2, 220 * s, 300 * s), K(g, 380 * s, 150 * s)];
    const FEINT = (s = 1) => [K(teepLC, 180 * s, 120 * s), K(feintDownOut, 180 * s, 20 * s)];
    const RKfrom = (st, k = kMid, s = 1) => [K(st, 150 * s, 20 * s), K(k.c, 170 * s, 20 * s), K(k.e, 170 * s, 200 * s), K(k.c, 200 * s, 40 * s), K(g, 220 * s, 100 * s)];
    const CK_FWD = (s = 1) => [K(checkL, 150 * s, 200 * s), K(feintDownFwd, 160 * s, 20 * s), K(crossFromFwd, 170 * s, 200 * s), K(g, 280 * s, 100 * s)];
    const CK_OUT = (s = 1) => [K(checkL, 150 * s, 200 * s), ...RKfrom(a1, kMid, s)];
    const CK_TEEP = (s = 1) => [K(checkL, 150 * s, 200 * s), K(teepLE, 160 * s, 200 * s), K(teepLC, 180 * s, 40 * s), K(g, 200 * s, 100 * s)];
    const CO = (name, label, ...segs) => M(name, label, [G(300, 150), ...[].concat(...segs)]);
    CO("jabTeep", "Jab e, mentre torna, teep avanti alla pancia, poi 2 rimbalzi", J(), TL(), BNC());
    CO("teepJab", "Teep avanti e subito jab, per colpire chi rientra", TL(), J());
    CO("onetwoTeep", "Jab, diretto, teep avanti", J(), C(), TL());
    CO("teepROnetwo", "Teep dietro, jab, diretto", TR(), J(), C());
    CO("jabKnee", "Jab e ginocchiata dritta dietro con le mani che tirano giù", J(), KR());
    CO("onetwoBack", "Uno-due e uscita con due passi indietro", J(), C(), BACK2());
    CO("onetwoAngle", "Uno-due e uscita con un passo d'angolo", J(), C(), ANG());
    CO("jabKick", "Jab e calcio dietro: il passo d'angolo arriva mentre il jab torna", [K(jab, 150, 140)], RKfrom(a1));
    CO("onetwoKick", "Jab, diretto e calcio dietro: il ritorno veloce del diretto carica il calcio", J(), [K(cross, 170, 140)], RKfrom(a1));
    CO("onetwoHookKick", "Jab, diretto, gancio e calcio dietro che parte dall'anca già girata", J(), C(), [K(hookLoad, 120, 20), K(hook, 180, 140)], RKfrom(a1));
    CO("hookKick", "Gancio e subito calcio dietro: il gancio ha già girato l'anca", [K(hookLoad, 120, 20), K(hook, 180, 140)], RKfrom(a1));
    CO("teepKick", "Teep avanti, piede che riappoggia in fuori, calcio dietro", [K(teepLC, 200, 60), K(teepLE, 160, 200), K(teepLC, 180, 40)], RKfrom(a1));
    CO("kickCheckTeep", "Calcio dietro, ritorno, check avanti, teep e 2 rimbalzi", RK(), CKL(), TL(), BNC());
    CO("onetwoElbow", "Jab, diretto e sok tat con il braccio avanti", J(), C(), STL());
    CO("jabHookElbow", "Jab, gancio e sok tat con il braccio dietro", J(), H(), STR());
    CO("crossUpperElbow", "Diretto, montante avanti e sok ngat con il braccio dietro", C(), UL(), SNR());
    CO("onetwoKneeOut", "Jab, diretto, khao chiang dietro e uscita d'angolo", J(), C(), KC(), ANG());
    CO("checkKick", "Check sul calcio e risposta con il calcio dietro", CK_OUT());
    CO("teepOnetwo", "Teep d'arresto e subito uno-due", TL(), J(), C());
    CO("checkCross", "Check, piede che riappoggia più avanti e diretto", CK_FWD());
    CO("checkTeep", "Check e teep con la stessa gamba senza toccare terra", CK_TEEP());
    CO("checkAnswers", "Check e le tre risposte: diretto, calcio dietro, teep", CK_FWD(), CK_OUT(), CK_TEEP());
    CO("jabSwitchKick", "Jab e switch kick", J(), SK());
    CO("comboLow", "Jab, diretto, gancio, calcio basso dietro", J(), C(), [K(hookLoad, 120, 20), K(hook, 180, 140)], RKfrom(angL(-0.17, 32), kLow));
    CO("comboTeepElbow", "Teep, jab, diretto, khao trong, sok tat", TL(0.9), J(0.9), C(0.9), KR(0.9), STL(0.9));
    CO("comboFeintBody", "Finta di teep, diretto, gancio, calcio al corpo", [K(teepLC, 180, 120), K(feintDownFwd, 160, 20), K(crossFromFwd, 170, 120), K(g.copy().move(0.1).turn(8), 140, 20), K(hook.copy().move(0.1), 170, 120), K(g.copy().move(0.1), 200, 40)], BK());
    CO("comboSwitchKnee", "Jab, diretto, switch kick, khao chiang, uscita d'angolo", J(0.9), C(0.9), SK(0.9), KC(0.9), ANG(0.9));
    CO("comboHigh", "Calcio basso interno, jab, diretto, gancio, calcio alto dietro", ILK(), J(0.9), C(0.9), [K(hookLoad, 110, 20), K(hook, 170, 120)], RKfrom(angL(-0.15, 35), kHigh));
    CO("counters", "Parry e diretto, check e calcio, lean back e calcio, teep e uno-due", PAR(), C(), CK_OUT(), LB(), [K(kBodyLow, 220, 20), K(kBody.e, 170, 200), K(kBody.c, 200, 40), K(g, 230, 100)], TL(), J(), C());
    CO("femurTeep", "Teep, l'avversario rientra, passo d'angolo e calcio al corpo", TL(), RKfrom(angL(-0.13, 30), { c: kBodyLow, e: kBody.e }));
    CO("femurLean", "Lean back sul calcio alto, calcio al corpo e uscita d'angolo", LB(), [K(kBodyLow, 220, 20), K(kBody.e, 170, 200), K(kBody.c, 200, 40), K(g, 230, 100)], ANG());
    CO("femurCheck", "Check, piede avanti, diretto e passo laterale fuori linea", CK_FWD(), SIDEOUT());
    CO("taeTeep", "Muay tae: teep, calcio al corpo, teep, sempre a distanza lunga", TL(), BK(), TL());
    CO("taeSwitch", "Muay tae: calcio al corpo dietro, switch kick, teep d'uscita", BK(), SK(), TL());
    const coverFwd1 = coverHigh.copy().step("l", 0.14).shift(0.06).act("arml", "armr", "legl");
    const coverFwd2 = coverHigh.copy().move(0.14).act("arml", "armr", "legr");
    CO("matCover", "Muay mat: avanza coperto, jab, diretto, gancio e calcio basso", [K(coverHigh, 200, 100), K(coverFwd1, 220, 60), K(coverFwd2, 200, 100), K(g, 260, 60)], J(), C(), [K(hookLoad, 120, 20), K(hook, 180, 140)], RKfrom(angL(-0.17, 32), kLow));
    CO("matUpperHook", "Muay mat: montante e gancio corti, poi uscita d'angolo", UR(), H(), ANG());
    CO("signAttack", "Combinazione d'attacco: jab, diretto, gancio, calcio al corpo", J(), C(), H(), BK());
    CO("signCounter", "Contrattacco: check, diretto e gancio", CK_FWD(), H());
    CO("signExit", "Uscita: diretto, calcio basso e passo d'angolo", C(), LK(), ANG());
    // shadow: campioni di round per livello
    CO("shadow1", "Shadow: rimbalzo, uno-due, teep e ginocchiata, poi di nuovo rimbalzo", BNC(), J(), C(), BNC(), TL(), KR(), BNC());
    CO("shadow2", "Shadow: uno-due e calcio, check, teep, sempre di nuovo in guardia", BNC(), J(), [K(cross, 170, 140)], RKfrom(a1), CKL(), TL());
    CO("shadow3", "Shadow corto: uno-due, sok tat, copertura, khao chiang", J(), C(), STL(), COV(), KC(), SNR());
    CO("shadow4", "Ritmo thai: rimbalzo calmo, poi esplosione di 3 armi e di nuovo calmo", BNC(1.5), J(0.8), C(0.8), RKfrom(angL(-0.17, 32), kLow, 0.8), BNC(1.5), SK(0.9));
    CO("shadow5", "Shadow: finta, calcio al corpo, uno-due-gancio e calcio alto, lean back", FEINT(), RKfrom(feintDownOut, { c: kBodyLow, e: kBody.e }), J(), C(), [K(hookLoad, 120, 20), K(hook, 180, 140)], RKfrom(angL(-0.15, 35), kHigh), LB(), [K(g, 260, 150)]);
    CO("shadow6", "Shadow completo: teep, uno-due, calcio al corpo, gomito, ginocchiata", TL(), J(), C(), BK(), STR(), KC(), BNC());
    CO("shadowSlow", "Shadow lento: passi, jab e diretto a metà velocità", [K(fwd1, 350, 100), K(fwd2, 330, 200), K(g, 500, 100)], J(1.6), C(1.6), [K(bk1, 350, 100), K(bk2, 330, 200), K(g, 500, 150)]);
    CO("shadowShortSlow", "Shadow corto lento: gomiti lenti, ginocchiata diagonale leggera, copertura", STL(1.6), STR(1.6), KC(1.5), COV(1.4));
    CO("lightKicks", "Calci circolari leggeri a metà altezza e metà forza, lenti", RK(kMid, 1.5));
    CO("lightLowKicks", "Calci bassi leggeri e cambi di guardia sul posto", LK(1.3), SW(), [K(gM, 250, 100)], SWB());
    CO("teepAlt", "Teep alternati: avanti e dietro", TL(), TR());

    /* ---------------- clinch con il compagno */
    // fotogramma con compagno come tupla; CL() lo trasforma (spostamento e rotazione della scena)
    const KP = (me, pa, t, h) => ({ me, pa, t, h });
    const ROT = -32; // la coppia si vede di fianco nella vista 3/4
    const CL = (list, dx = 0) => list.map((f) => K(rotPose(f.me.copy().move(dx), 0, 0, ROT), f.t, f.h, undefined, rotPose(f.pa.copy().move(dx), 0, 0, ROT)));
    // ruota tutta la posa attorno al punto (cx, cz) assoluto
    function rotPose(b, cx, cz, deg) {
      const o = b.p.o.slice();
      const r = deg * Math.PI / 180;
      b.p.o = [cx, cz];
      b.spin(deg);
      const dx = o[0] - cx;
      const dz = o[1] - cz;
      b.p.o = [cx + dx * Math.cos(r) + dz * Math.sin(r), cz - dx * Math.sin(r) + dz * Math.cos(r)];
      return b;
    }
    // compagno (costruito guardando +x, poi girato verso di te)
    const paLocal = (bent = 0) => {
      const b = standing().foot("l", 0.0, -0.16, 10, 6).foot("r", 0.0, 0.16, -10, 6);
      b.set("pel", [-0.05 - 0.05 * bent, 0.9 - 0.02 * bent, 0]).set("chest", [0.06 + 0.07 * bent, 1.38 - 0.06 * bent, 0]).set("head", [0.15 + 0.1 * bent, 1.56 - 0.1 * bent, 0.06]);
      b.handRel("l", 0.24, -0.14, -0.1, "open").handRel("r", 0.24, -0.14, 0.1, "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
      return b;
    };
    const PA = (b, d = 0.5) => b.spin(180).move(d);
    const paUp = PA(paLocal(0));
    const paBent = PA(paLocal(1));
    const paGuard = PA(thai().guard("box"), 0.95);
    const csBase = () => standing().foot("l", 0.02, -0.16, 10, 12).foot("r", -0.02, 0.16, -10, 12).set("pel", [0.0, 0.93, 0]).set("chest", [0.05, 1.42, 0]).set("head", [0.08, 1.62, 0.06]);
    const closeHands = (b) => b.handHead("l", 0.17, -0.1, -0.13, "fist").handHead("r", 0.17, -0.1, 0.13, "fist").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
    const plumL = (me, pa) => { const f = pa.frame(); const h = add(pa.p.head, mul(f.fwd, -0.11)); return me.hand("l", add(h, [0, -0.07, -0.03]), "open").elbow("l", [0.1, -1, 0.7]); };
    const plumR = (me, pa) => { const f = pa.frame(); const h = add(pa.p.head, mul(f.fwd, -0.1)); return me.hand("r", add(h, [0, -0.03, 0.02]), "open").elbow("r", [0.1, -1, -0.7]); };
    const plum = (me, pa) => plumR(plumL(me, pa), pa);
    const cs0 = closeHands(csBase());
    const cs1 = plumL(closeHands(csBase()), paUp).act("arml");
    const cs2 = plum(csBase(), paUp).act("arml", "armr");
    const csPull = () => csBase().heel("l", 26).heel("r", 26).shift(0.04).lean(0.02);
    const cs3 = plum(csPull(), paBent).act("arml", "armr", "torso");
    const cs3h = plum(csPull(), paBent);
    M("clinchGrip", "Presa al collo: mani sovrapposte sulla nuca, gomiti stretti, tira giù con il peso", CL([KP(cs0, paUp, 300, 250), KP(cs1, paUp, 350, 300), KP(cs2, paUp, 350, 300), KP(cs3, paBent, 450, 900), KP(cs0, paUp, 450, 300)]));
    M("clinchHold", "Presa doppia tenuta: anche avanti, testa alta, poi rilascia", CL([KP(cs0, paUp, 300, 200), KP(cs2, paUp, 300, 150), KP(cs3, paBent, 400, 1600), KP(cs0, paUp, 400, 300)]));
    const ckR = plum(csPull().kick("l", "knee", "ext", "mid", { arms: "none" }), paBent).act("legl");
    M("clinchKnee", "Dalla presa doppia, ginocchiata dritta leggera senza mollare la presa", CL([KP(cs0, paUp, 300, 150), KP(cs2, paUp, 300, 100), KP(cs3h, paBent, 350, 200), KP(ckR, paBent, 220, 250), KP(cs3h, paBent, 250, 200), KP(cs0, paUp, 400, 250)]));
    // khao chiang e khao noi in clinch (il compagno viene spostato verso il lato della gamba)
    const paSide = (dz) => PA(paLocal(1).move(0, -dz).spin(dz > 0 ? 12 : -12));
    const paR = paSide(0.07);
    const paL = paSide(-0.07);
    const cKcW = plum(kneeDiag(csPull(), "wide"), paR).act("legr");
    const cKcH = plum(kneeDiag(csPull(), "close"), paR).act("legr", "arml", "armr");
    const cKcPrep = plum(csPull(), paR).act("arml", "armr");
    const CKCR = () => [KP(cKcPrep, paR, 220, 40), KP(cKcW, paR, 170, 30), KP(cKcH, paR, 170, 200), KP(cs3h, paBent, 230, 80)];
    const CKCL = () => [KP(mir(cKcPrep), paL, 220, 40), KP(mir(cKcW), paL, 170, 30), KP(mir(cKcH), paL, 170, 200), KP(cs3h, paBent, 230, 80)];
    const noiR = plum(csPull().footW("r", [0.12, 0.2, 0.13], -20, 50).knee("r", [1, 0.2, -0.4]).heel("l", 30), paBent).act("legr");
    const noiL = plum(csPull().footW("l", [0.12, 0.2, -0.13], 20, 50).knee("l", [1, 0.2, 0.4]).heel("r", 30), paBent).act("legl");
    const NOIR = () => [KP(noiR, paBent, 150, 150), KP(cs3h, paBent, 150, 60)];
    const NOIL = () => [KP(noiL, paBent, 150, 150), KP(cs3h, paBent, 150, 60)];
    const CIN = [KP(cs0, paUp, 300, 150), KP(cs2, paUp, 300, 80), KP(cs3h, paBent, 320, 150)];
    const COUT = [KP(cs0, paUp, 400, 250)];
    M("clinchKneeDiag", "In clinch: sposta il compagno verso la gamba, che va in fuori e chiude in diagonale", CL([...CIN, ...CKCL(), ...COUT]));
    M("clinchKneeShort", "Khao noi: ginocchiata corta alla coscia, il piede quasi non si stacca", CL([...CIN, ...NOIL(), ...NOIR(), ...COUT]));
    M("clinchNoiChiang", "In clinch: 2 khao noi e 1 khao chiang, cambiando gamba", CL([...CIN, ...NOIL(), ...NOIR(), ...CKCL(), ...COUT]));
    M("clinchChiangAlt", "In clinch: khao chiang alternate destra e sinistra, presa sempre chiusa", CL([...CIN, ...CKCL(), ...CKCR(), ...CKCL(), ...COUT]));
    // giro: passo indietro di lato e perno sul piede avanti, il compagno gira di 90 gradi
    const cx = 0.02;
    const cz = -0.16;
    const meTurn = rotPose(plum(csPull().step("r", -0.12, 0.05), paBent).copy(), cx, cz, -30);
    const paTurn = rotPose(paLocal(1.3).spin(180).move(0.5), cx, cz, -75);
    plum(meTurn, paTurn).act("legr", "arml", "armr", "torso");
    const kneeDiagL = (base, ph) => mir(kneeDiag(mir(base), ph));
    const meTurnKnee = plum(rotPose(kneeDiagL(csPull().step("r", -0.12, 0.05), "close"), cx, cz, -30), paTurn).act("legl");
    const meTurnWide = plum(rotPose(kneeDiagL(csPull().step("r", -0.12, 0.05), "wide"), cx, cz, -30), paTurn).act("legl");
    const TURN0 = () => [KP(meTurn, paTurn, 450, 250), KP(meTurnWide, paTurn, 180, 30), KP(meTurnKnee, paTurn, 170, 220), KP(meTurn.copy().act(), paTurn, 220, 100), KP(cs3h, paBent, 450, 150)];
    const TURN = TURN0;
    M("clinchTurn", "Giro: tira il compagno di lato, passo indietro e perno, poi ginocchiata", CL([...CIN, ...TURN(), ...COUT]));
    // nuoto (pummeling): mani dentro a turno, anche verso il lato della mano che entra
    const psBase = () => standing().foot("l", 0.02, -0.2, 12, 8).foot("r", -0.02, 0.2, -12, 8).set("pel", [0.0, 0.9, 0.0]).set("chest", [0.05, 1.39, 0]).set("head", [0.08, 1.59, 0.06]);
    const pumA = (() => { const b = psBase().shift(0, 0.04); const pa = paUp; const f = pa.frame(); b.hand("r", add(add(pa.p.head, mul(f.fwd, -0.1)), [0, -0.06, 0.02]), "open").elbow("r", [0, -1, -0.3]); b.hand("l", [0.32, 1.22, -0.18], "open").elbow("l", [0, -1, -0.4]); return b.act("armr"); })();
    const paPumA = (() => { const b = paUp.copy(); b.hand("r", add(pumA.p.head, [-0.1, -0.07, -0.05]), "open").elbow("r", [0, -1, 0.3]).hand("l", [0.22, 1.24, 0.2], "open").elbow("l", [0, -1, -0.3]); return b; })();
    const pumB = mir(pumA).act("arml");
    const paPumB = mir(paPumA);
    const pumMid = closeHands(psBase());
    M("pummel", "Nuoto: una mano entra dal basso tra il braccio e il collo, poi l'altra, anche vicine", CL([KP(pumMid, paUp, 300, 150), KP(pumA, paPumA, 350, 250), KP(pumMid, paUp, 250, 30), KP(pumB, paPumB, 300, 250), KP(pumMid, paUp, 250, 30), KP(pumA, paPumA, 300, 250), KP(pumMid, paUp, 300, 150)]));
    M("pummelPlum", "Nuoto con una mano dentro alla volta, poi chiudi con la presa doppia", CL([KP(pumMid, paUp, 300, 100), KP(pumA, paPumA, 300, 200), KP(pumB, paPumB, 400, 200), KP(cs1, paUp, 300, 100), KP(cs2, paUp, 300, 200), KP(cs3, paBent, 350, 600), KP(pumMid, paUp, 450, 200)]));
    const pumAirA = (() => { const b = psBase().shift(0, 0.04); b.handW("r", 0.45, 1.5, 0.0, "open").elbow("r", [0, -1, -0.3]).handW("l", 0.32, 1.22, -0.18, "open").elbow("l", [0, -1, -0.4]); return b.act("armr"); })();
    M("pummelAir", "Nuotate lente in aria: mani che entrano a turno, gomiti vicini, anche avanti", [K(pumMid, 300, 100), K(pumAirA, 400, 150), K(pumMid, 300, 30), K(mir(pumAirA).act("arml"), 400, 150), K(pumMid, 300, 30), K(pumAirA, 400, 150), K(pumMid, 300, 150)]);
    // entrata nel clinch dai pugni e uscita con teep
    const ENTER = 0.22;
    const toTuple = (list, dx) => list.map((f) => KP(f.me.copy().move(dx), f.pa.copy().move(dx), f.t, f.h));
    M("clinchEntry", "Jab, diretto, presa doppia al collo e 3 khao chiang alternate", CL([KP(g, paGuard, 300, 150), KP(jab, paGuard, 150, 150), KP(g, paGuard, 180, 60), KP(cross, paGuard, 170, 150),
      ...toTuple([KP(cs2, paUp, 350, 100), KP(cs3h, paBent, 250, 100), ...CKCL(), ...CKCR(), ...CKCL()], ENTER), KP(g, paGuard, 500, 250)]));
    const tpE = g.copy().move(ENTER).kick("l", "teep", "ext", "body", { arms: "none" }).guard("thai");
    const paPushed = PA(thai().guard("box").lean(-0.06).shift(-0.03), 1.25);
    M("clinchTurnTeep", "In clinch: giro, khao chiang dalla parte aperta, poi spingi via con il teep", CL([KP(g, paGuard, 300, 150),
      ...toTuple([KP(cs2, paUp, 400, 100), KP(cs3h, paBent, 250, 100), ...TURN()], ENTER), KP(teepLC.copy().move(ENTER), paUp.copy().move(ENTER + 0.1), 200, 30), KP(tpE, paPushed, 180, 300), KP(g, paGuard, 500, 250)]));
    /* ---------------- ginocchiata con saltello e volante */
    const lift = (b, dy) => { b.sink(-dy); ["l", "r"].forEach((s) => { b.p.foot[s] = add(b.p.foot[s], [0, dy, 0]); }); return b; };
    const kStep = g.copy().step("l", 0.18).shift(0.08).act("legl");
    const kStepKnee = pullDown(g.copy().move(0.18).kick("r", "knee", "ext", "mid", { arms: "none" })).heel("l", 40).act("legr", "arml", "armr");
    const kHopKnee = lift(kStepKnee.copy(), 0.05).act("legr", "legl", "arml", "armr");
    const kLand = g.copy().move(0.18);
    const kBack1 = g.copy().move(0.18).step("r", -0.18).shift(-0.08).act("legr");
    const BACKSTEP = [K(kBack1, 240, 60), K(g.copy().act("legl"), 240, 200)];
    M("kneeStep", "Ginocchiata con passo: passo avanti, sali sulla punta e khao trong dietro", [G(300, 150), K(reachNeck(kStep.copy()), 220, 40), K(kStepKnee, 200, 250), K(kLand, 250, 100), ...BACKSTEP]);
    M("kneeHop", "Ginocchiata con saltello: il piede avanti stacca di pochi centimetri", [G(300, 150), K(reachNeck(kStep.copy()), 220, 40), K(kHopKnee, 180, 120), K(kStepKnee.copy().act("legl"), 150, 100), K(kLand, 250, 100), ...BACKSTEP]);
    const flyStep = reachNeck(g.copy().step("l", 0.2).shift(0.1)).act("legl", "arml", "armr");
    const flyPush = reachNeck(g.copy().move(0.2).sink(0.06).heel("l", 25).heel("r", 45)).act("legl", "legr");
    const flyAir = lift(pullDown(g.copy().move(0.2).kick("r", "knee", "ext", 1.0, { arms: "none" }).footW("l", [0.2 + 0.2, 0.3, -0.12], 0, 55)).knee("l", [1, 0, 0]), 0.16);
    flyAir.p.foot.r = add(flyAir.p.foot.r, [0.06, 0.08, 0]);
    flyAir.act("legr", "legl", "arml", "armr");
    const flyLand = g.copy().move(0.3).heel("l", 0).sink(0.06).footAt("r", [0.3 - 0.05, 0.32, 0.12], 0, 50).knee("r", [1, 0.3, 0]).act("legl");
    const flyLand2 = g.copy().move(0.3).act("legr");
    const FLY = [K(flyStep, 230, 40), K(flyPush, 140, 20), K(flyAir, 180, 260), K(flyLand, 220, 120), K(flyLand2, 220, 200), K(g, 480, 200)];
    M("flyingKnee", "Khao loi: passo, stacco dal piede avanti, ginocchio dietro al petto, atterraggio morbido", [G(300, 150), ...FLY]);
    M("flyingKneeSlow", "Khao loi scomposta: passo d'entrata corto, stacco, ginocchio avanti più che in alto", [G(300, 150), K(flyStep, 350, 300), K(flyPush, 250, 200), K(flyAir, 300, 900), K(flyLand, 350, 300), K(flyLand2, 300, 200), G(550, 200)]);

    /* ---------------- corda e saltelli */
    const ropeA = standing().foot("l", 0.03, -0.1, 5, 14).foot("r", 0.03, 0.1, -5, 14).handW("l", 0.08, 0.98, -0.27, "fist").handW("r", 0.08, 0.98, 0.27, "fist").elbow("l", [-0.4, -1, -0.2]).elbow("r", [-0.4, -1, 0.2]).sink(0.01);
    ropeA.p.hand.l = [0.08, 0.98, -0.27]; ropeA.p.hand.r = [0.08, 0.98, 0.27];
    const ropeUp = lift(ropeA.copy().heel("l", 22).heel("r", 22), 0.04).handW("l", 0.11, 1.0, -0.25).handW("r", 0.11, 1.0, 0.25).act("legl", "legr");
    M("rope", "Corda a piedi pari: salto basso, ginocchia morbide, sono i polsi a girare", [K(ropeA, 220, 30), K(ropeUp, 160, 30), K(ropeA, 160, 30), K(ropeUp, 160, 30), K(ropeA, 160, 30), K(ropeUp, 160, 30), K(ropeA, 160, 150)]);
    const ropeAltA = ropeA.copy().footAt("l", [0.05, ankleY(40) + 0.07, -0.1], 0, 40).knee("l", [1, 0.2, 0]).heel("r", 30).act("legl");
    const ropeAltB = ropeA.copy().footAt("r", [0.05, ankleY(40) + 0.07, 0.1], 0, 40).knee("r", [1, 0.2, 0]).heel("l", 30).act("legr");
    M("ropeAlt", "Corda a piedi alterni, come una corsa leggera sul posto", [K(ropeA, 220, 30), K(ropeAltA, 170, 20), K(ropeAltB, 170, 20), K(ropeAltA, 170, 20), K(ropeAltB, 170, 20), K(ropeAltA, 170, 20), K(ropeAltB, 170, 20), K(ropeA, 170, 120)]);
    const ropeHiA = ropeA.copy().footAt("l", [0.22, 0.5, -0.1], 0, 40).knee("l", [1, 0.6, 0]).heel("r", 30).act("legl");
    const ropeHiB = ropeA.copy().footAt("r", [0.22, 0.5, 0.1], 0, 40).knee("r", [1, 0.6, 0]).heel("l", 30).act("legr");
    M("ropeHigh", "Corda con le ginocchia più alte, a ritmo", [K(ropeA, 220, 30), K(ropeHiA, 180, 20), K(ropeHiB, 180, 20), K(ropeHiA, 180, 20), K(ropeHiB, 180, 20), K(ropeA, 180, 120)]);
    M("ropeFast", "Corda veloce: salti rapidi e bassi sugli avampiedi", [K(ropeA, 180, 10), K(ropeUp, 110, 10), K(ropeA, 110, 10), K(ropeUp, 110, 10), K(ropeA, 110, 10), K(ropeUp, 110, 10), K(ropeA, 110, 10), K(ropeUp, 110, 10), K(ropeA, 110, 100)]);

    /* ---------------- condizionamento */
    const lbk = L.lieBack({ kneesUp: true });
    const fistsHead = (b) => b.handHead("l", 0.1, 0.02, -0.08, "fist").handHead("r", 0.1, 0.02, 0.08, "fist").elbow("l", [0.2, 0.3, -1]).elbow("r", [0.2, 0.3, 1]);
    const suDown = fistsHead(lbk.copy());
    const suUp = fistsHead(lbk.copy().set("chest", [0.12, 0.58, 0]).set("head", [0.24, 0.75, 0])).elbow("l", [1, -0.4, -0.3]).elbow("r", [1, -0.4, 0.3]).act("torso");
    M("situpGuard", "Sit-up con le mani in guardia alla fronte: gomiti alle ginocchia, scendi lento", [K(suDown, 300, 150), K(suUp, 600, 200), K(suDown, 800, 250)]);
    const suJab = suUp.copy().straight("l", [0.85, 1.15, -0.05]).act("arml");
    const suCross = suUp.copy().straight("r", [0.85, 1.15, 0.05]).twist(15).act("armr");
    M("situpPunch", "Sit-up con uno-due: sali, jab e diretto in alto, scendi lento in guardia", [K(suDown, 300, 150), K(suUp, 550, 60), K(suJab, 150, 120), K(suUp, 150, 30), K(suCross, 150, 120), K(suUp, 180, 60), K(suDown, 800, 250)]);
    const tuckBase = L.sitLong().set("chest", [-0.16, 0.58, 0]).set("head", [-0.14, 0.78, 0]).handW("l", -0.26, 0.04, -0.22, "open").handW("r", -0.26, 0.04, 0.22, "open").elbow("l", [-1, 0, -0.2]).elbow("r", [-1, 0, 0.2]);
    const tuckIn = tuckBase.copy().footAt("l", [0.28, 0.24, -0.1], 0, 10).footAt("r", [0.28, 0.24, 0.1], 0, 10).knee("l", [0.3, 1, 0]).knee("r", [0.3, 1, 0]).act("legl", "legr");
    const tuckOut = tuckBase.copy().footAt("l", [0.84, 0.2, -0.1], 0, -60).footAt("r", [0.84, 0.2, 0.1], 0, -60).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).act("legl", "legr");
    M("kneeTuck", "Ginocchia al petto da seduto, mani dietro, poi distendi senza toccare terra", [K(tuckOut, 300, 150), K(tuckIn, 450, 150), K(tuckOut, 450, 150), K(tuckIn, 450, 150), K(tuckOut, 450, 200)]);
    const pkc = L.plank().footAt("r", [-0.35, 0.3, -0.02], 0, 30).knee("r", [0.5, -0.6, -0.6]).act("legr", "torso");
    const pkcL = L.plank().footAt("l", [-0.35, 0.3, 0.02], 0, 30).knee("l", [0.5, -0.6, 0.6]).act("legl", "torso");
    M("plankKneeCross", "Plank alto: ginocchio verso il gomito opposto, alternando i lati", [K(L.plank(), 300, 150), K(pkc, 350, 250), K(L.plank(), 300, 100), K(pkcL, 350, 250), K(L.plank(), 300, 200)]);
    const ni0 = standing();
    const niF = standing().handHead("r", 0.16, 0.05, 0.0, "open").elbow("r", [0.3, -0.5, 1]).act("head", "armr");
    const niB = standing().handHead("l", -0.13, 0.02, -0.05, "open").handHead("r", -0.13, 0.04, 0.05, "open").elbow("l", [0.5, 0.4, -1]).elbow("r", [0.5, 0.4, 1]).act("head", "arml", "armr");
    const niR = standing().handHead("r", 0.0, 0.03, 0.14, "open").elbow("r", [0, -0.3, 1]).act("head", "armr");
    const niL = standing().handHead("l", 0.0, 0.03, -0.14, "open").elbow("l", [0, -0.3, -1]).act("head", "arml");
    M("neckIso", "Isometrie del collo: la mano spinge su fronte, nuca e tempie, il collo non si muove", [K(ni0, 300, 100), K(niF, 400, 900), K(ni0, 300, 100), K(niB, 400, 900), K(ni0, 300, 100), K(niR, 400, 900), K(ni0, 300, 100), K(niL, 400, 900), K(ni0, 300, 200)]);
    const nm = standing();
    M("neckMob", "Collo lento: avanti e indietro, poi inclinazioni laterali, senza cerchi", [K(nm, 300, 100), K(nm.copy().headTo(0.06, -0.04, 0).act("head"), 600, 250), K(nm.copy().headTo(-0.05, -0.01, 0).act("head"), 700, 250), K(nm, 500, 100), K(nm.copy().headTo(0, -0.015, -0.07).act("head"), 600, 250), K(nm.copy().headTo(0, -0.015, 0.07).act("head"), 700, 250), K(nm, 500, 200)]);
    const gtw = (d) => g.copy().twist(d).hips(d * 0.3).guard("thai").act("torso");
    M("guardTwist", "Rotazioni del busto in guardia, a destra e a sinistra", [G(300, 100), K(gtw(35), 450, 150), K(gtw(-30), 600, 150), G(400, 200)]);
    const sq0 = standing().foot("l", 0, -0.5, 20, 0).foot("r", 0, 0.52, -20, 0).set("pel", [-0.04, 0.84, 0]).set("chest", [0.02, 1.33, 0]).set("head", [0.05, 1.53, 0]).handRel("l", 0.3, -0.25, -0.05, "fist").handRel("r", 0.3, -0.25, 0.05, "fist");
    const sqR = sq0.copy().set("pel", [-0.08, 0.6, 0.32]).set("chest", [0.06, 1.08, 0.26]).set("head", [0.12, 1.27, 0.24]).footAt("l", [0.02, 0.1, -0.5], 10, -35).knee("r", [1, 0, 0.6]).knee("l", [0, 1, -0.2]).handRel("l", 0.35, -0.25, -0.05, "fist").handRel("r", 0.35, -0.25, 0.05, "fist").act("legl", "legr");
    M("sideSquat", "Squat laterale: scendi lento su una gamba, l'altra tesa con la punta in alto", [K(sq0, 300, 150), K(sqR, 700, 400), K(sq0, 600, 150), K(mir(sqR), 700, 400), K(sq0, 600, 200)]);

    /* ---------------- allungamenti e recupero */
    const f4 = L.lieBack().set("chest", [-0.42, 0.24, 0]).set("head", [-0.6, 0.36, 0]).footAt("l", [0.35, 0.55, -0.1], 0, -30).knee("l", [-1, 1, 0]).footAt("r", [0.0, 0.5, -0.02], -70, 0, 60).knee("r", [0.3, 0.3, 1]).handW("l", -0.06, 0.38, -0.17, "open").handW("r", -0.06, 0.38, -0.03, "open").elbow("l", [0, 0.2, -1]).elbow("r", [0, 0.2, 1]);
    M("figure4", "Figura del 4 da sdraiato: caviglia sul ginocchio, tira la gamba verso il petto", [K(L.lieBack({ kneesUp: true }), 300, 150), K(f4.act("legl", "legr"), 800, 1300), K(L.lieBack({ kneesUp: true }), 600, 150), K(mir(f4).act("legl", "legr"), 800, 1300), K(L.lieBack({ kneesUp: true }), 600, 200)]);
    const hsT = L.lieBack().footAt("r", [0.12, 0.98, 0.1], 0, -80).knee("r", [1, 0, 0]).handW("l", -0.18, 0.46, 0.04, "fist").handW("r", -0.18, 0.46, 0.14, "fist").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    M("hamstringTowel", "Sdraiato: gamba tesa verso l'alto tenuta con un asciugamano dietro il polpaccio", [K(L.lieBack(), 300, 150), K(hsT.act("legr"), 900, 1400), K(L.lieBack(), 700, 200)]);
    const cw = standing().foot("l", 0.05, -0.12, 0, 0).foot("r", 0.0, 0.12, 0, 0).handW("r", 0.12, 1.55, 0.5, "open").elbow("r", [0, -1, 0.6]).twist(28).handW("l", 0.05, 0.95, -0.28, "open").act("armr", "torso");
    M("chestWall", "Petto al muro: avambraccio al muro all'altezza della spalla, ruota il busto dall'altra parte", [K(standing(), 300, 150), K(cw, 700, 1300), K(standing(), 600, 150), K(mir(cw), 700, 1300), K(standing(), 600, 200)]);
    const kn = L.kneel();
    const ns = kn.copy().headTo(0, -0.03, 0.07).handHead("r", 0.0, 0.11, -0.01, "open").elbow("r", [0, 0.3, 1]).act("head", "armr");
    M("neckStretch", "Seduto dritto: orecchio verso la spalla, la mano appoggiata sulla testa senza tirare", [K(kn, 300, 150), K(ns, 700, 1300), K(kn, 600, 150), K(mir(ns), 700, 1300), K(kn, 600, 200)]);
    const lw = L.lieBack().footAt("l", [0.12, 0.95, -0.1], 0, -80).footAt("r", [0.12, 0.95, 0.1], 0, -80).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]).handW("l", -0.2, 0.05, -0.32, "open").handW("r", -0.2, 0.05, 0.32, "open");
    const lwB = lw.copy().set("chest", [-0.5, 0.15, 0]).act("torso");
    M("legsWall", "Sdraiato con le gambe appoggiate in alto al muro, respiri lunghi", [K(L.lieBack(), 300, 150), K(lw.copy().act("legl", "legr"), 800, 300), K(lwB, 1500, 300), K(lw, 1800, 300), K(L.lieBack(), 700, 200)]);
    const smB = L.sitLong().footAt("l", [0.45, 0.07, -0.13], 0, 0).footAt("r", [0.45, 0.07, 0.13], 0, 0).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).set("chest", [0.12, 0.6, 0]).set("head", [0.2, 0.78, 0]);
    const smLo = smB.copy().handW("l", 0.4, 0.17, -0.13, "open").handW("r", 0.4, 0.17, 0.13, "open").act("arml", "armr");
    const smHi = smB.copy().handW("l", 0.27, 0.4, -0.13, "open").handW("r", 0.27, 0.4, 0.13, "open").act("arml", "armr");
    M("shinMassage", "Seduto: massaggia con i palmi le tibie dal basso verso l'alto", [K(smLo, 300, 100), K(smHi, 600, 100), K(smLo, 400, 100), K(smHi, 600, 100), K(smLo, 400, 200)]);

    /* ---------------- sacco */
    const BAGP = { props: [L.BAG] };
    const bagPushP = g.copy().step("l", 0.2).shift(0.16).turn(10).handW("l", 0.64, 1.3, -0.1, "open").handW("r", 0.64, 1.3, 0.1, "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]).act("arml", "armr", "legl");
    M("bagPush", "Spingi il sacco con le mani lontano da te e torna in guardia", [G(300, 150), K(bagPushP, 300, 250), G(300, 300)], BAGP);
    const tLimit = (b, x) => { if (b.p.foot.l[0] > x) b.p.foot.l = [x, b.p.foot.l[1], b.p.foot.l[2]]; if (b.p.foot.r[0] > x) b.p.foot.r = [x, b.p.foot.r[1], b.p.foot.r[2]]; return b; };
    const teepLBag = tLimit(teepLE.copy(), 0.6).knee("l", [0.4, 1, 0]);
    const gBack = g.copy().move(-0.22);
    const teepRCb = gBack.copy().kick("r", "teep", "chamber", "body", { arms: "none" }).guard("thai");
    const teepRBag = tLimit(gBack.copy().kick("r", "teep", "ext", "body", { arms: "none" }).guard("thai").handRel("r", 0.02, -0.42, 0.22, "fist").elbow("r", [0, -1, 0.3]), 0.7).knee("r", [0.4, 1, 0]).act("legr", "armr");
    M("teepBagL", "Teep avanti al sacco: spingilo con l'avampiede, aspetta che torni", [G(300, 150), K(teepLC, 200, 60), K(teepLBag, 160, 250), K(teepLC, 180, 40), G(200, 150)], BAGP);
    M("teepBagR", "Teep dietro al sacco: piccolo passo indietro, spinta d'anca, poi torna in guardia", [G(300, 150), K(gBack.copy().act("legl", "legr"), 260, 80), K(teepRCb, 230, 60), K(teepRBag, 180, 250), K(teepRCb, 200, 40), K(gBack, 200, 60), G(260, 150)], BAGP);
    const bagIn = g.copy().move(0.3);
    const bagHands = (b, x = 0.72) => b.hand("l", [x, 1.55, -0.09], "open").hand("r", [x, 1.55, 0.09], "open").elbow("l", [0, -1, -0.2]).elbow("r", [0, -1, 0.2]);
    const bagHold = bagHands(bagIn.copy().foot("l", 0.02, -0.15, 0, 12).foot("r", -0.04, 0.15, -10, 12).set("pel", [0.29, 0.92, 0]).set("hipYaw", 0).set("chestYaw", 0).set("chest", [0.33, 1.41, 0]).set("head", [0.36, 1.61, 0]));
    const bagKR = bagHands(bagHold.copy().kick("r", "knee", "ext", "mid", { arms: "none" })).act("legr", "arml", "armr");
    const bagKL = bagHands(bagHold.copy().kick("l", "knee", "ext", "mid", { arms: "none" }).lean(0.04), 0.68).act("legl", "arml", "armr");
    M("bagKnees", "Al sacco: mani sopra come su una nuca, ginocchiate alternate con le anche avanti", [G(300, 100), K(bagHold, 350, 100), K(bagKR, 180, 120), K(bagHold, 170, 30), K(bagKL, 180, 120), K(bagHold, 170, 30), K(bagKR, 180, 120), K(bagHold, 170, 30), K(bagKL, 180, 120), K(bagHold, 200, 100), G(350, 150)], BAGP);
    M("bagKneeR", "Al sacco: mani sopra, tira giù e ginocchiata dritta dietro", [G(300, 100), K(bagHold, 350, 100), K(bagKR, 200, 200), K(bagHold, 200, 60), K(bagKR, 200, 200), K(bagHold, 200, 100), G(350, 150)], BAGP);

    /* ---------------- altro: bende, telefono, angolo */
    const wr0 = standing().handRel("l", 0.3, -0.2, -0.02, "open").handRel("r", 0.22, -0.2, 0.1, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    const wr1 = wr0.copy().handRel("r", 0.3, -0.12, -0.03, "open").act("armr");
    const wr2 = wr0.copy().handRel("r", 0.34, -0.22, -0.09, "open").act("armr");
    const wr3 = wr0.copy().handRel("r", 0.3, -0.27, -0.01, "open").act("armr");
    const wrT = standing().handRel("l", 0.34, -0.12, -0.02, "fist").handRel("r", 0.34, -0.12, 0.04, "fist").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]).act("arml", "armr");
    M("wrap", "Bende e guantoni: avvolgi il polso e le nocche, poi batti i guanti", [K(standing(), 300, 100), K(wr0, 350, 50), K(wr1, 200, 0), K(wr2, 200, 0), K(wr3, 200, 0), K(wr1, 200, 0), K(wr2, 200, 0), K(wr3, 200, 100), K(wrT, 300, 300), K(g, 400, 300)]);
    const rv = standing().handRel("l", 0.3, -0.12, -0.04, "open").handRel("r", 0.3, -0.12, 0.04, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]).headTo(0.03, -0.04, 0).act("head");
    M("review", "Guarda il video sul telefono e conta con calma", [K(standing(), 300, 100), K(rv, 400, 1600), K(standing(), 400, 200)]);
    const nt = standing().handRel("l", 0.3, -0.2, -0.06, "open").handRel("r", 0.3, -0.18, 0.03, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]).headTo(0.04, -0.05, 0);
    M("notes", "Segna su un foglio quello che hai visto", [K(standing(), 300, 100), K(nt, 400, 200), K(nt.copy().handRel("r", 0.32, -0.19, 0.0, "fist").act("armr"), 250, 100), K(nt.copy().handRel("r", 0.3, -0.21, 0.05, "fist").act("armr"), 250, 100), K(nt.copy().handRel("r", 0.33, -0.2, -0.01, "fist").act("armr"), 250, 400), K(standing(), 400, 200)]);
    const ph = standing().foot("l", 0.25, -0.12, 0, 0).set("pel", [0.08, 0.9, 0]).set("chest", [0.25, 1.36, 0.05]).set("head", [0.36, 1.53, 0.05]).handW("r", 0.55, 1.15, 0.2, "open").elbow("r", [0, -1, 0.4]).act("armr", "torso");
    M("phoneSetup", "Sistema telefono e timer, poi mettiti in guardia", [K(standing(), 300, 150), K(ph, 450, 500), K(standing(), 400, 150), K(g.copy().act("arml", "armr"), 450, 600)]);
    const cr = standing().foot("l", 0.32, -0.2, 15, 0).foot("r", 0.32, 0.2, -15, 0).set("pel", [-0.05, 0.52, 0]).set("chest", [-0.03, 1.02, 0]).set("head", [0.0, 1.22, 0]).knee("l", [1, 0.2, -0.2]).knee("r", [1, 0.2, 0.2]).handW("l", 0.22, 0.6, -0.16, "open").handW("r", 0.22, 0.6, 0.16, "open");
    const crIn = cr.copy().set("chest", [-0.03, 1.04, 0]).act("torso");
    const crDrink = cr.copy().handHead("r", 0.1, -0.08, 0.03, "fist").elbow("r", [0.2, -0.6, 1]).headTo(-0.02, 0.01, 0).act("armr");
    M("cornerRest", "All'angolo: seduto, respira lento dal naso e bevi un sorso d'acqua", [K(cr, 400, 200), K(crIn, 1200, 200), K(cr, 1400, 200), K(crDrink, 400, 700), K(cr, 400, 300)]);
    const dr = standing().handHead("r", 0.1, -0.08, 0.03, "fist").elbow("r", [0.2, -0.6, 1]).headTo(-0.02, 0.01, 0).act("armr");
    M("drink", "Bevi un sorso d'acqua e respira", [K(standing(), 300, 100), K(dr, 400, 800), K(standing(), 400, 300)]);
    CO("lowKickCheck", "Calcio basso e check di sicurezza appena il piede torna", LK(), CKL());
    CO("insideLowCheck", "Calcio basso interno e check di sicurezza", ILK(), CKL());
    CO("teepBounce", "Teep e 2 rimbalzi di calma prima del successivo", TL(), BNC());
    CO("kickBounce", "Calcio, ritorno in guardia e 2 rimbalzi prima del successivo", RK(), BNC());
    CO("bounceFootTest", "Rimbalzo e test del piede: alza il piede avanti senza muovere la testa", BNC(), [K(ft, 250, 450), K(g, 250, 200)]);
    CO("checkSignal", "Rimbalzo e check veloce sul segnale, poi subito in guardia", BNC(0.8), CKL(0.8), BNC(0.8), CKR(0.8));
    CO("kneeStepLong", "Passo avanti e khao trong lunga con la gamba dietro", [K(fwd1, 200, 30)], [K(reach.copy().move(0.12), 160, 30), K(pullDown(g.copy().move(0.12).kick("r", "knee", "ext", "mid", { arms: "none" })).act("legr", "arml", "armr"), 200, 220), K(g.copy().move(0.12), 240, 120), K(g, 350, 150)]);
    // dalla guardia opposta: cambio, tecnica a specchio, cambio di ritorno
    const OPP = (seg) => [...SW(), ...seg.map((f) => K(mir(f.p), f.t, f.h)), ...SWB()];
    CO("kickOpp", "Cambio di guardia e calcio dalla guardia opposta", OPP(RK()));
    CO("lowKickOpp", "Cambio di guardia e calcio basso dalla guardia opposta", OPP(LK()));
    CO("bodyKickOpp", "Cambio di guardia e calcio al corpo dalla guardia opposta", OPP(BK()));
    CO("highKickOpp", "Cambio di guardia e calcio alto dalla guardia opposta", OPP(HK()));
    CO("flyingKneeOpp", "Khao loi dalla guardia opposta: stacco dal destro, ginocchio sinistro", OPP(FLY));
    CO("kickCheckTeepOpp", "Calcio, check e teep dalla guardia opposta", OPP([].concat(RK(), CKL(), TL())));
    // tenute e fasi singole
    M("reachNeck", "Mani avanti all'altezza degli occhi, come ad afferrare una nuca", [G(300, 150), K(reach, 350, 900), G(350, 200)]);
    M("wallStance", "Di fronte al muro, mani appoggiate all'altezza delle spalle, piedi in guardia", [G(300, 150), K(wf0, 450, 1000)]);
    M("wallSide", "Fianco al muro, mano sul muro, la gamba lontana dal muro è quella dietro", [G(300, 150), K(tw0, 450, 1000)]);
    M("kickWall12", "Al muro: tempo 1 ruota il piede d'appoggio, tempo 2 ginocchio su di lato", [K(tw0, 300, 300), K(tw1, 400, 700), K(tw2, 400, 800), K(tw0, 450, 300)]);
    M("kickWall3", "Al muro: anca che gira sopra, tibia orizzontale al fianco, tieni 2 secondi", [K(tw0, 300, 200), K(tw2, 400, 150), K(tw3, 450, 1800), K(tw2, 400, 150), K(tw0, 400, 300)]);
    M("kickStep", "Passo d'angolo: il piede avanti va 20-30 cm in fuori e ruota un poco", [G(300, 150), K(a1, 300, 700), G(300, 200)]);
    M("checkHoldL", "Check tenuto: ginocchio su e in fuori, gomito sul ginocchio", [G(300, 150), K(checkL, 250, 1100), G(300, 200)]);
    M("hookSlow", "Gancio lento: peso sul piede avanti, rotazione, gomito alto quanto il pugno", [G(300, 150), K(hookLoad, 300, 300), K(hook, 400, 800), G(400, 200)]);
    M("hipWideWall", "Mani al muro: ginocchio dietro largo all'altezza dell'anca", [K(hd0, 300, 200), K(hdWide, 500, 1000), K(hd0, 450, 300)]);
    M("bagHoldStill", "Mani sopra il sacco come su una nuca, gomiti dentro, busto alto", [G(300, 150), K(bagHold, 400, 1000), G(400, 200)], BAGP);
    const swKnee = mir(g.copy().kick("r", "round", "chamber", "mid")).act("legl");
    M("switchKnee", "Cambio di guardia e subito il ginocchio della nuova gamba dietro di lato", [G(300, 150), ...SW(), K(swKnee, 220, 300), K(gM, 220, 150), ...SWB(), G(200, 150)]);
    M("neckIsoF", "Isometria avanti: la mano spinge la fronte, il collo resiste fermo", [K(ni0, 300, 150), K(niF, 400, 1400), K(ni0, 350, 200)]);
    M("neckIsoBS", "Isometrie dietro e laterali: mani sulla nuca, poi su ogni tempia", [K(ni0, 300, 100), K(niB, 400, 1000), K(ni0, 300, 100), K(niR, 400, 1000), K(ni0, 300, 100), K(niL, 400, 1000), K(ni0, 300, 200)]);
  });
})(typeof window !== "undefined" ? window : globalThis);
