import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routes, isPrivateRoute, isPublicRoute } from "./utils/routes";

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get("safein_auth_token")?.value;

    const isAuthenticated = token && token !== "undefined" && token.length > 10;

    // 1. Check if it's a Private Route
    const isPrivate = isPrivateRoute(pathname);

    // 2. Check if it's a Public Route
    const isPublic = isPublicRoute(pathname);

    // Always allow these public pages (authenticated or not)
    const alwaysAllowedPages = [
        routes.publicroute.PRICING,
        routes.publicroute.HELP,
        routes.publicroute.HOME,
        routes.publicroute.FEATURES,
        routes.publicroute.CONTACT,
        routes.publicroute.PRIVACY_POLICY,
    ];

    if (alwaysAllowedPages.some((page) => pathname === page || pathname.startsWith(`${page}/`))) {
        return NextResponse.next();
    }

    // Special handling for subscription pages (Needs to be accessible even if logged in)
    const subscriptionPages = [routes.publicroute.SUBSCRIPTION_SUCCESS, routes.publicroute.SUBSCRIPTION_CANCEL];
    if (subscriptionPages.some((page) => pathname === page)) {
        return NextResponse.next();
    }

    // AUTH LOGIC
    if (isAuthenticated) {
        // If logged in and trying to access login/register/forgot-password etc.
        if (isPublic && !subscriptionPages.includes(pathname as any)) {
            return NextResponse.redirect(new URL(routes.privateroute.DASHBOARD, request.url));
        }
        return NextResponse.next();
    } else {
        // If NOT logged in and trying to access a private route
        if (isPrivate) {
            return NextResponse.redirect(new URL(routes.publicroute.LOGIN, request.url));
        }
        return NextResponse.next();
    }
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
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
