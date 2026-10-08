"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, IconCircle, Section } from "@/components/ui";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

const r = t("research");

const threads = [
  { icon: "target", tone: "mint", text: r.thread_1 },
  { icon: "bolt", tone: "yellow", text: r.thread_2 },
  { icon: "shield", tone: "blue", text: r.thread_3 },
] as const;

/** ResearchCards: the three common threads from EEA 2026 and a link to the research page. */
export function ResearchCards() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(q("[data-card]"), { autoAlpha: 0, y: 24 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        tl.to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0)
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.3)
          .to(q("[data-card]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.4);

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
    <Section id="research">
      <div ref={root}>
        <div className="max-w-2xl">
          <div data-rise>
            <Chip tone="blue">{r.chip}</Chip>
          </div>
          <h2 id="research-title" data-rise className="t-title mt-5">
            {r.title}
          </h2>
          <AccentBar className="mt-6" data-bar />
          <p data-rise className="t-lead mt-6 max-w-xl">
            {r.lead}
          </p>
        </div>

        <h3 data-rise className="mt-10 text-[12px] font-bold uppercase tracking-[0.14em] text-muted">
          {r.threads_title}
        </h3>
        <ul className="mt-4 grid gap-4 md:grid-cols-3 md:gap-6">
          {threads.map((th) => (
            <li key={th.icon} data-card className="flex flex-col gap-4 rounded-card border border-border bg-white p-6">
              <IconCircle icon={th.icon} tone={th.tone} size={48} />
              <p className="text-[15px] leading-snug text-text">{th.text}</p>
            </li>
          ))}
        </ul>

        <p data-rise className="mt-8">
          <Link href="/research" className="inline-flex min-h-11 items-center rounded-chip border-2 border-ink px-6 text-[15px] font-bold text-ink">
            {r.cta}
          </Link>
        </p>
      </div>
    </Section>
  );
}
