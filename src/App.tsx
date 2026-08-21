import { useMemo, useState } from 'react'

import { AnimatedBackground } from '@/components/AnimatedBackground'

import { getOrCreateProfile } from '@/lib/identity'
import { CodeLobby } from '@/screens/CodeLobby'
import { LandingScreen, type Mode } from '@/screens/LandingScreen'
import { NearbyLobby } from '@/screens/NearbyLobby'
import { PingCanvas } from '@/screens/PingCanvas'

type Screen = 'landing' | 'code' | 'nearby' | 'canvas'

function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [nickname, setNickname] = useState('')
  const [channelName, setChannelName] = useState('')

  const profile = useMemo(() => getOrCreateProfile(), [])

  const enterSession = (channel: string) => {
    setChannelName(channel)
    setScreen('canvas')
  }

  const leaveSession = () => {
    setChannelName('')
    setScreen('landing')
  }

  let content
  if (screen === 'canvas') {
    content = (
      <PingCanvas
        channelName={channelName}
        nickname={nickname}
        avatar={profile.avatar}
        onLeave={leaveSession}
      />
    )
  } else if (screen === 'code') {
    content = <CodeLobby onJoin={enterSession} onBack={() => setScreen('landing')} />
  } else if (screen === 'nearby') {
    content = <NearbyLobby onJoin={enterSession} onBack={() => setScreen('landing')} />
  } else {
    content = (
      <LandingScreen
        nickname={nickname}
        onNicknameChange={setNickname}
        onContinue={(mode: Mode) => setScreen(mode === 'code' ? 'code' : 'nearby')}
      />
    )
  }

  return (
    <div className="relative min-h-svh">
      <AnimatedBackground />
      <div className="relative z-10">{content}</div>
    </div>
  )
}

export default App
