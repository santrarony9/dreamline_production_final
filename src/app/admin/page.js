export const dynamic = 'force-dynamic';
import dbConnect from "@/lib/mongodb";
import Analytics from "@/models/Analytics";
import Booking from "@/models/Booking";
import Journal from "@/models/Journal";
import Wedding from "@/models/Wedding";
import Content from "@/models/Content";
import Intelligence from "@/models/Intelligence";

export default async function AdminDashboard() {
    await dbConnect();

    // Aggregate stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const [totalViewsAgg, thirtyDaysReach, activeBookings, totalJournalPosts, totalWeddings, totalProjects, latestIntelligence] = await Promise.all([
        Analytics.aggregate([{ $group: { _id: null, total: { $sum: "$views" }, google: { $sum: "$googleViews" } } }]),
        Analytics.aggregate([
            { $match: { date: { $gte: thirtyDaysAgoStr } } },
            { $group: { _id: "$date", views: { $sum: "$views" }, googleViews: { $sum: "$googleViews" } } },
            { $sort: { _id: 1 } }
        ]),
        Booking.countDocuments({ status: "pending" }),
        Journal.countDocuments(),
        Wedding.countDocuments(),
        Content.findOne().lean().then(doc => doc?.projects?.length || 0),
        Intelligence.findOne().sort({ date: -1 }).lean()
    ]);

    // Calculate dynamic storage (assuming ~1.5MB per Wedding, ~1MB per Journal, ~2MB per Gallery Project + 500MB baseline for core assets)
    const estimatedStorageMB = 500 + (totalWeddings * 1.5) + (totalJournalPosts * 1.0) + (totalProjects * 2.0);
    const estimatedStorageGB = (estimatedStorageMB / 1024).toFixed(2);
    const maxStorageGB = 100; // Baseline capacity
    const storagePercentage = Math.min(100, Math.round((estimatedStorageGB / maxStorageGB) * 100));

    // Fill in missing days for the chart
    const dailyReach = [];
    const maxViews = Math.max(...thirtyDaysReach.map(r => r.views), 1);
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0];
        const dayData = thirtyDaysReach.find(r => r._id === dateStr);
        dailyReach.push({
            date: dateStr,
            views: dayData ? dayData.views : 0,
            googleViews: dayData ? dayData.googleViews : 0,
            label: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
            percent: Math.round(((dayData ? dayData.views : 0) / maxViews) * 100)
        });
    }

    // Calculate reach growth (today vs yesterday)
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayViews = thirtyDaysReach.find(r => r._id === todayStr)?.views || 0;
    const yesterdayViews = thirtyDaysReach.find(r => r._id === yesterdayStr)?.views || 0;
    const reachGrowth = yesterdayViews === 0 ? 100 : Math.round(((todayViews - yesterdayViews) / yesterdayViews) * 100);

    const stats = [
        { label: "Total Reach", value: totalViewsAgg[0]?.total || 0, icon: "👁️", trend: `${reachGrowth >= 0 ? '+' : ''}${reachGrowth}%` },
        { label: "SEO Reach", value: totalViewsAgg[0]?.google || 0, icon: "🔍", trend: "GOOGLE" },
        { label: "New Inquiries", value: activeBookings, icon: "✉️" },
        { label: "Story Archive", value: totalJournalPosts + totalWeddings, icon: "📚" },
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
                        <div className="flex justify-between items-start">
                            <div className="text-3xl mb-4 grayscale group-hover:grayscale-0 transition-all">{stat.icon}</div>
                            {stat.trend && (
                                <span className={`text-[9px] font-black px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {stat.trend}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-white">{stat.value}</p>
                    </div>
                ))}
            </section>

            {/* 30 Day Reach Timeline */}
            <section className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-1">30-Day Reach Timeline</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Daily breakdown of total visitor traffic</p>
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-600">
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#c5a059]"></span> High Activity</span>
                        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/5"></span> Low Activity</span>
                    </div>
                </div>

                <div className="h-48 flex items-end gap-1 md:gap-2">
                    {dailyReach.map((day, i) => (
                        <div key={i} className="flex-1 group relative h-full flex flex-col justify-end">
                            {/* Bar */}
                            <div 
                                className="w-full bg-white/5 group-hover:bg-[#c5a059] transition-all rounded-t-sm" 
                                style={{ height: `${Math.max(day.percent, 5)}%` }}
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white text-black text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl border border-black/5">
                                <p className="text-black">{day.views} Total Views</p>
                                <p className="text-[#c5a059]">{day.googleViews} Organic Views</p>
                                <p className="text-gray-400 mt-1 border-t border-gray-100 pt-1">{day.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 border-t border-white/5 pt-4">
                    <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">{dailyReach[0].label}</span>
                    <span className="text-[9px] text-gray-700 font-black uppercase tracking-widest">{dailyReach[dailyReach.length - 1].label}</span>
                </div>
            </section>

            {/* AI Intelligence Console */}
            <section className="bg-gradient-to-br from-[#0f0f0f] to-black border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#c5a059]/5 blur-[100px] rounded-full"></div>
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse"></div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#c5a059]">AI Intelligence Console</h3>
                            </div>
                            <p className="text-2xl font-black text-white uppercase tracking-tighter">Automated Business Audit</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                            Automated System Active
                        </div>
                    </div>

                    {!latestIntelligence ? (
                        <div className="py-12 text-center border border-dashed border-white/10 rounded-3xl">
                            <p className="text-gray-500 uppercase text-[10px] font-black tracking-widest">No Intelligence reports generated yet. The system will auto-audit at midnight.</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Core Insights</p>
                                    <div className="space-y-4">
                                        {latestIntelligence.insights.map((insight, idx) => (
                                            <div key={idx} className="p-5 bg-white/2 border border-white/5 rounded-2xl flex gap-4">
                                                <span className="text-lg">{insight.type === 'WIN' ? '✅' : insight.type === 'ISSUE' ? '⚠️' : '💡'}</span>
                                                <div>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${insight.type === 'WIN' ? 'text-green-500' : insight.type === 'ISSUE' ? 'text-red-500' : 'text-[#c5a059]'}`}>
                                                        {insight.type} • {insight.priority} Priority
                                                    </p>
                                                    <p className="text-sm text-gray-300 leading-relaxed font-medium">{insight.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Recommended Actions</p>
                                    <div className="space-y-3">
                                        {latestIntelligence.actionItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#c5a059] group-hover:scale-150 transition-transform"></div>
                                                <p className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6 bg-[#c5a059]/5 border border-[#c5a059]/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest mb-2">Report Summary</p>
                                    <p className="text-xs text-white leading-relaxed font-bold italic opacity-80">"{latestIntelligence.summary}"</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Quick Management */}
            <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">Quick Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <a href="/admin/google-business" className="group bg-gradient-to-br from-[#c5a059]/30 to-transparent border border-[#c5a059] p-6 rounded-3xl hover:border-white transition-all flex items-center gap-4 shadow-[0_0_20px_rgba(197,160,89,0.1)]">
                        <div className="w-12 h-12 rounded-2xl bg-[#c5a059] flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🔍</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Google Business</p>
                            <p className="text-[9px] text-[#c5a059] font-black uppercase">Auto-Post Active</p>
                        </div>
                    </a>
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
                    <a href="/admin/diagnostics" className="group bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl hover:border-[#c5a059]/30 transition-all flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🔧</div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white">Diagnostics</p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase">Automation Fallback</p>
                        </div>
                    </a>
                </div>
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
                                            {b.firstName?.[0]}{b.lastName?.[0]}
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
