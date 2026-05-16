import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const res = NextResponse.next();
    
    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Only require auth for admin routes
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token;
        }
        // Allow all other routes
        return true;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
