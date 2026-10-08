"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AccentBar, Chip, Hypothesis, IconCircle, Section } from "@/components/ui";
import { titleReveal } from "@/lib/motion";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

const c = t("comparison");
const site = t("site");

/** Product names, not copy: they stay as written on the devices themselves. */
const rivals = ["Kaien", "SharkGuard Sport", "RPELX"];

const columns = [c.col_enters, c.col_soak, c.col_hooked, c.col_haul];

/** Timeline grid: name, four moments on the line, proof. */
const rowGrid = "md:grid md:grid-cols-[150px_repeat(4,minmax(0,1fr))_minmax(190px,1.3fr)] md:items-center md:gap-x-3 lg:grid-cols-[180px_repeat(4,minmax(0,1fr))_minmax(220px,1.3fr)]";

function Pill({ tone, icon, children }: { tone: "pink" | "mint" | "dashed" | "stripe"; icon?: "xmark" | "check"; children: React.ReactNode }) {
  const cls =
    tone === "pink"
      ? "bg-pink-bg text-pink-text"
      : tone === "mint"
        ? "bg-mint-bg text-mint-text"
        : tone === "dashed"
          ? "border-2 border-dashed border-grey-bar bg-white text-text"
          : "stripe-yellow text-yellow-text";
  return (
    <span className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-chip px-3 py-2 text-center text-[12px] font-bold leading-tight ${cls}`}>
      {icon && <Image src={`/icons/${icon}.png`} alt="" width={14} height={14} className="shrink-0" />}
      <span>{children}</span>
    </span>
  );
}

/** A track that fills left to right on scroll; the text sits over it, unscaled. */
function Bar({ fill, text, textClass }: { fill: string; text: string; textClass: string }) {
  return (
    <div className="relative flex min-h-11 w-full items-center overflow-hidden rounded-chip bg-grey-bg px-4">
      <span data-fill aria-hidden="true" className={`absolute inset-0 rounded-chip ${fill}`} />
      <span className={`relative z-10 text-[12px] font-bold ${textClass}`}>{text}</span>
    </div>
  );
}

/**
 * Comparison: current deterrents against SharkShield's two steps. A header
 * row of moments on the line, three grey "always on" rows and a mint
 * SharkShield card. Rows collapse to stacked cards below 768px.
 */
export function Comparison() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        gsap.set(q("[data-rise]"), { autoAlpha: 0, y: 24 });
        gsap.set(q("[data-bar]"), { scaleX: 0, transformOrigin: "0 50%" });
        gsap.set(q("[data-row]"), { autoAlpha: 0, x: (i: number) => (i % 2 ? 64 : -64) });
        gsap.set(q("[data-fill]"), { scaleX: 0, transformOrigin: "0 50%" });

        const intro = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
        intro
          .to(q("[data-rise]"), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0)
          .to(q("[data-bar]"), { scaleX: 1, duration: 0.6 }, 0.3)
          .to(q("[data-row]"), { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.1 }, 0.4);
        const revertTitle = titleReveal(intro, q("[data-title]")[0], 0.05);

        const table = q("[data-table]")[0];
        const fills = gsap.to(q("[data-fill]"), {
          scaleX: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: { trigger: table, start: "top 80%", end: "bottom 60%", scrub: true },
        });

        return () => {
          intro.scrollTrigger?.kill();
          intro.kill();
          fills.scrollTrigger?.kill();
          fills.kill();
          revertTitle();
        };
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Section id="compare" theme="grey">
      <div ref={root}>
        <div className="max-w-2xl">
          <div data-rise>
            <Chip tone="blue">{c.chip}</Chip>
          </div>
          <h2 id="compare-title" data-title className="t-title mt-5">
            {c.title}
          </h2>
          <AccentBar className="mt-6" data-bar />
          <p data-rise className="t-lead mt-6 max-w-xl">
            {c.lead}
          </p>
        </div>

        <div data-table className="mt-10">
          {/* Header row of moments on the line (desktop only; mobile cards carry the labels). */}
          <div className={`hidden ${rowGrid} border-b border-border pb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-muted`} aria-hidden="true">
            <span />
            {columns.map((col) => (
              <span key={col} className={col === c.col_hooked ? "flex items-center gap-1.5 text-ink" : ""}>
                {col === c.col_hooked && <span className="inline-block h-3.5 w-0.5 bg-ink" />}
                {col}
              </span>
            ))}
            <span>{c.col_proof}</span>
          </div>

          <ul className="mt-2 flex flex-col gap-3">
            {rivals.map((name) => (
              <li key={name} data-row className={`rounded-card border border-border bg-white p-4 ${rowGrid} md:rounded-none md:border-0 md:border-b md:bg-transparent md:px-0 md:py-4`}>
                <div className="flex items-center gap-3">
                  <IconCircle icon="unit" tone="grey" size={36} />
                  <span className="text-[15px] font-bold text-ink">{name}</span>
                </div>
                <div className="mt-3 md:col-span-4 md:mt-0">
                  <Bar fill="bg-grey-bar" text={c.always_on} textClass="text-ink" />
                </div>
                <div className="mt-3 md:mt-0">
                  <Pill tone="pink" icon="xmark">{c.no_proof}</Pill>
                </div>
              </li>
            ))}

            <li data-row className={`rounded-card bg-mint-bg/40 p-4 ring-1 ring-mint-bar ${rowGrid} md:px-4 md:py-5`}>
              <div className="flex items-center gap-3">
                <IconCircle icon="unit" tone="mint" size={36} />
                <span className="text-[15px] font-bold text-ink">{site.name}</span>
              </div>
              <div className="mt-3 flex flex-col gap-2 md:col-span-4 md:mt-0">
                <Bar fill="bg-mint-bg" text={c.ss_step1} textClass="text-mint-text" />
                <Hypothesis>
                  <div className="grid gap-2 md:grid-cols-2 md:gap-3">
                    <Pill tone="dashed">{c.ss_off}</Pill>
                    <Pill tone="stripe">{c.ss_step2}</Pill>
                  </div>
                </Hypothesis>
              </div>
              <div className="mt-3 md:mt-0">
                <Pill tone="mint" icon="check">{c.ss_proof}</Pill>
              </div>
            </li>
          </ul>
        </div>

        <p data-rise className="mt-6 max-w-3xl text-[13px] leading-relaxed text-muted">
          {c.footnote}
        </p>
        <p data-rise className="mt-2 text-[13px] text-muted">
          <Link href="/research" className="inline-flex min-h-11 items-center border-b-2 border-mint-bar font-bold text-ink">
            {c.sources_label}
          </Link>
        </p>
      </div>
    </Section>
  );
}
