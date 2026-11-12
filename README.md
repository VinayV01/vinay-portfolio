# Vinay V Nair — Portfolio

Single-page portfolio: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lenis, and a 3D character built in
three.js.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static site in dist/
npm run preview   # serve dist/ locally
```

## Deploying to IIS

Run `npm run build`, then copy the contents of `dist/` to the site root. `public/web.config` (copied into `dist/`) adds
the `.webp` MIME type and static caching. There is no server-side code.

## Editing content

Every word on the page lives in `src/data/content.ts` (profile, skills, experience, projects, journey). The resume PDF
the Resume buttons open is `public/Vinay-V-Nair-Resume.pdf`.

To use a real screenshot for a project instead of the illustration, swap `<ProjectVisual>` in
`src/sections/Projects.tsx` for an `<img>`.

## The 3D character (`src/portrait/`)

No photograph is used anywhere on the site. The character is a stylised 3D bust of Vinay built entirely in code with
three.js. It has a long face, brown skin, thick brows, a full beard and mustache, a toothy grin, a crown of black curls
with a fringe, and the orange mandarin-collar shirt.

- `model.ts` builds the model: sculpted head, eyeballs with real lids, brows, a mouth rebuilt from the expression,
  beard shell, instanced curls, and the neck and shirt. Every material shares one vertex-shader deformation field
  (grab-and-pull, jaw, cheek puff), so the whole figure squashes like one piece of dough.
- `character.ts` brings it to life: cursor tracking, blinks, expressions, the soft-body spring (fixed 1/240 s steps),
  hair sway and colour sweeps, and the idle acts.
- `face.ts` holds the expression presets and hair colours.
- `public/portrait/vinay-3d.webp` is a still render of the character. It shows while three.js loads and when WebGL is
  unavailable. Re-render it if the model changes (see Debug).

three.js is loaded on demand in its own chunk, so the rest of the page never waits for it.

Interactions: eyes follow the cursor and the head turns toward it; he blinks every 2.2–5.6 s. Hovering an eye winks,
the nose makes him cross-eyed, and the mouth makes him smile. Tapping the forehead, eyes, nose, mouth, cheek or chin
each gets its own reaction, and tapping the hair (or a swatch) cycles pink, electric blue, blonde, violet, teal, copper
red, silver and his own colour. The beard, mustache and brows change colour with the hair, a shade deeper.
You can grab and pull anywhere; repeated pulls make him annoyed, then sulky. Shaking the cursor blows his curls,
hovering a Contact button excites him, and scrolling makes him look down. After 30–45 s with no input he plays idle acts
(fly, doze, hair try-on, ghost-hand tug, sneeze and more), and any input stops them.

Debug: `/?portrait-debug&idle=2000` shortens the idle wait to 2 s. `window.__portrait()` returns the current state,
and `window.__portrait.snapshot({ awake: true })` returns a PNG data URL of the character for a new poster.

With `prefers-reduced-motion`, smooth scrolling, idle acts, hair wind and the grain animation are all off.
