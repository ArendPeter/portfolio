# Research: Markdown pipeline and Obsidian-syntax support for Vite

Ticket: #50 (map: #48). Researched 2026-10-13. Package versions, publish dates and weekly downloads come from the npm registry API (`registry.npmjs.org`, `api.npmjs.org/downloads`) and the GitHub REST API on that date.

## TL;DR: recommended stack

| Concern                   | Pick                                                                                                                                                 | Why                                                                                                                                                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading `.md`             | **A small in-repo Vite plugin** (~50–80 lines) that turns `*.md` into a JS module (`{ frontmatter, html }`) by running unified in Node at build time | Avoids runtime parsing. `import.meta.glob(..., { query: '?raw' })` alone would ship the parser and Shiki to the browser. No maintained Vite plugin runs a remark/rehype chain for plain `.md` (see below). |
| Parser                    | `unified` + `remark-parse` + `remark-gfm` + `remark-rehype` + `rehype-stringify`                                                                     | The standard pipeline, with tens of millions of weekly downloads. Plugins for everything else hook into it.                                                                                                |
| Front matter              | `remark-frontmatter` + `vfile-matter` (uses the `yaml` package), validated with **zod** (already a dependency)                                       | `gray-matter` still works but hasn't had a release since 2021-04                                                                                                                                           |
| Code highlighting         | **`@shikijs/rehype`** (Shiki 4.5.0) with dual light/dark themes. Add `rehype-pretty-code` only if line highlighting or titles are wanted             | Highlighting happens at build time and outputs only inline styles and CSS variables, so there's no runtime JS                                                                                              |
| Wikilinks + `![[embeds]]` | **`@flowershow/remark-wiki-link`** v4, plus a ~15-line custom rehype step that unwraps unresolved links to plain text                                | Real micromark syntax extension. Supports `[[a\|b]]`, `#heading`, and image/video/pdf embeds. Marks unresolved links with a class.                                                                         |
| Callouts                  | **`rehype-callouts`** (Obsidian theme)                                                                                                               | Active, supports Obsidian types, folding (`<details>`, no JS), custom titles and nesting                                                                                                                   |
| Images                    | Rewrite relative `<img src>` into `import` statements inside the Vite plugin, so Vite hashes and emits them                                          | The asset pipeline only processes static imports. Raw Markdown strings are invisible to it.                                                                                                                |
| RSS                       | **`feed`** v6 (`feed.rss2()` / `atom1()`), emitted as `rss.xml` from the same Vite plugin's `generateBundle` hook via `this.emitFile`                | Maintained, small (`xml-js` is its only dependency), runs in Node at build time                                                                                                                            |

**Simplest alternative to all of the Obsidian plugins:** turn off Obsidian's **Use [[Wikilinks]]** setting and set attachments to **"Same folder as current file"**. Obsidian then writes standard Markdown links and images (`![](cover.png)`), and only callouts need a plugin. See the [Obsidian](#4-obsidian-syntax) section.

---

## 1. Loading `.md` at build time in Vite

### What Vite gives you

