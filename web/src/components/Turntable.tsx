"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { t } from "@/lib/t";

gsap.registerPlugin(ScrollTrigger);

type Manifest = { width: number; closed: string[]; open: string[] };

type Props = {
  /** Called with 0..1 progress so the parent can place callouts. */
  onProgress?: (p: number) => void;
  /** Pin distance in viewport heights when scrubbing. */
  pinVh?: number;
  /**
   * Selector of an ancestor to pin instead of the turntable itself. Resolved
   * with closest() at effect time: a parent's ref is still null when a child's
   * layout effect runs, so a ref would silently fall back to the wrapper.
   */
  pinSelector?: string;
};

const WINDOW = 8; // decoded bitmaps kept either side of the current frame

const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReducedMotion = () => window.matchMedia(RM_QUERY).matches;
const getReducedMotionServer = () => false;

/**
 * Scroll-scrubbed turntable. Frame 0 is a plain <img> under the canvas and is
 * the no-JS, reduced-motion, loading and failure state. Decoded bitmaps live in
 * a sliding window so iOS never holds hundreds of 1200px frames at once.
 * With reduced motion, Save-Data or a slow connection the slider drives it.
 */
export function Turntable({ onProgress, pinVh = 300, pinSelector }: Props) {
  const u = t("unit");
  const id = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const manifestRef = useRef<Manifest | null>(null);
  const bitmaps = useRef<Map<number, ImageBitmap>>(new Map());
  const loading = useRef<Set<number>>(new Set());
  const current = useRef(0);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(0);
  const [slow, setSlow] = useState(false);
  const [failed, setFailed] = useState(false);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer);
  const mode: "scrub" | "slider" = reduced || slow || failed ? "slider" : "scrub";

  const frameSrc = useCallback((i: number) => {
    const m = manifestRef.current;
    if (!m) return null;
    const all = [...m.closed, ...m.open];
    return all[i] ?? null;
  }, []);

  const draw = useCallback((i: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // nearest loaded frame
    let best = -1;
    let dist = Infinity;
    for (const k of bitmaps.current.keys()) {
      const d = Math.abs(k - i);
      if (d < dist) { dist = d; best = k; }
    }
    if (best < 0) return;
    const bmp = bitmaps.current.get(best)!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  }, []);

  const load = useCallback(
    async (i: number) => {
      if (bitmaps.current.has(i) || loading.current.has(i)) return;
      const src = frameSrc(i);
      if (!src) return;
      loading.current.add(i);
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await fetch(src, { cache: "force-cache" });
          if (!res.ok) throw new Error(String(res.status));
          const blob = await res.blob();
          const bmp = await createImageBitmap(blob);
          bitmaps.current.set(i, bmp);
          setLoaded((n) => n + 1);
          if (Math.abs(i - current.current) <= 1) draw(current.current);
          break;
        } catch {
          if (attempt === 2) setFailed(true);
        }
      }
      loading.current.delete(i);
    },
    [draw, frameSrc],
  );

  const prune = useCallback((i: number) => {
    for (const [k, bmp] of bitmaps.current) {
      if (Math.abs(k - i) > WINDOW * 3) { bmp.close(); bitmaps.current.delete(k); }
    }
  }, []);

  const goTo = useCallback(
    (p: number) => {
      const m = manifestRef.current;
      if (!m) return;
      const n = m.closed.length + m.open.length;
      const i = Math.max(0, Math.min(n - 1, Math.round(p * (n - 1))));
      current.current = i;
      draw(i);
      for (let k = i - WINDOW; k <= i + WINDOW; k++) if (k >= 0 && k < n) void load(k);
      prune(i);
      onProgress?.(p);
    },
    [draw, load, onProgress, prune],
  );

  // Manifest + connection decision. State updates happen after the fetch resolves.
  useEffect(() => {
    const nav = navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };
    const isSlow = Boolean(nav.connection?.saveData) || /(^|[^4-9])[23]g$/.test(nav.connection?.effectiveType ?? "");
    const mobile = window.innerWidth < 1024;
    const file = mobile ? "/frames/frames.mobile.json" : "/frames/frames.desktop.json";
    let cancelled = false;
    fetch(file)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((m: Manifest) => {
        if (cancelled) return;
        manifestRef.current = m;
        const n = m.closed.length + m.open.length;
        setTotal(n);
        if (isSlow) setSlow(true);
        const canvas = canvasRef.current;
        if (canvas) { canvas.width = m.width; canvas.height = m.width; }
        if (isSlow) return; // slider still works, loads on demand
        // key frames first, then the rest fills in from the window as the user scrubs
        for (let k = 0; k < n; k += 4) void load(k);
      })
      .catch(() => { if (!cancelled) setFailed(true); });
    const map = bitmaps.current;
    return () => {
      cancelled = true;
      for (const bmp of map.values()) bmp.close();
      map.clear();
    };
  }, [load]);

  // Scroll scrub (no reduced motion only).
  useGSAP(
    () => {
      if (mode !== "scrub") return;
      const mm = gsap.matchMedia();
      mm.add(
        { ok: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 1024px)" },
        (ctx) => {
          const { ok, desktop } = ctx.conditions as { ok: boolean; desktop: boolean };
          if (!ok) return;
          // Desktop: pin the block (below the 72px nav) and turn the unit over pinVh.
          // Phone: no pin; the unit turns as it passes through the viewport so the
          // copy below stays one swipe away instead of three screens down.
          const st = desktop
            ? ScrollTrigger.create({
                trigger: (pinSelector && wrapRef.current!.closest(pinSelector)) || wrapRef.current!,
                start: "top 72px",
                end: `+=${pinVh}%`, // percent of the viewport height; ScrollTrigger does not parse vh
                pin: true,
                scrub: 0.4,
                anticipatePin: 1,
                onUpdate: (self) => goTo(self.progress),
              })
            : ScrollTrigger.create({
                trigger: wrapRef.current!,
                start: "top 85%",
                end: "bottom 25%",
                scrub: 0.4,
                onUpdate: (self) => goTo(self.progress),
              });
          return () => st.kill();
        },
      );
      return () => mm.revert();
    },
    { dependencies: [mode, pinVh], scope: wrapRef },
  );

  const progressPct = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

  return (
    <div ref={wrapRef} className="relative mx-auto w-full max-w-[720px] lg:max-w-[440px]">
      <div className="relative aspect-square">
        {/* Frame 0 is the permanent fallback; the canvas paints over it. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/frames/desktop/closed/000.webp"
          alt="SharkShield v7 capsule: a navy screw-cap body with a grey fluted cap, the leader passing through a sealed tube down the centre."
          width={1200}
          height={1200}
          className="absolute inset-0 h-full w-full object-contain"
          loading="lazy" // well below the fold; eager loading competed with the hero image for LCP
          decoding="async"
        />
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={u.note}
          className={`absolute inset-0 h-full w-full ${loaded ? "opacity-100" : "opacity-0"} transition-opacity`}
        />
        {!failed && total > 0 && progressPct < 100 && (
          <div className="absolute inset-x-8 bottom-2 h-1 overflow-hidden rounded-full bg-border" aria-hidden="true">
            <div className="h-full bg-mint-bar transition-[width]" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>
      {(mode === "slider" || failed) && (
        <label htmlFor={id} className="mt-4 block text-center text-[13px] font-medium text-text">
          {u.slider}
          <input
            id={id}
            type="range"
            min={0}
            max={1000}
            defaultValue={0}
            className="mt-2 block w-full accent-[var(--c-mint-text)]"
            onInput={(e) => goTo(Number((e.target as HTMLInputElement).value) / 1000)}
          />
        </label>
      )}
      <p className="sr-only" aria-live="polite">{loaded && loaded < total ? `${u.loading} ${progressPct}%` : ""}</p>
    </div>
  );
}
