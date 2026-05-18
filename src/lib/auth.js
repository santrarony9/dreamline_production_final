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
                const twofaSecret = process.env.ADMIN_2FA_SECRET;

                if (!adminUser || !adminPass) {
                    console.error("ADMIN_USER or ADMIN_PASS not set");
                    return null;
                }

                // First validate username and password
                if (
                    credentials?.username?.trim() !== adminUser?.trim() ||
                    credentials?.password !== adminPass?.trim()
                ) {
                    return null;
                }

                // If credentials match and 2FA secret is set, enforce TOTP verification
                if (twofaSecret) {
                    if (!credentials?.otp) {
                        throw new Error("2FA_REQUIRED");
                    }

                    const { verifyTOTP } = await import("./totp");
                    const isValidOtp = verifyTOTP(credentials.otp, twofaSecret);
                    
                    if (!isValidOtp) {
                        throw new Error("INVALID_2FA");
                    }
                }

                return { id: "1", name: "Dreamline Admin", email: "admin@dreamline.com" };
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
