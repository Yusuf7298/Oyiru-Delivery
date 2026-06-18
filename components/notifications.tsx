'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  type: NotificationType
  message: string
  duration?: number
  onClose?: () => void
}

export function Toast({ type, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-900 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-900 border-red-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 text-blue-900 border-blue-200'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-lg border ${getColors()} z-50 animate-in slide-in-from-bottom-4`}
    >
      {getIcon()}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="ml-2 opacity-50 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: string
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  )
}

export function ErrorAlert({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-4 flex items-start gap-3 mb-4">
      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

export function SuccessAlert({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="bg-green-50 border border-green-200 text-green-900 rounded-lg p-4 flex items-start gap-3 mb-4">
      <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="flex-shrink-0">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
