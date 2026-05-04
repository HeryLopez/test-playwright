import './ScraperProgress.css'

function ScraperProgress({ status, progress }) {
  const statusMessages = {
    loading: '🔄 Initializing...',
    capturing: '📸 Capturing screenshots...',
    analyzing: '🧠 Analyzing content and layout...',
  }

  return (
    <div className="scraper-progress-container">
      <div className="scraper-progress-content">
        <div className="scraper-progress-icon">
          <div className="scraper-spinner"></div>
        </div>
        <h3>{statusMessages[status] || 'Processing...'}</h3>
        <div className="scraper-progress-bar">
          <div
            className="scraper-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="scraper-progress-percent">{progress}%</p>
      </div>
    </div>
  )
}

export default ScraperProgress
