import Image from "next/image";

export default function Expertise({ expertise }) {
    const { heading, description, image, servicesList } = expertise || {};

    return (
        <section className="py-16 md:py-32 bg-[#050505] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
                    <div className="relative group">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-1000 relative bg-[#111]">
                            <Image
                                src={image || "https://images.unsplash.com/photo-1492691523567-6170c24e5fb9?q=80&w=2070&auto=format&fit=crop"}
                                alt="Expertise"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-1000"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                        </div>
                        {/* Experience Badge */}
                        <div className="absolute -bottom-4 -right-4 md:-bottom-10 md:-right-10 bg-[#c5a059] p-4 md:p-10 rounded-3xl shadow-2xl z-10 w-32 md:w-auto flex flex-col items-center justify-center text-center">
                            <div className="font-heading text-4xl md:text-6xl font-black text-black">{expertise?.yearsExperience || "15"}</div>
                            <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-black/60">
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
                                className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-8 uppercase break-words"
                                dangerouslySetInnerHTML={{ __html: heading || "LUXURY<br/>EMOTION<br/>STORYTELLING." }}
                            />
                            <p className="text-gray-500 text-lg max-w-xl leading-relaxed">
                                {description || "Dreamline® Production moves away from \"standard shots.\" We build cinematic experiences that preserve the soul of the event, treated with high-end color grading and sound design."}
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
                                    <h4 className="font-bold text-white uppercase tracking-widest">{service.name}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
