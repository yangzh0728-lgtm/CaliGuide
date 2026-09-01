import { expect, test } from "@playwright/test";

test("opens a shareable guide URL without signing in", async ({ page }) => {
  await page.goto("/guides/california-real-id-documents");

  await expect(page).toHaveURL(/\/guides\/california-real-id-documents$/);
  await expect(page).toHaveTitle(/REAL ID Document Preparation Guide \| CaliGuide/);
  await expect(page.getByRole("heading", { level: 1, name: /REAL ID Document Preparation Guide/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in to save this guide" })).toBeVisible();
});

test("guide navigation writes browser history", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "DMV", exact: true }).click();

  await expect(page).toHaveURL(/\/guides\/california-dmv-new-resident-checklist$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});

test("organizes guide and agency discovery without requiring an account", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Guides", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Browse guides by topic" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Browse agencies" })).toBeVisible();

  await page.getByRole("button", { name: "Browse agencies" }).click();
  await expect(page).toHaveURL(/\/agencies$/);
  await expect(page.getByRole("heading", { name: "Official agencies and services" })).toBeVisible();
  await expect(page.locator('nav[aria-label="Find by need"]:visible')).toBeVisible();
  await expect(page.getByRole("button", { name: /U.S. Citizenship and Immigration Services/ })).toBeVisible();
});

test("lists and filters the complete public guide library", async ({ page }) => {
  await page.goto("/guides");

  await expect(page.getByRole("heading", { level: 1, name: "Guides" })).toBeVisible();
  await expect(page.getByText("Recommended for You", { exact: true })).toHaveCount(0);
  await expect(page.locator("[data-guide-card]")).toHaveCount(19);
  await expect(page.locator('[data-guide-card="forum-first-30-days"]')).toBeVisible();

  await page.locator('[data-guide-group="safety"]:visible').click();
  await expect(page.locator("[data-guide-card]")).toHaveCount(1);
  await expect(page.locator('[data-guide-card="guide-earthquake-wildfire-preparedness"]')).toBeVisible();

  await page.locator('[data-reference-tab="agencies"]').click();
  await expect(page).toHaveURL(/\/agencies$/);
  await expect(page.locator('[data-reference-tab="agencies"]')).toHaveAttribute("aria-current", "page");
});

for (const privatePath of ["/forum", "/chatbot", "/profile"]) {
  test(`requires an account for ${privatePath}`, async ({ page }) => {
    await page.goto(privatePath);

    await expect(page.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue browsing" })).toHaveAttribute(
      "href",
      "/?continue=1",
    );
  });
}
