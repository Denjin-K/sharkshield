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
const NAVY = "#1F3A52";
const CAP = "#C9D0D6";
const ZAP = "#F6D56A";
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
const BRANCHES_PER_SCALLOP = [4, 4, 4, 4]; // 16 in total: fewer, larger, legible
const HOOKED_INDEX = 10;

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
    const len = 56 + 10 * ((i * 7 + k * 3) % 5);
    return { n: 0, x, y, len };
  });
}).map((b, i) => ({ ...b, n: i + 1 }));

/** J hook hanging from the bottom of a branch line, opening to the right. */
const hookPath = (b: Branch) => `M${b.x} ${b.y + b.len} v10 a9 9 0 0 0 18 0 v-6 l-3 3`;
/** Bait fish on the hook: a small silver fish hanging head-up from the bend. */
const BAIT = "#DCE8F0";
const BAIT_DARK = "#8FB1C7";
const baitPath = (b: Branch) => {
  const x = b.x + 9;
  const y = b.y + b.len + 14;
  return `M${x} ${y} c-7 4 -9 14 -3 24 c6 -10 4 -20 3 -24 Z M${x} ${y + 22} l-5 7 h10 Z`;
};

const hooked = branches[HOOKED_INDEX];
/** The unit sits on the branch line just above the hook. */
const unitAt = (b: Branch) => ({ x: b.x, y: b.y + b.len - 36 });
export const zapCentre = { x: unitAt(hooked).x, y: unitAt(hooked).y + 13 };
/** Four short bolts radiating from the firing unit. */
const bolts = [
  `M${zapCentre.x + 8} ${zapCentre.y - 6} l9 -7 -3 6 10 -3 -12 11 3 -6 -9 4`,
  `M${zapCentre.x + 9} ${zapCentre.y + 6} l10 5 -6 1 8 7 -14 -5 6 -1 -7 -5`,
  `M${zapCentre.x - 8} ${zapCentre.y - 7} l-9 -6 4 5 -10 -1 12 9 -3 -5 8 2`,
  `M${zapCentre.x - 9} ${zapCentre.y + 7} l-10 4 6 1 -7 8 13 -6 -6 -1 6 -5`,
];
/** Tuna sprite 520×312, mouth at the right edge about 55% down. */
const TUNA_W = 78;
const TUNA_H = Math.round((TUNA_W * 312) / 520);
export const hookedTuna = { x: hooked.x + 12 - TUNA_W, y: hooked.y + hooked.len + 16 - TUNA_H * 0.55 };
export const freeTuna = { x: 300, y: 330 };
/** Shark sprite 640×286, faces left. */
const SHARK_W = 150;
const SHARK_H = Math.round((SHARK_W * 286) / 640);
export const sharkHome = { x: 775, y: 262 };
/** Where the recoil leaves the shark; the mirrored exit sprite starts here, facing right. */
export const sharkRecoil = { x: sharkHome.x + 110, y: sharkHome.y - 30 };
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

        {branches.map((b) => {
          const u = unitAt(b);
          return (
            <g key={`s-${b.n}`} id={`snood-${b.n}`}>
              <line id={`branch-${b.n}`} x1={b.x} y1={b.y} x2={b.x} y2={b.y + b.len} strokeWidth={1.5} />
              <path id={`hook-${b.n}`} d={hookPath(b)} strokeWidth={2.4} />
              <path id={`bait-${b.n}`} d={baitPath(b)} fill={BAIT} stroke={BAIT_DARK} strokeWidth={1.2} />
              {/* every branch line carries a unit: navy body, grey screw cap, mint status dot */}
              <g id={`unit-${b.n}`} stroke="none">
                <rect x={u.x - 5.5} y={u.y} width={11} height={26} rx={5.5} fill={NAVY} />
                <rect x={u.x - 5.5} y={u.y} width={11} height={8} rx={4} fill={CAP} />
                <circle cx={u.x} cy={u.y + 18} r={1.8} fill="#A8E6C4" />
              </g>
            </g>
          );
        })}

        {/* the field and bolts of the unit that fires; shown only by the animation */}
        <g id="zap" className="opacity-0">
          <circle id="zap-ring-1" cx={zapCentre.x} cy={zapCentre.y} r={14} stroke="#ffffff" strokeWidth={3} />
          <circle id="zap-ring-2" cx={zapCentre.x} cy={zapCentre.y} r={14} stroke={ZAP} strokeWidth={2.5} strokeDasharray="6 4" />
          <circle id="zap-flash" cx={zapCentre.x} cy={zapCentre.y} r={30} fill="#ffffff" stroke="none" />
          <circle id="zap-core" cx={zapCentre.x} cy={zapCentre.y} r={12} fill={ZAP} fillOpacity={0.55} stroke={ZAP} strokeWidth={1.5} />
          <g transform={`translate(${zapCentre.x} ${zapCentre.y}) scale(1.8) translate(${-zapCentre.x} ${-zapCentre.y})`}>
            {bolts.map((d, i) => (
              <path key={i} id={`bolt-${i + 1}`} d={d} fill={ZAP} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
            ))}
          </g>
        </g>

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
        {/* the same shark facing right, for the exit after the field fires */}
        <g id="shark-away" className="opacity-0">
          <image
            href="/scenes/shark.webp"
            x={sharkRecoil.x}
            y={sharkRecoil.y}
            width={SHARK_W}
            height={SHARK_H}
            transform={`translate(${2 * sharkRecoil.x + SHARK_W} 0) scale(-1 1)`}
          />
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
