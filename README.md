# Contact Form App

React + Vite application with React Router. A form collects user data and displays it on a results page.

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

```
src/
├── domains/                  # One folder per bounded context
│   └── contact/              # "Contact" domain example
│       ├── components/       # UI components owned by this domain
│       │   ├── ContactForm.jsx
│       │   └── ContactForm.css
│       ├── hooks/            # Use cases — orchestrate state + services
│       │   └── useContactForm.js
│       ├── services/         # Side effects (API, storage, etc.)
│       │   └── contactService.js
│       ├── models/           # Data shapes, constants, validation schemas
│       │   └── contactModel.js
│       └── index.js          # Public API — only export what other domains need
│
├── pages/                    # Route entry points (thin orchestrators)
│   ├── FormPage.jsx
│   ├── FormPage.css
│   ├── ResultPage.jsx
│   └── ResultPage.css
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

