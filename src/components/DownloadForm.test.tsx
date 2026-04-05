/**
 * Component tests for DownloadForm.
 * Specs: 1.1–1.17 (URL/fetch states), 2.1–2.9 (single video), 3.1–3.12 (playlist)
 */
import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DownloadForm } from '@/components/DownloadForm'
import { useDownloadStore } from '@/store/download'
import { useSettingsStore } from '@/store/settings'
import { api } from '@/test/utils'

const VALID_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const VALID_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest123'
const MIXED_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLtest123'

const videoInfoFixture = {
  id: 'dQw4w9WgXcQ',
  title: 'Never Gonna Give You Up',
  author: 'Rick Astley',
  duration: 213,
  views: 1_400_000_000,
  thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hq720.jpg',
}

const playlistInfoFixture = {
  title: 'Best Songs',
  count: 2,
  entries: [
    { id: 'v1', title: 'Song One', index: 1, status: 'pending' as const, duration: 200 },
    { id: 'v2', title: 'Song Two', index: 2, status: 'pending' as const, duration: 180 },
  ],
}

beforeEach(() => {
  useDownloadStore.setState({
    url: '', fetchError: null, status: 'idle', isMixedUrl: false,
    videoInfo: null, playlistInfo: null, playlistEntries: [],
    singleFilepath: null, progress: null, activeItemIndex: 0,
    downloadError: null, doneStats: null,
  })
  useSettingsStore.setState({
    settings: { defaultOutputPath: '/out', defaultFormat: 'mp3', defaultQuality: 'best', theme: 'system', playlistSubfolder: false },
    loaded: true,
  })
})

// ─── 1. URL Input & Fetch States ────────────────────────────────────────────

describe('DownloadForm — URL Input & Fetch States', () => {
  it('1.1 idle: URL field empty, no format/quality/download visible', () => {
    render(<DownloadForm />)
    expect(screen.queryByRole('combobox', { name: /format/i })).toBeNull()
    expect(screen.queryByRole('combobox', { name: /quality/i })).toBeNull()
    expect(screen.queryByRole('button', { name: /download/i })).toBeNull()
  })

  it('1.2 fetch button disabled for non-YouTube URLs', async () => {
    const user = userEvent.setup()
    render(<DownloadForm />)
    const input = screen.getByPlaceholderText(/youtube/i)
    await user.type(input, 'https://example.com/video')
    const fetchBtn = screen.getByRole('button', { name: /fetch video info/i })
    expect(fetchBtn).toBeDisabled()
  })

  it('1.3 fetch button enabled for valid YouTube URL', async () => {
    const user = userEvent.setup()
    render(<DownloadForm />)
    const input = screen.getByPlaceholderText(/youtube/i)
    await user.type(input, VALID_VIDEO_URL)
    const fetchBtn = screen.getByRole('button', { name: /fetch video info/i })
    expect(fetchBtn).not.toBeDisabled()
  })

  it('1.4 clicking fetch shows spinner', async () => {
    vi.mocked(api().getVideoInfo).mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<DownloadForm />)
    const input = screen.getByPlaceholderText(/youtube/i)
    await user.type(input, VALID_VIDEO_URL)
    await user.click(screen.getByRole('button', { name: /fetch video info/i }))
    expect(screen.getByText('⟳')).toBeInTheDocument()
  })

  it('1.5 pressing Enter with valid URL triggers fetch', async () => {
    vi.mocked(api().getVideoInfo).mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<DownloadForm />)
    const input = screen.getByPlaceholderText(/youtube/i)
    await user.type(input, VALID_VIDEO_URL)
    await user.keyboard('{Enter}')
    expect(screen.getByText('⟳')).toBeInTheDocument()
  })

  it('1.7 fetch error shows red ring and inline error', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({ success: false, error: 'Video unavailable' })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.type(screen.getByPlaceholderText(/youtube/i), VALID_VIDEO_URL)
    await user.click(screen.getByRole('button', { name: /fetch video info/i }))
    await waitFor(() => expect(screen.getByText(/Video unavailable/)).toBeInTheDocument())
    const input = screen.getByPlaceholderText(/youtube/i)
    expect(input.className).toMatch(/destructive/)
  })

  it('1.10 fetch success: video card, format, quality, download revealed', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({ success: true, info: videoInfoFixture })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.type(screen.getByPlaceholderText(/youtube/i), VALID_VIDEO_URL)
    await user.click(screen.getByRole('button', { name: /fetch video info/i }))
    await waitFor(() => expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument())
    expect(screen.getByText('Rick Astley')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /format/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /quality/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download audio/i })).toBeInTheDocument()
  })

  it('1.11 playlist fetch: playlist card with entries, "Download All" button', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({ success: true, playlist: playlistInfoFixture })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.type(screen.getByPlaceholderText(/youtube/i), VALID_PLAYLIST_URL)
    await user.click(screen.getByRole('button', { name: /fetch video info/i }))
    await waitFor(() => expect(screen.getByText('Best Songs')).toBeInTheDocument())
    expect(screen.getByText('Song One')).toBeInTheDocument()
    expect(screen.getByText('Song Two')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download all/i })).toBeInTheDocument()
  })

  it('1.12 mixed URL: video card + yellow "Fetch playlist →" banner', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({ success: true, info: videoInfoFixture, isMixedUrl: true })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.type(screen.getByPlaceholderText(/youtube/i), MIXED_URL)
    await user.click(screen.getByRole('button', { name: /fetch video info/i }))
    await waitFor(() => expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument())
    expect(screen.getByText(/Fetch playlist/)).toBeInTheDocument()
  })

  it('1.14 radio URL: no "Fetch playlist →" banner', async () => {
    vi.mocked(api().getVideoInfo).mockResolvedValue({ success: true, info: videoInfoFixture })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.type(screen.getByPlaceholderText(/youtube/i), 'https://youtube.com/watch?v=abc&list=RDabc')
    await user.click(screen.getByRole('button', { name: /fetch video info/i }))
    await waitFor(() => expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument())
    expect(screen.queryByText(/Fetch playlist/)).toBeNull()
  })
})

