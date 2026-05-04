/**
 * Service for extracting content from captured HTML.
 * Works with real data returned by the backend screenshot API.
 * The backend (server.mjs) already extracts texts, images, colors, etc.
 * These functions operate on that real data or on the raw HTML string.
 */

/**
 * Detect high-level UI components from the extracted resources.
 * Uses the real data returned by the backend instead of mocked HTML parsing.
 *
 * @param {Object} resources - { texts, images, videos, animations, colors, links }
 * @returns {{ type: string, confidence: number, selector: string, description: string }[]}
 */
export function detectComponents(resources = {}) {
  const detected = []
  const texts = resources.texts ?? []
  const images = resources.images ?? []
  const links = resources.links ?? []
  const videos = resources.videos ?? []

  const hasH1 = texts.some((t) => t.tag === 'h1')
  const hasCTA = texts.some((t) => t.type === 'cta' || t.tag === 'button')
  const hasHeroImage = images.some((img) => img.category === 'hero')
  const hasNavLinks = links.filter((l) => l.type === 'navigation').length >= 2
  const hasLogo = images.some((img) => img.category === 'logo')
  const hasContentImages = images.filter((img) => img.category === 'content').length >= 2
  const hasVideos = videos.length > 0

  // Navbar: navigation links + optional logo
  if (hasNavLinks || hasLogo) {
    detected.push({
      type: 'navbar',
      confidence: hasNavLinks && hasLogo ? 0.97 : 0.80,
      selector: 'nav, header',
      description: `Navigation bar${hasLogo ? ' with logo' : ''}${hasNavLinks ? ` and ${links.filter((l) => l.type === 'navigation').length} nav links` : ''}`,
    })
  }

  // Hero: H1 + CTA or hero image
  if (hasH1 && (hasCTA || hasHeroImage)) {
    detected.push({
      type: 'hero',
      confidence: hasH1 && hasCTA && hasHeroImage ? 0.95 : 0.82,
      selector: 'section:first-of-type, .hero, [class*="hero"]',
      description: `Hero section with${hasH1 ? ' main heading' : ''}${hasHeroImage ? ', background image' : ''}${hasCTA ? ', and CTA button' : ''}`,
    })
  }

  // Features / grid: multiple content images
  if (hasContentImages) {
    detected.push({
      type: 'grid',
      confidence: 0.85,
      selector: 'section, .features, [class*="feature"]',
      description: `Content grid with ${images.filter((img) => img.category === 'content').length} images`,
    })
  }

  // Video section
  if (hasVideos) {
    detected.push({
      type: 'media',
      confidence: 0.90,
      selector: 'video, iframe[src*="youtube"], iframe[src*="vimeo"]',
      description: `Media section with ${videos.length} video${videos.length > 1 ? 's' : ''}`,
    })
  }

  // Social links → footer signal
  const hasSocialLinks = links.some((l) => l.type === 'social')
  if (hasSocialLinks || hasNavLinks) {
    detected.push({
      type: 'footer',
      confidence: hasSocialLinks ? 0.88 : 0.70,
      selector: 'footer, [class*="footer"]',
      description: `Footer${hasSocialLinks ? ' with social media links' : ''}`,
    })
  }

  // Fallback: if nothing detected, mark as generic page
  if (detected.length === 0) {
    detected.push({
      type: 'page',
      confidence: 1.0,
      selector: 'body',
      description: 'Generic page — no specific components detected',
    })
  }

  return detected
}

/**
 * Analyze layout structure from real extracted data.
 *
 * @param {Object} resources - { texts, images, links }
 * @param {Object} structure - DOM structure stats from backend
 * @returns {{ structure: string, sections: number, layout: string, responsive: boolean, grid: string }}
 */
export function analyzeLayout(resources = {}, structure = {}) {
  const texts = resources.texts ?? []
  const images = resources.images ?? []
  const links = resources.links ?? []

  const hasNav = links.some((l) => l.type === 'navigation')
  const hasHero = texts.some((t) => t.tag === 'h1') || images.some((i) => i.category === 'hero')
  const hasContent = images.filter((i) => i.category === 'content').length >= 2
  const hasFooter = links.some((l) => l.type === 'social')

  const sectionNames = [
    hasNav && 'Header',
    hasHero && 'Hero',
    hasContent && 'Content',
    hasFooter && 'Footer',
  ].filter(Boolean)

  const sections = sectionNames.length || Math.max(structure.headers ?? 1, 1)
  const contentImageCount = images.filter((i) => i.category === 'content').length

  return {
    structure: sectionNames.length ? sectionNames.join(' → ') : 'Single page',
    sections,
    layout: 'Single column with full-width sections',
    responsive: true, // assume responsive — backend captures mobile viewport
    grid: contentImageCount >= 3
      ? `${contentImageCount}-column grid in content section`
      : contentImageCount > 0
        ? `${contentImageCount} content image${contentImageCount > 1 ? 's' : ''}`
        : 'No grid detected',
  }
}
