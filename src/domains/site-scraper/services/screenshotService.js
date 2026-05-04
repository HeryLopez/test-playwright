import { SCREENSHOT_TYPE } from '../models/scraperModel'

/**
 * Service for capturing real screenshots using local Playwright backend
 * Backend server must be running on port 3001
 */

const API_URL = 'http://localhost:3001/api'

/**
 * Capture real screenshots using backend Playwright service
 * @param {string} url - URL to capture
 * @returns {Promise<Object>} Object with screenshots, html, metadata, structure
 */
export async function captureScreenshots(url) {
  console.log(`[ScreenshotService] Capturing REAL screenshots for: ${url}`)
  
  try {
    // Call backend API
    const response = await fetch(`${API_URL}/screenshot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error(`Screenshot API failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error('Screenshot capture failed')
    }

    // Map backend response to expected format
    const screenshots = data.screenshots.map((shot) => ({
      type: shot.type,
      path: shot.path,
      width: shot.width,
      height: shot.height,
      section: shot.section,
      url: `http://localhost:3001${shot.url}`, // Full URL for serving
    }))

    console.log(`[ScreenshotService] Successfully captured:`)
    console.log(`  - ${screenshots.length} screenshots`)
    console.log(`  - ${data.images?.length || 0} images`)
    console.log(`  - ${data.videos?.length || 0} videos`)
    console.log(`  - ${data.animations?.gifs?.length || 0} GIFs`)
    console.log(`  - ${data.animations?.cssAnimations?.length || 0} CSS animations`)
    console.log(`  - ${data.texts?.length || 0} texts`)
    console.log(`  - ${data.colors?.length || 0} colors`)
    
    // Return complete capture data
    return {
      screenshots,
      html: data.html ? {
        path: data.html.path,
        url: `http://localhost:3001${data.html.url}`,
      } : null,
      metadata: data.metadata || {},
      structure: data.structure || {},
      images: data.images || [],
      videos: data.videos || [],
      animations: data.animations || { gifs: [], cssAnimations: [], totalAnimated: 0 },
      texts: data.texts || [],
      colors: data.colors || [],
      reportId: data.reportId,
      url: data.url,
      capturedAt: data.capturedAt,
    }
  } catch (error) {
    console.error('[ScreenshotService] Error capturing screenshots:', error)
    
    // Fallback to mock data if backend is not available
    console.warn('[ScreenshotService] Falling back to mock screenshots')
    return {
      screenshots: generateMockScreenshots(url),
      html: null,
      metadata: {},
      structure: {},
      images: [],
      videos: [],
      animations: { gifs: [], cssAnimations: [], totalAnimated: 0 },
      texts: [],
      colors: [],
      reportId: Date.now(),
      url: url,
      capturedAt: new Date().toISOString(),
    }
  }
}

/**
 * Generate mock screenshots as fallback
 */
function generateMockScreenshots(url) {
  const timestamp = Date.now()
  
  return [
    {
      type: SCREENSHOT_TYPE.FULL_PAGE,
      path: `/scraping-reports/${timestamp}/full-page.png`,
      width: 1920,
      height: 3840,
      section: 'Complete page',
      url: generateFallbackImage('Complete page', 1920, 800),
    },
    {
      type: SCREENSHOT_TYPE.HERO,
      path: `/scraping-reports/${timestamp}/hero.png`,
      width: 1920,
      height: 1080,
      section: 'Hero section (viewport)',
      url: generateFallbackImage('Hero section (viewport)', 1920, 600),
    },
    {
      type: SCREENSHOT_TYPE.VIEWPORT,
      path: `/scraping-reports/${timestamp}/desktop.png`,
      width: 1440,
      height: 900,
      section: 'Desktop viewport',
      url: generateFallbackImage('Desktop viewport', 1440, 400),
    },
    {
      type: SCREENSHOT_TYPE.SECTION,
      path: `/scraping-reports/${timestamp}/mobile.png`,
      width: 375,
      height: 812,
      section: 'Mobile viewport',
      url: generateFallbackImage('Mobile viewport', 375, 400),
    },
  ]
}

function generateFallbackImage(section, width, height) {
  const sectionColors = {
    'Complete page': '667eea',
    'Hero section (viewport)': 'ff6b6b',
    'Desktop viewport': '4ecdc4',
    'Mobile viewport': '95e1d3',
  }
  
  const color = sectionColors[section] || '667eea'
  const text = encodeURIComponent(section.toUpperCase())
  
  return `https://placehold.co/${width}x${height}/${color}/ffffff/png?text=${text}`
}

/**
 * Save screenshots to disk (mock)
 * In production, this would save actual image files
 */
export async function saveScreenshots(screenshots, reportPath) {
  console.log(`[ScreenshotService] Saving screenshots to: ${reportPath}`)
  
  await delay(300)
  
  // In production, would write files to disk
  // For now, return paths
  return screenshots.map((s) => s.path)
}
