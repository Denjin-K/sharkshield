// Every deterrent / Step 2 claim must render inside <Hypothesis>. This scans the
// section sources: any file that reads the "deterrent" messages, or mentions the
// deterrent keys, must contain a <Hypothesis wrapper. Cheap, deterministic, CI-safe.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const dir = new URL("../src/components/sections/", import.meta.url).pathname;
const offenders = [];
for (const f of readdirSync(dir)) {
  if (!f.endsWith(".tsx")) continue;
  const src = readFileSync(join(dir, f), "utf8");
  const usesDeterrent = /t\(\s*["']deterrent["']\s*\)/.test(src) || /\bss_step2\b|\bk_off\b|\bk_target\b/.test(src);
  if (usesDeterrent && !/<Hypothesis\b/.test(src)) offenders.push(f);
}
if (offenders.length) {
  console.error("Deterrent copy outside <Hypothesis> in:", offenders.join(", "));
  process.exit(1);
}
console.log("hypothesis check ok");
