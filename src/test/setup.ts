import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Mock window.electronAPI for all tests
const mockElectronAPI = {
  getVideoInfo: vi.fn(),
  downloadAudio: vi.fn(),
  cancelDownload: vi.fn(),
  onProgress: vi.fn(() => vi.fn()),
  onItemStart: vi.fn(() => vi.fn()),
  onItemDone: vi.fn(() => vi.fn()),
  onItemError: vi.fn(() => vi.fn()),
  selectFolder: vi.fn(),
  getSettings: vi.fn().mockResolvedValue({
    defaultOutputPath: '/Users/test/Downloads',
    defaultFormat: 'mp3',
    defaultQuality: 'best',
    theme: 'system',
    playlistSubfolder: false,
  }),
  saveSettings: vi.fn().mockResolvedValue(undefined),
  getHistory: vi.fn().mockResolvedValue([]),
  clearHistory: vi.fn().mockResolvedValue(undefined),
  openFile: vi.fn().mockResolvedValue(undefined),
  checkDependencies: vi.fn().mockResolvedValue({ ytdlp: true, ffmpeg: true }),
}

Object.defineProperty(window, 'electronAPI', {
  value: mockElectronAPI,
  writable: true,
})

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
  // Re-apply default return values after clearAllMocks
  mockElectronAPI.onProgress.mockReturnValue(vi.fn())
  mockElectronAPI.onItemStart.mockReturnValue(vi.fn())
  mockElectronAPI.onItemDone.mockReturnValue(vi.fn())
  mockElectronAPI.onItemError.mockReturnValue(vi.fn())
  mockElectronAPI.getSettings.mockResolvedValue({
    defaultOutputPath: '/Users/test/Downloads',
    defaultFormat: 'mp3',
    defaultQuality: 'best',
    theme: 'system',
    playlistSubfolder: false,
  })
  mockElectronAPI.getHistory.mockResolvedValue([])
  mockElectronAPI.checkDependencies.mockResolvedValue({ ytdlp: true, ffmpeg: true })
})
