## Project

React + Vite Home Editor app with React Router. Visual drag-and-drop editor with canvas, palette, and properties panel.

The codebase follows a **Domain-Driven Design (DDD)** architecture adapted for React. All new features must be organized according to this structure. These instructions are intentionally written so that AI agents can generate new functionality while respecting DDD boundaries.

## Structure

```
src/
  domains/
    canvas/           # Canvas state (useCanvas) + Canvas component
    palette/          # Left panel — ComponentPalette receives blocks[] prop
    properties/       # Right panel — PropertiesPanel renders blockDef.Fields
    block-text/       # Text block: model + TextBlock + TextBlockFields + contract
    block-<name>/     # Pattern for every future block type
  pages/
    EditorPage.jsx    # Composition root: builds BLOCKS/BLOCKS_MAP, wires domains
  shared/
  App.jsx
  main.jsx
tests/
  *.spec.js
```

## DDD Rules (mandatory)

- Each `src/domains/<name>/` folder is a bounded context — keep logic self-contained.
- Domains communicate only through their `index.js` public API — never import from another domain's internals.
- Pages are **composition roots**: build `BLOCKS`/`BLOCKS_MAP`, pass as props — no business logic.
- `canvas` and `properties` never import concrete block types — they consume the block contract via props.

## Block Contract — CRITICAL for AI

Every `block-*` domain default-exports this object:
```js
{
  type: string,           // unique key, e.g. 'text'
  label: string,          // palette label
  icon: string,           // palette icon character
  defaults: object,       // initial props on drop
  Block: Component,       // rendered on canvas — draggable, sets componentId on dataTransfer
  Fields: Component,      // rendered in properties panel — props: { props, onChange }
}
```

To add a new block: create `src/domains/block-<name>/`, implement the contract, then add to `BLOCKS` array in `EditorPage.jsx`. No other files change.

## Testing

- **Framework**: Playwright e2e tests in `tests/*.spec.js`
- **Run tests**: `npx playwright test`
- **Config**: `playwright.config.js` (baseURL: `http://localhost:5173`)
- When modifying `src/`, always update or create corresponding tests in `tests/`
- Test names in English: `"should [expected action]"`
- Use `data-testid` for selectors, include `waitForTimeout(400)` between form actions

## Code Style

- Functional React components only
- English for UI text and code
- CSS files per page in `src/pages/`
