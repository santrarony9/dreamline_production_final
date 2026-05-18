import CredentialsProvider from "next-auth/providers/credentials";

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
                    authenticatedUser = { id: "1", name: "Dreamline Admin", email: "admin@dreamline.com" };
                    active2faSecret = admin2fa;
                } 
                // 2. Validate Maintenance Credentials
                else if (maintUser && maintPass && username === maintUser.trim() && password === maintPass.trim()) {
                    authenticatedUser = { id: "2", name: "Dreamline Maintenance", email: "maintenance@dreamline.com" };
                    active2faSecret = maint2fa;
                }

                // If credentials didn't match either account, deny entry
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
        async session({ session, token }) {
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    trustHost: true,
};
