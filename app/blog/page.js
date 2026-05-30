import { getAllPosts } from '@/lib/blog'
import { siteConfig } from '@/lib/data'
import { formatDate } from '@/lib/blog'
import BlogGrid from './BlogGrid'

export const metadata = {
  title: 'Blog | Ark Handyman — Home Tips for Hamilton County, TN',
  description:
    'Practical home maintenance tips, DIY guides, and local advice for Hamilton County homeowners from Ark Handyman in Ooltewah, TN.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Ark Handyman Blog — Home Tips for Hamilton County, TN',
    description:
      'Practical home maintenance tips, DIY guides, and local advice for Hamilton County homeowners.',
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteConfig.url}/blog` },
  ],
}

export default function BlogIndexPage() {
  const rawPosts = getAllPosts()
  const posts = rawPosts.map((p) => ({ ...p, formattedDate: formatDate(p.date) }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
            Home Tips &amp; Local Advice
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Practical guides for Hamilton County homeowners — from patching drywall to choosing tile to knowing when to call a pro.
          </p>
        </div>
      </section>

      {/* Blog grid */}
      <section className="py-16 px-4 bg-light-gray">
        <div className="max-w-6xl mx-auto">
          <BlogGrid posts={posts} />
        </div>
      </section>
    </>
  )
}
