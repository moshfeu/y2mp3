import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings, DownloadOptions, DownloadProgress, ElectronAPI } from '../src/types/shared'

contextBridge.exposeInMainWorld('electronAPI', {
  checkDependencies: () => ipcRenderer.invoke('check-deps'),
  getVideoInfo: (url: string) => ipcRenderer.invoke('get-video-info', url),
  downloadAudio: (options: DownloadOptions) => ipcRenderer.invoke('download-audio', options),
  cancelDownload: () => ipcRenderer.invoke('cancel-download'),
  onProgress: (callback: (progress: DownloadProgress) => void) => {
    const listener = (_: any, progress: DownloadProgress) => callback(progress)
    ipcRenderer.on('download-progress', listener)
    return () => ipcRenderer.removeListener('download-progress', listener)
  },
  onItemStart: (callback: (data: { index: number; total: number; title: string }) => void) => {
    const listener = (_: any, data: any) => callback(data)
    ipcRenderer.on('download-item-start', listener)
    return () => ipcRenderer.removeListener('download-item-start', listener)
  },
  onItemDone: (callback: (data: { index: number; filepath: string; filename: string; filesize: number }) => void) => {
    const listener = (_: any, data: any) => callback(data)
    ipcRenderer.on('download-item-done', listener)
    return () => ipcRenderer.removeListener('download-item-done', listener)
  },
  onItemError: (callback: (data: { index: number; title: string; error: string }) => void) => {
    const listener = (_: any, data: any) => callback(data)
    ipcRenderer.on('download-item-error', listener)
    return () => ipcRenderer.removeListener('download-item-error', listener)
  },
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: AppSettings) => ipcRenderer.invoke('save-settings', settings),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  openFile: (filepath: string) => ipcRenderer.invoke('open-file', filepath),
} satisfies ElectronAPI)
