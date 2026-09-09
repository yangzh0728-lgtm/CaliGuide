import { expect, test } from "@playwright/test";

test("opens the sample guide without signing in", async ({ page }) => {
  await page.goto("/guides/first-30-days-in-california");
  await expect(page.getByRole("heading", { level: 1, name: "First 30 Days in California", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in to save this guide" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "First 30 Days in California", exact: true })).toBeVisible();
});

test("home links to both public samples", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Start with a free preview" })).toBeVisible();
  await expect(page.locator('main > div').first()).toHaveCSS('opacity', '1');
  await page.screenshot({ path: testInfo.outputPath("public-samples.png") });
  await page.getByRole("link", { name: /Read sample guide/ }).click();
  await expect(page).toHaveURL(/\/guides\/first-30-days-in-california$/);
  await page.goBack();
  await page.getByRole("link", { name: /Explore sample agency/ }).click();
  await expect(page).toHaveURL(/\/agencies\/ca-dmv$/);
  await expect(page.getByRole("heading", { level: 1, name: /Department of Motor Vehicles/ })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: /Department of Motor Vehicles/ })).toBeVisible();
});

test("topic navigation prompts for login and Back returns home", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "DMV", exact: true }).click();
  await expect(page).toHaveURL(/\/guides\/topics\/dmv$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Start with a free preview" })).toBeVisible();
});

for (const privatePath of ["/guides", "/guides/california-real-id-documents", "/guides/apply-for-social-security-number", "/agencies", "/agencies/uscis", "/forum", "/forum/post-1", "/chatbot", "/profile"]) {
  test(`requires an account for ${privatePath}`, async ({ page }) => {
    await page.goto(privatePath);
    await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Continue browsing" })).toHaveAttribute("href", "/?continue=1");
    await page.reload();
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await page.getByRole("link", { name: "Continue browsing" }).click();
    await expect(page.getByRole("heading", { name: "Start with a free preview" })).toBeVisible();
  });
}

test("trust pages remain public", async ({ page }) => {
  for (const path of ["/privacy", "/terms"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: "Welcome back" })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});
