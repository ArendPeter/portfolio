---
name: obsidian-sync
description: Publish blog posts from Arend's Obsidian Vault into the portfolio repo (posts/<slug>/index.md + images) and push them live, or compare a Vault note against its published Post and carry content changes across in either direction. Use whenever Arend mentions publishing, syncing, copying or porting a blog post/article/note from Obsidian, asks whether a Vault draft and the live Post have drifted, or names a note in Efforts/Blog (🥚/🐣/✅ files) — even if they don't say "sync".
---

# Obsidian → blog sync

Arend drafts **Posts** in their Obsidian **Vault** and publishes them on arendpeter.com from this repo (terms in `CONTEXT.md`). Decisions behind the blog live on GitHub issue #48 and its children (#52 Obsidian handling, #53 metadata, #56 PRD) — read those if a situation isn't covered here.

## Where things are

|       | macOS           | Windows          | WSL                                                                          |
| ----- | --------------- | ---------------- | ---------------------------------------------------------------------------- |
| Vault | `~/w/obsidian`  | `C:/w/obsidian`  | `/mnt/c/w/obsidian` (the Vault is not synced into WSL; use the Windows copy) |
| Repo  | `~/w/portfolio` | `C:/w/portfolio` | wherever the WSL checkout is — just use the current git repo                 |

- Blog notes: `<vault>/Efforts/Blog/`. Attachments: `<vault>/Atlas/Utilities/Images/`.
- Filename emoji are Vault-only status markers: 🥚 idea, 🐣 drafting, ✅ published. They never appear in the repo.

`scripts/sync.mjs` (Node, no deps) resolves all of this automatically; `OBSIDIAN_VAULT=<path>` overrides it.

## Sync model

- **First publish is a one-time copy.** After that the **repo is the source of truth**; the Vault copy is allowed to drift. Formatting differences (whitespace, blank lines, front matter, image names) are expected and never worth syncing.
- **Later syncs happen only when Arend asks**, in a direction Arend names (or asks you to judge). Then: run `diff`, separate real content changes (wording, added/removed sentences, sections) from noise, show Arend the content changes, and apply only the ones Arend wants. Edit the target file by hand — don't re-run `publish --force` over a Post that has repo-side edits, it would wipe them.
- Arend will say what to do with status emoji (e.g. renaming 🐣 → ✅). Don't rename Vault files unasked.
- Never edit the prose while copying. If you notice obvious typos, list them in your summary so Arend can decide.

## Repo conventions (enforced by `npm run build` via `src/lib/posts/loadPosts.ts`)

- `posts/<slug>/index.md` + the Post's images in the same folder. Slug = folder name, lowercase kebab-case, **frozen once published** (it's the URL `/blog/<slug>`). Derive it from the title, short and readable.
- Front matter lives **only in the repo**: `title` and `date` (`YYYY-MM-DD`, the publish date — default today) are required. Optional: `description` (plain text, no links; only add if Arend provides one), `updated`, `image` (share-image filename), `aliases`.
- Title: the Vault filename minus emoji is the default; Arend may want a different one. Body must not contain `# H1`.
- Obsidian syntax stays as-is (`![[img.png|400]]`, `[[wikilinks]]`, callouts, `%%comments%%`) — the build translates it. Wikilinks to non-Posts render as plain text, which is intended.
- Build failures: note embeds `![[Note]]`, Dataview blocks, missing images, `# H1`, bad slug, missing title/date.

## Publishing a new Post

1. **Inspect**: `node .claude/skills/obsidian-sync/scripts/sync.mjs inspect "<note name>"` (name matching is case-insensitive, emoji ignored; use `list` to see all notes). It reports embeds with their Vault paths, wikilinks, build blockers, and a warning if the note looks unfinished. Stop and tell Arend about blockers or an unfinished ending rather than patching the writing.
2. **Name the images.** Vault images are usually `Pasted image 2026….png`. Look at each image (Read it) and its surrounding paragraph, then pick a short descriptive lowercase-kebab name (e.g. `wayfinder-first-questions.png`, `prototype-a-inline-grid.png`). Names must be unique and space-free; keep the original extension.
3. **Publish**:
   ```
   node .claude/skills/obsidian-sync/scripts/sync.mjs publish "<note>" --slug <slug> --title "<title>" [--date YYYY-MM-DD] [--description "..."] --rename '{"Pasted image 1.png":"good-name.png", ...}'
   ```
   It writes front matter, copies and renames images, rewrites embeds (keeping `|width`), strips trailing whitespace, adds blank lines around headings and after tables, and refuses to overwrite an existing Post. On Windows PowerShell, put the `--rename` JSON in single quotes and escape inner double quotes as needed, or write the JSON to a temp file and pass `--rename "$(cat file)"` from bash.
4. **Review** the resulting `index.md` quickly (embeds renamed, nothing odd at table boundaries or code fences).
5. **Build**: `npm run build`. If it fails on missing modules or types (e.g. `feed`, `@types/node`), `node_modules` is stale — run `npm install` (use npm, not pnpm) and discard any `package-lock.json` churn it causes. Fix pipeline issues it reports; if the fix would mean changing Arend's prose, ask.
6. **Commit and push** to `main` (pushing deploys the site): first run `npx prettier --write posts/<slug>` — the pre-commit hook runs Prettier over the whole repo _after_ staging, so unformatted Markdown otherwise leaves a dirty tree behind the commit. Then stage only `posts/<slug>/` (plus anything else you deliberately changed), commit as `Add <short post name> post`, `git push`. **Never force push** — if the push is rejected, `git pull --rebase` and retry, or stop and report.
7. **Report**: the URL `https://arendpeter.com/blog/<slug>`, the image renames, any typos noticed, and remind Arend the Vault note's status emoji is theirs to change.

## Comparing an existing Post

```
node .claude/skills/obsidian-sync/scripts/sync.mjs diff "<note>" <slug>
```

Word diff after normalizing away front matter, whitespace, blank lines and image filenames. `[-…-]` is only in the Vault, `{+…+}` only in the repo. "(no content differences)" means the two are equivalent. Image embeds are compared as `![[image]]`, so an added/removed image still shows up. Summarize the differences for Arend as a short list ("Vault has a closing sentence the repo dropped: …"), recommend which are worth carrying over, and wait for their call before editing either side. When carrying changes into the Vault, edit only the prose — no front matter, no image renames.
