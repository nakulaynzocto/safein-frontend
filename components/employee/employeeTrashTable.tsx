"use client"

import { useState } from "react"
import { EmployeeTable } from "./employeeTable"
import { useEmployeeTrash } from "@/hooks/useEmployeeTrash"

interface EmployeeTrashTableProps {
  onRefresh?: () => void
}

export function EmployeeTrashTable({ onRefresh }: EmployeeTrashTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])


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

  }

  return (
    <EmployeeTable

      employees={employees}
      pagination={pagination || undefined}
      isLoading={isLoading}
      error={error}
      

      searchTerm={searchTerm}
      departmentFilter={departmentFilter}
      currentPage={currentPage}
      pageSize={pageSize}
      sortBy={sortBy}
      sortOrder={sortOrder}
      

      onSearchChange={handleSearchChange}
      onDepartmentFilterChange={handleDepartmentFilterChange}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
      onSortChange={handleSortChange}
      

      mode="trash"
      showSelection={true}
      selectedItems={selectedItems}
      onSelectionChange={setSelectedItems}
      

      onRestore={handleRestore}
      onBulkRestore={handleBulkRestore}
      onView={handleView}
      

      isRestoring={isRestoring}
      

      showHeader={false}
      title="Deleted Employees"
    />
  )
}