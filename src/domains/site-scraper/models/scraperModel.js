// Scraper status enum
export const SCRAPER_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  CAPTURING: 'capturing',
  ANALYZING: 'analyzing',
  COMPLETE: 'complete',
  ERROR: 'error',
}

// Screenshot types
export const SCREENSHOT_TYPE = {
  FULL_PAGE: 'full-page',
  VIEWPORT: 'viewport',
  HERO: 'hero',
  FEATURES: 'features',
  FOOTER: 'footer',
  SECTION: 'section',
}

// Component detection types
export const DETECTED_COMPONENT = {
  NAVBAR: 'navbar',
  HERO: 'hero',
  FEATURES: 'features',
  GRID: 'grid',
  CAROUSEL: 'carousel',
  FOOTER: 'footer',
  CTA: 'cta',
  TESTIMONIALS: 'testimonials',
  PRICING: 'pricing',
  FORM: 'form',
}

// Default scraper result structure
export const scraperResultDefaults = {
  url: '',
  timestamp: null,
  screenshots: [],
  extractedResources: {
    images: [],
    texts: [],
    colors: [],
    links: [],
  },
  detectedComponents: [],
  htmlStructure: '',
  cssStyles: '',
  reportPath: '',
}
