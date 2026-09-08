import { expect, test, type Page } from "@playwright/test";
import { PROFILE_PROMPT_COPY } from "../src/i18n/profilePromptCopy";
import type { LanguageCode } from "../src/i18n/translations";

test("anonymous guide reports preserve edits on failure and can be retried", async ({ page }, testInfo) => {
  let attempts = 0;
  await page.route("**/api/guides/reports", async (route) => {
    expect(route.request().headers().authorization).toBeUndefined();
    expect(route.request().postDataJSON()).toMatchObject({ articleId: "guide-real-id-documents", language: "en", sectionIndex: null });
    attempts++;
    await route.fulfill({ status: attempts === 1 ? 503 : 201, json: attempts === 1 ? { error: "private database error" } : { ok: true } });
  });
  await page.goto("/guides/california-real-id-documents");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await page.getByRole("button", { name: "Report incorrect information", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("textbox").fill("The official link moved.");
  await dialog.getByRole("button", { name: "Submit report", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Something went wrong. Please try again.");
  await expect(dialog.getByRole("textbox")).toHaveValue("The official link moved.");
  await page.screenshot({ path: testInfo.outputPath("report-form.png"), fullPage: false });
  await dialog.getByRole("button", { name: "Submit report", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText("review queue");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).not.toBeVisible();
});

test("email registration requires no demographic details", async ({ page }, testInfo) => {
  let signup: any;
  await page.route("https://example.supabase.co/auth/v1/signup**", async (route) => {
    signup = route.request().postDataJSON();
    await route.fulfill({ status: 200, json: { id: "11111111-1111-4111-8111-111111111111", email: signup.email, identities: [{ id: "email" }], user_metadata: signup.data } });
  });
  await page.goto("/profile");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await page.getByRole("button", { name: /email/i }).click();
  await expect(page.locator('input[type="date"]')).toHaveCount(0);
  await expect(page.locator("form select")).toHaveCount(0);
  await page.getByLabel("Email", { exact: true }).fill("reader@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await page.screenshot({ path: testInfo.outputPath("registration.png") });
  await page.locator('button[type="submit"]').click();
  await expect.poll(() => signup?.email).toBe("reader@example.com");
  expect(signup.data).toEqual({ name: "CaliGuide Member", arrival_status_provided: false });
});

async function mockAccount(page: Page, options: { newMember?: boolean; failProfileOnce?: boolean } = {}) {
  const id = "11111111-1111-4111-8111-111111111111";
  const user = { id, aud: "authenticated", role: "authenticated", email: "reader@example.com", created_at: "2026-01-01T00:00:00Z", app_metadata: { provider: "email" }, user_metadata: { name: options.newMember ? "CaliGuide Member" : "Test Reader", arrival_status_provided: !options.newMember } };
  const profile = { id, name: user.user_metadata.name, member_since: "2026-01-01T00:00:00Z", arrival_status: options.newMember ? "planning" : "arrived", nationalities: [] };
  const profileWrites: Record<string, unknown>[] = [];
  let failedProfile = false;
  const jwt = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: "authenticated" })).toString("base64url")}.test`;
  await page.addInitScript(({ user, jwt }) => {
    if (!localStorage.getItem("sb-example-auth-token")) {
      localStorage.setItem("sb-example-auth-token", JSON.stringify({ access_token: jwt, refresh_token: "test-refresh", expires_at: Math.floor(Date.now() / 1000) + 3600, expires_in: 3600, token_type: "bearer", user }));
    }
  }, { user, jwt });
  let progress: string[] = [];
  let savedGuides: string[] = [];
  const chats = [
    { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", user_id: id, title: "Latest conversation", created_at: "2026-09-01T00:00:00Z", updated_at: "2026-09-02T00:00:00Z" },
    { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", user_id: id, title: "Older conversation", created_at: "2026-08-01T00:00:00Z", updated_at: "2026-08-02T00:00:00Z" },
  ];
  await page.route("https://example.supabase.co/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes("/auth/v1/user")) {
      if (route.request().method() === "PUT") Object.assign(user.user_metadata, route.request().postDataJSON().data);
      return route.fulfill({ json: user });
    }
    if (url.pathname.includes("/profiles")) {
      if (route.request().method() === "PATCH") {
        if (options.failProfileOnce && !failedProfile) {
          failedProfile = true;
          return route.fulfill({ status: 503, json: { message: "Private database failure" } });
        }
        const data = route.request().postDataJSON();
        profileWrites.push(data);
        Object.assign(profile, data);
      }
      return route.fulfill({ json: profile });
    }
    if (url.pathname.includes("/saved_guides")) {
      if (route.request().method() === "POST") {
        savedGuides.push(route.request().postDataJSON().guide_id);
        return route.fulfill({ status: 201, body: "" });
      }
      return route.fulfill({ json: savedGuides.map((guide_id) => ({ guide_id })) });
    }
    if (url.pathname.includes("/chat_sessions")) return route.fulfill({ json: chats });
    if (url.pathname.includes("/chat_messages")) return route.fulfill({ json: chats.map((chat, index) => ({
      id: chat.id, user_id: id, session_id: chat.id, role: "user", created_at: chat.created_at,
      content: index === 0 ? "Latest message about banks" : "Earlier question about housing",
    })) });
    if (url.pathname.includes("/moving_checklist_progress")) {
      if (route.request().method() === "POST") {
        const data = route.request().postDataJSON();
        expect(data.user_id).toBe(id);
        progress = data.completed_task_ids;
        return route.fulfill({ status: 201, body: "" });
      }
      return route.fulfill({ json: { completed_task_ids: progress } });
    }
    return route.fulfill({ json: [] });
  });
  await page.route("**/api/**", (route) => route.fulfill({ json: { ok: true } }));
  return { progress: () => progress, profileWrites: () => profileWrites };
}

test("arrival personalization is opt-in and preserves edits after a failed save", async ({ page }, testInfo) => {
  const account = await mockAccount(page, { newMember: true, failProfileOnce: true });
  await page.goto("/profile");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("Your next steps in California", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Personalize suggestions" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("combobox")).toHaveValue("");
  await dialog.getByRole("button", { name: "Skip for now" }).click();
  expect(account.profileWrites()).toEqual([]);
  await page.getByRole("button", { name: "Personalize suggestions" }).click();
  await dialog.getByRole("combobox").selectOption("arrived");
  await dialog.getByRole("button", { name: "Save and continue" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Something went wrong");
  await expect(dialog.getByRole("combobox")).toHaveValue("arrived");
  await page.screenshot({ path: testInfo.outputPath("arrival-prompt.png") });
  await dialog.getByRole("button", { name: "Save and continue" }).click();
  await expect(dialog).not.toBeVisible();
  expect(account.profileWrites()).toHaveLength(1);
  expect(Object.keys(account.profileWrites()[0]).sort()).toEqual(["arrival_status", "updated_at"]);
  await page.reload();
  await page.getByRole("button", { name: "Personalize suggestions" }).click();
  await expect(dialog.getByRole("combobox")).toHaveValue("arrived");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Personalize suggestions" })).toBeFocused();
});

test("nickname prompt can be skipped without blocking the forum composer", async ({ page }) => {
  const account = await mockAccount(page, { newMember: true });
  await page.goto("/forum");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await page.getByRole("button", { name: "Create a forum post" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Display name")).toHaveValue("");
  await dialog.getByRole("button", { name: "Skip for now" }).click();
  await expect(page.getByText("Start a discussion", { exact: true })).toBeVisible();
  expect(account.profileWrites()).toEqual([]);
});

test("nickname save only changes the name and continues composing", async ({ page }, testInfo) => {
  const account = await mockAccount(page, { newMember: true });
  await page.goto("/forum");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await page.getByRole("button", { name: "Create a forum post" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Display name").fill("River");
  await page.screenshot({ path: testInfo.outputPath("nickname-prompt.png") });
  await dialog.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByText("Start a discussion", { exact: true })).toBeVisible();
  expect(account.profileWrites()).toHaveLength(1);
  expect(Object.keys(account.profileWrites()[0]).sort()).toEqual(["name", "updated_at"]);
  await page.reload();
  await page.getByRole("button", { name: "Create a forum post" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("Start a discussion", { exact: true })).toBeVisible();
});

for (const language of ["en", "zh-CN", "zh-TW", "yue", "es"] as LanguageCode[]) {
  test(`profile pop-up is localized and fits the viewport: ${language}`, async ({ page }, testInfo) => {
    await mockAccount(page, { newMember: true });
    await page.goto("/profile");
    await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
    await page.evaluate((code) => localStorage.setItem("caliguide-language", code), language);
    await page.reload();
    const copy = PROFILE_PROMPT_COPY[language];
    await page.getByRole("button", { name: copy.personalize }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: copy.arrivalTitle })).toBeVisible();
    await expect(dialog.getByRole("combobox")).toHaveValue("");
    const layout = await dialog.evaluate((element) => ({
      width: element.scrollWidth, clientWidth: element.clientWidth,
      top: element.getBoundingClientRect().top, bottom: element.getBoundingClientRect().bottom,
    }));
    expect(layout.width).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.top).toBeGreaterThanOrEqual(0);
    expect(layout.bottom).toBeLessThanOrEqual(page.viewportSize()!.height);
    await page.screenshot({ path: testInfo.outputPath(`prompt-${language}.png`) });
    await dialog.getByRole("button", { name: copy.close, exact: true }).click();
    await expect(dialog).not.toBeVisible();
  });
}

test("account checklist persists through reload and reset without optional storage", async ({ page }) => {
  const account = await mockAccount(page);
  await page.goto("/guides/california-moving-address-checklist");
  const usps = page.getByRole("checkbox", { name: /USPS mail forwarding/ });
  await expect(usps).toBeEnabled();
  await usps.check();
  await expect.poll(account.progress).toEqual(["usps"]);
  await page.reload();
  await expect(usps).toBeChecked();
  await page.getByRole("button", { name: "Reset checklist", exact: true }).click();
  await expect.poll(account.progress).toEqual([]);
  await page.reload();
  await expect(usps).not.toBeChecked();
  await page.goto("/profile");
  await expect(page.getByText("Test Reader", { exact: true })).toBeVisible();
});

test("saved guides survive reload and recent chats open the selected conversation", async ({ page }, testInfo) => {
  await mockAccount(page);
  await page.goto("/guides/california-real-id-documents");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await page.getByRole("button", { name: "Save guide", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Saved", exact: true })).toBeVisible();
  await page.goto("/profile");
  await expect(page.getByText("REAL ID Document Preparation Guide", { exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("profile.png"), fullPage: true });
  await page.getByRole("button", { name: /Older conversation/ }).click();
  await expect(page).toHaveURL(/\/chatbot$/);
  await expect(page.getByText("Earlier question about housing", { exact: true })).toBeVisible();
  await expect(page.getByText("Latest message about banks", { exact: true })).toHaveCount(0);
});
