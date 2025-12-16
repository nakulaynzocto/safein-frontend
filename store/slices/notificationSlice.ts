import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Notification {
  id: string
  type: 'appointment_approved' | 'appointment_rejected' | 'appointment_created' | 'appointment_deleted' | 'general'
  title: string
  message: string
  appointmentId?: string
  timestamp: string
  read: boolean
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'read'>>) => {
      const newNotification: Notification = {
        ...action.payload,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        read: false,
      }
      // Add to beginning of array
      state.notifications.unshift(newNotification)
      state.unreadCount += 1
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50)
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(n => {
        n.read = true
      })
      state.unreadCount = 0
    },
    clearNotifications: (state) => {
      state.notifications = []
      state.unreadCount = 0
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        const notification = state.notifications[index]
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(index, 1)
      }
    },
  },
})

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  removeNotification,
} = notificationSlice.actions

export default notificationSlice.reducer