// ─── 2. Single Video Download Flow ─────────────────────────────────────────

describe('DownloadForm — Single Video Download Flow', () => {
  beforeEach(() => {
    useDownloadStore.setState({ status: 'ready', videoInfo: videoInfoFixture, url: VALID_VIDEO_URL })
  })

  it('2.1 video card stays visible while downloading', async () => {
    vi.mocked(api().downloadAudio).mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /download audio/i }))
    expect(screen.getByText('Never Gonna Give You Up')).toBeInTheDocument()
  })

  it('2.2/2.3 progress bar and ETA shown inline in card during download', async () => {
    vi.mocked(api().downloadAudio).mockImplementation(() => new Promise(() => {}))
    let progressCb: Function = () => {}
    vi.mocked(api().onProgress).mockImplementation((cb) => { progressCb = cb; return vi.fn() })

    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /download audio/i }))

    // Simulate progress event
    fireEvent(window, new Event('progress'))
    await waitFor(() => {})
    vi.mocked(api().onProgress).mock.calls[0]?.[0]?.({
      percent: 45.5, speed: '1.2 MB/s', eta: '00:30', totalSize: '5.0 MB', filename: 'test.mp3',
    })
    progressCb({ percent: 45.5, speed: '1.2 MB/s', eta: '00:30', totalSize: '5.0 MB', filename: 'test.mp3' })

    await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeNull())
  })

  it('2.4/2.5 done state: ✅ Done + Show in Finder visible', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true, filepath: '/out/test.mp3', filename: 'test.mp3', filesize: 1024 })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /download audio/i }))
    await waitFor(() => expect(screen.getByText(/Done/)).toBeInTheDocument())
    expect(screen.getByText(/Show in Finder/)).toBeInTheDocument()
  })

  it('2.6 done without filepath: no Show in Finder button', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /download audio/i }))
    await waitFor(() => expect(screen.getByText(/Done/)).toBeInTheDocument())
    expect(screen.queryByText(/Show in Finder/)).toBeNull()
  })

  it('2.7 clicking Show in Finder calls openFile', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true, filepath: '/out/test.mp3', filename: 'test.mp3', filesize: 1024 })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /download audio/i }))
    await waitFor(() => screen.getByText(/Show in Finder/))
    await user.click(screen.getByText(/Show in Finder/))
    expect(api().openFile).toHaveBeenCalledWith('/out/test.mp3')
  })

  it('2.8 inline error shown in card on download failure', async () => {
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: false, error: 'yt-dlp crashed' })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /download audio/i }))
    await waitFor(() => expect(screen.getByText(/yt-dlp crashed/)).toBeInTheDocument())
    expect(screen.queryByText(/✅/)).toBeNull()
  })

  it('2.9 Start over resets to idle', async () => {
    useDownloadStore.setState({ status: 'done', videoInfo: videoInfoFixture, singleFilepath: '/out/test.mp3', url: VALID_VIDEO_URL })
    vi.mocked(api().downloadAudio).mockResolvedValue({ success: true, filepath: '/out/test.mp3', filename: 'test.mp3', filesize: 0 })
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /start over/i }))
    expect(screen.queryByText('Never Gonna Give You Up')).toBeNull()
    expect(screen.queryByRole('combobox', { name: /format/i })).toBeNull()
  })
})

