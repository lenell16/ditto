'use client'

import { Link } from '@tanstack/react-router'
import { MessageSquare } from 'lucide-react'
import { useCallback, useState } from 'react'

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'
import { useMultiTurnChat } from '@/hooks/use-multi-turn-chat'
import { Route } from '@/routes/durable-chat-multi'
import { Button } from '@workspace/ui/components/button'

function DurableChatMultiSession({
  sessionId,
}: {
  sessionId: string | undefined
}) {
  const navigate = Route.useNavigate()
  const [input, setInput] = useState('')

  const onSessionIdChange = useCallback(
    (nextSessionId: string | undefined) => {
      void navigate({
        search: nextSessionId ? { session: nextSessionId } : {},
        replace: true,
      })
    },
    [navigate]
  )

  const { messages, sendMessage, status, runId, endSession, stop } =
    useMultiTurnChat({
      sessionId,
      onSessionIdChange,
    })

  const isGenerating = status === 'submitted' || status === 'streaming'

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      void sendMessage(message.text)
      setInput('')
    }
  }

  return (
    <div className="mx-auto flex size-full max-w-4xl flex-col p-6">
      <div className="mb-4">
        <h1 className="text-lg font-medium">Multi-Turn Durable Chat</h1>
        <p className="text-sm text-muted-foreground">
          One workflow per conversation. The active session lives in the URL (
          <code className="text-xs">?session=</code>) so refresh and share
          reconnect to the same durable stream.
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Link to="/durable-chat-multi" search={{}}>
            <Button type="button" variant="outline" size="sm">
              New conversation
            </Button>
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!runId}
            onClick={() => void endSession()}
          >
            End session
          </Button>
        </div>
      </div>

      <div className="flex min-h-[600px] flex-1 flex-col rounded-lg border">
        <Conversation className="flex-1">
          <ConversationContent className="p-4">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="Start a conversation"
                description="Type a message below to begin a multi-turn durable session"
              />
            ) : (
              messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <MessageResponse key={`${message.id}-${i}`}>
                              {part.text}
                            </MessageResponse>
                          )
                        default:
                          return null
                      }
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t bg-muted/20 px-4 py-3">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              value={input}
              placeholder="Say something..."
              onChange={(e) => setInput(e.currentTarget.value)}
              className="max-h-32 min-h-10 py-2"
            />
            <PromptInputFooter className="justify-end pt-1">
              <PromptInputSubmit
                status={status}
                onStop={stop}
                disabled={!isGenerating && !input.trim()}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}

export function DurableChatMultiPage() {
  const { session } = Route.useSearch()

  return <DurableChatMultiSession sessionId={session} />
}
