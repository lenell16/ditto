import { DurableAgent } from '@workflow/ai/agent'
import { getWritable } from 'workflow'
import { convertToModelMessages } from 'ai'
import type { UIMessage, UIMessageChunk } from 'ai'

import { resolveChatModelId } from '@/lib/ai'

export async function durableChatWorkflow(messages: Array<UIMessage>) {
  'use workflow'

  const agent = new DurableAgent({
    model: resolveChatModelId(),
    system: 'You are a helpful assistant.',
  })

  await agent.stream({
    messages: await convertToModelMessages(messages),
    writable: getWritable<UIMessageChunk>(),
  })
}
