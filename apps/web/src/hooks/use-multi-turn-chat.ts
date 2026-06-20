'use client'

import { useChat } from '@ai-sdk/react'
import { WorkflowChatTransport } from '@workflow/ai'
import type { UIMessage } from 'ai'
import { useCallback, useEffect, useMemo, useRef } from 'react'

interface UserMessageData {
  type: 'user-message'
  id: string
  content: string
  timestamp: number
}

interface UseMultiTurnChatOptions {
  sessionId: string | undefined
  onSessionIdChange: (sessionId: string | undefined) => void
}

export function useMultiTurnChat({
  sessionId,
  onSessionIdChange,
}: UseMultiTurnChatOptions) {
  const resumeOnMount = useRef(Boolean(sessionId)).current
  const sessionIdRef = useRef(sessionId)
  const pendingRunIdRef = useRef<string | undefined>(undefined)

  sessionIdRef.current = sessionId ?? pendingRunIdRef.current

  const transport = useMemo(
    () =>
      new WorkflowChatTransport({
        api: '/api/durable-chat-multi',
        onChatSendMessage: (response) => {
          const workflowRunId = response.headers.get('x-workflow-run-id')
          if (workflowRunId) {
            pendingRunIdRef.current = workflowRunId
            onSessionIdChange(workflowRunId)
          }
        },
        onChatEnd: () => {
          pendingRunIdRef.current = undefined
          onSessionIdChange(undefined)
        },
        prepareReconnectToStreamRequest: ({ api: _api, ...rest }) => {
          const activeSessionId = sessionIdRef.current
          if (!activeSessionId) throw new Error('No active session')
          return {
            ...rest,
            api: `/api/durable-chat-multi/${activeSessionId}/stream`,
          }
        },
      }),
    [onSessionIdChange]
  )

  const {
    messages: rawMessages,
    sendMessage: baseSendMessage,
    status,
    stop,
    setMessages,
  } = useChat({ resume: resumeOnMount, transport })

  const prevSessionIdRef = useRef(sessionId)

  useEffect(() => {
    const prev = prevSessionIdRef.current
    if (prev === sessionId) return

    prevSessionIdRef.current = sessionId

    if (sessionId === undefined) {
      pendingRunIdRef.current = undefined
      stop()
      setMessages([])
    }
  }, [sessionId, setMessages, stop])

  const runId = sessionId ?? pendingRunIdRef.current

  const messages = useMemo(() => {
    const result: Array<UIMessage> = []
    const seenContent = new Set<string>()

    for (const msg of rawMessages) {
      if (msg.role === 'user') {
        const text = msg.parts
          .filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('')
        if (text) seenContent.add(text)
      }
    }

    for (const msg of rawMessages) {
      if (msg.role === 'user') {
        result.push(msg)
        continue
      }

      if (msg.role === 'assistant') {
        let currentParts: typeof msg.parts = []
        let partIndex = 0

        for (const part of msg.parts) {
          if (part.type === 'data-workflow' && 'data' in part) {
            const rawData = part.data
            if (
              typeof rawData === 'object' &&
              rawData !== null &&
              'type' in rawData &&
              rawData.type === 'user-message'
            ) {
              const data = rawData as UserMessageData
              if (currentParts.length > 0) {
                result.push({
                  ...msg,
                  id: `${msg.id}-${partIndex++}`,
                  parts: currentParts,
                })
                currentParts = []
              }
              if (!seenContent.has(data.content)) {
                seenContent.add(data.content)
                result.push({
                  id: data.id,
                  role: 'user',
                  parts: [{ type: 'text', text: data.content }],
                })
              }
              continue
            }
          }
          currentParts.push(part)
        }

        if (currentParts.length > 0) {
          result.push({
            ...msg,
            id: partIndex > 0 ? `${msg.id}-${partIndex}` : msg.id,
            parts: currentParts,
          })
        }
      }
    }

    return result
  }, [rawMessages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (runId) {
        await fetch(`/api/durable-chat-multi/${runId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })
      } else {
        await baseSendMessage({ text, metadata: { createdAt: Date.now() } })
      }
    },
    [runId, baseSendMessage]
  )

  const endSession = useCallback(async () => {
    if (runId) {
      await fetch(`/api/durable-chat-multi/${runId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '/done' }),
      })
    }
    pendingRunIdRef.current = undefined
    onSessionIdChange(undefined)
    setMessages([])
  }, [runId, onSessionIdChange, setMessages])

  return {
    messages,
    status,
    runId,
    sendMessage,
    endSession,
    stop,
  }
}
