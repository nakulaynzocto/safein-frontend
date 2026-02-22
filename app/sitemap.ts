import { MetadataRoute } from 'next';
import { safeInSEOConfig, safeInPageSEO } from '../lib/seoConfig';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = safeInSEOConfig.siteUrl;

    // Get all pages from safeInPageSEO that aren't marked as noindex
    const routes = Object.values(safeInPageSEO)
        .filter(page => !(page as any).noindex)
        .map(page => ({
            url: `${baseUrl}${page.path}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: page.path === '/' ? 1.0 : 0.8,
        }));

    return routes;
}
