/**
 * helpers.js — Shared test utilities for analysis-report-generator tests.
 *
 * runConversion(report) is a pure JS extraction of the agent's mapping logic.
 * It returns { components, analysis } without any file I/O.
 */

import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BLOCK_TYPES = ['spacer', 'text', 'image', 'button', 'carousel'];

const RECOMMENDATION_SPECS = {
  video: {
    description: 'Renders an HTML5 video with autoplay, loop, and poster support. Required when report.resources.videos contains entries.',
    suggestedProps: { src: 'string', poster: 'string', autoplay: 'boolean', loop: 'boolean', width: 'number' },
  },
  testimonial: {
    description: 'Renders a customer quote with avatar image, author name, and optional title. Required when sections contain avatar images paired with quote text.',
    suggestedProps: { quote: 'string', authorName: 'string', authorTitle: 'string', avatarSrc: 'string', avatarAlt: 'string' },
  },
  'feature-grid': {
    description: 'Renders a responsive grid of feature cards, each with an image, heading, and description. Required when a section has 3+ items each containing an image and a heading.',
    suggestedProps: { items: 'array<{image:string, heading:string, description:string}>', columns: 'number' },
  },
  accordion: {
    description: 'Renders an expandable/collapsible list of question-answer pairs. Required when a section contains items following a Q&A or FAQ pattern.',
    suggestedProps: { items: 'array<{question:string, answer:string}>', defaultOpen: 'number|null' },
  },
  navigation: {
    description: 'Renders a site navigation bar with logo and links. Required when a header section is present.',
    suggestedProps: { logo: 'string', links: 'array<{label:string, href:string}>', sticky: 'boolean' },
  },
  footer: {
    description: 'Renders a site footer with links and copyright text. Required when a footer section is present.',
    suggestedProps: { links: 'array<{label:string, href:string}>', copyright: 'string' },
  },
  table: {
    description: 'Renders a data table with headers and rows. Required when a section contains tabular data.',
    suggestedProps: { headers: 'array<string>', rows: 'array<array<string>>' },
  },
};

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

// ---------------------------------------------------------------------------
// Core conversion logic (mirrors agent rules)
// ---------------------------------------------------------------------------

/**
 * Derives headingColor from report.resources.colors.
 */
function deriveHeadingColor(colors = []) {
  const primary = colors.find(c => /primary|brand|accent|main/i.test(c.usage || ''));
  if (primary) return primary.hex;
  if (colors.length > 0) return colors[0].hex;
  return '#0f172a';
}

/**
 * Returns true if all text in headings+paragraphs matches cookie/GDPR patterns.
 */
function isCookieSection(section) {
  const allText = [
    ...(section.headings || []).map(h => h.text || ''),
    ...(section.paragraphs || []),
  ].join(' ');
  return allText.length > 0 && /cookie|gdpr|consent|privacy/i.test(allText) &&
    !(allText.replace(/cookie|gdpr|consent|privacy/gi, '').trim().length > 20);
}

/**
 * Returns true if a section's items follow a Q&A / accordion pattern:
 * each item has exactly one heading and at least one paragraph, no images.
 */
function isAccordionSection(section) {
  const items = section.items || [];
  if (items.length < 2) return false;
  return items.every(item =>
    (item.headings || []).length >= 1 &&
    (item.paragraphs || []).length >= 1 &&
    (item.images || []).length === 0
  );
}

/**
 * Returns true if a section's items form a feature-grid pattern:
 * 3+ items each with at least one image and one heading.
 */
function isFeatureGridSection(section) {
  const items = section.items || [];
  if (items.length < 3) return false;
  return items.every(item =>
    (item.images || []).length >= 1 &&
    (item.headings || []).length >= 1
  );
}

/**
 * Returns true if an image alt matches avatar/logo/icon or width < 100.
 */
function shouldSkipImage(img) {
  return /avatar|logo|icon/i.test(img.alt || '') || (img.width != null && img.width < 100);
}

/**
 * Main conversion function. Returns { components, analysis }.
 * Pure — no file I/O.
 */
