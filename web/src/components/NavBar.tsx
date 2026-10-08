"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { t } from "@/lib/t";

const nav = t("nav");
const items = [
  { href: "/#story", label: nav.story },
  { href: "/#method", label: nav.method },
  { href: "/#device", label: nav.device },
  { href: "/research", label: nav.research },
  { href: "/updates", label: nav.updates },
  { href: "https://github.com/Denjin-K/sharkshield", label: nav.github, external: true },
];

/** Fixed nav, outside the scroll wrapper. Compact after the hero; bottom sheet below 768px. */
export function NavBar() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const first = sheet.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && sheet.current) {
        const focusable = sheet.current.querySelectorAll<HTMLElement>("a, button");
        const list = Array.from(focusable);
        const idx = list.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && idx === 0) { e.preventDefault(); list[list.length - 1].focus(); }
        if (!e.shiftKey && idx === list.length - 1) { e.preventDefault(); list[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,padding] duration-300 ${
        compact ? "bg-white/75 backdrop-blur border-b border-border/70 py-2" : "py-4"
      }`}
    >
      <div className="container-site flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-ink" aria-label="SharkShield home">
          <span className="inline-flex items-center gap-2">
            <ShieldMark />
            SharkShield
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-[15px] font-medium">
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="text-ink/80 hover:text-ink border-b-2 border-transparent hover:border-mint-bar py-1"
              {...(it.external ? { target: "_blank", rel: "noreferrer" } : {})}
            >
              {it.label}
            </a>
          ))}
        </nav>
        <button
          type="button"
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full bg-mint-bg text-mint-text"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(true)}
        >
          <span className="sr-only">{nav.menu}</span>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={nav.menu}>
          <button type="button" className="absolute inset-0 bg-ink/30" aria-label={nav.close} onClick={() => setOpen(false)} />
          <div
            id="mobile-nav"
            ref={sheet}
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-offwhite p-6 pb-10 shadow-[0_-12px_40px_rgba(20,26,31,0.12)]"
          >
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-border" />
            <ul className="grid gap-1">
              {items.map((it) => (
                <li key={it.href}>
                  <a
                    href={it.href}
                    className="block rounded-2xl px-4 py-3.5 text-lg font-medium text-ink hover:bg-cyan-bg"
                    onClick={() => setOpen(false)}
                    {...(it.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-4 h-11 w-full rounded-full bg-mint-bg font-medium text-mint-text" onClick={() => setOpen(false)}>
              {nav.close}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function ShieldMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6l-8-3Z" fill="#141A1F" />
      <path d="M8.5 13.5c1.2-2.6 2.6-4.6 4.5-5.5-.6 1.8-.3 3.4.5 5.5-1.6.3-3.3.3-5 0Z" fill="#8FD6DE" />
    </svg>
  );
}
