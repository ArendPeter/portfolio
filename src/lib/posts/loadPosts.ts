import * as fs from 'node:fs'
import * as path from 'node:path'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import { matter } from 'vfile-matter'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import rehypeSlug from 'rehype-slug'
import rehypeCallouts from 'rehype-callouts'
import rehypeShiki from '@shikijs/rehype'
import { visit } from 'unist-util-visit'
import { findAndReplace } from 'mdast-util-find-and-replace'
import { z } from 'zod'
import * as yaml from 'yaml'
import type { Plugin } from 'unified'
import type { Root as MdastRoot } from 'mdast'

export type { Post, PostMeta, PostSummary } from './types'
import type { Post, PostMeta } from './types'

// --- Constants ---

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|avif)$/i

// --- Validation ---

const frontMatterSchema = z.object({
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  description: z.string(),
  updated: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'updated must be YYYY-MM-DD')
    .optional(),
  image: z.string().optional(),
  aliases: z.array(z.string()).optional(),
})

// --- Error ---

export class PostError extends Error {
  constructor(message: string, slug: string) {
    super(`Post "${slug}": ${message}`)
    this.name = 'PostError'
  }
}

// --- Helpers ---

function stripLeadingEmoji(str: string): string {
  // Strip common emoji (extended pictographics) and whitespace from the start
  return str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\s]*/u, '').trim()
}

function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
}

function removeObsidianComments(md: string): string {
  return md.replace(/%%[\s\S]*?%%/g, '')
}

function computeReadingTime(htmlContent: string): number {
  const text = htmlContent.replace(/<[^>]+>/g, ' ')
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
  return Math.max(1, Math.ceil(words.length / 200))
}

function extractFrontmatterRaw(md: string): Record<string, unknown> {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md)
  if (!match?.[1]) return {}
  try {
    return (yaml.parse(match[1]) as Record<string, unknown>) ?? {}
  } catch {
    return {}
  }
}

// --- Name map for wikilink resolution ---

interface PostRef {
  slug: string
  title: string
  aliases?: string[]
}

function buildNameMap(refs: PostRef[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const ref of refs) {
    const names = [ref.title, ...(ref.aliases ?? [])]
    for (const name of names) {
      const key = stripLeadingEmoji(name).toLowerCase()
      if (map.has(key)) {
        throw new Error(`Two posts share the name "${name}": "${map.get(key)}" and "${ref.slug}"`)
      }
      map.set(key, ref.slug)
    }
  }
  return map
}

// --- Remark plugins ---

const remarkCheckH1 =
  (slug: string): Plugin<[], MdastRoot> =>
  () =>
  (tree) => {
    visit(tree, 'heading', (node) => {
      if (node.depth === 1) {
        throw new PostError('contains a # H1 heading, which is not allowed', slug)
      }
    })
  }

const remarkCheckDataview =
  (slug: string): Plugin<[], MdastRoot> =>
  () =>
  (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang?.toLowerCase() === 'dataview') {
        throw new PostError('contains a Dataview block, which is not supported', slug)
      }
    })
  }

const remarkObsidianHighlight = (): Plugin<[], MdastRoot> => () => (tree) => {
  findAndReplace(tree, [
    [
      /==([^=\n]+)==/g,
      (_match: string, content: string) => ({
        type: 'html' as const,
        value: `<mark>${content}</mark>`,
      }),
    ],
  ])
}

const remarkObsidianSyntax =
  (
    slug: string,
    postDir: string,
    nameMap: Map<string, string>,
    images: string[],
  ): Plugin<[], MdastRoot> =>
  () =>
  (tree) => {
    // Handle ![[...]] image/note embeds
    findAndReplace(tree, [
      [
        /!\[\[([^\]]+)\]\]/g,
        (_match: string, inner: string) => {
          const pipeIdx = inner.lastIndexOf('|')
          const nameAndAnchor = pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner.trim()
          const widthStr = pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : undefined

          if (nameAndAnchor.includes('#^')) {
            throw new PostError(`block embed "![[${inner}]]" is not allowed`, slug)
          }

          const [rawFileName] = nameAndAnchor.split('#')
          const name = (rawFileName ?? '').trim()

          if (!IMAGE_EXTENSIONS.test(name)) {
            throw new PostError(`note embed "![[${inner}]]" is not allowed`, slug)
          }

          const imgPath = path.join(postDir, name)
          if (!fs.existsSync(imgPath)) {
            throw new PostError(`image "${name}" not found in post folder`, slug)
          }

          if (!images.includes(name)) images.push(name)

          const width = widthStr ? parseInt(widthStr, 10) : undefined
          return {
            type: 'image' as const,
            url: name,
            alt: name,
            title: null,
            ...(width ? { data: { hProperties: { width } } } : {}),
          }
        },
      ],
    ])

    // Handle [[...]] wikilinks
    findAndReplace(tree, [
      [
        /\[\[([^\]]+)\]\]/g,
        (_match: string, inner: string) => {
          const pipeIdx = inner.indexOf('|')
          const target = pipeIdx >= 0 ? inner.slice(0, pipeIdx).trim() : inner.trim()
          const aliasStr = pipeIdx >= 0 ? inner.slice(pipeIdx + 1).trim() : undefined

          const hashIdx = target.indexOf('#')
          const pageName = hashIdx >= 0 ? target.slice(0, hashIdx).trim() : target
          const heading = hashIdx >= 0 ? target.slice(hashIdx + 1).trim() : undefined

          const displayText = aliasStr ?? pageName
          const lookupKey = stripLeadingEmoji(pageName).toLowerCase()
          const resolvedSlug = nameMap.get(lookupKey)

          if (resolvedSlug) {
            const href = heading
              ? `/blog/${resolvedSlug}#${slugifyHeading(heading)}`
              : `/blog/${resolvedSlug}`
            return {
              type: 'link' as const,
              url: href,
              children: [{ type: 'text' as const, value: displayText }],
            }
          }
          return { type: 'text' as const, value: displayText }
        },
      ],
    ])
  }

