<!-- /autoplan restore point: /Users/hemangvora/.gstack/projects/Denjin-K-sharkshield/main-autoplan-restore-20261007-175631.md -->
# SharkShield website — plan (v2, after /autoplan review)

Date: 2026-10-07
Status: reviewed, awaiting approval at the final gate
Owner: Hemang Vora
Repo: https://github.com/Denjin-K/sharkshield (site lives in `web/`)
Review: CEO, design and engineering phases, each with a Codex voice and an independent
Claude voice (six reviewers in total). Decisions are logged at the end of this file.

## 0. What changed in review, in one screen

Auto-decided and already folded into the plan below (in the blast radius, each under a
day of work):

- Deployment is a normal Vercel Next.js deploy with every page prerendered, not
  `output: "export"`. Headers, CSP and download headers live in `vercel.json`.
- Fonts are self-hosted through `next/font`. SplitText runs only after `document.fonts.ready`.
- A real layout spec: type ramp, spacing scale, content width, breakpoints, nav, and a
  mobile layout for every section.
- An interaction-state table for every feature, including the turntable's loading,
  partial, failed, no-JS and reduced-motion states.
- A turntable spec that treats decoded memory, not transfer size, as the budget.
- Reduced motion owns pinning too: with reduced motion on, nothing pins and the device
  is shown with a slider instead of a scrub.
- The `app/[locale]/` segment and a messages file exist from day one, English only at
  launch, so Japanese is an addition and not a rewrite.
- A closing "join" block with one action and a contact method, instead of a footer link.
- A mandatory `<Hypothesis>` wrapper for every Step 2 claim, checked by a unit test.
- Automated tests (Playwright, Lighthouse CI budgets, link and frame-manifest checks)
  instead of a manual QA pass.
- One vertical slice ships before any parallel track starts; tokens, renders and STLs
  are vendored into the repo so agents can find them.
- Flip dropped (the nav indicator is CSS). GSAP plugins are loaded per section.

Not decided by the review, waiting for the owner at the gate (both models agree the
original direction should change, so the original direction stands until you say
otherwise):

1. The name "SharkShield" collides with Ocean Guardian's "Shark Shield" brand.
2. Fishers are the first audience but the launch is English-only.
3. The "Always on. Never proven." claim contradicts the project's own research page.
4. Global ScrollSmoother plus four pinned sections.
5. Publishing the v7 turntable and STL downloads before a sea trial.

Taste calls (recommendation applied, easy to flip): Next.js over Astro; naming
competitors in the comparison; 60 mobile frames at 720 px.

## 1. What the site is for

A public, single-domain site that explains what SharkShield is doing, in the order a
visitor needs it:

1. the problem (sharks taking hooked tuna off longlines before the haul),
2. how tuna longlining works and why the soak window is the problem,
3. where current deterrents fall short for a hooked tuna, stated with sources,
4. the device (the Ø55 screw-cap capsule, v7) and the two-step plan: measure first,
   then protect,
5. the research grounding (EEA 2026 talks, with what we took from each),
6. one clear way to take part: put a logger on a line, or share bite-off counts.

Audiences, in priority order: fishers and co-op staff in Kesennuma and partners,
researchers and conference contacts, and makers. See user challenge 2 on language.

Success is measured by actions, not comprehension: contact requests from boats or
co-ops, research-table and PDF reads, STL downloads (if published), and GitHub stars.
Comprehension within 30 seconds stays as a design constraint, not the metric.

## 2. Design system (carried over from the deck)

Tokens come from `build_deck.py` and are vendored into the repo as
`web/src/styles/tokens.css` and `web/design/tokens.json` (Track 0).

| Token | Hex | Use |
|---|---|---|
| ink | #141A1F | headings, strong text |
| text | #3D4852 | body |
| muted | #7A8691 | captions, footnotes |
| offwhite | #FDFEFD | page background |
| mint bg / text | #D6F3E4 / #1F7A4E | "measure", positive chips |
| mint bar | #A8E6C4 | accent underline |
| pink bg / text | #FCE3E3 / #C0392B | problem, loss, warnings |
| yellow bg / text | #FDF0C7 / #9A6B10 | hypothesis, caution |
| blue bg / text | #DDE6FB / #3755B5 | context, neutral facts |
| cyan bg / line | #D9F2F5 / #8FD6DE | water panels |
| panel | #E9F5F8 | chart panels |
| border | #E3E8EC | card borders |
| signal | #2B5CB8 | data lines |

Contrast rule: every chip text colour above is checked against its chip background at
4.5:1 in CI (muted #7A8691 on offwhite is 4.6:1 and is the floor; nothing lighter
carries words).

Typography: Poppins 700/800 for display, DM Sans 400/500 for body, both self-hosted
through `next/font` with `display: swap` and size-adjust so fallback metrics match.
Line height 0.92 on display sizes, 1.5 on body.

Type ramp (desktop ≥ 1024 / mobile < 768):

