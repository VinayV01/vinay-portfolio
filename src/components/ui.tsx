import { ArrowUpRight } from 'lucide-react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { onAnchorClick } from '../lib/scroll';

type AProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode };

/** Primary pill. Hovering it makes the portrait light up. */
export function ContactButton({ children = 'Contact me', className = '', href = '#contact', ...rest }: Partial<AProps>) {
  const external = href.startsWith('mailto:') || href.startsWith('http');
  return (
    <a
      href={href}
      onClick={external ? undefined : onAnchorClick}
      data-portrait-mood="excited"
      data-cursor="hover"
      className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-7 py-3.5 font-mono text-[12px] font-medium uppercase tracking-[0.16em] text-ink sm:px-9 sm:py-4 sm:text-[13px] ${className}`}
      style={{
        background: 'linear-gradient(120deg, #FFB37A 0%, var(--accent) 45%, #FF2E6E 100%)',
        boxShadow: '0 10px 40px -12px color-mix(in srgb, var(--accent) 70%, transparent), inset 0 1px 0 rgba(255,255,255,.45)',
        transition: 'background 0.8s',
      }}
      {...rest}
    >
      <span className="absolute inset-0 -translate-x-full bg-white/30 transition-transform duration-700 ease-out group-hover:translate-x-0" />
      <span className="relative">{children}</span>
      <span className="relative grid h-6 w-6 place-items-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:rotate-45">
        <ArrowUpRight size={14} strokeWidth={2.2} />
      </span>
    </a>
  );
}

/** Outline pill for secondary actions and live project links. */
export function GhostButton({ children, className = '', href = '#', ...rest }: AProps) {
  const external = href.startsWith('http') || href.endsWith('.pdf');
  return (
    <a
      href={href}
      onClick={external ? undefined : onAnchorClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      data-cursor="hover"
      className={`group inline-flex items-center gap-2 rounded-full border border-current px-6 py-3 font-mono text-[12px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 hover:bg-[color:var(--mist)] hover:text-ink sm:px-7 sm:text-[13px] ${className}`}
      {...rest}
    >
      {children}
      <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

export function Label({ n, children, className = '' }: { n?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] sm:text-xs ${className}`}>
      {n && <span className="text-[color:var(--accent)]">{n}</span>}
      <span className="h-px w-8 bg-current opacity-40" />
      <span>{children}</span>
    </p>
  );
}

export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${className}`}
      style={{ borderColor: 'color-mix(in srgb, currentColor 25%, transparent)' }}
    >
      {children}
    </span>
  );
}
