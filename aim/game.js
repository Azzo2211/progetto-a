/*
 * Progetto A - Mira: il gioco in prima persona (canvas 2D con proiezione 3D).
 *
 * - Il mouse si blocca nella finestra (Pointer Lock) con l'input grezzo quando il browser lo
 *   permette (unadjustedMovement: niente accelerazione del sistema). Ogni unita' di movimento
 *   ruota la visuale di sens x 0,07 gradi (x il fattore di calibrazione), come in Valorant.
 * - Campo visivo orizzontale 103 gradi, mirino in stile Valorant.
 * - Logica degli scenari in aim/engine.js; qui disegno, input, HUD, suoni.
 *
 * AimGame.create(mount, opzioni) -> { destroy, state }
 * AimGame.measure(mount, { sens, calib, onDone, onCancel }) -> misura di un giro di 360 gradi
 */
(function () {
  "use strict";

  const A = window.AimEngine;
  if (!A) return;

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------ suoni */
  let audio = null;
  function ac() {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
    } catch (e) { audio = null; }
    return audio;
  }
  function blip(freq, ms, gain = 0.06, type = "sine", delay = 0) {
    const a = ac();
    if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + ms / 1000 + 0.02);
  }
  function shotSound() {
    const a = ac();
    if (!a) return;
    const t = a.currentTime;
    const len = Math.floor(a.sampleRate * 0.05);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i += 1) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2400;
    const g = a.createGain();
    g.gain.value = 0.08;
    src.connect(f).connect(g).connect(a.destination);
    src.start(t);
  }

  /* ------------------------------------------------------------ geometria per il disegno */
  const NEAR = 0.06;

  // Ritaglia un poligono (coordinate camera) sul piano vicino.
  function clipNear(poly) {
    const out = [];
    for (let i = 0; i < poly.length; i += 1) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const ina = a[2] > NEAR;
      const inb = b[2] > NEAR;
      if (ina) out.push(a);
      if (ina !== inb) {
        const t = (NEAR - a[2]) / (b[2] - a[2]);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
      }
    }
    return out;
  }

  function boxFaces(min, max) {
    const [x0, y0, z0] = min;
    const [x1, y1, z1] = max;
    return [
      { n: [0, 0, -1], p: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] },
      { n: [0, 0, 1], p: [[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]] },
      { n: [-1, 0, 0], p: [[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]] },
      { n: [1, 0, 0], p: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]] },
      { n: [0, 1, 0], p: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] },
      { n: [0, -1, 0], p: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]] }
    ];
  }

  // Linee della griglia della stanza (in coordinate mondo).
  function roomLines() {
    const R = A.ROOM;
    const lines = [];
    const step = 2;
    for (let x = R.x[0]; x <= R.x[1]; x += step) lines.push([[x, R.y[0], R.z[0]], [x, R.y[0], R.z[1]]], [[x, R.y[0], R.z[1]], [x, R.y[1], R.z[1]]], [[x, R.y[0], R.z[0]], [x, R.y[1], R.z[0]]]);
    for (let z = R.z[0]; z <= R.z[1]; z += step) lines.push([[R.x[0], R.y[0], z], [R.x[1], R.y[0], z]], [[R.x[0], R.y[0], z], [R.x[0], R.y[1], z]], [[R.x[1], R.y[0], z], [R.x[1], R.y[1], z]]);
    for (let y = R.y[0] + step; y < R.y[1]; y += step) {
      lines.push([[R.x[0], y, R.z[1]], [R.x[1], y, R.z[1]]], [[R.x[0], y, R.z[0]], [R.x[1], y, R.z[0]]], [[R.x[0], y, R.z[0]], [R.x[0], y, R.z[1]]], [[R.x[1], y, R.z[0]], [R.x[1], y, R.z[1]]]);
    }
    return lines;
  }
  const LINES = roomLines();

  function roomPlanes() {
    const R = A.ROOM;
    return [
      { kind: "floor", p: [[R.x[0], R.y[0], R.z[0]], [R.x[1], R.y[0], R.z[0]], [R.x[1], R.y[0], R.z[1]], [R.x[0], R.y[0], R.z[1]]] },
      { kind: "wall", p: [[R.x[0], R.y[0], R.z[1]], [R.x[1], R.y[0], R.z[1]], [R.x[1], R.y[1], R.z[1]], [R.x[0], R.y[1], R.z[1]]] },
      { kind: "wall", p: [[R.x[1], R.y[0], R.z[0]], [R.x[0], R.y[0], R.z[0]], [R.x[0], R.y[1], R.z[0]], [R.x[1], R.y[1], R.z[0]]] },
      { kind: "side", p: [[R.x[0], R.y[0], R.z[0]], [R.x[0], R.y[0], R.z[1]], [R.x[0], R.y[1], R.z[1]], [R.x[0], R.y[1], R.z[0]]] },
      { kind: "side", p: [[R.x[1], R.y[0], R.z[1]], [R.x[1], R.y[0], R.z[0]], [R.x[1], R.y[1], R.z[0]], [R.x[1], R.y[1], R.z[1]]] },
      { kind: "ceil", p: [[R.x[0], R.y[1], R.z[0]], [R.x[0], R.y[1], R.z[1]], [R.x[1], R.y[1], R.z[1]], [R.x[1], R.y[1], R.z[0]]] }
    ];
  }
  const PLANES = roomPlanes();
  const PLANE_FILL = { floor: "#27303d", wall: "#1d2430", side: "#1a212c", ceil: "#161c25" };

  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const f = (c) => Math.max(0, Math.min(255, Math.round(c * k)));
    return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
  }

  /* ------------------------------------------------------------ il gioco */
  function create(mount, opts) {
    const o = Object.assign({ sens: 0.35, calib: null, crosshair: A.defaultSettings().crosshair, targetColor: "#33e0ff", sound: true, seed: Date.now() }, opts || {});
    const def = A.scenario(o.scenarioId);
    mount.innerHTML = `
      <div class="aim-stage" tabindex="-1">
        <canvas class="aim-canvas" aria-label="Campo di allenamento ${def.name}"></canvas>
        <div class="aim-hud" aria-hidden="true"><span data-hud="time"></span><span data-hud="score"></span><span data-hud="acc"></span></div>
        <div class="aim-overlay" role="dialog" aria-live="polite"></div>
        <div class="aim-stage-tools">
          <button type="button" class="aim-tool" data-g="fullscreen">Schermo intero</button>
          <button type="button" class="aim-tool" data-g="quit">Esci</button>
        </div>
      </div>`;
    const stage = mount.querySelector(".aim-stage");
    const canvas = mount.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const overlay = mount.querySelector(".aim-overlay");
    const hud = { time: mount.querySelector('[data-hud="time"]'), score: mount.querySelector('[data-hud="score"]'), acc: mount.querySelector('[data-hud="acc"]') };

    const g = {
      state: "ready", sc: null, yaw: 0, pitch: 0, holding: false, locked: false, raw: null,
      countdown: 0, last: performance.now(), raf: 0, w: 0, h: 0, dpr: 1, hudAt: 0, destroyed: false, error: "",
      dpu: A.degPerUnit(o.sens, o.calib), fpsN: 0, fpsT: 0, fps: 0
    };
    g.sc = A.createScenario(def.id, { seed: o.seed, aim: { yaw: 0, pitch: 0 } });

    function resize() {
      const r = canvas.getBoundingClientRect();
      g.dpr = Math.min(2, window.devicePixelRatio || 1);
      g.w = Math.max(1, Math.round(r.width * g.dpr));
      g.h = Math.max(1, Math.round(r.height * g.dpr));
      if (canvas.width !== g.w || canvas.height !== g.h) { canvas.width = g.w; canvas.height = g.h; }
    }
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(canvas); else window.addEventListener("resize", resize);
    resize();

    /* ---------- overlay */
    function showOverlay(html) {
      overlay.innerHTML = html;
      overlay.hidden = !html;
    }
    function readyOverlay() {
      const goal = def.duration ? `${def.duration} secondi` : `${def.reps} ripetizioni`;
      showOverlay(`
        <div class="aim-ov-card">
          ${o.kicker ? `<span class="aim-ov-kicker">${o.kicker}</span>` : ""}
          <h3>${o.title || def.name}</h3>
          <p>${o.subtitle || def.text}</p>
          <p class="aim-ov-meta">${goal} · sens ${String(o.sens).replace(".", ",")} · campo visivo 103°</p>
          ${g.error ? `<p class="aim-ov-error">${g.error}</p>` : ""}
          <div class="aim-ov-actions">
            <button type="button" class="aim-ov-go" data-g="start-full">Schermo intero e inizia</button>
            <button type="button" class="aim-ov-go alt" data-g="start">Inizia qui</button>
          </div>
          <p class="aim-ov-small">Meglio a schermo intero: i bersagli hanno la stessa grandezza che in Valorant. Il mouse resta bloccato; Esc per la pausa.</p>
        </div>`);
    }
    function pausedOverlay() {
      showOverlay(`
        <div class="aim-ov-card">
          <h3>In pausa</h3>
          <p>${def.name}: ${def.duration ? `${Math.max(0, Math.ceil(def.duration - g.sc.time))} secondi rimasti` : `${def.reps - (g.sc.rep || 0)} ripetizioni rimaste`}.</p>
          ${g.error ? `<p class="aim-ov-error">${g.error}</p>` : ""}
          <button type="button" class="aim-ov-go" data-g="start">Clicca per riprendere</button>
          <button type="button" class="aim-ov-ghost" data-g="quit">Esci senza salvare</button>
        </div>`);
    }

    /* ---------- pointer lock */
    function lockFailed() {
      g.error = "Il browser non ha bloccato il mouse. Aspetta un secondo e clicca di nuovo (subito dopo Esc il browser non lo permette; se compare una richiesta di permesso, accettala).";
      if (g.state === "paused") pausedOverlay(); else readyOverlay();
    }

    // Chiede il mouse bloccato con l'input grezzo; senza supporto, quello normale.
    async function lock() {
      ac();
      g.error = "";
      if (!canvas.requestPointerLock) { g.error = "Questo browser non permette di bloccare il mouse: usa Chrome o Edge su un computer."; readyOverlay(); return; }
      let p;
      try {
        p = canvas.requestPointerLock({ unadjustedMovement: true });
      } catch (e) {
        p = null;
      }
      if (!p || typeof p.then !== "function") { g.raw = false; return; }
      try {
        await p;
        g.raw = true;
      } catch (e) {
        if (e && e.name === "NotSupportedError") {
          try {
            const p2 = canvas.requestPointerLock();
            if (p2 && typeof p2.then === "function") await p2;
            g.raw = false;
          } catch (e2) { lockFailed(); }
        } else lockFailed();
      }
    }

    function onLockChange() {
      const was = g.locked;
      g.locked = document.pointerLockElement === canvas;
      if (g.locked && !was) {
        g.skipMove = true; // il primo movimento dopo il blocco puo' essere un salto
        g.lastMoveAt = performance.now();
        if (g.state === "ready") { g.state = "countdown"; g.countdown = 3; showOverlay(""); if (o.sound) blip(660, 90, 0.05); }
        else if (g.state === "paused") { g.state = "countdown"; g.countdown = 1.5; showOverlay(""); }
      } else if (!g.locked && was) {
        g.holding = false;
        if (g.state === "running" || g.state === "countdown") { g.state = "paused"; pausedOverlay(); }
      }
    }

    function onMove(e) {
      if (!g.locked) return;
      const dx = e.movementX || 0;
      const dy = e.movementY || 0;
      const now = performance.now();
      const since = now - (g.lastMoveAt || now);
      g.lastMoveAt = now;
      if (g.skipMove) { g.skipMove = false; if (!g.raw && (Math.abs(dx) > 200 || Math.abs(dy) > 200)) return; }
      // senza input grezzo alcuni browser mandano salti assurdi: si scartano solo quelli
      // impossibili per una mano (oltre 40 unita' al millisecondo); i flick veloci restano
      if (!g.raw) {
        const limit = Math.max(2000, 40 * since);
        if (Math.abs(dx) > limit || Math.abs(dy) > limit) return;
      }
      look(dx, dy);
    }

    function look(dx, dy) {
      g.yaw += dx * g.dpu;
      g.pitch = Math.max(-89, Math.min(89, g.pitch - dy * g.dpu));
      if (g.yaw > 180) g.yaw -= 360;
      if (g.yaw < -180) g.yaw += 360;
    }

    function fire() {
      if (g.state !== "running") return;
      if (def.id === "tracking") { g.holding = true; return; }
      if (o.sound) shotSound();
      const r = g.sc.shoot({ yaw: g.yaw, pitch: g.pitch });
      if (r.hit && o.sound) { if (r.head) { blip(1320, 70, 0.06, "triangle"); blip(1760, 90, 0.05, "triangle", 0.05); } else blip(1180, 60, 0.05); }
      g.flash = { t: performance.now(), hit: r.hit, head: r.head };
      if (g.sc.done) finish();
    }

    function onDown(e) {
      if (e.button !== 0) return;
      if (!g.locked) return;
      e.preventDefault();
      // tracking: il tasto tenuto premuto dal conto alla rovescia vale gia'
      if (def.id === "tracking") { g.holding = true; return; }
      fire();
    }
    function onUp(e) { if (e.button === 0) g.holding = false; }

    function onClick(e) {
      const btn = e.target.closest("[data-g]");
      if (btn) {
        const act = btn.dataset.g;
        if (act === "start") lock();
        else if (act === "start-full") {
          // prima il mouse bloccato, poi lo schermo intero, nello stesso clic
          lock();
          if (!document.fullscreenElement && stage.requestFullscreen) stage.requestFullscreen().then(() => setTimeout(resize, 60)).catch(() => {});
        }
        else if (act === "quit") quit();
        else if (act === "fullscreen") fullscreen();
        return;
      }
      if (e.target === canvas && !g.locked && (g.state === "ready" || g.state === "paused")) lock();
    }

    function fullscreen() {
      const el = stage;
      if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return; }
      if (el.requestFullscreen) el.requestFullscreen().then(() => setTimeout(resize, 60)).catch(() => {});
    }

    function quit() {
      const cb = o.onQuit;
      destroy();
      if (cb) cb();
    }

    function finish() {
      if (g.state === "done") return;
      g.state = "done";
      g.holding = false;
      if (o.sound) { blip(523, 120, 0.05, "triangle"); blip(784, 200, 0.05, "triangle", 0.1); }
      const stats = g.sc.stats();
      stats.raw = g.raw;
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      setTimeout(() => { if (o.onEnd) o.onEnd(stats); }, 30);
    }

    /* ---------- disegno */
    function drawPoly(b, pts, fill, stroke) {
      const cam = clipNear(pts.map((p) => A.toCamera(p, b)));
      if (cam.length < 3) return;
      const fl = A.focal(g.w);
      ctx.beginPath();
      cam.forEach((c, i) => {
        const x = g.w / 2 + (c[0] / c[2]) * fl;
        const y = g.h / 2 - (c[1] / c[2]) * fl;
        if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
      });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = g.dpr; ctx.stroke(); }
    }

    function drawLine(b, p, q) {
      let a = A.toCamera(p, b);
      let c = A.toCamera(q, b);
      if (a[2] <= NEAR && c[2] <= NEAR) return;
      if (a[2] <= NEAR || c[2] <= NEAR) {
        const t = (NEAR - a[2]) / (c[2] - a[2]);
        const m = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t, NEAR];
        if (a[2] <= NEAR) a = m; else c = m;
      }
      const fl = A.focal(g.w);
      ctx.moveTo(g.w / 2 + (a[0] / a[2]) * fl, g.h / 2 - (a[1] / a[2]) * fl);
      ctx.lineTo(g.w / 2 + (c[0] / c[2]) * fl, g.h / 2 - (c[1] / c[2]) * fl);
    }

    function drawBox(b, box, base) {
      const center = [(box.min[0] + box.max[0]) / 2, (box.min[1] + box.max[1]) / 2, (box.min[2] + box.max[2]) / 2];
      boxFaces(box.min, box.max).forEach((face) => {
        const v = A.toCamera(face.p[0], b);
        // facce rivolte verso di te (la camera e' nell'origine)
        const p0 = face.p[0];
        if (face.n[0] * p0[0] + face.n[1] * p0[1] + face.n[2] * p0[2] >= 0) return;
        const k = face.n[1] > 0 ? 1.25 : face.n[1] < 0 ? 0.6 : face.n[0] !== 0 ? 0.82 : 1;
        drawPoly(b, face.p, shade(base, k), "rgba(0,0,0,0.25)");
        return v && center;
      });
    }

    function drawSphere(b, c, r, color, alpha = 1) {
      const p = A.project(c, b, g.w, g.h);
      if (!p) return;
      const rad = Math.max(1.5, r * p.scale);
      const grad = ctx.createRadialGradient(p.x - rad * 0.35, p.y - rad * 0.4, rad * 0.1, p.x, p.y, rad);
      grad.addColorStop(0, shade(color, 1.45));
      grad.addColorStop(0.55, color);
      grad.addColorStop(1, shade(color, 0.55));
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Sagoma: gambe, busto, collo e testa (il colpo valido e' la testa; il corpo conta solo nel peek).
    function drawFigure(b, x, z, headR, colorBody, colorHead, crouch = false) {
      const floor = A.ROOM.y[0];
      const top = crouch ? -0.55 : -0.18;
      const hip = floor + (top - floor) * 0.48;
      drawBox(b, { min: [x - 0.2, floor, z - 0.13], max: [x + 0.2, hip, z + 0.13] }, "#7a2a35");
      drawBox(b, { min: [x - 0.26, hip, z - 0.16], max: [x + 0.26, top - 0.04, z + 0.16] }, colorBody);
      drawBox(b, { min: [x - 0.06, top - 0.05, z - 0.06], max: [x + 0.06, top + 0.04, z + 0.06] }, "#8f3440");
      drawSphere(b, [x, top + 0.16, z], headR, colorHead);
    }

    function drawBot(b, bot) {
      drawFigure(b, bot.x, bot.z, A.botParts(bot.x, bot.z, bot.crouch).head.r, "#c2414f", "#ff8a8f", bot.crouch);
    }

    function drawCrosshair() {
      const ch = o.crosshair;
      const s = g.dpr;
      const cx = Math.round(g.w / 2);
      const cy = Math.round(g.h / 2);
      const t = ch.thick * s;
      const gap = ch.gap * s;
      const l = ch.len * s;
      const rects = [];
      if (l > 0) rects.push([cx + gap, cy - t / 2, l, t], [cx - gap - l, cy - t / 2, l, t], [cx - t / 2, cy + gap, t, l], [cx - t / 2, cy - gap - l, t, l]);
      if (ch.dot) rects.push([cx - t / 2, cy - t / 2, t, t]);
      if (ch.outline) { ctx.fillStyle = "rgba(0,0,0,0.85)"; rects.forEach(([x, y, w, h]) => ctx.fillRect(x - s, y - s, w + 2 * s, h + 2 * s)); }
      ctx.fillStyle = ch.color;
      rects.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h));
    }

    function draw() {
      const b = A.basis(g.yaw, g.pitch);
      ctx.fillStyle = "#12171f";
      ctx.fillRect(0, 0, g.w, g.h);
      PLANES.forEach((pl) => drawPoly(b, pl.p, PLANE_FILL[pl.kind]));
      ctx.beginPath();
      LINES.forEach(([p, q]) => drawLine(b, p, q));
      ctx.strokeStyle = "rgba(170, 190, 215, 0.09)";
      ctx.lineWidth = g.dpr;
      ctx.stroke();
      const sc = g.sc;
      // oggetti dal piu' lontano al piu' vicino
      const items = [];
      sc.covers.forEach((c) => items.push({ d: Math.hypot((c.min[0] + c.max[0]) / 2, (c.min[2] + c.max[2]) / 2), draw: () => drawBox(b, c, "#4a5668") }));
      sc.bots.forEach((bot) => items.push({ d: Math.hypot(bot.x, bot.z) + 0.01, draw: () => drawBot(b, bot) }));
      sc.targets.forEach((t) => items.push({ d: Math.hypot(t.c[0], t.c[1], t.c[2]), draw: () => {
        if (t.kind === "head") drawFigure(b, t.c[0], t.c[2], t.r, "#c2414f", "#ff8a8f");
        else drawSphere(b, t.c, t.r, o.targetColor);
      } }));
      items.sort((p, q) => q.d - p.d).forEach((it) => it.draw());
      // colpi a segno: un anello che si allarga
      sc.effects.forEach((e) => {
        const p = A.project(e.c, b, g.w, g.h);
        if (!p) return;
        const k = (sc.time - e.t) / 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (0.15 + k * 0.5) * p.scale, 0, Math.PI * 2);
        ctx.strokeStyle = e.kind === "head" ? `rgba(255, 214, 90, ${1 - k})` : e.kind === "body" ? `rgba(255, 160, 160, ${1 - k})` : `rgba(255, 255, 255, ${1 - k})`;
        ctx.lineWidth = 2 * g.dpr;
        ctx.stroke();
      });
      drawCrosshair();
      if (g.state === "countdown") {
        ctx.fillStyle = "rgba(10, 14, 20, 0.35)";
        ctx.fillRect(0, 0, g.w, g.h);
        ctx.fillStyle = "#ffffff";
        ctx.font = `800 ${Math.round(g.h * 0.16)}px Archivo, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(Math.ceil(g.countdown)), g.w / 2, g.h / 2 - g.h * 0.16);
      }
    }

    function updateHud(force) {
      const now = performance.now();
      if (!force && now - g.hudAt < 100) return;
      g.hudAt = now;
      const sc = g.sc;
      const st = sc.stats();
      hud.time.textContent = def.duration ? `${Math.max(0, Math.ceil(def.duration - sc.time))} s` : `${Math.min(def.reps, (sc.rep || 0) + 1)}/${def.reps}`;
      hud.score.textContent = def.id === "tracking" ? `${st.track || 0}% addosso` : `${st.score} punti`;
      hud.acc.textContent = def.id === "tracking" ? "tieni premuto" : st.shots ? `${String(st.acc).replace(".", ",")}% precisione` : "";
    }

    /* ---------- ciclo */
    function frame(now) {
      if (g.destroyed) return;
      const dt = Math.min(0.05, (now - g.last) / 1000);
      g.last = now;
      if (g.state === "countdown") {
        const before = Math.ceil(g.countdown);
        g.countdown -= dt;
        if (Math.ceil(g.countdown) !== before && g.countdown > 0 && o.sound) blip(660, 80, 0.04);
        if (g.countdown <= 0) { g.state = "running"; if (o.sound) blip(990, 120, 0.05); }
      } else if (g.state === "running") {
        g.sc.update(dt, { yaw: g.yaw, pitch: g.pitch, holding: g.holding });
        if (g.sc.done) finish();
      }
      draw();
      updateHud(false);
      g.raf = requestAnimationFrame(frame);
    }

    function destroy() {
      if (g.destroyed) return;
      g.destroyed = true;
      cancelAnimationFrame(g.raf);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      if (document.fullscreenElement === stage) document.exitFullscreen().catch(() => {});
      if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
      mount.innerHTML = "";
    }

    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    canvas.addEventListener("mousedown", onDown);
    stage.addEventListener("click", onClick);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    readyOverlay();
    updateHud(true);
    g.raf = requestAnimationFrame(frame);

    const controller = {
      destroy,
      get state() { return g.state; },
      get stats() { return g.sc.stats(); }
    };
    // Comandi per le prove automatiche (senza mouse bloccato).
    if (window.__AIM_TEST__) {
      controller.test = {
        start() { g.state = "running"; showOverlay(""); },
        look,
        aim(yaw, pitch) { g.yaw = yaw; g.pitch = pitch; },
        fire,
        hold(v) { g.holding = !!v; },
        get sc() { return g.sc; },
        get view() { return { yaw: g.yaw, pitch: g.pitch, dpu: g.dpu }; }
      };
    }
    return controller;
  }

  /* ------------------------------------------------------------ misura del 360 */
  // Si conta il movimento tra due clic: lo stesso movimento fisico che in Valorant fa un giro.
  function measure(mount, opts) {
    const o = Object.assign({ sens: 0.35, calib: null, sound: true }, opts || {});
    const beep = (f, ms, gn) => { if (o.sound) blip(f, ms, gn); };
    mount.innerHTML = `
      <div class="aim-stage aim-measure" tabindex="-1">
        <canvas class="aim-canvas" aria-label="Misura del giro di 360 gradi"></canvas>
        <div class="aim-overlay" role="dialog" aria-live="polite"></div>
      </div>`;
    const canvas = mount.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const overlay = mount.querySelector(".aim-overlay");
    const m = { phase: "ready", units: 0, locked: false, raf: 0, destroyed: false, raw: null };
    const dpu = A.degPerUnit(o.sens, o.calib);

    function card(html) { overlay.innerHTML = html; overlay.hidden = !html; }
    function ready(msg = "") {
      card(`<div class="aim-ov-card"><h3>Misura il giro</h3>
        <p>Metti il mouse sul primo segno del tappetino. Clicca qui per bloccare il mouse, poi clicca ancora per partire e muovi il mouse fino al secondo segno, in orizzontale. Al segno, clicca per fermare.</p>
        ${msg ? `<p class="aim-ov-error">${msg}</p>` : ""}
        <button type="button" class="aim-ov-go" data-m="lock">Blocca il mouse</button>
        <button type="button" class="aim-ov-ghost" data-m="cancel">Annulla</button></div>`);
    }
    async function lock() {
      let p;
      try { p = canvas.requestPointerLock({ unadjustedMovement: true }); } catch (e) { p = null; }
      if (!p || typeof p.then !== "function") { m.raw = false; return; }
      try {
        await p;
        m.raw = true;
      } catch (e) {
        if (e && e.name === "NotSupportedError") {
          try { const p2 = canvas.requestPointerLock(); if (p2 && p2.then) await p2; m.raw = false; } catch (e2) { ready("Il browser non ha bloccato il mouse: aspetta un secondo e riprova."); }
        } else ready("Il browser non ha bloccato il mouse: aspetta un secondo e riprova.");
      }
    }
    function onLock() {
      m.locked = document.pointerLockElement === canvas;
      if (m.locked && m.phase === "ready") { m.phase = "armed"; card(""); }
      if (!m.locked && (m.phase === "armed" || m.phase === "moving")) { m.phase = "ready"; m.units = 0; ready("Mouse sbloccato: ricomincia dal primo segno."); }
    }
    function onMove(e) {
      if (!m.locked || m.phase !== "moving") return;
      const now = performance.now();
      const since = now - (m.lastAt || now);
      m.lastAt = now;
      if (!m.raw && Math.abs(e.movementX) > Math.max(2000, 40 * since)) return;
      m.units += e.movementX || 0;
    }
    function onDown(e) {
      if (!m.locked || e.button !== 0) return;
      if (m.phase === "armed") { m.phase = "moving"; m.units = 0; m.lastAt = performance.now(); beep(660, 80, 0.05); }
      else if (m.phase === "moving") {
        m.phase = "done";
        beep(990, 120, 0.05);
        document.exitPointerLock();
        const units = Math.abs(m.units);
        const raw = m.raw;
        const cb = o.onDone;
        destroy();
        if (cb) cb(units, raw);
      }
    }
    function onClick(e) {
      const b = e.target.closest("[data-m]");
      if (b && b.dataset.m === "lock") lock();
      else if (b && b.dataset.m === "cancel") { const cb = o.onCancel; destroy(); if (cb) cb(); }
    }
    function frame() {
      if (m.destroyed) return;
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.round(r.width * dpr)) { canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); }
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#12171f";
      ctx.fillRect(0, 0, w, h);
      const deg = Math.abs(m.units) * dpu;
      // bussola: quanto hai girato con la sens attuale
      const cx = w / 2;
      const cy = h / 2;
      const rad = Math.min(w, h) * 0.3;
      ctx.lineWidth = 10 * dpr;
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "#33e0ff";
      ctx.beginPath(); ctx.arc(cx, cy, rad, -Math.PI / 2, -Math.PI / 2 + (Math.min(deg, 720) / 360) * Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `800 ${Math.round(rad * 0.42)}px Archivo, sans-serif`;
      ctx.fillText(m.phase === "moving" ? `${Math.round(deg)}°` : m.phase === "armed" ? "Clicca e muovi" : "", cx, cy);
      ctx.font = `600 ${Math.round(rad * 0.13)}px Archivo, sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      if (m.phase === "moving") ctx.fillText(`${Math.round(Math.abs(m.units))} unità · clicca al secondo segno`, cx, cy + rad * 0.42);
      m.raf = requestAnimationFrame(frame);
    }
    function destroy() {
      if (m.destroyed) return;
      m.destroyed = true;
      cancelAnimationFrame(m.raf);
      document.removeEventListener("pointerlockchange", onLock);
      document.removeEventListener("mousemove", onMove);
      if (document.pointerLockElement === canvas) document.exitPointerLock();
      mount.innerHTML = "";
    }
    document.addEventListener("pointerlockchange", onLock);
    document.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    mount.addEventListener("click", onClick);
    ready();
    m.raf = requestAnimationFrame(frame);
    const ctl = { destroy };
    if (window.__AIM_TEST__) ctl.test = { arm() { m.locked = true; m.phase = "armed"; card(""); }, move(dx) { m.units += dx; }, down() { onDown({ button: 0 }); }, start() { onDown({ button: 0 }); } };
    return ctl;
  }

  window.AimGame = { create, measure, reduced };
})();
