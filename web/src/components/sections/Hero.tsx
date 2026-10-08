"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, IconStats } from "@/components/ui";
import { popIn, titleReveal } from "@/lib/motion";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

const h = t("hero");

/**
 * Hero: illustration left, copy right. Entrance: a cover slides off the
 * scene while the picture settles from a zoom, the title rises character by
 * character out of masked lines, chips pop. Idle: the scene breathes and
 * tilts towards the pointer on desktop. Scroll: scene lags, copy drifts up
 * and fades, the scroll cue goes first. All hidden states are set in JS, so
 * with JS off or reduced motion everything is simply in place.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { ok: "(prefers-reduced-motion: no-preference)", pointer: "(hover: hover) and (min-width: 1024px)" },
        (ctx) => {
          const { ok, pointer } = ctx.conditions as { ok: boolean; pointer: boolean };
          if (!ok) return;
          const q = gsap.utils.selector(root);
          const scene = q("[data-scene]")[0];
          const cover = q("[data-cover]")[0];

          gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
          gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });
          gsap.set(q("[data-scene-img]"), { scale: 1.18, transformOrigin: "40% 60%" });
          gsap.set(cover, { display: "block", xPercent: 0 });
          gsap.set(scene, { transformPerspective: 1200 });

          // Idle breathing, started once the entrance is done.
          const float = gsap.to(scene, { y: -10, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true });

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          // The cover slides off; the image underneath is painted from the first frame (it is the LCP element).
          tl.to(cover, { xPercent: 101, duration: 1.1, ease: "power4.inOut" }, 0)
            .to(q("[data-scene-img]"), { scale: 1, duration: 1.7 }, 0.1)
            .to(q("[data-chip]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 0.2)
            .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.95)
            .to(q("[data-rise]:not([data-chip])"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 1.05)
            .add(() => float.play(), 1.3);
          popIn(tl, q("[data-pop] > *"), 1.2);
          const revertTitle = titleReveal(tl, q("[data-title]")[0], 0.35, { chars: true });

          // Scroll: parallax and the exit of the copy.
          const scrub = gsap.timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          });
          scrub
            .to(scene, { yPercent: 18, ease: "none" }, 0)
            .to(q("[data-copy]"), { yPercent: -12, autoAlpha: 0.1, ease: "none" }, 0)
            .to(q("[data-cue]"), { autoAlpha: 0, y: 24, ease: "none", duration: 0.2 }, 0);
          const bounce = gsap.to(q("[data-cue] svg"), { y: 6, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: -1 });

          // Pointer: a small 3D tilt towards the cursor.
          const el = root.current!;
          let onMove: ((e: PointerEvent) => void) | undefined;
          let onLeave: (() => void) | undefined;
          if (pointer) {
            const rx = gsap.quickTo(scene, "rotationX", { duration: 0.9, ease: "power3" });
            const ry = gsap.quickTo(scene, "rotationY", { duration: 0.9, ease: "power3" });
            onMove = (e) => {
              const r = el.getBoundingClientRect();
              const px = (e.clientX - r.left) / r.width - 0.5;
              const py = (e.clientY - r.top) / r.height - 0.5;
              ry(px * 9);
              rx(-py * 7);
            };
            onLeave = () => { ry(0); rx(0); };
            el.addEventListener("pointermove", onMove);
            el.addEventListener("pointerleave", onLeave);
          }

          return () => {
            tl.kill();
            float.kill();
            scrub.scrollTrigger?.kill();
            scrub.kill();
            bounce.kill();
            revertTitle();
            if (onMove) el.removeEventListener("pointermove", onMove);
            if (onLeave) el.removeEventListener("pointerleave", onLeave);
          };
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="story"
      data-theme="offwhite"
      className="relative overflow-hidden pt-24 lg:flex lg:min-h-[92vh] lg:items-center lg:pt-20"
      aria-labelledby="hero-title"
    >
      <div className="container-site grid w-full items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div data-scene className="relative aspect-[5/4] overflow-hidden rounded-card bg-cyan-bg will-change-transform">
          <div data-scene-img className="absolute inset-0">
            <Image
              src="/scenes/hero.jpg"
              alt="A hooked bluefin tuna on a longline leader with a small sealed logger above the hook, and a cautious blue shark keeping its distance."
              fill
              priority
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover object-left"
            />
          </div>
          {/* Shown only by the motion branch; hidden with JS off so the picture is never covered. */}
          <div data-cover aria-hidden="true" className="absolute inset-0 hidden bg-offwhite" />
        </div>

        <div data-copy className="lg:pl-4">
          <div data-rise data-chip>
            <Chip tone="mint">{h.chip}</Chip>
          </div>
          <h1 id="hero-title" data-title aria-label={`${h.title_a} ${h.title_b}`} className="t-display mt-5">
            <span className="block">{h.title_a}</span>
            <span className="block">{h.title_b}</span>
          </h1>
          <AccentBar className="mt-6" data-bar />
          <p data-rise className="t-lead mt-6 max-w-md">
            <span className="block">{h.lead_a}</span>
            <span className="block">{h.lead_b}</span>
          </p>
          <div data-pop className="mt-6 flex flex-wrap gap-2">
            <Chip tone="mint">{h.count}</Chip>
            <Chip tone="yellow">{h.protect}</Chip>
          </div>
          <nav data-rise aria-label="Jump to" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-medium">
            <a href="#method" className="border-b-2 border-mint-bar text-ink">{h.jump_method}</a>
            <a href="#device" className="border-b-2 border-mint-bar text-ink">{h.jump_device}</a>
            <a href="#problem" className="border-b-2 border-mint-bar text-ink">{h.jump_story}</a>
          </nav>
          <div data-rise className="mt-10">
            <IconStats
              items={[
                { icon: "target", tone: "mint", label: h.stat_log },
                { icon: "battery", tone: "yellow", label: h.stat_sealed },
                { icon: "bolt", tone: "blue", label: h.stat_deterrent },
              ]}
            />
          </div>
          <p data-rise className="mt-8 text-[12px] text-muted">{h.caption}</p>
        </div>
      </div>

      <div
        data-cue
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-muted lg:flex"
      >
        {h.scroll_cue}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2.5v11M3.5 9l4.5 4.5L12.5 9" />
        </svg>
      </div>
    </section>
  );
}
