import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Briefcase, Database, Layers, MonitorSmartphone, Server } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CAPABILITIES } from '../data/content';
import { FadeIn, MaskLines } from '../components/motion';
import { Label } from '../components/ui';
import { useMedia } from '../lib/hooks';

const ICONS = [Layers, Server, MonitorSmartphone, Database, Briefcase];

function Panel({ c, i }: { c: (typeof CAPABILITIES)[number]; i: number }) {
  const Icon = ICONS[i];
  return (
    <article className="group relative flex h-full w-full flex-col justify-between overflow-hidden rounded-[30px] border border-mist/12 bg-ink2 p-7 sm:p-10 md:w-[min(62vw,760px)] md:shrink-0 md:rounded-[40px]"
      style={{ borderColor: 'rgba(217,222,228,.12)' }}>
      <Icon aria-hidden="true" strokeWidth={0.6} className="pointer-events-none absolute -right-[6%] top-1/2 h-[62%] w-auto -translate-y-1/2 text-mist opacity-[0.06] transition-[color,transform,opacity] duration-700 group-hover:-rotate-6 group-hover:text-[color:var(--accent)] group-hover:opacity-20" />
      <div className="relative flex items-start justify-between">
        <span className="outline-text font-display text-[clamp(5rem,11vw,10rem)] font-extrabold leading-[0.75] text-mist/40 transition-colors duration-500 group-hover:text-[color:var(--accent)]">
          {c.n}
        </span>
        <Icon className="h-10 w-10 text-[color:var(--accent)] transition-transform duration-700 group-hover:rotate-12 md:h-14 md:w-14" strokeWidth={1.2} />
      </div>
      <div className="relative mt-16 md:mt-0">
        <h3 className="font-display text-[clamp(2.1rem,4vw,4rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.01em] text-white">{c.title}</h3>
        <p className="mt-5 max-w-[48ch] text-[clamp(0.95rem,1.2vw,1.12rem)] font-light leading-relaxed text-mist/75">{c.body}</p>
        <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-mist/12 pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-mist/60" style={{ borderColor: 'rgba(217,222,228,.12)' }}>
          {c.tools.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </article>
  );
}

function Intro() {
  return (
    <div className="flex flex-col justify-between md:h-full md:w-[min(38vw,520px)] md:shrink-0 md:pr-6">
      <div>
        <FadeIn><Label n="05" className="text-muted">What I do</Label></FadeIn>
        <h2 id="cap-title" className="font-display mt-6 text-[clamp(3.2rem,7.4vw,7.6rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.02em] text-white">
          <MaskLines lines={['Database', 'to', 'interface']} />
        </h2>
      </div>
      <FadeIn delay={0.2} className="mt-8 max-w-[34ch] font-serif text-[clamp(1.3rem,2vw,1.9rem)] italic leading-snug text-mist/80">
        Five kinds of work, one habit: understand the business problem first, then build the whole path through the stack.
      </FadeIn>
    </div>
  );
}

export function Capabilities() {
  const desktop = useMedia('(min-width: 768px)');
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!desktop || !track.current) return;
    const measure = () => setDistance(Math.max(0, (track.current?.scrollWidth ?? 0) - innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    addEventListener('resize', measure);
    return () => { ro.disconnect(); removeEventListener('resize', measure); };
  }, [desktop]);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.4 });
  const x = useTransform(reduced ? scrollYProgress : smooth, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (!desktop) {
    return (
      <section className="gutter relative bg-ink py-24" aria-labelledby="cap-title">
        <Intro />
        <div className="mt-14 space-y-4">
          {CAPABILITIES.map((c, i) => (
            <FadeIn key={c.n} delay={0.05}><Panel c={c} i={i} /></FadeIn>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={section} className="relative bg-ink" style={{ height: `calc(100vh + ${distance}px)` }} aria-labelledby="cap-title">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={track} style={{ x }} className="gutter flex h-[min(72vh,640px)] w-max items-stretch gap-5 will-change-transform">
          <Intro />
          {CAPABILITIES.map((c, i) => <Panel key={c.n} c={c} i={i} />)}
          <div className="w-[8vw] shrink-0" aria-hidden="true" />
        </motion.div>
        <div className="gutter absolute inset-x-0 bottom-8 flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span>Scroll</span>
          <span className="relative h-px flex-1 bg-mist/15">
            <motion.span style={{ scaleX: bar }} className="absolute inset-0 origin-left bg-[color:var(--accent)]" />
          </span>
          <span>{String(CAPABILITIES.length).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  );
}