export function runConversion(report) {
  const folder = String(report.reportId || report.id || 'unknown');
  const sourceUrl = report.url || '';
  const headingColor = deriveHeadingColor(report.resources?.colors);

  // -------------------------------------------------------------------------
  // Pass 1 — Block generation
  // -------------------------------------------------------------------------
  let nextId = 1;
  const components = [];
  const blockIdMap = {};   // elementKey → [blockId, ...]
  const unmappedLog = [];  // accumulated during pass 1
  let mappedSectionCount = 0;
  let totalSectionCount = 0;

  function emit(type, props, elementKey) {
    const id = `scraped-${nextId++}`;
    components.push({ id, type, props });
    if (elementKey) {
      blockIdMap[elementKey] = (blockIdMap[elementKey] || []).concat(id);
    }
    return id;
  }

  function logSkipped(elementType, sourceSection, originalContent, reason) {
    unmappedLog.push({
      elementType,
      status: 'skipped',
      reason,
      sourceSection,
      originalContent: String(originalContent || '').slice(0, 120),
      affectedBlockIds: [],
    });
  }

  function logDegraded(elementType, sourceSection, originalContent, reason, affectedBlockIds, suggestedAlternative) {
    unmappedLog.push({
      elementType,
      status: 'degraded',
      reason,
      sourceSection,
      originalContent: String(originalContent || '').slice(0, 120),
      affectedBlockIds: affectedBlockIds || [],
      suggestedAlternative,
    });
  }

  // Videos — always skipped
  for (const video of (report.resources?.videos || [])) {
    logSkipped('video', null, video.url, 'HTML5 video is not supported as an editor block. The video was omitted entirely.');
  }

  const sections = report.sections || [];
  const useSections = sections.length >= 2;

  if (useSections) {
    sections.forEach((section, sectionIndex) => {
      totalSectionCount++;

      // Skip header/footer
      if (section.type === 'header') {
        logSkipped('navigation', sectionIndex,
          (section.headings || []).map(h => h.text).join(' · ').slice(0, 120),
          'Navigation bars are not supported as editor blocks. The header section was omitted entirely.');
        return;
      }
      if (section.type === 'footer') {
        logSkipped('footer', sectionIndex,
          (section.headings || []).map(h => h.text).join(' · ').slice(0, 120),
          'Footer sections are not supported as editor blocks. The footer was omitted entirely.');
        return;
      }

      // Skip cookie sections
      if (isCookieSection(section)) {
        // No recommendation for cookie sections
        return;
      }

      // Detect degradation patterns before emitting blocks
      const isTestimonial = (section.images || []).some(img => /avatar/i.test(img.alt || ''));
      const isGrid = isFeatureGridSection(section);
      const isAccordion = isAccordionSection(section);

      // Track which blocks are emitted for this section
      const sectionKey = `section-${sectionIndex}`;
      const blocksBefore = nextId;

      // Spacer
      emit('spacer', { height: sectionIndex === 0 ? 48 : 32 });

      // Headings
      const headings = section.headings || [];
      headings.forEach((h, hi) => {
        const key = `${sectionKey}-heading-${hi}`;
        if (h.level === 1) emit('text', { text: h.text, fontSize: 48, color: headingColor, textAlign: 'center' }, key);
        else if (h.level === 2) emit('text', { text: h.text, fontSize: 36, color: '#1e293b', textAlign: 'center' }, key);
        else if (h.level === 3) emit('text', { text: h.text, fontSize: 28, color: '#334155', textAlign: 'center' }, key);
        else if (h.level === 4) emit('text', { text: h.text, fontSize: 22, color: '#334155', textAlign: 'center' }, key);
        if (hi < headings.length - 1) emit('spacer', { height: 12 });
      });

      // Lead paragraph
      const paragraphs = section.paragraphs || [];
      if (paragraphs.length > 0) {
        const hasHeading = headings.length > 0;
        const key = `${sectionKey}-paragraph-0`;
        emit('text', { text: paragraphs[0], fontSize: hasHeading ? 18 : 16, color: '#475569', textAlign: hasHeading ? 'center' : 'left' }, key);
        emit('spacer', { height: 8 });
      }

      // Buttons
      const buttons = section.buttons || [];
      buttons.forEach((label, bi) => {
        const key = `${sectionKey}-button-${bi}`;
        if (bi === 0) {
          emit('button', { label, variant: 'primary', size: 'large', align: 'center', borderRadius: 8 }, key);
        } else if (bi <= 2) {
          emit('spacer', { height: 8 });
          emit('button', { label, variant: 'outline', size: 'medium', align: 'center', borderRadius: 6 }, key);
        }
      });
      if (buttons.length > 0) emit('spacer', { height: 16 });

      // Images (filtered)
      const images = (section.images || []).filter(img => !shouldSkipImage(img) && !img.isVideo);
      if (images.length === 1) {
        const key = `${sectionKey}-image-0`;
        emit('image', { src: images[0].src, alt: images[0].alt || '', width: 100, borderRadius: 12, align: 'center' }, key);
        emit('spacer', { height: 24 });
      } else if (images.length === 2) {
        images.forEach((img, ii) => {
          const key = `${sectionKey}-image-${ii}`;
          emit('image', { src: img.src, alt: img.alt || '', width: 80, borderRadius: 8, align: 'center' }, key);
          emit('spacer', { height: 16 });
        });
      } else if (images.length >= 3) {
        const key = `${sectionKey}-carousel`;
        emit('carousel', { slides: images.map(img => ({ src: img.src, alt: img.alt || '' })), height: 400, borderRadius: 10 }, key);
        emit('spacer', { height: 32 });
      }

      // Sub-items
      const items = section.items || [];
      items.forEach((item, ii) => {
        emit('spacer', { height: 16 });
        (item.headings || []).forEach((h, hi) => {
          const key = `${sectionKey}-item-${ii}-heading-${hi}`;
          const fs = h.level === 3 ? 28 : 22;
          emit('text', { text: h.text, fontSize: fs, color: '#334155', textAlign: 'left' }, key);
        });
        (item.paragraphs || []).forEach((p, pi) => {
          const key = `${sectionKey}-item-${ii}-paragraph-${pi}`;
          emit('text', { text: p, fontSize: 16, color: '#475569', textAlign: 'left' }, key);
          emit('spacer', { height: 8 });
        });
        (item.images || []).filter(img => !shouldSkipImage(img)).forEach((img, ii2) => {
          const key = `${sectionKey}-item-${ii}-image-${ii2}`;
          emit('image', { src: img.src, alt: img.alt || '', width: 80, borderRadius: 8, align: 'center' }, key);
          emit('spacer', { height: 12 });
        });
        (item.buttons || []).forEach((label, bi) => {
          const key = `${sectionKey}-item-${ii}-button-${bi}`;
          emit('button', { label, variant: 'outline', size: 'medium', align: 'center', borderRadius: 6 }, key);
        });
      });
      if (items.length > 0) emit('spacer', { height: 8 });

      // Remaining paragraphs
      paragraphs.slice(1, 5).forEach((p, pi) => {
        const key = `${sectionKey}-paragraph-${pi + 1}`;
        emit('text', { text: p, fontSize: 16, color: '#475569', textAlign: 'left' }, key);
        emit('spacer', { height: 12 });
      });

      // Collect block IDs emitted for this section
      const sectionBlockIds = components.slice(blocksBefore - 1).map(b => b.id);

      // Log degradations
      if (isTestimonial) {
        const avatarImgs = (section.images || []).filter(img => /avatar/i.test(img.alt || ''));
        const quote = paragraphs[0] || '';
        const textBlockIds = sectionBlockIds.filter(id => {
          const block = components.find(b => b.id === id);
          return block && block.type === 'text' && block.props.fontSize === 16;
        });
        logDegraded(
          'testimonial',
          sectionIndex,
          `"${quote.slice(0, 80)}"`,
          'Testimonial contains an avatar image and a quote. The avatar image was filtered out (alt matches /avatar/i); only the quote text was emitted as a text block.',
          textBlockIds,
          {
            approach: 'new-block',
            blockType: 'testimonial',
            description: 'A dedicated testimonial block with props: { quote: string, authorName: string, authorTitle: string, avatarSrc: string } would render this element faithfully.',
            existingWorkaround: `Manually edit the text block(s) (IDs: ${textBlockIds.join(', ')}) to add the author name. Add a separate image block above with the avatar URL: ${avatarImgs[0]?.src || 'N/A'}`,
          }
        );
      }

      if (isGrid) {
        const gridBlockIds = sectionBlockIds;
        logDegraded(
          'feature-grid',
          sectionIndex,
          `${items.length} feature items with images and headings`,
          `Feature grid with ${items.length} items was flattened into individual text/image blocks. A grid layout cannot be represented with existing blocks.`,
          gridBlockIds,
          {
            approach: 'new-block',
            blockType: 'feature-grid',
            description: `A feature-grid block with props: { items: [{image, heading, description}], columns: number } would render this ${items.length}-item grid faithfully.`,
            existingWorkaround: `The ${items.length} items were flattened into individual text/image blocks (IDs: ${gridBlockIds.join(', ')}). You can reorganize them visually in the editor, but a true grid layout requires a feature-grid block.`,
          }
        );
      }

      if (isAccordion) {
        const accordionBlockIds = sectionBlockIds.filter(id => {
          const block = components.find(b => b.id === id);
          return block && block.type === 'text';
        });
        logDegraded(
          'accordion',
          sectionIndex,
          `${items.length} Q&A items`,
          'FAQ/accordion items were emitted as plain text blocks. They are readable but lack expand/collapse behavior.',
          accordionBlockIds,
          {
            approach: 'new-block',
            blockType: 'accordion',
            description: 'An accordion block with props: { items: [{question: string, answer: string}], defaultOpen: number|null } would render this FAQ section faithfully.',
            existingWorkaround: `The Q&A items were emitted as plain text blocks (IDs: ${accordionBlockIds.join(', ')}). They are readable but lack expand/collapse behavior.`,
          }
        );
      }

      mappedSectionCount++;
    });
  } else {
    // Fallback: use resources
    totalSectionCount = 1;
    const resources = report.resources || {};
    const texts = resources.texts || [];
    const images = (resources.images || []).filter(img => !shouldSkipImage(img));

    emit('spacer', { height: 48 });

    // Title + description from metadata
    if (report.metadata?.title) {
      emit('text', { text: report.metadata.title, fontSize: 48, color: headingColor, textAlign: 'center' }, 'resource-title');
    }
    if (report.metadata?.description) {
      emit('text', { text: report.metadata.description, fontSize: 18, color: '#475569', textAlign: 'center' }, 'resource-description');
      emit('spacer', { height: 8 });
    }

    // Headings
    texts.filter(t => /^h[1-6]$/.test(t.tag) && !/cookie|gdpr|consent|privacy/i.test(t.content))
      .forEach((t, i) => {
        const fsMap = { h1: 48, h2: 36, h3: 28, h4: 22, h5: 18, h6: 16 };
        emit('text', { text: t.content, fontSize: fsMap[t.tag] || 16, color: headingColor, textAlign: 'center' }, `resource-heading-${i}`);
      });

    // Paragraphs
    texts.filter(t => t.tag === 'p' && !/cookie|gdpr|consent|privacy/i.test(t.content))
      .slice(0, 6)
      .forEach((t, i) => {
        emit('text', { text: t.content, fontSize: 16, color: '#475569', textAlign: 'left' }, `resource-paragraph-${i}`);
        emit('spacer', { height: 12 });
      });

    // Images
    if (images.length >= 3) {
      emit('carousel', { slides: images.map(img => ({ src: img.url || img.src, alt: img.alt || '' })), height: 400, borderRadius: 10 }, 'resource-carousel');
      emit('spacer', { height: 32 });
    } else {
      images.forEach((img, i) => {
        emit('image', { src: img.url || img.src, alt: img.alt || '', width: 100, borderRadius: 12, align: 'center' }, `resource-image-${i}`);
        emit('spacer', { height: 24 });
      });
    }

    mappedSectionCount = 1;
  }

  // Color palette
  const colors = report.resources?.colors || [];
  if (colors.length > 0) {
    emit('spacer', { height: 32 });
    emit('text', { text: 'Color Palette', fontSize: 11, color: headingColor, textAlign: 'center' });
    emit('spacer', { height: 8 });
    colors.slice(0, 6).forEach(c => {
      const hex = c.hex;
      const readableHex = /^#(f{3,6}|fa|fb|fc|fd|fe|ff)/i.test(hex) ? '#aaaaaa'
        : /^#(0{3,6}|00|01|02|03|04|05)/i.test(hex) ? '#333333'
        : hex;
      emit('text', { text: `${hex}  —  ${c.usage || ''}`, fontSize: 13, color: readableHex, textAlign: 'center' });
    });
    emit('spacer', { height: 32 });
  }

  // Footer note
  const date = report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : new Date().toLocaleDateString();
  emit('spacer', { height: 48 });
  emit('text', { text: `Scraped from ${sourceUrl} · ${date}`, fontSize: 12, color: '#94a3b8', textAlign: 'center' });
  emit('spacer', { height: 32 });

  // -------------------------------------------------------------------------
  // Pass 2 — Analysis generation
  // -------------------------------------------------------------------------
  const totalBlocksGenerated = nextId - 1;

  // Build blockRecommendations
  const recMap = {};
  for (const entry of unmappedLog) {
    const type = entry.elementType;
    if (type === 'cookie') continue; // no recommendation for cookie sections
    if (!RECOMMENDATION_SPECS[type]) continue;
    if (!recMap[type]) recMap[type] = { occurrences: 0 };
    recMap[type].occurrences++;
  }

  const blockRecommendations = Object.entries(recMap).map(([blockType, data]) => {
    const occ = data.occurrences;
    const priority = occ >= 3 ? 'high' : occ === 2 ? 'medium' : 'low';
    const spec = RECOMMENDATION_SPECS[blockType] || {
      description: `A dedicated ${blockType} block.`,
      suggestedProps: {},
    };
    return { blockType, priority, occurrences: occ, description: spec.description, suggestedProps: spec.suggestedProps };
  }).sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);

  const skippedCount = unmappedLog.filter(e => e.status === 'skipped').length;
  const degradedCount = unmappedLog.filter(e => e.status === 'degraded').length;
  const fidelityScore = totalSectionCount === 0 ? 0 : Math.round(100 * mappedSectionCount / totalSectionCount);

  const analysis = {
    generatedAt: new Date().toISOString(),
    reportFolder: folder,
    sourceUrl,
    summary: {
      fidelityScore,
      totalSectionsProcessed: totalSectionCount,
      skippedCount,
      degradedCount,
      totalBlocksGenerated,
      recommendationCount: blockRecommendations.length,
    },
    unmappedElements: unmappedLog,
    blockRecommendations,
    iterationGuide: {
      overview: 'This guide explains how to use analysis.json to improve the components.json output by manually editing or replacing blocks.',
      steps: [
        {
          step: 1,
          title: 'Open components.json',
          description: `Open public/scraping-reports/${folder}/components.json in your editor.`,
        },
        {
          step: 2,
          title: 'Review degraded entries',
          description: "Each entry in unmappedElements with status 'degraded' lists affectedBlockIds. These are the block IDs in components.json that were generated from that element with structural loss.",
        },
        {
          step: 3,
          title: 'Locate the affected block',
          description: "Search components.json for the block ID (e.g. 'scraped-28'). You will find the degraded block — typically a text block that is missing visual structure.",
        },
        {
          step: 4,
          title: 'Apply the suggested alternative',
          description: "Each degraded entry includes a suggestedAlternative field. If approach is 'existing-workaround', you can improve the block manually using the instructions. If approach is 'new-block', the recommended block type does not yet exist in the editor — see blockRecommendations for the full spec.",
        },
        {
          step: 5,
          title: 'Re-import into the editor',
          description: 'After editing components.json, open http://localhost:5173, click Import/Export → Import, and paste the updated JSON.',
        },
      ],
      priorityOrder: 'Address high-priority blockRecommendations first — they correspond to the most frequently degraded or skipped element types and will have the greatest impact on fidelity.',
    },
  };

  return { components, analysis };
}

