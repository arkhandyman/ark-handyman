'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CATEGORIES, CATEGORY_STYLES } from '@/lib/blogConstants'

function PostCard({ post }) {
  const badgeClass = CATEGORY_STYLES[post.category] ?? 'bg-gray-100 text-gray-700'

  return (
    <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {post.image && (
        <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/9] overflow-hidden bg-light-gray">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
            {post.category}
          </span>
          <span className="text-xs text-gray-400">{post.readingTime} min read</span>
        </div>
        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-heading font-bold text-navy text-lg leading-snug hover:text-ark-yellow transition-colors mb-2">
            {post.title}
          </h2>
        </Link>
        <p className="text-charcoal/70 text-sm leading-relaxed flex-1 mb-4">
          {post.description}
        </p>
        <footer className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
          <time dateTime={post.date}>{post.formattedDate}</time>
          <Link href={`/blog/${post.slug}`} className="text-navy font-semibold hover:text-ark-yellow transition-colors">
            Read more →
          </Link>
        </footer>
      </div>
    </article>
  )
}

export default function BlogGrid({ posts }) {
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = activeCategory === 'All'
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Filter by category">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'All'
              ? 'bg-navy text-white'
              : 'bg-white text-charcoal border border-gray-200 hover:border-navy hover:text-navy'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-navy text-white'
                : 'bg-white text-charcoal border border-gray-200 hover:border-navy hover:text-navy'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Post grid */}
      {filtered.length === 0 ? (
        <p className="text-charcoal/60 text-center py-12">No posts in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
