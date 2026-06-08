import { createFileRoute } from '@tanstack/react-router'
import { convertToModelMessages, streamText } from 'ai'
import type { UIMessage } from 'ai'

import { resolveChatModel } from '@/lib/ai'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: Array<UIMessage> } =
          await request.json()

        const result = streamText({
          model: resolveChatModel(),
          messages: await convertToModelMessages(messages),
        })

        return result.toUIMessageStreamResponse()
      },
    },
  },
})
