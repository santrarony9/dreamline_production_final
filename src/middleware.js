import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const res = NextResponse.next();
    
    // Forces CSP header to allow YouTube/Vimeo
    res.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; frame-src 'self' https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss:;"
    );
    
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
