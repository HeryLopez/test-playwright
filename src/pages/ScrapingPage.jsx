import { useScraper, ScraperInput, ScraperReport, ScraperProgress } from '../domains/site-scraper'
import { BurgerMenu } from '../shared/components/BurgerMenu'
import './ScrapingPage.css'

function ScrapingPage() {
  const { status, progress, currentReport, scrapeWebsite, clearCurrent, isLoading, error } = useScraper()

  const handleScrape = async (url) => {
    await scrapeWebsite(url)
  }

  return (
    <div className="scraping-page">
      <BurgerMenu />

      <div className="scraping-page-content">
        {isLoading && <ScraperProgress status={status} progress={progress} />}

        {!isLoading && error && (
          <div className="scraping-error" data-testid="scraping-error">
            <div className="scraping-error-icon">⚠️</div>
            <h2 className="scraping-error-title">Scraping failed</h2>
            <p className="scraping-error-message">{error}</p>
            <button
              className="scraping-error-retry"
              onClick={clearCurrent}
              data-testid="scraping-error-retry"
            >
              ← Try again
            </button>
          </div>
        )}

        {!isLoading && !error && !currentReport && (
          <ScraperInput onScrape={handleScrape} isLoading={isLoading} />
        )}

        {!isLoading && !error && currentReport && (
          <ScraperReport report={currentReport} onClose={clearCurrent} />
        )}
      </div>
    </div>
  )
}

export default ScrapingPage
