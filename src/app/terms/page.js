import Link from "next/link";

export default function TermsOfService() {
    return (
        <main className="pt-40 pb-20 bg-black min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Terms of <span className="text-gray-700">Service.</span></h1>
                    <p className="text-[#c5a059] text-xs font-black uppercase tracking-[0.4em]">Effective Date: May 2024</p>
                </header>

                <div className="space-y-12 text-gray-400 text-sm leading-relaxed font-medium">
                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">1. Production Agreement</h2>
                        <p>By booking a service with Dreamline Production, you agree to our creative workflow and production timelines. All production details will be finalized in a separate written contract signed by both parties.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">2. Intellectual Property</h2>
                        <p>Unless otherwise agreed in writing, Dreamline Production retains the copyright to all raw footage and edited cinematic works. Clients are granted a personal use license for wedding films and a commercial use license for corporate works as specified in their contract.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">3. Payment Terms</h2>
                        <p>A non-refundable booking amount is required to secure your production date. Final payment is due upon delivery of the project or as per the specific installment plan agreed upon.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">4. Liability</h2>
                        <p>While we use professional-grade equipment and redundant backup systems, Dreamline Production is not liable for data loss due to unforeseen technical failures beyond our control.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">5. Governing Law</h2>
                        <p>These terms are governed by the laws of West Bengal, India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Kolkata.</p>
                    </section>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] hover:text-white transition-colors">← Return Home</Link>
                </div>
            </div>
        </main>
    );
}
