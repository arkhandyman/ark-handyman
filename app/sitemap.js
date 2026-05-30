import { services, serviceAreas, siteConfig } from '@/lib/data'
import { getAllPosts } from '@/lib/blog'

// Update this date whenever site content is meaningfully changed.
// Using a fixed date (not new Date()) prevents Google from thinking
// every page changed on every build.
const SITE_UPDATED = '2025-04-25'

export default function sitemap() {
  const base = siteConfig.url

  const staticRoutes = [
    {
      url: base,
      lastModified: SITE_UPDATED,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${base}/about`,
      lastModified: SITE_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.7,
    },
    {
      url: `${base}/services`,
      lastModified: SITE_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${base}/faq`,
      lastModified: SITE_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${base}/contact`,
      lastModified: SITE_UPDATED,
      changeFrequency: 'yearly',
      priority: 0.8,
    },
  ]

  const serviceRoutes = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: SITE_UPDATED,
    changeFrequency: 'monthly',
    priority: 0.9,
  }))

  const areaRoutes = serviceAreas.map((a) => ({
    url: `${base}/service-areas/${a.slug}`,
    lastModified: SITE_UPDATED,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const blogIndex = {
    url: `${base}/blog`,
    lastModified: SITE_UPDATED,
    changeFrequency: 'weekly',
    priority: 0.7,
  }

  const blogRoutes = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date || SITE_UPDATED,
    changeFrequency: 'yearly',
    priority: 0.6,
  }))

  return [...staticRoutes, ...serviceRoutes, ...areaRoutes, blogIndex, ...blogRoutes]
}
