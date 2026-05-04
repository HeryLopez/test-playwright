---
description: "Converts a scraping report folder into an importable components.json for the Home Editor. Trigger manually by providing the report folder name (timestamp ID found in public/scraping-reports/)."
name: "Report to Components"
tools: [read, edit, execute]
---

# Report to Components Agent

You convert a saved scraping report into a `components.json` file that the user can import directly into the Home Editor. The goal is to **replicate the original site layout as closely as possible** using the available block types — not to invent a new layout.

## How to trigger

> "Convert report 1746123456789"
> "Generate components.json for folder 1746123456789"

---

## Step 0 — Initialize tracking structures

Before processing anything, initialize these in-memory tracking structures for the current run:

```
blockIdMap = {}     // elementKey → [blockId, ...]  — maps source elements to emitted block IDs
nextId = 1          // shared sequential counter for scraped-N IDs
unmappedLog = []    // accumulates skipped/degraded entries during conversion
mappedSectionCount = 0   // sections that produced at least one non-spacer block
totalSectionCount = 0    // all sections evaluated (including skipped)
```

Key naming convention for `blockIdMap`:
- `section-{sectionIndex}-{elementRole}` for section-derived elements (e.g. `section-2-heading-0`, `section-3-testimonial`)
- `resource-{type}-{index}` for flat-resource-derived elements (e.g. `resource-heading-0`, `resource-image-2`)

These structures are used in Step 3 (Pass 1) and consumed in Step 5.5 (Pass 2) to produce `analysis.json`.

---

## Step 1 — Read the report

Read `public/scraping-reports/<FOLDER>/report.json`.
If missing, stop and tell the user.

The report has two content sources:
- `report.sections[]` — structured sections extracted from the DOM (preferred, use this first)
- `report.resources` — flat lists of images/texts/colors (fallback if sections is empty)

**Never use `report.screenshots` as image content** — those are internal reference captures, not site images.

---

## Step 2 — Understand the available blocks

```
spacer   → { height }
text     → { text, fontSize, color, textAlign }
image    → { src, alt, width, borderRadius, align }
button   → { label, variant, size, align, borderRadius }
carousel → { slides:[{src,alt}], height, borderRadius }
```

### Block reference

**text fontSize guide:**
- 48 = hero/page title (h1)
- 36 = section title (h2)
- 28 = subsection title (h3)
- 22 = card title (h4)
- 18 = lead paragraph / large body
- 16 = body paragraph
- 13 = caption / small label
- 11 = eyebrow / micro label

**text color guide:**
- headingColor (derived below) = primary headings
- `#1e293b` = h2 section titles
- `#334155` = h3 subtitles / card titles
- `#475569` = body paragraphs
- `#94a3b8` = captions, muted text

**headingColor** = first color in `report.resources.colors` whose `usage` matches `/primary|brand|accent|main/i`, else `colors[0].hex`, else `#0f172a`.

**button:**
- `variant`: 'primary' for main CTA, 'outline' for secondary
- `size`: 'large' for hero, 'medium' for section CTAs
- `borderRadius`: 6=default, 8=rounded, 24=pill

**image:**
- `width`: 100=full, 80=inset, 50=half — match the visual weight of the original
- `borderRadius`: 0=sharp, 8=subtle, 12=card

**carousel:** use when a section has 3+ images of similar type (feature screenshots, gallery)

**spacer heights:** 8=tight, 16=small, 24=medium, 32=section gap, 48=large gap

---

## Step 3 — Convert sections to blocks

Process `report.sections[]` in order. Each section maps to a group of blocks. Preserve the original sequence.

**Tracking rule:** Every block you emit must be assigned the next sequential ID (`scraped-{nextId++}`) and recorded in `blockIdMap` under the appropriate element key. Increment `totalSectionCount` for every section evaluated (including skipped ones). Increment `mappedSectionCount` only for sections that produce at least one non-spacer block.

### Filtering — skip these before converting:
- Sections whose `type === 'header'` or `type === 'footer'` → skip (nav/footer not supported as blocks)
  - **Log to unmappedLog:** `{ elementType: "navigation" | "footer", status: "skipped", reason: "...", sourceSection: sectionIndex, originalContent: first 120 chars of headings joined, affectedBlockIds: [] }`
