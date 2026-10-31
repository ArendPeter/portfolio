import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { posts } from 'virtual:posts'
import { SiteNav } from '../../components/SiteNav'
import { InlineLink } from '../../components/InlineLink'
import {
  BLOG_INDEX_DESCRIPTION,
  BLOG_INDEX_TITLE,
  YEARS_CODING,
} from '../../lib/posts/generateHead'
import { cn } from '../../utils/utils'

function formatDate(iso: string) {
  // T00:00:00 forces local-time parsing; bare date strings (e.g. "2026-10-01") parse as UTC midnight
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

type PhotoProps = React.HTMLAttributes<HTMLDivElement>
const Photo = ({ className }: PhotoProps) => (
  <div className={cn('shrink-0 w-44 md:w-56 aspect-[3/4] rounded-2xl overflow-hidden', className)}>
    <img
      src="/train_selfie.png"
      alt="Arend Peter Castelein on a train"
      className="w-full h-full object-cover"
    />
  </div>
)

export function BlogIndex() {
  useEffect(() => {
    const prev = document.title
    document.title = BLOG_INDEX_TITLE

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    const prevMeta = meta.content
    meta.content = BLOG_INDEX_DESCRIPTION

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
    <>
      <SiteNav />
      <div className="min-h-screen bg-bg text-body font-sans max-w-4xl mx-auto px-6 py-12">
        <section className="flex flex-col md:flex-row items-center gap-8 md:gap-16 mb-12">
          <div className="flex flex-col min-w-0 text-center items-center md:text-left md:items-start gap-4">
            <h1 className="text-4xl font-bold">{"Hi I'm Arend 👋"}</h1>
            <Photo className="md:hidden" />
            <p className="leading-relaxed">
              I&apos;ve been writing code for the last {YEARS_CODING} years. I&apos;ve developed{' '}
              <span className="whitespace-nowrap">
                <InlineLink href="https://stargardengames.com/" external>
                  video games
                </InlineLink>
                ,
              </span>{' '}
              led{' '}
              <span className="whitespace-nowrap">
                <InlineLink href="https://bettervoting.com/" external>
                  an open source voting website
                </InlineLink>
                ,
              </span>{' '}
              worked in{' '}
              <span className="whitespace-nowrap">
                <InlineLink
                  href="https://www.linkedin.com/in/arend-peter-castelein-530a5070/"
                  external
                >
                  big tech
                </InlineLink>
                ,
              </span>{' '}
              and sometimes I also make{' '}
              <span className="whitespace-nowrap">
                <InlineLink href="https://rcvchangedalaska.com/" external>
                  cool web explainers
                </InlineLink>
                .
              </span>{' '}
              Currently I&apos;m continuing my open source journey as a software engineer at{' '}
              <span className="whitespace-nowrap">
                <InlineLink href="https://fleetdm.com/" external>
                  Fleet
                </InlineLink>
                .
              </span>
            </p>
            <p className="leading-relaxed">
              I&apos;m committed to growing as an engineer every day, and this blog is an effort to
              share my learnings. I'm currently most interested in the frontier of AI assisted
              Software Development, however no AI is used in the writing of this blog. Hope you
              enjoy!
            </p>
          </div>
          <Photo className="hidden md:block" />
        </section>

        {posts.length === 0 ? (
          <p className="text-muted">No posts yet.</p>
        ) : (
          <ul aria-label="Posts" className="divide-y divide-border">
            {posts.map((post) => (
              <li key={post.slug} className="py-6">
                <Link to={`/blog/${post.slug}`} className="group block">
                  <p className="text-sm text-muted">{formatDate(post.meta.date)}</p>
                  <h2 className="text-xl font-semibold mt-1 group-hover:text-accent transition-colors">
                    {post.meta.title}
                  </h2>
                  {post.meta.description && (
                    <p className="text-muted mt-1">{post.meta.description}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
