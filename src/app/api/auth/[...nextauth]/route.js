import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Validate critical environment variables at module load
if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
    console.error("CRITICAL: NEXTAUTH_SECRET environment variable is not set!");
}

// Force the correct production URL to prevent Vercel env var misconfigurations
if (process.env.NODE_ENV === 'production') {
    process.env.NEXTAUTH_URL = "https://dreamlineproduction.com";
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
