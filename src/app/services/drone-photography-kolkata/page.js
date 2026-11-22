
export const revalidate = 120;
import dbConnect from "@/lib/mongodb";
import ServicePage from "@/models/ServicePage";
import ServiceVideoShowcase from "@/components/global/ServiceVideoShowcase";
import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';

export const metadata = {
  title: "Drone Photography & Videography Services in Kolkata",
  description: "Capture stunning aerial visuals with professional drone photography and videography services in Kolkata for events, properties, weddings, and brands.",
  alternates: { canonical: "https://dreamlineproduction.com/services/drone-photography-kolkata/" },
  openGraph: {
    title: "Drone Photography & Videography Services in Kolkata",
    description: "Capture stunning aerial visuals with professional drone photography and videography services in Kolkata for events, properties, weddings, and brands.",
    url: "https://dreamlineproduction.com/services/drone-photography-kolkata/",
    siteName: 'Dreamline Production',
    locale: 'en_IN',
    type: 'website',
  }
};

export default async function DronePhotographyPage() {
  await dbConnect();
  const rawPage = await ServicePage.findOne({ slug: 'drone-photography-kolkata' }).lean();
  const page = rawPage ? JSON.parse(JSON.stringify(rawPage)) : null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What is included in drone photography services in Kolkata?", "acceptedAnswer": {"@type": "Answer", "text": "Drone photography services generally include aerial image capture, flight planning, camera operation, and professionally selected images."}}, {"@type": "Question", "name": "Can drone videography be used for weddings and pre-wedding shoots?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, drone videography can add cinematic aerial views to weddings and pre-wedding shoots."}}, {"@type": "Question", "name": "Do I need permission for a drone shoot in Kolkata?", "acceptedAnswer": {"@type": "Answer", "text": "Drone operations in India are subject to applicable DGCA rules, airspace restrictions, and permissions where required."}}, {"@type": "Question", "name": "How long does a professional drone shoot take?", "acceptedAnswer": {"@type": "Answer", "text": "The duration depends on the project, location, number of shots, weather, and coverage required."}}, {"@type": "Question", "name": "Can drone photography be combined with regular photography?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, combining aerial and ground-level photography can create a more complete visual story."}}]}) }} />
      <main className="page-main">
        <section className="page-hero-section">
          <nav aria-label="Breadcrumb" className="page-breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/services/">Services</Link>
            <span>/</span>
            <span className="current">Drone Photography Kolkata</span>
          </nav>
          <div>
            <span className="page-category-label">
              Drone &amp; Aerial
            </span>
            <h1 className="page-hero-title">
              Drone <span className="text-[#c5a059]">Photography &amp; Videography</span> Services in Kolkata
            </h1>
            <p className="page-hero-desc">
              Take your visuals to new heights, literally! Our Drone Photography in Kolkata service captures breathtaking aerial views that ground-level cameras simply cannot match. Whether it's a grand wedding, a sprawling property, or a corporate event, we bring a cinematic bird's-eye perspective to every story we shoot.
            </p>
          </div>
        </section>

        <section className="content-container pb-20">
          <article className="prose prose-invert prose-lg max-w-none text-gray-300">
      <h2 className="font-heading text-2xl font-bold mt-10 mb-4 text-[#c5a059]">Why Choose Our Aerial Photography Service</h2>
      <p className="mb-4">As a trusted Aerial Photography Service in Kolkata, we combine skilled pilots, high-end drone equipment, and a creative eye to deliver crisp, stable footage every time. From sweeping landscape shots to dramatic reveal videos, our team knows how to frame the perfect angle for maximum impact.</p>
      <h3 className="font-heading text-xl font-bold mt-8 mb-4">Professional Drone Photography in Kolkata</h3>
      <p className="mb-4">Drone photography is ideal for capturing large spaces, venues, landscapes, buildings, events, and special occasions. Aerial photographs provide a broader perspective while highlighting the surroundings and overall scale of your subject.</p>
      <p className="mb-4">Whether you need aerial photographs for a wedding venue, resort, real estate property, corporate project, or promotional campaign, the shoot can be planned according to your requirements. Our team focuses on composition, movement, lighting, and timing to create visually appealing aerial photographs.</p>
      <p className="mb-4">With Drone Photography in Kolkata, you can showcase your property, event, or location more engagingly. Aerial images can also be used for websites, social media, advertisements, portfolios, promotional videos, and marketing campaigns.</p>
      <h3 className="font-heading text-xl font-bold mt-8 mb-4">Create Cinematic Aerial Visuals in Kolkata</h3>
      <p className="mb-4">From beautiful wedding venues to impressive properties and large-scale events, aerial photography can give your project a completely different visual identity. It helps viewers understand the scale of a location while creating an immersive and cinematic experience.</p>
      <p className="mb-4">If you need professional aerial visuals for a personal, commercial, or production project, a well-planned drone shoot can be an excellent addition to your photography and videography requirements.</p>
      <h3 className="font-heading text-xl font-bold mt-8 mb-4">Where Drone Shoots Work Best</h3>
      <p className="mb-2">Aerial coverage adds real value across many types of shoots:</p>
      <ul className="list-disc pl-6 space-y-2 mb-6">
        <li>Wedding processions and destination weddings</li>
        <li>Real estate and property walkthroughs</li>
        <li>Corporate events and large gatherings</li>
        <li>Construction and project progress documentation</li>
        <li>Resorts, farmhouses, and venue promotions</li>
      </ul>
      <p className="mb-4">Every flight is planned with safety, permissions, and the perfect lighting in mind, so you get footage that's both stunning and stress-free.</p>
      <h3 className="font-heading text-xl font-bold mt-8 mb-4">See Our Work in Person</h3>
      <p className="mb-4">Want to see sample footage and chat about your project? Visit our studio and let our team walk you through past drone projects, packages, and ideas tailored to your event or property.</p>
      <h2 className="font-heading text-2xl font-bold mt-10 mb-4 text-[#c5a059]">Get in Touch</h2>
      <p className="mb-4">At Dreamline Production, we turn ordinary moments into extraordinary aerial stories. Reach out today and let's plan a drone shoot that gives your event or property the grand perspective it deserves.</p>

      <h2 className="font-heading text-2xl font-bold mt-12 mb-6 text-[#c5a059]">Frequently Asked Questions</h2>
      <div className="space-y-6">
        <div><h4 className="font-bold">1. What is included in drone photography services in Kolkata?</h4><p className="text-gray-400 mt-2">Drone photography services generally include aerial image capture, flight planning, camera operation, and professionally selected images. The exact package may vary based on shoot duration, location, requirements, and the type of project.</p></div>
        <div><h4 className="font-bold">2. Can drone videography be used for weddings and pre-wedding shoots?</h4><p className="text-gray-400 mt-2">Yes, drone videography can add cinematic aerial views to weddings and pre-wedding shoots. It can capture venues, outdoor moments, surroundings, and large scenes, complementing regular photography and ground-level video coverage.</p></div>
        <div><h4 className="font-bold">3. Do I need permission for a drone shoot in Kolkata?</h4><p className="text-gray-400 mt-2">Drone operations in India are subject to applicable DGCA rules, airspace restrictions, and permissions where required. The feasibility of a shoot depends on the location, drone category, and current aviation regulations.</p></div>
        <div><h4 className="font-bold">4. How long does a professional drone shoot take?</h4><p className="text-gray-400 mt-2">The duration depends on the project, location, number of shots, weather, and coverage required. A small property shoot may take less time, while weddings, events, or commercial productions can require extended aerial coverage.</p></div>
        <div><h4 className="font-bold">5. Can drone photography be combined with regular photography?</h4><p className="text-gray-400 mt-2">Yes, combining aerial and ground-level photography can create a more complete visual story. Drone shots can show the overall location and scale, while traditional photography captures close-up details, people, emotions, and important moments.</p></div>
      </div>
    
          </article>
        </section>

        {/* DYNAMIC VIDEO SHOWCASE - Full Width 2-Column Luxury Layout */}
        {page?.videos && page.videos.length > 0 && (
          <ServiceVideoShowcase 
            videos={page.videos}
            title={page.videoSectionTitle || "Drone Photography & Aerial Showcase"}
            subtitle={page.videoSectionSubtitle || "Breathtaking 4K aerial photography for architecture, events & corporate infrastructure."}
            pageSlug="drone-photography-kolkata"
          />
        )}

        {/* DYNAMIC PHOTO GALLERY - Full Width 2-Column Luxury Layout */}
        {page?.gallery && page.gallery.length > 0 && (
          <section className="content-container py-16 md:py-20 w-full">
            <div className="mb-12 text-center">
              <span className="page-category-label">Aerial Still Photography</span>
              <h2 className="section-title italic tracking-tight">
                Captured <span className="text-[#c5a059]">Perspectives.</span>
              </h2>
              <p className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">
                DGCA-certified high-resolution drone stills across Kolkata &amp; West Bengal
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
                        alt={img.alt || img.caption || "Drone photography Kolkata by Dreamline Production"} 
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

        <section className="content-container pb-20">
          <div className="mt-8 text-center bg-gradient-to-br from-[#c5a059]/10 to-transparent border border-[#c5a059]/20 rounded-3xl p-10 md:p-14">
            <h2 className="section-title mb-4">
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
