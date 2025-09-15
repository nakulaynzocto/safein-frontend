// ---------- Dashboard Utils ----------

export const calculateAppointmentStats = (appointments: any[]) => {
  const totalAppointments = appointments.length
  const pendingAppointments = appointments.filter((apt) => apt.status === "pending").length
  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split("T")[0]
    return apt.appointmentDate === today
  }).length
  const completedAppointments = appointments.filter((apt) => apt.status === "completed").length

  return {
    totalAppointments,
    pendingAppointments,
    todayAppointments,
    completedAppointments,
  }
}

export const getRecentAppointments = (appointments: any[], limit: number = 5) => {
  return appointments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export const getTodaysAppointments = (appointments: any[]) => {
  const today = new Date().toISOString().split("T")[0]
  return appointments
    .filter((apt) => apt.appointmentDate === today)
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime))
}