// ---------------------------------------------------------------------------
// fast-check arbitraries
// ---------------------------------------------------------------------------

const arbitraryHeading = () =>
  fc.record({
    tag: fc.constantFrom('h1', 'h2', 'h3', 'h4'),
    text: fc.string({ minLength: 3, maxLength: 60 }),
    level: fc.integer({ min: 1, max: 4 }),
  });

const arbitraryImage = (forceAvatar = false) =>
  fc.record({
    src: fc.webUrl(),
    alt: forceAvatar
      ? fc.constantFrom('User avatar', 'Author avatar', 'Profile avatar')
      : fc.string({ minLength: 0, maxLength: 40 }),
    width: fc.integer({ min: 100, max: 2000 }),
    height: fc.integer({ min: 100, max: 2000 }),
  });

export const arbitrarySection = () =>
  fc.record({
    index: fc.integer({ min: 0, max: 20 }),
    type: fc.constantFrom('section', 'section', 'section', 'section'), // mostly normal sections
    selector: fc.constant('div'),
    headings: fc.array(arbitraryHeading(), { minLength: 0, maxLength: 3 }),
    paragraphs: fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 0, maxLength: 4 }),
    images: fc.array(arbitraryImage(), { minLength: 0, maxLength: 3 }),
    buttons: fc.array(fc.string({ minLength: 3, maxLength: 30 }), { minLength: 0, maxLength: 3 }),
    items: fc.constant([]),
  });

