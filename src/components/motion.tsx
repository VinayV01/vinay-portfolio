import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Fragment, useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from 'react';

const EASE = [0.25, 0.1, 0.25, 1] as const;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMotion = React.ComponentType<any>;
const cache = new Map<ElementType, AnyMotion>();
const motionFor = (as: ElementType): AnyMotion => {
  if (!cache.has(as)) cache.set(as, motion.create(as as string) as AnyMotion);
  return cache.get(as)!;
};

type FadeInProps = {
  children?: ReactNode;
  as?: ElementType;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
};

/** Reveal once when scrolled into view. */
export function FadeIn({ children, as = 'div', delay = 0, duration = 0.7, x = 0, y = 30, className, style, ...rest }: FadeInProps) {
  const M = motionFor(as);
  return (
    <M
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </M>
  );
}

/** Lines that slide up from behind a mask, one after another. */
export function MaskLines({ lines, className = '', lineClass = '', delay = 0, stagger = 0.08 }: {
  lines: ReactNode[];
  className?: string;
  lineClass?: string;
  delay?: number;
  stagger?: number;
}) {
  // The observer sits on the outer span: the lines themselves start clipped by their masks,
  // so they would never count as "in view" on their own.
  return (
    <motion.span className={`block ${className}`} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0 }}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em] -mb-[0.06em]">
          <motion.span
            className={`block ${lineClass}`}
            variants={{ hidden: { y: '110%' }, show: { y: '0%' } }}
            transition={{ duration: 0.9, delay: delay + i * stagger, ease: [0.2, 0.75, 0.2, 1] }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Magnetic pull toward the cursor once it comes within `padding` px of the element. */
export function Magnet({ children, padding = 80, strength = 3, className = '' }: {
  children: ReactNode;
  padding?: number;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia('(pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let active = false, raf = 0, ex = 0, ey = 0;
    const apply = () => {
      raf = 0;
      el.style.transform = active ? `translate3d(${ex / strength}px, ${ey / strength}px, 0)` : 'translate3d(0,0,0)';
      el.style.transition = active ? 'transform 0.3s ease-out' : 'transform 0.6s ease-in-out';
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const near = Math.abs(e.clientX - cx) < r.width / 2 + padding && Math.abs(e.clientY - cy) < r.height / 2 + padding;
      if (near) { active = true; ex = e.clientX - cx; ey = e.clientY - cy; }
      else if (active) { active = false; }
      else return;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    addEventListener('pointermove', onMove, { passive: true });
    return () => { removeEventListener('pointermove', onMove); cancelAnimationFrame(raf); };
  }, [padding, strength]);
  return (
    <div ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </div>
  );
}

function Char({ ch, progress, range }: { ch: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <span className="relative">
      <span className="invisible">{ch}</span>
      <motion.span className="absolute left-0 top-0" style={{ opacity }}>{ch}</motion.span>
    </span>
  );
}

/** Character-by-character scroll reveal; words never break mid-word. */
export function AnimatedText({ text, className = '', as: Tag = 'p' }: { text: string; className?: string; as?: ElementType }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.35'] });
  const words = text.split(' ');
  const total = text.length;
  let i = 0;
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, wi) => {
        const start = i;
        i += w.length + 1;
        return (
          <Fragment key={wi}>
            <span className="inline-block whitespace-nowrap" aria-hidden="true">
              {w.split('').map((c, ci) => {
                const p = (start + ci) / total;
                return <Char key={ci} ch={c} progress={scrollYProgress} range={[p, Math.min(1, p + 1.5 / words.length)]} />;
              })}
            </span>{' '}
          </Fragment>
        );
      })}
    </Tag>
  );
}
