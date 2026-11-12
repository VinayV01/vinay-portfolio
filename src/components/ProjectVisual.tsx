import type { CSSProperties, ReactNode } from 'react';
import type { Project } from '../data/content';

// Designed illustrations of each product's shape, not screenshots. Layers drift with the pointer
// through --mx/--my set on the card.

const layer = (depth: number): CSSProperties => ({
  transform: `translate3d(calc(var(--mx, 0) * ${depth}px), calc(var(--my, 0) * ${depth}px), 0)`,
  transition: 'transform 0.6s cubic-bezier(.2,.7,.2,1)',
});

function Window({ url, children, className = '', style }: { url: string; children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-white/10 bg-[#111113] shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)] ${className}`} style={style}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-3 truncate rounded-full bg-white/5 px-3 py-0.5 font-mono text-[9px] text-white/45">{url}</span>
      </div>
      {children}
    </div>
  );
}

const Bar = ({ w, c = 'rgba(255,255,255,.12)', h = 6 }: { w: string; c?: string; h?: number }) => (
  <span className="block rounded-full" style={{ width: w, height: h, background: c }} />
);

function Academy({ a }: { a: string }) {
  return (
    <>
      <Window url="voleergoacademy.com" className="absolute left-[6%] top-[10%] w-[78%]" style={layer(10)}>
        <div className="flex">
          <div className="hidden w-[22%] space-y-3 border-r border-white/10 p-4 sm:block">
            <span className="block h-6 w-6 rounded-lg" style={{ background: a }} />
            {[70, 55, 62, 48].map((w, i) => <Bar key={i} w={`${w}%`} c={i === 1 ? a : undefined} />)}
          </div>
          <div className="flex-1 space-y-4 p-4 sm:p-5">
            <Bar w="38%" h={10} c="rgba(255,255,255,.35)" />
            <div className="grid grid-cols-3 gap-3">
              {[0.75, 0.4, 0.9].map((p, i) => (
                <div key={i} className="space-y-2 rounded-xl bg-white/[.04] p-3">
                  <span className="block aspect-[4/3] rounded-lg" style={{ background: `linear-gradient(135deg, ${a}${i === 0 ? '' : '55'}, transparent)` }} />
                  <Bar w="80%" />
                  <span className="block h-1 rounded-full bg-white/10"><span className="block h-full rounded-full" style={{ width: `${p * 100}%`, background: a }} /></span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[2fr_1fr] gap-3">
              <div className="flex h-20 items-end gap-1.5 rounded-xl bg-white/[.04] p-3">
                {[40, 65, 50, 80, 58, 90, 70].map((h, i) => <span key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 5 ? a : 'rgba(255,255,255,.14)' }} />)}
              </div>
              <div className="grid place-items-center rounded-xl bg-white/[.04]">
                <span className="h-12 w-12 rounded-full" style={{ background: `conic-gradient(${a} 0 72%, rgba(255,255,255,.1) 0)`, mask: 'radial-gradient(circle, transparent 52%, #000 53%)', WebkitMask: 'radial-gradient(circle, transparent 52%, #000 53%)' }} />
              </div>
            </div>
          </div>
        </div>
      </Window>
      <div className="absolute bottom-[12%] right-[6%] rounded-2xl border border-white/10 bg-[#161618] p-4 shadow-2xl" style={layer(26)}>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Enrollment</p>
        <p className="mt-2 flex items-center gap-2 text-sm text-white"><span className="grid h-5 w-5 place-items-center rounded-full text-[11px] text-ink" style={{ background: a }}>✓</span>Course joined</p>
      </div>
      <div className="absolute left-[3%] bottom-[18%] rounded-full border border-white/10 bg-[#161618] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 shadow-2xl" style={layer(18)}>
        Sign in · Auth
      </div>
    </>
  );
}

function Sports({ a }: { a: string }) {
  return (
    <>
      <Window url="rsckochi.com" className="absolute left-[8%] top-[8%] w-[74%]" style={layer(10)}>
        <div className="relative h-[120px] overflow-hidden sm:h-[150px]" style={{ background: `linear-gradient(120deg, ${a}, #0d1a44)` }}>
          <svg viewBox="0 0 200 100" className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" aria-hidden="true">
            <rect x="10" y="10" width="180" height="80" fill="none" stroke="#fff" strokeWidth=".8" />
            <line x1="100" y1="10" x2="100" y2="90" stroke="#fff" strokeWidth=".8" />
            <circle cx="100" cy="50" r="14" fill="none" stroke="#fff" strokeWidth=".8" />
            <rect x="10" y="30" width="22" height="40" fill="none" stroke="#fff" strokeWidth=".8" />
            <rect x="168" y="30" width="22" height="40" fill="none" stroke="#fff" strokeWidth=".8" />
          </svg>
          <div className="absolute bottom-4 left-4 space-y-2"><Bar w="140px" h={10} c="rgba(255,255,255,.85)" /><Bar w="90px" c="rgba(255,255,255,.5)" /></div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 p-4">
          {Array.from({ length: 21 }).map((_, i) => (
            <span key={i} className="aspect-square rounded-md" style={{ background: [3, 9, 10, 16].includes(i) ? a : 'rgba(255,255,255,.05)' }} />
          ))}
        </div>
      </Window>
      <div className="absolute bottom-[10%] right-[5%] w-[44%] space-y-2 rounded-2xl border border-white/10 bg-[#161618] p-4 shadow-2xl" style={layer(24)}>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Announcements</p>
        {[85, 65, 75].map((w, i) => (
          <div key={i} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: i ? 'rgba(255,255,255,.3)' : a }} /><Bar w={`${w}%`} /></div>
        ))}
      </div>
      <div className="absolute left-[2%] bottom-[16%] rounded-full border border-white/10 bg-[#161618] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white/70 shadow-2xl" style={layer(16)}>
        CMS · SSR · SEO
      </div>
    </>
  );
}