- `import.meta.glob` supports `eager`, `import: 'default'`, `base`, and a `query` option such as `'?raw'` or `'?url'`. Custom query objects are passed through for other plugins to read. ([Vite: Features, Glob Import](https://vite.dev/guide/features.html#glob-import))
- `?raw` imports a file as a string. ([Vite: Static Asset Handling](https://vite.dev/guide/assets.html))
- A plugin's `transform` hook can turn a custom file type into JS. Vite's docs include a "Transforming Custom File Types" example. ([Vite: Plugin API](https://vite.dev/guide/api-plugin.html))

### Option A: `import.meta.glob('/posts/*.md', { query: '?raw' })` + unified in app code

This works, but **the unified pipeline then runs in the browser**. The parser, all plugins and Shiki would ship in the client bundle. Shiki's own docs list `shiki/bundle/web` at 3.8 MB minified / 695 KB gzip, and `bundle/full` at 6.4 MB / 1.2 MB. ([Shiki: Bundles](https://shiki.style/guide/bundles)) **That rules out Option A** under the "no runtime markdown parsing" preference. Its only use is under a React Router prerender setup, where the parsing code runs only in the server build (see section 6).

### Option B: existing Vite markdown plugins

| Plugin                        | Engine                    | Last release                                                | Notes                                                                                                                                                                                                                                                                            |
| ----------------------------- | ------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vite-plugin-markdown` (hmsk) | markdown-it               | 2.2.0, 2024-01-17. Repo last pushed 2025-02, 33 open issues | Modes: HTML, TOC, React, Vue, raw. Front matter exposed as `attributes`. You can pass your own markdown-it instance, but **not remark/rehype plugins**. Its README doesn't say whether Markdown images go through Vite. ([README](https://github.com/hmsk/vite-plugin-markdown)) |
| `vite-plugin-md` (antfu)      | markdown-it, Vue-oriented | 0.21.5, 2022-12-16                                          | Stale, Vue-centric                                                                                                                                                                                                                                                               |
| `@mdx-js/rollup`              | MDX                       | —                                                           | Ruled out because Posts are plain Markdown, not MDX                                                                                                                                                                                                                              |

None of these runs a remark/rehype chain, and every Obsidian and Shiki plugin below is a remark or rehype plugin. A markdown-it route would mean different, less maintained Obsidian plugins.

### Option C (recommended): a small custom Vite plugin

Sketch, not tested:

```ts
// vite-plugin-posts.ts
{
  name: 'posts-md',
  enforce: 'pre',
  async transform(src, id) {
    if (!id.endsWith('.md') || !id.includes('/posts/')) return
    const file = await processor.process(new VFile({ path: id, value: src }))
    const frontmatter = PostFrontmatter.parse(file.data.matter)  // zod
    // replace each relative <img src> with a placeholder, collect imports (see section 3)
    return { code: `${imports}\nexport const frontmatter = ${JSON.stringify(frontmatter)};\nexport const html = ${htmlTemplate};\n`, map: null }
  },
  generateBundle() { this.emitFile({ type: 'asset', fileName: 'rss.xml', source: rss }) },
}
```

The app then uses `import.meta.glob('/posts/*/index.md', { import: 'frontmatter', eager: true })` for the index, and the lazy default form for per-Post chunks. Each chunk then contains **only an HTML string**: no parser, no Shiki. React renders it with `dangerouslySetInnerHTML`. The content is author-controlled and built at build time, so that's acceptable here.

### Front matter

- `vfile-matter` 5.0.1 (2025-03) parses YAML front matter into `file.data.matter` using the `yaml` package. Its readme recommends **`remark-frontmatter`** (rather than `strip: true`) when working with Markdown. ([vfile-matter readme](https://github.com/vfile/vfile-matter))
- `gray-matter` 4.0.3: last published 2021-04-24, but still at about 10.9M weekly downloads. It works, but it's a dormant alternative.
- Validate with **zod**, which is already in `dependencies`, so that a typo in `date:` or `slug:` fails the build.

## 2. Syntax highlighting (build-time, no runtime JS)

| Package                     | Version / date                                                    | Notes                                                                                                                                                                                                                                                                                            |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shiki` / `@shikijs/rehype` | 4.5.0, 2026-10-01. ~25.7M and ~850k weekly downloads. 13.8k stars | Uses TextMate grammars (the same highlighting as VS Code). Options: `theme`, or `themes: { light, dark }`, plus `inline`, `transformers`. `@shikijs/rehype/core` lets you pass your own highlighter. ([Shiki: rehype](https://shiki.style/packages/rehype)) Requires Node >= 20.                 |
| `rehype-pretty-code`        | 0.14.5, 2026-07-25. 1.3k stars                                    | Built on Shiki (peer dependency `shiki ^1 \|\| ^2 \|\| ^3 \|\| ^4`). Adds line numbers, `{1-3}` line highlighting, `/word/` highlighting, `title=`/`caption=` meta, and inline `{:js}`. "Works on both the server at build-time … and on the client." ([docs](https://rehype-pretty.pages.dev/)) |
| `rehype-prism-plus`         | 2.0.2, 2026-02-08                                                 | Uses Prism via refractor. Also runs at build time, with lower grammar fidelity than Shiki and theming through Prism CSS themes.                                                                                                                                                                  |

**Dark mode:** with `themes: { light, dark }`, Shiki writes light colors inline and dark colors into `--shiki-dark` / `--shiki-dark-bg` CSS variables. You switch them with a `@media (prefers-color-scheme: dark)` rule or an `html.dark .shiki` selector. `defaultColor: false` or `'light-dark()'` are also available. ([Shiki: Dual Themes](https://shiki.style/guide/dual-themes)) This is pure CSS, so there's no runtime JS.

**Recommendation:** start with `@shikijs/rehype` directly. Switch to `rehype-pretty-code` only if Posts need line or word highlighting or code-block titles. Both produce static HTML.

## 3. Co-located images

- Vite hashes and emits an asset **only when it's imported or otherwise referenced in the module graph**: `import url from './a.png'` gives `/assets/a.2d8efhg.png`, and files under `assetsInlineLimit` are inlined as base64. `new URL('./a.png', import.meta.url)` works only with static strings, and it **does not work with SSR**. The `public/` directory copies files unhashed, referenced by absolute path. ([Vite: Static Asset Handling](https://vite.dev/guide/assets.html))
- So `<img src="./cover.png">` inside an HTML **string** isn't seen by Vite at all.

**Recommended approach.** Inside the custom plugin's `transform`, walk the HAST after rehype. For each `img` whose `src` is relative:

1. Add `import __img0 from './cover.png'` to the generated module.
2. Replace `src` in the HTML with a placeholder, then build the HTML as a template literal that interpolates `${__img0}`.

Vite then resolves, hashes, inlines or emits each image in both client and SSR builds. Astro and similar tools do essentially this. **Using an Obsidian attachment location of "Same folder as current file" or "In subfolder under current folder"** ([Obsidian: Attachments](https://obsidian.md/help/attachments)) keeps the repo layout as `posts/<slug>/index.md` + `posts/<slug>/*.png`.

A simpler fallback is to put images in `public/blog/<slug>/` and use absolute paths. That has no hashing or cache-busting, and it breaks the relative paths Obsidian writes. Not recommended.

## 4. Obsidian syntax

Reference syntax from the Obsidian docs:

- Wikilinks `[[Note]]`, `[[Note|text]]`, `[[Note#Heading]]`. Obsidian uses wikilinks by default, and **disabling Settings → Files and Links → "Use [[Wikilinks]]" makes it generate standard Markdown links** (destinations URL-encoded, e.g. `%20`). ([Obsidian: Internal links](https://obsidian.md/help/links))
- Callouts: `> [!type] Optional title`. A `+`/`-` after the type makes the callout foldable. Callouts nest, have aliases (e.g. `tip` = `hint` = `important`), and unknown types fall back to `note`. ([Obsidian: Callouts](https://obsidian.md/help/callouts))

### Plugin landscape

| Package                            | Latest / repo activity                                                                   | Handles                                                                                                                                                                  | Verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@flowershow/remark-wiki-link`** | 4.0.0 (2026-06-23). Repo pushed 2025-12, 48 stars, 9 open issues. ~4.4k weekly downloads | `[[x]]`, `[[x\|alias]]`, `[[x#h]]`, `![[img.png]]`, `![[img.png\|200x300]]`, video/audio/pdf embeds. Note embeds (`![[Note]]`) are **planned, not yet supported**.       | **Recommended.** It's a real micromark syntax extension (`syntax.ts`, `fromMarkdown.ts`, `toMarkdown.ts`) that produces `wikiLink`/`embed` mdast nodes. Options: `format` (`shortestPossible` by default, or `regular`), `files`, `permalinks`, `urlResolver`, `className` (`internal`), `newClassName` (`new`), `aliasDivider`. Output: `<a class="internal [new]" href>` for links, and `<img src alt class [width/height style]>` for image embeds. ([README](https://github.com/flowershow/remark-wiki-link), [fromMarkdown.ts](https://github.com/flowershow/remark-wiki-link/blob/main/src/lib/fromMarkdown.ts)) |
| `remark-wiki-link` (landakram)     | 2.0.1, 2023-10. Repo inactive since then                                                 | `[[x]]`, `[[x\|alias]]`                                                                                                                                                  | Dormant. The Flowershow package is its maintained successor. `@portaljs/remark-wiki-link` (2024-04) is an older line of the same work.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `remark-obsidian` (johackim)       | 1.14.0 (2026-09-29). 70 stars, but ~60 weekly downloads                                  | Wikilinks with alias and heading, `![[Note]]` note embeds, callouts, `==highlight==`                                                                                     | Active, but it works with regexes over paragraph text and outputs **raw `html` nodes**. That requires `allowDangerousHtml`, and the HTML it emits is invisible to later rehype plugins: callout bodies get rendered separately, so Shiki wouldn't touch code inside callouts. Options are only `baseUrl`, `markdownFiles` and `paywall`. Unresolved links get `class="not-found"` when `markdownFiles` is passed. ([src/index.js](https://github.com/johackim/remark-obsidian/blob/master/src/index.js)) Not recommended.                                                                                              |
| **`rehype-callouts`**              | 2.2.0 (2026-06-15). Repo pushed 2026-10-09. ~22.5k weekly downloads                      | Obsidian/GitHub/VitePress callouts: case-insensitive types, Markdown titles, nesting, `+`/`-` folding via `<details>` "all without JavaScript", custom types and aliases | **Recommended.** Runs after `remark-rehype` and needs no `allowDangerousHtml`. It ships optional theme stylesheets (obsidian/github/vitepress), or you can style its classes with Tailwind. ([README](https://github.com/lin-stephanie/rehype-callouts))                                                                                                                                                                                                                                                                                                                                                               |
| `@r4ai/remark-callout`             | 0.6.2 (2024-09). Repo active 2026-10                                                     | Obsidian callouts at the remark stage                                                                                                                                    | A viable alternative, but no npm release in two years                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `remark-github-blockquote-alert`   | 2.1.0 (2026-03). ~895k weekly downloads                                                  | Only the five GitHub types (NOTE/TIP/IMPORTANT/WARNING/CAUTION)                                                                                                          | Too narrow for Obsidian types and folding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `remark-obsidian-callout`          | 1.5.1                                                                                    | —                                                                                                                                                                        | **Repo archived.** Avoid.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `remark-callouts` (flowershow)     | 2.0.0, 2022-11                                                                           | —                                                                                                                                                                        | Stale. Avoid.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### Can unresolved links degrade to plain text?

No plugin does this out of the box:

- Flowershow adds `newClassName` (default `new`) when nothing in `files`/`permalinks` matches. The README says only that such links "will have the `new` class."
- remark-obsidian adds `not-found`.

**Degrading is a ~15-line custom rehype plugin:** visit `a.new` (or `a.internal.new`) and replace the element with its text children. Because Posts are the only pages, pass `files` = the list of Post paths, and set `urlResolver` / `permalinks` to map to `/blog/<slug>`. Any `[[link]]` to a private vault note then becomes plain text in the published Post. Putting the build-time check in the same step can also log a warning, or fail the build if that's preferred.

**Caveats to verify in a prototype:**

- `urlResolver` is shared by links and embeds, so it has to branch on extension: images go to a relative `./name.png` path for the import rewrite, and notes go to `/blog/<slug>`. The `files` option is documented as ".md and .mdx paths". It's unclear whether a resolved **image** embed avoids getting the `new` class.
- Obsidian **comments `%%…%%`** and `==highlights==` aren't handled by Flowershow or rehype-callouts. Comments would **leak into published HTML** as literal text. Either add a tiny remark step that strips `%%…%%`, or adopt an authoring rule.
- Note embeds (`![[Other note]]`) aren't supported, so render them as plain text or avoid them.

### The no-plugin path

If drafting in Obsidian can tolerate it, set **Use [[Wikilinks]] = off** and **attachments = same folder as current file**. Obsidian then writes `[text](Other%20note.md)` and `![](cover.png)`, which are plain CommonMark that every tool understands. Only callouts (`rehype-callouts`) and the `.md` → `/blog/<slug>` link rewrite remain. This also simplifies the separate "Obsidian → repo transfer workflow" question on #48.

## 5. RSS at build time

- **`feed`** 6.0.0 (2026-07-05). ~1.6M weekly downloads, 1.4k stars, repo pushed 2026-09. `new Feed({ title, id, link, feedLinks, author, updated })`, `addItem({ title, id, link, description, content, date })`, then `rss2()` / `atom1()` / `json1()`. `xml-js` is its only dependency, and it needs Node >= 20. ([README](https://github.com/jpmonette/feed)) The older `rss` package hasn't had a release since 2017.
- **Emit it** from a Vite/Rollup `generateBundle` hook with `this.emitFile({ type: 'asset', fileName: 'rss.xml', source })`. With a `fileName`, the name "will be used unmodified", so it isn't hashed. ([Rollup: this.emitFile](https://rollupjs.org/plugin-development/#this-emitfile), [Vite: Plugin API](https://vite.dev/guide/api-plugin.html)) Output hooks don't run in dev, which is fine for a feed. If you want full HTML content in the feed, it can reuse the rendered `html`, but relative image URLs must be made absolute (`https://arendpeter.com/assets/...`).
- A standalone `scripts/build-rss.ts` run after `vite build` also works, but it would duplicate the parsing. Keeping everything in one plugin means a single source of truth.

## 6. How this fits the parallel routing/prerender decision

The core module (unified processor + front matter schema + image-import rewrite) is the same either way. Only where it runs changes:

- **Stay a Vite SPA (data/declarative React Router, plus a static-HTML or `404.html` workaround):** use the custom `.md` → module plugin above. Posts become lazy chunks containing only HTML strings. Per-post `<title>`/OG tags would need a separate post-build step that writes `dist/blog/<slug>/index.html` with the meta tags filled in from the same front matter. The plugin can do that in `generateBundle` too.
- **React Router v7 framework mode with `prerender`:** this needs framework mode (`react-router.config.ts`, `react-router build`). `prerender` accepts an array or async function of paths (e.g. `/blog/${slug}`). It works with `ssr: false` for static hosting, and "routes being pre-rendered use the same route `loader` functions." Output is `build/client/<path>/index.html` plus `<path>.data`, and non-prerendered paths fall back to `__spa-fallback.html`. ([React Router: Pre-Rendering](https://reactrouter.com/how-to/pre-rendering)) Here the `.md` plugin still works unchanged: import the Post module in the route `loader` (server build) and return `{ frontmatter, html }`, and Vite's image imports still resolve to hashed client URLs. Alternatively, the loader could read files with `fs` and run unified directly, since the loader runs only at build time. But then images need the `import.meta.glob(..., { query: '?url' })` approach, because `new URL(..., import.meta.url)` doesn't work in SSR. Per-post `meta` exports give real titles and link previews for free.

In both cases, Shiki and remark never reach the browser.

## Not verified / open

- No prototype was built. The plugin sketch and the Flowershow image-embed + `files` interaction should be checked with a 2-Post spike.
- Vite's current plugin docs describe the Rolldown-based plugin interface (Vite 8+). On Vite 7 (Rollup), `transform`, `generateBundle` and `this.emitFile` behave as in the Rollup docs.
- Flowershow v4.0.0 was published 2026-06-23, but the GitHub repo's last push is 2025-12-19. The release may come from another repo or a monorepo, and it depends on `@flowershow/core`. Worth a glance at the changelog before adopting.