| Role | Desktop | Mobile |
|---|---|---|
| Display (hero) | 96px / 0.92 | 52px / 0.95 |
| Section title | 56px / 0.95 | 36px / 1.0 |
| Lead | 22px / 1.4 | 19px / 1.4 |
| Body | 17px / 1.55 | 17px / 1.55 |
| Caption, chip | 13px, chips 12px letter-spaced caps | same |

Spacing: 8px scale (8, 16, 24, 32, 48, 64, 96, 128). Content max width 1120px, gutters
24px mobile, 48px desktop. Section rhythm: 128px between sections on desktop, 80px on
mobile; no section is forced to viewport height except the two pinned ones.

Components from the deck: pill chips, pastel icon circles with line icons, rounded
cards with pastel fills, the short mint accent bar, a striped yellow "hypothesis"
treatment, and the flat pastel illustration style. Illustrations and device renders are
never mixed in one composition.

Nav: wordmark left; Story, Method, Device, Research, Updates, GitHub right. Sticky
compact bar after the hero. Below 768px the links collapse into a bottom sheet opened
by a 44px button. Active state is a CSS underline, not Flip. Nav lives outside any
scroll wrapper so it stays fixed.

Mobile layout per section: hero stacks illustration above copy, illustration cropped
to 4:3; longline diagram becomes a vertical strip with the stats as a 2×2 grid;
comparison rows become stacked cards with the proof chip on its own line; device
section shows frame 0 and the slider; outcome cards scroll horizontally with snap.

Light theme only. No dark mode in v1.

Mockups generated during review (three on-brand hero directions, comparison board at
`~/.gstack/projects/Denjin-K-sharkshield/designs/homepage-hero-20261007/design-board.html`):
variant A adds the longline floats into the hero scene and is the recommended
direction because it previews section 2.

## 3. Stack

- Next.js 16, App Router, TypeScript. Normal Vercel deployment with every route
  prerendered (`generateStaticParams` for `/updates/[slug]`). Not `output: "export"`,
  so `next/image`, `headers()` and route handlers keep working. Root directory `web/`,
  Node 22, pnpm, lockfile committed.
- Tailwind CSS 4 with the tokens as CSS variables.
- GSAP 3.15 with `@gsap/react`. Plugins: ScrollTrigger, SplitText, DrawSVGPlugin,
  MotionPathPlugin. ScrollSmoother is gated by user challenge 4; if kept it is created
  once in a layout-level client component inside `gsap.matchMedia()` for
  `(min-width: 1024px) and (prefers-reduced-motion: no-preference)` only, and killed on
  route change. Plugins are imported inside the section that uses them so the home
  route does not pay for all of them.
- `next-intl` with `app/[locale]/` from day one; `en` only at launch; every string in
  `messages/en.json`.
- MDX compiled at build time with `@next/mdx`, frontmatter validated with zod, raw
  HTML disabled, a short allowed-component list, and no remote MDX ever.
- No CMS, database, auth or first-party forms. Contact is `mailto:` plus an external
  form link (decided at launch).

Why Next.js over Astro (taste call): the owner already runs a Next.js site on Vercel;
the turntable scrubber is small vanilla JS either way. Astro would save about 60 kB of
runtime on the home page. Flip to Astro only if the performance budget fails after the
vertical slice.

## 4. Page map

| Route | Purpose |
|---|---|
| `/` | The story, top to bottom (sections below) |
| `/research` | EEA 2026 table, common threads, references, PDF links |
| `/device` | Specs, cross-section, exploded view, downloads (see challenge 5), print notes |
| `/updates` and `/updates/[slug]` | Short posts (MDX); empty state at launch is a single "first post" card |
| `/404` | Branded, links back to the three sections |

Home sections, each one message, one job:

1. Hero: "Shark Shield. Count what the sharks take. Then protect the catch." with the
   two-step promise visible in the hero (Count / Protect chips) and audience jump links
   (Story, Method, Device files).
2. One line, thousands of hooks (longline explainer, four stats). Pinned.
3. Sharks get there first (the strike, three costs). Plain reveal.
4. One small sealed unit (device turntable, feature callouts). Pinned.
5. Every hook-up, logged (Step 1, signal trace, three outcomes). Plain reveal.
6. Triggered electric deterrent (Step 2, marked HYPOTHESIS). Plain reveal.
7. Where current deterrents stop short (comparison; wording per challenge 3). Placed
   after the method so negativity does not peak before the promise is paid off.
8. Research grounding (three talk cards, link to `/research`).
9. Join: one action ("put a logger on your line" or "send us your bite-off counts"),
   contact, GitHub, research, and the hypothesis disclaimer. This is a section, not a
   footer.

## 5. Motion design (GSAP)

