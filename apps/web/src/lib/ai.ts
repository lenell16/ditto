import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { gateway } from 'ai'
import type { LanguageModel } from 'ai'

export type AiProvider = 'gateway' | 'anthropic' | 'openai'

const DEFAULT_MODELS: Record<AiProvider, string> = {
  gateway: 'anthropic/claude-sonnet-4.6',
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4.1',
}

function getProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER
  if (
    provider === 'anthropic' ||
    provider === 'openai' ||
    provider === 'gateway'
  ) {
    return provider
  }
  return 'gateway'
}

function isConfigured(provider: AiProvider): boolean {
  switch (provider) {
    case 'gateway':
      return Boolean(process.env.AI_GATEWAY_API_KEY)
    case 'anthropic':
      return Boolean(process.env.ANTHROPIC_API_KEY)
    case 'openai':
      return Boolean(process.env.OPENAI_API_KEY)
  }
}

export function getAiStatus() {
  const provider = getProvider()
  const model = process.env.AI_MODEL ?? DEFAULT_MODELS[provider]

  return {
    provider,
    model,
    configured: isConfigured(provider),
  }
}

export function resolveChatModel(): LanguageModel {
  const provider = getProvider()
  const modelId = process.env.AI_MODEL ?? DEFAULT_MODELS[provider]

  switch (provider) {
    case 'anthropic':
      return anthropic(modelId)
    case 'openai':
      return openai(modelId)
    default:
      return gateway(modelId)
  }
}
