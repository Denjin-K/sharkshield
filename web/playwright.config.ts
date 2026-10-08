import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3077",
    trace: "retain-on-failure",
  },
  // CI has already run `pnpm build`, so it tests the production server (pins and
  // StrictMode behave differently in dev). Locally the dev server is fine.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: process.env.CI ? "pnpm start --port 3077" : "pnpm dev --port 3077",
        url: "http://localhost:3077",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    // Chromium with the iPhone viewport and touch, so CI only installs one browser.
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "no-js", use: { ...devices["Desktop Chrome"], javaScriptEnabled: false } },
    { name: "reduced-motion", use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" } },
  ],
});
