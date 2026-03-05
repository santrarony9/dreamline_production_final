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

    const navItems = [
        { label: "Overview", path: "/admin", icon: "📊" },
        { label: "Global", path: "/admin/global", icon: "🌐" },
        { label: "Home", path: "/admin/home", icon: "🏠" },
        { label: "About", path: "/admin/about", icon: "🏢" },
        { label: "Luxury", path: "/admin/luxury", icon: "✨" },
        { label: "Commercial", path: "/admin/commercial", icon: "🏢" },
        { label: "Projects", path: "/admin/gallery", icon: "🎬" },
        { label: "Weddings", path: "/admin/weddings", icon: "💍" },
        { label: "Journal", path: "/admin/journal", icon: "📝" },
        { label: "Bookings", path: "/admin/bookings", icon: "📅" },
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
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                            <span className="text-[#c5a059] font-black text-xs">D</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-tighter uppercase">Dreamline</h1>
                            <p className="text-[8px] text-gray-500 uppercase tracking-widest font-bold">Admin Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto mt-16 lg:mt-0">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${pathname === item.path
                                ? "bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/20"
                                : "text-gray-500 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left flex items-center gap-3 text-[10px] text-red-500/70 hover:text-red-500 font-bold uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all font-sans"
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 transition-all duration-300 lg:ml-64 p-6 md:p-12 mt-16 lg:mt-0 w-full max-w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
