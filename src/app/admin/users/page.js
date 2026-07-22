"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";

export default function UserAdmin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ name: "", email: "", username: "", password: "", role: "admin", sendEmail: true });
    const [creating, setCreating] = useState(false);
    const [createdUser, setCreatedUser] = useState(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/api/users");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newUser.email && !newUser.username) return alert("Please provide at least an Email address or Username.");
        
        setCreating(true);
        try {
            const res = await axios.post("/api/users", newUser);
            setUsers([res.data, ...users]);
            
            // Generate QR Code for 2FA
            const uri = `otpauth://totp/Dreamline:${res.data.username}?secret=${res.data.twoFactorSecret}&issuer=Dreamline`;
            try {
                const url = await QRCode.toDataURL(uri);
                setQrCodeDataUrl(url);
            } catch (err) {
                console.error("Failed to generate QR code", err);
            }
            
            setCreatedUser(res.data);
            setNewUser({ name: "", email: "", username: "", password: "", role: "admin", sendEmail: true });
        } catch (err) {
            alert(err.response?.data?.error || "Error creating user");
        } finally {
            setCreating(false);
        }
    };

    const handleClearCreated = () => {
        setCreatedUser(null);
        setQrCodeDataUrl("");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            await axios.delete(`/api/users?id=${id}`);
            setUsers(users.filter(u => u._id !== id));
        } catch (err) {
            alert("Error deleting user.");
        }
    };

    if (loading) return <div className="text-gray-500 uppercase text-[10px] font-bold tracking-widest">Loading Users...</div>;

    return (
        <div className="space-y-12 max-w-5xl pb-32">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div>
                    <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.4em] mb-2">Access Control</h2>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">User <span className="text-gray-500">Management.</span></h1>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create User Form */}
                <div className="lg:col-span-1 bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 h-fit space-y-6">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">Create New User</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Credentials will be emailed automatically.</p>
                    </div>
                    
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Full Name</label>
                            <input
                                type="text"
                                value={newUser.name}
                                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="e.g. John Doe"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Email Address *</label>
                            <input
                                type="email"
                                value={newUser.email}
                                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="e.g. user@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Username (Optional)</label>
                            <input
                                type="text"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                placeholder="Auto-generated if left blank"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Password (Optional)</label>
                            <input
                                type="text"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Auto-generated secure password if blank"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Role</label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-white focus:border-[#c5a059] outline-none transition-all text-xs font-bold appearance-none"
                            >
                                <option value="admin" className="bg-[#111]">Admin (Full Access)</option>
                                <option value="editor" className="bg-[#111]">Editor (Content Only)</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="sendEmail"
                                checked={newUser.sendEmail}
                                onChange={(e) => setNewUser({ ...newUser, sendEmail: e.target.checked })}
                                className="w-4 h-4 accent-[#c5a059] cursor-pointer"
                            />
                            <label htmlFor="sendEmail" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-pointer">
                                📧 Send login details to user's Email
                            </label>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={creating || (!newUser.email && !newUser.username)}
                            className="w-full bg-[#c5a059] text-black p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all disabled:opacity-50 mt-4 cursor-pointer"
                        >
                            {creating ? "Creating Account..." : "✨ Create Account & Send Email"}
                        </button>
                    </form>
                </div>

                {/* 2FA & Credentials Modal */}
                {createdUser && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                        <div className="bg-[#0a0a0a] border border-[#c5a059]/30 rounded-3xl p-8 max-w-lg w-full space-y-6 shadow-2xl shadow-[#c5a059]/10 max-h-[90vh] overflow-y-auto">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-black uppercase tracking-widest text-[#c5a059]">User Account Created</h2>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                    Account created for <span className="text-white">{createdUser.name || createdUser.username}</span>
                                </p>
                            </div>

                            {/* Email notification status */}
                            <div className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest text-center ${
                                createdUser.emailSent 
                                    ? "bg-green-500/10 border-green-500/30 text-green-400" 
                                    : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            }`}>
                                {createdUser.emailSent 
                                    ? `📧 Welcome email sent to ${createdUser.email}` 
                                    : createdUser.email 
                                        ? `⚠️ Could not send email automatically (${createdUser.emailError || "SMTP config check required"})` 
                                        : "⚠️ No email address provided"}
                            </div>

                            {/* Generated Password Callout */}
                            {createdUser.generatedPassword && (
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 text-center">
                                    <span className="text-[9px] uppercase font-black text-gray-500 tracking-widest">Auto-Generated Password</span>
                                    <p className="text-lg font-mono text-[#c5a059] font-bold tracking-widest">{createdUser.generatedPassword}</p>
                                </div>
                            )}

                            {/* 2FA QR Code & Secret */}
                            <div className="space-y-4 pt-2 border-t border-white/10">
                                <h4 className="text-xs font-black uppercase tracking-widest text-center text-[#c5a059]">🔒 2FA Authentication Setup</h4>
                                <p className="text-gray-400 text-[10px] text-center font-bold uppercase tracking-widest leading-relaxed">
                                    Scan this QR code with Google Authenticator or Authy. <br/>This code is shown <span className="text-red-400">ONCE</span>.
                                </p>
                                
                                {qrCodeDataUrl && (
                                    <div className="flex justify-center bg-white p-4 rounded-2xl w-fit mx-auto">
                                        <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-44 h-44" />
                                    </div>
                                )}

                                <div className="text-center space-y-1">
                                    <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest">Manual Setup Key</p>
                                    <p className="text-white font-mono bg-white/5 p-3 rounded-xl tracking-[0.2em] text-xs font-bold">{createdUser.twoFactorSecret}</p>
                                </div>
                            </div>

                            <button
                                onClick={handleClearCreated}
                                className="w-full bg-[#c5a059] text-black p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all cursor-pointer"
                            >
                                I Have Saved These Credentials
                            </button>
                        </div>
                    </div>
                )}

                {/* Users List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-4">Active Database Users ({users.length})</h3>
                    
                    {users.length === 0 ? (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                            No database users found. System currently running on hardcoded `.env` accounts.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((u) => (
                                <div key={u._id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-[#c5a059] font-black text-base uppercase shrink-0">
                                            {(u.name || u.username || "U").charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-white font-bold text-sm">{u.name || u.username}</h4>
                                                <span className="text-[8px] bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                                    {u.role || "admin"}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-mono">{u.email || "No email listed"}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Username: <span className="text-gray-300 font-mono">{u.username}</span></p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(u._id)}
                                        className="text-red-500/50 hover:text-red-500 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/10 transition-all self-end sm:self-center"
                                        title="Delete User"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
