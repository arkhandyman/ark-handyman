import ContactForm from '@/components/ContactForm'
import { siteConfig } from '@/lib/data'

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
    { '@type': 'ListItem', position: 2, name: 'Contact', item: `${siteConfig.url}/contact` },
  ],
}

export const metadata = {
  title: 'Contact Ark Handyman | Phone Estimates in Hamilton County, TN',
  description:
    'Get in touch with Ark Handyman for a free phone estimate on your next home repair project. Serving Ooltewah, Collegedale, Chattanooga, and all of Hamilton County, TN.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Ark Handyman',
    description:
      'Free estimates given over the phone. Handyman services in Hamilton County, TN.',
  },
}

export default function ContactPage() {
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
            Get in Touch with Ark Handyman
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Ready to get your project started? Free estimates are given over the phone upon
            description of the work needing done.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section className="py-16 px-4 bg-light-gray">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="font-heading font-bold text-2xl text-navy mb-6">
              Send Us a Message
            </h2>
            <ContactForm />
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="font-heading font-bold text-2xl text-navy mb-6">
                Contact Information
              </h2>
              <address className="not-italic flex flex-col gap-4">
                {[
                  {
                    label: 'Phone',
                    value: siteConfig.phone,
                    href: siteConfig.phoneHref,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    ),
                  },
                  {
                    label: 'Email',
                    value: siteConfig.email,
                    href: `mailto:${siteConfig.email}`,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    ),
                  },
                  {
                    label: 'Service Area',
                    value: 'Hamilton County, TN',
                    href: null,
                    icon: (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    ),
                  },
                ].map(({ label, value, href, icon }) => (
                  <div key={label} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-ark-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icon}
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal/50 uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      {href ? (
                        <a href={href} className="font-semibold text-navy hover:text-ark-yellow transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="font-semibold text-navy">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </address>
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-heading font-bold text-navy mb-3">Business Hours</h3>
              <div className="flex flex-col gap-2 text-sm">
                {[
                  { day: 'Monday – Friday', hours: '8:00 AM – 6:00 PM' },
                  { day: 'Saturday', hours: 'By appointment' },
                  { day: 'Sunday', hours: 'Closed' },
                ].map(({ day, hours }) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-charcoal/70">{day}</span>
                    <span className="font-semibold text-charcoal">{hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hamilton County Map */}
            <div className="rounded-2xl overflow-hidden aspect-video border border-gray-200 shadow-sm">
              <iframe
                title="Hamilton County, Tennessee"
                src="https://maps.google.com/maps?q=Hamilton+County,Tennessee&output=embed&z=10"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
