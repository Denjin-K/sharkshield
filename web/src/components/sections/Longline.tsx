"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, Section } from "@/components/ui";
import { titleReveal } from "@/lib/motion";
import { t } from "@/lib/t";
// TODO(track-a): LonglineDiagram / longlineLabels are owned by Track A (src/components/diagrams/LonglineDiagram.tsx).
import { LonglineDiagram, branches, FLOAT_X, BEACON_X, STERN, BOAT_TRAVEL, bitePoint, hookedBranch } from "@/components/diagrams/LonglineDiagram";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, MotionPathPlugin);

const l = t("longline");

const stats = [
  { value: l.stat_mainline_value, label: l.stat_mainline_label },
  { value: l.stat_hooks_value, label: l.stat_hooks_label },
  { value: l.stat_spacing_value, label: l.stat_spacing_label },
  { value: l.stat_soak_value, label: l.stat_soak_label },
];

/**
 * Turns "800–3,000" into tweens on each number, writing the formatted string
 * back to textContent on every update. Non-numeric parts stay as they are.
 */
function countUp(el: HTMLElement, tl: gsap.core.Timeline, at: number) {
  const final = el.textContent ?? "";
  const parts = final.split(/(\d[\d,]*)/);
  const grouped = final.includes(",");
  const state: Record<string, number> = {};
  const fmt = (v: number) => (grouped ? Math.round(v).toLocaleString("en-US") : String(Math.round(v)));
  const render = () => {
    el.textContent = parts.map((p, i) => (i % 2 === 1 ? fmt(state[`n${i}`]) : p)).join("");
  };
  parts.forEach((p, i) => {
    if (i % 2 === 0) return;
    const key = `n${i}`;
    state[key] = 0;
    tl.to(state, { [key]: Number(p.replace(/,/g, "")), duration: 0.8, ease: "power1.out", onUpdate: render }, at);
  });
  render();
  return () => {
    el.textContent = final;
  };
}

/**
 * Longline: the pinned "how the tuna are caught" diagram. The whole block pins
 * for 250vh while the mainline draws, floats pop, branch lines and hooks
 * arrive and the four gear stats count up. With reduced motion nothing pins
 * and the finished diagram simply sits on the page.
 */
