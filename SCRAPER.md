# Site Scraper - Technical Documentation

## Overview

The **Site Scraper** is a standalone application within the project that analyzes websites and generates detailed reports with screenshots, extracted resources, detected components, and layout analysis.

This is **Step 1** of the migration workflow: capture and analyze the old site before attempting to replicate it with available blocks.

---

## Architecture (DDD)

```
src/domains/site-scraper/
├── models/
│   └── scraperModel.js         # Enums and defaults
├── services/
│   ├── screenshotService.js    # Playwright screenshot capture (mock)
│   ├── contentExtractorService.js   # Extract resources from HTML
│   └── reportGeneratorService.js    # Generate and save reports
├── hooks/
│   └── useScraper.js           # Main orchestration hook
├── components/
│   ├── ScraperInput.jsx        # URL input form
│   ├── ScraperProgress.jsx     # Loading indicator
│   └── ScraperReport.jsx       # Report display
└── index.js                    # Public API
```

---

## Features

### 1. Screenshot Capture
- **Full page** screenshot
- **Section-specific** screenshots (hero, features, footer)
- Uses **Playwright** (currently mocked with placeholder images)
- Saved to `/scraping-reports/{timestamp}/`

### 2. Resource Extraction
Extracts and categorizes:
- **Images** (hero, logo, content, icons) with dimensions
- **Texts** (headings H1-H6, paragraphs, CTAs) with context
- **Colors** (palette with hex codes and usage)
- **Links** (navigation, CTAs, social, external)

### 3. Component Detection
AI-powered detection of:
- Navbar
- Hero sections
- Feature grids
- Carousels
- Footers
- CTAs

### 4. Layout Analysis
- Structure mapping
- Responsive design detection
- Grid layout analysis
- Section count

---

## User Flow

```
1. Click burger menu → "🔍 Site Scraper"
2. Enter URL → "https://example.com"
3. Click "🚀 Analyze Site"
4. Progress indicator shows:
   ├─ 📸 Capturing screenshots... (20-40%)
   ├─ 🧠 Analyzing content... (50-80%)
   └─ ✅ Complete (100%)
5. Report displayed with:
   ├─ Summary stats (5 cards)
   ├─ Screenshots (4 images)
   ├─ Detected components (4 cards)
   ├─ Layout analysis
   └─ Extracted resources (images, colors, texts)
6. Actions:
   ├─ "← Back to Input" → Start new analysis
   └─ "Use This Report →" → Future: Step 2 migration
```

---

## Navigation (Burger Menu)

Location: Fixed top-left corner on all pages

Menu items:
- 🏠 **Editor** → `/` (main block editor)
- 🔍 **Site Scraper** → `/scraping` (scraping app)

Features:
- Purple gradient button
- Slide-in navigation panel
- Active state highlighting
- Overlay click to close

---

## API Reference

### Hook: `useScraper()`

```javascript
const {
  status,          // SCRAPER_STATUS enum
  progress,        // 0-100 percentage
  currentReport,   // Report object or null
  error,           // Error message or null
  savedReports,    // Array of historical reports
  scrapeWebsite,   // (url) => Promise<report>
  reset,           // () => void - Clear all state
  clearCurrent,    // () => void - Clear current report
  isLoading        // boolean
} = useScraper()
```

### Report Object Structure

```javascript
{
  id: "report-1714147200000",
  url: "https://example.com",
  timestamp: 1714147200000,
  generatedAt: "2026-04-27T10:00:00.000Z",
  screenshots: [
    {
      type: "full-page",
      path: "/scraping-reports/.../full-page.png",
      width: 1920,
      height: 3840,
      section: "Complete page",
      url: "https://..."  // Placeholder URL
    },
    // ... more screenshots
  ],
  resources: {
    images: [{ id, url, alt, category, width, height }],
    texts: [{ id, content, type, tag, context }],
    colors: [{ hex, name, usage }],
    links: [{ url, text, type }]
  },
  components: [
    {
      type: "navbar",
      confidence: 0.95,
      selector: "nav.main-nav",
      description: "Sticky navigation bar..."
    },
    // ... more components
  ],
  layout: {
    structure: "Header → Hero → Features → Footer",
    sections: 4,
    layout: "Single column",
    responsive: true,
    grid: "3 columns in features"
  },
  summary: {
    totalScreenshots: 4,
    totalImages: 4,
    totalTexts: 8,
    totalColors: 5,
    totalLinks: 7,
    componentsDetected: 4
  },
  reportPath: "/scraping-reports/report-..."
}
```

---

## Mock vs Production

### Current Implementation (Mock)

```javascript
// screenshotService.js
export async function captureScreenshots(url) {
  // Returns placeholder images from via.placeholder.com
  // Simulates delays to mimic Playwright
  await delay(800)
  return mockScreenshots
}
```

### Production Implementation

To integrate real Playwright screenshots:

