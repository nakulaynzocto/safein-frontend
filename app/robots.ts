import { MetadataRoute } from 'next';
import { safeInSEOConfig } from '../lib/seoConfig';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/settings/',
                    '/messages/',
                    '/*?next=', // Disallow login redirects
                    '/api/',
                ],
            },
        ],
        sitemap: `${safeInSEOConfig.siteUrl}/sitemap.xml`,
    };
}
