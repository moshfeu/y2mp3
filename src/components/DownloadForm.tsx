import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDownloadStore } from '@/store/download'
import { useSettingsStore } from '@/store/settings'
import { DownloadList } from '@/components/DownloadList'
import { useState } from 'react'

function isValidYouTubeUrl(u: string) {
  return u.includes('youtube.com/') || u.includes('youtu.be/')
}

function sanitizeFolderName(name: string) {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim()
}

export function DownloadForm() {
  const {
    url, setUrl, fetch: fetchInfo, fetchPlaylist, download, downloadSingleEntry, cancelDownload, reset,
    status, fetchError, downloadError,
    videoInfo, playlistInfo, playlistEntries, isMixedUrl,
    progress, doneStats, singleFilepath,
  } = useDownloadStore()

  const settings = useSettingsStore(s => s.settings)

  const [format, setFormat] = useState(settings.defaultFormat)
  const [quality, setQuality] = useState(settings.defaultQuality)

  const isPlaylistMode = !!playlistInfo
  const isFetching = status === 'fetching'
  const isDownloading = status === 'downloading'
  const isDone = status === 'done'
  const isReady = status === 'ready'
  const hasFetchError = status === 'fetch-error'
  const canFetch = !!url.trim() && isValidYouTubeUrl(url) && !isFetching && !isDownloading

  const getDownloadOptions = () => {
    const { settings: s } = useSettingsStore.getState()
    return {
      format,
      quality,
      outputPath: s.defaultOutputPath,
      subfolderName: (isPlaylistMode && s.playlistSubfolder && playlistInfo)
        ? sanitizeFolderName(playlistInfo.title)
        : undefined,
    }
  }

  const handleDownload = () => download(getDownloadOptions())

  const handleSingleEntryDownload = (entryIndex: number) => {
    const { settings: s } = useSettingsStore.getState()
    downloadSingleEntry(entryIndex, { format, quality, outputPath: s.defaultOutputPath })
  }

  return (
    <div className="space-y-4">
      {/* URL field */}
      <div className="space-y-2">
        <Label htmlFor="url">YouTube URL</Label>
        <div className="relative">
          <Input
            id="url"
            placeholder="https://www.youtube.com/watch?v=... or playlist URL"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canFetch && fetchInfo()}
            disabled={isDownloading}
            className={`pr-10 ${hasFetchError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          <button
            type="button"
            onClick={isFetching || isReady || isDone ? () => { setUrl(''); reset() } : fetchInfo}
            disabled={!canFetch && !isReady && !isDone}
            aria-label={isReady || isDone ? 'Clear URL' : 'Fetch video info'}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isFetching
              ? <span className="animate-spin inline-block">⟳</span>
              : (isReady || isDone) ? '✕' : '→'}
          </button>
        </div>
        {hasFetchError && fetchError && (
          <p className="text-xs text-destructive">⚠ {fetchError}</p>
        )}
      </div>

      {/* Mixed URL banner — shown when URL has both v= and list= */}
      {isMixedUrl && isReady && (
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-yellow-50 border border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800 text-sm">
          <span className="text-yellow-800 dark:text-yellow-200">This URL is part of a playlist.</span>
          <button
            onClick={fetchPlaylist}
            className="text-xs font-medium text-yellow-700 dark:text-yellow-300 hover:underline ml-3 shrink-0"
          >
            Fetch playlist →
          </button>
        </div>
      )}

      <DownloadList
        videoInfo={videoInfo}
        playlistInfo={playlistInfo}
        playlistEntries={playlistEntries}
        progress={progress}
        isDownloading={isDownloading}
        isDone={isDone}
        singleFilepath={singleFilepath}
        downloadError={downloadError}
        handleSingleEntryDownload={handleSingleEntryDownload}
      />



      {/* Format / Quality — only shown after fetch succeeds, hidden while downloading/done */}
      {(isReady || (isDone && !isPlaylistMode)) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select id="format" value={format} onChange={e => setFormat(e.target.value as any)}>
              <option value="mp3">MP3</option>
              <option value="m4a">M4A</option>
              <option value="wav">WAV</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quality">Quality</Label>
            <Select id="quality" value={quality} onChange={e => setQuality(e.target.value as any)}>
              <option value="best">Best</option>
              <option value="320">320 kbps</option>
              <option value="256">256 kbps</option>
              <option value="192">192 kbps</option>
            </Select>
          </div>
        </div>
      )}

      {/* Partial success summary (playlist only) */}
      {isDone && doneStats && (
        <Alert className={doneStats.failed > 0 ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' : ''}>
          <AlertDescription>
            {doneStats.failed === 0
              ? `✅ Downloaded all ${doneStats.total} tracks`
              : `Downloaded ${doneStats.succeeded} of ${doneStats.total} · ${doneStats.failed} failed`}
          </AlertDescription>
        </Alert>
      )}


      {/* Action buttons */}
      {isDone ? (
        <Button variant="outline" className="w-full" onClick={reset}>
          ↺ Start over
        </Button>
      ) : isDownloading ? (
        <div className="flex gap-2">
          <Button className="flex-1" disabled>
            {isPlaylistMode && progress?.playlistIndex && progress?.playlistCount
              ? `Downloading ${progress.playlistIndex} / ${progress.playlistCount}...`
              : `Downloading...${progress ? ` ${progress.percent.toFixed(0)}%` : ''}`}
          </Button>
          <Button
            variant="outline"
            onClick={cancelDownload}
            className="text-destructive border-destructive/50 hover:bg-destructive/10"
          >
            ✕ Cancel
          </Button>
        </div>
      ) : isReady ? (
        <Button className="w-full" onClick={handleDownload}>
          {isPlaylistMode
            ? `⬇️ Download All (${playlistInfo!.count} videos)`
            : '⬇️ Download Audio'}
        </Button>
      ) : null}
    </div>
  )
}
