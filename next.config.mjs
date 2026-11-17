/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    minimumCacheTTL: 5184000, // 60 days to stay within free tier optimization limits
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'backend.dreamlineproduction.com',
      },
      {
        protocol: 'https',
        hostname: 'dreamlineproduction.com',
      },
      {
        protocol: 'https',
        hostname: 'dreamlinepro.s3.ap-south-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'dreamlinepro.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'dreamlinepro.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'image.thum.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: '/uploads/:path*',
          destination: 'https://backend.dreamlineproduction.com/uploads/:path*',
        }
      ]
    };
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com https://*.doubleclick.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://backend.dreamlineproduction.com https://dreamlineproduction.com https://dreamlinepro.s3.ap-south-2.amazonaws.com https://dreamlinepro.s3.ap-south-1.amazonaws.com https://dreamlinepro.s3.amazonaws.com https://res.cloudinary.com https://image.thum.io https://images.unsplash.com https://i.ytimg.com https://img.youtube.com https://*.googleapis.com https://*.googleusercontent.com https://*.doubleclick.net https://*.google.com https://*.google.co.in",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.googleapis.com https://*.doubleclick.net https://*.google.com https://*.google.co.in wss:",
              "media-src 'self' data: blob: https://backend.dreamlineproduction.com https://dreamlinepro.s3.ap-south-2.amazonaws.com https://dreamlinepro.s3.ap-south-1.amazonaws.com https://dreamlinepro.s3.amazonaws.com",
              "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Standardized Service URLs 301 Permanent Redirects
      {
        source: '/services/drone-videography',
        destination: '/services/drone-videography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/corporate-films',
        destination: '/services/corporate-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/corporate-photography',
        destination: '/services/corporate-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/wedding-photography',
        destination: '/services/wedding-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/luxury-weddings',
        destination: '/services/wedding-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/luxury-wedding-cinema',
        destination: '/services/wedding-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/cinematic-film',
        destination: '/services/wedding-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/pre-wedding',
        destination: '/services/pre-wedding-shoot-kolkata/',
        permanent: true,
      },
      {
        source: '/services/pre-wedding-shoot',
        destination: '/services/pre-wedding-shoot-kolkata/',
        permanent: true,
      },
      {
        source: '/services/podcast',
        destination: '/services/podcast-production-kolkata/',
        permanent: true,
      },
      {
        source: '/services/documentary',
        destination: '/services/documentary-film-production-kolkata/',
        permanent: true,
      },
      {
        source: '/services/brand-promotion',
        destination: '/services/brand-promotion-kolkata/',
        permanent: true,
      },
      {
        source: '/services/ad-films',
        destination: '/services/commercial-ad-films-kolkata/',
        permanent: true,
      },
      {
        source: '/services/brand-films',
        destination: '/services/commercial-ad-films-kolkata/',
        permanent: true,
      },
      {
        source: '/services/3d-area-mapping',
        destination: '/services/3d-area-mapping-kolkata/',
        permanent: true,
      },
      {
        source: '/services/2d-animation',
        destination: '/services/2d-animation-kolkata/',
        permanent: true,
      },
      {
        source: '/services/drone-photography',
        destination: '/services/drone-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/rice-ceremony',
        destination: '/services/rice-ceremony-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/annaprashan-photography',
        destination: '/services/rice-ceremony-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/video-production-agency',
        destination: '/services/video-production-agency-kolkata/',
        permanent: true,
      },
      {
        source: '/services/video-production',
        destination: '/services/video-production-agency-kolkata/',
        permanent: true,
      },
      {
        source: '/services/aerial-photography',
        destination: '/services/drone-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/aerial-videography',
        destination: '/services/drone-videography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/real-estate-photography',
        destination: '/services/drone-photography-kolkata/',
        permanent: true,
      },
      {
        source: '/services/event-photography',
        destination: '/services/wedding-photography-kolkata/',
        permanent: true,
      },
      // Aliases for About Us and Contact Us
      {
        source: '/about-us',
        destination: '/about/',
        permanent: true,
      },
      {
        source: '/contact-us',
        destination: '/contact/',
        permanent: true,
      },
      // Journal legacy redirects
      {
        source: '/journal',
        destination: '/blogs/',
        permanent: true,
      },
      {
        source: '/journal/:slug*',
        destination: '/blogs/:slug*/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

