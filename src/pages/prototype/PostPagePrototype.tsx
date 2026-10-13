// PROTOTYPE — throwaway (issue #54 "Prototype: Post page design").
// Three structurally different Post page variants on /prototype/post, switchable via ?variant=A|B|C.
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PrototypeSwitcher, useVariant } from '../../components/PrototypeSwitcher'
import { formatDate, samplePosts, type SamplePost } from './samplePosts'
import './postPrototype.css'

const variants = [
  { key: 'A', name: 'Site-native column' },
  { key: 'B', name: 'Editorial / serif' },
  { key: 'C', name: 'Docs-style sidebar + TOC' },
]

const post = samplePosts[0]
const INDEX = '/prototype/blog'

/** The reserved per-Post slot for the future private 👍/👎 → form widget. Rendered here as a rough mock. */
function FeedbackSlot({ slug, look }: { slug: string; look: 'card' | 'line' | 'compact' }) {
  const label = (
    <span className="block text-[10px] uppercase tracking-widest text-muted/70 mb-2">
      reserved feedback slot · key “{slug}”
    </span>
  )
  if (look === 'line')
    return (
      <div
        data-feedback-slot={slug}
        className="border border-dashed border-border rounded-md p-4 text-center"
      >
        {label}
        <span className="text-muted">Was this worth reading?</span>{' '}
        <button className="mx-1 text-xl cursor-pointer">👍</button>
        <button className="mx-1 text-xl cursor-pointer">👎</button>
      </div>
    )
  if (look === 'compact')
    return (
      <div
        data-feedback-slot={slug}
        className="border border-dashed border-border rounded-md p-3 text-sm"
      >
        {label}
        <p className="text-muted mb-2">Helpful?</p>
        <div className="flex gap-2">
          <button className="flex-1 rounded border border-border py-1 cursor-pointer">👍</button>
          <button className="flex-1 rounded border border-border py-1 cursor-pointer">👎</button>
        </div>
      </div>
    )
  return (
    <div
      data-feedback-slot={slug}
      className="border border-dashed border-border rounded-lg bg-surface p-6"
    >
      {label}
      <p className="font-semibold mb-1">Did this post land?</p>
      <p className="text-sm text-muted mb-4">Private feedback — only I see it.</p>
      <div className="flex gap-3">
        <button className="rounded-md border border-accent text-accent px-4 py-2 cursor-pointer">
          👍 Yes
        </button>
        <button className="rounded-md border border-border text-muted px-4 py-2 cursor-pointer">
          👎 Not really
        </button>
      </div>
    </div>
  )
}

function OtherPosts({ current }: { current: SamplePost }) {
  return (
    <ul className="space-y-2">
      {samplePosts
        .filter((p) => p.slug !== current.slug)
        .slice(0, 3)
        .map((p) => (
          <li key={p.slug}>
            <Link to={INDEX} className="text-body hover:text-accent transition-colors">
              {p.title}
            </Link>{' '}
            <span className="text-sm text-muted">· {formatDate(p.date, 'short')}</span>
          </li>
        ))}
    </ul>
  )
}

/* ---------- A: site-native — sticky site bar, Inter, single 2xl column ---------- */
function VariantA() {
  return (
    <>
      <nav className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to={INDEX} className="text-sm text-muted hover:text-accent transition-colors">
            ← All posts
          </Link>
          <a href="/" className="font-semibold text-body hover:text-accent transition-colors">
            Arend Peter
          </a>
        </div>
      </nav>
      <article className="max-w-2xl mx-auto px-6 py-12">
        <header className="mb-10">
          <p className="text-sm text-muted mb-3">
            {formatDate(post.date)} · {post.readingMinutes} min read
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>
          <p className="text-lg text-muted mt-4">{post.description}</p>
        </header>
        <div className="prose-a" dangerouslySetInnerHTML={{ __html: post.html }} />
        <div className="mt-16">
          <FeedbackSlot slug={post.slug} look="card" />
        </div>
        <footer className="mt-12 pt-8 border-t border-border">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted mb-4">
            More posts
          </p>
          <OtherPosts current={post} />
          <Link to={INDEX} className="inline-block mt-6 text-accent hover:underline">
            All posts →
          </Link>
        </footer>
      </article>
    </>
  )
}

