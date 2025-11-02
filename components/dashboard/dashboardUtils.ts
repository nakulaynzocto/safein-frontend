import { Appointment } from "@/store/api/appointmentApi"

export interface AppointmentStats {
  totalAppointments: number
  pendingAppointments: number
  approvedAppointments: number
  rejectedAppointments: number
  completedAppointments: number
  todaysAppointments: number
}

export function calculateAppointmentStats(appointments: Appointment[]): AppointmentStats {
  if (!Array.isArray(appointments)) {
    return {
      totalAppointments: 0,
      pendingAppointments: 0,
      approvedAppointments: 0,
      rejectedAppointments: 0,
      completedAppointments: 0,
      todaysAppointments: 0,
    }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const stats = appointments.reduce(
    (acc, appointment) => {
      acc.totalAppointments++
      
      switch (appointment.status) {
        case 'pending':
          acc.pendingAppointments++
          break
        case 'approved':
          acc.approvedAppointments++
          break
        case 'rejected':
          acc.rejectedAppointments++
          break
        case 'completed':
        case 'checked-out':
          acc.completedAppointments++
          break
      }
      
      const appointmentDate = new Date(appointment.appointmentDetails?.scheduledDate || appointment.appointmentDate)
      const appointmentDateOnly = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate()
      )
      
      if (appointmentDateOnly.getTime() === today.getTime()) {
        acc.todaysAppointments++
      }
      
      return acc
    },
    {
      totalAppointments: 0,
      pendingAppointments: 0,
      approvedAppointments: 0,
      rejectedAppointments: 0,
      completedAppointments: 0,
      todaysAppointments: 0,
    }
  )
  
  return stats
}

export function getRecentAppointments(appointments: Appointment[], limit: number = 5): Appointment[] {
  if (!Array.isArray(appointments)) {
    return []
  }
  
  return [...appointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export function getTodaysAppointments(appointments: Appointment[]): Appointment[] {
  if (!Array.isArray(appointments)) {
    return []
  }
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  return appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.appointmentDetails?.scheduledDate || appointment.appointmentDate)
    const appointmentDateOnly = new Date(
      appointmentDate.getFullYear(),
      appointmentDate.getMonth(),
      appointmentDate.getDate()
    )
    
    return appointmentDateOnly.getTime() === today.getTime()
  })
}
