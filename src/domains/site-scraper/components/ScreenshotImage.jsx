import { useState } from 'react'

/**
 * Screenshot image with fallback
 * Shows loading state and falls back to placeholder if API fails
 */
function ScreenshotImage({ src, alt, section, width, height }) {
  const [imageStatus, setImageStatus] = useState('loading')
  const [imgSrc, setImgSrc] = useState(src)

  const handleError = () => {
    console.warn(`Failed to load screenshot from: ${src}`)
    // Fallback to placeholder
    const fallbackUrl = generateFallbackImage(section, width, height)
    setImgSrc(fallbackUrl)
    setImageStatus('fallback')
  }

  const handleLoad = () => {
    setImageStatus('loaded')
  }

  return (
    <div className="screenshot-image-container">
      {imageStatus === 'loading' && (
        <div className="screenshot-loading">
          <div className="screenshot-spinner"></div>
          <p>Loading screenshot...</p>
        </div>
      )}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{ display: imageStatus === 'loading' ? 'none' : 'block' }}
      />
      {imageStatus === 'fallback' && (
        <div className="screenshot-fallback-badge">
          ⚠️ Using placeholder (API unavailable)
        </div>
      )}
    </div>
  )
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

export default ScreenshotImage
