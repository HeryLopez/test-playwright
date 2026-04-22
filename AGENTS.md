# AGENTS.md

## Project Overview

React app with Vite + React Router. Form that submits data and displays it on a results page.

## Structure

- `src/pages/` — React page components (FormPage, ResultPage)
- `src/App.jsx` — Route definitions
- `tests/*.spec.js` — Playwright e2e tests
- `playwright.config.js` — Playwright configuration

## Rules

### Testing (mandatory)

- When modifying any file in `src/`, you MUST update or create corresponding Playwright e2e tests in `tests/`
- New pages or routes → add tests covering navigation and content verification
- Changed form fields → update selectors and assertions in affected tests
- Removed features → remove or update tests that cover them
- Run `npx playwright test` to verify all tests pass before finishing

### Test Conventions

- Test names in Spanish: `"debe [expected action]"`
- Use `data-testid` attributes for element selection when available
- Fall back to `#id`, `label`, or role-based selectors
- Include `page.waitForTimeout(DELAY)` between form interactions (DELAY = 400ms) for headed mode visibility
- Verify navigation with `toHaveURL()` after route changes
- Assert content with `toHaveText()` or `toBeVisible()`

### Code Conventions

- Functional components only
- React Router for navigation, pass data via `useNavigate` state
- CSS modules per page in `src/pages/`
- Spanish for user-facing text, English for code
