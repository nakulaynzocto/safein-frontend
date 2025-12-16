'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdownMenu'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { 
  markAsRead, 
  markAllAsRead, 
  removeNotification,
  clearNotifications,
  Notification 
} from '@/store/slices/notificationSlice'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { routes } from '@/utils/routes'

interface NotificationBellProps {
  className?: string
  iconClassName?: string
}

export function NotificationBell({ className, iconClassName }: NotificationBellProps) {
  const dispatch = useAppDispatch()
  const { notifications, unreadCount } = useAppSelector((state) => state.notification)
  const [isOpen, setIsOpen] = useState(false)

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const handleRemove = (id: string) => {
    dispatch(removeNotification(id))
  }

  const handleClearAll = () => {
    dispatch(clearNotifications())
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment_approved':
        return <Check className="h-4 w-4 text-green-500" />
      case 'appointment_rejected':
        return <X className="h-4 w-4 text-red-500" />
      case 'appointment_created':
      case 'appointment_deleted':
        return <Calendar className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-10 w-10 rounded-full transition-all duration-200 hover:scale-105",
            className
          )}
        >
          <Bell className={cn("h-5 w-5", iconClassName)} />
          
          {/* Notification badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
          
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-80 sm:w-96 p-0 shadow-xl border-gray-200/50" 
        align="end" 
        forceMount
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-brand" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-brand hover:text-brand-strong"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notifications list */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-500 mt-1">
                You&apos;ll see appointment updates here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 cursor-pointer",
                    !notification.read && "bg-blue-50/50"
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
                    notification.type === 'appointment_approved' && "bg-green-100",
                    notification.type === 'appointment_rejected' && "bg-red-100",
                    notification.type === 'appointment_created' && "bg-blue-100",
                    notification.type === 'appointment_deleted' && "bg-orange-100",
                    notification.type === 'general' && "bg-gray-100"
                  )}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      !notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(notification.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 flex items-center justify-between">
              <Link
                href={routes.privateroute.NOTIFICATIONS}
                className="text-sm text-brand hover:text-brand-strong font-medium px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs text-gray-500 hover:text-red-500"
                onClick={handleClearAll}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear all
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

