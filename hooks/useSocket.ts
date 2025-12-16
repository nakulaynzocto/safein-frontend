'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppSelector } from '@/store/hooks'
import { baseApi } from '@/store/api/baseApi'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import { addNotification } from '@/store/slices/notificationSlice'

// Socket events enum (must match backend)
export enum SocketEvents {
  // Connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  
  // Room events
  JOIN_USER_ROOM = 'join_user_room',
  LEAVE_USER_ROOM = 'leave_user_room',
  
  // Appointment events
  APPOINTMENT_UPDATED = 'appointment_updated',
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_DELETED = 'appointment_deleted',
  APPOINTMENT_STATUS_CHANGED = 'appointment_status_changed',
  
  // Notification events
  NEW_NOTIFICATION = 'new_notification',
}

// Get WebSocket URL from API URL
const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api/v1'
  // Remove /api/v1 from the URL for WebSocket connection
  return apiUrl.replace('/api/v1', '')
}

interface UseSocketOptions {
  onAppointmentUpdated?: (data: any) => void
  onAppointmentStatusChanged?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  showToasts?: boolean
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

  // Invalidate appointment cache to refetch data
  const invalidateAppointments = useCallback(() => {
    dispatch(baseApi.util.invalidateTags(['Appointment']))
  }, [dispatch])

  // Connect to socket
  const connect = useCallback(() => {
    if (socketRef.current?.connected || !token) {
      return
    }

    const socketUrl = getSocketUrl()
    
    socketRef.current = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    const socket = socketRef.current

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket.id)
      isConnectedRef.current = true
      
      // Join user-specific room
      if (user?.id) {
        socket.emit(SocketEvents.JOIN_USER_ROOM, user.id)
      }

      onConnect?.()
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      isConnectedRef.current = false
      onDisconnect?.(reason)
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message)
    })

    // Appointment events
    socket.on(SocketEvents.APPOINTMENT_STATUS_CHANGED, (data) => {
      console.log('📩 Appointment status changed:', data)
      
      const { payload } = data
      const status = payload?.status
      const appointmentId = payload?.appointment?.appointmentId || payload?.appointmentId

      // Add notification to store
      if (status === 'approved') {
        dispatch(addNotification({
          type: 'appointment_approved',
          title: 'Appointment Approved! ✅',
          message: `Appointment ${appointmentId} has been approved via email.`,
          appointmentId: appointmentId,
          timestamp: new Date().toISOString(),
        }))
        
        // Show toast notification
        if (showToasts) {
          toast.success('Appointment Approved! ✅', {
            description: `Appointment ${appointmentId} has been approved.`,
            duration: 5000,
          })
        }
      } else if (status === 'rejected') {
        dispatch(addNotification({
          type: 'appointment_rejected',
          title: 'Appointment Rejected ❌',
          message: `Appointment ${appointmentId} has been rejected via email.`,
          appointmentId: appointmentId,
          timestamp: new Date().toISOString(),
        }))
        
        // Show toast notification
        if (showToasts) {
          toast.error('Appointment Rejected ❌', {
            description: `Appointment ${appointmentId} has been rejected.`,
            duration: 5000,
          })
        }
      }

      // Invalidate cache to refetch
      invalidateAppointments()
      
      // Call custom handler
      onAppointmentStatusChanged?.(data)
    })

    socket.on(SocketEvents.APPOINTMENT_UPDATED, (data) => {
      console.log('📩 Appointment updated:', data)
      
      // Invalidate cache to refetch
      invalidateAppointments()
      
      // Call custom handler
      onAppointmentUpdated?.(data)
    })

    socket.on(SocketEvents.APPOINTMENT_CREATED, (data) => {
      console.log('📩 New appointment created:', data)
      invalidateAppointments()
    })

    socket.on(SocketEvents.APPOINTMENT_DELETED, (data) => {
      console.log('📩 Appointment deleted:', data)
      invalidateAppointments()
    })

  }, [token, user?.id, onConnect, onDisconnect, onAppointmentStatusChanged, onAppointmentUpdated, invalidateAppointments, showToasts])

  // Disconnect from socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      // Leave user room before disconnecting
      if (user?.id) {
        socketRef.current.emit(SocketEvents.LEAVE_USER_ROOM, user.id)
      }
      
      socketRef.current.disconnect()
      socketRef.current = null
      isConnectedRef.current = false
    }
  }, [user?.id])

  // Auto-connect when token is available
  useEffect(() => {
    if (token) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [token, connect, disconnect])

  // Return socket status and methods
  return {
    isConnected: isConnectedRef.current,
    socket: socketRef.current,
    connect,
    disconnect,
    invalidateAppointments,
  }
}

// Hook specifically for appointments real-time updates
export function useAppointmentSocket() {
  return useSocket({
    showToasts: true,
  })
}

