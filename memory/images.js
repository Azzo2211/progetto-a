/*
 * Progetto A - Memoria: immagini astratte per la disciplina «Immagini» (come in Memory League:
 * forme senza nome da ricordare in ordine). Ogni immagine nasce da un numero (seme): stessa
 * immagine per lo stesso seme. Niente DOM: restituisce SVG come testo.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MemoryImages = api;
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
  const f = (n) => (Math.round(n * 10) / 10).toString();
  const PALETTE = ["#d64545", "#e8833a", "#e7c23c", "#5aa36b", "#2f8f8b", "#3b7dd8", "#5b55c9", "#9a4fc0", "#d1528f", "#7a5a3a", "#2b3a4a", "#8fb339"];
  const BACKS = ["#f6f1e7", "#eef3f7", "#f3eef7", "#eef6ef", "#f8eeee", "#f1f1f1"];
  const SHAPES = ["blob", "star", "poly", "spiral", "waves", "rings", "cluster", "cross", "moon", "zigzag", "leaf", "grid"];

  // curva chiusa morbida per i punti (Catmull-Rom -> Bezier)
  function smoothClosed(pts) {
    const n = pts.length;
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    for (let i = 0; i < n; i += 1) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
    }
    return `${d} Z`;
  }
  function ring(r, n, rmin, rmax, rot = 0) {
    return Array.from({ length: n }, (_, i) => {
      const a = rot + (i / n) * Math.PI * 2;
      const rad = rmin + r() * (rmax - rmin);
      return [50 + Math.cos(a) * rad, 50 + Math.sin(a) * rad];
    });
  }

  function shape(kind, r, c1, c2) {
    const rot = r() * Math.PI * 2;
    if (kind === "blob") return `<path d="${smoothClosed(ring(r, 6 + Math.floor(r() * 4), 18, 40, rot))}" fill="${c1}"/>`;
    if (kind === "star") {
      const n = 5 + Math.floor(r() * 5);
      const outer = 34 + r() * 8;
      const inner = 10 + r() * 12;
      const pts = Array.from({ length: n * 2 }, (_, i) => {
        const a = rot + (i / (n * 2)) * Math.PI * 2;
        const rad = i % 2 ? inner : outer;
        return `${f(50 + Math.cos(a) * rad)},${f(50 + Math.sin(a) * rad)}`;
      });
      return `<polygon points="${pts.join(" ")}" fill="${c1}"/>`;
    }
    if (kind === "poly") {
      const pts = ring(r, 3 + Math.floor(r() * 5), 22, 40, rot).map((p) => `${f(p[0])},${f(p[1])}`);
      return `<polygon points="${pts.join(" ")}" fill="${c1}" stroke="${c2}" stroke-width="4" stroke-linejoin="round"/>`;
    }
    if (kind === "spiral") {
      const turns = 2.2 + r() * 1.6;
      const pts = [];
      for (let i = 0; i <= 80; i += 1) {
        const k = i / 80;
        const a = rot + k * turns * Math.PI * 2;
        const rad = 4 + k * 36;
        pts.push(`${f(50 + Math.cos(a) * rad)},${f(50 + Math.sin(a) * rad)}`);
      }
      return `<polyline points="${pts.join(" ")}" fill="none" stroke="${c1}" stroke-width="${f(5 + r() * 4)}" stroke-linecap="round"/>`;
    }
    if (kind === "waves") {
      const lines = 3 + Math.floor(r() * 2);
      const amp = 6 + r() * 8;
      const per = 1.5 + r() * 2;
      let out = "";
      for (let j = 0; j < lines; j += 1) {
        const y0 = 22 + j * (56 / (lines - 1));
        const pts = [];
        for (let x = 10; x <= 90; x += 4) pts.push(`${x},${f(y0 + Math.sin((x / 80) * per * Math.PI * 2 + j) * amp)}`);
        out += `<polyline points="${pts.join(" ")}" fill="none" stroke="${j % 2 ? c2 : c1}" stroke-width="5" stroke-linecap="round"/>`;
      }
      return out;
    }
    if (kind === "rings") {
      const n = 2 + Math.floor(r() * 3);
      let out = "";
      for (let j = n; j >= 1; j -= 1) out += `<circle cx="${f(50 + (r() - 0.5) * 8)}" cy="${f(50 + (r() - 0.5) * 8)}" r="${f(j * (38 / n))}" fill="${j % 2 ? c1 : c2}"/>`;
      return out;
    }
    if (kind === "cluster") {
      const n = 4 + Math.floor(r() * 5);
      let out = "";
      for (let j = 0; j < n; j += 1) out += `<circle cx="${f(18 + r() * 64)}" cy="${f(18 + r() * 64)}" r="${f(6 + r() * 14)}" fill="${j % 3 ? c1 : c2}"/>`;
      return out;
    }
    if (kind === "cross") {
      const w = 12 + r() * 10;
      const deg = Math.round(r() * 90);
      return `<g transform="rotate(${deg} 50 50)"><rect x="${f(50 - w / 2)}" y="12" width="${f(w)}" height="76" rx="4" fill="${c1}"/><rect x="12" y="${f(50 - w / 2)}" width="76" height="${f(w)}" rx="4" fill="${c2}"/></g>`;
    }
    if (kind === "moon") {
      const dx = 12 + r() * 12;
      const deg = Math.round(r() * 360);
      return `<g transform="rotate(${deg} 50 50)"><circle cx="50" cy="50" r="34" fill="${c1}"/><circle cx="${f(50 + dx)}" cy="${f(50 - dx / 3)}" r="30" fill="var(--mi-bg)"/><circle cx="${f(36 - dx / 4)}" cy="${f(60)}" r="${f(5 + r() * 4)}" fill="${c2}"/></g>`;
    }
    if (kind === "zigzag") {
      const n = 4 + Math.floor(r() * 4);
      const pts = [];
      for (let i = 0; i <= n; i += 1) pts.push(`${f(12 + (i / n) * 76)},${i % 2 ? f(28 + r() * 10) : f(64 + r() * 10)}`);
      return `<polyline points="${pts.join(" ")}" fill="none" stroke="${c1}" stroke-width="${f(7 + r() * 4)}" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${f(20 + r() * 60)}" cy="${f(20 + r() * 60)}" r="7" fill="${c2}"/>`;
    }
    if (kind === "leaf") {
      const deg = Math.round(r() * 180);
      const w = 14 + r() * 12;
      return `<g transform="rotate(${deg} 50 50)"><path d="M50 10 C${f(50 + w * 2)} 35 ${f(50 + w * 2)} 65 50 90 C${f(50 - w * 2)} 65 ${f(50 - w * 2)} 35 50 10 Z" fill="${c1}"/><path d="M50 14 L50 86" stroke="${c2}" stroke-width="3"/></g>`;
    }
    // grid: scacchiera irregolare
    const n = 3 + Math.floor(r() * 2);
    const sz = 76 / n;
    let out = "";
    for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) if (r() < 0.55) out += `<rect x="${f(12 + i * sz)}" y="${f(12 + j * sz)}" width="${f(sz - 2)}" height="${f(sz - 2)}" rx="2" fill="${(i + j) % 2 ? c1 : c2}"/>`;
    return out || `<rect x="30" y="30" width="40" height="40" fill="${c1}"/>`;
  }

  // Descrizione dell'immagine dal seme (per i test e per l'accessibilita').
  function describe(seed) {
    const r = rng(seed);
    const kind = SHAPES[Math.floor(r() * SHAPES.length)];
    const i1 = Math.floor(r() * PALETTE.length);
    let i2 = Math.floor(r() * PALETTE.length);
    if (i2 === i1) i2 = (i2 + 5) % PALETTE.length;
    const back = BACKS[Math.floor(r() * BACKS.length)];
    return { kind, c1: PALETTE[i1], c2: PALETTE[i2], back, r };
  }

  function svg(seed, { label = "Immagine astratta" } = {}) {
    const x = describe(seed);
    const body = shape(x.kind, x.r, x.c1, x.c2);
    return `<svg class="mem-abs" viewBox="0 0 100 100" role="img" aria-label="${label}" style="--mi-bg:${x.back}"><rect width="100" height="100" rx="12" fill="${x.back}"/>${body}</svg>`;
  }

  return { svg, describe, SHAPES, PALETTE };
});
