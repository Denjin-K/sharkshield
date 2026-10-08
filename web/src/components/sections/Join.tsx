"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, Hypothesis, Section } from "@/components/ui";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

const j = t("join");

// Placeholder address until the project mailbox exists.
const CONTACT = "mailto:hello@sharkshield.example";
const REPO = "https://github.com/Denjin-K/sharkshield";

const btn = "inline-flex h-11 items-center justify-center rounded-chip px-6 text-[15px] font-bold whitespace-nowrap";
const primary = `${btn} bg-mint-bg text-mint-text ring-2 ring-mint-bar`;
const outline = `${btn} border-2 border-ink text-ink`;

/** Join: the closing call to take part, with the disclaimer inside <Hypothesis>. */
export function Join() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 80%" },
        });
        tl.to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0)
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.3);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="join" className="bg-panel/60">
      <div ref={root} className="max-w-3xl">
        <div data-rise>
          <Chip tone="mint">{j.chip}</Chip>
        </div>
        <h2 id="join-title" data-rise className="t-title mt-5">
          {j.title}
        </h2>
        <AccentBar className="mt-6" data-bar />
        <p data-rise className="t-lead mt-6 max-w-xl">
          {j.lead}
        </p>

        <ul data-rise className="mt-8 flex flex-wrap gap-3">
          <li>
            <a href={CONTACT} className={primary}>{j.cta_contact}</a>
          </li>
          <li>
            <a href={REPO} target="_blank" rel="noreferrer" className={outline}>{j.cta_github}</a>
          </li>
          <li>
            <Link href="/research" className={outline}>{j.cta_research}</Link>
          </li>
          <li>
            <Link href="/device" className={outline}>{j.cta_print}</Link>
          </li>
        </ul>

        <div data-rise className="mt-8">
          <Hypothesis note={j.disclaimer}>{null}</Hypothesis>
        </div>
        <p data-rise className="mt-6 text-[13px] text-muted">
          {j.built}
        </p>
      </div>
    </Section>
  );
}
