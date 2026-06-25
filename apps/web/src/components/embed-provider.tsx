import { useRouter } from '@tanstack/react-router'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import {
  acquireEmbedBridge,
  subscribeEmbedBridgeStatus,
} from '@/lib/embed/bridge-host'
import { isEmbedded } from '@/lib/embed/detect'
import type { EmbedAuthStatus } from '@/lib/embed/status'

interface EmbedContextValue {
  embedded: boolean
  status: EmbedAuthStatus
}

const EmbedContext = createContext<EmbedContextValue>({
  embedded: false,
  status: 'idle',
})

export function useEmbed() {
  return useContext(EmbedContext)
}

function EmbedStatusBadge({ status }: { status: EmbedAuthStatus }) {
  return (
    <div
      className="fixed right-2 bottom-2 z-50 rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
      aria-live="polite"
    >
      embedded · auth: {status}
    </div>
  )
}

export function EmbedProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [embedded, setEmbedded] = useState(false)
  const [status, setStatus] = useState<EmbedAuthStatus>('idle')

  useEffect(() => {
    setEmbedded(isEmbedded())
  }, [])

  useEffect(() => {
    if (!embedded) return

    const unsubscribeStatus = subscribeEmbedBridgeStatus(setStatus)
    const releaseBridge = acquireEmbedBridge(router)

    return () => {
      releaseBridge()
      unsubscribeStatus()
    }
  }, [embedded, router])

  const value = useMemo(() => ({ embedded, status }), [embedded, status])

  return (
    <EmbedContext.Provider value={value}>
      {children}
      {embedded ? <EmbedStatusBadge status={status} /> : null}
    </EmbedContext.Provider>
  )
}
