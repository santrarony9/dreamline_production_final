import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Admin Access",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "admin" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // In production, these should be env variables
                const adminUser = process.env.ADMIN_USER || "admin";
                const adminPass = process.env.ADMIN_PASS || "admin123";

                if (
                    credentials?.username === adminUser &&
                    credentials?.password === adminPass
                ) {
                    return { id: "1", name: "Dreamline Admin", email: "admin@dreamline.com" };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async session({ session, token }) {
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || "dreamline-premium-secret-2024",
});

export { handler as GET, handler as POST };
