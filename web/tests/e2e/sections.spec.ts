import { test, expect, type Page } from "@playwright/test";

const sections = ["method", "problem", "device", "measure", "protect", "compare", "research", "join"];

/**
 * Scroll with the native scrollbar. On desktop the content lives inside
 * ScrollSmoother, which ignores scrollIntoView, so we move window scroll and
 * give the smoother (1.1 s) and the reveal timelines time to settle. Pin
 * spacers grow after hydration, so re-measure until the section sits at the top.
 */
async function scrollToSection(page: Page, id: string) {
  for (let i = 0; i < 4; i++) {
    const top = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return 0;
      const top = el.getBoundingClientRect().top;
      window.scrollTo(0, Math.max(0, top + window.scrollY - 60));
      return top;
    }, id);
    await page.waitForTimeout(1500);
    if (Math.abs(top - 60) < 8) break;
  }
}

test.describe("sections", () => {
  for (const id of sections) {
    test(`#${id} heading is visible`, async ({ page }) => {
      await page.goto("/");
      const section = page.locator(`#${id}`);
      await expect(section).toHaveCount(1);
      await scrollToSection(page, id);
      await expect(section.getByRole("heading", { level: 2 }).first()).toBeVisible({ timeout: 10_000 });
    });
  }

  test("no horizontal overflow after scrolling the page", async ({ page }) => {
    await page.goto("/");
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      await page.evaluate((f) => window.scrollTo(0, document.documentElement.scrollHeight * f), i / steps);
      await page.waitForTimeout(120);
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("exactly two pins: the longline set and the turntable", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop project only");
    await page.goto("/");
    await page.waitForTimeout(800);
    await expect(page.locator(".pin-spacer")).toHaveCount(2);
    await expect(page.locator(".pin-spacer .pin-spacer")).toHaveCount(0);
  });

  test("reduced motion: nothing pins and the device slider shows", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "reduced-motion", "reduced-motion project only");
    await page.goto("/");
    await expect(page.locator("#device input[type='range']")).toBeVisible();
    for (const id of sections) await scrollToSection(page, id);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
  });
});
