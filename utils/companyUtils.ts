import { routes } from './routes'

export interface CompanyExistenceResult {
  exists: boolean
  error?: string
}

/**
 * Common function to check company existence
 * Used by both middleware and components to avoid duplicate API calls
 */
export async function checkCompanyExists(token: string): Promise<CompanyExistenceResult> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
    const response = await fetch(`${apiUrl}/companies/exists`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      const data = await response.json()
      const exists = data.success ? data.data?.exists : false
      return { exists }
    } else {
      // If API call fails, assume no company exists
      return { exists: false, error: 'API call failed' }
    }
  } catch (error) {
    // If company check fails, assume no company exists
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Determine if user should be redirected based on company existence and current path
 */
export function shouldRedirectForCompanyExistence(
  companyExists: boolean,
  currentPath: string
): { shouldRedirect: boolean; redirectTo?: string } {
  // If company exists and user is trying to access /company/create → redirect to dashboard
  if (companyExists && currentPath === routes.privateroute.COMPANYCREATE) {
    return { shouldRedirect: true, redirectTo: routes.privateroute.DASHBOARD }
  }
  
  // If company doesn't exist and user is trying to access any other private route → redirect to /company/create
  if (!companyExists && currentPath !== routes.privateroute.COMPANYCREATE) {
    return { shouldRedirect: true, redirectTo: routes.privateroute.COMPANYCREATE }
  }
  
  // No redirect needed
  return { shouldRedirect: false }
}
