export default function manifest() {
  return {
    name: 'Dreamline Production',
    short_name: 'Dreamline',
    description: "Kolkata's premier photography and cinematic production house.",
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon-48x48.png?v=2',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icon-192.png?v=2',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png?v=2',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/favicon.png?v=2',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
