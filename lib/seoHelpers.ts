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
            locale: "en_IN",
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
        robots: (pageConfig as any).noindex
            ? {
                index: false,
                follow: false,
            }
            : {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
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
        address: (org as any).address,
        contactPoint: {
            "@type": "ContactPoint",
            telephone: org.contactPoint.telephone,
            contactType: org.contactPoint.contactType,
            email: org.contactPoint.email,
            areaServed: (org.contactPoint as any).areaServed,
            availableLanguage: (org.contactPoint as any).availableLanguage
        },
        sameAs: org.sameAs,
    };

    const softwareApplicationData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        ...(safeInSEOConfig as any).softwareApplication
    };

    const localBusinessData = {
        "@context": "https://schema.org",
        ...(safeInSEOConfig as any).localBusiness
    };

    const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": safeInSEOConfig.siteUrl
            },
            ...(pageKey !== "home" ? [{
                "@type": "ListItem",
                "position": 2,
                "name": pageConfig.title,
                "item": `${safeInSEOConfig.siteUrl}${pageConfig.path}`
            }] : [])
        ]
    };

    // Page-specific structured data
    switch (pageKey) {
        case "home":
            return [
                {
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: safeInSEOConfig.siteName,
                    url: safeInSEOConfig.siteUrl,
                    publisher: organizationData,
                    potentialAction: {
                        "@type": "SearchAction",
                        target: `${safeInSEOConfig.siteUrl}/search?q={search_term_string}`,
                        "query-input": "required name=search_term_string",
                    },
                },
                organizationData,
                softwareApplicationData,
                localBusinessData,
                breadcrumbData,
                {
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                        {
                            "@type": "Question",
                            "name": "Which is the best visitor management system in India?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "SafeIn by Aynzo is widely considered one of the best visitor management systems in India, offering real-time chat, spot passes for walk-ins, and smart security notifications."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Does SafeIn offer a free trial in India?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Yes, SafeIn offers a comprehensive 3-day free trial for all businesses and housing societies in India to experience full features of the visitor management platform."
                            }
                        },
                        {
                            "@type": "Question",
                            "name": "Is SafeIn suitable for housing societies in India?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": "Absolutely. SafeIn is specifically designed to handle and streamline visitor entries for both modern businesses and large housing societies across major Indian cities."
                            }
                        }
                    ]
                }
            ];

        case "contact":
            return [
                {
                    "@context": "https://schema.org",
                    "@type": "ContactPage",
                    name: pageConfig.title,
                    description: pageConfig.description,
                    url: `${safeInSEOConfig.siteUrl}${pageConfig.path}`,
                    mainEntity: organizationData,
                },
                breadcrumbData,
                organizationData,
            ];

        case "pricing":
            return [
                {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: "SafeIn Visitor Management System India",
                    description: "Best visitor management and appointment scheduling system in India.",
                    brand: organizationData,
                    offers: [
                        {
                            "@type": "Offer",
                            name: "Standard Plan",
                            price: "499",
                            priceCurrency: "INR",
                            description: "Professional visitor management for Indian small businesses.",
                            availability: "https://schema.org/InStock",
                        },
                        {
                            "@type": "Offer",
                            name: "3 Day Trial",
                            price: "0",
                            priceCurrency: "INR",
                            description: "Free 3-day trial for new Indian users.",
                            availability: "https://schema.org/InStock",
                        },
                    ],
                },
                breadcrumbData,
                organizationData,
            ];

        default:
            return [
                {
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    name: pageConfig.title,
                    description: pageConfig.description,
                    url: `${safeInSEOConfig.siteUrl}${pageConfig.path}`,
                    publisher: organizationData,
                },
                breadcrumbData,
                organizationData,
            ];
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
