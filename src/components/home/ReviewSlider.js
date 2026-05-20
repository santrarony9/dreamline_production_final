export default function ReviewSlider({ 
    reviews, 
    averageRating = "4.9", 
    totalReviewsText = "AVERAGE RATING ON GOOGLE",
    sectionTitle = "Reviews.",
    sectionSubtitle = "TESTIMONIALS"
}) {
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
                            {sectionSubtitle}
                        </p>
                        <h2 className="font-heading text-5xl font-black text-white italic">
                            {sectionTitle}
                        </h2>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t border-white/10 md:border-none">
                        <div className="text-[#c5a059] font-heading text-4xl font-black mb-2">{averageRating}/5</div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                            {totalReviewsText}
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden">
                    <div className="flex gap-8 animate-brand-glide">
                        {loopReviews.map((review, index) => (
                            <div
                                key={`review-${index}`}
                                className="w-[290px] md:w-[340px] flex-shrink-0 p-6 md:p-8 bg-[#151515] border border-white/5 rounded-2xl relative interactive group flex flex-col justify-between min-h-[280px]"
                            >
                                <div className="text-[#c5a059] text-5xl font-serif absolute top-6 right-8 opacity-10 group-hover:opacity-100 transition-opacity">
                                    &quot;
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex gap-1">
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
                                        {review.source === "Google" && (
                                            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                                                <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                                </svg>
                                                <span className="text-[7px] font-black uppercase tracking-widest text-white/50">Google</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs md:text-sm text-white/70 leading-relaxed italic line-clamp-4">
                                        &quot;{review.text}&quot;
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                                    {review.avatar ? (
                                        <img 
                                            src={review.avatar} 
                                            alt={review.author} 
                                            referrerPolicy="no-referrer"
                                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-[#c5a059] rounded-full flex items-center justify-center text-black font-black text-xs">
                                            {review.initial}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-black text-[10px] md:text-xs uppercase tracking-widest text-white">
                                            {review.author}
                                        </h4>
                                        <p className="text-[8px] md:text-[9px] uppercase font-bold text-white/20 tracking-widest">
                                            {review.role || "Verified Google Reviewer"}
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
