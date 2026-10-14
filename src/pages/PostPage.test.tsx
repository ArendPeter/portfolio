import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { PostPage } from './PostPage'

vi.mock('virtual:posts', () => ({
  posts: [
    {
      slug: 'test-post',
      meta: {
        title: 'Test Post Title',
        date: '2024-01-15',
        description: 'A test post description',
      },
      readingTime: 5,
      shareImage: null,
      images: [],
    },
    {
      slug: 'updated-post',
      meta: {
        title: 'Updated Post',
        date: '2024-01-12',
        description: 'A post with an updated date',
        updated: '2024-02-01',
      },
      readingTime: 3,
      shareImage: null,
      images: [],
    },
    {
      slug: 'other-post',
      meta: {
        title: 'Other Post',
        date: '2024-01-10',
        description: 'Another post description',
      },
      readingTime: 3,
      shareImage: null,
      images: [],
    },
  ],
  getPostHtml: async (slug: string) => {
    if (slug === 'test-post') return '<p>Test post content</p>'
    if (slug === 'updated-post') return '<p>Updated post content</p>'
    if (slug === 'other-post') return '<p>Other post content</p>'
    return null
  },
}))

function renderAtSlug(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/blog/${slug}`]}>
      <Routes>
        <Route path="/blog/:slug" element={<PostPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PostPage', () => {
  it('renders title, date, reading time, and description', async () => {
    renderAtSlug('test-post')
    await screen.findByRole('heading', { level: 1, name: /test post title/i })
    expect(screen.getByText(/a test post description/i)).toBeInTheDocument()
    expect(screen.getByText(/5 min read/i)).toBeInTheDocument()
    expect(screen.getByText(/jan 15, 2024/i)).toBeInTheDocument()
  })

  it('shows feedback slot keyed by slug', async () => {
    renderAtSlug('test-post')
    await screen.findByRole('heading', { level: 1, name: /test post title/i })
    expect(document.querySelector('[data-feedback-slot="test-post"]')).toBeInTheDocument()
  })

  it('"More posts" excludes the current post', async () => {
    renderAtSlug('test-post')
    await screen.findByRole('heading', { level: 1, name: /test post title/i })
    // Other posts appear as links
    expect(screen.getByRole('link', { name: /other post/i })).toBeInTheDocument()
    // Current post does not appear as a link (only as h1)
    expect(screen.queryByRole('link', { name: /test post title/i })).not.toBeInTheDocument()
  })

  it('shows not-found state for unknown slug', () => {
    renderAtSlug('nonexistent-slug')
    expect(screen.getByText(/post not found/i)).toBeInTheDocument()
  })

  it('shows "Updated" when updated field is set', async () => {
    renderAtSlug('updated-post')
    await screen.findByRole('heading', { level: 1, name: /updated post/i })
    expect(screen.getByText(/updated feb 1, 2024/i)).toBeInTheDocument()
  })

  it('sticky bar has "← All posts" and "Arend Peter" links', async () => {
    renderAtSlug('test-post')
    await screen.findByRole('heading', { level: 1, name: /test post title/i })
    expect(screen.getByRole('link', { name: /← all posts/i })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: /arend peter/i })).toHaveAttribute('href', '/')
  })
})
