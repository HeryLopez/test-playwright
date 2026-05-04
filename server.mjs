/**
 * Simple Express server for capturing real screenshots with Playwright
 * Run this server alongside the Vite dev server
 */

import express from 'express'
import cors from 'cors'
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

// Enable CORS for Vite dev server
app.use(cors())
app.use(express.json())

// Serve static screenshots
app.use('/screenshots', express.static(path.join(__dirname, 'public/scraping-reports')))

/**
 * POST /api/screenshot
 * Captures real screenshots of a website
 */
app.post('/api/screenshot', async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'URL is required' })
  }

  console.log(`[Screenshot API] Capturing screenshots for: ${url}`)

  try {
    // Launch browser
    const browser = await chromium.launch({
      headless: true,
    })

    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      permissions: [], // Deny all permissions (notifications, geolocation, etc.)
    })

    const page = await context.newPage()

    // Navigate to URL (use 'load' instead of 'networkidle' for better compatibility)
    await page.goto(url, {
      waitUntil: 'load',
      timeout: 60000, // 60 seconds for heavy sites
    })

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000) // Wait for popups to appear

    // Auto-fill date inputs (for age verification)
    console.log('[Screenshot API] Auto-filling date inputs...')
    await page.evaluate(() => {
      // Fill date of birth inputs with adult age (25 years old)
      const today = new Date()
      const adultDate = new Date(today.getFullYear() - 25, 0, 1) // Jan 1, 25 years ago
      
      const dateInputs = document.querySelectorAll('input[type="date"], input[name*="birth" i], input[id*="birth" i], input[placeholder*="date" i]')
      dateInputs.forEach(input => {
        if (input.type === 'date') {
          input.value = adultDate.toISOString().split('T')[0]
        } else {
          input.value = '01/01/' + (today.getFullYear() - 25)
        }
        input.dispatchEvent(new Event('change', { bubbles: true }))
        input.dispatchEvent(new Event('input', { bubbles: true }))
      })

      // Fill separate day/month/year inputs
      const dayInputs = document.querySelectorAll('input[name*="day" i], select[name*="day" i]')
      const monthInputs = document.querySelectorAll('input[name*="month" i], select[name*="month" i]')
      const yearInputs = document.querySelectorAll('input[name*="year" i], select[name*="year" i]')
      
      dayInputs.forEach(el => {
        if (el.tagName === 'SELECT') el.value = '1'
        else el.value = '01'
        el.dispatchEvent(new Event('change', { bubbles: true }))
      })
      monthInputs.forEach(el => {
        if (el.tagName === 'SELECT') el.value = '1'
        else el.value = '01'
        el.dispatchEvent(new Event('change', { bubbles: true }))
      })
      yearInputs.forEach(el => {
        if (el.tagName === 'SELECT') el.value = (new Date().getFullYear() - 25).toString()
        else el.value = (new Date().getFullYear() - 25).toString()
        el.dispatchEvent(new Event('change', { bubbles: true }))
      })
    })

    await page.waitForTimeout(500)

    // Close common popups/overlays/cookie banners automatically
    console.log('[Screenshot API] Closing popups and overlays...')
    await page.evaluate(() => {
      let closed = false
      
      // Strategy 1: Click accept/decline buttons in cookies/age verification
      const cookieButtons = [
        'button:has-text("Accept")',
        'button:has-text("Accepter")',
        'button:has-text("Aceptar")',
        'button:has-text("Accept all")',
        'button:has-text("I agree")',
        'button:has-text("Agree")',
        'button:has-text("OK")',
        'button:has-text("Continue")',
        'button:has-text("Continuer")',
        'button:has-text("Confirmar")',
        'button:has-text("Enter")',
        '[class*="cookie" i][class*="accept" i]',
        '[class*="cookie" i][class*="agree" i]',
        '[id*="cookie" i][id*="accept" i]',
        '[data-testid*="cookie-accept" i]',
        '[aria-label*="accept" i]',
      ]

      // Try to find and click cookie/age verification buttons by text content
      const buttons = Array.from(document.querySelectorAll('button, a[role="button"]'))
      buttons.forEach(btn => {
        const text = btn.textContent.toLowerCase().trim()
        if (text.includes('accept') || text.includes('accepter') || text.includes('aceptar') ||
            text.includes('agree') || text.includes('continue') || text.includes('continuer') ||
            text.includes('enter') || text.includes('confirm') || text.includes('ok')) {
          if (btn.offsetParent !== null) {
            console.log('[Screenshot API] Clicking button:', text)
            btn.click()
            closed = true
          }
        }
      })
      
      // Strategy 2: Common selectors for close buttons
      const selectors = [
        '[aria-label*="close" i]',
        '[aria-label*="cerrar" i]',
        '[class*="close" i]',
        '[class*="dismiss" i]',
        '[id*="close" i]',
        'button[class*="cookie" i]',
        'button[class*="accept" i]',
        'button[class*="decline" i]',
        'button[class*="reject" i]',
        '[data-testid*="close" i]',
        '[data-testid*="dismiss" i]',
        '.modal-close',
        '.overlay-close',
        '.popup-close',
      ]
      
      selectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector)
          elements.forEach(el => {
            if (el.offsetParent !== null) {
              el.click()
              closed = true
            }
          })
        } catch (e) {
          // Ignore errors, continue with next selector
        }
      })
      
      // Strategy 3: Remove fullscreen overlays/modals by hiding them
      const overlays = document.querySelectorAll('[class*="overlay" i], [class*="modal" i], [class*="popup" i], [class*="cookie" i]')
      overlays.forEach(overlay => {
        const style = window.getComputedStyle(overlay)
        if (overlay.offsetParent !== null && 
            (style.position === 'fixed' || style.position === 'absolute') &&
            (style.zIndex > 100 || overlay.className.toLowerCase().includes('overlay'))) {
          overlay.style.display = 'none'
          closed = true
        }
      })

      return closed
    })

    // Wait a bit more after closing popups
    await page.waitForTimeout(2000)

    // Create report directory
    const timestamp = Date.now()
    const reportDir = path.join(__dirname, 'public/scraping-reports', `${timestamp}`)
    fs.mkdirSync(reportDir, { recursive: true })

    const screenshots = []

    // 1. Full page screenshot
    console.log('[Screenshot API] Capturing full page...')
    const fullPagePath = `${timestamp}/full-page.png`
    await page.screenshot({
      path: path.join(__dirname, 'public/scraping-reports', fullPagePath),
      fullPage: true,
    })
    screenshots.push({
      type: 'full-page',
      section: 'Complete page',
      width: 1920,
      height: await page.evaluate(() => document.body.scrollHeight),
      url: `/screenshots/${fullPagePath}`,
      path: fullPagePath,
    })

    // 2. Viewport screenshot (Hero/Above the fold)
    console.log('[Screenshot API] Capturing viewport...')
    await page.evaluate(() => window.scrollTo(0, 0)) // Reset scroll without reloading
    const viewportPath = `${timestamp}/viewport.png`
    await page.screenshot({
      path: path.join(__dirname, 'public/scraping-reports', viewportPath),
      fullPage: false,
    })
    screenshots.push({
      type: 'viewport',
      section: 'Hero section (viewport)',
      width: 1920,
      height: 1080,
      url: `/screenshots/${viewportPath}`,
      path: viewportPath,
    })

    // 3. Desktop viewport (smaller)
    console.log('[Screenshot API] Capturing desktop view...')
    await page.setViewportSize({ width: 1440, height: 900 })
    const desktopPath = `${timestamp}/desktop.png`
    await page.screenshot({
      path: path.join(__dirname, 'public/scraping-reports', desktopPath),
      fullPage: false,
    })
    screenshots.push({
      type: 'desktop',
      section: 'Desktop viewport',
      width: 1440,
      height: 900,
      url: `/screenshots/${desktopPath}`,
      path: desktopPath,
    })

    // 4. Mobile viewport
    console.log('[Screenshot API] Capturing mobile view...')
    await page.setViewportSize({ width: 375, height: 812 })
    const mobilePath = `${timestamp}/mobile.png`
    await page.screenshot({
      path: path.join(__dirname, 'public/scraping-reports', mobilePath),
      fullPage: false,
    })
    screenshots.push({
      type: 'mobile',
      section: 'Mobile viewport',
      width: 375,
      height: 812,
      url: `/screenshots/${mobilePath}`,
      path: mobilePath,
    })

    // 5. Capture HTML for AI analysis
    console.log('[Screenshot API] Capturing HTML content...')
    const htmlContent = await page.content()
    const htmlPath = `${timestamp}/index.html`
    fs.writeFileSync(
      path.join(__dirname, 'public/scraping-reports', htmlPath),
      htmlContent,
      'utf-8'
    )

    // 6. Extract metadata for better AI understanding
    console.log('[Screenshot API] Extracting metadata...')
    const metadata = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        lang: document.documentElement.lang || 'en',
        charset: document.characterSet,
        viewport: document.querySelector('meta[name="viewport"]')?.content || '',
        ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
        ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
        ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
      }
    })

    // 7. Extract document structure for AI analysis
    console.log('[Screenshot API] Analyzing DOM structure...')
    const structure = await page.evaluate(() => {
      const getElementStats = (selector) => {
        const elements = document.querySelectorAll(selector)
        return elements.length
      }

      return {
        totalElements: document.querySelectorAll('*').length,
        headers: getElementStats('h1, h2, h3, h4, h5, h6'),
        images: getElementStats('img'),
        links: getElementStats('a'),
        buttons: getElementStats('button'),
        forms: getElementStats('form'),
        inputs: getElementStats('input, textarea, select'),
        sections: getElementStats('section, article, aside, nav'),
        divs: getElementStats('div'),
        scripts: getElementStats('script'),
        styles: getElementStats('style, link[rel="stylesheet"]'),
      }
    })

    // 8. Extract images from the page
    console.log('[Screenshot API] Extracting images...')
    const images = await page.evaluate(() => {
      const imageElements = document.querySelectorAll('img')
      const extractedImages = []
      const seenUrls = new Set()

      imageElements.forEach((img, index) => {
        // Get absolute URL
        const src = img.src || img.dataset.src || img.getAttribute('data-lazy-src')
        if (!src || seenUrls.has(src)) return
        
        // Filter out tracking pixels and tiny images
        if (img.width < 50 && img.height < 50) return
        if (src.includes('tracking') || src.includes('pixel') || src.includes('analytics')) return
        
        seenUrls.add(src)
        
        // Categorize image
        let category = 'content'
        const alt = img.alt?.toLowerCase() || ''
        const classes = img.className?.toLowerCase() || ''
        
        if (alt.includes('logo') || classes.includes('logo')) {
          category = 'logo'
        } else if (alt.includes('hero') || classes.includes('hero') || classes.includes('banner')) {
          category = 'hero'
        } else if (alt.includes('icon') || classes.includes('icon')) {
          category = 'icon'
        }
        
        extractedImages.push({
          id: `img-${index}`,
          url: src,
          alt: img.alt || '',
          category: category,
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0,
        })
      })

      return extractedImages
    })

    // 9. Extract videos and animations
    console.log('[Screenshot API] Extracting videos and animations...')
    const { videos, animations } = await page.evaluate(() => {
      // Extract videos
      const extractedVideos = []
      const seenVideoUrls = new Set()

      // HTML5 video tags
      document.querySelectorAll('video').forEach((video, index) => {
        const sources = Array.from(video.querySelectorAll('source'))
        const src = video.src || sources[0]?.src || video.dataset.src
        
        if (src && !seenVideoUrls.has(src)) {
          seenVideoUrls.add(src)
          extractedVideos.push({
            id: `video-${index}`,
            url: src,
            type: 'html5',
            width: video.videoWidth || video.width || 0,
            height: video.videoHeight || video.height || 0,
            poster: video.poster || '',
            autoplay: video.autoplay,
            loop: video.loop,
          })
        }
      })

      // YouTube, Vimeo, and other video iframes
      document.querySelectorAll('iframe').forEach((iframe, index) => {
        const src = iframe.src || iframe.dataset.src || ''
        if (!src) return

        let videoType = null
        let videoId = null

        if (src.includes('youtube.com') || src.includes('youtu.be')) {
          videoType = 'youtube'
          const match = src.match(/(?:embed\/|watch\?v=|youtu\.be\/)([^&?]+)/)
          videoId = match ? match[1] : null
        } else if (src.includes('vimeo.com')) {
          videoType = 'vimeo'
          const match = src.match(/vimeo\.com\/(?:video\/)?(\d+)/)
          videoId = match ? match[1] : null
        } else if (src.includes('dailymotion.com')) {
          videoType = 'dailymotion'
        } else if (src.includes('wistia.com')) {
          videoType = 'wistia'
        } else if (src.includes('loom.com')) {
          videoType = 'loom'
        }

        if (videoType && !seenVideoUrls.has(src)) {
          seenVideoUrls.add(src)
          extractedVideos.push({
            id: `iframe-video-${index}`,
            url: src,
            type: videoType,
            videoId: videoId,
            width: iframe.width || 0,
            height: iframe.height || 0,
          })
        }
      })

      // Detect animated GIFs (check images for .gif extension)
      const gifs = Array.from(document.querySelectorAll('img')).filter(img => {
        const src = img.src || img.dataset.src || ''
        return src.toLowerCase().includes('.gif')
      }).map((gif, index) => ({
        id: `gif-${index}`,
        url: gif.src,
        alt: gif.alt || '',
        width: gif.naturalWidth || gif.width || 0,
        height: gif.naturalHeight || gif.height || 0,
      }))

      // Detect CSS animations
      const animatedElements = []
      const allElements = document.querySelectorAll('*')
      
      allElements.forEach((el, index) => {
        const computedStyle = window.getComputedStyle(el)
        const animation = computedStyle.animation || computedStyle.webkitAnimation
        const transition = computedStyle.transition
        
        if ((animation && animation !== 'none') || (transition && transition !== 'all 0s ease 0s')) {
          const rect = el.getBoundingClientRect()
          
          // Only include visible elements with significant size
          if (rect.width > 20 && rect.height > 20) {
            animatedElements.push({
              id: `anim-${index}`,
              tagName: el.tagName.toLowerCase(),
              className: el.className || '',
              animation: animation !== 'none' ? animation : null,
              transition: transition !== 'all 0s ease 0s' ? transition : null,
              animationName: computedStyle.animationName,
              animationDuration: computedStyle.animationDuration,
            })
          }
        }
      })

      // Limit to first 20 animated elements to avoid bloat
      const limitedAnimations = animatedElements.slice(0, 20)

      return {
        videos: extractedVideos,
        animations: {
          gifs: gifs,
          cssAnimations: limitedAnimations,
          totalAnimated: animatedElements.length,
        },
      }
    })

    // 10. Extract texts from HTML
    console.log('[Screenshot API] Extracting texts...')
    const texts = await page.evaluate(() => {
      const extractedTexts = []
      let textId = 0

      // Helper: Check if element is visible
      const isVisible = (el) => {
        const style = window.getComputedStyle(el)
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0'
      }

      // Helper: Get context (parent info)
      const getContext = (el) => {
        const parent = el.parentElement
        if (!parent) return ''
        
        const parentTag = parent.tagName.toLowerCase()
        const parentClass = parent.className ? `.${parent.className.split(' ')[0]}` : ''
        return `${parentTag}${parentClass}`
      }

      // Extract headings (H1-H6)
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
        if (!isVisible(heading)) return
        
        const text = heading.textContent.trim()
        if (text.length > 0 && text.length < 200) {
          extractedTexts.push({
            id: `text-${textId++}`,
            content: text,
            type: 'heading',
            tag: heading.tagName.toLowerCase(),
            context: getContext(heading),
          })
        }
      })

      // Extract paragraphs
      document.querySelectorAll('p').forEach(p => {
        if (!isVisible(p)) return
        
        const text = p.textContent.trim()
        if (text.length > 0 && text.length < 500) {
          extractedTexts.push({
            id: `text-${textId++}`,
            content: text,
            type: 'paragraph',
            tag: 'p',
            context: getContext(p),
          })
        }
      })

      // Extract buttons
      document.querySelectorAll('button, [role="button"]').forEach(btn => {
        if (!isVisible(btn)) return
        
        const text = btn.textContent.trim()
        if (text.length > 0 && text.length < 100) {
          extractedTexts.push({
            id: `text-${textId++}`,
            content: text,
            type: 'button',
            tag: 'button',
            context: getContext(btn),
          })
        }
      })

      // Extract links
      document.querySelectorAll('a').forEach(link => {
        if (!isVisible(link)) return
        
        const text = link.textContent.trim()
        if (text.length > 0 && text.length < 100) {
          extractedTexts.push({
            id: `text-${textId++}`,
            content: text,
            type: 'link',
            tag: 'a',
            context: getContext(link),
            href: link.href || '',
          })
        }
      })

      // Extract labels
      document.querySelectorAll('label').forEach(label => {
        if (!isVisible(label)) return
        
        const text = label.textContent.trim()
        if (text.length > 0 && text.length < 100) {
          extractedTexts.push({
            id: `text-${textId++}`,
            content: text,
            type: 'label',
            tag: 'label',
            context: getContext(label),
          })
        }
      })

      // Extract navigation items
      document.querySelectorAll('nav a, [role="navigation"] a').forEach(navLink => {
        if (!isVisible(navLink)) return
        
        const text = navLink.textContent.trim()
        if (text.length > 0 && text.length < 50) {
          extractedTexts.push({
            id: `text-${textId++}`,
            content: text,
            type: 'navigation',
            tag: 'a',
            context: 'nav',
          })
        }
      })

      // Remove duplicates
      const seenTexts = new Set()
      return extractedTexts.filter(item => {
        const key = `${item.content}-${item.type}`
        if (seenTexts.has(key)) return false
        seenTexts.add(key)
        return true
      }).slice(0, 100) // Limit to first 100 unique texts
    })

    // 11. Extract colors from computed styles
    console.log('[Screenshot API] Extracting color palette...')
    const colors = await page.evaluate(() => {
      const colorMap = new Map()

      // Helper: RGB to HEX
      const rgbToHex = (rgb) => {
        const match = rgb.match(/\d+/g)
        if (!match || match.length < 3) return null
        
        const [r, g, b] = match.map(Number)
        return '#' + [r, g, b].map(x => {
          const hex = x.toString(16)
          return hex.length === 1 ? '0' + hex : hex
        }).join('')
      }

      // Helper: Is valid color
      const isValidColor = (color, property) => {
        if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return false
        if (color.includes('rgba') && color.includes(', 0)')) return false
        
        // Skip common border colors
        if (property.includes('border') && (color === 'rgb(0, 0, 0)' || color === 'rgb(255, 255, 255)')) {
          return false
        }
        
        return true
      }

      // Analyze visible elements
      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el)
        
        if (style.display === 'none' || style.visibility === 'hidden') return
        
        // Collect color properties
        const properties = {
          'color': style.color,
          'background-color': style.backgroundColor,
          'border-color': style.borderColor,
          'fill': style.fill,
          'stroke': style.stroke,
        }

        Object.entries(properties).forEach(([prop, value]) => {
          if (isValidColor(value, prop)) {
            const hex = rgbToHex(value)
            if (hex) {
              const existing = colorMap.get(hex)
              if (existing) {
                existing.count++
                if (!existing.usage.includes(prop)) {
                  existing.usage.push(prop)
                }
              } else {
                colorMap.set(hex, {
                  hex: hex,
                  count: 1,
                  usage: [prop],
                  rgb: value,
                })
              }
            }
          }
        })
      })

      // Sort by usage count
      return Array.from(colorMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 20)
        .map((color, index) => ({
          id: `color-${index}`,
          hex: color.hex,
          rgb: color.rgb,
          count: color.count,
          usage: color.usage.join(', '),
        }))
    })

    console.log(`[Screenshot API] Successfully captured:`)
    console.log(`  - ${screenshots.length} screenshots`)
    console.log(`  - ${images.length} images`)
    console.log(`  - ${videos.length} videos`)
    console.log(`  - ${animations.gifs.length} GIFs`)
    console.log(`  - ${animations.cssAnimations.length} CSS animations`)
    console.log(`  - ${texts.length} text elements`)
    console.log(`  - ${colors.length} colors`)

    // ── Section extraction ─────────────────────────────────────────────────
    // Walk the DOM and group content into logical sections so the agent can
    // replicate the original layout instead of inventing one.
    console.log('[Screenshot API] Extracting sections...')
    const sections = await page.evaluate(() => {
      const COOKIE_RE = /awsccc|cookie|gdpr|consent|privacy-banner/i
      const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'head', 'meta', 'link'])

      // ── helpers ──────────────────────────────────────────────────────────
      function isVisible(el) {
        const s = window.getComputedStyle(el)
        return s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0'
      }

      function isCookieBanner(el) {
        return COOKIE_RE.test(el.className + ' ' + el.id + ' ' + (el.getAttribute('data-id') || ''))
      }

      function absUrl(src) {
        if (!src) return null
        try { return new URL(src, location.href).href } catch { return src }
      }

      function extractText(el) {
        return (el.textContent || '').replace(/\s+/g, ' ').trim()
      }

      function tagName(el) {
        return el.tagName.toLowerCase()
      }

      // ── classify a candidate section root ────────────────────────────────
      function classifySection(el) {
        const cls = (el.className || '').toLowerCase()
        const id  = (el.id || '').toLowerCase()
        const hint = cls + ' ' + id
        if (/hero|banner|jumbotron|masthead/.test(hint)) return 'hero'
        if (/feature|benefit|highlight|capability/.test(hint)) return 'features'
        if (/testimonial|quote|review|trust/.test(hint)) return 'testimonials'
        if (/pricing|plan|tier/.test(hint)) return 'pricing'
        if (/faq|question|accordion/.test(hint)) return 'faq'
        if (/cta|call-to-action|signup|download/.test(hint)) return 'cta'
        if (/footer/.test(hint)) return 'footer'
        if (/nav|header/.test(hint)) return 'header'
        if (/grid|card|gallery/.test(hint)) return 'grid'
        return 'section'
      }

      // ── extract structured content from a section root ───────────────────
      function extractSection(root, index) {
        if (!isVisible(root) || isCookieBanner(root)) return null

        const headings = []
        const paragraphs = []
        const images = []
        const buttons = []
        const items = [] // sub-items (feature cards, FAQ rows, etc.)

        // Walk direct and shallow children
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
        let node = walker.nextNode()
        while (node) {
          const tag = tagName(node)
          if (SKIP_TAGS.has(tag) || isCookieBanner(node)) {
            node = walker.nextNode()
            continue
          }
          if (!isVisible(node)) { node = walker.nextNode(); continue }

          if (/^h[1-6]$/.test(tag)) {
            const text = extractText(node)
            if (text && text.length < 300) {
              headings.push({ tag, text, level: parseInt(tag[1]) })
            }
          } else if (tag === 'p') {
            const text = extractText(node)
            if (text && text.length > 20 && text.length < 600) {
              paragraphs.push(text)
            }
          } else if (tag === 'img') {
            const src = absUrl(node.src || node.dataset.src || node.getAttribute('data-lazy-src'))
            if (src && node.naturalWidth > 60 && node.naturalHeight > 60) {
              images.push({
                src,
                alt: node.alt || '',
                width: node.naturalWidth || node.width || 0,
                height: node.naturalHeight || node.height || 0,
              })
            }
          } else if (tag === 'button' || (tag === 'a' && node.getAttribute('role') === 'button')) {
            const text = extractText(node)
            if (text && text.length < 80) buttons.push(text)
          } else if (tag === 'video') {
            const src = absUrl(node.src || node.querySelector('source')?.src)
            if (src) images.push({ src, alt: 'Video', width: node.videoWidth || 0, height: node.videoHeight || 0, isVideo: true, poster: node.poster || null })
          }
          node = walker.nextNode()
        }

        // Deduplicate headings (some sites render the same heading 3× for animation)
        const seenH = new Set()
        const uniqueHeadings = headings.filter(h => {
          const key = h.text.slice(0, 60)
          if (seenH.has(key)) return false
          seenH.add(key)
          return true
        })

        // Deduplicate images by src
        const seenI = new Set()
        const uniqueImages = images.filter(img => {
          if (seenI.has(img.src)) return false
          seenI.add(img.src)
          return true
        })

        // Skip sections with no meaningful content
        if (!uniqueHeadings.length && !paragraphs.length && !uniqueImages.length) return null

        // Detect sub-items: repeated card-like children (feature grids, FAQ, etc.)
        const cardSelectors = [
          '[class*="card"]', '[class*="item"]', '[class*="feature"]',
          '[class*="tile"]', '[class*="col"]', 'li',
        ]
        for (const sel of cardSelectors) {
          const cards = Array.from(root.querySelectorAll(`:scope > * > ${sel}, :scope > ${sel}`))
            .filter(c => isVisible(c) && !isCookieBanner(c))
          if (cards.length >= 2 && cards.length <= 20) {
            for (const card of cards) {
              const cardHeadings = Array.from(card.querySelectorAll('h1,h2,h3,h4,h5,h6'))
                .map(h => ({ tag: tagName(h), text: extractText(h), level: parseInt(tagName(h)[1]) }))
                .filter(h => h.text)
              const cardParas = Array.from(card.querySelectorAll('p'))
                .map(p => extractText(p)).filter(t => t.length > 10)
              const cardImgs = Array.from(card.querySelectorAll('img'))
                .filter(img => img.naturalWidth > 60)
                .map(img => ({ src: absUrl(img.src), alt: img.alt || '', width: img.naturalWidth || 0, height: img.naturalHeight || 0 }))
              const cardBtns = Array.from(card.querySelectorAll('button, a[role="button"], a[class*="btn"]'))
                .map(b => extractText(b)).filter(t => t && t.length < 80)
              if (cardHeadings.length || cardParas.length) {
                items.push({
                  headings: cardHeadings,
                  paragraphs: cardParas.slice(0, 3),
                  images: cardImgs.slice(0, 2),
                  buttons: cardBtns.slice(0, 2),
                })
              }
            }
            if (items.length >= 2) break // found a good card set
          }
        }

        return {
          index,
          type: classifySection(root),
          selector: root.tagName.toLowerCase() + (root.id ? `#${root.id}` : root.className ? `.${root.className.trim().split(/\s+/)[0]}` : ''),
          headings: uniqueHeadings.slice(0, 6),
          paragraphs: paragraphs.slice(0, 6),
          images: uniqueImages.slice(0, 10),
          buttons: [...new Set(buttons)].slice(0, 4),
          items: items.slice(0, 12), // sub-cards / feature items
        }
      }

      // ── find section roots ────────────────────────────────────────────────
      // Priority 1: semantic section/article/main elements
      const semanticRoots = Array.from(
        document.querySelectorAll('main > section, main > article, main > div > section, body > section, body > article')
      ).filter(el => !isCookieBanner(el) && isVisible(el))

      // Priority 2: large direct children of main/body if no semantic roots
      const fallbackRoots = semanticRoots.length < 2
        ? Array.from(document.querySelectorAll('main > div, body > div'))
            .filter(el => !isCookieBanner(el) && isVisible(el) && el.getBoundingClientRect().height > 200)
        : []

      const roots = semanticRoots.length >= 2 ? semanticRoots : [...semanticRoots, ...fallbackRoots]

      // Also always include nav/header and footer if present
      const nav = document.querySelector('nav, header')
      const footer = document.querySelector('footer')
      const extra = [nav, footer].filter(Boolean).filter(el => isVisible(el) && !isCookieBanner(el))

      const allRoots = [...new Set([...extra.slice(0, 1), ...roots, ...extra.slice(1)])]

      return allRoots
        .map((el, i) => extractSection(el, i))
        .filter(Boolean)
        .slice(0, 30) // cap at 30 sections
    })

    console.log(`[Screenshot API]   - ${sections.length} sections extracted`)

    await browser.close()

    // Build and persist report.json so agents can read it later
    const report = {
      id: `report-${timestamp}`,
      url,
      timestamp,
      generatedAt: new Date(timestamp).toISOString(),
      reportId: timestamp,
      screenshots: screenshots.map((s) => ({
        ...s,
        // Store the public-relative path so it works when served from /public
        url: s.url,
      })),
      html: {
        path: htmlPath,
        url: `/screenshots/${htmlPath}`,
      },
      metadata,
      structure,
      resources: {
        images,
        videos,
        animations,
        texts,
        colors,
        links: [],
      },
      sections,
      summary: {
        totalScreenshots: screenshots.length,
        totalImages: images.length,
        totalVideos: videos.length,
        totalGifs: animations.gifs.length,
        totalAnimations: animations.totalAnimated || 0,
        totalTexts: texts.length,
        totalColors: colors.length,
        totalLinks: 0,
        pageTitle: metadata?.title || 'Untitled',
        language: metadata?.lang || 'en',
        totalSections: sections.length,
      },
    }

    const reportJsonPath = path.join(__dirname, 'public/scraping-reports', `${timestamp}`, 'report.json')
    fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf-8')
    console.log(`[Screenshot API] report.json saved → public/scraping-reports/${timestamp}/report.json`)

    res.json({
      success: true,
      screenshots,
      reportId: timestamp,
      html: {
        path: htmlPath,
        url: `/screenshots/${htmlPath}`,
      },
      metadata,
      structure,
      images,
      videos,
      animations,
      texts,
      colors,
      sections,
      url: url,
      capturedAt: new Date(timestamp).toISOString(),
    })
  } catch (error) {
    console.error('[Screenshot API] Error:', error)
    res.status(500).json({
      error: 'Failed to capture screenshots',
      message: error.message,
    })
  }
})

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'screenshot-service' })
})

app.listen(PORT, () => {
  console.log(`🚀 Screenshot API server running on http://localhost:${PORT}`)
  console.log(`📸 Ready to capture real screenshots with Playwright`)
})
