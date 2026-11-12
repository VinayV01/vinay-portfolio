import { useEffect, useRef } from 'react';

/** A soft ring that trails the pointer and swells over anything interactive. Fine pointers only. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ring.current!;
    let x = innerWidth / 2, y = innerHeight / 2, tx = x, ty = y, size = 14, tSize = 14, raf = 0, shown = false;
    const loop = () => {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2; size += (tSize - size) * 0.18;
      el.style.width = el.style.height = size + 'px';
      el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX; ty = e.clientY;
      if (!shown) { shown = true; el.style.opacity = '1'; }
      const t = e.target as Element;
      const hit = t.closest?.('[data-cursor]');
      const onFace = t.closest?.('.portrait-wrap') && (document.querySelector('.portrait-wrap') as HTMLElement)?.style.cursor;
      let text = '';
      if (onFace) { tSize = 64; text = 'pull'; }
      else if (hit) { const kind = hit.getAttribute('data-cursor'); tSize = kind === 'view' ? 84 : 46; text = kind === 'view' ? 'open' : ''; }
      else tSize = 14;
      if (label.current && label.current.textContent !== text) label.current.textContent = text;
    };
    const onLeave = () => { shown = false; el.style.opacity = '0'; };
    addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={ring} className="cursor-ring hidden opacity-0 transition-opacity duration-300 [@media(pointer:fine)]:grid" aria-hidden="true">
      <span ref={label} />
    </div>
  );
}
