import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AppSettings } from '@/types/index'

interface SettingsPanelProps {
  settings: AppSettings
  onSave: (settings: AppSettings) => void
}

export function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [local, setLocal] = useState<AppSettings>(settings)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await onSave(local)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleBrowse = async () => {
    const folder = await window.electronAPI.selectFolder()
    if (folder) setLocal(s => ({ ...s, defaultOutputPath: folder }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Download Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Default save location</Label>
            <div className="flex gap-2">
              <Input value={local.defaultOutputPath} readOnly className="flex-1 text-xs" />
              <Button variant="outline" onClick={handleBrowse}>Browse</Button>
            </div>
          </div>
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

      <Button onClick={handleSave} className="w-full">
        {saved ? '✅ Saved!' : 'Save Settings'}
      </Button>
    </div>
  )
}
