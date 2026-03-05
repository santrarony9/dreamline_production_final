export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Content from "@/models/Content";
import ProjectGallery from "@/components/home/ProjectGallery";

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

            {/* Reusing ProjectGallery but with pre-filtered wedding data */}
            <ProjectGallery initialProjects={serializedWeddings} />

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
