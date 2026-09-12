import type { CollectionEntry } from 'astro:content'

export type BlogPost = CollectionEntry<'blog'>

export const PAGE_SIZE = 6

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

export const sortPostsByDate = (posts: BlogPost[]) =>
  [...posts].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())

export const getUniqueTags = (posts: BlogPost[]) =>
  [...new Set(posts.flatMap((post) => post.data.tags))].sort()
