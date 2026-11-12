import { Pause, Play, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PROFILE } from '../data/content';

// Spoken intro, written for the ear (the on-page text has symbols like "1.5+").
// [what to say, how the face should feel while saying it]
const SCRIPT: [string, string][] = [
  [`Hi, I am ${PROFILE.firstName}. Welcome to my portfolio.`, 'excited'],
  ['I am a full stack developer. I build websites and web apps.', 'proud'],
  ['I have more than one year of experience. I work with Python, Django, React and Next.js.', 'smug'],
  ['I make the back end, and I make the pages you see and use.', 'playful'],
  [`I live in ${PROFILE.location}. Please look around. Thank you for visiting.`, 'love'],
];

const KEY = 'voice-muted';
const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

// Warm, friendly male voice: prefer neural/"natural" male voices, then well-known male ones.
const FEMALE = /female|woman|girl|zira|hazel|susan|aria|jenny|ana\b|sonia|libby|neerja|swara|heera|samantha|ava\b|allison|karen|moira|tessa|serena|veena|emma|michelle|clara|jane|linda|catherine|fiona|kate|victoria|nicky|amelie|mia|natasha|catherine|sara|zoe|joanna|salli|kimberly|kendra|ivy|nancy|jennifer|elsa|sandy|shelley|flo\b|grandma/i;
const MALE = [
  /natural.*(guy|ryan|prabhat|christopher|eric|davis|brian|roger|thomas)|(guy|ryan|prabhat|christopher|eric|davis|brian|roger|thomas).*natural/i,
  /prabhat|ravi|guy|ryan|christopher|brian|eric|thomas|william/i,
  /google uk english male/i,
  /alex|daniel|aaron|fred|tom\b|oliver|david|mark|james|george|richard|male/i,
];

const VKEY = 'voice-name';

/** Every male English voice this browser has, best-sounding first. */
function maleVoices(): SpeechSynthesisVoice[] {
  // allow-list: a voice must be positively male (known name or "male"), never just "not known female"
  const isMale = (n: string) => !/female/i.test(n) && !FEMALE.test(n) && MALE.some((re) => re.test(n));
  const rank = (n: string) => MALE.findIndex((re) => re.test(n));
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('en') && isMale(v.name))
    .sort((a, b) => rank(a.name) - rank(b.name));
}

function pickVoice(): SpeechSynthesisVoice | null {
  const list = maleVoices();
  let saved: string | null = null;
  try { saved = localStorage.getItem(VKEY); } catch { /* ignore */ }
  return list.find((v) => v.name === saved) || list[0] || null; // no male voice? use the browser default rather than a female one
}

// small sounds for when the face gets poked (keys are the face's reactions)
const REACTIONS: Record<string, string[]> = {
  default: ['Hehe!', 'Hey!', 'Hmm?', 'Oh!'],
  hair: ['Ooh, new hair!', 'Like the new look?', 'Fresh style!'],
  sneeze: ['Ah... ah... achoo!', 'Achoo!'],
  ouch: ['Ouch!', 'Ow! My eye!', 'Hey, careful!'],
  worried: ['Uh oh.', 'Careful there!'],
  disgust: ['Eww!', 'Yuck!', 'Hey, not the nose!'],
  crossed: ['Hehe, that tickles!', 'Hey!'],
  angry: ['Hey! Stop that!', 'Grr!'],
  focused: ['Hmm.', 'Yes?'],
  skeptical: ['Really?', 'Hmm, really?'],
  playful: ['Hehe!', 'Hee hee!'],
  mischief: ['Hehe, naughty!', 'Hee hee!'],
  grin: ['Haha!', 'Hehe!'],
  puff: ['Pfft!', 'Hey, my cheek!'],
  shy: ['Aww, shy!', 'Oh, stop it!'],
  love: ['Aww!', 'That is sweet!'],
  laugh: ['Haha!', 'Ha ha ha!', 'Hehehe!'],
  smug: ['Hehe, nice.', 'Mm-hm.'],
  proud: ['Hehe, thanks!', 'Yes!'],
  awe: ['Wow!', 'Whoa!'],
  happy: ['Hehe!', 'Hi there!'],
  'pull-squint': ['Hey, that stings.', 'Oof!'],
  'pull-dizzy': ['Whoa, I am dizzy!', 'Woooah!'],
  'pull-angry': ['Hey! That is enough!', 'Stop pulling my face!'],
  'pull-sulk': ['Mmm... you are so mean.', 'Okay, I am sad now.'],
};

// One switch for every sound this page makes. When it is on, nothing speaks: not the intro,
// not the hover help, not the face reactions.
let silenced = false;
let introOn = false; // the intro is playing right now
const speak = (u: SpeechSynthesisUtterance) => { if (!silenced) speechSynthesis.speak(u); };
const hushAll = () => {
  introOn = false;
  speechSynthesis.cancel();
  setTimeout(() => speechSynthesis.cancel(), 60); // Chrome sometimes keeps a queued line
};

