import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { routes } from './utils/routes'

function matchesRoute(pathname: string, routeList: string[]): boolean {
  return routeList.some(route => {
    if (pathname === route) return true

    if (route.includes('[') && route.includes(']')) {
      const pattern = route.replace(/\[.*?\]/g, '[^/]+')
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(pathname)
    }

    return false
  })
}

function extractDynamicRoutePatterns(routeList: string[]): Array<{ basePath: string, staticRoutes: string[] }> {
  const dynamicPatterns: Array<{ basePath: string, staticRoutes: string[] }> = []

  const dynamicRoutes = routeList.filter(route => route.includes('[') && route.includes(']'))

  for (const route of dynamicRoutes) {
    const basePath = route.split('[')[0].replace(/\/$/, '')

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

function isPrivateRoute(pathname: string): boolean {
  const privateRouteValues = Object.values(routes.privateroute)

  if (matchesRoute(pathname, privateRouteValues)) return true

  const dynamicPatterns = extractDynamicRoutePatterns(privateRouteValues)

  for (const pattern of dynamicPatterns) {
    const { basePath, staticRoutes } = pattern

    if (pathname.startsWith(basePath + '/') && pathname !== basePath) {
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

function isPublicRoute(pathname: string): boolean {
  const publicRouteValues = Object.values(routes.publicroute)
  return matchesRoute(pathname, publicRouteValues)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = request.cookies.get('token')?.value

  const isAuthenticated = token && token !== 'undefined' && token.length > 10

  // Always allow these public pages (authenticated or not)
  const alwaysAllowedPages = [
    routes.publicroute.PRICING,
    routes.publicroute.HELP,
    routes.publicroute.HOME,
    routes.publicroute.FEATURES,
    routes.publicroute.CONTACT,
  ]

  if (alwaysAllowedPages.some(page => pathname === page || pathname.startsWith(`${page}/`))) {
    return NextResponse.next()
  }

  // Allow email-action, verify, and book-appointment routes without authentication
  if (
    pathname.startsWith(`${routes.publicroute.EMAIL_ACTION}/`) ||
    pathname.startsWith(`${routes.publicroute.VERIFY}/`) ||
    pathname.startsWith('/book-appointment/')
  ) {
    return NextResponse.next()
  }

  // Allow authenticated users to access subscription-success and subscription-cancel pages
  const subscriptionPages = [
    routes.publicroute.SUBSCRIPTION_SUCCESS,
    routes.publicroute.SUBSCRIPTION_CANCEL,
  ]

  if (isAuthenticated && isPublicRoute(pathname)) {
    // Allow access to subscription pages
    if (subscriptionPages.some(page => pathname === page)) {
      return NextResponse.next()
    }
    // For other public routes, redirect to dashboard
    return NextResponse.redirect(new URL(routes.privateroute.DASHBOARD, request.url))
  }

  if (!isAuthenticated && isPrivateRoute(pathname)) {
    return NextResponse.redirect(new URL(routes.publicroute.LOGIN, request.url))
  }

  return NextResponse.next()
}

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
