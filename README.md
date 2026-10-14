# Arend Peter Castelein — Portfolio Site

Personal portfolio and blog for [arendpeter.com](https://arendpeter.com), built with React + Vite and deployed to GitHub Pages.

## Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Bundler | Vite 7 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v7 |
| Testing | Vitest + Testing Library (jsdom) |
| Deployment | GitHub Pages (via `peaceiris/actions-gh-pages`) |

## Getting started

Requires Node 24 (see `.nvmrc`).

```bash
npm install
npm run dev      # start dev server at http://localhost:5173
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript compile + Vite build + copy `dist/index.html` → `dist/404.html` |
| `npm run preview` | Serve the production build locally |
| `npm run test` | Run all tests with Vitest |
| `npm run typecheck` | TypeScript type-check without emitting |
| `npm run lint` | ESLint |
| `npm run format` | Prettier (writes in place) |
| `npm run sandcastle` | Run the Sandcastle AI agent harness |

## Project structure

```
src/
  components/    # Shared UI components (Button, Nav, ProjectCard, InlineLink, …)
  pages/         # Page-level components (HomePage, Stylebook)
  hooks/         # Custom React hooks (useActiveSection, useCardActive, useCardMedia)
  utils/         # Pure utilities (scroll, parseDescriptionLinks, utils)
  App.tsx        # Root router
  main.tsx       # Entry point
docs/
  adr/           # Architecture Decision Records
public/          # Static assets (images, videos, resume PDF)
```

## Testing

Tests live next to the files they cover (`Foo.test.tsx` beside `Foo.tsx`). Run them:

```bash
npm run test
```

The test environment is jsdom. A global setup file lives at `src/test-setup.ts` (imports `@testing-library/jest-dom`).

## Pre-commit hooks

Husky runs lint-staged on every commit:

- `*.{ts,tsx}` — ESLint fix + Prettier
- `*.{css,json}` — Prettier

To skip in an emergency: `git commit --no-verify` (avoid this).

## Deployment

Pushing to `main` triggers the GitHub Actions workflow (`.github/workflows/`), which:

1. Installs, lints, typechecks, and builds the project.
2. Publishes `./dist` to the `gh-pages` branch via `peaceiris/actions-gh-pages`.
3. Sets the CNAME to `arendpeter.com`.

The `build` script copies `dist/index.html` → `dist/404.html` so GitHub Pages serves the SPA fallback for unknown paths.

> **ITAR note:** GitHub Pages is a US-based service subject to US export controls. Content is public and globally accessible; do not host ITAR-controlled material here.

## Architecture decisions

See [`docs/adr/`](docs/adr/) for recorded decisions:

- [0001 — Vite over Next.js](docs/adr/0001-vite-over-nextjs.md)
- [0002 — Base path for GitHub Pages](docs/adr/0002-base-path-portfolio.md) *(superseded)*
- [0003 — BrowserRouter with build-time static blog pages](docs/adr/0003-browserrouter-with-static-post-pages.md)

## Domain language

Key terms used throughout the codebase (full glossary in [`CONTEXT.md`](CONTEXT.md)):

- **Post** — a single published blog entry (Markdown).
- **Blog Index** — the page listing all Posts.
- **Vault** — Arend's private Obsidian drafts; only copied-out notes become Posts.
- **Description** — the prose blurb on a `ProjectCard` (was `hook` in early code).
- **Active** — a `ProjectCard`'s media state where its video crossfades over the screenshot and plays.
- **Hover / Centered** — the desktop and touch triggers for the Active state, respectively.
