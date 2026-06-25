'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { MessageSquare } from 'lucide-react'
import { useState } from 'react'

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

export function ChatPage() {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isGenerating = status === 'submitted' || status === 'streaming'

  const handleSubmit = (message: PromptInputMessage) => {
    if (message.text.trim()) {
      void sendMessage({ text: message.text })
      setInput('')
    }
  }

  return (
    <div className="mx-auto flex size-full max-w-4xl flex-col p-6">
      <div className="mb-4">
        <h1 className="text-lg font-medium">Chat</h1>
        <p className="text-sm text-muted-foreground">
          Streaming chat powered by the Vercel AI SDK
        </p>
      </div>

      <div className="flex min-h-[600px] flex-1 flex-col rounded-lg border">
        <Conversation className="flex-1">
          <ConversationContent className="p-4">
            {messages.length === 0 ? (
              <ConversationEmptyState
                icon={<MessageSquare className="size-12" />}
                title="Start a conversation"
                description="Type a message below to begin chatting"
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
