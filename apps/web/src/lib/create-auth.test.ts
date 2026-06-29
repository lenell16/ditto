import { afterEach, beforeEach, describe, expect, it } from 'vite-plus/test'

import { createIsolatedAuthTestContext } from '@/test/auth'
import { getEmbedWhoamiPayload } from './embed/whoami'

const authContext = createIsolatedAuthTestContext()

describe('auth boundary', () => {
  beforeEach(async () => {
    await authContext.setup()
  })

  afterEach(async () => {
    await authContext.cleanup()
  })

  it('creates authenticated headers that resolve to the saved user session', async () => {
    const { auth, helpers } = await authContext.createAuth()
    const user = helpers.createUser({
      email: 'auth-boundary@example.com',
      name: 'Auth Boundary',
    })

    await helpers.saveUser(user)

    const headers = await helpers.getAuthHeaders({ userId: user.id })
    const session = await auth.api.getSession({ headers })

    expect(headers.get('cookie')).toContain('session_token')
    expect(session?.user).toMatchObject({
      email: user.email,
      id: user.id,
      name: user.name,
    })
  })

  it('resolves sessions from bearer authorization headers', async () => {
    const { auth, helpers } = await authContext.createAuth()
    const user = helpers.createUser({
      email: 'embed-bearer@example.com',
      name: 'Embed Bearer',
    })

    await helpers.saveUser(user)

    const { token } = await helpers.login({ userId: user.id })
    const session = await auth.api.getSession({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    })

    expect(token).toEqual(expect.any(String))
    expect(session?.user).toMatchObject({
      email: user.email,
      id: user.id,
      name: user.name,
    })
  })

  it('builds embed whoami payloads for anonymous and bearer-authenticated requests', async () => {
    const { auth, helpers } = await authContext.createAuth()
    const user = helpers.createUser({
      email: 'embed-whoami@example.com',
      name: 'Embed Whoami',
    })

    await helpers.saveUser(user)

    const anonymousPayload = await getEmbedWhoamiPayload(auth, new Headers())
    const { token } = await helpers.login({ userId: user.id })
    const authenticatedPayload = await getEmbedWhoamiPayload(
      auth,
      new Headers({
        authorization: `Bearer ${token}`,
      })
    )

    expect(anonymousPayload).toEqual({
      authenticated: false,
      user: null,
    })
    expect(authenticatedPayload.authenticated).toBe(true)
    expect(authenticatedPayload.user).toMatchObject({
      email: user.email,
      id: user.id,
      name: user.name,
    })
  })
})
