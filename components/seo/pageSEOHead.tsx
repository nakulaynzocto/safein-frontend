"use client";

import { useEffect } from "react";
import { safeInSEOConfig } from "@/lib/seoConfig";

interface PageSEOHeadProps {
    title: string;
    description: string;
    keywords?: string[];
    url?: string;
    ogImage?: string;
    noindex?: boolean;
    structuredData?: object;
}

export function PageSEOHead({
    title,
    description,
    keywords = [],
    url,
    ogImage,
    noindex = false,
    structuredData,
}: PageSEOHeadProps) {
    const fullTitle = `${title} | SafeIn by Aynzo`;
    const pageUrl = url || safeInSEOConfig.siteUrl;
    const imageUrl = ogImage || safeInSEOConfig.logoUrl;

    useEffect(() => {
        // Update document title
        document.title = fullTitle;

        // Update or create meta tags
        const updateMetaTag = (name: string, content: string, property = false) => {
            const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let meta = document.querySelector(selector) as HTMLMetaElement;
            if (!meta) {
                meta = document.createElement("meta");
                if (property) {
                    meta.setAttribute("property", name);
                } else {
                    meta.setAttribute("name", name);
                }
                document.head.appendChild(meta);
            }
            meta.setAttribute("content", content);
        };

        // Basic meta tags
        updateMetaTag("description", description);
        if (keywords.length > 0) {
            updateMetaTag("keywords", keywords.join(", "));
        }
        updateMetaTag("author", "Aynzo");
        updateMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow");
        updateMetaTag("theme-color", safeInSEOConfig.themeColor);
        updateMetaTag("msapplication-TileColor", safeInSEOConfig.themeColor);

        // Open Graph tags
        updateMetaTag("og:title", title, true);
        updateMetaTag("og:description", description, true);
        updateMetaTag("og:url", pageUrl, true);
        updateMetaTag("og:site_name", safeInSEOConfig.siteName, true);
        updateMetaTag("og:type", "website", true);
        updateMetaTag("og:image", imageUrl, true);
        updateMetaTag("og:image:width", "1200", true);
        updateMetaTag("og:image:height", "630", true);
        updateMetaTag("og:image:alt", `${title} - SafeIn by Aynzo`, true);
        updateMetaTag("og:locale", "en_US", true);

        // Twitter Card tags
        updateMetaTag("twitter:card", "summary_large_image");
        updateMetaTag("twitter:title", title);
        updateMetaTag("twitter:description", description);
        updateMetaTag("twitter:image", imageUrl);
        updateMetaTag("twitter:image:alt", `${title} - SafeIn by Aynzo`);
        updateMetaTag("twitter:creator", safeInSEOConfig.twitterHandle);

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", pageUrl);

        // Add structured data
        const addStructuredData = (data: object, id: string) => {
            // Remove existing script if any
            const existing = document.getElementById(id);
            if (existing) {
                existing.remove();
            }

            const script = document.createElement("script");
            script.id = id;
            script.type = "application/ld+json";
            script.textContent = JSON.stringify(data);
            document.head.appendChild(script);
        };

        // Organization structured data (always add)
        addStructuredData(
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: safeInSEOConfig.organization.name,
                url: safeInSEOConfig.organization.url,
                logo: safeInSEOConfig.organization.logo,
                sameAs: safeInSEOConfig.organization.sameAs,
                contactPoint: {
                    "@type": "ContactPoint",
                    telephone: safeInSEOConfig.organization.contactPoint.telephone,
                    contactType: safeInSEOConfig.organization.contactPoint.contactType,
                    email: safeInSEOConfig.organization.contactPoint.email,
                },
            },
            "organization-structured-data",
        );

        // Page-specific structured data
        if (structuredData) {
            addStructuredData(structuredData, "page-structured-data");
        }
    }, [title, description, keywords, pageUrl, imageUrl, noindex, structuredData, fullTitle]);

    return null;
}
