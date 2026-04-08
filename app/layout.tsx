import { type ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "./providers";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/common/errorBoundary";
import { NavigationProgress } from "@/components/common/navigationProgress";
import { NavigationProgressProvider } from "@/components/common/navigationProgressProvider";
import { RouteOptimizer } from "@/components/common/routeOptimizer";
import { ServiceWorkerRegistrar } from "@/components/pwa/ServiceWorkerRegistrar";
import { NotificationHandler } from "@/components/notifications/NotificationHandler";
import type { Viewport } from "next";

export const viewport: Viewport = {
    themeColor: "#3882a5",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export const metadata: Metadata = {
    title: "SafeIn",
    description:
        "Transform your visitor management with SafeIn's comprehensive platform in India. Streamline check-ins, manage society visitors, and enhance security with our professional system. Start your free 3-day trial today!",
    keywords: [
        "best visitor management system in india",
        "visitor management software india",
        "gatekeeper app india",
        "society visitor management india",
        "appointment scheduling software india",
        "digital visitor register india",
        "SafeIn India",
        "SafeIn",
    ],
    authors: [{ name: "Aynzo" }],
    creator: "Aynzo",
    publisher: "Aynzo",
    robots: {
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
    generator: "Next.js",
    icons: {
        icon: [
            { url: "/safein-logo.svg", sizes: "any", type: "image/svg+xml" },
            { url: "/safein-identity.png", sizes: "32x32", type: "image/png" },
            { url: "/safein-identity.png", sizes: "16x16", type: "image/png" },
        ],
        apple: [{ url: "/safein-logo.svg", sizes: "180x180", type: "image/svg+xml" }],
        shortcut: "/safein-logo.svg",
    },
    openGraph: {
        type: "website",
        locale: "en_IN",
        url: "https://safein.aynzo.com",
        siteName: "SafeIn by Aynzo",
        title: "SafeIn",
        description:
            "India's leading visitor management system. Features: Smart appointments, spot pass, real-time chat, and advanced security analytics. Perfect for offices & housing societies.",
        images: [
            {
                url: "https://safein.aynzo.com/safein-identity.png",
                width: 1200,
                height: 630,
                alt: "SafeIn Logo - Visitor Management System India",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "SafeIn",
        description: "India's smartest visitor management and appointment scheduling platform.",
        images: ["https://safein.aynzo.com/safein-identity.png"],
        creator: "@safein",
    },
    metadataBase: new URL("https://safein.aynzo.com"),
    alternates: {
        canonical: "https://safein.aynzo.com",
        languages: {
            "en-IN": "https://safein.aynzo.com",
        },
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "SafeIn",
    },
    formatDetection: {
        telephone: true,
        address: true,
        email: true,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en-IN" className="scroll-smooth" suppressHydrationWarning>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
                    rel="stylesheet"
                />
                <link rel="icon" href="/safein-identity.png" type="image/png" />
                <link rel="apple-touch-icon" href="/safein-identity.png" />
                <link rel="shortcut icon" href="/safein-identity.png" type="image/png" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="SafeIn" />
                <meta name="geo.region" content="IN-PB" />
                <meta name="geo.placename" content="Mohali" />
                <meta name="geo.position" content="30.7046;76.7179" />
                <meta name="ICBM" content="30.7046, 76.7179" />
                {/* Structured Data for Organization Logo (Google Search) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "Aynzo",
                            url: "https://aynzo.com",
                            logo: "https://safein.aynzo.com/safein-identity.png",
                            sameAs: [
                                "https://www.facebook.com/profile.php?id=61579388700386",
                                "https://www.instagram.com/aynzo.world",
                                "https://x.com/aynzoworld",
                                "https://www.youtube.com/channel/UC7lY7bl4eALJv4oUwXpfGMg",
                                "https://www.linkedin.com/company/aynzo/",
                            ],
                            contactPoint: {
                                "@type": "ContactPoint",
                                telephone: "+91 86999 66076",
                                contactType: "customer service",
                                areaServed: "IN",
                                availableLanguage: "en",
                                email: "support@aynzo.com",
                            },
                        }),
                    }}
                />
                {/* WebSite Structured Data with Logo */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "SafeIn by Aynzo",
                            url: "https://safein.aynzo.com",
                            publisher: {
                                "@type": "Organization",
                                name: "Aynzo",
                                logo: {
                                    "@type": "ImageObject",
                                    url: "https://safein.aynzo.com/safein-identity.png",
                                    width: 1200,
                                    height: 630,
                                },
                            },
                            potentialAction: {
                                "@type": "SearchAction",
                                target: "https://safein.aynzo.com/search?q={search_term_string}",
                                "query-input": "required name=search_term_string",
                            },
                        }),
                    }}
                />
            </head>
            <body
                suppressHydrationWarning
                className="font-sans"
                style={{
                    backgroundColor: "var(--background)",
                    minHeight: "100vh",
                    transition: "background-color 0.3s ease-in-out",
                }}
            >
                {/* Navigation Progress Bar - wrapped in Suspense */}
                <Suspense fallback={null}>
                    <NavigationProgress />
                </Suspense>

                {/* Route Optimizer for faster navigation */}
                <RouteOptimizer />

                {/* Wrapped children with Error Boundary, Redux Provider and Suspense boundary */}
                <ErrorBoundary>
                    <NavigationProgressProvider>
                        <Providers>
                            <Suspense
                                fallback={
                                    <div
                                        className="flex min-h-screen items-center justify-center"
                                        style={{
                                            backgroundColor: "var(--background)",
                                            minHeight: "100vh",
                                            width: "100%",
                                        }}
                                    >
                                        <div className="animate-spin">
                                            <div className="h-8 w-8 rounded-full border-4 border-[#3882a5] border-t-transparent"></div>
                                        </div>
                                    </div>
                                }
                            >
                                {children}
                            </Suspense>
                            {/* PWA & Notifications */}
                            <ServiceWorkerRegistrar />
                            <NotificationHandler />
                        </Providers>
                    </NavigationProgressProvider>
                </ErrorBoundary>
                {process.env.NODE_ENV === "production" && <Analytics />}
            </body>
        </html>
    );
}
