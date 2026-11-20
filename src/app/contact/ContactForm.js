"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactForm({ globalData }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        eventDate: "",
        serviceType: "Luxury Wedding",
        vision: "",
        website: "" // Honeypot field
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: "", message: "" });

    const contact = globalData?.contact || {};
    const social = globalData?.social || {};

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
                // Trigger Google Ads Conversion
                if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
                    window.gtag('event', 'conversion', {
                        'send_to': 'AW-17805539120/XqiwCOfFvdwbELDuq6pC',
                        'value': 1.0,
                        'currency': 'INR'
                    });
                } else if (typeof window !== 'undefined' && window.reportConversion) {
                    window.reportConversion();
                }

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
        <main className="page-main">
            <section className="content-container mb-20">
                <nav aria-label="Breadcrumb" className="page-breadcrumb mb-8">
                    <Link href="/">Home</Link>
                    <span>/</span>
                    <span className="current">Contact</span>
                </nav>
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Booking Form */}
                    <div>
                        <span className="page-category-label">Begin the Journey</span>
                        <h1 className="page-hero-title mb-8">
                            Book Your <span className="text-[#c5a059]">Experience.</span>
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid sm:grid-cols-2 gap-8">
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

                            <div className="grid sm:grid-cols-2 gap-8">
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
                                        placeholder="+91 98765 43210"
                                        className="placeholder-white/20 bg-transparent border-b border-white/20 text-white w-full py-4 outline-none focus:border-[#c5a059] transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-8">
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
                                        <option value="Luxury Wedding">Luxury Wedding Photography & Films</option>
                                        <option value="Pre-Wedding Shoot">Cinematic Pre-Wedding Shoot</option>
                                        <option value="Rice Ceremony">Rice Ceremony / Annaprashan</option>
                                        <option value="Commercial Ad">Commercial Ad & Brand Film</option>
                                        <option value="Corporate Event">Corporate Film & Industrial Shoot</option>
                                        <option value="Drone Photography">Drone & Aerial Videography</option>
                                        <option value="Podcast Production">Podcast Studio & Production</option>
                                        <option value="Music Video">Music Video Production</option>
                                        <option value="Line Production">Line Production & Logistics</option>
                                        <option value="Other">Other Creative Project</option>
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

                            {/* Honeypot field - hidden from users, but bots will fill it */}
                            <div className="hidden" aria-hidden="true">
                                <input
                                    type="text"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    tabIndex="-1"
                                    autoComplete="off"
                                />
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
                    <div className="space-y-8 sm:space-y-12">
                        <div className="w-full h-[280px] sm:h-[350px] md:h-[400px] rounded-[2rem] overflow-hidden border border-white/10 relative">
                            <div className="absolute inset-0 bg-[#c5a059] mix-blend-overlay opacity-10 pointer-events-none z-10"></div>
                            {(globalData?.google?.placeId && globalData?.google?.mapsApiKey) ? (
                                <iframe
                                    src={`https://www.google.com/maps/embed/v1/place?key=${globalData.google.mapsApiKey}&q=place_id:${globalData.google.placeId}`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'grayscale(100%) invert(100%) contrast(80%)' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            ) : (
                                <iframe
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent("Dreamline Production, " + (contact.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata, West Bengal 700082"))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0, filter: 'grayscale(100%) invert(100%) contrast(80%)' }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Dreamline Production, " + (contact.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata, West Bengal 700082"))}`} target="_blank" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all duration-300 py-3.5 sm:py-4 px-2 rounded-xl group interactive text-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059] group-hover:text-black transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                                </svg>
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Directions</span>
                            </a>
                            {globalData?.google?.placeId ? (
                                <a href={`https://search.google.com/local/writereview?placeid=${globalData.google.placeId}`} target="_blank" className="flex items-center justify-center gap-1.5 sm:gap-2 bg-white/5 border border-[#c5a059]/30 hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all duration-300 py-3.5 sm:py-4 px-2 rounded-xl group interactive text-center">
                                    <div className="flex -space-x-1 shrink-0 hidden xs:flex">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <svg key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#c5a059] group-hover:text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Review Us</span>
                                </a>
                            ) : (
                                <a href={`https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(contact.address || "Dreamline Production Kolkata")}`} target="_blank" className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all duration-300 py-3.5 sm:py-4 px-2 rounded-xl group relative overflow-hidden interactive text-center">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#c5a059] group-hover:text-black transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Book A Cab</span>
                                </a>
                            )}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 text-white">
                            <div>
                                <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">Studio Location</h5>
                                <address className="not-italic text-lg font-bold leading-relaxed">
                                    {contact.address || "85, Tilottama Plaza, Tower 2, First Floor, Karunamoyee Ghat Road, Kolkata, West Bengal 700082"}
                                </address>
                            </div>
                            <div>
                                <h5 className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-4">Contact</h5>
                                <a href={`tel:${contact.phone || "+918240054002"}`} className="block text-lg font-bold hover:text-[#c5a059] transition-colors">{contact.phone || "+91 82400 54002"}</a>
                                <a href={`mailto:${contact.email || "support@dreamlineproduction.com"}`} className="block text-lg font-bold hover:text-[#c5a059] transition-colors">{contact.email || "support@dreamlineproduction.com"}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
