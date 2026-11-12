import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Check, Copy, FileText, Linkedin, Mail, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';
import { PROFILE } from '../data/content';
import { MaskLines, Magnet } from '../components/motion';

export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start start'] });
  const clip = useTransform(scrollYProgress, [0, 1], ['circle(6% at 50% 70%)', 'circle(120% at 50% 70%)']);
  const textY = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      location.href = `mailto:${PROFILE.email}`;
    }
  };

  return (
    <section ref={ref} id="contact" className="relative min-h-[100svh] overflow-hidden bg-ink" aria-labelledby="contact-title">
      <motion.div style={{ clipPath: clip }} className="absolute inset-0 bg-[color:var(--accent)] transition-colors duration-700" aria-hidden="true" />
      <motion.div style={{ y: textY }} className="gutter relative flex min-h-[100svh] flex-col justify-center py-28 text-ink">
        <div className="mx-auto w-full max-w-[1400px]">
          <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] sm:text-xs">
            <span>07</span><span className="h-px w-8 bg-ink/40" /><span>Contact</span>
          </p>
          <p className="mt-8 font-serif text-[clamp(1.8rem,4vw,3.6rem)] italic leading-none">Have a project in mind?</p>
          <h2 id="contact-title" className="font-display mt-4 text-[clamp(3.2rem,10.5vw,10.5rem)] font-extrabold uppercase leading-[0.84] tracking-[-0.025em]">
            <MaskLines lines={['Let’s build', 'something', 'meaningful.']} stagger={0.1} />
          </h2>

          <div className="mt-14 flex flex-col gap-10 md:mt-20 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/60">Write to me</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${PROFILE.email}`}
                  data-portrait-mood="excited"
                  data-cursor="hover"
                  className="group relative font-display text-[clamp(1.5rem,4.2vw,3.6rem)] font-bold lowercase leading-none tracking-[-0.01em]"
                >
                  {PROFILE.email}
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full origin-right scale-x-0 bg-ink transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
                </a>
                <button
                  type="button"
                  onClick={copy}
                  data-cursor="hover"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-[color:var(--accent)]"
                  aria-live="polite"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-3">
                <li>
                  <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" data-cursor="hover"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-transform hover:-translate-y-0.5">
                    <Linkedin size={15} /> LinkedIn <ArrowUpRight size={14} />
                  </a>
                </li>
                <li>
                  <a href={PROFILE.resume} target="_blank" rel="noopener noreferrer" data-cursor="hover"
                    className="inline-flex items-center gap-2 rounded-full border border-ink/30 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-paper">
                    <FileText size={15} /> Resume (PDF)
                  </a>
                </li>
                <li className="inline-flex items-center gap-2 px-2 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/70">
                  <MapPin size={15} /> {PROFILE.location}
                </li>
              </ul>
            </div>

            <Magnet padding={90} strength={2.5} className="self-start md:self-auto">
              <a
                href={`mailto:${PROFILE.email}`}
                data-portrait-mood="excited"
                data-cursor="hover"
                aria-label={`Email ${PROFILE.name}`}
                className="group grid h-36 w-36 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 hover:scale-105 sm:h-44 sm:w-44"
              >
                <span className="flex flex-col items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <Mail size={26} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-rotate-12" />
                  Say hello
                </span>
              </a>
            </Magnet>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
