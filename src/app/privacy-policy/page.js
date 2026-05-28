import Link from "next/link";

export default function PrivacyPolicy() {
    return (
        <main className="pt-40 pb-20 bg-black min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Privacy <span className="text-gray-700">Policy.</span></h1>
                    <p className="text-[#c5a059] text-xs font-black uppercase tracking-[0.4em]">Last Updated: May 2024</p>
                </header>

                <div className="space-y-12 text-gray-400 text-sm leading-relaxed font-medium">
                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">1. Information Collection</h2>
                        <p>We collect information you provide directly to us when you inquire about our cinematic services, book a production, or communicate with us. This may include your name, email address, phone number, event details, and any other information you choose to provide.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">2. Use of Information</h2>
                        <p>We use the information we collect to provide, maintain, and improve our services, including to process your bookings, send you production updates, and respond to your comments or questions.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">3. Data Security</h2>
                        <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction. We use industry-standard encryption for sensitive data.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">4. Third-Party Services</h2>
                        <p>We may use third-party analytics (like Google Analytics) to help us understand how our site is used. These services may collect information sent by your browser as part of a web page request, such as cookies or your IP address.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">5. Contact Us</h2>
                        <p>If you have any questions about this Privacy Policy, please contact us at support@dreamlineproduction.com.</p>
                    </section>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] hover:text-white transition-colors">← Return Home</Link>
                </div>
            </div>
        </main>
    );
}
