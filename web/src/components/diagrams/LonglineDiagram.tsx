import { t } from "@/lib/t";

/**
 * Pelagic tuna longline cross-section, flat pastel style, viewBox 1000×420.
 * Every drawable element is a stroke with a stable id (see docs/contracts.md)
 * so sections can animate it with DrawSVG. Fills are only used for the sky,
 * water, floats and seabed. Pure module: safe to import from client or server.
 */

type Tone = "mint" | "pink" | "yellow" | "blue" | "cyan" | "grey";

export type LonglineLabel = { id: string; x: number; y: number; text: string; tone: Tone };

const INK = "#141A1F";
const FLOAT = "#F6B84A";
const BEACON = "#E8655C";
const WATER = "#D9F2F5";
const SKY = "#FDFEFD";
const SEABED = "#C9D2DC";

const SURFACE_Y = 60;
const ATTACH_Y = 120; // where float lines meet the mainline
const SAG_CTRL_Y = 290; // quadratic control point, so the scallop bottoms out at y≈205
const FLOAT_X = [230, 390, 550, 710, 870];
const FLOAT_R = 11;
const FLOAT_CY = 50;
const STERN = { x: 188, y: 64 };
const BEACON_X = 948;
const BRANCHES_PER_SCALLOP = [6, 6, 6, 5]; // 23 in total
const HOOKED_INDEX = 15;

/** Wavy surface: twenty 50px quadratic ripples across the full width. */
const surfacePath = `M0 ${SURFACE_Y}` + Array.from({ length: 20 }, () => " q25 -8 50 0").join("");

const mainlinePath =
  `M${STERN.x} ${STERN.y} L${FLOAT_X[0]} ${ATTACH_Y}` +
  FLOAT_X.slice(1)
    .map((x, i) => ` Q${(FLOAT_X[i] + x) / 2} ${SAG_CTRL_Y} ${x} ${ATTACH_Y}`)
    .join("") +
  ` L${BEACON_X} ${STERN.y}`;

type Branch = { n: number; x: number; y: number; len: number };

/** Point on a quadratic scallop at parameter u, plus a deterministic length variation. */
const branches: Branch[] = BRANCHES_PER_SCALLOP.flatMap((count, k) => {
  const x0 = FLOAT_X[k];
  const x1 = FLOAT_X[k + 1];
  return Array.from({ length: count }, (_, i) => {
    const u = (i + 1) / (count + 1);
    const x = Math.round(x0 + u * (x1 - x0));
    const y = Math.round(ATTACH_Y + 2 * (SAG_CTRL_Y - ATTACH_Y) * u * (1 - u));
    const len = 70 + 8 * ((i * 7 + k * 3) % 5);
    return { n: 0, x, y, len };
  });
}).map((b, i) => ({ ...b, n: i + 1 }));

/** Small J hook hanging from the bottom of a branch line, opening to the right. */
const hookPath = (b: Branch) => `M${b.x} ${b.y + b.len} v8 a7 7 0 0 0 14 0 v-4`;

/** Tuna outline, mouth at (x, y), swimming to the right. Stroke only. */
const tunaPath = (x: number, y: number) =>
  `M${x} ${y} c10 -14 40 -14 50 0 c-10 14 -40 14 -50 0 Z M${x + 50} ${y} l12 -9 v18 Z`;

const hooked = branches[HOOKED_INDEX];
const hookedTuna = { x: hooked.x + 14, y: hooked.y + hooked.len + 7 };
const freeTuna = { x: 290, y: 340 };

const boatPath = "M40 60 L52 80 H178 L190 60 Z M92 60 V44 H138 V60 M152 60 V38";
const beaconPath = `M${BEACON_X - 8} 66 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M${BEACON_X} 58 V22 l18 7 -18 7`;
const seabedPath = "M0 420 V395 Q60 372 130 392 T260 388 T400 396 T540 384 T680 394 T820 386 T1000 392 V420 Z";

const copy = t("longline");

/** Tag anchor positions in viewBox units; sections place chips over the SVG with these. */
export const longlineLabels: LonglineLabel[] = [
  { id: "tag_stern", x: 115, y: 26, text: copy.tag_stern, tone: "grey" },
  { id: "tag_float", x: FLOAT_X[1], y: 22, text: copy.tag_float, tone: "yellow" },
  { id: "tag_mainline", x: (FLOAT_X[2] + FLOAT_X[3]) / 2, y: 206, text: copy.tag_mainline, tone: "cyan" },
  { id: "tag_branch", x: (FLOAT_X[1] + FLOAT_X[2]) / 2 + 30, y: 372, text: copy.tag_branch, tone: "blue" }, // left of the hooked tuna so the two callouts never overlap
  { id: "tag_beacon", x: BEACON_X, y: 96, text: copy.tag_beacon, tone: "pink" },
  { id: "tag_wait", x: hookedTuna.x + 32, y: hookedTuna.y + 36, text: copy.tag_wait, tone: "pink" },
];

export function LonglineDiagram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 420"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke={INK}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x={0} y={0} width={1000} height={SURFACE_Y} fill={SKY} stroke="none" />
      <rect x={0} y={SURFACE_Y} width={1000} height={420 - SURFACE_Y} fill={WATER} stroke="none" />
      <path id="seabed" d={seabedPath} fill={SEABED} stroke="none" />

      <path id="surface" d={surfacePath} strokeWidth={1.5} />
      <path id="boat" d={boatPath} />
      <path id="mainline" d={mainlinePath} />

      {FLOAT_X.map((x, i) => (
        <line key={`fl-${i}`} id={`floatline-${i + 1}`} x1={x} y1={FLOAT_CY + FLOAT_R} x2={x} y2={ATTACH_Y} />
      ))}
      {FLOAT_X.map((x, i) => (
        <circle key={`f-${i}`} id={`float-${i + 1}`} cx={x} cy={FLOAT_CY} r={FLOAT_R} fill={FLOAT} />
      ))}

      {branches.map((b) => (
        <line key={`b-${b.n}`} id={`branch-${b.n}`} x1={b.x} y1={b.y} x2={b.x} y2={b.y + b.len} strokeWidth={1.5} />
      ))}
      {branches.map((b) => (
        <path key={`h-${b.n}`} id={`hook-${b.n}`} d={hookPath(b)} />
      ))}

      <path id="tuna-hooked" d={tunaPath(hookedTuna.x, hookedTuna.y)} />
      <path id="tuna-free" d={tunaPath(freeTuna.x, freeTuna.y)} />
      <path id="beacon" d={beaconPath} stroke={BEACON} strokeWidth={2.5} />
    </svg>
  );
}
