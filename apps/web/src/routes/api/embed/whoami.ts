import { createFileRoute } from '@tanstack/react-router'

import { auth } from '@/lib/auth'
import { getEmbedWhoamiPayload } from '@/lib/embed/whoami'

export const Route = createFileRoute('/api/embed/whoami')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const payload = await getEmbedWhoamiPayload(auth, request.headers)
        return Response.json(payload)
      },
    },
  },
})
