import { test, expect } from "@playwright/test";

// These run in every project of playwright.config.ts, including no-js:
// every page here is a server component with no client-side dependency.

test.describe("pages", () => {
  test("/research shows its title, threads and the Issuu booklet link", async ({ page }) => {
    await page.goto("/research");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Common threads" })).toBeVisible();
    const issuu = page.getByRole("link", { name: /abstract booklet/i });
    await expect(issuu).toBeVisible();
    await expect(issuu).toHaveAttribute("href", "https://issuu.com/sharktrust/docs/eea_2026_abstract_booklet");
    await expect(page.getByText("abstracts we are following", { exact: false }).first()).toBeVisible();
  });

  test("/device shows the two STL downloads with sizes", async ({ page }) => {
    await page.goto("/device");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const links = page.locator('a[href$=".stl"]');
    await expect(links).toHaveCount(2);
    for (const href of ["/downloads/sharkshield-v7-body.stl", "/downloads/sharkshield-v7-cap.stl"]) {
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toBeVisible();
      await expect(link).toContainText(/\d+(\.\d+)? (KB|MB)/);
    }
    await expect(page.getByRole("link", { name: "CC BY-SA 4.0" })).toBeVisible();
    await expect(page.getByText("No depth rating has been measured", { exact: false })).toBeVisible();
  });

  test("/updates lists a post or shows the empty state", async ({ page }) => {
    await page.goto("/updates");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const posts = page.locator('a[href^="/updates/"]');
    const empty = page.locator("[data-empty]");
    const hasPosts = (await posts.count()) > 0;
    if (hasPosts) {
      await expect(posts.first()).toBeVisible();
    } else {
      await expect(empty).toBeVisible();
      await expect(empty).toContainText("First post coming");
    }
  });

  test("unknown routes show the branded 404", async ({ page }) => {
    const res = await page.goto("/nope-404");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("That page drifted off.");
    await expect(page.getByRole("link", { name: "Research" }).first()).toBeVisible();
  });
});
