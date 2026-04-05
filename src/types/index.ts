/**
 * Public types for the renderer.
 * Primitive types and ElectronAPI live in ./shared (also used by preload).
 */
export type { VideoInfo, DownloadOptions, PlaylistEntry, PlaylistInfo, DownloadProgress, DownloadItem, AppSettings, ElectronAPI } from './shared'

declare global {
  interface Window {
    electronAPI: import('./shared').ElectronAPI
  }
}

