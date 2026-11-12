import {
  motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, useVelocity,
} from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { MARQUEE_PRIMARY, MARQUEE_SECONDARY } from '../data/content';

const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function Row({ children, speed, className = '' }: { children: ReactNode; speed: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '200px' });
  const reduced = useReducedMotion();
  const base = useMotionValue(0);
  const { scrollY } = useScroll();
  const vel = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(vel, [-1000, 0, 1000], [-3, 0, 3], { clamp: false });
  const x = useTransform(base, (v) => `${wrap(-25, 0, v)}%`);
  const dir = useRef(1);

  useAnimationFrame((_, delta) => {
    if (!inView || reduced) return;
    const f = factor.get();
    if (f < 0) dir.current = -1; else if (f > 0) dir.current = 1;
    base.set(base.get() + dir.current * speed * (delta / 1000) * (1 + Math.abs(f)));
  });

  return (
    <div ref={ref} className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div className="flex shrink-0 will-change-transform" style={{ x }}>
        {[0, 1, 2, 3].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k > 0}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

const Star = () => (
  <svg viewBox="0 0 24 24" className="mx-[0.35em] h-[0.42em] w-[0.42em] shrink-0 fill-[color:var(--accent)] transition-[fill] duration-700" aria-hidden="true">
    <path d="M12 0c.9 6.6 5.4 11.1 12 12-6.6.9-11.1 5.4-12 12-.9-6.6-5.4-11.1-12-12C6.6 11.1 11.1 6.6 12 0z" />
  </svg>
);

export function MarqueeSection() {
  return (
    <section className="relative overflow-hidden pb-16 pt-24 sm:pt-32 md:pb-24 md:pt-40" aria-label="Technologies">
      <h2 className="sr-only">Technologies I work with</h2>
      <Row speed={-1.6} className="font-display text-[clamp(3.2rem,9vw,9.5rem)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em]">
        {MARQUEE_PRIMARY.map((w, i) => (
          <span key={w} className="flex items-center">
            <span className={i % 2 ? 'outline-text text-mist/70' : 'chrome-text'}>{w}</span>
            <Star />
          </span>
        ))}
      </Row>
      <div className="relative mt-6 -rotate-[2deg] scale-[1.04] bg-[color:var(--accent)] py-3 text-ink transition-colors duration-700 sm:py-4">
        <Row speed={1.2} className="font-mono text-[clamp(0.8rem,1.4vw,1.15rem)] font-medium uppercase tracking-[0.2em]">
          {MARQUEE_SECONDARY.map((w) => (
            <span key={w} className="flex items-center">
              <span className="px-5">{w}</span>
              <span aria-hidden="true">/</span>
            </span>
          ))}
        </Row>
      </div>
    </section>
  );
}
