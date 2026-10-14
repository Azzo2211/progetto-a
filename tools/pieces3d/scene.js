import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { Brush, Evaluator, SUBTRACTION } from "three-bvh-csg";

const params = new URLSearchParams(location.search);
const SIZE = Number(params.get("size") || 1024);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(SIZE, SIZE);
renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

/* ------------------------------------------------------------ camera */
const camera = new THREE.PerspectiveCamera(18, 1, 0.1, 50);
function frameCamera(cfg) {
  const el = THREE.MathUtils.degToRad(cfg.elevation);
  const target = new THREE.Vector3(0, cfg.targetY, 0);
  camera.position.set(0, target.y + Math.sin(el) * cfg.distance, Math.cos(el) * cfg.distance);
  camera.lookAt(target);
  camera.updateProjectionMatrix();
}

/* ------------------------------------------------------------ lights */
const key = new THREE.DirectionalLight(0xfff3e4, 2.6);
key.position.set(-2.2, 3.4, 2.8);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -0.8, right: 0.8, top: 1.2, bottom: -0.2, near: 0.5, far: 10 });
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.012;
const rim = new THREE.DirectionalLight(0xa9c6ff, 3.4);
rim.position.set(2.6, 1.9, -2.4);
const rimRed = new THREE.DirectionalLight(0xff5a72, 1.4);
rimRed.position.set(-2.8, 1.2, -2.2);
const fill = new THREE.HemisphereLight(0xe2e9ff, 0x1c1522, 0.55);
scene.add(key, key.target, rim, rimRed, fill);

/* ---------------------------------------------------------- materials */
function materials(color) {
  const white = color === "w";
  return {
    body: new THREE.MeshPhysicalMaterial({
      color: white ? 0xeceef2 : 0x141a29,
      roughness: white ? 0.4 : 0.24,
      clearcoat: white ? 0.6 : 1,
      clearcoatRoughness: white ? 0.18 : 0.07,
      sheen: white ? 0.25 : 0,
      sheenColor: new THREE.Color(0xdfe6ff)
    }),
    band: new THREE.MeshPhysicalMaterial({
      color: white ? 0x8c0f27 : 0x95132e,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.08
    }),
    trim: new THREE.MeshPhysicalMaterial({
      color: white ? 0xe6e9ef : 0xd9b35f,
      metalness: 1,
      roughness: white ? 0.22 : 0.26
    })
  };
}

/* ------------------------------------------------------------ helpers */
const V2 = (x, y) => new THREE.Vector2(x, y);

// Arrotonda gli spigoli di una polilinea: ogni punto [x, y, raggio].
function rounded(points, steps = 5) {
  const out = [];
  points.forEach((p, i) => {
    const rad = p[2] || 0;
    if (!rad || i === 0 || i === points.length - 1) {
      out.push([p[0], p[1]]);
      return;
    }
    const prev = points[i - 1];
    const next = points[i + 1];
    const u1 = V2(prev[0] - p[0], prev[1] - p[1]);
    const u2 = V2(next[0] - p[0], next[1] - p[1]);
    const d = Math.min(rad, u1.length() / 2, u2.length() / 2);
    u1.normalize();
    u2.normalize();
    const a = V2(p[0] + u1.x * d, p[1] + u1.y * d);
    const b = V2(p[0] + u2.x * d, p[1] + u2.y * d);
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps;
      const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * p[0] + t * t * b.x;
      const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * p[1] + t * t * b.y;
      out.push([x, y]);
    }
  });
  return out;
}

function quad(p0, c, p2, n = 14) {
  const out = [];
  for (let s = 1; s <= n; s += 1) {
    const t = s / n;
    out.push([
      (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0],
      (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1]
    ]);
  }
  return out;
}

