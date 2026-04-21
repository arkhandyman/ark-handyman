import { notFound } from 'next/navigation'
import Image from 'next/image'
import FAQAccordion from '@/components/FAQAccordion'
import CTABanner from '@/components/CTABanner'
import { services, siteConfig } from '@/lib/data'

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }))
}

export function generateMetadata({ params }) {
  const service = services.find((s) => s.slug === params.slug)
  if (!service) return {}
  return {
    title: `${service.title} in Hamilton County, TN`,
    description: `Ark Handyman provides professional ${service.shortTitle.toLowerCase()} in Hamilton County, TN. Licensed & insured. Free estimates. Serving Ooltewah, Collegedale, and surrounding areas.`,
    openGraph: {
      title: `${service.title} | Ark Handyman`,
      description: `Professional ${service.shortTitle.toLowerCase()} in Hamilton County, TN.`,
    },
  }
}

export default function ServicePage({ params }) {
  const service = services.find((s) => s.slug === params.slug)
  if (!service) notFound()

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'LocalBusiness',
      name: 'Ark Handyman',
      url: siteConfig.url,
      telephone: siteConfig.phone,
      areaServed: 'Hamilton County, TN',
    },
    areaServed: 'Hamilton County, TN',
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <span className="inline-block bg-ark-yellow text-navy text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
              Hamilton County, TN
            </span>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
              {service.title}
            </h1>
            <p className="text-white/80 text-xl">{service.tagline}</p>
          </div>
        </div>
      </section>

      {/* Description + portfolio image */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-heading font-bold text-2xl text-navy mb-4">
              About This Service
            </h2>
            <p className="text-charcoal/80 leading-relaxed text-lg">{service.description}</p>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-light-gray">
            {service.image ? (
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-navy/10 to-navy/5 flex items-center justify-center">
                <span className="text-navy/40 text-sm font-medium">{service.shortTitle}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 px-4 bg-light-gray">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-navy mb-8 text-center">
            What&apos;s Included
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {service.included.map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white rounded-xl px-5 py-4 shadow-sm border border-gray-100">
                <svg
                  className="w-5 h-5 text-ark-yellow flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-charcoal/80 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-navy mb-8 text-center">
            Common Questions About {service.shortTitle}
          </h2>
          <FAQAccordion items={service.faq} />
        </div>
      </section>

      <CTABanner
        title={`Need ${service.shortTitle}? Contact Ark Handyman Today!`}
        subtitle="Licensed, insured, and ready to help. Free estimates given over the phone upon description of work needing done."
        ctaText="Get a Phone Estimate"
      />
    </>
  )
}
