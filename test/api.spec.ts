import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.unmock('@/services/portfolio.api')

const { ApiError, fetchLanguages, fetchPortfolio } = await import('@/services/portfolio.api')

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ lang: 'en' }),
    } as Response),
  )
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const SLUG = 'ada-lovelace'

describe('portfolio api', () => {
  it('asks for the address in the path, and the default locale', async () => {
    await fetchPortfolio(SLUG)

    expect(fetchMock.mock.calls[0][0]).toMatch(new RegExp(`/portfolio/${SLUG}$`))
  })

  it('encodes the requested locale', async () => {
    await fetchPortfolio(SLUG, 'pt-BR')

    expect(fetchMock.mock.calls[0][0]).toMatch(new RegExp(`/portfolio/${SLUG}\\?lang=pt-BR$`))
  })

  it('fetches the language list from its own route', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ code: 'en' }]),
    } as Response)

    await expect(fetchLanguages(SLUG)).resolves.toEqual([{ code: 'en' }])
    expect(fetchMock.mock.calls[0][0]).toMatch(new RegExp(`/portfolio/${SLUG}/languages$`))
  })

  it('carries the status on a failed response', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 } as Response)

    await expect(fetchPortfolio(SLUG, 'zz')).rejects.toMatchObject({ status: 404 })
  })

  it('reports a network failure as an ApiError', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(fetchPortfolio(SLUG)).rejects.toBeInstanceOf(ApiError)
  })

  it('reports a timeout as an ApiError, without naming the route', async () => {
    fetchMock.mockRejectedValue(new DOMException('aborted', 'AbortError'))

    await expect(fetchPortfolio(SLUG)).rejects.toThrow(/timed out/)
  })

  it('asks for JSON explicitly', async () => {
    await fetchPortfolio(SLUG)

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>).Accept).toBe('application/json')
  })
})
