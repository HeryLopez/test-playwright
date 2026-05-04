import { useState } from 'react'
import { captureScreenshots } from '../services/screenshotService'
import { detectComponents, analyzeLayout } from '../services/contentExtractorService'
import { generateReport, saveReport } from '../services/reportGeneratorService'
import { SCRAPER_STATUS } from '../models/scraperModel'

/**
 * Hook for managing site scraping workflow
 */
export function useScraper() {
  const [status, setStatus] = useState(SCRAPER_STATUS.IDLE)
  const [progress, setProgress] = useState(0)
  const [currentReport, setCurrentReport] = useState(null)
  const [error, setError] = useState(null)
  const [savedReports, setSavedReports] = useState([])

  /**
   * Scrape a website and generate report
   */
  const scrapeWebsite = async (url) => {
    try {
      setStatus(SCRAPER_STATUS.LOADING)
      setProgress(10)
      setError(null)

      // Step 1: Capture screenshots + HTML + images + videos + animations + texts + colors
      setStatus(SCRAPER_STATUS.CAPTURING)
      setProgress(20)
      const captureData = await captureScreenshots(url)
      const { screenshots, html, metadata, structure, images, videos, animations, texts, colors } = captureData
      setProgress(40)

      // Step 2: Build extracted content with REAL data from backend
      setStatus(SCRAPER_STATUS.ANALYZING)
      setProgress(50)
      const extractedContent = {
        images: images || [],
        videos: videos || [],
        animations: animations || { gifs: [], cssAnimations: [], totalAnimated: 0 },
        texts: texts || [],
        colors: colors || [],
        links: [], // Could extract from HTML later if needed
      }
      setProgress(60)

      // Step 3: Detect components
      const detectedComponents = detectComponents('<html>mock</html>')
      setProgress(70)

      // Step 4: Analyze layout
      const layout = analyzeLayout('<html>mock</html>')
      setProgress(80)

      // Step 5: Generate report (now includes HTML and metadata)
      const report = await generateReport(
        url,
        screenshots,
        extractedContent,
        detectedComponents,
        layout,
        html,
        metadata,
        structure
      )
      setProgress(90)

      // Step 6: Save report
      await saveReport(report)
      setProgress(100)

      setCurrentReport(report)
      setStatus(SCRAPER_STATUS.COMPLETE)
      
      // Add to saved reports list
      setSavedReports((prev) => [report, ...prev])

      return report
    } catch (err) {
      console.error('[useScraper] Error:', err)
      setError(err.message || 'Failed to scrape website')
      setStatus(SCRAPER_STATUS.ERROR)
      throw err
    }
  }

  /**
   * Reset scraper state
   */
  const reset = () => {
    setStatus(SCRAPER_STATUS.IDLE)
    setProgress(0)
    setCurrentReport(null)
    setError(null)
  }

  /**
   * Clear current report but keep history
   */
  const clearCurrent = () => {
    setCurrentReport(null)
    setStatus(SCRAPER_STATUS.IDLE)
    setProgress(0)
  }

  return {
    status,
    progress,
    currentReport,
    error,
    savedReports,
    scrapeWebsite,
    reset,
    clearCurrent,
    isLoading: status === SCRAPER_STATUS.LOADING || 
               status === SCRAPER_STATUS.CAPTURING || 
               status === SCRAPER_STATUS.ANALYZING,
  }
}