- Sections where all headings/paragraphs match `/cookie|gdpr|consent|privacy/i` → skip (no unmappedLog entry needed)
- Headings whose text is identical to `metadata.title` and it's not the first section → skip (avoid duplicate title)
- Images where `alt` matches `/avatar|logo|icon/i` or `width < 100` → skip

### Degradation detection — check BEFORE emitting blocks for a section:

**Testimonial pattern** — if `section.images[]` contains any image whose `alt` matches `/avatar/i`:
- The avatar image(s) will be filtered out; only quote text will be emitted as text blocks
- After emitting the section's blocks, **log to unmappedLog:**
  ```
  {
    elementType: "testimonial",
    status: "degraded",
    reason: "Testimonial contains an avatar image and a quote. The avatar image was filtered out (alt matches /avatar/i); only the quote text was emitted as a text block.",
    sourceSection: sectionIndex,
    originalContent: first 120 chars of first paragraph (the quote),
    affectedBlockIds: [IDs of text blocks emitted from this section's paragraphs],
    suggestedAlternative: {
      approach: "new-block",
      blockType: "testimonial",
      description: "A dedicated testimonial block with props: { quote: string, authorName: string, authorTitle: string, avatarSrc: string } would render this element faithfully.",
      existingWorkaround: "Manually edit the text block(s) (IDs: <affectedBlockIds>) to add the author name. Add a separate image block above with the avatar URL: <avatar src>"
    }
  }
  ```

**Feature-grid pattern** — if `section.items[]` has 3 or more items AND each item has at least one image AND at least one heading:
- Items will be flattened into individual text/image blocks
- After emitting the section's blocks, **log to unmappedLog:**
  ```
  {
    elementType: "feature-grid",
    status: "degraded",
    reason: "Feature grid with N items was flattened into individual text/image blocks. A grid layout cannot be represented with existing blocks.",
    sourceSection: sectionIndex,
    originalContent: "N feature items with images and headings",
    affectedBlockIds: [all block IDs emitted for this section],
    suggestedAlternative: {
      approach: "new-block",
      blockType: "feature-grid",
      description: "A feature-grid block with props: { items: [{image, heading, description}], columns: number } would render this N-item grid faithfully.",
      existingWorkaround: "The N items were flattened into individual text/image blocks (IDs: <affectedBlockIds>). You can reorganize them visually in the editor, but a true grid layout requires a feature-grid block."
    }
  }
  ```

**Accordion pattern** — if `section.items[]` has 2 or more items AND each item has at least one heading AND at least one paragraph AND no images:
- Items will be emitted as plain text blocks
- After emitting the section's blocks, **log to unmappedLog:**
  ```
  {
    elementType: "accordion",
    status: "degraded",
    reason: "FAQ/accordion items were emitted as plain text blocks. They are readable but lack expand/collapse behavior.",
    sourceSection: sectionIndex,
    originalContent: "N Q&A items",
    affectedBlockIds: [IDs of text blocks emitted from this section's items],
    suggestedAlternative: {
      approach: "new-block",
      blockType: "accordion",
      description: "An accordion block with props: { items: [{question: string, answer: string}], defaultOpen: number|null } would render this FAQ section faithfully.",
      existingWorkaround: "The Q&A items were emitted as plain text blocks (IDs: <affectedBlockIds>). They are readable but lack expand/collapse behavior."
    }
  }
  ```

### Videos — log before processing sections:

For each entry in `report.resources.videos[]`:
```
unmappedLog.push({
  elementType: "video",
  status: "skipped",
  reason: "HTML5 video is not supported as an editor block. The video was omitted entirely.",
  sourceSection: null,
  originalContent: video.url,
  affectedBlockIds: []
})
```

### Section → blocks mapping rules:

**For each section, emit blocks in this order:**

1. `spacer(32)` — section separator (use 48 before the first real content section)
   - Record in `blockIdMap` under key `section-{i}-spacer-lead`

2. **Headings** — emit in DOM order
   - h1 → text(content, 48, headingColor, 'center') — key: `section-{i}-heading-{hi}`
   - h2 → text(content, 36, '#1e293b', 'center') — key: `section-{i}-heading-{hi}`
   - h3 → text(content, 28, '#334155', 'center') — key: `section-{i}-heading-{hi}`
   - h4 → text(content, 22, '#334155', 'center') — key: `section-{i}-heading-{hi}`
   - spacer(12) between consecutive headings

