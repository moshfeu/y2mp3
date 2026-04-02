import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import type { DownloadOptions, DownloadProgress, VideoInfo, AppSettings } from '@/types/index'

interface DownloadFormProps {
  settings: AppSettings
  onDownloadComplete: () => void
}

type LogEntry = { level: 'info' | 'error' | 'success'; msg: string }

export function DownloadForm({ settings, onDownloadComplete }: DownloadFormProps) {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState(settings.defaultFormat)
  const [quality, setQuality] = useState(settings.defaultQuality)
  const [filename, setFilename] = useState('')
  const [outputPath, setOutputPath] = useState(settings.defaultOutputPath)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingInfo, setIsFetchingInfo] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'downloading' | 'done'>('idle')
  const [logs, setLogs] = useState<LogEntry[]>([])

  const addLog = (level: LogEntry['level'], msg: string) => {
    console.log(`[${level}] ${msg}`)
    setLogs(prev => [...prev, { level, msg }])
  }

  const isValidUrl = (u: string) => u.includes('youtube.com/') || u.includes('youtu.be/')

  const handleUrlBlur = async () => {
    if (!url || !isValidUrl(url)) return
    setIsFetchingInfo(true)
    setError(null)
    setVideoInfo(null)
    addLog('info', 'Fetching video info...')
    try {
      const result = await window.electronAPI.getVideoInfo(url)
      if (result.success && result.info) {
        setVideoInfo(result.info)
        addLog('success', `Found: "${result.info.title}" by ${result.info.author}`)
      } else {
        const msg = result.error || 'Could not fetch video info'
        addLog('error', `Video info failed: ${msg}`)
        setError(msg)
      }
    } catch (e: any) {
      const msg = e?.message || String(e)
      addLog('error', `Video info error: ${msg}`)
      setError(msg)
    } finally {
      setIsFetchingInfo(false)
    }
  }

  const handleSelectFolder = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setOutputPath(folder)
  }

  const handleDownload = async () => {
    if (!url) { setError('Please enter a YouTube URL'); return }
    if (!isValidUrl(url)) { setError('Please enter a valid YouTube URL'); return }

    setIsLoading(true)
    setError(null)
    setStatus('downloading')
    setProgress(null)
    setLogs([])

    const options: DownloadOptions = {
      url,
      format,
      quality,
      outputPath,
      filename: filename || undefined,
    }

    addLog('info', `Starting download: ${url}`)
    addLog('info', `Format: ${format.toUpperCase()} | Quality: ${quality === 'best' ? 'Best' : quality + ' kbps'}`)
    addLog('info', `Save to: ${outputPath}`)

    const removeListener = window.electronAPI.onProgress((p) => {
      setProgress(p)
    })

    try {
      addLog('info', 'Running yt-dlp...')
      const result = await window.electronAPI.downloadAudio(options)
      if (result.success) {
        addLog('success', `✅ Saved: ${(result as any).filename}`)
        setStatus('done')
        onDownloadComplete()
        setTimeout(() => {
          setStatus('idle')
          setUrl('')
          setFilename('')
          setVideoInfo(null)
          setProgress(null)
          setLogs([])
        }, 5000)
      } else {
        const msg = result.error || 'Download failed'
        addLog('error', msg)
        setError(msg)
        setStatus('idle')
      }
    } catch (e: any) {
      const msg = e?.message || String(e)
      addLog('error', msg)
      setError(msg)
      setStatus('idle')
    } finally {
      removeListener()
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">YouTube URL</Label>
        <Input
          id="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={e => { setUrl(e.target.value); setVideoInfo(null); setError(null); setLogs([]) }}
          onBlur={handleUrlBlur}
          disabled={isLoading}
        />
      </div>

      {isFetchingInfo && <p className="text-sm text-muted-foreground animate-pulse">🔍 Fetching video info...</p>}
      {videoInfo && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              {videoInfo.thumbnail && (
                <img src={videoInfo.thumbnail} alt="" className="w-24 h-16 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{videoInfo.title}</p>
                <p className="text-xs text-muted-foreground">{videoInfo.author}</p>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(videoInfo.duration / 60)}:{String(videoInfo.duration % 60).padStart(2, '0')}
                  {videoInfo.views > 0 && ` · ${videoInfo.views.toLocaleString()} views`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="format">Format</Label>
          <Select id="format" value={format} onChange={e => setFormat(e.target.value as any)} disabled={isLoading}>
            <option value="mp3">MP3</option>
            <option value="m4a">M4A</option>
            <option value="wav">WAV</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quality">Quality</Label>
          <Select id="quality" value={quality} onChange={e => setQuality(e.target.value as any)} disabled={isLoading}>
            <option value="best">Best</option>
            <option value="320">320 kbps</option>
            <option value="256">256 kbps</option>
            <option value="192">192 kbps</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="filename">Filename (optional)</Label>
        <Input
          id="filename"
          placeholder="Leave blank to use video title"
          value={filename}
          onChange={e => setFilename(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label>Save location</Label>
        <div className="flex gap-2">
          <Input value={outputPath} readOnly className="flex-1 text-xs" />
          <Button variant="outline" onClick={handleSelectFolder} disabled={isLoading}>Browse</Button>
        </div>
      </div>

      {/* Activity log */}
      {logs.length > 0 && (
        <div className="rounded-md border bg-muted/50 p-3 space-y-1 font-mono text-xs">
          {logs.map((l, i) => (
            <div key={i} className={
              l.level === 'error' ? 'text-destructive' :
              l.level === 'success' ? 'text-green-600 dark:text-green-400' :
              'text-muted-foreground'
            }>
              {l.level === 'error' ? '✗' : l.level === 'success' ? '✓' : '›'} {l.msg}
            </div>
          ))}
        </div>
      )}

      {status === 'downloading' && progress && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress.percent.toFixed(1)}%</span>
            <span>{progress.speed} · ETA {progress.eta}</span>
          </div>
          <Progress value={progress.percent} />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {status === 'done' && (
        <Alert>
          <AlertDescription>✅ Download complete!</AlertDescription>
        </Alert>
      )}

      <Button className="w-full" onClick={handleDownload} disabled={isLoading || !url}>
        {isLoading
          ? `Downloading... ${progress ? `${progress.percent.toFixed(0)}%` : ''}`
          : '⬇️ Download Audio'}
      </Button>
    </div>
  )
}
