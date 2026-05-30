import { notFound } from 'next/navigation'
import Link from 'next/link'
import FAQAccordion from '@/components/FAQAccordion'
import CTABanner from '@/components/CTABanner'
import { serviceAreas, services, siteConfig } from '@/lib/data'

export function generateStaticParams() {
  return serviceAreas.map((a) => ({ slug: a.slug }))
}

export function generateMetadata({ params }) {
  const area = serviceAreas.find((a) => a.slug === params.slug)
  if (!area) return {}
  return {
    title: `Handyman Services in ${area.name}, TN | Ark Handyman`,
    description: `Ark Handyman provides professional handyman services in ${area.name}, Tennessee. Drywall repair, painting, tile, and more. Licensed & insured. Free estimates.`,
    alternates: {
      canonical: `/service-areas/${area.slug}`,
    },
    openGraph: {
      title: `Handyman Services in ${area.name}, TN`,
      description: `Licensed & insured handyman services in ${area.name}, TN.`,
    },
  }
}

export default function ServiceAreaPage({ params }) {
  const area = serviceAreas.find((a) => a.slug === params.slug)
  if (!area) notFound()

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': `${siteConfig.url}/#business`,
    name: siteConfig.name,
    description: `Professional handyman services in ${area.name}, TN — drywall repair, painting, tile installation, and more. Licensed & insured.`,
    url: `${siteConfig.url}/service-areas/${area.slug}`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ooltewah',
      addressRegion: 'TN',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'City',
      name: area.name,
      addressRegion: 'TN',
      addressCountry: 'US',
    },
    priceRange: 'Starting at $150',
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: `Handyman in ${area.name}, TN`, item: `${siteConfig.url}/service-areas/${area.slug}` },
    ],
  }

  const areaFaqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: area.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(areaFaqSchema) }}
      />

      {/* Hero */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block bg-ark-yellow text-navy text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
              Service Area
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
              Handyman Services in {area.name}, TN
            </h1>
            <p className="text-white/80 text-xl">
              Professional, reliable home repairs right in your neighborhood.
            </p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 px-4 bg-white">
        <article className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-heading font-bold text-2xl text-navy mb-4">
              Serving {area.name} Homeowners
            </h2>
            <p className="text-charcoal/80 leading-relaxed text-lg mb-6">{area.description}</p>
            <p className="text-charcoal/70 leading-relaxed">
              Ark Handyman is licensed, insured, and based in Ooltewah, TN. We bring the same
              quality and honest pricing to every {area.name} project, big or small.
            </p>
          </div>

          {/* Google Map */}
          <div className="rounded-2xl overflow-hidden aspect-video border border-gray-200 shadow-sm">
            <iframe
              title={`Map of ${area.name}, TN`}
              src={area.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </article>
      </section>

      {/* Services list */}
      <section className="py-16 px-4 bg-light-gray">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-navy mb-8 text-center">
            Services Available in {area.name}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none m-0 p-0">
            {services.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="flex items-center gap-3 bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100 hover:border-navy hover:shadow-md transition group"
                >
                  <svg
                    className="w-5 h-5 text-ark-yellow flex-shrink-0"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold text-navy text-sm group-hover:text-ark-yellow transition-colors">
                    {s.shortTitle}
                  </span>
                  <svg
                    className="w-4 h-4 text-navy/30 ml-auto group-hover:translate-x-1 transition-transform"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Local FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-navy mb-8 text-center">
            Questions About Service in {area.name}
          </h2>
          <FAQAccordion items={area.faq} />
        </div>
      </section>

      <CTABanner
        title={`Ready to Get Started in ${area.name}?`}
        subtitle="Free estimates given over the phone upon description of work needing done. Call us today."
        ctaText="Get a Phone Estimate"
      />
    </>
  )
}
