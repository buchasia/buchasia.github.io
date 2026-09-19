import type { APIRoute } from 'astro'
import { getBlogPosts, getPostSlug, sortPostsByDate } from '../../utils/posts'

const site = 'https://www.chhitizbuchasia.com'
const xml = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const GET: APIRoute = async () => {
  const items = sortPostsByDate(await getBlogPosts('de')).map((post) => { const url = `${site}/de/posts/${getPostSlug(post)}/`; return `<item><title>${xml(post.data.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${post.data.date.toUTCString()}</pubDate><description>${xml(post.data.description ?? post.data.title)}</description></item>` }).join('')
  const body = `<?xml version="1.0"?><rss version="2.0"><channel><title>Dr. Chhitiz Buchasia</title><link>${site}/de/</link><description>Beiträge über Technologie, Daten, Mathematik, Laufen und mehr.</description>${items}</channel></rss>`
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
