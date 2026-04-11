import React from 'react'
import { DownloadItem } from '@/components/DownloadItem'
import type { VideoInfo, PlaylistInfo, PlaylistEntry, DownloadProgress } from '@/types/index'

export function DownloadList(props: {
  videoInfo?: VideoInfo | null
  playlistInfo?: PlaylistInfo | null
  playlistEntries?: PlaylistEntry[]
  progress?: DownloadProgress | null
  isDownloading: boolean
  isDone: boolean
  singleFilepath?: string | null
  downloadError?: string | null
  handleSingleEntryDownload?: (index: number) => void
}) {
  const {
    videoInfo,
    playlistInfo,
    playlistEntries = [],
    progress,
    isDownloading,
    isDone,
    singleFilepath,
    downloadError,
    handleSingleEntryDownload,
  } = props

  if (videoInfo && !playlistInfo) {
    const singleEntry = {
      id: videoInfo.id || '',
      title: videoInfo.title || '',
      index: 1,
      status: isDownloading ? 'downloading' as const : (isDone ? 'done' as const : 'pending' as const),
      thumbnail: videoInfo.thumbnail || undefined,
      duration: videoInfo.duration,
      author: videoInfo.author,
      views: videoInfo.views,
    }
    return (
      <DownloadItem
        entry={singleEntry}
        isActive={isDownloading}
        progress={progress}
        isDone={isDone}
        singleFilepath={singleFilepath}
        downloadError={downloadError}
        onOpenFile={(p) => window.electronAPI.openFile(p)}
      />
    )
  }

  if (playlistInfo) {
    return (
      <div>
        <div className="mb-2">
          <p className="font-medium text-sm">{playlistInfo.title}</p>
          <p className="text-xs text-muted-foreground">{playlistInfo.count} videos</p>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {playlistEntries.map(entry => {
            const isActive = entry.status === 'downloading' || (progress?.playlistIndex === entry.index)
            const entryProgress = (progress && progress.playlistIndex === entry.index) ? progress : null
            return (
              <DownloadItem
                key={entry.id}
                entry={entry}
                isActive={isActive}
                progress={entryProgress}
                onOpenFile={(p) => window.electronAPI.openFile(p)}
                onDownloadEntry={(i) => handleSingleEntryDownload?.(i)}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return null
}
