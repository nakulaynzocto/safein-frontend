"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApproveAppointmentMutation, useRejectAppointmentMutation } from '@/store/api/appointmentApi'
import { useAppSelector } from '@/store/hooks'
import { showSuccessToast, showErrorToast } from '@/utils/toast'
import { routes } from '@/utils/routes'

export default function EmailActionPage() {
  const params = useParams()
  const router = useRouter()
  const { action, id } = params as { action: string; id: string }
  
  // Check authentication
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  
  const [approveAppointment, { isLoading: isApproving }] = useApproveAppointmentMutation()
  const [rejectAppointment, { isLoading: isRejecting }] = useRejectAppointmentMutation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth-required'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setStatus('auth-required')
      setMessage('Please log in to perform this action.')
      return
    }

    const handleAction = async () => {
      try {
        if (action === 'approve') {
          await approveAppointment(id).unwrap()
          setStatus('success')
          setMessage('Appointment approved successfully! The visitor has been notified.')
          showSuccessToast('Appointment approved successfully!')
        } else if (action === 'reject') {
          await rejectAppointment(id).unwrap()
          setStatus('success')
          setMessage('Appointment rejected. The visitor has been informed.')
          showSuccessToast('Appointment rejected successfully!')
        } else {
          setStatus('error')
          setMessage('Invalid action. Please use the correct link.')
          showErrorToast('Invalid action')
        }
      } catch (error) {
        setStatus('error')
        setMessage('There was an error processing your request. Please try again.')
        showErrorToast('Failed to process appointment action')
      }
    }

    if (id && action) {
      handleAction()
    }
  }, [action, id, approveAppointment, rejectAppointment, isAuthenticated])

  const handleGoToDashboard = () => {
    router.push(routes.privateroute.NOTIFICATIONS)
  }

  const handleGoToLogin = () => {
    router.push(routes.publicroute.LOGIN)
  }

  if (status === 'loading') {
    return null
  }

  if (status === 'auth-required') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>
          <button
            onClick={handleGoToLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'success' ? (
          <>
            <div className="text-6xl mb-4">
              {action === 'approve' ? '✅' : '❌'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {action === 'approve' ? 'Appointment Approved!' : 'Appointment Rejected'}
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              View Dashboard
            </button>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}