export const arbitraryTestimonialSection = () =>
  fc.record({
    index: fc.integer({ min: 0, max: 20 }),
    type: fc.constant('section'),
    selector: fc.constant('div'),
    headings: fc.array(arbitraryHeading(), { minLength: 0, maxLength: 1 }),
    paragraphs: fc.array(fc.string({ minLength: 20, maxLength: 200 }), { minLength: 1, maxLength: 2 }),
    images: fc.array(arbitraryImage(true), { minLength: 1, maxLength: 2 }),
    buttons: fc.constant([]),
    items: fc.constant([]),
  });

export const arbitraryFeatureGridSection = () =>
  fc.record({
    index: fc.integer({ min: 0, max: 20 }),
    type: fc.constant('section'),
    selector: fc.constant('div'),
    headings: fc.array(arbitraryHeading(), { minLength: 0, maxLength: 1 }),
    paragraphs: fc.constant([]),
    images: fc.constant([]),
    buttons: fc.constant([]),
    items: fc.array(
      fc.record({
        headings: fc.array(arbitraryHeading(), { minLength: 1, maxLength: 2 }),
        paragraphs: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 0, maxLength: 2 }),
        images: fc.array(arbitraryImage(), { minLength: 1, maxLength: 1 }),
        buttons: fc.constant([]),
      }),
      { minLength: 3, maxLength: 6 }
    ),
  });

