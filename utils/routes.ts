export const routes = {
    publicroute: {
        // Main Pages
        HOME: "/",
        FEATURES: "/features",
        PRICING: "/pricing",
        CONTACT: "/contact",
        HELP: "/help",
        PRIVACY_POLICY: "/privacy-policy",

        // Authentication
        LOGIN: "/login",
        REGISTER: "/register",
        FORGOT_PASSWORD: "/forgot-password",
        RESET_PASSWORD: "/reset-password",
        VERIFY: "/verify/[token]",

        // Subscription
        SUBSCRIPTION_SUCCESS: "/subscription/success",
        SUBSCRIPTION_CANCEL: "/subscription/cancel",

        // Email Actions
        EMAIL_ACTION: "/email-action/[action]/[id]",

        // Employee Setup
        EMPLOYEE_SETUP: "/employee-setup",

        // Appointment Booking (Missing previously)
        BOOK_APPOINTMENT: "/book-appointment/[token]",
    },

    privateroute: {
        // Dashboard
        DASHBOARD: "/dashboard",

        // Employee Routes
        EMPLOYEELIST: "/employee/list",
        EMPLOYEECREATE: "/employee/create",
        EMPLOYEEEDIT: "/employee/[id]",

        // Visitor Routes
        VISITORLIST: "/visitor/list",
        VISITORREGISTRATION: "/visitor/register",
        VISITOREDIT: "/visitor/[id]",

        // Appointment Routes
        APPOINTMENTLIST: "/appointment/list",
        APPOINTMENTCREATE: "/appointment/create",
        APPOINTMENTEDIT: "/appointment/[id]",
        APPOINTMENT_REQUESTS: "/appointment/requests",
        APPOINTMENT_LINKS: "/appointment-links",

        // Settings Routes
        SETTINGS: "/settings",
        PROFILE: "/settings/profile",
        SETTINGS_WHATSAPP: "/settings/whatsapp",
        SETTINGS_SMTP: "/settings/smtp",
        SPOT_PASS: "/spot-pass",
        SPOT_PASS_CREATE: "/spot-pass/create",
        MESSAGES: "/messages",
    },
} as const;

export type PublicRoute = (typeof routes.publicroute)[keyof typeof routes.publicroute];
export type PrivateRoute = (typeof routes.privateroute)[keyof typeof routes.privateroute];
export type AllRoutes = PublicRoute | PrivateRoute;

/**
 * Utility to check if a path matches a route template (handles [id])
 */
const matchesPattern = (path: string, pattern: string): boolean => {
    if (path === pattern) return true;
    if (!pattern.includes('[')) return false;

    // Replace [anything] with a regex that matches any character except /
    const regexPattern = `^${pattern.replace(/\[.*?\]/g, '[^/]+')}$`;
    return new RegExp(regexPattern).test(path);
};

export const getPublicRoute = (key: keyof typeof routes.publicroute): PublicRoute => {
    return routes.publicroute[key];
};

export const getPrivateRoute = (key: keyof typeof routes.privateroute): PrivateRoute => {
    return routes.privateroute[key];
};

/**
 * Replace dynamic segments in a route (e.g., /employee/[id] -> /employee/123)
 */
export const fillRoute = (route: string, params: Record<string, string | number>): string => {
    let result = route;
    Object.entries(params).forEach(([key, value]) => {
        result = result.replace(`[${key}]`, String(value));
    });
    return result;
};

export const isPublicRoute = (path: string): boolean => {
    return Object.values(routes.publicroute).some(route => matchesPattern(path, route));
};

export const isPrivateRoute = (path: string): boolean => {
    // 1. Check if it matches any defined private route (including dynamic ones)
    const matchesExplicitPrivate = Object.values(routes.privateroute).some(route =>
        matchesPattern(path, route)
    );

    if (matchesExplicitPrivate) return true;

    // 2. Catch-all for sub-pages of private sections, but explicitly exclude public routes
    // This adds a layer of security for unlisted sub-routes
    const privatePrefixes = ["/dashboard", "/employee/", "/visitor/", "/appointment/", "/settings/", "/appointment-links"];
    const hasPrivatePrefix = privatePrefixes.some(prefix => path.startsWith(prefix));

    if (hasPrivatePrefix) {
        // Double check: if it's explicitly public, it's NOT private
        const isExplicitlyPublic = isPublicRoute(path);
        return !isExplicitlyPublic;
    }

    return false;
};

export const getPublicRouteKey = (path: string): keyof typeof routes.publicroute | null => {
    const entry = Object.entries(routes.publicroute).find(([_, value]) => matchesPattern(path, value));
    return entry ? (entry[0] as keyof typeof routes.publicroute) : null;
};

export const getPrivateRouteKey = (path: string): keyof typeof routes.privateroute | null => {
    const entry = Object.entries(routes.privateroute).find(([_, value]) => matchesPattern(path, value));
    return entry ? (entry[0] as keyof typeof routes.privateroute) : null;
};

export const publicRoutes = routes.publicroute;
export const privateRoutes = routes.privateroute;

/**
 * Check if the route is strictly for guests (unauthenticated users).
 * Authenticated users should typically be redirected to dashboard from these pages.
 */
export const isGuestOnlyRoute = (path: string): boolean => {
    const guestOnlyPages = [
        routes.publicroute.LOGIN,
        routes.publicroute.REGISTER,
        routes.publicroute.FORGOT_PASSWORD,
        routes.publicroute.RESET_PASSWORD,
    ];
    // Check exact match or sub-path (e.g. /login/something)
    return guestOnlyPages.some(page => path === page || path.startsWith(`${page}/`));
};

/**
 * Check if the route is a public action route (like verifying email, booking appointment).
 * These routes should be accessible even if the user is authenticated.
 */
export const isPublicActionRoute = (path: string): boolean => {
    return (
        path.startsWith("/verify/") ||
        path.startsWith("/book-appointment/") ||
        path.startsWith("/email-action/") ||
        path.startsWith("/employee-setup")
    );
};
