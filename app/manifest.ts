import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SafeIn',
        short_name: 'SafeIn',
        description: "India's best visitor management and appointment scheduling system.",
        start_url: '/dashboard',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#ffffff',
        theme_color: '#3882a5',
        lang: 'en-IN',
        dir: 'ltr',
        categories: ['business', 'productivity', 'utilities'],
        icons: [
            // Regular icons (white background) — used for favicons, splash screens
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
            // Maskable icons (brand-color background) — OS clips these as circle/squircle
            {
                src: '/icon-maskable-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-maskable-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
        ],
        shortcuts: [
            {
                name: 'Dashboard',
                short_name: 'Dashboard',
                description: 'Go to your SafeIn dashboard',
                url: '/dashboard',
                icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
                name: 'Appointments',
                short_name: 'Appointments',
                description: 'Manage visitor appointments',
                url: '/appointment/list',
                icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
            },
            {
                name: 'Visitors',
                short_name: 'Visitors',
                description: 'View all visitors',
                url: '/visitor/list',
                icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
            },
        ],
    };
}
