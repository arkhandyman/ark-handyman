import Link from 'next/link'
import { services, serviceAreas, siteConfig } from '@/lib/data'

export default function Footer() {
  const year = 2025

  return (
    <footer className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-ark-yellow rounded-full flex items-center justify-center text-navy font-bold text-base flex-shrink-0">
                A
              </div>
              <span className="font-heading font-bold text-lg">Ark Handyman</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              Licensed &amp; insured handyman services in Hamilton County, TN. Ark Handyman has
              9 years of experience. Honest pricing. Reliable results.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <a href={siteConfig.phoneHref} className="text-ark-yellow hover:underline font-semibold">
                {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.email}`} className="text-white/70 hover:text-white transition-colors">
                {siteConfig.email}
              </a>
              <span className="text-white/70">{siteConfig.address}</span>
            </div>
          </div>

          {/* Services column */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-ark-yellow mb-4">
              Services
            </h3>
            <ul className="flex flex-col gap-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="text-white/70 text-sm hover:text-white transition-colors"
                  >
                    {s.shortTitle}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas column */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-ark-yellow mb-4">
              Service Areas
            </h3>
            <ul className="flex flex-col gap-2">
              {serviceAreas.map((area) => (
                <li key={area.slug}>
                  <Link
                    href={`/service-areas/${area.slug}`}
                    className="text-white/70 text-sm hover:text-white transition-colors"
                  >
                    {area.name}, TN
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links column */}
          <div>
            <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-ark-yellow mb-4">
              Quick Links
            </h3>
            <ul className="flex flex-col gap-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Us' },
                { href: '/blog', label: 'Blog' },
                { href: '/faq', label: 'FAQ' },
                { href: '/contact', label: 'Contact' },
                { href: '/contact', label: 'Get a Phone Estimate' },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="text-white/70 text-sm hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>Serving Hamilton County, Tennessee</p>
        </div>
      </div>
    </footer>
  )
}
