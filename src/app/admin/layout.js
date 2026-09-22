"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Auto-close sidebar on route change for mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const navSections = [
        {
            title: "Studio",
            items: [
                { label: "Dashboard", path: "/admin", icon: "📊" },
                { label: "Inquiries", path: "/admin/bookings", icon: "✉️" },
                { label: "Services & Categories", path: "/admin/services", icon: "🗂️" },
            ]
        },
        {
            title: "Content & Portfolios",
            items: [
                { label: "Blog / Journal", path: "/admin/journal", icon: "📓" },
                { label: "Weddings", path: "/admin/weddings", icon: "💍" },
                { label: "Commercial", path: "/admin/commercial", icon: "🎥" },
                { label: "Tech / Web", path: "/admin/tech", icon: "💻" },
                { label: "Luxury", path: "/admin/luxury", icon: "✨" },
                { label: "Galleries", path: "/admin/gallery", icon: "🎬" },
            ]
        },
        {
            title: "Website Setup",
            items: [
                { label: "Home Page", path: "/admin/home", icon: "🏠" },
                { label: "About Page", path: "/admin/about", icon: "🏢" },
                { label: "Google Business", path: "/admin/google-business", icon: "🌐" },
            ]
        }
    ];

    const bottomNavItems = [
        { label: "SEO Settings", path: "/admin/seo", icon: "🔍" },
        { label: "Users & Settings", path: "/admin/users", icon: "⚙️" },
        { label: "Global Info", path: "/admin/global", icon: "🌍" },
        { label: "Diagnostics", path: "/admin/diagnostics", icon: "🩺" },
    ];

    if (pathname === "/admin/login") return <>{children}</>;

    return (
        <div className="flex min-h-screen bg-[#050505] text-white overflow-x-hidden">
            {/* Mobile Top Bar */}
            <header className="lg:hidden fixed top-0 left-0 w-full h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6 z-[60]">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                        <span className="text-[#c5a059] font-black text-[8px]">D</span>
                    </div>
                    <h1 className="text-xs font-black uppercase tracking-tighter">Dreamline</h1>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-white/5 rounded-lg border border-white/10"
                >
                    <span className="block w-4 h-0.5 bg-white mb-1"></span>
                    <span className="block w-4 h-0.5 bg-white mb-1"></span>
                    <span className="block w-4 h-0.5 bg-white"></span>
                </button>
            </header>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col fixed h-full z-[55] transition-transform duration-300
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="p-8 border-b border-white/5 hidden lg:block">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                            <span className="text-[#c5a059] font-black text-xs">D</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-tighter uppercase">Dreamline</h1>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Admin Portal</p>
                        </div>
                    </div>
                    <a 
                        href="/" 
                        target="_blank" 
                        className="flex items-center justify-center gap-2 w-full py-2 border border-[#c5a059]/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#c5a059] hover:bg-[#c5a059] hover:text-black transition-all"
                    >
                        <span>👁️</span> View Website
                    </a>
                </div>

                <nav className="flex-1 p-6 space-y-8 overflow-y-auto mt-16 lg:mt-0 custom-scrollbar">
                    {navSections.map((section) => (
                        <div key={section.title} className="space-y-3">
                            <h3 className="px-4 text-[8px] font-black uppercase tracking-[0.3em] text-gray-500">
                                {section.title}
                            </h3>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`flex items-center gap-4 px-4 py-2.5 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all ${pathname === item.path
                                            ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                            : "text-gray-500 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        <span className="text-base">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="mt-8 border-t border-white/5 pt-6 space-y-1">
                        <div className="px-4 mb-2">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">Settings & Admin</h3>
                        </div>
                        {bottomNavItems.map((item, i) => (
                            <Link
                                key={i}
                                href={item.path}
                                className={`
                                    flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-bold transition-all
                                    ${pathname === item.path 
                                        ? "bg-white/10 text-white" 
                                        : "text-gray-400 hover:text-white hover:bg-white/5"}
                                `}
                            >
                                <span className="text-sm">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="p-6 border-t border-white/5 hidden lg:block bg-black/20">
                    <button
                        onClick={() => signOut({ callbackUrl: "/admin/login" })}
                        className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                        <span>🚪</span> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 transition-all duration-300 lg:ml-64 p-6 md:p-12 mt-16 lg:mt-0 w-full lg:w-[calc(100%-16rem)] overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}