function arc(cx, cy, r, a0, a1, n = 18) {
  const out = [];
  for (let s = 0; s <= n; s += 1) {
    const a = THREE.MathUtils.degToRad(a0 + ((a1 - a0) * s) / n);
    out.push([Math.max(0, cx + r * Math.cos(a)), cy + r * Math.sin(a)]);
  }
  return out;
}

function lathe(points, segments = 160) {
  const geo = new THREE.LatheGeometry(points.map(([x, y]) => V2(Math.max(0, x), y)), segments);
  return geo;
}

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function torus(radius, tube, y, mat) {
  const m = mesh(new THREE.TorusGeometry(radius, tube, 16, 160), mat);
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  return m;
}

// Base comune: disco, modanatura e gambo concavo fino al collare.
function basePoints(R, stemTopR, stemTopY) {
  const pts = rounded([
    [0, 0],
    [R, 0, 0.008],
    [R, 0.032, 0.012],
    [R * 0.935, 0.047, 0.006],
    [R * 0.855, 0.052, 0],
    [R * 0.855, 0.07, 0.008],
    [R * 0.75, 0.08, 0]
  ]);
  const start = [R * 0.71, 0.088];
  pts.push(start);
  pts.push(...quad(start, [stemTopR * 1.08, 0.13], [stemTopR, stemTopY], 18));
  return pts;
}

// Collare cremisi con filetti: restituisce i punti e le altezze dei filetti.
function collar(r0, y0, R, h) {
  const pts = rounded([
    [r0, y0],
    [R - 0.012, y0 + 0.005, 0.004],
    [R, y0 + 0.013, 0.004],
    [R, y0 + 0.013 + h, 0.004],
    [R - 0.012, y0 + 0.021 + h, 0.004],
    [r0 * 1.02, y0 + 0.025 + h]
  ]);
  return { pts, top: y0 + 0.025 + h, rings: [y0 + 0.011, y0 + 0.015 + h], R };
}

function addCollarRings(group, c, mats) {
  c.rings.forEach((y) => group.add(torus(c.R + 0.0015, 0.0042, y, mats.trim)));
}


// Gonfia una sagoma 2D in un volume arrotondato (come una scultura a bassorilievo
// su entrambi i lati): spessore massimo halfDepth, bordi a quarto di cerchio.
function resample(points, step) {
  const out = [];
  const n = points.length;
  for (let i = 0; i < n; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % n];
    const len = a.distanceTo(b);
    const k = Math.max(1, Math.round(len / step));
    for (let j = 0; j < k; j += 1) out.push(new THREE.Vector2(a.x + ((b.x - a.x) * j) / k, a.y + ((b.y - a.y) * j) / k));
  }
  return out.filter((p, i) => i === 0 || p.distanceTo(out[i - 1]) > 1e-6);
}

function segDist(px, py, a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(px - (a.x + dx * t), py - (a.y + dy * t));
}

