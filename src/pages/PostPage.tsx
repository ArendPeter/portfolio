import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { posts, getPostHtml } from 'virtual:posts'
import './PostPage.css'

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function setMetaTag(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

function setLinkTag(rel: string, type: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"][type="${type}"]`)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    el.type = type
    document.head.appendChild(el)
  }
  el.href = href
}

function removeLinkTag(rel: string, type: string) {
  document.querySelector(`link[rel="${rel}"][type="${type}"]`)?.remove()
}

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [html, setHtml] = useState<string | null>(null)

  const postSummary = posts.find((p) => p.slug === slug)

  useEffect(() => {
    if (!postSummary || !slug) return
    void getPostHtml(slug).then(setHtml)
  }, [slug, postSummary])

  useEffect(() => {
    const prevTitle = document.title
    if (postSummary) {
      document.title = `${postSummary.meta.title} | Arend Peter`
      setMetaTag('description', postSummary.meta.description)
      setLinkTag('alternate', 'application/rss+xml', '/rss.xml')
    } else {
      document.title = 'Post Not Found | Arend Peter'
    }
    return () => {
      document.title = prevTitle
      removeLinkTag('alternate', 'application/rss+xml')
    }
  }, [postSummary])

  if (!postSummary) {
    return (
      <div className="min-h-screen bg-bg text-body font-sans flex flex-col items-center justify-center gap-4">
        <p className="text-xl">Post not found</p>
        <Link to="/blog" className="text-accent hover:underline underline-offset-2">
          ← All posts
        </Link>
      </div>
    )
  }

  const { meta, readingTime } = postSummary
  const morePosts = posts.filter((p) => p.slug !== slug).slice(0, 3)

  return (
    <>
      <div className="post-sticky-bar">
        <Link to="/blog">← All posts</Link>
        <Link to="/">Arend Peter</Link>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-12 font-sans">
        <header className="mb-10">
          <p className="text-sm text-muted mb-4">
            {formatDate(meta.date)} · {readingTime} min read
          </p>
          <h1 className="text-4xl font-bold leading-tight mb-4">{meta.title}</h1>
          <p className="text-lg text-muted leading-relaxed">{meta.description}</p>
          {meta.updated && (
            <p className="text-sm text-muted mt-3">Updated {formatDate(meta.updated)}</p>
          )}
        </header>

        {html && <article className="post-prose" dangerouslySetInnerHTML={{ __html: html }} />}

        <div
          data-feedback-slot={slug}
          className="mt-16 rounded-lg border border-border bg-surface p-6"
        />

        {morePosts.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="text-xl font-semibold mb-6">More posts</h2>
            <ul className="flex flex-col gap-4">
              {morePosts.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/blog/${p.slug}`}
                    className="text-accent hover:underline underline-offset-2 font-medium"
                  >
                    {p.meta.title}
                  </Link>
                  <p className="text-sm text-muted mt-1">{p.meta.description}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/blog"
              className="inline-block mt-8 text-sm text-muted hover:text-accent transition-colors"
            >
              All posts →
            </Link>
          </section>
        )}
      </main>
    </>
  )
}
