import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';

export const metadata = {
  title: "Corporate Photography & Film Production in Kolkata — Dreamline Production",
  description: "Professional corporate photography and commercial video production in Kolkata and Salt Lake Sector V. Corporate films, executive portraits, industrial shoots, and brand storytelling.",
  alternates: { canonical: "https://dreamlineproduction.com/services/corporate-photography-kolkata/" },
  openGraph: {
    title: "Corporate Photography & Film Production in Kolkata — Dreamline Production",
    description: "Professional corporate photography and commercial video production in Kolkata and Salt Lake Sector V. Corporate films, executive portraits, industrial shoots, and brand storytelling.",
    url: "https://dreamlineproduction.com/services/corporate-photography-kolkata/",
    siteName: 'Dreamline Production',
    locale: 'en_IN',
    type: 'website',
  }
};

export default function CorporatePhotographyPage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What corporate photography and film services do you offer in Kolkata?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We provide executive portraits and headshots, corporate brand films, factory and industrial facility tours, investor relations videos, annual conference coverage, and commercial advertising content."
        }
      },
      {
        "@type": "Question",
        "name": "Do you provide on-site shoots at corporate offices in Sector V and New Town?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, our mobile studio teams set up on location across Salt Lake Sector V, Rajarhat New Town, Park Street, and business parks across Kolkata with professional lighting, backdrops, and cinema audio."
        }
      },
      {
        "@type": "Question",
        "name": "What corporate brands have trusted Dreamline Production?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We have produced commercial content and corporate films for leading organizations including TATA Trust, Larsen & Toubro (L&T), Genrobotics, Brut India, TRT World, and Conneqt Kolkata."
        }
      },
      {
        "@type": "Question",
        "name": "What is the typical turnaround time for corporate video projects?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Turnaround ranges from 3 to 10 business days depending on project complexity, editing revisions, motion graphics, and audio mastering requirements."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <main className="bg-black pt-32 min-h-screen text-white">
        <section className="container mx-auto px-6 max-w-4xl pb-32">
          <nav aria-label="Breadcrumb" className="mb-8 text-xs font-bold uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-[#c5a059] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/services/" className="hover:text-[#c5a059] transition-colors">Services</Link>
            <span className="mx-2">/</span>
            <span className="text-[#c5a059]">Corporate Photography Kolkata</span>
          </nav>

          <article className="prose prose-invert prose-lg max-w-none text-gray-300">
            <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">
              Corporate <span className="text-[#c5a059]">Photography</span> &amp; Films in Kolkata
            </h1>

            <p className="text-xl text-gray-200 leading-relaxed mb-8 font-light">
              Elevate your corporate brand narrative with high-impact visual media. Serving business leaders, IT enterprises, and industrial corporations across Kolkata, Salt Lake Sector V, and New Town, Dreamline Production delivers executive portraits, corporate brand documentaries, and industrial facility videos that build authority and trust.
            </p>

            <h2 className="font-heading text-2xl font-bold mt-12 mb-4 text-[#c5a059]">
              Commercial Visual Excellence for Industry Leaders
            </h2>
            <p className="mb-4">
              Modern enterprises need authentic visual communication. Whether you are launching a new product line, documenting manufacturing excellence, or profiling your executive board, our production crews combine broadcast cinema cameras with crisp lighting setups to present your business at its absolute best.
            </p>

            <h3 className="font-heading text-xl font-bold mt-8 mb-4 text-white">
              Corporate Production Capabilities
            </h3>
            <ul className="list-disc pl-6 space-y-3 mb-8">
              <li><strong>Executive Headshots &amp; Team Portfolios:</strong> Polished corporate portraits for leadership profiles, annual reports, and LinkedIn company branding.</li>
              <li><strong>Corporate Documentaries &amp; Brand Films:</strong> Strategic brand narratives telling the story of your company&apos;s mission, people, and milestones.</li>
              <li><strong>Industrial &amp; Manufacturing Facility Shoots:</strong> Heavy machinery operations, plant floor walkthroughs, and safety-compliant industrial documentation.</li>
              <li><strong>Conference &amp; Corporate Summit Coverage:</strong> Multi-camera live-streaming, keynote speeches, panel discussions, and highlight reels.</li>
              <li><strong>Customer Testimonials &amp; Case Study Videos:</strong> High-trust client interview setups with broadcast-grade audio engineering.</li>
            </ul>

            <h2 className="font-heading text-2xl font-bold mt-12 mb-6 text-[#c5a059]">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqData.mainEntity.map((item, idx) => (
                <div key={idx} className="border-b border-white/10 pb-6">
                  <h4 className="font-bold text-lg text-white mb-2">{item.name}</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </article>

          {/* Booking CTA Box */}
          <div className="mt-16 text-center bg-gradient-to-br from-[#c5a059]/10 to-transparent border border-[#c5a059]/20 rounded-3xl p-10 md:p-14">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
              Schedule Your <span className="text-[#c5a059]">Corporate Shoot</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
              Partner with Kolkata&apos;s trusted commercial film production studio for your next enterprise project.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-[#c5a059] text-black font-black uppercase text-xs tracking-[0.2em] rounded-full hover:bg-white transition-all shadow-xl"
              >
                Request Corporate Proposal
              </Link>
              <Link
                href="/commercial"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] rounded-full hover:bg-white/10 transition-all"
              >
                View Commercial Portfolio
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
