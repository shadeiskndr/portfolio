import { instant } from "@next/playwright";
import { expect, type Page, test } from "@playwright/test";

function navLink(page: Page, href: string) {
  return page.locator(`a[href="${href}"]:visible`).first();
}

function loadInstantly(page: Page, baseURL: string | undefined, fn: () => Promise<void>) {
  return instant(page, fn, baseURL === undefined ? {} : { baseURL });
}

async function navigateInstantly(page: Page, href: string, heading: string | RegExp) {
  const link = navLink(page, href);
  const prefetched = page
    .waitForResponse((r) => r.url().includes("_rsc") && new URL(r.url()).pathname === href, {
      timeout: 2000,
    })
    .catch(() => undefined);
  await link.scrollIntoViewIfNeeded();
  await prefetched;

  await instant(page, async () => {
    await link.click();
    await page.waitForURL((url) => url.pathname === href);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}

test.describe("initial page load", () => {
  test("the home page shell is instant", async ({ page, baseURL }) => {
    await loadInstantly(page, baseURL, async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toContainText("shahathir");
    });
  });

  test("the uses page shell is instant", async ({ page, baseURL }) => {
    await loadInstantly(page, baseURL, async () => {
      await page.goto("/uses");
      await expect(page.getByRole("heading", { level: 1, name: "Uses" })).toBeVisible();
    });
  });
});

test.describe("client navigation from the home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("shahathir");
  });

  test("to a fully static page", async ({ page }) => {
    await navigateInstantly(page, "/uses", "Uses");
  });

  test("to a page whose link sits outside the nav scroller viewport", async ({ page }) => {
    await navigateInstantly(page, "/songs", "Songs");
  });

  test("to a page backed by module data", async ({ page }) => {
    await navigateInstantly(page, "/experience", "Experience");
  });

  test("to a page backed by the filesystem", async ({ page }) => {
    await navigateInstantly(page, "/thoughts", "Thoughts");
  });

  test("to a page backed by a server-side Convex read", async ({ page }) => {
    await navigateInstantly(page, "/photography", "Photography");
  });

  test("to a page backed by a client-side Convex subscription", async ({ page }) => {
    await navigateInstantly(page, "/bookmarks", "Bookmarks");
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("to the stats page", async ({ page }) => {
    await navigateInstantly(page, "/stats", "Stats");
  });

  test("to the changelog page", async ({ page }) => {
    await navigateInstantly(page, "/changelog", "Changelogs");
  });
});

test.describe("client navigation into an MDX post", () => {
  test("from the thoughts index to a post", async ({ page }) => {
    await page.goto("/thoughts");
    await expect(page.getByRole("heading", { level: 1, name: "Thoughts" })).toBeVisible();
    await navigateInstantly(page, "/thoughts/hello-world", "Hello, world");
  });

  test("from the til index to a post", async ({ page }) => {
    await page.goto("/til");
    await expect(page.getByRole("heading", { level: 1, name: "Today I Learned" })).toBeVisible();
    await navigateInstantly(
      page,
      "/til/slash-command-activates-not-inlines",
      "A slash command should activate the skill, not paste it in"
    );
  });
});
