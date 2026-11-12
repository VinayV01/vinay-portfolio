import { MotionConfig } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Cursor } from './components/Cursor';
import { Nav } from './components/Nav';
import { Voice } from './components/Voice';
import { startSmoothScroll } from './lib/scroll';
import { HAIR } from './portrait/face';
import { About } from './sections/About';
import { Capabilities } from './sections/Capabilities';
import { Contact } from './sections/Contact';
import { Experience } from './sections/Experience';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { Journey } from './sections/Journey';
import { MarqueeSection } from './sections/Marquee';
import { Projects } from './sections/Projects';
import { Skills } from './sections/Skills';

const EMBER = '#FF5B1F';

export default function App() {
  const [hair, setHair] = useState(-1);

  useEffect(() => startSmoothScroll(), []);

  // the whole site's accent follows his hair colour (his own hair: the ember of his shirt)
  const onHair = useCallback((i: number) => {
    setHair(i);
    document.documentElement.style.setProperty('--accent', i < 0 ? EMBER : HAIR[i].css);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-mist focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Nav />
      <div className="relative z-10 bg-ink" style={{ overflowX: 'clip' }}>
        <main>
          <Hero onHair={onHair} hair={hair} />
          <MarqueeSection />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <Capabilities />
          <Journey />
          <Contact />
        </main>
      </div>
      <Footer />
      <Voice />
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </MotionConfig>
  );
}
