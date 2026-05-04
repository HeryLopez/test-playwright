/**
 * pbt.test.js — Property-based tests for the analysis-report-generator feature.
 *
 * Uses fast-check to generate random report.json inputs and verify that
 * the runConversion() function satisfies all 12 correctness properties
 * defined in the design document.
 *
 * Run with: npx playwright test tests/analysis-report-generator/pbt.test.js --reporter=list
 */

import { test, expect } from '@playwright/test';
import * as fc from 'fast-check';
import {
  runConversion,
  arbitraryReport,
  arbitraryTestimonialSection,
  arbitraryFeatureGridSection,
} from './helpers.js';

const NUM_RUNS = 100;
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };

// ---------------------------------------------------------------------------
// Property 1: analysis.json is always valid JSON
// Feature: analysis-report-generator, Property 1: analysis.json is always valid JSON
// ---------------------------------------------------------------------------
test('Property 1: analysis is always valid JSON', () => {
  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { analysis } = runConversion(report);
      // Must not throw
      const serialized = JSON.stringify(analysis);
      const reparsed = JSON.parse(serialized);
      return typeof reparsed === 'object' && reparsed !== null;
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 2: Required top-level fields are always present
// Feature: analysis-report-generator, Property 2: Required top-level fields are always present
// ---------------------------------------------------------------------------
test('Property 2: required top-level fields are always present', () => {
  const required = ['generatedAt', 'reportFolder', 'sourceUrl', 'summary', 'unmappedElements', 'blockRecommendations', 'iterationGuide'];

  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { analysis } = runConversion(report);
      return required.every(field => field in analysis);
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 3: Every skippable element produces a skipped entry
// Feature: analysis-report-generator, Property 3: Every skippable element produces a skipped entry
// ---------------------------------------------------------------------------
test('Property 3: every video in resources produces a skipped entry', () => {
  // Build reports that always have at least one video
  const reportWithVideos = arbitraryReport().map(r => ({
    ...r,
    resources: {
      ...r.resources,
      videos: [
        { id: 'v0', url: 'https://example.com/video.mp4', type: 'html5' },
        ...r.resources.videos,
      ],
    },
  }));

  fc.assert(
    fc.property(reportWithVideos, (report) => {
      const { analysis } = runConversion(report);
      const videoCount = report.resources.videos.length;
      const skippedVideos = analysis.unmappedElements.filter(e => e.elementType === 'video' && e.status === 'skipped');
      return skippedVideos.length === videoCount;
    }),
    { numRuns: NUM_RUNS }
  );
});

test('Property 3b: header sections produce a skipped navigation entry', () => {
  const reportWithHeader = arbitraryReport().map(r => ({
    ...r,
    sections: [
      { index: 0, type: 'header', selector: 'nav', headings: [{ tag: 'h2', text: 'Nav', level: 2 }], paragraphs: [], images: [], buttons: [], items: [] },
      ...r.sections,
    ],
  }));

  fc.assert(
    fc.property(reportWithHeader, (report) => {
      const { analysis } = runConversion(report);
      const navEntries = analysis.unmappedElements.filter(e => e.elementType === 'navigation' && e.status === 'skipped');
      return navEntries.length >= 1;
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 4: Every degradable element produces a degraded entry
// Feature: analysis-report-generator, Property 4: Every degradable element produces a degraded entry
// ---------------------------------------------------------------------------
test('Property 4a: testimonial sections produce a degraded entry', () => {
  fc.assert(
    fc.property(
      fc.tuple(arbitraryTestimonialSection(), arbitraryTestimonialSection()),
      ([t1, t2]) => {
        const report = {
          id: 'test', url: 'https://example.com', reportId: 1234567890000,
          generatedAt: new Date().toISOString(),
          metadata: { title: 'Test', description: 'Test' },
          resources: { images: [], videos: [], texts: [], colors: [] },
          sections: [
            { ...t1, index: 0 },
            { ...t2, index: 1 },
          ],
        };
        const { analysis } = runConversion(report);
        const degraded = analysis.unmappedElements.filter(e => e.elementType === 'testimonial' && e.status === 'degraded');
        return degraded.length >= 1;
      }
    ),
    { numRuns: NUM_RUNS }
  );
});

test('Property 4b: feature-grid sections produce a degraded entry', () => {
  fc.assert(
    fc.property(
      fc.tuple(arbitraryFeatureGridSection(), arbitraryFeatureGridSection()),
      ([g1, g2]) => {
        const report = {
          id: 'test', url: 'https://example.com', reportId: 1234567890001,
          generatedAt: new Date().toISOString(),
          metadata: { title: 'Test', description: 'Test' },
          resources: { images: [], videos: [], texts: [], colors: [] },
          sections: [
            { ...g1, index: 0 },
            { ...g2, index: 1 },
          ],
        };
        const { analysis } = runConversion(report);
        const degraded = analysis.unmappedElements.filter(e => e.elementType === 'feature-grid' && e.status === 'degraded');
        return degraded.length >= 1;
      }
    ),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 5: Every unmappedElements entry has the required schema
// Feature: analysis-report-generator, Property 5: Every unmappedElements entry has the required schema
// ---------------------------------------------------------------------------
test('Property 5: every unmappedElements entry has the required schema', () => {
  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { analysis } = runConversion(report);
      return analysis.unmappedElements.every(entry =>
        typeof entry.elementType === 'string' &&
        entry.elementType.length > 0 &&
        ['skipped', 'degraded'].includes(entry.status) &&
        typeof entry.reason === 'string' &&
        entry.reason.length > 0 &&
        (entry.sourceSection === null || typeof entry.sourceSection === 'number') &&
        typeof entry.originalContent === 'string' &&
        Array.isArray(entry.affectedBlockIds) &&
        entry.affectedBlockIds.every(id => typeof id === 'string')
      );
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 6: Degraded entries always include suggestedAlternative
// Feature: analysis-report-generator, Property 6: Degraded entries always include suggestedAlternative
// ---------------------------------------------------------------------------
test('Property 6: degraded entries always include suggestedAlternative', () => {
  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { analysis } = runConversion(report);
      return analysis.unmappedElements
        .filter(e => e.status === 'degraded')
        .every(entry =>
          entry.suggestedAlternative !== undefined &&
          typeof entry.suggestedAlternative.approach === 'string' &&
          typeof entry.suggestedAlternative.blockType === 'string' &&
          typeof entry.suggestedAlternative.description === 'string' &&
          typeof entry.suggestedAlternative.existingWorkaround === 'string'
        );
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 7: affectedBlockIds reference valid components.json IDs
// Feature: analysis-report-generator, Property 7: affectedBlockIds reference valid components.json IDs
// ---------------------------------------------------------------------------
test('Property 7: affectedBlockIds reference valid component IDs', () => {
  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { components, analysis } = runConversion(report);
      const componentIds = new Set(components.map(c => c.id));
      return analysis.unmappedElements.every(entry =>
        entry.affectedBlockIds.every(id => componentIds.has(id))
      );
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 8: Skipped entries have empty affectedBlockIds
// Feature: analysis-report-generator, Property 8: Skipped entries have empty affectedBlockIds
// ---------------------------------------------------------------------------
test('Property 8: skipped entries have empty affectedBlockIds', () => {
  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { analysis } = runConversion(report);
      return analysis.unmappedElements
        .filter(e => e.status === 'skipped')
        .every(entry => Array.isArray(entry.affectedBlockIds) && entry.affectedBlockIds.length === 0);
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 9: blockRecommendations covers all distinct unmapped element types
// Feature: analysis-report-generator, Property 9: blockRecommendations covers all distinct unmapped element types
// ---------------------------------------------------------------------------
test('Property 9: blockRecommendations covers all distinct unmapped element types (excluding cookie)', () => {
  // Known types that get recommendations
  const RECOMMENDABLE = new Set(['video', 'testimonial', 'feature-grid', 'accordion', 'navigation', 'footer', 'table']);

  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { analysis } = runConversion(report);
      const unmappedTypes = new Set(
        analysis.unmappedElements
          .map(e => e.elementType)
          .filter(t => RECOMMENDABLE.has(t))
      );
      const recTypes = new Set(analysis.blockRecommendations.map(r => r.blockType));
      // Every recommendable unmapped type should have a recommendation
      for (const t of unmappedTypes) {
        if (!recTypes.has(t)) return false;
      }
      return true;
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 10: Every blockRecommendations entry has the required schema
// Feature: analysis-report-generator, Property 10: Every blockRecommendations entry has the required schema
// ---------------------------------------------------------------------------
test('Property 10: every blockRecommendations entry has the required schema', () => {
  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { analysis } = runConversion(report);
      return analysis.blockRecommendations.every(rec =>
        typeof rec.blockType === 'string' && rec.blockType.length > 0 &&
        ['high', 'medium', 'low'].includes(rec.priority) &&
        typeof rec.occurrences === 'number' && rec.occurrences >= 1 &&
        typeof rec.description === 'string' && rec.description.length > 0 &&
        typeof rec.suggestedProps === 'object' && rec.suggestedProps !== null
      );
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 11: blockRecommendations is sorted by priority descending
// Feature: analysis-report-generator, Property 11: blockRecommendations is sorted by priority descending
// ---------------------------------------------------------------------------
test('Property 11: blockRecommendations sorted high → medium → low', () => {
  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { analysis } = runConversion(report);
      const recs = analysis.blockRecommendations;
      for (let i = 0; i < recs.length - 1; i++) {
        if (PRIORITY_ORDER[recs[i].priority] < PRIORITY_ORDER[recs[i + 1].priority]) {
          return false;
        }
      }
      return true;
    }),
    { numRuns: NUM_RUNS }
  );
});

// ---------------------------------------------------------------------------
// Property 12: summary counts are consistent with actual arrays
// Feature: analysis-report-generator, Property 12: summary counts are consistent with actual arrays
// ---------------------------------------------------------------------------
test('Property 12: summary counts are consistent with actual arrays', () => {
  fc.assert(
    fc.property(arbitraryReport(), (report) => {
      const { components, analysis } = runConversion(report);
      const { summary, unmappedElements, blockRecommendations } = analysis;

      const actualSkipped = unmappedElements.filter(e => e.status === 'skipped').length;
      const actualDegraded = unmappedElements.filter(e => e.status === 'degraded').length;

      return (
        summary.skippedCount === actualSkipped &&
        summary.degradedCount === actualDegraded &&
        summary.recommendationCount === blockRecommendations.length &&
        summary.totalBlocksGenerated === components.length &&
        summary.fidelityScore >= 0 &&
        summary.fidelityScore <= 100
      );
    }),
    { numRuns: NUM_RUNS }
  );
});
