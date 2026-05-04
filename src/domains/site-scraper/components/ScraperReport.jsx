import { useState } from 'react'
import './ScraperReport.css'
import ScreenshotImage from './ScreenshotImage'
import './ScreenshotImage.css'

function ScraperReport({ report, onClose }) {
  const [lightboxImage, setLightboxImage] = useState(null)

  if (!report) return null

  const { url, screenshots, resources, components, layout, summary, generatedAt } = report

  const openLightbox = (imageUrl, imageAlt) => {
    setLightboxImage({ url: imageUrl, alt: imageAlt })
  }

  const closeLightbox = () => {
    setLightboxImage(null)
  }

  return (
    <div className="scraper-report-container">
      <div className="scraper-report-header">
        <div>
          <h2>📊 Scraping Report</h2>
          <p className="scraper-report-url">{url}</p>
          <p className="scraper-report-date">
            Generated: {new Date(generatedAt).toLocaleString()}
          </p>
        </div>
        <button className="scraper-report-close" onClick={onClose} data-testid="close-report-btn">
          ✕
        </button>
      </div>

      {/* Summary Stats */}
      <div className="scraper-report-summary">
        <div className="scraper-stat-card">
          <span className="scraper-stat-icon">📸</span>
          <div>
            <div className="scraper-stat-value">{summary.totalScreenshots}</div>
            <div className="scraper-stat-label">Screenshots</div>
          </div>
        </div>
        <div className="scraper-stat-card">
          <span className="scraper-stat-icon">🖼️</span>
          <div>
            <div className="scraper-stat-value">{summary.totalImages}</div>
            <div className="scraper-stat-label">Images</div>
          </div>
        </div>
        <div className="scraper-stat-card">
          <span className="scraper-stat-icon">🎥</span>
          <div>
            <div className="scraper-stat-value">{summary.totalVideos || 0}</div>
            <div className="scraper-stat-label">Videos</div>
          </div>
        </div>
        <div className="scraper-stat-card">
          <span className="scraper-stat-icon">✨</span>
          <div>
            <div className="scraper-stat-value">{(summary.totalGifs || 0) + (summary.totalAnimations || 0)}</div>
            <div className="scraper-stat-label">Animations</div>
          </div>
        </div>
        <div className="scraper-stat-card">
          <span className="scraper-stat-icon">🧩</span>
          <div>
            <div className="scraper-stat-value">{summary.componentsDetected}</div>
            <div className="scraper-stat-label">Components</div>
          </div>
        </div>
      </div>

      {/* Screenshots Section */}
      <section className="scraper-report-section">
        <h3>📸 Screenshots</h3>
        <div className="scraper-screenshots-grid">
          {screenshots.map((screenshot, index) => (
            <div 
              key={index} 
              className="scraper-screenshot-card scraper-clickable-image"
              onClick={() => openLightbox(screenshot.url, screenshot.section)}
              title="Click to view full size"
            >
              <ScreenshotImage
                src={screenshot.url}
                alt={screenshot.section}
                section={screenshot.section}
                width={screenshot.width}
                height={screenshot.height}
              />
              <div className="scraper-screenshot-info">
                <span className="scraper-screenshot-label">{screenshot.section}</span>
                <span className="scraper-screenshot-size">
                  {screenshot.width} × {screenshot.height}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Detected Components Section */}
      <section className="scraper-report-section">
        <h3>🧩 Detected Components</h3>
        <div className="scraper-components-list">
          {components.map((component, index) => (
            <div key={index} className="scraper-component-card">
              <div className="scraper-component-header">
                <span className="scraper-component-type">{component.type}</span>
                <span className="scraper-component-confidence">
                  {Math.round(component.confidence * 100)}% confidence
                </span>
              </div>
              <p className="scraper-component-description">{component.description}</p>
              <code className="scraper-component-selector">{component.selector}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Layout Analysis Section */}
      <section className="scraper-report-section">
        <h3>📐 Layout Analysis</h3>
        <div className="scraper-layout-info">
          <div className="scraper-layout-item">
            <strong>Structure:</strong>
            <span>{layout.structure}</span>
          </div>
          <div className="scraper-layout-item">
            <strong>Sections:</strong>
            <span>{layout.sections}</span>
          </div>
          <div className="scraper-layout-item">
            <strong>Layout:</strong>
            <span>{layout.layout}</span>
          </div>
          <div className="scraper-layout-item">
            <strong>Grid:</strong>
            <span>{layout.grid}</span>
          </div>
          <div className="scraper-layout-item">
            <strong>Responsive:</strong>
            <span>{layout.responsive ? '✅ Yes' : '❌ No'}</span>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="scraper-report-section">
        <h3>🎨 Extracted Resources</h3>
        
        {/* Images */}
        <div className="scraper-resource-group">
          <h4>🖼️ Images ({resources.images.length})</h4>
          <div className="scraper-images-grid">
            {resources.images.map((image) => (
              <div 
                key={image.id} 
                className="scraper-image-card scraper-clickable-image"
                onClick={() => openLightbox(image.url, image.alt)}
                title="Click to view full size"
              >
                <img src={image.url} alt={image.alt} />
                <div className="scraper-image-info">
                  <span className="scraper-image-category">{image.category}</span>
                  <span className="scraper-image-size">
                    {image.width} × {image.height}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Videos */}
        {resources.videos && resources.videos.length > 0 && (
          <div className="scraper-resource-group">
            <h4>🎥 Videos ({resources.videos.length})</h4>
            <div className="scraper-videos-grid">
              {resources.videos.map((video) => (
                <div key={video.id} className="scraper-video-card">
                  <div className="scraper-video-type-badge">{video.type}</div>
                  {video.type === 'youtube' && video.videoId && (
                    <img 
                      src={`https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`}
                      alt="YouTube video thumbnail"
                      className="scraper-video-thumbnail"
                    />
                  )}
                  {video.type === 'html5' && video.poster && (
                    <img 
                      src={video.poster}
                      alt="Video poster"
                      className="scraper-video-thumbnail"
                    />
                  )}
                  {!video.poster && video.type === 'html5' && (
                    <div className="scraper-video-placeholder">
                      🎬 HTML5 Video
                    </div>
                  )}
                  {video.type !== 'youtube' && video.type !== 'html5' && (
                    <div className="scraper-video-placeholder">
                      🎬 {video.type.charAt(0).toUpperCase() + video.type.slice(1)}
                    </div>
                  )}
                  <div className="scraper-video-info">
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="scraper-video-link"
                    >
                      View Video →
                    </a>
                    {video.width > 0 && video.height > 0 && (
                      <span className="scraper-video-size">
                        {video.width} × {video.height}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Animations */}
        {resources.animations && (resources.animations.gifs?.length > 0 || resources.animations.cssAnimations?.length > 0) && (
          <div className="scraper-resource-group">
            <h4>✨ Animations ({(resources.animations.gifs?.length || 0) + (resources.animations.cssAnimations?.length || 0)})</h4>
            
            {/* GIFs */}
            {resources.animations.gifs && resources.animations.gifs.length > 0 && (
              <div className="scraper-animations-subsection">
                <h5>🎞️ Animated GIFs ({resources.animations.gifs.length})</h5>
                <div className="scraper-gifs-grid">
                  {resources.animations.gifs.map((gif) => (
                    <div 
                      key={gif.id} 
                      className="scraper-gif-card scraper-clickable-image"
                      onClick={() => openLightbox(gif.url, gif.alt || 'Animated GIF')}
                      title="Click to view full size"
                    >
                      <img src={gif.url} alt={gif.alt} />
                      <div className="scraper-gif-info">
                        <span className="scraper-gif-badge">GIF</span>
                        {gif.width > 0 && gif.height > 0 && (
                          <span className="scraper-gif-size">
                            {gif.width} × {gif.height}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CSS Animations */}
            {resources.animations.cssAnimations && resources.animations.cssAnimations.length > 0 && (
              <details className="scraper-animations-subsection">
                <summary>
                  <h5>🎨 CSS Animations ({resources.animations.cssAnimations.length} of {resources.animations.totalAnimated})</h5>
                </summary>
                <div className="scraper-css-animations-list">
                  {resources.animations.cssAnimations.map((anim) => (
                    <div key={anim.id} className="scraper-animation-item">
                      <div className="scraper-animation-header">
                        <code className="scraper-animation-tag">&lt;{anim.tagName}&gt;</code>
                        {anim.className && (
                          <code className="scraper-animation-class">.{anim.className.split(' ')[0]}</code>
                        )}
                      </div>
                      {anim.animationName && anim.animationName !== 'none' && (
                        <div className="scraper-animation-detail">
                          <span className="scraper-animation-label">Animation:</span>
                          <code>{anim.animationName}</code>
                          <span className="scraper-animation-duration">({anim.animationDuration})</span>
                        </div>
                      )}
                      {anim.transition && (
                        <div className="scraper-animation-detail">
                          <span className="scraper-animation-label">Transition:</span>
                          <code className="scraper-animation-transition">{anim.transition}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* Colors */}
        <div className="scraper-resource-group">
          <h4>🎨 Color Palette ({resources.colors.length})</h4>
          <div className="scraper-colors-grid">
            {resources.colors.map((color, index) => (
              <div key={index} className="scraper-color-card">
                <div className="scraper-color-swatch" style={{ background: color.hex }} />
                <div className="scraper-color-info">
                  <span className="scraper-color-hex">{color.hex}</span>
                  <span className="scraper-color-usage">{color.usage}</span>
                  <span className="scraper-color-count">Used {color.count}× times</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Texts (collapsed by default) */}
        <details className="scraper-resource-group">
          <summary>
            <h4>📝 Texts ({resources.texts.length})</h4>
          </summary>
          <div className="scraper-texts-list">
            {resources.texts.map((text) => (
              <div key={text.id} className="scraper-text-item">
                <span className="scraper-text-badge">{text.tag}</span>
                <div className="scraper-text-content">
                  <p>{text.content}</p>
                  <small>{text.context}</small>
                </div>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* Page Metadata & HTML Section */}
      {report.metadata && (
        <section className="scraper-report-section">
          <h3>📄 Page Metadata (for AI Analysis)</h3>
          <div className="scraper-metadata-grid">
            <div className="scraper-metadata-item">
              <strong>Title:</strong>
              <span>{report.metadata.title || 'N/A'}</span>
            </div>
            <div className="scraper-metadata-item">
              <strong>Description:</strong>
              <span>{report.metadata.description || 'N/A'}</span>
            </div>
            <div className="scraper-metadata-item">
              <strong>Language:</strong>
              <span>{report.metadata.lang || 'en'}</span>
            </div>
            <div className="scraper-metadata-item">
              <strong>Charset:</strong>
              <span>{report.metadata.charset || 'UTF-8'}</span>
            </div>
          </div>

          {report.structure && (
            <div className="scraper-structure-stats">
              <h4>🏗️ DOM Structure</h4>
              <div className="scraper-stats-grid">
                <div className="scraper-stat-small">
                  <span>Total Elements:</span>
                  <strong>{report.structure.totalElements || 0}</strong>
                </div>
                <div className="scraper-stat-small">
                  <span>Headers:</span>
                  <strong>{report.structure.headers || 0}</strong>
                </div>
                <div className="scraper-stat-small">
                  <span>Images:</span>
                  <strong>{report.structure.images || 0}</strong>
                </div>
                <div className="scraper-stat-small">
                  <span>Links:</span>
                  <strong>{report.structure.links || 0}</strong>
                </div>
                <div className="scraper-stat-small">
                  <span>Buttons:</span>
                  <strong>{report.structure.buttons || 0}</strong>
                </div>
                <div className="scraper-stat-small">
                  <span>Forms:</span>
                  <strong>{report.structure.forms || 0}</strong>
                </div>
              </div>
            </div>
          )}

          {report.html && (
            <div className="scraper-html-download">
              <h4>📁 HTML Source (for AI)</h4>
              <p>Complete HTML source captured for AI analysis and site replication:</p>
              <a 
                href={report.html.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="scraper-html-link"
                data-testid="view-html-btn"
              >
                📄 View HTML Source
              </a>
            </div>
          )}
        </section>
      )}

      {/* Action Buttons */}
      <div className="scraper-report-actions">
        <button className="scraper-action-btn scraper-btn-secondary" onClick={onClose}>
          ← Back to Input
        </button>
        <button className="scraper-action-btn scraper-btn-primary" data-testid="use-report-btn">
          Use This Report →
        </button>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="scraper-lightbox-overlay" onClick={closeLightbox}>
          <button className="scraper-lightbox-close" onClick={closeLightbox} aria-label="Close">
            ✕
          </button>
          <img 
            className="scraper-lightbox-image" 
            src={lightboxImage.url} 
            alt={lightboxImage.alt}
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxImage.alt && (
            <div className="scraper-lightbox-caption">{lightboxImage.alt}</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ScraperReport
