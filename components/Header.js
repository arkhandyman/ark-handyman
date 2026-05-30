'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { services, siteConfig } from '@/lib/data'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <header className="bg-navy text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
          <Image
            src="/images/ark-handyman-logo-long-white.png"
            alt="Ark Handyman logo"
            width={300}
            height={75}
            className="object-contain h-36 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-ark-yellow transition-colors">
            Home
          </Link>

          {/* Services dropdown */}
          <div className="relative group">
            <button
              className="hover:text-ark-yellow transition-colors flex items-center gap-1"
              aria-haspopup="true"
            >
              Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute top-full left-0 mt-2 bg-white text-charcoal shadow-xl rounded-xl py-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {services.map((s) => (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="block px-4 py-2 hover:bg-light-gray hover:text-navy transition-colors text-sm"
                >
                  {s.shortTitle}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/about" className="hover:text-ark-yellow transition-colors">
            About
          </Link>
          <Link href="/faq" className="hover:text-ark-yellow transition-colors">
            FAQ
          </Link>
          <Link href="/blog" className="hover:text-ark-yellow transition-colors">
            Blog
          </Link>
          <Link href="/contact" className="hover:text-ark-yellow transition-colors">
            Contact
          </Link>
        </nav>

        {/* CTA + phone */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={siteConfig.phoneHref}
            className="text-ark-yellow font-semibold text-sm hover:underline"
          >
            {siteConfig.phone}
          </a>
          <Link
            href="/contact"
            className="bg-ark-yellow text-navy font-bold px-4 py-2 rounded-lg text-sm hover:brightness-110 transition"
          >
            Get a Phone Estimate
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-md hover:bg-white/10 transition"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/20 bg-navy px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Home
            </Link>

            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/10 transition-colors text-left"
            >
              Services
              <svg
                className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {servicesOpen && (
              <div className="pl-4 flex flex-col gap-1">
                {services.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/${s.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 px-3 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {s.shortTitle}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              About
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="py-2 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              Contact
            </Link>

            <div className="mt-3 flex flex-col gap-2">
              <a
                href={siteConfig.phoneHref}
                className="text-center py-2 px-4 border border-ark-yellow text-ark-yellow rounded-lg font-semibold hover:bg-ark-yellow hover:text-navy transition"
              >
                {siteConfig.phone}
              </a>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="text-center bg-ark-yellow text-navy font-bold py-2 px-4 rounded-lg hover:brightness-110 transition"
              >
                Get a Phone Estimate
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