Every animation carries meaning. Nothing loops except the hero water drift. All
motion lives inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`,
including pins; the reduced-motion branch renders every section unpinned, static, and
complete. Initial hidden states are set in JS inside `useGSAP`, never in CSS, so the
page is fully readable with JS off.

| Section | Animation | Plugin |
|---|---|---|
| Hero | Title words rise with SplitText (after fonts resolve; `aria-label` keeps the sentence intact); leader line draws with DrawSVG; water blob drifts; shark and tuna parallax | SplitText, DrawSVG, ScrollTrigger |
| Longline | Pinned 250vh. Mainline draws, floats pop, branch lines drop with stagger, hooks swing on a MotionPath, four stats count up | ScrollTrigger scrub, DrawSVG, MotionPath |
| Strike | Plain reveal: shark enters on a MotionPath, impact marks flash, three cost chips land | MotionPath, ScrollTrigger |
| The unit | Pinned 300vh. Scrub through turntable frames on a canvas; callouts fade in at frames 20, 55, 90; cap lift in the last 20 percent of the pin | ScrollTrigger scrub |
| Every hook-up, logged | Signal trace draws with scroll; markers pop; outcome cards rise | DrawSVG, ScrollTrigger |
| Deterrent | Halo rings pulse once; shark reverses on a path; HYPOTHESIS chip stripe shifts | timeline, MotionPath |
| Comparison | Rows rise; bars fill left to right | ScrollTrigger |
| Research, Join | Cards stagger in | ScrollTrigger batch |
| Global | Heading line reveals with SplitText; chips lift 2px on hover | SplitText |

Pins are limited to two sections. Anchor links to pinned sections scroll to the pin
start, never into the middle of a pin. `ScrollTrigger.config({ ignoreMobileResize: true })`
is set so the iOS address bar does not refresh pins mid-scroll.

Performance budget, enforced in CI with Lighthouse CI budgets:

| Metric | Budget |
|---|---|
| Home route JS, gzipped | 250 kB (was 200; React + Next runtime alone measure ~165 kB, see TODOS: Astro migration) |
| LCP on 4G mobile | 2.5 s |
| CLS | 0.05 |
| INP | 200 ms |
| Decoded turntable memory resident at once | 120 MB |
| Total transfer for the home route, mobile | 4 MB |

## 6. Turntable spec

Frames: 120 closed-state frames at 1200 px for viewports ≥ 1024 and 60 frames at 720 px
below that, each set with its own manifest (`frames.desktop.json`,
`frames.mobile.json`). The open-state sequence is 40 frames in each set. Alpha WebP,
quality 80. Realistic payload is 5 to 9 MB desktop, 2 to 3 MB mobile.

Loading: frame 0 is a plain `<img>` under the canvas and is the no-JS, reduced-motion,
loading and error state. When the section is within one viewport, frames load every
fourth first, then fill in. Decoding uses `createImageBitmap` with a sliding window of
eight frames either side of the current one and explicit `close()` outside it. A thin
progress bar sits on the pin while frames are loading. The scrub draws the nearest
loaded frame; a failed frame retries twice then is skipped. `Save-Data` and
`navigator.connection.effectiveType` of 2g or 3g skip preloading and show the slider
instead. Canvas CSS width is capped at 720 px on screens narrower than 1024.

Controls: with reduced motion or no pin, a range slider under the image scrubs the
same frames and is keyboard operable. The canvas has `role="img"` with a description.

Build check: a script asserts the frame count on disk matches each manifest; the build
fails otherwise, so a missing frame is never a blank canvas.

## 7. Interaction states

| Feature | Loading | Empty | Error | Success | Partial |
|---|---|---|---|---|---|
| Hero | Static poster, copy visible | n/a | n/a | Motion plays once | Fonts late: split waits, copy still visible |
| Longline pin | Diagram visible, lines undrawn | n/a | SVG fails to load: inline SVG, cannot fail | Scrub completes | Mid-scroll resize: pin refresh on orientation only |
| Turntable | frame 0 image, progress bar | n/a | frame 0 stays, slider shown | scrub runs | Nearest loaded frame drawn |
| Comparison | Rows visible | n/a | n/a | Bars filled | n/a |
| Research cards | Visible | n/a | PDF missing: link checker fails the build | n/a | n/a |
| `/updates` | Visible | One "first post" card with the project start date | Bad frontmatter fails the build | List | n/a |
| Downloads | Visible | n/a | 404 page | File downloads with size and licence shown | n/a |
| Join | Visible | n/a | n/a | mailto opens | n/a |
| 404 | n/a | n/a | Branded page with three section links | n/a | n/a |

## 8. Content

- Home copy comes from the deck and is edited for the web (shorter, no slide
  carry-overs). All strings live in `messages/en.json`.
- `/research` is the README's EEA 2026 section converted to MDX. Until each talk has
  actually been heard, wording is "abstracts we are following", not "we attended".
- `/device` copy comes from the design notes: dimensions, seal scheme, thread spec,
  print settings, O-ring sizes, and the caveats (printed PETG depth rating, crimp stops).
- Every Step 2 and deterrent claim is wrapped in `<Hypothesis>`, which renders the
  yellow chip and the "not yet shown" note. A unit test fails if any deterrent string
  appears outside the wrapper.
- Comparison claims cite a source per row. Wording is decided by challenge 3.
- Competitor names (taste call, recommendation: keep) stay only with a citation per
  claim and a plain-language note that the comparison is about timing and evidence for
  a hooked tuna, not product quality.

## 9. Assets

| Asset | Source | Track |
|---|---|---|
| Hero, longline, strike, deterrent scenes | existing Higgsfield PNGs. Moving parts (shark, tuna, unit) are regenerated as separate transparent layers through the same prompt pattern, not cut from the composite, so parallax edges are clean | A |
| Turntable frames | Blender script over the v7 collection, EEVEE, transparent, two sizes, two manifests | B |
| Cross-section and exploded stills | Blender | B |
| Line icons | existing icon PNGs redrawn as SVG | A |
| Longline diagram | SVG with an id on every stroke for DrawSVG | A |
| Signal trace | SVG path generated from the deck function | C |
| Tokens | `web/design/tokens.json` and `web/src/styles/tokens.css` | 0 |
| STL downloads | `web/public/downloads/` with a README, size, licence; publication gated by challenge 5 | D |

All inputs are vendored into the repo before any parallel track starts. Nothing a
track needs lives in `~/Downloads`.

## 10. Build plan and agent split

Track 0, vertical slice (blocking, sequential): scaffold in `web/`, tokens, fonts,
`[locale]` segment, nav, footer, MDX pipeline, `vercel.json`, Playwright and
Lighthouse CI wiring, and the hero section complete with its motion, reduced-motion
branch and tests. Deployed to a preview URL and checked on a real iPhone. Nothing else
starts until this is green.

Then in parallel, each in its own worktree, with a contract file
(`web/docs/contracts.md`) listing component names, props, asset paths and the one
shared CSS file nobody else edits:

- Track A, design assets (layers, SVG icons, longline SVG).
- Track B, 3D (turntable frames, manifests, stills, the `Turntable` component).
- Track C, story sections 2 through 9, each with its own `useGSAP` scope, reduced-motion
  branch and Playwright spec.
- Track D, `/research`, `/device`, `/updates`, 404, downloads.

Integration is sequential, one track at a time, behind the performance gate.

Milestones:

1. Vertical slice deployed (Track 0), iPhone check, budgets green.
2. Longline and strike sections live; second iPhone check; ScrollSmoother go/no-go if
   it survived challenge 4.
3. Turntable live with real v7 frames (or the single hero render if challenge 5 holds).
4. All home sections, copy final, hypothesis test green.
5. Secondary pages and downloads.
6. Launch on the chosen domain.

## 11. Testing and quality

Automated, in CI on every PR:

- Playwright: all copy visible with JavaScript disabled; reduced motion renders every
  section unpinned and the turntable slider works; every `/#anchor` and cross-route
  anchor lands on its section; turntable with one frame returning 404 still renders;
  375 px viewport has no horizontal scroll and both pins release; keyboard can reach
  every link and the slider; skip link works.
