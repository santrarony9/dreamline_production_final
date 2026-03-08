export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";
import ReviewSlider from "@/components/home/ReviewSlider";

export async function generateMetadata() {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const globalSeo = siteContent?.global?.seo || {};

    return {
        title: `About Us | ${globalSeo.title || "Dreamline Production"}`,
        description: "Learn more about Dreamline Production, a leading wedding photography and cinematic film house in Kolkata.",
    };
}

export default async function AboutPage() {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const aboutData = siteContent?.about || {};

    return (
        <main className="bg-black pt-24 md:pt-32">
            {/* Hero Section */}
            <section className="container mx-auto px-6 mb-20">
                <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">
                    {aboutData.hero?.subtitle || "Est. 2010 • Govt. Registered"}
                </span>
                <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black mb-12 leading-none text-white uppercase">
                    {aboutData.hero?.titleLine1 || "TRUSTED PRODUCTION"}<br />
                    <span className="text-white/20">{aboutData.hero?.titleLine2 || "HOUSE IN KOLKATA."}</span>
                </h1>
                <p className="max-w-3xl text-lg text-gray-400 leading-relaxed mb-12">
                    {aboutData.hero?.description || "Dreamline Production is a leading production house in Kolkata delivering cinematic video production, photography, and digital content solutions..."}
                </p>
                <div className="h-[1px] w-full bg-white/10 mb-20"></div>

                {/* About & Vision */}
                <div className="grid md:grid-cols-2 gap-16 mb-24">
                    <div>
                        <h2 className="font-heading text-3xl font-black mb-6 uppercase text-white">
                            {aboutData.details?.heading || "About Us"}
                        </h2>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            {aboutData.details?.text1 || "Dreamline Production is a Kolkata-based creative production company..."}
                        </p>
                        <p className="text-gray-400 leading-relaxed">
                            {aboutData.details?.text2 || "We work with corporate brands, startups, agencies..."}
                        </p>
                    </div>
                    <div className="space-y-12">
                        <div className="p-10 bg-[#151515] border border-white/5 rounded-3xl hover:border-[#c5a059] transition-all group">
                            <h3 className="font-heading text-xl font-bold mb-4 text-[#c5a059]">OUR VISION</h3>
                            <p className="text-sm text-gray-400">
                                {aboutData.details?.vision || "To become one of the most trusted and innovative production houses..."}
                            </p>
                        </div>
                        <div className="p-10 bg-[#151515] border border-white/5 rounded-3xl hover:border-[#c5a059] transition-all group">
                            <h3 className="font-heading text-xl font-bold mb-4 text-[#c5a059]">OUR MISSION</h3>
                            <p className="text-sm text-gray-400">
                                {aboutData.details?.mission || "To help brands and individuals communicate their stories through powerful visuals..."}
                            </p>
                        </div>
                    </div>
                </div>


                {/* Founder's Note */}
                <div className="mt-20 md:mt-32 max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center bg-[#151515] p-6 md:p-12 rounded-[2rem] border border-white/5">
                        <div className="relative order-2 md:order-1">
                            <div className="aspect-[3/4] bg-zinc-800 rounded-xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                                {aboutData.founder?.image ? (
                                    <img
                                        src={aboutData.founder.image}
                                        className="w-full h-full object-cover"
                                        alt="Founder"
                                    />
                                ) : null}
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#c5a059] rounded-full flex items-center justify-center -z-10"></div>
                        </div>
                        <div className="order-1 md:order-2">
                            <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">The Visionary</span>
                            <h2 className="font-heading text-3xl md:text-4xl font-black mb-8 uppercase leading-tight text-white">
                                Capturing <br />The Unseen.
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-8 italic">
                                "{aboutData.founder?.note || "At Dreamline, we don't just record events; we archive feelings..."}"
                            </p>
                            <div className="flex items-end gap-4">
                                <div className="h-[1px] w-12 bg-[#c5a059] mb-4"></div>
                                <div>
                                    <h4 className="font-heading text-xl font-bold text-white">Rony</h4>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest">Founder & Creative Director</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* History Timeline */}
            <section className="py-20 md:py-32 bg-black overflow-hidden relative border-t border-white/5">
                <div className="container mx-auto px-6">
                    <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">Our Journey</span>
                    <h2 className="font-heading text-4xl md:text-5xl font-black mb-16 uppercase text-white">Milestones & Memories</h2>

                    <div className="relative border-l border-white/10 ml-4 md:ml-10 py-10 space-y-20">
                        {(aboutData.timeline || [
                            { year: "2010", title: "The Inception", desc: "Founded in Kolkata with a single camera and a vision..." },
                            { year: "2013", title: "Going Global", desc: "Documented our first international destination wedding..." },
                            { year: "2016", title: "Commercial Expansion", desc: "Expanded our services to include high-end commercial ad films..." },
                            { year: "2020", title: "The Heritage Collection", desc: "Launched our signature \"Heritage Collection\" specifically curated for luxury Bengali weddings..." }
                        ]).map((item, index) => (
                            <div key={index} className="relative pl-12 md:pl-20 group">
                                <div className="absolute -left-[5px] top-2 w-[10px] h-[10px] bg-[#c5a059] rounded-full shadow-[0_0_15px_#c5a059]"></div>
                                <span className="text-6xl md:text-8xl font-black text-white/5 absolute -top-10 left-10 md:left-16 select-none z-0 group-hover:text-white/10 transition-colors">
                                    {item.year || item.title.substring(0, 4)}
                                </span>
                                <div className="relative z-10">
                                    <h3 className="font-heading text-2xl font-bold text-[#c5a059] mb-2">{item.title}</h3>
                                    <p className="text-gray-400 text-sm max-w-md">{item.description || item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-zinc-900 border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                        <div>
                            <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">
                                {aboutData.team?.sectionSubtitle || "The Creators"}
                            </span>
                            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase text-white"
                                dangerouslySetInnerHTML={{ __html: aboutData.team?.heading || "Meet The <br>Team." }} />
                        </div>
                        <div className="mt-8 md:mt-0">
                            <p className="text-gray-400 text-sm max-w-md text-right">
                                {aboutData.team?.description || "A collective of cinematographers, editors, and creative directors united by a passion for visual perfection."}
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {(aboutData.team?.members?.length > 0 ? aboutData.team.members : [
                            { name: "Arjun Das", role: "Lead Cinematographer", image: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=800" },
                            { name: "Esha Gupta", role: "Creative Director", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800" },
                            { name: "Vikram Roy", role: "Senior Editor", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800" }
                        ]).map((member, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer">
                                <img src={member.image}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    alt={member.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                                <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="font-heading text-xl font-bold text-white mb-1">{member.name}</h3>
                                    <p className="text-[#c5a059] text-[10px] font-bold uppercase tracking-widest">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats & BTS Section */}
            <section className="py-24 bg-black relative">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">
                                {aboutData.bts?.sectionSubtitle || "By The Numbers"}
                            </span>
                            <h2 className="font-heading text-4xl md:text-6xl font-black mb-12 uppercase leading-none text-white" dangerouslySetInnerHTML={{ __html: aboutData.bts?.heading || "Proven<br>Excellence." }} />

                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-5xl md:text-6xl font-black text-white mb-2">15<span className="text-[#c5a059]">+</span></h3>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Years Experience</p>
                                </div>
                                <div>
                                    <h3 className="text-5xl md:text-6xl font-black text-white mb-2">500<span className="text-[#c5a059]">+</span></h3>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Weddings Filmed</p>
                                </div>
                                <div>
                                    <h3 className="text-5xl md:text-6xl font-black text-white mb-2">100<span className="text-[#c5a059]">+</span></h3>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Brands Trust Us</p>
                                </div>
                                <div>
                                    <h3 className="text-5xl md:text-6xl font-black text-white mb-2">4.9</h3>
                                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Average Rating</p>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="aspect-video bg-zinc-800 rounded-2xl overflow-hidden border border-white/10 relative group">
                                <img src={aboutData.bts?.videoImage || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=1600"}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                    alt="Behind the Scenes" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer border border-white/20">
                                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-6">
                                    <span className="bg-[#c5a059] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full">Behind The Scenes</span>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 hidden md:block"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">
                                {aboutData.whyUs?.sectionSubtitle || "Why Us"}
                            </span>
                            <h2 className="font-heading text-4xl md:text-5xl font-black mb-10 leading-none text-white uppercase" dangerouslySetInnerHTML={{ __html: aboutData.whyUs?.heading || "THE DREAMLINE<br>DIFFERENCE." }} />
                            <p className="text-gray-400 mb-8">
                                {aboutData.whyUs?.description || "We don't just record events; we craft stories that emotionally connect with audiences."}
                            </p>

                            <ul className="space-y-6">
                                {(aboutData.whyUs?.points?.length > 0 ? aboutData.whyUs.points : [
                                    { title: "Creative Storytelling", description: "Narratives that resonate and engaging visuals." },
                                    { title: "Professional Equipment", description: "Cinema-line cameras and expert lighting." },
                                    { title: "End-to-End Production", description: "From concept to final edit, we handle it all." }
                                ]).map((point, idx) => (
                                    <li key={idx} className="flex items-start gap-4">
                                        <span className="text-[#c5a059] font-bold">0{idx + 1}.</span>
                                        <div>
                                            <h4 className="font-bold uppercase text-sm mb-1 text-white">{point.title}</h4>
                                            <p className="text-xs text-gray-500">{point.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-zinc-900 rounded-[2rem] p-10 border border-white/5">
                            <h3 className="font-heading text-2xl font-bold mb-8 uppercase text-center text-white">
                                {aboutData.whyUs?.processHeading || "Our Process"}
                            </h3>
                            <div className="space-y-8">
                                {(aboutData.whyUs?.processSteps?.length > 0 ? aboutData.whyUs.processSteps : [
                                    "Concept & Planning",
                                    "Shooting & Direction",
                                    "Post Production",
                                    "Delivery & Optimization"
                                ]).map((step, idx, arr) => (
                                    <div key={idx} className={`flex justify-between items-center ${idx !== arr.length - 1 ? 'border-b border-white/10 pb-4' : ''}`}>
                                        <h4 className="font-bold text-sm text-white">{step}</h4>
                                        <span className="text-xs text-[#c5a059]">STEP {idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Production Services */}
            <section className="py-32 bg-[#0a0a0a]">
                <div className="container mx-auto px-6">
                    <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">What We Do</span>
                    <h2 className="font-heading text-4xl md:text-5xl font-black mb-16 uppercase text-white">Production Services</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(aboutData.services || [
                            { title: "Corporate Video Production", desc: "Professional brand films and company profile videos..." },
                            { title: "Wedding Cinematography", desc: "Emotion-driven cinematic wedding films capturing real moments..." },
                            { title: "Commercial Shoots", desc: "High-impact advertisement films and product promotions..." },
                            { title: "Photography Services", desc: "Corporate photography, product photography, and creative photoshoots..." },
                            { title: "Social Media Content", desc: "Reels, YouTube content, and short-form videos..." }
                        ]).map((service, index) => (
                            <div key={index} className="p-10 bg-[#151515] border border-white/5 rounded-3xl hover:border-[#c5a059] transition-all group interactive">
                                <h3 className="font-heading text-lg font-bold mb-4 text-white uppercase tracking-widest">{service.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reviews Slider */}
            <ReviewSlider reviews={siteContent?.home?.reviews?.list} />

            {/* CTA Section */}
            <section className="py-32 text-center border-t border-white/5">
                <h2 className="font-heading text-3xl md:text-5xl font-black mb-8 uppercase text-white">
                    Let's Create Something <span className="text-[#c5a059]">Extraordinary.</span>
                </h2>
                <p className="text-gray-400 mb-10 max-w-xl mx-auto">
                    Whether you need a corporate film, advertisement video, wedding cinematography, or digital content, Dreamline Production is ready to bring your vision to life.
                </p>
                <a href="/contact" className="inline-block bg-[#c5a059] text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all transform hover:-translate-y-1 interactive">
                    Contact Us
                </a>
            </section>
        </main>
    );
}
