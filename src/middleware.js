import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const SERVICE_REDIRECTS = {
  '/services/drone-videography': '/services/drone-videography-kolkata/',
  '/services/corporate-films': '/services/corporate-photography-kolkata/',
  '/services/corporate-photography': '/services/corporate-photography-kolkata/',
  '/services/wedding-photography': '/services/wedding-photography-kolkata/',
  '/services/luxury-weddings': '/services/wedding-photography-kolkata/',
  '/services/luxury-wedding-cinema': '/services/wedding-photography-kolkata/',
  '/services/cinematic-film': '/services/wedding-photography-kolkata/',
  '/services/pre-wedding': '/services/pre-wedding-shoot-kolkata/',
  '/services/pre-wedding-shoot': '/services/pre-wedding-shoot-kolkata/',
  '/services/podcast': '/services/podcast-production-kolkata/',
  '/services/documentary': '/services/documentary-film-production-kolkata/',
  '/services/brand-promotion': '/services/brand-promotion-kolkata/',
  '/services/ad-films': '/services/commercial-ad-films-kolkata/',
  '/services/3d-area-mapping': '/services/3d-area-mapping-kolkata/',
  '/services/2d-animation': '/services/2d-animation-kolkata/',
  '/services/video-production': '/services/video-production-agency-kolkata/',
  '/services/rice-ceremony': '/services/rice-ceremony-photography-kolkata/',
};

export default withAuth(
  function middleware(req) {
    const host = req.headers.get("host") || "";
    const pathname = req.nextUrl.pathname;
    
    // Automatically redirect all .co.in traffic to the primary .com domain (301 Permanent Redirect)
    if (host.includes("dreamlineproduction.co.in")) {
      const url = req.nextUrl.clone();
      url.host = "www.dreamlineproduction.com";
      return NextResponse.redirect(url, 301);
    }

    // Standardized Service URLs 301 Permanent Redirects
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    if (SERVICE_REDIRECTS[cleanPath]) {
      const targetUrl = new URL(SERVICE_REDIRECTS[cleanPath], req.url);
      return NextResponse.redirect(targetUrl, 301);
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