function inside(px, py, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const a = poly[i];
    const b = poly[j];
    if ((a.y > py) !== (b.y > py) && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

function inflate(shape, opts) {
  const { halfDepth, radius = 0.05, spacing = 0.0048, widthAt = () => 1, bulge = 0.15, boundaryStep = 0.0026 } = opts;
  let pts = shape.getPoints(48);
  if (pts.length > 1 && pts[0].distanceTo(pts[pts.length - 1]) < 1e-9) pts.pop();
  const boundary = resample(pts, boundaryStep);
  const distTo = (x, y) => {
    let d = Infinity;
    for (let i = 0; i < boundary.length; i += 1) d = Math.min(d, segDist(x, y, boundary[i], boundary[(i + 1) % boundary.length]));
    return d;
  };
  const minX = Math.min(...boundary.map((p) => p.x));
  const maxX = Math.max(...boundary.map((p) => p.x));
  const minY = Math.min(...boundary.map((p) => p.y));
  const maxY = Math.max(...boundary.map((p) => p.y));
  const contour = boundary.map((p) => new poly2tri.Point(p.x, p.y));
  const ctx = new poly2tri.SweepContext(contour);
  const steiner = [];
  for (let y = minY + spacing / 2; y < maxY; y += spacing * 0.866) {
    const row = Math.round((y - minY) / (spacing * 0.866));
    for (let x = minX + (row % 2 ? spacing / 2 : 0); x < maxX; x += spacing) {
      if (inside(x, y, boundary) && distTo(x, y) > spacing * 0.42) steiner.push(new poly2tri.Point(x, y));
    }
  }
  ctx.addPoints(steiner);
  ctx.triangulate();
  const all = [...contour, ...steiner];
  const dist = all.map((p, i) => (i < contour.length ? 0 : distTo(p.x, p.y)));
  const dmax = Math.max(...dist);
  const heightOf = (x, y, d) => {
    const t = Math.min(1, d / radius);
    const round = Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)));
    const s = d / dmax;
    return halfDepth * widthAt(x, y) * round * (1 + bulge * s * s * (3 - 2 * s));
  };
  const positions = [];
  const front = new Map();
  const back = new Map();
  all.forEach((p, i) => {
    const h = heightOf(p.x, p.y, dist[i]);
    front.set(p, positions.length / 3);
    positions.push(p.x, p.y, h);
    if (i < contour.length) back.set(p, front.get(p));
    else {
      back.set(p, positions.length / 3);
      positions.push(p.x, p.y, -h);
    }
  });
  const index = [];
  ctx.getTriangles().forEach((tri) => {
    const [a, b, c] = tri.getPoints();
    const ccw = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
    const [p, q, r] = ccw ? [a, b, c] : [a, c, b];
    index.push(front.get(p), front.get(q), front.get(r));
    index.push(back.get(p), back.get(r), back.get(q));
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  geo.userData.heightAt = (x, y) => (inside(x, y, boundary) ? heightOf(x, y, distTo(x, y)) : 0);
  return geo;
}

/* -------------------------------------------------------------- pezzi */
function pawn(mats) {
  const g = new THREE.Group();
  const R = 0.25;
  const base = basePoints(R, 0.098, 0.3);
  const c = collar(0.098, 0.3, 0.158, 0.016);
  const head = [[0.1, c.top], [0.082, c.top + 0.008], ...arc(0, 0.452, 0.11, -48, 90, 30)];
  g.add(mesh(lathe(base), mats.body), mesh(lathe(c.pts), mats.band), mesh(lathe(head), mats.body));
  addCollarRings(g, c, mats);
  return g;
}

function csgSubtract(geo, mat, cutters, cutMat) {
  const evaluator = new Evaluator();
  evaluator.attributes = ["position", "normal"];
  evaluator.useGroups = true;
  const clean = (geometry) => {
    const g2 = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    g2.deleteAttribute("uv");
    const merged = mergeVertices(g2, 1e-5);
    merged.computeVertexNormals();
    return merged;
  };
  let result = new Brush(clean(geo), mat);
  result.updateMatrixWorld();
  cutters.forEach((cutter) => {
    const b = new Brush(clean(cutter.geometry), cutMat || mat);
    b.position.copy(cutter.position);
    b.rotation.copy(cutter.rotation);
    b.updateMatrixWorld();
    result = evaluator.evaluate(result, b, SUBTRACTION);
  });
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

function rook(mats) {
  const g = new THREE.Group();
  const R = 0.28;
  const base = rounded([
    [0, 0],
    [R, 0, 0.008],
    [R, 0.032, 0.012],
    [R * 0.935, 0.047, 0.006],
    [R * 0.855, 0.052, 0],
    [R * 0.855, 0.07, 0.008],
    [R * 0.75, 0.08, 0]
  ]);
  base.push([0.2, 0.088], ...quad([0.2, 0.088], [0.162, 0.25], [0.168, 0.4], 18));
  const c = collar(0.168, 0.4, 0.212, 0.014);
  const top = rounded([
    [0.172, c.top],
    [0.182, c.top + 0.02, 0.01],
    [0.226, c.top + 0.062, 0.012],
    [0.232, c.top + 0.08, 0.006],
    [0.232, 0.64, 0.008],
    [0.176, 0.64, 0.006],
    [0.176, 0.6, 0.01],
    [0, 0.6]
  ]);
  g.add(mesh(lathe(base), mats.body), mesh(lathe(c.pts), mats.band));
  const cutters = [0, 60, 120].map((deg) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.09, 0.062));
    m.position.y = 0.64;
    m.rotation.y = THREE.MathUtils.degToRad(deg + 30);
    return m;
  });
  g.add(csgSubtract(lathe(top, 192), mats.body, cutters, mats.body));
  addCollarRings(g, c, mats);
  return g;
}

