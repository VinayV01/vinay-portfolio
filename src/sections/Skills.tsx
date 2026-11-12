import { motion } from 'framer-motion';
import { useState } from 'react';
import { SKILLS } from '../data/content';
import { FadeIn, MaskLines } from '../components/motion';
import { Label } from '../components/ui';

const WORDS = SKILLS.flatMap((g) => g.items.map((w) => ({ w, g: g.id })));

export function Skills() {
  const [active, setActive] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const current = active ?? locked;
  const group = SKILLS.find((g) => g.id === current);

  return (
    <section
      id="skills"
      className="gutter relative z-10 rounded-t-[36px] bg-paper py-24 text-ink sm:rounded-t-[48px] sm:py-28 md:rounded-t-[64px] md:py-36"
      aria-labelledby="skills-title"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <FadeIn><Label n="02" className="text-ink/60">Technical skills</Label></FadeIn>
            <h2 id="skills-title" className="font-display mt-6 text-[clamp(3.5rem,12vw,11rem)] font-extrabold uppercase leading-[0.82] tracking-[-0.02em]">
              <MaskLines lines={['Toolkit']} />
            </h2>
          </div>
          <FadeIn delay={0.15} className="max-w-[360px] text-[15px] font-light leading-relaxed text-ink/70">
            The tools I use in production work, grouped the way they show up in a project. Pick a group to see where each one fits.
          </FadeIn>
        </div>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-[minmax(240px,1fr)_3fr] md:gap-16">
          <ul className="flex flex-wrap gap-2 md:sticky md:top-28 md:block md:space-y-1 md:self-start" aria-label="Skill groups">
            {SKILLS.map((g) => {
              const on = current === g.id;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    data-cursor="hover"
                    aria-pressed={locked === g.id}
                    data-voice={`These are my ${g.label.toLowerCase()} skills: ${g.items.join(", ")}.`}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(g.id)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(g.id)}
                    onBlur={() => setActive(null)}
                    onClick={() => setLocked((l) => (l === g.id ? null : g.id))}
                    className={`group flex w-full items-center justify-between gap-4 rounded-full border px-4 py-2 text-left transition-colors duration-300 md:rounded-none md:border-0 md:border-b md:px-0 md:py-3 ${
                      on ? 'border-ink bg-ink text-paper md:bg-transparent md:text-ink' : 'border-ink/15 text-ink/70 md:border-ink/15'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-sm font-medium md:text-[15px]">
                      <span className={`hidden h-2 w-2 rounded-full transition-all duration-300 md:block ${on ? 'scale-100 bg-[color:var(--accent)]' : 'scale-0 bg-ink'}`} />
                      {g.label}
                    </span>
                    <span className="font-mono text-[11px] opacity-60">{String(g.items.length).padStart(2, '0')}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div>
            <p className="flex flex-wrap items-baseline gap-x-[0.38em] gap-y-1 font-display text-[clamp(2rem,5.4vw,5.4rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.015em]">
              {WORDS.map(({ w, g }, i) => {
                const lit = !current || current === g;
                return (
                  <motion.span
                    key={w}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.6, delay: i * 0.025, ease: [0.25, 0.1, 0.25, 1] }}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(g)}
                    onPointerLeave={() => setActive(null)}
                    className="cursor-default"
                  >
                    <span
                      className="inline-block transition-[color,transform] duration-500"
                      style={{
                        color: lit ? (current ? '#0B0B0C' : 'rgba(11,11,12,.88)') : 'rgba(11,11,12,.12)',
                        transform: current === g ? 'translateY(-0.04em)' : undefined,
                      }}
                    >
                      {w}
                    </span>
                    {i < WORDS.length - 1 && <span className="text-[color:var(--accent)] opacity-60" aria-hidden="true">,</span>}
                  </motion.span>
                );
              })}
            </p>
            <div className="mt-10 h-6 font-mono text-xs uppercase tracking-[0.2em] text-ink/60" aria-live="polite">
              {group ? `${group.label} · ${group.items.join(' / ')}` : `${WORDS.length} tools across ${SKILLS.length} groups`}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
