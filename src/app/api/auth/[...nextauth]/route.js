import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Validate critical environment variables at module load
if (process.env.NODE_ENV === 'production' && !process.env.NEXTAUTH_SECRET) {
    console.error("CRITICAL: NEXTAUTH_SECRET environment variable is not set!");
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
