import Link from 'next/link'
import Image from 'next/image'
import TrustBar from '@/components/TrustBar'
import ServiceCard from '@/components/ServiceCard'
import TestimonialCard from '@/components/TestimonialCard'
import CTABanner from '@/components/CTABanner'
import { services, serviceAreas, testimonials, siteConfig } from '@/lib/data'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
  ],
}

export const metadata = {
  title: 'Ark Handyman | Honest & Reliable Handyman Services in Hamilton County, TN',
  description:
    'Ark Handyman offers professional drywall repair, painting, tiling, and general home repairs in Hamilton County, TN. Licensed, insured, and 9 years of experience.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ark Handyman | Hamilton County, TN',
    description:
      'Licensed & insured handyman services in Ooltewah, Collegedale, and Hamilton County, TN.',
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="bg-navy text-white py-20 md:py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block bg-ark-yellow text-navy text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
              Licensed &amp; Insured · Hamilton County, TN
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Honest &amp; Reliable Handyman Services in Hamilton County, TN
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed">
              From drywall repair to painting to tiling — Ark Handyman gets the job done right
              the first time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="bg-ark-yellow text-navy font-bold px-8 py-3.5 rounded-xl hover:brightness-110 transition text-center"
              >
                Get a Phone Estimate
              </Link>
              <Link
                href="#services"
                className="border-2 border-white text-white font-bold px-8 py-3.5 rounded-xl hover:bg-white/10 transition text-center"
              >
                View Our Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Services overview */}
      <section id="services" className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy mb-3">
              What We Do
            </h2>
            <p className="text-charcoal/60 max-w-xl mx-auto">
              From small repairs to bigger projects, we handle it all with the same level of care
              and professionalism.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="py-16 px-4 bg-light-gray">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy mb-3">
              Our Work
            </h2>
            <p className="text-charcoal/60 max-w-xl mx-auto">
              Real projects completed for homeowners across Hamilton County, TN.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: '/images/tile-backsplash-portfolio.webp', alt: 'Tile backsplash installation completed by Ark Handyman in Hamilton County, TN' },
              { src: '/images/tile-floor-portfolio.webp', alt: 'Tile floor installation completed by Ark Handyman in Ooltewah, TN' },
              { src: '/images/fine-woodwork-portfolio.webp', alt: 'Fine woodwork trim repair completed by Ark Handyman in Hamilton County, TN' },
              { src: '/images/kitchen-lighting-install-portfolio.webp', alt: 'Kitchen lighting installation completed by Ark Handyman in Ooltewah, TN' },
            ].map(({ src, alt }) => (
              <figure
                key={src}
                className="rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group aspect-[4/3] m-0"
              >
                <div className="relative w-full h-full">
                  <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy mb-3">
              What Homeowners Say
            </h2>
            <p className="text-charcoal/60 max-w-xl mx-auto">
              Real reviews from real Hamilton County homeowners.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} testimonial={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Service areas preview */}
      <section className="py-16 px-4 bg-light-gray">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-navy mb-3">
              Serving Hamilton County
            </h2>
            <p className="text-charcoal/60 max-w-xl mx-auto">
              We serve homeowners throughout Hamilton County, Tennessee.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {serviceAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/service-areas/${area.slug}`}
                className="bg-white border border-gray-200 text-navy font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-navy hover:text-white hover:border-navy transition"
              >
                {area.name}, TN
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        title="Ready to Get Started?"
        subtitle="Free estimates given over the phone upon description of work needing done. Call us today."
        ctaText="Get a Phone Estimate"
      />
    </>
  )
}
