import { parseDescriptionLinks } from './parseDescriptionLinks'

describe('parseDescriptionLinks', () => {
  it('returns a single text segment for plain text with no links', () => {
    const result = parseDescriptionLinks('Hello world')
    expect(result).toEqual([{ type: 'text', value: 'Hello world' }])
  })

  it('returns a single link segment for a bare link with no surrounding text', () => {
    const result = parseDescriptionLinks('[label](https://example.com)')
    expect(result).toEqual([{ type: 'link', label: 'label', href: 'https://example.com' }])
  })

  it('returns text and link segments for text before and after a link', () => {
    const result = parseDescriptionLinks('See [this site](https://example.com) for details.')
    expect(result).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'link', label: 'this site', href: 'https://example.com' },
      { type: 'text', value: ' for details.' },
    ])
  })

  it('handles multiple links in a single string', () => {
    const result = parseDescriptionLinks('[A](https://a.com) and [B](https://b.com)')
    expect(result).toEqual([
      { type: 'link', label: 'A', href: 'https://a.com' },
      { type: 'text', value: ' and ' },
      { type: 'link', label: 'B', href: 'https://b.com' },
    ])
  })

  it('handles adjacent links with no text between them', () => {
    const result = parseDescriptionLinks('[A](https://a.com)[B](https://b.com)')
    expect(result).toEqual([
      { type: 'link', label: 'A', href: 'https://a.com' },
      { type: 'link', label: 'B', href: 'https://b.com' },
    ])
  })

  it('leaves unmatched brackets as literal text', () => {
    const result = parseDescriptionLinks('foo [bar baz')
    expect(result).toEqual([{ type: 'text', value: 'foo [bar baz' }])
  })

  it('leaves unmatched parentheses as literal text', () => {
    const result = parseDescriptionLinks('foo (bar) baz')
    expect(result).toEqual([{ type: 'text', value: 'foo (bar) baz' }])
  })

  it('leaves a bracket-label with no following paren-url as literal text', () => {
    const result = parseDescriptionLinks('[label] no url')
    expect(result).toEqual([{ type: 'text', value: '[label] no url' }])
  })

  it('returns empty array for empty string', () => {
    const result = parseDescriptionLinks('')
    expect(result).toEqual([])
  })
})