// ─── 3. Playlist Download Flow ──────────────────────────────────────────────

describe('DownloadForm — Playlist Download Flow', () => {
  beforeEach(() => {
    useDownloadStore.setState({
      status: 'ready',
      playlistInfo: playlistInfoFixture,
      playlistEntries: playlistInfoFixture.entries,
      url: VALID_PLAYLIST_URL,
    })
  })

  it('3.2 pending rows show ⬇ Download button', () => {
    render(<DownloadForm />)
    const buttons = screen.getAllByRole('button', { name: /⬇ Download/i })
    expect(buttons).toHaveLength(2)
  })

  it('3.5 done row shows 📂 Show file', () => {
    useDownloadStore.setState({
      ...useDownloadStore.getState(),
      playlistEntries: [
        { id: 'v1', title: 'Song One', index: 1, status: 'done', filepath: '/out/s1.mp3' },
        { id: 'v2', title: 'Song Two', index: 2, status: 'pending' },
      ],
    })
    render(<DownloadForm />)
    expect(screen.getByText('📂 Show file')).toBeInTheDocument()
  })

  it('3.6 done row without filepath: no 📂 Show file', () => {
    useDownloadStore.setState({
      ...useDownloadStore.getState(),
      playlistEntries: [
        { id: 'v1', title: 'Song One', index: 1, status: 'done' },
      ],
    })
    render(<DownloadForm />)
    expect(screen.queryByText('📂 Show file')).toBeNull()
  })

  it('3.7 failed row shows ↺ Retry and inline error', () => {
    useDownloadStore.setState({
      ...useDownloadStore.getState(),
      playlistEntries: [
        { id: 'v1', title: 'Song One', index: 1, status: 'failed', error: 'Private video' },
      ],
    })
    render(<DownloadForm />)
    expect(screen.getByText(/↺ Retry/)).toBeInTheDocument()
    expect(screen.getByText('Private video')).toBeInTheDocument()
  })

  it('3.9 Download All button is visible in ready state', () => {
    render(<DownloadForm />)
    expect(screen.getByRole('button', { name: /download all/i })).toBeInTheDocument()
  })

  it('3.9 per-row ⬇ Download buttons hidden during bulk download', async () => {
    vi.mocked(api().downloadAudio).mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /download all/i }))
    expect(screen.queryAllByRole('button', { name: /⬇ Download/i })).toHaveLength(0)
  })

  it('3.10 Cancel button appears during download', async () => {
    vi.mocked(api().downloadAudio).mockImplementation(() => new Promise(() => {}))
    const user = userEvent.setup()
    render(<DownloadForm />)
    await user.click(screen.getByRole('button', { name: /download all/i }))
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
})
