import Image from "next/image";
import { sanitizeHtml } from "@/lib/sanitize";

export default function Expertise({ expertise }) {
    const { heading, description, image, servicesList } = expertise || {};

    return (
        <section className="py-16 md:py-32 bg-[#050505] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                    <div className="relative group pb-6 lg:pb-0">
                        <div className="aspect-square rounded-3xl overflow-hidden transition-all duration-1000 relative bg-[#050505] border border-white/5">
                            <Image
                                src={image || "https://images.unsplash.com/photo-1492691523567-6170c24e5fb9?q=80&w=2070&auto=format&fit=crop"}
                                alt="Luxury Bengali wedding cinematography by Dreamline Production Kolkata"
                                fill
                                className="object-contain md:object-cover group-hover:scale-105 transition-transform duration-1000"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                        {/* Experience Badge - Inside on mobile/tablet, offset on desktop 2-col */}
                        <div className="absolute bottom-4 right-4 lg:-bottom-6 lg:-right-6 xl:-bottom-10 xl:-right-10 bg-[#c5a059] p-4 md:p-8 lg:p-10 rounded-2xl md:rounded-3xl shadow-2xl z-10 w-28 md:w-36 lg:w-auto flex flex-col items-center justify-center text-center">
                            <div className="font-heading text-3xl sm:text-4xl lg:text-6xl font-black text-black">{expertise?.yearsExperience || "15"}</div>
                            <div className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-black/70">
                                Years of Storytelling
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-12">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">
                                OUR PHILOSOPHY
                            </p>
                            <h2
                                className="section-title text-white leading-[1.15] pb-2 mb-6 uppercase break-words"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(heading || "LUXURY<br/>EMOTION<br/>STORYTELLING.") }}
                            />
                            <p className="text-gray-300 text-base md:text-lg max-w-xl leading-relaxed">
                                {description || "Dreamline Production moves away from \"standard shots.\" We build cinematic experiences that preserve the soul of the event, treated with high-end color grading and sound design."}
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {(servicesList && servicesList.length > 0 ? servicesList : [
                                { name: "Cinematic Film-making", number: "01" },
                                { name: "Luxury Photography", number: "02" },
                                { name: "Conceptual Edits", number: "03" },
                                { name: "Brand Identity", number: "04" }
                            ]).map((service, index) => (
                                <div key={index} className="p-6 md:p-8 bg-[#151515] border border-white/5 rounded-2xl hover:border-[#c5a059] transition-all group interactive">
                                    <div className="text-[10px] font-black text-[#c5a059] mb-4">{service.number}</div>
                                    <h3 className="font-bold text-white uppercase tracking-widest">{service.name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
