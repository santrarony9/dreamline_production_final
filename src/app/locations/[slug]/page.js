export const revalidate = 86400;

import { notFound } from 'next/navigation';
import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';

const LOCATIONS = [
  {
    slug: "wedding-photographer-salt-lake-kolkata",
    service: "Wedding Photography",
    location: "Salt Lake, Kolkata",
    area: "Sector V, Salt Lake",
    headline: "Wedding Photographer in Salt Lake, Kolkata",
    desc: "Dreamline Production offers premium cinematic wedding photography and videography in Salt Lake, Kolkata. Serving Sector V, Bidhannagar, and all of Salt Lake with luxury candid wedding photography, drone coverage, and same-day edits."
  },
  {
    slug: "wedding-photographer-new-town-kolkata",
    service: "Wedding Photography",
    location: "New Town, Kolkata",
    area: "Action Area, New Town",
    headline: "Wedding Photographer in New Town, Kolkata",
    desc: "Luxury cinematic wedding photography in New Town and Rajarhat, Kolkata. Dreamline Production covers Action Area weddings, eco-park ceremonies, and hotel venue shoots across New Town with cinema-grade equipment."
  },
  {
    slug: "wedding-photographer-howrah",
    service: "Wedding Photography",
    location: "Howrah, West Bengal",
    area: "Howrah",
    headline: "Best Wedding Photographer in Howrah",
    desc: "Looking for a top wedding photographer in Howrah? Dreamline Production brings 15+ years of cinematic wedding photography experience to Howrah — covering all venues, mandaps, and banquet halls across Howrah district."
  },
  {
    slug: "pre-wedding-shoot-kolkata",
    service: "Pre-Wedding Photography",
    location: "Kolkata",
    area: "Kolkata",
    headline: "Best Pre-Wedding Shoot Locations & Photographer in Kolkata",
    desc: "Plan your perfect pre-wedding photoshoot in Kolkata with Dreamline Production. We shoot at iconic locations — Victoria Memorial, Howrah Bridge, Eco Park, Prinsep Ghat, heritage mansions, and more. Cinematic storytelling for every couple."
  },
  {
    slug: "corporate-film-production-salt-lake",
    service: "Corporate Films",
    location: "Salt Lake & IT Sector V, Kolkata",
    area: "Sector V",
    headline: "Corporate Film Production in Salt Lake & Sector V, Kolkata",
    desc: "Dreamline Production provides end-to-end corporate film, brand film, and ad film production services for companies in Salt Lake's IT hub, Sector V, Bidhannagar, and surrounding business parks. Trusted by TATA Trust, L&T, and more."
  },
  {
    slug: "drone-photography-kolkata",
    service: "Drone Videography",
    location: "Kolkata",
    area: "Kolkata",
    headline: "Professional Drone Photography & Videography in Kolkata",
    desc: "DGCA-certified drone videography in Kolkata. Dreamline Production provides aerial photography for weddings, real estate, construction, events, and commercial projects across Kolkata and West Bengal."
  },
  {
    slug: "wedding-photographer-park-street-kolkata",
    service: "Wedding Photography",
    location: "Park Street, Kolkata",
    area: "Park Street & Central Kolkata",
    headline: "Wedding Photographer near Park Street, Kolkata",
    desc: "Serving hotels and wedding venues in and around Park Street, Kolkata. Dreamline Production covers luxury hotel weddings at ITC Royal Bengal, Taj Bengal, Oberoi Grand, and other premium Park Street venues."
  },
  {
    slug: "wedding-photographer-ballygunge-kolkata",
    service: "Wedding Photography",
    location: "Ballygunge, South Kolkata",
    area: "Ballygunge & South Kolkata",
    headline: "Wedding Photographer in Ballygunge & South Kolkata",
    desc: "Premier wedding photography studio serving Ballygunge, Alipore, Bhowanipore, and all of South Kolkata. Dreamline Production offers luxury candid photography, drone coverage, and cinematic wedding films at all South Kolkata venues."
  }
];

export function generateStaticParams() {
  return LOCATIONS.map(l => ({ slug: l.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const loc = LOCATIONS.find(l => l.slug === slug);
  if (!loc) return {};
  return {
    title: loc.headline,
    description: loc.desc,
    alternates: { canonical: `https://dreamlineproduction.com/locations/${loc.slug}/` },
    openGraph: {
      title: `${loc.headline} | Dreamline Production`,
      description: loc.desc,
      url: `https://dreamlineproduction.com/locations/${loc.slug}/`,
      siteName: 'Dreamline Production',
      locale: 'en_IN',
      type: 'website',
      images: [{ url: '/logo-banner.png', width: 1200, height: 630 }]
    }
  };
}

export default async function LocationPage({ params }) {
  const { slug } = await params;
  const loc = LOCATIONS.find(l => l.slug === slug);
  if (!loc) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "name": "Dreamline Production",
        "description": loc.desc,
        "url": `https://dreamlineproduction.com/locations/${loc.slug}`,
        "telephone": "+91 82400 54002",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road",
          "addressLocality": "Kolkata",
          "addressRegion": "West Bengal",
          "postalCode": "700082",
          "addressCountry": "IN"
        },
        "areaServed": loc.area,
        "priceRange": "₹₹₹"
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamlineproduction.com" },
          { "@type": "ListItem", "position": 2, "name": "Locations", "item": "https://dreamlineproduction.com/locations" },
          { "@type": "ListItem", "position": 3, "name": loc.headline, "item": `https://dreamlineproduction.com/locations/${loc.slug}` }
        ]
      }
    ]
  };

  return (
    <>
      <StructuredData data={schema} />
      <main className="page-main">
        <section className="page-hero-section">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/locations">Locations</Link>
            <span>/</span>
            <span className="current">{loc.location}</span>
          </nav>
          {/* Hero */}
          <div className="mb-12 border-b border-white/10 pb-10">
            <span className="page-category-label">
              {loc.service} • {loc.location}
            </span>
            <h1 className="page-hero-title">
              {loc.headline.split(',')[0]}
              <span className="text-[#c5a059]">
                {loc.headline.split(',').length > 1 ? `, ${loc.headline.split(',').slice(1).join(',')}` : ""}
              </span>
            </h1>
            <p className="page-hero-desc">{loc.desc}</p>
          </div>
        </section>

        <section className="content-container pb-24">

          {/* Why Dreamline */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: '🏆',
                title: '15+ Years Experience',
                desc: 'Trusted by 500+ couples and leading brands across Kolkata and India.'
              },
              {
                icon: '🎬',
                title: 'Cinema-Grade Equipment',
                desc: 'Sony FX6, RED cameras, DJI drones, and professional lighting for every shoot.'
              },
              {
                icon: '⭐',
                title: '4.9★ Google Rating',
                desc: 'Consistently rated among the top photographers and production houses in West Bengal.'
              }
            ].map((f, i) => (
              <div
                key={i}
                className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-[#c5a059]/30 transition-all"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-black uppercase text-sm tracking-widest mb-2">{f.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-br from-[#c5a059]/10 to-transparent border border-[#c5a059]/20 rounded-3xl p-16">
            <h2 className="section-title mb-4">
              Ready to <span className="text-[#c5a059]">Book?</span>
            </h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto">
              Contact Dreamline Production today to discuss your project and check availability for {loc.location}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-10 py-5 bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all"
              >
                Get a Free Quote
              </Link>
              <a
                href="tel:+918240054002"
                className="inline-flex items-center justify-center px-10 py-5 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all"
              >
                Call +91 82400 54002
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
