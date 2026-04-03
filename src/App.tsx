import React, { useState, useEffect } from 'react'
import { DownloadForm } from '@/components/DownloadForm'
import { DownloadHistory } from '@/components/DownloadHistory'
import { SettingsPanel } from '@/components/SettingsPanel'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { AppSettings, DownloadItem } from '@/types/index'

type Tab = 'download' | 'history' | 'settings'

const defaultSettings: AppSettings = {
  defaultOutputPath: '',
  defaultFormat: 'mp3',
  defaultQuality: 'best',
  theme: 'system',
}

export default function App() {
  const [tab, setTab] = useState<Tab>('download')
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [history, setHistory] = useState<DownloadItem[]>([])
  const [depsWarning, setDepsWarning] = useState<string | null>(null)

  const applyTheme = (theme: string) => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark')
      else root.classList.remove('dark')
    }
  }

  useEffect(() => {
    window.electronAPI.getSettings().then(s => {
      setSettings(s)
      applyTheme(s.theme)
    })
    window.electronAPI.getHistory().then(setHistory)
    window.electronAPI.checkDependencies().then(deps => {
      const missing: string[] = []
      if (!deps.ytdlp) missing.push('yt-dlp')
      if (!deps.ffmpeg) missing.push('ffmpeg')
      if (missing.length > 0) {
        setDepsWarning(`Missing dependencies: ${missing.join(', ')}. Install with: brew install ${missing.join(' ')}`)
      }
    })
  }, [])

  const handleSaveSettings = async (newSettings: AppSettings) => {
    await window.electronAPI.saveSettings(newSettings)
    setSettings(newSettings)
    applyTheme(newSettings.theme)
  }

  const handleDownloadComplete = () => {
    window.electronAPI.getHistory().then(setHistory)
  }

  const handleClearHistory = async () => {
    await window.electronAPI.clearHistory()
    setHistory([])
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'download', label: '⬇️ Download' },
    { id: 'history', label: '📋 History' },
    { id: 'settings', label: '⚙️ Settings' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div
        className="border-b px-6 py-3 flex items-center justify-between"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      >
        <h1 className="font-semibold text-sm">YouTube Audio Downloader</h1>
        <div
          className="flex gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {depsWarning && (
        <div className="px-6 pt-4">
          <Alert variant="destructive">
            <AlertDescription className="text-xs">{depsWarning}</AlertDescription>
          </Alert>
        </div>
      )}

      <div className="px-6 py-4 max-w-2xl mx-auto">
        {tab === 'download' && (
          <DownloadForm settings={settings} onDownloadComplete={handleDownloadComplete} />
        )}
        {tab === 'history' && (
          <DownloadHistory
            history={history}
            onClear={handleClearHistory}
            onRefresh={() => window.electronAPI.getHistory().then(setHistory)}
          />
        )}
        {tab === 'settings' && (
          <SettingsPanel settings={settings} onSave={handleSaveSettings} />
        )}
      </div>
    </div>
  )
}
