"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";

export default function BookingsAdmin() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get("/api/bookings");
            setBookings(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async (id) => {
        if (!confirm("Delete this inquiry permanentely?")) return;
        try {
            await axios.delete(`/api/bookings?id=${id}`);
            setBookings(bookings.filter(b => b._id !== id));
        } catch (err) {
            alert("Error deleting booking");
        }
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Intercepting messages...</div>;

    return (
        <div className="space-y-12 pb-32">
            <header className="flex justify-between items-end">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Communications</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Inquiry <span className="text-gray-700">Vault.</span></h1>
                </div>
                <button
                    onClick={fetchBookings}
                    className="text-[10px] font-black text-white uppercase tracking-widest border border-white/10 px-6 py-2 rounded-full hover:bg-white/5 transition-all"
                >
                    Refresh Feed
                </button>
            </header>

            <div className="grid gap-6">
                {bookings.length === 0 ? (
                    <div className="bg-[#0a0a0a] border border-dashed border-white/10 rounded-3xl p-20 text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Silence in the studio. No inquiries to report.</p>
                    </div>
                ) : (
                    bookings.map((b) => (
                        <div key={b._id} className="bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group hover:border-[#c5a059]/30 transition-all">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{b.firstName} {b.lastName}</h3>
                                    <span className="text-[9px] bg-[#c5a059]/10 text-[#c5a059] px-2 py-0.5 rounded font-black uppercase tracking-widest">{b.serviceType}</span>
                                </div>
                                <div className="flex gap-4 text-[11px] text-gray-500 font-bold">
                                    <span>📞 {b.phone}</span>
                                    <span>📧 {b.email}</span>
                                </div>
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest font-black">Received: {new Date(b.createdAt).toLocaleString()}</p>
                            </div>

                            <div className="flex flex-col md:items-end gap-2">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Event Date: <span className="text-white">{new Date(b.eventDate).toLocaleDateString()}</span></p>
                                <p className="text-xs text-gray-500 italic max-w-sm text-right line-clamp-2">"{b.message || "No specific message provided."}"</p>
                            </div>

                            <div className="flex items-center gap-6">
                                <a
                                    href={`https://wa.me/${b.phone.replace(/\D/g, "")}`}
                                    target="_blank"
                                    className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    WhatsApp Reply →
                                </a>
                                <button
                                    onClick={() => deleteBooking(b._id)}
                                    className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors"
                                >
                                    Purge
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