3. **Lead paragraph** — first paragraph of the section (if exists)
   - text(content, 18, '#475569', 'center') if section has a prominent heading — key: `section-{i}-paragraph-0`
   - text(content, 16, '#475569', 'left') otherwise — key: `section-{i}-paragraph-0`
   - spacer(8)

4. **Buttons** — section.buttons[]
   - First: button(label, 'primary', 'large', 'center', 8) — key: `section-{i}-button-0`
   - Others (up to 2): spacer(8) + button(label, 'outline', 'medium', 'center', 6) — key: `section-{i}-button-{bi}`
   - spacer(16)

5. **Images / media** — section.images[] (after filtering)
   - 1 image → image(src, alt, width=100, borderRadius=12, 'center') — key: `section-{i}-image-0` + spacer(24)
   - 2 images → each as image(src, alt, 80, 8, 'center') — key: `section-{i}-image-{ii}` + spacer(16)
   - 3+ images → carousel(slides, height=400, borderRadius=10) — key: `section-{i}-carousel` + spacer(32)

6. **Sub-items** (section.items[]) — feature cards, FAQ rows, etc.
   - For each item (index `ii`):
     - spacer(16)
     - Each heading → text block (h3=28, h4=22, color='#334155', 'left') — key: `section-{i}-item-{ii}-heading-{hi}`
     - Each paragraph → text(content, 16, '#475569', 'left') — key: `section-{i}-item-{ii}-paragraph-{pi}` + spacer(8)
     - Each image → image(src, alt, 80, 8, 'center') — key: `section-{i}-item-{ii}-image-{ii2}` + spacer(12)
     - Each button → button(label, 'outline', 'medium', 'center', 6) — key: `section-{i}-item-{ii}-button-{bi}`
   - spacer(8) after last item

7. **Remaining paragraphs** (paragraphs after the first, up to 5 total per section)
   - text(content, 16, '#475569', 'left') — key: `section-{i}-paragraph-{pi}` + spacer(12)

### Fallback — if report.sections is empty or has fewer than 2 entries:

Use `report.resources` flat lists in this order:
1. metadata title + description (as in section rules above) — keys: `resource-title`, `resource-description`
2. All headings from `resources.texts` filtered by tag h1-h6, skip cookie/nav contexts — keys: `resource-heading-{i}`
3. First 6 paragraphs from `resources.texts` filtered by tag=p, skip cookie contexts — keys: `resource-paragraph-{i}`
4. All content images (category !== 'logo', alt not matching avatar/logo/icon, width >= 100) — keys: `resource-image-{i}`
   - 3+ → carousel (key: `resource-carousel`); 1-2 → individual image blocks

---

## Step 4 — Always append: color palette + footer

**Color palette** (if `report.resources.colors` has entries):
```
spacer(32)
text('Color Palette', 11, headingColor, 'center')
spacer(8)
// for each color up to 6:
text('<hex>  —  <usage>', 13, <readable_hex>, 'center')
  // readable_hex: if hex is very light (#fff/#fafafa) use #aaaaaa; if very dark (#000) use #333333; else use hex itself
spacer(32)
```

**Footer note** (always last):
```
spacer(48)
text('Scraped from <url> · <date>', 12, '#94a3b8', 'center')
  // date = report.generatedAt as locale date string e.g. 5/4/2026
spacer(32)
```

---

## Step 5 — Write output

Write to `public/scraping-reports/<FOLDER>/components.json` as a pretty-printed JSON array.
IDs: `scraped-1`, `scraped-2`, ... (sequential, never reuse).

---

## Step 5.5 — Write analysis.json

After writing `components.json`, produce the analysis file. This is Pass 2 — it consumes `blockIdMap` and `unmappedLog` built during Pass 1.

### 1. Compute totals
```
totalBlocksGenerated = nextId - 1
```

### 2. Build unmappedElements
Use `unmappedLog` directly — it was accumulated during Pass 1. Each entry already has all required fields.

### 3. Build blockRecommendations

Aggregate `unmappedLog` entries by `elementType` (skip entries with `elementType: "cookie"`). For each distinct type that has a known block spec:

