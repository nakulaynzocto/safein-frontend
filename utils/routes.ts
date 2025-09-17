
export const routes = {
  publicroute: {
    HOME: "/",
    LOGIN: "/login",
    REGISTER: "/register",
  },

  privateroute: {
    COMPANYCREATE: "/company/create",
    DASHBOARD: "/dashboard",
    PROFILE: "/profile",
    SETTINGS: "/settings",
    EMPLOYEECREATE: "/employee/create",
    EMPLOYEELIST: "/employee/list",
    EMPLOYEETRASH: "/employee/trash",
    EMPLOYEEEDIT: "/employee/[id]", // Dynamic route pattern
    APPOINTMENTCREATE: "/appointment/create",
    APPOINTMENTLIST: "/appointment/list",
    APPOINTMENTTRASH: "/appointment/trash",
    TRASH: "/trash",
  },
} as const

// Type definitions for better TypeScript support
export type PublicRoute = typeof routes.publicroute[keyof typeof routes.publicroute]
export type PrivateRoute = typeof routes.privateroute[keyof typeof routes.privateroute]
export type AllRoutes = PublicRoute | PrivateRoute

// Helper functions for route access
export const getPublicRoute = (key: keyof typeof routes.publicroute): PublicRoute => {
  return routes.publicroute[key]
}

export const getPrivateRoute = (key: keyof typeof routes.privateroute): PrivateRoute => {
  return routes.privateroute[key]
}

// Route validation helpers
export const isPublicRoute = (path: string): boolean => {
  return Object.values(routes.publicroute).includes(path as PublicRoute)
}

export const isPrivateRoute = (path: string): boolean => {
  // Check exact matches first
  if (Object.values(routes.privateroute).includes(path as PrivateRoute)) {
    return true
  }
  
  // Check dynamic route patterns
  // Employee edit route: /employee/[id]
  if (path.startsWith('/employee/') && path !== '/employee/create' && path !== '/employee/list' && path !== '/employee/trash') {
    return true
  }
  
  return false
}

// Route key helpers
export const getPublicRouteKey = (path: string): keyof typeof routes.publicroute | null => {
  const entry = Object.entries(routes.publicroute).find(([_, value]) => value === path)
  return entry ? (entry[0] as keyof typeof routes.publicroute) : null
}

export const getPrivateRouteKey = (path: string): keyof typeof routes.privateroute | null => {
  const entry = Object.entries(routes.privateroute).find(([_, value]) => value === path)
  return entry ? (entry[0] as keyof typeof routes.privateroute) : null
}

// Export individual route objects for convenience
export const publicRoutes = routes.publicroute
export const privateRoutes = routes.privateroute
