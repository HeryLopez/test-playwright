import { useState } from 'react'
import './ScraperInput.css'

function ScraperInput({ onScrape, isLoading }) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) {
      onScrape(url.trim())
    }
  }

  return (
    <div className="scraper-input-container">
      <div className="scraper-input-header">
        <h1>🔍 Site Scraper</h1>
        <p>Analyze any website and generate a detailed report with screenshots</p>
      </div>

      <form className="scraper-input-form" onSubmit={handleSubmit}>
        <div className="scraper-input-group">
          <label htmlFor="url-input">Website URL</label>
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={isLoading}
            data-testid="scraper-url-input"
            required
          />
        </div>

        <button
          type="submit"
          className="scraper-submit-btn"
          disabled={isLoading || !url.trim()}
          data-testid="scraper-submit-btn"
        >
          {isLoading ? '⏳ Analyzing...' : '🚀 Analyze Site'}
        </button>
      </form>

      <div className="scraper-features">
        <div className="scraper-feature">
          <span className="scraper-feature-icon">📸</span>
          <span>Real screenshots with Playwright</span>
        </div>
        <div className="scraper-feature">
          <span className="scraper-feature-icon">🎨</span>
          <span>Extract colors, images, texts</span>
        </div>
        <div className="scraper-feature">
          <span className="scraper-feature-icon">🧩</span>
          <span>Detect components & layout</span>
        </div>
        <div className="scraper-feature">
          <span className="scraper-feature-icon">💾</span>
          <span>Save reports for later use</span>
        </div>
      </div>
    </div>
  )
}

export default ScraperInput
