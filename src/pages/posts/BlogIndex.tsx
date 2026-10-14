import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { posts } from 'virtual:posts'

function formatDate(iso: string) {
  // T00:00:00 forces local-time parsing; bare date strings (e.g. "2026-10-01") parse as UTC midnight
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function BlogIndex() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Blog — Arend Peter'

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    const prevMeta = meta.content
    meta.content = 'Personal writing by Arend Peter.'

    const rss = document.createElement('link')
    rss.rel = 'alternate'
    rss.type = 'application/rss+xml'
    rss.title = 'Arend Peter — Blog'
    rss.href = '/rss.xml'
    document.head.appendChild(rss)

    return () => {
      document.title = prev
      if (meta) meta.content = prevMeta
      rss.remove()
    }
  }, [])

  return (
    <div className="min-h-screen bg-bg text-body font-sans">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-12">
          <Link to="/" className="text-sm text-muted hover:text-accent transition-colors">
            ← arendpeter.com
          </Link>
          <h1 className="text-4xl font-bold mt-6">Blog</h1>
          <p className="text-muted mt-2">Personal writing by Arend Peter.</p>
          <p className="text-xs text-muted mt-2">
            <a href="/rss.xml" className="hover:text-accent transition-colors">
              RSS
            </a>
          </p>
        </header>

        {posts.length === 0 ? (
          <p className="text-muted">No posts yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((post) => (
              <li key={post.slug} className="py-6">
                <Link to={`/blog/${post.slug}`} className="group block">
                  <p className="text-sm text-muted">{formatDate(post.meta.date)}</p>
                  <h2 className="text-xl font-semibold mt-1 group-hover:text-accent transition-colors">
                    {post.meta.title}
                  </h2>
                  <p className="text-muted mt-1">{post.meta.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
