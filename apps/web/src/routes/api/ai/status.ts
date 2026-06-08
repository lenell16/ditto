import { createFileRoute } from '@tanstack/react-router'

import { getAiStatus } from '@/lib/ai'

export const Route = createFileRoute('/api/ai/status')({
  server: {
    handlers: {
      GET: () => Response.json(getAiStatus()),
    },
  },
})
