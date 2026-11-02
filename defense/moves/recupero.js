/*
 * Progetto A - Difesa: movimenti dell'omino per il Recupero del ginocchio (prefisso "rec.").
 * La gamba operata nelle dimostrazioni e' la destra ("r", evidenziata quando lavora).
 * Oggetti in scena (defense/figure3d.js, tipo "box"): letto, sedia, muro, gradino, tavolo, rotolo.
 * Coordinate come in defense/moves.js: x avanti, y su, z a destra della figura.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add("rec", function (L) {
    const { mv, K, standing, lieBack, lieFront, sitLong, plank, lunge, ankleY } = L;
    const st = () => standing();
    const box = (x0, x1, y0, y1, z0, z1, extra = {}) => Object.assign({ k: "box", x0, x1, y0, y1, z0, z1 }, extra);

    /* ---------------- oggetti */
    const BED = [box(-0.36, 1.45, 0, 0.5, -0.45, 0.45)];
    const BLOCK = [box(0.76, 0.98, 0, 0.12, 0.0, 0.24)];
    const ROLL = [box(0.34, 0.5, 0, 0.13, 0.01, 0.22)];
    const chair = (h) => [box(-0.44, 0.02, 0, h, -0.24, 0.24), box(-0.46, -0.4, h, h + 0.45, -0.24, 0.24)];
    const CHAIR_HIGH = chair(0.56);
    const CHAIR = chair(0.45);
    const WALL_BACK = [box(-0.5, -0.43, 0, 1.9, -0.55, 0.55)];
    const WALL_SIDE = [box(-0.45, 0.55, 0, 1.9, 0.5, 0.56)];
    const STEP = [box(0.2, 0.56, 0, 0.18, -0.32, 0.32)];
    const STEP_SIDE = [box(-0.22, 0.24, 0, 0.2, 0.0, 0.36)];
    const STEP_BACK = [box(-0.42, -0.06, 0, 0.16, -0.32, 0.32)];
    const TABLE_SIDE = [box(0.42, 1.05, 0, 0.75, -0.55, 0.06)];
    const TABLE_TOP = [box(-1.4, -0.38, 0.72, 0.77, -0.55, 0.55, { glass: true }), box(-0.44, -0.4, 0, 0.72, -0.55, -0.51), box(-0.44, -0.4, 0, 0.72, 0.51, 0.55)];

    /* ---------------- pose di base */
    // a pancia in giu' sul letto, le ginocchia a "dx" dal bordo
    const proneBed = (dx = 0) => {
      const b = lieFront();
      b.set("pel", [dx, 0.63, 0]).set("chest", [dx + 0.5, 0.65, 0]).set("head", [dx + 0.71, 0.69, 0]);
      b.handW("l", dx + 0.6, 0.53, -0.3, "open").handW("r", dx + 0.6, 0.53, 0.3, "open");
      b.footAt("l", [dx - 0.86, 0.57, -0.11], 180, 0, 180).footAt("r", [dx - 0.86, 0.57, 0.11], 180, 0, 180);
      return b;
    };
    // seduto a gambe distese, il tallone destro su un rialzo; "on" = ginocchio dritto
    const heelProp = (on) => {
      const b = sitLong();
      b.set("chest", [-0.04, 0.62, 0]).set("head", [-0.02, 0.82, 0]);
      b.handW("l", -0.12, 0.05, -0.26, "open").handW("r", -0.12, 0.05, 0.26, "open");
      b.footAt("r", on ? [0.874, 0.215, 0.11] : [0.85, 0.2, 0.11], 0, -88).knee("r", [0, 1, 0]);
      return b;
    };
    // sdraiato: gamba sinistra piegata con il piede a terra
    const lieOneBent = () => lieBack().footAt("l", [0.42, 0.08, -0.13], 0, 0).knee("l", [0, 1, 0]);
    // rotolo sotto il ginocchio destro: "up" = gamba distesa
    const shortArc = (up) => lieOneBent().footAt("r", up ? [0.85, 0.33, 0.12] : [0.8, 0.08, 0.12], 0, up ? -70 : -60).knee("r", [0, 1, 0]);
    // seduto sulla sedia (altezza h): piedi a terra, mani avanti
    const seated = (h, lean = 0) => {
      const b = st();
      const y = h + 0.08;
      b.set("pel", [-0.16, y, 0]).set("chest", [-0.12 + lean, y + 0.49 - Math.abs(lean) * 0.2, 0]).set("head", [-0.1 + lean * 1.3, y + 0.69 - Math.abs(lean) * 0.25, 0]);
      b.foot("l", 0.26, -0.12, 4, 0).foot("r", 0.26, 0.12, -4, 0).knee("l", [1, 0.3, 0]).knee("r", [1, 0.3, 0]);
      b.handRel("l", 0.34, -0.2, -0.16, "open").handRel("r", 0.34, -0.2, 0.16, "open");
      return b;
    };
    const standAt = (x) => {
      const b = st();
      b.set("pel", [x - 0.03, 0.95, 0]).set("chest", [x - 0.01, 1.45, 0]).set("head", [x, 1.65, 0]);
      b.foot("l", x, -0.12, 4, 0).foot("r", x, 0.12, -4, 0);
      b.handW("l", x + 0.02, 0.9, -0.24, "open").handW("r", x + 0.02, 0.9, 0.24, "open");
      return b;
    };
    // spalle al muro, piedi avanti; depth 0 = in piedi, 1 = quarto di squat, 2 = mezzo squat
    const wall = (depth) => {
      const b = st();
      const y = [0.86, 0.74, 0.62][depth];
      b.set("pel", [-0.3, y, 0]).set("chest", [-0.33, y + 0.5, 0]).set("head", [-0.32, y + 0.7, 0]);
      b.foot("l", 0.05, -0.13, 6, 0).foot("r", 0.05, 0.13, -6, 0).knee("l", [1, 0, -0.15]).knee("r", [1, 0, 0.15]);
      b.handW("l", -0.36, y + 0.05, -0.27, "open").handW("r", -0.36, y + 0.05, 0.27, "open");
      return b;
    };
    // in piedi con la mano sinistra al muro davanti
    const wallHand = () => standAt(0).handW("r", 0.05, 1.22, 0.46, "open").elbow("r", [0, -1, 0.3]);
    // sdraiato sul fianco sinistro (gamba destra sopra), testa verso -x, viso verso la telecamera
    const sideLie = (lift = 0) => {
      const b = st();
      b.set("pel", [0, 0.2, 0]).set("chest", [-0.5, 0.22, 0]).set("head", [-0.7, 0.27, 0]).set("hipYaw", 0).set("chestYaw", 0).set("chestRoll", 90).set("hipRoll", 90);
      b.footAt("l", [0.68, 0.08, -0.18], 0, 0, 90).knee("l", [0, 0, -1]);
      b.footAt("r", [lift ? 0.8 : 0.86, 0.3 + lift, 0.05], 0, 0, 90).knee("r", [0, 0, -1]);
      b.handW("l", -0.92, 0.1, -0.05, "open").handW("r", -0.3, 0.05, -0.3, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 1, 0]);
      return b;
    };
    // in piedi sulla destra, sinistra sollevata
    const oneLeg = (x = 0) => standAt(x).footAt("l", [x + 0.1, 0.32, -0.12], 4, 20).knee("l", [1, 0.2, 0]).handPel("l", 0.02, 0.04, -0.18, "open").handPel("r", 0.02, 0.04, 0.18, "open");
    // davanti al gradino; "on" = piede destro sul gradino; "up" = in piedi sul gradino
    const stepPose = (phase) => {
      const b = standAt(-0.12);
      if (phase === 0) return b;
      const H = 0.18;
      if (phase === 1) {
        b.footAt("r", [0.36, H + ankleY(0), 0.12], -4, 0).knee("r", [1, 0.2, 0]);
        b.set("pel", [-0.02, 0.92, 0.02]).set("chest", [0.06, 1.41, 0.02]).set("head", [0.09, 1.6, 0.02]);
        return b;
      }
      b.set("pel", [0.34, 0.95 + H, 0]).set("chest", [0.36, 1.45 + H, 0]).set("head", [0.37, 1.65 + H, 0]);
      b.footAt("r", [0.36, H + ankleY(0), 0.12], -4, 0).footAt("l", [0.36, H + ankleY(0), -0.12], 4, 0);
      b.handW("l", 0.38, 0.9 + H, -0.24, "open").handW("r", 0.38, 0.9 + H, 0.24, "open");
      return b;
    };
    // affondo statico con la destra davanti: depth 0..1
    const split = (depth) => {
      const b = lunge("r", depth);
      b.handPel("l", 0.02, 0.04, -0.18, "open").handPel("r", 0.02, 0.04, 0.18, "open");
      return b;
    };
    // in piedi con i manubri (mani lungo le cosce)
    const dbStand = () => standAt(0).handW("l", 0.08, 0.9, -0.16, "db").handW("r", 0.08, 0.9, 0.16, "db").elbow("l", [-1, 0, 0]).elbow("r", [-1, 0, 0]);
    // stacco rumeno: depth 0..1
    const rdl = (depth) => {
      const b = dbStand();
      b.foot("l", 0, -0.12, 4, 0).foot("r", 0, 0.12, -4, 0).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]);
      const px = -0.03 - 0.2 * depth;
      const py = 0.94 - 0.05 * depth;
      const ang = depth * 62 * Math.PI / 180;
      b.set("pel", [px, py, 0]).set("chest", [px + 0.5 * Math.sin(ang), py + 0.5 * Math.cos(ang), 0]).set("head", [px + 0.7 * Math.sin(ang) + 0.03, py + 0.7 * Math.cos(ang) + 0.04 * depth, 0]);
      const cx = px + 0.5 * Math.sin(ang);
      const cy = py + 0.5 * Math.cos(ang);
      b.handW("l", cx + 0.06, cy - 0.55, -0.16, "db").handW("r", cx + 0.06, cy - 0.55, 0.16, "db");
      return b;
    };
    // estensione da seduto: ext 0 (piede a terra) .. 1 (gamba tesa)
    const seatExt = (ext) => {
      const b = seated(0.45);
      b.handW("l", -0.1, 0.5, -0.27, "open").handW("r", -0.1, 0.5, 0.27, "open");
      const th = ext * 88 * Math.PI / 180;
      const knee = [-0.16 + 0.43, 0.56];
      b.footAt("r", [knee[0] + 0.44 * Math.sin(th), knee[1] - 0.44 * Math.cos(th), 0.11], 0, ext > 0.6 ? -55 : 0).knee("r", [0.3, 1, 0]);
      return b;
    };
    // ponte con i talloni sull'asciugamano: out 0 (piedi vicini) .. 1 (gambe quasi tese)
    const slide = (up, out) => {
      const b = lieBack({ kneesUp: true });
      const fx = 0.42 + 0.36 * out;
      b.footAt("l", [fx, 0.08, -0.13], 0, out > 0.5 ? -40 : 0).footAt("r", [fx, 0.08, 0.13], 0, out > 0.5 ? -40 : 0);
      if (up) b.set("pel", [0.05, 0.38 - 0.12 * out, 0]).set("chest", [-0.42, 0.2, 0]).set("head", [-0.62, 0.14, 0]);
      return b;
    };
    // sul gradino con la destra, sinistra nel vuoto; low = scendi
    const stepDown = (low) => {
      const b = st();
      const H = 0.2;
      const y = low ? 0.91 : 0.95 + H;
      b.set("pel", [low ? -0.06 : 0, y, 0.03]).set("chest", [low ? 0.06 : 0.02, y + 0.5, 0.02]).set("head", [low ? 0.1 : 0.03, y + 0.7, 0.02]);
      b.footAt("r", [0, H + ankleY(0), 0.12], -4, 0).knee("r", [1, 0, -0.1]);
      b.footAt("l", [0.02, low ? ankleY(0) + 0.005 : H + 0.08, -0.13], 4, low ? 0 : 10).knee("l", [1, 0, 0]);
      b.handPel("l", 0.02, 0.04, -0.18, "open").handPel("r", 0.02, 0.04, 0.18, "open");
      return b;
    };
    // stella: in equilibrio sulla destra piegata, il piede sinistro tocca in una direzione
    const star = (dir) => {
      const b = st();
      b.set("pel", [-0.06, 0.8, 0.05]).set("chest", [0.03, 1.29, 0.04]).set("head", [0.07, 1.49, 0.04]);
      b.foot("r", 0, 0.12, -4, 0).knee("r", [1, 0, -0.1]);
      const T = { fwd: [0.45, -0.06], out: [-0.42, -0.38], in: [-0.44, 0.3] }[dir] || [0.1, -0.12];
      b.footAt("l", [T[0], dir ? ankleY(0) + 0.01 : 0.3, T[1]], dir === "fwd" ? 0 : 20, dir ? 0 : 20).knee("l", [dir === "fwd" ? 0.5 : 1, 0.6, 0]);
      b.handPel("l", 0.02, 0.04, -0.18, "open").handPel("r", 0.02, 0.04, 0.18, "open");
      return b;
    };

    /* ---------------- ESTENSIONE */
    mv("rec.proneLie", "A pancia in giù sul letto, ginocchia ancora sul materasso", [K(proneBed(0.42), 400, 1200)], { props: BED });
    mv("rec.proneScoot", "Scivola indietro: il bordo del letto sopra la rotula", [K(proneBed(0.42), 300, 200), K(proneBed(0).act("legl", "legr"), 900, 900)], { props: BED });
    const hang = proneBed(0).footAt("l", [-0.87, 0.5, -0.11], 180, 0, 180).footAt("r", [-0.87, 0.49, 0.11], 180, 0, 180).knee("l", [0, -1, 0]).knee("r", [0, -1, 0]);
    mv("rec.proneHang", "Gambe che pendono rilassate: il peso stende il ginocchio", [K(proneBed(0), 300, 200), K(hang.act("legr"), 1400, 2600)], { props: BED });
    const proneExit = hang.copy().footAt("l", [-0.42, 0.98, -0.11], 180, -70, 180).knee("l", [0, -1, 0]);
    mv("rec.proneExit", "Per uscire piega prima la gamba sana", [K(hang, 300, 300), K(proneExit.act("legl"), 700, 900)], { props: BED });
    mv("rec.heelProp", "Seduto, tallone sul rialzo, niente sotto il ginocchio", [K(heelProp(false), 400, 1400)], { props: BLOCK });
    mv("rec.heelRelax", "Ginocchio rilassato che scende piano", [K(heelProp(false), 300, 300), K(heelProp(false).set("chest", [-0.05, 0.62, 0]).act("legr"), 1200, 1400)], { props: BLOCK });
    mv("rec.quadSet", "Contrai la coscia: il retro del ginocchio scende, la rotula sale", [K(heelProp(false), 300, 300), K(heelProp(true).act("legr"), 500, 1600), K(heelProp(false), 600, 400)], { props: BLOCK });
    mv("rec.shortArcSet", "Rotolo sotto il ginocchio, l'altra gamba piegata", [K(shortArc(false), 400, 1200)], { props: ROLL });
    mv("rec.shortArc", "Stendi il ginocchio fino a dritto, tieni 3 secondi, giù lento", [K(shortArc(false), 300, 200), K(shortArc(true).act("legr"), 500, 1500), K(shortArc(false), 900, 300)], { props: ROLL });

    /* ---------------- GAMBE */
    const slrUp = lieOneBent().footAt("r", [0.74, 0.58, 0.12], 0, -70).knee("r", [0, 1, 0]);
    mv("rec.slrSet", "Sdraiato, gamba sana piegata, l'operata distesa e contratta", [K(lieOneBent(), 400, 900), K(lieOneBent().act("legr"), 300, 600)]);
    mv("rec.slr", "Gamba tesa su fino al ginocchio piegato, tieni, giù lenta", [K(lieOneBent(), 300, 200), K(slrUp.act("legr"), 900, 900), K(lieOneBent(), 900, 300)]);
    const sitHigh = seated(0.56);
    const standChair = standAt(0.22).foot("l", 0.26, -0.12, 4, 0).foot("r", 0.26, 0.12, -4, 0).handRel("l", 0.3, -0.25, -0.16, "open").handRel("r", 0.3, -0.25, 0.16, "open");
    mv("rec.chairSit", "Seduto sulla sedia alta, piedi un po' indietro", [K(sitHigh, 400, 1200)], { props: CHAIR_HIGH });
    mv("rec.chairLean", "Busto avanti con la schiena dritta, peso sui due piedi", [K(sitHigh, 300, 200), K(seated(0.56, 0.24).act("torso"), 600, 900)], { props: CHAIR_HIGH });
    mv("rec.chairStand", "Spingi il pavimento e alzati fino a stendere tutto", [K(seated(0.56, 0.24), 300, 150), K(standChair.act("legl", "legr"), 800, 700)], { props: CHAIR_HIGH });
    mv("rec.chairDown", "Torna a sederti in 3 secondi, senza lasciarti cadere", [K(standChair, 300, 200), K(seated(0.56, 0.24).act("legl", "legr"), 2400, 300), K(sitHigh, 400, 500)], { props: CHAIR_HIGH });
    mv("rec.wallStand", "Schiena al muro, piedi a 40-50 cm dal muro", [K(wall(0), 400, 1200)], { props: WALL_BACK });
    mv("rec.wallSlide", "Scivola giù fino a un quarto di squat", [K(wall(0), 300, 200), K(wall(1).act("legl", "legr"), 1200, 900)], { props: WALL_BACK });
    mv("rec.wallHold", "Tieni: ginocchia sopra le caviglie, peso uguale", [K(wall(1).act("legl", "legr"), 400, 2400)], { props: WALL_BACK });
    mv("rec.wallUp", "Risali scivolando lungo il muro", [K(wall(1), 300, 200), K(wall(0), 1000, 700)], { props: WALL_BACK });
    const lb = lieBack({ kneesUp: true });
    const br = lieBack({ kneesUp: true }).set("pel", [0.05, 0.38, 0]).set("chest", [-0.42, 0.2, 0]).set("head", [-0.62, 0.14, 0]);
    mv("rec.bridgeSet", "Sdraiato, piedi a terra alla larghezza delle anche", [K(lb, 400, 1200)]);
    mv("rec.bridgeHold", "Tieni 2 secondi in alto stringendo i glutei", [K(br.act("torso", "legl", "legr"), 400, 1800)]);
    mv("rec.bridgeDown", "Scendi in 2 secondi", [K(br, 300, 200), K(lb, 1500, 500)]);
    mv("rec.calfSet", "In piedi, una mano al muro per l'equilibrio", [K(wallHand(), 400, 1200)], { props: WALL_SIDE });
    const calfTop = wallHand().heel("l", 40).heel("r", 40).sink(-0.07).handW("r", 0.05, 1.29, 0.46, "open");
    mv("rec.calfUp", "Sali sulle punte più in alto che puoi", [K(wallHand(), 300, 200), K(calfTop.act("legl", "legr"), 600, 600)], { props: WALL_SIDE });
    mv("rec.calfHold", "Tieni 1 secondo in cima", [K(calfTop.act("legl", "legr"), 300, 1200)], { props: WALL_SIDE });
    mv("rec.calfDown", "Scendi in 3 secondi fino al tallone a terra", [K(calfTop, 300, 200), K(wallHand(), 2200, 500)], { props: WALL_SIDE });
    mv("rec.sideLie", "Sul fianco, gamba di sotto piegata, quella di sopra dritta", [K(sideLie(0), 400, 1200)]);
    mv("rec.sideAbd", "Solleva la gamba di sopra, tieni 2 secondi, giù lenta", [K(sideLie(0), 300, 200), K(sideLie(0.28).act("legr"), 900, 1000), K(sideLie(0), 1000, 300)]);
    mv("rec.standWall", "In piedi vicino al muro, per sicurezza", [K(standAt(0), 400, 1200)], { props: WALL_SIDE });
    mv("rec.oneLeg", "Solleva la gamba sana: stai sull'operata, ginocchio morbido", [K(standAt(0), 300, 200), K(oneLeg().act("legr"), 700, 1400)], { props: WALL_SIDE });
    const sway = oneLeg().set("pel", [-0.02, 0.94, 0.02]).set("chest", [0.0, 1.44, 0.035]).set("head", [0.01, 1.64, 0.04]);
    mv("rec.oneLegHold", "Bacino dritto, piede a tripode, piccole correzioni", [K(oneLeg().act("legr"), 300, 500), K(sway.act("legr"), 600, 300), K(oneLeg(), 600, 300), K(sway, 600, 300)], { props: WALL_SIDE });
    const oneLegL = standAt(0).footAt("r", [0.1, 0.32, 0.12], -4, 20).knee("r", [1, 0.2, 0]).handPel("l", 0.02, 0.04, -0.18, "open").handPel("r", 0.02, 0.04, 0.18, "open");
    mv("rec.oneLegSwitch", "Poi cambia gamba e confronta", [K(oneLeg(), 300, 300), K(standAt(0), 500, 200), K(oneLegL.act("legl"), 600, 1000)], { props: WALL_SIDE });
    mv("rec.stepFront", "Davanti a un gradino stabile", [K(stepPose(0), 400, 1200)], { props: STEP });
    mv("rec.stepFoot", "Piede dell'operata tutto sul gradino", [K(stepPose(0), 300, 200), K(stepPose(1).act("legr"), 700, 900)], { props: STEP });
    mv("rec.stepUp", "Sali spingendo con l'operata, l'altro piede arriva senza spingere", [K(stepPose(1), 300, 200), K(stepPose(2).act("legr"), 900, 800)], { props: STEP });
    mv("rec.stepBack", "Scendi lento con la gamba sana", [K(stepPose(2), 300, 200), K(stepPose(1).act("legr"), 1400, 400), K(stepPose(0), 600, 400)], { props: STEP });
    mv("rec.splitSet", "Passo lungo: operata davanti, l'altra dietro sull'avampiede", [K(st(), 300, 200), K(split(0.3).act("legl", "legr"), 700, 900)]);
    mv("rec.splitDown", "Scendi in verticale fin dove non hai dolore", [K(split(0.3), 300, 200), K(split(0.75).act("legl", "legr"), 1200, 700)]);
    mv("rec.splitHold", "Ginocchio davanti sopra il piede, peso davanti", [K(split(0.75).act("legr"), 400, 1600)]);
    mv("rec.splitUp", "Risali spingendo con il tallone davanti", [K(split(0.75), 300, 200), K(split(0.3).act("legr"), 900, 600)]);
    mv("rec.rdlStand", "In piedi con i manubri davanti alle cosce", [K(dbStand(), 400, 1200)]);
    mv("rec.rdlSoft", "Ginocchia sbloccate di pochi gradi, e restano così", [K(dbStand(), 300, 200), K(rdl(0.05).act("legl", "legr"), 500, 900)]);
    mv("rec.rdlHinge", "Sedere indietro: il busto scende, i manubri lungo le gambe", [K(rdl(0.05), 300, 200), K(rdl(1).act("torso"), 1500, 700)]);
    mv("rec.rdlUp", "Risali spingendo il bacino avanti", [K(rdl(1), 300, 200), K(rdl(0.05).act("torso"), 1000, 600)]);
    mv("rec.seatSit", "Seduto in fondo alla sedia, schiena dritta", [K(seatExt(0), 400, 1200)], { props: CHAIR });
    mv("rec.seatExt", "Stendi il ginocchio fino a dritto e tieni 2 secondi", [K(seatExt(0), 300, 200), K(seatExt(1).act("legr"), 900, 1400)], { props: CHAIR });
    mv("rec.seatExtDown", "Scendi in 3 secondi fino a 90 gradi", [K(seatExt(1), 300, 200), K(seatExt(0).act("legr"), 2200, 500)], { props: CHAIR });
    mv("rec.slideSet", "Sdraiato, talloni sull'asciugamano", [K(slide(false, 0), 400, 1200)]);
    mv("rec.slideBridge", "Solleva il bacino come nel ponte", [K(slide(false, 0), 300, 200), K(slide(true, 0).act("torso", "legl", "legr"), 700, 900)]);
    mv("rec.slideOut", "Talloni avanti in 3 secondi, bacino sempre su", [K(slide(true, 0), 300, 200), K(slide(true, 1).act("legl", "legr"), 2400, 500)]);
    mv("rec.slideIn", "Riporta i talloni piegando le ginocchia", [K(slide(true, 1), 300, 200), K(slide(true, 0).act("legl", "legr"), 1200, 600)]);
    mv("rec.sdStand", "Sul bordo del gradino con l'operata, l'altra nel vuoto", [K(stepDown(false), 400, 1200)], { props: STEP_SIDE });
    mv("rec.sdLower", "Piega l'operata in 3 secondi: il tallone libero sfiora terra", [K(stepDown(false), 300, 200), K(stepDown(true).act("legr"), 2200, 500)], { props: STEP_SIDE });
    mv("rec.sdUp", "Risali stendendo del tutto il ginocchio", [K(stepDown(true), 300, 200), K(stepDown(false).act("legr"), 900, 600)], { props: STEP_SIDE });
    mv("rec.starSet", "In piedi sull'operata, mani sui fianchi", [K(star(null).act("legr"), 400, 1200)]);
    mv("rec.starFwd", "Piega e tocca davanti, leggero", [K(star(null), 300, 200), K(star("fwd").act("legr", "legl"), 900, 500), K(star(null), 700, 200)]);
    mv("rec.starBack", "Poi in diagonale dietro, fuori e dentro", [K(star(null), 300, 200), K(star("out").act("legr", "legl"), 900, 400), K(star(null), 600, 200), K(star("in").act("legr", "legl"), 900, 400), K(star(null), 600, 200)]);
    mv("rec.starAll", "Le tre direzioni di fila sono una ripetizione", [K(star(null), 300, 200), K(star("fwd").act("legr", "legl"), 700, 200), K(star(null), 500, 100), K(star("out").act("legr", "legl"), 700, 200), K(star(null), 500, 100), K(star("in").act("legr", "legl"), 700, 200), K(star(null), 500, 300)]);
    const pogoDown = standAt(0).heel("l", 20).heel("r", 20).sink(-0.02);
    const pogoAir = pogoDown.copy().sink(-0.07).set("foot", { l: [0, ankleY(25) + 0.07, -0.12], r: [0, ankleY(25) + 0.07, 0.12] }).set("footPitch", { l: 25, r: 25 });
    mv("rec.pogoSet", "In piedi, braccia rilassate, sugli avampiedi", [K(standAt(0), 300, 300), K(pogoDown, 400, 700)]);
    mv("rec.pogo", "Saltelli bassi e veloci, contatto breve e silenzioso", [K(pogoDown, 200, 50), K(pogoAir.act("legl", "legr"), 160, 30), K(pogoDown, 160, 30), K(pogoAir.act("legl", "legr"), 160, 30), K(pogoDown, 160, 30), K(pogoAir.act("legl", "legr"), 160, 30), K(pogoDown, 160, 200)]);
    const onBox = standAt(-0.24).sink(-0.16).set("foot", { l: [-0.24, 0.16 + ankleY(0), -0.12], r: [-0.24, 0.16 + ankleY(0), 0.12] });
    const landSq = L.squat(0.55).move(0.25).handRel("l", 0.34, -0.1, -0.14, "open").handRel("r", 0.34, -0.1, 0.14, "open");
    mv("rec.landStand", "In piedi su un gradino basso", [K(onBox, 400, 1200)], { props: STEP_BACK });
    mv("rec.landDrop", "Scendi e atterra morbido: anche e ginocchia insieme", [K(onBox, 300, 200), K(landSq.act("legl", "legr"), 500, 600)], { props: STEP_BACK });
    mv("rec.landHold", "Ginocchia sopra le punte, fermo 2 secondi", [K(landSq.act("legl", "legr"), 300, 1800)], { props: STEP_BACK });
    mv("rec.landBack", "Risali sul gradino", [K(landSq, 300, 200), K(standAt(0.25), 600, 300), K(onBox, 900, 400)], { props: STEP_BACK });
    const shufA = standAt(0).sink(0.12).foot("l", 0.02, -0.24, 4, 10).foot("r", 0.02, 0.24, -4, 10).handRel("l", 0.3, -0.25, -0.18, "open").handRel("r", 0.3, -0.25, 0.18, "open");
    const shufB = shufA.copy().shift(0, 0.2).foot("l", 0.02, 0.02, 4, 10).foot("r", 0.02, 0.44, -4, 10);
    mv("rec.shuffle", "Passi laterali scivolati, bacino basso", [K(shufA, 300, 100), K(shufB.act("legl", "legr"), 260, 60), K(shufA.copy().shift(0, 0.2).foot("l", 0.02, -0.04, 4, 10).foot("r", 0.02, 0.44, -4, 10), 260, 60), K(shufA, 400, 200)]);
    const brake = standAt(0.1).sink(0.18).set("chest", [0.05, 1.24, 0]).set("head", [0.12, 1.44, 0]).foot("l", 0.32, -0.13, 4, 0).foot("r", -0.06, 0.13, -4, 15).knee("l", [1, 0, -0.1]).knee("r", [1, 0, 0.1]).handRel("l", 0.25, -0.25, -0.2, "open").handRel("r", 0.25, -0.25, 0.2, "open");
    mv("rec.brake", "Frenata in due tempi: bacino basso, ginocchio sopra il piede", [K(standAt(0), 300, 100), K(brake.act("legl", "legr"), 400, 700), K(standAt(0), 500, 200)]);
    const hopDown = oneLeg().heel("r", 15).sink(0.03);
    const hopAir = hopDown.copy().sink(-0.1).set("foot", Object.assign({}, hopDown.p.foot, { r: [0, ankleY(25) + 0.08, 0.12] })).set("footPitch", { l: 20, r: 25 });
    mv("rec.hopR", "Saltelli bassi sull'operata, atterraggio morbido", [K(hopDown.act("legr"), 300, 100), K(hopAir.act("legr"), 180, 40), K(hopDown.act("legr"), 200, 120), K(hopAir.act("legr"), 180, 40), K(hopDown.act("legr"), 200, 300)]);

    /* ---------------- PARTE ALTA */
    const lieLegs = () => lieBack();
    const press = (up) => {
      const b = lieLegs();
      if (up) b.handW("l", -0.47, 0.69, -0.2, "db").handW("r", -0.47, 0.69, 0.2, "db").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
      else b.handW("l", -0.42, 0.36, -0.3, "db").handW("r", -0.42, 0.36, 0.3, "db").elbow("l", [0.3, -1, -1]).elbow("r", [0.3, -1, 1]);
      return b;
    };
    mv("rec.pressSet", "Sdraiato a gambe distese, manubri sopra il petto", [K(press(true), 400, 1200)]);
    mv("rec.press", "Gomiti a terra a 45 gradi, poi spingi in alto", [K(press(true), 300, 200), K(press(false).act("arml", "armr"), 1200, 300), K(press(true).act("arml", "armr"), 700, 400)]);
    const row = (pull) => {
      const b = st();
      b.foot("l", 0.18, -0.14, 4, 0).foot("r", -0.25, 0.14, -10, 10).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]);
      b.set("pel", [-0.1, 0.88, 0]).set("chest", [0.3, 1.18, 0]).set("head", [0.47, 1.27, 0]);
      b.handW("l", 0.56, 0.79, -0.18, "open").elbow("l", [0, -1, -0.4]);
      if (pull) b.handW("r", 0.14, 0.98, 0.24, "db").elbow("r", [-1, 0.6, 0.2]);
      else b.handW("r", 0.3, 0.66, 0.22, "db").elbow("r", [-0.3, 0, 1]);
      return b;
    };
    mv("rec.rowSet", "Mano sul tavolo, busto inclinato, manubrio sotto la spalla", [K(row(false), 400, 1200)], { props: TABLE_SIDE });
    mv("rec.row", "Tira il gomito verso il fianco, poi scendi in 2 secondi", [K(row(false), 300, 200), K(row(true).act("armr"), 700, 400), K(row(false), 1200, 300)], { props: TABLE_SIDE });
    const inv = (up) => {
      const b = lieBack();
      if (up) b.set("pel", [0.03, 0.35, 0]).set("chest", [-0.44, 0.5, 0]).set("head", [-0.63, 0.56, 0]);
      else b.set("pel", [0.0, 0.17, 0]).set("chest", [-0.49, 0.21, 0]).set("head", [-0.69, 0.22, 0]);
      b.handW("l", -0.5, 0.75, -0.24, "fist").handW("r", -0.5, 0.75, 0.24, "fist");
      b.elbow("l", up ? [0.3, -0.3, -1] : [0, 0, -1]).elbow("r", up ? [0.3, -0.3, 1] : [0, 0, 1]);
      return b;
    };
    const invCheck = standAt(-1.78).set("chest", [-1.62, 1.29, 0]).set("head", [-1.53, 1.47, 0]).handW("l", -1.4, 0.79, -0.22, "fist").handW("r", -1.4, 0.79, 0.22, "fist").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    mv("rec.invCheck", "Prova il tavolo: deve essere pesante e fermo", [K(invCheck, 400, 400), K(invCheck.copy().act("arml", "armr"), 400, 800)], { props: TABLE_TOP });
    mv("rec.invSet", "Sotto il tavolo, mani al bordo, corpo dritto", [K(inv(false), 400, 1200)], { props: TABLE_TOP });
    mv("rec.invPull", "Tira il petto verso il bordo, scendi in 2 secondi", [K(inv(false), 300, 200), K(inv(true).act("arml", "armr", "torso"), 800, 400), K(inv(false), 1200, 300)], { props: TABLE_TOP });
    const ohp = (up) => {
      const b = seated(0.45);
      const cy = 0.53 + 0.49;
      if (up) b.handW("l", -0.1, cy + 0.54, -0.22, "db").handW("r", -0.1, cy + 0.54, 0.22, "db").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
      else b.handW("l", -0.06, cy + 0.06, -0.3, "db").handW("r", -0.06, cy + 0.06, 0.3, "db").elbow("l", [0, -1, -0.6]).elbow("r", [0, -1, 0.6]);
      return b;
    };
    mv("rec.ohpSet", "Seduto con lo schienale, manubri alle spalle", [K(ohp(false), 400, 1200)], { props: CHAIR });
    mv("rec.ohp", "Spingi in alto senza inarcare, scendi fino al mento", [K(ohp(false), 300, 200), K(ohp(true).act("arml", "armr"), 700, 400), K(ohp(false), 1100, 300)], { props: CHAIR });
    const lat = (up) => {
      const b = standAt(0);
      if (up) b.handW("l", 0.06, 1.38, -0.74, "db").handW("r", 0.06, 1.38, 0.74, "db").elbow("l", [0, -0.3, -1]).elbow("r", [0, -0.3, 1]);
      else b.handW("l", 0.06, 0.92, -0.26, "db").handW("r", 0.06, 0.92, 0.26, "db");
      return b;
    };
    mv("rec.latSet", "In piedi, ginocchia morbide, manubri lungo i fianchi", [K(lat(false), 400, 1200)]);
    mv("rec.lat", "Su di lato fino alle spalle, giù in 3 secondi", [K(lat(false), 300, 200), K(lat(true).act("arml", "armr"), 800, 300), K(lat(false), 1600, 300)]);
    const curl = (up) => {
      const b = standAt(0);
      if (up) b.handW("l", 0.22, 1.3, -0.2, "db").handW("r", 0.22, 1.3, 0.2, "db").elbow("l", [-0.2, -1, 0]).elbow("r", [-0.2, -1, 0]);
      else b.handW("l", 0.05, 0.9, -0.22, "db").handW("r", 0.05, 0.9, 0.22, "db").elbow("l", [-1, 0, 0]).elbow("r", [-1, 0, 0]);
      return b;
    };
    mv("rec.curlSet", "Manubri lungo i fianchi, gomiti vicini al corpo", [K(curl(false), 400, 1200)]);
    mv("rec.curl", "Piega i gomiti fino alle spalle, giù in 3 secondi", [K(curl(false), 300, 200), K(curl(true).act("arml", "armr"), 700, 300), K(curl(false), 1600, 300)]);
    const tri = (up) => {
      const b = seated(0.45);
      const cy = 1.02;
      if (up) b.handW("l", -0.1, cy + 0.54, -0.04, "db").handW("r", -0.1, cy + 0.54, 0.04, "db").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
      else b.handW("l", -0.34, cy + 0.2, -0.03, "db").handW("r", -0.34, cy + 0.2, 0.03, "db").elbow("l", [0.4, 1, -0.3]).elbow("r", [0.4, 1, 0.3]);
      return b;
    };
    mv("rec.triSet", "Seduto, un manubrio con due mani sopra la testa", [K(tri(true), 400, 1200)], { props: CHAIR });
    mv("rec.tri", "Giù dietro la testa in 3 secondi, poi stendi le braccia", [K(tri(true), 300, 200), K(tri(false).act("arml", "armr"), 1500, 300), K(tri(true).act("arml", "armr"), 700, 300)], { props: CHAIR });
    const pullover = (back) => {
      const b = lieLegs();
      if (back) b.handW("l", -1.04, 0.24, -0.04, "db").handW("r", -1.04, 0.24, 0.04, "db").elbow("l", [0, 1, -0.4]).elbow("r", [0, 1, 0.4]);
      else b.handW("l", -0.44, 0.68, -0.04, "db").handW("r", -0.44, 0.68, 0.04, "db").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
      return b;
    };
    mv("rec.pullSet", "Sdraiato, manubrio con due mani sopra il petto", [K(pullover(false), 400, 1200)]);
    mv("rec.pull", "Dietro la testa in 3 secondi, poi riporta su con i dorsali", [K(pullover(false), 300, 200), K(pullover(true).act("arml", "armr"), 1500, 400), K(pullover(false).act("arml", "armr"), 900, 300)]);
    const ytw = (k) => {
      const b = lieFront().set("chest", [0.5, 0.16, 0]).set("head", [0.71, 0.16, 0]);
      if (k === "Y") b.handW("l", 1.0, 0.26, -0.4, "fist").handW("r", 1.0, 0.26, 0.4, "fist").elbow("l", [0, 1, -0.3]).elbow("r", [0, 1, 0.3]);
      else if (k === "T") b.handW("l", 0.5, 0.24, -0.72, "fist").handW("r", 0.5, 0.24, 0.72, "fist").elbow("l", [0, 1, 0]).elbow("r", [0, 1, 0]);
      else if (k === "W") b.handW("l", 0.62, 0.24, -0.42, "fist").handW("r", 0.62, 0.24, 0.42, "fist").elbow("l", [-0.6, 0.5, -1]).elbow("r", [-0.6, 0.5, 1]);
      else b.handW("l", 0.52, 0.05, -0.32, "open").handW("r", 0.52, 0.05, 0.32, "open");
      return b;
    };
    mv("rec.ytwRest", "A pancia in giù, fronte sull'asciugamano", [K(ytw(null), 400, 1200)]);
    mv("rec.ytwY", "Y: braccia avanti a V, pollici in alto, tieni 2 secondi", [K(ytw(null), 300, 200), K(ytw("Y").act("arml", "armr"), 600, 1200), K(ytw(null), 500, 200)]);
    mv("rec.ytwT", "T: braccia aperte di lato, tieni", [K(ytw(null), 300, 200), K(ytw("T").act("arml", "armr"), 600, 1200), K(ytw(null), 500, 200)]);
    mv("rec.ytwW", "W: gomiti piegati, scapole verso le tasche", [K(ytw(null), 300, 200), K(ytw("W").act("arml", "armr"), 600, 1200), K(ytw(null), 500, 200)]);
    const farmer = (phase) => {
      const b = standAt(0).foot("l", phase ? -0.1 : 0.12, -0.11, 4, phase ? 20 : 0).foot("r", phase ? 0.12 : -0.1, 0.11, -4, phase ? 0 : 20);
      b.handW("l", 0.0, 0.9, -0.25, "db").handW("r", 0.0, 0.9, 0.25, "db").elbow("l", [-1, 0, -0.2]).elbow("r", [-1, 0, 0.2]);
      return b;
    };
    mv("rec.farmerSet", "Un manubrio per mano, spalle basse, busto alto", [K(farmer(0).foot("l", 0, -0.11, 4, 0).foot("r", 0, 0.11, -4, 0), 400, 1200)]);
    mv("rec.farmerWalk", "Passi normali: il ginocchio si stende quando il tallone tocca", [K(farmer(0).act("legr"), 400, 100), K(farmer(1).act("legl"), 400, 100), K(farmer(0).act("legr"), 400, 100), K(farmer(1).act("legl"), 400, 200)]);
    const dbSet = () => lieBack().footAt("l", [0.3, 0.52, -0.12], 0, -10).footAt("r", [0.3, 0.52, 0.12], 0, -10).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]).handW("l", -0.48, 0.69, -0.18, "open").handW("r", -0.48, 0.69, 0.18, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
    mv("rec.dbSet", "Braccia verso il soffitto, anche e ginocchia a 90 gradi", [K(dbSet(), 400, 1200)]);
    const dbExt = (s) => {
      const b = dbSet();
      const other = s === "l" ? "r" : "l";
      b.handW(s, -1.02, 0.28, s === "l" ? -0.2 : 0.2, "open").elbow(s, [0, 1, 0]);
      b.footAt(other, [0.82, 0.24, other === "l" ? -0.12 : 0.12], 0, -70).knee(other, [0, 1, 0]);
      return b.act("arm" + s, "leg" + other);
    };
    mv("rec.dbExt", "Allunga braccio e gamba opposti, piano, schiena giù", [K(dbSet(), 300, 200), K(dbExt("l"), 1200, 300), K(dbSet(), 600, 200), K(dbExt("r"), 1200, 300), K(dbSet(), 600, 200)]);
    const sideElbow = (up) => {
      const b = st();
      const py = up ? 0.27 : 0.2;
      b.set("pel", [0, py, 0]).set("chest", [-0.42, 0.51, 0]).set("head", [-0.6, 0.6, 0]).set("hipYaw", 0).set("chestYaw", 0).set("chestRoll", 90).set("hipRoll", 90);
      b.footAt("l", [0.83, 0.08, 0.0], 0, 0, 90).footAt("r", [0.83, 0.17, 0.0], 0, 0, 90).knee("l", [0, 0, -1]).knee("r", [0, 0, -1]);
      b.handW("l", -0.42, 0.05, -0.26, "fist").elbow("l", [0, -1, 0]).handW("r", -0.2, up ? 0.62 : 0.34, -0.1, "open");
      return b;
    };
    mv("rec.sideElbow", "Sul fianco, gomito sotto la spalla", [K(sideElbow(false), 400, 1200)]);
    mv("rec.sidePlank", "Solleva il bacino fino a una linea dritta e tieni", [K(sideElbow(false), 300, 200), K(sideElbow(true).act("torso"), 700, 1800)]);
    mv("rec.sidePlankHold", "Tieni respirando, il bacino non cade", [K(sideElbow(true).act("torso"), 400, 2400)]);
    const hollowSet = () => lieBack().handW("l", -0.06, 0.06, -0.28, "open").handW("r", -0.06, 0.06, 0.28, "open");
    const hollowUp = () => hollowSet().set("chest", [-0.47, 0.24, 0]).set("head", [-0.64, 0.33, 0]).footAt("l", [0.84, 0.25, -0.1], 0, -60).footAt("r", [0.84, 0.25, 0.1], 0, -60).handW("l", -0.14, 0.3, -0.26, "open").handW("r", -0.14, 0.3, 0.26, "open");
    mv("rec.hollowSet", "Sdraiato, schiena bassa schiacciata a terra", [K(hollowSet(), 400, 1200)]);
    mv("rec.hollowUp", "Solleva spalle e gambe distese di pochi centimetri", [K(hollowSet(), 300, 200), K(hollowUp().act("torso", "legl", "legr"), 700, 1200)]);
    mv("rec.hollowHold", "Tieni respirando corto, ginocchia dritte", [K(hollowUp().act("torso", "legl", "legr"), 400, 2200)]);

    /* ---------------- TECNICA */
    const seatG = () => {
      const b = seated(0.45).set("chest", [-0.1, 1.02, 0]).set("head", [-0.07, 1.22, 0]);
      return b.guard("box").fists();
    };
    const seatJab = () => seatG().twist(-18).straight("l", [0.75, 1.15, -0.02]);
    const seatCross = () => { const b = seatG().twist(30); return b.straight("r", [0.75, 1.15, 0.0]).handHead("l", 0.12, -0.06, -0.1, "fist"); };
    const seatHook = () => seatG().twist(35).hook("l", [0.45, 1.15, 0]);
    const seatSlip = (s) => seatG().lean(0.02, s * 0.13, 0.02).act("torso");
    mv("rec.seatGuard", "Seduto sul bordo della sedia, mani in guardia, mento basso", [K(seatG(), 400, 1200)], { props: CHAIR });
    mv("rec.seatOneTwo", "Jab e diretto ruotando il busto, ritorno in guardia", [K(seatG(), 300, 150), K(seatJab().act("arml", "torso"), 220, 120), K(seatG(), 220, 80), K(seatCross().act("armr", "torso"), 240, 140), K(seatG(), 260, 300)], { props: CHAIR });
    mv("rec.seatHooks", "Gancio e montante dal busto, le gambe restano ferme", [K(seatG(), 300, 150), K(seatHook().act("arml", "torso"), 260, 140), K(seatG(), 260, 100), K(seatG().twist(-25).upper("r", "chin").act("armr", "torso"), 260, 140), K(seatG(), 280, 300)], { props: CHAIR });
    mv("rec.seatSlip", "Schivata di busto a destra e a sinistra", [K(seatG(), 300, 150), K(seatSlip(1), 300, 300), K(seatG(), 300, 100), K(seatSlip(-1), 300, 300), K(seatG(), 300, 300)], { props: CHAIR });
    const legG = (lift = true) => {
      const b = standAt(0).guard("box").fists();
      if (lift) b.footAt("l", [0.1, 0.34, -0.12], 4, 20).knee("l", [1, 0.2, 0]);
      return b;
    };
    mv("rec.legGuard", "In piedi sull'operata, ginocchio morbido, guardia alta", [K(standAt(0).guard("box").fists(), 300, 200), K(legG().act("legr"), 600, 1000)], { props: WALL_SIDE });
    mv("rec.legJab", "Colpi dritti lenti senza perdere l'equilibrio", [K(legG(), 300, 150), K(legG().twist(-15).straight("l", "head").act("arml"), 400, 200), K(legG(), 400, 100), K(legG().twist(25).straight("r", "head").act("armr"), 420, 200), K(legG(), 400, 300)], { props: WALL_SIDE });
    const kneeUp = standAt(0).guard("box").fists().footAt("l", [0.28, 0.6, -0.1], 0, 60).knee("l", [1, 1.2, 0]).heel("r", 15);
    mv("rec.legKnee", "Ginocchiata lenta con l'altra gamba, poi torna in guardia", [K(legG(false), 300, 150), K(kneeUp.act("legl"), 700, 500), K(legG(), 600, 300)], { props: WALL_SIDE });

    /* ---------------- FLESSIBILITÀ PER I CALCI (gamba operata = destra, dritta) */
    const WALL_FRONT = [box(0.58, 0.64, 0, 1.9, -0.6, 0.6)];
    const WALL_NEAR = [box(0.5, 0.56, 0, 1.9, -0.6, 0.6)];
    const WALL_LEFT = [box(-0.45, 0.6, 0, 1.9, -0.62, -0.56)];
    const WALL_LEGS = [box(0.17, 0.23, 0, 1.25, -0.9, 0.9, { glass: true })];
    const STOOL = [box(0.52, 0.84, 0, 0.3, -0.06, 0.3)];
    const DEG = Math.PI / 180;
    // polpaccio al muro: operata dietro e tesa, tallone giu'; lean = bacino verso il muro
    const calfWall = (lean) => {
      const b = st();
      const px = lean ? 0.05 : -0.08;
      const py = lean ? 0.85 : 0.89;
      b.set("pel", [px, py, 0]).set("chest", [px + 0.22, py + 0.45, 0]).set("head", [px + 0.31, py + 0.63, 0]);
      b.foot("l", 0.24, -0.12, 4, 0).knee("l", [1, 0.2, 0]);
      b.foot("r", -0.39, 0.12, -4, 0).knee("r", [1, 0, 0]);
      b.handW("l", 0.55, 1.3, -0.22, "open").handW("r", 0.55, 1.3, 0.22, "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
      return b;
    };
    mv("rec.calfWallSet", "Mani al muro, operata dietro e tesa, tallone a terra", [K(calfWall(0), 400, 1200)], { props: WALL_FRONT });
    mv("rec.calfWallQuad", "Tallone dietro giù, coscia contratta, ginocchio dritto", [K(calfWall(0), 300, 300), K(calfWall(0).act("legr"), 400, 1400)], { props: WALL_FRONT });
    mv("rec.calfWall", "Bacino verso il muro: il polpaccio dietro tira", [K(calfWall(0), 300, 200), K(calfWall(1).act("legr"), 1300, 1900)], { props: WALL_FRONT });
    mv("rec.calfWallSwitch", "Resta respirando, poi cambia gamba", [K(calfWall(1).act("legr"), 300, 1400), K(calfWall(0), 900, 300), K(calfWall(1).mirror().act("legl"), 1200, 1200)], { props: WALL_FRONT });

    // femorali: tallone destro sullo sgabello; hinge 0..1
    const ham = (hinge) => {
      const b = st();
      const ang = hinge * 46 * DEG;
      const px = -0.02 - 0.05 * hinge;
      const py = 0.93 - 0.03 * hinge;
      b.set("pel", [px, py, -0.01]).set("chest", [px + 0.5 * Math.sin(ang), py + 0.5 * Math.cos(ang), 0]).set("head", [px + 0.7 * Math.sin(ang) + 0.02 * hinge, py + 0.7 * Math.cos(ang), 0]);
      b.foot("l", 0, -0.11, 4, 0).knee("l", [1, 0, 0]);
      b.footAt("r", [0.66, 0.395, 0.12], 0, -84).knee("r", [0, 1, 0]);
      if (hinge) b.handW("l", 0.27, 0.73, 0.03, "open").handW("r", 0.31, 0.71, 0.19, "open").elbow("l", [0.2, 0, -1]).elbow("r", [0.2, 0, 1]);
      else b.handPel("l", 0.02, 0.04, -0.18, "open").handPel("r", 0.02, 0.04, 0.18, "open");
      return b;
    };
    mv("rec.hamSet", "Tallone dell'operata sul rialzo, gamba tesa", [K(ham(0), 400, 1200)], { props: STOOL });
    mv("rec.hamQuad", "Coscia contratta: ginocchio dritto, punta in alto", [K(ham(0), 300, 300), K(ham(0).act("legr"), 400, 1400)], { props: STOOL });
    mv("rec.hamHinge", "Piega dalle anche con la schiena dritta", [K(ham(0), 300, 200), K(ham(1).act("legr", "torso"), 1500, 1700)], { props: STOOL });
    mv("rec.hamHold", "Resta respirando: tira a metà coscia", [K(ham(1).act("legr"), 400, 2600)], { props: STOOL });

    // gambe al muro: spread = gradi di apertura di ogni gamba
    const legsUp = (spread, hands) => {
      const b = lieBack();
      const a = spread * DEG;
      const y = 0.12 + 0.86 * Math.cos(a);
      const z = 0.095 + 0.86 * Math.sin(a);
      b.footAt("l", [0.1, y, -z], 180, 0).footAt("r", [0.1, y, z], 180, 0).knee("l", [-1, 0, 0]).knee("r", [-1, 0, 0]);
      if (hands) b.handW("l", -0.1, 0.36, -0.16, "open").handW("r", -0.1, 0.36, 0.16, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
      return b;
    };
    mv("rec.legsWall", "Sedere vicino al muro, gambe dritte appoggiate in alto", [K(legsUp(0), 400, 1200)], { props: WALL_LEGS });
    mv("rec.legsWallQuad", "Ginocchia dritte, punte verso di te", [K(legsUp(0), 300, 300), K(legsUp(0).act("legl", "legr"), 400, 1400)], { props: WALL_LEGS });
    mv("rec.legsWallV", "Lascia scivolare le gambe in una V, piano", [K(legsUp(0), 300, 200), K(legsUp(30).act("legl", "legr"), 2600, 2000)], { props: WALL_LEGS });
    mv("rec.legsWallClose", "Per uscire riavvicina le gambe con le mani", [K(legsUp(30), 300, 600), K(legsUp(12, true).act("arml", "armr"), 1200, 300), K(legsUp(0, true), 900, 600)], { props: WALL_LEGS });

    // estensione attiva: coscia destra in verticale, ext 0 (90 gradi) .. 1 (gamba tesa)
    const ake = (ext, noHands) => {
      const b = lieBack();
      const knee = [0.0, 0.12 + 0.44, 0.1];
      const th = (90 - ext * 78) * DEG; // angolo dello stinco dalla verticale
      b.footAt("r", [knee[0] + 0.44 * Math.sin(th), knee[1] + 0.44 * Math.cos(th), 0.11], 0, ext > 0.5 ? -10 : -60).knee("r", [-1, 0.3, 0]);
      if (!noHands) b.handW("l", -0.1, 0.42, 0.03, "open").handW("r", -0.1, 0.42, 0.17, "open").elbow("l", [0, 0, -1]).elbow("r", [0, 0, 1]);
      return b;
    };
    mv("rec.akeSet", "Coscia dell'operata in verticale, mani dietro il ginocchio", [K(lieBack(), 300, 200), K(ake(0), 800, 1000)]);
    mv("rec.akeHold90", "Ginocchio a 90 gradi, la coscia non si muove", [K(ake(0).act("legr"), 400, 1400)]);
    mv("rec.akeExt", "Stendi verso il soffitto più che puoi", [K(ake(0), 300, 200), K(ake(1).act("legr"), 1300, 900), K(ake(0), 1600, 300)]);
    mv("rec.akeHold", "Tieni 5 secondi, poi giù in 3", [K(ake(0), 300, 200), K(ake(1).act("legr"), 900, 2600), K(ake(0), 2200, 300)]);

    // flessori dell'anca: passo lungo, operata dietro e tesa; push = bacino avanti
    const hipFlex = (push, arm) => {
      const b = st();
      const px = push ? 0.03 : -0.06;
      const py = push ? 0.85 : 0.88;
      b.set("pel", [px, py, 0]).set("chest", [px - 0.04, py + 0.5, 0]).set("head", [px - 0.03, py + 0.7, 0]);
      b.foot("l", 0.36, -0.12, 4, 0).knee("l", [1, 0.1, 0]);
      b.foot("r", -0.5, 0.12, -4, 30).knee("r", [1, 0, 0]);
      b.handPel("l", 0.02, 0.04, -0.18, "open").handPel("r", 0.02, 0.04, 0.18, "open");
      if (arm) { b.lean(0, -0.08, 0); b.handW("r", px - 0.08, 1.86, 0.06, "open").elbow("r", [0, 0.2, 1]); }
      return b;
    };
    mv("rec.hfSet", "Passo lungo: operata dietro e tesa, punta in avanti", [K(st(), 300, 200), K(hipFlex(0).act("legl", "legr"), 800, 1000)]);
    mv("rec.hfQuad", "Ginocchio dietro dritto, quello davanti poco piegato", [K(hipFlex(0).act("legr"), 400, 1400)]);
    mv("rec.hfPush", "Gluteo stretto, bacino avanti: tira davanti all'anca", [K(hipFlex(0), 300, 200), K(hipFlex(1).act("legr", "torso"), 1400, 1700)]);
    mv("rec.hfArm", "Resta respirando; dal livello 3 anche il braccio in alto", [K(hipFlex(1).act("legr"), 400, 1200), K(hipFlex(1, true).act("legr", "armr"), 900, 1400), K(hipFlex(1), 800, 300)]);

    // slancio frontale lento: mano sinistra al muro, gamba destra tesa su di "deg" gradi
    const olf = (deg) => {
      const b = standAt(0).foot("l", 0, -0.11, 4, 0);
      const a = deg * DEG;
      const hip = [-0.03, 0.95, 0.095];
      b.set("pel", [-0.03 - 0.03 * (deg / 80), 0.95, 0]).set("chest", [-0.04 - 0.04 * (deg / 80), 1.45, -0.01]).set("head", [-0.03 - 0.05 * (deg / 80), 1.65, -0.01]);
      b.footAt("r", [hip[0] + 0.86 * Math.sin(a), hip[1] - 0.86 * Math.cos(a), 0.12], 0, -deg * 0.85).knee("r", [Math.cos(a), Math.sin(a), 0]);
      b.handW("l", 0.05, 1.22, -0.52, "open").elbow("l", [0, -1, -0.3]).handPel("r", 0.02, 0.04, 0.18, "open");
      return b;
    };
    mv("rec.olfSet", "Di fianco al muro, mano sul muro, busto dritto", [K(olf(0), 400, 1200)], { props: WALL_LEFT });
    mv("rec.olfQuad", "Coscia contratta, ginocchio dritto, punta tirata", [K(olf(0), 300, 200), K(olf(12).act("legr"), 500, 1200), K(olf(0), 500, 300)], { props: WALL_LEFT });
    mv("rec.olf", "Su in 2 secondi a ginocchio dritto, tieni 1", [K(olf(0), 300, 200), K(olf(78).act("legr"), 1900, 1000), K(olf(0), 2700, 300)], { props: WALL_LEFT });
    mv("rec.olfDown", "Giù in 3 secondi, poi l'altra gamba", [K(olf(78).act("legr"), 300, 400), K(olf(0).act("legr"), 2800, 500)], { props: WALL_LEFT });

    // slancio laterale lento: di fronte al muro, gamba destra tesa di lato di "deg" gradi
    const ols = (deg) => {
      const b = standAt(0).foot("l", 0, -0.11, 4, 0);
      const a = deg * DEG;
      const hip = [-0.01, 0.95, 0.095];
      const k = deg / 45;
      b.set("pel", [-0.01, 0.95, -0.02 * k]).set("chest", [0.02, 1.45, -0.06 * k]).set("head", [0.03, 1.65, -0.08 * k]);
      b.footAt("r", [hip[0] + 0.02, hip[1] - 0.86 * Math.cos(a), hip[2] + 0.86 * Math.sin(a)], 0, 0, -deg * 0.9).knee("r", [1, 0, 0]);
      b.handW("l", 0.47, 1.3, -0.2, "open").handW("r", 0.47, 1.3, 0.2, "open").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
      return b;
    };
    mv("rec.olsSet", "Di fronte al muro, mani appoggiate all'altezza del petto", [K(ols(0), 400, 1200)], { props: WALL_NEAR });
    mv("rec.olsQuad", "Ginocchio dritto, punta del piede in avanti", [K(ols(0), 300, 200), K(ols(8).act("legr"), 500, 1200), K(ols(0), 500, 300)], { props: WALL_NEAR });
    mv("rec.ols", "Di lato in 2 secondi, tieni 1, busto dritto", [K(ols(0), 300, 200), K(ols(44).act("legr"), 1900, 1000), K(ols(0), 2700, 300)], { props: WALL_NEAR });
    mv("rec.olsDown", "Giù in 3 secondi, poi l'altra gamba", [K(ols(44).act("legr"), 300, 400), K(ols(0).act("legr"), 2800, 500)], { props: WALL_NEAR });

    // divaricata da seduto: lean 0 (busto dritto), 1 (avanti al centro), "l"/"r" (verso una gamba)
    const strad = (lean) => {
      const b = sitLong();
      const a = 38 * DEG;
      const fx = 0.86 * Math.cos(a);
      const fz = 0.095 + 0.86 * Math.sin(a);
      b.footAt("l", [fx, 0.075, -fz], 38, -80).footAt("r", [fx, 0.075, fz], -38, -80).knee("l", [0, 1, 0]).knee("r", [0, 1, 0]);
      if (!lean) { b.handW("l", 0.02, 0.06, -0.3, "open").handW("r", 0.02, 0.06, 0.3, "open"); return b; }
      const side = lean === "l" ? -1 : lean === "r" ? 1 : 0;
      const cx = side ? 0.26 : 0.32;
      b.set("chest", [cx, 0.53, side * 0.2]).set("head", [cx + 0.12, 0.65, side * 0.3]);
      b.handW("l", side ? 0.5 : 0.6, side ? 0.1 : 0.06, side * 0.36 - (side ? 0.1 : 0.14), "open").handW("r", side ? 0.5 : 0.6, side ? 0.1 : 0.06, side * 0.36 + (side ? 0.1 : 0.14), "open").elbow("l", [0, 1, -0.5]).elbow("r", [0, 1, 0.5]);
      return b;
    };
    mv("rec.strSit", "Seduto a gambe aperte e dritte, punte in alto", [K(strad(0), 400, 1200)]);
    mv("rec.strQuad", "Ginocchia premute a terra: 5 secondi, rilassa", [K(strad(0), 300, 300), K(strad(0).act("legl", "legr"), 500, 1500), K(strad(0), 500, 400)]);
    mv("rec.strFwd", "Piega in avanti dalle anche, schiena dritta", [K(strad(0), 300, 200), K(strad(1).act("torso"), 1500, 1700)]);
    mv("rec.strSide", "Verso una gamba, poi verso l'altra", [K(strad(1), 300, 200), K(strad("r").act("torso"), 1200, 1300), K(strad(1), 900, 200), K(strad("l").act("torso"), 1200, 1300)]);

    /* ---------------- CALCI AL RALLENTATORE (mano sinistra al muro, calcia la destra) */
    const kickWall = (b) => b.handW("l", 0.0, 1.2, -0.52, "open").elbow("l", [0, -1, -0.3]).handPel("r", 0.04, 0.06, 0.2, "fist");
    const skStand = () => kickWall(standAt(0).foot("l", 0, -0.11, 4, 0));
    // frontale: 0 = in piedi, 1 = camera, 2 = gamba stesa
    const skFront = (ph) => {
      const b = skStand();
      if (!ph) return b;
      const hip = [-0.04, 0.94, 0.095];
      b.set("pel", [-0.04, 0.94, 0]).set("chest", [-0.08, 1.44, -0.01]).set("head", [-0.07, 1.64, -0.01]);
      const a = 70 * DEG;
      if (ph === 1) {
        const knee = [hip[0] + 0.44 * Math.sin(a), hip[1] - 0.44 * Math.cos(a)];
        b.footAt("r", [knee[0] - 0.13, knee[1] - 0.42, 0.12], 0, 40).knee("r", [1, 0.6, 0]);
      } else b.footAt("r", [hip[0] + 0.86 * Math.sin(a), hip[1] - 0.86 * Math.cos(a), 0.12], 0, 10).knee("r", [0.3, 1, 0]);
      return kickWall(b);
    };
    // laterale: 0 = in piedi (piede d'appoggio gia' girato), 1 = camera, 2 = gamba stesa; il calcio va avanti
    const CHAIR_BACK = [box(-0.95, -0.55, 0, 0.45, -0.45, -0.05), box(-0.61, -0.55, 0.45, 0.98, -0.45, -0.05)];
    const skSide = (ph) => {
      const b = st();
      if (ph) {
        b.set("pel", [-0.03, 0.95, 0]).set("chest", [-0.01, 1.45, 0]).set("head", [0, 1.65, 0]).foot("l", 0, -0.11, 4, 0).foot("r", 0, 0.11, -4, 0);
        b.kick("r", "side", ph === 1 ? "chamber" : "ext", 0.78, { arms: "none" });
      } else {
        // gia' girato di lato: piede d'appoggio ruotato prima di alzare la gamba
        b.set("pel", [-0.05, 0.95, 0]).set("chest", [-0.1, 1.44, 0]).set("head", [-0.1, 1.64, 0]).set("hipYaw", 60).set("chestYaw", 55);
        const hl = b.hip("l");
        const hr = b.hip("r");
        b.foot("l", hl[0], hl[2] - 0.02, 70, 0).foot("r", hr[0] + 0.02, hr[2] + 0.02, 55, 0);
      }
      b.hand("l", [-0.56, 1.0, -0.25], "open").elbow("l", [0, -1, -0.3]).handPel("r", 0.04, 0.06, 0.2, "fist");
      return b;
    };
    mv("rec.skSet", "Di fianco al muro, in appoggio sulla gamba sana", [K(skStand(), 400, 1200)], { props: WALL_LEFT });
    mv("rec.skChamber", "Camera: ginocchio dell'operata su, punta tirata", [K(skStand(), 300, 200), K(skFront(1).act("legr"), 1100, 1100), K(skStand(), 900, 300)], { props: WALL_LEFT });
    mv("rec.skFront", "Stendi in 3 secondi, coscia contratta 2 secondi", [K(skStand(), 300, 150), K(skFront(1).act("legr"), 900, 300), K(skFront(2).act("legr"), 2600, 1800), K(skFront(1).act("legr"), 1600, 200), K(skStand(), 800, 300)], { props: WALL_LEFT });
    mv("rec.skSide", "Laterale: camera di lato, il tallone spinge in fuori", [K(skSide(0), 300, 200), K(skSide(1).act("legr"), 900, 300), K(skSide(2).act("legr"), 2600, 1600), K(skSide(1).act("legr"), 1500, 200), K(skSide(0), 800, 300)], { props: CHAIR_BACK });
  });
})(typeof window !== "undefined" ? window : globalThis);
