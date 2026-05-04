import { test, expect } from '@playwright/test'

const DELAY = 400

// Minimal mock API response that satisfies the full scraping pipeline
const MOCK_REPORT_RESPONSE = {
  success: true,
  reportId: 1700000000000,
  url: 'https://example.com',
  capturedAt: new Date().toISOString(),
  screenshots: [
    { type: 'full-page',  path: '1700000000000/full-page.png',  width: 1920, height: 3840, section: 'Complete page',           url: '/screenshots/1700000000000/full-page.png' },
    { type: 'viewport',   path: '1700000000000/viewport.png',   width: 1920, height: 1080, section: 'Hero section (viewport)', url: '/screenshots/1700000000000/viewport.png' },
    { type: 'desktop',    path: '1700000000000/desktop.png',    width: 1440, height: 900,  section: 'Desktop viewport',        url: '/screenshots/1700000000000/desktop.png' },
    { type: 'mobile',     path: '1700000000000/mobile.png',     width: 375,  height: 812,  section: 'Mobile viewport',         url: '/screenshots/1700000000000/mobile.png' },
  ],
  html: { path: '1700000000000/index.html', url: '/screenshots/1700000000000/index.html' },
  metadata: { title: 'Example Domain', description: 'Example description', lang: 'en' },
  structure: { totalElements: 10, headers: 1, images: 0, links: 1, buttons: 0, forms: 0, inputs: 0, sections: 0, divs: 5, scripts: 0, styles: 0 },
  images: [],
  videos: [],
  animations: { gifs: [], cssAnimations: [], totalAnimated: 0 },
  texts: [
    { id: 'text-0', content: 'Example Domain', type: 'heading', tag: 'h1', context: 'div' },
    { id: 'text-1', content: 'This domain is for use in illustrative examples.', type: 'paragraph', tag: 'p', context: 'div' },
  ],
  colors: [
    { id: 'color-0', hex: '#000000', rgb: 'rgb(0,0,0)',     count: 10, usage: 'color' },
    { id: 'color-1', hex: '#ffffff', rgb: 'rgb(255,255,255)', count: 8, usage: 'background-color' },
    { id: 'color-2', hex: '#0000ee', rgb: 'rgb(0,0,238)',   count: 3, usage: 'color' },
    { id: 'color-3', hex: '#551a8b', rgb: 'rgb(85,26,139)', count: 2, usage: 'color' },
    { id: 'color-4', hex: '#eeeeee', rgb: 'rgb(238,238,238)', count: 1, usage: 'background-color' },
  ],
}

/**
 * Intercept the screenshot API call and return mock data so tests are
 * independent of the backend server being available.
 */
async function mockScreenshotApi(page) {
  await page.route('**/api/screenshot', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_REPORT_RESPONSE),
    })
  })
}

