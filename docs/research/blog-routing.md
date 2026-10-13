# Research: real `/blog/<slug>` URLs with per-Post previews on GitHub Pages

Ticket: #49 (map: #48). Researched 2026-10-13.

## Question

How should this Vite + React 19 SPA (currently `HashRouter`, deployed to GitHub Pages at arendpeter.com via `peaceiris/actions-gh-pages`, with `dist/index.html` copied to `dist/404.html`) serve real `/blog/<slug>` URLs, so that each Post's `<title>`, description and Open Graph tags are visible to link-preview crawlers (LinkedIn, Slack, X) and search engines?

## TL;DR / recommendation

1. **Recommended: switch to `BrowserRouter`, keep the SPA, and add a small build step that writes one static `dist/blog/<slug>/index.html` per Post.** Each file is the built `index.html` with that Post's `<title>`, description, OG/Twitter tags and pre-rendered article HTML injected. The step can be a tiny Vite plugin or a post-build script next to the existing `cp` step. Markdown becomes HTML at build time. Migration cost: **small** (about a day). It touches the router, `scroll.ts`, the build script and one new pipeline module, and it doesn't add a framework.
2. **Viable, heavier: React Router framework mode with `ssr: false` + `prerender`** for `/blog/*`. This is the officially supported route, but it means restructuring the app (`root.tsx` replaces `index.html`, `routes.ts`, route modules, `react-router build` writing to `build/client`). The repo also has to pick between staying on v7 and moving to v8 (npm `latest` is now 8.4.0). Migration cost: **medium** (2–3 days). It's worth it only if you want framework features later.
3. **Not sufficient alone: the `404.html` SPA-redirect trick.** It makes `/blog/<slug>` *work in a browser*, but every such URL answers with **HTTP 404 and the generic `index.html` head**. Crawlers never see per-Post tags, and Google ignores 4xx content. It's still useful as the fallback for non-blog routes such as `/stylebook`.
4. **Rejected: `vite-react-ssg`.** Its peer dependency is `react-router-dom ^6.14.1`, and its own README tells React Router v7 users to use RR's built-in SSG instead.

Prerender **only `/blog/*`** and leave the homepage and `/stylebook` client-rendered. Both still benefit from moving off `HashRouter`.

## Facts established

### What GitHub Pages actually serves (verified with `curl`, 2026-10-13)

- `https://arendpeter.com/blog/test-post` returns **`404`**, with the body of `dist/404.html` (a copy of `index.html`, `<title>Arend Peter</title>`, no description or OG tags). The current `/stylebook` path behaves the same way. Today `/stylebook` only "works" as `/#/stylebook`.
- GitHub Pages serves `dir/index.html` for `dir/`, and **301-redirects `dir` to `dir/`**. For example, `https://pages.github.com/versions` returns `301 Location: …/versions/`, and the trailing-slash URL returns 200. Emitting `blog/<slug>/index.html` therefore gives canonical URLs of `/blog/<slug>/`. Use that form in `og:url`, `<link rel=canonical>`, RSS and internal links to avoid the redirect hop.
- GitHub Pages also serves `foo.html` at the extensionless URL `foo` with a 200 (`https://pages.github.com/index` → 200). Emitting `blog/<slug>.html` would give slash-less `/blog/<slug>` URLs. This is observed server behaviour, not something the docs state; verify it on arendpeter.com before relying on it.
- GitHub Pages has no rewrite rules. The only hook for unknown paths is a custom `404.html` ([GitHub docs: custom 404 page](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-custom-404-page-for-your-github-pages-site)), and the docs don't state its status code (the curl result above shows it is 404).

### What crawlers need

