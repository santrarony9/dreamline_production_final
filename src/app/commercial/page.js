export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import ProjectGallery from "@/components/home/ProjectGallery";

export async function generateMetadata() {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const globalSeo = siteContent?.global?.seo || {};

    return {
        title: `Commercial Works | ${globalSeo.title || "Dreamline Production"}`,
        description: siteContent?.commercial?.hero?.description || "Elevating brands through cinematic narratives, high-fashion edits, and corporate documentaries.",
    };
}

export default async function CommercialPage() {
    await dbConnect();

    const siteContent = await Content.findOne().lean();

    // Commercial projects are currently stored in siteContent.projects in the legacy schema
    // We'll filter them here. In the future, these might move to their own model.
    const commercialProjects = (siteContent?.projects || [])
        .filter(p => p.type === "commercial" || p.category === "commercial");

    const commercialData = JSON.parse(JSON.stringify(siteContent?.commercial || {
        title1: "Commercial",
        title2: "Stories.",
        description: "Elevating brands through cinematic narratives. From high-fashion edits to corporate documentaries, we craft visuals that sell."
    }));

    const serializedProjects = commercialProjects.map(p => ({
        ...JSON.parse(JSON.stringify(p)),
        id: p._id?.toString() || Math.random().toString(),
        type: "commercial"
    }));

    return (
        <main className="bg-black pt-24 md:pt-32">
            <section className="px-8 md:px-16 mb-20">
                <div className="max-w-4xl">
                    <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-8 uppercase text-white">
                        {commercialData.hero?.titleLine1 || "Commercial"} <br />
                        <span className="text-[#c5a059]">{commercialData.hero?.titleLine2 || "Stories."}</span>
                    </h1>
                    <p className="text-white/60 text-lg leading-relaxed max-w-2xl">
                        {commercialData.hero?.description || "Elevating brands through cinematic narratives. From high-fashion edits to corporate documentaries, we craft visuals that sell."}
                    </p>
                </div>
            </section>

            <ProjectGallery initialProjects={serializedProjects} category="commercial" />

            <section className="py-24 bg-[#050505] border-t border-white/5 text-center">
                <h2 className="font-heading text-3xl font-black text-white uppercase italic mb-8">
                    Scale Your <span className="text-[#c5a059]">Brand</span> Identity.
                </h2>
                <a href="/contact" className="inline-block px-12 py-4 bg-[#c5a059] text-black font-black uppercase tracking-widest rounded-full hover:bg-white transition-all transform hover:-translate-y-1 interactive">
                    Get a Quote
                </a>
            </section>
        </main>
    );
}
