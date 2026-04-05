/**
 * Component tests for DownloadHistory.
 * Specs: 5.1–5.13
 */
import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DownloadHistory } from '@/components/DownloadHistory'
import { useHistoryStore } from '@/store/history'
import { api, makeItem } from '@/test/utils'

beforeEach(() => {
  useHistoryStore.setState({ items: [] })
})

describe('DownloadHistory', () => {
  it('5.2 empty state shown when no downloads', () => {
    render(<DownloadHistory />)
    expect(screen.getByText(/no downloads yet/i)).toBeInTheDocument()
  })

  it('5.1 shows past download entries', () => {
    useHistoryStore.setState({ items: [
      makeItem({ title: 'Song A', author: 'Artist A' }),
      makeItem({ title: 'Song B', author: 'Artist B' }),
    ]})
    render(<DownloadHistory />)
    expect(screen.getByText('Song A')).toBeInTheDocument()
    expect(screen.getByText('Song B')).toBeInTheDocument()
  })

  it('5.3 search filters by title (case-insensitive)', async () => {
    useHistoryStore.setState({ items: [
      makeItem({ title: 'Bohemian Rhapsody' }),
      makeItem({ title: 'Stairway to Heaven' }),
    ]})
    const user = userEvent.setup()
    render(<DownloadHistory />)
    await user.type(screen.getByPlaceholderText(/search/i), 'bohemian')
    expect(screen.getByText('Bohemian Rhapsody')).toBeInTheDocument()
    expect(screen.queryByText('Stairway to Heaven')).toBeNull()
  })

  it('5.4 search filters by author', async () => {
    useHistoryStore.setState({ items: [
      makeItem({ title: 'Song 1', author: 'Led Zeppelin' }),
      makeItem({ title: 'Song 2', author: 'Queen' }),
    ]})
    const user = userEvent.setup()
    render(<DownloadHistory />)
    await user.type(screen.getByPlaceholderText(/search/i), 'queen')
    expect(screen.getByText('Song 2')).toBeInTheDocument()
    expect(screen.queryByText('Song 1')).toBeNull()
  })

  it('5.6 clearing search restores full list', async () => {
    useHistoryStore.setState({ items: [
      makeItem({ title: 'Alpha' }),
      makeItem({ title: 'Beta' }),
    ]})
    const user = userEvent.setup()
    render(<DownloadHistory />)
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'alpha')
    expect(screen.queryByText('Beta')).toBeNull()
    await user.clear(searchInput)
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('5.7 completed entries show 📂 button', () => {
    useHistoryStore.setState({ items: [makeItem({ status: 'completed', filepath: '/out/f.mp3' })] })
    render(<DownloadHistory />)
    expect(screen.getByRole('button', { name: /show in finder/i })).toBeInTheDocument()
  })

  it('5.9 failed entries do NOT show 📂 button', () => {
    useHistoryStore.setState({ items: [makeItem({ status: 'failed', filepath: '' })] })
    render(<DownloadHistory />)
    expect(screen.queryByRole('button', { name: /show in finder/i })).toBeNull()
  })

  it('5.8 clicking 📂 calls openFile with the filepath', async () => {
    useHistoryStore.setState({ items: [makeItem({ status: 'completed', filepath: '/out/song.mp3' })] })
    const user = userEvent.setup()
    render(<DownloadHistory />)
    await user.click(screen.getByRole('button', { name: /show in finder/i }))
    expect(api().openFile).toHaveBeenCalledWith('/out/song.mp3')
  })

  it('5.10 Clear All removes entries and shows empty state', async () => {
    useHistoryStore.setState({ items: [makeItem(), makeItem()] })
    vi.mocked(api().clearHistory).mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<DownloadHistory />)
    await user.click(screen.getByRole('button', { name: /clear all/i }))
    await waitFor(() => expect(screen.getByText(/no downloads yet/i)).toBeInTheDocument())
  })

  it('5.12 Refresh reloads from storage', async () => {
    vi.mocked(api().getHistory).mockResolvedValue([makeItem({ title: 'Fresh Entry' })])
    const user = userEvent.setup()
    render(<DownloadHistory />)
    await user.click(screen.getByRole('button', { name: /refresh/i }))
    await waitFor(() => expect(screen.getByText('Fresh Entry')).toBeInTheDocument())
  })

  it('5.13 status badge indicates completed vs failed', () => {
    useHistoryStore.setState({ items: [
      makeItem({ status: 'completed' }),
      makeItem({ status: 'failed' }),
    ]})
    render(<DownloadHistory />)
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText('failed')).toBeInTheDocument()
  })
})
