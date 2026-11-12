// A stylised 3D bust of Vinay, modelled in code: long face, warm brown skin, thick brows, almond eyes,
// a full short beard joined to the mustache, a wide toothy grin, a big crown of black curls with a fringe
// falling to the left, and the orange mandarin-collar shirt with white buttons.

import * as THREE from 'three';

export const DEFORM = {
  uGrab: { value: new THREE.Vector3(0, 0, -99) },
  uPull: { value: new THREE.Vector3() },
  uGrabR: { value: 0.55 },
  uHeadInv: { value: new THREE.Matrix4() },
  uHeadRot: { value: new THREE.Matrix3() },
  uJaw: { value: 0 },
  uPuff: { value: 0 },
};

const DEFORM_GLSL = /* glsl */ `
uniform vec3 uGrab; uniform vec3 uPull; uniform float uGrabR;
uniform mat4 uHeadInv; uniform mat3 uHeadRot; uniform float uJaw; uniform float uPuff; uniform float uPart;
vec3 deform(vec3 wp){
  vec3 off = vec3(0.);
  if (uPart > 0.5) {
    vec3 lp = (uHeadInv * vec4(wp, 1.)).xyz;
    float front = smoothstep(-0.25, 0.25, lp.z);
    float below = smoothstep(-0.44, -0.66, lp.y) * front;
    vec3 lo = vec3(0., -uJaw * 0.1 * below, uJaw * 0.02 * below);
    vec3 cl = lp - vec3(-0.4, -0.4, 0.45), cr = lp - vec3(0.4, -0.4, 0.45);
    float wl = exp(-dot(cl, cl) / 0.06), wr = exp(-dot(cr, cr) / 0.06);
    lo += (vec3(-1., 0.1, 0.55) * wl + vec3(1., 0.1, 0.55) * wr) * uPuff * 0.1;
    off += uHeadRot * lo;
  }
  vec3 dg = wp - uGrab;
  float g = exp(-dot(dg, dg) / (uGrabR * uGrabR));
  off += uPull * g;
  return off;
}`;

const PROJECT_GLSL = /* glsl */ `
vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  mvPosition = instanceMatrix * mvPosition;
#endif
vec4 dWorld = modelMatrix * mvPosition;
dWorld.xyz += deform(dWorld.xyz);
mvPosition = viewMatrix * dWorld;
gl_Position = projectionMatrix * mvPosition;`;

/** Every material shares the same soft-body field, so the whole figure stretches as one piece of dough. */
function deformable<T extends THREE.Material>(m: T, part: number): T {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, DEFORM, { uPart: { value: part } });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + DEFORM_GLSL)
      .replace('#include <project_vertex>', PROJECT_GLSL);
  };
  m.customProgramCacheKey = () => 'vvn-deform-' + part;
  return m;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const noise3 = (x: number, y: number, z: number) =>
  Math.sin(x * 12.9 + y * 4.1) * Math.sin(y * 9.7 + z * 7.3) * Math.sin(z * 11.3 + x * 5.7);

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Sculpt a unit sphere into his head: a slim, long oval with a tapered jaw, pointed chin, high cheekbones. */
function sculptHead(g: THREE.BufferGeometry) {
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    x *= 0.76; y *= 1.18; z *= 0.9;
    const t = smooth(0.0, -1.18, y);
    x *= 1 - 0.44 * t * t;
    z *= 1 - 0.13 * t;
    if (z > 0) z += 0.055 * t * t;
    y -= 0.05 * t * t;
    if (z > 0) z *= 0.97;
    for (const s of [-1, 1]) {
      const d = (x - s * 0.28) ** 2 / 0.016 + (y - 0.1) ** 2 / 0.009;
      if (z > 0) z -= 0.07 * Math.exp(-d);
      const c = (x - s * 0.4) ** 2 / 0.02 + (y + 0.04) ** 2 / 0.012;
      if (z > 0) z += 0.03 * Math.exp(-c);
      const h = (x - s * 0.4) ** 2 / 0.025 + (y + 0.36) ** 2 / 0.03;
      if (z > 0) z -= 0.025 * Math.exp(-h);
    }
    if (z > 0) z += 0.035 * Math.exp(-((y - 0.27) ** 2) / 0.005) * Math.exp(-(x * x) / 0.28);
    if (z < 0) { z *= 1.07; y += 0.03 * -z; }
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
}

