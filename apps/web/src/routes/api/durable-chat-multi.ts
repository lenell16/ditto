import { createFileRoute } from '@tanstack/react-router'
import { createUIMessageStreamResponse } from 'ai'
import type { UIMessage } from 'ai'
import { start } from 'workflow/api'

import { multiTurnChatWorkflow } from '@/workflows/durable-chat-multi'

export const Route = createFileRoute('/api/durable-chat-multi')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages }: { messages: Array<UIMessage> } =
          await request.json()

        const run = await start(multiTurnChatWorkflow, [messages])

        return createUIMessageStreamResponse({
          stream: run.readable,
          headers: { 'x-workflow-run-id': run.runId },
        })
      },
    },
  },
})
