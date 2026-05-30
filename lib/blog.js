import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export { CATEGORIES, CATEGORY_STYLES } from './blogConstants'

const POSTS_DIR = path.join(process.cwd(), 'content/blog')

function readingTime(text) {
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export function formatDate(dateStr) {
  // Parse as local date to avoid UTC-offset shifting the displayed day
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function getAllPosts() {
  if (!fs.existsSync(POSTS_DIR)) return []

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8')
      const { data, content } = matter(raw)
      return {
        slug,
        title:       data.title       ?? slug,
        date:        data.date        ?? '',
        description: data.description ?? '',
        category:    data.category    ?? 'Home Maintenance',
        image:       data.image       ?? null,
        imageAlt:    data.imageAlt    ?? data.title ?? slug,
        readingTime: readingTime(content),
      }
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))
}

export function getPostBySlug(slug) {
  const filePath = path.join(POSTS_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)

  return {
    slug,
    title:       data.title       ?? slug,
    date:        data.date        ?? '',
    description: data.description ?? '',
    category:    data.category    ?? 'Home Maintenance',
    image:       data.image       ?? null,
    imageAlt:    data.imageAlt    ?? data.title ?? slug,
    readingTime: readingTime(content),
    content:     marked(content),
  }
}
