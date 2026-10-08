"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/**
 * Ink band of looping display text. It drifts on its own and speeds up or
 * reverses with scroll velocity. The visible copy is aria-hidden; the items
 * are read once from the sr-only paragraph. With reduced motion it is a
 * static band.
 */
export function Marquee({ items }: { items: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>("[data-track]")!;
        const loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 28, repeat: -1 });
        let idle: gsap.core.Tween | undefined;
        const st = ScrollTrigger.create({
          onUpdate: (self) => {
            const ts = 1 + gsap.utils.clamp(-3, 3, self.getVelocity() / 400);
            gsap.to(loop, { timeScale: ts, duration: 0.35, overwrite: true });
            idle?.kill();
            idle = gsap.to(loop, { timeScale: 1, duration: 1.4, delay: 0.5, ease: "power2.out" });
          },
        });
        return () => {
          st.kill();
          idle?.kill();
          loop.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const doubled = [...items, ...items];
  return (
    <div ref={root} className="overflow-hidden bg-ink py-5 lg:py-7">
      <p className="sr-only">{items.join(". ")}</p>
      <div data-track aria-hidden="true" className="flex w-max items-center whitespace-nowrap will-change-transform">
        {doubled.map((text, i) => (
          <span key={i} className="flex items-center">
            <span className="t-marquee px-6 lg:px-10">{text}</span>
            <span className="block h-2.5 w-2.5 rounded-full bg-mint-bar lg:h-3 lg:w-3" />
          </span>
        ))}
      </div>
    </div>
  );
}
