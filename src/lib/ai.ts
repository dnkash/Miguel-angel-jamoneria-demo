import { createOpenAI } from '@ai-sdk/openai'

export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    'X-Title': 'Miguel Angel Jamoneria',
  },
})

// Modelo :free rápido y con buena respuesta en español.
// Alternativas verificadas: nvidia/nemotron-3-ultra-550b-a55b:free (más lento).
export const FREE_MODEL = process.env.OPENROUTER_MODEL ?? 'baidu/ernie-5.5-flash-preview:free'