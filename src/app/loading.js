export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-white/10 border-t-[#c5a059] rounded-full animate-spin mb-6"></div>
                <div className="overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 animate-pulse">
                        Dreamline Production
                    </p>
                </div>
            </div>
        </div>
    );
}
