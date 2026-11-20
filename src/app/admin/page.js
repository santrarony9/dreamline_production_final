export const dynamic = 'force-dynamic';
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";
import Booking from "@/models/Booking";
import Journal from "@/models/Journal";
import Wedding from "@/models/Wedding";
import Content from "@/models/Content";
import CustomPage from "@/models/CustomPage";
import ServicePage from "@/models/ServicePage";
import ServiceCategory from "@/models/ServiceCategory";
import ServiceVideo from "@/models/ServiceVideo";
import MediaAsset from "@/models/MediaAsset";

export default async function AdminDashboard() {
    await dbConnect();

    const [
        totalViewsAgg,
        pendingBookings,
        totalBookings,
        totalJournalPosts,
        totalWeddings,
        totalCustomPages,
        totalServicePages,
        totalCategories,
        totalVideos,
        totalMediaAssets,
        recentAssets,
        recentBookings,
        siteContent
    ] = await Promise.all([
        Analytics.aggregate([{ $group: { _id: null, total: { $sum: "$views" }, google: { $sum: "$googleViews" } } }]),
        Booking.countDocuments({ status: "pending" }),
        Booking.countDocuments(),
        Journal.countDocuments(),
        Wedding.countDocuments(),
        CustomPage.countDocuments(),
        ServicePage.countDocuments(),
        ServiceCategory.countDocuments(),
        ServiceVideo.countDocuments(),
        MediaAsset.countDocuments(),
        MediaAsset.find({}).sort({ createdAt: -1 }).limit(6).lean(),
        Booking.find({}).sort({ createdAt: -1 }).limit(4).lean(),
        Content.findOne().lean()
    ]);

    const commercialCount = (siteContent?.projects || []).length;
    const totalProjects = totalWeddings + commercialCount;
    const totalPagesCount = totalCustomPages + totalServicePages + 5; // +5 for home, about, luxury, commercial, portfolio

    // Primary Database Metrics
    const primaryStats = [
        { label: "Total Website Pages", value: totalPagesCount, icon: "📑", sub: `${totalServicePages} services + ${totalCustomPages} custom` },
        { label: "Live Services", value: totalServicePages, icon: "🗂️", sub: `${totalCategories} categories` },
        { label: "Portfolio Projects", value: totalProjects, icon: "📁", sub: `${totalWeddings} weddings + ${commercialCount} commercial` },
        { label: "Total Videos & Reels", value: totalVideos, icon: "🎬", sub: "16:9 & 9:16 Instagram Reels" },
        { label: "Media Library Assets", value: totalMediaAssets, icon: "🖼️", sub: "Persistent storage files" },
        { label: "Blog Story Archive", value: totalJournalPosts, icon: "📝", sub: "Articles & narratives" },
        { label: "Total Enquiries", value: totalBookings, icon: "✉️", sub: `${pendingBookings} awaiting response` },
        { label: "Total Studio Reach", value: (totalViewsAgg[0]?.total || 0).toLocaleString(), icon: "👁️", sub: `${totalViewsAgg[0]?.google || 0} via Google Search` },
    ];

    return (
        <div className="space-y-12 pb-24">
            {/* HEADER */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c5a059] animate-pulse"></span>
                        <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em]">Central Command</h2>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                        Dashboard <span className="text-gray-500">Overview.</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                        Live database telemetry &amp; full management control over Dreamline Production.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-[10px] text-[#c5a059] font-bold uppercase tracking-widest border border-[#c5a059]/30 bg-[#c5a059]/10 px-4 py-2 rounded-full">
                        MongoDB Live • {new Date().toLocaleDateString('en-GB')}
                    </div>
                    <a
                        href="/"
                        target="_blank"
                        className="text-[10px] text-white font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
                    >
                        View Frontend ↗
                    </a>
                </div>
            </header>

            {/* REAL DATABASE STATS GRID */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                        Real Database Statistics
                    </h3>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        Real-time Mongoose Documents
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {primaryStats.map((stat, i) => (
                        <div key={i} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/40 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{stat.icon}</span>
                                <span className="text-[8px] font-black uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                    Live DB
                                </span>
                            </div>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
                            <p className="text-[9px] text-[#c5a059] font-semibold mt-2">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* QUICK ACTIONS HUB */}
            <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                    Master Management Shortcuts
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    <Link href="/admin/pages" className="group bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[110px]">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📑</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white group-hover:text-[#c5a059]">Page Builder</span>
                    </Link>
                    <Link href="/admin/home" className="group bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[110px]">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🏠</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white group-hover:text-[#c5a059]">Home Page</span>
                    </Link>
                    <Link href="/admin/services" className="group bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[110px]">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗂️</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white group-hover:text-[#c5a059]">Services CMS</span>
                    </Link>
                    <Link href="/admin/video-shots" className="group bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[110px]">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🎬</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white group-hover:text-[#c5a059]">Video &amp; Shots</span>
                    </Link>
                    <Link href="/admin/fashion-videography" className="group bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[110px]">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">👗</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white group-hover:text-[#c5a059]">Fashion Reels</span>
                    </Link>
                    <Link href="/admin/media-library" className="group bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[110px]">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🖼️</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white group-hover:text-[#c5a059]">Media Library</span>
                    </Link>
                    <Link href="/admin/portfolio" className="group bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[110px]">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📁</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white group-hover:text-[#c5a059]">Portfolio Hub</span>
                    </Link>
                    <Link href="/admin/bookings" className="group relative bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[110px]">
                        {pendingBookings > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
                        )}
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">✉️</span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-white group-hover:text-[#c5a059]">Inquiries</span>
                    </Link>
                </div>
            </section>

            {/* LOWER GRID: RECENT UPLOADS & RECENT INQUIRIES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RECENT MEDIA ASSETS */}
                <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                                Recent Media Uploads
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Latest persistent storage files</p>
                        </div>
                        <Link href="/admin/media-library" className="text-[10px] font-black uppercase text-[#c5a059] hover:underline">
                            Open Media Library ↗
                        </Link>
                    </div>

                    {recentAssets.length === 0 ? (
                        <p className="text-xs text-gray-500 italic py-6 text-center">No recent uploads registered.</p>
                    ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {recentAssets.map((asset, aIdx) => (
                                <div key={aIdx} className="group relative aspect-square bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[#c5a059] transition-all">
                                    <img
                                        src={asset.url}
                                        alt={asset.title || "Media preview"}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RECENT INQUIRIES */}
                <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">
                                Recent Client Inquiries
                            </h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase">{pendingBookings} inquiries pending action</p>
                        </div>
                        <Link href="/admin/bookings" className="text-[10px] font-black uppercase text-[#c5a059] hover:underline">
                            View All Inquiries ↗
                        </Link>
                    </div>

                    {recentBookings.length === 0 ? (
                        <p className="text-xs text-gray-500 italic py-6 text-center">No inquiry records found.</p>
                    ) : (
                        <div className="space-y-2">
                            {recentBookings.map((b, bIdx) => (
                                <div key={bIdx} className="bg-white/5 p-3 rounded-2xl flex items-center justify-between text-xs">
                                    <div>
                                        <p className="font-bold text-white uppercase">{b.firstName} {b.lastName}</p>
                                        <p className="text-[10px] text-gray-400">{b.serviceType || "Studio Inquire"} • {b.phone || b.email}</p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                                        b.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                                        b.status === 'contacted' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-amber-500/20 text-amber-400'
                                    }`}>
                                        {b.status || 'pending'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