function bishop(mats) {
  const g = new THREE.Group();
  const R = 0.27;
  const base = basePoints(R, 0.086, 0.42);
  const c = collar(0.086, 0.42, 0.15, 0.016);
  const mitre = [
    [0.088, c.top],
    [0.074, c.top + 0.008],
    ...quad([0.074, c.top + 0.008], [0.134, c.top + 0.03], [0.13, c.top + 0.105], 12),
    ...quad([0.13, c.top + 0.105], [0.12, c.top + 0.21], [0.016, c.top + 0.27], 16),
    ...arc(0, c.top + 0.298, 0.03, -58, 90, 16)
  ];
  g.add(mesh(lathe(base), mats.body), mesh(lathe(c.pts), mats.band));
  const cut = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.024, 0.32));
  cut.position.set(0.092, c.top + 0.14, 0.05);
  cut.rotation.z = THREE.MathUtils.degToRad(38);
  g.add(csgSubtract(lathe(mitre, 192), mats.body, [cut], mats.band));
  addCollarRings(g, c, mats);
  return g;
}

function queen(mats) {
  const g = new THREE.Group();
  const R = 0.3;
  const base = basePoints(R, 0.086, 0.49);
  const c = collar(0.086, 0.49, 0.156, 0.017);
  const crown = rounded([
    [0.088, c.top],
    [0.078, c.top + 0.01],
    ...quad([0.078, c.top + 0.01], [0.1, c.top + 0.15], [0.198, c.top + 0.215], 16).map((p) => [p[0], p[1]]),
    [0.206, c.top + 0.226, 0.005],
    [0.19, c.top + 0.234, 0.004],
    [0.15, c.top + 0.24],
    [0.1, c.top + 0.258],
    [0.055, c.top + 0.276],
    [0.02, c.top + 0.284]
  ]);
  const fin = arc(0, c.top + 0.31, 0.03, -52, 90, 16);
  g.add(mesh(lathe(base), mats.body), mesh(lathe(c.pts), mats.band), mesh(lathe([...crown, ...fin]), mats.body));
  const ballMat = mats.trim;
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2 + 0.31;
    const ball = mesh(new THREE.SphereGeometry(0.023, 24, 16), ballMat);
    ball.position.set(Math.cos(a) * 0.196, c.top + 0.247, Math.sin(a) * 0.196);
    g.add(ball);
  }
  addCollarRings(g, c, mats);
  g.add(torus(0.024, 0.0045, c.top + 0.286, mats.trim));
  return g;
}

