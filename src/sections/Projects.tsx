import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { PROJECTS, type Project } from '../data/content';
import { FadeIn, MaskLines } from '../components/motion';
import { GhostButton, Label, Tag } from '../components/ui';
import { ProjectVisual } from '../components/ProjectVisual';

function Card({ p, i, total, progress }: { p: Project; i: number; total: number; progress: MotionValue<number> }) {
  // card i pins at roughly progress i/(total-1); the next one slides over it until (i+1)/(total-1)
  const pin = i / (total - 1), next = Math.min(1, (i + 1) / (total - 1));
  const target = 1 - (total - 1 - i) * 0.04;
  const scale = useTransform(progress, [pin, 1], [1, target]);
  const dim = useTransform(progress, [pin + (next - pin) * 0.25, next], [0, i === total - 1 ? 0 : 0.5]);

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', String(((e.clientX - r.left) / r.width - 0.5) * 2));
    e.currentTarget.style.setProperty('--my', String(((e.clientY - r.top) / r.height - 0.5) * 2));
  };
  const onLeave = (e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty('--mx', '0');
    e.currentTarget.style.setProperty('--my', '0');
  };

  return (
    <div className="sticky top-20 flex h-[92svh] items-start justify-center md:top-24" style={{ paddingTop: `${i * 22}px` }}>
      <motion.article
        style={{ scale, transformOrigin: 'top center' }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="relative grid h-[calc(92svh-8rem)] max-h-[760px] min-h-[560px] w-full grid-rows-[auto_1fr] gap-6 overflow-hidden rounded-[30px] border border-mist/15 bg-ink2 p-4 sm:p-6 md:grid-cols-[minmax(320px,5fr)_7fr] md:grid-rows-1 md:gap-8 md:rounded-[44px] md:p-8"
        aria-labelledby={`project-${p.n}`}
      >
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <span className="font-display text-[clamp(3.5rem,7vw,6.5rem)] font-extrabold leading-[0.8]" style={{ color: p.accent }}>{p.n}</span>
            <span className="mt-1 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-muted sm:text-[11px]">{p.kind}</span>
          </div>
          <h3 id={`project-${p.n}`} className="font-display mt-6 text-[clamp(1.9rem,3.4vw,3.3rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-white md:mt-10">
            {p.name}
          </h3>
          <p className="mt-4 max-w-[46ch] text-[15px] font-light leading-relaxed text-mist/75">{p.description}</p>
          <ul className="mt-5 hidden flex-wrap gap-x-4 gap-y-2 text-[13px] text-mist/85 sm:flex">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2"><span className="h-1 w-1 rounded-full" style={{ background: p.accent }} />{h}</li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-5 pt-6">
            <div className="flex flex-wrap gap-2 text-mist/70">{p.tech.map((t) => <Tag key={t}>{t}</Tag>)}</div>
            {p.url ? (
              <div><GhostButton href={p.url} className="text-mist" data-cursor="view" aria-label={`Visit ${p.name} (opens in a new tab)`}>Live project</GhostButton></div>
            ) : (
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Not publicly hosted</p>
            )}
          </div>
        </div>
        <div className="relative min-h-0">
          <ProjectVisual project={p} />
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-ink" />
      </motion.article>
    </div>
  );
}

export function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section
      id="work"
      className="gutter relative z-10 -mt-14 rounded-t-[36px] bg-ink pt-24 sm:-mt-16 sm:rounded-t-[48px] sm:pt-28 md:-mt-20 md:rounded-t-[64px] md:pt-36"
      aria-labelledby="work-title"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <FadeIn><Label n="04" className="text-muted">Selected projects</Label></FadeIn>
            <h2 id="work-title" className="chrome-text font-display mt-6 text-[clamp(3.5rem,12vw,11rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.02em]">
              <MaskLines lines={['Selected', 'work']} />
            </h2>
          </div>
          <FadeIn delay={0.15} className="max-w-[380px] text-[15px] font-light leading-relaxed text-mist/70">
            Four builds from the resume: an education platform, a CMS-driven client site, a commercial CRM product and an e-commerce application.
          </FadeIn>
        </div>

        <div ref={ref} className="relative mt-14 md:mt-20">
          {PROJECTS.map((p, i) => (
            <Card key={p.n} p={p} i={i} total={PROJECTS.length} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
