"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, Section } from "@/components/ui";
import { t } from "@/lib/t";
// TODO(track-a): SignalTrace / signalPhases are owned by Track A (src/components/diagrams/SignalTrace.tsx).
import { SignalTrace, signalPhases } from "@/components/diagrams/SignalTrace";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

const lg = t("logged");
const copy = lg as Record<string, string>;

/** Local shape of a phase anchor so this file never depends on Track A's types. */
type Phase = { id: string; x: number; text: string };
const phases: Phase[] = (signalPhases as Phase[]) ?? [];
const phaseText = (ph: Phase) => copy[ph.id] ?? ph.text;

const outcomes = [
  { key: "intact", img: "/scenes/tuna_intact.png", bg: "bg-mint-bg", title: lg.o_intact, text: lg.o_intact_d, alt: "A whole tuna, landed intact." },
  { key: "damaged", img: "/scenes/tuna_damaged.png", bg: "bg-yellow-bg", title: lg.o_damaged, text: lg.o_damaged_d, alt: "A tuna with a bite taken out of its tail." },
  { key: "lost", img: "/scenes/tuna_lost.png", bg: "bg-pink-bg", title: lg.o_lost, text: lg.o_lost_d, alt: "Only the tuna's head left on the hook." },
];

/** Fraction of the path length at which the path first reaches x = cx. */
function fractionAtX(path: SVGPathElement, cx: number) {
  const total = path.getTotalLength();
  let lo = 0;
  let hi = total;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).x < cx) lo = mid;
    else hi = mid;
  }
  return lo / total;
}

/**
 * Logged: Step 1. Copy left, the signal panel right. The trace draws with the
 * scroll and the hook-up / strike markers pop as the line reaches them. The
 * three outcome cards snap-scroll horizontally below 768px.
 */
export function Logged() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const el = root.current;
        const signal = el?.querySelector<SVGPathElement>("#signal") ?? undefined;
        const markers = [el?.querySelector<SVGCircleElement>("#marker-hookup"), el?.querySelector<SVGCircleElement>("#marker-strike")].filter(
          (m): m is SVGCircleElement => !!m,
        );

        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(q("[data-panel]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-card]"), { autoAlpha: 0, y: 24 });
        if (signal) gsap.set(signal, { drawSVG: "0%" });
        gsap.set(markers, { scale: 0, transformOrigin: "50% 50%" });

        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        intro
          .to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0)
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.3)
          .to(q("[data-panel]"), { autoAlpha: 1, y: 0, duration: 0.8 }, 0.2);

        const cards = gsap.to(q("[data-card]"), {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: q("[data-cards]")[0], start: "top 85%" },
        });

        // The trace draws over the section; markers pop as the path reaches their x.
        const draw = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: q("[data-panel]")[0], start: "top 80%", end: "bottom 35%", scrub: true },
        });
        if (signal) {
          draw.to(signal, { drawSVG: "100%", duration: 1 }, 0);
          markers.forEach((m) => {
            const at = fractionAtX(signal, m.cx.baseVal.value);
            draw.to(m, { scale: 1, duration: 0.06, ease: "back.out(3)" }, at);
          });
        }

        return () => {
          intro.scrollTrigger?.kill();
          intro.kill();
          cards.scrollTrigger?.kill();
          cards.kill();
          draw.scrollTrigger?.kill();
          draw.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="measure">
      <div ref={root}>
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <div data-rise>
              <Chip tone="mint">{lg.chip}</Chip>
            </div>
            <h2 id="measure-title" data-rise className="t-title mt-5">
              <span className="block">{lg.title_a}</span>
              <span className="block">{lg.title_b}</span>
              <span className="block">{lg.title_c}</span>
            </h2>
            <AccentBar className="mt-6" data-bar />
            <p data-rise className="t-lead mt-6 max-w-md">
              {lg.lead}
            </p>
          </div>

          <figure data-panel className="rounded-panel bg-panel p-4 lg:p-6">
            <div className="relative h-8" aria-hidden="true">
              {phases.map((ph, i) => (
                <span
                  key={ph.id}
                  className={`absolute -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] text-muted lg:text-[11px] ${
                    i % 2 ? "top-4" : "top-0"
                  }`}
                  style={{ left: `${(ph.x / 1000) * 100}%` }}
                >
                  {phaseText(ph)}
                </span>
              ))}
            </div>
            <SignalTrace className="block h-auto w-full" />
            <figcaption className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[12px] text-muted">
              <span className="sr-only">{phases.map(phaseText).join(" · ")}</span>
              <span>{lg.chart_note}</span>
            </figcaption>
          </figure>
        </div>

        <ul
          data-cards
          className="-mx-6 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0"
        >
          {outcomes.map((o) => (
            <li
              key={o.key}
              data-card
              className={`flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-card md:w-auto ${o.bg}`}
            >
              <div className="relative aspect-[3/2] w-full">
                <Image src={o.img} alt={o.alt} fill sizes="(min-width: 768px) 33vw, 80vw" className="object-contain p-4" />
              </div>
              <div className="px-5 pb-5">
                <h3 className="font-display text-[18px] font-extrabold leading-tight text-ink">{o.title}</h3>
                <p className="mt-1.5 text-[14px] leading-snug text-text">{o.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
