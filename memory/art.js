/*
 * Progetto A - Memoria: i disegni del personaggio e degli oggetti degli scrigni (SVG come testo,
 * senza DOM). Tutto originale: un mantello col cappuccio e lo sguardo acceso, che si veste con
 * quello che trovi (mantelli, aure, emblemi, compagni, sfondi) e cambia forma con i livelli; le
 * reliquie sono incisioni dorate. Piu' l'oggetto e' raro, piu' e' ricco (luce, movimento).
 * Le animazioni usano le classi ma-* (memory/memory.css) e si fermano con «riduci movimento».
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.MemoryArt = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const GA = root.MemoryGacha || (typeof require === "function" ? require("./gacha.js") : null);
  if (!GA) return {};
  let SEQ = 0;
  const uid = () => `ma${(SEQ += 1).toString(36)}`;
  const f = (n) => (Math.round(n * 10) / 10).toString();
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  const rngOf = (key) => GA.rng(hash(String(key)));

  /* ------------------------------------------------------------ pezzi comuni */
  function glowFilter(id, sd = 2.2) {
    return `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  }
  function blurFilter(id, sd = 8) {
    return `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
  }
  function starPath(cx, cy, ro, ri, n = 5, rot = -Math.PI / 2) {
    const pts = [];
    for (let i = 0; i < n * 2; i += 1) {
      const a = rot + (i * Math.PI) / n;
      const r = i % 2 ? ri : ro;
      pts.push(`${f(cx + Math.cos(a) * r)},${f(cy + Math.sin(a) * r)}`);
    }
    return `M${pts.join("L")}Z`;
  }
  function sparkle(cx, cy, r) {
    return `M${f(cx)} ${f(cy - r)}Q${f(cx + r * 0.18)} ${f(cy - r * 0.18)} ${f(cx + r)} ${f(cy)}Q${f(cx + r * 0.18)} ${f(cy + r * 0.18)} ${f(cx)} ${f(cy + r)}Q${f(cx - r * 0.18)} ${f(cy + r * 0.18)} ${f(cx - r)} ${f(cy)}Q${f(cx - r * 0.18)} ${f(cy - r * 0.18)} ${f(cx)} ${f(cy - r)}Z`;
  }
  function dots(r, n, x0, y0, w, h, rmin, rmax, color, cls = "") {
    let out = "";
    for (let i = 0; i < n; i += 1) {
      const x = x0 + r() * w;
      const y = y0 + r() * h;
      out += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rmin + r() * (rmax - rmin))}" fill="${color}" opacity="${f(0.35 + r() * 0.65)}"${cls ? ` class="${cls}" style="animation-delay:${f(r() * 3)}s"` : ""}/>`;
    }
    return out;
  }

  /* ------------------------------------------------------------ sfondi (200 x 240) */
  function scene(kind, id) {
    const r = rngOf(`scene-${kind}`);
    const sky = (top, bottom) => `<defs><linearGradient id="${id}sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="200" height="240" fill="url(#${id}sk)"/>`;
    if (kind === "library") {
      let s = sky("#4a2d1c", "#170c07");
      s += `<defs><radialGradient id="${id}lp" cx=".5" cy=".18" r=".6"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient></defs><rect width="200" height="240" fill="url(#${id}lp)"/>`;
      const cols = ["#7a2e2e", "#2f4f7a", "#5d6b2f", "#7a5a2e", "#4b2f6b", "#2e6b62", "#8a6a3a"];
      [64, 116, 168].forEach((y) => {
        s += `<rect x="0" y="${y}" width="200" height="5" fill="#2a170d"/>`;
        let x = 2;
        while (x < 198) {
          const w = 5 + r() * 7;
          const h = 26 + r() * 18;
          s += `<rect x="${f(x)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" rx="1" fill="${cols[Math.floor(r() * cols.length)]}" opacity=".7"/>`;
          x += w + 1 + r() * 2;
        }
      });
      s += `<rect y="214" width="200" height="26" fill="#120804"/>`;
      return s;
    }
    if (kind === "house") {
      let s = sky("#2f3350", "#171a2b");
      s += `<path d="M0 196 L200 196 L200 240 L0 240 Z" fill="#2b2440"/><path d="M0 196 L200 196" stroke="#3d3560" stroke-width="2"/>`;
      s += `<path d="M18 196 V112 Q18 92 38 92 Q58 92 58 112 V196 Z" fill="#14121f" stroke="#4a4170" stroke-width="2"/><circle cx="50" cy="152" r="2.4" fill="#e6c777"/>`;
      s += `<rect x="142" y="70" width="44" height="56" rx="3" fill="#0c1430" stroke="#4a4170" stroke-width="3"/><path d="M164 70 V126 M142 98 H186" stroke="#4a4170" stroke-width="2"/><circle cx="174" cy="84" r="6" fill="#f4efd9" opacity=".9"/>`;
      s += `<path d="M142 126 L186 126 L200 200 L118 200 Z" fill="#cfd8ff" opacity=".08"/><ellipse cx="100" cy="222" rx="70" ry="10" fill="#3b2f5e" opacity=".8"/>`;
      return s;
    }
    if (kind === "garden") {
      let s = sky("#3b4766", "#1b2133");
      s += `<circle cx="156" cy="46" r="18" fill="#e9eef7" opacity=".85"/><circle cx="150" cy="42" r="4" fill="#cfd8e6" opacity=".6"/>`;
      s += `<path d="M0 170 Q100 150 200 170 L200 240 L0 240 Z" fill="#c9cfd8" opacity=".22"/>`;
      for (let i = 0; i < 6; i += 1) s += `<path d="M0 ${178 + i * 10} Q100 ${160 + i * 10} 200 ${178 + i * 10}" fill="none" stroke="#dfe5ee" stroke-opacity=".22" stroke-width="1.4"/>`;
      s += `<ellipse cx="34" cy="206" rx="20" ry="10" fill="#151a26"/><ellipse cx="170" cy="214" rx="16" ry="8" fill="#151a26"/><ellipse cx="178" cy="200" rx="8" ry="5" fill="#1d2433"/>`;
      return s;
    }
    if (kind === "crystal") {
      let s = sky("#0f3844", "#05141a");
      s += `<defs><linearGradient id="${id}cr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bff6ff"/><stop offset=".5" stop-color="#3fb6c9"/><stop offset="1" stop-color="#0b4552"/></linearGradient>${glowFilter(`${id}cg`, 3)}</defs>`;
      [[18, 236, 14, 110], [40, 236, 10, 70], [160, 236, 16, 130], [184, 236, 10, 80], [138, 236, 8, 56], [62, 236, 7, 44]].forEach(([x, y, w, h]) => {
        s += `<path d="M${x - w} ${y} L${x - w * 0.7} ${y - h * 0.8} L${x} ${y - h} L${x + w * 0.7} ${y - h * 0.8} L${x + w} ${y} Z" fill="url(#${id}cr)" opacity=".85" filter="url(#${id}cg)"/><path d="M${x} ${y - h} L${x} ${y}" stroke="#e9fdff" stroke-opacity=".5"/>`;
      });
      s += dots(r, 18, 0, 0, 200, 150, 0.5, 1.4, "#c9fbff", "ma-twinkle");
      return s;
    }
    if (kind === "mountains") {
      let s = sky("#3c2f86", "#ff9a6b");
      s += `<circle cx="100" cy="168" r="30" fill="#ffd27a" opacity=".95"/>`;
      s += `<path d="M0 170 L30 130 L58 158 L92 112 L128 160 L160 124 L200 168 L200 240 L0 240 Z" fill="#6b4c8f"/>`;
      s += `<path d="M0 196 L40 156 L80 186 L118 150 L156 190 L200 160 L200 240 L0 240 Z" fill="#43306a"/>`;
      s += `<path d="M0 222 L50 192 L100 218 L150 196 L200 220 L200 240 L0 240 Z" fill="#251a3d"/>`;
      return s;
    }
    if (kind === "city") {
      let s = sky("#18214a", "#06081a");
      s += dots(r, 22, 0, 0, 200, 110, 0.4, 1.2, "#dfe6ff");
      let x = 0;
      while (x < 200) {
        const w = 14 + r() * 18;
        const h = 50 + r() * 110;
        s += `<rect x="${f(x)}" y="${f(240 - h)}" width="${f(w)}" height="${f(h)}" fill="#0b1029"/>`;
        for (let wy = 240 - h + 6; wy < 232; wy += 9) for (let wx = x + 3; wx < x + w - 3; wx += 6) if (r() < 0.32) s += `<rect x="${f(wx)}" y="${f(wy)}" width="2.6" height="3.4" fill="${r() < 0.8 ? "#ffcf6b" : "#7fe3ff"}" opacity=".85"/>`;
        x += w + 2;
      }
      return s;
    }
    if (kind === "stars") {
      let s = sky("#120a2e", "#04040f");
      s += `<defs>${blurFilter(`${id}nb`, 14)}</defs><g filter="url(#${id}nb)" opacity=".55"><ellipse cx="50" cy="70" rx="60" ry="30" fill="#7c3aed"/><ellipse cx="150" cy="150" rx="55" ry="34" fill="#0ea5a5"/><ellipse cx="120" cy="40" rx="40" ry="18" fill="#db2777"/></g>`;
      s += dots(r, 70, 0, 0, 200, 240, 0.3, 1.3, "#ffffff", "ma-twinkle");
      s += `<path d="${sparkle(36, 30, 5)}" fill="#fff"/><path d="${sparkle(168, 92, 4)}" fill="#ffe8f6"/>`;
      return s;
    }
    if (kind === "theatre") {
      let s = sky("#2c0b13", "#0b0306");
      s += `<defs><radialGradient id="${id}th" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#ffcf6b" stop-opacity=".45"/><stop offset="1" stop-color="#ffcf6b" stop-opacity="0"/></radialGradient></defs><rect width="200" height="240" fill="url(#${id}th)"/>`;
      for (let i = 0; i < 7; i += 1) {
        const rx = 40 + i * 13;
        const ry = 26 + i * 12;
        s += `<path d="M${100 - rx} 200 A${rx} ${ry} 0 0 1 ${100 + rx} 200" fill="none" stroke="#d9a441" stroke-opacity="${f(0.75 - i * 0.07)}" stroke-width="2"/>`;
        const doors = 3 + i;
        for (let k = 0; k <= doors; k += 1) {
          const a = Math.PI + (k / doors) * Math.PI;
          const dx = 100 + Math.cos(a) * rx;
          const dy = 200 + Math.sin(a) * ry;
          s += `<rect x="${f(dx - 1.6)}" y="${f(dy - 4.6)}" width="3.2" height="4.6" rx=".8" fill="#ffcf6b" opacity="${f(0.45 + r() * 0.5)}"/>`;
        }
      }
      s += `<rect y="200" width="200" height="40" fill="#180509"/><path d="M0 200 H200" stroke="#d9a441" stroke-opacity=".6"/>`;
      return s;
    }
    // la Torre (di partenza)
    let s = sky("#2a2160", "#0e0b22");
    s += dots(r, 34, 0, 0, 200, 150, 0.4, 1.3, "#ffffff", "ma-twinkle");
    s += `<circle cx="160" cy="42" r="15" fill="#f4efd9"/><circle cx="155" cy="38" r="3" fill="#e2dcc2"/><circle cx="165" cy="47" r="2" fill="#e2dcc2"/>`;
    s += `<path d="M14 240 V128 H18 V122 H24 V128 H30 V122 H36 V128 H42 V122 H48 V128 H52 V240 Z" fill="#0b091a"/><rect x="29" y="146" width="7" height="11" rx="3.5" fill="#f4b740"/><rect x="29" y="176" width="7" height="11" rx="3.5" fill="#f4b740" opacity=".7"/>`;
    s += `<path d="M0 226 Q60 210 120 222 T200 214 V240 H0 Z" fill="#0b091a"/>`;
    return s;
  }

  /* ------------------------------------------------------------ aure (attorno a 100,122) */
  function aura(a, id) {
    const c = a.color;
    const r = rngOf(`aura-${a.kind}`);
    if (a.kind === "glow") return `<defs><radialGradient id="${id}ag" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${c}" stop-opacity=".6"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle class="ma-pulse" cx="100" cy="122" r="96" fill="url(#${id}ag)"/>`;
    if (a.kind === "ring") return `<defs>${glowFilter(`${id}ar`, 2)}</defs><circle cx="100" cy="122" r="86" fill="none" stroke="${c}" stroke-width="2.4" opacity=".85" filter="url(#${id}ar)"/>`;
    if (a.kind === "rings") return `<defs>${glowFilter(`${id}ar`, 2)}</defs><g filter="url(#${id}ar)"><circle cx="100" cy="122" r="72" fill="none" stroke="${c}" stroke-width="2"/><circle class="ma-spin" cx="100" cy="122" r="90" fill="none" stroke="${c}" stroke-width="2.4" stroke-dasharray="5 7"/></g>`;
    if (a.kind === "sparks") {
      let s = `<defs>${glowFilter(`${id}as`, 1.6)}</defs><g filter="url(#${id}as)">`;
      for (let i = 0; i < 16; i += 1) {
        const an = (i / 16) * Math.PI * 2 + r() * 0.3;
        const rad = 66 + r() * 30;
        s += `<path class="ma-twinkle" style="animation-delay:${f(r() * 2.5)}s" d="${sparkle(100 + Math.cos(an) * rad, 122 + Math.sin(an) * rad * 1.08, 3 + r() * 4)}" fill="${c}"/>`;
      }
      return `${s}</g>`;
    }
    if (a.kind === "runes") {
      let s = `<defs>${glowFilter(`${id}ru`, 1.8)}</defs><g class="ma-spin-slow" filter="url(#${id}ru)"><circle cx="100" cy="122" r="88" fill="none" stroke="${c}" stroke-width="1.2" opacity=".7"/><circle cx="100" cy="122" r="78" fill="none" stroke="${c}" stroke-width=".8" opacity=".5"/>`;
      const glyphs = ["M-4 -5 L0 5 L4 -5", "M-4 5 V-5 L4 0 L-4 5", "M-4 -5 H4 L-4 5 H4", "M0 -6 V6 M-4 -2 L4 2", "M-4 -4 L4 4 M4 -4 L-4 4", "M-3 -6 V6 M3 -6 V6 M-3 0 H3"];
      for (let i = 0; i < 12; i += 1) {
        const an = (i / 12) * Math.PI * 2;
        s += `<path transform="translate(${f(100 + Math.cos(an) * 83)} ${f(122 + Math.sin(an) * 83)}) rotate(${f((an * 180) / Math.PI + 90)})" d="${glyphs[i % glyphs.length]}" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
      return `${s}</g>`;
    }
    if (a.kind === "spiral") {
      const pts = [];
      for (let i = 0; i <= 140; i += 1) {
        const k = i / 140;
        const an = k * Math.PI * 2 * 2.6;
        const rad = 12 + k * 86;
        pts.push(`${f(100 + Math.cos(an) * rad)},${f(122 + Math.sin(an) * rad)}`);
      }
      return `<defs>${glowFilter(`${id}sp`, 2.4)}</defs><g class="ma-spin-slow" filter="url(#${id}sp)"><polyline points="${pts.join(" ")}" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" opacity=".8"/></g>`;
    }
    if (a.kind === "flames") {
      let s = `<defs><linearGradient id="${id}fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${c}"/><stop offset=".6" stop-color="#ffdd8a" stop-opacity=".8"/><stop offset="1" stop-color="#fff4cc" stop-opacity="0"/></linearGradient>${glowFilter(`${id}fg`, 2.5)}</defs><g filter="url(#${id}fg)">`;
      for (let i = 0; i < 14; i += 1) {
        const an = Math.PI * 0.95 + (i / 13) * Math.PI * 1.1;
        const x = 100 + Math.cos(an) * 74;
        const y = 132 + Math.sin(an) * 96;
        const h = 22 + r() * 18;
        s += `<path class="ma-flicker" style="animation-delay:${f(r() * 1.5)}s" d="M${f(x - 7)} ${f(y)} Q${f(x - 6)} ${f(y - h * 0.6)} ${f(x)} ${f(y - h)} Q${f(x + 6)} ${f(y - h * 0.6)} ${f(x + 7)} ${f(y)} Q${f(x)} ${f(y + 6)} ${f(x - 7)} ${f(y)} Z" fill="url(#${id}fl)" opacity=".85"/>`;
      }
      return `${s}</g>`;
    }
    // galassia
    let s = `<defs><radialGradient id="${id}gx" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".35" stop-color="${c}" stop-opacity=".55"/><stop offset="1" stop-color="#5b3fd1" stop-opacity="0"/></radialGradient>${glowFilter(`${id}gg`, 1.4)}</defs><g class="ma-spin-slower"><circle cx="100" cy="122" r="98" fill="url(#${id}gx)" opacity=".95"/><circle cx="100" cy="122" r="96" fill="none" stroke="${c}" stroke-opacity=".35" stroke-width="1.2"/><g filter="url(#${id}gg)">`;
    for (let arm = 0; arm < 2; arm += 1) {
      for (let i = 0; i < 46; i += 1) {
        const k = i / 46;
        const an = arm * Math.PI + k * Math.PI * 2.2;
        const rad = 14 + k * 84;
        s += `<circle cx="${f(100 + Math.cos(an) * rad + (r() - 0.5) * 8)}" cy="${f(122 + Math.sin(an) * rad + (r() - 0.5) * 8)}" r="${f(0.9 + r() * 1.9)}" fill="${r() < 0.5 ? "#ffffff" : c}" opacity="${f(0.55 + r() * 0.45)}"/>`;
      }
    }
    return `${s}</g></g>`;
  }

  /* ------------------------------------------------------------ mantello e figura */
  const CLOAK = "M100 30 C80 30 66 46 64 68 C62 84 64 96 66 104 C52 110 40 120 36 136 C30 160 26 196 22 226 Q61 233 100 228 Q139 233 178 226 C174 196 170 160 164 136 C160 120 148 110 134 104 C136 96 138 84 136 68 C134 46 120 30 100 30 Z";
  const FACE = "M100 52 C86 52 78 64 78 80 C78 96 88 106 100 106 C112 106 122 96 122 80 C122 64 114 52 100 52 Z";
  function cloakPattern(a, id) {
    const r = rngOf(`cloak-${a.pattern}-${a.base}`);
    const t = a.trim || "#ffffff";
    if (a.pattern === "stripes") { let s = ""; for (let x = 30; x < 180; x += 11) s += `<path d="M${x} 20 V240" stroke="#ffffff" stroke-opacity=".09" stroke-width="4"/>`; return s; }
    if (a.pattern === "waves") { let s = ""; for (let y = 120; y < 236; y += 14) s += `<path d="M10 ${y} Q30 ${y - 6} 50 ${y} T90 ${y} T130 ${y} T170 ${y} T210 ${y}" fill="none" stroke="${t}" stroke-opacity=".28" stroke-width="2"/>`; return s; }
    if (a.pattern === "stars") return dots(r, 46, 20, 40, 160, 190, 0.5, 1.6, t, "ma-twinkle") + [[60, 160], [140, 190], [120, 140], [70, 208]].map(([x, y]) => `<path d="${sparkle(x, y, 3.4)}" fill="${t}"/>`).join("") + `<path d="M60 160 L120 140 L140 190 L70 208" fill="none" stroke="${t}" stroke-opacity=".35" stroke-width=".8"/>`;
    if (a.pattern === "runes") {
      let s = `<g filter="url(#${id}gl)">`;
      const g = ["M-3 -4 L0 4 L3 -4", "M-3 4 V-4 L3 0 L-3 4", "M-3 -4 H3 L-3 4 H3", "M0 -5 V5 M-3 -2 L3 2"];
      for (let i = 0; i < 16; i += 1) s += `<path class="ma-twinkle" style="animation-delay:${f(r() * 3)}s" transform="translate(${f(36 + r() * 128)} ${f(120 + r() * 100)})" d="${g[i % 4]}" fill="none" stroke="${t}" stroke-width="1.4" stroke-linecap="round"/>`;
      return `${s}</g>`;
    }
    if (a.pattern === "aurora") return `<g filter="url(#${id}bl)" opacity=".75"><ellipse class="ma-drift" cx="70" cy="150" rx="46" ry="70" fill="#46ffb5"/><ellipse class="ma-drift2" cx="130" cy="170" rx="44" ry="64" fill="#4fd6ff"/><ellipse class="ma-drift" cx="100" cy="214" rx="70" ry="30" fill="#b46bff"/></g>`;
    if (a.pattern === "flames") {
      let s = `<defs><linearGradient id="${id}cf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a1f"/><stop offset=".6" stop-color="#ffb03a" stop-opacity=".7"/><stop offset="1" stop-color="#ffe08a" stop-opacity="0"/></linearGradient></defs><g filter="url(#${id}gl)">`;
      for (let i = 0; i < 9; i += 1) { const x = 30 + i * 17 + r() * 6; const h = 30 + r() * 40; s += `<path class="ma-flicker" style="animation-delay:${f(r() * 1.4)}s" d="M${f(x - 8)} 232 Q${f(x - 6)} ${f(232 - h * 0.6)} ${f(x)} ${f(232 - h)} Q${f(x + 6)} ${f(232 - h * 0.6)} ${f(x + 8)} 232 Z" fill="url(#${id}cf)"/>`; }
      return s + dots(r, 14, 30, 120, 140, 100, 0.6, 1.4, "#ffb03a", "ma-twinkle") + "</g>";
    }
    if (a.pattern === "time") {
      let s = `<g opacity=".55"><circle cx="100" cy="150" r="46" fill="none" stroke="${t}" stroke-width="1"/><circle cx="100" cy="150" r="34" fill="none" stroke="${t}" stroke-width=".8" stroke-dasharray="2 4"/>`;
      for (let i = 0; i < 12; i += 1) { const an = (i / 12) * Math.PI * 2; s += `<path d="M${f(100 + Math.cos(an) * 40)} ${f(150 + Math.sin(an) * 40)} L${f(100 + Math.cos(an) * 46)} ${f(150 + Math.sin(an) * 46)}" stroke="${t}" stroke-width="1.6"/>`; }
      s += `<g class="ma-spin-slow"><path d="M100 150 L100 120" stroke="${t}" stroke-width="1.6" stroke-linecap="round"/></g><path d="M100 150 L120 160" stroke="${t}" stroke-width="1.2" stroke-linecap="round"/></g>`;
      return s + dots(r, 24, 30, 40, 140, 190, 0.5, 1.3, "#fff3c4", "ma-twinkle");
    }
    return "";
  }
  function cloakFill(a, id) {
    if (a.pattern === "time") return `<linearGradient id="${id}cb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a7a"><animate attributeName="stop-color" values="#3a2a7a;#1f4f8a;#6b3a7a;#3a2a7a" dur="9s" repeatCount="indefinite"/></stop><stop offset="1" stop-color="#16123a"/></linearGradient>`;
    return `<linearGradient id="${id}cb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a.base}"/><stop offset="1" stop-color="${shade(a.base, -0.25)}"/></linearGradient>`;
  }
  function shade(hex, k) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m) return hex;
    const n = parseInt(m[1], 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(Math.min(255, Math.max(0, k < 0 ? v * (1 + k) : v + (255 - v) * k))));
    return `#${ch.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  }
  function figure(cloak, id, form, eye) {
    const a = cloak.art;
    const trim = a.trim || (form >= 2 ? "#c9b37a" : null);
    let s = `<defs>${cloakFill(a, id)}<clipPath id="${id}cl"><path d="${CLOAK}"/></clipPath>
      <linearGradient id="${id}vol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".3" stop-color="#000" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>
      <radialGradient id="${id}fc" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#14101f"/><stop offset="1" stop-color="#050309"/></radialGradient></defs>`;
    s += `<ellipse cx="100" cy="230" rx="76" ry="7" fill="#000" opacity=".35"/>`;
    s += `<path d="${CLOAK}" fill="url(#${id}cb)"/>`;
    s += `<g clip-path="url(#${id}cl)">${cloakPattern(a, id)}<path d="M100 106 L82 232 L118 232 Z" fill="${a.lining}"/><rect width="200" height="240" fill="url(#${id}vol)"/></g>`;
    if (trim) s += `<path d="M100 106 L82 230 M100 106 L118 230" stroke="${trim}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`;
    s += `<path d="${FACE}" fill="url(#${id}fc)"/>`;
    if (trim) s += `<path d="${FACE}" fill="none" stroke="${trim}" stroke-width="3"/>`;
    s += `<g filter="url(#${id}gl)"><ellipse cx="91" cy="83" rx="4.4" ry="2.7" fill="${eye}"/><ellipse cx="109" cy="83" rx="4.4" ry="2.7" fill="${eye}"/></g>`;
    if (form >= 3) {
      const pc = a.trim || "#b9c0cc";
      s += `<path d="M42 132 Q52 110 78 112 Q72 130 48 140 Z" fill="${shade(pc, -0.35)}" stroke="${pc}" stroke-width="1.6"/><path d="M158 132 Q148 110 122 112 Q128 130 152 140 Z" fill="${shade(pc, -0.35)}" stroke="${pc}" stroke-width="1.6"/>`;
    }
    if (form >= 4) s += `<path d="M34 176 Q100 188 166 176 L167 184 Q100 196 33 184 Z" fill="${shade(a.lining, -0.3)}" stroke="${trim || "#c9b37a"}" stroke-width="1.2"/><circle cx="100" cy="187" r="4.6" fill="${eye}" filter="url(#${id}gl)"/>`;
    return s;
  }

  /* ------------------------------------------------------------ emblemi */
  const METALS = {
    iron: { a: "#b6bfcd", b: "#6b7385", ink: "#2b313d", rim: "#4b5262" },
    silver: { a: "#ffffff", b: "#aeb8c9", ink: "#3d4757", rim: "#8d97a8" },
    gold: { a: "#ffe9a3", b: "#cf9417", ink: "#5e3a06", rim: "#a8720f" },
    crystal: { a: "#f0fdff", b: "#6fcff7", ink: "#0f3a63", rim: "#4fb3e8", glow: "#8ff0ff" },
    astral: { a: "#ffe3f6", b: "#8f6bff", ink: "#ffffff", rim: "#ffffff", glow: "#ff9ee0" }
  };
  const ICONS = {
    eye: '<path d="M7 20 Q20 9 33 20 Q20 31 7 20 Z" fill="none" stroke="INK" stroke-width="2.6" stroke-linejoin="round"/><circle cx="20" cy="20" r="4.6" fill="INK"/>',
    key: '<circle cx="14" cy="20" r="5.6" fill="none" stroke="INK" stroke-width="2.6"/><path d="M19.6 20 H33 M28 20 V25 M32.5 20 V24" fill="none" stroke="INK" stroke-width="2.6" stroke-linecap="round"/>',
    book: '<path d="M20 12 Q13 9 8 11 V29 Q13 27 20 30 Q27 27 32 29 V11 Q27 9 20 12 Z M20 12 V30" fill="none" stroke="INK" stroke-width="2.4" stroke-linejoin="round"/>',
    hourglass: '<path d="M12 9 H28 M12 31 H28 M14 9 Q14 18 20 20 Q14 22 14 31 M26 9 Q26 18 20 20 Q26 22 26 31" fill="none" stroke="INK" stroke-width="2.4" stroke-linecap="round"/><path d="M16.5 29.5 Q20 24 23.5 29.5 Z" fill="INK"/>',
    tower: '<path d="M13 31 V15 H27 V31 Z M13 15 V11 H16 V13 H19 V11 H21 V13 H24 V11 H27 V15 M18 31 V25 Q20 23 22 25 V31" fill="none" stroke="INK" stroke-width="2.2" stroke-linejoin="round"/>',
    compass: '<circle cx="20" cy="20" r="11" fill="none" stroke="INK" stroke-width="2.2"/><path d="M20 10.5 L23 20 L20 29.5 L17 20 Z" fill="none" stroke="INK" stroke-width="1.8" stroke-linejoin="round"/><path d="M20 10.5 L23 20 L17 20 Z" fill="INK"/>',
    maze: '<path d="M9 9 H31 V31 H9 V14 M14 14 H26 V26 H14 V19 M19 19 H21 V21" fill="none" stroke="INK" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
    owl: '<path d="M10 13 Q10 32 20 32 Q30 32 30 13 L26 16 Q20 13 14 16 Z" fill="none" stroke="INK" stroke-width="2.2" stroke-linejoin="round"/><circle cx="15.5" cy="20" r="3.4" fill="INK"/><circle cx="24.5" cy="20" r="3.4" fill="INK"/><path d="M18.6 23.5 L20 26.5 L21.4 23.5 Z" fill="INK"/>',
    infinity: '<path d="M20 20 C16 13 8 13 8 20 C8 27 16 27 20 20 C24 13 32 13 32 20 C32 27 24 27 20 20 Z" fill="none" stroke="INK" stroke-width="2.6"/>',
    star: `<path d="${starPath(20, 21, 12, 5)}" fill="INK"/>`,
    temple: '<path d="M8 16 L20 9 L32 16 Z" fill="INK"/><path d="M11.5 18 V28 M16.5 18 V28 M23.5 18 V28 M28.5 18 V28 M8 30.5 H32" fill="none" stroke="INK" stroke-width="2.4" stroke-linecap="round"/>',
    crown: '<path d="M9 28 L10.5 13 L16 19.5 L20 10 L24 19.5 L29.5 13 L31 28 Z" fill="INK"/><circle cx="20" cy="23.5" r="2.2" fill="#ff7ab6"/>'
  };
  function emblem(a, id, cx, cy, r) {
    const M = METALS[a.metal] || METALS.iron;
    const k = (r * 2) / 40;
    let s = `<defs><radialGradient id="${id}em" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${M.a}"/><stop offset="1" stop-color="${M.b}"/></radialGradient>${M.glow ? glowFilter(`${id}eg`, 2) : ""}</defs><g${M.glow ? ` filter="url(#${id}eg)"` : ""}>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}em)" stroke="${M.rim}" stroke-width="${f(Math.max(1, r * 0.12))}"/>`;
    if (a.metal === "astral") s += `<circle class="ma-spin" cx="${cx}" cy="${cy}" r="${f(r * 1.22)}" fill="none" stroke="${M.glow}" stroke-width="${f(r * 0.08)}" stroke-dasharray="${f(r * 0.2)} ${f(r * 0.3)}"/>`;
    s += `<g transform="translate(${f(cx - r)} ${f(cy - r)}) scale(${f(k)})">${(ICONS[a.icon] || ICONS.eye).replace(/INK/g, M.ink)}</g></g>`;
    return s;
  }

  /* ------------------------------------------------------------ compagni (100 x 100) */
  function pet(a, id) {
    const [c1, c2, c3] = a.c;
    const eyes = (x1, x2, y, rr = 3.4, col = "#1a1628") => `<ellipse cx="${x1}" cy="${y}" rx="${rr}" ry="${f(rr * 1.2)}" fill="${col}"/><ellipse cx="${x2}" cy="${y}" rx="${rr}" ry="${f(rr * 1.2)}" fill="${col}"/><circle cx="${f(x1 + rr * 0.35)}" cy="${f(y - rr * 0.45)}" r="${f(rr * 0.38)}" fill="#fff"/><circle cx="${f(x2 + rr * 0.35)}" cy="${f(y - rr * 0.45)}" r="${f(rr * 0.38)}" fill="#fff"/>`;
    const shadow = '<ellipse cx="50" cy="93" rx="24" ry="4" fill="#000" opacity=".25"/>';
    const sp = a.species;
    if (sp === "cat") return `${shadow}<path d="M70 82 C90 80 92 58 80 52" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"/><ellipse cx="50" cy="74" rx="22" ry="17" fill="${c1}"/><ellipse cx="50" cy="78" rx="12" ry="10" fill="${c2}"/><circle cx="50" cy="48" r="21" fill="${c1}"/><path d="M32 38 L34 18 L47 30 Z M68 38 L66 18 L53 30 Z" fill="${c1}"/><path d="M35 34 L36 24 L43 31 Z M65 34 L64 24 L57 31 Z" fill="#f7b4b4"/><path d="M40 36 Q44 33 46 37 M54 37 Q56 33 60 36" stroke="${c3}" stroke-width="2" fill="none" stroke-linecap="round"/>${eyes(42, 58, 49)}<path d="M48 55 L52 55 L50 57.5 Z" fill="#e57a8a"/><path d="M26 54 L38 55 M26 59 L38 57 M74 54 L62 55 M74 59 L62 57" stroke="#fff" stroke-opacity=".7" stroke-width="1"/>`;
    if (sp === "fox") return `${shadow}<path d="M66 84 C92 86 98 58 82 46 C86 62 76 72 64 74 Z" fill="${c1}"/><path d="M82 46 C88 52 88 58 86 62 C82 56 80 52 82 46 Z" fill="${c2}"/><ellipse cx="48" cy="74" rx="20" ry="16" fill="${c1}"/><ellipse cx="48" cy="79" rx="11" ry="9" fill="${c2}"/><path d="M26 42 Q48 76 70 42 Q62 28 48 30 Q34 28 26 42 Z" fill="${c1}"/><path d="M27 40 L28 14 L44 31 Z M69 40 L68 14 L52 31 Z" fill="${c1}"/><path d="M31 36 L32 22 L41 31 Z M65 36 L64 22 L55 31 Z" fill="${c3}"/><path d="M30 46 Q40 60 48 62 Q56 60 66 46 Q58 52 48 52 Q38 52 30 46 Z" fill="${c2}"/>${eyes(39, 57, 44, 3)}<ellipse cx="48" cy="57" rx="3" ry="2.2" fill="#1a1628"/>`;
    if (sp === "turtle") return `${shadow}<ellipse cx="27" cy="74" rx="11" ry="9" fill="${c3}"/>${eyes(24, 31, 72, 1.9)}<ellipse cx="38" cy="88" rx="6" ry="4" fill="${c3}"/><ellipse cx="68" cy="88" rx="6" ry="4" fill="${c3}"/><path d="M30 84 Q30 46 56 44 Q82 46 82 84 Z" fill="${c1}"/><path d="M56 50 L66 58 L64 70 L48 70 L46 58 Z M46 58 L36 64 M66 58 L76 64 M48 70 L44 82 M64 70 L68 82" fill="none" stroke="${c2}" stroke-width="2.4" stroke-linejoin="round"/><path d="M30 84 H82" stroke="${c2}" stroke-width="3" stroke-linecap="round"/>`;
    if (sp === "owl") return `${shadow}<path d="M24 34 L30 18 L40 30 Z M76 34 L70 18 L60 30 Z" fill="${c1}"/><ellipse cx="50" cy="58" rx="26" ry="31" fill="${c1}"/><ellipse cx="50" cy="66" rx="15" ry="18" fill="${c2}"/><path d="M42 62 l4 3 l4 -3 l4 3 l4 -3 M42 70 l4 3 l4 -3 l4 3 l4 -3" fill="none" stroke="${c1}" stroke-width="1.4"/><path d="M24 54 Q18 70 28 82 Q30 66 34 58 Z M76 54 Q82 70 72 82 Q70 66 66 58 Z" fill="${shade(c1, -0.25)}"/><circle cx="40" cy="44" r="10" fill="#fff"/><circle cx="60" cy="44" r="10" fill="#fff"/><circle cx="40" cy="44" r="6.4" fill="${c3}"/><circle cx="60" cy="44" r="6.4" fill="${c3}"/><circle cx="40" cy="44" r="3.4" fill="#1a1628"/><circle cx="60" cy="44" r="3.4" fill="#1a1628"/><circle cx="41.5" cy="42.5" r="1.3" fill="#fff"/><circle cx="61.5" cy="42.5" r="1.3" fill="#fff"/><path d="M46 51 L50 58 L54 51 Z" fill="#e6a33a"/><path d="M42 88 l3 4 M47 89 l0 4 M53 89 l0 4 M58 88 l-3 4" stroke="#e6a33a" stroke-width="2" stroke-linecap="round"/>`;
    if (sp === "raven") return `<defs><linearGradient id="${id}rv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset=".5" stop-color="${c1}"/><stop offset="1" stop-color="${c1}"/></linearGradient>${glowFilter(`${id}rg`, 1.6)}</defs>${shadow}<path d="M58 70 L86 86 L80 76 L90 78 Z" fill="${c1}"/><ellipse cx="52" cy="64" rx="24" ry="20" fill="url(#${id}rv)"/><path d="M40 58 Q58 50 74 66 Q60 64 46 74 Z" fill="${shade(c1, 0.15)}"/><circle cx="38" cy="42" r="15" fill="url(#${id}rv)"/><path d="M24 42 L10 46 L24 48 Z" fill="#9aa3b8"/><circle cx="35" cy="39" r="3" fill="${c3}" filter="url(#${id}rg)"/><path d="M40 30 L42 26 L44 30" fill="none" stroke="${c3}" stroke-width="1.4" filter="url(#${id}rg)"/><path d="M46 84 v8 M56 84 v8" stroke="#9aa3b8" stroke-width="2" stroke-linecap="round"/>`;
    if (sp === "wolf") return `${shadow}<path d="M68 82 C88 84 96 66 88 54 C86 66 78 72 66 74 Z" fill="${c1}"/><ellipse cx="48" cy="74" rx="21" ry="16" fill="${c1}"/><path d="M30 70 Q48 92 66 70 Q58 80 48 80 Q38 80 30 70 Z" fill="${c2}"/><path d="M24 44 Q48 80 72 44 Q64 26 48 28 Q32 26 24 44 Z" fill="${c1}"/><path d="M26 40 L26 12 L42 28 Z M70 40 L70 12 L54 28 Z" fill="${c1}"/><path d="M30 34 L30 20 L38 29 Z M66 34 L66 20 L58 29 Z" fill="${shade(c1, -0.3)}"/><path d="M34 52 Q48 66 62 52 Q56 60 48 60 Q40 60 34 52 Z" fill="${c2}"/>${eyes(39, 57, 44, 3, c3)}<ellipse cx="48" cy="57" rx="3.4" ry="2.4" fill="#1a1628"/>`;
    if (sp === "elephant") return `${shadow}<ellipse cx="56" cy="72" rx="26" ry="18" fill="${c1}"/><ellipse cx="44" cy="90" rx="6" ry="4" fill="${c1}"/><ellipse cx="66" cy="90" rx="6" ry="4" fill="${c1}"/><circle cx="24" cy="46" r="16" fill="${c2}"/><circle cx="66" cy="46" r="16" fill="${c2}"/><circle cx="45" cy="48" r="20" fill="${c1}"/><path d="M40 60 Q36 80 46 84 Q54 86 52 78 Q46 78 48 62 Z" fill="${c1}"/><path d="M36 62 Q32 66 34 70" fill="none" stroke="${c3}" stroke-width="3" stroke-linecap="round"/>${eyes(37, 53, 46, 2.8)}<circle cx="34" cy="54" r="3" fill="#f7b4c8" opacity=".6"/><circle cx="56" cy="54" r="3" fill="#f7b4c8" opacity=".6"/>`;
    if (sp === "axolotl") return `${shadow}<path d="M66 76 C86 72 92 82 96 70 C90 90 76 88 64 84 Z" fill="${c1}"/><ellipse cx="54" cy="76" rx="20" ry="13" fill="${c1}"/><ellipse cx="44" cy="54" rx="26" ry="20" fill="${c1}"/>${[[-1, 40], [-1, 50], [-1, 60], [1, 40], [1, 50], [1, 60]].map(([sd, y]) => `<path d="M${sd < 0 ? 22 : 66} ${y} q${sd * 10} -6 ${sd * 16} -2" fill="none" stroke="${c2}" stroke-width="4.4" stroke-linecap="round"/>`).join("")}${eyes(34, 54, 52, 2.6)}<path d="M38 60 Q44 65 50 60" fill="none" stroke="#7a2848" stroke-width="1.8" stroke-linecap="round"/><circle cx="30" cy="58" r="3" fill="${c3}" opacity=".8"/><circle cx="58" cy="58" r="3" fill="${c3}" opacity=".8"/>`;
    if (sp === "jelly") return `<defs><radialGradient id="${id}jl" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="${c3}"/><stop offset=".5" stop-color="${c1}" stop-opacity=".85"/><stop offset="1" stop-color="${c2}" stop-opacity=".7"/></radialGradient>${glowFilter(`${id}jg`, 2.6)}</defs><g filter="url(#${id}jg)"><g class="ma-sway">${[30, 40, 50, 60, 70].map((x, i) => `<path d="M${x} 56 q${i % 2 ? 6 : -6} 12 0 22 t0 18" fill="none" stroke="${i % 2 ? c1 : c2}" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`).join("")}</g><path d="M20 58 Q20 22 50 20 Q80 22 80 58 Q72 54 65 58 Q57 54 50 58 Q43 54 35 58 Q28 54 20 58 Z" fill="url(#${id}jl)"/><path d="M30 38 Q40 26 52 26" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/>${eyes(42, 58, 44, 2.4, "#24324a")}</g>`;
    if (sp === "dragon") return `<defs><linearGradient id="${id}dw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c1, 0.2)}"/><stop offset="1" stop-color="${shade(c1, -0.35)}"/></linearGradient></defs>${shadow}<path d="M40 52 Q18 28 6 34 Q16 40 14 50 Q22 46 26 54 Q30 50 40 60 Z M60 52 Q82 28 94 34 Q84 40 86 50 Q78 46 74 54 Q70 50 60 60 Z" fill="url(#${id}dw)" stroke="${shade(c1, -0.4)}" stroke-width="1"/><path d="M64 80 C84 84 92 72 88 62 L94 60 L88 56 L86 62 C88 70 78 76 62 74 Z" fill="${c1}"/><ellipse cx="50" cy="72" rx="20" ry="18" fill="${c1}"/><ellipse cx="50" cy="77" rx="11" ry="11" fill="${c3}"/><path d="M44 74 h12 M44 79 h12 M45 84 h10" stroke="${shade(c3, -0.25)}" stroke-width="1.2"/><circle cx="50" cy="44" r="18" fill="${c1}"/><path d="M38 30 L34 16 L44 27 Z M62 30 L66 16 L56 27 Z" fill="${c2}"/><ellipse cx="50" cy="52" rx="10" ry="6" fill="${shade(c1, 0.15)}"/>${eyes(42, 58, 42, 3, "#1a1628")}<circle cx="46" cy="52" r="1.2" fill="#1a1628"/><circle cx="54" cy="52" r="1.2" fill="#1a1628"/>`;
    if (sp === "phoenix") return `<defs><linearGradient id="${id}ph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset=".55" stop-color="${c1}"/><stop offset="1" stop-color="#c2185b"/></linearGradient>${glowFilter(`${id}pg`, 2.4)}</defs><g filter="url(#${id}pg)"><g class="ma-flicker">${[-30, -15, 0, 15, 30].map((d) => `<path d="M50 70 Q${50 + d * 0.8} 84 ${50 + d} 98 Q${50 + d * 0.3} 86 50 70 Z" fill="url(#${id}ph)" opacity=".9"/>`).join("")}</g><path d="M48 56 Q20 30 4 36 Q18 44 16 54 Q26 50 30 60 Q38 56 46 66 Z M52 56 Q80 30 96 36 Q82 44 84 54 Q74 50 70 60 Q62 56 54 66 Z" fill="url(#${id}ph)"/><ellipse cx="50" cy="62" rx="12" ry="15" fill="url(#${id}ph)"/><circle cx="50" cy="42" r="10" fill="${c1}"/><path d="M46 33 Q42 20 48 14 Q48 24 52 30 Q54 20 60 18 Q56 26 54 34 Z" fill="${c2}"/><path d="M58 42 L66 45 L58 47 Z" fill="${c2}"/><circle cx="53" cy="40" r="2.2" fill="#1a1628"/><circle cx="53.8" cy="39.2" r=".8" fill="#fff"/></g>`;
    // balena celeste
    let s = `<defs><linearGradient id="${id}wh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c1, 0.25)}"/><stop offset="1" stop-color="${shade(c1, -0.3)}"/></linearGradient><clipPath id="${id}wc"><path d="M10 60 Q12 34 46 34 Q76 34 84 52 L96 40 Q96 58 88 64 Q80 82 48 82 Q12 82 10 60 Z"/></clipPath>${glowFilter(`${id}wg`, 2.6)}</defs>`;
    const r = rngOf("whale");
    s += `<g filter="url(#${id}wg)"><path d="M10 60 Q12 34 46 34 Q76 34 84 52 L96 40 Q96 58 88 64 Q80 82 48 82 Q12 82 10 60 Z" fill="url(#${id}wh)"/><g clip-path="url(#${id}wc)">${dots(r, 26, 10, 34, 86, 48, 0.4, 1.3, c3, "ma-twinkle")}<path d="M20 70 Q48 86 80 66" fill="none" stroke="${c2}" stroke-opacity=".6" stroke-width="2"/></g><path d="M28 52 L40 46 L52 56 L66 48" fill="none" stroke="${c3}" stroke-opacity=".7" stroke-width=".9"/>${[[28, 52], [40, 46], [52, 56], [66, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6" fill="${c3}"/>`).join("")}<circle cx="24" cy="60" r="2.6" fill="#0b1440"/><circle cx="25" cy="59" r=".9" fill="#fff"/><path d="M38 30 Q36 18 30 12 M38 30 Q40 18 46 12 M38 30 V14" fill="none" stroke="${c2}" stroke-width="1.8" stroke-linecap="round" class="ma-twinkle"/></g>`;
    return s;
  }

  /* ------------------------------------------------------------ reliquie: incisioni (100 x 100) */
  const RELIC_INK = { C: "#d6dce6", R: "#a9c9ff", E: "#d9b8ff", L: "#ffd27a", M: "#ffb3c6" };
  function relic(it, id) {
    const c = RELIC_INK[it.r] || "#ffffff";
    const L = (d, w = 2) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const r = rngOf(it.id);
    let s = "";
    switch (it.art.icon) {
      case "tablet": s = `${L("M14 26 H46 V78 H14 Z M54 26 H86 V78 H54 Z")}${L("M46 36 Q50 32 54 36 M46 66 Q50 62 54 66", 1.6)}${[36, 44, 52, 60, 68].map((y) => L(`M20 ${y} q${4 + r() * 6} -2 ${18 + r() * 6} 0 M60 ${y} q${4 + r() * 6} -2 ${18 + r() * 6} 0`, 1.2)).join("")}${L("M64 86 L92 14", 2.4)}${L("M88 20 L92 14", 3.2)}`; break;
      case "quipu": s = `${L("M10 22 Q50 14 90 22", 3)}${[18, 30, 42, 54, 66, 78].map((x, i) => `${L(`M${x} 21 Q${x + (i % 2 ? 3 : -3)} 56 ${x} ${80 + (i % 3) * 5}`, 1.8)}${[34, 46, 58, 70].filter(() => r() < 0.7).map((y) => `<circle cx="${x + (i % 2 ? 1.4 : -1.4) * ((y - 21) / 30)}" cy="${y}" r="2.6" fill="${c}"/>`).join("")}`).join("")}`; break;
      case "quill": s = `${L("M24 84 C30 50 54 22 84 12 C74 34 58 56 30 78 Z")}${L("M30 78 L84 12", 1.2)}${L("M40 66 l-6 -2 M48 56 l-7 -2 M56 46 l-7 -2 M64 36 l-7 -2", 1.2)}${L("M60 70 H88 V88 H60 Z")}${L("M64 70 V64 H84 V70", 1.6)}<text x="74" y="84" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="${c}">IV</text>`; break;
      case "scroll": s = `${L("M20 22 H80 M20 78 H80")}${L("M20 22 V78 M80 22 V78", 1.4)}<ellipse cx="20" cy="50" rx="6" ry="30" fill="none" stroke="${c}" stroke-width="2.2"/><ellipse cx="80" cy="50" rx="6" ry="30" fill="none" stroke="${c}" stroke-width="2.2"/>${L("M36 40 L50 32 L64 40 Z M39 42 V56 M46 42 V56 M54 42 V56 M61 42 V56 M35 58 H65", 1.6)}${L("M34 66 H66 M38 71 H62", 1.2)}`; break;
      case "wheel": s = `<circle cx="50" cy="50" r="40" fill="none" stroke="${c}" stroke-width="2"/><circle cx="50" cy="50" r="28" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="50" cy="50" r="6" fill="${c}"/>${"BCDEFGHIK".split("").map((ch, i) => { const an = -Math.PI / 2 + (i / 9) * Math.PI * 2; return `<text x="${f(50 + Math.cos(an) * 34)}" y="${f(53.5 + Math.sin(an) * 34)}" text-anchor="middle" font-family="Georgia, serif" font-size="9.5" fill="${c}">${ch}</text>${L(`M${f(50 + Math.cos(an + 0.35) * 28)} ${f(50 + Math.sin(an + 0.35) * 28)} L${f(50 + Math.cos(an + 0.35) * 40)} ${f(50 + Math.sin(an + 0.35) * 40)}`, 1)}`; }).join("")}`; break;
      case "zodiac": s = `<circle cx="50" cy="50" r="40" fill="none" stroke="${c}" stroke-width="2"/><circle cx="50" cy="50" r="24" fill="none" stroke="${c}" stroke-width="1.4"/>${Array.from({ length: 12 }, (_, i) => { const an = (i / 12) * Math.PI * 2; return `${L(`M${f(50 + Math.cos(an) * 24)} ${f(50 + Math.sin(an) * 24)} L${f(50 + Math.cos(an) * 40)} ${f(50 + Math.sin(an) * 40)}`, 1.2)}${[0.33, 0.66].map((k) => `<circle cx="${f(50 + Math.cos(an + (k * Math.PI) / 6) * 32)}" cy="${f(50 + Math.sin(an + (k * Math.PI) / 6) * 32)}" r="1.4" fill="${c}"/>`).join("")}`; }).join("")}<path d="${starPath(50, 50, 10, 4)}" fill="${c}"/>`; break;
      case "phoenix": s = `${L("M22 82 Q50 74 78 82 M50 74 V86")}${L("M50 70 Q30 48 12 50 Q26 56 26 64 Q36 60 42 70 M50 70 Q70 48 88 50 Q74 56 74 64 Q64 60 58 70")}${L("M50 70 Q44 54 50 40 Q56 54 50 70 Z")}<circle cx="50" cy="34" r="6" fill="none" stroke="${c}" stroke-width="2"/>${L("M47 28 Q44 18 50 12 Q50 20 53 26", 1.6)}${L("M40 88 Q50 78 60 88", 1.4)}`; break;
      case "pagoda": s = `${L("M50 10 V18")}${[[18, 30, 32], [34, 48, 26], [52, 68, 20]].map(([y0, y1, w]) => `${L(`M${50 - w - 8} ${y0 + 10} Q50 ${y0 - 2} ${50 + w + 8} ${y0 + 10}`, 2.2)}${L(`M${50 - w} ${y0 + 10} V${y1} M${50 + w} ${y0 + 10} V${y1}`, 1.6)}`).join("")}${L("M14 86 H86 M24 80 H76")}${L("M44 80 V70 Q50 64 56 70 V80", 1.6)}`; break;
      case "spring": s = `${L("M22 82 C14 60 18 34 24 14 C30 34 34 60 26 82 Z", 1.8)}${L("M40 70 Q60 58 80 70")}<ellipse cx="62" cy="80" rx="24" ry="6" fill="none" stroke="${c}" stroke-width="2"/>${L("M60 56 Q62 40 72 34 M60 56 Q58 44 50 40", 1.6)}<path d="${starPath(74, 22, 7, 3)}" fill="${c}"/>${dots(r, 6, 44, 60, 36, 16, 0.8, 1.4, c)}`; break;
      case "rings": s = `<circle cx="50" cy="50" r="40" fill="none" stroke="${c}" stroke-width="1.8"/><circle cx="50" cy="50" r="29" fill="none" stroke="${c}" stroke-width="1.6"/><circle cx="50" cy="50" r="18" fill="none" stroke="${c}" stroke-width="1.4"/><circle cx="50" cy="50" r="6" fill="${c}"/>${Array.from({ length: 24 }, (_, i) => { const ring = i % 3; const rad = [34.5, 23.5, 12][ring]; const an = (Math.floor(i / 3) / 8) * Math.PI * 2 + ring * 0.4; const x = 50 + Math.cos(an) * rad; const y = 50 + Math.sin(an) * rad; return ring === 0 ? `<circle cx="${f(x)}" cy="${f(y)}" r="2" fill="${c}"/>` : ring === 1 ? `<path d="M${f(x)} ${f(y - 2.4)} L${f(x + 2.2)} ${f(y + 1.6)} L${f(x - 2.2)} ${f(y + 1.6)} Z" fill="${c}"/>` : `<rect x="${f(x - 1.6)}" y="${f(y - 1.6)}" width="3.2" height="3.2" fill="${c}"/>`; }).join("")}`; break;
      case "theatre": s = `${Array.from({ length: 7 }, (_, i) => { const rx = 12 + i * 6; const ry = 8 + i * 5; return `${L(`M${50 - rx} 82 A${rx} ${ry} 0 0 1 ${50 + rx} 82`, 1.5)}${Array.from({ length: 3 }, (_, k) => { const an = Math.PI + ((k + 1) / 4) * Math.PI; return `<rect x="${f(50 + Math.cos(an) * rx - 1.2)}" y="${f(82 + Math.sin(an) * ry - 3)}" width="2.4" height="3" fill="${c}"/>`; }).join("")}`; }).join("")}${L("M8 82 H92")}${L("M50 82 V90 M40 90 H60", 1.6)}`; break;
      case "hall": s = `${L("M14 34 L50 14 L86 34 Z")}${L("M20 38 V80 M34 38 V80 M66 38 V80 M80 38 V80")}${L("M12 84 H88")}${L("M50 14 L46 22 L52 28 L47 34", 1.6)}${[26, 40, 54, 68].map((x) => `<circle cx="${x + 1}" cy="66" r="2.4" fill="${c}"/>`).join("")}${L("M24 72 H76", 1.2)}`; break;
      default: s = `<path d="${starPath(50, 50, 30, 12)}" fill="${c}"/>`;
    }
    return `<defs>${glowFilter(`${id}rl`, it.r === "L" || it.r === "M" ? 1.8 : 0.8)}</defs><g filter="url(#${id}rl)">${s}</g>`;
  }

  /* ------------------------------------------------------------ il personaggio */
  function avatar(ch, level, opt = {}) {
    const id = opt.id || uid();
    const eq = { ...(ch ? ch.equip : GA.STARTER), ...(opt.preview || {}) };
    const cloak = GA.itemById(eq.cloak) || GA.itemById("cloak0");
    const au = eq.aura ? GA.itemById(eq.aura) : null;
    const em = eq.emblem ? GA.itemById(eq.emblem) : null;
    const pt = eq.pet ? GA.itemById(eq.pet) : null;
    const bg = GA.itemById(eq.bg) || GA.itemById("bg0");
    const form = opt.form || GA.formOf(level || 1).n;
    const eye = au ? au.art.color : form >= 5 ? "#9ff3ff" : "#f4b740";
    const vb = opt.bust ? "24 18 152 152" : "0 0 200 240";
    let s = `<svg class="ma-avatar ${opt.cls || ""}" viewBox="${vb}" role="img" aria-label="${esc(opt.label || "Il tuo personaggio")}"><defs>${glowFilter(`${id}gl`)}${blurFilter(`${id}bl`)}</defs>`;
    s += opt.plain ? `<rect width="200" height="240" fill="${opt.plain}"/>` : scene(bg.art.scene, id);
    if (au) s += aura(au.art, id);
    if (form >= 6) s += `<defs><linearGradient id="${id}wi" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="${eye}" stop-opacity=".8"/><stop offset="1" stop-color="${eye}" stop-opacity="0"/></linearGradient></defs><g class="ma-wing" filter="url(#${id}gl)"><path d="M66 118 C40 92 22 70 6 64 C14 80 12 92 18 100 C10 104 10 116 18 122 C12 128 14 138 24 142 C20 150 26 160 38 160 C46 150 56 136 66 118 Z" fill="url(#${id}wi)"/><path transform="translate(200 0) scale(-1 1)" d="M66 118 C40 92 22 70 6 64 C14 80 12 92 18 100 C10 104 10 116 18 122 C12 128 14 138 24 142 C20 150 26 160 38 160 C46 150 56 136 66 118 Z" fill="url(#${id}wi)"/></g>`;
    s += figure(cloak, id, form, eye);
    if (em) s += emblem(em.art, `${id}e`, 100, 142, 12.5);
    if (form >= 5) s += `<ellipse class="ma-runes" cx="100" cy="231" rx="78" ry="8" fill="none" stroke="${eye}" stroke-width="1.6" stroke-dasharray="3 6" filter="url(#${id}gl)"/>`;
    if (form >= 7) s += `<ellipse cx="100" cy="24" rx="24" ry="5.5" fill="none" stroke="#ffd27a" stroke-width="2.6" filter="url(#${id}gl)"/>`;
    if (pt) s += `<g transform="translate(128 150) scale(.56)"><g class="ma-bob">${pet(pt.art, `${id}p`)}</g></g>`;
    return `${s}</svg>`;
  }

  // anteprima di un oggetto (100 x 100)
  function item(it, opt = {}) {
    const id = opt.id || uid();
    const label = esc(opt.label || it.name);
    if (it.cat === "cloak") return avatar(null, 1, { preview: { cloak: it.id, bg: "bg0" }, plain: "#191530", bust: true, id, label, form: 1 });
    if (it.cat === "aura") {
      const c0 = GA.itemById("cloak0");
      return `<svg class="ma-item" viewBox="0 22 200 200" role="img" aria-label="${label}"><defs>${glowFilter(`${id}gl`)}${blurFilter(`${id}bl`)}</defs><rect width="200" height="240" fill="#100d1f"/>${aura(it.art, id)}<g transform="translate(45 59) scale(.55)">${figure(c0, id, 1, it.art.color)}</g></svg>`;
    }
    if (it.cat === "bg") return `<svg class="ma-item" viewBox="0 20 200 200" role="img" aria-label="${label}">${scene(it.art.scene, id)}</svg>`;
    if (it.cat === "emblem") return `<svg class="ma-item" viewBox="0 0 100 100" role="img" aria-label="${label}"><defs><radialGradient id="${id}bk" cx=".5" cy=".5" r=".6"><stop offset="0" stop-color="#2a2350"/><stop offset="1" stop-color="#100d1f"/></radialGradient></defs><rect width="100" height="100" fill="url(#${id}bk)"/>${emblem(it.art, id, 50, 50, 30)}</svg>`;
    if (it.cat === "pet") return `<svg class="ma-item" viewBox="0 0 100 100" role="img" aria-label="${label}"><defs><radialGradient id="${id}bk" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="${it.art.c[0]}" stop-opacity=".35"/><stop offset="1" stop-color="#100d1f" stop-opacity="0"/></radialGradient></defs><rect width="100" height="100" fill="#100d1f"/><rect width="100" height="100" fill="url(#${id}bk)"/><g class="ma-bob">${pet(it.art, id)}</g></svg>`;
    return `<svg class="ma-item" viewBox="0 0 100 100" role="img" aria-label="${label}"><defs><radialGradient id="${id}bk" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#2a2244"/><stop offset="1" stop-color="#0c0a16"/></radialGradient></defs><rect width="100" height="100" fill="url(#${id}bk)"/>${relic(it, id)}</svg>`;
  }
  // icone: cristallo e scrigni
  function crystal(size = 18) {
    const id = uid();
    return `<svg class="ma-gem" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e3f8ff"/><stop offset=".5" stop-color="#7fd3ff"/><stop offset="1" stop-color="#8f6bff"/></linearGradient></defs><path d="M12 2 L20 9 L12 22 L4 9 Z" fill="url(#${id})"/><path d="M4 9 H20 M12 2 L9 9 L12 22 L15 9 Z" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width=".8"/></svg>`;
  }
  function chest(kind, size = 64) {
    const id = uid();
    const P = { piano: ["#8a5a32", "#5a3a20", "#9aa3b5"], oro: ["#f2c14e", "#b8860b", "#fff3c4"], guardiano: ["#4b2a8c", "#25144d", "#f2c14e"] }[kind] || ["#8a5a32", "#5a3a20", "#9aa3b5"];
    return `<svg class="ma-chest" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[1]}"/></linearGradient>${glowFilter(`${id}g`, 2)}</defs>${kind !== "piano" ? `<circle cx="32" cy="34" r="26" fill="${P[2]}" opacity=".18" filter="url(#${id}g)"/>` : ""}<path d="M8 28 Q8 14 32 14 Q56 14 56 28 Z" fill="url(#${id})" stroke="${P[2]}" stroke-width="1.6"/><rect x="8" y="28" width="48" height="24" rx="3" fill="url(#${id})" stroke="${P[2]}" stroke-width="1.6"/><path d="M8 34 H56 M20 14.6 V52 M44 14.6 V52" stroke="${P[2]}" stroke-width="2.2"/><rect x="28" y="30" width="8" height="10" rx="2" fill="${P[2]}"/><circle cx="32" cy="34" r="1.6" fill="${P[1]}"/>${kind === "guardiano" ? `<path d="M24 12 L26 4 L30 9 L32 2 L34 9 L38 4 L40 12 Z" fill="${P[2]}"/>` : ""}</svg>`;
  }

  return { avatar, item, scene, aura, pet, emblem, relic, crystal, chest, shade };
});
