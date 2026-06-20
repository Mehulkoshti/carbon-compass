import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CarbonCompass — carbon footprint tracker',
    short_name: 'CarbonCompass',
    description:
      'Understand, track and reduce your carbon footprint with AI-personalized insights.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6fdfa',
    theme_color: '#059669',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
