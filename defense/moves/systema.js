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
    const { mv, K, standing, natural, squat, plank, lieBack, lieFront, allFours, kneel, add, sub, mul, norm, len, ankleY, ARM, BAG } = L;
    // mano d'appoggio: se la spalla e' troppo lontana, il busto si avvicina al punto (frac del braccio)
    const reach = (b, s, frac = 0.97) => {
      const d = sub(b.p.hand[s], b.sh(s));
      const L0 = len(d);
      if (L0 > ARM * frac) { const m = mul(norm(d), L0 - ARM * frac); b.p.chest = add(b.p.chest, m); b.p.head = add(b.p.head, m); }
      return b;
    };
    // mano libera: se e' troppo lontana, si avvicina alla spalla
    const clampH = (b, frac = 0.98) => {
      ["l", "r"].forEach((s) => {
        if (!b.p.hand[s]) return;
        const sh = b.sh(s);
        const d = sub(b.p.hand[s], sh);
        if (len(d) > ARM * frac) b.p.hand[s] = add(sh, mul(norm(d), ARM * frac));
      });
      return b;
    };

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
        b.handRel(back, 0.12, -0.5 + 0.06 * ss, ss * 0.26, "open").handRel(lead, 0.04, -0.46 - 0.06 * ss, -ss * 0.27, "open").elbow("l", [-0.3, -1, -0.6]).elbow("r", [-0.3, -1, 0.6]);
      } else if (arms === "chest") {
        chestHands(b);
      }
      return b;
    }
    const turnPose = () => st().foot("l", 0, -0.12, 10, 0).foot("r", 0, 0.12, -10, 0).sink(0.02);
    // camminata avanti e indietro: 3 passi, giro a sinistra, 3 passi, giro a destra (fine all'origine)
    function corridor(arms, breath) {
      // breath = [passi inspirando, passi espirando] oppure false
      const out = [K(g, 300, 100)];
      const step = 0.33;
      const cyc = breath ? breath[0] + breath[1] : 1;
      const isIn = (i) => breath && i % cyc < breath[0];
      const A = (i) => (breath ? (isIn(i) ? ["torso", "legl", "legr"] : ["head", "legl", "legr"]) : ["legl", "legr"]);
      const circ = [[0.03, 0.0], [0.0, 0.03], [-0.03, 0.0], [0.0, -0.02]];
      const br = (b0, i) => {
        let b = breath ? (isIn(i) ? inhale(b0, 0.9) : exhale(b0, 0.7)) : b0;
        if (arms === "circle") { const fr = b.frame(); const c = circ[i % 4]; const d = add(mul(fr.fwd, c[0]), [0, c[1], 0]); b = b.copy().set("chest", add(b.p.chest, d)).set("head", add(b.p.head, mul(d, 0.6))); }
        return b;
      };
      let i = 0;
      ["l", "r", "l"].forEach((lead, k) => { out.push(K(br(place(walkPose(lead, arms), step * (k + 1), 0, 0), i), 380, 30, A(i))); i += 1; });
      out.push(K(br(place(turnPose(), 1.1, 0, 90), i), 320, 20, A(i))); i += 1;
      out.push(K(br(place(turnPose(), 1.1, 0, 180), i), 320, 20, A(i))); i += 1;
      ["r", "l", "r"].forEach((lead, k) => { out.push(K(br(place(walkPose(lead, arms), 1.1 - step * (k + 1), 0, 180), i), 380, 30, A(i))); i += 1; });
      out.push(K(br(place(turnPose(), 0.05, 0, 90), i), 320, 20, A(i))); i += 1;
      out.push(K(g, 340, 250));
      return out;
    }
    mv("systema.walkBreath", "Camminata col respiro: 2 passi inspiri dal naso, 2 passi espiri dalla bocca", corridor("swing", [2, 2]));
    mv("systema.walkBreath1", "Scala del respiro: inspira dal naso per 1 passo, espira dalla bocca per 1 passo", corridor("swing", [1, 1]));
    mv("systema.walkBreath3", "Scala del respiro: 3 passi inspirando, 3 passi espirando", corridor("swing", [3, 3]));
    mv("systema.walkBreath24", "Inspira in 2 passi e allunga l'espirazione a 4 passi", corridor("swing", [2, 4]));
    mv("systema.walkShoulders", "Cammina col respiro 2:2 facendo grandi cerchi con le spalle, braccia molli", corridor("circle", [2, 2]));
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
      return clampH(b).act("torso", "arml", "armr"); };
    mv("systema.swingArms", "Ruota il busto: le braccia molli si avvolgono e battono su spalle e fianchi", [K(par(), 300, 100), K(tw(-70), 420, 40), K(tw(70), 560, 40), K(tw(-70), 560, 40), K(tw(70), 560, 40), K(par(), 450, 200)]);
    const shA = st().sink(0.03).handW("l", 0.08, 0.86, -0.32, "open").handW("r", 0.0, 0.94, 0.28, "open").elbow("l", [0, -1, -1]).elbow("r", [0, -1, 1]).heel("l", 12).act("arml", "armr", "legl");
    clampH(shA);
    const shB = st().sink(0.01).handW("l", 0.0, 0.95, -0.28, "open").handW("r", 0.09, 0.85, 0.32, "open").elbow("l", [0, -1, -1]).elbow("r", [0, -1, 1]).heel("r", 12).act("arml", "armr", "legr");
    clampH(shB);
    const shC = st().sink(0.05).lean(0.02).handW("l", 0.12, 1.0, -0.3, "open").handW("r", 0.12, 1.0, 0.3, "open").elbow("l", [0, -1, -1]).elbow("r", [0, -1, 1]).act("arml", "armr", "torso", "legl", "legr");
    clampH(shC);
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
      const t4 = clampH(t3.copy().set("chest", [0.0, 1.47, 0]).set("head", [0.0, 1.66, 0])).act("legl", "legr", "torso", "arml", "armr", "head");
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
      const r2 = lieBack({ kneesUp: true }).handW("l", -0.1, 0.05, -0.34, "open").handW("r", -0.1, 0.05, 0.34, "open").elbow("l", [0, 0.3, -1]).elbow("r", [0, 0.3, 1]).act("arml", "armr");
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
      mv("systema.tenseLimbs", "Tendi un solo arto alla volta respirando, il resto del corpo resta molle", [K(f, 300, 100), K(armR, 450, 650), K(f, 500, 100), K(armL, 450, 650), K(f, 500, 100), K(legR, 450, 650), K(f, 500, 100), K(legL, 450, 650), K(f, 500, 150)]);
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

    /* ================================================================ i quattro esercizi base */
    // squat lento: piedi alla larghezza delle spalle, punte appena aperte, braccia avanti rilassate
    const sqS = () => st().foot("l", 0, -0.17, 15, 0).foot("r", 0, 0.17, -15, 0).handRel("l", 0.36, -0.2, -0.14, "open").handRel("r", 0.36, -0.2, 0.14, "open").elbow("l", [0, -1, -0.2]).elbow("r", [0, -1, 0.2]);
    const sqB = () => squat(1).set("pel", [-0.13, 0.53, 0]).set("chest", [0.08, 0.99, 0]).set("head", [0.15, 1.18, 0]).handRel("l", 0.42, -0.04, -0.14, "open").handRel("r", 0.42, -0.04, 0.14, "open").elbow("l", [0, -1, -0.2]).elbow("r", [0, -1, 0.2]);
    const sqM = () => squat(0.55).handRel("l", 0.4, -0.12, -0.14, "open").handRel("r", 0.4, -0.12, 0.14, "open").elbow("l", [0, -1, -0.2]).elbow("r", [0, -1, 0.2]);
    mv("systema.squatStance", "Piedi alla larghezza delle spalle, punte appena aperte, braccia avanti rilassate", [K(st(), 300, 200), K(sqS(), 600, 900, ["legl", "legr", "arml", "armr"])]);
    mv("systema.slowSquat", "Squat lento: scendi inspirando dal naso, sali espirando dalla bocca, senza fermarti in basso", [K(sqS(), 300, 200), K(sqB().act("legl", "legr", "torso"), 2600, 0), K(sqS().act("legl", "legr", "head"), 2600, 300)]);
    mv("systema.slowSquatRev", "Squat lento al contrario: scendi espirando, sali inspirando", [K(sqS(), 300, 200), K(sqB().act("legl", "legr", "head"), 2600, 0), K(sqS().act("legl", "legr", "torso"), 2600, 300)]);
    mv("systema.squatVerySlow", "Squat lentissimo: velocità uguale in discesa e in salita, talloni a terra, respiro libero", [K(sqS(), 300, 200), K(sqM().act("legl", "legr"), 1800, 0), K(sqB().act("legl", "legr"), 1800, 0), K(sqM().act("legl", "legr"), 1800, 0), K(sqS(), 1800, 300)]);
    mv("systema.squatHold", "Tenuta in squat basso respirando, schiena un pezzo solo", [K(sqS(), 300, 100), K(sqB().act("legl", "legr"), 900, 2200), K(sqS(), 900, 200)]);
    mv("systema.squatFast", "Squat a ritmo sostenuto, schiena dritta, per alzare il battito", [K(sqS(), 250, 50), K(sqB().act("legl", "legr"), 420, 40), K(sqS(), 380, 40), K(sqB().act("legl", "legr"), 420, 40), K(sqS(), 380, 40), K(sqB().act("legl", "legr"), 420, 40), K(sqS(), 380, 150)]);
    const sqT = (d) => { const b = sqB().twist(d).hips(d * 0.2); const s = d > 0 ? 1 : -1; b.handRel("l", 0.25, -0.3, -0.18 - 0.05 * s, "open").handRel("r", 0.25, -0.3, 0.18 - 0.05 * s, "open"); return b.act("torso", "arml", "armr"); };
    mv("systema.squatTwist", "Squat lento: in basso ruota il busto a destra e a sinistra, braccia rilassate, poi risali", [K(sqS(), 300, 150), K(sqB().act("legl", "legr"), 1800, 100), K(sqT(-45), 900, 200), K(sqT(45), 1300, 200), K(sqB(), 900, 0), K(sqS().act("legl", "legr"), 1800, 300)]);
    // accosciata e risalita, mani morbide
    const crouch = () => squat(1.1).set("head", [0.17, 1.17, 0]).handRel("l", 0.4, -0.05, -0.14, "open").handRel("r", 0.4, -0.05, 0.14, "open").elbow("l", [0, -1, -0.2]).elbow("r", [0, -1, 0.2]);
    mv("systema.crouchRise", "Scendi in accosciata e risali senza fermare il respiro", [K(g, 300, 150), K(crouch().act("legl", "legr"), 1100, 200), K(g.copy().act("legl", "legr"), 1100, 300)]);

    // piegamenti sui pugni
    const fistHands = (b, x = 0.2) => b.handW("l", x, 0.06, -0.18, "fist").handW("r", x, 0.06, 0.18, "fist");
    const af = () => fistHands(allFours(), 0.22).elbow("l", [-1, 0, -0.1]).elbow("r", [-1, 0, 0.1]);
    const bodyShift = (b, dx, dz) => { const h = b.p.hand; return b.shift(dx, dz).set("hand", h); };
    mv("systema.fistFours", "In quadrupedia sui pugni: prime due nocche a terra, polso dritto", [K(allFours(), 300, 200), K(af().act("arml", "armr"), 600, 1000)]);
    mv("systema.fistShift", "Sui pugni in quadrupedia: sposta piano il peso avanti, indietro e di lato", [K(af(), 300, 150), K(bodyShift(af(), 0.08, 0).act("arml", "armr"), 800, 200), K(bodyShift(af(), -0.1, 0).act("legl", "legr"), 1000, 200), K(bodyShift(af(), 0, -0.07).act("arml"), 900, 200), K(bodyShift(af(), 0, 0.07).act("armr"), 1000, 200), K(af(), 700, 200)]);
    const fp = () => fistHands(plank()).elbow("l", [-1, 0, -0.2]).elbow("r", [-1, 0, 0.2]);
    const fpDown = () => fistHands(plank()).set("pel", [-0.3, 0.2, 0]).set("chest", [0.18, 0.24, 0]).set("head", [0.4, 0.28, 0]).footAt("l", [-1.13, ankleY(62), -0.1], 0, 62).footAt("r", [-1.13, ankleY(62), 0.1], 0, 62).elbow("l", [-1, 0.4, -0.7]).elbow("r", [-1, 0.4, 0.7]);
    const fpHalf = () => fistHands(plank()).set("pel", [-0.3, 0.28, 0]).set("chest", [0.18, 0.41, 0]).set("head", [0.4, 0.47, 0]).footAt("l", [-1.12, ankleY(62), -0.1], 0, 62).footAt("r", [-1.12, ankleY(62), 0.1], 0, 62).elbow("l", [-1, 0.3, -0.6]).elbow("r", [-1, 0.3, 0.6]);
    mv("systema.fistKneesUp", "Dalla quadrupedia sui pugni solleva le ginocchia a gambe distese, poi riappoggia", [K(af(), 300, 200), K(fp().act("legl", "legr"), 700, 1300), K(af(), 700, 300)]);
    mv("systema.fistPlank", "Posizione sui pugni: mani sotto le spalle, corpo dritto come una tavola", [K(af(), 300, 150), K(fp().act("torso", "arml", "armr"), 700, 1200)]);
    mv("systema.fistHold", "Tenuta sui pugni: respira e sciogli viso, collo, pancia e gambe", [K(fp(), 300, 200), K(fp().act("head"), 600, 500), K(fp().act("torso"), 600, 500), K(fp().act("legl", "legr"), 600, 500), K(fp(), 600, 300)]);
    mv("systema.fistHalfHold", "Tenuta a braccia piegate a metà, corpo a tavola, respiro continuo", [K(fp(), 300, 150), K(fpHalf().act("arml", "armr"), 900, 2000), K(fp(), 900, 200)]);
    mv("systema.fistPushup", "Piegamento sui pugni lento: scendi inspirando, sali espirando, corpo a tavola", [K(fp(), 300, 200), K(fpDown().act("arml", "armr", "torso"), 2400, 0), K(fp().act("arml", "armr", "head"), 2400, 300)]);
    mv("systema.fistPushupRev", "Piegamento sui pugni al contrario: scendi espirando, sali inspirando", [K(fp(), 300, 200), K(fpDown().act("arml", "armr", "head"), 2400, 0), K(fp().act("arml", "armr", "torso"), 2400, 300)]);
    mv("systema.fistPushupSlow", "Piegamento sui pugni lentissimo: velocità costante come una lancetta", [K(fp(), 300, 200), K(fpHalf().act("arml", "armr"), 1900, 0), K(fpDown().act("arml", "armr"), 1900, 0), K(fpHalf().act("arml", "armr"), 1900, 0), K(fp(), 1900, 300)]);
    const kneeRest = () => fistHands(allFours(), 0.22).set("pel", [-0.36, 0.5, 0]).set("chest", [0.12, 0.62, 0]).set("head", [0.32, 0.68, 0]).elbow("l", [-1, 0, -0.1]).elbow("r", [-1, 0, 0.1]);
    mv("systema.fistPushupRest", "Piegamento lento, poi recupera in ginocchio sui pugni respirando", [K(fp(), 300, 200), K(fpDown().act("arml", "armr"), 2200, 0), K(fp().act("arml", "armr"), 2200, 200), K(kneeRest().act("legl", "legr"), 700, 1200), K(fp(), 700, 200)]);
    mv("systema.fistPushupBurst", "Respiro bloccato? A metà piegamento qualche respiro corto, poi continua", [K(fp(), 300, 200), K(fpHalf().act("arml", "armr"), 1600, 100), K(inhale(fpHalf(), 0.6).act("torso"), 150, 40), K(fpHalf().act("head"), 150, 40), K(inhale(fpHalf(), 0.6).act("torso"), 150, 40), K(fpHalf().act("head"), 150, 40), K(fpDown().act("arml", "armr"), 1300, 0), K(fp().act("arml", "armr"), 2200, 300)]);
    // in alto apre il corpo di lato con un braccio verso il soffitto
    const sidePl = () => {
      const b = st();
      b.set("pel", [-0.3, 0.5, -0.12]).set("chest", [0.16, 0.79, -0.18]).set("head", [0.33, 0.89, -0.18]).set("hipRoll", -90).set("chestRoll", -90);
      b.footAt("l", [-1.08, 0.07, -0.06], 0, 0, 90).footAt("r", [-1.1, 0.17, -0.06], 0, 0, 90).knee("l", [0, 0, 1]).knee("r", [0, 0, 1]);
      b.handW("l", 0.2, 0.06, -0.18, "fist").handW("r", 0.16, 1.5, -0.18, "open").elbow("l", [-1, 0, 0]).elbow("r", [-1, 0, 0]).look(20);
      return b;
    };

    // sollevamento delle gambe e addominale arrotolato
    (function () {
      const f = lieF().handW("l", -0.1, 0.05, -0.26, "open").handW("r", -0.1, 0.05, 0.26, "open");
      const up = f.copy().footAt("l", [0.05, 0.96, -0.07], 180, -30).footAt("r", [0.05, 0.96, 0.07], 180, -30).knee("l", [-1, 0, 0]).knee("r", [-1, 0, 0]);
      const mid = f.copy().footAt("l", [0.6, 0.72, -0.07], 180, -70).footAt("r", [0.6, 0.72, 0.07], 180, -70).knee("l", [-1, 1, 0]).knee("r", [-1, 1, 0]);
      const low = f.copy().footAt("l", [0.86, 0.17, -0.07], 0, -75).footAt("r", [0.86, 0.17, 0.07], 0, -75);
      mv("systema.legRaise", "Gambe dritte unite: sali fino alla verticale e scendi a sfiorare il pavimento, lombari giù", [K(low, 300, 200), K(mid.act("legl", "legr"), 1200, 0), K(up.act("legl", "legr"), 1200, 200), K(mid.act("legl", "legr"), 1200, 0), K(low.act("legl", "legr"), 1200, 300)]);
      mv("systema.legRaiseSlow", "Sollevamento delle gambe lentissimo, gambe dritte, respiro continuo", [K(low, 300, 200), K(mid.act("legl", "legr"), 2200, 0), K(up.act("legl", "legr"), 2200, 200), K(mid.act("legl", "legr"), 2200, 0), K(low.act("legl", "legr"), 2200, 300)]);
      mv("systema.legHold", "Tenuta a gambe sollevate, lombari appoggiati, respiro lento", [K(f, 300, 150), K(low.copy().footAt("l", [0.8, 0.36, -0.07], 0, -70).footAt("r", [0.8, 0.36, 0.07], 0, -70).act("legl", "legr", "torso"), 900, 2200), K(f, 900, 200)]);
      const k = lieBack({ kneesUp: true }).handW("l", 0.0, 0.05, -0.27, "open").handW("r", 0.0, 0.05, 0.27, "open");
      const s1 = k.copy().set("head", [-0.62, 0.3, 0]).act("head");
      const s2 = k.copy().set("chest", [-0.42, 0.32, 0]).set("head", [-0.5, 0.5, 0]).handRel("l", 0.35, -0.06, -0.12).handRel("r", 0.35, -0.06, 0.12).act("torso", "head");
      const s3 = k.copy().set("chest", [-0.26, 0.49, 0]).set("head", [-0.22, 0.69, 0]).handRel("l", 0.38, -0.08, -0.12).handRel("r", 0.38, -0.08, 0.12).act("torso");
      const s4 = k.copy().set("chest", [-0.06, 0.62, 0]).set("head", [0.0, 0.82, 0]).handRel("l", 0.38, -0.12, -0.12).handRel("r", 0.38, -0.12, 0.12).act("torso");
      mv("systema.situpRoll", "Addominale: sali arrotolando la schiena vertebra per vertebra e scendi allo stesso modo", [K(k, 300, 200), K(s1, 600, 0), K(s2, 700, 0), K(s3, 700, 0), K(s4, 700, 200), K(s3, 700, 0), K(s2, 700, 0), K(s1, 700, 0), K(k, 600, 300)]);
      mv("systema.situpSlow", "Addominale lentissimo, vertebra per vertebra, respiro continuo", [K(k, 300, 200), K(s1, 1100, 0), K(s2, 1300, 0), K(s3, 1300, 0), K(s4, 1300, 100), K(s3, 1300, 0), K(s2, 1300, 0), K(s1, 1300, 0), K(k, 1100, 200)]);
    })();

    /* ================================================================ scendere a terra e rialzarsi */
    // mezzo inginocchiato: piede "front" avanti a terra, l'altro ginocchio giù con le dita puntate
    function halfKneel(front = "r") {
      const ss = front === "l" ? 1 : -1;
      const back = front === "l" ? "r" : "l";
      const b = st();
      b.set("pel", [-0.1, 0.5, 0]).set("chest", [-0.06, 1.0, 0]).set("head", [-0.03, 1.2, 0]).set("hipYaw", ss * 0).set("chestYaw", 0);
      b.foot(front, 0.32, -ss * 0.13, -ss * 5, 0).foot(back, -0.45, ss * 0.11, 0, 70);
      b.knee(front, [1, 0.3, 0]).knee(back, [1, -1, 0]);
      b.handRel("l", 0.2, -0.38, -0.2, "open").handRel("r", 0.2, -0.38, 0.2, "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
      return b;
    }
    const faceHands = (b) => b.handHead("l", 0.24, -0.1, -0.09, "open").handHead("r", 0.2, -0.12, 0.09, "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
    // seduto di lato sull'anca destra, mano destra a terra dietro
    const sideSit = () => {
      const b = st().set("pel", [-0.12, 0.15, 0.1]).set("chest", [-0.26, 0.6, 0.06]).set("head", [-0.2, 0.8, 0.03]).set("hipRoll", -15).set("chestRoll", -5);
      b.footAt("l", [0.28, 0.08, -0.16], 0, 0, 0).footAt("r", [0.2, 0.07, 0.05], -30, 0, -80).knee("l", [0.4, 1, -0.3]).knee("r", [0.6, 0.3, 1]);
      b.handW("r", -0.38, 0.04, 0.3, "open").handW("l", 0.2, 0.3, -0.14, "open").elbow("r", [-1, 0, 0.4]);
      return reach(b, "r");
    };
    const lieDownK = () => lieBack({ kneesUp: true }).move(-0.25, 0.05).handW("l", -0.35, 0.05, -0.3, "open").handW("r", -0.35, 0.05, 0.3, "open");
    const onSide = () => {
      const b = st().set("pel", [-0.25, 0.17, 0.08]).set("chest", [-0.7, 0.2, 0.14]).set("head", [-0.9, 0.25, 0.16]).set("hipRoll", -80).set("chestRoll", -80);
      b.footAt("l", [0.15, 0.26, 0.2], 0, -10, -80).footAt("r", [0.2, 0.1, 0.26], 0, -10, -80).knee("l", [0.2, 0.2, 1]).knee("r", [0.2, 0, 1]);
      b.handW("l", -0.5, 0.06, 0.4, "open").handW("r", -0.9, 0.06, 0.36, "open").elbow("l", [0, 1, 0.3]).elbow("r", [0, 0.4, 1]);
      return b;
    };
    const hipUp = () => {
      const b = st().set("pel", [-0.2, 0.15, 0.1]).set("chest", [-0.24, 0.62, 0.0]).set("head", [-0.2, 0.82, -0.02]).set("hipRoll", -18).set("chestRoll", -6);
      b.footAt("l", [0.2, 0.08, -0.08], -10, 0, 0).footAt("r", [0.0, 0.07, 0.42], -70, 0, -80).knee("l", [0.4, 1, -0.4]).knee("r", [0.4, 0.3, 1]);
      b.handW("r", -0.42, 0.04, 0.32, "open").handW("l", 0.12, 0.32, -0.12, "open").elbow("r", [-1, 0, 0.5]);
      return reach(b, "r");
    };
    mv("systema.rollToSit", "Rotola sul fianco e vai seduto, poi siedi a schiena dritta", [K(lieF(), 300, 200), K(place(onSide(), 0.22, -0.06).act("torso", "legl", "legr"), 800, 200), K(place(hipUp(), 0.2, -0.08).act("torso", "armr"), 800, 200), K(sitX(), 800, 400)]);
    const kneeUp = () => halfKneel("l").move(-0.1, 0.02).act("legl", "legr");
    const downUp = [
      K(g, 300, 100), K(crouch().act("legl", "legr"), 800, 150), K(sideSit().act("torso", "armr"), 800, 150), K(lieDownK().act("torso"), 800, 400),
      K(onSide().act("torso", "legl", "legr"), 800, 150), K(hipUp().act("torso", "armr"), 800, 150), K(kneeUp(), 800, 150), K(g.copy().act("legl", "legr"), 900, 300)
    ];
    mv("systema.downUp", "Scendi a terra e risali: accosciata, seduto di lato, sdraiato, fianco, anca, ginocchio, in piedi", downUp);
    mv("systema.downUpOther", "Lo stesso dall'altro lato: scendi e risali passando sull'altro fianco", mirrorAll(downUp));
    mv("systema.lieDown", "Un passaggio per espirazione: accosciata, seduto di lato, sdraiato sulla schiena", [K(g, 300, 100), K(crouch().act("legl", "legr"), 900, 250), K(sideSit().act("torso", "armr"), 900, 250), K(lieDownK().act("torso"), 900, 600)]);
    mv("systema.lieToHip", "Da sdraiato: rotola sul fianco espirando, poi vai seduto su un'anca", [K(lieDownK(), 300, 300), K(onSide().act("torso", "legl", "legr"), 900, 300), K(hipUp().act("torso", "armr"), 900, 600)]);
    mv("systema.hipToStand", "Dall'anca: un ginocchio a terra, poi un piede, poi in piedi", [K(hipUp(), 300, 300), K(kneeUp(), 900, 300), K(g.copy().act("legl", "legr"), 1000, 500)]);

    // alzata di sicurezza: mano dietro a terra, l'altra davanti al viso, bacino su, gamba indietro, in guardia
    const safeSit = (hand = false) => {
      const b = st().set("pel", [0, 0.14, 0.03]).set("chest", [-0.13, 0.62, 0.08]).set("head", [-0.08, 0.82, 0.06]).set("hipYaw", -10).set("chestYaw", -5);
      b.foot("l", 0.4, -0.14, 0, 0).footAt("r", [0.28, 0.07, 0.04], -60, 0, -80).knee("l", [0.2, 1, -0.2]).knee("r", [0.4, 0.4, 1]);
      b.handW("r", -0.32, 0.04, 0.26, "open").elbow("r", [-1, 0, 0.4]);
      reach(b, "r");
      if (hand) b.handHead("l", 0.22, -0.08, -0.04, "open").elbow("l", [0, -1, -0.5]); else b.handW("l", 0.3, 0.42, -0.16, "open");
      return b;
    };
    const safeHips = () => {
      const b = st().set("pel", [0.02, 0.36, 0.06]).set("chest", [-0.3, 0.68, 0.17]).set("head", [-0.2, 0.86, 0.13]).set("hipYaw", -20).set("chestYaw", -10).set("hipRoll", -20).set("chestRoll", -15);
      b.foot("l", 0.4, -0.14, 0, 0).footAt("r", [0.14, 0.07, 0.1], -60, 0, -80).knee("l", [0.3, 1, -0.2]).knee("r", [0.4, 0.2, 1]);
      b.handW("r", -0.34, 0.04, 0.3, "open").elbow("r", [-1, 0, 0.3]);
      reach(b, "r");
      b.handHead("l", 0.22, -0.08, -0.04, "open").elbow("l", [0, -1, -0.5]);
      return b;
    };
    const safeLeg = () => {
      const b = st().set("pel", [-0.14, 0.5, 0.06]).set("chest", [-0.08, 0.97, 0.08]).set("head", [-0.02, 1.16, 0.06]).set("hipYaw", -20).set("chestYaw", -15);
      b.foot("l", 0.38, -0.14, -5, 0).foot("r", -0.58, 0.16, -30, 60).knee("l", [1, 0.3, 0]).knee("r", [1, -1, 0.2]);
      b.handRel("r", 0.05, -0.42, 0.24, "open").elbow("r", [-0.5, -1, 0.3]).handHead("l", 0.22, -0.08, -0.04, "open").elbow("l", [0, -1, -0.5]);
      return b;
    };
    const safeEnd = () => faceHands(natural()).move(-0.32, 0.05);
    mv("systema.safeSit", "Seduto: piede sinistro a terra, gamba destra piegata di lato, mano destra dietro", [K(g, 300, 100), K(crouch(), 700, 100), K(safeSit().act("torso", "armr"), 800, 900)]);
    mv("systema.safeGuard", "Seduto: mano sinistra davanti al viso, sguardo verso l'attaccante", [K(safeSit(), 300, 300), K(safeSit(true).act("arml", "head"), 600, 1000)]);
    mv("systema.safeHips", "Espira e spingi su mano destra e piede sinistro: il bacino si alza", [K(safeSit(true), 300, 300), K(safeHips().act("torso", "armr", "legl"), 800, 900), K(safeSit(true), 700, 200)]);
    mv("systema.safeLeg", "Bacino su, la gamba destra passa indietro tra mano e piede", [K(safeSit(true), 300, 200), K(safeHips().act("torso", "armr", "legl"), 700, 200), K(safeLeg().act("legr"), 700, 900)]);
    mv("systema.safeRise", "Alzata di sicurezza: mano al viso, bacino su, gamba indietro, in guardia un passo più in là", [K(safeSit(true), 300, 200), K(safeHips().act("torso", "armr", "legl"), 600, 120), K(safeLeg().act("legr"), 600, 150), K(safeEnd().act("legl", "legr"), 700, 600)]);
    mv("systema.safeRiseOther", "Alzata di sicurezza dall'altro lato", mirrorAll([K(safeSit(true), 300, 200), K(safeHips().act("torso", "armr", "legl"), 600, 120), K(safeLeg().act("legr"), 600, 150), K(safeEnd().act("legl", "legr"), 700, 600)]));

    /* ================================================================ dondoli, onde, strisciare */
    const ballSit = () => {
      const b = st().set("pel", [0, 0.13, 0]).set("chest", [-0.14, 0.6, 0]).set("head", [0.0, 0.75, 0]);
      b.footAt("l", [0.3, 0.1, -0.1], 0, 20).footAt("r", [0.3, 0.1, 0.1], 0, 20).knee("l", [0.3, 1, 0]).knee("r", [0.3, 1, 0]);
      b.handW("l", 0.27, 0.36, -0.12, "open").handW("r", 0.27, 0.36, 0.12, "open").elbow("l", [-0.3, -0.5, -1]).elbow("r", [-0.3, -0.5, 1]);
      return b;
    };
    const ballBack = (side = 0) => {
      const b = st().set("pel", [-0.02, 0.31, 0]).set("chest", [-0.45, 0.12, side * 0.1]).set("head", [-0.35, 0.3, -side * 0.08]).set("chestRoll", side * 30).set("hipRoll", side * 20);
      b.footAt("l", [0.08, 0.78, -0.1], 0, -10).footAt("r", [0.08, 0.78, 0.1], 0, -10).knee("l", [-0.4, 1, 0]).knee("r", [-0.4, 1, 0]);
      b.handW("l", 0.0, 0.62, -0.12, "open").handW("r", 0.0, 0.62, 0.12, "open").elbow("l", [-1, -0.3, -1]).elbow("r", [-1, -0.3, 1]);
      return clampH(b);
    };
    mv("systema.ballSit", "Seduto, ginocchia al petto, mani sugli stinchi, mento verso il petto", [K(g, 300, 100), K(crouch(), 600, 100), K(ballSit().act("torso", "arml", "armr"), 700, 900)]);
    mv("systema.rockBack", "Dondolo a palla: schiena tonda, indietro fino alle scapole e di nuovo seduto", [K(ballSit(), 300, 150), K(ballBack().act("torso"), 700, 200), K(ballSit().act("torso"), 700, 200), K(ballBack().act("torso"), 700, 200), K(ballSit(), 700, 300)]);
    mv("systema.rockDiag", "Dondolo in diagonale verso la spalla destra, poi la sinistra, testa dalla parte opposta", [K(ballSit(), 300, 150), K(ballBack(1).act("torso"), 800, 250), K(ballSit(), 700, 150), K(ballBack(-1).act("torso"), 800, 250), K(ballSit(), 700, 300)]);
    const cow = allFours().set("chest", [0.2, 0.52, 0]).set("head", [0.4, 0.68, 0]).act("torso", "head");
    const cat = allFours().set("chest", [0.18, 0.62, 0]).set("head", [0.34, 0.49, 0]).act("torso", "head");
    mv("systema.spineWaveFours", "In quadrupedia: inarca la schiena inspirando, arrotondala espirando", [K(allFours(), 300, 150), K(cow, 1000, 300), K(cat, 1300, 300), K(cow, 1300, 300), K(allFours(), 900, 200)]);
    // strisciare sulla pancia: avambracci e ginocchia alternati
    const crawlP = (lead, x) => {
      const ss = lead === "l" ? 1 : -1; // l: avambraccio sinistro avanti e ginocchio destro su
      const b = lieFront().set("pel", [0, 0.15, 0]).set("chest", [0.48, 0.24, 0]).set("head", [0.68, 0.32, 0]);
      b.handW(lead, 0.86, 0.05, -ss * 0.2, "open").handW(lead === "l" ? "r" : "l", 0.6, 0.05, ss * 0.24, "open").elbow("l", [-0.2, -1, -0.5]).elbow("r", [-0.2, -1, 0.5]);
      const kneeSide = lead === "l" ? "r" : "l";
      b.footAt(kneeSide, [-0.55, 0.07, ss * 0.38], 180, 0, 180).knee(kneeSide, [0.4, -0.3, ss * 1]);
      return b.move(x).act("arm" + lead, "leg" + kneeSide);
    };
    mv("systema.crawl", "Striscia sulla pancia: avambracci e ginocchia alternati, bacino basso", [K(lieFront(), 300, 100), K(crawlP("l", 0), 400, 80), K(crawlP("r", 0.22), 450, 80), K(crawlP("l", 0.44), 450, 80), K(crawlP("r", 0.22), 450, 80), K(crawlP("l", 0), 450, 80), K(lieFront(), 400, 200)]);
    // sulla schiena: spingi con i piedi e ruota le spalle, poi torna tirando con i talloni
    const scootA = (x, d) => lieBack({ kneesUp: true }).move(x).footAt("l", [0.42, 0.08, -0.14], 0, 0).footAt("r", [0.42, 0.08, 0.14], 0, 0).handW("l", -0.15, 0.05, -0.3, "open").handW("r", -0.15, 0.05, 0.3, "open").set("chestRoll", d).set("hipRoll", d * 0.5).act("legl", "legr", "torso");
    const scootB = (x, d) => lieBack().move(x - 0.22).footAt("l", [0.2 + 0.42, 0.1, -0.14], 0, -40).footAt("r", [0.2 + 0.42, 0.1, 0.14], 0, -40).knee("l", [0.3, 1, 0]).knee("r", [0.3, 1, 0]).handW("l", -0.15, 0.05, -0.3, "open").handW("r", -0.15, 0.05, 0.3, "open").set("chestRoll", d).set("hipRoll", d * 0.5).act("legl", "legr", "torso");
    mv("systema.backScoot", "Sulla schiena spingi con i piedi e ruota le spalle per spostarti, poi torna", [K(scootA(0, 0).act(), 300, 100), K(scootB(0, 18), 500, 80), K(scootA(-0.22, -18), 450, 80), K(scootB(-0.22, -18), 500, 80), K(scootA(-0.44, 18), 450, 120), K(scootA(-0.22, -10), 600, 80), K(scootA(0, 0).act(), 600, 200)]);
    // giro sulla schiena di 360 gradi, testa sollevata, in un verso e nell'altro
    const spinP = (yaw) => { const b = lieBack({ kneesUp: true }).set("head", [-0.7, 0.2, 0]).handW("l", -0.3, 0.2, -0.12, "open").handW("r", -0.3, 0.2, 0.12, "open").elbow("l", [0, 0.3, -1]).elbow("r", [0, 0.3, 1]).footAt("l", [0.42, 0.08, -0.17], 0, 0).footAt("r", [0.42, 0.08, 0.17], 0, 0); return b.spin(yaw); };
    mv("systema.backSpin", "Sulla schiena, testa sollevata: ruota di 360 gradi spingendo con i piedi, poi nell'altro verso", [K(spinP(0), 300, 100), K(spinP(90).act("legl", "legr"), 500, 40), K(spinP(180).act("legl", "legr"), 500, 40), K(spinP(270).act("legl", "legr"), 500, 40), K(spinP(360).act("legl", "legr"), 500, 200), K(spinP(270).act("legl", "legr"), 500, 40), K(spinP(180).act("legl", "legr"), 500, 40), K(spinP(90).act("legl", "legr"), 500, 40), K(spinP(0), 500, 200)]);
    // rotolare a tronco, braccia tese sopra la testa
    const logP = (q, z) => {
      const b = st().set("hipYaw", 0).set("chestYaw", 0);
      const side = Math.abs(q) % 2 === 1; // su un fianco
      const y = side ? 0.17 : 0.13;
      b.set("pel", [0, y, z]).set("chest", [-0.5, y + 0.01, z]).set("head", [-0.72, y + 0.02, z]).set("hipRoll", -90 * q).set("chestRoll", -90 * q);
      const up = side ? [0, 0.12, 0] : [0, 0, 0];
      const yaws = { 0: [0, -80], 1: [-90, 0], 2: [0, 80], "-1": [90, 0], "-2": [0, 80] };
      const fy = yaws[String(q)];
      const sz = Math.abs(q) === 2 ? -1 : 1; // a pancia in giu' la sinistra passa dall'altra parte
      const belly = Math.abs(q) === 2;
      b.footAt("l", [0.86, 0.08 + (q === 1 ? 0.1 : 0), z - sz * (side ? 0 : 0.1)], belly ? 0 : fy[0], belly ? 0 : fy[1], belly ? 180 : 0).footAt("r", [0.86, 0.08 + (q === -1 ? 0.1 : 0), z + sz * (side ? 0 : 0.1)], belly ? 0 : fy[0], belly ? 0 : fy[1], belly ? 180 : 0);
      b.handW("l", -1.0, 0.06 + (q === 1 ? 0.12 : 0), z - sz * (side ? 0 : 0.15), "open").handW("r", -1.0, 0.06 + (q === -1 ? 0.12 : 0), z + sz * (side ? 0 : 0.15), "open").elbow("l", [0, belly ? -1 : 1, -0.3 * sz]).elbow("r", [0, belly ? -1 : 1, 0.3 * sz]);
      const kn = side ? [0, 0, -q] : q === 0 ? [0, 1, 0] : [0, -1, 0];
      b.knee("l", kn).knee("r", kn);
      void up;
      return b;
    };
    mv("systema.logRoll", "Sdraiato a braccia tese sopra la testa: rotola a tronco a destra e torna, poi a sinistra", [K(logP(0, 0), 300, 100), K(logP(1, 0.2).act("torso"), 500, 50), K(logP(2, 0.4).act("torso"), 500, 150), K(logP(1, 0.2).act("torso"), 500, 50), K(logP(0, 0), 500, 100), K(logP(-1, -0.2).act("torso"), 500, 50), K(logP(-2, -0.4).act("torso"), 500, 150), K(logP(-1, -0.2).act("torso"), 500, 50), K(logP(0, 0), 500, 200)]);
    // dondolo sul sacro e torsione a ginocchia piegate
    const hugK = (r) => clampH(lieBack().footAt("l", [0.05, 0.42, -0.1], 0, -20).footAt("r", [0.05, 0.42, 0.1], 0, -20).knee("l", [-0.2, 1, 0]).knee("r", [-0.2, 1, 0]).handW("l", -0.04, 0.42, -0.12, "open").handW("r", -0.04, 0.42, 0.12, "open").elbow("l", [0, 0.3, -1]).elbow("r", [0, 0.3, 1]).set("hipRoll", r).set("chestRoll", r * 0.6));
    mv("systema.sacrumRock", "Sdraiato, ginocchia al petto abbracciate: dondola piano a destra e a sinistra", [K(hugK(0), 300, 150), K(hugK(-25).act("torso"), 800, 200), K(hugK(25).act("torso"), 1100, 200), K(hugK(-25).act("torso"), 1100, 200), K(hugK(0), 800, 200)]);
    const kTw = (s) => lieBack({ kneesUp: true }).handW("l", -0.5, 0.05, -0.62, "open").handW("r", -0.5, 0.05, 0.62, "open").elbow("l", [0, 1, 0]).elbow("r", [0, 1, 0]).footAt("l", [0.38, 0.1, s * 0.14 - 0.1], 0, 0, s * 60).footAt("r", [0.38, 0.1, s * 0.14 + 0.1], 0, 0, s * 60).knee("l", [0.3, 0.4, s]).knee("r", [0.3, 0.4, s]).set("hipRoll", -s * 50).look(-s * 50);
    mv("systema.kneeTwist", "Torsione: ginocchia piegate cadono di lato, braccia aperte, sguardo dall'altra parte", [K(kTw(0), 300, 150), K(kTw(1).act("legl", "legr", "torso"), 1000, 1300), K(kTw(0), 800, 100), K(kTw(-1).act("legl", "legr", "torso"), 1000, 1300), K(kTw(0), 800, 200)]);
    const legsWall = lieBack().footAt("l", [0.08, 0.95, -0.08], 180, -30).footAt("r", [0.08, 0.95, 0.08], 180, -30).knee("l", [-1, 0, 0]).knee("r", [-1, 0, 0]).handW("l", -0.15, 0.05, -0.3, "open").handW("r", -0.15, 0.05, 0.3, "open");
    mv("systema.legsUp", "Sdraiato con le gambe appoggiate in alto (al muro): respiri lenti", [K(legsWall, 400, 400), K(legsWall.copy().set("chest", [-0.5, 0.15, 0]).act("torso"), 1500, 300), K(legsWall.copy().act("head"), 1900, 300)]);

    /* ================================================================ capriole sulla spalla */
    // capriola in avanti sulla spalla destra, da mezzo inginocchiato (destro avanti); hug = cuscino al petto
    const hugHands = (b) => b.handRel("l", 0.16, -0.16, 0.08, "open").handRel("r", 0.16, -0.12, -0.08, "open").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]);
    function rollF(hug) {
      const hk = halfKneel("r");
      const f1 = st().set("pel", [-0.06, 0.55, 0]).set("chest", [0.32, 0.66, 0.05]).set("head", [0.5, 0.62, -0.04]).look(35);
      f1.foot("r", 0.32, 0.13, 5, 0).foot("l", -0.45, -0.11, 0, 70).knee("r", [1, 0.3, 0]).knee("l", [1, -1, 0]);
      if (hug) hugHands(f1); else { f1.handW("r", 0.56, 0.05, -0.02, "open").elbow("r", [0.2, 0.6, 1]).handW("l", 0.42, 0.05, -0.3, "open").elbow("l", [-0.3, 0, -1]); reach(f1, "r", 0.95); reach(f1, "l", 0.97); }
      const f2 = st().set("pel", [0.12, 0.7, -0.02]).set("chest", [0.44, 0.3, 0.1]).set("head", [0.5, 0.26, -0.12]).set("chestRoll", 45).set("hipRoll", 20).look(40);
      f2.foot("r", 0.36, 0.13, 5, 30).foot("l", -0.3, -0.11, 0, 60).knee("r", [1, 0.3, 0]).knee("l", [1, 0, 0]);
      if (hug) hugHands(f2); else { f2.handW("r", 0.72, 0.05, 0.05, "open").elbow("r", [0, 1, 1]).handW("l", 0.5, 0.05, -0.3, "open").elbow("l", [-0.3, 0.3, -1]); clampH(f2); }
      const f3 = st().set("pel", [0.78, 0.28, -0.06]).set("chest", [0.4, 0.13, 0.16]).set("head", [0.32, 0.3, 0.14]).set("hipYaw", 25).set("chestYaw", 25);
      f3.footAt("l", [0.72, 0.68, -0.26], 180, 10).footAt("r", [0.92, 0.62, -0.02], 180, 10).knee("l", [-1, 1, 0]).knee("r", [-1, 1, 0]);
      if (hug) hugHands(f3); else { f3.handW("r", 0.32, 0.05, 0.45, "open").handW("l", 0.6, 0.05, -0.38, "open").elbow("l", [0, 1, -0.3]).elbow("r", [0, 1, 0.3]); clampH(f3); }
      const f4 = st().set("pel", [1.0, 0.22, -0.1]).set("chest", [1.1, 0.7, -0.04]).set("head", [1.17, 0.9, -0.04]).set("hipRoll", 15);
      f4.footAt("l", [0.95, 0.07, 0.0], 180, 0).footAt("r", [1.42, 0.08, 0.14], 0, 0).knee("l", [1, 0.2, -0.6]).knee("r", [1, 1, 0]);
      if (hug) hugHands(f4); else faceHands(f4);
      const f5 = place(halfKneel("r"), 1.08, 0.02, 0);
      if (hug) hugHands(f5); else faceHands(f5);
      return { hk, f1, f2, f3, f4, f5 };
    }
    const RF = rollF(false);
    const RH = rollF(true);
    const rollSeq = (R, em) => [
      K(R.hk, 300, 150), K(R.f1.copy().act("arml", "armr", "head"), 600, em === 1 ? 500 : 120),
      K(R.f2.copy().act("torso", "head", "armr"), 450, em === 2 ? 700 : 40), K(R.f3.copy().act("torso"), 450, em === 3 ? 700 : 40),
      K(R.f4.copy().act("legl", "legr"), 450, 60), K(R.f5.copy().act("legl", "legr", em === 4 ? "arml" : "legr", em === 4 ? "armr" : "legl"), 500, em === 4 ? 900 : 500)
    ];
    mv("systema.rollFwd", "Capriola in avanti sulla spalla destra: diagonale fino all'anca sinistra, arrivo in ginocchio", rollSeq(RF, 0));
    mv("systema.rollFwdL", "Capriola in avanti sulla spalla sinistra, fino all'anca destra", mirrorAll(rollSeq(RF, 0)));
    mv("systema.rollFwdSpalla", "Espira, testa girata a sinistra: la parte posteriore della spalla destra tocca per prima", [K(RF.hk, 300, 150), K(RF.f1.copy().act("arml", "armr", "head"), 600, 150), K(RF.f2.copy().act("torso", "head", "armr"), 700, 1000), K(RF.f1.copy(), 600, 100), K(RF.hk, 500, 200)]);
    mv("systema.rollFwdDiag", "Attraversa la schiena in diagonale fino all'anca sinistra, tondo come una ruota", [K(RF.f2.copy(), 300, 250), K(RF.f3.copy().act("torso"), 700, 1000), K(RF.f4.copy().act("legl", "legr"), 600, 400)]);
    mv("systema.rollFwdArrivo", "Fine giro: sinistra piegata sotto, destra davanti, in ginocchio con le mani al viso", [K(RF.f3.copy(), 300, 250), K(RF.f4.copy().act("legl", "legr"), 600, 200), K(RF.f5.copy().act("legl", "legr", "arml", "armr"), 600, 1100)]);
    mv("systema.rollFwdSlow", "Capriola in avanti lenta e silenziosa, sulla spalla destra", rollSeq(RF, 0).map((f) => K(f.p, Math.round(f.t * 1.5), Math.round(f.h * 1.5), f.act)));
    mv("systema.rollFwdHug", "Capriola in avanti sulla spalla con un cuscino abbracciato al petto", rollSeq(RH, 0));
    mv("systema.rollSetup", "In ginocchio, destra avanti: braccio destro ad arco a terra, mano sinistra di supporto", [K(g, 300, 100), K(halfKneel("r").act("legl", "legr"), 700, 200), K(RF.f1.copy().act("armr", "arml"), 700, 1000)]);
    mv("systema.rollSetupHug", "In ginocchio, destra avanti, cuscino abbracciato al petto", [K(g, 300, 100), K(hugHands(halfKneel("r")).act("legl", "legr", "arml", "armr"), 800, 1100)]);
    mv("systema.halfKneel", "In ginocchio: gamba destra avanti con il piede a terra, ginocchio sinistro giù", [K(g, 300, 100), K(halfKneel("r").act("legl", "legr"), 800, 1100)]);
    mv("systema.rollArm", "Mano destra a terra davanti, dita verso l'interno, braccio arrotondato come su un pallone", [K(halfKneel("r"), 300, 200), K(RF.f1.copy().look(0).act("armr"), 800, 1200), K(halfKneel("r"), 600, 200)]);
    mv("systema.rollLook", "Gira la testa a sinistra, guardando verso il ginocchio sinistro", [K(RF.f1.copy().look(0), 300, 300), K(RF.f1.copy().look(55).act("head"), 600, 1300), K(RF.f1.copy().look(0), 500, 200)]);
    // mezza capriola: si ferma sdraiata
    const halfEnd = (R) => { const b = st().set("pel", [0.82, 0.13, -0.14]).set("chest", [0.36, 0.15, 0.08]).set("head", [0.22, 0.2, 0.12]).set("hipYaw", 25).set("chestYaw", 25).set("hipRoll", 25);
      b.footAt("l", [1.2, 0.08, -0.5], 25, -60).footAt("r", [1.35, 0.1, -0.2], 25, -60).knee("l", [0.3, 1, 0]).knee("r", [0.3, 1, 0]);
      if (R === RH) hugHands(b); else b.handW("r", 0.32, 0.05, 0.45, "open").handW("l", 0.62, 0.05, -0.42, "open").elbow("l", [0, 1, -0.3]).elbow("r", [0, 1, 0.3]);
      return clampH(b); };
    mv("systema.halfRoll", "Mezza capriola: rotola sul braccio e sulla spalla destra fino all'anca sinistra e fermati", [K(RF.hk, 300, 150), K(RF.f1.copy().act("arml", "armr", "head"), 600, 150), K(RF.f2.copy().act("torso", "head"), 600, 100), K(RF.f3.copy().act("torso"), 600, 100), K(halfEnd(RF).act("legl", "legr"), 600, 1000)]);
    mv("systema.halfRollHug", "Mezza capriola con il cuscino: la spalla scende vicino al ginocchio, poi fermati sul fianco", [K(RH.hk, 300, 150), K(RH.f1.copy().act("head", "torso"), 600, 150), K(RH.f2.copy().act("torso", "head"), 600, 100), K(RH.f3.copy().act("torso"), 600, 100), K(halfEnd(RH).act("legl", "legr"), 600, 1000)]);
    mv("systema.halfRollCheck", "Fermo sdraiato: controlla che la testa non abbia toccato, poi rialzati", [K(halfEnd(RF), 300, 1000), K(halfEnd(RF).copy().look(-30).act("head"), 500, 600), K(halfEnd(RF), 500, 300)]);
    // coppia di capriole: destra in avanti, ti giri, sinistra indietro al punto di partenza
    (function () {
      const X = 1.3;
      const back = (b) => b.copy().mirror().spin(180).move(X - 0.12);
      const R = RF;
      const up = place(natural(), 1.2, 0.02, 0);
      const t1 = place(turnPose(), 1.2, 0.02, 90);
      const L0 = back(R.hk);
      mv("systema.rollPair", "Capriola sulla spalla destra, ti giri, capriola sulla sinistra fino al punto di partenza", [
        K(R.hk, 300, 100), K(R.f1.copy().act("armr", "head"), 500, 80), K(R.f2.copy().act("torso", "head"), 400, 30), K(R.f3.copy().act("torso"), 400, 30), K(R.f4.copy().act("legl", "legr"), 400, 40), K(R.f5.copy(), 400, 100),
        K(up.act("legl", "legr"), 450, 50), K(t1, 350, 30), K(L0.act("legl", "legr"), 500, 80),
        K(back(R.f1).act("arml", "head"), 500, 80), K(back(R.f2).act("torso", "head"), 400, 30), K(back(R.f3).act("torso"), 400, 30), K(back(R.f4).act("legl", "legr"), 400, 40), K(back(R.f5), 400, 100),
        K(place(natural(), 0.05, 0, 180).act("legl", "legr"), 450, 50), K(place(turnPose(), 0.05, 0, 90), 350, 30), K(R.hk, 500, 200)
      ]);
    })();

    // capriola indietro sulla spalla destra, dall'accosciata
    function rollB(hug) {
      const c0 = crouch().set("head", [0.2, 1.12, 0]);
      if (hug) hugHands(c0);
      const b1 = st().set("pel", [-0.22, 0.13, 0]).set("chest", [-0.3, 0.6, 0]).set("head", [-0.14, 0.75, 0]);
      b1.foot("l", 0.08, -0.15, 10, 0).foot("r", 0.08, 0.15, -10, 0).knee("l", [1, 1, -0.2]).knee("r", [1, 1, 0.2]);
      if (hug) hugHands(b1); else b1.handRel("l", 0.36, -0.12, -0.12, "open").handRel("r", 0.36, -0.12, 0.12, "open");
      const b2 = st().set("pel", [-0.42, 0.26, 0]).set("chest", [-0.84, 0.12, 0.04]).set("head", [-0.72, 0.3, -0.06]);
      b2.footAt("l", [-0.32, 0.7, -0.12], 180, 10).footAt("r", [-0.32, 0.7, 0.12], 180, 10).knee("l", [-1, 0.6, 0]).knee("r", [-1, 0.6, 0]);
      if (hug) hugHands(b2); else b2.handW("l", -0.9, 0.05, -0.28, "open").handW("r", -0.9, 0.05, 0.3, "open").elbow("l", [0, 1, -0.4]).elbow("r", [0, 1, 0.4]);
      const b3 = st().set("pel", [-0.86, 0.52, 0.18]).set("chest", [-0.96, 0.16, 0.0]).set("head", [-0.98, 0.17, -0.2]);
      b3.footAt("l", [-1.22, 0.42, 0.12], 0, 30).footAt("r", [-1.28, 0.3, 0.3], 0, 30).knee("l", [-1, -0.2, 0.2]).knee("r", [-1, -0.4, 0.4]);
      if (hug) hugHands(b3); else b3.handW("l", -0.88, 0.05, -0.26, "open").handW("r", -0.86, 0.05, 0.34, "open").elbow("l", [0.3, 1, -0.4]).elbow("r", [0.3, 1, 0.4]);
      clampH(b3);
      const b4 = place(allFours(), -1.0, 0.1, 0).set("head", [-0.62, 0.66, 0.1]);
      if (hug) hugHands(b4.set("chest", [-0.84, 0.92, 0.1]).set("head", [-0.8, 1.12, 0.1]).set("pel", [-1.25, 0.5, 0.1]));
      const b5 = place(crouch(), -1.2, 0.1, 0);
      if (hug) hugHands(b5); else faceHands(b5);
      return { c0, b1, b2, b3, b4, b5 };
    }
    const RB = rollB(false);
    const RBH = rollB(true);
    const rollBSeq = (R, em) => [
      K(R.c0, 300, 150), K(R.b1.copy().act("torso"), 500, em === 1 ? 600 : 60), K(R.b2.copy().act("torso", "legl", "legr"), 450, 40),
      K(R.b3.copy().act("torso", "head", "legl", "legr"), 500, em === 3 ? 800 : 80), K(R.b4.copy().act("legl", "legr", "arml", "armr"), 500, em === 4 ? 600 : 80), K(R.b5.copy().act("legl", "legr"), 500, 500)
    ];
    mv("systema.crouchChin", "Accosciato, mento al petto, braccia avanti", [K(g, 300, 100), K(RB.c0.copy().act("legl", "legr", "head"), 800, 1100)]);
    mv("systema.rollBack", "Capriola indietro: siediti vicino ai talloni, rotola tondo e passa sopra la spalla destra", rollBSeq(RB, 0));
    mv("systema.rollBackSit", "Siediti vicino ai talloni e rotola indietro con la schiena tonda, espirando", [K(RB.c0, 300, 150), K(RB.b1.copy().act("torso"), 600, 200), K(RB.b2.copy().act("torso", "legl", "legr"), 700, 900), K(RB.b1.copy(), 600, 100), K(RB.c0, 500, 200)]);
    mv("systema.rollBackSpalla", "Testa inclinata a sinistra, ginocchia verso la spalla destra: il peso passa sulla spalla", [K(RB.b2.copy(), 300, 250), K(RB.b3.copy().act("torso", "head", "legl", "legr"), 700, 1000), K(RB.b4.copy().act("legl", "legr"), 600, 400)]);
    mv("systema.rollBackMani", "Le mani a terra accanto alle spalle accompagnano; atterri sulle ginocchia", [K(RB.b3.copy(), 300, 250), K(RB.b4.copy().act("arml", "armr", "legl", "legr"), 600, 900), K(RB.b5.copy().act("legl", "legr"), 600, 700)]);
    mv("systema.rollBackHug", "Capriola indietro sulla spalla con il cuscino al petto, testa inclinata", rollBSeq(RBH, 0));
    (function () {
      const X = -1.2;
      const back = (b) => b.copy().mirror().spin(180).move(X);
      const R = RB;
      mv("systema.rollBackPair", "Capriola indietro sulla spalla destra, ti giri, poi sulla sinistra fino al punto di partenza", [
        K(R.c0, 300, 100), K(R.b1.copy().act("torso"), 450, 40), K(R.b2.copy().act("torso", "legl", "legr"), 400, 30), K(R.b3.copy().act("torso", "legl", "legr"), 450, 50), K(R.b4.copy().act("legl", "legr"), 450, 50), K(R.b5.copy(), 450, 80),
        K(place(turnPose(), X, 0.1, 90), 450, 30), K(back(R.c0).act("legl", "legr"), 450, 80),
        K(back(R.b1).act("torso"), 450, 40), K(back(R.b2).act("torso", "legl", "legr"), 400, 30), K(back(R.b3).act("torso", "legl", "legr"), 450, 50), K(back(R.b4).act("legl", "legr"), 450, 50), K(back(R.b5), 450, 80),
        K(place(turnPose(), 0, 0, 90), 450, 30), K(R.c0, 450, 200)
      ]);
    })();
    // capriola in avanti con arrivo in ginocchio e pugno subito, senza caricare
    const rollPunch = RF.f5.copy().set("chest", [1.06, 1.02, 0.02]).set("head", [1.1, 1.22, 0.02]).straight("r", [2.0, 0.95, 0.05], 0.97, "fist").act("armr", "torso");

    /* ================================================================ cadute basse */
    const crouchToes = () => crouch().heel("l", 25).heel("r", 25).sink(-0.03).handRel("l", 0.28, -0.18, -0.1, "open").handRel("r", 0.28, -0.18, 0.1, "open");
    mv("systema.crouchToes", "Accovacciato, mani davanti al petto, peso sugli avampiedi", [K(g, 300, 100), K(crouchToes().act("legl", "legr"), 800, 1000)]);
    // caduta laterale bassa sul lato destro, rotolamento sulla schiena e uscita dall'altra parte
    let FS = null; // pose della caduta laterale, riusate piu' avanti
    (function () {
      const c = crouchToes();
      const s1 = st().set("pel", [-0.12, 0.26, 0.12]).set("chest", [-0.12, 0.74, 0.04]).set("head", [-0.08, 0.93, 0.02]).set("hipRoll", -25).set("chestRoll", -8);
      s1.foot("l", 0.04, -0.2, 10, 20).footAt("r", [0.28, 0.07, -0.26], -40, 0, -70).knee("l", [1, 1, -0.3]).knee("r", [0.5, 0.3, 1]);
      s1.handRel("l", 0.28, -0.2, -0.1, "open").handRel("r", 0.2, -0.3, 0.2, "open");
      const s2 = st().set("pel", [-0.18, 0.15, 0.24]).set("chest", [-0.42, 0.4, 0.5]).set("head", [-0.42, 0.6, 0.48]).set("hipRoll", -35).set("chestRoll", -45).set("hipYaw", -20).set("chestYaw", -30);
      s2.footAt("l", [0.2, 0.3, -0.12], 0, -20).footAt("r", [0.25, 0.07, -0.05], -40, 0, -80).knee("l", [0.6, 1, -0.3]).knee("r", [0.5, 0.3, 1]);
      s2.handW("r", -0.3, 0.05, 0.75, "open").handRel("l", 0.25, -0.15, -0.05, "open").elbow("r", [0, 0.5, 1]);
      clampH(s2);
      const s3 = st().set("pel", [-0.3, 0.13, 0.3]).set("chest", [-0.76, 0.14, 0.48]).set("head", [-0.92, 0.28, 0.54]).set("hipYaw", -20).set("chestYaw", -20);
      s3.footAt("l", [-0.1, 0.55, 0.15], 0, -20).footAt("r", [0.0, 0.5, 0.35], 0, -20).knee("l", [0.2, 1, 0]).knee("r", [0.2, 1, 0]);
      s3.handW("l", -0.55, 0.05, 0.05, "open").handW("r", -0.75, 0.05, 0.85, "open").elbow("l", [0, 1, -1]).elbow("r", [0, 1, 1]);
      clampH(s3);
      const s4 = place(onSide().mirror(), 0.05, 0.25, 0);
      const s5 = place(hipUp().mirror(), 0.1, 0.15, 0);
      const s6 = place(halfKneel("r"), 0.05, 0.1, 0);
      FS = { c, s1, s2, s3 };
      const seq = [K(g, 300, 80), K(c.copy().act("legl", "legr"), 450, 80), K(s1.act("legr"), 450, 80), K(s2.act("torso", "armr"), 450, 80), K(s3.act("torso", "legl", "legr"), 450, 150), K(s4.act("torso"), 500, 80), K(s5.act("torso", "arml"), 500, 80), K(s6.act("legl", "legr"), 500, 80), K(g, 500, 200)];
      const low = seq.slice(0, 5).concat([K(s2, 550, 50), K(s1, 450, 50), K(c, 450, 50), K(g, 450, 200)]);
      mv("systema.fallSideLow", "Caduta laterale bassa: la gamba destra scivola, siedi sulla coscia, poi fianco e schiena", low);
      mv("systema.fallSideLowL", "Caduta laterale bassa sul lato sinistro", mirrorAll(low));
      mv("systema.fallSideSlide", "La gamba destra scivola davanti all'altra: ti siedi sul lato esterno della coscia", [K(c, 300, 150), K(s1.copy().act("legr"), 700, 900), K(c, 600, 200)]);
      mv("systema.fallSideRoll", "Caduta laterale: fianco, schiena, rotola ed esci dall'altra parte, poi rialzati", seq);
      mv("systema.fallSideRollL", "Caduta laterale dal lato sinistro: rotola ed esci dall'altra parte", mirrorAll(seq));
    })();
    // caduta in avanti da in ginocchio: mani e avambracci insieme, testa girata
    const tallKneel = () => {
      const b = st().set("pel", [0, 0.49, 0]).set("chest", [0.02, 0.99, 0]).set("head", [0.04, 1.19, 0]);
      b.footAt("l", [-0.42, 0.07, -0.1], 180, 0).footAt("r", [-0.42, 0.07, 0.1], 180, 0).knee("l", [1, -1, 0]).knee("r", [1, -1, 0]);
      b.handRel("l", 0.12, -0.45, -0.2, "open").handRel("r", 0.12, -0.45, 0.2, "open");
      return b;
    };
    const fwdDown = () => {
      const b = st().set("pel", [0.3, 0.37, 0]).set("chest", [0.72, 0.33, 0]).set("head", [0.92, 0.34, 0]).look(-80);
      b.footAt("l", [-0.42, 0.07, -0.1], 180, 0).footAt("r", [-0.42, 0.07, 0.1], 180, 0).knee("l", [0.3, -1, 0]).knee("r", [0.3, -1, 0]);
      b.handW("l", 0.98, 0.05, -0.22, "open").handW("r", 0.98, 0.05, 0.22, "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
      return b;
    };
    mv("systema.tallKneel", "In ginocchio con il busto dritto", [K(g, 300, 100), K(tallKneel().act("legl", "legr"), 800, 1000)]);
    mv("systema.fallFwd", "Caduta in avanti da in ginocchio: mani e avambracci arrivano insieme, gomiti morbidi, testa di lato", [K(tallKneel(), 300, 200), K(tallKneel().lean(0.1).act("torso"), 350, 0), K(fwdDown().act("arml", "armr", "torso", "head"), 450, 900), K(tallKneel(), 800, 300)]);
    // caduta indietro bassa: dall'accosciata siedi vicino ai talloni e rotola sulla schiena tonda
    const backRound = () => {
      const b = st().set("pel", [-0.34, 0.3, 0]).set("chest", [-0.76, 0.12, 0]).set("head", [-0.64, 0.31, 0]);
      b.footAt("l", [-0.15, 0.72, -0.12], 0, -10).footAt("r", [-0.15, 0.72, 0.12], 0, -10).knee("l", [-0.4, 1, 0]).knee("r", [-0.4, 1, 0]);
      b.handRel("l", 0.3, -0.08, -0.14, "open").handRel("r", 0.3, -0.08, 0.14, "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
      return clampH(b);
    };
    mv("systema.fallBackLow", "Caduta indietro: siediti vicino ai talloni e rotola sulla schiena tonda, mento al petto", [K(g, 300, 100), K(RB.c0.copy().act("legl", "legr"), 500, 80), K(RB.b1.copy().act("torso"), 450, 60), K(backRound().act("torso", "head"), 450, 600), K(RB.b1, 550, 60), K(RB.c0, 550, 60), K(g, 500, 200)]);
    mv("systema.rollPunch", "Capriola in avanti, arrivo in ginocchio con le mani davanti e pugno subito, senza caricare", rollSeq(RF, 0).concat([K(rollPunch, 200, 400), K(RF.f5.copy(), 300, 400)]));

    /* ================================================================ colpire rilassati */
    const CH = [0.82, 1.22, 0.02]; // bersaglio all'altezza del petto
    // pugno del Systema: parte da dove si trova la mano, braccio morbido, si chiude solo alla fine
    const punchR = (b0, tgt = CH, k = 1) => b0.copy().turn(16 * k).shift(0.06 * k).straight("r", tgt, 0.97, "fist").heel("r", 12 * k);
    const punchL = (b0, tgt = CH, k = 1) => b0.copy().turn(-10 * k).shift(0.05 * k).straight("l", tgt, 0.97, "fist");
    const midR = (b0) => b0.copy().turn(6).shift(0.02).handRel("r", 0.42, -0.2, 0.04, "open").elbow("r", [0, -1, 0.2]);
    const midL = (b0) => b0.copy().turn(-4).shift(0.02).handRel("l", 0.44, -0.18, -0.03, "open").elbow("l", [0, -1, -0.2]);
    mv("systema.punchSlow", "Pugno al rallentatore: il pugno parte senza tornare indietro, mano semichiusa, spalla bassa", [K(gc, 300, 200), K(midR(gc).act("armr"), 900, 100), K(punchR(gc).act("armr", "head"), 700, 500), K(gc, 900, 300)]);
    mv("systema.punchSlowL", "Pugno sinistro al rallentatore: si chiude solo nell'ultimo tratto", [K(gc, 300, 200), K(midL(gc).act("arml"), 900, 100), K(punchL(gc).act("arml", "head"), 700, 500), K(gc, 900, 300)]);
    mv("systema.punch", "Pugno del Systema: nessuna carica, il pugno arriva per primo, poi il peso; espira corto", [K(gc, 300, 200), K(midR(gc).act("armr"), 160, 0), K(punchR(gc).act("armr", "head"), 140, 300), K(gc, 300, 300)]);
    mv("systema.punchL", "Pugno sinistro senza caricare, spalla bassa, espira al contatto", [K(gc, 300, 200), K(midL(gc).act("arml"), 160, 0), K(punchL(gc).act("arml", "head"), 140, 300), K(gc, 300, 300)]);
    mv("systema.punchClose", "Ultimo tratto: pugno chiuso sulle prime due nocche, polso dritto, il peso arriva con l'anca", [K(gc, 300, 150), K(midR(gc).act("armr"), 700, 300), K(punchR(gc, CH, 1.4).act("armr", "torso", "legr"), 500, 800), K(gc, 800, 300)]);
    const deep = [1.0, 1.22, 0.02];
    mv("systema.punchThrough", "Mira oltre il bersaglio ed espira corto dalla bocca al contatto", [K(gc, 300, 150), K(midR(gc).act("armr"), 300, 0), K(punchR(gc, deep, 1.3).act("armr", "head"), 250, 700), K(gc, 500, 300)]);
    mv("systema.punchReturn", "Dopo il colpo il braccio si scioglie e torna per la strada più corta", [K(gc, 300, 150), K(punchR(gc).act("armr"), 300, 300), K(gc.copy().act("armr"), 500, 100), K(punchL(gc).act("arml"), 300, 300), K(gc.copy().act("arml"), 500, 300)]);
    const stepB = (b) => b.copy().step("l", 0.14).shift(0.07);
    mv("systema.punchStep", "Pugni con passo: il piede avanza e il pugno arriva insieme al peso", [K(gc, 300, 150), K(punchR(stepB(gc)).act("armr", "legl"), 260, 300), K(gc, 350, 150), K(punchL(stepB(gc)).act("arml", "legl"), 260, 300), K(gc, 350, 200)]);
    mv("systema.punchesAir", "Pugni lentissimi in aria: braccio molle, pugno chiuso solo alla fine, un'espirazione per pugno", [K(gc, 300, 150), K(midR(gc).act("armr"), 800, 0), K(punchR(gc).act("armr", "head"), 600, 300), K(gc, 700, 100), K(midL(gc).act("arml"), 800, 0), K(punchL(gc).act("arml", "head"), 600, 300), K(gc, 700, 200)]);
    // onde nelle braccia
    const armExt = () => par().handRel("r", 0.56, -0.06, 0.02, "open").elbow("r", [0, -1, 0.2]);
    const armDrop = () => par().handW("r", 0.06, 0.9, 0.25, "open");
    mv("systema.armExtend", "In piedi, braccio destro disteso avanti all'altezza del petto, palmo in basso", [K(par(), 300, 200), K(armExt().act("armr"), 600, 1000)]);
    mv("systema.armWave", "Inspira e tendi dal pugno alla spalla; espira e sciogli dalla spalla alla mano: il braccio cade", [K(armExt(), 300, 200), K(armExt().grip("r", "fist").act("armr"), 500, 300), K(inhale(armExt()).grip("r", "fist").act("armr", "torso"), 600, 400), K(armDrop().act("head"), 700, 500), K(armExt(), 700, 200)]);
    mv("systema.armIsolate", "Tendi solo il pugno, poi solo l'avambraccio, poi solo la spalla: il resto resta molle", [K(armExt(), 300, 200), K(armExt().grip("r", "fist").act("armr"), 400, 600), K(armExt(), 400, 200), K(armExt().grip("r", "blade").act("armr"), 400, 600), K(armExt(), 400, 200), K(clampH(armExt().roll(-4)).act("torso"), 400, 600), K(armExt(), 400, 200)]);
    mv("systema.fistLoose", "Pugno chiuso al massimo, spalla completamente bassa e morbida", [K(armExt(), 300, 200), K(armExt().grip("r", "fist").act("armr"), 500, 1600), K(armExt(), 500, 200)]);
    const armsExt = () => par().handRel("r", 0.54, -0.08, 0.1, "open").handRel("l", 0.54, -0.08, -0.1, "open").elbow("r", [0, -1, 0.2]).elbow("l", [0, -1, -0.2]);
    mv("systema.armWaves", "Onde nelle braccia: tendi dal pugno alla spalla inspirando, sciogli espirando", [K(par(), 300, 100), K(armsExt(), 500, 150), K(inhale(armsExt()).fists().act("arml", "armr", "torso"), 700, 300), K(par().act("head"), 700, 300), K(armsExt(), 600, 150), K(inhale(armsExt()).fists().act("arml", "armr", "torso"), 700, 300), K(par().act("head"), 700, 300)]);
    // pugno in spinta al muro (il punto fisso e' il cuscino al muro)
    const wallPt = [0.54, 1.22, 0.13];
    const wall0 = g.copy().hand("r", wallPt, "fist").elbow("r", [0, -1, 0.3]);
    const wallLean = () => {
      const b = st().foot("l", -0.08, -0.12, 5, 0).foot("r", -0.34, 0.15, -20, 15);
      b.set("pel", [-0.15, 0.9, 0.02]).set("chest", [0.03, 1.36, 0.04]).set("head", [0.08, 1.55, 0.03]).set("hipYaw", -10).set("chestYaw", -10);
      return b.hand("r", wallPt, "fist").elbow("r", [0, -1, 0.3]).handRel("l", 0.2, -0.38, -0.14, "open");
    };
    mv("systema.wallFist", "Pugno destro appoggiato al cuscino contro il muro, prime due nocche, braccio quasi disteso", [K(g, 300, 200), K(wall0.copy().act("armr"), 600, 1100)]);
    mv("systema.wallLean", "Piccolo passo indietro e lasciati inclinare: il peso passa da piedi, anche, spalla, pugno", [K(wall0, 300, 200), K(wallLean().act("legl", "legr", "torso", "armr"), 900, 1200), K(wall0, 700, 200)]);
    mv("systema.wallPush", "Spingi 5 secondi espirando; l'altra mano controlla che la spalla resti bassa", [K(wallLean(), 300, 200), K(wallLean().shift(0.03).hand("r", wallPt).handRel("l", 0.06, -0.02, 0.15, "open").elbow("l", [0, -1, -0.3]).act("armr", "torso", "head"), 800, 1800), K(wallLean(), 600, 200)]);
    const shakeArm = (k) => g.copy().handW("r", 0.05 + 0.04 * k, 0.88 - 0.03 * k, 0.28, "open").elbow("r", [0, -1, 1]).act("armr");
    mv("systema.shakeArm", "Torna, scuoti il braccio e ripeti; prova anche con il palmo", [K(wallLean(), 300, 200), K(g, 600, 100), K(shakeArm(1), 140, 0), K(shakeArm(-1), 140, 0), K(shakeArm(1), 140, 0), K(shakeArm(-1), 140, 100), K(wallLean().grip("r", "open"), 700, 800), K(g, 600, 200)]);
    // colpo di spinta col palmo al sacco
    const bagPt = [0.66, 1.22, 0.04];
    const palmR = (b0, x = 0) => reach(b0.copy().step("l", 0.1 + x).shift(0.09 + x).turn(14).hand("r", [bagPt[0] + x, bagPt[1], bagPt[2]], "open").elbow("r", [0, -1, 0.3]).heel("r", 10), "r");
    const palmL = (b0, x = 0) => reach(b0.copy().step("l", 0.1 + x).shift(0.08 + x).turn(-10).hand("l", [bagPt[0] + x, bagPt[1], -0.03], "open").elbow("l", [0, -1, -0.3]), "l");
    const bagP = { props: [BAG] };
    mv("systema.bagDistance", "Sacco all'altezza del petto, a un braccio quasi disteso: mani rilassate", [K(g, 300, 200), K(gc.copy().act("arml", "armr"), 600, 1000)], bagP);
    mv("systema.palmPush", "Colpo di spinta col palmo: base del palmo, dita rilassate, poi il peso con mezzo passo", [K(gc, 300, 200), K(palmR(gc).act("armr", "head"), 220, 120), K(palmR(gc, 0.08).act("legl", "torso"), 300, 300), K(gc, 450, 300)], bagP);
    mv("systema.palmPushL", "Colpo di spinta col palmo sinistro, il peso accompagna il sacco", [K(gc, 300, 200), K(palmL(gc).act("arml", "head"), 220, 120), K(palmL(gc, 0.08).act("legl", "torso"), 300, 300), K(gc, 450, 300)], bagP);
    const fistPushR = (b0, x = 0) => palmR(b0, x).grip("r", "fist");
    mv("systema.pushPunch", "Pugno di spinta: il pugno arriva per primo, il peso del corpo sposta il sacco", [K(gc, 300, 200), K(fistPushR(gc).act("armr", "head"), 220, 120), K(fistPushR(gc, 0.08).act("legl", "torso"), 300, 300), K(gc, 450, 300)], bagP);
    mv("systema.palmAlt", "Palmo, pugno di spinta, poi alternati: ogni colpo con un'espirazione", [K(gc, 300, 150), K(palmR(gc, 0.04).act("armr", "head"), 240, 250), K(gc, 380, 80), K(fistPushR(gc, 0.04).act("armr", "head"), 240, 250), K(gc, 380, 80), K(palmL(gc, 0.04).act("arml", "head"), 240, 250), K(gc, 380, 200)], bagP);
    const slipBag = gc.copy().step("r", 0.06, 0.16).shift(0.03, 0.12).lean(0, 0.06).turn(-15).act("legr", "torso");
    mv("systema.bagReturn", "Il sacco torna: scansati con il corpo e colpisci di nuovo col palmo", [K(gc, 300, 150), K(palmR(gc).act("armr"), 220, 200), K(gc, 350, 100), K(slipBag, 350, 200), K(reach(slipBag.copy().turn(15).shift(0.06).hand("r", [0.68, 1.2, 0.1], "open"), "r").act("armr", "head"), 220, 300), K(gc, 450, 300)], bagP);
    // calci di spinta bassi
    const sup = (b) => b.set("pel", [0.04, 0.92, -0.06]).set("chest", [0.07, 1.41, -0.05]).set("head", [0.1, 1.61, -0.05]);
    const kneeHi = () => { const b = sup(par()).footAt("r", [0.28, 0.5, 0.12], 0, 20).knee("r", [1, 0.3, 0]); return b.handRel("l", 0.2, -0.32, -0.2, "open").handRel("r", 0.2, -0.32, 0.2, "open"); };
    const pushExt = () => { const b = sup(par()).footAt("r", [0.76, 0.66, 0.1], 0, -45).knee("r", [0.2, 1, 0]); return b.handRel("l", 0.2, -0.32, -0.2, "open").handRel("r", 0.2, -0.32, 0.2, "open"); };
    mv("systema.kneeRaise", "In equilibrio sulla sinistra: solleva il ginocchio destro all'altezza dell'anca, busto dritto", [K(par(), 300, 200), K(sup(par()), 500, 100), K(kneeHi().act("legr"), 700, 1000), K(par(), 700, 200)]);
    mv("systema.pushKickSlow", "Distendi lento il piede in avanti spingendo col tallone, torna col ginocchio alto, appoggia piano", [K(par(), 300, 150), K(kneeHi().act("legr"), 700, 200), K(pushExt().act("legr", "head"), 1000, 400), K(kneeHi().act("legr"), 800, 200), K(par(), 700, 300)]);
    const lowCh = () => chestHands(gc.copy().set("pel", [0.08, 0.91, -0.04]).set("chest", [0.13, 1.39, -0.03]).set("head", [0.17, 1.59, -0.03]).footAt("r", [0.16, 0.34, 0.1], 0, 25).knee("r", [1, 0.3, 0]));
    const lowExt = () => chestHands(gc.copy().set("pel", [0.12, 0.9, -0.04]).set("chest", [0.18, 1.38, -0.02]).set("head", [0.22, 1.58, -0.02]).footAt("r", [0.74, 0.44, 0.08], 0, -40).knee("r", [0.3, 1, 0]).heel("l", 0)).act("legr", "head");
    const landFwd = () => chestHands(gc.copy().foot("r", 0.5, 0.12, -10, 0).foot("l", 0.16, -0.14, 20, 15).set("pel", [0.34, 0.91, 0.0]).set("chest", [0.37, 1.41, 0.0]).set("head", [0.4, 1.61, 0.0]).set("hipYaw", 10).set("chestYaw", 10));
    mv("systema.lowKick", "Calcio basso di spinta: ginocchio poco su, il tallone spinge alla coscia, il peso va avanti", [K(gc, 300, 150), K(lowCh().act("legr"), 220, 40), K(lowExt(), 220, 300), K(landFwd().act("legr"), 350, 300), K(gc, 500, 300)]);
    mv("systema.lowKickBack", "Calcio basso di spinta che torna al punto di partenza", [K(gc, 300, 150), K(lowCh().act("legr"), 220, 40), K(lowExt(), 220, 300), K(lowCh(), 260, 60), K(gc, 350, 300)]);
    mv("systema.lowKickL", "Calcio basso di spinta col sinistro, il piede atterra davanti come un passo", mirrorAll([K(gc, 300, 150), K(lowCh().act("legr"), 220, 40), K(lowExt(), 220, 300), K(landFwd().act("legr"), 350, 300), K(gc, 500, 300)]));
    mv("systema.lowKickBag", "Calcio basso alla parte bassa del sacco: deve oscillare, non tremare", [K(gc, 300, 150), K(lowCh().act("legr"), 220, 40), K(lowExt().footAt("r", [0.66, 0.5, 0.06], 0, -40), 220, 300), K(lowCh(), 260, 60), K(gc, 350, 300)], bagP);
    // colpire senza preparazione da posizioni normali delle braccia
    const armsSide = () => st().foot("l", 0.06, -0.14, 5, 0).foot("r", -0.06, 0.15, -15, 0);
    const handsHips = () => armsSide().handPel("l", 0.02, 0.06, -0.19, "open").handPel("r", 0.02, 0.06, 0.19, "open").elbow("l", [-0.3, 0, -1]).elbow("r", [-0.3, 0, 1]);
    const crossed = () => armsSide().handRel("l", 0.18, -0.22, 0.12, "open").handRel("r", 0.2, -0.18, -0.12, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    const scratch = () => armsSide().handHead("r", -0.02, 0.1, 0.06, "open").elbow("r", [0.3, 0.2, 1]);
    const noPrep = (start, side) => [K(start, 300, 500), K((side === "r" ? punchR(start) : punchL(start)).act(side === "r" ? "armr" : "arml", "head"), 170, 300), K(start, 400, 400)];
    mv("systema.punchFromSides", "Braccia lungo i fianchi: colpisci dritto da lì, senza riportare indietro la mano", noPrep(armsSide(), "r"));
    mv("systema.punchFromHips", "Mani sui fianchi: il pugno parte da dove si trova la mano", noPrep(handsHips(), "r"));
    mv("systema.punchFromCrossed", "Braccia incrociate: colpisci con la mano più vicina, dritto", noPrep(crossed(), "l"));
    mv("systema.punchFromHead", "Mano che gratta la testa: il pugno parte da lì, senza caricare", noPrep(scratch(), "r"));
    mv("systema.startPoses", "Posizioni di partenza normali: braccia giù, mani sui fianchi, incrociate, alla testa", [K(armsSide(), 300, 600), K(handsHips().act("arml", "armr"), 500, 600), K(crossed().act("arml", "armr"), 500, 600), K(scratch().act("armr"), 500, 600), K(armsSide(), 500, 200)]);
    // pugni da quattro posizioni
    const tk = tallKneel();
    mv("systema.punchKneel", "In ginocchio: il peso arriva spingendo l'anca avanti, busto dritto", [K(tk, 300, 200), K(tk.copy().set("pel", [0.08, 0.48, 0]).set("chest", [0.13, 0.98, 0]).set("head", [0.16, 1.18, 0]).turn(14).straight("r", [0.75, 0.98, 0.0], 0.97).act("armr", "torso"), 220, 300), K(tk, 350, 150), K(tk.copy().set("pel", [0.08, 0.48, 0]).set("chest", [0.13, 0.98, 0]).set("head", [0.16, 1.18, 0]).turn(-14).straight("l", [0.75, 0.98, 0.0], 0.97).act("arml", "torso"), 220, 300), K(tk, 350, 200)]);
    const sx = sitX();
    mv("systema.punchSeated", "Seduto: il busto ruota e porta il pugno", [K(sx, 300, 200), K(sx.copy().twist(28).lean(0.05).straight("r", [0.66, 0.62, 0.0], 0.97).act("armr", "torso"), 240, 300), K(sx, 350, 150), K(sx.copy().twist(-28).lean(0.05).straight("l", [0.66, 0.62, 0.0], 0.97).act("arml", "torso"), 240, 300), K(sx, 350, 200)]);
    const lk = lieBack({ kneesUp: true }).handW("l", -0.35, 0.33, -0.12, "fist").handW("r", -0.35, 0.33, 0.12, "fist").elbow("l", [0, -0.3, -1]).elbow("r", [0, -0.3, 1]);
    mv("systema.punchLying", "Sdraiato: pugni verso il soffitto, la scapola si stacca e la schiena ruota", [K(lk, 300, 200), K(lk.copy().set("chestRoll", 22).handW("r", -0.42, 0.74, 0.06, "fist").act("armr", "torso"), 240, 300), K(lk, 350, 150), K(lk.copy().set("chestRoll", -22).handW("l", -0.42, 0.74, -0.06, "fist").act("arml", "torso"), 240, 300), K(lk, 350, 200)]);
    // allungamento dei polsi
    const wr1 = par().handRel("r", 0.52, -0.06, 0.04, "open").elbow("r", [0, -1, 0.2]).handRel("l", 0.5, 0.02, 0.02, "open").elbow("l", [0, -1, -0.4]).act("armr");
    const wr2 = par().handRel("r", 0.52, -0.06, 0.04, "open").elbow("r", [0, -1, 0.2]).handRel("l", 0.53, -0.14, 0.03, "open").elbow("l", [0, -1, -0.4]).act("armr");
    mv("systema.wristStretch", "Polsi: braccio teso, l'altra mano porta le dita verso di te, poi verso il basso", [K(par(), 300, 150), K(wr1, 600, 1400), K(wr2, 500, 1400), K(par(), 500, 200)]);

    /* ================================================================ colonna e rotazioni */
    const sw1 = par().set("pel", [0.05, 0.95, 0]).set("chest", [-0.02, 1.44, 0]).set("head", [-0.02, 1.64, 0]).act("torso");
    const sw2 = par().set("pel", [0.02, 0.95, 0]).set("chest", [0.05, 1.45, 0]).set("head", [0.0, 1.65, 0]).act("torso");
    const sw3 = par().set("pel", [0.0, 0.95, 0]).set("chest", [0.03, 1.45, 0]).set("head", [0.08, 1.63, 0]).act("head");
    mv("systema.spineWave", "Onda della colonna in piedi: bacino avanti, poi pancia, petto, testa; poi al contrario", [K(par(), 300, 150), K(sw1, 600, 100), K(sw2, 600, 100), K(sw3, 600, 200), K(sw2, 600, 100), K(sw1, 600, 100), K(par(), 600, 200)]);
    const rot = (ch, hp) => par().twist(ch).hips(hp).handRel("l", 0.12, -0.45, -0.22, "open").handRel("r", 0.12, -0.45, 0.22, "open");
    mv("systema.rotations", "Gira solo le spalle, poi solo le anche, poi insieme", [K(par(), 300, 100), K(rot(40, 0).act("torso"), 500, 100), K(rot(-40, 0).act("torso"), 700, 100), K(rot(0, 0), 400, 50), K(rot(-30, 30).act("legl", "legr"), 500, 100), K(rot(30, -30).act("legl", "legr"), 700, 100), K(rot(0, 0), 400, 50), K(rot(40, 40).act("torso", "legl", "legr"), 500, 100), K(rot(-40, -40).act("torso", "legl", "legr"), 700, 100), K(par(), 500, 200)]);
    // srotolarsi dal muro e riappoggiarsi
    const rollDn1 = tall().set("head", [0.08, 1.6, 0]).act("head");
    const rollDn2 = tall().set("chest", [0.15, 1.4, 0]).set("head", [0.3, 1.52, 0]).handW("l", 0.12, 0.85, -0.24).handW("r", 0.12, 0.85, 0.24).act("torso", "head");
    const rollDn3 = clampH(tall().set("pel", [-0.04, 0.95, 0]).set("chest", [0.28, 1.25, 0]).set("head", [0.4, 1.1, 0]).handW("l", 0.32, 0.6, -0.2).handW("r", 0.32, 0.6, 0.2).knee("l", [1, 0, 0]).knee("r", [1, 0, 0])).act("torso");

    /* ================================================================ uscire dalla linea */
    const fh = () => faceHands(natural());
    function exitSeq(side, dir, strike, hold = 350) {
      // side -1 = esce a sinistra, +1 = a destra; dir +1 = passo avanti, -1 = indietro
      const lead = side < 0 ? "l" : "r";
      const lean = gc.copy().lean(0.02 * dir, side * 0.12, 0.03).turn(side * 14).act("torso");
      faceHands(lean);
      const st1 = gc.copy().step(lead, dir * 0.17, side * 0.2).shift(dir * 0.08, side * 0.13).lean(0, side * 0.04).turn(side * 14);
      faceHands(st1).act("leg" + lead, "torso");
      const fin = place(fh(), dir * 0.18, side * 0.22, side * 15).act("leg" + (lead === "l" ? "r" : "l"));
      const out = [K(gc, 300, 150), K(lean, 260, 40), K(st1, 260, 40), K(fin, 260, hold)];
      if (strike === "punch") out.push(K(place(punchR(fh()), dir * 0.18, side * 0.22, side * 15).act("armr", "head"), 170, 300), K(fin.copy().act(), 280, 150));
      if (strike === "palm") out.push(K(place(punchR(fh()).grip("r", "open"), dir * 0.18, side * 0.22, side * 15).act("armr", "head"), 170, 300), K(fin.copy().act(), 280, 150));
      if (strike === "kick") out.push(K(place(lowExt(), dir * 0.18, side * 0.22, side * 15), 220, 300), K(fin.copy().act(), 300, 150));
      out.push(K(gc.copy().step(lead, dir * 0.08, side * 0.1).shift(dir * 0.06, side * 0.08), 350, 40), K(gc, 300, 250));
      return out;
    }
    mv("systema.leanOut", "Tempo 1: solo il busto, piedi fermi: ruota e inclina fuori dalla linea espirando", [K(gc, 300, 150), K(faceHands(gc.copy().lean(0.02, -0.13, 0.03).turn(-14)).act("torso"), 350, 400), K(gc, 350, 150), K(faceHands(gc.copy().lean(0.02, 0.13, 0.03).turn(14)).act("torso"), 350, 400), K(gc, 350, 200)]);
    mv("systema.exitFwd", "Uscita dalla linea: prima il busto, poi un passo corto in diagonale avanti, mani morbide al viso", exitSeq(-1, 1));
    mv("systema.exitFwdR", "Uscita in diagonale avanti verso destra: il busto parte per primo, il piede segue", exitSeq(1, 1));
    mv("systema.exitBack", "Variante: passo corto in diagonale indietro, busto fuori dalla linea", exitSeq(-1, -1));
    mv("systema.exitPunch", "Esci in diagonale e dalla nuova posizione colpisci subito, senza caricare", exitSeq(-1, 1, "punch"));
    mv("systema.exitPunchR", "Esci a destra e colpisci subito con il pugno", exitSeq(1, 1, "punch"));
    mv("systema.exitPalm", "Esci dalla linea e colpisci con il palmo, espirando", exitSeq(-1, 1, "palm"));
    mv("systema.exitKick", "Esci dalla linea e spingi con un calcio basso", exitSeq(-1, 1, "kick"));
    // camminare verso un punto fisso e ruotare attorno al contatto
    (function () {
      const W = (lead, x, z, yaw) => place(walkPose(lead), x, z, yaw);
      mv("systema.turnContact", "Il punto fisso tocca il petto destro: la spalla destra arretra, la sinistra avanza, continui a camminare", [
        K(g, 300, 100), K(W("l", 0.2, 0, 0).act("legl"), 450, 50), K(W("r", 0.42, 0, 0).act("legr"), 450, 300), K(W("r", 0.5, -0.04, -45).act("torso"), 500, 200),
        K(W("l", 0.78, -0.12, -40).act("legl", "torso"), 450, 50), K(W("r", 1.05, -0.12, -10).act("legr"), 450, 200), K(W("l", 0.6, -0.06, 0), 600, 50), K(g, 600, 200)
      ]);
      mv("systema.turnContactL", "Contatto sul petto sinistro: la spalla sinistra arretra, la destra avanza", mirrorAll([
        K(g, 300, 100), K(W("l", 0.2, 0, 0).act("legl"), 450, 50), K(W("r", 0.42, 0, 0).act("legr"), 450, 300), K(W("r", 0.5, -0.04, -45).act("torso"), 500, 200),
        K(W("l", 0.78, -0.12, -40).act("legl", "torso"), 450, 50), K(W("r", 1.05, -0.12, -10).act("legr"), 450, 200), K(W("l", 0.6, -0.06, 0), 600, 50), K(g, 600, 200)
      ]));
      mv("systema.walkSlow", "Cammina lento verso la punta finché tocca il lato destro del petto", [K(g, 300, 100), K(W("l", 0.2, 0, 0).act("legl"), 600, 100), K(W("r", 0.42, 0, 0).act("legr"), 600, 900), K(W("l", 0.2, 0, 0), 600, 50), K(g, 600, 200)]);
    })();
    // onde: il punto spinto cede per primo, l'onda scende fino alle ginocchia
    function waveSeq(where) {
      const b0 = par();
      let hand, p1, p2;
      if (where === "chest") {
        hand = par().handRel("r", 0.13, -0.13, -0.02, "open").elbow("r", [0, -1, 0.5]);
        p1 = hand.copy().set("chest", [-0.06, 1.44, 0]).set("head", [-0.06, 1.64, 0]).act("torso");
        p2 = hand.copy().set("pel", [-0.05, 0.89, 0]).set("chest", [-0.07, 1.38, 0]).set("head", [-0.04, 1.58, 0]).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]).act("legl", "legr", "torso");
      } else if (where === "belly") {
        hand = par().handPel("r", 0.15, 0.1, 0.0, "open").elbow("r", [0, -1, 0.5]);
        p1 = hand.copy().set("pel", [-0.06, 0.94, 0]).set("chest", [0.02, 1.44, 0]).set("head", [0.04, 1.64, 0]).act("torso");
        p2 = hand.copy().set("pel", [-0.1, 0.88, 0]).set("chest", [0.0, 1.37, 0]).set("head", [0.04, 1.57, 0]).act("legl", "legr", "torso");
      } else {
        // spalla destra spinta dalla mano sinistra
        hand = par().handRel("l", 0.1, -0.02, 0.15, "open").elbow("l", [0, -1, -0.4]);
        p1 = hand.copy().twist(-25).act("torso");
        p2 = hand.copy().twist(-30).hips(-15).sink(0.05).set("pel", [-0.03, 0.9, 0]).act("legl", "legr", "torso");
      }
      p1.p.act = p1.p.act.concat(["head"]);
      p2.p.act = p2.p.act.concat(["head"]);
      return [K(b0, 300, 100), K(hand, 450, 200), K(p1, 500, 80), K(p2, 600, 300), K(hand.copy().act("torso"), 800, 200), K(b0, 400, 200)];
    }
    mv("systema.waveChest", "Palmo sul petto, spingi piano: cede il petto, poi la pancia, poi bacino e ginocchia", waveSeq("chest"));
    mv("systema.waveShoulder", "Spinta sulla spalla destra: la spalla cede per prima e l'onda scende, i piedi restano fermi", waveSeq("shoulder"));
    mv("systema.waveShoulderL", "Spinta sulla spalla sinistra: cede per prima, il corpo assorbe", mirrorAll(waveSeq("shoulder")));
    mv("systema.waveBelly", "Spinta sulla pancia: la pancia arretra per prima, ginocchia morbide", waveSeq("belly"));
    // assorbire la spinta dell'elastico sulla spalla: cedi, ruota, passo corto in diagonale
    (function () {
      const b0 = gc.copy().twist(-8).act();
      const y1 = gc.copy().twist(-35).hips(-10).act("torso");
      const y2 = gc.copy().turn(-60).step("r", -0.12, 0.14).shift(-0.04, 0.06).act("torso", "legr");
      const y3 = place(fh(), -0.08, 0.16, -100).act("legl");
      const seq = [K(gc, 300, 100), K(b0, 400, 200), K(y1, 450, 60), K(chestHands(y2), 400, 60), K(y3, 450, 600), K(chestHands(gc.copy().step("r", -0.06, 0.06).turn(-30)), 500, 60), K(gc, 450, 200)];
      mv("systema.yieldTurn", "L'elastico tira la spalla destra: cedi, ruota il busto e fai un passo corto in diagonale", seq);
      mv("systema.yieldTurnL", "Elastico sulla spalla sinistra: cedi, ruota e passo in diagonale", mirrorAll(seq));
      mv("systema.bandPull", "Passo avanti finché l'elastico tira la spalla destra indietro", [K(gc, 300, 100), K(gc.copy().step("l", 0.15).shift(0.08), 450, 100), K(gc.copy().move(0.15).twist(-10).act("torso"), 450, 1000), K(gc, 600, 200)]);
    })();
    // pallina appesa all'altezza del petto
    const BALL = { k: "bag", x: 0.72, z: 0, r: 0.045, y0: 1.19, y1: 1.28 };
    const ballP = { props: [BALL] };
    const ballPt = [0.67, 1.24, 0.0];
    mv("systema.ballPush", "Spingi via la pallina con la mano e aspettala rilassato, ginocchia morbide", [K(gc, 300, 150), K(reach(gc.copy().shift(0.05).hand("r", ballPt, "open"), "r").act("armr"), 300, 200), K(gc.copy().sink(0.04), 500, 600), K(gc, 400, 200)], ballP);
    (function () {
      const outL = faceHands(gc.copy().lean(0.02, -0.13, 0.04).turn(-16).sink(0.03)).act("torso");
      const tap = reach(outL.copy().hand("r", [0.68, 1.22, 0.05], "open"), "r").act("armr");
      mv("systema.ballExit", "La pallina torna: esci all'ultimo con il busto, poi toccala piano col palmo", [K(gc.copy().sink(0.04), 300, 300), K(outL, 260, 300), K(tap, 300, 300), K(gc, 400, 300)], ballP);
      const turnOut = faceHands(gc.copy().turn(-50).sink(0.03)).act("torso");
      const stepOut = faceHands(place(natural(), 0.05, 0.2, 15)).act("legr", "torso");
      mv("systema.ballDodge", "Uscite dalla pallina: busto, rotazione o passo corto in diagonale", [K(gc.copy().sink(0.04), 300, 200), K(outL, 260, 300), K(gc, 300, 100), K(turnOut, 280, 300), K(gc, 300, 100), K(stepOut, 280, 300), K(gc, 350, 200)], ballP);
      const hb = (b) => b.handPel("l", -0.17, 0.02, -0.07, "open").handPel("r", -0.17, 0.02, 0.07, "open").elbow("l", [-1, -0.5, -0.4]).elbow("r", [-1, -0.5, 0.4]);
      mv("systema.ballNoHands", "Mani dietro la schiena: esci dalla pallina solo con busto, rotazione e passi corti", [K(hb(g.copy()), 300, 200), K(hb(g.copy().lean(0.02, -0.13, 0.04).turn(-16).sink(0.03)).act("torso"), 260, 300), K(hb(g.copy()), 300, 100), K(hb(g.copy().turn(-50).sink(0.03)).act("torso"), 280, 300), K(hb(g.copy()), 300, 100), K(hb(place(natural(), 0.05, 0.2, 15)).act("legr"), 280, 300), K(hb(g.copy()), 350, 200)], ballP);
      mv("systema.ballFoot", "Spingi la pallina con la spalla e metti le mani dietro la schiena", [K(g, 300, 150), K(reach(gc.copy().shift(0.08).turn(-30).lean(0.06).hand("l", [0.3, 1.0, -0.2], "open"), "l").act("torso"), 400, 300), K(hb(g.copy()).act("arml", "armr"), 500, 800)], ballP);
    })();
    mv("systema.reachUp", "Appendi l'oggetto in alto, all'altezza giusta", [K(g, 300, 150), K(clampH(par().heel("l", 15).heel("r", 15).handW("l", 0.3, 1.9, -0.06, "open").handW("r", 0.3, 1.92, 0.06, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1])).act("arml", "armr"), 600, 1000), K(g, 600, 200)]);
    // lavoro di piedi attorno a un punto, busto sempre girato verso il centro
    (function () {
      const R = 0.8;
      const P = (deg, lead) => { const a = deg * Math.PI / 180; const b = place(chestHands(natural()), R - R * Math.cos(a), -R * Math.sin(a), -deg); if (lead) b.act("leg" + lead); return b; };
      mv("systema.circleWalk", "Passi corti attorno al punto, peso su entrambi i piedi, busto girato verso il centro", [K(gc, 300, 100), K(P(18, "l"), 330, 40), K(P(36, "r"), 330, 40), K(P(54, "l"), 330, 100), K(P(36, "r"), 330, 40), K(P(18, "l"), 330, 40), K(P(0, "r"), 330, 40), K(P(-18, "r"), 330, 40), K(P(-36, "l"), 330, 100), K(P(-18, "r"), 330, 40), K(gc, 330, 200)]);
      const D = (x, z, yaw, lead) => place(chestHands(natural()), x, z, yaw).act("leg" + lead);
      mv("systema.diagSteps", "Avvicinati e allontanati in diagonale, mai dritto, ginocchia morbide", [K(gc, 300, 100), K(D(0.2, -0.18, -10, "l"), 330, 60), K(D(0.4, -0.02, 10, "r"), 330, 120), K(D(0.2, 0.16, 10, "r"), 330, 60), K(gc, 330, 200)]);
    })();
    // il sacco che torna: spingi, esci, colpisci di lato
    (function () {
      const outB = faceHands(place(natural(), 0.12, -0.3, -20)).act("legl", "torso");
      const hitB = reach(place(chestHands(natural()), 0.12, -0.3, -20).turn(14).hand("r", [0.74, 1.15, -0.17], "fist"), "r").act("armr", "head");
      mv("systema.bagExitHit", "Spingi il sacco, esci quando torna e colpiscilo di lato senza caricare", [K(gc, 300, 150), K(palmR(gc).act("armr"), 220, 200), K(gc.copy().sink(0.04), 400, 300), K(outB, 300, 200), K(hitB, 200, 300), K(outB.copy().act(), 300, 100), K(gc, 450, 200)], bagP);
      const outB2 = faceHands(place(natural(), 0.05, 0.32, 25)).act("legr", "torso");
      const hitB2 = reach(place(chestHands(natural()), 0.05, 0.32, 25).turn(-10).hand("l", [0.76, 1.15, 0.17], "open"), "l").act("arml", "head");
      mv("systema.bagExitHitR", "Esci dall'altro lato e colpisci il sacco col palmo", [K(gc, 300, 150), K(palmR(gc).act("armr"), 220, 200), K(gc.copy().sink(0.04), 400, 300), K(outB2, 300, 200), K(hitB2, 200, 300), K(outB2.copy().act(), 300, 100), K(gc, 450, 200)], bagP);
    })();

    /* ================================================================ a terra contro chi è in piedi */
    const lieGuard = () => lieBack({ kneesUp: true }).set("head", [-0.7, 0.21, 0]).handW("l", -0.4, 0.45, -0.1, "open").handW("r", -0.4, 0.45, 0.1, "open").elbow("l", [0.3, -0.3, -1]).elbow("r", [0.3, -0.3, 1]);
    const shrimp = () => {
      const b = lieBack({ kneesUp: true }).set("pel", [-0.2, 0.17, -0.12]).set("chest", [-0.62, 0.2, 0.08]).set("head", [-0.78, 0.33, 0.12]).set("hipRoll", 60).set("chestRoll", 40);
      b.footAt("r", [0.25, 0.08, 0.12], 0, 0).footAt("l", [0.1, 0.12, -0.12], 0, 0, 40).knee("r", [0.3, 1, 0.2]).knee("l", [0.4, 0.6, -0.6]);
      b.handW("l", -0.08, 0.36, -0.08, "open").handW("r", -0.1, 0.4, 0.06, "open").elbow("l", [0, -0.3, -1]).elbow("r", [0, -0.3, 1]);
      return clampH(b);
    };
    mv("systema.lieGuard", "Sdraiato sulla schiena, ginocchia piegate, mani davanti al viso, mento al petto", [K(lieBack({ kneesUp: true }), 300, 150), K(lieGuard().act("arml", "armr", "head"), 600, 1000)]);
    mv("systema.hipEscape", "Spingi col piede destro: il bacino va indietro e a sinistra, ti giri sul fianco, le mani spingono", [K(lieGuard(), 300, 150), K(shrimp().act("torso", "legr", "arml", "armr"), 500, 600), K(lieGuard(), 500, 200)]);
    mv("systema.hipEscapeL", "Spostamento d'anca verso l'altro lato", mirrorAll([K(lieGuard(), 300, 150), K(shrimp().act("torso", "legr", "arml", "armr"), 500, 600), K(lieGuard(), 500, 200)]));
    mv("systema.hipEscapeBoth", "Spostamento d'anca a destra e a sinistra, espira a ogni spinta", [K(lieGuard(), 300, 150), K(shrimp().act("torso", "legr", "arml", "armr"), 500, 400), K(lieGuard(), 500, 150), K(shrimp().mirror().act("torso", "legl", "arml", "armr"), 500, 400), K(lieGuard(), 500, 200)]);
    // difesa sulla schiena: piede sinistro a terra fa perno, gamba destra piegata in alto pronta
    const backG = () => lieGuard().footAt("r", [0.3, 0.5, 0.12], 0, -40).knee("r", [0, 1, 0.2]).footAt("l", [0.42, 0.08, -0.15], 0, 0);
    const heel = () => backG().footAt("r", [0.8, 0.46, 0.1], 0, -70).knee("r", [0, 1, 0]).act("legr", "head");
    mv("systema.backGuard", "Sulla schiena, testa su, mani al viso: piede sinistro a terra, gamba destra piegata in alto", [K(lieBack({ kneesUp: true }), 300, 150), K(backG().act("legr", "arml", "armr"), 600, 1000)]);
    mv("systema.backPivot", "Spingi col piede a terra e ruota sulla schiena: i piedi seguono l'attaccante", [K(backG(), 300, 150), K(backG().spin(40).act("legl", "torso"), 500, 300), K(backG().spin(-40).act("legl", "torso"), 800, 300), K(backG(), 500, 200)]);
    mv("systema.heelPush", "Quando si avvicina: spinta col tallone destro verso le anche, espira, ritira subito", [K(backG(), 300, 200), K(heel(), 200, 300), K(backG(), 250, 300)]);
    mv("systema.backDefense", "Ruota per tenere i piedi verso di lui, spingi col tallone e ritira", [K(backG(), 300, 150), K(backG().spin(35).act("legl", "torso"), 450, 200), K(heel().spin(35), 200, 250), K(backG().spin(35), 250, 150), K(backG().spin(-30).act("legl", "torso"), 600, 200), K(heel().spin(-30), 200, 250), K(backG(), 450, 200)]);
    mv("systema.backGuardSwap", "Cambia gamba alta: ora il piede destro a terra e la sinistra pronta", [K(backG(), 300, 300), K(backG().mirror().act("legl", "legr"), 600, 800), K(backG(), 600, 200)]);
    // alzate da ogni posizione
    mv("systema.upFromBack", "Dalla schiena: rotola sul fianco, seduto su un'anca con la mano dietro, alzata di sicurezza", [K(lieF(), 300, 150), K(place(onSide(), 0.22, -0.06).act("torso"), 500, 100), K(safeSit(true).act("torso", "armr"), 500, 100), K(safeHips().act("torso", "legl"), 450, 80), K(safeLeg().act("legr"), 450, 80), K(safeEnd().act("legl", "legr"), 500, 500)]);
    const belly1 = () => { const b = lieFront().set("pel", [0, 0.2, 0.04]).set("chest", [0.47, 0.25, 0]).set("head", [0.66, 0.34, 0.0]);
      b.footAt("r", [-0.45, 0.07, 0.42], 180, 0, 180).knee("r", [0.5, -0.3, 1]);
      b.handHead("l", 0.12, 0.05, 0.02, "open").elbow("l", [0.5, -1, -0.5]).handW("r", 0.55, 0.05, 0.28, "open").elbow("r", [-0.3, -1, 0.5]);
      return clampH(b); };
    const belly2 = () => { const b = allFours().handHead("l", 0.15, 0.02, 0.03, "open").elbow("l", [0.3, -1, -0.5]).set("chest", [0.12, 0.66, 0]).set("head", [0.32, 0.76, 0]); return reach(b, "r"); };
    const belly3 = () => faceHands(halfKneel("l")).move(-0.05);
    mv("systema.upFromBelly", "Dalla pancia: ginocchio sotto di lato, avambraccio davanti alla testa, poi un piede e su, allontanandoti", [K(lieFront(), 300, 150), K(belly1().act("legr", "arml"), 500, 150), K(belly2().act("legl", "legr"), 500, 150), K(belly3().act("legl", "legr"), 500, 150), K(place(fh(), -0.35, 0, 0).act("legl", "legr"), 500, 500)]);
    mv("systema.upFromSide", "Dal fianco: spingi con la mano a terra, vai seduto e alzati in sicurezza", [K(place(onSide(), 0.22, -0.06), 300, 200), K(safeSit(true).act("torso", "armr"), 600, 100), K(safeHips().act("torso", "legl"), 450, 80), K(safeLeg().act("legr"), 450, 80), K(safeEnd().act("legl", "legr"), 500, 500)]);
    mv("systema.lieBelly", "A terra sulla pancia, respira lento in attesa del segnale", [K(lieFront(), 400, 400), K(lieFront().set("chest", [0.5, 0.17, 0]).act("torso"), 1200, 200), K(lieFront(), 1200, 200)]);

    /* ================================================================ bastone corto (la mano lo impugna; il bastone non e' disegnato) */
    const sk0 = () => gc.copy().handRel("r", 0.3, -0.16, 0.08, "fist").elbow("r", [0, -1, 0.3]);
    const skAt = (b, f, u, r, tw = 0) => { const c = b.copy().twist(tw); return clampH(c.handRel("r", f, u, r, "fist").elbow("r", [0, -1, 0.4])).act("armr"); };
    mv("systema.stickGrip", "Presa morbida: pollice e indice chiudono, le altre dita accompagnano senza stringere", [K(gc, 300, 200), K(sk0().act("armr"), 600, 1200)]);
    mv("systema.stickCircles", "Bastone verticale davanti al petto: piccoli cerchi con la punta girando il polso", [K(sk0(), 300, 100), K(skAt(sk0(), 0.32, -0.1, 0.08), 250, 0), K(skAt(sk0(), 0.32, -0.16, 0.14), 250, 0), K(skAt(sk0(), 0.32, -0.22, 0.08), 250, 0), K(skAt(sk0(), 0.32, -0.16, 0.02), 250, 0), K(skAt(sk0(), 0.32, -0.1, 0.08), 250, 0), K(skAt(sk0(), 0.32, -0.16, 0.02), 250, 0), K(skAt(sk0(), 0.32, -0.22, 0.08), 250, 0), K(skAt(sk0(), 0.32, -0.16, 0.14), 250, 0), K(sk0(), 250, 200)]);
    mv("systema.stickTilt", "Bastone inclinato in avanti: piccole rotazioni del polso a destra e a sinistra, lente", [K(sk0(), 300, 100), K(skAt(sk0(), 0.4, -0.2, 0.0), 450, 150), K(skAt(sk0(), 0.4, -0.2, 0.16), 550, 150), K(skAt(sk0(), 0.4, -0.2, 0.0), 550, 150), K(skAt(sk0(), 0.4, -0.2, 0.16), 550, 150), K(sk0(), 400, 200)]);
    mv("systema.stickSide", "Cerchi verticali al lato destro: la punta va avanti, in basso, indietro e in alto", [K(sk0(), 300, 100), K(skAt(sk0(), 0.22, -0.4, 0.3), 260, 0), K(skAt(sk0(), 0.05, -0.54, 0.31), 260, 0), K(skAt(sk0(), -0.08, -0.4, 0.31), 260, 0), K(skAt(sk0(), 0.05, -0.26, 0.31), 260, 0), K(skAt(sk0(), 0.22, -0.4, 0.3), 260, 0), K(skAt(sk0(), 0.05, -0.54, 0.31), 260, 0), K(skAt(sk0(), -0.08, -0.4, 0.31), 260, 0), K(skAt(sk0(), 0.05, -0.26, 0.31), 260, 0), K(sk0(), 300, 200)]);
    const eight = (b, k = 1) => [
      K(skAt(b, 0.3, 0.04, 0.26, -5 * k), 300, 40), K(skAt(b, 0.42, -0.4, -0.16, 18 * k).act("armr", "torso"), 380, 40), K(skAt(b, 0.36, -0.3, -0.2, 14 * k), 200, 0),
      K(skAt(b, 0.3, 0.04, -0.14, 8 * k), 260, 40), K(skAt(b, 0.42, -0.4, 0.3, -16 * k).act("armr", "torso"), 380, 40), K(skAt(b, 0.36, -0.3, 0.34, -12 * k), 200, 0)
    ];
    mv("systema.stickEight", "Otto davanti: diagonale dall'alto a destra al basso a sinistra, il polso gira, diagonale opposta", [K(sk0(), 300, 100)].concat(eight(sk0()), eight(sk0()), [K(sk0(), 350, 200)]));
    mv("systema.stickEightL", "Otto con la mano sinistra: stesse diagonali, polso morbido", mirrorAll([K(sk0(), 300, 100)].concat(eight(sk0()), eight(sk0()), [K(sk0(), 350, 200)])));
    (function () {
      const a = sk0().step("l", 0.18).shift(0.1);
      const b = place(sk0(), 0.2, 0, 0).step("r", 0.2).shift(0.1);
      const e1 = eight(a).slice(0, 3).map((f, i) => (i === 1 ? K(f.p.copy().act("armr", "legl"), f.t, f.h) : f));
      const e2 = eight(b).slice(3, 6).map((f, i) => (i === 1 ? K(f.p.copy().act("armr", "legr"), f.t, f.h) : f));
      mv("systema.stickEightStep", "Otto con un passo in avanti a ogni diagonale", [K(sk0(), 300, 100)].concat(e1, e2, [K(place(sk0(), 0.2, 0, 0), 400, 60), K(sk0(), 450, 200)]));
      const ex = place(sk0(), 0.18, -0.22, -15).act("legl", "torso");
      mv("systema.stickExit", "A ogni attacco esci in diagonale avanti: il bastone continua a girare in otto", [K(sk0(), 300, 100)].concat(eight(sk0()).slice(0, 3), [K(ex, 300, 60)], eight(ex).slice(3, 6), [K(sk0(), 450, 200)]));
      const turnS = place(sk0(), 0.05, 0.12, -60).act("torso", "legr");
      mv("systema.stickTurn", "Ruota attorno a un colpo immaginario: il bastone passa dall'altro lato del corpo", [K(sk0(), 300, 100), K(skAt(sk0(), 0.3, 0.04, 0.26), 300, 60), K(skAt(turnS, 0.36, -0.36, -0.22, 10), 450, 200), K(skAt(turnS, 0.3, 0.04, -0.14), 300, 60), K(sk0(), 450, 200)]);
    })();
    // passaggi attorno al corpo e da una mano all'altra
    (function () {
      const w = (b, rx, rz, lx, lz) => b.copy().handPel("r", rx, 0.08, rz, "fist").handPel("l", lx, 0.08, lz, "open").elbow("r", [-0.5, -1, 0.5]).elbow("l", [-0.5, -1, -0.5]);
      const p0 = w(g, 0.22, 0.12, 0.22, -0.12);
      const p1 = w(g, -0.02, 0.27, 0.2, -0.18).act("armr");
      const p2 = w(g, -0.17, 0.06, -0.17, -0.06).grip("l", "fist").act("arml", "armr");
      const p3 = w(g, 0.18, 0.2, -0.03, -0.27).grip("l", "fist").grip("r", "open").act("arml");
      mv("systema.stickAround", "Bastone davanti alla vita: passalo dietro la schiena da destra a sinistra e riprendilo davanti", [K(p0, 300, 100), K(p1, 350, 40), K(p2, 350, 60), K(p3, 350, 40), K(p0.copy().act("arml", "armr"), 350, 200)]);
      const c0 = sk0().handRel("l", 0.3, -0.2, -0.1, "open");
      const c1 = sk0().handRel("r", 0.34, -0.12, 0.04, "open").handRel("l", 0.33, -0.15, -0.02, "fist").act("arml", "armr");
      mv("systema.stickPass", "Davanti al petto la destra lancia appena il bastone, la sinistra lo prende in verticale", [K(c0, 300, 150), K(c0.copy().handRel("r", 0.3, -0.06, 0.06, "fist").act("armr"), 200, 0), K(c1, 200, 400), K(c0.copy().handRel("r", 0.3, -0.16, 0.08, "open").handRel("l", 0.32, -0.12, -0.06, "fist"), 300, 150), K(c0, 400, 200)]);
    })();
    // colpi di bastone al sacco: il colpo nasce dall'otto e il bastone continua il giro
    const stHigh = skAt(sk0(), 0.25, 0.08, 0.28, -15);
    const stHit = reach(sk0().turn(20).handRel("r", 0.45, -0.3, 0.02, "fist"), "r", 0.95).act("armr", "torso", "head");
    const stLow = skAt(sk0(), 0.35, -0.45, -0.25, 25);
    mv("systema.stickStrike", "Diagonale di bastone: la presa si chiude solo al contatto, poi il giro continua", [K(sk0(), 300, 100), K(stHigh, 300, 80), K(stHit, 220, 80), K(stLow, 250, 100), K(skAt(sk0(), 0.3, 0.04, -0.14), 300, 60), K(sk0(), 350, 200)], bagP);
    const hzA = skAt(sk0(), 0.15, -0.38, 0.36, -25);
    const hzHit = reach(sk0().turn(25).handRel("r", 0.48, -0.42, 0.0, "fist"), "r", 0.95).act("armr", "torso", "head");
    const hzB = skAt(sk0(), 0.3, -0.38, -0.32, 35);
    mv("systema.stickHoriz", "Colpo orizzontale all'altezza della vita: il busto ruota, il bastone prosegue", [K(sk0(), 300, 100), K(hzA, 300, 80), K(hzHit, 220, 80), K(hzB, 250, 100), K(sk0(), 400, 200)], bagP);
    mv("systema.stickPalm", "Diagonale di bastone al sacco, poi palmo di spinta con la mano libera", [K(sk0(), 300, 100), K(stHigh, 300, 80), K(stHit, 220, 80), K(stLow, 250, 60), K(clampH(reach(stLow.copy().turn(-30).shift(0.06).hand("l", [0.67, 1.2, -0.04], "open"), "l")).act("arml", "head"), 220, 300), K(sk0(), 450, 200)], bagP);
    mv("systema.stickAir", "Otto lento nell'aria, poi lascia che una diagonale tocchi il bersaglio", [K(sk0(), 300, 100)].concat(eight(sk0()).slice(0, 3), [K(stHigh, 300, 60), K(stHit, 250, 300), K(stLow, 250, 80), K(sk0(), 350, 200)]), bagP);

    /* ================================================================ piu' attaccanti */
    (function () {
      const A = place(fh(), 0.15, -0.3, 30).act("legl", "torso");
      const A1 = place(punchL(fh()), 0.15, -0.3, 30).act("arml", "head");
      const B = place(fh(), 0.0, -0.45, -60).act("torso", "legr");
      const B1 = place(punchR(fh()).grip("r", "open"), 0.0, -0.45, -60).act("armr", "head");
      const C = place(fh(), -0.2, -0.2, -20).act("legl", "legr");
      mv("systema.multiShadow", "Contro più attaccanti: spostati verso l'esterno, colpo breve, poi verso il prossimo angolo", [K(gc, 300, 100), K(A, 330, 60), K(A1, 160, 200), K(B, 330, 60), K(B1, 160, 200), K(C, 380, 100), K(gc, 380, 200)]);
    })();

    /* ================================================================ preparare, filmarsi, controllare */
    const bendDown = () => squat(0.9).handW("r", 0.42, 0.07, 0.16, "open").handRel("l", 0.25, -0.3, -0.18, "open").elbow("r", [0, -1, 0.5]);
    mv("systema.setPhone", "Prepara lo spazio: appoggia il telefono a terra e torna al tuo posto", [K(g, 300, 100), K(clampH(bendDown()).act("armr", "legl", "legr"), 600, 400), K(g, 600, 200)]);
    const phone = () => g.copy().handRel("l", 0.26, -0.24, -0.04, "open").handRel("r", 0.26, -0.24, 0.05, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]).headTo(0.02, -0.03, 0);
    mv("systema.review", "Riguarda il video al rallentatore e annota cosa correggere", [K(g, 300, 100), K(phone().act("arml", "armr", "head"), 500, 1600), K(g, 500, 200)]);
    const pulse = () => g.copy().handRel("l", 0.28, -0.3, 0.0, "open").handRel("r", 0.3, -0.27, 0.05, "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]).headTo(0.02, -0.03, 0);
    mv("systema.pulse", "Conta il battito al polso con indice e medio per 15 secondi", [K(g, 300, 100), K(pulse().act("arml", "armr", "head"), 500, 1800), K(g, 500, 200)]);
    mv("systema.placeChest", "Sistema l'attrezzo all'altezza del petto davanti a te", [K(g, 300, 100), K(clampH(g.copy().lean(0.05).handRel("l", 0.5, -0.18, -0.1, "open").handRel("r", 0.5, -0.18, 0.1, "open")).act("arml", "armr"), 600, 900), K(g, 600, 200)]);
    mv("systema.bandOn", "Elastico ancorato dietro, all'altezza del petto, appoggiato sulla spalla destra", [K(g, 300, 100), K(g.copy().handRel("l", 0.12, -0.02, 0.16, "open").elbow("l", [0, -1, -0.4]).act("arml"), 600, 1000), K(g, 600, 200)]);
    mv("systema.checkSpot", "Guarda e controlla il punto a terra davanti a te", [K(g, 300, 100), K(g.copy().lean(0.05).headTo(0.04, -0.06, 0).act("head"), 500, 1300), K(g, 500, 200)]);

    /* ================================================================ varianti e passaggi per i singoli passi */
    const slowK = (frames, k) => frames.map((f) => K(f.p, Math.round(f.t * k), Math.round(f.h * k), f.act, f.partner));
    // respiro da sdraiato: solo l'espirazione lunga, e il respiro "a ruota" senza pause
    (function () {
      const a = lieK();
      const bIn = a.copy().handW("l", -0.15, 0.29, -0.05).handW("r", -0.42, 0.3, 0.07).set("pel", [0, 0.135, 0]).set("chest", [-0.5, 0.15, 0]);
      mv("systema.lieExhale", "Espira dalla bocca, labbra socchiuse, a lungo: la schiena si appoggia di più", [K(a, 300, 150), K(bIn.copy().act("torso"), 700, 100), K(a.copy().set("chest", [-0.5, 0.125, 0]).act("head", "torso"), 2600, 500), K(a, 400, 150)]);
      mv("systema.lieBreathWheel", "Nessuna pausa tra le fasi: il respiro gira come una ruota", [K(a, 300, 0), K(bIn.copy().act("torso"), 1300, 0), K(a.copy().act("head"), 1700, 0), K(bIn.copy().act("torso"), 1300, 0), K(a.copy().act("head"), 1700, 200)]);
      const f = lieF();
      const tense = f.copy().footAt("l", [0.88, 0.09, -0.12], 0, -55).footAt("r", [0.88, 0.09, 0.12], 0, -55).handW("l", -0.02, 0.07, -0.26, "fist").handW("r", -0.02, 0.07, 0.26, "fist").elbow("l", [0, 1, -0.3]).elbow("r", [0, 1, 0.3]).set("head", [-0.71, 0.15, 0]);
      mv("systema.waveRelease", "Corpo tutto teso, poi un'unica espirazione lunga: lascia andare tutto insieme", [K(f, 300, 100), K(tense.copy().act("legl", "legr", "torso", "arml", "armr", "head"), 700, 700), K(f.copy().act("head"), 2200, 700)]);
    })();
    // forma al muro
    const wallSt = () => tall().foot("l", 0, -0.12, 6, 0).foot("r", 0, 0.12, -6, 0).sink(0.01);
    mv("systema.wallStand", "Talloni, glutei, scapole e nuca vicino al muro, ginocchia morbide", [K(st(), 300, 150), K(wallSt().act("torso", "head"), 700, 1200)]);
    mv("systema.lumbarCheck", "La mano scorre dietro la zona lombare: passa appena, senza schiacciare", [K(wallSt(), 300, 200), K(wallSt().handPel("r", -0.15, 0.08, 0.05, "open").elbow("r", [-0.3, -1, 1]).act("armr"), 700, 1300), K(wallSt(), 600, 200)]);
    mv("systema.headCheck", "Controlla la forma: la testa tende a scivolare avanti, riportala sopra il bacino", [K(wallSt(), 300, 200), K(wallSt().lean(0.03).headTo(0.1, -0.03, 0).act("head"), 700, 900), K(wallSt().act("head"), 700, 900), K(wallSt(), 300, 100)]);
    // squat: in basso inverti piano, come una ruota
    mv("systema.squatBottom", "In basso non fermarti e non rimbalzare: inverti piano, come una ruota", [K(sqS(), 300, 100), K(sqM().act("legl", "legr"), 1200, 0), K(sqB().set("pel", [-0.16, 0.51, 0]).act("legl", "legr"), 1300, 0), K(sqB().set("pel", [-0.1, 0.54, 0]).act("legl", "legr"), 900, 0), K(sqM().act("legl", "legr"), 1300, 0), K(sqS(), 1200, 300)]);
    mv("systema.squatBurst", "In tenuta bassa arriva il bruciore: 5-8 raffiche, poi respiro lento", [K(sqS(), 300, 100), K(sqB().act("legl", "legr"), 900, 400), K(inhale(sqB(), 0.7).act("torso"), 150, 40), K(sqB().act("head"), 150, 40), K(inhale(sqB(), 0.7).act("torso"), 150, 40), K(sqB().act("head"), 150, 40), K(inhale(sqB(), 0.7).act("torso"), 150, 40), K(sqB().act("head"), 150, 600), K(sqS(), 900, 200)]);
    // pugni a terra: controllo del polso e tenuta col respiro
    mv("systema.fistCheck", "Controlla di lato: dorso della mano e avambraccio in linea dritta", [K(af(), 300, 200), K(af().set("head", [0.4, 0.55, -0.04]).look(-45).act("head", "arml"), 600, 1300), K(af(), 500, 200)]);
    mv("systema.fistRelax", "A ogni espirazione sciogli un po' di più una zona, senza perdere la forma", [K(fp(), 300, 150), K(inhale(fp(), 0.6).act("torso"), 900, 200), K(fp().act("head"), 1200, 300), K(inhale(fp(), 0.6).act("torso"), 900, 200), K(fp().act("legl", "legr"), 1200, 300), K(fp(), 400, 150)]);
    mv("systema.pushupTurnR", "Piegamento lento sui pugni, in alto apri il corpo a sinistra e il braccio destro al soffitto", [K(fp(), 300, 150), K(fpDown().act("arml", "armr"), 1800, 0), K(fp().act("arml", "armr"), 1800, 100), K(sidePl().act("torso", "armr"), 900, 900), K(fp(), 800, 200)]);
    mv("systema.pushupTurnL", "Torna giù e ripeti: apri il corpo dall'altro lato, braccio sinistro al soffitto", [K(fp(), 300, 150), K(fpDown().act("arml", "armr"), 1800, 0), K(fp().act("arml", "armr"), 1800, 100), K(sidePl().mirror().act("torso", "arml"), 900, 900), K(fp(), 800, 200)]);
    // a terra e su, partendo da sdraiato
    mv("systema.upAndDown", "Da sdraiato rialzati lento passando dal fianco, poi torna giù", [K(lieDownK(), 300, 150), K(onSide().act("torso"), 700, 100), K(hipUp().act("torso", "armr"), 700, 100), K(kneeUp(), 700, 100), K(g.copy().act("legl", "legr"), 700, 300), K(crouch().act("legl", "legr"), 700, 100), K(sideSit().act("torso", "armr"), 700, 100), K(lieDownK().act("torso"), 700, 300)]);
    mv("systema.rockForward", "Inspira e torna avanti fino a sederti, mani sugli stinchi, senza spingere a terra", [K(ballBack(), 300, 300), K(ballSit().act("torso"), 900, 900), K(ballBack(), 800, 200)]);
    mv("systema.halfRollL", "Mezza capriola dall'altro lato, sulla spalla sinistra", mirrorAll([K(RF.hk, 300, 150), K(RF.f1.copy().act("arml", "armr", "head"), 600, 150), K(RF.f2.copy().act("torso", "head"), 600, 100), K(RF.f3.copy().act("torso"), 600, 100), K(halfEnd(RF).act("legl", "legr"), 600, 800)]));
    mv("systema.halfRollHugL", "Mezza capriola col cuscino sulla spalla sinistra", mirrorAll([K(RH.hk, 300, 150), K(RH.f1.copy().act("head", "torso"), 600, 150), K(RH.f2.copy().act("torso", "head"), 600, 100), K(RH.f3.copy().act("torso"), 600, 100), K(halfEnd(RH).act("legl", "legr"), 600, 800)]));
    mv("systema.rollHugPrep", "Testa girata a sinistra, la spalla destra scende verso il materasso vicino al ginocchio", [K(RH.hk, 300, 200), K(RH.f1.copy().look(50).act("head", "torso"), 800, 1300), K(RH.hk, 600, 200)]);
    mv("systema.rollFwdHugL", "Capriola in avanti col cuscino sulla spalla sinistra", mirrorAll(rollSeq(RH, 0)));
    mv("systema.rollBackHugL", "Capriola indietro col cuscino sopra la spalla sinistra", mirrorAll(rollBSeq(RBH, 0)));
    mv("systema.toBelly", "Scendi in avanti sulle mani e mettiti a pancia in giù", [K(g, 300, 100), K(crouch().act("legl", "legr"), 500, 80), K(allFours().act("arml", "armr"), 500, 80), K(lieFront().act("torso"), 600, 300)]);
    mv("systema.kneelUp", "Dal ginocchio alzati in sicurezza, mani al viso, un passo indietro", [K(faceHands(halfKneel("r")), 300, 200), K(place(fh(), -0.3, 0.02, 0).act("legl", "legr"), 700, 400), K(g, 600, 200)]);
    // flusso a terra: caduta laterale, difesa sulla schiena, alzata di sicurezza
    (function () {
      const lie = place(backG(), -0.3, 0.25, -15);
      const kick = place(heel(), -0.3, 0.25, -15);
      mv("systema.groundFlow", "Flusso a terra: caduta bassa, piedi verso l'attaccante, spinta, alzata di sicurezza", [
        K(g, 300, 80), K(FS.c.copy().act("legl", "legr"), 400, 60), K(FS.s1.copy().act("legr"), 400, 60), K(FS.s2.copy().act("torso", "armr"), 400, 60), K(lie.act("torso", "legr"), 450, 200),
        K(kick, 200, 250), K(lie.copy().act(), 250, 100), K(safeSit(true).act("torso", "armr"), 500, 80), K(safeHips().act("torso", "legl"), 400, 60), K(safeLeg().act("legr"), 400, 60), K(safeEnd().act("legl", "legr"), 450, 300), K(g, 500, 200)
      ]);
      // catena: uscita, palmo, caduta laterale, alzata di sicurezza
      const ex = exitSeq(-1, 1, "palm").slice(0, 5);
      const at = (b) => place(b, 0.18, -0.22, -15);
      const chain = ex.concat([K(at(FS.c).act("legl", "legr"), 380, 40), K(at(FS.s1).act("legr"), 380, 40), K(at(FS.s2).act("torso", "armr"), 380, 60), K(at(safeSit(true)).act("torso", "armr"), 450, 60), K(at(safeHips()).act("torso", "legl"), 380, 40), K(at(safeLeg()).act("legr"), 380, 40), K(at(safeEnd()).act("legl", "legr"), 420, 250), K(gc, 600, 200)]);
      mv("systema.chain", "Catena: esci, colpisci senza caricare, cadi di lato, alzata di sicurezza", chain);
      mv("systema.chainL", "La catena dall'altro lato: uscita, colpo, caduta, alzata", mirrorAll(chain));
    })();
    // colpi e calci
    mv("systema.palmStrike", "Mano aperta, dita rilassate: colpisci con la base del palmo, polso piegato indietro", [K(gc, 300, 200), K(reach(gc.copy().turn(12).shift(0.05).hand("r", bagPt, "open"), "r").act("armr", "head"), 220, 400), K(gc, 400, 300)], bagP);
    mv("systema.weightShift", "In piedi, ginocchia morbide, peso sulla gamba sinistra", [K(par(), 300, 200), K(sup(par()).act("legl"), 700, 1200), K(par(), 600, 200)]);
    mv("systema.pushKickSlowL", "Lo stesso con l'altra gamba: ginocchio alto, spingi col tallone, appoggia piano", mirrorAll([K(par(), 300, 150), K(kneeHi().act("legr"), 700, 200), K(pushExt().act("legr", "head"), 1000, 400), K(kneeHi().act("legr"), 800, 200), K(par(), 700, 300)]));
    const wrapP = (dy, dz) => g.copy().handRel("r", 0.32, -0.26, 0.04, "fist").handRel("l", 0.3, -0.26 + dy, 0.04 + dz, "open").elbow("r", [0, -1, 0.3]).elbow("l", [0, -1, -0.4]).act("arml");
    mv("systema.wrapHands", "Prepara bende e guanti: la mano gira attorno al polso", [K(g, 300, 100), K(wrapP(0.06, 0), 350, 0), K(wrapP(0, 0.07), 250, 0), K(wrapP(-0.06, 0), 250, 0), K(wrapP(0, -0.07), 250, 0), K(wrapP(0.06, 0), 250, 0), K(wrapP(0, 0.07), 250, 0), K(wrapP(-0.06, 0), 250, 100), K(g, 400, 200)]);
    (function () {
      const R = 0.86;
      const P = (deg, lead) => { const a = deg * Math.PI / 180; const b = place(chestHands(natural()), R - R * Math.cos(a), -R * Math.sin(a), -deg); if (lead) b.act("leg" + lead); return b; };
      mv("systema.bagCircle", "Dopo 3-4 colpi muoviti attorno al sacco con passi naturali", [K(gc, 300, 100), K(P(20, "l"), 330, 40), K(P(40, "r"), 330, 40), K(P(60, "l"), 330, 200), K(P(40, "r"), 330, 40), K(P(20, "l"), 330, 40), K(P(0, "r"), 330, 40), K(P(-20, "r"), 330, 40), K(P(-40, "l"), 330, 200), K(P(-20, "r"), 330, 40), K(gc, 330, 200)], bagP);
      const R2 = 0.8;
      const P2 = (deg, lead) => { const a = deg * Math.PI / 180; const b = place(chestHands(natural()), R2 - R2 * Math.cos(a), -R2 * Math.sin(a), -deg); if (lead) b.act("leg" + lead); return b; };
      mv("systema.circleWalk2", "Cammina attorno al punto con passi corti e leggeri, braccia sciolte", [K(gc, 300, 100), K(P2(18, "l"), 330, 40), K(P2(36, "r"), 330, 40), K(P2(54, "l"), 330, 40), K(P2(72, "r"), 330, 40), K(P2(90, "l"), 330, 150), K(P2(60, "r"), 400, 40), K(P2(30, "l"), 400, 40), K(gc, 400, 200)]);
      const SK = (deg, lead) => { const a = deg * Math.PI / 180; const b = place(sk0(), R2 - R2 * Math.cos(a), -R2 * Math.sin(a), -deg); return skAt(b, deg % 36 === 0 ? 0.3 : 0.42, deg % 36 === 0 ? 0.04 : -0.4, deg % 36 === 0 ? 0.26 : -0.16).act("armr", "leg" + lead); };
      mv("systema.stickWalk", "Cammina attorno a un oggetto con l'otto del bastone sempre attivo", [K(sk0(), 300, 100), K(SK(18, "l"), 350, 40), K(SK(36, "r"), 350, 40), K(SK(54, "l"), 350, 40), K(SK(36, "r"), 350, 40), K(SK(18, "l"), 350, 40), K(sk0(), 350, 200)]);
    })();
    (function () {
      const outB = faceHands(place(natural(), 0.12, -0.3, -20)).act("legl", "torso");
      mv("systema.bagDodge", "Il sacco torna: esci in diagonale o ruota, il sacco passa dove eri", [K(gc, 300, 150), K(palmR(gc).act("armr"), 220, 200), K(gc.copy().sink(0.04), 400, 300), K(outB, 280, 600), K(gc, 450, 200)], bagP);
    })();
    mv("systema.kneelBag", "Bende e guanti, sacco basso o materasso, tappetino sotto di te", [K(g, 300, 100), K(wrapP(0.06, 0), 350, 0), K(wrapP(0, 0.07), 250, 0), K(wrapP(-0.06, 0), 250, 0), K(wrapP(0, -0.07), 250, 100), K(g, 400, 200)], { props: [{ k: "bag", x: 0.9, z: 0, r: 0.2, y0: 0.1, y1: 1.15 }] });
    (function () {
      const LOW = { props: [{ k: "bag", x: 0.9, z: 0, r: 0.2, y0: 0.1, y1: 1.15 }] };
      const hb = heel().footAt("r", [0.68, 0.42, 0.1], 0, -70);
      mv("systema.heelPushBag", "Sdraiato: spinta col tallone alla parte bassa del sacco, il piede si ritira subito", [K(backG(), 300, 200), K(hb, 220, 300), K(backG(), 250, 200), K(hb, 220, 300), K(backG(), 250, 200)], LOW);
      const tk2 = tallKneel();
      mv("systema.punchKneelBag", "In ginocchio: pugni e palmi al sacco basso, il peso viene dalle anche", [K(tk2, 300, 200), K(reach(tk2.copy().set("pel", [0.08, 0.48, 0]).set("chest", [0.13, 0.98, 0]).set("head", [0.16, 1.18, 0]).turn(14).hand("r", [0.69, 0.95, 0.02], "fist"), "r").act("armr", "torso"), 220, 300), K(tk2, 350, 150), K(reach(tk2.copy().set("pel", [0.08, 0.48, 0]).set("chest", [0.13, 0.98, 0]).set("head", [0.16, 1.18, 0]).turn(-12).hand("l", [0.69, 0.95, -0.02], "open"), "l").act("arml", "torso"), 220, 300), K(tk2, 350, 200)], LOW);
      const sx2 = place(sitX(), 0.1, 0, 0);
      mv("systema.punchSeatedBag", "Seduto: il busto ruota e il pugno va al sacco senza caricare", [K(sx2, 300, 200), K(reach(sx2.copy().twist(28).lean(0.05).hand("r", [0.69, 0.6, 0.02], "fist"), "r").act("armr", "torso"), 240, 300), K(sx2, 350, 150), K(reach(sx2.copy().twist(-28).lean(0.05).hand("l", [0.69, 0.6, -0.02], "open"), "l").act("arml", "torso"), 240, 300), K(sx2, 350, 200)], LOW);
    })();
    // colonna, onde, elastico, uscite
    mv("systema.rollDownOnly", "Espira e stacca dal muro testa, spalle e schiena, arrotolandoti fino al bacino", [K(tall(), 300, 150), K(rollDn1, 700, 100), K(rollDn2, 900, 100), K(rollDn3, 1000, 900)]);
    mv("systema.rollUp", "Inspira e riappoggia dal bacino in su, una vertebra alla volta", [K(rollDn3, 300, 300), K(rollDn2, 1000, 100), K(rollDn1, 900, 100), K(tall().act("torso"), 700, 600)]);
    mv("systema.feetWide", "In piedi, piedi alla larghezza delle spalle, ginocchia morbide", [K(st(), 300, 150), K(par().sink(0.02).act("legl", "legr"), 600, 1100)]);
    mv("systema.waveBreath", "Espira mentre l'onda scende, inspira mentre torni in verticale", slowK(waveSeq("chest"), 1.6));
    (function () {
      const b0 = par();
      const hand = par().handRel("r", 0.13, -0.13, -0.02, "open").elbow("r", [0, -1, 0.5]);
      const p1 = hand.copy().set("chest", [-0.1, 1.43, 0]).set("head", [-0.1, 1.63, 0]).act("torso", "head");
      const p2 = hand.copy().set("pel", [-0.08, 0.83, 0]).set("chest", [-0.1, 1.31, 0]).set("head", [-0.06, 1.51, 0]).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]).act("legl", "legr", "torso", "head");
      mv("systema.waveStrong", "Spinta più forte: il corpo assorbe più in basso, i piedi restano fermi", [K(b0, 300, 100), K(hand, 450, 200), K(p1, 400, 60), K(p2, 500, 400), K(hand.copy().act("torso"), 900, 200), K(b0, 400, 200)]);
      const y3 = place(fh(), -0.08, 0.16, -100);
      mv("systema.yieldEnd", "Finisci girato di lato verso l'ancoraggio, mani davanti, in equilibrio", [K(gc, 300, 100), K(chestHands(gc.copy().turn(-60).step("r", -0.12, 0.14).shift(-0.04, 0.06)).act("torso", "legr"), 600, 60), K(y3.act("legl"), 500, 1400), K(gc, 700, 200)]);
    })();
    mv("systema.exitHold", "Dopo ogni uscita resta fermo un secondo per il controllo", exitSeq(-1, 1, null, 1100));
    mv("systema.exitHoldR", "Uscita a destra, poi un secondo fermo", exitSeq(1, 1, null, 1100));
    mv("systema.turnContactSlow", "Ruota senza spingere: la punta scivola e il bastone resta fermo", slowK(M_turn(), 1.4));
    function M_turn() { return MM.get("systema.turnContact").frames.map((f) => K(L.B.of(f.pose), f.t, f.h, f.act)); }
    mv("systema.hipEscapeHands", "Le mani spingono via all'altezza delle ginocchia mentre il bacino scappa", [K(lieGuard(), 300, 150), K(shrimp().act("arml", "armr"), 600, 1100), K(lieGuard(), 500, 200)]);
    // bastone
    mv("systema.stickGripSoft", "Pollice e indice chiudono, medio, anulare e mignolo accompagnano senza stringere", [K(gc, 300, 100), K(sk0().grip("r", "open").act("armr"), 500, 400), K(sk0().act("armr"), 700, 1000), K(gc, 500, 200)]);
    mv("systema.stickEightFast", "Otto a velocità media, respiro continuo", [K(sk0(), 300, 50)].concat(slowK(eight(sk0()), 0.6), slowK(eight(sk0()), 0.6), [K(sk0(), 300, 200)]));
    mv("systema.stickAroundRev", "Passaggi dietro la schiena nell'altro verso, sguardo avanti", mirrorAll(MM.get("systema.stickAround").frames.map((f) => K(L.B.of(f.pose), f.t, f.h, f.act))));
    mv("systema.stickEightStepL", "Otto con la sinistra e un passo a ogni diagonale", mirrorAll(MM.get("systema.stickEightStep").frames.map((f) => K(L.B.of(f.pose), f.t, f.h, f.act))));
    mv("systema.stickPalmL", "Bastone nell'altra mano: diagonale al sacco e palmo con la destra", mirrorAll(MM.get("systema.stickPalm").frames.map((f) => K(L.B.of(f.pose), f.t, f.h, f.act))), bagP);
    mv("systema.stickAirStrike", "Due colpi di bastone nell'aria: il giro continua dopo il colpo", [K(sk0(), 300, 100), K(stHigh, 300, 80), K(stHit, 220, 80), K(stLow, 250, 100), K(hzA, 300, 80), K(hzHit, 220, 80), K(hzB, 250, 100), K(sk0(), 400, 200)]);
    (function () {
      const h2 = skAt(sk0(), 0.25, 0.08, -0.2, 20);
      const hit2 = reach(sk0().turn(-12).handRel("r", 0.45, -0.3, 0.12, "fist"), "r", 0.95).act("armr", "torso", "head");
      const l2 = skAt(sk0(), 0.35, -0.45, 0.35, -20);
      mv("systema.stickStrike2", "Diagonale dall'alto a sinistra: colpo, poi il bastone prosegue il giro", [K(sk0(), 300, 100), K(h2, 300, 80), K(hit2, 220, 80), K(l2, 250, 100), K(sk0(), 400, 200)], bagP);
    })();
  });
})(typeof window !== "undefined" ? window : globalThis);
