import { motion, useScroll, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { EXPERIENCE } from '../data/content';
import { FadeIn, MaskLines } from '../components/motion';
import { Label, Tag } from '../components/ui';

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.7', 'end 0.6'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section id="experience" className="gutter relative bg-paper pb-36 pt-10 text-ink sm:pb-44 md:pb-56" aria-labelledby="exp-title">
      <div className="mx-auto max-w-[1400px]">
        <FadeIn><Label n="03" className="text-ink/60">Experience</Label></FadeIn>
        <h2 id="exp-title" className="font-display mt-6 text-[clamp(3.5rem,12vw,11rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.02em]">
          <MaskLines lines={['Where I’ve', 'worked']} />
        </h2>

        <div ref={ref} className="relative mt-20 md:mt-28">
          {/* the spine */}
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-ink/15 md:left-[calc(33.333%-0.5px)]" aria-hidden="true">
            <motion.div style={{ scaleY: line }} className="h-full w-full origin-top bg-ink" />
          </div>

          <ol className="space-y-24 md:space-y-36">
            {EXPERIENCE.map((job, i) => (
              <li key={job.company} className="relative grid gap-8 pl-10 md:grid-cols-3 md:gap-0 md:pl-0">
                <span
                  className="absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 border-ink bg-paper md:left-[calc(33.333%-7.5px)]"
                  aria-hidden="true"
                >
                  <span className="absolute inset-[3px] rounded-full bg-[color:var(--accent)] transition-colors duration-700" />
                </span>

                <div className="md:sticky md:top-28 md:self-start md:pr-14">
                  <FadeIn>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/55">{job.period}</p>
                    <p className="font-display mt-3 text-[clamp(4rem,8vw,7.5rem)] font-extrabold leading-[0.8] text-ink/[0.08]">
                      {job.start}
                    </p>
                  </FadeIn>
                </div>

                <div className="md:col-span-2 md:pl-14">
                  <FadeIn>
                    <h3 className="font-display text-[clamp(2.2rem,4.6vw,4.2rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.01em]">
                      {job.company}
                    </h3>
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[clamp(1rem,1.4vw,1.25rem)]">
                      <span className="font-serif text-[1.25em] italic">{job.role}</span>
                      <span className="text-ink/30">/</span>
                      <span className="font-light text-ink/60">{job.place}</span>
                    </p>
                  </FadeIn>

                  <ul className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2">
                    {job.points.map((p, k) => (
                      <motion.li
                        key={k}
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: (k % 2) * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                        className="flex gap-4 border-t border-ink/12 pt-4 text-[15px] font-light leading-relaxed text-ink/80"
                        style={{ borderColor: 'rgba(11,11,12,.12)' }}
                      >
                        <span className="pt-1 font-mono text-[10px] text-ink/40">{String(k + 1).padStart(2, '0')}</span>
                        <span>{p}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <FadeIn delay={0.1} className="mt-10 flex flex-wrap gap-2 text-ink/70">
                    {job.stack.map((s) => <Tag key={s}>{s}</Tag>)}
                  </FadeIn>
                </div>
                {i < EXPERIENCE.length - 1 && <span className="sr-only">Previously:</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
