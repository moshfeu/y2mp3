/**
 * Tests for the download store state machine.
 * Specs: 1.1–1.17 (URL input & fetch), 2.1–2.9 (single video), 3.1–3.12 (playlist)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useDownloadStore } from '@/store/download'
import { api } from '@/test/utils'

beforeEach(() => {
  // Reset store to initial state between tests
  useDownloadStore.setState({
    url: '',
    fetchError: null,
    status: 'idle',
    isMixedUrl: false,
    videoInfo: null,
    playlistInfo: null,
    playlistEntries: [],
    singleFilepath: null,
    progress: null,
    activeItemIndex: 0,
    downloadError: null,
    doneStats: null,
  })
})

// ─────────────────────────────────────────────
// 1. URL Input & Fetch States
// ─────────────────────────────────────────────

describe('URL Input & Fetch States', () => {
  it('1.1 starts in idle state with empty URL', () => {
    const { result } = renderHook(() => useDownloadStore())
    expect(result.current.status).toBe('idle')
    expect(result.current.url).toBe('')
    expect(result.current.videoInfo).toBeNull()
    expect(result.current.playlistInfo).toBeNull()
  })

  it('1.4/1.5 transitions to fetching when fetch() is called', async () => {
    const { result } = renderHook(() => useDownloadStore())

    // Never resolve — lets us inspect the fetching state
    vi.mocked(api().getVideoInfo).mockImplementation(() => new Promise(() => {}))

    act(() => {
      result.current.setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    })
    act(() => { result.current.fetch() })

    expect(result.current.status).toBe('fetching')
  })

  it('1.7 transitions to fetch-error on failure', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({ success: false, error: 'Video unavailable' })
    const { result } = renderHook(() => useDownloadStore())

    act(() => result.current.setUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'))
    await act(() => result.current.fetch())

    expect(result.current.status).toBe('fetch-error')
    expect(result.current.fetchError).toBe('Video unavailable')
  })

  it('1.10 transitions to ready with videoInfo on single video success', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({
      success: true,
      info: { id: 'abc', title: 'Test Video', author: 'Test Channel', duration: 180, views: 1000, thumbnail: 'http://img.jpg' },
    })
    const { result } = renderHook(() => useDownloadStore())

    act(() => result.current.setUrl('https://www.youtube.com/watch?v=abc'))
    await act(() => result.current.fetch())

    expect(result.current.status).toBe('ready')
    expect(result.current.videoInfo?.title).toBe('Test Video')
    expect(result.current.isMixedUrl).toBe(false)
  })

  it('1.11 transitions to ready with playlistInfo on playlist success', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({
      success: true,
      playlist: {
        title: 'My Playlist',
        count: 3,
        entries: [
          { id: 'v1', title: 'Song 1', index: 1, status: 'pending' },
          { id: 'v2', title: 'Song 2', index: 2, status: 'pending' },
          { id: 'v3', title: 'Song 3', index: 3, status: 'pending' },
        ],
      },
    })
    const { result } = renderHook(() => useDownloadStore())

    act(() => result.current.setUrl('https://www.youtube.com/playlist?list=PLabc'))
    await act(() => result.current.fetch())

    expect(result.current.status).toBe('ready')
    expect(result.current.playlistInfo?.title).toBe('My Playlist')
    expect(result.current.playlistEntries).toHaveLength(3)
  })

  it('1.12 sets isMixedUrl=true when response has isMixedUrl flag', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({
      success: true,
      isMixedUrl: true,
      info: { id: 'abc', title: 'Test', author: 'Ch', duration: 120, views: 0, thumbnail: '' },
    })
    const { result } = renderHook(() => useDownloadStore())

    act(() => result.current.setUrl('https://www.youtube.com/watch?v=abc&list=PLxyz'))
    await act(() => result.current.fetch())

    expect(result.current.status).toBe('ready')
    expect(result.current.isMixedUrl).toBe(true)
    expect(result.current.videoInfo).not.toBeNull()
    expect(result.current.playlistInfo).toBeNull()
  })

  it('1.14 radio/mix URL: isMixedUrl=false, treated as single video', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({
      success: true,
      info: { id: 'abc', title: 'Test', author: 'Ch', duration: 120, views: 0, thumbnail: '' },
      // No isMixedUrl flag — backend already stripped it for RD lists
    })
    const { result } = renderHook(() => useDownloadStore())

    act(() => result.current.setUrl('https://www.youtube.com/watch?v=abc&list=RDabc'))
    await act(() => result.current.fetch())

    expect(result.current.isMixedUrl).toBe(false)
    expect(result.current.videoInfo).not.toBeNull()
    expect(result.current.playlistInfo).toBeNull()
  })

  it('1.13 fetchPlaylist() switches from mixed video view to playlist', async () => {
    // First fetch returns mixed
    vi.mocked(api().getVideoInfo)
      .mockResolvedValueOnce({
        success: true,
        isMixedUrl: true,
        info: { id: 'abc', title: 'Test', author: 'Ch', duration: 120, views: 0, thumbnail: '' },
      })
      // fetchPlaylist strips v= and calls again — returns playlist
      .mockResolvedValueOnce({
        success: true,
        playlist: { title: 'Test Playlist', count: 2, entries: [
          { id: 'v1', title: 'Song 1', index: 1, status: 'pending' },
          { id: 'v2', title: 'Song 2', index: 2, status: 'pending' },
        ]},
      })

    const { result } = renderHook(() => useDownloadStore())

    act(() => result.current.setUrl('https://www.youtube.com/watch?v=abc&list=PLxyz'))
    await act(() => result.current.fetch())
    expect(result.current.isMixedUrl).toBe(true)

    await act(() => result.current.fetchPlaylist())

    expect(result.current.status).toBe('ready')
    expect(result.current.playlistInfo?.title).toBe('Test Playlist')
    expect(result.current.isMixedUrl).toBe(false)
    expect(result.current.videoInfo).toBeNull()
  })

  it('setUrl resets fetch state when URL changes', () => {
    const { result } = renderHook(() => useDownloadStore())

    // Simulate post-fetch state
    useDownloadStore.setState({ status: 'ready', fetchError: null })
    act(() => result.current.setUrl('https://www.youtube.com/watch?v=newvideo'))

    expect(result.current.status).toBe('idle')
    expect(result.current.videoInfo).toBeNull()
  })
})

// ─────────────────────────────────────────────
// 2. Single Video Download Flow
// ─────────────────────────────────────────────

describe('Single Video Download Flow', () => {
  const videoInfo = { id: 'abc', title: 'Test Video', author: 'Ch', duration: 180, views: 1000, thumbnail: 'http://t.jpg' }

  beforeEach(() => {
    useDownloadStore.setState({ status: 'ready', videoInfo, url: 'https://youtube.com/watch?v=abc' })
  })

  it('2.1/2.4 transitions to downloading then done', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true, filepath: '/out/test.mp3', filename: 'test.mp3', filesize: 1024 })
    const { result } = renderHook(() => useDownloadStore())

    const downloadPromise = act(() => result.current.download({ format: 'mp3', quality: 'best', outputPath: '/out' }))
    expect(result.current.status).toBe('downloading')

    await downloadPromise
    expect(result.current.status).toBe('done')
  })

  it('2.5 singleFilepath is set on success', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true, filepath: '/out/test.mp3', filename: 'test.mp3', filesize: 1024 })
    const { result } = renderHook(() => useDownloadStore())

    await act(() => result.current.download({ format: 'mp3', quality: 'best', outputPath: '/out' }))

    expect(result.current.singleFilepath).toBe('/out/test.mp3')
  })

  it('2.6 singleFilepath is null when not returned', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true })
    const { result } = renderHook(() => useDownloadStore())

    await act(() => result.current.download({ format: 'mp3', quality: 'best', outputPath: '/out' }))

    expect(result.current.singleFilepath).toBeNull()
  })

  it('2.8 sets downloadError and returns to ready on failure', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: false, error: 'yt-dlp failed' })
    const { result } = renderHook(() => useDownloadStore())

    await act(() => result.current.download({ format: 'mp3', quality: 'best', outputPath: '/out' }))

    expect(result.current.status).toBe('ready')
    expect(result.current.downloadError).toBe('yt-dlp failed')
  })

  it('2.9 reset() returns to idle', () => {
    useDownloadStore.setState({ status: 'done', videoInfo, singleFilepath: '/out/test.mp3' })
    const { result } = renderHook(() => useDownloadStore())

    act(() => result.current.reset())

    expect(result.current.status).toBe('idle')
    expect(result.current.videoInfo).toBeNull()
    expect(result.current.singleFilepath).toBeNull()
    expect(result.current.url).toBe('')
  })
})

// ─────────────────────────────────────────────
// 3. Playlist Download Flow
// ─────────────────────────────────────────────

describe('Playlist Download Flow', () => {
  const playlistInfo = {
    title: 'Test Playlist',
    count: 3,
    entries: [
      { id: 'v1', title: 'Song 1', index: 1, status: 'pending' as const },
      { id: 'v2', title: 'Song 2', index: 2, status: 'pending' as const },
      { id: 'v3', title: 'Song 3', index: 3, status: 'pending' as const },
    ],
  }

  beforeEach(() => {
    useDownloadStore.setState({
      status: 'ready',
      playlistInfo,
      playlistEntries: playlistInfo.entries,
      url: 'https://youtube.com/playlist?list=PLabc',
    })
  })

  it('3.1 playlist entries are in pending state after fetch', () => {
    const { result } = renderHook(() => useDownloadStore())
    expect(result.current.playlistEntries).toHaveLength(3)
    expect(result.current.playlistEntries.every(e => e.status === 'pending')).toBe(true)
  })

  it('3.9 download() transitions to downloading and all entries reset to pending', async () => {
    vi.mocked(api().downloadAudio).mockImplementation(() => new Promise(() => {}))
    const { result } = renderHook(() => useDownloadStore())

    act(() => { result.current.download({ format: 'mp3', quality: 'best', outputPath: '/out' }) })

    expect(result.current.status).toBe('downloading')
    expect(result.current.playlistEntries.every(e => e.status === 'pending')).toBe(true)
  })

  it('3.11 doneStats populated on Download All completion', async () => {
    let onItemDoneCb: Function = () => {}
    vi.mocked(api().onItemDone).mockImplementation((cb) => { onItemDoneCb = cb; return vi.fn() })
    vi.mocked(api().downloadAudio).mockImplementation(async () => {
      // Simulate 2 done, 1 failed (already handled via IPC events)
      return { success: true }
    })
    let onItemErrorCb: Function = () => {}
    vi.mocked(api().onItemError).mockImplementation((cb) => { onItemErrorCb = cb; return vi.fn() })

    const { result } = renderHook(() => useDownloadStore())
    const downloadPromise = act(async () => {
      result.current.download({ format: 'mp3', quality: 'best', outputPath: '/out' })
      // Simulate IPC events
      onItemDoneCb({ index: 1, filepath: '/out/1.mp3', filename: '1.mp3', filesize: 1024 })
      onItemDoneCb({ index: 2, filepath: '/out/2.mp3', filename: '2.mp3', filesize: 1024 })
      onItemErrorCb({ index: 3, title: 'Song 3', error: 'Network error' })
    })
    await downloadPromise

    await waitFor(() => expect(result.current.status).toBe('done'))
    expect(result.current.doneStats).not.toBeNull()
  })

  it('3.3/3.5 downloadSingleEntry marks entry downloading then done', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true, filepath: '/out/song1.mp3', filename: 'song1.mp3', filesize: 512 })
    const { result } = renderHook(() => useDownloadStore())

    const downloadPromise = act(() => result.current.downloadSingleEntry(1, { format: 'mp3', quality: 'best', outputPath: '/out' }))

    // Should be downloading entry 1
    expect(result.current.playlistEntries.find(e => e.index === 1)?.status).toBe('downloading')

    await downloadPromise

    const entry = result.current.playlistEntries.find(e => e.index === 1)
    expect(entry?.status).toBe('done')
    expect(entry?.filepath).toBe('/out/song1.mp3')
  })

  it('3.7 downloadSingleEntry marks entry failed with error', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: false, error: 'Private video' })
    const { result } = renderHook(() => useDownloadStore())

    await act(() => result.current.downloadSingleEntry(1, { format: 'mp3', quality: 'best', outputPath: '/out' }))

    const entry = result.current.playlistEntries.find(e => e.index === 1)
    expect(entry?.status).toBe('failed')
    expect(entry?.error).toBe('Private video')
  })

  it('3.8 downloadSingleEntry on failed entry acts as retry', async () => {
    useDownloadStore.setState({
      ...useDownloadStore.getState(),
      playlistEntries: playlistInfo.entries.map(e =>
        e.index === 2 ? { ...e, status: 'failed' as const, error: 'Old error' } : e
      ),
    })
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true, filepath: '/out/song2.mp3', filename: 'song2.mp3', filesize: 256 })
    const { result } = renderHook(() => useDownloadStore())

    await act(() => result.current.downloadSingleEntry(2, { format: 'mp3', quality: 'best', outputPath: '/out' }))

    const entry = result.current.playlistEntries.find(e => e.index === 2)
    expect(entry?.status).toBe('done')
    expect(entry?.error).toBeUndefined()
  })
})
