import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BlogIndex } from './BlogIndex'

const postsRef = vi.hoisted(() => ({
  current: [] as Array<{
    slug: string
    meta: { title: string; date: string; description: string }
    readingTime: number
    shareImage: string | null
    images: string[]
  }>,
}))

vi.mock('virtual:posts', () => ({
  get posts() {
    return postsRef.current
  },
  getPostHtml: vi.fn().mockResolvedValue(null),
}))

const samplePosts = [
  {
    slug: 'newer-post',
    meta: { title: 'Newer Post', date: '2026-10-01', description: 'The newer description.' },
    readingTime: 3,
    shareImage: null,
    images: [],
  },
  {
    slug: 'older-post',
    meta: { title: 'Older Post', date: '2025-06-01', description: 'The older description.' },
    readingTime: 5,
    shareImage: null,
    images: [],
  },
]

function renderBlogIndex() {
  return render(
    <MemoryRouter>
      <BlogIndex />
    </MemoryRouter>,
  )
}

describe('BlogIndex', () => {
  beforeEach(() => {
    postsRef.current = [...samplePosts]
  })

  it('renders posts in the given order (newest first)', () => {
    renderBlogIndex()
    const items = screen.getAllByRole('listitem')
    expect(within(items[0]).getByText('Newer Post')).toBeInTheDocument()
    expect(within(items[1]).getByText('Older Post')).toBeInTheDocument()
  })

  it('links each post row to /blog/<slug>', () => {
    renderBlogIndex()
    const link = screen.getByRole('link', { name: /newer post/i })
    expect(link).toHaveAttribute('href', '/blog/newer-post')
  })

  it('shows empty state when there are no posts', () => {
    postsRef.current = []
    renderBlogIndex()
    expect(screen.getByText(/no posts yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('sets document.title while mounted', () => {
    renderBlogIndex()
    expect(document.title).toMatch(/blog/i)
  })
})
