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
