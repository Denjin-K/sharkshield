// Build-time guard: every frame listed in a manifest must exist on disk, and
// every frame on disk must be listed. A missing frame is otherwise a silent blank.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../public/frames/", import.meta.url).pathname;
let failed = false;

for (const name of ["frames.desktop.json", "frames.mobile.json"]) {
  const file = join(root, name);
  if (!existsSync(file)) { console.error(`missing manifest ${name}`); failed = true; continue; }
  const m = JSON.parse(readFileSync(file, "utf8"));
  for (const key of ["closed", "open"]) {
    const list = m[key];
    if (!Array.isArray(list) || list.length === 0) { console.error(`${name}: ${key} is empty`); failed = true; continue; }
    for (const rel of list) {
      const p = join(root, "..", rel);
      if (!existsSync(p)) { console.error(`${name}: ${rel} not on disk`); failed = true; }
    }
    const dir = join(root, "..", list[0].split("/").slice(0, -1).join("/"));
    const onDisk = readdirSync(dir).filter((f) => f.endsWith(".webp")).length;
    if (onDisk !== list.length) { console.error(`${name}: ${key} lists ${list.length} frames, disk has ${onDisk}`); failed = true; }
  }
  console.log(`${name}: ${m.closed?.length ?? 0} closed + ${m.open?.length ?? 0} open frames ok`);
}

if (failed) process.exit(1);