- Unit: every deterrent string is inside `<Hypothesis>`; tokens contrast check; frame
  manifest matches disk.
- Lighthouse CI with the budgets in section 5, mobile profile.
- Link checker over PDF, STL, GitHub and external links.
- Build fails on invalid MDX frontmatter.

Manual, at milestones 1, 2 and 3: real iPhone Safari and one Android Chrome, portrait
and landscape, address bar collapse, pull-to-refresh, back button into a pin.

## 12. Security and deployment

- Static-first site, no first-party input. Contact is `mailto:` or an external form.
- `vercel.json` sets CSP (`script-src 'self'`, fonts and images self), HSTS,
  `X-Content-Type-Options`, and `Content-Disposition: attachment` for downloads.
- MDX compiles at build only; content PRs from non-maintainers are reviewed before
  merge.
- GSAP and Next pinned exactly in the lockfile; Dependabot on.
- Rollback is a Vercel promote of the previous deployment, under a minute.

## 13. User challenges (decide at the gate)

**UC1. The name collides with Ocean Guardian's "Shark Shield".**
You said: the project is called SharkShield. Both models recommend: run a trademark
and domain check now and pick a working name before any public page exists.
Why: "Shark Shield" is a long-standing commercial electric shark-deterrent brand in the
same category; the comparison section even criticises always-on electrical deterrents.
What we might be missing: this may be an internal working name, or a rename may already
be planned. If we're wrong, the cost of changing is a day of find-and-replace now; if
we're right and nothing changes, the cost is a trademark letter and search confusion
after launch.

