"use client"

import { useState, useCallback, useMemo } from "react"

/**
 * Hook for managing loading states with multiple operations
 * Useful when you have multiple async operations and need to track their states
 * 
 * @example
 * ```tsx
 * const { isLoading, setLoading, loadingStates } = useLoadingState()
 * 
 * // Set loading for specific operation
 * setLoading('fetching', true)
 * 
 * // Check if any operation is loading
 * if (isLoading) { ... }
 * 
 * // Check specific operation
 * if (loadingStates.fetching) { ... }
 * ```
 */
export function useLoadingState(initialStates: Record<string, boolean> = {}) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(initialStates)

  // Set loading state for a specific key
  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  // Set multiple loading states at once
  const setLoadingStatesBatch = useCallback((states: Record<string, boolean>) => {
    setLoadingStates((prev) => ({
      ...prev,
      ...states,
    }))
  }, [])

  // Check if any operation is loading
  const isLoading = useMemo(() => {
    return Object.values(loadingStates).some((loading) => loading === true)
  }, [loadingStates])

  // Check if specific operation is loading
  const isOperationLoading = useCallback(
    (key: string): boolean => {
      return loadingStates[key] === true
    },
    [loadingStates]
  )

  // Reset all loading states
  const resetLoading = useCallback(() => {
    setLoadingStates({})
  }, [])

  return {
    isLoading,
    loadingStates,
    setLoading,
    setLoadingStatesBatch,
    isOperationLoading,
    resetLoading,
  }
}

/**
 * Hook for managing async operation with loading, error, and success states
 * 
 * @example
 * ```tsx
 * const { execute, isLoading, error, isSuccess } = useAsyncOperation(async () => {
 *   const result = await someAsyncFunction()
 *   return result
 * })
 * 
 * const handleClick = async () => {
 *   const result = await execute()
 *   if (result) {
 *     // Handle success
 *   }
 * }
 * ```
 */
export function useAsyncOperation<T extends (...args: any[]) => Promise<any>>(
  operation: T
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const execute = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
      setIsLoading(true)
      setError(null)
      setIsSuccess(false)

      try {
        const result = await operation(...args)
        setIsSuccess(true)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        setIsSuccess(false)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [operation]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setIsSuccess(false)
  }, [])

  return {
    execute,
    isLoading,
    error,
    isSuccess,
    reset,
  }
}







