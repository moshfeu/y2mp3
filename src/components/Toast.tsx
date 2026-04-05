import React from 'react'
import { useNotificationsStore } from '@/store/notifications'

const TYPE_CLASSES = {
  info: 'bg-background border text-foreground',
  success: 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/40 dark:border-green-800 dark:text-green-100',
  error: 'bg-destructive/10 border-destructive/30 text-destructive',
}

export function ToastContainer() {
  const { items, remove } = useNotificationsStore()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {items.map(n => (
        <div
          key={n.id}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg shadow-lg border text-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-2 ${TYPE_CLASSES[n.type]}`}
        >
          <span>{n.message}</span>
          <button
            onClick={() => remove(n.id)}
            className="opacity-50 hover:opacity-100 ml-1 text-base leading-none"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
