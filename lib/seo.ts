import type { Metadata } from "next"

// Base SEO configuration
export const baseSEOConfig = {
  siteName: "SafeIn",
  siteUrl: "http://safein.aynzo.com",
  description: "SafeIn is a comprehensive visitor management and appointment scheduling system designed for modern businesses. Streamline visitor check-ins, manage appointments, and enhance security with our professional platform.",
  keywords: [
    "visitor management",
    "appointment scheduling", 
    "security management",
    "visitor check-in",
    "appointment booking",
    "visitor registration",
    "security system",
    "business management",
    "visitor tracking",
    "appointment management"
  ],
  author: "SafeIn Team",
  creator: "SafeIn",
  publisher: "SafeIn",
  themeColor: "#3882a5",
  twitterHandle: "@safein",
}

// Page-specific SEO configurations
export const pageSEOConfig = {
  home: {
    title: "SafeIn - Professional Visitor Management & Appointment System",
    description: "Transform your visitor management with SafeIn's comprehensive appointment scheduling system. Streamline check-ins, manage visitors, and enhance security with our professional platform. Start your free 3-day trial today!",
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
      "SafeIn management"
    ],
    openGraph: {
      title: "SafeIn - Professional Visitor Management & Appointment System",
      description: "Transform your visitor management with SafeIn's comprehensive appointment scheduling system. Streamline check-ins, manage visitors, and enhance security with our professional platform.",
      type: "website",
      url: "http://safein.aynzo.com",
      images: [
        {
          url: "/og-home.jpg",
          width: 1200,
          height: 630,
          alt: "SafeIn - Visitor Management System",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "SafeIn - Professional Visitor Management & Appointment System",
      description: "Transform your visitor management with SafeIn's comprehensive appointment scheduling system. Streamline check-ins, manage visitors, and enhance security.",
      images: ["/twitter-home.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  },
  
  dashboard: {
    title: "Dashboard",
    description: "Manage your visitor appointments, track analytics, and oversee your security operations from the SafeIn dashboard.",
    keywords: [
      "dashboard",
      "visitor management dashboard",
      "appointment analytics",
      "security overview",
      "visitor statistics",
      "appointment tracking"
    ],
    robots: {
      index: false,
      follow: false,
    },
  },
  
  login: {
    title: "Login",
    description: "Sign in to your SafeIn account to access visitor management and appointment scheduling features.",
    keywords: [
      "login",
      "sign in",
      "visitor management login",
      "appointment system login",
      "SafeIn login",
      "secure login"
    ],
    robots: {
      index: false,
      follow: false,
    },
  },
  
  register: {
    title: "Register",
    description: "Create your SafeIn account to start managing visitors and appointments with our professional visitor management system.",
    keywords: [
      "register",
      "sign up",
      "create account",
      "visitor management registration",
      "appointment system signup",
      "SafeIn registration",
      "free account"
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
  
  contact: {
    title: "Contact Us",
    description: "Get in touch with SafeIn support team for assistance with visitor management and appointment scheduling solutions.",
    keywords: [
      "contact",
      "support",
      "help",
      "visitor management support",
      "appointment system help",
      "SafeIn contact",
      "customer service"
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
  
  pricing: {
    title: "Pricing Plans",
    description: "Choose the perfect SafeIn plan for your business. Flexible pricing options for visitor management and appointment scheduling.",
    keywords: [
      "pricing",
      "plans",
      "subscription",
      "visitor management pricing",
      "appointment system cost",
      "SafeIn pricing",
      "business plans"
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
  
  features: {
    title: "Features",
    description: "Discover SafeIn's powerful features for visitor management, appointment scheduling, and security analytics.",
    keywords: [
      "features",
      "capabilities",
      "visitor management features",
      "appointment system features",
      "SafeIn features",
      "security features"
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
  
  help: {
    title: "Help & Support",
    description: "Get help with SafeIn visitor management system. Find guides, tutorials, and support resources.",
    keywords: [
      "help",
      "support",
      "documentation",
      "tutorials",
      "guides",
      "visitor management help",
      "SafeIn support"
    ],
    robots: {
      index: true,
      follow: true,
    },
  },
}

// Generate metadata for a specific page
export function generatePageMetadata(pageKey: keyof typeof pageSEOConfig): Metadata {
  const pageConfig = pageSEOConfig[pageKey]
  
  return {
    title: {
      default: pageConfig.title,
      template: "%s | SafeIn"
    },
    description: pageConfig.description,
    keywords: pageConfig.keywords,
    authors: [{ name: baseSEOConfig.author }],
    creator: baseSEOConfig.creator,
    publisher: baseSEOConfig.publisher,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseSEOConfig.siteUrl),
    alternates: {
      canonical: pageKey === 'home' ? 'http://safein.aynzo.com' : `http://safein.aynzo.com/${pageKey}`,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: `${baseSEOConfig.siteUrl}${pageKey === 'home' ? '' : `/${pageKey}`}`,
      title: pageConfig.title,
      description: pageConfig.description,
      siteName: baseSEOConfig.siteName,
      images: pageConfig.openGraph?.images || [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "SafeIn - Visitor Management System",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageConfig.title,
      description: pageConfig.description,
      images: pageConfig.twitter?.images || ['/twitter-image.jpg'],
      creator: baseSEOConfig.twitterHandle,
    },
    robots: pageConfig.robots,
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
      yahoo: 'your-yahoo-verification-code',
    },
  }
}

// Generate structured data for a specific page
export function generateStructuredData(pageKey: keyof typeof pageSEOConfig) {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": baseSEOConfig.siteName,
    "description": baseSEOConfig.description,
    "url": baseSEOConfig.siteUrl,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free trial available"
    },
    "author": {
      "@type": "Organization",
      "name": baseSEOConfig.author
    },
    "publisher": {
      "@type": "Organization",
      "name": baseSEOConfig.publisher,
      "url": baseSEOConfig.siteUrl
    },
    "featureList": [
      "Visitor Management",
      "Appointment Scheduling", 
      "Security Management",
      "Visitor Check-in",
      "Appointment Booking",
      "Visitor Registration",
      "Real-time Tracking"
    ]
  }

  // Add page-specific structured data
  switch (pageKey) {
    case 'home':
      return {
        ...baseStructuredData,
        "@type": "WebSite",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseSEOConfig.siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      }
    
    case 'contact':
      return {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact SafeIn",
        "description": pageSEOConfig.contact.description,
        "url": "http://safein.aynzo.com/contact",
        "mainEntity": {
          "@type": "Organization",
          "name": baseSEOConfig.siteName,
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-123-4567",
            "contactType": "customer service",
            "email": "support@safein.app"
          }
        }
      }
    
    case 'pricing':
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "SafeIn Visitor Management System",
        "description": "Professional visitor management and appointment scheduling system",
        "offers": [
          {
            "@type": "Offer",
            "name": "Basic Plan",
            "price": "29",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "29",
              "priceCurrency": "USD",
              "unitText": "MONTH"
            }
          },
          {
            "@type": "Offer",
            "name": "Professional Plan",
            "price": "79",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "79",
              "priceCurrency": "USD",
              "unitText": "MONTH"
            }
          },
          {
            "@type": "Offer",
            "name": "Enterprise Plan",
            "price": "199",
            "priceCurrency": "USD",
            "priceSpecification": {
              "@type": "UnitPriceSpecification",
              "price": "199",
              "priceCurrency": "USD",
              "unitText": "MONTH"
            }
          }
        ]
      }
    
    default:
      return baseStructuredData
  }
}