/* ---------- B: editorial — no bar, centered masthead, serif body, wide media ---------- */
function VariantB() {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap'
    document.head.appendChild(link)
    return () => link.remove()
  }, [])
  return (
    <div className="px-5 pb-24">
      <div className="max-w-[56rem] mx-auto pt-6">
        <Link to={INDEX} className="text-sm text-muted hover:text-accent transition-colors">
          ← Arend Peter / Blog
        </Link>
      </div>
      <header className="max-w-3xl mx-auto text-center pt-20 pb-14">
        <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
          {post.title}
        </h1>
        <p className="mt-6 text-muted">
          <time>{formatDate(post.date)}</time>
        </p>
        <div className="mx-auto mt-10 h-px w-16 bg-accent" />
      </header>
      <div className="prose-b" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="max-w-[40rem] mx-auto mt-20">
        <FeedbackSlot slug={post.slug} look="line" />
        <p className="text-center mt-12">
          <Link to={INDEX} className="text-muted hover:text-accent transition-colors">
            ← Read other posts
          </Link>
        </p>
      </div>
    </div>
  )
}

/* ---------- C: docs-style — left rail with back link, meta, TOC, feedback; content right ---------- */
function VariantC() {
  const toc = [...post.html.matchAll(/<h([23]) id="([^"]+)">([^<]+)<\/h[23]>/g)].map((m) => ({
    level: Number(m[1]),
    id: m[2],
    text: m[3],
  }))
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 md:grid md:grid-cols-[220px_1fr] md:gap-12">
      <aside className="md:sticky md:top-10 md:self-start mb-10 md:mb-0 text-sm">
        <Link to={INDEX} className="text-muted hover:text-accent transition-colors">
          ← Blog
        </Link>
        <div className="hidden md:block mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
            On this page
          </p>
          <ul className="space-y-2 border-l border-border">
            {toc.map((t) => (
              <li key={t.id} style={{ paddingLeft: t.level === 3 ? '1.75rem' : '0.75rem' }}>
                <a
                  href={`#${t.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="text-muted hover:text-accent transition-colors"
                >
                  {t.text}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <FeedbackSlot slug={post.slug} look="compact" />
          </div>
        </div>
      </aside>
      <article className="min-w-0 max-w-3xl">
        <header className="mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
          <p className="text-sm text-muted mt-3">
            {formatDate(post.date)} · {post.readingMinutes} min read
          </p>
        </header>
        <div className="prose-c" dangerouslySetInnerHTML={{ __html: post.html }} />
        <div className="mt-14 md:hidden">
          <FeedbackSlot slug={post.slug} look="compact" />
        </div>
        <nav className="mt-14 grid grid-cols-2 gap-4 text-sm">
          <Link
            to={INDEX}
            className="rounded-md border border-border p-4 hover:border-accent transition-colors"
          >
            <span className="text-muted block">← Newer</span>
            <span className="font-medium">(none — newest post)</span>
          </Link>
          <Link
            to={INDEX}
            className="rounded-md border border-border p-4 text-right hover:border-accent transition-colors"
          >
            <span className="text-muted block">Older →</span>
            <span className="font-medium">{samplePosts[1].title}</span>
          </Link>
        </nav>
      </article>
    </div>
  )
}

export function PostPagePrototype() {
  const variant = useVariant(variants)
  return (
    <div className="min-h-screen bg-bg text-body font-sans">
      {variant === 'A' && <VariantA />}
      {variant === 'B' && <VariantB />}
      {variant === 'C' && <VariantC />}
      <PrototypeSwitcher variants={variants} />
    </div>
  )
}
