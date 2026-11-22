export const revalidate = 120;
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import ServiceVideoShowcase from "@/components/global/ServiceVideoShowcase";
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

export default async function DroneVideographyPage() {
  await dbConnect();
  const rawPage = await ServicePage.findOne({ slug: 'drone-videography-kolkata' }).lean();
  const page = rawPage ? JSON.parse(JSON.stringify(rawPage)) : null;
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
      <main className="page-main">
        <section className="page-hero-section">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/services/">Services</Link>
            <span>/</span>
            <span className="current">Drone Videography Kolkata</span>
          </nav>

          <div>
            <span className="page-category-label">
              Drone &amp; Aerial
            </span>
            <h1 className="page-hero-title">
              Drone <span className="text-[#c5a059]">Videography</span> in Kolkata
            </h1>
            <p className="page-hero-desc">
              Elevate your production with broadcast-grade aerial cinematography. Dreamline Production provides DGCA-certified drone videography across Kolkata and West Bengal, capturing dynamic perspective, scale, and cinematic energy for weddings, corporate documentaries, real estate, and commercial campaigns.
            </p>
          </div>
        </section>

        <section className="content-container pb-20">
          <article className="prose prose-invert prose-lg max-w-none text-gray-300">

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
        </section>

        {/* DYNAMIC VIDEO SHOWCASE - Full Width 2-Column Luxury Layout */}
        {page?.videos && page.videos.length > 0 && (
          <ServiceVideoShowcase 
            videos={page.videos}
            title={page.videoSectionTitle || "Aerial Cinematography Showcase"}
            subtitle={page.videoSectionSubtitle || "DGCA-certified 4K drone cinematography for architecture, industrial campuses & grand events."}
            pageSlug="drone-videography-kolkata"
          />
        )}

        {/* DYNAMIC PHOTO GALLERY - Full Width 2-Column Luxury Layout */}
        {page?.gallery && page.gallery.length > 0 && (
          <section className="content-container py-16 md:py-20 w-full">
            <div className="mb-12 text-center">
              <span className="page-category-label">Aerial Frames &amp; Vistas</span>
              <h2 className="section-title italic tracking-tight">
                Captured <span className="text-[#c5a059]">Perspectives.</span>
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">
                DGCA-certified 4K aerial photography &amp; cinematography in Kolkata
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {page.gallery.map((img, idx) => {
                const isOddLast = page.gallery.length % 2 === 1 && idx === page.gallery.length - 1;
                return (
                  <div key={idx} className={isOddLast ? "md:col-span-2 flex justify-center w-full" : "w-full"}>
                    <div className={`relative aspect-[16/10] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 group shadow-2xl bg-neutral-950 ${isOddLast ? "w-full md:w-[calc(50%-1.25rem)]" : "w-full"}`}>
                      <img 
                        src={img.url} 
                        alt={img.alt || img.caption || "Drone videography Kolkata by Dreamline Production"} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        loading="lazy" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <p className="text-white text-xs md:text-sm font-black uppercase tracking-wider text-[#c5a059]">{img.caption}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Booking CTA Box */}
        <section className="content-container pb-20">
          <div className="mt-8 text-center bg-gradient-to-br from-[#c5a059]/10 to-transparent border border-[#c5a059]/20 rounded-3xl p-10 md:p-14">
            <h2 className="section-title mb-4">
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
