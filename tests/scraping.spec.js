import { test, expect } from '@playwright/test'

const DELAY = 400

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

    // Wait for scraping to complete (mock takes ~3 seconds)
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify report is shown
    await expect(page.locator('.scraper-report-container')).toBeVisible()
    await expect(page.locator('text=Scraping Report')).toBeVisible()
    await expect(page.locator('text=https://example.com')).toBeVisible()
  })

  test('should show summary stats in report', async ({ page }) => {
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify summary stats are shown
    await expect(page.locator('.scraper-stat-card')).toHaveCount(5) // Screenshots, Images, Texts, Colors, Components
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Screenshots' })).toBeVisible()
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Images' })).toBeVisible()
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Texts' })).toBeVisible()
    await expect(page.locator('.scraper-stat-label').filter({ hasText: 'Colors' })).toBeVisible()
  })

  test('should display screenshots in report', async ({ page }) => {
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify screenshots section
    await expect(page.locator('h3').filter({ hasText: '📸 Screenshots' })).toBeVisible()
    await expect(page.locator('.scraper-screenshot-card')).toHaveCount(4) // full-page, hero, features, footer
    
    // Verify screenshot labels
    await expect(page.locator('.scraper-screenshot-label').filter({ hasText: 'Complete page' })).toBeVisible()
    await expect(page.locator('.scraper-screenshot-label').filter({ hasText: 'Hero section' })).toBeVisible()
    await expect(page.locator('.scraper-screenshot-label').filter({ hasText: 'Features section' })).toBeVisible()
    await expect(page.locator('.scraper-screenshot-label').filter({ hasText: 'Footer section' })).toBeVisible()
  })

  test('should display detected components in report', async ({ page }) => {
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify detected components section
    await expect(page.locator('text=Detected Components')).toBeVisible()
    await expect(page.locator('.scraper-component-card')).toHaveCount(4) // navbar, hero, grid, footer
    
    // Verify component types
    await expect(page.locator('.scraper-component-type')).toHaveCount(4)
  })

  test('should display layout analysis in report', async ({ page }) => {
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
    await page.goto('/scraping')
    await page.waitForTimeout(DELAY)

    await page.fill('[data-testid="scraper-url-input"]', 'https://example.com')
    await page.click('[data-testid="scraper-submit-btn"]')
    
    await page.waitForSelector('.scraper-report-container', { timeout: 10000 })
    await page.waitForTimeout(DELAY)

    // Verify resources section
    await expect(page.locator('text=Extracted Resources')).toBeVisible()
    
    // Verify images
    await expect(page.locator('.scraper-images-grid')).toBeVisible()
    await expect(page.locator('.scraper-image-card')).toHaveCount(4)
    
    // Verify colors
    await expect(page.locator('.scraper-colors-grid')).toBeVisible()
    await expect(page.locator('.scraper-color-card')).toHaveCount(5)
  })

  test('should close report and return to input', async ({ page }) => {
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