function king(mats) {
  const g = new THREE.Group();
  const R = 0.31;
  const base = basePoints(R, 0.09, 0.5);
  const c = collar(0.09, 0.5, 0.162, 0.018);
  const crown = rounded([
    [0.092, c.top],
    [0.082, c.top + 0.01],
    ...quad([0.082, c.top + 0.01], [0.1, c.top + 0.13], [0.184, c.top + 0.19], 16),
    [0.19, c.top + 0.2, 0.005],
    [0.176, c.top + 0.208, 0.004],
    [0.14, c.top + 0.216],
    [0.095, c.top + 0.232],
    [0.055, c.top + 0.244],
    [0.034, c.top + 0.25, 0.004],
    [0.034, c.top + 0.262, 0.003],
    [0.05, c.top + 0.268, 0.003],
    [0.05, c.top + 0.28, 0.003],
    [0, c.top + 0.282]
  ]);
  g.add(mesh(lathe(base), mats.body), mesh(lathe(c.pts), mats.band), mesh(lathe(crown), mats.body));
  const crossBase = c.top + 0.278;
  const vertical = mesh(new RoundedBoxGeometry(0.048, 0.14, 0.048, 4, 0.01), mats.body);
  vertical.position.y = crossBase + 0.07;
  const horizontal = mesh(new RoundedBoxGeometry(0.12, 0.044, 0.048, 4, 0.01), mats.body);
  horizontal.position.y = crossBase + 0.088;
  const gem = mesh(new THREE.OctahedronGeometry(0.017, 0), mats.band);
  gem.position.set(0, crossBase + 0.088, 0.026);
  gem.scale.set(1, 1.15, 0.6);
  g.add(vertical, horizontal, gem);
  addCollarRings(g, c, mats);
  g.add(torus(0.184, 0.004, c.top + 0.2, mats.trim));
  return g;
}

function knight(mats) {
  const g = new THREE.Group();
  const R = 0.28;
  const base = rounded([
    [0, 0],
    [R, 0, 0.008],
    [R, 0.032, 0.012],
    [R * 0.935, 0.047, 0.006],
    [R * 0.855, 0.052, 0],
    [R * 0.855, 0.07, 0.008],
    [R * 0.75, 0.08, 0],
    [0.2, 0.094, 0.01],
    [0.19, 0.118]
  ]);
  const c = collar(0.19, 0.118, 0.214, 0.014);
  const cap = rounded([[c.pts[c.pts.length - 1][0], c.top], [0.19, c.top + 0.012, 0.008], [0.165, c.top + 0.016], [0, c.top + 0.016]]);
  g.add(mesh(lathe(base), mats.body), mesh(lathe(c.pts), mats.band), mesh(lathe(cap), mats.body));
  addCollarRings(g, c, mats);

  const y0 = c.top - 0.004;
  const s = new THREE.Shape();
  s.moveTo(0.158, y0 - 0.04);
  s.lineTo(0.172, y0 + 0.1);
  s.quadraticCurveTo(0.186, y0 + 0.27, 0.098, y0 + 0.43);
  s.lineTo(0.05, y0 + 0.5);
  s.quadraticCurveTo(0.05, y0 + 0.592, 0.038, y0 + 0.584);
  s.lineTo(0.006, y0 + 0.52);
  s.quadraticCurveTo(-0.03, y0 + 0.578, -0.04, y0 + 0.566);
  s.lineTo(-0.058, y0 + 0.5);
  s.lineTo(-0.2, y0 + 0.392);
  s.quadraticCurveTo(-0.248, y0 + 0.356, -0.236, y0 + 0.31);
  s.lineTo(-0.214, y0 + 0.286);
  s.lineTo(-0.168, y0 + 0.29);
  s.lineTo(-0.12, y0 + 0.3);
  s.quadraticCurveTo(-0.06, y0 + 0.305, -0.052, y0 + 0.248);
  s.quadraticCurveTo(-0.108, y0 + 0.15, -0.15, y0 - 0.04);
  s.lineTo(0.158, y0 - 0.04);
  const smooth = (a, b, v) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  // muso e orecchie piu' sottili, guance e collo piu' pieni
  const widthAt = (x, y) => {
    const yy = y - y0;
    let f = 1;
    f *= 1 - 0.3 * smooth(-0.1, -0.245, x);
    f *= 1 + 0.12 * smooth(0.2, 0.0, yy);
    f *= 1 + 0.1 * Math.exp(-(((x + 0.05) / 0.07) ** 2) - (((yy - 0.31) / 0.06) ** 2));
    return f;
  };
  const headGeo = inflate(s, { halfDepth: 0.088, radius: 0.055, widthAt, bulge: 0.12 });
  const head = new THREE.Group();
  head.add(mesh(headGeo, mats.body));

  // Criniera cremisi a ciocche lungo il collo.
  const mane = new THREE.Shape();
  const maneLine = [
    [0.185, 0.03], [0.234, 0.138], [0.2, 0.148], [0.238, 0.25], [0.196, 0.26], [0.216, 0.35], [0.17, 0.354], [0.172, 0.44], [0.128, 0.43], [0.112, 0.51], [0.07, 0.49], [0.046, 0.47]
  ];
  mane.moveTo(0.13, y0 + 0.02);
  maneLine.forEach(([x, y]) => mane.lineTo(x, y0 + y));
  mane.quadraticCurveTo(0.142, y0 + 0.3, 0.13, y0 + 0.02);
  head.add(mesh(inflate(mane, { halfDepth: 0.036, radius: 0.024, bulge: 0.05, spacing: 0.004 }), mats.band));

  const faceZ = (x, y) => headGeo.userData.heightAt(x, y);
  [1, -1].forEach((side) => {
    const ex = -0.082;
    const ey = y0 + 0.452;
    const eye = mesh(new THREE.SphereGeometry(0.016, 20, 14), mats.trim);
    eye.position.set(ex, ey, side * (faceZ(ex, ey) - 0.004));
    eye.scale.set(1.3, 0.8, 0.45);
    eye.rotation.z = -0.5;
    head.add(eye);
  });
  head.scale.setScalar(1.05);
  head.position.y = -0.008;
  head.rotation.y = THREE.MathUtils.degToRad(Number(params.get("knightYaw") || -20));
  g.add(head);
  return g;
}

