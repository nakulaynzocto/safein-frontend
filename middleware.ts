import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routes } from './utils/routes'

// Helper function to check if a path matches a route pattern
function matchesRoute(pathname: string, routeList: string[]): boolean {
  return routeList.some(route => {
    // Exact match
    if (pathname === route) return true
    
    // Dynamic route patterns
    if (route.includes('[') && route.includes(']')) {
      const pattern = route.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }
    
    return false
  })
}

// Helper function to extract dynamic route patterns from routes
// This automatically detects dynamic routes like /employee/[id], /visitor/[id], etc.
// and finds their corresponding static routes to exclude them from dynamic matching
function extractDynamicRoutePatterns(routeList: string[]): Array<{basePath: string, staticRoutes: string[]}> {
  const dynamicPatterns: Array<{basePath: string, staticRoutes: string[]}> = []
  
  // Find all dynamic routes (routes containing [id], [slug], etc.)
  const dynamicRoutes = routeList.filter(route => route.includes('[') && route.includes(']'))
  
  for (const route of dynamicRoutes) {
    // Extract base path before the dynamic segment
    // e.g., "/employee/[id]" -> "/employee"
    const basePath = route.split('[')[0].replace(/\/$/, '')
    
    // Find all static routes under the same base path
    // e.g., for "/employee" base: ["/employee/create", "/employee/list", "/employee/trash"]
    const staticRoutes = routeList.filter(r => 
      r.startsWith(basePath + '/') && !r.includes('[')
    )
    
    dynamicPatterns.push({
      basePath,
      staticRoutes
    })
  }
  
  return dynamicPatterns
}

// Helper function to check if a path is a private route
function isPrivateRoute(pathname: string): boolean {
  // Get all private route values
  const privateRouteValues = Object.values(routes.privateroute)
  
  // Check exact matches first
  if (matchesRoute(pathname, privateRouteValues)) return true
  
  // Get dynamic route patterns from routes.ts
  const dynamicPatterns = extractDynamicRoutePatterns(privateRouteValues)
  
  // Check each dynamic pattern
  for (const pattern of dynamicPatterns) {
    const { basePath, staticRoutes } = pattern
    
    // Check if pathname starts with base path and has additional segments
    if (pathname.startsWith(basePath + '/') && pathname !== basePath) {
      // Check if it's not one of the static routes for this base path
      const isStaticRoute = staticRoutes.some(staticRoute => {
        return pathname === staticRoute || pathname.startsWith(staticRoute + '/')
      })
      
      if (!isStaticRoute) {
        return true
      }
    }
  }
  
  return false
}

// Helper function to check if a path is a public route
function isPublicRoute(pathname: string): boolean {
  const publicRouteValues = Object.values(routes.publicroute)
  return matchesRoute(pathname, publicRouteValues)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookies
  const token = request.cookies.get('token')?.value
  
  // Check if user is authenticated (has valid token)
  const isAuthenticated = token && token !== 'undefined' && token.length > 10
  
  // DYNAMIC ROUTE PROTECTION:
  // - Automatically detects all routes from routes.ts
  // - Handles dynamic routes like /employee/[id], /visitor/[id] dynamically
  // - No hardcoded route patterns - everything comes from routes.ts
  
  // If user is authenticated and trying to access public routes (login, register, home)
  if (isAuthenticated && isPublicRoute(pathname)) {
    // Redirect to dashboard using the route constant
    return NextResponse.redirect(new URL(routes.privateroute.DASHBOARD, request.url))
  }
  
  // If user is not authenticated and trying to access private routes
  // This includes dynamic routes like /employee/123, /visitor/456, etc.
  if (!isAuthenticated && isPrivateRoute(pathname)) {
    // Redirect to login using the route constant
    return NextResponse.redirect(new URL(routes.publicroute.LOGIN, request.url))
  }
  
  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