let talkers = 0;
const emit = (name: string, detail: unknown) => dispatchEvent(new CustomEvent(name, { detail }));

/** Builds an utterance and ties the face to it: expression while it speaks, mouth moving. */
function say(text: string, expr: string | null = 'happy'): SpeechSynthesisUtterance {
  const u = new SpeechSynthesisUtterance(text);
  let on = false;
  const off = () => {
    if (!on) return;
    on = false;
    if (--talkers <= 0) { talkers = 0; emit('voice-talk', false); }
  };
  u.addEventListener('start', () => {
    on = true; talkers++;
    emit('voice-talk', true);
    if (expr) emit('voice-express', { expr, ms: text.length * 85 + 700 });
  });
  u.addEventListener('end', off);
  u.addEventListener('error', off);
  const v = pickVoice();
  if (v) { u.voice = v; u.lang = v.lang; }
  u.rate = 0.85;  // slow and clear, easy to follow
  u.pitch = 1.02; // natural, keeps the voice clearly male
  u.volume = 0.95;
  return u;
}

export function Voice() {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
  });
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false); // intro paused by the user; other voices still work
  const run = useRef(0); // bumps on every start/stop so stale utterances are ignored
  const started = useRef(false);

  silenced = muted;

  const stop = useCallback(() => {
    run.current++;
    if (canSpeak) hushAll();
    setSpeaking(false);
  }, []);

  const start = useCallback(() => {
    if (!canSpeak) return;
    if (silenced) return;
    speechSynthesis.cancel();
    const id = ++run.current;
    started.current = true;
    introOn = true;
    setPaused(false);
    setSpeaking(true);
    SCRIPT.forEach(([line, expr], i) => {
      const u = say(line, expr);
      if (i === SCRIPT.length - 1) u.onend = () => { if (run.current === id) { introOn = false; setSpeaking(false); } };
      u.onerror = (e) => {
        if (run.current !== id) return;
        // autoplay blocked: wait for the first real gesture instead
        if (e.error === 'not-allowed') started.current = false;
        introOn = false;
        setSpeaking(false);
      };
      speak(u);
    });
  }, []);

  // Autoplay on load; browsers usually require a gesture, so retry on the first one.
  useEffect(() => {
    if (!canSpeak || muted) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const go = () => {
      if (started.current) return;
      remove();
      start();
    };
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    const remove = () => events.forEach((e) => removeEventListener(e, go));
    events.forEach((e) => addEventListener(e, go, { passive: true }));
    const t = setTimeout(() => { if (!started.current) start(); }, 900);
    return () => { clearTimeout(t); remove(); };
  }, [muted, start]);

  useEffect(() => () => { if (canSpeak) speechSynthesis.cancel(); }, []);

  // Hover help: while the intro is idle (and not muted), hovering a link/button reads out what it does.
  const idle = useRef(true);
  idle.current = !speaking && !muted && !introOn;
  useEffect(() => {
    if (!canSpeak) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let current: Element | null = null;
    const SEL = 'a[href], button, [role="button"], [data-voice]';

    const describe = (el: HTMLElement): string => {
      const custom = el.dataset.voice;
      if (custom) return custom;
      const label = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!label) return '';
      const href = el.getAttribute('href') || '';
      const l = label.toLowerCase();

      // first-person, conversational: as if Vinay is talking
      if (href.endsWith('.pdf') || l.includes('resume')) return 'This is my resume. Take a look.';
      if (href.includes('linkedin')) return "This is my LinkedIn. Let's connect.";
      if (href.startsWith('mailto:')) return "Want to talk? Send me an email. I'd love to hear from you.";
      if (href === '#top' || l.includes('back to top')) return 'Take me back to the top.';
      if (l === 'copy') return 'Copy my email address.';
      if (l === 'copied') return 'Got it, my email is copied.';
      if (l.startsWith('hair colour')) return `Like my hair ${label.split(':')[1]?.trim().toLowerCase() || 'this way'}? Try it on me.`;
      if (l === 'pause intro') return 'Let me pause for a moment.';
      if (l === 'mute all voices') return 'Want some quiet? Mute all my voices.';
      if (l === 'unmute voices') return 'Want to hear me again? Turn my voice back on.';
      if (l === 'play intro') return 'Let me introduce myself again.';
      if (l.includes('menu')) return l.startsWith('close') ? 'Close the menu.' : 'Open the menu and see where you can go.';
      const visit = label.match(/^Visit (.+?) \(/);
      if (visit) return `Want to see ${visit[1]} live? Open the project and take a look.`;
      switch (href) {
        case '#about': return 'Want to know more about me? Read my story.';
        case '#skills': return "Here's the tech I work with.";
        case '#work': return "Take a look at the things I've built.";
        case '#contact': return "Let's work together. Get in touch with me.";
      }
      if (l === 'contact me') return "Let's work together. Get in touch with me.";
      if (l === 'view work') return "Take a look at the things I've built.";
      if (el instanceof HTMLAnchorElement) {
        if (href.startsWith('#')) return `Jump to the ${label} section.`;
        return `Take a look at ${label}.`;
      }
      return `${label}. Give it a click.`;
    };

    const over = (e: PointerEvent) => {
      if (!idle.current || e.pointerType === 'touch') return;
      const el = (e.target as Element | null)?.closest<HTMLElement>(SEL);
      if (!el || el === current) return;
      current = el;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const text = describe(el);
        if (!text || !idle.current || silenced || introOn) return;
        speechSynthesis.cancel();
        speak(say(text));
      }, 250);
    };
    const out = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest(SEL);
      if (!el || el !== current) return;
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return;
      current = null;
      clearTimeout(timer);
      if (idle.current && !introOn) speechSynthesis.cancel();
    };
    document.addEventListener('pointerover', over);
    document.addEventListener('pointerout', out);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('pointerout', out);
    };
  }, []);

  // click 1 (intro playing): pause the intro, other voices still work
  // click 2: mute everything    click 3: unmute and play the intro again
  const toggle = () => {
    if (muted) {
      silenced = false; // takes effect immediately, before React re-renders
      setMuted(false);
      try { localStorage.setItem(KEY, '0'); } catch { /* ignore */ }
      start();
    } else if (speaking) {
      stop();
      setPaused(true);
    } else if (paused) {
      silenced = true;
      setMuted(true);
      setPaused(false);
      try { localStorage.setItem(KEY, '1'); } catch { /* ignore */ }
      stop();
    } else {
      start(); // idle: "Play intro"
    }
  };

  // The face reacts when poked: small voices, only while the intro is idle.
  const lastReact = useRef(0);
  useEffect(() => {
    if (!canSpeak) return;
    const onReact = (e: Event) => {
      if (!idle.current || silenced || introOn) return;
      const kind = (e as CustomEvent<string>).detail;
      const now = performance.now();
      if (now - lastReact.current < 700) return; // don't chatter
      lastReact.current = now;
      const lines = REACTIONS[kind] || REACTIONS.default;
      speechSynthesis.cancel();
      const u = say(lines[Math.floor(Math.random() * lines.length)], null); // the face already reacts itself
      u.rate = 0.95;
      speak(u);
    };
    addEventListener('portrait-react', onReact);
    return () => removeEventListener('portrait-react', onReact);
  }, []);

  // voices load asynchronously in most browsers
  const [voiceCount, setVoiceCount] = useState(0);
  useEffect(() => {
    if (!canSpeak) return;
    const upd = () => setVoiceCount(maleVoices().length);
    upd();
    speechSynthesis.addEventListener('voiceschanged', upd);
    return () => speechSynthesis.removeEventListener('voiceschanged', upd);
  }, []);

  // cycle to the next male voice, remember it, and let it say hello
  const changeVoice = () => {
    const list = maleVoices();
    if (list.length < 2) return;
    const cur = pickVoice();
    const next = list[(list.findIndex((v) => v.name === cur?.name) + 1) % list.length];
    try { localStorage.setItem(VKEY, next.name); } catch { /* ignore */ }
    stop();
    silenced = false;
    setMuted(false);
    try { localStorage.setItem(KEY, '0'); } catch { /* ignore */ }
    speak(say(`Hi, I am ${PROFILE.firstName}. How do I sound?`, 'curious'));
  };

  if (!canSpeak) return null;

  const pill = 'grid h-11 w-11 place-items-center rounded-full border border-mist/30 bg-ink/70 text-mist backdrop-blur-md transition-colors hover:border-mist';
  const Icon = muted ? VolumeX : speaking ? Volume2 : paused ? Pause : Play;

  return (
    <div className="fixed bottom-5 left-5 z-[60] flex items-center gap-2 sm:bottom-6 sm:left-6">
      <button
        type="button"
        onClick={toggle}
        data-cursor="hover"
        aria-pressed={muted}
        aria-label={muted ? 'Unmute voices' : speaking ? 'Pause intro' : paused ? 'Mute all voices' : 'Play intro'}
        className={pill}
      >
        <Icon size={18} strokeWidth={1.75} className={speaking && !muted ? 'text-[color:var(--accent)]' : ''} />
      </button>
      {voiceCount > 1 && (
        <button
          type="button"
          onClick={changeVoice}
          data-cursor="hover"
          data-voice="Not your type of voice? Try another one of mine."
          aria-label="Change voice"
          className={pill}
        >
          <RefreshCw size={16} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
