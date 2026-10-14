export interface PostMeta {
  title: string
  date: string
  description: string
  updated?: string
  image?: string
  aliases?: string[]
}

export interface Post {
  slug: string
  meta: PostMeta
  html: string
  readingTime: number
  shareImage: string | null
  images: string[]
}

export interface PostSummary {
  slug: string
  meta: PostMeta
  readingTime: number
  shareImage: string | null
  images: string[]
}
