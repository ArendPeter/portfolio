import type { Post, PostSummary } from './types'

export const BASE_URL = 'https://arendpeter.com'
const RSS_URL = `${BASE_URL}/rss.xml`

// selfie.jpg is the professional photo (About Page); train_selfie.png is the playful one (blog)
export const SELFIE_URL = `${BASE_URL}/selfie.jpg`
export const TRAIN_SELFIE_URL = `${BASE_URL}/train_selfie.png`

const STARTED_CODING = new Date(2008, 5, 2) // June 2, 2008 (months are 0-indexed)

function fullYearsSince(start: Date, now = new Date()): number {
  const years = now.getFullYear() - start.getFullYear()
  const hadAnniversary =
    now.getMonth() > start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate())
  return hadAnniversary ? years : years - 1
}

export const YEARS_CODING = fullYearsSince(STARTED_CODING)

export const BLOG_INDEX_TITLE = 'Arend Peter'
export const BLOG_INDEX_DESCRIPTION = `I've been writing code for the last ${YEARS_CODING} years. This blog is an effort to share my learnings.`

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
  const title = escapeHtml(BLOG_INDEX_TITLE)
  const description = escapeHtml(BLOG_INDEX_DESCRIPTION)

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:image" content="${TRAIN_SELFIE_URL}">`,
    `<meta name="twitter:card" content="summary">`,
    `<link rel="alternate" type="application/rss+xml" href="${RSS_URL}" title="Arend Peter's Blog">`,
  ].join('\n')
}

export function generateAboutHead(): string {
  const canonicalUrl = `${BASE_URL}/about`
  const title = 'About | Arend Peter Castelein'
  const description =
    'Arend Peter Castelein: software engineer. Portfolio, experience, skills and contact details.'

  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="profile">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    `<meta property="og:image" content="${SELFIE_URL}">`,
    `<meta name="twitter:card" content="summary">`,
  ].join('\n')
}

export function generateBlogIndexBody(posts: PostSummary[]): string {
  const items = posts
    .map((post) => `  <li><a href="/blog/${post.slug}">${escapeHtml(post.meta.title)}</a></li>`)
    .join('\n')
  return `<ul>\n${items}\n</ul>`
}
