import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Admin Access",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                otp: { label: "OTP Code", type: "text" }
            },
            async authorize(credentials) {
                const adminUser = process.env.ADMIN_USER;
                const adminPass = process.env.ADMIN_PASS;
                const admin2fa = process.env.ADMIN_2FA_SECRET;

                const maintUser = process.env.MAINT_USER;
                const maintPass = process.env.MAINT_PASS;
                const maint2fa = process.env.MAINT_2FA_SECRET;

                const username = credentials?.username?.trim();
                const password = credentials?.password;
                const otp = credentials?.otp;

                let authenticatedUser = null;
                let active2faSecret = null;

                // 1. Validate Master Admin Credentials
                if (adminUser && adminPass && username === adminUser.trim() && password === adminPass.trim()) {
                    authenticatedUser = { id: "1", name: "Dreamline Admin", email: "admin@dreamline.com", role: "admin" };
                    active2faSecret = admin2fa;
                } 
                // 2. Validate Maintenance Credentials
                else if (maintUser && maintPass && username === maintUser.trim() && password === maintPass.trim()) {
                    authenticatedUser = { id: "2", name: "Dreamline Maintenance", email: "maintenance@dreamline.com", role: "maintenance" };
                    active2faSecret = maint2fa;
                }
                // 3. Check Database for Users (by username OR email)
                else {
                    await dbConnect();
                    const normalizedIdentifier = username ? username.toLowerCase() : "";
                    const dbUser = await User.findOne({
                        $or: [
                            { username: normalizedIdentifier },
                            { email: normalizedIdentifier }
                        ]
                    });
                    if (dbUser) {
                        const isValidPassword = await bcrypt.compare(password, dbUser.password);
                        if (isValidPassword) {
                            authenticatedUser = {
                                id: dbUser._id.toString(),
                                name: dbUser.name || dbUser.username,
                                email: dbUser.email || `${dbUser.username}@dreamline.com`,
                                role: dbUser.role
                            };
                            active2faSecret = dbUser.twoFactorSecret;
                        }
                    }
                }

                // If credentials didn't match any account, deny entry
                if (!authenticatedUser) {
                    return null;
                }

                // 3. Enforce 2FA if configured for the matching account
                if (active2faSecret) {
                    const isOtpEmpty = !otp || otp === "undefined" || otp === "null" || otp.trim() === "";
                    
                    if (isOtpEmpty) {
                        throw new Error("2FA_REQUIRED");
                    }

                    const { verifyTOTP } = await import("./totp");
                    const isValidOtp = verifyTOTP(otp, active2faSecret);
                    
                    if (!isValidOtp) {
                        throw new Error("INVALID_2FA");
                    }
                }

                return authenticatedUser;
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },
    jwt: {
        maxAge: 7 * 24 * 60 * 60,
    },
    cookies: {
        sessionToken: {
            name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
    },
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
};