- Open Graph tags are `<meta property="og:…" content="…">` elements in the document `<head>`. The required ones are `og:title`, `og:type`, `og:image` and `og:url` ([ogp.me](https://ogp.me/)).
- LinkedIn requires `og:title`, `og:image`, `og:description` and `og:url`, and says "the source code on your site" must comply with OGP. Images should be at least 1200×627 at a 1.91:1 ratio, under 5 MB ([LinkedIn Help a521928](https://www.linkedin.com/help/linkedin/answer/a521928)).
- Slackbot-LinkExpanding uses HTTP Range headers to fetch "as little of the page as it can" to extract oEmbed, Twitter Card and OG meta tags ([Slack: robots](https://api.slack.com/robots)). It reads a byte range of the raw HTML, so tags injected by JavaScript can't be seen. (X's card docs at developer.x.com returned HTTP 402 to the fetcher and could not be checked directly. X Cards use the same `twitter:*` / `og:*` meta-in-HTML model.)
- The prior art shows the failure mode. Equal-Vote/alaska-rcv `public/index.html` sets `og:image` from an inline `<script>` based on `location.pathname`. A non-JS crawler never sees that tag.
- Google renders JS, but:
  - "Google doesn't index URLs that return a `4xx` status code" and "Any content Google receives from URLs that return a `4xx` status code is ignored" ([Google: HTTP status codes](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)). A page served through `404.html` can't be indexed, however good its JS-set `<title>` is.
  - "don't use fragments to load different page content", so use the History API ([Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)). `HashRouter` URLs are invisible as distinct pages.

### The 404.html SPA-redirect trick (rafgraph/spa-github-pages, as used in alaska-rcv)

- How it works: `404.html` rewrites `/one/two?a=b` to `/?/one/two&a=b` and redirects. A script in `index.html` then restores the path with `history.replaceState` ([rafgraph/spa-github-pages README](https://github.com/rafgraph/spa-github-pages); the copies are in alaska-rcv `public/404.html` and `public/index.html`).
- The README itself says "Around 2019 Google changed their algorithm and no longer follows redirects in `404.html`." For sites where search matters it suggests a static site generator that generates "an `html` file for each page" instead.
- alaska-rcv has since moved hosting to a Docker image served by `serve` (its `Dockerfile`, added 2025-12, and the argocd deploy in `.github/workflows/build-push-deploy.yml`). The GitHub Pages scripts are still present but aren't load-bearing any more, so the repo isn't evidence that the trick is sufficient.
- **For this repo the redirect half is unnecessary.** `npm run build` already copies `index.html` to `404.html`. GitHub Pages serves that body *at the original URL*, so a `BrowserRouter` app reads the real `location.pathname` and routes correctly with no `?/` round-trip. The only defect is the 404 status and generic head, which no client-side trick can fix. Conclusion: keep the plain `404.html` copy as the SPA fallback for non-prerendered routes, and don't adopt the rafgraph redirect.

### React Router v7/v8 framework mode prerendering

- `prerender` lives in `react-router.config.ts`. `prerender: true` skips dynamic paths ("will not include any dynamic paths (i.e., `/blog/:slug`)"), so slugs are listed explicitly, e.g. `prerender: ["/", ...slugs.map(s => \`/blog/${s}\`)]` or `async prerender({ getStaticPaths })` ([RR: Pre-Rendering](https://reactrouter.com/how-to/pre-rendering)).
- `ssr: false` + `prerender` = static hosting. Output goes to `build/client/blog/<slug>/index.html` plus `blog/<slug>.data` for client navigations. Prerendered routes may have `loader`s, which run at build time ("the build creates a `new Request()` and runs it through your app"). Loaders on non-prerendered routes are allowed only in the root (SPA mode) ([RR: Pre-Rendering](https://reactrouter.com/how-to/pre-rendering), [RR: SPA mode](https://reactrouter.com/how-to/spa)).
- Paths that aren't prerendered are served from a "SPA Fallback". This is `build/client/__spa-fallback.html` if `/` is prerendered and `index.html` otherwise. The host must rewrite unknown paths to it. On GitHub Pages that means copying it to `404.html`, which reproduces the 404-status caveat for those routes ([RR: Pre-Rendering](https://reactrouter.com/how-to/pre-rendering)).
- Per-route head: a route module exports `meta()` returning descriptors (`{ title }`, `{ name, content }`, `{ tagName: "link", rel: "canonical" }`), rendered by `<Meta />` in `root.tsx` ([RR: Meta how-to](https://reactrouter.com/how-to/meta)). `Meta`, `Links`, `Scripts` and static rendering are Framework-mode-only ([RR: Picking a mode](https://reactrouter.com/start/modes)).
- Root is always server-rendered at build time, even with `ssr:false`. Routes "need to be SSR-safe… you can't call `window` or other browser-only APIs during the initial render" ([RR: SPA mode](https://reactrouter.com/how-to/spa)). **In this repo `Stylebook.tsx` calls `getComputedStyle(document.documentElement)` during render (`getCssVar`, line ~83).** It must be guarded if `/stylebook` is ever prerendered. It's fine if it stays client-only under the fallback.
- Adoption steps from the official guide: install `@react-router/dev` (+ `@react-router/node`), add the `reactRouter()` Vite plugin, add `react-router.config.ts` (`appDirectory: "src"`, `ssr: false`), **move `index.html` markup into `src/root.tsx` and delete `index.html`**, move routes into `src/routes.ts` with route modules, use `react-router dev/build` scripts and add `.react-router/` to `.gitignore`. Prerequisites are Node 22.22+ and Vite 7+ ([RR: Adopting framework mode](https://reactrouter.com/upgrading/router-provider)). The repo's `.nvmrc` is `24` and Vite is `^7.1.7`, so both are satisfied.
- Versions (npm, 2026-10-13): `react-router` `latest` = 8.4.0, `version-7` = 7.18.4. The repo is on `react-router-dom ^7.18.0`. Framework mode works on 7.18, but the docs now track v8, so adoption probably pulls in a major upgrade too.

### vite-react-ssg

- It needs data routes (`ViteReactSSG({ routes })`) and `getStaticPaths` on dynamic routes. Head is managed with `<Head>`, which wraps React Helmet. `dirStyle` is `flat` (`/foo.html`) or `nested` (`/foo/index.html`) ([vite-react-ssg README](https://github.com/Daydreamer-riri/vite-react-ssg)).
- **Blocker:** npm `vite-react-ssg@0.9.2` has peer `react-router-dom: ^6.14.1`. The README's "React Router v7 Notice" says: "If you are using React Router v7, we recommend using its official SSG capabilities." That would mean downgrading the router, so it's not viable here.

### Custom Vite plugin / post-build script

- Vite documents pre-rendering as a form of SSG that reuses SSR logic: build an SSR entry with `vite build --ssr src/entry-server.tsx`, then a script imports it and writes HTML per route. The docs point to a demo `prerender.js` ([Vite: SSR guide, Pre-Rendering / SSG](https://vite.dev/guide/ssr)).
- A plugin can write arbitrary files into the bundle with `this.emitFile({ type: 'asset', fileName: 'blog/<slug>/index.html', source })`. A `fileName` "will be used unmodified as the name of the generated file" ([Rollup: this.emitFile](https://rollupjs.org/plugin-development/#this-emitfile); Vite plugins are Rollup plugins, [Vite: Plugin API](https://vite.dev/guide/api-plugin)). `transformIndexHtml` is the hook for transforming `index.html`.

## Options compared

| | A. SPA + per-Post static HTML (custom step) | B. RR framework mode `ssr:false` + `prerender` | C. 404.html trick only |
|---|---|---|---|
| Crawler sees per-Post title/desc/OG | Yes (static HTML, 200) | Yes (static HTML, 200) | **No** (404, generic head) |
| Google indexes Posts | Yes | Yes | **No** (4xx ignored) |
| Router change | `HashRouter` → `BrowserRouter` | → framework mode (`HydratedRouter`, `routes.ts`, `root.tsx`) | `HashRouter` → `BrowserRouter` |
| New deps | Markdown toolchain only (e.g. unified/remark/rehype + a highlighter) | `@react-router/dev`, `@react-router/node` (+ likely v8 upgrade) and the Markdown toolchain | none |
| Build/deploy changes | one plugin or `postbuild` script; `dist/` unchanged | `react-router build`; publish `build/client`; copy `__spa-fallback.html` → `404.html` | none |
| `index.html` | kept | deleted (becomes `root.tsx`) | kept |
| Prerendered page body | article HTML from build-time Markdown (optionally full React SSR via a Vite `--ssr` entry) | full React render of the route | none |
| Migration cost | **Small** (~1 day) | **Medium** (2–3 days + v8 upgrade risk) | Trivial, but doesn't meet the goal |

### Prerender `/blog/*` only vs. whole site

- **Blog only (recommended).** Blog Posts are the only pages that need distinct previews, and the homepage already has one fixed head that can be made static in `index.html`. Prerendering the homepage brings in SSR-safety work: `react-github-calendar`, `IntersectionObserver` hooks, `matchMedia`-based **Centered** logic and `Stylebook`'s `getComputedStyle` would all need auditing for build-time render. It also forces hydration (`hydrateRoot`) with mismatch risk, and buys nothing that matters to the stated goals.
- **Whole site.** Only option B makes this cheap structurally, and it still needs the SSR audit above. Revisit if homepage SEO becomes a goal.
- In option A, the homepage's preview tags can simply be hard-coded in `index.html` (they are the same on every build). `/stylebook` stays client-rendered via the `404.html` fallback (status 404, which is *desirable* for an internal page). Alternatively, emit a plain copy at `dist/stylebook/index.html` to get a 200.

### Effects on homepage anchors, scroll behaviour and `/stylebook`

- `src/utils/scroll.ts` says: "HashRouter owns the URL hash for routing, so plain #fragment hrefs break navigation." `Nav` and `HomePage` therefore `preventDefault()` on `#portfolio`, `#experience` and similar links and smooth-scroll manually. With `BrowserRouter` (A, C) or framework mode (B), **the hash is freed**. The existing interception keeps working unchanged, and you could later allow the fragment into the URL (shareable `arendpeter.com/#experience`) by not calling `preventDefault`, or by calling `history.replaceState` after scrolling. Either way this is not a blocker.
- `Nav`'s site-name link is `href="/"`. Under `BrowserRouter` this does a full page load. Optionally switch it to `<Link to="/">`. On a Post page the homepage section links (`#portfolio` and so on) must become `/#portfolio`, because the targets don't exist there. Since the blog is unlisted with no nav link, the Post layout can use a minimal header instead of the homepage `Nav`.
- Existing `/#/stylebook` bookmarks break. Add a one-line client shim (`if (location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1))`) before rendering, or accept the break, since it's an internal page.
- Option B adds `<ScrollRestoration />` in `root.tsx`, which manages scroll on navigation. Check that it doesn't fight the custom `smoothScrollTo` on same-page fragment clicks. It shouldn't, because those clicks `preventDefault` and never navigate.

### What each option implies for the Markdown pipeline

- **A.** Markdown → HTML **at build time** in Node: parse front-matter (title, description, date, image, slug), render the body to HTML and syntax-highlight code at build time, so no highlighter ships to the browser. The same module feeds three places:
  1. The static `blog/<slug>/index.html`: head tags plus the article HTML inside `#root`, which crawlers and no-JS readers see.
  2. The client bundle, via a virtual module or `import.meta.glob('/posts/*.md')` with a transform that exports `{ meta, html }`, so in-app navigation and the React Post page render the same HTML (`dangerouslySetInnerHTML` is acceptable because the content is the author's own).
  3. Later: the RSS feed, sitemap, and the per-Post feedback-widget slot keyed by slug.

  If the static body is the same HTML React will render, use `createRoot` (as today, replacing the content) rather than hydration, which avoids mismatch concerns entirely.
- **B.** The same build-time Markdown module, but called from the Post route's `loader`. React Router runs it at build time per prerendered path and serialises the result to `blog/<slug>.data`. `meta({ loaderData })` produces the head tags. The pipeline is the same work. B adds only RR's plumbing around it.
- **C.** Markdown could be fetched and rendered at runtime, but none of it reaches crawlers. Rendering at runtime also ships a Markdown parser and highlighter to every reader.

## Suggested shape for option A (for the spec)

1. `App.tsx`: `HashRouter` → `BrowserRouter`. Add a route `/blog/:slug` → `BlogPost`. Add the `#/` → path shim in `main.tsx`.
2. `src/blog/` (or `posts/` at repo root): the Markdown files, plus a pure `loadPosts()` that returns `{ slug, meta, html }[]`. It's pure Node and unit-testable.
3. `vite-plugin-blog` (in `vite.config.ts` or `scripts/`). It provides a virtual module `virtual:posts` for the client, and in `generateBundle` (or `closeBundle`) takes the final `index.html` and, for each Post, injects `<title>`, `meta[name=description]`, `og:*`, `twitter:card`, `link[rel=canonical]` (trailing-slash form) and the article HTML, then emits `blog/<slug>/index.html`.
4. Keep `cp dist/index.html dist/404.html` as the SPA fallback. Update ADR 0002 (stale `/portfolio/` base) and record the routing decision as a new ADR.
5. Optional upgrade path: replace the "inject article HTML" step with a real `renderToString(<BlogPost/>)` through a Vite `--ssr` entry, if the static body should match the React layout exactly. Option B remains available later if more framework features are wanted.

## Open questions for the map

- Trailing-slash URLs (`/blog/<slug>/`, from `index.html` in a directory) or slash-less (`/blog/<slug>`, from `<slug>.html`, which relies on GitHub Pages' observed extensionless serving)?
- Per-Post `og:image`: one site-wide default image, a front-matter image, or generated cards? This affects LinkedIn's 1200×627 requirement.
- Should `/blog` (an index of Posts) exist while the blog is unlisted? If it does, it is another static page to emit.
