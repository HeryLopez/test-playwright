import { expect, test } from '@playwright/test'

const DELAY = 400

test.describe('Home Editor', () => {
  test('should display all three panels', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="component-palette"]')).toBeVisible()
    await expect(page.locator('[data-testid="editor-canvas"]')).toBeVisible()
    await expect(page.locator('[data-testid="properties-panel"]')).toBeVisible()
  })

  test('should show the Text component in the palette', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="palette-item-text"]')).toBeVisible()
  })

  test('should show empty state message on canvas before any drop', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="editor-canvas"]')).toContainText('Drag components here')
  })

  test('should show hint message in properties panel when nothing is selected', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="properties-panel"]')).toContainText(
      'Select a component to edit its properties',
    )
  })

  test('should drop a text component onto the canvas', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    )
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="canvas-item"]')).toBeVisible()
    await expect(page.locator('[data-testid="canvas-item"]')).toContainText('Text block')
  })

  test('should open properties panel when clicking a canvas component', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').click()
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="prop-text"]')).toBeVisible()
    await expect(page.locator('[data-testid="prop-fontSize"]')).toBeVisible()
    await expect(page.locator('[data-testid="prop-color"]')).toBeVisible()
  })

  test('should update component text from properties panel', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').click()
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="prop-text"]').fill('Hello World')
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="canvas-item"]')).toContainText('Hello World')
  })

  test('should add multiple components and stack them vertically', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').first().click()
    await page.locator('[data-testid="prop-text"]').fill('First')
    await page.waitForTimeout(DELAY)

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-1"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').nth(1).click()
    await page.locator('[data-testid="prop-text"]').fill('Second')
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="canvas-item"]').first()).toContainText('First')
    await expect(page.locator('[data-testid="canvas-item"]').nth(1)).toContainText('Second')
  })

  test('should deselect component when clicking empty canvas area', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').click()
    await page.waitForTimeout(DELAY)
    await expect(page.locator('[data-testid="prop-text"]')).toBeVisible()

    await page.locator('[data-testid="editor-canvas"]').click({ position: { x: 5, y: 5 } })
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="properties-panel"]')).toContainText(
      'Select a component to edit its properties',
    )
  })

  test('should show preview button in header', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-testid="preview-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="preview-btn"]')).toHaveText('Preview')
  })

  test('should navigate to preview page and render dropped components', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').click()
    await page.locator('[data-testid="prop-text"]').fill('Hello Preview')
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="preview-btn"]').click()
    await page.waitForTimeout(500)

    await expect(page).toHaveURL('/preview')
    await expect(page.locator('[data-testid="preview-item"]')).toBeVisible()
    await expect(page.locator('[data-testid="preview-item"]')).toContainText('Hello Preview')
  })

  test('should navigate back to editor from preview page', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="drop-zone-0"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="preview-btn"]').click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL('/preview')

    await page.click('text=← Back to Editor')
    await page.waitForTimeout(500)
    await expect(page).toHaveURL('/')
  })
})

  test('should display all three panels', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="component-palette"]')).toBeVisible()
    await expect(page.locator('[data-testid="editor-canvas"]')).toBeVisible()
    await expect(page.locator('[data-testid="properties-panel"]')).toBeVisible()
  })

  test('should show the Text component in the palette', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="palette-item-text"]')).toBeVisible()
  })

  test('should show empty state message on canvas before any drop', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="editor-canvas"]')).toContainText('Drag components here')
  })

  test('should show hint message in properties panel when nothing is selected', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(page.locator('[data-testid="properties-panel"]')).toContainText(
      'Select a component to edit its properties',
    )
  })

  test('should drop a text component onto the canvas', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="editor-canvas"]',
    )
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="canvas-item"]')).toBeVisible()
    await expect(page.locator('[data-testid="canvas-item"]')).toContainText('Text block')
  })

  test('should open properties panel when clicking a canvas component', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="editor-canvas"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').click()
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="prop-text"]')).toBeVisible()
    await expect(page.locator('[data-testid="prop-fontSize"]')).toBeVisible()
    await expect(page.locator('[data-testid="prop-color"]')).toBeVisible()
  })

  test('should update component text from properties panel', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="editor-canvas"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').click()
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="prop-text"]').fill('Hello World')
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="canvas-item"]')).toContainText('Hello World')
  })

  test('should deselect component when clicking empty canvas area', async ({ page }) => {
    await page.goto('/')

    await page.dragAndDrop(
      '[data-testid="palette-item-text"]',
      '[data-testid="editor-canvas"]',
    )
    await page.waitForTimeout(DELAY)

    await page.locator('[data-testid="canvas-item"]').click()
    await page.waitForTimeout(DELAY)
    await expect(page.locator('[data-testid="prop-text"]')).toBeVisible()

    // Click on the raw canvas element (top-left corner, away from components)
    await page.locator('[data-testid="editor-canvas"]').click({ position: { x: 5, y: 5 } })
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="properties-panel"]')).toContainText(
      'Select a component to edit its properties',
    )
  })
})

  test("should display the form correctly", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toHaveText("Contact Form");
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#age")).toBeVisible();
    await expect(page.locator("#message")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText("Submit");
  });

  test("should fill the form and display data on the result page", async ({
    page,
  }) => {
    await page.goto("/");

    // Fill the form
    await page.locator("#name").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#name", "John Doe");
    await page.waitForTimeout(DELAY);

    await page.locator("#email").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#email", "john@example.com");
    await page.waitForTimeout(DELAY);

    await page.locator("#age").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#age", "30");
    await page.waitForTimeout(DELAY);

    await page.locator("#message").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#message", "Hello, this is a test message");
    await page.waitForTimeout(DELAY);

    // Submit the form
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Verify we are on the results page
    await expect(page).toHaveURL("/resultado");
    await expect(page.locator("h1")).toHaveText("Received Data");

    // Verify the data is displayed correctly
    await expect(page.locator('[data-testid="result-name"]')).toHaveText(
      "John Doe",
    );
    await expect(page.locator('[data-testid="result-email"]')).toHaveText(
      "john@example.com",
    );
    await expect(page.locator('[data-testid="result-age"]')).toHaveText("30");
    await expect(page.locator('[data-testid="result-message"]')).toHaveText(
      "Hello, this is a test message",
    );
  });

  test("should be able to go back to the form from the results page", async ({
    page,
  }) => {
    await page.goto("/");

    await page.locator("#name").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#name", "Jane Smith");
    await page.waitForTimeout(DELAY);

    await page.locator("#email").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#email", "jane@example.com");
    await page.waitForTimeout(DELAY);

    await page.locator("#age").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#age", "25");
    await page.waitForTimeout(DELAY);

    await page.locator("#message").click();
    await page.waitForTimeout(DELAY);
    await page.fill("#message", "Test message");
    await page.waitForTimeout(DELAY);

    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/resultado");

    // Click "Back to form"
    await page.click("text=Back to form");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL("/");
    await expect(page.locator("h1")).toHaveText("Contact Form");
  });

  test("should not submit the form if fields are empty", async ({ page }) => {
    await page.goto("/");

    // Try to submit without filling anything
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should remain on the same page (HTML5 validation blocks the submit)
    await expect(page).toHaveURL("/");
  });

  test("should show a message when accessing /resultado without data", async ({
    page,
  }) => {
    await page.goto("/resultado");
    await page.waitForTimeout(500);

    await expect(page.locator("h1")).toHaveText("No Data");
    await expect(
      page.locator("text=No form data has been submitted"),
    ).toBeVisible();
  });
});
