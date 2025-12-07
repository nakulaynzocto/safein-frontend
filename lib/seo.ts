/**
 * @deprecated This file is deprecated. 
 * Please use:
 * - `seoConfig.ts` for SafeIn-specific SEO configuration
 * - `seoHelpers.ts` for SafeIn-specific SEO helper functions
 * 
 * This file is kept for backward compatibility only.
 */

// Re-export from new files for backward compatibility
export { safeInSEOConfig as baseSEOConfig, safeInPageSEO as pageSEOConfig } from "./seoConfig"
export { generatePageMetadata, generateStructuredData, getPageSEOConfig, getBaseSEOConfig } from "./seoHelpers"
