# Swappable Homepage with stable page URLs

Each top-level page lives at its own permanent URL (`/blog` for the Blog Index, `/about` for the About Page), and `/` shows whichever one is currently the Homepage, rendered in place (no redirect). The Homepage's canonical URL is its permanent URL, so `/` is left out of the sitemap. This lets the Homepage change, e.g. when the site moved from portfolio-first to blog-first, without breaking any shared link.

There is no config flag. The choice is made in two places, each with a comment pointing to the other: the `/` route in `App.tsx` (what the browser renders) and one line in the posts plugin that copies that page's static HTML over `dist/index.html` (what crawlers and link previews see). The plugin also writes `about.html`, so `/about` answers HTTP 200 with its own head tags instead of the `404.html` fallback, and it now writes `404.html` from the bare SPA shell itself, before `index.html` is overwritten (previously a `cp` in the build script).

## Considered Options

- **A `homePage` config value read by both the router and the plugin**: one edit instead of two, but adds indirection for a change made perhaps once every few years. Rejected in favour of plain code edits.
- **Leaving `index.html` as the generic shell**: one edit, but link previews of `arendpeter.com` would show only the default title.
- **Redirecting `/` to the Homepage's permanent URL**: GitHub Pages can't issue HTTP redirects, and a client-side redirect changes the URL people see.
