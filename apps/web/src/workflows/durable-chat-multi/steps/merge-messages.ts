import type { ModelMessage } from 'ai'

/**
 * Merge DurableAgent stream output into local history.
 *
 * Local `messages` omits system (passed via `agent.system`). `result.messages`
 * prepends that system entry, so a naive slice(messages.length) duplicates
 * the last user turn. Strip one leading system, then append only new tail items.
 */
export function mergeStreamResult(
  local: Array<ModelMessage>,
  result: Array<ModelMessage>
): Array<ModelMessage> {
  const conversation = result[0]?.role === 'system' ? result.slice(1) : result
  return [...local, ...conversation.slice(local.length)]
}
