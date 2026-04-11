import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import type { PlaylistEntry, DownloadProgress } from '@/types/index'
import { formatDuration, formatViews } from '@/lib/formatters'

export function DownloadItem(props: {
  entry: PlaylistEntry
  isActive?: boolean
  progress?: DownloadProgress | null
  isDone?: boolean
  singleFilepath?: string | null
  downloadError?: string | null
  onOpenFile?: (path: string) => void
  onDownloadEntry?: (index: number) => void
}) {
  const { entry, isActive, progress, isDone, singleFilepath, downloadError, onOpenFile, onDownloadEntry } = props
  const title = entry?.title || ''
  const author = entry?.author
  const thumbnail = entry?.thumbnail
  const duration = entry?.duration
  const views = formatViews(entry?.views)
  const filepath = entry?.filepath || singleFilepath
  const error = entry?.error || downloadError
  const status = entry ? entry.status : (isDone ? 'done' : undefined)

  return (
    <Card className={status === 'done' ? 'border-green-300 dark:border-green-800' : isActive ? 'bg-accent/20' : ''}>
      <CardContent className="pt-4">
        <div className="flex gap-3 items-start">
          {thumbnail ? (
            <img src={thumbnail} alt="" className="w-24 h-16 object-cover rounded shrink-0" />
          ) : (
            <div className="w-24 h-16 bg-muted rounded shrink-0 flex items-center justify-center text-xs text-muted-foreground">{entry ? entry.index : ''}</div>
          )}

          <div className="flex-1 min-w-0 space-y-1">
            <p className={`font-medium text-sm truncate ${status === 'failed' ? 'text-destructive' : ''}`}>{title}</p>
            {author && <p className="text-xs text-muted-foreground">{author}</p>}

            {isActive && progress ? (
              <div className="space-y-1 pt-0.5">
                <Progress value={progress.percent} className="h-1.5" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{progress.percent.toFixed(1)}%</span>
                  <span>{progress.speed} · ETA {progress.eta}</span>
                </div>
              </div>
            ) : status === 'done' ? (
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">✅ Done</span>
                {filepath && (
                  <button onClick={() => onOpenFile?.(filepath)} className="text-xs text-muted-foreground hover:text-foreground">📂 Show in Finder</button>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {duration != null ? formatDuration(duration) : ''}
                {views != null && ` · ${views.toLocaleString()} views`}
              </p>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="shrink-0 min-w-[6.5rem] flex flex-col items-end justify-between">
            {entry && (entry.status === 'pending' || entry.status === 'failed') && onDownloadEntry && (
              <Button size="sm" onClick={() => onDownloadEntry(entry.index)} className="mb-2">{entry.status === 'failed' ? '↺ Retry' : '⬇ Download'}</Button>
            )}
            {isActive && progress && (
              <span className="text-xs text-muted-foreground tabular-nums">{progress.percent.toFixed(0)}%</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
