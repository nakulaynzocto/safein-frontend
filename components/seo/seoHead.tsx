"use client"

interface SEOHeadProps {
  pageKey: 'home' | 'dashboard' | 'login' | 'register' | 'contact' | 'pricing' | 'features' | 'help'
}

export function SEOHead({ pageKey }: SEOHeadProps) {
  return (
    <>
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Theme Colors */}
      <meta name="theme-color" content="#3882a5" />
      <meta name="msapplication-TileColor" content="#3882a5" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Page-specific meta tags */}
      {pageKey === 'home' && (
        <>
          <meta name="google-site-verification" content="your-google-verification-code" />
          <meta name="yandex-verification" content="your-yandex-verification-code" />
          <meta name="yahoo-site-verification" content="your-yahoo-verification-code" />
        </>
      )}
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS prefetch for better performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    </>
  )
}


