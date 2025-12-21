import { Appointment } from "@/store/api/appointmentApi"
import { getAppointmentStatus, getAppointmentStatsKey } from "@/utils/helpers"

export interface AppointmentStats {
  totalAppointments: number
  pendingAppointments: number
  approvedAppointments: number
  rejectedAppointments: number
  completedAppointments: number
  todaysAppointments: number
  timeOutAppointments: number
}

export function calculateAppointmentStats(
  appointments: Appointment[]
): AppointmentStats {
  if (!Array.isArray(appointments) || appointments.length === 0) {
    return {
      totalAppointments: 0,
      pendingAppointments: 0,
      approvedAppointments: 0,
      rejectedAppointments: 0,
      completedAppointments: 0,
      todaysAppointments: 0,
      timeOutAppointments: 0,
    }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const stats = appointments.reduce<AppointmentStats>(
    (acc, appointment) => {
      const scheduledDate = appointment.appointmentDetails?.scheduledDate
      const appointmentDate = scheduledDate ? new Date(scheduledDate) : now
      const appointmentDateOnly = new Date(
        appointmentDate.getFullYear(),
        appointmentDate.getMonth(),
        appointmentDate.getDate()
      )

      acc.totalAppointments++
      
      if (appointmentDateOnly.getTime() === today.getTime()) {
        acc.todaysAppointments++
      }

      const effectiveStatus = getAppointmentStatus(appointment as any) as Appointment['status'] | 'time_out'
      
      if (effectiveStatus === 'time_out') {
        acc.timeOutAppointments++
      } else {
        const statusKey = getAppointmentStatsKey(effectiveStatus)
        acc[statusKey]++
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
      timeOutAppointments: 0,
    }
  )
  
  const { pendingAppointments, approvedAppointments, rejectedAppointments, completedAppointments, timeOutAppointments } = stats
  const calculatedTotal = pendingAppointments + approvedAppointments + rejectedAppointments + completedAppointments + timeOutAppointments
  
  return calculatedTotal !== stats.totalAppointments
    ? { ...stats, totalAppointments: calculatedTotal }
    : stats
}

