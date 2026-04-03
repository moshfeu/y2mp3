export interface VideoInfo {
  id: string
  title: string
  author: string
  duration: number
  views: number
  thumbnail: string
}

export interface DownloadOptions {
  url: string
  format: 'm4a' | 'mp3' | 'wav'
  quality: 'best' | '320' | '256' | '192'
  outputPath?: string
  filename?: string
}

export interface PlaylistEntry {
  id: string
  title: string
  index: number
  status: 'pending' | 'downloading' | 'done' | 'failed'
  filepath?: string
  error?: string
}

export interface PlaylistInfo {
  title: string
  count: number
  entries: PlaylistEntry[]
}

export interface DownloadProgress {
  percent: number
  speed: string
  eta: string
  totalSize: string
  filename: string
  playlistIndex?: number
  playlistCount?: number
  currentTitle?: string
}

export interface DownloadItem {
  id: string
  url: string
  title: string
  author: string
  thumbnail: string
  filepath: string
  filename: string
  filesize: number
  timestamp: number
  status: 'completed' | 'failed'
  error?: string
}

export interface AppSettings {
  defaultOutputPath: string
  defaultFormat: 'm4a' | 'mp3' | 'wav'
  defaultQuality: 'best' | '320' | '256' | '192'
  theme: 'light' | 'dark' | 'system'
}

export interface ElectronAPI {
  downloadAudio: (options: DownloadOptions) => Promise<{ success: boolean; error?: string }>
  getVideoInfo: (url: string) => Promise<{ success: boolean; info?: VideoInfo; playlist?: PlaylistInfo; error?: string }>
  onProgress: (callback: (progress: DownloadProgress) => void) => () => void
  onItemStart: (callback: (data: { index: number; total: number; title: string }) => void) => () => void
  onItemDone: (callback: (data: { index: number; filepath: string; filename: string; filesize: number }) => void) => () => void
  selectFolder: () => Promise<string | null>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>
  getHistory: () => Promise<DownloadItem[]>
  clearHistory: () => Promise<void>
  openFile: (filepath: string) => Promise<void>
  checkDependencies: () => Promise<{ ytdlp: boolean; ffmpeg: boolean }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
