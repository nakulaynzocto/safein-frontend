# RTK Query Migration Documentation

## Overview

This project has been successfully migrated from Redux Toolkit with async thunks to RTK Query for all API operations. This migration provides better caching, automatic refetching, optimistic updates, and improved developer experience.

## Architecture Changes

### Before (Redux Toolkit with Async Thunks)
- Separate slices for each feature (auth, employee, appointment)
- Manual API calls using fetch in async thunks
- Manual loading states and error handling
- No automatic caching or refetching

### After (RTK Query)
- Centralized API services using RTK Query
- Automatic caching and background refetching
- Built-in loading states and error handling
- Optimistic updates and cache invalidation

## New File Structure

```
store/
├── api/
│   ├── baseApi.ts          # Base RTK Query configuration
│   ├── authApi.ts          # Authentication API endpoints
│   ├── employeeApi.ts      # Employee management API endpoints
│   ├── appointmentApi.ts   # Appointment management API endpoints
│   └── index.ts           # Exports all API services
├── slices/
│   └── authSlice.ts       # Simplified auth slice (no async thunks)
└── store.ts               # Updated store configuration
```

## API Services

### Base API Configuration (`store/api/baseApi.ts`)
- Configures base URL and headers
- Handles authentication tokens automatically
- Defines tag types for cache invalidation
- Sets up common middleware

### Authentication API (`store/api/authApi.ts`)
- `useLoginMutation()` - User login
- `useRegisterMutation()` - User registration
- `useGetCurrentUserQuery()` - Get current user info
- `useLogoutMutation()` - User logout

### Employee API (`store/api/employeeApi.ts`)
- `useGetEmployeesQuery()` - Fetch all employees
- `useGetEmployeeQuery(id)` - Fetch single employee
- `useCreateEmployeeMutation()` - Create new employee
- `useUpdateEmployeeMutation()` - Update employee
- `useDeleteEmployeeMutation()` - Delete employee
- `useGetTrashedEmployeesQuery()` - Fetch trashed employees
- `useRestoreEmployeeMutation()` - Restore employee from trash

### Appointment API (`store/api/appointmentApi.ts`)
- `useGetAppointmentsQuery()` - Fetch all appointments
- `useGetAppointmentQuery(id)` - Fetch single appointment
- `useCreateAppointmentMutation()` - Create new appointment
- `useUpdateAppointmentMutation()` - Update appointment
- `useUpdateAppointmentStatusMutation()` - Update appointment status
- `useDeleteAppointmentMutation()` - Delete appointment
- `useGetTrashedAppointmentsQuery()` - Fetch trashed appointments
- `useRestoreAppointmentMutation()` - Restore appointment from trash
- `useGetAppointmentsByEmployeeQuery(employeeId)` - Fetch appointments by employee

## Component Updates

All components have been updated to use RTK Query hooks instead of Redux actions:

### Authentication Components
- `components/auth/login-form.tsx` - Uses `useLoginMutation()`
- `components/auth/register-form.tsx` - Uses `useRegisterMutation()`

### Employee Components
- `components/employee/employee-form.tsx` - Uses `useCreateEmployeeMutation()`
- `components/employee/employee-list.tsx` - Uses `useGetEmployeesQuery()` and `useDeleteEmployeeMutation()`

### Appointment Components
- `components/appointment/appointment-form.tsx` - Uses `useCreateAppointmentMutation()` and `useGetEmployeesQuery()`
- `components/appointment/appointment-list.tsx` - Uses `useGetAppointmentsQuery()` and `useUpdateAppointmentStatusMutation()`

### Dashboard Component
- `components/dashboard/dashboard-overview.tsx` - Uses `useGetAppointmentsQuery()` and `useGetEmployeesQuery()`

## Key Benefits

### 1. Automatic Caching
- Data is automatically cached and shared across components
- No need to manually manage loading states for cached data

### 2. Background Refetching
- Data is automatically refetched when the window regains focus
- Configurable refetch intervals

### 3. Optimistic Updates
- UI updates immediately while API call is in progress
- Automatic rollback on error

### 4. Cache Invalidation
- Automatic cache invalidation when data is modified
- Tag-based invalidation system

### 5. Better Error Handling
- Consistent error handling across all API calls
- Built-in retry logic

### 6. TypeScript Support
- Full type safety for all API operations
- Auto-generated types for requests and responses

## Usage Examples

### Query Hook (Read Operations)
```typescript
const { data: employees, isLoading, error } = useGetEmployeesQuery()

// With options
const { data: employee } = useGetEmployeeQuery(employeeId, {
  skip: !employeeId, // Skip query if no ID
})
```

### Mutation Hook (Write Operations)
```typescript
const [createEmployee, { isLoading, error }] = useCreateEmployeeMutation()

const handleSubmit = async (data) => {
  try {
    await createEmployee(data).unwrap()
    // Success handling
  } catch (error) {
    // Error handling
  }
}
```

### Cache Invalidation
```typescript
// Automatically invalidates 'Employee' tags
const [updateEmployee] = useUpdateEmployeeMutation()

// Manual invalidation
dispatch(employeeApi.util.invalidateTags(['Employee']))
```

## Migration Checklist

- [x] Create base API configuration
- [x] Create authentication API service
- [x] Create employee API service
- [x] Create appointment API service
- [x] Update store configuration
- [x] Simplify auth slice
- [x] Update login form component
- [x] Update register form component
- [x] Update employee form component
- [x] Update employee list component
- [x] Update appointment form component
- [x] Update appointment list component
- [x] Update dashboard component
- [x] Remove old API utilities
- [x] Remove old slice files
- [x] Test all functionality

## Best Practices

1. **Use Query Hooks for Read Operations**: Always use query hooks for fetching data
2. **Use Mutation Hooks for Write Operations**: Use mutation hooks for create, update, delete operations
3. **Handle Loading States**: RTK Query provides loading states automatically
4. **Handle Errors**: Always wrap mutations in try-catch blocks
5. **Use Cache Tags**: Properly tag your data for automatic invalidation
6. **Skip Queries When Appropriate**: Use the `skip` option to conditionally run queries

## Future Enhancements

- Add pagination support
- Implement real-time updates with WebSocket
- Add offline support
- Implement optimistic updates for better UX
- Add more sophisticated caching strategies

