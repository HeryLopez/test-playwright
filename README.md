# Home Editor

**Proof of Concept — Vibe Coding + UI Test Verification**

This project explores how far AI-assisted development (vibe coding) can go when paired with a structured testing strategy. The goal is to validate that e2e tests can reliably cover a **complex, interaction-heavy UI** — specifically a drag-and-drop page editor — where actions like dragging blocks onto a canvas, reordering, selecting, and editing properties are difficult to verify through code review alone.

The answer this POC proposes: record the Playwright test runs as videos and attach them to the merge request. Reviewers can watch the editor behave correctly without running the suite themselves, making it practical to ship AI-generated features with confidence.

The editor itself is a React + Vite app with React Router. Users build page layouts by dragging block components onto a canvas, configuring properties via a side panel, and previewing the result.


| Editor | Preview |
|--------|---------|
| <img alt="Editor" src="https://github.com/user-attachments/assets/1da0f888-2c2d-415f-92f3-de60f723732f" /> | <img alt="Preview" src="https://github.com/user-attachments/assets/a5e1b053-c9ac-496e-927e-30e63c4b2580" /> |

---


## Architecture: Domain-Driven Design (DDD)

This project is structured following **Domain-Driven Design** principles adapted for a React frontend. The goal is to keep business logic isolated per domain, making it easy to scale and reason about each feature independently.

> The instructions in `AGENTS.md` and `.github/copilot-instructions.md` are intentionally written so that AI agents (GitHub Copilot, etc.) can generate new features while respecting these DDD boundaries automatically.

### Core ideas

| Concept | Meaning in this project |
|---|---|
| **Bounded Context** | A `src/domains/<name>/` folder. Each domain owns its models, logic and UI. |
| **Model** | Data shapes and validation rules for a domain entity. |
| **Service** | Side effects: API calls, localStorage, external integrations. |
| **Hook (Use Case)** | A React hook that orchestrates a service + local state. The "application layer". |
| **Component** | Pure UI — receives data via props or domain hooks, no business logic. |
| **Page** | Thin route-level component. Composes domain components; contains no logic. |
| **Shared** | Generic utilities and UI primitives with no domain knowledge. |

---

## Folder Structure

Each domain folder follows this internal structure:

```
domains/<name>/
├── models/       # Data shapes, constants, validation
├── services/     # Side effects: API calls, localStorage, external integrations
├── hooks/        # Use cases — orchestrate service + state
├── components/   # UI components owned by this domain
└── index.js      # Public API — only export what other domains need
```

```
src/
├── domains/
│   ├── canvas/               # Canvas state (useCanvas) + Canvas component
│   ├── palette/              # Left panel — draggable block items
│   ├── properties/           # Right panel — properties inspector
│   ├── block-text/           # Text block: model, Block, Fields, contract
│   ├── block-button/         # Button block
│   ├── block-image/          # Image block
│   ├── block-spacer/         # Spacer block
│   ├── block-carousel/       # Carousel block
│   ├── editor/               # Editor orchestration (header, IO, state)
│   ├── editor-io/            # Import / export logic
│   ├── preview/              # Preview page rendering
│   └── site-scraper/         # Site scraping app (screenshots, HTML, metadata)
│
├── pages/                    # Route entry points (thin orchestrators)
│   ├── EditorPage.jsx
│   ├── PreviewPage.jsx
│   └── ScrapingPage.jsx      # Scraper UI
│
├── shared/                   # Cross-domain utilities and UI primitives
│   ├── components/
│   │   └── BurgerMenu/       # Navigation menu
│   ├── hooks/
│   └── utils/
│
├── App.jsx                   # Route definitions (/,  /preview, /scraping)
└── main.jsx

server.mjs                     # Express API for Playwright screenshots
public/
└── scraping-reports/          # Generated reports (screenshots + HTML)

tests/
├── form.spec.js               # Editor e2e tests
└── scraping.spec.js           # Scraper e2e tests
```

---

## Rules for Adding a New Feature

1. **Identify the domain** — does it belong to an existing domain or does it need a new `src/domains/<name>/` folder?
2. **Define the model** — add data shapes and constants in `domains/<domain>/models/`.
3. **Write the service** — add API calls or side effects in `domains/<domain>/services/`.
4. **Create the hook** — orchestrate service + state in `domains/<domain>/hooks/`.
5. **Build the component** — render in `domains/<domain>/components/`, keep it logic-free.
6. **Export the public surface** — only expose what other domains or pages need via `domains/<domain>/index.js`.
7. **Wire it in a page** — import from the domain index and place it in `src/pages/`.
8. **Write e2e tests** — add or update `tests/*.spec.js` to cover the new behaviour.

