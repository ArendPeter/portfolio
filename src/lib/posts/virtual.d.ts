declare module 'virtual:posts' {
  interface PostMeta {
    title: string
    date: string
    description?: string
    updated?: string
    image?: string
    aliases?: string[]
  }

  interface PostSummary {
    slug: string
    meta: PostMeta
    readingTime: number
    shareImage: string | null
    images: string[]
  }

  export const posts: PostSummary[]
  export function getPostHtml(slug: string): Promise<string | null>
}
