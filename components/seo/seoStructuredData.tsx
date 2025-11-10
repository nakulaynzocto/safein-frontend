"use client"

import { generateStructuredData } from "@/lib/seo"

interface SEOStructuredDataProps {
  pageKey: 'home' | 'dashboard' | 'login' | 'register' | 'contact' | 'pricing' | 'features' | 'help'
}

export function SEOStructuredData({ pageKey }: SEOStructuredDataProps) {
  const structuredData = generateStructuredData(pageKey)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}












