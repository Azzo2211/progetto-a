/*
 * Progetto A - Difesa: movimenti del Systema (prefisso "systema.").
 * Posizione naturale e rilassata, mani basse e morbide; respiro naso-bocca, i quattro esercizi base
 * lentissimi (piegamenti sui pugni, squat, gambe, addominali), cadute e capriole morbide, movimento
 * a terra, colpi corti senza caricare, uscite dalla linea, onde, alzate di sicurezza e bastone corto.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { mv, K, standing, natural, squat, plank, lieBack, lieFront, allFours, kneel, add, ankleY, BAG } = L;

    /* ================================================================ aiuti */
    const g = natural(); // posizione pronta del Systema
    const st = () => standing();
    // piedi alla larghezza delle spalle, braccia lungo i fianchi
    const par = () => standing().foot("l", 0, -0.15, 8, 0).foot("r", 0, 0.15, -8, 0);
    // posa ruotata attorno all'origine (gradi, positivo = verso sinistra) e poi spostata
    const place = (b, x, z, yaw) => b.copy().spin(yaw || 0).move(x || 0, z || 0);
    // petto che si gonfia appena (inspirazione) o si svuota (espirazione)
    const inhale = (b, k = 1) => b.copy().set("chest", add(b.p.chest, [0.012 * k, 0.018 * k, 0])).set("head", add(b.p.head, [0.012 * k, 0.018 * k, 0]));
    const exhale = (b, k = 1) => b.copy().set("chest", add(b.p.chest, [-0.006 * k, -0.01 * k, 0])).set("head", add(b.p.head, [-0.004 * k, -0.012 * k, 0]));
    // mani rilassate davanti al petto
    const chestHands = (b) => b.handRel("l", 0.3, -0.24, -0.1, "open").handRel("r", 0.28, -0.26, 0.11, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    const gc = chestHands(natural()); // pronto con le mani davanti al petto
    const mirrorAll = (frames) => frames.map((f) => K(f.p.copy().mirror(), f.t, f.h, f.act ? f.act.map((a) => a.replace(/(arm|leg)([lr])$/, (m, x, s) => x + (s === "l" ? "r" : "l"))) : f.act, f.partner ? f.partner.copy().mirror() : undefined));

    /* ================================================================ in piedi: pronto e respiro */
    mv("systema.ready", "Posizione naturale: piedi comodi, ginocchia morbide, mani basse e rilassate", [K(st(), 300, 200), K(g, 600, 900, ["legl", "legr"])]);
    mv("systema.stand", "Pronto e rilassato, respiro calmo", [K(g, 400, 1200)]);
    mv("systema.handsChest", "In piedi naturale, mani rilassate davanti al petto", [K(g, 300, 200), K(gc, 500, 900, ["arml", "armr"])]);
    mv("systema.breath", "Respiro: dentro dal naso (il busto si gonfia appena), fuori dalla bocca, lento", [K(g, 300, 300), K(inhale(g), 1500, 300, ["torso"]), K(exhale(g), 1900, 400, ["head"]), K(g, 400, 200)]);
    const tall = () => par().set("chest", [-0.005, 1.455, 0]).set("head", [-0.005, 1.66, 0]);
    mv("systema.breathTall", "Schiena dritta, nuca lunga, mento appena rientrato: respiro naso-bocca", [K(tall(), 300, 300), K(inhale(tall()), 1500, 300, ["torso"]), K(exhale(tall()), 1900, 300, ["head"]), K(tall(), 400, 200)]);
    const bIn = inhale(g, 0.8);
    const bOut = exhale(g, 1);
    mv("systema.burst", "Respiro a raffica: dentro corto dal naso, fuori corto dalla bocca, spalle ferme", [K(g, 300, 150), K(bIn, 150, 40, ["torso"]), K(bOut, 150, 40, ["head"]), K(bIn, 150, 40, ["torso"]), K(bOut, 150, 40, ["head"]), K(bIn, 150, 40, ["torso"]), K(bOut, 150, 40, ["head"]), K(g, 400, 400)]);
    mv("systema.breathLong", "Espirazione lunga dalla bocca: le spalle scendono, il corpo si scioglie", [K(g, 300, 200), K(inhale(g), 1000, 200, ["torso"]), K(exhale(g, 1.6).sink(0.02), 2200, 400, ["head", "torso"]), K(g, 500, 200)]);

    /* ================================================================ camminare */
    // passo di camminata, all'origine verso +x; lead = piede avanti
    function walkPose(lead, arms = "swing") {
      const ss = lead === "l" ? 1 : -1;
      const back = lead === "l" ? "r" : "l";
      const b = st().set("pel", [0, 0.93, 0]).set("chest", [0.02, 1.43, 0]).set("head", [0.04, 1.63, 0]);
      b.foot(lead, 0.17, -ss * 0.1, ss * 5, 0).foot(back, -0.17, ss * 0.1, ss * 5, 20);
      b.set("hipYaw", -ss * 6).set("chestYaw", ss * 4);
      if (arms === "swing") {
        b.handW(back, 0.13, 0.9, ss * 0.24, "open").handW(lead, -0.1, 0.89, -ss * 0.25, "open");
      } else if (arms === "shake") {
        b.handW(back, 0.08, 0.84 + 0.04 * ss, ss * 0.3, "open").handW(lead, 0.02, 0.88 - 0.04 * ss, -ss * 0.3, "open").elbow("l", [0, -1, -1]).elbow("r", [0, -1, 1]);
      } else if (arms === "chest") {
        chestHands(b);
      }
      return b;
    }
    const turnPose = () => st().foot("l", 0, -0.12, 10, 0).foot("r", 0, 0.12, -10, 0).sink(0.02);
    // camminata avanti e indietro: 3 passi, giro a sinistra, 3 passi, giro a destra (fine all'origine)
    function corridor(arms, breath) {
      const out = [K(g, 300, 100)];
      const step = 0.33;
      const A = (i) => (breath ? (i % 4 < 2 ? ["torso", "legl", "legr"] : ["legl", "legr"]) : ["legl", "legr"]);
      const br = (b, i) => (breath ? (i % 4 < 2 ? inhale(b, 0.9) : exhale(b, 0.7)) : b);
      let i = 0;
      ["l", "r", "l"].forEach((lead, k) => { out.push(K(br(place(walkPose(lead, arms), step * (k + 1), 0, 0), i), 380, 30, A(i))); i += 1; });
      out.push(K(br(place(turnPose(), 1.1, 0, 90), i), 320, 20, A(i))); i += 1;
      out.push(K(br(place(turnPose(), 1.1, 0, 180), i), 320, 20, A(i))); i += 1;
      ["r", "l", "r"].forEach((lead, k) => { out.push(K(br(place(walkPose(lead, arms), 1.1 - step * (k + 1), 0, 180), i), 380, 30, A(i))); i += 1; });
      out.push(K(br(place(turnPose(), 0.05, 0, 90), i), 320, 20, A(i))); i += 1;
      out.push(K(g, 340, 250));
      return out;
    }
    mv("systema.walkBreath", "Camminata col respiro: 2 passi inspiri dal naso, 2 passi espiri dalla bocca", corridor("swing", true));
    mv("systema.walk", "Camminata naturale avanti e indietro, schiena dritta, ginocchia morbide", corridor("swing", false));
    mv("systema.walkShake", "Cammina sciolto scuotendo le mani, spalle basse", corridor("shake", false));
    mv("systema.walkChest", "Cammina con le mani rilassate davanti al petto", corridor("chest", false));
    // camminata con cambi di direzione: avanti, a sinistra, mezzo giro, indietro (fine all'origine)
    (function () {
      const s = 0.3;
      const W = (lead, x, z, yaw, a = ["legl", "legr"]) => K(place(walkPose(lead), x, z, yaw), 360, 30, a);
      const T = (x, z, yaw) => K(place(turnPose().sink(0.04), x, z, yaw), 300, 40, ["legl", "legr", "torso"]);
      mv("systema.walkTurns", "Cammina e cambia direzione ogni pochi passi, girando con le ginocchia morbide", [
        K(g, 300, 100), W("l", s, 0, 0), W("r", 2 * s, 0, 0), T(0.75, 0, 90), W("l", 0.75, -s, 90), W("r", 0.75, -2 * s, 90),
        T(0.75, -0.72, -90), W("l", 0.75, -0.72 + s, -90), W("r", 0.75, -0.72 + 2 * s, -90), T(0.75, 0, -180), W("l", 0.75 - s, 0, -180), W("r", 0.75 - 2 * s, 0, -180), T(0.05, 0, -90), K(g, 340, 250)
      ]);
    })();
    // forma: due passi avanti e due indietro con la schiena dritta
    (function () {
      const a = (lead, x) => place(walkPose(lead), x, 0, 0).set("chest", [x - 0.005, 1.455, 0]).set("head", [x - 0.005, 1.66, 0]);
      mv("systema.formWalk", "Due passi avanti e due indietro mantenendo la forma: testa sopra il bacino", [K(tall(), 300, 150), K(a("l", 0.2), 400, 50, ["legl"]), K(a("r", 0.45), 400, 50, ["legr"]), K(a("l", 0.25), 420, 50, ["legl"]), K(a("r", 0.05), 420, 50, ["legr"]), K(tall(), 380, 300)]);
    })();

    /* ================================================================ sciogliere */
    const tw = (d) => { const b = par().twist(d).hips(d * 0.45); const s = d > 0 ? 1 : -1; // s>0: girato a sinistra
      // la mano che segue si avvolge sulla spalla opposta, l'altra batte dietro sul fianco
      const lead = s > 0 ? "r" : "l";
      const tail = s > 0 ? "l" : "r";
      b.handRel(lead, 0.17, -0.06, -s * 0.2, "open").handRel(tail, -0.16, -0.46, s * 0.2, "open");
      b.elbow(lead, [0, -0.4, -s]).elbow(tail, [-1, -0.5, 0]);
      return b.act("torso", "arml", "armr"); };
    mv("systema.swingArms", "Ruota il busto: le braccia molli si avvolgono e battono su spalle e fianchi", [K(par(), 300, 100), K(tw(-70), 420, 40), K(tw(70), 560, 40), K(tw(-70), 560, 40), K(tw(70), 560, 40), K(par(), 450, 200)]);
    const shA = st().sink(0.03).handW("l", 0.08, 0.86, -0.32, "open").handW("r", 0.0, 0.94, 0.28, "open").elbow("l", [0, -1, -1]).elbow("r", [0, -1, 1]).heel("l", 12).act("arml", "armr", "legl");
    const shB = st().sink(0.01).handW("l", 0.0, 0.95, -0.28, "open").handW("r", 0.09, 0.85, 0.32, "open").elbow("l", [0, -1, -1]).elbow("r", [0, -1, 1]).heel("r", 12).act("arml", "armr", "legr");
    const shC = st().sink(0.05).lean(0.02).handW("l", 0.12, 1.0, -0.3, "open").handW("r", 0.12, 1.0, 0.3, "open").elbow("l", [0, -1, -1]).elbow("r", [0, -1, 1]).act("arml", "armr", "torso", "legl", "legr");
    mv("systema.shake", "Scuoti tutto il corpo partendo dalle mani: braccia, spalle, gambe", [K(st(), 250, 50), K(shA, 120, 0), K(shB, 120, 0), K(shA, 120, 0), K(shB, 120, 0), K(shC, 130, 0), K(shA, 120, 0), K(shB, 120, 0), K(st(), 250, 200)]);
    // spalle su inspirando, giù espirando
    const shrug = par().set("chest", [0.0, 1.49, 0]).set("head", [0.01, 1.66, 0]).handW("l", 0.03, 0.95, -0.25).handW("r", 0.03, 0.95, 0.25);
    mv("systema.shoulderDrop", "Alza le spalle inspirando e lasciale cadere espirando", [K(par(), 300, 150), K(shrug.act("torso"), 900, 300), K(par().sink(0.01).act("arml", "armr"), 600, 500), K(par(), 300, 200)]);
    // onda di tensione in piedi: dai piedi alla testa, poi rilascio
    (function () {
      const p0 = par();
      const t1 = par().heel("l", 0).heel("r", 0).act("legl", "legr");
      const t2 = par().set("pel", [0.01, 0.95, 0]).act("legl", "legr", "torso");
      const t3 = t2.copy().handW("l", 0.03, 0.88, -0.27, "fist").handW("r", 0.03, 0.88, 0.27, "fist").act("legl", "legr", "torso", "arml", "armr");
      const t4 = t3.copy().set("chest", [0.0, 1.47, 0]).set("head", [0.0, 1.66, 0]).act("legl", "legr", "torso", "arml", "armr", "head");
      mv("systema.tensionStand", "Onda di tensione in piedi: dai piedi alla testa inspirando, poi rilascio", [K(p0, 300, 150), K(t1, 500, 200), K(t2, 500, 200), K(t3, 500, 200), K(t4, 500, 400), K(par().sink(0.02), 900, 400), K(p0, 400, 200)]);
    })();
    // paura: corpo che si irrigidisce
    const freeze = par().set("chest", [-0.01, 1.48, 0]).set("head", [0.0, 1.64, 0]).handW("l", 0.05, 0.95, -0.24, "fist").handW("r", 0.05, 0.95, 0.24, "fist").act("torso", "head", "arml", "armr");
    mv("systema.freeze", "Nota la paura nel corpo: fiato fermo, spalle alte, mani strette", [K(par(), 300, 200), K(freeze, 400, 1300), K(par(), 700, 300)]);
    mv("systema.fearRelease", "Espira lungo, poche raffiche, poi respiro lento: le spalle scendono", [K(freeze, 300, 300), K(exhale(par(), 1.5).sink(0.02).act("torso", "head"), 1500, 200), K(inhale(par(), 0.6), 150, 30, ["torso"]), K(exhale(par()), 150, 30, ["head"]), K(inhale(par(), 0.6), 150, 30, ["torso"]), K(exhale(par()), 150, 30, ["head"]), K(inhale(par()), 1100, 200, ["torso"]), K(par(), 1300, 300)]);
    // sguardo largo
    mv("systema.wideGaze", "Sguardo largo: fissa un punto e percepisci tutta la stanza", [K(g, 300, 300), K(g.copy().look(35).act("head"), 900, 300), K(g.copy().look(-35).act("head"), 1200, 300), K(g, 800, 400)]);

    /* ================================================================ a terra: sdraiato */
    const lieK = () => lieBack({ kneesUp: true }).handW("l", -0.15, 0.25, -0.05, "open").handW("r", -0.42, 0.27, 0.07, "open").elbow("l", [0, 0.6, -1]).elbow("r", [0, 0.6, 1]);
    const lieF = () => lieBack();
    mv("systema.lieKnees", "Sdraiato sulla schiena, ginocchia piegate, una mano sulla pancia e una sul petto", [K(lieK(), 400, 1100)]);
    mv("systema.lieFlat", "Sdraiato sulla schiena, braccia lungo i fianchi, gambe distese", [K(lieF(), 400, 1100)]);
    // respiro da sdraiato: prima la pancia (mano bassa), poi le costole (mano alta)
    (function () {
      const a = lieK();
      const b1 = a.copy().handW("l", -0.15, 0.29, -0.05).set("pel", [0, 0.135, 0]).act("torso");
      const b2 = b1.copy().set("chest", [-0.5, 0.15, 0]).handW("r", -0.42, 0.3, 0.07).act("torso");
      mv("systema.lieBreath", "Inspira dal naso: sale la mano sulla pancia, poi le costole; espira lento dalla bocca", [K(a, 300, 300), K(b1, 900, 100), K(b2, 700, 300), K(a.copy().act("head"), 2000, 400)]);
      const r1 = a.copy().act("head");
      const r2 = lieBack({ kneesUp: true }).handW("l", -0.05, 0.05, -0.32, "open").handW("r", -0.4, 0.05, 0.36, "open").elbow("l", [0, 0.4, -1]).elbow("r", [0, 0.4, 1]).act("arml", "armr");
      const r3 = r2.copy().footAt("l", [0.44, 0.08, -0.17], 0, 0).footAt("r", [0.44, 0.08, 0.17], 0, 0).knee("l", [0, 1, -0.5]).knee("r", [0, 1, 0.5]).act("legl", "legr");
      mv("systema.lieRelease", "A ogni espirazione una zona si scioglie: viso, braccia, gambe", [K(a, 300, 200), K(r1, 900, 300), K(r2, 1000, 300), K(r3, 1000, 400), K(a, 700, 200)]);
    })();
    // onde di tensione da sdraiato
    (function () {
      const f = lieF();
      const legs = f.copy().footAt("l", [0.88, 0.09, -0.12], 0, -55).footAt("r", [0.88, 0.09, 0.12], 0, -55);
      const w1 = legs.copy().act("legl", "legr");
      const w2 = legs.copy().act("legl", "legr", "torso");
      const arms = legs.copy().handW("l", -0.02, 0.07, -0.26, "fist").handW("r", -0.02, 0.07, 0.26, "fist").elbow("l", [0, 1, -0.3]).elbow("r", [0, 1, 0.3]);
      const w3 = arms.copy().act("legl", "legr", "torso", "arml", "armr");
      const w4 = arms.copy().set("head", [-0.71, 0.15, 0]).act("legl", "legr", "torso", "arml", "armr", "head");
      mv("systema.waveLying", "Onda di tensione: piedi, gambe, pancia, pugni, braccia, viso; poi lascia andare tutto", [K(f, 300, 200), K(w1, 500, 200), K(w2, 500, 200), K(w3, 500, 200), K(w4, 500, 500), K(f, 1300, 500)]);
      const d1 = f.copy().set("head", [-0.71, 0.15, 0]).act("head");
      const d2 = f.copy().set("head", [-0.71, 0.15, 0]).handW("l", -0.02, 0.07, -0.26, "fist").handW("r", -0.02, 0.07, 0.26, "fist").elbow("l", [0, 1, -0.3]).elbow("r", [0, 1, 0.3]).act("head", "arml", "armr");
      const d3 = d2.copy().act("head", "arml", "armr", "torso");
      mv("systema.waveLyingDown", "Onda di tensione dalla testa ai piedi, poi un'espirazione lunga che scioglie", [K(f, 300, 200), K(d1, 500, 200), K(d2, 500, 200), K(d3, 500, 200), K(w4, 500, 500), K(f, 1300, 500)]);
      const armR = f.copy().handW("r", 0.02, 0.16, 0.3, "fist").elbow("r", [0, 1, 0]).act("armr");
      const armL = f.copy().handW("l", 0.02, 0.16, -0.3, "fist").elbow("l", [0, 1, 0]).act("arml");
      const legR = f.copy().footAt("r", [0.86, 0.2, 0.12], 0, -55).act("legr");
      const legL = f.copy().footAt("l", [0.86, 0.2, -0.12], 0, -55).act("legl");
      mv("systema.tenseLimbs", "Tendi un solo arto alla volta respirando, il resto del corpo resta molle", [K(f, 300, 150), K(armR, 500, 900), K(f, 600, 200), K(armL, 500, 900), K(f, 600, 200), K(legR, 500, 900), K(f, 600, 200), K(legL, 500, 900), K(f, 600, 200)]);
      mv("systema.tenseArmR", "Braccio destro teso al massimo, viso e spalle molli; poi rilascio espirando", [K(f, 300, 200), K(armR, 600, 1500), K(f, 900, 400)]);
      mv("systema.scanLying", "Scansione: a ogni espirazione si scioglie una zona, dai piedi alla testa", [K(f, 300, 200), K(f.copy().act("legl", "legr"), 700, 500), K(f.copy().act("torso"), 700, 500), K(f.copy().act("arml", "armr"), 700, 500), K(f.copy().act("head"), 700, 500), K(f, 600, 200)]);
      mv("systema.heavyLying", "Corpo pesante sul tappeto: a ogni espirazione il peso aumenta", [K(f, 300, 200), K(f.copy().sink(0.01).act("torso", "legl", "legr", "arml", "armr"), 1800, 600), K(f, 1500, 300)]);
      const lr3 = f.copy().act("torso");
      mv("systema.lieBreathLong", "Sdraiato: inspira dal naso in 3, espira dalla bocca in 6, senza pause", [K(f, 300, 200), K(lr3.copy().set("chest", [-0.5, 0.15, 0]), 1500, 100), K(f.copy().act("head"), 2600, 300)]);
    })();
    // seduto a gambe incrociate, schiena dritta
    const sitX = () => {
      const b = st();
      b.set("pel", [0, 0.14, 0]).set("chest", [0.02, 0.64, 0]).set("head", [0.04, 0.84, 0]);
      b.footAt("l", [0.3, 0.08, 0.14], -30, 0, -60).footAt("r", [0.36, 0.08, -0.12], 30, 0, 60);
      b.knee("l", [0.4, 0.3, -1]).knee("r", [0.4, 0.3, 1]);
      b.handW("l", 0.3, 0.2, -0.3, "open").handW("r", 0.3, 0.2, 0.3, "open").elbow("l", [-0.3, -1, -0.5]).elbow("r", [-0.3, -1, 0.5]);
      return b;
    };
    mv("systema.sitBreath", "Seduto a gambe incrociate, schiena dritta: respiri lenti", [K(sitX(), 300, 300), K(inhale(sitX()).act("torso"), 1500, 300), K(exhale(sitX()).act("head"), 1900, 300), K(sitX(), 400, 200)]);
    // dallo sdraiato al seduto passando sul fianco
    (function () {
      const f = lieF();
      const side = st().set("pel", [-0.02, 0.17, 0.02]).set("chest", [-0.48, 0.2, 0.08]).set("head", [-0.68, 0.24, 0.1]).set("hipRoll", -80).set("chestRoll", -80);
      side.footAt("l", [0.42, 0.24, 0.06], 0, -10, -80).footAt("r", [0.48, 0.1, 0.16], 0, -10, -80).knee("l", [1, 0.2, 0.2]).knee("r", [1, 0, 0.2]);
      side.handW("l", -0.3, 0.06, 0.32, "open").handW("r", -0.6, 0.06, 0.32, "open").elbow("l", [0, 1, 0]).elbow("r", [0, -0.2, 1]);
      const hipSit = st().set("pel", [-0.05, 0.15, 0.08]).set("chest", [-0.03, 0.62, -0.06]).set("head", [-0.01, 0.82, -0.08]).set("hipRoll", -20).set("chestRoll", -8);
      hipSit.footAt("l", [0.38, 0.08, 0.02], -20, 0, -70).footAt("r", [0.15, 0.08, 0.42], -60, 0, -80).knee("l", [0.6, 1, -0.4]).knee("r", [0.3, 0.3, 1]);
      hipSit.handW("r", -0.22, 0.04, 0.32, "open").handW("l", 0.28, 0.3, -0.1, "open").elbow("r", [-1, 0, 0.5]);
      mv("systema.rollToSit", "Rotola sul fianco e vai seduto, poi siedi a schiena dritta", [K(f, 300, 200), K(side.act("torso", "legl", "legr"), 700, 200), K(hipSit.act("torso", "armr"), 700, 200), K(sitX(), 700, 400)]);
    })();
  });
})(typeof window !== "undefined" ? window : globalThis);
