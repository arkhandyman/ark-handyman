import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAllPosts, getPostBySlug, formatDate } from '@/lib/blog'
import { CATEGORY_STYLES } from '@/lib/blogConstants'
import { siteConfig } from '@/lib/data'
import CTABanner from '@/components/CTABanner'

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title: `${post.title} | Ark Handyman`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      ...(post.image ? { images: [{ url: `${siteConfig.url}${post.image}` }] } : {}),
    },
  }
}

export default function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const badgeClass = CATEGORY_STYLES[post.category] ?? 'bg-gray-100 text-gray-700'

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteConfig.url}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: `${siteConfig.url}/blog/${post.slug}` },
    ],
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/images/ark-handyman-logo-circle.png`,
      },
    },
    ...(post.image ? { image: `${siteConfig.url}${post.image}` } : {}),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteConfig.url}/blog/${post.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Hero image or navy banner */}
      {post.image ? (
        <div className="relative w-full h-64 md:h-96 bg-navy overflow-hidden">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-3xl mx-auto w-full px-4 pb-8">
              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${badgeClass}`}>
                {post.category}
              </span>
              <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-white leading-tight">
                {post.title}
              </h1>
            </div>
          </div>
        </div>
      ) : (
        <section className="bg-navy text-white py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${badgeClass}`}>
              {post.category}
            </span>
            <h1 className="font-heading font-extrabold text-3xl md:text-4xl leading-tight">
              {post.title}
            </h1>
          </div>
        </section>
      )}

      {/* Article body */}
      <div className="bg-light-gray py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Meta row */}
          <div className="flex items-center gap-4 text-sm text-charcoal/60 mb-8 pb-6 border-b border-gray-200">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
            <span>·</span>
            <Link href="/blog" className="text-navy hover:text-ark-yellow transition-colors">
              ← All posts
            </Link>
          </div>

          <article
            className="prose prose-lg max-w-none
              prose-headings:font-heading prose-headings:text-navy
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-charcoal prose-p:leading-relaxed
              prose-a:text-navy prose-a:font-semibold hover:prose-a:text-ark-yellow
              prose-strong:text-charcoal
              prose-ul:text-charcoal prose-ol:text-charcoal
              prose-li:my-1
              prose-hr:border-gray-200"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Back link */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <Link href="/blog" className="text-navy font-semibold hover:text-ark-yellow transition-colors">
              ← Back to all posts
            </Link>
          </div>
        </div>
      </div>

      <CTABanner
        title="Need Help With a Project?"
        subtitle="We're based in Ooltewah and serve all of Hamilton County. Get in touch for a phone estimate."
        ctaText="Get a Phone Estimate"
      />
    </>
  )
}
