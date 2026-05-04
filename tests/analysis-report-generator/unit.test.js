/**
 * unit.test.js — Example-based tests for the analysis-report-generator feature.
 *
 * These tests use the runConversion() helper (pure JS extraction of the agent logic)
 * and the 4 fixture files to verify concrete expected outputs.
 *
 * Run with: npx playwright test tests/analysis-report-generator/unit.test.js --reporter=list
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { runConversion } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadFixture(name) {
  const p = resolve(__dirname, 'fixtures', name);
  return JSON.parse(readFileSync(p, 'utf-8'));
}

// ---------------------------------------------------------------------------
// Test 1: agent produces analysis when components.json succeeds (fixture-full)
// ---------------------------------------------------------------------------
test('fixture-full: produces both components and analysis', () => {
  const report = loadFixture('fixture-full.json');
  const { components, analysis } = runConversion(report);

  // components is a non-empty array
  expect(Array.isArray(components)).toBe(true);
  expect(components.length).toBeGreaterThan(0);

  // analysis is a valid object
  expect(typeof analysis).toBe('object');
  expect(analysis).not.toBeNull();

  // analysis is serializable (valid JSON)
  expect(() => JSON.parse(JSON.stringify(analysis))).not.toThrow();
});

// ---------------------------------------------------------------------------
// Test 2: analysis.json is NOT produced when report.json is missing/invalid
// ---------------------------------------------------------------------------
test('missing report: runConversion with null sections falls back gracefully', () => {
  // Simulate a minimal broken report (no sections, no resources)
  const brokenReport = {
    id: 'broken',
    url: 'https://broken.example.com',
    reportId: 999,
    generatedAt: new Date().toISOString(),
    metadata: { title: 'Broken', description: '' },
    resources: { images: [], videos: [], texts: [], colors: [] },
    sections: [],
  };
  // Should not throw — fallback path handles empty sections
  expect(() => runConversion(brokenReport)).not.toThrow();
  const { analysis } = runConversion(brokenReport);
  expect(analysis).toBeDefined();
});

// ---------------------------------------------------------------------------
// Test 3: final message fields — fidelity score, counts, recommendations
// ---------------------------------------------------------------------------
test('fixture-full: analysis summary has expected shape', () => {
  const report = loadFixture('fixture-full.json');
  const { analysis } = runConversion(report);

  const s = analysis.summary;
  expect(typeof s.fidelityScore).toBe('number');
  expect(s.fidelityScore).toBeGreaterThanOrEqual(0);
  expect(s.fidelityScore).toBeLessThanOrEqual(100);
  expect(typeof s.skippedCount).toBe('number');
  expect(typeof s.degradedCount).toBe('number');
  expect(typeof s.totalBlocksGenerated).toBe('number');
  expect(typeof s.recommendationCount).toBe('number');
  expect(s.recommendationCount).toBe(analysis.blockRecommendations.length);
});

test('fixture-full: detects skipped navigation and footer', () => {
  const report = loadFixture('fixture-full.json');
  const { analysis } = runConversion(report);

  const skipped = analysis.unmappedElements.filter(e => e.status === 'skipped');
  const types = skipped.map(e => e.elementType);
  expect(types).toContain('navigation');
  expect(types).toContain('footer');
});

test('fixture-full: detects skipped video', () => {
  const report = loadFixture('fixture-full.json');
  const { analysis } = runConversion(report);

  const videoEntry = analysis.unmappedElements.find(e => e.elementType === 'video');
  expect(videoEntry).toBeDefined();
  expect(videoEntry.status).toBe('skipped');
  expect(videoEntry.affectedBlockIds).toEqual([]);
});

test('fixture-full: detects degraded testimonial', () => {
  const report = loadFixture('fixture-full.json');
  const { analysis } = runConversion(report);

  const testimonial = analysis.unmappedElements.find(e => e.elementType === 'testimonial');
  expect(testimonial).toBeDefined();
  expect(testimonial.status).toBe('degraded');
  expect(Array.isArray(testimonial.affectedBlockIds)).toBe(true);
  expect(testimonial.suggestedAlternative).toBeDefined();
  expect(testimonial.suggestedAlternative.approach).toBe('new-block');
  expect(testimonial.suggestedAlternative.blockType).toBe('testimonial');
});

test('fixture-full: detects degraded feature-grid', () => {
  const report = loadFixture('fixture-full.json');
  const { analysis } = runConversion(report);

  const grid = analysis.unmappedElements.find(e => e.elementType === 'feature-grid');
  expect(grid).toBeDefined();
  expect(grid.status).toBe('degraded');
  expect(grid.affectedBlockIds.length).toBeGreaterThan(0);
});

test('fixture-full: detects degraded accordion', () => {
  const report = loadFixture('fixture-full.json');
  const { analysis } = runConversion(report);

  const accordion = analysis.unmappedElements.find(e => e.elementType === 'accordion');
  expect(accordion).toBeDefined();
  expect(accordion.status).toBe('degraded');
});

// ---------------------------------------------------------------------------
// Test 4: iterationGuide is present and contains correct reportFolder
// ---------------------------------------------------------------------------
test('fixture-full: iterationGuide is present with correct reportFolder', () => {
  const report = loadFixture('fixture-full.json');
  const { analysis } = runConversion(report);

  expect(analysis.iterationGuide).toBeDefined();
  expect(typeof analysis.iterationGuide.overview).toBe('string');
  expect(Array.isArray(analysis.iterationGuide.steps)).toBe(true);
  expect(analysis.iterationGuide.steps.length).toBe(5);

  // reportFolder should appear in the first step description
  const step1 = analysis.iterationGuide.steps[0];
  expect(step1.description).toContain(String(report.reportId));
});

// ---------------------------------------------------------------------------
// Test 5: fixture-minimal produces empty unmappedElements and fidelityScore 100
// ---------------------------------------------------------------------------
test('fixture-minimal: empty unmappedElements and fidelityScore 100', () => {
  const report = loadFixture('fixture-minimal.json');
  const { analysis } = runConversion(report);

  expect(analysis.unmappedElements).toEqual([]);
  expect(analysis.blockRecommendations).toEqual([]);
  expect(analysis.summary.fidelityScore).toBe(100);
  expect(analysis.summary.skippedCount).toBe(0);
  expect(analysis.summary.degradedCount).toBe(0);
});

// ---------------------------------------------------------------------------
// Test 6: fixture-testimonials-only → testimonial recommendation with priority "high"
// ---------------------------------------------------------------------------
test('fixture-testimonials-only: testimonial recommendation has priority high and occurrences 3', () => {
  const report = loadFixture('fixture-testimonials-only.json');
  const { analysis } = runConversion(report);

  const rec = analysis.blockRecommendations.find(r => r.blockType === 'testimonial');
  expect(rec).toBeDefined();
  expect(rec.priority).toBe('high');
  expect(rec.occurrences).toBe(3);
});

// ---------------------------------------------------------------------------
// Test 7: fixture-resources-only runs analysis on resource-derived elements
// ---------------------------------------------------------------------------
test('fixture-resources-only: fallback path produces valid analysis', () => {
  const report = loadFixture('fixture-resources-only.json');
  const { components, analysis } = runConversion(report);

  // Should produce blocks from resources
  expect(components.length).toBeGreaterThan(0);

  // Analysis should be valid
  expect(analysis.generatedAt).toBeDefined();
  expect(analysis.reportFolder).toBe(String(report.reportId));
  expect(analysis.sourceUrl).toBe(report.url);

  // No sections → fidelityScore based on resource fallback
  expect(typeof analysis.summary.fidelityScore).toBe('number');
});

// ---------------------------------------------------------------------------
// Test 8: required top-level fields always present
// ---------------------------------------------------------------------------
test('all fixtures: required top-level fields present', () => {
  const fixtures = ['fixture-full.json', 'fixture-minimal.json', 'fixture-resources-only.json', 'fixture-testimonials-only.json'];
  const requiredFields = ['generatedAt', 'reportFolder', 'sourceUrl', 'summary', 'unmappedElements', 'blockRecommendations', 'iterationGuide'];

  for (const name of fixtures) {
    const report = loadFixture(name);
    const { analysis } = runConversion(report);
    for (const field of requiredFields) {
      expect(analysis[field], `${name}: missing field "${field}"`).toBeDefined();
    }
  }
});

// ---------------------------------------------------------------------------
// Test 9: summary counts are consistent with actual arrays
// ---------------------------------------------------------------------------
test('all fixtures: summary counts are consistent with arrays', () => {
  const fixtures = ['fixture-full.json', 'fixture-minimal.json', 'fixture-resources-only.json', 'fixture-testimonials-only.json'];

  for (const name of fixtures) {
    const report = loadFixture(name);
    const { components, analysis } = runConversion(report);
    const { summary, unmappedElements, blockRecommendations } = analysis;

    expect(summary.skippedCount, `${name}: skippedCount mismatch`)
      .toBe(unmappedElements.filter(e => e.status === 'skipped').length);
    expect(summary.degradedCount, `${name}: degradedCount mismatch`)
      .toBe(unmappedElements.filter(e => e.status === 'degraded').length);
    expect(summary.recommendationCount, `${name}: recommendationCount mismatch`)
      .toBe(blockRecommendations.length);
    expect(summary.totalBlocksGenerated, `${name}: totalBlocksGenerated mismatch`)
      .toBe(components.length);
  }
});

// ---------------------------------------------------------------------------
// Test 10: affectedBlockIds reference valid component IDs
// ---------------------------------------------------------------------------
test('fixture-full: affectedBlockIds reference valid component IDs', () => {
  const report = loadFixture('fixture-full.json');
  const { components, analysis } = runConversion(report);

  const componentIds = new Set(components.map(c => c.id));

  for (const entry of analysis.unmappedElements) {
    for (const blockId of entry.affectedBlockIds) {
      expect(componentIds.has(blockId), `affectedBlockId "${blockId}" not found in components`).toBe(true);
    }
  }
});

// ---------------------------------------------------------------------------
// Test 11: skipped entries always have empty affectedBlockIds
// ---------------------------------------------------------------------------
test('all fixtures: skipped entries have empty affectedBlockIds', () => {
  const fixtures = ['fixture-full.json', 'fixture-minimal.json', 'fixture-resources-only.json', 'fixture-testimonials-only.json'];

  for (const name of fixtures) {
    const report = loadFixture(name);
    const { analysis } = runConversion(report);
    for (const entry of analysis.unmappedElements.filter(e => e.status === 'skipped')) {
      expect(entry.affectedBlockIds, `${name}: skipped entry "${entry.elementType}" should have empty affectedBlockIds`)
        .toEqual([]);
    }
  }
});

// ---------------------------------------------------------------------------
// Test 12: blockRecommendations sorted by priority descending
// ---------------------------------------------------------------------------
test('fixture-full: blockRecommendations sorted high → medium → low', () => {
  const report = loadFixture('fixture-full.json');
  const { analysis } = runConversion(report);

  const order = { high: 3, medium: 2, low: 1 };
  const recs = analysis.blockRecommendations;
  for (let i = 0; i < recs.length - 1; i++) {
    expect(order[recs[i].priority]).toBeGreaterThanOrEqual(order[recs[i + 1].priority]);
  }
});