export const arbitraryReport = () =>
  fc.record({
    id: fc.constant('report-test'),
    url: fc.webUrl(),
    timestamp: fc.integer({ min: 1000000000000, max: 9999999999999 }),
    generatedAt: fc.integer({ min: 1577836800000, max: 1893456000000 }).map(ts => new Date(ts).toISOString()),
    reportId: fc.integer({ min: 1000000000000, max: 9999999999999 }),
    metadata: fc.record({
      title: fc.string({ minLength: 5, maxLength: 80 }),
      description: fc.string({ minLength: 10, maxLength: 200 }),
    }),
    resources: fc.record({
      images: fc.array(arbitraryImage(), { minLength: 0, maxLength: 5 }),
      videos: fc.array(
        fc.record({ id: fc.string(), url: fc.webUrl(), type: fc.constant('html5') }),
        { minLength: 0, maxLength: 2 }
      ),
      texts: fc.constant([]),
      colors: fc.array(
        fc.record({
          id: fc.string(),
          hex: fc.stringMatching(/^[0-9a-f]{6}$/).map(h => `#${h}`),
          usage: fc.string({ minLength: 3, maxLength: 30 }),
        }),
        { minLength: 0, maxLength: 6 }
      ),
    }),
    sections: fc.array(arbitrarySection(), { minLength: 2, maxLength: 6 }),
  });
