import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'SafeIn Visitor Management',
        short_name: 'SafeIn',
        description: 'India\'s best visitor management and appointment scheduling system.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3882a5',
        icons: [
            {
                src: '/aynzo-logo.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    };
}
