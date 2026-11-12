import { motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NAV, PROFILE } from '../data/content';
import { Magnet } from '../components/motion';
import { onAnchorClick, scrollToTarget } from '../lib/scroll';

function KochiTime() {
  const fmt = () =>
    new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date());
  const [t, setT] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setT(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return <span>Kochi · {t} IST</span>;
}

const NAME = PROFILE.name.toUpperCase().split('');

export function Footer() {
  return (
    <footer className="sticky bottom-0 z-0 flex min-h-[100svh] flex-col justify-between overflow-hidden bg-ink pt-24 md:min-h-[min(100svh,900px)]">
      <div className="gutter mx-auto grid w-full max-w-[1400px] gap-12 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div>
          <p className="font-serif text-[clamp(1.6rem,2.8vw,2.6rem)] italic leading-tight text-white">
            Thanks for scrolling
            <br />
            all the way down.
          </p>
          <p className="mt-4 max-w-[36ch] text-sm font-light leading-relaxed text-mist/60">
            {PROFILE.title} based in {PROFILE.location}. Open to conversations about new projects and roles.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Index</p>
          <ul className="mt-4 space-y-2">
            {[{ label: 'Home', href: '#top' }, ...NAV].map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={onAnchorClick} data-cursor="hover" className="text-mist/85 transition-colors hover:text-[color:var(--accent)]">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Elsewhere</p>
          <ul className="mt-4 space-y-2">
            <li><a href={`mailto:${PROFILE.email}`} data-cursor="hover" className="break-all text-mist/85 transition-colors hover:text-[color:var(--accent)]">Email</a></li>
            <li><a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" data-cursor="hover" className="text-mist/85 transition-colors hover:text-[color:var(--accent)]">LinkedIn</a></li>
            <li><a href={PROFILE.resume} target="_blank" rel="noopener noreferrer" data-cursor="hover" className="text-mist/85 transition-colors hover:text-[color:var(--accent)]">Resume</a></li>
          </ul>
        </div>
        <Magnet padding={70} strength={2.5}>
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            data-cursor="hover"
            aria-label="Back to top"
            className="group grid h-24 w-24 place-items-center rounded-full border border-mist/25 text-mist transition-colors duration-500 hover:border-transparent hover:bg-[color:var(--accent)] hover:text-ink"
          >
            <ArrowUp size={26} strokeWidth={1.5} className="transition-transform duration-500 group-hover:-translate-y-1" />
          </button>
        </Magnet>
      </div>

      <div>
        <p className="chrome-text font-display select-none whitespace-nowrap px-[1vw] text-center text-[22vw] font-extrabold leading-[0.8] tracking-[0.005em]" aria-label={PROFILE.name}>
          {NAME.map((ch, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="inline-block"
              initial={{ y: '60%', opacity: 0 }}
              whileInView={{ y: '0%', opacity: 1 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.9, delay: i * 0.035, ease: [0.2, 0.75, 0.2, 1] }}
            >
              {ch === ' ' ? ' ' : ch}
            </motion.span>
          ))}
        </p>
        <div className="gutter mt-6 flex flex-col gap-2 border-t border-mist/10 py-6 font-mono text-[10px] uppercase tracking-[0.18em] text-muted sm:flex-row sm:items-center sm:justify-between sm:text-[11px]"
          style={{ borderColor: 'rgba(217,222,228,.1)' }}>
          <span>© {new Date().getFullYear()} {PROFILE.name}</span>
          <KochiTime />
        </div>
      </div>
    </footer>
  );
}
