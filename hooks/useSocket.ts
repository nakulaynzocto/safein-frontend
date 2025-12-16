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

const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4010/api/v1'
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

  const invalidateAppointments = useCallback(() => {
    dispatch(baseApi.util.invalidateTags([
      'Appointment',
      { type: 'Appointment', id: 'LIST' },
      { type: 'Appointment', id: 'STATS' },
    ]))
  }, [dispatch])

  const connect = useCallback(() => {
    if (socketRef.current?.connected || !token) return

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

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message)
    })

    socket.on(SocketEvents.APPOINTMENT_STATUS_CHANGED, (data) => {
      const { payload } = data
      const status = payload?.status
      const appointmentId = payload?.appointment?.appointmentId || payload?.appointmentId

      if (status === 'approved') {
        dispatch(addNotification({
          type: 'appointment_approved',
          title: 'Appointment Approved! ✅',
          message: `Appointment ${appointmentId} has been approved via email.`,
          appointmentId: appointmentId,
          timestamp: new Date().toISOString(),
        }))
        
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
        
        if (showToasts) {
          toast.error('Appointment Rejected ❌', {
            description: `Appointment ${appointmentId} has been rejected.`,
            duration: 5000,
          })
        }
      }

      invalidateAppointments()
      onAppointmentStatusChanged?.(data)
    })

    socket.on(SocketEvents.APPOINTMENT_UPDATED, (data) => {
      invalidateAppointments()
      onAppointmentUpdated?.(data)
    })

    socket.on(SocketEvents.APPOINTMENT_CREATED, () => {
      invalidateAppointments()
    })

    socket.on(SocketEvents.APPOINTMENT_DELETED, () => {
      invalidateAppointments()
    })

  }, [token, user?.id, onConnect, onDisconnect, onAppointmentStatusChanged, onAppointmentUpdated, invalidateAppointments, showToasts, dispatch])

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
    if (token) {
      connect()
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
