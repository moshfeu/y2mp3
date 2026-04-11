import { exec, execSync } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import os from 'os'
import type { VideoInfo, DownloadOptions, DownloadProgress, PlaylistEntry, PlaylistInfo } from '@/types/shared'

const execAsync = promisify(exec)

const CACHE_DIR = path.join(os.homedir(), '.youtube-audio-downloader-cache')
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000

// Electron doesn't inherit the shell PATH on macOS; extend it manually
const EXTRA_PATHS = [
  '/opt/homebrew/bin',
  '/usr/local/bin',
  `${os.homedir()}/.pyenv/shims`,
  `${os.homedir()}/.local/bin`,
]
const ENV_PATH = [...EXTRA_PATHS, process.env.PATH || ''].join(':')
const EXEC_ENV = { ...process.env, PATH: ENV_PATH }

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function getVideoId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return crypto.createHash('md5').update(url).digest('hex')
}

function getCachedInfo(videoId: string): VideoInfo | null {
  ensureCacheDir()
  const cachePath = path.join(CACHE_DIR, `${videoId}.json`)
  if (!fs.existsSync(cachePath)) return null
  try {
    const data = JSON.parse(fs.readFileSync(cachePath, 'utf8'))
    if (Date.now() - data.timestamp > CACHE_EXPIRY_MS) {
      fs.unlinkSync(cachePath)
      return null
    }
    return data.info as VideoInfo
  } catch {
    return null
  }
}

function saveCachedInfo(videoId: string, info: VideoInfo) {
  ensureCacheDir()
  const cachePath = path.join(CACHE_DIR, `${videoId}.json`)
  try {
    fs.writeFileSync(cachePath, JSON.stringify({ timestamp: Date.now(), info }, null, 2))
  } catch {
    // non-fatal
  }
}

export async function checkDependencies(): Promise<{ ytdlp: boolean; ffmpeg: boolean }> {
  let ytdlp = false
  let ffmpeg = false
  try { execSync('yt-dlp --version', { stdio: 'ignore', env: EXEC_ENV }); ytdlp = true } catch { /* not found */ }
  try { execSync('ffmpeg -version', { stdio: 'ignore', env: EXEC_ENV }); ffmpeg = true } catch { /* not found */ }
  console.log('[deps] yt-dlp:', ytdlp, '| ffmpeg:', ffmpeg, '| PATH:', ENV_PATH)
  return { ytdlp, ffmpeg }
}

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const videoId = getVideoId(url)
  const cached = getCachedInfo(videoId)
  if (cached) {
    console.log('[getVideoInfo] cache hit for', videoId)
    return cached
  }

  console.log('[getVideoInfo] running yt-dlp --print for', url)
  const { stdout } = await execAsync(
    `yt-dlp --no-playlist` +
    ` --print "%(id)s"` +
    ` --print "%(title)s"` +
    ` --print "%(uploader,channel)s"` +
    ` --print "%(duration)s"` +
    ` --print "%(view_count)s"` +
    ` --print "%(thumbnail)s"` +
    ` "${url}"`,
    { env: EXEC_ENV }
  )

  const [id, title, author, duration, views, thumbnail] = stdout.trim().split('\n')

  const info: VideoInfo = {
    id: id || '',
    title: title || '',
    author: author || 'Unknown',
    duration: Math.floor(parseFloat(duration) || 0),
    views: parseInt(views, 10) || 0,
    thumbnail: thumbnail || '',
  }

  console.log('[getVideoInfo] got info:', info.title)
  saveCachedInfo(videoId, info)
  return info
}

export function isPlaylistUrl(url: string): boolean {
  return url.includes('list=') || url.includes('youtube.com/playlist')
}

