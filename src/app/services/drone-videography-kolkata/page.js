import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';

export const metadata = {
  title: "Drone Videography Services in Kolkata | 4K Aerial Cinematography — Dreamline Production",
  description: "Top-rated drone videography services in Kolkata by DGCA-certified pilots. Cinematic 4K aerial films for grand weddings, commercial films, real estate, and events.",
  alternates: { canonical: "https://dreamlineproduction.com/services/drone-videography-kolkata/" },
  openGraph: {
    title: "Drone Videography Services in Kolkata | 4K Aerial Cinematography — Dreamline Production",
    description: "Top-rated drone videography services in Kolkata by DGCA-certified pilots. Cinematic 4K aerial films for grand weddings, commercial films, real estate, and events.",
    url: "https://dreamlineproduction.com/services/drone-videography-kolkata/",
    siteName: 'Dreamline Production',
    locale: 'en_IN',
    type: 'website',
  }
};

export default function DroneVideographyPage() {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is included in drone videography services in Kolkata?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our drone videography services include DGCA-certified pilot operation, 4K/60fps aerial cinematography, pre-flight safety and airspace checks, cinematic color grading, and broadcast-ready master deliverables."
        }
      },
      {
        "@type": "Question",
        "name": "Are your drone pilots DGCA certified?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all our drone pilots are DGCA certified with extensive flight hours across Kolkata, West Bengal, and Pan-India locations adhering strictly to national aviation guidelines."
        }
      },
      {
        "@type": "Question",
        "name": "Can drone videography be integrated into wedding and event packages?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely. Drone videography seamlessly integrates with our ground cinematography teams to capture grand venue reveals, baraat processions, and outdoor vows from stunning aerial perspectives."
        }
      },
      {
        "@type": "Question",
        "name": "What equipment is used for aerial videography?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We deploy industry-standard DJI Mavic 3 Cine, Inspire series, and high-resolution FPV drones capable of recording 10-bit D-Log 4K and 5.1K video with ultra-stable mechanical gimbals."
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
            <span className="text-[#c5a059]">Drone Videography Kolkata</span>
          </nav>

          <article className="prose prose-invert prose-lg max-w-none text-gray-300">
            <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">
              Drone <span className="text-[#c5a059]">Videography</span> in Kolkata
            </h1>

            <p className="text-xl text-gray-200 leading-relaxed mb-8 font-light">
              Elevate your production with broadcast-grade aerial cinematography. Dreamline Production provides DGCA-certified drone videography across Kolkata and West Bengal, capturing dynamic perspective, scale, and cinematic energy for weddings, corporate documentaries, real estate, and commercial campaigns.
            </p>

            <h2 className="font-heading text-2xl font-bold mt-12 mb-4 text-[#c5a059]">
              Cinema-Grade Aerial Storytelling
            </h2>
            <p className="mb-4">
              Ground cameras capture the intimate emotion; our drones capture the grand scale. With high dynamic range sensors and precision flight paths, we turn venues, sprawling resorts, industrial plants, and outdoor celebrations into visually captivating cinema.
            </p>

            <h3 className="font-heading text-xl font-bold mt-8 mb-4 text-white">
              Key Drone Videography Specialties
            </h3>
            <ul className="list-disc pl-6 space-y-3 mb-8">
              <li><strong>Luxury Weddings &amp; Baraat Processions:</strong> Sweeping reveals of heritage rajbaris, luxury banquets, and open-air mandaps.</li>
              <li><strong>Commercial &amp; Ad Film Productions:</strong> High-speed tracking shots, landscape establishing frames, and cinematic car/motion sequences.</li>
              <li><strong>Real Estate &amp; Architecture:</strong> Architectural showcase videos for builders, luxury resorts, and Kolkata township developments.</li>
              <li><strong>Industrial &amp; Corporate Infrastructure:</strong> Factory campus walkthroughs, construction timeline monitoring, and corporate headquarters overviews.</li>
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
              Plan Your Aerial <span className="text-[#c5a059]">Shoot</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
              Consult with our DGCA-certified flight directors to schedule your drone videography in Kolkata.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-[#c5a059] text-black font-black uppercase text-xs tracking-[0.2em] rounded-full hover:bg-white transition-all shadow-xl"
              >
                Inquire Drone Packages
              </Link>
              <Link
                href="/services/"
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] rounded-full hover:bg-white/10 transition-all"
              >
                Explore All Services
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
