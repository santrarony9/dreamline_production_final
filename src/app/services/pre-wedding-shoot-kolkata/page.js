
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import ServiceVideoShowcase from "@/components/global/ServiceVideoShowcase";
import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';

export const metadata = {
  title: "Cinematic Pre-Wedding Photography Kolkata | Plan Your Shoot",
  description: "Plan a memorable couple pre-wedding shoot in Kolkata with creative themes, beautiful locations, and natural photography. Capture the chemistry that makes you unique.",
  alternates: { canonical: "https://dreamlineproduction.com/services/pre-wedding-shoot-kolkata/" },
  openGraph: {
    title: "Cinematic Pre-Wedding Photography Kolkata | Plan Your Shoot",
    description: "Plan a memorable couple pre-wedding shoot in Kolkata with creative themes, beautiful locations, and natural photography. Capture the chemistry that makes you unique.",
    url: "https://dreamlineproduction.com/services/pre-wedding-shoot-kolkata/",
    siteName: 'Dreamline Production',
    locale: 'en_IN',
    type: 'website',
  }
};

export default async function PreWeddingShootPage() {
  await dbConnect();
  const rawPage = await ServicePage.findOne({ slug: 'pre-wedding-shoot-kolkata' }).lean();
  const page = rawPage ? JSON.parse(JSON.stringify(rawPage)) : null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "How much does a pre-wedding shoot in Kolkata cost?", "acceptedAnswer": {"@type": "Answer", "text": "The cost of a pre-wedding shoot in Kolkata depends on the number of hours, locations, number of outfits, photography style, and services included."}}, {"@type": "Question", "name": "Which locations are best for pre-wedding photography in Kolkata?", "acceptedAnswer": {"@type": "Answer", "text": "Kolkata offers many options for pre-wedding photography, including heritage areas, modern cityscapes, gardens, cafes, and private locations."}}, {"@type": "Question", "name": "How early should we book a pre-wedding shoot photographer?", "acceptedAnswer": {"@type": "Answer", "text": "Ideally, couples should book their pre-wedding shoot photographer at least 1\u20132 months in advance."}}, {"@type": "Question", "name": "Can we choose our own concept for a pre-wedding photoshoot?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, you can share your ideas, favourite locations, outfits, or references for the pre-wedding photoshoot."}}, {"@type": "Question", "name": "How long does a couple pre-wedding shoot usually take?", "acceptedAnswer": {"@type": "Answer", "text": "A couple pre-wedding shoot can take anywhere from a few hours to a full day."}}]}) }} />
      <main className="bg-black pt-32 min-h-screen text-white">
        <section className="container mx-auto px-6 max-w-4xl pb-32">
          <nav aria-label="Breadcrumb" className="mb-8 text-xs font-bold uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-[#c5a059] transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/services/" className="hover:text-[#c5a059] transition-colors">Services</Link>
            <span className="mx-2">/</span>
            <span className="text-[#c5a059]">Pre-Wedding Shoot Kolkata</span>
          </nav>
          <article className="prose prose-invert prose-lg max-w-none text-gray-300">
            
      <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8"><span className="text-[#c5a059]">Pre-Wedding</span> Photographer in Kolkata</h1>
      <p className="mb-4">Planning your special day? Before you say “I do,” let's capture the magic of your love story with a stunning pre-wedding shoot in the City of Joy! At Dreamline Production, we specialize in creating dreamy, cinematic pre-wedding photography that tells your unique story, set against Kolkata's iconic heritage buildings, riverside ghats, and charming old-world lanes.</p>
      <h2 className="font-heading text-2xl font-bold mt-10 mb-4 text-[#c5a059]">Why a Pre-Wedding Photoshoot Matters</h2>
      <p className="mb-4">A pre-wedding photoshoot isn't just about pretty pictures; it captures the excitement, nerves, and pure joy of two people about to start a new chapter together. It's also a lovely way to get comfortable in front of the camera before the wedding day itself, so you look relaxed and natural in every frame.</p>
      <h3 className="font-heading text-xl font-bold mt-8 mb-4">Best Locations for Pre-Wedding Photography in Kolkata</h3>
      <p className="mb-2">Kolkata offers no shortage of gorgeous backdrops for pre-wedding photography:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Victoria Memorial & Maidan – timeless colonial charm</li>
        <li>Princep Ghat – romantic riverside views</li>
        <li>Science City & Eco Park – modern, colourful backdrops</li>
        <li>North Kolkata's old lanes – vintage, nostalgic vibes</li>
        <li>Rabindra Sarobar – lush greenery and calm waters</li>
      </ul>
      <p className="mb-4">Our pre-wedding shoot photography team knows exactly which spot, light, and time of day work best for your theme.</p>
      <h2 className="font-heading text-2xl font-bold mt-10 mb-4 text-[#c5a059]">Why Choose Us for Your Pre-Wedding Photoshoot</h2>
      <p className="mb-4">With years of experience shooting weddings across Kolkata and beyond, we know how to turn nervous energy into gorgeous, natural photographs. From candid moments to styled portraits, every pre-wedding photoshoot is handled with care, creativity, and a genuine passion for storytelling.</p>
      <p className="mb-4">Ready to create magic together? Get in touch with Dreamline Production today and let's plan your dream pre-wedding shoot!</p>

      <h2 className="font-heading text-2xl font-bold mt-12 mb-6 text-[#c5a059]">Frequently Asked Questions</h2>
      <div className="space-y-6">
        <div><h4 className="font-bold">1. How much does a pre-wedding shoot in Kolkata cost?</h4><p className="text-gray-400 mt-2">The cost of a pre-wedding shoot in Kolkata depends on the number of hours, locations, number of outfits, photography style, and services included. It is best to discuss your requirements and get a package based on your needs.</p></div>
        <div><h4 className="font-bold">2. Which locations are best for pre-wedding photography in Kolkata?</h4><p className="text-gray-400 mt-2">Kolkata offers many options for pre-wedding photography, including heritage areas, modern cityscapes, gardens, cafes, and private locations. The right place depends on your preferred theme, outfits, and overall shoot concept.</p></div>
        <div><h4 className="font-bold">3. How early should we book a pre-wedding shoot photographer?</h4><p className="text-gray-400 mt-2">Ideally, couples should book their pre-wedding shoot photographer at least 1–2 months in advance. This gives enough time to plan locations, outfits, concepts, dates, and other details without last-minute stress.</p></div>
        <div><h4 className="font-bold">4. Can we choose our own concept for a pre-wedding photoshoot?</h4><p className="text-gray-400 mt-2">Yes, you can share your ideas, favourite locations, outfits, or references for the pre-wedding photoshoot. The concept can then be planned around your personality, comfort level, and the kind of photographs you want.</p></div>
        <div><h4 className="font-bold">5. How long does a couple pre-wedding shoot usually take?</h4><p className="text-gray-400 mt-2">A couple pre-wedding shoot can take anywhere from a few hours to a full day, depending on the number of locations, outfits, concepts, and photography requirements. Your schedule can be planned in advance for a comfortable experience.</p></div>
      </div>
    
          </article>
        </section>

        {/* DYNAMIC VIDEO SHOWCASE - Full Width 2-Column Luxury Layout */}
        {page?.videos && page.videos.length > 0 && (
          <ServiceVideoShowcase 
            videos={page.videos}
            title={page.videoSectionTitle || "Pre-Wedding Cinematography Showcase"}
            subtitle={page.videoSectionSubtitle || "Explore our romantic couple storytelling, Prinsep Ghat moments & cinematic teasers."}
            pageSlug="pre-wedding-shoot-kolkata"
          />
        )}

        {/* DYNAMIC PHOTO GALLERY - Full Width 2-Column Luxury Layout */}
        {page?.gallery && page.gallery.length > 0 && (
          <section className="py-20 px-4 sm:px-6 md:px-10 lg:px-12 max-w-7xl mx-auto w-full">
            <div className="mb-12 text-center">
              <span className="text-[#c5a059] text-[10px] md:text-xs font-black uppercase tracking-[0.3em] block mb-2">Cinematic Frames</span>
              <h2 className="font-heading text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
                Captured <span className="text-[#c5a059]">Moments.</span>
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">
                Prinsep Ghat, Victoria Memorial &amp; riverside couple portraits
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
                        alt={img.alt || img.caption || "Pre-wedding shoot Kolkata by Dreamline Production"} 
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

        <section className="container mx-auto px-6 max-w-4xl pb-32">
          <div className="mt-8 text-center bg-gradient-to-br from-[#c5a059]/10 to-transparent border border-[#c5a059]/20 rounded-3xl p-12">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
              Ready to <span className="text-[#c5a059]">Book?</span>
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Contact Dreamline Production today to discuss your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all">
                Get a Free Quote
              </Link>
              <a href="tel:+918240054002" className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all">
                Call +91 82400 54002
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
