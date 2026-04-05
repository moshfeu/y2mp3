import { create } from 'zustand'
import type { VideoInfo, PlaylistInfo, PlaylistEntry, DownloadProgress, DownloadOptions } from '@/types/index'

export type DownloadStatus = 'idle' | 'fetching' | 'fetch-error' | 'ready' | 'downloading' | 'done'

interface DownloadState {
  // URL / fetch
  url: string
  fetchError: string | null
  status: DownloadStatus
  isMixedUrl: boolean

  // Fetched info
  videoInfo: VideoInfo | null
  playlistInfo: PlaylistInfo | null
  playlistEntries: PlaylistEntry[]
  singleFilepath: string | null

  // Download progress
  progress: DownloadProgress | null
  activeItemIndex: number
  downloadError: string | null
  doneStats: { total: number; succeeded: number; failed: number } | null

  // Actions
  setUrl: (url: string) => void
  fetch: () => Promise<void>
  fetchPlaylist: () => Promise<void>
  download: (options: Pick<DownloadOptions, 'format' | 'quality' | 'outputPath' | 'subfolderName'>) => Promise<void>
  downloadSingleEntry: (entryIndex: number, options: Pick<DownloadOptions, 'format' | 'quality' | 'outputPath'>) => Promise<void>
  cancelDownload: () => Promise<void>
  reset: () => void
}

function isValidYouTubeUrl(u: string) {
  return u.includes('youtube.com/') || u.includes('youtu.be/')
}

function attachIpcListeners(
  set: (s: Partial<DownloadState> | ((s: DownloadState) => Partial<DownloadState>)) => void,
  onItemDone: (index: number, filepath: string) => void,
  onItemFail: (index: number, errMsg: string) => void,
) {
  const removeProgress = window.electronAPI.onProgress(p => set({ progress: p }))
  const removeItemStart = window.electronAPI.onItemStart(({ index, title }) => {
    set(state => ({
      activeItemIndex: index,
      playlistEntries: state.playlistEntries.map(e =>
        e.index === index ? { ...e, status: 'downloading' as const, title: title || e.title } : e
      ),
    }))
  })
  const removeItemDone = window.electronAPI.onItemDone(({ index, filepath }) => {
    onItemDone(index, filepath)
    set(state => ({
      playlistEntries: state.playlistEntries.map(e =>
        e.index === index ? { ...e, status: 'done' as const, filepath } : e
      ),
    }))
  })
  const removeItemError = window.electronAPI.onItemError(({ index, error: errMsg }) => {
    onItemFail(index, errMsg)
    set(state => ({
      playlistEntries: state.playlistEntries.map(e =>
        e.index === index ? { ...e, status: 'failed' as const, error: errMsg } : e
      ),
    }))
  })
  return () => { removeProgress(); removeItemStart(); removeItemDone(); removeItemError() }
}

