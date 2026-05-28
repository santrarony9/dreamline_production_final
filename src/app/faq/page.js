import StructuredData from "@/components/seo/StructuredData";

export async function generateMetadata() {
    return {
        title: "FAQ — Frequently Asked Questions About Dreamline Production",
        description: "Common questions about Dreamline Production's services — corporate films, wedding photography, podcast production, drone video, 3D mapping, 2D animation, line production, and news interviews in Kolkata.",
        alternates: {
            canonical: 'https://dreamlineproduction.com/faq',
        },
    };
}

const faqs = [
    {
        question: "What is Dreamline Production?",
        answer: "Dreamline Production is a premier cinematic production house based in Kolkata, India. Founded by Rony Santra with over 15 years of experience, we are a full-service production company offering corporate films, luxury wedding photography & cinematography, podcast production, line production, drone videography, 3D area mapping, 2D animation, live streaming, and professional interview setups for news channels and agencies. We are trusted by brands like TATA Trust, L&T, ABP Network, Al Jazeera, TV Today, BookMyShow, and Carlsberg."
    },
    {
        question: "What services does Dreamline Production offer?",
        answer: "We offer a comprehensive range of production services: Corporate Films & Ad Films, Luxury Wedding Photography & Cinematography, Podcast Studio & Production, Line Production for agencies and channels, Drone Videography & Aerial Shoots, 3D Area Mapping & Visualization, 2D Motion Graphics & Animation, Live Streaming & Broadcast, Professional Interviews for news channels and media agencies, Fashion Photography, and Corporate Event Coverage. Every project is treated with our signature cinematic quality."
    },
    {
        question: "Does Dreamline Production make corporate films and ad films?",
        answer: "Yes, corporate films and ad films are one of our core specialties. We handle end-to-end production — from concept development and scripting to shooting, editing, color grading, and final delivery. We have produced corporate films, brand campaigns, product videos, and corporate documentaries for major companies including TATA Trust, L&T, Carlsberg, and many more. Our cinematic approach sets us apart from typical corporate video production."
    },
    {
        question: "Does Dreamline Production offer podcast production services?",
        answer: "Yes, we offer complete podcast production services including studio setup, multi-camera recording, professional audio engineering, editing, and post-production. Whether you need a one-time recording or an ongoing podcast series, we provide broadcast-quality production with cinematic visuals — perfect for video podcasts on YouTube and other platforms."
    },
    {
        question: "What is line production and does Dreamline Production provide it?",
        answer: "Line production means managing on-ground logistics for a production — including crew hiring, location scouting, equipment arrangement, permits, transportation, and day-to-day shoot management. Yes, Dreamline Production provides full line production services in Kolkata and across India for ad agencies, news channels, international production crews, and film teams who need reliable local production support."
    },
    {
        question: "Does Dreamline Production do interviews for news channels and agencies?",
        answer: "Yes, we regularly handle professional interview setups for major news channels and media agencies. We have worked with Al Jazeera, ABP Network, TV Today, and other national and international media organizations. We provide broadcast-ready camera crews, lighting, audio, and can deliver footage in any format required — whether it's a live satellite uplink, recorded package, or multi-camera studio setup."
    },
    {
        question: "What drone and aerial video services do you offer?",
        answer: "We offer professional drone videography and aerial shoots for real estate, construction sites, events, weddings, and commercial projects. Our services include cinematic aerial footage, 3D area mapping for construction and architectural projects, drone surveys, and aerial photography. We use licensed commercial drones with 4K+ capability and our pilots hold all required DGCA certifications."
    },
    {
        question: "Does Dreamline Production offer 3D mapping and 2D animation?",
        answer: "Yes, we offer both 3D area mapping and 2D motion graphics animation. Our 3D mapping service is used for real estate visualization, construction site documentation, architectural walkthroughs, and land survey mapping using drone data. Our 2D animation team creates motion graphics, explainer videos, animated logos, title sequences, and promotional animations for brands and businesses."
    },
    {
        question: "How much does wedding photography cost at Dreamline Production?",
        answer: "Both-side wedding photography packages start from ₹40,000 per day. Our packages are fully customizable based on your requirements — including the number of photographers, cinematographers, drone coverage, and post-production needs. We specialize in luxury cinematic wedding documentation with candid moments, storytelling, and premium editing. Contact us for a personalized quote."
    },
    {
        question: "Does Dreamline Production travel outside Kolkata for projects?",
        answer: "Yes, absolutely. While we are based in Kolkata, we work anywhere in India and have handled projects in Mumbai, Delhi, Goa, Rajasthan, Bangalore, Hyderabad, Chennai, and many other locations. For line production clients, we serve as the trusted local production partner in Kolkata and the entire eastern India region. We bring our full equipment and crew regardless of location."
    },
    {
        question: "Which brands and companies has Dreamline Production worked with?",
        answer: "We have worked with major national and international organizations including TATA Trust, L&T, ABP Network, Al Jazeera, TV Today, BookMyShow, Carlsberg, Conneqt, and Chandra Udyog. We also regularly work with advertising agencies, media houses, and international news organizations for production and line production services across eastern India."
    },
    {
        question: "How can I contact Dreamline Production to discuss a project?",
        answer: "You can reach us through multiple channels: Call or WhatsApp at +91 82400 54002, email us at support@dreamlineproduction.com, or fill out the inquiry form on our website at dreamlineproduction.com/contact. Our studio is located at 85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata 700082. We're available 7 days a week, 9 AM to 9 PM."
    },
    {
        question: "What is the best production house in Kolkata?",
        answer: "Dreamline Production is widely regarded as one of Kolkata's leading production houses. With over 15 years in the industry, a 4.9-star Google rating, and a client list that includes TATA Trust, L&T, Al Jazeera, and ABP Network, we deliver broadcast and cinema-quality production across all formats — from corporate films and ad campaigns to weddings, podcasts, and drone mapping. We combine creative storytelling with technical excellence."
    },
    {
        question: "Is Dreamline Production a registered and certified business?",
        answer: "Yes, Dreamline Production is a fully registered business. We are GST registered (GSTIN: 19EILPS2898F1ZE), MSME certified (Registration: WB-18-0018671), and hold a valid KMC Trade License. We also have an Import Export Code (IEC) for international projects. Full business details are available on our Company Details page at dreamlineproduction.com/company-details."
    }
];

