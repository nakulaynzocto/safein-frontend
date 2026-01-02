
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
    VERIFY: "/verify",

    // Subscription
    SUBSCRIPTION_SUCCESS: "/subscription/success",
    SUBSCRIPTION_CANCEL: "/subscription/cancel",

    // Email Actions
    EMAIL_ACTION: "/email-action",
  },

  privateroute: {
    // Dashboard
    DASHBOARD: "/dashboard",

    // Employee Routes
    EMPLOYEELIST: "/employee/list",
    EMPLOYEECREATE: "/employee/create",
    EMPLOYEEEDIT: "/employee/[id]", // Dynamic route pattern

    // Visitor Routes
    VISITORLIST: "/visitor/list",
    VISITORREGISTRATION: "/visitor/register",
    VISITOREDIT: "/visitor/[id]", // Dynamic route pattern

    // Appointment Routes
    APPOINTMENTLIST: "/appointment/list",
    APPOINTMENTCREATE: "/appointment/create",
    APPOINTMENTEDIT: "/appointment/[id]", // Dynamic route pattern
    APPOINTMENT_LINKS: "/appointment-links",

    // Settings Routes
    SETTINGS: "/settings",
    PROFILE: "/settings/profile",
    NOTIFICATIONS: "/settings/notifications",
    SETTINGS_STATUS: "/settings/status",
    ACTIVE_PLAN: "/settings/plan",
  },
} as const

export type PublicRoute = typeof routes.publicroute[keyof typeof routes.publicroute]
export type PrivateRoute = typeof routes.privateroute[keyof typeof routes.privateroute]
export type AllRoutes = PublicRoute | PrivateRoute

export const getPublicRoute = (key: keyof typeof routes.publicroute): PublicRoute => {
  return routes.publicroute[key]
}

export const getPrivateRoute = (key: keyof typeof routes.privateroute): PrivateRoute => {
  return routes.privateroute[key]
}

export const isPublicRoute = (path: string): boolean => {
  return Object.values(routes.publicroute).includes(path as PublicRoute)
}

export const isPrivateRoute = (path: string): boolean => {
  if (Object.values(routes.privateroute).includes(path as PrivateRoute)) {
    return true
  }

  if (path.startsWith('/employee/') && path !== routes.privateroute.EMPLOYEELIST) {
    return true
  }

  if (path.startsWith('/appointment/') && path !== routes.privateroute.APPOINTMENTLIST) {
    return true
  }

  if (path.startsWith('/visitor/') && path !== routes.privateroute.VISITORLIST && path !== routes.privateroute.VISITORREGISTRATION) {
    return true
  }

  if (path.startsWith('/settings/')) {
    return true
  }

  if (path === routes.privateroute.APPOINTMENT_LINKS || path.startsWith('/appointment-links')) {
    return true
  }

  return false
}

export const getPublicRouteKey = (path: string): keyof typeof routes.publicroute | null => {
  const entry = Object.entries(routes.publicroute).find(([_, value]) => value === path)
  return entry ? (entry[0] as keyof typeof routes.publicroute) : null
}

export const getPrivateRouteKey = (path: string): keyof typeof routes.privateroute | null => {
  const entry = Object.entries(routes.privateroute).find(([_, value]) => value === path)
  return entry ? (entry[0] as keyof typeof routes.privateroute) : null
}

export const publicRoutes = routes.publicroute
export const privateRoutes = routes.privateroute
