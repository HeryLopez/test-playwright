/**
 * Service that converts a scraping report into a PreviewPage-compatible components array.
 *
 * Report  →  [ { id, type, props }, ... ]
 *
 * Available block types: text | image | button | carousel | spacer
 */

let _idCounter = 0
function nextId() {
  return `scraped-${Date.now()}-${++_idCounter}`
}

function spacer(height = 32) {
  return { id: nextId(), type: 'spacer', props: { height } }
}

function textBlock(text, fontSize = 16, color = '#1f2937', textAlign = 'left') {
  return { id: nextId(), type: 'text', props: { text, fontSize, color, textAlign } }
}

function imageBlock(src, alt = '', width = 100, borderRadius = 8, align = 'center') {
  return { id: nextId(), type: 'image', props: { src, alt, width, borderRadius, align } }
}

function buttonBlock(label, variant = 'primary', size = 'medium', align = 'center', borderRadius = 6) {
  return { id: nextId(), type: 'button', props: { label, variant, size, align, borderRadius } }
}

/**
 * Infer fontSize from HTML tag name.
 */
function fontSizeFromTag(tag) {
  const map = { h1: 48, h2: 36, h3: 28, h4: 22, h5: 18, h6: 16, p: 16, span: 14, button: 16, a: 16 }
  return map[tag?.toLowerCase()] ?? 16
}

/**
 * Pick the most prominent color from the palette for headings.
 * Falls back to a dark neutral if no palette is available.
 */
function primaryColor(colors = []) {
  if (!colors.length) return '#0f172a'
  // Prefer a color labeled as primary/brand/accent
  const branded = colors.find((c) =>
    /primary|brand|accent|main/i.test(c.name + ' ' + (c.usage || ''))
  )
  return branded?.hex ?? colors[0].hex
}

/**
 * Convert a scraping report to a flat components array for PreviewCanvas.
 *
 * @param {Object} report - The report object produced by generateReport()
 * @returns {{ id: string, type: string, props: object }[]}
 */
export function reportToComponents(report) {
  if (!report) return []

  _idCounter = 0 // reset per conversion so IDs are deterministic in tests

  const components = []
  const { resources = {}, metadata = {}, screenshots = [] } = report
  const texts = resources.texts ?? []
  const images = resources.images ?? []
  const colors = resources.colors ?? []
  const videos = resources.videos ?? []

  const headingColor = primaryColor(colors)
  const bodyColor = '#475569'
  const mutedColor = '#94a3b8'

  // ── 1. Page title from metadata ──────────────────────────────────────────
  if (metadata.title) {
    components.push(spacer(48))
    components.push(textBlock(metadata.title, 48, headingColor, 'center'))
    if (metadata.description) {
      components.push(spacer(16))
      components.push(textBlock(metadata.description, 18, bodyColor, 'center'))
    }
    components.push(spacer(32))
  }

  // ── 2. Headings extracted from the page ──────────────────────────────────
  const headings = texts.filter((t) => /^h[1-6]$/i.test(t.tag))
  const paragraphs = texts.filter((t) => t.tag === 'p')
  const ctas = texts.filter((t) => t.type === 'cta' || t.tag === 'button')

  if (headings.length) {
    headings.forEach((h, i) => {
      const fontSize = fontSizeFromTag(h.tag)
      const color = h.tag === 'h1' ? headingColor : h.tag === 'h2' ? '#1e293b' : '#334155'
      components.push(textBlock(h.content, fontSize, color, 'center'))
      if (i < headings.length - 1) components.push(spacer(12))
    })
    components.push(spacer(24))
  }

  // ── 3. Primary CTA buttons ───────────────────────────────────────────────
  if (ctas.length) {
    const [first, ...rest] = ctas
    components.push(buttonBlock(first.content, 'primary', 'large', 'center', 8))
    rest.slice(0, 2).forEach((cta) => {
      components.push(spacer(8))
      components.push(buttonBlock(cta.content, 'outline', 'medium', 'center', 6))
    })
    components.push(spacer(32))
  }

  // ── 4. Hero / full-page screenshot ───────────────────────────────────────
  const heroShot = screenshots.find(
    (s) => s.type === 'full-page' || s.type === 'hero' || s.type === 'viewport'
  )
  if (heroShot?.url) {
    components.push(imageBlock(heroShot.url, heroShot.section ?? 'Page screenshot', 100, 12, 'center'))
    components.push(spacer(48))
  }

  // ── 5. Extracted images ───────────────────────────────────────────────────
  const contentImages = images.filter((img) => img.category !== 'logo' && img.url)
  if (contentImages.length) {
    // If many images, group them into a carousel
    if (contentImages.length >= 3) {
      const slides = contentImages.slice(0, 8).map((img) => ({
        src: img.url,
        alt: img.alt || '',
      }))
      components.push({
        id: nextId(),
        type: 'carousel',
        props: { slides, height: 400, borderRadius: 10 },
      })
      components.push(spacer(48))
    } else {
      contentImages.forEach((img) => {
        components.push(imageBlock(img.url, img.alt || '', 80, 8, 'center'))
        components.push(spacer(24))
      })
    }
  }

  // ── 6. Videos as image placeholders (poster or thumbnail) ────────────────
  if (videos.length) {
    videos.forEach((video) => {
      const thumb =
        video.poster ||
        (video.type === 'youtube' && video.videoId
          ? `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
          : null)
      if (thumb) {
        components.push(imageBlock(thumb, `Video: ${video.url}`, 80, 8, 'center'))
        components.push(spacer(16))
      }
    })
  }

  // ── 7. Body paragraphs ────────────────────────────────────────────────────
  if (paragraphs.length) {
    components.push(spacer(16))
    paragraphs.slice(0, 6).forEach((p) => {
      components.push(textBlock(p.content, 16, bodyColor, 'left'))
      components.push(spacer(12))
    })
  }

  // ── 8. Color palette as a visual reference row ────────────────────────────
  if (colors.length) {
    components.push(spacer(32))
    components.push(textBlock('Color Palette', 11, headingColor, 'center'))
    components.push(spacer(8))
    colors.slice(0, 6).forEach((c) => {
      components.push(textBlock(`${c.hex}  —  ${c.name}`, 13, c.hex, 'center'))
    })
    components.push(spacer(32))
  }

  // ── 9. Footer note ────────────────────────────────────────────────────────
  components.push(spacer(48))
  components.push(
    textBlock(
      `Scraped from ${report.url} · ${new Date(report.generatedAt).toLocaleDateString()}`,
      12,
      mutedColor,
      'center'
    )
  )
  components.push(spacer(32))

  return components
}
