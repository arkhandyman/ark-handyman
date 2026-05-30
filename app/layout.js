import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { siteConfig, testimonials } from '@/lib/data'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
  '@id': `${siteConfig.url}/#business`,
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  telephone: '+13039451223',
  email: siteConfig.email,
  image: `${siteConfig.url}/images/ark-handyman-logo-circle.png`,
  logo: `${siteConfig.url}/images/ark-handyman-logo-circle.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ooltewah',
    addressRegion: 'TN',
    postalCode: '37363',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 35.0762,
    longitude: -85.0633,
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Hamilton County',
    addressRegion: 'TN',
    addressCountry: 'US',
  },
  priceRange: 'Starting at $150',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '18:00',
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Handyman Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Drywall Repair' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Painting' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Tile Work' } },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    reviewCount: '3',
    bestRating: '5',
    worstRating: '1',
  },
  review: testimonials.map((t) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: t.name },
    reviewRating: { '@type': 'Rating', ratingValue: String(t.rating), bestRating: '5' },
    reviewBody: t.text,
  })),
}

// In Next.js 14, viewport is a separate export from metadata
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'Ark Handyman | Hamilton County, TN',
    template: '%s | Ark Handyman',
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: 'Ark Handyman | Hamilton County, TN',
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ark Handyman | Hamilton County, TN',
    description: siteConfig.description,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        {/* Sitemap discovery for crawlers that read <link rel="sitemap"> */}
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        {/* DNS prefetch for Google Maps iframes on service-area and contact pages */}
        <link rel="dns-prefetch" href="//maps.google.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
