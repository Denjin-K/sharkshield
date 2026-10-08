import { t } from "@/lib/t";

/**
 * Illustrative hook-up / strike signal, viewBox 1000×300. The path is the same
 * curve as the deck: a noisy baseline, a spike at 36% with a decaying
 * oscillation, a second spike at 62% that settles by 86%, then a slow wobble.
 * Ids are stable for DrawSVG (see docs/contracts.md). Pure module.
 */

export type SignalPhase = { id: string; x: number; text: string };

const W = 1000;
const H = 300;
const BASE_Y = 230;
const SIGNAL = "#2B5CB8";
const HOOKUP = "#F6C84A";
const STRIKE = "#E86A5C";
const PHASE_LINE = "#C9D2DC";

const HOOKUP_X = 0.36 * W;
const STRIKE_X = 0.62 * W;
const SETTLE_X = 0.86 * W;
const PHASE_X = [0.1 * W, HOOKUP_X, 0.84 * W];

/** Deterministic hash noise in [-1, 1] so the trace is identical on server and client. */
const hashNoise = (x: number) => {
  const s = Math.sin(x * 12.9898 + 78.233) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};

const noise = (x: number) => 2.2 * Math.sin(x * 0.37) + 1.4 * Math.sin(x * 1.13 + 1) + 1.6 * hashNoise(x);

export function signalY(x: number): number {
  if (x < HOOKUP_X) return BASE_Y + noise(x);
  // Each event is a sharp pulse (fast decay) riding on a gentler decaying
  // oscillation, so the ring-down stays well inside the frame.
  if (x < STRIKE_X) {
    const d = x - HOOKUP_X;
    return BASE_Y - 145 * Math.exp(-d / 12) - 45 * Math.exp(-d / 80) * Math.cos(d * 0.07) + noise(x);
  }
  if (x < SETTLE_X) {
    const d = x - STRIKE_X;
    return BASE_Y - 125 * Math.exp(-d / 12) - 45 * Math.exp(-d / 70) * Math.cos(d * 0.08) + noise(x);
  }
  const d = x - SETTLE_X;
  return BASE_Y + 6 * Math.sin(d * 0.05) + noise(x);
}

export function buildSignalPath(step = 2): string {
  const pts: string[] = [];
  for (let x = 0; x <= W; x += step) {
    const y = Math.min(H - 10, Math.max(10, signalY(x)));
    pts.push(`${x} ${y.toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

const signalPath = buildSignalPath();

const copy = t("logged");

/** Phase label anchors in viewBox units along the x axis. */
export const signalPhases: SignalPhase[] = [
  { id: "ph_set", x: 0.05 * W, text: copy.ph_set },
  { id: "ph_soak", x: 0.23 * W, text: copy.ph_soak },
  { id: "ph_hookup", x: HOOKUP_X, text: copy.ph_hookup },
  { id: "ph_fight", x: 0.49 * W, text: copy.ph_fight },
  { id: "ph_strike", x: STRIKE_X, text: copy.ph_strike },
  { id: "ph_haul", x: 0.92 * W, text: copy.ph_haul },
];

export function SignalTrace({ className = "" }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden="true" focusable="false" fill="none">
      {PHASE_X.map((x, i) => (
        <line
          key={`p-${i}`}
          id={`phase-${i + 1}`}
          x1={x}
          y1={20}
          x2={x}
          y2={H - 20}
          stroke={PHASE_LINE}
          strokeWidth={1}
          strokeDasharray="4 6"
          strokeLinecap="round"
        />
      ))}
      <path id="signal" d={signalPath} stroke={SIGNAL} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <circle id="marker-hookup" cx={HOOKUP_X} cy={40} r={8} fill={HOOKUP} />
      <circle id="marker-strike" cx={STRIKE_X} cy={60} r={8} fill={STRIKE} />
    </svg>
  );
}