**UC2. Fishers first, English only.**
You said: Kesennuma fishers and co-op staff are the first audience; Japanese is v2.
Both models recommend: ship a short Japanese page in v1 (hero, device photo, what you
want from a boat, contact), before or alongside the English motion site.
Why: the stated first audience cannot read the launch; the structure is a conference
deck. What we might be missing: fisher outreach may happen in person with a printed
sheet, and the site may be aimed at researchers and funders in practice. If we're
wrong, a Japanese page costs a few hours. If we're right and nothing changes, the site
serves audiences three and two and not one.

**UC3. "Always on. Never proven." is contradicted by `/research`.**
You said: the comparison section keeps the deck's framing. Both models recommend:
reword to the real differentiator: nobody logs the hook-up or measures loss per hook
before deterring. Why: the README reports a randomised RPELX trial with a 63 percent
reduction and SharkGuard trials at 46 to 89 percent; a researcher reads both on the
same site. What we might be missing: "proven for a hooked tuna on a longline" may be
the precise claim, and that may hold. If so, the copy must say exactly that, with the
sources. If we're wrong about the reframe, nothing is lost by being precise.

**UC4. ScrollSmoother plus pinned sections.**
You said: a GSAP showcase in the spirit of demos.gsap.com. Both models recommend:
drop ScrollSmoother, keep native scrolling, keep ScrollTrigger reveals, and pin at most
two sections. Why: transformed scroll wrappers break fixed nav, anchors, scroll
restoration and iOS resize; four pins is scroll-jack fatigue on a phone. What we might
be missing: the site may be judged partly on motion craft, and desktop-only smoothing
inside `matchMedia` is a middle path. The plan already limits pins to two and gates
ScrollSmoother to desktop; the open question is whether to keep it at all. If we're
wrong about dropping it, desktop loses inertia scrolling. If we're right and it stays,
expect iPhone bugs at milestone 2.

**UC5. Turntable and STL downloads before a sea trial.**
You said: show the new v7 model from every angle and publish the STLs. Both models
recommend: one hero render and a photo now, turntable and downloads after the first
soak, with an explicit safety and licence decision before any STL is public. Why: the
first trip will change the body, cap or seal, and every frame and callout is then
re-rendered; a printed PETG capsule with no depth rating carries liability. What we
might be missing: the turntable may be the piece that gets a co-op meeting, and makers
are a real audience. If we're wrong, you lose a few weeks of the best section. If we're
right and nothing changes, you re-render 160 frames in November and own whatever
someone prints.

## 14. Taste decisions (recommendation applied)

| # | Decision | Applied | Alternative and its downstream effect |
|---|---|---|---|
| T1 | Framework | Next.js 16 | Astro: about 60 kB less JS, one more mental model; switch only if budgets fail |
| T2 | Competitor names | Keep, with a citation per claim | Anonymise: safer, weaker section, no legal glance needed |
| T3 | Mobile frames | 60 at 720 px | 30 at 600 px: lighter, visibly steppy scrub |
| T4 | Section order | Comparison after Step 2 | Deck order: faster to build, negativity peaks early |

## 15. NOT in scope

- Dark mode: the pastel system has no dark variant and inventing one is new design work.
- CMS, accounts, first-party forms: no need, and no input means no attack surface.
- Live device data on the site: deferred to TODOS.md; it is the one genuinely new thing
  the site could show and it belongs with Step 1 fieldwork, not launch.
- Japanese translation beyond what UC2 decides: owner and translator unassigned.
- Blog comments, newsletter: no audience yet.
- Any claim about deterrent effectiveness.

## 16. What already exists

| Need | Existing | Reused? |
|---|---|---|
| Design tokens, chips, icon circles, accent bar | `build_deck.py` helpers and icon PNGs | Yes, ported to CSS and SVG |
| Scene illustrations | Higgsfield PNGs in `SharkShield_v3_illustrations/` | Yes for backgrounds; moving parts regenerated as layers |
| Device geometry | Blender file, v7 collection, `stl_v7/` | Yes for renders; downloads gated by UC5 |
| Research content | README EEA 2026 section | Yes, converted to MDX |
| Signal trace | deck function | Yes, ported to SVG |
| Vercel workflow | Uvera site | Same account and process |
| Repo `enclosure/` STLs | older OpenSCAD capsule files | No, superseded by v7; remove or label |

## 17. Dream state delta

```
CURRENT                          THIS PLAN                        12-MONTH IDEAL
README + PDF in repo    --->     Story site, device pages,  --->  Site is the front door for a
no web presence                  research, join action,          Kesennuma pilot: live hook-up
                                 EN (JA per UC2)                  and bite-off counts, JA + EN,
                                                                 field photos replacing renders,
                                                                 first per-hook loss dataset
```

The plan moves toward the ideal if the join action and the data-ready structure
(sections as components, strings in messages, MDX updates) land. It moves away from it
if effort goes into pins and frames before any boat is recruited.

## Review record

### CEO phase

