type TextSegment = { type: 'text'; value: string }
type LinkSegment = { type: 'link'; label: string; href: string }
export type Segment = TextSegment | LinkSegment

export function parseDescriptionLinks(text: string): Segment[] {
  const segments: Segment[] = []
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    }
    segments.push({ type: 'link', label: match[1], href: match[2] })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments
}
