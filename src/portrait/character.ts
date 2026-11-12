// ===== LIVING 3D CHARACTER =====
// Drives the code-built 3D Vinay (model.ts): eyes that follow the cursor, blinks, expressions on real
// lids/brows/mouth, a head that turns toward you, curls that sway and change colour, and a soft-body
// field so grabbing him squashes and wobbles like dough.
//
// Behaviour carried over from the Mina reference: fixed 1/240 s physics, idle acts only after 30–45 s of
// silence, any input ending them, eyes shut until the first pointer move.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EXPRESSIONS, FACE_HAIR_SHADE, HAIR, OWN_FACE_HAIR, OWN_HAIR, ZERO, type ExprName, type Params } from './face';
import { buildRig, DEFORM } from './model';

export type PortraitElements = {
  wrap: HTMLElement;
  canvas: HTMLCanvasElement;
  fallback: HTMLImageElement;
  fly: SVGSVGElement;
  hand: SVGSVGElement;
  fx: HTMLElement;
};
export type PortraitOptions = {
  reduced: boolean;
  initialHair: number;
  onHair?: (index: number) => void;
  onReady?: () => void;
  onInteract?: () => void;
};
export type PortraitHandle = { destroy: () => void; setHair: (index: number) => void };

type V2 = [number, number];
type Target = V2 | (() => V2);
type Step = {
  e?: ExprName;
  look?: V2 | 'fly';
  ms: number;
  jolt?: [number, number, number];
  lean?: V2;
  hair?: number;
  call?: (now: number) => void;
  zzz?: boolean;
};

const ACT_ROTATION = ['shifty', 'curious', 'fly', 'wink', 'roll', 'doze', 'hair', 'tug', 'sneeze', 'wow'] as const;
type ActName = (typeof ACT_ROTATION)[number];
const HOVER: Record<string, ExprName> = { eyeL: 'wink', eyeR: 'playful', nose: 'crossed', mouth: 'happy' };
const TAP: Record<string, ExprName | 'act:sneeze'> = {
  brow: 'focused', eyeL: 'ouch', eyeR: 'ouch', nose: 'act:sneeze', mouth: 'playful', cheek: 'puff', chin: 'laugh', body: 'laugh',
};
const KEYS = Object.keys(ZERO) as (keyof Params)[];
const EMBER = '#FF5B1F';

