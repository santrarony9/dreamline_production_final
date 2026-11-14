"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";

const STATUS_CONFIG = {
    pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    contacted: { label: "Contacted", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    confirmed: { label: "Confirmed", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
    completed: { label: "Completed", bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    cancelled: { label: "Cancelled", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" }
};

export default function BookingsAdmin() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [activeNoteId, setActiveNoteId] = useState(null);
    const [noteDraft, setNoteDraft] = useState("");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/bookings");
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await axios.patch("/api/bookings", { id, status: newStatus });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            alert("Error updating inquiry status: " + (err.response?.data?.error || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    const saveNotes = async (id) => {
        setUpdatingId(id);
        try {
            await axios.patch("/api/bookings", { id, notes: noteDraft });
            setBookings(prev => prev.map(b => b._id === id ? { ...b, notes: noteDraft } : b));
            setActiveNoteId(null);
        } catch (err) {
            alert("Error saving note: " + (err.response?.data?.error || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteBooking = async (id) => {
        if (!confirm("Are you sure you want to permanently delete this inquiry?")) return;
        try {
            await axios.delete(`/api/bookings?id=${id}`);
            setBookings(prev => prev.filter(b => b._id !== id));
        } catch (err) {
            alert("Error deleting inquiry: " + (err.response?.data?.error || err.message));
        }
    };

    const filtered = bookings.filter(b => {
        const matchesStatus = filterStatus === "all" || (b.status || 'pending') === filterStatus;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch = !q ||
            `${b.firstName} ${b.lastName}`.toLowerCase().includes(q) ||
            (b.phone || "").toLowerCase().includes(q) ||
            (b.email || "").toLowerCase().includes(q) ||
            (b.serviceType || "").toLowerCase().includes(q) ||
            (b.vision || b.message || "").toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
    });

    const counts = bookings.reduce((acc, b) => {
        const s = b.status || 'pending';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="space-y-10 pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-xs font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Communications & CRM</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Inquiry <span className="text-gray-500">Vault.</span></h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={fetchBookings}
                        className="text-[10px] font-black text-white uppercase tracking-widest border border-white/10 px-6 py-2.5 rounded-full hover:bg-white/5 transition-all flex items-center gap-2"
                    >
                        <span>↻</span> Refresh
                    </button>
                </div>
            </header>

            {/* Filter Controls & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl">
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {["all", "pending", "contacted", "confirmed", "completed", "cancelled"].map(status => {
                        const count = status === "all" ? bookings.length : (counts[status] || 0);
                        const isActive = filterStatus === status;
                        return (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                                    isActive
                                        ? "bg-[#c5a059] text-black shadow-lg"
                                        : "text-gray-400 hover:text-white bg-white/5"
                                }`}
                            >
                                {status} ({count})
                            </button>
                        );
                    })}
                </div>

                <div className="w-full md:w-72">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search client, phone, email..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:border-[#c5a059] outline-none transition-all"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-gray-500 uppercase text-xs font-bold tracking-widest py-20 text-center">
                    Intercepting incoming transmissions...
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-dashed border-white/10 rounded-3xl p-20 text-center">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">No inquiries found</p>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest">Try clearing the search or status filter.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filtered.map((b) => {
                        const statusKey = b.status || 'pending';
                        const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                        const cleanPhone = (b.phone || "").replace(/\D/g, "");
                        const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
                        const isNotesOpen = activeNoteId === b._id;

                        return (
                            <div
                                key={b._id}
                                className="bg-[#0a0a0a] border border-white/5 hover:border-[#c5a059]/40 p-6 md:p-8 rounded-3xl transition-all space-y-6"
                            >
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight">
                                                {b.firstName} {b.lastName}
                                            </h3>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-[9px] bg-white/5 text-gray-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-white/5">
                                                {b.serviceType || 'General'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-medium">
                                            <a href={`tel:${b.phone}`} className="hover:text-white transition-colors flex items-center gap-1.5">
                                                <span>📞</span> {b.phone}
                                            </a>
                                            {b.email && (
                                                <a href={`mailto:${b.email}`} className="hover:text-white transition-colors flex items-center gap-1.5">
                                                    <span>📧</span> {b.email}
                                                </a>
                                            )}
                                            {b.eventDate && (
                                                <span className="text-gray-500 flex items-center gap-1.5">
                                                    <span>📅</span> Event: <strong className="text-gray-300">{b.eventDate}</strong>
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">
                                            Received: {new Date(b.createdAt).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Action buttons and Status selector */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <select
                                            value={statusKey}
                                            disabled={updatingId === b._id}
                                            onChange={(e) => updateStatus(b._id, e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#c5a059] focus:border-[#c5a059] outline-none cursor-pointer"
                                        >
                                            <option value="pending" className="bg-black text-amber-400">Status: Pending</option>
                                            <option value="contacted" className="bg-black text-blue-400">Status: Contacted</option>
                                            <option value="confirmed" className="bg-black text-emerald-400">Status: Confirmed</option>
                                            <option value="completed" className="bg-black text-purple-400">Status: Completed</option>
                                            <option value="cancelled" className="bg-black text-red-400">Status: Cancelled</option>
                                        </select>

                                        {cleanPhone && (
                                            <a
                                                href={`https://wa.me/${formattedPhone}?text=${encodeURIComponent(`Hi ${b.firstName}, thank you for reaching out to Dreamline Production regarding your ${b.serviceType || 'project'}! We would love to discuss your vision.`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                            >
                                                <span>💬</span> WhatsApp
                                            </a>
                                        )}

                                        <a
                                            href={`tel:${b.phone}`}
                                            className="px-4 py-2 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Call
                                        </a>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isNotesOpen) {
                                                    setActiveNoteId(null);
                                                } else {
                                                    setActiveNoteId(b._id);
                                                    setNoteDraft(b.notes || "");
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                b.notes
                                                    ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/30"
                                                    : "bg-white/5 text-gray-400 border-white/5 hover:text-white"
                                            }`}
                                        >
                                            {b.notes ? "📝 Note" : "+ Note"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => deleteBooking(b._id)}
                                            className="px-3 py-2 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                            title="Delete inquiry"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Vision / Message Box */}
                                {(b.vision || b.message) && (
                                    <div className="bg-black/60 border border-white/5 p-4 rounded-2xl">
                                        <p className="text-[9px] uppercase tracking-widest font-black text-gray-500 mb-1">Client Vision & Request:</p>
                                        <p className="text-xs text-gray-300 leading-relaxed italic">
                                            "{b.vision || b.message}"
                                        </p>
                                    </div>
                                )}

                                {/* Notes Editor */}
                                {isNotesOpen && (
                                    <div className="bg-[#121212] border border-[#c5a059]/30 p-4 rounded-2xl space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#c5a059]">Internal Staff Notes</p>
                                        <textarea
                                            value={noteDraft}
                                            onChange={(e) => setNoteDraft(e.target.value)}
                                            placeholder="Add call notes, budget discussed, follow-up dates..."
                                            rows={3}
                                            className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#c5a059]"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveNoteId(null)}
                                                className="px-3 py-1.5 text-[9px] font-black uppercase text-gray-400 hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => saveNotes(b._id)}
                                                className="px-4 py-1.5 text-[9px] font-black uppercase bg-[#c5a059] text-black rounded-lg hover:bg-white"
                                            >
                                                Save Note
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {b.notes && !isNotesOpen && (
                                    <div className="text-[11px] text-[#c5a059] bg-[#c5a059]/5 border border-[#c5a059]/20 px-4 py-2 rounded-xl flex items-center justify-between">
                                        <span><strong>Staff Note:</strong> {b.notes}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveNoteId(b._id);
                                                setNoteDraft(b.notes || "");
                                            }}
                                            className="text-[9px] uppercase font-black underline ml-2 hover:text-white"
                                        >
                                            Edit
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