Mode: SELECTIVE EXPANSION (autoplan default). Premises examined: (a) the site is a
current bottleneck, assumed, both voices doubt it; (b) fishers are the first audience,
stated, contradicted by language; (c) competitors are unproven, stated, contradicted by
the project's own README; (d) v7 is stable enough to publish, assumed. Premises (a) to
(d) are queued as user challenges 1 to 5; none was auto-decided.

Implementation alternatives considered: A, Next.js motion site as planned (effort M,
risk Med, completeness 9/10 for the stated goal); B, Astro static site with ScrollTrigger
reveals only (effort S, risk Low, completeness 7/10); C, Japanese-first one-page
recruitment site plus the README (effort S, risk Low, completeness 4/10 for the stated
goal, 8/10 for the pilot goal). A was kept as the baseline per the user's direction; B
is taste decision T1; C is user challenge 2.

Temporal interrogation: hour 1 needs the locale segment, deploy mode and font strategy
decided (now decided); hours 2 to 3 hit the turntable memory model and reduced-motion
branch (now specified); hours 4 to 5 hit anchors into pins and iOS resize (now
specified and tested); hour 6 hits copy and hypothesis labelling (now a component and a
test).

Sections 1 to 11, findings and dispositions:

1. Architecture: deploy mode ambiguity, i18n route structure, nav inside a transformed
   wrapper. Fixed in sections 3 and 2.
2. Error and rescue: no failure model for frames, fonts, MDX, links. Fixed in sections 6,
   7, 11.
3. Security: static export dropped headers; MDX as code; no CSP. Fixed in section 12.
4. Data flow and interaction: anchors into pins, resize mid-pin, scrolling faster than
   decode, 375 px overflow. Fixed in sections 5, 6, 11.
5. Code quality: parallel agents colliding in global CSS and GSAP registration. Fixed
   in section 10 (contract file, one shared CSS file, vertical slice first).
6. Tests: entirely manual. Fixed in section 11.
7. Performance: transfer size mistaken for decode cost; six plugins global. Fixed in
   sections 5 and 6.
8. Observability: Vercel analytics plus Lighthouse CI budgets and a link checker; no
   runtime logging needed for a static site. No further issues.
9. Deployment: root directory, Node version, headers, 404, previews. Fixed in sections
   3 and 12. Rollback is a Vercel promote.
10. Long-term: reversibility 4/5 (static site, content in repo). Debt items: frames
    tied to v7, deck copy reused. Both captured in UC5 and section 8.
11. Design: handed to the design phase.

Error and rescue registry:

| Codepath | What can go wrong | Handling | User sees |
|---|---|---|---|
| Font load | Google outage, slow network | self-hosted via next/font, size-adjust fallback | correct layout, system font briefly |
| SplitText | runs before fonts | waits for `document.fonts.ready` | no reflow |
| Turntable fetch | 404, timeout, Save-Data | retry twice, nearest frame, slider fallback | device still visible |
| Turntable decode | memory pressure | sliding window, bitmap close | no tab kill |
| Pin refresh | iOS address bar | `ignoreMobileResize` | no jump |
| Anchor into pin | lands mid-pin | scroll to pin start | section start |
| MDX build | bad frontmatter, raw HTML | zod, raw HTML off, build fails | never shipped |
| External links | PDF or STL missing | link checker fails CI | never shipped |
| JS off | everything hidden | initial state set in JS only | full page |

Failure modes registry:

| Codepath | Failure | Rescued | Test | User sees | Logged |
|---|---|---|---|---|---|
| Turntable | frame 404 | Y | Y (Playwright) | nearest frame | Vercel analytics |
| Turntable | memory eviction | Y | manual iPhone | slider | no |
| Hero | fonts late | Y | Y | copy visible | no |
| Pins | iOS resize | Y | manual iPhone | stable | no |
| Hypothesis copy | claim unlabelled | Y | Y (unit) | never shipped | CI |
| Downloads | file missing | Y | Y (link check) | never shipped | CI |

No row is unrescued, untested and silent, so no critical gap remains after amendment.

CEO dual voices consensus:

```
Dimension                            Claude   Codex    Consensus
1. Premises valid?                   NO       NO       CONFIRMED (→ UC1, UC2, UC3)
2. Right problem to solve?           PARTIAL  NO       CONFIRMED concern (→ UC2, join action)
3. Scope calibration correct?        NO       NO       CONFIRMED (→ UC4, UC5, vertical slice)
4. Alternatives explored?            NO       NO       CONFIRMED (→ alternatives above, T1)
5. Competitive risks covered?        NO       NO       CONFIRMED (→ UC1, UC3)
6. 6-month trajectory sound?         NO       NO       CONFIRMED (→ UC5, dream state)
```

### Design phase

Design scope rating before review: 4/10 (tokens and motion precise, layout and states
absent). After amendment: 8/10.

