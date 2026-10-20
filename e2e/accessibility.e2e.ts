import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const AUDITED_PATHS = ["/", "/guides/first-30-days-in-california", "/agencies/ca-dmv", "/privacy", "/profile"];

for (const path of AUDITED_PATHS) {
  test(`has no WCAG A/AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const violations = results.violations.map((violation) => ({
      id: violation.id,
      targets: violation.nodes.map((node) => node.target.join(" ")),
    }));
    expect(violations).toEqual([]);
  });
}

test("keeps the document language in sync with the interface language", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.getByRole("button", { name: /Language: EN/ }).click();
  await page.getByRole("button", { name: "简体中文" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
});

test("offers a skip link and a working search button", async ({ page }) => {
  await page.goto("/guides/first-30-days-in-california");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.getByRole("button", { name: "Search guides and agencies" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("#home-search")).toBeFocused();
});
