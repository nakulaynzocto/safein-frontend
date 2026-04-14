import { MetadataRoute } from 'next';
import { safeInSEOConfig, safeInPageSEO } from '../lib/seoConfig';
import { BLOG_BASE_URL, BLOG_CATEGORY } from '../lib/api-config';
import { helpArticles } from './help/data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = safeInSEOConfig.siteUrl;

    // 1. Core Pages from config
    const coreRoutes = Object.values(safeInPageSEO)
        .filter(page => !(page as any).noindex)
        .map(page => ({
            url: `${baseUrl}${page.path}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: page.path === '/' ? 1.0 : 0.8,
        }));

    // 2. Fetch Blog Posts from API
    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const response = await fetch(`${BLOG_BASE_URL}?category=${BLOG_CATEGORY}&status=PUBLISHED&limit=100`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        const data = await response.json();
        const blogs = data?.data?.blogs || [];

        blogRoutes = blogs.map((post: any) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updatedAt || post.createdAt),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error("Sitemap: Failed to fetch blogs", error);
    }

    // 3. Help Articles from local data
    const helpRoutes = helpArticles.map((article) => ({
        url: `${baseUrl}/help/${article.slug}`,
        lastModified: new Date(), // Local data doesn't have timestamps, use current date
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    return [...coreRoutes, ...blogRoutes, ...helpRoutes];
}
