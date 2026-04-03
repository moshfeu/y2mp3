import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DownloadItem } from '@/types/index'

interface DownloadHistoryProps {
  history: DownloadItem[]
  onClear: () => void
  onRefresh: () => void
}

export function DownloadHistory({ history, onClear, onRefresh }: DownloadHistoryProps) {
  const [search, setSearch] = useState('')

  const filtered = history.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.author.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString()
  const formatSize = (bytes: number) => bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '–'

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search downloads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" onClick={onRefresh} size="sm">Refresh</Button>
        {history.length > 0 && (
          <Button variant="destructive" onClick={onClear} size="sm">Clear All</Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {history.length === 0 ? 'No downloads yet' : 'No results found'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => (
            <Card key={item.id}>
              <CardContent className="pt-4 pb-3">
                <div className="flex gap-3 items-start">
                  {item.thumbnail && (
                    <img src={item.thumbnail} alt="" className="w-16 h-11 object-cover rounded flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.author} · {formatDate(item.timestamp)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={item.status === 'completed' ? 'default' : 'destructive'}>
                        {item.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">{item.filename}</span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{formatSize(item.filesize)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.electronAPI.openFile(item.filepath)}
                    className="flex-shrink-0"
                    title="Show in Finder"
                  >
                    📂
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
