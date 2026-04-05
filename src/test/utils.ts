/**
 * Shared test utilities — imported by all spec files.
 * Keeps helpers DRY and ensures consistent mock typings across the suite.
 */
import { vi } from 'vitest'
import type { DownloadItem } from '@/types/index'

/** Typed accessor for the mocked electronAPI (set up in src/test/setup.ts). */
export const api = () => window.electronAPI as ReturnType<typeof vi.fn> & typeof window.electronAPI

/** Builder for DownloadItem test fixtures. */
export const makeItem = (overrides: Partial<DownloadItem> = {}): DownloadItem => ({
  id: String(Math.random()),
  url: 'https://youtube.com/watch?v=test',
  title: 'Test Video',
  author: 'Test Author',
  thumbnail: '',
  filepath: '/out/test.mp3',
  filename: 'test.mp3',
  filesize: 1024,
  timestamp: Date.now(),
  status: 'completed',
  ...overrides,
})
