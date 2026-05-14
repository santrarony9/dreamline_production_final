/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    minimumCacheTTL: 5184000, // 60 days to stay within free tier optimization limits
    remotePatterns: [
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
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; frame-src 'self' https://www.youtube.com https://youtube.com https://youtu.be https://www.youtube-nocookie.com https://*.youtube.com https://player.vimeo.com https://vimeo.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data: https:; connect-src 'self' https: wss:;",
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
        ],
      },
    ];
  },
};

export default nextConfig;

