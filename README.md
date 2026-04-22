# Home Editor

**Proof of Concept — Vibe Coding + UI Test Verification**

This project explores how far AI-assisted development (vibe coding) can go when paired with a structured testing strategy. The goal is to validate that e2e tests can reliably cover a **complex, interaction-heavy UI** — specifically a drag-and-drop page editor — where actions like dragging blocks onto a canvas, reordering, selecting, and editing properties are difficult to verify through code review alone.

The answer this POC proposes: record the Playwright test runs as videos and attach them to the merge request. Reviewers can watch the editor behave correctly without running the suite themselves, making it practical to ship AI-generated features with confidence.

The editor itself is a React + Vite app with React Router. Users build page layouts by dragging block components onto a canvas, configuring properties via a side panel, and previewing the result.

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
│   └── preview/              # Preview page rendering
│
├── pages/                    # Route entry points (thin orchestrators)
│   ├── EditorPage.jsx
│   └── PreviewPage.jsx
│
├── shared/                   # Cross-domain utilities and UI primitives
│   ├── components/
│   ├── hooks/
│   └── utils/
│
├── App.jsx                   # Route definitions only
└── main.jsx

tests/
└── *.spec.js                 # Playwright e2e tests (one file per domain/feature)
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

## UI Testing Workflow — Video Verification

The project uses a **video-based verification workflow** to catch visual regressions and confirm that components behave as expected after changes.

### How it works

1. **Write a Playwright test** that exercises the feature or component (drag, click, fill, navigate).
2. **Run the tests with video recording enabled** — Playwright can record a `.webm` video of every test run.
3. **Review the recorded video** to visually confirm the UI behaves correctly — no broken layouts, missing blocks, or unexpected states.
4. **Attach the video to the PR** (store it in `github-video/`) so reviewers can watch the test execution without running the suite themselves.
5. **Check the Playwright HTML report** (`playwright-report/index.html`) for a full summary of passed/failed tests, timings, and embedded screenshots.

This workflow means every reviewer can verify component integrity through recorded evidence rather than relying solely on CI pass/fail status. It also makes regressions immediately visible: if a component is broken after a change, the video will show the failure in context.

---

## UI Tests — Home Page Example

Example video generated by the Playwright test suite (`tests/form.spec.js`) as part of a merge request, showing the editor flow working correctly end to end.

[github-video/home-test.webm](https://github.com/user-attachments/assets/e50123d0-85cb-4d38-8e92-0d20be5f7814)

### Playwright HTML Report

After running the tests, open `playwright-report/index.html` in a browser to inspect the full test report, including individual test results, durations, failure traces, and screenshots captured at the point of failure.

```bash
npx playwright show-report   # opens the HTML report in your default browser
```

---

## Getting Started

```bash
npm install
npm run dev        # Start dev server at http://localhost:5173
npx playwright test  # Run e2e tests
```

---

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Playwright](https://playwright.dev/) for e2e testing

