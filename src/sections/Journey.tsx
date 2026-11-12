import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { CERTIFICATIONS, JOURNEY } from '../data/content';
import { FadeIn } from '../components/motion';
import { Label } from '../components/ui';

export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [i, setI] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setI(Math.min(JOURNEY.length - 1, Math.max(0, Math.floor(v * JOURNEY.length * 0.999)))));
  const glowX = useTransform(scrollYProgress, [0, 1], ['15%', '85%']);
  const m = JOURNEY[i];

  return (
    <>
      <section ref={ref} className="relative bg-ink" style={{ height: `${JOURNEY.length * 85 + 15}vh` }} aria-labelledby="journey-title">
        <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{ background: useTransform(glowX, (x) => `radial-gradient(40% 50% at ${x} 60%, color-mix(in srgb, var(--accent) 16%, transparent), transparent 70%)`) }}
          />
          <div className="gutter relative flex items-end justify-between pt-24 md:pt-28">
            <div>
              <Label n="06" className="text-muted">Journey</Label>
              <h2 id="journey-title" className="font-display mt-4 text-[clamp(2rem,4vw,3.6rem)] font-extrabold uppercase leading-[0.9] text-white">
                How I got here
              </h2>
            </div>
            <ol className="hidden gap-2 md:flex" aria-label="Milestones">
              {JOURNEY.map((j, k) => (
                <li key={j.year} className={`rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.12em] transition-colors duration-500 ${k === i ? 'border-[color:var(--accent)] text-white' : 'border-mist/15 text-muted'}`}>
                  {j.year}
                </li>
              ))}
            </ol>
          </div>

          <div className="gutter relative grid flex-1 items-center gap-6 md:grid-cols-[1.35fr_1fr] md:gap-10">
            <div className="relative overflow-hidden" aria-hidden="true">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={m.year}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.7, 0, 0.2, 1] }}
                  className="chrome-text font-display text-[clamp(7rem,27vw,26rem)] font-extrabold leading-[0.78] tracking-[-0.04em]"
                >
                  {m.year}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="relative min-h-[220px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--accent)]">
                    {String(i + 1).padStart(2, '0')} / {String(JOURNEY.length).padStart(2, '0')}
                  </p>
                  <h3 className="font-display mt-4 text-[clamp(1.8rem,3.2vw,3rem)] font-extrabold uppercase leading-[0.95] text-white">{m.title}</h3>
                  <p className="mt-3 font-serif text-[clamp(1.2rem,1.7vw,1.6rem)] italic text-mist/85">{m.place}</p>
                  <p className="mt-5 max-w-[40ch] text-[15px] font-light leading-relaxed text-mist/65">{m.note}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="gutter relative pb-8">
            <div className="flex gap-2">
              {JOURNEY.map((j, k) => (
                <span key={j.year} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-mist/12" style={{ background: 'rgba(217,222,228,.12)' }}>
                  <motion.span
                    className="absolute inset-0 origin-left bg-[color:var(--accent)]"
                    style={{ scaleX: useTransform(scrollYProgress, [k / JOURNEY.length, (k + 1) / JOURNEY.length], [0, 1]) }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="gutter relative bg-ink pb-28 pt-10 md:pb-36" aria-label="Certifications">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-6 border-t border-mist/12 pt-10 md:flex-row md:items-baseline md:justify-between"
          style={{ borderColor: 'rgba(217,222,228,.12)' }}>
          <FadeIn><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Certifications · Coursera</p></FadeIn>
          <ul className="flex flex-col gap-3 md:flex-row md:gap-10">
            {CERTIFICATIONS.map((c, k) => (
              <FadeIn as="li" key={c} delay={k * 0.08} className="text-[15px] font-light text-mist/80">{c}</FadeIn>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
