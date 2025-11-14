import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { 
  useGetAppointmentsQuery, 
  useDeleteAppointmentMutation,
  useCheckInAppointmentMutation,
  useCheckOutAppointmentMutation,
  useUpdateAppointmentMutation,
  useRestoreAppointmentMutation,
  useCancelAppointmentMutation,
  Appointment,
  GetAppointmentsQuery 
} from '@/store/api/appointmentApi'
import { useDebounce } from './useDebounce'

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
  appointments: Appointment[]
  pagination: {
    currentPage: number
    totalPages: number
    totalAppointments: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null
  isLoading: boolean
  isDeleting: boolean
  isCheckingOut: boolean
  isApproving: boolean
  isRestoring: boolean
  isCancelling: boolean
  error: any
  searchTerm: string
  statusFilter: string
  employeeFilter: string
  dateFrom: string
  dateTo: string
  currentPage: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: string) => void
  setEmployeeFilter: (employeeId: string) => void
  setDateFrom: (date: string) => void
  setDateTo: (date: string) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setSortBy: (field: string) => void
  setSortOrder: (order: 'asc' | 'desc') => void
  deleteAppointment: (appointmentId: string) => Promise<void>
  checkOutAppointment: (appointmentId: string, notes?: string) => Promise<void>
  approveAppointment: (appointmentId: string) => Promise<void>
  restoreAppointment: (appointmentId: string) => Promise<void>
  cancelAppointment: (appointmentId: string) => Promise<void>
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

  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [employeeFilter, setEmployeeFilter] = useState(initialEmployeeId)
  const [dateFrom, setDateFrom] = useState(initialDateFrom)
  const [dateTo, setDateTo] = useState(initialDateTo)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialLimit)
  const [sortBy, setSortBy] = useState(initialSortBy)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch])

  const queryParams: GetAppointmentsQuery = {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: (statusFilter as Appointment['status']) || undefined,
    employeeId: employeeFilter || undefined,
    startDate: dateFrom || undefined,
    endDate: dateTo || undefined,
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
  const [checkOutAppointmentMutation, { isLoading: isCheckingOut }] = useCheckOutAppointmentMutation()
  const [updateAppointmentMutation, { isLoading: isApproving }] = useUpdateAppointmentMutation()
  const [restoreAppointmentMutation, { isLoading: isRestoring }] = useRestoreAppointmentMutation()
  const [cancelAppointmentMutation, { isLoading: isCancelling }] = useCancelAppointmentMutation()

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


  const checkOutAppointment = async (appointmentId: string, notes?: string): Promise<void> => {
    try {
      await checkOutAppointmentMutation({ appointmentId, notes }).unwrap()
      toast.success('Visitor checked out successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to check out visitor')
      throw error
    }
  }

  const approveAppointment = async (appointmentId: string): Promise<void> => {
    try {
      await updateAppointmentMutation({ 
        id: appointmentId, 
        status: 'approved' 
      }).unwrap()
      toast.success('Appointment approved successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to approve appointment')
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

  const cancelAppointment = async (appointmentId: string): Promise<void> => {
    try {
      await cancelAppointmentMutation(appointmentId).unwrap()
      toast.success('Appointment cancelled successfully')
      refetch()
    } catch (error) {
      toast.error('Failed to cancel appointment')
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

  const handleSearchTerm = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleEmployeeFilter = (employeeId: string) => {
    setEmployeeFilter(employeeId)
    setCurrentPage(1)
  }

  const handleDateFrom = (date: string) => {
    setDateFrom(date)
    setCurrentPage(1)
  }

  const handleDateTo = (date: string) => {
    setDateTo(date)
    setCurrentPage(1)
  }
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
    appointments: appointmentData?.appointments || [],
    pagination: appointmentData?.pagination || null,
    isLoading,
    isDeleting,
    isCheckingOut,
    isApproving,
    isRestoring,
    isCancelling,
    error,
    searchTerm,
    statusFilter,
    employeeFilter,
    dateFrom,
    dateTo,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    setSearchTerm: handleSearchTerm,
    setStatusFilter: handleStatusFilter,
    setEmployeeFilter: handleEmployeeFilter,
    setDateFrom: handleDateFrom,
    setDateTo: handleDateTo,
    setCurrentPage,
    setPageSize,
    setSortBy: handleSortBy,
    setSortOrder: handleSortOrder,
    deleteAppointment,
    checkOutAppointment,
    approveAppointment,
    restoreAppointment,
    cancelAppointment,
    refresh,
    resetFilters
  }
}

export function useAppointmentTrashOperations() {
  const [restoreAppointmentMutation, { isLoading: isRestoring }] = useRestoreAppointmentMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [employeeFilter, setEmployeeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
  }

  return {
    appointments,
    pagination,
    isLoading,
    error,
    searchTerm,
    statusFilter,
    employeeFilter,
    dateFrom,
    dateTo,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    setSearchTerm,
    setStatusFilter,
    setEmployeeFilter,
    setDateFrom,
    setDateTo,
    setCurrentPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    restoreAppointment,
    restoreMultipleAppointments,
    isRestoring,
    refresh
  }
}
