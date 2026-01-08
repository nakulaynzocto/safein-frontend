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

export const metadata: Metadata = {
    title: "SafeIn - Professional Visitor Management & Appointment System | Aynzo",
    description:
        "Transform your visitor management with SafeIn's comprehensive appointment scheduling system. Streamline check-ins, manage visitors, and enhance security with our professional platform. Start your free 3-day trial today!",
    keywords: [
        "visitor management system",
        "appointment scheduling software",
        "visitor check-in system",
        "security management platform",
        "visitor registration",
        "appointment booking",
        "visitor tracking",
        "business security",
        "visitor analytics",
        "SafeIn management",
        "Aynzo",
        "digital solutions",
    ],
    authors: [{ name: "Aynzo" }],
    creator: "Aynzo",
    publisher: "Aynzo",
    robots: {
        index: true,
        follow: true,
    },
    generator: "Next.js",
    icons: {
        icon: [
            { url: "/aynzo-logo.png", sizes: "any", type: "image/png" },
            { url: "/aynzo-logo.png", sizes: "32x32", type: "image/png" },
            { url: "/aynzo-logo.png", sizes: "16x16", type: "image/png" },
        ],
        apple: [{ url: "/aynzo-logo.png", sizes: "180x180", type: "image/png" }],
        shortcut: "/aynzo-logo.png",
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://safein.aynzo.com",
        siteName: "SafeIn by Aynzo",
        title: "SafeIn - Professional Visitor Management & Appointment System",
        description:
            "Transform your visitor management with SafeIn's comprehensive appointment scheduling system. Streamline check-ins, manage visitors, and enhance security with our professional platform.",
        images: [
            {
                url: "https://safein.aynzo.com/aynzo-logo.png",
                width: 1200,
                height: 630,
                alt: "Aynzo Logo - SafeIn Visitor Management System",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "SafeIn - Professional Visitor Management & Appointment System",
        description: "Transform your visitor management with SafeIn's comprehensive appointment scheduling system.",
        images: ["https://safein.aynzo.com/aynzo-logo.png"],
        creator: "@aynzo",
    },
    metadataBase: new URL("https://safein.aynzo.com"),
    alternates: {
        canonical: "https://safein.aynzo.com",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
                    rel="stylesheet"
                />
                <link rel="icon" href="/aynzo-logo.png" type="image/png" />
                <link rel="apple-touch-icon" href="/aynzo-logo.png" />
                <link rel="shortcut icon" href="/aynzo-logo.png" type="image/png" />
                {/* Structured Data for Organization Logo (Google Search) */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "Aynzo",
                            url: "https://aynzo.com",
                            logo: "https://safein.aynzo.com/aynzo-logo.png",
                            sameAs: [
                                "https://www.facebook.com/profile.php?id=61579388700386",
                                "https://www.instagram.com/aynzo.world",
                                "https://x.com/aynzoworld",
                                "https://www.youtube.com/channel/UC7lY7bl4eALJv4oUwXpfGMg",
                                "https://www.linkedin.com/company/aynzo/",
                            ],
                            contactPoint: {
                                "@type": "ContactPoint",
                                telephone: "+91-86999-66076",
                                contactType: "customer service",
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
                                    url: "https://safein.aynzo.com/aynzo-logo.png",
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
                        </Providers>
                    </NavigationProgressProvider>
                </ErrorBoundary>
                {process.env.NODE_ENV === "production" && <Analytics />}
            </body>
        </html>
    );
}
