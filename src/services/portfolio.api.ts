import type { ApiLocale, ApiPortfolio } from '@/types/api'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1').replace(
  /\/+$/,
  '',
)

const TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 15000)

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function get<T>(path: string): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new ApiError(`${path} responded ${response.status}`, response.status)
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(`Request timed out after ${TIMEOUT_MS}ms`)
    }
    throw new ApiError(error instanceof Error ? error.message : `${path} failed`)
  } finally {
    clearTimeout(timer)
  }
}

export function fetchPortfolio(slug: string, lang?: string): Promise<ApiPortfolio> {
  const path = `/portfolio/${encodeURIComponent(slug)}`
  return get<ApiPortfolio>(lang ? `${path}?lang=${encodeURIComponent(lang)}` : path)
}

export function fetchLanguages(slug: string): Promise<ApiLocale[]> {
  return get<ApiLocale[]>(`/portfolio/${encodeURIComponent(slug)}/languages`)
}
