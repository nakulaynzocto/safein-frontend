import { useState } from 'react'
import { toast } from 'sonner'
import { 
  useGetAppointmentsQuery, 
  useDeleteAppointmentMutation,
  useCheckInAppointmentMutation,
  useCheckOutAppointmentMutation,
  useRestoreAppointmentMutation,
  Appointment,
  GetAppointmentsQuery 
} from '@/store/api/appointmentApi'

export interface UseAppointmentOperationsOptions {
  initialPage?: number
  initialLimit?: number
  initialSearch?: string
  initialStatus?: string
  initialEmployeeId?: string
  initialDateFrom?: string
  initialDateTo?: string
  initialSortBy?: string
  initialSortOrder?: 'asc' | 'desc'
}

export interface UseAppointmentOperationsReturn {
  // Data
  appointments: Appointment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalAppointments: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null
  
  // Loading states
  isLoading: boolean
  isDeleting: boolean
  isCheckingIn: boolean
  isCheckingOut: boolean
  isRestoring: boolean
  
  // Error state
  error: any
  
  // Filters and pagination
  searchTerm: string
  statusFilter: string
  employeeFilter: string
  dateFrom: string
  dateTo: string
  currentPage: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  
  // Actions
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: string) => void
  setEmployeeFilter: (employeeId: string) => void
  setDateFrom: (date: string) => void
  setDateTo: (date: string) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setSortBy: (field: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  
  // Appointment operations
  deleteAppointment: (appointmentId: string) => Promise<void>
  checkInAppointment: (appointmentId: string) => Promise<void>
  checkOutAppointment: (appointmentId: string) => Promise<void>
  restoreAppointment: (appointmentId: string) => Promise<void>
  
  // Utility functions
  refresh: () => void
  resetFilters: () => void
}

export function useAppointmentOperations(options: UseAppointmentOperationsOptions = {}): UseAppointmentOperationsReturn {
  const {
    initialPage = 1,
    initialLimit = 10,
    initialSearch = '',
    initialStatus = '',
    initialEmployeeId = '',
    initialDateFrom = '',
    initialDateTo = '',
    initialSortBy = 'createdAt',
    initialSortOrder = 'desc'
  } = options

  // Local state
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [employeeFilter, setEmployeeFilter] = useState(initialEmployeeId)
  const [dateFrom, setDateFrom] = useState(initialDateFrom)
  const [dateTo, setDateTo] = useState(initialDateTo)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialLimit)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)

  // API queries
  const queryParams: GetAppointmentsQuery = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    status: (statusFilter as Appointment['status']) || undefined,
    employeeId: employeeFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy,
    sortOrder
  }

  const { 
    data: appointmentData, 
    isLoading, 
    error, 
    refetch 
  } = useGetAppointmentsQuery(queryParams)

  const [deleteAppointmentMutation, { isLoading: isDeleting }] = useDeleteAppointmentMutation()
  const [checkInAppointmentMutation, { isLoading: isCheckingIn }] = useCheckInAppointmentMutation()
  const [checkOutAppointmentMutation, { isLoading: isCheckingOut }] = useCheckOutAppointmentMutation()
  const [restoreAppointmentMutation, { isLoading: isRestoring }] = useRestoreAppointmentMutation()

  // Actions
  const deleteAppointment = async (appointmentId: string): Promise<void> => {
    try {
      await deleteAppointmentMutation(appointmentId).unwrap()
      toast.success('Appointment deleted successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to delete appointment')
      throw error
    }
  }

  const checkInAppointment = async (appointmentId: string): Promise<void> => {
    try {
      await checkInAppointmentMutation({ appointmentId }).unwrap()
      toast.success('Visitor checked in successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to check in visitor')
      throw error
    }
  }

  const checkOutAppointment = async (appointmentId: string): Promise<void> => {
    try {
      await checkOutAppointmentMutation({ appointmentId }).unwrap()
      toast.success('Visitor checked out successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to check out visitor')
      throw error
    }
  }

  const restoreAppointment = async (appointmentId: string): Promise<void> => {
    try {
      await restoreAppointmentMutation(appointmentId).unwrap()
      toast.success('Appointment restored successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to restore appointment')
      throw error
    }
  }

  const refresh = () => {
    refetch()
  }

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setEmployeeFilter('')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  // Handle search with debouncing
  const handleSearchTerm = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle employee filter
  const handleEmployeeFilter = (employeeId: string) => {
    setEmployeeFilter(employeeId)
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle date filters
  const handleDateFrom = (date: string) => {
    setDateFrom(date)
    setCurrentPage(1)
  }

  const handleDateTo = (date: string) => {
    setDateTo(date)
    setCurrentPage(1)
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
    appointments: appointmentData?.appointments || [],
    pagination: appointmentData?.pagination || null,
    
    // Loading states
    isLoading,
    isDeleting,
    isCheckingIn,
    isCheckingOut,
    isRestoring,
    
    // Error state
    error,
    
    // Filters and pagination
    searchTerm,
    statusFilter,
    employeeFilter,
    dateFrom,
    dateTo,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    
    // Actions
    setSearchTerm: handleSearchTerm,
    setStatusFilter: handleStatusFilter,
    setEmployeeFilter: handleEmployeeFilter,
    setDateFrom: handleDateFrom,
    setDateTo: handleDateTo,
    setCurrentPage,
    setPageSize,
    setSortBy: handleSortBy,
    setSortOrder: handleSortOrder,
    
    // Appointment operations
    deleteAppointment,
    checkInAppointment,
    checkOutAppointment,
    restoreAppointment,
    
    // Utility functions
    refresh,
    resetFilters
  }
}

// Hook for appointment trash operations
export function useAppointmentTrashOperations() {
  const [restoreAppointmentMutation, { isLoading: isRestoring }] = useRestoreAppointmentMutation()

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Mock data for trashed appointments (replace with actual API call)
  const appointments: Appointment[] = []
  const pagination = {
    currentPage: 1,
    totalPages: 1,
    totalAppointments: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
  const isLoading = false
  const error = null

  const restoreAppointment = async (appointmentId: string): Promise<void> => {
    try {
      await restoreAppointmentMutation(appointmentId).unwrap()
      toast.success('Appointment restored successfully')
    } catch (error) {
      toast.error('Failed to restore appointment')
      throw error
    }
  }

  const restoreMultipleAppointments = async (appointmentIds: string[]): Promise<void> => {
    try {
      const restorePromises = appointmentIds.map(id => restoreAppointmentMutation(id).unwrap())
      await Promise.all(restorePromises)
      toast.success(`${appointmentIds.length} appointment(s) restored successfully`)
    } catch (error) {
      toast.error('Failed to restore some appointments')
      throw error
    }
  }

  const refresh = () => {
    // TODO: Implement refresh logic
  }

  return {
    // Data
    appointments,
    pagination,
    isLoading,
    error,
    
    // Filters and pagination
    searchTerm,
    statusFilter,
    employeeFilter,
    dateFrom,
    dateTo,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    
    // Actions
    setSearchTerm,
    setStatusFilter,
    setEmployeeFilter,
    setDateFrom,
    setDateTo,
    setCurrentPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    
    // Operations
    restoreAppointment,
    restoreMultipleAppointments,
    isRestoring,
    refresh
  }
}
