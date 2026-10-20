/*
 * Progetto A - Difesa: movimenti del karate (prefisso "karate.").
 * Kihon (posizioni, pugni, parate, calci), kihon ido in linea, kumite, contatto pieno, kata Heian.
 * Le pose si costruiscono con la gamba sinistra avanti, rivolte verso +x; l'altro lato con mirror().
 * Le linee e i kata tornano sempre al punto di partenza, cosi' i movimenti in fila si raccordano.
 */
(function (root) {
  "use strict";
  const MM = root.MartialMoves;
  if (!MM) return;
  MM.add(function (L) {
    const { B, mv, K, F, add, sub, mul, norm, standing, ready, kumite, kiba, ankleY, BAG, lieBack, lieFront, plank, sitLong, kneel } = L;
    const DEG = Math.PI / 180;
    const other = (s) => (s === "l" ? "r" : "l");
    const sg = (s) => (s === "l" ? -1 : 1);
    const yf = (d) => [Math.cos(d * DEG), 0, -Math.sin(d * DEG)];
    const yr = (d) => [Math.sin(d * DEG), 0, Math.cos(d * DEG)];
    const noact = (b) => { b.p.act = null; return b; };
    const cp = (b) => noact(b.copy());
    // mano relativa alla spalla (coordinate della posa costruita verso +x)
    const hs = (b, s, d, grip) => b.hand(s, add(b.sh(s), d), grip);
    const hh = (b, s, d, grip) => b.hand(s, add(b.p.head, d), grip);
    const hc = (b, s, d, grip) => b.hand(s, add(b.p.chest, d), grip);
    const mirAct = (a) => (a ? a.map((x) => x.replace(/(arm|leg)([lr])$/, (m, k, s) => k + other(s))) : a);
    // registra un movimento e la sua versione a specchio (nome + "R")
    function mv2(name, label, labelR, frames, extra) {
      mv(name, label, frames, extra);
      mv(name + "R", labelR, frames.map((f) => K(f.p.copy().mirror(), f.t, f.h, f.act ? mirAct(f.act) : undefined, f.partner ? f.partner.copy().mirror() : undefined)), extra);
    }
    // scala i tempi di una lista di fotogrammi
    const speed = (frames, k) => frames.map((f) => K(f.p, Math.round(f.t * k), Math.round(f.h * k), f.act, f.partner));
    // posa ruotata di yaw e spostata in modo che il piede "keep" coincida con quello di ref
    function place(b, yaw, keep, ref) {
      const n = b.copy();
      if (yaw) n.spin(yaw);
      if (keep && ref) { const f = n.p.foot[keep]; const t = ref.p.foot[keep]; n.move(t[0] - f[0], t[2] - f[2]); }
      return n;
    }
    // mescola due pose (per i fotogrammi di passaggio)
    function mix(a, b, t) {
      const pa = a.done(); const pb = b.done();
      const q = F.lerpPose(pa, pb, t);
      const out = B.of(Object.assign({}, q, { o: [pa.o[0] + (pb.o[0] - pa.o[0]) * t, pa.o[1] + (pb.o[1] - pa.o[1]) * t] }));
      out.p.headYaw = (pa.headYaw || 0) + ((pb.headYaw || 0) - (pa.headYaw || 0)) * t;
      return out;
    }

    /* ------------------------------------------------------------ posizioni di base */
    const st = () => standing();
    // musubi dachi: talloni uniti, punte aperte, mani aperte sulle cosce
    const musubi = () => st().foot("l", 0, -0.07, 28, 0).foot("r", 0, 0.07, -28, 0).handW("l", 0.05, 0.9, -0.21, "open").handW("r", 0.05, 0.9, 0.21, "open").elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]);
    // yoi in hachiji dachi: piedi alla larghezza delle anche, punte in fuori, pugni davanti alle cosce
    const yoi = () => st().foot("l", 0, -0.16, 14, 0).foot("r", 0, 0.16, -14, 0).sink(0.01).handW("l", 0.14, 0.9, -0.15, "fist").handW("r", 0.14, 0.9, 0.15, "fist").elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]);
    // heisoku: piedi uniti, pugni ai fianchi (per calci laterali e fumikomi)
    const heisoku = () => { const b = st().foot("l", 0, -0.07, 4, 0).foot("r", 0, 0.07, -4, 0).sink(0.03); b.hikite("l").hikite("r"); return b; };
    // hachiji dachi con pugno sinistro avanti (choku zuki): sinistro al plesso, destro al fianco
    const hachiK = () => { const b = yoi(); b.hikite("r"); b.straight("l", [1.0, 1.24, 0], 0.97); return b; };

    // zenkutsu dachi (sinistro avanti) con il bacino girato di "hip" gradi (hanmi -45, shomen 0)
    function zen(hip = -40) {
      const b = st();
      b.foot("l", 0.45, -0.15, -5, 0).foot("r", -0.45, 0.15, -32, 0);
      b.set("pel", [0.06, 0.78, 0]).set("chest", [0.08, 1.28, 0]).set("head", [0.1, 1.48, 0]);
      b.set("hipYaw", hip).set("chestYaw", hip).look(-hip * 0.8);
      b.knee("r", [0.4, 0, 1]);
      b.hikite("l").hikite("r");
      return b;
    }
    // kokutsu dachi (sinistro avanti): peso dietro, piede dietro a 90 gradi
    function kok() {
      const b = st();
      b.foot("l", 0.38, -0.03, -5, 0).foot("r", -0.36, 0.03, -88, 0);
      b.set("pel", [-0.12, 0.79, 0.01]).set("hipYaw", -60).set("chestYaw", -58).set("chest", [-0.1, 1.29, 0.01]).set("head", [-0.07, 1.49, 0.0]).look(50);
      b.knee("r", [0.35, 0, 1]).knee("l", [1, 0, -0.1]);
      b.hikite("l").hikite("r");
      return b;
    }
    // kiba dachi: piedi paralleli larghi, ginocchia in fuori
    const kib = (h = 0.68) => { const b = kiba(); b.set("pel", [0, h, 0]).set("chest", [0.01, h + 0.5, 0]).set("head", [0.02, h + 0.7, 0]); b.hikite("l").hikite("r"); return b; };
    // kosa dachi: piede dietro incrociato dietro quello avanti, ginocchia piegate
    function kosa() {
      const b = st();
      b.foot("l", 0.12, -0.04, -10, 0).foot("r", -0.06, -0.14, -30, 55);
      b.set("pel", [0.0, 0.74, -0.06]).set("chest", [0.06, 1.24, -0.04]).set("head", [0.09, 1.44, -0.04]).set("hipYaw", -20).set("chestYaw", -20).look(20);
      b.knee("l", [1, 0, -0.2]).knee("r", [1, -0.2, 0.3]);
      b.hikite("l").hikite("r");
      return b;
    }
    // guardia da kumite: di tre quarti, mano avanti all'altezza del mento, l'altra davanti al plesso
    function kg() {
      const b = kumite();
      b.look(40);
      b.handW("l", 0.42, 1.37, -0.03, "fist").handW("r", 0.2, 1.17, 0.07, "fist");
      b.elbow("l", [0.2, -1, -0.3]).elbow("r", [0, -1, 0.4]);
      return b;
    }
    // guardia del contatto pieno: quasi frontale, mani agli zigomi, gomiti sulle costole
    function kyo() {
      const b = st();
      b.foot("l", 0.13, -0.17, 0, 6).foot("r", -0.13, 0.19, -20, 14);
      b.set("pel", [-0.02, 0.86, 0.01]).set("hipYaw", -18).set("chestYaw", -18).set("chest", [0.05, 1.34, 0.01]).set("head", [0.11, 1.52, 0.0]).look(15);
      b.handW("l", 0.27, 1.43, -0.11, "fist").handW("r", 0.22, 1.42, 0.11, "fist");
      b.elbow("l", [0, -1, -0.15]).elbow("r", [0, -1, 0.15]);
      b.knee("l", [1, 0, -0.2]).knee("r", [1, 0, 0.2]);
      return b;
    }

    /* ------------------------------------------------------------ braccia (posa costruita verso +x) */
    function hik(b, s) { return b.hikite(s); }
    const punch = (b, s, y = 1.22, x = 1.0, z = 0) => b.straight(s, [x, y, z], 0.97);
    // gedan barai: avambraccio in diagonale, pugno sopra il ginocchio avanti
    function gedan(b, s) { hs(b, s, [0.27, -0.48, sg(s) * 0.01], "fist"); b.elbow(s, [-0.3, 0, sg(s)]); return b; }
    function gedanPrep(b, s) { hh(b, s, [0.05, -0.06, -sg(s) * 0.13], "fist"); b.elbow(s, [0.3, -1, sg(s) * 0.6]); hs(b, other(s), [0.36, -0.42, sg(s) * 0.12], "open"); b.elbow(other(s), [0, -0.5, -sg(s)]); return b; }
    // age uke: avambraccio inclinato davanti alla fronte, pugno piu' alto del gomito
    function age(b, s) { hh(b, s, [0.17, 0.13, -sg(s) * 0.03], "fist"); b.elbow(s, [0.5, 0.2, sg(s)]); return b; }
    function agePrep(b, s) { hh(b, other(s), [0.26, -0.02, 0], "open"); b.elbow(other(s), [0.2, -1, -sg(s) * 0.4]); hc(b, s, [0.24, -0.12, 0.0], "fist"); b.elbow(s, [0, -1, sg(s) * 0.3]); return b; }
    // soto uke: dall'esterno verso il centro, pugno all'altezza della spalla, avambraccio verticale
    function soto(b, s) { const sh = b.sh(s); b.hand(s, [sh[0] + 0.3, sh[1] + 0.02, sh[2] * 0.4], "fist"); b.elbow(s, [0.1, -1, sg(s) * 0.25]); return b; }
    function sotoPrep(b, s) { hh(b, s, [-0.04, -0.02, sg(s) * 0.24], "fist"); b.elbow(s, [-0.2, -0.6, sg(s)]); hs(b, other(s), [0.45, -0.22, sg(s) * 0.14], "open"); b.elbow(other(s), [0, -1, -sg(s) * 0.4]); return b; }
    // uchi uke: dal centro verso l'esterno, pugno davanti alla spalla
    function uchi(b, s) { const sh = b.sh(s); b.hand(s, [sh[0] + 0.3, sh[1] + 0.02, sh[2] + sg(s) * 0.03], "fist"); b.elbow(s, [0.1, -1, -sg(s) * 0.15]); return b; }
    function uchiPrep(b, s) { b.hand(s, add(b.sh(other(s)), [0.1, -0.18, sg(s) * 0.02]), "fist"); b.elbow(s, [0.4, -1, sg(s) * 0.4]); hs(b, other(s), [0.45, -0.2, sg(s) * 0.14], "open"); b.elbow(other(s), [0, -1, -sg(s) * 0.4]); return b; }
    // shuto uke: taglio della mano davanti, dita all'altezza della spalla; l'altra mano al plesso, palmo in su
    function shuto(b, s) { hs(b, s, [0.36, 0.02, -sg(s) * 0.04], "blade"); b.elbow(s, [0, -1, sg(s) * 0.4]); hc(b, other(s), [0.22, -0.16, -sg(s) * 0.02], "open"); b.elbow(other(s), [0, -1, -sg(s) * 0.6]); return b; }
    function shutoPrep(b, s) { hh(b, s, [0.03, -0.05, -sg(s) * 0.13], "blade"); b.elbow(s, [0.3, -1, sg(s) * 0.5]); hs(b, other(s), [0.46, -0.16, sg(s) * 0.14], "open"); b.elbow(other(s), [0, -1, -sg(s) * 0.4]); return b; }
    // prep comune dei pugni: mano avanti stesa, l'altra al fianco
    function zukiPrep(b, s) { hik(b, s); hs(b, other(s), [0.45, -0.1, sg(s) * 0.15], "fist"); return b; }

    /* ------------------------------------------------------------ stati di kihon (sinistro avanti) */
    const ZB = () => { const b = zen(-42); gedan(b, "l"); hik(b, "r"); return b; }; // kamae: gedan barai
    const zOi = (y = 1.22) => { const b = zen(-12); punch(b, "l", y); hik(b, "r"); b.lean(0.03); return b; };
    const zGyaku = (y = 1.2) => { const b = zen(4); b.twist(4).look(-6); punch(b, "r", y); hik(b, "l"); b.lean(0.04); return b; };
    const zAge = () => { const b = zen(-38); age(b, "l"); hik(b, "r"); return b; };
    const zSoto = () => { const b = zen(-38); soto(b, "l"); hik(b, "r"); return b; };
    const zUchi = () => { const b = zen(-38); uchi(b, "l"); hik(b, "r"); return b; };
    const zGedan = () => ZB();
    const zAgeG = () => { const b = zen(-4); age(b, "r"); hik(b, "l"); return b; }; // age uke con il braccio dietro
    const kShuto = () => { const b = kok(); shuto(b, "l"); return b; };
    const kGedan = () => { const b = kok(); gedan(b, "l"); hik(b, "r"); return b; };
    const KB = () => kShuto();
    // versione dell'altro lato (gamba destra avanti)
    const side = (fn) => (lead, ...a) => (lead === "l" ? fn(...a) : fn(...a).mirror());

    /*
     * Sequenza di kihon: passi avanti/indietro con il piede che passa vicino all'altro, giri, tecniche.
     * Ogni stato e' costruito all'origine verso +x e poi messo al suo posto tenendo fermo il piede d'appoggio.
     */
    function Seq(start, t0 = 300, h0 = 250) {
      this.fr = [K(start, t0, h0)];
      this.cur = start;
      this.yaw = 0;
      this.lead = "l";
    }
    // passaggio: il piede che si muove arriva accanto all'altro, ginocchia piegate, testa alla stessa altezza
    Seq.prototype.passPose = function (next, mover, yawMid, prep, lead) {
      const pl = other(mover);
      const P = next.p.foot[pl];
      const m = mix(this.cur, next, 0.5);
      const r = yr(yawMid);
      const f = yf(yawMid);
      m.p.foot[mover] = [P[0] + r[0] * sg(mover) * 0.13 - f[0] * 0.02, ankleY(12), P[2] + r[2] * sg(mover) * 0.13 - f[2] * 0.02];
      m.p.footPitch[mover] = 12;
      m.p.footYaw[mover] = yawMid + (mover === "l" ? 5 : -15);
      m.p.footYaw[pl] = (this.cur.p.footYaw[pl] + next.p.footYaw[pl]) / 2;
      const low = Math.min(this.cur.p.pel[1], next.p.pel[1]);
      const c = [(P[0] + m.p.foot[mover][0]) / 2 - f[0] * 0.04, low + 0.01, (P[2] + m.p.foot[mover][2]) / 2 - f[2] * 0.04];
      const d = sub(c, m.p.pel);
      ["pel", "chest", "head"].forEach((k) => { m.p[k] = add(m.p[k], d); });
      m.p.hipYaw = yawMid + (lead === "l" ? -25 : 25);
      m.p.chestYaw = m.p.hipYaw;
      m.p.headYaw = -(lead === "l" ? -25 : 25);
      m.knee("l", add(f, mul(r, -0.25))).knee("r", add(f, mul(r, 0.25)));
      // le mani: preparazione della tecnica che arriva, costruita all'origine e ruotata
      if (prep) {
        const loc = B.of(m.done());
        // porta la posa nel sistema locale (verso +x), prepara le mani, riporta
        const o = [m.p.pel[0], 0, m.p.pel[2]];
        const toL = (v) => { const q = sub(v, o); const c0 = Math.cos(-yawMid * DEG); const s0 = Math.sin(-yawMid * DEG); return [q[0] * c0 + q[2] * s0, q[1], -q[0] * s0 + q[2] * c0]; };
        const toW = (v) => { const c0 = Math.cos(yawMid * DEG); const s0 = Math.sin(yawMid * DEG); return add(o, [v[0] * c0 + v[2] * s0, v[1], -v[0] * s0 + v[2] * c0]); };
        const lp = B.of(m.done());
        ["pel", "chest", "head"].forEach((k) => { lp.p[k] = toL(m.p[k]); });
        lp.p.hipYaw = m.p.hipYaw - yawMid;
        lp.p.chestYaw = m.p.chestYaw - yawMid;
        lp.p.o = [0, 0];
        prep(lp, lead);
        ["l", "r"].forEach((s) => {
          if (lp.p.hand[s]) loc.p.hand[s] = toW(lp.p.hand[s]);
          if (lp.p.grip[s]) loc.p.grip[s] = lp.p.grip[s];
          const e = lp.p.pole["e" + s];
          if (e) { const c0 = Math.cos(yawMid * DEG); const s0 = Math.sin(yawMid * DEG); loc.p.pole["e" + s] = [e[0] * c0 + e[2] * s0, e[1], -e[0] * s0 + e[2] * c0]; }
        });
        return loc;
      }
      return m;
    };
    // passo: mover = piede che si muove, lead = gamba avanti dopo il passo, build(lead) = stato d'arrivo
    Seq.prototype.step = function (build, mover, o = {}) {
      const lead = o.lead || (this.lead === "l" ? "r" : "l");
      const yaw = o.yaw != null ? o.yaw : this.yaw;
      const next = place(build(lead), yaw, other(mover), this.cur);
      const pass = this.passPose(next, mover, (this.yaw + yaw) / 2, o.prep, lead);
      this.fr.push(K(pass, o.tp || 220, o.hp || 0));
      next.act(...(o.act || ["leg" + mover]).concat(o.arms ? o.arms.map((a) => a + "") : []));
      this.fr.push(K(next, o.t || 200, o.h == null ? 300 : o.h));
      this.cur = next;
      this.yaw = yaw;
      this.lead = lead;
      return this;
    };
    // tecnica sul posto: build(lead) = nuovo stato con gli stessi piedi
    Seq.prototype.tech = function (build, o = {}) {
      const keep = this.lead;
      const next = place(build(this.lead), this.yaw, keep, this.cur);
      if (o.act) next.act(...o.act);
      if (o.prep) { const pr = place(o.prep(this.lead), this.yaw, keep, this.cur); this.fr.push(K(noact(pr), o.tp || 200, o.hp || 0)); }
      this.fr.push(K(next, o.t || 170, o.h == null ? 300 : o.h));
      this.cur = next;
      return this;
    };
    Seq.prototype.pose = function (b, t, h) { this.fr.push(K(b, t, h)); this.cur = b; return this; };
    Seq.prototype.end = function (b, t = 300, h = 300) { this.fr.push(K(b, t, h)); return this.fr; };

    // azioni sulle braccia per lato (lead = gamba avanti dopo il passo)
    const armsOf = (lead) => ["arm" + lead];
    const pGedan = (b, lead) => gedanPrep(b, lead);
    const pAge = (b, lead) => agePrep(b, lead);
    const pSoto = (b, lead) => sotoPrep(b, lead);
    const pUchi = (b, lead) => uchiPrep(b, lead);
    const pShuto = (b, lead) => shutoPrep(b, lead);
    const pOi = (b, lead) => zukiPrep(b, lead);
    const sGedan = side(zGedan);
    const sOi = side(zOi);
    const sOiJ = side(() => zOi(1.47));
    const sGyaku = side(zGyaku);
    const sAge = side(zAge);
    const sSoto = side(zSoto);
    const sUchi = side(zUchi);
    const sShuto = side(kShuto);
    const sKGedan = side(kGedan);
    const sAgeG = side(zAgeG);
    // gyaku zuki con la mano dietro e il kiai (testa attiva)
    const kiaiAct = (lead) => ["arm" + other(lead), "torso", "head"];

    /* ============================================================ SALUTO, YOI, POSIZIONI */
    const bowP = musubi().set("chest", [0.17, 1.39, 0]).set("head", [0.27, 1.54, 0]).handW("l", 0.12, 0.88, -0.19, "open").handW("r", 0.12, 0.88, 0.19, "open");
    mv("karate.rei", "Rei: in musubi dachi, mani aperte sulle cosce, inchino con lo sguardo avanti", [K(musubi(), 300, 300), K(bowP.act("torso"), 500, 500), K(musubi(), 500, 300)]);
    const yoiX = yoi().handW("l", 0.3, 1.0, 0.04, "fist").handW("r", 0.3, 1.04, -0.04, "fist");
    const yoiStep = musubi().foot("l", 0, -0.16, 14, 0).act("legl");
    mv("karate.reiYoi", "Rei e yoi: inchino, poi i piedi si aprono in hachiji dachi e i pugni scendono davanti", [K(musubi(), 300, 250), K(cp(bowP).act("torso"), 450, 400), K(musubi(), 450, 200), K(yoiStep, 250, 50), K(noact(yoiX.copy()).act("legr", "arml", "armr"), 300, 120), K(yoi(), 350, 600)]);
    mv("karate.yoi", "Yoi: hachiji dachi, pugni chiusi davanti alle cosce, sguardo avanti", [K(musubi(), 300, 200), K(yoiStep, 250, 50), K(noact(yoiX.copy()).act("legr", "arml", "armr"), 300, 120), K(yoi(), 350, 700), K(musubi(), 400, 200)]);
    mv("karate.yoiHold", "In yoi, fermo e concentrato: ascolta, guarda e respira", [K(yoi(), 400, 400), K(yoi().set("chest", [0.0, 1.46, 0]).set("head", [0.01, 1.66, 0]).act("torso"), 1200, 300), K(yoi(), 1200, 400)]);
    // posizioni con le misure
    const zenHold = () => { const b = zen(-40); hik(b, "l"); hik(b, "r"); return b; };
    const kibHold = () => kib();
    const kokHold = () => { const b = kok(); hik(b, "l"); hik(b, "r"); return b; };
    mv("karate.zenkutsuDachi", "Zenkutsu dachi: ginocchio avanti sopra l'alluce, gamba dietro tesa, tallone a terra", [K(yoi(), 300, 200), K(zenHold().act("legl", "legr"), 600, 1600), K(yoi(), 500, 300)]);
    mv("karate.kibaDachi", "Kiba dachi: piedi paralleli larghi, ginocchia in fuori, busto verticale", [K(yoi(), 300, 200), K(kibHold().act("legl", "legr"), 600, 1600), K(yoi(), 500, 300)]);
    mv("karate.kokutsuDachi", "Kokutsu dachi: piede dietro a 90 gradi, peso seduto sulla gamba dietro", [K(yoi(), 300, 200), K(kokHold().act("legl", "legr"), 600, 1600), K(yoi(), 500, 300)]);
    // passaggi zenkutsu - kiba - kokutsu ruotando sui piedi (stesso lato)
    const zS = zenHold();
    const kS = (() => { const b = kib().foot("l", 0.38, -0.08, 80, 0).foot("r", -0.42, 0.06, 80, 0); b.set("pel", [-0.02, 0.7, -0.01]).set("chest", [-0.02, 1.2, -0.01]).set("head", [-0.02, 1.4, -0.01]).set("hipYaw", -88).set("chestYaw", -88).look(88); b.knee("l", [0, 0, -1]).knee("r", [0, 0, 1]); hik(b, "l"); hik(b, "r"); return b; })();
    const koS = (() => { const b = kok().foot("l", 0.4, -0.08, -5, 0).foot("r", -0.42, 0.06, -88, 0); b.set("pel", [-0.15, 0.79, -0.01]); hik(b, "l"); hik(b, "r"); return b; })();
    mv("karate.stanceShift", "Zenkutsu, kiba e kokutsu sullo stesso lato, ruotando sui piedi senza alzarsi", [K(zS, 300, 400), K(cp(kS).act("legl", "legr", "torso"), 450, 500), K(cp(koS).act("legl", "legr"), 450, 500), K(zS.copy().act("legl", "legr"), 450, 400)]);
    mv("karate.kibaHold", "Kiba dachi fermo con le mani sui fianchi, respiro lento", [K(yoi(), 300, 200), K(kib().handPel("l", 0.03, 0.06, -0.19, "open").handPel("r", 0.03, 0.06, 0.19, "open").act("legl", "legr"), 600, 900), K(kib().handPel("l", 0.03, 0.06, -0.19, "open").handPel("r", 0.03, 0.06, 0.19, "open").set("chest", [0.01, 1.2, 0]).set("head", [0.02, 1.4, 0]).act("torso"), 1300, 400), K(kib().handPel("l", 0.03, 0.06, -0.19, "open").handPel("r", 0.03, 0.06, 0.19, "open"), 1300, 300), K(yoi(), 500, 300)]);
    mv("karate.zenkutsuHold", "Tenuta in zenkutsu: prima con il sinistro avanti, poi con il destro", [K(yoi(), 300, 200), K(zenHold().act("legl", "legr"), 600, 1500), K(yoi(), 450, 200), K(zenHold().mirror().act("legl", "legr"), 600, 1500), K(yoi(), 450, 300)]);
    mv("karate.kosaDachi", "Kosa dachi: il piede dietro si incastra dietro quello avanti, ginocchia piegate", [K(yoi(), 300, 200), K(kosa().act("legl", "legr"), 500, 1500), K(yoi(), 450, 300)]);
    mv("karate.kamae", "Dallo yoi passo indietro in zenkutsu sinistro con gedan barai (kamae)", [K(yoi(), 300, 200), K(gedanPrep(zen(-30).foot("r", -0.2, 0.15, -30, 10).set("pel", [0.12, 0.84, 0]).set("chest", [0.13, 1.34, 0]).set("head", [0.15, 1.54, 0]), "l"), 300, 50), K(ZB().act("legr", "arml"), 220, 1000), K(yoi(), 450, 300)]);

    /* ============================================================ PUGNI */
    const seikenOpen = hachiK().handW("l", 0.42, 1.25, -0.04, "open");
    mv("karate.seiken", "Seiken: la mano si chiude a pugno, si colpisce con le prime due nocche, polso dritto", [K(hachiK(), 300, 200), K(cp(seikenOpen).act("arml"), 350, 700), K(hachiK().act("arml"), 350, 900), K(hachiK(), 200, 200)]);
    mv("karate.hachiji", "Hachiji dachi: pugno sinistro avanti al plesso, destro al fianco col palmo in su", [K(yoi(), 300, 200), K(hachiK().act("arml", "armr"), 500, 1200), K(yoi(), 400, 300)]);
    // choku zuki: un pugno parte dal fianco mentre l'altro torna (hikite)
    const hR = () => { const b = yoi(); b.hikite("l"); punch(b, "r", 1.24); return b; };
    const hMid = (s) => { const b = yoi(); hs(b, s, [0.26, -0.24, -sg(s) * 0.12], "fist"); b.elbow(s, [0, -1, sg(s) * 0.4]); hs(b, other(s), [0.24, -0.22, sg(s) * 0.1], "fist"); b.elbow(other(s), [0, -1, -sg(s) * 0.4]); return b; };
    const hStart = (s) => { const b = hachiK(); if (s === "l") b.mirror(); b.handW(s === "r" ? "r" : "l", 0.12, 1.02, sg(s) * 0.17); return b; };
    const hL = () => hachiK();
    mv("karate.chokuSlow", "Choku zuki in quattro tempi: parte dal fianco, gli avambracci si incrociano, ruota alla fine", [K(hL(), 300, 300), K(hachiK().handW("r", 0.18, 1.05, 0.16, "fist").act("armr"), 500, 300), K(hMid("r").act("armr", "arml"), 500, 300), K(yoi().hikite("l").straight("r", [1.0, 1.24, 0], 0.82).act("armr", "arml"), 500, 300), K(hR().act("armr", "arml", "torso"), 400, 600), K(hMid("l").act("arml", "armr"), 600, 300), K(hL().act("arml", "armr", "torso"), 500, 600)]);
    mv("karate.chokuZuki", "Choku zuki da fermo con kime: destro e sinistro, la mano che torna va al fianco", [K(hL(), 300, 250), K(hR().act("armr", "arml", "torso"), 170, 380), K(hL().act("arml", "armr", "torso"), 170, 380)]);
    const kL = (h) => { const b = kib(h); punch(b, "l", h + 0.48); hik(b, "r"); return b; };
    const kR = (h) => { const b = kib(h); punch(b, "r", h + 0.48); hik(b, "l"); return b; };
    const kibZ = (name, label, h, t, hold, n = 2, kiaiLast = false) => {
      const fr = [K(kL(h), 300, 250)];
      for (let i = 0; i < n; i += 1) {
        const last = kiaiLast && i === n - 1;
        fr.push(K(kR(h).act("armr", "arml", ...(last ? ["torso", "head"] : [])), t, last ? hold + 500 : hold));
        fr.push(K(kL(h).act("arml", "armr"), t, hold));
      }
      mv(name, label, fr);
    };
    kibZ("karate.kibaZuki", "Choku zuki in kiba dachi a velocità media, kime su ogni pugno", 0.68, 170, 330);
    kibZ("karate.kibaZukiSlow", "Choku zuki lenti in kiba dachi: hikite completo, espira su ogni pugno", 0.68, 900, 500, 1);
    kibZ("karate.kibaHighZuki", "Kiba dachi alto e choku zuki lenti, espirando su ogni pugno", 0.76, 800, 450, 1);
    kibZ("karate.kibaZukiFast", "Choku zuki veloci in kiba dachi, sempre sulla linea centrale", 0.68, 120, 60, 3);
    mv("karate.kibaZukiKiai", "Choku zuki in kiba dachi con kiai sull'ultimo pugno", [K(kL(0.68), 300, 200), K(kR(0.68).act("armr", "arml"), 150, 200), K(kL(0.68).act("arml", "armr"), 150, 200), K(kR(0.68).act("armr", "arml", "torso", "head"), 150, 900), K(kL(0.68), 400, 300)]);
    mv("karate.niZuki", "Ni zuki in kiba dachi: due pugni di fila, il secondo più veloce, kime sul secondo", [K(kL(0.68), 300, 300), K(kR(0.68).act("armr", "arml"), 200, 40), K(kL(0.68).act("arml", "armr", "torso"), 120, 600)]);

    /* ============================================================ GYAKU ZUKI, PARATE SUL POSTO */
    const zb = ZB();
    const zTurn = (() => { const b = zen(4); gedan(b, "l"); hik(b, "r"); return b; })();
    mv2("karate.gyakuZuki", "Gyaku zuki: l'anca ruota a fronte, pugno destro chudan, tallone dietro a terra", "Gyaku zuki dall'altro lato: pugno sinistro con il destro avanti", [K(zb, 300, 250), K(zGyaku().act("armr", "arml", "torso"), 180, 400), K(zb, 280, 300)]);
    mv("karate.gyakuZuki2", "Gyaku zuki in due tempi: prima l'anca ruota a fronte, poi arriva il pugno", [K(zb, 300, 300), K(cp(zTurn).act("torso", "legr"), 400, 500), K(zGyaku().act("armr", "arml"), 300, 600), K(zb, 350, 300)]);
    mv2("karate.gedanBarai", "Gedan barai: pugno dall'orecchio opposto giù sopra il ginocchio, l'altro al fianco", "Gedan barai dall'altro lato", [K(zb, 300, 200), K(gedanPrep(zen(-15), "l").act("arml", "armr"), 300, 200), K(zb.copy().act("arml", "armr"), 200, 450)]);
    mv("karate.gedanPrep", "Gedan barai lento: ferma la preparazione, poi l'avambraccio scende in diagonale", [K(zb, 300, 200), K(gedanPrep(zen(-15), "l").act("arml", "armr"), 600, 1300), K(zb.copy().act("arml", "armr"), 600, 900)]);
    mv2("karate.ageUke", "Age uke: le braccia si incrociano davanti al viso, l'avambraccio sale sopra la fronte", "Age uke dall'altro lato", [K(zb, 300, 200), K(agePrep(zen(-25), "l").act("armr"), 300, 120), K(zAge().act("arml", "armr"), 200, 450), K(zb, 300, 250)]);
    mv("karate.ageUkeSlow", "Age uke lento: finale con il pugno più alto del gomito, a un pugno dalla fronte", [K(zb, 300, 200), K(agePrep(zen(-25), "l").act("armr"), 600, 400), K(zAge().act("arml", "armr"), 600, 1400), K(zb, 400, 250)]);
    mv2("karate.sotoUke", "Soto uke: dall'esterno, vicino all'orecchio, l'avambraccio gira verso il centro", "Soto uke dall'altro lato", [K(zb, 300, 200), K(sotoPrep(zen(-25), "l").act("arml"), 300, 120), K(zSoto().act("arml", "armr"), 200, 450), K(zb, 300, 250)]);
    mv2("karate.uchiUke", "Uchi uke: dal centro, sotto l'ascella opposta, l'avambraccio va verso l'esterno", "Uchi uke dall'altro lato", [K(zb, 300, 200), K(uchiPrep(zen(-25), "l").act("arml"), 300, 120), K(zUchi().act("arml", "armr"), 200, 450), K(zb, 300, 250)]);
    mv("karate.sotoUkePrep", "Soto uke lento: braccio alzato di lato all'altezza dell'orecchio, poi gira al centro", [K(zb, 300, 200), K(sotoPrep(zen(-25), "l").act("arml", "armr"), 600, 1300), K(zSoto().act("arml", "armr"), 600, 900), K(zb, 400, 250)]);
    mv("karate.uchiUkePrep", "Uchi uke lento: pugno sotto l'ascella opposta, poi l'avambraccio va verso l'esterno", [K(zb, 300, 200), K(uchiPrep(zen(-25), "l").act("arml", "armr"), 600, 1300), K(zUchi().act("arml", "armr"), 600, 900), K(zb, 400, 250)]);
    mv("karate.blocksSlow", "Parate lente in zenkutsu: gedan barai, age uke, soto uke, uchi uke", [K(zb, 300, 200), K(agePrep(zen(-25), "l"), 450, 50), K(zAge().act("arml", "armr"), 400, 300), K(sotoPrep(zen(-25), "l"), 450, 50), K(zSoto().act("arml", "armr"), 400, 300), K(uchiPrep(zen(-25), "l"), 450, 50), K(zUchi().act("arml", "armr"), 400, 300), K(gedanPrep(zen(-15), "l"), 450, 50), K(zb.copy().act("arml", "armr"), 400, 300)]);

    /* ============================================================ KIHON IDO: PASSI E LINEE */
    // passo avanti con tecnica e ritorno indietro con gedan barai (il movimento torna al punto di partenza)
    function fwdBack(build, extra, prep, actArm, kiai) {
      const q = new Seq(ZB());
      q.step(build, "r", { prep: prep || pOi, act: ["legr"].concat(actArm ? ["arm" + "r"] : []), h: extra ? 120 : (kiai ? 900 : 380) });
      (extra || []).forEach((e, i) => q.tech(e.b, { act: e.act("r").concat(kiai && i === extra.length - 1 ? ["torso", "head"] : []), prep: e.prep, h: kiai && i === extra.length - 1 ? 900 : e.h }));
      q.step(sGedan, "r", { lead: "l", prep: pGedan, act: [], tp: 260, t: 240, h: 200 });
      return q.end(ZB(), 200, 200);
    }
    mv("karate.zenkutsuStep", "Passo in zenkutsu: il piede dietro passa accanto all'altro senza alzarsi, poi avanti", (() => {
      const q = new Seq(zenHold());
      const zh = side(zenHold);
      q.step(zh, "r", { tp: 400, hp: 250, t: 400, h: 500 });
      q.step(zh, "r", { lead: "l", tp: 400, hp: 250, t: 400, h: 300, act: ["legr"] });
      return q.end(zenHold(), 200, 200);
    })());
    mv("karate.oiZuki", "Oi zuki: il piede passa vicino all'altro, il pugno arriva quando il piede appoggia", fwdBack(sOi, null, pOi, true));
    mv("karate.oiZukiKiai", "Oi zuki con kiai: passo, pugno e kime, poi torna indietro in gedan barai", fwdBack(sOi, null, pOi, true, true));
    mv("karate.sanbonZuki", "Sanbon zuki sul passo: oi zuki jodan, gyaku zuki chudan, zuki chudan, kiai", fwdBack(sOiJ, [{ b: sGyaku, act: kiaiAct, h: 60 }, { b: sOi, act: (l) => ["arm" + l], h: 300 }], pOi, true, true));
    // linea: due passi avanti, giro con gedan barai, due passi verso la partenza, giro
    function lineFwd(build, extra, prep, opts = {}) {
      const q = new Seq(ZB());
      const one = (i) => {
        const last = i % 2 === 1 && opts.kiai;
        q.step(build, q.lead === "l" ? "r" : "l", { prep, act: ["leg" + other(q.lead)].concat(["arm" + other(q.lead)]), h: extra && extra.length ? 80 : last ? 700 : 300 });
        (extra || []).forEach((e, k) => q.tech(e.b, { act: e.act(q.lead).concat(last && k === extra.length - 1 ? ["torso", "head"] : []), prep: e.prep, h: last && k === extra.length - 1 ? 700 : e.h }));
      };
      const turn = (yaw) => q.step(sGedan, q.lead === "l" ? "r" : "l", { yaw, prep: pGedan, act: ["leg" + other(q.lead), "arm" + other(q.lead), "torso"], tp: 300, t: 260, h: 350 });
      one(0); one(1); turn(-180); one(2); one(3); turn(0);
      return q.end(ZB(), 200, 200);
    }
    // linea indietro: due passi indietro e due avanti con la stessa tecnica
    function lineBack(build, extra, prep, opts = {}) {
      const q = new Seq(opts.start || ZB());
      const one = (back) => {
        const mover = back ? q.lead : other(q.lead);
        q.step(build, mover, { prep, act: ["leg" + mover, "arm" + other(q.lead)], h: extra && extra.length ? 80 : 300, tp: 240 });
        (extra || []).forEach((e) => q.tech(e.b, { act: e.act(q.lead), prep: e.prep, h: e.h }));
      };
      one(true); one(true); one(false); one(false);
      return q.end(opts.start || ZB(), 200, 200);
    }
    const gy = { b: sGyaku, act: (l) => ["arm" + other(l), "torso"], h: 300 };
    mv("karate.oiZukiLine", "Oi zuki avanzando, kiai, giro con gedan barai e ritorno verso la partenza", lineFwd(sOi, null, pOi, { kiai: true }));
    mv("karate.gedanGyakuLine", "Gedan barai e gyaku zuki su ogni passo: anca a 45 gradi, poi a fronte", lineFwd(sGedan, [gy], pGedan));
    mv("karate.sotoGyakuLine", "Soto uke e gyaku zuki avanzando, giro con gedan barai", lineFwd(sSoto, [gy], pSoto));
    mv("karate.ageUkeBackLine", "Age uke arretrando, il piede passa rasente all'altro; poi di nuovo avanti", lineBack(sAge, null, pAge));
    mv("karate.ageGyakuBackLine", "Age uke e gyaku zuki arretrando, poi avanzando con la stessa coppia", lineBack(sAge, [gy], pAge));
    mv("karate.uchiGyakuBackLine", "Uchi uke e gyaku zuki arretrando, poi di nuovo avanti", lineBack(sUchi, [gy], pUchi));
    mv("karate.kokutsuGedanLine", "Gedan barai in kokutsu arretrando, peso seduto dietro; poi di nuovo avanti", lineBack(sKGedan, null, pGedan, { start: kGedan() }));
    mv("karate.shutoLine", "Shuto uke in kokutsu avanzando e arretrando, peso per due terzi dietro", (() => {
      const q = new Seq(KB());
      q.step(sShuto, "r", { prep: pShuto, act: ["legr", "armr"], tp: 300 });
      q.step(sShuto, "l", { prep: pShuto, act: ["legl", "arml"], tp: 300 });
      q.step(sShuto, "l", { prep: pShuto, act: ["legl", "armr"], tp: 300 });
      q.step(sShuto, "r", { prep: pShuto, act: ["legr", "arml"], tp: 300 });
      return q.end(KB(), 200, 200);
    })());
    mv("karate.shutoBackLine", "Shuto uke in kokutsu arretrando, peso dietro; poi di nuovo avanti", lineBack(sShuto, null, pShuto, { start: KB() }));
    mv("karate.kokutsuStep", "Passo in kokutsu: il piede dietro passa vicino all'altro, ruota e ti siedi dietro", (() => {
      const q = new Seq(KB());
      q.step(sShuto, "r", { prep: pShuto, tp: 450, hp: 250, t: 400, h: 500, act: ["legr"] });
      q.step(sShuto, "r", { lead: "l", prep: pShuto, tp: 450, hp: 250, t: 400, h: 300, act: ["legr"] });
      return q.end(KB(), 200, 200);
    })());

    /* ============================================================ MAE GERI */
    // calcio dalla posa b; poi le braccia tornano come vuole "arms(b)"; il bacino scende un poco (ginocchio d'appoggio piegato)
    function kk(base, s, kind, phase, h, arms, sinkY = 0.04, o = {}) {
      const b = base.copy().kick(s, kind, phase, h, Object.assign({ arms: "none" }, o));
      ["pel", "chest", "head"].forEach((k) => { b.p[k] = add(b.p[k], [0, -sinkY, 0]); });
      if (arms) arms(b);
      return b;
    }
    const armsZ = (b) => { gedan(b, "l"); hik(b, "r"); return b; };
    const zMae = (ph, h = "mid") => kk(ZB(), "r", "front", ph, h, armsZ);
    const maeFr = (t = 1) => [K(ZB(), 300, 200), K(zMae("chamber"), 230 * t, 60 * t), K(zMae("ext"), 150 * t, 220 * t), K(zMae("recoil").act("legr"), 170 * t, 120 * t), K(ZB(), 260 * t, 300)];
    mv2("karate.maeGeri", "Mae geri keage: ginocchio alto, scatto dal ginocchio con l'avampiede, ritorno in caricamento", "Mae geri con l'altra gamba (sinistro dietro)", maeFr());
    mv("karate.maeGeriSlow", "Mae geri in quattro tempi: caricamento, calcio, caricamento, appoggio", [K(ZB(), 300, 300), K(zMae("chamber"), 550, 700), K(zMae("ext"), 550, 900), K(zMae("recoil").act("legr"), 500, 700), K(ZB(), 500, 300)]);
    mv("karate.maeGeriChamber", "Caricamento del mae geri: la gamba dietro sale con il ginocchio alto vicino all'altra", [K(ZB(), 300, 300), K(cp(ZB()).foot("r", 0.15, 0.04, -15, 30).act("legr"), 250, 0), K(zMae("chamber"), 300, 1300), K(ZB(), 500, 300)]);
    // mae geri e appoggio avanti, gyaku zuki, poi passo indietro
    function maeFwd(withGyaku) {
      const q = new Seq(ZB());
      q.pose(zMae("chamber"), 230, 60).pose(zMae("ext"), 150, 220).pose(zMae("recoil").act("legr"), 170, 80);
      const land = place(sGedan("r"), 0, "l", ZB());
      q.pose(noact(land).act("legr"), 200, withGyaku ? 60 : 350);
      q.lead = "r";
      if (withGyaku) q.tech(sGyaku, { act: ["arml", "torso"], h: 450 });
      q.step(sGedan, "r", { lead: "l", prep: pGedan, act: [], tp: 260, t: 240, h: 200 });
      return q.end(ZB(), 200, 200);
    }
    mv("karate.maeGeriFwd", "Mae geri e appoggio avanti in zenkutsu, poi torna indietro", maeFwd(false));
    mv("karate.maeGyakuFwd", "Mae geri, appoggio avanti e gyaku zuki; kime solo sul pugno", maeFwd(true));
    // in linea: mae geri avanzando (appoggio avanti), giro con gedan barai e ritorno
    mv("karate.maeGeriLine", "Mae geri avanzando con appoggio avanti, kiai, giro con gedan barai e ritorno", (() => {
      const q = new Seq(ZB());
      const kick = () => {
        const s = other(q.lead);
        const base = q.cur;
        const ph = (ph2) => { const b = kk(base, s, "front", ph2, "mid", null); if (q.lead === "l") armsZ(b); else { gedan(b, "r"); hik(b, "l"); } return b; };
        q.pose(ph("chamber"), 230, 50).pose(ph("ext"), 150, 200).pose(ph("recoil").act("leg" + s), 160, 60);
        const land = place(sGedan(s), q.yaw, q.lead, q.cur);
        q.pose(noact(land).act("leg" + s), 200, 300);
        q.lead = s;
      };
      const turn = (yaw) => q.step(sGedan, other(q.lead), { yaw, prep: pGedan, act: ["leg" + other(q.lead), "arm" + other(q.lead), "torso"], tp: 300, t: 260, h: 350 });
      kick(); kick(); q.cur.act("legl", "torso", "head"); turn(-180); kick(); kick(); turn(0);
      return q.end(ZB(), 200, 200);
    })());
    // alla sedia: mano sinistra appoggiata di lato
    const chairSt = () => st().sink(0.03).handW("l", 0.05, 0.98, -0.42, "open").elbow("l", [0, -1, -0.5]).handW("r", 0.05, 0.9, 0.24, "open");
    const chairK = (ph, h = "mid") => { const b = chairSt().kick("r", "front", ph, h, { arms: "none" }); b.handW("l", 0.05, 0.98, -0.42, "open").handW("r", 0.0, 0.92, 0.26, "open"); b.elbow("l", [0, -1, -0.5]); return b; };
    const chHalf = () => { const b = chairK("chamber"); const hp = b.hip("r"); b.footAt("r", [hp[0] + 0.5, hp[1] - 0.3, hp[2] - 0.02], 0, 15); b.knee("r", [0.3, 1, 0]); return b; };
    mv("karate.chairReady", "Mano sullo schienale della sedia, gamba d'appoggio appena piegata, busto verticale", [K(st(), 300, 200), K(chairSt().act("arml"), 500, 1200), K(st(), 400, 300)]);
    mv("karate.maeChamberChair", "Ginocchio all'altezza dell'anca, piede sotto il ginocchio, dita tirate su", [K(chairSt(), 300, 200), K(chairK("chamber").act("legr"), 450, 1500), K(chairSt(), 450, 300)]);
    mv("karate.maeHalfExt", "Caricamento tenuto, gamba stesa a metà e richiamata prima di appoggiare", [K(chairSt(), 300, 200), K(chairK("chamber").act("legr"), 400, 900), K(chHalf().act("legr"), 700, 400), K(chairK("chamber").act("legr"), 700, 300), K(chairSt(), 400, 300)]);
    const freeSt = () => st().sink(0.03).handRel("l", 0.25, -0.2, -0.15, "fist").handRel("r", 0.25, -0.2, 0.15, "fist");
    const freeK = (ph, h = "mid") => kk(freeSt(), "r", "front", ph, h, (b) => { b.handRel("l", 0.25, -0.15, -0.2, "fist").handRel("r", 0.2, -0.2, 0.2, "fist"); b.elbow("l", [0, -1, -0.5]).elbow("r", [0, -1, 0.5]); }, 0.01);
    mv("karate.maeChamberFree", "Caricamento tenuto senza appoggio: ginocchio all'altezza dell'anca, equilibrio", [K(freeSt(), 300, 200), K(freeK("chamber").act("legr"), 450, 1600), K(freeSt(), 450, 300)]);
    mv("karate.maeSlowExt", "Estensione lenta: stendi in 3 secondi, tieni all'altezza della pancia, richiama", [K(freeSt(), 300, 200), K(freeK("chamber").act("legr"), 450, 300), K(freeK("ext").act("legr"), 1500, 1300), K(freeK("recoil").act("legr"), 1300, 200), K(freeSt(), 400, 300)]);
    // mae geri bassi alternati da una guardia frontale
    const fr2 = () => { const b = st().foot("l", 0.08, -0.17, 5, 6).foot("r", -0.1, 0.18, -15, 10).sink(0.06); b.handHead("l", 0.25, -0.1, -0.1, "fist").handHead("r", 0.2, -0.12, 0.1, "fist"); return b; };
    const fr2K = (s, ph) => kk(fr2(), s, "front", ph, 0.7, (b) => { b.guard("high"); }, 0.03);
    mv("karate.maeGeriAlt", "Mae geri bassi alternati, sempre con ritorno in caricamento", [K(fr2(), 300, 150), K(fr2K("r", "chamber"), 200, 30), K(fr2K("r", "ext").act("legr"), 140, 100), K(fr2K("r", "recoil").act("legr"), 150, 30), K(fr2(), 200, 100), K(fr2K("l", "chamber"), 200, 30), K(fr2K("l", "ext").act("legl"), 140, 100), K(fr2K("l", "recoil").act("legl"), 150, 30), K(fr2(), 200, 200)]);

    /* ============================================================ MAWASHI GERI */
    const g = kg();
    const gArms = (b) => { b.guard("high"); return b; };
    const kgMaw = (ph, h = "mid", base = g, s = "r") => kk(base, s, "round", ph, h, gArms, 0.04);
    const mawFr = (t = 1, h = "mid") => [K(g, 300, 200), K(cp(g).foot("r", -0.12, 0.08, -40, 30).knee("r", [1, 0.5, 0.3]).turn(15).act("legr"), 180 * t, 20), K(kgMaw("chamber", h), 200 * t, 60 * t), K(kgMaw("ext", h), 160 * t, 220 * t), K(kgMaw("recoil", h).act("legr"), 170 * t, 80 * t), K(g, 260 * t, 300)];
    mv2("karate.mawashiGeri", "Mawashi geri chudan: perno sul piede d'appoggio, ginocchio di lato, scatto e ritorno", "Mawashi geri dall'altra guardia", mawFr());
    mv("karate.mawashiSlow", "Mawashi geri lento: perno, caricamento orizzontale, calcio, caricamento, guardia", speed(mawFr(), 2.6));
    mv("karate.mawashiKnee", "Il ginocchio dietro sale davanti mentre il piede d'appoggio inizia a ruotare", [K(g, 300, 200), K(cp(g).foot("r", -0.12, 0.08, -40, 30).turn(15).act("legr"), 250, 50), K(kk(g, "r", "front", "chamber", "mid", gArms).set("hipYaw", 10).set("chestYaw", 0).fyaw("l", 25).act("legr", "legl"), 300, 1100), K(g, 400, 300)]);
    mv("karate.mawashiChamber", "Perno completo, tallone d'appoggio verso il bersaglio, ginocchio orizzontale", [K(g, 300, 200), K(kk(g, "r", "front", "chamber", "mid", gArms).set("hipYaw", 10).set("chestYaw", 0).fyaw("l", 25), 300, 100), K(kgMaw("chamber").act("legr", "legl"), 300, 1300), K(g, 450, 300)]);
    mv("karate.mawashiRecoil", "Mawashi geri: dopo lo scatto la gamba torna in caricamento, poi guardia, mani alte", [K(g, 300, 200), K(kgMaw("chamber"), 230, 50), K(kgMaw("ext"), 160, 150), K(kgMaw("recoil").act("legr"), 200, 800), K(g, 350, 300)]);
    // mawashi geri bassi alternati (cambio guardia in mezzo)
    mv("karate.mawashiLowAlt", "Mawashi geri bassi alternati con perno, da una guardia e dall'altra", [K(g, 300, 150), K(kgMaw("chamber", 0.6), 200, 30), K(kgMaw("ext", 0.6).act("legr"), 150, 120), K(kgMaw("recoil", 0.6), 160, 30), K(g, 200, 80), K(cp(g).mirror(), 250, 80), K(kgMaw("chamber", 0.6).mirror(), 200, 30), K(kgMaw("ext", 0.6).mirror().act("legl"), 150, 120), K(kgMaw("recoil", 0.6).mirror(), 160, 30), K(cp(g).mirror(), 200, 80), K(g, 250, 200)]);
    // alla sedia: mani sullo schienale davanti, piedi in guardia
    const chairG = () => { const b = kg(); b.set("chestYaw", -15).look(10).lean(0.05); b.handW("l", 0.42, 1.02, -0.18, "open").handW("r", 0.42, 1.02, 0.14, "open"); b.elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]); return b; };
    const chairMaw = (ph, h) => { const b = kk(chairG(), "r", "round", ph, h || "mid", null, 0.03); b.p.chestYaw = Math.min(b.p.chestYaw, 20); b.p.chest = add(b.p.pel, [0.04, 0.48, 0]); b.p.head = add(b.p.chest, [0.03, 0.2, 0]); b.look(-10); b.handW("l", 0.42, 1.02, -0.18, "open").handW("r", 0.42, 1.02, 0.14, "open"); b.elbow("l", [0, -1, -0.3]).elbow("r", [0, -1, 0.3]); return b; };
    mv("karate.chairGuard", "Di fronte alla sedia, mani sullo schienale, piedi in guardia", [K(st(), 300, 200), K(chairG().act("arml", "armr"), 500, 1200), K(st(), 400, 300)]);
    mv("karate.mawashiPivot", "Ruota sull'avampiede finché il tallone punta la sedia e solleva il ginocchio di lato", [K(chairG(), 300, 200), K(cp(chairG()).fyaw("l", 30).foot("r", -0.15, 0.06, -40, 30).act("legl"), 400, 300), K(chairMaw("chamber").act("legr", "legl"), 400, 1200), K(chairG(), 450, 300)]);
    mv("karate.mawashiSlowChair", "Caricamento tenuto, gamba stesa lenta in orizzontale, richiamo prima di appoggiare", [K(chairG(), 300, 200), K(chairMaw("chamber").act("legr"), 450, 900), K(chairMaw("ext").act("legr"), 900, 700), K(chairMaw("recoil").act("legr"), 800, 300), K(chairG(), 450, 300)]);

    /* ============================================================ YOKO GERI */
    // calcio laterale verso destra (+z): si costruisce girati di 90 gradi e poi si ruota indietro
    function yoko(base, ph, h, opts = {}) {
      const b = base.copy().spin(90).kick("r", "side", ph, h, { arms: "none" });
      if (opts.keage) {
        b.p.hipYaw = ph === "chamber" || ph === "recoil" ? 40 : 70; b.p.chestYaw = b.p.hipYaw - 10;
        if (ph === "chamber" || ph === "recoil") { const hp = b.hip("r"); b.footAt("r", [hp[0] - 0.02, hp[1] - 0.3, hp[2] - 0.18], 80, 10); b.knee("r", [1, 0.8, -0.3]); }
        else { const hp = b.hip("r"); b.footAt("r", [hp[0] + 0.82, (typeof h === "number" ? h : 0.98) + 0.05, hp[2] - 0.08], 90, 30); b.knee("r", [0, 1, -0.6]); }
      }
      ["pel", "chest", "head"].forEach((k) => { b.p[k] = add(b.p[k], [0, -(opts.sink || 0.04), 0]); });
      b.spin(-90);
      b.look(-75);
      return b;
    }
    const hei = heisoku();
    const yokoArms = (b) => { hik(b, "r"); hik(b, "l"); return b; };
    // yoko geri keage con uraken (piedi uniti, pugni sul fianco opposto)
    const stackL = (b) => { b.handPel("l", 0.02, 0.12, -0.2, "fist").handPel("r", 0.05, 0.2, -0.16, "fist"); b.elbow("l", [-0.5, -1, -0.3]).elbow("r", [0.3, -0.6, 1]); return b; };
    const ykReady = () => stackL(heisoku().look(-80)).act("head");
    const ykCham = () => { const b = yoko(hei, "chamber", "mid", { keage: true }); b.handPel("l", 0.02, 0.12, -0.2, "fist"); hc(b, "r", [0.24, 0.0, -0.08], "fist"); b.elbow("r", [0.2, -0.3, 1]); return b; };
    const ykExt = (h = "mid") => { const b = yoko(hei, "ext", h, { keage: true }); b.handPel("l", 0.02, 0.12, -0.2, "fist"); hs(b, "r", [0.05, 0.04, 0.5], "fist"); b.elbow("r", [0, -1, 0.3]); return b; };
    mv2("karate.yokoUraken", "Yoko geri keage con uraken: ginocchio alto, calcio di taglio e dorso del pugno insieme", "Yoko geri keage con uraken dall'altro lato", [K(heisoku(), 300, 150), K(ykReady(), 250, 250), K(ykCham().act("legr", "armr"), 300, 100), K(ykExt().act("legr", "armr"), 170, 300), K(ykCham().act("legr", "armr"), 180, 100), K(stackL(heisoku().look(-80)), 250, 150), K(heisoku(), 300, 300)]);
    mv("karate.yokoUrakenReady", "Piedi vicini, pugni sovrapposti sul fianco opposto, la testa gira verso il bersaglio", [K(heisoku(), 300, 300), K(ykReady().act("head", "arml", "armr"), 500, 1300), K(heisoku(), 450, 300)]);
    mv("karate.yokoUrakenChamber", "Ginocchio alto davanti al corpo, il pugno sopra si prepara davanti al petto", [K(heisoku(), 300, 200), K(ykReady(), 300, 200), K(ykCham().act("legr", "armr"), 400, 1300), K(stackL(heisoku().look(-80)), 350, 100), K(heisoku(), 350, 300)]);
    const ykK = (ph, h) => { const b = yoko(hei, ph, h, { keage: true }); yokoArms(b); return b; };
    mv2("karate.yokoKeage", "Yoko geri keage: ginocchio alto davanti, il piede frusta di lato verso l'alto col taglio", "Yoko geri keage con l'altra gamba", [K(hei, 300, 200), K(ykK("chamber").act("legr"), 280, 60), K(ykK("ext").act("legr"), 160, 250), K(ykK("recoil").act("legr"), 170, 80), K(hei, 280, 300)]);
    // caricamento laterale alla sedia (mano sinistra appoggiata a sinistra) e keage lento
    const chairS = () => heisoku().handW("l", 0.0, 0.98, -0.42, "open").elbow("l", [0, -1, -0.5]);
    const chYk = (ph, h) => { const b = yoko(chairS(), ph, h || "mid", { keage: true }); b.handW("l", 0.0, 0.98, -0.42, "open").elbow("l", [0, -1, -0.5]); hik(b, "r"); return b; };
    mv("karate.chairSide", "Di fianco alla sedia, una mano sullo schienale, piedi uniti, gamba d'appoggio piegata", [K(st(), 300, 200), K(chairS().act("arml"), 500, 1200), K(st(), 400, 300)]);
    mv("karate.yokoChamberChair", "Ginocchio esterno alto davanti al petto, piede accanto al ginocchio, taglio verso il bersaglio", [K(chairS(), 300, 200), K(chYk("chamber").act("legr"), 450, 1500), K(chairS(), 450, 300)]);
    mv("karate.sokuto", "Dita tirate indietro e caviglia flessa: colpisce il bordo esterno del piede", [K(chairS(), 300, 200), K(chYk("chamber"), 400, 300), K(chYk("ext", 0.8).act("legr"), 600, 1300), K(chYk("chamber"), 500, 200), K(chairS(), 400, 300)]);
    mv("karate.yokoKeageSlowChair", "Gamba stesa lenta di lato con un arco verso l'alto, poi caricamento e appoggio", [K(chairS(), 300, 200), K(chYk("chamber").act("legr"), 450, 500), K(chYk("ext").act("legr"), 1000, 800), K(chYk("recoil").act("legr"), 800, 200), K(chairS(), 450, 300)]);

    /* ============================================================ KUMITE: PASSI E PUGNI */
    const gStep = (dx, dz = 0) => cp(g).move(dx, dz);
    const gFoot = (s, dx, dz = 0, base = g) => { const b = cp(base); b.step(s, dx, dz); b.shift(dx * 0.45, dz * 0.45); return b; };
    const bounce = (b) => cp(b).heel("l", 22).heel("r", 30).sink(-0.035);
    mv("karate.kumiteStance", "Guardia: piedi a una volta e mezza le spalle, corpo a 45 gradi, tallone dietro sollevato", [K(st(), 300, 200), K(cp(g).set("hand", { l: [0.05, 0.92, -0.25], r: [-0.08, 0.92, 0.25] }).act("legl", "legr"), 500, 1200), K(st(), 400, 300)]);
    mv("karate.kumiteGuard", "Mano avanti all'altezza del mento, gomito in basso; mano dietro davanti al plesso", [K(cp(g).set("hand", { l: [0.05, 0.92, -0.25], r: [-0.08, 0.92, 0.25] }), 300, 200), K(cp(g).act("arml", "armr"), 500, 1300), K(cp(g).set("hand", { l: [0.05, 0.92, -0.25], r: [-0.08, 0.92, 0.25] }), 400, 300)]);
    mv("karate.kumiteBounce", "Guardia da kumite con saltello leggero sugli avampiedi", [K(g, 250, 50), K(bounce(g).act("legl", "legr"), 170, 40), K(g, 170, 40), K(bounce(g), 170, 40), K(g, 170, 40), K(bounce(g), 170, 40), K(g, 170, 200)]);
    const yFwd = [K(gFoot("l", 0.2).act("legl"), 180, 60), K(gStep(0.2).act("legr"), 160, 160)];
    const yBack = (from) => [K(gFoot("r", -0.2, 0, from).act("legr"), 180, 60), K(cp(from).move(-0.2).act("legl"), 160, 160)];
    mv("karate.yoriAshi", "Yori ashi: si muove prima il piede verso cui vai, l'altro segue della stessa misura", [K(g, 300, 200), ...yFwd, ...yBack(gStep(0.2)), K(g, 200, 200)]);
    mv("karate.yoriAshiSide", "Yori ashi laterale: verso destra parte il destro, verso sinistra il sinistro", [K(g, 300, 200), K(gFoot("r", 0, 0.2).act("legr"), 180, 60), K(gStep(0, 0.2).act("legl"), 160, 160), K(gFoot("l", 0, -0.2, gStep(0, 0.2)).act("legl"), 180, 60), K(cp(g).act("legr"), 160, 160), K(gFoot("l", 0, -0.2).act("legl"), 180, 60), K(gStep(0, -0.2).act("legr"), 160, 160), K(gFoot("r", 0, 0.2, gStep(0, -0.2)).act("legr"), 180, 60), K(g, 160, 200)]);
    const tsugiA = cp(g).foot("r", 0.06, 0.06, -45, 20).shift(0.12).act("legr");
    const tsugiB = cp(g).move(0.36).act("legl");
    mv("karate.tsugiAshi", "Tsugi ashi: il piede dietro si avvicina all'altro, poi il piede avanti parte lungo", [K(g, 300, 200), K(tsugiA, 200, 100), K(tsugiB, 200, 250), K(gFoot("r", -0.18, 0, tsugiB), 180, 40), K(gStep(0.18), 160, 60), K(gFoot("r", -0.18, 0, gStep(0.18)), 180, 40), K(g, 160, 200)]);
    mv("karate.stepsCombo", "Due yori ashi avanti, uno indietro, un tsugi ashi, poi fuori: sempre in guardia", [K(g, 300, 150), ...yFwd, K(gFoot("l", 0.2, 0, gStep(0.2)), 180, 60), K(gStep(0.4), 160, 160), ...yBack(gStep(0.4)), K(cp(gStep(0.2)).foot("r", 0.26, 0.06, -45, 20).shift(0.12), 200, 80), K(gStep(0.56).act("legl"), 200, 220), K(gFoot("r", -0.28, 0, gStep(0.56)), 200, 40), K(gStep(0.28), 160, 60), K(gFoot("r", -0.28, 0, gStep(0.28)), 200, 40), K(g, 160, 200)]);
    mv("karate.yoriAshi4", "Passi da kumite nelle quattro direzioni: avanti, destra, indietro, sinistra", [K(g, 300, 150), ...yFwd, K(gFoot("r", 0, 0.2, gStep(0.2)), 180, 60), K(gStep(0.2, 0.2), 160, 150), K(gFoot("r", -0.2, 0, gStep(0.2, 0.2)), 180, 60), K(gStep(0, 0.2), 160, 150), K(gFoot("l", 0, -0.2, gStep(0, 0.2)), 180, 60), K(g, 160, 200)]);
    mv("karate.stepsStop", "Tre passi, fermo un istante in guardia stabile, poi riparti", [K(g, 300, 150), ...yFwd, K(gFoot("l", 0.2, 0, gStep(0.2)), 180, 60), K(gStep(0.4), 160, 60), K(gFoot("l", 0.2, 0, gStep(0.4)), 180, 60), K(gStep(0.6).act("torso", "head"), 160, 800), ...yBack(gStep(0.6)), ...yBack(gStep(0.4)), ...yBack(gStep(0.2)), K(g, 200, 200)]);
    mv("karate.kumiteBounce4", "Saltello in guardia con piccoli spostamenti avanti, indietro e di lato", [K(g, 250, 50), K(bounce(g), 160, 30), K(bounce(gStep(0.15)).act("legl", "legr"), 170, 30), K(gStep(0.15), 150, 30), K(bounce(g).act("legl", "legr"), 170, 30), K(bounce(gStep(0, 0.15)).act("legl", "legr"), 170, 30), K(gStep(0, 0.15), 150, 30), K(bounce(gStep(0, -0.1)).act("legl", "legr"), 200, 30), K(g, 170, 200)]);
    // pugni dalla guardia
    const kiz = (base = g) => { const b = cp(base).turn(-10).lean(0.06).look(50); b.straight("l", [0.95, 1.47, 0.02], 0.97); b.handW("r", 0.16, 1.36, 0.06, "fist"); b.elbow("r", [0, -1, 0.3]); return b.act("arml"); };
    const gyk = (base = g, y = 1.17) => { const b = cp(base).turn(52).lean(0.07).look(-5).heel("r", 30).fyaw("r", -20); b.straight("r", [0.95, y, 0.0], 0.97); b.handW("l", 0.16, 1.34, -0.07, "fist"); b.elbow("l", [0, -1, -0.4]); return b.act("armr", "legr", "torso"); };
    mv2("karate.kizamiZuki", "Kizami zuki: la mano avanti va dritta al mento, la spalla avanza, la mano dietro resta alta", "Kizami zuki dall'altra guardia", [K(g, 300, 200), K(kiz(), 150, 300), K(g, 220, 300)]);
    mv2("karate.gyakuKumite", "Gyaku zuki chudan: spinta del piede dietro, l'anca ruota, la mano avanti torna in guardia", "Gyaku zuki chudan dall'altra guardia", [K(g, 300, 200), K(gyk(), 170, 350), K(g, 230, 300)]);
    const kizIn = () => { const b = kiz(gFoot("l", 0.22)); return b.act("arml", "legl"); };
    mv2("karate.kizamiYori", "Kizami zuki con yori ashi: il pugno arriva quando il piede avanti atterra, poi fuori", "Kizami zuki con yori ashi dall'altra guardia", [K(g, 300, 200), K(kizIn(), 170, 120), K(cp(gStep(0.22)).act("legr"), 160, 150), ...yBack(gStep(0.22)).map((f) => K(f.p, f.t, f.h)), K(g, 160, 200)]);
    mv("karate.gyakuYori", "Yori ashi e gyaku zuki chudan che tocca appena il bersaglio, poi uscita", [K(g, 300, 200), K(gFoot("l", 0.22).act("legl"), 170, 30), K(gyk(gStep(0.22)), 170, 300), K(gStep(0.22), 200, 60), ...yBack(gStep(0.22)).map((f) => K(f.p, f.t, f.h)), K(g, 160, 200)]);
    const kgFrames = (o = {}) => {
      const t = o.t || 1;
      const entry = o.tsugi ? [K(cp(g).foot("r", 0.06, 0.06, -45, 20).shift(0.12).act("legr"), 200 * t, 60 * t), K(kiz(gStep(0.36)).act("arml", "legl"), 180 * t, 120 * t)] : [K(kizIn(), 170 * t, 100 * t)];
      const at = o.tsugi ? 0.36 : 0.22;
      const fr = [K(g, 300, 150), ...entry, K(gyk(gStep(at)).act("armr", "legr", "torso", ...(o.kiai ? ["head"] : [])), 170 * t, (o.kiai ? 800 : 250) * t), K(gStep(at), 200 * t, 40)];
      if (o.side) fr.push(K(gFoot("l", -0.05, -0.3, gStep(at)).act("legl"), 200 * t, 40), K(gStep(at - 0.05, -0.3).act("legr"), 170 * t, 200 * t), K(gStep(at * 0.5, -0.15), 250, 40));
      else fr.push(...yBack(gStep(at)).map((f) => K(f.p, f.t * t, f.h * t)));
      if (o.tsugi) fr.push(...yBack(gStep(0.16)).map((f) => K(f.p, f.t * t, f.h * t)));
      fr.push(K(g, 200, 200));
      return fr;
    };
    mv2("karate.kizamiGyaku", "Kizami zuki jodan entrando, gyaku zuki chudan, uscita con yori ashi indietro", "Kizami zuki e gyaku zuki dall'altra guardia", kgFrames());
    mv("karate.kizamiGyakuSlow", "Kizami e gyaku zuki lenti, kime su entrambi, uscita in guardia ferma", kgFrames({ t: 2 }));
    mv("karate.kizamiGyakuTsugi", "Entrata in tsugi ashi da più lontano, kizami zuki e gyaku zuki, uscita", kgFrames({ tsugi: true }));
    mv("karate.kizamiGyakuSide", "Kizami e gyaku zuki, poi uscita di lato invece che indietro", kgFrames({ side: true }));
    mv("karate.kizamiGyakuKiai", "Kizami e gyaku zuki alla massima velocità con kiai sull'ultimo pugno", kgFrames({ kiai: true, t: 0.8 }));
    mv("karate.kizamiGyakuLight", "Kizami zuki e gyaku zuki leggeri saltellando, senza kime", [K(g, 250, 50), K(bounce(g), 160, 30), K(g, 150, 30), K(kiz(), 160, 120), K(bounce(g), 180, 30), K(gyk(), 170, 120), K(bounce(g), 200, 30), K(g, 170, 200)]);
    mv("karate.kizamiGyakuFast", "Kizami zuki e gyaku zuki alla massima velocità con passo avanti e indietro", speed(kgFrames(), 0.7));
    mv("karate.tsugiKizami", "Esplosione in tsugi ashi con kizami zuki e ritorno, il più veloce possibile", [K(g, 300, 150), K(cp(g).foot("r", 0.06, 0.06, -45, 20).shift(0.12).act("legr"), 170, 40), K(kiz(gStep(0.36)).act("arml", "legl"), 150, 200), K(gFoot("r", -0.18, 0, gStep(0.36)), 160, 30), K(gStep(0.18), 140, 40), K(gFoot("r", -0.18, 0, gStep(0.18)), 160, 30), K(g, 140, 200)]);
    // uscita d'angolo: passo in diagonale e ti rigiri verso l'avversario
    const angle = (() => { const b = cp(g).spin(25).move(0.05, -0.32); return b; })();
    mv("karate.angleStep", "Dopo l'azione esci in diagonale e ti rigiri verso l'avversario: nuovo angolo", [K(g, 300, 150), K(gFoot("l", 0.05, -0.32).act("legl"), 200, 40), K(cp(angle).act("legr", "torso"), 220, 400), K(gFoot("r", 0, 0.3, angle), 220, 40), K(g, 200, 200)]);
    // uscita laterale e gyaku zuki (go no sen)
    const sideOut = gStep(0, 0.3);
    mv("karate.sideStepGyaku", "Esci di lato quando l'avversario entra, poi gyaku zuki quando si allontana", [K(g, 300, 150), K(gFoot("r", 0, 0.3).act("legr"), 180, 40), K(cp(sideOut).spin(15).act("legl"), 160, 120), K(gyk(cp(sideOut).spin(15)), 170, 350), K(sideOut, 220, 60), K(gFoot("l", 0, -0.3, sideOut), 200, 40), K(g, 180, 200)]);
    // parata con la mano avanti e gyaku zuki in guardia
    const gParry = cp(g).handW("l", 0.4, 1.33, 0.1, "open").elbow("l", [0, -1, -0.2]).turn(-8).act("arml");
    mv("karate.parryGyaku", "Parata con la mano avanti che devia l'attacco, subito gyaku zuki", [K(g, 300, 150), K(gParry, 150, 150), K(gyk(), 160, 350), K(g, 230, 250)]);
    mv("karate.pushTarget", "Spingi leggermente il bersaglio con la mano avanti e lascialo oscillare", [K(g, 300, 200), K(cp(g).handW("l", 0.62, 1.38, -0.02, "open").lean(0.04).act("arml"), 350, 350), K(g, 350, 700)]);
    mv("karate.switchJump", "Cambio di guardia saltato: piedi bassi, atterraggio morbido e silenzioso", [K(g, 250, 80), K(cp(g).sink(-0.06).set("foot", { l: [0.18, 0.16, -0.05], r: [-0.18, 0.16, 0.1] }).act("legl", "legr"), 170, 30), K(cp(g).mirror(), 170, 200), K(cp(g).mirror().sink(-0.06).set("foot", { l: [-0.18, 0.16, -0.1], r: [0.18, 0.16, 0.05] }).act("legl", "legr"), 170, 30), K(g, 170, 250)]);
    const sk = (s) => { const ss = sg(s); const b = st().sink(0.12).foot(s, 0, ss * 0.45, ss * -10, 0).footAt(other(s), [-0.25, 0.2, ss * 0.32], 0, 30); b.set("pel", [-0.05, 0.8, ss * 0.36]).set("chest", [0.12, 1.27, ss * 0.33]).set("head", [0.2, 1.45, ss * 0.32]); b.knee(s, [1, 0, ss * 0.3]).knee(other(s), [1, 0, 0]); b.handRel(s, -0.2, -0.3, ss * 0.2, "fist").handRel(other(s), 0.3, -0.15, -ss * 0.15, "fist"); return b; };
    mv("karate.skater", "Salti laterali da un piede all'altro (pattinatore), fermo un istante a ogni atterraggio", [K(st(), 300, 100), K(sk("r").act("legr", "legl"), 300, 300), K(sk("l").act("legl", "legr"), 330, 300), K(sk("r").act("legr", "legl"), 330, 300), K(st(), 350, 200)]);

    /* ============================================================ USHIRO GERI, GIRI, USHIRO MAWASHI */
    // di spalle al bersaglio: perno su entrambi gli avampiedi, sguardo oltre la spalla destra
    const gBack = (() => { const b = cp(g); b.set("hipYaw", -205).set("chestYaw", -200).look(-115); b.fyaw("l", -190).heel("l", 18).fyaw("r", -225).heel("r", 12); b.set("pel", [-0.02, 0.88, 0.0]).set("chest", [-0.04, 1.37, 0.0]).set("head", [-0.06, 1.57, 0.0]); b.guard("high"); b.knee("l", [-1, 0, 0.2]).knee("r", [-1, 0, -0.1]); return b; })();
    const gTurn = (() => { const b = mix(g, gBack, 0.5); b.p.headYaw = -80; b.guard("high"); return b; })();
    const ush = (ph, h = "mid") => { const b = kk(g, "r", "back", ph, h, (x) => x.guard("high"), 0.04); return b; };
    const ushFr = (t = 1) => [K(g, 300, 150), K(cp(gTurn).act("head", "torso"), 220 * t, 40 * t), K(cp(gBack).act("legl"), 200 * t, 60 * t), K(ush("chamber"), 200 * t, 60 * t), K(ush("ext"), 170 * t, 260 * t), K(ush("recoil").act("legr"), 180 * t, 60 * t), K(cp(gBack), 200 * t, 40 * t), K(g, 300 * t, 300)];
    mv2("karate.ushiroGeri", "Ushiro geri: la testa gira, perno fino a essere di spalle, ginocchia vicine, tallone dritto", "Ushiro geri dall'altra guardia", ushFr());
    mv("karate.ushiroGeriSlow", "Ushiro geri basso e lento: sguardo, caricamento vicino all'altra gamba, spinta dritta", speed(ushFr(), 2.2).map((f, i) => (i === 4 ? K(ush("ext", 0.8), f.t, f.h) : f)));
    mv("karate.ushiroFromBack", "Ushiro geri partendo già di spalle: sguardo oltre la spalla, tallone dritto", [K(gBack, 300, 300), K(ush("chamber"), 250, 80), K(ush("ext"), 180, 350), K(ush("recoil").act("legr"), 200, 100), K(gBack, 250, 400)]);
    mv("karate.turnBack", "Giro senza calcio: la testa guarda dietro, perno sul piede avanti fino a essere di spalle", [K(g, 300, 200), K(cp(gTurn).act("head"), 300, 150), K(cp(gBack).act("legl", "legr", "torso"), 350, 600), K(cp(gTurn), 350, 50), K(g, 300, 300)]);
    mv("karate.lookBack", "Dalla guardia gira la testa e guarda oltre la spalla posteriore", [K(g, 300, 200), K(cp(g).look(-110).twist(-15).act("head"), 400, 1200), K(g, 400, 300)]);
    // giro completo di 360 gradi sull'avampiede del piede avanti (fotogramma finale "agganciato" senza tempo)
    const gS = (d) => cp(g).spin(d);
    const g360 = () => { const b = cp(g); b.spin(-360); return b; };
    const spinFr = (stop) => [K(g, 300, 150), K(cp(gTurn).act("head"), 220, 30), K(cp(gBack).act("legl", "legr"), 220, stop ? 700 : 30), K(cp(gS(-270)).set("headYaw", 30).heel("l", 18), 230, 30), K(g360().act("legl", "legr"), 230, 250), K(g, 0, 250)];
    mv2("karate.spin360", "Giro completo sull'avampiede del piede avanti: la testa guida, poi di nuovo in guardia", "Giro completo dall'altra guardia", spinFr(false));
    mv("karate.spinStop", "Giro con sosta di spalle: trova il bersaglio con lo sguardo, poi completa", spinFr(true));
    mv("karate.spinSlow", "Giro lento sul posto sull'avampiede, poi fermo in guardia fissando un punto", speed(spinFr(false), 2));
    // ushiro mawashi geri: giro, gamba distesa poco a lato del bersaglio, aggancio di tallone, giro completo
    const uraM = (ph, h = 0.95) => { const b = kk(g, "r", "hook", ph, h, (x) => x.guard("high"), 0.04); b.spin(-360); return b; };
    const umFr = (t = 1, h = 0.95) => [K(g, 300, 150), K(cp(gTurn).act("head", "torso"), 200 * t, 30), K(cp(gBack).act("legl"), 200 * t, 30), K(uraM("ext", h), 200 * t, 60 * t), K(uraM("hook", h), 180 * t, 200 * t), K(g360().act("legr"), 260 * t, 300), K(g, 0, 250)];
    mv2("karate.ushiroMawashi", "Ushiro mawashi geri: la testa gira, perno, gamba distesa a lato e aggancio di tallone", "Ushiro mawashi geri dall'altra guardia", umFr());
    mv("karate.ushiroMawashiSlow", "Ushiro mawashi geri lento e basso: sguardo prima della gamba, tallone in orizzontale", speed(umFr(1, 0.75), 2.2));
    mv("karate.uraMawashiFromBack", "Partendo di spalle: solo distensione della gamba e aggancio con il tallone", [K(gBack, 300, 300), K(uraM("ext"), 280, 100), K(uraM("hook"), 250, 350), K(cp(gBack).spin(-360), 280, 100), K(gBack, 0, 400)]);
    mv("karate.spinLook", "Dalla guardia la testa trova il bersaglio oltre la spalla, perno sul piede avanti", [K(g, 300, 200), K(cp(gTurn).act("head"), 300, 200), K(cp(gBack).act("head", "legl"), 300, 900), K(cp(gTurn), 300, 50), K(g, 300, 300)]);
    // aggancio del tallone alla sedia (gamba distesa a destra, poi il ginocchio si piega)
    const hookExt = (h = 0.55) => { const b = yoko(chairS(), "ext", h, {}); b.handW("l", 0.0, 0.98, -0.42, "open").elbow("l", [0, -1, -0.5]); hik(b, "r"); b.p.chestYaw = 20; return b; };
    const hookIn = (h = 0.6) => { const b = hookExt(h); const hp = b.hip("r"); b.footAt("r", [hp[0] - 0.3, h, hp[2] + 0.45], 120, 20); b.knee("r", [0.3, 0.5, 1]); return b; };
    mv("karate.hookExtend", "Mano sulla sedia, gamba distesa di lato e bassa, poco oltre il bersaglio", [K(chairS(), 300, 200), K(chYk("chamber"), 350, 80), K(hookExt().act("legr"), 400, 1300), K(chYk("chamber"), 350, 80), K(chairS(), 350, 300)]);
    mv("karate.heelHook", "Il ginocchio si piega e il tallone fa un arco orizzontale, poi richiama e appoggia", [K(chairS(), 300, 200), K(chYk("chamber"), 300, 60), K(hookExt(), 300, 300), K(hookIn().act("legr"), 350, 500), K(chYk("chamber"), 300, 80), K(chairS(), 300, 300)]);
    mv("karate.heelHookHigh", "Aggancio di tallone all'altezza della coscia, se resti stabile", [K(chairS(), 300, 200), K(chYk("chamber"), 300, 60), K(hookExt(0.8), 300, 300), K(hookIn(0.85).act("legr"), 350, 500), K(chYk("chamber"), 300, 80), K(chairS(), 300, 300)]);
    mv("karate.heelHookPivot", "Aggancio di tallone con il piede d'appoggio che ruota come nel calcio completo", [K(chairS(), 300, 200), K(chYk("chamber"), 300, 60), K(hookExt().fyaw("l", 75).heel("l", 15), 300, 300), K(hookIn().fyaw("l", 95).heel("l", 15).act("legr", "legl"), 350, 500), K(chYk("chamber"), 300, 80), K(chairS(), 300, 300)]);

    /* ============================================================ KIZAMI MAWASHI GERI */
    const gSlide = cp(g).foot("r", 0.08, 0.06, -50, 20).shift(0.1).act("legr");
    const kzm = (ph, h = "mid") => kk(gSlide, "l", "round", ph, h, (x) => x.guard("high"), 0.04);
    const kzmFr = (t = 1) => [K(g, 300, 150), K(gSlide, 170 * t, 40 * t), K(kzm("chamber"), 180 * t, 40 * t), K(kzm("ext"), 150 * t, 220 * t), K(kzm("recoil").act("legl"), 160 * t, 60 * t), K(cp(gSlide), 170 * t, 40 * t), K(g, 220 * t, 250)];
    mv2("karate.kizamiMawashi", "Kizami mawashi geri: il piede dietro scivola avanti, la gamba avanti carica di lato e scatta", "Kizami mawashi geri dall'altra guardia", kzmFr());

    /* ============================================================ YOKO GERI KEKOMI */
    const kb0 = () => kib().look(-85);
    const kbAt = (dz) => cp(kb0()).move(0, dz);
    // passo incrociato (kosa) verso destra: il sinistro passa dietro il destro
    const kosaR = (dz) => { const b = kbAt(dz); b.foot("l", -0.1, 0.3, 30, 15); b.shift(0, 0.3); b.sink(0.03); b.knee("l", [0.6, 0, 1]); return b; };
    const kek = (dz, ph, h = "mid", sgn = 1) => { const b = yoko(kosaR(dz), ph, h, { sink: 0.05 }); hik(b, "l"); hik(b, "r"); return b; };
    const kekR = (dz, ph, h) => kek(dz, ph, h);
    // per andare a sinistra usa lo specchio
    const kekomiPass = (dz0, t = 1) => [K(kosaR(dz0).act("legl"), 220 * t, 60 * t), K(kekR(dz0, "chamber").act("legr"), 220 * t, 60 * t), K(kekR(dz0, "ext").act("legr"), 170 * t, 280 * t), K(kekR(dz0, "recoil").act("legr"), 180 * t, 60 * t), K(cp(kbAt(dz0 + 0.8)).act("legr"), 220 * t, 250 * t)];
    const mirF = (fr) => fr.map((f) => K(f.p.copy().mirror(), f.t, f.h, f.act ? mirAct(f.act) : undefined));
    mv("karate.kekomiKiba", "Yoko geri kekomi da kiba: passo incrociato, ginocchio alto, spinta del tallone, kiba", [K(kb0(), 300, 200), ...kekomiPass(0), K(cp(kbAt(0.8)).look(85), 300, 200), ...mirF(kekomiPass(-0.8)).map((f, i) => i === 4 ? K(cp(kb0()).look(85).act("legl"), f.t, f.h) : f), K(kb0(), 300, 200)]);
    mv("karate.kekomiChamber", "Da kiba: il piede dietro incrocia (kosa), poi la gamba avanti sale in caricamento", [K(kb0(), 300, 200), K(kosaR(0).act("legl"), 300, 200), K(kekR(0, "chamber").act("legr"), 300, 1200), K(kosaR(0), 300, 150), K(kb0(), 300, 300)]);
    mv("karate.kekomiFreeze", "Kekomi fermo in estensione: testa, anca e tallone in linea, tallone d'appoggio al bersaglio", [K(kb0(), 300, 200), K(kosaR(0).act("legl"), 250, 60), K(kekR(0, "chamber").act("legr"), 250, 80), K(kekR(0, "ext").act("legr"), 250, 1400), K(kekR(0, "recoil"), 250, 80), K(kosaR(0), 250, 100), K(kb0(), 300, 300)]);
    mv("karate.kibaLook", "Kiba dachi sulla linea, sguardo verso la direzione in cui ti sposti", [K(yoi(), 300, 200), K(kb0().act("legl", "legr", "head"), 500, 1300), K(yoi(), 400, 300)]);
    mv("karate.kibaKosa", "Spostamenti laterali in kiba dachi incrociando i piedi (kosa), andata e ritorno", [K(kb0(), 300, 150), K(kosaR(0).act("legl"), 250, 60), K(cp(kbAt(0.6)).act("legr"), 250, 150), K(kosaR(0.6).act("legl"), 250, 60), K(cp(kbAt(1.2)).act("legr"), 250, 200), K(cp(kbAt(1.2)).look(85), 250, 100), ...mirF([K(kosaR(-1.2).act("legl"), 250, 60), K(cp(kbAt(-0.6)).act("legr"), 250, 150), K(kosaR(-0.6).act("legl"), 250, 60), K(cp(kbAt(0)).act("legr"), 250, 200)]), K(kb0(), 300, 200)]);
    // kekomi dalla guardia con la gamba avanti, dopo un piccolo passo del piede dietro
    const gStepUp = cp(g).foot("r", 0.12, 0.1, -60, 15).shift(0.12).act("legr");
    const kekG = (ph, h = "mid") => kk(gStepUp, "l", "side", ph, h, (x) => x.guard("high"), 0.05);
    mv2("karate.kekomiGuard", "Dalla guardia: passo del piede dietro verso quello avanti, kekomi con la gamba avanti", "Kekomi dalla guardia dall'altro lato", [K(g, 300, 150), K(gStepUp, 200, 40), K(kekG("chamber"), 200, 50), K(kekG("ext"), 170, 280), K(kekG("recoil").act("legl"), 180, 60), K(cp(gStepUp), 180, 40), K(g, 220, 250)]);
    // al muro: mani appoggiate davanti, calcio verso destra
    const wallSt = () => heisoku().handW("l", 0.45, 1.3, -0.2, "open").handW("r", 0.45, 1.3, 0.2, "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]);
    const wallK = (ph, h = "mid", hold) => { const b = yoko(wallSt(), ph, h, {}); b.p.chestYaw = 30; b.p.chest = add(b.p.pel, [0.08, 0.47, -0.04]); b.p.head = add(b.p.chest, [0.03, 0.2, 0]); b.look(-50); b.handW("l", 0.45, 1.3, -0.2, "open").handW("r", 0.45, 1.3, 0.12, "open").elbow("l", [0, -1, -0.4]).elbow("r", [0, -1, 0.4]); return b; };
    mv("karate.wallReady", "Fronte al muro, mani appoggiate all'altezza del petto, il bersaglio è di lato", [K(st(), 300, 200), K(wallSt().act("arml", "armr"), 450, 1200), K(st(), 400, 300)]);
    mv("karate.wallYokoChamber", "Ginocchio alto davanti, piede accanto al ginocchio d'appoggio, taglio verso il bersaglio", [K(wallSt(), 300, 200), K(wallK("chamber").act("legr"), 450, 1400), K(wallSt(), 450, 300)]);
    mv("karate.wallKekomi", "Spinta lenta del tallone di lato, il piede d'appoggio ruota; poi richiama e appoggia", [K(wallSt(), 300, 200), K(wallK("chamber").act("legr"), 400, 300), K(wallK("ext").act("legr", "legl"), 1200, 600), K(wallK("recoil").act("legr"), 700, 200), K(wallSt(), 400, 300)]);
    mv("karate.wallKekomiHold", "Tenuta in estensione: testa, anca e tallone su una linea, tallone più alto delle dita", [K(wallSt(), 300, 200), K(wallK("chamber"), 400, 200), K(wallK("ext").act("legr", "torso"), 600, 2200), K(wallK("recoil"), 500, 150), K(wallSt(), 400, 300)]);
  });
})(typeof window !== "undefined" ? window : globalThis);