test.describe('Site Scraper Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to scraping app via burger menu', async ({ page }) => {
    // Open burger menu
    await page.click('[data-testid="burger-menu-btn"]')
    await page.waitForTimeout(DELAY)

    // Verify menu is visible
    await expect(page.locator('.burger-menu-nav')).toBeVisible()
    await expect(page.locator('text=Site Scraper')).toBeVisible()

    // Click on Site Scraper menu item
    await page.click('[data-testid="menu-item-scraping"]')
    await page.waitForTimeout(DELAY)

    // Verify navigation to /scraping
    await expect(page).toHaveURL('/scraping')
  })

  test('should show scraper input form on scraping page', async ({ page }) => {
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    // Verify page elements
    await expect(page.locator('text=Site Scraper')).toBeVisible()
    await expect(page.locator('[data-testid="scraper-url-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="scraper-submit-btn"]')).toBeVisible()

    // Verify features are shown
    await expect(page.locator('text=Real screenshots with Playwright')).toBeVisible()
    await expect(page.locator('text=Extract colors, images, texts')).toBeVisible()
  })

  test('should complete full scraping flow', async ({ page }) => {
    await mockScreenshotApi(page)
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    // Enter URL
    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.waitForTimeout(DELAY)

    // Submit form
    await page.click('[data-testid="scraper-submit-btn"]')
    await page.waitForTimeout(DELAY)

    // Should show progress indicator
    await expect(page.locator('.scraper-progress-container')).toBeVisible()
    await expect(page.locator('.scraper-spinner')).toBeVisible()

    // Wait for scraping to complete
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify report is shown
    await expect(page.locator('.scraper-report-container')).toBeVisible()
    await expect(page.locator('text=Scraping Report')).toBeVisible()
    await expect(page.locator('text=https://example.com')).toBeVisible()
  })

  test('should show summary stats in report', async ({ page }) => {
    await mockScreenshotApi(page)
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify summary stats are shown — Screenshots, Images, Videos, Animations, Components
    await expect(page.locator('.scraper-stat-card')).toHaveCount(5)
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Screenshots' })).toBeVisible()
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Images' })).toBeVisible()
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Videos' })).toBeVisible()
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Animations' })).toBeVisible()
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Components' })).toBeVisible()
  })

  test('should display screenshots in report', async ({ page }) => {
    await mockScreenshotApi(page)
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify screenshots section
    await expect(page.locator('h3').filter({ hasText: '📸 Screenshots' })).toBeVisible()
    // Mock returns 4 screenshots
    await expect(page.locator('.scraper-screenshot-card')).toHaveCount(4)

    // Verify screenshot labels from mock data
    await expect(page.locator('.scraper-screenshot-label').filter({ hasText: 'Complete page' })).toBeVisible()
    await expect(page.locator('.scraper-screenshot-label').filter({ hasText: 'Hero section' })).toBeVisible()
  })

  test('should display detected components in report', async ({ page }) => {
    await mockScreenshotApi(page)
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify detected components section
    await expect(page.locator('text=Detected Components')).toBeVisible()
    await expect(page.locator('.scraper-component-card')).not.toHaveCount(0)
    await expect(page.locator('.scraper-component-type')).not.toHaveCount(0)
  })

  test('should display layout analysis in report', async ({ page }) => {
    await mockScreenshotApi(page)
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify layout analysis section
    await expect(page.locator('text=Layout Analysis')).toBeVisible()
    await expect(page.locator('.scraper-layout-item')).not.toHaveCount(0)
  })

  test('should display extracted resources in report', async ({ page }) => {
    await mockScreenshotApi(page)
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify resources section
    await expect(page.locator('text=Extracted Resources')).toBeVisible()

    // Verify colors (mock provides 5)
    await expect(page.locator('.scraper-colors-grid')).toBeVisible()
    await expect(page.locator('.scraper-color-card')).toHaveCount(5)
  })

  test('should show "Use This Report" action button in report', async ({ page }) => {
    await mockScreenshotApi(page)
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')

    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // The "Use This Report" button should be visible
    await expect(page.locator('[data-testid="use-report-btn"]')).toBeVisible()
    await expect(page.locator('[data-testid="use-report-btn"]')).toContainText('Use This Report')
  })

  test('should close report and return to input', async ({ page }) => {
    await mockScreenshotApi(page)
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Close report
    await page.click('[data-testid="close-report-btn"]')
    await page.waitForTimeout(DELAY)

    // Should be back at input form
    await expect(page.locator('.scraper-input-container')).toBeVisible()
    await expect(page.locator('[data-testid="scraper-url-input"]')).toBeVisible()
  })

  test('should show error message when screenshot server is unreachable', async ({ page }) => {
    // Simulate network failure — abort the API request
    await page.route('**/api/screenshot', (route) => route.abort('connectionrefused'))

    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.waitForTimeout(DELAY)
    await page.click('[data-testid="scraper-submit-btn"]')
    await page.waitForTimeout(DELAY)

    // Should show progress while attempting
    await expect(page.locator('.scraper-progress-container')).toBeVisible()

    // Wait for error state to appear
    await page.waitForSelector('[data-testid="scraper-error"]', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Error container should be visible with a meaningful message
    await expect(page.locator('[data-testid="scraper-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="scraper-error-message"]')).toContainText('screenshot server')

    // Input form should NOT be shown while error is displayed
    await expect(page.locator('.scraper-input-container')).not.toBeVisible()
  })

  test('should return to input form after dismissing error', async ({ page }) => {
    await page.route('**/api/screenshot', (route) => route.abort('connectionrefused'))

    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')

    await page.waitForSelector('[data-testid="scraper-error"]', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Click "Try Again" to reset
    await page.click('[data-testid="scraper-retry-btn"]')
    await page.waitForTimeout(DELAY)

    // Should be back at the input form with no error shown
    await expect(page.locator('[data-testid="scraper-url-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="scraper-error"]')).not.toBeVisible()
  })

  test('should show error message when API returns a non-network failure', async ({ page }) => {
    // Simulate a server-side error (e.g. Playwright crash)
    await page.route('**/api/screenshot', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })

    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')

    await page.waitForSelector('[data-testid="scraper-error"]', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    await expect(page.locator('[data-testid="scraper-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="scraper-error-message"]')).toContainText('Screenshot')
  })

  test('should navigate back to editor from scraping page', async ({ page }) => {
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    // Open burger menu
    await page.click('[data-testid="burger-menu-btn"]')
    await page.waitForTimeout(DELAY)

    // Click on Editor menu item
    await page.click('[data-testid="menu-item-editor"]')
    await page.waitForTimeout(DELAY)

    // Verify navigation back to /
    await expect(page).toHaveURL('/')
  })

  test('should show active state in burger menu based on current page', async ({ page }) => {
    // On editor page
    await page.goto('/')
    await page.waitForTimeout(DELAY)
    
    await page.click('[data-testid="burger-menu-btn"]')
    await page.waitForTimeout(DELAY)
    
    const editorMenuItem = page.locator('[data-testid="menu-item-editor"]')
    await expect(editorMenuItem).toHaveClass(/active/)
    
    // Close menu and navigate to scraping
    await page.click('.burger-menu-overlay')
    await page.waitForTimeout(DELAY)
    
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)
    
    await page.click('[data-testid="burger-menu-btn"]')
    await page.waitForTimeout(DELAY)
    
    const scrapingMenuItem = page.locator('[data-testid="menu-item-scraping"]')
    await expect(scrapingMenuItem).toHaveClass(/active/)
  })
})