export async function getPlaylistInfo(url: string): Promise<PlaylistInfo> {
  console.log('[getPlaylistInfo] running yt-dlp --dump-single-json for', url)

  // Use dump-single-json to get a single well-formed JSON object (playlist with entries)
  const command = `yt-dlp --dump-single-json --no-warnings "${url}"`
  const { stdout } = await execAsync(command, { env: EXEC_ENV })

  const raw = stdout || ''
  // First, try to parse the whole stdout as JSON (single object)
  try {
    const parsed = JSON.parse(raw)
    const playlistTitle = parsed.title || parsed.playlist || parsed.display_id || 'Playlist'
    const playlistCount = parsed.n_entries || parsed.count || (Array.isArray(parsed.entries) ? parsed.entries.length : 0)
    const entries: PlaylistEntry[] = []
    const entriesArray = Array.isArray(parsed.entries) ? parsed.entries : []
    for (let i = 0; i < entriesArray.length; i++) {
      const e = entriesArray[i]
      const id = e.id || (typeof e.webpage_url === 'string' ? (() => { try { return new URL(e.webpage_url).searchParams.get('v') } catch { return undefined } })() : undefined) || ''
      const thumb = e.thumbnail || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined)
      entries.push({
        id: String(id),
        title: String(e.title || ''),
        index: i + 1,
        status: 'pending',
        thumbnail: thumb,
        duration: typeof e.duration === 'number' ? e.duration : (parseInt(e.duration, 10) || undefined),
        author: e.uploader || e.uploader_id || undefined,
        views: typeof e.view_count === 'number' ? e.view_count : (parseInt(e.view_count || e.views, 10) || undefined),
      })
    }
    return { title: playlistTitle, count: playlistCount || entries.length, entries }
  } catch (err) {
    // Not a single JSON object — maybe stdout is JSON-lines (one JSON per line) or legacy print output
    const lines = raw.trim().split(/\r?\n/).filter(l => l.trim().length > 0)

    // If lines look like JSON objects per line, parse each
    if (lines.length > 0 && lines[0].trim().startsWith('{')) {
      const entries: PlaylistEntry[] = []
      let playlistTitle = 'Playlist'
      let playlistCount = 0
      for (let i = 0; i < lines.length; i++) {
        try {
          const obj = JSON.parse(lines[i])
          if (i === 0) {
            playlistTitle = obj.title || obj.playlist || playlistTitle
            playlistCount = Number(obj.count) || playlistCount
          }
          const id = obj.id
          const thumb = obj.thumbnail || obj.thumb || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined)
          entries.push({
            id: String(id),
            title: String(obj.title || ''),
            index: i + 1,
            status: 'pending',
            thumbnail: thumb,
            duration: typeof obj.duration === 'number' ? obj.duration : (parseInt(obj.duration, 10) || undefined),
            author: obj.uploader || obj.author || undefined,
            views: typeof obj.views === 'number' ? obj.views : (parseInt(obj.views, 10) || undefined),
          })
        } catch (e) {
          // ignore malformed lines
        }
      }
      return { title: playlistTitle, count: playlistCount || entries.length, entries }
    }

    // Fallback: try to parse legacy chunked plaintext (fields per line)
    const chunkSize = 8
    const entries: PlaylistEntry[] = []
    let playlistTitle = 'Playlist'
    let playlistCount = 0
    for (let i = 0; i < lines.length; i += chunkSize) {
      const [pTitle, pCount, id, title, thumbnail, durationStr, uploader, viewsStr] = lines.slice(i, i + chunkSize)
      if (i === 0) {
        playlistTitle = pTitle || 'Playlist'
        playlistCount = parseInt(pCount, 10) || Math.floor(lines.length / chunkSize)
      }
      if (id && title) {
        const thumb = thumbnail && thumbnail !== 'NA' ? thumbnail : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        entries.push({
          id,
          title,
          index: Math.floor(i / chunkSize) + 1,
          status: 'pending',
          thumbnail: thumb,
          duration: parseInt(durationStr, 10) || undefined,
          author: uploader || undefined,
          views: parseInt(viewsStr, 10) || undefined,
        })
      }
    }
    return { title: playlistTitle, count: playlistCount || entries.length, entries }
  }
}

let currentDownloadChild: ReturnType<typeof exec> | null = null

export function abortDownload(): void {
  if (currentDownloadChild) {
    currentDownloadChild.kill('SIGTERM')
  }
}

