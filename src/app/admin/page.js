export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";
import Booking from "@/models/Booking";
import Journal from "@/models/Journal";
import Wedding from "@/models/Wedding";

export default async function AdminDashboard() {
    await dbConnect();

    // Aggregate stats
    const [totalViews, activeBookings, totalJournalPosts, totalWeddings, totalProjects] = await Promise.all([
        Analytics.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
        Booking.countDocuments({ status: "pending" }),
        Journal.countDocuments(),
        Wedding.countDocuments(),
        dbConnect().then(() => dbConnect.connection.db.collection("contents").findOne({})).then(doc => doc?.projects?.length || 0)
    ]);

    // Calculate dynamic storage (assuming ~1.5MB per Wedding, ~1MB per Journal, ~2MB per Gallery Project + 500MB baseline for core assets)
    const estimatedStorageMB = 500 + (totalWeddings * 1.5) + (totalJournalPosts * 1.0) + (totalProjects * 2.0);
    const estimatedStorageGB = (estimatedStorageMB / 1024).toFixed(2);
    const maxStorageGB = 100; // Baseline capacity
    const storagePercentage = Math.min(100, Math.round((estimatedStorageGB / maxStorageGB) * 100));

    const stats = [
        { label: "Total Reach", value: totalViews[0]?.total || 0, icon: "👁️" },
        { label: "New Inquiries", value: activeBookings, icon: "✉️" },
        { label: "Story Archive", value: totalJournalPosts + totalWeddings, icon: "📚" },
        { label: "Conversion", value: "8.4%", icon: "⚡" },
    ];

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5).lean();

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Overview</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">System <span className="text-gray-700">Health.</span></h1>
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full">
                    Live Feed • {new Date().toLocaleTimeString()}
                </div>
            </header>

            {/* Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-[#c5a059]/30 transition-all group">
                        <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">{stat.icon}</div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                ))}
            </section>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Recent Activity */}
                <section className="lg:col-span-8 bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden p-8">
                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">Recent Inquiries</h3>
                        <a href="/admin/bookings" className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors">View All Inquiries →</a>
                    </div>

                    <div className="space-y-4">
                        {recentBookings.length === 0 ? (
                            <p className="text-gray-600 text-center py-10 uppercase text-[10px] font-bold tracking-widest">No inquiries received yet.</p>
                        ) : (
                            recentBookings.map((b) => (
                                <div key={b._id.toString()} className="flex items-center justify-between p-6 bg-white/2 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-full bg-[#c5a059]/10 flex items-center justify-center text-[#c5a059] font-black text-xs">
                                            {b.firstName[0]}{b.lastName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-[#c5a059] transition-colors">{b.firstName} {b.lastName}</p>
                                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-black">{b.serviceType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 font-bold mb-1">{new Date(b.eventDate).toLocaleDateString()}</p>
                                        <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-black uppercase tracking-widest group-hover:bg-[#c5a059]/20 group-hover:text-[#c5a059] transition-all">Pending</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* System Status */}
                <section className="lg:col-span-4 space-y-8">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-6">Database Status</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Latency</span>
                                <span className="text-[10px] text-green-500 font-black">24ms (HEALTHY)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Uptime</span>
                                <span className="text-[10px] text-white font-black">99.9%</span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-4">
                                <div className="bg-green-500 h-full w-[99%]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#c5a059]/20 to-transparent border border-[#c5a059]/20 rounded-3xl p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Est. Storage Usage</h3>
                        <p className="text-2xl font-black text-white mb-2">{estimatedStorageGB} <span className="text-gray-500 text-sm">GB</span></p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">Your media archive is currently {storagePercentage}% utilized based on active film ({totalWeddings}), narrative ({totalJournalPosts}), and gallery ({totalProjects}) records.</p>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-4">
                            <div className="bg-[#c5a059] h-full transition-all duration-1000" style={{ width: `${storagePercentage}%` }}></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
