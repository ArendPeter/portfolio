// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { generateRss, generateSitemap, generateRobotsTxt } from './generateFeed'
import type { Post } from './types'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    slug: 'my-post',
    meta: { title: 'My Post', date: '2024-01-15', description: 'A description.' },
    html: '<p>Content</p>',
    readingTime: 1,
    shareImage: null,
    images: [],
    ...overrides,
  }
}

describe('generateRss', () => {
  it('produces valid RSS2 envelope', () => {
    const xml = generateRss([])
    expect(xml).toContain('<rss')
    expect(xml).toContain('</rss>')
  })

  it('includes channel title', () => {
    const xml = generateRss([])
    expect(xml).toContain("Arend Peter's Blog")
  })

  it('includes atom:link self-reference to rss.xml', () => {
    const xml = generateRss([])
    expect(xml).toContain('https://arendpeter.com/rss.xml')
  })

  it('zero posts produces valid empty feed with no items', () => {
    const xml = generateRss([])
    expect(xml).not.toContain('<item>')
  })

  it('includes item title', () => {
    const xml = generateRss([makePost()])
    expect(xml).toContain('My Post')
  })

  it('includes item link as slash-less absolute URL', () => {
    const xml = generateRss([makePost()])
    expect(xml).toContain('https://arendpeter.com/blog/my-post')
    expect(xml).not.toContain('https://arendpeter.com/blog/my-post/')
  })

  it('includes item description as summary', () => {
    const xml = generateRss([makePost()])
    expect(xml).toContain('A description.')
  })

  it('includes pubDate from post date', () => {
    const xml = generateRss([makePost()])
    expect(xml).toContain('<pubDate>')
    expect(xml).toContain('Jan 2024')
  })

  it('includes multiple items', () => {
    const posts = [
      makePost({
        slug: 'post-a',
        meta: { title: 'Post A', date: '2024-02-01', description: 'desc a' },
      }),
      makePost({
        slug: 'post-b',
        meta: { title: 'Post B', date: '2024-01-01', description: 'desc b' },
      }),
    ]
    const xml = generateRss(posts)
    expect(xml).toContain('Post A')
    expect(xml).toContain('Post B')
    const itemCount = (xml.match(/<item>/g) ?? []).length
    expect(itemCount).toBe(2)
  })
})

describe('generateSitemap', () => {
  it('has valid XML declaration and urlset', () => {
    const xml = generateSitemap([])
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(xml).toContain('<urlset')
    expect(xml).toContain('</urlset>')
  })

  it('includes homepage and blog index entries', () => {
    const xml = generateSitemap([])
    expect(xml).toContain('<loc>https://arendpeter.com/</loc>')
    expect(xml).toContain('<loc>https://arendpeter.com/blog</loc>')
  })

  it('zero posts produces sitemap with only homepage and blog index', () => {
    const xml = generateSitemap([])
    const urlCount = (xml.match(/<url>/g) ?? []).length
    expect(urlCount).toBe(2)
  })

  it('includes post URL as slash-less absolute URL', () => {
    const xml = generateSitemap([makePost()])
    expect(xml).toContain('<loc>https://arendpeter.com/blog/my-post</loc>')
    expect(xml).not.toContain('https://arendpeter.com/blog/my-post/')
  })

  it('uses post date as lastmod when updated is not set', () => {
    const xml = generateSitemap([makePost()])
    expect(xml).toContain('<lastmod>2024-01-15</lastmod>')
  })

  it('uses updated as lastmod when updated is set', () => {
    const post = makePost({
      meta: { title: 'My Post', date: '2024-01-15', description: 'desc', updated: '2024-02-01' },
    })
    const xml = generateSitemap([post])
    expect(xml).toContain('<lastmod>2024-02-01</lastmod>')
  })

  it('includes all posts in sitemap', () => {
    const posts = [
      makePost({ slug: 'post-a', meta: { title: 'Post A', date: '2024-02-01', description: '' } }),
      makePost({ slug: 'post-b', meta: { title: 'Post B', date: '2024-01-01', description: '' } }),
    ]
    const xml = generateSitemap(posts)
    const urlCount = (xml.match(/<url>/g) ?? []).length
    expect(urlCount).toBe(4) // / + /blog + 2 posts
    expect(xml).toContain('https://arendpeter.com/blog/post-a')
    expect(xml).toContain('https://arendpeter.com/blog/post-b')
  })
})

describe('generateRobotsTxt', () => {
  it('allows all user agents', () => {
    const txt = generateRobotsTxt()
    expect(txt).toContain('User-agent: *')
    expect(txt).toContain('Allow: /')
  })

  it('includes sitemap directive pointing to sitemap.xml', () => {
    const txt = generateRobotsTxt()
    expect(txt).toContain('Sitemap: https://arendpeter.com/sitemap.xml')
  })
})