1. **Create backend API** (Node.js/Express):
```javascript
// server.js
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body
  
  const browser = await playwright.chromium.launch()
  const page = await browser.newPage()
  await page.goto(url)
  
  // Capture full page
  const timestamp = Date.now()
  const reportDir = `public/scraping-reports/${timestamp}`
  fs.mkdirSync(reportDir, { recursive: true })
  
  await page.screenshot({ 
    path: `${reportDir}/full-page.png`,
    fullPage: true 
  })
  
  // Capture hero section
  const hero = await page.locator('section:first-of-type')
  await hero.screenshot({ path: `${reportDir}/hero.png` })
  
  // ... more sections
  
  await browser.close()
  
  res.json({ screenshots, resources, components })
})
```

2. **Update frontend service**:
```javascript
// screenshotService.js
export async function captureScreenshots(url) {
  const response = await fetch('/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
  
  const data = await response.json()
  return data.screenshots
}
```

---

## Testing

### E2E Tests

File: `tests/scraping.spec.js`  
Tests: 11 total

```bash
# Run all scraping tests
npx playwright test tests/scraping.spec.js

# Run with UI
npx playwright test tests/scraping.spec.js --headed

# Run specific test
npx playwright test tests/scraping.spec.js --grep "should complete full"
```

Test coverage:
- ✅ Navigation via burger menu
- ✅ Input form display
- ✅ Full scraping flow (input → progress → report)
- ✅ Summary stats rendering
- ✅ Screenshots display
- ✅ Detected components display
- ✅ Layout analysis display
- ✅ Extracted resources display
- ✅ Close report and return to input
- ✅ Navigate back to editor
- ✅ Active state in burger menu

---

## File Structure

### New Files Created

```
src/
  domains/
    site-scraper/
      models/scraperModel.js              ✨ 40 lines
      services/
        screenshotService.js              ✨ 90 lines
        contentExtractorService.js        ✨ 150 lines
        reportGeneratorService.js         ✨ 60 lines
      hooks/useScraper.js                 ✨ 90 lines
      components/
        ScraperInput.jsx                  ✨ 50 lines
        ScraperInput.css                  ✨ 120 lines
        ScraperProgress.jsx               ✨ 30 lines
        ScraperProgress.css               ✨ 60 lines
        ScraperReport.jsx                 ✨ 200 lines
        ScraperReport.css                 ✨ 470 lines
      index.js                            ✨ 5 lines
  pages/
    ScrapingPage.jsx                      ✨ 30 lines
    ScrapingPage.css                      ✨ 15 lines
  shared/
    components/
      BurgerMenu/
        BurgerMenu.jsx                    ✨ 50 lines
        BurgerMenu.css                    ✨ 150 lines
        index.js                          ✨ 1 line

tests/
  scraping.spec.js                        ✨ 220 lines
```

### Modified Files

```
src/
  App.jsx                     # Added /scraping route
  pages/EditorPage.jsx        # Added <BurgerMenu />
  shared/components/index.js  # Exported BurgerMenu
```

---

## Next Steps (Step 2: Replicate)

The scraping report is designed to be used in **Step 2** where the AI will:

1. Analyze screenshots to understand layout
2. Map detected components → available blocks
3. Use extracted resources (images, texts, colors)
4. Generate code for missing blocks
5. Replicate the original site's design

This will be a separate feature built on top of the scraping foundation.

---

## Troubleshooting

### Issue: Screenshots not loading
- **Mock**: Check placeholder URLs are accessible
- **Production**: Verify backend API is running and `public/scraping-reports/` directory exists

### Issue: Report not showing
- Check browser console for errors
- Verify `currentReport` state in React DevTools
- Ensure `SCRAPER_STATUS.COMPLETE` is reached

### Issue: Navigation not working
- Verify React Router is configured correctly
- Check burger menu button is clickable (z-index issues)
- Confirm routes are defined in `App.jsx`

---

## Design System

Colors:
- Primary: `#667eea` (Purple)
- Secondary: `#764ba2` (Dark Purple)
- Success: `#10b981` (Green)
- Gray: `#6b7280`

Layout:
- Max width: `1200px` (report), `800px` (input)
- Spacing: `1rem` base unit
- Border radius: `8px` (cards), `12px` (sections)

Typography:
- Headings: System font
- Body: `1rem` / `16px`
- Code: Monospace

Icons:
- Emoji-based for consistency
- 1.5rem-2rem size for clarity

---

## Performance Considerations

### Mock Implementation
- Artificial delays to simulate real operations
- Placeholder images loaded from CDN
- No actual file I/O

### Production Implementation
- Screenshot capture: ~2-5 seconds per page
- HTML parsing: ~0.5-1 seconds
- File writes: ~0.2-0.5 seconds
- **Total**: ~3-7 seconds per site

Optimizations:
- Parallel screenshot capture
- Lazy loading of report sections
- Image compression (PNG → WebP)
- Caching of repeated scrapes

---

## Security

### Current (Mock)
- No external requests
- No file system access
- No user data storage

### Production Considerations
- Validate URLs before scraping
- Rate limiting (max 5 scrapes/minute)
- Sanitize HTML to prevent XSS
- Store reports in user-specific folders
- Add authentication for saved reports
- Implement CORS for backend API

---

## License & Credits

Part of the Home Editor project.  
Uses Playwright for screenshot capture.  
Mock implementation uses via.placeholder.com for demo images.
