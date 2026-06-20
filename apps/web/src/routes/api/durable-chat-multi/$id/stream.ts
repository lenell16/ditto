import { createFileRoute } from '@tanstack/react-router'
import { createUIMessageStreamResponse } from 'ai'
import { getRun } from 'workflow/api'

export const Route = createFileRoute('/api/durable-chat-multi/$id/stream')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { searchParams } = new URL(request.url)
        const startIndex = searchParams.get('startIndex')

        const run = getRun(params.id)
        const stream = run.getReadable({
          startIndex: startIndex ? parseInt(startIndex, 10) : undefined,
        })

        return createUIMessageStreamResponse({ stream })
      },
    },
  },
})
