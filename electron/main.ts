import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import { join } from 'path'
import { checkDependencies, getVideoInfo, downloadAudio, getPlaylistInfo, abortDownload } from './download'
import type { DownloadOptions, AppSettings, DownloadItem, VideoInfo } from '../src/types/shared'
import crypto from 'crypto'

// Lazy-loaded Store to handle ESM-only electron-store v8
let _settingsStore: any = null
let _historyStore: any = null

async function getStores() {
  if (!_settingsStore) {
    const { default: Store } = await import('electron-store')
    _settingsStore = new Store<AppSettings>({
      name: 'settings',
      defaults: {
        defaultOutputPath: app.getPath('downloads'),
        defaultFormat: 'mp3',
        defaultQuality: 'best',
        theme: 'system',
        playlistSubfolder: false,
      },
    })
    _historyStore = new Store<{ items: DownloadItem[] }>({
      name: 'history',
      defaults: { items: [] },
    })
  }
  return { settings: _settingsStore, history: _historyStore }
}

async function saveToHistory(
  url: string,
  filepath: string,
  filename: string,
  filesize: number,
  extra?: Partial<DownloadItem>,
) {
  const { history } = await getStores()
  const item: DownloadItem = {
    id: crypto.randomUUID(),
    url,
    title: extra?.title || filename,
    author: extra?.author || 'Unknown',
    thumbnail: extra?.thumbnail || '',
    filepath,
    filename,
    filesize,
    timestamp: Date.now(),
    status: 'completed',
    ...extra,
  }
  const existing: DownloadItem[] = history.get('items') || []
  history.set('items', [item, ...existing])
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 800,
    minHeight: 600,
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false,
    },
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  // Pre-init stores
  await getStores()

  // IPC: check dependencies
  ipcMain.handle('check-deps', async () => {
    return checkDependencies()
  })

  // IPC: get video info
  ipcMain.handle('get-video-info', async (_event, url: string) => {
    try {
      // Unviewable list types (YouTube auto-generated mixes/radio): RD, WL, LL, FL
      const UNVIEWABLE_LIST_PREFIXES = ['RD', 'WL', 'LL', 'FL']
      let listId: string | null = null
      try { listId = new URL(url).searchParams.get('list') } catch { /* ignore */ }
      const isUnviewableList = listId ? UNVIEWABLE_LIST_PREFIXES.some(p => listId!.startsWith(p)) : false

      // Use URL param parsing so youtu.be/ID?list=PL is also treated as mixed
      let hasVideo = false
      let hasPlaylist = false
      try {
        const parsed = new URL(url)
        hasVideo = parsed.searchParams.has('v') || url.includes('youtu.be/')
        hasPlaylist = !isUnviewableList && (parsed.searchParams.has('list') || parsed.pathname === '/playlist')
      } catch {
        hasVideo = url.includes('v=') || url.includes('youtu.be/')
        hasPlaylist = !isUnviewableList && (url.includes('list=') || url.includes('youtube.com/playlist'))
      }

      const isMixed = hasVideo && hasPlaylist
      console.log('[get-video-info] hasVideo:', hasVideo, 'hasPlaylist:', hasPlaylist, 'isMixed:', isMixed, 'url:', url)

      if (isMixed) {
        // Mixed URL: show video first, let user choose to expand to playlist
        const info = await getVideoInfo(url)
        return { success: true, info, isMixedUrl: true }
      } else if (hasPlaylist) {
        const playlist = await getPlaylistInfo(url)
        return { success: true, playlist }
      } else {
        const info = await getVideoInfo(url)
        return { success: true, info }
      }
    } catch (error: any) {
      console.error('[get-video-info] error:', error.message)
      return { success: false, error: error.message }
    }
  })

  // IPC: cancel download
  ipcMain.handle('cancel-download', () => {
    abortDownload()
  })

  // IPC: download audio
  ipcMain.handle('download-audio', async (event, options: DownloadOptions) => {
    try {
      const result = await downloadAudio(
        options.url,
        options,
        (progress) => {
          event.sender.send('download-progress', progress)
        },
        (index, total, title) => {
          event.sender.send('download-item-start', { index, total, title })
        },
        (index, filepath, filename, filesize) => {
          saveToHistory(options.url, filepath, filename, filesize)
            .catch(console.error)
          event.sender.send('download-item-done', { index, filepath, filename, filesize })
        },
        (index, title, error) => {
          event.sender.send('download-item-error', { index, title, error })
        },
      )

      if (!result.isPlaylist) {
        let videoInfo: VideoInfo | null = null
        try { videoInfo = await getVideoInfo(options.url) } catch { /* ignore */ }
        await saveToHistory(options.url, result.filepath, result.filename, result.filesize, {
          title: videoInfo?.title || result.filename,
          author: videoInfo?.author || 'Unknown',
          thumbnail: videoInfo?.thumbnail || '',
        })
      }

      return { success: true, ...result }
    } catch (error: any) {
      console.error('[download-audio] error:', error.message)
      // Save failed entry to history
      try {
        const { history } = await getStores()
        let videoInfo: VideoInfo | null = null
        try { videoInfo = await getVideoInfo(options.url) } catch { /* ignore */ }
        const item: DownloadItem = {
          id: crypto.randomUUID(),
          url: options.url,
          title: videoInfo?.title || options.url,
          author: videoInfo?.author || 'Unknown',
          thumbnail: videoInfo?.thumbnail || '',
          filepath: '',
          filename: '',
          filesize: 0,
          timestamp: Date.now(),
          status: 'failed',
          error: error.message,
        }
        const existing: DownloadItem[] = history.get('items') || []
        history.set('items', [item, ...existing])
      } catch { /* ignore */ }
      return { success: false, error: error.message }
    }
  })

  // IPC: select folder
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.canceled ? null : result.filePaths[0]
  })

  // IPC: settings
  ipcMain.handle('get-settings', async () => {
    const { settings } = await getStores()
    return settings.store
  })

  ipcMain.handle('save-settings', async (_event, newSettings: AppSettings) => {
    const { settings } = await getStores()
    settings.set(newSettings)
  })

  // IPC: history
  ipcMain.handle('get-history', async () => {
    const { history } = await getStores()
    return history.get('items') || []
  })

  ipcMain.handle('clear-history', async () => {
    const { history } = await getStores()
    history.set('items', [])
  })

  // IPC: open file in Finder/Explorer
  ipcMain.handle('open-file', async (_event, filepath: string) => {
    shell.showItemInFolder(filepath)
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
