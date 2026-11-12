import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { HERO_LINES, PROFILE } from '../data/content';
import { FadeIn, Magnet } from '../components/motion';
import { ContactButton, GhostButton } from '../components/ui';
import { LivingPortrait, type LivingPortraitHandle } from '../portrait/LivingPortrait';
import { HAIR } from '../portrait/face';

const SWATCHES = [{ name: 'his own', css: '#2a2522' }, ...HAIR];

function RotatingLine() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % HERO_LINES.length), 3400);
    return () => clearInterval(t);
  }, []);
  const longest = HERO_LINES.reduce((a, b) => (b.length > a.length ? b : a));
  return (
    <span className="relative block overflow-hidden pb-[0.08em]">
      {/* the longest line reserves the space, so nothing is ever cut off */}
      <span className="invisible block" aria-hidden="true">{longest}</span>
      <span className="sr-only">{HERO_LINES.join(' ')}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={i}
          aria-hidden="true"
          className="absolute inset-x-0 top-0 block"
          initial={{ y: '105%' }}
          animate={{ y: '0%' }}
          exit={{ y: '-105%' }}
          transition={{ duration: 0.8, ease: [0.7, 0, 0.2, 1] }}
        >
          {HERO_LINES[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero({ onHair, hair }: { onHair: (i: number) => void; hair: number }) {
  const ref = useRef<HTMLElement>(null);
  const portrait = useRef<LivingPortraitHandle>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const headY = useTransform(scrollYProgress, [0, 1], ['0%', '-45%']);
  const headO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const portraitS = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const portraitY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[max(100svh,640px)] flex-col overflow-hidden" aria-label="Introduction">
      <div className="hero-glow" />
      <div className="hero-grid" />

      {/* meta row */}
      <FadeIn delay={0.1} y={-10} className="gutter relative z-20 flex justify-between pt-20 font-mono text-[10px] uppercase tracking-[0.22em] text-muted sm:pt-24 sm:text-[11px]">
        <span>{PROFILE.title}</span>
        <span>{PROFILE.location}</span>
      </FadeIn>

      {/* name */}
      <motion.div style={{ y: headY, opacity: headO }} className="relative z-0 mt-3 overflow-hidden sm:mt-2">
        <FadeIn delay={0.15} y={40}>
          <h1 className="chrome-text font-display w-full select-none whitespace-nowrap text-center text-[min(23.5vw,62svh)] font-extrabold uppercase leading-[0.8] tracking-[-0.02em]">
            Hi, I&rsquo;m {PROFILE.firstName}
          </h1>
        </FadeIn>
      </motion.div>

      {/* the living portrait */}
      <div className="absolute left-1/2 top-[clamp(120px,17svh,170px)] z-10 w-[118vw] max-w-[540px] -translate-x-1/2 sm:bottom-[-9%] sm:top-auto sm:w-[560px] sm:max-w-none md:w-[640px] lg:w-[clamp(600px,84vh,48vw)]">
        <motion.div style={{ scale: portraitS, y: portraitY }} className="origin-bottom">
          <FadeIn delay={0.6} y={30} duration={1}>
            <LivingPortrait ref={portrait} onHair={onHair} />
          </FadeIn>
        </motion.div>
      </div>

      {/* legibility veil over the fading bust */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[34%] bg-gradient-to-t from-ink via-ink/70 to-transparent" />

      {/* bottom bar */}
      <motion.div className="gutter relative z-20 mt-auto flex flex-col gap-6 pb-7 sm:pb-9 md:flex-row md:items-end md:justify-between md:pb-10">
        <FadeIn delay={0.35} y={20} className="max-w-[640px]">
          <p className="font-serif text-[clamp(1.35rem,2.3vw,2.2rem)] italic leading-tight text-white">
            <RotatingLine />
          </p>
          <p className="mt-3 hidden max-w-[440px] text-[clamp(0.85rem,1.05vw,1rem)] font-light leading-relaxed text-mist/75 min-[400px]:block">
            {PROFILE.title} with {PROFILE.experience} years shipping Django, React and Next.js applications, from database to interface.
          </p>
        </FadeIn>

        <FadeIn delay={0.5} y={20} className="flex flex-col items-start gap-4 md:items-end">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Change his hair colour">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Hair</span>
            {SWATCHES.map((s, i) => {
              const idx = i - 1;
              const active = hair === idx;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => portrait.current?.setHair(idx)}
                  aria-pressed={active}
                  aria-label={`Hair colour: ${s.name}`}
                  data-cursor="hover"
                  className={`h-5 w-5 rounded-full border transition-transform duration-300 hover:scale-125 ${active ? 'scale-110 border-white' : 'border-white/25'}`}
                  style={{ background: s.css, boxShadow: active ? `0 0 0 3px #0B0B0C, 0 0 0 4px ${s.css}` : undefined }}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Magnet padding={40} strength={4}>
              <GhostButton href="#work" className="text-mist">View work</GhostButton>
            </Magnet>
            <Magnet padding={50} strength={3}>
              <ContactButton href="#contact">Contact me</ContactButton>
            </Magnet>
          </div>
        </FadeIn>
      </motion.div>
    </section>
  );
}
