import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const host = req.headers.get("host") || "";
    
    // Automatically redirect all .co.in traffic to the primary .com domain (301 Permanent Redirect)
    if (host.includes("dreamlineproduction.co.in")) {
      const url = req.nextUrl.clone();
      url.host = "www.dreamlineproduction.com";
      return NextResponse.redirect(url, 301);
    }

    const res = NextResponse.next();
    return res;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow login page without requiring token
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        // Only require auth for other admin routes
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