| elementType    | blockType      | suggestedProps |
|----------------|----------------|----------------|
| video          | video          | `{ src: "string", poster: "string", autoplay: "boolean", loop: "boolean", width: "number" }` |
| testimonial    | testimonial    | `{ quote: "string", authorName: "string", authorTitle: "string", avatarSrc: "string", avatarAlt: "string" }` |
| feature-grid   | feature-grid   | `{ items: "array<{image,heading,description}>", columns: "number" }` |
| accordion      | accordion      | `{ items: "array<{question,answer}>", defaultOpen: "number\|null" }` |
| navigation     | navigation     | `{ logo: "string", links: "array<{label,href}>", sticky: "boolean" }` |
| footer         | footer         | `{ links: "array<{label,href}>", copyright: "string" }` |
| table          | table          | `{ headers: "array<string>", rows: "array<array<string>>" }` |

Priority rule: `occurrences >= 3` → `"high"`, `occurrences === 2` → `"medium"`, `occurrences === 1` → `"low"`.

Sort `blockRecommendations` by priority descending: `"high"` → `"medium"` → `"low"`.

### 4. Compute fidelityScore
```
fidelityScore = totalSectionCount === 0 ? 0 : Math.round(100 * mappedSectionCount / totalSectionCount)
```

### 5. Build iterationGuide

```json
{
  "overview": "This guide explains how to use analysis.json to improve the components.json output by manually editing or replacing blocks.",
  "steps": [
    { "step": 1, "title": "Open components.json", "description": "Open public/scraping-reports/<FOLDER>/components.json in your editor." },
    { "step": 2, "title": "Review degraded entries", "description": "Each entry in unmappedElements with status 'degraded' lists affectedBlockIds. These are the block IDs in components.json that were generated from that element with structural loss." },
    { "step": 3, "title": "Locate the affected block", "description": "Search components.json for the block ID (e.g. 'scraped-28'). You will find the degraded block — typically a text block that is missing visual structure." },
    { "step": 4, "title": "Apply the suggested alternative", "description": "Each degraded entry includes a suggestedAlternative field. If approach is 'existing-workaround', you can improve the block manually using the instructions. If approach is 'new-block', the recommended block type does not yet exist in the editor — see blockRecommendations for the full spec." },
    { "step": 5, "title": "Re-import into the editor", "description": "After editing components.json, open http://localhost:5173, click Import/Export → Import, and paste the updated JSON." }
  ],
  "priorityOrder": "Address high-priority blockRecommendations first — they correspond to the most frequently degraded or skipped element types and will have the greatest impact on fidelity."
}
```

### 6. Write the file

Write the following structure as pretty-printed JSON to `public/scraping-reports/<FOLDER>/analysis.json`:

```json
{
  "generatedAt": "<ISO 8601 timestamp>",
  "reportFolder": "<FOLDER>",
  "sourceUrl": "<report.url>",
  "summary": {
    "fidelityScore": <0-100>,
    "totalSectionsProcessed": <totalSectionCount>,
    "skippedCount": <count of unmappedElements with status "skipped">,
    "degradedCount": <count of unmappedElements with status "degraded">,
    "totalBlocksGenerated": <totalBlocksGenerated>,
    "recommendationCount": <blockRecommendations.length>
  },
  "unmappedElements": [ ... ],
  "blockRecommendations": [ ... ],
  "iterationGuide": { ... }
}
```

**Error handling:**
- If `totalSectionCount === 0`, set `fidelityScore` to `0`.
- If a `blockIdMap` lookup returns `undefined`, use `[]` for `affectedBlockIds`.
- If JSON serialization fails, report the error to the user and do NOT write a partial file.

---

## Step 6 — Report to user

- Total block count and breakdown by type
- How many sections were processed
- Path to `components.json`
- **Fidelity score:** `fidelityScore/100` (e.g. "Fidelity score: 72/100")
- **Unmapped elements:** `skippedCount` skipped, `degradedCount` degraded
- **Path to `analysis.json`:** `public/scraping-reports/<FOLDER>/analysis.json`
- **Block recommendations** (`recommendationCount` total): list each recommended `blockType` by name (e.g. "video, testimonial, feature-grid")
- Import instructions:
  1. Open `http://localhost:5173`
  2. Click **Import/Export** → **Import**
  3. Paste contents of `components.json` → **Import JSON**
- Tip: Open `analysis.json` to see which blocks were degraded and how to improve them. Use the `iterationGuide` inside the file for step-by-step instructions.

---

## Rules

- Preserve the original section order — do not reorder or invent structure
- Never use `report.screenshots` URLs as image src
- Never fabricate content not present in the report
- Do not modify any `src/` files
- Only write to `public/scraping-reports/<FOLDER>/components.json` and `public/scraping-reports/<FOLDER>/analysis.json`
