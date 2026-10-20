/*
 * Progetto A - Difesa: movimenti del Kung Fu, scuola Wing Chun (prefisso "kungfu.").
 * Posizione frontale Yee Jee Kim Yeung Ma, guardia man sao + wu sao, mani e pugni sulla linea
 * centrale con i gomiti bassi. Mano sinistra avanti salvo dove indicato; .mirror() per l'altro lato.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { mv, K, standing, wcStance, add, mul, ankleY } = L;
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

    /* ---------------- le mani (s = lato, y = direzione della linea centrale) */
    const H = {
      chamber: (b, s, y = 0) => el(hd(b, s, -0.05, -0.2, sg(s) * 0.15, "fist", y), s, -1, -0.5, sg(s) * 0.3, y),
      punch: (b, s, y = 0, u = 0.08, f = 0.5) => el(hd(b, s, f, u, 0, "fist", y), s, 0, -1, -sg(s) * 0.3, y),
      man: (b, s, y = 0) => el(hd(b, s, 0.42, 0.02, 0, "blade", y), s, 0, -1, -sg(s) * 0.2, y),
      wu: (b, s, y = 0) => el(hd(b, s, 0.22, -0.08, 0, "blade", y), s, 0.2, -1, -sg(s) * 0.1, y),
      tan: (b, s, y = 0, f = 0.4) => el(hd(b, s, f, -0.02, 0, "open", y), s, 0, -1, -sg(s) * 0.7, y),
      bong: (b, s, y = 0) => el(hd(b, s, 0.34, -0.06, 0, "blade", y), s, 0.3, 0.8, sg(s), y),
      fook: (b, s, y = 0, f = 0.4) => el(hd(b, s, f, -0.06, 0, "blade", y), s, 0, -0.7, -sg(s), y),
      pakPrep: (b, s, y = 0) => el(hd(b, s, 0.28, -0.05, sg(s) * 0.14, "open", y), s, 0, -1, sg(s) * 0.2, y),
      pak: (b, s, y = 0) => el(hd(b, s, 0.34, -0.05, -sg(s) * 0.04, "open", y), s, 0, -1, -sg(s) * 0.4, y),
      lapReach: (b, s, y = 0) => el(hd(b, s, 0.44, 0.0, 0, "open", y), s, 0, -1, -sg(s) * 0.2, y),
      lapPull: (b, s, y = 0) => el(hd(b, s, 0.14, -0.36, sg(s) * 0.1, "fist", y), s, -1, -0.5, sg(s) * 0.6, y),
      gaun: (b, s, y = 0) => el(hd(b, s, 0.3, -0.46, sg(s) * 0.2, "blade", y), s, 0, -0.3, sg(s), y),
      jum: (b, s, y = 0) => el(hd(b, s, 0.3, -0.02, -sg(s) * 0.02, "blade", y), s, 0, -1, -sg(s) * 0.9, y),
      palm: (b, s, y = 0, u = -0.06) => el(hd(b, s, 0.5, u, 0, "blade", y), s, 0, -1, -sg(s) * 0.3, y),
      biu: (b, s, y = 0) => el(hd(b, s, 0.53, -0.08, 0, "blade", y), s, 0, -1, -sg(s) * 0.2, y),
      lan: (b, s, y = 0, u = -0.12) => el(hd(b, s, 0.28, u, -sg(s) * 0.12, "blade", y), s, 0.4, 0.1, sg(s), y)
    };
    const guard = (b, lead = "l", y = 0) => { H.man(b, lead, y); H.wu(b, ot(lead), y); return b; };

    /* ---------------- posizioni */
    const feetTog = () => standing().foot("l", 0, -0.07, 0, 0).foot("r", 0, 0.07, 0, 0);
    const S = () => { const b = wcStance(); H.chamber(b, "l"); H.chamber(b, "r"); return b; }; // posizione della forma
    const G = (lead = "l") => guard(wcStance(), lead); // guardia frontale

    const s0 = feetTog();
    const s1 = feetTog(); H.chamber(s1, "l"); H.chamber(s1, "r");
    const s2 = s1.copy().set("pel", [-0.03, 0.85, 0]).set("chest", [-0.01, 1.35, 0]).set("head", [0, 1.55, 0]).knee("l", [1, 0, 0.1]).knee("r", [1, 0, -0.1]);
    H.chamber(s2, "l"); H.chamber(s2, "r");
    const s3 = s2.copy().fyaw("l", 45).fyaw("r", -45);
    const s4 = S();
    mv("kungfu.openStance", "Apertura della posizione: pugni al petto, ginocchia piegate, punte e poi talloni in fuori", [
      K(s0, 300, 300), K(s1.copy().act("arml", "armr"), 400, 300), K(s2.copy().act("legl", "legr"), 400, 300),
      K(s3.copy().act("legl", "legr"), 350, 250), K(s4.copy().act("legl", "legr"), 350, 700)
    ]);
    mv("kungfu.guard", "Guardia: man sao avanti sulla linea centrale, wu sao dietro, gomiti bassi", [
      K(S(), 300, 200), K(G().act("arml", "armr"), 450, 900)
    ]);

    // pugno verticale in tre tempi (sinistro, poi destro)
    const pg = (s) => { const b = S(); H.wu(b, ot(s)); return b; };
    const p1 = (s) => { const b = pg(s); el(hd(b, s, 0.2, -0.1, 0, "fist"), s, 0, -1, -sg(s) * 0.4); return b; };
    const p2 = (s) => H.punch(pg(s), s);
    mv("kungfu.punch", "Pugno verticale sulla linea centrale: dal petto al mento, gomito basso", [
      K(S(), 300, 150), K(p1("l").act("arml"), 300, 200), K(p2("l").act("arml"), 220, 300), K(p1("l"), 260, 150),
      K(S(), 260, 150), K(p1("r").act("armr"), 300, 200), K(p2("r").act("armr"), 220, 300), K(p1("r"), 260, 150), K(S(), 260, 300)
    ]);

    // pugno a catena
    const ch = (s) => { const b = wcStance(); H.punch(b, s); el(hd(b, ot(s), 0.24, -0.02, 0, "fist"), ot(s), 0, -1, -sg(ot(s)) * 0.4); return b; };
    const chMid = (s) => { const b = wcStance(); el(hd(b, s, 0.37, 0.03, 0, "fist"), s, 0, -1, -sg(s) * 0.4); el(hd(b, ot(s), 0.36, -0.09, 0, "fist"), ot(s), 0, -1, -sg(ot(s)) * 0.4); return b; };
    mv("kungfu.chain", "Pugno a catena: un pugno parte sopra il braccio che rientra, sulla linea centrale", [
      K(ch("r"), 300, 100), K(chMid("l"), 90, 0), K(ch("l").act("arml", "armr"), 90, 60), K(chMid("r"), 90, 0), K(ch("r").act("arml", "armr"), 90, 60),
      K(chMid("l"), 90, 0), K(ch("l").act("arml", "armr"), 90, 60), K(chMid("r"), 90, 0), K(ch("r").act("arml", "armr"), 90, 200)
    ]);

    // mani base dalla guardia
    const g = G();
    const tanP = H.tan(g.copy(), "r");
    H.wu(tanP, "l");
    mv("kungfu.tan", "Tan sao: palmo in alto, il polso avanza sulla linea centrale, gomito basso", [K(g, 300, 150), K(H.wu(g.copy(), "l").act(), 250, 100), K(tanP.act("armr"), 260, 500), K(g, 260, 300)]);
    const bongP = H.bong(g.copy(), "l"); H.wu(bongP, "r");
    mv("kungfu.bong", "Bong sao: il gomito sale più alto del polso, polso sul centro, spalla bassa", [K(g, 300, 150), K(bongP.act("arml"), 240, 500), K(g, 260, 300)]);
    const fookP = H.fook(g.copy(), "l"); H.wu(fookP, "r");
    mv("kungfu.fook", "Fook sao: polso piegato sopra il braccio dell'altro, gomito verso il centro", [K(g, 300, 150), K(fookP.act("arml"), 400, 500), K(g, 300, 300)]);
    const pakA = H.pakPrep(g.copy(), "r");
    const pakB = H.pak(g.copy(), "r");
    mv("kungfu.pak", "Pak sao: colpo di palmo corto della mano dietro, si ferma sulla linea centrale", [K(g, 300, 150), K(pakA, 160, 60), K(pakB.act("armr"), 120, 300), K(g, 220, 300)]);
    const gaunP = H.gaun(g.copy(), "l"); H.wu(gaunP, "r");
    mv("kungfu.gaun", "Gaun sao: l'avambraccio taglia in basso e in fuori, l'altra mano resta alta", [K(g, 300, 150), K(gaunP.act("arml"), 240, 400), K(g, 260, 300)]);
    const jumP = H.jum(g.copy(), "l"); H.wu(jumP, "r");
    mv("kungfu.jum", "Jum sao: il gomito affonda verso il centro, avambraccio quasi verticale", [K(g, 300, 150), K(jumP.act("arml"), 240, 400), K(g, 260, 300)]);
    const biuP = H.biu(g.copy(), "r"); el(hd(biuP, "l", 0.3, -0.1, -0.3, "blade"), "l", 0, -1, -0.5);
    mv("kungfu.biu", "Biu sao: le dita tese scattano dal petto verso il centro", [K(g, 300, 150), K(biuP.act("armr"), 200, 400), K(g, 260, 300)]);
    const lapA = H.lapReach(g.copy(), "l");
    const lapB = H.punch(H.lapPull(g.copy(), "l"), "r");
    mv("kungfu.lapDa", "Lap da: la mano avanti tira in diagonale verso il fianco, l'altra colpisce", [K(g, 300, 150), K(lapA, 200, 80), K(lapB.act("arml", "armr"), 180, 400), K(g, 260, 300)]);
    const lanP = S(); H.lan(lanP, "l", 0, -0.1); H.lan(lanP, "r", 0, -0.2);
    mv("kungfu.lan", "Lan sao: avambracci orizzontali davanti al petto, gomito alto come il polso", [K(S(), 300, 150), K(lanP.act("arml", "armr"), 400, 600), K(S(), 300, 300)]);
  });
})(typeof window !== "undefined" ? window : globalThis);
