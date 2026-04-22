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
