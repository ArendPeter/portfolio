#!/usr/bin/env node
// Deterministic helpers for moving blog notes from the Obsidian Vault into posts/<slug>/.
// No dependencies, so it runs the same on macOS, Windows and WSL.
//
//   node sync.mjs vault                          print the resolved Vault path
//   node sync.mjs list                           blog notes in the Vault + matching repo Posts
//   node sync.mjs inspect <note>                 JSON report: embeds, wikilinks, build blockers
//   node sync.mjs publish <note> --slug s --title t [--date YYYY-MM-DD] [--description d]
//                          [--rename '{"Pasted image 1.png":"nice-name.png"}'] [--force]
//   node sync.mjs diff <note> <slug>             word diff of content (formatting/front matter/image names ignored)
//
// <note> is a path to a .md file, or a name matched against the notes in Efforts/Blog
// (case-insensitive, status emoji ignored).

import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const BLOG_DIR = 'Efforts/Blog'
const ATTACHMENTS_DIR = 'Atlas/Utilities/Images'
const IMAGE_EXT = /\.(png|jpg|jpeg|gif|webp|svg|avif)$/i
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const EMBED_RE = /!\[\[([^\]]+)\]\]/g
const WIKILINK_RE = /(?<!!)\[\[([^\]]+)\]\]/g

function fail(msg) {
  console.error(`error: ${msg}`)
  process.exit(1)
}

function isWsl() {
  try {
    return /microsoft/i.test(fs.readFileSync('/proc/version', 'utf-8'))
  } catch {
    return false
  }
}

function resolveVault() {
  const candidates = []
  if (process.env.OBSIDIAN_VAULT) candidates.push(process.env.OBSIDIAN_VAULT)
  if (process.platform === 'darwin') candidates.push(path.join(os.homedir(), 'w/obsidian'))
  if (process.platform === 'win32') candidates.push('C:/w/obsidian')
  // The Vault is not synced into WSL, so read it from the Windows drive.
  if (process.platform === 'linux' && isWsl()) candidates.push('/mnt/c/w/obsidian')
  const found = candidates.find((c) => fs.existsSync(path.join(c, BLOG_DIR)))
  if (!found) fail(`no Vault found (tried: ${candidates.join(', ') || 'none'}); set OBSIDIAN_VAULT`)
  return found
}

function resolveRepo() {
  try {
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf-8' }).trim()
    if (fs.existsSync(path.join(top, 'posts'))) return top
  } catch {
    /* fall through */
  }
  // scripts/ -> obsidian-sync/ -> skills/ -> .claude/ -> repo
  const here = path.dirname(fileURLToPath(import.meta.url))
  const fromScript = path.resolve(here, '../../../..')
  if (fs.existsSync(path.join(fromScript, 'posts'))) return fromScript
  fail('could not find the portfolio repo (no posts/ directory); run from inside it')
}

function stripEmoji(s) {
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\s]*/u, '').trim()
}

function statusOf(fileName) {
  const m = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]+/u.exec(fileName)
  return m ? m[0] : ''
}

function blogNotes(vault) {
  const dir = path.join(vault, BLOG_DIR)
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({
      file: path.join(dir, f),
      status: statusOf(f),
      name: stripEmoji(f.replace(/\.md$/, '')),
    }))
}

function resolveNote(vault, query) {
  if (!query) fail('missing <note>')
  if (fs.existsSync(query) && query.endsWith('.md')) return path.resolve(query)
  const q = stripEmoji(query.replace(/\.md$/, '')).toLowerCase()
  const notes = blogNotes(vault)
  const exact = notes.filter((n) => n.name.toLowerCase() === q)
  const matches = exact.length ? exact : notes.filter((n) => n.name.toLowerCase().includes(q))
  if (matches.length === 1) return matches[0].file
  if (matches.length === 0) fail(`no note in ${BLOG_DIR} matches "${query}"`)
  fail(`"${query}" is ambiguous: ${matches.map((m) => path.basename(m.file)).join(', ')}`)
}

// Obsidian resolves embeds by filename anywhere in the Vault; the attachments folder is the usual home.
let vaultFileIndex
function findVaultFile(vault, name) {
  const direct = path.join(vault, ATTACHMENTS_DIR, name)
  if (fs.existsSync(direct)) return direct
  if (!vaultFileIndex) {
    vaultFileIndex = new Map()
    const walk = (dir) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.')) continue
        const p = path.join(dir, e.name)
        if (e.isDirectory()) walk(p)
        else if (!vaultFileIndex.has(e.name)) vaultFileIndex.set(e.name, p)
      }
    }
    walk(vault)
  }
  return vaultFileIndex.get(path.basename(name)) ?? null
}

function splitFrontMatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(md)
  return m ? { frontMatter: m[1], body: md.slice(m[0].length) } : { frontMatter: null, body: md }
}

