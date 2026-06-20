import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { DurableChatMultiPage } from '@/components/durable-chat-multi-page'

const durableChatMultiSearchSchema = z.object({
  session: z.string().optional(),
})

export const Route = createFileRoute('/durable-chat-multi')({
  validateSearch: durableChatMultiSearchSchema,
  component: DurableChatMultiPage,
})
