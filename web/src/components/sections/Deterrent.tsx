"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, Hypothesis, IconStats, Section } from "@/components/ui";
import { sceneReveal, titleReveal } from "@/lib/motion";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

const d = t("deterrent");

/**
 * Deterrent: Step 2, always inside <Hypothesis>. Scene left with a one-time
 * halo pulse around the unit when the section enters; copy right with the
 * mint step chip and the yellow hypothesis chip side by side.
 */
export function Deterrent() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(q("[data-halo]"), { autoAlpha: 0, scale: 1, transformOrigin: "50% 50%" });
        gsap.set(q("[data-label]"), { autoAlpha: 0, y: 8 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
        sceneReveal(tl, q("[data-scene]")[0], 0);
        const revertTitle = titleReveal(tl, q("[data-title]")[0], 0.2);
        tl.to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.1)
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.4)
          // One-time halo: the field switches on around the unit, then fades.
          .fromTo(q("[data-halo]"), { autoAlpha: 0.9, scale: 1 }, { autoAlpha: 0, scale: 1.6, duration: 1.4, ease: "power2.out" }, 0.6)
          .to(q("[data-label]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 1.0);

        // The field keeps pulsing while the section is on screen.
        const rings = gsap.fromTo(
          q("[data-ring]"),
          { scale: 0.35, autoAlpha: 0.85 },
          {
            scale: 2.4,
            autoAlpha: 0,
            duration: 2.6,
            ease: "power1.out",
            stagger: { each: 0.85, repeat: -1 },
            paused: true,
            scrollTrigger: { trigger: root.current, start: "top 80%", end: "bottom 20%", toggleActions: "play pause resume pause" },
          },
        );

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          rings.scrollTrigger?.kill();
          rings.kill();
          revertTitle();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="protect" theme="yellow">
      <div ref={root}>
        <Hypothesis
          note={
            <>
              <strong className="font-bold text-ink">{d.note_label}</strong> {d.note}
            </>
          }
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <div data-scene className="relative aspect-[16/9] overflow-hidden rounded-card bg-cyan-bg">
              <Image
                src="/scenes/deterrent.jpg"
                alt="A hooked tuna on the leader with the sealed unit above the hook, and a shark turning away from a faint field around it."
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
              <svg
                data-halo
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 100 100"
                className="pointer-events-none absolute left-1/2 top-1/2 h-[46%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-60"
              >
                <circle cx="50" cy="50" r="46" fill="none" stroke="var(--c-mint-text)" strokeWidth="2.5" strokeDasharray="6 5" />
                <circle cx="50" cy="50" r="30" fill="var(--c-mint-bg)" fillOpacity="0.35" stroke="var(--c-mint-text)" strokeWidth="1.5" />
              </svg>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  data-ring
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-mint-text opacity-0"
                />
              ))}
              <span data-label className="absolute right-4 top-4 rounded-chip bg-white px-3 py-1.5 text-[12px] font-bold text-ink shadow-[0_1px_4px_rgba(20,26,31,0.12)]">
                {d.label_keeps}
              </span>
            </div>

            <div className="lg:pl-2">
              <div data-rise className="flex flex-wrap gap-2">
                <Chip tone="mint">{d.chip}</Chip>
                <Chip tone="yellow">{d.hyp}</Chip>
              </div>
              <h2 id="protect-title" data-title className="t-title mt-5">
                <span className="block">{d.title_a}</span>
                <span className="block">{d.title_b}</span>
                <span className="block">{d.title_c}</span>
              </h2>
              <AccentBar className="mt-6" data-bar />
              <p data-rise className="t-lead mt-6 max-w-md">
                {d.lead}
              </p>
              <div data-rise className="mt-8">
                <IconStats
                  items={[
                    { icon: "target", tone: "mint", label: d.k_target },
                    { icon: "power", tone: "yellow", label: d.k_off },
                    { icon: "fin", tone: "blue", label: d.k_catch },
                  ]}
                />
              </div>
            </div>
          </div>
        </Hypothesis>
      </div>
    </Section>
  );
}
