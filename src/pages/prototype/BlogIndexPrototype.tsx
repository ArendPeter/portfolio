// PROTOTYPE — throwaway (issue #54 "Prototype: Post page design").
// Three structurally different Blog Index variants on /prototype/blog, switchable via ?variant=A|B|C.
import { Link } from 'react-router-dom'
import { PrototypeSwitcher, useVariant } from '../../components/PrototypeSwitcher'
import { formatDate, samplePosts } from './samplePosts'

const variants = [
  { key: 'A', name: 'Rows with descriptions' },
  { key: 'B', name: 'Compact, grouped by year' },
  { key: 'C', name: 'Card grid with covers' },
]

const POST = '/prototype/post'

function Masthead({ centered = false }: { centered?: boolean }) {
  return (
    <header className={centered ? 'text-center mb-14' : 'mb-12'}>
      <a href="/" className="text-sm text-muted hover:text-accent transition-colors">
        ← arendpeter.com
      </a>
      <h1 className="text-4xl font-bold mt-6">Blog</h1>
      <p className="text-muted mt-2">Personal writing by Arend Peter.</p>
      <p className="text-xs text-muted mt-2">
        <a href="/blog/rss.xml" className="hover:text-accent">
          RSS
        </a>
      </p>
    </header>
  )
}

/* ---------- A: one column, each Post a row with date, title, description ---------- */
function VariantA() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Masthead />
      <ul className="divide-y divide-border">
        {samplePosts.map((p) => (
          <li key={p.slug} className="py-6">
            <Link to={POST} className="group block">
              <p className="text-sm text-muted">{formatDate(p.date)}</p>
              <h2 className="text-xl font-semibold mt-1 group-hover:text-accent transition-colors">
                {p.title}
              </h2>
              <p className="text-muted mt-1">{p.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ---------- B: titles only, date column, grouped under year headings ---------- */
function VariantB() {
  const byYear = Object.entries(
    samplePosts.reduce<Record<string, typeof samplePosts>>((acc, p) => {
      ;(acc[p.date.slice(0, 4)] ??= []).push(p)
      return acc
    }, {}),
  ).sort(([a], [b]) => Number(b) - Number(a))
  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <Masthead />
      {byYear.map(([year, posts]) => (
        <section key={year} className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent mb-3">
            {year}
          </h2>
          <ul className="space-y-2">
            {posts.map((p) => (
              <li key={p.slug} className="flex gap-6 items-baseline">
                <span className="w-16 shrink-0 text-sm text-muted tabular-nums">
                  {new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Link to={POST} className="hover:text-accent transition-colors">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/* ---------- C: ProjectCard-ish grid; newest Post featured full-width ---------- */
function VariantC() {
  const [featured, ...rest] = samplePosts
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Masthead centered />
      <Link
        to={POST}
        className="group block rounded-lg border border-border bg-surface overflow-hidden hover:border-accent hover:-translate-y-0.5 transition-all mb-8 md:grid md:grid-cols-2"
      >
        {featured.cover && (
          <img src={featured.cover} alt="" className="w-full h-full object-cover" />
        )}
        <div className="p-6">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">Latest</p>
          <h2 className="text-2xl font-bold group-hover:text-accent transition-colors">
            {featured.title}
          </h2>
          <p className="text-muted mt-2">{featured.description}</p>
          <p className="text-sm text-muted mt-4">
            {formatDate(featured.date)} · {featured.readingMinutes} min read
          </p>
        </div>
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rest.map((p) => (
          <Link
            key={p.slug}
            to={POST}
            className="group rounded-lg border border-border bg-surface overflow-hidden hover:border-accent hover:-translate-y-0.5 transition-all"
          >
            {p.cover ? (
              <img src={p.cover} alt="" className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-accent/30 to-surface" />
            )}
            <div className="p-5">
              <h2 className="text-lg font-semibold group-hover:text-accent transition-colors">
                {p.title}
              </h2>
              <p className="text-sm text-muted mt-1">{p.description}</p>
              <p className="text-xs text-muted mt-3">{formatDate(p.date)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function BlogIndexPrototype() {
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
