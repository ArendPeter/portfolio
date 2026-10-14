import { Feed } from 'feed'
import type { Post } from './types'
import { BASE_URL } from './generateHead'

export function generateRss(posts: Post[]): string {
  const feed = new Feed({
    title: "Arend Peter's Blog",
    description: 'Writing by Arend Peter',
    id: `${BASE_URL}/`,
    link: `${BASE_URL}/`,
    language: 'en',
    feedLinks: { rss: `${BASE_URL}/rss.xml` },
    copyright: '',
  })

  for (const post of posts) {
    const link = `${BASE_URL}/blog/${post.slug}`
    feed.addItem({
      title: post.meta.title,
      id: link,
      link,
      description: post.meta.description,
      date: new Date(`${post.meta.updated ?? post.meta.date}T00:00:00Z`),
      published: new Date(`${post.meta.date}T00:00:00Z`),
    })
  }

  return feed.rss2()
}

export function generateSitemap(posts: Post[]): string {
  const urls: Array<{ loc: string; lastmod?: string }> = [
    { loc: `${BASE_URL}/` },
    { loc: `${BASE_URL}/blog` },
    ...posts.map((post) => ({
      loc: `${BASE_URL}/blog/${post.slug}`,
      lastmod: post.meta.updated ?? post.meta.date,
    })),
  ]

  const urlElements = urls
    .map(({ loc, lastmod }) => {
      const lastmodEl = lastmod != null ? `\n    <lastmod>${lastmod}</lastmod>` : ''
      return `  <url>\n    <loc>${loc}</loc>${lastmodEl}\n  </url>`
    })
    .join('\n')

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlElements}\n` +
    `</urlset>`
  )
}

export function generateRobotsTxt(): string {
  return `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`
}
