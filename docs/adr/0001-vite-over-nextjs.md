# Vite over Next.js

This is a purely static frontend with no server-side concerns, deployed to GitHub Pages which cannot run server code. Next.js's value is almost entirely server-side (SSR, ISR, server components), and its static export mode has known edge cases around image optimization, middleware, and routing that don't translate cleanly to static files. Vite gives a faster dev server, a simpler mental model, and no unused concepts — it's the right tool for a static site with no backend.

## Considered Options

- **Next.js (static export)** — rejected because GitHub Pages can't run server code, and the static export path has friction that Vite avoids entirely. Would only be worth it if server-side features were anticipated.
- **Create React App** — deprecated upstream, excluded without consideration.
