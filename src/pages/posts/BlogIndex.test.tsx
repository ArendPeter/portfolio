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

  it('renders the hero with the train selfie', () => {
    renderBlogIndex()
    expect(screen.getByRole('heading', { level: 1, name: /hi i'm arend/i })).toBeInTheDocument()
    const photos = screen.getAllByRole('img', { name: /arend peter/i })
    expect(photos[0]).toHaveAttribute('src', '/train_selfie.png')
    expect(screen.getByRole('link', { name: /fleet/i })).toHaveAttribute(
      'href',
      'https://fleetdm.com/',
    )
  })

  it('renders posts in the given order (newest first)', () => {
    renderBlogIndex()
    const items = within(screen.getByRole('list', { name: /posts/i })).getAllByRole('listitem')
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
    expect(screen.queryByRole('list', { name: /posts/i })).not.toBeInTheDocument()
  })

  it('sets document.title while mounted', () => {
    renderBlogIndex()
    expect(document.title).toBe('Arend Peter')
  })
})
