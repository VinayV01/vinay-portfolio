// Expression presets for the 3D character. Each value drives a real part of the model:
// eyelids, eyeball size, brows, mouth shape, jaw, cheeks and head roll.

export type Params = {
  lidL: number; // 0 open .. 1 shut (viewer's left eye)
  lidR: number;
  widen: number; // eyes opened wider
  browL: number; // lift, + up
  browR: number;
  inner: number; // inner brow ends: + worried, − angry
  smile: number; // + bigger grin, − frown
  smirk: number; // one corner up
  jaw: number; // mouth/jaw opens
  puff: number; // cheeks blown out
  roll: number; // head roll, radians
  cross: number; // pupils toward the nose
};

export const ZERO: Params = {
  lidL: 0, lidR: 0, widen: 0, browL: 0, browR: 0, inner: 0, smile: 0, smirk: 0, jaw: 0, puff: 0, roll: 0, cross: 0,
};

const P = (p: Partial<Params>): Params => ({ ...ZERO, ...p });

export const EXPRESSIONS = {
  neutral: ZERO,
  happy: P({ smile: 0.6, lidL: 0.22, lidR: 0.22, browL: 0.2, browR: 0.2, jaw: 0.15 }),
  surprised: P({ widen: 1, browL: 1, browR: 1, jaw: 0.9, smile: -0.9 }),
  curious: P({ browL: 1, browR: -0.2, widen: 0.35, smirk: 0.6, smile: -0.3, jaw: -0.3, roll: 0.08 }),
  focused: P({ browL: -0.6, browR: -0.6, inner: -1, lidL: 0.35, lidR: 0.35, smile: -1, jaw: -0.45 }),
  playful: P({ lidR: 0.97, smirk: 0.9, browL: 0.55, roll: -0.07, smile: 0.2 }),
  excited: P({ widen: 0.8, browL: 0.9, browR: 0.9, smile: 1, jaw: 0.55 }),
  ouch: P({ lidL: 0.9, lidR: 0.9, inner: -0.8, browL: -0.4, browR: -0.4, smile: -0.8, jaw: 0.2 }),
  shock: P({ widen: 1, browL: 0.85, browR: 0.85, jaw: 0.7, smile: -1 }),
  scared: P({ widen: 1, inner: 1, browL: 0.6, browR: 0.6, smile: -1.2, jaw: 0.45 }),
  sulk: P({ lidL: 0.55, lidR: 0.55, inner: 1, smile: -1.3, jaw: -0.5, roll: 0.06 }),
  puff: P({ puff: 1, lidL: 0.25, lidR: 0.25, smile: -1.1, jaw: -0.5 }),
  laugh: P({ lidL: 0.75, lidR: 0.75, smile: 1, jaw: 0.85, browL: 0.3, browR: 0.3 }),
  sleepy: P({ lidL: 0.74, lidR: 0.8, browL: -0.15, browR: -0.15, smile: -0.5, jaw: -0.3 }),
  asleep: P({ lidL: 1, lidR: 1, smile: -0.6, jaw: -0.2, roll: 0.06 }),
  dizzy: P({ lidL: 0.25, lidR: 0.35, inner: 0.6, smile: -0.7, jaw: 0.2, roll: 0.05 }),
  wink: P({ lidL: 0.97, smile: 0.55, smirk: 0.4, browR: 0.35 }),
  crossed: P({ cross: 1, widen: 0.25, smile: -0.4 }),
  squint: P({ lidL: 0.45, lidR: 0.45, browL: -0.25, browR: -0.25, smirk: 0.3 }),
  grin: P({ smile: 1.2, jaw: 0.35, lidL: 0.15, lidR: 0.15, browL: 0.15, browR: 0.15 }),
  smug: P({ lidL: 0.4, lidR: 0.4, smirk: 1, smile: 0.25, browL: 0.35, browR: 0.05, roll: -0.06 }),
  skeptical: P({ browL: 1, browR: -0.45, lidL: 0.1, lidR: 0.35, smile: -0.4, jaw: -0.3, smirk: -0.3, roll: 0.05 }),
  thinking: P({ browL: 0.8, browR: -0.3, smirk: 0.5, smile: -0.5, jaw: -0.35, roll: 0.08, lidR: 0.2 }),
  love: P({ smile: 0.85, lidL: 0.3, lidR: 0.3, browL: 0.5, browR: 0.5, inner: 0.5, jaw: 0.1, roll: 0.07 }),
  shy: P({ smile: 0.4, lidL: 0.5, lidR: 0.5, browL: 0.3, browR: 0.3, inner: 0.6, roll: 0.1, smirk: 0.2 }),
  proud: P({ lidL: 0.3, lidR: 0.3, smile: 0.7, browL: 0.4, browR: 0.4, roll: -0.05, jaw: -0.15 }),
  mischief: P({ inner: -0.7, browL: 0.45, browR: 0.1, lidL: 0.25, lidR: 0.25, smirk: 1, smile: 0.6, roll: -0.06 }),
  angry: P({ inner: -1, browL: -0.6, browR: -0.6, lidL: 0.3, lidR: 0.3, smile: -1.1, jaw: 0.25 }),
  sad: P({ inner: 1, browL: 0.1, browR: 0.1, lidL: 0.4, lidR: 0.4, smile: -1.1, jaw: -0.2, roll: 0.05 }),
  worried: P({ inner: 1, browL: 0.5, browR: 0.5, widen: 0.25, smile: -0.6, jaw: 0.15 }),
  disgust: P({ lidL: 0.45, lidR: 0.45, inner: -0.4, browL: -0.2, browR: -0.2, smile: -1, smirk: 0.5, jaw: 0.1, roll: 0.05 }),
  bored: P({ lidL: 0.62, lidR: 0.62, browL: -0.1, browR: -0.1, smile: -0.4, jaw: -0.3, roll: 0.04 }),
  awe: P({ widen: 0.7, browL: 0.8, browR: 0.8, inner: 0.3, smile: 0.8, jaw: 0.5 }),
} satisfies Record<string, Params>;

export type ExprName = keyof typeof EXPRESSIONS;

export const HAIR = [
  { name: 'pink', css: '#FF4FA8' },
  { name: 'electric blue', css: '#3B6CFF' },
  { name: 'blonde', css: '#F4C978' },
  { name: 'violet', css: '#8B5CF6' },
  { name: 'teal', css: '#14C8B0' },
  { name: 'copper red', css: '#D2541F' },
  { name: 'silver', css: '#CDD5DE' },
];
/** the beard, mustache and brows take the hair colour a shade deeper */
export const FACE_HAIR_SHADE = 0.8;
export const OWN_FACE_HAIR = '#271A13';
export const OWN_HAIR = '#17110E';
