'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppSelector } from '@/store/hooks'
import { baseApi } from '@/store/api/baseApi'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { addNotification } from '@/store/slices/notificationSlice'

export enum SocketEvents {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  JOIN_USER_ROOM = 'join_user_room',
  LEAVE_USER_ROOM = 'leave_user_room',
  APPOINTMENT_UPDATED = 'appointment_updated',
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_DELETED = 'appointment_deleted',
  APPOINTMENT_STATUS_CHANGED = 'appointment_status_changed',
  NEW_NOTIFICATION = 'new_notification',
}

interface UseSocketOptions {
  onAppointmentUpdated?: (data: any) => void
  onAppointmentStatusChanged?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  showToasts?: boolean
}

type NotificationType = 'appointment_created' | 'appointment_approved' | 'appointment_rejected'

interface NotificationConfig {
  type: NotificationType
  title: string
  message: string
  toastType: 'success' | 'error' | 'info'
}

// Helper: Get socket URL from environment
const getSocketUrl = (): string | null => {
  if (process.env.NEXT_PUBLIC_DISABLE_SOCKET === 'true') {
    return null
  }
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api/v1'
  if (!apiUrl || apiUrl === 'undefined') {
    return null
  }
  
  return apiUrl.replace('/api/v1', '')
}

// Helper: Extract names from payload (backend always provides these)
const extractNames = (payload: any): { employeeName: string; visitorName: string } => {
  if (payload?.employeeName && payload?.visitorName) {
    return {
      employeeName: payload.employeeName,
      visitorName: payload.visitorName
    }
  }

  // Fallback (shouldn't happen in normal flow)
  return {
    employeeName: payload?.appointment?.employeeId?.name || payload?.appointment?.employee?.name || 'Unknown Employee',
    visitorName: payload?.appointment?.visitorId?.name || payload?.appointment?.visitor?.name || 'Unknown Visitor'
  }
}

// Helper: Get notification config based on status
const getNotificationConfig = (status: string, employeeName: string, visitorName: string): NotificationConfig => {
  const configs: Record<string, NotificationConfig> = {
    pending: {
      type: 'appointment_created',
      title: 'New Appointment Request 📅',
      message: `${visitorName} has requested an appointment with ${employeeName}.`,
      toastType: 'info'
    },
    approved: {
      type: 'appointment_approved',
      title: 'Appointment Approved! ✅',
      message: `${employeeName} has approved the appointment for ${visitorName}.`,
      toastType: 'success'
    },
    rejected: {
      type: 'appointment_rejected',
      title: 'Appointment Rejected ❌',
      message: `${employeeName} has rejected the appointment for ${visitorName}.`,
      toastType: 'error'
    },
    completed: {
      type: 'appointment_created',
      title: 'Appointment Completed ✓',
      message: `Appointment for ${visitorName} with ${employeeName} has been completed.`,
      toastType: 'success'
    }
  }

  return configs[status] || configs.pending
}

// Helper: Show toast notification
const showToast = (config: NotificationConfig) => {
  const toastOptions = {
    description: config.message,
    duration: 5000
  }

  switch (config.toastType) {
    case 'success':
      toast.success(config.title, toastOptions)
      break
    case 'error':
      toast.error(config.title, toastOptions)
      break
    case 'info':
      toast.info(config.title, toastOptions)
      break
  }
}

