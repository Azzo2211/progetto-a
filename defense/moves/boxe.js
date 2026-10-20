/*
 * Progetto A - Difesa: movimenti della boxe (prefisso "boxe."). Guardia ortodossa.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add("boxe", function (L) {
    const { mv, K, standing, box, boxStance, ankleY, add, sub, mul, norm, len, lieBack, plank, sitLong, BAG } = L;
    const DEG = Math.PI / 180;
    const g = box();

    /* ---------------- aiuti */
    // mano in guardia (guancia/zigomo) rispetto alla testa e al busto attuali
    function cheek(b, s) {
      if (s === "l") b.handHead("l", 0.2, -0.05, -0.1, "fist"); else b.handHead("r", 0.1, -0.07, 0.07, "fist");
      const f = b.frame();
      const sg = s === "l" ? -1 : 1;
      b.elbow(s, add(add(mul(f.up, -1), mul(f.right, sg * 0.25)), mul(f.fwd, -0.1)));
      return b;
    }
    const guardUp = (b) => cheek(cheek(b, "l"), "r");
    // ruota tutta la posa attorno a un punto del pavimento (coordinate assolute)
    function rotAbout(b, deg, cx, cz) {
      const o = b.p.o.slice();
      b.p.o = [cx, cz];
      b.spin(deg);
      const c = Math.cos(deg * DEG);
      const s = Math.sin(deg * DEG);
      const dx = o[0] - cx;
      const dz = o[1] - cz;
      b.p.o = [cx + dx * c + dz * s, cz - dx * s + dz * c];
      return b;
    }
    // perno: tutta la posa ruota attorno all'avampiede (yaw negativo = in senso orario visto dall'alto)
    const pivotOn = (b, deg, s = "l") => { const f = b.p.foot[s]; return rotAbout(b.copy(), deg, f[0] + 0.05, f[2]); };
    // la stessa posa spostata (e girata) sul pavimento
    const at = (b, dx, dz = 0, deg = 0) => b.copy().move(dx, dz).spin(deg);
    const P = (b, x, y, z) => [x + b.p.o[0], y, z + b.p.o[1]];
    // mano verso un bersaglio, a una distanza massima dalla spalla
    function reach(b, s, tgt, dist) {
      const sh = b.sh(s);
      const d = sub(tgt, sh);
      return add(sh, mul(norm(d), Math.min(len(d), dist)));
    }
    // passo in due tempi: prima il piede s, poi l'altro richiama
    const step1 = (b, s, dx, dz) => b.copy().step(s, dx, dz).shift(dx * 0.45, dz * 0.45).act("leg" + s);
    const step2 = (b, s, dx, dz) => b.copy().move(dx, dz).act("leg" + (s === "l" ? "r" : "l"));
    const G = (t = 120, h = 20, b = g) => K(b, t, h);
    // combinazione: [posa | [posa, t, h]], parte e torna in guardia
    function combo(name, label, list, o = {}) {
      const fr = [K(o.start || g, 300, 150)];
      list.forEach((x) => { if (x && !(x instanceof L.B) && !Array.isArray(x)) { fr.push(x); return; } const a = Array.isArray(x) ? x : [x, 160, 110]; fr.push(K(a[0], a[1], a[2])); });
      if (o.end !== false) fr.push(K(o.end || g, 240, 300));
      mv(name, label, fr, o.props ? { props: o.props } : undefined);
    }
    const gUp = g.copy().heel("l", 14).heel("r", 26);
    const air = (b) => b.copy().sink(-0.03).lift("l", 0.03).lift("r", 0.03);

    /* ---------------- guardia */
    mv("boxe.relaxed", "In piedi rilassato, braccia lungo i fianchi", [K(standing(), 400, 600)]);
    mv("boxe.stance", "Piedi in guardia: sinistro avanti, destro dietro a 45 gradi, tallone alzato", [K(standing(), 300, 200), K(boxStance().set("hand", { l: [0.1, 0.95, -0.24], r: [-0.12, 0.95, 0.23] }), 500, 800, ["legl", "legr"])]);
    const stHands = { l: [0.1, 0.95, -0.24], r: [-0.12, 0.95, 0.23] };
    const stTall = boxStance().set("hand", stHands).set("pel", [-0.01, 0.94, 0.03]).set("chest", [0.0, 1.44, 0.03]).set("head", [0.02, 1.64, 0.02]).set("hipYaw", -12).set("chestYaw", -12);
    mv("boxe.stanceSoft", "Ginocchia morbide, peso a metà tra i piedi, busto che gira di tre quarti", [K(stTall, 300, 400), K(boxStance().set("hand", stHands).act("legl", "legr", "torso"), 600, 900), K(stTall, 500, 300)]);
    mv("boxe.guard", "Guardia: mento giù, pugni al viso, gomiti stretti", [K(standing(), 300, 300), K(g, 600, 900, ["arml", "armr"])]);
    mv("boxe.guardHold", "Guardia ferma", [K(g, 400, 1000)]);
    mv("boxe.balance", "Prova di equilibrio: alza un attimo il piede anteriore, poi il posteriore", [K(g, 300, 200), K(g.copy().lift("l", 0.1).act("legl"), 300, 500), K(g, 300, 200), K(g.copy().lift("r", 0.1).heel("r", 0).set("foot", Object.assign({}, g.p.foot, { r: [g.p.foot.r[0], 0.18, g.p.foot.r[2]] })).act("legr"), 300, 500), K(g, 300, 200)]);
    const tap = standing().fists().handRel("l", 0.36, -0.14, 0.03).handRel("r", 0.36, -0.14, -0.03).elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
    mv("boxe.gloveTap", "Batti i guantoni davanti al petto e mettiti in guardia", [K(standing(), 300, 200), K(tap.act("arml", "armr"), 300, 150), K(tap.copy().handRel("l", 0.3, -0.14, -0.06).handRel("r", 0.3, -0.14, 0.06), 150, 50), K(tap, 150, 200), K(g, 450, 500)]);

    /* ---------------- colpi dritti */
    const jab = g.copy().turn(-14).shift(0.04).lean(0.03).straight("l", "head").act("arml");
    const jabShort = g.copy().turn(-8).shift(0.02).straight("l", "head", 0.72).act("arml");
    mv("boxe.jab", "Jab (1): sinistro dritto, spalla a coprire il mento", [K(g, 300, 200), K(jab, 150, 220), K(g, 220, 300)]);
    const jabHalf = g.copy().turn(-8).shift(0.02).straight("l", "head", 0.78).act("arml");
    mv("boxe.jabSlow", "Jab al rallentatore in quattro tempi: parte, si distende, torna, guardia", [K(g, 300, 300), K(jabHalf, 450, 350), K(jab, 400, 600), K(g, 300, 700)]);
    mv("boxe.jabShort", "Jab più corto: il pugno entra di pochi centimetri e torna subito", [K(g, 300, 200), K(g.copy().turn(-12).shift(0.03).straight("l", "head", 0.88).act("arml"), 130, 120), K(g, 160, 300)]);
    const jabBody = g.copy().sink(0.12).turn(-14).shift(0.05).lean(0.06, 0, 0.04).straight("l", "body").act("arml", "legl", "legr");
    mv("boxe.jabBody", "Jab al corpo: piega le ginocchia e colpisci dritto al busto", [K(g, 300, 200), K(jabBody, 200, 260), K(g, 260, 300)]);
    const jabIn = g.copy().step("l", 0.15).shift(0.07).turn(-14).shift(0.04).lean(0.03).straight("l", [0.96, 1.5, 0]).act("arml", "legl");
    const g15 = at(g, 0.15);
    mv("boxe.jabStep", "Jab in entrata: il pugno arriva insieme al piede anteriore, poi il posteriore richiama", [K(g, 300, 200), K(jabIn, 180, 220), K(g15.copy().act("legr"), 220, 300)]);
    const jabOut = g.copy().step("r", -0.15).shift(-0.06).turn(-14).shift(0.04).lean(0.02).straight("l", [0.74, 1.5, 0]).act("arml", "legr");
    mv("boxe.jabOut", "Jab in uscita: il piede posteriore arretra mentre parte il jab", [K(g, 300, 200), K(jabOut, 180, 220), K(at(g, -0.15).act("legl"), 220, 300)]);
    mv("boxe.doubleJab", "Doppio jab: il secondo parte da metà ritorno", [K(g, 300, 150), K(jab, 150, 60), K(g.copy().turn(-6).straight("l", "head", 0.5), 110, 0), K(jab, 120, 220), K(g, 220, 300)]);
    mv("boxe.doubleJabStep", "1-1: primo jab corto per misurare, secondo pieno con mezzo passo", [K(g, 300, 150), K(jabShort, 150, 80), K(g, 120, 0), K(jabIn, 160, 220), K(g15, 220, 300)]);

    const cross = g.copy().turn(48).shift(0.07).lean(0.05).straight("r", "head").heel("r", 30).fyaw("r", -12).act("armr", "legr");
    mv("boxe.cross", "Diretto (2): destro dritto, anca e piede posteriore che ruotano", [K(g, 300, 200), K(cross, 170, 240), K(g, 240, 300)]);
    const crossHalf = g.copy().turn(26).shift(0.04).straight("r", "head", 0.72).heel("r", 26).fyaw("r", -25).act("armr", "legr");
    mv("boxe.crossSlow", "Diretto lento: piede, anca e spalla ruotano, la mano sinistra resta al viso", [K(g, 300, 300), K(crossHalf, 450, 300), K(cross, 400, 700), K(g, 400, 500)]);
    const crossLeg = g.copy().turn(44).shift(0.05).heel("r", 30).fyaw("r", -12).act("legr", "torso");
    mv("boxe.crossLegs", "Solo gambe: il piede posteriore ruota sull'avampiede, anca e busto seguono", [K(g, 300, 200), K(crossLeg, 260, 300), K(g, 260, 200), K(crossLeg, 260, 300), K(g, 260, 300)]);
    const crossBody = g.copy().sink(0.12).turn(48).shift(0.08).lean(0.07, 0, 0.04).straight("r", "body").heel("r", 30).fyaw("r", -12).act("armr", "legr", "legl");
    mv("boxe.crossBody", "Diretto al corpo: abbassati sulle gambe e colpisci con il destro", [K(g, 300, 200), K(crossBody, 220, 260), K(g, 260, 300)]);
    mv("boxe.onetwo", "Uno-due (1-2): jab e diretto", [K(g, 300, 150), K(jab, 150, 120), K(g, 140, 40), K(cross, 170, 220), K(g, 240, 300)]);
    combo("boxe.onetwoIn", "1-2 in entrata: jab con mezzo passo avanti, poi diretto", [[jabIn, 170, 110], [at(cross, 0.15), 170, 220]], { end: g15 });
    combo("boxe.jabJabCross", "1-1-2: jab corto, jab pieno con mezzo passo, diretto", [[jabShort, 150, 60], G(110, 0), [jabIn, 160, 90], [at(cross, 0.15), 170, 220]], { end: g15 });
    combo("boxe.onetwoone", "1-2-1: jab, diretto e un altro jab a coprire l'uscita", [jab, cross, [jab, 150, 200]]);
    combo("boxe.onetwoonetwo", "1-2-1-2: due uno-due di fila, le mani si danno il cambio", [[jab, 150, 60], [cross, 160, 60], [jab, 150, 60], [cross, 160, 220]]);
    combo("boxe.flurry", "Raffica di uno-due veloci, ogni pugno torna al viso", [[jab, 120, 20], [cross, 130, 20], [jab, 120, 20], [cross, 130, 20], [jab, 120, 20], [cross, 130, 160]]);
    combo("boxe.weightedOnetwo", "Uno-due lenti con le bottigliette, gomito mai bloccato", [[g.copy().turn(-14).shift(0.04).straight("l", "head", 0.9).act("arml"), 500, 250], G(450, 100), [g.copy().turn(44).shift(0.06).straight("r", "head", 0.9).heel("r", 28).fyaw("r", -12).act("armr", "legr"), 550, 250]]);
    combo("boxe.shadowSlow", "Shadow lentissimo: jab, diretto e passo, respirando dal naso", [[jab, 600, 300], G(600, 200), [cross, 700, 300], G(700, 200), [step1(g, "r", -0.15, 0), 500, 100], [at(g, -0.15), 500, 300]], { end: false });
    // avanzando: un 1-2 a ogni passo
    combo("boxe.onetwoAdvance", "Tre passi avanti con un 1-2 a ogni passo", [[jabIn, 170, 60], [at(cross, 0.15), 160, 100], [at(jabIn, 0.15), 170, 60], [at(cross, 0.3), 160, 100], [at(jabIn, 0.3), 170, 60], [at(cross, 0.45), 160, 200]], { end: at(g, 0.45) });
    combo("boxe.jabRetreat", "Tre passi indietro con un jab a ogni passo", [[jabOut, 180, 60], [at(g, -0.15), 160, 80], [at(jabOut, -0.15), 180, 60], [at(g, -0.3), 160, 80], [at(jabOut, -0.3), 180, 60]], { end: at(g, -0.45) });

    /* ---------------- ganci e montanti */
    // gancio anteriore: il piede anteriore ruota (tallone in fuori), anca e busto girano verso destra
    function leadHook(base, body, tx) {
      const b = base.copy();
      if (body) b.sink(0.14).lean(0.03, -0.03, 0.02);
      b.turn(body ? -22 : -26).shift(0.03).heel("l", 24).fyaw("l", -55);
      const t = body ? P(b, tx || 0.5, 1.0, 0.06) : P(b, tx || 0.58, 1.43, 0.06);
      b.hand("l", reach(b, "l", t, 0.42), "fist").elbow("l", body ? [0.1, -0.8, -0.7] : [0.1, 0.3, -1]);
      cheek(b, "r");
      return b.act("arml", "legl");
    }
    // gancio posteriore: parte come il diretto, braccio piegato e gomito alto
    function rearHook(base, body) {
      const b = base.copy();
      if (body) b.sink(0.14).lean(0.03, 0.03, 0.02);
      b.turn(body ? 48 : 56).shift(0.05).heel("r", 30).fyaw("r", -10);
      const t = body ? P(b, 0.5, 1.0, -0.04) : P(b, 0.58, 1.43, -0.04);
      b.hand("r", reach(b, "r", t, 0.42), "fist").elbow("r", body ? [0.1, -0.8, 0.7] : [0.1, 0.3, 1]);
      cheek(b, "l");
      return b.act("armr", "legr");
    }
    const hook = leadHook(g);
    const hookBody = leadHook(g, true);
    const rhook = rearHook(g);
    mv("boxe.hook", "Gancio sinistro (3): gomito all'altezza della spalla, ruota anca e piede anteriore", [K(g, 300, 200), K(hook, 190, 240), K(g, 240, 300)]);
    mv("boxe.hookBody", "Gancio al fegato: abbassati, gomito vicino al fianco, pugno che sale appena", [K(g, 300, 200), K(hookBody, 220, 260), K(g, 260, 300)]);
    mv("boxe.rhook", "Gancio destro (4): ruota piede posteriore e anca, gomito alto", [K(g, 300, 200), K(rhook, 200, 240), K(g, 240, 300)]);
    const hookSet = g.copy().handHead("l", 0.26, -0.04, -0.2, "fist").elbow("l", [0.1, 0.3, -1]).act("arml");
    mv("boxe.hookSetup", "Gomito anteriore su: avambraccio parallelo al pavimento, braccio a 90 gradi", [K(g, 300, 200), K(hookSet, 350, 600), K(g, 300, 300)]);
    mv("boxe.hookSlow", "Gancio lento: gomito su, poi piede e anca ruotano e portano il braccio", [K(g, 300, 200), K(hookSet, 400, 400), K(hook, 500, 600), K(g, 400, 300)]);
    const hookLeg = g.copy().turn(-24).shift(0.02).heel("l", 24).fyaw("l", -55).act("legl", "torso");
    guardUp(hookLeg);
    mv("boxe.hookLegs", "Schiaccia l'insetto: il tallone anteriore va in fuori, anca e busto ruotano", [K(g, 300, 200), K(hookLeg, 260, 300), K(g, 260, 200), K(hookLeg, 260, 300), K(g, 260, 300)]);
    const footTurn = guardUp(g.copy().turn(-6).heel("l", 24).fyaw("l", -55)).act("legl");
    mv("boxe.leadFootTurn", "Il piede anteriore ruota sull'avampiede, il tallone va verso l'esterno", [K(g, 300, 200), K(footTurn, 300, 400), K(g, 280, 200), K(footTurn, 300, 400), K(g, 280, 300)]);
    mv("boxe.squashAlt", "Rotazioni alternate: piede anteriore come nel gancio, posteriore come nel diretto", [K(g, 300, 150), K(hookLeg, 260, 250), K(g, 240, 100), K(crossLeg, 260, 250), K(g, 240, 300)]);
    combo("boxe.jabHook", "1-3: il jab porta il peso avanti, il gancio lo riporta al centro", [jab, G(), [hook, 180, 220]]);
    combo("boxe.hookRhook", "3-4: gancio sinistro e gancio destro a distanza corta", [[hook, 180, 100], [rhook, 190, 220]]);
    combo("boxe.crossHook", "2-3: diretto e gancio sinistro", [[cross, 170, 100], [hook, 180, 220]]);
    combo("boxe.hookCross", "3-2: gancio sinistro e diretto", [[hook, 180, 100], [cross, 170, 220]]);
    combo("boxe.crossHookCross", "2-3-2: diretto, gancio, diretto, il peso va avanti e indietro", [[cross, 170, 90], [hook, 180, 90], [cross, 170, 220]]);
    combo("boxe.crossHookChain", "2-3-2-3 a catena, ritmo regolare come un'altalena", [[cross, 170, 60], [hook, 180, 60], [cross, 170, 60], [hook, 180, 60], [cross, 170, 60], [hook, 180, 160]]);
    combo("boxe.onetwothree", "Uno-due-tre: jab, diretto, gancio sinistro", [[jab, 150, 100], G(140, 30), [cross, 170, 100], [hook, 180, 220]]);
    combo("boxe.onetwothreetwo", "1-2-3-2: jab, diretto, gancio e di nuovo diretto", [[jab, 150, 90], [cross, 170, 90], [hook, 180, 90], [cross, 170, 220]]);
    combo("boxe.hookFlurry", "Ganci corti alternati veloci, con la rotazione di piedi e anca", [[hook, 150, 30], [rhook, 160, 30], [hook, 150, 30], [rhook, 160, 30], [hook, 150, 30], [rhook, 160, 150]]);

    // montanti: piccolo piegamento delle ginocchia, poi il pugno sale davanti al centro
    const dipL = guardUp(g.copy().sink(0.09).lean(0.03, -0.05).turn(8));
    function leadUpper(tx = 0.48, d = 0.27, ty = 1.46) {
      const b = g.copy().sink(0.03).lean(0.03, -0.02).turn(-16).heel("l", 16).fyaw("l", -30);
      b.hand("l", reach(b, "l", P(b, tx, ty, 0.0), d), "fist").elbow("l", [0.4, -1, -0.15]);
      return cheek(b, "r").act("arml", "legl");
    }
    function rearUpper(tx = 0.48, d = 0.3, ty = 1.46) {
      const b = g.copy().sink(0.03).turn(46).shift(0.04).heel("r", 30).fyaw("r", -15);
      b.hand("r", reach(b, "r", P(b, tx, ty, 0.0), d), "fist").elbow("r", [0.4, -1, 0.15]);
      return cheek(b, "l").act("armr", "legr");
    }
    const upL = leadUpper();
    const dipR = guardUp(g.copy().sink(0.09).lean(0.03, 0.05).turn(-8));
    const upR = rearUpper();
    mv("boxe.upper", "Montante sinistro (5): peso sul piede anteriore, l'anca ruota e il pugno sale", [K(g, 300, 150), K(dipL, 200, 80), K(upL, 180, 240), K(g, 240, 300)]);
    mv("boxe.rupper", "Montante destro (6): ginocchia piegate, il piede posteriore ruota e spinge su", [K(g, 300, 150), K(dipR, 200, 80), K(upR, 180, 240), K(g, 240, 300)]);
    mv("boxe.rupperSlow", "Montante destro lento: il pugno si ferma all'altezza del mento, braccio piegato", [K(g, 300, 200), K(dipR, 350, 250), K(upR, 450, 900), K(g, 400, 300)]);
    mv("boxe.rhookSlow", "Gancio destro lento: la mano sinistra resta alta a coprire la tempia", [K(g, 300, 200), K(rhook, 500, 1000), K(g, 400, 300)]);
    combo("boxe.upperAlt", "5 e 6 alternati, in guardia tra un colpo e l'altro", [[dipL, 180, 50], [upL, 170, 180], G(200, 60), [dipR, 180, 50], [upR, 170, 180]]);
    combo("boxe.oneSixThreeTwo", "1-6-3-2: jab con mezzo passo, montante destro, gancio, diretto", [[jabIn, 170, 90], [at(dipR, 0.15), 150, 30], [at(upR, 0.15), 170, 90], [at(hook, 0.15), 180, 90], [at(cross, 0.15), 170, 220]], { end: g15 });

    /* ---------------- lavoro al corpo */
    const lc = g.copy().sink(0.16).lean(0.03, 0, 0.01).act("legl", "legr");
    mv("boxe.levelChange", "Cambio di livello: piega le ginocchia, schiena lunga, mani al viso", [K(g, 300, 200), K(lc, 400, 500), K(g, 400, 300)]);
    const lcStep = g.copy().step("l", 0.12).shift(0.06).sink(0.16).lean(0.03, -0.06, 0.01).act("legl", "legr");
    mv("boxe.levelChangeStep", "Scendi con mezzo passo avanti e la testa appena fuori linea", [K(g, 300, 200), K(lcStep, 380, 450), K(g, 380, 300)]);
    const jabBodyIn = g.copy().step("l", 0.13).shift(0.06).sink(0.15).turn(-14).shift(0.04).lean(0.06, -0.03, 0.04).straight("l", [0.74, 1.1, 0.02]).act("arml", "legl", "legr");
    cheek(jabBodyIn, "r");
    mv("boxe.jabBodyIn", "Jab al corpo con mezzo passo: scendi con le gambe, testa dietro il guanto", [K(g, 300, 200), K(jabBodyIn, 220, 300), K(g, 300, 300)]);
    const lcLead = guardUp(g.copy().sink(0.13).lean(0.03, -0.04, 0.02)).act("legl", "legr");
    mv("boxe.hookBodySlow", "Gancio al fegato lento: scendi, peso avanti, gomito al fianco, il piede ruota", [K(g, 300, 200), K(lcLead, 400, 250), K(hookBody, 500, 900), K(g, 400, 300)]);
    combo("boxe.jabBodyHead", "1 basso e 1 alto: jab al corpo e jab alla testa", [[jabBody, 200, 120], [jab, 170, 220]]);
    combo("boxe.hookBodyHead", "3 al corpo e 3 alla testa: due ganci sinistri, giù e su", [[hookBody, 210, 120], G(130, 20), [hook, 180, 220]]);
    combo("boxe.comboA", "Combinazione A: 1-2, gancio al corpo, gancio alla testa", [[jab, 150, 80], [cross, 170, 80], [hookBody, 210, 90], [hook, 180, 220]]);
    combo("boxe.comboB", "Combinazione B: 1, 1 al corpo, 2, 3, 2", [[jab, 150, 80], [jabBody, 190, 80], [cross, 180, 80], [hook, 180, 80], [cross, 170, 220]]);
    combo("boxe.comboC", "Combinazione C: 1-2-3-2, gancio al corpo, gancio alla testa", [[jab, 150, 70], [cross, 170, 70], [hook, 180, 70], [cross, 170, 70], [hookBody, 210, 80], [hook, 180, 220]]);

    /* ---------------- difesa */
    const slipOut = guardUp(g.copy().sink(0.05).lean(0.03, 0.1).turn(-12)).act("head", "torso", "legl", "legr");
    const slipIn = guardUp(g.copy().sink(0.05).lean(0.03, -0.11).turn(14)).act("head", "torso", "legl", "legr");
    const pullB = guardUp(g.copy().shift(-0.12).lean(-0.06).sink(0.02)).act("head", "torso");
    mv("boxe.slip", "Slip: la testa esce dalla linea a destra, poi a sinistra, con le ginocchia", [K(g, 300, 150), K(slipOut, 220, 260), K(g, 220, 150), K(slipIn, 220, 260), K(g, 220, 300)]);
    mv("boxe.slipOut", "Slip esterno: busto che ruota appena, ginocchia piegate, testa a destra", [K(g, 300, 200), K(slipOut, 220, 320), K(g, 240, 300)]);
    mv("boxe.slipIn", "Slip interno: rotazione opposta, la testa va a sinistra", [K(g, 300, 200), K(slipIn, 220, 320), K(g, 240, 300)]);
    mv("boxe.pullBack", "Pull back: il peso va sul piede posteriore, la testa arretra, mento basso", [K(g, 300, 200), K(pullB, 240, 340), K(g, 260, 300)]);
    mv("boxe.slipPull", "Slip esterno, centro, slip interno, centro, pull back, centro", [K(g, 300, 100), K(slipOut, 220, 200), G(200, 80), K(slipIn, 220, 200), G(200, 80), K(pullB, 240, 220), K(g, 240, 300)]);
    const duck = guardUp(g.copy().sink(0.2).lean(0.06, 0, 0.02)).act("legl", "legr", "torso");
    mv("boxe.duck", "Abbassata: piega le ginocchia, schiena dritta, occhi avanti", [K(g, 300, 200), K(duck, 260, 280), K(g, 260, 300)]);
    // roll (bob and weave): la testa disegna una U sotto il colpo
    const rollDown = (dz) => guardUp(g.copy().sink(0.2).lean(0.05, dz, 0.03)).act("legl", "legr", "torso");
    const rollUpR = guardUp(g.copy().sink(0.06).shift(-0.05).lean(0.0, 0.11).turn(-10)).act("legl", "legr", "torso");
    const rollUpL = guardUp(g.copy().sink(0.06).shift(0.05).lean(0.03, -0.11).turn(12)).act("legl", "legr", "torso");
    mv("boxe.roll", "Roll (bob and weave): scendi da un lato, passa sotto e risali dall'altro", [K(g, 300, 150), K(guardUp(rollDown(0.12).turn(12)), 260, 60), K(guardUp(rollDown(-0.12).turn(-12)), 320, 100), K(g, 280, 300)]);
    mv("boxe.rollRight", "Roll a destra: giù con le ginocchia, la testa passa sotto e risale a destra", [K(g, 300, 150), K(rollDown(-0.04), 220, 30), K(rollDown(0.1), 220, 30), K(rollUpR, 220, 250), K(g, 260, 300)]);
    mv("boxe.rollLeft", "Roll a sinistra: stessa U verso sinistra, risali sul piede anteriore", [K(g, 300, 150), K(rollDown(0.04), 220, 30), K(rollDown(-0.1), 220, 30), K(rollUpL, 220, 250), K(g, 260, 300)]);
    const block = g.copy().handHead("l", 0.08, 0.03, -0.07).handHead("r", 0.06, 0.02, 0.07).elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]).sink(0.03).act("arml", "armr");
    mv("boxe.cover", "Copertura alta: guanti alla fronte, gomiti stretti, mento giù", [K(g, 300, 200), K(block, 200, 400), K(g, 240, 300)]);
    const coverR = g.copy().turn(-8).sink(0.03);
    cheek(coverR, "l");
    coverR.handHead("r", 0.02, 0.03, 0.11, "fist").elbow("r", [0.8, 0.1, 0.8]).act("armr");
    const coverL = g.copy().turn(8).sink(0.03);
    cheek(coverL, "r");
    coverL.handHead("l", 0.04, 0.03, -0.11, "fist").elbow("l", [0.8, 0.1, -0.8]).act("arml");
    mv("boxe.coverHookR", "Copertura al gancio sinistro: gomito destro su, guanto alla tempia destra", [K(g, 300, 200), K(coverR, 200, 400), K(g, 240, 300)]);
    mv("boxe.coverHook", "Copertura ai ganci: guanto alla tempia destra, poi alla sinistra", [K(g, 300, 150), K(coverR, 200, 350), K(g, 220, 100), K(coverL, 200, 350), K(g, 240, 300)]);
    const elbowBlock = g.copy().sink(0.05).turn(-10).handHead("l", 0.08, -0.1, -0.02).elbow("l", [0, -1, 0.2]).handHead("r", 0.08, -0.1, 0.05).elbow("r", [0.3, -1, 0]).act("arml", "armr");
    mv("boxe.bodyBlock", "Copertura al corpo: gomiti stretti sulle costole, busto che ruota appena", [K(g, 300, 200), K(elbowBlock, 200, 400), K(g, 240, 300)]);
    // parata: il palmo destro tocca il jab vicino al viso e lo devia di lato e in basso
    const parryA = g.copy().handHead("r", 0.2, -0.05, -0.02, "open").elbow("r", [0, -1, 0.3]).act("armr");
    const parryB = g.copy().handHead("r", 0.18, -0.13, -0.08, "open").elbow("r", [0, -1, 0.3]).act("armr");
    mv("boxe.parry", "Parata: il palmo destro tocca il jab vicino al viso e lo devia in basso", [K(g, 300, 200), K(parryA, 130, 60), K(parryB, 100, 160), K(g, 160, 300)]);
    combo("boxe.parryJab", "Parata e jab: il jab parte mentre la mano destra torna", [[parryA, 130, 40], [parryB, 100, 30], [jab, 150, 220]]);
    combo("boxe.parryCross", "Parata col guanto destro, poi diretto", [[parryA, 130, 40], [parryB, 100, 60], G(110, 0), [cross, 170, 220]]);
    const slipCrossP = g.copy().sink(0.04).lean(0.04, 0.04).turn(48).shift(0.07).straight("r", "head").heel("r", 30).fyaw("r", -12).act("armr", "legr");
    combo("boxe.slipCross", "Slip esterno e diretto: il peso caricato dietro spinge il colpo", [[slipOut, 220, 120], [slipCrossP, 170, 220]]);
    combo("boxe.pullCross", "Pull back e diretto: torni avanti spingendo dal piede posteriore", [[pullB, 240, 150], [cross, 190, 220]]);
    const hookFromRoll = leadHook(g.copy().sink(0.04).shift(0.03));
    combo("boxe.rollHook", "Roll a sinistra e gancio sinistro appena risali", [[rollDown(0.04), 220, 30], [rollDown(-0.1), 220, 30], [rollUpL, 200, 60], [hookFromRoll, 180, 220]]);

    // shoulder roll e Philly shell
    const philly = g.copy().turn(-14).shift(-0.02).lean(-0.02, 0.03);
    philly.handPel("l", 0.24, 0.16, 0.08, "fist").elbow("l", [0, -1, -0.3]).handHead("r", 0.08, -0.06, 0.07, "fist").elbow("r", [0, -1, 0.3]);
    mv("boxe.phillyShell", "Philly shell: più di profilo, braccio anteriore basso, spalla alta", [K(g, 300, 200), K(philly.copy().act("arml", "torso"), 450, 900), K(g, 400, 300)]);
    const shoulder = g.copy().turn(-28).lean(-0.03, 0.03).handRel("l", 0.12, -0.32, -0.05).handHead("r", 0.08, -0.04, 0.05).act("arml", "torso");
    mv("boxe.shoulderRoll", "Copertura con la spalla: spalla sinistra alta a proteggere il mento", [K(g, 300, 200), K(shoulder, 240, 300), K(g, 240, 300)]);
    const sRoll = philly.copy().turn(-16).shift(-0.06).lean(-0.03, 0.03).sink(0.03).act("torso", "legr");
    const sPrep = g.copy().turn(-24).shift(-0.06).lean(-0.03, 0.04).sink(0.03).act("torso", "legr");
    guardUp(sPrep);
    const sBack = g.copy().turn(20).shift(0.04).heel("r", 24).fyaw("r", -20).act("torso", "legr");
    guardUp(sBack);
    mv("boxe.shoulderPrep", "Busto che ruota verso destra, spalla sinistra alta, peso dietro; poi ritorno", [K(g, 300, 200), K(sPrep, 450, 400), K(g, 350, 100), K(sBack, 400, 300), K(g, 350, 300)]);
    mv("boxe.phillyRoll", "Dalla Philly shell: il busto ruota, la spalla sale e il peso va dietro", [K(g, 300, 150), K(philly, 300, 250), K(sRoll, 260, 450), K(philly, 260, 250), K(g, 300, 300)]);
    const sTurn = guardUp(g.copy().twist(-22).hips(-6).lean(0, 0.03)).act("torso");
    mv("boxe.shoulderTurn", "Il busto ruota verso destra e la spalla sinistra sale a nascondere il mento", [K(g, 300, 200), K(sTurn, 450, 600), K(g, 400, 300)]);
    const crossPhilly = philly.copy().turn(60).shift(0.1).lean(0.05, -0.03).straight("r", "head").heel("r", 30).fyaw("r", -12).act("armr", "legr");
    combo("boxe.shoulderRollCross", "Shoulder roll: il colpo scivola sulla spalla, poi diretto", [[philly, 300, 150], [sRoll, 220, 200], [crossPhilly, 170, 220], [philly, 220, 200]]);
    combo("boxe.shoulderRoll23", "Shoulder roll, diretto e gancio (roll-2-3)", [[philly, 300, 150], [sRoll, 220, 180], [crossPhilly, 170, 100], [hook, 180, 220]]);
    // contro
    const crossCounter = g.copy().sink(0.05).turn(50).shift(0.06).lean(0.05, -0.1).straight("r", [0.8, 1.5, 0.03]).heel("r", 30).fyaw("r", -12).act("armr", "legr", "head");
    mv("boxe.crossCounter", "Cross counter: diretto sopra il jab, la testa esce a sinistra", [K(g, 300, 200), K(crossCounter, 180, 320), K(g, 240, 300)]);
    combo("boxe.crossCounterHook", "Cross counter e gancio sinistro (2-3) prima di uscire", [[crossCounter, 180, 120], [hook, 180, 220]]);

    /* ---------------- passi, perni, angoli */
    const fwd1 = step1(g, "l", 0.18, 0);
    const fwd2 = step2(g, "l", 0.18, 0);
    mv("boxe.stepFwd", "Passo avanti: prima il piede anteriore, poi il posteriore richiama", [K(g, 300, 200), K(fwd1, 220, 120), K(fwd2, 200, 300)]);
    mv("boxe.stepBack", "Passo indietro: prima il piede posteriore, poi l'anteriore", [K(g, 300, 200), K(step1(g, "r", -0.18, 0), 220, 120), K(step2(g, "r", -0.18, 0), 200, 300)]);
    mv("boxe.stepLeft", "Passo a sinistra: muove prima il piede sinistro", [K(g, 300, 200), K(step1(g, "l", 0, -0.18), 220, 120), K(step2(g, "l", 0, -0.18), 200, 300)]);
    mv("boxe.stepRight", "Passo a destra: muove prima il piede destro", [K(g, 300, 200), K(step1(g, "r", 0, 0.18), 220, 120), K(step2(g, "r", 0, 0.18), 200, 300)]);
    mv("boxe.box4", "Passi nelle quattro direzioni: avanti, destra, indietro, sinistra", [K(g, 300, 150), K(fwd1, 200, 60), K(fwd2, 180, 120), K(step1(at(g, 0.18), "r", 0, 0.18), 200, 60), K(at(g, 0.18, 0.18), 180, 120), K(step1(at(g, 0.18, 0.18), "r", -0.18, 0), 200, 60), K(at(g, 0, 0.18), 180, 120), K(step1(at(g, 0, 0.18), "l", 0, -0.18), 200, 60), K(g, 180, 300)]);
    mv("boxe.stepDiagL", "Passo-richiamo in diagonale avanti a sinistra", [K(g, 300, 200), K(step1(g, "l", 0.14, -0.14), 220, 120), K(step2(g, "l", 0.14, -0.14), 200, 300)]);
    mv("boxe.stepDiagR", "Passo-richiamo in diagonale avanti a destra", [K(g, 300, 200), K(step1(g, "r", 0.14, 0.14), 220, 120), K(step2(g, "r", 0.14, 0.14), 200, 300)]);
    mv("boxe.starDiag", "Stella: passo sulle diagonali e ritorno al centro", [K(g, 300, 100), K(at(g, 0.15, -0.15).act("legl", "legr"), 250, 150), K(g, 250, 100), K(at(g, 0.15, 0.15).act("legl", "legr"), 250, 150), K(g, 250, 100), K(at(g, -0.15, 0.15).act("legl", "legr"), 250, 150), K(g, 250, 100), K(at(g, -0.15, -0.15).act("legl", "legr"), 250, 300)]);
    // perno sull'avampiede anteriore: il piede dietro descrive un arco verso sinistra, il corpo gira a destra
    const piv = (deg) => pivotOn(g, -deg);
    const pivMid = (deg) => pivotOn(g, -deg).heel("l", 22).act("legl", "legr", "torso");
    mv("boxe.pivot", "Perno di 45 gradi sull'avampiede anteriore, poi ritorno", [K(g, 300, 200), K(pivMid(22).act("legl", "legr", "torso"), 200, 0), K(piv(45).act("legr"), 200, 450), K(pivMid(22), 220, 0), K(g, 220, 300)]);
    mv("boxe.pivot90", "Perno di 90 gradi: il piede dietro disegna un arco largo, poi ritorno", [K(g, 300, 200), K(pivMid(30).act("legl", "legr", "torso"), 200, 0), K(pivMid(60).act("legl", "legr", "torso"), 180, 0), K(piv(90).act("legr"), 200, 450), K(pivMid(45), 260, 0), K(g, 260, 300)]);
    combo("boxe.hookPivot", "Gancio e pivot: la rotazione del gancio continua nel giro", [[hook, 190, 80], [pivotOn(hook, -22).heel("l", 26), 160, 0], [piv(45).act("legr"), 180, 450]], { end: false });
    combo("boxe.onetwothreePivot", "1-2-3 e pivot sul piede anteriore", [[jab, 150, 80], [cross, 170, 80], [hook, 180, 80], [pivotOn(hook, -22).heel("l", 26), 160, 0], [piv(45).act("legr"), 180, 450]], { end: false });
    const p90 = (b) => pivotOn(b, -90);
    combo("boxe.pivot90OneTwo", "Perno di 90 gradi, poi 1-2 nella nuova direzione", [[pivMid(30), 200, 0], [pivMid(60), 180, 0], [piv(90), 200, 250], [p90(jab), 150, 100], [p90(g), 140, 30], [p90(cross), 170, 220], [piv(90), 240, 300]], { end: false });
    const checkMid = pivotOn(hook, -35).heel("l", 26);
    combo("boxe.checkHook", "Check hook: gancio sinistro e perno insieme, esci dalla sua linea", [[checkMid, 200, 120], [piv(80).act("legr", "torso"), 220, 500]], { end: false });
    combo("boxe.onetwoCheckHook", "1-2, lui carica, check hook con il perno", [[jab, 150, 80], [cross, 170, 80], G(150, 150), [checkMid, 200, 120], [piv(80).act("legr", "torso"), 220, 450]], { end: false });
    // L-step: il piede anteriore torna accanto al posteriore, il posteriore va di lato a destra
    const LF = at(g, -0.06, 0.48, 24);
    const lst1 = g.copy().foot("l", -0.16, 0.03, -20, 20).shift(-0.17, 0.02).act("legl");
    const lst2 = lst1.copy().set("foot", Object.assign({}, lst1.p.foot, { r: LF.p.foot.r })).set("footYaw", Object.assign({}, lst1.p.footYaw, { r: LF.p.footYaw.r })).shift(0, 0.2).act("legr");
    const lstHop = air(lst2).act("legl", "legr");
    mv("boxe.lStep", "L-step in tre tempi: anteriore indietro, posteriore a destra, anteriore avanti", [K(g, 300, 200), K(lst1, 260, 200), K(lst2, 260, 200), K(LF.copy().act("legl"), 260, 400)]);
    mv("boxe.lStepHop", "L-step con un saltello: indietro e di lato quasi insieme", [K(g, 300, 200), K(lstHop, 200, 0), K(lst2, 120, 60), K(LF.copy().act("legl"), 220, 400)]);
    combo("boxe.lStepCross", "L-step e diretto dalla nuova linea", [[lstHop, 200, 0], [lst2, 120, 50], [LF, 200, 80], [at(cross, -0.06, 0.48, 24), 170, 220]], { end: LF });
    combo("boxe.lStep32", "L-step, poi gancio sinistro e diretto (3-2)", [[lstHop, 200, 0], [lst2, 120, 50], [LF, 200, 80], [at(hook, -0.06, 0.48, 24), 180, 90], [at(cross, -0.06, 0.48, 24), 170, 220]], { end: LF });
    // cambio d'angolo: passo in diagonale e colpi dal nuovo angolo, girato verso l'avversario
    const angL = at(g, 0.14, -0.14, -12);
    const angR = at(g, 0.14, 0.14, 12);
    combo("boxe.diagLCrossHook", "Passo in diagonale avanti a sinistra, poi 2-3 dal nuovo angolo", [[step1(g, "l", 0.14, -0.14), 220, 80], [angL.copy().act("legr"), 200, 120], [at(cross, 0.14, -0.14, -12), 170, 90], [at(hook, 0.14, -0.14, -12), 180, 220]], { end: angL });
    combo("boxe.diagROneTwo", "Passo in diagonale avanti a destra, poi 1-2 dal nuovo angolo", [[step1(g, "r", 0.14, 0.14), 220, 80], [angR.copy().act("legl"), 200, 120], [at(jab, 0.14, 0.14, 12), 150, 90], [at(cross, 0.14, 0.14, 12), 170, 220]], { end: angR });
    combo("boxe.comboPivot90", "1-2-3, perno di 90 gradi e jab nella nuova direzione", [[jab, 150, 80], [cross, 170, 80], [hook, 180, 60], [pivotOn(hook, -45).heel("l", 26).act("legl", "legr", "torso"), 200, 0], [piv(90).act("legr"), 200, 150], [p90(jab), 150, 200]], { end: piv(90) });
    // navetta (chelnok): piccoli rimbalzi avanti e indietro sugli avampiedi
    const aF = air(at(gUp, 0.06)).act("legl", "legr");
    const lF = at(gUp, 0.12);
    mv("boxe.shuttle", "Navetta: piccoli rimbalzi avanti e indietro sugli avampiedi", [K(g, 250, 60), K(aF, 120, 0), K(lF, 110, 60), K(aF, 120, 0), K(gUp, 110, 60), K(aF, 120, 0), K(lF, 110, 60), K(gUp, 240, 200)]);
    mv("boxe.shuttleJab", "Navetta e jab: jab sul rimbalzo avanti, fuori sul rimbalzo indietro", [K(g, 250, 60), K(gUp, 150, 40), K(aF, 120, 0), K(at(jab, 0.12), 130, 140), K(aF.copy().act("legl", "legr"), 120, 0), K(gUp, 110, 80), K(g, 200, 200)]);
    mv("boxe.shuttleDoubleJab", "Navetta e jab doppio: il secondo jab arriva col rimbalzo avanti", [K(g, 250, 60), K(aF, 120, 0), K(at(jabShort, 0.12), 120, 60), K(at(g, 0.12), 100, 0), K(at(jab, 0.2), 130, 140), K(air(at(gUp, 0.1)), 140, 0), K(gUp, 110, 60), K(g, 200, 200)]);
    mv("boxe.shuttleAdvance", "Navetta avanzante: due rimbalzi avanti con jab, uno indietro", [K(g, 250, 60), K(aF, 120, 0), K(at(jab, 0.12), 130, 100), K(air(at(gUp, 0.18)), 120, 0), K(at(jab, 0.24), 130, 100), K(air(at(gUp, 0.18)), 120, 0), K(at(gUp, 0.12), 110, 100), K(at(g, 0.12), 200, 200)]);
    const io1 = g.copy().step("l", 0.14).shift(0.05).heel("r", 30).act("legl");
    const io2 = io1.copy().step("r", 0.14).shift(0.05).act("legr");
    const io3 = io2.copy().step("l", -0.14, 0.2).shift(-0.05, 0.1).act("legl");
    mv("boxe.ladderInOut", "Dentro-dentro-fuori-fuori: piedi rapidi che entrano ed escono di lato", [K(g, 250, 60), K(io1, 140, 40), K(io2, 140, 40), K(io3, 140, 40), K(at(g, 0, 0.2).act("legr"), 140, 250)]);
    mv("boxe.bounce", "Saltello in guardia, sulle punte, leggero", [K(g, 200, 50), K(gUp.copy().sink(-0.03), 170, 40), K(g, 170, 40), K(gUp.copy().sink(-0.03), 170, 40), K(g, 170, 200)]);

    /* ---------------- corde e muro */
    combo("boxe.ropesPivot", "Dalle corde: perno di 90 gradi, poi passo fuori", [cover90(), [pivMid(45), 200, 0], [piv(90), 200, 150], [p90(step1(g, "l", 0.2, 0)), 200, 80], [p90(step2(g, "l", 0.2, 0)), 200, 300]], { end: false });
    function cover90() { return [block, 200, 300]; }
    combo("boxe.ropesRoll", "Dalle corde: roll sotto il gancio e passo laterale fuori", [[rollDown(-0.04), 220, 30], [rollDown(0.1), 220, 30], [rollUpR, 200, 80], [step1(g, "r", 0, 0.3), 200, 80], [step2(g, "r", 0, 0.3), 200, 300]], { end: false });

    /* ---------------- finte e ritmo */
    const fJab = g.copy().turn(-6).shift(0.02).straight("l", "head", 0.66).act("arml", "torso");
    mv("boxe.feintJab", "Finta di jab: la mano parte di 10 cm con la spalla e torna", [K(g, 300, 200), K(fJab, 120, 120), K(g, 160, 400)]);
    const fSh = g.copy().turn(14).shift(0.02).lean(0.02).act("torso");
    cheek(fSh, "r");
    mv("boxe.feintShoulder", "Finta di spalla: la spalla destra accenna il diretto, la mano resta al viso", [K(g, 300, 200), K(fSh, 130, 120), K(g, 160, 400)]);
    const fStepUp = g.copy().lift("l", 0.05).shift(0.02).act("legl");
    const fStep = g.copy().step("l", 0.08).shift(0.05).lean(0.04).act("legl", "torso");
    mv("boxe.feintStep", "Finta di piede: pestone del piede anteriore, il busto si sporge appena", [K(g, 300, 200), K(fStepUp, 120, 0), K(fStep, 100, 220), K(g, 220, 400)]);
    const fLev = g.copy().sink(0.12).lean(0.05, 0, 0.03).act("legl", "legr");
    mv("boxe.feintLevel", "Finta di livello: piegati come per il colpo al corpo, poi risali", [K(g, 300, 200), K(fLev, 180, 150), K(g, 200, 400)]);
    combo("boxe.brokenRhythm", "Ritmo spezzato: 1, pausa, poi 2-3 a tempo doppio", [[jab, 150, 120], G(140, 750), [cross, 110, 40], [hook, 120, 220]]);
    combo("boxe.offBeat", "Fuori battuta: saltello a tempo, jab a metà tra due battiti", [[gUp, 200, 150], G(200, 60), [jab, 110, 120], G(150, 100), [gUp, 200, 150]]);

    /* ---------------- sacco */
    // sacco un po' piu' lontano: il jab lo tocca col braccio quasi disteso
    const BAGB = Object.assign({}, BAG, { x: 0.94 });
    const bag = { props: [BAGB] };
    const bJab = g.copy().turn(-14).shift(0.04).lean(0.03).straight("l", [0.8, 1.48, 0.0], 0.97).act("arml");
    const bCross = g.copy().turn(48).shift(0.1).lean(0.07).straight("r", [0.84, 1.48, 0.0], 0.98).heel("r", 30).fyaw("r", -12).act("armr", "legr");
    const bCrossIn = g.copy().turn(48).shift(0.07).lean(0.05).straight("r", [0.8, 1.48, 0.0], 0.8).heel("r", 30).fyaw("r", -12).act("armr", "legr");
    mv("boxe.bagJab", "Jab al sacco: schiocco secco e ritorno immediato al viso", [K(g, 300, 200), K(bJab, 140, 160), K(g, 200, 300)], bag);
    mv("boxe.bagCross", "Diretto al sacco: rotazione completa del piede, schiocco e ritorno", [K(g, 300, 200), K(bCross, 160, 180), K(g, 220, 300)], bag);
    mv("boxe.bagOneTwo", "Uno-due al sacco: due colpi distinti, ts-ts", [K(g, 300, 150), K(bJab, 140, 100), K(g, 130, 30), K(bCross, 160, 200), K(g, 220, 300)], bag);
    mv("boxe.bagCombo", "Al sacco: 1-2, mezzo passo dentro per il gancio, diretto, fuori", [K(g, 300, 150), K(bJab, 140, 80), K(bCross, 160, 80), K(at(hook, 0.18), 180, 80), K(at(bCrossIn, 0.18), 170, 120), K(at(g, 0.18), 160, 60), K(at(step1(g, "r", -0.18, 0), 0.18), 200, 80), K(g, 200, 300)], bag);
    mv("boxe.bagBody", "Al sacco: jab al corpo e gancio al fegato nella parte bassa", [K(g, 300, 150), K(jabBody, 200, 120), K(g, 160, 40), K(at(g, 0.18).sink(0.1).act("legl", "legr"), 180, 30), K(at(leadHook(g, true, 0.6), 0.18), 220, 160), K(at(g, 0.18), 200, 60), K(g, 220, 300)], bag);
    mv("boxe.bagInside", "Al sacco da vicino: montanti 5-6 e gancio, poi esci", [K(g, 300, 150), K(at(g, 0.2).act("legl", "legr"), 180, 40), K(at(dipL, 0.2), 140, 30), K(at(leadUpper(0.56, 0.36, 1.38), 0.2), 160, 90), K(at(rearUpper(0.56, 0.44, 1.38), 0.2), 170, 90), K(at(hook, 0.2), 180, 120), K(at(step1(g, "r", -0.2, 0), 0.2), 200, 80), K(g, 200, 300)], bag);
    const circ1 = rotAbout(g.copy(), -28, BAGB.x, 0);
    const circH = rotAbout(g.copy(), -14, BAGB.x, 0);
    const circM = circH.copy().set("foot", Object.assign({}, circH.p.foot, { l: circ1.p.foot.l })).set("footYaw", Object.assign({}, circH.p.footYaw, { l: circ1.p.footYaw.l })).act("legl");
    mv("boxe.bagCircle", "Gira intorno al sacco: passo laterale e ti ritrovi di fronte", [K(g, 300, 200), K(circM, 240, 100), K(circ1.copy().act("legr"), 220, 400)], bag);
    mv("boxe.bagWait", "Il sacco oscilla: aspetta che torni alla distanza e colpiscilo", [K(g, 250, 100), K(gUp.copy().sink(-0.02), 170, 60), K(g, 170, 60), K(gUp.copy().sink(-0.02), 170, 60), K(g, 170, 200), K(bJab, 140, 140), K(g, 200, 300)], bag);
    const push = g.copy().turn(30).shift(0.14).lean(0.06).hand("l", P(g, 0.76, 1.3, -0.12), "open").hand("r", P(g, 0.76, 1.3, 0.1), "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]).act("arml", "armr");
    mv("boxe.bagPush", "Spingi il sacco con i guanti per farlo oscillare", [K(g, 300, 150), K(push, 260, 250), K(g, 260, 400)], bag);
    const bSlipCross = g.copy().sink(0.04).lean(0.06, 0.04).turn(48).shift(0.1).straight("r", [0.84, 1.46, 0.0], 0.98).heel("r", 30).fyaw("r", -12).act("armr", "legr");
    mv("boxe.bagDodge", "Il sacco torna: pull back o slip, poi diretto", [K(g, 300, 150), K(pullB, 220, 150), K(bCross, 180, 200), K(g, 220, 200), K(slipOut, 200, 120), K(bSlipCross, 170, 200), K(g, 220, 300)], bag);
    mv("boxe.bagFlurry", "Raffica al sacco: 1-2-1-2 veloci, poi passo fuori", [K(g, 300, 100), K(bJab, 120, 30), K(bCross, 130, 30), K(bJab, 120, 30), K(bCross, 130, 100), K(g, 150, 40), K(step1(g, "l", 0, -0.2), 200, 80), K(step2(g, "l", 0, -0.2), 200, 300)], bag);

    /* ---------------- corda */
    const ropeA = standing().fists().handW("l", 0.05, 1.0, -0.26).handW("r", 0.05, 1.0, 0.26).heel("l", 22).heel("r", 22);
    const ropeB = ropeA.copy().sink(-0.04).set("foot", { l: [0, ankleY(30) + 0.04, -0.11], r: [0, ankleY(30) + 0.04, 0.11] }).set("footPitch", { l: 30, r: 30 }).act("legl", "legr");
    mv("boxe.rope", "Corda: saltello sulle punte, polsi che girano", [K(ropeA, 200, 40), K(ropeB, 140, 40), K(ropeA, 140, 40), K(ropeB, 140, 40), K(ropeA, 140, 200)]);
    const shuffleA = ropeA.copy().set("foot", { l: [0.1, ankleY(25) + 0.03, -0.11], r: [-0.08, ankleY(25), 0.11] }).sink(-0.02);
    const shuffleB = ropeA.copy().set("foot", { l: [-0.08, ankleY(25), -0.11], r: [0.1, ankleY(25) + 0.03, 0.11] }).sink(-0.02);
    mv("boxe.ropeShuffle", "Corda: passo del pugile, un piede avanti e uno dietro alternati", [K(ropeA, 200, 30), K(shuffleA.act("legl", "legr"), 150, 30), K(shuffleB.act("legl", "legr"), 150, 30), K(shuffleA, 150, 30), K(shuffleB, 150, 200)]);
    const ropeAt = (dx, dz) => ropeB.copy().move(dx, dz).handW("l", 0.05, 1.04, -0.26).handW("r", 0.05, 1.04, 0.26);
    mv("boxe.ropeSide", "Corda: saltelli laterali, piedi uniti che si spostano a destra e a sinistra", [K(ropeA, 200, 30), K(ropeAt(0, 0.1), 150, 30), K(ropeA.copy().move(0, 0.1), 130, 30), K(ropeAt(0, -0.1), 170, 30), K(ropeA.copy().move(0, -0.1), 130, 30), K(ropeAt(0, 0.02), 160, 30), K(ropeA, 130, 200)]);
    mv("boxe.ropeFwdBack", "Corda: saltelli avanti e indietro a piedi uniti", [K(ropeA, 200, 30), K(ropeAt(0.1, 0), 150, 30), K(ropeA.copy().move(0.1), 130, 30), K(ropeAt(-0.1, 0), 170, 30), K(ropeA.copy().move(-0.1), 130, 30), K(ropeAt(0, 0), 160, 30), K(ropeA, 130, 200)]);
    const ropeX = ropeB.copy().handW("l", 0.22, 1.12, 0.1).handW("r", 0.24, 1.1, -0.1).elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]).act("arml", "armr", "legl", "legr");
    mv("boxe.ropeCross", "Corda: incrocio, le braccia si incrociano davanti a ogni secondo salto", [K(ropeA, 200, 30), K(ropeB, 140, 30), K(ropeA, 140, 30), K(ropeX, 140, 60), K(ropeA, 140, 30), K(ropeB, 140, 200)]);

    /* ---------------- riscaldamento e condizionamento */
    const tw = (d) => { const b = g.copy().twist(d).hips(d * 0.4); b.handRel("l", 0.24, 0.0, -0.22, "fist").handRel("r", 0.24, 0.0, 0.22, "fist").elbow("l", [0, -1, 0]).elbow("r", [0, -1, 0]); return b.act("torso"); };
    mv("boxe.guardTwist", "In guardia: rotazioni del busto a destra e sinistra, braccia a 90 gradi", [K(g, 300, 100), K(tw(0), 300, 100), K(tw(35), 450, 150), K(tw(-30), 600, 150), K(tw(0), 400, 100), K(g, 300, 200)]);
    const dip = g.copy().sink(0.15).lean(0.02).act("legl", "legr");
    mv("boxe.guardDip", "Squat lento di 15-20 cm in guardia, mani al viso", [K(g, 300, 150), K(dip, 650, 250), K(g, 600, 250)]);
    const gsq = g.copy().sink(0.3).shift(-0.06).lean(0.08, 0, 0.02).act("legl", "legr");
    guardUp(gsq);
    mv("boxe.guardSquat", "Squat in guardia: cosce quasi parallele, mani al viso", [K(g, 300, 150), K(gsq, 650, 250), K(g, 550, 250)]);
    const lt = (side) => {
      const b = L.lunge(side, 0.9);
      const d = side === "l" ? 38 : -38;
      b.twist(d).handRel("l", 0.28, -0.08, -0.16, "fist").handRel("r", 0.28, -0.08, 0.16, "fist");
      return b.act("torso", "legl", "legr");
    };
    mv("boxe.lungeTwist", "Affondo in avanti con torsione del busto verso la gamba davanti", [K(standing(), 300, 150), K(lt("l"), 650, 350), K(standing(), 500, 150), K(lt("r"), 650, 350), K(standing(), 500, 200)]);
    const pu0 = standing().foot("l", 0, -0.16, 10, 0).foot("r", 0, 0.16, -10, 0).handRel("l", 0.12, 0.02, -0.2, "fist").handRel("r", 0.12, 0.02, 0.2, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    const puL = pu0.copy().handW("l", 0.06, 2.0, -0.16, "fist").elbow("l", [0, 0, -1]).act("arml");
    const puR = pu0.copy().handW("r", 0.06, 2.0, 0.16, "fist").elbow("r", [0, 0, 1]).act("armr");
    mv("boxe.punchUp", "Pugni dritti verso il soffitto alternati, braccia che si distendono", [K(pu0, 300, 100), K(puL, 200, 100), K(pu0, 180, 30), K(puR, 200, 100), K(pu0, 180, 30), K(puL, 200, 100), K(pu0, 180, 30), K(puR, 200, 200)]);
    // a terra
    const lb = lieBack({ kneesUp: true }).fists().handHead("l", 0.12, 0.0, -0.1).handHead("r", 0.12, 0.0, 0.1).elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
    const crU = lieBack({ kneesUp: true }).fists().set("chest", [-0.44, 0.3, 0]).set("head", [-0.6, 0.42, 0]);
    crU.handHead("l", 0.12, 0.0, -0.1).handHead("r", 0.12, 0.0, 0.1).elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
    const crL = crU.copy().handW("l", -0.3, 0.82, -0.12, "fist").elbow("l", [0, 0, -1]).act("arml", "torso");
    const crR = crU.copy().handW("r", -0.3, 0.82, 0.12, "fist").elbow("r", [0, 0, 1]).act("armr", "torso");
    mv("boxe.crunchPunch", "Crunch con pugni: a ogni salita un uno-due verso il soffitto", [K(lb, 300, 150), K(crU.copy().act("torso"), 380, 40), K(crL, 160, 80), K(crR, 160, 120), K(lb, 380, 150)]);
    const pt = plank();
    const ptL = plank().handW("l", 0.18, 0.66, 0.12, "open").elbow("l", [-0.3, 1, 0]).act("arml");
    const ptR = plank().handW("r", 0.18, 0.66, -0.12, "open").elbow("r", [-0.3, 1, 0]).act("armr");
    mv("boxe.plankTap", "Plank: tocco alternato della spalla opposta, bacino fermo", [K(pt, 300, 150), K(ptL, 250, 200), K(pt, 220, 60), K(ptR, 250, 200), K(pt, 220, 100)]);
    const pjL = plank().handW("l", 0.72, 0.58, -0.1, "fist").elbow("l", [0, -1, -0.2]).act("arml");
    const pjR = plank().handW("r", 0.72, 0.58, 0.1, "fist").elbow("r", [0, -1, 0.2]).act("armr");
    mv("boxe.plankJab", "Plank alta: jab lento alternando le braccia, bacino fermo", [K(pt, 300, 150), K(pjL, 400, 250), K(pt, 350, 100), K(pjR, 400, 250), K(pt, 350, 150)]);
    const sh = (d, s) => {
      const b = sitLong().footAt("l", [0.45, 0.2, -0.1], 0, -10).footAt("r", [0.45, 0.2, 0.1], 0, -10).set("chest", [-0.22, 0.52, 0]).set("head", [-0.24, 0.73, 0]).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).twist(d);
      b.handRel("l", 0.24, 0.05, -0.1, "fist").handRel("r", 0.24, 0.05, 0.1, "fist");
      if (s === "r") b.handRel("r", 0.34, 0.03, -0.16, "fist").elbow("r", [0, 0.3, 1]).act("armr", "torso");
      if (s === "l") b.handRel("l", 0.34, 0.03, 0.16, "fist").elbow("l", [0, 0.3, -1]).act("arml", "torso");
      return b;
    };
    mv("boxe.seatedHooks", "Seduto, piedi sollevati: ruota il busto con un gancio corto per lato", [K(sh(0), 300, 150), K(sh(40, "r"), 380, 150), K(sh(-40, "l"), 480, 150), K(sh(40, "r"), 480, 150), K(sh(0), 380, 150)]);
    const db0 = lieBack().footAt("l", [0.44, 0.55, -0.11], 0, -10).footAt("r", [0.44, 0.55, 0.11], 0, -10).knee("l", [-1, 1, 0]).knee("r", [-1, 1, 0]).handW("l", -0.44, 0.67, -0.17, "open").handW("r", -0.44, 0.67, 0.17, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    const dbA = db0.copy().handW("l", -1.04, 0.2, -0.2, "open").footAt("r", [0.86, 0.22, 0.11], 0, -40).knee("r", [0, 1, 0]).act("arml", "legr");
    const dbB = db0.copy().handW("r", -1.04, 0.2, 0.2, "open").footAt("l", [0.86, 0.22, -0.11], 0, -40).knee("l", [0, 1, 0]).act("armr", "legl");
    mv("boxe.deadBug", "Dead bug: schiena a terra, braccio e gamba opposti si allungano piano", [K(db0, 300, 150), K(dbA, 650, 250), K(db0, 550, 100), K(dbB, 650, 250), K(db0, 550, 150)]);
    const hh = lieBack().set("chest", [-0.47, 0.22, 0]).set("head", [-0.66, 0.31, 0]).footAt("l", [0.86, 0.24, -0.08], 0, -50).footAt("r", [0.86, 0.24, 0.08], 0, -50).handW("l", 0.0, 0.3, -0.24, "open").handW("r", 0.0, 0.3, 0.24, "open").elbow("l", [0, 1, -0.5]).elbow("r", [0, 1, 0.5]);
    mv("boxe.hollowHold", "Barchetta: spalle e gambe sollevate di pochi centimetri, lombari a terra", [K(lieBack(), 300, 150), K(hh.act("torso", "legl", "legr"), 500, 1400), K(lieBack(), 450, 200)]);

    /* ---------------- allungamenti */
    const cd = standing().handW("l", -0.02, 1.72, -0.48, "open").elbow("l", [0, -0.3, -1]).act("arml", "torso");
    const cd2 = cd.copy().twist(-28).hips(-12).foot("l", 0.12, -0.12, 0, 0);
    mv("boxe.chestDoor", "Pettorali allo stipite: avambraccio appoggiato, busto che ruota dall'altra parte", [K(standing(), 300, 150), K(cd, 450, 200), K(cd2, 700, 1300), K(standing(), 600, 200)]);
    const ws1 = standing().handW("l", 0.56, 1.32, -0.08, "open").elbow("l", [0, -1, 0]).handW("r", 0.5, 1.26, -0.02, "open").elbow("r", [0, -1, 0.5]).act("arml");
    const ws2 = ws1.copy().handW("l", 0.56, 1.36, -0.08, "open").handW("r", 0.5, 1.4, -0.03, "open");
    mv("boxe.wristStretch", "Polsi: braccio teso, l'altra mano tira dolcemente le dita", [K(standing(), 300, 150), K(ws1, 500, 1100), K(ws2, 500, 1100), K(standing(), 500, 200)]);
    const f4 = sitLong().footAt("r", [0.42, 0.08, 0.14], 0, 0).knee("r", [0, 1, 0.1]).footAt("l", [0.26, 0.5, 0.08], 80, 0, 80).knee("l", [0.3, 0.4, -1]).handW("l", 0.28, 0.42, -0.14, "open").handW("r", 0.36, 0.46, 0.14, "open");
    const f4b = f4.copy().set("chest", [0.2, 0.58, 0]).set("head", [0.3, 0.76, 0]).act("torso", "legl");
    mv("boxe.figure4", "Figura 4 da seduto: caviglia sul ginocchio opposto, busto avanti", [K(sitLong(), 300, 150), K(f4, 600, 200), K(f4b, 700, 1300), K(sitLong(), 600, 200)]);
    const lat = standing().foot("l", -0.05, -0.12, 5, 0).foot("r", -0.05, 0.12, -5, 0).set("pel", [-0.22, 0.92, 0]).set("chest", [0.24, 0.82, 0]).set("head", [0.42, 0.76, 0]).handW("l", 0.76, 0.86, -0.15, "open").handW("r", 0.76, 0.86, 0.15, "open").knee("l", [1, 0, 0]).knee("r", [1, 0, 0]);
    mv("boxe.latStretch", "Dorsali: mani su un tavolo, braccia tese, spingi il petto verso terra", [K(standing(), 300, 150), K(lat.act("torso", "arml", "armr"), 800, 1400), K(standing(), 700, 200)]);

    /* ---------------- bendaggio */
    const wb = standing().handRel("l", 0.32, -0.14, -0.02, "open").elbow("l", [0, -1, -0.3]).handRel("r", 0.28, -0.12, 0.08, "fist").elbow("r", [0, -1, 0.3]);
    const wl = wb.p.hand.l;
    const around = (c, a, r = 0.07) => add(c, [0, r * Math.cos(a), r * Math.sin(a)]);
    const wAt = (c, a) => wb.copy().hand("r", around(c, a), "fist").act("armr");
    const wrist = add(wl, [-0.07, 0, 0.0]);
    const knuck = add(wl, [0.02, 0, 0.0]);
    mv("boxe.wrapThumb", "Anello della benda sul pollice, mano aperta e dita divaricate", [K(wb, 300, 200), K(wb.copy().hand("r", add(wl, [0.0, 0.02, -0.05]), "fist").act("armr"), 350, 300), K(wAt(add(wl, [-0.02, 0, 0]), 0), 300, 300), K(wb, 300, 200)]);
    mv("boxe.wrapWrist", "Giri della benda attorno al polso", [K(wb, 300, 100), K(wAt(wrist, 0), 250, 0), K(wAt(wrist, Math.PI / 2), 200, 0), K(wAt(wrist, Math.PI), 200, 0), K(wAt(wrist, Math.PI * 1.5), 200, 0), K(wAt(wrist, 0), 200, 0), K(wb, 300, 200)]);
    mv("boxe.wrapKnuckles", "In diagonale sul dorso, poi giri sulle nocche", [K(wb, 300, 100), K(wAt(wrist, 0), 250, 0), K(wAt(knuck, 0.3), 250, 0), K(wAt(knuck, Math.PI / 2), 200, 0), K(wAt(knuck, Math.PI), 200, 0), K(wAt(knuck, Math.PI * 1.5), 200, 0), K(wb, 300, 200)]);
    mv("boxe.wrapFingers", "La benda passa tra le dita e torna al polso", [K(wb, 300, 100), K(wAt(add(wl, [0.04, 0, 0.03]), -0.4), 300, 100), K(wAt(wrist, 0.6), 300, 100), K(wAt(add(wl, [0.04, 0, -0.01]), -0.4), 300, 100), K(wAt(wrist, 0.6), 300, 100), K(wb, 300, 200)]);
    const wFist = wb.copy().grip("l", "fist").act("arml");
    mv("boxe.wrapClose", "Chiudi al polso col velcro, poi chiudi e apri il pugno per provare", [K(wb, 300, 100), K(wAt(wrist, 0), 250, 0), K(wAt(wrist, Math.PI), 250, 100), K(wb, 250, 100), K(wFist, 250, 400), K(wb, 250, 200), K(wFist, 250, 400)]);

    mv("boxe.breath", "Espira corto dalla bocca a ogni colpo (\"ts\")", [K(g, 300, 200), K(jab.copy().act("arml", "head"), 150, 260), K(g, 220, 400)]);
  });
})(typeof window !== "undefined" ? window : globalThis);
