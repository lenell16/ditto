import { createFileRoute } from '@tanstack/react-router'

import { chatMessageHook } from '@/workflows/durable-chat-multi/hooks/chat-message'

export const Route = createFileRoute('/api/durable-chat-multi/$id')({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const { message }: { message: string } = await request.json()

        await chatMessageHook.resume(params.id, { message })

        return Response.json({ success: true })
      },
    },
  },
})