function parseEmbed(inner) {
  const pipe = inner.lastIndexOf('|')
  const target = (pipe >= 0 ? inner.slice(0, pipe) : inner).trim()
  const size = pipe >= 0 ? inner.slice(pipe + 1).trim() : null
  return { target, size }
}

// Applies a function to every line outside fenced code blocks.
function mapProse(lines, fn) {
  let fence = null
  return lines.map((line, i) => {
    const m = /^\s*(```+|~~~+)/.exec(line)
    if (m) {
      if (!fence) fence = m[1][0]
      else if (m[1][0] === fence) fence = null
      return line
    }
    return fence ? line : fn(line, i)
  })
}

// Formatting the repo copies have always received: no trailing spaces, and blank lines
// around headings and after tables (GFM otherwise swallows the next line into the table).
function normalize(body) {
  let lines = body.replace(/\r\n/g, '\n').split('\n')
  lines = mapProse(lines, (l) => l.replace(/[ \t]+$/, ''))
  const out = []
  let fence = null
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fm = /^\s*(```+|~~~+)/.exec(line)
    if (fm) fence = fence ? (fm[1][0] === fence ? null : fence) : fm[1][0]
    const inFence = fence !== null && !fm
    out.push(line)
    if (inFence || fm) continue
    const next = lines[i + 1]
    if (next === undefined) continue
    const isHeading = /^#{1,6}\s/.test(line)
    const nextIsHeading = /^#{1,6}\s/.test(next)
    const isTableRow = /^\s*\|/.test(line)
    const nextIsTableRow = /^\s*\|/.test(next)
    if (next.trim() !== '' && (isHeading || nextIsHeading || (isTableRow && !nextIsTableRow))) {
      out.push('')
    }
  }
  return (
    out
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  )
}

function yamlValue(s) {
  return /^[\w][\w .,'’()?!-]*$/.test(s) && !/:\s|\s#/.test(s) ? s : JSON.stringify(s)
}

function inspect(vault, notePath) {
  const md = fs.readFileSync(notePath, 'utf-8')
  const { frontMatter, body } = splitFrontMatter(md)
  const embeds = []
  const problems = []
  for (const m of body.matchAll(EMBED_RE)) {
    const { target, size } = parseEmbed(m[1])
    if (!IMAGE_EXT.test(target.split('#')[0])) {
      problems.push(`note embed ![[${m[1]}]] (build fails on these)`)
      continue
    }
    const source = findVaultFile(vault, target)
    if (!source) problems.push(`image not found in Vault: ${target}`)
    if (!embeds.some((e) => e.name === target)) embeds.push({ name: target, size, source })
  }
  const wikilinks = [...body.matchAll(WIKILINK_RE)].map((m) => m[1])
  mapProse(body.split('\n'), (l, i) => {
    if (/^#\s/.test(l)) problems.push(`line ${i + 1}: "# H1" heading (build fails; use ##)`)
    if (/^\s*\|.*!\[\[[^\]]*\|[^\]]*\]\]/.test(l))
      problems.push(`line ${i + 1}: sized embed inside a table; the "|" splits the cell`)
    return l
  })
  if (/```dataview/i.test(body)) problems.push('Dataview block (build fails)')
  const lastLine = body.trim().split('\n').pop() ?? ''
  const unfinished =
    lastLine && !/[.!?)"'`*_>|\]]$/.test(lastLine.trim()) && !/^#/.test(lastLine.trim())
  return {
    note: notePath,
    suggestedTitle: stripEmoji(path.basename(notePath, '.md')),
    status: statusOf(path.basename(notePath)),
    hasFrontMatter: frontMatter !== null,
    words: body.split(/\s+/).filter(Boolean).length,
    embeds,
    wikilinks,
    problems,
    ...(unfinished ? { warning: `note may be unfinished; last line: "${lastLine.trim()}"` } : {}),
  }
}

function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = argv[i + 1]
      if (next === undefined || next.startsWith('--')) flags[key] = true
      else flags[key] = argv[++i]
    } else positional.push(a)
  }
  return { positional, flags }
}

