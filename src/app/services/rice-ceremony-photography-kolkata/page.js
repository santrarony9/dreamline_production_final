
import StructuredData from '@/components/seo/StructuredData';
import Link from 'next/link';

export const metadata = {
  title: "Rice Ceremony Photographer in Kolkata | Annaprashan Photography",
  description: "Preserve your Bengali Annaprashan memories with professional photography in Kolkata. Capture every ritual, family blessing, baby smile, and precious moment naturally.",
  alternates: { canonical: "https://dreamlineproduction.com/services/rice-ceremony-photography-kolkata/" },
  openGraph: {
    title: "Rice Ceremony Photographer in Kolkata | Annaprashan Photography",
    description: "Preserve your Bengali Annaprashan memories with professional photography in Kolkata. Capture every ritual, family blessing, baby smile, and precious moment naturally.",
    url: "https://dreamlineproduction.com/services/rice-ceremony-photography-kolkata/",
    siteName: 'Dreamline Production',
    locale: 'en_IN',
    type: 'website',
  }
};

export default function ServicePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "How much does rice ceremony photography cost in Kolkata?", "acceptedAnswer": {"@type": "Answer", "text": "The cost depends on event duration, venue, photography style, number of photographers, and deliverables."}}, {"@type": "Question", "name": "What does a rice ceremony photography package include?", "acceptedAnswer": {"@type": "Answer", "text": "A package may include candid photography, traditional portraits, baby photographs, family pictures, ritual coverage, and edited images."}}, {"@type": "Question", "name": "Can you cover a Bengali Annaprashan ceremony at home?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, Annaprashan ceremonies held at home can be covered."}}, {"@type": "Question", "name": "When should I book baby rice ceremony photography?", "acceptedAnswer": {"@type": "Answer", "text": "It is better to book your photographer a few weeks in advance, especially during busy wedding and festive seasons."}}, {"@type": "Question", "name": "Can grandparents and family members be included in the photographs?", "acceptedAnswer": {"@type": "Answer", "text": "Absolutely. Family members are an important part of an Annaprashan celebration."}}]}) }} />
      <main className="bg-black pt-32 min-h-screen text-white">
        <section className="container mx-auto px-6 max-w-4xl pb-32">
          <article className="prose prose-invert prose-lg max-w-none text-gray-300">
            
      <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8"><span className="text-[#c5a059]">Rice Ceremony</span> Photography in Kolkata</h1>
      <p className="mb-4">A baby’s first rice ceremony is one of the most special moments for a family. From the little one tasting rice for the first time to the blessings of grandparents and the happiness of everyone around, every moment deserves to be remembered. Professional Rice Ceremony Photography in Kolkata helps you preserve these precious memories for years to come.</p>
      <p className="mb-4">Whether you are planning a traditional Bengali ceremony or a modern family celebration, the right photography team can capture the emotions, rituals, decorations, family interactions, and adorable moments of your little one naturally.</p>
      <h2 className="font-heading text-2xl font-bold mt-10 mb-4 text-[#c5a059]">Capture Your Baby’s Special Day in Kolkata</h2>
      <p className="mb-4">Your child's first rice ceremony happens only once. The photographs from this day become memories that your family can revisit as your little one grows up.</p>
      <p className="mb-4">At Dreamline Production, we focus on capturing the genuine emotions, traditions, and family moments that make your baby's Annaprashan special. From intimate home ceremonies to larger celebrations in Kolkata venues, we aim to document every meaningful moment naturally and beautifully.</p>
      <p className="mb-4">If you are planning an Annaprashan or Bengali rice ceremony in Kolkata, professional photography can help you preserve the happiness of this important family milestone for generations.</p>

      <h2 className="font-heading text-2xl font-bold mt-12 mb-6 text-[#c5a059]">Frequently Asked Questions</h2>
      <div className="space-y-6">
        <div><h4 className="font-bold">1. How much does rice ceremony photography cost in Kolkata?</h4><p className="text-gray-400 mt-2">The cost depends on event duration, venue, photography style, number of photographers, and deliverables. Families can choose a suitable Rice ceremony photography package based on their specific event and coverage requirements.</p></div>
        <div><h4 className="font-bold">2. What does a rice ceremony photography package include?</h4><p className="text-gray-400 mt-2">A package may include candid photography, traditional portraits, baby photographs, family pictures, ritual coverage, and edited images. Exact inclusions can vary depending on the duration and requirements of your ceremony.</p></div>
        <div><h4 className="font-bold">3. Can you cover a Bengali Annaprashan ceremony at home?</h4><p className="text-gray-400 mt-2">Yes, Annaprashan ceremonies held at home can be covered. Home photography allows the team to capture intimate rituals, family interactions, baby portraits, decorations, and candid moments in a natural environment.</p></div>
        <div><h4 className="font-bold">4. When should I book baby rice ceremony photography?</h4><p className="text-gray-400 mt-2">It is better to book your photographer a few weeks in advance, especially during busy wedding and festive seasons. Early booking allows enough time to discuss the ceremony schedule, venue, package, and photography preferences.</p></div>
        <div><h4 className="font-bold">5. Can grandparents and family members be included in the photographs?</h4><p className="text-gray-400 mt-2">Absolutely. Family members are an important part of an Annaprashan celebration. Photography can include grandparents, parents, siblings, relatives, and guests through both candid moments and planned family portraits.</p></div>
      </div>
    
          </article>
          <div className="mt-16 text-center bg-gradient-to-br from-[#c5a059]/10 to-transparent border border-[#c5a059]/20 rounded-3xl p-12">
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