---

## Site Scraper — Website Analysis Tool

This project includes a **site scraping application** for analyzing existing websites and extracting their design resources. The scraper captures real screenshots, HTML structure, metadata, and page elements for future migration or design analysis.

**Key capabilities:**
- 📸 **Real Screenshots**: Uses Playwright to capture actual rendered pages (full-page, viewport, desktop, mobile)
- 📄 **HTML Capture**: Saves complete rendered HTML for AI analysis and structure understanding
- 📊 **Metadata Extraction**: Extracts page title, description, language, OpenGraph tags, charset
- 🏗️ **DOM Analysis**: Provides statistics on page structure (elements, headers, images, links, forms)
- 🎨 **Resource Detection**: Identifies images, colors, texts, and UI components
- 🚫 **Smart Popup Handling**: Automatically closes cookie banners, age verification, and modal overlays
- 📅 **Auto-fill Forms**: Handles date inputs for age gates automatically

### How to Use

1. **Start both servers**:
   ```bash
   npm run dev        # Frontend on http://localhost:5173
   npm run dev:api    # Screenshot API on http://localhost:3001
   # Or both at once:
   npm run dev:all
   ```

2. **Access the scraper**: Navigate to the burger menu (top-left) → **Scraping**

3. **Enter a URL** and click "🚀 Analyze Site"

4. **Review the report**: View real screenshots, metadata, DOM structure, and extracted resources

### Report Contents

Each scraping session generates:
- **4 Real Screenshots**: full-page, viewport (hero), desktop (1440x900), mobile (375x812)
- **HTML File**: Complete rendered HTML with JavaScript executed
- **Metadata**: Title, description, language, OpenGraph tags
- **DOM Structure**: Element counts (headers, images, links, buttons, forms)
- **Resources**: Images, colors, text content categorized by importance

All files are saved to `public/scraping-reports/{timestamp}/` and accessible via the UI.

**For complete setup and API documentation, see:**  
📖 **[SCRAPER.md](./SCRAPER.md)** — User guide  
📖 **[SCREENSHOT_API.md](./SCREENSHOT_API.md)** — Backend setup and API reference

---

## UI Testing Workflow — Video Verification

The project uses a **video-based verification workflow** to catch visual regressions and confirm that components behave as expected after changes.

### Automated (default)

The workflow is automated via `.github/workflows/playwright.yml`. On every push or pull request to `main`:

1. **GitHub Actions runs the full Playwright suite** on a fresh Ubuntu environment.
2. **A summary comment is automatically posted on the PR** — with a table showing passed/failed/skipped tests and individual test durations.
3. **The full HTML report and all recorded videos** are uploaded as artifacts attached to the Actions run, accessible directly from the PR.
4. **The comment is sticky** — it updates in place on each new push to the same PR instead of creating a new comment every time.

Reviewers get evidence-based verification of every change without leaving the PR. If a component breaks, the failing test, its duration, and the recorded video are immediately visible in the artifacts.

<img width="875" alt="PR comment with test results" src="https://github.com/user-attachments/assets/f37fbb96-b775-4f82-ba7b-a582e9182bf1" />


### Manually (local)

To run and review tests locally before pushing:

1. Run the tests: `npx playwright test`.
2. Open the HTML report in your browser: `npx playwright show-report`.
3. The report includes each test result, duration, failure traces, and the recorded `.webm` video inline — playable directly in the browser.

---

## UI Tests — Home Page Example

Example video generated by the Playwright test suite (`tests/form.spec.js`) as part of a merge request, showing the editor flow working correctly end to end.

[github-video/home-test.webm](https://github.com/user-attachments/assets/e50123d0-85cb-4d38-8e92-0d20be5f7814)

---

## Getting Started

### Editor Only
```bash
npm install
npm run dev              # Start dev server at http://localhost:5173
npx playwright test      # Run e2e tests
```

### With Site Scraper
```bash
npm install
npm run dev:all          # Start both frontend + screenshot API
# Or separately:
npm run dev              # Frontend at http://localhost:5173
npm run dev:api          # Screenshot API at http://localhost:3001
```

Access the scraper via the burger menu → **Scraping**

---

## Tech Stack

### Frontend
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Playwright](https://playwright.dev/) for e2e testing

### Backend (Scraper API)
- [Express](https://expressjs.com/) — REST API server
- [Playwright](https://playwright.dev/) — Headless browser for real screenshots
- [CORS](https://www.npmjs.com/package/cors) — Frontend-backend communication