export default function FAQPage() {
    // Build FAQPage JSON-LD schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    // BreadcrumbList schema
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dreamlineproduction.com" },
            { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://dreamlineproduction.com/faq" }
        ]
    };

    return (
        <>
            <StructuredData data={faqSchema} />
            <StructuredData data={breadcrumbSchema} />
            <main className="bg-black pt-32 min-h-screen">
                {/* Hero Section */}
                <section className="container mx-auto px-6 mb-16 text-center">
                    <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">
                        Got Questions?
                    </span>
                    <h1 className="font-heading text-5xl sm:text-6xl md:text-8xl font-black mb-8 uppercase text-white leading-[0.95]">
                        Frequently<br />
                        <span className="text-[#c5a059] italic">Asked.</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Everything you need to know about working with Dreamline Production — Kolkata's premier cinematic production house for corporate films, weddings, podcasts, drone, animation, and more.
                    </p>
                </section>

                {/* FAQ Accordion */}
                <section className="container mx-auto px-6 pb-20 max-w-4xl">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} faq={faq} index={index} />
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="border-t border-white/5 py-20">
                    <div className="container mx-auto px-6 text-center">
                        <h2 className="font-heading text-3xl md:text-5xl font-black text-white uppercase mb-6">
                            Still Have <span className="text-[#c5a059]">Questions?</span>
                        </h2>
                        <p className="text-gray-400 max-w-lg mx-auto mb-10 text-lg">
                            We'd love to hear from you. Get in touch and let's discuss your project.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center px-10 py-5 bg-[#c5a059] text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all duration-500"
                            >
                                Discuss Your Project
                            </a>
                            <a
                                href="tel:+918240054002"
                                className="inline-flex items-center justify-center px-10 py-5 border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-all duration-500"
                            >
                                Call +91 82400 54002
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

// FAQ Accordion Item — Uses details/summary for no-JS accessibility
function FAQItem({ faq, index }) {
    return (
        <details className="group border border-white/10 rounded-2xl overflow-hidden hover:border-[#c5a059]/40 transition-all duration-300 bg-[#0a0a0a]">
            <summary className="flex items-center justify-between p-6 md:p-8 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-4 md:gap-6 flex-1 pr-4">
                    <span className="text-[#c5a059] font-heading text-sm font-black shrink-0">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="text-white font-bold text-base md:text-lg leading-snug">
                        {faq.question}
                    </h2>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center shrink-0 group-open:bg-[#c5a059] group-open:border-[#c5a059] transition-all duration-300">
                    <svg
                        className="w-4 h-4 text-white group-open:text-black group-open:rotate-45 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                </div>
            </summary>
            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
                <div className="pl-10 md:pl-12 border-l-2 border-[#c5a059]/30">
                    <p className="text-gray-400 leading-relaxed text-base">
                        {faq.answer}
                    </p>
                </div>
            </div>
        </details>
    );
}