| Pass | Claude | Codex | Before | After | What changed |
|---|---|---|---|---|---|
| 1 Information architecture | 5 | 4 | 4 | 8 | nav spec, hero promise, jump links, comparison moved after Step 2, join section |
| 2 Interaction states | 3 | 2 | 2 | 8 | state table, turntable model |
| 3 User journey | 6 | 3 | 5 | 8 | join action, order change |
| 4 AI slop risk | 7 | 3 | 5 | 7 | distinctive system kept; cards only where they are the interaction; hover lift limited to chips |
| 5 Design system alignment | n/a | n/a | 8 | 9 | tokens vendored, contrast rule |
| 6 Responsive and accessibility | 2 / 4 | 2 / 2 | 2 | 8 | per-section mobile layouts, 44px targets, skip link, landmarks, canvas role, keyboard slider, split-text aria-label |
| 7 Unresolved decisions | — | — | 9 open | 2 open | remaining: contact method, domain |

Litmus checks against the mockups: brand unmistakable in first screen, yes; one strong
visual anchor, yes (scene); scannable by headlines, yes; one job per section, yes after
reorder; cards necessary, only for outcomes and talks; motion improves hierarchy, yes
when limited to two pins; premium without shadows, yes (none used). Hard rejections:
none triggered; the three icon circles in the hero are the deck's signature, kept
deliberately and limited to that one row.

### Engineering phase

Scope challenge: 1 new app, about 25 files in the vertical slice, 4 parallel tracks.
Complexity smell acknowledged and answered by the vertical-slice-first rule rather than
by cutting sections, since the owner's direction is the full story site.

Architecture:

```
web/
  app/[locale]/layout.tsx ── NavBar (fixed, outside any smoother)
        │                   ── GsapProvider (registers plugins once, matchMedia contexts)
        │                   ── optional SmootherWrapper (desktop only, UC4)
        ├── page.tsx ── Hero ── Longline(pin) ── Strike ── Unit(pin, Turntable) ── Logged ── Deterrent ── Comparison ── Research ── Join
        ├── research/page.tsx ── MDX
        ├── device/page.tsx ── stills, specs, Downloads
        └── updates/[slug]/page.tsx ── MDX, generateStaticParams
  messages/en.json ── every string
  design/tokens.json ── src/styles/tokens.css
  public/frames/{desktop,mobile}/*.webp + manifests
  public/downloads/*.stl (UC5)
  tests/ (Playwright, unit), lighthouserc.json, vercel.json
```

Coupling: sections depend only on GsapProvider and tokens; Turntable depends on the
manifests; nothing depends on a section's internals. Single point of failure: the
GsapProvider; it is covered by the JS-off test.

Test diagram:

```
CODE PATHS                                   USER FLOWS
Turntable                                    Read the story
  ├── [GAP→test] manifest load                 ├── [GAP→E2E] JS off, all copy visible
  ├── [GAP→test] frame 404 → nearest           ├── [GAP→E2E] reduced motion, no pins, slider works
  ├── [GAP→test] Save-Data → slider            ├── [GAP→E2E] anchor into pinned section
  └── [GAP→test] window close()                └── [GAP→E2E] 375px, no overflow, pins release
Hypothesis wrapper                            Find things
  └── [GAP→unit] unlabelled claim fails        ├── [GAP→E2E] nav to research, device, updates
Fonts / SplitText                              └── [GAP→link check] PDF, STL, GitHub
  └── [GAP→E2E] split after fonts.ready
COVERAGE before amendment: 0/12. After: 12/12 specified in section 11.
```

Failure modes with critical gaps: none remaining (see registry above).

Parallelization:

| Step | Modules | Depends on |
|---|---|---|
| Track 0 vertical slice | app/, styles/, messages/, tests/ | — |
| Track A assets | public/scenes, public/icons, longline SVG | 0 |
| Track B turntable | public/frames, components/Turntable | 0 |
| Track C sections | components/sections | 0, A (assets), B (Unit section only) |
| Track D pages | app/research, app/device, app/updates, content/ | 0 |

Lanes: 0 first. Then A, B, D in parallel worktrees. C starts when A lands and takes B's
component when it lands. Conflict flag: C and A both touch `public/scenes` naming; the
contract file fixes names before either starts.

Eng dual voices consensus:

```
Dimension                            Claude   Codex    Consensus
1. Architecture sound?               PARTIAL  NO       CONFIRMED concern → fixed (deploy mode, i18n, nav)
2. Test coverage sufficient?         NO       NO       CONFIRMED → fixed (section 11)
3. Performance risks addressed?      NO       NO       CONFIRMED → fixed (sections 5, 6)
4. Security threats covered?         PARTIAL  NO       CONFIRMED concern → fixed (section 12)
5. Error paths handled?              NO       NO       CONFIRMED → fixed (registries)
6. Deployment risk manageable?       YES      PARTIAL  DISAGREE, minor → fixed by vercel.json spec
```

### Cross-phase themes

- Audience and language mismatch: CEO (both), design (both), eng (Codex). High
  confidence. Surfaced as UC2.
- Animation program ahead of validation: CEO (both), design (both), eng (both).
  Surfaced as UC4 and UC5; mitigated by the vertical slice and two-pin limit.
