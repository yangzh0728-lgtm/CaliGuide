import { expect, test, type Page } from "@playwright/test";
import { PROFILE_PROMPT_COPY } from "../src/i18n/profilePromptCopy";
import { OPTIONAL_PROFILE_COPY } from "../src/i18n/optionalProfileCopy";
import type { LanguageCode } from "../src/i18n/translations";
import { BLOG_ARTICLES } from "../src/lib/blogContent";

test("sign-in unlocks the requested guide and the complete directories", async ({ page }) => {
  await mockAccount(page, { signedOut: true, metadata: { profile_reminder_dismissed: true } });
  await page.goto("/guides/california-real-id-documents");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByLabel("Email", { exact: true }).fill("reader@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await page.locator('button[type="submit"]').click();
  await expect(page.getByRole("heading", { level: 1, name: /REAL ID Document Preparation Guide/ })).toBeVisible();
  await expect(page).toHaveURL(/\/guides\/california-real-id-documents$/);
  await page.goto("/guides");
  await expect(page.locator("[data-guide-card]")).toHaveCount(BLOG_ARTICLES.length);
  await page.locator('[data-guide-group="safety"]:visible').click();
  await expect(page.locator("[data-guide-card]")).toHaveCount(1);
  await page.locator('[data-reference-tab="agencies"]').click();
  await expect(page).toHaveURL(/\/agencies$/);
  await expect(page.getByRole("heading", { name: "Official agencies and services" })).toBeVisible();
});

test("OAuth callback restores the requested agency once", async ({ page }) => {
  await mockAccount(page, { metadata: { profile_reminder_dismissed: true } });
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('test-return-set')) {
      sessionStorage.setItem('test-return-set', '1');
      sessionStorage.setItem('caliguide-auth-return-path', JSON.stringify({ path: '/agencies/uscis', time: Date.now() }));
    }
  });
  await page.goto('/');
  await expect(page).toHaveURL(/\/agencies\/uscis$/);
  await expect(page.getByRole('heading', { level: 1, name: /U.S. Citizenship and Immigration Services/ })).toBeVisible();
  expect(await page.evaluate(() => sessionStorage.getItem('caliguide-auth-return-path'))).toBeNull();
});

