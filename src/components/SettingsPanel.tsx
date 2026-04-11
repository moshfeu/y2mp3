import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSettingsStore } from '@/store/settings'

export function SettingsPanel() {
  const { settings, save } = useSettingsStore()
  const [local, setLocal] = useState(settings)
  const [saved, setSaved] = useState(false)

  // Keep local in sync if settings load after mount
  React.useEffect(() => { setLocal(settings) }, [settings])

  const handleSave = async () => {
    await save(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleBrowse = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setLocal(s => ({ ...s, defaultOutputPath: folder }))
  }

  const playlistPreview = local.playlistSubfolder
    ? `${local.defaultOutputPath || '~/Downloads'}/[playlist name]/`
    : local.defaultOutputPath || '~/Downloads'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Output</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Save location</Label>
            <div className="flex gap-2">
              <Input value={local.defaultOutputPath} readOnly className="flex-1 text-xs" />
              <Button variant="outline" onClick={handleBrowse}>Browse</Button>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="playlistSubfolder"
              checked={local.playlistSubfolder}
              onChange={e => setLocal(s => ({ ...s, playlistSubfolder: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-input accent-foreground cursor-pointer"
            />
            <div className="space-y-1">
              <Label htmlFor="playlistSubfolder" className="cursor-pointer">
                Save playlists in a subfolder
              </Label>
              <p className="text-xs text-muted-foreground">{playlistPreview}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Download Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default format</Label>
              <Select
                value={local.defaultFormat}
                onChange={e => setLocal(s => ({ ...s, defaultFormat: e.target.value as any }))}
              >
                <option value="mp3">MP3</option>
                <option value="m4a">M4A</option>
                <option value="wav">WAV</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default quality</Label>
              <Select
                value={local.defaultQuality}
                onChange={e => setLocal(s => ({ ...s, defaultQuality: e.target.value as any }))}
              >
                <option value="best">Best</option>
                <option value="320">320 kbps</option>
                <option value="256">256 kbps</option>
                <option value="192">192 kbps</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={local.theme}
              onChange={e => setLocal(s => ({ ...s, theme: e.target.value as any }))}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="notifyOnDownload"
              checked={!!local.notifyOnDownload}
              onChange={e => setLocal(s => ({ ...s, notifyOnDownload: e.target.checked }))}
              className="mt-0.5 h-4 w-4 rounded border-input accent-foreground cursor-pointer"
            />
            <div className="space-y-1">
              <Label htmlFor="notifyOnDownload" className="cursor-pointer">Notify on download</Label>
              <p className="text-xs text-muted-foreground">Show an OS notification when a clip finishes downloading</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        {saved ? '✅ Saved!' : 'Save Settings'}
      </Button>
    </div>
  )
}
