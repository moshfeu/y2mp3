import { create } from 'zustand'

export interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'error'
}

interface NotificationsState {
  items: Notification[]
  add: (message: string, type?: Notification['type']) => void
  remove: (id: string) => void
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],

  add: (message, type = 'info') => {
    const id = globalThis.crypto.randomUUID()
    set(state => ({ items: [...state.items, { id, message, type }] }))
    setTimeout(() => {
      set(state => ({ items: state.items.filter(n => n.id !== id) }))
    }, 4000)
  },

  remove: (id) => set(state => ({ items: state.items.filter(n => n.id !== id) })),
}))
