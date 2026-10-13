# Base path set to /portfolio/ for GitHub Pages

**Status: superseded.** The custom domain (arendpeter.com) is live and Vite's `base` is now `/`. Routing is covered by [0003](0003-browserrouter-with-static-post-pages.md).

The site is deployed to GitHub Pages as a project repo (not a user/org site), which serves from `github.io/<repo-name>` rather than root. Vite's `base` config is set to `/portfolio/` to match. The eventual target is a custom domain (arendpeter.com) which will serve from `/`, at which point this config should be changed to `base: '/'` and a `CNAME` file added to the deploy step.
