import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Admin Access",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                const adminUser = process.env.ADMIN_USER;
                const adminPass = process.env.ADMIN_PASS;

                if (!adminUser || !adminPass) {
                    console.error("ADMIN_USER or ADMIN_PASS not set");
                    return null;
                }

                console.log(`DEBUG AUTH: Comparing User [${credentials?.username?.trim() === adminUser?.trim()}] Pass [${credentials?.password === adminPass?.trim()}]`);
                console.log(`DEBUG AUTH: Expected User length: ${adminUser?.trim().length}, Pass length: ${adminPass?.trim().length}`);
                
                if (
                    credentials?.username?.trim() === adminUser?.trim() &&
                    credentials?.password === adminPass?.trim()
                ) {
                    console.log("DEBUG AUTH: Success!");
                    return { id: "1", name: "Dreamline Admin", email: "admin@dreamline.com" };
                }
                console.log("DEBUG AUTH: Failure.");

                return null;
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
