/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  images: {
    minimumCacheTTL: 5184000, // 60 days to stay within free tier optimization limits
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
    const rewrites = [
      {
        source: '/uploads/:path*',
        destination: 'http://backend.dreamlineproduction.com/uploads/:path*',
      }
    ];

    // Only proxy the upload endpoint if we are running on the Vercel frontend
    if (process.env.VERCEL === '1') {
      return {
        beforeFiles: [
          {
            source: '/api/upload',
            destination: 'http://backend.dreamlineproduction.com/api/upload',
          }
        ],
        fallback: rewrites
      };
    }

    return rewrites;
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
              "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https://backend.dreamlineproduction.com https://dreamlinepro.s3.ap-south-2.amazonaws.com https://dreamlinepro.s3.ap-south-1.amazonaws.com https://dreamlinepro.s3.amazonaws.com https://res.cloudinary.com https://image.thum.io https://images.unsplash.com https://i.ytimg.com https://img.youtube.com https://*.googleapis.com https://*.googleusercontent.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://www.google-analytics.com https://*.googleapis.com wss:",
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
};

export default nextConfig;

