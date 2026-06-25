import { useCallback, useEffect, useState } from 'react'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'

import { WEB_APP_ORIGIN, WEB_APP_URL } from '@/lib/config'
import {
  installEmbedHost,
  STORAGE_TOKEN_KEY,
  STORAGE_USER_KEY,
} from '@/lib/embed-host'

interface StoredUser {
  email: string
  name?: string | null
}

type View = 'loading' | 'sign-in' | 'embedded'

export default function App() {
  const [view, setView] = useState<View>('loading')
  const [user, setUser] = useState<StoredUser | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [embedStatus, setEmbedStatus] = useState<'connecting' | 'connected'>(
    'connecting'
  )

  const loadStoredAuth = useCallback(async () => {
    const stored = await chrome.storage.local.get([
      STORAGE_TOKEN_KEY,
      STORAGE_USER_KEY,
    ])
    const token = stored[STORAGE_TOKEN_KEY] as string | undefined
    const storedUser = stored[STORAGE_USER_KEY] as StoredUser | undefined
    if (token) {
      setUser(storedUser ?? null)
      setView('embedded')
      setEmbedStatus('connecting')
    } else {
      setUser(null)
      setView('sign-in')
    }
  }, [])

  useEffect(() => {
    void loadStoredAuth()
  }, [loadStoredAuth])

  const handleAuthRequired = useCallback(() => {
    setEmbedStatus('connecting')
    void chrome.storage.local.remove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY])
    setUser(null)
    setView('sign-in')
  }, [])

  const attachEmbedHost = useCallback(
    (iframe: HTMLIFrameElement | null) => {
      if (!iframe) return

      return installEmbedHost(iframe, WEB_APP_ORIGIN, {
        onReady: () => setEmbedStatus('connected'),
        onAuthRequired: handleAuthRequired,
      })
    },
    [handleAuthRequired]
  )

  async function signIn() {
    setError(null)
    setPending(true)
    try {
      const response = await fetch(`${WEB_APP_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          message?: string
          code?: string
        } | null
        setError(
          body?.message ?? body?.code ?? `Sign in failed (${response.status}).`
        )
        return
      }

      const token = response.headers.get('set-auth-token')
      if (!token) {
        setError('No bearer token returned from sign-in.')
        return
      }

      const body = (await response.json()) as {
        user?: { email?: string; name?: string | null }
      }
      const nextUser: StoredUser = {
        email: body.user?.email ?? email,
        name: body.user?.name,
      }

      await chrome.storage.local.set({
        [STORAGE_TOKEN_KEY]: token,
        [STORAGE_USER_KEY]: nextUser,
      })
      setUser(nextUser)
      setEmbedStatus('connecting')
      setView('embedded')
    } catch {
      setError('Could not reach the web app. Is it running?')
    } finally {
      setPending(false)
    }
  }

  async function signOut() {
    setPending(true)
    try {
      const stored = await chrome.storage.local.get(STORAGE_TOKEN_KEY)
      const token = stored[STORAGE_TOKEN_KEY] as string | undefined
      if (token) {
        await fetch(`${WEB_APP_URL}/api/auth/sign-out`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch {
      // still clear local state
    }
    await chrome.storage.local.remove([STORAGE_TOKEN_KEY, STORAGE_USER_KEY])
    setUser(null)
    setView('sign-in')
    setPending(false)
  }

  if (view === 'loading') {
    return (
      <div className="flex h-[600px] w-[760px] items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (view === 'sign-in') {
    return (
      <div className="flex h-[600px] w-[760px] items-center justify-center p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void signIn()
          }}
          className="flex w-full max-w-sm flex-col gap-4 rounded-xl border p-6"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-medium">Sign in to Memoria</h1>
            <p className="text-sm text-muted-foreground">
              Connect the extension popup to your account.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex h-[600px] w-[760px] flex-col">
      <header className="flex items-center justify-between gap-3 border-b px-3 py-2 text-sm">
        <div className="min-w-0">
          <p className="truncate font-medium">{user?.email ?? 'Signed in'}</p>
          <p className="text-xs text-muted-foreground">
            embed: {embedStatus === 'connected' ? 'connected' : 'connecting…'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => void signOut()}
        >
          Sign out
        </Button>
      </header>
      <iframe
        ref={attachEmbedHost}
        title="Memoria"
        src={`${WEB_APP_URL}/?embed=1`}
        className="min-h-0 flex-1 border-0"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  )
}