const BUILDERS = { P: pawn, N: knight, B: bishop, R: rook, Q: queen, K: king };

let current = null;
window.renderPiece = function (type, color, cfg = {}) {
  const config = { elevation: 14, fov: 16, S: 0.9, ratio: 1.25, baseFromBottom: 0.17, ...cfg };
  if (current) scene.remove(current);
  current = BUILDERS[type](materials(color));
  if (config.yaw) current.rotation.y = THREE.MathUtils.degToRad(config.yaw);
  scene.add(current);
  const W = SIZE;
  const H = Math.round(SIZE * config.ratio);
  renderer.setSize(W, H);
  camera.fov = config.fov;
  camera.aspect = W / H;
  const frameH = config.S * config.ratio;
  const distance = frameH / (2 * Math.tan(THREE.MathUtils.degToRad(config.fov / 2)));
  // ndc desiderato per il centro della base
  const desired = -1 + (2 * config.baseFromBottom * config.S) / frameH;
  let targetY = 0.45;
  const origin = new THREE.Vector3();
  for (let i = 0; i < 40; i += 1) {
    frameCamera({ elevation: config.elevation, distance, targetY });
    camera.updateMatrixWorld();
    const ndc = origin.set(0, 0, 0).project(camera).y;
    targetY += (ndc - desired) * (frameH / 2);
  }
  frameCamera({ elevation: config.elevation, distance, targetY });
  const white = color === "w";
  renderer.toneMappingExposure = white ? (config.whiteExposure || 0.86) : (config.blackExposure || 1.0);
  scene.environmentIntensity = white ? 0.3 : 0.55;
  key.intensity = white ? 3.3 : 2.6;
  fill.intensity = white ? 0.22 : 0.55;
  rim.intensity = white ? 1.6 : 3.4;
  rimRed.intensity = white ? 0.9 : 1.4;
  renderer.render(scene, camera);
  return renderer.domElement.toDataURL("image/png");
};
window.sceneReady = true;
