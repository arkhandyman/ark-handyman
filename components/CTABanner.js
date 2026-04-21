import Link from 'next/link'
import { siteConfig } from '@/lib/data'

export default function CTABanner({ title, subtitle, ctaText = 'Get a Phone Estimate', ctaLink = '/contact', variant = 'navy' }) {
  const isNavy = variant === 'navy'

  return (
    <section className={`py-16 px-4 ${isNavy ? 'bg-navy text-white' : 'bg-ark-yellow text-navy'}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-heading font-bold text-2xl md:text-3xl mb-3">
          {title}
        </h2>
        {subtitle && (
          <p className={`mb-8 text-lg ${isNavy ? 'text-white/80' : 'text-navy/80'}`}>
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={ctaLink}
            className={`inline-block font-bold px-8 py-3 rounded-xl transition hover:brightness-110 ${
              isNavy ? 'bg-ark-yellow text-navy' : 'bg-navy text-white'
            }`}
          >
            {ctaText}
          </Link>
          <a
            href={siteConfig.phoneHref}
            className={`inline-block font-bold px-8 py-3 rounded-xl border-2 transition hover:bg-white/10 ${
              isNavy ? 'border-white text-white' : 'border-navy text-navy'
            }`}
          >
            Call {siteConfig.phone}
          </a>
        </div>
      </div>
    </section>
  )
}
