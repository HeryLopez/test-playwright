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

    // Surface a clear error so the UI can show a proper message instead of
    // silently returning fake data that makes it look like scraping worked.
    const isNetworkError =
      error instanceof TypeError ||
      error.message?.includes('fetch') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('NetworkError')

    if (isNetworkError) {
      throw new Error(
        'Cannot connect to the screenshot server. Make sure it is running with: node server.mjs'
      )
    }

    throw new Error(`Screenshot capture failed: ${error.message}`)
  }
}

/**
 * Save screenshots to disk (handled by the backend server)
 */
export async function saveScreenshots(screenshots, reportPath) {
  console.log(`[ScreenshotService] Screenshots saved by backend to: ${reportPath}`)
  return screenshots.map((s) => s.path)
}
