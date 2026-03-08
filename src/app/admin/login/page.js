"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid credentials. Authorized personnel only.");
            setLoading(false);
        } else {
            router.push("/admin");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[dashed-grid]">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-xl">
                        <span className="text-2xl text-[#c5a059] font-black">DP</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Admin Portal</h1>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-bold">Secure Cinema Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Identifier</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all placeholder:text-gray-700 font-bold"
                            placeholder="info.dreamline@"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Keycode</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none transition-all placeholder:text-gray-700 font-bold"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#c5a059] hover:bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-[#c5a059]/10 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Decrypting..." : "Enter Dashboard"}
                    </button>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-[8px] text-gray-700 uppercase tracking-[0.5em] font-black">Authorized Access Only • System v3.0.0</p>
                </div>
            </div>
        </div>
    );
}
