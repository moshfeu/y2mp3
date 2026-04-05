import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useDownloadStore } from '@/store/download'
import { useSettingsStore } from '@/store/settings'
import { useState } from 'react'

function isValidYouTubeUrl(u: string) {
  return u.includes('youtube.com/') || u.includes('youtu.be/')
}

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = String(secs % 60).padStart(2, '0')
  return `${m}:${s}`
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

      {/* Single video info card — persists through downloading and done states */}
      {videoInfo && !isPlaylistMode && (isReady || isDownloading || isDone) && (
        <Card className={isDone ? 'border-green-300 dark:border-green-800' : isDownloading ? 'bg-accent/20' : ''}>
          <CardContent className="pt-4">
            <div className="flex gap-3 items-start">
              {videoInfo.thumbnail && (
                <img src={videoInfo.thumbnail} alt="" className="w-24 h-16 object-cover rounded shrink-0" />
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-medium text-sm truncate">{videoInfo.title}</p>
                <p className="text-xs text-muted-foreground">{videoInfo.author}</p>
                {/* Progress inline */}
                {isDownloading && progress ? (
                  <div className="space-y-1 pt-0.5">
                    <Progress value={progress.percent} className="h-1.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress.percent.toFixed(1)}%</span>
                      <span>{progress.speed} · ETA {progress.eta}</span>
                    </div>
                  </div>
                ) : isDone ? (
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">✅ Done</span>
                    {singleFilepath && (
                      <button
                        onClick={() => window.electronAPI.openFile(singleFilepath)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        📂 Show in Finder
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(videoInfo.duration)}
                    {videoInfo.views > 0 && ` · ${videoInfo.views.toLocaleString()} views`}
                  </p>
                )}
                {/* Download error inline */}
                {downloadError && (
                  <p className="text-xs text-destructive">{downloadError}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Playlist rows */}
      {isPlaylistMode && playlistInfo && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{playlistInfo.title}</p>
                <p className="text-xs text-muted-foreground">{playlistInfo.count} videos</p>
              </div>
              {doneStats && (
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {doneStats.succeeded} ✓{doneStats.failed > 0 ? ` · ${doneStats.failed} ✗` : ''}
                </span>
              )}
              {isDownloading && progress?.playlistIndex && progress?.playlistCount && (
                <span className="text-xs text-muted-foreground shrink-0 ml-2 tabular-nums">
                  {progress.playlistIndex} / {progress.playlistCount}
                </span>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y rounded border">
              {playlistEntries.map(entry => {
                const isActive = entry.status === 'downloading'
                const entryProgress = isActive ? progress : null
                const canDownloadSingle = (entry.status === 'pending' || entry.status === 'failed') && !isDownloading
                return (
                  <div key={entry.id} className={`flex items-center gap-3 px-3 py-2 ${
                    entry.status === 'done' ? 'bg-green-50/50 dark:bg-green-950/10' :
                    entry.status === 'failed' ? 'bg-red-50/50 dark:bg-red-950/10' :
                    isActive ? 'bg-accent/30' : ''
                  }`}>
                    {entry.thumbnail ? (
                      <img src={entry.thumbnail} alt="" className="w-16 h-10 object-cover rounded shrink-0" />
                    ) : (
                      <div className="w-16 h-10 bg-muted rounded shrink-0 flex items-center justify-center text-xs text-muted-foreground">
                        {entry.index}
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className={`text-sm truncate ${
                        entry.status === 'failed' ? 'text-destructive' :
                        entry.status === 'done' ? 'text-muted-foreground' : ''
                      }`}>
                        {entry.title}
                      </p>
                      {entry.duration != null && !isActive && !entry.error && (
                        <p className="text-xs text-muted-foreground">{formatDuration(entry.duration)}</p>
                      )}
                      {isActive && entryProgress && (
                        <Progress value={entryProgress.percent} className="h-1" />
                      )}
                      {entry.error && (
                        <p className="text-xs text-destructive truncate">{entry.error}</p>
                      )}
                    </div>
                    <div className="shrink-0 min-w-[5.5rem] flex justify-end">
                      {entry.status === 'done' && entry.filepath && (
                        <button
                          onClick={() => window.electronAPI.openFile(entry.filepath!)}
                          className="text-xs text-green-600 dark:text-green-400 hover:underline"
                        >
                          📂 Show file
                        </button>
                      )}
                      {isActive && entryProgress && (
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {entryProgress.percent.toFixed(0)}%
                        </span>
                      )}
                      {canDownloadSingle && (
                        <button
                          onClick={() => handleSingleEntryDownload(entry.index)}
                          className={`text-xs border rounded px-2 py-0.5 transition-colors ${
                            entry.status === 'failed'
                              ? 'text-destructive border-destructive/50 hover:bg-destructive/10'
                              : 'text-muted-foreground border-muted hover:text-foreground hover:border-foreground'
                          }`}
                        >
                          {entry.status === 'failed' ? '↺ Retry' : '⬇ Download'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
