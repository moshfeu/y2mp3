/**
 * Shared primitive types used by both the renderer (src/) and the preload bridge (electron/preload.ts).
 * Do NOT import from 'electron' or Node.js-only modules here.
 */

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
  isPlaylist?: boolean
  subfolderName?: string
}

export interface PlaylistEntry {
  id: string
  title: string
  index: number
  status: 'pending' | 'downloading' | 'done' | 'failed'
  thumbnail?: string
  duration?: number
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
  playlistSubfolder: boolean
}

/**
 * The IPC bridge API exposed to the renderer via contextBridge.
 * Defined here (in the shared layer) so both the renderer tsconfig and the
 * preload tsconfig can reference it without cross-project violations.
 * electron/preload.ts imports this type and uses `satisfies ElectronAPI`
 * to guarantee the implementation stays in sync.
 */
export interface ElectronAPI {
  checkDependencies: () => Promise<{ ytdlp: boolean; ffmpeg: boolean }>
  getVideoInfo: (url: string) => Promise<{ success: boolean; info?: VideoInfo; playlist?: PlaylistInfo; isMixedUrl?: boolean; error?: string }>
  downloadAudio: (options: DownloadOptions) => Promise<{ success: boolean; filepath?: string; filename?: string; filesize?: number; error?: string }>
  cancelDownload: () => Promise<void>
  onProgress: (callback: (progress: DownloadProgress) => void) => () => void
  onItemStart: (callback: (data: { index: number; total: number; title: string }) => void) => () => void
  onItemDone: (callback: (data: { index: number; filepath: string; filename: string; filesize: number }) => void) => () => void
  onItemError: (callback: (data: { index: number; title: string; error: string }) => void) => () => void
  selectFolder: () => Promise<string | null>
  getSettings: () => Promise<AppSettings>
  saveSettings: (settings: AppSettings) => Promise<void>
  getHistory: () => Promise<DownloadItem[]>
  clearHistory: () => Promise<void>
  openFile: (filepath: string) => Promise<void>
}
