import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

import { cellForCoords, RADIUS_LABELS, type RadiusOption } from '@/lib/geohash'
import { geoChannelName } from '@/lib/channel-name'

interface Coords {
  lat: number
  lng: number
}

export function NearbyLobby({
  onJoin,
  onBack,
}: {
  onJoin: (channelName: string) => void
  onBack: () => void
}) {
  const [radius, setRadius] = useState<RadiusOption>('near')
  const [coords, setCoords] = useState<Coords | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported in this browser.')
      return
    }
    setRequesting(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setRequesting(false)
      },
      () => {
        setError('Location access was denied. Nearby mode needs your location.')
        setRequesting(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  const cell = coords ? cellForCoords(coords.lat, coords.lng, radius) : null

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Nearby</CardTitle>
          <CardDescription>Connect with everyone close to you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!coords ? (
            <div className="space-y-3">
              <Button className="w-full" onClick={requestLocation} disabled={requesting}>
                {requesting ? 'Locating…' : 'Use my location'}
              </Button>
              {error && <p className="text-center text-sm text-destructive">{error}</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Radius</span>
                  <Badge variant="secondary">{RADIUS_LABELS[radius]}</Badge>
                </div>
                <Slider
                  value={[radius === 'near' ? 0 : 1]}
                  min={0}
                  max={1}
                  step={1}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value
                    setRadius(next === 0 ? 'near' : 'far')
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Approximate — matches people within roughly this distance.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Your area</span>
                <Badge variant="outline" className="font-mono">
                  {cell}
                </Badge>
              </div>
              <Button className="w-full" onClick={() => cell && onJoin(geoChannelName(cell))}>
                Join nearby
              </Button>
            </div>
          )}

          <Button variant="ghost" className="w-full" onClick={onBack}>
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