test("anonymous guide reports preserve edits on failure and can be retried", async ({ page }, testInfo) => {
  let attempts = 0;
  await page.route("**/api/guides/reports", async (route) => {
    expect(route.request().headers().authorization).toBeUndefined();
    expect(route.request().postDataJSON()).toMatchObject({ articleId: "forum-first-30-days", language: "en", sectionIndex: null });
    attempts++;
    await route.fulfill({ status: attempts === 1 ? 503 : 201, json: attempts === 1 ? { error: "private database error" } : { ok: true } });
  });
  await page.goto("/guides/first-30-days-in-california");
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
  await expect(page.getByRole("heading", { name: "Required account information" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Optional profile information" })).toBeVisible();
  await expect(page.locator('input[type="date"]')).not.toHaveAttribute("required");
  await expect(page.getByLabel("Sex", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Arrival stage", { exact: false })).toHaveValue("");
  await page.getByLabel("Email", { exact: true }).fill("reader@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await page.screenshot({ path: testInfo.outputPath("registration.png"), fullPage: true });
  await page.locator('button[type="submit"]').click();
  await expect.poll(() => signup?.email).toBe("reader@example.com");
  expect(signup.data).toEqual({ name: "CaliGuide Member", arrival_status_provided: false });
});

async function mockAccount(page: Page, options: { newMember?: boolean; failProfileOnce?: boolean; signedOut?: boolean; metadata?: Record<string, unknown>; failPreference?: boolean; avatarUrl?: string } = {}) {
  const id = "11111111-1111-4111-8111-111111111111";
  const user = { id, aud: "authenticated", role: "authenticated", email: "reader@example.com", created_at: "2026-01-01T00:00:00Z", app_metadata: { provider: "email" }, user_metadata: { name: options.newMember ? "CaliGuide Member" : "Test Reader", arrival_status_provided: !options.newMember, ...options.metadata } };
  const profile = { id, name: user.user_metadata.name, avatar_url: options.avatarUrl, member_since: "2026-01-01T00:00:00Z", arrival_status: options.newMember ? "planning" : "arrived", nationalities: [] };
  const profileWrites: Record<string, unknown>[] = [];
  let failedProfile = false;
  const jwt = `${Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url")}.${Buffer.from(JSON.stringify({ sub: id, exp: Math.floor(Date.now() / 1000) + 3600, role: "authenticated" })).toString("base64url")}.test`;
  if (!options.signedOut) await page.addInitScript(({ user, jwt }) => {
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
    if (url.pathname.includes("/auth/v1/token")) return route.fulfill({ json: { access_token: jwt, refresh_token: "test-refresh", expires_in: 3600, token_type: "bearer", user } });
    if (url.pathname.includes("/auth/v1/logout")) return route.fulfill({ status: 204 });
    if (url.pathname.includes("/auth/v1/user")) {
      if (options.failPreference && route.request().method() === "PUT") return route.fulfill({ status: 503, json: { message: "Private auth failure" } });
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
  return { progress: () => progress, profileWrites: () => profileWrites, metadata: () => user.user_metadata };
}

async function signIn(page: Page) {
  await page.goto("/profile");
  const consent = page.getByRole("button", { name: "Reject non-essential", exact: true });
  if (await consent.isVisible()) await consent.click();
  await page.getByLabel("Email", { exact: true }).fill("reader@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Test-password-123");
  await page.locator('button[type="submit"]').click();
}

test("saved cartoon defaults display the new initials avatar", async ({ page }, testInfo) => {
  const legacy = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="144" r="24"/><path d="M45 178 Q100 126 155 178"/></svg>';
  await mockAccount(page, { avatarUrl: `data:image/svg+xml,${encodeURIComponent(legacy)}` });
  await page.goto("/profile");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  const avatar = page.getByRole("img", { name: "Test Reader", exact: true });
  await expect(avatar).toBeVisible();
  await expect.poll(() => avatar.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(128);
  expect(decodeURIComponent(await avatar.getAttribute("src") ?? "")).toContain('data-caliguide-avatar="monogram-v1"');
  expect(decodeURIComponent(await avatar.getAttribute("src") ?? "")).toContain('>TR</text>');
  await page.screenshot({ path: testInfo.outputPath("default-avatar-profile.png") });
});

test("later login asks only for missing information and saves a partial answer", async ({ page }, testInfo) => {
  const account = await mockAccount(page, { signedOut: true, metadata: { sex: "prefer_not_to_say" }, failProfileOnce: true });
  await signIn(page);
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Add optional profile details?" })).toBeVisible();
  await expect(dialog.getByLabel("Display name")).toHaveCount(0);
  await expect(dialog.getByLabel("Sex", { exact: true })).toHaveCount(0);
  await expect(dialog.getByLabel("Arrival stage", { exact: false })).toHaveCount(0);
  await dialog.getByLabel("Current state/city").fill("Los Angeles, CA");
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(dialog.getByLabel("Current state/city")).toHaveValue("Los Angeles, CA");
  await page.screenshot({ path: testInfo.outputPath("completion-reminder.png") });
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect(Object.keys(account.profileWrites()[0]).sort()).toEqual(["current_location", "updated_at"]);
  expect(account.metadata()).toHaveProperty("profile_reminder_after");
  await page.reload();
  await expect(dialog).not.toBeVisible();
});

for (const choice of ["Not now", "Don't ask again"] as const) {
  test(`profile reminder remembers ${choice} across logins`, async ({ page }) => {
    const account = await mockAccount(page, { signedOut: true, newMember: true });
    await signIn(page);
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: choice, exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect.poll(() => account.metadata()).toHaveProperty(choice === "Not now" ? "profile_reminder_after" : "profile_reminder_dismissed");
    await page.evaluate(() => localStorage.removeItem("sb-example-auth-token"));
    await signIn(page);
    await expect(page.getByText("Your next steps in California", { exact: true })).toBeVisible();
    await expect(dialog).not.toBeVisible();
  });
}

test("Not now never blocks access when saving the preference fails", async ({ page }) => {
  await mockAccount(page, { signedOut: true, newMember: true, failPreference: true });
  await signIn(page);
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Not now", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Your next steps in California", { exact: true })).toBeVisible();
});

test("a complete profile is never prompted on login", async ({ page }) => {
  await mockAccount(page, { signedOut: true, metadata: { sex: "prefer_not_to_say", date_of_birth: "1994-03-12", nationalities: ["Canada"], current_location: "Los Angeles, CA" } });
  await signIn(page);
  await expect(page.getByText("Test Reader", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

for (const marker of ["fresh", "expired", "none"] as const) {
  test(`OAuth return only offers a reminder for a fresh login intent: ${marker}`, async ({ page }) => {
    await mockAccount(page, { newMember: true });
    await page.addInitScript((marker) => {
      if (marker !== "none") sessionStorage.setItem("caliguide-oauth-login", String(Date.now() - (marker === "expired" ? 3600000 : 1000)));
    }, marker);
    await page.goto("/profile");
    await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
    await expect(page.getByText("Your next steps in California", { exact: true })).toBeVisible();
    if (marker === "fresh") await expect(page.getByRole("dialog")).toBeVisible();
    else await expect(page.getByRole("dialog")).not.toBeVisible();
  });
}

for (const language of ["en", "zh-CN", "zh-TW", "yue", "es"] as LanguageCode[]) {
  test(`missing-profile reminder fits and can be dismissed: ${language}`, async ({ page }, testInfo) => {
    await mockAccount(page, { newMember: true });
    await page.addInitScript((language) => {
      localStorage.setItem("caliguide-language", language);
      sessionStorage.setItem("caliguide-oauth-login", String(Date.now()));
    }, language);
    await page.goto("/profile");
    const buttons = page.getByRole("button");
    const rejectLabels = { en: "Reject non-essential", "zh-CN": "拒绝非必要项", "zh-TW": "拒絕非必要項目", yue: "拒絕非必要項目", es: "Rechazar lo no esencial" };
    await buttons.filter({ hasText: rejectLabels[language] }).click();
    const dialog = page.getByRole("dialog");
    const copy = OPTIONAL_PROFILE_COPY[language];
    await expect(dialog.getByRole("heading", { name: copy.title })).toBeVisible();
    await expect(dialog.getByRole("combobox")).toHaveCount(3);
    await expect(dialog.getByRole("button", { name: copy.never })).toBeVisible();
    const layout = await dialog.evaluate((node) => ({ overflow: node.scrollWidth > node.clientWidth, top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom }));
    expect(layout.overflow).toBe(false);
    expect(layout.top).toBeGreaterThanOrEqual(0);
    expect(layout.bottom).toBeLessThanOrEqual(page.viewportSize()!.height);
    await page.screenshot({ path: testInfo.outputPath(`completion-${language}.png`) });
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });
}

test("registration accepts optional details without changing the password", async ({ page }) => {
  let signup: any;
  await page.route("https://example.supabase.co/auth/v1/signup**", async (route) => {
    signup = route.request().postDataJSON();
    await route.fulfill({ json: { id: "reader", email: signup.email, identities: [{ id: "email" }], user_metadata: signup.data } });
  });
  await page.goto("/profile");
  await page.getByRole("button", { name: "Reject non-essential", exact: true }).click();
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await page.getByRole("button", { name: /email/i }).click();
  await page.getByLabel("Email", { exact: true }).fill("reader@example.com");
  await page.getByLabel("Password", { exact: true }).fill(" Test-password-123 ");
  await page.getByLabel("Display name").fill("River");
  await page.getByLabel("Date of birth").fill("1994-03-12");
  await page.getByLabel("Sex", { exact: true }).selectOption("prefer_not_to_say");
  await page.getByLabel("Country / nationality 1").selectOption("Canada");
  await page.getByRole("button", { name: "Add nationality" }).click();
  await page.getByLabel("Country / nationality 2").selectOption("Mexico");
  await page.getByLabel("Current state/city").fill("Los Angeles, CA");
  await page.getByLabel("Arrival stage", { exact: false }).selectOption("planning");
  await page.locator('button[type="submit"]').click();
  await expect.poll(() => signup?.data).toMatchObject({ name: "River", date_of_birth: "1994-03-12", sex: "prefer_not_to_say", sex_provided: true, nationalities: ["Canada", "Mexico"], current_location: "Los Angeles, CA", arrival_status: "planning", arrival_status_provided: true });
  expect(signup.password).toBe(" Test-password-123 ");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

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
