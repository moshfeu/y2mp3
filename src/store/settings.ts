import { create } from 'zustand'
import type { AppSettings } from '@/types/index'

interface SettingsState {
  settings: AppSettings
  loaded: boolean
  load: () => Promise<void>
  save: (settings: AppSettings) => Promise<void>
}

const defaults: AppSettings = {
  defaultOutputPath: '',
  defaultFormat: 'mp3',
  defaultQuality: 'best',
  theme: 'system',
  playlistSubfolder: false,
  notifyOnDownload: false,
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaults,
  loaded: false,

  load: async () => {
    if (get().loaded) return
    const s = await window.electronAPI.getSettings()
    set({ settings: s, loaded: true })
    applyTheme(s.theme)
  },

  save: async (settings: AppSettings) => {
    await window.electronAPI.saveSettings(settings)
    set({ settings })
    applyTheme(settings.theme)
  },
}))

export function applyTheme(theme: string) {
  const root = document.documentElement
  if (theme === 'dark') root.classList.add('dark')
  else if (theme === 'light') root.classList.remove('dark')
  else {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark')
    else root.classList.remove('dark')
  }
}