const remarkVerifyImages =
  (slug: string, postDir: string, images: string[]): Plugin<[], MdastRoot> =>
  () =>
  (tree) => {
    visit(tree, 'image', (node) => {
      const { url } = node
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return
      const imgPath = path.join(postDir, url)
      if (!fs.existsSync(imgPath)) {
        throw new PostError(`image "${url}" not found in post folder`, slug)
      }
      if (!images.includes(url)) images.push(url)
    })
  }

// --- Process a single post ---

async function processPost(
  slug: string,
  postDir: string,
  nameMap: Map<string, string>,
): Promise<Post> {
  const mdPath = path.join(postDir, 'index.md')
  const rawMd = fs.readFileSync(mdPath, 'utf-8')
  const processedMd = removeObsidianComments(rawMd)

  const images: string[] = []

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ['yaml'])
    .use(() => (_: MdastRoot, vf) => {
      matter(vf)
    })
    .use(remarkCheckH1(slug))
    .use(remarkCheckDataview(slug))
    .use(remarkObsidianHighlight())
    .use(remarkObsidianSyntax(slug, postDir, nameMap, images))
    .use(remarkVerifyImages(slug, postDir, images))
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeCallouts)
    .use(rehypeSlug)
    .use(rehypeShiki, { theme: 'github-dark' })
    .use(rehypeStringify, { allowDangerousHtml: true })

  const file = await processor.process(processedMd)
  const html = String(file)

  const rawMeta = (file.data as { matter?: unknown }).matter

  let meta: PostMeta
  try {
    meta = frontMatterSchema.parse(rawMeta)
  } catch (err) {
    throw new PostError(`invalid frontmatter: ${(err as Error).message}`, slug)
  }

  const readingTime = computeReadingTime(html)

  const shareImage = meta.image ?? (images.length > 0 ? images[0] : null)

  return { slug, meta, html, readingTime, shareImage, images }
}

// --- Public API ---

export async function loadPosts(postsDir: string): Promise<Post[]> {
  if (!fs.existsSync(postsDir)) return []

  const entries = fs.readdirSync(postsDir, { withFileTypes: true })
  const slugs = entries.filter((e) => e.isDirectory() && !e.name.startsWith('.')).map((e) => e.name)

  if (slugs.length === 0) return []

  for (const slug of slugs) {
    if (!SLUG_RE.test(slug)) {
      throw new Error(
        `Invalid post slug "${slug}": must be lowercase kebab-case (${SLUG_RE.source})`,
      )
    }
  }

  // First pass: collect titles/aliases for wikilink resolution
  const refs: PostRef[] = []
  for (const slug of slugs) {
    const mdPath = path.join(postsDir, slug, 'index.md')
    if (!fs.existsSync(mdPath)) continue
    const rawMd = fs.readFileSync(mdPath, 'utf-8')
    const rawMeta = extractFrontmatterRaw(rawMd)
    if (typeof rawMeta.title === 'string') {
      refs.push({
        slug,
        title: rawMeta.title,
        aliases: Array.isArray(rawMeta.aliases)
          ? (rawMeta.aliases as string[]).filter((a) => typeof a === 'string')
          : undefined,
      })
    }
  }

  const nameMap = buildNameMap(refs)

  // Second pass: process all posts
  const validSlugs = slugs.filter((s) => fs.existsSync(path.join(postsDir, s, 'index.md')))
  const posts = await Promise.all(
    validSlugs.map((slug) => processPost(slug, path.join(postsDir, slug), nameMap)),
  )

  return posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date))
}
