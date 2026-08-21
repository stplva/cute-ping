import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { codeChannelName } from '@/lib/channel-name'
import { formatCode, generateCode, isValidCode, normalizeCode } from '@/lib/code'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

export function CodeLobby({
  onJoin,
  onBack,
}: {
  onJoin: (channelName: string) => void
  onBack: () => void
}) {
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [code, setCode] = useState(() => generateCode())
  const [input, setInput] = useState('')
  const { copied, copy } = useCopyToClipboard()

  const normalized = normalizeCode(input)
  const canJoin = tab === 'join' && isValidCode(normalized)

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Session code</CardTitle>
          <CardDescription>
            Share a code with your friend, or enter theirs to join.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tab} onValueChange={(value) => setTab(value as 'create' | 'join')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="join">Join</TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === 'create' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono tracking-widest">{formatCode(code)}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-transparent bg-white/60 shadow-sm backdrop-blur-xl hover:bg-white/80"
                  onClick={() => setCode(generateCode())}
                >
                  New code
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-transparent bg-white/60 shadow-sm backdrop-blur-xl hover:bg-white/80"
                  onClick={() => void copy(code)}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <Button className="w-full" onClick={() => onJoin(codeChannelName(code))}>
                Start
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a code"
                className="font-mono uppercase tracking-widest text-center"
              />
              <Button className="w-full" disabled={!canJoin} onClick={() => onJoin(codeChannelName(normalized))}>
                Join
              </Button>
              {input && !canJoin && (
                <p className="text-center text-xs text-muted-foreground">
                  Codes are 8 letters/numbers.
                </p>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <Badge variant="secondary">Anyone with the code can join</Badge>
          </div>

          <Button variant="ghost" className="w-full" onClick={onBack}>
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
