export default function ReviewSlider({ reviews }) {
    const defaultReviews = [
        {
            author: "Priyanka Sen",
            role: "Client",
            text: "Working with Dreamline was the best decision for our brand identity. Their cinematic vision is unparalleled.",
            rating: 5,
            initial: "P"
        },
        {
            author: "Arjun Mehta",
            role: "Groom",
            text: "They don't just record events; they craft memories. The team made our wedding look like a Bollywood dream.",
            rating: 5,
            initial: "A"
        },
        {
            author: "Sneha Roy",
            role: "Commercial Director",
            text: "The high-end color grading and emotional storytelling they bring is exactly what we needed.",
            rating: 5,
            initial: "S"
        }
    ];

    const displayReviews = reviews && reviews.length > 0 ? reviews : defaultReviews;
    const loopReviews = [...displayReviews, ...displayReviews];

    return (
        <section className="py-16 md:py-32 bg-[#050505] border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-20 gap-8">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">
                            TESTIMONIALS
                        </p>
                        <h2 className="font-heading text-5xl font-black text-white italic">
                            Reviews.
                        </h2>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t border-white/10 md:border-none">
                        <div className="text-[#c5a059] font-heading text-4xl font-black mb-2">4.9/5</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                            AVERAGE RATING ON GOOGLE
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div className="flex gap-8 animate-brand-glide">
                        {loopReviews.map((review, index) => (
                            <div
                                key={index}
                                className="w-[85vw] md:w-[450px] flex-shrink-0 p-8 md:p-12 bg-[#151515] border border-white/5 rounded-3xl relative interactive group"
                            >
                                <div className="text-[#c5a059] text-6xl font-serif absolute top-8 right-12 opacity-10 group-hover:opacity-100 transition-opacity">
                                    &quot;
                                </div>
                                <div className="flex gap-1 mb-8">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`w-3 h-3 ${i < review.rating ? "fill-[#c5a059]" : "fill-white/10"}`}
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-xl text-white/80 leading-relaxed mb-10 italic">
                                    &quot;{review.text}&quot;
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#c5a059] rounded-full flex items-center justify-center text-black font-black text-sm">
                                        {review.initial}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-xs uppercase tracking-widest text-white">
                                            {review.author}
                                        </h4>
                                        <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">
                                            {review.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
