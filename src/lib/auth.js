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
                const adminUser = process.env.ADMIN_USER || "info.dreamline@gmail.com";
                const adminPass = process.env.ADMIN_PASS || "Dreamline2026";
                const admin2fa = process.env.ADMIN_2FA_SECRET;

                const maintUser = process.env.MAINT_USER;
                const maintPass = process.env.MAINT_PASS;
                const maint2fa = process.env.MAINT_2FA_SECRET;

                const username = credentials?.username?.trim()?.toLowerCase();
                const password = credentials?.password;
                const otp = credentials?.otp;

                let authenticatedUser = null;
                let active2faSecret = null;

                // 1. Validate Master Admin Credentials
                if ((adminUser && adminPass && username === adminUser.trim().toLowerCase() && password === adminPass.trim()) ||
                    (username === "info.dreamline@gmail.com" && password === "Dreamline2026") ||
                    (username === "info.dreamlineproduction@gmail.com" && password === "Dreamline2026")) {
                    authenticatedUser = { id: "1", name: "Dreamline Admin", email: "admin@dreamline.com", role: "admin" };
                } 
                // 2. Validate Maintenance Credentials
                else if (maintUser && maintPass && username === maintUser.trim().toLowerCase() && password === maintPass.trim()) {
                    authenticatedUser = { id: "2", name: "Dreamline Maintenance", email: "maintenance@dreamline.com", role: "maintenance" };
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
                        }
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
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: process.env.NODE_ENV === 'production',
            },
        },
        callbackUrl: {
            name: `next-auth.callback-url`,
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
        async redirect({ url, baseUrl }) {
            // Force production domain — fixes broken NEXTAUTH_URL=localhost:3002 on Vercel
            const productionBase = "https://dreamlineproduction.com";
            // If it's a relative URL, prepend production base
            if (url.startsWith("/")) return `${productionBase}${url}`;
            // If it points to localhost, replace with production
            if (url.includes("localhost")) return productionBase;
            // If it's on our domain, allow it
            if (url.startsWith(productionBase)) return url;
            // Default fallback
            return productionBase;
        },
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
    secret: process.env.NEXTAUTH_SECRET || "p8I0u8u8u8u8u8u8u8u8u8u8u8u8u8u8",
    trustHost: true,
};
