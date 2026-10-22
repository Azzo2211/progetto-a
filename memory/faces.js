/*
 * Progetto A - Memoria: volti disegnati in SVG da un numero (sempre uguali per lo stesso numero).
 * Servono alla disciplina "Nomi e volti": persone inventate, nessuna foto vera.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MemoryFaces = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  function rng(seed) {
    let a = (Number(seed) || 1) >>> 0;
    return function next() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, list) => list[Math.floor(r() * list.length)];

  const SKIN = ["#f6dcc2", "#efc9a4", "#e2b088", "#cf9466", "#b07448", "#8c5634", "#6a3f27"];
  const HAIR = ["#1e1a17", "#3a281c", "#5b3b22", "#8a5a2b", "#b98a4a", "#d8b878", "#a33a22", "#7d7d7d", "#cfcfcf"];
  const EYES = ["#3b2a1d", "#5a3b22", "#2f5b7a", "#3f6b3f", "#6b6b6b"];
  const SHIRT = ["#335f8f", "#8c2035", "#2c7a3f", "#6750a4", "#b88916", "#3a4750", "#c0582d", "#1f7a6d"];

  /*
   * Restituisce il markup SVG (viewBox 0 0 120 140). opts.female cambia capelli e barba.
   * Ogni volto combina forma, pelle, capelli (stile e colore), occhi, sopracciglia, naso, bocca,
   * occhiali, barba, orecchini e nei: abbastanza combinazioni da non confondersi.
   */
  function svg(seed, { female = false, label = "" } = {}) {
    const r = rng(seed);
    const skin = pick(r, SKIN);
    const hairC = pick(r, HAIR.slice(0, female ? 7 : 9));
    const eyeC = pick(r, EYES);
    const shirt = pick(r, SHIRT);
    const faceW = 30 + Math.floor(r() * 7); // semiasse x
    const faceH = 36 + Math.floor(r() * 7);
    const jaw = r(); // 0 tondo, 1 squadrato
    const cx = 60;
    const cy = 68;
    const shade = "rgba(0,0,0,0.12)";
    const parts = [];
    // busto
    parts.push(`<path d="M18 140 C20 112 40 104 60 104 C80 104 100 112 102 140 Z" fill="${shirt}"/>`);
    parts.push(`<rect x="${cx - 9}" y="${cy + faceH - 12}" width="18" height="16" fill="${skin}"/>`);
    // capelli dietro (lunghi)
    const longHair = female ? r() < 0.75 : r() < 0.08;
    if (longHair) parts.push(`<path d="M${cx - faceW - 6} ${cy - 8} C${cx - faceW - 10} ${cy + 30} ${cx - faceW - 4} ${cy + 52} ${cx - faceW + 6} ${cy + 56} L${cx + faceW - 6} ${cy + 56} C${cx + faceW + 4} ${cy + 52} ${cx + faceW + 10} ${cy + 30} ${cx + faceW + 6} ${cy - 8} Z" fill="${hairC}"/>`);
    // orecchie
    parts.push(`<ellipse cx="${cx - faceW + 1}" cy="${cy + 2}" rx="5" ry="8" fill="${skin}"/><ellipse cx="${cx + faceW - 1}" cy="${cy + 2}" rx="5" ry="8" fill="${skin}"/>`);
    // viso
    const rr = Math.round(8 + (1 - jaw) * 18);
    parts.push(`<rect x="${cx - faceW}" y="${cy - faceH}" width="${faceW * 2}" height="${faceH * 2}" rx="${faceW}" ry="${rr + 16}" fill="${skin}"/>`);
    parts.push(`<path d="M${cx - faceW + 4} ${cy + faceH - 14} Q${cx} ${cy + faceH + 2} ${cx + faceW - 4} ${cy + faceH - 14}" fill="none" stroke="${shade}" stroke-width="2"/>`);
    // orecchini
    if (female && r() < 0.45) {
      const ec = pick(r, ["#e6c777", "#cfd6dd", "#d04a61"]);
      parts.push(`<circle cx="${cx - faceW + 1}" cy="${cy + 11}" r="2.6" fill="${ec}"/><circle cx="${cx + faceW - 1}" cy="${cy + 11}" r="2.6" fill="${ec}"/>`);
    }
    // occhi
    const eyeY = cy - 2 + Math.floor(r() * 4);
    const eyeDx = 11 + Math.floor(r() * 4);
    const almond = r() < 0.5;
    [-1, 1].forEach((s) => {
      const ex = cx + s * eyeDx;
      if (almond) parts.push(`<path d="M${ex - 6} ${eyeY} Q${ex} ${eyeY - 5} ${ex + 6} ${eyeY} Q${ex} ${eyeY + 4} ${ex - 6} ${eyeY} Z" fill="#fff"/><circle cx="${ex}" cy="${eyeY}" r="2.8" fill="${eyeC}"/><circle cx="${ex}" cy="${eyeY}" r="1.2" fill="#111"/>`);
      else parts.push(`<circle cx="${ex}" cy="${eyeY}" r="3.4" fill="#fff"/><circle cx="${ex}" cy="${eyeY}" r="2.3" fill="${eyeC}"/><circle cx="${ex + 0.6}" cy="${eyeY - 0.6}" r="0.8" fill="#fff"/>`);
    });
    // sopracciglia
    const browT = 1.6 + r() * 2.2;
    const browTilt = (r() - 0.5) * 5;
    const browC = hairC === "#cfcfcf" || hairC === "#d8b878" ? "#8a7a62" : hairC;
    [-1, 1].forEach((s) => {
      const ex = cx + s * eyeDx;
      parts.push(`<path d="M${ex - 7} ${eyeY - 7 + s * browTilt * 0.3} Q${ex} ${eyeY - 10 - browTilt * 0.2} ${ex + 7} ${eyeY - 7 - s * browTilt * 0.3}" fill="none" stroke="${browC}" stroke-width="${browT.toFixed(1)}" stroke-linecap="round"/>`);
    });
    // naso
    const nose = Math.floor(r() * 3);
    if (nose === 0) parts.push(`<path d="M${cx} ${eyeY + 3} L${cx - 3} ${eyeY + 14} L${cx + 2} ${eyeY + 15}" fill="none" stroke="${shade}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
    else if (nose === 1) parts.push(`<path d="M${cx - 4} ${eyeY + 14} Q${cx} ${eyeY + 18} ${cx + 4} ${eyeY + 14}" fill="none" stroke="${shade}" stroke-width="2" stroke-linecap="round"/>`);
    else parts.push(`<ellipse cx="${cx}" cy="${eyeY + 14}" rx="4" ry="2.6" fill="${shade}"/>`);
    // bocca
    const my = eyeY + 24 + Math.floor(r() * 3);
    const mouth = Math.floor(r() * 4);
    const lip = female ? pick(r, ["#b5485a", "#9c4a45", "#c0606a"]) : "#8a4a3c";
    if (mouth === 0) parts.push(`<path d="M${cx - 9} ${my} Q${cx} ${my + 7} ${cx + 9} ${my}" fill="none" stroke="${lip}" stroke-width="2.4" stroke-linecap="round"/>`);
    else if (mouth === 1) parts.push(`<path d="M${cx - 8} ${my} L${cx + 8} ${my}" stroke="${lip}" stroke-width="2.4" stroke-linecap="round"/>`);
    else if (mouth === 2) parts.push(`<path d="M${cx - 10} ${my - 1} Q${cx} ${my + 9} ${cx + 10} ${my - 1} Z" fill="#fff" stroke="${lip}" stroke-width="2"/>`);
    else parts.push(`<ellipse cx="${cx}" cy="${my + 1}" rx="6" ry="3" fill="${lip}"/>`);
    // barba / baffi
    if (!female) {
      const beard = r();
      if (beard < 0.18) parts.push(`<path d="M${cx - faceW + 3} ${cy + 6} Q${cx - faceW + 6} ${cy + faceH + 10} ${cx} ${cy + faceH + 8} Q${cx + faceW - 6} ${cy + faceH + 10} ${cx + faceW - 3} ${cy + 6} Q${cx} ${my + 14} ${cx - faceW + 3} ${cy + 6} Z" fill="${hairC}" opacity="0.92"/><path d="M${cx - 10} ${my - 4} Q${cx} ${my - 8} ${cx + 10} ${my - 4} Q${cx} ${my - 2} ${cx - 10} ${my - 4} Z" fill="${hairC}"/>`);
      else if (beard < 0.34) parts.push(`<path d="M${cx - 11} ${my - 3} Q${cx} ${my - 9} ${cx + 11} ${my - 3} Q${cx} ${my - 1} ${cx - 11} ${my - 3} Z" fill="${hairC}"/>`);
      else if (beard < 0.48) parts.push(`<path d="M${cx - faceW + 4} ${cy + 8} Q${cx} ${cy + faceH + 8} ${cx + faceW - 4} ${cy + 8}" fill="none" stroke="${hairC}" stroke-width="7" opacity="0.28" stroke-linecap="round"/>`);
    }
    // occhiali
    const glasses = r();
    if (glasses < 0.26) {
      const frame = pick(r, ["#222", "#5a3b22", "#8c2035", "#3a4750"]);
      const round = glasses < 0.13;
      [-1, 1].forEach((s) => {
        const ex = cx + s * eyeDx;
        parts.push(round ? `<circle cx="${ex}" cy="${eyeY}" r="8" fill="rgba(255,255,255,0.12)" stroke="${frame}" stroke-width="2"/>` : `<rect x="${ex - 9}" y="${eyeY - 6}" width="18" height="12" rx="3" fill="rgba(255,255,255,0.12)" stroke="${frame}" stroke-width="2"/>`);
      });
      parts.push(`<path d="M${cx - eyeDx + (round ? 8 : 9)} ${eyeY} L${cx + eyeDx - (round ? 8 : 9)} ${eyeY}" stroke="${frame}" stroke-width="2"/>`);
    }
    // neo o lentiggini
    const mark = r();
    if (mark < 0.18) parts.push(`<circle cx="${cx + (r() < 0.5 ? -1 : 1) * (14 + r() * 6)}" cy="${my - 6}" r="1.5" fill="#5a3b22"/>`);
    else if (mark < 0.3) [0, 1, 2, 3, 4, 5].forEach((k) => parts.push(`<circle cx="${cx + (k < 3 ? -1 : 1) * (12 + (k % 3) * 4)}" cy="${eyeY + 9 + (k % 2) * 2}" r="0.9" fill="#a0603a" opacity="0.7"/>`));
    // capelli davanti
    const style = female ? Math.floor(r() * 5) : Math.floor(r() * 6);
    const top = cy - faceH;
    const L = cx - faceW;
    const R = cx + faceW;
    let hair = "";
    if (female) {
      if (style === 0) hair = `<path d="M${L - 4} ${cy - 4} C${L - 6} ${top - 14} ${R + 6} ${top - 14} ${R + 4} ${cy - 4} C${R - 4} ${top + 8} ${cx + 4} ${top + 4} ${cx} ${top + 12} C${cx - 8} ${top + 4} ${L + 4} ${top + 10} ${L - 4} ${cy - 4} Z" fill="${hairC}"/>`;
      else if (style === 1) hair = `<path d="M${L - 5} ${cy + 10} C${L - 8} ${top - 16} ${R + 8} ${top - 16} ${R + 5} ${cy + 10} L${R - 2} ${cy - 6} C${R - 8} ${top + 12} ${L + 8} ${top + 12} ${L + 2} ${cy - 6} Z" fill="${hairC}"/>`;
      else if (style === 2) hair = `<path d="M${L - 3} ${cy - 6} C${L - 4} ${top - 12} ${R + 4} ${top - 12} ${R + 3} ${cy - 6} C${R - 10} ${top + 2} ${L + 10} ${top + 2} ${L - 3} ${cy - 6} Z" fill="${hairC}"/><circle cx="${cx}" cy="${top - 8}" r="11" fill="${hairC}"/>`;
      else if (style === 3) hair = Array.from({ length: 11 }, (_, k) => `<circle cx="${L - 2 + k * ((R - L + 4) / 10)}" cy="${top + 2 + Math.abs(5 - k) * 2.6}" r="9" fill="${hairC}"/>`).join("") + `<circle cx="${L - 4}" cy="${cy + 8}" r="9" fill="${hairC}"/><circle cx="${R + 4}" cy="${cy + 8}" r="9" fill="${hairC}"/>`;
      else hair = `<path d="M${L - 3} ${cy - 2} C${L - 6} ${top - 14} ${R + 6} ${top - 14} ${R + 3} ${cy - 2} L${R - 3} ${top + 16} L${L + 3} ${top + 16} Z" fill="${hairC}"/>`;
    } else {
      if (style === 0) hair = `<path d="M${L - 2} ${cy - 10} C${L - 3} ${top - 12} ${R + 3} ${top - 12} ${R + 2} ${cy - 10} C${R - 6} ${top + 4} ${L + 6} ${top + 4} ${L - 2} ${cy - 10} Z" fill="${hairC}"/>`;
      else if (style === 1) hair = `<path d="M${L - 2} ${cy - 8} C${L - 4} ${top - 14} ${R + 4} ${top - 16} ${R + 2} ${cy - 8} C${R - 2} ${top + 6} ${cx + 4} ${top + 10} ${cx - 6} ${top + 4} C${L + 8} ${top + 8} ${L + 2} ${top + 10} ${L - 2} ${cy - 8} Z" fill="${hairC}"/>`;
      else if (style === 2) hair = `<path d="M${L + 1} ${cy - 14} C${L} ${top - 6} ${R} ${top - 6} ${R - 1} ${cy - 14} C${R - 6} ${top + 2} ${L + 6} ${top + 2} ${L + 1} ${cy - 14} Z" fill="${hairC}" opacity="0.85"/>`;
      else if (style === 3) hair = Array.from({ length: 9 }, (_, k) => `<circle cx="${L + 2 + k * ((R - L - 4) / 8)}" cy="${top + 1 + Math.abs(4 - k) * 2}" r="7" fill="${hairC}"/>`).join("");
      else if (style === 4) hair = `<path d="M${L - 1} ${cy + 2} C${L - 3} ${cy - 18} ${L + 2} ${top + 10} ${L + 8} ${top + 8} L${L + 6} ${cy - 6} Z M${R + 1} ${cy + 2} C${R + 3} ${cy - 18} ${R - 2} ${top + 10} ${R - 8} ${top + 8} L${R - 6} ${cy - 6} Z" fill="${hairC}"/>`;
      else hair = `<path d="M${L - 3} ${cy - 6} C${L - 6} ${top - 18} ${R + 6} ${top - 18} ${R + 3} ${cy - 6} C${R - 4} ${top + 2} ${cx} ${top - 2} ${L - 3} ${cy - 6} Z" fill="${hairC}"/>`;
    }
    parts.push(hair);
    return `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label || "volto"}">${parts.join("")}</svg>`;
  }

  return { svg };
});
