import { motion } from 'framer-motion';
import { ABOUT_FACTS, ABOUT_POINTS, ABOUT_STATEMENT } from '../data/content';
import { AnimatedText, FadeIn } from '../components/motion';
import { Label } from '../components/ui';

export function About() {
  return (
    <section id="about" className="gutter relative pb-24 pt-14 sm:pb-32 sm:pt-20 md:pb-40 md:pt-24" aria-labelledby="about-title">
      <div className="mx-auto max-w-[1400px]">
        <FadeIn><Label n="01" className="text-muted">About</Label></FadeIn>
        <h2 id="about-title" className="sr-only">About Vinay</h2>

        <AnimatedText
          text={ABOUT_STATEMENT}
          className="font-wide mt-10 max-w-[1180px] text-[clamp(1.55rem,3.5vw,3.4rem)] font-medium leading-[1.12] tracking-[-0.015em] text-white md:mt-14"
        />

        <div className="mt-20 grid gap-px overflow-hidden rounded-[28px] bg-mist/10 md:mt-28 md:grid-cols-3">
          {ABOUT_FACTS.map((f, i) => (
            <FadeIn key={f.k} delay={i * 0.1} className="group relative bg-ink p-7 sm:p-9">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{f.k}</p>
              <p className="font-display mt-6 text-[clamp(2.2rem,4vw,3.6rem)] font-extrabold uppercase leading-none text-mist transition-colors duration-500 group-hover:text-[color:var(--accent)]">
                {f.v}
              </p>
              <p className="mt-4 text-sm font-light text-mist/60">{f.d}</p>
            </FadeIn>
          ))}
        </div>

        <div className="mt-24 grid gap-10 md:mt-32 md:grid-cols-[1fr_2fr] md:gap-16">
          <FadeIn>
            <p className="font-serif text-[clamp(2rem,3.6vw,3.4rem)] italic leading-[1.05] text-white">
              Day to day,
              <br />
              <span className="text-[color:var(--accent)] transition-colors duration-700">that means…</span>
            </p>
          </FadeIn>
          <ul className="border-t border-mist/15">
            {ABOUT_POINTS.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
                className="group flex items-baseline gap-6 border-b border-mist/15 py-5 sm:py-6"
              >
                <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[clamp(1.05rem,1.6vw,1.45rem)] font-light text-mist transition-transform duration-500 group-hover:translate-x-2">
                  {p}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
