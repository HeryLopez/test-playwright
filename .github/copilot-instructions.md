## Project

React + Vite app with React Router. Form submits data and displays on results page.

## Testing

- **Framework**: Playwright e2e tests in `tests/*.spec.js`
- **Run tests**: `npx playwright test`
- **Config**: `playwright.config.js` (baseURL: `http://localhost:5173`)
- When modifying `src/`, always update or create corresponding tests in `tests/`
- Test names in Spanish: `"debe [acción esperada]"`
- Use `data-testid` for selectors, include `waitForTimeout(400)` between form actions

## Code Style

- Functional React components only
- Spanish for UI text, English for code
- CSS files per page in `src/pages/`
