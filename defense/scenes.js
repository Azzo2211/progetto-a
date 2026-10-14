/*
 * Progetto A - Difesa: le pose delle tecniche per la figura animata (defense/figure.js).
 * Coordinate nel riquadro 320x250, pavimento a y=232, caviglie a y=228.
 * "l" e "r" sono la sinistra e la destra della figura. In profilo il piede "l" e' quello avanti.
 */
(function () {
  "use strict";

  var A = 228; // altezza caviglie

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function merge(base, over) {
    var out = clone(base);
    Object.keys(over || {}).forEach(function (k) {
      var v = over[k];
      if (v && typeof v === "object" && !Array.isArray(v) && out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) out[k] = merge(out[k], v);
      else out[k] = clone(v);
    });
    return out;
  }
  function shift(p, dx, dy) {
    var q = clone(p);
    dy = dy || 0;
    ["pelvis", "chest", "head"].forEach(function (k) { q[k] = [q[k][0] + dx, q[k][1] + dy]; });
    ["l", "r"].forEach(function (s) {
      q.hand[s] = [q.hand[s][0] + dx, q.hand[s][1] + dy];
      q.foot[s] = [q.foot[s][0] + dx, q.foot[s][1] + (q.foot[s][1] >= A - 0.5 ? 0 : dy)];
    });
    return q;
  }

  // ---------- Vista frontale ----------
  function relaxedF(x) {
    return { turn: 1, facing: 1, pelvis: [x, 141], chest: [x, 85], head: [x, 63],
      hand: { l: [x + 27, 147], r: [x - 27, 147] }, foot: { l: [x + 12, A], r: [x - 12, A] } };
  }
  function fenceF(x) {
    return { turn: 1, facing: 1, pelvis: [x, 144], chest: [x, 88], head: [x, 66],
      hand: { l: [x + 15, 106], r: [x - 15, 102] }, foot: { l: [x + 16, A], r: [x - 16, A] },
      open: { l: true, r: true }, hint: { el: [0.8, 0.6], er: [-0.8, 0.6] } };
  }
  function guardF(x) {
    // gomiti verso chi guarda: si danno a mano (scorcio)
    return { turn: 1, facing: 1, pelvis: [x, 146], chest: [x, 90], head: [x, 70],
      hand: { l: [x + 10, 76], r: [x - 10, 76] }, elbow: { l: [x + 19, 107], r: [x - 19, 107] },
      foot: { l: [x + 17, A], r: [x - 17, A] } };
  }
  function coverF(x) {
    return { turn: 1, facing: 1, pelvis: [x, 151], chest: [x, 95], head: [x, 77],
      hand: { l: [x + 10, 61], r: [x - 10, 61] }, elbow: { l: [x + 9, 97], r: [x - 9, 97] },
      foot: { l: [x + 19, A], r: [x - 19, A] } };
  }

  // ---------- Profilo (turn basso: si vedono comunque entrambe le braccia) ----------
  function relaxedP(x, f) {
    return { turn: 0.15, facing: f, pelvis: [x, 141], chest: [x + f * 2, 85], head: [x + f * 4, 63],
      hand: { l: [x + f * 5, 147], r: [x - f * 3, 146] }, foot: { l: [x + f * 7, A], r: [x - f * 6, A] } };
  }
  function guardP(x, f) {
    return { turn: 0.15, facing: f, pelvis: [x - f, 146], chest: [x + f * 3, 91], head: [x + f * 8, 71],
      hand: { l: [x + f * 24, 75], r: [x + f * 14, 80] }, foot: { l: [x + f * 18, A], r: [x - f * 17, A] } };
  }
  function fenceP(x, f) {
    return { turn: 0.15, facing: f, pelvis: [x - f, 144], chest: [x + f * 2, 88], head: [x + f * 5, 66],
      hand: { l: [x + f * 33, 102], r: [x + f * 22, 106] }, foot: { l: [x + f * 17, A], r: [x - f * 16, A] },
      open: { l: true, r: true } };
  }
  function idleP(x, f) {
    // persona agitata ma ancora ferma: mani basse, peso avanti
    return { turn: 0.2, facing: f, pelvis: [x, 142], chest: [x + f * 4, 86], head: [x + f * 8, 64],
      hand: { l: [x + f * 12, 140], r: [x - f * 2, 142] }, foot: { l: [x + f * 12, A], r: [x - f * 10, A] } };
  }

  var floorArrow = function (x1, x2) { return { from: [x1, 242], to: [x2, 242], bend: 0 }; };

  var S = {};

  S["t-postura-aperta"] = { frames: [
    { you: relaxedF(160) },
    { you: fenceF(160), arrows: [{ from: [196, 146], to: [184, 110], bend: 8 }, { from: [124, 146], to: [136, 106], bend: -8 }] }
  ] };

  S["t-guardia"] = { frames: [
    { you: fenceF(160) },
    { you: guardF(160), arrows: [{ from: [183, 104], to: [179, 76], bend: 6 }, { from: [137, 100], to: [141, 76], bend: -6 }] }
  ] };

  (function () {
    var g0 = guardP(132, 1);
    var step = merge(shift(guardP(132, 1), 10), { foot: { l: [132 + 18 + 24, A], r: [132 - 17, A] }, pelvis: [143, 148] });
    var g1 = guardP(156, 1);
    var back = merge(shift(guardP(156, 1), -10), { foot: { l: [156 + 18, A], r: [156 - 17 - 24, A] }, pelvis: [145, 148] });
    S["t-passi-base"] = { frames: [
      { you: g0 },
      { you: step, arrows: [floorArrow(152, 174)] },
      { you: g1, arrows: [floorArrow(117, 137)] },
      { you: back, arrows: [floorArrow(136, 116)] }
    ] };
  })();

  S["t-passo-laterale"] = { frames: [
    { you: guardF(160), marks: [{ type: "line", from: [160, 30], to: [160, 232], label: "linea d'attacco", labelAt: [160, 24] }] },
    { you: merge(shift(guardF(146), 0, 3), { foot: { l: [178, A], r: [118, A] } }), arrows: [floorArrow(156, 128)],
      marks: [{ type: "line", from: [160, 30], to: [160, 232] }] },
    { you: guardF(128), marks: [{ type: "line", from: [160, 30], to: [160, 232] }, { type: "target", at: [160, 70], label: "colpo a vuoto" }] }
  ] };

  S["t-distanza"] = { frames: [
    { you: fenceP(92, 1), partner: idleP(232, -1),
      marks: [{ type: "dim", from: [126, 52], to: [222, 52], label: "un braccio + un passo" }] },
    { you: merge(shift(fenceP(76, 1), 0, 1), { foot: { l: [92, A], r: [58, A] } }), partner: merge(shift(idleP(214, -1), 0), { foot: { l: [196, A], r: [228, A] } }),
      arrows: [floorArrow(92, 70), floorArrow(232, 210)] },
    { you: merge(fenceP(72, 1), { hand: { l: [112, 98], r: [100, 104] } }), partner: merge(idleP(202, -1), { hand: { l: [178, 110] } }),
      marks: [{ type: "dim", from: [114, 52], to: [192, 52], label: "ancora fuori portata" }] }
  ] };

  // Parate in profilo: lui (a destra) spinge o colpisce dritto verso il viso.
  (function () {
    var you = guardP(112, 1);
    var him = guardP(214, -1);
    var push = merge(him, { pelvis: [208, 146], chest: [200, 92], head: [195, 72], hand: { l: [126, 70] }, foot: { l: [190, A], r: [234, A] } });
    var parryOut = merge(you, { hand: { l: [140, 62] }, head: [118, 73] });
    var pushDeflected = merge(push, { hand: { l: [128, 56] } });
    S["t-parata-esterna"] = { frames: [
      { you: you, partner: him },
      { you: parryOut, partner: pushDeflected, arrows: [{ from: [138, 82], to: [142, 54], bend: -10 }] },
      { you: you, partner: him, hold: 900 }
    ] };
    var parryIn = merge(you, { hand: { l: [134, 84] }, head: [116, 72] });
    var pushIn = merge(push, { hand: { l: [132, 92] } });
    var outLine = merge(shift(guardP(98, 1), 0, 2), { foot: { l: [114, A], r: [80, A] } });
    S["t-parata-interna"] = { frames: [
      { you: you, partner: him },
      { you: parryIn, partner: pushIn, arrows: [{ from: [144, 70], to: [138, 96], bend: 10 }] },
      { you: outLine, partner: merge(pushIn, { hand: { l: [140, 96] } }), arrows: [floorArrow(108, 88)] }
    ] };
  })();

  S["t-copertura-alta"] = { frames: [
    { you: guardF(160) },
    { you: coverF(160), arrows: [{ from: [182, 80], to: [176, 58], bend: 5 }, { from: [138, 80], to: [144, 58], bend: -5 }] },
    { you: merge(coverF(140), { foot: { l: [162, A], r: [124, A] } }), arrows: [floorArrow(156, 134)] }
  ] };

  S["t-schivata"] = { frames: [
    { you: guardF(160) },
    { you: merge(guardF(160), { pelvis: [156, 152], chest: [149, 96], head: [140, 78], hand: { l: [150, 84], r: [130, 84] }, elbow: { l: [167, 112], r: [130, 113] } }),
      marks: [{ type: "target", at: [160, 70], label: "colpo" }], arrows: [{ from: [158, 56], to: [142, 62], bend: -4 }] },
    { you: merge(guardF(136), { foot: { l: [154, A], r: [118, A] } }), arrows: [floorArrow(156, 132)] }
  ] };

  // ---------- Prese ----------
  (function () {
    var you = merge(relaxedP(116, 1), { hand: { l: [148, 132] }, foot: { l: [128, A], r: [104, A] } });
    var him = merge(relaxedP(206, -1), { turn: 0.2, chest: [202, 87], head: [198, 65], hand: { r: [152, 130] }, foot: { l: [196, A], r: [218, A] } });
    var rot = merge(you, { hand: { l: [146, 108] }, head: [118, 64] });
    var himRot = merge(him, { hand: { r: [153, 120] } });
    var free = merge(shift(guardP(98, 1), 0), { foot: { l: [114, A], r: [80, A] } });
    S["t-polso-una-mano"] = { frames: [
      { you: you, partner: him, marks: [{ type: "target", at: [150, 131], label: "presa" }] },
      { you: rot, partner: himRot, arrows: [{ from: [158, 132], to: [152, 104], bend: -10 }] },
      { you: free, partner: merge(him, { hand: { r: [150, 124] }, open: { r: true } }), arrows: [{ from: [140, 112], to: [118, 102], bend: 6 }, floorArrow(112, 92)] }
    ] };

    var two = merge(him, { hand: { r: [154, 132], l: [150, 128] } });
    var youTwo = merge(you, { hand: { l: [150, 134] } });
    var reach = merge(youTwo, { hand: { r: [148, 128] }, chest: [120, 88], head: [123, 66] });
    var up = merge(shift(guardP(104, 1), 0), { hand: { l: [124, 76], r: [118, 82] }, foot: { l: [120, A], r: [86, A] } });
    S["t-polso-due-mani"] = { frames: [
      { you: youTwo, partner: two },
      { you: reach, partner: two, arrows: [{ from: [118, 110], to: [142, 124], bend: -8 }] },
      { you: up, partner: merge(two, { hand: { r: [150, 120], l: [146, 116] }, open: { r: true, l: true } }), arrows: [{ from: [152, 124], to: [128, 78], bend: -12 }] }
    ] };
  })();

  (function () {
    var you = merge(relaxedP(120, 1), { foot: { l: [130, A], r: [110, A] }, hand: { l: [138, 108], r: [130, 114] }, open: { l: true, r: true } });
    var him = merge(relaxedP(178, -1), { turn: 0.2, pelvis: [182, 142], chest: [170, 88], head: [164, 66], hand: { l: [140, 94], r: [146, 98] }, foot: { l: [168, A], r: [196, A] }, open: { l: true, r: true } });
    var base = merge(guardP(116, 1), { foot: { l: [132, A], r: [90, A] }, pelvis: [112, 150], chest: [118, 95], head: [124, 75], hand: { l: [140, 82], r: [130, 88] } });
    var himPush = merge(him, { hand: { l: [136, 96], r: [140, 100] } });
    var out = merge(guardP(72, 1), {});
    var himEmpty = merge(him, { pelvis: [176, 144], chest: [160, 92], head: [152, 72], hand: { l: [124, 104], r: [130, 108] }, foot: { l: [158, A], r: [190, A] } });
    S["t-spinta-petto"] = { frames: [
      { you: you, partner: him },
      { you: base, partner: himPush, arrows: [floorArrow(110, 92)] },
      { you: out, partner: himEmpty, arrows: [floorArrow(112, 80)] }
    ] };
  })();

  (function () {
    var you = merge(relaxedP(160, 1), { hand: { l: [168, 132], r: [158, 134] } });
    var him = { turn: 0.2, facing: 1, pelvis: [146, 140], chest: [150, 86], head: [154, 64],
      hand: { l: [170, 110], r: [166, 106] }, foot: { l: [154, A], r: [134, A] }, layer: { l: "front" } };
    var low = merge(you, { pelvis: [158, 160], chest: [164, 104], head: [170, 84], foot: { l: [182, A], r: [138, A] }, hand: { l: [174, 126], r: [168, 128] } });
    var himLow = merge(him, { pelvis: [144, 150], chest: [150, 100], head: [154, 78], hand: { l: [172, 126], r: [168, 122] } });
    var turned = merge(guardP(226, -1), {});
    var himEmpty = merge(him, { hand: { l: [178, 120], r: [172, 116] }, open: { l: true, r: true } });
    S["t-presa-da-dietro"] = { frames: [
      { you: you, partner: him, partnerArmOver: "l" },
      { you: low, partner: himLow, partnerArmOver: "l", arrows: [{ from: [196, 90], to: [196, 116], bend: 0 }] },
      { you: turned, partner: himEmpty, arrows: [floorArrow(176, 214)] }
    ] };
  })();

  // ---------- Terra ----------
  S["t-caduta-indietro"] = { tween: 800, frames: [
    { you: relaxedP(156, 1) },
    { you: { turn: 0.15, facing: 1, pelvis: [150, 188], chest: [160, 136], head: [170, 118], hand: { l: [190, 138], r: [184, 142] }, foot: { l: [164, A], r: [150, A] } },
      arrows: [{ from: [132, 120], to: [132, 168], bend: 0 }] },
    { you: { turn: 0.15, facing: 1, pelvis: [140, 216], chest: [108, 212], head: [90, 198], hand: { l: [132, 229], r: [122, 229] }, foot: { l: [170, 178], r: [162, 184] },
      hint: { kl: [0, -1], kr: [0, -1], el: [0, -1], er: [0, -1] }, footDir: { l: [0.4, -1], r: [0.4, -1] } },
      arrows: [{ from: [150, 176], to: [118, 202], bend: 10 }] }
  ] };

  S["t-rialzarsi"] = { tween: 750, frames: [
    { you: { turn: 0.15, facing: 1, pelvis: [126, 222], chest: [114, 176], head: [114, 154], hand: { l: [138, 150], r: [96, 228] }, foot: { l: [160, A], r: [176, 225] },
      hint: { kl: [0, -1], kr: [0, -1], el: [0.2, 1], er: [-1, 0] }, footDir: { r: [0.3, -1] } } },
    { you: { turn: 0.15, facing: 1, pelvis: [122, 196], chest: [114, 156], head: [118, 136], hand: { l: [140, 130], r: [96, 228] }, foot: { l: [158, A], r: [128, 222] },
      hint: { kl: [0.3, -1], kr: [0, 1], el: [0.2, 1], er: [-1, 0] } },
      arrows: [{ from: [150, 214], to: [140, 186], bend: 0 }] },
    { you: { turn: 0.15, facing: 1, pelvis: [124, 176], chest: [134, 128], head: [142, 108], hand: { l: [158, 110], r: [104, 214] }, foot: { l: [158, A], r: [92, A] },
      hint: { kl: [1, -0.3], kr: [0.2, -1], el: [0.3, 1], er: [-1, 0.2] } },
      arrows: [{ from: [128, 238], to: [96, 238], bend: 0 }] },
    { you: merge(guardP(128, 1), { foot: { l: [158, A], r: [104, A] } }) }
  ] };

  S["t-spinta-spazio"] = { frames: [
    { you: fenceP(118, 1), partner: merge(idleP(172, -1), { hand: { l: [150, 104] } }) },
    { you: merge(fenceP(124, 1), { pelvis: [122, 145], chest: [130, 90], head: [134, 68], hand: { l: [164, 92], r: [160, 96] }, foot: { l: [146, A], r: [106, A] } }),
      partner: merge(idleP(188, -1), { turn: 0.2, pelvis: [194, 140], chest: [182, 88], head: [190, 66], hand: { l: [176, 122], r: [200, 130] }, foot: { l: [176, A], r: [206, A] } }),
      arrows: [{ from: [170, 76], to: [194, 76], bend: 0 }] },
    { you: guardP(88, 1), partner: merge(idleP(204, -1), { foot: { l: [194, A], r: [218, A] } }), arrows: [floorArrow(116, 92)] }
  ] };

  (function () {
    var him = guardP(214, -1);
    var push = merge(him, { pelvis: [208, 146], chest: [200, 92], head: [195, 72], hand: { l: [126, 70] }, foot: { l: [190, A], r: [234, A] } });
    S["t-sequenza-uscita"] = { frames: [
      { you: fenceP(110, 1), partner: idleP(212, -1) },
      { you: merge(guardP(112, 1), { hand: { l: [140, 62] }, head: [118, 73] }), partner: merge(push, { hand: { l: [128, 56] } }), arrows: [{ from: [138, 82], to: [142, 54], bend: -10 }] },
      { you: merge(guardP(92, 1), { foot: { l: [108, A], r: [74, A] } }), partner: merge(push, { hand: { l: [132, 66] } }), arrows: [floorArrow(110, 88)] },
      { you: { turn: 0.2, facing: -1, pelvis: [60, 142], chest: [52, 88], head: [45, 67], hand: { l: [76, 118], r: [36, 104] }, foot: { l: [80, A], r: [42, 204] },
        hint: { kl: [-1, 0], kr: [-1, 0], el: [0, 1], er: [0.3, 1] } },
        partner: him, arrows: [floorArrow(80, 30)] }
    ] };
  })();

  window.DefenseScenes = S;
})();
