# SharkShield website

Public site for the SharkShield research project. Next.js 16, Tailwind v4, GSAP 3.15.
The plan and its review record live in `../docs/plans/2026-10-07-website-plan.md`.

## Run

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build && pnpm start
```

## Check

```bash
pnpm typecheck
pnpm lint
pnpm check:frames                 # every turntable frame listed exists on disk
node scripts/check-hypothesis.mjs # every deterrent claim renders inside <Hypothesis>
pnpm test:e2e                     # Playwright: desktop, mobile, no-JS, reduced motion
pnpm lhci                         # Lighthouse budgets (needs a production build)
```

## Where things are

- `messages/en.json` — every user-visible string. A Japanese version is a second file.
- `src/app/tokens.css`, `design/tokens.json` — the deck's colour and spacing tokens.
- `src/components/ui.tsx` — Chip, AccentBar, IconCircle, IconStats, Hypothesis, Section.
- `src/components/GsapProvider.tsx` — one ScrollSmoother, desktop only, reduced motion off.
- `src/components/sections/` — one file per home-page section, in page order.
- `src/components/Turntable.tsx` — scroll-scrubbed device frames with slider fallback.
- `public/frames/` — rendered from the Blender model; manifests per breakpoint.
- `public/downloads/` — printable STLs for the v7 capsule.
- `content/` — research data and MDX updates.
- `docs/contracts.md` — file ownership and conventions when several agents build in parallel.

## Motion rules

Every animation is inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
Hidden initial states are set in JS, never CSS, so the page is complete without
JavaScript. Only the longline and device sections pin.
