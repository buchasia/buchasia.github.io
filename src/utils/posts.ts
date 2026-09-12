import { getCollection, type CollectionEntry } from 'astro:content'

export type BlogPost = CollectionEntry<'blog'>

export const PAGE_SIZE = 6

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export const isPublished = (post: BlogPost) =>
  import.meta.env.DEV || !post.data.draft

const WORDS_PER_MINUTE = 200
const CODE_SECONDS_PER_LINE = 0.6
const CODE_SECONDS_CAP = 120
const DISPLAY_MATH_SECONDS = 12
const IMAGE_START_SECONDS = 12
const IMAGE_FLOOR_SECONDS = 3

export type ReadingTime = { words: number; minutes: number }

export const getReadingTime = (post: BlogPost): ReadingTime => {
  let text = post.body ?? ''
  let seconds = 0

  text = text.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, (block) => {
    seconds += Math.min(block.split('\n').length * CODE_SECONDS_PER_LINE, CODE_SECONDS_CAP)
    return ' '
  })

  text = text.replace(/\$\$[\s\S]*?\$\$/g, () => {
    seconds += DISPLAY_MATH_SECONDS
    return ' '
  })

  // Inline math renders as a short symbol, so bill it as a single word.
  text = text.replace(/\$[^$\n]+?\$/g, ' word ')

  let imageIndex = 0
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, () => {
    seconds += Math.max(IMAGE_START_SECONDS - imageIndex++, IMAGE_FLOOR_SECONDS)
    return ' '
  })

  text = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/[*_~`>|#]/g, ' ')

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  if (words === 0 && seconds === 0) return { words: 0, minutes: 0 }

  seconds += (words / WORDS_PER_MINUTE) * 60
  return { words, minutes: Math.max(1, Math.round(seconds / 60)) }
}

export const formatReadingTime = ({ words, minutes }: ReadingTime, withWords = false) =>
  withWords
    ? `${words.toLocaleString('en-US')} words · ${minutes} min read`
    : `${minutes} min read`

export const getBlogPosts = async () => {
  const posts = await getCollection('blog')
  return posts.filter(isPublished)
}

export const sortPostsByDate = (posts: BlogPost[]) =>
  [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

export const getUniqueTags = (posts: BlogPost[]) =>
  [...new Set(posts.flatMap((post) => post.data.tags))].sort()
