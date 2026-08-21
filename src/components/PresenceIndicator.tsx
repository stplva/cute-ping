import { Badge } from '@/components/ui/badge'

import type { PresenceMeta, RealtimeStatus } from '@/lib/channel'

const STATUS_LABELS: Record<RealtimeStatus, string> = {
  connecting: 'connecting…',
  connected: 'connected',
  reconnecting: 'reconnecting…',
}

const STATUS_DOT: Record<RealtimeStatus, string> = {
  connecting: 'bg-muted-foreground',
  connected: 'bg-green-500',
  reconnecting: 'bg-amber-500',
}

export function PresenceIndicator({
  status,
  others,
}: {
  status: RealtimeStatus
  others: PresenceMeta[]
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[status]}`} aria-hidden="true" />
        <span className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</span>
        {status === 'connected' && (
          <Badge variant="secondary">
            {others.length === 0 ? 'no one here yet' : `${others.length} here`}
          </Badge>
        )}
      </div>
      {others.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {others.map((peer) => (
            <Badge key={peer.id} variant="outline" className="gap-1">
              <span aria-hidden="true">{peer.avatar || '🐱'}</span>
              {peer.nickname || 'anon'}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
