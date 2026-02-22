/**
 * SafeIn Visitor Management System - SEO Configuration
 * Site-specific SEO settings for SafeIn by Aynzo
 */

export const safeInSEOConfig = {
    siteName: "SafeIn by Aynzo",
    siteUrl: "https://safein.aynzo.com",
    logoUrl: "https://safein.aynzo.com/aynzo-logo.png",
    description:
        "SafeIn is India's best visitor management and appointment scheduling system. professional visitor check-ins, society security, and business appointment management platform by Aynzo.",
    keywords: [
        "best visitor management system in india",
        "visitor management software india",
        "gatekeeper app india",
        "society visitor management",
        "appointment scheduling software india",
        "security management system india",
        "digital visitor register india",
        "office visitor tracking software",
        "safein india",
        "aynzo visitor system",
        "smart appointment app india",
        "visitor check-in system india",
    ],
    author: "Aynzo",
    creator: "Aynzo",
    publisher: "Aynzo",
    themeColor: "#3882a5",
    twitterHandle: "@aynzo",
    softwareApplication: {
        name: "SafeIn Visitor Management",
        operatingSystem: "Web/Android/iOS",
        applicationCategory: "SecurityApplication, BusinessApplication",
        offers: {
            "@type": "Offer",
            price: "499",
            priceCurrency: "INR",
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            ratingCount: "1250",
        },
    },
    localBusiness: {
        "@type": "SecurityService",
        name: "SafeIn by Aynzo",
        image: "https://safein.aynzo.com/aynzo-logo.png",
        priceRange: "₹₹",
        address: {
            "@type": "PostalAddress",
            streetAddress: "Phase 8B, Industrial Area",
            addressLocality: "Mohali",
            addressRegion: "Punjab",
            postalCode: "160071",
            addressCountry: "IN",
        },
        geo: {
            "@type": "GeoCoordinates",
            latitude: 30.7046,
            longitude: 76.7179,
        },
        openingHoursSpecification: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "09:00",
            closes: "19:00",
        },
    },
    organization: {
        name: "Aynzo",
        url: "https://aynzo.com",
        logo: "https://safein.aynzo.com/aynzo-logo.png",
        address: {
            "@type": "PostalAddress",
            "addressLocality": "Mohali",
            "addressRegion": "Punjab",
            "postalCode": "160071",
            "addressCountry": "IN"
        },
        contactPoint: {
            telephone: "+91 86999 66076",
            email: "support@aynzo.com",
            contactType: "customer service",
            areaServed: "IN",
            availableLanguage: "en"
        },
        sameAs: [
            "https://www.facebook.com/profile.php?id=61579388700386",
            "https://www.instagram.com/aynzo.world",
            "https://x.com/aynzoworld",
            "https://www.youtube.com/channel/UC7lY7bl4eALJv4oUwXpfGMg",
            "https://www.linkedin.com/company/aynzo/",
        ],
    },
};

// Page-specific SEO configurations for SafeIn
export const safeInPageSEO = {
    home: {
        title: "Best Visitor Management System in India | SafeIn by Aynzo",
        description:
            "SafeIn is the leading visitor management & appointment system in India. Optimize security with smart check-ins, spot passes, and real-time chat. Start your free 3-day trial and transform your business security today!",
        keywords: [
            "best visitor management system in india",
            "appointment scheduling software india",
            "visitor check-in system india",
            "security management platform mohali",
            "gatekeeper app for societies india",
            "digital visitor register app",
            "smart visitor tracking india",
            "business security solutions india",
            "office appointment system india",
            "SafeIn management",
            "Aynzo India",
        ],
        path: "/",
    },
    contact: {
        title: "Contact SafeIn India - Visitor Management Support",
        description:
            "Get in touch with SafeIn India support. We provide 24/7 assistance for visitor management and appointment scheduling solutions across India.",
        keywords: [
            "contact safein",
            "safein india support",
            "visitor management help india",
            "appointment system support mohali",
            "safein customer care india",
        ],
        path: "/contact",
    },
    pricing: {
        title: "SafeIn Pricing - Best Visitor Management System Costs India",
        description:
            "Flexible pricing plans for SafeIn visitor management in India. Choose the best plan for your office or housing society with a free 3-day trial.",
        keywords: [
            "visitor management pricing india",
            "safein plan costs",
            "subscription plans india",
            "affordable visitor system india",
            "gatekeeper app pricing",
        ],
        path: "/pricing",
    },
    features: {
        title: "SafeIn Features - Smart Visitor Management & Security India",
        description:
            "Explore powerful features of SafeIn: Real-time chat, Spot Pass, Smart Notifications, and Advanced Analytics for Indian businesses.",
        keywords: [
            "safein features",
            "visitor management capabilities",
            "spot pass system india",
            "visitor analytics india",
            "smart security notifications",
        ],
        path: "/features",
    },
    help: {
        title: "SafeIn Help Center - Guide to Visitor Management",
        description: "Learn how to use SafeIn visitor management system with our comprehensive guides and tutorials for Indian users.",
        keywords: [
            "safein help",
            "visitor management guide",
            "appointment system tutorial",
            "safein support resources",
        ],
        path: "/help",
    },
    login: {
        title: "Login - SafeIn Visitor Management India",
        description: "Sign in to your SafeIn account to manage visitors and appointments securely from anywhere in India.",
        keywords: [
            "safein login",
            "visitor management sign in",
            "secure login safein",
        ],
        path: "/login",
        noindex: true,
    },
    register: {
        title: "Register SafeIn - Start Your 3-Day Free Trial",
        description:
            "Join SafeIn today. Create an account to start managing visitors and appointments with India's most trusted security platform.",
        keywords: [
            "register safein",
            "sign up visitor management",
            "free trial safein india",
        ],
        path: "/register",
    },
    dashboard: {
        title: "Dashboard - SafeIn Visitor Management",
        description:
            "Monitor visitor appointments, track security analytics, and manage staff from your SafeIn dashboard.",
        keywords: [
            "safein dashboard",
            "visitor analytics dashboard",
            "security control panel",
        ],
        path: "/dashboard",
        noindex: true,
    },
};
