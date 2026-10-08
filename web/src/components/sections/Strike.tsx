"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, IconStats, Section } from "@/components/ui";
import { sceneReveal, titleReveal } from "@/lib/motion";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

const s = t("strike");

/**
 * Strike: the problem. Scene left, copy right. The scene slides in a little
 * from the right as it scrolls into view (the shark arriving); the copy
 * rises once. Reveal only, no pin.
 */
export function Strike() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(q("[data-scene-img]"), { xPercent: 6, scale: 1.04, transformOrigin: "100% 50%" });
        gsap.set(q("[data-label]"), { autoAlpha: 0, y: 8 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        sceneReveal(tl, q("[data-scene]")[0], 0, { zoom: false });
        const revertTitle = titleReveal(tl, q("[data-title]")[0], 0.2);
        tl.to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.1)
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.4)
          .to(q("[data-label]"), { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.2 }, 0.8);

        // The shark arrives: the whole scene drifts in from the right with the scroll.
        const drift = gsap.to(q("[data-scene-img]"), {
          xPercent: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 85%", end: "center 45%", scrub: true },
        });

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          drift.scrollTrigger?.kill();
          drift.kill();
          revertTitle();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="problem" theme="pink">
      <div ref={root} className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div data-scene className="relative aspect-[16/9] overflow-hidden rounded-card bg-cyan-bg">
          <div data-scene-img className="absolute inset-0">
            <Image
              src="/scenes/strike.jpg"
              alt="A hooked tuna being hauled towards the boat while a shark closes in from behind it."
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
            />
          </div>
          <span data-label className="absolute right-4 top-4 rounded-chip bg-white px-3 py-1.5 text-[12px] font-bold text-ink shadow-[0_1px_4px_rgba(20,26,31,0.12)]">
            {s.label_haul}
          </span>
          <span data-label className="absolute bottom-4 left-4 rounded-chip bg-pink-bg px-3 py-1.5 text-[12px] font-bold text-pink-text shadow-[0_1px_4px_rgba(20,26,31,0.12)]">
            {s.label_strike}
          </span>
        </div>

        <div className="lg:pl-2">
          <div data-rise>
            <Chip tone="pink">{s.chip}</Chip>
          </div>
          <h2 id="problem-title" data-title className="t-title mt-5">
            <span className="block">{s.title_a}</span>
            <span className="block">{s.title_b}</span>
          </h2>
          <AccentBar className="mt-6" data-bar />
          <p data-rise className="t-lead mt-6 max-w-md">
            {s.lead}
          </p>
          <div data-rise className="mt-6 rounded-panel bg-yellow-bg px-5 py-4 text-[16px] leading-snug">
            <p className="font-bold text-ink">{s.callout_q}</p>
            <p className="mt-1 text-yellow-text">{s.callout_a}</p>
          </div>
          <div data-rise className="mt-8">
            <IconStats
              items={[
                { icon: "fish_x", tone: "pink", label: s.cost_fish },
                { icon: "tag", tone: "yellow", label: s.cost_price },
                { icon: "clock", tone: "blue", label: s.cost_time },
              ]}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
