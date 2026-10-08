import { t } from "@/lib/t";

/**
 * Pelagic tuna longline cross-section, viewBox 1000×470, drawn over an
 * illustrated backdrop (sky, water, light rays, seabed) with sprite boat,
 * beacon buoy, tuna and shark in the deck's flat pastel style. Every part a
 * section animates carries a stable id. With JS off the finished scene sits
 * on the page: boat at its final position, line set, tuna on the hook.
 *
 * ids: boat, mainline, floatline-1..5, float-1..5, snood-1..23 (group),
 * branch-1..23, hook-1..23, tuna-hooked, tuna-free, shark, beacon, surface,
 * bubble-1..8.
 */

type Tone = "mint" | "pink" | "yellow" | "blue" | "cyan" | "grey";

export type LonglineLabel = { id: string; x: number; y: number; text: string; tone: Tone };

const INK = "#141A1F";
const FLOAT = "#F6B84A";
const FLOAT_HI = "#FDE2A8";

export const VIEW = { w: 1000, h: 470 };
export const SURFACE_Y = 78;
const ATTACH_Y = 150; // where float lines meet the mainline
const SAG_CTRL_Y = 330; // quadratic control point, so each scallop bottoms out at y≈240
export const FLOAT_X = [250, 410, 570, 730, 890];
const FLOAT_R = 11;
const FLOAT_CY = SURFACE_Y - 6;
export const STERN = { x: 200, y: SURFACE_Y + 2 };
export const BEACON_X = 962;
const BRANCHES_PER_SCALLOP = [6, 6, 6, 5]; // 23 in total
const HOOKED_INDEX = 15;

/** Boat sprite: 600×263. The line leaves the stern gantry at the sprite's right side. */
const BOAT_W = 196;
const BOAT_H = Math.round((BOAT_W * 263) / 600);
export const BOAT_HOME = { x: STERN.x - BOAT_W + 22, y: SURFACE_Y - BOAT_H + 20 };
/** How far right the boat starts (at the beacon) before it sails home paying the line out. */
export const BOAT_TRAVEL = BEACON_X - STERN.x - 10;

/** Surface ripples, drawn 1100 wide so a 50px loop reads as moving water. */
const surfacePath = `M-100 ${SURFACE_Y}` + Array.from({ length: 24 }, () => " q25 -7 50 0").join("");

export const mainlinePath =
  `M${STERN.x} ${STERN.y} L${FLOAT_X[0]} ${ATTACH_Y}` +
  FLOAT_X.slice(1)
    .map((x, i) => ` Q${(FLOAT_X[i] + x) / 2} ${SAG_CTRL_Y} ${x} ${ATTACH_Y}`)
    .join("") +
  ` L${BEACON_X} ${SURFACE_Y + 6}`;

export type Branch = { n: number; x: number; y: number; len: number };

/** Point on a quadratic scallop at parameter u, plus a deterministic length variation. */
export const branches: Branch[] = BRANCHES_PER_SCALLOP.flatMap((count, k) => {
  const x0 = FLOAT_X[k];
  const x1 = FLOAT_X[k + 1];
  return Array.from({ length: count }, (_, i) => {
    const u = (i + 1) / (count + 1);
    const x = Math.round(x0 + u * (x1 - x0));
    const y = Math.round(ATTACH_Y + 2 * (SAG_CTRL_Y - ATTACH_Y) * u * (1 - u));
    const len = 60 + 9 * ((i * 7 + k * 3) % 5);
    return { n: 0, x, y, len };
  });
}).map((b, i) => ({ ...b, n: i + 1 }));

/** Small J hook hanging from the bottom of a branch line, opening to the right. */
const hookPath = (b: Branch) => `M${b.x} ${b.y + b.len} v8 a7 7 0 0 0 14 0 v-4`;

const hooked = branches[HOOKED_INDEX];
/** Tuna sprite 520×312, mouth at the right edge about 55% down. */
const TUNA_W = 78;
const TUNA_H = Math.round((TUNA_W * 312) / 520);
export const hookedTuna = { x: hooked.x + 8 - TUNA_W, y: hooked.y + hooked.len + 12 - TUNA_H * 0.55 };
export const freeTuna = { x: 300, y: 330 };
/** Shark sprite 640×286, faces left. */
const SHARK_W = 150;
const SHARK_H = Math.round((SHARK_W * 286) / 640);
export const sharkHome = { x: 775, y: 262 };
const BUOY_W = 34;
const BUOY_H = Math.round((BUOY_W * 158) / 140);

const copy = t("longline");

