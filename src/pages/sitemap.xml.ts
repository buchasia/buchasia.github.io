import type { APIRoute } from 'astro'
import { getBlogPosts, getPostSlug } from '../utils/posts'
import { fetchRuns, getRunYear } from '../utils/runs'

const site = 'https://www.chhitizbuchasia.com'
const pages = ['/', '/posts/', '/about/', '/tags/', '/search/', '/runs/', '/runs/achievements/', '/visualizer/', '/privacy/', '/licenses/', '/de/', '/de/posts/', '/de/about/', '/de/tags/', '/de/search/', '/de/runs/', '/de/runs/achievements/', '/de/visualizer/', '/de/privacy/', '/de/licenses/']

export const GET: APIRoute = async () => {
  const en = await getBlogPosts('en')
  const de = await getBlogPosts('de')
  const years = [...new Set((await fetchRuns()).map(getRunYear))]
  const paths = [
    ...pages,
    ...years.map((year) => `/runs/${year}/`),
    ...years.map((year) => `/de/runs/${year}/`),
    ...en.map((p) => `/posts/${getPostSlug(p)}/`),
    ...de.map((p) => `/de/posts/${getPostSlug(p)}/`),
  ]
  const urls = paths.map((p) => `<url><loc>${site}${p}</loc></url>`).join('')
  return new Response(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
