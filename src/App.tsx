import React, { useEffect } from 'react'
import { MemoryRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { DownloadForm } from '@/components/DownloadForm'
import { DownloadHistory } from '@/components/DownloadHistory'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ToastContainer } from '@/components/Toast'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSettingsStore } from '@/store/settings'
import { useHistoryStore } from '@/store/history'
import { useDownloadStore } from '@/store/download'
import { useNotificationsStore } from '@/store/notifications'
import { useState } from 'react'

function isYouTubeUrl(s: string) {
  return s.includes('youtube.com/') || s.includes('youtu.be/')
}

function AppShell() {
  const navigate = useNavigate()
  const loadSettings = useSettingsStore(s => s.load)
  const loadHistory = useHistoryStore(s => s.load)
  const [depsWarning, setDepsWarning] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
    loadHistory()
    window.electronAPI.checkDependencies().then(deps => {
      const missing: string[] = []
      if (!deps.ytdlp) missing.push('yt-dlp')
      if (!deps.ffmpeg) missing.push('ffmpeg')
      if (missing.length > 0) {
        setDepsWarning(`Missing dependencies: ${missing.join(', ')}. Install with: brew install ${missing.join(' ')}`)
      }
    })

    // ⌘, / Ctrl+, → navigate to Settings
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        navigate('/settings')
      }
    }
    window.addEventListener('keydown', onKeyDown)

    // Auto-paste: when the window is focused, check clipboard for a YouTube URL
    const onFocus = async () => {
      try {
        const text = await navigator.clipboard.readText()
        if (!text || !isYouTubeUrl(text.trim())) return
        const { status, url, setUrl } = useDownloadStore.getState()
        const { add } = useNotificationsStore.getState()
        // Only auto-paste when idle and URL field is empty or different
        if (status === 'idle' && url.trim() !== text.trim()) {
          setUrl(text.trim())
          add('📋 URL pasted from clipboard', 'info')
        }
      } catch {
        // clipboard permission denied or unavailable — silent
      }
    }
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 text-sm rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    }`

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
          <NavLink to="/download" className={navClass}>⬇️ Download</NavLink>
          <NavLink to="/history" className={navClass}>📋 History</NavLink>
          <NavLink to="/settings" className={navClass}>⚙️ Settings</NavLink>
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
        <Routes>
          <Route path="/download" element={<DownloadForm />} />
          <Route path="/history" element={<DownloadHistory />} />
          <Route path="/settings" element={<SettingsPanel />} />
          <Route path="*" element={<DownloadForm />} />
        </Routes>
      </div>

      <ToastContainer />
    </div>
  )
}

export default function App() {
  return (
    <MemoryRouter initialEntries={['/download']}>
      <AppShell />
    </MemoryRouter>
  )
}

