import { MARQUEE_PRIMARY, MARQUEE_SECONDARY } from '../data/content';

const Spark = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`fill-[color:var(--accent)] transition-[fill] duration-700 ${className}`} aria-hidden="true">
    <path d="M12 0c.9 6.6 5.4 11.1 12 12-6.6.9-11.1 5.4-12 12-.9-6.6-5.4-11.1-12-12C6.6 11.1 11.1 6.6 12 0z" />
  </svg>
);

function Track({ items, reverse = false, duration, variant }: {
  items: string[];
  reverse?: boolean;
  duration: number;
  variant: 'primary' | 'secondary';
}) {
  const primary = variant === 'primary';
  return (
    <div className="chip-mask flex overflow-hidden py-1">
      <div
        className="chip-track flex shrink-0"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {[0, 1].map((k) => (
          <ul key={k} className={`flex shrink-0 items-center ${primary ? 'gap-4 pr-4' : 'gap-8 pr-8'}`} aria-hidden={k > 0}>
            {[...items, ...items].map((w, i) =>
              primary ? (
                <li
                  key={`${w}-${i}`}
                  className="chip-card group flex items-center gap-3 rounded-full px-6 py-3 sm:px-8 sm:py-4"
                >
                  <Spark className="h-3 w-3 shrink-0 transition-transform duration-500 group-hover:rotate-90" />
                  <span className="font-display text-xl font-extrabold uppercase leading-none tracking-[0.04em] text-[#eef3f7] sm:text-3xl">
                    {w}
                  </span>
                </li>
              ) : (
                <li
                  key={`${w}-${i}`}
                  className="flex items-center gap-8 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-mist/60 transition-colors duration-300 hover:text-[#eef3f7] sm:text-xs"
                >
                  {w}
                  <span className="h-1 w-1 rotate-45 bg-[color:var(--accent)] transition-colors duration-700" aria-hidden="true" />
                </li>
              ),
            )}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function MarqueeSection() {
  return (
    <section className="relative pb-0 pt-6 sm:pt-10" aria-label="Technologies">
      <h2 className="sr-only">Technologies I work with</h2>
      <div className="flex flex-col gap-5 border-y border-white/10 py-6 sm:gap-6 sm:py-8">
        <Track items={MARQUEE_PRIMARY} duration={45} variant="primary" />
        <Track items={MARQUEE_SECONDARY} duration={60} variant="secondary" reverse />
      </div>
    </section>
  );
}
