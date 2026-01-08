/**
 * SafeIn SEO Helper Functions
 * Utility functions for generating SEO metadata and structured data
 */

import type { Metadata } from "next";
import { safeInSEOConfig, safeInPageSEO } from "./seoConfig";

type PageKey = keyof typeof safeInPageSEO;

/**
 * Generate metadata for a specific page
 */
export function generatePageMetadata(pageKey: PageKey): Metadata {
    const pageConfig = safeInPageSEO[pageKey];
    const fullUrl = `${safeInSEOConfig.siteUrl}${pageConfig.path}`;

    return {
        title: {
            default: pageConfig.title,
            template: "%s | SafeIn by Aynzo",
        },
        description: pageConfig.description,
        keywords: pageConfig.keywords,
        authors: [{ name: safeInSEOConfig.author }],
        creator: safeInSEOConfig.creator,
        publisher: safeInSEOConfig.publisher,
        formatDetection: {
            email: false,
            address: false,
            telephone: false,
        },
        metadataBase: new URL(safeInSEOConfig.siteUrl),
        alternates: {
            canonical: fullUrl,
        },
        openGraph: {
            type: "website",
            locale: "en_US",
            url: fullUrl,
            title: pageConfig.title,
            description: pageConfig.description,
            siteName: safeInSEOConfig.siteName,
            images: [
                {
                    url: safeInSEOConfig.logoUrl,
                    width: 1200,
                    height: 630,
                    alt: `${pageConfig.title} - SafeIn by Aynzo`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: pageConfig.title,
            description: pageConfig.description,
            images: [safeInSEOConfig.logoUrl],
            creator: safeInSEOConfig.twitterHandle,
        },
        robots: pageConfig.noindex
            ? {
                  index: false,
                  follow: false,
              }
            : {
                  index: true,
                  follow: true,
              },
    };
}

/**
 * Generate structured data for a specific page
 */
export function generateStructuredData(pageKey: PageKey) {
    const pageConfig = safeInPageSEO[pageKey];
    const org = safeInSEOConfig.organization;

    // Base Organization structured data (always included)
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: org.name,
        url: org.url,
        logo: org.logo,
        contactPoint: {
            "@type": "ContactPoint",
            telephone: org.contactPoint.telephone,
            contactType: org.contactPoint.contactType,
            email: org.contactPoint.email,
        },
        sameAs: org.sameAs,
    };

    // Page-specific structured data
    switch (pageKey) {
        case "home":
            return {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: safeInSEOConfig.siteName,
                url: safeInSEOConfig.siteUrl,
                publisher: {
                    "@type": "Organization",
                    name: org.name,
                    logo: {
                        "@type": "ImageObject",
                        url: org.logo,
                        width: 1200,
                        height: 630,
                    },
                },
                potentialAction: {
                    "@type": "SearchAction",
                    target: `${safeInSEOConfig.siteUrl}/search?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                },
            };

        case "contact":
            return {
                "@context": "https://schema.org",
                "@type": "ContactPage",
                name: pageConfig.title,
                description: pageConfig.description,
                url: `${safeInSEOConfig.siteUrl}${pageConfig.path}`,
                mainEntity: {
                    "@type": "Organization",
                    name: org.name,
                    logo: {
                        "@type": "ImageObject",
                        url: org.logo,
                        width: 1200,
                        height: 630,
                    },
                    contactPoint: {
                        "@type": "ContactPoint",
                        telephone: org.contactPoint.telephone,
                        contactType: org.contactPoint.contactType,
                        email: org.contactPoint.email,
                    },
                },
            };

        case "pricing":
            return {
                "@context": "https://schema.org",
                "@type": "Product",
                name: "SafeIn Visitor Management System",
                description: "Professional visitor management and appointment scheduling system",
                brand: {
                    "@type": "Organization",
                    name: org.name,
                    logo: org.logo,
                },
                offers: [
                    {
                        "@type": "Offer",
                        name: "3 Day Trial",
                        price: "50",
                        priceCurrency: "INR",
                        description: "Free 3-day trial with card verification",
                    },
                ],
            };

        default:
            return {
                "@context": "https://schema.org",
                "@type": "WebPage",
                name: pageConfig.title,
                description: pageConfig.description,
                url: `${safeInSEOConfig.siteUrl}${pageConfig.path}`,
                publisher: {
                    "@type": "Organization",
                    name: org.name,
                    logo: {
                        "@type": "ImageObject",
                        url: org.logo,
                        width: 1200,
                        height: 630,
                    },
                },
            };
    }
}

/**
 * Get page SEO config by key
 */
export function getPageSEOConfig(pageKey: PageKey) {
    return safeInPageSEO[pageKey];
}

/**
 * Get base SEO config
 */
export function getBaseSEOConfig() {
    return safeInSEOConfig;
}
