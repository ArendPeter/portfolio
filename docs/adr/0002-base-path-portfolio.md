# Base path set to /portfolio/ for GitHub Pages

The site is deployed to GitHub Pages as a project repo (not a user/org site), which serves from `github.io/<repo-name>` rather than root. Vite's `base` config is set to `/portfolio/` to match. The eventual target is a custom domain (arendpeter.com) which will serve from `/`, at which point this config should be changed to `base: '/'` and a `CNAME` file added to the deploy step.
