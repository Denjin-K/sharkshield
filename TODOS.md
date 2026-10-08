# TODOS

Deferred work with enough context to pick up cold. Added by the 2026-10-07 website plan
review (`docs/plans/2026-10-07-website-plan.md`).

## P1

### Live hook-up and bite-off counts on the site
- **What:** A running tally on the home page and `/device` fed from Step 1 loggers.
- **Why:** It is the only thing the site could show that nobody else has: per-hook loss
  numbers from a Japanese tuna fleet. Both review voices named it as the 10x reframe.
- **Pros:** Turns the site from a brochure into the measurement instrument's front door;
  gives researchers a reason to return.
- **Cons:** Needs a data path from devices, a schema, and a way to publish without
  exposing boats or positions.
- **Context:** Out of scope for launch because no device has been on a line yet. Site
  structure is ready for it: sections are components, strings are in messages, updates
  are MDX. Start with a static JSON the owner updates by hand after each trip.
- **Effort:** M (human) → S (CC+gstack). **Depends on:** first Step 1 deployment.

## P2

### Japanese version ownership and scope
- **What:** Decide who writes Japanese copy and which pages ship first.
- **Why:** Fishers and co-op staff are the first audience and cannot read the English
  launch. UC2 in the plan covers the minimum page; this covers the rest.
- **Pros:** Site serves the stated first audience. **Cons:** Translation and review time;
  Japanese changes line length and the comparison layout.
- **Context:** `app/[locale]/` and `messages/en.json` exist from Track 0; adding `ja`
  is a messages file plus layout checks. Word-mode SplitText does not work for Japanese;
  use char or line mode.
- **Effort:** M → S. **Depends on:** UC2 decision, a translator.

### Field photos replace renders
- **What:** After the first sea trip, replace the device renders with photos of the real
  capsule on a leader.
- **Why:** Renders of an untested v7 will be wrong by November; photos are proof.
- **Context:** Device section and `/device` take an image list; swapping is content only.
- **Effort:** S → S. **Depends on:** first trip.

## P3

### Home LCP back under 2.5 s
- **What:** Get the simulated-4G LCP of the home route from ~3.1 s to under 2.5 s.
- **Why:** 2.5 s is Google's "good" line. Measured 2026-10-08: the hero image (14 kB) is
  discovered at 53 ms but shares the first seconds with three preloaded font files
  (53 kB) and hydration adds ~0.7 s of render delay on a throttled CPU. CI budget sits
  at 3.5 s until this lands.
- **Context:** Candidates: one Poppins weight instead of two, DM Sans static 400/700
  instead of the variable file, hydrate the hero last, inline the hero as a 400px
  base64 placeholder that the full image replaces.
- **Effort:** S. **Depends on:** nothing.

### Astro migration if budgets fail
- **What:** Re-platform the home route on Astro with islands for the two animated sections.
- **Why:** About 60 kB less JS. Measured 2026-10-08: the home route ships 213 kB gzipped,
  of which React 19 + the Next runtime are ~165 kB and GSAP core + ScrollTrigger +
  ScrollSmoother ~46 kB. The CI budget was raised to 250 kB; Astro is the way back under 200.
- **Context:** Taste decision T1 kept Next.js for owner familiarity. Sections are plain
  React components with `useGSAP`, which port cleanly to Astro islands.
- **Effort:** M → S. **Depends on:** Lighthouse CI failing after the vertical slice.

### Printable one-sheet for dockside conversations
- **What:** One A4 page, Japanese, device photo, what we ask of a boat, a phone number.
- **Why:** The real first-audience conversation happens on a dock, not in a browser.
- **Context:** Reuse the deck tokens and the hero scene; export from the site's print
  stylesheet or from the deck script.
- **Effort:** S → S. **Depends on:** UC2 and contact details.
