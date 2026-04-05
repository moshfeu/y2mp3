import { create } from 'zustand'
import type { DownloadItem } from '@/types/index'

interface HistoryState {
  items: DownloadItem[]
  load: () => Promise<void>
  refresh: () => Promise<void>
  clear: () => Promise<void>
}

export const useHistoryStore = create<HistoryState>((set) => ({
  items: [],

  load: async () => {
    const items = await window.electronAPI.getHistory()
    set({ items })
  },

  refresh: async () => {
    const items = await window.electronAPI.getHistory()
    set({ items })
  },

  clear: async () => {
    await window.electronAPI.clearHistory()
    set({ items: [] })
  },
}))
