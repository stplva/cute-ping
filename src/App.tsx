import { useMemo, useState } from 'react'

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

  if (screen === 'canvas') {
    return (
      <PingCanvas
        channelName={channelName}
        nickname={nickname}
        avatar={profile.avatar}
        onLeave={leaveSession}
      />
    )
  }

  if (screen === 'code') {
    return <CodeLobby onJoin={enterSession} onBack={() => setScreen('landing')} />
  }

  if (screen === 'nearby') {
    return <NearbyLobby onJoin={enterSession} onBack={() => setScreen('landing')} />
  }

  return (
    <LandingScreen
      nickname={nickname}
      onNicknameChange={setNickname}
      onContinue={(mode: Mode) => setScreen(mode === 'code' ? 'code' : 'nearby')}
    />
  )
}

export default App
