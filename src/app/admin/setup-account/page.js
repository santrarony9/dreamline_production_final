"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import QRCode from "qrcode";

function SetupAccountForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [userMeta, setUserMeta] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState("");
    const [tokenError, setTokenError] = useState("");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");
    
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!token) {
            setTokenError("Missing setup token in link.");
            setLoading(false);
            return;
        }
        validateToken();
    }, [token]);

    const validateToken = async () => {
        try {
            const res = await axios.get(`/api/users/setup?token=${token}`);
            setUserMeta(res.data);
            
            // Generate QR Code for 2FA
            const uri = `otpauth://totp/Dreamline:${res.data.username}?secret=${res.data.twoFactorSecret}&issuer=Dreamline`;
            try {
                const url = await QRCode.toDataURL(uri);
                setQrCodeUrl(url);
            } catch (qrErr) {
                console.error("QR Code Error:", qrErr);
            }
        } catch (err) {
            setTokenError(err.response?.data?.error || "Invalid or expired setup token.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        
        if (password.length < 6) {
            return setSubmitError("Password must be at least 6 characters long.");
        }
        if (password !== confirmPassword) {
            return setSubmitError("Passwords do not match.");
        }
        if (!otp || otp.length !== 6) {
            return setSubmitError("Please enter your 6-digit 2FA code from Authenticator.");
        }

        setSubmitting(true);
        try {
            await axios.post("/api/users/setup", {
                token,
                password,
                otp
            });
            setSuccessMessage("Your account password & 2FA have been configured successfully! Redirecting to login...");
            setTimeout(() => {
                router.push("/admin/login");
            }, 2500);
        } catch (err) {
            setSubmitError(err.response?.data?.error || "Error setting up account.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-gray-500 font-bold uppercase tracking-widest text-xs">
                Validating setup link...
            </div>
        );
    }

    if (tokenError) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="bg-[#0a0a0a] border border-red-500/30 rounded-3xl p-10 max-w-md w-full text-center space-y-6">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-2xl text-red-500">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-black uppercase text-white tracking-widest">Setup Link Invalid</h2>
                    <p className="text-gray-400 text-xs leading-relaxed font-bold uppercase">{tokenError}</p>
                    <a 
                        href="/admin/login" 
                        className="inline-block bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-2xl transition-all"
                    >
                        Go to Admin Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 py-12">
            <div className="w-full max-w-lg bg-[#0a0a0a] border border-[#c5a059]/30 rounded-3xl p-8 sm:p-10 space-y-8 shadow-2xl shadow-[#c5a059]/10">
                <div className="text-center space-y-2">
                    <div className="inline-block p-3 rounded-2xl bg-white/5 border border-white/10 mb-2">
                        <span className="text-xl text-[#c5a059] font-black">DP</span>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Set Up Your Account</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        Welcome, <span className="text-white">{userMeta.name || userMeta.username}</span>
                    </p>
                </div>

                {successMessage ? (
                    <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center space-y-2">
                        <span className="text-2xl">🎉</span>
                        <p className="text-green-400 font-black uppercase tracking-widest text-xs">{successMessage}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Step 1: Password */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">1. Create Your Password</h3>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">New Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 6 characters"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-sm font-bold"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat password"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none text-sm font-bold"
                                    required
                                />
                            </div>
                        </div>

                        {/* Step 2: 2FA Setup */}
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059]">2. Configure 2FA Authenticator</h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                Scan this QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>:
                            </p>

                            {qrCodeUrl && (
                                <div className="flex justify-center bg-white p-4 rounded-2xl w-fit mx-auto border border-white/20">
                                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-44 h-44" />
                                </div>
                            )}

                            <div className="text-center space-y-1">
                                <span className="text-[9px] uppercase font-black text-gray-500 tracking-widest">Or enter secret key manually:</span>
                                <p className="text-white font-mono bg-white/5 p-3 rounded-xl tracking-[0.2em] text-xs font-bold select-all">{userMeta.twoFactorSecret}</p>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Enter 6-Digit Code from Authenticator App</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                    placeholder="000000"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-[#c5a059] outline-none tracking-[0.5em] text-center text-xl font-black"
                                    required
                                />
                            </div>
                        </div>

                        {submitError && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
                                {submitError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#c5a059] hover:bg-white text-black font-black uppercase tracking-widest py-4 rounded-2xl transition-all disabled:opacity-50 cursor-pointer text-xs"
                        >
                            {submitting ? "Configuring Account..." : "Complete Account & 2FA Setup"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default function SetupAccountPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center p-6 text-gray-500 font-bold uppercase text-xs">Loading...</div>}>
            <SetupAccountForm />
        </Suspense>
    );
}
