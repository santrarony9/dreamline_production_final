export const revalidate = 120;
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import ServiceVideoShowcase from "@/components/global/ServiceVideoShowcase";
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

export default async function CorporatePhotographyPage() {
  await dbConnect();
  const rawPage = await ServicePage.findOne({ slug: 'corporate-photography-kolkata' }).lean();
  const page = rawPage ? JSON.parse(JSON.stringify(rawPage)) : null;
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
      <main className="page-main">
        <section className="page-hero-section">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/services/">Services</Link>
            <span>/</span>
            <span className="current">Corporate Photography Kolkata</span>
          </nav>

          <div>
            <span className="page-category-label">
              Corporate
            </span>
            <h1 className="page-hero-title">
              Corporate <span className="text-[#c5a059]">Photography</span> &amp; Films in Kolkata
            </h1>
            <p className="page-hero-desc">
              Elevate your corporate brand narrative with high-impact visual media. Serving business leaders, IT enterprises, and industrial corporations across Kolkata, Salt Lake Sector V, and New Town, Dreamline Production delivers executive portraits, corporate brand documentaries, and industrial facility videos that build authority and trust.
            </p>
          </div>
        </section>

        <section className="content-container pb-20">
          <article className="prose prose-invert prose-lg max-w-none text-gray-300">

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
        </section>

        {/* DYNAMIC VIDEO SHOWCASE - Full Width 2-Column Luxury Layout */}
        {page?.videos && page.videos.length > 0 && (
          <ServiceVideoShowcase 
            videos={page.videos}
            title={page.videoSectionTitle || "Corporate Film Showcase"}
            subtitle={page.videoSectionSubtitle || "Industrial operations, heavy engineering walkthroughs & corporate brand narratives."}
            pageSlug="corporate-photography-kolkata"
          />
        )}

        {/* DYNAMIC PHOTO GALLERY - Full Width 2-Column Luxury Layout */}
        {page?.gallery && page.gallery.length > 0 && (
          <section className="content-container py-16 md:py-20 w-full">
            <div className="mb-12 text-center">
              <span className="page-category-label">Industrial &amp; Corporate Stills</span>
              <h2 className="section-title italic tracking-tight">
                Captured <span className="text-[#c5a059]">Frames.</span>
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">
                Foundries, manufacturing floors &amp; executive portraits in Kolkata
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
                        alt={img.alt || img.caption || "Corporate photography Kolkata by Dreamline Production"} 
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
