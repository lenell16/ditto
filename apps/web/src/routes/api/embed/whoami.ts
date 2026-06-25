import { createFileRoute } from '@tanstack/react-router'
import { getRequestHeaders } from '@tanstack/react-start/server'

import { auth } from '@/lib/auth'

export const Route = createFileRoute('/api/embed/whoami')({
  server: {
    handlers: {
      GET: async () => {
        const session = await auth.api.getSession({
          headers: getRequestHeaders(),
        })
        return Response.json({
          authenticated: Boolean(session),
          user: session?.user ?? null,
        })
      },
    },
  },
})