export function createCharacter(el: PortraitElements, opt: PortraitOptions): PortraitHandle | null {
  const { wrap, canvas, fallback, fly, hand, fx } = el;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const small = innerWidth < 760;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const reduced = opt.reduced;
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.5;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(18, 1, 0.1, 60);
  camera.position.set(0, -0.1, 16.2);
  camera.lookAt(0, -0.32, 0);

  const key = new THREE.DirectionalLight(0xfff0e4, 1.9); key.position.set(2.6, 3.2, 5);
  const fill = new THREE.HemisphereLight(0xdfe7ff, 0x2a1810, 0.7);
  const rimL = new THREE.DirectionalLight(EMBER, 3.2); rimL.position.set(-4.5, 2.2, -4);
  const rimR = new THREE.DirectionalLight(EMBER, 2.2); rimR.position.set(4.5, 0.8, -3.5);
  scene.add(key, fill, rimL, rimR);

  const rig = buildRig(small);
  scene.add(rig.root);
  const rimColor = new THREE.Color(EMBER), rimTarget = new THREE.Color(EMBER);

  // ---- geometry helpers ----
  const tmp = new THREE.Vector3();
  const worldOf = (local: THREE.Vector3) => rig.head.localToWorld(tmp.copy(local)).clone();
  const toPx = (w: THREE.Vector3): V2 => {
    const r = canvas.getBoundingClientRect(), p = w.clone().project(camera);
    return [r.left + ((p.x + 1) / 2) * r.width, r.top + ((1 - p.y) / 2) * r.height];
  };
  const toFrac = (w: THREE.Vector3): V2 => {
    const r = wrap.getBoundingClientRect(), [x, y] = toPx(w);
    return [(x - r.left) / r.width, (y - r.top) / r.height];
  };
  const worldPerPx = () => (2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / Math.max(1, canvas.getBoundingClientRect().height);
  const ray = new THREE.Raycaster();
  const hitAt = (x: number, y: number) => {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1), camera);
    return ray.intersectObjects(rig.pick, false)[0] ?? null;
  };
  const zoneOf = (h: THREE.Intersection | null): string | null => {
    if (!h) return null;
    const z = h.object.userData.zone as string;
    if (z === 'skin' || z === 'beard') {
      const l = rig.head.worldToLocal(h.point.clone());
      if (z === 'skin') return l.y > 0.22 ? 'brow' : 'cheek';
      return l.y < -0.78 ? 'chin' : 'cheek';
    }
    return z;
  };

  // ---- soft body: one grab point, a pull vector on a damped spring ----
  const pull = new THREE.Vector3(), pullVel = new THREE.Vector3(), pullTarget = new THREE.Vector3();
  let grabbing = false;
  const H = 1 / 240;
  let simLeft = 0;
  function poke(w: THREE.Vector3, vy: number, vx = 0) {
    if (!grabbing) { DEFORM.uGrab.value.copy(w); DEFORM.uGrabR.value = 0.5; }
    pullVel.x += vx; pullVel.y += vy;
  }

  // ---- state ----
  const debug = new URLSearchParams(location.search);
  const IDLE_MIN = debug.has('portrait-debug') && debug.get('idle') ? Number(debug.get('idle')) : 30000;
  const IDLE_SPAN = IDLE_MIN === 30000 ? 15000 : 0;
  let ready = false, raf = 0, last = performance.now(), tStart = 0, visible = true;
  let mx = innerWidth / 2, my = innerHeight / 2, zone: string | null = null, zoneSince = 0, onHead = false, pointerDirty = false;
  let lastInput = -1e9, awake = false, pressed = false, downAt = 0, downZone: string | null = null, downX = 0, downY = 0;
  let lastX = 0, lastY = 0, speed = 0, shake = 0, hasPointer = false;
  let mood: ExprName | null = null, moodUntil = 0, pulls: number[] = [];
  let actName = '', act: Step[] | null = null, actI = 0, actT = 0, rotation: ActName[] = [];
  let nextIdle = IDLE_MIN + Math.random() * IDLE_SPAN;
  let lookOverride: V2 | 'fly' | null = null, wantLean: V2 = [0, 0];
  let nextBlink = 0, blinkT = -1, lidL = 1, lidR = 1;
  let scrollUntil = 0, lastScroll = scrollY;
  let hairI = opt.initialHair, hairShown = -2;
  let zzzAt = 0, heartsAt = 0, hearts = false, hintDone = false;
  const cur: Params = { ...ZERO };
  const gzL: V2 = [0, 0], gzR: V2 = [0, 0], turn: V2 = [0, 0];
  let lean: V2 = [0, 0], leanV: V2 = [0, 0];
  let prevYaw = 0, prevPitch = 0;
  const sway = new THREE.Vector2(), swayV = new THREE.Vector2();
  let lastMouth = [-1, -1, -1];

  // ---- hair colour: swept from the crown down, curl by curl ----
  const hairCols = rig.hair.map((h) => h.base.map(() => new THREE.Color(OWN_HAIR)));
  const hairFrom = rig.hair.map((h) => h.base.map(() => new THREE.Color(OWN_HAIR)));
  const hairTo = new THREE.Color(OWN_HAIR);
  const faceCol = new THREE.Color(OWN_FACE_HAIR), faceFrom = new THREE.Color(OWN_FACE_HAIR), faceTo = new THREE.Color(OWN_FACE_HAIR);
  let hairT0 = -1;
  function showHair(i: number, now: number, instant = false) {
    if (i === hairShown) return;
    hairShown = i;
    hairTo.set(i < 0 ? OWN_HAIR : HAIR[i].css);
    rimTarget.set(i < 0 ? EMBER : HAIR[i].css);
    if (i < 0) faceTo.set(OWN_FACE_HAIR); else faceTo.set(HAIR[i].css).multiplyScalar(FACE_HAIR_SHADE);
    faceFrom.copy(faceCol);
    hairCols.forEach((list, k) => list.forEach((c, j) => hairFrom[k][j].copy(c)));
    hairT0 = instant ? now - 5000 : now;
  }
  function paintHair(now: number) {
    if (hairT0 < 0) return;
    const el = now - hairT0;
    let done = true;
    rig.hair.forEach((h, k) => {
      h.base.forEach((b, j) => {
        const t = Math.min(1, Math.max(0, (el - (1 - b.h) * 420) / 320));
        if (t < 1) done = false;
        hairCols[k][j].copy(hairFrom[k][j]).lerp(hairTo, t * t * (3 - 2 * t));
        h.mesh.setColorAt(j, hairCols[k][j]);
      });
      h.mesh.instanceColor!.needsUpdate = true;
    });
    // the sweep reaches the brows, then the beard and mustache, last
    const ft = Math.min(1, Math.max(0, (el - 380) / 360));
    if (ft < 1) done = false;
    faceCol.copy(faceFrom).lerp(faceTo, ft * ft * (3 - 2 * ft));
    rig.faceHair.forEach((m) => m.color.copy(faceCol));
    if (done) hairT0 = -1;
  }

  // ---- acts ----
  let flyPos: V2 = [1.4, 0], flyFrom: V2 = [1.4, 0], flyTo: Target = [1.4, 0];
  let handFrom: V2 = [1.4, 0.9], handTo: Target = [1.4, 0.9], handPos: V2 = [1.4, 0.9], moveT = 0, moveMs = 1;
  let handGrip: false | 'on' | 'pull' | 'off' = false, handHeld = false;
  const resolve = (t: Target): V2 => (typeof t === 'function' ? t() : t);
  const noseFrac = () => toFrac(worldOf(rig.anchors.nose));
  const cheekFrac = () => toFrac(worldOf(rig.anchors.cheekR));
  const moveFly = (t: Target, ms: number) => (now: number) => { flyFrom = flyPos; flyTo = t; moveT = now; moveMs = ms; };
  const moveHand = (t: Target, ms: number) => (now: number) => { handFrom = handPos; handTo = t; moveT = now; moveMs = ms; };
  const place = (node: Element, [u, v]: V2) => {
    (node as HTMLElement).style.left = u * 100 + '%';
    (node as HTMLElement).style.top = v * 100 + '%';
  };

  function buildAct(name: ActName): Step[] {
    switch (name) {
      case 'shifty': return [{ look: [-1, 0], ms: 520 }, { look: [1, 0], ms: 620 }, { look: [-1, 0.1], ms: 420 }, { e: 'squint', look: [0, 0], ms: 600 }];
      case 'curious': return [{ e: 'curious', look: [0.7, -0.5], ms: 1500 }, { e: 'happy', look: [0, 0], ms: 500 }];
      case 'wink': return [{ e: 'wink', look: [0.2, 0.1], ms: 750 }, { e: 'happy', ms: 600 }];
      case 'roll': return [
        { look: [-1, 0], ms: 200 }, { look: [-0.75, -0.7], ms: 80 }, { look: [0, -1], ms: 150 }, { look: [0.75, -0.7], ms: 80 },
        { look: [1, 0], ms: 220 }, { look: [0, 0], ms: 150 }, { e: 'squint', ms: 700 },
      ];
      case 'doze': return [
        { e: 'sleepy', ms: 900, lean: [0.02, -0.03] }, { e: 'sleepy', ms: 600, lean: [0.04, -0.06] },
        { e: 'neutral', ms: 260 }, { e: 'sleepy', ms: 700, lean: [0.05, -0.08] },
        { e: 'asleep', ms: 3200, lean: [0.07, -0.12], zzz: true }, { e: 'shock', ms: 700, jolt: [0, 2.4, 0] },
      ];
      case 'hair': return [
        { hair: 0, e: 'curious', look: [0, -0.9], ms: 1100 }, { hair: 1, e: 'happy', ms: 1000 },
        { hair: 2, e: 'excited', ms: 1050 }, { hair: -9, e: 'happy', ms: 500 },
      ];
      case 'sneeze': return [
        { e: 'squint', ms: 380 }, { e: 'sleepy', ms: 180 }, { e: 'ouch', ms: 520 },
        { e: 'ouch', ms: 300, jolt: [0, -2.6, 0], lean: [0, -0.06] }, { e: 'dizzy', ms: 650 }, { e: 'happy', ms: 650 },
      ];
      case 'wow': return [{ e: 'surprised', ms: 900 }, { e: 'excited', ms: 800 }, { e: 'happy', ms: 500 }];
      case 'fly': {
        flyPos = flyFrom = [1.35, 0.02]; flyTo = flyPos; fly.style.opacity = '1';
        const hop = (u: number, v: number, ms: number): Step => ({ look: 'fly', ms, call: moveFly([u, v], ms * 0.9) });
        return [
          hop(0.86, 0.12, 620), hop(0.16, 0.24, 680), hop(0.82, 0.45, 640), hop(0.22, 0.4, 600),
          { look: 'fly', ms: 520, call: moveFly(noseFrac, 470) },
          { e: 'crossed', ms: 950, jolt: [0, -0.5, 0] },
          { e: 'puff', ms: 360, call: moveFly([0.5, 0.14], 280) }, { e: 'crossed', ms: 520, call: moveFly(noseFrac, 320) },
          { e: 'puff', ms: 560, jolt: [0, 0.8, 0], call: moveFly([1.5, -0.35], 600) }, { e: 'happy', ms: 600 },
        ];
      }
      case 'tug': {
        handPos = handFrom = [1.3, 0.86]; handTo = handPos; hand.style.opacity = '1'; hand.classList.remove('shut');
        const off = (du: number, dv: number) => (): V2 => { const c = cheekFrac(); return [c[0] + du, c[1] + dv]; };
        const g = (t: Target, ms: number, e: ExprName, grip: typeof handGrip): Step =>
          ({ e, ms, call: (now) => { moveHand(t, ms * 0.8)(now); handGrip = grip; } });
        return [
          { ...g(cheekFrac, 760, 'neutral', false), look: [0.8, 0.7] }, g(cheekFrac, 240, 'shock', 'on'),
          g(off(0.1, -0.03), 620, 'ouch', 'pull'), g(off(0.05, 0.01), 240, 'ouch', 'pull'), g(off(0.11, -0.04), 240, 'ouch', 'pull'),
          g(off(0.07, -0.01), 260, 'ouch', 'pull'), g([1.4, 0.2], 1000, 'dizzy', 'off'), { e: 'focused', ms: 620 },
        ];
      }
    }
  }
  function startAct(name: ActName, now: number) {
    endAct();
    act = buildAct(name); actName = name; actI = -1; actT = now; advance(now);
  }
  function endAct() {
    if (act && hairShown !== hairI) showHair(hairI, performance.now());
    act = null; actName = ''; lookOverride = null; wantLean = [0, 0];
    fly.style.opacity = '0'; hand.style.opacity = '0';
    if (handHeld) { handHeld = false; grabbing = false; }
    handGrip = false; hand.classList.remove('shut');
  }
  function advance(now: number) {
    actI++;
    if (!act || actI >= act.length) { endAct(); return; }
    const s = act[actI]; actT = now;
    lookOverride = s.look ?? null;
    wantLean = s.lean ?? [0, 0];
    if (s.jolt) poke(worldOf(rig.anchors.nose), s.jolt[1], s.jolt[0]);
    if (s.hair !== undefined) showHair(s.hair === -9 ? hairI : s.hair, now);
    s.call?.(now);
  }

  // ---- input ----
  function wake(now: number) {
    lastInput = now;
    if (!awake) { awake = true; nextBlink = now + 1800; }
    nextIdle = IDLE_MIN + Math.random() * IDLE_SPAN;
  }
  const interacted = () => { if (!hintDone) { hintDone = true; opt.onInteract?.(); } };

  const onMove = (e: PointerEvent) => {
    const now = performance.now();
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY; mx = e.clientX; my = e.clientY; hasPointer = true;
    if (e.pointerType === 'mouse') speed += Math.hypot(dx, dy) * 0.004;
    wake(now);
    if (act && !pressed) endAct();
    pointerDirty = e.pointerType === 'mouse';
    if (pressed) {
      const k = worldPerPx();
      let px = (mx - downX) * k, py = -(my - downY) * k;
      const L = Math.hypot(px, py), lim = 0.5;
      if (L > 0) { const s = (lim * (1 - Math.exp(-L / lim))) / L; px *= s; py *= s; }
      pullTarget.set(px, py, 0);
    }
  };
  const onDown = (e: PointerEvent) => {
    const now = performance.now();
    const h = hitAt(e.clientX, e.clientY);
    if (!h) return;
    mx = e.clientX; my = e.clientY;
    wake(now); endAct(); interacted();
    pressed = true; grabbing = true; downAt = e.timeStamp; downX = e.clientX; downY = e.clientY; downZone = zoneOf(h);
    DEFORM.uGrab.value.copy(h.point); DEFORM.uGrabR.value = 0.55;
    pullTarget.set(0, 0, 0);
    mood = null;
    try { wrap.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
    if (e.pointerType === 'mouse') e.preventDefault();
  };
  const release = (e?: PointerEvent) => {
    if (!pressed) return;
    const now = performance.now(), L = pullTarget.length(), held = (e?.timeStamp ?? now) - downAt, z = downZone ?? 'cheek';
    pressed = false; grabbing = false; pullTarget.set(0, 0, 0);
    wrap.style.cursor = onHead ? 'grab' : '';
    pulls = pulls.filter((t) => now - t < 14000);
    if (L < 0.05 && held < 380) { // a tap
      if (z === 'hair') {
        hairI = hairI + 1 >= HAIR.length ? -1 : hairI + 1;
        showHair(hairI, now); opt.onHair?.(hairI);
        pullVel.y += 1.4;
      } else {
        const r = TAP[z] ?? 'happy';
        if (r === 'act:sneeze') startAct('sneeze', now);
        else { mood = r; moodUntil = now + 1200; }
        pullVel.y -= 1.2;
      }
      return;
    }
    pulls.push(now);
    const n = pulls.length;
    mood = n >= 8 ? 'sulk' : n >= 5 ? 'focused' : L > 0.36 ? 'dizzy' : L > 0.18 ? 'squint' : 'neutral';
    moodUntil = now + (n >= 5 ? 2600 : 700 + L * 2000);
  };
  const onLeave = () => { zone = null; onHead = false; };
  const onScroll = () => {
    const n = performance.now();
    if (Math.abs(scrollY - lastScroll) > 2) { scrollUntil = n + 500; lastScroll = scrollY; }
    wake(n);
  };
  const moodTarget = (e: PointerEvent) => (e.target as Element | null)?.closest?.('[data-portrait-mood]');
  const onOver = (e: PointerEvent) => {
    const t = moodTarget(e);
    if (!t || (e.relatedTarget as Element | null)?.closest?.('[data-portrait-mood]') === t) return;
    mood = (t.getAttribute('data-portrait-mood') as ExprName) || 'excited';
    moodUntil = performance.now() + 1e7; hearts = true;
  };
  const onOut = (e: PointerEvent) => {
    const t = moodTarget(e);
    if (!t || (e.relatedTarget as Element | null)?.closest?.('[data-portrait-mood]') === t) return;
    mood = 'happy'; moodUntil = performance.now() + 900; hearts = false;
  };
  const onVis = () => { last = performance.now(); };

  addEventListener('pointermove', onMove, { passive: true });
  wrap.addEventListener('pointerdown', onDown);
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);
  document.addEventListener('pointerleave', onLeave);
  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onOut);
  document.addEventListener('visibilitychange', onVis);
  addEventListener('scroll', onScroll, { passive: true });
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 });
  io.observe(canvas);
  const ro = new ResizeObserver(() => {
    const b = canvas.getBoundingClientRect();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));
    renderer.setSize(Math.max(1, Math.round(b.width)), Math.max(1, Math.round(b.height)), false);
    camera.aspect = b.width / Math.max(1, b.height);
    camera.updateProjectionMatrix();
  });
  ro.observe(canvas);
  const wakeTimer = coarse ? window.setTimeout(() => wake(performance.now()), 1400) : 0;

  function spawn(cls: string, text: string, [u, v]: V2) {
    const s = document.createElement('span');
    s.className = cls; s.textContent = text;
    s.style.left = u * 100 + '%'; s.style.top = v * 100 + '%';
    s.style.setProperty('--dx', (Math.random() * 2 - 1) * 30 + 'px');
    s.addEventListener('animationend', () => s.remove());
    fx.appendChild(s);
  }

  const m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), qq = new THREE.Quaternion(), wob = new THREE.Quaternion(), eul = new THREE.Euler();

  // ---- frame ----
  function update(now: number, dt: number) {
    const f = (r: number) => 1 - Math.exp(-dt * r);
    speed *= Math.exp(-dt * 6);
    shake += ((speed > 1.5 ? 1 : 0) - shake) * f(speed > 1.5 ? 1.2 : 0.9);

    if (act) { if (now - actT > act[actI].ms) advance(now); }
    else if (!reduced && !pressed && tStart && now - Math.max(lastInput, tStart) > nextIdle) {
      if (!rotation.length) rotation = [...ACT_ROTATION];
      if (!awake) wake(now);
      startAct(rotation.shift()!, now); lastInput = now; nextIdle = IDLE_MIN + Math.random() * IDLE_SPAN;
    }

    // hover, raycast at most once a frame
    if (pointerDirty && !pressed) {
      pointerDirty = false;
      const h = hitAt(mx, my);
      onHead = !!h;
      const z = zoneOf(h);
      if (z !== zone) { zone = z; zoneSince = now; }
      wrap.style.cursor = onHead ? 'grab' : '';
    } else if (pressed) wrap.style.cursor = 'grabbing';

    // props
    const mk = Math.min(1, (now - moveT) / moveMs), me = mk * mk * (3 - 2 * mk), jit = mk >= 1 ? 0.15 : 1;
    const ft = resolve(flyTo), ht = resolve(handTo);
    flyPos = [flyFrom[0] + (ft[0] - flyFrom[0]) * me + Math.sin(now * 0.02) * 0.01 * jit, flyFrom[1] + (ft[1] - flyFrom[1]) * me + Math.cos(now * 0.027) * 0.01 * jit];
    handPos = [handFrom[0] + (ht[0] - handFrom[0]) * me, handFrom[1] + (ht[1] - handFrom[1]) * me];
    place(fly, flyPos); place(hand, handPos);
    if (handGrip === 'on' && !handHeld) {
      DEFORM.uGrab.value.copy(worldOf(rig.anchors.cheekR)); DEFORM.uGrabR.value = 0.45;
      handHeld = true; grabbing = true; hand.classList.add('shut'); handGrip = 'pull';
    }
    if (handHeld) {
      const c = cheekFrac(), w = wrap.getBoundingClientRect().width * worldPerPx();
      pullTarget.set((handPos[0] - c[0]) * w, -(handPos[1] - c[1]) * w, 0).clampLength(0, 0.5);
    }
    if (handGrip === 'off' && handHeld) { handHeld = false; grabbing = false; pullTarget.set(0, 0, 0); hand.classList.remove('shut'); handGrip = false; }

    // which expression
    let want: ExprName = 'neutral';
    const pl = pressed ? pull.length() : 0;
    if (act) want = act[actI]?.e ?? 'neutral';
    else if (pressed) want = pl > 0.34 ? 'scared' : pl > 0.16 ? 'ouch' : pl > 0.04 || downZone !== 'hair' ? 'shock' : 'neutral';
    else if (mood && now < moodUntil) want = mood;
    else if (shake > 0.55) want = shake > 0.92 ? 'dizzy' : 'squint';
    else if (zone && now - zoneSince > 80 && HOVER[zone]) want = HOVER[zone];
    if (!awake) want = 'neutral';
    const target = EXPRESSIONS[want];
    const rate = pressed ? 22 : 12;
    for (const k of KEYS) cur[k] += (target[k] - cur[k]) * f(rate);

    // lids
    let lidExtra = awake ? 0 : 1;
    if (awake && !act && now > nextBlink && !pressed) {
      blinkT = now; nextBlink = now + 2200 + Math.random() * 3400;
      if (Math.random() < 0.18) nextBlink = now + 320;
    }
    if (blinkT >= 0) {
      const t = now - blinkT;
      lidExtra = Math.max(lidExtra, t < 70 ? t / 70 : Math.max(0, 1 - (t - 70) / 110));
      if (t > 180) blinkT = -1;
    }
    const lr = blinkT >= 0 ? 1 : f(awake ? 15 : 6);
    lidL += (Math.max(cur.lidL, lidExtra) - lidL) * lr;
    lidR += (Math.max(cur.lidR, lidExtra) - lidR) * lr;

    // gaze
    let gx = 0, gy = 0;
    const [ex, ey] = toPx(worldOf(rig.anchors.eyes));
    if (lookOverride === 'fly') {
      const r = wrap.getBoundingClientRect(), fxp = r.left + flyPos[0] * r.width, fyp = r.top + flyPos[1] * r.height;
      const dx = fxp - ex, dy = fyp - ey, d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 140);
      gx = (dx / d) * m; gy = (dy / d) * m;
    } else if (lookOverride) { gx = lookOverride[0]; gy = lookOverride[1]; }
    else if (now < scrollUntil) { gx = 0; gy = 1; }
    else if (awake && hasPointer) {
      const dx = mx - ex, dy = my - ey, d = Math.hypot(dx, dy) || 1, m = Math.min(1, d / 280);
      gx = (dx / d) * m; gy = (dy / d) * m;
    }
    let tLx = gx, tLy = gy, tRx = gx, tRy = gy;
    if (want === 'dizzy') {
      const a = now * 0.009;
      tLx = Math.cos(a) * 0.8; tLy = Math.sin(a) * 0.8; tRx = Math.cos(-a + 1) * 0.8; tRy = Math.sin(-a + 1) * 0.8;
    }
    const cr = Math.min(1, cur.cross);
    tLx = tLx * (1 - cr) + 0.95 * cr; tRx = tRx * (1 - cr) - 0.95 * cr; tLy = tLy * (1 - cr) + 0.2 * cr; tRy = tRy * (1 - cr) + 0.2 * cr;
    const sacc = f(26);
    gzL[0] += (tLx - gzL[0]) * sacc; gzL[1] += (tLy - gzL[1]) * sacc;
    gzR[0] += (tRx - gzR[0]) * sacc; gzR[1] += (tRy - gzR[1]) * sacc;
    const hr = f(4.5);
    turn[0] += ((awake ? gx : 0) - turn[0]) * hr;
    turn[1] += ((awake ? gy : 0.5) - turn[1]) * hr;

    // fx
    if (hearts && now > heartsAt && !reduced) { heartsAt = now + 320; const t = toFrac(worldOf(rig.anchors.top)); spawn('pfx heart', '♥', [t[0] - 0.3 + Math.random() * 0.36, t[1] + Math.random() * 0.06]); }
    if (act && act[actI]?.zzz && now > zzzAt) { zzzAt = now + 700; spawn('pfx zzz', 'z', toFrac(worldOf(rig.anchors.top))); }
    paintHair(now);
    rimColor.lerp(rimTarget, f(4));
    rimL.color.copy(rimColor); rimR.color.copy(rimColor);

    // soft body + lean, fixed step
    simLeft += dt;
    let steps = 0;
    while (simLeft >= H && steps < 12) {
      const tgt = grabbing ? pullTarget : ZERO3;
      const K = grabbing ? 700 : 150, D = grabbing ? 45 : 5.5;
      pullVel.x += ((tgt.x - pull.x) * K - pullVel.x * D) * H;
      pullVel.y += ((tgt.y - pull.y) * K - pullVel.y * D) * H;
      pull.x += pullVel.x * H; pull.y += pullVel.y * H;
      const lx = (grabbing ? pull.x * 0.12 : 0) + wantLean[0], ly = (grabbing ? pull.y * 0.12 : 0) + wantLean[1];
      leanV[0] += ((lx - lean[0]) * 90 - leanV[0] * 11) * H; leanV[1] += ((ly - lean[1]) * 90 - leanV[1] * 11) * H;
      lean[0] += leanV[0] * H; lean[1] += leanV[1] * H;
      simLeft -= H; steps++;
    }
    if (steps === 12) simLeft = 0;
    DEFORM.uPull.value.copy(pull);

    // pose
    const breathe = reduced ? 0 : 1;
    const roll = cur.roll + (awake ? 0 : 0.04) + Math.sin(now * 0.0007) * 0.012 * breathe + (want === 'laugh' ? Math.sin(now * 0.03) * 0.025 : 0);
    const nod = awake ? 0 : 0.12;
    rig.head.rotation.set(turn[1] * 0.22 + nod, turn[0] * 0.38, -roll);
    rig.neck.rotation.set(turn[1] * 0.05, turn[0] * 0.1, -roll * 0.4);
    rig.root.position.set(lean[0], lean[1] + Math.sin(now * 0.0013) * 0.012 * breathe, 0);
    rig.torso.scale.set(1, 1 + Math.sin(now * 0.0013) * 0.004 * breathe, 1);

    const [eL, eR] = rig.eyes;
    const upper = (l: number) => -0.46 + 0.78 * l - cur.widen * 0.22 * (1 - l);
    eL.upper.rotation.x = upper(Math.min(1, lidL)); eR.upper.rotation.x = upper(Math.min(1, lidR));
    const lowRaise = Math.min(1, Math.max(0, (cur.lidL + cur.lidR) * 0.25 + Math.max(0, cur.smile) * 0.3));
    eL.lower.rotation.x = eR.lower.rotation.x = 0.28 - 0.32 * lowRaise + cur.widen * 0.1;
    eL.ball.rotation.set(gzL[1] * 0.32, gzL[0] * 0.42, 0);
    eR.ball.rotation.set(gzR[1] * 0.32, gzR[0] * 0.42, 0);
    rig.brows.forEach((b, i) => {
      const s = i === 0 ? -1 : 1, lift = i === 0 ? cur.browL : cur.browR;
      b.position.set(rig.browBase[i].x - s * Math.max(0, -cur.inner) * 0.025, rig.browBase[i].y + lift * 0.065 - Math.max(0, -cur.inner) * 0.02, rig.browBase[i].z);
      b.rotation.z = -s * cur.inner * 0.3;
    });
    const open = Math.min(1.15, Math.max(0.03, 0.5 + cur.jaw * 0.55 + Math.min(0, cur.smile) * 0.3));
    const sm = Math.min(1.2, Math.max(-0.9, 0.6 + cur.smile * 0.6));
    if (Math.abs(open - lastMouth[0]) + Math.abs(sm - lastMouth[1]) + Math.abs(cur.smirk - lastMouth[2]) > 0.004) {
      rig.setMouth(open, sm, cur.smirk); lastMouth = [open, sm, cur.smirk];
    }
    DEFORM.uJaw.value = Math.max(0, cur.jaw) * 0.8;
    DEFORM.uPuff.value = cur.puff;

    rig.root.updateMatrixWorld(true);
    DEFORM.uHeadInv.value.copy(rig.head.matrixWorld).invert();
    DEFORM.uHeadRot.value.setFromMatrix4(rig.head.matrixWorld);

    // curls sway with head motion, and blow about when the cursor is shaken
    const yaw = rig.head.rotation.y, pitch = rig.head.rotation.x;
    const av = new THREE.Vector2((yaw - prevYaw) / Math.max(dt, 1e-3), (pitch - prevPitch) / Math.max(dt, 1e-3));
    prevYaw = yaw; prevPitch = pitch;
    swayV.x += ((-av.x * 0.05 - sway.x) * 60 - swayV.x * 7) * dt;
    swayV.y += ((av.y * 0.04 - sway.y) * 60 - swayV.y * 7) * dt;
    sway.addScaledVector(swayV, dt);
    const wind = reduced ? 0 : Math.min(1, shake * 1.4);
    const t = now / 1000;
    if (Math.abs(sway.x) + Math.abs(sway.y) + wind > 0.0005 || !hairStill) {
      hairStill = Math.abs(sway.x) + Math.abs(sway.y) + wind <= 0.0005;
      rig.hair.forEach(({ mesh, base }) => {
        base.forEach((b, j) => {
          const k = b.h;
          pos.set(
            b.p.x + (sway.x + wind * Math.sin(t * 9 + b.ph) * 0.05) * k,
            b.p.y + (sway.y + wind * Math.cos(t * 7 + b.ph) * 0.03) * k,
            b.p.z + wind * Math.sin(t * 8 + b.ph * 2) * 0.03 * k,
          );
          eul.set(sway.y * k, 0, sway.x * k * 2);
          qq.copy(b.q).premultiply(wob.setFromEuler(eul));
          mesh.setMatrixAt(j, m4.compose(pos, qq, b.s));
        });
        mesh.instanceMatrix.needsUpdate = true;
      });
    }
  }
  let hairStill = false;
  const ZERO3 = new THREE.Vector3();

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.04, (now - last) / 1000); last = now;
    if (!ready || !visible || document.hidden) return;
    update(now, dt);
    renderer.render(scene, camera);
  }

  // compile everything before the first visible frame, then hand over from the poster
  showHair(hairI, performance.now(), true);
  paintHair(performance.now());
  renderer.compileAsync(scene, camera).catch(() => undefined).finally(() => {
    if (!renderer.getContext()) return;
    ready = true; tStart = performance.now(); last = tStart;
    update(tStart, 0.016);
    renderer.render(scene, camera);
    fallback.style.visibility = 'hidden';
    opt.onReady?.();
    raf = requestAnimationFrame(frame);
  });

  if (debug.has('portrait-debug')) {
    (window as unknown as { __portrait: unknown }).__portrait = Object.assign(
      () => ({ act: actName, step: actI, awake, hair: hairI, shown: hairShown, t0: hairT0, to: hairTo.getHexString(), c0: hairCols[2][0].getHexString(), expr: { ...cur } }),
      {
        snapshot: (opts: { awake?: boolean; look?: V2 } = {}) => {
          if (opts.awake) { awake = true; lidL = lidR = 0; turn[0] = turn[1] = 0; }
          if (opts.look) { gzL[0] = gzR[0] = opts.look[0]; gzL[1] = gzR[1] = opts.look[1]; }
          rig.eyes.forEach((e) => { e.upper.rotation.x = -0.46; e.ball.rotation.set(gzL[1] * 0.32, gzL[0] * 0.42, 0); });
          rig.head.rotation.set(0, 0, 0); rig.neck.rotation.set(0, 0, 0);
          rig.root.updateMatrixWorld(true);
          DEFORM.uHeadInv.value.copy(rig.head.matrixWorld).invert();
          DEFORM.uHeadRot.value.setFromMatrix4(rig.head.matrixWorld);
          renderer.render(scene, camera);
          return canvas.toDataURL('image/png');
        },
      },
    );
  }

  const setHair = (i: number) => {
    const now = performance.now();
    hairI = i; wake(now); endAct(); showHair(i, now); opt.onHair?.(i);
    mood = i < 0 ? 'happy' : 'excited'; moodUntil = now + 900;
  };

  const destroy = () => {
    cancelAnimationFrame(raf);
    clearTimeout(wakeTimer);
    removeEventListener('pointermove', onMove);
    wrap.removeEventListener('pointerdown', onDown);
    removeEventListener('pointerup', release);
    removeEventListener('pointercancel', release);
    document.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onOut);
    document.removeEventListener('visibilitychange', onVis);
    removeEventListener('scroll', onScroll);
    io.disconnect(); ro.disconnect();
    rig.dispose();
    envRT.dispose();
    renderer.dispose();
    fallback.style.visibility = '';
  };
  return { destroy, setHair };
}
