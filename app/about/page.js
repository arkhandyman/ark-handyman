import Image from 'next/image'
import CTABanner from '@/components/CTABanner'
import TrustBar from '@/components/TrustBar'

export const metadata = {
  title: "About Ark Handyman | Hamilton County's Trusted Handyman",
  description:
    "Meet Ark Handyman — a licensed and insured handyman serving Hamilton County, TN for 9 years. Honest pricing, quality work, and genuine care for your home.",
  openGraph: {
    title: "About Ark Handyman | Hamilton County, TN",
    description:
      "9 years of experience. Licensed & insured. Locally owned. Learn about Ark Handyman's story and values.",
  },
}

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl mb-4">
            Meet Ark Handyman
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Locally owned. Honestly priced. Genuinely committed to your home.
          </p>
        </div>
      </section>

      <TrustBar />

      {/* Story */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-12">
            {/* Photo */}
            <div className="relative rounded-2xl overflow-hidden shadow-md aspect-[3/4] w-full max-w-sm mx-auto md:mx-0">
              <Image
                src="/images/Chad-arkhandyman-about.jpg"
                alt="Owner of Ark Handyman smiling in a navy blue hoodie."
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
                priority
              />
            </div>

            {/* Story text */}
            <div>
              <h2 className="font-heading font-bold text-3xl text-navy mb-6">
                Our Story
              </h2>
              <div className="flex flex-col gap-4 text-charcoal/80 leading-relaxed">
                <p>
                  Ark Handyman was built on a simple idea: homeowners deserve a handyman they can
                  actually trust. Someone who shows up when they say they will, does the job right the
                  first time, and charges a fair price. No surprises, no upselling, no shortcuts.
                </p>
                <p>
                  After 8 years honing the craft in Colorado, Ark Handyman is now proud to be based
                  right here in Ooltewah, Tennessee. Whether patching a few nail holes or tiling an
                  entire bathroom, every job gets the same attention to detail and honest
                  communication from start to finish.
                </p>
                <p>
                  We're locally owned and operated out of Ooltewah. When you hire Ark Handyman,
                  you're not calling a 1-800 number or working with a franchise. You're working
                  directly with someone who cares about this community and its homes.
                </p>
                <p>
                  Nine years in, the best part of this work is still the moment a homeowner sees the
                  finished result and says, "I didn't think it could look that good." That's what we
                  show up for.
                </p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: 'Licensed & Insured',
                  desc: 'Fully licensed in Tennessee and carrying general liability insurance on every job — for your protection and peace of mind.',
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  ),
                },
                {
                  title: '9 Years of Experience',
                  desc: 'Nearly a decade of hands-on experience working on homes and making customers happy.',
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ),
                },
                {
                  title: 'Satisfaction Guaranteed',
                  desc: "We're not done until you're happy. If something isn't right, we'll make it right — that's our promise.",
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  ),
                },
              ].map(({ title, desc, icon }) => (
                <div
                  key={title}
                  className="flex gap-4 bg-light-gray rounded-2xl p-5"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center text-ark-yellow">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icon}
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy mb-1">{title}</h3>
                    <p className="text-sm text-charcoal/70 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      <CTABanner
        title="Let's Talk About Your Project"
        subtitle="Whether it's a single repair or a whole list of fixes, we're ready to help."
        ctaText="Contact Us Today"
      />
    </>
  )
}
