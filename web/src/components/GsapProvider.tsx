"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, useGSAP);

// Mobile browsers fire resize when the address bar collapses; a refresh mid-pin
// would jump the page, so only orientation changes count as a resize.
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Owns the one ScrollSmoother instance. Smoothing is desktop-only and only
 * when the visitor has not asked for reduced motion. Below that, native
 * scrolling. The fixed NavBar lives outside this wrapper on purpose.
 *
 * The smoother is created by <Smoother/>, the first child of the content
 * wrapper, so its layout effect runs before any section creates a pinned
 * ScrollTrigger. Creating it afterwards makes ScrollSmoother re-init every
 * pin, which leaks a nested pin-spacer under React StrictMode.
 */
export function GsapProvider({ children }: { children: React.ReactNode }) {
  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        <Smoother />
        {children}
      </div>
    </div>
  );
}

function Smoother() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const smoother = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.1,
          effects: false,
          normalizeScroll: false,
        });
        // Anchor links: land on the section start, never mid-pin.
        const onClick = (e: MouseEvent) => {
          const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
          if (!a) return;
          const target = document.querySelector(a.getAttribute("href")!);
          if (!target) return;
          e.preventDefault();
          smoother.scrollTo(target, true, "top top");
          history.pushState(null, "", a.getAttribute("href")!);
        };
        document.addEventListener("click", onClick);
        if (location.hash) {
          const target = document.querySelector(location.hash);
          if (target) requestAnimationFrame(() => smoother.scrollTo(target, false, "top top"));
        }
        return () => {
          document.removeEventListener("click", onClick);
          smoother.kill();
        };
      },
    );
    return () => mm.revert();
  });
  return null;
}
