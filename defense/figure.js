/*
 * Progetto A - Difesa: figura animata delle tecniche.
 *
 * Un manichino 2D disegnato in SVG. Ogni posa indica solo bacino, petto, testa,
 * mani e piedi; gomiti e ginocchia li calcola la cinematica inversa a due ossa.
 * "turn" va da 0 (profilo) a 1 (frontale) e cambia larghezza di busto e spalle;
 * "facing" (+1 destra, -1 sinistra) decide verso dove guarda il profilo.
 * Le pose si interpolano tra un fotogramma e l'altro: niente immagini, tutto vettoriale.
 */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var GROUND = 232;
  var L = { upper: 33, fore: 31, thigh: 45, shin: 45, head: 13.5 };

  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpPt(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
  function mul(a, k) { return [a[0] * k, a[1] * k]; }
  function len(a) { return Math.hypot(a[0], a[1]); }
  function norm(a) { var l = len(a) || 1; return [a[0] / l, a[1] / l]; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // Due ossa da "root" verso "target": restituisce [giunto, estremita'].
  // Delle due soluzioni sceglie quella che va nella direzione "hint".
  function ik(root, target, l1, l2, hint) {
    var d = sub(target, root);
    var dist = len(d);
    var max = l1 + l2 - 0.01;
    var min = Math.abs(l1 - l2) + 0.5;
    var clamped = Math.max(min, Math.min(max, dist || min));
    var dir = norm(d[0] || d[1] ? d : [0, 1]);
    var end = add(root, mul(dir, clamped));
    var cos = (l1 * l1 + clamped * clamped - l2 * l2) / (2 * l1 * clamped);
    var a = Math.acos(Math.max(-1, Math.min(1, cos)));
    var base = Math.atan2(dir[1], dir[0]);
    var j1 = add(root, [Math.cos(base + a) * l1, Math.sin(base + a) * l1]);
    var j2 = add(root, [Math.cos(base - a) * l1, Math.sin(base - a) * l1]);
    var h = hint || [0, 1];
    var mid = mul(add(root, end), 0.5);
    var s1 = (j1[0] - mid[0]) * h[0] + (j1[1] - mid[1]) * h[1];
    var s2 = (j2[0] - mid[0]) * h[0] + (j2[1] - mid[1]) * h[1];
    return [s1 >= s2 ? j1 : j2, end];
  }

  // Interpola due pose (stessa struttura). I campi non numerici prendono quelli di "b" a meta'.
  function mix(a, b, t) {
    if (a == null) return b;
    if (b == null) return a;
    if (typeof a === "number" && typeof b === "number") return lerp(a, b, t);
    if (Array.isArray(a) && Array.isArray(b)) return a.map(function (v, i) { return mix(v, b[i], t); });
    if (typeof a === "object" && typeof b === "object") {
      var out = {};
      Object.keys(Object.assign({}, a, b)).forEach(function (k) { out[k] = mix(a[k], b[k], t); });
      return out;
    }
    return t < 0.5 ? a : b;
  }

  // Calcola tutti i punti del corpo a partire da una posa.
  function solve(p) {
    var turn = p.turn == null ? 1 : p.turn;
    var facing = p.facing || 1;
    var axis = norm(sub(p.chest, p.pelvis));          // dal bacino al petto
    var side = [-axis[1], axis[0]];                    // perpendicolare: verso la sinistra della figura se frontale
    // In vista frontale la sinistra della figura e' a destra di chi guarda.
    var leftDir = side[0] >= 0 ? side : mul(side, -1);
    if (axis[1] > 0) leftDir = mul(leftDir, -1);      // figura capovolta (rara): mantiene coerenza
    var spread = 3 + 19 * turn;
    var hipSpread = 3 + 11 * turn;
    var depth = 1 - turn;
    var nearOff = mul([facing, 0], 2.5 * depth);
    var sh = {
      l: add(add(p.chest, mul(leftDir, spread)), nearOff),
      r: add(add(p.chest, mul(leftDir, -spread)), mul(nearOff, -1))
    };
    var hp = {
      l: add(p.pelvis, mul(leftDir, hipSpread)),
      r: add(p.pelvis, mul(leftDir, -hipSpread))
    };
    var hints = p.hint || {};
    function elbowHint(s) {
      var out = s === "l" ? 1 : -1;
      return hints["e" + s] || [leftDir[0] * out * 0.55 * turn - facing * 0.25 * depth, 1];
    }
    function kneeHint(s) {
      var out = s === "l" ? 1 : -1;
      return hints["k" + s] || [facing * depth + leftDir[0] * out * 0.5 * turn, -0.15];
    }
    var arms = {};
    var legs = {};
    ["l", "r"].forEach(function (s) {
      arms[s] = ik(sh[s], p.hand[s], L.upper, L.fore, elbowHint(s));
      legs[s] = ik(hp[s], p.foot[s], L.thigh, L.shin, kneeHint(s));
      // Vista frontale: il ginocchio piegato va verso chi guarda, quindi si accorcia invece di aprirsi di lato.
      var flat = (p.kneeFlat == null ? 0.75 : p.kneeFlat) * turn;
      if (flat > 0) {
        var mid = lerpPt(hp[s], legs[s][1], 0.5);
        legs[s][0] = lerpPt(legs[s][0], mid, flat);
      }
      // Gomito o ginocchio dati a mano: servono quando l'arto va verso chi guarda (scorcio).
      if (p.elbow && p.elbow[s]) arms[s] = [p.elbow[s], p.hand[s]];
      if (p.knee && p.knee[s]) legs[s] = [p.knee[s], p.foot[s]];
    });
    var feet = {};
    ["l", "r"].forEach(function (s) {
      var out = s === "l" ? 1 : -1;
      var fd = (p.footDir && p.footDir[s]) || [facing * depth + leftDir[0] * out * 0.35 * turn, 0.12 * turn];
      fd = norm(fd);
      var flen = 5 + 11 * depth;
      feet[s] = [legs[s][1], add(legs[s][1], mul(fd, flen))];
    });
    // Busto: trapezio dalle spalle ai fianchi, piu' largo in alto.
    var tw = 10 + 13 * turn;
    var bw = 8 + 4 * turn;
    var chestTop = add(p.chest, mul(axis, 2));
    var torso = [
      add(chestTop, mul(leftDir, tw)), add(chestTop, mul(leftDir, -tw)),
      add(p.pelvis, mul(leftDir, -bw)), add(p.pelvis, mul(leftDir, bw))
    ];
    return { turn: turn, facing: facing, sh: sh, hp: hp, arms: arms, legs: legs, feet: feet, torso: torso, head: p.head, chest: p.chest, pelvis: p.pelvis, near: facing > 0 ? "l" : "r" };
  }

  // Scheletro intermedio tra due pose: se una delle due ha giunti dati a mano, si interpolano i giunti risolti.
  function solveBetween(a, b, k) {
    var m = mix(a, b, k);
    var out = solve(m);
    var fixArms = ["l", "r"].filter(function (s) { return (a.elbow && a.elbow[s]) || (b.elbow && b.elbow[s]); });
    var fixLegs = ["l", "r"].filter(function (s) { return (a.knee && a.knee[s]) || (b.knee && b.knee[s]); });
    if (fixArms.length || fixLegs.length) {
      var sa = solve(a);
      var sb = solve(b);
      fixArms.forEach(function (s) { out.arms[s] = [lerpPt(sa.arms[s][0], sb.arms[s][0], k), lerpPt(sa.arms[s][1], sb.arms[s][1], k)]; });
      fixLegs.forEach(function (s) {
        out.legs[s] = [lerpPt(sa.legs[s][0], sb.legs[s][0], k), lerpPt(sa.legs[s][1], sb.legs[s][1], k)];
        out.feet[s] = [out.legs[s][1], add(out.legs[s][1], sub(lerpPt(sa.feet[s][1], sb.feet[s][1], k), lerpPt(sa.feet[s][0], sb.feet[s][0], k)))];
      });
    }
    return { skel: out, pose: m };
  }

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }

  function pts(list) { return list.map(function (q) { return q[0].toFixed(1) + "," + q[1].toFixed(1); }).join(" "); }

  // Crea il gruppo SVG di una figura con tutti i pezzi; l'aggiornamento cambia solo gli attributi.
  function buildFigure(parent, role) {
    var g = el("g", { class: "df-fig df-" + role }, parent);
    var parts = {};
    parts.shadow = el("ellipse", { class: "df-shadow", rx: 30, ry: 4.5 }, g);
    // Ogni segmento ha un contorno scuro sotto: separa braccio, testa e busto quando si sovrappongono.
    function seg(cls, group) {
      var ol = el("line", { class: "df-ol " + cls + "-ol" }, group);
      var ln = el("line", { class: cls }, group);
      ln._ol = ol;
      return ln;
    }
    ["l", "r"].forEach(function (s) {
      parts["leg" + s] = el("g", { class: "df-limb" }, g);
      parts["thigh" + s] = seg("df-thigh", parts["leg" + s]);
      parts["shin" + s] = seg("df-shin", parts["leg" + s]);
      parts["foot" + s] = seg("df-foot", parts["leg" + s]);
      parts["arm" + s] = el("g", { class: "df-limb" }, g);
      parts["upper" + s] = seg("df-upper", parts["arm" + s]);
      parts["fore" + s] = seg("df-fore", parts["arm" + s]);
      parts["hand" + s] = el("ellipse", { class: "df-hand", rx: 5.6, ry: 5.6 }, parts["arm" + s]);
    });
    parts.body = el("g", { class: "df-body" }, g);
    parts.neck = el("line", { class: "df-neck" }, parts.body);
    parts.torso = el("polygon", { class: "df-torso" }, parts.body);
    parts.belt = el("line", { class: "df-belt" }, parts.body);
    parts.headG = el("g", { class: "df-headg" }, g);
    parts.head = el("circle", { class: "df-head", r: L.head }, parts.headG);
    parts.face = el("path", { class: "df-face" }, parts.headG);
    return { g: g, parts: parts, order: "" };
  }

  function setLine(line, a, b) {
    var x1 = a[0].toFixed(1), y1 = a[1].toFixed(1), x2 = b[0].toFixed(1), y2 = b[1].toFixed(1);
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    if (line._ol) {
      line._ol.setAttribute("x1", x1); line._ol.setAttribute("y1", y1);
      line._ol.setAttribute("x2", x2); line._ol.setAttribute("y2", y2);
    }
  }

  function updateFigure(fig, a, b, k) {
    var r = solveBetween(a, b == null ? a : b, k || 0);
    var s = r.skel;
    var pose = r.pose;
    var P = fig.parts;
    var groundY = pose.ground == null ? GROUND : pose.ground;
    var midFeet = (s.legs.l[1][0] + s.legs.r[1][0]) / 2;
    P.shadow.setAttribute("cx", lerp(midFeet, s.pelvis[0], 0.4).toFixed(1));
    P.shadow.setAttribute("cy", (groundY + 3).toFixed(1));
    P.shadow.setAttribute("rx", (22 + Math.abs(s.legs.l[1][0] - s.legs.r[1][0]) * 0.55 + Math.max(0, s.pelvis[1] - 150) * 0.5).toFixed(1));
    ["l", "r"].forEach(function (k) {
      setLine(P["thigh" + k], s.hp[k], s.legs[k][0]);
      setLine(P["shin" + k], s.legs[k][0], s.legs[k][1]);
      setLine(P["foot" + k], s.feet[k][0], s.feet[k][1]);
      setLine(P["upper" + k], s.sh[k], s.arms[k][0]);
      setLine(P["fore" + k], s.arms[k][0], s.arms[k][1]);
      // Mano aperta: ovale allungato nella direzione dell'avambraccio; pugno: tondo.
      var hand = s.arms[k][1];
      var open = pose.open && pose.open[k];
      var fd = norm(sub(hand, s.arms[k][0]));
      var ang = Math.atan2(fd[1], fd[0]) * 180 / Math.PI;
      var c = add(hand, mul(fd, open ? 3 : 0));
      P["hand" + k].setAttribute("cx", c[0].toFixed(1));
      P["hand" + k].setAttribute("cy", c[1].toFixed(1));
      P["hand" + k].setAttribute("rx", open ? 7.6 : 5.6);
      P["hand" + k].setAttribute("ry", open ? 4.4 : 5.6);
      P["hand" + k].setAttribute("transform", "rotate(" + ang.toFixed(1) + " " + c[0].toFixed(1) + " " + c[1].toFixed(1) + ")");
    });
    setLine(P.neck, s.chest, s.head);
    P.torso.setAttribute("points", pts(s.torso));
    var beltA = lerpPt(s.torso[3], s.torso[0], 0.1);
    var beltB = lerpPt(s.torso[2], s.torso[1], 0.1);
    setLine(P.belt, beltA, beltB);
    P.head.setAttribute("cx", s.head[0].toFixed(1));
    P.head.setAttribute("cy", s.head[1].toFixed(1));
    // Volto: in profilo un piccolo naso verso lo sguardo; frontale una linea degli occhi appena accennata.
    var depth = 1 - s.turn;
    var f = s.facing;
    var hx = s.head[0];
    var hy = s.head[1];
    if (depth > 0.35) {
      P.face.setAttribute("d", "M" + (hx + f * 10.5).toFixed(1) + "," + (hy - 3).toFixed(1) + " l" + (f * 4.2).toFixed(1) + ",4.5 l" + (-f * 4.6).toFixed(1) + ",1.6");
    } else {
      P.face.setAttribute("d", "M" + (hx - 5.5).toFixed(1) + "," + (hy - 1.5).toFixed(1) + " h3 M" + (hx + 2.5).toFixed(1) + "," + (hy - 1.5).toFixed(1) + " h3");
    }
    // Ordine di disegno: arto lontano dietro, busto, arto vicino davanti. Frontale: braccia davanti.
    var near = s.near;
    var far = near === "l" ? "r" : "l";
    var layer = pose.layer || {};
    var order;
    if (s.turn > 0.6) {
      order = ["shadow", "legl", "legr", "body", "headG"];
      ["l", "r"].forEach(function (k) { if (layer[k] === "back") order.splice(1, 0, "arm" + k); else order.push("arm" + k); });
    } else {
      order = ["shadow", "leg" + far, "arm" + far, "body", "leg" + near, "headG", "arm" + near];
      if (layer[far] === "front") { order.splice(order.indexOf("arm" + far), 1); order.splice(order.indexOf("arm" + near), 0, "arm" + far); }
      if (layer[near] === "back") { order.splice(order.indexOf("arm" + near), 1); order.splice(order.indexOf("body"), 0, "arm" + near); }
    }
    ["l", "r"].forEach(function (k) {
      P["leg" + k].setAttribute("class", "df-limb " + (k === near || s.turn > 0.6 ? "df-near" : "df-far"));
      P["arm" + k].setAttribute("class", "df-limb " + (k === near || s.turn > 0.6 ? "df-near" : "df-far"));
    });
    var key = order.join("|");
    if (fig.order !== key) {
      order.forEach(function (name) { fig.g.appendChild(P[name]); });
      fig.order = key;
    }
  }

  // Freccia di movimento (curva) con punta disegnata a mano.
  function arrowPath(a) {
    var from = a.from;
    var to = a.to;
    var mid = mul(add(from, to), 0.5);
    var d = sub(to, from);
    var n = norm([-d[1], d[0]]);
    var c = add(mid, mul(n, a.bend || 0));
    var tan = norm(sub(to, c));
    var left = add(to, add(mul(tan, -8), mul([-tan[1], tan[0]], 4.5)));
    var right = add(to, add(mul(tan, -8), mul([tan[1], -tan[0]], 4.5)));
    return {
      line: "M" + from[0].toFixed(1) + "," + from[1].toFixed(1) + " Q" + c[0].toFixed(1) + "," + c[1].toFixed(1) + " " + to[0].toFixed(1) + "," + to[1].toFixed(1),
      head: "M" + left[0].toFixed(1) + "," + left[1].toFixed(1) + " L" + to[0].toFixed(1) + "," + to[1].toFixed(1) + " L" + right[0].toFixed(1) + "," + right[1].toFixed(1)
    };
  }

  /*
   * Monta una scena animata in un contenitore.
   * scene = { frames: [{ you: pose, partner?: pose, arrows?: [{from,to,bend}], hold?: ms }] }
   * opts = { onFrame(i), autoplay, reduced }
   */
  function mount(container, scene, opts) {
    opts = opts || {};
    var svg = el("svg", { class: "df-svg", viewBox: opts.viewBox || "0 0 320 250", role: "img" });
    if (opts.label) svg.setAttribute("aria-label", opts.label);
    container.innerHTML = "";
    container.appendChild(svg);
    var defs = el("defs", {}, svg);
    var pat = el("pattern", { id: "dfMat" + Math.random().toString(36).slice(2, 7), width: 40, height: 18, patternUnits: "userSpaceOnUse" }, defs);
    el("path", { d: "M0 0 H40 M0 0 V18", class: "df-matline" }, pat);
    el("rect", { x: 0, y: GROUND, width: 320, height: 250 - GROUND, class: "df-floor" }, svg);
    el("rect", { x: 0, y: GROUND, width: 320, height: 250 - GROUND, fill: "url(#" + pat.id + ")", class: "df-floorlines" }, svg);
    el("line", { x1: 0, y1: GROUND, x2: 320, y2: GROUND, class: "df-ground" }, svg);
    var arrowsG = el("g", { class: "df-arrows" }, svg);
    var hasPartner = scene.frames.some(function (f) { return f.partner; });
    var partner = hasPartner ? buildFigure(svg, "partner") : null;
    var you = buildFigure(svg, "you");
    // Braccio del partner che passa davanti a te (abbraccio da dietro).
    var overlay = partner ? el("g", { class: "df-fig df-partner df-overlay" }, svg) : null;
    svg.appendChild(arrowsG);
    var index = 0;
    var lastFront = null;
    var playing = opts.autoplay !== false && !opts.reduced;
    var raf = null;
    var phaseStart = 0;
    var TWEEN = scene.tween || 650;

    function holdOf(i) { return scene.frames[i].hold || 1100; }

    var drawnFrame = -1;
    var drawnAlpha = -1;
    function drawArrows(frameIndex, alpha) {
      var a2 = Math.round(alpha * 20) / 20;
      if (frameIndex === drawnFrame && a2 === drawnAlpha) return;
      drawnFrame = frameIndex;
      drawnAlpha = a2;
      var frame = scene.frames[frameIndex];
      arrowsG.innerHTML = "";
      arrowsG.style.opacity = a2;
      (frame.marks || []).forEach(function (m) {
        if (m.type === "line") {
          el("line", { x1: m.from[0], y1: m.from[1], x2: m.to[0], y2: m.to[1], class: "df-mark-line" }, arrowsG);
        } else if (m.type === "target") {
          el("circle", { cx: m.at[0], cy: m.at[1], r: 9, class: "df-mark-target" }, arrowsG);
          el("path", { d: "M" + (m.at[0] - 4) + "," + (m.at[1] - 4) + " l8,8 M" + (m.at[0] + 4) + "," + (m.at[1] - 4) + " l-8,8", class: "df-mark-target" }, arrowsG);
        } else if (m.type === "dim") {
          var y = m.from[1];
          el("path", { d: "M" + m.from[0] + "," + (y - 4) + " v8 M" + m.from[0] + "," + y + " H" + m.to[0] + " M" + m.to[0] + "," + (y - 4) + " v8", class: "df-mark-dim" }, arrowsG);
        }
        if (m.label) {
          var at = m.labelAt || (m.type === "target" ? [m.at[0] + 13, m.at[1] + 4] : [(m.from[0] + m.to[0]) / 2, Math.min(m.from[1], m.to[1]) - 6]);
          var t = el("text", { x: at[0], y: at[1], class: "df-mark-label", "text-anchor": m.type === "target" ? "start" : "middle" }, arrowsG);
          t.textContent = m.label;
        }
      });
      (frame.arrows || []).forEach(function (a) {
        var p = arrowPath(a);
        el("path", { d: p.line, class: "df-arrow" }, arrowsG);
        el("path", { d: p.head, class: "df-arrow df-arrowhead" }, arrowsG);
      });
    }

    function paint(i, j, t) {
      var a = scene.frames[i];
      var b = scene.frames[j];
      var k = ease(t);
      updateFigure(you, a.you, b.you, k);
      if (partner) {
        var pa = a.partner || b.partner;
        var pb = b.partner || a.partner;
        updateFigure(partner, pa, pb, k);
        partner.g.style.opacity = (a.partner && b.partner) ? 1 : (a.partner ? 1 - k : k);
      }
      drawArrows(t < 0.5 ? i : j, t < 0.5 ? 1 - t * 2 : (t - 0.5) * 2);
      if (partner) {
        var cur = t < 0.5 ? a : b;
        var over = cur.partnerArmOver || "";
        if (over !== lastFront) {
          ["l", "r"].forEach(function (k) {
            var arm = partner.parts["arm" + k];
            if (k === over) overlay.appendChild(arm);
            else if (arm.parentNode === overlay) { partner.g.appendChild(arm); partner.order = ""; }
          });
          lastFront = over;
          if (!over) updateFigure(partner, a.partner || b.partner, b.partner || a.partner, k);
        }
        overlay.style.opacity = partner.g.style.opacity;
      }
    }

    function show(i) {
      index = i;
      paint(i, i, 0);
      if (opts.onFrame) opts.onFrame(i);
    }

    function tick(now) {
      if (!playing) return;
      var elapsed = now - phaseStart;
      var hold = holdOf(index);
      var next = (index + 1) % scene.frames.length;
      if (elapsed < hold) {
        paint(index, index, 0);
      } else if (elapsed < hold + TWEEN) {
        paint(index, next, (elapsed - hold) / TWEEN);
      } else {
        index = next;
        phaseStart = now;
        paint(index, index, 0);
        if (opts.onFrame) opts.onFrame(index);
      }
      raf = window.requestAnimationFrame(tick);
    }

    function play() {
      if (playing && raf) return;
      playing = true;
      phaseStart = performance.now();
      raf = window.requestAnimationFrame(tick);
    }

    function pause() {
      playing = false;
      if (raf) window.cancelAnimationFrame(raf);
      raf = null;
    }

    // Passaggio animato a un fotogramma scelto (anche con animazione in pausa).
    function goTo(i) {
      var from = index;
      pause();
      if (opts.reduced || from === i) { show(i); return; }
      var start = performance.now();
      function step(now) {
        var t = Math.min(1, (now - start) / TWEEN);
        paint(from, i, t);
        if (t < 1) raf = window.requestAnimationFrame(step);
        else { raf = null; show(i); }
      }
      raf = window.requestAnimationFrame(step);
    }

    show(0);
    if (playing) { playing = false; play(); }
    return {
      play: play,
      pause: pause,
      goTo: goTo,
      isPlaying: function () { return playing; },
      // disegna un istante tra due fotogrammi (per anteprime e controlli)
      seek: function (i, j, t) { pause(); paint(i, j, t); },
      frameCount: scene.frames.length,
      destroy: function () { pause(); container.innerHTML = ""; }
    };
  }

  window.DefenseFigure = { mount: mount, solve: solve, mix: mix, GROUND: GROUND, LIMBS: L };
})();
