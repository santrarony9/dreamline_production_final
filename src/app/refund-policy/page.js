import Link from "next/link";

export default function RefundPolicy() {
    return (
        <main className="pt-40 pb-20 bg-black min-h-screen">
            <div className="container mx-auto px-6 max-w-4xl">
                <header className="mb-16">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Refund <span className="text-gray-700">Policy.</span></h1>
                    <p className="text-[#c5a059] text-xs font-black uppercase tracking-[0.4em]">Last Updated: May 2024</p>
                </header>

                <div className="space-y-12 text-gray-400 text-sm leading-relaxed font-medium">
                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">1. Booking Amount</h2>
                        <p>To reserve a production date, a booking amount (retainer) is required. This amount is non-refundable as it covers the administrative costs and the opportunity cost of turning away other clients for that specific date.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">2. Cancellation by Client</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Cancellations made more than 60 days before the event: Only the booking amount is retained.</li>
                            <li>Cancellations made less than 30 days before the event: 50% of the total contract value is due.</li>
                            <li>Cancellations made within 7 days of the event: 100% of the total contract value is due.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">3. Rescheduling</h2>
                        <p>We allow one date rescheduling without penalty if requested at least 45 days in advance, subject to our availability. New dates may be subject to updated pricing.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">4. Quality Guarantee</h2>
                        <p>If you are unsatisfied with the initial edit, we provide up to two rounds of revisions at no additional cost. Refund requests for artistic differences after delivery are not entertained.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-white text-lg font-bold uppercase tracking-widest">5. Force Majeure</h2>
                        <p>In the event of a government-mandated lockdown or natural disaster preventing the event, the booking amount can be converted into a credit for future use within 12 months.</p>
                    </section>
                </div>

                <div className="mt-20 pt-10 border-t border-white/5">
                    <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-[#c5a059] hover:text-white transition-colors">← Return Home</Link>
                </div>
            </div>
        </main>
    );
}
