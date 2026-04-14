
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4010/api/v1";
export const SUPER_ADMIN_API_URL = process.env.NEXT_PUBLIC_SUPER_ADMIN_API_URL || "http://localhost:4011/api";

// Blog Specific Config
export const BLOG_CATEGORY = "SAFEIN";
export const BLOG_BASE_URL = `${SUPER_ADMIN_API_URL}/blogs`;
