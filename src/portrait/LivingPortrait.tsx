import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { PortraitHandle } from './character';
import { HAIR } from './face';

// a still render of the 3D character, shown until the live model is ready (and if WebGL is unavailable)
const POSTER_URL = '/portrait/vinay-3d.webp';
const HAIR_KEY = 'vvn-hair';

type Props = {
  onHair?: (index: number) => void;
  className?: string;
};

export type LivingPortraitHandle = { setHair: (index: number) => void };

function readHair(): number {
  try {
    const raw = localStorage.getItem(HAIR_KEY);
    const v = raw === null ? -1 : Number(raw);
    return Number.isInteger(v) && v >= 0 && v < HAIR.length ? v : -1;
  } catch {
    return -1;
  }
}
function saveHair(i: number) {
  try { localStorage.setItem(HAIR_KEY, String(i)); } catch { /* storage unavailable */ }
}

export const LivingPortrait = forwardRef<LivingPortraitHandle, Props>(function LivingPortrait({ onHair, className = '' }, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const fly = useRef<SVGSVGElement>(null);
  const hand = useRef<SVGSVGElement>(null);
  const fx = useRef<HTMLDivElement>(null);
  const engine = useRef<PortraitHandle | null>(null);
  const [mode, setMode] = useState<'loading' | 'live' | 'static'>('loading');
  const [hint, setHint] = useState(true);
  const onHairRef = useRef(onHair);
  onHairRef.current = onHair;

  useImperativeHandle(ref, () => ({
    setHair: (i: number) => {
      if (engine.current) engine.current.setHair(i);
      else { saveHair(i); onHairRef.current?.(i); }
    },
  }), []);

  useEffect(() => {
    const initial = readHair();
    onHairRef.current?.(initial);
    const els = { wrap: wrap.current, canvas: canvas.current, fallback: img.current, fly: fly.current, hand: hand.current, fx: fx.current };
    if (Object.values(els).some((v) => !v)) return;
    let handle: PortraitHandle | null = null, cancelled = false;
    // three.js loads after the page is up, so the hero never waits on it
    import('./character').then(({ createCharacter }) => {
      if (cancelled) return;
      handle = createCharacter(els as Parameters<typeof createCharacter>[0], {
        initialHair: initial,
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        onReady: () => setMode('live'),
        onInteract: () => setHint(false),
        onHair: (i) => { saveHair(i); onHairRef.current?.(i); },
      });
      engine.current = handle;
      if (!handle) setMode('static');
    }).catch(() => setMode('static'));
    return () => { cancelled = true; handle?.destroy(); engine.current = null; };
  }, []);

  return (
    <div ref={wrap} className={`portrait-wrap ${mode === 'static' ? 'is-static' : ''} ${className}`}>
      <div className="portrait-inner">
        <img ref={img} src={POSTER_URL} alt="3D character of Vinay V Nair" width={1024} height={1024} draggable={false} />
        <canvas ref={canvas} className="portrait-gl" aria-hidden="true" />
        <div className="portrait-props" aria-hidden="true">
          <svg ref={fly} className="portrait-fly" viewBox="0 0 32 32">
            <path className="wing" d="M15 15C12 9.5 4.5 8.5 2 13c2.5 4.5 10 4.5 13 2z" />
            <path className="wing r" d="M17 15c3-5.5 10.5-6.5 13-2-2.5 4.5-10 4.5-13 2z" />
            <ellipse cx="16" cy="19.5" rx="4" ry="6.5" />
            <circle cx="16" cy="11.5" r="3.3" />
          </svg>
          <svg ref={hand} className="portrait-hand" viewBox="0 0 32 32">
            <path className="open" d="M10.5 16.5V8.2a1.8 1.8 0 0 1 3.6 0V14v-8a1.8 1.8 0 0 1 3.6 0V14 7a1.8 1.8 0 0 1 3.6 0v8-5a1.8 1.8 0 0 1 3.6 0v10.5c0 5-3.4 8.5-8.4 8.5-3.6 0-5.7-1.6-7.6-4.6l-3.5-5.6c-.6-1 .1-2.2 1.2-2.4 1-.2 1.9.2 2.6 1z" />
            <path className="grab" d="M10.5 17v-3.3a1.8 1.8 0 0 1 3.6 0V14v-1.8a1.8 1.8 0 0 1 3.6 0V14v-1.3a1.8 1.8 0 0 1 3.6 0V14v-.3a1.8 1.8 0 0 1 3.6 0v6.8c0 5-3.4 8.5-8.4 8.5-3.6 0-5.7-1.6-7.6-4.6l-2.3-3.7c-.6-1 .1-2.2 1.2-2.4 1-.2 1.9.2 2.7 1z" />
          </svg>
          <div ref={fx} className="portrait-fx" />
        </div>
      </div>
      {mode === 'live' && (
        <p className={`portrait-hint ${hint ? '' : 'is-gone'}`} aria-hidden="true">
          <span>drag me</span>
          <span className="dot" />
          <span>tap my hair</span>
        </p>
      )}
    </div>
  );
});
