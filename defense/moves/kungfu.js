/*
 * Progetto A - Difesa: movimenti del Kung Fu, scuola Wing Chun (prefisso "kungfu.").
 * Posizione frontale Yee Jee Kim Yeung Ma, guardia man sao + wu sao, mani e pugni sulla linea
 * centrale con i gomiti bassi. Mano sinistra avanti salvo dove indicato; i nomi che finiscono
 * con "R" sono la stessa tecnica dall'altro lato (a specchio).
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add("kungfu", function (L) {
    const { mv, K, B, standing, wcStance, plank, pushDown, lieBack, squat, add, sub, mul, dot, ARM } = L;
    const D = Math.PI / 180;
    const sg = (s) => (s === "l" ? -1 : 1);
    const ot = (s) => (s === "l" ? "r" : "l");
    const yF = (y) => [Math.cos(y * D), 0, -Math.sin(y * D)];
    const yR = (y) => [Math.sin(y * D), 0, Math.cos(y * D)];
    // punto relativo al petto: avanti (verso "y" gradi, 0 = davanti), su, destra
    const pt = (b, f, u, r, y = 0) => add(add(add(b.p.chest, mul(yF(y), f)), [0, u, 0]), mul(yR(y), r));
    const vec = (f, u, r, y = 0) => add(add(mul(yF(y), f), [0, u, 0]), mul(yR(y), r));
    const hd = (b, s, f, u, r, g, y = 0) => b.hand(s, pt(b, f, u, r, y), g);
    const el = (b, s, f, u, r, y = 0) => b.elbow(s, vec(f, u, r, y));
    // quanto avanti va la mano perche' il braccio sia disteso al "ext" (0-1) della sua lunghezza
    function fx(b, s, u, r, ext, y = 0) {
      const d0 = sub(pt(b, 0, u, r, y), b.sh(s));
      const k = dot(d0, yF(y));
      const R = ARM * ext;
      return -k + Math.sqrt(Math.max(0, k * k - (dot(d0, d0) - R * R)));
    }
    const ex = (b, s, u, r, ext, g, y) => hd(b, s, fx(b, s, u, r, ext, y), u, r, g, y);

    /* ---------------- le mani (s = lato, y = direzione della linea centrale) */
    const H = {
      chamber: (b, s, y = 0) => el(hd(b, s, 0.06, -0.26, sg(s) * 0.15, "fist", y), s, -1, -0.8, sg(s) * 0.2, y),
      sternum: (b, s, y = 0) => el(hd(b, s, 0.2, -0.1, 0, "fist", y), s, 0, -1, -sg(s) * 0.4, y),
      punch: (b, s, y = 0, u = 0.08) => el(ex(b, s, u, 0, 0.94, "fist", y), s, 0, -1, -sg(s) * 0.3, y),
      man: (b, s, y = 0) => el(ex(b, s, 0.02, 0, 0.8, "blade", y), s, 0, -1, -sg(s) * 0.2, y),
      wu: (b, s, y = 0) => el(hd(b, s, 0.22, -0.08, 0, "blade", y), s, 0.2, -1, -sg(s) * 0.1, y),
      wuBy: (b, s, y = 0) => el(hd(b, s, 0.24, -0.06, -sg(s) * 0.1, "blade", y), s, 0.2, -1, -sg(s) * 0.1, y),
      tan: (b, s, y = 0) => el(ex(b, s, -0.02, 0, 0.77, "open", y), s, 0, -1, -sg(s) * 0.7, y),
      tanForm: (b, s, y = 0) => el(ex(b, s, -0.06, 0, 0.72, "open", y), s, 0, -1, -sg(s) * 0.9, y),
      bong: (b, s, y = 0) => el(ex(b, s, -0.06, 0, 0.68, "blade", y), s, 0.3, 0.8, sg(s), y),
      fook: (b, s, y = 0, u = -0.06) => el(ex(b, s, u, 0, 0.78, "blade", y), s, 0, -0.7, -sg(s), y),
      pakPrep: (b, s, y = 0) => el(hd(b, s, 0.28, -0.03, sg(s) * 0.21, "open", y), s, 0, -1, sg(s) * 0.4, y),
      pak: (b, s, y = 0) => el(ex(b, s, -0.04, -sg(s) * 0.04, 0.78, "open", y), s, 0, -1, -sg(s) * 0.4, y),
      lapReach: (b, s, y = 0) => el(ex(b, s, 0.0, 0, 0.83, "open", y), s, 0, -1, -sg(s) * 0.2, y),
      lapPull: (b, s, y = 0) => el(hd(b, s, 0.14, -0.36, sg(s) * 0.1, "fist", y), s, -1, -0.5, sg(s) * 0.6, y),
      gaun: (b, s, y = 0) => el(ex(b, s, -0.44, sg(s) * 0.2, 0.95, "blade", y), s, 0, -0.3, sg(s), y),
      jum: (b, s, y = 0) => el(hd(b, s, 0.3, -0.02, -sg(s) * 0.02, "blade", y), s, 0, -1, -sg(s) * 0.9, y),
      palm: (b, s, y = 0, u = -0.08) => el(ex(b, s, u, 0, 0.93, "blade", y), s, 0, -1, -sg(s) * 0.3, y),
      palmLow: (b, s, y = 0) => el(ex(b, s, -0.24, 0, 0.9, "blade", y), s, 0, -1, -sg(s) * 0.3, y),
      biu: (b, s, y = 0) => el(ex(b, s, -0.08, 0, 0.97, "blade", y), s, 0, -1, -sg(s) * 0.2, y),
      lan: (b, s, y = 0, u = -0.12) => el(hd(b, s, 0.28, u, -sg(s) * 0.12, "blade", y), s, 0.4, 0.1, sg(s), y),
      out: (b, s, y = 0) => el(hd(b, s, 0.3, -0.1, sg(s) * 0.32, "blade", y), s, 0, -1, sg(s), y)
    };
    const guard = (b, lead = "l", y = 0) => { H.man(b, lead, y); H.wu(b, ot(lead), y); return b; };
    // cerchio del polso (huen sao) attorno al punto della mano: 4 pose
    const huen = (b, s, r = 0.045) => [[0, -1], [1, 0], [0, 1], [-1, 0]].map(([a, c]) => { const q = b.copy(); const h = q.p.hand[s]; q.hand(s, add(h, [0, c * r, sg(s) * -a * r]), "open"); return q.act("arm" + s); });

    /* ---------------- posizioni */
    const feetTog = () => standing().foot("l", 0, -0.07, 0, 0).foot("r", 0, 0.07, 0, 0);
    const S = () => { const b = wcStance(); H.chamber(b, "l"); H.chamber(b, "r"); return b; }; // posizione della forma
    const G = (lead = "l") => guard(wcStance(), lead); // guardia frontale
    // posizione girata (per passi e calci): sinistro avanti, peso dietro, mani sulla linea verso l'avversario
    function T(lead = "l") {
      const b = wcStance();
      b.foot("l", 0.17, -0.09, -12, 0).foot("r", -0.19, 0.15, -42, 0);
      b.set("pel", [-0.09, 0.815, 0.05]).set("hipYaw", -35).set("chestYaw", -25).set("chest", [-0.07, 1.315, 0.04]).set("head", [-0.05, 1.515, 0.03]).look(20);
      b.knee("l", [1, 0, 0.25]).knee("r", [0.8, 0, -0.45]);
      guard(b, "l");
      return lead === "l" ? b : b.mirror();
    }
    // rotazione della posizione sui talloni (juen ma): gira tutto il corpo, i piedi restano, il peso va dietro
    function pivot(b, deg, w = 0.07) {
      const feet = JSON.parse(JSON.stringify(b.p.foot));
      b.spin(deg);
      b.p.foot = feet;
      const toward = deg > 0 ? "r" : "l";
      const f = feet[toward];
      const dz = (f[2] - b.p.pel[2]) * (w / 0.2);
      b.shift(0, dz);
      return b;
    }
    const mirA = (a) => (a ? a.map((x) => x.replace(/(arm|leg)([lr])$/, (m, k, s) => k + (s === "l" ? "r" : "l"))) : a);
    const mirF = (fr) => fr.map((f) => ({ p: f.p.copy().mirror(), t: f.t, h: f.h, act: mirA(f.act), partner: f.partner ? f.partner.copy().mirror() : f.partner }));
    // movimento + la sua versione a specchio (nome + "R")
    function mv2(name, label, labelR, frames, extra) { mv(name, label, frames, extra); mv(name + "R", labelR, mirF(frames), extra); }
    const PAD = { k: "bag", x: 0.62, z: 0, r: 0.15, y0: 0.4, y1: 1.6 };
    const padP = { props: [PAD] };

    /* =============== 1. posizione e apertura */
    const s0 = feetTog();
    const s1 = feetTog(); H.chamber(s1, "l"); H.chamber(s1, "r");
    const s2 = s1.copy().set("pel", [-0.03, 0.85, 0]).set("chest", [-0.01, 1.35, 0]).set("head", [0, 1.55, 0]).knee("l", [1, 0, 0.1]).knee("r", [1, 0, -0.1]);
    H.chamber(s2, "l"); H.chamber(s2, "r");
    const s3 = s2.copy().fyaw("l", 45).fyaw("r", -45);
    const SS = S();
    mv("kungfu.openStance", "Apertura della posizione: pugni al petto, ginocchia piegate, punte e poi talloni in fuori", [
      K(s0, 300, 300), K(s1.copy().act("arml", "armr"), 400, 300), K(s2.copy().act("legl", "legr"), 400, 300),
      K(s3.copy().act("legl", "legr"), 350, 250), K(SS.copy().act("legl", "legr"), 350, 700)
    ]);
    mv("kungfu.openPrep", "Piedi uniti, pugni ai lati del petto con i gomiti indietro, poi piega le ginocchia", [
      K(s0, 300, 300), K(s1.copy().act("arml", "armr"), 400, 400), K(s2.copy().act("legl", "legr"), 450, 800)
    ]);
    mv("kungfu.openFeet", "Tempo 1: punte in fuori ruotando sui talloni; tempo 2: talloni in fuori", [
      K(s2, 300, 300), K(s3.copy().act("legl", "legr"), 450, 500), K(SS.copy().act("legl", "legr"), 450, 800)
    ]);
    mv("kungfu.closeOpen", "Chiude la posizione riportando i piedi uniti, poi la riapre in due tempi", [
      K(SS, 300, 300), K(s3.copy().act("legl", "legr"), 350, 150), K(s2.copy().act("legl", "legr"), 350, 400),
      K(s3.copy().act("legl", "legr"), 350, 200), K(SS.copy().act("legl", "legr"), 350, 500)
    ]);
    mv("kungfu.closeStance", "Chiusura: piedi uniti, gambe distese e braccia lungo i fianchi", [
      K(SS, 300, 300), K(s3.copy().act("legl", "legr"), 350, 150), K(s2.copy().act("legl", "legr"), 350, 200),
      K(s1.copy().act("legl", "legr"), 400, 200), K(s0.copy().act("arml", "armr"), 400, 600)
    ]);
    const breathIn = SS.copy().set("chest", [-0.01, 1.365, 0]).set("head", [0, 1.565, 0]).act("torso");
    H.chamber(breathIn, "l"); H.chamber(breathIn, "r");
    const look = SS.copy().headTo(0.03, -0.04, 0).act("head");
    H.chamber(look, "l"); H.chamber(look, "r");
    mv("kungfu.stanceCheck", "Controlla la larghezza: piedi come le spalle, ginocchia verso dentro", [K(SS, 300, 200), K(look, 400, 900), K(SS, 400, 300)]);
    mv("kungfu.stanceHold", "Tiene la posizione: peso al centro, bacino avanti, respiro calmo", [K(SS, 300, 400), K(breathIn, 1400, 300), K(SS, 1600, 400)]);
    const sq = SS.copy().sink(0.1).act("legl", "legr");
    H.chamber(sq, "l"); H.chamber(sq, "r");
    mv("kungfu.stanceSquat", "Squat in posizione: scende di 10 cm con le ginocchia dentro e risale", [K(SS, 300, 200), K(sq, 700, 200), K(SS, 700, 300)]);

    // ginocchia dentro con il cuscino
    const kn0 = standing().foot("l", 0, -0.12, -10, 0).foot("r", 0, 0.12, 10, 0).handPel("l", 0.02, 0.05, -0.17, "open").handPel("r", 0.02, 0.05, 0.17, "open");
    const kn1 = kn0.copy().set("pel", [0.01, 0.88, 0]).set("chest", [-0.01, 1.38, 0]).set("head", [0.0, 1.58, 0]).knee("l", [1, 0, 0.5]).knee("r", [1, 0, -0.5]);
    kn1.handPel("l", 0.02, 0.05, -0.17, "open").handPel("r", 0.02, 0.05, 0.17, "open");
    mv("kungfu.kneesFeet", "Piedi alla larghezza delle anche, punte un po' in dentro", [K(standing(), 300, 200), K(kn0.copy().act("legl", "legr"), 450, 800)]);
    mv("kungfu.kneesBend", "Piega poco le ginocchia e porta il bacino in avanti", [K(kn0, 300, 200), K(kn1.copy().act("legl", "legr", "torso"), 600, 900), K(kn0, 500, 300)]);
    mv("kungfu.kneesHold", "Ginocchia che stringono verso l'interno, schiena bassa dritta", [K(kn1, 300, 300), K(kn1.copy().set("pel", [0.0, 0.875, 0]).act("legl", "legr"), 500, 1500), K(kn1, 400, 300)]);

    const lanS0 = S(); H.lan(lanS0, "l", 0, -0.1); H.lan(lanS0, "r", 0, -0.2);
    mv("kungfu.lan", "Lan sao: avambracci orizzontali davanti al petto, gomito alto come il polso", [K(SS, 300, 150), K(lanS0.copy().act("arml", "armr"), 450, 900), K(SS, 350, 300)]);

    /* =============== 2. guardia */
    const g = G();
    const gR = G("r");
    mv("kungfu.guard", "Guardia: man sao avanti sulla linea centrale, wu sao dietro, gomiti bassi", [K(SS, 300, 200), K(g.copy().act("arml", "armr"), 450, 900)]);
    mv("kungfu.guardHold", "Guardia ferma: le due mani una dietro l'altra sulla linea centrale", [K(g, 300, 1400)]);
    const gMid = (adv) => { const b = wcStance(); el(hd(b, adv, 0.32, 0.0, 0, "blade"), adv, 0, -1, -sg(adv) * 0.2); el(hd(b, ot(adv), 0.3, -0.11, 0, "blade"), ot(adv), 0, -1, -sg(ot(adv)) * 0.2); return b; };
    mv("kungfu.guardSwitch", "Cambio di guardia: la mano dietro avanza sul centro, quella avanti rientra", [
      K(g, 300, 200), K(gMid("r").act("arml", "armr"), 220, 0), K(gR.copy().act("arml", "armr"), 220, 400), K(gMid("l").act("arml", "armr"), 220, 0), K(g.copy().act("arml", "armr"), 220, 400)
    ]);

    /* =============== 3. pugno verticale */
    const pg = (s) => H.wu(S(), ot(s));
    const p1 = (s) => H.sternum(pg(s), s);
    const p2 = (s) => H.punch(pg(s), s);
    mv("kungfu.punchPrep", "Tempo 1: il pugno va davanti allo sterno, pollice in alto, gomito basso", [K(SS, 300, 200), K(p1("l").act("arml"), 450, 900), K(SS, 400, 300)]);
    mv("kungfu.punchSlow", "Pugno verticale in tre tempi: sterno, mento, ritorno sulla stessa linea", [
      K(SS, 300, 150), K(p1("l").act("arml"), 350, 400), K(p2("l").act("arml"), 450, 500), K(p1("l"), 400, 300),
      K(SS, 300, 150), K(p1("r").act("armr"), 350, 400), K(p2("r").act("armr"), 450, 500), K(p1("r"), 400, 300), K(SS, 300, 300)
    ]);
    mv("kungfu.punch", "Pugno verticale in un gesto: dal centro al centro, gomito basso, a mani alterne", [
      K(SS, 300, 150), K(p2("l").act("arml"), 220, 250), K(pg("l"), 220, 100), K(SS, 200, 100), K(p2("r").act("armr"), 220, 250), K(pg("r"), 220, 100), K(SS, 200, 300)
    ]);
    mv2("kungfu.punchHold", "Pugno lento verso il centro, si ferma con il braccio quasi teso", "Pugno lento con l'altra mano, braccio quasi teso", [K(SS, 300, 200), K(p1("l"), 400, 100), K(p2("l").act("arml"), 1000, 1200), K(p1("l"), 400, 100), K(SS, 300, 300)]);
    mv("kungfu.punchFreeze", "Braccio fermo nel punto d'arrivo: controlla se il pugno copre il nastro", [K(p2("l"), 300, 400), K(p2("l").act("head"), 300, 1200), K(p2("l"), 300, 200)]);
    mv("kungfu.punchSnap", "Pugno a schiocco: colpisce e torna subito, senza spingere", [
      K(SS, 300, 150), K(pg("l"), 200, 100), K(p2("l").act("arml"), 110, 40), K(pg("l"), 150, 200), K(pg("r"), 200, 100), K(p2("r").act("armr"), 110, 40), K(pg("r"), 150, 200), K(SS, 250, 300)
    ]);

    /* =============== 4. pugno a catena */
    const ch = (s) => { const b = wcStance(); H.punch(b, s); el(hd(b, ot(s), 0.24, -0.02, 0, "fist"), ot(s), 0, -1, -sg(ot(s)) * 0.4); return b; };
    const chMid = (s) => { const b = wcStance(); el(hd(b, s, 0.37, 0.03, 0, "fist"), s, 0, -1, -sg(s) * 0.4); el(hd(b, ot(s), 0.36, -0.09, 0, "fist"), ot(s), 0, -1, -sg(ot(s)) * 0.4); return b; };
    const chainFr = (n, t, h, first = 300) => { const fr = [K(ch("r"), first, 100)]; for (let i = 0; i < n; i += 1) { const s = i % 2 ? "r" : "l"; fr.push(K(chMid(s), t, 0), K(ch(s).act("arml", "armr"), t, h)); } return fr; };
    mv("kungfu.chainReady", "Partenza: pugno destro disteso, pugno sinistro sul centro sopra il gomito", [K(SS, 300, 200), K(ch("r").act("arml", "armr"), 500, 900), K(SS, 400, 300)]);
    mv("kungfu.chainCross", "Il pugno sinistro parte sopra l'avambraccio destro, il destro rientra sotto", [K(ch("r"), 300, 300), K(chMid("l").act("arml", "armr"), 900, 600), K(ch("l").act("arml", "armr"), 700, 600), K(ch("r"), 600, 300)]);
    mv("kungfu.chainSlow", "Pugno a catena lento: gli avambracci si incrociano sulla linea centrale", chainFr(4, 450, 350).concat([K(ch("r"), 300, 300)]));
    mv("kungfu.chain", "Pugno a catena: un pugno parte sopra il braccio che rientra, sulla linea centrale", chainFr(6, 75, 40).concat([K(ch("r"), 200, 200)]));
    mv("kungfu.chainFast", "Raffica veloce di pugni a catena, gomiti bassi", chainFr(10, 55, 20).concat([K(ch("r"), 200, 200)]));
    mv("kungfu.chainPad", "Pugno a catena al cuscino: polso dritto, nocche inferiori avanti", chainFr(6, 80, 50).concat([K(ch("r"), 200, 200)]), padP);
    mv("kungfu.padReady", "In guardia davanti al cuscino, alla distanza giusta", [K(SS, 300, 200), K(g.copy().act("arml", "armr"), 400, 900)], padP);
    mv("kungfu.padTouch", "Pugno singolo che tocca il cuscino con il braccio ancora piegato", [K(SS, 300, 150), K(p1("l"), 300, 100), K(p2("l").act("arml"), 400, 600), K(SS, 400, 200), K(p1("r"), 300, 100), K(p2("r").act("armr"), 400, 600), K(SS, 400, 300)], padP);

    /* =============== 5. Siu Nim Tao */
    const xLow = S(); el(hd(xLow, "l", 0.27, -0.4, 0.03, "blade"), "l", 0, -1, -0.6); el(hd(xLow, "r", 0.27, -0.42, -0.03, "blade"), "r", 0, -1, 0.6);
    const xHigh = S(); el(hd(xHigh, "l", 0.3, -0.06, 0.03, "open"), "l", 0, -1, 0.3); el(hd(xHigh, "r", 0.3, -0.09, -0.03, "open"), "r", 0, -1, -0.3);
    const xFist = xHigh.copy().grip("l", "fist").grip("r", "fist");
    mv("kungfu.sntCross", "Mani incrociate in basso, poi in alto, e pugni che tornano ai lati del petto", [
      K(SS, 300, 200), K(xLow.copy().act("arml", "armr"), 500, 400), K(xHigh.copy().act("arml", "armr"), 500, 400), K(xFist, 200, 200), K(SS.copy().act("arml", "armr"), 400, 400)
    ]);
    const cpSide = (s) => {
      const ext = H.punch(S(), s).act("arm" + s);
      const open = ext.copy().grip(s, "open");
      return [K(H.sternum(S(), s), 300, 100), K(ext, 300, 300), K(open, 150, 50)].concat(huen(open, s).map((q) => K(q, 160, 0))).concat([K(ext.copy(), 150, 100), K(SS, 350, 250)]);
    };
    mv("kungfu.sntPunch", "Pugno centrale, la mano si apre e circola (huen sao), torna al fianco; poi l'altra", [K(SS, 300, 150)].concat(cpSide("l"), cpSide("r")));
    // parte lenta: tan sao, huen sao, wu sao, fook sao
    const fTan = H.tanForm(S(), "l").act("arml");
    const fTanStart = el(hd(S(), "l", 0.14, -0.12, 0, "open"), "l", 0, -1, 0.9);
    const fWu = H.wu(S(), "l").act("arml");
    const fFook = H.fook(S(), "l").act("arml");
    mv("kungfu.sntTanFook", "Parte lenta: tan sao avanza piano, cerchio, wu sao rientra, fook sao avanza", [
      K(SS, 300, 150), K(fTanStart, 500, 100), K(fTan, 2000, 200)].concat(huen(fTan, "l").map((q) => K(q, 200, 0))).concat([
      K(fWu.copy(), 400, 100), K(fWu.copy().set("chest", [-0.01, 1.352, 0]), 1200, 100), K(fFook, 1500, 200), K(fWu.copy(), 1200, 200), K(SS, 400, 300)
    ]));
    const fPakX = el(hd(S(), "l", 0.3, -0.08, 0.2, "open"), "l", 0, -1, 0.6).act("arml");
    const fPalm = H.palm(S(), "l").act("arml");
    mv("kungfu.sntPakPalm", "Pak sao verso il lato opposto, ritorno al centro, colpo di palmo e pugno al fianco", [
      K(SS, 300, 150), K(fWu, 300, 100), K(fPakX, 180, 300), K(fWu.copy(), 250, 100), K(fPalm, 220, 300)].concat(huen(fPalm, "l").map((q) => K(q, 160, 0))).concat([K(SS, 400, 300)])
    );
    // sezione 2: palmi verso il basso ai lati, dietro e davanti, braccia a barra, mani che tagliano, strattone e dita in alto
    const two = (fn) => { const b = S(); fn(b, "l"); fn(b, "r"); return b.act("arml", "armr"); };
    const gumSide = two((b, s) => el(hd(b, s, 0.02, -0.52, sg(s) * 0.24, "blade"), s, -1, 0, sg(s) * 0.5));
    const gumBack = two((b, s) => el(hd(b, s, -0.18, -0.48, sg(s) * 0.12, "blade"), s, -1, 0, sg(s) * 0.5));
    const gumFront = two((b, s) => el(hd(b, s, 0.24, -0.46, sg(s) * 0.07, "blade"), s, 0, -0.5, sg(s)));
    const lan2 = S(); H.lan(lan2, "l", 0, -0.1); H.lan(lan2, "r", 0, -0.2); lan2.act("arml", "armr");
    const fak2 = two((b, s) => el(hd(b, s, 0.36, 0.04, sg(s) * 0.32, "blade"), s, 0, -0.6, sg(s)));
    const jut2 = two((b, s) => el(hd(b, s, 0.32, -0.26, sg(s) * 0.06, "open"), s, 0, -1, sg(s) * 0.3));
    const biu2 = two((b, s) => el(hd(b, s, 0.4, 0.14, sg(s) * 0.06, "blade"), s, 0, -1, sg(s) * 0.3));
    mv("kungfu.sntSec2", "Sezione 2: palmi in basso ai lati, dietro e davanti, braccia a barra, taglio, strattone, dita su", [
      K(SS, 300, 100), K(gumSide, 180, 400), K(gumBack, 200, 400), K(gumFront, 200, 400), K(SS, 300, 100),
      K(lan2, 200, 350), K(fak2, 160, 350), K(lan2.copy(), 200, 200), K(jut2, 140, 300), K(biu2, 160, 400), K(SS, 350, 300)
    ]);
    // sezione 3: catalogo di mani singole e pugni a catena
    const sTan = H.tan(S(), "l").act("arml");
    const sLowPalm = H.palmLow(S(), "l").act("arml");
    const sGaun = H.gaun(S(), "l").act("arml");
    const sBong = H.bong(S(), "l").act("arml");
    const sPalm = H.palm(S(), "l").act("arml");
    mv("kungfu.sntSec3", "Sezione 3: pak e palmo, tan e palmo basso, gaun sao, bong sao, pugni a catena", [
      K(SS, 300, 100), K(fPakX, 180, 200), K(fPalm, 180, 250), K(SS, 250, 100), K(sTan, 250, 200), K(sLowPalm, 180, 250), K(SS, 250, 100),
      K(sGaun, 200, 300), K(SS, 250, 100), K(sBong, 200, 250), K(sTan.copy(), 180, 100), K(sPalm, 180, 250),
      K(ch("r"), 200, 50), K(chMid("l"), 70, 0), K(ch("l").act("arml", "armr"), 70, 30), K(chMid("r"), 70, 0), K(ch("r").act("arml", "armr"), 70, 30), K(chMid("l"), 70, 0), K(ch("l").act("arml", "armr"), 70, 100), K(SS, 350, 300)
    ]);
    mv("kungfu.sntSlowBrief", "Parte lenta abbreviata: tan sao, wu sao e fook sao con il gomito sul centro", [K(SS, 300, 100), K(fTanStart, 400, 50), K(fTan.copy(), 1300, 150), K(fWu.copy(), 900, 100), K(fFook.copy(), 1000, 150), K(SS, 450, 200)]);
    // tenuta del gomito in tan sao
    mv2("kungfu.tanHold", "Tan sao della forma tenuta: palmo in alto, gomito sul centro a un pugno dal petto", "Tan sao della forma con l'altro braccio, gomito sul centro", [K(SS, 300, 200), K(fTanStart, 400, 100), K(fTan, 1200, 2000), K(SS, 500, 300)]);
    const fTanB = fTan.copy().set("chest", [-0.01, 1.365, 0]).set("head", [0, 1.565, 0]).act("torso");
    H.tanForm(fTanB, "l"); H.chamber(fTanB, "r");
    mv("kungfu.tanKeep", "Tiene la tan sao respirando lento, l'altro pugno al fianco del petto", [K(fTan, 300, 600), K(fTanB, 1400, 300), K(fTan.copy(), 1600, 500)]);
    mv("kungfu.tanToFook", "Da tan sao a fook sao e ritorno, piano, senza spostare il gomito", [K(fTan, 300, 300), K(fFook.copy(), 1300, 400), K(fTan.copy(), 1300, 400)]);

    /* =============== 6. mani base dalla guardia (mano sinistra avanti) */
    const tanR = H.wu(H.tan(g.copy(), "r"), "l");
    const tanStart = H.wu(el(hd(g.copy(), "r", 0.14, -0.12, 0, "open"), "r", 0, -1, -0.9), "l");
    mv("kungfu.tan", "Tan sao: palmo in alto, il polso avanza sulla linea centrale, gomito basso", [K(g, 300, 150), K(tanStart, 250, 100), K(tanR.copy().act("armr"), 450, 500), K(g, 300, 300)]);
    mv("kungfu.tanStill", "Tan sao ferma: polso sulla linea all'altezza delle spalle, gomito a un pugno", [K(g, 300, 150), K(tanR.copy().act("armr"), 400, 1600), K(g, 350, 300)]);
    mv("kungfu.tanFast", "Tan sao rapida: la mano scatta avanti e si ferma di colpo nella forma", [K(g, 300, 100), K(tanStart, 200, 50), K(tanR.copy().act("armr"), 130, 350), K(tanStart, 200, 50), K(tanR.copy().act("armr"), 130, 350), K(g, 250, 300)]);
    const tanL = H.wuBy(H.tan(g.copy(), "l"), "r");
    const bongL = H.wuBy(H.bong(g.copy(), "l"), "r");
    const fookL = H.wu(H.fook(g.copy(), "l"), "r");
    mv("kungfu.tanLead", "Tan sao con il braccio avanti, l'altra mano in wu sao vicino al gomito", [K(g, 300, 150), K(tanL.copy().act("arml"), 400, 1400), K(g, 350, 300)]);
    mv("kungfu.bong", "Bong sao: il gomito sale più alto del polso, polso sul centro, spalla bassa", [K(g, 300, 150), K(bongL.copy().act("arml"), 240, 500), K(g, 260, 300)]);
    mv("kungfu.tanBong", "Da tan sao a bong sao e ritorno: il gomito sale, il polso resta sul centro", [K(tanL, 300, 300), K(bongL.copy().act("arml"), 300, 500), K(tanL.copy().act("arml"), 300, 400)]);
    mv2("kungfu.tanBongRoll", "Rotolamento lento da tan sao a bong sao, gomito sempre sul centro", "Rotolamento lento tan-bong con l'altro braccio", [K(tanL, 300, 200), K(bongL.copy().act("arml"), 700, 200), K(tanL.copy().act("arml"), 700, 200), K(bongL.copy().act("arml"), 700, 200), K(tanL.copy().act("arml"), 700, 300)]);
    mv("kungfu.tanBongFook", "Cambi lenti tra tan sao, bong sao e fook sao senza spostare il gomito", [K(tanL, 300, 200), K(bongL.copy().act("arml"), 600, 300), K(fookL.copy().act("arml"), 600, 300), K(tanL.copy().act("arml"), 600, 300)]);
    mv2("kungfu.fook", "Fook sao: polso piegato sopra il braccio dell'altro, gomito verso il centro", "Fook sao con l'altra mano, gomito verso il centro", [K(g, 300, 150), K(fookL.copy().act("arml"), 400, 500), K(g, 300, 300)]);
    const fkBase = (press) => { const b = wcStance(); el(hd(b, "l", 0.36, -0.14, 0.12, "blade"), "l", 0.3, 0, -1); el(hd(b, "r", 0.37, press ? -0.12 : -0.07, 0.06, "blade"), "r", 0, -0.8, press ? -1.2 : -0.3); return b; };
    mv("kungfu.fookPlace", "Avambraccio sinistro orizzontale come braccio dell'altro, fook sao destra sopra", [K(g, 300, 150), K(fkBase(false).act("arml", "armr"), 450, 1200), K(g, 350, 300)]);
    mv2("kungfu.fookCheck", "Fook sao destra sopra l'avambraccio sinistro: il gomito va al centro e chiude", "Fook sao sinistra sopra l'avambraccio destro, gomito al centro", [K(g, 300, 150), K(fkBase(false), 400, 300), K(fkBase(true).act("armr"), 600, 600), K(fkBase(false), 400, 200), K(g, 300, 300)]);
    mv("kungfu.fookHuen", "Fook sao, cerchio del polso (huen sao) e di nuovo fook sao", [K(g, 300, 100), K(fookL.copy().act("arml"), 350, 200)].concat(huen(fookL, "l").map((q) => K(q, 180, 0))).concat([K(fookL.copy().act("arml"), 180, 300), K(g, 300, 300)]));
    mv("kungfu.fookHold", "Tenuta in fook sao con il braccio avanti, spalla bassa", [K(g, 300, 200), K(fookL.copy().act("arml"), 400, 1600), K(g, 300, 300)]);
    mv("kungfu.bongHold", "Tenuta in bong sao: gomito più alto del polso, spalla bassa", [K(g, 300, 200), K(bongL.copy().act("arml"), 300, 1700), K(g, 300, 300)]);
    const pakA = H.pakPrep(g.copy(), "r");
    const pakB = H.pak(g.copy(), "r").act("armr");
    mv2("kungfu.pak", "Pak sao: colpo di palmo corto della mano dietro, si ferma sulla linea centrale", "Pak sao con l'altra mano, dalla guardia opposta", [K(g, 300, 150), K(pakA, 160, 60), K(pakB, 120, 300), K(g, 220, 300)]);
    mv("kungfu.pakFast", "Pak sao secco, ripetuto due volte con ritorno in guardia", [K(g, 300, 100), K(pakA, 120, 20), K(pakB.copy(), 90, 200), K(g, 160, 120), K(pakA, 120, 20), K(pakB.copy(), 90, 200), K(g, 160, 300)]);
    const gaunL = H.wu(H.gaun(g.copy(), "l"), "r");
    mv("kungfu.gaun", "Gaun sao: l'avambraccio taglia in basso e in fuori, l'altra mano resta alta", [K(g, 300, 150), K(gaunL.copy().act("arml"), 240, 400), K(g, 260, 300)]);
    const jumL = H.wu(H.jum(g.copy(), "l"), "r");
    mv("kungfu.jum", "Jum sao: il gomito affonda verso il centro, avambraccio quasi verticale", [K(g, 300, 150), K(jumL.copy().act("arml"), 260, 400), K(g, 260, 300)]);
    const jumP = H.wu(H.punch(g.copy(), "l"), "r").act("arml");
    mv("kungfu.jumPunch", "Jum sao che devia, poi la stessa mano parte in pugno sul centro", [K(g, 300, 150), K(jumL.copy().act("arml"), 240, 250), K(jumP, 170, 300), K(g, 260, 300)]);
    // sequenze
    const tanP = H.wuBy(H.punch(g.copy(), "l"), "r").act("arml");
    mv("kungfu.seqTanBong", "Sequenza: tan sao, bong sao, tan sao e pugno con lo stesso braccio", [K(g, 300, 150), K(tanL.copy().act("arml"), 300, 300), K(bongL.copy().act("arml"), 280, 300), K(tanL.copy().act("arml"), 280, 300), K(tanP, 200, 300), K(g, 300, 300)]);
    mv("kungfu.seqFookHuen", "Sequenza: fook sao, cerchio del polso, tan sao e pugno", [K(g, 300, 150), K(fookL.copy().act("arml"), 300, 200)].concat(huen(fookL, "l").map((q) => K(q, 160, 0))).concat([K(tanL.copy().act("arml"), 250, 300), K(tanP, 200, 300), K(g, 300, 300)]));
    const gPunchL = H.wu(H.punch(g.copy(), "l"), "r").act("arml");
    mv2("kungfu.pakPunch", "Pak sao con la mano dietro, poi pugno con l'altra: due tempi netti", "Pak sao e pugno in due tempi, dall'altra guardia", [K(g, 300, 150), K(pakA, 160, 60), K(pakB.copy(), 120, 250), K(g, 200, 100), K(gPunchL, 180, 300), K(g, 250, 300)]);
    mv("kungfu.handsMix", "Risposta ai comandi: tan, bong, fook e pak, sempre con ritorno in guardia", [
      K(g, 300, 150), K(tanR.copy().act("armr"), 200, 300), K(g, 200, 150), K(bongL.copy().act("arml"), 200, 300), K(g, 200, 150),
      K(fookL.copy().act("arml"), 220, 300), K(g, 200, 150), K(pakA, 140, 20), K(pakB.copy(), 110, 300), K(g, 220, 300)
    ]);

    /* =============== 7. difesa e attacco insieme (lin siu dai da) */
    const pakDa = H.punch(H.pak(g.copy(), "r"), "l").act("arml", "armr");
    mv2("kungfu.pakDa", "Pak da: pak sao e pugno nello stesso istante, il pugno sopra il palmo", "Pak da dall'altra guardia: pak e pugno insieme", [K(g, 300, 150), K(pakA, 160, 40), K(pakDa, 160, 400), K(g, 260, 300)]);
    mv("kungfu.pakDaSlow", "Pak da lento: la mano dietro porta il braccio al centro, il pugno parte insieme", [K(g, 300, 200), K(pakA, 500, 100), K(pakDa.copy(), 900, 700), K(g, 600, 300)]);
    const lapA = H.lapReach(g.copy(), "l");
    mv("kungfu.lapGrab", "La mano avanti afferra l'elastico come un polso: presa corta", [K(g, 300, 150), K(lapA.copy().act("arml"), 350, 200), K(lapA.copy().grip("l", "fist").act("arml"), 150, 1000), K(g, 350, 300)]);
    const lapDa = H.punch(H.lapPull(g.copy(), "l"), "r").act("arml", "armr");
    mv2("kungfu.lapDa", "Lap da: la mano avanti tira in diagonale verso il fianco, l'altra colpisce", "Lap da con l'altra mano: tira verso il fianco e colpisci", [K(g, 300, 150), K(lapA, 200, 80), K(lapDa, 170, 400), K(g, 260, 300)]);
    const tanDa = H.punch(H.tan(g.copy(), "r"), "l", 0, -0.12).act("arml", "armr");
    mv2("kungfu.tanDa", "Tan da: tan sao in avanti e pugno basso dell'altra mano nello stesso istante", "Tan da dall'altro lato: tan sao e pugno basso insieme", [K(g, 300, 150), K(tanStart, 200, 50), K(tanDa, 180, 400), K(g, 260, 300)]);
    mv("kungfu.tanDaSlow", "Tan da lento: tan sao destra e pugno sinistro allo sterno, contando uno", [K(g, 300, 200), K(tanStart, 400, 100), K(tanDa.copy(), 900, 700), K(g, 600, 300)]);
    const jutA = H.wu(el(hd(g.copy(), "l", 0.4, 0.18, 0, "blade"), "l", 0, -0.7, 0.8), "r");
    const jutB = H.wu(el(hd(g.copy(), "l", 0.36, 0.04, 0.02, "open"), "l", 0, -1, 1.2), "r").act("arml");
    const jutDa = H.punch(el(hd(g.copy(), "l", 0.36, 0.04, 0.02, "open"), "l", 0, -1, 1.2), "r").act("arml", "armr");
    mv("kungfu.jutSet", "Fook sao alta appoggiata sull'elastico all'altezza della fronte", [K(g, 300, 150), K(jutA.copy().act("arml"), 450, 1200), K(g, 350, 300)]);
    mv("kungfu.jutOnly", "Strattone breve verso il basso, il gomito scende al centro, poi rilascia", [K(g, 300, 150), K(jutA, 350, 300), K(jutB, 110, 250), K(jutA.copy(), 300, 250), K(jutB.copy(), 110, 250), K(jutA.copy(), 300, 200), K(g, 300, 300)]);
    mv("kungfu.jut", "Jut sao: dalla fook sao alta strattone breve verso il basso, poi pugno", [K(g, 300, 150), K(jutA, 300, 300), K(jutB, 110, 150), K(jutDa, 160, 350), K(g, 260, 300)]);
    mv("kungfu.jutDa", "Jut sao e pugno nello stesso tempo: il gomito scende verso il centro", [K(g, 300, 150), K(jutA, 300, 300), K(jutDa, 140, 400), K(g, 260, 300)]);
    const gaunDa = H.punch(H.gaun(g.copy(), "l"), "r", 0, 0.12).act("arml", "armr");
    mv2("kungfu.gaunDa", "Gaun da: gaun sao in basso e pugno alto dell'altra mano insieme", "Gaun da dall'altro lato", [K(g, 300, 150), K(gaunDa, 220, 400), K(g, 260, 300)]);
    // lap sao drill
    const ld1 = H.wuBy(H.bong(wcStance(), "l"), "r");
    const ld2 = H.punch(H.lapPull(wcStance(), "r"), "l").act("arml", "armr");
    mv("kungfu.lapDrillSet", "Posizione del lap sao drill: bong sao sinistra, wu sao destra vicino al gomito", [K(g, 300, 150), K(ld1.copy().act("arml", "armr"), 400, 1200), K(g, 350, 300)]);
    mv("kungfu.lapDrillT1", "Tempo 1: lap della destra in diagonale e pugno sinistro nello stesso istante", [K(ld1, 300, 300), K(ld2.copy(), 350, 900), K(ld1.copy(), 500, 300)]);
    mv2("kungfu.lapDrill", "Lap sao drill: la destra fa lap sopra la bong sao e la sinistra diventa pugno", "Lap sao drill dall'altro lato", [K(ld1, 300, 200), K(ld2, 220, 250), K(ld1.copy().act("arml", "armr"), 260, 250), K(ld2.copy(), 220, 250), K(ld1.copy().act("arml", "armr"), 260, 300)]);
    // catene
    const pl2 = H.punch(H.lapPull(g.copy(), "l"), "r").act("arml", "armr");
    mv2("kungfu.pakLap", "Catena pak-lap: pak sao con la destra, poi lap sao con la sinistra e pugno", "Catena pak-lap partendo con l'altra mano", [K(g, 300, 150), K(pakA, 150, 30), K(pakB.copy(), 110, 120), K(lapA.copy().set("hand", Object.assign({}, lapA.p.hand, { r: pakB.p.hand.r })), 150, 30), K(pl2, 160, 400), K(g, 260, 300)]);
    mv("kungfu.pakLapSlow", "Catena pak-lap lenta per ricontrollare la forma", [K(g, 300, 150), K(pakA, 350, 60), K(pakB.copy(), 300, 300), K(lapA.copy().set("hand", Object.assign({}, lapA.p.hand, { r: pakB.p.hand.r })), 350, 60), K(pl2.copy(), 400, 600), K(g, 450, 300)]);
    const lp2 = H.punch(H.pak(H.punch(wcStance(), "l"), "r"), "l").act("arml", "armr");
    mv2("kungfu.lapPak", "Catena lap-pak: lap sao e pugno, poi pak sao e pugno con l'altra mano", "Catena lap-pak partendo con l'altra mano", [K(g, 300, 150), K(lapA, 170, 50), K(lapDa.copy(), 160, 250), K(lp2, 170, 400), K(g, 260, 300)]);
    // biu sao
    const late = (b) => el(hd(b, "l", 0.26, -0.1, -0.34, "blade"), "l", 0, -1, -0.6);
    const biu0 = late(H.sternum(wcStance(), "r")).grip("r", "blade");
    const biu1 = late(H.biu(wcStance(), "r")).act("armr");
    mv2("kungfu.biu", "Biu sao: le dita tese scattano dal petto verso il centro, gomito sotto il polso", "Biu sao con l'altra mano, dal petto verso il centro", [K(g, 300, 150), K(biu0, 300, 300), K(biu1, 160, 400), K(g, 300, 300)]);
    const biuP = H.wu(H.punch(wcStance(), "r"), "l").act("armr");
    mv("kungfu.biuPunch", "Biu sao che riprende il centro, poi pugno subito con la stessa mano", [K(g, 300, 150), K(biu0, 300, 200), K(biu1, 150, 250), K(biuP, 160, 300), K(g, 280, 300)]);
    const biuL = H.punch(H.lapPull(wcStance(), "r"), "l").act("arml", "armr");
    mv("kungfu.biuLap", "Biu sao, poi la stessa mano fa lap sao mentre l'altra colpisce", [K(g, 300, 150), K(biu0, 300, 200), K(biu1, 150, 250), K(biuL, 170, 300), K(g, 280, 300)]);

    /* =============== 8. dan chi sau e poon sao (da solo) */
    const dA0 = H.wuBy(H.tan(wcStance(), "l"), "r");
    const dA1 = H.wuBy(H.palmLow(wcStance(), "l"), "r").act("arml");
    const dA2 = H.wuBy(H.bong(wcStance(), "l"), "r").act("arml");
    mv2("kungfu.danA", "Dan chi sau, ruolo A: tan sao, palmo basso, bong sao e di nuovo tan sao", "Dan chi sau, ruolo A con l'altro braccio", [K(dA0, 300, 200), K(dA1, 350, 250), K(dA2, 350, 250), K(dA0.copy().act("arml"), 350, 250)]);
    const dB0 = H.wu(H.fook(wcStance(), "l"), "r");
    const dB1 = H.wu(H.jum(wcStance(), "l"), "r").act("arml");
    const dB2 = H.wu(H.punch(wcStance(), "l"), "r").act("arml");
    mv2("kungfu.danB", "Dan chi sau, ruolo B: fook sao, jum sao, pugno e di nuovo fook sao", "Dan chi sau, ruolo B con l'altro braccio", [K(dB0, 300, 200), K(dB1, 350, 250), K(dB2, 300, 250), K(dB0.copy().act("arml"), 350, 250)]);
    const pn0 = H.fook(H.bong(wcStance(), "l"), "r", 0, -0.02);
    const pn1 = H.fook(H.tan(wcStance(), "l"), "r", 0, -0.1).act("arml", "armr");
    mv2("kungfu.poon", "Poon sao da solo: il sinistro rotola da bong a tan e ritorno, il destro in fook", "Poon sao dall'altro lato: il destro fa bong e tan", [K(pn0, 300, 200), K(pn1, 500, 150), K(pn0.copy().act("arml", "armr"), 500, 150), K(pn1.copy(), 500, 150), K(pn0.copy().act("arml", "armr"), 500, 250)]);
    const pnP = H.fook(H.palm(wcStance(), "l"), "r", 0, -0.1).act("arml");
    mv("kungfu.poonPalm", "Dal rotolamento, dalla tan sao parte un palmo lento sul centro", [K(pn0, 300, 200), K(pn1, 500, 200), K(pnP, 600, 400), K(pn1.copy(), 400, 100), K(pn0.copy(), 450, 250)]);

    /* =============== 9. rotazione della posizione (juen ma) */
    const jL = pivot(g.copy(), 45);
    const jR = pivot(g.copy(), -45);
    mv("kungfu.juenMa", "Juen ma: ruota sui due piedi insieme di 45 gradi, il peso va dietro, poi l'altro lato", [K(g, 300, 200), K(jL.copy().act("legl", "legr", "torso"), 450, 500), K(g, 400, 200), K(jR.copy().act("legl", "legr", "torso"), 450, 500), K(g, 400, 300)]);
    mv("kungfu.juenMaL", "Juen ma a sinistra: ruota di 45 gradi sui due piedi, il peso va sulla gamba destra", [K(g, 300, 200), K(jL.copy().act("legl", "legr", "torso"), 500, 1000), K(g, 450, 300)]);
    mv("kungfu.juenMaFast", "Juen ma veloci a destra e a sinistra, testa ferma e mani in guardia", [K(g, 300, 100), K(jL.copy().act("legl", "legr", "torso"), 250, 150), K(jR.copy().act("legl", "legr", "torso"), 350, 150), K(jL.copy().act("legl", "legr", "torso"), 350, 150), K(g, 260, 200)]);
    const jLp = H.wu(H.punch(jL.copy(), "l", 45), "r", 45).act("arml", "legl", "legr");
    const jRp = H.wu(H.punch(jR.copy(), "r", -45), "l", -45).act("armr", "legl", "legr");
    mv("kungfu.juenMaPunch", "Juen ma con un pugno verticale al termine di ogni rotazione", [K(g, 300, 200), K(jL, 400, 100), K(jLp, 180, 400), K(g, 400, 200), K(jR, 400, 100), K(jRp, 180, 400), K(g, 400, 300)]);
    const lanS = S(); H.lan(lanS, "l", 0, -0.1); H.lan(lanS, "r", 0, -0.2);
    const lanL = pivot(lanS.copy(), 45);
    const lanR = pivot(lanS.copy(), -45);
    mv("kungfu.juenMaLan", "Juen ma con le braccia in lan sao: le braccia girano con il busto", [K(lanS, 300, 150), K(lanL.copy().act("legl", "legr", "torso"), 280, 150), K(lanR.copy().act("legl", "legr", "torso"), 380, 150), K(lanL.copy().act("legl", "legr", "torso"), 380, 150), K(lanS, 280, 250)]);
    const hp0 = wcStance().handPel("l", 0.02, 0.05, -0.17, "open").handPel("r", 0.02, 0.05, 0.17, "open");
    const hpL = pivot(hp0.copy(), 40, 0.03);
    const hpR = pivot(hp0.copy(), -40, 0.03);
    hpL.handPel("l", 0.02, 0.05, -0.17, "open").handPel("r", 0.02, 0.05, 0.17, "open");
    hpR.handPel("l", 0.02, 0.05, -0.17, "open").handPel("r", 0.02, 0.05, 0.17, "open");
    mv("kungfu.heelPivot", "Rotazioni lente sui talloni con le mani sui fianchi", [K(hp0, 300, 150), K(hpL.act("legl", "legr"), 600, 250), K(hp0, 500, 100), K(hpR.act("legl", "legr"), 600, 250), K(hp0, 500, 200)]);

    /* =============== 10. passi nella posizione girata */
    const t = T();
    const tR = T("r");
    const st1 = (b, d = 0.15) => b.copy().step("l", d).shift(d * 0.35).act("legl");
    const st2 = (b, d = 0.15) => b.copy().move(d).act("legr");
    const bk1 = (b, d = 0.15) => b.copy().step("r", -d).shift(-d * 0.35).act("legr");
    const bk2 = (b, d = 0.15) => b.copy().move(-d).act("legl");
    const t1 = t.copy().move(0.15);
    const t2 = t.copy().move(0.3);
    mv("kungfu.turnedStance", "Posizione girata: sinistro avanti, peso sulla gamba dietro, mani sul centro", [K(g, 300, 200), K(t.copy().act("legl", "legr", "torso"), 500, 900)]);
    mv("kungfu.seungMa1", "Mezzo passo avanti: il piede avanti sfiora il pavimento, il dietro spinge e segue", [K(t, 300, 200), K(st1(t), 250, 100), K(st2(t), 220, 500), K(bk1(t1), 250, 100), K(bk2(t1), 220, 300)]);
    mv("kungfu.toiMa", "Toi ma: il piede dietro arretra per primo e l'avanti segue, poi si torna avanti", [
      K(t, 300, 150), K(bk1(t), 220, 60), K(bk2(t), 200, 200), K(bk1(t.copy().move(-0.15)), 220, 60), K(bk2(t.copy().move(-0.15)), 200, 300),
      K(st1(t.copy().move(-0.3)), 220, 60), K(st2(t.copy().move(-0.3)), 200, 150), K(st1(t.copy().move(-0.15)), 220, 60), K(st2(t.copy().move(-0.15)), 200, 300)
    ]);
    mv2("kungfu.seungMa", "Seung ma e toi ma: due passi avanti, il dietro segue; due indietro, l'avanti segue", "Seung ma e toi ma con il destro avanti", [
      K(t, 300, 150), K(st1(t), 220, 60), K(st2(t), 200, 200), K(st1(t1), 220, 60), K(st2(t1), 200, 300),
      K(bk1(t2), 220, 60), K(bk2(t2), 200, 200), K(bk1(t1), 220, 60), K(bk2(t1), 200, 300)
    ]);
    const tp = (b, s) => H.wu(H.punch(b, s), ot(s));
    const stp = (b, s, d = 0.15) => tp(st1(b, d), s).act("legl", "arm" + s);
    mv("kungfu.seungMaPunch", "Passo avanti con il pugno che arriva insieme al piede anteriore", [
      K(t, 300, 150), K(stp(t, "l"), 220, 150), K(st2(t), 220, 200), K(stp(t1, "r"), 220, 150), K(st2(t1), 220, 300),
      K(bk1(t2), 220, 60), K(bk2(t2), 200, 150), K(bk1(t1), 220, 60), K(bk2(t1), 200, 300)
    ]);
    const bkPak = (b) => H.pak(bk1(b), "r").act("legr", "armr");
    mv("kungfu.stepPunchPak", "Pugno sul passo avanti, pak sao sul passo indietro", [
      K(t, 300, 150), K(stp(t, "l"), 220, 150), K(st2(t), 220, 250), K(bkPak(t1), 220, 150), K(bk2(t1), 220, 300)
    ]);
    const tMid = wcStance(); guard(tMid, "l");
    mv("kungfu.switchLead", "Cambio di lato con una juen ma: dal sinistro avanti al destro avanti", [K(t, 300, 200), K(tMid.copy().act("legl", "legr", "torso"), 300, 50), K(tR.copy().act("legl", "legr", "torso"), 300, 500), K(tMid.copy(), 300, 50), K(t.copy().act("legl", "legr", "torso"), 300, 300)]);
    // passi con il pugno a catena
    const tch = (b, s) => { const q = b.copy(); H.punch(q, s); el(hd(q, ot(s), 0.24, -0.02, 0, "fist"), ot(s), 0, -1, -sg(ot(s)) * 0.4); return q.act("arml", "armr"); };
    const chainStep = (b, d, n = 3) => { const fr = []; for (let i = 0; i < n; i += 1) { const s = i % 2 ? "l" : "r"; const last = i === n - 1; fr.push(K(last ? tch(st1(b, d), s).act("arml", "armr", "legl") : tch(b, s), 110, 40)); } fr.push(K(tch(st2(b, d), n % 2 ? "r" : "l"), 160, 60)); return fr; };
    mv("kungfu.stepChain", "Avanza con seung ma: tre pugni a catena per passo, l'ultimo con il piede", [K(t, 300, 150)].concat(chainStep(t, 0.15), chainStep(t1, 0.15), [K(bk1(t2), 220, 60), K(bk2(t2), 200, 100), K(bk1(t1), 220, 60), K(bk2(t1), 200, 300)]));
    const pakDaT = (b) => H.punch(H.pak(b, "r"), "l").act("arml", "armr", "legl");
    mv2("kungfu.pakDaStep", "Pak da con un passo avanti: palmo, pugno e piede arrivano insieme", "Pak da con passo avanti dall'altra guardia", [K(t, 300, 150), K(H.pakPrep(t.copy(), "r"), 150, 30), K(pakDaT(st1(t)), 200, 200), K(st2(t), 220, 250), K(bk1(t1), 220, 60), K(bk2(t1), 200, 300)]);
    const tanDaT = (b) => H.punch(H.tan(b, "r"), "l", 0, -0.12).act("arml", "armr", "legl");
    mv2("kungfu.tanDaStep", "Tan da con mezzo passo avanti: tan sao, pugno e piede insieme", "Tan da con passo avanti dall'altra guardia", [K(t, 300, 150), K(tanDaT(st1(t, 0.1)), 220, 200), K(st2(t, 0.1), 220, 250), K(bk1(t.copy().move(0.1), 0.1), 220, 60), K(bk2(t.copy().move(0.1), 0.1), 200, 300)]);
    // entrata e pressione
    const far = t.copy().move(-0.15);
    mv("kungfu.farGuard", "In guardia a distanza lunga, fuori dalla portata delle mani", [K(t, 300, 150), K(bk1(t), 250, 60), K(far.copy().act("legl"), 220, 1000)]);
    mv("kungfu.stepOut", "Esce a distanza con un passo indietro in guardia, poi rientra", [K(t, 300, 150), K(bk1(t), 220, 60), K(far.copy().act("legl"), 200, 700), K(st1(far), 220, 60), K(t, 200, 300)]);
    mv2("kungfu.entry", "Entrata: passo con pak da, poi passi continui con il pugno a catena", "Entrata dall'altra guardia: pak da e pugno a catena", [K(far, 300, 150), K(H.pakPrep(far.copy(), "r"), 140, 20), K(pakDaT(st1(far)), 190, 60), K(st2(far), 160, 40)].concat(chainStep(t, 0.15, 4), chainStep(t1, 0.15, 4), [K(t2.copy(), 250, 200), K(bk1(t2, 0.22), 220, 60), K(bk2(t2, 0.22), 200, 60), K(bk1(t.copy().move(0.08), 0.23), 220, 60), K(far.copy(), 220, 300)]));
    const pakLapT = (b) => H.punch(H.lapPull(b, "l"), "r").act("arml", "armr");
    mv2("kungfu.pakLapStep", "Passo avanti con pak sao, lap sao e pugno, poi raffica da 3 e uscita", "Pak-lap-pugno in movimento dall'altra guardia", [
      K(far, 300, 150), K(H.pakPrep(far.copy(), "r"), 140, 20), K(H.pak(st1(far), "r").act("armr", "legl"), 180, 60), K(st2(far), 150, 20),
      K(H.lapReach(t.copy(), "l").set("hand", Object.assign({}, t.p.hand, { l: H.lapReach(t.copy(), "l").p.hand.l, r: H.pak(t.copy(), "r").p.hand.r })), 140, 20), K(pakLapT(t.copy()), 160, 80),
      K(tch(t, "l"), 90, 30), K(tch(t, "r"), 90, 30), K(tch(t, "l"), 90, 100), K(bk1(t), 220, 60), K(far.copy(), 200, 300)
    ]);
    // passo d'angolo
    const ang1 = t.copy().step("l", 0.2, -0.2).shift(0.08, -0.08).act("legl");
    const ang2 = t.copy().move(0.2, -0.2).spin(-15);
    const angHit = H.punch(H.pak(ang2.copy(), "r", -15), "l", -15).act("arml", "armr", "legr");
    mv("kungfu.angleOnly", "Passo d'angolo: piede avanti in diagonale, il dietro segue e ti rigiri al bersaglio", [K(t, 300, 150), K(ang1, 300, 150), K(ang2.copy().act("legr", "torso"), 300, 700), K(t, 450, 300)]);
    mv2("kungfu.angleStep", "Passo d'angolo: diagonale avanti, il dietro segue, ti rigiri e fai pak da", "Passo d'angolo dall'altro lato con pak da", [K(t, 300, 150), K(ang1, 220, 60), K(angHit, 220, 400), K(ang2.copy(), 250, 150), K(t, 400, 300)]);
    const angLap1 = H.lapReach(H.pak(ang2.copy(), "r", -15), "l", -15).act("armr", "legr");
    const angLap2 = H.punch(H.lapPull(ang2.copy(), "l", -15), "r", -15).act("arml", "armr");
    mv2("kungfu.angleStepLap", "Passo d'angolo con la catena pak-lap all'arrivo", "Passo d'angolo dall'altro lato con pak-lap", [K(t, 300, 150), K(ang1, 220, 60), K(angLap1, 200, 60), K(angLap2, 170, 400), K(ang2.copy(), 250, 150), K(t, 400, 300)]);
    mv("kungfu.angleStepTanDa", "Passo d'angolo con tan da all'arrivo", [K(t, 300, 150), K(ang1, 220, 60), K(H.punch(H.tan(ang2.copy(), "r", -15), "l", -15, -0.12).act("arml", "armr", "legr"), 220, 400), K(ang2.copy(), 250, 150), K(t, 400, 300)]);

    /* =============== 11. bong-lap in rotazione */
    const bl0 = H.wu(H.man(g.copy(), "l"), "r");
    const bl1 = pivot(H.wuBy(H.bong(wcStance(), "l"), "r"), 45).act("arml", "legl", "legr");
    const bl2 = H.punch(H.lapPull(wcStance(), "r"), "l").act("arml", "armr", "legl", "legr");
    mv("kungfu.bongTurn", "Juen ma verso il braccio avanti: il braccio rotola in bong sao, wu sao vicino al gomito", [K(bl0, 300, 200), K(bl1, 400, 1000), K(g, 400, 300)]);
    mv2("kungfu.bongLapTurn", "Bong-lap in rotazione: juen ma con bong sao, poi torna frontale con lap e pugno", "Bong-lap in rotazione dall'altro lato", [K(bl0, 300, 200), K(bl1, 300, 350), K(bl2, 260, 400), K(g, 300, 300)]);
    mv2("kungfu.bongLapChain", "Bong sao in rotazione, lap e pugno, poi altri due pugni a catena", "Bong-lap e catena dall'altro lato", [K(bl0, 300, 150), K(bl1, 280, 250), K(bl2, 220, 80), K(ch("r").act("arml", "armr"), 90, 40), K(ch("l").act("arml", "armr"), 90, 150), K(g, 300, 300)]);

    /* =============== 12. calci */
    // ginocchio alto dalla posizione frontale
    const kh = (s) => {
      const b = g.copy();
      b.set("pel", [-0.03, 0.85, 0.1]).set("chest", [-0.01, 1.35, 0.08]).set("head", [0, 1.55, 0.07]);
      b.footAt("l", [0.27, 0.47, 0.02], 0, -15).knee("l", [1, 0.8, 0]).knee("r", [1, 0, -0.35]);
      guard(b, "l");
      b.act("legl");
      return s === "l" ? b : b.mirror();
    };
    mv("kungfu.kneeHold", "Ginocchio alto sul centro, gamba d'appoggio piegata, mani in guardia", [K(g, 300, 150), K(kh("l"), 450, 1300), K(g, 400, 200), K(G("r"), 300, 150), K(kh("r"), 450, 1300), K(G("r"), 400, 200), K(g, 300, 200)]);
    mv2("kungfu.kneeUp", "Ginocchio alto sul centro, punta tirata verso di sé, mani in guardia", "Ginocchio alto sul centro con l'altra gamba", [K(g, 300, 150), K(kh("l"), 450, 1500), K(g, 400, 300)]);
    mv("kungfu.kneeStep", "Ginocchio alto, poi appoggia il piede avanti dove finirebbe il calcio", [K(g, 300, 150), K(kh("l"), 450, 900), K(t.copy().move(0.12).act("legl"), 350, 500), K(g, 400, 300)]);
    mv("kungfu.kneeReps", "Solleva e abbassa il ginocchio lentamente senza appoggiare il piede", [K(g, 300, 150), K(kh("l"), 500, 200), K(kh("l").footAt("l", [0.12, 0.22, -0.02], 0, -5).knee("l", [1, 0.3, 0]), 500, 100), K(kh("l"), 500, 200), K(kh("l").footAt("l", [0.12, 0.22, -0.02], 0, -5).knee("l", [1, 0.3, 0]), 500, 100), K(kh("l"), 500, 200), K(g, 400, 300)]);
    // calci dalla posizione girata: gamba anteriore (sinistra)
    const kBase = () => { const b = t.copy(); b.set("pel", [-0.16, 0.84, 0.07]).set("hipYaw", -20).set("chestYaw", -15).set("chest", [-0.15, 1.34, 0.06]).set("head", [-0.13, 1.54, 0.05]).look(12); b.knee("r", [1, 0, -0.4]); return b; };
    const kCh = guard(kBase().footAt("l", [0.17, 0.46, 0.0], -5, -30).knee("l", [1, 0.8, 0]), "l").act("legl");
    const kEx = (h = 0.85, x = 0.62) => guard(kBase().footAt("l", [x, h, 0.0], -5, -65).knee("l", [0.2, 1, 0]), "l").act("legl");
    const kLand = t.copy().move(0.14).act("legl");
    mv("kungfu.kickChamber", "Solleva il ginocchio anteriore sul centro, punta del piede verso l'alto", [K(t, 300, 150), K(kCh, 400, 1100), K(t, 400, 300)]);
    mv("kungfu.kickPush", "Il tallone spinge dritto avanti all'altezza del bacino, ginocchio non bloccato", [K(t, 300, 150), K(kCh, 300, 150), K(kEx(), 350, 900), K(kCh.copy(), 300, 150), K(t, 350, 300)]);
    mv("kungfu.kickLand", "Richiama il ginocchio e appoggia il piede avanti, pronto con le mani", [K(t, 300, 150), K(kEx(), 350, 300), K(kCh.copy(), 300, 200), K(kLand, 350, 800), K(t, 450, 300)]);
    mv("kungfu.frontKick", "Calcio frontale col tallone: ginocchio sul centro, il tallone spinge dritto", [K(t, 300, 150), K(kCh, 220, 80), K(kEx(), 170, 300), K(kCh.copy(), 180, 80), K(kLand, 250, 300), K(t, 400, 300)]);
    mv("kungfu.frontKickSlow", "Calcio frontale in quattro tempi: ginocchio, tallone, richiamo, appoggio", [K(t, 300, 200), K(kCh, 500, 600), K(kEx(), 500, 700), K(kCh.copy(), 500, 600), K(kLand, 450, 600), K(t, 450, 300)]);
    mv2("kungfu.frontKickAir", "Calci frontali lenti senza appoggiare il piede tra uno e l'altro", "Calci frontali lenti con l'altra gamba, senza appoggiare", [K(t, 300, 150), K(kCh, 400, 200), K(kEx(), 450, 300), K(kCh.copy(), 400, 200), K(kEx(), 450, 300), K(kCh.copy(), 400, 200), K(t, 400, 300)]);
    // calcio laterale basso
    const sBase = () => { const b = kBase(); b.set("hipYaw", -55).set("chestYaw", -38).look(36); return b; };
    const sCh = guard(sBase().footAt("l", [0.1, 0.5, -0.05], -75, 15).knee("l", [0.6, 0.6, -0.6]), "l").act("legl");
    const sEx = (h = 0.45) => guard(sBase().footAt("l", [0.6, h, 0.02], -75, 5).knee("l", [0, 0.6, -1]), "l").act("legl");
    mv("kungfu.sideChamber", "Ginocchio anteriore su e piede girato di lato, il tallone verso il bersaglio", [K(t, 300, 150), K(sCh, 400, 1100), K(t, 400, 300)]);
    mv("kungfu.sideKick", "Calcio laterale basso: ginocchio su, piede girato, il tallone spinge al ginocchio", [K(t, 300, 150), K(sCh, 220, 80), K(sEx(), 170, 300), K(sCh.copy(), 180, 80), K(t, 300, 300)]);
    mv("kungfu.sideKickSlow", "Calcio laterale basso in quattro tempi, appoggio piegato e mani in guardia", [K(t, 300, 200), K(sCh, 500, 600), K(sEx(), 500, 700), K(sCh.copy(), 500, 600), K(t, 450, 400)]);
    // al sacco: calcio basso, appoggio avanti e mani
    const farK = t.copy().move(-0.22);
    const kChF = kCh.copy().move(-0.22);
    const kExF = kEx(0.55, 0.62).move(-0.22);
    const kLandF = t.copy().move(-0.06).act("legl");
    const chainAt = (b, n) => { const fr = []; for (let i = 0; i < n; i += 1) fr.push(K(tch(b, i % 2 ? "l" : "r"), 90, 40)); return fr; };
    mv("kungfu.padKickFront", "Calcio frontale basso al sacco, appoggio avanti e pugni a catena", [K(farK, 300, 150), K(kChF, 220, 60), K(kExF, 170, 250), K(kChF.copy(), 170, 40), K(kLandF, 220, 40)].concat(chainAt(t.copy().move(-0.06), 4), [K(farK.copy(), 400, 300)]), padP);
    const sChF = sCh.copy().move(-0.22);
    const sExF = sEx(0.45).move(-0.22);
    mv("kungfu.padKickSide", "Calcio laterale basso al sacco, appoggio e pak da", [K(farK, 300, 150), K(sChF, 220, 60), K(sExF, 170, 250), K(sChF.copy(), 170, 40), K(kLandF, 220, 40), K(pakDaT(t.copy().move(-0.06)), 170, 350), K(farK.copy(), 400, 300)], padP);
    const padFar = t.copy().move(-0.14);
    mv("kungfu.padFar", "In guardia fuori distanza davanti al sacco", [K(t, 300, 150), K(bk1(t, 0.22), 250, 60), K(farK.copy(), 220, 1000)], padP);
    mv("kungfu.padDistance", "Distanza: il pugno tocca il cuscino quando il braccio è ancora piegato", [K(SS, 300, 200), K(p1("l"), 400, 100), K(p2("l").act("arml"), 900, 1200), K(SS, 500, 300)], padP);
    const pA0 = t.copy().move(-0.24, 0.2);
    const pA1 = pA0.copy().step("l", 0.2, -0.2).shift(0.08, -0.08).act("legl");
    const pA2 = t.copy().move(-0.04, 0);
    mv("kungfu.padAngle", "Entrata d'angolo verso il sacco con pak da all'appoggio, poi uscita", [K(pA0, 300, 150), K(pA1, 220, 60), K(pakDaT(pA2.copy()).act("arml", "armr", "legr"), 220, 350), K(tch(pA2, "r"), 100, 40), K(tch(pA2, "l"), 100, 150), K(bk1(pA2, 0.2), 220, 60), K(pA0.copy(), 300, 300)], padP);
    mv("kungfu.padStepChain", "Passo avanti verso il cuscino e raffica di pugni a catena", [K(padFar, 300, 150)].concat(chainStep(padFar, 0.14, 3), chainAt(t, 6), [K(bk1(t, 0.14), 220, 60), K(padFar.copy(), 200, 300)]), padP);
    mv("kungfu.padEntry", "Entrata da fuori distanza con pak da e pugno a catena, poi uscita", [K(padFar.copy().move(-0.1), 300, 150), K(pakDaT(st1(padFar.copy().move(-0.1), 0.24)), 220, 60), K(st2(padFar.copy().move(-0.1), 0.24), 160, 40)].concat(chainAt(t, 6), [K(bk1(t, 0.24), 220, 60), K(padFar.copy().move(-0.1), 220, 300)]), padP);
    // mobilita' d'anca
    const hp = (ank, kp, pitch = 10) => standing().footAt("l", ank, 0, pitch).knee("l", kp).handPel("l", 0.02, 0.05, -0.17, "open").handW("r", 0.05, 1.1, 0.42, "open").act("legl");
    mv("kungfu.hipOpen", "Cerchio d'anca: ginocchio alto davanti, poi si apre di lato e si richiude", [K(standing(), 300, 150), K(hp([0.28, 0.5, -0.1], [1, 0.8, 0]), 400, 150), K(hp([0.1, 0.52, -0.38], [0.3, 0.8, -1]), 450, 200), K(hp([0.28, 0.5, -0.1], [1, 0.8, 0]), 450, 150), K(standing(), 400, 300)]);
    const lsr = standing().footAt("l", [0.02, 0.4, -0.66], 0, 0, 0).knee("l", [0.4, 0.3, 0]).lean(0, 0.06).handW("r", 0.05, 1.1, 0.42, "open").act("legl");
    mv("kungfu.legSideRaise", "Gamba tesa sollevata di lato fino a metà altezza, lenta", [K(standing(), 300, 150), K(lsr, 700, 400), K(standing(), 600, 150), K(lsr.copy(), 700, 400), K(standing(), 600, 200)]);
    const sch = standing().footAt("l", [0.1, 0.55, -0.32], 0, 10).knee("l", [0.4, 0.6, -1]).handPel("l", 0.02, 0.05, -0.17, "open").handW("r", 0.05, 1.1, 0.42, "open").act("legl");
    mv("kungfu.sideChamberHold", "Ginocchio piegato sollevato di lato come per caricare il calcio, tieni", [K(standing(), 300, 150), K(sch, 500, 1800), K(standing(), 450, 300)]);

    /* =============== 13. Chum Kiu */
    mv("kungfu.ckLanTurn", "Rotazioni con le braccia in lan sao: le braccia girano insieme al busto", [K(lanS, 300, 200), K(lanL.copy().act("legl", "legr", "torso"), 450, 350), K(lanR.copy().act("legl", "legr", "torso"), 600, 350), K(lanL.copy().act("legl", "legr", "torso"), 600, 350), K(lanS, 450, 300)]);
    const ckPalm = pivot(H.palm(S(), "l"), 0).act("arml", "legl", "legr");
    mv("kungfu.ckSec1", "Chum Kiu, sezione 1: lan sao e rotazioni, poi palmo tornando frontale", [
      K(SS, 250, 100), K(lanS.copy().act("arml", "armr"), 300, 200), K(lanL.copy().act("legl", "legr", "torso"), 400, 250), K(lanR.copy().act("legl", "legr", "torso"), 500, 250),
      K(lanL.copy().act("legl", "legr", "torso"), 500, 250), K(ckPalm, 280, 300), K(SS, 350, 250)
    ]);
    const fkCh = (() => { const b = S(); b.set("pel", [-0.03, 0.85, 0.09]).set("chest", [-0.01, 1.35, 0.08]).set("head", [0, 1.55, 0.07]); b.footAt("l", [0.26, 0.5, 0.0], 0, -25).knee("l", [1, 0.8, 0]).knee("r", [1, 0, -0.35]); H.chamber(b, "l"); H.chamber(b, "r"); return b.act("legl"); })();
    const fkEx = fkCh.copy().footAt("l", [0.66, 0.85, 0.0], 0, -65).knee("l", [0.2, 1, 0]).act("legl");
    H.chamber(fkEx, "l"); H.chamber(fkEx, "r");
    const tb = (b) => H.wuBy(H.bong(b, "l"), "r");
    mv("kungfu.ckSec2", "Chum Kiu, sezione 2: calcio frontale, passi avanti con bong sao, lap e pugno", [
      K(SS, 250, 100), K(fkCh, 280, 80), K(fkEx, 180, 250), K(fkCh.copy(), 200, 80), K(tb(t.copy()).act("legl"), 280, 150),
      K(tb(st1(t)).act("legl", "arml"), 220, 60), K(tb(st2(t)), 200, 150), K(tb(st1(t1)).act("legl", "arml"), 220, 60), K(tb(st2(t1)), 200, 150),
      K(H.punch(H.lapPull(t2.copy(), "r"), "l").act("arml", "armr"), 220, 300), K(SS, 500, 250)
    ]);
    const g2 = (b) => { H.gaun(b, "l"); H.gaun(b, "r"); return b; };
    const scK = sCh.copy(); H.chamber(scK, "l"); H.chamber(scK, "r");
    const seK = sEx(); H.chamber(seK, "l"); H.chamber(seK, "r");
    const b2 = (b) => { H.bong(b, "l"); H.bong(b, "r"); el(hd(b, "r", 0.3, -0.16, 0, "blade"), "r", 0.3, 0.8, 1); return b; };
    mv("kungfu.ckSec3", "Chum Kiu, sezione 3: calcio laterale basso, passo con gaun sao doppia, bong doppia", [
      K(SS, 250, 100), K(t.copy(), 300, 80), K(scK, 240, 60), K(seK, 180, 250), K(scK.copy(), 200, 60), K(g2(st1(t)).act("legl", "arml", "armr"), 260, 250), K(g2(st2(t)), 200, 120),
      K(b2(t1.copy()).act("arml", "armr"), 240, 250), K(pivot(lanS.copy(), 45).act("legl", "legr", "torso"), 400, 250), K(SS, 450, 250)
    ]);

    /* =============== 14. condizionamento */
    const pk = plank().footAt("l", [-1.1, L.ankleY(62), -0.15], 0, 62).footAt("r", [-1.1, L.ankleY(62), 0.15], 0, 62);
    const pkP = (s) => { const b = pk.copy(); b.hand(s, [0.68, 0.56, sg(s) * 0.04], "fist").elbow(s, [0, -1, 0]); return b.act("arm" + s, "torso"); };
    mv("kungfu.plankPunch", "Plank sulle mani con pugni verticali lenti alternati, bacino fermo", [K(pk, 300, 200), K(pkP("r"), 500, 300), K(pk, 400, 150), K(pkP("l"), 500, 300), K(pk, 400, 200)]);
    mv("kungfu.plankElbows", "Plank fermo sui gomiti, corpo dritto", [K(plank({ forearms: true }).act("torso"), 400, 1500)]);
    const pc0 = plank().handW("l", 0.2, 0.04, -0.14, "open").handW("r", 0.2, 0.04, 0.14, "open").elbow("l", [-1, 0, -0.15]).elbow("r", [-1, 0, 0.15]);
    const pc1 = pushDown().handW("l", 0.2, 0.04, -0.14, "open").handW("r", 0.2, 0.04, 0.14, "open").elbow("l", [-1, 0.5, -0.15]).elbow("r", [-1, 0.5, 0.15]).act("arml", "armr");
    mv("kungfu.pushupClose", "Flessione a gomiti stretti: i gomiti sfiorano i fianchi", [K(pc0, 300, 200), K(pc1, 600, 150), K(pc0, 450, 200), K(pc1.copy(), 600, 150), K(pc0, 450, 300)]);
    const iso = (fn) => { const b = g.copy().lean(0.03); fn(b); return b; };
    mv("kungfu.tanIso", "Tan sao isometrica: il polso spinge in avanti contro lo stipite, gomito basso", [K(g, 300, 200), K(iso((b) => { H.tan(b, "r"); H.wu(b, "l"); }).act("armr"), 400, 1800), K(g, 400, 300)]);
    mv("kungfu.bongIso", "Bong sao isometrica: l'avambraccio spinge senza alzare la spalla", [K(g, 300, 200), K(iso((b) => { H.bong(b, "l"); H.wuBy(b, "r"); }).act("arml"), 400, 1800), K(g, 400, 300)]);
    const wall0 = standing().foot("l", 0, -0.1, 0, 0).foot("r", 0, 0.1, 0, 0).handRel("l", 0.1, -0.45, -0.2, "open").handRel("r", 0.1, -0.45, 0.2, "open");
    const wallLean = (fn) => { const b = wall0.copy().set("pel", [0.05, 0.94, 0]).set("chest", [0.16, 1.42, 0]).set("head", [0.21, 1.61, 0]); fn(b); return b.act("arm" + (b.p.grip.r === "open" ? "r" : "l")); };
    const wTan = wallLean((b) => { H.tan(b, "r"); });
    const wBong = wallLean((b) => { H.bong(b, "r"); b.handRel("l", 0.1, -0.45, -0.2, "open"); });
    mv("kungfu.tanWallSet", "A un passo dal muro: polso in tan sao all'altezza delle spalle, gomito vicino", [K(wall0, 300, 200), K(H.tan(wall0.copy(), "r").act("armr"), 450, 1200), K(wall0, 400, 300)]);
    mv2("kungfu.tanWall", "Tan sao al muro: inclinato in avanti dalle caviglie, l'angolo del gomito non cambia", "Tan sao al muro con l'altro braccio, inclinato dalle caviglie", [K(wall0, 300, 200), K(H.tan(wall0.copy(), "r"), 400, 200), K(wTan, 600, 1500), K(wall0, 500, 300)]);
    mv("kungfu.bongWall", "Bong sao al muro: il peso sull'avambraccio, la spalla non sale", [K(wall0, 300, 200), K(H.bong(wall0.copy(), "r"), 400, 200), K(wBong.act("armr"), 600, 1500), K(wall0, 500, 300)]);
    const pal = (tw) => { const b = SS.copy().twist(tw); el(hd(b, "l", 0.5, -0.12, 0.03, "open"), "l", 0, -1, 0.3); el(hd(b, "r", 0.5, -0.12, -0.03, "open"), "r", 0, -1, -0.3); return b; };
    mv("kungfu.antiRotation", "Tenuta anti-rotazione: braccia tese avanti sul centro, il busto non gira", [K(SS, 300, 150), K(pal(0).act("arml", "armr", "torso"), 450, 1700), K(SS, 400, 300)]);

    /* =============== 15. riscaldamento */
    const hu0 = S();
    const hu1 = el(hd(S(), "l", 0.42, -0.1, 0, "open"), "l", 0, -1, 0.3);
    const hu2 = el(hd(S(), "r", 0.42, -0.1, 0, "open"), "r", 0, -1, -0.3);
    mv("kungfu.huenSao", "Cerchi della mano attorno al polso (huen sao), prima una mano poi l'altra", [K(hu0, 300, 100), K(hu1, 300, 50)].concat(huen(hu1, "l").map((q) => K(q, 170, 0)), huen(hu1, "l").map((q) => K(q, 170, 0)), [K(hu0, 300, 100), K(hu2, 300, 50)], huen(hu2, "r").map((q) => K(q, 170, 0)), huen(hu2, "r").map((q) => K(q, 170, 0)), [K(hu0, 300, 200)]));
    const fr = (pole, gr) => { const b = standing(); b.handRel("l", 0.5, -0.05, -0.12, gr).handRel("r", 0.5, -0.05, 0.12, gr).elbow("l", [0, pole, -1]).elbow("r", [0, pole, 1]); return b.act("arml", "armr"); };
    mv("kungfu.forearmRoll", "Braccia tese avanti: rotazioni palmo su e palmo giù", [K(standing(), 300, 100), K(fr(-1, "open"), 400, 200), K(fr(0.3, "blade"), 300, 200), K(fr(-1, "open"), 300, 200), K(fr(0.3, "blade"), 300, 200), K(fr(-1, "open"), 300, 200), K(standing(), 350, 200)]);
    const sr = (o) => { const b = standing(); b.handRel("l", 0.26 - o * 0.14, -0.34, -0.18 - o * 0.26, "fist").handRel("r", 0.26 - o * 0.14, -0.34, 0.18 + o * 0.26, "fist").elbow("l", [-0.2, -1, -0.1]).elbow("r", [-0.2, -1, 0.1]); return b.act("arml", "armr"); };
    mv("kungfu.shoulderRot", "Gomiti a 90 gradi vicino ai fianchi: rotazioni delle spalle in fuori e in dentro", [K(standing(), 300, 100), K(sr(0), 300, 150), K(sr(1), 350, 150), K(sr(0), 350, 150), K(sr(1), 350, 150), K(sr(0), 350, 150), K(standing(), 300, 200)]);
    const co = (o) => { const b = standing(); b.handRel("l", 0.32 - o * 0.3, -0.06, -0.1 - o * 0.3, "fist").handRel("r", 0.32 - o * 0.3, -0.06, 0.1 + o * 0.3, "fist").elbow("l", [0, -0.2, -1]).elbow("r", [0, -0.2, 1]); return b.act("arml", "armr"); };
    mv("kungfu.chestOpen", "Apertura del petto a braccia piegate: i gomiti vanno indietro", [K(standing(), 300, 100), K(co(0), 300, 150), K(co(1), 350, 200), K(co(0), 350, 150), K(co(1), 350, 200), K(co(0), 350, 150), K(standing(), 300, 200)]);
    mv("kungfu.halfSquat", "Squat lento a metà ampiezza, talloni a terra", [K(standing(), 300, 150), K(squat(0.55).act("legl", "legr"), 700, 200), K(standing(), 600, 200)]);
    const brA = feetTog().handPel("l", 0.14, 0.12, -0.06, "open").handPel("r", 0.14, 0.12, 0.06, "open");
    const brB = brA.copy().set("chest", [0.0, 1.47, 0]).set("head", [0.01, 1.67, 0]).act("torso");
    mv("kungfu.breathe", "Respiro lento a piedi uniti, espirazione più lunga dell'inspirazione", [K(brA, 300, 300), K(brB, 1500, 300), K(brA, 2300, 400)]);

    /* =============== 16. allungamenti */
    const fs = (down) => { const b = standing(); b.handRel("r", 0.5, -0.08, 0.04, "open").elbow("r", [0, -1, 0]); b.handRel("l", 0.47, down ? -0.16 : 0.0, 0.02, "open").elbow("l", [0, -1, -0.5]); return b.act("armr"); };
    mv("kungfu.forearmStretch", "Avambraccio: braccio teso, l'altra mano tira le dita indietro e poi in basso", [K(standing(), 300, 150), K(fs(false), 500, 1100), K(fs(true), 400, 1100), K(standing(), 400, 200)]);
    const cd = standing().foot("l", 0.08, -0.12, 0, 0).foot("r", -0.06, 0.12, 0, 0).handRel("r", -0.02, 0.26, 0.48, "open").elbow("r", [0, -0.3, 1]).twist(28).hips(10);
    cd.handRel("r", -0.06, 0.26, 0.47, "open");
    mv("kungfu.chestDoor", "Petto allo stipite: avambraccio appoggiato alla spalla, il busto ruota via", [K(standing(), 300, 150), K(cd.act("armr", "torso"), 700, 1300), K(standing(), 500, 200)]);
    const gc = standing();
    gc.set("pel", [-0.12, 0.5, 0]).set("chest", [0.12, 0.94, 0]).set("head", [0.24, 1.11, 0]);
    gc.foot("r", 0.32, 0.12, 0, 0).footAt("l", [0.3, 0.6, 0.08], 50, -10, 60).knee("r", [1, 0.5, 0]).knee("l", [0.3, 0.3, -1]);
    gc.handW("l", 0.28, 0.6, -0.16, "open").handW("r", 0.35, 0.62, 0.06, "open");
    mv("kungfu.gluteChair", "Gluteo da seduto: caviglia sul ginocchio opposto, busto che si inclina avanti", [K(gc, 400, 300), K(gc.copy().set("chest", [0.2, 0.9, 0]).set("head", [0.33, 1.04, 0]).act("torso", "legl"), 800, 1300), K(gc, 600, 200)]);
    const lt = standing().foot("l", 0, -0.12, 0, 0).foot("r", 0, 0.12, 0, 0).set("pel", [-0.22, 0.9, 0]).set("chest", [0.24, 1.0, 0]).set("head", [0.44, 1.02, 0]).knee("l", [1, 0, 0]).knee("r", [1, 0, 0]);
    lt.handW("l", 0.76, 0.96, -0.14, "open").handW("r", 0.76, 0.96, 0.14, "open");
    mv("kungfu.latStretch", "Dorsale: mani allo stipite all'altezza delle anche, sedere indietro, schiena lunga", [K(standing(), 300, 150), K(lt.act("torso"), 800, 1300), K(standing(), 600, 200)]);
    const hs = standing().footAt("l", [0.48, 0.24, -0.1], 0, -60).knee("l", [1, 0.2, 0]).set("pel", [-0.02, 0.94, 0.02]).set("chest", [0.24, 1.36, 0.01]).set("head", [0.36, 1.52, 0]);
    hs.handW("l", 0.4, 0.86, -0.1, "open").handW("r", 0.4, 0.88, 0.04, "open");
    mv("kungfu.hamStep", "Femorale: tallone su un gradino basso, gamba tesa, busto appena in avanti", [K(standing(), 300, 150), K(hs.act("legl", "torso"), 700, 1300), K(standing(), 600, 200)]);
    const gl = lieBack().footAt("r", [0.22, 0.5, 0.12], 0, -20).knee("r", [0.3, 1, 0.1]).footAt("l", [0.26, 0.58, -0.02], 60, -10, 60).knee("l", [0.3, 0.5, -1]);
    gl.handW("l", -0.06, 0.38, 0.02, "open").handW("r", -0.06, 0.38, 0.16, "open").elbow("l", [0, 0.3, -1]).elbow("r", [0, 0.3, 1]);
    const gl2 = gl.copy().footAt("r", [0.12, 0.56, 0.12], 0, -20).footAt("l", [0.16, 0.66, -0.02], 60, -10, 60).handW("l", -0.1, 0.42, 0.02, "open").handW("r", -0.1, 0.42, 0.16, "open");
    mv("kungfu.gluteLying", "Gluteo da sdraiato: caviglia sul ginocchio opposto, tira piano la gamba al petto", [K(lieBack(), 400, 200), K(gl, 600, 300), K(gl2.act("legl", "legr"), 600, 1300), K(lieBack(), 600, 200)]);
  });
})(typeof window !== "undefined" ? window : globalThis);
