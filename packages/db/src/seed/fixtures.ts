import { EMBEDDING_DIMENSIONS } from '../constants'

export function fixtureVector(seed: number): Array<number> {
  const values: Array<number> = []
  for (let i = 0; i < EMBEDDING_DIMENSIONS; i++) {
    const x = Math.sin(seed * 1000 + i * 0.01)
    values.push(x)
  }
  const magnitude = Math.sqrt(values.reduce((sum, v) => sum + v * v, 0))
  return values.map((v) => v / magnitude)
}

export const MEMORY_FIXTURES = [
  { content: 'First memory fixture', embedding: fixtureVector(1) },
  { content: 'Second memory fixture', embedding: fixtureVector(2) },
  { content: 'Third memory fixture', embedding: fixtureVector(3) },
] as const