export async function downloadAudio(
  url: string,
  options: DownloadOptions,
  onProgress: (progress: DownloadProgress) => void,
  onItemStart?: (index: number, total: number, title: string) => void,
  onItemDone?: (index: number, filepath: string, filename: string, filesize: number) => void,
  onItemError?: (index: number, title: string, error: string) => void,
): Promise<{ filepath: string; filename: string; filesize: number; isPlaylist?: boolean }> {
  const baseDir = options.outputPath || path.join(os.homedir(), 'Downloads')
  const playlist = options.isPlaylist ?? isPlaylistUrl(url)

  // Create output directory (with optional playlist subfolder)
  let outputDir = baseDir
  if (playlist && options.subfolderName) {
    const sanitized = options.subfolderName.replace(/[/\\?%*:|"<>]/g, '_').trim()
    outputDir = path.join(baseDir, sanitized)
  }
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })
  const qualityMap: Record<string, string> = { best: '0', '320': '320K', '256': '256K', '192': '192K' }
  const audioQuality = qualityMap[options.quality] || '0'

  let cmd: string
  if (playlist) {
    const outputTemplate = path.join(outputDir, '%(playlist_index)s_%(title)s.%(ext)s')
    cmd = `yt-dlp --yes-playlist -x --audio-format ${options.format} --no-continue`
    if (options.format !== 'wav') cmd += ` --audio-quality ${audioQuality}`
    cmd += ` -o "${outputTemplate}" "${url}"`
  } else {
    let videoInfo: VideoInfo | null = null
    try { videoInfo = await getVideoInfo(url) } catch { /* proceed without info */ }
    const rawName = options.filename || videoInfo?.title || 'audio'
    const sanitized = rawName.replace(/[^a-z0-9\-_. ]/gi, '_').replace(/\s+/g, '_').substring(0, 100)
    const outputTemplate = path.join(outputDir, `${sanitized}.%(ext)s`)
    cmd = `yt-dlp --no-playlist -x --audio-format ${options.format} --no-continue`
    if (options.format !== 'wav') cmd += ` --audio-quality ${audioQuality}`
    cmd += ` -o "${outputTemplate}" "${url}"`
  }

  console.log('[downloadAudio] cmd:', cmd)

  return new Promise((resolve, reject) => {
    const child = exec(cmd, { env: EXEC_ENV })
    currentDownloadChild = child
    const progressRegex = /\[download\]\s+([\d.]+)%\s+of\s+([\S]+)\s+at\s+([\S]+)\s+ETA\s+(\S+)/
    const itemRegex = /\[download\] Downloading item (\d+) of (\d+)/
    const destRegex = /\[download\] Destination: (.+)/
    const alreadyRegex = /\[download\] (.+) has already been downloaded/
    const errorRegex = /^ERROR: (.+)/m

    let currentIndex = 0
    let totalItems = 1
    let currentFilepath = ''
    let currentFilename = ''
    let currentTitle = ''
    let lastFilepath = '' // final converted filepath for single video

    const handleData = (data: string) => {
      process.stdout.write('[yt-dlp] ' + data)

      // Playlist item start
      const itemMatch = data.match(itemRegex)
      if (itemMatch) {
        currentIndex = parseInt(itemMatch[1], 10)
        totalItems = parseInt(itemMatch[2], 10)
        currentFilepath = ''
        currentFilename = ''
        currentTitle = ''
        onItemStart?.(currentIndex, totalItems, '')
        return
      }

      // Playlist item error (yt-dlp continues to next item in playlist mode)
      const errorMatch = data.match(errorRegex)
      if (errorMatch && playlist && currentIndex > 0) {
        onItemError?.(currentIndex, currentTitle || '', errorMatch[1].trim())
        return
      }

      // Download destination
      const destMatch = data.match(destRegex)
      if (destMatch) {
        currentFilepath = destMatch[1].trim()
        currentFilename = path.basename(currentFilepath)
        lastFilepath = currentFilepath
        return
      }

      // Already downloaded
      const alreadyMatch = data.match(alreadyRegex)
      if (alreadyMatch) {
        currentFilepath = alreadyMatch[1].trim()
        currentFilename = path.basename(currentFilepath)
        lastFilepath = currentFilepath
        if (playlist && currentIndex > 0) {
          const filesize = fs.existsSync(currentFilepath) ? fs.statSync(currentFilepath).size : 0
          onItemDone?.(currentIndex, currentFilepath, currentFilename, filesize)
        }
        return
      }

      // ExtractAudio destination (final converted file)
      if (data.includes('[ExtractAudio]') && data.includes('Destination:')) {
        const m = data.match(/Destination: (.+)/)
        if (m) {
          currentFilepath = m[1].trim()
          currentFilename = path.basename(currentFilepath)
          lastFilepath = currentFilepath
          if (playlist && currentIndex > 0) {
            const filesize = fs.existsSync(currentFilepath) ? fs.statSync(currentFilepath).size : 0
            onItemDone?.(currentIndex, currentFilepath, currentFilename, filesize)
          }
        }
        return
      }

      // Progress
      const progressMatch = data.match(progressRegex)
      if (progressMatch) {
        onProgress({
          percent: parseFloat(progressMatch[1]),
          totalSize: progressMatch[2],
          speed: progressMatch[3],
          eta: progressMatch[4],
          filename: currentFilename,
          playlistIndex: playlist ? currentIndex : undefined,
          playlistCount: playlist ? totalItems : undefined,
          currentTitle,
        })
      }
    }

    child.stdout?.on('data', handleData)
    child.stderr?.on('data', handleData)

    child.on('close', (code) => {
      currentDownloadChild = null
      console.log('[downloadAudio] yt-dlp exited with code', code)
      if (code === null) {
        reject(new Error('Download cancelled'))
        return
      }
      if (code !== 0) {
        reject(new Error(`yt-dlp exited with code ${code}`))
        return
      }

      if (playlist) {
        resolve({ filepath: outputDir, filename: '', filesize: 0, isPlaylist: true })
      } else {
        const filepath = lastFilepath || path.join(outputDir, currentFilename)
        let filesize = 0
        if (filepath && fs.existsSync(filepath)) filesize = fs.statSync(filepath).size
        resolve({ filepath, filename: path.basename(filepath), filesize })
      }
    })

    child.on('error', reject)
  })
}
