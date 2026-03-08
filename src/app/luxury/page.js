export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Content from "@/models/Content";
import ProjectGallery from "@/components/home/ProjectGallery";
import SparkCarousel from "@/components/luxury/SparkCarousel";

export async function generateMetadata() {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const globalSeo = siteContent?.global?.seo || {};

    return {
        title: `Luxury Weddings | ${globalSeo.title || "Dreamline Production"}`,
        description: siteContent?.luxury?.hero?.description || "Specializing in luxury Bengali weddings and destination cinematic films across India.",
    };
}

export default async function LuxuryPage() {
    await dbConnect();

    // Fetch weddings specifically for the luxury page
    const weddings = await Wedding.find().sort({ order: 1 }).lean();
    const siteContent = await Content.findOne().lean();

    const luxuryData = JSON.parse(JSON.stringify(siteContent?.luxury || {
        title1: "The Heritage",
        title2: "Collection.",
        description: "We don't just photograph; we archive emotions. Specializing in luxury Bengali weddings and destination cinematic films across India."
    }));

    const serializedWeddings = weddings.map(w => ({
        ...JSON.parse(JSON.stringify(w)),
        id: w._id.toString(),
        type: "wedding"
    }));

    return (
        <main className="bg-black pt-24 md:pt-32">
            <section className="px-8 md:px-16 mb-20">
                <div className="max-w-4xl">
                    <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase text-white">
                        {luxuryData.hero?.titleLine1 || "The Heritage"} <br />
                        <span className="text-[#c5a059]">{luxuryData.hero?.titleLine2 || "Collection."}</span>
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
                        {luxuryData.hero?.description || "We don't just photograph; we archive emotions. Specializing in luxury Bengali weddings and destination cinematic films across India."}
                    </p>
                </div>
            </section>

            {/* Spark Blue Diamond Premium Carousel */}
            <SparkCarousel />

            {/* Reusing ProjectGallery but with strict category enforcement */}
            <ProjectGallery initialProjects={serializedWeddings} category="wedding" />

            {/* Luxury Testimonial Section */}
            {luxuryData.testimonial && luxuryData.testimonial.quote && (
                <section className="py-24 bg-black overflow-hidden">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="w-12 h-12 bg-[#c5a059] rounded-full flex items-center justify-center mx-auto mb-12">
                                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H11.017C10.4647 12 10.017 11.5523 10.017 11V6C10.017 5.44772 10.4647 5 11.017 5H19.017C20.6738 5 22.017 6.34315 22.017 8V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM3.0166 21L3.0166 18C3.0166 16.8954 3.91203 16 5.0166 16H8.0166C8.56889 16 9.0166 15.5523 9.0166 15V9C9.0166 8.44772 8.56889 8 8.0166 8H4.0166C3.46432 8 3.0166 8.44772 3.0166 9V11C3.0166 11.5523 2.56889 12 2.0166 12H0.0166016C-0.535684 12 -0.983398 11.5523 -0.983398 11V6C-0.983398 5.44772 -0.535684 5 0.0166016 5H8.0166C9.67345 5 11.0166 6.34315 11.0166 8V15C11.0166 18.3137 8.3303 21 5.0166 21H3.0166Z" />
                                </svg>
                            </div>
                            <h2 className="font-heading text-2xl md:text-4xl font-black text-white uppercase italic leading-tight mb-12">
                                {luxuryData.testimonial.quote}
                            </h2>
                            <div className="flex items-center justify-center gap-6">
                                {luxuryData.testimonial.image && (
                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-[#c5a059]/30">
                                        <img src={luxuryData.testimonial.image} alt={luxuryData.testimonial.author} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="text-white font-black uppercase tracking-widest text-sm">{luxuryData.testimonial.author}</p>
                                    <p className="text-[#c5a059] text-[10px] uppercase font-black tracking-[0.2em]">{luxuryData.testimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Additional Luxury specific CTA */}
            <section className="py-24 bg-[#050505] border-t border-white/5 text-center">
                <h2 className="font-heading text-3xl font-black text-white uppercase italic mb-8">
                    Plan Your <span className="text-[#c5a059]">Dream</span> Wedding.
                </h2>
                <a href="/contact" className="inline-block px-12 py-4 bg-[#c5a059] text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:-translate-y-1 interactive">
                    Check Availability
                </a>
            </section>
        </main>
    );
}
