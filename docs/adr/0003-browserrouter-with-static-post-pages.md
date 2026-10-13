# BrowserRouter with build-time static Post pages

Blog Posts need real URLs (`/blog/<slug>`) whose `<title>`, description and Open Graph tags are visible to link-preview crawlers and search engines. GitHub Pages can't run server code or rewrite paths, and its only hook for unknown paths is `404.html`, which is served with HTTP 404, so Google ignores it and crawlers see only the generic head. We therefore switch `HashRouter` → `BrowserRouter`, keep the SPA, and have a small in-repo Vite plugin write one static HTML file per Post at build time: `blog/<slug>.html` (served slash-less, since GitHub Pages serves `foo.html` at `/foo`, verified on arendpeter.com) with per-Post head tags and the article HTML in the body. React replaces that body with the full Post layout on load (no hydration). The Blog Index is emitted as both `blog.html` and `blog/index.html` until we see which one GitHub Pages serves for `/blog`. Only blog pages are static; the homepage and `/stylebook` stay client-rendered, with `404.html` kept as the SPA fallback. Old `/#/stylebook` links are allowed to break.

## Considered Options

- **React Router framework mode (`ssr: false` + `prerender`)** — officially supported, but restructures the app (`root.tsx` replaces `index.html`, `routes.ts`, new build output) and likely forces a v7 → v8 upgrade. Rejected for the larger change surface; still available later, since URLs and the Markdown pipeline carry over.
- **`404.html` SPA-redirect trick only** — works in a browser but every Post answers HTTP 404 with the generic head, so no previews and no indexing.
- **`vite-react-ssg`** — requires `react-router-dom` v6.
- **Trailing-slash URLs (`blog/<slug>/index.html`)** — documented GitHub Pages behaviour, but slash-less URLs were preferred; fall back to this if extensionless serving ever breaks.
- **Full React SSR of the Post page** — would make first paint match exactly, but every component would have to be render-safe at build time; head tags (what crawlers read) are the same either way.
