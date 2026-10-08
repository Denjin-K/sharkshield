/**
 * Device page content: stills, spec table and print files for capsule v7.
 * Dimensions in millimetres. Candidate for messages/en.json once the
 * integrator opens a slot for it.
 */

export type Still = { src: string; alt: string; caption: string };
export type Spec = { label: string; value: string };
export type Download = { file: string; label: string; description: string };

export const version = "v7";

export const stills: Still[] = [
  {
    src: "/device/closed.webp",
    alt: "The closed SharkShield capsule, a domed cylinder with a fluted screw cap, seen from the side.",
    caption: "Closed · cap screwed down on the shoulder O-ring",
  },
  {
    src: "/device/open.webp",
    alt: "The capsule with its cap removed, showing the open cavity and the centre tube for the leader.",
    caption: "Open · cavity around the centre tube",
  },
  {
    src: "/device/section.webp",
    alt: "A cut-away section of the capsule showing the wall, the centre tube, and the two O-ring seats.",
    caption: "Section · 3.5 mm wall, tube and seal seats",
  },
  {
    src: "/device/thread.webp",
    alt: "Close-up of the capsule thread, four turns at 3 mm pitch.",
    caption: "Thread · 3 mm pitch, 4 turns",
  },
];

export const specsTitle = "Specification";

export const specs: Spec[] = [
  { label: "Body", value: "Ø55 × 104 mm, domed bottom; centre tube to 151 mm" },
  { label: "Cap", value: "Ø58 × 44 mm, fluted" },
  { label: "Thread", value: "3 mm pitch, 1.5 mm depth, 4 turns" },
  { label: "Cavity", value: "Ø48 around a Ø8 tube" },
  { label: "Line bore", value: "Ø3" },
  { label: "Seals", value: "51 × 1.5 mm O-ring on the shoulder, 6.4 × 1 mm on the tube" },
  { label: "Wall", value: "3.5 mm" },
  { label: "Material", value: "PETG" },
];

export const licence = { label: "Licence", value: "CC BY-SA 4.0", href: "https://creativecommons.org/licenses/by-sa/4.0/" };

export const downloads: Download[] = [
  { file: "sharkshield-v7-body.stl", label: "Body", description: "Capsule body with centre tube" },
  { file: "sharkshield-v7-cap.stl", label: "Cap", description: "Fluted screw cap" },
];

export const stillsNote = "Renders from the current 3D model, not a sea-tested part.";
