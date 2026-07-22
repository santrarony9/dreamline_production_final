"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import axios from "axios";
import QRCode from "qrcode";

export default function UserAdmin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ username: "", password: "", role: "admin" });
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
        if (!newUser.username || !newUser.password) return alert("Username and Password are required");
        
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
            setNewUser({ username: "", password: "", role: "admin" });
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
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">Create New User</h3>
                    
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Username</label>
                            <input
                                type="text"
                                value={newUser.username}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                                placeholder="e.g. jdoe"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Password</label>
                            <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Enter secure password"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest pl-1">Role</label>
                            <select
                                value={newUser.role}
                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all text-sm font-bold appearance-none"
                            >
                                <option value="admin" className="bg-[#111]">Admin</option>
                                <option value="editor" className="bg-[#111]">Editor</option>
                            </select>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={creating || !newUser.username || !newUser.password}
                            className="w-full bg-[#c5a059] text-black p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all disabled:opacity-50 mt-4"
                        >
                            {creating ? "Creating..." : "Create Account"}
                        </button>
                    </form>
                </div>

                {/* 2FA Setup Modal */}
                {createdUser && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
                        <div className="bg-[#0a0a0a] border border-[#c5a059]/30 rounded-3xl p-10 max-w-lg w-full space-y-6 shadow-2xl shadow-[#c5a059]/10">
                            <h2 className="text-xl font-black uppercase tracking-widest text-[#c5a059] text-center">Scan 2FA Code</h2>
                            <p className="text-gray-400 text-xs text-center font-bold uppercase tracking-widest leading-relaxed">
                                User <span className="text-white">{createdUser.username}</span> created successfully! <br/><br/>
                                Scan this QR code with Google Authenticator or Authy. This will only be shown <span className="text-red-500">ONCE</span>.
                            </p>
                            
                            {qrCodeDataUrl && (
                                <div className="flex justify-center bg-white p-4 rounded-2xl w-fit mx-auto">
                                    <img src={qrCodeDataUrl} alt="2FA QR Code" className="w-48 h-48" />
                                </div>
                            )}

                            <div className="text-center space-y-2">
                                <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Manual Setup Key</p>
                                <p className="text-white font-mono bg-white/5 p-3 rounded-xl tracking-[0.2em]">{createdUser.twoFactorSecret}</p>
                            </div>

                            <button
                                onClick={handleClearCreated}
                                className="w-full bg-[#c5a059] text-black p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all"
                            >
                                I have saved the 2FA Code
                            </button>
                        </div>
                    </div>
                )}

                {/* Users List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] mb-4">Active Database Users</h3>
                    
                    {users.length === 0 ? (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 text-center text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                            No database users found. System currently running on hardcoded `.env` accounts.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user._id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex items-center justify-between hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            <span className="text-[#c5a059] font-black text-sm uppercase">{user.username.charAt(0)}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">{user.username}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Role: {user.role}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(user._id)}
                                        className="text-red-500/50 hover:text-red-500 text-xl transition-all"
                                        title="Delete User"
                                    >
                                        🗑️
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
