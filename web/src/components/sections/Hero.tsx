"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, IconStats } from "@/components/ui";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger, SplitText);

const h = t("hero");

/**
 * Hero: illustration left, copy right. Motion runs only without reduced
 * motion. Initial hidden states are set here in JS, so with JS off every
 * element is visible and in place.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-scene]"), { scale: 0.97, transformOrigin: "50% 60%" }); // never hide it: it is the LCP element
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });

        let split: SplitText | undefined;
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        const play = () => {
          const title = q("[data-title]")[0];
          split = SplitText.create(title, { type: "words", wordsClass: "inline-block" });
          gsap.set(split.words, { yPercent: 110, autoAlpha: 0 });
          tl.to(q("[data-scene]"), { scale: 1, duration: 1.1 }, 0)
            .to(q("[data-chip]"), { autoAlpha: 1, y: 0, duration: 0.5 }, 0.15)
            .to(split.words, { yPercent: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12 }, 0.25)
            .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.7)
            .to(q("[data-rise]:not([data-chip])"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.8);
        };

        // Split only once the display font is in, or line breaks shift mid-animation.
        if (document.fonts?.status === "loaded") play();
        else document.fonts.ready.then(play);

        // Gentle parallax: the scene moves slower than the copy on scroll.
        const scene = q("[data-scene]")[0];
        const parallax = gsap.to(scene, {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });

        return () => {
          tl.kill();
          parallax.scrollTrigger?.kill();
          split?.revert();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="story" className="relative overflow-hidden pt-24 lg:pt-28" aria-labelledby="hero-title">
      <div className="container-site grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div data-scene className="relative aspect-[5/4] overflow-hidden rounded-card">
          <Image
            src="/scenes/hero.jpg"
            alt="A hooked bluefin tuna on a longline leader with a small sealed logger above the hook, and a cautious blue shark keeping its distance."
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover object-left"
          />
        </div>

        <div className="lg:pl-4">
          <div data-rise data-chip>
            <Chip tone="mint">{h.chip}</Chip>
          </div>
          <h1 id="hero-title" data-title aria-label={`${h.title_a} ${h.title_b}`} className="t-display mt-5 overflow-hidden">
            <span className="block">{h.title_a}</span>
            <span className="block">{h.title_b}</span>
          </h1>
          <AccentBar className="mt-6" data-bar />
          <p data-rise className="t-lead mt-6 max-w-md">
            <span className="block">{h.lead_a}</span>
            <span className="block">{h.lead_b}</span>
          </p>
          <div data-rise className="mt-6 flex flex-wrap gap-2">
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
    </section>
  );
}