- Turntable memory and failure model: design (Claude), eng (both). Fixed in section 6.
- Name collision: CEO (both), design (Codex). Surfaced as UC1.
- Reduced motion must own pins: design (Claude), eng (both). Fixed in section 5.

### Deferred to TODOS.md

- Live hook-up and bite-off counts on the site (ties to Step 1 fieldwork).
- Japanese translation ownership and scope (beyond UC2).
- Field photos to replace renders after the first trip.
- Astro migration if budgets fail.
- Printable one-sheet for dockside conversations.

<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---|---|---|---|---|---|---|
| 1 | Intake | Skip the /office-hours offer, proceed with standard review | Mechanical | P6 | autoplan runs one gate only | running office-hours first |
| 2 | Intake | DX phase skipped | Mechanical | P3 | term matches were implementation words; no developer-facing product | running DX review |
| 3 | CEO | Mode SELECTIVE EXPANSION | Mechanical | override rule | autoplan default | other modes |
| 4 | CEO | Premises (a) to (d) queued as user challenges, not auto-decided | User challenge | rule | both models agree direction should change | auto-reframing the site |
| 5 | CEO | Add join section with one action and contact | Mechanical | P1 | in blast radius, completes purpose item 6 | footer link only |
| 6 | CEO | Reword "we attended" to "abstracts we are following" | Mechanical | P5 | accuracy; talks not yet heard | keep |
| 7 | CEO | Alternative A kept as baseline; B is taste T1; C is UC2 | Taste + UC | P1 | user direction stands | silently switching |
| 8 | Design | Add layout spec, nav, mobile layouts, state table | Mechanical | P1 | structural gaps | leave to implementer |
| 9 | Design | Move comparison after Step 2 | Taste | P5 | journey arc | deck order (T4) |
| 10 | Design | Keep competitor names with citations | Taste | P5 | stronger section, stated facts only | anonymise (T2) |
| 11 | Design | Mockup variant A recommended | Taste | — | previews section 2 | B, C |
| 12 | Design | Reduced motion owns pins; slider fallback | Mechanical | P1 | accessibility and success criterion | tweens-off only |
| 13 | Eng | Normal Vercel deploy, not output: export | Mechanical | P5 | headers, images, params all work | strict export |
| 14 | Eng | next/font self-hosting; split after fonts.ready | Mechanical | P1 | 2am outage scenario | Google Fonts link |
| 15 | Eng | app/[locale] and messages from day one | Mechanical | P1 | avoids rewrite for JA | add later |
| 16 | Eng | Turntable spec (two manifests, window, nearest frame, Save-Data) | Mechanical | P1 | decoded memory is the budget | preload all |
| 17 | Eng | Drop Flip; per-section plugin imports | Mechanical | P5 | 200 kB budget | global imports |
| 18 | Eng | Pins limited to two; ScrollSmoother kept only pending UC4 | User challenge | rule | both models say drop; user asked for showcase | drop now |
| 19 | Eng | Automated test suite and Lighthouse CI | Mechanical | P1 | manual QA is not a test plan | manual only |
| 20 | Eng | vercel.json CSP and headers; MDX build-only | Mechanical | P1 | security gaps | none |
| 21 | Eng | Vertical slice before parallel tracks; contract file; vendored assets | Mechanical | P6 | agents would collide | five tracks at once |
| 22 | Eng | 60 mobile frames at 720 px | Taste | P3 | smoothness vs weight | 30 at 600 (T3) |
| 23 | Eng | Live device data deferred to TODOS | Mechanical | P2 | outside blast radius, depends on fieldwork | build now |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 1 | issues_open (via /autoplan) | mode: SELECTIVE_EXPANSION, 0 critical gaps, 5 user challenges open |
| Codex Review | `/codex review` | Independent 2nd opinion | 3 voices | issues_found | CEO 0/6 yes, design 2 to 5/10, eng 0 yes 1 partial |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open (via /autoplan) | 11 issues, 0 critical gaps, all folded into the plan pending UC4, UC5 |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | issues_open (via /autoplan) | score: 4/10 → 8/10, 9 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | skipped | no developer-facing scope |

- **CROSS-MODEL:** Claude and Codex agreed on all six CEO dimensions, five of six eng dimensions, and on every design pass except AI-slop risk (Claude 7, Codex 3); the disagreement is about whether the pastel system is distinctive enough, resolved by keeping it and limiting generic card and hover patterns.
- **VERDICT:** CEO, DESIGN and ENG reviewed with issues open; eng review required to clear once the five user challenges are answered at the gate.

**UNRESOLVED DECISIONS:**
- UC1 name collision with Ocean Guardian "Shark Shield"
- UC2 fishers-first audience but English-only launch
- UC3 "never proven" claim versus the research page
- UC4 ScrollSmoother and pinned sections
- UC5 turntable and STL downloads before a sea trial
