"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, IconCircle, Section } from "@/components/ui";
import { Turntable } from "@/components/Turntable";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

const u = t("unit");

const features = [
  { icon: "unit", tone: "mint", label: u.f_housing, text: u.f_housing_d },
  { icon: "clipboard", tone: "blue", label: u.f_log, text: u.f_log_d },
  { icon: "signal", tone: "mint", label: u.f_sense, text: u.f_sense_d },
  { icon: "bolt", tone: "yellow", label: u.f_electrodes, text: u.f_electrodes_d },
  { icon: "battery", tone: "blue", label: u.f_power, text: u.f_power_d },
] as const;

/** Callouts over the turntable, each appears once the turn passes its point. */
const callouts = [
  { at: 0.17, text: u.f_housing, tone: "mint", pos: "left-2 top-[18%] lg:left-0" },
  { at: 0.46, text: u.f_sense, tone: "blue", pos: "right-2 top-[42%] lg:right-0" },
  { at: 0.75, text: u.f_electrodes, tone: "yellow", pos: "left-2 bottom-[14%] lg:left-0" },
] as const;

const pill: Record<string, string> = {
  mint: "bg-mint-bg text-mint-text",
  blue: "bg-blue-bg text-blue-text",
  yellow: "bg-yellow-bg text-yellow-text",
};

/**
 * Unit: the pinned turntable. The section wrapper is the pin trigger, so the
 * Turntable pins the whole block once for 300vh and reports progress back;
 * callouts toggle on that progress. With reduced motion the Turntable shows
 * its slider, nothing pins, and every callout is visible from the start.
 */
export function Unit() {
  const root = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const [motion, setMotion] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        setMotion(true);
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(q("[data-feature]"), { autoAlpha: 0, y: 16 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        tl.to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0)
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.3)
          .to(q("[data-feature]"), { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.07 }, 0.5);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          setMotion(false);
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="device">
      <div ref={root} data-device-pin className="grid items-center gap-8 pt-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:pt-4">
        <div className="relative mx-auto w-full max-w-[340px] lg:max-w-none">
          <Turntable pinVh={300} pinSelector="[data-device-pin]" onProgress={setP} />
          {callouts.map((c) => {
            const on = !motion || p >= c.at;
            return (
              <span
                key={c.at}
                data-callout
                aria-hidden={!on}
                className={`pointer-events-none absolute rounded-chip px-3 py-1.5 text-[12px] font-bold shadow-[0_1px_4px_rgba(20,26,31,0.12)] transition-[opacity,transform] duration-500 ${pill[c.tone]} ${c.pos} ${
                  on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                }`}
              >
                {c.text}
              </span>
            );
          })}
        </div>

        <div>
          <div data-rise>
            <Chip tone="mint">{u.chip}</Chip>
          </div>
          <h2 id="device-title" data-rise className="t-title mt-5">
            <span className="block">{u.title_a}</span>
            <span className="block">{u.title_b}</span>
          </h2>
          <AccentBar className="mt-6" data-bar />
          <p data-rise className="t-lead mt-6 max-w-md">
            {u.lead}
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-5">
            {features.map((f) => (
              <li key={f.label} data-feature className="flex items-start gap-3">
                <IconCircle icon={f.icon} tone={f.tone} size={44} />
                <div className="min-w-0">
                  <p className="text-[15px] font-bold leading-tight text-ink">{f.label}</p>
                  <p className="mt-1 text-[13px] leading-snug text-text">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <p data-rise className="mt-7 text-[12px] font-bold uppercase tracking-[0.14em] text-muted">
            {u.scale}
          </p>
          <p data-rise className="mt-2 text-[13px] text-muted">
            {u.note}
          </p>
        </div>
      </div>
    </Section>
  );
}
