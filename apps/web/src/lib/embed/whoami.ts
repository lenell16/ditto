import type { createAuth } from '@/lib/create-auth'

type AuthSession = Awaited<
  ReturnType<ReturnType<typeof createAuth>['api']['getSession']>
>
type AuthUser = NonNullable<AuthSession>['user']

interface EmbedWhoamiAuth {
  api: {
    getSession(input: { headers: Headers }): Promise<AuthSession>
  }
}

export interface EmbedWhoamiPayload {
  authenticated: boolean
  user: AuthUser | null
}

export async function getEmbedWhoamiPayload(
  auth: EmbedWhoamiAuth,
  headers: Headers
): Promise<EmbedWhoamiPayload> {
  const session = await auth.api.getSession({ headers })

  return {
    authenticated: Boolean(session),
    user: session?.user ?? null,
  }
}
