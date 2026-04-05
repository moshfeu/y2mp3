/**
 * Tests for settings and history stores.
 * Specs: 4.1–4.16 (settings), 5.1–5.15 (history)
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSettingsStore, applyTheme } from '@/store/settings'
import { useHistoryStore } from '@/store/history'
import type { AppSettings } from '@/types/index'
import { api, makeItem } from '@/test/utils'

beforeEach(() => {
  useSettingsStore.setState({ settings: {
    defaultOutputPath: '/Users/test/Downloads',
    defaultFormat: 'mp3',
    defaultQuality: 'best',
    theme: 'system',
    playlistSubfolder: false,
  }, loaded: false })
  useHistoryStore.setState({ items: [] })
})

// ─────────────────────────────────────────────
// 4. Settings Store
// ─────────────────────────────────────────────

describe('Settings Store', () => {
  it('4.2 load() fetches settings from electronAPI', async () => {
    vi.mocked(api().getSettings).mockResolvedValue({
      defaultOutputPath: '/Users/test/Music',
      defaultFormat: 'm4a',
      defaultQuality: '320',
      theme: 'dark',
      playlistSubfolder: true,
    })
    const { result } = renderHook(() => useSettingsStore())

    await act(() => result.current.load())

    expect(result.current.settings.defaultOutputPath).toBe('/Users/test/Music')
    expect(result.current.settings.defaultFormat).toBe('m4a')
  })

  it('4.5/4.8/4.9 save() persists settings and updates store', async () => {
    vi.mocked(api().saveSettings).mockResolvedValue(undefined)
    const { result } = renderHook(() => useSettingsStore())

    const newSettings: AppSettings = {
      defaultOutputPath: '/Users/test/Music',
      defaultFormat: 'wav',
      defaultQuality: '320',
      theme: 'dark',
      playlistSubfolder: true,
    }
    await act(() => result.current.save(newSettings))

    expect(api().saveSettings).toHaveBeenCalledWith(newSettings)
    expect(result.current.settings.defaultFormat).toBe('wav')
    expect(result.current.settings.playlistSubfolder).toBe(true)
  })

  it('4.16 load() is idempotent — does not re-fetch if already loaded', async () => {
    useSettingsStore.setState({ loaded: true })
    const { result } = renderHook(() => useSettingsStore())

    await act(() => result.current.load())

    expect(api().getSettings).not.toHaveBeenCalled()
  })

  it('4.12 applyTheme("dark") adds .dark class to html element', () => {
    document.documentElement.classList.remove('dark')
    applyTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('4.12 applyTheme("light") removes .dark class from html element', () => {
    document.documentElement.classList.add('dark')
    applyTheme('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })
})

// ─────────────────────────────────────────────
// 5. History Store
// ─────────────────────────────────────────────

describe('History Store', () => {
  it('5.2 starts with empty items', () => {
    const { result } = renderHook(() => useHistoryStore())
    expect(result.current.items).toHaveLength(0)
  })

  it('5.1 load() populates items from electronAPI', async () => {
    const items = [makeItem({ title: 'Song A' }), makeItem({ title: 'Song B' })]
    vi.mocked(api().getHistory).mockResolvedValue(items)
    const { result } = renderHook(() => useHistoryStore())

    await act(() => result.current.load())

    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].title).toBe('Song A')
  })

  it('5.12 refresh() reloads items from electronAPI', async () => {
    useHistoryStore.setState({ items: [makeItem({ title: 'Old' })] })
    vi.mocked(api().getHistory).mockResolvedValue([makeItem({ title: 'New' })])
    const { result } = renderHook(() => useHistoryStore())

    await act(() => result.current.refresh())

    expect(result.current.items[0].title).toBe('New')
  })

  it('5.10 clear() removes all items and calls clearHistory', async () => {
    useHistoryStore.setState({ items: [makeItem(), makeItem()] })
    vi.mocked(api().clearHistory).mockResolvedValue(undefined)
    const { result } = renderHook(() => useHistoryStore())

    await act(() => result.current.clear())

    expect(result.current.items).toHaveLength(0)
    expect(api().clearHistory).toHaveBeenCalledOnce()
  })
})

// Download store tests live in src/store/download.test.ts
