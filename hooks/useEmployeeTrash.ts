import { useState } from 'react'
import { toast } from 'sonner'
import { 
  useGetTrashedEmployeesQuery, 
  useRestoreEmployeeMutation,
  Employee,
  GetEmployeesQuery 
} from '@/store/api/employeeApi'

export interface UseEmployeeTrashOptions {
  initialPage?: number
  initialLimit?: number
  initialSearch?: string
  initialDepartment?: string
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
}

export interface UseEmployeeTrashReturn {
  // Data
  employees: Employee[]
  pagination: {
    currentPage: number
    totalPages: number
    totalEmployees: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null
  
  // Loading states
  isLoading: boolean
  isRestoring: boolean
  
  // Error state
  error: any
  
  // Filters and pagination
  searchTerm: string
  departmentFilter: string
  currentPage: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  
  // Actions
  setSearchTerm: (term: string) => void
  setDepartmentFilter: (department: string) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setSortBy: (field: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  
  // Employee operations
  restoreEmployee: (employeeId: string) => Promise<void>
  restoreMultipleEmployees: (employeeIds: string[]) => Promise<void>
  
  // Utility functions
  refresh: () => void
  resetFilters: () => void
}

export function useEmployeeTrash(options: UseEmployeeTrashOptions = {}): UseEmployeeTrashReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = '',
    initialDepartment = '',
    initialSortBy = 'createdAt',
    initialSortOrder = 'desc'
  } = options

  // Local state
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartment)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialLimit)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)

  // API queries
  const queryParams: GetEmployeesQuery = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    department: departmentFilter || undefined,
    sortBy,
    sortOrder
  }

  const { 
    data: trashData, 
    isLoading, 
    error, 
    refetch 
  } = useGetTrashedEmployeesQuery(queryParams)

  const [restoreEmployeeMutation, { isLoading: isRestoring }] = useRestoreEmployeeMutation()

  // Actions
  const restoreEmployee = async (employeeId: string): Promise<void> => {
    try {
      await restoreEmployeeMutation(employeeId).unwrap()
      toast.success('Employee restored successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to restore employee')
      throw error
    }
  }

  const restoreMultipleEmployees = async (employeeIds: string[]): Promise<void> => {
    try {
      const restorePromises = employeeIds.map(id => restoreEmployeeMutation(id).unwrap())
      await Promise.all(restorePromises)
      toast.success(`${employeeIds.length} employee(s) restored successfully`)
      refetch()
    } catch (error) {
      toast.error('Failed to restore some employees')
      throw error
    }
  }

  const refresh = () => {
    refetch()
  }

  const resetFilters = () => {
    setSearchTerm('')
    setDepartmentFilter('')
    setCurrentPage(1)
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  // Handle search with debouncing
  const handleSearchTerm = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle department filter
  const handleDepartmentFilter = (department: string) => {
    setDepartmentFilter(department)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle sort
  const handleSortBy = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleSortOrder = (order: 'asc' | 'desc') => {
    setSortOrder(order)
  }

  return {
    // Data
    employees: trashData?.employees || [],
    pagination: trashData?.pagination || null,
    
    // Loading states
    isLoading,
    isRestoring,
    
    // Error state
    error,
    
    // Filters and pagination
    searchTerm,
    departmentFilter,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    
    // Actions
    setSearchTerm: handleSearchTerm,
    setDepartmentFilter: handleDepartmentFilter,
    setCurrentPage,
    setPageSize,
    setSortBy: handleSortBy,
    setSortOrder: handleSortOrder,
    
    // Employee operations
    restoreEmployee,
    restoreMultipleEmployees,
    
    // Utility functions
    refresh,
    resetFilters
  }
}

// Hook for individual employee trash operations
export function useEmployeeTrashActions() {
  const [restoreEmployeeMutation, { isLoading: isRestoring }] = useRestoreEmployeeMutation()

  const restoreEmployee = async (employeeId: string): Promise<void> => {
    try {
      await restoreEmployeeMutation(employeeId).unwrap()
      toast.success('Employee restored successfully')
    } catch (error) {
      toast.error('Failed to restore employee')
      throw error
    }
  }

  const restoreMultipleEmployees = async (employeeIds: string[]): Promise<void> => {
    try {
      const restorePromises = employeeIds.map(id => restoreEmployeeMutation(id).unwrap())
      await Promise.all(restorePromises)
      toast.success(`${employeeIds.length} employee(s) restored successfully`)
    } catch (error) {
      toast.error('Failed to restore some employees')
      throw error
    }
  }

  return {
    restoreEmployee,
    restoreMultipleEmployees,
    isRestoring
  }
}
