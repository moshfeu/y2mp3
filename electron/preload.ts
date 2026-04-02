import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  checkDependencies: () => ipcRenderer.invoke('check-deps'),
  getVideoInfo: (url: string) => ipcRenderer.invoke('get-video-info', url),
  downloadAudio: (options: any) => ipcRenderer.invoke('download-audio', options),
  onProgress: (callback: (progress: any) => void) => {
    const listener = (_: any, progress: any) => callback(progress)
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
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  getHistory: () => ipcRenderer.invoke('get-history'),
  clearHistory: () => ipcRenderer.invoke('clear-history'),
  openFile: (filepath: string) => ipcRenderer.invoke('open-file', filepath),
})
