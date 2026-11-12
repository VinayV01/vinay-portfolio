import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';
import { NAV, PROFILE } from '../data/content';
import { onAnchorClick } from '../lib/scroll';

export function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 240 && y > prev && !open);
    setSolid(y > 40);
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>) => { setOpen(false); onAnchorClick(e); };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        animate={{ y: hidden ? '-110%' : '0%' }}
        transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className={`gutter flex items-center justify-between py-4 transition-[background,backdrop-filter] duration-500 md:py-5 ${solid ? 'bg-ink/70 backdrop-blur-md' : ''}`}
          aria-label="Primary"
        >
          <a href="#top" onClick={go} data-cursor="hover" className="flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.2em] text-mist">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-mist/30 font-display text-[13px] font-extrabold tracking-normal">V</span>
            <span className="hidden sm:inline">Vinay V Nair</span>
          </a>
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={go} data-cursor="hover" className="group relative block overflow-hidden px-4 py-2 font-mono text-[12px] uppercase tracking-[0.2em] text-mist">
                  <span className="block transition-transform duration-500 group-hover:-translate-y-full">{n.label}</span>
                  <span className="absolute inset-x-4 top-full block text-[color:var(--accent)] transition-transform duration-500 group-hover:-translate-y-full">{n.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a
              href={PROFILE.resume}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="rounded-full border border-mist/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-mist transition-colors hover:border-mist hover:bg-mist hover:text-ink sm:text-[12px]"
            >
              Resume
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-mist/30 md:hidden"
            >
              <span className={`absolute h-px w-4 bg-mist transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-1'}`} />
              <span className={`absolute h-px w-4 bg-mist transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-1'}`} />
            </button>
          </div>
        </motion.nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-6 pb-10 pt-28 md:hidden"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
          >
            <ul className="space-y-2">
              {NAV.map((n, i) => (
                <motion.li key={n.href} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.06 }}>
                  <a href={n.href} onClick={go} className="font-display text-[15vw] font-extrabold uppercase leading-[0.95] text-mist">
                    {n.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="space-y-1 font-mono text-xs uppercase tracking-[0.18em] text-muted">
              <a href={`mailto:${PROFILE.email}`} className="block text-mist">{PROFILE.email}</a>
              <p>{PROFILE.location}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
