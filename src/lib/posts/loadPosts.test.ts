// @vitest-environment node
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { loadPosts } from './loadPosts'

const dirsToClean: string[] = []

afterAll(() => {
  for (const dir of dirsToClean) {
    rmSync(dir, { recursive: true, force: true })
  }
})

interface PostFile {
  md: string
  files?: Record<string, string>
}

function makePostsDir(posts: Record<string, PostFile | string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'test-posts-'))
  dirsToClean.push(dir)
  for (const [slug, content] of Object.entries(posts)) {
    const postDir = join(dir, slug)
    mkdirSync(postDir, { recursive: true })
    if (typeof content === 'string') {
      writeFileSync(join(postDir, 'index.md'), content)
    } else {
      writeFileSync(join(postDir, 'index.md'), content.md)
      if (content.files) {
        for (const [name, data] of Object.entries(content.files)) {
          writeFileSync(join(postDir, name), data)
        }
      }
    }
  }
  return dir
}

const MINIMAL_POST = `---
title: Test Post
date: 2024-01-15
description: A test post for testing.
---

This is the content.
`

describe('loadPosts', () => {
  describe('zero posts', () => {
    it('returns empty array for empty directory', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'test-posts-'))
      dirsToClean.push(dir)
      const posts = await loadPosts(dir)
      expect(posts).toEqual([])
    })

    it('returns empty array when directory does not exist', async () => {
      const posts = await loadPosts('/tmp/does-not-exist-xyz-123')
      expect(posts).toEqual([])
    })
  })

  describe('valid post structure', () => {
    it('returns correct shape for a minimal post', async () => {
      const dir = makePostsDir({ 'my-post': MINIMAL_POST })
      const posts = await loadPosts(dir)
      expect(posts).toHaveLength(1)
      const [post] = posts
      expect(post.slug).toBe('my-post')
      expect(post.meta.title).toBe('Test Post')
      expect(post.meta.date).toBe('2024-01-15')
      expect(post.meta.description).toBe('A test post for testing.')
      expect(post.meta.updated).toBeUndefined()
      expect(post.meta.image).toBeUndefined()
      expect(post.meta.aliases).toBeUndefined()
      expect(post.html).toContain('This is the content')
      expect(typeof post.readingTime).toBe('number')
      expect(post.readingTime).toBeGreaterThanOrEqual(1)
      expect(post.images).toEqual([])
    })

    it('returns correct meta for a post with all optional fields', async () => {
      const dir = makePostsDir({
        'full-post': `---
title: Full Post
date: 2024-02-20
description: A full test post.
updated: 2024-03-01
image: photo.jpg
aliases:
  - An Alias
---

Content here.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.meta.updated).toBe('2024-03-01')
      expect(posts[0]!.meta.image).toBe('photo.jpg')
      expect(posts[0]!.meta.aliases).toEqual(['An Alias'])
    })

    it('ignores hidden directories (starting with .)', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'test-posts-'))
      dirsToClean.push(dir)
      mkdirSync(join(dir, '.hidden'), { recursive: true })
      writeFileSync(join(dir, '.hidden', 'index.md'), MINIMAL_POST)
      const posts = await loadPosts(dir)
      expect(posts).toHaveLength(0)
    })
  })

  describe('slug validation', () => {
    it('throws for uppercase slug', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'test-posts-'))
      dirsToClean.push(dir)
      mkdirSync(join(dir, 'InvalidSlug'), { recursive: true })
      writeFileSync(join(dir, 'InvalidSlug', 'index.md'), MINIMAL_POST)
      await expect(loadPosts(dir)).rejects.toThrow('InvalidSlug')
    })

    it('throws for slug with spaces', async () => {
      const dir = mkdtempSync(join(tmpdir(), 'test-posts-'))
      dirsToClean.push(dir)
      mkdirSync(join(dir, 'invalid slug'), { recursive: true })
      writeFileSync(join(dir, 'invalid slug', 'index.md'), MINIMAL_POST)
      await expect(loadPosts(dir)).rejects.toThrow('invalid slug')
    })

    it('accepts valid kebab-case slug', async () => {
      const dir = makePostsDir({ 'my-valid-post-123': MINIMAL_POST })
      const posts = await loadPosts(dir)
      expect(posts[0]!.slug).toBe('my-valid-post-123')
    })
  })

  describe('frontmatter validation', () => {
    it('throws when title is missing, naming the post', async () => {
      const dir = makePostsDir({
        'my-post': `---
date: 2024-01-15
description: Missing title.
---
Content.
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })

    it('throws when date is missing, naming the post', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: Test Post
description: Missing date.
---
Content.
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })

    it('allows description to be omitted', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: Test Post
date: 2024-01-15
---
Content.
`,
      })
      const [post] = await loadPosts(dir)
      expect(post.meta.description).toBeUndefined()
    })

    it('throws for invalid date format', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: Test Post
date: January 15, 2024
description: Bad date.
---
Content.
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })

    it('throws for invalid updated format', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: Test Post
date: 2024-01-15
description: Valid.
updated: 2024/03/01
---
Content.
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })
  })

  describe('H1 rule', () => {
    it('throws when post body contains a # H1, naming the post', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: Test Post
date: 2024-01-15
description: Has an H1.
---

# This is a top-level heading

Content below.
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })

    it('allows ## H2 and deeper headings', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: Test Post
date: 2024-01-15
description: Has H2.
---

## This is fine

Content.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).toContain('h2')
    })
  })

  describe('Obsidian wikilinks', () => {
    it('renders [[Note]] as plain text when not a post', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post with a wikilink to a non-post.
---

See [[Private Note]] for details.
`,
        },
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).not.toContain('href')
      expect(posts[0]!.html).toContain('Private Note')
    })

    it('renders [[Note|alias]] as plain alias text when not a post', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post with an aliased wikilink to a non-post.
---

See [[Private Note|the note]] for details.
`,
        },
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).not.toContain('href')
      expect(posts[0]!.html).toContain('the note')
      expect(posts[0]!.html).not.toContain('Private Note')
    })

    it('renders [[Post]] as a link when referencing another post by title', async () => {
      const dir = makePostsDir({
        'post-a': {
          md: `---
title: Post A
date: 2024-01-15
description: Post A.
---

See [[Post B]] for details.
`,
        },
        'post-b': {
          md: `---
title: Post B
date: 2024-01-10
description: Post B.
---

Content of B.
`,
        },
      })
      const posts = await loadPosts(dir)
      const postA = posts.find((p) => p.slug === 'post-a')!
      expect(postA.html).toContain('href="/blog/post-b"')
      expect(postA.html).toContain('Post B')
    })

    it('renders [[Post|alias]] as an aliased link to a post', async () => {
      const dir = makePostsDir({
        'post-a': {
          md: `---
title: Post A
date: 2024-01-15
description: Post A.
---

See [[Post B|the other post]] for details.
`,
        },
        'post-b': {
          md: `---
title: Post B
date: 2024-01-10
description: Post B.
---

Content.
`,
        },
      })
      const posts = await loadPosts(dir)
      const postA = posts.find((p) => p.slug === 'post-a')!
      expect(postA.html).toContain('href="/blog/post-b"')
      expect(postA.html).toContain('the other post')
    })

    it('renders [[Post#Heading]] as a link with heading anchor', async () => {
      const dir = makePostsDir({
        'post-a': {
          md: `---
title: Post A
date: 2024-01-15
description: Post A.
---

See [[Post B#Some Section]] for details.
`,
        },
        'post-b': {
          md: `---
title: Post B
date: 2024-01-10
description: Post B.
---

## Some Section

Content.
`,
        },
      })
      const posts = await loadPosts(dir)
      const postA = posts.find((p) => p.slug === 'post-a')!
      expect(postA.html).toContain('href="/blog/post-b#some-section"')
    })

    it('resolves wikilink by post alias', async () => {
      const dir = makePostsDir({
        'post-a': {
          md: `---
title: Post A
date: 2024-01-15
description: Post A.
---

See [[My Alias]] for details.
`,
        },
        'post-b': {
          md: `---
title: Post B
date: 2024-01-10
description: Post B.
aliases:
  - My Alias
---

Content.
`,
        },
      })
      const posts = await loadPosts(dir)
      const postA = posts.find((p) => p.slug === 'post-a')!
      expect(postA.html).toContain('href="/blog/post-b"')
    })

    it('resolves wikilink case-insensitively', async () => {
      const dir = makePostsDir({
        'post-a': {
          md: `---
title: Post A
date: 2024-01-15
description: Post A.
---

See [[post b]] for details.
`,
        },
        'post-b': {
          md: `---
title: Post B
date: 2024-01-10
description: Post B.
---

Content.
`,
        },
      })
      const posts = await loadPosts(dir)
      const postA = posts.find((p) => p.slug === 'post-a')!
      expect(postA.html).toContain('href="/blog/post-b"')
    })

    it('strips leading emoji when resolving wikilinks', async () => {
      const dir = makePostsDir({
        'post-a': {
          md: `---
title: Post A
date: 2024-01-15
description: Post A.
---

See [[Fox Post]] for details.
`,
        },
        'post-b': {
          md: `---
title: 🦊 Fox Post
date: 2024-01-10
description: Post B.
---

Content.
`,
        },
      })
      const posts = await loadPosts(dir)
      const postA = posts.find((p) => p.slug === 'post-a')!
      expect(postA.html).toContain('href="/blog/post-b"')
    })

    it('throws when two posts match the same name', async () => {
      const dir = makePostsDir({
        'post-one': `---
title: Shared Name
date: 2024-01-15
description: First post.
---
Content.
`,
        'post-two': `---
title: Shared Name
date: 2024-01-10
description: Second post.
---
Content.
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('Shared Name')
    })
  })

  describe('Obsidian image embeds', () => {
    it('renders ![[img.jpg]] as an img element', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post with an image embed.
---

![[photo.jpg]]
`,
          files: { 'photo.jpg': '' },
        },
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).toContain('<img')
      expect(posts[0]!.html).toContain('photo.jpg')
      expect(posts[0]!.images).toContain('photo.jpg')
    })

    it('renders ![[img.jpg|400]] as an img with width attribute', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post with a sized image embed.
---

![[photo.jpg|400]]
`,
          files: { 'photo.jpg': '' },
        },
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).toMatch(/width[="].*?400/)
    })

    it('throws when image file is missing from post folder, naming the post', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post with a missing image.
---

![[missing.jpg]]
`,
        },
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })

    it('throws for note embed ![[Note]], naming the post', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with a note embed.
---

![[Private Note]]
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })

    it('throws for block embed ![[Note#^block]], naming the post', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with a block embed.
---

![[Note#^blockref]]
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })
  })

  describe('standard Markdown images', () => {
    it('renders ![alt](img.jpg) and adds to images list', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post with a standard image.
---

![A photo](photo.jpg)
`,
          files: { 'photo.jpg': '' },
        },
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).toContain('<img')
      expect(posts[0]!.html).toContain('photo.jpg')
      expect(posts[0]!.images).toContain('photo.jpg')
    })

    it('throws when standard image file is missing, naming the post', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post with a missing standard image.
---

![Missing](missing.jpg)
`,
        },
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })
  })

  describe('Dataview blocks', () => {
    it('throws for a dataview code block, naming the post', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with dataview.
---

\`\`\`dataview
LIST FROM #tag
\`\`\`
`,
      })
      await expect(loadPosts(dir)).rejects.toThrow('my-post')
    })
  })

  describe('Obsidian callouts', () => {
    it('renders > [!note] callout block', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with a callout.
---

> [!note]
> This is a note callout.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).toContain('This is a note callout')
    })

    it('renders collapsible callout with - modifier', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with a collapsible callout.
---

> [!warning]-
> This is collapsible.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).toContain('This is collapsible')
    })
  })

  describe('Obsidian comments', () => {
    it('removes %%comment%% from output', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with an Obsidian comment.
---

Visible text. %%This is a comment%% More visible text.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).not.toContain('This is a comment')
      expect(posts[0]!.html).toContain('Visible text')
      expect(posts[0]!.html).toContain('More visible text')
    })

    it('removes multi-word %%comments%%', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with a multi-word comment.
---

Before. %%TODO: fix this later%% After.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).not.toContain('TODO')
      expect(posts[0]!.html).toContain('Before')
      expect(posts[0]!.html).toContain('After')
    })
  })

  describe('highlight syntax', () => {
    it('renders ==highlighted text== as <mark>', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with highlights.
---

This is ==highlighted text== in a sentence.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).toContain('<mark>highlighted text</mark>')
    })
  })

  describe('footnotes', () => {
    it('renders GFM-style footnotes', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with footnotes.
---

See this[^1] for details.

[^1]: The footnote content.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.html).toMatch(/fn|footnote/i)
      expect(posts[0]!.html).toContain('The footnote content')
    })
  })

  describe('reading time', () => {
    it('returns at least 1 minute for short content', async () => {
      const dir = makePostsDir({
        'short-post': `---
title: Short Post
date: 2024-01-15
description: Very short.
---

Hi.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.readingTime).toBeGreaterThanOrEqual(1)
    })

    it('returns more than 1 minute for 300+ word content', async () => {
      const longContent = Array.from({ length: 300 }, (_, i) => `word${i}`).join(' ')
      const dir = makePostsDir({
        'long-post': `---
title: Long Post
date: 2024-01-15
description: Long post.
---

${longContent}
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.readingTime).toBeGreaterThan(1)
    })
  })

  describe('share image', () => {
    it('uses the image field from frontmatter as shareImage', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post.
image: cover.jpg
---

Content without embedded images.
`,
          files: { 'cover.jpg': '' },
        },
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.shareImage).toBe('cover.jpg')
    })

    it('falls back to first embedded image when no image field', async () => {
      const dir = makePostsDir({
        'my-post': {
          md: `---
title: My Post
date: 2024-01-15
description: A post.
---

![[first.jpg]]

![[second.jpg]]
`,
          files: { 'first.jpg': '', 'second.jpg': '' },
        },
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.shareImage).toBe('first.jpg')
    })

    it('returns null when no image field and no embedded images', async () => {
      const dir = makePostsDir({
        'my-post': `---
title: My Post
date: 2024-01-15
description: A post with no images.
---

Just text content here.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.shareImage).toBeNull()
    })
  })

  describe('sort order', () => {
    it('returns posts sorted newest first by date', async () => {
      const dir = makePostsDir({
        'newer-post': `---
title: Newer Post
date: 2024-03-01
description: Newer.
---
Content.
`,
        'older-post': `---
title: Older Post
date: 2024-01-01
description: Older.
---
Content.
`,
        'middle-post': `---
title: Middle Post
date: 2024-02-01
description: Middle.
---
Content.
`,
      })
      const posts = await loadPosts(dir)
      expect(posts[0]!.slug).toBe('newer-post')
      expect(posts[1]!.slug).toBe('middle-post')
      expect(posts[2]!.slug).toBe('older-post')
    })
  })
})
