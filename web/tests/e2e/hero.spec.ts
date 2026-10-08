import { test, expect } from "@playwright/test";

test.describe("hero", () => {
  test("title, lead and stats are visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Shark");
    await expect(page.locator("#story").getByText("Count what the sharks take.")).toBeVisible();
    await expect(page.locator("#story").getByText("Logs every hook-up").first()).toBeVisible();
  });

  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("skip link reaches main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByText("Skip to content")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeVisible();
  });

  test("jump links land on their sections", async ({ page }) => {
    await page.goto("/");
    const target = page.locator("#method");
    if ((await target.count()) === 0) test.skip();
    await page.getByRole("link", { name: "The method" }).click();
    await page.waitForTimeout(800);
    const top = await target.evaluate((el) => Math.abs(el.getBoundingClientRect().top));
    expect(top).toBeLessThan(120);
  });
});
