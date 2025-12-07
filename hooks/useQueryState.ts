"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

/**
 * Hook for managing query parameters in URL
 * Provides easy way to read, update, and remove query parameters
 * 
 * @example
 * ```tsx
 * const { getQuery, setQuery, removeQuery } = useQueryState()
 * 
 * // Get query param
 * const planId = getQuery('planId')
 * 
 * // Set query param
 * setQuery('planId', '123')
 * 
 * // Remove query param
 * removeQuery('planId')
 * ```
 */
export function useQueryState() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get query parameter value
  const getQuery = useCallback(
    (key: string): string | null => {
      return searchParams.get(key)
    },
    [searchParams]
  )

  // Get all query parameters as object
  const getAllQueries = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])

  // Set query parameter
  const setQuery = useCallback(
    (key: string, value: string | null, options?: { replace?: boolean }) => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }

      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      if (options?.replace) {
        router.replace(newUrl)
      } else {
        router.push(newUrl)
      }
    },
    [pathname, router, searchParams]
  )

  // Remove query parameter
  const removeQuery = useCallback(
    (key: string, options?: { replace?: boolean }) => {
      setQuery(key, null, options)
    },
    [setQuery]
  )

  // Clear all query parameters
  const clearQueries = useCallback(
    (options?: { replace?: boolean }) => {
      if (options?.replace) {
        router.replace(pathname)
      } else {
        router.push(pathname)
      }
    },
    [pathname, router]
  )

  return {
    getQuery,
    getAllQueries,
    setQuery,
    removeQuery,
    clearQueries,
    searchParams,
  }
}







