"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, Section } from "@/components/ui";
import { t } from "@/lib/t";
// TODO(track-a): LonglineDiagram / longlineLabels are owned by Track A (src/components/diagrams/LonglineDiagram.tsx).
import { LonglineDiagram, longlineLabels } from "@/components/diagrams/LonglineDiagram";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const l = t("longline");
const copy = l as Record<string, string>;

/** Local shape of a diagram label so this file never depends on Track A's types. */
type DiagramLabel = { id: string; x: number; y: number; text: string; tone?: string };
const labels: DiagramLabel[] = (longlineLabels as DiagramLabel[]) ?? [];

/** Label ids are message keys (tag_*); fall back to the diagram's own text. */
const labelText = (lb: DiagramLabel) => copy[lb.id] ?? lb.text;

/** Too long for a 340px-wide diagram; the same numbers sit in the stats row below. */
const PHONE_HIDDEN = new Set(["tag_branch", "tag_mainline", "tag_stern"]);

const dot: Record<string, string> = {
  mint: "bg-mint-text",
  pink: "bg-pink-text",
  yellow: "bg-yellow-text",
  blue: "bg-blue-text",
  cyan: "bg-cyan-line",
  grey: "bg-grey-bar",
};

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
        const mainline = q("#mainline");
        const floats = q("[id^='float-']");
        const floatlines = q("[id^='floatline-']");
        const branches = q("[id^='branch-']");
        const hooks = q("[id^='hook-']");
        const boat = q("#boat");
        const beacon = q("#beacon");
        const tunaHooked = q("#tuna-hooked");
        const tunaFree = q("#tuna-free");
        const labelEls = q("[data-label]");
        const statEls = q("[data-stat]");
        const valueEls = q("[data-stat-value]") as HTMLElement[];

        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(mainline, { drawSVG: "0%" });
        gsap.set(floatlines, { drawSVG: "0%" });
        gsap.set(branches, { drawSVG: "0%" });
        gsap.set(floats, { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(hooks, { autoAlpha: 0, rotation: -35, transformOrigin: "50% 0%" });
        gsap.set([...boat, ...beacon], { autoAlpha: 0, x: -40 });
        gsap.set([...tunaHooked, ...tunaFree], { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
        gsap.set(labelEls, { autoAlpha: 0, y: 8 });
        gsap.set(statEls, { autoAlpha: 0, y: 16 });

        // Copy reveals once when the block arrives.
        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        intro
          .to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 })
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.3);

        // The set, scrubbed over the pin distance.
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top 72px",
            end: "+=250%",
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        const add = (targets: Element[], vars: gsap.TweenVars, at: number) => {
          if (targets.length) tl.to(targets, vars, at);
        };
        add(boat, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" }, 0);
        add(mainline, { drawSVG: "100%", duration: 3.2 }, 0.2);
        add(floatlines, { drawSVG: "100%", duration: 0.35, stagger: 0.6 }, 0.5);
        add(floats, { scale: 1, duration: 0.35, stagger: 0.6, ease: "back.out(2.5)" }, 0.6);
        add(branches, { drawSVG: "100%", duration: 0.45, stagger: 0.11, ease: "power1.inOut" }, 0.8);
        add(hooks, { autoAlpha: 1, rotation: 0, duration: 0.4, stagger: 0.11, ease: "back.out(1.6)" }, 1.1);
        add(beacon, { autoAlpha: 1, x: 0, duration: 0.5, ease: "power2.out" }, 3.3);
        add(tunaFree, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, 3.0);
        add(tunaHooked, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" }, 3.6);
        add(labelEls, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.45, ease: "power2.out" }, 1.4);
        add(statEls, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" }, 4.0);
        const restores = valueEls.map((el) => countUp(el, tl, 4.1));
        tl.to({}, { duration: 0.6 }, 5.0); // breathing room before the pin releases

        return () => {
          intro.scrollTrigger?.kill();
          intro.kill();
          tl.scrollTrigger?.kill();
          tl.kill();
          restores.forEach((r) => r());
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="method">
      <div ref={root} className="bg-offwhite">
        <div className="grid items-end gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          <div>
            <div data-rise>
              <Chip tone="blue">{l.chip}</Chip>
            </div>
            <h2 id="method-title" data-rise className="t-title mt-5">
              {l.title}
            </h2>
            <AccentBar className="mt-5" data-bar />
          </div>
          <p data-rise className="t-lead max-w-lg lg:pb-1">
            {l.lead}
          </p>
        </div>

        <div className="relative mx-auto mt-8 w-full max-w-[960px] lg:mt-10">
          <LonglineDiagram />
          {labels.map((lb) => (
            <span
              key={lb.id}
              data-label
              className={`absolute items-center gap-1.5 whitespace-nowrap rounded-chip bg-white px-2.5 py-1 text-[11px] font-bold leading-tight text-ink shadow-[0_1px_4px_rgba(20,26,31,0.12)] lg:text-[12px] ${
                lb.x > 850 ? "-translate-x-full" : lb.x < 100 ? "" : "-translate-x-1/2"
              } ${PHONE_HIDDEN.has(lb.id) ? "hidden sm:inline-flex" : "inline-flex"}`}
              style={{ left: `${(lb.x / 1000) * 100}%`, top: `${(lb.y / 420) * 100}%` }}
            >
              <span aria-hidden="true" className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot[lb.tone ?? "mint"] ?? dot.mint}`} />
              {labelText(lb)}
            </span>
          ))}
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-border pt-6 lg:mt-10 lg:grid-cols-4">
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
