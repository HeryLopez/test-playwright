import { expect, test } from "@playwright/test";

const DELAY = 400;

test.describe("Home Editor", () => {
  test("should display all three panels", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator('[data-testid="component-palette"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="editor-canvas"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="properties-panel"]'),
    ).toBeVisible();
  });

  test("should show the Text component in the palette", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.locator('[data-testid="palette-item-text"]'),
    ).toBeVisible();
  });

  test("should show empty state message on canvas before any drop", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator('[data-testid="editor-canvas"]')).toContainText(
      "Drag components here",
    );
  });

  test("should show hint message in properties panel when nothing is selected", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.locator('[data-testid="properties-panel"]'),
    ).toContainText("Select a component to edit its properties");
  });

  test("should drop a text component onto the canvas", async ({ page }) => {
    await page.goto("/");

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    );
    await page.waitForTimeout(DELAY);

    await expect(page.locator('[data-testid="canvas-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="canvas-item"]')).toContainText(
      "Text block",
    );
  });

  test("should open properties panel when clicking a canvas component", async ({
    page,
  }) => {
    await page.goto("/");

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    );
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="canvas-item"]').click();
    await page.waitForTimeout(DELAY);

    await expect(page.locator('[data-testid="prop-text"]')).toBeVisible();
    await expect(page.locator('[data-testid="prop-fontSize"]')).toBeVisible();
    await expect(page.locator('[data-testid="prop-color"]')).toBeVisible();
  });

  test("should update component text from properties panel", async ({
    page,
  }) => {
    await page.goto("/");

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    );
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="canvas-item"]').click();
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="prop-text"]').fill("Hello World");
    await page.waitForTimeout(DELAY);

    await expect(page.locator('[data-testid="canvas-item"]')).toContainText(
      "Hello World",
    );
  });

  test("should add multiple components and stack them vertically", async ({
    page,
  }) => {
    await page.goto("/");

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    );
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="canvas-item"]').first().click();
    await page.locator('[data-testid="prop-text"]').fill("First");
    await page.waitForTimeout(DELAY);

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-1"]',
    );
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="canvas-item"]').nth(1).click();
    await page.locator('[data-testid="prop-text"]').fill("Second");
    await page.waitForTimeout(DELAY);

    await expect(
      page.locator('[data-testid="canvas-item"]').first(),
    ).toContainText("First");
    await expect(
      page.locator('[data-testid="canvas-item"]').nth(1),
    ).toContainText("Second");
  });

  test("should deselect component when clicking empty canvas area", async ({
    page,
  }) => {
    await page.goto("/");

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    );
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="canvas-item"]').click();
    await page.waitForTimeout(DELAY);
    await expect(page.locator('[data-testid="prop-text"]')).toBeVisible();

    await page
      .locator('[data-testid="editor-canvas"]')
      .click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(DELAY);

    await expect(
      page.locator('[data-testid="properties-panel"]'),
    ).toContainText("Select a component to edit its properties");
  });

  test("should show preview button in header", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid="preview-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-btn"]')).toHaveText(
      "Preview",
    );
  });

  test("should navigate to preview page and render dropped components", async ({
    page,
  }) => {
    await page.goto("/");

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    );
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="canvas-item"]').click();
    await page.locator('[data-testid="prop-text"]').fill("Hello Preview");
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="preview-btn"]').click();
    await page.waitForTimeout(500);

    await expect(page).toHaveURL("/preview");
    await expect(page.locator('[data-testid="preview-item"]')).toBeVisible();
    await expect(page.locator('[data-testid="preview-item"]')).toContainText(
      "Hello Preview",
    );
  });

  test("should navigate back to editor from preview page", async ({ page }) => {
    await page.goto("/");

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    );
    await page.waitForTimeout(DELAY);

    await page.locator('[data-testid="preview-btn"]').click();
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/preview");

    await page.click("text=← Back to Editor");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/");
  });

  test("should load the demo homepage, interact with carousels and scroll to bottom", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(DELAY);

    // --- Step 1: Open Import modal ---
    await page.locator('[data-testid="io-btn"]').click();
    await page.waitForTimeout(DELAY);
    await expect(page.locator('[data-testid="ie-modal"]')).toBeVisible();

    await page.getByRole("button", { name: "Import" }).click();
    await page.waitForTimeout(DELAY);

    // --- Step 2: Load the demo content ---
    await page.locator('[data-testid="load-demo-btn"]').click();
    await page.waitForTimeout(800);

    const importInput = page.locator('[data-testid="import-json-input"]');
    await expect(importInput).not.toHaveValue("");

    // --- Step 3: Import into the canvas ---
    await page.locator('[data-testid="import-json-btn"]').click();
    await page.waitForTimeout(800);

    await expect(page.locator('[data-testid="ie-modal"]')).not.toBeVisible();
    await expect(
      page.locator('[data-testid="canvas-item"]').first(),
    ).toBeVisible();

    // --- Step 4: Scroll the editor canvas to show loaded content ---
    const canvas = page.locator('[data-testid="editor-canvas"]');
    await canvas.evaluate((el) =>
      el.scrollTo({ top: 400, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);
    await canvas.evaluate((el) =>
      el.scrollTo({ top: 900, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);
    await canvas.evaluate((el) => el.scrollTo({ top: 0, behavior: "smooth" }));
    await page.waitForTimeout(500);

    // --- Step 5: Navigate to Preview ---
    await page.locator('[data-testid="preview-btn"]').click();
    await page.waitForURL("**/preview");
    await page.waitForTimeout(800);

    await expect(
      page.locator('[data-testid="preview-item"]').first(),
    ).toBeVisible();

    const scroller = page.locator(".preview-layout-root");

    // --- Step 6: Interact with carousel 1 (Block Types showcase) ---
    const carousel1 = page.locator("[data-carousel-block]").first();
    await carousel1.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);

    const next1 = page.locator('[data-testid="carousel-btn-next"]').first();
    const prev1 = page.locator('[data-testid="carousel-btn-prev"]').first();

    await next1.click();
    await page.waitForTimeout(450);
    await next1.click();
    await page.waitForTimeout(450);
    await next1.click();
    await page.waitForTimeout(450);
    await next1.click(); // wraps to last slide
    await page.waitForTimeout(450);
    await prev1.click();
    await page.waitForTimeout(450);
    await prev1.click();
    await page.waitForTimeout(700);

    // --- Step 7: Scroll through the Features section ---
    await scroller.evaluate((el) =>
      el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);
    await scroller.evaluate((el) =>
      el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);

    // --- Step 8: Interact with carousel 2 (Gallery / Screenshots) ---
    const carousel2 = page.locator("[data-carousel-block]").nth(1);
    await carousel2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);

    const next2 = page.locator('[data-testid="carousel-btn-next"]').nth(1);
    const prev2 = page.locator('[data-testid="carousel-btn-prev"]').nth(1);

    await next2.click();
    await page.waitForTimeout(450);
    await next2.click();
    await page.waitForTimeout(450);
    await next2.click();
    await page.waitForTimeout(450);
    await prev2.click();
    await page.waitForTimeout(700);

    // --- Step 9: Scroll through How it Works ---
    await scroller.evaluate((el) =>
      el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);
    await scroller.evaluate((el) =>
      el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);
    await scroller.evaluate((el) =>
      el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);

    // --- Step 10: Interact with carousel 3 (Templates) ---
    const carousel3 = page.locator("[data-carousel-block]").nth(2);
    await carousel3.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);

    const next3 = page.locator('[data-testid="carousel-btn-next"]').nth(2);

    await next3.click();
    await page.waitForTimeout(450);
    await next3.click();
    await page.waitForTimeout(450);
    await next3.click();
    await page.waitForTimeout(700);

    // --- Step 11: Scroll to bottom (Testimonials → Pricing → CTA → Footer) ---
    await scroller.evaluate((el) =>
      el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);
    await scroller.evaluate((el) =>
      el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);
    await scroller.evaluate((el) =>
      el.scrollBy({ top: el.clientHeight * 0.85, behavior: "smooth" }),
    );
    await page.waitForTimeout(700);

    // Snap to the very bottom so the footer is fully visible
    await scroller.evaluate((el) =>
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }),
    );
    await page.waitForTimeout(1200);

    // --- Step 12: Verify content ---
    const itemCount = await page.locator('[data-testid="preview-item"]').count();
    expect(itemCount).toBeGreaterThan(10);

    const carouselCount = await page
      .locator("[data-carousel-block]")
      .count();
    expect(carouselCount).toBe(3);

    // --- Step 13: Scroll back to top ---
    await scroller.evaluate((el) =>
      el.scrollTo({ top: 0, behavior: "smooth" }),
    );
    await page.waitForTimeout(800);

    // --- Step 14: Back to editor ---
    await page.click("text=← Back to Editor");
    await page.waitForURL("/");
    await page.waitForTimeout(DELAY);
  });
});