/** Tag anchor positions in viewBox units; sections place chips over the SVG with these. */
export const longlineLabels: LonglineLabel[] = [
  { id: "tag_stern", x: 118, y: 30, text: copy.tag_stern, tone: "grey" },
  { id: "tag_float", x: FLOAT_X[1] + 40, y: 36, text: copy.tag_float, tone: "yellow" },
  { id: "tag_mainline", x: (FLOAT_X[2] + FLOAT_X[3]) / 2, y: 262, text: copy.tag_mainline, tone: "cyan" },
  { id: "tag_branch", x: (FLOAT_X[0] + FLOAT_X[1]) / 2 + 60, y: 428, text: copy.tag_branch, tone: "blue" },
  { id: "tag_beacon", x: BEACON_X, y: 124, text: copy.tag_beacon, tone: "pink" },
  { id: "tag_wait", x: hooked.x + 36, y: hookedTuna.y + TUNA_H + 26, text: copy.tag_wait, tone: "pink" },
];

/** Bubble start points, spread across the open water. */
const bubbles = [
  { x: 120, r: 3.5 }, { x: 330, r: 2.5 }, { x: 470, r: 3 }, { x: 610, r: 2 },
  { x: 700, r: 3.5 }, { x: 830, r: 2.5 }, { x: 940, r: 3 }, { x: 60, r: 2 },
];

export function LonglineDiagram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke={INK}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <clipPath id="ll-clip">
          <rect x={0} y={0} width={VIEW.w} height={VIEW.h} rx={20} />
        </clipPath>
      </defs>
      <g clipPath="url(#ll-clip)">
        <image href="/scenes/longline_bg.jpg" x={0} y={0} width={VIEW.w} height={VIEW.h} preserveAspectRatio="xMidYMid slice" />

        {/* moving water: two ripple bands over the painted surface */}
        <path id="surface" d={surfacePath} stroke="#ffffff" strokeOpacity={0.9} strokeWidth={2.5} />
        <path id="surface-2" d={surfacePath} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={1.5} transform={`translate(25 ${4})`} />

        {bubbles.map((b, i) => (
          <circle key={i} id={`bubble-${i + 1}`} cx={b.x} cy={420} r={b.r} fill="#ffffff" fillOpacity={0.5} stroke="#ffffff" strokeOpacity={0.8} strokeWidth={1} />
        ))}

        <path id="mainline" d={mainlinePath} strokeWidth={2.2} />

        {FLOAT_X.map((x, i) => (
          <line key={`fl-${i}`} id={`floatline-${i + 1}`} x1={x} y1={FLOAT_CY + FLOAT_R} x2={x} y2={ATTACH_Y} />
        ))}
        {FLOAT_X.map((x, i) => (
          <g key={`f-${i}`} id={`float-${i + 1}`}>
            <circle cx={x} cy={FLOAT_CY} r={FLOAT_R} fill={FLOAT} />
            <circle cx={x - 3.5} cy={FLOAT_CY - 3.5} r={3} fill={FLOAT_HI} stroke="none" />
          </g>
        ))}

        {branches.map((b) => (
          <g key={`s-${b.n}`} id={`snood-${b.n}`}>
            <line id={`branch-${b.n}`} x1={b.x} y1={b.y} x2={b.x} y2={b.y + b.len} strokeWidth={1.5} />
            <path id={`hook-${b.n}`} d={hookPath(b)} />
          </g>
        ))}

        <g id="tuna-hooked">
          <image href="/scenes/tuna_swim.webp" x={hookedTuna.x} y={hookedTuna.y} width={TUNA_W} height={TUNA_H} />
        </g>
        {/* faces left: the sprite is flipped around its own centre */}
        <g id="tuna-free">
          <image
            href="/scenes/tuna_swim.webp"
            x={freeTuna.x}
            y={freeTuna.y}
            width={TUNA_W}
            height={TUNA_H}
            transform={`translate(${2 * freeTuna.x + TUNA_W} 0) scale(-1 1)`}
          />
        </g>
        <g id="shark">
          <image href="/scenes/shark.webp" x={sharkHome.x} y={sharkHome.y} width={SHARK_W} height={SHARK_H} />
        </g>

        <g id="beacon">
          <image href="/scenes/buoy.webp" x={BEACON_X - BUOY_W / 2} y={SURFACE_Y - BUOY_H + 14} width={BUOY_W} height={BUOY_H} />
        </g>
        <g id="boat">
          <image href="/scenes/boat.webp" x={BOAT_HOME.x} y={BOAT_HOME.y} width={BOAT_W} height={BOAT_H} />
        </g>
      </g>
    </svg>
  );
}