// Helper: Add notification to store
const createNotification = (config: NotificationConfig, appointmentId: string) => {
  return {
    type: config.type,
    title: config.title,
    message: config.message,
    appointmentId,
    timestamp: new Date().toISOString()
  }
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    onAppointmentUpdated,
    onAppointmentStatusChanged,
    onConnect,
    onDisconnect,
    showToasts = true
  } = options

  const socketRef = useRef<Socket | null>(null)
  const dispatch = useDispatch()
  const { token, user } = useAppSelector((state) => state.auth)
  const isConnectedRef = useRef(false)

  const invalidateAppointments = useCallback(() => {
    dispatch(baseApi.util.invalidateTags([
      'Appointment',
      { type: 'Appointment', id: 'LIST' },
      { type: 'Appointment', id: 'STATS' },
    ]))
  }, [dispatch])

  // Handle appointment status change
  const handleAppointmentStatusChange = useCallback((data: any) => {
    const { payload } = data
    const appointmentId = payload?.appointment?._id || payload?.appointmentId || ''
    
    if (!appointmentId || typeof appointmentId !== 'string' || !appointmentId.trim()) {
      invalidateAppointments()
      onAppointmentStatusChanged?.(data)
      return
    }

    const { employeeName, visitorName } = extractNames(payload)
    const status = payload?.status

    if (status === 'approved' || status === 'rejected') {
      const config = getNotificationConfig(status, employeeName, visitorName)
      
      dispatch(addNotification(createNotification(config, appointmentId)))
      
      if (showToasts) {
        showToast(config)
      }
    }

    invalidateAppointments()
    onAppointmentStatusChanged?.(data)
  }, [dispatch, showToasts, invalidateAppointments, onAppointmentStatusChanged])

  // Handle appointment created
  const handleAppointmentCreated = useCallback((data: any) => {
    const { payload } = data
    const appointmentId = payload?.appointment?._id || payload?.appointmentId || ''
    const status = payload?.appointment?.status || payload?.status || 'pending'
    
    if (!appointmentId || typeof appointmentId !== 'string' || !appointmentId.trim()) {
      invalidateAppointments()
      return
    }

    const { employeeName, visitorName } = extractNames(payload)
    const config = getNotificationConfig(status, employeeName, visitorName)

    dispatch(addNotification(createNotification(config, appointmentId)))
    
    if (showToasts) {
      showToast(config)
    }

    invalidateAppointments()
  }, [dispatch, showToasts, invalidateAppointments])

  // Handle appointment updated
  const handleAppointmentUpdated = useCallback((data: any) => {
    invalidateAppointments()
    onAppointmentUpdated?.(data)
  }, [invalidateAppointments, onAppointmentUpdated])

  // Handle appointment deleted
  const handleAppointmentDeleted = useCallback(() => {
    invalidateAppointments()
  }, [invalidateAppointments])

  const connect = useCallback(() => {
    if (socketRef.current?.connected || !token) return

    const socketUrl = getSocketUrl()
    if (!socketUrl) return

    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      isConnectedRef.current = true
      if (user?.id) {
        socket.emit(SocketEvents.JOIN_USER_ROOM, user.id)
      }
      onConnect?.()
    })

    socket.on('disconnect', (reason) => {
      isConnectedRef.current = false
      onDisconnect?.(reason)
    })

    socket.on('connect_error', () => {
      // Socket is optional for app functionality
    })

    socket.on(SocketEvents.APPOINTMENT_STATUS_CHANGED, handleAppointmentStatusChange)
    socket.on(SocketEvents.APPOINTMENT_CREATED, handleAppointmentCreated)
    socket.on(SocketEvents.APPOINTMENT_UPDATED, handleAppointmentUpdated)
    socket.on(SocketEvents.APPOINTMENT_DELETED, handleAppointmentDeleted)

  }, [
    token,
    user?.id,
    onConnect,
    onDisconnect,
    handleAppointmentStatusChange,
    handleAppointmentCreated,
    handleAppointmentUpdated,
    handleAppointmentDeleted
  ])

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (user?.id) {
        socketRef.current.emit(SocketEvents.LEAVE_USER_ROOM, user.id)
      }
      socketRef.current.disconnect()
      socketRef.current = null
      isConnectedRef.current = false
    }
  }, [user?.id])

  useEffect(() => {
    if (typeof window !== 'undefined' && token) {
      const timeoutId = setTimeout(() => {
        connect()
      }, 1000)

      return () => {
        clearTimeout(timeoutId)
        disconnect()
      }
    }
    
    return () => {
      disconnect()
    }
  }, [token, connect, disconnect])

  return {
    isConnected: isConnectedRef.current,
    socket: socketRef.current,
    connect,
    disconnect,
    invalidateAppointments,
  }
}

export function useAppointmentSocket() {
  return useSocket({ showToasts: true })
}
