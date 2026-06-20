import { DurableAgent } from '@workflow/ai/agent'
import { convertToModelMessages } from 'ai'
import type { ModelMessage, UIMessage, UIMessageChunk } from 'ai'
import { getWritable, getWorkflowMetadata } from 'workflow'

import { resolveChatModelId } from '@/lib/ai'

import { chatMessageHook } from './hooks/chat-message'
import { mergeStreamResult } from './steps/merge-messages'
import { writeStreamClose, writeUserMessageMarker } from './steps/writer'

export async function multiTurnChatWorkflow(initialMessages: Array<UIMessage>) {
  'use workflow'

  const { workflowRunId: runId } = getWorkflowMetadata()
  const writable = getWritable<UIMessageChunk>()
  let messages: Array<ModelMessage> =
    await convertToModelMessages(initialMessages)

  for (const msg of initialMessages) {
    if (msg.role === 'user') {
      const text = msg.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('')
      if (text) {
        await writeUserMessageMarker(writable, text, msg.id)
      }
    }
  }

  const agent = new DurableAgent({
    model: resolveChatModelId(),
    system: 'You are a helpful assistant.',
  })

  const hook = chatMessageHook.create({ token: runId })
  let turnNumber = 0

  let sessionActive = true
  while (sessionActive) {
    turnNumber++

    const result = await agent.stream({
      messages,
      writable,
      preventClose: true,
      sendStart: turnNumber === 1,
      sendFinish: false,
    })

    messages = mergeStreamResult(messages, result.messages)

    const { message: followUp } = await hook
    if (followUp === '/done') {
      sessionActive = false
    } else {
      await writeUserMessageMarker(
        writable,
        followUp,
        `user-${runId}-${turnNumber + 1}`
      )
      messages.push({ role: 'user', content: followUp })
    }
  }

  await writeStreamClose(writable)
  return { messages }
}
