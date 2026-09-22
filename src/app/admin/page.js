export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";
import Booking from "@/models/Booking";
import Journal from "@/models/Journal";
import Wedding from "@/models/Wedding";
import Content from "@/models/Content";

export default async function AdminDashboard() {
    await dbConnect();

    const [totalViewsAgg, activeBookings, totalJournalPosts, totalWeddings] = await Promise.all([
        Analytics.aggregate([{ $group: { _id: null, total: { $sum: "$views" }, google: { $sum: "$googleViews" } } }]),
        Booking.countDocuments({ status: "pending" }),
        Journal.countDocuments(),
        Wedding.countDocuments()
    ]);

    const stats = [
        { label: "Total Reach", value: totalViewsAgg[0]?.total || 0, icon: "👁️" },
        { label: "SEO Reach", value: totalViewsAgg[0]?.google || 0, icon: "🔍" },
        { label: "New Inquiries", value: activeBookings, icon: "✉️" },
        { label: "Story Archive", value: totalJournalPosts + totalWeddings, icon: "📚" },
    ];

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Studio Overview</h2>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">Welcome back, <span className="text-gray-500">Rony.</span></h1>
                </div>
                <div className="text-[10px] text-[#c5a059] font-bold uppercase tracking-widest border border-[#c5a059]/30 bg-[#c5a059]/10 px-4 py-2 rounded-full">
                    System Live • {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* QUICK ACTIONS HUB */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="/admin/weddings" className="group bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[140px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c5a059]/10">
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📸</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#c5a059] transition-colors">Upload Wedding</span>
                </a>
                <a href="/admin/journal" className="group bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[140px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c5a059]/10">
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📝</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#c5a059] transition-colors">Write Blog</span>
                </a>
                <a href="/admin/bookings" className="group relative bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[140px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c5a059]/10">
                    {activeBookings > 0 && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                    )}
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">✉️</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#c5a059] transition-colors">View Inquiries</span>
                </a>
                <a href="/admin/home" className="group bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/50 transition-all text-center flex flex-col items-center justify-center min-h-[140px] hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#c5a059]/10">
                    <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">⚙️</span>
                    <span className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#c5a059] transition-colors">Edit Homepage</span>
                </a>
            </section>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-[#c5a059]/30 transition-all group">
                        <div className="flex justify-between items-start">
                            <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">{stat.icon}</div>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                ))}
            </section>

            {/* Quick Management */}
            <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">Quick Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <a href="/admin/home?tab=BANNER" className="group bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/30 transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🎬</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Update Banner</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase">Front office visuals</p>
                        </div>
                    </a>
                    <a href="/admin/services" className="group bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/30 transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🗂️</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Service Pages</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase">Manage dynamic content</p>
                        </div>
                    </a>
                    <a href="/admin/journal" className="group bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/30 transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📝</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Story Archive</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase">Journal & Narratives</p>
                        </div>
                    </a>
                    <a href="/admin/global" className="group bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/30 transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🌐</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Global Settings</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase">SEO & Social links</p>
                        </div>
                    </a>
                </div>
            </section>

            </div>
        </div>
    );
}
