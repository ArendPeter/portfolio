// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  generatePostHead,
  generateBlogIndexHead,
  generateBlogIndexBody,
  SELFIE_URL,
} from './generateHead'
import type { Post, PostSummary } from './types'

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    slug: 'my-post',
    meta: {
      title: 'My Post',
      date: '2024-01-15',
      description: 'A description.',
    },
    html: '<p>Content</p>',
    readingTime: 1,
    shareImage: null,
    images: [],
    ...overrides,
  }
}

describe('generatePostHead', () => {
  it('includes <title> with post title', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('<title>My Post</title>')
  })

  it('includes meta description', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('<meta name="description" content="A description.">')
  })

  it('includes canonical link with no trailing slash', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('<link rel="canonical" href="https://arendpeter.com/blog/my-post">')
  })

  it('includes og:type=article', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('og:type" content="article"')
  })

  it('includes og:title', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('og:title" content="My Post"')
  })

  it('includes og:description', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('og:description" content="A description."')
  })

  it('includes og:url as absolute URL with no trailing slash', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('og:url" content="https://arendpeter.com/blog/my-post"')
  })

  it('includes og:image with the provided URL', () => {
    const imageUrl = 'https://arendpeter.com/assets/cover-abc123.jpg'
    const html = generatePostHead(makePost(), imageUrl, 'summary_large_image')
    expect(html).toContain(`og:image" content="${imageUrl}"`)
  })

  it('includes article:published_time in ISO 8601 format', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('article:published_time" content="2024-01-15T00:00:00Z"')
  })

  it('includes article:modified_time when updated field is set', () => {
    const post = makePost({
      meta: {
        title: 'My Post',
        date: '2024-01-15',
        description: 'A description.',
        updated: '2024-02-01',
      },
    })
    const html = generatePostHead(post, SELFIE_URL, 'summary')
    expect(html).toContain('article:modified_time" content="2024-02-01T00:00:00Z"')
  })

  it('omits article:modified_time when updated is not set', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).not.toContain('article:modified_time')
  })

  it('uses summary_large_image when post has an explicit image field (case 1)', () => {
    const post = makePost({ shareImage: 'cover.jpg' })
    const html = generatePostHead(
      post,
      'https://arendpeter.com/assets/cover-abc.jpg',
      'summary_large_image',
    )
    expect(html).toContain('twitter:card" content="summary_large_image"')
  })

  it('uses summary_large_image when post has first embedded image as share image (case 2)', () => {
    const post = makePost({ shareImage: 'first.jpg', images: ['first.jpg', 'second.jpg'] })
    const html = generatePostHead(
      post,
      'https://arendpeter.com/assets/first-abc.jpg',
      'summary_large_image',
    )
    expect(html).toContain('twitter:card" content="summary_large_image"')
  })

  it('uses summary twitter card for selfie fallback when post has no images (case 3)', () => {
    const post = makePost({ shareImage: null })
    const html = generatePostHead(post, SELFIE_URL, 'summary')
    expect(html).toContain('twitter:card" content="summary"')
    expect(html).toContain(SELFIE_URL)
  })

  it('includes RSS autodiscovery link', () => {
    const html = generatePostHead(makePost(), SELFIE_URL, 'summary')
    expect(html).toContain('rel="alternate"')
    expect(html).toContain('type="application/rss+xml"')
    expect(html).toContain('https://arendpeter.com/rss.xml')
  })

  it('HTML-escapes title with <, >, &, and "', () => {
    const post = makePost({
      meta: { title: 'A <b>bold</b> & "quoted"', date: '2024-01-15', description: 'desc' },
    })
    const html = generatePostHead(post, SELFIE_URL, 'summary')
    expect(html).toContain('&lt;b&gt;bold&lt;/b&gt;')
    expect(html).toContain('&amp;')
    expect(html).toContain('&quot;quoted&quot;')
    expect(html).not.toContain('<b>')
  })

  it('HTML-escapes description with special characters', () => {
    const post = makePost({
      meta: { title: 'Title', date: '2024-01-15', description: 'A post & <a thing>' },
    })
    const html = generatePostHead(post, SELFIE_URL, 'summary')
    expect(html).toContain('&amp; &lt;a thing&gt;')
  })

  it('omits description meta tags when description is absent', () => {
    const post = makePost({ meta: { title: 'Title', date: '2024-01-15' } })
    const html = generatePostHead(post, SELFIE_URL, 'summary')
    expect(html).not.toContain('name="description"')
    expect(html).not.toContain('og:description')
  })
})

describe('generateBlogIndexHead', () => {
  it('includes a title tag', () => {
    const html = generateBlogIndexHead()
    expect(html).toMatch(/<title>.+<\/title>/)
  })

  it('includes meta description', () => {
    const html = generateBlogIndexHead()
    expect(html).toContain('<meta name="description"')
  })

  it('includes canonical link to /blog with no trailing slash', () => {
    const html = generateBlogIndexHead()
    expect(html).toContain('<link rel="canonical" href="https://arendpeter.com/blog">')
  })

  it('includes og:type=website', () => {
    const html = generateBlogIndexHead()
    expect(html).toContain('og:type" content="website"')
  })

  it('includes og:url pointing to /blog', () => {
    const html = generateBlogIndexHead()
    expect(html).toContain('og:url" content="https://arendpeter.com/blog"')
  })

  it('includes RSS autodiscovery link', () => {
    const html = generateBlogIndexHead()
    expect(html).toContain('rel="alternate"')
    expect(html).toContain('type="application/rss+xml"')
    expect(html).toContain('https://arendpeter.com/rss.xml')
  })
})

describe('generateBlogIndexBody', () => {
  it('renders a list of post links', () => {
    const posts: PostSummary[] = [
      {
        slug: 'post-a',
        meta: { title: 'Post A', date: '2024-01-01', description: '' },
        readingTime: 1,
        shareImage: null,
        images: [],
      },
      {
        slug: 'post-b',
        meta: { title: 'Post B', date: '2024-01-02', description: '' },
        readingTime: 1,
        shareImage: null,
        images: [],
      },
    ]
    const html = generateBlogIndexBody(posts)
    expect(html).toContain('<a href="/blog/post-a">')
    expect(html).toContain('Post A')
    expect(html).toContain('<a href="/blog/post-b">')
    expect(html).toContain('Post B')
  })

  it('HTML-escapes post titles in the index body', () => {
    const posts: PostSummary[] = [
      {
        slug: 'html-post',
        meta: { title: 'Title <script>', date: '2024-01-01', description: '' },
        readingTime: 1,
        shareImage: null,
        images: [],
      },
    ]
    const html = generateBlogIndexBody(posts)
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('returns a ul element for empty posts', () => {
    const html = generateBlogIndexBody([])
    expect(html).toContain('<ul>')
    expect(html).toContain('</ul>')
  })
})
