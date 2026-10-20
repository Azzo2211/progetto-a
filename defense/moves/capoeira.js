/*
 * Progetto A - Difesa: movimenti della capoeira (prefisso "capoeira.").
 * Posizione di base: la ginga con il destro dietro (G0) e il braccio destro davanti al viso.
 * La ginga completa e' G0 -> G1 (base parallela) -> G2 (sinistro dietro) -> G1 -> G0.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { mv, K, B, ginga, standing, ankleY, add, mul, norm, LEG, plank, allFours, lieBack, lieFront, sitLong, kneel, squat } = L;
    const DEG = Math.PI / 180;

    /* ---------------------------------------------------------------- aiuti */
    const mact = (a) => (a ? a.map((x) => x.replace(/(arm|leg)([lr])$/, (m, k, s) => k + (s === "l" ? "r" : "l"))) : a);
    const asB = (p) => (p instanceof B ? p.copy() : B.of(p));
    // fotogrammi a specchio (destra <-> sinistra)
    const mirrorFrames = (frames) => frames.map((f) => K(asB(f.p).mirror(), f.t, f.h, mact(f.act), f.partner ? asB(f.partner).mirror() : undefined));

    /* ---------------------------------------------------------------- ginga */
    const G0 = ginga(0);
    const G1 = ginga(1);
    const G2 = G0.copy().mirror();
    // la stessa tecnica dall'altro lato: mezza ginga fino al sinistro dietro, tecnica a specchio, ginga di ritorno
    const otherSide = (frames) => [K(G0, 300, 80), K(G1, 300, 60)].concat(mirrorFrames(frames), [K(G1, 300, 60), K(G0, 300, 200)]);

    mv("capoeira.ginga", "Ginga: destro dietro, base parallela, sinistro dietro, base, destro dietro", [
      K(G0, 300, 150), K(G1, 380, 100), K(G2.copy().act("legl", "arml"), 380, 150), K(G1, 380, 100), K(G0.copy().act("legr", "armr"), 380, 200)
    ]);
    mv("capoeira.gingaBase", "Base parallela: piedi larghi, ginocchia piegate, mani davanti al petto", [K(G1, 400, 1300)]);
    mv("capoeira.gingaBackR", "Tempo 2: il destro va indietro sull'avampiede e il braccio destro sale al viso", [
      K(G1, 300, 300), K(G0.copy().act("legr", "armr"), 450, 900), K(G1, 400, 300)
    ]);
    mv("capoeira.gingaBackL", "Tempo 3 e 4: torni in base, poi il sinistro va dietro e il braccio sinistro sale", [
      K(G1, 300, 300), K(G2.copy().act("legl", "arml"), 450, 900), K(G1, 400, 300)
    ]);

    /* ---------------------------------------------------------------- cocorinha */
    // accosciata profonda, piedi paralleli, mano sinistra a terra davanti, avambraccio destro sulla testa
    function coco() {
      const b = standing();
      b.foot("l", 0.02, -0.15, 12, 12).foot("r", 0.02, 0.15, -12, 12);
      b.set("pel", [-0.15, 0.33, 0]).set("chest", [0.24, 0.6, 0]).set("head", [0.31, 0.78, 0]).set("hipYaw", 0).set("chestYaw", 0);
      b.knee("l", [1, 0.2, -0.45]).knee("r", [1, 0.2, 0.45]);
      b.handW("l", 0.33, 0.035, -0.15, "open").elbow("l", [-0.3, 0, -1]);
      b.handHead("r", 0.12, 0.05, -0.05, "open").elbow("r", [0.4, -0.3, 1]);
      return b;
    }
    const C = coco();
    const CL = C.copy().mirror();
    mv("capoeira.cocorinha", "Cocorinha: giù sul posto, mano a terra davanti, avambraccio sulla testa", [
      K(G0, 300, 100), K(G1, 300, 60), K(C.copy().act("legl", "legr", "arml", "armr"), 320, 1000), K(G0.copy().act("legr"), 380, 250)
    ]);
    mv("capoeira.cocorinhaL", "Cocorinha con l'altro braccio: mano destra a terra, avambraccio sinistro sulla testa", [
      K(G0, 300, 100), K(G1, 300, 60), K(CL.copy().act("legl", "legr", "arml", "armr"), 320, 1000), K(G2.copy().act("legl"), 380, 150), K(G1, 300, 60), K(G0, 300, 200)
    ]);

    /* ---------------------------------------------------------------- esquivas */
    // esquiva baixa dalla ginga con il destro dietro: giu' in avanti verso il ginocchio sinistro
    function baixa() {
      const b = G0.copy();
      b.foot("l", 0.08, -0.27, 12, 0).foot("r", -0.72, 0.12, -15, 45);
      b.set("pel", [-0.24, 0.46, -0.05]).set("chest", [0.15, 0.62, -0.1]).set("head", [0.33, 0.7, -0.1]).set("hipYaw", -18).set("chestYaw", -10);
      b.knee("l", [1, 0.3, -0.2]).knee("r", [0.6, -1, 0.2]);
      b.handW("l", 0.24, 0.035, -0.3, "open").elbow("l", [-0.2, 0, -1]);
      b.handHead("r", 0.13, 0.06, -0.04, "open").elbow("r", [0.4, -0.3, 1]);
      return b;
    }
    const BX = baixa();
    const baixaFrames = [K(G0, 300, 100), K(BX.copy().act("legl", "torso", "arml"), 330, 900), K(G0.copy().act("legl"), 360, 250)];
    mv("capoeira.esquivaBaixa", "Esquiva baixa: giù in avanti sul ginocchio davanti, mano a terra, braccio sul viso", baixaFrames);
    mv("capoeira.esquivaBaixaL", "Esquiva baixa dall'altro lato: ginga con il sinistro dietro e giù in avanti", otherSide(baixaFrames));

    // esquiva lateral a destra: peso sulla gamba destra piegata, sinistra distesa di lato
    const G1w = G1.copy().foot("l", 0.02, -0.38, 12, 0).foot("r", 0.02, 0.38, -12, 0).sink(0.04);
    function lateral() {
      const b = G1.copy();
      b.foot("r", 0.02, 0.44, -20, 0).foot("l", 0.02, -0.5, 10, 0);
      b.set("pel", [-0.14, 0.44, 0.17]).set("chest", [0.2, 0.62, 0.36]).set("head", [0.33, 0.76, 0.4]).set("hipYaw", 0).set("chestYaw", 0).set("chestRoll", 18);
      b.knee("r", [1, 0.1, 0.5]).knee("l", [0.3, 1, 0]);
      b.handW("r", 0.27, 0.035, 0.47, "open").elbow("r", [-0.2, 0, 1]);
      b.handHead("l", 0.13, 0.05, 0.04, "open").elbow("l", [0.4, -0.3, -1]);
      return b;
    }
    const LT = lateral();
    mv("capoeira.esquivaLateral", "Esquiva lateral a destra: gamba destra piegata, sinistra distesa, mano a terra", [
      K(G0, 300, 100), K(G1w, 300, 80), K(LT.copy().act("legr", "legl", "torso", "armr"), 330, 900), K(G1w, 330, 80), K(G0, 330, 200)
    ]);
    mv("capoeira.esquivaLateralL", "Esquiva lateral a sinistra: gamba sinistra piegata, destra distesa, mano a terra", [
      K(G0, 300, 100), K(G1w, 300, 80), K(LT.copy().mirror().act("legl", "legr", "torso", "arml"), 330, 900), K(G1w, 330, 80), K(G0, 330, 200)
    ]);

    /* ---------------------------------------------------------------- negativa */
    // negativa con la gamba sinistra distesa: seduto sul piede destro, mano destra a terra accanto all'anca
    function negL() {
      const b = standing();
      b.foot("r", -0.02, 0.14, -15, 5).footAt("l", [0.58, 0.08, -0.13], 0, -78);
      b.set("pel", [-0.2, 0.27, 0.04]).set("chest", [-0.08, 0.62, 0.22]).set("head", [0.04, 0.79, 0.22]).set("hipYaw", -10).set("chestYaw", -5).set("chestRoll", 22);
      b.knee("r", [0.7, 1, 0.5]).knee("l", [0, 1, 0]);
      b.handW("r", -0.17, 0.035, 0.34, "open").elbow("r", [-0.3, 0, 1]);
      b.handHead("l", 0.13, 0.04, 0.05, "open").elbow("l", [0.4, -0.3, -1]);
      return b;
    }
    const NL = negL();
    const NR = NL.copy().mirror();
    mv("capoeira.negativa", "Negativa: gamba sinistra distesa a fil di terra, mano destra accanto all'anca", [
      K(C, 300, 150), K(NL.copy().act("legl", "legr", "armr"), 420, 1200), K(C, 400, 200)
    ]);
    mv("capoeira.negativaR", "Negativa con la gamba destra distesa, mano sinistra a terra, braccio destro sul viso", [
      K(C, 300, 150), K(NR.copy().act("legl", "legr", "arml"), 420, 1200), K(C, 400, 200)
    ]);

    /* ---------------------------------------------------------------- calci: aiuti */
    // gamba tesa (k = frazione della lunghezza) dall'anca nella direzione dir
    function legTo(b, s, dir, k, yaw, pitch, roll) { b.footW(s, add(b.hip(s), mul(norm(dir), LEG * k)), yaw, pitch || 0, roll || 0); return b; }
    // direzione orizzontale (hx, hz) con la pendenza giusta per portare il piede all'altezza h
    function legH(b, s, h, hx, hz, k, yaw, pitch, roll) {
      const hy = b.hip(s)[1];
      const dy = Math.max(-0.97, Math.min(0.97, (h - hy) / (LEG * k)));
      const r = Math.sqrt(1 - dy * dy);
      const hl = Math.hypot(hx, hz) || 1;
      return legTo(b, s, [(hx / hl) * r, dy, (hz / hl) * r], k, yaw, pitch, roll);
    }
    // ruota tutta la posa attorno al punto (px, pz) del pavimento
    function rotAbout(b, deg, px, pz) { const o = b.p.o; b.p.o = [px, pz]; b.spin(deg); b.p.o = o; return b; }
    // protezione: l'avambraccio di "s" davanti al viso, l'altra mano aperta davanti al petto
    function cover(b, s) {
      const ss = s === "l" ? -1 : 1;
      const o = s === "l" ? "r" : "l";
      const fr = b.frame();
      b.handHead(s, 0.17, 0.0, -ss * 0.05, "open").elbow(s, add(mul(fr.right, ss), mul(fr.up, -0.7)));
      b.handRel(o, 0.3, -0.16, -ss * 0.14, "open").elbow(o, add(mul(fr.up, -1), mul(fr.right, -ss * 0.3)));
      return b;
    }
    // in appoggio sul sinistro (piede della ginga), busto frontale: base dei calci con la destra
    function onLeft(hipYaw, chestYaw, dz) {
      const b = G0.copy();
      b.foot("l", 0.06, -0.26, 10, 0);
      b.set("pel", [-0.03, 0.87, -0.16 + (dz || 0)]).set("hipYaw", hipYaw).set("chestYaw", chestYaw).set("hipRoll", 0).set("chestRoll", 0);
      b.set("chest", [-0.01, 1.35, -0.13 + (dz || 0) * 1.6]).set("head", [0.03, 1.55, -0.13 + (dz || 0) * 1.9]);
      b.knee("l", [1, 0, -0.1]);
      return cover(b, "r");
    }

    /* ---------------------------------------------------------------- meia lua de frente */
    // la gamba dietro sale tesa da fuori, passa davanti in arco verso sinistra e torna in base parallela
    function meiaLua(H) {
      const a = legH(onLeft(-6, -4), "r", 0.62 + (H - 1) * 0.3, 0.35, 0.94, 0.97, -60, -10).knee("r", [0.3, 1, 0.2]).act("legr");
      const b = legH(onLeft(0, -2), "r", H, 0.95, 0.3, 0.97, -10, -55).knee("r", [0, 1, 0]).act("legr");
      const c = legH(onLeft(10, 4, 0.02), "r", H - 0.12, 0.85, -0.55, 0.97, 25, -45).knee("r", [0, 1, 0]).act("legr");
      const d = legTo(onLeft(4, 0), "r", [0.5, -0.86, -0.05], 0.82, 0, 20).knee("r", [1, 0.2, 0.2]);
      return [K(G0, 300, 100), K(a, 210, 0), K(b, 190, 60), K(c, 170, 40), K(d, 200, 30), K(G1, 220, 80), K(G0.copy().act("legr"), 300, 200)];
    }
    const meiaLuaF = meiaLua(1.42);
    mv("capoeira.meiaLuaFrente", "Meia lua de frente: la gamba dietro tesa disegna un arco da fuori a dentro", meiaLuaF);
    mv("capoeira.meiaLuaFrenteL", "Meia lua de frente con la sinistra, dalla ginga con il sinistro dietro", otherSide(meiaLuaF));
    mv("capoeira.meiaLuaLow", "Meia lua de frente lenta all'altezza del bacino", meiaLua(0.98).map((f) => K(f.p, f.t * 1.6, f.h + 80, f.act)));
    mv("capoeira.meiaLuaSlow", "Meia lua de frente lentissima: tre secondi per tutto l'arco", meiaLua(1.3).map((f, i) => K(f.p, i > 0 && i < 5 ? 750 : f.t, f.h, f.act)));

    /* ---------------------------------------------------------------- bênção, ponteira, martelo, chapa */
    const bencaoCh = G0.copy().kick("r", "teep", "chamber", "body");
    cover(bencaoCh, "r").act("legr");
    const bencaoEx = G0.copy().kick("r", "teep", "ext", "body");
    cover(bencaoEx, "r").act("legr");
    const bencaoFr = [K(G0, 300, 100), K(bencaoCh, 220, 60), K(bencaoEx, 180, 300), K(bencaoCh, 200, 50), K(G0.copy().act("legr"), 260, 200)];
    mv("capoeira.bencao", "Bênção: ginocchio al petto, poi spinta avanti con la pianta all'altezza dello stomaco", bencaoFr);
    mv("capoeira.bencaoL", "Bênção con la sinistra, dalla ginga con il sinistro dietro", otherSide(bencaoFr));
    mv("capoeira.bencaoHold", "Bênção lenta: tieni un secondo la gamba distesa, poi richiama", [K(G0, 300, 100), K(bencaoCh, 400, 300), K(bencaoEx, 450, 1000), K(bencaoCh, 400, 200), K(G0, 400, 200)]);
    mv("capoeira.chamberHold", "Tenuta su una gamba con il ginocchio al petto, poi dall'altro lato", [
      K(G1, 300, 100), K(bencaoCh.copy().act("legr", "legl"), 400, 1300), K(G1, 350, 100), K(bencaoCh.copy().mirror().act("legr", "legl"), 400, 1300), K(G1, 350, 200)
    ]);

    const pontCh = G0.copy().kick("r", "front", "chamber", "body");
    pontCh.p.footPitch.r = -10;
    cover(pontCh, "r").act("legr");
    const pontEx = G0.copy().kick("r", "front", "ext", "body");
    pontEx.p.footPitch.r = -15;
    cover(pontEx, "r").act("legr");
    const pontFr = [K(G0, 300, 100), K(pontCh, 170, 30), K(pontEx, 120, 100), K(pontCh, 110, 20), K(G0.copy().act("legr"), 200, 200)];
    mv("capoeira.ponteira", "Ponteira: il ginocchio sale, la gamba scatta e colpisce con l'avampiede, torna subito", pontFr);
    mv("capoeira.ponteiraL", "Ponteira con la sinistra, dalla ginga con il sinistro dietro", otherSide(pontFr));

    const martCh = G0.copy().kick("r", "round", "chamber", "body");
    const martEx = G0.copy().kick("r", "round", "ext", "body");
    const martHi = G0.copy().kick("r", "round", "ext", "head");
    const martFr = (ex) => [K(G0, 300, 100), K(martCh, 200, 40), K(ex, 160, 220), K(martCh, 160, 40), K(G0.copy().act("legr"), 240, 200)];
    mv("capoeira.martelo", "Martelo em pé: ginocchio di lato, perno del piede d'appoggio, colpo con il collo del piede", martFr(martEx));
    mv("capoeira.marteloL", "Martelo con la sinistra, dalla ginga con il sinistro dietro", otherSide(martFr(martEx)));
    mv("capoeira.marteloHigh", "Martelo alto all'altezza della testa, poi richiamo e ginga", martFr(martHi));

    const chapCh = G0.copy().kick("r", "side", "chamber", "body");
    cover(chapCh, "l").act("legr");
    const chapEx = G0.copy().kick("r", "side", "ext", "body");
    cover(chapEx, "l").act("legr");
    const chapFr = [K(G0, 300, 100), K(chapCh, 220, 60), K(chapEx, 190, 280), K(chapCh, 190, 50), K(G0.copy().act("legr"), 260, 200)];
    mv("capoeira.chapa", "Chapa: ginocchio al petto, anche di profilo, spinta di lato con la pianta", chapFr);
    mv("capoeira.chapaL", "Chapa con la sinistra, dalla ginga con il sinistro dietro", otherSide(chapFr));

    /* ---------------------------------------------------------------- queixada */
    function queixadaFrames(H) {
      const step = G0.copy().foot("l", 0.28, -0.42, 50, 0).foot("r", -0.48, 0.08, -10, 40);
      step.set("pel", [-0.04, 0.8, -0.16]).set("hipYaw", 25).set("chestYaw", 50).set("chest", [0.06, 1.25, -0.2]).set("head", [0.13, 1.43, -0.22]).set("headYaw", -35);
      cover(step, "r").knee("l", [1, 0, -0.6]).act("legl", "torso");
      const body = (hy, cy, dz) => {
        const b = G0.copy().foot("l", 0.28, -0.42, 45, 0);
        b.set("pel", [0.2, 0.87, -0.36 + dz]).set("hipYaw", hy).set("chestYaw", cy).set("chest", [0.2, 1.35, -0.32 + dz * 1.5]).set("head", [0.23, 1.55, -0.31 + dz * 1.7]).set("headYaw", -cy * 0.6);
        b.knee("l", [1, 0, -0.6]);
        return cover(b, "r");
      };
      const a = legH(body(35, 40, 0), "r", 0.8 + (H - 1) * 0.4, 0.75, -0.66, 0.97, 30, -30).knee("r", [0, 1, 0.3]).act("legr");
      const b = legH(body(20, 15, 0), "r", H, 1, 0.05, 0.97, 0, -50).knee("r", [0, 1, 0]).act("legr");
      const c = legH(body(-15, -10, 0.03), "r", H - 0.2, 0.5, 0.86, 0.97, -60, -30).knee("r", [0, 1, 0]).act("legr", "torso");
      const land = G0.copy().foot("l", 0.28, -0.42, 30, 0).shift(0.1, -0.08);
      return [K(G0, 300, 100), K(step, 260, 120), K(a, 210, 0), K(b, 170, 50), K(c, 170, 30), K(land, 240, 80), K(G0, 280, 200)];
    }
    const queixF = queixadaFrames(1.48);
    mv("capoeira.queixada", "Queixada: passo in diagonale, la gamba dietro sale incrociata e si apre ad arco", queixF);
    mv("capoeira.queixadaL", "Queixada con la sinistra, dalla ginga con il sinistro dietro", otherSide(queixF));
    mv("capoeira.queixadaLow", "Queixada lenta all'altezza del bacino", queixadaFrames(1.0).map((f) => K(f.p, f.t * 1.5, f.h + 60, f.act)));
    mv("capoeira.queixadaStep", "Passo corto in diagonale a sinistra, punta girata, spalle che caricano", [K(G0, 300, 100), K(queixF[1].p, 320, 900), K(G0, 320, 200)]);

    /* ---------------------------------------------------------------- armada (giro verso sinistra sul destro) */
    // posa locale (rivolto avanti, in appoggio sull'avampiede destro all'origine), poi portata sul perno e ruotata
    function armLocal(kind, H) {
      const b = standing();
      b.foot("r", 0, 0, 0, 18).set("hipYaw", 0).set("chestYaw", 0);
      if (kind === "cross") {
        b.foot("r", 0, 0, 15, 10).foot("l", -0.17, -0.15, -30, 35);
        b.set("pel", [-0.08, 0.83, -0.08]).set("chest", [-0.05, 1.31, -0.08]).set("head", [-0.01, 1.5, -0.08]).set("chestYaw", 15).set("headYaw", 25);
        b.knee("l", [1, 0, 0.3]).knee("r", [1, 0, -0.2]);
      } else if (kind === "look") {
        b.foot("l", -0.22, -0.12, 0, 55);
        b.set("pel", [-0.05, 0.85, -0.07]).set("chest", [-0.03, 1.33, -0.06]).set("head", [0.0, 1.52, -0.05]).set("chestYaw", 20).set("headYaw", 80);
        b.knee("l", [1, 0, 0]).knee("r", [1, 0, 0]);
      } else if (kind === "turn") {
        b.footAt("l", [-0.06, 0.16, -0.17], 0, 30);
        b.set("pel", [-0.03, 0.88, -0.07]).set("chest", [-0.02, 1.36, -0.05]).set("head", [0.01, 1.56, -0.04]).set("chestYaw", 10).set("headYaw", 70);
        b.knee("l", [1, 0.3, 0]).knee("r", [1, 0, 0]);
      } else {
        const follow = kind === "follow";
        b.set("pel", [-0.03, 0.9, -0.07]).set("chest", [-0.03, 1.33, 0.14]).set("head", [-0.02, 1.52, 0.2]).set("chestYaw", follow ? -10 : 0).set("headYaw", follow ? 40 : 70);
        b.knee("r", [1, 0, 0]);
        if (follow) legH(b, "l", Math.max(0.3, H - 0.4), 0.65, -0.76, 0.97, -30, -10, 0).knee("l", [0, 1, 0]);
        else legH(b, "l", H, 0.18, -1, 0.97, -20, -15, 0).knee("l", [0, 1, 0]);
      }
      cover(b, "r");
      if (kind === "kick" || kind === "follow") b.act("legl", "torso");
      return b;
    }
    const placed = (b, deg, px, pz) => { const w = b.copy().move(px, pz); rotAbout(w, deg, px, pz); w.p.o = [0, 0]; return w; };
    const spun = (b, deg) => { const w = b.copy(); rotAbout(w, deg, w.p.o[0], w.p.o[1]); return w; };
    function armadaFrames(H, kick) {
      const fr = [K(G0, 300, 100), K(placed(armLocal("cross"), 70, 0.24, -0.38).act("legr", "head"), 240, 80), K(placed(armLocal("look"), 165, 0.2, -0.27).act("head", "torso"), 220, 40)];
      if (kick) fr.push(K(placed(armLocal("kick", H), 255, 0.16, -0.16), 200, 60), K(placed(armLocal("follow", H), 315, 0.12, -0.06), 170, 20));
      else fr.push(K(placed(armLocal("turn"), 265, 0.15, -0.12).act("legr", "torso"), 260, 40));
      fr.push(K(spun(G2.copy().move(0.04, -0.23), 360).act("legl"), 230, 80), K(spun(G1.copy().move(0.02, -0.11), 360), 260, 40), K(spun(G0, 360), 280, 120), K(G0, 0, 80));
      return fr;
    }
    const armadaF = armadaFrames(1.42, true);
    mv("capoeira.armada", "Armada: passo incrociato, la testa trova l'avversario, la gamba tesa gira in orizzontale", armadaF);
    mv("capoeira.armadaL", "Armada dall'altro lato: passo incrociato del sinistro e calcio con la destra", otherSide(armadaF));
    mv("capoeira.armadaLow", "Armada con la gamba tesa all'altezza del ginocchio", armadaFrames(0.55, true));
    mv("capoeira.armadaMid", "Armada con la gamba tesa all'altezza del bacino", armadaFrames(0.95, true));
    const giroF = armadaFrames(0, false);
    mv("capoeira.armadaGiro", "Giro dell'armada senza calcio: passo incrociato, testa, perno sull'avampiede", giroF);
    mv("capoeira.armadaGiroL", "Giro dell'armada dall'altro lato, sul sinistro", otherSide(giroF));
    mv("capoeira.armadaHalf", "Giro dell'armada lento con una pausa a metà per l'equilibrio", giroF.map((f, i) => K(f.p, f.t ? f.t + 120 : 0, i === 2 ? 1100 : f.h, f.act)));
    mv("capoeira.armadaCross", "Il destro passa davanti al sinistro, incrociato, punta girata a sinistra", [K(G0, 300, 100), giroF[1], K(giroF[1].p, 0, 700), K(G0, 330, 200)]);
    mv("capoeira.armadaLook", "Dal passo incrociato la testa gira e guarda sopra la spalla sinistra", [K(G0, 300, 100), giroF[1], K(giroF[2].p, 300, 900, ["head"]), giroF[1], K(G0, 330, 200)]);

    /* ---------------------------------------------------------------- meia lua de compasso (giro verso destra sul sinistro) */
    // posa locale: busto giu' in avanti, mani a terra, perno sull'avampiede sinistro; poi ruotata attorno al piede
    function compLocal(phase, H) {
      const b = standing();
      const up = phase === "apex" ? 0.2 : phase === "mid" || phase === "down" ? 0.07 : 0;
      b.foot("l", 0.06, -0.26, 15, 22).set("hipYaw", 0).set("chestYaw", 0);
      b.set("pel", [-0.08, 0.62 + up, -0.15]).set("chest", [0.3, 0.42 + up * 0.25, -0.17]).set("head", [0.44, 0.28 + up * 0.25, -0.17]);
      b.knee("l", [1, 0.1, -0.3]);
      b.handW("l", 0.46, 0.035, -0.42, "open").handW("r", 0.5, 0.035, 0.02, "open").elbow("l", [-0.4, 0, -1]).elbow("r", [-0.4, 0, 1]);
      if (phase === "start") b.footAt("r", [0.09, ankleY(10), 0.405], -20, 10).knee("r", [0.3, 1, 0.3]);
      else if (phase === "mid") legH(b, "r", Math.min(H, 0.85), -0.2, 1, 0.97, 60, 0, 0).knee("r", [0, 1, 0]);
      else if (phase === "apex") legH(b, "r", H, -0.75, 0.66, 0.97, 120, 10, 0).knee("r", [0, 1, 0]);
      else legH(b, "r", Math.min(H, 0.8), -0.6, 0.8, 0.97, 90, 0, 0).knee("r", [0, 1, 0]);
      if (phase !== "start") b.act("legr");
      return b;
    }
    const L0 = [0.06, -0.26];
    const compAt = (phase, H, deg) => { const w = compLocal(phase, H); rotAbout(w, deg, L0[0], L0[1]); return w; };
    function compassoFrames(H) {
      return [K(G0, 300, 100), K(compAt("start", H, -60).act("arml", "armr", "head"), 330, 200), K(compAt("mid", H, -145), 230, 0), K(compAt("apex", H, -225), 230, 60), K(compAt("down", H, -295), 220, 30),
        K(spun(G0, -360).act("legr"), 300, 120), K(G0, 0, 80)];
    }
    const compF = compassoFrames(1.38);
    mv("capoeira.compasso", "Meia lua de compasso: mani a terra, sguardo tra le gambe, la gamba tesa gira con il tallone", compF);
    mv("capoeira.compassoL", "Meia lua de compasso con la sinistra, dalla ginga con il sinistro dietro", otherSide(compF));
    mv("capoeira.compassoMid", "Compasso lento a metà altezza", compassoFrames(0.95).map((f) => K(f.p, f.t ? f.t + 100 : 0, f.h, f.act)));
    const compR = compassoFrames(0.14);
    mv("capoeira.compassoRasteiro", "Compasso rasteiro: mani a terra e la gamba tesa che gira radente al pavimento", compR.map((f) => K(f.p, f.t ? f.t + 80 : 0, f.h, f.act)));
    mv("capoeira.compassoKnee", "Compasso con la gamba tesa all'altezza del ginocchio", compassoFrames(0.55));
    mv("capoeira.compassoLook", "Mani a terra davanti al piede sinistro e sguardo indietro tra le gambe", [K(G0, 300, 100), K(compF[1].p, 380, 1100, ["arml", "armr", "head"]), K(G0, 380, 200)]);

    /* ---------------------------------------------------------------- rasteira */
    const rastA = BX.copy().footAt("r", [0.38, 0.075, 0.46], -70, -35).knee("r", [0, 1, 0.3]).act("legr");
    const rastB = BX.copy().shift(0.08).footAt("r", [0.56, 0.075, -0.06], 10, -35).knee("r", [0, 1, 0]).act("legr");
    const rastC = BX.copy().footAt("r", [0.05, 0.075, 0.08], 0, -20).knee("r", [0.5, 1, 0.2]);
    const rastF = [K(G0, 300, 100), K(BX, 320, 150), K(rastA, 260, 40), K(rastB, 260, 60), K(rastC, 240, 60), K(G0.copy().act("legr"), 320, 200)];
    mv("capoeira.rasteira", "Rasteira: dall'esquiva baixa il piede a uncino scivola radente e tira verso di te", rastF);
    mv("capoeira.rasteiraL", "Rasteira con la sinistra, dalla ginga con il sinistro dietro", otherSide(rastF));

    /* ---------------------------------------------------------------- ruota sul piano frontale (aú, queda de rins) */
    // phi: 0 in piedi, 90 testa verso destra (fianco destro in basso), 180 capovolto, 270 testa verso sinistra.
    // Con hipYaw 90 e roll -90 il petto resta rivolto avanti (+x) per qualunque phi.
    function wheel(phi, pel) {
      const b = standing();
      const a = [0, Math.cos(phi * DEG), Math.sin(phi * DEG)];
      b.set("pel", pel).set("chest", add(pel, mul(a, 0.48))).set("head", add(add(pel, mul(a, 0.68)), [0.02, 0, 0]));
      b.set("hipYaw", 90).set("chestYaw", 90).set("hipRoll", -90).set("chestRoll", -90);
      return b;
    }
    const at = (b, dz) => b.copy().move(0, dz);
    // aú verso destra, rivolto avanti: mano destra, mano sinistra, piede sinistro, piede destro; poi ginga di ritorno al centro
    function auParts(low) {
      const k = low ? 0.62 : 0.97;
      const a1 = wheel(6, [0, 0.93, -0.55]).foot("l", 0, -0.76, 0, 0).foot("r", 0, -0.35, 0, 0);
      a1.handW("l", 0.05, 1.96, -0.68, "open").handW("r", 0.05, 1.93, -0.33, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
      const a2 = wheel(65, [0, 0.52, -0.5]).foot("r", 0, -0.3, 0, 10).knee("r", [0.3, 0.3, 1]);
      legTo(a2, "l", [0, 0.55, -0.84], k, 0, -40).knee("l", low ? [0.3, 0.2, -1] : [0, 1, 0]);
      a2.handW("r", 0.03, 0.035, 0.05, "open").handW("l", 0.04, 0.5, 0.27, "open").elbow("r", [0, 0.3, 1]).elbow("l", [0, 1, 0.3]).act("armr", "legl", "legr");
      const a3 = wheel(180, [0, low ? 1.0 : 1.06, 0.3]);
      a3.handW("r", 0.02, 0.035, 0.05, "open").handW("l", 0.02, 0.035, 0.55, "open").elbow("r", [0, 0, -1]).elbow("l", [0, 0, 1]);
      legTo(a3, "r", low ? [0.15, 0.6, -0.78] : [0, 0.9, -0.44], k, 0, -70).knee("r", low ? [0.6, 0.3, -1] : [0.3, 0, -1]);
      legTo(a3, "l", low ? [0.15, 0.6, 0.78] : [0, 0.9, 0.44], k, 0, -70).knee("l", low ? [0.6, 0.3, 1] : [0.3, 0, 1]);
      a3.act("arml", "armr", "legl", "legr");
      const a4 = wheel(290, [0, 0.62, 0.72]).foot("l", 0, 0.88, 0, 15).knee("l", [0.3, 0.3, -1]);
      legTo(a4, "r", [0, 0.7, 0.71], k, 0, -40).knee("r", low ? [0.3, 0.2, 1] : [0, 1, 0]);
      a4.handW("l", 0.04, 0.2, 0.5, "open").handW("r", 0.05, 1.3, 0.2, "open").elbow("l", [0, 0.3, -1]).elbow("r", [0, -0.3, 1]).act("legl", "legr");
      const a5 = wheel(354, [0, 0.86, 1.03]).foot("l", 0, 0.86, 0, 0).foot("r", 0, 1.22, 0, 0).knee("l", [1, 0, -0.2]).knee("r", [1, 0, 0.2]);
      a5.handW("l", 0.2, 1.45, 0.82, "open").handW("r", 0.25, 1.35, 1.1, "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]).act("legr");
      return { a1, a2, a3, a4, a5 };
    }
    // ginga di ritorno al centro dopo un aú verso destra (da circa +0,9 m)
    const backFromRight = [K(at(G2, 0.75), 300, 50), K(at(G1, 0.42), 300, 50), K(G0, 300, 200)];
    function auFrames(low, slow) {
      const A = auParts(low);
      const s = slow ? 1.8 : 1;
      return [K(G0, 300, 100), K(at(G1, -0.28), 300, 60), K(A.a1, 300, slow ? 500 : 250), K(A.a2, 280 * s, slow ? 500 : 20), K(A.a3, 260 * s, slow ? 150 : 60), K(A.a4, 260 * s, slow ? 500 : 20), K(A.a5, 260 * s, 150)].concat(backFromRight);
    }
    const auF = auFrames(false);
    mv("capoeira.au", "Aú verso destra: mani una dopo l'altra, gambe tese a V sopra le anche, sguardo avanti", auF);
    mv("capoeira.auL", "Aú verso sinistra: mano sinistra, mano destra, gambe a V, atterraggio un piede alla volta", otherSide(auF));
    const auLowF = auFrames(true);
    mv("capoeira.auBaixo", "Aú basso verso destra: ginocchia piegate che passano sopra le anche", auLowF);
    mv("capoeira.auBaixoL", "Aú basso verso sinistra, ginocchia piegate", otherSide(auLowF));
    const auSlowF = auFrames(false, true);
    mv("capoeira.auLento", "Aú lento in quattro tempi: mano, mano, piede, piede, senza fermarti in alto", auSlowF);
    mv("capoeira.auLentoL", "Aú lento verso sinistra in quattro tempi", otherSide(auSlowF));
    const AU = auParts(false);
    mv("capoeira.auStart", "In piedi accanto alla linea, rivolto avanti, braccia in alto", [K(G0, 300, 100), K(at(G1, -0.28), 300, 60), K(AU.a1, 320, 900), K(at(G1, -0.28), 300, 60), K(G0, 300, 200)]);

    // aú che atterra in negativa (gamba destra distesa davanti, mano sinistra a terra)
    const NRland = NR.copy().move(0, 1.0);
    const auNegF = [K(G0, 300, 100), K(at(G1, -0.28), 300, 60), K(AU.a1, 300, 200), K(AU.a2, 280, 20), K(AU.a3, 260, 60), K(AU.a4, 260, 20), K(NRland.copy().act("legl", "legr", "arml"), 300, 700),
      K(at(C, 0.9), 320, 80), K(at(G1, 0.5), 320, 50), K(G0, 320, 200)];
    mv("capoeira.auNegativa", "Aú verso destra che atterra in negativa: primo piede piegato, seconda gamba distesa", auNegF);
    mv("capoeira.auNegativaL", "Aú verso sinistra che atterra in negativa", otherSide(auNegF));

    /* ---------------------------------------------------------------- pé do berimbau e aú d'entrata */
    const PB = C.copy().handW("l", 0.32, 0.4, -0.12, "open").handW("r", 0.32, 0.4, 0.12, "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
    const PBb = PB.copy().set("chest", [0.23, 0.62, 0]).set("head", [0.3, 0.8, 0]).act("torso");
    mv("capoeira.peBerimbau", "Pé do berimbau: accosciato e calmo, respiro lento, sguardo verso il centro", [K(at(PB, -0.55), 400, 400), K(at(PBb, -0.55), 1400, 300), K(at(PB, -0.55), 1600, 300)]);
    const entA2 = wheel(65, [0, 0.42, -0.45]).foot("r", 0, -0.42, 0, 15).footAt("l", [0.05, 0.6, -0.95], 0, -40).knee("r", [0.3, 0.3, 1]).knee("l", [0, 1, 0]);
    entA2.handW("r", 0.03, 0.035, 0.05, "open").handW("l", 0.04, 0.45, 0.25, "open").elbow("r", [0, 0.3, 1]).elbow("l", [0, 1, 0.3]).act("armr", "legl", "legr");
    mv("capoeira.auEntrada", "Aú d'entrata: dalla cocorinha al piede del berimbau, aú verso il centro", [K(at(PB, -0.55), 300, 200), K(entA2, 320, 30), K(AU.a3, 280, 60), K(AU.a4, 260, 20), K(AU.a5, 260, 150)].concat(backFromRight));

    /* ---------------------------------------------------------------- rolê */
    // rolê verso sinistra dalla negativa (gamba sinistra distesa): mani a terra a sinistra, viso a terra un istante, di nuovo frontale
    const R1 = (() => {
      const b = standing();
      b.set("pel", [-0.08, 0.38, -0.12]).set("hipYaw", 75).set("chestYaw", 90).set("chest", [-0.06, 0.56, -0.56]).set("head", [-0.04, 0.56, -0.76]).set("headYaw", -60);
      b.foot("r", -0.02, 0.14, 30, 40).foot("l", 0.12, -0.12, 60, 30).knee("r", [0.3, 0.3, -1]).knee("l", [0.3, 0.3, -1]);
      b.handW("r", 0.18, 0.035, -0.62, "open").handW("l", -0.28, 0.035, -0.6, "open").elbow("r", [0.3, 0.3, 1]).elbow("l", [-0.3, 0.3, 1]);
      return b.act("arml", "armr", "torso");
    })();
    const R2 = (() => {
      const b = standing();
      b.set("pel", [0.08, 0.58, -0.42]).set("hipYaw", 180).set("chestYaw", 185).set("chest", [-0.36, 0.5, -0.42]).set("head", [-0.55, 0.43, -0.42]).set("headYaw", 0);
      b.foot("r", 0.46, -0.62, 160, 50).foot("l", 0.5, -0.27, 200, 50).knee("r", [-1, -0.5, 0]).knee("l", [-1, -0.5, 0]);
      b.handW("r", -0.42, 0.035, -0.64, "open").handW("l", -0.42, 0.035, -0.2, "open").elbow("r", [1, 0.3, -0.5]).elbow("l", [1, 0.3, 0.5]);
      return b.act("legl", "legr", "torso");
    })();
    const NLs = (dz) => NL.copy().move(0, dz);
    function roleFrames(d) {
      return [K(NL, 300, 100), K(R1, 300, 50), K(R2, 300, 50), K(spun(at(C, -d), 360).act("legl", "legr"), 330, 150), K(spun(at(G1, -d / 2), 360), 300, 50), K(spun(G0, 360), 300, 120), K(G0, 0, 60)];
    }
    const roleF = roleFrames(0.7);
    mv("capoeira.role", "Rolê verso sinistra: dalla negativa mani a terra, giro basso e di nuovo frontale, poi ginga", roleF);
    mv("capoeira.roleR", "Rolê verso destra dalla negativa con la gamba destra distesa, poi ginga", mirrorFrames(roleF).concat([K(G1, 300, 60), K(G0, 300, 200)]));
    mv("capoeira.roleHands", "Dalla negativa ruota il busto e appoggia entrambe le mani a terra a sinistra", [K(NL, 300, 100), K(R1, 380, 1000), K(NL, 380, 200)]);
    const R1m = (dz, turns) => spun(R1.copy().mirror().move(0, dz), 360 * turns);
    const R2m = (dz, turns) => spun(R2.copy().mirror().move(0, dz), 360 * turns);
    mv("capoeira.roleChain", "Negativa, rolê, negativa dall'altro lato, rolê di ritorno, sempre bassi", [
      K(NL, 300, 100), K(R1, 300, 50), K(R2, 300, 50), K(spun(NR.copy().move(0, -0.7), 360).act("legl", "legr"), 330, 300), K(R1m(-0.7, 1), 300, 50), K(R2m(-0.7, 1), 300, 50), K(NL.copy().act("legl", "legr"), 330, 300)
    ]);
    mv("capoeira.roleDouble", "Rolê doppio: due rolê di fila verso sinistra, sempre bassi", [
      K(NLs(0.3), 300, 100), K(at(R1, 0.3), 290, 40), K(at(R2, 0.3), 290, 40), K(spun(at(C, -0.3), 360), 300, 60), K(spun(NLs(-0.3), 360), 280, 60), K(spun(at(R1, -0.3), 360), 290, 40), K(spun(at(R2, -0.3), 360), 290, 40),
      K(spun(at(C, -0.9), 720), 300, 100), K(spun(at(G1, -0.45), 720), 300, 50), K(spun(G0, 720), 300, 120), K(G0, 0, 60)
    ]);

    /* ---------------------------------------------------------------- queda de rins */
    const wheelify = (b) => b.copy().set("hipYaw", b.p.hipYaw + 90).set("chestYaw", b.p.chestYaw + 90).set("hipRoll", -90).set("chestRoll", -90);
    const QH = wheelify(C).set("chest", [0.18, 0.52, 0.18]).set("head", [0.25, 0.69, 0.22]).handW("r", 0.12, 0.035, 0.3, "open").handW("l", 0.27, 0.035, 0.07, "open").elbow("r", [-0.3, 0, 1]).elbow("l", [-0.3, 0, 1]);
    function queda(full, legsOut) {
      const b = wheel(105, [0, full ? 0.47 : 0.43, -0.05]);
      b.handW("r", 0.08, 0.035, 0.18, "open").elbow("r", [0, 1, -0.75]).handW("l", 0.13, 0.035, 0.5, "open").elbow("l", [-0.2, 0.3, 1]);
      if (!full) b.foot("r", 0.04, 0.12, -10, 20).foot("l", 0.04, -0.16, 10, 20).knee("r", [1, 0.3, 0]).knee("l", [1, 0.3, 0]);
      else if (!legsOut) { const hr = b.hip("r"); const hl = b.hip("l"); b.footW("r", add(hr, [0.16, 0.06, -0.3]), 0, 30).footW("l", add(hl, [0.18, 0.08, -0.28]), 0, 30).knee("r", [1, 0, 0.6]).knee("l", [1, 0.2, 0.6]); }
      else { legTo(b, "r", [0.25, 0.15, -0.95], 0.97, 0, -10); legTo(b, "l", [0.3, 0.3, -0.9], 0.97, 0, -10); b.knee("r", [0, 1, 0]).knee("l", [0, 1, 0]); }
      return b;
    }
    const QP = queda(false);
    const QP1 = QP.copy().footW("l", add(QP.hip("l"), [0.15, -0.05, -0.3]), 0, 30).knee("l", [1, 0.3, 0.4]).act("legl", "armr");
    const QF = queda(true).act("legl", "legr", "armr", "torso");
    const QX = queda(true, true).act("legl", "legr");
    mv("capoeira.quedaRinsPrep", "Queda de rins preparatoria: mani a terra a destra, gomito nel fianco, poi un piede su", [
      K(C, 300, 100), K(QH.copy().act("arml", "armr"), 350, 200), K(QP.copy().act("armr", "torso"), 400, 300), K(QP1, 350, 1000), K(QP, 300, 100), K(QH, 300, 60), K(C, 330, 200)
    ]);
    mv("capoeira.quedaRinsPrepL", "Queda de rins preparatoria sul gomito sinistro", mirrorFrames([K(C, 300, 100), K(QH, 350, 200), K(QP.copy().act("armr", "torso"), 400, 300), K(QP1, 350, 1000), K(QP, 300, 100), K(QH, 300, 60), K(C, 330, 200)]));
    const quedaF = [K(C, 300, 100), K(QH, 350, 150), K(QP.copy().act("armr", "torso"), 400, 200), K(QF, 400, 1400), K(QP, 350, 100), K(C, 350, 200)];
    mv("capoeira.quedaRins", "Queda de rins: in equilibrio su mani e gomito nel fianco, piedi staccati, testa su", quedaF);
    mv("capoeira.quedaRinsL", "Queda de rins sul gomito sinistro", mirrorFrames(quedaF));
    mv("capoeira.quedaRinsLegs", "Queda de rins: ginocchia raccolte, poi gambe che si allungano insieme", [K(C, 300, 100), K(QH, 350, 150), K(QP, 400, 200), K(QF, 400, 700), K(QX, 450, 900), K(QF, 400, 200), K(QP, 350, 100), K(C, 350, 200)]);

    /* ---------------------------------------------------------------- muro: scalata e bananeira */
    // corpo dritto con le mani a terra e i piedi al muro; psi = inclinazione sotto l'orizzontale. Costruito con il muro
    // dietro (-x) e poi girato di 180 gradi: il petto guarda il muro e la telecamera.
    function wallPose(psi, bentKnees) {
      const b = standing();
      const c = Math.cos(psi * DEG);
      const s = Math.sin(psi * DEG);
      const beta = (psi <= 45 ? psi : 90 - psi) * DEG;
      const xw = -1.13;
      const chest = [xw + 0.06 + 1.3 * c, 0.035 + 0.56 * Math.cos(beta), 0];
      const d = [c, -s, 0];
      const pel = add(chest, mul(d, -0.48));
      b.set("pel", pel).set("chest", chest).set("head", add(chest, mul(d, 0.2))).set("hipYaw", 0).set("chestYaw", 0);
      const hand = add(chest, [0.56 * Math.sin(beta), -0.56 * Math.cos(beta), 0]);
      b.handW("l", hand[0], 0.035, -0.17, "open").handW("r", hand[0], 0.035, 0.17, "open").elbow("l", [c, s, -0.3]).elbow("r", [c, s, 0.3]);
      const kp = [-s, -c, 0];
      if (bentKnees) {
        const f = add(pel, mul(d, -0.55));
        b.footAt("l", [xw + 0.07, f[1] - 0.15, -0.1], 180, -40).footAt("r", [xw + 0.07, f[1] - 0.15, 0.1], 180, -40).knee("l", kp).knee("r", kp);
      } else {
        const f = add(pel, mul(d, -0.84));
        b.footAt("l", [xw + 0.07, f[1], -0.1], 180, psi > 30 ? -10 : 40).footAt("r", [xw + 0.07, f[1], 0.1], 180, psi > 30 ? -10 : 40).knee("l", kp).knee("r", kp);
      }
      return b.spin(180);
    }
    const PW = plank().footAt("l", [-1.08, ankleY(62), -0.1], 0, 62).footAt("r", [-1.08, ankleY(62), 0.1], 0, 62).spin(180);
    const W20 = wallPose(20);
    const W45 = wallPose(45).act("arml", "armr", "torso");
    const W80 = wallPose(80).act("arml", "armr", "torso");
    mv("capoeira.wallPlank", "Plank sulle mani con i piedi contro il muro", [K(PW.copy().act("torso"), 400, 1300)]);
    mv("capoeira.wallWalk", "Scalata al muro: piedi su per il muro, mani verso il muro fino a 45 gradi, poi giù", [K(PW, 300, 200), K(W20.copy().act("legl", "legr"), 600, 150), K(W45, 600, 1000), K(W20, 550, 150), K(PW, 550, 200)]);
    mv("capoeira.wallHold45", "Tenuta a 45 gradi: braccia distese, spalle spinte verso le orecchie", [K(PW, 300, 150), K(W20, 500, 100), K(W45, 500, 1800), K(W20, 450, 100), K(PW, 450, 200)]);
    mv("capoeira.wallDown", "Discesa camminando: mani e piedi nell'ordine inverso", [K(W45, 300, 300), K(W20.copy().act("arml", "armr", "legl", "legr"), 600, 150), K(PW, 600, 400)]);
    mv("capoeira.bananeira", "Bananeira al muro: petto verso il muro, braccia distese, corpo allineato", [K(PW, 300, 150), K(W20, 500, 80), K(W45, 500, 80), K(W80, 600, 1800), K(W45, 500, 80), K(W20, 450, 80), K(PW, 450, 200)]);
    mv("capoeira.bananeiraExit", "Se perdi le forze piega le gambe e scendi camminando, mai di lato", [K(W80, 300, 300), K(wallPose(70, true).act("legl", "legr"), 500, 300), K(W45, 500, 100), K(W20, 450, 100), K(PW, 450, 300)]);

    /* ---------------------------------------------------------------- spinte e quadrupedia sulle mani */
    const pike = (down, high) => {
      const b = standing();
      const fy = high ? 0.5 : ankleY(55);
      b.footAt("l", [high ? -0.62 : -0.45, fy, -0.1], 0, high ? 0 : 55).footAt("r", [high ? -0.62 : -0.45, fy, 0.1], 0, high ? 0 : 55);
      if (!down) b.set("pel", high ? [0, 1.02, 0] : [-0.1, 0.92, 0]).set("chest", [high ? 0.27 : 0.24, high ? 0.6 : 0.56, 0]).set("head", [high ? 0.33 : 0.31, high ? 0.41 : 0.37, 0]);
      else b.set("pel", high ? [0.04, 0.95, 0] : [-0.02, 0.85, 0]).set("chest", [high ? 0.28 : 0.26, high ? 0.51 : 0.45, 0]).set("head", [high ? 0.33 : 0.32, high ? 0.32 : 0.26, 0]);
      b.set("hipYaw", 0).set("chestYaw", 0).knee("l", [0, -1, 0]).knee("r", [0, -1, 0]);
      b.handW("l", 0.35, 0.035, -0.17, "open").handW("r", 0.35, 0.035, 0.17, "open").elbow("l", [-0.3, 0.6, -1]).elbow("r", [-0.3, 0.6, 1]);
      return b;
    };
    mv("capoeira.pikePushup", "Pike push-up: anche alte, la testa scende tra le mani e risale", [K(pike(false), 400, 200), K(pike(true).act("arml", "armr"), 600, 200), K(pike(false), 500, 300)]);
    mv("capoeira.pikePushupHigh", "Pike push-up con i piedi su un rialzo: più peso sulle braccia", [K(pike(false, true), 400, 200), K(pike(true, true).act("arml", "armr"), 600, 200), K(pike(false, true), 500, 300)]);
    // passi laterali a quattro appoggi con le anche alte: mano, mano, piede, piede
    const q4 = (hr, hl, fr, fl) => {
      const b = pike(false);
      const cz = (hr + hl + fr + fl) / 4;
      b.set("pel", [-0.08, 0.86, cz]).set("chest", [0.24, 0.5, cz]).set("head", [0.32, 0.32, cz]);
      b.handW("l", 0.33, 0.035, -0.17 + hl, "open").handW("r", 0.33, 0.035, 0.17 + hr, "open");
      b.footAt("l", [-0.4, ankleY(55), -0.12 + fl], 0, 55).footAt("r", [-0.4, ankleY(55), 0.12 + fr], 0, 55);
      return b;
    };
    mv("capoeira.quadSteps", "A quattro appoggi con le anche alte: mano, mano, piede, piede si spostano di lato", [
      K(q4(0, 0, 0, 0), 300, 100), K(q4(0.22, 0, 0, 0).act("armr"), 260, 40), K(q4(0.22, 0.22, 0, 0).act("arml"), 260, 40), K(q4(0.22, 0.22, 0.22, 0).act("legr"), 260, 40), K(q4(0.22, 0.22, 0.22, 0.22).act("legl"), 260, 120),
      K(q4(0.22, 0, 0.22, 0.22).act("arml"), 260, 40), K(q4(0, 0, 0.22, 0.22).act("armr"), 260, 40), K(q4(0, 0, 0.22, 0).act("legl"), 260, 40), K(q4(0, 0, 0, 0).act("legr"), 260, 200)
    ]);
  });
})(typeof window !== "undefined" ? window : globalThis);
