"use client";

import { useState } from "react";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        eventDate: "",
        serviceType: "Luxury Wedding",
        vision: ""
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: "", message: "" });

        try {
            const response = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus({ type: "success", message: "Thank you! Your inquiry has been sent successfully. We will reach out on WhatsApp shortly." });
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    eventDate: "",
                    serviceType: "Luxury Wedding",
                    vision: ""
                });
            } else {
                const err = await response.json();
                setStatus({ type: "error", message: "Error: " + (err.error || "Failed to send inquiry") });
            }
        } catch (err) {
            setStatus({ type: "error", message: "Network error. Please try again later." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="pt-32 min-h-screen bg-black">
            <section className="container mx-auto px-6 mb-20">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Booking Form */}
                    <div>
                        <span className="text-[#c5a059] font-bold text-xs uppercase tracking-[0.4em] mb-6 block">Begin the Journey</span>
                        <h1 className="font-heading text-5xl md:text-7xl font-black mb-12 leading-none uppercase text-white">
                            Book Your<br /><span className="text-[#c5a059]">Experience.</span>
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        className="placeholder-white/20 bg-transparent border-b border-white/20 text-white w-full py-4 outline-none focus:border-[#c5a059] transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        className="placeholder-white/20 bg-transparent border-b border-white/20 text-white w-full py-4 outline-none focus:border-[#c5a059] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className="placeholder-white/20 bg-transparent border-b border-white/20 text-white w-full py-4 outline-none focus:border-[#c5a059] transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2">Mobile Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="8240054002"
                                        className="placeholder-white/20 bg-transparent border-b border-white/20 text-white w-full py-4 outline-none focus:border-[#c5a059] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2">Event Date</label>
                                    <input
                                        type="date"
                                        name="eventDate"
                                        value={formData.eventDate}
                                        onChange={handleChange}
                                        className="bg-transparent border-b border-white/20 text-white w-full py-4 outline-none focus:border-[#c5a059] transition-colors [color-scheme:dark]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2">Service Type</label>
                                    <select
                                        name="serviceType"
                                        value={formData.serviceType}
                                        onChange={handleChange}
                                        className="bg-black border-b border-white/20 text-white w-full py-4 outline-none focus:border-[#c5a059] transition-colors"
                                    >
                                        <option>Luxury Wedding</option>
                                        <option>Commercial Ad</option>
                                        <option>Music Video</option>
                                        <option>Corporate Event</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2">Tell us about your vision</label>
                                <textarea
                                    name="vision"
                                    value={formData.vision}
                                    onChange={handleChange}
                                    rows="4"
                                    placeholder="Describe your cinematic dream..."
                                    className="placeholder-white/20 bg-transparent border-b border-white/20 text-white w-full py-4 outline-none focus:border-[#c5a059] transition-colors"
                                ></textarea>
                            </div>

                            {status.message && (
                                <div className={`p-4 rounded-xl text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {status.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#c5a059] text-black px-10 py-4 rounded-full font-heading font-black uppercase tracking-widest hover:bg-white transition-colors duration-300 w-full md:w-auto disabled:opacity-50 interactive"
                            >
                                {loading ? "SENDING..." : "Submit Inquiry"}
                            </button>
                        </form>
                    </div>

                    {/* Map & Info */}
                    <div className="space-y-12">
                        <div className="w-full h-[400px] rounded-[2rem] overflow-hidden border border-white/10 relative">
                            <div className="absolute inset-0 bg-[#c5a059] mix-blend-overlay opacity-10 pointer-events-none z-10"></div>
                            <iframe
                                src="https://maps.google.com/maps?q=85%20Tilottama%20Plaza%20Kolkata%20700082&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0, filter: 'grayscale(100%) invert(100%) contrast(80%)' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <a href="https://www.google.com/maps/dir/?api=1&destination=85+Tilottama+Plaza+Kolkata+700082" target="_blank" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all duration-300 py-4 rounded-xl group interactive">
                                <svg className="w-5 h-5 text-[#c5a059] group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Distance From Here</span>
                            </a>
                            <a href="https://m.uber.com/ul/?action=setPickup&client_id=&pickup=my_location&dropoff[formatted_address]=Dreamline%20Production%20Kolkata&dropoff[latitude]=22.467&dropoff[longitude]=88.336&promo=DREAMLINE100" target="_blank" className="flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/10 hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all duration-300 py-4 rounded-xl group relative overflow-hidden interactive">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#c5a059] group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Book A Cab</span>
                                </div>
                                <span className="text-[9px] font-bold text-[#c5a059] group-hover:text-black mt-1">APPLY 'DREAMLINE100'</span>
                            </a>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-white">
                            <div>
                                <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">Studio Location</h5>
                                <address className="not-italic text-lg font-bold leading-relaxed">
                                    85, Tilottama Plaza,<br />First Floor<br />
                                    Kolkata 700082, WB
                                </address>
                            </div>
                            <div>
                                <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">Contact</h5>
                                <a href="tel:+918240054002" className="block text-lg font-bold hover:text-[#c5a059] transition-colors">+91 82400 54002</a>
                                <a href="mailto:santrarony9@gmail.com" className="block text-lg font-bold hover:text-[#c5a059] transition-colors">santrarony9@gmail.com</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