const initialState = {
  url: '',
  fetchError: null,
  status: 'idle' as DownloadStatus,
  isMixedUrl: false,
  videoInfo: null,
  playlistInfo: null,
  playlistEntries: [],
  singleFilepath: null,
  progress: null,
  activeItemIndex: 0,
  downloadError: null,
  doneStats: null,
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  ...initialState,

  setUrl: (url) => {
    const prev = get().url
    if (url !== prev) {
      set({ url, fetchError: null, videoInfo: null, playlistInfo: null, playlistEntries: [], status: 'idle', doneStats: null, downloadError: null, isMixedUrl: false, singleFilepath: null })
    }
  },

  fetch: async () => {
    const { url } = get()
    if (!url.trim() || !isValidYouTubeUrl(url)) return
    set({ status: 'fetching', fetchError: null, videoInfo: null, playlistInfo: null, playlistEntries: [], doneStats: null, isMixedUrl: false })
    try {
      const result = await window.electronAPI.getVideoInfo(url)
      if (result.success && result.playlist) {
        set({
          status: 'ready',
          playlistInfo: result.playlist,
          playlistEntries: result.playlist.entries.map(e => ({ ...e, status: 'pending' as const })),
        })
      } else if (result.success && result.info) {
        set({ status: 'ready', videoInfo: result.info, isMixedUrl: result.isMixedUrl ?? false })
      } else {
        set({ status: 'fetch-error', fetchError: result.error || 'Could not fetch info' })
      }
    } catch (e: any) {
      set({ status: 'fetch-error', fetchError: e?.message || String(e) })
    }
  },

  fetchPlaylist: async () => {
    const { url } = get()
    if (!url.trim()) return
    set({ status: 'fetching', fetchError: null, playlistInfo: null, playlistEntries: [], videoInfo: null, isMixedUrl: false })
    try {
      // Strip v= param using URL API so the backend treats it as a pure playlist URL
      let playlistUrl = url
      try {
        const parsed = new URL(url)
        parsed.searchParams.delete('v')
        playlistUrl = parsed.toString()
      } catch {
        // Fallback: regex strip
        playlistUrl = url.replace(/([?&])v=[^&]+(&|$)/, (_m, pre, post) => post ? pre : '').replace(/[?&]$/, '')
      }
      const result = await window.electronAPI.getVideoInfo(playlistUrl)
      if (result.success && result.playlist) {
        set({
          status: 'ready',
          playlistInfo: result.playlist,
          playlistEntries: result.playlist.entries.map(e => ({ ...e, status: 'pending' as const })),
        })
      } else {
        set({ status: 'fetch-error', fetchError: result.error || 'Could not fetch playlist' })
      }
    } catch (e: any) {
      set({ status: 'fetch-error', fetchError: e?.message || String(e) })
    }
  },

  download: async ({ format, quality, outputPath, subfolderName }) => {
    const { url, playlistInfo, playlistEntries } = get()
    const isPlaylist = !!playlistInfo
    let succeeded = 0
    let failed = 0

    set({ status: 'downloading', downloadError: null, progress: null, activeItemIndex: 0, doneStats: null, singleFilepath: null })

    if (isPlaylist) {
      set({ playlistEntries: playlistEntries.map(e => ({ ...e, status: 'pending' as const, error: undefined })) })
    }

    const options: DownloadOptions = { url, format, quality, outputPath, isPlaylist, subfolderName }
    const removeListeners = attachIpcListeners(
      set as any,
      (_i, _fp) => { succeeded++ },
      (_i, _e) => { failed++ },
    )

    try {
      const result = await window.electronAPI.downloadAudio(options)
      if (result.success) {
        set({
          status: 'done',
          singleFilepath: isPlaylist ? null : (result.filepath ?? null),
          doneStats: isPlaylist ? { total: playlistInfo!.count, succeeded, failed } : null,
        })
      } else {
        set({ status: 'ready', downloadError: result.error || 'Download failed' })
      }
    } catch (e: any) {
      const msg = e?.message || String(e)
      if (msg !== 'Download cancelled') set({ downloadError: msg })
      set({ status: 'ready' })
    } finally {
      removeListeners()
    }
  },

  downloadSingleEntry: async (entryIndex, { format, quality, outputPath }) => {
    const { playlistEntries } = get()
    const entry = playlistEntries.find(e => e.index === entryIndex)
    if (!entry) return

    // Mark just this entry as downloading
    set(state => ({
      playlistEntries: state.playlistEntries.map(e =>
        e.index === entryIndex ? { ...e, status: 'downloading' as const, error: undefined } : e
      ),
    }))

    try {
      // Download as single video (no-playlist flag) using the video's own URL
      const videoUrl = `https://www.youtube.com/watch?v=${entry.id}`
      const options: DownloadOptions = { url: videoUrl, format, quality, outputPath, isPlaylist: false }
      const result = await window.electronAPI.downloadAudio(options)
      if (result.success) {
        set(state => ({
          playlistEntries: state.playlistEntries.map(e =>
            e.index === entryIndex ? { ...e, status: 'done' as const, filepath: result.filepath } : e
          ),
        }))
      } else {
        set(state => ({
          playlistEntries: state.playlistEntries.map(e =>
            e.index === entryIndex ? { ...e, status: 'failed' as const, error: result.error || 'Download failed' } : e
          ),
        }))
      }
    } catch (err: unknown) {
      set(state => ({
        playlistEntries: state.playlistEntries.map(e =>
          e.index === entryIndex ? { ...e, status: 'failed' as const, error: (err as Error)?.message || String(err) } : e
        ),
      }))
    }
  },

  cancelDownload: async () => {
    try { await window.electronAPI.cancelDownload() } catch { /* ignore */ }
  },

  reset: () => set(initialState),
}))

