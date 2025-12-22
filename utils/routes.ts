
export const routes = {
  publicroute: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
    FEATURES: "/features",
    PRICING: "/pricing",
    CONTACT: "/contact",
    HELP: "/help",
    SUBSCRIPTION_PLAN: "/subscription-plan",
    SUBSCRIPTION_SUCCESS: "/subscription/success",
    SUBSCRIPTION_CANCEL: "/subscription/cancel",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    VERIFY: "/verify",
    EMAIL_ACTION: "/email-action",
    PRIVACY_POLICY: "/privacy-policy",
    TERMS_OF_SERVICE: "/terms-of-service",
    FREE_TRIAL_PLAN_ID: "FREE_TRIAL_PLAN_ID_PLACEHOLDER", // This should be replaced with the actual ID from the backend
  },

  privateroute: {
    DASHBOARD: "/dashboard",
    NOTIFICATIONS: "/settings/notifications",
    PROFILE: "/settings/profile",
    SETTINGS: "/settings/status",
    ACTIVE_PLAN: "/settings/plan",
    EMPLOYEECREATE: "/employee/create",
    EMPLOYEELIST: "/employee/list",
    EMPLOYEEEDIT: "/employee/[id]", // Dynamic route pattern
    APPOINTMENTCREATE: "/appointment/create",
    APPOINTMENTLIST: "/appointment/list",
    APPOINTMENTEDIT: "/appointment/[id]", // Dynamic route pattern
    VISITORLIST: "/visitor/list",
    VISITORREGISTRATION: "/visitor/register",
    VISITOREDIT: "/visitor/[id]", // Dynamic route pattern
    TRASH: "/trash",
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
  
  if (path.startsWith('/appointment/') && path !== routes.privateroute.APPOINTMENTCREATE && path !== routes.privateroute.APPOINTMENTLIST) {
    return true
  }
  
  if (path.startsWith('/visitor/') && path !== routes.privateroute.VISITORLIST && path !== routes.privateroute.VISITORREGISTRATION) {
    return true
  }
  
  if (path.startsWith('/settings/')) {
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
