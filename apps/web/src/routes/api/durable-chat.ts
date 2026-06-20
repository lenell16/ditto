import { createFileRoute } from '@tanstack/react-router'
import { createUIMessageStreamResponse } from 'ai'
import type { UIMessage } from 'ai'
import { start } from 'workflow/api'

import { durableChatWorkflow } from '@/workflows/durable-chat'

export const Route = createFileRoute('/api/durable-chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: Array<UIMessage> } =
          await request.json()

        const run = await start(durableChatWorkflow, [messages])

        return createUIMessageStreamResponse({
          stream: run.readable,
          headers: { 'x-workflow-run-id': run.runId },
        })
      },
    },
  },
})
