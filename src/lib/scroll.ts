import Lenis from 'lenis';

let lenis: Lenis | null = null;

export function startSmoothScroll(): () => void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
  let raf = 0;
  const loop = (t: number) => {
    lenis?.raf(t);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf);
    lenis?.destroy();
    lenis = null;
  };
}

/** Scroll to an in-page anchor (#id) or to the top (0), smoothly where allowed. */
export function scrollToTarget(target: string | number) {
  if (lenis) {
    lenis.scrollTo(target as string | number, { offset: 0, duration: 1.3 });
    return;
  }
  if (typeof target === 'number') window.scrollTo({ top: target });
  else document.querySelector(target)?.scrollIntoView();
}

export function onAnchorClick(e: React.MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute('href');
  if (!href || !href.startsWith('#')) return;
  e.preventDefault();
  scrollToTarget(href === '#top' ? 0 : href);
  history.replaceState(null, '', href === '#top' ? location.pathname : href);
}
