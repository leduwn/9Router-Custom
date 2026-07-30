export default function manifest() {
  return {
    name: 'Duwn — AI routing control plane',
    short_name: 'Duwn',
    description: 'Connect providers, route models, manage credentials, and monitor every request from one control plane.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07111f',
    theme_color: '#07111f',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
