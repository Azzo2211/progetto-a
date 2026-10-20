/*
 * Progetto A - Difesa: movimenti comuni a tutti gli stili (prefisso "gen."):
 * riscaldamento, condizionamento, allungamenti, respirazione, cadute e movimenti a terra di base.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { mv, K, standing, ready, squat, lunge, plank, pushDown, lieBack, lieFront, sitLong, kneel, allFours, ankleY } = L;
    const st = () => standing();

    /* ---------------- riscaldamento e mobilita' */
    mv("gen.stand", "In piedi, rilassato", [K(st(), 300, 900)]);
    mv("gen.ready", "Posizione di partenza: piedi larghi come le spalle, pugni chiusi davanti", [K(st(), 300, 200), K(ready(), 420, 800, ["arml", "armr"])]);
    const walkA = st().foot("l", 0.1, -0.1, 5, 0).foot("r", -0.1, 0.1, -5, 25).handW("l", -0.08, 0.88, -0.25).handW("r", 0.12, 0.9, 0.25);
    const walkB = st().foot("l", -0.1, -0.1, 5, 25).foot("r", 0.1, 0.1, -5, 0).handW("l", 0.12, 0.9, -0.25).handW("r", -0.08, 0.88, 0.25);
    mv("gen.walk", "Camminata sul posto, braccia che oscillano", [K(walkA, 350, 50, ["legl", "legr"]), K(walkB, 350, 50, ["legl", "legr"]), K(walkA, 350, 50), K(walkB, 350, 100)]);
    const jogA = st().sink(-0.02).footAt("l", [0.08, 0.3, -0.1], 0, 30).foot("r", -0.04, 0.1, 0, 25).knee("l", [1, 0.3, 0]).handRel("l", -0.1, -0.25, -0.22, "fist").handRel("r", 0.25, -0.2, 0.2, "fist").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]);
    const jogB = st().sink(-0.02).footAt("r", [0.08, 0.3, 0.1], 0, 30).foot("l", -0.04, -0.1, 0, 25).knee("r", [1, 0.3, 0]).handRel("r", -0.1, -0.25, 0.22, "fist").handRel("l", 0.25, -0.2, -0.2, "fist").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]);
    mv("gen.jog", "Corsa leggera sul posto", [K(jogA, 220, 30, ["legl"]), K(jogB, 220, 30, ["legr"]), K(jogA, 220, 30, ["legl"]), K(jogB, 220, 80, ["legr"])]);
    const hkA = jogA.copy().footAt("l", [0.3, 0.62, -0.1], 0, 40).knee("l", [1, 1, 0]);
    const hkB = jogB.copy().footAt("r", [0.3, 0.62, 0.1], 0, 40).knee("r", [1, 1, 0]);
    mv("gen.highKnees", "Skip alto: ginocchia all'altezza dell'anca", [K(hkA, 200, 30, ["legl"]), K(hkB, 200, 30, ["legr"]), K(hkA, 200, 30, ["legl"]), K(hkB, 200, 80, ["legr"])]);
    const bkA = st().sink(-0.02).footAt("l", [-0.3, 0.6, -0.1], 180, -40).foot("r", 0, 0.1, 0, 20).knee("l", [0, -1, 0]).handRel("l", 0.1, -0.3, -0.2, "fist").handRel("r", 0.1, -0.3, 0.2, "fist");
    const bkB = st().sink(-0.02).footAt("r", [-0.3, 0.6, 0.1], 180, -40).foot("l", 0, -0.1, 0, 20).knee("r", [0, -1, 0]).handRel("l", 0.1, -0.3, -0.2, "fist").handRel("r", 0.1, -0.3, 0.2, "fist");
    mv("gen.buttKicks", "Calciata dietro: talloni verso i glutei", [K(bkA, 200, 30, ["legl"]), K(bkB, 200, 30, ["legr"]), K(bkA, 200, 30, ["legl"]), K(bkB, 200, 80, ["legr"])]);
    const jjA = st().heel("l", 15).heel("r", 15);
    const jjB = st().sink(-0.06).foot("l", 0, -0.34, 15, 20).foot("r", 0, 0.34, -15, 20).set("foot", { l: [0, ankleY(20) + 0.06, -0.34], r: [0, ankleY(20) + 0.06, 0.34] }).handW("l", 0.02, 2.05, -0.26, "open").handW("r", 0.02, 2.05, 0.26, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    mv("gen.jacks", "Jumping jack: salta aprendo gambe e braccia, poi chiudi", [K(jjA, 260, 40), K(jjB.act("arml", "armr", "legl", "legr"), 260, 60), K(jjA, 260, 40), K(jjB, 260, 60), K(jjA, 260, 200)]);
    const ac = (a) => st().foot("l", 0, -0.16, 10, 0).foot("r", 0, 0.16, -10, 0).handW("l", 0.12 * Math.sin(a), 1.44 + 0.12 * Math.cos(a), -0.72, "open").handW("r", 0.12 * Math.sin(a), 1.44 + 0.12 * Math.cos(a), 0.72, "open").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]).act("arml", "armr");
    mv("gen.armCircles", "Cerchi con le braccia tese ai lati", [K(ac(0), 380, 0), K(ac(Math.PI / 2), 180, 0), K(ac(Math.PI), 180, 0), K(ac(Math.PI * 1.5), 180, 0), K(ac(0), 180, 0), K(ac(Math.PI / 2), 180, 0), K(ac(Math.PI), 180, 0), K(ac(Math.PI * 1.5), 180, 200)]);
    const sr = (v) => { const b = st(); b.handHead("l", 0.0, -0.18, -0.2, "open").handHead("r", 0.0, -0.18, 0.2, "open").elbow("l", [v[0], v[1], -0.4]).elbow("r", [v[0], v[1], 0.4]); return b.act("arml", "armr"); };
    mv("gen.shoulderRolls", "Rotazione delle spalle: mani sulle spalle, gomiti che disegnano cerchi", [K(sr([1, 0, 0]), 380, 0), K(sr([0, 1, 0]), 260, 0), K(sr([-1, 0, 0]), 260, 0), K(sr([0, -1, 0]), 260, 0), K(sr([1, 0, 0]), 260, 200)]);
    const nk = st();
    mv("gen.neck", "Mobilità del collo: inclina, gira e piega la testa, piano", [K(nk, 300, 200), K(nk.copy().headTo(0, -0.015, -0.07).act("head"), 500, 300), K(nk.copy().headTo(0, -0.015, 0.07).act("head"), 600, 300), K(nk.copy().look(60).act("head"), 600, 300), K(nk.copy().look(-60).act("head"), 700, 300), K(nk.copy().headTo(0.06, -0.04, 0).act("head"), 600, 300), K(nk, 500, 200)]);
    const hc = (dx, dz) => { const b = st().foot("l", 0, -0.18, 10, 0).foot("r", 0, 0.18, -10, 0); b.set("pel", [dx, 0.93, dz]).set("chest", [-dx * 0.3, 1.43, -dz * 0.3]).set("head", [-dx * 0.4, 1.63, -dz * 0.4]); b.handPel("l", 0.02, 0.04, -0.17, "open").handPel("r", 0.02, 0.04, 0.17, "open"); return b.act("torso"); };
    mv("gen.hipCircles", "Cerchi con il bacino, mani sui fianchi", [K(hc(0.07, 0), 380, 0), K(hc(0, 0.07), 280, 0), K(hc(-0.07, 0), 280, 0), K(hc(0, -0.07), 280, 0), K(hc(0.07, 0), 280, 200)]);
    const tw = (d) => st().foot("l", 0, -0.18, 10, 0).foot("r", 0, 0.18, -10, 0).twist(d).hips(d * 0.3).handRel("l", 0.25, -0.12, -0.25, "open").handRel("r", 0.25, -0.12, 0.25, "open").act("torso", "arml", "armr");
    mv("gen.torsoTwist", "Torsioni del busto: il bacino resta fermo, gira le spalle", [K(tw(0), 380, 100), K(tw(55), 450, 150), K(tw(0), 400, 50), K(tw(-55), 450, 150), K(tw(0), 400, 200)]);
    const sb = (side) => { const ss = side === "l" ? -1 : 1; const b = st().foot("l", 0, -0.18, 10, 0).foot("r", 0, 0.18, -10, 0).lean(0, ss * 0.15, 0.02); b.handW(side === "l" ? "r" : "l", 0.0, 1.88, ss * 0.12, "open").handW(side, 0.02, 0.86, ss * 0.33, "open"); return b.act("torso", side === "l" ? "armr" : "arml"); };
    mv("gen.sideBend", "Inclinazioni laterali, un braccio sopra la testa", [K(st(), 300, 100), K(sb("l"), 500, 400), K(st(), 400, 100), K(sb("r"), 500, 400), K(st(), 400, 200)]);
    const kc = (v) => { const b = st().foot("l", 0, -0.06, 0, 0).foot("r", 0, 0.06, 0, 0); b.set("pel", [-0.1, 0.78, 0]).set("chest", [0.3, 1.06, 0]).set("head", [0.46, 1.18, 0]); b.handW("l", 0.2, 0.52, -0.08, "open").handW("r", 0.2, 0.52, 0.08, "open").knee("l", v).knee("r", v); return b.act("legl", "legr"); };
    mv("gen.kneeCircles", "Cerchi con le ginocchia, mani sulle ginocchia", [K(kc([1, 0, -0.6]), 400, 0), K(kc([1, 0, 0]), 300, 0), K(kc([1, 0, 0.6]), 300, 0), K(kc([1, 0, 0]), 300, 200)]);
    const an = (yaw, pitch) => st().footAt("r", [0.12, ankleY(pitch), 0.13], yaw, pitch).knee("r", [1, 0, 0]).act("legr");
    mv("gen.ankles", "Mobilità delle caviglie: punta a terra e cerchi con il piede", [K(an(-20, 40), 400, 0), K(an(10, 60), 260, 0), K(an(40, 40), 260, 0), K(an(10, 20), 260, 200)]);
    const lsF = st().footAt("r", [0.55, 0.62, 0.12], 0, 10).knee("r", [1, 0.5, 0]).handW("l", 0.05, 1.0, -0.4, "open").handW("r", 0.0, 0.9, 0.3, "open").lean(-0.04);
    const lsB = st().footAt("r", [-0.45, 0.32, 0.12], 0, 40).knee("r", [1, 0, 0]).handW("l", 0.05, 1.0, -0.4, "open").lean(0.05);
    mv("gen.legSwingFwd", "Slanci della gamba avanti e indietro, gamba morbida", [K(st(), 300, 50), K(lsF.act("legr"), 350, 50), K(lsB.act("legr"), 400, 50), K(lsF.act("legr"), 400, 50), K(st(), 350, 200)]);
    const lsS = st().footAt("r", [0.08, 0.55, 0.62], -10, 10).knee("r", [0.4, 0.2, 0.5]).handW("l", 0.25, 1.35, -0.12, "open").handW("r", 0.3, 1.35, 0.06, "open").lean(0, -0.06);
    const lsI = st().footAt("r", [0.15, 0.3, -0.28], -10, 10).knee("r", [1, 0, 0]).handW("l", 0.25, 1.35, -0.12, "open").handW("r", 0.3, 1.35, 0.06, "open");
    mv("gen.legSwingSide", "Slanci laterali della gamba, mani appoggiate davanti", [K(st(), 300, 50), K(lsS.act("legr"), 350, 50), K(lsI.act("legr"), 400, 50), K(lsS.act("legr"), 400, 50), K(st(), 350, 200)]);
    const wr = (dz) => st().handRel("l", 0.3, -0.12, -0.02 + dz, "fist").handRel("r", 0.3, -0.12, 0.02 + dz, "fist").act("arml", "armr");
    mv("gen.wrists", "Mobilità dei polsi: mani unite davanti, piccoli cerchi", [K(wr(0), 350, 0), K(wr(0.05), 250, 0), K(wr(0), 250, 0), K(wr(-0.05), 250, 0), K(wr(0), 250, 200)]);
    const shk = st().handW("l", 0.06, 0.9, -0.28, "open").handW("r", 0.0, 0.92, 0.27, "open").heel("l", 10);
    mv("gen.shake", "Scuoti braccia e gambe per sciogliere i muscoli", [K(st(), 200, 0), K(shk.act("arml", "armr"), 160, 0), K(st().heel("r", 10), 160, 0), K(shk, 160, 0), K(st(), 160, 200)]);

    /* ---------------- condizionamento */
    const sq0 = st().foot("l", 0, -0.17, 15, 0).foot("r", 0, 0.17, -15, 0).handRel("l", 0.3, -0.2, -0.12, "fist").handRel("r", 0.3, -0.2, 0.12, "fist");
    mv("gen.squat", "Squat: scendi con le cosce parallele, talloni a terra, schiena dritta", [K(sq0, 300, 200), K(squat(1).act("legl", "legr"), 700, 250), K(sq0, 600, 300)]);
    const jump = sq0.copy().sink(-0.15).set("foot", { l: [0, ankleY(40) + 0.15, -0.17], r: [0, ankleY(40) + 0.15, 0.17] }).set("footPitch", { l: 40, r: 40 }).handW("l", 0.05, 2.0, -0.2, "open").handW("r", 0.05, 2.0, 0.2, "open");
    mv("gen.jumpSquat", "Squat con salto: scendi e salta, atterra morbido", [K(sq0, 300, 100), K(squat(1).act("legl", "legr"), 500, 100), K(jump.act("legl", "legr"), 220, 60), K(squat(0.6), 260, 120), K(sq0, 380, 200)]);
    mv("gen.lunge", "Affondo: ginocchio davanti sopra la caviglia, quello dietro vicino a terra", [K(st(), 300, 150), K(lunge("l").act("legl", "legr"), 650, 250), K(st(), 500, 150), K(lunge("r").act("legl", "legr"), 650, 250), K(st(), 500, 200)]);
    mv("gen.pushup", "Piegamento sulle braccia: corpo dritto, petto vicino a terra, gomiti a 45 gradi", [K(plank(), 300, 200), K(pushDown().act("arml", "armr"), 600, 150), K(plank(), 450, 300)]);
    const pkn = () => plank().set("pel", [-0.25, 0.33, 0]).footAt("l", [-0.95, 0.3, -0.1], 180, -10).footAt("r", [-0.95, 0.3, 0.1], 180, -10).knee("l", [0, -1, 0]).knee("r", [0, -1, 0]);
    const pknD = () => pkn().set("pel", [-0.25, 0.24, 0]).set("chest", [0.18, 0.2, 0]).set("head", [0.4, 0.24, 0]).elbow("l", [-1, 0.4, -0.8]).elbow("r", [-1, 0.4, 0.8]);
    mv("gen.pushupKnees", "Piegamento sulle ginocchia (più facile)", [K(pkn(), 300, 200), K(pknD().act("arml", "armr"), 600, 150), K(pkn(), 450, 300)]);
    mv("gen.plank", "Plank: in appoggio sulle mani, corpo dritto dalla testa ai talloni", [K(plank().act("torso"), 400, 1400)]);
    mv("gen.plankForearm", "Plank sugli avambracci, addome contratto", [K(plank({ forearms: true }).act("torso"), 400, 1400)]);
    const sp = st();
    sp.set("pel", [-0.18, 0.36, 0]).set("chest", [0.3, 0.52, 0]).set("head", [0.49, 0.58, 0]).set("hipYaw", 0).set("chestYaw", 0).set("chestRoll", -90).set("hipRoll", -90);
    sp.footAt("l", [-1.0, 0.075, 0.0], 0, 0, 90).footAt("r", [-1.0, 0.17, 0.0], 0, 0, 90).handW("l", 0.3, 0.04, 0.28, "fist").handW("r", 0.3, 1.25, 0.0, "open").elbow("l", [0, -1, 0]).knee("l", [0, 0, 1]).knee("r", [0, 0, 1]);
    mv("gen.sidePlank", "Plank laterale: su un avambraccio, fianchi alti", [K(sp.act("torso"), 400, 1400)]);
    const sqH = squat(1).set("pel", [-0.15, 0.42, 0]).set("chest", [0.3, 0.62, 0]).set("head", [0.47, 0.72, 0]).handW("l", 0.36, 0.04, -0.17, "open").handW("r", 0.36, 0.04, 0.17, "open");
    mv("gen.burpee", "Burpee: giù con le mani a terra, gambe dietro in plank, ritorna e salta", [K(st(), 300, 100), K(sqH.act("legl", "legr"), 350, 80), K(plank().act("legl", "legr"), 300, 120), K(sqH, 300, 60), K(jump.copy().act("legl", "legr", "arml", "armr"), 260, 60), K(st(), 300, 200)]);
    const mcA = plank().footAt("l", [-0.2, 0.22, -0.1], 0, 30).knee("l", [0, -0.3, 0]);
    const mcB = plank().footAt("r", [-0.2, 0.22, 0.1], 0, 30).knee("r", [0, -0.3, 0]);
    mv("gen.mountain", "Mountain climber: in plank, porta le ginocchia al petto alternando", [K(plank(), 300, 50), K(mcA.act("legl"), 200, 30), K(mcB.act("legr"), 200, 30), K(mcA.act("legl"), 200, 30), K(mcB.act("legr"), 200, 100)]);
    const lb = lieBack({ kneesUp: true });
    const up = lieBack({ kneesUp: true }).set("pel", [0, 0.12, 0]).set("chest", [-0.1, 0.6, 0]).set("head", [-0.04, 0.8, 0]).handRel("l", 0.3, -0.05, -0.12, "open").handRel("r", 0.3, -0.05, 0.12, "open");
    mv("gen.situp", "Addominali: da sdraiato con le ginocchia piegate, sali fino a seduto", [K(lb.handHead("l", -0.05, 0.02, -0.14, "open").handHead("r", -0.05, 0.02, 0.14, "open").elbow("l", [0, 0.5, -1]).elbow("r", [0, 0.5, 1]), 300, 150), K(up.act("torso"), 600, 150), K(lb, 550, 200)]);
    const cr = lieBack({ kneesUp: true }).set("chest", [-0.44, 0.3, 0]).set("head", [-0.6, 0.42, 0]).handRel("l", 0.2, 0.05, -0.12, "open").handRel("r", 0.2, 0.05, 0.12, "open");
    mv("gen.crunch", "Crunch: stacca solo le spalle da terra, espira salendo", [K(lieBack({ kneesUp: true }), 300, 150), K(cr.act("torso"), 450, 200), K(lieBack({ kneesUp: true }), 450, 200)]);
    const lr = lieBack().footAt("l", [0.12, 0.9, -0.1], 0, -80).footAt("r", [0.12, 0.9, 0.1], 0, -80).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]);
    mv("gen.legRaise", "Sollevamento delle gambe da sdraiato, schiena a terra", [K(lieBack(), 300, 150), K(lr.act("legl", "legr"), 700, 200), K(lieBack(), 650, 200)]);
    const br = lieBack({ kneesUp: true }).set("pel", [0.05, 0.38, 0]).set("chest", [-0.42, 0.2, 0]).set("head", [-0.62, 0.14, 0]);
    mv("gen.bridge", "Ponte dei glutei: spingi i fianchi in alto, spalle a terra", [K(lieBack({ kneesUp: true }), 300, 150), K(br.act("torso", "legl", "legr"), 500, 400), K(lieBack({ kneesUp: true }), 450, 200)]);
    const sm = lieFront().set("chest", [0.5, 0.24, 0]).set("head", [0.72, 0.32, 0]).handW("l", 1.08, 0.3, -0.15, "open").handW("r", 1.08, 0.3, 0.15, "open").footAt("l", [-0.84, 0.24, -0.1], 180, 10, 180).footAt("r", [-0.84, 0.24, 0.1], 180, 10, 180);
    mv("gen.superman", "Superman: a pancia in giù, solleva braccia e gambe", [K(lieFront().handW("l", 1.05, 0.06, -0.15, "open").handW("r", 1.05, 0.06, 0.15, "open"), 300, 150), K(sm.act("torso", "arml", "armr", "legl", "legr"), 500, 500), K(lieFront().handW("l", 1.05, 0.06, -0.15, "open").handW("r", 1.05, 0.06, 0.15, "open"), 450, 200)]);
    const rt = (d) => { const b = sitLong().footAt("l", [0.45, 0.18, -0.1], 0, -10).footAt("r", [0.45, 0.18, 0.1], 0, -10).set("chest", [-0.22, 0.52, 0]).set("head", [-0.24, 0.73, 0]).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).twist(d); b.handRel("l", 0.35, -0.12, -0.04, "fist").handRel("r", 0.35, -0.12, 0.04, "fist"); return b.act("torso", "arml", "armr"); };
    mv("gen.russianTwist", "Torsioni da seduto: busto indietro, mani unite da un fianco all'altro", [K(rt(0), 300, 100), K(rt(50), 400, 150), K(rt(-50), 500, 150), K(rt(0), 400, 200)]);
    const ws = st().foot("l", 0.18, -0.15, 0, 0).foot("r", 0.18, 0.15, 0, 0).set("pel", [-0.25, 0.52, 0]).set("chest", [-0.26, 1.02, 0]).set("head", [-0.24, 1.22, 0]).handW("l", -0.02, 0.56, -0.17, "open").handW("r", -0.02, 0.56, 0.17, "open");
    mv("gen.wallSit", "Sedia al muro: schiena appoggiata, cosce parallele a terra, tieni", [K(ws.act("legl", "legr"), 400, 1400)]);
    const cu = st().heel("l", 40).heel("r", 40).sink(-0.07);
    mv("gen.calfRaise", "Sollevamenti sulle punte, piano e controllati", [K(st(), 300, 100), K(cu.act("legl", "legr"), 450, 250), K(st(), 450, 200)]);
    const bcA = allFours().set("pel", [-0.3, 0.6, 0]).footAt("l", [-0.48, ankleY(40), -0.12], 0, 40).footAt("r", [-0.72, ankleY(40), 0.12], 0, 40).handW("l", 0.22, 0.04, -0.18).handW("r", 0.42, 0.04, 0.18);
    const bcB = allFours().set("pel", [-0.3, 0.6, 0]).footAt("l", [-0.72, ankleY(40), -0.12], 0, 40).footAt("r", [-0.48, ankleY(40), 0.12], 0, 40).handW("l", 0.42, 0.04, -0.18).handW("r", 0.22, 0.04, 0.18);
    mv("gen.bearCrawl", "Camminata dell'orso: mani e piedi a terra, ginocchia staccate", [K(bcA.act("arml", "legr"), 300, 50), K(bcB.act("armr", "legl"), 300, 50), K(bcA.act("arml", "legr"), 300, 50), K(bcB.act("armr", "legl"), 300, 150)]);

    /* ---------------- allungamenti */
    const hs = st().foot("l", 0, -0.07, 5, 0).foot("r", 0, 0.07, -5, 0).set("pel", [-0.14, 0.92, 0]).set("chest", [0.22, 0.78, 0]).set("head", [0.3, 0.6, 0]).handW("l", 0.17, 0.26, -0.08, "open").handW("r", 0.17, 0.26, 0.08, "open").knee("l", [1, 0, 0]).knee("r", [1, 0, 0]);
    mv("gen.hamstring", "Allungamento dei femorali: gambe tese, busto in avanti, mani verso i piedi", [K(st(), 300, 100), K(hs.act("torso", "legl", "legr"), 800, 1200), K(st(), 700, 200)]);
    const sf = sitLong().set("chest", [0.42, 0.42, 0]).set("head", [0.58, 0.36, 0]).handW("l", 0.82, 0.12, -0.12, "open").handW("r", 0.82, 0.12, 0.12, "open");
    mv("gen.seatedFold", "Da seduto, gambe tese: porta il petto verso le ginocchia", [K(sitLong(), 300, 100), K(sf.act("torso"), 800, 1200), K(sitLong(), 700, 200)]);
    const qd = st().footAt("r", [-0.15, 0.9, 0.1], 180, -60).knee("r", [0, -1, 0]).handW("r", -0.17, 0.92, 0.13, "open").handW("l", 0.1, 1.15, -0.4, "open");
    mv("gen.quad", "Quadricipite: in equilibrio, tieni il piede e porta il tallone al gluteo", [K(st(), 300, 100), K(qd.act("legr"), 600, 1100), K(st(), 500, 200)]);
    const hf = st().foot("l", 0.48, -0.12, 0, 0).footAt("r", [-0.55, 0.06, 0.12], 180, 0).knee("r", [0, -1, 0]).set("pel", [-0.05, 0.48, 0]).set("chest", [-0.06, 0.98, 0]).set("head", [-0.05, 1.18, 0]).handW("l", 0.3, 0.56, -0.13, "open").handW("r", 0.3, 0.56, -0.02, "open");
    mv("gen.hipFlexor", "Flessori dell'anca: affondo con il ginocchio dietro a terra, spingi il bacino avanti", [K(st(), 300, 100), K(hf.act("legr", "torso"), 800, 1200), K(st(), 700, 200)]);
    const bf = sitLong().footAt("l", [0.38, 0.06, -0.04], 0, 0, -80).footAt("r", [0.38, 0.06, 0.04], 0, 0, 80).knee("l", [0, 0.3, -1]).knee("r", [0, 0.3, 1]).handW("l", 0.4, 0.12, -0.05, "open").handW("r", 0.4, 0.12, 0.05, "open").set("chest", [0.14, 0.6, 0]).set("head", [0.2, 0.8, 0]);
    mv("gen.butterfly", "Farfalla: da seduto, piante dei piedi unite, ginocchia verso terra", [K(sitLong(), 300, 100), K(bf.act("legl", "legr"), 700, 1200), K(sitLong(), 600, 200)]);
    const sd = sitLong().footAt("l", [0.55, 0.07, -0.62], 30, -80).footAt("r", [0.55, 0.07, 0.62], -30, -80).set("chest", [0.4, 0.45, 0]).set("head", [0.56, 0.42, 0]).handW("l", 0.72, 0.05, -0.12, "open").handW("r", 0.72, 0.05, 0.12, "open");
    mv("gen.straddle", "Gambe divaricate da seduto, busto in avanti", [K(sitLong(), 300, 100), K(sd.act("torso", "legl", "legr"), 800, 1200), K(sitLong(), 700, 200)]);
    const cf = st().foot("l", 0.32, -0.12, 0, 0).foot("r", -0.5, 0.12, 0, 0).set("pel", [-0.05, 0.86, 0]).set("chest", [0.2, 1.32, 0]).set("head", [0.3, 1.5, 0]).handW("l", 0.62, 1.32, -0.18, "open").handW("r", 0.62, 1.32, 0.18, "open").knee("r", [1, 0, 0]);
    mv("gen.calf", "Polpaccio: mani al muro, gamba dietro tesa con il tallone a terra", [K(st(), 300, 100), K(cf.act("legr"), 700, 1200), K(st(), 600, 200)]);
    const ss = st().handRel("r", 0.16, 0.02, -0.36, "open").handRel("l", 0.3, -0.05, -0.05, "open").elbow("r", [0, -0.3, 1]).elbow("l", [0, -1, 0]);
    mv("gen.shoulderStretch", "Spalla: braccio teso davanti al petto, l'altra mano spinge il gomito", [K(st(), 300, 100), K(ss.act("armr"), 600, 1200), K(st(), 500, 200)]);
    const tr = st().handHead("r", -0.13, -0.08, 0.0, "open").elbow("r", [0.2, 1, 0.2]).handHead("l", 0.0, 0.2, 0.06, "open").elbow("l", [0, 0, -1]);
    mv("gen.triceps", "Tricipite: mano dietro la nuca, l'altra mano tira il gomito", [K(st(), 300, 100), K(tr.act("armr"), 600, 1200), K(st(), 500, 200)]);
    const chs = st().handRel("l", -0.3, -0.46, -0.03, "open").handRel("r", -0.3, -0.46, 0.03, "open").lean(0.03).elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    mv("gen.chestStretch", "Petto: mani unite dietro la schiena, apri le spalle", [K(st(), 300, 100), K(chs.act("arml", "armr"), 600, 1200), K(st(), 500, 200)]);
    const cb = lieFront().set("chest", [0.42, 0.5, 0]).set("head", [0.56, 0.7, 0]).handW("l", 0.46, 0.04, -0.2, "open").handW("r", 0.46, 0.04, 0.2, "open").elbow("l", [-1, 0, -0.3]).elbow("r", [-1, 0, 0.3]);
    mv("gen.cobra", "Cobra: a pancia in giù, spingi con le mani e solleva il petto", [K(lieFront().handW("l", 0.46, 0.04, -0.22, "open").handW("r", 0.46, 0.04, 0.22, "open"), 300, 100), K(cb.act("torso"), 700, 1100), K(lieFront(), 600, 200)]);
    const chd = kneel().set("pel", [-0.3, 0.32, 0]).set("chest", [0.18, 0.22, 0]).set("head", [0.38, 0.12, 0]).handW("l", 0.7, 0.04, -0.15, "open").handW("r", 0.7, 0.04, 0.15, "open");
    mv("gen.child", "Posizione del bambino: seduto sui talloni, busto giù, braccia avanti", [K(kneel(), 300, 100), K(chd.act("torso"), 800, 1300), K(kneel(), 700, 200)]);
    const ltw = lieBack().footAt("r", [0.32, 0.12, -0.12], 0, 0).knee("r", [0, 0.2, -1]).handW("l", -0.45, 0.05, -0.62, "open").handW("r", -0.45, 0.05, 0.62, "open").set("hipRoll", 45);
    mv("gen.twistLying", "Torsione da sdraiato: ginocchio verso il lato opposto, spalle a terra", [K(lieBack().handW("l", -0.45, 0.05, -0.62, "open").handW("r", -0.45, 0.05, 0.62, "open"), 300, 100), K(ltw.act("legr", "torso"), 800, 1200), K(lieBack(), 700, 200)]);
    const dq = squat(1.2).foot("l", 0.02, -0.2, 25, 0).foot("r", 0.02, 0.2, -25, 0).handRel("l", 0.3, -0.18, -0.01, "open").handRel("r", 0.3, -0.18, 0.01, "open");
    mv("gen.deepSquat", "Accosciata profonda: talloni a terra, mani unite davanti, gomiti sulle ginocchia", [K(st(), 300, 100), K(dq.act("legl", "legr"), 900, 1200), K(st(), 800, 200)]);
    const slA = st().foot("l", 0, -0.55, 25, 0).foot("r", 0, 0.5, -5, 0).set("pel", [-0.06, 0.6, -0.32]).set("chest", [0.06, 1.08, -0.25]).set("head", [0.12, 1.27, -0.24]).knee("l", [1, 0, -0.6]).knee("r", [0, 1, 0.3]).handW("l", 0.25, 0.85, -0.3, "open").handW("r", 0.25, 0.85, -0.2, "open");
    mv("gen.sideLunge", "Affondo laterale: scendi su una gamba, l'altra tesa di lato", [K(st(), 300, 100), K(slA.act("legl", "legr"), 800, 900), K(st(), 700, 200)]);

    /* ---------------- respirazione */
    const bA = st().handRel("l", 0.16, -0.38, -0.05, "open").handRel("r", 0.16, -0.38, 0.06, "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
    const bB = bA.copy().set("chest", [0.0, 1.47, 0]).set("head", [0.01, 1.67, 0]).act("torso");
    mv("gen.breathe", "Respirazione profonda: inspira dal naso gonfiando la pancia, espira lento", [K(bA, 300, 300), K(bB, 1600, 400), K(bA, 2000, 400)]);
    const blA = lieBack({ kneesUp: true }).handW("l", -0.15, 0.26, -0.06, "open").handW("r", -0.42, 0.27, 0.06, "open").elbow("l", [0, 0.6, -1]).elbow("r", [0, 0.6, 1]);
    mv("gen.breatheLying", "Respirazione da sdraiato, una mano sulla pancia e una sul petto", [K(blA, 300, 300), K(blA.copy().set("pel", [0, 0.14, 0]).act("torso"), 1600, 400), K(blA, 2000, 400)]);
    const med = kneel().handW("l", 0.05, 0.42, -0.16, "open").handW("r", 0.05, 0.42, 0.16, "open");
    mv("gen.kneelBreath", "In ginocchio seduto sui talloni, respira con calma (saluto e concentrazione)", [K(med, 400, 400), K(med.copy().set("chest", [-0.14, 0.88, 0]).act("torso"), 1500, 300), K(med, 1800, 300)]);
    const bow = st().foot("l", 0, -0.06, 20, 0).foot("r", 0, 0.06, -20, 0).set("chest", [0.18, 1.39, 0]).set("head", [0.28, 1.53, 0]).handW("l", 0.06, 0.85, -0.2, "open").handW("r", 0.06, 0.85, 0.2, "open");
    mv("gen.bow", "Saluto: piedi uniti, inchino con lo sguardo avanti", [K(st().foot("l", 0, -0.06, 20, 0).foot("r", 0, 0.06, -20, 0), 300, 300), K(bow.act("torso"), 500, 500), K(st().foot("l", 0, -0.06, 20, 0).foot("r", 0, 0.06, -20, 0), 500, 300)]);

    /* ---------------- cadute e terra di base */
    const crouch = squat(1).handRel("l", 0.4, 0.05, -0.15, "open").handRel("r", 0.4, 0.05, 0.15, "open").set("head", [0.16, 1.18, 0]);
    const sitBack = st().set("pel", [-0.35, 0.14, 0]).set("chest", [-0.18, 0.6, 0]).set("head", [-0.06, 0.76, 0]).foot("l", 0.1, -0.15, 10, 0).foot("r", 0.1, 0.15, -10, 0).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).handRel("l", 0.35, 0.0, -0.15, "open").handRel("r", 0.35, 0.0, 0.15, "open");
    const backSlap = lieBack().set("pel", [-0.35, 0.16, 0]).set("chest", [-0.82, 0.18, 0]).set("head", [-0.98, 0.32, 0]).footAt("l", [0.05, 0.55, -0.12], 0, -30).footAt("r", [0.05, 0.55, 0.12], 0, -30).knee("l", [1, 1, 0]).knee("r", [1, 1, 0]).handW("l", -0.5, 0.04, -0.6, "open").handW("r", -0.5, 0.04, 0.6, "open");
    mv("gen.fallBack", "Caduta indietro: scendi accucciato, mento al petto, rotola sulla schiena e batti le braccia a terra", [K(st(), 300, 100), K(crouch.act("legl", "legr"), 400, 100), K(sitBack.act("torso"), 350, 50), K(backSlap.act("arml", "armr"), 300, 600), K(sitBack, 600, 100), K(st(), 700, 200)]);
    const sideSit = st().set("pel", [-0.05, 0.14, 0.15]).set("chest", [-0.05, 0.6, -0.05]).set("head", [-0.02, 0.78, -0.08]).foot("l", 0.2, -0.2, 10, 0).footAt("r", [0.25, 0.1, -0.3], 0, -40).knee("r", [1, 1, 0]).knee("l", [0, 1, 0]).handRel("l", 0.3, 0.05, -0.1, "open").handW("r", -0.1, 0.1, 0.35, "open");
    const sideSlap = st().set("pel", [-0.02, 0.14, 0.2]).set("chest", [-0.02, 0.16, 0.7]).set("head", [-0.02, 0.24, 0.92]).set("hipRoll", -45).set("chestRoll", -45).footAt("l", [0.35, 0.45, -0.25], 0, -30).footAt("r", [0.42, 0.25, 0.1], 0, -30).knee("l", [0.5, 1, 0]).knee("r", [1, 0.5, 0]).handW("r", 0.25, 0.04, 0.92, "open").handW("l", 0.35, 0.55, 0.35, "fist");
    mv("gen.fallSide", "Caduta laterale: la gamba scivola avanti, scendi di fianco e batti il braccio a terra", [K(st(), 300, 100), K(crouch.copy().act("legr"), 400, 100), K(sideSit.act("legr", "torso"), 350, 50), K(sideSlap.act("armr"), 300, 600), K(sideSit, 600, 100), K(st(), 700, 200)]);
    const rf1 = sqH.copy();
    const rf2 = st().set("pel", [0.15, 0.75, 0]).set("chest", [0.42, 0.35, 0]).set("head", [0.55, 0.2, 0]).footAt("l", [-0.15, ankleY(35), -0.15], 0, 35).footAt("r", [-0.15, ankleY(35), 0.15], 0, 35).handW("l", 0.45, 0.04, -0.2, "open").handW("r", 0.45, 0.04, 0.2, "open").knee("l", [1, 0, 0]).knee("r", [1, 0, 0]).elbow("l", [-1, 0, -0.5]).elbow("r", [-1, 0, 0.5]);
    const rf3 = st().set("pel", [0.9, 0.36, 0]).set("chest", [0.55, 0.16, 0]).set("head", [0.4, 0.22, 0]).footAt("l", [0.68, 0.78, -0.12], 180, 20).footAt("r", [0.68, 0.78, 0.12], 180, 20).knee("l", [-0.4, 1, 0]).knee("r", [-0.4, 1, 0]).handW("l", 0.72, 0.62, -0.18, "open").handW("r", 0.72, 0.62, 0.18, "open");
    const rf4 = st().set("pel", [0.95, 0.2, 0]).set("chest", [1.05, 0.67, 0]).set("head", [1.15, 0.85, 0]).foot("l", 1.38, -0.12, 0, 0).foot("r", 1.38, 0.12, 0, 0).knee("l", [1, 1, 0]).knee("r", [1, 1, 0]).handRel("l", 0.35, 0.0, -0.15, "open").handRel("r", 0.35, 0.0, 0.15, "open");
    const rf5 = squat(1).move(1.3).handRel("l", 0.4, 0.0, -0.15, "open").handRel("r", 0.4, 0.0, 0.15, "open");
    mv("gen.rollFwd", "Capriola avanti: mani a terra, mento al petto, rotola sulla schiena e torna accucciato", [K(st(), 300, 100), K(rf1.act("arml", "armr"), 400, 80), K(rf2.act("torso", "head"), 380, 40), K(rf3.act("torso"), 380, 40), K(rf4.act("torso"), 350, 60), K(rf5.act("legl", "legr"), 350, 400)]);
    const rb2 = sitBack.copy();
    const rb3 = st().set("pel", [-0.6, 0.55, 0]).set("chest", [-0.82, 0.15, 0]).set("head", [-1.0, 0.12, 0]).footAt("l", [-1.0, 0.72, -0.12], 0, -20).footAt("r", [-1.0, 0.72, 0.12], 0, -20).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).handW("l", -0.95, 0.04, -0.2, "open").handW("r", -0.95, 0.04, 0.2, "open").elbow("l", [0, 1, -0.3]).elbow("r", [0, 1, 0.3]);
    const rb4 = st().set("pel", [-1.1, 0.55, 0]).set("chest", [-0.75, 0.25, 0]).set("head", [-0.6, 0.2, 0]).footAt("l", [-1.45, ankleY(40), -0.14], 180, 40).footAt("r", [-1.45, ankleY(40), 0.14], 180, 40).knee("l", [-1, 0, 0]).knee("r", [-1, 0, 0]).handW("l", -0.7, 0.04, -0.2, "open").handW("r", -0.7, 0.04, 0.2, "open").elbow("l", [1, 0.3, -0.5]).elbow("r", [1, 0.3, 0.5]);
    const rb5 = squat(0.8).move(-1.3);
    mv("gen.rollBack", "Capriola indietro: siediti, rotola sulle spalle con le mani accanto alla testa e spingi", [K(st(), 300, 100), K(crouch, 400, 80), K(rb2.act("torso"), 350, 40), K(rb3.act("torso", "arml", "armr"), 380, 40), K(rb4.act("legl", "legr"), 380, 60), K(rb5, 380, 400)]);
    const ts1 = st().set("pel", [0, 0.14, 0]).set("chest", [-0.2, 0.56, 0]).set("head", [-0.12, 0.74, 0]).foot("l", 0.42, -0.12, 0, 0).footAt("r", [0.55, 0.06, 0.18], 0, -70).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).handW("r", -0.38, 0.04, 0.24, "open").handHead("l", 0.2, -0.05, -0.05, "fist");
    const ts2 = ts1.copy().set("pel", [0.02, 0.36, 0.05]).set("chest", [-0.32, 0.6, 0.1]).set("head", [-0.26, 0.79, 0.08]).handW("r", -0.42, 0.04, 0.3, "open").footAt("r", [-0.75, 0.07, 0.15], 180, -60).knee("r", [0, -1, 0]);
    const ts3 = boxGuardLike(st().move(-0.45));
    function boxGuardLike(b) { return b.foot("l", 0.2, -0.1, -8, 0).foot("r", -0.3, 0.15, -45, 18).set("pel", [-0.48, 0.9, 0.03]).set("chest", [-0.42, 1.38, 0.03]).set("head", [-0.37, 1.57, 0.02]).set("hipYaw", -40).set("chestYaw", -42).guard("box"); }
    mv("gen.techStand", "Rialzata tecnica: mano dietro a terra, l'altra a proteggere il viso, solleva i fianchi e porta la gamba dietro", [K(ts1, 300, 300), K(ts2.act("legr", "armr"), 450, 150), K(ts3.act("legl", "legr"), 450, 400)]);
    const sh1 = lieBack({ kneesUp: true }).handW("l", -0.2, 0.3, -0.05, "open").handW("r", -0.2, 0.32, 0.12, "open");
    const sh2 = lieBack({ kneesUp: true }).set("pel", [-0.25, 0.14, 0.05]).set("chest", [-0.7, 0.16, -0.12]).set("head", [-0.92, 0.18, -0.15]).set("hipRoll", -60).set("chestRoll", -45).footAt("r", [0.15, 0.08, 0.12], 0, 0).footAt("l", [0.3, 0.1, -0.05], 0, 0).knee("l", [0.2, 1, -1]).knee("r", [0.2, 1, -0.8]).handW("l", -0.45, 0.3, -0.1, "open").handW("r", -0.4, 0.36, 0.0, "open");
    mv("gen.shrimp", "Fuga d'anca (gambero): da sdraiato, spingi con il piede, gira sul fianco e sposta i fianchi indietro", [K(sh1, 300, 200), K(sh2.act("torso", "legr"), 500, 300), K(sh1, 500, 200)]);
    const bu = lieBack({ kneesUp: true }).set("pel", [0.05, 0.42, 0.05]).set("chest", [-0.45, 0.22, -0.1]).set("head", [-0.64, 0.16, -0.12]).set("hipRoll", -35).set("chestRoll", -30).handW("l", -0.3, 0.2, -0.32, "open").handW("r", -0.2, 0.3, -0.1, "open");
    mv("gen.bridgeRoll", "Ponte e rotolamento (upa): fianchi in alto verso una spalla, poi gira", [K(lieBack({ kneesUp: true }), 300, 200), K(bu.act("torso", "legl", "legr"), 450, 350), K(lieBack({ kneesUp: true }), 450, 200)]);
  });
})(typeof window !== "undefined" ? window : globalThis);
