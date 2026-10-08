import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/** Resolves once the display font is in, so SplitText measures real line breaks. */
export function fontsReady(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  if (document.fonts.status === "loaded") return Promise.resolve();
  return document.fonts.ready.then(() => undefined);
}

type TitleOpts = { chars?: boolean; stagger?: number };

/**
 * Masked rise for a heading: each line is clipped and its words (or characters)
 * rise into view. The tween is added to `tl` at `at` once fonts are ready.
 * Returns a cleanup that reverts the split. SplitText keeps the heading
 * readable to assistive tech (aria-label on the element, aria-hidden pieces).
 */
export function titleReveal(tl: gsap.core.Timeline, el: Element | undefined, at = 0, opts: TitleOpts = {}) {
  if (!el) return () => {};
  let split: SplitText | undefined;
  let cancelled = false;
  gsap.set(el, { autoAlpha: 0 });
  fontsReady().then(() => {
    if (cancelled) return;
    split = SplitText.create(el, {
      type: opts.chars ? "lines,words,chars" : "lines,words",
      mask: "lines",
      linesClass: "sl-line",
      wordsClass: "sl-word",
      charsClass: "sl-char",
    });
    gsap.set(el, { autoAlpha: 1 });
    const targets = opts.chars ? split.chars : split.words;
    tl.from(
      targets,
      {
        yPercent: 115,
        rotation: opts.chars ? 6 : 2,
        transformOrigin: "0% 100%",
        duration: 1,
        ease: "power4.out",
        stagger: opts.stagger ?? (opts.chars ? 0.035 : 0.07),
      },
      at,
    );
  });
  return () => {
    cancelled = true;
    split?.revert();
  };
}

/**
 * Clip-path wipe for a scene box: the picture is revealed left to right while
 * the image inside settles from a slight zoom. Pass `zoom: false` when the
 * image already has its own scroll-driven transform.
 */
export function sceneReveal(tl: gsap.core.Timeline, el: Element | undefined, at = 0, opts: { zoom?: boolean; radius?: number } = {}) {
  if (!el) return;
  const r = opts.radius ?? 20;
  gsap.set(el, { clipPath: `inset(0 100% 0 0 round ${r}px)` });
  tl.to(el, { clipPath: `inset(0 0% 0 0 round ${r}px)`, duration: 1.2, ease: "power4.inOut" }, at);
  if (opts.zoom !== false) {
    const img = el.querySelector("img");
    if (img) {
      gsap.set(img, { scale: 1.2, transformOrigin: "50% 50%" });
      tl.to(img, { scale: 1, duration: 1.8, ease: "power3.out" }, at);
    }
  }
}

/** Pop-in for a group of small things (chips, buttons): scale up with a little overshoot. */
export function popIn(tl: gsap.core.Timeline, targets: Element[], at = 0) {
  if (!targets.length) return;
  gsap.set(targets, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
  tl.to(targets, { autoAlpha: 1, scale: 1, duration: 0.55, ease: "back.out(2.2)", stagger: 0.09 }, at);
}
