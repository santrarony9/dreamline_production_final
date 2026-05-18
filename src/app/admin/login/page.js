"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [show2fa, setShow2fa] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                username,
                password,
                otp: show2fa ? otp : undefined,
                redirect: false,
            });

            if (res?.error) {
                // If NextAuth catches our custom error string, handle appropriately
                if (res.error === "2FA_REQUIRED") {
                    setShow2fa(true);
                    setLoading(false);
                } else if (res.error === "INVALID_2FA" || res.error.includes("INVALID_2FA")) {
                    setError("Invalid 2FA Verification Code. Try again.");
                    setLoading(false);
                } else {
                    setError("Invalid credentials. Authorized personnel only.");
                    setLoading(false);
                }
            } else {
                router.push("/admin");
            }
        } catch (err) {
            console.error("Login exception:", err);
            setError("Authentication connection error.");
            setLoading(false);
        }
    };

    const handleBackToCredentials = () => {
        setShow2fa(false);
        setOtp("");
        setError("");
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 bg-[dashed-grid]">
            <div className="w-full max-w-md">
                <div className="text-center mb-12">
                    <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-xl">
                        <span className="text-2xl text-[#c5a059] font-black">DP</span>
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Admin Portal</h1>
                    <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-bold">
                        {show2fa ? "Two-Factor Authorization" : "Secure Cinema Access"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!show2fa ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">6-Digit Authenticator Code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none tracking-[0.5em] text-center text-2xl font-black transition-all placeholder:text-gray-700 placeholder:tracking-normal placeholder:text-base"
                                    placeholder="000000"
                                    required
                                    autoFocus
                                />
                                <p className="text-[9px] text-gray-500 font-medium tracking-wide leading-relaxed pt-2 pl-1 text-center">
                                    Open your Google Authenticator or Microsoft Authenticator app to retrieve your code.
                                </p>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#c5a059] hover:bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-[#c5a059]/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? "Decrypting..." : show2fa ? "Verify & Decrypt" : "Enter Dashboard"}
                        </button>

                        {show2fa && (
                            <button
                                type="button"
                                onClick={handleBackToCredentials}
                                className="w-full bg-transparent hover:text-white text-gray-500 font-black text-[10px] uppercase tracking-widest py-2 rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
                            >
                                ← Back to Login
                            </button>
                        )}
                    </div>
                </form>

                <div className="mt-12 text-center">
                    <p className="text-[8px] text-gray-700 uppercase tracking-[0.5em] font-black">Authorized Access Only • System v3.0.0</p>
                </div>
            </div>
        </div>
    );
}