function publish(vault, repo, notePath, flags) {
  const { slug, title, description, force } = flags
  const date = flags.date ?? new Date().toISOString().slice(0, 10)
  if (!slug || !SLUG_RE.test(slug)) fail(`--slug must be lowercase kebab-case, got "${slug}"`)
  if (!title || title === true) fail('--title is required')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('--date must be YYYY-MM-DD')
  const rename = flags.rename ? JSON.parse(flags.rename) : {}

  const postDir = path.join(repo, 'posts', slug)
  if (fs.existsSync(postDir) && !force) fail(`${postDir} already exists; pass --force to overwrite`)

  const report = inspect(vault, notePath)
  const blockers = report.problems.filter((p) => !p.includes('inside a table'))
  if (blockers.length) fail(`fix these in the note first:\n  - ${blockers.join('\n  - ')}`)

  const copies = []
  for (const e of report.embeds) {
    const newName = rename[e.name] ?? e.name
    if (/\s/.test(newName)) fail(`image name "${newName}" has spaces; give it a --rename entry`)
    copies.push({ from: e.source, to: path.join(postDir, newName), oldName: e.name, newName })
  }
  const names = copies.map((c) => c.newName)
  const dup = names.find((n, i) => names.indexOf(n) !== i)
  if (dup) fail(`two images would both be named "${dup}"`)

  const { body } = splitFrontMatter(fs.readFileSync(notePath, 'utf-8'))
  const renamed = body.replace(EMBED_RE, (whole, inner) => {
    const { target, size } = parseEmbed(inner)
    const newName = rename[target]
    return newName ? `![[${newName}${size ? `|${size}` : ''}]]` : whole
  })

  const fm = [`title: ${yamlValue(stripEmoji(title))}`, `date: ${date}`]
  if (description && description !== true) fm.push(`description: ${yamlValue(description)}`)
  const out = `---\n${fm.join('\n')}\n---\n\n${normalize(renamed)}`

  if (force && fs.existsSync(postDir)) {
    for (const f of fs.readdirSync(postDir)) fs.rmSync(path.join(postDir, f), { recursive: true })
  }
  fs.mkdirSync(postDir, { recursive: true })
  fs.writeFileSync(path.join(postDir, 'index.md'), out)
  for (const c of copies) fs.copyFileSync(c.from, c.to)

  console.log(
    JSON.stringify(
      {
        wrote: path.join(postDir, 'index.md'),
        images: copies.map((c) => ({ from: c.oldName, to: c.newName })),
        wikilinks: report.wikilinks,
        ...(report.warning ? { warning: report.warning } : {}),
      },
      null,
      2,
    ),
  )
}

// Content-only comparison: front matter, whitespace/blank-line formatting and image
// filenames are normalized away, since those legitimately differ between the two copies.
function diff(vault, repo, notePath, slug) {
  const postFile = path.join(repo, 'posts', slug, 'index.md')
  if (!fs.existsSync(postFile)) fail(`no Post at ${postFile}`)
  const prep = (md) =>
    normalize(splitFrontMatter(md).body)
      .replace(
        EMBED_RE,
        (_w, inner) => `![[image${parseEmbed(inner).size ? '|' + parseEmbed(inner).size : ''}]]`,
      )
      .replace(/[ \t]{2,}/g, ' ')
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'obsidian-sync-'))
  const a = path.join(tmp, 'vault.md')
  const b = path.join(tmp, 'repo.md')
  fs.writeFileSync(a, prep(fs.readFileSync(notePath, 'utf-8')))
  fs.writeFileSync(b, prep(fs.readFileSync(postFile, 'utf-8')))
  const res = spawnSync('git', ['diff', '--no-index', '--no-color', '--word-diff=plain', a, b], {
    encoding: 'utf-8',
  })
  const repoFm = splitFrontMatter(fs.readFileSync(postFile, 'utf-8')).frontMatter
  console.log(`# vault: ${notePath}\n# repo:  ${postFile}`)
  console.log(`# repo front matter:\n${(repoFm ?? '(none)').replace(/^/gm, '#   ')}`)
  console.log(`# [-removed-] = only in Vault, {+added+} = only in repo`)
  console.log(
    res.stdout.trim() ? res.stdout.split('\n').slice(4).join('\n') : '(no content differences)',
  )
  fs.rmSync(tmp, { recursive: true })
}

const [cmd, ...rest] = process.argv.slice(2)
const { positional, flags } = parseArgs(rest)

switch (cmd) {
  case 'vault':
    console.log(resolveVault())
    break
  case 'list': {
    const vault = resolveVault()
    const repo = resolveRepo()
    const postsDir = path.join(repo, 'posts')
    const posts = fs
      .readdirSync(postsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => {
        const fm = splitFrontMatter(
          fs.readFileSync(path.join(postsDir, e.name, 'index.md'), 'utf-8'),
        )
        const title = /^title:\s*(.+)$/m
          .exec(fm.frontMatter ?? '')?.[1]
          ?.replace(/^["']|["']$/g, '')
        return { slug: e.name, title }
      })
    console.log(JSON.stringify({ vault, notes: blogNotes(vault), posts }, null, 2))
    break
  }
  case 'inspect': {
    const vault = resolveVault()
    console.log(JSON.stringify(inspect(vault, resolveNote(vault, positional[0])), null, 2))
    break
  }
  case 'publish': {
    const vault = resolveVault()
    publish(vault, resolveRepo(), resolveNote(vault, positional[0]), flags)
    break
  }
  case 'diff': {
    const vault = resolveVault()
    diff(vault, resolveRepo(), resolveNote(vault, positional[0]), positional[1])
    break
  }
  default:
    fail(
      'usage: sync.mjs vault | list | inspect <note> | publish <note> --slug --title ... | diff <note> <slug>',
    )
}
