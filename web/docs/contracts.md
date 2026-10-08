# Build contracts for parallel tracks

Read this before touching anything. Each track owns the files listed under it and
nothing else. If you need something another track owns, write it down in
`docs/requests.md` and continue with a stub.

## Shared, owned by the integrator (do not edit)

- `src/app/layout.tsx`, `src/app/globals.css`, `src/app/tokens.css`
- `src/components/GsapProvider.tsx`, `src/components/NavBar.tsx`, `src/components/Footer.tsx`
- `src/components/ui.tsx` (Chip, AccentBar, IconCircle, IconStats, Hypothesis, Section)
- `src/lib/t.ts`, `messages/en.json` (add keys only under your own section; never rename)
- `next.config.ts`, `vercel.json`, `package.json`

## Conventions every track follows

- Every string comes from `messages/en.json` through `t("section")`. No literal copy in JSX.
- Section components are client components (`"use client"`) that export one named
  function, take no props, and render `<Section id="...">` from `ui.tsx`.
- Motion lives inside `useGSAP(() => { const mm = gsap.matchMedia(); mm.add("(prefers-reduced-motion: no-preference)", () => { ... }); return () => mm.revert(); }, { scope })`.
  Hidden initial states are set with `gsap.set` inside that callback, never in CSS.
  With reduced motion nothing pins, nothing autoplays, everything is visible.
- Register plugins inside the file that uses them: `gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)`.
- Pins: only `Longline` (250vh) and `Unit` (300vh) may pin. Everything else is a reveal.
- Images: `next/image` with explicit `sizes`. Scenes live in `public/scenes/`, icons in
  `public/icons/`, device stills in `public/device/`, frames in `public/frames/`.
- Tailwind v4 with the tokens exposed as `bg-mint-bg`, `text-ink`, `rounded-card` etc.
  Type ramp classes: `t-display`, `t-title`, `t-lead`. Container: `container-site`.
- Every Step 2 / deterrent claim renders inside `<Hypothesis>`.
- Touch targets 44px minimum. Headings follow document order (one h1 per page).
- Tests go next to the feature in `tests/e2e/<section>.spec.ts` (Playwright).

## Section ids and order on the home page

`story` (hero, exists) → `method` (Longline) → `problem` (Strike) → `device` (Unit) →
`measure` (Logged) → `protect` (Deterrent) → `compare` (Comparison) → `research`
(ResearchCards) → `join` (Join).

## Track A — assets (owner: assets agent)

Owns: `public/icons/*.svg`, `public/diagrams/longline.svg`, `public/diagrams/signal.svg`,
`src/components/diagrams/LonglineDiagram.tsx`, `src/components/diagrams/SignalTrace.tsx`.

- Redraw the 16 PNG icons in `public/icons/` as 24×24 SVGs, 2px stroke, round caps,
  `currentColor`, same file names with `.svg`.
- `LonglineDiagram`: inline SVG, viewBox 1000×420. Ids: `mainline`, `surface`,
  `float-1..5`, `floatline-1..5`, `branch-1..23`, `hook-1..23`, `boat`, `beacon`,
  `tuna-hooked`, `tuna-free`. Strokes are `stroke` not `fill` so DrawSVG can draw them.
  Export a `labels` array of `{ id, x, y, text, tone }` for the tags.
- `SignalTrace`: inline SVG, viewBox 1000×300, path id `signal`, circles `marker-hookup`
  and `marker-strike`, vertical phase lines `phase-1..3`. Path data from the same curve
  as the deck (noise, spike at 36%, decaying oscillation, second spike at 62%).

## Track B — turntable (owner: integrator, frames rendered from Blender)

Owns: `public/frames/**`, `src/components/Turntable.tsx`, `scripts/check-frames.ts`.

## Track C — story sections (owner: sections agent)

Owns: `src/components/sections/Longline.tsx`, `Strike.tsx`, `Unit.tsx` (uses
`Turntable` from Track B through a stub until it lands), `Logged.tsx`, `Deterrent.tsx`,
`Comparison.tsx`, `ResearchCards.tsx`, `Join.tsx`, and `tests/e2e/sections.spec.ts`.

Copy keys exist in `messages/en.json` under `longline`, `strike`, `unit`, `logged`,
`deterrent`, `comparison`, `research`, `join`. Scenes available: `strike.png`,
`unit.png`, `deterrent.png`, `tuna_intact.png`, `tuna_damaged.png`, `tuna_lost.png`.

## Track D — pages (owner: pages agent)

Owns: `src/app/research/`, `src/app/device/`, `src/app/updates/`, `src/app/not-found.tsx`,
`content/**`, `src/lib/content.ts`, `tests/e2e/pages.spec.ts`.

- `/research`: the README EEA 2026 section as MDX (`content/research.mdx`), rendered
  with the talk rows as cards and the common threads first. Wording "abstracts we are
  following" until talks are heard. Link the Issuu booklet and the repo PDF.
- `/device`: stills from `public/device/`, spec table (Ø55 × 151 mm, Ø48 cavity,
  3 mm pitch 4-turn thread, 51×1.5 and 6.4×1 O-rings), print notes, downloads from
  `public/downloads/` with size and licence, and the depth-rating caveat.
- `/updates`: list from `content/updates/*.mdx` with zod-validated frontmatter
  (`title`, `date`, `summary`); `generateStaticParams`; empty state when none.
- `not-found.tsx`: branded 404 with three section links.
