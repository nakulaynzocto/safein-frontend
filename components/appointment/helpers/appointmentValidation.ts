/**
 * Validation schema for appointment form
 */
import * as yup from "yup"

export const appointmentSchema = yup.object({
  visitorId: yup.string().required("Please select a visitor"),
  employeeId: yup.string().required("Please select an employee"),
  purpose: yup.string().required("Purpose of visit is required").min(5, "Purpose must be at least 5 characters"),
  appointmentDate: yup.string().required("Appointment date is required").test('future-date', 'Scheduled date cannot be in the past', function(value) {
    if (!value) return false
    
    try {
      // Handle different date formats (YYYY-MM-DD or DD/MM/YYYY)
      let dateStr = value
      if (dateStr.includes('/')) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      
      const selectedDate = new Date(dateStr + 'T00:00:00')
      if (isNaN(selectedDate.getTime())) {
        return false
      }
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      selectedDate.setHours(0, 0, 0, 0)
      
      return selectedDate >= today
    } catch (error) {
      return false
    }
  }),
  appointmentTime: yup.string().required("Appointment time is required").test('future-time', 'Scheduled time cannot be in the past', function(value) {
    if (!value) return false
    const appointmentDate = this.parent.appointmentDate
    if (!appointmentDate) return true
    
    try {
      // Handle different date formats
      let dateStr = appointmentDate
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`
        }
      }
      
      const selectedDateTime = new Date(`${dateStr}T${value}`)
      if (isNaN(selectedDateTime.getTime())) {
        return true // If date parsing fails, skip time validation
      }
      
      const now = new Date()
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(dateStr + 'T00:00:00')
      selectedDate.setHours(0, 0, 0, 0)
      
      // Only validate time if the date is today
      if (selectedDate.getTime() === today.getTime()) {
        return selectedDateTime > now
      }
      
      return true
    } catch (error) {
      return true // If validation fails, allow it (date validation will catch it)
    }
  }),
  accompanyingCount: yup
    .number()
    .typeError("Please enter a valid number")
    .min(0, "Accompanying people cannot be negative")
    .max(20, "Accompanying people cannot exceed 20")
    .default(0),
  notes: yup.string().optional().default(""),
  vehicleNumber: yup.string().optional().default(""),
  vehiclePhoto: yup.string().optional().default(""),
})

export type AppointmentFormData = yup.InferType<typeof appointmentSchema>


