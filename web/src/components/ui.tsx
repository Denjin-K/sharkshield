import type { ReactNode } from "react";

type Tone = "mint" | "pink" | "yellow" | "blue" | "cyan" | "grey";

const toneClass: Record<Tone, string> = {
  mint: "bg-mint-bg text-mint-text",
  pink: "bg-pink-bg text-pink-text",
  yellow: "bg-yellow-bg text-yellow-text",
  blue: "bg-blue-bg text-blue-text",
  cyan: "bg-cyan-bg text-ink",
  grey: "bg-grey-bg text-text",
};

/** Letter-spaced small-caps pill from the deck. */
export function Chip({ tone = "mint", children, className = "" }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-chip px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] ${toneClass[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** Short mint accent bar under titles. */
export function AccentBar({ className = "", ...rest }: { className?: string } & Record<`data-${string}`, string | boolean | undefined>) {
  return <span aria-hidden="true" className={`block h-1.5 w-24 rounded-full bg-mint-bar ${className}`} {...rest} />;
}

/** Pastel circle with a line icon from /public/icons/*.svg, tinted with the tone's text colour via CSS mask. */
export function IconCircle({ icon, tone = "mint", size = 64, className = "" }: { icon: string; tone?: Tone; size?: number; className?: string }) {
  const inner = Math.round(size * 0.46);
  const mask = `url(/icons/${icon}.svg) center / contain no-repeat`;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${toneClass[tone]} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span
        className="block bg-current"
        style={{ width: inner, height: inner, WebkitMask: mask, mask }}
      />
    </span>
  );
}

/** Three icon stats with dividers, the deck's signature row. */
export function IconStats({ items }: { items: { icon: string; tone: Tone; label: string }[] }) {
  return (
    <ul className="grid grid-cols-3 divide-x divide-border">
      {items.map((it) => (
        <li key={it.label} className="flex flex-col items-center gap-3 px-2 text-center">
          <IconCircle icon={it.icon} tone={it.tone} size={60} />
          <span className="text-[13px] font-bold leading-snug text-ink">{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Every Step 2 / deterrent claim renders inside this wrapper so the yellow
 * HYPOTHESIS chip and the "not yet shown" note are never forgotten. A unit
 * test fails if a deterrent string appears outside it.
 */
export function Hypothesis({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div data-hypothesis className="relative">
      {children}
      {note && (
        <p className="mt-6 rounded-panel bg-yellow-bg px-5 py-4 text-[15px] leading-relaxed text-text">
          {note}
        </p>
      )}
    </div>
  );
}

export function Section({ id, theme, children, className = "" }: { id?: string; theme?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} data-theme={theme} className={`overflow-x-clip py-20 lg:py-32 ${className}`}>
      <div className="container-site">{children}</div>
    </section>
  );
}