export function Longline() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const one = (sel: string) => q(sel)[0];
        const mainline = one("#mainline");
        const boat = one("#boat");
        const beacon = one("#beacon");
        const shark = one("#shark");
        const tunaHooked = one("#tuna-hooked");
        const tunaFree = one("#tuna-free");
        const statEls = q("[data-stat]");
        const valueEls = q("[data-stat-value]") as HTMLElement[];

        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });

        // Start state of the scene: boat out at the beacon end, nothing set yet.
        gsap.set(mainline, { drawSVG: "100% 100%" });
        gsap.set(boat, { x: BOAT_TRAVEL });
        gsap.set(beacon, { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 100%" });
        FLOAT_X.forEach((_, i) => {
          gsap.set(one(`#floatline-${i + 1}`), { drawSVG: "0%" });
          gsap.set(one(`#float-${i + 1}`), { scale: 0, transformOrigin: "50% 50%" });
        });
        branches.forEach((b) => {
          gsap.set(one(`#branch-${b.n}`), { drawSVG: "0%" });
          // origins relative to each piece's own box: svgOrigin inside the swaying snood group resolves wrongly
          gsap.set(one(`#hook-${b.n}`), { autoAlpha: 0, rotation: -40, transformOrigin: "0% 0%" });
          gsap.set(one(`#unit-${b.n}`), { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 0%" });
          gsap.set(one(`#bait-${b.n}`), { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 0%" });
        });
        gsap.set([tunaHooked, tunaFree], { autoAlpha: 0 });
        gsap.set(shark, { x: 280, autoAlpha: 0 });
        gsap.set(statEls, { autoAlpha: 0, y: 16 });

        // Copy reveals once when the block arrives.
        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        intro
          .to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 })
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.3);
        const revertTitle = titleReveal(intro, q("[data-title]")[0], 0.05);

        // The set, scrubbed over the pin: the boat sails home paying the line out behind it.
        const SET_START = 0.25;
        const SET_LEN = 3.2;
        const passAt = (x: number) => SET_START + SET_LEN * ((BEACON_X - x) / (BEACON_X - STERN.x));
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top 72px",
            end: "+=520%", // long: the set should be read, not flashed past
            pin: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(beacon, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, 0.05)
          .to(boat, { x: 0, duration: SET_LEN }, SET_START)
          .to(mainline, { drawSVG: "0% 100%", duration: SET_LEN }, SET_START);
        FLOAT_X.forEach((x, i) => {
          const at = passAt(x);
          tl.to(one(`#float-${i + 1}`), { scale: 1, duration: 0.25, ease: "back.out(2.5)" }, at)
            .to(one(`#floatline-${i + 1}`), { drawSVG: "100%", duration: 0.25 }, at + 0.05);
        });
        branches.forEach((b) => {
          const at = passAt(b.x) + 0.08;
          tl.to(one(`#branch-${b.n}`), { drawSVG: "100%", duration: 0.3, ease: "power1.inOut" }, at)
            .to(one(`#hook-${b.n}`), { autoAlpha: 1, rotation: 0, duration: 0.35, ease: "back.out(1.6)" }, at + 0.2)
            .to(one(`#unit-${b.n}`), { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2.5)" }, at + 0.3)
            .to(one(`#bait-${b.n}`), { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, at + 0.4);
        });
        // After the set: a tuna cruises in, another takes a hook, the numbers land.
        const SOAK = SET_START + SET_LEN + 0.2;
        tl.to(tunaFree, { autoAlpha: 1, duration: 0.2 }, SOAK)
          .fromTo(
            tunaFree,
            { x: 720, y: -40 },
            { motionPath: { path: [{ x: 720, y: -40 }, { x: 480, y: 10 }, { x: 240, y: -20 }, { x: 0, y: 0 }], curviness: 1.3 }, duration: 1.2, ease: "power1.inOut" },
            SOAK,
          )
          .to(tunaHooked, { autoAlpha: 1, duration: 0.15 }, SOAK + 0.5)
          .fromTo(tunaHooked, { x: 300, y: 30 }, { x: 0, y: 0, duration: 0.9, ease: "power2.out" }, SOAK + 0.5)
          // it takes the bait: hook and bait are gone, the line now runs into its mouth
          .to([one(`#hook-${hookedBranch}`), one(`#bait-${hookedBranch}`)], { autoAlpha: 0, duration: 0.08 }, SOAK + 1.35)
          .fromTo(tunaHooked, { rotation: 0 }, { rotation: -9, duration: 0.12, repeat: 5, yoyo: true, svgOrigin: `${bitePoint.x} ${bitePoint.y}` }, SOAK + 1.4);
        tl.to(statEls, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" }, SOAK + 1.2);
        const restores = valueEls.map((el) => countUp(el, tl, SOAK + 1.3));
        // The shark goes for the hooked tuna. The unit on that line fires, the shark
        // jolts back, turns and bolts.
        const zap = one("#zap");
        const sharkAway = one("#shark-away");
        gsap.set(sharkAway, { autoAlpha: 0 });
        gsap.set(one("#zap-flash"), { autoAlpha: 0, scale: 0.2, transformOrigin: "50% 50%" });
        gsap.set(zap, { autoAlpha: 0 });
        // origins relative to each element's own box: these live inside scaled groups
        gsap.set(q("[id^='zap-ring-']"), { scale: 0.3, autoAlpha: 0, transformOrigin: "50% 50%" });
        gsap.set(q("[id^='bolt-']"), { autoAlpha: 0, scale: 0.4, transformOrigin: "0% 50%" });
        const APPROACH = SOAK + 1.9;
        const FIRE = APPROACH + 1.25;
        tl.to(shark, { autoAlpha: 1, duration: 0.2 }, APPROACH)
          .to(shark, { x: -36, y: -6, duration: 1.2, ease: "power1.inOut" }, APPROACH)
          // the field snaps on: flash, core, two rings racing out, bolts flickering
          .to(zap, { autoAlpha: 1, duration: 0.05 }, FIRE)
          .to(one("#zap-flash"), { keyframes: { autoAlpha: [0, 0.9, 0], scale: [0.2, 2.2, 3] }, duration: 0.35, ease: "power2.out" }, FIRE)
          .fromTo(one("#zap-core"), { scale: 0.2, transformOrigin: "50% 50%" }, { scale: 1.3, duration: 0.25, ease: "back.out(3)" }, FIRE)
          .to(one("#zap-ring-1"), { scale: 4.5, autoAlpha: 1, duration: 0.45, ease: "power2.out" }, FIRE)
          .to(one("#zap-ring-1"), { autoAlpha: 0, duration: 0.25 }, FIRE + 0.3)
          .to(one("#zap-ring-2"), { scale: 6.5, autoAlpha: 0.8, duration: 0.6, ease: "power2.out" }, FIRE + 0.12)
          .to(one("#zap-ring-2"), { autoAlpha: 0, duration: 0.3 }, FIRE + 0.5)
          .to(q("[id^='bolt-']"), { keyframes: { autoAlpha: [0, 1, 0.3, 1, 0.2, 1, 0], scale: [0.4, 1.1, 0.9, 1.25, 1, 1.1, 0.6] }, duration: 0.9, stagger: 0.05 }, FIRE)
          .to(one("#zap-core"), { autoAlpha: 0, scale: 0.4, duration: 0.3 }, FIRE + 0.6)
          .to(zap, { autoAlpha: 0, duration: 0.1 }, FIRE + 0.9)
          // the shark shudders on the spot, turns at once, and swims off nose first at a calm pace
          .to(shark, { keyframes: { x: [-36, -28, -44, -30, -42, -36], y: [-6, -10, -2, -9, -4, -6] }, duration: 0.35, ease: "none" }, FIRE)
          .to(shark, { autoAlpha: 0, duration: 0.06 }, FIRE + 0.36)
          .fromTo(sharkAway, { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 1, duration: 0.06 }, FIRE + 0.42)
          .to(sharkAway, { x: 480, y: -30, duration: 2.8, ease: "power1.in" }, FIRE + 0.45)
          .to(sharkAway, { autoAlpha: 0, duration: 0.3 }, FIRE + 3.0)
          .to({}, { duration: 0.4 }, FIRE + 3.3); // breathing room before the pin releases

        // Ambient loops, only while the section is on screen.
        const ambient = gsap.timeline({
          repeat: -1,
          paused: true,
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", toggleActions: "play pause resume pause" },
        });
        ambient
          .fromTo(one("#surface"), { x: 0 }, { x: -50, duration: 2.4, ease: "none", repeat: -1 }, 0)
          .fromTo(one("#surface-2"), { x: 0 }, { x: 50, duration: 3.1, ease: "none", repeat: -1 }, 0)
          .to(boat, { y: 3, duration: 1.7, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0)
          .to(boat, { rotation: 1.2, svgOrigin: `${STERN.x - 90} ${STERN.y}`, duration: 2.3, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0)
          .to(beacon, { y: 3, rotation: -3, svgOrigin: `${BEACON_X} ${STERN.y}`, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0)
          .to(q("[id^='float-']"), { y: 3, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.3 } }, 0)
          .to(q("[id^='snood-']"), { rotation: 3, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1, stagger: { each: 0.13, from: "random" } }, 0)
          .to(tunaFree, { y: "+=5", duration: 1.3, ease: "sine.inOut", yoyo: true, repeat: -1 }, 0);
        branches.forEach((b) => gsap.set(one(`#snood-${b.n}`), { transformOrigin: "0% 0%" }));
        q("[id^='bubble-']").forEach((el, i) => {
          ambient.fromTo(
            el,
            { y: 0, autoAlpha: 0 },
            { y: -(300 + (i % 3) * 30), autoAlpha: 0.9, duration: 5 + (i % 4) * 1.3, ease: "none", repeat: -1, repeatDelay: 0.6 },
            i * 0.7,
          );
        });

        return () => {
          intro.scrollTrigger?.kill();
          intro.kill();
          tl.scrollTrigger?.kill();
          tl.kill();
          ambient.scrollTrigger?.kill();
          ambient.kill();
          restores.forEach((r) => r());
          revertTitle();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="method" theme="cyan">
      <div ref={root}>
        <div className="grid items-end gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <div data-rise>
              <Chip tone="blue">{l.chip}</Chip>
            </div>
            <h2 id="method-title" data-title className="t-title mt-5">
              {l.title}
            </h2>
            <AccentBar className="mt-5" data-bar />
          </div>
          <p data-rise className="t-lead max-w-lg lg:pb-1">
            {l.lead}
          </p>
        </div>

        <div className="relative mx-auto mt-6 w-full max-w-[900px] lg:mt-8">
          <LonglineDiagram />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-5 lg:mt-7 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} data-stat className="flex flex-col gap-1">
              <dt className="order-2 text-[13px] font-medium text-muted">{s.label}</dt>
              <dd data-stat-value className="order-1 font-display text-[28px] font-extrabold leading-none tracking-tight text-ink lg:text-[34px]">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 max-w-3xl text-[13px] leading-relaxed text-muted">{l.sources}</p>
      </div>
    </Section>
  );
}
