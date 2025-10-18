"use client"

import { useState } from "react"
import { EmployeeTable } from "./employeeTable"
import { useEmployeeTrash } from "@/hooks/useEmployeeTrash"

interface EmployeeTrashTableProps {
  onRefresh?: () => void
}

export function EmployeeTrashTable({ onRefresh }: EmployeeTrashTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Use custom hook for employee trash operations
  const {
    employees,
    pagination,
    isLoading,
    isRestoring,
    error,
    searchTerm,
    departmentFilter,
    currentPage,
    pageSize,
    sortBy,
    sortOrder,
    setSearchTerm,
    setDepartmentFilter,
    setCurrentPage,
    setPageSize,
    setSortBy,
    setSortOrder,
    restoreEmployee,
    restoreMultipleEmployees,
    refresh
  } = useEmployeeTrash()

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value === "all" ? "" : value)
  }

  const handleSortChange = (field: string) => {
    setSortBy(field)
  }

  const handleRestore = async (employeeId: string) => {
    try {
      await restoreEmployee(employeeId)
      onRefresh?.()
    } catch (error) {
      console.error("Restore error:", error)
    }
  }

  const handleBulkRestore = async (employeeIds: string[]) => {
    try {
      await restoreMultipleEmployees(employeeIds)
      onRefresh?.()
    } catch (error) {
      console.error("Bulk restore error:", error)
    }
  }

  const handleView = (employee: any) => {
    // View functionality is handled by the EmployeeTable component
  }

  return (
    <EmployeeTable
      // Data
      employees={employees}
      pagination={pagination || undefined}
      isLoading={isLoading}
      error={error}
      
      // Filters and pagination
      searchTerm={searchTerm}
      departmentFilter={departmentFilter}
      currentPage={currentPage}
      pageSize={pageSize}
      sortBy={sortBy}
      sortOrder={sortOrder}
      
      // Actions
      onSearchChange={handleSearchChange}
      onDepartmentFilterChange={handleDepartmentFilterChange}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onSortChange={handleSortChange}
      
      // Table configuration
      mode="trash"
      showSelection={true}
      selectedItems={selectedItems}
      onSelectionChange={setSelectedItems}
      
      // Actions
      onRestore={handleRestore}
      onBulkRestore={handleBulkRestore}
      onView={handleView}
      
      // Loading states
      isRestoring={isRestoring}
      
      // Optional props
      showHeader={false}
      title="Deleted Employees"
    />
  )
}