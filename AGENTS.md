# AGENTS.md

## Project Overview

React + Vite Home Editor app. A visual editor with drag-and-drop blocks, a canvas, and a properties panel.

The codebase follows a **Domain-Driven Design (DDD)** architecture adapted for React. All new features must be organized according to this structure. These instructions are intentionally written so that AI agents can generate new functionality while respecting DDD boundaries.

## Structure

```
src/
  domains/
    canvas/                     # Canvas state + Canvas UI
    │   hooks/useCanvas.js      # State: components[], add, reorder, select
    │   components/Canvas.jsx   # Renders blocks via blocksMap — no switch/case
    │   index.js
    │
    palette/                    # Left panel — draggable block items
    │   components/ComponentPalette.jsx  # Receives blocks[] prop
    │   index.js
    │
    properties/                 # Right panel — inspector
    │   components/PropertiesPanel.jsx   # Renders blockDef.Fields for selected block
    │   index.js
    │
    block-text/                 # "Text" block — self-contained bounded context
    │   models/textBlockModel.js
    │   components/TextBlock.jsx        # Rendered on canvas
    │   components/TextBlockFields.jsx  # Property fields for this block
    │   index.js                        # default export: block contract object
    │
    block-<name>/               # Pattern for every future block type
        models/
        components/<Name>Block.jsx
        components/<Name>BlockFields.jsx
        index.js
  pages/
    EditorPage.jsx              # Composition root — wires all domains
  shared/
    components/
    hooks/
    utils/
  App.jsx
  main.jsx
tests/
  *.spec.js
```

## DDD Rules (mandatory)

### Bounded Contexts
- Each domain folder in `src/domains/` is a **bounded context**. Keep logic self-contained.
- Domains communicate only through their public `index.js` exports — never import from another domain's internals.
- Pages (`src/pages/`) are **thin orchestrators and composition roots**: they import from domains, build `BLOCKS`/`BLOCKS_MAP`, and pass them as props. No business logic in pages.

### Block Contract — CRITICAL
Every `block-*` domain **must** export a default object with this exact shape:
```js
export default {
  type: 'text',           // unique string key
  label: 'Text',          // shown in palette
  icon: 'T',              // shown in palette icon
  defaults: { ... },      // initial props when dropped on canvas
  Block: TextBlock,       // JSX component rendered on canvas
  Fields: TextBlockFields // JSX component rendered in properties panel
}
```
- `canvas` and `properties` domains consume this contract — they never import a concrete block directly.
- `EditorPage` builds `BLOCKS_MAP` and passes it to them.

### Adding a New Block Type
1. Create `src/domains/block-<name>/`.
2. Add `models/<name>BlockModel.js` — type constant + defaults.
3. Add `components/<Name>Block.jsx` — canvas render; must be `draggable` and set `componentId` on `dataTransfer`.
4. Add `components/<Name>BlockFields.jsx` — receives `{ props, onChange }`, renders `<div className="property-group">` fields.
5. Export the block contract from `index.js`.
6. In `EditorPage.jsx`, add the import and push it into the `BLOCKS` array — nothing else changes.

### Adding a General Feature
1. Identify the domain (or create one).
2. Model → service → hook → component → `index.js` → page.

### Layer Responsibilities
| Layer | Folder | Responsibility |
|---|---|---|
| Model | `domains/<d>/models/` | Data shapes, constants, validation |
| Service | `domains/<d>/services/` | API calls, localStorage, external effects |
| Hook (use case) | `domains/<d>/hooks/` | Orchestrate service + state, return to UI |
| Component | `domains/<d>/components/` | Render only, receive data via props/hooks |
| Page | `src/pages/` | Composition root: wires domains, no business logic |
| Shared | `src/shared/` | Generic utilities with no domain knowledge |

## Rules

### Testing (mandatory)

- When modifying any file in `src/`, you MUST update or create corresponding Playwright e2e tests in `tests/`
- New pages or routes → add tests covering navigation and content verification
- Changed form fields → update selectors and assertions in affected tests
- Removed features → remove or update tests that cover them
- Run `npx playwright test` to verify all tests pass before finishing

### Test Conventions

- Test names in English: `"should [expected action]"`
- Use `data-testid` attributes for element selection when available
- Fall back to `#id`, `label`, or role-based selectors
- Include `page.waitForTimeout(DELAY)` between form interactions (DELAY = 400ms) for headed mode visibility
- Verify navigation with `toHaveURL()` after route changes
- Assert content with `toHaveText()` or `toBeVisible()`

### Code Conventions

- Functional components only
- React Router for navigation, pass data via `useNavigate` state
- CSS file per component/page alongside its JS file
- English for user-facing text and code