function Crm({ a }: { a: string }) {
  return (
    <>
      <div className="absolute left-[8%] top-[7%] w-[38%] overflow-hidden rounded-[28px] border border-white/10 bg-[#111113] p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,.7)]" style={layer(12)}>
        <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="h-7 w-7 rounded-full" style={{ background: a }} />
          <div className="space-y-1.5"><Bar w="60px" c="rgba(255,255,255,.4)" /><Bar w="36px" h={4} /></div>
        </div>
        <div className="space-y-2.5">
          {[['l', 70], ['r', 55], ['l', 82], ['r', 40], ['l', 60]].map(([side, w], i) => (
            <div key={i} className={`flex ${side === 'r' ? 'justify-end' : ''}`}>
              <span className="block h-6 rounded-2xl" style={{ width: `${w}%`, background: side === 'r' ? a : 'rgba(255,255,255,.08)' }} />
            </div>
          ))}
        </div>
      </div>
      <Window url="whatsappcrm.voleergo.com" className="absolute right-[5%] top-[18%] w-[52%]" style={layer(20)}>
        <div className="grid grid-cols-3 gap-2 p-3">
          {['New', 'Contacted', 'Won'].map((c, i) => (
            <div key={c} className="space-y-2 rounded-lg bg-white/[.04] p-2">
              <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/45">{c}</p>
              {Array.from({ length: 3 - (i === 2 ? 1 : 0) }).map((_, k) => (
                <span key={k} className="block h-7 rounded-md border border-white/5" style={{ background: i === 2 && k === 0 ? `${a}55` : 'rgba(255,255,255,.05)' }} />
              ))}
            </div>
          ))}
        </div>
      </Window>
      <div className="absolute bottom-[10%] right-[12%] flex items-center gap-3 rounded-2xl border border-white/10 bg-[#161618] px-4 py-3 shadow-2xl" style={layer(30)}>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke={a} strokeWidth="1.8" aria-hidden="true"><path d="M3 11l14-6v14L3 13z" /><path d="M7 13v4a2 2 0 0 0 4 0v-3" /><path d="M20 9a4 4 0 0 1 0 6" /></svg>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/75">Broadcast</span>
        <span className="flex -space-x-1.5">{[0, 1, 2, 3].map((k) => <span key={k} className="h-5 w-5 rounded-full border-2 border-[#161618]" style={{ background: k ? `rgba(255,255,255,${0.15 + k * 0.1})` : a }} />)}</span>
      </div>
    </>
  );
}

function Shop({ a }: { a: string }) {
  return (
    <>
      <Window url="e-commerce · Django + React" className="absolute left-[6%] top-[9%] w-[66%]" style={layer(10)}>
        <div className="grid grid-cols-3 gap-3 p-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <span className="grid aspect-square place-items-center rounded-xl" style={{ background: i === 1 ? `${a}40` : 'rgba(255,255,255,.04)' }}>
                <span className="h-1/2 w-1/2" style={{ background: i % 2 ? a : 'rgba(255,255,255,.18)', borderRadius: ['50%', '24%', '50% 50% 12% 12%'][i % 3], opacity: i === 1 ? 1 : 0.7 }} />
              </span>
              <Bar w="70%" /><Bar w="40%" c={i === 1 ? a : 'rgba(255,255,255,.2)'} h={5} />
            </div>
          ))}
        </div>
      </Window>
      <div className="absolute bottom-[8%] right-[5%] w-[40%] space-y-3 rounded-2xl border border-white/10 bg-[#161618] p-4 shadow-2xl" style={layer(26)}>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">Cart</p>
        {[0, 1].map((k) => (
          <div key={k} className="flex items-center gap-3"><span className="h-9 w-9 rounded-lg" style={{ background: k ? 'rgba(255,255,255,.1)' : `${a}66` }} /><div className="flex-1 space-y-1.5"><Bar w="80%" /><Bar w="45%" h={4} /></div></div>
        ))}
        <span className="block rounded-full py-2 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-ink" style={{ background: a }}>Place order</span>
      </div>
      <div className="absolute left-[4%] bottom-[12%] flex items-center gap-2 rounded-full border border-white/10 bg-[#161618] px-4 py-2 shadow-2xl" style={layer(18)}>
        {['Placed', 'Packed', 'Shipped'].map((s, i) => (
          <span key={s} className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/70">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: i < 2 ? a : 'rgba(255,255,255,.25)' }} />{s}
          </span>
        ))}
      </div>
    </>
  );
}

export function ProjectVisual({ project }: { project: Project }) {
  const a = project.accent;
  const V = { academy: Academy, sports: Sports, crm: Crm, shop: Shop }[project.visual];
  return (
    <div
      className="relative h-full min-h-[190px] w-full overflow-hidden rounded-[22px] sm:min-h-[300px] md:min-h-[360px] md:rounded-[30px]"
      style={{ background: `radial-gradient(120% 90% at 80% 10%, ${a}38 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, ${a}22 0%, transparent 60%), #0E0E10` }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-[.35]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.12) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      <V a={a} />
      <span className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">Illustration</span>
    </div>
  );
}
