import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PROFILE } from '../data/content';

const IGNORED = new Set(['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab']);

/**
 * Full-screen welcome gate. Any key press, click or tap dismisses it, and that gesture is also what
 * lets the browser play the spoken intro (Voice listens for the same first gesture).
 */
export function Intro() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (!IGNORED.has(e.key)) close(); };
    addEventListener('keydown', onKey);
    addEventListener('pointerdown', close);
    addEventListener('touchstart', close, { passive: true });
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('pointerdown', close);
      removeEventListener('touchstart', close);
      html.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="intro"
          role="dialog"
          aria-label="Welcome"
          className="fixed inset-0 z-[90] flex cursor-pointer flex-col items-center justify-center bg-ink px-6 text-center"
          exit={{ y: '-100%' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="hero-glow" />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative font-mono text-[11px] uppercase tracking-[0.35em] text-muted sm:text-xs"
          >
            Portfolio
          </motion.p>
          <div className="relative mt-5 overflow-hidden">
            <motion.h1
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ delay: 0.35, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="chrome-text font-display text-[clamp(2.6rem,10vw,8rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]"
            >
              {PROFILE.name}
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="relative mt-4 font-serif text-lg italic text-mist/80 sm:text-2xl"
          >
            {PROFILE.title}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="absolute inset-x-0 bottom-12 flex flex-col items-center gap-4 sm:bottom-16"
          >
            <span className="h-10 w-px bg-gradient-to-b from-transparent to-[color:var(--accent)]" aria-hidden="true" />
            <span className="animate-pulse font-mono text-[11px] uppercase tracking-[0.3em] text-mist sm:text-xs">
              <span className="hidden sm:inline">Press any key to continue</span>
              <span className="sm:hidden">Tap to continue</span>
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
