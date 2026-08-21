import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type Mode = 'code' | 'nearby'

export function LandingScreen({
  nickname,
  onNicknameChange,
  onContinue,
}: {
  nickname: string
  onNicknameChange: (value: string) => void
  onContinue: (mode: Mode) => void
}) {
  const [mode, setMode] = useState<Mode>('code')

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">cute-ping 🎀</CardTitle>
          <CardDescription>Ping your friends with cute emojis, in real time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="nickname" className="text-sm font-medium">
              Nickname (optional)
            </label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              placeholder="your nickname"
              maxLength={24}
            />
          </div>
          <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">🔗 Code</TabsTrigger>
              <TabsTrigger value="nearby">📍 Nearby</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button className="w-full" onClick={() => onContinue(mode)}>
            Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
