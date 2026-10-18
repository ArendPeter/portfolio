import type { Post, PostSummary } from './types'

export const BASE_URL = 'https://arendpeter.com'
const RSS_URL = `${BASE_URL}/rss.xml`

export const SELFIE_URL = `${BASE_URL}/selfie.jpg`

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function generatePostHead(
  post: Post,
  shareImageUrl: string,
  twitterCard: 'summary_large_image' | 'summary',
): string {
  const canonicalUrl = `${BASE_URL}/blog/${post.slug}`
  const title = escapeHtml(post.meta.title)
  const description = post.meta.description ? escapeHtml(post.meta.description) : null

  const lines = [
    `<title>${title}</title>`,
    ...(description ? [`<meta name="description" content="${description}">`] : []),
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${title}">`,
    ...(description ? [`<meta property="og:description" content="${description}">`] : []),
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:image" content="${shareImageUrl}">`,
    `<meta property="article:published_time" content="${post.meta.date}T00:00:00Z">`,
  ]

  if (post.meta.updated) {
    lines.push(`<meta property="article:modified_time" content="${post.meta.updated}T00:00:00Z">`)
  }

  lines.push(
    `<meta name="twitter:card" content="${twitterCard}">`,
    `<link rel="alternate" type="application/rss+xml" href="${RSS_URL}" title="Arend Peter's Blog">`,
  )

  return lines.join('\n')
}

export function generateBlogIndexHead(): string {
  const canonicalUrl = `${BASE_URL}/blog`
  const title = 'Blog | Arend Peter'
  const description = 'Writing by Arend Peter'

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<link rel="alternate" type="application/rss+xml" href="${RSS_URL}" title="Arend Peter's Blog">`,
  ].join('\n')
}

export function generateBlogIndexBody(posts: PostSummary[]): string {
  const items = posts
    .map((post) => `  <li><a href="/blog/${post.slug}">${escapeHtml(post.meta.title)}</a></li>`)
    .join('\n')
  return `<ul>\n${items}\n</ul>`
}
