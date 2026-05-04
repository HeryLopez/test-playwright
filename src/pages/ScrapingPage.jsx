import { useScraper, ScraperInput, ScraperReport, ScraperProgress } from '../domains/site-scraper'
import { BurgerMenu } from '../shared/components/BurgerMenu'
import './ScrapingPage.css'

function ScrapingPage() {
  const { status, progress, currentReport, scrapeWebsite, clearCurrent, isLoading } = useScraper()

  const handleScrape = async (url) => {
    try {
      await scrapeWebsite(url)
    } catch (error) {
      console.error('Scraping failed:', error)
    }
  }

  return (
    <div className="scraping-page">
      <BurgerMenu />
      
      <div className="scraping-page-content">
        {isLoading && <ScraperProgress status={status} progress={progress} />}
        
        {!isLoading && !currentReport && (
          <ScraperInput onScrape={handleScrape} isLoading={isLoading} />
        )}
        
        {!isLoading && currentReport && (
          <ScraperReport report={currentReport} onClose={clearCurrent} />
        )}
      </div>
    </div>
  )
}

export default ScrapingPage
