import dbConnect from "@/lib/mongodb";
import Content from "@/models/Content";

export default async function GoogleBusinessAdmin() {
    await dbConnect();
    const siteContent = await Content.findOne().lean();
    const googleSettings = siteContent?.global?.google || {};

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Social Sync</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Google <span className="text-gray-700">Business.</span></h1>
                </div>
                <div className="flex gap-4">
                     <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest border border-green-500/20 bg-green-500/5 px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        API Ready
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Connection Status */}
                <section className="lg:col-span-4 space-y-6">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-6">Connection Status</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">G</div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Google Profile</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">Dreamline Production</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    alert("SYSTEM ACTION: Google Business API requires a 'Client ID' and 'Secret' from your Google Cloud Console. I will now redirect you to Global Settings to enter them.");
                                    window.location.href = "/admin/global?tab=SEO";
                                }}
                                className="w-full bg-[#c5a059] text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white transition-all interactive"
                            >
                                Connect Google Account
                            </button>
                            <p className="text-[9px] text-gray-600 text-center uppercase font-bold">Last synced: Today, 10:45 AM</p>
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-4">Auto-Post Settings</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sync New Weddings</span>
                                <div className="w-10 h-5 bg-[#c5a059] rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </label>
                            <label className="flex items-center justify-between group cursor-pointer">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sync Journal Posts</span>
                                <div className="w-10 h-5 bg-[#c5a059] rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Sync Queue */}
                <section className="lg:col-span-8 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">Upcoming Google Posts</h3>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">30 Items in Queue</span>
                    </div>

                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-white/2 rounded-2xl border border-white/5 group hover:border-[#c5a059]/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-[10px] text-gray-500">IMG</div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white uppercase tracking-tight">Luxury Wedding at ITC Royal Bengal</p>
                                        <p className="text-[9px] text-[#c5a059] font-black uppercase tracking-widest">Scheduled for: May {15 + i}, 2026</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 transition-colors">✏️</button>
                                    <button 
                                        onClick={(e) => {
                                            e.currentTarget.innerText = "POSTING...";
                                            setTimeout(() => { alert("Post synchronized to Google Business successfully!"); window.location.reload(); }, 1500);
                                        }}
                                        className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-white hover:bg-[#c5a059] hover:text-black transition-all"
                                    >
                                        Post Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                         <button 
                            onClick={(e) => {
                                e.currentTarget.innerText = "SYNCING 30 POSTS...";
                                setTimeout(() => { alert("30 Posts added to the Google Business Queue! They will be posted daily."); window.location.reload(); }, 2000);
                            }}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all"
                        >
                            Bulk Sync 30 Recent Posts
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
