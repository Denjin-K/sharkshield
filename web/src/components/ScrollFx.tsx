"use client";

import { useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

/** Page tints per section theme. Light enough that every token keeps contrast. */
const THEMES: Record<string, string> = {
  offwhite: "#FDFEFD",
  cyan: "#E4F4F7",
  pink: "#FDF0F0",
  yellow: "#FEF7E3",
  blue: "#ECF1FC",
  grey: "#F1F4F6",
  mint: "#E6F7EE",
};

const rail = t("rail") as Record<string, string>;
const SECTIONS = ["story", "method", "problem", "device", "measure", "protect", "compare", "research", "join"];

/**
 * Page-level scroll effects, mounted outside the smooth-scroll wrapper so the
 * rail can stay fixed: the page background morphs to each section's theme,
 * a dot rail tracks the current section, the matching nav link gets
 * aria-current, and on desktop the content skews a touch with scroll speed.
 * Does nothing on pages without themed sections.
 */
export function ScrollFx() {
  const [active, setActive] = useState("");

  useGSAP(() => {
    const sections = SECTIONS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>("header a[href^='/#']"));
    const go = (el: HTMLElement) => {
      setActive(el.id);
      const theme = THEMES[el.dataset.theme ?? "offwhite"] ?? THEMES.offwhite;
      gsap.to(document.body, { backgroundColor: theme, duration: 0.9, ease: "power2.out", overwrite: "auto" });
      navLinks.forEach((a) => {
        if (a.getAttribute("href") === `/#${el.id}`) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 55%",
        end: "bottom 55%",
        refreshPriority: -1, // measure after the pinned sections have re-inserted their spacers
        onEnter: () => go(el),
        onEnterBack: () => go(el),
      }),
    );
    go(sections[0]);
    // Sections pin after this effect runs and their spacers move everything below them.
    const refresh = gsap.delayedCall(0.3, () => ScrollTrigger.refresh());

    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      // Velocity skew: fast scrolling leans the page, then it springs back.
      const main = document.getElementById("main");
      if (!main) return;
      const proxy = { skew: 0 };
      const setSkew = gsap.quickSetter(main, "skewY", "deg");
      const clamp = gsap.utils.clamp(-3, 3);
      gsap.set(main, { transformOrigin: "right center", force3D: true });
      const st = ScrollTrigger.create({
        onUpdate: (self) => {
          const skew = clamp(self.getVelocity() / -450);
          if (Math.abs(skew) > Math.abs(proxy.skew)) {
            proxy.skew = skew;
            gsap.to(proxy, { skew: 0, duration: 0.9, ease: "power3", overwrite: true, onUpdate: () => setSkew(proxy.skew) });
          }
        },
      });
      return () => {
        st.kill();
        gsap.set(main, { skewY: 0 });
      };
    });

    return () => {
      refresh.kill();
      triggers.forEach((st) => st.kill());
      mm.revert();
      gsap.set(document.body, { clearProps: "backgroundColor" });
      navLinks.forEach((a) => a.removeAttribute("aria-current"));
    };
  });

  if (!active) return null;
  return (
    <nav aria-label={rail.label} className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col items-end gap-3">
        {SECTIONS.map((id) => {
          const on = id === active;
          return (
            <li key={id}>
              <a
                href={`/#${id}`}
                aria-current={on ? "true" : undefined}
                className="group flex items-center justify-end gap-2 py-0.5"
              >
                <span
                  className={`whitespace-nowrap rounded-chip bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink shadow-[0_1px_4px_rgba(20,26,31,0.12)] transition-opacity duration-200 ${
                    on ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  }`}
                >
                  {rail[id] ?? id}
                </span>
                <span
                  aria-hidden="true"
                  className={`block rounded-full transition-all duration-300 ${on ? "h-3 w-3 bg-mint-text" : "h-2 w-2 bg-ink/25 group-hover:bg-ink/60"}`}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
