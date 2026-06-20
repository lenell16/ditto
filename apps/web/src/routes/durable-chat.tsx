import { createFileRoute } from '@tanstack/react-router'

import { DurableChatPage } from '@/components/durable-chat-page'

export const Route = createFileRoute('/durable-chat')({
  component: DurableChatPage,
})