export type Eye = { socket: THREE.Group; ball: THREE.Group; upper: THREE.Group; lower: THREE.Group };
export type Rig = {
  root: THREE.Group;
  head: THREE.Group;
  neck: THREE.Group;
  torso: THREE.Group;
  eyes: [Eye, Eye];
  brows: [THREE.Mesh, THREE.Mesh];
  browBase: [THREE.Vector3, THREE.Vector3];
  setMouth: (open: number, smile: number, smirk: number) => void;
  hair: { mesh: THREE.InstancedMesh; base: { p: THREE.Vector3; q: THREE.Quaternion; s: THREE.Vector3; h: number; ph: number }[] }[];
  hairMat: THREE.MeshPhysicalMaterial;
  /** beard, mustache and brows: recoloured together with the hair */
  faceHair: THREE.MeshStandardMaterial[];
  pick: THREE.Object3D[];
  anchors: Record<'nose' | 'forehead' | 'cheekR' | 'cheekL' | 'top' | 'eyes' | 'mouth', THREE.Vector3>;
  dispose: () => void;
};

export function buildRig(lowDetail: boolean): Rig {
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  const skin = keep(deformable(new THREE.MeshPhysicalMaterial({
    color: 0x95553a, roughness: 0.62, sheen: 0.35, sheenColor: new THREE.Color(0xe8956a), sheenRoughness: 0.6,
    emissive: 0x3a1206, emissiveIntensity: 0.22, envMapIntensity: 0.6,
  }), 1));
  const lidSkin = keep(deformable(skin.clone(), 1));
  const dark = keep(deformable(new THREE.MeshStandardMaterial({ color: 0x15100d, roughness: 0.95 }), 1));
  const browMat = keep(deformable(new THREE.MeshStandardMaterial({ color: 0x1c1411, roughness: 0.95 }), 1));
  const beardMat = keep(deformable(new THREE.MeshStandardMaterial({ color: 0x271a13, roughness: 1, envMapIntensity: 0.3 }), 1));
  const white = keep(deformable(new THREE.MeshPhysicalMaterial({ color: 0xf6f2ec, roughness: 0.25, clearcoat: 0.6 }), 1));
  const iris = keep(deformable(new THREE.MeshPhysicalMaterial({ color: 0x3b2314, roughness: 0.2, clearcoat: 1 }), 1));
  const pupil = keep(deformable(new THREE.MeshStandardMaterial({ color: 0x050403, roughness: 0.2 }), 1));
  const glint = keep(new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const mouthMat = keep(deformable(new THREE.MeshStandardMaterial({ color: 0x3d1012, roughness: 0.8, side: THREE.DoubleSide }), 1));
  const teethMat = keep(deformable(new THREE.MeshPhysicalMaterial({ color: 0xf7f1e6, roughness: 0.3, clearcoat: 0.4, side: THREE.DoubleSide }), 1));
  const shirt = keep(deformable(new THREE.MeshPhysicalMaterial({
    color: 0xf04a00, roughness: 0.88, sheen: 0.5, sheenColor: new THREE.Color(0xff8a40), sheenRoughness: 0.6, envMapIntensity: 0.4, side: THREE.DoubleSide,
  }), 0));
  const shirtDark = keep(deformable(new THREE.MeshPhysicalMaterial({ color: 0xc93c00, roughness: 0.9, sheen: 0.4, sheenColor: new THREE.Color(0xff7a30), envMapIntensity: 0.4, side: THREE.DoubleSide }), 0));
  const neckSkin = keep(deformable(skin.clone(), 0));
  const button = keep(deformable(new THREE.MeshPhysicalMaterial({ color: 0xfaf6f0, roughness: 0.3, clearcoat: 1 }), 0));
  const hairMat = keep(deformable(new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.72, sheen: 0.45, sheenColor: new THREE.Color(0xffffff), sheenRoughness: 0.5, envMapIntensity: 0.35,
  }), 1));

  const root = new THREE.Group();
  const neck = new THREE.Group();
  const head = new THREE.Group();
  const torso = new THREE.Group();
  root.add(torso, neck);
  neck.add(head);
  neck.position.set(0, -0.9, -0.05);
  head.position.set(0, 0.9, 0.05);

  // ---- head ----
  const seg = lowDetail ? 64 : 96;
  const headGeo = keep(new THREE.SphereGeometry(1, seg, Math.round(seg * 0.75)));
  sculptHead(headGeo);
  const headMesh = new THREE.Mesh(headGeo, skin);
  headMesh.userData.zone = 'skin';
  head.add(headMesh);

  const rc = new THREE.Raycaster();
  const down = new THREE.Vector3(0, 0, -1);
  const surf = (mesh: THREE.Mesh, x: number, y: number) => {
    mesh.updateMatrixWorld(true);
    rc.set(new THREE.Vector3(x, y, 6), down);
    const h = rc.intersectObject(mesh, false)[0];
    return h ? mesh.worldToLocal(h.point.clone()).z : 0;
  };
  const headZ = (x: number, y: number) => surf(headMesh, x, y);

  // ears
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(keep(new THREE.SphereGeometry(1, 24, 16)), skin);
    ear.scale.set(0.1, 0.2, 0.08);
    ear.position.set(s * 0.74, -0.04, -0.06);
    ear.rotation.y = s * 0.5;
    ear.userData.zone = 'cheek';
    head.add(ear);
  }

  // nose: bridge + rounded tip + soft nostrils
  const bridge = new THREE.Mesh(keep(new THREE.CapsuleGeometry(0.06, 0.24, 6, 16)), skin);
  bridge.position.set(0, -0.02, headZ(0, -0.02) - 0.02);
  bridge.rotation.x = -0.3;
  const tip = new THREE.Mesh(keep(new THREE.SphereGeometry(1, 24, 18)), skin);
  tip.scale.set(0.088, 0.08, 0.088);
  tip.position.set(0, -0.19, headZ(0, -0.19) + 0.05);
  const nostrilGeo = keep(new THREE.SphereGeometry(1, 16, 12));
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(nostrilGeo, skin);
    w.scale.set(0.065, 0.055, 0.06);
    w.position.set(s * 0.075, -0.21, headZ(s * 0.075, -0.21) + 0.02);
    w.userData.zone = 'nose';
    head.add(w);
  }
  bridge.userData.zone = tip.userData.zone = 'nose';
  head.add(bridge, tip);

  // eyes: sclera, iris, pupil, a fixed glint, and two lids with a lash line
  const eyes: Eye[] = [];
  const R = 0.138;
  const scleraGeo = keep(new THREE.SphereGeometry(R, 32, 24));
  const irisGeo = keep(new THREE.SphereGeometry(R * 1.004, 32, 8, 0, Math.PI * 2, 0, 0.62));
  const pupilGeo = keep(new THREE.SphereGeometry(R * 1.008, 24, 6, 0, Math.PI * 2, 0, 0.27));
  const lidGeo = keep(new THREE.SphereGeometry(R * 1.1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2));
  const lashGeo = keep(new THREE.TorusGeometry(R * 1.1, 0.014, 6, 40, Math.PI));
  const glintGeo = keep(new THREE.SphereGeometry(0.02, 10, 8));
  for (const s of [-1, 1]) {
    const socket = new THREE.Group();
    const ex = s * 0.28, ey = 0.1;
    socket.position.set(ex, ey, headZ(ex, ey) - 0.035);
    socket.rotation.z = s * -0.08;
    const ball = new THREE.Group();
    const sclera = new THREE.Mesh(scleraGeo, white);
    const ir = new THREE.Mesh(irisGeo, iris); ir.rotation.x = Math.PI / 2;
    const pu = new THREE.Mesh(pupilGeo, pupil); pu.rotation.x = Math.PI / 2;
    sclera.userData.zone = s < 0 ? 'eyeL' : 'eyeR';
    ball.add(sclera, ir, pu);
    const gl = new THREE.Mesh(glintGeo, glint);
    gl.position.set(-0.035, 0.045, R * 0.97);
    const upper = new THREE.Group(), lower = new THREE.Group();
    const ul = new THREE.Mesh(lidGeo, lidSkin); ul.userData.zone = s < 0 ? 'eyeL' : 'eyeR';
    const lash = new THREE.Mesh(lashGeo, dark); lash.rotation.x = Math.PI / 2;
    upper.add(ul, lash);
    const ll = new THREE.Mesh(lidGeo, lidSkin); ll.rotation.x = Math.PI; ll.userData.zone = ul.userData.zone;
    lower.add(ll);
    socket.add(ball, gl, upper, lower);
    head.add(socket);
    eyes.push({ socket, ball, upper, lower });
  }

  // brows: thick, slightly arched
  const brows: THREE.Mesh[] = [];
  const browBase: THREE.Vector3[] = [];
  for (const s of [-1, 1]) {
    const pts = [-0.15, -0.05, 0.05, 0.15].map((x, i) => new THREE.Vector3(x, [0, 0.025, 0.02, -0.015][s < 0 ? 3 - i : i], 0));
    const g = keep(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.036, 8, false));
    const b = new THREE.Mesh(g, browMat);
    b.scale.set(1, 0.72, 0.7);
    const bx = s * 0.28, by = 0.3;
    b.position.set(bx, by, headZ(bx, by) + 0.012);
    b.rotation.y = s * 0.28;
    b.userData.zone = 'brow';
    head.add(b);
    brows.push(b);
    browBase.push(b.position.clone());
  }

  // mouth: a dark opening and a row of teeth rebuilt from the expression
  const NU = 26, NV = 5;
  const gridIndex = (() => {
    const ix: number[] = [];
    for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i, b = a + 1, c = a + NU + 1, d = c + 1;
      ix.push(a, c, b, b, c, d);
    }
    return ix;
  })();
  const makeGrid = (mat: THREE.Material) => {
    const g = keep(new THREE.BufferGeometry());
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NU + 1) * (NV + 1) * 3), 3));
    g.setIndex(gridIndex);
    const m = new THREE.Mesh(g, mat);
    m.frustumCulled = false;
    m.userData.zone = 'mouth';
    head.add(m);
    return m;
  };
  const cavity = makeGrid(mouthMat), teeth = makeGrid(teethMat);
  // surface lookup around the mouth, sampled once
  const SX = 24, SY = 12, X0 = -0.42, X1 = 0.42, Y0 = -0.75, Y1 = -0.3;
  const zs = new Float32Array((SX + 1) * (SY + 1));
  for (let j = 0; j <= SY; j++) for (let i = 0; i <= SX; i++) zs[j * (SX + 1) + i] = headZ(X0 + ((X1 - X0) * i) / SX, Y0 + ((Y1 - Y0) * j) / SY);
  const zAt = (x: number, y: number) => {
    const fx = Math.min(SX - 0.001, Math.max(0, ((x - X0) / (X1 - X0)) * SX)), fy = Math.min(SY - 0.001, Math.max(0, ((y - Y0) / (Y1 - Y0)) * SY));
    const i = fx | 0, j = fy | 0, tx = fx - i, ty = fy - j, k = j * (SX + 1) + i;
    return (zs[k] * (1 - tx) + zs[k + 1] * tx) * (1 - ty) + (zs[k + SX + 1] * (1 - tx) + zs[k + SX + 2] * tx) * ty;
  };
  const MY = -0.5;
  const fill = (m: THREE.Mesh, top: (u: number) => number, bot: (u: number) => number, hw: number, lift: number) => {
    const a = (m.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
    let o = 0;
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) {
      const u = (i / NU) * 2 - 1, v = j / NV;
      const x = u * hw, y = bot(u) + (top(u) - bot(u)) * v;
      a[o++] = x; a[o++] = y; a[o++] = zAt(x, y) + lift;
    }
    m.geometry.attributes.position.needsUpdate = true;
    m.geometry.computeVertexNormals();
    m.geometry.computeBoundingSphere();
  };
  const setMouth = (open: number, smile: number, smirk: number) => {
    const hw = 0.18 + 0.045 * smile;
    const h = 0.14 * open;
    const corner = (u: number) => 0.055 * smile * u * u + 0.05 * smirk * Math.max(0, u) ** 2 - 0.02 * Math.max(0, -smile) * u * u;
    const top = (u: number) => MY + 0.035 * open * (1 - u * u) + corner(u) + 0.004;
    const bot = (u: number) => MY - h * Math.pow(Math.max(0, 1 - u * u), 0.7) + corner(u) - 0.004;
    fill(cavity, top, bot, hw, 0.004);
    const tooth = (u: number) => Math.max(bot(u) + 0.002, top(u) - Math.min(0.06, (top(u) - bot(u)) * 0.62));
    fill(teeth, top, tooth, hw * 0.9, 0.008);
  };
  setMouth(0.5, 0.6, 0);

  // trimmed mustache: a neat band along the top lip whose ends turn down to meet the beard
  const mX = [-0.27, -0.25, -0.2, -0.11, 0, 0.11, 0.2, 0.25, 0.27];
  const mY = [-0.56, -0.5, -0.445, -0.418, -0.41, -0.418, -0.445, -0.5, -0.56];
  const mCurve = new THREE.CatmullRomCurve3(mX.map((x, i) => new THREE.Vector3(x, mY[i], headZ(x, mY[i]) + 0.012)));
  const MT = 60, MR = 10;
  const mGeo = keep(new THREE.TubeGeometry(mCurve, MT, 0.036, MR, false));
  const mp = mGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < mp.count; i++) {
    const t = Math.floor(i / (MR + 1)) / MT, c = mCurve.getPointAt(t);
    const thick = 0.75 + 0.25 * Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.05) / 0.9))); // fuller in the middle, neat tapered ends
    // flattened against the skin so it reads as a trimmed band rather than a round tube
    mp.setXYZ(i, c.x + (mp.getX(i) - c.x) * thick, c.y + (mp.getY(i) - c.y) * thick, c.z + (mp.getZ(i) - c.z) * 0.45 * thick);
  }
  mGeo.computeVertexNormals();
  const mustache = new THREE.Mesh(mGeo, beardMat);
  mustache.userData.zone = 'mouth';
  head.add(mustache);

  // beard: a fuzzy shell over the jaw, chin and sideburns, with a gap for the mouth
  const bg = keep(new THREE.SphereGeometry(1, lowDetail ? 120 : 180, lowDetail ? 90 : 135));
  sculptHead(bg);
  const bp = bg.attributes.position as THREE.BufferAttribute, bn = bg.attributes.normal as THREE.BufferAttribute;
  const mask = new Float32Array(bp.count);
  for (let i = 0; i < bp.count; i++) {
    const x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i);
    const upper = -0.5 + 0.4 * smooth(0.33, 0.74, Math.abs(x));
    const mouthHole = Math.sqrt((x / 0.22) ** 2 + ((y + 0.55) / 0.11) ** 2) - 1;
    const m = Math.min((upper - y) / 0.045, mouthHole / 0.25, (z + 0.05) / 0.2, (y + 1.5) / 0.1);
    mask[i] = Math.min(1, Math.max(0, m));
    const fuzz = noise3(x * 9, y * 9, z * 9) * 0.5 + noise3(x * 23, y * 23, z * 23) * 0.5;
    const d = -0.01 + mask[i] * (0.021 + 0.003 * fuzz);
    bp.setXYZ(i, x + bn.getX(i) * d, y + bn.getY(i) * d, z + bn.getZ(i) * d);
  }
  const bIdx = bg.index!.array, keepIdx: number[] = [];
  for (let t = 0; t < bIdx.length; t += 3) {
    if (mask[bIdx[t]] > 0 || mask[bIdx[t + 1]] > 0 || mask[bIdx[t + 2]] > 0) keepIdx.push(bIdx[t], bIdx[t + 1], bIdx[t + 2]);
  }
  bg.setIndex(keepIdx);
  bg.computeVertexNormals();
  const beard = new THREE.Mesh(bg, beardMat);
  beard.userData.zone = 'beard';
  head.add(beard);

  // hair: wavy locks flowing down from the crown over a soft base, the fringe sweeping to his right
  const r = rng(11);
  const inHair = (dx: number, dy: number, dz: number) => {
    const crown = dy > 0.4;
    const side = dy > -0.02 && Math.abs(dx) > 0.55 && dz < 0.4;
    const back = dz < 0.0 && dy > -0.45;
    const hairline = 0.5 - 0.09 * smooth(0.35, -0.45, dx); // dips lower toward the fringe side
    const face = dz > 0.4 && dy < hairline;
    return (crown || side || back) && !face;
  };
  const shellPoint = (dx: number, dy: number, dz: number, k: number) =>
    new THREE.Vector3(dx * 0.78 * k, dy * 1.17 * k + 0.04, dz * 0.92 * k * (dz < 0 ? 1.06 : 1));

  // soft base so no scalp shows between the locks
  const capGeo = keep(new THREE.SphereGeometry(1, lowDetail ? 96 : 160, lowDetail ? 72 : 120));
  const cp = capGeo.attributes.position as THREE.BufferAttribute;
  const capMask = new Float32Array(cp.count);
  for (let i = 0; i < cp.count; i++) {
    const dx = cp.getX(i), dy = cp.getY(i), dz = cp.getZ(i);
    let m = 0;
    for (const [ox, oy, oz] of [[0, 0, 0], [0.06, 0, 0], [-0.06, 0, 0], [0, 0.06, 0], [0, -0.06, 0]]) if (inHair(dx + ox, dy + oy, dz + oz)) m += 0.2;
    capMask[i] = m;
    // strands run from the crown downward and sway side to side as they go: wavy, not curly
    const phi = Math.atan2(dz, dx);
    const strand = Math.sqrt(Math.abs(Math.sin(phi * 11 + 1.7 * Math.sin(dy * 6.5 + phi))));
    const wave = Math.sin(dy * 8 + phi * 2.2) * 0.022 + 0.02 * noise3(dx * 3, dy * 3, dz * 3);
    const v = shellPoint(dx, dy, dz, 0.95 + m * (0.14 + 0.2 * smooth(0.1, 1, dy) + 0.034 * strand + wave));
    cp.setXYZ(i, v.x, v.y, v.z);
  }
  const cIdx = capGeo.index!.array, capKeep: number[] = [];
  for (let t = 0; t < cIdx.length; t += 3) {
    if (capMask[cIdx[t]] + capMask[cIdx[t + 1]] + capMask[cIdx[t + 2]] > 0.6) capKeep.push(cIdx[t], cIdx[t + 1], cIdx[t + 2]);
  }
  capGeo.setIndex(capKeep);
  capGeo.computeVertexNormals();

  // a lock: a wavy, tapered, slightly flattened tube from root (0,0,0) down to its tip, curling outward at the end
  const makeLock = (waves: number, amp: number, curl: number) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new THREE.Vector3(Math.sin(t * Math.PI * 2 * waves) * amp * (0.5 + t), -t, 0.04 * Math.sin(t * Math.PI) + curl * t * t * t));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const TS = 28, RS = 7;
    const g = new THREE.TubeGeometry(curve, TS, 0.075, RS, false);
    const pa = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) {
      const t = Math.floor(i / (RS + 1)) / TS;
      const c = curve.getPointAt(t);
      const taper = (0.6 + 0.4 * Math.sin(Math.min(1, t * 1.6) * Math.PI * 0.5)) * (1 - 0.55 * t * t);
      pa.setXYZ(i, c.x + (pa.getX(i) - c.x) * taper * 1.5, c.y + (pa.getY(i) - c.y) * taper, c.z + (pa.getZ(i) - c.z) * taper * 0.85);
    }
    g.computeVertexNormals();
    return g;
  };

  const locksA: Rig['hair'][number]['base'] = [], locksB: Rig['hair'][number]['base'] = [];
  const crownPt = new THREE.Vector3(0.08, 1.45, -0.05);
  const basis = new THREE.Matrix4();
  const N = lowDetail ? 150 : 220;
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N, rad = Math.sqrt(1 - y * y), th = i * 2.399963;
    const dx = Math.cos(th) * rad, dz = Math.sin(th) * rad, dy = y;
    if (!inHair(dx, dy, dz)) continue;
    const p = shellPoint(dx, dy, dz, 1.13 + 0.18 * smooth(0.1, 1, dy) + r() * 0.03);
    const n = new THREE.Vector3(dx, dy, dz).normalize();
    const flow = p.clone().sub(crownPt);
    if (dz > 0.2 && dy > 0.25) flow.x -= 0.5; // the fringe sweeps to one side
    flow.addScaledVector(n, -flow.dot(n));
    if (flow.lengthSq() < 1e-4) flow.set(0, -1, 0);
    flow.normalize();
    const yAxis = flow.clone().negate();
    const xAxis = new THREE.Vector3().crossVectors(yAxis, n).normalize();
    const zAxis = new THREE.Vector3().crossVectors(xAxis, yAxis).normalize();
    basis.makeBasis(xAxis, yAxis, zAxis);
    const q = new THREE.Quaternion().setFromRotationMatrix(basis);
    let len = 0.48 + r() * 0.26;
    if (dz > 0.25 && dy > 0.2) len = Math.min(len, Math.max(0.18, (p.y - 0.42) * 1.5)); // fringe stops above the brows
    const drop = Math.max(0.2, -flow.y);
    len = Math.min(len, Math.max(0.16, (p.y + 0.12) / drop)); // sides end around the ears
    const w = 0.9 + r() * 0.5;
    const item = { p, q, s: new THREE.Vector3(w, len, w), h: smooth(-0.6, 1, dy), ph: r() * 6.28 };
    (i % 2 ? locksA : locksB).push(item);
  }
  const makeHair = (geo: THREE.BufferGeometry, list: Rig['hair'][number]['base']) => {
    const mesh = new THREE.InstancedMesh(keep(geo), hairMat, list.length);
    const m4 = new THREE.Matrix4();
    list.forEach((b, i) => { mesh.setMatrixAt(i, m4.compose(b.p, b.q, b.s)); mesh.setColorAt(i, new THREE.Color(0x17110e)); });
    mesh.userData.zone = 'hair';
    head.add(mesh);
    return { mesh, base: list };
  };
  const hair = [
    makeHair(capGeo, [{ p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), h: 0.35, ph: 0 }]),
    makeHair(makeLock(1.25, 0.085, -0.04), locksA),
    makeHair(makeLock(1.75, 0.07, -0.02), locksB),
  ];

  // ---- neck and shirt ----
  const neckMesh = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.34, 0.4, 1.1, 32)), neckSkin);
  neckMesh.position.set(0, -0.2, -0.04);
  neckMesh.userData.zone = 'body';
  neck.add(neckMesh);

  const prof = [[0.0, -1.18], [0.43, -1.18], [0.52, -1.3], [0.98, -1.46], [1.46, -1.72], [1.7, -2.12], [1.8, -2.8], [1.82, -3.8]]
    .map(([x, y]) => new THREE.Vector3(x, y, 0));
  const profile = new THREE.CatmullRomCurve3(prof).getPoints(48).map((v) => new THREE.Vector2(Math.max(0, v.x), v.y));
  const body = new THREE.Mesh(keep(new THREE.LatheGeometry(profile, 72)), shirt);
  body.scale.set(1, 1, 0.6);
  body.userData.zone = 'body';
  torso.add(body);
  const torsoZ = (x: number, y: number) => surf(body, x, y);

  const collar = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.43, 0.48, 0.2, 48, 1, true, 0.36, Math.PI * 2 - 0.72)), shirtDark);
  collar.position.set(0, -1.1, -0.02);
  collar.scale.set(1, 1, 0.92);
  collar.userData.zone = 'body';
  torso.add(collar);

  const vShape = new THREE.Shape([new THREE.Vector2(-0.16, -1.2), new THREE.Vector2(0.16, -1.2), new THREE.Vector2(0, -1.78)]);
  const vGeo = keep(new THREE.ShapeGeometry(vShape, 6));
  const vp = vGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < vp.count; i++) vp.setZ(i, torsoZ(vp.getX(i), vp.getY(i)) + 0.004);
  const vNeck = new THREE.Mesh(vGeo, neckSkin);
  vNeck.userData.zone = 'body';
  torso.add(vNeck);

  const placket = new THREE.Mesh(keep(new THREE.PlaneGeometry(0.09, 2.1, 1, 20)), shirtDark);
  const pp = placket.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pp.count; i++) { const y = pp.getY(i) - 2.78; pp.setY(i, y); pp.setZ(i, torsoZ(pp.getX(i) + 0.03, y) + 0.006); }
  placket.position.x = 0.03;
  torso.add(placket);
  const btnGeo = keep(new THREE.SphereGeometry(0.036, 14, 10));
  for (const y of [-1.92, -2.42, -2.92, -3.42]) {
    const b = new THREE.Mesh(btnGeo, button);
    b.scale.z = 0.5;
    b.position.set(0.03, y, torsoZ(0.03, y) + 0.02);
    torso.add(b);
  }

  const pick: THREE.Object3D[] = [];
  root.traverse((o) => { if ((o as THREE.Mesh).isMesh && o.userData.zone) pick.push(o); });

  return {
    root, head, neck, torso,
    eyes: eyes as [Eye, Eye],
    brows: brows as [THREE.Mesh, THREE.Mesh],
    browBase: browBase as [THREE.Vector3, THREE.Vector3],
    setMouth, hair, hairMat, faceHair: [beardMat, browMat], pick,
    anchors: {
      nose: new THREE.Vector3(0, -0.19, headZ(0, -0.19) + 0.14),
      forehead: new THREE.Vector3(0, 0.45, headZ(0, 0.45)),
      cheekR: new THREE.Vector3(0.4, -0.3, headZ(0.4, -0.3)),
      cheekL: new THREE.Vector3(-0.4, -0.3, headZ(-0.4, -0.3)),
      top: new THREE.Vector3(0.35, 1.45, 0.2),
      eyes: new THREE.Vector3(0, 0.1, headZ(0, 0.1)),
      mouth: new THREE.Vector3(0, -0.5, headZ(0, -0.5)),
    },
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}
