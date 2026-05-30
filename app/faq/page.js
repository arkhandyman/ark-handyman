import FAQAccordion from '@/components/FAQAccordion'
import CTABanner from '@/components/CTABanner'
import { faqData, siteConfig } from '@/lib/data'

export const metadata = {
  title: 'FAQ | Ark Handyman — Hamilton County, TN',
  description:
    'Answers to common questions about Ark Handyman services, scheduling, pricing, and service areas in Hamilton County, TN.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions | Ark Handyman',
    description:
      'Everything you need to know about Ark Handyman services in Hamilton County, TN.',
  },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
    { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${siteConfig.url}/faq` },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqData.flatMap((cat) =>
    cat.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    }))
  ),
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Everything you need to know about working with Ark Handyman.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="py-16 px-4 bg-light-gray">
        <div className="max-w-3xl mx-auto flex flex-col gap-12">
          {faqData.map((category) => (
            <div key={category.category}>
              <h2 className="font-heading font-bold text-2xl text-navy mb-4">
                {category.category}
              </h2>
              <FAQAccordion items={category.items} />
            </div>
          ))}
        </div>
      </section>

      <CTABanner
        title="Still Have Questions?"
        subtitle="We're happy to answer any question you have — just give us a call or send us a message."
        ctaText="Contact Us"
      />
    </>
  )
}
