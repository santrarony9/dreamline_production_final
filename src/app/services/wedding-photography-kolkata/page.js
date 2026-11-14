import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';

export const metadata = {
  title: "Best Wedding Photography in Kolkata | Candid & Cinematic Films — Dreamline Production",
  description: "Dreamline Production is Kolkata's premier wedding photography & cinematography team. 15+ years experience, 500+ weddings. Candid photography, luxury 4K films, traditional coverage.",
  alternates: { canonical: "https://dreamlineproduction.com/services/wedding-photography-kolkata/" },
  openGraph: {
    title: "Best Wedding Photography in Kolkata | Candid & Cinematic Films — Dreamline Production",
    description: "Dreamline Production is Kolkata's premier wedding photography & cinematography team. 15+ years experience, 500+ weddings. Candid photography, luxury 4K films, traditional coverage.",
    url: "https://dreamlineproduction.com/services/wedding-photography-kolkata/",
    siteName: 'Dreamline Production',
    locale: 'en_IN',
    type: 'website',
  }
};

export default function WeddingPhotographyPage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is included in your Kolkata wedding photography packages?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our wedding photography packages include candid wedding photography, traditional ceremony coverage, 4K cinematic wedding highlight films, full ceremony documentary edits, pre-wedding consultation, and handcrafted luxury photo albums."
        }
      },
      {
        "@type": "Question",
        "name": "How many photographers and cinematographers cover a wedding?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Team sizes range from 3 to 8 specialists depending on the scale of your celebration. Typically, we deploy 2 candid photographers, 2 traditional photographers, 2 cinematographers, and 1 drone operator."
        }
      },
      {
        "@type": "Question",
        "name": "How far in advance should we book Dreamline Production for weddings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Peak Bengali and destination wedding seasons (November through March) book up to 6 to 9 months in advance. We recommend reaching out as soon as your dates and venues are confirmed."
        }
      },
      {
        "@type": "Question",
        "name": "Do you travel for destination weddings outside Kolkata?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, we regularly cover destination weddings across India including Rajasthan (Udaipur, Jaipur), Goa, Puri, Darjeeling, and international locations."
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
            <span className="text-[#c5a059]">Wedding Photography Kolkata</span>
          </nav>

          <article className="prose prose-invert prose-lg max-w-none text-gray-300">
            <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">
              Wedding <span className="text-[#c5a059]">Photography</span> in Kolkata
            </h1>

            <p className="text-xl text-gray-200 leading-relaxed mb-8 font-light">
              We don&apos;t just photograph ceremonies; we archive emotions. With 15+ years of experience and over 500 weddings documented, Dreamline Production is recognized as Kolkata&apos;s leading wedding photography and cinematography studio, specializing in timeless Bengali heritage weddings and modern luxury celebrations.
            </p>

            <h2 className="font-heading text-2xl font-bold mt-12 mb-4 text-[#c5a059]">
              The Dreamline Wedding Experience
            </h2>
            <p className="mb-4">
              From the quiet intimacy of the bride&apos;s morning rituals (Saat Paak, Sindoor Daan, and Shubho Drishti) to the electrifying energy of the reception dance floor, our team works unobtrusively to capture real, unscripted moments with cinema-grade prime lenses and natural light artistry.
            </p>

            <h3 className="font-heading text-xl font-bold mt-8 mb-4 text-white">
              Signature Wedding Services
            </h3>
            <ul className="list-disc pl-6 space-y-3 mb-8">
              <li><strong>Candid Wedding Photography:</strong> Emotional, photojournalistic storytelling capturing heartfelt smiles, joyful tears, and spontaneous family moments.</li>
              <li><strong>Cinematic 4K Wedding Cinema:</strong> Narrative wedding films set to bespoke sound scores, color graded with Hollywood film palettes.</li>
              <li><strong>Traditional Photography &amp; Rituals:</strong> Complete, meticulous documentation of sacred Bengali rituals, family elders, and ceremonial milestones.</li>
              <li><strong>Same-Day Edits (SDE):</strong> Fast-turnaround highlight reels premiered during reception banquets to enchant your guests.</li>
              <li><strong>Heirloom Fine-Art Albums:</strong> Archival Italian leather and acrylic wedding albums designed to last for generations.</li>
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
              Reserve Your <span className="text-[#c5a059]">Wedding Date</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
              We accept a limited number of weddings per season to ensure meticulous creative focus for every couple.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-[#c5a059] text-black font-black uppercase text-xs tracking-[0.2em] rounded-full hover:bg-white transition-all shadow-xl"
              >
                Check Date Availability
              </Link>
              <Link
                href="/luxury"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] rounded-full hover:bg-white/10 transition-all"
              >
                View Luxury Portfolio
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
