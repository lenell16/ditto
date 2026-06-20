import type { UIMessageChunk } from 'ai'

export async function writeUserMessageMarker(
  writable: WritableStream<UIMessageChunk>,
  content: string,
  messageId: string
) {
  'use step'

  const writer = writable.getWriter()
  try {
    await writer.write({
      type: 'data-workflow',
      data: {
        type: 'user-message',
        id: messageId,
        content,
        timestamp: Date.now(),
      },
    } as UIMessageChunk)
  } finally {
    writer.releaseLock()
  }
}

export async function writeStreamClose(
  writable: WritableStream<UIMessageChunk>
) {
  'use step'

  const writer = writable.getWriter()
  try {
    await writer.write({ type: 'finish' })
    await writer.close()
  } finally {
    writer.releaseLock()
  }
}
